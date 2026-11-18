'use strict';
// Pins the page's models against textbook and published values, with constants typed here rather than read from
// models.js: the 1-D FDTD (wave speed, energy conservation, the Courant limit, Fresnel reflection at an index step);
// the dipole pattern integrals; sunlight, radiation pressure and Malus's law; the Debye model of water; the ITU-R
// P.676-13 line-by-line sum against ITU's own validation rows; AM/FM spectra against Bessel functions; the Friis
// link budgets; fibre loss and guidance; Airy/Rayleigh/Sparrow; the array factor. Then every number the prose binds
// ({=…}) against an independent derivation, the literal claims in the prose, the dated frontier block, the copy keys
// app.js uses, language hygiene and the registry.
// Run: node physics/electromagnetism/what-travels-through-empty-space/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const load = l => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx); return ctx.window.ESSAY_COPY[l]; };
const Z = load('zh'), E = load('en');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const modelSrc = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
const md = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } }
function near(name, got, want, rel) { n++; if (!(Math.abs(got - want) <= rel * Math.abs(want))) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} within ${rel}`); } }

// constants typed here (CODATA 2022; SI 2019 exact values; IAU 2012/2015)
const c = 299792458, h = 6.62607015e-34, qe = 1.602176634e-19, kB = 1.380649e-23, me = 9.1093837139e-31;
const mu0 = 1.25663706127e-6, eps0 = 8.8541878188e-12, au = 149597870700, a0 = 5.29177210544e-11;
const comma = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fx = (x, d) => { const s = Math.abs(x).toFixed(d), [i, f] = s.split('.'); return (x < 0 && +s !== 0 ? '−' : '') + comma(i) + (f ? '.' + f : ''); };
const pc = (x, d) => fx(x * 100, d) + '%';
const dB = x => 10 * Math.log10(x);

/* ── 1. constants; c from the two bench constants ── */
{
  check('C0', M.C0, c); near('MU0', M.MU0, mu0, 1e-12); near('EPS0', M.EPS0, eps0, 1e-12);
  check('H, QE, KB exact', [M.H, M.QE, M.KB].join(), [h, qe, kB].join()); check('AU', M.AU, au);
  near('1/sqrt(mu0 eps0) = c', M.cFromFields(), c, 1e-9);
  near('independently: 1/sqrt(mu0 eps0)', 1 / Math.sqrt(mu0 * eps0), c, 1e-9);
  near('ETA0 = sqrt(mu0/eps0) = 376.73 ohm', M.ETA0, 376.730313412, 1e-9);
}

/* ── 2. FDTD: speed, energy conservation, Courant stability, Fresnel ── */
{
  // speed: at S = 1 the leapfrog scheme is exact; below 1 numerical dispersion makes the pulse slightly slow
  const s1 = M.measureSpeed(1);
  near('FDTD speed at S = 1 equals c', s1.v, c, 1e-9);
  for (const S of [0.9, 0.7, 0.5]) { const r = M.measureSpeed(S); ok(`FDTD speed at S = ${S} is below c, within 0.1%`, r.v < c && r.v > c * 0.999, r.v); }
  ok('numerical dispersion grows as S falls', M.measureSpeed(0.5).v < M.measureSpeed(0.9).v);
  // dispersion shrinks with resolution: a pulse twice as wide (in cells) is at least 3x closer to c
  { const e1 = 1 - M.measureSpeed(0.5, { width: 14 }).v / c, e2 = 1 - M.measureSpeed(0.5, { width: 28, N: 1200 }).v / c; ok('dispersion error falls about as 1/width²', e2 > 0 && e1 / e2 > 3 && e1 / e2 < 5, e1 / e2); }
  // in a medium the same grid gives c/n
  for (const nn of [1.5, 2]) near(`FDTD speed in n = ${nn} is c/n`, M.measureSpeed(1, { n: nn }).v, c / nn, 0.002);
  // energy between perfectly conducting walls, over many reflections
  for (const S of [1, 0.9, 0.5]) { const r = M.stabilityRun(S, 6000); ok(`energy conserved at S = ${S} over 6000 steps (drift ${r.drift.toExponential(1)})`, r.stable && Math.abs(r.drift) < 1e-9, r.drift); }
  // Courant limit: stable at and below 1, unstable just above
  ok('S = 1 does not blow up', M.stabilityRun(1, 8000).stable);
  for (const S of [1.01, 1.05, 1.2]) { const r = M.stabilityRun(S, 4000); ok(`S = ${S} blows up`, !r.stable && r.blownAt > 0, r.blownAt); }
  ok('the further past the limit, the sooner it blows up', M.stabilityRun(1.01, 4000).blownAt > M.stabilityRun(1.05, 4000).blownAt && M.stabilityRun(1.05, 4000).blownAt > M.stabilityRun(1.2, 4000).blownAt);
  { const P = M.LAB.fdtd, g = M.fdtd({ N: P.N, dx: P.dx, S: 1.05, bc: 'pec' }); g.launch(P.N / 2, P.width, 1); g.step(1); g.step(500); const at = g.steps; g.step(40);
    check('a blown grid stops on the step it blew up, however many steps are asked for', [g.blown, at, g.steps].join(), ['true', M.stabilityRun(1.05, 2000, { N: P.N, width: P.width }).blownAt, at].join()); }
  // the wall flips E and not B: run until the pulse has bounced once and compare signs
  { const P = M.LAB.fdtd, g = M.fdtd({ N: P.N, dx: P.dx, S: 1, bc: 'pec' }); g.launch(P.N / 2, P.width, 1); g.step(1);
    const bx = () => { let v = 0; for (let i = 0; i < P.N; i++) if (Math.abs(g.B[i]) > Math.abs(v)) v = g.B[i]; return v; };
    const e0 = g.extreme(0, P.N), b0 = bx(); g.step(P.N / 2 + 150);
    ok('E inverted by the metal wall', Math.sign(g.extreme(0, P.N)) === -Math.sign(e0) && e0 !== 0, [e0, g.extreme(0, P.N)].join());
    ok('B not inverted by the metal wall', Math.sign(bx()) === Math.sign(b0) && b0 !== 0, [b0, bx()].join()); }
  // Fresnel at normal incidence: energy split and amplitude signs, simulation against the formula
  for (const [n1, n2] of [[1, 1.5], [1, 1.33], [1, 2.42], [1.5, 1], [1, 3], [2, 1.2]]) {
    const R = Math.pow((n1 - n2) / (n1 + n2), 2), f = M.fresnel(n1, n2), s = M.fresnelRun(n1, n2);
    near(`fresnel(${n1}, ${n2}).R formula`, f.R, R, 1e-12); near(`fresnel(${n1}, ${n2}) R + T = 1`, f.R + f.T, 1, 1e-12);
    // the pulse is 1/n as wide in the denser side, so the grid error grows with the larger index: within 0.5% of R up to n = 3
    ok(`FDTD reflectance ${n1} → ${n2}: ${s.R.toFixed(5)} vs ${R.toFixed(5)}`, Math.abs(s.R - R) < 0.005 * Math.max(R, 0.01), s.R);
    near(`FDTD R + T = 1 (${n1} → ${n2})`, s.R + s.T, 1, 1e-6);
    ok(`reflected pulse sign (${n1} → ${n2})`, Math.sign(s.r) === Math.sign(n1 - n2), s.r);
    near(`FDTD amplitude r (${n1} → ${n2})`, s.r, (n1 - n2) / (n1 + n2), 0.01); near(`FDTD amplitude t (${n1} → ${n2})`, s.t, 2 * n1 / (n1 + n2), 0.01);
  }
  near('no step, no reflection', M.fresnelRun(1.5, 1.5).R + 1, 1, 1e-9);
  // the wider the pulse in cells, the closer to the formula (convergence, not a tuned tolerance)
  ok('Fresnel error shrinks with resolution', Math.abs(M.fresnelRun(1, 1.5, { N: 2400, width: 40 }).R - 0.04) < Math.abs(M.fresnelRun(1, 1.5).R - 0.04));
  { const e1 = Math.abs(M.fresnelRun(1, 3).R - 0.25), e2 = Math.abs(M.fresnelRun(1, 3, { N: 2400, width: 40 }).R - 0.25); ok('… second order: twice the resolution, about a quarter of the error (n = 3)', e1 / e2 > 3 && e1 / e2 < 5, e1 / e2); }
}

/* ── 3. displacement current ── */
{
  const P = M.LAB.cap, cap = M.capacitor(P), C = eps0 * Math.PI * P.a * P.a / P.g;
  near('parallel-plate C = eps0 A / g', cap.C, C, 1e-12); near('tau = RC', cap.tau, P.R * C, 1e-12);
  for (const tt of [0, 0.5, 1, 3]) near(`displacement current (finite difference of the flux) equals wire current at t = ${tt} RC`, cap.Id(tt * cap.tau), cap.I(tt * cap.tau), 1e-5);
  // numerical d(eps0 E A)/dt
  { const t0 = cap.tau, dt = cap.tau * 1e-5, num = eps0 * Math.PI * P.a * P.a * (cap.E(t0 + dt) - cap.E(t0 - dt)) / (2 * dt); near('Id is eps0 A dE/dt (central difference)', num, cap.Id(t0), 1e-6); }
  near('B at the plate edge = mu0 I / 2 pi a', cap.Bgap(0, P.a, true), mu0 * (P.V / P.R) / (2 * Math.PI * P.a), 1e-5);
  near('inside the plates B grows with r: half radius, half the field', cap.Bgap(0, P.a / 2, true), cap.Bgap(0, P.a, true) / 2, 1e-12);
  near('outside the plates B matches the wire', cap.Bgap(0, 2 * P.a, true), cap.Bwire(0, 2 * P.a), 1e-5);
  check("without Maxwell's term the gap has no field", cap.Bgap(0, P.a, false), 0);
}

/* ── 4. radiation: Larmor, dipoles ── */
{
  near('Larmor: q²a²/(6 pi eps0 c³)', M.larmor(qe, 1e20), qe * qe * 1e40 / (6 * Math.PI * eps0 * c * c * c), 1e-12);
  // classical hydrogen collapse time a0³/(4 re² c): 1.56e-11 s (Griffiths, Electrodynamics, problem 11.14)
  { const re = qe * qe / (4 * Math.PI * eps0 * me * c * c); near('classical electron radius', M.RE, re, 1e-9); near('classical atom lifetime', M.classicalAtomLifetime(), a0 * a0 * a0 / (4 * re * re * c), 1e-9); near('… is 1.6e-11 s', M.classicalAtomLifetime(), 1.56e-11, 0.01); }
  // Balanis, Antenna Theory: half-wave D = 1.643 (2.156 dBi), Rr = 73.1 ohm, HPBW 78°; short dipole D = 1.5, HPBW 90°; full wave D = 2.41, HPBW 47.8°
  const hd = M.dipole(0.5);
  near('half-wave directivity 1.64', hd.D, 1.643, 0.002); near('half-wave gain 2.15 dBi', hd.dBi, 2.15, 0.003); near('half-wave radiation resistance 73.1 ohm', hd.Rin, 73.13, 0.001); near('half-wave HPBW 78°', hd.hpbw, 78, 0.003);
  near('short dipole directivity 1.5', M.dipole(0.02).D, 1.5, 0.002); near('short dipole HPBW 90°', M.dipole(0.02).hpbw, 90, 0.003);
  near('full-wave directivity 2.41', M.dipole(1).D, 2.41, 0.002); near('full-wave HPBW 47.8°', M.dipole(1).hpbw, 47.8, 0.003); ok('full-wave centre-fed input resistance is infinite in this model', !isFinite(M.dipole(1).Rin));
  near('5/4-wave directivity 3.28', M.dipole(1.25).D, 3.28, 0.003); check('lobes: 0.5λ, 1λ, 1.25λ, 1.5λ', [0.5, 1, 1.25, 1.5].map(L => M.dipole(L).lobes).join(), '1,1,3,3');
  // short-dipole pattern is sin²θ
  for (const th of [0.3, 0.9, 1.4]) near(`short dipole pattern is sin²θ at ${th}`, Math.pow(M.dipoleF(0.01, th) / M.dipoleF(0.01, Math.PI / 2), 2), Math.pow(Math.sin(th), 2), 1e-3);
  check('nothing along the axis', M.dipoleF(0.5, 0), 0);
}

/* ── 5. what the wave carries ── */
{
  const s = M.sunlight(1), I = 3.828e26 / (4 * Math.PI * au * au); // IAU 2015 B3 nominal solar luminosity
  near('solar irradiance at 1 au = L/(4 pi d²) = 1361', s.I, I, 1e-9); near('… which is the IAU nominal 1361 W/m²', s.I, 1361, 2e-4);
  near('E rms = sqrt(I / (c eps0))', s.Erms, Math.sqrt(I / (c * eps0)), 1e-9); near('B peak = E peak / c', s.Bpk, s.Epk / c, 1e-12); near('E peak = sqrt2 E rms', s.Epk, Math.SQRT2 * s.Erms, 1e-12);
  near('pressure on a black surface I/c', s.pAbs, I / c, 1e-9); near('on a mirror 2I/c', s.pRef, 2 * I / c, 1e-9);
  near('inverse square: 2 au gets a quarter', M.sunlight(2).I, s.I / 4, 1e-12); near('field falls as 1/d', M.sunlight(2).Erms, s.Erms / 2, 1e-12);
  // Malus
  near('one polariser halves unpolarised light', M.polarisers([0])[1], 0.5, 1e-12);
  near('crossed pair passes nothing', M.polarisers([0, 90]).slice(-1)[0] + 1, 1, 1e-12);
  near('three polarisers at 0/45/90 pass 1/8', M.crossedStack(1, 45).out, 0.125, 1e-12);
  for (const th of [10, 30, 60]) near(`middle sheet at ${th}°: sin²(2θ)/8`, M.crossedStack(1, th).out, Math.pow(Math.sin(2 * th * Math.PI / 180), 2) / 8, 1e-12);
  for (const k of [3, 9]) near(`${k} sheets between: cos^(2(k+1)) (90°/(k+1)) / 2`, M.crossedStack(k).out, 0.5 * Math.pow(Math.cos(Math.PI / 2 / (k + 1)), 2 * (k + 1)), 1e-12);
  ok('more sheets, more light, never above one half', M.crossedStack(9).out > M.crossedStack(3).out && M.crossedStack(200).out < 0.5 && M.crossedStack(200).out > 0.49);
}

/* ── 6. spectrum, photons, water ── */
{
  const p = M.photon(2.45e9);
  near('wavelength at 2.45 GHz 12.24 cm', p.lam, c / 2.45e9, 1e-12); near('photon energy hf in eV', p.eV, h * 2.45e9 / qe, 1e-12); near('hf / kT at 300 K', p.kT, h * 2.45e9 / (kB * 300), 1e-12);
  check('bands along the axis', [1e6, 2.45e9, 3e13, 5.5e14, 1.2e15, 4e15, 1e18, 1e21].map(f => M.photon(f).band).join(), 'radio,micro,ir,vis,uv,uv,xray,gamma');
  check('ionising above 10 eV only', [5.5e14, 1.2e15, 4e15, 1e18].map(f => M.photon(f).ionising).join(), 'false,false,true,true');
  check('ionisation threshold used', M.ION_EV, 10);
  near('Wien: 5772 K peaks at 502 nm', M.wienPeak(5772), 2.897771955e-3 / 5772, 1e-9);
  // band edges are stated as wavelengths
  check('band edges (m)', M.BANDS.slice(1).map(b => +(c / b[1]).toPrecision(6)).join(), '1,0.001,7.5e-7,3.8e-7,1e-8,1e-11');
  // Debye water (Kaatze 1989, 25 °C): eps_s 78.36, eps_inf 5.2, tau 8.27 ps
  const W = { es: 78.36, einf: 5.2, tau: 8.27e-12 };
  check('water parameters', [M.WATER.es, M.WATER.einf, M.WATER.tau].join(), [W.es, W.einf, W.tau].join());
  const deb = f => { const wt = 2 * Math.PI * f * W.tau, e1 = W.einf + (W.es - W.einf) / (1 + wt * wt), e2 = (W.es - W.einf) * wt / (1 + wt * wt); const mod = Math.hypot(e1, e2), k = Math.sqrt((mod - e1) / 2); return { e1, e2, depth: c / (4 * Math.PI * f * k) }; };
  for (const f of [1e9, 2.45e9, 19e9, 60e9]) { const a = M.water(f), b = deb(f); near(`Debye e' at ${f}`, a.e1, b.e1, 1e-9); near(`Debye e″ at ${f}`, a.e2, b.e2, 1e-9); near(`power penetration depth at ${f}`, a.depth, b.depth, 1e-9); }
  near('loss peak at 1/(2 pi tau) = 19.2 GHz', M.water(1e9).fPeak, 1 / (2 * Math.PI * W.tau), 1e-12);
  ok('loss at the peak is the largest', [5e9, 10e9, 30e9, 60e9].every(f => M.water(f).e2 < M.water(M.water(1e9).fPeak).e2));
  near('peak loss = (es − einf)/2', M.water(M.water(1e9).fPeak).e2, (W.es - W.einf) / 2, 1e-9);
  // measured values at 2.45 GHz, 25 °C are about 77–78 and 9–10 (e.g. Ellison 2007); the single-Debye model is inside that
  ok("water at 2.45 GHz: e' 77.2, e″ 9.2, depth near 1.9 cm", Math.abs(M.water(2.45e9).e1 - 77.2) < 0.1 && Math.abs(M.water(2.45e9).e2 - 9.2) < 0.1 && Math.abs(M.water(2.45e9).depth - 0.0187) < 2e-4);
}

