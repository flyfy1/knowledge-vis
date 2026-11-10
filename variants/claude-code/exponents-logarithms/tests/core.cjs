'use strict';
// Exponentials & logarithms (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const range = (a, b, s) => { const out = []; for (let i = 0; a + i * s <= b + 1e-9; i++) out.push(+(a + i * s).toFixed(10)); return out; };

// ---- step 0: +3 vs ×2 ----
for (let t = 0; t <= 24; t++) { ok(M.addPlan(t) === 1 + 3 * t, 'A = 1 + 3t'); ok(M.doublePlan(t) === 2 ** t, 'B = 2^t'); }
for (let t = 1; t <= 24; t++) { const c = M.stepChange(t); ok(c.dA === 3 && c.rB === 2, 'A adds 3, B doubles, every hour'); }
ok(M.overtakeHour() === 4, 'B first ahead at hour 4');
ok(M.addPlan(0) === M.doublePlan(0), 'level at hour 0 (leadTie)');
for (let t = 1; t <= 3; t++) ok(M.addPlan(t) > M.doublePlan(t), 'A ahead at hour ' + t);
for (let t = 4; t <= 24; t++) ok(M.doublePlan(t) > M.addPlan(t), 'B stays ahead from hour 4: ' + t); // "ever since hour {over}"
ok(M.doublePlan(24) === 16777216 && M.doublePlan(24) > 1.6e7 && M.doublePlan(24) < 1.7e7, '2^24 is “over sixteen million” / 1600 万');

// ---- step 1: y = a^x over the slider grid ----
for (const a of range(0.25, 3, 0.05)) {
  near(M.pow(a, 0), 1, 0, 'a^0 = 1 (every curve through (0, 1))');
  near(M.pow(a, 0.5) ** 2, a, 1e-12, 'half-step factor squared = a');
  near(M.pow(a, -1), 1 / a, 1e-12, 'a^−1 = 1/a');
  for (const x of range(-3, 2, 0.1)) { near(M.unitRatio(a, x), a, 1e-9, 'one unit right multiplies by a'); ok(M.pow(a, x) > 0, 'a^x > 0'); }
  const tr = M.trend(a); ok(tr === (Math.abs(a - 1) < 1e-12 ? 'flat' : a > 1 ? 'up' : 'down'), 'trend ' + a);
  if (tr === 'up') ok(M.pow(a, 1) > M.pow(a, 0.5), 'rising'); if (tr === 'down') ok(M.pow(a, 1) < M.pow(a, 0.5), 'falling');
}
ok(M.trend(1) === 'flat', 'a = 1 flat');
near(M.pow(2, 0.5), 1.414, 5e-4, '2^0.5 ≈ 1.414 (s1hint)');

// ---- step 2: the reverse question ----
ok(M.log(2, 8) === 3 || M.isWhole(M.log(2, 8)), 'log2 8 = 3'); near(M.log(2, 8), 3, 1e-12, 'log2 8');
near(M.log(2, 32), 5, 1e-12, 'log2 32 = 5'); near(M.log(3, 81), 4, 1e-12, 'log3 81 = 4');
near(M.log(2, 1 / 8), -3, 1e-12, 'log2 1/8 = −3'); near(M.log(10, 1000), 3, 1e-12, 'log10 1000 = 3');
for (const y of [8, 32, 1 / 8]) ok(M.isWhole(M.log(2, y)), 'preset ' + y + ' is exact'); ok(M.isWhole(M.log(3, 81)), '81 exact in base 3');
ok(!M.isWhole(M.log(2, 6)), 'log2 6 is not whole');
near(M.log(2, 6), 2.585, 5e-4, 'log2 6 ≈ 2.585 (s2hint)');
for (const b of [2, 3, 10]) for (const y of range(0.1, 100, 0.1)) {
  const x = M.log(b, y), br = M.bracket(b, y, 8);
  near(M.pow(b, x), y, 1e-9 * Math.max(1, y), 'b^log = y');
  if (br.exact) { ok(M.isWhole(x), 'exact flag only for whole exponents'); continue; }
  ok(br.rows.length === 10, '1 bracket row + 8 halvings + end row');
  ok(br.rows[0].hi - br.rows[0].lo === 1 && M.pow(b, br.rows[0].lo) < y && y < M.pow(b, br.rows[0].hi), 'integer bracket holds y');
  ok(br.lo <= x && x <= br.hi, 'final bracket contains the answer'); near(br.hi - br.lo, 1 / 256, 1e-12, 'width halves 8 times');
  for (const r of br.rows) if (r.mid !== null) ok(r.big === (M.pow(b, r.mid) > y) && r.lo <= x && x <= r.hi, 'each row keeps the answer');
}
{ const br = M.bracket(2, 6, 8); near((br.lo + br.hi) / 2, 2.585, 3e-3, 'bisection centre near 2.585'); }

