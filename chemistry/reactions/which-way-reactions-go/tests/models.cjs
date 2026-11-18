'use strict';
// Pins the models of which-way-reactions-go against tabulated data and independent derivations.
// Run: node chemistry/reactions/which-way-reactions-go/tests/models.cjs
// NOT YET COVERED (see BRIEF.md "Unfinished / not verified"): live-sentence branches (app.js does not wire the labs yet),
// copy keys used by app.js, and a per-binding independent re-derivation of every one of the 101 prose numbers.
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
let n = 0, fails = 0;
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info != null ? ': ' + info : ''}`); } }
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want} ± ${tol}`);

/* 1. constants */
near('Faraday', M.FARADAY, 96485.33212, 1e-4);
near('kT at 300 K in meV', M.kT_eV(300) * 1000, 25.852, 0.001);
near('1 eV in kJ/mol', M.eVtokJ(1), 96.485, 0.001);

/* 2. Shomate equations against the NIST-JANAF table for NH3(g) (janaf.nist.gov H-083, opened 2026-11-18):
      ΔfG° in kJ/mol and log Kf per mole of NH3 */
const JANAF = [[298.15, -16.367, 2.867], [400, -5.941, 0.776], [500, 4.800, -0.501], [600, 15.879, -1.382], [700, 27.190, -2.029], [800, 38.662, -2.524], [900, 50.247, -2.916], [1000, 61.910, -3.234]];
for (const [T, g, logK] of JANAF) {
  near(`NH3 ΔfG° at ${T} K`, M.ammoniaDG(T).dG / 2, g, 0.01);
  near(`NH3 log Kf at ${T} K`, Math.log10(M.ammoniaK(T)) / 2, logK, 0.002);
}
near('NH3 ΔfH° at 700 K (JANAF −52.618)', M.ammoniaDG(700).dH / 2, -52.618, 0.01);
near('NH3 S° at 1000 K (JANAF 246.486)', M.shomate('NH3', 1000).S, 246.486, 0.02);

/* 3. reaction data: sums re-typed by hand from the species table */
const r = id => M.rxn(id);
near('N2 + 3H2 → 2NH3 ΔH°', r('nh3').dH, -91.80, 1e-9);
near('N2 + 3H2 → 2NH3 ΔS°', r('nh3').dS, 2 * 192.77 - 191.609 - 3 * 130.680, 1e-9);
near('N2O4 → 2NO2 ΔH°', r('n2o4').dH, 57.12, 1e-9);
near('N2O4 → 2NO2 ΔS°', r('n2o4').dS, 175.70, 1e-9);
near('2C + O2 → 2CO ΔS°', r('co').dS, 178.688, 1e-3);
near('water formation ΔG° per H2 (CODATA-derived −237.1)', M.WATER.dG, -237.14, 0.02);
const quad = { h2o2: 'always', co: 'always', nh3: 'cold', dimer: 'cold', water: 'cold', n2o4: 'hot', vap: 'hot', lime: 'hot', ozone: 'never', no2: 'never' };
for (const k in quad) ok('quadrant ' + k, M.quadrant(r(k)) === quad[k], M.quadrant(r(k)));

/* 4. entropy ledger: ΔS_total = −ΔG/T, zero at the melting point */
near('ice: balance at 273.15 K', M.ledger(M.PROCESSES.ice, 273.15).tot, 0, 1e-9);
ok('ice melts at +10 °C, not at −10 °C', M.ledger(M.PROCESSES.ice, 283.15).goes && !M.ledger(M.PROCESSES.ice, 263.15).goes);
{ const p = r('lime'), T = 800; near('ledger total = −ΔG/T', M.ledger(p, T).tot, -M.dG(p, T) * 1000 / T, 1e-9); }

