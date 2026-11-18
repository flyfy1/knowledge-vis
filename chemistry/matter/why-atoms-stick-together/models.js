/* Why atoms stick together: the models, as pure functions (page + node).
   Each implements a named textbook result at small scale; sources are in BRIEF.md and the page footer.
   No text for readers lives here (formulas such as "HCl" are language-neutral). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BondModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

/* ───────── constants (CODATA 2018) ───────── */
const K = {
  hartreeEv: 27.211386,        // eV per hartree
  bohrA: 0.529177,             // Å per bohr
  evKj: 96.4853,               // kJ/mol per eV
  kBev: 8.617333e-5,           // eV/K
  R: 8.314463e-3,              // kJ/(mol K)
  hcEvNm: 1239.842,            // eV nm
  boxEvNm2: 0.3760301,         // h²/(8 mₑ) in eV nm²
  coulombKjA: 1389.3546,       // N_A e²/(4π ε0) in kJ Å / mol
  debyePerEA: 4.803205         // 1 e·Å in debye
};

/* ───────── formatting ───────── */
function fmt(x, d, lang) {
  if (!isFinite(x)) return '—';
  d = d == null ? 0 : d;
  const s = Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const zero = Number(Math.abs(x).toFixed(d)) === 0;
  return (x < 0 && !zero ? '−' : '') + s;
}
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const supStr = k => String(k).split('').map(ch => SUP[ch]).join('');
function sci(x, d) { // 3.9 × 10⁻¹⁰
  if (x === 0) return '0';
  d = d == null ? 1 : d;
  let e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
  if (Number(Math.abs(m).toFixed(d)) >= 10) { m /= 10; e += 1; }
  return (m < 0 ? '−' : '') + Math.abs(m).toFixed(d) + ' × 10' + supStr(e);
}
function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

/* ───────── ch1: particle in a box, E_n = n² h² / (8 m L²) ───────── */
function boxE(n, Lnm) { return n * n * K.boxEvNm2 / (Lnm * Lnm); }          // eV
function boxMerge(Lnm) { // one electron in a box of L, then in a box of 2L
  const narrow = boxE(1, Lnm), wide = boxE(1, 2 * Lnm);
  return { narrow, wide, drop: narrow - wide, dropKj: (narrow - wide) * K.evKj, ratio: wide / narrow };
}

/* ───────── ch2: H2+ by LCAO with 1s orbitals of exponent ζ (atomic units) ─────────
   Integrals in closed form (e.g. Atkins & Friedman, Molecular Quantum Mechanics, ch. 8; Levine, Quantum Chemistry, §13.5):
   w = ζR, S = e^-w (1 + w + w²/3), ⟨A|1/r_B|A⟩ = (1/w)(1 − (1+w) e^-2w), ⟨A|1/r_A|B⟩ = (1+w) e^-w.
   Kinetic parts scale as ζ², electron–nucleus parts as ζ (Finkelstein & Horowitz 1928 for the optimised ζ). */
function h2plus(R, zeta) {
  zeta = zeta == null ? 1 : zeta;
  const w = zeta * R, ew = Math.exp(-w);
  const S = ew * (1 + w + w * w / 3);
  const res = (1 + w) * ew;                               // ⟨A|1/r_A|B⟩ / ζ
  const cou = (1 - (1 + w) * Math.exp(-2 * w)) / w;       // ⟨A|1/r_B|A⟩ / ζ
  const Taa = zeta * zeta / 2, Tab = zeta * zeta * (-S / 2 + res);
  const Vaa = zeta * (-1 - cou), Vab = zeta * (-2 * res);
  const out = { R, zeta, S };
  for (const [name, sg] of [['bond', 1], ['anti', -1]]) {
    const T = (Taa + sg * Tab) / (1 + sg * S), Ven = (Vaa + sg * Vab) / (1 + sg * S);
    out[name] = { T, V: Ven + 1 / R, E: T + Ven + 1 / R };
  }
  out.bind = out.bond.E + 0.5;       // relative to H + H+ (−0.5 Eh); negative = bound
  out.antiRel = out.anti.E + 0.5;
  return out;
}
function goldenMin(f, a, b, tol) {
  const g = (Math.sqrt(5) - 1) / 2; let c = b - g * (b - a), d = a + g * (b - a), fc = f(c), fd = f(d);
  while (Math.abs(b - a) > (tol || 1e-7)) { if (fc < fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = f(c); } else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = f(d); } }
  return (a + b) / 2;
}
function h2plusOpt(R) { const z = goldenMin(zz => h2plus(R, zz).bond.E, 0.6, 2.2, 1e-7); return h2plus(R, z); }
function h2plusMin(opt) { // equilibrium of the bonding curve
  const f = opt ? (R => h2plusOpt(R).bond.E) : (R => h2plus(R, 1).bond.E);
  const R = goldenMin(f, 1.0, 4.5, 1e-6), d = opt ? h2plusOpt(R) : h2plus(R, 1);
  return { R, RA: R * K.bohrA, zeta: d.zeta, De: -d.bind, DeEv: -d.bind * K.hartreeEv, DeKj: -d.bind * K.hartreeEv * K.evKj, d };
}
// Reference: exact Born–Oppenheimer solution (Schaad & Hicks 1970; tabulated in Levine §13.4, Atkins): R_e = 1.9972 a0, D_e = 0.10263 Eh.
const H2P_EXACT = { R: 1.9972, De: 0.10263 };

