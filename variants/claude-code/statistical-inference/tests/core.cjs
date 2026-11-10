'use strict';
// Statistical inference (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, text) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`); };

// ---- normal distribution helpers ----
const ref = { 0.1: 0.8875370839817152, 1: 0.15729920705028516, 2.5: 0.000406952017444959, 2.9: 4.109787809945885e-05, 3: 2.2090496998585438e-05, 3.5: 7.43098372341413e-07, 5: 1.537459794428035e-12 };
for (const [x, v] of Object.entries(ref)) { near(M.erfc(Number(x)) / v, 1, 1e-9, 'erfc ' + x); checks++; }
near(M.erfc(-1.2), 1.9103139782296354, 1e-12, 'erfc negative');
near(M.zStar(0.95), 1.959963984540054, 1e-9, 'z* 95%'); near(M.zStar(0.8), 1.2815515655446004, 1e-9, 'z* 80%');
near(M.zStar(0.9), 1.6448536269514722, 1e-9, 'z* 90%'); near(M.zStar(0.99), 2.5758293035489004, 1e-9, 'z* 99%');
for (const L of M.LEVELS) near(1 - M.pTwo(M.zStar(L)), L, 1e-12, 'p of z* = 1 − level');
checks += 8;

// ---- step 0: the stream is the truth machine; single bottles spread widely, batch means much less ----
{
  const S = M.batchStream(200);
  ok(S.length === 200 && S.every(b => b.bottles.length === 16), '200 batches of 16');
  const bottles = S.flatMap(b => b.bottles), means = S.map(b => b.mean);
  near(M.sd(bottles), M.SIGMA, 0.25, 'single-bottle spread ≈ σ'); near(M.sd(means), M.SIGMA / 4, 0.2, 'batch means spread ≈ σ/4');
  ok(S.every(b => b.bottles.every(v => v > 474.5 && v < 521.5)), 'all bottles fall inside the drawn axis 474–522 (no clipping needed)');
  ok(means.some(v => v > 500) && means.some(v => v < 500), 'some batch means above and some below 500 (step 0 hint)');
  checks += 2;
}

// ---- step 1: sampling distribution; s1hint quotes 0.96–1.05 and 94.3%–95.6% ----
let rLo = Infinity, rHi = 0, wLo = Infinity, wHi = 0;
for (const n of M.N_OPTIONS) {
  const m = M.truthMeans(n), se = M.se(n);
  ok(m.length === 1000, '1000 batches');
  near(M.mean(m), M.MU_TRUE, 3 * se / Math.sqrt(1000) + 1e-9, 'centre at μ for n=' + n);
  const r = M.sd(m) / se; rLo = Math.min(rLo, r); rHi = Math.max(rHi, r);
  const w = m.filter(v => Math.abs(v - M.MU_TRUE) <= 1.96 * se).length / 10; wLo = Math.min(wLo, w); wHi = Math.max(wHi, w);
  ok(m.every(v => v > 486 && v < 510), 'every batch mean inside the histogram axis, n=' + n);
  ok(M.normPdf(0) / se * 0.5 <= 0.36, 'curve peak fits the fixed y-axis, n=' + n);
}
ok(rLo >= 0.955 && rLo < 0.965 && rHi >= 1.045 && rHi < 1.055, `sd ratio range ${rLo}..${rHi}`);
ok(Math.abs(wLo - 94.3) < 1e-9 && Math.abs(wHi - 95.6) < 1e-9, `within ±1.96 SE range ${wLo}..${wHi}`);
both('s1hint', '0.96–1.05'); both('s1hint', '94.3%'); both('s1hint', '95.6%');
for (const n of M.N_OPTIONS) ok(M.SIGMA / Math.sqrt(n) < 3.4, 'SE curve fits the right panel');

// ---- step 2: z-score claims ----
near(M.zScore(497, 16), -2, 1e-12, 'x̄ = 497, n = 16 → z = −2'); checks++;
near(M.se(4), 3, 1e-12, 'SE n=4'); near(M.se(100), 0.6, 1e-12, 'SE n=100'); checks += 2;
both('s2e', 'SE = 3 mL'); both('s2e', 'SE = 0.6 mL'); both('s2hint', '−2.00');
ok(M.normCdf(2) - M.normCdf(-2) > 0.95 && M.normCdf(2) - M.normCdf(-2) < 0.96, '±2 SE holds about 95% (s2hint)');

