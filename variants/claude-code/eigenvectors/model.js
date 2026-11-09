'use strict';
// Eigenvector lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Matrices are 2×2 real, written A = [[a, b], [c, d]] (rows); vectors are [x, y]. IEEE doubles throughout.
(function (root) {
  const DEG = Math.PI / 180;
  const apply = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
  const unit = th => [Math.cos(th * DEG), Math.sin(th * DEG)];
  const trace = A => A[0][0] + A[1][1];
  const det = A => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const fold180 = a => ((a % 180) + 180) % 180;       // line direction in [0, 180)
  const lineAngle = v => fold180(Math.atan2(v[1], v[0]) / DEG);

  // Signed angle (degrees) from the line of v to Av, folded into (−90, 90]: 0 means Av lies on v's line
  // (pointing either way). null when Av = 0 (no direction to compare).
  function turn(A, v) {
    const w = apply(A, v); if (w[0] === 0 && w[1] === 0) return null;
    let a = (Math.atan2(w[1], w[0]) - Math.atan2(v[1], v[0])) / DEG;
    a = ((a % 180) + 180) % 180; if (a > 90) a -= 180;
    return a;
  }
  // Projection coefficient p = (v·Av)/(v·v) and the part of Av off v's line.
  function split(A, v) {
    const w = apply(A, v), p = (v[0] * w[0] + v[1] * w[1]) / (v[0] * v[0] + v[1] * v[1]);
    const r = [w[0] - p * v[0], w[1] - p * v[1]];
    return { w, p, r, rn: Math.hypot(r[0], r[1]) };
  }

  // Direction (degrees in [0, 180)) of the null space of a singular-ish 2×2 matrix M.
  function nullDir(M) {
    const r1 = [M[0][0], M[0][1]], r2 = [M[1][0], M[1][1]];
    const big = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2;
    if (Math.hypot(...big) < 1e-14) return null; // M = 0: every direction
    return lineAngle([-big[1], big[0]]);
  }

  // Eigen-analysis of a 2×2 matrix from the characteristic equation λ² − (tr A) λ + det A = 0.
  function eig2(A) {
    const tr = trace(A), dt = det(A), disc = tr * tr - 4 * dt, scale = Math.max(1, tr * tr);
    const out = { tr, det: dt, disc };
    if (disc < -1e-12 * scale) {
      out.type = 'complex'; out.re = tr / 2; out.im = Math.sqrt(-disc) / 2; out.dirs = []; return out;
    }
    const s = Math.sqrt(Math.max(0, disc));
    out.l1 = (tr + s) / 2; out.l2 = (tr - s) / 2;
    if (s <= 1e-9 * Math.max(1, Math.abs(tr))) {
      const M = [[A[0][0] - out.l1, A[0][1]], [A[1][0], A[1][1] - out.l1]];
      const d = nullDir(M);
      out.type = d === null ? 'scalar' : 'repeated'; out.dirs = d === null ? [] : [d]; return out;
    }
    out.type = 'two';
    out.dirs = [out.l1, out.l2].map(l => nullDir([[A[0][0] - l, A[0][1]], [A[1][0], A[1][1] - l]]));
    return out;
  }
  const charPoly = (A, l) => l * l - trace(A) * l + det(A);
  const shift = (A, l) => [[A[0][0] - l, A[0][1]], [A[1][0], A[1][1] - l]];

  // Repeated application: normalised iterates, growth factors and angle (degrees) to the dominant line.
  function power(A, v0, K) {
    const e = eig2(A);
    // dominant line: the eigen-direction whose eigenvalue has the larger size |λ| (only when they differ)
    const dom = e.type === 'two' && Math.abs(Math.abs(e.l1) - Math.abs(e.l2)) > 1e-12 ? (Math.abs(e.l1) > Math.abs(e.l2) ? e.dirs[0] : e.dirs[1]) : null;
    e.domIdx = dom === null ? null : (dom === e.dirs[0] ? 0 : 1);
    let v = v0.slice(); const steps = [];
    for (let k = 0; k <= K; k++) {
      const n = Math.hypot(v[0], v[1]), u = [v[0] / n, v[1] / n];
      let ang = null; if (dom !== null) { ang = Math.abs(lineAngle(u) - dom); if (ang > 90) ang = 180 - ang; }
      steps.push({ k, v: v.slice(), u, n, ang });
      v = apply(A, v);
    }
    for (let k = 1; k <= K; k++) steps[k].growth = steps[k].n / steps[k - 1].n;
    return { steps, eig: e };
  }

  // Seeded normal data for the PCA step (mulberry32 + Box–Muller).
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const N_PTS = 160;
  function cloud(rho, seed = 7) {
    const rnd = mulberry32(seed), pts = [];
    for (let i = 0; i < N_PTS; i++) {
      const u1 = Math.max(rnd(), 1e-12), u2 = rnd(), u3 = Math.max(rnd(), 1e-12), u4 = rnd();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2), z2 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);
      pts.push([z1, rho * z1 + Math.sqrt(1 - rho * rho) * z2]);
    }
    return pts;
  }
  // Sample covariance (divides by n − 1) of centred data.
  function covariance(pts) {
    const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
    let sxx = 0, sxy = 0, syy = 0;
    for (const [x, y] of pts) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); syy += (y - my) ** 2; }
    return { S: [[sxx / (n - 1), sxy / (n - 1)], [sxy / (n - 1), syy / (n - 1)]], mean: [mx, my] };
  }
  // Variance of the data projected on the line at angle θ (degrees): uᵀ S u.
  const varAlong = (S, th) => { const u = unit(th); return S[0][0] * u[0] * u[0] + 2 * S[0][1] * u[0] * u[1] + S[1][1] * u[1] * u[1]; };

  const DEFAULT_A = [[1.5, 0.5], [1, 1]];
  const PRESETS3 = {
    rotation: [[Math.cos(30 * DEG), -Math.sin(30 * DEG)], [Math.sin(30 * DEG), Math.cos(30 * DEG)]],
    shear: [[1, 1], [0, 1]],
    scalar: [[1.5, 0], [0, 1.5]],
    reflection: [[1, 0], [0, -1]]
  };
  const family3 = k => [[1, 1], [k, 1]];       // tr 2, det 1 − k, discriminant 4k
  const PRESETS4 = { default: DEFAULT_A, fib: [[1, 1], [1, 0]], close: [[1, 0.3], [0.2, 0.9]] };

  const api = { DEG, apply, unit, trace, det, fold180, lineAngle, turn, split, nullDir, eig2, charPoly, shift, power, mulberry32, cloud, covariance, varAlong, N_PTS, DEFAULT_A, PRESETS3, family3, PRESETS4 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EIGEN_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