/* ───────── linear algebra: Jacobi eigenvalues of a real symmetric matrix ───────── */
function eigSym(A) {
  const n = A.length, a = A.map(r => r.slice()), v = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
    if (off < 1e-22) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < n; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
    }
  }
  const idx = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[i][i] - a[j][j]);
  return { values: idx.map(i => a[i][i]), vectors: idx.map(i => v.map(row => row[i])) };
}

/* ───────── ch3: Hückel π-electron model (Hückel 1931; Atkins, Physical Chemistry, "Hückel approximation") ─────────
   E = α + xβ with β < 0, so the most bonding level has the largest x. One electron per carbon. */
function huckel(N, ring) {
  ring = !!ring && N >= 3;
  const H = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i + 1 < N; i++) { H[i][i + 1] = H[i + 1][i] = -1; }
  if (ring) { H[0][N - 1] = H[N - 1][0] = -1; }
  const e = eigSym(H);                      // ascending in "−x", i.e. most bonding first
  const x = e.values.map(v => -v);
  const occ = new Array(N).fill(0); let left = N;
  for (let i = 0; i < N && left > 0; i++) { occ[i] = Math.min(2, left); left -= occ[i]; }
  // degenerate partly filled shells: spread electrons evenly (Hund), needed for 4n rings
  for (let i = 0; i < N;) { let j = i; while (j + 1 < N && Math.abs(x[j + 1] - x[i]) < 1e-9) j++; if (j > i) { let s = 0; for (let k = i; k <= j; k++) s += occ[k]; for (let k = i; k <= j; k++) occ[k] = s / (j - i + 1); } i = j + 1; }
  const total = x.reduce((s, xi, i) => s + occ[i] * xi, 0);
  const pairs = Math.floor(N / 2), localized = 2 * pairs;   // N/2 isolated ethene bonds, 2β each (odd N: the lone electron sits at α)
  const iH = Math.ceil(N / 2) - 1, iL = iH + 1;
  const open = occ.some(o => o > 0 && o < 2);
  const gap = N % 2 === 0 && iL < N ? x[iH] - x[iL] : 0;
  const bonds = [];
  const bo = (i, j) => e.vectors.reduce((s, vec, k) => s + occ[k] * vec[i] * vec[j], 0);
  for (let i = 0; i + 1 < N; i++) bonds.push(bo(i, i + 1));
  if (ring) bonds.push(bo(N - 1, 0));
  return { N, ring, x, occ, total, localized, deloc: total - localized, gap, open, bonds, vectors: e.vectors };
}
const huckelChainExact = (N, k) => 2 * Math.cos(k * Math.PI / (N + 1));       // k = 1…N
const huckelRingExact = (N, k) => 2 * Math.cos(2 * Math.PI * k / N);           // k = 0…N−1
// longest-wavelength strong π→π* absorption of all-trans polyenes with N conjugated carbons (textbook values, nm)
const POLYENE_LMAX = [{ N: 2, nm: 165, name: 'C₂H₄' }, { N: 4, nm: 217, name: 'C₄H₆' }, { N: 6, nm: 258, name: 'C₆H₈' }, { N: 8, nm: 290, name: 'C₈H₁₀' }, { N: 22, nm: 452, name: 'β-carotene' }];
const BETA_REF = { N: 4, nm: 217 };   // |β| is set so that the model reproduces butadiene
function huckelBetaEv() { return K.hcEvNm / BETA_REF.nm / huckel(BETA_REF.N, false).gap; }
function huckelLambda(N, ring) { const g = huckel(N, ring).gap; return g > 1e-9 ? K.hcEvNm / (g * huckelBetaEv()) : Infinity; }
// diatomics of the first row of the MO diagram: electrons in σ, σ*; measured D0 (eV) and bond length (pm)
const MO_FILL = [
  { id: 'h2p', f: 'H₂⁺', nb: 1, na: 0, d0: 2.65, re: 106 },
  { id: 'h2', f: 'H₂', nb: 2, na: 0, d0: 4.48, re: 74 },
  { id: 'he2p', f: 'He₂⁺', nb: 2, na: 1, d0: 2.37, re: 108 },
  { id: 'he2', f: 'He₂', nb: 2, na: 2, d0: 0, re: null }
].map(m => Object.assign(m, { order: (m.nb - m.na) / 2 }));

