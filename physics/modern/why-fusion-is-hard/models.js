/* Why is fusion always thirty years away? — the models behind every number on the page.
   UMD: window.FusionModels in the browser, module.exports in node (tests/models.cjs).
   Each block names the standard result it implements; sources are listed in BRIEF.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FusionModels = factory();
}(this, function () {
'use strict';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

/* ───────── physical constants (CODATA 2018) ───────── */
const K = {
  e: 1.602176634e-19,          // C
  u: 1.66053906660e-27,        // kg
  uMeV: 931.49410242,          // MeV per u
  me: 9.1093837015e-31,        // kg
  hbar: 1.054571817e-34,       // J s
  mu0: 1.25663706212e-6,       // H/m
  keV: 1.602176634e-16,        // J per keV
  MeV: 1.602176634e-13,        // J per MeV
  kelvinPerKeV: 1.160451812e7, // K per keV
  year: 365.25 * 86400,        // s
  coal: 29.3076e6              // J/kg, 1 kg of standard coal equivalent (kgce, definitional)
};

/* ───────── 01 binding energy from atomic masses (AME2020) ─────────
   B/A = (Z·m(¹H) + N·m_n − m_atom)·c² / A, using atomic masses so electron masses cancel. */
const NUC = {
  n:     { Z: 0,  A: 1,   m: 1.00866491595 },
  H1:    { Z: 1,  A: 1,   m: 1.00782503223 },
  H2:    { Z: 1,  A: 2,   m: 2.01410177812 },
  H3:    { Z: 1,  A: 3,   m: 3.01604928 },
  He3:   { Z: 2,  A: 3,   m: 3.01602932265 },
  He4:   { Z: 2,  A: 4,   m: 4.00260325413 },
  Li6:   { Z: 3,  A: 6,   m: 6.0151228874 },
  Li7:   { Z: 3,  A: 7,   m: 7.016003434 },
  B11:   { Z: 5,  A: 11,  m: 11.00930536 },
  C12:   { Z: 6,  A: 12,  m: 12 },
  O16:   { Z: 8,  A: 16,  m: 15.99491461957 },
  Fe56:  { Z: 26, A: 56,  m: 55.93493633 },
  Ni62:  { Z: 28, A: 62,  m: 61.92834537 },
  Kr92:  { Z: 36, A: 92,  m: 91.9261731 },
  Ba141: { Z: 56, A: 141, m: 140.9144033 },
  U235:  { Z: 92, A: 235, m: 235.0439281 },
  U238:  { Z: 92, A: 238, m: 238.0507884 }
};
function bindingPerA(id) {
  const x = NUC[id]; if (x.A === 1) return 0;
  return (x.Z * NUC.H1.m + (x.A - x.Z) * NUC.n.m - x.m) * K.uMeV / x.A;
}
// fuel: the nuclei that must be bought and burned (the neutron that starts fission is not fuel)
const REACTIONS = {
  dt:   { lhs: ['H2', 'H3'],  rhs: ['He4', 'n'],              fuel: ['H2', 'H3'],  Z: [1, 1], A: [2, 3] },
  ddn:  { lhs: ['H2', 'H2'],  rhs: ['He3', 'n'],              fuel: ['H2', 'H2'],  Z: [1, 1], A: [2, 2] },
  ddp:  { lhs: ['H2', 'H2'],  rhs: ['H3', 'H1'],              fuel: ['H2', 'H2'],  Z: [1, 1], A: [2, 2] },
  dhe3: { lhs: ['H2', 'He3'], rhs: ['He4', 'H1'],             fuel: ['H2', 'He3'], Z: [1, 2], A: [2, 3] },
  pb11: { lhs: ['H1', 'B11'], rhs: ['He4', 'He4', 'He4'],     fuel: ['H1', 'B11'], Z: [1, 5], A: [1, 11] },
  u235: { lhs: ['n', 'U235'], rhs: ['Ba141', 'Kr92', 'n', 'n', 'n'], fuel: ['U235'], Z: null, A: null },
  // tritium breeding in the blanket
  li6:  { lhs: ['Li6', 'n'],  rhs: ['H3', 'He4'],             fuel: ['Li6'], Z: null, A: null },
  li7:  { lhs: ['Li7', 'n'],  rhs: ['H3', 'He4', 'n'],        fuel: ['Li7'], Z: null, A: null }
};
const sumM = ids => ids.reduce((s, id) => s + NUC[id].m, 0);
function qValue(r) { const R = REACTIONS[r]; return (sumM(R.lhs) - sumM(R.rhs)) * K.uMeV; } // MeV
function energyPerKg(r) { return qValue(r) * K.MeV / (sumM(REACTIONS[r].fuel) * K.u); }       // J per kg of fuel
function coalEquivalent(r) { return energyPerKg(r) / K.coal; }                                   // kg of coal per kg of fuel
// D–T: momentum sharing between the alpha and the neutron (non-relativistic two-body split)
function dtSplit() {
  const Q = qValue('dt'), ma = NUC.He4.m, mn = NUC.n.m;
  return { Q, alpha: Q * mn / (ma + mn), neutron: Q * ma / (ma + mn) };
}
// fuel burned by a plant of P watts of fusion power: reactions/s and tritium mass per day and per year
function burnRate(P) {
  const per = P / (qValue('dt') * K.MeV), mT = NUC.H3.m * K.u;
  return { reactions: per, tDay: per * mT * 86400, tYear: per * mT * K.year };
}

/* ───────── 02 Coulomb barrier and the Maxwell–Boltzmann tail ─────────
   V = 1.44·Z1Z2 / r  MeV·fm, touching radius r = 1.2(A1^⅓ + A2^⅓) fm.
   Fraction of a Maxwellian (energy distribution, 3 degrees of freedom) above E: erfc(√x) + 2√(x/π)e^{−x}, x = E/kT. */
function barrier(r) { const R = REACTIONS[r]; const rr = 1.2 * (Math.cbrt(R.A[0]) + Math.cbrt(R.A[1])); return { MeV: 1.44 * R.Z[0] * R.Z[1] / rr, fm: rr }; }
// erfc with fractional error < 1.2e-7 everywhere (Numerical Recipes erfcc, Chebyshev fit); returns ln(erfc) for large x
function lnErfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const lnr = Math.log(t) - z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))));
  return x >= 0 ? lnr : Math.log(2 - Math.exp(lnr));
}
function log10Tail(E, T) { // log10 of the fraction of particles above energy E (same units as T)
  const x = E / T, a = lnErfc(Math.sqrt(x)), b = Math.log(2 * Math.sqrt(x / Math.PI)) - x;
  const m = Math.max(a, b); return (m + Math.log(Math.exp(a - m) + Math.exp(b - m))) / Math.LN10;
}
function mbDensity(E, T) { return 2 * Math.sqrt(E / Math.PI) * Math.pow(T, -1.5) * Math.exp(-E / T); } // per unit energy

/* ───────── 03 Gamow factor, Gamow peak, Bosch–Hale reactivity ─────────
   Tunnelling probability ≈ exp(−√(E_G/E)), E_G = B_G² (keV). The product with the Maxwellian exp(−E/kT) peaks at
   E0 = (E_G·T²/4)^⅓ with 1/e width Δ = 4/√3·√(E0·T).  Reactivity: Bosch & Hale, Nucl. Fusion 32 (1992) 611. */
