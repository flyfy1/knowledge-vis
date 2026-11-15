/* How a CPU guesses ahead: the page's models. Every predictor is the published algorithm run on a branch trace that
   this file generates from a seeded generator (Smith's 1- and 2-bit counters, McFarling's gshare, Seznec's TAGE, a
   return address stack); the core is a cycle-by-cycle simulator of in-order issue, a scoreboard without renaming, and
   out-of-order issue with register renaming and a reorder buffer (Tomasulo, Smith & Pleszkun, the MIPS R10000 scheme);
   the side channel is a toy machine with a two-bit predictor, a cache and a timer, nothing that runs on real
   hardware. Real-chip figures sit in CHIPS / FRONTIER with their source and the date it was opened (also in BRIEF.md).
   Constants chosen for the model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.GuessModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GuessModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // mulberry32: a small seeded generator, so every trace and every random choice repeats exactly
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ── Real-chip figures (sources in BRIEF.md, opened 2026-11-15) ── */
  const CHIPS = {
    // AMD, Software Optimization Guide for the AMD Zen5 Microarchitecture, pub. 58455 rev 1.00 (Aug 2024), §2.8, §2.9.7,
    // §2.10.1, §2.10.3: misprediction penalty 12–18 cycles, common case 15; L1 BTB 16K entries, L2 BTB 8K; 52-entry
    // return address stack per thread; 3072-entry indirect target array; dispatch up to 8 macro-ops per cycle; retire
    // queue tracks up to 448 macro-ops (224 per thread with SMT), commits up to 8 entries per cycle; 240 integer
    // physical registers; the ALU scheduler issues 6 micro-ops per cycle. L1D 4-cycle loads (§2.6, as in A2).
    zen5: { penMin: 12, penMax: 18, pen: 15, l1btb: 16384, l2btb: 8192, ras: 52, indirect: 3072, width: 8, rob: 448, robSmt: 224, retire: 8, prf: 240, aluIssue: 6, l1: 4, l2: 14, l3: 46, docDate: '2024-08' },
    // Chips and Cheese, "Lion Cove: Intel's P-core roars" (2024-09-27): ROB 576 (Redwood Cove 512), renamer 8 micro-ops
    // per cycle (Redwood Cove 6), return stack 24 entries (Redwood Cove 20)
    lionCove: { rob: 576, width: 8, ras: 24, prevRob: 512, prevWidth: 6, prevRas: 20, date: '2024-09-27' },
    // Chips and Cheese, "Arm's Cortex X925: Reaching Desktop Performance" (2026-03-03): "a practical limitation of around
    // 525 instructions in flight"; frontend sustains 10 instructions per cycle; 29-entry return stack. Arm's slide says
    // reordering capacity doubled over Cortex X4; WikiChip "believes it's 768 instructions" (as quoted there).
    x925: { robMeasured: 525, width: 10, ras: 29, claimed: 768, date: '2026-03-03' },
    // Kocher et al., Spectre Attacks (2019), §II-B: Haswell's reorder buffer "has sufficient space for 192 micro-ops"
    haswell: { rob: 192 },
    // DRAM latency as used in how-cpu-caches-work (Chips and Cheese 9950X, 70 ns at 5.7 GHz ≈ 399 cycles)
    dramCycles: 399
  };
  const ZEN = CHIPS.zen5;

  /* ── 01 the cost of a wrong guess: CPI = 1/W + f_br × (1 − accuracy) × penalty ── */
  const COST = { fbr: 0.2, a1Pen: 2 };   // TUNED: one conditional branch per five instructions, an order of magnitude only
  function cpi(o) {
    const W = o.width, P = o.penalty, f = o.fbr == null ? COST.fbr : o.fbr, acc = o.acc;
    const base = 1 / W, stall = f * (1 - acc) * P, c = base + stall;
    return { cpi: c, ipc: 1 / c, base, stall, lost: stall / c, slots: P * W, perMiss: 1 / (f * (1 - acc)) };
  }

  /* ── branch traces: arrays of { pc, t (taken 0/1), back (backward branch) } ── */
  function loopIf(K, p, n, seed) {
    // for (i < n) { for (j < K) { if (rare) {...} } }: forward branch over the rare block taken with probability p;
    // inner back-edge taken K − 1 times then falls through; outer back-edge
    const r = rng(seed || 7), tr = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < K; j++) { tr.push({ pc: 0x1040, t: r() < p ? 1 : 0, back: false }); tr.push({ pc: 0x1080, t: j < K - 1 ? 1 : 0, back: true }); }
      tr.push({ pc: 0x10c0, t: i < n - 1 ? 1 : 0, back: true });
    }
    return tr;
  }
  // the Stack Overflow loop (2012-06-27): 32,768 values in 0..255; if (data[c] >= 128) sum += data[c];
  // compiled as a forward branch over the add, taken when data[c] < 128, and the loop back-edge.
  const SORT = { N: 32768, thr: 128, seed: 11, W: 4, P: ZEN.pen, instr: 4, add: 1, branchless: 7 };
  function sortData(disorder, seed) {
    const r = rng(seed || SORT.seed), N = SORT.N, d = new Array(N);
    for (let i = 0; i < N; i++) d[i] = Math.floor(r() * 256);
    d.sort((a, b) => a - b);
    // disorder: a fraction of positions is drawn and their values are shuffled among themselves
    const k = Math.round(disorder * N); if (k > 1) {
      const pos = []; const used = new Uint8Array(N);
      while (pos.length < k) { const i = Math.floor(r() * N); if (!used[i]) { used[i] = 1; pos.push(i); } }
      const vals = pos.map(i => d[i]);
      for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = vals[i]; vals[i] = vals[j]; vals[j] = t; }
      pos.forEach((p, i) => { d[p] = vals[i]; });
    }
    return d;
  }
  function sortTrace(disorder) {
    const d = sortData(disorder), tr = [];
    for (let i = 0; i < d.length; i++) { tr.push({ pc: 0x2040, t: d[i] < SORT.thr ? 1 : 0, back: false }); tr.push({ pc: 0x2080, t: i < d.length - 1 ? 1 : 0, back: true }); }
    return { tr, d };
  }
  // H&P's eqntott pattern: if (aa == 2) aa = 0; if (bb == 2) bb = 0; if (aa != bb) {...}. With aa, bb drawn from
  // {1, 2}, the third branch is taken exactly when the first two went the same way.
  function corrTrace(n, seed) {
    const r = rng(seed || 3), tr = [];
    for (let i = 0; i < n; i++) {
      let aa = r() < 0.5 ? 1 : 2, bb = r() < 0.5 ? 1 : 2;
      tr.push({ pc: 0x3040, t: aa !== 2 ? 1 : 0, back: false }); if (aa === 2) aa = 0;
      tr.push({ pc: 0x3080, t: bb !== 2 ? 1 : 0, back: false }); if (bb === 2) bb = 0;
      tr.push({ pc: 0x30c0, t: aa === bb ? 1 : 0, back: false });
      tr.push({ pc: 0x3100, t: i < n - 1 ? 1 : 0, back: true });
    }
    return tr;
  }
  // a loop whose body holds one more branch, run a fixed K times: the exit is predictable only from a history that
  // reaches back 2K branches
  function longLoop(K, n, seed) {
    const r = rng(seed || 5), tr = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < K; j++) { tr.push({ pc: 0x4040, t: (j & 1), back: false }); tr.push({ pc: 0x4080, t: j < K - 1 ? 1 : 0, back: true }); }
      tr.push({ pc: 0x40c0, t: r() < 0.97 ? 1 : 0, back: false });
      tr.push({ pc: 0x4100, t: i < n - 1 ? 1 : 0, back: true });
    }
    return tr;
  }
  // a "program": the pieces above interleaved in blocks, plus a data-dependent branch on random data. TUNED mixture.
  const MIX = { seed: 21, blocks: 160 };
  function mixTrace() {
    const r = rng(MIX.seed), tr = [];
    const push = (arr, off) => { for (const b of arr) tr.push({ pc: b.pc + off, t: b.t, back: b.back }); };
    for (let b = 0; b < MIX.blocks; b++) {
      const k = b % 5, s = 1000 + b;
      if (k === 0) push(loopIf(6, 0.95, 4, s), 0x10000);
      else if (k === 1) push(corrTrace(24, s), 0x20000);
      else if (k === 2) push(longLoop(16, 3, s), 0x30000);
      else if (k === 3) push(loopIf(3, 0.98, 6, s), 0x40000);
      else { for (let i = 0; i < 24; i++) { tr.push({ pc: 0x5040, t: r() < 0.5 ? 1 : 0, back: false }); tr.push({ pc: 0x5080, t: i < 23 ? 1 : 0, back: true }); } }
    }
    return tr;
  }
  const TRACES = {
    loop: () => loopIf(4, 0.9, 1500, 7),
    corr: () => corrTrace(4000, 3),
    long: () => longLoop(16, 400, 5),
    unsorted: () => sortTrace(1).tr.slice(0, 16384),
    mix: () => mixTrace()
  };
  const traceCache = {};
  const trace = k => traceCache[k] || (traceCache[k] = TRACES[k]());

  /* ── predictors ── */
  const idx = (pc, bits) => (pc >>> 2) & ((1 << bits) - 1);
  function makePred(kind, cfg) {
    cfg = cfg || {};
    if (kind === 'nt') return { predict: () => 0, update() {}, bits: 0 };
    if (kind === 'btfn') return { predict: (pc, b) => (b.back ? 1 : 0), update() {}, bits: 0 };
    if (kind === '1bit') {
      const n = cfg.bits || 12, tb = new Uint8Array(1 << n);
      return { predict: pc => tb[idx(pc, n)], update(pc, t) { tb[idx(pc, n)] = t; }, bits: 1 << n, state: pc => tb[idx(pc, n)] };
    }
    if (kind === '2bit') {
      // Smith (1981): a saturating counter 0..3 per entry; 2 and 3 predict taken. Starts at 1 (weakly not taken).
      const n = cfg.bits || 12, tb = new Uint8Array(1 << n).fill(1);
      return { predict: pc => (tb[idx(pc, n)] >= 2 ? 1 : 0), update(pc, t) { const i = idx(pc, n); tb[i] = t ? Math.min(3, tb[i] + 1) : Math.max(0, tb[i] - 1); }, bits: 2 * (1 << n), state: pc => tb[idx(pc, n)] };
    }
    if (kind === 'gshare') {
      // McFarling (1993): index = PC XOR the last h outcomes of all conditional branches, 2-bit counters
      const n = cfg.bits || 12, h = cfg.hist == null ? n : cfg.hist, tb = new Uint8Array(1 << n).fill(1), hm = h >= 31 ? 0x7fffffff : (1 << h) - 1;
      let ghr = 0;
      const ix = pc => (((pc >>> 2) ^ (ghr & hm)) & ((1 << n) - 1));
      return { predict: pc => (tb[ix(pc)] >= 2 ? 1 : 0), update(pc, t) { const i = ix(pc); tb[i] = t ? Math.min(3, tb[i] + 1) : Math.max(0, tb[i] - 1); ghr = ((ghr << 1) | t) & 0x7fffffff; }, bits: 2 * (1 << n), index: ix };
    }
    if (kind === 'tage') return makeTage(cfg);
    throw new Error('predictor ' + kind);
  }

  /* TAGE (Seznec & Michaud 2006; Seznec, "TAGE-SC-L branch predictors again", CBP-5 2016): a PC-indexed bimodal base
     T0 and M partially tagged tables Ti indexed with PC and the last L(i) global outcomes, L(i) = int(α^(i−1)·L(1)+0.5).
     Entry: 3-bit signed counter ctr, partial tag, 2-bit useful counter u. The longest matching table provides the
     prediction; the next match (or T0) is the alternate. On a misprediction one entry is allocated in a longer table
     whose u is 0, else the u of the longer tables are decremented. u counts when the provider beat the alternate;
     u is halved every 2^14 branches here (the papers reset it periodically). USE_ALT_ON_NA picks the alternate for a
     newly allocated entry while that has been the better choice. Small sizes chosen for this page. */
  const TAGE = { M: 4, Lmin: 4, Lmax: 64, tagBits: 8, ctrBits: 3, uBits: 2, uPeriod: 1 << 14 };
  function tageLengths(M, Lmin, Lmax) { const a = Math.pow(Lmax / Lmin, 1 / (M - 1)); return Array.from({ length: M }, (_, i) => Math.floor(Lmin * Math.pow(a, i) + 0.5)); }
  function makeTage(cfg) {
    const M = cfg.M || TAGE.M, lens = cfg.lens || tageLengths(M, cfg.Lmin || TAGE.Lmin, cfg.Lmax || TAGE.Lmax);
    const bBits = cfg.baseBits || 11, tBits = cfg.tblBits || 8, tagB = cfg.tagBits || TAGE.tagBits;
    const base = new Uint8Array(1 << bBits).fill(1), N = 1 << tBits;
    const ctr = lens.map(() => new Int8Array(N)), tag = lens.map(() => new Int32Array(N).fill(-1)), u = lens.map(() => new Uint8Array(N));
    const H = 256, hist = new Uint8Array(H); let hp = 0, count = 0, useAlt = 0;
    function fold(L, bits) { let v = 0, acc = 0, k = 0; for (let i = 0; i < L; i++) { acc |= hist[(hp - 1 - i + H * 4) % H] << k; k++; if (k === bits) { v ^= acc; acc = 0; k = 0; } } return (v ^ acc) & ((1 << bits) - 1); }
    let last = null;
    function lookup(pc) {
      const p = pc >>> 2, rows = [];
      for (let i = 0; i < M; i++) {
        const L = lens[i], ix = (p ^ (p >>> tBits) ^ fold(L, tBits) ^ (i * 0x9e5)) & (N - 1);
        const tg = (p ^ fold(L, tagB) ^ (fold(L, tagB - 1) << 1)) & ((1 << tagB) - 1);
        rows.push({ ix, tg, hit: tag[i][ix] === tg });
      }
      let prov = -1, alt = -1; for (let i = M - 1; i >= 0; i--) if (rows[i].hit) { if (prov < 0) prov = i; else if (alt < 0) alt = i; }
      const bi = p & ((1 << bBits) - 1), basePred = base[bi] >= 2 ? 1 : 0;
      const altPred = alt >= 0 ? (ctr[alt][rows[alt].ix] >= 0 ? 1 : 0) : basePred;
      let provPred = basePred, weak = false;
      if (prov >= 0) { const c = ctr[prov][rows[prov].ix]; provPred = c >= 0 ? 1 : 0; weak = (c === 0 || c === -1) && u[prov][rows[prov].ix] === 0; }
      const pred = prov >= 0 && weak && useAlt >= 0 ? altPred : provPred;
      last = { pc, rows, prov, alt, bi, basePred, altPred, provPred, weak, pred };
      return last;
    }
    const stats = { prov: new Array(M + 1).fill(0) };
    return {
      lens, bits: 2 * (1 << bBits) + M * N * (TAGE.ctrBits + tagB + TAGE.uBits), stats,
      predict(pc) { return lookup(pc).pred; },
      update(pc, t) {
        const L0 = last && last.pc === pc ? last : lookup(pc), { rows, prov, alt, bi } = L0;
        stats.prov[prov + 1]++;
        if (prov >= 0 && L0.weak && L0.provPred !== L0.altPred) useAlt = clamp(useAlt + (L0.altPred === t ? 1 : -1), -8, 7);
        if (L0.pred !== t && prov < M - 1) {
          let done = false;
          for (let j = prov + 1; j < M; j++) if (u[j][rows[j].ix] === 0) { tag[j][rows[j].ix] = rows[j].tg; ctr[j][rows[j].ix] = t ? 0 : -1; done = true; break; }
          if (!done) for (let j = prov + 1; j < M; j++) if (u[j][rows[j].ix] > 0) u[j][rows[j].ix]--;
        }
        if (prov >= 0) {
          const e = rows[prov].ix; ctr[prov][e] = clamp(ctr[prov][e] + (t ? 1 : -1), -4, 3);
          if (L0.weak) { if (alt >= 0) { const a = rows[alt].ix; ctr[alt][a] = clamp(ctr[alt][a] + (t ? 1 : -1), -4, 3); } else base[bi] = t ? Math.min(3, base[bi] + 1) : Math.max(0, base[bi] - 1); }
          if (L0.provPred !== L0.altPred) u[prov][e] = clamp(u[prov][e] + (L0.provPred === t ? 1 : -1), 0, 3);
        } else base[bi] = t ? Math.min(3, base[bi] + 1) : Math.max(0, base[bi] - 1);
        hist[hp] = t; hp = (hp + 1) % H; count++;
        if (count % TAGE.uPeriod === 0) for (let i = 0; i < M; i++) for (let k = 0; k < N; k++) u[i][k] >>= 1;
        last = null;
      }
    };
  }

  // run a predictor over a trace: accuracy overall and per static branch
  function runPred(pred, tr, keepSteps) {
    let miss = 0; const per = {}, steps = keepSteps ? [] : null;
    for (let i = 0; i < tr.length; i++) {
      const b = tr[i], st = pred.state ? pred.state(b.pc) : null, p = pred.predict(b.pc, b);
      const ok = p === b.t; if (!ok) miss++;
      const q = per[b.pc] || (per[b.pc] = { n: 0, miss: 0 }); q.n++; if (!ok) q.miss++;
      if (steps && i < keepSteps) steps.push({ pc: b.pc, t: b.t, p, ok, st });
      pred.update(b.pc, b.t);
    }
    return { n: tr.length, miss, acc: 1 - miss / tr.length, per, steps };
  }

  /* ── 02 the four simple predictors on the loop with an if ── */
  const STRIP = 48, ROWS = 14;
  const LOOPIF = { n: 400, seed: 7, Ks: [2, 3, 4, 5, 6, 8, 10, 12, 16], ps: [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99] };
  const SIMPLE = ['nt', 'btfn', '1bit', '2bit'];
  function simple(K, p, kind, keep) {
    const tr = loopIf(K, p, LOOPIF.n, LOOPIF.seed), r = runPred(makePred(kind), tr, keep);
    const inner = r.per[0x1080], fwd = r.per[0x1040];
    return { acc: r.acc, n: r.n, miss: r.miss, inner: inner.miss / inner.n, fwd: fwd.miss / fwd.n, steps: r.steps };
  }

  /* ── 02b sorted vs unsorted: misprediction rate on the if-branch and a cycle estimate from the ch1 formula ── */
  const DISORDER = [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1];
  const sortMemo = {};
  function sortRun(disorder, kind) {
    const k = disorder + ':' + kind; if (sortMemo[k]) return sortMemo[k];
    const { tr, d } = sortTrace(disorder), r = runPred(makePred(kind || '2bit'), tr), q = r.per[0x2040];
    const small = d.filter(x => x < SORT.thr).length;
    // per element: 4 instructions plus the add when data[c] >= 128, issued W per cycle, plus penalty per miss
    const instr = SORT.instr + (SORT.N - small) / SORT.N * SORT.add, missRate = q.miss / q.n;
    const cyc = instr / SORT.W + (r.miss / SORT.N) * SORT.P;
    return (sortMemo[k] = { missRate, misses: q.miss, loopMiss: r.per[0x2080].miss, cyc, instr });
  }
  const branchlessCyc = () => SORT.branchless / SORT.W + 0;   // the loop back-edge is predicted (1 miss in 32,768)

  /* ── 03 gshare: accuracy against history length ── */
  const GS = { traces: ['corr', 'loop4', 'mix'], sizes: [6, 10] };
  const gsTrace = k => (k === 'loop4' ? (traceCache.loop4 || (traceCache.loop4 = loopIf(4, 1, 1500, 9))) : trace(k));
  const gsMemo = {};
  function gshareAcc(tk, n, h) { const k = tk + n + ':' + h; if (gsMemo[k] == null) gsMemo[k] = runPred(makePred(h < 0 ? '2bit' : 'gshare', { bits: n, hist: h }), gsTrace(tk)).acc; return gsMemo[k]; }

  /* ── 04 2-bit vs gshare vs TAGE at equal storage ── */
  const BUDGETS = [4096, 8192, 16384, 32768];
  function budgetCfg(B) { const lg = Math.log2(B); return { bimodal: { bits: lg - 1 }, gshare: { bits: lg - 1 }, tage: { baseBits: lg - 3, tblBits: lg - 6 } }; }
  const CMP_TRACES = ['loop', 'corr', 'long', 'unsorted', 'mix'];
  const cmpMemo = {};
  function compare(tk, B) {
    const k = tk + ':' + B; if (cmpMemo[k]) return cmpMemo[k];
    const c = budgetCfg(B), tr = trace(tk);
    const p2 = makePred('2bit', c.bimodal), pg = makePred('gshare', c.gshare), pt = makePred('tage', c.tage);
    const a = runPred(p2, tr).acc, g = runPred(pg, tr).acc, tg = runPred(pt, tr);
    const tot = pt.stats.prov.reduce((x, y) => x + y, 0);
    return (cmpMemo[k] = { bimodal: a, gshare: g, tage: tg.acc, bits: { bimodal: p2.bits, gshare: pg.bits, tage: pt.bits }, longest: pt.stats.prov[TAGE.M] / tot, baseShare: pt.stats.prov[0] / tot, lens: pt.lens });
  }

  /* ── 05 returns: a return address stack against "last target" in the BTB, on nested calls ──
     A chain of functions f1 → f2 → … → fD, as a parser or a deep framework stack makes. Each function calls the next
     from one of two call sites (chosen at random), and now and then calls it twice, so the walk goes down to depth D
     and back up many times. A return from f(d) goes to one of the two call sites in f(d−1). The RAS is circular:
     past `size` nested calls the oldest entries are overwritten. The BTB alternative predicts each return
     instruction's last target. TUNED: the two-site, one-in-four-twice call pattern. */
  const RAS = { depths: [4, 8, 12, 16, 20, 24, 28, 32], sizes: [4, 8, 16, 24, 32, 52, 64], seed: 13, twice: 0.25, rounds: 3 };
  function callTrace(D) {
    const r = rng(RAS.seed + D), ev = [];
    function visit(d) { if (d >= D) return; const k = r() < RAS.twice ? 2 : 1; for (let i = 0; i < k; i++) { const site = d * 2 + (r() < 0.5 ? 0 : 1); ev.push({ call: site, fn: d + 1 }); visit(d + 1); ev.push({ ret: site, fn: d + 1 }); } }
    for (let i = 0; i < RAS.rounds; i++) visit(0);
    return ev;
  }
  const rasMemo = {};
  function rasRun(D, size) {
    const key = D + ':' + size; if (rasMemo[key]) return rasMemo[key];
    const ev = callTrace(D), st = new Array(size).fill(null), last = {}; let top = 0, depth = 0, miss = 0, rets = 0, maxD = 0, btbMiss = 0;
    for (const e of ev) {
      if (e.call != null) { st[top % size] = e.call; top++; depth++; maxD = Math.max(maxD, depth); }
      else {
        rets++; top--; depth--;
        if (st[top % size] !== e.ret) miss++;
        if (last[e.fn] !== e.ret) btbMiss++; last[e.fn] = e.ret;
      }
    }
    return (rasMemo[key] = { rets, miss, rate: miss / rets, btbRate: btbMiss / rets, maxDepth: maxD });
  }

  /* ── 06–09 the core simulator ──
     A loop of eight RISC-V instructions (dot product with pointer increments). Loads of a[i] miss once per 64-byte
     line (every 16th iteration) with a chosen latency; other loads hit L1 in ZEN.l1 cycles; mul 3, others 1.
     Modes: 'inorder' (issue in program order, W per cycle, stall on the first instruction whose operands are not
     ready or whose destination still has an older write pending, the scoreboard rule); 'scoreboard' (out of order
     but no renaming: an instruction waits for older readers of its destination to have read it, WAR, and older
     writers to finish, WAW: CDC 6600); 'ooo' (renaming onto physical registers, R10000-style, so only true
     dependences wait). Every mode dispatches W per cycle into a reorder buffer of R entries and commits W per cycle
     in order from its head. A mispredicted branch keeps fetching the wrong path until it executes; then everything
     younger is squashed and fetch resumes FE cycles later. A faulting instruction is handled when it reaches the head:
     everything is squashed and nothing younger has changed architectural state. */
  const CORE = { FE: 10, mul: 3, alu: 1, iters: 64, missEvery: 16, lineInts: 16 };   // FE TUNED: front-end refill so that a mispredict costs about ZEN.pen
  const BODY = [
    { op: 'lw', rd: 't0', rs: ['a0'], k: 'load', a: true, txt: 'lw   t0, 0(a0)' },
    { op: 'lw', rd: 't1', rs: ['a1'], k: 'load', txt: 'lw   t1, 0(a1)' },
    { op: 'mul', rd: 't2', rs: ['t0', 't1'], k: 'mul', txt: 'mul  t2, t0, t1' },
    { op: 'add', rd: 's0', rs: ['s0', 't2'], k: 'alu', txt: 'add  s0, s0, t2' },
    { op: 'addi', rd: 'a0', rs: ['a0'], k: 'alu', txt: 'addi a0, a0, 4' },
    { op: 'addi', rd: 'a1', rs: ['a1'], k: 'alu', txt: 'addi a1, a1, 4' },
    { op: 'addi', rd: 't3', rs: ['t3'], k: 'alu', txt: 'addi t3, t3, -1' },
    { op: 'bnez', rd: null, rs: ['t3'], k: 'br', txt: 'bnez t3, loop' }
  ];
  const REGS = ['t0', 't1', 't2', 't3', 's0', 'a0', 'a1'];
  function coreTrace(o) {
    // o: iters, miss (latency of the a[i] miss), missEvery, mispredAt (iteration whose branch is mispredicted),
    // faultAt (iteration whose first load faults), acc (each branch mispredicted with probability 1 − acc), seed
    const it = o.iters || CORE.iters, r = rng(o.seed || 31), tr = [];
    for (let i = 0; i < it; i++) for (let j = 0; j < BODY.length; j++) {
      const b = BODY[j], e = { op: b.op, rd: b.rd, rs: b.rs, k: b.k, txt: b.txt, it: i, j };
      if (b.k === 'load') e.lat = b.a && o.miss && i % (o.missEvery || CORE.missEvery) === 0 ? o.miss : ZEN.l1;
      else e.lat = b.k === 'mul' ? CORE.mul : CORE.alu;
      if (b.a && e.lat > ZEN.l1) e.miss = true;
      if (b.k === 'br') { if (o.dataBranch) { e.rs = ['t0', 't3']; e.txt = 'bnez t3, loop  (+ a[i])'; } if (i === o.mispredAt) e.mp = true; if (o.acc != null && o.acc < 1 && r() > o.acc) e.mp = true; }
      if (b.a && i === o.faultAt) e.fault = true;
      tr.push(e);
    }
    return tr;
  }
  function makeCore(o) {
    const W = o.width, R = o.rob, mode = o.mode, FE = o.fe == null ? CORE.FE : o.fe, tr = o.trace || coreTrace(o);
    const rob = []; let seq = 0, pc = 0, cycle = 0, committed = 0, resume = 0, wrong = null, done = false, fault = null, squashed = 0, nextId = 0;
    // renaming: physical registers p0..; RAT maps an architectural register to the physical register holding its value
    let nP = REGS.length; const rat = {}, ready = {}; REGS.forEach((r, i) => { rat[r] = 'p' + i; ready['p' + i] = 0; });
    const freeList = []; const physNext = () => (freeList.length ? freeList.shift() : 'p' + (nP++));
    const busy = []; let mlpSum = 0, mlpCycles = 0, maxInflight = 0, lastEvent = 0;
    function dispatchOne(e, ghost) {
      const x = { id: nextId++, e, ghost: !!ghost, issued: false, doneAt: Infinity, disp: cycle, src: [], dst: null, old: null };
      if (mode === 'ooo') { x.src = e.rs.map(r => rat[r]); if (e.rd) { x.old = rat[e.rd]; x.dst = physNext(); ready[x.dst] = Infinity; rat[e.rd] = x.dst; } }
      rob.push(x); return x;
    }
    function srcReady(x) {
      if (mode === 'ooo') return x.src.every(p => ready[p] <= cycle);
      // without renaming: the newest older writer of each source must have finished
      const i = rob.indexOf(x);
      for (const r of x.e.rs) for (let k = i - 1; k >= 0; k--) if (rob[k].e.rd === r) { if (rob[k].doneAt > cycle) return false; break; }
      return true;
    }
    function hazardFree(x) {
      if (mode === 'ooo' || !x.e.rd) return true;
      const i = rob.indexOf(x);
      for (let k = 0; k < i; k++) {
        const y = rob[k];
        if (y.e.rd === x.e.rd && y.doneAt > cycle) return false;                                // WAW
        if (mode === 'scoreboard' && !y.issued && y.e.rs.includes(x.e.rd)) return false;          // WAR
      }
      return true;
    }
    function squashAfter(k) {
      // undo younger entries newest first: restore the RAT and free their physical registers
      for (let i = rob.length - 1; i > k; i--) { const y = rob[i]; if (mode === 'ooo' && y.e.rd) { rat[y.e.rd] = y.old; freeList.push(y.dst); } squashed++; }
      rob.length = k + 1;
    }
    function step() {
      if (done) return false;
      let ev = false;
      // commit: up to W finished entries from the head, in order
      let c = 0;
      while (c < W && rob.length && rob[0].doneAt <= cycle && !rob[0].ghost) {
        const h = rob[0];
        if (h.e.fault) { fault = { it: h.e.it, cycle, committed }; squashAfter(-1); done = true; ev = true; break; }
        if (mode === 'ooo' && h.old) freeList.push(h.old);
        rob.shift(); committed++; c++; ev = true;
      }
      if (done) { lastEvent = cycle; return false; }
      // a mispredicted branch that has finished: squash the wrong path, restart fetch FE cycles later
      if (wrong && wrong.doneAt <= cycle) { const k = rob.indexOf(wrong); squashAfter(k); wrong.e = Object.assign({}, wrong.e, { mpResolved: true }); resume = cycle + FE; wrong = null; ev = true; }
      // issue: up to W ready entries, oldest first (in order: stop at the first that cannot go)
      let n = 0;
      for (let i = 0; i < rob.length && n < W; i++) {
        const x = rob[i]; if (x.issued) continue;
        if (x.disp >= cycle) { if (mode === 'inorder') break; continue; }
        if (srcReady(x) && hazardFree(x)) {
          x.issued = true; x.issueAt = cycle; x.doneAt = cycle + x.e.lat; if (x.dst) ready[x.dst] = x.doneAt; n++; ev = true;
          if (x.e.miss) busy.push(x);
        } else if (mode === 'inorder') break;
      }
      // dispatch: up to W instructions into the ROB (wrong-path copies while a mispredict is unresolved)
      let d = 0;
      while (d < W && rob.length < R && cycle >= resume) {
        if (wrong) { const g = BODY[(wrong.ghostK++) % BODY.length]; dispatchOne(Object.assign({}, g, { lat: g.k === 'load' ? ZEN.l1 : g.k === 'mul' ? CORE.mul : 1, it: -1 }), true); d++; ev = true; continue; }
        if (pc >= tr.length) break;
        const e = tr[pc++], x = dispatchOne(e); d++; ev = true;
        if (e.mp) { wrong = x; x.ghostK = 0; }
      }
      const inflight = busy.filter(x => x.issueAt <= cycle && x.doneAt > cycle && rob.includes(x)).length;
      if (inflight) { mlpSum += inflight; mlpCycles++; }
      maxInflight = Math.max(maxInflight, rob.length);
      if (pc >= tr.length && !rob.length && !wrong) { done = true; lastEvent = cycle; }
      if (ev) lastEvent = cycle;
      cycle++;
      return ev;
    }
    function run() {
      let guard = 0;
      while (!done && guard++ < 2e6) {
        const ev = step();
        if (!ev && !done) {
          // nothing happened this cycle: jump to the next completion or the fetch restart
          let nx = Infinity; for (const x of rob) if (x.issued && x.doneAt >= cycle) nx = Math.min(nx, x.doneAt);
          if (resume >= cycle) nx = Math.min(nx, resume);
          if (wrong && wrong.doneAt >= cycle) nx = Math.min(nx, wrong.doneAt);
          if (nx !== Infinity && nx > cycle) { const inflight = busy.filter(x => x.issueAt < cycle && x.doneAt > cycle && rob.includes(x)).length; if (inflight) { mlpSum += inflight * (nx - cycle); mlpCycles += nx - cycle; } cycle = nx; }
        }
      }
      return stats();
    }
    function stats() { const cyc = lastEvent + 1; return { cycles: cyc, committed, ipc: committed / cyc, squashed, fault, mlp: mlpCycles ? mlpSum / mlpCycles : 0, maxInflight }; }
    return { step, run, stats, get cycle() { return cycle; }, get rob() { return rob; }, get rat() { return rat; }, get committed() { return committed; }, get done() { return done; }, get fault() { return fault; }, get squashed() { return squashed; }, get pc() { return pc; }, get wrong() { return wrong; }, get resume() { return resume; }, trace: tr, W, R, mode };
  }
  function coreRun(o) { return makeCore(o).run(); }
  const coreMemo = {};
  function coreCached(o) { const k = JSON.stringify(o); return coreMemo[k] || (coreMemo[k] = coreRun(o)); }

  /* ── 06 superscalar: in-order issue against out-of-order, all loads hitting ── */
  const WIDTHS = [1, 2, 3, 4, 6, 8];
  function ilp(width) {
    const io = coreCached({ width, rob: 64, mode: 'inorder', iters: 64 }), oo = coreCached({ width, rob: 256, mode: 'ooo', iters: 64 });
    return { inorder: io.ipc, ooo: oo.ipc };
  }
  // issue-slot timeline for the first cycles of the in-order or out-of-order core: [{cycle, slots: [op kinds]}]
  function slotTimeline(width, mode, cycles) {
    const c = makeCore({ width, rob: 64, mode, iters: 16 }), rows = [];
    for (let k = 0; k < cycles && !c.done; k++) {
      const before = new Set(c.rob.filter(x => x.issued).map(x => x.id));
      const cyc = c.cycle; c.step();
      rows.push({ cycle: cyc, slots: c.rob.filter(x => x.issued && x.issueAt === cyc).map(x => x.e.k) });
      void before;
    }
    return rows;
  }

  /* ── 07 the stepped core: default settings ── */
  const STEP = { iters: 12, missEvery: 2, robs: [8, 16, 32], miss: { l2: ZEN.l2, l3: ZEN.l3, mem: CHIPS.dramCycles } };
  function stepCore(mode, rob, missKey, extra) {
    return makeCore(Object.assign({ width: 4, rob, mode, iters: STEP.iters, miss: STEP.miss[missKey], missEvery: STEP.missEvery }, extra || {}));
  }

  /* ── 09 how big a window: IPC against ROB size, misses to memory, branch accuracy ── */
  const WIN = { robs: [16, 32, 64, 128, 256, 512], accs: [1, 0.99, 0.95, 0.9], iters: 512, width: 8 };
  function windowRun(rob, acc, missKey) {
    return coreCached({ width: WIN.width, rob, mode: 'ooo', iters: WIN.iters, miss: STEP.miss[missKey || 'l3'], acc, seed: 77 });
  }
  const between = (fbr, acc) => 1 / (fbr * (1 - acc));

  /* ── 10 the toy machine for Spectre v1: if (x < array1_size) y = array2[array1[x] * 64]; ──
     Memory: array1 holds 16 public bytes 1..16; the secret follows it. array2 is 256 lines, one per byte value.
     Cache: a set of line addresses with flush; a hit costs ZEN.l1 cycles, a miss CHIPS.dramCycles. The bounds branch
     is predicted by a 2-bit counter (ch2). When array1_size is not cached the compare resolves only after its miss;
     in that window the core runs ahead on the predicted path. Loads issued in the window fill the cache even though
     their results are thrown away. Timing a probe read gives hit or miss plus Gaussian noise. Nothing here touches
     real hardware. */
  const SPEC = { size: 16, secret: 'Squeamish', hit: ZEN.l1, miss: CHIPS.dramCycles, thr: 100, train: 6, noises: [0, 10, 20, 40, 80, 120, 160], seed: 99 };
  function makeToy(o) {
    o = o || {};
    const mit = o.mit || 'none', noise = o.noise == null ? 20 : o.noise, r = rng(o.seed || SPEC.seed);
    const mem = []; for (let i = 0; i < SPEC.size; i++) mem.push(i + 1); for (const ch of SPEC.secret) mem.push(ch.charCodeAt(0));
    const cache = new Set(['size', 'a1']); let ctr = 1;   // array1, the secret and array1_size are cached; counter weakly not taken
    const lat = k => (cache.has(k) ? SPEC.hit : SPEC.miss);
    function call(x) {
      const sizeLat = lat('size'), inb = x < SPEC.size, predTaken = ctr >= 2;
      let window = 0, spec = null;
      if (mit === 'lfence') window = 0;                       // nothing younger than the fence runs before the compare
      else if (predTaken) window = sizeLat + 1;               // compare resolves one cycle after array1_size arrives
      const xi = mit === 'mask' ? x & (SPEC.size - 1) : x;    // index masking: array1_size is a power of two here
      if (window > 0 && !inb) {
        // speculative: read array1[x] (cached, hit) and issue the array2 load if there is time
        const v = mem[xi], t1 = lat('a1');
        if (t1 < window) { cache.add('l' + v); spec = v; }
      }
      if (inb) cache.add('l' + mem[xi]);                      // the architectural path
      cache.add('size');
      // time of the call for an in-bounds hit: none = loads overlap the compare; lfence waits for it; mask adds an AND
      const cost = mit === 'lfence' ? sizeLat + 1 + 2 * SPEC.hit : mit === 'mask' ? 1 + 2 * SPEC.hit : 2 * SPEC.hit;
      ctr = inb ? Math.min(3, ctr + 1) : Math.max(0, ctr - 1);
      return { spec, window, cost, inb };
    }
    function flush() { for (let v = 0; v < 256; v++) cache.delete('l' + v); cache.delete('size'); }
    function probe() { const t = []; for (let v = 0; v < 256; v++) t.push((cache.has('l' + v) ? SPEC.hit : SPEC.miss) + noise * gauss(r)); return t; }
    // one attempt at byte k of the secret: train, flush, attack, probe
    function readByte(k, train) {
      train = train == null ? SPEC.train : train;
      for (let i = 0; i < train; i++) call(i % SPEC.size);
      flush();
      const a = call(SPEC.size + k), t = probe();
      // hits: lines read faster than the threshold, excluding none (the training lines were flushed)
      const hits = []; t.forEach((x, v) => { if (x < SPEC.thr) hits.push(v); });
      let best = -1, bt = Infinity; t.forEach((x, v) => { if (x < bt) { bt = x; best = v; } });
      const guess = hits.length === 1 ? hits[0] : null;
      return { times: t, hits, guess, best, spec: a.spec, window: a.window, truth: mem[SPEC.size + k], ok: guess === mem[SPEC.size + k] };
    }
    return { call, flush, probe, readByte, get ctr() { return ctr; }, mem, mit };
  }
  // read the whole secret once with a given mitigation, noise and training count
  function leak(mit, noise, train, seed) {
    const toy = makeToy({ mit, noise, seed }), out = [];
    for (let k = 0; k < SPEC.secret.length; k++) out.push(toy.readByte(k, train));
    return { bytes: out, ok: out.filter(b => b.ok).length, n: out.length };
  }
  function callCost(mit) { return makeToy({ mit }).call(0).cost; }

  /* ── frontier facts (as of 2026-11; sources in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    bpi: { name: 'Branch Privilege Injection', cve: 'CVE-2024-45332', kibps: 5.6, ucode: 2.7, swMin: 1.6, swMax: 8.3, venue: 'USENIX Security 2025' },
    btr: { name: 'Branch Target Reuse', cves: ['CVE-2026-64507', 'CVE-2026-64508'], bps: 8, venue: 'ACM CCS 2026', reported: '2026-09-30' },
    retbleed: { amd: 14, intel: 39, venue: 'USENIX Security 2022' },
    cbp: { date: '2025-06-21', baselineKB: 64, budgetKB: 192 },
    spectre: { kbps: 10, err: 0.01, mitMax: 4 },
    so: { slow: 11.54, fast: 1.93, asked: '2012-06-27' }
  };

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  function prose() {
    const a1 = cpi({ width: 1, penalty: COST.a1Pen, acc: 0.95 }), z95 = cpi({ width: ZEN.width, penalty: ZEN.pen, acc: 0.95 }), z99 = cpi({ width: ZEN.width, penalty: ZEN.pen, acc: 0.99 }), z90 = cpi({ width: ZEN.width, penalty: ZEN.pen, acc: 0.9 });
    const zf1 = cpi({ width: ZEN.width, penalty: ZEN.pen, acc: 0.95, fbr: 1 / 10 }), zf3 = cpi({ width: ZEN.width, penalty: ZEN.pen, acc: 0.95, fbr: 1 / 3 });
    const s2 = simple(4, 0.9, '2bit'), s1 = simple(4, 0.9, '1bit'), sn = simple(4, 0.9, 'nt'), sb = simple(4, 0.9, 'btfn');
    const so = sortRun(0), su = sortRun(1), s5 = sortRun(0.05);
    const cg = n => compare('mix', n), c16 = cg(16384), cl = compare('long', 16384), cc = compare('corr', 16384), cu = compare('unsorted', 16384), c4 = cg(4096), c32 = cg(32768);
    const ras16 = rasRun(24, 16), ras24 = rasRun(24, 24), ras32 = rasRun(32, 24);
    const i1 = ilp(1), i4 = ilp(4), i8 = ilp(8);
    const st = m => coreCached({ width: 4, rob: 32, mode: m, iters: STEP.iters, miss: STEP.miss.l3, missEvery: STEP.missEvery });
    const sIn = st('inorder'), sSb = st('scoreboard'), sOo = st('ooo'), s16 = coreCached({ width: 4, rob: 16, mode: 'ooo', iters: STEP.iters, miss: STEP.miss.l3, missEvery: STEP.missEvery });
    const mp = coreCached({ width: 4, rob: 16, mode: 'ooo', iters: STEP.iters, mispredAt: 2 }), mp0 = coreCached({ width: 4, rob: 16, mode: 'ooo', iters: STEP.iters });
    const fl = coreCached({ width: 4, rob: 16, mode: 'ooo', iters: STEP.iters, faultAt: 3 });
    const w = (r, a) => windowRun(r, a), w64 = w(64, 1), w512 = w(512, 1), w512b = w(512, 0.95), w512c = w(512, 0.99), w128 = w(128, 1), win = coreCached({ width: WIN.width, rob: 64, mode: 'inorder', iters: WIN.iters, miss: STEP.miss.l3 });
    const lk = leak('none', 20, SPEC.train), lkF = leak('lfence', 20, SPEC.train), lkM = leak('mask', 20, SPEC.train), lk0 = leak('none', 20, 0), lkN = leak('none', 160, SPEC.train);
    return {
      // ch1
      zPen: [ZEN.pen, 0], zPenMin: [ZEN.penMin, 0], zPenMax: [ZEN.penMax, 0], zW: [ZEN.width, 0], fbrN: [1 / COST.fbr, 0],
      a1Lost: [a1.lost, 0, 'pct'], z95Lost: [z95.lost, 0, 'pct'], z99Lost: [z99.lost, 0, 'pct'], z90Lost: [z90.lost, 0, 'pct'], z95Ipc: [z95.ipc, 1], z99Ipc: [z99.ipc, 1], zSlots: [z95.slots, 0],
      a1Pen: [COST.a1Pen, 0], fbr10: [10, 0], fbr3: [3, 0], zf1Lost: [zf1.lost, 0, 'pct'], zf3Lost: [zf3.lost, 0, 'pct'], per99: [z99.perMiss, 0], per95: [z95.perMiss, 0],
      // ch2
      s2acc: [s2.acc, 1, 'pct'], s1acc: [s1.acc, 1, 'pct'], snacc: [sn.acc, 1, 'pct'], sbacc: [sb.acc, 1, 'pct'], s2in: [s2.inner, 0, 'pct'], s1in: [s1.inner, 0, 'pct'], s2fw: [s2.fwd, 1, 'pct'], s1fw: [s1.fwd, 1, 'pct'], sbfw: [sb.fwd, 0, 'pct'],
      soN: [SORT.N, 0], soMiss: [so.misses, 0], suRate: [su.missRate, 1, 'pct'], s5Rate: [s5.missRate, 1, 'pct'], suCyc: [su.cyc, 1], soCyc: [so.cyc, 2], soX: [su.cyc / so.cyc, 1], blCyc: [branchlessCyc(), 2],
      soSlow: [FRONTIER.so.slow, 2], soFast: [FRONTIER.so.fast, 2], soMeas: [FRONTIER.so.slow / FRONTIER.so.fast, 0], soW: [SORT.W, 0], blN: [SORT.branchless, 0], strip: [STRIP, 0],
      // ch3
      gcBi: [gshareAcc('corr', 10, -1), 1, 'pct'], gc2: [gshareAcc('corr', 10, 2), 1, 'pct'], gl0: [gshareAcc('loop4', 10, -1), 1, 'pct'], gl8: [gshareAcc('loop4', 10, 8), 1, 'pct'],
      gm6: [gshareAcc('mix', 6, 6), 1, 'pct'], gm6b: [gshareAcc('mix', 6, -1), 1, 'pct'], gm10: [gshareAcc('mix', 10, 10), 1, 'pct'],
      // ch4
      tL1: [c16.lens[0], 0], tL2: [c16.lens[1], 0], tL3: [c16.lens[2], 0], tL4: [c16.lens[3], 0], tM: [TAGE.M, 0],
      cmB: [c16.bimodal, 1, 'pct'], cmG: [c16.gshare, 1, 'pct'], cmT: [c16.tage, 1, 'pct'], clG: [cl.gshare, 1, 'pct'], clT: [cl.tage, 1, 'pct'],
      ccG: [cc.gshare, 1, 'pct'], ccT: [cc.tage, 1, 'pct'], cuB: [cu.bimodal, 1, 'pct'], cuT: [cu.tage, 1, 'pct'], c4T: [c4.tage, 1, 'pct'], c32T: [c32.tage, 1, 'pct'], c32G: [c32.gshare, 1, 'pct'],
      // ch5
      zBtb1: [ZEN.l1btb / 1024, 0], zBtb2: [ZEN.l2btb / 1024, 0], zRas: [ZEN.ras, 0], zInd: [ZEN.indirect, 0], lcRas: [CHIPS.lionCove.ras, 0], xRas: [CHIPS.x925.ras, 0],
      r16: [ras16.rate, 1, 'pct'], r24: [ras24.rate, 1, 'pct'], r32: [ras32.rate, 1, 'pct'], rBtb: [ras16.btbRate, 0, 'pct'],
      // ch6
      rows: [ROWS, 0], lat: [ZEN.l1, 0], i1in: [i1.inorder, 2], i4in: [i4.inorder, 2], i8in: [i8.inorder, 2], i4oo: [i4.ooo, 2], i8oo: [i8.ooo, 2],
      // ch7
      stIn: [sIn.cycles, 0], stSb: [sSb.cycles, 0], stOo: [sOo.cycles, 0], st16: [s16.cycles, 0], stX: [sIn.cycles / sOo.cycles, 1], stN: [STEP.iters * BODY.length, 0], stL3: [ZEN.l3, 0], stIt: [STEP.iters, 0], l2: [ZEN.l2, 0], l3: [ZEN.l3, 0], mem: [CHIPS.dramCycles, 0], memC: [CHIPS.dramCycles, 0], stEvery: [STEP.missEvery, 0], stMax: [sOo.maxInflight, 0],
      // ch8
      mpCyc: [mp.cycles, 0], mp0Cyc: [mp0.cycles, 0], mpSq: [mp.squashed, 0], mpLoss: [mp.cycles - mp0.cycles, 0], flCom: [fl.fault ? fl.fault.committed : -1, 0], feN: [CORE.FE, 0],
      // ch9
      zRob: [ZEN.rob, 0], zRobT: [ZEN.robSmt, 0], lcRob: [CHIPS.lionCove.rob, 0], lcPrev: [CHIPS.lionCove.prevRob, 0], lcW: [CHIPS.lionCove.width, 0], xRob: [CHIPS.x925.robMeasured, 0], xW: [CHIPS.x925.width, 0], xClaim: [CHIPS.x925.claimed, 0], hwRob: [CHIPS.haswell.rob, 0], zPrf: [ZEN.prf, 0],
      w64: [w64.ipc, 2], w128: [w128.ipc, 2], w512: [w512.ipc, 2], w512b: [w512b.ipc, 2], w512c: [w512c.ipc, 2], wIn: [win.ipc, 2], wMlp: [w512.mlp, 1], wMem: [windowRun(512, 1, 'mem').ipc, 2], wMem64: [windowRun(64, 1, 'mem').ipc, 2], btw95: [between(1 / BODY.length, 0.95), 0], btw99: [between(1 / BODY.length, 0.99), 0], wBody: [BODY.length, 0], wLine: [CORE.missEvery, 0],
      // ch10
      spSec: [SPEC.secret.length, 0], spOk: [lk.ok, 0], spOkF: [lkF.ok, 0], spOkM: [lkM.ok, 0], spOk0: [lk0.ok, 0], spOkN: [lkN.ok, 0], spTrain: [SPEC.train, 0], spNoise: [160, 0], hit: [SPEC.hit, 0], miss: [SPEC.miss, 0], a1n: [SPEC.size, 0],
      cNone: [callCost('none'), 0], cFence: [callCost('lfence'), 0], cMask: [callCost('mask'), 0], spRate: [FRONTIER.spectre.kbps, 0], spMit: [FRONTIER.spectre.mitMax, 0],
      // ch11
      bpiRate: [FRONTIER.bpi.kibps, 1], bpiU: [FRONTIER.bpi.ucode, 1], bpiSw1: [FRONTIER.bpi.swMin, 1], bpiSw2: [FRONTIER.bpi.swMax, 1], btrRate: [FRONTIER.btr.bps, 0], rbA: [FRONTIER.retbleed.amd, 0], rbI: [FRONTIER.retbleed.intel, 0], cbpBase: [FRONTIER.cbp.baselineKB, 0], cbpB: [FRONTIER.cbp.budgetKB, 0]
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
    cost(width, penalty, acc) { const v = cpi({ width, penalty, acc }); return { key: v.lost < 0.1 ? 'ch1.say.cheap' : v.lost < 0.4 ? 'ch1.say.mid' : 'ch1.say.dear', v }; },
    simple(K, p, kind) { const v = simple(K, p, kind); if (kind === 'nt') return { key: 'ch2.say.nt', v }; if (kind === 'btfn') return { key: p >= 0.5 ? 'ch2.say.btfn' : 'ch2.say.btfnok', v }; if (kind === '1bit') return { key: 'ch2.say.1bit', v }; return { key: 'ch2.say.2bit', v }; },
    sort(disorder, branchless) { const v = sortRun(disorder); if (branchless) return { key: 'ch2.say.bl', v }; return { key: disorder === 0 ? 'ch2.say.sorted' : v.missRate > 0.3 ? 'ch2.say.random' : 'ch2.say.some', v }; },
    gshare(tk, n, h) { const g = gshareAcc(tk, n, h), b = gshareAcc(tk, n, -1), v = { g, b }; if (h === 0) return { key: 'ch3.say.h0', v }; if (g > b + 0.005) return { key: 'ch3.say.better', v }; if (g < b - 0.005) return { key: 'ch3.say.worse', v }; return { key: 'ch3.say.same', v }; },
    compare(tk, B) { const v = compare(tk, B); if (tk === 'unsorted') return { key: 'ch4.say.random', v }; const best = Math.max(v.bimodal, v.gshare, v.tage); return { key: v.tage >= best - 0.0005 ? 'ch4.say.tage' : 'ch4.say.other', v }; },
    ras(n, size) { const v = rasRun(n, size); return { key: v.miss === 0 ? 'ch5.say.fits' : 'ch5.say.over', v }; },
    ilp(width) { const v = ilp(width); return { key: width === 1 ? 'ch6.say.one' : 'ch6.say.wide', v }; },
    window(rob, acc) { const v = windowRun(rob, acc); return { key: acc === 1 ? 'ch9.say.perfect' : 'ch9.say.guess', v }; },
    spectre(r, mit, train) { if (mit === 'lfence') return { key: 'ch10.say.fence', v: r }; if (train === 0 || r.spec == null) return { key: mit === 'mask' ? 'ch10.say.mask' : 'ch10.say.untrained', v: r }; if (mit === 'mask') return { key: 'ch10.say.mask', v: r }; return { key: r.ok ? 'ch10.say.leak' : 'ch10.say.noisy', v: r }; }
  };

  return { CHIPS, ZEN, rng, COST, cpi, loopIf, SORT, sortData, sortTrace, corrTrace, longLoop, MIX, mixTrace, TRACES, trace, makePred, TAGE, tageLengths, makeTage, runPred,
    LOOPIF, SIMPLE, simple, DISORDER, sortRun, branchlessCyc, GS, gshareAcc, BUDGETS, budgetCfg, CMP_TRACES, compare, callTrace, RAS, rasRun,
    CORE, BODY, REGS, coreTrace, makeCore, coreRun, coreCached, WIDTHS, ilp, slotTimeline, STEP, stepCore, WIN, windowRun, between, SPEC, makeToy, leak, callCost,
    FRONTIER, prose, fmt, say, clamp };
});