/* ── 7. atmosphere: ITU-R P.676-13 against ITU's validation examples (dry pressure 1013.25 hPa, 288.15 K, 7.5 g/m³) ── */
{
  const rows = [ // f GHz, gamma_o, gamma_w (dB/km), from the ITU validation workbook for P.676-13
    [1, 0.00538865816790655, 5.09046173249644e-05], [11, 0.0084487053937841, 0.00756980673046145], [21, 0.0124777288670428, 0.137954498938661],
    [59, 13.6352956340441, 0.149984058069274], [93, 0.0352858329500845, 0.36556956338694], [117, 0.683016464698526, 0.594052840028316],
    [139, 0.0199607394964019, 0.887164386446354], [182, 0.0126950970221286, 23.8304591872223], [299, 0.0256008930626654, 5.14158938794715], [349, 0.0363536940897413, 9.93212190524728]];
  for (const [f, go, gw] of rows) { const g = M.gasAtten(f, 1013.25, 288.15, 7.5); near(`P.676-13 oxygen at ${f} GHz`, g.o2, go, 1e-9); near(`P.676-13 water vapour at ${f} GHz`, g.h2o, gw, 1e-9); near(`P.676-13 total at ${f} GHz`, g.total, go + gw, 1e-9); }
  check('line tables: 44 oxygen, 35 water vapour', [M.O2.length, M.H2O.length].join(), '44,35');
  ok('oxygen complex peaks near 60 GHz', M.seaLevel(60).total > 10 && M.seaLevel(60).total > 50 * M.seaLevel(35).total);
  ok('oxygen line at 118.75 GHz', M.seaLevel(118.75).o2 > 5 * M.seaLevel(100).o2);
  ok('water lines at 22.235 and 183.31 GHz', M.seaLevel(22.235).h2o > M.seaLevel(30).h2o && M.seaLevel(183.31).h2o > 20);
  ok('dry air: no water absorption', M.seaLevel(183.31, 0).h2o === 0);
  ok('windows near 35, 94, 140, 220 GHz are local minima', [[35, 22.235, 60], [94, 60, 118.75], [140, 118.75, 183.31], [220, 183.31, 325.15]].every(([w, a, b]) => M.seaLevel(w).total < M.seaLevel(a).total && M.seaLevel(w).total < M.seaLevel(b).total));
  // zenith: P.676 quotes roughly 0.04–0.06 dB at 10 GHz and well over 100 dB at 60 GHz for the mean reference atmosphere
  ok('zenith at 10 GHz is a few hundredths of a dB', M.zenith(10) > 0.03 && M.zenith(10) < 0.08, M.zenith(10));
  ok('zenith at 60 GHz is opaque (> 100 dB)', M.zenith(60) > 100, M.zenith(60));
  near('zenith parts add up', M.zenithParts(60).o2 + M.zenithParts(60).h2o, M.zenith(60), 1e-12);
  { const a = M.atmosphere(0); check('reference atmosphere at sea level', [a.T, a.P].join(), '288.15,1013.25'); near('at 11 km: 216.65 K', M.atmosphere(11).T, 216.65, 1e-9); near('at 11 km: 226.3 hPa', M.atmosphere(11).P, 226.32, 1e-3); }
}

