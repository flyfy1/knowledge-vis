'use strict';
// Pins every number the essay states to the page's own models, drives every live sentence through its branches
// (including the control extremes) and checks the Chinese copy resolves cleanly.
// Run: node physics/modern/why-fusion-is-hard/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const L = k => Z[k] != null ? Z[k] : '@@' + k;
const F = sp => M.format(sp, L);
// the English copy (added by the 2026-11-18 review): same keys, formats that read as English
const ctxE = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.en.js'), 'utf8'), ctxE);
const E = ctxE.window.ESSAY_COPY.en;
const LE = k => E[k] != null ? E[k] : '@@' + k;
const FE = sp => M.format(sp, LE);

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function ok(name, cond) { n++; if (!cond) { fails++; console.error('FAIL ' + name); } }
const f = (x, d) => x.toFixed(d);
const P = M.prose(), PS = {}; for (const k in P) PS[k] = F(P[k]);
// prose: the formatted value the reader sees for a placeholder
const pv = (k, want) => check('prose {' + k + '}', PS[k], want);

/* ── 01 binding energy and Q-values (AME2020) ── */
check('B/A He-4', f(M.bindingPerA('He4'), 3), '7.074'); pv('bHe4', '7.07');
check('B/A Fe-56', f(M.bindingPerA('Fe56'), 3), '8.790'); pv('bFe', '8.790');
check('B/A Ni-62 is the maximum', Object.keys(M.NUC).reduce((a, b) => M.bindingPerA(a) > M.bindingPerA(b) ? a : b), 'Ni62'); pv('bNi', '8.795');
check('B/A U-238', f(M.bindingPerA('U238'), 3), '7.570');
check('B/A deuteron', f(M.bindingPerA('H2'), 3), '1.112'); pv('bD', '1.11');
check('B/A triton', f(M.bindingPerA('H3'), 3), '2.827');
check('Q D-T', f(M.qValue('dt'), 3), '17.589'); check('Q D-D(n)', f(M.qValue('ddn'), 3), '3.269'); check('Q D-D(p)', f(M.qValue('ddp'), 3), '4.033');
check('Q D-He3', f(M.qValue('dhe3'), 3), '18.353'); check('Q p-B11', f(M.qValue('pb11'), 2), '8.68'); check('Q fission (Ba+Kr+3n)', f(M.qValue('u235'), 1), '173.3');
check('Q Li-6(n,α)T', f(M.qValue('li6'), 2), '4.78'); pv('li6', '4.78'); check('Q Li-7(n,n′α)T', f(M.qValue('li7'), 2), '-2.47'); pv('li7', '2.47');
check('alpha share of D-T', f(M.dtSplit().alpha, 2), '3.54'); pv('alphaPct', '20'); pv('nPct', '80'); pv('en', '14');
check('D-T J/kg', f(M.energyPerKg('dt') / 1e14, 2), '3.37'); pv('coalx', '1.2 × 10⁷'); pv('dtU', '4.7'); pv('coalMJ', '29.3');
pv('rx1GW', '3.5 × 10²⁰'); pv('tDay', '154'); pv('tYear', '56');

/* ── 02 Coulomb barrier and Maxwellian tail ── */
check('barrier D-T keV', f(M.barrier('dt').MeV * 1000, 0), '444'); pv('barKeV', '444'); pv('rDT', '3.2');
check('tail at E = 0 is 1', f(M.log10Tail(1e-9, 10), 6), '0.000000');
{ // closed form vs numerical integral of the Maxwellian energy density
  let s = 0; const T = 10, E0 = 50, h = 0.01; for (let E = E0; E < 400; E += h) s += M.mbDensity(E + h / 2, T) * h;
  check('tail closed form = integral (50 keV at 10 keV)', f(Math.log10(s), 3), f(M.log10Tail(E0, T), 3));
}
check('tail above D-T barrier at 10 keV (log10)', f(M.log10Tail(M.barrier('dt').MeV * 1000, 10), 1), '-18.4');
pv('kelvinPerKeV', '1.16 × 10⁷'); pv('sunKeV', '1.35'); pv('n20', '10²⁰');

