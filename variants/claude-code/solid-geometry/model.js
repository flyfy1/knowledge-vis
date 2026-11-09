'use strict';
// Solid geometry (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09. No DOM access here. z is up.
(function (root) {

const V = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (k, a) => [k * a[0], k * a[1], k * a[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => mul(1 / len(a), a);

/* ---------- step 0: solids, counted ---------- */
function prism(n, h = 1, r = 0.62) {
  const vs = [];
  for (let k = 0; k < 2; k++) for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n + Math.PI / 2; vs.push(V(r * Math.cos(a), r * Math.sin(a), k * h - h / 2)); }
  const faces = [Array.from({ length: n }, (_, i) => n - 1 - i), Array.from({ length: n }, (_, i) => n + i)];
  for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n + (i + 1) % n, n + i]);
  return { vs, faces };
}
function pyramid(n, h = 1, r = 0.7) {
  const vs = [];
  for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n + Math.PI / 4; vs.push(V(r * Math.cos(a), r * Math.sin(a), -h / 2)); }
  vs.push(V(0, 0, h / 2));
  const faces = [Array.from({ length: n }, (_, i) => n - 1 - i)];
  for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n]);
  return { vs, faces };
}
const CUBE_VS = [V(0, 0, 0), V(1, 0, 0), V(1, 1, 0), V(0, 1, 0), V(0, 0, 1), V(1, 0, 1), V(1, 1, 1), V(0, 1, 1)];
const CUBE_FACES = [[3, 2, 1, 0], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
const centre = (s, c = [0.5, 0.5, 0.5]) => ({ vs: s.vs.map(p => sub(p, c)), faces: s.faces });
function cutCorner() {
  // cube with the corner (1,1,1) sliced off by x + y + z = 2.5
  const vs = CUBE_VS.slice(0, 6).concat([V(0, 1, 1), V(1, 1, 0.5), V(1, 0.5, 1), V(0.5, 1, 1)]);
  // indices: 0..5 as cube, 6 = (0,1,1), 7 = (1,1,.5), 8 = (1,.5,1), 9 = (.5,1,1)
  const faces = [[3, 2, 1, 0], [4, 5, 8, 9, 6], [0, 1, 5, 4], [1, 2, 7, 8, 5], [2, 3, 6, 9, 7], [3, 0, 4, 6], [7, 9, 8]];
  return centre({ vs, faces });
}
function frame() {
  // a square frame (polyhedral torus): outer 2×2, hole 1×1, height 0.5. 16 quadrilateral faces.
  const o = [[-1, -1], [1, -1], [1, 1], [-1, 1]], i = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]], h = 0.25;
  const vs = [];
  for (const z of [-h, h]) { o.forEach(p => vs.push(V(p[0] * 0.75, p[1] * 0.75, z))); i.forEach(p => vs.push(V(p[0] * 0.75, p[1] * 0.75, z))); }
  // bottom layer: outer 0..3, inner 4..7; top layer: outer 8..11, inner 12..15
  const faces = [];
  for (let k = 0; k < 4; k++) {
    const n = (k + 1) % 4;
    faces.push([k, n, 8 + n, 8 + k]);               // outer wall
    faces.push([4 + n, 4 + k, 12 + k, 12 + n]);     // inner wall
    faces.push([8 + k, 8 + n, 12 + n, 12 + k]);     // top
    faces.push([n, k, 4 + k, 4 + n]);               // bottom
  }
  return { vs, faces };
}
const SOLIDS = {
  cube: () => centre({ vs: CUBE_VS, faces: CUBE_FACES }),
  tri: () => prism(3),
  pent: () => prism(5, 0.9, 0.62),
  pyr: () => pyramid(4),
  oct: () => { const r = 0.8; return { vs: [V(r, 0, 0), V(0, r, 0), V(-r, 0, 0), V(0, -r, 0), V(0, 0, r), V(0, 0, -r)], faces: [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [1, 0, 5], [2, 1, 5], [3, 2, 5], [0, 3, 5]] }; },
  cut: cutCorner,
  frame
};
const SOLID_ORDER = ['cube', 'tri', 'pent', 'pyr', 'oct', 'cut', 'frame'];
function edgesOf(s) {
  const set = new Map();
  s.faces.forEach(f => f.forEach((a, k) => { const b = f[(k + 1) % f.length], key = a < b ? a + ',' + b : b + ',' + a; set.set(key, (set.get(key) || 0) + 1); }));
  return [...set.keys()].map(k => k.split(',').map(Number));
}
// every edge must be shared by exactly two faces (a closed surface)
function closed(s) { const cnt = new Map(); s.faces.forEach(f => f.forEach((a, k) => { const b = f[(k + 1) % f.length], key = a < b ? a + ',' + b : b + ',' + a; cnt.set(key, (cnt.get(key) || 0) + 1); })); return [...cnt.values()].every(c => c === 2); }
function counts(name) { const s = SOLIDS[name](); const E = edgesOf(s).length; return { V: s.vs.length, E, F: s.faces.length, chi: s.vs.length - E + s.faces.length }; }