/* ───────── ch4: unequal sharing ───────── */
// two-site model: H = [[−Δ/2, −b], [−b, +Δ/2]], two electrons in the lower orbital
function twoSite(delta, b) {
  const r = Math.sqrt(delta * delta / 4 + b * b);
  const wLow = r === 0 ? 0.5 : 0.5 * (1 + (delta / 2) / r);     // weight of the bonding orbital on the lower-energy atom
  return { eBond: -r, eAnti: r, split: 2 * r, wLow, wHigh: 1 - wLow, charge: 2 * wLow - 1, stabil: 2 * (r - delta / 2) };
}
const paulingIonic = dchi => 1 - Math.exp(-dchi * dchi / 4);     // Pauling, The Nature of the Chemical Bond (1960), ch. 3
// gas-phase molecules: Pauling electronegativity difference, dipole moment (D), bond length (pm)
const DIPOLES = [
  { f: 'HI', dchi: 0.46, mu: 0.448, r: 160.9 }, { f: 'HBr', dchi: 0.76, mu: 0.827, r: 141.4 }, { f: 'HCl', dchi: 0.96, mu: 1.109, r: 127.5 },
  { f: 'HF', dchi: 1.78, mu: 1.826, r: 91.7 }, { f: 'NaCl', dchi: 2.23, mu: 9.001, r: 236.1 }, { f: 'LiF', dchi: 3.00, mu: 6.327, r: 156.4 }
].map(m => Object.assign(m, { ionic: m.mu / (K.debyePerEA * m.r / 100) }));

// Madelung sums. Chain: 2 Σ (−1)^(k+1)/k → 2 ln 2.
function madelungChain(n) { let s = 0; for (let k = 1; k <= n; k++) s += (k % 2 ? 1 : -1) / k; return 2 * s; }
// NaCl, three ways of cutting the lattice off at "size n" (Borwein, Borwein & Taylor 1985; Evjen 1932)
function madelungNaCl(n) {
  let sphere = 0, cube = 0, evjen = 0;
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) for (let k = -n; k <= n; k++) {
    if (!i && !j && !k) continue;
    const r2 = i * i + j * j + k * k, t = (((i + j + k) & 1) ? 1 : -1) / Math.sqrt(r2);
    cube += t;
    if (r2 <= n * n) sphere += t;
    let w = 1; if (Math.abs(i) === n) w /= 2; if (Math.abs(j) === n) w /= 2; if (Math.abs(k) === n) w /= 2;
    evjen += w * t;
  }
  return { sphere, cube, evjen };
}
const MADELUNG_NACL = 1.747565;      // reference value (Borwein et al. 1985; Kittel, Introduction to Solid State Physics, ch. 3)
// NaCl, kJ/mol at 298 K (CRC Handbook / NIST-JANAF values as used in textbooks)
const BORN_HABER = { hf: -411.2, sub: 107.3, ie: 495.8, diss: 121.3, ea: -348.6 };
function bornHaber(d) { d = d || BORN_HABER; return d.hf - d.sub - d.ie - d.diss - d.ea; }     // lattice enthalpy, ions(g) → crystal
const NACL = { r0: 2.820, bornN: 8 };           // nearest-neighbour distance (Å), Born exponent (Kittel / Atkins)
function bornLande(M, r0, n) { M = M == null ? MADELUNG_NACL : M; r0 = r0 || NACL.r0; n = n || NACL.bornN; return -K.coulombKjA * M / r0 * (1 - 1 / n); }

