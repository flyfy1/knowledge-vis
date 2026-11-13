'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DIR = path.resolve(__dirname, '..');
const D = require('../data.js');
const M = require('../models.js');

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    console.error('FAIL:', name, '-', err && err.message ? err.message : err);
  }
}

function near(a, b, tol, label) {
  assert(
    Number.isFinite(a) && Math.abs(a - b) <= tol,
    `${label || 'value'}: got ${a}, expected ${b} ± ${tol}`
  );
}

/* ── 1. Data & provenance sanity ── */
check('data.js shapes and US 2026 latest snapshot', () => {
  assert(D && D.usLatest && D.revisions && D.beveridge && D.okun && D.sahm && D.gapSeries && D.solow);
  assert(D.beveridge.length >= 100);
  assert(D.okun.length > 250);
  assert(D.sahm.u.length > 750 && D.sahm.rec.length === D.sahm.u.length);
  assert(D.solow.length >= 60);
  near(D.usLatest.cpiYY, 4.08, 0.01, 'CPI YoY 2026-10');
  near(D.usLatest.coreCpiYY, 2.87, 0.01, 'Core CPI YoY 2026-10');
  near(D.usLatest.pceYY, 3.65, 0.01, 'PCE YoY 2026-09');
  near(D.usLatest.corePceYoY || D.usLatest.corePceYY, 3.12, 0.01, 'Core PCE YoY 2026-09');
  near(D.usLatest.u3, 4.1, 0.05, 'UNRATE 2026-10');
  near(D.usLatest.u6, 7.9, 0.05, 'U6 2026-10');
  near(D.usLatest.lfpr, 61.9, 0.05, 'LFPR 2026-10');
  near(D.usLatest.prodYY, 2.06, 0.02, 'OPHNFB YoY 2026-Q3');
  near(D.usLatest.gdpQQSAAR, 3.37, 0.02, 'GDPC1 Q3 SAAR');
});

/* ── 2. Chapter 1: GDP Three Ways ── */
check('ch1 default: gross=205, doubleCount=85, three-way GDP=120, depr=12, NDP=108, home=30', () => {
  const r = M.gdp3.compute();
  assert.strictEqual(r.grossOutput, 205);
  assert.strictEqual(r.doubleCount, 85);
  assert.strictEqual(r.gdpProd, 120);
  assert.strictEqual(r.gdpExp, 120);
  assert.strictEqual(r.gdpInc, 120);
  assert.strictEqual(r.depr, 12);
  assert.strictEqual(r.ndp, 108);
  assert.strictEqual(r.unpaidHome, 30);
  assert.strictEqual(r.totalBreadConsumed, 130);
});

check('ch1 wheat=40: gross=215, vaMill=15, GDP stays 120', () => {
  const r = M.gdp3.compute({ wheat: 40 });
  assert.strictEqual(r.grossOutput, 215);
  assert.strictEqual(r.vaMill, 15);
  assert.strictEqual(r.vaFarm, 40);
  assert.strictEqual(r.gdpProd, 120);
  assert.strictEqual(r.gdpExp, 120);
  assert.strictEqual(r.gdpInc, 120);
});

check('ch1 imports=25: C=125, NX=-25, GDP stays 120', () => {
  const r = M.gdp3.compute({ imports: 25 });
  assert.strictEqual(r.C, 125);
  assert.strictEqual(r.NX, -25);
  assert.strictEqual(r.gdpExp, 120);
  assert.strictEqual(r.gdpProd, 120);
  assert.strictEqual(r.gdpInc, 120);
});

check('ch1 homeShift=20: totalBread=130 unchanged, GDP jumps 120->140', () => {
  const r = M.gdp3.compute({ homeShift: 20 });
  assert.strictEqual(r.totalBreadConsumed, 130);
  assert.strictEqual(r.unpaidHome, 10);
  assert.strictEqual(r.gdpProd, 140);
  assert.strictEqual(r.gdpExp, 140);
  assert.strictEqual(r.gdpInc, 140);
});

/* ── 3. Chapter 2: Price Indexes & Substitution Bias ── */
check('ch2 default (techDrop=25, svcRise=6, sigma=1.5) prose pins', () => {
  const r = M.indexes.compute();
  near(r.realGrowthNom, 1.7, 0.06, 'nomG');
  near(r.pL2, 101.1, 0.06, 'pL2');
  near(r.pP2, 89.1, 0.06, 'pP2');
  near(r.pF2, 95.0, 0.06, 'pF2');
  near(r.pChain2, 95.6, 0.06, 'pChain2');
  near(r.realGrowthL, 0.6, 0.06, 'realGrowthL');
  near(r.realGrowthF, 6.3, 0.06, 'realGrowthF');
  near(r.realGrowthTrue, 6.1, 0.06, 'realGrowthTrue');
  near(r.subBiasPP, 6.2, 0.06, 'subBiasPP');
});

