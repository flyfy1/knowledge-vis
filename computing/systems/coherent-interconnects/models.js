/* How chips share memory across a wire (CXL, NVLink, UALink): the page's models.
   Every model is a named result or a small version of the real mechanism: Little's law for outstanding cache-line
   requests against a DMA copy; the CXL flit slot accounting of Das Sharma, Blankenship & Berger (2023, §6.3); a
   protocol stepper that emits the CXL.io / CXL.cache / CXL.mem message names of the same survey (§3–5); a skewed
   (Zipf) page-popularity model for memory tiering; statistical multiplexing of memory demand for pooling (Pond,
   ASPLOS 2023); a directory that issues CXL 3.0 back-invalidate snoops; Patarasuk & Yuan's ring all-reduce (2009)
   run on real numbers, its time bound 2(N−1)/N · S / B, and the two-level (hierarchical) version.
   Bandwidth convention: every GB/s in this file is PER DIRECTION unless the name ends in Bidir. NVIDIA quotes NVLink
   as the sum of both directions (900 / 1,800 / 3,600 GB/s per GPU); those figures are kept as published in *Bidir
   fields and halved where a model needs them.
   Real figures sit in SRC / FRONTIER with their source and the date opened (also listed in BRIEF.md). Constants
   chosen for the model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.LinkModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LinkModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const KiB = 1024, MiB = 1048576, GiB = 1073741824, LINE = 64;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // mulberry32: seeded, so every simulation repeats exactly
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ── Sourced figures (opened 2026-11-15; URLs in BRIEF.md) ── */
  const SRC = {
    // PCIe data rate per lane per direction, as in how-pcie-works (GT/s × 128/130 / 8 for Gen5)
    pcie5: { gts: 32, enc: 128 / 130 },
    // D. Das Sharma, R. Blankenship, D. S. Berger, "An Introduction to the Compute Express Link (CXL) Interconnect",
    // arXiv 2306.11227 (2023; ACM Computing Surveys 2024). §3.2 68-byte flit = 2 B protocol ID + 64 B + 2 B CRC; §6.1
    // port round trip 21–25 ns, spec pin-to-pin targets 80 ns (CXL.mem) and 50 ns (snoop); Table 2 estimates;
    // §6.3 realizable bandwidth formulas; §5.3–5.5 back-invalidate, CacheID 4 bits, PBR 12-bit IDs; MLD up to 16 LDs.
    cxl: {
      flit68: { bytes: 68, pid: 2, payload: 64, crc: 2, slots: 4 }, flit256: { bytes: 256, slots: 16 },
      portRtLo: 21, portRtHi: 25, pinMem: 80, pinSnoop: 50,
      estDirect: 170, estSwitch: 250, estPeerSwitch: 220, switchAdderLo: 62, switchAdderHi: 70,
      eff68: 0.939, eff68cache: 0.94, eff256: 15 / 16,
      cacheIdBits: 4, pbrIdBits: 12, mldMax: 16, gfdNodes: 4096, mldNodes: 32,
      dates: { v1: '2019-03', v11: '2019-09', v2: '2020-11', v3: '2022-08', v4: '2025-11-18' },
      gts: { v1: 32, v2: 32, v3: 64, v4: 128 }
    },
    // J. Liu, H. Hadian, H. Xu, D. S. Berger, H. Li, "Dissecting CXL Memory Performance at Scale", arXiv 2409.14317v1
    // (2024-09-22), Table 1, measured with Intel MLC. Local = same socket (EMR2S: 16×DDR5, two sockets).
    liu: {
      local: { name: 'EMR2S', lat: 111, bw: 246 }, remote: { lat: 193, bw: 120 },
      devs: {
        a: { lat: 214, bw: 24, width: 8, mem: 'DDR4', asic: true },
        b: { lat: 271, bw: 22, width: 8, mem: 'DDR5', asic: true },
        c: { lat: 394, bw: 18, width: 8, mem: 'DDR4', asic: false },
        d: { lat: 239, bw: 52, width: 16, mem: 'DDR5', asic: true }
      }
    },
    // H. Li et al., "Pond: CXL-Based Memory Pooling Systems for Cloud Platforms", ASPLOS 2023 (arXiv 2203.00241):
    // pools of 8–16 sockets add 70–90 ns over NUMA-local DRAM, rack scale > 180 ns; Intel NUMA-local 78 ns,
    // remote 142 ns; switches add at least 70 ns; stranded memory 3–27 % (p95); pooling 16–32 sockets cuts demand
    // 10 %; Pond cuts DRAM cost 7 % within 1–5 % of local performance.
    pond: { addLo: 70, addHi: 90, rack: 180, local: 78, remote: 142, switchAdd: 70, strandLo: 3, strandHi: 27, poolSave: 10, costSave: 7, perfLo: 1, perfHi: 5, poolLo: 8, poolHi: 16, saveLo: 16, saveHi: 32, p: 95 },
    // Sun et al., "Demystifying CXL Memory with Genuine CXL-Ready Systems and Devices", MICRO 2023 (arXiv 2303.15375):
    // true CXL memory up to 26 % lower latency than emulating it with a remote NUMA node.
    sun: { vsEmu: 26 },
    // NVIDIA NVLink and NVLink Switch page (nvidia.com/en-us/data-center/nvlink, opened 2026-11-15): per-GPU
    // bandwidth (both directions summed), max links per GPU, NVLink Switch aggregate per domain. "Preliminary" for Rubin.
    nvlink: {
      4: { gpuBidir: 900, links: 18, arch: 'Hopper', domain: 8, aggTB: 7.2 },
      5: { gpuBidir: 1800, links: 18, arch: 'Blackwell', domain: 72, aggTB: 130 },
      6: { gpuBidir: 3600, links: 36, arch: 'Rubin', domain: 72, aggTB: 260 }
    },
    // NVIDIA Vera Rubin NVL72 page (opened 2026-11-15): 72 Rubin GPUs, 36 Vera CPUs, 288 GB HBM4 per GPU; "ramping into
    // full production". NVLink page: every NVLink Switch has SHARP engines for in-network reductions and multicast.
    // Grace Hopper blog (2022-11-10): NVLink 4 accesses peer memory with direct loads, stores and atomics.
    rubin: { gpus: 72, cpus: 36, hbmGB: 288 },
    // NVIDIA developer blog, "NVIDIA ConnectX-8 SuperNICs ..." (2025-05-18): 800 Gb/s, in GB300 NVL72 and HGX B300.
    // ConnectX-7: 400 Gb/s (one per GPU in DGX H100). Gb/s → GB/s per direction: ÷ 8.
    nic: { cx7Gbps: 400, cx8Gbps: 800 },
    // UALink 200G 1.0: Consortium press release 2025-04-08 and white paper (Kalyanasundharam): 200 GT/s per lane
    // (212.5 GT/s signalling), x1/x2/x4 links, a 4-lane station 800 Gb/s in each of TX and RX, up to 1,024
    // accelerators, 10-bit routing ID, 64 B TL flits in 640 B DL flits, Ethernet (802.3) PHY; read, write, atomics.
    ualink: { laneGTs: 200, signalGTs: 212.5, stationGbps: 800, maxAcc: 1024, idBits: 10, tlFlit: 64, dlFlit: 640, released: '2025-04-08', v2: '2026-04-07' },
    // NVIDIA developer blog, "NVIDIA Grace Hopper Superchip Architecture In-Depth" (2022-11-10): NVLink-C2C up to
    // 900 GB/s total, 450 GB/s per direction, 7× PCIe Gen5 ×16, 1.3 pJ/bit; Grace up to 512 GB LPDDR5X at up to
    // 546 GB/s; Hopper up to 96 GB HBM3 at up to 3,000 GB/s; ATS: one page table for CPU and GPU.
    gh: { c2cBidir: 900, c2c: 450, vsPcie: 7, pjBit: 1.3, lpddrGB: 512, lpddrBW: 546, hbmGB: 96, hbmBW: 3000, date: '2022-11-10' },
    // AMD Instinct MI300A data sheet (2025): 24 Zen 4 cores in three chiplets, six XCDs × 38 CUs = 228 CUs, 128 GB HBM3
    // shared coherently by CPU and GPU, 5.3 TB/s peak, 256 MB Infinity Cache, 4th Gen Infinity Fabric.
    mi300a: { cores: 24, ccds: 3, xcds: 6, cuPer: 38, cus: 228, hbmGB: 128, hbmTB: 5.3, icMB: 256 },
    // Patarasuk & Yuan, J. Parallel Distrib. Comput. 69 (2009) 117–124: Lemma 4, at least one process must
    // communicate 2(N−1)/N · X items; the ring algorithm meets it.
    ring: { year: 2009 }
  };

  /* ── TUNED constants (chosen for the model; the page says so and what halving/doubling does) ── */
  const TUNED = {
    dmaSetupUs: 10,        // ch1: one DMA copy's fixed cost (driver call, descriptor, completion), µs
    coherentLatNs: SRC.cxl.estDirect,   // ch1: one cache-line round trip over CXL.cache (Table 2 estimate, not tuned)
    mlp: 64,               // ch1: device's outstanding cache-line requests (default of the three choices)
    zipfS: 0.9,            // ch5: page popularity exponent (default)
    pages: 4096,           // ch5: number of pages in the tiering model
    poolCv: 0.35,          // ch6: spread of one host's memory demand (coefficient of variation)
    poolRho: 0.5,          // ch6: correlation between hosts' demands (default of the slider)
    alphaUs: { pcie: 3, nvlink: 2, net: 5 }   // ch9/ch10: fixed cost of one ring step, µs
  };

  /* ── link arithmetic ── */
  const pcieGBps = (w) => w * SRC.pcie5.gts * SRC.pcie5.enc / 8;          // PCIe 5.0, per direction
  const rawGBps = (gts, w) => gts * w / 8;                                  // CXL raw per direction (no 128b/130b in flit mode)
  const nvPerDir = g => SRC.nvlink[g].gpuBidir / 2;                         // GB/s per direction per GPU
  const nvLinkPerDir = g => nvPerDir(g) / SRC.nvlink[g].links;              // GB/s per direction per link
  const nicGBps = gbps => gbps / 8;
  const ualinkStationGBps = () => SRC.ualink.stationGbps / 8;

  /* ── ch1: copy the buffer, or read the lines you need coherently ──
     copy:   T = t0 + S / B_dma                                   (one DMA over PCIe 5.0 ×16)
     share:  T = L + n·64 / min(B_cap, M·64 / L), n = ceil(f·S / 64)   (Little's law: M requests in flight, each L) */
  const SHARE = { sizesLog: [12, 30], fracs: [1, 0.25, 0.05, 0.01], mlps: [16, 64, 256] };
  function copyShare(S, f, M, o) {
    o = o || {};
    const t0 = (o.t0 != null ? o.t0 : TUNED.dmaSetupUs) * 1e-6, L = (o.L != null ? o.L : TUNED.coherentLatNs) * 1e-9;
    const Bdma = pcieGBps(16) * 1e9, Bcap = flitBW('cacheRd', '68', 16).real * 1e9;
    const Blit = Math.min(Bcap, M * LINE / L), n = Math.ceil(f * S / LINE);
    const tCopy = t0 + S / Bdma, tShare = L + n * LINE / Blit;
    return { S, f, M, tCopy, tShare, Bdma: Bdma / 1e9, Bshare: Blit / 1e9, littleBound: M * LINE / L < Bcap, n, win: tShare < tCopy ? 'share' : 'copy' };
  }
  // buffer size where the two times are equal (closed form); null when one side always wins
  function crossover(f, M, o) {
    const r = copyShare(MiB, f, M, o), t0 = ((o && o.t0 != null) ? o.t0 : TUNED.dmaSetupUs) * 1e-6, L = ((o && o.L != null) ? o.L : TUNED.coherentLatNs) * 1e-9;
    const a = f / (r.Bshare * 1e9) - 1 / (r.Bdma * 1e9);   // seconds per byte the share side loses
    if (a <= 0) return null;
    return (t0 - L) / a;
  }

  /* ── ch3: realizable bandwidth per direction (Das Sharma et al. §6.3) ──
     68 B flit (CXL 1.1/2.0, 32 GT/s): CXL.mem read  = 0.939 · 8/9 · raw     (1 header slot per 2 lines + 8 data slots)
                                       CXL.cache read = 16/17 · 0.94 · raw    (4 data headers share one slot)
                                       CXL.cache write = 4/6 · 0.94 · raw     (3 headers take 2 slots per line)
     256 B flit (CXL 3.x, 64 GT/s):    CXL.cache read = 14/16 · raw ; CXL.cache write = 4/6.5 · 15/16 · raw
                                       CXL.mem read: not given in the survey; DERIVED here as 15/16 · 8/9 · raw */
  const FLITBW = {
    '68': { gts: 32, memRd: { eff: SRC.cxl.eff68, data: 8, slots: 9 }, cacheRd: { eff: SRC.cxl.eff68cache, data: 16, slots: 17 }, cacheWr: { eff: SRC.cxl.eff68cache, data: 4, slots: 6 } },
    '256': { gts: 64, memRd: { eff: SRC.cxl.eff256, data: 8, slots: 9, derived: true }, cacheRd: { eff: 1, data: 14, slots: 16 }, cacheWr: { eff: SRC.cxl.eff256, data: 4, slots: 6.5 } }
  };
  function flitBW(kind, mode, w) {
    const m = FLITBW[mode], k = m[kind], raw = rawGBps(m.gts, w);
    const eff = k.eff * k.data / k.slots;
    return { raw, real: raw * eff, eff, linkEff: k.eff, data: k.data, slots: k.slots, derived: !!k.derived, gts: m.gts, ddr5: raw * eff / DDR5_4800 };
  }
  const DDR5_4800 = 4800e6 * 8 / 1e9;   // one 64-bit DDR5-4800 channel: 38.4 GB/s

  /* ── ch4: a two-line protocol stepper. Line X lives in host memory, line Y in the device's memory (HDM).
     State: the CPU's copy of X (M/E/S/I), the device's copy of X, the CPU's copy of Y. Each action returns the CXL
     messages it costs, named as in Das Sharma et al. (D2H/H2D for CXL.cache, M2S/S2M for CXL.mem, BISnp/BIRsp for
     CXL 3.0 back-invalidate, TLPs for CXL.io). Simplified: one CPU cache, no races, no host-side snoop of other cores. */
  const TYPES = { 1: ['io', 'cache'], 2: ['io', 'cache', 'mem'], 3: ['io', 'mem'] };
  const ACTIONS = ['cfg', 'devRdX', 'devWrX', 'cpuRdX', 'cpuWrX', 'cpuRdY', 'devWrY'];
  const NEEDS = { cfg: ['io'], devRdX: ['cache'], devWrX: ['cache'], cpuRdX: ['cache'], cpuWrX: ['cache'], cpuRdY: ['mem'], devWrY: ['mem', 'cache'] };
  const allowed = (type, act) => NEEDS[act].every(p => TYPES[type].includes(p));
  const freshLines = () => ({ hX: 'I', dX: 'I', hY: 'I' });
  function protoStep(type, st, act) {
    const s = Object.assign({}, st), msgs = [], m = (p, d, name) => msgs.push({ p, d, name });
    if (!allowed(type, act)) return { st: s, msgs, ok: false, act };
    let note = 'done';
    switch (act) {
      case 'cfg': m('io', 'h2d', 'CfgRd0 (TLP)'); m('io', 'd2h', 'CplD (TLP)'); break;
      case 'devRdX':
        if (s.dX !== 'I') { note = 'hit'; break; }
        m('cache', 'd2h', 'D2H Req RdShared');
        if (s.hX === 'M' || s.hX === 'E') s.hX = 'S';
        m('cache', 'h2d', 'H2D Rsp GO-S'); m('cache', 'h2d', 'H2D Data'); s.dX = 'S'; break;
      case 'devWrX':
        if (s.dX === 'M' || s.dX === 'E') { s.dX = 'M'; note = 'silent'; break; }
        m('cache', 'd2h', 'D2H Req RdOwn');
        if (s.hX !== 'I') { s.hX = 'I'; note = 'hostInval'; }
        m('cache', 'h2d', 'H2D Rsp GO-E'); if (st.dX === 'I') m('cache', 'h2d', 'H2D Data');
        s.dX = 'M'; break;
      case 'cpuRdX':
        if (s.hX !== 'I' && s.dX !== 'M') { note = 'hit'; break; }
        if (s.dX === 'M' || s.dX === 'E') { m('cache', 'h2d', 'H2D Req SnpData'); m('cache', 'd2h', s.dX === 'M' ? 'D2H Rsp RspSFwdM' : 'D2H Rsp RspSHitSE'); if (s.dX === 'M') m('cache', 'd2h', 'D2H Data'); s.dX = 'S'; note = 'snooped'; }
        else note = 'local';
        s.hX = 'S'; break;
      case 'cpuWrX':
        if (s.dX !== 'I') { m('cache', 'h2d', 'H2D Req SnpInv'); m('cache', 'd2h', s.dX === 'M' ? 'D2H Rsp RspIFwdM' : 'D2H Rsp RspIHitSE'); if (s.dX === 'M') m('cache', 'd2h', 'D2H Data'); s.dX = 'I'; note = 'snooped'; }
        else note = s.hX === 'M' ? 'silent' : 'local';
        s.hX = 'M'; break;
      case 'cpuRdY':
        if (s.hY !== 'I') { note = 'hit'; break; }
        m('mem', 'h2d', 'M2S Req MemRd'); m('mem', 'd2h', 'S2M DRS MemData'); if (type === 2) m('mem', 'd2h', 'S2M NDR Cmp');
        s.hY = 'S'; break;
      case 'devWrY':
        if (s.hY === 'I') { note = 'local'; break; }
        m('mem', 'd2h', 'S2M BISnpInv'); if (s.hY === 'M') m('mem', 'h2d', 'M2S RwD MemWr'); m('mem', 'h2d', 'M2S BIRspI');
        s.hY = 'I'; note = 'bi'; break;
    }
    return { st: s, msgs, ok: true, act, note };
  }

  /* ── ch5: tiering. P pages, popularity ∝ 1 / rank^s (Zipf, s TUNED). Demote the coldest fraction p to CXL (or a
     random fraction p, for comparison). q = share of accesses that land on CXL.
     idle latency  = (1 − q)·L_local + q·L_cxl
     peak bandwidth when the program can use both = min(B_local / (1 − q), B_cxl / q)        (each side saturates) */
  const zipfCache = new Map();
  function zipfCum(P, s) {
    const k = P + ':' + s; if (zipfCache.has(k)) return zipfCache.get(k);
    const w = new Float64Array(P); let tot = 0;
    for (let i = 0; i < P; i++) { w[i] = 1 / Math.pow(i + 1, s); tot += w[i]; }
    const cum = new Float64Array(P + 1); for (let i = 0; i < P; i++) cum[i + 1] = cum[i] + w[i] / tot;   // cum[k] = share of the hottest k pages
    zipfCache.set(k, cum); return cum;
  }
  const TIER = { devs: ['a', 'b', 'd', 'sw'], ps: [0, 1] };
  function tierDev(key) {
    if (key === 'sw') return { lat: SRC.cxl.estSwitch, bw: SRC.liu.devs.d.bw, est: true };   // pooled behind a switch: Table 2 estimate, ×16 bandwidth of CXL-D
    return SRC.liu.devs[key];
  }
  function tier(p, s, devKey, placement) {
    const P = TUNED.pages, cum = zipfCum(P, s), dev = tierDev(devKey), loc = SRC.liu.local;
    const k = Math.round(clamp(p, 0, 1) * P);
    const q = placement === 'random' ? k / P : 1 - cum[P - k];
    const lat = (1 - q) * loc.lat + q * dev.lat;
    const bw = q <= 0 ? loc.bw : q >= 1 ? dev.bw : Math.min(loc.bw / (1 - q), dev.bw / q);
    return { p: k / P, q, lat, bw, slow: lat / loc.lat - 1, dev, loc, bwBest: loc.bw + dev.bw, qBest: dev.bw / (loc.bw + dev.bw) };
  }
  // largest demoted share p whose idle latency stays within `pct` of local (hot pages kept local)
  function tierReach(s, devKey, pct) { let best = 0; for (let k = 0; k <= TUNED.pages; k += 8) { const r = tier(k / TUNED.pages, s, devKey, 'hot'); if (r.slow <= pct + 1e-12) best = r.p; } return best; }

  /* ── ch6: pooling as statistical multiplexing. N hosts, each needing D_i (lognormal, mean 1, cv TUNED).
     Without a pool every host is sized for its own 99th percentile. With a pool every host keeps its mean locally and
     the pool is sized for the 99th percentile of the summed overflow Σ max(0, D_i − 1). Monte Carlo, seeded. */
  const POOL = { ns: [1, 2, 4, 8, 16, 32, 64], rhos: [0, 0.25, 0.5, 0.75, 1], trials: 20000, q: 0.99 };
  function gauss(r) { const u1 = Math.max(r(), 1e-12), u2 = r(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
  // lognormal with mean 1; z mixes a shared factor z0 (weight √ρ) with the host's own (weight √(1 − ρ))
  function lognorm(z, cv) { const s2 = Math.log(1 + cv * cv); return Math.exp(-s2 / 2 + Math.sqrt(s2) * z); }
  const quant = (arr, q) => { const a = Float64Array.from(arr).sort(); return a[Math.min(a.length - 1, Math.floor(q * a.length))]; };
  const poolCache = new Map();
  function pool(N, rho, cv) {
    cv = cv == null ? TUNED.poolCv : cv; rho = rho == null ? TUNED.poolRho : rho;
    const key = [N, rho, cv].join(':'); if (poolCache.has(key)) return poolCache.get(key);
    const r = rng(41), T = POOL.trials, single = [], over = [], a = Math.sqrt(rho), b = Math.sqrt(1 - rho);
    for (let t = 0; t < T; t++) { const z0 = gauss(r); let o = 0; for (let i = 0; i < N; i++) { const d = lognorm(a * z0 + b * gauss(r), cv); if (i === 0) single.push(d); o += Math.max(0, d - 1); } over.push(o); }
    const own = quant(single, POOL.q), poolSize = quant(over, POOL.q);
    const without = N * own, withPool = N + poolSize;
    const tierKey = N <= 1 ? 'none' : N <= SRC.cxl.mldMax ? 'mld' : 'switch';
    const add = tierKey === 'none' ? 0 : tierKey === 'mld' ? (SRC.pond.addLo + SRC.pond.addHi) / 2 : SRC.cxl.estSwitch - SRC.pond.local;
    const res = { N, rho, cv, own, poolSize, without, withPool, saved: N <= 1 ? 0 : Math.max(0, 1 - withPool / without), tierKey, add };
    poolCache.set(key, res); return res;
  }

  /* ── ch7: a memory device shared by H hosts keeps a directory (I / S with a sharer set / E with an owner). A write
     back-invalidates every other sharer (BISnp); a read of a line another host owns back-invalidates the owner; when
     the directory is full, the least recently used entry is evicted and every holder of it is back-invalidated.
     W shared lines, uniform choice, seeded. Counts BISnp messages per 1,000 accesses. */
  const DIR = { W: 1024, n: 20000, hosts: [1, 2, 4, 8, 16], writes: [0, 0.01, 0.05, 0.2, 0.5], caps: [0.25, 0.5, 1, 2] };
  const dirCache = new Map();
  function fabricDir(H, wf, cap) {
    const key = [H, wf, cap].join(':'); if (dirCache.has(key)) return dirCache.get(key);
    const W = DIR.W, C = Math.max(1, Math.round(cap * W)), r = rng(7 + H * 131);
    const dir = new Map();   // line → { st: 'S'|'E', who: Set }, insertion order = LRU order
    let bi = 0, biWrite = 0, biRead = 0, biCap = 0, writes = 0, writesBI = 0, fanSum = 0, misses = 0;
    for (let i = 0; i < DIR.n; i++) {
      const h = Math.floor(r() * H), line = Math.floor(r() * W), isW = r() < wf;
      let e = dir.get(line);
      if (e) { dir.delete(line); dir.set(line, e); }
      else {
        misses++;
        if (dir.size >= C) { const [vl, ve] = dir.entries().next().value; dir.delete(vl); bi += ve.who.size; biCap += ve.who.size; }
        e = { st: 'S', who: new Set() }; dir.set(line, e);
      }
      if (isW) {
        writes++; let k = 0; for (const o of e.who) if (o !== h) k++;
        if (k) { writesBI++; fanSum += k; bi += k; biWrite += k; }
        e.st = 'E'; e.who = new Set([h]);
      } else {
        if (e.st === 'E' && !e.who.has(h)) { bi += 1; biRead += 1; e.st = 'S'; }
        e.who.add(h);
      }
    }
    const per = x => x * 1000 / DIR.n;
    const res = { H, wf, cap, C, bi: per(bi), biWrite: per(biWrite), biRead: per(biRead), biCap: per(biCap), writes, writeBIshare: writes ? writesBI / writes : 0, fanout: writesBI ? fanSum / writesBI : 0, missRate: misses / DIR.n };
    dirCache.set(key, res); return res;
  }

  /* ── ch9: ring all-reduce (Patarasuk & Yuan 2009), run on real numbers ──
     N GPUs, each holding N chunks. Reduce-scatter: at step k (0 … N−2) GPU g sends chunk (g − k) mod N to g + 1, which
     adds it to its own. All-gather: at step k GPU g sends chunk (g + 1 − k) mod N to g + 1, which overwrites. */
  const RING = { ns: [3, 4, 5] };
  function ringInit(N, seed) {
    const r = rng(seed || 3);
    return Array.from({ length: N }, () => Array.from({ length: N }, () => 1 + Math.floor(r() * 9)));
  }
  function ringSteps(N, seed) {
    const init = ringInit(N, seed), states = [init.map(a => a.slice())], sends = [];
    let cur = init.map(a => a.slice());
    for (let k = 0; k < 2 * (N - 1); k++) {
      const rs = k < N - 1, kk = rs ? k : k - (N - 1), nxt = cur.map(a => a.slice()), step = [];
      for (let g = 0; g < N; g++) {
        const c = rs ? ((g - kk) % N + N) % N : ((g + 1 - kk) % N + N) % N, to = (g + 1) % N;
        if (rs) nxt[to][c] = cur[to][c] + cur[g][c]; else nxt[to][c] = cur[g][c];
        step.push({ from: g, to, chunk: c });
      }
      cur = nxt; states.push(cur.map(a => a.slice())); sends.push({ phase: rs ? 'rs' : 'ag', sends: step });
    }
    const total = init[0].map((_, c) => init.reduce((s, a) => s + a[c], 0));
    return { N, init, states, sends, total, chunksSent: 2 * (N - 1) };
  }
  // time model: T = 2(N−1)/N · S / B + 2(N−1) · α
  const FABRICS = {
    pcie5: { bw: () => pcieGBps(16), alpha: 'pcie' },
    nv4: { bw: () => nvPerDir(4), alpha: 'nvlink' },
    nv5: { bw: () => nvPerDir(5), alpha: 'nvlink' },
    nv6: { bw: () => nvPerDir(6), alpha: 'nvlink' },
    ib400: { bw: () => nicGBps(SRC.nic.cx7Gbps), alpha: 'net' },
    ib800: { bw: () => nicGBps(SRC.nic.cx8Gbps), alpha: 'net' }
  };
  const FABRIC_KEYS = Object.keys(FABRICS);
  const BYTES_PER_PARAM = 2;   // BF16 gradients
  function allreduce(params, N, fab, o) {
    const S = params * BYTES_PER_PARAM, F = FABRICS[fab], B = F.bw() * 1e9;
    const a = ((o && o.alphaScale) || 1) * TUNED.alphaUs[F.alpha] * 1e-6;
    const perGpu = 2 * (N - 1) / N * S, tBw = perGpu / B, tLat = 2 * (N - 1) * a;
    return { S, N, fab, B: B / 1e9, perGpu, tBw, tLat, t: tBw + tLat };
  }
  const AR = { params: [1e9, 8e9, 70e9, 405e9], ns: [8, 72] };

  /* ── ch10: two levels. G GPUs per scale-up domain (NVLink 5), R = N / G domains joined by one NIC per GPU.
     Reduce-scatter inside the domain, all-reduce each 1/G shard across domains (G rings in parallel), all-gather inside.
     T = 2(G−1)/G · S/B_up + 2(R−1)/R · (S/G)/B_out + 2(G−1)·α_up + 2(R−1)·α_out ; flat ring over the network for comparison. */
  const HIER = { totals: [576, 2304, 9216], domains: [8, 72], nics: [400, 800], params: [8e9, 70e9, 405e9] };
  function hier(params, Ntot, G, nicGbps) {
    const S = params * BYTES_PER_PARAM, Bup = nvPerDir(5) * 1e9, Bout = nicGBps(nicGbps) * 1e9, R = Ntot / G;
    const aU = TUNED.alphaUs.nvlink * 1e-6, aO = TUNED.alphaUs.net * 1e-6;
    const tUp = 2 * (G - 1) / G * S / Bup + 2 * (G - 1) * aU;
    const tOut = R > 1 ? 2 * (R - 1) / R * (S / G) / Bout + 2 * (R - 1) * aO : 0;
    const flat = 2 * (Ntot - 1) / Ntot * S / Bout + 2 * (Ntot - 1) * aO;
    return { S, Ntot, G, R, tUp, tOut, t: tUp + tOut, flat, speedup: flat / (tUp + tOut), outBytes: R > 1 ? 2 * (R - 1) / R * S / G : 0 };
  }

  /* ── Frontier facts (as of 2026-11; sources in BRIEF.md "Facts that will go stale") ── */
  const FRONTIER = {
    asOf: '2026-11',
    cxl4: { date: SRC.cxl.dates.v4, gts: SRC.cxl.gts.v4, retimers: 4 },
    xeon6: { cxl: '2.0', fmmRatio: 1 },
    rubin: { gpuBidir: SRC.nvlink[6].gpuBidir, aggTB: SRC.nvlink[6].aggTB, gpus: SRC.rubin.gpus },
    ualink: { v1: SRC.ualink.released, v2: SRC.ualink.v2, products: 2027 },
    cpo: { announced: '2025-03-18', quantumPorts: 144, portGbps: 800, spectrumYear: 2026 },
    cx8: { date: '2025-05-18', gbps: SRC.nic.cx8Gbps }
  };

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  function prose() {
    const d = SRC.cxl, L = SRC.liu, P = SRC.pond, nv = SRC.nvlink;
    const c1 = copyShare(MiB, 0.05, 64), c1f = copyShare(MiB, 1, 64), c64 = copyShare(64 * MiB, 1, 64);
    const x100 = crossover(1, 64), x100m256 = crossover(1, 256), x5 = crossover(0.05, 64);
    const x100h = crossover(1, 64, { t0: TUNED.dmaSetupUs / 2 }), x100d = crossover(1, 64, { t0: TUNED.dmaSetupUs * 2 });
    const fStar = c1.Bshare / c1.Bdma, fStar256 = copyShare(MiB, 1, 256).Bshare / c1.Bdma;
    const fm = flitBW('memRd', '68', 16), fc = flitBW('cacheRd', '68', 16), fw = flitBW('cacheWr', '68', 16), f8 = flitBW('memRd', '68', 8);
    const fc256 = flitBW('cacheRd', '256', 16), fw256 = flitBW('cacheWr', '256', 16);
    const t50 = tier(0.5, TUNED.zipfS, 'd', 'hot'), t50r = tier(0.5, TUNED.zipfS, 'd', 'random'), t80 = tier(0.8, TUNED.zipfS, 'd', 'hot');
    const tq = tier(0.2, TUNED.zipfS, 'd', 'hot'), reach5 = tierReach(TUNED.zipfS, 'd', 0.05), reach5h = tierReach(TUNED.zipfS / 2, 'd', 0.05), reach5s = tierReach(1.2, 'd', 0.05);
    const tSw = tier(0.5, TUNED.zipfS, 'sw', 'hot');
    const p8 = pool(8), p16 = pool(16), p64 = pool(64), p16h = pool(16, null, TUNED.poolCv / 2), p16d = pool(16, null, TUNED.poolCv * 2), p16i = pool(16, 0), p16c = pool(16, 1);
    const dRO = fabricDir(16, 0, 2), dW5 = fabricDir(16, 0.05, 2), dW5h4 = fabricDir(4, 0.05, 2), dCap = fabricDir(16, 0, 0.5), dW20 = fabricDir(16, 0.2, 2);
    const r4 = ringSteps(4);
    const a72nv5 = allreduce(8e9, 72, 'nv5'), a72ib = allreduce(8e9, 72, 'ib400'), a72pc = allreduce(8e9, 72, 'pcie5'), a72nv6 = allreduce(8e9, 72, 'nv6');
    const a70 = allreduce(70e9, 72, 'nv5'), a8nv4 = allreduce(8e9, 8, 'nv4'), a70a = allreduce(70e9, 72, 'ib400'), a1 = allreduce(1e9, 8, 'nv5');
    const h1 = hier(70e9, 9216, 72, 400), h8 = hier(70e9, 9216, 8, 400);
    const gh = SRC.gh, mi = SRC.mi300a;
    return {
      // ch1
      dma: [TUNED.dmaSetupUs, 0], cLat: [TUNED.coherentLatNs, 0], mlp: [TUNED.mlp, 0], pcie16: [pcieGBps(16), 0], little64: [64 * LINE / (TUNED.coherentLatNs * 1e-9) / 1e9, 1],
      c1copy: [c1.tCopy * 1e6, 1], c1share: [c1.tShare * 1e6, 1], c1fshare: [c1f.tShare * 1e6, 1],
      x100: [x100 / KiB, 0], x100m256: [x100m256 / MiB, 1], x100h: [x100h / KiB, 0], x100d: [x100d / KiB, 0], fStar: [fStar, 0, 'pct'], fStar256: [fStar256, 0, 'pct'],
      // ch2
      portLo: [d.portRtLo, 0], portHi: [d.portRtHi, 0], pinMem: [d.pinMem, 0], pinSnoop: [d.pinSnoop, 0], cacheIdBits: [d.cacheIdBits, 0], cacheIdN: [Math.pow(2, d.cacheIdBits), 0],
      // ch3
      flitB: [d.flit68.bytes, 0], flitPid: [d.flit68.pid, 0], flitPay: [d.flit68.payload, 0], flitCrc: [d.flit68.crc, 0], raw16: [fm.raw, 0],
      fm16: [fm.real, 1], fc16: [fc.real, 1], fw16: [fw.real, 1], fm8: [f8.real, 1], fc256: [fc256.real, 0], fw256: [fw256.real, 1], ddr5: [DDR5_4800, 1], fmDdr: [fm.ddr5, 1],
      // ch4 (dates)
      // ch5
      locLat: [L.local.lat, 0], locBw: [L.local.bw, 0], aLat: [L.devs.a.lat, 0], bLat: [L.devs.b.lat, 0], cLatDev: [L.devs.c.lat, 0], dLat: [L.devs.d.lat, 0], aBw: [L.devs.a.bw, 0], bBw: [L.devs.b.bw, 0], dBw: [L.devs.d.bw, 0],
      estDirect: [d.estDirect, 0], estSwitch: [d.estSwitch, 0], pondLo: [P.addLo, 0], pondHi: [P.addHi, 0], pondLocal: [P.local, 0], sunEmu: [SRC.sun.vsEmu, 0],
      zipfS: [TUNED.zipfS, 1], pages: [TUNED.pages, 0], t50q: [t50.q, 0, 'pct'], t50lat: [t50.lat, 0], t50slow: [t50.slow, 0, 'pct'], t50rq: [t50r.q, 0, 'pct'], t50rlat: [t50r.lat, 0], t80q: [t80.q, 0, 'pct'], t80slow: [t80.slow, 0, 'pct'],
      reach5: [reach5, 0, 'pct'], reach5h: [reach5h, 0, 'pct'], reach5s: [reach5s, 0, 'pct'], tqq: [tq.q, 0, 'pct'], tqbw: [tq.bw, 0], bwBest: [t50.bwBest, 0], qBest: [t50.qBest, 0, 'pct'], tSwSlow: [tSw.slow, 0, 'pct'],
      // ch6
      mldMax: [d.mldMax, 0], swLo: [d.switchAdderLo, 0], swHi: [d.switchAdderHi, 0], pondRack: [P.rack, 0], pondSw: [P.switchAdd, 0], strandLo: [P.strandLo, 0], strandHi: [P.strandHi, 0], pondSave: [P.poolSave, 0], pondCost: [P.costSave, 0], perfLo: [P.perfLo, 0], perfHi: [P.perfHi, 0],
      poolCv: [TUNED.poolCv, 2], p8: [p8.saved, 0, 'pct'], p16: [p16.saved, 0, 'pct'], p64: [p64.saved, 0, 'pct'], p16h: [p16h.saved, 0, 'pct'], p16d: [p16d.saved, 0, 'pct'], p16i: [p16i.saved, 0, 'pct'], p16c: [p16c.saved, 0, 'pct'], poolRho: [TUNED.poolRho, 1],
      // ch7
      gfd: [d.gfdNodes, 0], pbrBits: [d.pbrIdBits, 0], mldNodes: [d.mldNodes, 0], dirW: [DIR.W, 0],
      dRO: [dRO.bi, 1], dW5: [dW5.bi, 0], dW5fan: [dW5.fanout, 1], dW5h4: [dW5h4.bi, 0], dW5h4fan: [dW5h4.fanout, 1], dCap: [dCap.bi, 0], dW20: [dW20.bi, 0], dW20share: [dW20.writeBIshare, 0, 'pct'],
      // ch8
      nv4: [nv[4].gpuBidir, 0], nv5: [nv[5].gpuBidir, 0], nv6: [nv[6].gpuBidir, 0], nv4l: [nv[4].links, 0], nv6l: [nv[6].links, 0], nv4pl: [nvLinkPerDir(4), 0], nv5pl: [nvLinkPerDir(5), 0], nv6pl: [nvLinkPerDir(6), 0],
      nv5d: [nvPerDir(5), 0], agg5: [nv[5].aggTB, 0], agg6: [nv[6].aggTB, 0], agg5c: [72 * nv[5].gpuBidir / 1000, 1], agg6c: [72 * nv[6].gpuBidir / 1000, 1], nvVsPcie: [nvPerDir(5) / pcieGBps(16), 0],
      // ch9
      ringN: [r4.N, 0], ringSteps: [r4.chunksSent, 0], arS: [8e9 * BYTES_PER_PARAM / 1e9, 0], arPer: [a72nv5.perGpu / 1e9, 1], arNv5: [a72nv5.t * 1e3, 0], arIb: [a72ib.t * 1e3, 0], arPc: [a72pc.t * 1e3, 0], arNv6: [a72nv6.t * 1e3, 0], ar70: [a70.t * 1e3, 0], ar8nv4: [a8nv4.t * 1e3, 0],
      alphaNv: [TUNED.alphaUs.nvlink, 0], alphaNet: [TUNED.alphaUs.net, 0], alphaPc: [TUNED.alphaUs.pcie, 0], ar70ib: [a70a.t, 1], ar70lat: [a70a.tLat * 1e3, 2], a1bw: [a1.tBw * 1e3, 1], a1lat: [a1.tLat * 1e3, 3], arEq: [72 * TUNED.alphaUs.nvlink * 1e-6 * nvPerDir(5) * 1e9 / 1e6, 0], nic400: [nicGBps(400), 0], nic800: [nicGBps(800), 0],
      // ch10
      h1: [h1.t, 2], h8: [h8.t, 2], hFlat: [h1.flat, 1], hSpeed: [h1.speedup, 0], hOut1: [h1.tOut, 2], hUp1: [h1.tUp, 2], ualLane: [SRC.ualink.laneGTs, 0], ualSig: [SRC.ualink.signalGTs, 1], ualSt: [ualinkStationGBps(), 0], ualMax: [SRC.ualink.maxAcc, 0], ualBits: [SRC.ualink.idBits, 0], ualTl: [SRC.ualink.tlFlit, 0], ualDl: [SRC.ualink.dlFlit, 0],
      // ch11
      ghC2c: [gh.c2cBidir, 0], ghC2cDir: [gh.c2c, 0], ghVs: [gh.c2cBidir / (2 * pcieGBps(16)), 1], ghPj: [gh.pjBit, 1], ghW: [gh.c2cBidir * 8 * gh.pjBit / 1000, 1], ghLp: [gh.lpddrGB, 0], ghLpBw: [gh.lpddrBW, 0], ghHbm: [gh.hbmGB, 0], ghHbmBw: [gh.hbmBW, 0],
      miCores: [mi.cores, 0], miCcd: [mi.ccds, 0], miXcd: [mi.xcds, 0], miCu: [mi.cuPer, 0], miCus: [mi.xcds * mi.cuPer, 0], miHbm: [mi.hbmGB, 0], miTb: [mi.hbmTB, 1], miIc: [mi.icMB, 0],
      // ch12 frontier
      cxl4gts: [FRONTIER.cxl4.gts, 0], cxl4ret: [FRONTIER.cxl4.retimers, 0], rubGpu: [FRONTIER.rubin.gpuBidir, 0], rubAgg: [FRONTIER.rubin.aggTB, 0], rubHbm: [SRC.rubin.hbmGB, 0],
      cpoPorts: [FRONTIER.cpo.quantumPorts, 0], cpoGbps: [FRONTIER.cpo.portGbps, 0], cx8: [FRONTIER.cx8.gbps, 0]
    };
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }

  /* ── live sentences: each returns { key, v } ── */
  const say = {
    share(S, f, M) {
      const r = copyShare(S, f, M), x = crossover(f, M), v = Object.assign({ x }, r);
      if (x == null) return { key: 'ch1.say.alwaysShare', v };
      if (r.win === 'share') return { key: 'ch1.say.share', v };
      return { key: 'ch1.say.copy', v };
    },
    flit(kind, mode, w) { const r = flitBW(kind, mode, w); return { key: r.derived ? 'ch3.say.derived' : kind === 'cacheWr' ? 'ch3.say.write' : 'ch3.say.read', v: r }; },
    proto(r) {
      if (!r.ok) return { key: 'ch4.say.no', v: r };
      if (r.note === 'hit' || r.note === 'silent' || r.note === 'local') return { key: 'ch4.say.quiet', v: r };
      if (r.note === 'bi') return { key: 'ch4.say.bi', v: r };
      if (r.note === 'snooped') return { key: 'ch4.say.snoop', v: r };
      return { key: 'ch4.say.msgs', v: r };
    },
    tier(p, s, dev, placement) {
      const r = tier(p, s, dev, placement);
      if (r.p === 0) return { key: 'ch5.say.none', v: r };
      if (r.q >= 0.999) return { key: 'ch5.say.all', v: r };
      if (r.slow <= 0.05) return { key: 'ch5.say.cheap', v: r };
      return { key: 'ch5.say.costly', v: r };
    },
    pool(N, rho) { const r = pool(N, rho); return { key: N <= 1 ? 'ch6.say.one' : r.tierKey === 'mld' ? 'ch6.say.mld' : 'ch6.say.switch', v: r }; },
    dir(H, wf, cap) {
      const r = fabricDir(H, wf, cap);
      if (H === 1 && r.biCap === 0) return { key: 'ch7.say.alone', v: r };
      if (r.biCap > r.biWrite + r.biRead) return { key: 'ch7.say.cap', v: r };
      if (wf === 0) return { key: 'ch7.say.ro', v: r };
      return { key: 'ch7.say.write', v: r };
    },
    ring(N, k) { const R = ringSteps(N); if (k === 0) return { key: 'ch9.say.start', v: R }; if (k < N - 1) return { key: 'ch9.say.rs', v: R }; if (k === N - 1) return { key: 'ch9.say.rsdone', v: R }; if (k < 2 * (N - 1)) return { key: 'ch9.say.ag', v: R }; return { key: 'ch9.say.done', v: R }; },
    ar(params, N, fab) { return { key: 'ch9.say.bw', v: allreduce(params, N, fab) }; },   // every choice on the page is bandwidth-bound (arEq in prose)
    hier(params, Ntot, G, nic) { const r = hier(params, Ntot, G, nic); return { key: r.tOut > r.tUp ? 'ch10.say.out' : 'ch10.say.up', v: r }; }
  };

  return { KiB, MiB, GiB, LINE, SRC, TUNED, rng, clamp, pcieGBps, rawGBps, nvPerDir, nvLinkPerDir, nicGBps, ualinkStationGBps,
    SHARE, copyShare, crossover, FLITBW, flitBW, DDR5_4800, TYPES, ACTIONS, NEEDS, allowed, freshLines, protoStep,
    TIER, zipfCum, tier, tierDev, tierReach, POOL, pool, DIR, fabricDir, RING, ringInit, ringSteps, FABRICS, FABRIC_KEYS, BYTES_PER_PARAM, allreduce, AR,
    HIER, hier, FRONTIER, prose, fmt, say };
});
