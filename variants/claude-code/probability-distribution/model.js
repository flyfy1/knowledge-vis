'use strict';
// Probability distribution model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// A discrete distribution is { xs: [values ascending], ps: [probabilities summing to 1] }.
(function (root) {
  const sum = a => a.reduce((s, v) => s + v, 0);
  function make(xs, ws) { const t = sum(ws); return { xs: xs.slice(), ps: ws.map(w => w / t) }; }

  // ---- named distributions ----
  function twoDice() { const xs = [], ws = []; for (let s = 2; s <= 12; s++) { xs.push(s); ws.push(6 - Math.abs(s - 7)); } return make(xs, ws); }
  function oneDie() { return make([1, 2, 3, 4, 5, 6], [1, 1, 1, 1, 1, 1]); }
  // A made-up right-skewed example: parcels delivered to one flat on a weekday (illustrative weights, not data).
  function parcels() { return make([0, 1, 2, 3, 4, 5, 6], [22, 32, 20, 12, 7, 4, 3]); }
  function coins3() { return make([0, 1, 2, 3], [1, 3, 3, 1]); }
  const PRESETS = { dice2: twoDice, die1: oneDie, parcels, coins3 };

  // ---- summaries ----
  const mean = d => sum(d.xs.map((x, i) => x * d.ps[i]));
  const variance = d => { const m = mean(d); return sum(d.xs.map((x, i) => (x - m) * (x - m) * d.ps[i])); };
  const sd = d => Math.sqrt(variance(d));
  function modes(d) { const top = Math.max(...d.ps); return d.xs.filter((_, i) => Math.abs(d.ps[i] - top) < 1e-12); }


  // Net turning effect about a pivot at c: Σ (x − c)·P(X = x). Zero exactly when c = E[X].
  const torque = (d, c) => sum(d.xs.map((x, i) => (x - c) * d.ps[i]));
  const tail = (d, k) => sum(d.xs.map((x, i) => (x >= k ? d.ps[i] : 0))); // P(X ≥ k)
  const contributions = d => { const m = mean(d); return d.xs.map((x, i) => d.ps[i] * (x - m) * (x - m)); };

  // ---- step 2: a family on 1..9 with mean 5 whose spread grows with s ∈ [0, 1] ----
  function spreadFamily(s) {
    const w = 0.55 + 3.45 * s, xs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return make(xs, xs.map(x => Math.exp(-((x - 5) * (x - 5)) / (2 * w * w))));
  }

  // ---- step 3: Y = aX + b ----
  function linear(d, a, b) {
    const map = new Map();
    d.xs.forEach((x, i) => { const y = Math.round((a * x + b) * 1e9) / 1e9; map.set(y, (map.get(y) || 0) + d.ps[i]); });
    const ys = [...map.keys()].sort((u, v) => u - v);
    return { xs: ys, ps: ys.map(y => map.get(y)) };
  }

  // ---- binomial and normal ----
  function choose(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
  function binom(n, p) { const xs = [], ps = []; for (let k = 0; k <= n; k++) { xs.push(k); ps.push(choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)); } return { xs, ps }; }
  const normalPdf = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  // erf by the Abramowitz–Stegun 7.1.26 rational approximation (|error| < 1.5e-7).
  function erf(x) { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a); return s * y; }
  const normalCdf = (x, m, s) => 0.5 * (1 + erf((x - m) / (s * Math.SQRT2)));
  // Normal approximation of P(X ≥ k) for Binomial(n, p), with the continuity correction (k − 0.5).
  function tailNormal(n, p, k) { const m = n * p, s = Math.sqrt(n * p * (1 - p)); return 1 - normalCdf(k - 0.5, m, s); }

  // ---- simulation: seeded mulberry32 so every run of the page is reproducible ----
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const rollDie = r => 1 + Math.floor(r() * 6);

  const api = { make, twoDice, oneDie, parcels, coins3, PRESETS, mean, variance, sd, modes, torque, tail, contributions, spreadFamily, linear, choose, binom, normalPdf, erf, normalCdf, tailNormal, rng, rollDie };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DIST_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