/* ---------- steps 1–2: plane sections of the unit cube [0,1]³ ---------- */
// two unit vectors spanning the plane with normal n (used to draw the true shape face-on)
function planeBasis(n) { const nn = norm(n), e1 = norm(Math.abs(nn[0]) < 0.9 ? cross(nn, [1, 0, 0]) : cross(nn, [0, 1, 0])); return [e1, cross(nn, e1)]; }
const CUBE_EDGES = edgesOf({ faces: CUBE_FACES });
// plane n·p = d; returns ordered polygon (3D points) or [] when the plane misses or only touches
function section(n, d) {
  const pts = [];
  const push = p => { if (!pts.some(q => len(sub(p, q)) < 1e-9)) pts.push(p); };
  CUBE_EDGES.forEach(([a, b]) => {
    const A = CUBE_VS[a], B = CUBE_VS[b], fa = dot(n, A) - d, fb = dot(n, B) - d;
    if (Math.abs(fa) < 1e-12) push(A);
    if (Math.abs(fb) < 1e-12) push(B);
    if (fa * fb < 0) push(add(A, mul(fa / (fa - fb), sub(B, A))));
  });
  if (pts.length < 3) return [];
  const c = mul(1 / pts.length, pts.reduce(add, [0, 0, 0])), [e1, e2] = planeBasis(n);
  return pts.map(p => ({ p, a: Math.atan2(dot(sub(p, c), e2), dot(sub(p, c), e1)) })).sort((x, y) => x.a - y.a).map(q => q.p);
}
function polyArea(P) { let s = [0, 0, 0]; for (let i = 0; i < P.length; i++) s = add(s, cross(P[i], P[(i + 1) % P.length])); return len(s) / 2; }
const sides = P => P.map((p, i) => len(sub(P[(i + 1) % P.length], p)));
function angles(P) { return P.map((p, i) => { const a = sub(P[(i + P.length - 1) % P.length], p), b = sub(P[(i + 1) % P.length], p); return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (len(a) * len(b))))) * 180 / Math.PI; }); }
// shape name code
function kind(P) {
  const n = P.length, s = sides(P), ang = angles(P), eq = (a, b) => Math.abs(a - b) < 1e-6;
  const allS = s.every(v => eq(v, s[0])), allA = ang.every(v => eq(v, ang[0]));
  if (n === 3) return allS ? 'triEq' : (eq(s[0], s[1]) || eq(s[1], s[2]) || eq(s[0], s[2])) ? 'triIso' : 'tri';
  if (n === 4) {
    const right = ang.every(v => eq(v, 90));
    if (right) return allS ? 'square' : 'rect';
    if (allS) return 'rhombus';
    const par = (i, j) => len(cross(sub(P[(i + 1) % 4], P[i]), sub(P[(j + 1) % 4], P[j]))) < 1e-9;
    if (par(0, 2) && par(1, 3)) return 'para';
    if (par(0, 2) || par(1, 3)) return 'trap';
    return 'quad';
  }
  if (n === 5) return 'pent';
  if (n === 6) return allS && allA ? 'hexReg' : 'hex';
  return 'other';
}
const PRESETS = {
  face: { n: [0, 0, 1], d: p => p },
  edge: { n: [1, 0, 1], d: p => 2 * p },
  diag: { n: [1, 1, 1], d: p => 3 * p }
};
function presetSection(name, p) { const pr = PRESETS[name], P = section(pr.n, pr.d(p)); return { P, n: P.length, area: polyArea(P), kind: P.length ? kind(P) : null }; }
// free cut: tilt θ from the z-axis, azimuth φ from x; offset p ∈ (0,1) between the lowest and highest vertex
function freeNormal(th, ph) { const t = th * Math.PI / 180, f = ph * Math.PI / 180; return [Math.sin(t) * Math.cos(f), Math.sin(t) * Math.sin(f), Math.cos(t)]; }
function freeSection(th, ph, p) {
  const n = freeNormal(th, ph), ds = CUBE_VS.map(v => dot(n, v)), lo = Math.min(...ds), hi = Math.max(...ds);
  const P = section(n, lo + p * (hi - lo));
  return { P, n: P.length, area: polyArea(P), kind: P.length ? kind(P) : null, normal: n };
}

