'use strict';
// Gravitational lensing model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, image and readout on the page comes from here; tests/core.cjs pins the claims.
// Scope: a single point-mass lens, thin-lens and small-angle approximations, weak field (deflection ≪ 1 rad).
// Distances are plain Euclidean (D_ls = D_s − D_l); real cosmological work uses angular-diameter distances.
(function (root) {
  const G = 6.674e-11, c = 2.998e8, MSUN = 1.989e30, RSUN = 6.957e8, AU = 1.495978707e11, PC = 3.0857e16;
  const ARCSEC = Math.PI / (180 * 3600), MAS = ARCSEC / 1000, UAS = MAS / 1000;

  /* ---------- step 0: how much a grazing ray bends ---------- */
  // General relativity: α = 4GM / (c² b). A Newtonian "light corpuscle" estimate gives exactly half.
  function deflection(mSun, bRsun) { return 4 * G * mSun * MSUN / (c * c * bRsun * RSUN); }
  const deflectionArcsec = (m, b) => deflection(m, b) / ARCSEC;
  const newtonArcsec = (m, b) => deflectionArcsec(m, b) / 2;
  // A ray passing at b crosses the axis a distance b / α behind the lens (small angles).
  function focusAU(mSun, bRsun) { return bRsun * RSUN / deflection(mSun, bRsun) / AU; }
  // The schematic draws the Sun-limb deflection (M = 1, b = 1) as 5°; every ray uses the same factor.
  const SCHEMATIC_DEG_AT_LIMB = 5;
  const schematicFactor = () => SCHEMATIC_DEG_AT_LIMB * 3600 / deflectionArcsec(1, 1);

  /* ---------- step 1: the lens equation (angles in units of the Einstein radius θE) ---------- */
  // β = θ − 1/θ for a point mass. Both roots of θ² − βθ − 1 = 0 are images.
  const betaOf = th => th - 1 / th;
  // Signed magnification of the image at θ: μ = 1 / (1 − θ⁻⁴). The inner image (θ < 0) has μ < 0: it is mirror-flipped.
  const mu = th => 1 / (1 - Math.pow(th, -4));
  function images(beta) {
    const s = Math.sqrt(beta * beta + 4), tp = (beta + s) / 2, tm = (beta - s) / 2;
    if (beta === 0) return { ring: true, tp: 1, tm: -1, sep: 2, mp: Infinity, mm: -Infinity, A: Infinity };
    return { ring: false, tp, tm, sep: tp - tm, mp: mu(tp), mm: mu(tm), A: Math.abs(mu(tp)) + Math.abs(mu(tm)) };
  }
  // Total magnification of a point source at separation u (θE units): the microlensing formula.
  const totalA = u => (u * u + 2) / (u * Math.sqrt(u * u + 4));

  /* ---------- step 2: how big the ring is ---------- */
  // θE = √(4GM/c² · D_ls / (D_l D_s)); physical radius in the lens plane R_E = θE · D_l.
  function thetaE(mSun, dl, ds) { if (!(ds > dl) || dl <= 0) return NaN; return Math.sqrt(4 * G * mSun * MSUN / (c * c) * (ds - dl) / (dl * ds)); }
  const PRESETS = {
    star: { logM: Math.log10(0.5), logDs: Math.log10(8e3), x: 0.5 },     // a 0.5 M☉ star halfway to the Galactic bulge (8 kpc)
    galaxy: { logM: 12, logDs: Math.log10(2e9), x: 0.5 },                 // 10¹² M☉, halfway to a source 2 Gpc away
    cluster: { logM: 15, logDs: Math.log10(2e9), x: 0.5 }                 // 10¹⁵ M☉ treated as a point (real clusters are extended)
  };
  function ringCase(logM, logDsPc, x) {
    const ds = Math.pow(10, logDsPc) * PC, dl = x * ds, th = thetaE(Math.pow(10, logM), dl, ds);
    return { mSun: Math.pow(10, logM), ds, dl, thetaE: th, arcsec: th / ARCSEC, sepArcsec: 2 * th / ARCSEC, RE_AU: th * dl / AU };
  }
  // Resolution yardsticks (smallest separation that still shows as two points).
  const HUBBLE = 1.22 * 500e-9 / 2.4 / ARCSEC;    // diffraction limit of a 2.4 m mirror at 500 nm ≈ 0.052″
  const RESOLUTION = [{ key: 'resEye', arcsec: 60 }, { key: 'resSeeing', arcsec: 1 }, { key: 'resHubble', arcsec: HUBBLE }];

  /* ---------- step 3: microlensing light curve ---------- */
  // Source moves in a straight line past the lens; closest approach u0, time in Einstein-crossing times tE.
  const uAt = (u0, tt) => Math.sqrt(u0 * u0 + tt * tt);
  const lightCurve = (u0, tt) => totalA(uAt(u0, tt));
  const dMag = A => 2.5 * Math.log10(A);

  /* ---------- step 4: an extended (disc) source: arcs and rings ---------- */
  // Inverse ray shooting: a sky position θ (vector, θE units) shows source point β = θ − θ/|θ|².
  function sourceOf(x, y) { const r2 = x * x + y * y; return r2 === 0 ? null : [x - x / r2, y - y / r2]; }
  function inSource(x, y, beta, rho) { const s = sourceOf(x, y); if (!s) return false; const dx = s[0] - beta, dy = s[1]; return dx * dx + dy * dy <= rho * rho; }
  // Each image point sits on the line through the lens and its source point, so an arc spans the same
  // azimuth range as the source disc seen from the lens: 2·asin(ρ/β). With β ≤ ρ the disc covers the lens: a full ring.
  function arcSpanDeg(beta, rho) { return beta <= rho ? 360 : 2 * Math.asin(rho / beta) * 180 / Math.PI; }
  // Uniform disc: magnification = image area / source area = average of totalA(u) over the disc.
  // Integrated in lens-centred rings: Φ(u) = angle of the circle |β'| = u that lies inside the disc.
  function phiInside(u, beta, rho) {
    if (beta === 0) return u < rho ? 2 * Math.PI : 0;
    if (u <= rho - beta) return 2 * Math.PI;
    if (u >= beta + rho || u <= beta - rho) return 0;
    const cosv = (u * u + beta * beta - rho * rho) / (2 * u * beta);
    return 2 * Math.acos(Math.max(-1, Math.min(1, cosv)));
  }
  function extendedMag(beta, rho, steps = 4000) {
    const lo = Math.max(0, beta - rho), hi = beta + rho, d = (hi - lo) / steps; let s = 0;
    for (let i = 0; i < steps; i++) { const u = lo + (i + 0.5) * d; s += (u * u + 2) / Math.sqrt(u * u + 4) * phiInside(u, beta, rho) * d; }
    return s / (Math.PI * rho * rho);
  }
  // Pixel-count version on an n×n grid over [−ext, ext]² (what the page draws), for cross-checking.
  function imageMask(beta, rho, n, ext) {
    const m = new Uint8Array(n * n), d = 2 * ext / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = -ext + (i + 0.5) * d, y = ext - (j + 0.5) * d;
      if (inSource(x, y, beta, rho)) m[j * n + i] = x * x + y * y >= 1 ? 1 : 2; // 1 outer image, 2 inner image
    }
    return m;
  }
  function maskMag(beta, rho, n, ext) { const m = imageMask(beta, rho, n, ext), d = 2 * ext / n; let k = 0; for (const v of m) if (v) k++; return k * d * d / (Math.PI * rho * rho); }
  const EXT4 = 2.6;

  /* ---------- step 5: weighing the lens from its ring ---------- */
  // Invert θE: M = c² θE² D_l D_s / (4 G D_ls). For a round lens this is the mass inside the ring radius.
  function massFromRing(thetaArcsec, dlMpc, dsMpc) {
    if (!(dsMpc > dlMpc)) return NaN;
    const th = thetaArcsec * ARCSEC, dl = dlMpc * 1e6 * PC, ds = dsMpc * 1e6 * PC;
    return c * c * th * th * dl * ds / (4 * G * (ds - dl)) / MSUN;
  }
  const ringRadiusKpc = (thetaArcsec, dlMpc) => thetaArcsec * ARCSEC * dlMpc * 1e3;

  const api = { G, c, MSUN, RSUN, AU, PC, ARCSEC, MAS, UAS, deflection, deflectionArcsec, newtonArcsec, focusAU, SCHEMATIC_DEG_AT_LIMB, schematicFactor,
    betaOf, mu, images, totalA, thetaE, PRESETS, ringCase, HUBBLE, RESOLUTION, uAt, lightCurve, dMag,
    sourceOf, inSource, arcSpanDeg, phiInside, extendedMag, imageMask, maskMag, EXT4, massFromRing, ringRadiusKpc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LENS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