const BH = {
  dt:   { BG: 34.3827, mc2: 1124656, C: [1.17302e-9, 1.51361e-2, 7.51886e-2, 4.60643e-3, 1.35e-2, -1.0675e-4, 1.366e-5] },
  dhe3: { BG: 68.7508, mc2: 1124572, C: [5.51036e-10, 6.41918e-3, -2.02896e-3, -1.9108e-5, 1.35776e-4, 0, 0] },
  ddp:  { BG: 31.3970, mc2: 937814,  C: [5.65718e-12, 3.41267e-3, 1.99167e-3, 0, 1.0506e-5, 0, 0] },
  ddn:  { BG: 31.3970, mc2: 937814,  C: [5.43360e-12, 5.85778e-3, 7.68222e-3, 0, -2.964e-6, 0, 0] }
};
function gamowEnergy(r) { return BH[r].BG * BH[r].BG; }  // keV
function gamowPeak(r, T) { const EG = gamowEnergy(r), E0 = Math.cbrt(EG * T * T / 4); return { E0, width: 4 / Math.sqrt(3) * Math.sqrt(E0 * T) }; }
function gamowIntegrand(r, E, T) { return Math.exp(-E / T - Math.sqrt(gamowEnergy(r) / E)); }
function tunnel(r, E) { return Math.exp(-Math.sqrt(gamowEnergy(r) / E)); }
function sigmaV(r, T) { // cm³/s, valid 0.2–100 keV
  if (r === 'dd') return sigmaV('ddp', T) + sigmaV('ddn', T);
  const p = BH[r], c = p.C;
  const theta = T / (1 - T * (c[1] + T * (c[3] + T * c[5])) / (1 + T * (c[2] + T * (c[4] + T * c[6]))));
  const xi = Math.cbrt(p.BG * p.BG / (4 * theta));
  return c[0] * theta * Math.sqrt(xi / (p.mc2 * T * T * T)) * Math.exp(-3 * xi);
}
// D–T cross-section from the Bosch–Hale S-factor fit (centre-of-mass energy E in keV, 0.5–550 keV), millibarn
function sigmaDT(E) {
  const A = [6.927e4, 7.454e8, 2.05e6, 5.2002e4, 0], B = [63.8, -0.995, 6.981e-5, 1.728e-4];
  const S = (A[0] + E * (A[1] + E * (A[2] + E * (A[3] + E * A[4])))) / (1 + E * (B[0] + E * (B[1] + E * (B[2] + E * B[3]))));
  return S / (E * Math.exp(BH.dt.BG / Math.sqrt(E)));
}
// ⟨σv⟩ by direct integration over a Maxwellian of relative energies (check on the fit above), cm³/s
function sigmaVIntegrated(T, Emax = 550) {
  const mr = BH.dt.mc2 * K.keV / (299792458 * 299792458); // reduced mass, kg
  let s = 0; const n = 20000, h = (Emax - 0.5) / n;
  for (let i = 0; i <= n; i++) { const E = 0.5 + i * h, w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); s += w * sigmaDT(E) * 1e-31 * E * Math.exp(-E / T); }
  s *= h / 3 * K.keV * K.keV; // ∫σ E e^{−E/T} dE  in m²·J²
  return Math.sqrt(8 / (Math.PI * mr)) * Math.pow(T * K.keV, -1.5) * s * 1e6;
}

/* ───────── 04 power balance and the Lawson triple product ─────────
   Steady state, 50:50 D–T, flat profiles, T_e = T_i, Z_eff = 1:
   P_fus = n²/4·⟨σv⟩·E_fus, P_α = P_fus·E_α/E_fus, P_brems = C_B·n²·√T, conduction loss P_L = 3nT/τ_E.
   With external heating P_h: P_h + P_α = P_L + P_brems, Q = P_fus/P_h ⇒
   n·T·τ_E = 3T² / [⟨σv⟩/4·(E_fus/Q + E_α) − C_B√T];  ignition is Q → ∞. (Lawson 1957; Wesson, Tokamaks, ch. 1) */
const CB = 5.35e-37;  // W m³ keV^-½ (bremsstrahlung, Z = 1)
function fusionEnergies() { const s = dtSplit(); return { Ef: s.Q * K.MeV, Ea: s.alpha * K.MeV }; }
function tripleFor(T, Q) {  // keV s m^-3; Infinity where unreachable
  const { Ef, Ea } = fusionEnergies(), sv = sigmaV('dt', T) * 1e-6;
  // C_B is in W m³ keV^-½, so the bremsstrahlung term is already in J m³/s
  const d = sv / 4 * ((isFinite(Q) ? Ef / Q : 0) + Ea) - CB * Math.sqrt(T);
  return d > 0 ? 3 * T * T * K.keV / d : Infinity;
}
function qAt(T, ntt) {   // Q for a plasma at temperature T (keV) and triple product ntt (keV s m^-3)
  const { Ef, Ea } = fusionEnergies(), sv = sigmaV('dt', T) * 1e-6, ntau = ntt / T;
  const heat = 3 * T * K.keV / ntau + CB * Math.sqrt(T) - sv * Ea / 4;
  return heat <= 0 ? Infinity : sv * Ef / 4 / heat;
}
function minTriple(Q) { let best = { T: 0, ntt: Infinity }; for (let T = 3; T <= 100; T += 0.05) { const v = tripleFor(T, Q); if (v < best.ntt) best = { T, ntt: v }; } return best; }
function bremsCrossover() { // the "ideal ignition" temperature: alpha heating equals bremsstrahlung with no conduction loss
  const { Ea } = fusionEnergies(); let lo = 1, hi = 20;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (sigmaV('dt', m) * 1e-6 * Ea / 4 > CB * Math.sqrt(m)) ? hi = m : lo = m; }
  return (lo + hi) / 2;
}

/* ───────── 05 guiding-centre orbits in a tokamak field ─────────
   Large-aspect-ratio field: B_φ = B0·R0/R, poloidal field B_θ = B0·r/(q·R0) (q held constant across the radius).
   Guiding centre (Northrop 1963; Chen, Introduction to Plasma Physics, ch. 2): velocity v∥·b + v_d with the combined
   curvature + grad-B drift v_d = (m/(qB R))·(v∥² + v⊥²/2), vertical; μ = m v⊥²/(2B) conserved; mirror force
   dv∥/dt = −(μ/m)·b·∇B. RK4, step scaled by the particle's transit time. */
const MACH = { R0: 6.2, a: 2.0, B0: 5.3, r0: 1.0 }; // ITER-sized field, start on the outboard midplane at r0
const SPECIES = {
  D:     { m: 2.01410177812 * K.u - K.me, q: 1,  E: 10 },     // keV
  e:     { m: K.me,                        q: -1, E: 10 },
  alpha: { m: 4.00260325413 * K.u - 2 * K.me, q: 2, E: dtSplit().alpha * 1000 }
};
function particle(sp, pitch) {
  const S = SPECIES[sp], v = Math.sqrt(2 * S.E * K.keV / S.m), B = MACH.B0 * MACH.R0 / (MACH.R0 + MACH.r0);
  const vpar = v * pitch, vperp = v * Math.sqrt(Math.max(0, 1 - pitch * pitch));
  return { S, v, vpar, vperp, B, mu: S.m * vperp * vperp / (2 * B),
    larmor: S.m * vperp / (Math.abs(S.q) * K.e * B),
    vd: S.m * (vpar * vpar + vperp * vperp / 2) / (Math.abs(S.q) * K.e * B * (MACH.R0 + MACH.r0)) };
}
function noTwistWall(sp, pitch) { // without poloidal field the drift is a straight vertical line: exact
  const p = particle(sp, pitch), dz = Math.sqrt(MACH.a * MACH.a - MACH.r0 * MACH.r0);
  return { t: dz / p.vd, vd: p.vd, up: SPECIES[sp].q > 0 };
}
function orbit(sp, pitch, q, opts = {}) {
  const P = particle(sp, pitch), S = P.S, sgn = Math.sign(S.q), qe = Math.abs(S.q) * K.e;
  const { R0, a, B0 } = MACH;
  const f = (R, Z, vp) => {
    const B = B0 * R0 / R, x = R - R0, r = Math.hypot(x, Z), th = Math.atan2(Z, x);
    const Bt = B0 * r / (q * R0), Bm = Math.hypot(B, Bt);
    const bR = -(Bt / Bm) * Math.sin(th), bZ = (Bt / Bm) * Math.cos(th);
    const vperp2 = 2 * P.mu * B / S.m, vd = sgn * S.m * (vp * vp + vperp2 / 2) / (qe * B * R);
    return [vp * bR, vp * bZ + vd, (P.mu / S.m) * bR * B / R];
  };
  const transit = 2 * Math.PI * q * R0 / P.v, dt = transit / (opts.steps || 600);
  let R = R0 + MACH.r0, Z = 0, vp = P.vpar, t = 0, th0 = 0, thAcc = 0, flips = 0, lost = false;
  let rmin = MACH.r0, rmax = MACH.r0, eErr = 0;
  const pts = [[R, Z]], maxSteps = opts.maxSteps || 60000;
  const E0 = vp * vp + 2 * P.mu * B0 * R0 / R / S.m;
  for (let i = 0; i < maxSteps; i++) {
    const k1 = f(R, Z, vp), k2 = f(R + dt / 2 * k1[0], Z + dt / 2 * k1[1], vp + dt / 2 * k1[2]);
    const k3 = f(R + dt / 2 * k2[0], Z + dt / 2 * k2[1], vp + dt / 2 * k2[2]), k4 = f(R + dt * k3[0], Z + dt * k3[1], vp + dt * k3[2]);
    const vpNew = vp + dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    R += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); Z += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); t += dt;
    if (vpNew * vp < 0) flips++;
    vp = vpNew;
    const r = Math.hypot(R - R0, Z), th = Math.atan2(Z, R - R0);
    let d = th - th0; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; thAcc += d; th0 = th;
    rmin = Math.min(rmin, r); rmax = Math.max(rmax, r);
    eErr = Math.max(eErr, Math.abs((vp * vp + 2 * P.mu * B0 * R0 / R / S.m) / E0 - 1));
    if (i % 3 === 0) pts.push([R, Z]);
    if (r >= a) { lost = true; pts.push([R, Z]); break; }
    if (flips >= 4 || (flips === 0 && Math.abs(thAcc) >= 4 * Math.PI)) break;
  }
  return { pts, trapped: flips > 0, lost, t, width: rmax - rmin, rmin, rmax, energyError: eErr, larmor: P.larmor, vd: P.vd, transit };
}
// textbook estimate of a passing orbit's width: 2·q·(m/(qB))·(v∥² + v⊥²/2)/v∥  (drift × half a poloidal turn)
function passingWidthEstimate(sp, pitch, q) { const P = particle(sp, pitch); const S = P.S; return 2 * q * S.m * (P.vpar * P.vpar + P.vperp * P.vperp / 2) / (Math.abs(S.q) * K.e * P.B * P.vpar); }
function trappedPitch() { const R = MACH.R0 + MACH.r0, Rin = MACH.R0 - MACH.r0; return Math.sqrt(1 - Rin / R); } // |v∥/v| below this bounces

