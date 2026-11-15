/* How memory talks (the DDR interface): the page's models. Every model is a named, checkable result: the refresh
   duty cycle tRFC / tREFI from the datasheet tables; an address split into channel / subchannel / bank group / bank /
   row / column; a command-level DRAM simulator (ACT, RD, PRE under tRCD, CL, tRP, tRAS, tRC, tRRD_S/L, tFAW,
   tCCD_S/L, tRTP; open- or close-page; FR-FCFS scheduling after Rixner et al. 2000) on generated access traces;
   latency in nanoseconds = cycles × 2000 / (MT/s); fly-by clock skew against the unit interval; Hamming SEC and SECDED
   decoding enumerated exactly over every error pattern; PAM3 3-bit-to-2-symbol counting and a linear-loss eye budget;
   a row-hammer disturbance count over one refresh window with no mitigation, a Misra–Gries tracker (TRR-like) or
   per-row activation counting (PRAC). Datasheet and dated figures sit in SPEC / BINS / FACTS / FRONTIER with their
   source and the date it was opened (also in BRIEF.md). Constants chosen for a model rather than taken from a source
   are marked TUNED here and on the page.
   UMD: window.MemModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MemModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LINE = 64;

  // mulberry32: a small seeded generator, so every trace repeats exactly
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const ceilNck = (ns, tck) => Math.ceil(ns / tck - 1e-9);

  /* ── Datasheet figures (all opened 2026-11-15; URLs in BRIEF.md) ──
     DDR5: SK hynix 16Gb DDR5 SDRAM datasheet H5CG48AGBDX018N rev 1.0 (Jul 2022): Table 67 (tREFI 3.9 µs, tRFC1 295 ns,
       tRFC2 160 ns, tRFCsb 130 ns for 16Gb; 8,192 REF per 32 ms), AC tables for DDR5-4400…5600 (tCCD_S 8 nCK, tCCD_L
       max(8 nCK, 5 ns), tRRD_S 8 nCK, tRRD_L max(8 nCK, 5 ns), tFAW(1KB) max(32 nCK, …) whose ns term equals 32 nCK at
       every listed rate, tFAW(2KB) 40 nCK, tRTP max(12 nCK, 7.5 ns), tWR 30 ns), §4.36 on-die ECC (128 data + 8 check
       bits, single-bit correction, DUE on a syndrome that matches no column), speed bin 5600 46-45-45, tRAS 32 ns, tRC 48 ns.
       8Gb tRFC1 195 / tRFC2 130 / tRFCsb 115 ns: SQRAM (Advantech) SQR-RD5N32G4K8SZZB DDR5-4800 RDIMM datasheet rev 1.1
       (Dec 2022), tRFC table (24/32 Gb listed TBD there and in every table opened; not used).
       Micron 16Gb DDR5 die rev D addendum rev F (Apr 2024): 8 bank groups × 4 banks (x4/x8), rows R0–R15, columns C0–C9
       (x8), 1 KB page (x8) / 2 KB (x16), 16n prefetch, -64B = 6400 MT/s 52-52-52, -56B 46-45-45, tAA/tRCD/tRP 16 ns.
       Micron DDR5 SODIMM core rev F (May 2023): two 32-bit subchannels (36-bit with ECC), VDD 1.1 V from an on-module PMIC
       (5 V in), BL16 = "sixteen … one-half-clock-cycle data transfers", fly-by topology, DDR5-4800B CL40.
     DDR4: SK hynix 8Gb DDR4 H5AN8G8NCJR rev 1.5 (Mar 2019): tREFI 7.8 µs, tRFC1 350 ns (8Gb), nRFC at 3200 for
       2/4/8/16 Gb = 256/416/560/880 nCK, DDR4-3200AA 22-22-22 (13.75 ns), nRAS 52, nRC 74, tCCD_S 4, tCCD_L 8,
       nRRDS 4, nRRDL 8, nFAW(x8) 34, 16 banks in 4 groups, page 1 KB (x8). */
  const SPEC = {
    ddr5: {
      tREFIns: 3900, refPerWindow: 8192, windowMs: 32, hotC: 85, banks: 32, bgs: 8, banksPerBg: 4, rowBits: 16, colBitsX8: 10, pageX8: 1024, pageX16: 2048,
      bl: 16, subWidth: 32, subs: 2, eccSubSodimm: 36, eccSubRdimm: 40, vdd: 1.1, pmicIn: 5, prefetch: 16,
      tRFC1: { 8: 195, 16: 295 }, tRFC2: { 8: 130, 16: 160 }, tRFCsb: { 8: 115, 16: 130 },
      tCCDs: 8, tCCDLns: 5, tCCDLmin: 8, tRRDs: 8, tRRDLns: 5, tRRDLmin: 8, tFAW1k: 32, tFAW2k: 40, tRTPmin: 12, tRTPns: 7.5, tRASns: 32, tRCns: 48, tAAns: 16,
      odEcc: { data: 128, check: 8 }
    },
    ddr4: {
      tREFIns: 7800, banks: 16, bgs: 4, bl: 8, width: 64, pageX8: 1024, chipsX8: 8,
      tRFC1: { 2: 160, 4: 260, 8: 350, 16: 550 },
      t3200: { tCCDs: 4, tCCDl: 8, tRRDs: 4, tRRDl: 8, tFAW: 34, nRAS: 52, nRC: 74 }
    }
  };
  // nRFC at DDR4-3200 (tCK 0.625 ns) from the hynix table: 256/416/560/880 nCK
  const DDR4_NRFC_3200 = { 2: 256, 4: 416, 8: 560, 16: 880 };

  /* ── speed bins: JEDEC bins from datasheets; vendor-rated (XMP) kits from product listings and reviews ── */
  const BINS = {
    'ddr4-3200aa': { gen: 'ddr4', mts: 3200, cl: 22, rcd: 22, rp: 22, kind: 'jedec', src: 'SK hynix H5AN8G8NCJR rev 1.5' },
    'ddr4-3200x': { gen: 'ddr4', mts: 3200, cl: 16, rcd: 18, rp: 18, ras: 36, kind: 'xmp', volt: 1.35, src: 'Corsair CMK16GX4M2B3200C16 (16-18-18-36, 1.35 V, XMP 2.0)' },
    'ddr5-4800b': { gen: 'ddr5', mts: 4800, cl: 40, rcd: 39, rp: 39, kind: 'jedec', src: 'Micron SODIMM core rev F; SQRAM RDIMM rev 1.1 (40-39-39)' },
    'ddr5-5600b': { gen: 'ddr5', mts: 5600, cl: 46, rcd: 45, rp: 45, kind: 'jedec', src: 'SK hynix H5CG48AGBDX018N rev 1.0; Micron die rev D' },
    'ddr5-6400b': { gen: 'ddr5', mts: 6400, cl: 52, rcd: 52, rp: 52, kind: 'jedec', src: 'Micron 16Gb die rev D, -64B' },
    'ddr5-6400x': { gen: 'ddr5', mts: 6400, cl: 32, rcd: 39, rp: 39, ras: 102, kind: 'xmp', volt: 1.40, src: 'G.SKILL F5-6400J3239G16GX2 (32-39-39-102, 1.40 V, XMP 3.0), PC Gamer review' },
    'ddr5-7200i': { gen: 'ddr5', mts: 7200, cl: 34, rcd: 45, rp: 45, ras: 115, kind: 'xmp', src: 'Intel Core Ultra 200S Plus quick reference guide, test memory 34-45-45-45-115' }
  };
  const BIN_ORDER = ['ddr4-3200aa', 'ddr4-3200x', 'ddr5-4800b', 'ddr5-5600b', 'ddr5-6400b', 'ddr5-6400x', 'ddr5-7200i'];

  /* ── other dated facts quoted on the page (opened 2026-11-15) ── */
  const FACTS = {
    amd9950x: { ch: 2, oneDpc: 5600, twoDpc: 3600, launch: '2024-08-15', src: 'AMD product page, Ryzen 9 9950X: 2x1R/2x2R DDR5-5600, 4x1R/4x2R DDR5-3600, 2 channels' },
    kim2014: { modules: 129, vulnerable: 110, minAct: 139000, window: 64, tRC: 50, src: 'Kim et al., ISCA 2014' },
    kim2020: { chips: 1580, minAct: 9600, perRow: 4800, src: 'Kim et al., ISCA 2020 (arXiv 2005.13121)' },
    trrespass: { modules: 42, vulnerable: 13, maxSides: 19, src: 'Frigo et al., IEEE S&P 2020 (arXiv 2004.01807)' },
    dramNs: 70,   // Chips and Cheese, Ryzen 9 9950X with DDR5-6000, "just over 70 ns" (also how-cpu-caches-work)
    tpdPsPerIn: 170  // board trace delay; the value how-a-computer-is-wired uses (TUNED there, stated)
  };

  /* ── frontier, as of November 2026 (FRONTIER.asOf); sources and dates in BRIEF.md "Facts that will go stale" ── */
  const FRONTIER = {
    asOf: '2026-11',
    prac: { doc: 'JESD79-5C', date: '2024-04-17', maxMts: 8800 },
    camm2: { doc: 'JESD318', date: '2023-12-05', minGB: 8, maxGB: 128 },
    gddr7: { doc: 'JESD239', date: '2024-03-05', gbpsMax: 48, width: 32, perDevice: 192 },
    rtx5090: { gbps: 28, width: 512 },
    lp5x: { gbps: 10.7, date: '2024-04-17', vendor: 'Samsung' },
    lp6: { doc: 'JESD209-6', date: '2025-07-09', minMts: 10667, maxMts: 14400, subDq: 12 },
    mrdimm: { gen1: 8800, xeon6900: 8800, xeon6700: 8000, gen2: 12800, bufDoc: 'JESD82-552', bufDate: '2026-04-30' },
    record: { mts: 13606, prev: 13556.8, who: 'saltycroissant', moduleGB: 24, reported: '2026-07-03' },
    ddr6: { lo: 8800, hi: 17600 }
  };

  /* ── 01 refresh ── */
  function refresh(gen, density, hot, mode) {
    const S = SPEC[gen]; let tREFI = S.tREFIns * (hot ? 0.5 : 1), tRFC, scope = 'rank';
    if (gen === 'ddr4') tRFC = S.tRFC1[density];
    else if (mode === 'fgr') { tRFC = S.tRFC2[density]; tREFI /= 2; }
    else if (mode === 'sb') { tRFC = S.tRFCsb[density]; tREFI /= 2; scope = 'bank'; }   // each bank once per tREFI/2 (Table 66: tREFIsb = tREFI/(2n), n banks per group, one bank of every group at a time)
    else tRFC = S.tRFC1[density];
    const busy = tRFC / tREFI;
    // a read that arrives at a random moment finds its bank refreshing with probability busy and then waits tRFC/2 on average
    return { tREFI, tRFC, busy, extra: busy * tRFC / 2, scope, perSecond: 1e9 / tREFI };
  }
  function ddr4RfcCheck() { const o = {}; for (const d of [2, 4, 8, 16]) o[d] = DDR4_NRFC_3200[d] * 0.625; return o; }

  /* ── 02 the address split ── */
  const MAPS = {
    // fields from bit 0 upward
    rowfirst: ['off', 'ch', 'sub', 'col', 'bg', 'ba', 'rank', 'row'],
    bgfirst: ['off', 'ch', 'sub', 'bg', 'col', 'ba', 'rank', 'row']
  };
  function geomBits(ch, ranks) { return { off: 6, ch: Math.round(Math.log2(ch)), sub: 1, col: SPEC.ddr5.colBitsX8 - 4, bg: 3, ba: 2, rank: Math.round(Math.log2(ranks)), row: SPEC.ddr5.rowBits }; }
  function totalBits(ch, ranks) { const g = geomBits(ch, ranks); return Object.values(g).reduce((a, b) => a + b, 0); }
  function mapAddr(addr, scheme, ch, ranks) {
    const g = geomBits(ch, ranks), out = { fields: [] }; let a = addr, lo = 0;
    for (const f of MAPS[scheme]) { const n = g[f], v = a % Math.pow(2, n); a = Math.floor(a / Math.pow(2, n)); out[f] = v; out.fields.push({ f, n, lo, v }); lo += n; }
    out.over = a > 0; out.bits = lo; out.bank = out.bg + SPEC.ddr5.bgs * out.ba; out.colStart = out.col * SPEC.ddr5.bl;
    return out;
  }
  function parseHex(s) { s = String(s).trim().replace(/^0x/i, '').replace(/_/g, ''); if (!/^[0-9a-f]{1,10}$/i.test(s)) return null; return parseInt(s, 16); }
  const ADDR = { def: '0x23A5C9E48', ch: 2, ranks: 1, chipsPerSub: 4, density: 16 };

  /* ── 03 the command-level simulator ── */
  function timing(binId, opts) {
    opts = opts || {};
    const b = Object.assign({}, BINS[binId] || {}, opts.bin || {}), gen = b.gen, tck = 2000 / b.mts;
    if (gen === 'ddr4') {
      const s = SPEC.ddr4.t3200, ras = b.ras || s.nRAS;
      return { gen, tck, mts: b.mts, CL: b.cl, RCD: b.rcd, RP: b.rp, RAS: ras, RC: b.ras ? ras + b.rp : s.nRC, BL2: SPEC.ddr4.bl / 2, CCDS: s.tCCDs, CCDL: s.tCCDl, RRDS: s.tRRDs, RRDL: s.tRRDl,
        FAW: s.tFAW, RTP: ceilNck(7.5, tck), banks: SPEC.ddr4.banks, bgs: SPEC.ddr4.bgs, bytes: SPEC.ddr4.width / 8 * SPEC.ddr4.bl, width: SPEC.ddr4.width };
    }
    const S = SPEC.ddr5, ras = b.ras || ceilNck(S.tRASns, tck);
    return { gen, tck, mts: b.mts, CL: b.cl, RCD: b.rcd, RP: b.rp, RAS: ras, RC: ras + b.rp, BL2: S.bl / 2, CCDS: S.tCCDs, CCDL: Math.max(S.tCCDLmin, ceilNck(S.tCCDLns, tck)),
      RRDS: S.tRRDs, RRDL: Math.max(S.tRRDLmin, ceilNck(S.tRRDLns, tck)), FAW: opts.page2k ? S.tFAW2k : S.tFAW1k, RTP: Math.max(S.tRTPmin, ceilNck(S.tRTPns, tck)),
      banks: S.banks, bgs: S.bgs, bytes: S.subWidth / 8 * S.bl, width: S.subWidth };
  }
  // a DDR5 timing set at any rate, with tAA = tRCD = tRP = 16 ns rounded up (CL to an even count, as the bins do)
  function genericTiming(mts, opts) {
    const tck = 2000 / mts, n = ceilNck(SPEC.ddr5.tAAns, tck), cl = n % 2 ? n + 1 : n;
    return timing(null, Object.assign({}, opts, { bin: { gen: 'ddr5', mts, cl, rcd: n, rp: n } }));
  }
  // requests: [{ bank, row, at }] (column does not change timing). mode 'chain': each request is issued when the previous
  // one has returned (a pointer chase); 'flood': all are waiting from cycle 0. policy 'open' or 'close'.
  function simulate(T, reqs, o) {
    o = o || {}; const mode = o.mode || 'chain', policy = o.policy || 'open', W = o.window || 32, log = o.log ? [] : null;
    const NB = T.banks, open = new Array(NB).fill(-1), actT = new Array(NB).fill(-1e9), rdT = new Array(NB).fill(-1e9), preT = new Array(NB).fill(-1e9);
    const bgAct = new Array(T.bgs).fill(-1e9), acts = [-1e9, -1e9, -1e9, -1e9];
    let lastAct = -1e9, lastRd = -1e9, lastRdBg = -1, t = 0, done = 0, next = 0, ready = mode === 'flood' ? reqs.length : 1;
    const R = reqs.map((r, i) => ({ i, bank: r.bank, row: r.row, bg: r.bank % T.bgs, arr: mode === 'flood' ? 0 : null, cls: null, end: null }));
    if (mode === 'chain' && R.length) R[0].arr = 0;
    const q = []; while (next < ready && next < R.length) q.push(R[next++]);
    const canRd = (r) => open[r.bank] === r.row && t >= actT[r.bank] + T.RCD && t >= lastRd + (r.bg === lastRdBg ? T.CCDL : T.CCDS);
    const canPre = b => open[b] >= 0 && t >= actT[b] + T.RAS && t >= rdT[b] + T.RTP;
    const canAct = r => open[r.bank] < 0 && t >= preT[r.bank] + T.RP && t >= actT[r.bank] + T.RC && t >= lastAct + T.RRDS && t >= bgAct[r.bg] + T.RRDL && t >= acts[0] + T.FAW;
    const counts = { hit: 0, miss: 0, conflict: 0 };
    let guard = 0;
    while (done < R.length && guard++ < 5e6) {
      const win = q.slice(0, W).filter(r => r.arr != null && r.arr <= t);
      let issued = false;
      // 1. a ready column read to an open row (first-ready)
      for (const r of win) if (canRd(r)) {
        if (!r.cls) r.cls = 'hit';
        rdT[r.bank] = t; lastRd = t; lastRdBg = r.bg; r.end = t + T.CL + T.BL2; counts[r.cls]++;
        if (log) log.push({ t, c: 'RD', b: r.bank, i: r.i, end: r.end });
        q.splice(q.indexOf(r), 1); done++; issued = true;
        if (mode === 'chain' && next < R.length) { R[next].arr = r.end; q.push(R[next++]); }
        break;
      }
      // 2. otherwise the oldest request that needs a row: precharge a conflicting row (only if nobody waiting wants it), or activate
      // (per bank, only the oldest waiting request may change the row, so requests to one bank keep their order)
      if (!issued) { const seen = new Set(); for (const r of win) {
        const b = r.bank;
        if (seen.has(b)) continue; seen.add(b);
        if (open[b] === r.row) continue;
        if (open[b] >= 0) {
          if (win.some(x => x.bank === b && x.row === open[b])) continue;
          if (!r.cls) r.cls = 'conflict';
          if (canPre(b)) { open[b] = -1; preT[b] = t; if (log) log.push({ t, c: 'PRE', b }); issued = true; break; }
          continue;
        }
        if (!r.cls) r.cls = 'miss';
        if (canAct(r)) { open[b] = r.row; actT[b] = t; lastAct = t; bgAct[r.bg] = t; acts.shift(); acts.push(t); if (log) log.push({ t, c: 'ACT', b }); issued = true; break; }
      } }
      // 3. close-page: precharge any open bank that nobody in the window is waiting for
      if (!issued && policy === 'close') for (let b = 0; b < NB; b++) {
        if (open[b] >= 0 && !q.slice(0, W).some(x => x.bank === b && x.row === open[b]) && canPre(b)) { open[b] = -1; preT[b] = t; if (log) log.push({ t, c: 'PRE', b }); break; }
      }
      t++;
    }
    const lat = R.map(r => r.end - r.arr), end = Math.max(...R.map(r => r.end));
    return { reqs: R, counts, avgLat: lat.reduce((a, b) => a + b, 0) / R.length, end, log, bytes: R.length * T.bytes,
      gbps: R.length * T.bytes / (end * T.tck), peak: T.mts * T.width / 8 / 1000 };
  }
  // closed forms for one request arriving at an idle bank
  function idle(T) { return { hit: T.CL + T.BL2, miss: T.RCD + T.CL + T.BL2, conflict: T.RP + T.RCD + T.CL + T.BL2 }; }

  // ch3 traces in one subchannel (bank index b: bank group b % 8, bank b >> 3)
  const TR = { n: 48, seed: 11 };
  function trace(kind, n, seed) {
    n = n || TR.n; const R = rng(seed || TR.seed), out = [];
    for (let i = 0; i < n; i++) {
      if (kind === 'stream') out.push({ bank: i % 8, row: 100 + Math.floor(i / 512) });     // consecutive lines rotate over the 8 bank groups, same row in each (the 'bgfirst' mapping)
      else if (kind === 'random') out.push({ bank: Math.floor(R() * 32), row: Math.floor(R() * 65536) });
      else out.push({ bank: 5, row: i % 2 ? 7001 : 4242 });                                  // ping-pong: two arrays whose rows share a bank
    }
    return out;
  }
  function ch3(kind, policy, binId) {
    const T = timing(binId), tr = trace(kind).map(r => ({ bank: r.bank % T.banks, row: r.row }));   // DDR4 has 16 banks
    const c = simulate(T, tr, { mode: 'chain', policy, log: true }), f = simulate(T, tr, { mode: 'flood', policy });
    return { T, chain: c, flood: f, idle: idle(T) };
  }

  /* ── 04 the CL paradox ── */
  function latency(b) {
    const tck = 2000 / b.mts, bl2 = (b.gen === 'ddr4' ? SPEC.ddr4.bl : SPEC.ddr5.bl) / 2;
    return { tck, cl: b.cl * tck, miss: (b.rcd + b.cl) * tck, conflict: (b.rp + b.rcd + b.cl) * tck, burst: bl2 * tck, peak: b.mts * 8 / 1000, lineHit: (b.cl + bl2) * tck };
  }

  /* ── 05 bandwidth: achieved vs peak under row-hit rate and bank parallelism ── */
  const BW = { n: 400, seed: 5, banks: [1, 2, 4, 8, 16, 32], bin: 'ddr5-6400b' };
  function bwTrace(nb, hit, n, seed) {
    const R = rng(seed || BW.seed), rows = new Array(32).fill(0).map((_, i) => 1000 + i), out = [];
    for (let i = 0; i < (n || BW.n); i++) {
      const b = Math.floor(R() * nb);
      if (R() >= hit) rows[b] = Math.floor(R() * 65536);
      out.push({ bank: b, row: rows[b] });
    }
    return out;
  }
  function bandwidth(nb, hit, binId) {
    const T = timing(binId || BW.bin), r = simulate(T, bwTrace(nb, hit), { mode: 'flood', policy: 'open' });
    const c = r.counts;
    return { gbps: r.gbps, peak: r.peak, frac: r.gbps / r.peak, hitRate: c.hit / BW.n, dimm: 2 * r.gbps, dimmPeak: 2 * r.peak, counts: c };
  }

  /* ── 06 bank groups ── */
  const BG = { n: 256, rates: [3200, 4000, 4800, 5600, 6400, 7200, 8000, 8800] };
  function bgTrace(groups, newRow, n) {
    const out = []; n = n || BG.n;
    for (let i = 0; i < n; i++) { const g = i % groups, k = Math.floor(i / groups); out.push({ bank: g + 8 * (newRow ? k % 4 : 0), row: newRow ? 100 + i : 100 + g }); }
    return out;
  }
  function bankGroups(groups, mts, newRow, page2k) {
    const T = genericTiming(mts, { page2k }), r = simulate(T, bgTrace(groups, newRow), { mode: 'flood', policy: newRow ? 'close' : 'open' });
    return { T, gbps: r.gbps, peak: r.peak, frac: r.gbps / r.peak, ccdl: T.CCDL, ccds: T.CCDS, ideal: groups === 1 ? T.BL2 / T.CCDL : 1 };
  }

  /* ── 07 fly-by skew and training (TUNED: chip pitch on the module; trace delay from how-a-computer-is-wired) ── */
  const FLY = { chips: 5, pitchMm: 14, mmPerIn: 25.4 };
  function flyby(mts, pitchMm) {
    const ui = 1e6 / mts, ps = (pitchMm || FLY.pitchMm) * FACTS.tpdPsPerIn / FLY.mmPerIn;   // ps per chip step
    const arr = []; for (let i = 0; i < FLY.chips; i++) arr.push(i * ps);
    const span = arr[arr.length - 1];
    return { ui, step: ps, arr, span, spanUi: span / ui, needTrain: span > ui / 2 };
  }

  /* ── 08 ECC: textbook Hamming codes, every error pattern enumerated ──
     (136,128) SEC: positions 1…136, check bits at 1, 2, 4, …, 128 (the shape of DDR5's on-die code; JEDEC specifies its
     own H matrix, so the exact miscorrection share differs). (72,64) SECDED: positions 1…71 plus an overall parity bit. */
  const ECC = { sec: { n: 136, k: 128 }, secded: { n: 72, k: 64 } };
  function decode(code, pos) {
    // pos: flipped positions (1-based; for SECDED position 72 is the overall parity bit)
    if (code === 'none') return pos.length ? 'silent' : 'ok';
    let s = 0, par = 0;
    for (const p of pos) { if (code === 'secded' && p === 72) { par ^= 1; continue; } s ^= p; par ^= 1; }
    if (code === 'sec') {
      if (s === 0) return pos.length ? 'silent' : 'ok';
      if (s > ECC.sec.n) return 'due';
      const after = pos.includes(s) ? pos.filter(p => p !== s) : pos.concat([s]);
      return after.length ? 'silent' : 'fixed';
    }
    // SECDED
    if (s === 0 && par === 0) return pos.length ? 'silent' : 'ok';
    if (par === 1) {
      if (s === 0) { const after = pos.includes(72) ? pos.filter(p => p !== 72) : pos.concat([72]); return after.length ? 'silent' : 'fixed'; }
      if (s > 71) return 'due';
      const after = pos.includes(s) ? pos.filter(p => p !== s) : pos.concat([s]);
      return after.length ? 'silent' : 'fixed';
    }
    return 'due';
  }
  const eccMemo = {};
  function eccStats(code, k) {
    const key = code + k; if (eccMemo[key]) return eccMemo[key];
    const n = code === 'secded' ? 72 : code === 'sec' ? 136 : 72, c = { fixed: 0, due: 0, silent: 0, total: 0 };
    const rec = (start, chosen) => {
      if (chosen.length === k) { c[decode(code, chosen)]++; c.total++; return; }
      for (let p = start; p <= n; p++) { chosen.push(p); rec(p + 1, chosen); chosen.pop(); }
    };
    rec(1, []);
    const r = { fixed: c.fixed / c.total, due: c.due / c.total, silent: c.silent / c.total, total: c.total };
    eccMemo[key] = r; return r;
  }
  function eccExample(code, k, seed) {
    const n = code === 'sec' ? 136 : 72, R = rng(seed), set = new Set();
    while (set.size < k) set.add(1 + Math.floor(R() * n));
    const pos = [...set].sort((a, b) => a - b); let s = 0; for (const p of pos) if (!(code === 'secded' && p === 72)) s ^= p;
    return { pos, syndrome: s, out: decode(code, pos) };
  }

  /* ── 09 PAM3: counting and a linear-loss eye budget (TUNED: loss slope k dB/GHz) ── */
  const SIG = { schemes: { nrz: { bits: 1, levels: 2 }, pam3: { bits: 1.5, levels: 3 }, pam4: { bits: 2, levels: 4 } }, k: 1.2 };
  function signal(gbps, k) {
    k = k == null ? SIG.k : k; const o = {};
    for (const [s, v] of Object.entries(SIG.schemes)) {
      const baud = gbps / v.bits, nyq = baud / 2, loss = k * nyq, eye = (1 / (v.levels - 1)) * Math.pow(10, -loss / 20);
      o[s] = { baud, nyq, loss, eye };
    }
    const best = Object.keys(o).reduce((a, b) => (o[b].eye > o[a].eye ? b : a));
    return Object.assign(o, { best });
  }
  // loss at the NRZ Nyquist frequency (dB) where PAM3 overtakes NRZ, and where PAM4 overtakes PAM3
  const crossNrzPam3 = () => 60 * Math.log10(2), crossPam3Pam4 = () => 120 * Math.log10(1.5);
  function pam3Pairs() { return { pairs: 9, used: 8, bitsPerPair: 3 }; }

  /* ── 10 row hammer over two refresh windows (so every victim sees a full window between its refreshes), one bank (TUNED: TRR tracker size, PRAC threshold, block position) ── */
  const RH = { rows: 65536, base: 30000, trrK: 8, pracFrac: 0.25, hcs: [4800, 10000, 20000, 50000, 139000] };
  function hammer(nAgg, mitig, hc, opts) {
    opts = opts || {};
    const S = SPEC.ddr5, tREFI = S.tREFIns, tRFC = S.tRFC1[16], tRC = S.tRCns, perInt = Math.floor((tREFI - tRFC) / tRC), ints = 2 * S.refPerWindow, rowsPerRef = RH.rows / ints;
    const k = opts.k || RH.trrK, nbo = Math.max(1, Math.floor((opts.pracFrac || RH.pracFrac) * hc));
    const agg = []; for (let i = 0; i < nAgg; i++) agg.push(RH.base + 1 + 2 * i);
    const lo = RH.base, hi = RH.base + 2 * nAgg + 1, d = new Map(), cnt = new Map(), maxD = new Map();
    for (let r = lo; r <= hi; r++) { d.set(r, 0); cnt.set(r, 0); maxD.set(r, 0); }
    const refreshRow = r => { if (d.has(r)) d.set(r, 0); };
    const tracker = new Map(); let alerts = 0, trrRef = 0, ai = 0;
    for (let i = 0; i < ints; i++) {
      for (let a = 0; a < perInt; a++) {
        const r = agg[ai]; ai = (ai + 1) % nAgg;
        for (const v of [r - 1, r + 1]) if (d.has(v)) { const x = d.get(v) + 1; d.set(v, x); if (x > maxD.get(v)) maxD.set(v, x); }
        if (mitig === 'trr') {
          if (tracker.has(r)) tracker.set(r, tracker.get(r) + 1);
          else if (tracker.size < k) tracker.set(r, 1);
          else { for (const [key, val] of [...tracker]) { if (val <= 1) tracker.delete(key); else tracker.set(key, val - 1); } }   // Misra–Gries
        } else if (mitig === 'prac') {
          const c = cnt.get(r) + 1; cnt.set(r, c);
          if (c >= nbo) { alerts++; refreshRow(r - 1); refreshRow(r + 1); cnt.set(r, 0); }
        }
      }
      // the REF command at the end of the interval: normal refresh of this interval's rows, and TRR's one targeted refresh
      const r0 = (i % S.refPerWindow) * rowsPerRef;
      for (let r = Math.max(lo, r0); r < Math.min(hi + 1, r0 + rowsPerRef); r++) { refreshRow(r); if (cnt.has(r)) cnt.set(r, 0); }
      if (mitig === 'trr' && tracker.size) {
        let top = null; for (const [key, val] of tracker) if (top == null || val > tracker.get(top)) top = key;
        refreshRow(top - 1); refreshRow(top + 1); tracker.delete(top); trrRef++;
      }
    }
    let worst = 0, flips = 0; const rows = [];
    for (const [r, v] of maxD) { if (agg.includes(r)) continue; rows.push(v); worst = Math.max(worst, v); if (v >= hc) flips++; }
    return { perInt, ints, total: perInt * S.refPerWindow, perAgg: perInt * S.refPerWindow / nAgg, worst, flips, alerts, trrRef, nbo, k, victims: rows.length, rows };
  }
  const maxActs = (windowMs, tRCns) => windowMs * 1e6 / tRCns;

  // the page calls these with the same arguments from a drawing and a sentence; remember results
  function memo(fn) { const m = new Map(); return function () { const k = JSON.stringify([...arguments]); if (!m.has(k)) m.set(k, fn.apply(null, arguments)); return m.get(k); }; }
  const ch3M = memo(ch3), bandwidthM = memo(bandwidth), bankGroupsM = memo(bankGroups), hammerM = memo(hammer);

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  function prose() {
    const r4 = refresh('ddr4', 8, false), r4b = refresh('ddr4', 16, false), r42 = refresh('ddr4', 2, false), r5 = refresh('ddr5', 16, false), r5h = refresh('ddr5', 16, true), r5f = refresh('ddr5', 16, false, 'fgr'), r5s = refresh('ddr5', 16, false, 'sb');
    const m = mapAddr(parseHex(ADDR.def), 'rowfirst', ADDR.ch, ADDR.ranks), tb = totalBits(ADDR.ch, ADDR.ranks), rowBytes = ADDR.chipsPerSub * SPEC.ddr5.pageX8;
    const T6 = timing('ddr5-6400b'), I6 = idle(T6);
    const sR = ch3('random', 'open', 'ddr5-6400b'), sS = ch3('stream', 'open', 'ddr5-6400b'), sP = ch3('pingpong', 'open', 'ddr5-6400b'), sPc = ch3('pingpong', 'close', 'ddr5-6400b'), sRc = ch3('random', 'close', 'ddr5-6400b');
    const L = id => latency(BINS[id]), l43 = L('ddr4-3200aa'), l4x = L('ddr4-3200x'), l56 = L('ddr5-6400b'), l5x = L('ddr5-6400x');
    const b1_0 = bandwidth(1, 0), b32_0 = bandwidth(32, 0), b8_9 = bandwidth(8, 0.9), b1_1 = bandwidth(1, 1);
    const g1_64 = bankGroups(1, 6400), g2_64 = bankGroups(2, 6400), g1_32 = bankGroups(1, 3200), g1_88 = bankGroups(1, 8800), gn1k = bankGroups(8, 6400, true, false), gn2k = bankGroups(8, 6400, true, true);
    const f64 = flyby(6400), f4 = flyby(400), f32 = flyby(3200), fh = flyby(6400, FLY.pitchMm / 2), fd = flyby(6400, FLY.pitchMm * 2);
    const e1 = eccStats('sec', 1), e2 = eccStats('sec', 2), d2 = eccStats('secded', 2), d3 = eccStats('secded', 3);
    const s32 = signal(32);
    const hN = hammer(2, 'none', 139000), hT2 = hammer(2, 'trr', 4800), hT10 = hammer(10, 'trr', 10000), hT10b = hammer(10, 'trr', 139000), hP10 = hammer(10, 'prac', 4800), hT10n = hammer(10, 'none', 10000), hT10k16 = hammer(10, 'trr', 10000, { k: 16 }), hT10k4 = hammer(10, 'trr', 10000, { k: 4 });
    const crossTo = x => x * 2 / SIG.k;   // NRZ-Nyquist loss x dB ⇒ data rate (Gb/s) with slope k
    return {
      // ch1
      refi4: [r4.tREFI / 1000, 1], refi5: [r5.tREFI / 1000, 1], rfc4: [r4.tRFC, 0], rfc4b: [r4b.tRFC, 0], rfc4a: [r42.tRFC, 0], rfc5f: [r5f.tRFC, 0], rfc5s: [r5s.tRFC, 0],
      busy4: [r4.busy, 1, 'pct'], busy4b: [r4b.busy, 1, 'pct'], busy5: [r5.busy, 1, 'pct'], busy5h: [r5h.busy, 1, 'pct'], busy5f: [r5f.busy, 1, 'pct'], 
      ext5: [r5.extra, 1], ext5f: [r5f.extra, 1], ext5s: [r5s.extra, 1], refN: [SPEC.ddr5.refPerWindow, 0], refMs: [SPEC.ddr5.windowMs, 0], 
      // ch2
      bgs: [SPEC.ddr5.bgs, 0], bpg: [SPEC.ddr5.banksPerBg, 0], banks: [SPEC.ddr5.banks, 0], rows: [Math.pow(2, SPEC.ddr5.rowBits), 0], page: [SPEC.ddr5.pageX8, 0], 
      chips: [ADDR.chipsPerSub, 0], rowKiB: [rowBytes / 1024, 0], linesRow: [rowBytes / LINE, 0], abits: [tb, 0], agib: [Math.pow(2, tb) / Math.pow(2, 30), 0], dimmGB: [ADDR.chipsPerSub * 2 * ADDR.density / 8, 0], dens: [ADDR.density, 0],
      mRow: [m.row, 0], mBg: [m.bg, 0], mBa: [m.ba, 0], mCol: [m.col, 0], mCh: [m.ch, 0], mSub: [m.sub, 0],
      // ch3
      tck6: [T6.tck * 1000, 1], cl6: [T6.CL, 0], rcd6: [T6.RCD, 0], rp6: [T6.RP, 0], ras6: [T6.RAS, 0], rc6: [T6.RC, 0], bl2: [T6.BL2, 0], 
      hit6: [I6.hit * T6.tck, 2], miss6: [I6.miss * T6.tck, 1], conf6: [I6.conflict * T6.tck, 2], hit6c: [I6.hit, 0], miss6c: [I6.miss, 0], conf6c: [I6.conflict, 0], rc6ns: [T6.RC * T6.tck, 1],
      trN: [TR.n, 0], sRlat: [sR.chain.avgLat * T6.tck, 1], sSlat: [sS.chain.avgLat * T6.tck, 1], sPlat: [sP.chain.avgLat * T6.tck, 1], sPclat: [sPc.chain.avgLat * T6.tck, 1], sRclat: [sRc.chain.avgLat * T6.tck, 1], 
      sRconf: [sR.chain.counts.conflict, 0], sRmiss: [sR.chain.counts.miss, 0], 
      // ch4
      cl43: [l43.cl, 2], cl4x: [l4x.cl, 1], cl56: [l56.cl, 2], cl5x: [l5x.cl, 1], miss5x: [l5x.miss, 1], miss4x: [l4x.miss, 2], 
      tck4: [l43.tck, 3], tck5: [l56.tck, 4], peak4: [l43.peak, 1], peak6: [l56.peak, 1], burst4: [l43.burst, 1], burst6: [l56.burst, 2], dramNs: [FACTS.dramNs, 0],
      // ch5
      bwPeak: [b1_0.peak, 1], bwDimm: [b1_0.dimmPeak, 1], bw1_0: [b1_0.gbps, 1], bw32_0: [b32_0.gbps, 1], bw32_0f: [b32_0.frac, 0, 'pct'], bw8_9f: [b8_9.frac, 0, 'pct'], bw1_1f: [b1_1.frac, 0, 'pct'], bwN: [BW.n, 0],
      bl16bytes: [SPEC.ddr5.subWidth / 8 * SPEC.ddr5.bl, 0], bl8bytes: [SPEC.ddr4.width / 8 * SPEC.ddr4.bl, 0], pref: [SPEC.ddr5.prefetch, 0], vdd: [SPEC.ddr5.vdd, 1], pmicIn: [SPEC.ddr5.pmicIn, 0], core6: [6400 / SPEC.ddr5.prefetch, 0], peak2ch: [2 * b1_0.dimmPeak, 1],
      // ch6
      bgN: [BG.n, 0], ccdl64: [g1_64.ccdl, 0], ccds: [g1_64.ccds, 0], g1_64: [g1_64.frac, 0, 'pct'], g2_64: [g2_64.frac, 0, 'pct'], g1_32: [g1_32.frac, 0, 'pct'], g1_88: [g1_88.frac, 0, 'pct'], ccdl88: [g1_88.ccdl, 0], 
      faw1k: [SPEC.ddr5.tFAW1k, 0], faw2k: [SPEC.ddr5.tFAW2k, 0], rrds: [SPEC.ddr5.tRRDs, 0], gn1k: [gn1k.frac, 0, 'pct'], gn2k: [gn2k.frac, 0, 'pct'],
      // ch7
      flyPs: [f64.step, 1], flySpan: [f64.span, 0], ui64: [f64.ui, 1], flyUi64: [f64.spanUi, 1], flyUi4: [f4.spanUi, 2], flyUi32: [f32.spanUi, 2], pitch: [FLY.pitchMm, 0], flyChips: [FLY.chips, 0], flyUiH: [fh.spanUi, 1], flyUiD: [fd.spanUi, 1], tpd: [FACTS.tpdPsPerIn, 0],
      amd1: [FACTS.amd9950x.oneDpc, 0], amd2: [FACTS.amd9950x.twoDpc, 0], amdR: [FACTS.amd9950x.twoDpc / FACTS.amd9950x.oneDpc, 0, 'pct'],
      // ch8
      odData: [SPEC.ddr5.odEcc.data, 0], odCheck: [SPEC.ddr5.odEcc.check, 0], eccSo: [SPEC.ddr5.eccSubSodimm, 0], eccRd: [SPEC.ddr5.eccSubRdimm, 0],
      e1fix: [e1.fixed, 0, 'pct'], e2sil: [e2.silent, 0, 'pct'], e2due: [e2.due, 0, 'pct'], d2due: [d2.due, 0, 'pct'], d3sil: [d3.silent, 0, 'pct'], e2n: [e2.total, 0],
      // ch9
      s32nrz: [s32.nrz.nyq, 0], s32pam3: [s32.pam3.nyq, 1], s32pam4: [s32.pam4.nyq, 0], xNP3: [crossNrzPam3(), 1], xP3P4: [crossPam3Pam4(), 1], xNP3g: [crossTo(crossNrzPam3()), 0], xP3P4g: [crossTo(crossPam3Pam4()), 0], sigK: [SIG.k, 1],
      xNP3g2: [crossTo(crossNrzPam3()) / 2, 0], xNP3gh: [crossTo(crossNrzPam3()) * 2, 0],
      g7max: [FRONTIER.gddr7.gbpsMax, 0], g7w: [FRONTIER.gddr7.width, 0], g7dev: [FRONTIER.gddr7.gbpsMax * FRONTIER.gddr7.width / 8, 0], r5090: [FRONTIER.rtx5090.gbps * FRONTIER.rtx5090.width / 8, 0], r5090g: [FRONTIER.rtx5090.gbps, 0], r5090w: [FRONTIER.rtx5090.width, 0],
      lp5x: [FRONTIER.lp5x.gbps, 1], lp6lo: [FRONTIER.lp6.minMts, 0], lp6hi: [FRONTIER.lp6.maxMts, 0], lp6dq: [FRONTIER.lp6.subDq, 0], camLo: [FRONTIER.camm2.minGB, 0], camHi: [FRONTIER.camm2.maxGB, 0],
      mr1: [FRONTIER.mrdimm.gen1, 0], mr1half: [FRONTIER.mrdimm.gen1 / 2, 0], mr2: [FRONTIER.mrdimm.gen2, 0], mrX7: [FRONTIER.mrdimm.xeon6700, 0], mrBw: [FRONTIER.mrdimm.gen1 * 8 / 1000, 1],
      // ch10
      kimN: [FACTS.kim2014.modules, 0], kimV: [FACTS.kim2014.vulnerable, 0], kimMin: [FACTS.kim2014.minAct / 1000, 0], kimWin: [FACTS.kim2014.window, 0], kimRC: [FACTS.kim2014.tRC, 0], kimMax: [maxActs(FACTS.kim2014.window, FACTS.kim2014.tRC) / 1e6, 2],
      k20chips: [FACTS.kim2020.chips, 0], k20min: [FACTS.kim2020.minAct / 1000, 1], k20row: [FACTS.kim2020.perRow / 1000, 1], trrN: [FACTS.trrespass.modules, 0], trrV: [FACTS.trrespass.vulnerable, 0], trrSides: [FACTS.trrespass.maxSides, 0],
      rhPer: [hN.perInt, 0], rhWorstN: [hN.worst / 1000, 0], rhT2: [hT2.worst, 0], rhT10: [hT10.worst / 1000, 1], rhT10f: [hT10.flips, 0], rhT10b: [hT10b.flips, 0], rhP10: [hP10.worst, 0], rhP10a: [hP10.alerts, 0], rhNbo: [hP10.nbo, 0],
      rhK: [RH.trrK, 0], rhT10k16: [hT10k16.worst, 0], rhT10k4: [hT10k4.worst / 1000, 1], rhT10n: [hT10n.worst / 1000, 1], 
      // frontier
      rec: [FRONTIER.record.mts, 0], recPrev: [FRONTIER.record.prev, 1], d6lo: [FRONTIER.ddr6.lo, 0], d6hi: [FRONTIER.ddr6.hi, 0], prac88: [FRONTIER.prac.maxMts, 0]
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
    refresh(gen, density, hot, mode) {
      const r = refresh(gen, density, hot, mode);
      if (gen === 'ddr5' && mode === 'sb') return { key: 'ch1.say.sb', v: r };
      if (gen === 'ddr5' && mode === 'fgr') return { key: 'ch1.say.fgr', v: r };
      return { key: hot ? 'ch1.say.hot' : 'ch1.say.normal', v: r };
    },
    addr(m) { return { key: m.over ? 'ch2.say.over' : 'ch2.say.map', v: m }; },
    ch3(kind, policy, binId) {
      const s = ch3M(kind, policy, binId), c = s.chain.counts;
      if (c.hit >= c.miss + c.conflict) return { key: 'ch3.say.hits', v: s };
      if (c.conflict > c.miss) return { key: 'ch3.say.conflicts', v: s };
      return { key: policy === 'close' ? 'ch3.say.missclose' : 'ch3.say.misses', v: s };
    },
    cl(mts, cl) {
      const ns = cl * 2000 / mts, ref = latency(BINS['ddr4-3200x']).cl;
      return { key: Math.abs(ns - ref) < 0.05 ? 'ch4.say.same' : ns < ref ? 'ch4.say.faster' : 'ch4.say.slower', v: { ns, ref } };
    },
    bw(nb, hit) {
      const r = bandwidthM(nb, hit);
      if (r.frac > 0.9) return { key: 'ch5.say.full', v: r };
      if (nb === 1) return { key: 'ch5.say.one', v: r };
      return { key: r.counts.conflict > r.counts.hit ? 'ch5.say.conflict' : 'ch5.say.mid', v: r };
    },
    bg(groups, mts, newRow, page2k) {
      const r = bankGroupsM(groups, mts, newRow, page2k);
      if (newRow) return { key: r.frac > 0.95 ? 'ch6.say.fawok' : 'ch6.say.faw', v: r };
      if (groups === 1) return { key: r.ccdl > r.ccds ? 'ch6.say.same' : 'ch6.say.sameok', v: r };
      return { key: 'ch6.say.rot', v: r };
    },
    fly(mts, pitch) { const r = flyby(mts, pitch); return { key: r.needTrain ? 'ch7.say.train' : 'ch7.say.fine', v: r }; },
    ecc(code, k) {
      const r = eccStats(code, k);
      if (code === 'none') return { key: 'ch8.say.none', v: r };
      if (r.fixed > 0.999) return { key: 'ch8.say.fixed', v: r };
      if (r.silent > 0.001) return { key: 'ch8.say.silent', v: r };
      return { key: 'ch8.say.due', v: r };
    },
    sig(gbps, k) { const r = signal(gbps, k); return { key: 'ch9.say.' + r.best, v: r }; },
    rh(n, mitig, hc) {
      const r = hammerM(n, mitig, hc);
      if (r.flips > 0) return { key: mitig === 'none' ? 'ch10.say.flipnone' : 'ch10.say.flip', v: r };
      return { key: mitig === 'prac' ? 'ch10.say.prac' : mitig === 'trr' ? 'ch10.say.trrok' : 'ch10.say.safe', v: r };
    }
  };

  return { LINE, SPEC, BINS, BIN_ORDER, FACTS, FRONTIER, rng, refresh, ddr4RfcCheck, MAPS, geomBits, totalBits, mapAddr, parseHex, ADDR,
    timing, genericTiming, simulate, idle, TR, trace, ch3, ch3M, latency, BW, bwTrace, bandwidth, bandwidthM, BG, bgTrace, bankGroups, bankGroupsM, FLY, flyby,
    ECC, decode, eccStats, eccExample, SIG, signal, crossNrzPam3, crossPam3Pam4, pam3Pairs, RH, hammer, hammerM, maxActs, prose, fmt, say };
});
