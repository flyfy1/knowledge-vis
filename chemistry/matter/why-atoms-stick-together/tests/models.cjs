'use strict';
// Pins the page's models against results typed from the textbooks and papers they implement, and against independent
// derivations (direct quadrature of the H2+ integrals, closed-form eigenvalues, brute-force enumeration, SI constants);
// then every number the prose binds ({=…}) against the value it should have; then copy keys used by app.js, language
// hygiene of the sources and of index.html, and the registry.
// Run: node chemistry/matter/why-atoms-stick-together/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..'), ROOT = path.join(DIR, '..', '..', '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const { unprefill } = require(path.join(ROOT, 'scripts', 'lib', 'prefill.cjs'));
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const pageJson = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); } }
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);

/* ── 1. constants, rebuilt from SI (CODATA 2018 exact values and mₑ, ε0) ── */
const SI = { h: 6.62607015e-34, e: 1.602176634e-19, me: 9.1093837015e-31, kB: 1.380649e-23, NA: 6.02214076e23, eps0: 8.8541878128e-12, c: 299792458 };
{
  near('h²/8m in eV nm²', M.K.boxEvNm2, SI.h * SI.h / (8 * SI.me) / SI.e * 1e18, 1e-6);
  near('eV → kJ/mol', M.K.evKj, SI.e * SI.NA / 1000, 1e-3);
  near('k_B in eV/K', M.K.kBev, SI.kB / SI.e, 1e-10);
  near('R in kJ/mol/K', M.K.R, SI.kB * SI.NA / 1000, 1e-8);
  near('hc in eV nm', M.K.hcEvNm, SI.h * SI.c / SI.e * 1e9, 1e-2);
  near('N_A e²/4πε0 in kJ Å/mol', M.K.coulombKjA, SI.NA * SI.e * SI.e / (4 * Math.PI * SI.eps0) * 1e10 / 1000, 1e-2);
  const a0 = 4 * Math.PI * SI.eps0 * (SI.h / 2 / Math.PI) ** 2 / (SI.me * SI.e * SI.e);
  near('bohr in Å', M.K.bohrA, a0 * 1e10, 1e-5);
  near('hartree in eV', M.K.hartreeEv, SI.e / (4 * Math.PI * SI.eps0 * a0), 1e-4);
  near('1 e·Å in debye', M.K.debyePerEA, SI.e * 1e-10 / 3.33564e-30, 1e-4);
}

/* ── 2. particle in a box ── */
{
  near('E1 of a 0.2 nm box', M.boxE(1, 0.2), SI.h * SI.h / (8 * SI.me * (0.2e-9) ** 2) / SI.e, 1e-5);
  check('E_n ∝ n²', M.boxE(3, 0.37) / M.boxE(1, 0.37), 9);
  const r = M.boxMerge(0.2);
  near('doubling the box quarters the energy', r.ratio, 0.25, 1e-12);
  near('drop is three quarters of E1', r.drop / r.narrow, 0.75, 1e-12);
  ok('a 0.1–0.2 nm box is of the order of the hydrogen ionisation energy (13.6 eV)', M.boxE(1, 0.2) < 13.6 && M.boxE(1, 0.1) > 13.6);
}

