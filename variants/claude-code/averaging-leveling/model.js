'use strict';
// Averages · Level by Pouring (Claude Code edition) — pure model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, level and readout on the page comes from here; tests/core.cjs pins the claims.
// Units: a cup holds whole "parts" (份) except where a step says pouring may split a part.
(function (root) {
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  // Step 0: four cups, capacity 10 parts each.
  const S0 = { cups: [7, 3, 5, 1], cap: 10 };
  // Step 1: presets that level exactly (whole-number mean).
  const S1 = { presets: [[7, 3, 5, 1], [9, 2, 6, 4, 4], [8, 8, 2, 5, 7, 6]], cap: 10 };
  // Step 2: the first n of these cups are poured together and split evenly.
  const S2 = { cups: [6, 2, 7, 3, 9, 4], nMin: 2, nMax: 6, nDefault: 3, cap: 10 };
  // Step 3: four steady cups plus one cup whose amount x the reader controls.
  const S3 = { base: [4, 5, 6, 5], xMin: 0, xMax: 20, xDefault: 5, cap: 20 };
  // Step 4: two teams' baskets in one practice; team B may gain a seventh player scoring x.
  const S4 = { a: [9, 6, 8, 7], b: [6, 7, 5, 8, 6, 4], xMin: 0, xMax: 10, xDefault: 9 };
  // Step 5: three known cups; how much must the fourth hold for a target mean t?
  const S5 = { known: [4, 7, 5], cap: 12, xMin: 0, xMax: 12, xDefault: 3, tMin: 3, tMax: 8, tDefault: 6 };

  const sum = a => a.reduce((s, v) => s + v, 0);
  const mean = a => sum(a) / a.length;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

  // Exact mean of whole numbers as whole + num/den (num < den, reduced). den = 1 when it divides.
  function meanFrac(a) {
    const s = sum(a), n = a.length, whole = Math.floor(s / n), r = s - whole * n, g = gcd(r, n) || 1;
    return { s, n, whole, num: r / g, den: r ? n / g : 1, r };
  }

  // Pour one part from cup i to cup j (capacity cap). Never changes the total.
  function pour(cups, i, j, cap) {
    if (i === j) return { ok: false, reason: 'same', cups: cups.slice() };
    if (cups[i] <= 0) return { ok: false, reason: 'empty', cups: cups.slice() };
    if (cups[j] >= cap) return { ok: false, reason: 'full', cups: cups.slice() };
    const next = cups.slice(); next[i] -= 1; next[j] += 1;
    return { ok: true, reason: null, cups: next };
  }

  // "Move from more to less": always pour one part from the fullest cup (leftmost on ties) into the
  // emptiest (leftmost on ties) until the spread max − min is at most 1. Returns every move.
  function levelPlan(cups) {
    let c = cups.slice(); const moves = [], states = [c.slice()];
    while (Math.max(...c) - Math.min(...c) > 1) {
      const hi = c.indexOf(Math.max(...c)), lo = c.indexOf(Math.min(...c));
      c = pour(c, hi, lo, Infinity).cups; moves.push({ from: hi, to: lo }); states.push(c.slice());
    }
    return { moves, states, final: c };
  }

  // Parts sticking out above a level, and empty room below it.
  const excess = (a, level) => sum(a.map(v => Math.max(0, v - level)));
  const shortfall = (a, level) => sum(a.map(v => Math.max(0, level - v)));

  function step3(x) {
    const cups = S3.base.concat([x]), m = mean(cups), m0 = mean(S3.base.concat([S3.xDefault]));
    const above = cups.filter(v => v > m + 1e-9).length, below = cups.filter(v => v < m - 1e-9).length;
    return { cups, total: sum(cups), mean: m, mean0: m0, change: m - m0, above, below, equal: cups.length - above - below, min: Math.min(...cups), max: Math.max(...cups) };
  }

  function step4(withNew, x) {
    const b = withNew ? S4.b.concat([x]) : S4.b.slice();
    const bOld = mean(S4.b);
    return { a: S4.a.slice(), b, totalA: sum(S4.a), totalB: sum(b), meanA: mean(S4.a), meanB: mean(b), meanBOld: bOld, nA: S4.a.length, nB: b.length };
  }

  function step5(x, t) {
    const n = S5.known.length + 1, have = sum(S5.known), need = n * t - have;
    const cups = S5.known.concat([x]);
    return { n, have, targetTotal: n * t, need, feasible: need >= 0 && need <= S5.cap, cups, mean: mean(cups), hit: x === need };
  }

  const api = { LETTERS, S0, S1, S2, S3, S4, S5, sum, mean, meanFrac, pour, levelPlan, excess, shortfall, step3, step4, step5 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AVG_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
