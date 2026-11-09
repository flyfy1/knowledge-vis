'use strict';
// Sequences & series (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg}: ${a} vs ${b}`);
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- step 0: arithmetic terms on the slider grid ----
for (let a1 = 1; a1 <= 10; a1++) for (let d = -2; d <= 4; d++) {
  const T = M.arithTerms(a1, d, 10);
  T.slice(1).forEach((v, i) => ok(v - T[i] === d, 'constant difference'));
  ok(T[9] === a1 + 9 * d, 'a10 = a1 + 9d');
  ok(T.every(Number.isInteger), 'integer bricks');
}
ok(M.arithTerm(2, 3, 10) === 29, 'default a10 = 29');

// ---- step 1: reverse-and-add on the slider grid ----
for (let a1 = 1; a1 <= 5; a1++) for (let d = 0; d <= 3; d++) for (let n = 2; n <= 14; n++) {
  const T = M.arithTerms(a1, d, n);
  for (let k = 0; k < n; k++) ok(T[k] + T[n - 1 - k] === a1 + T[n - 1], 'every row has length a1 + an');
  ok(M.arithSum(a1, d, n) === M.directSum(T), 'formula = direct sum');
  ok(n * (a1 + T[n - 1]) % 2 === 0, 'rectangle area is even (halving gives an integer)');
}
ok(M.arithSum(1, 1, 100) === 5050, 'Gauss 5050'); both('s1e', '5050');
ok(M.arithSum(1, 1, 10) === 55, 'default S10 = 55');

// ---- step 2: chessboard ----
ok(M.grains(64) === 9223372036854775808n, 'square 64 = 2^63');
ok(M.grainsUpTo(64) === 18446744073709551615n, 'board = 2^64 − 1');
for (let k = 1; k <= 64; k++) ok(M.grainsUpTo(k) === [...Array(k)].reduce((s, _, i) => s + M.grains(i + 1), 0n), 'cumulative = 2^k − 1');
ok(M.grains(64) * 2n > M.grainsUpTo(64), 'last square holds more than half of the board');
{ const tn = M.tonnes(M.grainsUpTo(64)); near(tn, 7.378697629483821e11, 1e-9, 'board mass at 0.04 g'); const years = tn / 8e8; ok(years > 900 && years < 1000, 'nine hundred-odd years of 800 Mt harvests: ' + years); }
both('s2full', '0.04'); both('s2full', '8');

// ---- step 3: shift and subtract on the slider grid ----
for (let a = 1; a <= 5; a++) for (let r2 = -6; r2 <= 6; r2++) for (let n = 2; n <= 8; n++) {
  const r = r2 / 2, T = M.geoTerms(a, r, n), direct = M.directSum(T);
  near(M.geoSum(a, r, n), direct, 1e-12, `geo sum a=${a} r=${r} n=${n}`);
  // S − rS = a − a·rⁿ (the cancellation the canvas shows)
  near(direct - r * direct, a - a * Math.pow(r, n), 1e-12, 'S − rS');
}

// ---- step 4: partial sums ----
for (let i = -19; i <= 24; i++) {
  const r = Math.round(i * 5) / 100, L = M.geoLimit(1, r);
  if (Math.abs(r) < 1) {
    const N = M.termsWithin(1, r, 0.01);
    ok(Math.abs(L - M.geoSum(1, r, N)) < 0.01 && (N === 1 || Math.abs(L - M.geoSum(1, r, N - 1)) >= 0.01), 'first n inside the band, r=' + r);
    for (let n = 1; n < 30; n++) ok(Math.abs(L - M.geoSum(1, r, n + 1)) <= Math.abs(L - M.geoSum(1, r, n)) + 1e-15, 'gap shrinks');
    if (r < 0) for (let n = 1; n < 30; n++) if (Math.abs(L - M.geoSum(1, r, n + 1)) > 1e-12) ok(Math.sign(M.geoSum(1, r, n) - L) !== Math.sign(M.geoSum(1, r, n + 1) - L), 'alternates around the limit');
  } else {
    ok(Number.isNaN(L), 'no limit for r ≥ 1'); ok(M.geoSum(1, r, 30) > M.geoSum(1, r, 29), 'keeps growing');
  }
}
ok(M.termsWithin(1, 0.9, 0.01) === 66, 'r = 0.9 needs 66 terms'); both('s4hint', '66');
near(M.geoLimit(1, 0.5), 2, 1e-12, 'r = 0.5 → 2'); near(M.geoLimit(1, 0.9), 10, 1e-12, 'r = 0.9 → 10'); near(M.geoLimit(1, -0.5), 2 / 3, 1e-12, 'r = −0.5 → 2/3');
for (let n = 1; n < 10; n++) near(2 - M.geoSum(1, 0.5, n + 1), (2 - M.geoSum(1, 0.5, n)) / 2, 1e-12, 'each term covers half the remaining gap');

// ---- step 5: pocket money ----
{
  const p = M.pocket(10, 2); ok(p.cross === 19, 'default crossing day 19'); near(p.A[29], 7350, 1e-12, 'A after 30 days'); near(p.B[29], 0.01 * (Math.pow(2, 30) - 1), 1e-12, 'B after 30 days');
  ok(M.pocket(0, 2).cross === 18 && M.pocket(50, 2).cross === 21, 'd 0 → 50 moves the crossing from 18 to 21'); both('s5hint', '18'); both('s5hint', '21');
  ok(M.pocket(10, 1.5).cross === null && M.pocket(10, 1.5, { N: 32 }).cross === 32 && M.pocket(10, 1.5, { N: 31 }).cross === null, 'r = 1.5 overtakes on day 32'); both('s5hint', '32');
  // once B leads it stays ahead (gap widens) for every slider setting
  for (let d = 0; d <= 50; d += 5) for (let r100 = 110; r100 <= 250; r100 += 5) {
    const q = M.pocket(d, r100 / 100, { N: 60 });
    if (q.cross) for (let n = q.cross; n < 60; n++) ok(q.B[n] - q.A[n] > q.B[n - 1] - q.A[n - 1], 'gap widens after crossing');
  }
}

// ---- finale quiz ----
const kinds = M.QUIZ.map(q => M.classify(q).kind);
assert.deepEqual(kinds, ['arith', 'geo', 'neither', 'geo', 'arith', 'geo']); checks++;
ok(M.classify(M.QUIZ[0]).next === 23 && M.classify(M.QUIZ[1]).next === 160 && M.classify(M.QUIZ[5]).next === -486, 'next terms');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s3fr']); // formula only
for (const k of zk) if (!NEUTRAL.has(k)) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys referenced in HTML/app exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['logOn', 'logOff', 'qRight', 'qWrong']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(html.includes('<meta name="stage" content="senior">'), 'stage senior');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/sequences-series/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS sequences-series core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
