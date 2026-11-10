'use strict';
// Electromagnetic induction lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every line, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// SI units throughout. Coils are ideal (no self-inductance unless stated), fields are prescribed.
(function (root) {
  const MU0 = 4e-7 * Math.PI;

  // ---- step 0: flux through a flat coil in a uniform field ----
  // θ = angle between B and the coil's normal. Φ = B·S·cosθ (sign: which face the field enters).
  function flux(B, S, thetaDeg) { return B * S * Math.cos(thetaDeg * Math.PI / 180); }

  // Side-view picture: vertical field lines spaced LINE_CM / B centimetres apart, placed symmetrically about the
  // coil centre at (k + ½)·spacing. The lines that pass through the coil are those inside its projected width
  // w = a·|cosθ| (the coil's extent across the field).
  const LINE_CM = 1.2;
  function slice(B, aCm, thetaDeg) {
    const spacing = LINE_CM / B, w = aCm * Math.abs(Math.cos(thetaDeg * Math.PI / 180));
    const n = 2 * Math.max(0, Math.ceil(w / 2 / spacing - 0.5 - 1e-9)); // lines strictly inside the band
    return { spacing, w, n };
  }

  // ---- step 1: B ramps 0 → Bmax over τ (starting t1), holds, ramps back over τ (starting t2) ----
  const RAMP = { t1: 0.3, t2: 2.6, T: 4 };
  function Bramp(Bmax, tau, t) {
    const { t1, t2 } = RAMP;
    if (t < t1) return 0;
    if (t < t1 + tau) return Bmax * (t - t1) / tau;
    if (t < t2) return Bmax;
    if (t < t2 + tau) return Bmax * (1 - (t - t2) / tau);
    return 0;
  }
  // Faraday: ε = −N dΦ/dt, Φ = B·S (field along the coil normal).
  function emfRamp(N, S, Bmax, tau, t) {
    const { t1, t2 } = RAMP;
    if (t >= t1 && t < t1 + tau) return -N * S * Bmax / tau;
    if (t >= t2 && t < t2 + tau) return N * S * Bmax / tau;
    return 0;
  }
  // numeric ∫ε dt over [a, b] (midpoint rule) — the page shades this area
  function emfArea(N, S, Bmax, tau, a, b, n = 20000) {
    let s = 0; const h = (b - a) / n;
    for (let i = 0; i < n; i++) s += emfRamp(N, S, Bmax, tau, a + (i + 0.5) * h) * h;
    return s;
  }

  // ---- step 2: a bar magnet (point dipole, moment m along +z or −z) passing along the axis of a loop ----
  // Flux of a point dipole through a coaxial loop of radius a at axial distance z: μ0 m a² / (2 (a² + z²)^{3/2}).
  // Positive flux = along +z (the direction the magnet travels). pole = +1: N end leads (moment along +z).
  const MAG = { m: 1.0, a: 0.02, N: 100, zMax: 0.08 };
  function dipoleFlux(z, pole = 1, m = MAG.m, a = MAG.a) { return pole * MU0 * m * a * a / (2 * Math.pow(a * a + z * z, 1.5)); }
  function dFluxDz(z, pole = 1, m = MAG.m, a = MAG.a) { return pole * MU0 * m * a * a / 2 * (-1.5) * 2 * z / Math.pow(a * a + z * z, 2.5); }
  // Magnet centre at z (relative to the coil), moving at +v along z: ε = −N dΦ/dt = −N (dΦ/dz_rel)·(dz_rel/dt).
  // The coil sees the magnet at relative position z, so Φ_coil(z) = dipoleFlux(−z) = dipoleFlux(z) (even in z),
  // and dΦ/dt = dΦ/dz · v.
  function magnetEmf(z, v, pole = 1) { return -MAG.N * dFluxDz(z, pole) * v; }
  // Lenz bookkeeping from the sign of ε. Current sense +1 = right-handed about +z.
  // Induced field at the coil centre is along +z for sense +1. The face of the coil nearest the magnet behaves
  // like the pole the induced field leaves from on that side.
  function lenz(z, v, pole = 1) {
    const e = magnetEmf(z, v, pole), dphi = dFluxDz(z, pole) * v; // dΦ/dt
    if (Math.abs(e) < 1e-12) return { emf: 0, sense: 0, inducedB: 0, nearFace: null, opposes: true, dphi: 0 };
    const sense = Math.sign(e), inducedB = sense; // +1 → +z
    // magnet on the −z side when z < 0: the near face is the −z face. A field along +z enters at −z (S) and leaves at +z (N).
    const nearSide = z < 0 ? -1 : 1;
    const nearFace = inducedB === nearSide ? 'N' : 'S';
    // the magnet's pole facing the coil
    const magnetFacing = (z < 0 ? pole : -pole) > 0 ? 'N' : 'S';
    const repel = nearFace === magnetFacing;
    // opposes the relative motion: approaching (z·v < 0) → repel; leaving (z·v > 0) → attract
    const approaching = z * v < 0;
    // force of the coil on the magnet (direction along z only): repel pushes it away from the coil, attract pulls it back
    const force = repel ? Math.sign(z) : -Math.sign(z);
    return { emf: e, sense, inducedB, nearFace, magnetFacing, repel, approaching, opposes: approaching === repel, dphi, force };
  }

  // ---- step 3: a rod released on rails (B ⟂ plane, rail spacing L, resistor R, rod mass m, no friction) ----
  // m dv/dt = −B²L² v / R → v = v0 e^{−t/τ}, τ = mR/(B²L²); x = v0 τ (1 − e^{−t/τ}).
  const ROD = { B: 1, L: 0.5, m: 0.1 };
  function rod(v0, R, t) {
    const { B, L, m } = ROD, tau = m * R / (B * B * L * L), e = Math.exp(-t / tau), v = v0 * e;
    const emf = B * L * v, I = emf / R, F = B * I * L;
    return { tau, v, x: v0 * tau * (1 - e), emf, I, F, heat: 0.5 * m * (v0 * v0 - v * v), xMax: v0 * tau, P: emf * I };
  }
  // independent check: integrate the ODE with small Euler-Cromer steps and the Joule heat ∫I²R dt
  function rodNumeric(v0, R, tEnd, n = 200000) {
    const { B, L, m } = ROD; let v = v0, x = 0, heat = 0; const h = tEnd / n;
    for (let i = 0; i < n; i++) { const I = B * L * v / R; heat += I * I * R * h; v += -B * I * L / m * h; x += v * h; }
    return { v, x, heat };
  }

  // ---- step 4: a coil of N turns, area S, spinning at frequency f in a uniform B ----
  // Angle between B and the normal: ωt. Φ = BS cos ωt per turn; ε = −N dΦ/dt = NBSω sin ωt.
  function generator(N, B, S, f, t) {
    const w = 2 * Math.PI * f, peak = N * B * S * w;
    return { w, phi: B * S * Math.cos(w * t), emf: peak * Math.sin(w * t), peak, rms: peak / Math.SQRT2 };
  }
  function rmsNumeric(N, B, S, f, n = 100000) {
    let s = 0; for (let i = 0; i < n; i++) { const e = generator(N, B, S, f, (i + 0.5) / n / f).emf; s += e * e; } return Math.sqrt(s / n);
  }

  const api = { MU0, flux, LINE_CM, slice, RAMP, Bramp, emfRamp, emfArea, MAG, dipoleFlux, dFluxDz, magnetEmf, lenz, ROD, rod, rodNumeric, generator, rmsNumeric };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EMI_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
