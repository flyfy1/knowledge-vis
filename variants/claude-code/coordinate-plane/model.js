'use strict';
// Coordinate plane lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Addresses, candidate counts, quadrants, swaps and quiz answers are computed here; the page only
// draws and formats them. The world is the integer grid −6..6 in both directions (13 × 13 points).
(function (root) {
  const LO = -6, HI = 6, SIDE = HI - LO + 1;
  const clamp = v => Math.max(LO, Math.min(HI, Math.round(v)));

  // A coordinate pair with a true minus sign (U+2212), half-width brackets, comma + space.
  const fmtNum = v => (v < 0 ? '−' + Math.abs(v) : String(v));
  const fmtCoord = (x, y) => `(${fmtNum(x)}, ${fmtNum(y)})`;

  // Step 0: how many grid points match the clues you gave.
  // mode 'line': the treasure is somewhere on one straight road (the x axis) → x alone pins it.
  // mode 'plane': the treasure is anywhere in the field → x alone leaves a whole column.
  function candidates(mode, x, y) {
    const out = [];
    if (mode === 'line') { out.push([x, 0]); return out; }
    for (let v = LO; v <= HI; v++) if (y === null || y === v) out.push([x, v]);
    return out;
  }

  // Step 1: walk from the origin, across first (x), then up or down (y).
  function walk(x, y) { return { legs: [[[0, 0], [x, 0]], [[x, 0], [x, y]]], steps: Math.abs(x) + Math.abs(y) }; }

  // Step 2: addresses relative to an origin placed at absolute grid point (ox, oy).
  const LANDMARKS = [{ id: 'house', p: [2, 3] }, { id: 'tree', p: [-4, 1] }, { id: 'well', p: [1, -3] }];
  const ORIGIN_RANGE = [-3, 3];
  function address(p, ox, oy) { return [p[0] - ox, p[1] - oy]; }

  // Step 3: swapping the two numbers of a pair.
  const swap = (x, y) => [y, x];
  const sameAfterSwap = (x, y) => x === y;

  // Step 4: one shared quadrant function (readout, colouring and quiz all use it).
  function quadrant(x, y) {
    if (x === 0 && y === 0) return 'origin';
    if (y === 0) return 'xAxis';
    if (x === 0) return 'yAxis';
    if (x > 0 && y > 0) return 'I';
    if (x < 0 && y > 0) return 'II';
    if (x < 0 && y < 0) return 'III';
    return 'IV';
  }
  const SIGNS = { I: ['+', '+'], II: ['−', '+'], III: ['−', '−'], IV: ['+', '−'] };
  const sign = v => (v > 0 ? '+' : v < 0 ? '−' : '0');

  // Step 5: quiz. Answers come from the functions above.
  const QUIZ = {
    q1: { p: [-4, -3], options: [[-4, -3], [-3, -4], [4, 3]] },
    q2: { target: [-2, 3] },
    q3: { a: [4, 1], b: [1, 4] }
  };
  QUIZ.q1.answer = 0; // index of the option equal to the point
  QUIZ.q3.answer = (QUIZ.q3.a[0] === QUIZ.q3.b[0] && QUIZ.q3.a[1] === QUIZ.q3.b[1]) ? 'same' : 'different';
  const samePoint = (p, q) => p[0] === q[0] && p[1] === q[1];

  const api = { LO, HI, SIDE, clamp, fmtNum, fmtCoord, candidates, walk, LANDMARKS, ORIGIN_RANGE, address, swap, sameAfterSwap, quadrant, SIGNS, sign, QUIZ, samePoint };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