/* ── 8. modulation ── */
{
  const J = M.besselJ;
  near('J0(1)', J(0, 1), 0.7651976865579666, 1e-12); near('J1(1)', J(1, 1), 0.4400505857449335, 1e-12); near('J2(5)', J(2, 5), 0.04656511627775222, 1e-10);
  ok('J0 first zero 2.404826', Math.abs(J(0, 2.404825557695773)) < 1e-12); ok('J1 first zero 3.8317', Math.abs(J(1, 3.8317059702075125)) < 1e-12);
  // AM: carrier 1, two sidebands of m/2
  for (const m of [0.3, 0.5, 1]) { const s = M.modulate('am', 8, m); near(`AM m = ${m}: sideband amplitude m/2`, s.amp(8), m / 2, 1e-9); near(`AM m = ${m}: carrier unchanged`, s.carrier, 1, 1e-9); near(`AM m = ${m}: sideband power m²/(2 + m²)`, s.sideFrac, m * m / (2 + m * m), 1e-9); check(`AM m = ${m}: bandwidth 2 fm`, s.obw, 16);
    ok(`AM m = ${m}: only three lines`, s.bins.filter(b => b.a > 1e-9).length === 3); }
  // FM: line n has amplitude |J_n(beta)|
  for (const beta of [0.5, 2.4048, 5]) { const s = M.modulate('fm', 8, beta); for (const k of [0, 1, 2, 3]) near(`FM β = ${beta}: line ${k} is |J${k}(β)|`, s.amp(k * 8) + 1, Math.abs(J(k, beta)) + 1, 1e-9); near(`FM β = ${beta}: Carson 2(β + 1) fm`, s.rule, 2 * (beta + 1) * 8, 1e-12); ok(`FM β = ${beta}: 98% bandwidth within one line pair of Carson`, Math.abs(s.obw - s.rule) <= 16 + 1e-9, [s.obw, s.rule].join()); }
  ok('FM β = 2.405: carrier vanishes', M.modulate('fm', 8, 2.405).carrier < 1e-3);
  near('FM total power is constant (Parseval)', M.modulate('fm', 8, 5).bins.reduce((s, b) => s + b.a * b.a, 0), 1, 1e-9);
}

