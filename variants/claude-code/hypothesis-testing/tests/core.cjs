'use strict';
// Hypothesis-testing (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, sub) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(sub), `${l}.${key} quotes ${sub}`); };
const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };

// ---- binomial pmf and the p-value definition ----
for (const n of [10, 37, 50, 100, 200]) for (const q of [0.3, 0.5, 0.65, 0.9]) {
  const P = M.pmf(n, q); near(P.reduce((a, b) => a + b, 0), 1, 1e-10, 'pmf sums to 1');
  if (n <= 50) P.forEach((v, k) => near(v, choose(n, k) * Math.pow(q, k) * Math.pow(1 - q, n - k), 1e-12, 'pmf'));
}
for (let n = 10; n <= 100; n++) for (let k = 0; k <= n; k++) {
  const p = M.pValue(n, k);
  // brute force: sum of C(n,j)/2^n over |j − n/2| ≥ |k − n/2|
  if (n <= 40) { let s = 0; for (let j = 0; j <= n; j++) if (Math.abs(j - n / 2) >= Math.abs(k - n / 2) - 1e-9) s += choose(n, j) / Math.pow(2, n); near(p, Math.min(1, s), 1e-10, `p(${n},${k})`); }
  near(p, M.pValue(n, n - k), 1e-12, 'two-sided symmetry');
  for (const a of [0.01, 0.05, 0.1, 0.2]) ok((p <= a + 1e-12) === M.reject(n, a, k), `p ≤ α ⇔ in region (${n},${k},${a})`);
}
near(M.pValue(20, 15), 0.0414, 0.00005, 'p(20,15) = 0.041'); near(M.pValue(20, 10), 1, 1e-9, 'p(20,10) = 1');
near(M.pValue(20, 12), 0.50, 0.005, 'p(20,12) ≈ 0.50'); near(M.pValue(100, 60), 0.057, 0.0005, 'p(100,60) ≈ 0.057');
both('s0hint', '0.041'); both('s0hint', '0.057'); both('s0hint', '0.50');

// ---- step 1: distribution of p-values ----
for (const q of [0.3, 0.5, 0.65, 0.8]) near(M.pBins(50, q).reduce((a, b) => a + b, 0), 1, 1e-10, 'bins sum to 1');
near(M.shareBelow(50, 0.5, 0.05), M.size(50, 0.05), 1e-12, 'share p ≤ .05 under H0 = size');
near(M.shareBelow(50, 0.5, 0.05), 0.033, 0.0005, '≈ 3.3%'); both('s1hint', '3.3%');
near(M.shareBelow(50, 0.65, 0.05), 0.51, 0.005, 'q = .65 → ≈ 51%'); both('s1hint', '51%');
for (let q = 0.3; q <= 0.801; q += 0.05) near(M.pBins(50, q)[0], M.shareBelow(50, q, 0.05), 1e-12, 'first bin = share ≤ .05');
{ const vals = new Set(); for (let k = 0; k <= 50; k++) vals.add(M.pValue(50, k).toPrecision(10)); ok(vals.size >= 20 && vals.size <= 29, 'twenty-odd p-values: ' + vals.size); }
{ // simulation agrees with the exact share (seeded)
  const r = M.rng(1); let low = 0; const R = 20000; for (let i = 0; i < R; i++) if (M.pValue(50, M.flips(50, 0.5, r)) <= 0.05) low++;
  near(low / R, M.size(50, 0.05), 0.006, 'simulated share under H0');
}

// ---- step 2: α and the region ----
for (let n = 10; n <= 100; n++) for (let a = 1; a <= 20; a++) {
  const al = a / 100, R = M.region(n, al), s = M.size(n, al);
  ok(s <= al + 1e-12, 'size ≤ α'); ok(R.d <= n, 'region never empty on the slider ranges');
  // the region is maximal: one more ring would exceed α
  if (R.d >= 2) ok(M.tail(n, 0.5, R.d - 2) > al, 'region maximal');
}
near(M.size(50, 0.05), 0.0328, 0.00005, '3.28%'); near(M.size(50, 0.06), 0.0328, 0.00005, 'α = 6% same'); near(M.size(50, 0.07), 0.0649, 0.00005, 'α = 7% → 6.49%');
both('s2hint', '3.28%'); both('s2hint', '6.49%');
assert.deepEqual([M.region(10, 0.05).lo, M.region(10, 0.05).hi], [1, 9]); checks++;
near(M.size(10, 0.05), 0.0215, 0.00005, 'n=10 → 2.15%'); both('s2hint', '2.15%');

