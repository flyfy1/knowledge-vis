/* How a network card moves packets: the page's models.
   The Ethernet frame and its FCS (IEEE 802.3 CRC-32) and the packet-rate arithmetic of a link; descriptor prefetch as
   Little's law over PCIe read round trips (Neugebauer et al., SIGCOMM 2018, §6 latencies); the PCIe bytes one received
   packet costs (Neugebauer et al. §3, equations 1–3 and their simple-NIC transaction list); the Toeplitz RSS hash with
   Microsoft's key and test vectors and an indirection table; flows hashed onto queues (balls into bins); a per-byte +
   per-frame + per-skb cost model for segmentation and receive offloads (constants fitted to Cai et al., SIGCOMM 2021);
   TSO's cut of one large send into segments; a seeded simulation of DDIO's I/O ways as an LRU (leaky DMA; Farshin et
   al., ATC 2020); byte queue limits on the transmit ring (the idea of Linux lib/dynamic_queue_limits.c, simplified);
   per-packet costs of the kernel stack, XDP and DPDK (Høiland-Jørgensen et al., CoNEXT 2018); and ECMP hashing versus
   packet spraying over the paths of a training cluster's network.
   Real-world figures sit in SRC / FRONTIER with their source (also in BRIEF.md, with the date each was opened).
   Constants chosen for a model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.NicModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NicModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── sourced figures (BRIEF.md has URL and the date each was opened, 2026-11-15) ── */
  const SRC = {
    // IEEE 802.3 frame (public summary: Wikipedia "Ethernet frame"): preamble 7, SFD 1, addresses 6 + 6, 802.1Q tag 4,
    // EtherType 2, payload 46–1500 (42 with a tag), FCS 4 (CRC-32, polynomial 0x04C11DB7), minimum frame 64, gap 12
    eth: { pre: 7, sfd: 1, mac: 6, vlan: 4, type: 2, minPay: 46, maxPay: 1500, fcs: 4, minFrame: 64, ifg: 12, poly: 0x04C11DB7 },
    // Microsoft Learn, "Verifying the RSS Hash Calculation": key and IPv4 vectors (dst:port, src:port, IPv4 only, with TCP)
    ms: {
      key: [0x6d, 0x5a, 0x56, 0xda, 0x25, 0x5b, 0x0e, 0xc2, 0x41, 0x67, 0x25, 0x3d, 0x43, 0xa3, 0x8f, 0xb0, 0xd0, 0xca, 0x2b, 0xcb,
        0xae, 0x7b, 0x30, 0xb4, 0x77, 0xcb, 0x2d, 0xa3, 0x80, 0x30, 0xf2, 0x0c, 0x6a, 0x42, 0xb7, 0x3b, 0xbe, 0xac, 0x01, 0xfa],
      v4: [['161.142.100.80', 1766, '66.9.149.187', 2794, 0x323e8fc2, 0x51ccc178], ['65.69.140.83', 4739, '199.92.111.2', 14230, 0xd718262a, 0xc626b0ea],
        ['12.22.207.184', 38024, '24.19.198.95', 12898, 0xd2d0a5de, 0x5c2b394a], ['209.142.163.6', 2217, '38.27.205.30', 48228, 0x82989176, 0xafc7327f],
        ['202.188.127.2', 1303, '153.39.163.191', 44251, 0x5d1809c5, 0x10e828a2]],
      v6: [['3ffe:2501:200:3::1', 1766, '3ffe:2501:200:1fff::7', 2794, 0x2cc18cd5, 0x40207d3d], ['ff02::1', 4739, '3ffe:501:8::260:97ff:fe40:efab', 14230, 0x0f0c461c, 0xdde51bbf],
        ['fe80::200:f8ff:fe21:67cf', 38024, '3ffe:1900:4545:3:200:f8ff:fe21:67cf', 44251, 0x4b61e985, 0x02d1feef]],
      // RSS Configuration: the table is indexed by the low bits of the hash; "typically two to eight times the number of processors"
      tableLo: 2, tableHi: 8
    },
    // Linux Documentation/networking/scaling.rst: indirection table at least 4× the queues; rps_sock_flow_entries 65536
    scaling: { tableX: 4, rfs: 65536 },
    // Neugebauer et al., SIGCOMM 2018, §3: MWr and MRd cost 24 B on top of their data, CplD 20 B (2 framing + 6 DLL + 4
    // common + 12 or 8 type header); Gen3 x8 62.96 Gb/s at the physical layer, 57.88 left at the TLP layer; simple NIC RX:
    // 4 B tail write, 16 B descriptor read, packet write, 16 B write-back, 4 B interrupt write, 4 B head read; Niantic
    // fetches up to 40 descriptors and writes back up to 8. §6: 64 B DMA read 520 / 547 / 947 ns (min / median / max)
    // (the median as quoted in how-the-os-talks-to-hardware); DDIO 10 % of the LLC; +70 ns once dirty lines must be
    // flushed; remote socket +100 ns.
    neug: { mwr: 24, mrd: 24, cpl: 20, phy: 62.96, tlp: 57.88, rdMin: 520, rdMed: 547, rdMax: 947, fetch: 40, wb: 8, ddio: 10, flush: 70, remote: 100 },
    // how-pcie-works (B1) uses 2 % for DLLPs (Das Sharma); Gen5 32 GT/s, 128b/130b; Gen6 64 GT/s FLIT 236 of 256 bytes
    b1: { dll: 0.02, flitTlp: 236, flit: 256 },
    // Farshin et al., ATC 2020: Xeon Gold 6140, LLC 18 × 1.375 MiB, 11 ways; DDIO two ways by default (IIO LLC WAYS 0x600,
    // up to 0x7FF); 18 cores × 256 descriptors ≈ 6.5 MiB ≈ 26.6 % of the LLC; tuning DDIO cut latency up to ~30 % at 100 Gb/s,
    // DDIO raised tail latency ~30 % at 200 Gb/s; ConnectX-5
    farshin: { slices: 18, sliceMiB: 1.375, ways: 11, ddioWays: 2, maskDef: 0x600, maskMax: 0x7FF, cores: 18, desc: 256, footMiB: 6.5, footPct: 26.6, gain: 30, tail: 30 },
    // Cai et al., SIGCOMM 2021: ~42 Gb/s per core with TSO/GRO, jumbo frames and aRFS; up to 55 with LRO or tuning; data
    // copy ~49 % of receiver CPU with GRO + jumbo; DDIO miss rate 49 % for one flow; Xeon Gold 6128 at 3.4 GHz; GRO up to 64 KB
    cai: { gbps: 42, lro: 55, copy: 0.49, miss: 49, ghz: 3.4, gro: 65536 },
    // Høiland-Jørgensen et al., CoNEXT 2018 (Xeon E5-1650 v4, 3.6 GHz, ConnectX-5): drop, Mpps on one core: XDP 24, DPDK
    // 43.5, Linux raw 4.8, conntrack 1.8; PCI limit 115 Mpps; XDP pass-through program 4.5 Mpps; forwarding latency at
    // 100 pps: XDP 82 µs, DPDK 2 µs average
    xdp: { ghz: 3.6, xdp: 24, dpdk: 43.5, raw: 4.8, ct: 1.8, pci: 115, pass: 4.5, latX: 82, latD: 2 },
    // DRAM latency used by how-cpu-caches-work: "just over 70 ns" (Zen 5, Chips and Cheese 2024-08-14) to ~131 ns (Lunar Lake)
    dram: { lo: 70, hi: 131 },
    // NVIDIA ConnectX-7 user manual: up to 400 GbE, PCIe Gen5 through an x16 edge connector (32 lanes split in Socket
    // Direct), RDMA message rate 330–370 million per second
    cx7: { gbps: 400, gen: 5, lanes: 16, msgLo: 330, msgHi: 370 },
    // LWN 2011-08-09 (Corbet, "Network transmit queue limits"): 256-packet ring at 1 Gb/s with 1500-byte packets
    lwn: { ring: 256, gbps: 1, pkt: 1500 },
    // RoCE v2 rides UDP destination port 4791 (as on storage-over-a-network #ch6)
    roce: { port: 4791 }
  };
  const FRONTIER = {
    asOf: '2026-11',
    uec10: '2025-06-11',       // Linux Foundation press release, UEC Specification 1.0
    uec11: '2026-10-12',       // Network World 2026-10-14 (UEC 1.1); ultraethernet.org lists 1.1 as current, without a date
    dj: { closed: '2026-03-26', voters: 159, returned: 131, approve: 99, disapprove: 29, abstain: 3, comments: 487 }, // IEEE 802.3 WG e-mail 2026-03-28 (initial SA ballot; approval = approve / (approve + disapprove), abstentions excluded: 77 %)
    cx8: 800, cx9: 1600, cx9fw: '2026-02',   // NVIDIA SuperNIC page; ConnectX-9 firmware 82.48.1000 "February 2026 GA"
    thor: { date: '2025-10-14', gbps: 800 },  // Broadcom press release: Thor Ultra, sampling
    cpo: { blog: '2025-08-18', ports: 800, eff: 3.5 }   // NVIDIA technical blog: Quantum-X early 2026, Spectrum-X H2 2026
  };

  /* ── helpers ── */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hex = (v, n) => '0x' + (v >>> 0).toString(16).padStart(n || 8, '0');
  const hb = b => b.toString(16).padStart(2, '0');

  /* ── 02 the frame: bytes on the wire, FCS, packets per second ── */
  const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  // IEEE 802.3 CRC-32 (reflected form of 0x04C11DB7, init and final xor 0xFFFFFFFF); the FCS goes out least significant byte first
  function crc32(bytes) { let c = 0xFFFFFFFF; for (const b of bytes) c = CRC_T[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  const FRAME = { dst: [0x02, 0x1b, 0x21, 0x3a, 0x4f, 0x10], src: [0x02, 0xfd, 0xfe, 0x9e, 0x7a, 0x01], type: 0x0800, tci: 0x0064,
    sizes: [64, 128, 256, 512, 1024, 1518, 9018], speeds: [1, 10, 25, 100, 200, 400, 800, 1600], ghz: 3 }; // TUNED: a 3 GHz core
  // an example frame of `size` bytes (addresses through FCS); payload bytes are a counting pattern; `flip` flips one payload bit
  function frame(size, vlan, flip) {
    const E = SRC.eth, head = [...FRAME.dst, ...FRAME.src];
    if (vlan) head.push(0x81, 0x00, FRAME.tci >> 8, FRAME.tci & 255);
    head.push(FRAME.type >> 8, FRAME.type & 255);
    const pay = Math.max(size - head.length - E.fcs, vlan ? E.minPay - E.vlan : E.minPay);
    const body = head.concat(Array.from({ length: pay }, (_, i) => i & 255));
    const fcs = crc32(body);
    const sent = body.concat([fcs & 255, (fcs >>> 8) & 255, (fcs >>> 16) & 255, fcs >>> 24]);
    const rx = sent.slice(); if (flip) rx[head.length + 5] ^= 0x10;
    const rxFcs = crc32(rx.slice(0, -4)), ok = rxFcs === fcs;
    return { bytes: sent, rx, head: head.length, pay, fcs, rxFcs, ok, size: sent.length, residue: crc32(rx) };
  }
  // frame bytes (addresses through FCS) → what one frame occupies on the wire, and how many fit in a second
  function budget(gbps, size) {
    const E = SRC.eth, wire = size + E.pre + E.sfd + E.ifg, pps = gbps * 1e9 / (wire * 8), ns = 1e9 / pps;
    return { wire, pps, ns, cyc: ns * FRAME.ghz, eff: (size - 18) / wire, perDram: SRC.dram.lo / ns };
  }

  /* ── 03 descriptor prefetch: Little's law over PCIe read round trips ──
     the NIC must have a free buffer address in hand before a packet lands; fetching descriptors is a PCIe read that takes
     one round trip L. To sustain R packets/s it needs R × L descriptors in flight, in R × L / B reads of B descriptors
     each; with at most K reads outstanding it can sustain K × B / L packets/s. */
  const PREF = { batches: [1, 2, 4, 8, 16, 32], outs: [4, 8, 16, 32, 64, 128, 256], lats: [SRC.neug.rdMin, SRC.neug.rdMed, SRC.neug.rdMax] };
  function prefetch(gbps, size, B, K, L) {
    const b = budget(gbps, size), need = b.pps * L * 1e-9, reads = need / B, max = K * B / (L * 1e-9);
    return { pps: b.pps, need, reads, max, ok: max >= b.pps, frac: Math.min(1, max / b.pps), ns: b.ns };
  }

  /* ── 04 PCIe bytes per received packet (Neugebauer et al. eq. 1–3) ──
     simple: per packet a 4 B tail write (down), a 16 B descriptor read (MRd up, CplD down), the packet (MWr up), a 16 B
     write-back (up), a 4 B interrupt write (up), a 4 B head read (MRd down, CplD up).
     batched: descriptors fetched 8 at a time, written back 8 at a time, one tail write per 8, no interrupts, no head reads
     (a polling driver; Niantic fetches up to 40, writes back up to 8). The NIC strips the 4-byte FCS before the DMA.
     Gen3–5: per direction lanes × GT/s × 128/130 × (1 − DLL share); the DLL share is Neugebauer's 1 − 57.88/62.96 or B1's
     2 %. Gen6 FLIT: lanes × 64 × 236/256 with the DLL inside the FLIT; headers then cost 16 B (MWr, MRd) and 12 B (CplD),
     no per-TLP framing (approximate: the FLIT-mode header sizes of 64-bit requests). */
  const PCIE = { gens: [3, 4, 5, 6], gts: { 3: 8, 4: 16, 5: 32, 6: 64 }, lanes: [8, 16], mps: [128, 256, 512], mrrs: 512, batch: 8, speeds: [100, 200, 400, 800] };
  PCIE.dllN = 1 - SRC.neug.tlp / SRC.neug.phy;
  function linkGbps(gen, lanes, dll) {
    if (gen === 6) return lanes * PCIE.gts[6] * SRC.b1.flitTlp / SRC.b1.flit;
    return lanes * PCIE.gts[gen] * 128 / 130 * (1 - (dll == null ? PCIE.dllN : dll));
  }
  function mwr(sz, mps, gen) { const h = gen === 6 ? 16 : SRC.neug.mwr; return Math.ceil(sz / mps) * h + sz; }
  function mrd(sz, gen) { return Math.ceil(sz / PCIE.mrrs) * (gen === 6 ? 16 : SRC.neug.mrd); }
  function cpl(sz, mps, gen) { return Math.ceil(sz / mps) * (gen === 6 ? 12 : SRC.neug.cpl) + sz; }
  function pcieRx(o) {
    const { gen, lanes, size, mps, design, gbps } = o, sz = size - SRC.eth.fcs, B = design === 'simple' ? 1 : PCIE.batch;
    const up = { data: mwr(sz, mps, gen), wb: mwr(16 * B, mps, gen) / B, fetch: mrd(16 * B, gen) / B, irq: design === 'simple' ? mwr(4, mps, gen) : 0, head: design === 'simple' ? cpl(4, mps, gen) : 0 };
    const down = { tail: mwr(4, mps, gen) / B, fetch: cpl(16 * B, mps, gen) / B, head: design === 'simple' ? mrd(4, gen) : 0 };
    const upB = Object.values(up).reduce((a, x) => a + x, 0), downB = Object.values(down).reduce((a, x) => a + x, 0);
    const avail = linkGbps(gen, lanes, o.dll), pps = budget(gbps, size).pps, needUp = upB * 8 * pps / 1e9, needDown = downB * 8 * pps / 1e9;
    const frac = Math.min(1, avail / needUp, avail / needDown);
    return { up, down, upB, downB, avail, pps, needUp, needDown, frac, ok: frac >= 1, ohUp: upB / sz - 1, maxPps: Math.min(avail * 1e9 / (upB * 8), avail * 1e9 / (downB * 8)) };
  }

  /* ── 05 RSS: the Toeplitz hash, the indirection table, flows onto queues ── */
  function toeplitz(input, key) {
    key = key || SRC.ms.key; let r = 0;
    for (let i = 0; i < input.length * 8; i++) {
      if (!((input[i >> 3] >> (7 - (i & 7))) & 1)) continue;
      const j = i >> 3, s = i & 7;
      let w = ((key[j] << 24) | (key[j + 1] << 16) | (key[j + 2] << 8) | key[j + 3]) >>> 0;
      if (s) w = ((w << s) | ((key[j + 4] || 0) >> (8 - s))) >>> 0;
      r = (r ^ w) >>> 0;
    }
    return r >>> 0;
  }
  const ip4 = s => { const p = String(s).trim().split('.'); if (p.length !== 4) return null; const b = p.map(x => (/^\d{1,3}$/.test(x) ? +x : -1)); return b.every(x => x >= 0 && x <= 255) ? b : null; };
  function ip6(s) {
    s = String(s).trim(); const dbl = s.split('::'); if (dbl.length > 2) return null;
    const part = x => (x ? x.split(':') : []), a = part(dbl[0]), b = part(dbl[1]), fill = 8 - a.length - b.length;
    if (dbl.length === 1 && a.length !== 8) return null; if (fill < 0) return null;
    const g = a.concat(Array(dbl.length === 2 ? fill : 0).fill('0'), b);
    if (g.some(x => !/^[0-9a-f]{1,4}$/i.test(x))) return null;
    return g.flatMap(x => { const v = parseInt(x, 16); return [v >> 8, v & 255]; });
  }
  const port2 = p => [(p >> 8) & 255, p & 255];
  // input as the packet carries it: source address, destination address, source port, destination port
  function rssInput(src, dst, sport, dport, ports) { const v6 = String(src).includes(':'), a = v6 ? ip6(src) : ip4(src), b = v6 ? ip6(dst) : ip4(dst); if (!a || !b) return null; return ports ? a.concat(b, port2(sport), port2(dport)) : a.concat(b); }
  const RSS = { table: 128, queues: [2, 4, 8, 16, 32], mice: [0, 10, 100, 1000, 10000], elephants: [0, 1, 2, 4, 8], weight: 100 }; // TUNED: one elephant carries as much as 100 mice
  const queueOf = (h, nq, size) => ((h >>> 0) & ((size || RSS.table) - 1)) % nq;  // table[i] = i mod nq, indexed by the low bits
  function rss(src, dst, sport, dport, ports, nq) {
    const inp = rssInput(src, dst, sport, dport, ports); if (!inp) return null;
    const h = toeplitz(inp), rev = toeplitz(rssInput(dst, src, dport, sport, ports));
    return { h, idx: h & (RSS.table - 1), q: queueOf(h, nq), rh: rev, rq: queueOf(rev, nq), bytes: inp.length };
  }
  // random client flows to one server port 443; elephants are flows too, each with RSS.weight units of traffic
  function noCollide(k, n) { let p = 1; for (let i = 0; i < k; i++) p *= Math.max(0, 1 - i / n); return p; }
  function rssLoad(nq, mice, eleph, seed) {
    const r = rng(seed == null ? 7 : seed), load = new Array(nq).fill(0), eq = new Array(nq).fill(0);
    const flow = () => [10, 0, Math.floor(r() * 256), 1 + Math.floor(r() * 254)].join('.');
    for (let i = 0; i < mice + eleph; i++) {
      const q = queueOf(toeplitz(rssInput(flow(), '192.0.2.10', 1024 + Math.floor(r() * 64511), 443, true)), nq), w = i < eleph ? RSS.weight : 1;
      load[q] += w; if (i < eleph) eq[q]++;
    }
    const tot = load.reduce((a, x) => a + x, 0), mean = tot / nq, max = Math.max(...load);
    return { load, eq, tot, mean, max, ratio: tot ? max / mean : 0, share: tot ? max / tot : 0, empty: load.filter(x => !x).length, eCollide: eq.some(x => x > 1), pNo: noCollide(eleph, nq) };
  }
  // average max / mean over many seeds (pinned in the prose)
  function rssAvg(nq, mice, eleph, n) { let s = 0, c = 0; for (let i = 0; i < n; i++) { const x = rssLoad(nq, mice, eleph, 1000 + i); s += x.ratio; c += x.eCollide ? 1 : 0; } return { ratio: s / n, collide: c / n }; }

  /* ── 07 offloads: CPU cycles per received byte ──
     cycles = bytes × cB + frames × cF + skbs × cS (per-byte work, per-wire-frame driver and GRO work, per-skb TCP/IP work).
     With GRO each skb carries up to 64 KB, but only the frames of one flow that arrive in the same NAPI poll (budget 64)
     can merge; LRO does the merging in the NIC, so the per-frame software cost is paid per merged skb. The three constants
     are TUNED: fitted so that GRO + 9000 MTU gives Cai et al.'s 42 Gb/s per 3.4 GHz core with copy at 49 % of cycles, and
     LRO + 9000 gives their 55 Gb/s. */
  const OFF = { mss: { 1500: 1448, 9000: 8948 }, mtus: [1500, 9000], aggs: ['none', 'gro', 'lro'], flows: [1, 2, 4, 8, 16, 32, 64], budget: 64, ghz: SRC.cai.ghz, max: SRC.cai.gro };
  (function fit() {
    const c = SRC.cai, perB = g => c.ghz * 8 / g, m = OFF.mss[9000], G = OFF.max;
    const cB = c.copy * perB(c.gbps), rest = perB(c.gbps) - cB, sumFS = (perB(c.lro) - cB) * G; // (cF + cS) / G for LRO
    const cF = (rest - sumFS / G) / (1 / m - 1 / G), cS = sumFS - cF;
    OFF.cB = cB; OFF.cF = cF; OFF.cS = cS;
  })();
  function offload(mtu, agg, flows, fScale) {
    const mss = OFF.mss[mtu], perPoll = Math.max(1, Math.floor(OFF.budget / flows)), S = agg === 'none' ? mss : Math.min(OFF.max, mss * perPoll);
    const cF = OFF.cF * (fScale || 1), byte = OFF.cB, frame = (agg === 'lro' ? cF / S : cF / mss), skb = OFF.cS / S, cpb = byte + frame + skb;
    const gbps = OFF.ghz * 8 / cpb;
    return { mss, S, cpb, gbps, copy: byte / cpb, cores: 400 / gbps, parts: { byte, frame, skb } };
  }
  // TSO: one send of `len` bytes cut into MSS-sized segments; the NIC copies the headers, advances the sequence number and
  // the IPv4 ID, fixes lengths and checksums, and keeps FIN / PSH for the last segment only
  const TSO = { sends: [4096, 16384, 65536, 262144], hdr: 14 + 20 + 32, seq0: 1000001, id0: 4660 };
  function tso(len, mss) {
    const n = Math.ceil(len / mss), segs = [];
    for (let i = 0; i < n; i++) { const l = Math.min(mss, len - i * mss); segs.push({ i, seq: (TSO.seq0 + i * mss) >>> 0, len: l, id: (TSO.id0 + i) & 0xffff, psh: i === n - 1 }); }
    return { n, segs, hdrBytes: n * TSO.hdr, wire: len + n * (TSO.hdr + SRC.eth.fcs) };
  }

  /* ── 08 DDIO: a seeded simulation of the I/O ways of the last-level cache ──
     8 receive queues share one 100 Gb/s port; packets arrive as a Poisson stream spread evenly over the queues; each core
     takes a fixed time per packet (load ρ TUNED 0.6) and stalls for `stall` µs once every period (TUNED 2 ms, a random
     phase per core). The NIC writes each packet into the buffer of the next descriptor. DDIO's ways act as an LRU of
     W/11 of a 24.75 MiB LLC (Farshin's Xeon Gold 6140): a write to a buffer still in those ways updates it in place; any
     other write allocates lines there and evicts the least recently used, whose dirty bytes go to DRAM. The core reads a
     packet when it starts on it: a hit if the buffer is still in the I/O ways, else a read from DRAM. Simplifications: core
     reads do not reorder the LRU and lines never move to the core's own ways. */
  const DDIO = { queues: 8, gbps: 100, rho: 0.6, period: 2000, rings: [128, 256, 512, 1024, 2048, 4096], ways: [2, 4, 6, 8, 11], sizes: [256, 512, 1024, 1500], stalls: [0, 100, 200, 300, 400, 600], packets: 40000 };
  DDIO.llc = SRC.farshin.slices * SRC.farshin.sliceMiB * 1048576;
  function ddioSim(R, W, size, stall, opt) {
    const N = (opt && opt.packets) || DDIO.packets, Q = DDIO.queues, lines = Math.ceil(size / 64), cap = Math.floor(DDIO.llc * W / SRC.farshin.ways / 64);
    const rho = (opt && opt.rho) || DDIO.rho, period = (opt && opt.period) || DDIO.period;
    const pps = budget(DDIO.gbps, size).pps, lam = pps / Q, s = rho / lam * 1e6; // µs per packet
    const r = rng(1234), phase = Array.from({ length: Q }, () => r() * period);
    const free = new Array(Q).fill(0), slot = new Array(Q).fill(0), inq = Array.from({ length: Q }, () => []);
    const ev = []; let t = 0, drops = 0, acc = 0;
    const unstall = (q, x) => { if (!stall) return x; const k = Math.floor((x - phase[q]) / period), w0 = phase[q] + k * period; return x >= w0 && x < w0 + stall ? w0 + stall : x; };
    for (let n = 0; n < N; n++) {
      t += -Math.log(1 - r()) / pps * 1e6; const q = Math.floor(r() * Q);
      const qq = inq[q]; while (qq.length && qq[0] <= t) qq.shift();          // descriptors returned by finished packets
      if (qq.length >= R) { drops++; continue; }
      const b = q * 8192 + slot[q]; slot[q] = (slot[q] + 1) % R;
      const start = unstall(q, Math.max(t, free[q])), done = start + s; free[q] = done; qq.push(done);
      ev.push([t, 0, b, n], [start, 1, b, n]); acc++;
    }
    ev.sort((a, c) => a[0] - c[0] || a[1] - c[1]);
    const lru = new Map(); let used = 0, wHit = 0, wAll = 0, rHit = 0, rAll = 0, wb = 0, rd = 0; const warm = N * 0.25;
    for (const [, kind, b, n] of ev) {
      const meas = n >= warm;
      if (kind === 0) {
        if (lru.has(b)) { lru.delete(b); lru.set(b, 1); if (meas) { wHit++; wAll++; } continue; }
        while (used + lines > cap && lru.size) { const k = lru.keys().next().value; lru.delete(k); used -= lines; if (meas) wb += lines * 64; }
        lru.set(b, 1); used += lines; if (meas) wAll++;
      } else if (meas) { rAll++; if (lru.has(b)) rHit++; else rd += lines * 64; }
    }
    const pk = Math.max(1, rAll);
    return { cap, capBytes: cap * 64, foot: Q * R * lines * 64, lines, drops, dropPct: drops / N, rHit: rAll ? rHit / rAll : 1, wHit: wAll ? wHit / wAll : 1, dram: (wb + rd) / pk, wbPer: wb / pk, rdPer: rd / pk, s, fits: Q * R * lines <= cap };
  }

  /* ── 09 the transmit ring and byte queue limits ──
     a bulk sender keeps the queue as full as it is allowed to be; the NIC sends rate × T bytes per completion interval T.
     Without BQL the ring holds ring / descriptors-per-packet packets; with BQL the queued bytes stop at a limit that the
     kernel moves: up by the shortfall when the queue ran dry while data was waiting, down by the smallest slack seen over a
     hold of 20 intervals (the rule of lib/dynamic_queue_limits.c, simplified). A small packet that arrives behind the
     queue waits queued / rate. A 64 KB TSO send takes 17 descriptors (a header and sixteen 4 KiB fragments). */
  const BQL = { speeds: [1, 10, 25, 100, 400], rings: [256, 512, 1024, 2048, 4096], pkts: [1514, 65536], tcs: [10, 25, 50, 100, 200], hold: 20, steps: 400 };
  const descPer = pkt => pkt > 4096 ? 1 + Math.ceil(pkt / 4096) : 1;
  function bql(gbps, ring, pkt, tc, on) {
    const rate = gbps * 1e9 / 8 * tc * 1e-6, ringBytes = Math.floor(ring / descPer(pkt)) * pkt; // bytes per interval; bytes the ring can hold
    let limit = on ? pkt : ringBytes, q = 0, idle = 0, idleLate = 0, slackMin = Infinity, h = 0; const trace = [], late = BQL.steps - BQL.hold * 4;
    for (let i = 0; i < BQL.steps; i++) {
      while (q < limit && q + pkt <= ringBytes) q += pkt;                       // the producer tops the queue up to the limit
      const qb = q, sent = Math.min(q, rate), short = rate - sent; q -= sent;
      idle += short; if (i >= late) idleLate += short;
      if (on) {
        if (short > 0) { limit += short; slackMin = Infinity; h = 0; }          // ran dry while data waited: raise the limit
        else { slackMin = Math.min(slackMin, q); if (++h >= BQL.hold) { limit = Math.max(pkt, limit - slackMin); slackMin = Infinity; h = 0; } }
      }
      trace.push([i, limit, qb]);
    }
    const queued = Math.max(...trace.slice(late).map(x => x[2])), delay = queued / (gbps * 1e9 / 8) * 1e6; // µs behind the queue
    return { trace, ringBytes, limit, queued, delay, idleShare: idle / (rate * BQL.steps), idleLate: idleLate / (rate * (BQL.steps - late)), rate, descPer: descPer(pkt) };
  }

  /* ── 10 kernel stack, XDP, DPDK: cores to keep up ── */
  const XDPM = { paths: ['ct', 'raw', 'xdp', 'dpdk'] };
  function xdpCores(gbps, size) {
    const pps = budget(gbps, size).pps, X = SRC.xdp;
    const rows = XDPM.paths.map(p => { const m = X[p] * 1e6; return { p, mpps: X[p], ns: 1e9 / m, cyc: 1e9 / m * X.ghz, cores: pps / m, coresInt: Math.ceil(pps / m - 1e-9) }; });
    return { pps, rows, overPci: pps > X.pci * 1e6 };
  }

  /* ── 12 a training cluster: ECMP hashing vs packet spraying ──
     F equal flows (one per GPU, RoCE v2 to port 4791 with a random UDP source port) cross P equal paths. ECMP hashes the
     5-tuple (Toeplitz here; switches use their own hashes) and keeps each flow on one path; the job lasts as long as the
     busiest path, so efficiency = mean load / max load. Spraying sends packet k of a flow down path (k + offset) mod P,
     so each path carries the same bytes within one packet per flow; the receiving NIC has to put packets back in order. */
  const AI = { flows: [8, 16, 32, 64, 128, 256], paths: [4, 8, 16, 32, 64], modes: ['ecmp', 'spray'], pkts: 1000 };
  function ecmp(F, P, mode, seed) {
    const r = rng(seed == null ? 11 : seed), load = new Array(P).fill(0);
    for (let f = 0; f < F; f++) {
      const src = '10.1.' + (f >> 8) + '.' + (f & 255), sp = 49152 + Math.floor(r() * 16384), off = Math.floor(r() * P);
      if (mode === 'ecmp') load[toeplitz(rssInput(src, '10.2.0.1', sp, SRC.roce.port, true)) % P] += AI.pkts;
      else for (let k = 0; k < AI.pkts; k++) load[(k + off) % P]++;
    }
    const mean = F * AI.pkts / P, max = Math.max(...load);
    return { load, mean, max, eff: mean / max, idle: load.filter(x => !x).length, slow: max / mean };
  }
  function ecmpAvg(F, P, n) { let s = 0; for (let i = 0; i < n; i++) s += ecmp(F, P, 'ecmp', 500 + i).eff; return s / n; }

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  let PROSE_CACHE = null;
  function prose() {
    if (PROSE_CACHE) return PROSE_CACHE;
    const E = SRC.eth, N = SRC.neug, X = SRC.xdp, Fs = SRC.farshin, C = SRC.cai, D = FRONTIER.dj;
    const b15 = budget(400, 1518), b64 = budget(400, 64), b9k = budget(400, 9018), b10 = budget(10, 64), b800 = budget(800, 64);
    const f64 = frame(64, false, false);
    const pf = prefetch(400, 64, 8, 32, N.rdMed), pf15 = prefetch(400, 1518, 8, 32, N.rdMed), pf1 = prefetch(400, 64, 1, 32, N.rdMed);
    const p64 = pcieRx({ gen: 5, lanes: 16, size: 64, mps: 256, design: 'batch', gbps: 400 }), p15 = pcieRx({ gen: 5, lanes: 16, size: 1518, mps: 256, design: 'batch', gbps: 400 });
    const p64s = pcieRx({ gen: 5, lanes: 16, size: 64, mps: 256, design: 'simple', gbps: 400 }), p64b1 = pcieRx({ gen: 5, lanes: 16, size: 64, mps: 256, design: 'batch', gbps: 400, dll: SRC.b1.dll });
    const p64g6 = pcieRx({ gen: 6, lanes: 16, size: 64, mps: 256, design: 'batch', gbps: 400 }), p8g6 = pcieRx({ gen: 6, lanes: 16, size: 64, mps: 256, design: 'batch', gbps: 800 });
    const v = SRC.ms.v4[0], rv = rss(v[2], v[0], v[3], v[1], true, 8);
    const rM = rssAvg(8, 10000, 0, 40), rE = rssAvg(8, 1000, 4, 200), rE16 = rssAvg(16, 1000, 4, 200);
    const o0 = offload(1500, 'none', 1), oG = offload(1500, 'gro', 1), oJ = offload(9000, 'gro', 1), oL = offload(9000, 'lro', 1), o16 = offload(9000, 'gro', 16), o64 = offload(9000, 'gro', 64);
    const t64 = tso(65536, 1448);
    const d0 = ddioSim(1024, 2, 1500, 600), d256 = ddioSim(256, 2, 1500, 600), dW = ddioSim(1024, 11, 1500, 600), d0s = ddioSim(1024, 2, 1500, 0), d512 = ddioSim(512, 4, 1500, 600), dR8 = ddioSim(1024, 2, 1500, 600, { rho: 0.8 }), dP1 = ddioSim(1024, 2, 1500, 600, { period: 1000 }), dR8s = ddioSim(1024, 2, 1500, 300, { rho: 0.8 });
    const q0 = bql(25, 1024, 65536, 50, false), q1 = bql(25, 1024, 65536, 50, true), q15 = bql(25, 1024, 1514, 50, false);
    const lwnMs = SRC.lwn.ring * (SRC.lwn.pkt + E.pre + E.sfd + E.ifg + 18) * 8 / (SRC.lwn.gbps * 1e9) * 1e3;
    const x = xdpCores(400, 64), x15 = xdpCores(400, 1518);
    const a64 = ecmpAvg(64, 64, 200), a64s = ecmp(64, 64, 'spray'), a128 = ecmpAvg(128, 16, 200);
    PROSE_CACHE = {
      // hero / ch2
      ppsTop: [b15.pps / 1e6, 1], nsTop: [b15.ns, 1], pps64: [b64.pps / 1e6, 0], ns64: [b64.ns, 2], pps9k: [b9k.pps / 1e6, 2], ns9k: [b9k.ns, 0],
      cycTop: [b15.cyc, 0], cyc64: [b64.cyc, 1], eff64: [b64.eff, 0, 'pct'], eff15: [b15.eff, 1, 'pct'], pps10: [b10.pps / 1e6, 2], pps800: [b800.pps / 1e6, 0], ns800: [b800.ns, 2],
      wire64: [b64.wire, 0], wire15: [b15.wire, 0], dramLo: [SRC.dram.lo, 0], dramHi: [SRC.dram.hi, 0], perDram64: [b64.perDram, 0],
      ePre: [E.pre, 0], eSfd: [E.sfd, 0], eMac: [E.mac, 0], eType: [E.type, 0], eMin: [E.minPay, 0], eMax: [E.maxPay, 0], eFcs: [E.fcs, 0], eIfg: [E.ifg, 0], eMinF: [E.minFrame, 0], eVlan: [E.vlan, 0],
      fcs64: [f64.fcs, 0, 'hex'],
      // ch3
      rdMin: [N.rdMin, 0], rdMed: [N.rdMed, 0], rdMax: [N.rdMax, 0], pfNeed: [pf.need, 0], pfReads: [pf.reads, 0], pfNeed15: [pf15.need, 0], pf1Frac: [pf1.frac, 0, 'pct'], pfFrac: [pf.frac, 0, 'pct'], pfMax: [pf.max / 1e6, 0], pfOut: [32, 0],
      // ch4
      mwrH: [N.mwr, 0], cplH: [N.cpl, 0], dllN: [PCIE.dllN, 0, 'pct'], dllB: [SRC.b1.dll, 0, 'pct'], g5avail: [p64.avail, 0], g5availB: [p64b1.avail, 0],
      p64up: [p64.upB, 0], p64need: [p64.needUp, 0], p64frac: [p64.frac, 0, 'pct'], p64bfrac: [p64b1.frac, 0, 'pct'], p64sUp: [p64s.upB, 0], p64sFrac: [p64s.frac, 0, 'pct'],
      p15up: [p15.upB, 0], p15need: [p15.needUp, 0], p15oh: [p15.ohUp, 1, 'pct'], p64oh: [p64.ohUp, 0, 'pct'], g6avail: [p64g6.avail, 0], g6frac8: [p8g6.frac, 0, 'pct'], nFetch: [N.fetch, 0], nWb: [N.wb, 0],
      // ch5
      v4h: [SRC.ms.v4[0][5], 0, 'hex'], v4hip: [SRC.ms.v4[0][4], 0, 'hex'], rssIdx: [rv.idx, 0], rssQ: [rv.q, 0], rssRq: [rv.rq, 0], tblLo: [SRC.ms.tableLo, 0], tblHi: [SRC.ms.tableHi, 0], tblX: [SRC.scaling.tableX, 0],
      rssMice: [rM.ratio, 2], rssE: [rE.ratio, 2], rssEc: [rE.collide, 0, 'pct'], rssNo: [noCollide(4, 8), 0, 'pct'], rssNo16: [noCollide(4, 16), 0, 'pct'], rssE16c: [rE16.collide, 0, 'pct'], rssW: [RSS.weight, 0],
      // ch6
      rfs: [SRC.scaling.rfs, 0, 'str'], remote: [N.remote, 0],
      // ch7
      o0: [o0.gbps, 1], oG: [oG.gbps, 1], oJ: [oJ.gbps, 1], oL: [oL.gbps, 1], o16: [o16.gbps, 1], o64: [o64.gbps, 1], oJcores: [oJ.cores, 1], o0cores: [o0.cores, 0], oF2n: [offload(1500, 'none', 1, 2).gbps / o0.gbps, 0, 'pct'], oF2j: [offload(9000, 'gro', 1, 2).gbps / oJ.gbps, 0, 'pct'],
      cB: [OFF.cB, 2], cF: [OFF.cF, 0], cS: [OFF.cS, 0], caiG: [C.gbps, 0], caiL: [C.lro, 0], caiCopy: [C.copy, 0, 'pct'], caiGhz: [C.ghz, 1], caiMiss: [C.miss, 0],
      tsoN: [t64.n, 0], tsoHdr: [t64.hdrBytes, 0], tsoH: [TSO.hdr, 0],
      // ch8
      llcMiB: [DDIO.llc / 1048576, 2], ddioMiB: [d0.capBytes / 1048576, 1], fWays: [Fs.ways, 0], fDdio: [Fs.ddioWays, 0], fFoot: [Fs.footMiB, 1], fPct: [Fs.footPct, 1], fGain: [Fs.gain, 0], fTail: [Fs.tail, 0],
      d0foot: [d0.foot / 1048576, 1], d0r: [d0.rHit, 0, 'pct'], d0w: [d0.wHit, 0, 'pct'], d0dram: [d0.dram, 0], d256r: [d256.rHit, 0, 'pct'], d256w: [d256.wHit, 0, 'pct'], d256drop: [d256.dropPct, 1, 'pct'], dWr: [dW.rHit, 0, 'pct'], dWdram: [dW.dram, 0], d0sr: [d0s.rHit, 0, 'pct'], d0sdram: [d0s.dram, 0], d512drop: [d512.dropPct, 1, 'pct'], d512dram: [d512.dram, 0], d0drop: [d0.dropPct, 0, 'pct'], dPkt: [Math.ceil(1500 / 64) * 64, 0], nDdio: [N.ddio, 0], nFlush: [N.flush, 0], dR8r: [dR8.rHit, 0, 'pct'], dP1r: [dP1.rHit, 0, 'pct'], dR8s: [dR8s.rHit, 0, 'pct'], dRho: [DDIO.rho, 0, 'pct'], dRho8: [0.8, 0, 'pct'],
      // ch9
      q0ms: [q0.delay / 1000, 2], q1us: [q1.delay, 0], q15ms: [q15.delay / 1000, 2], q0MB: [q0.ringBytes / 1e6, 1], lwnMs: [lwnMs, 1], lwnRing: [SRC.lwn.ring, 0], descPer: [descPer(65536), 0],
      // ch10
      xCt: [X.ct, 1], xRaw: [X.raw, 1], xXdp: [X.xdp, 0], xDpdk: [X.dpdk, 1], xPci: [X.pci, 0], xNsX: [1e3 / X.xdp, 0], xNsD: [1e3 / X.dpdk, 0], xLatX: [X.latX, 0], xLatD: [X.latD, 0], xPass: [X.pass, 1],
      xcRaw: [x.rows[1].cores, 0], xcXdp: [x.rows[2].cores, 0], xcDpdk: [x.rows[3].cores, 0], xc15Raw: [x15.rows[1].cores, 1], xc15Xdp: [x15.rows[2].cores, 1],
      // ch11
      cxLo: [SRC.cx7.msgLo, 0], cxHi: [SRC.cx7.msgHi, 0], rocePort: [SRC.roce.port, 0, 'str'],
      // ch12
      ai64: [a64, 0, 'pct'], ai64s: [a64s.eff, 0, 'pct'], ai128: [a128, 0, 'pct'],
      // ch13: the 802.3dj initial SA ballot
      djRet: [D.returned, 0], djYes: [D.approve, 0], djNo: [D.disapprove, 0], djAbs: [D.abstain, 0], djPct: [D.approve / (D.approve + D.disapprove), 0, 'pct'], djCom: [D.comments, 0]
    };
    return PROSE_CACHE;
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s, useGrouping: Math.abs(x) >= 10000 }); // no separator below 10 000 (1518, 4791)
  }
  function fmtKind(v, kind) { if (kind === 'hex') return hex(v, 8); if (kind === 'str') return String(v); return null; }

  /* ── live sentences: each returns { key } ── */
  const say = {
    frame(b) { return { key: b.ns < 10 ? 'ch2.say.tiny' : b.ns < SRC.dram.lo ? 'ch2.say.short' : b.ns < 1000 ? 'ch2.say.mid' : 'ch2.say.long' }; },
    fcs(f) { return { key: f.ok ? 'ch2.say.fcsOk' : 'ch2.say.fcsBad' }; },
    pref(r) { return { key: r.ok ? (r.max >= 4 * r.pps ? 'ch3.say.easy' : 'ch3.say.ok') : 'ch3.say.short' }; },
    pcie(r) { return { key: r.ok ? (r.frac >= 1 && r.needUp > 0.85 * r.avail ? 'ch4.say.tight' : 'ch4.say.ok') : 'ch4.say.up' }; },
    hash(r) { return { key: r.q === r.rq ? 'ch5.say.same' : 'ch5.say.diff' }; },
    load(r, eleph) { if (!r.tot) return { key: 'ch5.say.none' }; if (eleph && r.eCollide) return { key: 'ch5.say.collide' }; if (eleph) return { key: 'ch5.say.lucky' }; return { key: r.ratio < 1.1 ? 'ch5.say.even' : 'ch5.say.uneven' }; },
    off(r, agg, flows) { if (agg === 'none') return { key: 'ch7.say.none' }; if (r.S <= 4 * r.mss) return { key: 'ch7.say.fewmerge' }; return { key: agg === 'lro' ? 'ch7.say.lro' : 'ch7.say.gro' }; },
    ddio(r) { if (r.fits) return { key: 'ch8.say.fits' }; if (r.rHit < 0.9) return { key: 'ch8.say.leakRead' }; return { key: 'ch8.say.leakWrite' }; },
    bql(r, on) { if (!on) return { key: r.delay > 1000 ? 'ch9.say.offLong' : 'ch9.say.off' }; return { key: 'ch9.say.on' }; },
    xdp(r) { return { key: r.overPci ? 'ch10.say.pci' : r.rows[2].cores <= 1 ? 'ch10.say.one' : 'ch10.say.many' }; },
    ai(r, mode) { if (mode === 'spray') return { key: 'ch12.say.spray' }; return { key: r.eff > 0.8 ? 'ch12.say.ok' : r.idle ? 'ch12.say.idle' : 'ch12.say.hot' }; }
  };

  return { SRC, FRONTIER, rng, hex, hb, crc32, FRAME, frame, budget, PREF, prefetch, PCIE, linkGbps, pcieRx, toeplitz, ip4, ip6, rssInput, RSS, queueOf, rss, noCollide, rssLoad, rssAvg,
    OFF, offload, TSO, tso, DDIO, ddioSim, BQL, bql, descPer, XDPM, xdpCores, AI, ecmp, ecmpAvg, prose, fmt, fmtKind, say };
});
