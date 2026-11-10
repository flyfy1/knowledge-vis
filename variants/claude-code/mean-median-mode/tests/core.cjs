'use strict';
// Mean / median / mode (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, text) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(text), `${l}.${key} quotes ${text}`); };
const D = M.COMMUTE;

// ---- basic definitions ----
assert.deepEqual(M.sorted([3, 1, 2]), [1, 2, 3]); checks++;
ok(M.median([5, 1, 3]) === 3 && M.median([4, 1, 3, 2]) === 2.5, 'median odd/even');
assert.deepEqual(M.modes([1, 2, 3]), []); assert.deepEqual(M.modes([1, 1, 2, 2, 3]), [1, 2]); assert.deepEqual(M.modes([4, 4, 1]), [4]); checks += 3;
assert.deepEqual(M.countsMode([1, 1, 1]), []); assert.deepEqual(M.countsMode([0, 2, 2]), [1, 2]); assert.deepEqual(M.countsMode([0, 0, 0]), []); checks += 3;
assert.deepEqual(M.medianRanks(11), [6]); assert.deepEqual(M.medianRanks(10), [5, 6]); checks += 2;

// ---- step 0 ----
ok(D.join(', ') === '8, 10, 12, 12, 12, 15, 15, 18, 20, 25, 60', 'data as printed');
ok(STRINGS.zh.s0e.includes('8、10、12、12、12、15、15、18、20、25、60'), 'zh data list');
ok(STRINGS.en.s0e.includes('8, 10, 12, 12, 12, 15, 15, 18, 20, 25, 60'), 'en data list');
ok(STRINGS.zh.s0mean.includes('8 + 10 + 12 + 12 + 12 + 15 + 15 + 18 + 20 + 25 + 60') && STRINGS.en.s0mean.includes('8 + 10 + 12 + 12 + 12 + 15 + 15 + 18 + 20 + 25 + 60'), 'sum printed');
ok(M.sum(D) === 207, 'sum 207'); near(M.mean(D), 18.8, 0.05, 'mean 18.8'); ok(M.median(D) === 15 && M.sorted(D)[5] === 15, 'median = 6th = 15');
assert.deepEqual(M.modes(D), [12]); ok(D.filter(v => v === 12).length === 3, '12 appears 3 times');
ok(D.filter(v => v < M.mean(D)).length === 8, '8 of 11 quicker than the mean'); checks += 2;
ok(D.filter(v => v > M.mean(D)).length === 3, 'only 3 dots right of the mean (s0hint)'); both('s0hint', '3');
both('s0hint', '18.8');

// ---- step 1: balance ----
{ const b = M.balance(D, M.mean(D)); near(b.L, b.R, 1e-9, 'balanced at the mean'); near(b.L, 48.5, 0.05, 'left total 48.5'); both('s1hint', '48.5'); }
for (let f = 0; f <= 65; f += 0.1) { const b = M.balance(D, f); near(b.net, M.sum(D) - D.length * f, 1e-9, 'net = Σ(x − f)'); ok((b.net > 0) === (f < M.mean(D)), 'tips right exactly when the pivot is left of the mean'); }
{ const b = M.balance(D, 12), s = M.split(D, 12); ok(s.l === 2 && b.L === 6 && b.R === 81, 'pivot at 12: 2 people, 6 vs 81'); both('s1hint', '6'); both('s1hint', '81'); }
near(60 - M.mean(D), 41.2, 0.05, '60-minute distance at balance 41.2'); both('s1hint', '41.2'); checks++;
ok(48 === 60 - 12, '60 contributes 48 at pivot 12'); both('s1hint', '48');
// the balance search always stops at 18.8 (slider shows one decimal)
ok(M.mean(D).toFixed(1) === '18.8', 'balance search stops at 18.8');
// the readout's "even" state appears when |net| < 0.05; at the slider value 18.8 the net is 11×(18.818−18.8) = 0.2 → s1even must use the exact mean
{ const b = M.balance(D, Number(M.mean(D).toFixed(1))); ok(Math.abs(b.net) < 0.25, 'slider value 18.8 is within 0.25 of perfect balance'); }

// ---- step 2: median ----
{ const s = M.split(D, 15); ok(s.l === 5 && s.on === 2 && s.r === 4, 'line at 15: 5 / 2 / 4'); both('s2hint', '5'); both('s2hint', '4'); }
{ const ten = D.slice(0, 10); ok(M.median(ten) === 13.5 && M.sorted(ten)[4] === 12 && M.sorted(ten)[5] === 15, 'ten people: median (12 + 15) ÷ 2 = 13.5'); near(M.mean(ten), 14.7, 1e-9, 'ten people: mean 14.7'); checks++; both('s2hint', '13.5'); both('s2hint', '14.7'); }
for (let c = 0; c <= 65; c += 0.5) { const s = M.split(D, c); ok(s.l + s.on + s.r === 11, 'split counts add up'); if (s.l <= 5 && s.r <= 5) ok(c >= 15 - 1e-9 && c <= 15 + 1e-9 || (s.l === 5 && s.r === 5), 'equal-ish split only at the median'); }