// ---- step 3: power ----
for (const n of [10, 50, 150, 200]) for (const a of [0.01, 0.05, 0.1]) {
  near(M.power(n, 0.5, a), M.size(n, a), 1e-12, 'q = 0.5: power = size');
  let prev = M.power(n, 0.5, a); for (let q = 0.51; q <= 0.9; q += 0.01) { const pw = M.power(n, q, a); ok(pw >= prev - 1e-12, 'power grows with q'); prev = pw; }
}
near(M.power(50, 0.65, 0.05), 0.506, 0.001, 'default power');
ok(M.power(150, 0.65, 0.05) > M.power(50, 0.65, 0.05) + 0.3, 'more tosses, more power');
ok(M.power(50, 0.65, 0.01) < M.power(50, 0.65, 0.05) && M.size(50, 0.01) < M.size(50, 0.05), 'smaller α: less pink, less green');

// ---- step 4: sample size ----
assert.equal(M.minN(0.7, 0.05, 0.8, 10, 300), 49); checks++;
near(M.power(50, 0.7, 0.05), 0.782, 0.0005, 'n = 50 → 78.2%'); both('s4hint', '78.2%'); both('s4hint', '49');
{ const n6 = M.minN(0.6, 0.05, 0.8, 10, 300); ok(n6 >= 190 && n6 <= 210, 'q = .6 needs about 200: ' + n6); }
near(M.zq(0.975), 1.959964, 1e-5, 'z quantile'); near(M.zq(0.8), 0.841621, 1e-5, 'z 0.8');
// the approximation sits a little left of the exact first n (s4hint), within 15% once n ≥ 40
for (let qi = 55; qi <= 90; qi++) for (const a of [0.01, 0.05, 0.1]) { const q = qi / 100;
  const ex = M.minN(q, a, 0.8, 10, 300), ap = M.approxN(q, a, 0.8);
  if (ex && ex > 10) ok(ap < ex + 0.5, `approx at or left of the exact n q=${q.toFixed(2)} α=${a}: ${ap} vs ${ex}`);
  if (ex && ex >= 40) ok(Math.abs(ap - ex) / ex < 0.15, `approx within 15% q=${q.toFixed(2)} α=${a}: ${ap} vs ${ex}`);
}

// ---- step 5: wrongful share ----
near(M.verdicts(0.1, 50, 0.7, 0.05).fdr, 0.274, 0.001, 'default ≈ 27%'); both('s5hint', '27%');
near(M.verdicts(0, 50, 0.7, 0.05).fdr, 1, 0, 'π = 0 → all wrongful');
near(M.verdicts(0.5, 50, 0.7, 0.05).fdr, 0.040, 0.001, 'π = 50% → ≈ 4%'); both('s5hint', '4%');
{ const v = M.verdicts(0.1, 200, 0.7, 0.05).fdr; ok(v > 0.25 && v < 0.28, 'n = 200 still ≈ 26%: ' + v); both('s5hint', '26%'); }
near(M.size(50, 0.05), 0.03, 0.005, 'pink about 3% of coins'); both('s5hint', '3%');
{ // the batch simulation matches the expected counts on average
  const r = M.rng(5); let fc = 0, bc = 0; const R = 40;
  for (let i = 0; i < R; i++) { const b = M.batch(1000, 0.1, 50, 0.7, 0.05, r); fc += b.fairConv; bc += b.biasConv; ok(b.fairAcq + b.fairConv === 900 && b.biasConv + b.biasAcq === 100, 'batch composition'); }
  near(fc / R, 900 * M.size(50, 0.05), 3, 'wrongful count'); near(bc / R, 100 * M.power(50, 0.7, 0.05), 2, 'caught count');
}
near(M.familyWise(1, 50, 0.05), M.size(50, 0.05), 1e-12, 'one test');
ok(M.familyWise(900, 50, 0.05) > 0.999, 'many fair coins: nearly certain to convict one');

// ---- formatting helper used in app.js keeps integer zeros ----
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmtSrc = app.match(/const fmt = [^\n]+/)[0];
const fmt = new Function(fmtSrc.replace('const fmt =', 'return'))();
assert.equal(fmt(90, 0), '90'); assert.equal(fmt(2.5, 2), '2.5'); assert.equal(fmt(3, 3), '3'); assert.equal(fmt(-0.0001, 2), '0'); assert.equal(fmt(100, 1), '100'); checks += 5;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['n0', 'k0', 'q1', 'run100', 'run1000', 'reset1', 'a2', 'n2', 'q3', 'n3', 'a3', 'q4', 'a4', 'n4', 'pi5', 'q5', 'n5', 'new5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../probability/inference/hypothesis-testing/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS hypothesis-testing core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
