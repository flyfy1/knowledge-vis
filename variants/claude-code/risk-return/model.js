'use strict';
// Risk & return lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, bar, path and readout on the page is computed here; tests/core.cjs pins the claims.
// All numbers are invented teaching examples: no real asset, market or product is modelled.
(function (root) {
  const START = 100;          // money put in at the start of each example (yuan / dollars)
  const SAFE = 3;             // option A: +3 % every year, no surprises
  // Option B is a fair six-sided die. Face i pays  m + s·Z[i]  percent for the year.
  // m = the promised average, s = the "swing" (best face is m + s, worst is m − s).
  const Z = [-1, -0.6, -0.2, 0.2, 0.6, 1];
  const DEFAULT = { m: 3, s: 20, mPremium: 8 };

  const faces = (m, s) => Z.map(z => m + s * z);
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  // Mean absolute deviation: how far, on average, an outcome lands from the average.
  const mad = a => { const mu = mean(a); return mean(a.map(v => Math.abs(v - mu))); };
  const countWhere = (a, f) => a.filter(f).length;

  // Seeded PRNG (mulberry32) so every "random" picture is identical on every load.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const SEEDS = [11, 23, 37, 41, 59];
  // Step 2: a sequence of die rolls (face indices 0..5).
  function rolls(n, seed) { const r = rng(seed), out = []; for (let i = 0; i < n; i++) out.push(Math.min(5, Math.floor(r() * 6))); return out; }
  function runningMean(m, s, seq) { const f = faces(m, s); let sum = 0; return seq.map((k, i) => (sum += f[k]) / (i + 1)); }
  function faceCounts(seq) { const c = [0, 0, 0, 0, 0, 0]; seq.forEach(k => c[k]++); return c; }

  // Step 3: 100 invented buyers. Buyer i asks for an extra average return of at least C[i]·s
  // (percentage points) before holding B instead of A. C runs evenly from 0.005 to 0.5.
  const BUYERS = Array.from({ length: 100 }, (_, i) => (i + 1) / 200);
  function willing(m, s) { const prem = m - SAFE; return BUYERS.filter(c => prem >= c * s - 1e-9).length; }
  // Smallest premium that persuades at least k buyers.
  function premiumFor(k, s) { return BUYERS[k - 1] * s; }

  // Step 4: hold for T years; each year is an independent roll.
  const growth = r => 1 + r / 100;
  function paths(m, s, T, n, seed) {
    const r = rng(seed), f = faces(m, s).map(growth), out = [];
    for (let p = 0; p < n; p++) { const row = [START]; let w = START; for (let y = 0; y < T; y++) { w *= f[Math.min(5, Math.floor(r() * 6))]; row.push(w); } out.push(row); }
    return out;
  }
  // Exact distribution of the end value after T years: only how many times each face came up matters.
  const lf = [0]; for (let i = 1; i <= 200; i++) lf[i] = lf[i - 1] + Math.log(i);
  const cache = new Map();
  function endDist(m, s, T) {
    const key = m + '|' + s + '|' + T; if (cache.has(key)) return cache.get(key);
    const lg = faces(m, s).map(v => Math.log(growth(v))), out = [], c = [0, 0, 0, 0, 0, 0];
    const base = lf[T] - T * Math.log(6);
    (function rec(i, left, logw, lcoef) {
      if (i === 5) { c[5] = left; out.push({ v: START * Math.exp(logw + left * lg[5]), p: Math.exp(lcoef - lf[left]) }); return; }
      for (let k = 0; k <= left; k++) rec(i + 1, left - k, logw + k * lg[i], lcoef - lf[k]);
    })(0, T, 0, base);
    out.sort((a, b) => a.v - b.v);
    if (cache.size > 80) cache.clear();
    cache.set(key, out); return out;
  }
  function endStats(m, s, T) {
    const d = endDist(m, s, T), safe = START * Math.pow(growth(SAFE), T);
    let pBelowSafe = 0, pLoss = 0, ev = 0, acc = 0, median = null;
    for (const q of d) {
      if (q.v < safe - 1e-9) pBelowSafe += q.p;
      if (q.v < START - 1e-9) pLoss += q.p;
      ev += q.p * q.v; acc += q.p; if (median === null && acc >= 0.5 - 1e-12) median = q.v;
    }
    return { safe, pBelowSafe, pLoss, ev, median, promised: START * Math.pow(growth(m), T), worst: d[0].v, best: d[d.length - 1].v, outcomes: d.length };
  }

  const api = { START, SAFE, Z, DEFAULT, faces, mean, mad, countWhere, rng, SEEDS, rolls, runningMean, faceCounts, BUYERS, willing, premiumFor, growth, paths, endDist, endStats };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
