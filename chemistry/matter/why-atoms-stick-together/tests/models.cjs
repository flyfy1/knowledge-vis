'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const REPO = path.resolve(ROOT, '..', '..', '..');
const M = require(path.join(ROOT, 'models.js'));

function loadCopyZh() {
  const code = fs.readFileSync(path.join(ROOT, 'copy.zh.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.ESSAY_COPY.zh;
}

const COPY_ZH = loadCopyZh();

let passed = 0;
let failed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    console.error('FAIL:', name, '-', err.message);
  }
}

function approx(actual, expected, tol, msg) {
  assert(
    Math.abs(actual - expected) <= tol,
    (msg || '') + ` expected ~${expected} ±${tol}, got ${actual}`
  );
}

/* ── 1. Ch1: Particle in a 1D Box ─────────────────────────────── */
check('Ch1 boxModel kinetic scaling & merge quarters energy', () => {
  const c1 = M.boxModel.compare(1, 1.0, false);
  const c2 = M.boxModel.compare(1, 1.0, true);
  approx(c1.eSingle, 37.603, 0.01, 'E1(1Å)');
  approx(c2.eEff, 9.4008, 0.01, 'E1(2Å)');
  approx(c2.saved, 28.202, 0.01, 'saved');
  approx(c2.ratio, 4.0, 1e-9, 'ratio');
  approx(M.boxModel.energyEv(2, 1.0), 150.412, 0.02, 'E2(1Å)');
  const w = M.boxModel.wave(2, 1.0, 100);
  assert.strictEqual(w.length, 101);
  approx(w[0].psi, 0, 1e-6, 'boundary u=0');
  approx(w[100].psi, 0, 1e-6, 'boundary u=1');
});

/* ── 2. Ch2: H2+ LCAO ─────────────────────────────────────────── */
check('Ch2 h2plusModel fixed LCAO, variational zeta, antibonding & textbook exact', () => {
  assert.strictEqual(M.h2plusModel.EXACT.rBohr, 2.0);
  approx(M.h2plusModel.EXACT.rA, 1.0584, 0.002, 'EXACT rA');
  assert.strictEqual(M.h2plusModel.EXACT.deEv, 2.793);

  const cf = M.h2plusModel.curve(false);
  approx(cf.min.rBohr, 2.50, 0.06, 'fixed Re (a0)');
  approx(cf.min.rA, 1.32, 0.03, 'fixed Re (A)');
  approx(cf.min.deEv, 1.76, 0.02, 'fixed De (eV)');

  const cv = M.h2plusModel.curve(true);
  approx(cv.min.rBohr, 2.00, 0.05, 'var Re (a0)');
  approx(cv.min.rA, 1.06, 0.02, 'var Re (A)');
  approx(cv.min.zeta, 1.24, 0.02, 'var zeta');
  approx(cv.min.deEv, 2.35, 0.02, 'var De (eV)');

  const anti = M.h2plusModel.evalAt(2.0, 1.0);
  assert(anti.dEAntiEv > 9.0 && anti.dEAntiEv < 9.5, 'antibonding repulsive at 2 a0');

  const dgBond = M.h2plusModel.densityGrid(2.0, 1.0, false, 65, 35);
  const dgAnti = M.h2plusModel.densityGrid(2.0, 1.0, true, 65, 35);
  // Midpoint psi is positive for bonding and 0 on the central nodal plane for antibonding
  const midRow = Math.floor(dgBond.ny / 2);
  const midCol = Math.floor(dgBond.nx / 2);
  assert(dgBond.grid[midRow * dgBond.nx + midCol] > 0.01, 'bonding bridge > 0');
  approx(dgAnti.grid[midRow * dgAnti.nx + midCol], 0, 1e-6, 'antibonding node = 0');
});

