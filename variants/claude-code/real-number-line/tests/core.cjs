'use strict';
// Real numbers & the number line (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// ---- exact digits: BigInt square roots against the defining inequality ----
for (let n = 1; n <= 60; n++) for (const k of [1, 5, 12, 30, 60]) {
  const d = M.sqrtDigits(n, k), x = BigInt(d.int + d.digits), N = BigInt(n) * 10n ** BigInt(2 * k);
  ok(x * x <= N && (x + 1n) * (x + 1n) > N, `√${n} to ${k} places is the exact truncation`);
}
ok(M.sqrtDigits(2, 30).digits === '414213562373095048801688724209', '√2 digits');
ok(M.sqrtDigits(3, 10).digits === '7320508075', '√3 digits');

// ---- step 0: the diagonal keeps its length while it swings; it lands at √(1 + b²) ----
for (const b of [1, 2, 3]) {
  near(M.diagLen(b) ** 2, 1 + b * b, 1e-12, 'diagonal² = 1 + b²');
  for (let w = 0; w <= 100; w++) { const tip = M.tipAt(b, M.diagSlope(b) * (1 - w / 100)); near(Math.hypot(tip.x, tip.y), M.diagLen(b), 1e-12, 'length unchanged while turning'); }
  const land = M.tipAt(b, 0); near(land.y, 0, 1e-12, 'lands on the line'); near(land.x, Math.sqrt(1 + b * b), 1e-12, 'lands at √(1 + b²)');
  const start = M.tipAt(b, M.diagSlope(b)); near(start.x, 1, 1e-12, 'starts at the corner x = 1'); near(start.y, b, 1e-12, 'starts at the corner y = b');
}
ok(M.diagLen(1) > 1 && M.diagLen(1) < 2, '√2 lands between 1 and 2');
ok(M.diagLen(3) < 3.6, '√10 fits on the drawn line (to 3.6)');

// ---- step 1: decimals by zooming ----
const f78 = M.fracDigits(7, 8, 10);
ok(f78.terminates && f78.digits === '8750000000', '7/8 = 0.875');
for (let j = 0; j < 8; j++) { const pos = Number('0.' + f78.digits.slice(j, j + 14)); ok(Number.isInteger(Math.round(pos * 10 * 1e9) / 1e9) === (j >= 2), `7/8 sits on a tick mark from the third row on (row ${j + 1})`); }
const f17 = M.fracDigits(1, 7, 20), f13 = M.fracDigits(1, 3, 20);
ok(!f17.terminates && f17.repeatStart === 0 && f17.period === 6 && f17.digits.slice(0, 6) === '142857', '1/7 repeats 142857');
ok(!f13.terminates && f13.repeatStart === 0 && f13.period === 1 && f13.digits.slice(0, 1) === '3', '1/3 repeats 3');
// √2, √3: no block of length ≤ 10 repeats at least 3 times up to the 40th place, from any start
function eventuallyPeriodic(s) { for (let L = 1; L <= 10; L++) for (let st = 0; st + 3 * L <= s.length; st++) { let same = true; for (let i = st + L; i < s.length; i++) if (s[i] !== s[i - L]) { same = false; break; } if (same) return true; } return false; }
for (const n of [2, 3]) ok(!eventuallyPeriodic(M.sqrtDigits(n, 40).digits), `√${n}: no repeating tail in the first 40 places`);
ok(eventuallyPeriodic(M.fracDigits(1, 7, 40).digits) && eventuallyPeriodic(M.fracDigits(1, 3, 40).digits), 'the same test does see the repeating fractions');
// long division agrees with the denominator rule for every fraction p/q, q ≤ 60
for (let q = 1; q <= 60; q++) for (let p = 1; p <= 2 * q; p++) {
  const f = M.fracDigits(p, q, 30);
  ok(f.terminates === M.terminatesByDenominator(p, q), `${p}/${q} terminating rule`);
  near(f.int + Number('0.' + f.digits.slice(0, 15)), p / q, 1e-13, `${p}/${q} digits`);
}

// ---- step 2: fractions never hit √2 ----
for (let q = 1; q <= 10000; q++) { const b = M.bestFor(q); ok(b.gap !== 0 && Math.abs(b.gap) >= 1, `p² − 2q² ≠ 0 at q=${q}`); }
const recs = M.records(60).map(r => r.q);
ok([5, 12, 29].every(q => recs.includes(q)), 'records include 5, 12, 29: ' + recs);
const b60 = M.bestUpTo(60); ok(b60.p === 41 && b60.q === 29 && b60.gap === -1, 'best up to 60 is 41/29');
for (const [p, q] of [[7, 5], [17, 12], [41, 29]]) ok(Math.abs(p * p - 2 * q * q) === 1, `${p}/${q}: p² − 2q² = ±1`);
for (let N = 1; N <= 60; N++) { const b = M.bestUpTo(N); ok(b.errExact > 0, 'error never 0'); near(b.errExact, Math.abs(b.p / b.q - Math.SQRT2), 1e-12, 'exact error formula'); }
ok(Math.SQRT2 > 1.41 && Math.SQRT2 < 1.42 && Math.SQRT2 > 1.30 && Math.SQRT2 < 1.53, '√2 inside the drawn window');
ok(Math.log10(M.bestUpTo(60).errExact) > -4.5, 'smallest error stays above the plotted floor 10^−4.5');