/* ───────── ch5: tight-binding chain; tridiagonal eigenvalues by Sturm bisection ───────── */
function tridiagEig(d, e) { // d: diagonal (n), e: off-diagonal (n−1); returns ascending eigenvalues
  const n = d.length; let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) { const r = (i > 0 ? Math.abs(e[i - 1]) : 0) + (i < n - 1 ? Math.abs(e[i]) : 0); lo = Math.min(lo, d[i] - r); hi = Math.max(hi, d[i] + r); }
  const count = x => { let c = 0, q = 1; for (let i = 0; i < n; i++) { q = d[i] - x - (i > 0 ? e[i - 1] * e[i - 1] / q : 0); if (q === 0) q = 1e-300; if (q < 0) c++; } return c; };
  const out = [];
  for (let k = 0; k < n; k++) { let a = lo, b = hi; for (let it = 0; it < 60; it++) { const m = (a + b) / 2; if (count(m) > k) b = m; else a = m; } out.push((a + b) / 2); }
  return out;
}
// N atoms in a row, hopping −1 (unit |β|), on-site energies alternating ∓delta/2 (two kinds of atom)
function tbChain(N, delta) {
  delta = delta || 0;
  const d = Array.from({ length: N }, (_, i) => (i % 2 ? delta / 2 : -delta / 2)), e = new Array(Math.max(0, N - 1)).fill(-1);
  const E = tridiagEig(d, e), nOcc = Math.floor(N / 2);       // one electron per atom, two per level
  const gap = N >= 2 ? E[nOcc] - E[nOcc - 1] : 0;
  return { N, delta, E, nOcc, gap, width: E[N - 1] - E[0], homo: E[nOcc - 1], lumo: E[nOcc] };
}
const tbInfinite = delta => ({ gap: delta, width: 2 * Math.sqrt(delta * delta / 4 + 4) });   // N → ∞
const carrierFactor = (gapEv, T) => Math.exp(-gapEv / (2 * K.kBev * T));                     // exp(−Eg / 2kT)
const TB_BETA_EV = 2;   // |β| used to turn the chain's gap into eV for the readout: an illustrative value (BRIEF.md)
const GAPS = { ge: 0.66, si: 1.12, diamond: 5.47, nacl: 8.5 };                               // eV, 300 K (Kittel, table of band gaps)

