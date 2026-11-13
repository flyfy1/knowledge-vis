'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var DIR = path.resolve(__dirname, '..');
var M = require(path.join(DIR, 'models.js'));

var passed = 0;
function check(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  passed++;
}
function near(a, b, tol, msg) {
  check(Math.abs(a - b) <= tol, msg + ' (got ' + a + ', expected ' + b + ' ± ' + tol + ')');
}

// 1. Budget accounting
(function () {
  var a = M.budgetAccounting({ revPct: 26, primarySpendPct: 25, debtPct: 120, avgRatePct: 4.0, gdpTrillion: 20 });
  near(a.primaryBalancePct, 1.0, 1e-6, 'primary surplus = 1.0%');
  near(a.interestPct, 4.8, 1e-6, 'interest bill = 4.8%');
  near(a.overallBalancePct, -3.8, 1e-6, 'overall balance = -3.8%');
  check(a.regime === 'primary_surplus_headline_deficit', 'regime split');

  var s = M.budgetAccounting({ revPct: 30, primarySpendPct: 24, debtPct: 60, avgRatePct: 3.0 });
  check(s.regime === 'primary_surplus_overall_surplus', 'overall surplus regime');

  var d = M.budgetAccounting({ revPct: 22, primarySpendPct: 26, debtPct: 100, avgRatePct: 4.0 });
  check(d.regime === 'primary_deficit', 'primary deficit regime');
})();

// 2. Debt dynamics r - g
(function () {
  var stab = M.debtDynamics({ d0: 120, rPct: 5.0, gPct: 3.5, pbPct: 120 * (0.015 / 1.035), horizon: 30 });
  near(stab.endDebt, 120, 0.2, 'exact pb* holds debt flat');
  check(stab.regime === 'knife_edge', 'knife edge regime');

  // Real vs Nominal invariance when 2.5% inflation multiplies both (1+r) and (1+g)
  var pi = 0.025;
  var rReal = 0.02, gReal = 0.03;
  var rNom = ((1 + rReal) * (1 + pi) - 1) * 100;
  var gNom = ((1 + gReal) * (1 + pi) - 1) * 100;
  var pReal = M.debtDynamics({ d0: 100, rPct: rReal * 100, gPct: gReal * 100, pbPct: -1.5, horizon: 30 });
  var pNom = M.debtDynamics({ d0: 100, rPct: rNom, gPct: gNom, pbPct: -1.5, horizon: 30 });
  near(pReal.endDebt, pNom.endDebt, 1e-6, 'real vs nominal (1+r)/(1+g) invariance');

  var climb = M.debtDynamics({ d0: 80, rPct: 2.0, gPct: 4.0, pbPct: -2.0, horizon: 30 });
  check(climb.regime === 'favorable_rg_climbing_to_ss', 'favorable r<g climbing');
  near(climb.steadyStatePct, 104.0, 1e-6, 'steady state = (-pb)*(1+g)/(g-r) = 104');

  var fall = M.debtDynamics({ d0: 100, rPct: 2.0, gPct: 4.0, pbPct: 1.0, horizon: 30 });
  check(fall.regime === 'favorable_rg_falling', 'favorable r<g falling');

  var snow = M.debtDynamics({ d0: 120, rPct: 6.0, gPct: 3.0, pbPct: -2.0, horizon: 30 });
  check(snow.regime === 'snowball' && snow.diverges, 'snowball regime diverges');
  check(snow.endDebt > 250, 'snowball debt shoots up');

  var sur = M.debtDynamics({ d0: 120, rPct: 5.0, gPct: 3.0, pbPct: 4.0, horizon: 30 });
  check(sur.regime === 'surplus_offset' && sur.endDebt < 100, 'surplus offsets r>g');
})();