// ---- step 3: the count of 2s ----
for (let p = 1; p <= 99; p++) ok(M.twos(p * p) % 2 === 0 && M.twos(p * p) === 2 * M.twos(p), `p=${p}: even number of 2s`);
for (let q = 1; q <= 70; q++) { ok(M.twos(2 * q * q) % 2 === 1, `q=${q}: odd number of 2s`); for (let p = 1; p <= 99; p++) ok(p * p !== 2 * q * q, 'never equal'); }
ok(Math.round(70 * Math.SQRT2) <= 99, 'closest-p button stays inside the p slider');
ok(M.twos(64 * 64) <= 12 && M.twos(2 * 64 * 64) <= 13, 'block towers fit (≤ 7 rows)');

// ---- step 4: classification ----
const cls = (o) => M.classify(o);
ok(cls({ kind: 'frac', p: 3, q: 4 }) === 'terminating' && M.fracDigits(3, 4, 5).digits === '75000', '3/4 = 0.75');
ok(cls({ kind: 'frac', p: 1, q: 3 }) === 'repeating', '1/3 repeating');
const m27 = M.fracDigits(2, 7, 12); ok(cls({ kind: 'frac', p: -2, q: 7 }) === 'repeating' && m27.period === 6 && m27.digits.slice(0, 6) === '285714', '−2/7 repeats 285714');
ok(cls({ kind: 'sqrt', n: 9 }) === 'integer' && cls({ kind: 'sqrt', n: 8 }) === 'irrational', '√9 whole, √8 irrational');
near(Math.sqrt(8), 2 * Math.SQRT2, 1e-12, '√8 = 2√2');
const f227 = M.fracDigits(22, 7, 12); ok(f227.int === 3 && f227.digits.slice(0, 6) === '142857' && f227.period === 6, '22/7 = 3.142857…');
ok(M.PI_DIGITS.startsWith('14159265358979') && Math.abs(Number('3.' + M.PI_DIGITS.slice(0, 15)) - Math.PI) < 1e-14, 'π digits');
ok(f227.digits.slice(0, 2) === M.PI_DIGITS.slice(0, 2) && f227.digits[2] !== M.PI_DIGITS[2], '22/7 and π part at the third decimal place');
ok(M.patternDigits(21) === '101001000100001000001', '0.1 01 001 … digits');
{ const runs = M.patternDigits(200).split('1').slice(1, -1).map(z => z.length); runs.forEach((r, i) => ok(r === i + 1, 'each run of zeros is one longer than the last')); }
for (const o of [{ kind: 'frac', p: 3, q: 4 }, { kind: 'frac', p: -2, q: 7 }, { kind: 'sqrt', n: 9 }, { kind: 'pi' }, { kind: 'pattern' }]) { const v = M.valueOf(o); ok(v > -1.2 && v < 3.7, 'every number fits the drawn line'); }

// ---- step 5: √n on y = x² ----
const squares = []; for (let n = 1; n <= 50; n++) { const r = M.rootInfo(n); if (r.square) squares.push(n); else { ok(r.lo * r.lo < n && n < r.hi * r.hi && r.hi === r.lo + 1, `√${n} bracket`); } }
assert.deepEqual(squares, [1, 4, 9, 16, 25, 36, 49]); checks++;
for (let n = 1; n < 50; n++) ok(Math.sqrt(n + 1) - Math.sqrt(n) > Math.sqrt(n + 2) - Math.sqrt(n + 1), 'roots move less and less');
ok(Math.sqrt(50) < 7.6, '√50 fits the x-axis (to 7.6)');
// non-squares have a prime with an odd exponent (the step-5 argument)
for (let n = 2; n <= 50; n++) { let m = n, odd = false; for (let p = 2; p <= m; p++) { let e = 0; while (m % p === 0) { m /= p; e++; } if (e % 2) odd = true; } ok(odd === !M.isSquare(n), `n=${n}: odd prime exponent iff not a square`); }
// ---- bilingual parity ----
const NEUTRAL = new Set(['lgRoot', 'n_f34', 'n_f13', 'n_fm27', 'n_s9', 'n_s8', 'n_f227', 'n_pi', 'n_pat']); // symbols only
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok((NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k]), 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['s1term', 's1rep', 's1irr', 'r_term', 'r_rep', 'r_int', 'r_s8', 'r_pi', 'r_pat']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['b0', 'w0', 'go0', 'k1', 'n2', 'p3', 'q3', 'near3', 'n5', 'pick1', 'pick4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/real-number-line/index.html')), 'comparison link target exists');
ok(STRINGS.zh.compare.includes('实数与数轴 · √2 落在哪一点') && STRINGS.en.compare.includes('Real Numbers & the Number Line · Where √2 Lands'), 'compare link names the original');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS real-number-line core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