// ---- step 3: the log ruler ----
near(M.rulerPos(1), 0, 0, 'log2 1 = 0 (n = 1 has no length)'); near(M.rulerPos(2), 1, 1e-12, 'log2 2 = one gap');
for (let m = 1; m <= 32; m++) for (let n = 1; n <= 32; n++) {
  near(M.rulerPos(m * n), M.rulerPos(m) + M.rulerPos(n), 1e-12, 'log(mn) = log m + log n');
  ok(m * n <= 1024 && M.rulerPos(m * n) <= M.RULER_MAX + 1e-12, 'm × n always lands on the ruler');
}
for (let m = 1; m <= 32; m++) for (let k = 1; k <= 5; k++) near(M.rulerPos(m ** k), k * M.rulerPos(m), 1e-9, 'log(m^k) = k log m');
ok(M.rulerPos(8) === 3 && M.rulerPos(4) === 2, 'powers of 2 are whole gaps');

// ---- step 4: log scale, doubling time, change of base ----
for (const r of range(1.05, 3, 0.01)) {
  const T = M.doublingTime(r);
  near(M.growth(r, T), 2, 1e-9, 'r^T = 2');
  for (let k = 1; k * T <= 24; k++) near(M.growth(r, k * T), 2 ** k, 1e-6 * 2 ** k, 'k-th doubling at kT (evenly spaced on log axis)');
  const y = M.growth(r, 24); near(Math.log2(y) / Math.log10(y), M.LOG2_10, 1e-9, 'log2 / log10 = log2 10 for every r');
  ok(M.rule72Close(r) === (Math.abs(M.rule72(r) - T) / T < 0.05), 'rule-of-72 note');
  ok(M.growth(r, 24) > 1, 'log axis starts at 1');
}
near(M.doublingTime(2), 1, 1e-12, 'r = 2 doubles every hour'); near(M.LOG2_10, 3.322, 5e-4, 'log2 10 ≈ 3.32');
ok(M.rule72Close(1.07) && !M.rule72Close(2), 'rule of 72 close near 1.07, off at 2');
near(M.doublingTime(1.07), 10.24, 0.01, 'T(1.07) ≈ 10.24');

// ---- step 5 quiz ----
near(M.QUIZ.q1, -3, 1e-12, 'q1'); near(M.QUIZ.q2, 4, 1e-12, 'q2'); ok(M.QUIZ.q3 === 1048576, 'q3 exact');
ok(M.quizKey('q1') === 'b' && M.quizKey('q2') === 'b' && M.quizKey('q3') === 'c', 'quiz keys from the model');
for (const q of ['q1', 'q2', 'q3']) for (const k of ['a', 'b', 'c']) ok(STRINGS.zh[q + k] && STRINGS.en[q + k], 'option text ' + q + k);

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['q1a', 'q1b', 'q1c', 'formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['t0', 'play0', 'a1', 'x1', 'a1p2', 'a1p1', 'a1ph', 'clear1', 'b2', 'b3', 'b10', 'y2', 'p8', 'p32', 'p6', 'p18', 'bisect2', 'm3', 'n3', 'k3', 'r4', 'axLin', 'axLog', 'tk2', 'tk10', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/algebra/exponents-logarithms/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS exponents-logarithms core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