/* ── 9. link budgets ── */
{
  const fs = (d, f) => dB(Math.pow(4 * Math.PI * d * f / c, 2));
  const L = M.LINKS;
  for (const k of ['wifi', 'cell', 'gps', 'voyager']) { const l = M.link(k), p = L[k]; near(`${k}: free-space loss`, l.fsplDb, fs(p.d, p.f), 1e-9); near(`${k}: Friis received power`, l.Pr, p.Pt * p.Gt * p.Gr * Math.pow(c / (4 * Math.PI * p.d * p.f), 2), 1e-9); near(`${k}: noise kTB`, l.N, kB * p.Tsys * p.B, 1e-12); near(`${k}: Shannon B log2(1 + S/N)`, l.shannon, p.B * Math.log2(1 + l.Pr / (kB * p.Tsys * p.B)), 1e-9); }
  near('doubling the distance costs 6.02 dB', M.link('wifi', 2).fsplDb - M.link('wifi').fsplDb, 20 * Math.log10(2), 1e-9);
  // GPS: the specification promises at least −158.5 dBW at the ground (IS-GPS-200, L1 C/A); the free-space budget must land near it
  { const g = M.link('gps'), dbw = dB(g.Pr); ok(`GPS received power ${dbw.toFixed(1)} dBW is within 4 dB of the −158.5 dBW specification`, Math.abs(dbw - M.SRC.gps.specMinDbw) < 4, dbw); ok('GPS signal is below the noise in its own bandwidth', g.snrDb < 0); }
  // Voyager: aperture gains from the dish sizes; NASA quotes about 48 dBi for the 3.7 m dish at X band and about 74 dBi for a 70 m DSN dish
  { const lam = c / 8.42e9, gt = 0.6 * Math.pow(Math.PI * 3.7 / lam, 2), gr = 0.65 * Math.pow(Math.PI * 70 / lam, 2);
    near('Voyager dish gain = eff (pi D / lambda)²', L.voyager.Gt, gt, 1e-9); near('DSN 70 m gain', L.voyager.Gr, gr, 1e-9);
    ok('Voyager dish about 48 dBi', Math.abs(dB(gt) - 48) < 0.5, dB(gt)); ok('DSN 70 m about 74 dBi', Math.abs(dB(gr) - 74) < 0.5, dB(gr));
    const v = M.link('voyager'); near('Voyager distance is 173.14 au', v.d, 173.14 * au, 1e-12); ok('Voyager Eb/N0 at 160 bit/s is positive but small', v.ebn0Db > 3 && v.ebn0Db < 15, v.ebn0Db);
    near('light time at 173.14 au is one day', 173.14 * au / c / 86400, 1, 2e-4); }
  ok('Wi-Fi at 10 m: tens of dB of margin', M.link('wifi').snrDb > 40);
}

/* ── 10. fibre ── */
{
  const F = M.FIBRE, loss = l => F.A / Math.pow(l, 4) + F.irA * Math.exp(-F.irB / l);
  for (const l of [0.85, 1.31, 1.55, 1.65]) near(`fibre loss model at ${l} µm`, M.fibreLoss(l).total, loss(l), 1e-12);
  // typical standard single-mode fibre (ITU-T G.652 class): 0.32–0.35 dB/km at 1310, 0.18–0.20 at 1550; the model must be within 0.05 dB/km of those bands
  ok('1550 nm: 0.17–0.20 dB/km', M.fibreLoss(1.55).total > 0.17 && M.fibreLoss(1.55).total < 0.2, M.fibreLoss(1.55).total);
  ok('1310 nm: 0.30–0.35 dB/km', M.fibreLoss(1.31).total > 0.3 && M.fibreLoss(1.31).total < 0.35, M.fibreLoss(1.31).total);
  ok('850 nm: about 1.7 dB/km (Rayleigh 0.9/λ⁴)', Math.abs(M.fibreLoss(0.85).ray - 0.9 / Math.pow(0.85, 4)) < 1e-12);
  { const m = M.fibreMin(); ok('minimum sits near 1550 nm', m.lam > 1.53 && m.lam < 1.57, m.lam); ok('it is a minimum', M.fibreLoss(m.lam - 0.02).total > m.a && M.fibreLoss(m.lam + 0.02).total > m.a); }
  { const s = M.fibreSpan(1.55, 80), a = loss(1.55); near('80 km loss', s.dB, 80 * a, 1e-12); near('fraction left', s.frac, Math.pow(10, -8 * a), 1e-12); near('half-power length = 10 log10(2) / a', s.halfKm, dB(2) / a, 1e-12); }
  { const g = M.fibreGuide(), n2 = F.n1 * (1 - F.delta); near('cladding index', g.n2, n2, 1e-12); near('critical angle asin(n2/n1)', g.crit, Math.asin(n2 / F.n1) * 180 / Math.PI, 1e-12); near('NA sqrt(n1² − n2²)', g.na, Math.sqrt(F.n1 * F.n1 - n2 * n2), 1e-12); near('acceptance half-angle', g.accept, Math.asin(Math.sqrt(F.n1 * F.n1 - n2 * n2)) * 180 / Math.PI, 1e-12); near('delay per km n1/c', g.usPerKm, F.n1 * 1e3 / c * 1e6, 1e-12); near('speed in the core c/n1', g.vFrac, 1 / F.n1, 1e-12); }
}

