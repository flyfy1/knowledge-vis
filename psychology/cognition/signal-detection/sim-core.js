'use strict';
// Equal-variance Gaussian signal detection model. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// Noise trials: internal evidence x ~ N(0, 1). Signal trials: x ~ N(d', 1).
// The observer says "yes" when x > k (k = criterion location on the evidence axis).
// Formulas checked against M. Georgeson, "Sensitivity and Bias — an introduction to Signal
// Detection Theory" (Univ. of Birmingham PG research methods handout), pp. 1–6:
//   d' = z(H) − z(F),   C = −[z(H) + z(F)] / 2,   C < 0 = lax ("yes"-biased), C > 0 = strict.
(function (root) {
  // Standard normal CDF via erf (Abramowitz & Stegun 7.1.26, |error| < 1.5e-7).
  function erf(x) {
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
  const pdf = (x, mu = 0) => Math.exp(-0.5 * (x - mu) * (x - mu)) / Math.sqrt(2 * Math.PI);
  // Inverse CDF (z of a probability) by bisection on Phi: slow but exact enough and simple to audit.
  function z(p) {
    if (!(p > 0 && p < 1)) return p <= 0 ? -Infinity : Infinity;
    let lo = -9, hi = 9;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (Phi(mid) < p) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  // Rates predicted by the model for separation d and criterion location k.
  function rates(d, k) { return { H: 1 - Phi(k - d), F: 1 - Phi(k) }; }
  // Measures recovered from observed rates.
  function measures(H, F) {
    const zH = z(H), zF = z(F);
    return { dprime: zH - zF, c: -(zH + zF) / 2, pc: 0.5 + (H - F) / 2 };
  }
  // With k measured from the noise mean, C = k − d'/2 (distance from the midpoint of the two means).
  const cFromK = (d, k) => k - d / 2;
  const kFromC = (d, c) => c + d / 2;

  // Deterministic PRNG (mulberry32) + Box–Muller, so a "run trials" button is reproducible.
  function rng(seed) {
    let a = seed >>> 0;
    const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const normal = () => { let x = 0; while (x === 0) x = u(); return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * u()); };
    return { u, normal };
  }
  // n trials, half signal / half noise (alternating), each with its evidence value and response.
  function trials(d, k, n, seed) {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const signal = i % 2 === 0, x = r.normal() + (signal ? d : 0);
      out.push({ signal, x, yes: x > k });
    }
    return out;
  }
  function tally(list) {
    const t = { hit: 0, miss: 0, fa: 0, cr: 0 };
    for (const s of list) t[s.signal ? (s.yes ? 'hit' : 'miss') : (s.yes ? 'fa' : 'cr')]++;
    return t;
  }

  // Expected cost per trial for prior P(signal) = p, miss cost m, false-alarm cost f.
  function expectedCost(d, k, p, m, f) { const { H, F } = rates(d, k); return p * (1 - H) * m + (1 - p) * F * f; }
  // Criterion that minimises expected cost, found by scanning the model (no closed form is assumed).
  function bestK(d, p, m, f) {
    let best = { k: 0, cost: Infinity };
    for (let k = -4; k <= d + 4; k += 0.001) { const c = expectedCost(d, k, p, m, f); if (c < best.cost) best = { k, cost: c }; }
    return best;
  }

  const api = { Phi, pdf, z, rates, measures, cFromK, kFromC, rng, trials, tally, expectedCost, bestK };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SDT = api;
})(typeof window !== 'undefined' ? window : globalThis);