/* ── 3. H2+ LCAO: closed forms against direct quadrature, then the textbook numbers ── */
{
  // cylindrical quadrature of the three integrals for 1s orbitals (ζ = 1) at R = 2
  const R = 2, a = R / 2, h = 0.02; let S = 0, cou = 0, res = 0;
  for (let rho = h / 2; rho < 14; rho += h) for (let z = -14 + h / 2; z < 14; z += h) {
    const rA = Math.hypot(rho, z + a), rB = Math.hypot(rho, z - a), w = 2 * Math.PI * rho * h * h / Math.PI;
    S += w * Math.exp(-rA - rB); cou += w * Math.exp(-2 * rA) / rB; res += w * Math.exp(-rA - rB) / rA;
  }
  const d = M.h2plus(R, 1);
  near('overlap S(2) by quadrature', d.S, S, 2e-3);
  near('S(2) closed form', d.S, Math.exp(-2) * (1 + 2 + 4 / 3), 1e-12);
  near('Coulomb integral by quadrature', (1 - 3 * Math.exp(-4)) / 2, cou, 2e-3);
  near('resonance integral by quadrature', 3 * Math.exp(-2), res, 2e-3);
  // energy from the quadrature values: E± = E1s + 1/R − (J ± K)/(1 ± S)
  near('E+ at R = 2 from quadrature', d.bond.E, -0.5 + 1 / R - (cou + res) / (1 + S), 3e-3);
  near('E− at R = 2 from quadrature', d.anti.E, -0.5 + 1 / R - (cou - res) / (1 - S), 6e-3);
  near('E+(R = 2, ζ = 1) = −0.5538 Eh (Levine §13.5)', d.bond.E, -0.5538, 1e-4);
  near('separated limit is −0.5 Eh', M.h2plus(40, 1).bond.E, -0.5, 1e-6);
  ok('united-atom side is repulsive', M.h2plus(0.6, 1).bind > 0);
  const z1 = M.h2plusMin(false), op = M.h2plusMin(true);
  near('ζ = 1: R_e = 2.49 a0 (Atkins; Levine)', z1.R, 2.49, 0.01);
  near('ζ = 1: D_e = 1.76 eV', z1.DeEv, 1.76, 0.01);
  near('ζ = 1: D_e = 0.0648 Eh', z1.De, 0.0648, 1e-4);
  near('optimised: R_e = 2.00 a0 (Finkelstein & Horowitz)', op.R, 2.00, 0.01);
  near('optimised: ζ = 1.24', op.zeta, 1.238, 0.003);
  near('optimised: E = −0.5865 Eh', op.d.bond.E, -0.5865, 1e-4);
  near('optimised: D_e = 2.35 eV', op.DeEv, 2.35, 0.01);
  near('virial theorem at the optimised minimum: T = −E', op.d.bond.T, -op.d.bond.E, 1e-4);
  near('virial theorem: V = 2E', op.d.bond.V, 2 * op.d.bond.E, 2e-4);
  ok('with fixed orbitals the bond is a kinetic-energy drop', z1.d.bond.T < 0.5 && z1.d.bond.V > -1);
  ok('with optimised orbitals kinetic energy is up, potential down twice as much', op.d.bond.T > 0.5 && Math.abs((op.d.bond.V + 1) / (op.d.bond.T - 0.5) + 2) < 0.01);
  ok('variational: both stay above the exact D_e', z1.De < op.De && op.De < M.H2P_EXACT.De);
  ok('optimised ζ → 1 at large R and → 2 (He+) at small R', Math.abs(M.h2plusOpt(12).zeta - 1) < 0.01 && M.h2plusOpt(0.05).zeta > 1.9);
  near('prose: bond length off by a quarter', z1.R / M.H2P_EXACT.R - 1, 0.25, 0.03);
  ok('prose: bond energy short by more than a third', 1 - z1.De / M.H2P_EXACT.De > 1 / 3 && 1 - z1.De / M.H2P_EXACT.De < 0.4);
  ok('antibonding curve has no minimum', [1, 2, 3, 4, 6].every((R, i, a) => i === 0 || M.h2plus(R, 1).anti.E < M.h2plus(a[i - 1], 1).anti.E));
}

/* ── 4. Hückel: Jacobi eigenvalues against the closed forms ── */
{
  let worst = 0;
  for (let N = 2; N <= 22; N++) {
    const ch = M.huckel(N, false).x, exact = Array.from({ length: N }, (_, k) => M.huckelChainExact(N, k + 1)).sort((a, b) => b - a);
    ch.forEach((x, i) => { worst = Math.max(worst, Math.abs(x - exact[i])); });
    if (N >= 3) { const rg = M.huckel(N, true).x, ex = Array.from({ length: N }, (_, k) => M.huckelRingExact(N, k)).sort((a, b) => b - a); rg.forEach((x, i) => { worst = Math.max(worst, Math.abs(x - ex[i])); }); }
    const tri = M.tridiagEig(new Array(N).fill(0), new Array(N - 1).fill(-1)).map(v => -v).sort((a, b) => b - a);
    ch.forEach((x, i) => { worst = Math.max(worst, Math.abs(x - tri[i])); });
  }
  ok('chains and rings N = 2…22: Jacobi = closed form = Sturm bisection', worst < 1e-9, 'worst ' + worst);
  check('benzene levels (units of β)', M.huckel(6, true).x.map(v => v.toFixed(6)).join(), '2.000000,1.000000,1.000000,-1.000000,-1.000000,-2.000000');
  near('benzene total π energy 6α + 8β', M.huckel(6, true).total, 8, 1e-9);
  near('benzene delocalisation energy 2β', M.huckel(6, true).deloc, 2, 1e-9);
  near('butadiene levels ±1.618, ±0.618', M.huckel(4, false).x[0], (1 + Math.sqrt(5)) / 2, 1e-9);
  near('butadiene delocalisation energy 0.472β', M.huckel(4, false).deloc, 2 * Math.sqrt(5) - 4, 1e-9);
  near('butadiene π bond orders 0.894 / 0.447', M.huckel(4, false).bonds[0], 0.8944, 1e-4); near('butadiene central bond', M.huckel(4, false).bonds[1], 0.4472, 1e-4);
  near('benzene π bond order 2/3', M.huckel(6, true).bonds[0], 2 / 3, 1e-9);
  near('ethene has no delocalisation energy', M.huckel(2, false).deloc, 0, 1e-12);
  near('cyclobutadiene: none either', M.huckel(4, true).deloc, 0, 1e-9);
  for (const N of [6, 10, 14, 18, 22]) ok(`4n+2 ring N=${N}: closed shell with a gap`, M.huckel(N, true).gap > 0.3 && !M.huckel(N, true).open);
  for (const N of [4, 8, 12, 16, 20]) ok(`4n ring N=${N}: zero gap, open shell`, M.huckel(N, true).gap < 1e-9 && M.huckel(N, true).open);
  ok('chain gap falls with length', [2, 4, 6, 8, 22].every((N, i, a) => i === 0 || M.huckel(N, false).gap < M.huckel(a[i - 1], false).gap));
  near('chain gap = 4 sin(π / 2(N+1))', M.huckel(22, false).gap, 4 * Math.sin(Math.PI / 46), 1e-9);
  near('|β| calibrated on butadiene: model gives 217 nm back', M.huckelLambda(4, false), 217, 1e-9);
  ok('model wavelengths: right order, too long for long chains', M.huckelLambda(2, false) < 165 && M.huckelLambda(6, false) > 258 && M.huckelLambda(22, false) > 2 * 452);
  ok('benzene is more stable per electron than hexatriene', M.huckel(6, true).total > M.huckel(6, false).total);
  check('bond orders of the first-row diatomics', M.MO_FILL.map(m => m.order).join(), '0.5,1,0.5,0');
  ok('measured bond energy follows bond order', M.MO_FILL[1].d0 > M.MO_FILL[0].d0 && M.MO_FILL[0].d0 > M.MO_FILL[3].d0 && M.MO_FILL[2].d0 > M.MO_FILL[3].d0);
  // eigenvectors really are eigenvectors
  const e = M.eigSym([[2, 1, 0], [1, 3, 1], [0, 1, 4]]); let res = 0;
  e.values.forEach((lam, k) => { const v = e.vectors[k]; [[2, 1, 0], [1, 3, 1], [0, 1, 4]].forEach((row, i) => { res = Math.max(res, Math.abs(row.reduce((s, a, j) => s + a * v[j], 0) - lam * v[i])); }); });
  ok('Jacobi: A v = λ v', res < 1e-10);
}

