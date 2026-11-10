'use strict';
// Bayes lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Scenario: a spam filter. H = "this email is spam", E = "the filter flags it".
(function (root) {
  // Step 0: a fixed filter that flags 90% of spam and 10% of normal mail.
  const FILTER = { hit: 0.9, fa: 0.1 };
  const N0 = 1000;

  // Bayes' rule in probability form: P(H|E) = πa / (πa + (1 − π)b).
  function posterior(prior, a, b) {
    const A = prior * a, B = (1 - prior) * b;
    return A + B > 0 ? A / (A + B) : NaN;
  }
  // Joint masses for the mosaic: A = P(H and E), B = P(not H and E).
  function joint(prior, a, b) { const A = prior * a, B = (1 - prior) * b; return { A, B, E: A + B, post: A / (A + B) }; }

  // Step 0: expected counts in 1000 emails for a base rate given in whole percent (always integers).
  function counts(pct) {
    const S = N0 * pct / 100, H = N0 - S;
    const Fs = Math.round(S * FILTER.hit), Fh = Math.round(H * FILTER.fa);
    return { S, H, Fs, Fh, F: Fs + Fh, post: Fs / (Fs + Fh), exact: posterior(pct / 100, FILTER.hit, FILTER.fa) };
  }

  // Odds helpers. Odds = P / (1 − P); log10 odds turns multiplication into addition.
  const odds = p => p / (1 - p);
  const prob = o => o / (1 + o);
  const lo10 = p => Math.log10(odds(p));
  const fromLo = L => prob(Math.pow(10, L));

  // Step 2 slider lists (exact values, so the odds arithmetic in the readout is exact too).
  const PRIORS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.98, 0.99, 0.999];
  const LRS = [0.01, 0.03, 0.1, 0.2, 0.5, 1, 2, 5, 9, 20, 50, 100];

  // Step 3: words with P(word | spam) and P(word | normal); LR = ratio.
  const WORDS = [
    { id: 'free', s: 0.30, h: 0.02 },
    { id: 'prize', s: 0.10, h: 0.005 },
    { id: 'link', s: 0.25, h: 0.05 },
    { id: 'invoice', s: 0.12, h: 0.04 },
    { id: 'attach', s: 0.10, h: 0.20 },
    { id: 'meeting', s: 0.03, h: 0.15 }
  ].map(w => ({ ...w, lr: w.s / w.h }));
  const wordById = id => WORDS.find(w => w.id === id);

  // Chain of evidence under conditional independence: odds multiply by each LR in turn.
  function chain(prior, ids) {
    const out = [{ odds: odds(prior), p: prior }];
    let o = odds(prior);
    for (const id of ids) { o *= wordById(id).lr; out.push({ id, odds: o, p: prob(o) }); }
    return out;
  }

  // Deterministic shuffle (mulberry32) so "shuffle order" is reproducible.
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffled(ids, seed) {
    const r = mulberry32(seed), a = ids.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Steps 4–5: an unknown rate θ (share of visitors who click), on a grid of 401 points.
  const G = 400, THETA = Array.from({ length: G + 1 }, (_, i) => i / G);
  const TRUE_THETA = 0.3, NMAX = 400, DATA_SEED = 20261109;
  // Simulated visitors: 1 = clicked, 0 = did not. Fixed seed; not real data.
  const DATA = (() => { const r = mulberry32(DATA_SEED); return Array.from({ length: NMAX }, () => (r() < TRUE_THETA ? 1 : 0)); })();
  const clicksUpTo = n => { let k = 0; for (let i = 0; i < n; i++) k += DATA[i]; return k; };

  // Prior shapes (unnormalised densities on the grid).
  const PRIOR_SHAPES = {
    flat: th => 1,
    high: th => Math.pow(th, 13) * Math.pow(1 - th, 5),   // Beta(14, 6): "most visitors click", mean 0.70
    low: th => th * Math.pow(1 - th, 9),                  // Beta(2, 10): "few click", mean 1/6
    capped: th => (th <= 0.2 + 1e-12 ? 1 : 0)              // flat but rules out θ > 0.2 entirely
  };

  // Posterior density on the grid after k clicks in n visitors; trapezoid-normalised.
  function gridPosterior(shape, n, k) {
    const f = PRIOR_SHAPES[shape];
    const logw = THETA.map(th => {
      const pr = f(th); if (pr <= 0) return -Infinity;
      const a = k > 0 ? k * Math.log(th) : 0, b = n - k > 0 ? (n - k) * Math.log(1 - th) : 0;
      return Math.log(pr) + a + b;
    });
    const mx = Math.max(...logw.filter(Number.isFinite));
    const w = logw.map(v => (Number.isFinite(v) ? Math.exp(v - mx) : 0));
    let Z = 0; for (let i = 0; i < G; i++) Z += (w[i] + w[i + 1]) / 2 / G;
    return w.map(v => v / Z);
  }
  function summary(dens) {
    // mean and equal-tailed 90% interval from the trapezoid CDF (linear interpolation).
    let mean = 0; const cdf = [0];
    for (let i = 0; i < G; i++) { const seg = (dens[i] + dens[i + 1]) / 2 / G; cdf.push(cdf[i] + seg); mean += seg * (THETA[i] + THETA[i + 1]) / 2; }
    const q = p => { for (let i = 0; i < G; i++) if (cdf[i + 1] >= p) { const f = (p - cdf[i]) / Math.max(1e-300, cdf[i + 1] - cdf[i]); return (i + f) / G; } return 1; };
    // keep the interval inside the support (the capped prior has zero density above 0.2)
    let first = 0, last = G; while (first < G && dens[first] <= 0) first++; while (last > 0 && dens[last] <= 0) last--;
    const clamp = v => Math.min(last / G, Math.max(first / G, v));
    const lo = clamp(q(0.05)), hi = clamp(q(0.95));
    return { mean, lo, hi, width: hi - lo, peak: Math.max(...dens) };
  }
  // Cached summaries for n = 0..NMAX along the fixed data stream.
  const cache = {};
  function track(shape) {
    if (!cache[shape]) cache[shape] = Array.from({ length: NMAX + 1 }, (_, n) => ({ n, k: clicksUpTo(n), ...summary(gridPosterior(shape, n, clicksUpTo(n))) }));
    return cache[shape];
  }

  const api = { FILTER, N0, posterior, joint, counts, odds, prob, lo10, fromLo, PRIORS, LRS, WORDS, wordById, chain, shuffled, mulberry32, G, THETA, TRUE_THETA, NMAX, DATA, clicksUpTo, PRIOR_SHAPES, gridPosterior, summary, track };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BAYES_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