/* ───────── ch6: electron pairs on a sphere (Thomson problem) and Coulson's hybrid rule ───────── */
function thomsonInit(n, seed) {
  const r = rng(seed || 1), p = [];
  for (let i = 0; i < n; i++) { const z = 2 * r() - 1, t = 2 * Math.PI * r(), s = Math.sqrt(1 - z * z); p.push([s * Math.cos(t), s * Math.sin(t), z]); }
  return p;
}
function thomsonEnergy(p) { let E = 0; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) E += 1 / Math.hypot(p[i][0] - p[j][0], p[i][1] - p[j][1], p[i][2] - p[j][2]); return E; }
function thomsonStep(p, eta) { // one step downhill along the sphere; returns the largest move
  const n = p.length, F = p.map(() => [0, 0, 0]);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const dx = p[i][0] - p[j][0], dy = p[i][1] - p[j][1], dz = p[i][2] - p[j][2], r = Math.hypot(dx, dy, dz) || 1e-9, k = 1 / (r * r * r);
    F[i][0] += dx * k; F[i][1] += dy * k; F[i][2] += dz * k; F[j][0] -= dx * k; F[j][1] -= dy * k; F[j][2] -= dz * k;
  }
  let mx = 0;
  for (let i = 0; i < n; i++) {
    const dot = F[i][0] * p[i][0] + F[i][1] * p[i][1] + F[i][2] * p[i][2];
    let tx = F[i][0] - dot * p[i][0], ty = F[i][1] - dot * p[i][1], tz = F[i][2] - dot * p[i][2];
    const tl = Math.hypot(tx, ty, tz), cap = 0.25 / eta; if (tl > cap) { tx *= cap / tl; ty *= cap / tl; tz *= cap / tl; }
    const x = p[i][0] + eta * tx, y = p[i][1] + eta * ty, z = p[i][2] + eta * tz, l = Math.hypot(x, y, z);
    mx = Math.max(mx, eta * Math.min(tl, cap));
    p[i][0] = x / l; p[i][1] = y / l; p[i][2] = z / l;
  }
  return mx;
}
function thomsonRelax(n, seed, maxIter) {
  const p = thomsonInit(n, seed); let it = 0;
  for (; it < (maxIter || 20000); it++) if (thomsonStep(p, 0.05) < 1e-10) break;
  return { p, E: thomsonEnergy(p), iters: it, angles: thomsonAngles(p) };
}
function thomsonAngles(p) { // distinct angles between pairs, degrees (to 0.1°), ascending
  const set = new Map();
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
    const c = Math.max(-1, Math.min(1, p[i][0] * p[j][0] + p[i][1] * p[j][1] + p[i][2] * p[j][2])), a = Math.round(Math.acos(c) * 1800 / Math.PI) / 10;
    set.set(a, (set.get(a) || 0) + 1);
  }
  return [...set.entries()].sort((a, b) => a[0] - b[0]).map(([deg, count]) => ({ deg, count }));
}
// Coulson: two equivalent spⁿ hybrids make an angle θ with cos θ = −1/n (Coulson, Valence, 1952)
const hybridAngle = n => Math.acos(-1 / n) * 180 / Math.PI;
function hybridFromAngle(deg) { const c = Math.cos(deg * Math.PI / 180); if (c >= -1e-9) return { n: Infinity, s: 0 }; const n = -1 / c; return { n, s: 1 / (1 + n) }; }
const ANGLES = [{ f: 'CH₄', deg: 109.47 }, { f: 'NH₃', deg: 106.7 }, { f: 'H₂O', deg: 104.5 }, { f: 'PH₃', deg: 93.3 }, { f: 'H₂S', deg: 92.1 }];  // NIST CCCBDB experimental geometries

/* ───────── ch7: Lennard-Jones and a small 2-D molecular dynamics (velocity Verlet) ─────────
   Reduced units: σ = ε = m = 1, k_B = 1. Potential truncated and shifted at r_c = 2.5 (Allen & Tildesley, Computer
   Simulation of Liquids, ch. 1 and 3; Verlet 1967; Swope et al. 1982 for the velocity form). Walls reflect. */