/* ───────── 06 sizing a tokamak: ITER98(y,2) confinement, 0-D power balance ─────────
   τ_E = 0.0562·H·I^0.93·B^0.15·P^−0.69·n19^0.41·M^0.19·R^1.97·ε^0.58·κ^0.78  (ITER Physics Basis 1999, eq. 20)
   q95 = 5a²B/(RI)·(1+κ²(1+2δ²−1.2δ³))/2·(1.17−0.65ε)/(1−ε²)²  (ITER Physics Basis / Uckan), n = f_G·I/(πa²)·1e20.
   Flat profiles, T_e = T_i, Z_eff = 1; the plasma is held at temperature T by whatever heating the balance needs. */
// design points: ITER (ITER Physics Basis; q95 = 3, n/n_G = 0.85), SPARC (Creely et al., J. Plasma Phys. 86 (2020) 865860502)
// κ here is the volume elongation (ITER 1.7; SPARC from its ≈ 20 m³ plasma volume). Changing R or B keeps the shape and q95,
// so the current scales as I ∝ a²B/R ∝ R·B.
const PRESETS = {
  iter:  { R: 6.2,  a: 2.0,  B: 5.3,  I: 15,  kappa: 1.7, fG: 0.85, T: 9 },
  sparc: { R: 1.85, a: 0.57, B: 12.2, I: 8.7, kappa: 1.7, fG: 0.35, T: 7 }
};
const MASS = 2.5, TROYON = 2.8;
function shapeFactor(eps, kappa, delta) { return (1 + kappa * kappa * (1 + 2 * delta * delta - 1.2 * Math.pow(delta, 3))) / 2 * (1.17 - 0.65 * eps) / Math.pow(1 - eps * eps, 2); }
function currentFor(R, a, B, kappa, delta, q95) { return 5 * a * a * B / (R * q95) * shapeFactor(a / R, kappa, delta); } // MA
function tokamak(p) { // p: preset name plus overrides { R, B, T, fG }
  const P0 = PRESETS[p.preset], H = p.H || 1, R = p.R || P0.R, B = p.B || P0.B, T = p.T || P0.T, fG = p.fG || P0.fG;
  const a = P0.a * R / P0.R, eps = a / R, kappa = P0.kappa;
  const I = P0.I * (R / P0.R) * (B / P0.B);
  const n = fG * I / (Math.PI * a * a) * 1e20, n19 = n / 1e19;
  const V = 2 * Math.PI * Math.PI * R * a * a * kappa;
  const { Ef, Ea } = fusionEnergies(), sv = sigmaV('dt', T) * 1e-6;
  const Pf = n * n / 4 * sv * Ef * V / 1e6, Pa = Pf * Ea / Ef, Pbr = CB * n * n * Math.sqrt(T) * V / 1e6;
  const W = 3 * n * T * K.keV * V / 1e6; // MJ
  const Kc = 0.0562 * H * Math.pow(I, 0.93) * Math.pow(B, 0.15) * Math.pow(n19, 0.41) * Math.pow(MASS, 0.19) * Math.pow(R, 1.97) * Math.pow(eps, 0.58) * Math.pow(kappa, 0.78);
  const Ploss = Math.pow(W / Kc, 1 / 0.31), tau = W / Ploss;
  const Paux = Ploss + Pbr - Pa, Q = Paux <= 0 ? Infinity : Pf / Paux;
  const beta = 2 * K.mu0 * 2 * n * T * K.keV / (B * B), betaN = beta * 100 * a * B / I;
  return { R, a, B, I, n, V, Pf, Pa, Pbr, W, tau, Ploss, Paux, Q, beta, betaN, ntt: n * T * tau, fG, nG: I / (Math.PI * a * a) * 1e20, area: wallArea(R, a, kappa) };
}
function wallArea(R, a, kappa) { return 4 * Math.PI * Math.PI * R * a * Math.sqrt((1 + kappa * kappa) / 2); } // m²

/* ───────── 07 inertial confinement: ρR, burn fraction, the energy to compress ─────────
   Burn fraction f = ρR/(ρR + H_B), H_B ≈ 6 g/cm² (Atzeni & Meyer-ter-Vehn 2004, §3.2).
   Cold fuel on an isentrope α above Fermi-degenerate DT: p = α·p_F, p_F = (2/5)·n_e·E_F (≈ 2.17 Mbar·ρ^5/3),
   specific energy 3/2·p/ρ. Isobaric hot spot at T_h with ρR_h: ρ_h = p·m̄/(2kT_h), E_h = 3/2·p·V_h.
   Driver energy = fuel energy / coupling efficiency; gain G = yield / driver energy. */
const ICF = { m0: 0.2, HB: 6, alpha: 2, Th: 10, rhoRh: 0.3, r0mm: 1.0, tol: 0.25 };
function fermiPressure(rho) { // Pa at ρ in g/cm³ (one electron per nucleus, mean nuclear mass 2.5 u)
  const ne = rho * 1000 / (MASS * K.u), EF = K.hbar * K.hbar * Math.pow(3 * Math.PI * Math.PI * ne, 2 / 3) / (2 * K.me);
  return 0.4 * ne * EF;
}
function qDT() { return qValue('dt') * K.MeV / ((NUC.H2.m + NUC.H3.m) * K.u); } // J/kg
function icf(rho, mMg, eta) {
  const m = mMg * 1e-6, mg = m * 1000;               // kg, g
  const rf = Math.cbrt(3 * mg / (4 * Math.PI * rho)); // cm
  const rhoR = rho * rf, f = rhoR / (rhoR + ICF.HB), Y = f * m * qDT();
  const p = ICF.alpha * fermiPressure(rho), ecold = 1.5 * p / (rho * 1000);
  const rhoH = p * MASS * K.u / (2 * ICF.Th * K.keV) / 1000; // g/cm³
  const rh = ICF.rhoRh / rhoH, Vh = 4 / 3 * Math.PI * Math.pow(rh / 100, 3), mh = rhoH * 4 / 3 * Math.PI * Math.pow(rh, 3); // cm, m³, g
  const Eh = 1.5 * p * Vh, Ec = ecold * m, Efuel = Eh + Ec, Edrv = Efuel / eta;
  const CR = ICF.r0mm / 10 / rf, sym = ICF.tol / (CR - 1);
  return { rf, rhoR, f, Y, p, Ec, Eh, Efuel, Edrv, G: Y / Edrv, rh, mh, hsFits: mh < 0.5 * mg, CR, sym };
}

