'use strict';
// Network flow lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Teaching models, deliberately simplified (the page states each simplification):
// fixed 40-byte headers, one-way delay = RTT/2, window counted in whole packets, round-by-round
// (one RTT per round) congestion control in the style of TCP Reno without timeouts.
(function (root) {
  const HEADER = 40;            // bytes: 20 IPv4 + 20 TCP, no options
  const PKT = 1500;             // bytes per full packet on the wire (steps 3–6)
  const SIZES_KB = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  const MTUS = [576, 1000, 1500, 4000, 9000];

  // Step 0: cutting a message into packets.
  function packetize(sizeKB, mtu) {
    const bytes = sizeKB * 1024, payload = mtu - HEADER, n = Math.ceil(bytes / payload);
    const last = bytes - (n - 1) * payload, wire = bytes + n * HEADER;
    return { bytes, payload, n, last, wire, header: n * HEADER, overhead: n * HEADER / wire };
  }

  // Step 1: time from sending the request to receiving the last byte.
  // T = RTT (request out, first byte back) + size / bandwidth. Units: ms, KB, Mbit/s.
  function fetchTime(sizeKB, rttMs, mbps) {
    const tx = sizeKB * 1024 * 8 / (mbps * 1e6) * 1000;
    return { rtt: rttMs, tx, total: rttMs + tx, saveIfDoubled: tx / 2 };
  }
  const FILES = [{ id: 'page', kb: 50 }, { id: 'photo', kb: 5 * 1024 }, { id: 'video', kb: 500 * 1024 }];
  // bandwidth slider: index 0..30 → 1..1000 Mbit/s on a log scale (10 steps per decade)
  const bwOf = i => Math.round(Math.pow(10, i / 10) * 100) / 100;

  // Step 2: handshake then three data segments, stop-and-wait, one-way delay = 1 unit (= RTT/2).
  // RTO (retransmission timeout) is fixed at 2 RTT = 4 units here.
  const ISN_C = 4200, ISN_S = 9100, SEG = 1000, RTO = 4;
  function conversation(loseData2) {
    const msgs = [];
    const add = (from, t0, kind, fields, lost = false) => { msgs.push({ from, t0, t1: lost ? t0 + 0.5 : t0 + 1, kind, lost, ...fields }); return t0 + 1; };
    let t = 0;
    t = add('C', t, 'syn', { seq: ISN_C });
    t = add('S', t, 'synack', { seq: ISN_S, ack: ISN_C + 1 });
    t = add('C', t, 'ackdata', { seq: ISN_C + 1, ack: ISN_S + 1, len: SEG, k: 1 });
    t = add('S', t, 'ack', { ack: ISN_C + 1 + SEG });
    let sent = t;
    if (loseData2) { add('C', t, 'data', { seq: ISN_C + 1 + SEG, len: SEG, k: 2 }, true); sent = t + RTO; t = add('C', sent, 'data', { seq: ISN_C + 1 + SEG, len: SEG, k: 2, retx: true }); }
    else t = add('C', t, 'data', { seq: ISN_C + 1 + SEG, len: SEG, k: 2 });
    t = add('S', t, 'ack', { ack: ISN_C + 1 + 2 * SEG });
    t = add('C', t, 'data', { seq: ISN_C + 1 + 2 * SEG, len: SEG, k: 3 });
    t = add('S', t, 'ack', { ack: ISN_C + 1 + 3 * SEG });
    // connection states after each message is delivered
    const states = [{ c: 'closed', s: 'listen' }];
    msgs.forEach(m => {
      const prev = states[states.length - 1], st = { ...prev };
      if (m.kind === 'syn') { st.c = 'synsent'; st.s = 'synrcvd'; }
      if (m.kind === 'synack') st.c = 'estab';
      if (m.kind === 'ackdata') st.s = 'estab';
      states.push(st);
    });
    return { msgs, states, end: t, firstData: msgs.find(m => m.kind === 'ackdata').t0 };
  }

  // Step 3: window W packets, link C Mbit/s, RTT ms (from starting to send a packet to its ACK).
  // Sender may start packet i at max(end of packet i−1, start of packet i−W + RTT).
  function schedule(W, cMbps, rttMs, horizonMs) {
    const tau = PKT * 8 / (cMbps * 1e3); // ms per packet
    const starts = [];
    for (let i = 0; ; i++) {
      let s = i === 0 ? 0 : starts[i - 1] + tau;
      if (i >= W) s = Math.max(s, starts[i - W] + rttMs);
      if (s >= horizonMs) break;
      starts.push(s);
    }
    return { tau, starts };
  }
  function windowRate(W, cMbps, rttMs) {
    const bdp = cMbps * 1e3 * rttMs / (PKT * 8); // packets that fit "in the pipe"
    const rate = Math.min(cMbps, W * PKT * 8 / (rttMs * 1e3));
    return { bdp, rate, util: rate / cMbps };
  }

  // Step 4: a fixed window through a bottleneck with buffer B (packets), BDP packets on the path.
  function bottleneck(W, bdp, B, cMbps, rtt0) {
    const inPipe = Math.min(W, bdp), queue = Math.min(Math.max(W - bdp, 0), B), dropped = Math.max(W - bdp - B, 0);
    const rtt = rtt0 * (1 + queue / bdp);
    const rate = cMbps * Math.min(1, W / bdp);
    return { inPipe, queue, dropped, rtt, rate, loss: dropped / W };
  }

  // Step 5: one Reno-style flow, round by round. Loss in a round when cwnd > bdp + B.
  function aimd(bdp, B, rounds = 160, ssthresh0 = 64) {
    let cwnd = 1, ss = ssthresh0;
    const cap = bdp + B, out = [];
    for (let r = 0; r < rounds; r++) {
      const loss = cwnd > cap;
      const q = Math.min(Math.max(cwnd - bdp, 0), B);
      out.push({ r, cwnd, ss, loss, phase: cwnd < ss ? 'slow' : 'avoid', util: Math.min(1, cwnd / bdp), rttFactor: 1 + q / bdp });
      if (loss) { ss = Math.max(2, Math.floor(cwnd / 2)); cwnd = ss; }
      else if (cwnd < ss) cwnd = Math.min(cwnd * 2, ss);
      else cwnd += 1;
    }
    return out;
  }
  // Time-weighted utilisation and mean RTT factor over rounds [from, to).
  function aimdStats(tr, from = 0, to = tr.length) {
    let busy = 0, time = 0, losses = 0;
    for (let i = from; i < to; i++) { const s = tr[i]; time += s.rttFactor; busy += s.util * s.rttFactor; if (s.loss) losses++; }
    return { util: busy / time, rtt: time / (to - from), losses };
  }

  // Step 6: two flows sharing capacity K, synchronised losses (both react when x1 + x2 > K).
  // mode 'aimd': both halve; 'aiad': both subtract D.
  function twoFlows(K, x1, x2, mode, rounds = 200, D = 8) {
    const out = [];
    for (let r = 0; r < rounds; r++) {
      const loss = x1 + x2 > K;
      out.push({ r, x1, x2, loss });
      if (loss) { if (mode === 'aimd') { x1 /= 2; x2 /= 2; } else { x1 = Math.max(1, x1 - D); x2 = Math.max(1, x2 - D); } }
      else { x1 += 1; x2 += 1; }
    }
    return out;
  }

  const api = { HEADER, PKT, SIZES_KB, MTUS, packetize, fetchTime, FILES, bwOf, ISN_C, ISN_S, SEG, RTO, conversation, schedule, windowRate, bottleneck, aimd, aimdStats, twoFlows };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NET_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