check('ch2 sigma=0 collapses L=P=F=chain to 101.14 and bias=0', () => {
  const r = M.indexes.compute({ sigma: 0 });
  near(r.pL2, 101.14, 0.02, 'pL2 sigma=0');
  near(r.pP2, 101.14, 0.02, 'pP2 sigma=0');
  near(r.pF2, 101.14, 0.02, 'pF2 sigma=0');
  near(r.pChain2, 101.14, 0.02, 'pChain2 sigma=0');
  near(r.subBiasPP, 0, 0.01, 'subBiasPP sigma=0');
});

check('ch2 importShare widens gap between CPI (fixed) and domestic deflator (excludes imports)', () => {
  const r0 = M.indexes.compute({ importShare: 0 });
  const r100 = M.indexes.compute({ importShare: 1 });
  near(r0.defY2, r0.pP2, 0.01, 'import=0 domestic deflator equals Paasche');
  assert(r100.defY2 > r100.cpiY2 + 10, 'import=100 pushes domestic deflator well above CPI');
});

/* ── 4. Chapter 3: CPI in Practice ── */
check('ch3 default & toggles & commuter stress prose pins', () => {
  const base = M.cpi.compute();
  near(base.offHeadline, 2.40, 0.01, 'default headline');
  near(base.offCore, 1.44, 0.01, 'default core');
  near(base.personal, 2.40, 0.01, 'default personal');
  near(base.gapPersonal, 0, 0.01, 'default gap');

  const noHed = M.cpi.compute({ hedonic: false });
  near(noHed.offHeadline, 3.96, 0.01, 'no hedonic headline');
  near(noHed.hedonicDiffPP, 1.56, 0.01, 'hedonic diff added when off');

  const noOer = M.cpi.compute({ oerOn: false });
  near(noOer.offHeadline, 1.92, 0.01, 'no OER headline');
  near(noOer.oerDiffPP, 0.48, 0.01, 'OER diff');

  const commuter = M.cpi.compute({ wShelter: 45, wEnergy: 15, energyShock: 30 });
  near(commuter.offCore, 1.44, 0.01, 'commuter core unchanged');
  near(commuter.offHeadline, 3.66, 0.01, 'commuter headline');
  near(commuter.personal, 6.58, 0.01, 'commuter personal');
  near(commuter.gapPersonal, 2.92, 0.01, 'commuter gap');
});

/* ── 5. Chapter 4: Growth-Rate Traps ── */
check('ch4 base effects prose pins (steady=2.02, qShock=-15.07 / -2.55, qEcho=+3.54)', () => {
  const r = M.growthTraps.baseEffects();
  near(r.steadySAAR, 2.02, 0.01, 'steadySAAR');
  near(r.qShock.qqSAAR, -15.07, 0.02, 'qShock SAAR');
  near(r.qShock.yy, -2.55, 0.02, 'qShock YoY');
  near(r.qEcho.yy, 3.54, 0.02, 'qEcho YoY');
  near(r.qEcho.qqSAAR, 2.02, 0.01, 'qEcho SAAR');
});

check('ch4 seasonal 2x4 MA prose pins (-36.66 NSA vs +2.42 SA) + Q4->Q3 shift', () => {
  const r = M.growthTraps.seasonal();
  near(r.y4q1NsaQQ, -36.66, 0.03, 'y4q1 NSA SAAR');
  near(r.y4q1SaQQ, 2.42, 0.03, 'y4q1 SA SAAR');

  const shifted = M.growthTraps.seasonal({ shiftQ4: 4 });
  assert(shifted.y5q4SaQQ < 0, 'Q4->Q3 spending shift pulls SA Q4 negative');
});

check('ch4 ALFRED revisions & BEA mean absolute revisions', () => {
  const rev = M.growthTraps.vintages();
  near(rev.episodes['2008Q4'][0].val, -3.80, 0.01, '2008Q4 adv');
  near(rev.episodes['2008Q4'][1].val, -6.34, 0.01, '2008Q4 third');
  near(rev.episodes['2008Q4'][2].val, -8.89, 0.01, '2008Q4 2011');
  near(rev.episodes['2008Q4'][3].val, -8.47, 0.01, '2008Q4 latest');
  near(rev.episodes['2020Q2'][0].val, -32.90, 0.05, '2020Q2 adv');
  near(rev.episodes['2020Q2'][3].val, -27.98, 0.05, '2020Q2 latest');
  near(rev.episodes['2022Q1_Q2'][0].q1, -1.57, 0.01, '2022Q1 2022-08');
  near(rev.episodes['2022Q1_Q2'][0].q2, -0.93, 0.01, '2022Q2 2022-08');
  near(rev.episodes['2022Q1_Q2'][2].q2, 0.56, 0.01, '2022Q2 latest');
  assert.strictEqual(rev.beaMeanAbs.second, 0.5);
  assert.strictEqual(rev.beaMeanAbs.third, 0.6);
  assert.strictEqual(rev.beaMeanAbs.latest, 1.3);
});