/* ───────── 08 from plasma gain to electricity ─────────
   Thermal power = P_n·M + P_α + P_h with P_n = 0.8 P_fus (blanket multiplication M), P_α = 0.2 P_fus;
   gross electric = η_th·thermal; recirculating = P_h/η_h (heating wall-plug); Q_eng = gross/recirculating. */
const PLANT = { M: 1.15, etaTh: 0.4, Ph: 50, etaH: 0.4, goal: 5 }; // goal: Q_eng at which a fifth of the output is recirculated
function plant(Q, etaH, o = {}) {
  const M = o.M || PLANT.M, etaTh = o.etaTh || PLANT.etaTh, Ph = o.Ph || PLANT.Ph;
  const Pf = Q * Ph, Pn = 0.8 * Pf, Pa = 0.2 * Pf, Pth = Pn * M + Pa + Ph;
  const gross = etaTh * Pth, recirc = Ph / etaH, net = gross - recirc;
  return { Pf, Pn, Pa, Pblanket: Pn * M, Pth, gross, recirc, net, Qeng: gross / recirc, lossHeat: Pth - gross, heaterLoss: recirc - Ph };
}
function qForQeng(target, etaH, o = {}) { const M = o.M || PLANT.M, etaTh = o.etaTh || PLANT.etaTh; return (target / (etaTh * etaH) - 1) / (0.2 + 0.8 * M); }

/* ───────── 09 engineering: tritium, neutrons, exhaust ─────────
   Tritium: single-loop residence-time balance (after Abdou et al., Nucl. Fusion 61 (2021) 013001, much simplified):
   inventory held in the exhaust loop = burn rate / (f_b·η_f) × processing time, plus a reserve of t_r days of burn;
   breeding surplus = burn × (TBR − 1), decay λ = ln2/12.32 y. Neutron wall load = 0.8 P_fus / wall area.
   Exhaust: SOL power width λ_q = 0.63·B_pol^−1.19 mm (Eich et al., Nucl. Fusion 53 (2013) 093031, regression #14). */
const TRIT = { tp: 4 / 24, reserve: 1, half: 12.32 }; // days, days, years
function tritium(Pgw, fbEta, tbr) {
  const b = burnRate(Pgw * 1e9), day = b.tDay;                     // kg/day
  const loop = day / fbEta * TRIT.tp, start = loop + day * TRIT.reserve;
  const lam = Math.LN2 / TRIT.half;                                // per year
  const gain = day * 365.25 * (tbr - 1);                            // kg/year bred beyond burn
  const net = gain - lam * start, td = net > 0 ? start / net : Infinity;
  return { day, year: day * 365.25, loop, start, gain, td, lam };
}
function inventory(Pgw, fbEta, tbr, years) { // stored tritium after start-up, dI/dt = gain − λI, exact solution
  const s = tritium(Pgw, fbEta, tbr), out = [];
  for (let y = 0; y <= years + 1e-9; y += years / 200) out.push([y, s.gain / s.lam + (s.start - s.gain / s.lam) * Math.exp(-s.lam * y)]);
  return out;
}
const WALL = { fluenceLow: 4, fluence: 10, B: 5.3, kappa: 1.7, delta: 0.33, A: 3.1, q95: 3, Qplasma: 10, F: 40, limit: 10 };
function exhaust(Pf, R, frad) {
  const a = R / WALL.A, I = currentFor(R, a, WALL.B, WALL.kappa, WALL.delta, WALL.q95);
  const Bpol = K.mu0 * I * 1e6 / (2 * Math.PI * a * Math.sqrt((1 + WALL.kappa * WALL.kappa) / 2));
  const lq = 0.63 * Math.pow(Bpol, -1.19);                   // mm
  const area = wallArea(R, a, WALL.kappa), load = 0.8 * Pf / area; // MW/m²
  const Psol = Pf * (0.2 + 1 / WALL.Qplasma);                       // α + heating, MW
  const qt = (1 - frad) * Psol / (2 * Math.PI * R * lq / 1000 * WALL.F); // MW/m² on the target
  const fradNeeded = Math.max(0, 1 - WALL.limit * 2 * Math.PI * R * lq / 1000 * WALL.F / Psol);
  return { a, I, Bpol, lq, area, load, years: WALL.fluence / load, yearsLow: WALL.fluenceLow / load, Psol, qt, fradNeeded, PsolR: Psol / R };
}

