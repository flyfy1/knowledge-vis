'use strict';
// Recursion and divide-and-conquer (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.equal(a, b, m); checks++; };
const both = (key, sub) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(sub), `${l}.${key} quotes ${sub}`); };

// ---- step 0: call stack of pow(n) = 3·pow(n − 1) ----
for (let n = 0; n <= 10; n++) {
  const tr = M.linearTrace(n);
  eq(tr.events.length, 2 * (n + 1), 'events = 2(n + 1)');
  eq(tr.maxDepth, n + 1, 'deepest stack = n + 1');
  eq(tr.mults, n, 'n multiplications');
  eq(tr.value, Math.pow(3, n), 'value 3^n');
  eq(tr.states[tr.events.length].stack.length, 0, 'stack empty at the end');
  // depth climbs by one per event to n + 1, then falls by one per event (a single mountain)
  tr.depthAt.forEach((d, i) => eq(d, i <= n + 1 ? i : 2 * (n + 1) - i, 'mountain profile'));
  // the base case is the frame on top at the peak
  const peak = tr.states[n + 1]; eq(peak.stack[peak.stack.length - 1].k, 0, 'pow(0) on top at the peak');
  // returned values: pow(k) returns 3^k
  tr.events.filter(e => e.type === 'ret').forEach(e => eq(e.value, Math.pow(3, e.k), 'pow(k) returns 3^k'));
}
eq(M.linearTrace(10).value, 59049, 'largest value shown fits the frame label');

// ---- step 1: minus one vs halving ----
const powHalfBig = n => { if (n === 0) return 1n; const h = powHalfBig(Math.floor(n / 2)); return n % 2 ? h * h * 3n : h * h; };
for (let n = 1; n <= 1024; n++) {
  const h = M.halvingCost(n), bits = n.toString(2);
  eq(h.frames, bits.length + 1, 'halving frames = bit length + 1');
  eq(h.mults, bits.length + [...bits].filter(c => c === '1').length, 'mults = one squaring per level + one ×3 per odd level');
  eq(M.linearCost(n).frames, n + 1, 'minus-one frames'); eq(M.linearCost(n).mults, n, 'minus-one mults');
  if (2 * n <= 1024) eq(M.halvingCost(2 * n).frames, h.frames + 1, 'doubling n adds one link');
  if (n % 97 === 0 || n > 1000) { const v = powHalfBig(n); eq(v, 3n ** BigInt(n), 'halving recursion computes 3^n'); eq(M.digitsOfPow(n), v.toString().length, 'digit count'); }
}
eq(M.halvingCost(1023).mults, 20, '1023: 20 mults'); eq(M.halvingCost(1023).frames, 11, '1023: 11 frames');
eq(M.halvingCost(1024).mults, 12, '1024: 12 mults'); eq(M.halvingCost(1024).frames, 12, '1024: 12 frames');
ok(M.halvingCost(1023).chain.slice(0, -1).every(k => k % 2 === 1), '1023: every link odd');
ok(M.halvingCost(1024).chain.slice(0, -2).every(k => k % 2 === 0), '1024: every link even until 1');
let maxM = 0; for (let n = 1; n <= 1024; n++) maxM = Math.max(maxM, M.halvingCost(n).mults);
eq(maxM, 20, '20 is the most multiplications on the slider');
both('s1hint', '20'); both('s1hint', '12');