// ---- step 3: mode ----
{
  const shoes = M.expand(M.SIZES, M.SIZE_COUNTS);
  ok(shoes.length === 24, '24 pairs'); both('s3e', '24');
  near(M.mean(shoes), 37.3, 0.05, 'mean size 37.3'); both('s3e', '37.3'); both('s3hint', '37.3'); checks++;
  assert.deepEqual(M.modes(shoes), [37]); ok(M.median(shoes) === 37, 'median 37'); checks++;
  ok(!M.SIZES.includes(37.3), 'no size 37.3');
  // adding 38s: tie after 2, switch after 3
  const c = M.SIZE_COUNTS.slice(); c[4] += 2; assert.deepEqual(M.countsMode(c), [3, 4]); c[4] += 1; assert.deepEqual(M.countsMode(c), [4]); checks += 2;
  assert.deepEqual(M.countsMode(M.SPORT_COUNTS), [2]); checks++;
  ok(M.SPORTS[2] === 'rope' && STRINGS.zh.sport_rope === '跳绳', 'sport mode is skipping');
}

// ---- step 4: extreme values ----
{
  const far = M.sweep(D, M.FAR, 25, 120, 0.5);
  ok(far.every(p => p.median === 15 && p.modes.length === 1 && p.modes[0] === 12), 'far classmate: median 15 and mode 12 never move');
  for (let i = 1; i < far.length; i++) near(far[i].mean - far[i - 1].mean, 0.5 / 11, 1e-9, 'mean slope 1/11');
  near(far[far.length - 1].mean, 24.3, 0.05, 'mean at 120 = 24.3'); both('s4hint', '24.3'); both('s4hint', '11');
  const mid = M.sweep(D, M.MID, 0, 60, 0.5);
  ok(mid.every(p => p.median >= 12 && p.median <= 15), 'middle classmate: median stays within 12–15');
  ok(mid.some(p => p.median === 12) && mid.some(p => p.median === 15) && mid.some(p => p.median > 12 && p.median < 15), 'and does move inside that band');
  ok(mid.every(p => p.modes.includes(12)), 'mode stays 12');
  ok(far.every(p => p.mean < 30) && mid.every(p => p.mean < 30), 'all lines inside the 0–30 axis');
  both('s4hint', '12'); both('s4hint', '15');
}

// ---- step 5: scenarios ----
{
  ok(M.sum(M.PAGES) === 898 && Math.abs(M.mean(M.PAGES) - 81.6) < 0.05 && M.median(M.PAGES) === 80 && M.modes(M.PAGES)[0] === 60, 'pages: 898, 81.6, 80, 60');
  near(M.mean(M.PAGES) * 11, 898, 1e-9, 'mean × count = total'); checks++;
  ok(M.median(M.PAGES) * 11 === 880 && M.modes(M.PAGES)[0] * 11 === 660, 'median × 11 = 880, mode × 11 = 660');
  both('fb3Good', '898'); both('fb3Bad', '880'); both('fb3Bad', '660'); both('fb3Good', '81.6');
  ok(STRINGS.zh.s5data3.includes('40、55、60、60、72、80、85、90、96、110、150') && STRINGS.en.s5data3.includes('40, 55, 60, 60, 72, 80, 85, 90, 96, 110, 150'), 'pages printed');
  ok(M.PAGES.join() === '40,55,60,60,72,80,85,90,96,110,150', 'pages data');
  both('fb1Good', '18.8'); both('fb1Bad', '8'); both('fb2Good', '37');
}
// app answers match the feedback
{ const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'); ok(/ANSWER5 = \{ 1: 'median', 2: 'mode', 3: 'mean' \}/.test(app), 'answer key'); }

// ---- step 6: parser ----
ok(M.parseList('7 8 6.5 9 7 7.5 8').ok && M.parseList('1,2，3、4').nums.length === 4, 'parser accepts spaces and commas');
ok(!M.parseList('1 a 3').ok && M.parseList('1 a 3').reason === 'nan', 'rejects text');
ok(M.parseList('5').reason === 'count' && M.parseList(Array(31).fill(1).join(' ')).reason === 'count', 'count limits 2–30');
{ const a = M.parseList('7 8 6.5 9 7 7.5 8').nums; near(M.mean(a), 7.571, 0.001, 'default mean'); ok(M.median(a) === 7.5, 'default median'); assert.deepEqual(M.modes(a), [7, 8]); checks += 2; }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => [...new Set(s.match(/\{[a-zA-Z0-9]+\}/g) || [])].sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(k === 's3unit' || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria|-ph)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[),]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['q1', 'q2', 'q3', 's5data1', 's5data2', 's5data3', 'fb1Good', 'fb1Bad', 'fb2Good', 'fb2Bad', 'fb3Good', 'fb3Bad', ...M.SPORTS.map(s => 'sport_' + s)]) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['showMean', 'showMedian', 'showMode', 'showNone', 'f1', 'find1', 'cc2', 'tog2', 'kindShoes', 'kindSports', 'pick3', 'add3', 'remove3', 'reset3', 'v4', 'sc1', 'sc2', 'sc3', 'check5', 'in6', 'calc6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(!/左图|右图|上图|left chart|right chart|top chart|bottom chart/.test(fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8')), 'charts named by title, not position');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/statistics/mean-median-mode/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS mean-median-mode core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
