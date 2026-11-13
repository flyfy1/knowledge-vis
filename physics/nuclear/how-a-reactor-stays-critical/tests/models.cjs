'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'models.js'));

let checks = 0;
function ok(cond, msg) {
  assert.ok(cond, msg);
  checks++;
}
function near(actual, expected, tol, msg) {
  const diff = Math.abs(actual - expected);
  ok(diff <= tol, `${msg}: got ${actual}, expected ${expected} (±${tol})`);
}

// 1. Ch1 AME2020 binding energies & Q-values
near(M.bindingPerA('Ni62'), 8.7945, 0.005, 'Ni-62 B/A');
near(M.bindingPerA('Fe56'), 8.7903, 0.005, 'Fe-56 B/A');
near(M.bindingPerA('U235'), 7.5909, 0.005, 'U-235 B/A');
near(M.qValue('u235_ba'), 173.28, 0.2, 'U-235 -> Ba141+Kr92+3n prompt Q');
near(M.qValue('u235_xe'), 199.93, 0.2, 'U-235 -> Xe140+Sr94+2n prompt Q');
near(M.qValue('dt'), 17.59, 0.05, 'D-T Q-value');
ok(M.coalEquivalent('u235_ba', true) > 2.5e6 && M.coalEquivalent('u235_ba', true) < 3.1e6, 'U-235 coal equiv ~2.8M');
ok(M.ch1Branch('u235_ba') === 'fission' && M.ch1Branch('dt') === 'fusion', 'Ch1 branches');

// 2. Ch2 Cross-sections & moderation
near(M.sigmaF235(0.0253), 585, 10, 'Thermal U-235 sigma_f ~585 b');
near(M.sigmaF235(2e6), 1.2, 0.3, 'Fast U-235 sigma_f ~1.2 b');
ok(M.sigmaC238(6.67) > 3000, 'U-238 capture resonance peak around 6.67 eV');
const h2o = M.moderationData('h2o', -1.60);
const d2o = M.moderationData('d2o', -1.60);
const gr = M.moderationData('graphite', -1.60);
const na = M.moderationData('na23', 5.0);
ok(Math.round(h2o.totalToThermal) === 20, 'H2O thermalization collisions ~20');
ok(Math.round(d2o.totalToThermal) === 36, 'D2O thermalization collisions ~36');
ok(Math.round(gr.totalToThermal) === 115, 'Graphite thermalization collisions ~115');
ok(Math.round(na.totalToThermal) >= 210, 'Na-23 requires >200 collisions');
ok(M.ch2Branch('h2o', 6.0) === 'fast', 'Ch2 fast branch');
ok(M.ch2Branch('h2o', 0.82) === 'resonance', 'Ch2 resonance branch');
ok(M.ch2Branch('h2o', -1.60) === 'thermal', 'Ch2 thermal branch');
ok(M.ch2Branch('na23', 5.0) === 'sodiumFast', 'Ch2 sodiumFast branch');

// 3. Ch3 Six-factor criticality & negative void coefficient
const pwrNat = M.sixFactor('pwr', 0.72, 0);
const canduNat = M.sixFactor('candu', 0.72, 0);
const pwrLeu = M.sixFactor('pwr', 4.5, 0);
const pwrVoid = M.sixFactor('void', 4.5, 0);
const pwrShut = M.sixFactor('pwr', 4.5, 100);
ok(pwrNat.kEff < 1.0, 'Natural U cannot go critical in H2O');
ok(canduNat.kEff > 1.0, 'Natural U goes critical in D2O');
ok(pwrLeu.kEff > 1.2 && pwrShut.kEff < 1.0, 'PWR 4.5% goes supercritical rods-out and subcritical rods-in');
ok(pwrVoid.kEff < pwrLeu.kEff, 'Negative void coefficient in PWR');
ok(M.ch3Branch('pwr', 0.72, 0) === 'naturalCantGoCrit', 'Ch3 naturalCantGoCrit');
ok(M.ch3Branch('void', 4.5, 0) === 'voidNegative', 'Ch3 voidNegative');
ok(M.ch3Branch('pwr', 4.5, 0) === 'supercritical', 'Ch3 supercritical');
ok(M.ch3Branch('pwr', 4.5, 100) === 'subcritical', 'Ch3 subcritical');
// Verify critical band exists between 0 and 100% rods
let foundCrit = false;
for (let r = 0; r <= 100; r++) if (M.ch3Branch('pwr', 4.5, r) === 'critical') foundCrit = true;
ok(foundCrit, 'Ch3 critical branch reachable by rod sweep');

