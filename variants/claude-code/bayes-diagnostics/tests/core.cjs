'use strict';
// Bayes diagnostics (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// The page's own number formatter (copied out of app.js so the test exercises the shipped code).
const fmtSrc = app.match(/const fmt = [^\n]+/)[0];
const fmt = eval(fmtSrc.replace(/^const fmt = /, '').replace(/;$/, ''));
const pct = (p, d = 1) => fmt(p * 100, d) + '%';
ok(fmt(90, 0) === '90' && fmt(100, 0) === '100' && fmt(26.8656, 1) === '26.9' && fmt(2.0, 1) === '2' && fmt(0.5, 1) === '0.5', 'fmt keeps integer zeros, trims decimal zeros');

// ---- slider grids ----
const PREV = [], SENS = [], SPEC = [];
for (let v = 0.5; v <= 30 + 1e-9; v += 0.5) PREV.push(Math.round(v * 10) / 1000);
for (let v = 50; v <= 100; v++) { SENS.push(v / 100); SPEC.push(v / 100); }

// ---- identities over the whole slider grid ----
for (const p of PREV) for (const se of SENS) for (const sp of SPEC) {
  const c = M.counts(p, se, sp);
  near(c.TP + c.FN + c.FP + c.TN, M.N, 1e-9, 'four cells sum to N');
  near(c.ppv, M.ppvFormula(p, se, sp), 1e-12, 'counts PPV = Bayes formula');
  near(c.npv, M.npvFormula(p, se, sp), 1e-12, 'counts NPV = Bayes formula');
  // P(ill | −) never exceeds the prior and P(ill | +) never falls below it (whenever the test is informative)
  if (se + sp > 1) { ok(c.illGivenNeg <= p + 1e-12 && c.ppv >= p - 1e-12, 'positive raises, negative lowers'); }
  const R = M.roundedCells(p, se, sp);
  ok(R.TP + R.FN + R.FP + R.TN === M.N && R.TP >= 0 && R.FN >= 0 && R.FP >= 0 && R.TN >= 0, 'grid cells whole and complete');
  ok(Math.abs(R.TP - c.TP) <= 0.5 + 1e-9 && Math.abs(R.FP - c.FP) <= 0.5 + 1e-9 && R.ill === Math.round(c.ill), 'grid rounds each cell by ≤ 0.5 person');
  // odds form (s5e, formula): posterior odds = prior odds × LR+
  if (sp < 1) near(M.odds(c.ppv), M.odds(p) * M.lrPos(se, sp), 1e-9 * M.odds(c.ppv) + 1e-12, 'odds form');
}
// prevalence slider steps in 0.5% → whole numbers of ill people (s1e: dots drawn as whole people)
for (const p of PREV) ok(Math.abs(M.N * p - Math.round(M.N * p)) < 1e-9, 'ill count whole at ' + p);
// PPV rises with prevalence for fixed test (s3hint)
for (const se of [0.6, 0.9, 1]) for (const sp of [0.6, 0.95, 0.99]) for (let i = 1; i < PREV.length; i++) ok(M.ppvFormula(PREV[i], se, sp) > M.ppvFormula(PREV[i - 1], se, sp), 'PPV increasing in prevalence');

// ---- step 0 / defaults: 20 ill, 18 TP, 2 FN, 49 FP, 931 TN, 67 positives, PPV 26.9% ----
const D = M.DEFAULTS, d = M.counts(D.prev, D.sens, D.spec);
near(d.ill, 20, 1e-9, 'ill'); near(d.TP, 18, 1e-9, 'TP'); near(d.FN, 2, 1e-9, 'FN'); near(d.FP, 49, 1e-9, 'FP'); near(d.TN, 931, 1e-9, 'TN'); near(d.pos, 67, 1e-9, 'pos');
ok(pct(d.ppv) === '26.9%', 'PPV 26.9%');
ok(d.FP > d.TP, 'default: false alarms outnumber the ill (s0hint, s3domFP)');
// verdicts: default guess 80% is "high"; verdictLow says "more than tenfold" (十几倍) from 2%
ok(Number(html.match(/id="g0"[^>]*value="(\d+)"/)[1]) / 100 > d.ppv + 0.1, 'default guess is high');
ok(d.ppv / D.prev > 10 && d.ppv / D.prev < 20, 'lift is between 10× and 20×');
const R0 = M.roundedCells(D.prev, D.sens, D.spec); ok(R0.TP === 18 && R0.FP === 49 && R0.FN === 2, 'grid matches exact counts at defaults');
// slider defaults in the HTML match the model defaults
ok(html.includes('id="p1" data-step="1" type="range" min="0.5" max="30" step="0.5" value="2"'), 'p1 default');
ok(html.includes('id="se2" data-step="2" type="range" min="50" max="100" step="1" value="90"') && html.includes('id="sp2" data-step="2" type="range" min="50" max="100" step="1" value="95"'), 'sens/spec defaults');

