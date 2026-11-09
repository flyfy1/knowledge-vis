'use strict';
// Area-model multiplication (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: rows of eggs ----
for (let r = 1; r <= 10; r++) for (let c = 2; c <= 12; c++) {
  const R = M.rows(r, c, false);
  ok(R.total === r * c && R.product === r * c, 'r × c = count');
  ok(R.running.length === r && R.running[r - 1] === r * c, 'r additions reach r × c');
  R.running.forEach((v, i) => ok(v === (i + 1) * c, 'running total is a multiple of c'));
  ok(r <= R.total, 'row by row never needs more steps than one by one');
  const U = M.rows(r, c, true);
  ok(!U.even && U.total === r * c - 1 && U.product - U.total === 1, 'uneven: the product is one too many');
}

// ---- step 1: area and the quarter turn ----
for (let a = 1; a <= 12; a++) for (let b = 1; b <= 10; b++) {
  let n = 0; for (let i = 0; i < b; i++) for (let j = 0; j < a; j++) n++;
  ok(M.area(a, b) === n && M.area(b, a) === n, 'tiles counted = a × b = b × a');
}

// ---- step 2: one cut, any place ----
for (let R = 2; R <= 9; R++) for (let K = 11; K <= 19; K++) for (let k = 1; k < K; k++) {
  const s = M.split(R, K, k);
  ok(s.left + s.right === R * K && s.total === s.whole, 'two blocks add back to the whole');
}
ok(M.split(7, 13, 10).left === 70 && M.split(7, 13, 10).right === 21, '7 × 13 cut at 10 = 70 + 21');

// ---- step 3: four blocks and the column method ----
for (let m = 11; m <= 29; m++) for (let n = 11; n <= 29; n++) {
  const F = M.fourBlocks(m, n);
  ok(F.total === m * n, `four blocks sum to ${m} × ${n}`);
  ok(F.line1 + F.line2 === m * n, 'column method lines add to the product');
  const A = Object.fromEntries(F.blocks.map(b => [b.key, b.area]));
  ok(F.line1 === A.to + A.oo && F.line2 === A.tt + A.ot, 'line 1 = right-hand blocks, line 2 = left-hand blocks');
  ok(F.A.tens + F.A.ones === m && F.B.tens + F.B.ones === n, 'tens + ones');
  if (F.B.ones === 0) ok(A.to === 0 && A.oo === 0, 'ones digit 0: that strip has no width');
}
assert.deepEqual(M.fourBlocks(12, 13).blocks.map(b => b.area), [100, 30, 20, 6]); checks++;
ok(M.fourBlocks(12, 13).total === 156, '12 × 13 = 156');
assert.deepEqual(M.fourBlocks(23, 15).blocks.map(b => b.area), [200, 100, 30, 15]); checks++;

// ---- step 4: tiling and factor pairs ----
for (let N = 1; N <= 48; N++) {
  const pairs = M.factorPairs(N);
  for (let w = 1; w <= 12; w++) {
    const T = M.tiling(N, w);
    ok(T.q * w + T.r === N && T.r < w, 'N = q·w + r with r < w');
    ok(T.exact === (N % w === 0), 'exact iff w divides N');
    if (!T.exact) ok(T.missing === w - T.r && T.cols === T.q + 1, 'missing slots in the last column');
    if (T.exact) ok(pairs.some(([p, q]) => M.pairKey(N, w) === p + '×' + q), 'pair key matches a listed pair');
  }
  // every pair can be found with w ≤ 12 (the slider range)
  ok(pairs.every(([p]) => p <= 12), 'smaller factor within the w slider for N = ' + N);
  pairs.forEach(([p, q]) => ok(p * q === N && p <= q, 'pair'));
}
assert.deepEqual(M.factorPairs(24), [[1, 24], [2, 12], [3, 8], [4, 6]]); checks++;
ok(M.factorPairs(13).length === 1, '13 is prime');
ok(M.pairKey(24, 8) === M.pairKey(24, 3), 'w = 8 and w = 3 are the same pair (hint)');
ok(M.factorPairs(36).length === 5, '36 has five pairs');

// ---- step 5: quiz answers ----
M.QUIZ.forEach(q => ok(q.check() && q.answer >= 0 && q.answer < q.options.length, 'quiz ' + q.id));
ok(M.QUIZ[1].options[M.QUIZ[1].answer].split(' + ').map(Number).reduce((s, v) => s + v, 0) === 23 * 15, 'q2 option sums to 345');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) M.QUIZ.forEach(q => ok(STRINGS[l][q.id] && STRINGS[l][q.id + 'why'], 'quiz strings ' + q.id));

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['showDots', 'showTiles', 'qOk', 'qNo', 'qNext', 'qRestart']) ok(STRINGS.zh[k] !== undefined, 'key ' + k);
for (const id of ['r0', 'c0n', 'count1', 'countRow', 'uneven0', 'a1', 'b1', 'tiles1', 'rotate1', 'r2', 'k2', 'x2', 'm3', 'n3', 'light3', 'all3', 'n4', 'w4', 'qNext']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/area-model/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS area-model core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