/* ── 5. unequal sharing, Madelung, Born–Haber ── */
{
  for (const [D, b] of [[0, 1], [2, 1], [8, 0.5], [3, 2]]) {
    const r = M.twoSite(D, b), e = M.eigSym([[D / 2, -b], [-b, -D / 2]]);
    near(`two-site energies D=${D} b=${b}`, r.eBond, e.values[0], 1e-10);
    near(`two-site weight on the lower atom D=${D} b=${b}`, r.wLow, e.vectors[0][1] ** 2, 1e-10);
  }
  near('equal atoms share equally', M.twoSite(0, 2).wLow, 0.5, 1e-12);
  ok('charge grows with Δ/β and saturates below 1', M.twoSite(1, 2).charge < M.twoSite(3, 2).charge && M.twoSite(10, 0.5).charge > 0.9 && M.twoSite(10, 0.5).charge < 1);
  const ion = k => M.DIPOLES.find(m => m.f === k).ionic;
  near('HCl: μ/(e r) = 18%', ion('HCl'), 1.109 * 3.33564e-30 / (SI.e * 127.5e-12), 1e-4);
  ok('ionic character rises along HI, HBr, HCl, HF, NaCl, LiF', M.DIPOLES.every((m, i, a) => i === 0 || m.ionic > a[i - 1].ionic));
  ok('no molecule is 0% or 100%', M.DIPOLES.every(m => m.ionic > 0.03 && m.ionic < 0.9));
  near('Pauling ionic character at Δχ = 1.7 is about half', M.paulingIonic(1.7), 0.51, 0.01);
  // Madelung
  near('1-D chain → 2 ln 2', M.madelungChain(200000), 2 * Math.log(2), 1e-5);
  ok('1-D partial sums bracket 2 ln 2', M.madelungChain(11) > 2 * Math.log(2) && M.madelungChain(12) < 2 * Math.log(2));
  near('NaCl by neutral cubes, n = 8', M.madelungNaCl(8).evjen, 1.7476, 5e-5);
  near('reference value', M.MADELUNG_NACL, 1.7476, 5e-5);
  near('Evjen n = 3 is already within 0.001', M.madelungNaCl(3).evjen, M.MADELUNG_NACL, 1e-3);
  near('first shell alone is 6', M.madelungNaCl(1).sphere, 6, 1e-12);
  const sph = []; for (let k = 6; k <= 12; k++) sph.push(M.madelungNaCl(k).sphere);
  ok('sums over spheres keep jumping by more than 1', Math.max(...sph) - Math.min(...sph) > 1);
  ok('sums over whole cubes close in on the constant', Math.abs(M.madelungNaCl(12).cube - M.MADELUNG_NACL) < Math.abs(M.madelungNaCl(4).cube - M.MADELUNG_NACL) && Math.abs(M.madelungNaCl(12).cube - M.MADELUNG_NACL) < 0.06);
  check('first neighbour shells of rock salt: 6, 12, 8', (() => { const c = {}; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) { const r2 = i * i + j * j + k * k; if (r2 && r2 <= 3) c[r2] = (c[r2] || 0) + 1; } return [c[1], c[2], c[3]].join(); })(), '6,12,8');
  const d = M.BORN_HABER;
  near('Born–Haber lattice enthalpy −787 kJ/mol', M.bornHaber(), -787, 0.5);
  near('cycle closes', d.sub + d.diss + d.ie + d.ea + M.bornHaber(), d.hf, 1e-9);
  near('Born–Landé from SI constants', M.bornLande(), -SI.NA * 1.747565 * SI.e * SI.e / (4 * Math.PI * SI.eps0 * 2.82e-10) * (1 - 1 / 8) / 1000, 0.05);
  ok('electrostatic model is within 5% of the cycle', Math.abs(M.bornLande() / M.bornHaber() - 1) < 0.05);
  ok('making the ions costs energy: IE > |EA|', d.ie > -d.ea);
}