/* ── 03 Gamow peak and Bosch–Hale reactivity ── */
check('E_G D-T', f(M.gamowEnergy('dt'), 0), '1182'); pv('EGdt', '1,182');
check('Gamow peak at 10 keV', f(M.gamowPeak('dt', 10).E0, 1), '30.9');
{ // the peak formula is the maximum of the integrand
  let best = 0, bE = 0; for (let E = 1; E < 200; E += 0.01) { const v = M.gamowIntegrand('dt', E, 10); if (v > best) { best = v; bE = E; } }
  check('E0 formula = numerical maximum', f(bE, 1), f(M.gamowPeak('dt', 10).E0, 1));
}
check('<σv> D-T 10 keV (Bosch–Hale table 1.136e-16)', M.sigmaV('dt', 10).toExponential(3), '1.136e-16');
check('<σv> D-D 10 keV (table 1.180e-18 total)', M.sigmaV('dd', 10).toExponential(2), '1.18e-18');
ok('integrated cross-section matches the reactivity fit within 1% (5, 10, 20 keV)', [5, 10, 20].every(T => Math.abs(M.sigmaVIntegrated(T) / M.sigmaV('dt', T) - 1) < 0.01));
pv('r10dd', '96'); pv('r10he', '534'); pv('T10', '10');
check('D-T reactivity peak', f(M.svPeak('dt').T, 0), '67');

/* ── 04 Lawson ── */
{ const mt = M.minTriple(Infinity); check('ignition minimum T', f(mt.T, 0), '14'); check('ignition minimum n·T·τ', (mt.ntt / 1e21).toFixed(1), '2.9'); }
pv('ignT', '14'); pv('ignTriple', '2.9 × 10²¹'); pv('q1Triple', '4.7 × 10²⁰'); pv('ignK', '1.7 × 10⁸');
check('ideal ignition (α = bremsstrahlung)', f(M.bremsCrossover(), 1), '4.3'); pv('Tbr', '4.3');
for (const T of [10, 20]) for (const Q of [1, 10]) check(`Q round trip T=${T} Q=${Q}`, f(M.qAt(T, M.tripleFor(T, Q)), 6), f(Q, 6));
ok('above the ignition curve Q is infinite', M.qAt(14, 1.01 * M.tripleFor(14, Infinity)) === Infinity);

/* ── 05 guiding-centre orbits ── */
check('Larmor D 10 keV, 5.3 T (mm)', f(M.particle('D', 0).larmor * 1000, 1), '4.5'); pv('rhoD', '4.5');
check('Larmor α 3.5 MeV (cm)', f(M.particle('alpha', 0).larmor * 100, 1), '5.9'); pv('rhoA', '5.9');
check('drift D = drift e (same energy)', f(M.particle('D', 0.5).vd, 6), f(M.particle('e', 0.5).vd, 6));
check('no twist: D reaches the wall (ms)', f(M.noTwistWall('D', 0.5).t * 1000, 2), '4.55');
ok('ions drift up, electrons down', M.noTwistWall('D', 0.5).up && !M.noTwistWall('e', 0.5).up);
check('trapping boundary v∥/v', f(M.trappedPitch(), 3), '0.527');
for (const sp of ['D', 'e', 'alpha']) for (const pitch of [0.05, 0.3, 0.7, 1]) { const o = M.orbit(sp, pitch, 3); ok(`energy conserved ${sp} ${pitch} (${o.energyError.toExponential(1)})`, o.energyError < 1e-6); }
for (const sp of ['D', 'e', 'alpha']) { const o = M.orbit(sp, 0.9, 3), est = M.passingWidthEstimate(sp, 0.9, 3); ok(`passing width ${sp} within 15% of 2qρ∥ estimate (${f(o.width / est, 2)})`, Math.abs(o.width / est - 1) < 0.15); }
ok('below the boundary: trapped', M.orbit('D', 0.45, 3).trapped); ok('above the boundary: passing', !M.orbit('D', 0.6, 3).trapped);
ok('fat α banana at q = 6 is lost', M.orbit('alpha', 0.3, 6).lost); ok('same α at q = 3 is kept', !M.orbit('alpha', 0.3, 3).lost);

