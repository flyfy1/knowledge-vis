'use strict';
// Central limit theorem lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve, dot and readout on the page is computed here; tests/core.cjs pins the claims.
// Sources are discrete distributions on the integers 0..6 (or 0..1), so the exact distribution of
// the mean of n independent draws is an n-fold convolution, computed without simulation.
(function (root) {
  const SOURCES = {
    die: { vals: [0, 1, 2, 3, 4, 5, 6], p: [0, 1, 1, 1, 1, 1, 1].map(v => v / 6), lo: 0.5, hi: 6.5 },
    skew: { vals: [0, 1, 2, 3, 4, 5, 6], p: [0.40, 0.25, 0.15, 0.09, 0.06, 0.03, 0.02], lo: -0.5, hi: 6.5 },
    ushape: { vals: [0, 1, 2, 3, 4, 5, 6], p: [0.35, 0.08, 0.04, 0.06, 0.04, 0.08, 0.35], lo: -0.5, hi: 6.5 },
    rare: { vals: [0, 1], p: [0.9, 0.1], lo: -0.2, hi: 1.2 }
  };
  const ORDER = ['die', 'skew', 'ushape', 'rare'];

  function moments(src) {
    const S = SOURCES[src] || src;
    const mu = S.vals.reduce((s, v, i) => s + v * S.p[i], 0);
    const v2 = S.vals.reduce((s, v, i) => s + (v - mu) * (v - mu) * S.p[i], 0);
    const m3 = S.vals.reduce((s, v, i) => s + Math.pow(v - mu, 3) * S.p[i], 0);
    return { mu, sigma: Math.sqrt(v2), skew: m3 / Math.pow(v2, 1.5) };
  }

  function conv(a, b) { const y = new Array(a.length + b.length - 1).fill(0); for (let i = 0; i < a.length; i++) if (a[i]) for (let j = 0; j < b.length; j++) y[i + j] += a[i] * b[j]; return y; }
  // Exact pmf of the SUM of n draws (values 0..max·n); the mean is sum / n. Cached per source.
  const sumCache = {};
  function sumDist(src, n) {
    const key = src;
    if (!sumCache[key]) sumCache[key] = [null, SOURCES[src].p.slice()];
    const c = sumCache[key];
    while (c.length <= n) c.push(conv(c[c.length - 1], SOURCES[src].p));
    return c[n];
  }
  // Mean distribution as {x: s/n, p} points (only where p > 0 or inside the support).
  function meanDist(src, n) { return sumDist(src, n).map((p, s) => ({ x: s / n, p })); }

  // Standard normal CDF (erf via Abramowitz–Stegun 7.1.26, |error| < 1.5e-7) and density.
  function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
  const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
  const phi = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);

  // Kolmogorov distance between the exact CDF of the mean and the normal CDF N(μ, σ²/n):
  // the largest vertical gap, checked just before and just after every jump of the exact CDF.
  function ksGap(src, n) {
    const { mu, sigma } = moments(src), pm = sumDist(src, n), sd = sigma * Math.sqrt(n);
    let F = 0, gap = 0;
    for (let s = 0; s < pm.length; s++) {
      if (pm[s] === 0) continue;
      const G = Phi((s - n * mu) / sd);
      gap = Math.max(gap, Math.abs(F - G)); F += pm[s]; gap = Math.max(gap, Math.abs(F - G));
    }
    return gap;
  }
  function sdOfMean(src, n) {
    const pm = sumDist(src, n); let m = 0, v = 0;
    pm.forEach((p, s) => { m += p * s / n; }); pm.forEach((p, s) => { v += p * (s / n - m) * (s / n - m); });
    return { mean: m, sd: Math.sqrt(v) };
  }

  // Random numbers: mulberry32 (deterministic seeds so the page and the tests see the same draws).
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function draw(src, r) { const S = SOURCES[src]; let u = r(), i = 0; while (i < S.p.length - 1 && u >= S.p[i]) { u -= S.p[i]; i++; } return S.vals[i]; }
  // One experiment: n draws and their mean.
  function experiment(src, n, r) { const xs = Array.from({ length: n }, () => draw(src, r)); return { xs, mean: xs.reduce((a, b) => a + b, 0) / n }; }

  // Step 3: sample size needed so that σ/√n ≤ target.
  const nNeeded = (sigma, target) => Math.ceil(Math.pow(sigma / target, 2) - 1e-9);

  // Step 4: polls. p̂ = share of n respondents saying yes; 95% margin ≈ 1.96·√(p̂(1−p̂)/n).
  const Z95 = 1.959963984540054;
  const margin = (p, n) => Z95 * Math.sqrt(p * (1 - p) / n);
  function poll(p, n, r) { let k = 0; for (let i = 0; i < n; i++) if (r() < p) k++; const ph = k / n; const m = margin(ph, n); return { k, ph, lo: ph - m, hi: ph + m, covers: ph - m <= p && p <= ph + m }; }
  function logChoose(n, k) { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }
  // Exact probability that the interval p̂ ± margin(p̂) contains the true p (sum over the binomial).
  function exactCoverage(p, n) {
    let c = 0;
    for (let k = 0; k <= n; k++) { const ph = k / n; if (Math.abs(ph - p) <= margin(ph, n)) c += Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); }
    return c;
  }

  // Step 5: running averages. Die draws (finite variance) vs standard Cauchy draws (no mean, no variance).
  const cauchy = r => Math.tan(Math.PI * (r() - 0.5));
  function runningMeans(kind, seed, N) {
    const r = mulberry32(seed), out = new Float64Array(N); let s = 0;
    for (let i = 0; i < N; i++) { s += kind === 'cauchy' ? cauchy(r) : draw('die', r); out[i] = s / (i + 1); }
    return out;
  }

  const api = { SOURCES, ORDER, moments, conv, sumDist, meanDist, erf, Phi, phi, ksGap, sdOfMean, mulberry32, draw, experiment, nNeeded, Z95, margin, poll, exactCoverage, cauchy, runningMeans };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CLT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