/* ── 6. bands ── */
{
  let worst = 0;
  for (const N of [2, 7, 40, 80]) { const t = M.tbChain(N, 0), ex = Array.from({ length: N }, (_, k) => -2 * Math.cos((k + 1) * Math.PI / (N + 1))).sort((a, b) => a - b); t.E.forEach((E, i) => { worst = Math.max(worst, Math.abs(E - ex[i])); }); }
  ok('uniform chain: Sturm bisection = α + 2β cos(kπ/(N+1))', worst < 1e-9, 'worst ' + worst);
  const dense = (N, D) => { const H = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? (i % 2 ? D / 2 : -D / 2) : Math.abs(i - j) === 1 ? -1 : 0))); return M.eigSym(H).values; };
  const t = M.tbChain(24, 1.3), e = dense(24, 1.3); ok('two-atom chain: Sturm = Jacobi', t.E.every((E, i) => Math.abs(E - e[i]) < 1e-8));
  ok('band width stays inside 4|β| and approaches it', M.tbChain(80, 0).width < 4 && M.tbChain(80, 0).width > 3.99);
  near('gap halves when N doubles', M.tbChain(80, 0).gap / M.tbChain(40, 0).gap, 0.5, 0.02);
  for (const D of [0.5, 1, 3]) { near(`gap → Δ = ${D}`, M.tbChain(400, D).gap, D, 0.01 * D + 0.002); near(`width → 2√(Δ²/4 + 4), Δ = ${D}`, M.tbChain(400, D).width, M.tbInfinite(D).width, 1e-3); }
  ok('no level inside the gap', (() => { const q = M.tbChain(80, 2); return q.E.every(E => Math.abs(E) >= 1 - 1e-9); })());
  near('exp(−Eg/2kT) for silicon at 300 K', M.carrierFactor(1.12, 300), Math.exp(-1.12 * SI.e / (2 * SI.kB * 300)), 1e-15);
  ok('diamond is 36 orders of magnitude below silicon', Math.log10(M.carrierFactor(M.GAPS.si, 300) / M.carrierFactor(M.GAPS.diamond, 300)) > 36);
}

/* ── 7. electron pairs on a sphere; hybrids ── */
{
  // minimum energies of the Thomson problem (Erber & Hockney 1991, table; Wikipedia "Thomson problem")
  const want = { 2: 0.5, 3: 1.732051, 4: 3.674235, 5: 6.474691, 6: 9.985281 };
  for (let k = 2; k <= 6; k++) for (const seed of [1, 2, 9]) near(`Thomson N=${k} seed ${seed}`, M.thomsonRelax(k, seed).E, want[k], 2e-6);
  const ang = k => M.thomsonRelax(k, 4).angles.map(a => a.deg + '×' + a.count).join(' ');
  check('2 pairs: linear', ang(2), '180×1'); check('3 pairs: trigonal planar', ang(3), '120×3');
  check('4 pairs: tetrahedral', ang(4), '109.5×6'); check('5 pairs: trigonal bipyramid', ang(5), '90×6 120×3 180×1'); check('6 pairs: octahedral', ang(6), '90×12 180×3');
  near('sp³ angle = arccos(−1/3)', M.hybridAngle(3), 109.4712, 1e-4); near('sp²', M.hybridAngle(2), 120, 1e-9); near('sp', M.hybridAngle(1), 180, 1e-9);
  near('inverse: 109.47° is sp³', M.hybridFromAngle(109.4712).n, 3, 1e-4);
  near('water (104.5°): n = 4.0, s = 20%', M.hybridFromAngle(104.5).n, 3.99, 0.01); near('water s character', M.hybridFromAngle(104.5).s, 0.2, 0.001);
  ok('H2S (92.1°): almost pure p', M.hybridFromAngle(92.1).s < 0.04);
  check('90° is pure p', M.hybridFromAngle(90).s, 0);
}