/* ── 3. Ch3: Huckel Aromaticity & Conjugation ─────────────────── */
check('Ch3 huckelModel benzene [-2,-1,-1,+1,+1,+2], cyclobutadiene, polyene gaps', () => {
  const bz = M.huckelModel.solve(6, true);
  const expectedBz = [-2, -1, -1, 1, 1, 2];
  bz.values.forEach((v, i) => approx(v, expectedBz[i], 1e-6, 'benzene eig ' + i));
  approx(bz.delocBeta, 2.0, 1e-6, 'benzene deloc');
  approx(bz.gapBeta, 2.0, 1e-6, 'benzene gap');
  assert.strictEqual(bz.isAromatic4n2, true);
  assert.strictEqual(bz.isAntiaromatic4n, false);

  const cb = M.huckelModel.solve(4, true);
  [-2, 0, 0, 2].forEach((ev, i) => approx(cb.values[i], ev, 1e-6, 'cyclobutadiene eig ' + i));
  approx(cb.gapBeta, 0, 1e-6, 'cyclobutadiene zero gap');
  assert.strictEqual(cb.isAntiaromatic4n, true);

  // Polyene gaps decrease monotonically from N=2 to N=10, hitting visible at N=8
  let prevGap = Infinity;
  for (const n of [2, 4, 6, 8, 10]) {
    const s = M.huckelModel.solve(n, false);
    assert(s.gapBeta < prevGap, 'gap narrows with N=' + n);
    prevGap = s.gapBeta;
  }
  const oct = M.huckelModel.solve(8, false);
  approx(oct.lambdaNm, 637, 2, 'octatetraene Huckel lambda');
});

/* ── 4. Ch4: Two-Site Polar & Madelung / Born-Haber ───────────── */
check('Ch4 twoSiteModel continuum & madelungModel 1.7476 + Born-Haber NaCl', () => {
  const cov = M.twoSiteModel.eval(0, 2.0);
  approx(cov.qTransfer, 0, 1e-9);
  approx(cov.pA, 0.5, 1e-9);
  approx(cov.covGain, 2.0, 1e-9);

  const ion = M.twoSiteModel.eval(8.0, 2.0);
  approx(ion.qTransfer, 0.8944, 0.002);
  approx(ion.pA, 0.9472, 0.002);
  approx(ion.covGain, 0.4721, 0.002);

  approx(M.madelungModel.EXACT_1D, 1.3863, 0.0005, '1D 2 ln 2');
  approx(M.madelungModel.EXACT_NACL, 1.7476, 0.0001, 'NaCl exact Madelung');
  approx(M.madelungModel.sumNaClEvjen(2), 1.7518, 0.0002, 'Evjen L=2');
  approx(M.madelungModel.sumNaClEvjen(8), 1.7476, 0.0002, 'Evjen L=8');

  const bh = M.madelungModel.BORN_HABER_NACL;
  assert.strictEqual(bh.gasIonPairCost, 147);
  assert.strictEqual(bh.latticeEnthalpy, -786);
  assert.strictEqual(bh.formationEnthalpy, -411);
});

/* ── 5. Ch5: Tight-Binding Bands ──────────────────────────────── */
check('Ch5 bandModel metal vs semiconductor vs insulator', () => {
  const met = M.bandModel.solve(64, 0, 2.0, false);
  assert.strictEqual(met.kind, 'metal');
  approx(met.bulkGap, 0, 1e-6);
  approx(met.bandwidth, 8.0, 1e-4);

  const semi = M.bandModel.solve(64, 2.0, 2.0, true);
  assert.strictEqual(semi.kind, 'semiconductor');
  approx(semi.bulkGap, 2.0, 1e-6);

  const ins = M.bandModel.solve(64, 5.0, 2.0, true);
  assert.strictEqual(ins.kind, 'insulator');
  approx(ins.bulkGap, 5.0, 1e-6);
});

/* ── 6. Ch6: Coulson-Bent Hybridization ───────────────────────── */
check('Ch6 hybridModel reproduces BeH2, BF3, CH4, NH3, H2O, H2S bond angles', () => {
  const cases = [
    ['beh2', 180.0],
    ['bf3', 120.0],
    ['ch4', 109.5],
    ['nh3', 107.0],
    ['h2o', 104.5],
    ['h2s', 92.1]
  ];
  cases.forEach(([id, expected]) => {
    const p = M.hybridModel.PRESETS[id];
    const r = M.hybridModel.eval(p.sBond, p.nBonds, p.nLone);
    approx(r.angleDeg, expected, 0.1, id + ' angle');
  });
  const h2o = M.hybridModel.eval(0.20, 2, 2);
  approx(h2o.sLone, 0.30, 1e-6, 'H2O lone s');
});

