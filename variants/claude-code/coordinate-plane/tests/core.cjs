'use strict';
// Coordinate plane (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; }; const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const R = []; for (let v = M.LO; v <= M.HI; v++) R.push(v);

// ---- address format: true minus, half-width brackets, comma + space, no "+" on positives ----
eq(M.fmtCoord(3, -2), '(3, −2)', 'fmtCoord');
eq(M.fmtCoord(0, 0), '(0, 0)', 'origin');
eq(M.fmtCoord(-4, 5), '(−4, 5)', 'second quadrant');
ok(!M.fmtCoord(6, 6).includes('+'), 'no plus sign');

// ---- step 0: candidate counts ----
for (const x of R) {
  eq(M.candidates('line', x, null).length, 1, 'on a line one number pins the point');
  eq(M.candidates('plane', x, null).length, M.SIDE, 'on a plane one number leaves a column of 13');
  ok(M.candidates('plane', x, null).every(p => p[0] === x), 'the column is x = clue');
  for (const y of R) eq(M.candidates('plane', x, y), [[x, y]], 'two numbers pin the point');
}
eq(M.SIDE, 13, 's0hint: a whole column of 13');

// ---- step 1: walking across first, then up or down ----
for (const x of R) for (const y of R) {
  const w = M.walk(x, y);
  eq(w.legs[0], [[0, 0], [x, 0]], 'leg 1 along the x-axis');
  eq(w.legs[1], [[x, 0], [x, y]], 'leg 2 parallel to the y-axis');
  eq(w.steps, Math.abs(x) + Math.abs(y), 'units walked');
}

// ---- step 2: moving the origin ----
const LM = Object.fromEntries(M.LANDMARKS.map(l => [l.id, l.p]));
eq(LM, { house: [2, 3], tree: [-4, 1], well: [1, -3] }, 'landmarks');
for (let ox = M.ORIGIN_RANGE[0]; ox <= M.ORIGIN_RANGE[1]; ox++) for (let oy = M.ORIGIN_RANGE[0]; oy <= M.ORIGIN_RANGE[1]; oy++) {
  const h = M.address(LM.house, ox, oy), w = M.address(LM.well, ox, oy);
  eq([h[0] - w[0], h[1] - w[1]], [1, 6], 's2diff: house − well is (1, 6) for every origin');
  eq(M.address(LM.house, ox + 1 > 3 ? ox : ox + 1, oy)[0], ox + 1 > 3 ? h[0] : h[0] - 1, 's2hint: origin one right → x one smaller');
  eq(M.address([ox, oy], ox, oy), [0, 0], 'the new origin has address (0, 0)');
  // every landmark stays inside the drawn grid (absolute −6..6) whatever the origin
  M.LANDMARKS.forEach(l => ok(l.p.every(v => v >= M.LO && v <= M.HI), 'landmark on the grid'));
}

// ---- step 3: swapping ----
for (const a of R) for (const b of R) {
  const [x, y] = M.swap(a, b);
  eq([x, y], [b, a], 'swap');
  ok(M.sameAfterSwap(a, b) === (a === b), 'same point after swap only when a = b');
  // the swapped point is the mirror image across y = x: midpoint on the diagonal, segment perpendicular to it
  ok((a + x) / 2 === (b + y) / 2, 'midpoint on the diagonal');
  ok((x - a) + (y - b) === 0, 'A→A′ is perpendicular to the diagonal');
}
eq(M.swap(3, 1), [1, 3], 'step 3 default: (3, 1) ↔ (1, 3)');

// ---- step 4: quadrants (4 quadrants × 2 points, 2 + 2 axis points, origin) ----
const cases = [[[2, 3], 'I'], [[6, 1], 'I'], [[-2, 3], 'II'], [[-6, 6], 'II'], [[-1, -1], 'III'], [[-5, -2], 'III'], [[4, -3], 'IV'], [[1, -6], 'IV'],
  [[3, 0], 'xAxis'], [[-6, 0], 'xAxis'], [[0, 2], 'yAxis'], [[0, -4], 'yAxis'], [[0, 0], 'origin']];
for (const [[x, y], q] of cases) eq(M.quadrant(x, y), q, `quadrant(${x}, ${y})`);
for (const x of R) for (const y of R) {
  const q = M.quadrant(x, y);
  if (M.SIGNS[q]) eq(M.SIGNS[q], [M.sign(x), M.sign(y)], 'signs of a quadrant = signs of x and y');
  else ok(x === 0 || y === 0, 'no quadrant only on an axis');
}
eq(Object.keys(M.SIGNS), ['I', 'II', 'III', 'IV'], 'four quadrants');

// ---- step 5: quiz answers ----
const Q = M.QUIZ;
ok(M.samePoint(Q.q1.options[Q.q1.answer], Q.q1.p), 'q1 answer equals P');
ok(Q.q1.options.some(p => M.samePoint(p, M.swap(...Q.q1.p))), 'q1 offers the swapped trap');
eq(M.quadrant(...Q.q1.p), 'III', 'P in the third quadrant');
eq(M.quadrant(...Q.q2.target), 'II', 'right2: (−2, 3) in the second quadrant');
eq(Q.q3.answer, 'different', 'q3: (4, 1) and (1, 4) differ');
eq([Math.abs(Q.q3.a[0] - Q.q3.b[0]), Math.abs(Q.q3.a[1] - Q.q3.b[1])], [3, 3], 'right3: 3 across and 3 up');
for (const l of ['zh', 'en']) { ok(STRINGS[l].right1.includes('(−4, −3)'), 'right1 quotes P'); ok(STRINGS[l].q2.includes('(−2, 3)'), 'q2 target'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
eq(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) eq(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k);
const NEUTRAL = new Set(['c1x', 'c1y', 'c1o', 'c5p', 's3lgA']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.foot.includes('坐标系 · 点的地址') && STRINGS.en.foot.includes('The Coordinate Plane · Addresses for Points'), 'footer names the original');
ok(STRINGS.zh.compare.includes('坐标系 · 点的地址'), 'compare link names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/data-i18n="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app html key ' + m[1]);
for (const k of ['right1', 'right2', 'right3', 'wrong1', 'wrong2', 'wrong3', 'noChoice', 's4origin', 's4xAxis', 's4yAxis']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/coordinate-plane/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS coordinate-plane core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