/* ═════════ FRONTIER DATA BLOCK (as of November 2026) — update here; sources in BRIEF.md "Facts that will go stale" ═════════ */
const FRONTIER = {
  asOf: '2026-11',
  // Peak triple products n·T·τ (keV m⁻³ s), Wurzel & Hsu, arXiv 2505.03834 v6 (2025). kind: tok / stel / icf; proj = design projection
  triple: [
    { id: 'T-3', y: 1969, v: 2.0e16, kind: 'tok' }, { id: 'Alcator A', y: 1978, v: 2.4e19, kind: 'tok' },
    { id: 'Alcator C', y: 1984, v: 1.2e20, kind: 'tok' }, { id: 'JET', y: 1991, v: 6.1e20, kind: 'tok' },
    { id: 'TFTR', y: 1992, v: 3.5e20, kind: 'tok' }, { id: 'TFTR', y: 1994, v: 5.3e20, kind: 'tok' },
    { id: 'JT-60U', y: 1994, v: 4.7e20, kind: 'tok' }, { id: 'TFTR', y: 1995, v: 7.9e20, kind: 'tok' },
    { id: 'JT-60U', y: 1996, v: 5.1e20, kind: 'tok' }, { id: 'DIII-D', y: 1997, v: 3.7e20, kind: 'tok' },
    { id: 'JET', y: 1997, v: 4.7e20, kind: 'tok' }, { id: 'JT-60U', y: 1998, v: 5.6e20, kind: 'tok' },
    { id: 'LHD', y: 2008, v: 5.2e19, kind: 'stel' }, { id: 'KSTAR', y: 2014, v: 9.6e18, kind: 'tok' },
    { id: 'EAST', y: 2015, v: 9.6e18, kind: 'tok' }, { id: 'C-Mod', y: 2016, v: 7.4e19, kind: 'tok' },
    { id: 'ASDEX-U', y: 2016, v: 2.2e19, kind: 'tok' }, { id: 'W7-X', y: 2017, v: 6.2e19, kind: 'stel' },
    { id: 'JET', y: 2021, v: 2.2e20, kind: 'tok' }, { id: 'ST40', y: 2022, v: 6.3e18, kind: 'tok' },
    { id: 'JET', y: 2023, v: 1.4e20, kind: 'tok' },
    { id: 'NIF', y: 2022, v: 1.0e22, kind: 'icf' },
    { id: 'SPARC', y: 2027, v: 6.2e21, kind: 'tok', proj: true }, { id: 'ITER', y: 2039, v: 7.4e21, kind: 'tok', proj: true }
  ],
  // NIF ignition-class shots (LLNL "Achieving fusion ignition", opened 2026-11-11). laser MJ, yield MJ
  nif: [
    { d: '2022-12-05', L: 2.05, Y: 3.15 }, { d: '2023-07-30', L: 2.05, Y: 3.88 }, { d: '2023-10-08', L: 1.9, Y: 2.4 },
    { d: '2023-10-30', L: 2.2, Y: 3.4 }, { d: '2024-02-12', L: 2.2, Y: 5.2 }, { d: '2024-11-18', L: 2.2, Y: 4.1 },
    { d: '2025-02-23', L: 2.05, Y: 5.0 }, { d: '2025-04-07', L: 2.08, Y: 8.6 }, { d: '2025-06-22', L: null, Y: 2.4 },
    { d: '2025-10-01', L: 2.065, Y: 3.5 }, { d: '2026-06-20', L: null, Y: 7.9, G: 3.8 }
  ],
  nifWallPlugMJ: 300,                   // grid energy per shot, ~300 MJ (Physics Today, Dec 2022; secondary)
  // best Q_sci of magnetic D–T experiments (P_fus / heating power)
  qsci: [{ id: 'JET', y: 1991, Q: 0.12 }, { id: 'TFTR', y: 1994, Q: 0.28 }, { id: 'JET', y: 1997, Q: 0.63 }, { id: 'JET', y: 2021, Q: 0.33 }, { id: 'JET', y: 2023, Q: 0.37 }],
  jet: { energyMJ: 69.26, seconds: 5.2, fuelMg: 0.21, prevMJ: 59, prevYear: 2021, date: '2023-10' },
  jetOff: '2023-12',
  pulses: [{ id: 'WEST', s: 1337, d: '2025-02-12' }, { id: 'EAST', s: 1066, d: '2025-01-20' }, { id: 'W7-X', s: 43, d: '2025-06-03' }],
  iter: { base: '2024-07', sro: 2034, dt: 2039, Pf: 500, Ph: 50, Q: 10, extra: 5e9, late: [2041, 2042] },  // 2024 baseline (ITER Organization); "late" = contested preprint
  cfs: { sparcPct: 80, pctDate: '2026-08', q1Year: 2027, arcMW: 400, arcDecade: 2030 },  // company statements
  helion: { date: '2026-02', tempC: 1.5e8, orionYear: 2028 },                             // company statements
  best: { year: 2027 },                                                                    // Chinese programme target (2025 reports)
  fia: { year: 2026, raised: 4.48e9, total: 14.24e9, companies: 56 },                      // Fusion Industry Association report (secondary)
  sparc: { Q: 11, Pf: 140, Hcons: 0.7, Qcons: 2, T: 7 },                                   // Creely et al. 2020 (design projection)
  hts: { date: '2021-09', tesla: 20 },
  tritium: { stock: [20, 30], candu: 130, iterNeed: [12, 18], half: 12.32 },              // secondary sources (ITER Newsline 2008; reviews)
  abdou: { Pgw: 3, fb: 2, tp: 4, tpLo: 1, start: 11, iterFb: 0.36 },                       // Abdou et al. 2021 (abstract/excerpts)
  erda: { year: 1976, fluenceLow: 4, fluence: 10, beta: 8 },
  eich: { year: 2013, iter: 1, target: 10 },
  history: { gamow: 1928, hmode: 1982, act: 1980, actDemo: 2000, pw: 2018, ivy: 1952 },
  facts: { fissionTotal: 200, sunCoreK: 1.57e7, dpaPer: 10, nifBeams: 192, capsuleMm: 2, rhoDTsolid: 0.25, q95iter: 3, plantGE: 10, etaDriver: 10 }
};
const FUNDING = {
  // US magnetic-fusion appropriations, FY2000 dollars, $M (CRS RL30417, Table 1); FY1978 conversion from the same table
  crs: { 1976: 443.24, 1977: 815.31, 1978: 793.84, 1979: 785.01, 1980: 723.75, 1981: 727.11, 1982: 786.63, 1983: 767.08, 1984: 739.10,
    1985: 665.80, 1986: 563.53, 1987: 494.72, 1988: 464.41, 1989: 467.80, 1990: 423.21, 1991: 336.38, 1992: 399.33, 1993: 392.53,
    1994: 392.35, 1995: 410.62, 1996: 263.11, 1997: 245.80, 1998: 241.20, 1999: 234.78, 2000: 250.0 },
  fy78current: 325.35, fy0: 1978, lastY: 2000,
  // ERDA-76/110/2 (July 1976): annual plan totals in FY1978 $M, figures VI-1 … VI-4; Logic I is the flat ~$200M level-of-effort budget (fig. II-2)
  logic: {
    I:   { demo: null, flat: 200 },
    II:  { demo: 2005, total: 16.3, pts: { 1978: 303, 1980: 329, 1985: 415, 1990: 613, 1995: 600, 2000: 855, 2005: 600 } },
    III: { demo: 1998, total: 15.5, pts: { 1978: 410, 1979: 430, 1980: 527, 1981: 648, 1982: 755, 1983: 715, 1984: 648, 1985: 686, 1986: 794, 1987: 835, 1988: 879, 1989: 875, 1990: 746, 1991: 657, 1992: 728, 1993: 899, 1994: 1030, 1995: 1041, 1996: 852, 1997: 703, 1998: 654 } },
    IV:  { demo: 1993, total: 14.8, pts: null },
    V:   { demo: 1990, total: 20.1, pts: { 1978: 650, 1979: 1285, 1980: 1627, 1981: 1605, 1982: 2016, 1983: 2196, 1984: 1829, 1985: 1146, 1986: 1303, 1987: 1890, 1988: 2151, 1989: 1446, 1990: 985 } }
  }
};
/* ═════════ end of frontier data block ═════════ */

function frontierRecord() { return FRONTIER.triple.filter(p => !p.proj && p.kind !== 'icf').reduce((b, p) => p.v > b.v ? p : b, { v: 0 }); }
function nifShots() { return FRONTIER.nif.map(s => ({ ...s, G: s.G || (s.L ? s.Y / s.L : null), wall: s.Y / FRONTIER.nifWallPlugMJ })); }
function deflator() { return FUNDING.crs[1978] / FUNDING.fy78current; } // FY1978 $ → FY2000 $
function logicAt(id, y) { // plan budget in FY1978 $M for a year (linear between published points), null outside the plan
  const L = FUNDING.logic[id];
  if (L.flat) return y >= FUNDING.fy0 && y <= FUNDING.lastY ? L.flat : null;
  if (!L.pts) return null;
  const ks = Object.keys(L.pts).map(Number).sort((a, b) => a - b);
  if (y < ks[0] || y > ks[ks.length - 1]) return null;
  for (let i = 0; i < ks.length - 1; i++) if (y >= ks[i] && y <= ks[i + 1]) { const t = (y - ks[i]) / (ks[i + 1] - ks[i]); return L.pts[ks[i]] * (1 - t) + L.pts[ks[i + 1]] * t; }
  return L.pts[ks[ks.length - 1]];
}
function funding(id, toYear) { // cumulative plan vs actual (FY1978 → toYear), both in FY2000 $M
  const D = deflator(); let plan = 0, act = 0;
  for (let y = FUNDING.fy0; y <= toYear; y++) { const p = logicAt(id, y); if (p != null) plan += p * D; act += FUNDING.crs[y] || 0; }
  return { plan, act, ratio: act / plan };
}
function firstBelowLogicI() { const lvl = FUNDING.logic.I.flat * deflator(); for (let y = FUNDING.fy0; y <= FUNDING.lastY; y++) if (FUNDING.crs[y] < lvl) return y; return null; }

