/* Models for "numbers-lie". Pure functions, no DOM, no text. Usable from the page (window.NL) and from node.
   Every number the prose states is produced by a function here and pinned in tests/models.cjs. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NL = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── shared helpers ── */
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function normal(R) { // Box–Muller, one value per call
    let u = 0; while (u === 0) u = R();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R());
  }
  const pdf = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  function cdf(z) { // standard normal CDF, |error| < 1e-7 (W. J. Cody style via erfc rational approx)
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const p = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const v = 1 - pdf(z) * p;
    return z >= 0 ? v : 1 - v;
  }
  function invCdf(p) { // Acklam's rational approximation, relative error < 1.2e-9
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425;
    if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const q = p - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  function corr(x, y) {
    const mx = mean(x), my = mean(y); let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < x.length; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
    return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
  }
  const median = a => { const s = [...a].sort((p, q) => p - q), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

  /* ── 1 Regression to the mean ──
     score = ability + luck. Total spread fixed: sd(score) = 10 around 70. `luck` is the share of the variance that is luck.
     Same ability on both tests, fresh luck on the second. Nothing is done to anyone between the tests. */
  const REG = { n: 500, mu: 70, sd: 10 };
  function regressSample({ luck = 0.5, q = 0.1, seed = 1, retest = 0 } = {}) {
    const n = REG.n, sT = REG.sd * Math.sqrt(1 - luck), sE = REG.sd * Math.sqrt(luck);
    const R = rng(seed), R2 = rng(seed * 7919 + 101 + retest * 104729);
    const ability = [], t1 = [], t2 = [];
    for (let i = 0; i < n; i++) { const a = REG.mu + sT * normal(R); ability.push(a); t1.push(a + sE * normal(R)); }
    for (let i = 0; i < n; i++) t2.push(ability[i] + sE * normal(R2));
    const order = t1.map((v, i) => i).sort((i, j) => t1[i] - t1[j]), k = Math.max(1, Math.round(q * n));
    const bottom = order.slice(0, k), top = order.slice(n - k);
    const g = idx => ({ n: idx.length, m1: mean(idx.map(i => t1[i])), m2: mean(idx.map(i => t2[i])) });
    // control split: alternate members of the bottom group (ordered by first score) so both halves start level
    const scolded = bottom.filter((i, r) => r % 2 === 0), spared = bottom.filter((i, r) => r % 2 === 1);
    return { t1, t2, ability, bottom, top, scolded, spared, B: g(bottom), T: g(top), S: g(scolded), U: g(spared) };
  }
  // Expected change of the bottom-q group between tests: luck * sd * phi(z_q)/q (the top group moves by the same amount down).
  function regressExpected(luck, q) { const z = invCdf(q); return luck * REG.sd * pdf(z) / q; }
  function regressGroupMean(q) { return REG.mu - REG.sd * pdf(invCdf(q)) / q; }

  /* ── 2 Small samples swing more ──
     Schools of very different sizes. Every student's score ~ N(70 + effect_school, 10). A school's average has
     standard error 10/sqrt(size). `spread` is the sd of real school effects (0 = all schools identical). */
  const SCH = { count: 400, sdStudent: 10, mu: 70, minN: 10, maxN: 1000 };
  function schoolsSetup(seed = 3) {
    const R = rng(seed), sizes = [], z = [];
    for (let i = 0; i < SCH.count; i++) { sizes.push(Math.round(SCH.minN * Math.pow(SCH.maxN / SCH.minN, R()))); z.push(normal(R)); }
    return { sizes, z };
  }
  function schoolsYear(setup, spread, year, seed = 3) {
    const R = rng(seed * 31 + 7 + year * 1013), avg = [];
    for (let i = 0; i < SCH.count; i++) avg.push(SCH.mu + spread * setup.z[i] + SCH.sdStudent / Math.sqrt(setup.sizes[i]) * normal(R));
    const order = avg.map((v, i) => i).sort((i, j) => avg[j] - avg[i]); // best first
    const rank = new Array(SCH.count); order.forEach((s, r) => { rank[s] = r + 1; });
    return { avg, order, rank, top: order.slice(0, 10), bottom: order.slice(-10) };
  }
  function schoolsSummary(setup, y) {
    const sz = idx => idx.map(i => setup.sizes[i]);
    const q1 = [...setup.sizes].sort((a, b) => a - b)[Math.floor(SCH.count / 4)]; // smallest quarter upper bound
    return { q1, topMedianSize: median(sz(y.top)), bottomMedianSize: median(sz(y.bottom)), allMedianSize: median(setup.sizes),
      topSmallQuarter: y.top.filter(i => setup.sizes[i] <= q1).length, bottomSmallQuarter: y.bottom.filter(i => setup.sizes[i] <= q1).length };
  }
  const schoolSE = n => SCH.sdStudent / Math.sqrt(n);

  /* ── 3 Survivorship ──
     1000 funds, no skill: every fund's yearly log-return ~ N(mu, sigma) independently. At each year end a fund whose value
     is below `bar` × its starting value is closed and drops out of the brochure. After `years`, survivors keep going
     for `extra` more years with nothing closing. */
  const FUND = { n: 1000, years: 10, extra: 5, mu: 0.04, sigma: 0.15 };
  function fundsRun({ bar = 0.8, seed = 5 } = {}) {
    const R = rng(seed), Y = FUND.years + FUND.extra, paths = [], death = [];
    for (let i = 0; i < FUND.n; i++) {
      const p = [0]; let dead = 0;
      for (let y = 1; y <= Y; y++) {
        p.push(p[y - 1] + FUND.mu + FUND.sigma * normal(R));
        if (!dead && y <= FUND.years && Math.exp(p[y]) < bar) dead = y;
      }
      paths.push(p); death.push(dead);
    }
    return { paths, death };
  }
  // Summary at year t (1..years+extra). Annualised = exp(mean log-return per year) − 1.
  // allAnnual averages every fund-year that started with the fund open, including the year it was closed: this is
  // what an investor picking a fund at random each year would have got, and it stays near mu whatever the bar.
  function fundsAt(run, t) {
    const Tm = Math.min(t, FUND.years), alive = [], all = [];
    run.paths.forEach((p, i) => {
      const d = run.death[i];
      if (!d || d > Tm) alive.push(i);
      const end = d && d <= Tm ? d : Tm;
      for (let y = 1; y <= end; y++) all.push(p[y] - p[y - 1]);
    });
    const ann = g => Math.exp(g) - 1;
    const survAnn = ann(mean(alive.map(i => run.paths[i][Tm] / Tm)));
    const after = t > FUND.years ? ann(mean(alive.map(i => (run.paths[i][t] - run.paths[i][FUND.years]) / (t - FUND.years)))) : null;
    return { alive: alive.length, closed: run.paths.length - alive.length, survivorAnnual: survAnn, allAnnual: ann(mean(all)), afterAnnual: after };
  }

  /* ── 4 Many comparisons ──
     k independent studies of things that do nothing. Each study's z-score ~ N(0,1); two-sided p = 2(1 − Φ(|z|)). */
  const pTwo = z => 2 * (1 - cdf(Math.abs(z)));
  function studies(k, seed) { const R = rng(seed), z = []; for (let i = 0; i < k; i++) z.push(normal(R)); return { z, p: z.map(pTwo) }; }
  const familyRate = (k, alpha = 0.05) => 1 - Math.pow(1 - alpha, k);
  // Fraction of `rounds` rounds (seeds 1..rounds) with at least one p < thr among k studies.
  function familySim(k, rounds, thr = 0.05, seed0 = 1000) {
    let hit = 0; for (let r = 0; r < rounds; r++) { if (studies(k, seed0 + r).p.some(p => p < thr)) hit++; }
    return hit / rounds;
  }

  /* ── 5 Simpson's paradox ──
     Within-group success rates from Charig et al. 1986 (BMJ 292:879): A = open surgery, B = percutaneous.
     Each treatment has 350 patients; the reader sets what share of each treatment's patients have large stones. */
  const SIMP = { n: 350, A: { small: 81 / 87, large: 192 / 263 }, B: { small: 234 / 270, large: 55 / 80 }, aLarge: 263 / 350, bLarge: 80 / 350 };
  function simpson(aLarge, bLarge) {
    const side = (r, share) => { const nl = SIMP.n * share, ns = SIMP.n - nl, ok = ns * r.small + nl * r.large; return { nl, ns, ok, rate: ok / SIMP.n }; };
    const A = side(SIMP.A, aLarge), B = side(SIMP.B, bLarge);
    return { A, B, flipped: A.rate < B.rate };
  }
  // Large-stone share of A at which A's pooled rate equals B's, for a given B share.
  function simpsonFlipAt(bLarge) {
    const b = SIMP.B.small + (SIMP.B.large - SIMP.B.small) * bLarge;
    return (SIMP.A.small - b) / (SIMP.A.small - SIMP.A.large);
  }

  /* ── 6 Base rates ── N people, prevalence, sensitivity, false-positive rate. Expected counts. */
  function screen(prev, sens, fpr, N = 10000) {
    const sick = N * prev, healthy = N - sick, tp = sick * sens, fn = sick - tp, fp = healthy * fpr, tn = healthy - fp;
    return { sick, healthy, tp, fn, fp, tn, ppv: tp / (tp + fp), sens };
  }

  /* ── 7 Relative vs absolute risk ── base risk per 10,000; relative risk rr. */
  function risk(basePer10k, rr) {
    const b = basePer10k, e = b * rr, d = e - b;
    return { base: b, exposed: e, diff: d, relPct: (rr - 1) * 100, nn: d === 0 ? Infinity : 10000 / Math.abs(d) };
  }

  /* ── 8 Mean vs median ── log-normal incomes with median m and log-sd sigma. */
  const tailExact = sigma => ({ ratio: Math.exp(sigma * sigma / 2), belowMean: cdf(sigma / 2) });
  function tailSample(sigma, { n = 1000, med = 5000, seed = 8, rich = 0 } = {}) {
    const R = rng(seed), x = [];
    for (let i = 0; i < n; i++) x.push(med * Math.exp(sigma * normal(R)));
    if (rich) x.push(rich);
    const m = mean(x), md = median(x);
    return { x, mean: m, median: md, belowMean: x.filter(v => v < m).length / x.length };
  }

  /* ── 9 Goodhart ──
     n agents (call-centre staff). Each has a fixed ability a and a strategy g in [0,1], the share of effort spent gaming.
     Real quality q = a(1−g). Measured score m = q + ease·√g + noise. Every round the lowest-scoring `pressure` share copies
     the strategy of a random agent from the highest-scoring share, with a small mutation. Abilities never change. */
  const GH = { n: 200, noise: 0.15, mut: 0.04, top: 20 };
  function ghCreate(seed = 9) {
    const R = rng(seed), a = [], g = [];
    for (let i = 0; i < GH.n; i++) { a.push(Math.max(0.3, 1 + 0.25 * normal(R))); g.push(0.05 * R()); }
    return { a, g, R, round: 0, hist: [] };
  }
  function ghScore(s, ease) {
    const q = s.a.map((a, i) => a * (1 - s.g[i]));
    const m = q.map((v, i) => v + ease * Math.sqrt(s.g[i]) + GH.noise * normal(s.R));
    return { q, m };
  }
  function ghStep(s, { pressure = 0.2, ease = 1.2 } = {}) {
    const { q, m } = ghScore(s, ease), n = GH.n, k = Math.round(pressure * n);
    const top = (v, k) => new Set(v.map((x, i) => i).sort((i, j) => v[j] - v[i]).slice(0, k));
    const tm = top(m, GH.top), tq = top(q, GH.top); let overlap = 0; tm.forEach(i => { if (tq.has(i)) overlap++; });
    const rec = { round: s.round, m: mean(m), q: mean(q), r: corr(m, q), g: mean(s.g), overlap };
    s.hist.push(rec);
    if (k > 0) {
      const order = m.map((v, i) => i).sort((i, j) => m[i] - m[j]), low = order.slice(0, k), high = order.slice(n - k);
      for (const i of low) { const j = high[(s.R() * k) | 0]; s.g[i] = Math.min(1, Math.max(0, s.g[j] + GH.mut * normal(s.R))); }
    }
    s.round++;
    return rec;
  }
  // Average of a field over rounds [a, b) of a run's history (single rounds are noisy).
  const ghWindow = (hist, a, b, key) => mean(hist.slice(a, b).map(h => h[key]));
  function ghRun(rounds, opt, seed = 9) { const s = ghCreate(seed); for (let i = 0; i < rounds; i++) ghStep(s, opt); return s; }

  return { rng, normal, cdf, invCdf, pdf, mean, median, corr,
    REG, regressSample, regressExpected, regressGroupMean,
    SCH, schoolsSetup, schoolsYear, schoolsSummary, schoolSE,
    FUND, fundsRun, fundsAt,
    pTwo, studies, familyRate, familySim,
    SIMP, simpson, simpsonFlipAt,
    screen, risk, tailExact, tailSample,
    GH, ghCreate, ghStep, ghRun, ghWindow };
});
