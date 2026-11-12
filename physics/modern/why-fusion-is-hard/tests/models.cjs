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
{ const k = M.tokamak({ preset: 'sparc' }); check('SPARC volume ≈ 20 m³', f(k.V, 0), '20'); check('SPARC density', f(k.n / 1e20, 1), '3.0'); check('SPARC Q (flat profiles)', f(k.Q, 1), '3.2'); pv('sparcQ', '3.2'); }
ok('B⁴ at fixed β: doubling B at fixed R raises Q', M.tokamak({ preset: 'iter', R: 3.3, B: 10.6 }).Q > M.tokamak({ preset: 'iter', R: 3.3 }).Q);
pv('sparcFG', '35'); pv('hts', '20'); pv('Rsp', '1.85');

/* ── 07 ICF ── */
check('Fermi pressure coefficient (Mbar at 1 g/cc; Atzeni 2.17)', f(M.fermiPressure(1) / 1e11, 2), '2.18');
{ const x = M.icf(1000, 0.2, 0.01); check('ICF ρR', f(x.rhoR, 2), '3.63'); check('ICF burn fraction', f(x.f, 3), '0.377'); check('ICF gain', f(x.G, 1), '4.7'); check('ICF convergence', f(x.CR, 1), '27.6'); check('ICF symmetry %', f(x.sym * 100, 2), '0.94'); }
ok('ICF: too diffuse at 100 g/cc', !M.icf(100, 0.2, 0.01).hsFits);
pv('rhoR3', '3'); pv('Gplant', '100'); pv('nifG', '4.13'); pv('nifWallQ', '0.029');

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

/* ── 10–11 data blocks ── */
{ const r = M.frontierRecord(); check('MCF record', r.id + ' ' + r.y, 'TFTR 1995'); pv('rec', '7.9 × 10²⁰'); pv('gap', '3.7'); }
check('NIF shots listed', String(M.FRONTIER.nif.length), '11'); pv('nifN', '11');
check('deflator FY78→FY00', f(M.deflator(), 2), '2.44'); pv('l1', '488');
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
for (const preset of ['iter', 'sparc']) for (const B of [3, 5.3, 13]) for (const R of [1.5, 6.2, 9]) for (const T of [4, 9, 20]) for (const fG of [0.2, 1]) run(`tokamak ${preset} ${B} ${R} ${T} ${fG}`, M.V.tokamak({ preset, B, R, T, fG }));
for (const rho of [50, 100, 300, 1000, 3162]) for (const m of [0.05, 0.2, 2]) for (const eta of [0.001, 0.005, 0.01, 0.2]) run(`icf ${rho} ${m} ${eta}`, M.V.icf({ rho, m, eta }));
for (const Q of [0.5, 1, 4.7, 10, 30, 100]) for (const etaH of [0.1, 0.4, 0.7]) run(`plant ${Q} ${etaH}`, M.V.plant({ Q, etaH }));
for (const P of [0.5, 3]) for (const fb of [0.002, 0.02, 0.1]) for (const tbr of [1, 1.01, 1.03, 1.05, 1.3]) run(`tritium ${P} ${fb} ${tbr}`, M.V.tritium({ P, fb, tbr }));
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
const CJK = /[㐀-鿿]/;
ok('no Chinese in models.js', !CJK.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')));
ok('no Chinese in app.js', !CJK.test(fs.readFileSync(path.join(dir, 'app.js'), 'utf8')));
ok('index.html: Chinese only in <title>, meta description and the 中 toggle', !CJK.test(html.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('>中<', '><')));
ok('no "left/right figure" wording', !Object.values(Z).some(v => typeof v === 'string' && /左图|右图|左边的图|右边的图|右边的|左边的/.test(v)));

if (fails) { console.error(`${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (models pinned, ${hit.size} live-sentence templates driven through their branches, copy resolves)`);
