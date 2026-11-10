'use strict';
// Population Growth (Claude Code edition) — pure model shared by the page and node tests.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Continuous exponential and logistic growth (closed forms), the per-capita rate, the growth-rate
// parabola and its peak, a least-squares fit to Carlson's yeast data, and the discrete logistic
// recursion with a behaviour classifier.
(function (root) {

/* ---------- step 0: doubling bacteria ---------- */
const BACT = { genMin: 20, cellGrams: 1e-12 };          // E. coli in rich medium; about 1 pg per cell
const REF = [                                           // comparison masses in grams
  { id: 'human', g: 6e4 }, { id: 'whale', g: 1.5e8 }, { id: 'pyramid', g: 6e12 }, { id: 'earth', g: 5.97e27 }
];
const cellsAfter = gens => Math.pow(2, gens);
const gramsAfter = gens => cellsAfter(gens) * BACT.cellGrams;
const gensToReach = grams => Math.log2(grams / BACT.cellGrams);
// Largest reference object not heavier than m (or null).
function biggestBelow(m) { let best = null; for (const r of REF) if (r.g <= m) best = r; return best; }

/* ---------- continuous models ---------- */
const expN = (N0, r, t) => N0 * Math.exp(r * t);
const logN = (N0, r, K, t) => K / (1 + ((K - N0) / N0) * Math.exp(-r * t));
const doublingTime = r => Math.LN2 / r;
const perCapita = (r, K, N) => r * (1 - N / K);                // logistic per-capita growth rate
const growth = (r, K, N) => r * N * (1 - N / K);               // dN/dt
const peakN = K => K / 2;
const peakGrowth = (r, K) => r * K / 4;
const tInflection = (N0, r, K) => Math.log((K - N0) / N0) / r; // time the S-curve is steepest (N0 < K/2)

/* ---------- step 5: Carlson's yeast (Pearl 1927 tabulation), amount of yeast vs hours ---------- */
const YEAST = [9.6, 18.3, 29.0, 47.2, 71.1, 119.1, 174.6, 257.3, 350.7, 441.0, 513.3, 559.7, 594.8, 629.4, 640.8, 651.1, 655.9, 659.6, 661.8];
function sse(r, K, data = YEAST) { const N0 = data[0]; return data.reduce((s, y, t) => s + Math.pow(y - logN(N0, r, K, t), 2), 0); }
// Least squares over (r, K) with N0 fixed at the first observation: coarse grid then local refinement.
function fitLogistic(data = YEAST) {
  let best = { r: 0.5, K: 600, sse: Infinity };
  for (let r = 0.2; r <= 1.0001; r += 0.01) for (let K = 400; K <= 900; K += 5) { const e = sse(r, K, data); if (e < best.sse) best = { r, K, sse: e }; }
  let dr = 0.005, dK = 2.5;
  for (let it = 0; it < 60; it++) {
    let moved = false;
    for (const [a, b] of [[dr, 0], [-dr, 0], [0, dK], [0, -dK]]) { const e = sse(best.r + a, best.K + b, data); if (e < best.sse) { best = { r: best.r + a, K: best.K + b, sse: e }; moved = true; } }
    if (!moved) { dr /= 2; dK /= 2; }
  }
  return best;
}
const rms = (r, K, data = YEAST) => Math.sqrt(sse(r, K, data) / data.length);
// Exponential fitted to the first n hours by least squares on ln(y): ln y = a + b·t.
function fitExpEarly(n = 7, data = YEAST) {
  const ts = [...Array(n).keys()], ys = ts.map(t => Math.log(data[t]));
  const mt = ts.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const b = ts.reduce((s, t, i) => s + (t - mt) * (ys[i] - my), 0) / ts.reduce((s, t) => s + (t - mt) * (t - mt), 0);
  const a = my - b * mt;
  return { r: b, N0: Math.exp(a), at: t => Math.exp(a + b * t) };
}

/* ---------- step 6: discrete logistic ---------- */
const stepDiscrete = (N, r) => N + r * N * (1 - N);          // N measured in units of K
function iterate(N0, r, n) { const xs = [N0]; for (let i = 0; i < n; i++) xs.push(stepDiscrete(xs[xs.length - 1], r)); return xs; }
// Behaviour of the long run from N0 = 0.05 (N0 < K): 'monotone' | 'damped' | 'cycle' (with period) | 'chaos'.
function classify(r, N0 = 0.05) {
  const xs = iterate(N0, r, 3000), tail = xs.slice(-256);
  if (tail.every(x => Math.abs(x - 1) < 1e-7)) return { kind: xs.some(x => x > 1 + 1e-9) ? 'damped' : 'monotone', period: 1 };
  for (const p of [2, 3, 4, 5, 6, 8, 16, 32]) if (tail.every((x, i) => i < p || Math.abs(x - tail[i - p]) < 1e-7)) return { kind: 'cycle', period: p };
  // at a bifurcation point (r = 2 exactly) the swing still shrinks, only very slowly
  const amp = a => Math.max(...a.map(x => Math.abs(x - 1)));
  if (amp(tail) < 0.05 && amp(tail.slice(128)) < amp(tail.slice(0, 128))) return { kind: 'damped', period: 1 };
  return { kind: 'chaos', period: 0 };
}
const SAFE_R = 1;      // continuous-like behaviour (no overshoot) for 0 < r ≤ 1
const MAX_R = 2.9;     // above 3 the recursion can leave [0, ∞)

const api = { BACT, REF, cellsAfter, gramsAfter, gensToReach, biggestBelow, expN, logN, doublingTime, perCapita, growth, peakN, peakGrowth, tInflection, YEAST, sse, fitLogistic, rms, fitExpEarly, stepDiscrete, iterate, classify, SAFE_R, MAX_R };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.POP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
