'use strict';
// Averages · Level by Pouring (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, needle, msg) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(needle), `${msg} (${l}: ${key} contains ${needle})`); };

// ---- step 0: pouring never changes the total; blocked pours explain themselves ----
let seed = 11; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.floor(seed / 2147483648 * n); };
let cups = M.S0.cups.slice(); const total0 = M.sum(cups);
ok(total0 === 16, 'step 0 total is 16');
for (let i = 0; i < 2000; i++) {
  const a = rnd(4), b = rnd(4), r = M.pour(cups, a, b, M.S0.cap);
  ok(M.sum(r.cups) === total0, 'total conserved');
  if (a === b) ok(!r.ok && r.reason === 'same', 'same cup refused');
  else if (cups[a] === 0) ok(!r.ok && r.reason === 'empty', 'empty refused');
  else if (cups[b] === M.S0.cap) ok(!r.ok && r.reason === 'full', 'full refused');
  else ok(r.ok && r.cups[a] === cups[a] - 1 && r.cups[b] === cups[b] + 1, 'one part moves');
  ok(r.cups.every(v => v >= 0 && v <= M.S0.cap), 'never below 0 or above the cap');
  cups = r.cups;
}
both('s0e', '10', 'cap of 10 quoted'); both('s0full', '10', 'full message quotes the cap');

// ---- step 1: move from more to less; moves = surplus = shortfall ----
const expectMean = [4, 5, 6], expectMoves = [4, 5, 5];
M.S1.presets.forEach((p, q) => {
  const m = M.mean(p), plan = M.levelPlan(p);
  ok(m === expectMean[q] && Number.isInteger(m), 'preset mean is a whole number');
  ok(plan.final.every(v => v === m), 'levels exactly to the mean');
  ok(plan.moves.length === M.excess(p, m) && plan.moves.length === expectMoves[q], 'moves = starting surplus');
  ok(p.every(v => v <= M.S1.cap), 'preset fits the cups');
  plan.states.forEach((st, k) => {
    ok(M.excess(st, m) === M.shortfall(st, m), 'surplus = shortfall at the mean (every intermediate state)');
    ok(M.excess(st, m) === plan.moves.length - k, 'each move removes exactly one surplus part');
    ok(M.sum(st) === M.sum(p), 'total conserved while levelling');
  });
});
// surplus = shortfall at the mean for arbitrary data, never at any other level
for (let trial = 0; trial < 300; trial++) {
  const a = Array.from({ length: 2 + rnd(6) }, () => rnd(11)), m = M.mean(a);
  near(M.excess(a, m), M.shortfall(a, m), 1e-9, 'balance at the mean');
  if (a.some(v => v !== m)) { ok(M.excess(a, m + 0.25) < M.shortfall(a, m + 0.25), 'above the mean: shortfall wins'); ok(M.excess(a, m - 0.25) > M.shortfall(a, m - 0.25), 'below the mean: surplus wins'); }
}

// ---- step 2: total ÷ count, exact fractions ----
const exp2 = { 2: [8, 4, 4, 0, 1], 3: [15, 5, 5, 0, 1], 4: [18, 4.5, 4, 1, 2], 5: [27, 5.4, 5, 2, 5], 6: [31, 31 / 6, 5, 1, 6] };
for (let n = M.S2.nMin; n <= M.S2.nMax; n++) {
  const c = M.S2.cups.slice(0, n), f = M.meanFrac(c), [tot, mean, w, nu, de] = exp2[n];
  ok(M.sum(c) === tot && Math.abs(M.mean(c) - mean) < 1e-12, `n=${n} total and mean`);
  ok(f.whole === w && f.num === nu && f.den === de, `n=${n} fraction ${f.whole} ${f.num}/${f.den}`);
  near(f.whole + f.num / f.den, M.mean(c), 1e-12, 'fraction equals the mean');
  // every cut piece is equal and the pieces add back to the total
  near(M.mean(c) * n, tot, 1e-12, 'n equal pieces make the total');
}
ok(M.sum(M.S2.cups) <= 31 && Math.max(...M.S2.cups) <= M.S2.cap, 'step 2 data fits the drawing');

