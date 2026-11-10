'use strict';
// Binary search (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, zh, en) => { for (const s of zh) ok(STRINGS.zh[key].includes(s), `zh.${key} quotes "${s}"`); for (const s of en) ok(STRINGS.en[key].includes(s), `en.${key} quotes "${s}"`); };

// ---- step 0: guessing 1..100 ----
let worst = 0;
for (let s = 1; s <= 100; s++) {
  const g = M.halvingRun(s); worst = Math.max(worst, g.length); ok(g[g.length - 1] === s, 'halving ends on the secret');
}
assert.equal(worst, 7); assert.equal(M.worstQuestions(100), 7); checks += 2;
// the worst-case chain 100 → 50 → 25 → 12 → 6 → 3 → 1 quoted in s0e: largest surviving range after each middle guess
{ let size = 100; const chain = [size]; while (size > 1) { size = Math.max(Math.floor((size - 1) / 2), size - 1 - Math.floor((size - 1) / 2)); chain.push(size); } assert.deepEqual(chain, [100, 50, 25, 12, 6, 3, 1]); checks++; }
both('s0e', ['100 → 50 → 25 → 12 → 6 → 3 → 1', '7 次'], ['100 → 50 → 25 → 12 → 6 → 3 → 1', '7 questions']);
// answers only ever shrink the range, and a guess outside it leaves it unchanged
for (let s = 1; s <= 100; s += 7) for (let g = 1; g <= 100; g += 3) { const r = M.answer({ lo: 40, hi: 70 }, Math.max(40, Math.min(70, s)), g); ok(r.lo >= 40 && r.hi <= 70, 'range only shrinks'); if ((g < 40 || g > 70) && r.ans !== 'hit') ok(r.hi - r.lo === 30, 'outside guess changes nothing'); }
for (let seed = 1; seed <= 97; seed++) { const s = M.secret(seed); ok(s >= 1 && s <= 100, 'secret in range'); }

// ---- step 1: the correct loop ----
assert.equal(M.ARR.length, 24); checks++;
ok(M.ARR.every((v, i) => !i || M.ARR[i - 1] < v), 'sorted, distinct');
for (let x = 1; x <= 100; x++) {
  const r = M.search(M.ARR, x), truth = M.ARR.indexOf(x);
  ok(r.found === truth && !r.loop, 'correct answer for ' + x);
  ok(r.steps.length <= 5, 'at most 5 looks for 24 numbers');
  // invariant: if present, the target is inside [lo, hi] at every step
  if (truth >= 0) r.steps.forEach(st => ok(st.lo <= truth && truth <= st.hi, 'invariant'));
  else { ok(r.lo === r.hi + 1, 'ends with lo = hi + 1'); const ins = M.ARR.findIndex(v => v > x); ok(r.lo === (ins < 0 ? 24 : ins), 'lo is the insertion point'); }
}
ok(M.ARR.includes(61) && !M.ARR.includes(62), 's1hint examples: 61 present, 62 absent');
assert.equal(M.worstSearch(24), 5); checks++;

// ---- step 2: growth ----
for (const n of [1, 2, 3, 7, 8, 15, 16, 31, 32, 100, 1000, 1024, 4095, 4096]) { const p = M.profile(n); assert.equal(p.max, M.worstSearch(n)); assert.equal(p.maxMiss, M.worstSearch(n)); checks += 2; }
assert.equal(M.worstSearch(1000), 10); assert.equal(M.worstSearch(1e6), 20); assert.equal(M.worstSearch(1e9), 30); checks += 3;
for (let p = 0; p <= 9; p += 0.01) { const n = Math.round(10 ** p); ok(M.worstSearch(n) === Math.floor(Math.log2(n)) + 1 && M.worstSearch(n) <= 30, 'staircase'); }
both('s2hint', ['10、20、30', '2¹⁰ = 1024'], ['10, 20 and 30', '2¹⁰ = 1024']);