/* ── 8. Lennard-Jones and the molecular dynamics ── */
{
  near('V(σ) = 0', M.lj(1), 0, 1e-12);
  near('minimum at 2^(1/6) σ', M.goldenMin(M.lj, 0.9, 2, 1e-9), Math.pow(2, 1 / 6), 1e-6);
  near('depth ε', M.lj(M.LJ.rmin), -1, 1e-12);
  near('argon ε in kJ/mol', M.LJ.argonEpsKj, 119.8 * SI.kB * SI.NA / 1000, 1e-6);
  // force = −dV/dr on a pair
  const s2 = { N: 2, W: 20, H: 20, x: Float64Array.of(5, 6.3), y: Float64Array.of(5, 5), vx: new Float64Array(2), vy: new Float64Array(2), fx: new Float64Array(2), fy: new Float64Array(2) };
  M.mdForces(s2); const hh = 1e-6;
  near('pair force = −dV/dr', s2.fx[1], -(M.lj(1.3 + hh) - M.lj(1.3 - hh)) / (2 * hh), 1e-6);
  near('Newton III', s2.fx[0] + s2.fx[1], 0, 1e-12);
  near('pair energy is the shifted potential', s2.pe, M.lj(1.3) - M.lj(2.5), 1e-12);
  // constant-energy runs: drift, and second-order convergence
  const drift = dt => { const s = M.mdInit({ T: 0.3 }), E0 = s.pe + s.ke; let mx = 0; const steps = Math.round(50 / dt); for (let i = 0; i < steps; i++) { M.mdStep(s, dt, null); mx = Math.max(mx, Math.abs(s.pe + s.ke - E0)); } return mx / Math.abs(E0); };
  const d1 = drift(0.01), d2 = drift(0.005);
  ok('energy drift at the page step (dt = 0.01, 5,000 steps) below 1e-3', d1 < 1e-3, 'relative ' + d1.toExponential(2));
  ok('prose: drift is a few parts in ten thousand', d1 < 9e-4);
  ok('halving dt cuts the energy error about fourfold (velocity Verlet is second order)', d1 / d2 > 2.5 && d1 / d2 < 6, 'ratio ' + (d1 / d2).toFixed(2));
  // momentum of the crystal starts at zero; reversibility over a short run
  const s = M.mdInit({ T: 0.2 }); let px = 0; for (let i = 0; i < s.N; i++) px += s.vx[i]; near('no net momentum at start', px, 0, 1e-10);
  const x0 = Array.from(s.x); M.mdRun(s, 200, 0.005, null); for (let i = 0; i < s.N; i++) { s.vx[i] = -s.vx[i]; s.vy[i] = -s.vy[i]; } M.mdRun(s, 200, 0.005, null);
  ok('time-reversible: running back returns the start', x0.every((v, i) => Math.abs(v - s.x[i]) < 1e-6));
  check('48 atoms', M.mdInit().N, 48);
  // thermostat and phases (time averages after equilibration)
  const phase = T => { const q = M.mdInit({ T: 0.2 }); M.mdRun(q, 12000, 0.01, T); const a = { mean: 0, free: 0, psi6: 0, core: 0, T: 0 }; let k = 0; for (let i = 0; i < 4000; i++) { M.mdStep(q, 0.01, T); if (i % 100 === 0) { const o = M.mdOrder(q); for (const key of ['mean', 'free', 'psi6', 'core']) a[key] += o[key]; a.T += q.T; k++; } } for (const key in a) a[key] /= k; return a; };
  const cold = phase(0.15), mid = phase(0.45), hot = phase(0.9);
  near('thermostat holds T = 0.15', cold.T, 0.15, 0.02); near('thermostat holds T = 0.9', hot.T, 0.9, 0.08);
  check('T = 0.15: solid', M.mdPhase(cold), 'solid'); check('T = 0.45: liquid with vapour', M.mdPhase(mid), 'liquid'); check('T = 0.9: gas', M.mdPhase(hot), 'gas');
  ok('cold crystal is hexagonal (|ψ6| > 0.9)', cold.psi6 > 0.9); ok('no vapour when cold', cold.free === 0); ok('hot: a third or more of the atoms are alone', hot.free > 0.3);
  ok('prose: melting near 0.4, boiling near 0.5', M.mdPhase(phase(0.3)) === 'solid' && M.mdPhase(phase(0.6)) === 'gas');
  // tabulated data
  const w = M.waterWithoutHBonds();
  near('line through H2S, H2Se, H2Te at period 2', w.T, 238.6 - 2 * (271.0 - 212.9) / 2, 1e-9);
  ok('group 14 boiling points rise monotonically', M.BOIL.g14.every((q, i, a) => i === 0 || q.T > a[i - 1].T));
  ok('water is the exception in group 16', M.BOIL.g16[0].T > M.BOIL.g16[3].T && M.BOIL.g16.slice(1).every((q, i, a) => i === 0 || q.T > a[i - 1].T));
  near('kT at 298.15 K', M.kT(298.15), SI.kB * SI.NA * 298.15 / 1000, 1e-6);
  near('ice expands 9%', M.iceExpansion(), 0.0907, 1e-3);
  ok('energy ladder: bonds are far above kT, molecular forces straddle it', M.FORCES.slice(0, 3).every(q => q.lo > 20 * M.kT(298.15)) && M.FORCES.slice(3).every(q => q.lo < 2 * M.kT(298.15)));
}

