'use strict';
// Statistical inference lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Simulation: a bottling machine fills bottles with volumes ~ Normal(MU_TRUE, SIGMA) mL, independent.
// The label claims 500 mL. SIGMA is treated as known (from the machine's spec sheet), so z-procedures are exact.
(function (root) {
  const SIGMA = 6;        // mL, known spread of single bottles
  const MU_TRUE = 498;    // mL, the truth inside the simulation (revealed in step 1)
  const CLAIM = 500;      // mL, the label's claim (the null hypothesis)
  const N_OPTIONS = [4, 9, 16, 25, 36, 64, 100];
  const N_LONG = [4, 9, 16, 25, 36, 49, 64, 100, 144, 225, 400, 625, 900, 1600, 2500, 3600, 6400, 10000];
  const LEVELS = [0.8, 0.9, 0.95, 0.99];

  // mulberry32 PRNG + Box–Muller normal draws; fully reproducible.
  function rng(seed) {
    let a = seed >>> 0;
    const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    let spare = null;
    const normal = () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let x = 0; while (x === 0) x = u();
      const r = Math.sqrt(-2 * Math.log(x)), th = 2 * Math.PI * u();
      spare = r * Math.sin(th); return r * Math.cos(th);
    };
    return { u, normal };
  }
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1)); };
  const se = n => SIGMA / Math.sqrt(n);

  // A batch of n bottles from a machine with mean mu.
  function batch(r, n, mu) { const b = []; for (let i = 0; i < n; i++) b.push(mu + SIGMA * r.normal()); return b; }

  // Step 0: the stream of 16-bottle batches the reader draws one by one (same stream every visit).
  function batchStream(count, n = 16, seed = 2026) {
    const r = rng(seed), out = [];
    for (let k = 0; k < count; k++) { const b = batch(r, n, MU_TRUE); out.push({ bottles: b, mean: mean(b) }); }
    return out;
  }

  // Many batch means (step 1 under the truth, step 3 under the claim). Seed depends on n and the world.
  function batchMeans(n, reps, mu, seed) {
    const r = rng(seed + 7919 * n), out = new Array(reps);
    for (let k = 0; k < reps; k++) { let s = 0; for (let i = 0; i < n; i++) s += mu + SIGMA * r.normal(); out[k] = s / n; }
    return out;
  }
  const truthMeans = (n, reps = 1000) => batchMeans(n, reps, MU_TRUE, 11);
  const nullMeans = (n, reps = 4000) => batchMeans(n, reps, CLAIM, 23);

  // Normal distribution. erf by series (|x| < 3) or continued fraction for erfc (|x| ≥ 3); error < 1e-12.
  function erfc(x) {
    if (x < 0) return 2 - erfc(-x);
    if (x < 3) {
      let sum = x, term = x; const x2 = x * x;
      for (let k = 1; k < 200; k++) { term *= -x2 / k; const add = term / (2 * k + 1); sum += add; if (Math.abs(add) < 1e-17) break; }
      return 1 - 2 / Math.sqrt(Math.PI) * sum;
    }
    // Lentz continued fraction: erfc(x) = exp(−x²)/√π · 1/(x + 1/2/(x + 1/(x + 3/2/(x + ...))))
    let f = x, C = x, D = 0; const tiny = 1e-300;
    for (let k = 1; k < 300; k++) {
      const a = k / 2; D = x + a * D; D = Math.abs(D) < tiny ? tiny : D; C = x + a / C; C = Math.abs(C) < tiny ? tiny : C; D = 1 / D;
      const delta = C * D; f *= delta; if (Math.abs(delta - 1) < 1e-15) break;
    }
    return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
  }
  const normCdf = z => 0.5 * erfc(-z / Math.SQRT2);
  const normPdf = z => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  // Critical value z* with P(|Z| ≤ z*) = level (bisection).
  function zStar(level) { let lo = 0, hi = 10; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (1 - erfc(m / Math.SQRT2) < level) lo = m; else hi = m; } return (lo + hi) / 2; }

  // Step 2–3: z-score and two-sided p-value of an observed batch mean against the claim.
  const zScore = (xbar, n, mu0 = CLAIM) => (xbar - mu0) / se(n);
  const pTwo = z => erfc(Math.abs(z) / Math.SQRT2);
  // Share of simulated claim-world means at least as far from 500 as the observed one.
  function simulatedP(xbar, n, means = nullMeans(n)) {
    const d = Math.abs(xbar - CLAIM) - 1e-12; let k = 0;
    for (const m of means) if (Math.abs(m - CLAIM) >= d) k++;
    return { k, N: means.length, frac: k / means.length };
  }

  // Step 4: 50 intervals per set; the sample means do not depend on the level, only the widths do.
  function intervalSet(set, n, level, count = 50) {
    const means = batchMeans(n, count, MU_TRUE, 101 + 37 * set), h = zStar(level) * se(n);
    return means.map(m => ({ mean: m, lo: m - h, hi: m + h, cover: m - h <= MU_TRUE && MU_TRUE <= m + h, hasClaim: m - h <= CLAIM && CLAIM <= m + h }));
  }
  function coverageOver(sets, n, level) {
    let c = 0, N = 0;
    for (let s = 0; s < sets; s++) for (const iv of intervalSet(s, n, level)) { N++; if (iv.cover) c++; }
    return { c, N, frac: c / N };
  }

  // Step 5: the "typical" batch whose mean equals the true mean mu.
  function typical(mu, n, level = 0.95) {
    const h = zStar(level) * se(n), z = zScore(mu, n);
    return { lo: mu - h, hi: mu + h, half: h, z, p: pTwo(z), excludes: CLAIM < mu - h || CLAIM > mu + h };
  }
  // Smallest n at which a typical batch's 95% interval leaves out 500 (Infinity when mu = 500).
  function nStar(mu, level = 0.95) { const d = Math.abs(mu - CLAIM); if (d < 1e-12) return Infinity; return Math.floor(Math.pow(zStar(level) * SIGMA / d, 2)) + 1; }

  // Step 5 slider: position v in 0..1000 maps to n = 4 · 2500^(v/1000), i.e. 4..10000 on a log scale.
  const nFromSlider = v => Math.round(4 * Math.pow(2500, v / 1000));

  // Histogram helper: counts of values in [lo, hi) with bin width w.
  function histogram(values, lo, hi, w) {
    const bins = new Array(Math.round((hi - lo) / w)).fill(0);
    for (const v of values) { const i = Math.floor((v - lo) / w); if (i >= 0 && i < bins.length) bins[i]++; }
    return bins;
  }

  const api = { SIGMA, MU_TRUE, CLAIM, N_OPTIONS, N_LONG, LEVELS, rng, mean, sd, se, batch, batchStream, batchMeans, truthMeans, nullMeans, erfc, normCdf, normPdf, zStar, zScore, pTwo, simulatedP, intervalSet, coverageOver, typical, nStar, nFromSlider, histogram };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SI_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