// ---- step 2: merge sort trace ----
eq(M.mergeWorst(8), 17, 'worst case formula for 8');
{ // brute force: the worst case over all 8! orders really is 17, and the best is 12
  const perm = [1, 2, 3, 4, 5, 6, 7, 8]; let worst = 0, best = 99;
  const heap = (k, a) => { if (k === 1) { const c = M.mergeTrace(a).cmpTotal; worst = Math.max(worst, c); best = Math.min(best, c); return; } for (let i = 0; i < k; i++) { heap(k - 1, a); const j = k % 2 ? 0 : i; [a[j], a[k - 1]] = [a[k - 1], a[j]]; } };
  heap(8, perm.slice()); eq(worst, 17, 'worst over all orders'); eq(best, 12, 'best over all orders');
}
for (let seed = 1; seed <= 50; seed++) {
  const arr = M.makeArray(seed), tr = M.mergeTrace(arr);
  eq(arr.length, 8, 'eight numbers'); ok(arr.every(v => v >= 1 && v <= 99), 'values 1–99');
  assert.deepEqual(tr.sorted, arr.slice().sort((a, b) => a - b)); checks++;
  eq(tr.events.length, 22, '15 enters + 7 merges'); eq(tr.levels, 4, 'four rows');
  ok(tr.cmpTotal <= 17 && tr.cmpTotal >= 12, 'comparisons within [12, 17]');
  ok(Math.max(...tr.states.map(s => s.stack.length)) === 4, 'stack never deeper than 4 (and reaches 4)');
  eq(tr.states[tr.states.length - 1].stack.length, 1, 'only the top call is left while it does the last merge');
  eq(tr.states[tr.states.length - 1].cmp, tr.cmpTotal, 'running count ends at the total');
  // depth-first order: no node of the right half is entered before the left half's merge
  const leftRoot = tr.nodes[0].kids[0], rightRoot = tr.nodes[0].kids[1];
  const iLeftDone = tr.events.findIndex(e => e.type === 'merge' && e.id === leftRoot), iRightStart = tr.events.findIndex(e => e.id === rightRoot);
  ok(iLeftDone < iRightStart, 'left half finished before the right half starts');
  // a merge's comparison count is at most len − 1 and at least the shorter half
  tr.events.filter(e => e.type === 'merge').forEach(e => { const q = tr.nodes[e.id]; ok(e.cmp <= q.hi - q.lo - 1 && e.cmp >= (q.hi - q.lo) / 2, 'merge comparisons bounded'); });
}
both('s2readout', '{worst}'); both('s2hint', '4');

// ---- step 3: recursion tree accounting ----
const Tdirect = (a, d, n) => (n === 1 ? 1 : a * Tdirect(a, d, n / 2) + Math.pow(n, d));
for (let a = 1; a <= 4; a++) for (let d = 0; d <= 2; d++) {
  for (let m = 1; m <= 10; m++) {
    const R = M.treeLevels(a, d, m);
    eq(R.total, Tdirect(a, d, R.n), `levels sum = recurrence a=${a} d=${d} m=${m}`);
    eq(R.rows.length, m + 1, 'm + 1 levels');
    R.rows.forEach((r, k) => { if (k) ok(Math.abs(r.total / R.rows[k - 1].total - R.ratio) < 1e-12, 'neighbour ratio = a/2^d'); });
    if (R.regime === 'top') ok(R.rows[0].total === Math.max(...R.rows.map(r => r.total)), 'top level is the largest');
    if (R.regime === 'bottom') ok(R.rows[m].total === Math.max(...R.rows.map(r => r.total)), 'bottom level is the largest');
  }
  // the predicted law levels off: ratio at m = 10 vs m = 9 within 6 %, and bounded by a constant ≤ 4
  const r9 = M.treeLevels(a, d, 9), r10 = M.treeLevels(a, d, 10);
  const q9 = r9.total / M.predicted(a, d, r9.n), q10 = r10.total / M.predicted(a, d, r10.n);
  ok(Math.abs(q10 / q9 - 1) < 0.06, `ratio flattens a=${a} d=${d}: ${q9} → ${q10}`);
  ok(q10 >= 1 && q10 <= 4, 'ratio bounded');
}
eq(M.treeLevels(2, 1, 5).regime, 'even', 'merge sort: every level equal'); eq(M.treeLevels(2, 1, 5).rows[3].total, 32, 'merge sort level = n');
eq(M.treeLevels(3, 1, 5).ratio, 1.5, 'Karatsuba r = 1.5'); eq(M.treeLevels(4, 1, 5).ratio, 2, 'four-block r = 2');
eq(M.treeLevels(1, 2, 5).regime, 'top', 'a=1 d=2 top-heavy');
ok(M.treeLevels(1, 2, 10).rows[0].total / M.treeLevels(1, 2, 10).total > 0.5, 'a=1,d=2: top level takes most of the bill');
ok(Math.abs(Math.log2(3) - 1.585) < 0.001, 'n^1.585');
for (const l of ['zh', 'en']) { ok(STRINGS[l].s3hint.includes('1.585') && STRINGS[l].s3hint.includes('1.5') && STRINGS[l].s3hint.includes('n²'), 's3hint numbers'); }

