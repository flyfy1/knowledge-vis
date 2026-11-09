'use strict';
// Convex lens model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Ideal thin convex lens, paraxial (near-axis) rays, lengths in cm. The lens sits at x = 0 on the
// principal axis y = 0; a real object stands on the left at x = −u (u > 0) with its tip at height h.
// Every ray, image and readout on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  const F = 10;           // focal length used in steps 1–3 and the quiz (cm)
  const H = 3;            // candle height (cm)
  const APERTURE = 4;     // lens diameter used for the screen blur in step 3 (cm)

  // Thin-lens equation 1/f = 1/u + 1/v  ⇒  v = u·f / (u − f). Signed magnification M = −v/u.
  // v > 0: real image on the right, inverted (M < 0). v < 0: virtual image on the left, upright (M > 0).
  // u = f exactly: the rays leave parallel and never meet — no image at a finite distance.
  function image(u, f) {
    if (!(u > 0 && f > 0) || !isFinite(u) || !isFinite(f)) return { type: 'invalid', v: null, M: null };
    if (u === f) return { type: 'infinity', v: null, M: null };
    const v = u * f / (u - f), M = -v / u;
    return { type: v > 0 ? 'real' : 'virtual', v, M };
  }

  // Zone of the object distance, decided on the exact (unrounded) value.
  function zone(u, f) {
    if (u > 2 * f) return 'beyond2f';
    if (u === 2 * f) return 'at2f';
    if (u > f) return 'between';
    if (u === f) return 'atf';
    return 'inside';
  }
  // Orientation / size of an image from its magnification.
  function describe(M) {
    if (M === null) return null;
    const a = Math.abs(M);
    return { upright: M > 0, size: Math.abs(a - 1) < 1e-12 ? 'same' : a > 1 ? 'larger' : 'smaller' };
  }

  // The three construction rays from the object tip (−u, h). Each is a pair of lines: before the lens
  // (from the tip to the lens plane) and after it (a point on the lens plane plus a direction).
  //   ray 1: parallel to the axis → after the lens passes through the far focus (f, 0)
  //   ray 2: through the optical centre (0, 0) → straight on
  //   ray 3: along the line through the near focus (−f, 0) → after the lens parallel to the axis
  //          (undefined when u = f: that line is vertical and never reaches the lens)
  function rays(u, h, f) {
    const r1 = { y0: h, dir: [f, -h] };
    const r2 = { y0: 0, dir: [u, -h] };
    const r3 = u === f ? null : { y0: h * f / (f - u), dir: [1, 0] };
    return [r1, r2, r3];
  }
  // Where two after-lens lines meet (forward if t > 0 — a real crossing; backward if t < 0).
  function meet(a, b) {
    const [ax, ay] = a.dir, [bx, by] = b.dir, den = ax * by - ay * bx;
    if (Math.abs(den) < 1e-15) return null;
    const t = ((0 - 0) * by - (b.y0 - a.y0) * bx) / den; // solve (0, a.y0) + t·a.dir = (0, b.y0) + s·b.dir
    return { x: t * ax, y: a.y0 + t * ay };
  }

  // Step 0: a parallel beam at heights ys all crosses the axis at x = f (ideal thin lens).
  function beamCross(f, ys) { return ys.map(y => meet({ y0: y, dir: [f, -y] }, { y0: 0, dir: [1, 0] }).x); }

  // Step 3: a screen at distance p behind the lens. Light from the object tip fills the lens aperture D and
  // heads for the image point (real) or spreads as if from it (virtual). Width of the light patch on the screen,
  // by similar triangles: real b = D·|p − v| / v ; virtual b = D·(p − v) / (−v) = D·(p + |v|)/|v| ; u = f: b = D.
  function blur(p, u, f, D = APERTURE) {
    const im = image(u, f);
    if (im.type === 'infinity') return D;
    if (im.type === 'real') return D * Math.abs(p - im.v) / im.v;
    if (im.type === 'virtual') return D * (p - im.v) / (-im.v);
    return null;
  }

  // Step 4: three everyday uses, each with its own lens and allowed object range.
  const DEVICES = {
    camera: { f: 5, h: 8, uMin: 12, uMax: 60, u0: 40 },
    projector: { f: 10, h: 1, uMin: 11, uMax: 19.5, u0: 12 },
    magnifier: { f: 10, h: 1, uMin: 2, uMax: 8, u0: 6 }
  };

  // Step 5: self-test answers.
  function quiz() {
    const a = image(3 * F, F), b0 = image(3 * F, F), b1 = image(1.5 * F, F);
    return { q1: { v: a.v, M: a.M, d: describe(a.M), zone: zone(3 * F, F) }, q2: { v0: b0.v, v1: b1.v, M0: b0.M, M1: b1.M }, q3: zone(0.6 * F, F) };
  }

  const api = { F, H, APERTURE, image, zone, describe, rays, meet, beamCross, blur, DEVICES, quiz };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LENS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
