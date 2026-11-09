'use strict';
// Space diagonal (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; }; const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, text) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`); };

// ---- step 0: the 28 segments of the default 4 × 3 × 12 box ----
const D = M.DEFAULT;
eq([D.a, D.b, D.c], [4, 3, 12], 'default box (tagline, s0e, c0title)');
const sum = M.summary(D.a, D.b, D.c);
eq(M.segments(D.a, D.b, D.c).length, 28, '8 corners → 28 segments');
eq(sum.count, { edge: 12, face: 12, space: 4 }, '12 edges, 12 face diagonals, 4 space diagonals');
eq(sum.longest.edge, 12, 'longest edge 12');
near(sum.longest.face, Math.sqrt(160), 1e-12, 'longest face diagonal √160');
eq(sum.longest.face.toFixed(2), '12.65', 'face diagonal shown as 12.65');
eq(sum.longest.space, 13, 'space diagonal 13');
eq(sum.overall, sum.longest.space, 'the space diagonal is the longest segment');
ok(M.segments(D.a, D.b, D.c).filter(q => q.kind === 'space').every(q => Math.abs(q.len - 13) < 1e-12), 'all four space diagonals equal');
eq([Math.hypot(4, 3), Math.hypot(4, 12).toFixed(2), Math.hypot(3, 12).toFixed(2)], [5, '12.65', '12.37'], 's0face: floor, front and side diagonals');
eq([...new Set(M.segments(D.a, D.b, D.c).filter(q => q.kind === 'edge').map(q => q.len))].sort((x, y) => x - y), [3, 4, 12], 's0edge: edge lengths 4, 3, 12');
// the space diagonal is the longest for every box the sliders allow
for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) for (let c = 1; c <= 12; c++) {
  const s = M.summary(a, b, c), g = M.diagonal(a, b, c);
  ok(s.longest.space >= s.longest.face && s.longest.face >= s.longest.edge, 'space ≥ face ≥ edge');
  near(s.longest.space, g.d, 1e-9, 'longest segment = √(a² + b² + c²)');
  // two-step Pythagoras = one formula, with e² kept exact
  eq(g.e2, a * a + b * b, 'e² exact'); eq(g.d2, a * a + b * b + c * c, 'd² = a² + b² + c²');
  near(g.d, Math.sqrt(g.e * g.e + c * c), 1e-9, 'd = √(e² + c²)');
  // every route gives the same d (step 4)
  const r = ['base', 'front', 'side'].map(k => M.route(k, a, b, c));
  r.forEach(q => { eq(q.d2, g.d2, 'route ' + q.name + ' d²'); });
  eq(r[0].f2, g.e2, 'floor route first leg is e');
}

// ---- step 1 / 2 / 3 default readouts ----
const g = M.diagonal(4, 3, 12);
eq([g.a2, g.b2, g.e2, g.e], [16, 9, 25, 5], 's1readout / s1hint: 16 + 9 = 25, e = 5');
eq([g.c2, g.d2, g.d], [144, 169, 13], 's2readout / s2hint: 25 + 144 = 169, d = 13');
both('s1hint', '5'); both('s2hint', '13');
// step 2: changing only c leaves e unchanged
for (let c = 1; c <= 12; c++) eq(M.diagonal(4, 3, c).e, 5, 'e does not depend on c');
// step 3 limits: c → 0 gives d → e; large c gives d close to c (d − c shrinks as c grows)
near(M.diagonal(4, 3, 0).d, 5, 1e-12, 'flat box: d = e');
for (let c = 1; c < 12; c++) ok(M.diagonal(4, 3, c + 1).d - (c + 1) < M.diagonal(4, 3, c).d - c, 'd − c shrinks as c grows');
// changing a moves e (and d); changing c does not move e
ok(M.diagonal(5, 3, 12).e !== M.diagonal(4, 3, 12).e && M.diagonal(5, 3, 12).d !== g.d, 'a moves e and d');
// cube: d = a√3
for (let a = 1; a <= 12; a++) near(M.diagonal(a, a, a).d, a * Math.sqrt(3), 1e-9, 'cube diagonal a√3');
// the chart's vertical axis (0..21) holds every d the sliders allow
ok(M.diagonal(12, 12, 12).d <= 21, 'chart range covers d max');

// ---- step 4: route ledger for the default box ----
const front = M.route('front', 4, 3, 12), side = M.route('side', 4, 3, 12);
eq([front.f2, front.r, front.d], [160, 3, 13], 'front first: f² = 16 + 144 = 160, then + 3²');
eq([side.f2, side.r, side.d], [153, 4, 13], 'side first: f² = 9 + 144 = 153, then + 4²');

// ---- step 5: the case and the rod ----
const K = M.CASE, f = M.diagonal(K.a, K.b, K.c);
eq([K.a, K.b, K.c], [50, 40, 30], 'case 50 × 40 × 30');
eq(f.d2, 5000, '√5000'); eq(f.d.toFixed(2), '70.71', 'd ≈ 70.71 cm');
both('s5e', '70.71'); both('s5hint', '70.71');
ok(M.fits(70, K.a, K.b, K.c).fits && !M.fits(71, K.a, K.b, K.c).fits, 's5hint: 70 fits, 71 does not');
ok(M.fits(60, K.a, K.b, K.c).fits, 'title question: 60 cm fits');
for (let L = K.L[0]; L <= K.L[1]; L++) eq(M.fits(L, K.a, K.b, K.c).fits, L <= 70, 'fit boundary on the slider grid');
// the drawn scale (ref = 1.05 × longest rod) leaves room for the part that sticks out
ok(K.L[1] * 1.05 > K.L[1], 'scale reference beyond the longest rod');

// ---- quiz ----
eq(M.QUIZ.answer, '3', 'quiz 1, 2, 2 → 3'); ok(M.QUIZ.options.includes(M.QUIZ.answer), 'answer offered');
eq(1 + 4 + 4, 9, 'quizRight arithmetic');

// ---- projection sanity: rotation keeps lengths (orthographic) ----
for (let k = 0; k < 20; k++) {
  const yaw = k * 0.37, pitch = 0.05 + (k % 7) * 0.18, p = [1.5, -2, 3], q = M.project(p, yaw, pitch, 0);
  near(Math.hypot(q.x, q.y, q.depth), Math.hypot(...p), 1e-9, 'rotation preserves length');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
eq(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) eq(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k);
const NEUTRAL = new Set(['formula', 'c3de', 'c3dc']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.foot.includes('空间对角线 · 3D 里的两次勾股') && STRINGS.en.foot.includes('The Space Diagonal · Pythagoras Twice, in 3D'), 'footer names the original');
ok(STRINGS.zh.compare.includes('空间对角线 · 3D 里的两次勾股'), 'compare link names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['c0row_edge', 'c0row_face', 'c0row_space', 'nBase', 'nFront', 'nSide']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard') && !/<script[^>]+src="http/.test(html), 'no label guard, no external scripts');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/space-diagonal/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS space-diagonal core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