/* ---------- step 3: the painted cube ---------- */
function painted(n) {
  if (n === 1) return [0, 0, 0, 0, 0, 0, 1];
  const m = n - 2;
  return [m * m * m, 6 * m * m, 12 * m, 8, 0, 0, 0]; // index = number of painted faces
}
const paintCount = (n, i, j, k) => [i, j, k].reduce((s, c) => s + (c === 0 || c === n - 1 ? 1 : 0), 0);

/* ---------- step 4: three square pyramids make a cube ---------- */
// apex at (1,1,1); bases are the faces x = 0, y = 0, z = 0 of the unit cube
const PYRS = [0, 1, 2].map(ax => {
  const base = CUBE_VS.map((v, i) => i).filter(i => CUBE_VS[i][ax] === 0);
  return { ax, base, apex: 6 };
});
function tetVol(a, b, c, d) { return Math.abs(dot(sub(b, a), cross(sub(c, a), sub(d, a)))) / 6; }
function pyrVolume(P) {
  // split the square base into two triangles; each with the apex is a tetrahedron
  const pts = P.base.map(i => CUBE_VS[i]), A = CUBE_VS[P.apex];
  // order base points around the square
  const c = mul(0.25, pts.reduce(add, [0, 0, 0])), axes = [0, 1, 2].filter(k => k !== P.ax);
  pts.sort((p, q) => Math.atan2(p[axes[1]] - c[axes[1]], p[axes[0]] - c[axes[0]]) - Math.atan2(q[axes[1]] - c[axes[1]], q[axes[0]] - c[axes[0]]));
  return tetVol(pts[0], pts[1], pts[2], A) + tetVol(pts[0], pts[2], pts[3], A);
}
// a point of the cube lies in pyramid k when coordinate ax is the smallest (ties are boundaries)
const whichPyr = p => (p[0] <= p[1] && p[0] <= p[2] ? 0 : p[1] <= p[2] ? 1 : 2);

/* ---------- step 5: slabs under a (possibly slanted) pyramid ---------- */
// base 1×1 at z = 0, apex above (0.5 + s, 0.5) at height 1; slab k spans [k/n, (k+1)/n] with the cross-section of its bottom
function slabs(n, s) {
  const out = [];
  for (let k = 0; k < n; k++) { const z = k / n, side = 1 - z, cx = 0.5 + s * z; out.push({ z0: z, z1: (k + 1) / n, side, cx, cy: 0.5, vol: side * side / n }); }
  return out;
}
const slabSum = (n, s) => slabs(n, s).reduce((a, q) => a + q.vol, 0);
const slabExact = n => (n + 1) * (2 * n + 1) / (6 * n * n);