// 4. Ch4 Keepin 6-group point kinetics & Doppler feedback
near(M.BETA_TOTAL, 0.00645, 0.0001, 'Keepin beta total 0.00645');
near(M.TAU_DELAYED_BAR, 13.03, 0.2, 'Mean delayed precursor lifetime ~13.03 s');
const kDelayed = M.kineticsSim('nodoppler', 0.25, 10);
const kDopplerPrompt = M.kineticsSim('doppler', 1.10, 10);
const kNoFeedbackPrompt = M.kineticsSim('nodoppler', 1.10, 10);
const kNoBeta = M.kineticsSim('promptOnly', 0.10, 1);
ok(kDelayed.nAtEnd > 1.5 && kDelayed.nAtEnd < 5.0, 'Delayed +0.25$ gentle climb over 10 s');
ok(kDopplerPrompt.peakN > 5 && kDopplerPrompt.nAtEnd < kDopplerPrompt.peakN * 0.5, 'Doppler self-quenches prompt spike');
ok(kNoFeedbackPrompt.nAtEnd > 1e6, 'Unchecked prompt critical runs away');
ok(kNoBeta.nAtEnd > 1e5, 'Hypothetical beta=0 +0.10$ runs away in 1 s');
ok(M.ch4Branch('promptOnly', 0.10) === 'noBetaRunaway', 'Ch4 noBetaRunaway');
ok(M.ch4Branch('doppler', -0.25) === 'subcritical', 'Ch4 subcritical');
ok(M.ch4Branch('doppler', 0.0) === 'critical', 'Ch4 critical');
ok(M.ch4Branch('doppler', 0.30) === 'delayedWindow', 'Ch4 delayedWindow');
ok(M.ch4Branch('doppler', 1.10) === 'promptWithDoppler', 'Ch4 promptWithDoppler');
ok(M.ch4Branch('nodoppler', 1.10) === 'promptRunaway', 'Ch4 promptRunaway');

// 5. Ch5 Xenon-135 poisoning & iodine pit
const xeSteady = M.xenonSim(3.0, 100, 3500);
const xeTrip = M.xenonSim(3.0, 0, 3500);
const xeFresh = M.xenonSim(3.0, 0, 6000);
ok(xeTrip.peakNegPcm < xeTrip.eqWorthPcm, 'Scram deepens Xe negative worth into iodine pit');
ok(xeTrip.peakHour >= 6 && xeTrip.peakHour <= 11, 'Iodine pit peaks ~8-10 h');
ok(xeTrip.isLocked && !xeFresh.isLocked, '3500 pcm reserve locks while 6000 pcm overrides pit');
ok(M.ch5Branch(3.0, 100, 3500) === 'steady', 'Ch5 steady');
ok(M.ch5Branch(3.0, 0, 3500) === 'xenonLocked', 'Ch5 xenonLocked');
ok(M.ch5Branch(3.0, 0, 6000) === 'restartable', 'Ch5 restartable');

// 6. Ch6 Decay heat (Way-Wigner)
const dh1 = M.decayHeat('cycle', 3000, 0);
const dh1h = M.decayHeat('cycle', 3000, Math.log10(3600));
const dh1d = M.decayHeat('cycle', 3000, Math.log10(86400));
near(dh1.fracPct, 6.04, 0.15, '1 s decay heat ~6.04%');
near(dh1h.fracPct, 1.03, 0.1, '1 h decay heat ~1.03%');
near(dh1d.fracPct, 0.46, 0.05, '1 d decay heat ~0.46%');
ok(dh1.boilKgS > 75 && dh1.boilKgS < 85, '1 s boil-off ~80 kg/s');
ok(M.ch6Branch('cycle', 3000, 0) === 'immediate', 'Ch6 immediate');
ok(M.ch6Branch('cycle', 3000, 3.5) === 'hours', 'Ch6 hours');
ok(M.ch6Branch('cycle', 3000, 5.2) === 'days', 'Ch6 days');

// 7. Ch7 Spent fuel inventory & radiotoxicity horizon
const wOnce = M.wasteModel('once', 0, 1);
const wRep = M.wasteModel('reprocess', 3, 1);
near(wOnce.tHM_yr, 24.35, 0.2, 'Annual spent fuel ~24.4 tHM/GWe-yr');
ok(wOnce.crossoverYr > 80000, 'Once-through takes >80 kyr');
ok(wRep.crossoverYr < 500, 'Reprocessed FP waste crosses U-ore in <500 yr');
ok(M.ch7Branch('once', 1, 1) === 'csSrDominant', 'Ch7 csSrDominant');
ok(M.ch7Branch('once', 4, 1) === 'truLongTail', 'Ch7 truLongTail');
ok(M.ch7Branch('reprocess', 3, 1) === 'reprocessedCleared', 'Ch7 reprocessedCleared');

