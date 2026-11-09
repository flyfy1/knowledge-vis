'use strict';
// 2D linear maps model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A matrix {a, b, c, d} means [[a, b], [c, d]]: its first column (a, c) is where e₁ = (1, 0) lands,
// its second column (b, d) is where e₂ = (0, 1) lands. Every arrow, grid, area and readout on the page
// is computed here; tests/core.cjs pins the claims.
(function (root) {
  const I = { a: 1, b: 0, c: 0, d: 1 };
  const M = (a, b, c, d) => ({ a, b, c, d });
  const apply = (A, [x, y]) => [A.a * x + A.b * y, A.c * x + A.d * y];
  const det = A => A.a * A.d - A.b * A.c;
  // A·B = "do B first, then A".
  const mul = (A, B) => M(A.a * B.a + A.b * B.c, A.a * B.b + A.b * B.d, A.c * B.a + A.d * B.c, A.c * B.b + A.d * B.d);
  const EPS = 1e-12;
  function inverse(A) {
    const D = det(A);
    if (Math.abs(D) < EPS) return null; // singular: no inverse exists
    return M(A.d / D, -A.b / D, -A.c / D, A.a / D);
  }
  const lerp = (A, B, s) => M(A.a + (B.a - A.a) * s, A.b + (B.b - A.b) * s, A.c + (B.c - A.c) * s, A.d + (B.d - A.d) * s);
  const rot = deg => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return M(c, -s, s, c); };
  const shearX = k => M(1, k, 0, 1);
  const same = (A, B, tol = 1e-9) => ['a', 'b', 'c', 'd'].every(k => Math.abs(A[k] - B[k]) <= tol);

  // Signed area of a polygon (counter-clockwise positive), shoelace formula.
  function area(pts) { let s = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; s += x0 * y1 - x1 * y0; } return s / 2; }
  // An asymmetric "F" outline (area 0.81, counter-clockwise) — a mirror image is easy to spot.
  const F_SHAPE = [[0, 0], [0.3, 0], [0.3, 0.6], [0.8, 0.6], [0.8, 0.9], [0.3, 0.9], [0.3, 1.2], [1, 1.2], [1, 1.5], [0, 1.5]];
  const UNIT_SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // Largest and smallest stretch of A (singular values), from the 2×2 closed form.
  function stretches(A) {
    const p = A.a * A.a + A.b * A.b + A.c * A.c + A.d * A.d, q = Math.abs(det(A));
    const r = Math.sqrt(Math.max(0, p * p / 4 - q * q));
    return { max: Math.sqrt(p / 2 + r), min: Math.sqrt(Math.max(0, p / 2 - r)) };
  }
  // A direction that A flattens to the origin (only meaningful when det = 0, A ≠ 0).
  function nullDir(A) {
    const v = Math.hypot(A.a, A.b) > EPS ? [-A.b, A.a] : [-A.d, A.c];
    const n = Math.hypot(v[0], v[1]); return n > EPS ? [v[0] / n, v[1] / n] : [1, 0];
  }

  // Step 0 presets and default.
  const DEFAULT = M(1.5, -0.5, 0.5, 1);
  const PRESETS = {
    identity: M(1, 0, 0, 1), stretch: M(2, 0, 0, 0.5), shear: M(1, 1, 0, 1),
    rotate: rot(45), mirror: M(-1, 0, 0, 1), flatten: M(1, 2, 0.5, 1)
  };

  // Step 2: three candidate maps of the plane.
  const S2 = { A: M(1.2, 0.5, -0.3, 1), shift: [0.8, 0.5], u: [1, 0.5], v: [0.5, 1] };
  const MAPS = {
    linear: p => apply(S2.A, p),
    shifted: p => { const q = apply(S2.A, p); return [q[0] + S2.shift[0], q[1] + S2.shift[1]]; },
    bent: p => { const q = apply(S2.A, p); return [q[0] + 0.25 * q[1] * q[1], q[1] + 0.2 * q[0] * q[0]]; }
  };
  // How far a map is from the two linearity rules, measured at u, v and the scale λ.
  function linearityGaps(T, u, v, lam) {
    const add = (p, q) => [p[0] + q[0], p[1] + q[1]], sc = (k, p) => [k * p[0], k * p[1]], dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    return { sum: dist(T(add(u, v)), add(T(u), T(v))), scale: dist(T(sc(lam, u)), sc(lam, T(u))), origin: Math.hypot(...T([0, 0])) };
  }

  // Step 3: e₁ goes to a fixed arrow at 30°, e₂'s image swings round at angle θ.
  const S3 = { r1: 1.4, phi: 30, r2: 1.2 };
  const step3Matrix = theta => {
    const p = S3.phi * Math.PI / 180, q = theta * Math.PI / 180;
    return M(S3.r1 * Math.cos(p), S3.r2 * Math.cos(q), S3.r1 * Math.sin(p), S3.r2 * Math.sin(q));
  };
  // Step 4: a family that flattens at s = 2.
  const step4Matrix = s => M(1, s, 0.5, 1);
  const S4 = { p: [1, 0.6], err: 0.2 };

  const api = { I, M, apply, det, mul, inverse, lerp, rot, shearX, same, area, F_SHAPE, UNIT_SQUARE, stretches, nullDir, DEFAULT, PRESETS, S2, MAPS, linearityGaps, S3, step3Matrix, step4Matrix, S4, EPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
