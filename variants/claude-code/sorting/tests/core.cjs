'use strict';
// Sorting & Big O (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const inRange = (v, lo, hi, m) => ok(v >= lo && v <= hi, `${m}: ${v} not in [${lo}, ${hi}]`);
const both = (key, zh, en) => { for (const s of zh) ok(STRINGS.zh[key].includes(s), `zh.${key} quotes "${s}"`); for (const s of en) ok(STRINGS.en[key].includes(s), `en.${key} quotes "${s}"`); };

// ---- every algorithm really sorts ----
for (let n = 1; n <= 40; n++) for (let s = 1; s <= 4; s++) {
  const a = M.shuffled(n, s * 31 + n), want = a.slice().sort((x, y) => x - y);
  for (const r of [M.selection(a), M.insertion(a), M.merge(a), M.quick(a, 'first', s), M.quick(a, 'random', s), M.quick(a, 'median3', s)]) assert.deepEqual(r.a, want), checks++;
  assert.deepEqual(M.mergeLevels(a).at(-1).a, want); checks++;
  assert.deepEqual(M.counting(a, n).a, want); checks++;
}

// ---- step 0: selection sort makes n(n − 1)/2 comparisons whatever the input ----
for (let n = 2; n <= 40; n++) for (const a of [M.ascending(n), M.descending(n), M.shuffled(n, n)]) assert.equal(M.selection(a).cmp, n * (n - 1) / 2), checks++;
for (let seed = 1; seed <= 9; seed++) { const log = []; M.selection(M.shuffled(8, seed), log); ok(log.filter(e => e.kind === 'cmp').length === 28, 'log has 28 comparisons'); ok(log.at(-1).cmp === 28, 'tally ends at 28'); }
{ const log = []; M.selection(M.ascending(8), log); ok(log.at(-1).cmp === 28, 'sorted input still 28'); }

// ---- step 1: insertion sort best / worst / average ----
for (let n = 2; n <= 64; n++) {
  const c = M.insertionCases(n);
  assert.equal(c.sorted, n - 1); assert.equal(c.reversed, n * (n - 1) / 2); assert.equal(c.selection, n * (n - 1) / 2); checks += 3;
  ok(c.random >= n - 1 && c.random <= n * (n - 1) / 2, 'random between best and worst');
}
// "about half the worst case" on average: mean over many shuffles ≈ n(n−1)/4 (+ the n − 1 stopping comparisons)
for (const n of [16, 32, 64]) { let s = 0; const R = 200; for (let i = 0; i < R; i++) s += M.insertion(M.shuffled(n, 5000 + i)).cmp; let H = 0; for (let i = 1; i <= n; i++) H += 1 / i; const q = n * (n - 1) / 4 + n - H; inRange(s / R / q, 0.97, 1.03, 'mean insertion ≈ n(n−1)/4 + stops, n=' + n); }
for (let n = 16; n <= 64; n++) inRange(M.insertionCases(n).random / (n * (n - 1) / 4), 0.7, 1.4, 'single shuffle near n(n−1)/4, n=' + n);

// ---- step 2: merge levels for n = 16 ----
for (let seed = 1; seed <= 9; seed++) {
  const L = M.mergeLevels(M.shuffled(16, seed));
  assert.equal(L.length - 1, 4); checks++;
  assert.equal(L[1].cmp, 8); checks++;
  for (let d = 1; d <= 4; d++) { const w = 2 ** d; ok(L[d].cmp <= 16 - 16 / w, `level ${d} ≤ n − merges`); ok(L[d].cmp <= 16, 'level ≤ n'); }
  ok(L.slice(1).reduce((s, l) => s + l.cmp, 0) <= 64, 'total ≤ n log2 n');
  // every run is sorted at every level
  L.forEach(l => { for (let i = 0; i < 16; i += l.width) ok(M.isSorted(l.a.slice(i, i + l.width)), 'runs sorted'); });
}
for (let n = 2; n <= 300; n++) ok(M.merge(M.shuffled(n, n)).cmp <= M.nlogn(n), 'top-down merge ≤ n log2 n, n=' + n);

