'use strict';
// Negative numbers (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS: RAW } = require(path.join(dir, 'i18n.js'));
// Maths in the strings uses no-break spaces so expressions never wrap; compare with plain spaces.
const STRINGS = Object.fromEntries(Object.entries(RAW).map(([l, d]) => [l, Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.replace(/\u00a0/g, ' ')]))]));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; }; const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };

// ---- step 0: side and distance; the twin on the other side ----
for (let v = -8; v <= 8; v++) {
  const d = M.describe(v);
  eq(d.dist, Math.abs(v), 'distance from 0');
  eq(d.side, v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero', 'side of 0');
  ok(d.twin + v === 0 && Math.abs(d.twin) === d.dist, 'twin is just as far on the other side');
}
eq(M.describe(-3).side, 'neg', 's0e: 3 m below the sea is −3');
eq(M.describe(0).side, 'zero', '0 is neither positive nor negative');

// ---- step 1: a different zero rewrites numbers but keeps distances ----
const S = M.SCENE;
eq([S.bird, S.fish, S.deck, S.seabed], [4, -3, 2, -6], 'scene heights quoted in s1e');
for (let r = -6; r <= 6; r++) {
  const vb = M.relabel(S.bird, r), vf = M.relabel(S.fish, r);
  eq(vb - vf, 7, 'gull–fish gap is 7 m for every zero (s1hint, s1readout)');
  if (r < 6) ok(M.relabel(S.bird, r + 1) < vb && M.relabel(S.fish, r + 1) < vf, 'higher zero → both numbers smaller (s1hint)');
}
ok(M.relabel(S.fish, S.seabed) > 0, 'zero on the sea floor makes the fish positive (s1hint)');
eq(M.relabel(S.fish, S.seabed), 3, 'fish relative to sea floor');
eq(M.relabel(S.bird, S.deck), 2, 'gull relative to deck');

// ---- step 2: comparison by position ----
const cmp = [[-5, -1, -1], [-1, 0, -1], [0, 3, -1], [-3, -3, 0], [-7, -2, -1], [-9, -4, -1], [4, -10, 1]];
for (const [a, b, r] of cmp) eq(M.compare(a, b), r, `compare(${a}, ${b})`);
ok(M.digitRule(-7, -2) > 0 && M.compare(-7, -2) < 0, 'the digits-only rule gets −7 vs −2 backwards (s2e, s2trap)');
eq(-2 - -7, 5, 's2less: −7 is 5 marks left of −2');
eq(M.sorted(M.CARDS), [-10, -7, -2, 0, 4, 9], 'cards sorted by position');
// alternate rows: same-row neighbours are always at least 6 units apart, so cards never touch at 320 px
{ const o = M.sorted(M.CARDS); for (let i = 2; i < o.length; i++) ok(o[i] - o[i - 2] >= 6, 'same-row card gap'); }
// every slider pair in step 2: trap note appears exactly when |lo| > |hi| for lo < hi
for (let a = -10; a <= 10; a++) for (let b = -10; b <= 10; b++) {
  if (a === b) continue;
  const lo = Math.min(a, b), hi = Math.max(a, b);
  ok((M.digitRule(lo, hi) > 0) === (Math.abs(lo) > Math.abs(hi)), 'trap condition');
}

// ---- step 3: walks ----
const walks = [[3, -1, 5, -2], [-2, 1, 5, 3], [-1, -1, 4, -5], [-4, 1, 3, -1], [0, -1, 3, -3]];
for (const [s, d, n, e] of walks) eq(M.walk(s, d, n).end, e, `walk ${s} ${d > 0 ? '+' : '−'} ${n}`);
eq(M.walk(3, -1, 5).zeroAt, 3, 's3e/s3hint: from 3 walking left, hop 3 reaches 0');
ok(M.walk(3, -1, 5).crosses, '3 − 5 crosses 0');
ok(!M.walk(-4, 1, 3).crosses && M.walk(-4, 1, 3).zeroAt === null, '−4 + 3 stays left of 0 (moves towards 0)');
for (let n = 1; n <= 8; n++) eq(M.walk(3, -1, n).end, 3 - n, 's3hint: landing creeps left one mark per hop');
// every slider state lands inside the drawn axis −16..16; the path is one mark per hop
for (let s = -8; s <= 8; s++) for (const d of [1, -1]) for (let n = 0; n <= 8; n++) {
  const w = M.walk(s, d, n);
  ok(w.end >= M.WALK.axis[0] && w.end <= M.WALK.axis[1], 'landing inside the axis');
  const ax = M.axisFor(s, w.end); ok(ax[0] < Math.min(s, w.end) && ax[1] > Math.max(s, w.end) && ax[0] <= -8 && ax[1] >= 8 && ax[0] >= -17 && ax[1] <= 17, 'drawn axis covers start and landing');
  ok(w.path.length === n + 1 && w.path.every((v, i) => !i || Math.abs(v - w.path[i - 1]) === 1), 'one mark per hop');
  eq(w.end, s + d * n, 'landing = start + signed steps');
}

// ---- step 4: temperature change, split at 0 ----
const c = M.change(-3, 5);
eq([c.delta, c.below, c.above, c.size, c.crosses], [8, 3, 5, 8, true], 's4e: −3 → 5 is 3 + 5 = 8');
eq(M.change(-3, -8).delta, -5, 's4hint: dropping to −8 is a fall');
ok(!M.change(-3, -8).crosses && M.change(-3, -8).above === 0, 'same side of 0: one stretch');
for (let m = -10; m <= 10; m++) for (let n = -10; n <= 10; n++) {
  const q = M.change(m, n);
  eq(q.below + q.above, q.size, 'two stretches add to the whole');
  eq(q.size, Math.abs(n - m), 'size = distance on the line');
  ok(q.crosses === (Math.min(m, n) < 0 && Math.max(m, n) > 0), 'crosses only when straddling 0');
}

// ---- step 5: quiz answers come from the model ----
eq(M.QUIZ.q1.answer, '-6', 'q1'); ok(M.QUIZ.q1.options.includes(M.QUIZ.q1.answer), 'q1 option');
eq(M.QUIZ.q2.answer, '-9', 'q2'); ok(M.QUIZ.q2.options.includes(M.QUIZ.q2.answer), 'q2 option');
eq(M.QUIZ.q3.answer, '7', 'q3'); ok(M.QUIZ.q3.options.includes(M.QUIZ.q3.answer), 'q3 option');
eq(M.change(-3, 4).below, 3, 'q3 feedback: 3 below'); eq(M.change(-3, 4).above, 4, 'q3 feedback: 4 above');
eq(-4 - -9, 5, 'correct2: −9 is 5 marks left of −4');

// ---- finale formula lines ----
eq(3 - 5, -2, 'formula 3 − 5'); eq(-4 + 3, -1, 'formula −4 + 3');
for (const l of ['zh', 'en']) ok(STRINGS[l].formula.includes('3 − 5 = −2') && STRINGS[l].formula.includes('−4 + 3 = −1') && STRINGS[l].formula.includes('3 + 5 = 8'), 'formula text matches the model');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
eq(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) eq(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k);
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.foot.includes('负数 · 0 以下的世界') && STRINGS.en.foot.includes('Negative Numbers · The World Below Zero'), 'footer names the original');
ok(STRINGS.zh.compare.includes('负数 · 0 以下的世界'), 'compare link names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['correct1', 'correct2', 'correct3', 'wrong1', 'wrong2', 'wrong3', 'noChoice']) ok(STRINGS.zh[k] !== undefined, 'quiz key ' + k);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/negative-numbers/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS negative-numbers core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
