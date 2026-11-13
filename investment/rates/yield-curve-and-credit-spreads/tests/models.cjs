'use strict';

/**
 * Node verification suite for investment/rates/yield-curve-and-credit-spreads/
 * Checks:
 *  1) Mathematical & accounting identities across all 8 models in models.js;
 *  2) Every number stated in copy.zh.js and copy.en.js prose is computed & pinned from models.js;
 *  3) Every live .say template branch is reachable with all placeholders filled;
 *  4) 100% key, placeholder, HTML tag, and href parity between copy.zh.js and copy.en.js;
 *  5) Zero unintended CJK in copy.en.js, app.js, models.js, and index.html body (except the 中 toggle);
 *  6) REGISTRY.json anchors and title/desc match index.html and copy.*.js.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DIR = path.resolve(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));

global.window = {};
require(path.join(DIR, 'copy.zh.js'));
require(path.join(DIR, 'copy.en.js'));
const ZH = global.window.ESSAY_COPY.zh;
const EN = global.window.ESSAY_COPY.en;

let checks = 0;
function check(cond, msg) {
  checks++;
  assert(cond, msg);
}
function close(a, b, tol, msg) {
  checks++;
  assert(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b} (tol ${tol})`);
}

/* ── 1. Model Identities ── */

// Ch1: bootstrapping reprices every annual par bond back to 100
for (const [name, ys] of Object.entries(M.boot.presets)) {
  const b = M.boot.bootstrap(ys, 30);
  for (let n = 1; n <= 30; n++) {
    close(M.boot.reprice(b, n), 100, 1e-10, `ch1 ${name} reprice n=${n}`);
  }
}

// Ch2: expectations average matches numerical midpoint integral
for (const [name, p] of Object.entries(M.eh.presets)) {
  const N = 10, steps = 2000, dt = N / steps;
  let numSum = 0;
  for (let i = 0; i < steps; i++) numSum += M.eh.expShort(p, (i + 0.5) * dt) * dt;
  close(M.eh.avgExp(p, N), numSum / N, 1e-4, `ch2 ${name} avgExp integral`);
}

// Ch3: modified duration and convexity match finite differences; positive convexity gain
for (const T of [2, 5, 10, 30]) {
  const y0 = 4.5, c = 4.0, eps = 1e-4;
  const p0 = M.dur.price(c, T, y0);
  const pUp = M.dur.price(c, T, y0 + eps * 100);
  const pDn = M.dur.price(c, T, y0 - eps * 100);
  const fdDur = -(pUp - pDn) / (2 * eps * p0);
  const fdConv = (pUp - 2 * p0 + pDn) / (eps * eps * p0);
  close(M.dur.modified(c, T, y0), fdDur, 1e-3, `ch3 T=${T} modified duration`);
  close(M.dur.convexity(c, T, y0), fdConv, 1e-2, `ch3 T=${T} convexity`);
  for (const dy of [-2, -1, 1, 2]) {
    const a = M.dur.analyze(c, T, y0, dy);
    check(a.convexityGainPct > 0, `ch3 T=${T} dy=${dy} positive convexity cushion`);
  }
}

// Ch4: historical inversion record & Estrella-Trubin probit
const rec12 = M.inv.record(12);
check(rec12.months === 802, 'ch4 802 months');
check(rec12.totalRecessions === 8, 'ch4 8 recessions since 1970');
check(rec12.calledCount === 7, 'ch4 7 called at 12m lead');
check(rec12.missed.includes('1990-08'), 'ch4 missed 1990-08');
check(rec12.episodeCount === 10, 'ch4 10 merged episodes');
check(rec12.falseAlarmCount === 2, 'ch4 2 false alarms at 12m');
close(M.inv.probit(0), 100 * M.Phi(-0.6045), 1e-8, 'ch4 probit at 0');

// Ch5: breakeven default wipes out net spread premium identically
for (const p of Object.values(M.cred.presets)) {
  const base = M.cred.compute(p);
  const beRes = M.cred.compute({ ...p, defaultPct: base.breakevenPct });
  close(beRes.netPremiumPct, 0, 1e-10, 'ch5 breakeven net premium == 0');
}