// ---- step 3: outlier ----
for (let x = M.S3.xMin; x <= M.S3.xMax; x++) {
  const r = M.step3(x);
  near(r.mean, (20 + x) / 5, 1e-12, 'mean = (20 + x) / 5');
  near(r.change, (x - 5) / 5, 1e-12, 'change = (x − 5) / 5: every 5 parts move the mean by 1');
  ok(r.mean >= r.min && r.mean <= r.max, 'mean between min and max');
  ok(r.above + r.below + r.equal === 5, 'counts add to 5');
}
ok(M.step3(5).mean === 5 && M.step3(20).mean === 8 && M.step3(0).mean === 4, 'means quoted in s3hint (5, 8, 4)');
ok(M.step3(20).below === 4 && M.step3(20).above === 1, 'x = 20: the other four are all below the mean');
both('s3hint', '20', 's3hint names 20'); both('s3hint', '8', 's3hint names 8'); ok(STRINGS.zh.s3e.includes('4、5、6、5') && STRINGS.en.s3e.includes('4, 5, 6 and 5'), 'base cups quoted');
ok(M.S3.base.join(', ') === '4, 5, 6, 5', 'base cups');

// ---- step 4: unequal teams ----
const r40 = M.step4(false, 0);
ok(r40.totalA === 30 && r40.totalB === 36 && r40.meanA === 7.5 && r40.meanB === 6, 'teams: totals 30/36, means 7.5/6');
for (let x = M.S4.xMin; x <= M.S4.xMax; x++) {
  const r = M.step4(true, x);
  ok(r.totalB > r.totalA && r.meanB < r.meanA, 'with any newcomer: B has the bigger total, A the higher mean');
  ok(r.totalB === 36 + x, 'total grows by x');
  ok((r.meanB > r.meanBOld) === (x > 6) && (Math.abs(r.meanB - r.meanBOld) < 1e-12) === (x === 6), 'mean rises iff x > old mean 6');
}
both('s4hint', '6', 's4hint quotes the old mean 6');
ok(M.S4.a.length === 4 && M.S4.b.length === 6, 'team sizes 4 and 6 (s4e)');

// ---- step 5: work backwards ----
ok(M.sum(M.S5.known) === 16 && M.step5(0, 6).need === 8, 'target 6 needs 8 (16 + D = 24)');
ok(M.shortfall(M.S5.known, 6) === 3 && M.excess(M.S5.known, 6) === 1, 's5e: short by 3, over by 1 against 6');
for (let tt = M.S5.tMin; tt <= M.S5.tMax; tt++) {
  const need = 4 * tt - 16;
  for (let x = M.S5.xMin; x <= M.S5.xMax; x++) {
    const r = M.step5(x, tt);
    ok(r.need === need && r.targetTotal === 4 * tt, 'need = 4t − 16');
    ok(r.feasible === (tt >= 4 && tt <= 7), 'feasible only for targets 4..7');
    ok(r.hit === (x === need) && (!r.hit || Math.abs(r.mean - tt) < 1e-12), 'hit means the mean equals the target');
  }
  if (tt > M.S5.tMin) ok(M.step5(0, tt).need - M.step5(0, tt - 1).need === 4, 'each +1 on the target asks D for 4 more');
}
both('s5e', '24', 'target total quoted'); both('s5e', '8', 'answer quoted'); both('s5e', '16', 'known total quoted');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['exact']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.compare.includes('平均数 · 移多补少') && STRINGS.en.compare.includes('Averages · Level by Pouring'), 'compare link names the original');

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['from0', 'to0', 'pour0', 'reset0', 'pour1', 'auto1', 'next1', 'reset1', 'n2', 'play2', 'x3', 'add4', 'x4', 'x5', 't5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
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
ok(fs.existsSync(path.join(dir, '../../../math/data/averaging-leveling/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS averaging-leveling core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