/* ───────── shared number formatting: specs → text, with every word taken from the copy ─────────
   {v,d} fixed decimals · {sci,d} a × 10ⁿ · {lg,d} from a log10 · {y} year · {date} · {big} large-number words from copy ·
   {t,vars} a copy template · {k} a copy string · {pct,d} percent number. L(key) looks a key up in the current copy. */
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(c => SUP[c]).join('');
function fixed(x, d) { const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x; return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function sciParts(lg, d) { let e = Math.floor(lg), m = Math.pow(10, lg - e); if (+m.toFixed(d) >= 10) { m /= 10; e += 1; } return { m: m.toFixed(d), e }; }
function format(sp, L) {
  if (sp == null) return '—';
  if (typeof sp === 'string') return sp;
  if (typeof sp === 'number') return String(sp);
  if (sp.k) return L(sp.k);
  if (sp.t) return fill(L(sp.t), sp.vars || {}, L);
  if ('y' in sp) return String(sp.y);
  if ('v' in sp) return isFinite(sp.v) ? fixed(sp.v, sp.d || 0) : '—';
  if ('sci' in sp || 'lg' in sp) {
    const lg = 'lg' in sp ? sp.lg : Math.log10(Math.abs(sp.sci));
    if (!isFinite(lg)) return '—';
    const p = sciParts(lg, sp.d || 0);
    return (p.m === '1' ? '' : p.m + ' × ') + '10' + sup(p.e);
  }
  if ('big' in sp) { const units = L('fmt.big'); for (const [scale, tpl] of units) if (sp.big >= scale) return fill(tpl, { v: String(+(sp.big / scale).toPrecision(3)) }, L); return String(sp.big); }
  if ('date' in sp) {
    const [y, m, d] = sp.date.split('-').map(Number), months = L('fmt.months');
    const mm = Array.isArray(months) ? months[m - 1] : String(m);
    return fill(L(d ? 'fmt.date' : 'fmt.month'), { y: String(y), m: mm, d: d ? String(d) : '' }, L);
  }
  return '—';
}
function fill(tpl, vars, L) { return String(tpl).replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? format(vars[k], L) : m); }
const N = (v, d = 0) => ({ v, d }), SC = (v, d = 1) => ({ sci: v, d }), Yr = y => ({ y }), Dt = s => ({ date: s }), T = (t, vars) => ({ t, vars });
// pick decimals so small values keep two significant digits
const N2 = v => N(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : Math.abs(v) >= 1 ? 2 : Math.abs(v) >= 0.1 ? 2 : 3);
function length(m) { // metres → a unit template
  if (m < 1e-3) return T('u.mm', { v: N(m * 1e3, 2) });
  if (m < 0.01) return T('u.mm', { v: N(m * 1e3, 1) });
  if (m < 1) return T('u.cm', { v: N(m * 100, m < 0.1 ? 1 : 0) });
  return T('u.m', { v: N(m, 2) });
}
function duration(s) { return s < 1e-3 ? T('u.us', { v: N(s * 1e6, s < 1e-5 ? 1 : 0) }) : T('u.ms', { v: N(s * 1e3, s < 0.01 ? 2 : 1) }); }
const Qspec = Q => isFinite(Q) ? N(Q, Q < 10 ? 2 : Q < 100 ? 1 : 0) : { k: 'u.inf' };