/* ── 11. diffraction and arrays ── */
{
  near('first zero of J1 / pi = 1.2197', M.J1ZERO / Math.PI, 1.2196698912665045, 1e-12);
  ok('Airy pattern: 1 at the centre, 0 at the first zero', Math.abs(M.airy(0) - 1) < 1e-12 && M.airy(M.J1ZERO) < 1e-20);
  near('first Airy ring is 1.75% of the peak', M.airy(5.135622301840683), 0.0175, 0.003);
  near('Rayleigh angle', M.rayleigh(550e-9, 2.4), 1.2196698912665045 * 550e-9 / 2.4, 1e-12);
  // two equal incoherent points at the Rayleigh separation: the saddle is 73.5% of the peaks (Born & Wolf §8.6.2)
  near('dip at the Rayleigh criterion 73.5%', M.twoPoints(1).dip, 0.735, 0.001);
  ok('Sparrow limit near 0.776 of the Rayleigh separation', Math.abs(M.sparrow() - 0.7766) < 0.001, M.sparrow());
  ok('below Sparrow the two merge into one hump', M.twoPoints(M.sparrow() - 0.02).dip >= 1 - 1e-9 && M.twoPoints(M.sparrow() + 0.05).dip < 1);
  const asec = 180 * 3600 / Math.PI;
  near('eye, 3 mm pupil, 550 nm', M.aperture('eye').th * asec, 1.2196698912665045 * 550e-9 / 3e-3 * asec, 1e-12);
  near('Hubble at 550 nm: 0.058″', M.aperture('hubble').th * asec, 0.0577, 0.003); near('JWST at 2 µm: 0.077″', M.aperture('jwst').th * asec, 0.0774, 0.003);
  near('Earth-sized dish at 1.3 mm: 26 µas', M.aperture('eht').th * asec * 1e6, 25.7, 0.003);
  // uniform array, broadside: half-power width ≈ 0.886 λ/(N d) rad (Balanis, table 6.2); N = 16, d = λ/2: 6.36°
  near('16 elements at λ/2: HPBW 6.36°', M.array(16, 0.5, 0).hpbw, Math.asin(0.4429 / (16 * 0.5)) * 2 * 180 / Math.PI, 0.003);
  near('array factor peaks at the steering angle', M.arrayFactor(16, 0.5, 30, 30), 1, 1e-12);
  near('phase step −2 pi d sin θ0', M.array(16, 0.5, 30).phaseStep, -2 * Math.PI * 0.5 * Math.sin(Math.PI / 6), 1e-12);
  ok('beam widens when steered, roughly as 1/cos θ0', Math.abs(M.array(16, 0.5, 30).hpbw / M.array(16, 0.5, 0).hpbw - 1 / Math.cos(Math.PI / 6)) < 0.01);
  check('no grating lobe at λ/2, any steering', [0, 30, 60].map(t0 => M.array(16, 0.5, t0).grating.length).join(), '0,0,0');
  { const a = M.array(16, 0.7, 45); check('one grating lobe at 0.7 λ steered to 45°', a.grating.length, 1); near('at sin θ = sin 45° − 1/0.7', a.grating[0], Math.asin(Math.sin(Math.PI / 4) - 1 / 0.7) * 180 / Math.PI, 1e-6); near('and it is as strong as the main beam', M.arrayFactor(16, 0.7, 45, a.grating[0]), 1, 1e-6); near('largest safe spacing 1/(1 + sin θ0)', a.dMax, 1 / (1 + Math.sin(Math.PI / 4)), 1e-12); }
  near('array gain over one element 10 log N', M.array(16, 0.5, 0).gainDb, dB(16), 1e-12);
  near('two elements at λ/2: null along the line', M.arrayFactor(2, 0.5, 0, 90) + 1, 1, 1e-12);
}

