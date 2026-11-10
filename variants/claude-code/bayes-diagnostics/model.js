'use strict';
// Bayes diagnostics model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, percentage and curve on the page is computed here; tests/core.cjs pins the claims.
// Counts are expected frequencies in a population of N people (they can be fractional); the icon
// grid rounds them to whole people with roundedCells().
(function (root) {
  const N = 1000;
  // The hook scenario of step 0 (and the reset values of the shared sliders).
  const DEFAULTS = { prev: 0.02, sens: 0.90, spec: 0.95 };

  // prev = P(ill), sens = P(+ | ill), spec = P(− | healthy).
  function counts(prev, sens, spec, n = N) {
    const ill = n * prev, healthy = n - ill;
    const TP = ill * sens, FN = ill - TP, FP = healthy * (1 - spec), TN = healthy - FP;
    const pos = TP + FP, neg = FN + TN;
    return {
      n, ill, healthy, TP, FN, FP, TN, pos, neg,
      ppv: pos > 0 ? TP / pos : 0,          // P(ill | +)
      npv: neg > 0 ? TN / neg : 0,          // P(healthy | −)
      illGivenNeg: neg > 0 ? FN / neg : 0,  // P(ill | −)
      fpr: 1 - spec                          // P(+ | healthy)
    };
  }

  // Bayes' formula written with probabilities only (no population) — must agree with counts().ppv.
  function ppvFormula(prev, sens, spec) {
    const num = sens * prev, den = sens * prev + (1 - spec) * (1 - prev);
    return den > 0 ? num / den : 0;
  }
  function npvFormula(prev, sens, spec) {
    const num = spec * (1 - prev), den = spec * (1 - prev) + (1 - sens) * prev;
    return den > 0 ? num / den : 0;
  }

  // Whole-person version for the icon grid: each row (ill / healthy) keeps its own total.
  function roundedCells(prev, sens, spec, n = N) {
    const c = counts(prev, sens, spec, n);
    const ill = Math.round(c.ill), healthy = n - ill;
    const TP = Math.min(ill, Math.round(c.TP)), FP = Math.min(healthy, Math.round(c.FP));
    return { ill, healthy, TP, FN: ill - TP, FP, TN: healthy - FP };
  }

  // Positive likelihood ratio: how many times likelier a positive is for an ill person than for a healthy one.
  function lrPos(sens, spec) { return (1 - spec) > 0 ? sens / (1 - spec) : Infinity; }
  const odds = p => p / (1 - p);
  const prob = o => o / (1 + o);

  // k independent positive results in a row (independence given the true status is an assumption).
  // Returns each round's expected ill and healthy people still testing positive, and P(ill | k positives).
  function repeatRounds(prev, sens, spec, kMax, n = N) {
    const out = [];
    for (let k = 0; k <= kMax; k++) {
      const ill = n * prev * Math.pow(sens, k), healthy = n * (1 - prev) * Math.pow(1 - spec, k);
      out.push({ k, ill, healthy, post: ill + healthy > 0 ? ill / (ill + healthy) : 0 });
    }
    return out;
  }

  const api = { N, DEFAULTS, counts, ppvFormula, npvFormula, roundedCells, lrPos, odds, prob, repeatRounds };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BAYES_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
