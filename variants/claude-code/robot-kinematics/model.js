'use strict';
// Planar two-link arm model (Claude Code edition of robot kinematics).
// Author: Claude Code (claude-opus-5-5), 2026-11-09. Pure functions; loads in the browser and in node.
// Angles are in radians here (the page shows degrees). θ1 is measured from the +x axis, θ2 from link 1.
(function (root) {
  const ARM = { l1: 1.0, l2: 0.6 }; // metres
  const DEG = Math.PI / 180;
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a)); // to (−π, π]

  // Forward kinematics: elbow and hand position.
  function fk(t1, t2, L = ARM) {
    const ex = L.l1 * Math.cos(t1), ey = L.l1 * Math.sin(t1);
    return { ex, ey, x: ex + L.l2 * Math.cos(t1 + t2), y: ey + L.l2 * Math.sin(t1 + t2) };
  }
  // Distance of the hand from the base depends on θ2 only (law of cosines).
  const radiusOf = (t2, L = ARM) => Math.sqrt(Math.max(0, L.l1 * L.l1 + L.l2 * L.l2 + 2 * L.l1 * L.l2 * Math.cos(t2)));
  const reach = (L = ARM) => ({ rin: Math.abs(L.l1 - L.l2), rout: L.l1 + L.l2 });

  // Closed-form inverse kinematics. Returns both elbow solutions (θ2 ≥ 0 first) or reachable = false.
  function ik(x, y, L = ARM) {
    const r2 = x * x + y * y, c2 = (r2 - L.l1 * L.l1 - L.l2 * L.l2) / (2 * L.l1 * L.l2);
    if (c2 > 1 + 1e-12 || c2 < -1 - 1e-12 || r2 === 0) return { reachable: false, c2, r: Math.sqrt(r2), sols: [] };
    const c = Math.max(-1, Math.min(1, c2)), sols = [];
    for (const sgn of [1, -1]) {
      const s = sgn * Math.sqrt(1 - c * c), t2 = Math.atan2(s, c);
      const t1 = wrap(Math.atan2(y, x) - Math.atan2(L.l2 * s, L.l1 + L.l2 * c));
      sols.push({ t1, t2 });
    }
    return { reachable: true, c2: c, r: Math.sqrt(r2), sols };
  }

  // Jacobian: columns are the hand velocity per unit joint speed of joint 1 and joint 2.
  function jac(t1, t2, L = ARM) {
    const s1 = Math.sin(t1), c1 = Math.cos(t1), s12 = Math.sin(t1 + t2), c12 = Math.cos(t1 + t2);
    return [[-L.l1 * s1 - L.l2 * s12, -L.l2 * s12], [L.l1 * c1 + L.l2 * c12, L.l2 * c12]];
  }
  const det = J => J[0][0] * J[1][1] - J[0][1] * J[1][0];
  const mulv = (J, v) => [J[0][0] * v[0] + J[0][1] * v[1], J[1][0] * v[0] + J[1][1] * v[1]];
  function solve(J, v) { const d = det(J); if (Math.abs(d) < 1e-14) return null; return [(J[1][1] * v[0] - J[0][1] * v[1]) / d, (-J[1][0] * v[0] + J[0][0] * v[1]) / d]; }

  // Singular values and output directions of a 2×2 matrix: the velocity ellipse for |ω| = 1.
  function svd2(J) {
    const a = J[0][0] * J[0][0] + J[0][1] * J[0][1], b = J[0][0] * J[1][0] + J[0][1] * J[1][1], c = J[1][0] * J[1][0] + J[1][1] * J[1][1];
    const tr = a + c, disc = Math.sqrt(Math.max(0, (a - c) * (a - c) / 4 + b * b));
    const e1 = tr / 2 + disc, e2 = Math.max(0, tr / 2 - disc);
    const ang = 0.5 * Math.atan2(2 * b, a - c); // direction of the long axis
    const s1 = Math.sqrt(e1), s2 = s1 > 0 ? Math.abs(det(J)) / s1 : Math.sqrt(e2); // |det| / σ1 is exact near rank loss
    return { s1, s2, ang };
  }

  // Hand path when both joints turn at constant speeds for T seconds (exact, sampled).
  function sweepPath(t1, t2, w1, w2, T, n = 40, L = ARM) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const s = T * i / n; const p = fk(t1 + w1 * s, t2 + w2 * s, L); pts.push([p.x, p.y]); }
    return pts;
  }

  // Joint speeds needed for a hand velocity v (null at an exact singularity).
  const jointSpeedFor = (t1, t2, v, L = ARM) => solve(jac(t1, t2, L), v);
  // Radial unit vector of the hand (from base to hand).
  function radialDir(t1, t2, L = ARM) { const p = fk(t1, t2, L), r = Math.hypot(p.x, p.y); return r > 1e-12 ? [p.x / r, p.y / r] : [1, 0]; }

  // One damped-least-squares step: Δθ = Jᵀ (J Jᵀ + λ² I)⁻¹ e. λ = 0 is the plain Newton step J⁻¹ e.
  function ikStep(t, target, lambda, L = ARM) {
    const p = fk(t[0], t[1], L), e = [target[0] - p.x, target[1] - p.y], J = jac(t[0], t[1], L);
    let d;
    if (lambda === 0) { d = solve(J, e); if (!d) return { t: t.slice(), stuck: true, err: Math.hypot(e[0], e[1]) }; }
    else {
      const l2 = lambda * lambda;
      const A = [[J[0][0] * J[0][0] + J[0][1] * J[0][1] + l2, J[0][0] * J[1][0] + J[0][1] * J[1][1]], [J[0][0] * J[1][0] + J[0][1] * J[1][1], J[1][0] * J[1][0] + J[1][1] * J[1][1] + l2]];
      const y = solve(A, e); d = [J[0][0] * y[0] + J[1][0] * y[1], J[0][1] * y[0] + J[1][1] * y[1]];
    }
    return { t: [t[0] + d[0], t[1] + d[1]], step: Math.hypot(d[0], d[1]), err: Math.hypot(e[0], e[1]) };
  }
  // Run iterations; history[k] = angles before step k and the hand error there.
  function ikRun(guess, target, lambda, iters = 12, L = ARM) {
    const hist = []; let t = guess.slice();
    for (let k = 0; k <= iters; k++) {
      const p = fk(t[0], t[1], L), err = Math.hypot(target[0] - p.x, target[1] - p.y);
      hist.push({ t1: t[0], t2: t[1], x: p.x, y: p.y, err });
      if (k === iters) break;
      const s = ikStep(t, target, lambda, L); if (s.stuck) break; t = s.t;
    }
    return hist;
  }
  // First iteration index whose error is below tol (−1 if never).
  const firstBelow = (hist, tol) => hist.findIndex(h => h.err < tol);

  const api = { ARM, DEG, wrap, fk, radiusOf, reach, ik, jac, det, mulv, solve, svd2, sweepPath, jointSpeedFor, radialDir, ikStep, ikRun, firstBelow };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ARM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
