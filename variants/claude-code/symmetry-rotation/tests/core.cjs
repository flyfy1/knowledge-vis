'use strict';
// Symmetry & rotation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, ...needles) => { for (const l of ['zh', 'en']) for (const n of needles) ok(STRINGS[l][key].includes(n), `${l}.${key} quotes ${n}`); };

// ---- the table of axes and turns (steps 1, 2, quiz) ----
const AX = { square: [0, 45, 90, 135], rect: [0, 90], equilateral: [30, 90, 150], isosceles: [90], scalene: [], parallelogram: [], pentagon: [18, 54, 90, 126, 162], hexagon: [0, 30, 60, 90, 120, 150], pinwheel3: [], pinwheel4: [] };
const ORD = { square: 4, rect: 2, equilateral: 3, isosceles: 1, scalene: 1, parallelogram: 2, pentagon: 5, hexagon: 6, pinwheel3: 3, pinwheel4: 4 };
for (const [name, axes] of Object.entries(AX)) {
  assert.deepEqual(M.axes(name), axes, 'axes of ' + name); checks++;
  ok(M.order(name) === ORD[name], 'order of ' + name);
  assert.deepEqual(M.turns(name), Array.from({ length: ORD[name] }, (_, i) => 360 / ORD[name] * (i + 1)), 'turns of ' + name); checks++;
  // brute force: no mirror line missed between the candidates (every half degree)
  for (let a = 0; a < 180; a += 0.5) ok(M.isAxis(name, a) === axes.some(b => Math.abs(b - a) < 1e-6), `axis scan ${name} ${a}`);
  ok(Math.abs(M.centre(M.SHAPES[name])[0]) < 1e-9 && Math.abs(M.centre(M.SHAPES[name])[1]) < 1e-9, 'centred ' + name);
}
ok(M.axes('circle') === Infinity && M.order('circle') === Infinity && M.isAxis('circle', 37), 'circle: infinitely many');
for (const n of ['pentagon', 'hexagon', 'square', 'equilateral']) ok(M.axes(n).length === M.order(n), 'regular polygon: lines = sides = order');
// step 3 claim: two lines of symmetry at angle θ ⇒ a matching turn of 2θ
for (const n of Object.keys(AX)) { const a = M.axes(n); for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length; j++) if (i !== j) ok(M.turnsOnto(n, ((2 * (a[j] - a[i])) % 360 + 360) % 360 || 360), 'two axes give a turn ' + n); }
// the converse fails: pinwheels and the parallelogram turn but have no axis
for (const n of ['pinwheel3', 'pinwheel4', 'parallelogram']) ok(M.axes(n).length === 0 && M.order(n) > 1, 'turns without axes: ' + n);

// ---- step 0: fold mismatch is 0 exactly on an axis and clearly visible elsewhere ----
const fold = [...html.matchAll(/id="a0"[^>]*min="(\d+)" max="(\d+)" step="(\d+)"/g)][0].slice(1).map(Number);
let minOff = 1;
for (const name of ['rect', 'isosceles', 'parallelogram', 'scalene']) for (let a = fold[0]; a <= fold[1]; a += fold[2]) {
  const mis = M.foldMismatch(name, a);
  if (M.isAxis(name, a)) ok(mis === 0, `fold on an axis leaves 0%: ${name} ${a}`);
  else { ok(mis > 0.1, `fold off an axis leaves > 10%: ${name} ${a}`); minOff = Math.min(minOff, mis); }
}
ok(M.isAxis('rect', 0) && !M.isAxis('rect', 30), 's0hint: rectangle 0° yes, 30° no');
both('s0hint', '0°', '30°', '165°');
for (const n of ['square', 'rect', 'equilateral', 'isosceles', 'pentagon', 'hexagon']) for (const a of M.axes(n)) ok(M.foldMismatch(n, a) === 0, 'sweep axes give 0 mismatch');

// ---- step 2 / 3 / 4 claims ----
ok(M.turns('parallelogram')[0] === 180 && M.turns('pinwheel4')[0] === 90, 's2hint: parallelogram 180°, 4-blade pinwheel 90°');
both('s2hint', '180°', '90°');
for (let th = 15; th <= 90; th += 15) { const T = M.twoMirrors(th); ok(T.equal && T.angle === 2 * th, 'two flips = turn 2θ at θ = ' + th); ok(!M.same(T.once, T.turned), 'one flip is not the turn'); }
for (let th = 1; th < 180; th += 7) ok(M.twoMirrors(th, M.placeFlag(1.1, 200)).equal, 'any θ, any start');
both('s3e', '90°', '180°'); both('s3hint', '90°', '180°', '45°');
// the flag is lopsided: its mirror image never coincides with a turned copy
for (let a = 0; a < 360; a += 1) ok(!M.same(M.FLAG.map(p => M.refl(p, 0)), M.FLAG.map(p => M.rot(p, a))), 'flag is chiral');
for (const n of [2, 3, 4, 5, 6, 8]) for (const mirror of [true, false]) {
  const st = [{ r: 0.9, a: 7 }, { r: 0.5, a: 15 }], copies = M.kaleido(st, n, mirror);
  ok(copies.length === st.length * n * (mirror ? 2 : 1), 'copies = stamps × n (× 2)');
  const sym = M.patternSymmetry(st, n, mirror);
  ok(sym.order === n && sym.turns[0] === 360 / n, `pattern turns every 360/n, n = ${n}`);
  ok(sym.axes.length === (mirror ? n : 0), `pattern axes = ${mirror ? 'n' : '0'}, n = ${n}`);
}
ok(M.STAMPS.length === 2, 'two preset stamps');

// ---- quiz ----
const A = M.quizAnswers();
ok(A[0] === 1 && !M.turnsOnto('rect', 90), 'q1: no');
ok(M.QUIZ.q2.options[A[1]] === 'parallelogram' && M.QUIZ.q2.options.filter(s => M.axes(s).length === 0 && M.order(s) > 1).length === 1, 'q2: only the parallelogram');
ok(M.axes('isosceles').length === 1 && M.order('isosceles') === 1 && M.axes('equilateral').length > 0 && M.order('equilateral') > 1, 'qz2ok explanation');
ok(M.QUIZ.q3.options[A[2]] === 60, 'q3: 60°');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['opDeg']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.foot.includes('对称与旋转 · 对折与转圈') && STRINGS.en.foot.includes('Symmetry & Rotation · Folding and Turning'), 'footer names the original');
ok(STRINGS.zh.compare.includes('对照另一版本：对称与旋转 · 对折与转圈'), 'compare link text');
for (const n of Object.keys(M.SHAPES)) ok(STRINGS.zh['shp_' + n] && STRINGS.en['shp_' + n], 'shape name ' + n);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const n of [1, 2, 3]) for (const s of ['ok', 'no']) ok(STRINGS.zh['qz' + n + s] !== undefined, 'quiz feedback key');
for (const id of ['a0', 'fold0', 'unfold0', 'sweep1', 'r2', 'spin2', 'th3', 'play3', 'n4', 'sr4', 'sa4', 'mirror4', 'stamp4', 'clear4', 'qz1c', 'qz2c', 'qz3c']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');
ok(/<meta name="stage" content="primary">/.test(html) && /<meta name="category" content="math">/.test(html), 'stage and category match the original');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/symmetry-rotation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS symmetry-rotation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · smallest off-axis fold mismatch ${(minOff * 100).toFixed(1)}%`);