// ---- step 3: growth ----
for (let i = 1; i < M.NS.length; i++) {
  const n = M.NS[i], g = M.growth(n), p = M.growth(M.NS[i - 1]);
  inRange(g.selection / p.selection, 4, 4.3, 'selection doubling ×4');
  inRange(g.insertion / p.insertion, 2.9, 4.9, 'insertion doubling ×3–5');
  if (n >= 256) inRange(g.insertion / p.insertion, 3.9, 4.1, 'insertion close to ×4 for large n');
  inRange(g.merge / p.merge, 2.1, 2.9, 'merge doubling'); inRange(g.quick / p.quick, 2.1, 2.9, 'quick doubling');
  if (i >= 2) ok(g.merge / p.merge < M.growth(M.NS[i - 1]).merge / M.growth(M.NS[i - 2]).merge, 'merge ratio drifts down toward 2');
}
for (const n of M.NS) { const g = M.growth(n); inRange(g.merge / M.nlogn(n), 0.65, 0.89, 'merge ÷ n log n'); ok(g.selection === n * (n - 1) / 2, 'selection exact'); }
inRange(M.growth(2048).selection / 2048 ** 2, 0.499, 0.5, 'selection ÷ n² → 0.5');
inRange(M.growth(2048).selection, 1e6, 2.2e6, 'n² curves between one and two million'); inRange(M.growth(2048).insertion, 1e6, 2.2e6, 'insertion between one and two million');
both('s3hint', ['×2.1 到 ×2.9', '0.65 到 0.89', '×3 到 ×5'], ['×2.1 and ×2.9', '0.65 and 0.89', '×3 and ×5']);

// ---- step 4: quicksort ----
for (const inp of [M.ascending(32), M.descending(32)]) { const q = M.quick(inp, 'first'); assert.equal(q.cmp, 496); assert.equal(q.depth, 31); checks += 2; }
for (let seed = 1; seed <= 9; seed++) {
  for (const inp of [M.ascending(32), M.descending(32)]) for (const pv of ['random', 'median3']) { const q = M.quick(inp, pv, seed); inRange(q.depth, 5, 10, 'short tree'); inRange(q.cmp, 100, 200, 'one or two hundred'); }
  const q = M.quick(M.shuffled(32, 40 + seed), 'first', seed); inRange(q.cmp, 100, 199, 'shuffled + first pivot: low hundreds');
}
// a partition of m elements costs m − 1 comparisons
for (let seed = 1; seed <= 5; seed++) { const q = M.quick(M.shuffled(50, seed), 'random', seed); ok(q.cmp === q.calls.filter(c => c.hi > c.lo).reduce((s, c) => s + c.hi - c.lo, 0), 'sum of (m − 1)'); }

// ---- step 5: lower bound ----
for (let n = 2; n <= 7; n++) { ok(M.mergeWorst(n) >= Math.ceil(M.log2fact(n)), 'worst ≥ bound'); ok(M.permutations(n).length === M.factorial(n), 'n! orders'); }
assert.equal(M.mergeWorst(5), 8); assert.equal(Math.ceil(M.log2fact(5)), 7); assert.equal(Math.ceil(M.log2fact(4)), 5); checks += 3;
for (const n of [3, 4, 5, 6]) {
  let atBound = 0, below = 0;
  for (let s = 1; s <= 9; s++) {
    const h = M.shuffled(n, 900 + s * 10 + n).map(v => v - 1), c = M.candidates(h), lb = Math.ceil(M.log2fact(n));
    ok(c.history[0] === M.factorial(n) && c.history.at(-1) === 1, 'ends with exactly one order');
    c.history.forEach((v, i) => { if (i) ok(v <= c.history[i - 1] && v >= 1, 'never grows'); });
    ok(c.asked.length <= M.mergeWorst(n), 'within merge worst');
    if (c.asked.length === lb) atBound++; if (c.asked.length < lb) below++;
  }
  if (n >= 4) ok(atBound > 0, 'some runs meet the bound exactly, n=' + n);
}
// "lucky answers can finish below the bound" happens on this page (n = 3 and n = 5)
ok([3, 5].every(n => [...Array(9)].some((_, s) => M.candidates(M.shuffled(n, 900 + (s + 1) * 10 + n).map(v => v - 1)).asked.length < Math.ceil(M.log2fact(n)))), 'below-bound runs exist');
// Stirling form quoted in the formula: log2(n!) ≈ n log2 n − 1.44 n
for (const n of [64, 256, 1024]) inRange((M.nlogn(n) - 1.4427 * n - M.log2fact(n)) / M.log2fact(n), -0.02, 0, 'Stirling n=' + n);
// counting sort: zero comparisons, n + k + 1 work
{ const r = M.counting([3, 0, 2, 3, 1], 3); assert.equal(r.cmp, 0); assert.equal(r.work, 9); checks += 2; }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s5lgFact']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/(左图|右图|left chart|right chart|left panel|right panel)/i.test(v), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['in_sorted', 'in_random', 'in_reversed', 'pv_first', 'pv_random', 'pv_median3', 'alg_selection', 'alg_insertion', 'alg_merge', 'alg_quick']) ok(STRINGS.zh[k] && STRINGS.en[k], 'dynamic key ' + k);
for (const id of ['next0', 'play0', 'n1', 'next2', 'reset2', 'n3', 'seed4', 'next5', 'play5', 'seed5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1])).size === [...html.matchAll(/id="([^"]+)"/g)].length, 'ids unique');
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
ok(fs.existsSync(path.join(dir, '../../../computing/algorithms/sorting/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS sorting core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
