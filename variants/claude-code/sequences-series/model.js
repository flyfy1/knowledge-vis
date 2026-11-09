'use strict';
// Sequences & series lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, block, dot and readout on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  // arithmetic: a_n = a1 + (n − 1)d
  const arithTerm = (a1, d, n) => a1 + (n - 1) * d;
  const arithTerms = (a1, d, N) => Array.from({ length: N }, (_, i) => arithTerm(a1, d, i + 1));
  const arithSum = (a1, d, n) => n * (a1 + arithTerm(a1, d, n)) / 2;   // reverse-and-add formula
  const directSum = arr => arr.reduce((s, v) => s + v, 0);

  // geometric: a_n = a1·r^(n−1)
  const geoTerm = (a1, r, n) => a1 * Math.pow(r, n - 1);
  const geoTerms = (a1, r, N) => Array.from({ length: N }, (_, i) => geoTerm(a1, r, i + 1));
  const geoSum = (a1, r, n) => (r === 1 ? a1 * n : a1 * (1 - Math.pow(r, n)) / (1 - r)); // shift-and-subtract formula
  const geoLimit = (a1, r) => (Math.abs(r) < 1 ? a1 / (1 - r) : NaN);
  // smallest n with |S∞ − S_n| < eps (|r| < 1); the gap is |a1·rⁿ/(1 − r)|
  function termsWithin(a1, r, eps) { if (!(Math.abs(r) < 1)) return Infinity; if (r === 0) return 1; let n = 1; while (Math.abs(a1 * Math.pow(r, n) / (1 - r)) >= eps) n++; return n; }

  // chessboard: square k holds 2^(k−1) grains (exact, BigInt); first k squares hold 2^k − 1
  const grains = k => 2n ** BigInt(k - 1);
  const grainsUpTo = k => 2n ** BigInt(k) - 1n;
  const GRAIN_G = 0.04; // assumed mass of one wheat grain in grams (labelled as an assumption on the page)
  const tonnes = big => Number(big) * GRAIN_G / 1e6;

  // pocket money: plan A starts at a yuan and adds d per day; plan B starts at b yuan and multiplies by r per day
  function pocket(d, r, { a = 100, b = 0.01, N = 30 } = {}) {
    const A = [], B = []; let sa = 0, sb = 0, cross = null;
    for (let n = 1; n <= N; n++) { sa += arithTerm(a, d, n); sb += geoTerm(b, r, n); A.push(sa); B.push(sb); if (cross === null && sb > sa) cross = n; }
    return { A, B, cross, dailyA: arithTerm(a, d, N), dailyB: geoTerm(b, r, N) };
  }

  // finale quiz: classify by constant difference / constant ratio
  function classify(seq) {
    const diffs = seq.slice(1).map((v, i) => v - seq[i]), ratios = seq.slice(1).map((v, i) => v / seq[i]);
    const same = a => a.every(v => Math.abs(v - a[0]) < 1e-9);
    if (same(diffs)) return { kind: 'arith', d: diffs[0], next: seq[seq.length - 1] + diffs[0] };
    if (seq.every(v => v !== 0) && same(ratios)) return { kind: 'geo', r: ratios[0], next: seq[seq.length - 1] * ratios[0] };
    return { kind: 'neither', next: null };
  }
  const QUIZ = [[3, 7, 11, 15, 19], [5, 10, 20, 40, 80], [1, 4, 9, 16, 25], [81, 27, 9, 3, 1], [10, 7, 4, 1, -2], [2, -6, 18, -54, 162]];

  const api = { arithTerm, arithTerms, arithSum, directSum, geoTerm, geoTerms, geoSum, geoLimit, termsWithin, grains, grainsUpTo, GRAIN_G, tonnes, pocket, classify, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SEQ_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
