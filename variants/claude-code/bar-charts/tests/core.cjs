'use strict';
// Bar Charts (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, needle, msg) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(needle), `${msg} (${l}: ${key} contains ${needle})`); };

// ---- data ----
ok(M.W1.join() === '12,7,15,9,12' && M.W2.join() === '10,9,13,12,16', 'data');
ok(M.argmax(M.W1) === 2 && M.argmin(M.W1) === 1, 'busiest Wed, quietest Tue');

// ---- step 0: every value the slider allows fits the 0..20 axis; maxDays handles ties ----
ok(Math.max(...M.W1) <= M.S0.vMax && Math.max(...M.W2) <= M.S0.vMax, 'data fits 0..20');
assert.deepEqual(M.maxDays([12, 7, 15, 9, 15]), [2, 4]); checks++;

// ---- step 1: scales ----
const sc = Object.fromEntries(M.UNITS.map(u => [u, M.scale(M.W1, u)]));
ok(sc[1].overflow.length === 3 && sc[1].top === 10, 'unit 1: three days poke out of a 10-book chart');
ok(sc[2].overflow.length === 0 && sc[2].tallestCells === 7.5, 'unit 2: all fit, Wed takes 7.5 squares');
ok(sc[5].tallestCells === 3 && sc[10].tallestCells === 1.5, 'units 5 and 10: short bars');
const tueThu = u => Math.abs(M.W1[1] - M.W1[3]) / u;
ok(tueThu(1) === 2 && tueThu(2) === 1 && Math.abs(tueThu(5) - 0.4) < 1e-12 && Math.abs(tueThu(10) - 0.2) < 1e-12, 'Tue vs Thu: 2, 1, 0.4, 0.2 squares');
both('s1hint', '0.4', 's1hint quotes 0.4'); both('s1hint', '0.2', 's1hint quotes 0.2'); both('s1hint', '7.5', 's1hint quotes 7.5');
// unit 2 is the only scale that fits every bar and fills more than half the chart
ok(M.UNITS.filter(u => M.scale(M.W1, u).overflow.length === 0 && M.scale(M.W1, u).tallestCells > 5).join() === '2', 'best scale is 2');

// ---- step 2: differences and ranking ----
for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
  const q = M.diff(M.W1, i, j);
  ok(q.d === Math.abs(M.W1[i] - M.W1[j]), 'difference = bigger − smaller');
  if (q.d) ok(M.W1[q.taller] - M.W1[q.shorter] === q.d, 'taller − shorter');
}
ok(M.diff(M.W1, 2, 1).d === 8, 'default pair Wed − Tue = 8');
assert.deepEqual(M.rank(M.W1), [2, 0, 4, 3, 1]); checks++; // Wed 15, Mon 12, Fri 12 (tie keeps weekday order), Thu 9, Tue 7
ok(M.W1[0] === 12 && M.W1[4] === 12, 's2hint: Monday and Friday tie at 12');
both('s2hint', '12', 's2hint quotes the tie');

// ---- step 3: truncated axis ----
const expectSeen = { 0: 15 / 7, 1: 14 / 6, 2: 2.6, 5: 5, 6: 9 }; // 5 is the slider default quoted in s3hint
for (const [b, r] of Object.entries(expectSeen)) near(M.truncated(M.W1, Number(b)).seenRatio, r, 1e-12, 'seen ratio at base ' + b);
for (let b = M.S3.baseMin; b <= M.S3.baseMax; b++) {
  const tr = M.truncated(M.W1, b);
  near(tr.trueRatio, 15 / 7, 1e-12, 'true ratio never changes');
  ok(tr.vanished.length > 0 === (b >= 7), 'a bar vanishes exactly from base 7');
  if (b >= 1 && b < 7) ok(tr.seenRatio > M.truncated(M.W1, b - 1).seenRatio, 'raising the start exaggerates the ratio');
}
for (const l of ['zh', 'en']) ok(['2.14', '2.33', '2.6', '9'].every(s => STRINGS[l].s3hint.includes(s)), 's3hint quotes 2.14, 2.33, 2.6, 9');
ok(Number((15 / 7).toFixed(2)) === 2.14 && Number((14 / 6).toFixed(2)) === 2.33, 'rounded ratios');
both('s3hint', '7', 's3hint: past 7 the bar vanishes');
ok(Math.max(...M.W1) <= M.S3.axisTop, 'axis top 16 holds every bar');

// ---- step 4: two weeks ----
const cmp = M.compare(M.W1, M.W2);
assert.deepEqual(cmp.delta, [-2, 2, -2, 3, 4]); checks++;
ok(cmp.up === 3 && cmp.down === 2 && cmp.same === 0 && cmp.t1 === 55 && cmp.t2 === 60, '3 up, 2 down, 55 → 60');
both('s4hint', '55', 's4hint quotes 55'); both('s4hint', '60', 's4hint quotes 60'); both('s4hint', '2', 's4hint quotes the drop of 2');
ok(Math.max(...M.W2) <= 20, 'week 2 fits the axis');

// ---- step 5: the mean line ----
ok(M.mean(M.W1) === 11, 'mean 11');
for (let h = M.S5.hMin; h <= M.S5.hMax; h += M.S5.step) {
  const r = M.balance(M.W1, h);
  ok((Math.abs(r.excess - r.shortfall) < 1e-9) === (h === 11), 'surplus = shortfall only at the mean (slider grid)');
  ok((r.excess > r.shortfall) === (h < 11), 'below the mean the surplus is bigger');
}
ok(M.balance(M.W1, 11).excess === 6 && M.balance(M.W1, 11).shortfall === 6, 'both 6 at 11');
both('s5hint', '55 ÷ 5 = 11', 's5hint quotes the mean'); both('s5hint', '6', 's5hint quotes 6');
ok(!M.W1.includes(11), '11 is not any single day');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.compare.includes('条形图 · 让数字站成一排比高矮') && STRINGS.en.compare.includes('Bar Charts · Numbers Standing in a Row'), 'compare link names the original');

// ---- keys, controls, provenance ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (let i = 0; i < 5; i++) ok(STRINGS.zh['d' + i] && STRINGS.en['d' + i], 'day name ' + i);
for (const id of ['d0', 'v0', 'flip0', 'reset0', 'u1', 'a2', 'b2', 'sort2', 'b3', 'd4', 'marks4', 'h5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/data/bar-charts/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS bar-charts core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