/* ───────── views: everything a figure's readouts and live sentence need, from the control state ───────── */
const F = FRONTIER, FA = F.facts;
const COUL = { dt: 'dt', dd: 'ddn', pb11: 'pb11' }, GAM = { dt: 'dt', dd: 'ddp', dhe3: 'dhe3' };
function svPeak(r) { let b = { T: 0, v: 0 }; for (let T = 1; T <= 100; T += 0.5) { const v = sigmaV(r, T); if (v > b.v) b = { T, v }; } return b; }
const V = {
  bind(c) {
    const r = c.rx, q = qValue(r), kg = energyPerKg(r), coal = coalEquivalent(r) / 1000;
    const two = REACTIONS[r].rhs.length === 2 && REACTIONS[r].rhs.includes('n');
    const other = two ? REACTIONS[r].rhs.find(x => x !== 'n') : null;
    const neu = two ? NUC[other].m / (NUC[other].m + NUC.n.m) : (r === 'u235' ? null : 0);
    const read = { q: T('u.mev', { v: N(q, q < 100 ? 2 : 1) }), kg: T('u.jkg', { v: SC(kg, 2) }), coal: T('u.tonne', { v: N(coal) }), neu: neu == null ? '—' : T('u.pct', { v: N(neu * 100) }) };
    const vars = { q: N(q, q < 100 ? 2 : 1), coal: N(coal), neu: N((neu || 0) * 100), en: N(dtSplit().neutron), barx: N(barrier('pb11').MeV / barrier('dt').MeV, 1), total: N(FA.fissionTotal), ratio: N(energyPerKg('dt') / energyPerKg('u235'), 1) };
    return { read, say: T('ch1.say.' + r, vars) };
  },
  coulomb(c) {
    const r = COUL[c.rx], bk = barrier(r).MeV * 1000, lg = log10Tail(bk, c.T), Kel = c.T * K.kelvinPerKeV;
    const read = { bar: T('u.kev', { v: N(bk) }), kT: T('u.kelvin', { v: SC(Kel, 1) }), frac: { lg, d: 1 }, need: T('u.kelvin', { v: SC(bk * K.kelvinPerKeV, 1) }) };
    const count = 20 + lg, vars = { T: N(c.T), K: SC(Kel, 1), frac: { lg, d: 1 }, count: N(Math.pow(10, count)), n20: SC(1e20, 0), sunx: N(Kel / FA.sunCoreK) };
    const key = count < 0 ? 'none' : lg < -3 ? 'rare' : 'many';
    return { read, say: T('ch2.say.' + key, vars), lg, barrier: bk };
  },
  gamow(c) {
    const g = GAM[c.rx], sr = c.rx === 'dd' ? 'dd' : c.rx, pk = gamowPeak(g, c.T), sv = sigmaV(sr, c.T), ratio = sigmaV('dt', c.T) / sigmaV('dd', c.T), top = svPeak(sr);
    const read = { e0: T('u.kev', { v: N(pk.E0, 1) }), e0T: T('u.times', { v: N(pk.E0 / c.T, 1) }), sv: T('u.sv', { v: SC(sv, 2) }), ratio: T('u.times', { v: N(ratio, ratio < 10 ? 1 : 0) }) };
    const vars = { T: N(c.T), rx: { k: 'rx.' + c.rx }, E0: N(pk.E0, 1), e0T: N(pk.E0 / c.T, 1), sv: SC(sv, 2), ratio: N(ratio, ratio < 10 ? 1 : 0), Tpk: N(top.T), ignT: N(minTriple(Infinity).T) };
    const key = top.T < 100 && c.T > top.T ? 'fall' : 'rise';
    return { read, say: T('ch3.say.' + key, vars), peak: pk };
  },
  lawson(c) {
    const ntt = Math.pow(10, c.lg), Q = qAt(c.T, ntt), need = tripleFor(c.T, Infinity), Tbr = bremsCrossover();
    const { Ea } = fusionEnergies(), sv = sigmaV('dt', c.T) * 1e-6, n = 1e20, tau = ntt / (n * c.T);
    const self = n * n * sv * Ea / 4 / (3 * n * c.T * K.keV / tau + CB * n * n * Math.sqrt(c.T));
    const mt = minTriple(Infinity);
    const read = { q: isFinite(Q) ? Qspec(Q) : { k: 'u.ignited' }, need: isFinite(need) ? T('u.ntt', { v: SC(need, 1) }) : { k: 'u.never' }, min: T('u.ntt', { v: SC(mt.ntt, 1) }), self: T('u.pct', { v: N(self * 100, self < 0.1 ? 1 : 0) }) };
    const vars = { T: N(c.T), Q: Qspec(Q), Tbr: N(Tbr, 1), self: N(self * 100, self < 0.1 ? 1 : 0), need: SC(need, 1), x: N(need / ntt, need / ntt < 10 ? 1 : 0) };
    const key = !isFinite(Q) ? 'ign' : !isFinite(need) ? 'cold' : Q < 1 ? 'low' : 'mid';
    return { read, say: T('ch4.say.' + key, vars), Q, ntt };
  },
  drift(c, o) {
    const p = particle(c.sp, c.pitch), sp = { k: 'sp.' + c.sp };
    const read = { rho: length(p.larmor), vd: T('u.ms1', { v: N(p.vd) }) };
    if (!c.twist) {
      const w = noTwistWall(c.sp, c.pitch);
      read.out = duration(w.t); read.kind = { k: 'kind.wall' };
      return { read, say: T('ch5.say.nt' + (w.up ? 'up' : 'down'), { sp, t: duration(w.t), vd: N(p.vd) }) };
    }
    o = o || orbit(c.sp, c.pitch, c.q);
    read.out = o.lost ? duration(o.t) : length(o.width);
    read.kind = { k: o.lost ? 'kind.lost' : o.trapped ? 'kind.trapped' : 'kind.passing' };
    const vars = { sp, w: length(o.width), a: N(MACH.a), t: duration(o.t), q: N(c.q, 1) };
    return { read, say: T('ch5.say.' + (o.lost ? 'lost' : o.trapped ? 'trap' : 'pass'), vars), orbit: o };
  },
  tokamak(c) {
    const k = tokamak(c), Q = k.Q;
    const read = { I: T('u.ma', { v: N(k.I, 1) }), n: T('u.n20', { v: N(k.n / 1e20, 2) }), tau: T('u.s', { v: N(k.tau, 2) }), pf: T('u.mw', { v: N2(k.Pf) }), q: Qspec(Q), bn: N(k.betaN, 2) };
    const vars = { Q: Qspec(Q), Pf: N2(k.Pf), Paux: N(Math.max(0, k.Paux)), bn: N(k.betaN, 2), troyon: N(TROYON, 1) };
    const key = !isFinite(Q) ? 'ign' : Q < 1 ? 'low' : Q < 5 ? 'mid' : 'high';
    return { read, say: T('ch6.say.' + key, vars), say2: T(k.betaN > TROYON ? 'ch6.say.betahi' : 'ch6.say.betaok', vars), k };
  },
  icf(c) {
    const x = icf(c.rho, c.m, c.eta);
    const read = { rhoR: T('u.arealDensity', { v: N(x.rhoR, 2) }), f: T('u.pct', { v: N(x.f * 100) }), Y: T('u.mj', { v: N2(x.Y / 1e6) }), E: T('u.mj', { v: N2(x.Edrv / 1e6) }), G: x.hsFits ? N2(x.G) : '—', sym: x.hsFits ? T('u.pct', { v: N(x.sym * 100, 1) }) : '—' };
    const vars = { rho: N(c.rho), p: N(x.p / 1e14), rh: N(x.rh * 10, 2), rhoR: N(x.rhoR, 2), f: N(x.f * 100), Y: N2(x.Y / 1e6), eta: N(c.eta * 100, c.eta < 0.01 ? 1 : 0), E: N2(x.Edrv / 1e6), G: N2(x.G), CR: N(x.CR), sym: N(x.sym * 100, 1) };
    const gp = FA.plantGE / (FA.etaDriver / 100);
    const key = !x.hsFits ? 'nofit' : x.G < 1 ? 'low' : x.G < gp ? 'mid' : 'high';
    return { read, say: T('ch7.say.' + key, vars), x };
  },
  plant(c) {
    const p = plant(c.Q, c.etaH), rePct = p.recirc / p.gross * 100;
    const read = { pf: T('u.mw', { v: N(p.Pf) }), th: T('u.mw', { v: N(p.Pth) }), gross: T('u.mw', { v: N(p.gross) }), re: T('u.mw', { v: N(p.recirc) }), net: T('u.mw', { v: N(p.net) }), qe: N(p.Qeng, 2) };
    const vars = { Q: N(c.Q, c.Q < 10 ? 1 : 0), gross: N(p.gross), re: N(p.recirc), net: N(p.net), qe: N(p.Qeng, 2), rePct: N(rePct), q1: N(qForQeng(1, c.etaH), 1), q5: N(qForQeng(PLANT.goal, c.etaH)), goal: N(100 / PLANT.goal) };
    const key = p.Qeng < 1 ? 'neg' : p.Qeng < PLANT.goal ? 'thin' : 'good';
    return { read, say: T('ch8.say.' + key, vars), p };
  },
  tritium(c) {
    const s = tritium(c.P, c.fb, c.tbr);
    const read = { day: T('u.kg', { v: N(s.day, 2) }), start: T('u.kg', { v: N(s.start, 1) }), td: isFinite(s.td) ? T('u.yr', { v: N(s.td, s.td < 10 ? 1 : 0) }) : { k: 'u.neverDouble' }, yr: T('u.kg', { v: N(s.year) }) };
    const vars = { tbr: N(c.tbr, 2), decay: N((1 - Math.exp(-s.lam)) * 100, 1), start: N(s.start, 1), td: N(s.td, s.td < 10 ? 1 : 0) };
    const key = !isFinite(s.td) ? 'never' : s.td > 10 ? 'slow' : 'ok';
    return { read, say: T('ch9.say.' + key, vars), s };
  },
  wall(c) {
    const e = exhaust(c.P, c.R, c.frad);
    const read = { load: T('u.mwm2', { v: N(e.load, 2) }), yrs: T('u.yr', { v: N(e.years, 1) }), lq: T('u.mm', { v: N(e.lq, 2) }), qt: T('u.mwm2', { v: N(e.qt, e.qt < 10 ? 1 : 0) }), need: T('u.pct', { v: N(e.fradNeeded * 100) }) };
    const vars = { load: N(e.load, 2), yrs: N(e.years, 1), yrsLow: N(e.yearsLow, 1), fl: N(F.erda.fluence), flLow: N(F.erda.fluenceLow), frad: N(c.frad * 100), qt: N(e.qt, e.qt < 10 ? 1 : 0), tgt: N(F.eich.target), need: N(e.fradNeeded * 100) };
    return { read, say: T(e.qt <= F.eich.target ? 'ch9.say.wallok' : e.fradNeeded > 0.99 ? 'ch9.say.wallnone' : 'ch9.say.wallhot', vars), e };
  },
  frontier(c) {
    const rec = frontierRecord(), ign = minTriple(Infinity), shots = nifShots(), best = shots.reduce((b, s) => (s.G || 0) > (b.G || 0) ? s : b);
    const read = { rec: T('u.ntt', { v: SC(rec.v, 1) }), gap: T('u.times', { v: N(ign.ntt / rec.v, 1) }), nifG: N(best.G, 2), jet: T('u.mj', { v: N(F.jet.energyMJ, 2) }) };
    const vars = { recId: rec.id, recY: Yr(rec.y), rec: SC(rec.v, 1), gap: N(ign.ntt / rec.v, 1), since: N(Number(F.asOf.slice(0, 4)) - rec.y) };
    const parts = [T('ch10.say.base', vars)];
    if (c.proj) parts.push(T('ch10.say.proj', vars));
    if (c.nif) parts.push(T('ch10.say.nif', vars));
    return { read, says: parts };
  },
  funding(c) {
    const id = c.logic, L = FUNDING.logic[id], toY = Math.min(FUNDING.lastY, L.demo || FUNDING.lastY), f = funding(id, toY);
    const read = { demo: L.demo ? Yr(L.demo) : { k: 'u.noDemo' }, plan: T('u.musd', { v: N(f.plan) }), act: T('u.musd', { v: N(f.act) }), ratio: T('u.pct', { v: N(f.ratio * 100) }) };
    const vars = { name: { k: 'logic.' + id }, d: L.demo ? Yr(L.demo) : '', toY: Yr(toY), plan: N(f.plan), act: N(f.act), pct: N(f.ratio * 100), l1: N(FUNDING.logic.I.flat * deflator()), below: Yr(firstBelowLogicI()), fy0: Yr(FUNDING.fy0), lastY: Yr(FUNDING.lastY) };
    return { read, say: T(id === 'I' ? 'ch11.say.I' : 'ch11.say.plan', vars), toY };
  }
};