/* ── 06 0-D tokamak ── */
{ const k = M.tokamak({ preset: 'iter' });
  check('ITER current', f(k.I, 0), '15'); check('ITER density', f(k.n / 1e20, 2), '1.01'); check('ITER P_fus', f(k.Pf, 0), '521'); check('ITER Q', f(k.Q, 1), '10.4'); check('ITER β_N', f(k.betaN, 2), '1.85');
  pv('iterPf', '521'); pv('iterQ', '10.4'); }
{ // SPARC at the published operating point (Creely et al. 2020, table 2: f_G 0.37, <n_e> 3.1e20, <T> 7.3 keV, β_N 1.0, κ_a 1.75)
  const k = M.tokamak({ preset: 'sparc' });
  check('SPARC volume 2π²Ra²κ_a (m³)', f(k.V, 1), '20.8'); check('SPARC density (paper 3.1)', f(k.n / 1e20, 2), '3.15'); check('SPARC β_N flat (paper 1.0)', f(k.betaN, 2), '1.00');
  check('SPARC P_fus (flat profiles)', f(k.Pf, 0), '69'); check('SPARC Q (flat profiles)', f(k.Q, 1), '3.3'); pv('sparcQ', '3.3'); pv('sparcPf', '69'); pv('sparcT', '7.3');
  // the same model with the paper's profile and impurity assumptions (ν_T 2.5, ν_n 1.33, D–T fraction 0.85, Z_eff 1.5, radiation = 2.25 × bremsstrahlung at that Z_eff)
  const p = M.tokamak({ preset: 'sparc', peaked: true });
  check('SPARC P_fus (peaked; paper 140)', f(p.Pf, 0), '152'); check('SPARC Q (peaked; paper 11)', f(p.Q, 1), '6.8'); check('SPARC τ_E (peaked; paper 0.77)', f(p.tau, 2), '0.60'); check('SPARC central T (peaked)', f(p.T0, 2), '18.25');
  pv('sparcPfpk', '152'); pv('sparcQpk', '6.8'); pv('sparcTaupk', '0.60'); pv('sparcTau', '0.77'); pv('nuT', '2.5'); pv('nuN', '1.33'); pv('fDTpct', '85'); pv('radX', '2.25'); pv('zeff', '1.5'); pv('radTot', '3.4'); check('radiation multiplier = Z_eff × 2.25', f(M.PROFILE.rad, 3), f(M.PROFILE.zeff * M.PROFILE.radX, 3)); pv('sparcQflatN', '4'); pv('wExp', '3.2');
  // independent quadrature in ρ (the model integrates in ρ²) of the fusion power with the same profiles
  { const { Ef } = M.fusionEnergies(), PR = M.PROFILE, n0 = p.n * PR.nuN, T0 = 7.3 * PR.nuT; let s = 0; const m = 4000;
    for (let i = 0; i < m; i++) { const r = (i + 0.5) / m, g = 1 - r * r; s += 2 * r * Math.pow(g, 2 * (PR.nuN - 1)) * M.sigmaV('dt', T0 * Math.pow(g, PR.nuT - 1)) * 1e-6 / m; }
    const Pf = Math.pow(PR.fDT * n0, 2) / 4 * s * Ef * p.V / 1e6;
    ok(`peaked fusion power: ρ quadrature agrees within 0.5% (${f(Pf, 1)} vs ${f(p.Pf, 1)})`, Math.abs(Pf / p.Pf - 1) < 0.005); }
  // volume averages of the profile: <(1−ρ²)^a> = 1/(1+a), so the stored energy carries ν_n·ν_T/(ν_n+ν_T−1)
  { const PR = M.PROFILE, g = PR.nuN * PR.nuT / (PR.nuN + PR.nuT - 1), W = 1.5 * (1 + PR.fDT) * p.n * 7.3 * M.K.keV * g * p.V / 1e6; check('peaked stored energy (MJ)', f(p.W, 2), f(W, 2)); }
  // the sensitivity the prose states: loss ∝ W^(1/0.31); 10% less stored energy cuts the loss by about 30% and more than doubles Q
  { const cut = Math.pow(0.9, 1 / 0.31); check('loss falls by about 30% (percent)', f((1 - cut) * 100, 0), '29'); ok('…and Q more than doubles', p.Pf / (p.Ploss * cut + p.Pbr - p.Pa) > 2 * p.Q); }
  // what the paper's own table 2 implies (2026-11-18 review): P_sep = 191·R/B, P_rad = P_RF + P_ohmic + P_α − P_sep, W = τ_E·P_sep, Q = P_fus/(P_RF + P_ohmic)
  { const sp = M.sparcPaper();
    check('paper: P_sep (MW)', f(sp.Psep, 1), '29.0'); check('paper: implied radiated power (MW)', f(sp.Prad, 1), '12.0'); check('paper: implied stored energy (MJ)', f(sp.W, 1), '22.3'); check('paper: Q = 140/(11.1 + 1.7)', f(sp.Q, 1), '10.9');
    // ITER98(y,2) by hand at the paper's inputs (8.7 MA, 12.2 T, n19 = 31, P_sep, R 1.85, κ_a 1.75, ε 0.57/1.85, M 2.5) returns the paper's τ_E = 0.77 s: P_sep is the power the scaling uses
    const tau = 0.0562 * Math.pow(8.7, 0.93) * Math.pow(12.2, 0.15) * Math.pow(31, 0.41) * Math.pow(sp.Psep, -0.69) * Math.pow(1.85, 1.97) * Math.pow(1.75, 0.78) * Math.pow(0.57 / 1.85, 0.58) * Math.pow(2.5, 0.19);
    check('paper: τ_E from ITER98(y,2) at P_sep (paper 0.77)', f(tau, 2), '0.77');
    check('model radiated power, peaked (MW; paper implies 12.0)', f(p.Pbr, 1), '11.7'); check('model stored energy, peaked (MJ; paper implies 22.3)', f(p.W, 1), '25.0'); check('model transport loss, peaked (MW; paper 29.0)', f(p.Ploss, 1), '41.5');
    ok('model radiation within 5% of the paper\'s implied value', Math.abs(p.Pbr / sp.Prad - 1) < 0.05);
    check('paper stored energy ÷ model (the "tenth less")', f(sp.W / p.W, 2), '0.89');
    pv('sparcRadpk', '12'); pv('sparcRadPaper', '12'); pv('sparcWpk', '25'); pv('sparcWpaper', '22'); pv('sparcPlosspk', '41'); pv('sparcPsep', '29'); pv('sparcQgoal', '11'); }
  const ip = M.tokamak({ preset: 'iter', peaked: true }); check('ITER with SPARC profile assumptions: P_fus', f(ip.Pf, 0), '928'); check('…and Q', f(ip.Q, 0), '18'); pv('iterPfpk', '928'); pv('iterQpk', '18');
  ok('peaking raises fusion power at fixed <n>, <T>', p.Pf > k.Pf && ip.Pf > M.tokamak({ preset: 'iter' }).Pf);
  // ITER98(y,2) itself, by hand at ITER-like inputs: 15 MA, 5.3 T, 87 MW, n19 = 10.1, M = 2.5, R = 6.2, ε = 2/6.2, κ = 1.7 → 3.6 s
  check('ITER98(y,2) at ITER inputs (s)', f(0.0562 * Math.pow(15, 0.93) * Math.pow(5.3, 0.15) * Math.pow(87, -0.69) * Math.pow(10.1, 0.41) * Math.pow(2.5, 0.19) * Math.pow(6.2, 1.97) * Math.pow(2 / 6.2, 0.58) * Math.pow(1.7, 0.78), 2), '3.61');
  { const it = M.tokamak({ preset: 'iter' }); check('model τ_E obeys the scaling at its own loss power', f(it.tau, 4), f(0.0562 * Math.pow(it.I, 0.93) * Math.pow(it.B, 0.15) * Math.pow(it.Ploss, -0.69) * Math.pow(it.n / 1e19, 0.41) * Math.pow(2.5, 0.19) * Math.pow(it.R, 1.97) * Math.pow(it.a / it.R, 0.58) * Math.pow(1.7, 0.78), 4)); }
}
ok('B⁴ at fixed β: doubling B at fixed R raises Q', M.tokamak({ preset: 'iter', R: 3.3, B: 10.6 }).Q > M.tokamak({ preset: 'iter', R: 3.3 }).Q);
pv('sparcFG', '37'); pv('hts', '20'); pv('Rsp', '1.85');

