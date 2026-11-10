'use strict';
// Inscribed angles (Claude Code edition) — pure geometry shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every angle on the page is measured from point coordinates (atan2 of cross and dot products);
// nothing is obtained by halving the central angle.
(function (root) {

const R = 1;                       // unit circle, centre O at the origin, y pointing up
const DEG = Math.PI / 180;
const O = { x: 0, y: 0 };
const onCircle = deg => ({ x: R * Math.cos(deg * DEG), y: R * Math.sin(deg * DEG) });
// Chord AB sits symmetrically below O: A at 270° − c/2, B at 270° + c/2, so the central angle AOB is c (c ≤ 180).
const chord = c => ({ A: onCircle(270 - c / 2), B: onCircle(270 + c / 2) });
// P is placed by s, its angle from the top of the circle (s = 0 is straight above O, positive = anticlockwise).
const pointAt = s => onCircle(90 + s);
// |s| below this limit puts P on the major arc (the side away from the chord); above it, on the minor arc.
const majorLimit = c => 180 - c / 2;
const norm = s => { let v = ((s + 180) % 360 + 360) % 360 - 180; if (v === -180) v = 180; return v; };   // into (−180, 180]
const onMajor = (c, s) => Math.abs(norm(s)) < majorLimit(c);
const dist = (P, Q) => Math.hypot(P.x - Q.x, P.y - Q.y);

// Angle at vertex V between rays V→P1 and V→P2, in degrees, 0..180.
function angleAt(V, P1, P2) {
  const ux = P1.x - V.x, uy = P1.y - V.y, vx = P2.x - V.x, vy = P2.y - V.y;
  return Math.abs(Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)) / DEG;
}
// P must stay at least this far (as an arc angle, degrees) from A and B; closer, the two chords degenerate.
const MIN_GAP = 1;
const gapToChordEnds = (c, s) => Math.abs(Math.abs(norm(s)) - majorLimit(c));
function inscribed(c, s) {
  if (gapToChordEnds(c, s) < MIN_GAP - 1e-9) return null;
  const { A, B } = chord(c), P = pointAt(s);
  return angleAt(P, A, B);
}
function central(c) { const { A, B } = chord(c); return angleAt(O, A, B); }

// Step 2: the proof. D is the far end of the diameter through P.
function proof(c, s) {
  const { A, B } = chord(c), P = pointAt(s), D = { x: -P.x, y: -P.y };
  const baseA = angleAt(A, O, P), baseP_A = angleAt(P, O, A);   // the two base angles of isosceles OAP
  const baseB = angleAt(B, O, P), baseP_B = angleAt(P, O, B);   // ... and of OBP
  const AOD = angleAt(O, A, D), BOD = angleAt(O, B, D);         // exterior angles at O
  const APB = angleAt(P, A, B), AOB = angleAt(O, A, B);
  // O lies inside angle APB exactly when the diameter PD separates A from B
  const side = Q => (D.x - P.x) * (Q.y - P.y) - (D.y - P.y) * (Q.x - P.x);
  const inside = side(A) * side(B) < 0;
  return { A, B, P, D, baseA, baseP_A, baseB, baseP_B, AOD, BOD, APB, AOB, inside, OA: dist(O, A), OP: dist(O, P), OB: dist(O, B) };
}

// Step 3: chord at distance d below O (d = 0 is a diameter); same as central angle c = 2·acos(d).
const cFromOffset = d => 2 * Math.acos(d) / DEG;

// Step 4: P on the major arc, Q on the minor arc. u, v ∈ [0, 1] run along each arc, staying MIN_GAP from A and B.
function arcPoint(c, which, u) {
  const lim = majorLimit(c);
  if (which === 'major') return -(lim - MIN_GAP) + u * 2 * (lim - MIN_GAP);
  // minor arc: s from lim + gap to 360 − lim − gap, measured anticlockwise from the top
  return lim + MIN_GAP + u * (360 - 2 * lim - 2 * MIN_GAP);
}
function quad(c, u, v) {
  const sP = arcPoint(c, 'major', u), sQ = arcPoint(c, 'minor', v);
  const P = inscribed(c, sP), Q = inscribed(c, sQ);
  return { sP, sQ, P, Q, sum: P + Q, reflex: 360 - central(c) };
}

// Step 5: a set square with its corner V on the circle. Its legs make ±45° with the inward normal, tilted by tau.
function setSquare(phi, tau) {
  const V = onCircle(phi), inward = phi + 180 + tau;
  const hit = dirDeg => {          // second intersection of the ray from V with the circle
    const u = { x: Math.cos(dirDeg * DEG), y: Math.sin(dirDeg * DEG) };
    const tHit = -2 * (V.x * u.x + V.y * u.y);
    return { x: V.x + tHit * u.x, y: V.y + tHit * u.y };
  };
  const X = hit(inward - 45), Y = hit(inward + 45);
  // distance from O to the line XY, and the length of XY
  const len = dist(X, Y), off = Math.abs((Y.x - X.x) * (X.y - O.y) - (X.x - O.x) * (Y.y - X.y)) / len;
  return { V, X, Y, len, off, corner: angleAt(V, X, Y) };
}
// Intersection of two lines (each given by two points); null when nearly parallel.
function intersect(L1, L2) {
  const d1x = L1.Y.x - L1.X.x, d1y = L1.Y.y - L1.X.y, d2x = L2.Y.x - L2.X.x, d2y = L2.Y.y - L2.X.y;
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-6 * Math.hypot(d1x, d1y) * Math.hypot(d2x, d2y) * 50) return null;
  const tt = ((L2.X.x - L1.X.x) * d2y - (L2.X.y - L1.X.y) * d2x) / den;
  return { x: L1.X.x + tt * d1x, y: L1.X.y + tt * d1y };
}

// Step 6 quiz: answers measured on actual figures, never typed in.
const QUIZ = {
  q1: inscribed(80, 0),                           // central angle 80°, P on the major arc → 40
  q2: (() => {                                    // major-arc angle 65° → its chord has central angle 130°; minor-arc angle
    const c = 130; return inscribed(c, 180);      // P at the bottom of the minor arc → 115
  })(),
  q2check: inscribed(130, 0),                     // the 65° in the question really is the major-arc angle
  q3: [-80, -45, 0, 30, 70].map(s => inscribed(180, s))   // AB a diameter: 90° wherever P is
};
const QUIZ_OPTIONS = { q1: { a: 80, b: 40, c: 160 }, q2: { a: 65, b: 130, c: 115 } };
function quizKey(q) {
  if (q === 'q3') return QUIZ.q3.every(v => Math.abs(v - 90) < 1e-9) ? 'a' : null;
  const v = QUIZ[q], o = QUIZ_OPTIONS[q];
  return Object.keys(o).find(k => Math.abs(o[k] - v) < 1e-9) || null;
}

const api = { R, O, norm, onCircle, chord, pointAt, majorLimit, onMajor, dist, angleAt, MIN_GAP, inscribed, central, proof, cFromOffset, arcPoint, quad, setSquare, intersect, QUIZ, QUIZ_OPTIONS, quizKey };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.CIRCLE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