// 3. Currency exposure
(function () {
  var own = M.currencyExposure({ d0: 75, fxSharePct: 0, fxDeprecPct: 60, reserveMonths: 6 });
  check(own.balanceSheetJumpPct === 0 && own.regime === 'own_currency', '0% FX debt has 0 jump');

  var mix = M.currencyExposure({ d0: 75, fxSharePct: 35, fxDeprecPct: 25, reserveMonths: 8 });
  check(mix.regime === 'fx_vulnerable' && mix.balanceSheetJumpPct > 0, 'mixed FX vulnerable');

  var stop = M.currencyExposure({ d0: 75, fxSharePct: 75, fxDeprecPct: 55, reserveMonths: 2.5 });
  check(stop.regime === 'sudden_stop' && stop.fxServiceToReserves >= 1.0, 'sudden stop when FX service > reserves');
})();

// 4. Rollover schedule & CB netting
(function () {
  var r = M.rolloverSchedule({ debtPct: 110, wamYears: 6.0, oldCouponPct: 2.2, marketYieldPct: 4.5, cbSharePct: 20, primaryDeficitPct: 2.5 });
  check(r.threeYearSharePct > 35 && r.threeYearSharePct < 48, '3y rollover ~42% matches OECD band');
  check(r.refiSharePct > 70 && r.refiSharePct < 85, 'refi share near OECD ~78%');
  check(r.effRatePath[10] > r.effRatePath[1] && r.effRatePath[10] < 4.5, 'effective rate monotonically approaches market yield');

  var cliff = M.rolloverSchedule({ debtPct: 130, wamYears: 2.5, oldCouponPct: 2.0, marketYieldPct: 6.0, cbSharePct: 10, primaryDeficitPct: 5.0 });
  check(cliff.regime === 'rollover_cliff', 'short WAM triggers rollover cliff');

  var cb = M.rolloverSchedule({ debtPct: 120, wamYears: 8.0, oldCouponPct: 1.5, marketYieldPct: 4.0, cbSharePct: 40, primaryDeficitPct: 2.0 });
  check(cb.regime === 'cb_duration_shortened' && cb.consolidatedShortSharePct > 45, 'CB share increases consolidated short exposure');
})();

// 5. Multiplier & crowding out
(function () {
  var norm = M.multiplierCrowding({ stimPct: 2.0, slackPct: 0, zlbOn: false, opennessPct: 25 });
  check(norm.multiplier >= 0.55 && norm.multiplier <= 1.05, 'normal multiplier near Ramey 0.6-1.0');
  check(norm.regime === 'normal_partial_crowdout', 'normal regime');

  var zlb = M.multiplierCrowding({ stimPct: 2.0, slackPct: -4.0, zlbOn: true, opennessPct: 20 });
  check(zlb.multiplier >= 1.25 && zlb.multiplier <= 1.65, 'ZLB slack multiplier approaches 1.5');
  check(zlb.regime === 'zlb_high_multiplier', 'ZLB regime');

  var crowd = M.multiplierCrowding({ stimPct: 3.0, slackPct: 2.5, zlbOn: false, opennessPct: 25 });
  check(crowd.regime === 'full_capacity_crowdout' && crowd.yr5DebtDeltaPct > crowd.yr1DebtDeltaPct, 'overheating crowding out');
})();

// 6. Demographics & PAYG
(function () {
  var y = M.demographicBudget({ workersPerRetiree: 4.2, replaceRatePct: 50, healthFactor: 1.0, debtPct: 100 });
  var c = M.demographicBudget({ workersPerRetiree: 2.8, replaceRatePct: 50, healthFactor: 1.0, debtPct: 100 });
  var a = M.demographicBudget({ workersPerRetiree: 1.6, replaceRatePct: 50, healthFactor: 1.4, debtPct: 140 });
  check(y.current.discretionaryRoomPct > c.current.discretionaryRoomPct && c.current.discretionaryRoomPct > a.current.discretionaryRoomPct, 'room shrinks monotonically with aging');
  check(y.regime === 'balanced_space', 'young balanced');
  check(c.regime === 'mild_squeeze' || c.regime === 'severe_squeeze', 'current squeeze');
  check(a.regime === 'negative_discretionary', 'aged redline');
})();