/* ── 07 ICF ── */
check('Fermi pressure coefficient (Mbar at 1 g/cc; Atzeni 2.17)', f(M.fermiPressure(1) / 1e11, 2), '2.18');
{ const x = M.icf(1000, 0.2, 0.01); check('ICF ρR', f(x.rhoR, 2), '3.63'); check('ICF burn fraction', f(x.f, 3), '0.377'); check('ICF gain', f(x.G, 1), '4.7'); check('ICF convergence', f(x.CR, 1), '27.6'); check('ICF symmetry %', f(x.sym * 100, 2), '0.94'); }
ok('ICF: too diffuse at 100 g/cc', !M.icf(100, 0.2, 0.01).hsFits);
pv('rhoR3', '3'); pv('Gplant', '100'); pv('nifG', '4.13'); pv('nifWallQ', '0.027'); pv('nifWall', '322');

/* ── 08 power flow ── */
check('Q_sci for Q_eng = 1 at η_h 40%', f(M.qForQeng(1, 0.4), 1), '4.7'); pv('q1', '4.7');
check('Q_sci for Q_eng = 5', f(M.qForQeng(5, 0.4), 0), '27'); pv('q5', '27'); pv('recircGoal', '20');
check('Q_eng at Q_sci 5 just above 1', M.plant(M.qForQeng(1, 0.4), 0.4).Qeng.toFixed(6), '1.000000');
pv('iterQeng', '2.0');