/* ── 6. Chapter 5: Balassa-Samuelson PPP & Lorenz/Gini ── */
check('ch5 IMF 2026 WEO & Balassa-Samuelson PPP prose pins', () => {
  const us = M.compare.IMF2026.find(x => x.code === 'US');
  const cn = M.compare.IMF2026.find(x => x.code === 'CN');
  const ind = M.compare.IMF2026.find(x => x.code === 'IN');
  near(us.nomT, 32.64, 0.01, 'US nomT');
  near(cn.nomT, 21.55, 0.01, 'CN nomT');
  near(cn.pppT, 44.55, 0.01, 'CN pppT');
  near(ind.nomT, 4.06, 0.01, 'IN nomT');
  near(ind.pppT, 19.19, 0.01, 'IN pppT');

  const r = M.compare.ppp();
  near(r.pN, 0.583, 0.005, 'pN');
  near(r.priceLevel, 0.70, 0.01, 'P');
  near(r.gdpFX, 35.0, 0.1, 'gdpFX');
  near(r.gdpPPP, 49.7, 0.2, 'gdpPPP');
  near(r.pppBoost, 1.42, 0.01, 'pppBoost');
});

check('ch5 Lorenz mean vs median & Gini prose pins', () => {
  const skew = M.compare.lorenz({ topShare: 35, growth: 20, topHeavy: true });
  near(skew.before.gini, 0.446, 0.002, 'Gini before');
  near(skew.meanPct, 20.0, 0.05, 'meanPct');
  near(skew.medianPct, 4.2, 0.1, 'medianPct');
  near(skew.after.gini, 0.498, 0.002, 'Gini after skew');

  const even = M.compare.lorenz({ topShare: 35, growth: 20, topHeavy: false });
  near(even.medianPct, 20.0, 0.05, 'even medianPct');
  near(even.after.gini, even.before.gini, 0.0001, 'even Gini unchanged');
});

/* ── 7. Chapter 6: Labour Market (U-3/U-6, Beveridge, Okun) ── */
check('ch6 U-3/U-6 defs prose pins', () => {
  const base = M.labour.defs();
  near(base.u3, 4.04, 0.02, 'base U-3');
  near(base.u6, 7.92, 0.02, 'base U-6');
  near(base.lfpr, 61.90, 0.02, 'base LFPR');
  near(base.epop, 59.40, 0.02, 'base E/Pop');

  const disc10 = M.labour.defs({ discouraged: 10 });
  near(disc10.epop, 59.40, 0.01, 'disc=10 E/Pop unchanged');
  near(disc10.u3, 2.46, 0.02, 'disc=10 U-3 drops');
  near(disc10.lfpr, 60.90, 0.02, 'disc=10 LFPR drops');

  const pt24 = M.labour.defs({ partTime: 24 });
  near(pt24.u3, 4.04, 0.01, 'pt=24 U-3 unchanged');
  near(pt24.u6, 11.73, 0.02, 'pt=24 U-6 surges');
});

check('ch6 Beveridge & Okun OLS era prose pins', () => {
  const bev = M.labour.beveridge();
  const pt22 = bev.data.find(r => r[0] === '2022-03');
  const pt26 = bev.data[bev.data.length - 1];
  near(pt22[1], 3.7, 0.05, '2022-03 U');
  near(pt22[2], 7.5, 0.05, '2022-03 V');
  assert.strictEqual(pt26[0], '2026-09');
  near(pt26[1], 4.2, 0.05, '2026-09 U');
  near(pt26[2], 4.5, 0.05, '2026-09 V');

  const pre = M.labour.okun({ era: 'pre' });
  assert.strictEqual(pre.n, 240);
  near(pre.slope, -0.36, 0.01, 'Okun 1960-2019 slope');
  near(pre.r2, 0.59, 0.01, 'Okun 1960-2019 R2');

  const gfc = M.labour.okun({ era: 'gfc' });
  assert.strictEqual(gfc.n, 48);
  near(gfc.slope, -0.64, 0.01, 'Okun 2008-2019 slope');
  near(gfc.r2, 0.74, 0.01, 'Okun 2008-2019 R2');

  const post = M.labour.okun({ era: 'post' });
  assert.strictEqual(post.n, 26);
  near(post.slope, -0.85, 0.01, 'Okun 2020-2026 slope');
});

