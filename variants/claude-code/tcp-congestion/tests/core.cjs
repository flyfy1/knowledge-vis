'use strict';
// Network transfer (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- step 0: packetisation on every slider position ----
for (const kb of M.SIZES_KB) for (const mtu of M.MTUS) {
  const p = M.packetize(kb, mtu);
  ok(p.n === Math.ceil(kb * 1024 / (mtu - 40)), 'n = ceil(bytes / (MTU − 40))');
  ok(p.last > 0 && p.last <= p.payload && (p.n - 1) * p.payload + p.last === p.bytes, 'last packet holds the remainder');
  ok(p.wire === p.bytes + 40 * p.n && p.header === 40 * p.n, 'wire bytes');
  // bigger MTU never raises the header share for the same file
  const i = M.MTUS.indexOf(mtu); if (i > 0) ok(p.overhead <= M.packetize(kb, M.MTUS[i - 1]).overhead + 1e-12, 'share falls with MTU');
}
{ const p = M.packetize(64, 1500); ok(p.n === 45 && p.last === 1296 && p.header === 1800 && p.overhead.toFixed(4) === '0.0267', 'default 64 KB / 1500'); }
// "double the file → packet count roughly doubles, share barely moves" for files ≥ 16 KB
for (let i = 4; i < M.SIZES_KB.length - 1; i++) for (const mtu of M.MTUS) { const a = M.packetize(M.SIZES_KB[i], mtu), b = M.packetize(M.SIZES_KB[i + 1], mtu); ok(Math.abs(b.n - 2 * a.n) <= 1, 'n doubles'); ok(Math.abs(b.overhead - a.overhead) < 0.004, 'share stable'); }

// ---- step 1: T = RTT + size / bandwidth ----
for (const f of M.FILES) for (let rtt = 5; rtt <= 300; rtt += 5) for (let i = 0; i <= 30; i++) {
  const bw = M.bwOf(i), r = M.fetchTime(f.kb, rtt, bw);
  near(r.total, rtt + f.kb * 8192 / (bw * 1000), 1e-9, 'T formula'); ok(r.total >= rtt, 'T ≥ RTT floor');
  near(r.saveIfDoubled, r.tx - M.fetchTime(f.kb, rtt, 2 * bw).tx, 1e-9, 'doubling saves tx/2');
}
ok(M.bwOf(0) === 1 && M.bwOf(10) === 10 && M.bwOf(20) === 100 && M.bwOf(30) === 1000, 'log bandwidth slider');
{ const r = M.fetchTime(50, 80, 100); near(r.tx, 4.096, 1e-9, 'page tx'); ok(r.rtt / r.total > 0.95, 'page at 100 Mbit/s: waiting > 95%'); }
{ const r = M.fetchTime(500 * 1024, 80, 100); ok(r.rtt / r.total < 0.002, 'video: RTT negligible'); }
ok(M.fetchTime(50, 80, 1000).total - 80 < 0.5, 'page at 1000 Mbit/s hugs the RTT floor');

// ---- step 2: handshake, ACK numbers, retransmission ----
const c0 = M.conversation(false), c1 = M.conversation(true);
ok(c0.msgs.length === 8 && c1.msgs.length === 9, 'message counts');
ok(c0.msgs[1].ack === M.ISN_C + 1 && c0.msgs[2].ack === M.ISN_S + 1, 'handshake acks x+1, y+1');
for (const cv of [c0, c1]) {
  let expect = M.ISN_C + 1;
  for (const m of cv.msgs) {
    if (m.from === 'C' && m.len) { ok(m.seq === expect || m.retx, 'segments are contiguous'); if (!m.lost) expect = m.seq + m.len; }
    if (m.kind === 'ack') ok(m.ack === expect, 'ack = next byte wanted');
  }
  ok(cv.states[3].c === 'estab' && cv.states[3].s === 'estab', 'both established after 3 messages');
  ok(cv.states[1].c === 'synsent' && cv.states[1].s === 'synrcvd' && cv.states[2].c === 'estab' && cv.states[2].s === 'synrcvd', 'state order');
}
ok(c0.end / 2 === 4 && c0.firstData / 2 === 1, 'no loss: done at 4 RTT, first data at 1 RTT');
ok(c1.end / 2 === 6 && (c1.end - c0.end) / 2 === M.RTO / 2, 'loss: done at 6 RTT, +RTO = 2 RTT');
ok(c1.msgs[4].lost && c1.msgs[5].retx && c1.msgs[5].t0 - c1.msgs[4].t0 === M.RTO, 'resend exactly one RTO after the lost send');
ok(Math.max(...c1.msgs.map(m => m.t1)) <= 12, 'diagram spans 6 RTT (12 half-RTT units)');