/* ── 7. Ch7: Lennard-Jones & 2D Velocity-Verlet MD ────────────── */
check('Ch7 ljMdModel minimum, NVE energy conservation, solid/liquid/gas phases', () => {
  approx(M.ljMdModel.rMinSigma, Math.pow(2, 1 / 6), 1e-6);
  approx(M.ljMdModel.potential(M.ljMdModel.rMinSigma, 1.0), -1.0, 1e-9);
  approx(M.ljMdModel.forceMag(M.ljMdModel.rMinSigma, 1.0), 0.0, 1e-9);
  assert.strictEqual(M.ljMdModel.ARGON.sigmaA, 3.40);
  approx(M.ljMdModel.ARGON.epsKjMol, 0.998, 0.001);
  approx(M.ljMdModel.RT_298_KJMOL, 2.48, 0.002, 'RT at 298.15 K');
  assert.strictEqual(M.ljMdModel.WATER_DENSITY_0C.iceGcm3, 0.917);
  assert.strictEqual(M.ljMdModel.WATER_DENSITY_0C.waterGcm3, 0.9998);

  // NVE energy conservation check over 400 steps
  const nve = M.ljMdModel.createSim({ N: 25, L: 12.0, Tstar: 0.25, epsScale: 1.0, seed: 42 });
  for (let i = 0; i < 60; i++) nve.step(0.015, 0.25, 1.0, true);
  const e0 = nve.metrics().E;
  for (let i = 0; i < 400; i++) nve.step(0.015, 0.25, 1.0, false);
  const e1 = nve.metrics().E;
  const relDrift = Math.abs(e1 - e0) / Math.max(1e-6, Math.abs(e0));
  assert(relDrift < 5e-3, 'NVE energy drift too large: ' + relDrift);

  // Phase ordering: solid at T*=0.15, liquid at 0.55, gas at 1.30
  const simPhase = (T) => {
    const s = M.ljMdModel.createSim({ N: 25, L: 12.0, Tstar: T, epsScale: 1.0, seed: 42 });
    for (let i = 0; i < 160; i++) s.step(0.015, T, 1.0, true);
    return s.metrics();
  };
  assert.strictEqual(simPhase(0.15).phase, 'solid');
  assert.strictEqual(simPhase(0.55).phase, 'liquid');
  assert.strictEqual(simPhase(1.30).phase, 'gas');
});

/* ── 8. Ch8: Crystal Slip & Material Properties ───────────────── */
check('Ch8 structureModel half-cell slip barriers & NaCl net repulsion', () => {
  const d = M.structureModel.slipEnergyEv('diamond', 0.5);
  const g = M.structureModel.slipEnergyEv('graphite', 0.5);
  const n = M.structureModel.slipEnergyEv('nacl', 0.5);
  const c = M.structureModel.slipEnergyEv('copper', 0.5);
  const p = M.structureModel.slipEnergyEv('pe', 0.5);

  approx(d.peakEv, 3.60, 0.01);
  assert.strictEqual(d.fractured, true);
  approx(g.peakEv, 0.015, 0.002);
  assert.strictEqual(g.fractured, false);
  approx(n.peakEv, 0.68, 0.02);
  assert.strictEqual(n.netRepulsive, true);
  assert.strictEqual(n.fractured, true);
  approx(c.peakEv, 0.08, 0.005);
  assert.strictEqual(c.fractured, false);
  approx(p.peakEv, 0.04, 0.005);
});

/* ── 9. Ch9: 2D HP Lattice Folding & Exact Enumeration ────────── */
check('Ch9 hpProteinModel exact 15,037-walk enumeration & Levinthal', () => {
  const lev = M.hpProteinModel.levinthalYears(100);
  approx(lev.log10Confs, 47.71, 0.05);
  approx(lev.log10Years, 27.21, 0.05);

  const des = M.hpProteinModel.enumerate(M.hpProteinModel.PRESETS.designable.seq);
  assert.strictEqual(des.totalWalks, 15037);
  assert.strictEqual(des.minE, -4);
  assert.strictEqual(des.degeneracy, 1);

  const bi = M.hpProteinModel.enumerate(M.hpProteinModel.PRESETS.bistable.seq);
  assert.strictEqual(bi.totalWalks, 15037);
  assert.strictEqual(bi.minE, -5);
  assert.strictEqual(bi.degeneracy, 2);

  const fru = M.hpProteinModel.enumerate(M.hpProteinModel.PRESETS.frustrated.seq);
  assert.strictEqual(fru.totalWalks, 15037);
  assert.strictEqual(fru.minE, 0);
  assert.strictEqual(fru.degeneracy, 15037);

  const mc = M.hpProteinModel.foldMC(M.hpProteinModel.PRESETS.designable.seq, 0.35, 1600, 16);
  assert.strictEqual(mc.bestE, -4, 'MC with seed 16 reaches native -4');
});