// 7. Historical decomposition
(function () {
  var us = M.historicalDecomp({ presetId: 'us_ww2' });
  near(us.startDebt + us.primaryContrib + us.growthContrib + us.interestContrib + us.inflationContrib + us.restructuringContrib, us.endDebt, 1e-6, 'US 1946-74 decomposition exact');
  check(us.startDebt === 106 && us.endDebt === 23 && us.counterfactualNoteDebt === 74, 'US Hall-Sargent & Acalin-Ball benchmark');

  var ca = M.historicalDecomp({ presetId: 'canada_1990s' });
  near(ca.startDebt + ca.primaryContrib + ca.growthContrib + ca.interestContrib + ca.inflationContrib + ca.restructuringContrib, ca.endDebt, 1e-6, 'Canada 1990s exact');

  var em = M.historicalDecomp({ presetId: 'em_restruct' });
  near(em.startDebt + em.primaryContrib + em.growthContrib + em.interestContrib + em.inflationContrib + em.restructuringContrib, em.endDebt, 1e-6, 'EM restructuring exact');

  var cu = M.historicalDecomp({ presetId: 'custom', startDebt: 110, years: 10, primaryPct: 2.0, growthPct: 3.0, realRatePct: 2.0, inflationPct: 3.5, haircutPct: 0 });
  near(cu.startDebt + cu.primaryContrib + cu.growthContrib + cu.interestContrib + cu.inflationContrib + cu.restructuringContrib, cu.endDebt, 1e-6, 'custom sandbox accounting exact');
})();

// 8. Frontier 2026 & Stress
(function () {
  var usBase = M.frontierStress({ countryId: 'us', yieldShiftBps: 0, growthShiftPct: 0 });
  near(usBase.baseDebtPct, 126.8, 1e-6, 'US IMF gross debt 126.8%');
  near(usBase.baseInterestPct, 3.3, 1e-6, 'US CBO interest 3.3%');
  check(usBase.regime === 'positive_rg' || usBase.regime === 'manageable' || usBase.regime === 'steep_adjustment', 'valid US regime');

  var usShock = M.frontierStress({ countryId: 'us', yieldShiftBps: 200, growthShiftPct: -1.0 });
  check(usShock.regime === 'steep_adjustment' && usShock.stressedInterest5y > usBase.baseInterestPct, 'US shock triggers steep adjustment');

  var jpCalm = M.frontierStress({ countryId: 'jp', yieldShiftBps: -50, growthShiftPct: 1.0 });
  check(jpCalm.regime === 'manageable', 'Japan favorable growth regime manageable');
})();