const LJ = { rc: 2.5, rmin: Math.pow(2, 1 / 6), argonEpsK: 119.8, argonSigmaA: 3.405 };  // argon: the values used by Verlet 1967 (Rahman 1964 used 120 K, 3.4 Å)
const lj = r => { const s6 = Math.pow(r, -6); return 4 * (s6 * s6 - s6); };
LJ.shift = lj(LJ.rc);
LJ.argonEpsKj = LJ.argonEpsK * K.R;
function mdForces(s) {
  const { N, x, y, fx, fy } = s, rc2 = LJ.rc * LJ.rc; let pe = 0;
  fx.fill(0); fy.fill(0);
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const dx = x[i] - x[j], dy = y[i] - y[j], r2 = dx * dx + dy * dy;
    if (r2 >= rc2) continue;
    const i2 = 1 / Math.max(r2, 0.36), i6 = i2 * i2 * i2, f = 24 * i2 * (2 * i6 * i6 - i6);
    fx[i] += f * dx; fy[i] += f * dy; fx[j] -= f * dx; fy[j] -= f * dy;
    pe += 4 * (i6 * i6 - i6) - LJ.shift;
  }
  s.pe = pe;
}
function mdInit(opts) {
  opts = opts || {};
  const cols = opts.cols || 8, rows = opts.rows || 6, N = cols * rows, W = opts.W || 22, H = opts.H || 14, a = LJ.rmin, r = rng(opts.seed || 7);
  const s = { N, W, H, x: new Float64Array(N), y: new Float64Array(N), vx: new Float64Array(N), vy: new Float64Array(N), fx: new Float64Array(N), fy: new Float64Array(N), pe: 0, ke: 0, t: 0, steps: 0 };
  const w = (cols - 1 + 0.5) * a, h = (rows - 1) * a * Math.sqrt(3) / 2;
  let k = 0, px = 0, py = 0; const T0 = opts.T == null ? 0.2 : opts.T;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++, k++) {
    s.x[k] = (W - w) / 2 + (i + (j % 2) / 2) * a; s.y[k] = (H - h) / 2 + j * a * Math.sqrt(3) / 2;
    s.vx[k] = gauss(r) * Math.sqrt(T0); s.vy[k] = gauss(r) * Math.sqrt(T0); px += s.vx[k]; py += s.vy[k];
  }
  for (let i = 0; i < N; i++) { s.vx[i] -= px / N; s.vy[i] -= py / N; }
  mdForces(s); mdKinetic(s);
  return s;
}
function mdKinetic(s) { let ke = 0; for (let i = 0; i < s.N; i++) ke += 0.5 * (s.vx[i] * s.vx[i] + s.vy[i] * s.vy[i]); s.ke = ke; s.T = ke / s.N; return ke; }
// one velocity-Verlet step; target = null for constant energy, else a Berendsen thermostat with time constant tau
function mdStep(s, dt, target, tau) {
  const { N, x, y, vx, vy, fx, fy, W, H } = s, h = dt / 2;
  for (let i = 0; i < N; i++) {
    vx[i] += h * fx[i]; vy[i] += h * fy[i]; x[i] += dt * vx[i]; y[i] += dt * vy[i];
    if (x[i] < 0) { x[i] = -x[i]; vx[i] = -vx[i]; } else if (x[i] > W) { x[i] = 2 * W - x[i]; vx[i] = -vx[i]; }
    if (y[i] < 0) { y[i] = -y[i]; vy[i] = -vy[i]; } else if (y[i] > H) { y[i] = 2 * H - y[i]; vy[i] = -vy[i]; }
  }
  mdForces(s);
  for (let i = 0; i < N; i++) { vx[i] += h * fx[i]; vy[i] += h * fy[i]; }
  mdKinetic(s);
  if (target != null && s.T > 0) {
    const lam = Math.sqrt(Math.max(0.25, Math.min(4, 1 + (dt / (tau || 0.5)) * (target / s.T - 1))));
    for (let i = 0; i < N; i++) { vx[i] *= lam; vy[i] *= lam; }
    mdKinetic(s);
  }
  s.t += dt; s.steps++;
}
function mdRun(s, n, dt, target, tau) { for (let i = 0; i < n; i++) mdStep(s, dt, target, tau); return s; }
// structure: neighbours within 1.5σ; mean count; share of particles with no neighbour (vapour); hexatic order |ψ6|
function mdOrder(s) {
  const N = s.N, nb = new Int32Array(N), re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const dx = s.x[j] - s.x[i], dy = s.y[j] - s.y[i], r2 = dx * dx + dy * dy;
    if (r2 > 2.25) continue;
    const th = 6 * Math.atan2(dy, dx); nb[i]++; nb[j]++; re[i] += Math.cos(th); im[i] += Math.sin(th); re[j] += Math.cos(th); im[j] += Math.sin(th);
  }
  let sum = 0, free = 0, psi = 0, core = 0;
  for (let i = 0; i < N; i++) { sum += nb[i]; if (nb[i] === 0) free++; if (nb[i] >= 5) { psi += Math.hypot(re[i], im[i]) / nb[i]; core++; } }
  return { mean: sum / N, free: free / N, psi6: core ? psi / core : 0, core: core / N, nb };
}
const MD_PHASE = { gasMean: 2.2, solidPsi: 0.88, solidCore: 0.3 };   // thresholds for the live sentence; tuned by eye (BRIEF.md)
function mdPhase(o) { return o.mean < MD_PHASE.gasMean ? 'gas' : (o.psi6 >= MD_PHASE.solidPsi && o.core >= MD_PHASE.solidCore ? 'solid' : 'liquid'); }
// typical energies, kJ/mol (ranges from textbooks; BRIEF.md) and kT
const kT = T => K.R * T;
const FORCES = [
  { id: 'ion', lo: 600, hi: 4000 }, { id: 'cov', lo: 150, hi: 1000 }, { id: 'met', lo: 60, hi: 850 },
  { id: 'hb', lo: 4, hi: 40 }, { id: 'dip', lo: 0.5, hi: 5 }, { id: 'disp', lo: 0.05, hi: 40 }
];
// normal boiling points, K (CRC Handbook)
const BOIL = {
  g14: [{ f: 'CH₄', p: 2, T: 111.7 }, { f: 'SiH₄', p: 3, T: 161.0 }, { f: 'GeH₄', p: 4, T: 185.0 }, { f: 'SnH₄', p: 5, T: 221.0 }],
  g16: [{ f: 'H₂O', p: 2, T: 373.15 }, { f: 'H₂S', p: 3, T: 212.9 }, { f: 'H₂Se', p: 4, T: 231.9 }, { f: 'H₂Te', p: 5, T: 271.0 }],
  noble: [{ f: 'He', T: 4.22 }, { f: 'Ne', T: 27.1 }, { f: 'Ar', T: 87.3 }, { f: 'Kr', T: 119.9 }, { f: 'Xe', T: 165.1 }]
};
function waterWithoutHBonds() { // straight line through H2S, H2Se, H2Te, read at period 2
  const pts = BOIL.g16.slice(1), n = pts.length, mx = pts.reduce((s, q) => s + q.p, 0) / n, my = pts.reduce((s, q) => s + q.T, 0) / n;
  const slope = pts.reduce((s, q) => s + (q.p - mx) * (q.T - my), 0) / pts.reduce((s, q) => s + (q.p - mx) * (q.p - mx), 0);
  const T = my + slope * (2 - mx);
  return { slope, T, C: T - 273.15, gap: BOIL.g16[0].T - T };
}
const HBOND_WATER = 21;                              // kJ/mol, one hydrogen bond in ice (textbook value, about 20–23)
const ICE = { ice: 0.9167, water: 0.9998 };           // g/cm³ at 0 °C (CRC Handbook)
const iceExpansion = () => ICE.water / ICE.ice - 1;

