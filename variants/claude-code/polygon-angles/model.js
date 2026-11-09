'use strict';
// Polygon angle sums (Claude Code edition) — pure geometry shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Coordinates are mathematical (y up). Every angle on the page is measured from vertex coordinates
// with atan2 of cross and dot products; no angle is filled in from a formula.
(function (root) {

const DEG = Math.PI / 180;
const sub = (P, Q) => ({ x: P.x - Q.x, y: P.y - Q.y });
const dist = (P, Q) => Math.hypot(P.x - Q.x, P.y - Q.y);
const dirDeg = (P, Q) => Math.atan2(Q.y - P.y, Q.x - P.x) / DEG;          // direction of P→Q, degrees
const wrap180 = d => { let v = ((d + 180) % 360 + 360) % 360 - 180; if (v === -180) v = 180; return v; };   // (−180, 180]

// Unsigned angle at V between rays V→P1 and V→P2 (0..180).
function angleAt(V, P1, P2) {
  const u = sub(P1, V), v = sub(P2, V);
  return Math.abs(Math.atan2(u.x * v.y - u.y * v.x, u.x * v.x + u.y * v.y)) / DEG;
}
// Signed turn at V when walking P→V→N: positive = turn left (anticlockwise), negative = turn right.
function turnAt(P, V, N) {
  const u = sub(V, P), v = sub(N, V);
  return Math.atan2(u.x * v.y - u.y * v.x, u.x * v.x + u.y * v.y) / DEG;
}
const signedArea = poly => poly.reduce((s, P, i) => { const Q = poly[(i + 1) % poly.length]; return s + P.x * Q.y - Q.x * P.y; }, 0) / 2;
const ccw = poly => (signedArea(poly) < 0 ? poly.slice().reverse() : poly.slice());

// Turns at every vertex of a closed walk v0→v1→…→v(n−1)→v0; turns[i] is the turn made at vertex i.
function turns(poly) {
  const n = poly.length;
  return poly.map((V, i) => turnAt(poly[(i - 1 + n) % n], V, poly[(i + 1) % n]));
}
// Interior angles of a simple polygon given anticlockwise: interior = 180° − turn (a right turn gives a reflex angle).
function interiorAngles(poly) { return turns(poly).map(t => 180 - t); }
const sum = a => a.reduce((s, v) => s + v, 0);

function segmentsCross(A, B, C, D) {
  const o = (P, Q, R) => Math.sign((Q.x - P.x) * (R.y - P.y) - (Q.y - P.y) * (R.x - P.x));
  return o(A, B, C) * o(A, B, D) < 0 && o(C, D, A) * o(C, D, B) < 0;
}
// Simple = no two non-neighbouring edges cross.
function isSimple(poly) {
  const n = poly.length;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (j === i + 1 || (i === 0 && j === n - 1)) continue;
    if (segmentsCross(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return false;
  }
  return true;
}
const isConvex = poly => turns(poly).every(t => t > 1e-9);

// Seeded random numbers (mulberry32) so every "new shape" can be reproduced in the tests.
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const regular = (n, R = 1, rot = 90) => Array.from({ length: n }, (_, k) => ({ x: R * Math.cos((rot + 360 * k / n) * DEG), y: R * Math.sin((rot + 360 * k / n) * DEG) }));
// A convex n-gon: points on the unit circle at jittered angles (jitter < half the spacing keeps them in order).
// Seed 0 gives the regular polygon.
function shape(n, seed) {
  if (!seed) return regular(n);
  const r = rng(seed * 7919 + n), gap = 360 / n;
  return Array.from({ length: n }, (_, k) => {
    const a = 90 + k * gap + (r() - 0.5) * gap * 0.7;
    return { x: Math.cos(a * DEG), y: Math.sin(a * DEG) };
  });
}
const centroid = poly => ({ x: sum(poly.map(P => P.x)) / poly.length, y: sum(poly.map(P => P.y)) / poly.length });

/* ---------- step 0/1: the triangle ---------- */
const BASE = 6;                                        // A = (0, 0), B = (6, 0); C is set by two sliders
const triangle = (cx, cy) => [{ x: 0, y: 0 }, { x: BASE, y: 0 }, { x: cx, y: cy }];
function triAngles(T) { const [A, B, C] = T; return { a: angleAt(A, B, C), b: angleAt(B, C, A), c: angleAt(C, A, B) }; }
// Tearing plan: each corner wedge starts at its vertex (spanning from the direction of the next vertex,
// anticlockwise, by its angle) and ends side by side above one point of a straight line, in the order
// α (left), γ (middle), β (right) — the same order the parallel-line proof finds them at C.
function tearPlan(T) {
  const P = ccw(T), [A, B, C] = P, ang = triAngles(P);
  const wedge = (V, N, span, targetStart) => ({ V, span, start: dirDeg(V, N), targetStart });
  return {
    a: wedge(A, B, ang.a, 180 - ang.a),
    c: wedge(C, A, ang.c, ang.b),
    b: wedge(B, C, ang.b, 0),
    ang
  };
}
// The parallel line through C: angles between it and CA (left) and CB (right).
function parallelAngles(T) {
  const [A, B, C] = T;
  return { left: angleAt(C, { x: C.x - 1, y: C.y }, A), right: angleAt(C, { x: C.x + 1, y: C.y }, B), mid: angleAt(C, A, B) };
}

/* ---------- step 2: cutting into triangles ---------- */
const fanTriangles = n => Array.from({ length: Math.max(0, n - 2) }, (_, i) => [0, i + 1, i + 2]);
const diagonalsFromOneVertex = n => Math.max(0, n - 3);
// Angles of the n triangles fanned from an inside point O, and the full turn they leave around O.
function centreCut(poly) {
  const O = centroid(poly), n = poly.length;
  const around = poly.map((P, i) => angleAt(O, P, poly[(i + 1) % n]));
  return { O, triangles: n, around: sum(around) };
}
const formulaSum = n => (n - 2) * 180;

/* ---------- step 4: a dent and a star ---------- */
// Regular pentagon with vertex 0 pushed towards (and past) the centre: p = 0 is the regular pentagon,
// p = 1 puts vertex 0 at the centre. Above P_STRAIGHT the angle at vertex 0 is reflex.
const dented = p => { const P = regular(5); P[0] = { x: P[0].x * (1 - p), y: P[0].y * (1 - p) }; return P; };
const P_STRAIGHT = 1 - Math.sin(18 * DEG);             // vertex 0 on the chord v1v4
const star = () => { const P = regular(5); return [0, 2, 4, 1, 3].map(i => P[i]); };
const starTips = S => S.map((V, i) => angleAt(V, S[(i + 4) % 5], S[(i + 1) % 5]));

/* ---------- step 5: regular polygons around one point ---------- */
const regularInterior = n => (n - 2) * 180 / n;
function aroundPoint(n) {
  const a = regularInterior(n), q = 360 / a, fit = Math.floor(q + 1e-9), gap = 360 - fit * a;
  return { a, q, fit, gap, exact: Math.abs(gap) < 1e-9 };
}
const sidesFromInterior = a => 360 / (180 - a);

const api = { DEG, dist, dirDeg, wrap180, angleAt, turnAt, signedArea, ccw, turns, interiorAngles, sum, isSimple, isConvex, rng, regular, shape, centroid,
  BASE, triangle, triAngles, tearPlan, parallelAngles, fanTriangles, diagonalsFromOneVertex, centreCut, formulaSum,
  dented, P_STRAIGHT, star, starTips, regularInterior, aroundPoint, sidesFromInterior };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.POLY_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