/* ── 8. Chapter 7: Sahm Rule & CBO Potential Output Gap ── */
check('ch7 Sahm rule triggers & 2024 realtime pins', () => {
  const s = M.cycle.sahm({ thresh: 0.50 });
  assert.strictEqual(s.triggers.length, 11);
  assert.strictEqual(s.triggers.filter(t => t.inRec).length, 9);
  assert.strictEqual(s.falsePositives.length, 2);
  assert.strictEqual(s.falsePositives[0].date, '2003-07');
  assert.strictEqual(s.falsePositives[1].date, '2024-07');
  assert.strictEqual(s.latest.date, '2026-10');
  near(s.latest.sahm, 0, 0.01, '2026-10 latest Sahm');
  near(s.realtime2024['2024-07'], 0.53, 0.005, '2024-07 realtime');
  near(s.realtime2024['2024-08'], 0.57, 0.005, '2024-08 realtime');
});

check('ch7 CBO potential output revision prose pins (2017$ rebased)', () => {
  const g = M.cycle.gap();
  near(g.q19.pot26, 20722.8, 0.5, '2019Q4 pot26');
  near(g.q19.pot19Raw, 19064.1, 0.5, '2019Q4 pot19 raw 2012$');
  near(g.q19.pot19, 19064.1 * 1.07944, 1.0, '2019Q4 pot19 rebased 2017$');
  near(g.latest.gap26, 1.70, 0.05, '2026Q3 gap26');
  near(g.latest.gap19, 4.92, 0.05, '2026Q3 gap19 rebased');
  const pt25 = g.pts.find(r => r.q === '2025Q4');
  near(pt25.pot19Raw, 21446.3, 0.5, '2025Q4 pot19 raw 2012$');
  near(pt25.pot26, 23811.2, 0.5, '2025Q4 pot26');
});

/* ── 9. Chapter 8: Solow Growth Accounting ── */
check('ch8 Solow growth accounting 1995-2005 & 2005-2019 prose pins', () => {
  const p3 = M.solow.compute({ y0: 1995, y1: 2005, adjustHC: true });
  near(p3.gY, 3.37, 0.02, '1995-2005 gY');
  near(p3.rawTFP, 1.67, 0.02, '1995-2005 rawTFP');
  near(p3.hcContrib, 0.50, 0.02, '1995-2005 hcContrib');
  near(p3.pwtTFP, 1.17, 0.02, '1995-2005 pwtTFP');

  const p4 = M.solow.compute({ y0: 2005, y1: 2019, adjustHC: true });
  near(p4.gY, 1.85, 0.02, '2005-2019 gY');
  near(p4.rawTFP, 0.75, 0.02, '2005-2019 rawTFP');
  near(p4.pwtTFP, 0.26, 0.02, '2005-2019 pwtTFP');

  const aLow = M.solow.compute({ y0: 1995, y1: 2005, alphaMode: 'manual', alpha: 0.30, adjustHC: false });
  const aHigh = M.solow.compute({ y0: 1995, y1: 2005, alphaMode: 'manual', alpha: 0.50, adjustHC: false });
  assert(Math.abs(aLow.tfpShown - aHigh.tfpShown) > 0.2, 'alpha changes TFP residual');

  const aManHC = M.solow.compute({ y0: 1995, y1: 2005, alphaMode: 'manual', alpha: 0.50, adjustHC: true });
  near(aManHC.hcContrib, p3.hcContrib, 0.001, 'HC contribution preserved under manual alpha');
  near(aManHC.capContrib + aManHC.labContrib + aManHC.hcContrib + aManHC.tfpShown, aManHC.gY, 0.001, 'Solow identity holds with manual alpha + HC');
});

/* ── 10. Chapter 9: Beyond GDP & Disaster Paradox ── */
check('ch9 Beyond GDP prose pins (home=23, disaster=15 -> gdp=112, wealth=-3, adj=106)', () => {
  const base = M.beyond.compute();
  assert.strictEqual(base.gdp, 100);
  assert.strictEqual(base.unpaidHome, 23);
  assert.strictEqual(base.totalServices, 123);

  const mkt = M.beyond.compute({ marketize: 23 });
  assert.strictEqual(mkt.gdp, 123);
  assert.strictEqual(mkt.totalServices, 123);

  const dis = M.beyond.compute({ disaster: 15, showDepr: true });
  near(dis.rebuild, 12, 0.01, 'rebuild 0.8*15');
  near(dis.gdp, 112, 0.01, 'disaster GDP');
  near(dis.netWealthDelta, -3, 0.01, 'disaster netWealthDelta');
  near(dis.adjusted, 106, 0.01, 'disaster adjusted NDP');
});