/* ───────── ch8: carbon, and a freely jointed chain ───────── */
const CARBON = { diamondBond: 154, graphiteBond: 142, graphiteLayer: 335, diamondDensity: 3.51, graphiteDensity: 2.26, ccBondKj: 346, layerKj: 5 };
function chain(N, seed) { // 2-D random flight of N unit steps
  const r = rng(seed || 1), x = new Float64Array(N + 1), y = new Float64Array(N + 1);
  for (let i = 1; i <= N; i++) { const t = 2 * Math.PI * r(); x[i] = x[i - 1] + Math.cos(t); y[i] = y[i - 1] + Math.sin(t); }
  return { N, x, y, R: Math.hypot(x[N], y[N]) };
}
const CHAIN_EX = [100, 1000];
function chainRms(N, samples, seed) { const r = rng(seed || 11); let s = 0; for (let k = 0; k < samples; k++) { let x = 0, y = 0; for (let i = 0; i < N; i++) { const t = 2 * Math.PI * r(); x += Math.cos(t); y += Math.sin(t); } s += x * x + y * y; } return Math.sqrt(s / samples); }

/* ───────── ch9: Levinthal's count and the HP lattice model (Lau & Dill 1989) ───────── */
function levinthal(residues, states, perSecond) {
  const log10n = residues * Math.log10(states), log10s = log10n - Math.log10(perSecond), log10y = log10s - Math.log10(3.15576e7);
  return { log10n, log10years: log10y, n: Math.pow(10, log10n), years: Math.pow(10, log10y), ageRatio: Math.pow(10, log10y) / 1.38e10 };
}
const LEVINTHAL = { residues: 100, states: 3, perSecond: 1e13 };
const DIRS = { R: [1, 0], U: [0, 1], L: [-1, 0], D: [0, -1] };
const HP_SEQS = { s10: 'HHPPHPPHPH', s12: 'HPPHPHPHPPHH', s14: 'HPPHPHPPHPHPPH' };
// a complete but poor fold of each sequence (one H–H contact), the state the lab opens in
const HP_START = { s10: 'RDRDDLLUR', s12: 'RRURRRRRDLD', s14: 'RUURRURDDDDDD' };
function hpFold(seq, dirs) { // dirs: string of R/U/L/D, one per bond placed so far
  const pts = [[0, 0]], used = new Map([['0,0', 0]]); let valid = true;
  for (let i = 0; i < dirs.length && i < seq.length - 1; i++) {
    const d = DIRS[dirs[i]], p = [pts[i][0] + d[0], pts[i][1] + d[1]], key = p[0] + ',' + p[1];
    if (used.has(key)) { valid = false; break; }
    used.set(key, i + 1); pts.push(p);
  }
  const contacts = [];
  for (let i = 0; i < pts.length; i++) {
    if (seq[i] !== 'H') continue;
    for (const d of [[1, 0], [0, 1]]) { const j = used.get((pts[i][0] + d[0]) + ',' + (pts[i][1] + d[1])); if (j != null && seq[j] === 'H' && Math.abs(j - i) > 1) contacts.push([i, j]); }
  }
  return { valid, pts, contacts, energy: -contacts.length, done: valid && pts.length === seq.length };
}
const hpCache = {};
function hpBest(seq) { // exhaustive search over self-avoiding walks, one per symmetry class
  if (hpCache[seq]) return hpCache[seq];
  const n = seq.length, S = 2 * n + 3, grid = new Int16Array(S * S).fill(-1), xs = new Int16Array(n), ys = new Int16Array(n), path = new Array(n - 1);
  let best = 0, count = 0, degeneracy = 0, bestDirs = '';
  const names = ['R', 'U', 'L', 'D'], dx = [1, 0, -1, 0], dy = [0, 1, 0, -1];
  xs[0] = n + 1; ys[0] = n + 1; grid[ys[0] * S + xs[0]] = 0;
  (function walk(i, e, turned) {
    if (i === n) { count++; if (e < best) { best = e; degeneracy = 1; bestDirs = path.join(''); } else if (e === best) { degeneracy++; if (!bestDirs) bestDirs = path.join(''); } return; }
    for (let d = 0; d < 4; d++) {
      if (i === 1 && d !== 0) continue;                 // first bond always to the right (rotations)
      if (!turned && d === 3) continue;                 // first turn always up (mirror image)
      if (!turned && d === 2) continue;
      const x = xs[i - 1] + dx[d], y = ys[i - 1] + dy[d];
      if (grid[y * S + x] >= 0) continue;
      let de = 0;
      if (seq[i] === 'H') for (let q = 0; q < 4; q++) { const j = grid[(y + dy[q]) * S + x + dx[q]]; if (j >= 0 && j !== i - 1 && seq[j] === 'H') de--; }
      xs[i] = x; ys[i] = y; grid[y * S + x] = i; path[i - 1] = names[d];
      walk(i + 1, e + de, turned || d === 1);
      grid[y * S + x] = -1;
    }
  })(1, 0, false);
  return (hpCache[seq] = { energy: best, count, degeneracy, dirs: bestDirs });
}

