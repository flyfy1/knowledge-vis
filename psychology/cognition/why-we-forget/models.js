/* Why we forget: the models and the transcribed data behind every chart on the page.
 * Pure functions and constants only (no DOM). Loaded by index.html as window.ForgetModels and by
 * tests/models.cjs via require(). Every number the prose states is recomputed from here by the node test.
 *
 * Sources (full citations in BRIEF.md):
 *   forgetting.DATA   Murre & Dros 2015, PLoS ONE 10(7):e0120644, Table 3 (savings) and Table 5 (power fits).
 *   actr              Pavlik & Anderson 2003, ICCM-5 pp. 177–182, Equations 1–4 and Table 1 (fitted parameters).
 *   cepeda            Cepeda, Vul, Rohrer, Wixted & Pashler 2008, Psychol Sci 19:1095–1102: Fig. 3a points
 *                     (read off the figure, ±0.02), optimal gaps and gains from the Results text, and the
 *                     retention surface from the Discussion (b, p, a, c, d).
 *   fsrs              FSRS-6 as implemented in py-fsrs (open-spaced-repetition), default parameters.
 *   rk                Roediger & Karpicke 2006, Psychol Sci 17:249–255, Results text and Tables 1–2.
 *   kb                Kornell & Bjork 2008, Psychol Sci 19:585–592, Results text. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ForgetModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const MIN = 60, HOUR = 3600, DAY = 86400;
  const LN2 = Math.log(2);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* Seeded RNG (mulberry32), so every simulated run is repeatable. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ───────── 1 · The forgetting curve: savings data and two-parameter fits ─────────
   * Savings Q = (time to learn − time to relearn) / time to learn. Times in seconds, as in Murre & Dros
   * Table 5. Ebbinghaus's short intervals are 19 min, 63 min and 8.75 h (their note to Table 3). */
  const T_EBB = [19 * MIN, 63 * MIN, 8.75 * HOUR, DAY, 2 * DAY, 6 * DAY, 31 * DAY];
  const T_REP = [20 * MIN, HOUR, 9 * HOUR, DAY, 2 * DAY, 6 * DAY, 31 * DAY];
  const forgetting = {
    DATA: {
      ebb:   { t: T_EBB, q: [0.582, 0.442, 0.358, 0.337, 0.278, 0.254, 0.211], year: 1885 },
      mack:  { t: T_REP, q: [0.544, 0.432, 0.285, 0.316, 0.365, 0.309, 0.258], year: 1991 },
      seitz: { t: T_REP, q: [0.442, 0.325, 0.270, 0.270, 0.286, 0.205, 0.201], year: 1991 },
      dros:  { t: T_REP, q: [0.472, 0.373, 0.276, 0.317, 0.230, 0.168, 0.041], year: 2015 }
    },
    // Murre & Dros Table 5, power function Q = μ·t^(−a), t in seconds (for the test to compare against)
    PUBLISHED_POWER: { ebb: { mu: 1.4, a: 0.13 }, mack: { mu: 0.965, a: 0.0926, ssd: 0.0129 }, seitz: { mu: 0.822, a: 0.099, ssd: 0.00523 }, dros: { mu: 1.56, a: 0.167, ssd: 0.0163 } },
    // shape of each family with its scale left out: the scale μ is then solved exactly by least squares
    shape: { exp: (t, k) => Math.exp(-k * t), pow: (t, a) => Math.pow(t, -a) },
    // decay parameter range on the page (log-spaced slider): exp k per second, pow exponent a
    RANGE: { exp: [1e-7, 1e-4], pow: [0.02, 0.6] },
    // for a given shape parameter, the best scale and the sum of squared differences
    evaluate(key, family, p) {
      const d = forgetting.DATA[key], f = forgetting.shape[family];
      const x = d.t.map(t => f(t, p));
      let sxy = 0, sxx = 0; for (let i = 0; i < x.length; i++) { sxy += x[i] * d.q[i]; sxx += x[i] * x[i]; }
      const mu = sxy / sxx;
      let ssd = 0; for (let i = 0; i < x.length; i++) ssd += (mu * x[i] - d.q[i]) ** 2;
      const mean = d.q.reduce((s, v) => s + v, 0) / d.q.length;
      const sst = d.q.reduce((s, v) => s + (v - mean) ** 2, 0);
      return { p, mu, ssd, r2: 1 - ssd / sst, at: t => mu * f(t, p) };
    },
    // least-squares fit: dense log grid, then golden-section refinement
    fit(key, family) {
      const [lo, hi] = forgetting.RANGE[family], L0 = Math.log(lo), L1 = Math.log(hi), N = 600;
      let bi = 0, bs = Infinity;
      for (let i = 0; i <= N; i++) { const s = forgetting.evaluate(key, family, Math.exp(L0 + (L1 - L0) * i / N)).ssd; if (s < bs) { bs = s; bi = i; } }
      let a = L0 + (L1 - L0) * Math.max(0, bi - 1) / N, b = L0 + (L1 - L0) * Math.min(N, bi + 1) / N;
      const g = (Math.sqrt(5) - 1) / 2;
      for (let it = 0; it < 80; it++) {
        const c = b - g * (b - a), d = a + g * (b - a);
        if (forgetting.evaluate(key, family, Math.exp(c)).ssd < forgetting.evaluate(key, family, Math.exp(d)).ssd) b = d; else a = c;
      }
      return forgetting.evaluate(key, family, Math.exp((a + b) / 2));
    }
  };

  /* ───────── 2 · Many exponentials averaged: a gamma mixture is exactly a power-type curve ─────────
   * Each item decays as e^(−k t). If k is gamma-distributed with shape α and mean k̄ (rate β = α/k̄),
   * the average is ∫ e^(−k t) Gamma(k; α, β) dk = (1 + t/β)^(−α)  (the Laplace transform of the gamma density).
   * The spread of rates is reported as the coefficient of variation CV = 1/√α. CV → 0 is a single exponential. */
  const mixture = {
    kbar: halfLifeDays => LN2 / halfLifeDays,                 // mean rate per day
    alpha: cv => 1 / (cv * cv),
    mean(t, halfLifeDays, cv) {                               // exact average retention at t days
      const k = mixture.kbar(halfLifeDays);
      if (cv < 1e-6) return Math.exp(-k * t);
      const a = mixture.alpha(cv), beta = a / k;
      return Math.pow(1 + t / beta, -a);
    },
    single: (t, halfLifeDays) => Math.exp(-mixture.kbar(halfLifeDays) * t),
    // the long-run log–log slope of the average: −α (the curve is a power law in t for t ≫ β)
    tailSlope: cv => -mixture.alpha(cv),
    // Marsaglia–Tsang gamma sampler (shape α, rate β) driven by the seeded RNG; used for the drawn items
    sampleRates(n, halfLifeDays, cv, seed) {
      const k = mixture.kbar(halfLifeDays);
      if (cv < 1e-6) return Array(n).fill(k);
      const R = rng(seed), a = mixture.alpha(cv), beta = a / k;
      const normal = () => { let u = 0, v = 0; while (u === 0) u = R(); v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      const gam = shape => {
        if (shape < 1) return gam(shape + 1) * Math.pow(R() || 1e-12, 1 / shape);
        const d = shape - 1 / 3, c = 1 / Math.sqrt(9 * d);
        for (;;) { let x, v; do { x = normal(); v = 1 + c * x; } while (v <= 0); v = v * v * v; const u = R(); if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v; }
      };
      const out = []; for (let i = 0; i < n; i++) out.push(gam(a) / beta); return out;
    }
  };

  /* ───────── 3 · ACT-R activation with activation-dependent decay (Pavlik & Anderson 2003) ─────────
   * m(t) = ln Σ_j t_j^(−d_j)   (Eq. 1/4: each practice j leaves a trace that decays as a power of its age t_j)
   * d_j  = c·e^(m_j) + a         (Eq. 3: m_j is the activation at the moment of practice j; the first practice has m = −∞)
   * p    = 1 / (1 + e^((τ − m)/s))   (Eq. 2)
   * Time is in seconds. Time between sessions is multiplied by h ("psychological time"); here an interval of an hour
   * or more counts as between sessions, a shorter one as within a session. Table 1 values, fitted by χ² to 162 points
   * of one Japanese–English vocabulary experiment with 1- and 7-day retention intervals. */
  const actr = {
    P: { a: 0.167, c: 0.232, s: 0.252, tau: -0.669, h: 0.031 },
    SESSION: HOUR,
    psych: sec => (sec < HOUR ? sec : sec * actr.P.h),
    // gap options offered on the page (real seconds)
    GAPS: [30, 10 * MIN, DAY, 2 * DAY, 4 * DAY, 7 * DAY, 14 * DAY, 30 * DAY],
    // build the traces: practice times on the psychological clock and each trace's decay rate
    traces(times) {
      const d = [];
      const act = (t, k) => { let s = 0; for (let j = 0; j < k; j++) s += Math.pow(Math.max(t - times[j], 1e-9), -d[j]); return Math.log(s); };
      for (let i = 0; i < times.length; i++) { const m = i ? act(times[i], i) : -Infinity; d.push(actr.P.c * Math.exp(m) + actr.P.a); }
      return { times, d, act: t => act(t, times.length) };
    },
    recallFromM: m => 1 / (1 + Math.exp((actr.P.tau - m) / actr.P.s)),
    // n practices separated by `gap` real seconds; returns a function of real seconds since the last practice
    schedule(n, gap) {
      const times = [0]; for (let i = 1; i < n; i++) times.push(times[i - 1] + actr.psych(gap));
      const tr = actr.traces(times), last = times[n - 1];
      return { d: tr.d, recallAfter: sec => actr.recallFromM(tr.act(last + actr.psych(sec))) };
    },
    recall(n, gap, riSec) { return actr.schedule(n, gap).recallAfter(riSec); },
    bestGap(n, riSec) { let best = null; for (const g of actr.GAPS) { const p = actr.recall(n, g, riSec); if (!best || p > best.p + 1e-12) best = { gap: g, p }; } return best; },
    // Cepeda et al.'s design run through the same model: session 1 = three encodings 20 s apart (learning to a
    // criterion, simplified), gap g days, session 2 = two encodings 20 s apart, final test after RI days.
    cepedaRecall(gDays, riDays) {
      const T = [0, 20, 40]; let t = 40 + (gDays > 0 ? actr.psych(gDays * DAY) : 180);
      T.push(t, t + 20);
      const tr = actr.traces(T);
      return actr.recallFromM(tr.act(t + 20 + actr.psych(riDays * DAY)));
    },
    cepedaOptimum(riDays) { // grid in gap days 0.1…400, then refine
      let bg = 0.1, bp = -1;
      for (let i = 0; i <= 400; i++) { const g = 0.1 * Math.pow(4000, i / 400), p = actr.cepedaRecall(g, riDays); if (p > bp) { bp = p; bg = g; } }
      let lo = bg / 1.03, hi = bg * 1.03; const gr = (Math.sqrt(5) - 1) / 2;
      for (let it = 0; it < 60; it++) { const c = hi - gr * (hi - lo), d = lo + gr * (hi - lo); if (actr.cepedaRecall(c, riDays) > actr.cepedaRecall(d, riDays)) hi = d; else lo = c; }
      return (lo + hi) / 2;
    }
  };

  /* ───────── 4 · Cepeda et al. 2008: the gap that works best depends on the retention interval ─────────
   * POINTS: final recall (proportion correct) read off Fig. 3a, ±0.02. They reproduce the paper's stated gains of the
   * best tested gap over a zero gap (10, 59, 111, 77 %) within reading error; the node test checks that.
   * The surface is the paper's fitted function: recall = A·(b·t + 1)^(−R), A = p + (1 − p)e^(−a·g),
   * R = 1 + c·(ln(g + 1) − d)², with b = 0.011, p = 0.760, a = 0.017, c = 0.092, d = 3.453 (t and g in days). */
  const cepeda = {
    RI: [7, 35, 70, 350],
    POINTS: {
      7:   [[0, 0.88], [1, 0.97], [2, 0.95], [7, 0.94], [21, 0.93], [105, 0.80]],
      35:  [[0, 0.52], [1, 0.69], [4, 0.73], [7, 0.80], [11, 0.82], [21, 0.76], [105, 0.60]],
      70:  [[0, 0.30], [1, 0.42], [7, 0.61], [14, 0.52], [21, 0.62], [105, 0.42]],
      350: [[0, 0.125], [1, 0.125], [7, 0.15], [21, 0.22], [35, 0.20], [70, 0.21], [105, 0.14]]
    },
    // stated in the Results: best tested gap, spline-interpolated optimum (days and % of RI), recall gain over gap 0
    TESTED_BEST: { 7: 1, 35: 11, 70: 21, 350: 21 },
    SPLINE: { 7: 3, 35: 8, 70: 12, 350: 27 },
    SPLINE_PCT: { 7: 43, 35: 23, 70: 17, 350: 8 },
    GAIN: { 7: 10, 35: 59, 70: 111, 350: 77 },
    N: 1354,
    S: { b: 0.011, p: 0.760, a: 0.017, c: 0.092, d: 3.453 },
    surface(g, t) {
      const S = cepeda.S, A = S.p + (1 - S.p) * Math.exp(-S.a * g), L = Math.log(g + 1) - S.d;
      return A * Math.pow(S.b * t + 1, -(1 + S.c * L * L));
    },
    surfaceOptimum(t) {
      let bg = 0, bp = -1;
      for (let i = 0; i <= 4000; i++) { const g = i * 0.1, p = cepeda.surface(g, t); if (p > bp) { bp = p; bg = g; } }
      let lo = Math.max(0, bg - 0.1), hi = bg + 0.1; const gr = (Math.sqrt(5) - 1) / 2;
      for (let it = 0; it < 60; it++) { const c = hi - gr * (hi - lo), d = lo + gr * (hi - lo); if (cepeda.surface(c, t) > cepeda.surface(d, t)) hi = d; else lo = c; }
      return (lo + hi) / 2;
    },
    bestPoint(ri) { return cepeda.POINTS[ri].reduce((b, q) => (q[1] > b[1] ? q : b)); },
    gainFromPoints(ri) { const z = cepeda.POINTS[ri][0][1], b = cepeda.bestPoint(ri)[1]; return (b / z - 1) * 100; }
  };

  /* ───────── 5–6 · FSRS-6 (stability S, difficulty D, retrievability R), default parameters ─────────
   * R(t, S) = (1 + F·t/S)^(−w20), F = 0.9^(−1/w20) − 1, so R(S, S) = 0.9.
   * Next interval for a target retention r: I = S/F·(r^(−1/w20) − 1), rounded to whole days, at least 1.
   * First rating Good: S0 = w2, D0(G) = w4 − e^(w5(G−1)) + 1. After a successful review (Good):
   *   S' = S·(1 + e^(w8)·(11 − D)·S^(−w9)·(e^(w10(1−R)) − 1)).
   * After a lapse (Again): S' = min(w11·D^(−w12)·((S+1)^(w13) − 1)·e^(w14(1−R)), S / e^(w17·w18)).
   * Difficulty: D' = w7·D0(4) + (1 − w7)·(D + ΔD·(10 − D)/9), ΔD = −w6(G − 3), clamped to [1, 10].
   * Simplifications on this page: answers are only Good or Again; no same-day learning or relearning steps; no fuzz. */
  const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const fsrs = {
    W,
    DECAY: W[20],
    F: Math.pow(0.9, -1 / W[20]) - 1,
    MAX_IVL: 36500,
    R: (t, S) => Math.pow(1 + fsrs.F * t / S, -fsrs.DECAY),
    rawInterval: (S, r) => S / fsrs.F * (Math.pow(r, -1 / fsrs.DECAY) - 1),
    interval: (S, r) => clamp(Math.round(fsrs.rawInterval(S, r)), 1, fsrs.MAX_IVL),
    d0: G => W[4] - Math.exp(W[5] * (G - 1)) + 1,
    nextD(D, G) { const dd = -W[6] * (G - 3), d1 = D + dd * (10 - D) / 9; return clamp(W[7] * fsrs.d0(4) + (1 - W[7]) * d1, 1, 10); },
    recallS: (D, S, R) => S * (1 + Math.exp(W[8]) * (11 - D) * Math.pow(S, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1)),
    forgetS: (D, S, R) => Math.min(W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)), S / Math.exp(W[17] * W[18])),
    newCard: () => ({ S: W[2], D: clamp(fsrs.d0(3), 1, 10) }),
    // review a card `elapsed` days after its last review; good = remembered
    review(card, elapsed, good) {
      const R = fsrs.R(elapsed, card.S);
      if (good) return { S: fsrs.recallS(card.D, card.S, R), D: fsrs.nextD(card.D, 3) };
      return { S: Math.max(0.001, fsrs.forgetS(card.D, card.S, R)), D: fsrs.nextD(card.D, 1) };
    },
    // one card, always remembered, reviewed on its due day: the review days within `days`
    path(r, days) {
      let c = fsrs.newCard(), t = 0; const out = [{ t: 0, S: c.S, ivl: 0 }];
      for (;;) { const ivl = fsrs.interval(c.S, r); if (t + ivl > days) break; t += ivl; c = fsrs.review(c, ivl, true); out.push({ t, S: c.S, ivl }); }
      return out;
    },
    // many cards: `perDay` new cards every day for `days` days; each review is remembered with probability R at
    // that moment (on the due day R ≈ r). Returns reviews per day, new cards per day and the expected number of
    // cards you would recall on the last day (Σ R).
    simulate({ perDay, r, days = 365, seed = 7 }) {
      const R = rng(seed), reviews = new Float64Array(days), lapses = new Float64Array(days);
      let known = 0, cards = 0;
      for (let d0 = 0; d0 < days; d0++) for (let k = 0; k < perDay; k++) {
        let c = fsrs.newCard(), t = d0; cards++;
        for (;;) {
          const ivl = fsrs.interval(c.S, r);
          if (t + ivl >= days) { known += fsrs.R(days - 1 - t, c.S); break; }
          const pr = fsrs.R(ivl, c.S), good = R() < pr;
          t += ivl; reviews[t]++; if (!good) lapses[t]++;
          c = fsrs.review(c, ivl, good);
        }
      }
      const tail = (arr, n) => { let s = 0; for (let i = days - n; i < days; i++) s += arr[i]; return s / n; };
      let total = 0; for (let i = 0; i < days; i++) total += reviews[i];
      return { reviews, lapses, known, cards, total, lastMonth: tail(reviews, 30), perCard: total / cards };
    }
  };

  /* ───────── 7–8 · Reported data, not models ───────── */
  const rk = {
    // Experiment 1: proportion of idea units recalled; restudy (SS) vs one test (ST); 120 students
    exp1: { delays: ['5min', '2d', '1w'], SS: [0.81, 0.54, 0.42], ST: [0.75, 0.68, 0.56], d: [0.52, 0.95, 0.83], n: 120 },
    // Experiment 2: SSSS, SSST, STTT at 5 min and 1 week; 180 students, 30 per cell
    exp2: { conds: ['SSSS', 'SSST', 'STTT'], m5: [0.83, 0.78, 0.71], w1: [0.40, 0.56, 0.61], forgot: [52, 28, 14], reads: [14.2, 10.3, 3.4], jol: [4.8, 4.2, 4.0], n: 180 },
    initialRecall: 0.70
  };
  const kb = { exp1a: { spaced: 0.61, massed: 0.35, betterSpaced: 78, judgedMassedOK: 78, n: 120 }, combined: { atLeastAsWellSpaced: 85, judgedMassedOK: 83 }, exp2: { expressed: 72, thoughtMassed: 64 } };

  return { MIN, HOUR, DAY, LN2, clamp, rng, forgetting, mixture, actr, cepeda, fsrs, rk, kb };
}));
