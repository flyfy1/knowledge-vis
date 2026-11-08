'use strict';
// Veil of ignorance teaching model. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// Each society is five equally sized positions with a "well-being score" (abstract units, not money).
// Rules compared:
//   average  — Harsanyi (1975): with an equal chance of being anyone, maximise the mean;
//   maximin  — Rawls, A Theory of Justice (1971) §§26–28: maximise the worst-off position;
//   eta      — this page's own teaching knob (NOT Rawls's or Harsanyi's formulation): rank by the
//              certainty equivalent under constant relative risk aversion η; η = 0 gives the mean,
//              η → ∞ approaches the minimum.
(function (root) {
  const SOCIETIES = {
    A: [30, 30, 30, 30, 30],
    B: [10, 25, 40, 60, 90],
    C: [20, 28, 36, 48, 68],
  };
  const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  const min = xs => Math.min(...xs);
  // Certainty equivalent: the sure score you would accept instead of a random position.
  function ce(xs, eta) {
    if (eta === 0) return mean(xs);
    if (Math.abs(eta - 1) < 1e-9) return Math.exp(mean(xs.map(Math.log)));
    return Math.pow(mean(xs.map(x => Math.pow(x, 1 - eta))), 1 / (1 - eta));
  }
  function pick(societies, score) {
    let best = null;
    for (const [k, xs] of Object.entries(societies)) { const v = score(xs); if (!best || v > best.v + 1e-12) best = { k, v }; }
    return best;
  }
  const choose = {
    average: s => pick(s, mean),
    maximin: s => pick(s, min),
    eta: (s, eta) => pick(s, xs => ce(xs, eta)),
  };

  // Redistribution from a pre-tax society x: tax rate t, revenue shared equally; the pie shrinks by
  // the factor (1 − k t²). k is a made-up teaching parameter for "levelling has a cost", not data.
  function redistribute(x, t, k) {
    const m = mean(x), shrink = Math.max(0, 1 - k * t * t);
    return x.map(v => shrink * ((1 - t) * v + t * m));
  }
  function bestT(x, k, score) {
    let best = { t: 0, v: -Infinity };
    for (let i = 0; i <= 1000; i++) { const t = i / 1000, v = score(redistribute(x, t, k)); if (v > best.v + 1e-12) best = { t, v }; }
    return best;
  }

  // Deterministic draws of a position (0..4) for the "lift the veil" button.
  function drawer(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return Math.floor(((t ^ (t >>> 14)) >>> 0) / 4294967296 * 5); };
  }

  const api = { SOCIETIES, mean, min, ce, choose, redistribute, bestT, drawer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VEIL = api;
})(typeof window !== 'undefined' ? window : globalThis);
