'use strict';
// Similarity & scaling (Claude Code edition) — pure geometry shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Lengths, angles and areas are measured from coordinates (distance, atan2, shoelace); nothing is filled in
// from the k, k², k³ rules the page is about.
(function (root) {

const DEG = Math.PI / 180;
const dist = (P, Q) => Math.hypot(P.x - Q.x, P.y - Q.y);
const sum = a => a.reduce((s, v) => s + v, 0);
function angleAt(V, P1, P2) {
  const ux = P1.x - V.x, uy = P1.y - V.y, vx = P2.x - V.x, vy = P2.y - V.y;
  return Math.abs(Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)) / DEG;
}
const sides = poly => poly.map((P, i) => dist(P, poly[(i + 1) % poly.length]));
const angles = poly => poly.map((V, i) => angleAt(V, poly[(i - 1 + poly.length) % poly.length], poly[(i + 1) % poly.length]));
const perimeter = poly => sum(sides(poly));
const area = poly => Math.abs(sum(poly.map((P, i) => { const Q = poly[(i + 1) % poly.length]; return P.x * Q.y - Q.x * P.y; }))) / 2;

/* ---------- step 0: enlarging from a centre O ---------- */
// An irregular convex quadrilateral ABCD (no two sides equal, no right angles).
const QUAD = [{ x: 1.0, y: 0.45 }, { x: 2.15, y: 0.6 }, { x: 1.85, y: 1.6 }, { x: 1.15, y: 1.3 }];
const dilate = (P, O, k) => ({ x: O.x + k * (P.x - O.x), y: O.y + k * (P.y - O.y) });
const dilatePoly = (poly, O, k) => poly.map(P => dilate(P, O, k));
const ratios = (img, orig) => sides(img).map((s, i) => s / sides(orig)[i]);

/* ---------- step 1: stretching one way only ---------- */
// Stretch about the quadrilateral's corner A: x-distances × kx, y-distances × ky.
const stretch = (poly, kx, ky) => { const A = poly[0]; return poly.map(P => ({ x: A.x + kx * (P.x - A.x), y: A.y + ky * (P.y - A.y) })); };
const spread = a => Math.max(...a) - Math.min(...a);

/* ---------- step 2: area ---------- */
// An L of three unit squares.
const ELL = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }];
const ELL_CELLS = [[0, 0], [1, 0], [0, 1]];
const scale = (poly, k) => poly.map(P => ({ x: k * P.x, y: k * P.y }));

/* ---------- step 3: volume of a k × k × k cube built from unit cubes ---------- */
const cubeCount = k => k * k * k;
const cubeSurface = k => 6 * k * k;
// Count unit cubes by layers, as the page stacks them.
const layers = k => Array.from({ length: k }, () => k * k);

/* ---------- step 4: sighting with a ruler at arm's length ---------- */
const ARM = 0.6;                                         // metres from eye to ruler
// Eye E at the origin; ruler at distance d, building at distance D; the reading h and the height H
// subtend the same angle at E, so the big triangle is the small one enlarged by D / d.
const heightFromSighting = (hCm, D, d = ARM) => (hCm / 100) * D / d;
const sightAngle = (h, d) => Math.atan2(h, d) / DEG;

/* ---------- step 5: cutting a cube into m × m × m pieces ---------- */
const EDGE = 6;                                           // cm
const cut = m => { const e = EDGE / m, n = m * m * m; return { pieces: n, edge: e, eachSurface: 6 * e * e, total: n * 6 * e * e, volume: n * e * e * e }; };

const api = { DEG, dist, angleAt, sides, angles, perimeter, area, QUAD, dilate, dilatePoly, ratios, stretch, spread, ELL, ELL_CELLS, scale,
  cubeCount, cubeSurface, layers, ARM, heightFromSighting, sightAngle, EDGE, cut };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.SIM_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