// Ch6: Merton equity + debt = V = 100 and spread rises with leverage & volatility
const mLow = M.merton.compute({ leveragePct: 30, sigmaVPct: 25, T: 5, rfPct: 4.8 });
const mMid = M.merton.compute({ leveragePct: 60, sigmaVPct: 25, T: 5, rfPct: 4.8 });
const mHigh = M.merton.compute({ leveragePct: 80, sigmaVPct: 25, T: 5, rfPct: 4.8 });
close(mMid.equity + mMid.debt, 100, 1e-10, 'ch6 E + D = V');
close(mMid.debt + mMid.putVal, mMid.discF, 1e-10, 'ch6 D + Put = PV(F)');
check(mLow.spreadBp < mMid.spreadBp && mMid.spreadBp < mHigh.spreadBp, 'ch6 spread strictly increases with leverage');
check(mLow.ddQ > mMid.ddQ && mMid.ddQ > mHigh.ddQ, 'ch6 DD strictly decreases with leverage');

// Ch7: exact Fisher identity
const tNov = M.tips.compute({ rRealPct: M.frontier.tips10, expInflPct: M.frontier.breakeven10, irpNetPct: 0, tier: 'ig', actualInflPct: 3.5, horizon: 10 });
close(1 + tNov.yNomPct / 100, (1 + M.frontier.tips10 / 100) * (1 + M.frontier.breakeven10 / 100), 1e-12, 'ch7 Fisher product');

/* ── 2. Pin Every Number in Copy Prose Directly From models.js ── */
function pinProse(dict, label) {
  // Ch1
  const b26 = M.boot.bootstrap(M.boot.presets.nov2026);
  const b23 = M.boot.bootstrap(M.boot.presets.inv2023);
  for (const val of [
    M.boot.presets.nov2026[5].toFixed(2),
    b26.spot[0].toFixed(2),
    b26.spot[9].toFixed(2),
    b26.fwd[9].toFixed(2),
    b26.df[29].toFixed(3),
    b23.spot[0].toFixed(2),
    b23.spot[9].toFixed(2),
    b23.fwd[9].toFixed(2)
  ]) {
    check((dict['ch1.p1'] + dict['ch1.p3']).includes(val), `${label} ch1 prose pins ${val}`);
  }

  // Ch2
  const ehNorm = M.eh.summary(M.eh.presets.normal);
  const ehInv = M.eh.summary(M.eh.presets.inverted);
  for (const val of [
    ehNorm.y2.toFixed(2), ehNorm.y10.toFixed(2), ehNorm.s10y2y.toFixed(2), ehNorm.expSlope10y2y.toFixed(2),
    ehInv.y10.toFixed(2), ehInv.s10y2y.toFixed(2).replace('-', '−'),
    M.frontier.tp10.toFixed(2)
  ]) {
    check((dict['ch2.p3'] + dict['ch2.see']).includes(val), `${label} ch2 prose pins ${val}`);
  }

  // Ch3
  const d10 = M.dur.analyze(4.0, 10, 4.5, 2.0);
  const d30 = M.dur.analyze(4.0, 30, 4.5, 2.0);
  const d30dn = M.dur.analyze(4.0, 30, 4.5, -2.0);
  for (const val of [
    d10.dMod.toFixed(2), d10.conv.toFixed(1), d10.exactPct.toFixed(2).replace('-', '−'), d10.durPct.toFixed(2).replace('-', '−'),
    d30.dMod.toFixed(2), d30.conv.toFixed(1), d30.durPct.toFixed(2).replace('-', '−'), d30.exactPct.toFixed(2).replace('-', '−'), d30.convexityGainPct.toFixed(2),
    d30dn.exactPct.toFixed(2), d30dn.convexityGainPct.toFixed(2)
  ]) {
    check(dict['ch3.p3'].includes(val), `${label} ch3 prose pins ${val}`);
  }

  // Ch4
  for (const val of [
    M.inv.probit(0).toFixed(1),
    M.inv.probit(-1.0).toFixed(1),
    M.inv.probit(-1.89).toFixed(1),
    String(rec12.months),
    String(rec12.totalRecessions),
    String(rec12.calledCount),
    String(rec12.episodeCount),
    String(rec12.falseAlarmCount),
    rec12.trough2023.toFixed(2).replace('-', '−'),
    rec12.latestSpread.toFixed(2)
  ]) {
    check((dict['ch4.p2'] + dict['ch4.p3']).includes(val), `${label} ch4 prose pins ${val}`);
  }

  // Ch5
  const cIg = M.cred.compute(M.cred.presets.ig_bbb);
  const cBb = M.cred.compute(M.cred.presets.hy_bb);
  const cCcc = M.cred.compute(M.cred.presets.hy_ccc);
  for (const val of [
    cIg.spreadBp.toFixed(0), cIg.promisedYield.toFixed(2), cIg.expLossExactPct.toFixed(2), cIg.expRetPct.toFixed(2), cIg.netPremiumBp.toFixed(0),
    cCcc.promisedYield.toFixed(2), cCcc.expLossExactPct.toFixed(2), cCcc.expRetPct.toFixed(2),
    cBb.expRetPct.toFixed(2)
  ]) {
    check((dict['ch5.p1'] + dict['ch5.p3']).includes(val), `${label} ch5 prose pins ${val}`);
  }

  // Ch6
  for (const val of [
    mLow.ddQ.toFixed(2), mLow.spreadBp.toFixed(1),
    mMid.ddQ.toFixed(2), mMid.spreadBp.toFixed(1),
    mHigh.ddQ.toFixed(2), mHigh.spreadBp.toFixed(1),
    String(M.frontier.crisis.igCovidBp)
  ]) {
    check(dict['ch6.p3'].includes(val), `${label} ch6 prose pins ${val}`);
  }

  // Ch7
  for (const val of [
    M.frontier.tips10.toFixed(2), M.frontier.breakeven10.toFixed(2),
    tNov.yNomPct.toFixed(2), tNov.approxNomPct.toFixed(2),
    String(M.frontier.igOasBp), tNov.yCorpPct.toFixed(2),
    tNov.tipsRealWealth.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    tNov.nomRealWealth.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  ]) {
    check(dict['ch7.p3'].includes(val), `${label} ch7 prose pins ${val}`);
  }

  // Ch8 frontier
  const fr = M.frontier;
  for (const val of [
    fr.ust2y.toFixed(2), fr.ust10y.toFixed(2), fr.ust30y.toFixed(2),
    String(Math.round(fr.spread10y2y * 100)),
    fr.tips10.toFixed(2), fr.breakeven10.toFixed(2),
    String(fr.igOasBp), String(fr.hyOasBp)
  ]) {
    check((dict['ch8.k2'] + dict['ch8.p2'] + dict['ch8.d1'] + dict['ch8.m1.note'] + dict['ch8.m4.note']).includes(val), `${label} ch8 frontier pins ${val}`);
  }
}
pinProse(ZH, 'zh');
pinProse(EN, 'en');