/* 5. counting */
ok('Ω(3,3) = 10', M.omega(3, 3) === 10);
ok('4 balls: 1 4 6 4 1', [0, 1, 2, 3, 4].map(k => M.binom(4, k)).join() === '1,4,6,4,1');
near('lnΩ agrees with exact count', M.lnOmega(6, 9), Math.log(M.omega(6, 9)), 1e-9);
{ // brute-force enumeration of two small solids
  const NA = 3, NB = 4, q = 6, cnt = new Array(q + 1).fill(0);
  (function rec(i, left, a) { if (i === NA + NB - 1) { cnt[a + (i < NA ? left : 0)]++; return; } for (let k = 0; k <= left; k++) rec(i + 1, left - k, a + (i < NA ? k : 0)); })(0, q, 0);
  const tot = cnt.reduce((s, x) => s + x, 0), sp = M.split(NA, NB, q);
  ok('enumeration total = Ω(7,6)', tot === M.omega(7, 6), tot);
  for (let a = 0; a <= q; a++) near(`P(qA=${a}) by enumeration`, sp.p[a], cnt[a] / tot, 1e-12);
}
{ // the random walk samples the counted distribution
  const s = M.solidSim(5, 15, 20, 3); s.step(20000); let sum = 0, m = 0;
  for (let i = 0; i < 40000; i++) { s.step(20); sum += s.qA(); m++; }
  near('solidSim mean qA → q·NA/(NA+NB)', sum / m, 5, 0.15);
  ok('solidSim conserves energy', s.n.reduce((a, b) => a + b, 0) === 20);
}
near('R ln 2', M.mixS(0.5), 5.763, 0.001);

/* 6. Boltzmann factor from counting */
ok('bath: large bath converges to the exponential', M.bath(2000, 2000, 8).err < 1e-3 && M.bath(4, 4, 4).err > 0.01);
near('bath: r = 1/2 when q = N', M.bath(100, 100, 5).r, 0.5, 1e-12);
near('ratio at 0.5 eV, 300 K', M.boltzRatio(0.5, 300), Math.exp(-0.5 / (8.617333262e-5 * 300)), 1e-15);

/* 7. N2O4 ⇌ 2NO2 */
{ const d = M.dissoc(298.15, 1);
  near('K(298.15)', d.K, 0.148, 0.001);
  near('Q(ξeq) = K', d.Q(d.xiEq), d.K, 1e-12);
  near('slope at ξeq is zero', d.slope(d.xiEq), 0, 1e-9);
  let best = 0, bg = Infinity; for (let x = 0.001; x < 1; x += 0.001) { const g = d.G(x); if (g < bg) { bg = g; best = x; } }
  near('G(ξ) minimum found by scanning = closed form', best, d.xiEq, 0.001);
  near('numerical dG/dξ = ΔG° + RT ln Q', (d.G(0.4001) - d.G(0.3999)) / 0.0002, d.slope(0.4), 1e-4);
  ok('Le Chatelier: pressure pushes back, heat pushes forward', M.dissoc(298.15, 10).xiEq < d.xiEq && M.dissoc(350, 1).xiEq > d.xiEq);
}

/* 8. kinetics */
{ const a = M.twoState(80, 0, -3, 298), c = M.twoState(80, 10, -3, 298);
  near('catalyst leaves K unchanged', c.K, a.K, 1e-12); near('…and xEq', c.xEq, a.xEq, 1e-12);
  near('speed-up = e^(10 kJ/RT)', a.tau / c.tau, Math.exp(10000 / (M.R * 298)), 1e-6);
  near('detailed balance kf/kr = K', a.kf / a.kr, a.K, 1e-9);
  const s = M.flipSim(4000, 5); for (let i = 0; i < 400; i++) s.step(a, a.tau / 10);
  near('flipSim reaches xEq', s.nB / s.N, a.xEq, 0.03);
  const s2 = M.flipSim(20000, 9); s2.step(a, a.tau); near('flipSim follows the relaxation law', s2.nB / s2.N, M.relax(a, a.tau, 0), 0.015);
}

/* 9. coupling */
near('E° of H2/O2', M.E_REV, 1.229, 0.001); near('thermoneutral voltage', M.E_TN, 1.481, 0.001);
near('kWh/kg H2 at 1.481 V (HHV 39.4)', M.kWhPerKgH2(M.E_TN), 39.39, 0.02);
near('DOE: 55 kWh/kg is 61% LHV', M.kWhPerKgH2(M.E_LHV) / 55, 0.61, 0.006);
{ const al = M.ellingham('oxAl', 1233.15), fe = M.ellingham('oxFe', 1500);
  near('Al2O3 decomposition voltage at 960 °C (literature ≈ 2.2 V)', al.volts, 2.2, 0.06);
  near('…with carbon anode (literature ≈ 1.2 V)', al.voltsC, 1.2, 0.03);
  ok('carbon reduces FeO at 1500 K, not Al2O3 at 1233 K', fe.carbonWins && !al.carbonWins);
  near('crossing: lines equal at Tx', M.dG(M.rxn('oxFe'), fe.Tx), M.dG(M.CO_LINE, fe.Tx), 1e-9);
}
near('ATP in the cell', M.atpDG(10, 0.01), -30.5 + 8.314462618e-3 * 310.15 * Math.log(0.001), 1e-9);