/* ── 09 tritium, wall, divertor ── */
{ const s = M.tritium(3, 0.02, 1.05); check('loop + reserve at 3 GW, 2%, 4 h', f(s.start, 1), '4.3'); pv('ourStart', '4.3'); }
check('tritium decay per year %', f((1 - Math.exp(-Math.LN2 / 12.32)) * 100, 1), '5.5');
{ const inv = M.inventory(1, 0.02, 1.1, 20), s = M.tritium(1, 0.02, 1.1); // exact solution vs Euler steps
  let I = s.start; const dt = 1e-4; for (let t = 0; t < 20 - 1e-9; t += dt) I += dt * (s.gain - s.lam * I);
  check('inventory exact = stepped', f(inv[inv.length - 1][1], 2), f(I, 2)); }
{ const e = M.exhaust(500, 6.2, 0); check('Eich λ_q ITER (mm)', f(e.lq, 2), '0.58'); check('prose lqIter', f(M.prose().lqIter.v, 1), '0.6'); check('ITER neutron wall load', f(e.load, 2), '0.59'); check('ITER-shape current', f(e.I, 0), '15'); }

{ // live-sentence formats that used to read badly: sub-year doubling times in months, near-ignition factor, large counts
  const t = M.V.tritium({ P: 0.5, fb: 0.1, tbr: 1.3 }); check('fast doubling is given in months', F(t.read.td), '0.3 个月'); check('…and uses its own sentence', t.say.t, 'ch9.say.fast');
  check('default tritium state doubles in months', F(M.V.tritium({ P: 1, fb: 0.02, tbr: 1.05 }).read.td), '6.3 个月');
  ok('near ignition the factor keeps two decimals', /1\.04 倍/.test(F(M.V.lawson({ T: 14, lg: 21.45 }).say)));
  ok('large particle counts use powers of ten', /8\.9 × 10¹¹ 个/.test(F(M.V.coulomb({ rx: 'dt', T: 22 }).say))); }

/* ── 10–11 data blocks ── */
{ const r = M.frontierRecord(); check('MCF record', r.id + ' ' + r.y, 'TFTR 1995'); pv('rec', '7.9 × 10²⁰'); pv('gap', '3.7'); }
check('NIF shots listed', String(M.FRONTIER.nif.length), '11'); pv('nifN', '11'); pv('nifLastY', '7.9'); pv('nifLastG', '3.8'); pv('nifBestY', '8.6');
{ const nf = M.FRONTIER.triple.find(p => p.kind === 'icf'); check('NIF point on the triple-product plot (Wurzel & Hsu: N210808)', nf.y + ' ' + nf.v.toExponential(1), '2021 1.6e+22'); }
pv('jetMJ', '69'); pv('jetFuel', '0.2'); pv('jetSec', '5'); pv('stock', '20'); pv('iterT', '12'); pv('candu', '130'); pv('tbrMax', '1.15'); pv('en', '14'); pv('ea', '3.5'); pv('personM', '1.7');
check('deflator FY78→FY00', f(M.deflator(), 2), '2.44'); check('Logic I level, FY2000 $M', f(200 * M.deflator(), 0), '488'); pv('l1', '4.88 亿美元'); pv('l1fy78', '2.00 亿美元');
// actual appropriations against Logic I: above it to FY1987, below from FY1988; cumulatively about equal (the prose says so)
ok('actual above Logic I in every year 1978–1987', Object.keys(M.FUNDING.crs).filter(y => +y >= 1978 && +y <= 1987).every(y => M.FUNDING.crs[y] > 200 * M.deflator()));
check('actual ÷ Logic I, 1978–2000 (percent)', f(M.funding('I', 2000).ratio * 100, 0), '103'); pv('l1Pct', '103'); pv('l2Pct', '39'); pv('dpaPer', '10'); pv('dpaPerHi', '20');
// money and dates are formatted per language (the Chinese page used to read "30,038 百万美元", the English one "2022-12-5")
{ const fu = M.V.funding({ logic: 'II' });
  check('funding readout, Chinese', F(fu.read.plan) + ' / ' + F(fu.read.act), '300 亿美元 / 116 亿美元');
  check('funding readout, English', FE(fu.read.plan) + ' / ' + FE(fu.read.act), '$30.0 billion / $11.6 billion');
  check('Logic I level, English', FE(P.l1), '$488 million'); check('FY1978 level, English', FE(P.l1fy78), '$200 million');
  ok('funding sentence, Chinese', /累计经费是 300 亿美元，实际拨了 116 亿美元，是计划的 39%/.test(F(fu.say)));
  ok('funding sentence, English', /cumulative funding is \$30\.0 billion; actual appropriations came to \$11\.6 billion, or 39% of the plan/.test(FE(fu.say)));
  check('date, Chinese', F({ date: '2022-12-05' }), '2022 年 12 月 5 日'); check('month, Chinese', F({ date: '2026-11' }), '2026 年 11 月');
  check('date, English', FE({ date: '2022-12-05' }), '5 December 2022'); check('month, English', FE({ date: '2026-11' }), 'November 2026');
  check('date, English, two-digit day', FE({ date: '2025-02-12' }), '12 February 2025');
  check('prose date, English: first ignition shot', FE(P.nif1Date), '5 December 2022'); check('prose date, English: record shot', FE(P.nifBestDate), '7 April 2025'); check('prose date, English: as of', FE(P.asOf), 'November 2026');
  check('large numbers, English', FE(P.iterExtra) + ' / ' + FE(P.fiaRaised) + ' / ' + FE(P.fiaTotal) + ' / ' + FE(P.helionT), '5 billion / 4.48 billion / 14.2 billion / 150 million');
  check('large numbers, Chinese', F(P.iterExtra) + ' / ' + F(P.fiaRaised) + ' / ' + F(P.fiaTotal) + ' / ' + F(P.helionT), '50 亿 / 44.8 亿 / 142 亿 / 1.5 亿'); }
