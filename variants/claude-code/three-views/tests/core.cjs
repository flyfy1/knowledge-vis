'use strict';
// Three views (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- parsing and orientation ----
for (const s of Object.values(M.PRESETS)) ok(M.toStr(M.parse(s)) === s, 'parse/toStr round trip ' + s);
{ const h = M.parse('100/000/000'); ok(h[2][0] === 1, 'first group is the back row'); assert.deepEqual(M.left(h), [1, 0, 0]); checks++; } // back row drawn on the left of the left view
{ const h = M.parse('000/000/001'); assert.deepEqual(M.left(h), [0, 0, 1]); assert.deepEqual(M.top(h), [[0, 0, 0], [0, 0, 0], [0, 0, 1]]); assert.deepEqual(M.front(h), [0, 0, 1]); checks += 3; } // front row: right of left view, bottom of top view

// ---- exhaustive checks over all 4^9 piles ----
let total = 0, maxCands = 0;
const counts = { surfaceEq: 0, boundHolds: 0 };
for (let code = 0; code < 262144; code++) {
  const v = []; let c = code; for (let i = 0; i < 9; i++) { v.push(c & 3); c >>= 2; }
  const h = [v.slice(0, 3), v.slice(3, 6), v.slice(6, 9)];
  total++;
  const F = M.front(h), L = M.left(h), T = M.top(h), s = M.surface(h);
  // views: the max rules stated in s1e / formula
  for (let x = 0; x < 3; x++) if (F[x] !== Math.max(h[0][x], h[1][x], h[2][x])) assert.fail('front rule');
  // surface: 6N − 2J = count by direction (s5readout says both give S)
  if (s.S !== s.tb + s.fb + s.lr) assert.fail('6N − 2J ≠ directional count for ' + M.toStr(h));
  // S ≥ 2(F + L + T), with front/back ≥ 2F and left/right ≥ 2L
  if (!(s.fb >= s.fbView && s.lr >= s.lrView && s.S >= s.bound)) assert.fail('bound fails ' + M.toStr(h));
  // equality iff no row or column dips and rises again (padded with zeros)
  const unimodal = a => { const p = [0, ...a, 0]; let down = false; for (let i = 1; i < p.length; i++) { if (p[i] < p[i - 1]) down = true; else if (p[i] > p[i - 1] && down) return false; } return true; };
  const allUni = [0, 1, 2].every(y => unimodal(h[y])) && [0, 1, 2].every(x => unimodal([h[0][x], h[1][x], h[2][x]]));
  if ((s.hidden === 0) !== allUni) assert.fail('equality condition ' + M.toStr(h));
  // extents agree between views (长对正 / 高平齐 / 宽相等)
  const ex = M.extents(h);
  const span = a => { const i = a.map((q, k) => (q ? k : -1)).filter(k => k >= 0); return i.length ? i[i.length - 1] - i[0] + 1 : 0; };
  if (span(F) !== ex.length || span(T.map(r => r.some(q => q) ? 1 : 0)) !== ex.width || span(L) !== ex.width || Math.max(...F) !== ex.height || Math.max(...L) !== ex.height) assert.fail('extents ' + M.toStr(h));
  if (span([0, 1, 2].map(x => T.some(r => r[x]))) !== ex.length) assert.fail('top length');
}
ok(total === 262144, '4^9 = 262144 piles checked (s3e)');
checks += 5;

// ---- step 3: candidate counts quoted on the page ----
for (const [k, s] of Object.entries(M.PRESETS)) {
  const h = M.parse(s), a2 = M.ambiguity(h, false), a3 = M.ambiguity(h, true);
  ok(a2.list.some(q => M.sameArr(q, h)) && a3.list.some(q => M.sameArr(q, h)), 'your pile is among the candidates ' + k);
  ok(a3.n <= a2.n && a3.min >= a2.min && a3.max <= a2.max, 'adding the top view never widens the range ' + k);
  a2.list.forEach(q => { ok(M.sameArr(M.front(q), M.front(h)) && M.sameArr(M.left(q), M.left(h)), 'candidate matches front+left'); });
  // the max arrangement is min(F[x], L[y]) per square
  const F = M.front(h), Ly = [M.left(h)[2], M.left(h)[1], M.left(h)[0]];
  ok(a2.max === [0, 1, 2].reduce((s0, y) => s0 + [0, 1, 2].reduce((s1, x) => s1 + Math.min(F[x], Ly[y]), 0), 0), 'max = Σ min(F, L) ' + k);
  // the brute force over caps equals a brute force over all piles
}
{ // independent enumeration for the default pile
  const h = M.parse(M.PRESETS.L); let n = 0;
  for (let code = 0; code < 262144; code++) { const v = []; let c = code; for (let i = 0; i < 9; i++) { v.push(c & 3); c >>= 2; } const q = [v.slice(0, 3), v.slice(3, 6), v.slice(6, 9)]; if (M.sameArr(M.front(q), M.front(h)) && M.sameArr(M.left(q), M.left(h))) n++; }
  ok(n === M.ambiguity(h, false).n, 'candidate search = full enumeration (' + n + ')');
}
// s3hint: stairs with all three views still has 5 arrangements, 9 to 11 cubes
{ const a = M.ambiguity(M.parse(M.PRESETS.stairs), true); ok(a.n === 5 && a.min === 9 && a.max === 11, 'stairs: 5 arrangements, 9–11 cubes'); }
for (const l of ['zh', 'en']) ok(/5 /.test(STRINGS[l].s3hint) && STRINGS[l].s3hint.includes('9') && STRINGS[l].s3hint.includes('11'), 's3hint quotes the tested numbers');
// two views leave the default pile ambiguous (the step's point)
ok(M.ambiguity(M.parse(M.PRESETS.L), false).n > 1, 'default pile not fixed by two views');

// ---- step 4: each question has exactly one card matching all three views ----
M.QUIZ.forEach((q, i) => {
  const ans = M.parse(q.cards[q.answer]);
  const matches = q.cards.filter(c => M.diffViews(M.parse(c), ans).length === 0);
  ok(matches.length === 1, 'question ' + i + ' has a unique answer');
});
// s4hint: some question has a distractor that matches front and left and differs only in the top view
ok(M.QUIZ.some(q => q.cards.some(c => M.sameArr(M.diffViews(M.parse(c), M.parse(q.cards[q.answer])), ['top']))), 'a top-only distractor exists');

// ---- step 5: the groove preset shows hidden faces, L-shape / tall middle do not (s5hint) ----
ok(M.surface(M.parse(M.PRESETS.valley)).hidden > 0, 'groove hides faces');
ok(M.surface(M.parse(M.PRESETS.L)).hidden === 0 && M.surface(M.parse(M.PRESETS.middle)).hidden === 0, 'L-shape and tall middle hide none');
// bars fit the axis (max 60 unless S > 60, rounded up to 10)
for (const s of Object.values(M.PRESETS)) ok(M.surface(M.parse(s)).S <= 60, 'preset surfaces fit the default axis');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys and controls ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(p[A-Z][a-zA-Z]+|row[BMF]|v(?:Front|Left|Top)|i2(?:Len|Ht|Wd)|s1read[FLT])'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'dynamic key ' + m[1]);
for (const id of ['grid0', 'dirF', 'dirL', 'dirT', 'p1', 'play1', 'rLen', 'rHt', 'rWd', 'i2', 'top3', 'min3', 'max3', 'next3', 'mine3', 'check4', 'next4']) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/three-views/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS three-views core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · 262144 piles`);
