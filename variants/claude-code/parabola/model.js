'use strict';
// Parabola lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, curve, equation string and readout on the page comes from here; tests/core.cjs pins the claims.
// Units in the shot scenes: metres and seconds, g = 9.8 m/s², no air resistance.
(function (root) {
  const G = 9.8;
  const DT = 0.1;                       // the dots in step 0 are 0.1 s apart
  const RELEASE = 2;                    // the ball leaves the hand 2 m above the floor
  const DEFAULT_SHOT = { vx: 4, vy: 7 };// horizontal / vertical launch speed, m/s
  const RIM = 3.05;                     // regulation rim height, m
  const RIM_TOL = 0.1;                  // counts as "in" when the ball is within 0.1 m of the rim height there, falling

  const r = (v, d = 9) => Math.round(v * Math.pow(10, d)) / Math.pow(10, d);

  // ---- the shot: position after t seconds ----
  function shotAt(s, t) { return { t, x: s.vx * t, y: RELEASE + s.vy * t - 0.5 * G * t * t }; }
  function landTime(s) { return (s.vy + Math.sqrt(s.vy * s.vy + 2 * G * RELEASE)) / G; }
  // Dots every DT seconds while the ball is still above the floor.
  function shotDots(s) {
    const out = [], T = landTime(s);
    for (let i = 0; i * DT <= T + 1e-12; i++) out.push(shotAt(s, r(i * DT)));
    return out;
  }
  // Height gained in each 0.1 s interval (negative = falling).
  function rises(dots) { const out = []; for (let i = 1; i < dots.length; i++) out.push(dots[i].y - dots[i - 1].y); return out; }
  function peak(s) { const t = s.vy / G; return { t, x: s.vx * t, y: RELEASE + s.vy * s.vy / (2 * G) }; }
  // The same path written in x: y = a(x − h)² + k.
  function shotVertexForm(s) { const p = peak(s); return { a: -G / (2 * s.vx * s.vx), h: p.x, k: p.y }; }
  function heightAtX(s, x) { const t = x / s.vx; return RELEASE + s.vy * t - 0.5 * G * t * t; }
  // Where the default shot comes down through rim height: that is where the page puts the hoop.
  function descendX(s, yLevel) {
    const A = 0.5 * G, B = -s.vy, Cc = yLevel - RELEASE, d = B * B - 4 * A * Cc;
    if (d < 0) return null;
    return s.vx * (-B + Math.sqrt(d)) / (2 * A);
  }
  const HOOP_X = descendX(DEFAULT_SHOT, RIM);
  function judgeShot(s) {
    const y = heightAtX(s, HOOP_X), t = HOOP_X / s.vx, falling = s.vy - G * t < 0;
    const miss = y - RIM;
    return { y, miss, falling, made: falling && Math.abs(miss) <= RIM_TOL + 1e-9 };
  }

  // ---- algebra: y = a(x − h)² + k ----
  const f = (a, h, k, x) => a * (x - h) * (x - h) + k;
  // Crossings with the x-axis, read from vertex form: a(x − h)² = −k.
  function crossings(a, h, k) {
    if (a === 0) return k === 0 ? { count: Infinity, xs: [] } : { count: 0, xs: [] };
    const q = -k / a;
    if (Math.abs(q) < 1e-12) return { count: 1, xs: [h] };
    if (q < 0) return { count: 0, xs: [] };
    const d = Math.sqrt(q);
    return { count: 2, xs: [h - d, h + d] };
  }

  // Number formatting shared by the page and the tests: trim zeros, Unicode minus, −0 → 0.
  function num(v, d = 2) {
    if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
    let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s.replace('-', '−');
  }
  // Is v exactly what num(v, d) prints? (Otherwise the page writes ≈.)
  const exactAt = (v, d = 2) => Math.abs(v * Math.pow(10, d) - Math.round(v * Math.pow(10, d))) < 1e-9;
  // Equation in vertex form, written the way a textbook would: y = −(x + 1)² + 3, y = 0.5x² − 2, y = 2(x − 3)².
  function equation(a, h, k, d = 2, ad = d) {
    if (a === 0) return 'y = ' + num(k, d);
    const coef = a === 1 ? '' : a === -1 ? '−' : num(a, ad);
    const hs = Math.abs(h) < 1e-12 ? '' : (h > 0 ? ' − ' : ' + ') + num(Math.abs(h), d);
    const sq = hs ? `(x${hs})²` : 'x²';
    const ks = Math.abs(k) < 1e-12 ? '' : (k > 0 ? ' + ' : ' − ') + num(Math.abs(k), d);
    return `y = ${coef}${sq}${ks}`;
  }
  // Steps of 1 away from the vertex rise a, 3a, 5a, … (y = a·x² at x = 1, 2, 3 is a, 4a, 9a).
  function stepRises(a, n = 3) { const out = []; for (let i = 1; i <= n; i++) out.push(a * (i * i - (i - 1) * (i - 1))); return out; }

  // Step 1/2/3 slider choices for a: never 0 on the main slider, so every curve is a parabola.
  const A_CHOICES = [-2, -1, -0.5, 0.5, 1, 2];
  const A1_CHOICES = [-2, -1.5, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 1.5, 2];

  // Self-test items.
  const QUIZ = {
    q1: { h: 2, k: 1, a: -1 },          // which equation draws this graph?
    q2: { h: -1, k: 3, down: true },    // put the vertex at (−1, 3), opening downward
    q3: { a: -1, h: 1, k: 4 }           // y = −(x − 1)² + 4 meets the axis where?
  };

  const api = { G, DT, RELEASE, DEFAULT_SHOT, RIM, RIM_TOL, HOOP_X, shotAt, landTime, shotDots, rises, peak, shotVertexForm, heightAtX, descendX, judgeShot, f, crossings, num, exactAt, equation, stepRises, A_CHOICES, A1_CHOICES, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PARA_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