/* ── 12. every bound number, re-derived here ── */
{
  const want = {};
  const sc = (x, d) => { const e = Math.floor(Math.log10(x)); let m = (x / Math.pow(10, e)).toFixed(d), ee = e; if (+m >= 10) { m = (1).toFixed(d); ee++; } return m + ' × 10' + String(ee).replace('-', '⁻').replace(/\d/g, k => '⁰¹²³⁴⁵⁶⁷⁸⁹'[k]); };
  want['ch1.eps0'] = sc(eps0, 3); want['ch1.mu0'] = sc(mu0, 3);
  const A = Math.PI * 0.05 * 0.05, Cc = eps0 * A / 1e-3;
  Object.assign(want, { 'ch2.V': '9', 'ch2.R': '1,000', 'ch2.C': fx(Cc * 1e12, 1), 'ch2.tau': fx(1000 * Cc * 1e9, 1), 'ch2.I0': '9', 'ch2.B0': fx(mu0 * 9e-3 / (2 * Math.PI * 0.05) * 1e9, 0) });
  Object.assign(want, { 'ch3.c': '299,792,458', 'ch3.cCalc': fx(1 / Math.sqrt(mu0 * eps0), 0), 'ch3.cells': '600', 'ch3.width': '28' });
  Object.assign(want, { 'ch4.Rglass': pc(Math.pow(0.5 / 2.5, 2), 0), 'ch4.Rwater': pc(Math.pow(0.33 / 2.33, 2), 1), 'ch4.Rdiamond': pc(Math.pow(1.42 / 3.42, 2), 0), 'dg.if.r': '−0.2', 'dg.if.rabs': '0.2', 'dg.if.t': '0.8', 'dg.if.R': '4%', 'dg.if.T': '96%' });
  Object.assign(want, { 'ch5.atom': sc(1.556e-11, 1), 'ch5.Dhalf': '1.64', 'ch5.dBi': '2.15', 'ch5.R': '73.1', 'ch5.fmHalf': fx(c / 100e6 / 2, 2), 'ch5.wifiHalf': fx(c / 2.45e9 / 2 * 100, 1) });
  const I1 = 3.828e26 / (4 * Math.PI * au * au), Iat = d => I1 / (d * d);
  Object.assign(want, { 'ch6.I': fx(I1, 0), 'ch6.Erms': fx(Math.sqrt(I1 / (c * eps0)), 0), 'ch6.Bpk': fx(Math.sqrt(2 * I1 / (c * eps0)) / c * 1e6, 2), 'ch6.p': fx(I1 / c * 1e6, 2), 'ch6.sail': fx(2 * I1 / c * 1e6, 2),
    'ch6.mars': fx(Iat(1.524), 0), 'ch6.jup': fx(Iat(5.203), 1), 'ch6.voy': fx(Iat(173.14), 3), 'ch6.p3': pc(0.5 * Math.pow(Math.cos(Math.PI / 8), 8), 1), 'ch6.p9': pc(0.5 * Math.pow(Math.cos(Math.PI / 20), 20), 1),
    'dg.pol.i0': '100%', 'dg.pol.i1': '50%', 'dg.pol.i2': '25%', 'dg.pol.i3': '12.5%' });
  const eVo = h * 2.45e9 / qe, tau = 8.27e-12, fpk = 1 / (2 * Math.PI * tau);
  const wat = f => { const wt = 2 * Math.PI * f * tau, e1 = 5.2 + 73.16 / (1 + wt * wt), e2 = 73.16 * wt / (1 + wt * wt), k = Math.sqrt((Math.hypot(e1, e2) - e1) / 2); return { e2, depth: c / (4 * Math.PI * f * k) }; };
  Object.assign(want, { 'ch7.ionLam': fx(h * c / (10 * qe) * 1e9, 0), 'ch7.ovenEv': sc(eVo, 1), 'ch7.ionRatio': comma(+(10 / eVo).toPrecision(2)), 'ch7.body': fx(2.897771955e-3 / 310 * 1e6, 1),
    'ch7.fPeak': fx(fpk / 1e9, 1), 'ch7.depth': fx(wat(2.45e9).depth * 100, 1), 'ch7.depthPeak': fx(wat(fpk).depth * 1e3, 2), 'ch7.e2oven': fx(wat(2.45e9).e2, 1), 'ch7.e2peak': fx(wat(fpk).e2, 1),
    'ch7.sarW': '0.08', 'ch7.sarI': '2', 'ch7.sarF': '1.6' }); // ICNIRP 2020 general public (whole body; head and torso, 10 g); FCC 47 CFR 1.1310 (1 g)
  // atmosphere: total pressure 1013.25 hPa, 15 °C, 7.5 g/m³ (the validation rows above use the same sum)
  const g = f => { const e = 7.5 * 288.15 / 216.7; return M.gasAtten(f, 1013.25 - e, 288.15, 7.5).total; };
  Object.assign(want, { 'ch8.g2': fx(g(2.45), 3), 'ch8.g28': fx(g(28), 2), 'ch8.g60': fx(g(60), 1), 'ch8.t60': pc(Math.pow(10, -g(60) / 10), 1), 'ch8.g94': fx(g(94), 1), 'ch8.g140': fx(g(140), 1), 'ch8.g300': fx(g(300), 1),
    'ch8.z60': fx(M.zenith(60), 0), 'ch8.z10': fx(M.zenith(10), 2), 'ch8.z10pct': pc(Math.pow(10, -M.zenith(10) / 10), 1) });
  const fsl = (d, f) => dB(Math.pow(4 * Math.PI * d * f / c, 2)), lamX = c / 8.42e9, gt = dB(0.6 * Math.pow(Math.PI * 3.7 / lamX, 2)), gr = dB(0.65 * Math.pow(Math.PI * 70 / lamX, 2));
  const fW = fsl(10, 2.437e9), fG = fsl(20200e3, 1575.42e6), fV = fsl(173.14 * au, 8.42e9);
  Object.assign(want, { 'ch9.bits4096': '12', 'ch9.fmBw': '180', 'ch9.dbl': fx(dB(4), 0), 'ch9.wifiFs': fx(fW, 0), 'ch9.gpsFs': fx(fG, 0), 'ch9.voyFs': fx(fV, 0), 'ch9.voyMinusWifi': fx(fV - fW, 0),
    'ch9.voyGt': fx(gt, 0), 'ch9.voyGr': fx(gr, 0), 'ch9.voyGain': fx(gt + gr, 0), 'ch9.voyPr': sc(22.4 * Math.pow(10, (gt + gr - fV) / 10), 1), 'ch9.voyPt': '22.4' });
  const n1 = 1.468, n2 = n1 * (1 - 0.0036), fl = l => 0.9 / Math.pow(l, 4) + 7.81e11 * Math.exp(-48.48 / l), d2 = x => x * 180 / Math.PI;
  Object.assign(want, { 'dg.fib.n1': '1.468', 'dg.fib.n2': fx(n2, 3), 'dg.fib.crit': fx(d2(Math.asin(n2 / n1)), 1), 'dg.fib.acc': fx(d2(Math.asin(Math.sqrt(n1 * n1 - n2 * n2))), 1),
    'ch10.crit': fx(d2(Math.asin(n2 / n1)), 1), 'ch10.acc': fx(d2(Math.asin(Math.sqrt(n1 * n1 - n2 * n2))), 1), 'ch10.vfrac': pc(1 / n1, 0), 'ch10.us': fx(n1 / c * 1e9, 1), 'ch10.minLam': '1550',
    'ch10.a850': fx(fl(0.85), 1), 'ch10.a1310': fx(fl(1.31), 2), 'ch10.a1550': fx(fl(1.55), 2), 'ch10.half': fx(dB(2) / fl(1.55), 0), 'ch10.fr80': pc(Math.pow(10, -8 * fl(1.55)), 0), 'ch10.db80': fx(80 * fl(1.55), 0), 'ch10.hollow': pc(n1 - 1, 0) });
  const asec = 180 * 3600 / Math.PI, k122 = 1.2196698912665045;
  Object.assign(want, { 'ch11.k': '1.22', 'ch11.eye': fx(k122 * 550e-9 / 3e-3 * asec, 0), 'ch11.hubble': fx(k122 * 550e-9 / 2.4 * asec, 3), 'ch11.eht': fx(k122 * 1.3e-3 / 12742e3 * asec * 1e6, 0),
    'ch11.euvR': fx(0.61 * 13.5 / 0.55, 0), 'ch11.k1': fx(8 * 0.55 / 13.5, 2), 'ch11.half28': fx(c / 28e9 / 2 * 1e3, 1) });
  // the frontier block, typed from the sources listed in BRIEF.md
  Object.assign(want, { 'fr.fr1': '410 MHz – 7.125 GHz', 'fr.fr2': '24.25–71 GHz', 'fr.wrc1': '4.4–4.8 GHz', 'fr.wrc2': '7.125–8.4 GHz', 'fr.wrc3': '14.8–15.35 GHz', 'fr.wifi7Bw': '320', 'fr.wifi7Qam': '4096', 'fr.wifi8Year': '2028',
    'fr.smfYear': '2026', 'fr.smfKm': '39', 'fr.smfTb': '450', 'fr.smfThz': '42.4', 'fr.mcfYear': '2025', 'fr.mcfClad': '125', 'fr.mcfCores': '19', 'fr.mcfPb': '1.02', 'fr.mcfKm': '1,808',
    'fr.hollowYear': '2025', 'fr.hollowDb': '0.091', 'fr.hollowThz': '66', 'fr.thzYear': '2024', 'fr.thzBand1': '100', 'fr.thzBand2': '300', 'fr.thzM': '100', 'fr.thzGb': '100',
    'fr.dsocPeakKm': fx(Math.round(19e6 * 1.609344 / 1e6) * 100, 0), 'fr.dsocMbps': '267', 'fr.dsocFarKm': fx(307e6 * 1.609344 / 1e8, 2), 'fr.dsocPasses': '65', 'fr.dsocTb': '13.6', 'fr.d2cSats': '650',
    'fr.euvLam': '13.5', 'fr.euvNa': '0.55', 'fr.euvNaLow': '0.33', 'fr.euvRes': '8', 'fr.lclsGeV': '8', 'fr.voyAu': '173.14' });
  for (const k of Object.keys(want)) check(`binding ${k}`, B[k], want[k]);
  // bound numbers that only the simulation can give: pinned to what the simulation returns, and bracketed by the theory
  const sim = { 'ch3.v05': fx(M.measureSpeed(0.5).v, 0), 'ch3.err05': pc(1 - M.measureSpeed(0.5).v / c, 2), 'ch3.blow': String(M.stabilityRun(1.05, 2000, { N: M.LAB.fdtd.N, width: M.LAB.fdtd.width }).blownAt), 'ch4.RglassSim': pc(M.fresnelRun(1, 1.5).R, 2), 'ch11.w0': fx(M.array(16, 0.5, 0).hpbw, 1), 'ch11.w30': fx(M.array(16, 0.5, 30).hpbw, 1) };
  for (const k of Object.keys(sim)) check(`binding ${k} (from the simulation)`, B[k], sim[k]);
  ok('S = 0.5 speed error is a few parts in ten thousand', 1 - M.measureSpeed(0.5).v / c > 1e-4 && 1 - M.measureSpeed(0.5).v / c < 1e-3);
  ok('S = 1.05 blows up within 100 steps (prose: 几十步)', M.stabilityRun(1.05, 2000, { N: M.LAB.fdtd.N, width: M.LAB.fdtd.width }).blownAt > 20 && M.stabilityRun(1.05, 2000, { N: M.LAB.fdtd.N, width: M.LAB.fdtd.width }).blownAt < 100);
  check('every binding is checked here', Object.keys(B).filter(k => !(k in want) && !(k in sim)).join(), '');
  check('no check for a binding that does not exist', [...Object.keys(want), ...Object.keys(sim)].filter(k => !(k in B)).join(), '');
}