/* ---------- step 6: nets that fold (or not) into a cube ---------- */
// 15 hexominoes in quiz order: the 11 cube nets (n1..n11) and 4 that fail (x1..x4)
const NETS = [
  { id: 'n1', cells: [[1,  0],  [0,  1],  [1,  1],  [2,  1],  [3,  1],  [1,  2]] },
  { id: 'x1', cells: [[0,  0],  [1,  0],  [2,  0],  [3,  0],  [4,  0],  [5,  0]] },
  { id: 'n3', cells: [[0,  0],  [0,  1],  [1,  1],  [1,  2],  [2,  1],  [3,  1]] },
  { id: 'n7', cells: [[0,  0],  [0,  1],  [0,  2],  [1,  1],  [2,  1],  [3,  1]] },
  { id: 'x2', cells: [[0,  0],  [1,  0],  [2,  0],  [0,  1],  [1,  1],  [2,  1]] },
  { id: 'n4', cells: [[0,  0],  [0,  1],  [1,  1],  [2,  1],  [2,  2],  [3,  1]] },
  { id: 'n10', cells: [[0,  0],  [1,  0],  [2,  0],  [2,  1],  [3,  1],  [4,  1]] },
  { id: 'x3', cells: [[0,  0],  [1,  0],  [2,  0],  [3,  0],  [4,  0],  [1,  1]] },
  { id: 'n2', cells: [[1,  0],  [0,  1],  [1,  1],  [2,  1],  [3,  1],  [2,  2]] },
  { id: 'n5', cells: [[0,  0],  [1,  0],  [1,  1],  [2,  1],  [3,  1],  [1,  2]] },
  { id: 'x4', cells: [[0,  0],  [1,  0],  [0,  1],  [1,  1],  [2,  1],  [3,  1]] },
  { id: 'n6', cells: [[0,  0],  [1,  0],  [1,  1],  [2,  1],  [3,  1],  [2,  2]] },
  { id: 'n8', cells: [[0,  0],  [0,  1],  [1,  1],  [2,  1],  [3,  1],  [3,  2]] },
  { id: 'n9', cells: [[0,  0],  [1,  0],  [1,  1],  [2,  1],  [3,  1],  [3,  2]] },
  { id: 'n11', cells: [[0,  0],  [1,  0],  [1,  1],  [2,  1],  [2,  2],  [3,  2]] }
];
// spanning tree by BFS from cell 0; returns [{cell, parent}]
function tree(cells) {
  const key = c => c[0] + ',' + c[1], idx = new Map(cells.map((c, i) => [key(c), i])), seen = new Set([0]), order = [{ i: 0, parent: -1 }], q = [0];
  while (q.length) {
    const i = q.shift(), [x, y] = cells[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const j = idx.get(key([x + dx, y + dy]));
      if (j !== undefined && !seen.has(j)) { seen.add(j); q.push(j); order.push({ i: j, parent: i, dx, dy }); }
    }
  }
  return order;
}
function rotAbout(p, a, axis, ang) {
  // Rodrigues rotation of point p about the line through a with unit direction axis
  const v = sub(p, a), c = Math.cos(ang), s = Math.sin(ang);
  return add(a, add(add(mul(c, v), mul(s, cross(axis, v))), mul(dot(axis, v) * (1 - c), axis)));
}
// fold every hinge by f·90° toward the parent's normal; returns each cell's four 3D corners and centre
function fold(cells, f) {
  const order = tree(cells), F = new Array(cells.length);
  F[0] = { O: [0, 0, 0], U: [1, 0, 0], W: [0, 1, 0] };
  const map = (fr, x, y) => add(fr.O, add(mul(x, fr.U), mul(y, fr.W)));
  const ang = f * Math.PI / 2;
  for (const o of order.slice(1)) {
    const P = F[o.parent], [x, y] = cells[o.parent];
    // hinge edge in grid coordinates
    let h0, h1;
    if (o.dx === 1) { h0 = [x + 1, y]; h1 = [x + 1, y + 1]; } else if (o.dx === -1) { h0 = [x, y]; h1 = [x, y + 1]; }
    else if (o.dy === 1) { h0 = [x, y + 1]; h1 = [x + 1, y + 1]; } else { h0 = [x, y]; h1 = [x + 1, y]; }
    const A = map(P, ...h0), B = map(P, ...h1), axis = norm(sub(B, A)), N = cross(P.U, P.W);
    const cc = map(P, cells[o.i][0] + 0.5, cells[o.i][1] + 0.5);
    let sgn = 1;
    if (ang > 0) { const test = rotAbout(cc, A, axis, Math.min(ang, 0.3)); if (dot(sub(test, cc), N) < 0) sgn = -1; }
    const R = p => rotAbout(p, A, axis, sgn * ang);
    const O2 = R(P.O), U2 = sub(R(add(P.O, P.U)), O2), W2 = sub(R(add(P.O, P.W)), O2);
    F[o.i] = { O: O2, U: U2, W: W2 };
  }
  return cells.map(([x, y], i) => {
    const fr = F[i], corners = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]].map(([a, b]) => map(fr, a, b));
    return { corners, centre: map(fr, x + 0.5, y + 0.5) };
  });
}
// fully folded: is every face on a different face of the cube? returns {ok, clash:[i,j]|null}
function foldCheck(cells) {
  const faces = fold(cells, 1);
  for (let i = 0; i < faces.length; i++) for (let j = i + 1; j < faces.length; j++) if (len(sub(faces[i].centre, faces[j].centre)) < 1e-6) return { ok: false, clash: [i, j] };
  return { ok: faces.length === 6, clash: null };
}

const api = { V, add, sub, mul, dot, cross, len, norm, SOLIDS, SOLID_ORDER, edgesOf, closed, counts, CUBE_VS, CUBE_FACES, CUBE_EDGES, planeBasis, section, polyArea, sides, angles, kind, PRESETS, presetSection, freeNormal, freeSection, painted, paintCount, PYRS, pyrVolume, tetVol, whichPyr, slabs, slabSum, slabExact, NETS, tree, fold, foldCheck };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.SOLID_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