/* 10. ammonia equilibrium and converter */
{ const e = M.ammoniaEq(723.15, 200, 0), s = M.ammoniaMix(e.xi, 200, 0);
  near('equilibrium satisfies K', s.nh3 * s.nh3 / (s.n2 * Math.pow(s.h2, 3)) / e.K, 1, 1e-6);
  ok('yield falls with T, rises with p', M.ammoniaEq(773.15, 200, 0).y < e.y && M.ammoniaEq(723.15, 300, 0).y > e.y);
  // Larson & Dodge (1923) measured about 2.0% at 10 atm and 16.4% at 100 atm, 450 °C (quoted from memory, not reopened)
  near('ideal-gas yield at 450 °C, 10 atm', M.ammoniaEq(723.15, 10.13, 0).y, 0.021, 0.002);
  const c = M.converter(723.15, 200, 1);
  ok('converter never exceeds equilibrium', c.y <= c.yEq && c.y > M.TP.y0);
  ok('more catalyst → closer to equilibrium, lower best T', M.converter(723.15, 200, 10).y > c.y && M.bestT(200, 10).T < M.bestT(200, 1).T);
  near('rate vanishes at equilibrium', M.tpRate(M.ammoniaEq(723.15, 200, M.TP.y0).xi, 723.15, 200, M.ammoniaEq(723.15, 200, M.TP.y0).n0, c.K), 0, 1e-6);
  // forward Euler check of the quadrature
  let xi = 0, t = 0; const dt = 1e-5; while (t < 1) { xi += dt * M.tpRate(xi, 723.15, 200, c.xi * 0 + M.ammoniaEq(723.15, 200, M.TP.y0).n0, c.K); t += dt; }
  near('converter quadrature = direct integration', c.xi, xi, 2e-3);
}

/* 11. regular solution */
near('spinodal at χ = 2.5', M.spinodal(2.5), (1 - Math.sqrt(0.2)) / 2, 1e-12);
{ const xb = M.binodal(2.5); near('binodal: dg/dx = 0', Math.log(xb / (1 - xb)) + 2.5 * (1 - 2 * xb), 0, 1e-8);
  ok('no gap above Tc', M.binodal(1.9) === null && !M.demix(0.5, 1.1).split);
  ok('states', M.demix(0.5, 0.8).state === 'spin' && M.demix(0.2, 0.8).state === 'meta' && M.demix(0.05, 0.8).state === 'one'); }

/* 12. minimum work */
near('DAC minimum at 425 ppm, kJ/mol', M.minWorkCO2(425e-6), 19.2, 0.1);
near('…in kWh per tonne', M.perTonneKWh(M.minWorkCO2(425e-6)), 121.5, 0.5);
near('NH3 LHV GJ/t', M.lhvNH3() * 1000, 18.6, 0.05);

/* 13. bindings: every {=name} in the content is defined and every binding is finite text */
const zh = fs.readFileSync(path.join(DIR, 'content.zh.md'), 'utf8');
const used = new Set([...zh.matchAll(/\{=([\w.]+)\}/g)].map(m => m[1]));
for (const k of used) ok('binding defined: ' + k, B[k] != null && !/NaN|undefined|∞/.test(B[k]), B[k]);
for (const k in B) ok('binding used: ' + k, used.has(k));
ok('ch11.wt is 121 or 122', /^12[12]$/.test(B['ch11.wt']), B['ch11.wt']);
// registry
const REG = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
ok('registry: 12 concepts with anchors', REG.concepts.length === 12 && REG.concepts.every(c => /^#ch\d+$/.test(c.anchor) && zh.includes(`{${c.anchor}}`)));

if (fails) { console.error(`${n - fails}/${n} checks passed`); process.exit(1); }
console.log(`${n}/${n} checks passed`);