/* ── 13. literal claims in the prose ── */
{
  const has = s => md.includes(s);
  const I1 = 3.828e26 / (4 * Math.PI * au * au);
  ok('prose: 24 小时 — light time at 173.14 au', has('整整 24 小时') && Math.abs(173.14 * au / c / 3600 - 24) < 0.01);
  ok('prose: 两百亿分之一 of an atmosphere', has('两百亿分之一') && Math.abs(101325 / (I1 / c) / 1e10 - 2) < 0.3, 101325 / (I1 / c));
  ok('prose: B at the plate edge is about a thousandth of the geomagnetic field (25–65 µT)', has('地磁场的千分之一') && 36e-9 / 50e-6 > 5e-4 && 36e-9 / 25e-6 < 2e-3);
  ok('prose: sunlight B is under a tenth of the geomagnetic field', has('不到地磁场的十分之一') && M.sunlight(1).Bpk < 25e-6 / 7);
  ok('prose: 1.5 V across 2 mm is the field of sunlight', has('1.5 伏') && Math.abs(1.5 / 2e-3 / M.sunlight(1).Erms - 1) < 0.06, 750 / M.sunlight(1).Erms);
  ok('prose: twice as close, 4x the intensity, 2x the field', has('强度变成 4 倍') && has('电场只变成 2 倍'));
  ok('prose: 17 千米 per halving at 1550 nm', has('每走 17 千米才损失一半') && Math.round(M.fibreSpan(1.55, 1).halfKm) === 17);
  ok('prose: loss peak nearly 8x the oven frequency', has('将近 8 倍') && M.water(1e9).fPeak / 2.45e9 > 7.5 && M.water(1e9).fPeak / 2.45e9 < 8);
  ok('prose: 18 decades on the slider', has('跨 18 个数量级') && /id="c7F" min="4" max="22"/.test(fs.readFileSync(path.join(DIR, 'figures', 'ch7-model.html'), 'utf8')));
  ok('prose: photon energy runs from a billionth of kT to over a billion kT', has('十亿分之一涨到十亿倍以上') && M.photon(1e4).kT < 2e-9 && M.photon(1e4).kT > 5e-10 && M.photon(1e22).kT > 1e9);
  ok('prose: phone photons are over four orders below the ionisation threshold (up to 71 GHz)', has('小四个数量级以上') && 10 / M.photon(71e9).eV > 1e4);
  ok('prose: 17 dB is 50x', has('放大了 50 倍') && Math.abs(Math.pow(10, 1.7) - 50) < 0.5 && Math.abs(dB(M.LINKS.cell.Gr) - 17) < 1e-9);
  ok('prose: nearly 10^26', has('近 26 次方') && (M.link('voyager').fsplDb - M.link('wifi').fsplDb) / 10 > 25.5 && (M.link('voyager').fsplDb - M.link('wifi').fsplDb) / 10 < 26);
  ok('prose: Webb 2.7x the aperture, 3.6x the wavelength', has('哈勃的 2.7 倍') && has('长了 3.6 倍') && (6.5 / 2.4).toFixed(1) === '2.7' && (2000 / 550).toFixed(1) === '3.6');
  ok('prose: FM 75 kHz deviation + 15 kHz audio', has('75 千赫') && has('15 千赫') && 2 * (75 + 15) === 180);
  ok('prose: 0.36% index step', has('0.36%') && M.FIBRE.delta === 0.0036);
  ok('prose: powers used in the link sentences', has('路由器发出 0.1 瓦') && M.LINKS.wifi.Pt === 0.1 && has('手机发出 0.2 瓦') && M.LINKS.cell.Pt === 0.2 && has('卫星发出 25 瓦') && M.LINKS.gps.Pt === 25);
  ok('prose: Voyager 3.7 m, 70 m, 20 K, 160 bit/s', has('3.7 米的天线') && has('70 米的天线') && has('约 20 开') && has('每秒 160 比特') && [M.SRC.voyager.D, M.SRC.voyager.dsnD, M.LINKS.voyager.Tsys, M.SRC.voyager.Rb].join() === '3.7,70,20,160');
  ok('prose: 8 × 8 half-wave patches at 28 GHz fit a matchbox face', has('8 × 8 = 64') && 8 * c / 28e9 / 2 < 0.05);
  ok('prose: 1264.0–1617.8 nm spans about 52 THz, more than the 42.4 THz the signal occupies', has('1264 到 1618 纳米') && has('约 52 太赫兹') && Math.round((c / 1264.0e-9 - c / 1617.8e-9) / 1e12) === 52 && M.FRONTIER.fibreSmf.thz < 52);
  ok('prose: M87 ring 42 µas is above the 26 µas limit', has('42 微角秒') && M.aperture('eht').th * 180 * 3600e6 / Math.PI < 42);
  ok('prose: the carrier is 256 kHz', has('载波是 256 千赫') && M.modulate('am', 8, 0.5).fc === 256);
  // dates written out in the prose match the data block
  const F = M.FRONTIER;
  ok('date: Voyager light-day', F.voyager.lightDay === '2026-11-18' && has('2026 年 11 月 18 日'));
  ok('date: 802.11be published', F.wifi7.published === '2025-07-22' && has('2025 年 7 月 22 日'));
  ok('date: direct-to-cell count', F.d2c.asOf === '2026-10' && has('截至 2026 年 10 月'));
  ok('date: LCLS-II', F.lcls.firstLight === '2023-09' && has('2023 年 9 月') && F.lcls.heFirstLightPlan === '2027-10' && has('2027 年 10 月'));
  ok('date: frontier as of', F.asOf === '2026-11' && has('2026 年 11 月'));
  check('4096-QAM carries 12 bits', Math.log2(F.wifi7.qam), F.wifi7.bitsPerSymbol);
  // hollow-core claim is consistent with the solid-fibre floor the page gives
  ok('hollow-core 0.091 dB/km is below the solid-silica model minimum', F.hollow.dBkm < M.fibreMin().a);
}