check('first year below Logic I', String(M.firstBelowLogicI()), '1988');
ok('never back above Logic I through 2000', Object.keys(M.FUNDING.crs).filter(y => +y >= 1988).every(y => M.FUNDING.crs[y] < 200 * M.deflator()));
check('Logic II share to 2000', f(M.funding('II', 2000).ratio * 100, 0), '39'); check('Logic III share to 1998', f(M.funding('III', 1998).ratio * 100, 0), '29'); check('Logic V share to 1990', f(M.funding('V', 1990).ratio * 100, 0), '17');
check('Logic III plan total vs ERDA ($15.5B FY78)', f([...Array(21)].reduce((a, _, i) => a + M.logicAt('III', 1978 + i), 0) / 1000, 1), '15.5');

/* ── live sentences: every branch, including control extremes ── */
const hit = new Set();
function run(name, out) {
  const parts = [].concat(out.say || [], out.say2 || [], out.says || []);
  for (const sp of parts) {
    hit.add(sp.t); const s = F(sp);
    ok(`${name}: ${sp.t} resolves (${s.slice(0, 60)})`, !/\{\w+\}|NaN|Infinity|undefined|@@/.test(s));
  }
  for (const k in out.read || {}) { const s = F(out.read[k]); ok(`${name}: readout ${k} (${s})`, !/\{\w+\}|NaN|Infinity|undefined|@@/.test(s)); }
}
for (const rx of ['dt', 'ddn', 'ddp', 'dhe3', 'pb11', 'u235']) run('bind ' + rx, M.V.bind({ rx }));
for (const rx of ['dt', 'dd', 'pb11']) for (const T of [1, 2, 5, 10, 30, 60, 100]) run(`coulomb ${rx} ${T}`, M.V.coulomb({ rx, T }));
for (const rx of ['dt', 'dd', 'dhe3']) for (const T of [1, 5, 10, 50, 64, 66, 100]) run(`gamow ${rx} ${T}`, M.V.gamow({ rx, T }));
for (const T of [1, 2, 4, 4.5, 10, 14, 30, 100]) for (const lg of [19, 20, 20.7, 21.5, 22.5, 23]) run(`lawson ${T} ${lg}`, M.V.lawson({ T, lg }));
for (const sp of ['D', 'e', 'alpha']) for (const pitch of [0.05, 0.5, 0.53, 0.95]) for (const twist of [false, true]) for (const q of [1.5, 6]) run(`drift ${sp} ${pitch} ${twist} ${q}`, M.V.drift({ sp, pitch, twist, q }));
for (const preset of ['iter', 'sparc']) for (const B of [3, 5.3, 13]) for (const R of [1.5, 6.2, 9]) for (const T of [4, 9, 20]) for (const fG of [0.2, 1]) for (const peaked of [false, true]) run(`tokamak ${preset} ${B} ${R} ${T} ${fG} ${peaked}`, M.V.tokamak({ preset, B, R, T, fG, peaked }));
for (const rho of [50, 100, 300, 1000, 3162]) for (const m of [0.05, 0.2, 2]) for (const eta of [0.001, 0.005, 0.01, 0.2]) run(`icf ${rho} ${m} ${eta}`, M.V.icf({ rho, m, eta }));
for (const Q of [0.5, 1, 4.7, 10, 30, 100]) for (const etaH of [0.1, 0.4, 0.7]) run(`plant ${Q} ${etaH}`, M.V.plant({ Q, etaH }));
for (const P of [0.5, 1, 3]) for (const fb of [0.002, 0.005, 0.02, 0.1]) for (const tbr of [1, 1.01, 1.02, 1.03, 1.05, 1.3]) run(`tritium ${P} ${fb} ${tbr}`, M.V.tritium({ P, fb, tbr }));
for (const P of [300, 500, 3000]) for (const R of [3, 6.2, 10]) for (const frad of [0, 0.7, 0.95]) run(`wall ${P} ${R} ${frad}`, M.V.wall({ P, R, frad }));
for (const proj of [false, true]) for (const nif of [false, true]) run(`frontier ${proj} ${nif}`, M.V.frontier({ proj, nif }));
for (const logic of ['I', 'II', 'III', 'V']) run('funding ' + logic, M.V.funding({ logic }));
for (const k of Object.keys(Z).filter(k => /\.say\./.test(k))) ok(`branch ${k} is reached by some control state`, hit.has(k));
for (const k of hit) ok(`sentence ${k} exists in copy`, Z[k] != null);

