'use strict';
// Conic sections model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, point and readout on the page is computed here; tests/core.cjs pins the claims.
// Geometry: a double cone x² + y² = (z·tanα)² with apex at the origin and axis along z.
// A cutting plane passes through the axis point (0, 0, H) and is tilted by β from horizontal:
// in-plane coordinates (u, w) map to (u·cosβ, w, H + u·sinβ). The side view is the x–z plane (w = 0).
(function (root) {
  const D2R = Math.PI / 180;
  const ALPHA = 30;   // cone half-angle, degrees
  const H = 1.5;      // height where the plane crosses the axis

  // Section of the cone in plane coordinates: w² = A u² + B u + C.
  function sectionCoef(betaDeg, alphaDeg = ALPHA, h = H) {
    const b = betaDeg * D2R, k = Math.tan(alphaDeg * D2R);
    return { A: k * k * Math.sin(b) ** 2 - Math.cos(b) ** 2, B: 2 * k * k * h * Math.sin(b), C: k * k * h * h, k };
  }
  const to3D = (u, w, betaDeg, h = H) => { const b = betaDeg * D2R; return [u * Math.cos(b), w, h + u * Math.sin(b)]; };
  function onCone(p, alphaDeg = ALPHA) { const k = Math.tan(alphaDeg * D2R); return p[0] * p[0] + p[1] * p[1] - k * k * p[2] * p[2]; }
  function ecc(betaDeg, alphaDeg = ALPHA) { return Math.sin(betaDeg * D2R) / Math.cos(alphaDeg * D2R); }
  // Type by comparing the plane's tilt with the cone's side (β vs 90° − α).
  function kind(betaDeg, alphaDeg = ALPHA) {
    const e = ecc(betaDeg, alphaDeg);
    if (betaDeg === 0) return 'circle';
    if (Math.abs(e - 1) < 1e-9) return 'parabola';
    return e < 1 ? 'ellipse' : 'hyperbola';
  }
  // Points of the section for u in [u0, u1], both signs of w; returns arrays of [u, w] runs (one per branch half).
  function sectionRuns(betaDeg, u0, u1, steps = 600) {
    const { A, B, C } = sectionCoef(betaDeg), top = [], bot = [], runs = [];
    let curT = [], curB = [];
    for (let i = 0; i <= steps; i++) {
      const u = u0 + (u1 - u0) * i / steps, q = A * u * u + B * u + C;
      if (q >= 0) { const w = Math.sqrt(q); curT.push([u, w]); curB.push([u, -w]); }
      else if (curT.length) { runs.push(curT.concat(curB.reverse())); curT = []; curB = []; }
    }
    if (curT.length) runs.push(curT.concat(curB.reverse()));
    return runs;
  }
  // Closed-form shape numbers for the section (ellipse / hyperbola): centre u_c, semi-axes along u (a) and w (b).
  function sectionShape(betaDeg) {
    const { A, B, C } = sectionCoef(betaDeg), e = ecc(betaDeg);
    if (Math.abs(A) < 1e-12) { // parabola: w² = B u + C, vertex at u = −C/B; semi-latus rectum B/2
      return { kind: 'parabola', e, vertex: -C / B, p: B / 2 };
    }
    const uc = -B / (2 * A), K = C - B * B / (4 * A); // w² = A (u − uc)² + K
    if (A < 0) return { kind: betaDeg === 0 ? 'circle' : 'ellipse', e, uc, a: Math.sqrt(K / -A), b: Math.sqrt(K) };
    return { kind: 'hyperbola', e, uc, a: Math.sqrt(-K / A), b: Math.sqrt(-K) };
  }
  // The same section drawn parametrically (exact ends, no sampling gaps): runs of [u, w] points.
  // Ellipse: (uc + a cos t, b sin t). Parabola: u = (w² − C)/B. Hyperbola: u = uc ± a cosh s, w = b sinh s.
  function sectionCurve(betaDeg, reach = 14, steps = 720) {
    const sh = sectionShape(betaDeg), { B, C } = sectionCoef(betaDeg);
    if (sh.kind === 'circle' || sh.kind === 'ellipse') {
      return [Array.from({ length: steps + 1 }, (_, i) => { const t = 2 * Math.PI * i / steps; return [sh.uc + sh.a * Math.cos(t), sh.b * Math.sin(t)]; })];
    }
    if (sh.kind === 'parabola') {
      const Wm = Math.sqrt(B * reach + C);
      return [Array.from({ length: steps + 1 }, (_, i) => { const w = -Wm + 2 * Wm * i / steps; return [(w * w - C) / B, w]; })];
    }
    const S = Math.acosh(Math.max(1, (reach + Math.abs(sh.uc)) / sh.a));
    return [1, -1].map(sg => Array.from({ length: steps + 1 }, (_, i) => { const q = -S + 2 * S * i / steps; return [sh.uc + sg * sh.a * Math.cosh(q), sh.b * Math.sinh(q)]; }));
  }
  // Where the plane's line crosses the two generators x = ±k z in the side view (u values).
  function sideHits(betaDeg) {
    const b = betaDeg * D2R, k = Math.tan(ALPHA * D2R), out = [];
    for (const s of [1, -1]) { // u cosβ = s k (H + u sinβ)
      const den = Math.cos(b) - s * k * Math.sin(b);
      if (Math.abs(den) > 1e-12) out.push(s * k * H / den);
    }
    return out;
  }

  // ---- Dandelin spheres (ellipse case, β < 90° − α) ----
  // Sphere centres on the axis at height zc, radius zc·sinα (tangent to the cone); tangent to the plane when
  // cosβ·|zc − H| = zc·sinα. Focus = foot of the perpendicular from the centre to the plane.
  function dandelin(betaDeg, alphaDeg = ALPHA, h = H) {
    const b = betaDeg * D2R, sa = Math.sin(alphaDeg * D2R), ca = Math.cos(alphaDeg * D2R), cb = Math.cos(b), sb = Math.sin(b);
    const zs = [h * cb / (cb + sa), h * cb / (cb - sa)]; // small sphere (below the plane), big sphere (above)
    return zs.map(zc => ({
      zc, r: zc * sa,
      focusU: (zc - h) * sb,             // in-plane coordinate of the tangency point
      contactZ: zc * ca * ca,            // height of the circle where the sphere touches the cone
      slant: zc * ca                     // distance from the apex along a generator to that circle
    }));
  }
  // Sum of focal distances for the in-plane point (u, w) and the generator length between the two contact circles.
  function focalCheck(betaDeg, u, w) {
    const [s1, s2] = dandelin(betaDeg);
    const d1 = Math.hypot(u - s1.focusU, w), d2 = Math.hypot(u - s2.focusU, w);
    // the generator through P: P's distance from the apex along the cone is |P|; contact circles at slant s1, s2
    const P = to3D(u, w, betaDeg), slantP = Math.hypot(P[0], P[1], P[2]);
    return { d1, d2, sum: d1 + d2, L: s2.slant - s1.slant, toC1: slantP - s1.slant, toC2: s2.slant - slantP };
  }
  // Ellipse point by angle t (degrees) around its centre, in plane coordinates.
  function ellipsePoint(betaDeg, tDeg) {
    const s = sectionShape(betaDeg), t = tDeg * D2R;
    return [s.uc + s.a * Math.cos(t), s.b * Math.sin(t)];
  }

  // ---- pins and string (step 2): standard position, foci (±c, 0) ----
  function pinCurve(mode, a, c) {
    if (mode === 'sum') { if (a <= c) return null; return { mode, a, c, b: Math.sqrt(a * a - c * c), e: c / a }; }
    if (a >= c || a <= 0) return null; return { mode, a, c, b: Math.sqrt(c * c - a * a), e: c / a };
  }
  // Pencil position for a parameter p in [0, 1): ellipse by angle; hyperbola: right branch then left branch.
  const TMAX = 2.2;
  function pencil(curve, p) {
    if (curve.mode === 'sum') { const t = 2 * Math.PI * p; return [curve.a * Math.cos(t), curve.b * Math.sin(t)]; }
    const half = p < 0.5, q = half ? p * 2 : (p - 0.5) * 2, t = -TMAX + 2 * TMAX * q, s = half ? 1 : -1;
    return [s * curve.a * Math.cosh(t), curve.b * Math.sinh(t)];
  }
  function pinDistances(curve, P) {
    const d1 = Math.hypot(P[0] + curve.c, P[1]), d2 = Math.hypot(P[0] - curve.c, P[1]);
    return { d1, d2, sum: d1 + d2, diff: Math.abs(d1 - d2) };
  }

  // ---- focus and directrix (step 3): focus at the origin, semi-latus rectum L fixed, directrix x = −L/e ----
  const LR = 1.5;
  function polarR(e, thDeg) { const den = 1 - e * Math.cos(thDeg * D2R); return Math.abs(den) < 1e-9 ? Infinity : LR / den; }
  function fdPoint(e, thDeg) { const r = polarR(e, thDeg), t = thDeg * D2R; return [r * Math.cos(t), r * Math.sin(t)]; }
  function fdCheck(e, P) { const pf = Math.hypot(P[0], P[1]), pd = e > 0 ? Math.abs(P[0] + LR / e) : Infinity; return { pf, pd, ratio: e > 0 ? pf / pd : 0 }; }
  function kindOfE(e) { if (e === 0) return 'circle'; if (Math.abs(e - 1) < 1e-9) return 'parabola'; return e < 1 ? 'ellipse' : 'hyperbola'; }

  // ---- reflection (step 4) ----
  // Reflect direction d about the unit normal n.
  function reflect(d, n) { const k = 2 * (d[0] * n[0] + d[1] * n[1]); return [d[0] - k * n[0], d[1] - k * n[1]]; }
  // Distance from point Q to the line through P with direction d.
  function missDistance(P, d, Q) { const L = Math.hypot(d[0], d[1]); return Math.abs((Q[0] - P[0]) * d[1] - (Q[1] - P[1]) * d[0]) / L; }
  // Parabola mirror y = x²/(4f), focus (0, f); a ray falls straight down at x = x0 from height Y0.
  function parabolaRay(f, x0, Y0) {
    const P = [x0, x0 * x0 / (4 * f)], g = [-x0 / (2 * f), 1], gl = Math.hypot(g[0], g[1]), n = [g[0] / gl, g[1] / gl];
    const out = reflect([0, -1], n), F = [0, f];
    const leg1 = Y0 - P[1], leg2 = Math.hypot(F[0] - P[0], F[1] - P[1]);
    return { P, out, F, miss: missDistance(P, out, F), leg1, leg2, path: leg1 + leg2, towards: (F[0] - P[0]) * out[0] + (F[1] - P[1]) * out[1] > 0 };
  }
  // Ellipse mirror x²/a² + y²/b² = 1, foci (±c, 0); a ray leaves F1 = (−c, 0) at angle phi.
  function ellipseRay(a, b, phiDeg) {
    const c = Math.sqrt(a * a - b * b), F1 = [-c, 0], F2 = [c, 0], ph = phiDeg * D2R, d = [Math.cos(ph), Math.sin(ph)];
    // solve (−c + t dx)²/a² + (t dy)²/b² = 1 for t > 0
    const qa = d[0] * d[0] / (a * a) + d[1] * d[1] / (b * b), qb = -2 * c * d[0] / (a * a), qc = c * c / (a * a) - 1;
    const t = (-qb + Math.sqrt(qb * qb - 4 * qa * qc)) / (2 * qa);
    const P = [F1[0] + t * d[0], F1[1] + t * d[1]], g = [P[0] / (a * a), P[1] / (b * b)], gl = Math.hypot(g[0], g[1]);
    const out = reflect(d, [g[0] / gl, g[1] / gl]);
    const leg2 = Math.hypot(F2[0] - P[0], F2[1] - P[1]);
    return { P, out, F1, F2, miss: missDistance(P, out, F2), leg1: t, leg2, path: t + leg2, towards: (F2[0] - P[0]) * out[0] + (F2[1] - P[1]) * out[1] > 0 };
  }

  const api = { D2R, ALPHA, H, sectionCoef, to3D, onCone, ecc, kind, sectionRuns, sectionCurve, sectionShape, sideHits, dandelin, focalCheck, ellipsePoint, pinCurve, TMAX, pencil, pinDistances, LR, polarR, fdPoint, fdCheck, kindOfE, reflect, missDistance, parabolaRay, ellipseRay };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CONIC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