/* ── 14. copy keys, hygiene ── */
{
  const used = new Set([...app.matchAll(/\bt\('([a-z][\w.]*)'/g)].map(m => m[1]));
  const prefixes = [...used].filter(k => k.endsWith('.')).map(k => k.slice(0, -1)).sort();
  check('dynamic prefixes in app.js are the ones page.json declares', prefixes.join(), Object.keys(PJ.dynamicKeys).sort().join());
  for (const [p, vs] of Object.entries(PJ.dynamicKeys)) vs.forEach(v => used.add(p + '.' + v));
  for (const m of app.matchAll(/k(?:Pause|Play): '([\w.]+)'/g)) used.add(m[1]); // passed to runner(), which calls t() on them
  check('keys app.js uses exist in zh', [...used].filter(k => !k.endsWith('.') && !(k in Z)).join(), '');
  // dynamic key lists equal the model's own enumerations
  check('ch7.cv = bands', PJ.dynamicKeys['ch7.cv'].join(), M.BANDS.map(b => b[0]).join());
  check('ch7.say = bands + uvIon', PJ.dynamicKeys['ch7.say'].slice().sort().join(), [...M.BANDS.map(b => b[0]), 'uvIon'].sort().join());
  check('ch7.size = sizes', PJ.dynamicKeys['ch7.size'].join(), M.SIZES.map(s => s[0]).join());
  check('ch9.link.say = links', PJ.dynamicKeys['ch9.link.say'].join(), Object.keys(M.LINKS).join());
  check('ch11.note = apertures', PJ.dynamicKeys['ch11.note'].join(), Object.keys(M.APERTURES).join());
  // every live sentence, readout, control and canvas label in the copy is used by app.js or by the HTML
  const inHtml = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  const orphan = Object.keys(Z).filter(k => /\.(say|cv|size|note|btn)\./.test(k) && !used.has(k) && !inHtml.has(k));
  check('no live string that nothing shows', orphan.join(), '');
  // placeholders: each {x} a sentence uses is passed by app.js somewhere (names only), and bindings left none unresolved
  check('no unresolved {=…} in the copy', Object.keys(Z).filter(k => /\{=/.test(Z[k])).join(), '');
  check('zh and en have the same keys', Object.keys(Z).sort().join() === Object.keys(E).sort().join(), true);
  check('en stub declaration is absent', [(PJ.languages || {}).en, /data-lang-en="stub"/.test(html)].join(), ',false');
  check('page.json has no status (unregistered draft)', 'status' in PJ, false);
  ok('no Chinese in app.js', !/[㐀-鿿]/.test(app)); ok('no Chinese in models.js', !/[㐀-鿿]/.test(modelSrc));
  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) ok(`figures/${f} has no Chinese`, !/[㐀-鿿]/.test(fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')));
  const dgs = fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-'));
  check('12 static diagrams', dgs.length, 12);
  for (const f of dgs) ok(`${f} is inline SVG with wide and narrow drawings`, (fs.readFileSync(path.join(DIR, 'figures', f), 'utf8').match(/<svg /g) || []).length === 2);
  check('14 labs in the page', (html.match(/<canvas /g) || []).length >= 14 && (html.match(/class="[^"]*\bsay\b/g) || []).length, 14);
  ok('no "left/right figure" wording', !/左图|右图|上图|下图/.test(md));
  ok('scripts are versioned', /app\.js\?v=20261118a/.test(html));
}

/* ── 15. registry ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry desc = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry title = hero title', R.title.zh, Z['hero.title']);
  check('registry title', R.title.zh, '信号穿过真空的时候，到底是什么在传');
  ok('registry has an English title and description', R.title.en.length > 10 && R.desc.en.length > 50 && !/[㐀-鿿]/.test(R.title.en + R.desc.en));
  ok('at least 15 concepts', R.concepts.length >= 15, R.concepts.length);
  for (const cpt of R.concepts) {
    ok(`concept ${cpt.id} anchor ${cpt.anchor} exists`, html.includes(`id="${cpt.anchor.slice(1)}"`));
    ok(`concept ${cpt.id} has zh and en names and aliases`, cpt.title && cpt.title.zh && cpt.title.en && cpt.desc.zh && cpt.desc.en && cpt.aliases.zh.length >= 2 && cpt.aliases.en.length >= 2);
    ok(`concept ${cpt.id} has a question-form alias`, [...cpt.aliases.zh, ...cpt.aliases.en].some(a => /为什么|怎么|什么|吗|多少|why|how|what|does|is |can /i.test(a)));
  }
  const all = R.concepts.flatMap(cpt => [...new Set([...cpt.aliases.zh, ...cpt.aliases.en].map(a => a.toLowerCase()))]);
  check('no alias owned by two concepts of this page', all.filter((a, i) => all.indexOf(a) !== i).join(), '');
  check('every chapter has a concept', [...Array(13)].map((_, i) => '#ch' + (i + 1)).filter(a => a !== '#ch13' && !R.concepts.some(cpt => cpt.anchor === a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