/* ───────── ch10: formal cost scaling of electronic-structure methods ─────────
   (Helgaker, Jørgensen & Olsen, Molecular Electronic-Structure Theory; Szabo & Ostlund) */
const SCALING = { mlip: 1, dft: 3, hf: 4, mp2: 5, ccsd: 6, ccsdt: 7 };
const costFactor = (method, sizeFactor) => Math.pow(sizeFactor, SCALING[method]);
const sizeForBudget = (method, budgetFactor) => Math.pow(budgetFactor, 1 / SCALING[method]);

return {
  K, fmt, sci, supStr, rng, gauss,
  boxE, boxMerge,
  h2plus, h2plusOpt, h2plusMin, H2P_EXACT, goldenMin,
  eigSym, huckel, huckelChainExact, huckelRingExact, POLYENE_LMAX, BETA_REF, huckelBetaEv, huckelLambda, MO_FILL,
  twoSite, paulingIonic, DIPOLES, madelungChain, madelungNaCl, MADELUNG_NACL, BORN_HABER, bornHaber, NACL, bornLande,
  tridiagEig, tbChain, tbInfinite, carrierFactor, GAPS, TB_BETA_EV,
  thomsonInit, thomsonEnergy, thomsonStep, thomsonRelax, thomsonAngles, hybridAngle, hybridFromAngle, ANGLES,
  LJ, lj, mdInit, mdForces, mdStep, mdRun, mdKinetic, mdOrder, mdPhase, MD_PHASE, kT, FORCES, BOIL, waterWithoutHBonds, ICE, iceExpansion, HBOND_WATER,
  CARBON, chain, chainRms, CHAIN_EX,
  levinthal, LEVINTHAL, DIRS, HP_SEQS, HP_START, hpFold, hpBest,
  SCALING, costFactor, sizeForBudget
};
});