// ---- step 1 hint: 0.5% → 5 pink dots ----
ok(M.roundedCells(0.005, 0.9, 0.95).ill === 5, '0.5% → 5 ill');

// ---- step 2 hint: spec 95% → ~49 false alarms, 99% → ~10; sensitivity never moves the healthy row ----
ok(Math.round(M.counts(0.02, 0.9, 0.99).FP) === 10, 'spec 99% → about 10 FP');
for (const se of SENS) { const c = M.counts(0.02, se, 0.95); near(c.FP, 49, 1e-9, 'FP independent of sensitivity'); near(c.TN, 931, 1e-9, 'TN independent of sensitivity'); }
for (const sp of SPEC) { const c = M.counts(0.02, 0.9, sp); near(c.TP, 18, 1e-9, 'TP independent of specificity'); }

// ---- step 3 hint: P(ill | −) "rises to a few percent" at 30% with default test ----
{ const c = M.counts(0.30, D.sens, D.spec); ok(c.illGivenNeg > 0.03 && c.illGivenNeg < 0.1, 'P(ill|−) at 30% is a few percent: ' + c.illGivenNeg); }

// ---- step 4: sensitivity fixed, PPV moves; equal exactly when ill = positives ----
for (const p of PREV) { const c = M.counts(p, 0.9, 0.95); near(c.TP / c.ill, 0.9, 1e-12, 'row share = sensitivity'); ok((Math.abs(c.ill - c.pos) < 1e-9) === (Math.abs(c.TP / c.ill - c.ppv) < 1e-12), 'equal iff denominators equal'); }
{ const lo = M.counts(0.005, 0.9, 0.95).ppv, hi = M.counts(0.30, 0.9, 0.95).ppv; ok(hi - lo > 0.5, 'PPV swings widely over the slider'); }
// quiz: 99/99 test, prevalence 0.1% → about 9%, about 90× the prior
const Q = M.counts(0.001, 0.99, 0.99);
ok(pct(Q.ppv) === '9%' && Math.round(Q.ppv / 0.001) === 90, 'quiz PPV 9.0% and 90×: ' + Q.ppv);
near(Q.TP, 0.99, 1e-9, 'quiz TP'); near(Q.FP, 9.99, 1e-9, 'quiz FP'); near(Q.pos, 10.98, 1e-9, 'quiz positives');
ok(app.includes("choice.value === 'b'") && STRINGS.zh.quizB.includes('9%') && STRINGS.en.quizB.includes('9%'), 'quiz answer b = about 9%');

// ---- step 5: 26.9% → 86.9% → 99.2%; LR 18, and 4.5 at specificity 80% ----
const rr = M.repeatRounds(D.prev, D.sens, D.spec, 4);
ok(pct(rr[1].post) === '26.9%' && pct(rr[2].post) === '86.9%' && pct(rr[3].post) === '99.2%', 'repeat posteriors ' + rr.map(r => pct(r.post)));
near(rr[1].post, d.ppv, 1e-12, 'one positive = step 3 PPV');
near(M.lrPos(0.9, 0.95), 18, 1e-9, 'LR+ 18'); near(M.lrPos(0.9, 0.8), 4.5, 1e-9, 'LR+ 4.5 at spec 80%');
for (const p of [0.005, 0.02, 0.3]) for (const sp of [0.8, 0.95, 0.99]) {
  const R = M.repeatRounds(p, 0.9, sp, 4);
  R.forEach(r => { near(r.ill / r.healthy, M.odds(p) * Math.pow(M.lrPos(0.9, sp), r.k), 1e-9 * r.ill / r.healthy, 'odds × LR^k'); });
  for (let k = 1; k <= 4; k++) { ok(R[k].post > R[k - 1].post, 'each positive raises the chance'); const prevRound = M.counts(R[k - 1].post, 0.9, sp); near(R[k].post, prevRound.ppv, 1e-9, 'posterior becomes prior'); }
}
// with spec 80% the climb is slower (s5hint)
ok(M.repeatRounds(0.02, 0.9, 0.8, 3)[2].post < rr[2].post - 0.3, 'spec 80% climbs far more slowly');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lgCurvePos', 'lgCurveNeg']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '贝叶斯诊断 · 阳性结果说明什么？' : 'Bayes Diagnostics · What Does a Positive Mean?'), 'footer names the model and the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/上图|下图|上面的图|下面的图|左图|右图|upper chart|lower chart|top chart|bottom chart|left panel|right panel|left chart|right chart/i.test(v), 'no left/right figure references in ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/\[\s*'dot-[a-z]+',\s*'([A-Za-z0-9]+)'\]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'legend key ' + m[1]);
for (const id of ['g0', 'reveal0', 'hide0', 'p1', 'se2', 'sp2', 'pos3', 'neg3', 'p3', 'clear3', 'p4', 'checkQuiz', 'again5', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/inference/bayes-diagnostics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS bayes-diagnostics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · default PPV ${pct(d.ppv)}`);