/* ── static copy: every key the page uses exists, every {number} resolves from models.prose() ── */
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const keys = [...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]);
for (const k of new Set(keys)) { ok(`copy has ${k}`, Z[k] != null); if (Z[k] != null) { const s = M.fill(Z[k], P, L); ok(`${k} resolves (${(s.match(/\{\w+\}/g) || []).join(' ')})`, !/\{\w+\}/.test(s)); } }
for (const k of ['doc.title', 'doc.desc', 'footer']) ok(`copy has ${k}`, Z[k] != null);
// diagrams: at least six static figures, each with an aria-label and a caption from copy; keys used by the generated size diagram exist too
{ const figs = [...html.matchAll(/<figure class="dia" id="(\w+)">([\s\S]*?)<\/figure>/g)];
  ok(`at least six diagrams (${figs.length})`, figs.length >= 6);
  for (const [, id, body] of figs) { ok(`${id}: svg has role=img and an aria key`, /<svg[^>]*role="img"[^>]*data-i18n-aria="dg\d\.aria"/.test(body)); ok(`${id}: caption from copy`, /<figcaption data-i18n-html="dg\d\.cap">/.test(body)); ok(`${id}: no literal text in the SVG`, !/<text[^>]*>[^<]+<\/text>/.test(body)); }
  const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
  for (const k of new Set([...app.matchAll(/'(dg\d\.\w+)'/g)].map(m => m[1]))) { ok(`copy has ${k} (generated diagram)`, Z[k] != null); if (Z[k] != null) ok(`${k} resolves`, !/\{\w+\}/.test(M.fill(Z[k], P, L))); }
  for (const k of Object.keys(Z).filter(k => /^dg\d\./.test(k))) ok(`diagram key ${k} is used`, html.includes('"' + k + '"') || app.includes("'" + k + "'")); }
