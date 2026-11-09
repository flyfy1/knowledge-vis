'use strict';
// Negative numbers lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, comparison, landing point and difference on the page is computed here;
// tests/core.cjs pins the claims. All values are whole numbers (integer steps on the line).
(function (root) {
  // Step 0 / 1: the sea-level scene. Heights are in metres, measured from the sea surface (up = +).
  const SCENE = { bird: 4, fish: -3, deck: 2, seabed: -6, gauge: [-8, 8] };

  // Which side of 0 a number sits on, and how far away.
  function describe(v) {
    return { side: v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero', dist: Math.abs(v), twin: v === 0 ? 0 : -v };
  }

  // Step 1: the same physical height read from a different zero. Zero placed r metres above the sea.
  function relabel(height, r) { return height - r; }

  // Step 2: compare by position on the line (left = smaller). Returns −1, 0 or 1 like a < b, a = b, a > b.
  function compare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  // The tempting wrong rule: compare the digits and ignore the sign.
  function digitRule(a, b) { return compare(Math.abs(a), Math.abs(b)); }
  const CARDS = [4, -7, 0, -2, 9, -10];
  function sorted(list) { return list.slice().sort((p, q) => p - q); }

  // Step 3: walk n whole steps from s, to the right (+1) or to the left (−1).
  function walk(s, dir, n) {
    const path = [s];
    for (let i = 1; i <= n; i++) path.push(s + dir * i);
    const end = s + dir * n;
    // the step index at which the walker stands on 0 (null if it never does after leaving)
    let zeroAt = null;
    for (let i = 1; i <= n; i++) if (path[i] === 0) { zeroAt = i; break; }
    const crosses = (s > 0 && end < 0) || (s < 0 && end > 0);
    return { start: s, dir, n, end, path, zeroAt, crosses };
  }
  const WALK = { start: [-8, 8], steps: [0, 8], axis: [-16, 16] };
  // The drawn axis: at least −8..8, widened by one mark past the start and the landing point.
  function axisFor(s, end) { return [Math.min(-8, s - 1, end - 1), Math.max(8, s + 1, end + 1)]; }

  // Step 4: how much the temperature changed from m (morning) to n (noon), counted along the line,
  // split into the part below 0 and the part above 0.
  function change(m, n) {
    const lo = Math.min(m, n), hi = Math.max(m, n);
    const below = Math.max(0, Math.min(hi, 0) - lo);
    const above = Math.max(0, hi - Math.max(lo, 0));
    return { delta: n - m, size: hi - lo, below, above, crosses: lo < 0 && hi > 0 };
  }

  // Step 5: quiz, answers computed from the same functions.
  const QUIZ = {
    q1: { depth: 6, options: ['-6', '6', '0'], answer: String(-6) },
    q2: { a: -9, b: -4, options: ['-9', '-4'] },
    q3: { from: -3, to: 4, options: ['1', '7', '-7'] }
  };
  QUIZ.q2.answer = String(compare(QUIZ.q2.a, QUIZ.q2.b) < 0 ? QUIZ.q2.a : QUIZ.q2.b);
  QUIZ.q3.answer = String(change(QUIZ.q3.from, QUIZ.q3.to).delta);

  const api = { SCENE, describe, relabel, compare, digitRule, CARDS, sorted, walk, WALK, axisFor, change, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NEG_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