// ---- step 3: p-value (formula) vs simulation, everywhere on the slider grid ----
near(M.pTwo(-2), 0.0455, 0.00005, 'p at z = −2'); checks++;
both('s3hint', '0.046'); both('quizPrompt', '0.046'); both('quizA', '4.6%'); both('quizB', '4.6%'); both('quizC', '95.4%');
let maxDiff = 0;
for (const n of M.N_OPTIONS) {
  const nm = M.nullMeans(n);
  ok(nm.length === 4000, '4000 null batches');
  for (let i = 0; i <= 100; i++) {
    const x = 494 + i * 0.1, sim = M.simulatedP(x, n, nm), p = M.pTwo(M.zScore(x, n));
    maxDiff = Math.max(maxDiff, Math.abs(sim.frac - p));
    // the stacked bars split exactly into the simulated count
    const d = Math.abs(x - 500); ok(nm.filter(v => Math.abs(v - 500) >= d - 1e-12).length === sim.k, 'pink count = simulated k');
  }
  ok(nm.every(v => v > 488 && v < 512), 'null means inside the drawn axis, n=' + n);
}
ok(maxDiff <= 0.014, `simulation vs formula max diff ${maxDiff}`); both('s3hint', '0.014');
near(M.simulatedP(500, 16).frac, 1, 0, 'x̄ = 500: every batch is at least as far → share 1'); checks++;

// ---- step 4: confidence intervals ----
both('s4e', '1.96');
for (const L of M.LEVELS) for (const n of M.N_OPTIONS) {
  const cov = M.coverageOver(40, n, L);
  ok(Math.abs(cov.frac - L) < 0.03, `coverage over 2000 intervals ≈ level (${L}, n=${n}): ${cov.frac}`);
  for (let s = 0; s < 3; s++) for (const iv of M.intervalSet(s, n, L)) {
    // duality: the interval leaves out 500 exactly when the two-sided p is below 1 − level
    const p = M.pTwo(M.zScore(iv.mean, n));
    if (Math.abs(p - (1 - L)) > 1e-9) ok(!iv.hasClaim === (p < 1 - L), 'CI excludes 500 ⇔ p < α');
  }
}
// same batch means at every level (s4hint: only the widths change)
{ const a = M.intervalSet(2, 16, 0.8), b = M.intervalSet(2, 16, 0.99); a.forEach((iv, i) => near(iv.mean, b[i].mean, 0, 'same samples across levels')); checks++; }
// "about 2–3 pink rows per set" at 95%, n = 16, averaged over the 40 sets the button can draw
{ let miss = 0; for (let s = 0; s < 40; s++) miss += M.intervalSet(s, 16, 0.95).filter(iv => !iv.cover).length; const avg = miss / 40; ok(avg >= 2 && avg <= 3, 'mean misses per set ' + avg); }
both('s4hint', '2–3');
// the widest interval (n = 4, 99%) stays inside the drawn axis 480–516 for nearly every row; it is clipped at the edge otherwise
{ let out = 0, all = 0; for (let s = 0; s < 40; s++) for (const iv of M.intervalSet(s, 4, 0.99)) { all++; if (iv.lo < 480 || iv.hi > 516) out++; } ok(out / all < 0.02, 'clipping rare: ' + out + '/' + all); }

// ---- step 5: significant is not the same as big ----
ok(M.nFromSlider(0) === 4 && M.nFromSlider(1000) === 10000 && M.nFromSlider(177) === 16, 'n slider 4..10000, default 16');
assert.equal(M.nStar(499.5), 554); checks++;
ok(M.typical(499.5, 554).excludes && !M.typical(499.5, 553).excludes, '554 is the first n that leaves 500 out');
ok(M.typical(499.5, 554).p < 0.05 && M.typical(499.5, 553).p >= 0.05, 'p crosses 0.05 at the same n');
both('s5hint', '554');
near(M.typical(498, 16).p, 0.18, 0.005, 'μ = 498, n = 16 → p ≈ 0.18'); checks++; both('s5hint', '0.18');
ok(!M.typical(498, 16).excludes, 'n = 16, 2 mL short: not significant');
ok(0.5 < M.SIGMA / 10, '0.5 mL is under a tenth of σ (s5hint)');
ok(M.nStar(500) === Infinity && M.typical(500, 10000).p === 1, 'μ = 500: never significant, p = 1');
for (let mu = 497; mu <= 500.0001; mu += 0.1) {
  const ns = M.nStar(mu);
  if (Number.isFinite(ns)) for (const n of [ns - 1, ns]) ok(M.typical(mu, n).excludes === (n >= ns), 'nStar boundary at μ=' + mu.toFixed(1));
  // the band fits the y axis 490..507
  ok(M.typical(mu, 4).lo > 490 && M.typical(mu, 4).hi < 507, 'band inside axis');
}
// the interval half-width shrinks with n; the gap does not
ok(M.typical(499.5, 100).half < M.typical(499.5, 16).half, 'half-width shrinks');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['unitML', 'unitZ', 'lv80', 'lv90', 'lv95', 'lv99']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
both('compare', '→');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['draw0', 'run0', 'clear0', 'n1', 'replay1', 'x2', 'n2', 'x3', 'n3', 'replay3', 'checkQuiz', 'lv80', 'lv90', 'lv95', 'lv99', 'n4', 'more4', 'clear4', 'mu5', 'n5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/inference/statistical-inference/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS statistical-inference core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · sd ratio ${rLo.toFixed(3)}–${rHi.toFixed(3)} · sim-vs-formula ${maxDiff.toFixed(4)}`);
