'use strict';
// Inequalities lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every truth value, bound, count and comparison on the page is computed here; tests/core.cjs pins the claims.
// Scope: one unknown, first degree (a·x + b ? c). No systems, no absolute values.
(function (root) {
  const EPS = 1e-9;
  const OPS = ['<', '≤', '>', '≥'];
  const FLIP = { '<': '>', '≤': '≥', '>': '<', '≥': '≤' };
  const strict = op => op === '<' || op === '>';

  function holds(l, op, r) {
    if (op === '<') return l < r - EPS;
    if (op === '≤') return l <= r + EPS;
    if (op === '>') return l > r + EPS;
    return l >= r - EPS;
  }
  // The relation that actually holds between two numbers.
  const rel = (l, r) => (Math.abs(l - r) <= EPS ? '=' : l < r ? '<' : '>');

  // Step 0: a suitcase that weighs BASE kg on its own; the airline allows at most LIMIT kg.
  const BASE = 3, LIMIT = 10;
  const luggageOk = x => holds(BASE + x, '≤', LIMIT);

  // Step 1: the closest number we test next to the end point a at a given zoom (one tick of the zoomed ruler).
  function probe(a, op, zoom) {
    const side = op === '<' || op === '≤' ? -1 : 1;
    return a + side / zoom;
  }

  // Step 2 / 3: what adding c or multiplying by m does to a pair p < q.
  const P = -1, Q = 2;                       // step 3 pair
  const P2 = 2, Q2 = 5;                      // step 2 pair
  const shifted = (p, q, c) => ({ p: p + c, q: q + c, gap: (q + c) - (p + c), rel: rel(p + c, q + c) });
  const scaled = (p, q, m) => ({ p: p * m, q: q * m, gap: q * m - p * m, rel: rel(p * m, q * m) });

  // Exact fractions for the bound (c − b) / a with a a multiple of 0.5.
  function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) [x, y] = [y, x % y]; return x || 1; }
  function frac(num, den) {
    if (den < 0) { num = -num; den = -den; }
    const g = gcd(num, den);
    return { num: num / g, den: den / g, value: num / den };
  }

  // Step 4: solve a·x + b (op) c.
  function solve(a, b, op, c) {
    if (Math.abs(a) < EPS) return { type: holds(b, op, c) ? 'all' : 'none', a, b, c, op };
    const f = frac(Math.round(2 * (c - b)), Math.round(2 * a));     // a, b, c are on the slider grids (a in steps of 0.5)
    const op2 = a < 0 ? FLIP[op] : op;
    return { type: 'ray', a, b, c, op, op2, bound: f.value, frac: f, flipped: a < 0, closed: !strict(op2), rhs: c - b };
  }
  function inSolution(sol, x) {
    if (sol.type === 'all') return true;
    if (sol.type === 'none') return false;
    return holds(x, sol.op2, sol.bound);
  }

  // Step 5: buy n notebooks at p each plus a delivery charge s, budget M: p·n + s ≤ M, n a whole number ≥ 0.
  function budget(M, p, s) {
    const bound = (M - s) / p;
    if (bound < -EPS) return { bound, n: -1, cost: null, left: null };
    const n = Math.floor(bound + EPS);
    return { bound, n, cost: s + p * n, left: M - s - p * n };
  }

  const api = { EPS, OPS, FLIP, strict, holds, rel, BASE, LIMIT, luggageOk, probe, P, Q, P2, Q2, shifted, scaled, gcd, frac, solve, inSolution, budget };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.INEQ_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