// ---- step 3: four versions ----
const G = Object.fromEntries(M.VARIANTS.map(v => [v, M.grade(v)]));
ok(G.ok.every(o => o === 'right'), 'correct version gets all 17 right');
const at = (v, x) => G[v][M.TARGETS.indexOf(x)];
assert.equal(M.TARGETS.length, 17); assert.equal(M.TARGETS.filter(x => M.SMALL.includes(x)).length, 8); checks += 2;
ok(at('loMid', 80) === 'loop', 'lo = mid loops on 80');
{ const r = M.search(M.SMALL, 80, 'loMid', 12); const last = r.steps.at(-1); ok(last.hi - last.lo === 1 && last.mid === last.lo, 'stuck with two cells, mid = lo'); }
ok(!G.ltHi.includes('loop'), 'lo < hi never loops');
assert.deepEqual(M.TARGETS.filter((x, i) => G.ltHi[i] === 'wrong'), [10, 30, 50, 80]); checks++;
ok(at('hiMid', 5) === 'loop', 'hi = mid loops below everything');
ok(G.loMid.includes('loop') && G.hiMid.includes('loop'), 'both mid-not-excluded versions loop somewhere');
both('s3hint', ['10、30、50、80', '目标 80'], ['10, 30, 50 and 80', 'target 80']);

// ---- step 4: duplicates ----
const D = M.DUP;
for (let x = 0; x <= 26; x++) {
  const lb = M.bound(D, x, false), ub = M.bound(D, x, true);
  ok(lb.idx === (D.findIndex(v => v >= x) < 0 ? D.length : D.findIndex(v => v >= x)), 'left boundary');
  ok(ub.idx === (D.findIndex(v => v > x) < 0 ? D.length : D.findIndex(v => v > x)), 'right boundary');
  ok(ub.idx - lb.idx === D.filter(v => v === x).length, 'count = ub − lb');
  ok(lb.steps.length >= 4 && lb.steps.length <= 5 && ub.steps.length >= 4 && ub.steps.length <= 5, '4 or 5 looks');
  const any = M.search(D, x); ok(any.found < 0 ? !D.includes(x) : D[any.found] === x, 'step 1 algorithm finds some copy');
}
{ const lb = M.bound(D, 15, false).idx, ub = M.bound(D, 15, true).idx; assert.equal(lb, 8); assert.equal(ub, 12); assert.equal(M.search(D, 15).found, 11); checks += 3; }
for (const x of [5, 13]) ok(M.bound(D, x, false).idx === M.bound(D, x, true).idx, 'missing value: boundaries coincide');

// ---- step 5: bisection ----
for (let c = 2; c <= 10; c += 0.5) {
  const rows = M.bisect(c, 40), s = Math.sqrt(c);
  rows.forEach((r, k) => { ok(r.lo <= s && s <= r.hi, 'brackets √c'); ok(Math.abs((r.hi - r.lo) - c / 2 ** k) <= 1e-12 * c, 'width c/2^k'); });
}
{ const r = M.bisect(2, 30); assert.equal(M.sharedDigits(r[10].lo, r[10].hi), 2); assert.equal(M.sharedDigits(r[20].lo, r[20].hi), 5); assert.equal(M.sharedDigits(r[30].lo, r[30].hi), 8); checks += 3; }
ok(1024 === 2 ** 10, '10 questions shrink 1024-fold');
both('s5hint', ['2、5、8'], ['2, 5 and 8']);

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['nav1', 'vshort_loMid', 'vshort_ltHi', 'vshort_hiMid']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/(左图|右图|left chart|right chart|left panel|right panel)/i.test(v), 'no left/right chart wording in ' + k);

// ---- keys and controls ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['ans_hit', 'ans_higher', 'ans_lower', ...M.VARIANTS.map(v => 'v_' + v), ...M.VARIANTS.map(v => 'vshort_' + v)]) ok(STRINGS.zh[k] && STRINGS.en[k], 'dynamic key ' + k);
for (const id of ['g0', 'ask0', 'mid0', 'new0', 'x1', 'next1', 'run1', 'p2', 'x3', 'x4', 'cv5', 'k5']) ok(html.includes(`id="${id}"`), 'control ' + id);
{ const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'ids unique'); }
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/algorithms/binary-search/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS binary-search core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