/* ── 9. chain, Levinthal, HP ── */
{
  for (const N of [100, 1000]) near(`rms end-to-end of ${N} links ≈ √N`, M.chainRms(N, 2000, 11) / Math.sqrt(N), 1, 0.04);
  near('page sample (400 chains) within 8%', M.chainRms(306, 400, 11) / Math.sqrt(306), 1, 0.08);
  check('a chain has N + 1 beads', M.chain(50, 3).x.length, 51);
  ok('every link has unit length', (() => { const c = M.chain(200, 5); for (let i = 1; i <= 200; i++) if (Math.abs(Math.hypot(c.x[i] - c.x[i - 1], c.y[i] - c.y[i - 1]) - 1) > 1e-12) return false; return true; })());
  const lv = M.levinthal(100, 3, 1e13);
  near('3^100', lv.log10n, 100 * Math.log10(3), 1e-12); ok('3^100 ≈ 5 × 10^47', Math.abs(lv.n / 5.1537752e47 - 1) < 1e-6);
  near('years', lv.years, 5.1537752e47 / 1e13 / 3.15576e7, 1e20);
  // self-avoiding walks on the square lattice: c_9, c_11, c_13 (OEIS A001411) → classes under the 8 symmetries: (c + 4) / 8
  const saw = { s10: 16268, s12: 120292, s14: 881500 };
  for (const k in M.HP_SEQS) {
    const seq = M.HP_SEQS[k], best = M.hpBest(seq);
    check(`${k}: number of folds`, best.count, (saw[k] + 4) / 8);
    check(`${k}: the ground state is unique`, best.degeneracy, 1);
    const f = M.hpFold(seq, best.dirs); ok(`${k}: the reported best fold is valid and has that energy`, f.done && f.energy === best.energy);
    const st = M.hpFold(seq, M.HP_START[k]); ok(`${k}: the opening fold is complete and poor`, st.done && st.energy === -1 && st.energy > best.energy);
  }
  check('ground-state contacts', Object.values(M.HP_SEQS).map(s => -M.hpBest(s).energy).join(), '4,5,6');
  // brute force over every direction string, independent of the symmetry-reduced search
  for (const k of ['s10', 's12']) {
    const seq = M.HP_SEQS[k], L = seq.length - 1; let min = 0, cnt = 0, total = 0; const D = 'RULD';
    for (let code = 0; code < 4 ** L; code++) { let s = '', c = code; for (let i = 0; i < L; i++) { s += D[c & 3]; c >>= 2; } const f = M.hpFold(seq, s); if (!f.done) continue; total++; if (f.energy < min) { min = f.energy; cnt = 1; } else if (f.energy === min) cnt++; }
    check(`${k}: brute-force walk count`, total, saw[k]);
    check(`${k}: brute-force minimum`, min, M.hpBest(seq).energy);
    check(`${k}: brute-force minima are the 8 images of one fold`, cnt, 8);
  }
  check('a fold that steps on itself is invalid', M.hpFold('HPHP', 'RL').valid, false);
  check('H–H contact counted once, neighbours along the chain not counted', M.hpFold('HPPH', 'RUL').energy, -1);
  ok('folds grow about sevenfold per two residues', M.hpBest(M.HP_SEQS.s14).count / M.hpBest(M.HP_SEQS.s12).count > 7 && M.hpBest(M.HP_SEQS.s14).count / M.hpBest(M.HP_SEQS.s12).count < 8);
}

/* ── 10. cost scaling ── */
{
  check('DFT ×2 → ×8', M.costFactor('dft', 2), 8); check('CCSD(T) ×2 → ×128', M.costFactor('ccsdt', 2), 128); check('HF ×10', M.costFactor('hf', 10), 1e4);
  near('1000× the computer: CCSD(T) grows 2.68×', M.sizeForBudget('ccsdt', 1000), Math.pow(1000, 1 / 7), 1e-12);
  ok('more accurate is more expensive', ['mlip', 'dft', 'hf', 'mp2', 'ccsd', 'ccsdt'].every((m, i, a) => i === 0 || M.SCALING[m] > M.SCALING[a[i - 1]]));
}