// 9. Parity, HTML keys, prose number pinning & zero CJK checks
(function () {
  var zhSrc = fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8');
  var enSrc = fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8');
  var htmlSrc = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  var appSrc = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
  var modelsSrc = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');

  var sb = { window: {} };
  vm.runInNewContext(zhSrc + '\n' + enSrc, sb);
  var zh = sb.window.ESSAY_COPY.zh;
  var en = sb.window.ESSAY_COPY.en;

  function flatten(obj, prefix, out) {
    out = out || {};
    if (Array.isArray(obj)) {
      obj.forEach(function (v, idx) { flatten(v, prefix + '[' + idx + ']', out); });
      return out;
    }
    if (obj && typeof obj === 'object') {
      Object.keys(obj).sort().forEach(function (k) {
        flatten(obj[k], prefix ? prefix + '.' + k : k, out);
      });
      return out;
    }
    out[prefix] = String(obj);
    return out;
  }

  var fZh = flatten(zh, '');
  var fEn = flatten(en, '');
  var zhKeys = Object.keys(fZh);
  var enKeys = Object.keys(fEn);
  check(zhKeys.length === enKeys.length, 'zh/en key count match (' + zhKeys.length + ' vs ' + enKeys.length + ')');

  zhKeys.forEach(function (k) {
    check(k in fEn, 'missing key in EN: ' + k);
    var vz = (fZh[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort().join(',');
    var ve = (fEn[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort().join(',');
    check(vz === ve, 'placeholder mismatch on ' + k + ': ' + vz + ' vs ' + ve);

    var hz = (fZh[k].match(/href="[^"]+"/g) || []).sort().join(',');
    var he = (fEn[k].match(/href="[^"]+"/g) || []).sort().join(',');
    check(hz === he, 'href mismatch on ' + k + ': ' + hz + ' vs ' + he);
  });

  // Check every HTML data-i18n* key exists in both zh and en
  var attrRe = /data-i18n(?:-html|-aria)?="([^"]+)"/g;
  var m;
  while ((m = attrRe.exec(htmlSrc)) !== null) {
    var pathKey = m[1];
    check(pathKey in fZh, 'HTML key missing in zh: ' + pathKey);
    check(pathKey in fEn, 'HTML key missing in en: ' + pathKey);
  }

  // Zero CJK in copy.en.js, app.js, models.js, and index.html (outside <title>, <meta name="description">, and >中<)
  var cjkRe = /[\u4e00-\u9fff\u3400-\u4dbf]/;
  check(!cjkRe.test(enSrc), 'zero CJK in copy.en.js');
  check(!cjkRe.test(appSrc), 'zero CJK in app.js');
  check(!cjkRe.test(modelsSrc), 'zero CJK in models.js');

  var strippedHtml = htmlSrc
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/>中<\/button>/, '>ZH</button>');
  check(!cjkRe.test(strippedHtml), 'zero unexpected CJK in index.html');

  // No "left figure" / "right figure" wording
  check(!/左图|右图|left figure|right figure/i.test(zhSrc + enSrc), 'no left/right figure phrasing');

  // Validate REGISTRY.json schema & zero CJK in EN fields
  var reg = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check(reg.slug === 'can-a-country-go-bankrupt' && reg.stage === 'university', 'REGISTRY slug & stage');
  check(!cjkRe.test(reg.title.en + ' ' + reg.desc.en + ' ' + reg.tags.en.join(' ')), 'REGISTRY EN fields zero CJK');
  check(Array.isArray(reg.concepts) && reg.concepts.length === 8, 'REGISTRY has 8 concepts');
  reg.concepts.forEach(function (c) {
    check(!cjkRe.test(c.title.en + ' ' + c.desc.en + ' ' + c.aliases.en.join(' ')), 'concept EN zero CJK: ' + c.id);
    check(htmlSrc.indexOf('id="' + c.anchor.replace('#', '') + '"') !== -1, 'anchor exists in index.html: ' + c.anchor);
  });

  // Pin every Frontier / historical figure in models.js against BOTH copy.zh.js and copy.en.js
  var usRow = M.FRONTIER_COUNTRIES[0];
  var jpRow = M.FRONTIER_COUNTRIES[1];
  var eaRow = M.FRONTIER_COUNTRIES[2];
  var cnRow = M.FRONTIER_COUNTRIES[3];
  var emRow = M.FRONTIER_COUNTRIES[4];
  [
    String(usRow.debtPct), String(usRow.cboPublicDebtPct), String(usRow.interestPct), String(usRow.cboInterest2036Pct),
    String(jpRow.debtPct), String(jpRow.interestPct),
    String(eaRow.debtPct), String(eaRow.deDebtPct), String(eaRow.frDebtPct), String(eaRow.itDebtPct),
    String(cnRow.debtPct), String(cnRow.interestPct),
    String(emRow.debtPct), String(emRow.revPct),
    String(M.HIST_PRESETS.us_ww2.startDebt), String(M.HIST_PRESETS.us_ww2.endDebt), String(M.HIST_PRESETS.us_ww2.counterfactualNoteDebt)
  ].forEach(function (numStr) {
    check(zhSrc.indexOf(numStr) !== -1, 'prose/table ZH contains pinned number ' + numStr);
    check(enSrc.indexOf(numStr) !== -1, 'prose/table EN contains pinned number ' + numStr);
  });
})();

console.log('PASS: ' + passed + ' checks passed in tests/models.cjs');