// ---- step 3: window throughput, schedule and BDP ----
for (let W = 1; W <= 100; W++) for (let rtt = 10; rtt <= 200; rtt += 10) for (const c of [1, 5, 10, 25, 50]) {
  const wr = M.windowRate(W, c, rtt);
  near(wr.bdp, c * 1000 * rtt / 12000, 1e-9, 'BDP');
  near(wr.rate, Math.min(c, W * 12 / rtt), 1e-9, 'rate = min(C, W·L/RTT)');
  ok((wr.util >= 1 - 1e-12) === (W >= wr.bdp - 1e-9), 'full exactly when W ≥ BDP');
  if (W % 9 === 1 && rtt % 50 === 10) { // the drawn schedule delivers the same long-run rate
    const sc = M.schedule(W, c, rtt, 40 * rtt), n = sc.starts.filter(s => s >= 20 * rtt && s < 40 * rtt).length;
    near(n * 12 / (20 * rtt), wr.rate, wr.rate * 0.02 + 12 / (20 * rtt), 'schedule rate');
  }
}
{ const wr = M.windowRate(10, 10, 60); ok(wr.bdp === 50 && wr.rate === 2 && wr.util === 0.2, 'default W=10: 2 Mbit/s, 20%'); near(M.schedule(10, 10, 60, 180).tau, 1.2, 1e-12, '1.2 ms per packet'); }

// ---- step 4: bottleneck (BDP 50, C 10, RTT0 60) ----
for (let B = 0; B <= 100; B += 5) for (let W = 1; W <= 200; W++) {
  const r = M.bottleneck(W, 50, B, 10, 60);
  ok(r.inPipe + r.queue + r.dropped === W, 'every packet accounted for');
  ok(W <= 50 ? r.queue === 0 && r.rtt === 60 && near0(r.rate - W / 5) : r.rate === 10, 'below BDP: rate grows, RTT flat; above: capped');
  ok((r.dropped > 0) === (W > 50 + B), 'loss starts past BDP + B');
  near(r.rtt, 60 * (1 + r.queue / 50), 1e-9, 'RTT grows with queue');
}
function near0(x) { return Math.abs(x) < 1e-9; }
ok(M.bottleneck(200, 50, 0, 10, 60).loss === 0.75 && M.bottleneck(200, 50, 100, 10, 60).rtt === 180, 'chart ranges (75%, 180 ms)');

// ---- step 5: AIMD sawtooth ----
for (let B = 0; B <= 100; B += 5) {
  const tr = M.aimd(50, B, 160);
  for (let r = 1; r < tr.length; r++) {
    const a = tr[r - 1], b = tr[r];
    if (a.loss) ok(b.cwnd === Math.max(2, Math.floor(a.cwnd / 2)) && b.ss === b.cwnd, 'halve on loss');
    else if (a.cwnd < a.ss) ok(b.cwnd === Math.min(2 * a.cwnd, a.ss), 'slow start doubles');
    else ok(b.cwnd === a.cwnd + 1, 'additive increase');
    ok(a.loss === (a.cwnd > 50 + B), 'loss iff cwnd > BDP + B');
  }
  const st = M.aimdStats(tr, 60, 160);
  if (B >= 50) ok(st.util === 1, 'B ≥ BDP: 100% use'); else ok(st.util < 1, 'B < BDP: idle time');
}
{ const tr = M.aimd(50, 0, 160), cw = tr.slice(60).map(s => s.cwnd), st = M.aimdStats(tr, 60, 160);
  ok(Math.min(...cw) === 25 && Math.max(...cw) === 51, 'B = 0: sawtooth 25–51 (hint)'); near(st.util, 0.767, 0.001, 'B = 0: about 77% use'); ok(st.rtt === 1, 'no queue'); }
{ const st = M.aimdStats(M.aimd(50, 50, 160), 60, 160); near(st.rtt, 1.519, 0.001, 'B = 50: RTT ×1.52'); }
ok(M.aimd(50, 0, 160).slice(0, 7).map(s => s.cwnd).join() === '1,2,4,8,16,32,64', 'slow start 1→64');

// ---- step 6: two flows ----
const A = M.twoFlows(100, 60, 4, 'aimd', 200), D = M.twoFlows(100, 60, 4, 'aiad', 200);
const gapsA = A.map((s, i) => (s.loss ? i : -1)).filter(i => i >= 0).map(i => Math.abs(A[i + 1].x1 - A[i + 1].x2));
ok(gapsA.length === 7, '7 losses in 200 rounds');
gapsA.forEach((g, i) => near(g, 56 / Math.pow(2, i + 1), 1e-9, 'AIMD halves the gap at each loss'));
const gapsD = D.map((s, i) => (s.loss ? i : -1)).filter(i => i >= 0 && i + 1 < D.length).map(i => Math.abs(D[i + 1].x1 - D[i + 1].x2));
ok(gapsD.length > 5 && gapsD.every(g => Math.abs(g - 56) < 1e-9), 'AIAD keeps the gap at 56');
A.forEach(s => ok(s.x1 + s.x2 <= 102 + 1e-9, 'total overshoots capacity by at most one round (2)'));

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['m_syn', 'm_synack', 'm_ack']); // protocol fields only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left (chart|panel|plot)|right (chart|panel|plot)/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const kind of ['syn', 'synack', 'ackdata', 'ack']) ok(STRINGS.zh['m_' + kind] && STRINGS.zh['d_' + kind], 'message keys ' + kind);
for (const st of ['closed', 'listen', 'synsent', 'synrcvd', 'estab']) ok(STRINGS.zh['st_' + st], 'state key ' + st);
for (const id of ['sz0', 'mtu0', 'f1page', 'f1photo', 'f1video', 'rtt1', 'bw1', 'next2', 'play2', 'lose2', 'reset2', 'w3', 'rtt3', 'c3s', 'w4', 'b4', 'b5', 'play5', 'reset5', 'aimd6', 'aiad6', 'play6', 'reset6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/systems/tcp-congestion/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS tcp-congestion core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
