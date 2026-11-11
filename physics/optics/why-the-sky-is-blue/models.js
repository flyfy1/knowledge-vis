/* Why the sky is blue: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.SkyModels and by tests/models.cjs via require().
 * Wavelengths are in nanometres unless a name says otherwise. Sources for every formula are listed in BRIEF.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SkyModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── wavelength grid ───────── */
  const L0 = 380, L1 = 780, DL = 5;
  const GRID = []; for (let l = L0; l <= L1; l += DL) GRID.push(l);

  /* ───────── sunlight: Planck's law ─────────
   * Relative spectral radiance per unit wavelength. T_SUN = 5772 K (IAU 2015 Resolution B3 nominal value). */
  const T_SUN = 5772, C2 = 1.4388e7; // nm·K
  const planck = (l, T = T_SUN) => Math.pow(l / 500, -5) / (Math.exp(C2 / (l * T)) - 1);
  const wienPeak = T => 2.897771955e6 / T; // nm

  /* ───────── Rayleigh optical depth of the whole atmosphere, sea level ─────────
   * Bodhaine et al. 1999, Eq. (30): dry air, 360 ppm CO2, 1013.25 hPa, 45° N. λ in µm inside. */
  function rayleighTau(l) {
    const u = l / 1000, u2 = u * u;
    return 0.0021520 * (1.0455996 - 341.29061 / u2 - 0.90230850 * u2) / (1 + 0.0027059889 / u2 - 85.968563 * u2);
  }
  // the effective exponent n in τ ∝ λ^−n between two wavelengths
  const effExponent = (a, b) => Math.log(rayleighTau(a) / rayleighTau(b)) / Math.log(b / a);

  /* ───────── a molecule as a driven oscillator (Lorentz) ─────────
   * An electron bound with natural wavelength λr, driven at λ. Amplitude ∝ 1/(ωr² − ω²); radiated power ∝ ω⁴·amplitude².
   * With ω ∝ 1/λ: P(λ) ∝ λ^−4 / (λr^−2 − λ^−2)². Default λr = 83 nm: the pole of Edlén's 1953 dispersion formula
   * for air (the "146 − λ^−2" term, 1/√146 µm), quoted in Bodhaine et al. 1999 Eq. (1). This is an EFFECTIVE single-oscillator
   * fit to the visible refractive index, not a real absorption line (air's real absorption is spread below ~200 nm). */
  const LAMBDA_R = 1000 / Math.sqrt(146);
  const oscPower = (l, lr = LAMBDA_R) => Math.pow(l, -4) / Math.pow(1 / (lr * lr) - 1 / (l * l), 2);
  const oscAmp = (l, lr = LAMBDA_R) => 1 / (1 / (lr * lr) - 1 / (l * l)); // ∝ displacement per unit field (sign = phase)
  const oscRel = (l, ref, lr = LAMBDA_R) => oscPower(l, lr) / oscPower(ref, lr);

  /* ───────── the eye: CIE 1931 2° colour-matching functions ─────────
   * Multi-lobe piecewise Gaussian fit of Wyman, Sloan & Shirley 2013 (JCGT 2(2)), Listing 1. */
  const g = (l, mu, s1, s2) => { const t = (l - mu) * (l < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
  const cmf = l => ({
    x: 0.362 * g(l, 442.0, 0.0624, 0.0374) + 1.056 * g(l, 599.8, 0.0264, 0.0323) - 0.065 * g(l, 501.1, 0.0490, 0.0382),
    y: 0.821 * g(l, 568.8, 0.0213, 0.0247) + 0.286 * g(l, 530.9, 0.0613, 0.0322),
    z: 1.217 * g(l, 437.0, 0.0845, 0.0278) + 0.681 * g(l, 459.0, 0.0385, 0.0725)
  });
  const CMF = GRID.map(cmf);
  // spectrum given as a function of λ or an array on GRID → XYZ
  function toXYZ(spec) {
    let X = 0, Y = 0, Z = 0;
    for (let i = 0; i < GRID.length; i++) { const s = typeof spec === 'function' ? spec(GRID[i]) : spec[i], c = CMF[i]; X += s * c.x; Y += s * c.y; Z += s * c.z; }
    return { X: X * DL, Y: Y * DL, Z: Z * DL };
  }
  const xy = c => { const s = c.X + c.Y + c.Z; return s > 0 ? { x: c.X / s, y: c.Y / s } : { x: 1 / 3, y: 1 / 3 }; };
  // spectral locus (single wavelengths), finer than GRID
  const LOCUS = []; for (let l = 380; l <= 700; l += 1) { const c = cmf(l); const s = c.x + c.y + c.z; LOCUS.push({ l, x: c.x / s, y: c.y / s }); }
  const SUN_XYZ = toXYZ(l => planck(l));
  const SUN_XY = xy(SUN_XYZ);
  /* Dominant wavelength and excitation purity of a colour, relative to the white of sunlight.
   * Returns { l, purity, purple }: for purples l is the complementary wavelength and purple = true. */
  function dominant(c, white = SUN_XY) {
    const p = xy(c), dx = p.x - white.x, dy = p.y - white.y, d = Math.hypot(dx, dy);
    if (d < 1e-6) return { l: NaN, purity: 0, purple: false };
    const ang = Math.atan2(dy, dx);
    // walk the locus and find where the ray from white through p crosses it
    let best = null;
    for (let i = 0; i < LOCUS.length - 1; i++) {
      const a = LOCUS[i], b = LOCUS[i + 1];
      const hit = rayHit(white, ang, a, b); if (hit && (!best || hit.t < best.t)) best = { t: hit.t, l: a.l + (b.l - a.l) * hit.u };
    }
    if (best) return { l: best.l, purity: clamp(d / best.t, 0, 1), purple: false };
    // purple line: complementary wavelength
    const opp = ang + Math.PI; let comp = null;
    for (let i = 0; i < LOCUS.length - 1; i++) { const hit = rayHit(white, opp, LOCUS[i], LOCUS[i + 1]); if (hit && (!comp || hit.t < comp.t)) comp = { t: hit.t, l: LOCUS[i].l + hit.u }; }
    const A = LOCUS[0], B = LOCUS[LOCUS.length - 1], edge = rayHit(white, ang, A, B);
    return { l: comp ? comp.l : NaN, purity: edge ? clamp(d / edge.t, 0, 1) : 0, purple: true };
  }
  function rayHit(o, ang, a, b) {
    const rx = Math.cos(ang), ry = Math.sin(ang), sx = b.x - a.x, sy = b.y - a.y;
    const den = rx * sy - ry * sx; if (Math.abs(den) < 1e-12) return null;
    const qx = a.x - o.x, qy = a.y - o.y;
    const t = (qx * sy - qy * sx) / den, u = (qx * ry - qy * rx) / den;
    return t > 0 && u >= 0 && u <= 1 ? { t, u } : null;
  }
  /* XYZ → linear sRGB (IEC 61966-2-1 matrix), white-balanced so that sunlight is neutral (eye adapted to daylight). */
  const lin = c => [3.2406 * c.X - 1.5372 * c.Y - 0.4986 * c.Z, -0.9689 * c.X + 1.8758 * c.Y + 0.0415 * c.Z, 0.0557 * c.X - 0.2040 * c.Y + 1.0570 * c.Z];
  const SUN_LIN = lin(SUN_XYZ);
  const balanced = c => { const v = lin(c); return [v[0] / SUN_LIN[0] * SUN_XYZ.Y, v[1] / SUN_LIN[1] * SUN_XYZ.Y, v[2] / SUN_LIN[2] * SUN_XYZ.Y]; };
  const gammaEnc = v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  /* A displayable sRGB colour [0–255]×3 for XYZ c; `exposure` scales luminance (Y of sunlight = 1).
   * Out-of-gamut colours are desaturated toward their own luminance rather than clipped per channel. */
  function rgb(c, exposure = 1) {
    let v = balanced(c).map(q => q / SUN_XYZ.Y * exposure);
    const Y = 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    const mn = Math.min(...v); if (mn < 0) { const k = Y / (Y - mn); v = v.map(q => Y + (q - Y) * k); }
    const mx = Math.max(...v); if (mx > 1) v = v.map(q => q / mx);
    return v.map(q => Math.round(255 * gammaEnc(clamp(q, 0, 1))));
  }
  // colour of one wavelength at full saturation the screen can show (for swatches)
  const spectralRGB = l => { const c = cmf(l); return rgb({ X: c.x, Y: c.y, Z: c.z }, 1 / Math.max(0.05, c.y) * 0.6); };

  /* ───────── spectrum statistics ───────── */
  const integrate = (f, a, b, h = 1) => { let s = 0; for (let l = a + h / 2; l < b; l += h) s += f(l); return s * h; };
  // peak wavelength of f between a and b (golden-section-free: fine scan)
  function peakOf(f, a, b, h = 0.25) { let best = a, bv = -Infinity; for (let l = a; l <= b; l += h) { const v = f(l); if (v > bv) { bv = v; best = l; } } return best; }
  // scattered sunlight: Planck × λ^−n (n = 4 for molecules), optionally cut below `cut`
  const scattered = (T = T_SUN, n = 4, cut = 0) => l => (l < cut ? 0 : planck(l, T) * Math.pow(l / 550, -n));
  const bandShare = (f, a, b) => integrate(f, a, b) / integrate(f, 380, 780);

  /* ───────── 1 · photons through a layer of air (Monte Carlo) ─────────
   * Plane layer, optical depth τ(λ) × air. Sun elevation `elev`. Rayleigh phase function (3D). Seeded RNG.
   * Each photon ends on the ground (direct or after k scatterings) or back in space. */
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function rayleighCos(r) { // sample cosΘ from (3/8)(1 + cos²Θ) by rejection
    for (;;) { const c = 2 * r() - 1; if (r() * 2 <= 1 + c * c) return c; }
  }
  // turn direction (dx,dy,dz) by polar angle with cos = mu and azimuth phi
  function turn(d, mu, phi) {
    const st = Math.sqrt(Math.max(0, 1 - mu * mu)), cp = Math.cos(phi), sp = Math.sin(phi);
    const [x, y, z] = d;
    if (Math.abs(z) > 0.99999) return [st * cp, st * sp, mu * Math.sign(z)];
    const den = Math.sqrt(1 - z * z);
    return [st * (x * z * cp - y * sp) / den + x * mu, st * (y * z * cp + x * sp) / den + y * mu, -st * cp * den + z * mu];
  }
  /* One photon. tau = vertical optical depth. Returns { end: 'ground'|'space', k: scatterings, path: [[x, depth], …] }.
   * depth runs 0 (top) → 1 (ground); x is horizontal in the same units (layer thickness = 1). */
  function photon(tau, elev, r, keepPath) {
    const e = elev * Math.PI / 180;
    let d = [Math.cos(e), 0, -Math.sin(e)]; // travelling down; z up
    let x = 0, depth = 0, k = 0; const path = keepPath ? [[0, 0]] : null;
    for (let guard = 0; guard < 10000; guard++) {
      const s = -Math.log(1 - r()); // free path in optical-depth units along the ray
      const dz = -d[2]; // positive when going down
      const ds = tau > 0 ? s / tau : Infinity; // geometric length (layer thickness 1)
      const nd = depth + dz * ds;
      if (nd >= 1 || nd <= 0 || !isFinite(nd)) {
        const toEdge = dz > 0 ? (1 - depth) / dz : dz < 0 ? -depth / dz : Infinity;
        x += d[0] * toEdge; depth = dz > 0 ? 1 : 0;
        if (keepPath) path.push([x, depth]);
        return { end: dz > 0 ? 'ground' : 'space', k, path };
      }
      x += d[0] * ds; depth = nd; k++;
      if (keepPath) path.push([x, depth]);
      d = turn(d, rayleighCos(r), 2 * Math.PI * r());
    }
    return { end: 'space', k, path };
  }
  // many photons of one wavelength: counts by outcome and by number of scatterings
  function photonStats(l, air, elev, n, seed) {
    const r = rng(seed), tau = rayleighTau(l) * air;
    const out = { n, direct: 0, sky: 0, space: 0, byK: [0, 0, 0, 0] }; // byK[1], byK[2], byK[3] = 3 or more (sky light only)
    for (let i = 0; i < n; i++) {
      const p = photon(tau, elev, r, false);
      if (p.end === 'ground') { if (p.k === 0) out.direct++; else { out.sky++; out.byK[Math.min(3, p.k)]++; } }
      else out.space++;
    }
    return out;
  }
  // exact: share of a beam scattered at least once on its way down
  const scatteredOnce = (l, air = 1, m = 1) => 1 - Math.exp(-rayleighTau(l) * air * m);

  /* ───────── 5 · air mass and the setting sun ─────────
   * Kasten & Young 1989: m = 1 / (cos z + 0.50572 (96.07995° − z)^−1.6364), z = zenith angle in degrees. */
  const airMass = elev => { const z = 90 - elev; return 1 / (Math.cos(z * Math.PI / 180) + 0.50572 * Math.pow(96.07995 - z, -1.6364)); };
  const transmit = (l, elev, air = 1) => Math.exp(-rayleighTau(l) * air * airMass(elev));
  const sunSpectrum = (elev, air = 1) => l => planck(l) * transmit(l, elev, air);
  // elevation (deg) at which a wavelength keeps a given share of its light
  function elevForShare(l, share) { let a = 0, b = 90; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (transmit(l, m) > share) b = m; else a = m; } return (a + b) / 2; }

  /* ───────── 6/8 · single-scattering sky ─────────
   * Homogeneous plane layer of gas (Rayleigh) and optional dust. Radiance reaching an observer on the ground looking at
   * elevation `ve`, azimuth `va` from the sun, sun at elevation `se`:
   *   L(λ) = F(λ) · Σ τᵢ ωᵢ Pᵢ(Θ) / (4π τ) · m (e^{−τ m₀} − e^{−τ m}) / (m − m₀),   m, m₀ = air masses (Kasten–Young)
   * The sun's light and the scattered light each lose e^{−τ·path}; nothing is scattered twice. */
  const rayPhase = c => 0.75 * (1 + c * c);
  function scatterAngleCos(se, ve, va) {
    const a = se * Math.PI / 180, b = ve * Math.PI / 180, p = va * Math.PI / 180;
    return Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(p);
  }
  /* atm: { air (× Earth's Rayleigh τ), dustTau (at 550 nm), dust: dust optics table or null }
   * returns spectrum array on GRID (relative units: sunlight above the air has Y = SUN_XYZ.Y) */
  function skySpectrum(se, ve, va, atm) {
    const air = atm.air == null ? 1 : atm.air, cosT = scatterAngleCos(se, ve, va);
    const m0 = airMass(se), m = airMass(ve), out = new Array(GRID.length);
    for (let i = 0; i < GRID.length; i++) {
      const l = GRID[i], tr = rayleighTau(l) * air;
      let td = 0, tsd = 0, pd = 0;
      if (atm.dust && atm.dustTau > 0) { const o = dustAt(atm.dust, l, cosT); td = atm.dustTau * o.ext; tsd = td * o.w; pd = o.p; }
      const tau = tr + td, src = (tr * rayPhase(cosT) + tsd * pd) / (4 * Math.PI);
      // src already carries τᵢ, so the geometric factor is divided by τ; at m = m₀ it tends to m·e^{−τm}
      let geo;
      if (tau <= 0) geo = 0;
      else if (Math.abs(m - m0) < 1e-6) geo = m * Math.exp(-tau * m);
      else geo = m * (Math.exp(-tau * m0) - Math.exp(-tau * m)) / ((m - m0) * tau);
      out[i] = planck(l) * src * geo;
    }
    return out;
  }

  /* ───────── 7 · Mie scattering by a sphere (Bohren & Huffman BHMIE) ───────── */
  const cx = (re, im = 0) => ({ re, im });
  const cadd = (a, b) => cx(a.re + b.re, a.im + b.im), csub = (a, b) => cx(a.re - b.re, a.im - b.im);
  const cmul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const cdiv = (a, b) => { const d = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const cscale = (a, s) => cx(a.re * s, a.im * s);
  const cabs2 = a => a.re * a.re + a.im * a.im;
  /* x = size parameter 2πr/λ, m = complex refractive index {re, im} (im ≥ 0 means absorbing).
   * Returns { qext, qsca, an, bn } (coefficients kept for phase functions). */
  function mie(x, m) {
    const nstop = Math.round(x + 4 * Math.cbrt(x) + 2);
    const y = cmul(m, cx(x)), ymod = Math.hypot(y.re, y.im), nmx = Math.round(Math.max(nstop, ymod)) + 15;
    const D = new Array(nmx + 1); D[nmx] = cx(0);
    for (let n = nmx; n > 0; n--) { const ny = cdiv(cx(n), y); D[n - 1] = csub(ny, cdiv(cx(1), cadd(D[n], ny))); }
    let psi0 = Math.cos(x), psi1 = Math.sin(x), chi0 = -Math.sin(x), chi1 = Math.cos(x);
    let xi1 = cx(psi1, -chi1), qsca = 0, qext = 0; const an = [], bn = [];
    for (let n = 1; n <= nstop; n++) {
      const psi = (2 * n - 1) / x * psi1 - psi0, chi = (2 * n - 1) / x * chi1 - chi0, xi = cx(psi, -chi);
      const da = cadd(cdiv(D[n], m), cx(n / x)), db = cadd(cmul(m, D[n]), cx(n / x));
      const a = cdiv(csub(cscale(da, psi), cx(psi1)), csub(cmul(da, xi), xi1));
      const b = cdiv(csub(cscale(db, psi), cx(psi1)), csub(cmul(db, xi), xi1));
      an.push(a); bn.push(b);
      qsca += (2 * n + 1) * (cabs2(a) + cabs2(b)); qext += (2 * n + 1) * (a.re + b.re);
      psi0 = psi1; psi1 = psi; chi0 = chi1; chi1 = chi; xi1 = cx(psi1, -chi1);
    }
    return { qext: 2 / (x * x) * qext, qsca: 2 / (x * x) * qsca, an, bn, x };
  }
  // phase function P(Θ) normalised so that its average over the sphere is 1 (Rayleigh: 0.75(1 + cos²Θ))
  function miePhase(res, mu) {
    let pi0 = 0, pi1 = 1, s1 = cx(0), s2 = cx(0);
    for (let n = 1; n <= res.an.length; n++) {
      const tau = n * mu * pi1 - (n + 1) * pi0, f = (2 * n + 1) / (n * (n + 1));
      s1 = cadd(s1, cscale(cadd(cscale(res.an[n - 1], pi1), cscale(res.bn[n - 1], tau)), f));
      s2 = cadd(s2, cscale(cadd(cscale(res.an[n - 1], tau), cscale(res.bn[n - 1], pi1)), f));
      const p = ((2 * n + 1) * mu * pi1 - (n + 1) * pi0) / n; pi0 = pi1; pi1 = p;
    }
    return 2 * (cabs2(s1) + cabs2(s2)) / (res.qsca * res.x * res.x);
  }
  /* A narrow spread of sizes around r (log-normal, σ_ln = 0.15, 7 points) so single-size ripples do not dominate. */
  const SPREAD = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map(z => ({ f: Math.exp(0.15 * z), w: Math.exp(-z * z / 2) }));
  // dust: a wide spread (σ_ln = 0.4, 9 points), as natural dust is far from one size
  const DUST_SPREAD = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map(z => ({ f: Math.exp(0.4 * z), w: Math.exp(-z * z / 2) }));
  // area-weighted efficiencies for radius r (µm) at wavelength l (nm) and index m
  function mieAvg(r, l, m) {
    let A = 0, ext = 0, sca = 0;
    for (const s of SPREAD) { const rr = r * s.f, area = rr * rr * s.w, q = mie(2 * Math.PI * rr * 1000 / l, m); A += area; ext += area * q.qext; sca += area * q.qsca; }
    return { qext: ext / A, qsca: sca / A };
  }
  const WATER = cx(1.33, 0);

  /* Dust optics table for the sky model: per wavelength, extinction relative to 550 nm, single-scattering albedo, and the
   * phase function on a 1° grid. Index m(λ) = 1.5 + i·k(λ). */
  function dustOptics(r, kfun) {
    const ls = []; for (let l = 380; l <= 780; l += 25) ls.push(l);
    const rows = ls.map(l => {
      const m = cx(1.5, kfun(l)); let A = 0, ext = 0, sca = 0; const ph = new Array(181).fill(0);
      for (const s of DUST_SPREAD) {
        const rr = r * s.f, area = rr * rr * s.w, q = mie(2 * Math.PI * rr * 1000 / l, m);
        A += area; ext += area * q.qext; sca += area * q.qsca;
        for (let a = 0; a <= 180; a++) ph[a] += area * q.qsca * miePhase(q, Math.cos(a * Math.PI / 180));
      }
      return { l, ext: ext / A, w: sca / ext, ph: ph.map(v => v / sca) };
    });
    const e550 = (() => { const i = rows.findIndex(q => q.l >= 550); const a = rows[i - 1], b = rows[i], u = (550 - a.l) / (b.l - a.l); return a.ext + (b.ext - a.ext) * u; })();
    rows.forEach(q => { q.rel = q.ext / e550; });
    return { r, rows };
  }
  function dustAt(tab, l, cosT) {
    const rows = tab.rows; let i = Math.min(rows.length - 2, Math.max(0, Math.floor((l - 380) / 25)));
    const a = rows[i], b = rows[i + 1], u = clamp((l - a.l) / (b.l - a.l), 0, 1);
    const ang = Math.acos(clamp(cosT, -1, 1)) * 180 / Math.PI, j = Math.min(179, Math.floor(ang)), v = ang - j;
    const pa = a.ph[j] + (a.ph[j + 1] - a.ph[j]) * v, pb = b.ph[j] + (b.ph[j + 1] - b.ph[j]) * v;
    return { ext: a.rel + (b.rel - a.rel) * u, w: a.w + (b.w - a.w) * u, p: pa + (pb - pa) * u };
  }
  /* Mars: Rayleigh optical depth of the CO2 atmosphere ≈ 0.01 at 440 nm at Gale crater (Lemmon et al. 2024); scaled
   * with Earth's wavelength dependence. Dust effective radius 1.5 µm (Chen-Chen et al. 2019 range 0.8–1.5 µm).
   * The blue-absorbing imaginary index below is ILLUSTRATIVE (shape only: dust absorbs blue more than red). */
  const MARS_AIR = 0.01 / rayleighTau(440);
  const marsK = l => 0.0015 + 0.010 * Math.exp(-(l - 380) / 70);
  const greyK = () => 0;

  /* ───────── per-chapter states: what the page shows and the tests pin ───────── */
  const pct = x => x * 100;
  // ch1: the share of a vertical beam scattered on the way down
  function ch1State(air) {
    const b = scatteredOnce(450, air), r = scatteredOnce(650, air);
    return { b: pct(b), r: pct(r), ratio: r > 0 ? b / r : NaN };
  }
  // ch2: oscillator
  function ch2State(l, lr) {
    return { rel: oscRel(l, 700, lr), blueRed: oscRel(450, 700, lr), exp: Math.log(oscRel(450, 700, lr)) / Math.log(700 / 450) };
  }
  // ch3: spectra
  function ch3State(T) {
    const f = scattered(T, 4);
    return { sunPeak: wienPeak(T), skyPeak: peakOf(f, 100, 3000, 0.5), violet: pct(bandShare(f, 380, 450)), blue: pct(bandShare(f, 450, 495)),
      sunViolet: pct(bandShare(l => planck(l, T), 380, 450)) };
  }
  // ch4: what the eye makes of scattered sunlight
  function ch4State(n, cut) {
    const f = scattered(T_SUN, n, cut), c = toXYZ(f), d = dominant(c), d0 = dominant(toXYZ(scattered(T_SUN, n, 380)));
    const yOf = (a, b) => integrate(l => f(l) * cmf(l).y, a, b);
    return { xyz: c, dom: d.l, purity: pct(d.purity), purple: d.purple, dom0: d0.l,
      violetEnergy: pct(bandShare(f, 380, 450)), violetBright: pct(yOf(380, 450) / yOf(380, 780)) };
  }
  // ch5: the setting sun
  function ch5State(elev) {
    const c = toXYZ(sunSpectrum(elev)), d = dominant(c);
    return { m: airMass(elev), b: pct(transmit(450, elev)), r: pct(transmit(650, elev)), xyz: c, dom: d.l, purity: pct(d.purity), purple: d.purple };
  }
  // one point of the sky
  function skyPoint(se, ve, va, atm) { const c = toXYZ(skySpectrum(se, ve, va, atm)), d = dominant(c); return { xyz: c, Y: c.Y / SUN_XYZ.Y, dom: d.l, purity: pct(d.purity), purple: d.purple }; }
  const HORIZON_VIEW = 2; // the "horizon" readout looks 2° above the horizon, away from the sun
  // ch6: Earth's clear sky
  function ch6State(se) {
    const atm = { air: 1 }, z = skyPoint(se, 90, 0, atm), h = skyPoint(se, HORIZON_VIEW, 180, atm), noon = skyPoint(60, 90, 0, atm);
    return { zen: z, hor: h, k: h.Y / z.Y, zenRel: pct(z.Y / noon.Y), noonPurity: noon.purity };
  }
  /* The sky as a grid: azimuth from the sun −180…180 (cols), elevation 0…90 (rows, row 0 at the top).
   * Returns XYZ per cell plus the brightest cell more than 20° from the sun (for the exposure). */
  function skyGrid(se, atm, cols, rows) {
    const cells = new Array(cols * rows); let maxY = 0;
    for (let j = 0; j < rows; j++) {
      const ve = 90 - (j + 0.5) * 90 / rows;
      for (let i = 0; i < cols; i++) {
        const va = -180 + (i + 0.5) * 360 / cols, c = toXYZ(skySpectrum(se, ve, va, atm));
        cells[j * cols + i] = c;
        if (Math.acos(clamp(scatterAngleCos(se, ve, va), -1, 1)) > 20 * Math.PI / 180 && c.Y > maxY) maxY = c.Y;
      }
    }
    return { cells, maxY, cols, rows };
  }
  // ch7: water droplets of radius r (µm)
  function ch7State(r) {
    const at = l => mieAvg(r, l, WATER), q550 = at(550), q450 = at(450), q650 = at(650);
    const qs = GRID.map(l => at(l));
    const scat = toXYZ(GRID.map((l, i) => planck(l) * qs[i].qsca));
    const sun = toXYZ(GRID.map((l, i) => planck(l) * Math.exp(-qs[i].qext / q550.qext))); // through a layer of optical depth 1 at 550 nm
    const ds = dominant(scat), dt = dominant(sun);
    return { x550: 2 * Math.PI * r * 1000 / 550, ratio: q450.qsca / q650.qsca, extRatio: q450.qext / q650.qext, q550: q550.qext, qs,
      scat, sun, scatDom: ds.l, scatPurity: pct(ds.purity), scatPurple: ds.purple, sunDom: dt.l, sunPurity: pct(dt.purity), sunPurple: dt.purple };
  }
  const radiusOf = v => 0.01 * Math.pow(10, v / 20); // ch7 slider 0…66 → 0.01…19.95 µm
  // ch8: a planet's sky
  let dustAbs = null, dustGrey = null;
  const dustTable = abs => abs ? (dustAbs = dustAbs || dustOptics(1.5, marsK)) : (dustGrey = dustGrey || dustOptics(1.5, greyK));
  function planetAtm(planet, dustTau, abs) { return { air: planet === 'mars' ? MARS_AIR : 1, dustTau, dust: dustTau > 0 ? dustTable(abs) : null }; }
  const NEAR_SUN = 3; // the "near the sun" readout looks 3° above the sun
  function ch8State(planet, dustTau, abs, se) {
    const atm = planetAtm(planet, dustTau, abs), earthClear = skyPoint(se, 90, 0, { air: 1 });
    const z = skyPoint(se, 90, 0, atm), near = skyPoint(se, Math.min(90, se + NEAR_SUN), 0, atm);
    const tauAt = l => rayleighTau(l) * atm.air + (atm.dust ? dustTau * dustAt(atm.dust, l, 1).ext : 0);
    const sunC = toXYZ(l => planck(l) * Math.exp(-tauAt(l) * airMass(se))), sd = dominant(sunC);
    return { atm, zen: z, near, yRel: pct(z.Y / earthClear.Y), sun: sunC, sunDom: sd.l, sunPurity: pct(sd.purity), sunPurple: sd.purple };
  }
  // ch9: how much sky light has been scattered more than once (Monte Carlo, seeded)
  const MS_N = 200000, MS_SEED = 7; // 200k photons per colour: the seed-7 readouts sit within about half a point of a converged run
  function ch9State(elev, air) {
    const st = [450, 550, 650].map(l => photonStats(l, air, elev, MS_N, MS_SEED));
    const multi = s => pct((s.byK[2] + s.byK[3]) / Math.max(1, s.sky));
    return { st, b: multi(st[0]), g: multi(st[1]), r: multi(st[2]), br: st[0].sky / Math.max(1, st[2].sky) };
  }

  /* ───────── which live sentence each state gets (the page and the tests both use these) ───────── */
  const say = {
    ch1: air => air === 0 ? 'ch1.say.none' : air >= 2.5 ? 'ch1.say.thick' : 'ch1.say.some',
    ch2: (l, s) => Math.abs(l - 700) < 3 ? 'ch2.say.base' : s.exp < 4.25 ? 'ch2.say.far' : 'ch2.say.near',
    ch3: s => s.skyPeak < 380 ? 'ch3.say.uv' : 'ch3.say.vis',
    ch4: (s, cut) => s.purity < 2 ? 'ch4.say.white' : cut <= 380 ? 'ch4.say.full' : Math.abs(s.dom - s.dom0) < 3 ? 'ch4.say.cutsmall' : 'ch4.say.cutbig',
    ch5: s => s.purity < 15 ? 'ch5.say.white' : s.purity < 50 ? 'ch5.say.yellow' : s.purity < 90 ? 'ch5.say.orange' : 'ch5.say.deep',
    ch6: s => s.hor.purity < s.zen.purity ? 'ch6.say.day' : 'ch6.say.low',
    ch7: s => s.x550 < 0.5 ? 'ch7.say.tiny' : s.ratio <= 0.85 ? 'ch7.say.bluesun' : s.x550 >= 20 ? 'ch7.say.white' : s.ratio >= 1.15 && s.x550 < 6 ? 'ch7.say.mid' : 'ch7.say.wobble',
    ch8(planet, dust, abs, s) {
      const z = s.zen, blue = !z.purple && z.dom < 495 && z.purity >= 5;
      const dustWins = dust > rayleighTau(550) * (planet === 'mars' ? MARS_AIR : 1);
      let key;
      if (dust < 0.02) key = planet === 'mars' ? 'ch8.say.marsclear' : 'ch8.say.earthclear';
      else if (blue) key = 'ch8.say.blue';
      else if (dustWins && abs && !z.purple && z.dom >= 560 && z.purity >= 8) key = 'ch8.say.tan';
      else if (dustWins && z.purity < 15) key = 'ch8.say.white';
      else key = 'ch8.say.other';
      const near = dust >= 0.02 && (z.purple || z.dom >= 495) && !s.near.purple && s.near.dom < 495 && s.near.purity >= 5;
      return { key, near };
    }
  };

  return {
    say,
    ch1State, ch2State, ch3State, ch4State, ch5State, ch6State, ch7State, ch8State, ch9State, skyPoint, skyGrid, radiusOf, planetAtm, dustTable,
    HORIZON_VIEW, NEAR_SUN, MS_N, MS_SEED,
    clamp, GRID, T_SUN, planck, wienPeak, rayleighTau, effExponent,
    LAMBDA_R, oscPower, oscAmp, oscRel,
    cmf, toXYZ, xy, dominant, rgb, spectralRGB, SUN_XYZ, SUN_XY, LOCUS,
    integrate, peakOf, scattered, bandShare,
    rng, photon, photonStats, scatteredOnce,
    airMass, transmit, sunSpectrum, elevForShare,
    rayPhase, scatterAngleCos, skySpectrum,
    mie, miePhase, mieAvg, WATER, cx, dustOptics, dustAt, MARS_AIR, marsK, greyK
  };
}));
