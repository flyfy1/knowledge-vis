'use strict';
// Space diagonal lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Lengths, the 28 corner-to-corner segments, the three routes and the fit test are computed here;
// the page only draws and formats them. tests/core.cjs pins every claim.
(function (root) {
  const DEFAULT = { a: 4, b: 3, c: 12 };          // width, depth, height (one unit each)
  const RANGE = { min: 1, max: 12, step: 1 };

  // Corners are numbered by bits: x = bit 0 (width a), y = bit 1 (depth b), z = bit 2 (height c).
  // Corner 0 is the bottom-front-left corner; corner 7 is the opposite one.
  function corners(a, b, c) {
    const out = [];
    for (let i = 0; i < 8; i++) out.push([(i & 1) ? a : 0, (i & 2) ? b : 0, (i & 4) ? c : 0]);
    return out;
  }
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const bitsDiffer = (i, j) => ((i ^ j) & 1) + (((i ^ j) >> 1) & 1) + (((i ^ j) >> 2) & 1);

  // All 28 segments between two corners, grouped by how many directions they cross:
  // 1 → an edge, 2 → a face diagonal, 3 → a space diagonal (through the inside of the box).
  function segments(a, b, c) {
    const P = corners(a, b, c), out = [];
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const k = bitsDiffer(i, j);
      out.push({ i, j, kind: k === 1 ? 'edge' : k === 2 ? 'face' : 'space', len: dist(P[i], P[j]) });
    }
    return out;
  }
  function summary(a, b, c) {
    const s = segments(a, b, c), by = kind => s.filter(q => q.kind === kind);
    const max = arr => Math.max(...arr.map(q => q.len));
    return {
      count: { edge: by('edge').length, face: by('face').length, space: by('space').length },
      longest: { edge: max(by('edge')), face: max(by('face')), space: max(by('space')) },
      overall: max(s)
    };
  }

  // Pythagoras twice. e² is kept as the exact sum a² + b² (never a rounded e squared again).
  function diagonal(a, b, c) {
    const e2 = a * a + b * b, d2 = e2 + c * c;
    return { a2: a * a, b2: b * b, c2: c * c, e2, e: Math.sqrt(e2), d2, d: Math.sqrt(d2) };
  }

  // Three routes from corner 0 to corner 7: first a face diagonal, then the one edge left over.
  // base: across the floor (a, b) then up c; front: across the front (a, c) then back b;
  // side: across the left side (b, c) then across a.
  const ROUTES = {
    base: { face: [0, 3], edge: [3, 7], legs: ['a', 'b'], last: 'c' },
    front: { face: [0, 5], edge: [5, 7], legs: ['a', 'c'], last: 'b' },
    side: { face: [0, 6], edge: [6, 7], legs: ['b', 'c'], last: 'a' }
  };
  function route(name, a, b, c) {
    const v = { a, b, c }, R = ROUTES[name];
    const p = v[R.legs[0]], q = v[R.legs[1]], r = v[R.last];
    const f2 = p * p + q * q, d2 = f2 + r * r;
    return { name, p, q, r, f2, f: Math.sqrt(f2), d2, d: Math.sqrt(d2), legs: R.legs, last: R.last };
  }

  // Step 5: a thin stick of length L fits (corner to corner) when L ≤ d. Thickness is ignored.
  const CASE = { a: 50, b: 40, c: 30, L: [40, 90] };
  function fits(L, a, b, c) { const d = diagonal(a, b, c).d; return { d, fits: L <= d + 1e-12, spare: d - L }; }

  // Quiz: an integer box whose diagonal is a whole number.
  const QUIZ = { a: 1, b: 2, c: 2, options: ['3', '5', '√5'] };
  QUIZ.answer = String(diagonal(QUIZ.a, QUIZ.b, QUIZ.c).d);

  // 3-D view: rotate by yaw (about the vertical axis) and pitch (tilting the top towards the viewer),
  // then project with a gentle perspective. Returns screen offsets (y down) and depth (larger = nearer).
  function project(p, yaw, pitch, persp) {
    const [x, y, z] = p;
    const x1 = x * Math.cos(yaw) - y * Math.sin(yaw), y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
    // the viewer looks along +y1, tilted down by pitch: depth grows towards the viewer, up is screen-up
    const depth = -y1 * Math.cos(pitch) + z * Math.sin(pitch);
    const up = y1 * Math.sin(pitch) + z * Math.cos(pitch);
    const k = persp ? persp / (persp - depth) : 1;
    return { x: x1 * k, y: -up * k, depth };
  }

  const api = { DEFAULT, RANGE, corners, segments, summary, diagonal, ROUTES, route, CASE, fits, QUIZ, project, bitsDiffer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SD_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