/* ── 11. Chapter 10: Frontier & Cross-Country Figures ── */
check('ch10 survey non-response error & FRONTIER table pins', () => {
  const svHigh = M.frontierModel.surveyError({ respRate: 65 });
  const svLow = M.frontierModel.surveyError({ respRate: 33 });
  assert(svLow.rmse > svHigh.rmse * 1.5, 'low response rate inflates RMSE');
  near(svLow.rmse, Math.hypot(svLow.se, svLow.bias), 1e-6, 'RMSE = sqrt(SE^2 + Bias^2)');

  assert.strictEqual(M.FRONTIER.economies.length, 5);
  near(M.FRONTIER.economies[1].infl, 0.7, 0.05, 'China CPI Oct 2026');
  near(M.FRONTIER.economies[2].infl, 4.0, 0.05, 'Euro area HICP Oct 2026');
  near(M.FRONTIER.economies[4].infl, 6.09, 0.05, 'India CPI Oct 2026');
  assert.strictEqual(M.FRONTIER.sna2025Date, '2025-03');
});

/* ── 12. CJK separation, copy parity & .say branch coverage ── */
check('Zero CJK outside copy.zh.js (except intentional HTML head metadata & 中 button)', () => {
  const cjk = /[\u4e00-\u9fff]/;
  for (const f of ['app.js', 'models.js', 'data.js']) {
    const txt = fs.readFileSync(path.join(DIR, f), 'utf8');
    assert(!cjk.test(txt), `Unexpected CJK character in ${f}`);
  }
  const htmlLines = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8').split('\n');
  htmlLines.forEach((line, i) => {
    if (!cjk.test(line)) return;
    const ok = line.includes('<title>') || line.includes('name="description"') || line.includes('data-lang="zh"');
    assert(ok, `Unexpected CJK in index.html line ${i + 1}: ${line.trim()}`);
  });
});

check('Every data-i18n and t(...) key exists in copy.zh.js and copy.en.js with identical keys & placeholders', () => {
  global.window = {};
  require('../copy.zh.js');
  require('../copy.en.js');
  const zh = global.window.ESSAY_COPY.zh;
  const en = global.window.ESSAY_COPY.en;
  assert.deepStrictEqual(Object.keys(zh).sort(), Object.keys(en).sort(), 'copy.zh.js and copy.en.js key parity');
  for (const k of Object.keys(zh)) {
    const zp = (zh[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort();
    const ep = (en[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort();
    assert.deepStrictEqual(zp, ep, `Placeholder mismatch in ${k}`);
  }
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

  const htmlKeys = [...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]);
  for (const k of htmlKeys) {
    assert(k in zh, `Missing copy.zh.js key referenced in index.html: ${k}`);
  }

  // Literal t('...') keys in app.js (excluding prefix concatenations like 'ch2.cv.y' + v)
  const appKeys = [...app.matchAll(/\bt\(\s*'([^']+)'(?!\s*\+)/g)].map(m => m[1]);
  for (const k of appKeys) {
    assert(k in zh, `Missing copy.zh.js key referenced in app.js: ${k}`);
  }
  // Check dynamic keys used in app.js
  for (const k of ['ch2.cv.y0', 'ch2.cv.y1', 'ch2.cv.y2', 'ch6.era.all', 'ch6.era.pre', 'ch6.era.gfc', 'ch6.era.post']) {
    assert(k in zh, `Missing dynamic key in copy.zh.js: ${k}`);
  }
});

check('All .say templates in copy.zh.js render cleanly without unreplaced placeholders', () => {
  const zh = global.window.ESSAY_COPY.zh;
  const sayKeys = Object.keys(zh).filter(k => k.includes('.say.'));
  assert(sayKeys.length >= 24, `Expected >=24 .say keys, got ${sayKeys.length}`);
  for (const k of sayKeys) {
    const s = zh[k];
    const emOpen = (s.match(/<em>/g) || []).length;
    const emClose = (s.match(/<\/em>/g) || []).length;
    assert.strictEqual(emOpen, emClose, `Unbalanced <em> in ${k}`);
    assert(!/undefined|NaN/.test(s), `Suspicious token in ${k}`);
  }
});

console.log(`\nmodels.cjs: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