/* ── 11. every bound number in the prose ── */
{
  const want = {
    'ch1.L': '0.2', 'ch1.e1': '9.4', 'ch1.e2': '2.35', 'ch1.drop': '7.05', 'ch1.kj': '680',
    'ch2.z1R': '2.49', 'ch2.z1pm': '132', 'ch2.z1De': '1.76', 'ch2.exR': '2.00', 'ch2.expm': '106', 'ch2.exDe': '2.79',
    'ch2.z1dT': '3.19', 'ch2.z1dV': '1.43', 'ch2.optR': '2.00', 'ch2.optZ': '1.24', 'ch2.optDe': '2.35', 'ch2.optGap': '0.44', 'ch2.optdT': '2.35', 'ch2.optdV': '4.71',
    'ch3.h2ev': '4.48', 'ch3.h2kj': '432', 'ch3.butDel': '0.47', 'ch3.benDel': '2.00', 'ch3.benBo': '0.67', 'ch3.beta': '4.62',
    'ch3.l2exp': '165', 'ch3.l4exp': '217', 'ch3.l6exp': '258', 'ch3.l22exp': '452', 'ch3.l2': '134', 'ch3.l6': '301', 'ch3.l22': '983',
    'ch4.hcl': '18%', 'ch4.hf': '41%', 'ch4.nacl': '79%', 'ch4.chain': '1.386', 'ch4.sph1': '6.00', 'ch4.sph2': '−0.87', 'ch4.sph3': '5.83', 'ch4.sph4': '−4.51',
    'ch4.ev3': '1.747', 'ch4.r0': '282', 'ch4.bn': '8', 'ch4.bl': '−753', 'ch4.bh': '−787', 'ch4.blErr': '4%', 'ch4.ie': '496', 'ch4.ea': '349',
    'ch5.kt': '0.026', 'ch5.b': '2', 'ch5.si': '1.12', 'ch5.dia': '5.47', 'ch5.siF': '4 × 10⁻¹⁰', 'ch5.diaF': '1 × 10⁻⁴⁶',
    'ch6.tet': '109.5', 'ch6.h2o': '104.5', 'ch6.h2oN': '4.0', 'ch6.h2s': '92.1', 'ch6.h2sN': '27', 'ch6.h2sS': '3.5%', 'ch6.ph3': '93.3',
    'ch7.kt': '2.5', 'ch7.arEps': '1.0', 'ch7.arSig': '341', 'ch7.rmin': '1.12', 'ch7.extK': '181', 'ch7.extC': '−93', 'ch7.extGap': '193', 'ch7.ice': '9%',
    'ch8.dB': '154', 'ch8.gB': '142', 'ch8.gL': '335', 'ch8.cc': '346', 'ch8.layer': '5', 'ch8.ratio': '70', 'ch8.N1': '100', 'ch8.N2': '1,000', 'ch8.r1': '10', 'ch8.r2': '32',
    'ch9.n': '100', 'ch9.s': '3', 'ch9.conf': '5 × 10⁴⁷', 'ch9.years': '2 × 10²⁷', 'ch9.age': '1 × 10¹⁷', 'ch9.c12': '15,037', 'ch9.e12': '5', 'ch9.c14': '110,188',
    'ch10.dft2': '8', 'ch10.cc2': '128', 'ch10.g': '2.7', 'ch11.hb': '8'
  };
  check('the set of bindings', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
  // independent spot derivations of bindings that combine several model outputs
  check('ch2.optGap = exact − optimised', B['ch2.optGap'], (2.79 - 2.35).toFixed(2));
  check('ch4.blErr', B['ch4.blErr'], Math.round((787 - 753) / 787 * 100) + '%');
  check('ch7.extGap = 373.15 − extrapolated', B['ch7.extGap'], String(Math.round(373.15 - 180.5)));
  check('ch3.h2kj = 4.48 eV', B['ch3.h2kj'], String(Math.round(4.48 * 96.4853)));
  check('ch9.age = years / 1.38e10', B['ch9.age'], M.sci(1.633e27 / 1.38e10, 0));
  ok('no unbound {=…} left in the copy', !Object.values(Z).some(v => /\{=/.test(v)));
  // literal numbers in the prose that restate a diagram or model fact
  ok('prose: benzene is more than four times butadiene', M.huckel(6, true).deloc / M.huckel(4, false).deloc > 4 && /四倍多/.test(Z['ch3.p5'] + Z['ch3.p6'] + Z['ch3.p7']));
  ok('prose: Evjen reaches the constant in three layers', /三层/.test(Object.keys(Z).filter(k => /^ch4\.p\d+$/.test(k)).map(k => Z[k]).join('')));
}

/* ── 12. formatting ── */
{
  check('fmt', M.fmt(-787.04, 0), '−787'); check('fmt zero has no sign', M.fmt(-0.0001, 2), '0.00'); check('fmt groups', M.fmt(110188, 0), '110,188');
  check('sci', M.sci(3.912e-10, 0), '4 × 10⁻¹⁰'); check('sci carries', M.sci(9.99e5, 1), '1.0 × 10⁶'); check('sci positive exponent', M.sci(5.15e47, 0), '5 × 10⁴⁷');
}

/* ── 13. copy, sources and markup hygiene ── */
{
  const CJK = /[　-〿㐀-鿿＀-￯]/;
  const used = new Set(); for (const m of app.matchAll(/\bt\(\s*'([\w.-]+)'\s*[,)]/g)) used.add(m[1]);
  for (const m of app.matchAll(/'((?:ch\d+|u)\.[\w.-]+)'/g)) used.add(m[1]);
  const missing = [...used].filter(k => !(k in Z) && !k.endsWith('.'));
  ok('every copy key app.js names exists', !missing.length, missing.join(', '));
  for (const [prefix, vals] of Object.entries(pageJson.dynamicKeys || {})) for (const v of vals) ok(`dynamic key ${prefix}.${v}`, (prefix + '.' + v) in Z);
  ok('no Chinese in app.js', !CJK.test(app.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')));
  ok('no Chinese in models.js', !CJK.test(fs.readFileSync(path.join(DIR, 'models.js'), 'utf8')));
  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) ok(`no Chinese in figures/${f}`, !CJK.test(fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')));
  // literal text in the diagram partials is language-neutral: formulas, digits, units, symbols
  const NEUTRAL = /^[\dA-Za-z₀-₉⁰-⁹¹²³⁺⁻½①-⑥σεβ∞→√°%·.,\s+\-−=/()|…]+$/;
  for (const f of fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-'))) {
    const src = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    for (const m of src.matchAll(/<text\b[^>]*>([^<]+)<\/text>/g)) ok(`${f}: literal label "${m[1]}" is language-neutral`, NEUTRAL.test(m[1]) && !/[a-z]{4,}/.test(m[1].replace(/kJ\/mol/, '')));
    ok(`${f}: generated header`, src.startsWith('<!-- GENERATED by tools/diagrams.cjs'));
    check(`${f}: a wide and a narrow drawing`, (src.match(/<svg class="[wn]"/g) || []).join(''), '<svg class="w"<svg class="n"');
    for (const m of src.matchAll(/font-size="([\d.]+)"/g)) ok(`${f}: font size ${m[1]} ≥ 12`, +m[1] >= 12);
  }
  const bare = unprefill(html, Z).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');
  const stray = bare.replace(/<title>[^<]*<\/title>|<meta name="description"[^>]*>|aria-label="[^"]*"/g, '').replace(/>中</g, '><').match(new RegExp(CJK.source + '.{0,12}', 'g')) || [];
  const strayOwn = stray.filter(s => !/site-nav|首页|化学|物质/.test(s));
  ok('index.html holds no hand-written Chinese outside the generated chrome', strayOwn.length <= 6, strayOwn.slice(0, 6).join(' | '));
  check('diagrams in the page', (html.match(/<figure class="dia"/g) || []).length, 12);
  check('models in the page', (html.match(/<figure class="lab"/g) || []).length, 11);
  check('chapters', (html.match(/<section[^>]*id="ch\d+"/g) || []).length, 11);
  ok('each live sentence is an aria-live region', (html.match(/class="say"[^>]*aria-live="polite"/g) || []).length === 12);
  ok('no provenance label yet (unregistered draft)', !/class="page-provenance"/.test(html));
  ok('English is declared a stub', pageJson.languages && pageJson.languages.en === 'stub' && !pageJson.status);
  // every live-sentence template only uses placeholders app.js supplies (checked by the browser test); here: none is empty
  for (const k of Object.keys(Z).filter(k => /\.say(\.|$)|\.say2\./.test(k))) ok(`sentence ${k} is a full sentence`, Z[k].length > 12);
  // frontier facts carry a date
  for (const k of Object.keys(Z).filter(k => /^ch10\.(d|c)\d$/.test(k))) ok(`${k} carries a year`, /20\d\d 年/.test(Z[k]));
}

/* ── 14. registry ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry desc = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry title = hero title', R.title.zh, Z['hero.title']);
  check('registry path', R.path, 'chemistry/matter/why-atoms-stick-together/');
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-registry.json'), 'utf8'));
  const live = new Set((Array.isArray(site.pages) ? site.pages : Object.values(site.pages)).map(p => p.path.split('/').filter(Boolean).pop()));
  const ids = new Set();
  for (const c of R.concepts) {
    ok(`concept ${c.id}: unique id`, !ids.has(c.id)); ids.add(c.id);
    ok(`concept ${c.id}: anchor exists`, new RegExp(`id="${c.anchor.slice(1)}"`).test(html));
    ok(`concept ${c.id}: names, descriptions and aliases in both languages`, c.title.zh && c.title.en && c.desc.zh && c.desc.en && c.aliases.zh.length >= 3 && c.aliases.en.length >= 3);
    ok(`concept ${c.id}: English fields hold no Chinese`, !/[㐀-鿿]/.test(c.title.en + c.desc.en + c.aliases.en.join('')));
    for (const s of c.relatedPages) ok(`concept ${c.id}: related page ${s} is live`, live.has(s));
  }
  ok('every chapter has a concept', Array.from({ length: 11 }, (_, i) => '#ch' + (i + 1)).every(a => R.concepts.some(c => c.anchor === a)));
  ok('question-form aliases present', R.concepts.filter(c => c.aliases.zh.some(a => /为什么|是什么|怎么/.test(a))).length >= 10);
}

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`OK ${n} model checks`);