// English copy: key-for-key identical to the Chinese, same placeholders and types, resolves, and holds no CJK
{ const zk = Object.keys(Z), ek = Object.keys(E);
  ok(`copy.en.js has every Chinese key (${zk.filter(k => !(k in E)).join(' ')})`, zk.every(k => k in E));
  ok(`copy.en.js has no extra key (${ek.filter(k => !(k in Z)).join(' ')})`, ek.every(k => k in Z));
  ok('keys are in the same order', zk.join('|') === ek.join('|'));
  const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join(' ');
  for (const k of zk) { if (!(k in E)) continue;
    ok(`${k}: same type in both languages`, typeof Z[k] === typeof E[k] && Array.isArray(Z[k]) === Array.isArray(E[k]));
    if (typeof Z[k] === 'string') { ok(`${k}: same placeholders in both languages (zh: ${ph(Z[k])} | en: ${ph(E[k])})`, ph(Z[k]) === ph(E[k]));
      ok(`${k}: no CJK in English`, !/[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/.test(E[k])); } }
  for (const k of new Set(keys)) if (E[k] != null) ok(`en ${k} resolves`, !/\{\w+\}|@@|NaN|undefined/.test(M.fill(E[k], P, LE)));
  ok('en footer and title resolve', !/\{\w+\}|@@/.test(M.fill(E.footer, P, LE) + M.fill(E['doc.title'], P, LE) + M.fill(E['doc.desc'], P, LE)));
  // every live sentence and readout in English, over the same control states as the Chinese run above
  const enOut = []; const runE = out => { for (const sp of [].concat(out.say || [], out.say2 || [], out.says || [])) enOut.push(FE(sp)); for (const k in out.read || {}) enOut.push(FE(out.read[k])); };
  for (const rx of ['dt', 'ddn', 'ddp', 'dhe3', 'pb11', 'u235']) runE(M.V.bind({ rx }));
  for (const rx of ['dt', 'dd', 'pb11']) for (const T of [1, 10, 100]) runE(M.V.coulomb({ rx, T }));
  for (const rx of ['dt', 'dd', 'dhe3']) for (const T of [1, 10, 66, 100]) runE(M.V.gamow({ rx, T }));
  for (const T of [1, 4, 10, 14, 100]) for (const lg of [19, 20.7, 21.5, 23]) runE(M.V.lawson({ T, lg }));
  for (const sp of ['D', 'e', 'alpha']) for (const pitch of [0.05, 0.53, 0.95]) for (const twist of [false, true]) runE(M.V.drift({ sp, pitch, twist, q: 3 }));
  for (const preset of ['iter', 'sparc']) for (const B of [3, 13]) for (const R of [1.5, 9]) for (const peaked of [false, true]) runE(M.V.tokamak({ preset, B, R, T: 9, fG: 0.85, peaked }));
  for (const rho of [50, 1000, 3162]) for (const eta of [0.001, 0.01, 0.2]) runE(M.V.icf({ rho, m: 0.2, eta }));
  for (const Q of [0.5, 10, 100]) for (const etaH of [0.1, 0.7]) runE(M.V.plant({ Q, etaH }));
  for (const fb of [0.002, 0.02, 0.1]) for (const tbr of [1, 1.02, 1.05, 1.3]) runE(M.V.tritium({ P: 1, fb, tbr }));
  for (const P2 of [300, 3000]) for (const R of [3, 10]) for (const frad of [0, 0.95]) runE(M.V.wall({ P: P2, R, frad }));
  for (const proj of [false, true]) runE(M.V.frontier({ proj, nif: true }));
  for (const logic of ['I', 'II', 'III', 'V']) runE(M.V.funding({ logic }));
  const bad = enOut.filter(s => /\{\w+\}|NaN|Infinity|undefined|@@|[\u3400-\u9fff]/.test(s));
  ok(`English live sentences and readouts resolve without CJK (${enOut.length} strings; bad: ${bad.slice(0, 3).join(' | ')})`, bad.length === 0);
  // links to other pages on this site carry the registered titles (pages.config.js): full title in English, the part before " · " in Chinese
  const cfg = fs.readFileSync(path.join(dir, '..', '..', '..', 'pages.config.js'), 'utf8'), titles = {};
  for (const m of cfg.matchAll(/title: \{ zh: "([^"]+)", en: "([^"]+)" \},[\s\S]*?path: "([^"]+)"/g)) titles[m[3]] = { zh: m[1], en: m[2] };
  const here = 'physics/modern/why-fusion-is-hard/';
  for (const [lang, C] of [['zh', Z], ['en', E]]) for (const k in C) { if (typeof C[k] !== 'string') continue;
    for (const m of C[k].matchAll(/<a href="(\.\.\/[^"#]*)(?:#[^"]*)?">([^<]+)<\/a>/g)) {
      const target = path.posix.normalize(here + m[1]); if (target === './' || target === '.') continue;
      const tt = titles[target]; ok(`${lang} ${k}: link target ${target} is a registered page`, !!tt);
      if (tt) ok(`${lang} ${k}: link text "${m[2]}" is the registered title`, lang === 'en' ? m[2] === tt.en : m[2] === tt.zh.split(' · ')[0]); } } }
const CJK = /[㐀-鿿]/;
ok('no Chinese in models.js', !CJK.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')));
ok('no Chinese in app.js', !CJK.test(fs.readFileSync(path.join(dir, 'app.js'), 'utf8')));
// the page-provenance label (added at registration, 2026-11-18) is bilingual by contract: exactly one, stripped before the check
ok('one page-provenance label', (html.match(/<details class="page-provenance"/g) || []).length === 1);
ok('index.html: Chinese only in <title>, meta description, the 中 toggle and the provenance label', !CJK.test(html.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '').replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('>中<', '><')));
ok('no "left/right figure" wording', !Object.values(Z).some(v => typeof v === 'string' && /左图|右图|左边的图|右边的图|右边的|左边的/.test(v)));

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (models pinned, ${hit.size} live-sentence templates driven through their branches, copy resolves)`);
