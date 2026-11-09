'use strict';
// Perimeter vs area (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: the two ledgers on the 8 × 6 board ----
const S = name => M.stats(M.placed(name, 1, 1), 8, 6);
ok(S('line').area === 6 && S('line').perimeter === 14, 'row of 6: area 6, perimeter 14');
ok(S('block').area === 6 && S('block').perimeter === 10, '2 × 3: area 6, perimeter 10');
ok(S('ell').area === 6 && S('ell').perimeter === 14, 'L of 6: area 6, perimeter 14');
ok(S('ring').area === 8 && S('ring').perimeter === 16 && S('ring').holeCells === 1, 'frame: hole edges count (12 outside + 4 inside)');
// presets fit on the board where the page places them
for (const [name, ox, oy] of [['line', 1, 2], ['block', 2, 2], ['ell', 2, 1], ['ring', 2, 1]]) M.placed(name, ox, oy).forEach(k => { const [x, y] = k.split(',').map(Number); ok(x >= 0 && x < 8 && y >= 0 && y < 6, 'preset on board'); });
// ΔP = 4 − 2 × shared for every add (and the reverse for every lift), exhaustively from random boards
let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const deltas = new Set();
for (let trial = 0; trial < 400; trial++) {
  let cells = new Set(); for (let x = 0; x < 8; x++) for (let y = 0; y < 6; y++) if (rnd() < 0.4) cells.add(M.key(x, y));
  for (let step = 0; step < 10; step++) {
    const x = Math.floor(rnd() * 8), y = Math.floor(rnd() * 6), before = M.stats(cells, 8, 6), r = M.toggle(cells, x, y), after = M.stats(r.cells, 8, 6);
    ok(after.area - before.area === r.dA && Math.abs(r.dA) === 1, 'area moves by exactly 1');
    ok(after.perimeter - before.perimeter === r.dP, 'ΔP = ±(4 − 2 × shared)');
    if (r.added) deltas.add(r.dP);
    cells = r.cells;
  }
}
ok([4, 2, 0, -2, -4].every(d => deltas.has(d)), 'adding a tile can change the perimeter by +4, +2, 0, −2, −4');
// the hint's three cases: touching one → +2, two → 0, three → −2
{
  const c = new Set(['3,3']); ok(M.toggle(c, 4, 3).dP === 2, 'touch one: +2');
  const c2 = new Set(['3,3', '4,4']); ok(M.toggle(c2, 4, 3).dP === 0, 'touch two: 0');
  const c3 = new Set(['3,3', '5,3', '4,4']); ok(M.toggle(c3, 4, 3).dP === -2, 'touch three: −2');
}
ok(M.stats(new Set(['0,0', '2,0']), 8, 6).pieces === 2, 'pieces counted');

// ---- step 1: 24 m rope ----
const rr = M.ropeRects(24);
assert.deepEqual(rr.map(r => r.area), [11, 20, 27, 32, 35, 36, 35, 32, 27, 20, 11]); checks++;
rr.forEach(r => ok(r.perimeter === 24, 'rope always 24'));
ok(rr.length === 11, 'eleven lengths 1..11');
ok(M.rect(5, 7).area === M.rect(7, 5).area && M.rect(5, 7).area === 35, 'length 5 and 7 both 35');

// ---- step 2: stretch the square ----
for (let d = 0; d <= 5; d++) {
  const s = M.stretch(d);
  ok(s.perimeter === 24, 'stretching keeps the perimeter');
  ok(s.area === 36 - d * d && s.lost - s.gained === d * d && s.corner === d * d, 'area = 36 − d²; lost − gained = d²');
  ok(s.area === 36 - s.lost + s.gained, 'square − lost + gained');
}
// the reasoning also holds for non-whole d (boundary text)
for (let d = 0; d <= 6; d += 0.25) { const L = 6 + d, W = 6 - d; ok(Math.abs(L * W - (36 - d * d)) < 1e-12, 'non-whole d'); }

// ---- step 3: fixed area ----
assert.deepEqual(M.fixedArea(24).map(r => [r.L, r.W, r.perimeter]), [[24, 1, 50], [12, 2, 28], [8, 3, 22], [6, 4, 20]]); checks++;
assert.deepEqual(M.fixedArea(36).map(r => r.perimeter), [74, 40, 30, 26, 24]); checks++;
for (const A of [24, 36]) {
  const list = M.fixedArea(A);
  list.forEach(r => ok(r.area === A, 'area fixed'));
  for (let i = 1; i < list.length; i++) ok(list[i].perimeter < list[i - 1].perimeter, 'closer to a square → shorter rope');
}
ok(M.fixedArea(36).at(-1).L === 6 && M.fixedArea(36).at(-1).W === 6, '36 ends at the 6 × 6 square');

// ---- step 4: scaling ----
for (const name of ['rect', 'ell']) {
  const b = M.scaled(name, 1);
  for (let k = 1; k <= 4; k++) { const s = M.scaled(name, k); ok(s.perimeter === k * b.perimeter && s.area === k * k * b.area, `scale ${name} by ${k}`); }
  ok(M.scaled(name, 4).cells.size <= 144, 'fits the 12 × 12 drawing');
}
ok(M.scaled('rect', 1).perimeter === 10 && M.scaled('rect', 1).area === 6, '3 × 2 rectangle');

// ---- step 5: quiz ----
M.QUIZ.forEach(q => ok(q.check() && q.answer >= 0 && q.answer < q.options.length, 'quiz ' + q.id));
ok(M.rect(4, 6).area === 24 && M.rect(10, 10).perimeter === 40, 'q2 explanation numbers');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) M.QUIZ.forEach(q => { ok(STRINGS[l][q.id] && STRINGS[l][q.id + 'why'], 'quiz strings ' + q.id); q.options.forEach(o => ok(o[0] !== '@' || STRINGS[l][o.slice(1)], 'option key ' + o)); });

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['s0add', 's0del', 'opAdd', 'opDel', 'area36', 'area24', 'qOk', 'qNo', 'qNext', 'qRestart']) ok(STRINGS.zh[k] !== undefined, 'key ' + k);
for (const id of ['c0', 'pLine', 'pBlock', 'pEll', 'pRing', 'clear0', 'L1', 'd2', 'move2', 'reset2', 'i3', 'area3', 'k4', 'shapeRect', 'shapeEll', 'qNext']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/perimeter-area/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS perimeter-area core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
