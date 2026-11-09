'use strict';
// Inverse proportion (Claude Code edition) — pure model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every value on the page is computed here; the page never writes a numeric conclusion by hand.
(function (root) {
  const AREA = 24; // steps 0–1: a rectangle of fixed area 24 (square units)

  // y = k / x; undefined at x = 0.
  const f = (k, x) => (x === 0 ? null : k / x);

  // Step 0: width x → height of the rectangle with area AREA.
  function rect(x, k = AREA) { const y = k / x; return { x, y, area: x * y }; }

  // Step 1: multiply the width by m; the height must be divided by m to keep the area.
  function scale(x0, m, k = AREA) {
    const y0 = k / x0, x1 = x0 * m, y1 = k / x1;
    return { x0, y0, x1, y1, prod0: x0 * y0, prod1: x1 * y1, heightRatio: y1 / y0 };
  }

  // Step 2: which quadrants the graph occupies, by the sign of k.
  const quadrants = k => (k > 0 ? [1, 3] : k < 0 ? [2, 4] : []);
  // Sample one branch of y = k/x inside the window |x| ≤ X, |y| ≤ Y (returns polylines).
  function branches(k, X, Y, n = 400) {
    const out = [];
    for (const sgn of [1, -1]) {
      const xmin = Math.min(X, Math.abs(k) / Y); // where |y| = Y
      const pts = [];
      for (let i = 0; i <= n; i++) { const x = sgn * (xmin + (X - xmin) * i / n); pts.push([x, k / x]); }
      out.push(pts);
    }
    return out;
  }

  // Step 3: zooming out — the value of y at the right edge of the window.
  const ZOOMS = [10, 100, 1000, 10000];
  const K3 = 6;

  // Step 4: four situations; classify by whether y/x or x·y stays constant over the sample.
  const SCEN = {
    apple:  { fn: x => 5 * x,    xs: [1, 2, 3, 4, 5, 6] },
    trip:   { fn: x => 120 / x,  xs: [20, 30, 40, 60, 80, 120] },
    rope:   { fn: x => 10 - x,   xs: [1, 2, 3, 4, 5, 6] },
    square: { fn: x => x * x,    xs: [1, 2, 3, 4, 5, 6] }
  };
  const SCEN_KEYS = Object.keys(SCEN);
  function table(key) {
    const s = SCEN[key];
    return s.xs.map(x => { const y = s.fn(x); return { x, y, ratio: y / x, prod: x * y }; });
  }
  const constant = vals => vals.every(v => Math.abs(v - vals[0]) < 1e-9);
  function classify(key) {
    const rows = table(key);
    if (constant(rows.map(r => r.ratio))) return 'direct';
    if (constant(rows.map(r => r.prod))) return 'inverse';
    return 'neither';
  }

  // Step 5: real situations restrict x. Fare ¥120 split among n people (whole n only);
  // a 120 km trip at speed v between 20 and 120 km/h (any v in range).
  const FARE = 120, TRIP = 120;
  const share = n => FARE / n;
  const exactCents = n => Math.abs(Math.round(FARE * 100 / n) - FARE * 100 / n) < 1e-9;
  const hours = v => TRIP / v;

  // Step 6: through (a, b), find y at x = c.
  const QUIZ = [
    { a: 2, b: 6, c: 3 }, { a: 4, b: 3, c: 6 }, { a: -2, b: 5, c: 4 },
    { a: 3, b: -4, c: -6 }, { a: 1.5, b: 8, c: 4 }, { a: 5, b: 2, c: 8 }
  ];
  function solve(q) { const k = q.a * q.b; return { k, y: k / q.c }; }
  const TOL = 0.01;
  const check = (q, v) => Number.isFinite(v) && Math.abs(v - solve(q).y) < TOL;

  const api = { AREA, f, rect, scale, quadrants, branches, ZOOMS, K3, SCEN, SCEN_KEYS, table, classify, FARE, TRIP, share, exactCents, hours, QUIZ, solve, TOL, check };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