/* numbers quoted in the static prose: every {name} in copy text not belonging to a live sentence comes from here */
function prose() {
  const sp = dtSplit(), b = burnRate(1e9), mt = minTriple(Infinity), shots = nifShots(), best = shots.reduce((x, s) => (s.G || 0) > (x.G || 0) ? s : x);
  const first = shots[0], last = shots[shots.length - 1], rec = frontierRecord(), iterK = tokamak({ preset: 'iter' }), spK = tokamak({ preset: 'sparc' });
  const pD = particle('D', 0), pA = particle('alpha', 0), sun = FA.sunCoreK;
  const gp = FA.plantGE / (FA.etaDriver / 100);
  return {
    asOf: Dt(F.asOf),
    bNi: N(bindingPerA('Ni62'), 3), bFe: N(bindingPerA('Fe56'), 3), bD: N(bindingPerA('H2'), 2), bHe4: N(bindingPerA('He4'), 2),
    coalMJ: N(K.coal / 1e6, 1), dtU: N(energyPerKg('dt') / energyPerKg('u235'), 1), coalx: SC(coalEquivalent('dt'), 1),
    rx1GW: SC(b.reactions, 1), tDay: N(b.tDay * 1000), tYear: N(b.tYear), ivy: Yr(F.history.ivy),
    barKeV: N(barrier('dt').MeV * 1000), rDT: N(barrier('dt').fm, 1), kelvinPerKeV: SC(K.kelvinPerKeV, 2), sunKeV: N(sun / K.kelvinPerKeV, 2), sunK: SC(sun, 2), n20: SC(1e20, 0),
    EGdt: N(gamowEnergy('dt')), gamowYear: Yr(F.history.gamow), T10: N(10), r10dd: N(sigmaV('dt', 10) / sigmaV('dd', 10)), r10he: N(sigmaV('dt', 10) / sigmaV('dhe3', 10)), en: N(sp.neutron), ea: N(sp.alpha, 1),
    alphaPct: N(sp.alpha / sp.Q * 100), nPct: N(sp.neutron / sp.Q * 100), ignT: N(mt.T), ignTriple: SC(mt.ntt, 1), ignK: SC(mt.T * K.kelvinPerKeV, 1),
    q1Triple: SC(minTriple(1).ntt, 1), Tbr: N(bremsCrossover(), 1),
    B0: N(MACH.B0, 1), ED: N(SPECIES.D.E), rhoD: N(pD.larmor * 1000, 1), rhoA: N(pA.larmor * 100, 1), a: N(MACH.a, 1), R0: N(MACH.R0, 1), q95: N(FA.q95iter),
    Bsp: N(PRESETS.sparc.B, 1), hts: N(F.hts.tesla), htsDate: Dt(F.hts.date), Rsp: N(PRESETS.sparc.R, 2), Riter: N(PRESETS.iter.R, 1),
    iterPf: N(iterK.Pf), iterQ: N(iterK.Q, 1), iterPfGoal: N(F.iter.Pf), iterQgoal: N(F.iter.Q), iterPh: N(F.iter.Ph),
    sparcFG: N(PRESETS.sparc.fG * 100), sparcT: N(PRESETS.sparc.T), sparcQ: N(spK.Q, 1), sparcQgoal: N(F.sparc.Q), sparcPfGoal: N(F.sparc.Pf), sparcH: N(F.sparc.Hcons, 1), sparcQcons: N(F.sparc.Qcons),
    nifBeams: N(FA.nifBeams), capsuleMm: N(FA.capsuleMm), HB: N(ICF.HB), rhoR3: N(ICF.HB / 2), m0: N(ICF.m0, 1), rhoDT: N(FA.rhoDTsolid, 2),
    Th: N(ICF.Th), rhoRh: N(ICF.rhoRh, 1), alphaIs: N(ICF.alpha), tolPct: N(ICF.tol * 100), plantGE: N(FA.plantGE), etaD: N(FA.etaDriver), Gplant: N(gp),
    nifWall: N(F.nifWallPlugMJ), nifG: N(best.G, 2), nifBestY: N(best.Y, 1), nifBestL: N(best.L, 2), nifBestDate: Dt(best.d), nifWallQ: N(best.Y / F.nifWallPlugMJ, 3),
    nif1Date: Dt(first.d), nif1L: N(first.L, 2), nif1Y: N(first.Y, 2), nifN: N(shots.length), nifLastDate: Dt(last.d), nifLastY: N(last.Y, 1), nifLastG: N(last.G, 1),
    M: N(PLANT.M, 2), etaTh: N(PLANT.etaTh * 100), Ph: N(PLANT.Ph), jetQ: N(Math.max(...F.qsci.map(x => x.Q)), 2), jetQY: Yr(F.qsci.reduce((a, x) => x.Q > a.Q ? x : a).y),
    iterQeng: N(plant(F.iter.Q, PLANT.etaH).Qeng, 1), q1: N(qForQeng(1, PLANT.etaH), 1), q5: N(qForQeng(PLANT.goal, PLANT.etaH)), recircGoal: N(100 / PLANT.goal), etaH: N(PLANT.etaH * 100),
    tHalf: N(F.tritium.half, 2), candu: N(F.tritium.candu), stockLo: N(F.tritium.stock[0]), stockHi: N(F.tritium.stock[1]), iterTlo: N(F.tritium.iterNeed[0]), iterThi: N(F.tritium.iterNeed[1]),
    li6: N(qValue('li6'), 2), li7: N(-qValue('li7'), 2), tp: N(TRIT.tp * 24), reserve: N(TRIT.reserve),
    abdouP: N(F.abdou.Pgw), abdouFb: N(F.abdou.fb), abdouTp: N(F.abdou.tp), abdouTpLo: N(F.abdou.tpLo), abdouStart: N(F.abdou.start), iterFb: N(F.abdou.iterFb, 2),
    ourStart: N(tritium(F.abdou.Pgw, F.abdou.fb / 100, 1.05).start, 1),
    erdaYear: Yr(F.erda.year), erdaFl: N(F.erda.fluenceLow), erdaFl2: N(F.erda.fluence), dpaPer: N(FA.dpaPer), eichYear: Yr(F.eich.year), eichIter: N(F.eich.iter), lqIter: N(exhaust(500, 6.2, 0).lq, 1), tgt: N(F.eich.target),
    Bw: N(WALL.B, 1), Qw: N(WALL.Qplasma), F: N(WALL.F), iterLoad: N(exhaust(F.iter.Pf, PRESETS.iter.R, 0).load, 2),
    jetDate: Dt(F.jet.date), jetFuel: N(F.jet.fuelMg, 2), jetSec: N(F.jet.seconds, 1), jetMJ: N(F.jet.energyMJ, 2), jetPrev: N(F.jet.prevMJ), jetPrevY: Yr(F.jet.prevYear), firstY: Yr(Math.min(...F.triple.map(p => p.y))), jetOff: Dt(F.jetOff),
    westDate: Dt(F.pulses[0].d), westS: N(F.pulses[0].s), eastDate: Dt(F.pulses[1].d), eastS: N(F.pulses[1].s), w7xS: N(F.pulses[2].s), w7xDate: Dt(F.pulses[2].d),
    iterBase: Dt(F.iter.base), iterSro: Yr(F.iter.sro), iterDT: Yr(F.iter.dt), iterExtra: { big: F.iter.extra }, iterLate1: Yr(F.iter.late[0]), iterLate2: Yr(F.iter.late[1]),
    sparcPct: N(F.cfs.sparcPct), sparcPctDate: Dt(F.cfs.pctDate), sparcQ1Y: Yr(F.cfs.q1Year), arcMW: N(F.cfs.arcMW), arcDecade: Yr(F.cfs.arcDecade),
    helionDate: Dt(F.helion.date), helionT: { big: F.helion.tempC }, helionY: Yr(F.helion.orionYear), bestY: Yr(F.best.year),
    fiaY: Yr(F.fia.year), fiaRaised: { big: F.fia.raised }, fiaTotal: { big: F.fia.total }, fiaN: N(F.fia.companies),
    rec: SC(rec.v, 1), recId: rec.id, recY: Yr(rec.y), gap: N(mt.ntt / rec.v, 1),
    defl: N(deflator(), 2), d2: Yr(FUNDING.logic.II.demo), d3: Yr(FUNDING.logic.III.demo), d4: Yr(FUNDING.logic.IV.demo), d5: Yr(FUNDING.logic.V.demo),
    fy0: Yr(FUNDING.fy0), lastY: Yr(FUNDING.lastY), l1: N(FUNDING.logic.I.flat * deflator()), below: Yr(firstBelowLogicI()), actYear: Yr(F.history.act), actDemo: Yr(F.history.actDemo), erdaBeta: N(F.erda.beta), hmodeY: Yr(F.history.hmode), pwY: Yr(F.history.pw)
  };
}

return {
  format, fill, V, prose, svPeak,
  K, clamp, NUC, REACTIONS, bindingPerA, qValue, energyPerKg, coalEquivalent, dtSplit, burnRate,
  barrier, log10Tail, mbDensity, lnErfc,
  BH, gamowEnergy, gamowPeak, gamowIntegrand, tunnel, sigmaV, sigmaDT, sigmaVIntegrated,
  CB, fusionEnergies, tripleFor, qAt, minTriple, bremsCrossover,
  MACH, SPECIES, particle, noTwistWall, orbit, passingWidthEstimate, trappedPitch,
  PRESETS, TROYON, currentFor, tokamak, wallArea,
  ICF, fermiPressure, qDT, icf,
  PLANT, plant, qForQeng,
  TRIT, tritium, inventory, WALL, exhaust,
  FRONTIER, FUNDING, frontierRecord, nifShots, deflator, logicAt, funding, firstBelowLogicI
};
}));