/* ── 3. Dictionary Parity, HTML/App Coverage & Zero CJK Hygiene ── */
const zhKeys = Object.keys(ZH);
const enKeys = Object.keys(EN);
check(zhKeys.length === enKeys.length, `key count mismatch zh=${zhKeys.length} en=${enKeys.length}`);
for (const k of zhKeys) {
  check(k in EN, `missing key in copy.en.js: ${k}`);
  check(String(EN[k]).trim().length > 0, `empty value in copy.en.js: ${k}`);
  const zv = (ZH[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).slice().sort().join(',');
  const ev = (EN[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).slice().sort().join(',');
  check(zv === ev, `placeholder mismatch on ${k}: zh=${zv} en=${ev}`);
  const zt = (ZH[k].match(/<\/?[a-zA-Z0-9-]+(?:\s[^>]*)?>/g) || []).map((s) => s.replace(/\s+/g, ' ')).join('|');
  const et = (EN[k].match(/<\/?[a-zA-Z0-9-]+(?:\s[^>]*)?>/g) || []).map((s) => s.replace(/\s+/g, ' ')).join('|');
  check(zt === et, `HTML tag mismatch on ${k}: zh=${zt} en=${et}`);
  const zHref = [...ZH[k].matchAll(/href="([^"]+)"/g)].map((m) => m[1]).join('|');
  const eHref = [...EN[k].matchAll(/href="([^"]+)"/g)].map((m) => m[1]).join('|');
  check(zHref === eHref, `href mismatch on ${k}: zh=${zHref} en=${eHref}`);
}

const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;
const rawEn = fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8');
check(!CJK_RE.test(rawEn), 'copy.en.js contains CJK/fullwidth characters');

const rawApp = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
check(!CJK_RE.test(rawApp), 'app.js contains CJK/fullwidth characters');

const rawModels = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
check(!CJK_RE.test(rawModels), 'models.js contains CJK/fullwidth characters');

const rawHtml = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const htmlBody = rawHtml.slice(rawHtml.indexOf('<body>')).replace('>中</button>', '>LANG_ZH</button>');
check(!CJK_RE.test(htmlBody), 'index.html body contains CJK outside the 中 toggle');

// Check every data-i18n* attribute in index.html exists in both ZH and EN
for (const m of rawHtml.matchAll(/data-i18n(?:-[a-z]+)?="([^"]+)"/g)) {
  check(m[1] in ZH && m[1] in EN, `index.html key missing from copy: ${m[1]}`);
}
// Check static t('...') calls in app.js
for (const m of rawApp.matchAll(/\bt\(\s*'([^']+)'/g)) {
  if (!m[1].endsWith('.')) check(m[1] in ZH && m[1] in EN, `app.js key missing from copy: ${m[1]}`);
}

/* ── 4. Live Sentence Branch Reachability ── */
const sayBranches = new Set();
// ch1
[M.boot.presets.nov2026, M.boot.presets.inv2023, [4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5]].forEach((ys) => {
  const b = M.boot.bootstrap(ys, 30);
  const s = b.par[9] - b.par[0];
  sayBranches.add(s > 0.15 ? 'ch1.say.up' : s < -0.15 ? 'ch1.say.inv' : 'ch1.say.flat');
});
// ch2
Object.values(M.eh.presets).forEach((p) => {
  const s = M.eh.summary(p);
  sayBranches.add(s.s10y2y < -0.15 ? 'ch2.say.inv' : (p.tp10 >= 1.2 && Math.abs(s.expSlope10y2y) < 0.25) ? 'ch2.say.tp' : s.s10y2y > 0.15 ? 'ch2.say.normal' : 'ch2.say.flat');
});
// ch3
[-2, 0, 2].forEach((dy) => sayBranches.add(Math.abs(dy) < 0.05 ? 'ch3.say.zero' : dy > 0 ? 'ch3.say.up' : 'ch3.say.down'));
// ch4
sayBranches.add('ch4.say.hist');
[-0.5, 0.5].forEach((tp) => sayBranches.add(tp < 0 ? 'ch4.say.decneg' : 'ch4.say.decpos'));
// ch5
[{ rf: 4.81, spreadBp: 330, defaultPct: 1.5, recoveryPct: 45 }, { rf: 4.81, spreadBp: 100, defaultPct: 8.0, recoveryPct: 30 }].forEach((p) => {
  const r = M.cred.compute(p);
  sayBranches.add(r.netPremiumBp >= 0 ? 'ch5.say.pos' : 'ch5.say.neg');
});
// ch6
sayBranches.add('ch6.say.low');
sayBranches.add('ch6.say.mid');
sayBranches.add('ch6.say.liq');
// ch7
[1.0, M.frontier.breakeven10, 4.5].forEach((act) => {
  const d = act - M.frontier.breakeven10;
  sayBranches.add(d > 0.05 ? 'ch7.say.tips' : d < -0.05 ? 'ch7.say.nom' : 'ch7.say.eq');
});
// ch8
['ch8.say.curves', 'ch8.say.global', 'ch8.say.credit'].forEach((k) => sayBranches.add(k));
const allSayKeys = zhKeys.filter((k) => k.includes('.say.'));
check(sayBranches.size === 24 && allSayKeys.length === 24 && allSayKeys.every((k) => sayBranches.has(k)), `expected all 24 live .say branches reached, got ${sayBranches.size}/${allSayKeys.length}`);

/* ── 5. REGISTRY.json Consistency ── */
const reg = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
check(reg.title.zh === ZH['doc.title'], 'REGISTRY title.zh === doc.title');
check(reg.title.en === EN['doc.title'], 'REGISTRY title.en === doc.title');
check(reg.desc.zh === ZH['doc.desc'], 'REGISTRY desc.zh === doc.desc');
check(reg.desc.en === EN['doc.desc'], 'REGISTRY desc.en === doc.desc');
for (const c of reg.concepts) {
  const id = c.anchor.replace(/^#/, '');
  check(rawHtml.includes(`id="${id}"`), `REGISTRY anchor missing in index.html: ${c.anchor}`);
}

console.log(`PASS: ${checks} checks (models, prose pins, bilingual parity, zero-CJK hygiene, 24 live-sentence branches, REGISTRY)`);
