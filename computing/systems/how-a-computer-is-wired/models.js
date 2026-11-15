/* How a computer is wired: the page's models. Each implements a rule or table from a primary document, or a named
   textbook result; constants that are tuned (not taken from a source) are marked TUNED and flagged on the page.
   Units: MB/s = 1e6 bytes/s, GB/s = 1e9 bytes/s, ns, pF, Ω.
   UMD: window.WiredModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WiredModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ── Figures quoted from documents (sources and dates opened in BRIEF.md). ── */
  const SPEC = {
    // PCI Local Bus Specification Rev. 3.0 (3 Feb 2004). §1.5: "32-bit data path at 33 MHz (132 MB/s peak)";
    // revision history 1.0 = 6/22/92, 2.1 (66 MHz chapter) = 6/1/95; Table 3-5 example system (10 µs slices,
    // "eight clocks of target initial latency"); Table 7-7 timing budgets; §4.2.2 Cin 10 pF; Table 4-4 Ioh(AC)
    // = −17.1(Vcc−Vout) mA for 0.3Vcc<Vout<0.9Vcc; Table 4-3 Vih = 0.5Vcc; §4.4.3.3 Z0 60–100 Ω, 150–190 ps/inch;
    // §4.4.3.1 card trace ≤ 1.5 inches; §5.6 connector spacing 0.8 inches; §4.1.2 reflected-wave signalling.
    pci: {
      v10: '1992-06-22', v21: '1995-06-01', v30: '2004-02-03', mhz: 33, widthBytes: 4, peakMBps: 132, tclkNs: 30,
      initLat: 8, sliceUs: 10,
      table35: [ // device, MB/s, bytes per 10 µs, µs used, transactions; each transaction as [count, data phases]
        ['graphics', 50, 500, 6.15, 10, [[5, 15], [5, 10]]], ['lan', 4, 40, 0.54, 1, [[1, 10]]], ['disk', 5, 50, 0.63, 1, [[1, 13]]],
        ['isa', 4, 40, 0.78, 2, [[2, 5]]], ['p2p', 9, 90, 1.17, 2, [[1, 10], [1, 13]]]],
      table35Total: [72, 720, 9.27, 16],
      budget: { 33: { tcyc: 30, tval: 11, tprop: 10, tsu: 7, tskew: 2 }, 66: { tcyc: 15, tval: 6, tprop: 5, tsu: 3, tskew: 1 }, 50: { tcyc: 20, tval: 6, tprop: 10, tsu: 3, tskew: 1 } },
      cin: 10, z0: [60, 100], tpd: [150, 190], stubIn: 1.5, slotIn: 0.8, iohSlope: 17.1, vih: 0.5, typicalLoads: 8
    },
    // Intel 875P Chipset Datasheet, 82875P MCH, Feb 2004 (252525-002): FSB 800 MHz "Maximum theoretical BW of 6.4 GB/s";
    // dual-channel DDR400 6.4 GB/s; AGP 8X "2.1 GB/s"; Hub Interface 1.5 "266 MB/s point-to-point Hub Interface to the ICH5";
    // CSA 266 MB/s to Gigabit Ethernet; ICH5: 2 SATA, ATA100, 8 USB 2.0 ports, PCI, LPC, flash BIOS.
    i875: { date: '2004-02', fsb: 6.4, mem: 6.4, agp: 2.1, hi: 0.266, csa: 0.266, usbPorts: 8 },
    // AMD ISSCC 2018 2.4 "Zeppelin": an SoC for Multi-chip Architectures (Beck, White, Paraschou, Naffziger), slides 9–11:
    // local memory ~90 ns, other memory within socket ~145 ns, other socket (single hop) ~200 ns (2.4 GHz, DDR4-2667);
    // "2pJ/bit IFOP SerDes". Four Zeppelin dies per EPYC 7001 package, two DDR4 channels per die.
    zep: { local: 90, pkg: 145, remote: 200, ifopPj: 2, diesPerSocket: 4, chPerDie: 2 },
    // Intel ARK, Xeon 6767P (opened 2026-11-15): Q1'25, 2S, 4 UPI links at 24 GT/s, 8 DDR5 channels, DDR5-6400.
    xeon6767p: { upiLinks: 4, upiGT: 24, channels: 8, mts: 6400 },
    // Intel ARK, Z890 chipset (opened 2026-11-15): Q4'24, DMI 4.0, 8 DMI lanes, PCIe 4.0, up to 24 lanes, 8 SATA, 14 USB;
    // Intel 800 Series Chipset Brief: Z890 34 chipset HSIO lanes, eSPI 4 chip selects, processor PCIe 5.0 1x16+1x4 or
    // 2x8+1x4 or 1x8+3x4 plus PCIe 4.0 1x4. Intel ARK Core Ultra 7 265F: 24 lanes, DMI 4, 8 DMI lanes, 2 DDR5 channels.
    z890: { date: 'Q4 2024', dmiLanes: 8, dmiGT: 16, chipsetLanes: 24, hsio: 34, sata: 8, usb: 14, espiCs: 4, cpuGen5: 20, cpuGen4: 4 },
    // AMD product page, Ryzen 9 9950X (opened 2026-11-15): native PCIe lanes total/usable 28/24; X870E adds 8× Gen4 usable.
    am5: { total: 28, usable: 24, x870eExtra: 8, linkLanes: 4, linkGT: 16 /* Gen4: secondary, see BRIEF */ },
    // PCIe 4.0 per-lane payload rate: 16 GT/s with 128b/130b (the encoding itself is the subject of B1)
    gen4LaneGBps: 16 * 128 / 130 / 8,
    // drive and port figures reused from sibling essays (sources in their BRIEFs): Samsung 990 EVO Plus 7,250 MB/s read,
    // Samsung 870 EVO 560 MB/s; USB 3.2 Gen 2×2 effective 2 × 1,100 MB/s (USB 3.2 §4.4.11)
    nvme: 7.25, sata: 0.56, usb20g: 2.2,
    // NXP UM10204 Rev. 7.0 (1 Oct 2021): Table 10/11 and §7.1. tr max 1000/300/120 ns, Cb max 400/400/550 pF, IOL 3/3/20 mA
    // at VOL 0.4 V, VIL 0.3VDD, VIH 0.7VDD, Ci ≤ 10 pF, fSCL 100/400/1000 kHz; t2 − t1 = 0.8473·RC; original release 1982.
    i2c: {
      rev: '7.0', date: '2021-10-01', first: 1982, k: Math.log(0.7 / 0.3), kSpec: 0.8473, vol: 0.4, ci: 10,
      modes: { sm: { khz: 100, tr: 1000, cb: 400, iol: 3 }, fm: { khz: 400, tr: 300, cb: 400, iol: 3 }, fmp: { khz: 1000, tr: 120, cb: 550, iol: 20 } }
    },
    // UCIe key metrics as presented by D. Das Sharma (UCIe Consortium), HOTI 2025 slide 8, "from UCIe 1.0 and 2.0
    // Specifications": 2D 0.5 (≤16G) / 0.6 (>16G) pJ/b, shoreline 28–224 GB/s/mm, reach 25 mm, bump 100–130 µm;
    // 2.5D 0.25 / 0.3 pJ/b, 165–1317 GB/s/mm, reach 2 mm, bump 25–55 µm; 3D 0.05 (9 µm) – 0.01 (1 µm) pJ/b;
    // round trip 2 ns (2D/2.5D), < 1 ns (3D). Slide 12: LPDDR5 2.8 pJ/b measured, HBM3 0.9 pJ/b measured.
    ucie: { d2: { pj: 0.6, shore: 224, reach: 25 }, d25: { pj: 0.3, shore: 1317, reach: 2 }, d3: { pj: 0.05 }, rt: 2, v1: '2022-03', v3: '2025-08-05', v3GT: [48, 64] },
    lp5Pj: 2.8, hbm3Pj: 0.9
  };

  /* ── 01 one PCI bus. A transaction of D data phases costs D + L clocks, L = target initial latency (the spec's
     example uses 8). This reproduces every row of Table 3-5. A shared bus gives every master the same wires in turn;
     under round-robin arbitration a master waits at most (N − 1) transactions. ── */
  const PCI = {
    txClocks(D, L) { return D + (L == null ? SPEC.pci.initLat : L); },
    txUs(D, L) { return this.txClocks(D, L) * SPEC.pci.tclkNs / 1000; },
    rowUs(txs) { return txs.reduce((s, [n, D]) => s + n * this.txUs(D), 0); },
    rowBytes(txs) { return txs.reduce((s, [n, D]) => s + n * D * SPEC.pci.widthBytes, 0); },
    effMBps(D, L) { return SPEC.pci.peakMBps * D / this.txClocks(D, L); },
    share(N, d, D) {
      const eff = this.effMBps(D), U = N * d / eff, each = U <= 1 ? d : eff / N;
      return { eff, U, each, total: N * each, p2pEach: Math.min(d, eff), p2pTotal: N * Math.min(d, eff), waitUs: (N - 1) * this.txUs(D) };
    }
  };

  /* ── 02 reflected-wave switching on a loaded line. Budget: Tprop = Tcyc − Tval − Tsu − Tskew (PCI Table 7-7).
     Line: C0 = tpd/Z0 per inch; N loads of C each, one per slot pitch s, lower the impedance and slow the wave:
     t' = tpd·√(1 + C/(C0·s)), Z' = Z0/√(1 + C/(C0·s)) (loaded-line approximation: Johnson & Graham, High-Speed Digital
     Design, 1993; Dally & Poulton, Digital Systems Engineering, 1998). The weakest allowed PCI pull-up is a Thevenin source of 1/17.1 mS = 58.5 Ω (Table 4-4). Lattice
     diagram, driver at one end, open far end: first step V1 = Vcc·Z'/(Z'+Rs); after k round trips every point has at
     least 2·V1·(1 − Γs^k)/(1 − Γs), Γs = (Rs − Z')/(Rs + Z'); a receiver is valid once that reaches Vih = 0.5 Vcc. ── */
  const LINE = {
    tpd: 170, z0: 60,            // TUNED within the spec's ranges (150–190 ps/in, 60–100 Ω); sensitivity in BRIEF and ch2.limit
    rs() { return 1000 / SPEC.pci.iohSlope; },                       // 58.48 Ω
    c0() { return this.tpd / this.z0; },                             // pF per inch (ps/Ω = pF)
    defaultLoad() { return SPEC.pci.cin + SPEC.pci.stubIn * this.c0(); },   // pin + a 1.5-inch card stub
    tpropBudget(f, comp) { const b = SPEC.pci.budget[comp]; return 1000 / f - b.tval - b.tsu - b.tskew; },
    loaded(C) { const k = Math.sqrt(1 + C / (this.c0() * SPEC.pci.slotIn)); return { k, tps: this.tpd * k, z: this.z0 / k }; },
    trips(C) {
      const { z } = this.loaded(C), Rs = this.rs(), v1 = z / (z + Rs), g = (Rs - z) / (Rs + z);
      let k = 1; while (2 * v1 * (1 - Math.pow(g, k)) / (1 - g) < SPEC.pci.vih && k < 50) k++;
      return { v1, g, k, after1: 2 * v1 };
    },
    rtNs(N, C) { return 2 * N * SPEC.pci.slotIn * this.loaded(C).tps / 1000; },          // one round trip, ns
    needNs(N, C) { return this.trips(C).k * this.rtNs(N, C); },
    maxLoads(f, comp, C) { const T = this.tpropBudget(f, comp); let n = 0; while (n < 60 && this.needNs(n + 1, C) <= T + 1e-9) n++; return n; },
    fmax(N, comp, C) { const b = SPEC.pci.budget[comp]; return 1000 / (b.tval + b.tsu + b.tskew + this.needNs(N, C)); }
  };

  /* ── max-min fair rates on a set of links (progressive filling; Bertsekas & Gallager, Data Networks §6.5.2).
     links: {id: capacity}; flows: [{id, demand, path:[link ids]}]. Used for the 2004 northbridge (ch3), the NUMA
     link (ch4) and today's chipset uplink (ch5). ── */
  function maxmin(links, flows) {
    const cap = Object.assign({}, links), rate = {}, active = new Set(flows.map(f => f.id));
    flows.forEach(f => { rate[f.id] = 0; });
    for (let guard = 0; guard < 100 && active.size; guard++) {
      let inc = Infinity;
      for (const f of flows) if (active.has(f.id)) inc = Math.min(inc, f.demand - rate[f.id]);
      for (const l of Object.keys(cap)) { const n = flows.filter(f => active.has(f.id) && f.path.includes(l)).length; if (n) inc = Math.min(inc, cap[l] / n); }
      for (const f of flows) if (active.has(f.id)) { rate[f.id] += inc; f.path.forEach(l => { cap[l] -= inc; }); }
      for (const f of flows) if (active.has(f.id) && (f.demand - rate[f.id] <= 1e-12 || f.path.some(l => cap[l] <= 1e-12))) active.delete(f.id);
    }
    const load = {}; for (const l of Object.keys(links)) load[l] = flows.filter(f => f.path.includes(l)).reduce((s, f) => s + rate[f.id], 0);
    const want = {}; for (const l of Object.keys(links)) want[l] = flows.filter(f => f.path.includes(l)).reduce((s, f) => s + f.demand, 0);
    return { rate, load, want };
  }

  /* ── 03 the 875P machine: every flow to memory crosses the MCH's memory channels (6.4 GB/s). ── */
  const NB = {
    links() { const S = SPEC.i875; return { fsb: S.fsb, mem: S.mem, agp: S.agp, hi: S.hi, csa: S.csa }; },
    flows(d) {
      return [{ id: 'cpu', demand: d.cpu, path: ['fsb', 'mem'] }, { id: 'gpu', demand: d.gpu, path: ['agp', 'mem'] },
        { id: 'sb', demand: d.sb, path: ['hi', 'mem'] }, { id: 'gbe', demand: d.gbe, path: ['csa', 'mem'] }].filter(f => f.demand > 0);
    },
    run(d) { const r = maxmin(this.links(), this.flows(d)); return r; },
    gbe: 0.125, sataEach: 0.15
  };

  /* ── 04 NUMA on a two-socket EPYC 7001 (ISSCC 2018 latencies). Mean latency is the access-weighted average; with a
     fixed number of misses in flight per core, Little's law gives the per-core bandwidth X = m·64 B / latency
     (link: why-compute-waits-for-memory #ch4). Placement shares: local die, other die same socket, other socket. ── */
  const NUMA = {
    line: 64, mlp: 10,           // TUNED: misses a core keeps in flight (X scales linearly with it)
    shares(p) {                    // p: { pkg, remote } fractions; local takes the rest
      const pkg = clamp(p.pkg, 0, 1), remote = clamp(p.remote, 0, 1 - pkg); return { local: 1 - pkg - remote, pkg, remote };
    },
    lat(p) { const s = this.shares(p), Z = SPEC.zep; return s.local * Z.local + s.pkg * Z.pkg + s.remote * Z.remote; },
    bw(p, m) { return (m == null ? this.mlp : m) * this.line / this.lat(p); },           // GB/s (bytes per ns)
    interleave() { const D = SPEC.zep.diesPerSocket, n = 2 * D; return { pkg: (D - 1) / n, remote: D / n }; },
    socketBW() { const X = SPEC.xeon6767p; return X.channels * X.mts * 8 / 1000; }        // GB/s per socket, 409.6
  };

  /* ── 05 today's board: devices behind the chipset share one uplink per direction. ── */
  const BOARD = {
    uplink(p) { return p === 'amd' ? SPEC.am5.linkLanes * SPEC.gen4LaneGBps : SPEC.z890.dmiLanes * SPEC.gen4LaneGBps; },
    devCap: { ssd: 4 * 16 * 128 / 130 / 8 },
    flows(o) {
      const S = SPEC, f = [];
      if (o.ssd1 === 'read') f.push({ id: 'ssd1', demand: S.nvme, path: ['up'] });
      if (o.ssd2 === 'read') f.push({ id: 'ssd2', demand: S.nvme, path: ['up'] });
      if (o.ssd2 === 'write') f.push({ id: 'ssd2', demand: S.nvme, path: ['dn'] });
      if (o.copy) { f.push({ id: 'ssd1', demand: S.nvme, path: ['up'] }); f.push({ id: 'ssd2', demand: S.nvme, path: ['dn'] }); }
      if (o.usb) f.push({ id: 'usb', demand: S.usb20g, path: ['up'] });
      if (o.sata) { f.push({ id: 'sataA', demand: S.sata, path: ['up'] }); f.push({ id: 'sataB', demand: S.sata, path: ['up'] }); }
      if (o.cpuSsd) f.push({ id: 'cpuSsd', demand: S.nvme, path: ['cpu'] });
      return f;
    },
    run(o) {
      const U = this.uplink(o.plat), fl = this.flows(o).filter((x, i, a) => a.findIndex(y => y.id === x.id) === i);
      const r = maxmin({ up: U, dn: U, cpu: 4 * SPEC.gen4LaneGBps * 2 }, fl);
      const behind = fl.filter(x => x.path[0] !== 'cpu');
      const want = { up: r.want.up, dn: r.want.dn };
      return Object.assign(r, { U, flows: fl, over: Math.max(want.up, want.dn) / U, behind: behind.length,
        slowest: behind.length ? Math.min(...behind.map(x => r.rate[x.id] / x.demand)) : 1 });
    }
  };

  /* ── 06 on-die networks: all-pairs hop counts by brute force, bidirectional ring vs a×b mesh with dimension-order
     routing. Closed forms in tests (Dally & Towles, Principles and Practices of Interconnection Networks, ch. 3, 5):
     ring mean distance (distinct pairs) N²/(4(N−1)) for even N; mesh per dimension k(k²−1)/3 summed over ordered pairs;
     max channel load under uniform traffic γ = N/8 (ring), max(a,b)/4 (mesh, even sides); throughput Θ = b/γ. ── */
  const NOC = {
    dims(N) { let a = Math.floor(Math.sqrt(N)); while (N % a) a--; return [N / a, a]; },
    ring(N) {
      let sum = 0, max = 0; const load = new Array(2 * N).fill(0);                 // channel i→i+1 (cw) and i→i−1 (ccw)
      for (let s = 0; s < N; s++) for (let t = 0; t < N; t++) {
        if (s === t) continue;
        const cw = (t - s + N) % N, ccw = N - cw, h = Math.min(cw, ccw); sum += h; max = Math.max(max, h);
        const w = cw === ccw ? 0.5 : 1;
        if (cw <= ccw) for (let i = 0; i < cw; i++) load[(s + i) % N] += w / N;
        if (ccw <= cw) for (let i = 0; i < ccw; i++) load[N + (s - i + N) % N] += w / N;
      }
      return { avg: sum / (N * (N - 1)), max, gamma: Math.max(...load), bis: 4 };
    },
    mesh(N) {
      const [a, b] = this.dims(N); let sum = 0, max = 0; const load = new Map();
      const add = (k) => load.set(k, (load.get(k) || 0) + 1 / N);
      for (let s = 0; s < N; s++) for (let t = 0; t < N; t++) {
        if (s === t) continue;
        let x = s % a, y = Math.floor(s / a); const tx = t % a, ty = Math.floor(t / a);
        const h = Math.abs(x - tx) + Math.abs(y - ty); sum += h; max = Math.max(max, h);
        while (x !== tx) { const nx = x + Math.sign(tx - x); add(`${x},${y}>${nx},${y}`); x = nx; }
        while (y !== ty) { const ny = y + Math.sign(ty - y); add(`${x},${y}>${x},${ny}`); y = ny; }
      }
      return { a, b, avg: sum / (N * (N - 1)), max, gamma: Math.max(...load.values()), bis: 2 * Math.min(a, b) };
    }
  };

  /* ── 07 die-to-die links: power = bandwidth × energy per bit; edge needed = bandwidth / shoreline density. ── */
  const D2D = {
    kinds: ['d3', 'd25', 'd2', 'hbm3', 'ifop', 'lp5'],
    pj(k) { const S = SPEC; return { d3: S.ucie.d3.pj, d25: S.ucie.d25.pj, d2: S.ucie.d2.pj, hbm3: S.hbm3Pj, ifop: S.zep.ifopPj, lp5: S.lp5Pj }[k]; },
    shore(k) { return k === 'd25' ? SPEC.ucie.d25.shore : k === 'd2' ? SPEC.ucie.d2.shore : null; },
    watts(GBps, k) { return GBps * 8 * this.pj(k) / 1000; },                       // GB/s × 8 bit × pJ = mW·1000
    edgeMm(GBps, k) { const s = this.shore(k); return s ? GBps / s : null; }
  };

  /* ── 08 I²C open-drain rise: V(t) = VDD(1 − e^(−t/RC)); 0.3→0.7 VDD takes ln(7/3)·RC = 0.8473·RC (UM10204 §7.1).
     Rp(max) = tr / (0.8473·Cb); Rp(min) = (VDD − VOL)/IOL. ── */
  const I2C = {
    tr(Rk, Cp) { return SPEC.i2c.k * Rk * 1e3 * Cp * 1e-12 * 1e9; },               // ns
    rpMax(mode, Cp) { return SPEC.i2c.modes[mode].tr * 1e-9 / (SPEC.i2c.k * Cp * 1e-12) / 1e3; },    // kΩ
    rpMin(mode, vdd) { return (vdd - SPEC.i2c.vol) / SPEC.i2c.modes[mode].iol; },                   // kΩ (V / mA)
    check(mode, vdd, Rk, Cp) {
      const m = SPEC.i2c.modes[mode], tr = this.tr(Rk, Cp), lo = this.rpMin(mode, vdd), hi = this.rpMax(mode, Cp);
      return { tr, trMax: m.tr, lo, hi, cbOver: Cp > m.cb, slow: tr > m.tr, weak: Rk < lo, window: hi >= lo, devices: Math.floor(Cp / SPEC.i2c.ci) };
    }
  };

  /* ── Facts that will go stale (as of Nov 2026); sources and dates in BRIEF.md. ── */
  const FRONTIER = {
    asOf: '2026-11',
    ucie3: '2025-08-05', ucie3GT: [48, 64],
    cxl4: '2025-11-18', cxl4GT: 128,
    xeon6plus: '2026-06', xeon6plusCores: 288,
    novaLakeLeak: { dmiLanes: [2, 4], gen: 5 }     // leaked, not announced by Intel
  };

  /* ── numbers quoted in the prose. Each entry is [value, decimals, kind]; the page formats it for the current
     language and tests/models.cjs pins every one. ── */
  function prose() {
    const P = SPEC.pci, s1 = PCI.share(6, 30, 16), s1b = PCI.share(6, 30, 64);
    const C14 = LINE.defaultLoad(), Lr = LINE.loaded(C14), tr14 = LINE.trips(C14), tr20 = LINE.trips(20);
    const nb0 = NB.run({ cpu: 6.4, gpu: 2.1, sb: 0.3, gbe: NB.gbe }), nb1 = NB.run({ cpu: 6.4, gpu: 0, sb: 0, gbe: 0 });
    const il = NUMA.interleave();
    const bd = BOARD.run({ plat: 'intel', ssd1: 'read', ssd2: 'read', usb: true }), bda = BOARD.run({ plat: 'amd', ssd1: 'read', ssd2: 'read', usb: true });
    const bcopy = BOARD.run({ plat: 'intel', copy: true });
    const r8 = NOC.ring(8), m16 = NOC.mesh(16), r16 = NOC.ring(16), r64 = NOC.ring(64), m64 = NOC.mesh(64);
    const i0 = I2C.check('fm', 3.3, 4.7, 200), i2 = I2C.check('fm', 3.3, 4.7, 400);
    return {
      // ch1
      pciPeak: [P.peakMBps, 0], t35used: [P.table35.reduce((s, r) => s + PCI.rowUs(r[5]), 0), 2], t35need: [P.table35Total[0], 0],
      eff16: [PCI.effMBps(16), 0], eff1: [PCI.effMBps(1), 1], s1each: [s1.each, 1], s1p2p: [s1.p2pEach, 0], s1tot: [s1.p2pTotal, 0],
      s1wait: [s1.waitUs, 1], s1bEach: [s1b.each, 1], s1bWait: [s1b.waitUs, 1], initLat: [P.initLat, 0],
      // ch2
      tp33: [LINE.tpropBudget(33.333, 33), 0], tp66: [LINE.tpropBudget(66.667, 66), 0], cload: [C14, 2], tps: [Lr.tps, 0], zl: [Lr.z, 0],
      rs: [LINE.rs(), 1], v1: [tr14.v1, 0, 'pct'], v1x2: [tr14.after1, 0, 'pct'], n33: [LINE.maxLoads(33.333, 33, C14), 0], n66: [LINE.maxLoads(66.667, 66, C14), 0],
      v1b: [tr20.after1, 0, 'pct'], n33b: [LINE.maxLoads(33.333, 33, 20), 0],
      n33t190: [(() => { const t = LINE.tpd; LINE.tpd = 190; const n = LINE.maxLoads(33.333, 33, LINE.defaultLoad()); LINE.tpd = t; return n; })(), 0],
      n33z100: [(() => { const z = LINE.z0; LINE.z0 = 100; const n = LINE.maxLoads(33.333, 33, LINE.defaultLoad()); LINE.z0 = z; return n; })(), 0],
      // ch3
      nbCpu: [nb0.rate.cpu, 1], nbSb: [nb0.rate.sb * 1000, 0], nbCpuAlone: [nb1.rate.cpu, 1], hiM: [SPEC.i875.hi * 1000, 0],
      sata2: [2 * NB.sataEach * 1000, 0],
      // ch4
      zLoc: [SPEC.zep.local, 0], zp: [SPEC.zep.pkg, 0], zr: [SPEC.zep.remote, 0], ilLat: [NUMA.lat(il), 1], ilX: [NUMA.lat(il) / SPEC.zep.local, 2],
      bwLocal: [NUMA.bw({ pkg: 0, remote: 0 }), 1], bwIl: [NUMA.bw(il), 1], sockBW: [NUMA.socketBW(), 1], ilRemote: [il.remote, 0, 'pct'], ilPkg: [il.pkg, 1, 'pct'],
      // ch5
      dmi: [BOARD.uplink('intel'), 2], amdLink: [BOARD.uplink('amd'), 2], bdSsd: [bd.rate.ssd1, 2], bdWant: [bd.want.up, 2],
      bdaSsd: [bda.rate.ssd1, 2], copyI: [bcopy.rate.ssd2, 2], nvme: [SPEC.nvme, 2], usb20: [SPEC.usb20g, 1],
      // ch6
      r8: [r8.avg, 2], m16: [m16.avg, 2], r16: [r16.avg, 2], r64: [r64.avg, 1], m64: [m64.avg, 1], r64max: [r64.max, 0], m64max: [m64.max, 0],
      thR64: [1 / r64.gamma, 3], thM64: [1 / m64.gamma, 2], thRatio64: [r64.gamma / m64.gamma, 0],
      // ch7
      w25: [D2D.watts(1000, 'd25'), 1], w2: [D2D.watts(1000, 'd2'), 1], wIfop: [D2D.watts(1000, 'ifop'), 0], wLp5: [D2D.watts(1000, 'lp5'), 1],
      e25: [D2D.edgeMm(1000, 'd25'), 2], e2: [D2D.edgeMm(1000, 'd2'), 1],
      // ch8
      i2cTr: [i0.tr, 0], i2cHi: [i0.hi * 1000, 0], i2cLo: [i0.lo * 1000, 0], i2cTr400: [i2.tr, 0], i2cK: [SPEC.i2c.k, 4],
      i2cDev: [i0.devices, 0], i2cCi: [SPEC.i2c.ci, 0], i2cFirst: [SPEC.i2c.first, 0],
      // numbers drawn on the diagrams
      fsbG: [SPEC.i875.fsb, 1], memG: [SPEC.i875.mem, 1], agpG: [SPEC.i875.agp, 1], csaM: [SPEC.i875.csa * 1000, 0], usbPorts: [SPEC.i875.usbPorts, 0],
      r8max: [r8.max, 0], m16max: [m16.max, 0], pj2: [SPEC.ucie.d2.pj, 1], pj25: [SPEC.ucie.d25.pj, 1], reach2: [SPEC.ucie.d2.reach, 0], reach25: [SPEC.ucie.d25.reach, 0],
      dmiLanes: [SPEC.z890.dmiLanes, 0], pchLanes: [SPEC.z890.chipsetLanes, 0], hsio: [SPEC.z890.hsio, 0], sataPorts: [SPEC.z890.sata, 0], cpuGen5: [SPEC.z890.cpuGen5, 0],
      espi: [SPEC.z890.espiCs, 0], amdTotal: [SPEC.am5.total, 0], amdUsable: [SPEC.am5.usable, 0], upiGT: [SPEC.xeon6767p.upiGT, 0], upiLinks: [SPEC.xeon6767p.upiLinks, 0],
      xch: [SPEC.xeon6767p.channels, 0], ucie3a: [SPEC.ucie.v3GT[0], 0], ucie3b: [SPEC.ucie.v3GT[1], 0], cxl4GT: [FRONTIER.cxl4GT, 0], x6pCores: [FRONTIER.xeon6plusCores, 0],
      d3pj: [SPEC.ucie.d3.pj, 2], ucieRt: [SPEC.ucie.rt, 0], ifopPj: [SPEC.zep.ifopPj, 0],
      cin: [SPEC.pci.cin, 0], stub: [SPEC.pci.stubIn, 1], slot: [SPEC.pci.slotIn, 1], tpd: [LINE.tpd, 0], z0: [LINE.z0, 0], sliceUs: [SPEC.pci.sliceUs, 0]
    };
  }

  /* ── formatting: language-aware ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }

  /* ── live sentences: each returns { key, v } so the page can fill a whole-sentence template ── */
  const say = {
    bus(N, d, D) {
      const v = PCI.share(N, d, D);
      if (N === 1) return { key: 'ch1.say.one', v };
      return { key: v.U <= 1 ? 'ch1.say.fits' : 'ch1.say.full', v };
    },
    line(N, f, comp, C) {
      const T = LINE.tpropBudget(f, comp), need = LINE.needNs(N, C), tr = LINE.trips(C), v = { T, need, k: tr.k, nmax: LINE.maxLoads(f, comp, C), fmax: LINE.fmax(N, comp, C) };
      if (T <= 0) return { key: 'ch2.say.nobudget', v };
      if (need <= T) return { key: tr.k === 1 ? 'ch2.say.ok' : 'ch2.say.ok2', v };
      return { key: tr.k === 1 ? 'ch2.say.late' : 'ch2.say.late2', v };
    },
    nb(d) {
      const r = NB.run(d), v = { cpu: r.rate.cpu || 0, want: d.cpu, mem: r.load.mem };
      if (d.cpu <= 0) return { key: 'ch3.say.nocpu', v };
      if (r.rate.cpu >= d.cpu - 1e-9) return { key: 'ch3.say.full', v };
      return { key: 'ch3.say.short', v };
    },
    numa(p, m) {
      const s = NUMA.shares(p), v = { lat: NUMA.lat(p), x: NUMA.lat(p) / SPEC.zep.local, bw: NUMA.bw(p, m), s };
      if (s.local >= 1 - 1e-9) return { key: 'ch4.say.local', v };
      if (s.remote >= 0.5) return { key: 'ch4.say.far', v };
      return { key: 'ch4.say.mix', v };
    },
    board(o) {
      const r = BOARD.run(o), v = { up: r.load.up, dn: r.load.dn, U: r.U, slow: r.slowest, over: r.over };
      if (!r.behind) return { key: o.cpuSsd ? 'ch5.say.cpuonly' : 'ch5.say.idle', v };
      if (r.over <= 1 + 1e-9) return { key: o.copy || o.ssd2 === 'write' ? 'ch5.say.duplex' : 'ch5.say.fits', v };
      return { key: 'ch5.say.over', v };
    },
    noc(N) {
      const r = NOC.ring(N), m = NOC.mesh(N), v = { r: r.avg, m: m.avg, a: m.a, b: m.b, ratio: r.gamma / m.gamma };
      return { key: r.avg > m.avg + 1e-9 ? 'ch6.say.mesh' : 'ch6.say.tie', v };
    },
    d2d(GBps, k) {
      const v = { w: D2D.watts(GBps, k), edge: D2D.edgeMm(GBps, k), pj: D2D.pj(k) };
      return { key: v.edge == null ? 'ch7.say.noedge' : 'ch7.say.edge', v };
    },
    i2c(mode, vdd, Rk, Cp) {
      const c = I2C.check(mode, vdd, Rk, Cp);
      if (c.cbOver) return { key: 'ch8.say.cb', v: c };
      if (!c.window) return { key: 'ch8.say.nowin', v: c };
      if (c.slow) return { key: 'ch8.say.slow', v: c };
      if (c.weak) return { key: 'ch8.say.weak', v: c };
      return { key: 'ch8.say.ok', v: c };
    }
  };

  return { SPEC, PCI, LINE, maxmin, NB, NUMA, BOARD, NOC, D2D, I2C, FRONTIER, fmt, say, clamp, prose };
});
