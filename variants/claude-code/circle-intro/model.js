'use strict';
// Circle lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every length, count and ratio on the page is computed here from coordinates; tests/core.cjs pins the claims.
// Conventions: lengths in cm, angles in degrees measured counter-clockwise from "east", ideal flat circles.
(function (root) {
  const PI = Math.PI;

  // A point on the circle of radius r around the centre O = (0, 0).
  function point(r, deg) { const a = deg * PI / 180; return { x: r * Math.cos(a), y: r * Math.sin(a) }; }
  function dist(p, q) { q = q || { x: 0, y: 0 }; return Math.hypot(p.x - q.x, p.y - q.y); }

  // Step 1: the chord between A (at angle `start`) and B (turned on by phi degrees), measured from the two points.
  function chord(r, phi, start) { start = start || 0; return dist(point(r, start), point(r, start + phi)); }

  // Step 2: a wheel of diameter d rolled through `turns` turns without slipping lays down turns × (its rim length).
  // The rim length is the perimeter of a 4096-gon — the same coordinate measurement step 3 uses.
  function rimLength(d) { return perimeter(polygon(4096, d / 2)); }
  function rolled(d, turns) { return rimLength(d) * turns; }

  // Step 3: regular n-gons. Inner: corners on the circle. Outer: every side touches the circle (corners at R / cos(180°/n)).
  function polygon(n, R, rot) { rot = rot || 90; const v = []; for (let i = 0; i < n; i++) v.push(point(R, rot + 360 * i / n)); return v; }
  function perimeter(v) { let s = 0; for (let i = 0; i < v.length; i++) s += dist(v[i], v[(i + 1) % v.length]); return s; }
  function polyRatios(n) {
    const inner = perimeter(polygon(n, 1)) / 2;                         // perimeter ÷ diameter (diameter = 2)
    const outer = perimeter(polygon(n, 1 / Math.cos(PI / n))) / 2;
    return { inner, outer, gap: outer - inner };
  }
  const N_LIST = [3, 4, 5, 6, 8, 10, 12, 16, 24, 32, 48, 64, 96];

  // Step 4: 1 cm squares on a grid, circle of radius r (whole cm) centred on a grid corner.
  // inside: the whole square is within the circle; touch: some part of the square is inside.
  function gridCells(r) {
    const cells = [];
    let inside = 0, touch = 0;
    for (let i = -r; i < r; i++) for (let j = -r; j < r; j++) {
      const far = Math.max(Math.hypot(i, j), Math.hypot(i + 1, j), Math.hypot(i, j + 1), Math.hypot(i + 1, j + 1));
      const nx = Math.max(i, Math.min(0, i + 1)), ny = Math.max(j, Math.min(0, j + 1));
      const near = Math.hypot(nx, ny);
      const state = far <= r + 1e-12 ? 2 : near < r - 1e-12 ? 1 : 0;
      if (state === 2) inside++;
      if (state >= 1) touch++;
      cells.push({ i, j, state });
    }
    return { cells, inside, touch, partial: touch - inside, lo: inside / (r * r), hi: touch / (r * r) };
  }
  const R_GRID = { min: 2, max: 20 };

  // Step 5: peel n rings off a circle of radius r; each ring straightened is drawn at its OUTER rim length.
  function strips(r, n) {
    const dr = r / n, list = [];
    for (let k = n; k >= 1; k--) list.push({ len: perimeter(polygon(4096, k * dr)), h: dr }); // outermost first
    const area = list.reduce((s, q) => s + q.len * q.h, 0);
    const triangle = 0.5 * rimLength(2 * r) * r;
    return { list, area, triangle, extra: area - triangle };
  }
  const R_ONION = 3;

  // Step 6: from any one of r, d, C, A, the other three.
  // `pi` lets the page repeat the sum with the everyday value 3.14.
  function fromKnown(kind, v, pi) {
    pi = pi || PI;
    const r = kind === 'r' ? v : kind === 'd' ? v / 2 : kind === 'C' ? v / (2 * pi) : Math.sqrt(v / pi);
    return { r, d: 2 * r, C: 2 * pi * r, A: pi * r * r };
  }

  const api = { PI, point, dist, chord, rimLength, rolled, polygon, perimeter, polyRatios, N_LIST, gridCells, R_GRID, strips, R_ONION, fromKnown };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CIRCLE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