// ---- step 4: overlapping subproblems ----
for (let n = 0; n <= 22; n++) for (const memo of [false, true]) {
  const slow = M.fibCalls(n, memo), fast = M.fibCountsFast(n, memo);
  eq(fast.calls, slow.calls, 'fast counts = running the recursion'); assert.deepEqual(fast.count, slow.count); checks++;
}
for (let n = 2; n <= 40; n++) {
  const nv = M.fibCountsFast(n, false), mm = M.fibCountsFast(n, true);
  eq(nv.calls, 2 * M.fibValue(n + 1) - 1, 'naive calls = 2·fib(n+1) − 1');
  eq(nv.count[1], M.fibValue(n), 'fib(1) called fib(n) times');
  eq(mm.calls, 2 * n - 1, 'memo calls = 2n − 1');
  ok(Math.max(...mm.count) <= 2, 'memo bars never above 2');
  for (let k = 1; k < n; k++) ok(nv.count[k] >= nv.count[k + 1], 'naive bars taller to the left (k ≥ 1)');
  if (n >= 20) ok(Math.abs(M.fibCountsFast(n, false).calls / M.fibCountsFast(n - 1, false).calls - 1.618) < 0.005, 'growth ≈ 1.618 per step');
}
ok(M.fibCountsFast(40, false).count[1] < 3e8 && M.fibCountsFast(40, false).calls < 1e9, 'bars fit the 3e8 / 1e9 axes');
eq(M.fibValue(40), 102334155, 'fib(40)');
both('s4hint', '1.618'); both('s4readout', '2n − 1');

// ---- step 5: lopsided splits ----
const P = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
for (const p of P) {
  const tb = M.splitTable(p, 2048);
  for (const n of [16, 100, 256, 1000, 2048]) { const c = M.splitCost(n, p); eq(tb.C[n], c.cmp, 'table = memo recursion'); eq(tb.D[n], c.depth, 'depth table'); }
  const rows = M.splitRows(256, p);
  eq(rows.length, tb.D[256], 'icicle height = depth');
  rows.forEach(r => ok(r.reduce((s, q) => s + q[1], 0) <= 256, 'row within 256'));
  const grow = tb.C[2048] / tb.C[1024];
  if (p === 0) { eq(tb.C[256], 256 * 255 / 2, 'p = 0: n(n−1)/2'); eq(tb.D[256], 256, 'p = 0: depth n'); ok(Math.abs(grow - 4) < 0.01, 'p = 0 grows 4×'); }
  else { ok(grow >= 2.2 && grow <= 2.3, `p=${p}: growth ${grow} in 2.2–2.3`); ok(tb.D[256] <= 64, 'p > 0: far short of 256 levels'); ok(tb.C[256] / 2048 < 2.6, 'p > 0: within a small constant of n·log2 n');
  if (p > 0 && p < 0.5) ok(tb.C[256] > M.splitTable(p + 0.05, 256).C[256], 'smaller p shifts the curve up'); }
  // the curve stays between the two reference lines on the plotted range (16..2048)
  for (let n = 16; n <= 2048; n++) ok(tb.C[n] <= n * (n - 1) / 2 + 1e-9 && tb.C[n] >= n * Math.log2(n) * 0.55, 'near or above the lower reference line');
}
eq(M.splitTable(0.5, 256).D[256], 9, 'p = 0.5 depth 9');
for (const l of ['zh', 'en']) ok(STRINGS[l].s5hint.includes('2.2–2.3') && STRINGS[l].s5readout.includes('2048') && STRINGS[l].s5readout.includes('2.2'), 's5 quotes');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { eq(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/\['(p[A-Z][a-z]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'preset key ' + m[1]);
for (const id of ['n0', 'e0', 'play0', 'next0', 'reset0', 'n1', 'e2', 'play2', 'next2', 'reset2', 'shuffle2', 'a3', 'd3', 'm3', 'n4', 'p5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/algorithms/recursion-divide/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS recursion-divide core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
