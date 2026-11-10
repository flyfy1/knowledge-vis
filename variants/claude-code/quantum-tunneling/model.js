'use strict';
// Quantum tunnelling model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Units: energy eV, length nm, time fs (steps 0–4); MeV and fm for alpha decay (step 5).
// Loaded by the page (window.QT_MODEL) and by node (tests/core.cjs).
(function (root) {

const HBAR = 0.6582119569;          // eV·fs
const C_E = 0.0380998;              // ħ²/(2 m_e) in eV·nm²
const MP_ME = 1836.15267;           // proton / electron mass
const MMU_ME = 206.768283;          // muon / electron mass
const V0 = 1;                       // wall height used in steps 0–4, eV

/* ---------- small complex helpers: [re, im] ---------- */
const cx = (re, im = 0) => [re, im];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const div = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
const cexp = a => { const m = Math.exp(a[0]); return [m * Math.cos(a[1]), m * Math.sin(a[1])]; };
const abs2 = a => a[0] * a[0] + a[1] * a[1];
const scale = (a, s) => [a[0] * s, a[1] * s];

// wave number for kinetic energy K (eV) and mass ratio m/m_e: K ≥ 0 → real k; K < 0 → k = iκ
const kOf = (K, m = 1) => (K >= 0 ? cx(Math.sqrt(K * m / C_E), 0) : cx(0, Math.sqrt(-K * m / C_E)));
const kappa = (V, E, m = 1) => Math.sqrt(Math.max(0, V - E) * m / C_E);   // nm⁻¹
const decayLength = (V, E, m = 1) => 1 / kappa(V, E, m);                 // nm, amplitude e-fold length
const densityDepth = (V, E, m = 1) => 1 / (2 * kappa(V, E, m));          // nm, |ψ|² falls by e over this depth
// T is multiplied by this (thick-wall limit) for each extra dd nm of wall
const perSlice = (V, E, dd = 0.1, m = 1) => Math.exp(-2 * kappa(V, E, m) * dd);
// wavelength inside / outside (E > V inside)
const lambdaIn = (E, V, m = 1) => (E > V ? 2 * Math.PI / Math.sqrt((E - V) * m / C_E) : Infinity);

/* ---------- step 0: a semi-infinite step (wall with no far side) ---------- */
// ψ = e^{ikx} + r e^{-ikx} (x < 0), ψ = C e^{-κx} (x > 0), E < V
function step(E, V, m = 1) {
  const k = Math.sqrt(E * m / C_E), K = kappa(V, E, m);
  const r = div(cx(k, -K), cx(k, K)), C = add(cx(1), r);
  const psi = x => (x < 0 ? add(cexp(cx(0, k * x)), mul(r, cexp(cx(0, -k * x)))) : scale(C, Math.exp(-K * x)));
  return { k, kappa: K, r, C, R: abs2(r), density: x => abs2(psi(x)), psi, edge: abs2(C) };
}

/* ---------- steps 1–3: rectangular barrier V on [0, a] ---------- */
// Matching ψ and ψ′ at x = 0 and x = a (complex q covers E < V and E > V alike).
function barrier(E, V, a, m = 1) {
  const k = Math.sqrt(E * m / C_E);
  let q = kOf(E - V, m);
  if (Math.abs(E - V) < 1e-9) q = cx(1e-7, 0);       // E = V: use a tiny q, the limit is smooth
  const kq = cx(k), eiqa = cexp(mul(cx(0, 1), scale(q, a))), emiqa = cexp(mul(cx(0, -1), scale(q, a)));
  const kpq = add(kq, q), kmq = sub(kq, q);
  const den = sub(mul(mul(kpq, kpq), emiqa), mul(mul(kmq, kmq), eiqa));
  const t = mul(div(scale(mul(kq, q), 4), den), cexp(cx(0, -k * a)));
  const teika = mul(t, cexp(cx(0, k * a)));
  const kOverQ = div(kq, q);
  const Cc = scale(mul(mul(teika, add(cx(1), kOverQ)), emiqa), 0.5);
  const Dc = scale(mul(mul(teika, sub(cx(1), kOverQ)), eiqa), 0.5);
  const r = sub(add(Cc, Dc), cx(1));
  const psi = x => {
    if (x < 0) return add(cexp(cx(0, k * x)), mul(r, cexp(cx(0, -k * x))));
    if (x <= a) { const iqx = mul(cx(0, 1), scale(q, x)); return add(mul(Cc, cexp(iqx)), mul(Dc, cexp(scale(iqx, -1)))); }
    return mul(t, cexp(cx(0, k * x)));
  };
  return { k, q, t, r, T: abs2(t), R: abs2(r), psi, density: x => abs2(psi(x)) };
}
// closed form, used to cross-check the matching solution
function Tformula(E, V, a, m = 1) {
  if (Math.abs(E - V) < 1e-12) return 1 / (1 + V * a * a * m / (4 * C_E));
  if (E < V) { const s = Math.sinh(kappa(V, E, m) * a); return 1 / (1 + V * V * s * s / (4 * E * (V - E))); }
  const s = Math.sin(Math.sqrt((E - V) * m / C_E) * a); return 1 / (1 + V * V * s * s / (4 * E * (E - V)));
}
// thick-wall estimate T ≈ 16 (E/V)(1 − E/V) e^{−2κa}
const Tthick = (E, V, a, m = 1) => 16 * (E / V) * (1 - E / V) * Math.exp(-2 * kappa(V, E, m) * a);
// log10 T without underflow (for heavy particles)
function log10T(E, V, a, m = 1) {
  if (E >= V) return Math.log10(Tformula(E, V, a, m));
  const ka = kappa(V, E, m) * a, pre = V * V / (4 * E * (V - E));
  if (ka < 300) return -Math.log10(1 + pre * Math.sinh(ka) ** 2);
  return -(Math.log10(pre) + 2 * (ka - Math.LN2) / Math.LN10);   // sinh x ≈ e^x / 2
}
// above the barrier: resonance energies where q a = nπ  →  E_n = V + C n²π² / a²
function resonances(V, a, Emax, m = 1) { const out = []; for (let n = 1; ; n++) { const E = V + C_E / m * (n * Math.PI / a) ** 2; if (E > Emax) break; out.push(E); } return out; }

/* ---------- step 4: a Gaussian wave packet, Crank–Nicolson (unitary) ---------- */
const PACK = { L: 100, N: 4000, x0: 30, sigma: 2.5, xb: 50, dt: 0.1 };
function packet(E0, V, a, opt = {}) {
  const P = Object.assign({}, PACK, opt), N = P.N, dx = P.L / N, k0 = Math.sqrt(E0 / C_E);
  const re = new Float64Array(N), im = new Float64Array(N), pot = new Float64Array(N), xs = new Float64Array(N);
  let norm = 0;
  for (let j = 0; j < N; j++) {
    const x = j * dx; xs[j] = x;
    pot[j] = x >= P.xb && x < P.xb + a ? V : 0;
    const g = Math.exp(-((x - P.x0) ** 2) / (4 * P.sigma * P.sigma));
    re[j] = g * Math.cos(k0 * x); im[j] = g * Math.sin(k0 * x); norm += g * g * dx;
  }
  const s = 1 / Math.sqrt(norm); for (let j = 0; j < N; j++) { re[j] *= s; im[j] *= s; }
  // H = −C ∂² + V ; (1 + iΔt H/2ħ) ψ' = (1 − iΔt H/2ħ) ψ ; tridiagonal with off-diagonal b = −i α, α = Δt C /(2ħ dx²)
  const al = P.dt * C_E / (2 * HBAR * dx * dx), be = P.dt / (2 * HBAR);
  const dRe = new Float64Array(N), dIm = new Float64Array(N);   // diagonal of LHS: 1 + i(2α + βV)
  for (let j = 0; j < N; j++) { dRe[j] = 1; dIm[j] = 2 * al + be * pot[j]; }
  const cpRe = new Float64Array(N), cpIm = new Float64Array(N), rRe = new Float64Array(N), rIm = new Float64Array(N);
  function stepOnce() {
    // RHS: (1 − i(2α+βV)) ψ_j + iα (ψ_{j−1} + ψ_{j+1})
    for (let j = 0; j < N; j++) {
      const nRe = (j > 0 ? re[j - 1] : 0) + (j < N - 1 ? re[j + 1] : 0), nIm = (j > 0 ? im[j - 1] : 0) + (j < N - 1 ? im[j + 1] : 0);
      const d = dIm[j];
      rRe[j] = re[j] + d * im[j] - al * nIm;
      rIm[j] = im[j] - d * re[j] + al * nRe;
    }
    // Thomas algorithm, off-diagonals c = −iα
    const cRe = 0, cIm = -al;
    let bRe = dRe[0], bIm = dIm[0], q = bRe * bRe + bIm * bIm;
    cpRe[0] = (cRe * bRe + cIm * bIm) / q; cpIm[0] = (cIm * bRe - cRe * bIm) / q;
    let yRe = (rRe[0] * bRe + rIm[0] * bIm) / q, yIm = (rIm[0] * bRe - rRe[0] * bIm) / q;
    re[0] = yRe; im[0] = yIm;
    for (let j = 1; j < N; j++) {
      // denom = b_j − a_j c'_{j−1}, a_j = c
      const mRe = dRe[j] - (cRe * cpRe[j - 1] - cIm * cpIm[j - 1]), mIm = dIm[j] - (cRe * cpIm[j - 1] + cIm * cpRe[j - 1]);
      q = mRe * mRe + mIm * mIm;
      cpRe[j] = (cRe * mRe + cIm * mIm) / q; cpIm[j] = (cIm * mRe - cRe * mIm) / q;
      const nr = rRe[j] - (cRe * re[j - 1] - cIm * im[j - 1]), ni = rIm[j] - (cRe * im[j - 1] + cIm * re[j - 1]);
      re[j] = (nr * mRe + ni * mIm) / q; im[j] = (ni * mRe - nr * mIm) / q;
    }
    for (let j = N - 2; j >= 0; j--) {
      const tr = cpRe[j] * re[j + 1] - cpIm[j] * im[j + 1], ti = cpRe[j] * im[j + 1] + cpIm[j] * re[j + 1];
      re[j] -= tr; im[j] -= ti;
    }
  }
  const vg = 2 * C_E * k0 / HBAR;                       // group velocity, nm/fs
  const tEnd = (P.xb - P.x0 + 25) / vg;                 // centre would be 25 nm past the barrier
  const steps = Math.ceil(tEnd / P.dt);
  const parts = () => { let l = 0, w = 0, rr = 0; for (let j = 0; j < N; j++) { const p = (re[j] * re[j] + im[j] * im[j]) * dx; if (xs[j] < P.xb) l += p; else if (xs[j] < P.xb + a) w += p; else rr += p; } return { left: l, inside: w, right: rr, total: l + w + rr }; };
  return { re, im, pot, xs, dx, N, k0, vg, tEnd, steps, dt: P.dt, stepOnce, parts, P };
}
// stationary T averaged over the packet's spread of wave numbers: |φ(k)|² ∝ exp(−2σ²(k−k0)²)
function averagedT(E0, V, a, sigma = PACK.sigma) {
  const k0 = Math.sqrt(E0 / C_E), dk = 1 / (2 * sigma); let s = 0, w = 0;
  for (let i = -600; i <= 600; i++) { const k = k0 + i * dk * 6 / 600; if (k <= 0) continue; const g = Math.exp(-2 * sigma * sigma * (k - k0) ** 2); s += g * Tformula(C_E * k * k, V, a); w += g; }
  return s / w;
}
const packetSpread = (E0, sigma = PACK.sigma) => { const k0 = Math.sqrt(E0 / C_E); return 2 * C_E * k0 / (2 * sigma); }; // ΔE ≈ 2Ck0·Δk, eV

/* ---------- step 5: alpha decay as tunnelling through the Coulomb wall (Gamow) ---------- */
const NUC = { hbarc: 197.327, e2: 1.43996, ma: 3727.379, u: 931.494, r0: 1.2 };
// Z, A of the daughter nucleus; Q in MeV
function gamow(Zd, Ad, Q) {
  const mu = NUC.ma * Ad * NUC.u / (NUC.ma + Ad * NUC.u);
  const R = NUC.r0 * (Math.cbrt(Ad) + Math.cbrt(4));                 // touching radius, fm
  const b = 2 * Zd * NUC.e2 / Q;                                     // outer turning point, fm
  const x = R / b;
  const G2 = 2 * Math.sqrt(2 * mu * Q) / NUC.hbarc * b * (Math.acos(Math.sqrt(x)) - Math.sqrt(x * (1 - x)));   // 2G
  const v = Math.sqrt(2 * Q / mu) * 2.99792458e23;                   // fm/s
  const nu = v / (2 * R);                                            // wall hits per second
  const log10P = -G2 / Math.LN10;
  const log10Half = Math.log10(Math.LN2 / nu) - log10P;
  const Vtop = 2 * Zd * NUC.e2 / R;
  return { R, b, Vtop, G2, log10P, nu, log10Half, mu };
}
const YEAR = 3.15576e7;
// measured Q values (MeV) and half-lives (s); standard nuclear-data values
const ISOTOPES = [
  { id: 'Po212', name: '²¹²Po', Zd: 82, Ad: 208, Q: 8.954, half: 2.99e-7 },
  { id: 'Po214', name: '²¹⁴Po', Zd: 82, Ad: 210, Q: 7.833, half: 1.643e-4 },
  { id: 'Rn222', name: '²²²Rn', Zd: 84, Ad: 218, Q: 5.590, half: 3.8235 * 86400 },
  { id: 'Po210', name: '²¹⁰Po', Zd: 82, Ad: 206, Q: 5.407, half: 138.376 * 86400 },
  { id: 'Ra226', name: '²²⁶Ra', Zd: 86, Ad: 222, Q: 4.871, half: 1600 * YEAR },
  { id: 'U238', name: '²³⁸U', Zd: 90, Ad: 234, Q: 4.270, half: 4.468e9 * YEAR },
  { id: 'Th232', name: '²³²Th', Zd: 88, Ad: 228, Q: 4.082, half: 1.405e10 * YEAR }
];

/* ---------- detections: a seeded generator so a run can be replayed ---------- */
function mulberry32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- finale: scanning tunnelling microscope gap sensitivity ---------- */
const stmFactor = (phi, dd = 0.1) => Math.exp(2 * Math.sqrt(phi / C_E) * dd);   // current ratio for a gap change dd (nm)

const api = { HBAR, C_E, MP_ME, MMU_ME, V0, densityDepth, perSlice, lambdaIn, mulberry32, kOf, kappa, decayLength, step, barrier, Tformula, Tthick, log10T, resonances, PACK, packet, averagedT, packetSpread, NUC, gamow, ISOTOPES, YEAR, stmFactor, abs2 };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.QT_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
