'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const DIR = path.resolve(__dirname, '..');
const modelsSrc = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
const copySrc = fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const appSrc = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(copySrc, sandbox);

const M = require(path.join(DIR, 'models.js'));
const Z = sandbox.window.ESSAY_COPY.zh;

let passed = 0;
let failed = 0;

function check(label, cond, extra) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error('FAIL:', label, extra !== undefined ? '-> ' + extra : '');
  }
}

function near(a, b, tol = 1e-6) {
  return Math.abs(a - b) <= tol;
}

function f(v, d = 2) {
  return v.toFixed(d);
}

function says(key, sub) {
  const txt = Z[key] || '';
  check(`copy[${key}] contains "${sub}"`, txt.includes(sub), txt);
}

/* ── 0. HTML / app.js / copy.zh.js Parity & I18N Hygiene ── */
{
  check('ReactionModels exported', !!M);
  check('ESSAY_COPY.zh exported', !!Z);

  const attrMatches = [...htmlSrc.matchAll(/data-i18n(?:|-html|-aria)="([^"]+)"/g)].map(m => m[1]);
  check('index.html has i18n keys', attrMatches.length > 80, attrMatches.length);
  for (const k of attrMatches) {
    check(`html key exists in copy.zh: ${k}`, Z[k] !== undefined);
  }

  const staticCalls = [...appSrc.matchAll(/\bt\('([^']+)'/g)].map(m => m[1]);
  for (const k of staticCalls) {
    if (!k.endsWith('.')) {
      check(`app.js key exists in copy.zh: ${k}`, Z[k] !== undefined);
    }
  }

  // Zero CJK in app.js
  check('app.js has zero CJK characters', !/[\u4e00-\u9fff]/.test(appSrc));
  // In index.html, CJK only inside <title>, <meta name="description">, and >中</button>
  const strippedHtml = htmlSrc
    .replace(/<title>[^<]*<\/title>/g, '')
    .replace(/<meta name="description"[^>]*>/g, '')
    .replace(/>中<\/button>/g, '');
  check('index.html has zero stray CJK outside head/中 button', !/[\u4e00-\u9fff]/.test(strippedHtml));
}

/* ── Ch1: Multiplicity & Entropy ── */
{
  const e0 = M.einsteinDist(10, 10, 20);
  const sumP = e0.probs.reduce((a, b) => a + b, 0);
  check('ch1 einstein probs sum to 1', near(sumP, 1, 1e-12), sumP);
  check('ch1 equal boxes peak at Q/2', e0.peakQ === 10, e0.peakQ);
  says('ch1.p3', f(e0.logTotal / Math.LN10, 2));
  says('ch1.p3', f(e0.peakProb * 100, 2) + '%');
  says('ch1.p3', f(e0.edgeProb * 100, 4) + '%');

  const eUneq = M.einsteinDist(16, 10, 20);
  check('ch1 unequal boxes shift peak toward larger box', eUneq.peakQ > 10, eUneq.peakQ);

  // Energy walker conservation
  const rng = M.mulberry32(7);
  const st = { qA: 0, Q: 20, steps: 0, hist: new Array(21).fill(0) };
  for (let i = 0; i < 500; i++) M.stepEnergyWalker(st, 10, 10, rng);
  check('ch1 energy walker preserves 0 <= qA <= Q', st.qA >= 0 && st.qA <= 20 && st.steps === 500);

  const mix = M.mixingDist(16);
  const sumMix = mix.probs.reduce((a, b) => a + b, 0);
  check('ch1 mixing probs sum to 1', near(sumMix, 1, 1e-12), sumMix);
  check('ch1 mixing peak at k=8', mix.peakK === 8);
  const wPeak = Math.exp(mix.logW[mix.peakK]);
  says('ch1.p3', (wPeak / 1e8).toFixed(2) + ' × 10<sup>8</sup>');

  // Mixing walker preserves total red count
  const grid = new Array(32).fill(0).map((_, i) => (i < 16 ? 1 : 0));
  const mst = { grid, k: 0, steps: 0, hist: new Array(17).fill(0) };
  for (let i = 0; i < 500; i++) M.stepMixingWalker(mst, 16, rng);
  check('ch1 mixing walker conserves total red balls = 16', mst.grid.reduce((a, b) => a + b, 0) === 16);

  const seen = new Set([
    M.say.ch1('energy', { NA: 10, NB: 10 }),
    M.say.ch1('energy', { NA: 16, NB: 10 }),
    M.say.ch1('mixing', { NA: 10, NB: 10 })
  ]);
  for (const k of ['ch1.say.equal', 'ch1.say.unequal', 'ch1.say.mixing']) {
    check(`ch1 say branch reached & defined: ${k}`, seen.has(k) && !!Z[k]);
  }
}

/* ── Ch2: Boltzmann Factor vs Finite Bath ── */
{
  const b0 = M.boltzmannVsBath(300, 5, 80);
  check('ch2 boltzmann probs sum to 1', near(b0.pBoltz.reduce((a, b) => a + b, 0), 1, 1e-12));
  check('ch2 bath probs sum to 1', near(b0.pBath.reduce((a, b) => a + b, 0), 1, 1e-12));
  check('ch2 finite bath is steeper than infinite Boltzmann', b0.pBath[3] < b0.pBoltz[3]);
  says('ch2.p3', f(b0.RT_kJ, 2) + ' kJ/mol');
  says('ch2.p3', b0.pBoltz.map(p => f(p * 100, 2) + '%').join(' / '));
  says('ch2.p3', b0.pBath.map(p => f(p * 100, 2) + '%').join(' / '));
  says('ch2.p3', String(b0.QB));
  check('ch2 exp(-50/RT) at 300K ~ 2e-9', near(Math.exp(-50 / b0.RT_kJ), 2e-9, 5e-10));
  says('ch2.p3', '2 × 10<sup>−9</sup>');

  const seen = new Set();
  for (const T of [150, 300, 1200]) {
    for (const dE of [2, 5, 15]) {
      const k = M.say.ch2(M.boltzmannVsBath(T, dE, 80));
      seen.add(k);
      check(`ch2 say key defined: ${k}`, !!Z[k]);
    }
  }
  for (const k of ['ch2.say.frozen', 'ch2.say.mid', 'ch2.say.hot']) {
    check(`ch2 branch reached: ${k}`, seen.has(k));
  }
}

/* ── Ch3: ΔG = ΔH - TΔS Four Quadrants ── */
{
  const nh4 = M.evalReaction('nh4no3', 298.15);
  const caco3 = M.evalReaction('caco3', 298.15);
  const nh3 = M.evalReaction('nh3', 298.15);
  const n2o4 = M.evalReaction('n2o4', 298.15);

  check('ch3 identity dS_tot == -1000*dG/T', near(nh4.dS_tot, -1000 * nh4.dG / 298.15, 1e-9));
  says('ch3.p3', f(nh4.dH, 2));
  says('ch3.p3', f(nh4.dS, 1));
  says('ch3.p3', '−' + f(Math.abs(nh4.dG), 2) + ' kJ/mol');
  says('ch3.p3', '+' + f(caco3.dG, 2) + ' kJ/mol');
  says('ch3.p3', Math.round(caco3.Tcross) + ' K');
  says('ch3.p3', Math.round(caco3.Tcross - 273.15) + ' °C');
  says('ch3.p3', '−' + f(Math.abs(nh3.dG), 2) + ' kJ/mol');
  says('ch3.p3', Math.round(nh3.Tcross) + ' K');
  says('ch3.p3', Math.round(nh3.Tcross - 273.15) + ' °C');
  says('ch4.p1', '+' + f(n2o4.dG, 2) + ' kJ/mol');

  const seen = new Set();
  for (const r of M.REACTIONS) {
    for (const T of [200, 298.15, 1500]) {
      const ev = M.evalReaction(r.id, T);
      const k = M.say.ch3(ev);
      seen.add(k);
      check(`ch3 say key defined: ${k}`, !!Z[k]);
    }
  }
  for (const k of ['ch3.say.always', 'ch3.say.never', 'ch3.say.go', 'ch3.say.stop']) {
    check(`ch3 branch reached: ${k}`, seen.has(k));
  }
}

/* ── Ch4: G(xi), Q vs K, Le Chatelier & van 't Hoff ── */
{
  const eq1 = M.eqExtent('n2o4', 298.15, 1);
  const eq5 = M.eqExtent('n2o4', 298.15, 5);
  const eq350 = M.eqExtent('n2o4', 350, 1);
  const eqNh3_298 = M.eqExtent('nh3', 298.15, 1);
  const eqNh3_723 = M.eqExtent('nh3', 723.15, 200);

  // Exact minimum check: dG/dxi == 0 at eq.xi
  const atEq = M.gibbsExtent('n2o4', 298.15, 1, eq1.xi);
  check('ch4 dG/dxi == 0 at N2O4 equilibrium', near(atEq.dGdxi, 0, 1e-4), atEq.dGdxi);
  check('ch4 Q == K at N2O4 equilibrium', near(atEq.Q, atEq.K, 1e-4));
  const atEqNh3 = M.gibbsExtent('nh3', 723.15, 200, eqNh3_723.xi);
  check('ch4 dG/dxi == 0 at NH3 equilibrium', near(atEqNh3.dGdxi, 0, 1e-3), atEqNh3.dGdxi);

  // Le Chatelier signs
  check('ch4 higher pressure reduces N2O4 dissociation (dN=+1)', eq5.xi < eq1.xi);
  check('ch4 higher T increases endothermic N2O4 dissociation', eq350.xi > eq1.xi);

  says('ch4.p3', f(eq1.K, 3));
  says('ch4.p3', f(eq1.xi * 100, 1) + '%');
  says('ch4.p3', f(eq5.xi * 100, 1) + '%');
  says('ch4.p3', f(eq350.K, 2));
  says('ch4.p3', f(eq350.xi * 100, 1) + '%');
  says('ch4b.say.endo', f(eq1.xi * 100, 1) + '%');
  says('ch4b.say.endo', f(eq5.xi * 100, 1) + '%');
  says('ch4b.say.endo', f(eq350.xi * 100, 1) + '%');
  says('ch4b.say.exo', f(eqNh3_298.xi * 100, 1) + '%');
  says('ch4b.say.exo', f(eqNh3_723.xi * 100, 1) + '%');

  const seen = new Set();
  for (const xi of [0.02, eq1.xi, 0.98]) {
    const k = M.say.ch4a(xi, eq1);
    seen.add(k);
    check(`ch4a say key defined: ${k}`, !!Z[k]);
  }
  for (const k of ['ch4.say.fwd', 'ch4.say.atEq', 'ch4.say.rev']) {
    check(`ch4a branch reached: ${k}`, seen.has(k));
  }
  check('ch4b both branches defined', !!Z[M.say.ch4b('n2o4')] && !!Z[M.say.ch4b('nh3')]);
}

/* ── Ch5: Kinetics vs Thermodynamics & Catalyst Invariance ── */
{
  const p0 = M.kineticsParams(320, -4, 0);
  const p15 = M.kineticsParams(320, -4, 15);
  check('ch5 catalyst does NOT change K', near(p0.K, p15.K, 1e-12));
  check('ch5 catalyst does NOT change Beq', near(p0.Beq, p15.Beq, 1e-12));
  check('ch5 kf/kr === K identically', near(p15.kf / p15.kr, p15.K, 1e-9));
  check('ch5 mass conservation A+B === 1', near(M.kineticsAt(p15, 0.05).A + M.kineticsAt(p15, 0.05).B, 1, 1e-12));
  check('ch5 B(infinity) converges to Beq', near(M.kineticsAt(p15, 100).B, p15.Beq, 1e-12));

  const speedup = p0.tHalf / p15.tHalf;
  says('ch5.p3', 'K = ' + f(p0.K, 2));
  says('ch5.p3', f(p0.Beq * 100, 1) + '%');
  says('ch5.p3', f(p0.tHalf, 2) + ' s');
  says('ch5.p3', f(p15.tHalf, 4) + ' s');
  says('ch5.p3', Math.round(speedup) + ' 倍');

  check('ch5 say branches', !!Z[M.say.ch5(0)] && !!Z[M.say.ch5(15)] && M.say.ch5(0) !== M.say.ch5(15));
}

/* ── Ch6: ATP Coupling & Ellingham Diagram ── */
{
  const atp0 = M.atpCoupling(10, 5, 310.15);
  const atpFail = M.atpCoupling(1e-5, 50, 310.15);
  check('ch6a physiological ATP couples spontaneously', atp0.spontaneous && atp0.dG_net < -30);
  check('ch6a depleted ATP fails to drive phosphorylation', !atpFail.spontaneous && atpFail.dG_net > 0);
  check('ch6a say branches', !!Z[M.say.ch6a(atp0)] && !!Z[M.say.ch6a(atpFail)] && M.say.ch6a(atp0) !== M.say.ch6a(atpFail));

  const feo = M.ellinghamAnalysis('feo', 1200);
  const zno = M.ellinghamAnalysis('zno', 1200);
  const al = M.ellinghamAnalysis('al2o3', 1240);
  check('ch6b CO line has negative slope (dS > 0)', M.ellinghamDG('co', 2000) < M.ellinghamDG('co', 500));
  check('ch6b FeO crossover < ZnO crossover < Al2O3 crossover', feo.Tcross < zno.Tcross && zno.Tcross < al.Tcross);

  says('ch6.p3', Math.round(feo.Tcross) + ' K');
  says('ch6.p3', Math.round(feo.Tcross - 273.15) + ' °C');
  says('ch6.p3', Math.round(zno.Tcross) + ' K');
  says('ch6.p3', Math.round(al.Tcross) + ' K');
  says('ch6.p3', Math.round(al.Tcross - 273.15) + ' °C');
  says('ch6.p3', f(al.E_min_pure, 2) + ' V');
  says('ch6.p3', f(al.E_min_carbonAnode, 2) + ' V');

  const seen = new Set();
  for (const ox of ['feo', 'zno', 'tio2', 'al2o3', 'mgo']) {
    for (const T of [300, 1240, 2500]) {
      const k = M.say.ch6b(M.ellinghamAnalysis(ox, T));
      seen.add(k);
      check(`ch6b key defined: ${k}`, !!Z[k]);
    }
  }
  check('ch6b both branches reached', seen.has('ch6.say.carbon') && seen.has('ch6.say.electro'));
}

/* ── Ch7: Haber-Bosch Plant Simulator ── */
{
  const r450 = M.haberReactor(450, 200, 1);
  const r550 = M.haberReactor(550, 200, 1);
  const r350 = M.haberReactor(350, 200, 1);
  check('ch7 single-pass never exceeds equilibrium', r450.singleConv <= r450.eqConv + 1e-9);
  check('ch7 450 C peak beats both 350 C and 550 C at tau=1', r450.singleConv > r350.singleConv && r450.singleConv > r550.singleConv);
  check('ch7 higher pressure improves equilibrium conversion', M.haberReactor(450, 400, 1).eqConv > r450.eqConv);
  check('ch7 default (450 C, 200 bar, tau=1) hits ch7.say.window', M.say.ch7(r450) === 'ch7.say.window');
  check('ch7 default loopYield ~ 90%', near(r450.loopYield * 100, 90, 2));

  says('ch7.p3', f(r450.eqConv * 100, 1) + '%');
  says('ch7.p3', f(r450.singleConv * 100, 1) + '%');
  says('ch7.p3', f(r450.singleYNH3 * 100, 1) + '%');
  says('ch7.p3', f(r550.singleConv * 100, 1) + '%');
  says('ch7.p3', f(r350.singleConv * 100, 1) + '%');

  // Verify IEA & USGS baselines in FRONTIER match ch7.p4 & ft.est.nh3
  const iea = M.FRONTIER.find(x => x.id === 'ieaNh3');
  const usgs = M.FRONTIER.find(x => x.id === 'usgsN');
  says('ch7.p4', '1.85 亿吨');
  says('ch7.p4', iea.energyPct + '%');
  says('ch7.p4', iea.co2Pct + '%');
  says('ch7.p4', iea.bat + ' GJ/吨');
  says('ch7.p4', iea.val + ' GJ/吨');
  says('ch7.p4', '1.60 亿吨氮');
  check('ch7 USGS baseline == 160 Mt N', usgs.val === 160);

  const seen = new Set();
  for (const Tc of [250, 400, 450, 650]) {
    for (const P of [20, 200, 400]) {
      for (const tau of [0.2, 1, 5]) {
        const k = M.say.ch7(M.haberReactor(Tc, P, tau));
        seen.add(k);
        check(`ch7 say key defined: ${k}`, !!Z[k]);
      }
    }
  }
  for (const k of ['ch7.say.slow', 'ch7.say.kinetic', 'ch7.say.thermo', 'ch7.say.window']) {
    check(`ch7 branch reached: ${k}`, seen.has(k));
  }
}

/* ── Ch8: Regular Solution & Common Tangent ── */
{
  const rs = M.regularSolution(2 / 3, 0.5);
  check('ch8 w = 3.00 at T/Tc = 2/3', near(rs.w, 3, 1e-12));
  check('ch8 binodal has dg/dx == 0', near(M.regD1(rs.binodal[0], rs.w), 0, 1e-9));
  check('ch8 spinodal has d2g/dx2 == 0', near(M.regD2(rs.spinodal[0], rs.w), 0, 1e-9));
  check('ch8 lever rule conserves x0', near(rs.fracAlpha * rs.binodal[0] + rs.fracBeta * rs.binodal[1], 0.5, 1e-12));
  check('ch8 phase separation lowers free energy', rs.dGsaved > 0);
  check('ch8 T >= Tc gives single phase', !M.regularSolution(1.05, 0.5).twoPhase);

  says('ch8.p3', 'w = ' + f(rs.w, 2));
  says('ch8.p3', f(rs.binodal[0], 3));
  says('ch8.p3', f(rs.binodal[1], 3));
  says('ch8.p3', f(rs.spinodal[0], 3));
  says('ch8.p3', f(rs.spinodal[1], 3));
  says('ch8.p3', f(rs.dGsaved, 4) + ' RT');

  const seen = new Set();
  for (const ttc of [0.5, 0.67, 1.1]) {
    for (const x0 of [0.02, 0.12, 0.50, 0.96]) {
      const k = M.say.ch8(M.regularSolution(ttc, x0));
      seen.add(k);
      check(`ch8 say key defined: ${k}`, !!Z[k]);
    }
  }
  for (const k of ['ch8.say.mixed', 'ch8.say.outside', 'ch8.say.binodal', 'ch8.say.spinodal']) {
    check(`ch8 branch reached: ${k}`, seen.has(k));
  }
}

/* ── Ch9: Frontier Thermodynamic Floors & 2026 Records ── */
{
  const el = M.electrolyserMetrics();
  says('ch9.say.elec', f(el.V_rev, 3) + ' V');
  says('ch9.say.elec', f(el.kwh_dG, 1) + ' kWh/kg');
  says('ch9.say.elec', f(el.V_tn, 3) + ' V');
  says('ch9.say.elec', f(el.kwh_HHV, 1) + ' kWh/kg');
  says('ch9.say.elec', f(el.kwh_LHV, 1) + ' kWh/kg');

  const dAir = M.dacMinWork(420, false);
  const dFlue = M.dacMinWork(0.12, true);
  says('ch9.say.dac', f(dAir.w_GJ_t, 2) + ' GJ/t');
  says('ch9.say.dac', f(dFlue.w_GJ_t, 2) + ' GJ/t');
  says('ch9.say.dac', f(dAir.w_GJ_t / dFlue.w_GJ_t, 1) + ' 倍');
  says('ft.est.dac', f(dAir.w_kJ_mol, 1) + ' kJ/mol');
  says('ft.est.dac', f(dAir.w_GJ_t, 2) + ' GJ/t');

  const mam = M.FRONTIER.find(x => x.id === 'mammoth');
  says('ft.demo.mammoth', mam.h1_2025_t + ' 吨');
  says('ft.demo.mammoth', mam.h1_2026_t + ' 吨');
  const linrr = M.FRONTIER.find(x => x.id === 'liNrrFlow');
  says('ft.demo.linrr', linrr.hours + ' 小时');
  says('ft.demo.linrr', linrr.fe + ' ± 1%');

  const ee = M.co2rrEnergyEfficiency(1.15, 2.8, 65);
  check('ch9 co2rr efficiency == (1.15/2.8)*0.65', near(ee.ee, (1.15 / 2.8) * 0.65, 1e-12));

  for (const mode of ['elec', 'dac', 'co2rr']) {
    check(`ch9 say key defined: ${mode}`, !!Z[M.say.ch9(mode)]);
  }
  says('ch9.say.elec', '51–69%');
  says('ft.demo.elec', '51–69%');
  check('ch9.say.dacHigh defined', !!Z['ch9.say.dacHigh']);
}

console.log(`models.cjs: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
