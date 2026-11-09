'use strict';
// Derivative lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, secant, tangent and readout on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  // Steps 0–2: a car whose distance from the start line is s(t) = t² metres after t seconds.
  const s = t => t * t;
  const T0 = 2;                                  // "the moment" we ask about
  const avg = (a, b) => (s(b) - s(a)) / (b - a); // average speed over [a, b]
  // Slope of the secant through (x0, f(x0)) and (x0 + dx, f(x0 + dx)).
  const secant = (fn, x0, dx) => (fn(x0 + dx) - fn(x0)) / dx;
  // Step 2: inside a window x0 ± w, the largest vertical gap between s and its tangent at x0.
  // For s = t² the gap is (t − x0)², so the exact answer is w²; maxGapNumeric checks it by sampling.
  const tangentAt = (fn, dfn, x0) => x => fn(x0) + dfn(x0) * (x - x0);
  const maxGap = w => w * w;
  function maxGapNumeric(fn, dfn, x0, w, n = 2000) {
    const L = tangentAt(fn, dfn, x0); let g = 0;
    for (let i = 0; i <= n; i++) { const x = x0 - w + 2 * w * i / n; g = Math.max(g, Math.abs(fn(x) - L(x))); }
    return g;
  }
  // Step 2 window: half-width w = 2 / zoom seconds, half-height 5w metres (fixed shape, so the tangent's tilt stays visible).
  const ZOOMS = [1, 2, 5, 10, 20, 50, 100, 1000];
  const zoomWindow = z => { const w = 2 / z; return { w, hx: w, hy: 5 * w }; };

  // Step 3: functions to measure along, with their rules.
  const FUNCS = {
    sq: { f: x => x * x, d: x => 2 * x },
    cube: { f: x => x * x * x, d: x => 3 * x * x }
  };
  const H_MEASURE = 0.001;                       // the step the page uses to "measure" a slope
  const measure = (key, x) => secant(FUNCS[key].f, x, H_MEASURE);

  // Step 4: height of the shot from the parabola lesson: h(t) = 2 + 7t − 4.9t² (m), no air resistance.
  const SHOT = { h0: 2, v0: 7, g: 9.8 };
  const height = t => SHOT.h0 + SHOT.v0 * t - 0.5 * SHOT.g * t * t;
  const vspeed = t => SHOT.v0 - SHOT.g * t;      // h′(t)
  const topTime = SHOT.v0 / SHOT.g;

  // Number formatting shared with the tests: trim zeros, Unicode minus, −0 → 0.
  function num(v, d = 2) {
    if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
    let str = v.toFixed(d); if (str.indexOf('.') >= 0) str = str.replace(/0+$/, '').replace(/\.$/, '');
    return str.replace('-', '−');
  }

  // Self-test items.
  const QUIZ = {
    q1: { x0: 3, dxs: [1, 0.1, 0.01] },          // y = x² at x = 3: secants 7, 6.1, 6.01 → derivative 6
    q2: { key: 'cube', x0: 1, answer: 3 }        // y = x³ at x = 1, measured with the step-3 tool
  };

  const api = { s, T0, avg, secant, tangentAt, maxGap, maxGapNumeric, ZOOMS, zoomWindow, FUNCS, H_MEASURE, measure, SHOT, height, vspeed, topTime, num, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DERIV_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