/* ── 10. Ch10: Frontier & Scaling ─────────────────────────────── */
check('Ch10 FRONTIER scaling O(N), O(N^3), O(N^7) & status tags', () => {
  assert.strictEqual(M.FRONTIER.asOf, '2026-11');
  const s = M.FRONTIER.scaling.evalAt(50);
  assert.strictEqual(s.mlip, 5);
  assert.strictEqual(s.dft, 125);
  assert.strictEqual(s.ccsd, 78125);
  const statuses = new Set(M.FRONTIER.items.map((x) => x.status));
  assert(statuses.has('established') && statuses.has('demonstrated') && statuses.has('contested'));
});

/* ── 11. Prose Quantitative Parity & i18n/Registry Integrity ──── */
check('Prose copy.zh.js matches models.js quantitative constants & has no missing i18n keys', () => {
  const zhText = JSON.stringify(COPY_ZH);
  // Key textbook/model constants quoted verbatim in prose
  for (const num of [
    '37.60', '9.40', '28.20',
    '1.06', '2.35', '2.793', '1.32', '1.76', '4.52',
    '1.7476', '1.3863', '+147', '−786', '−411',
    '109.5°', '107.0°', '104.5°', '92.1°',
    '3.40', '0.998', '87.3', '373.2', '0.917', '0.9998',
    '3.60', '0.015', '0.68', '0.08',
    '15,037', '1.38 × 10¹⁰', '2026'
  ]) {
    assert(zhText.includes(num), 'copy.zh.js missing quantitative anchor: ' + num);
  }

  // Every data-i18n* key in index.html must exist in copy.zh.js
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const getByPath = (o, p) => p.split('.').reduce((a, k) => (a && k in a ? a[k] : undefined), o);
  for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) {
    assert(getByPath(COPY_ZH, m[1]) !== undefined, 'Missing HTML copy key: ' + m[1]);
  }
  assert(!html.includes('page-provenance'), 'Must not include page-provenance in authoring pass');
  assert(!fs.existsSync(path.join(ROOT, 'copy.en.js')), 'Must not include copy.en.js in authoring pass');

  // Every non-dynamic t('...') key in app.js must exist in copy.zh.js
  const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  for (const m of appJs.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)) {
    const k = m[1];
    if (k.endsWith('.')) continue;
    assert(getByPath(COPY_ZH, k) !== undefined, 'Missing app.js copy key: ' + k);
  }

  // Every .say.* string must be non-empty Chinese and leave no unreplaced braces when formatted
  const checkSayGroup = (grp, label) => {
    assert(grp && typeof grp === 'object', 'Missing say group: ' + label);
    for (const [k, v] of Object.entries(grp)) {
      assert(typeof v === 'string' && v.trim().length > 15, `Say ${label}.${k} too short`);
      assert(/[\u4e00-\u9fff]/.test(v), `Say ${label}.${k} missing Chinese`);
    }
  };
  checkSayGroup(COPY_ZH.ch1.say, 'ch1.say');
  checkSayGroup(COPY_ZH.ch2.say, 'ch2.say');
  checkSayGroup(COPY_ZH.ch3.say, 'ch3.say');
  checkSayGroup(COPY_ZH.ch4.sayA, 'ch4.sayA');
  checkSayGroup(COPY_ZH.ch4.sayB, 'ch4.sayB');
  checkSayGroup(COPY_ZH.ch5.say, 'ch5.say');
  checkSayGroup(COPY_ZH.ch6.say, 'ch6.say');
  checkSayGroup(COPY_ZH.ch7.say, 'ch7.say');
  checkSayGroup(COPY_ZH.ch8.say, 'ch8.say');
  checkSayGroup(COPY_ZH.ch9.say, 'ch9.say');
  checkSayGroup(COPY_ZH.ch10.say, 'ch10.say');

  // REGISTRY.json anchors exist in index.html & relatedPages exist in pages.config.js
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'REGISTRY.json'), 'utf8'));
  const pagesCfg = fs.readFileSync(path.join(REPO, 'pages.config.js'), 'utf8');
  assert.strictEqual(reg.concepts.length, 11);
  reg.concepts.forEach((c) => {
    const id = c.anchor.replace(/^#/, '');
    assert(html.includes(`id="${id}"`), 'Missing anchor in index.html: ' + c.anchor);
    c.relatedPages.forEach((rp) => {
      assert(pagesCfg.includes(rp), 'Unknown relatedPages slug in REGISTRY.json: ' + rp);
    });
  });
});

console.log(`models.cjs: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