// 8. Ch8 Frontier architectures
const pwrArch = M.ch8Data('pwr');
const htgrArch = M.ch8Data('htgr');
ok(htgrArch.carnotPct > pwrArch.carnotPct, 'Higher HTGR outlet temp yields higher Carnot limit');
ok(M.FRONTIER.globalFleet.operableReactors === 413, 'IAEA PRIS fleet count pinned');

// 9. Copy parity, HTML/href consistency, zero CJK outside copy.zh.js, and prose number pinning
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.en.js'), 'utf8'), ctx);
const zh = ctx.window.ESSAY_COPY.zh;
const en = ctx.window.ESSAY_COPY.en;

const zhKeys = Object.keys(zh).sort();
const enKeys = Object.keys(en).sort();
ok(JSON.stringify(zhKeys) === JSON.stringify(enKeys), 'zh and en keys match 100%');

const cjkRe = /[\u4e00-\u9fff\u3400-\u4dbf]/;
function extractPlaceholders(s) {
  return (String(s).match(/\{[A-Za-z0-9_]+\}/g) || []).sort();
}
function extractHrefs(s) {
  return (String(s).match(/href="([^"]+)"/g) || []).sort();
}
function extractTags(s) {
  return (String(s).match(/<\/?[a-z]+(?:\s+class="[^"]+")?/g) || []).sort();
}

for (const k of zhKeys) {
  const vz = zh[k], ve = en[k];
  if (Array.isArray(vz)) {
    ok(Array.isArray(ve) && vz.length === ve.length, `array parity for ${k}`);
    if (k === 'src.items') {
      vz.forEach((item, idx) => {
        ok(!cjkRe.test(ve[idx]), `no CJK in en ${k}[${idx}]`);
        ok(JSON.stringify(extractPlaceholders(item)) === JSON.stringify(extractPlaceholders(ve[idx])), `placeholders in ${k}[${idx}]`);
      });
    }
    continue;
  }
  ok(!cjkRe.test(String(ve)), `zero CJK in copy.en.js key ${k}`);
  ok(JSON.stringify(extractPlaceholders(vz)) === JSON.stringify(extractPlaceholders(ve)), `placeholder parity for ${k}`);
  ok(JSON.stringify(extractHrefs(vz)) === JSON.stringify(extractHrefs(ve)), `href parity for ${k}`);
  ok(JSON.stringify(extractTags(vz)) === JSON.stringify(extractTags(ve)), `tag parity for ${k}`);
}

// Check static-prose keys only reference placeholders existing in M.prose()
const pv = M.prose();
const pvKeys = new Set(Object.keys(pv));
for (const k of zhKeys) {
  if (k.startsWith('u.') || k === 'fmt.big' || k.includes('.say.') || k === 'ch5.lock.no') continue;
  const arr = Array.isArray(zh[k]) ? zh[k] : [zh[k]];
  for (const s of arr) {
    for (const ph of extractPlaceholders(s)) {
      const name = ph.slice(1, -1);
      ok(pvKeys.has(name), `prose placeholder ${ph} in ${k} exists in M.prose()`);
    }
  }
}

// Check zero CJK in models.js and app.js
ok(!cjkRe.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')), 'zero CJK in models.js');
ok(!cjkRe.test(fs.readFileSync(path.join(dir, 'app.js'), 'utf8')), 'zero CJK in app.js');

// Check all data-i18n* keys in index.html exist in copy
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-(?:html|aria))?="([^"]+)"/g)) {
  ok(zh[m[1]] != null && en[m[1]] != null, `HTML key ${m[1]} exists in zh & en`);
}

// Check all relative href targets exist on disk
for (const k of zhKeys) {
  for (const m of String(zh[k]).matchAll(/href="([^"]+)"/g)) {
    const h = m[1].split('#')[0];
    if (h) ok(fs.existsSync(path.resolve(dir, h)), `relative href ${h} in ${k} resolves on disk`);
  }
}

// Check REGISTRY.json anchors exist in index.html
const reg = JSON.parse(fs.readFileSync(path.join(dir, 'REGISTRY.json'), 'utf8'));
ok(reg.slug === 'how-a-reactor-stays-critical', 'REGISTRY slug matches');
for (const c of reg.concepts) {
  ok(html.includes(`id="${c.anchor.slice(1)}"`), `REGISTRY anchor ${c.anchor} exists in index.html`);
  ok(c.title.zh && c.title.en && c.desc.zh && c.desc.en, `REGISTRY concept ${c.id} bilingual`);
}

console.log(`PASS: ${checks} model, parity, and prose checks`);
