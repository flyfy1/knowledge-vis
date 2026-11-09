'use strict';
// Intervals & fences (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node variants/claude-code/intervals-fences/tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, m) => ok(Math.abs(a - b) < 1e-9, `${m}: ${a} vs ${b}`);
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([-\\d.]+)" max="([-\\d.]+)" step="([-\\d.]+)" value="([-\\d.]+)"`)); assert.ok(m, 'slider ' + id); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const range = s => { const out = []; for (let v = s.min; v <= s.max + 1e-9; v += s.step) out.push(+v.toFixed(6)); return out; };

// ---- step 0: posts = panels + 1; the spare is always the rightmost post ----
const n0 = slider('n0');
for (const n of range(n0)) {
  const f = M.fence(n);
  ok(f.posts.length === n + 1, 'posts = panels + 1 for n=' + n);
  ok(f.unclaimed.length === 1 && f.unclaimed[0] === n, 'only the rightmost post is unclaimed');
}
ok(n0.value === 5 && M.fence(5).posts.length === 6, 's0t: 5 panels → 6 posts');

// ---- step 1: gaps = L ÷ d, trees = gaps + 1, counted from the position list ----
const L1 = slider('L1'), d1 = slider('d1');
for (const L of range(L1)) for (const d of range(d1)) {
  const r = M.road(L, d);
  if (L % d === 0) { ok(r.divisible && r.rest === 0 && r.gaps === L / d && r.trees === L / d + 1, `road ${L}/${d}`); ok(r.pos[r.pos.length - 1] === L, 'last tree at the end'); }
  else { ok(!r.divisible && r.rest > 0 && r.rest < d && r.gaps * d + r.rest === L, `leftover ${L}/${d}`); }
}
ok(L1.value === 24 && d1.value === 4 && M.road(24, 4).trees === 7 && M.road(24, 4).gaps === 6, 's1t: 24 m every 4 m → 6 gaps, 7 trees');
for (const d of [2, 8]) ok(M.road(24, d).divisible, 's1hint spacings divide 24: ' + d);

// ---- step 2: the four rules; last column +1, 0, −1, 0 for every spacing ----
const D24 = JSON.parse(app.match(/const D24 = (\[[^\]]+\])/)[1]);
const d2 = slider('d2'); ok(d2.min === 0 && d2.max === D24.length - 1, 'd2 slider indexes D24');
const want = { both: 1, one: 0, none: -1, loop: 0 };
for (const d of D24) {
  ok(24 % d === 0, 'D24 holds divisors of 24: ' + d);
  for (const m of M.MODES) {
    const p = M.plant(24, d, m);
    ok(p.gaps === 24 / d && p.diff === want[m] && p.trees === new Set(p.pos.map(v => m === 'loop' ? v % 24 : v)).size, `plant ${m} d=${d}`);
  }
  ok(M.plant(24, d, 'none').trees === M.plant(24, d, 'both').trees - 2, '“neither end” is two fewer than “both ends”');
}
ok(D24[d2.value] === 4, 'step 2 starts at spacing 4');

// ---- step 3: cuts = pieces − 1; the wrong count is exactly one cut longer ----
const k3 = slider('k3'), per3 = slider('per3');
for (const k of range(k3)) for (const per of range(per3)) {
  const s = M.saw(k - 1, per);
  ok(s.pieces === k && s.minutes === (k - 1) * per && s.wrongMinutes - s.minutes === per, `saw ${k}×${per}`);
}
ok(k3.value === 5 && per3.value === 3 && M.saw(4, 3).minutes === 12 && M.saw(4, 3).wrongMinutes === 15, 's3t: 5 pieces at 3 min → 12 min (wrong 15)');

// ---- step 4: time per interval = T ÷ (a − 1); the proportional answer errs in the stated direction ----
const a4 = slider('a4'), T4 = slider('T4'), b4 = slider('b4');
for (const a of range(a4)) for (const T of range(T4)) for (const b of range(b4)) {
  const e = M.events(a, T, b);
  near(e.timesA[a - 1], T, 'last known event at T');
  near(e.timeB, T * (b - 1) / (a - 1), 'timeB');
  if (b > a) ok(e.wrong < e.timeB - 1e-9, 'cmpLess when asking more'); else if (b < a) ok(e.wrong > e.timeB + 1e-9, 'cmpMore when asking fewer'); else near(e.wrong, e.timeB, 'cmpSame when equal');
}
const e0 = M.events(a4.value, T4.value, b4.value);
ok(a4.value === 3 && T4.value === 6 && b4.value === 6 && e0.timeB === 15 && e0.wrong === 12 && e0.per === 3, 's4t: 3 strikes in 6 s → 6 strikes in 15 s');

// ---- step 5: trees → gaps → length ----
const T5 = slider('T5'), dd5 = slider('d5');
for (const T of range(T5)) for (const d of range(dd5)) {
  const g = { both: T - 1, one: T, none: T + 1, loop: T };
  for (const m of M.MODES) { const r = M.roadFromTrees(T, d, m); ok(r.gaps === g[m] && r.L === g[m] * d && M.plant(r.L, d, m).trees === T, `inverse ${m} T=${T} d=${d}`); }
  ok(M.roadFromTrees(T, d, 'none').L > M.roadFromTrees(T, d, 'one').L && M.roadFromTrees(T, d, 'one').L > M.roadFromTrees(T, d, 'both').L, 's5hint: neither longest, both shortest');
  if (T > T5.min) for (const m of M.MODES) ok(M.roadFromTrees(T, d, m).L - M.roadFromTrees(T - 1, d, m).L === d, 's5hint: one more tree adds one spacing');
}
const Q = M.QUIZ, qa = M.roadFromTrees(Q.T, Q.d, Q.mode).L;
ok(qa === 50 && Object.values(Q.options).filter(v => v === qa).length === 1, 'quiz answer 50 m is exactly one option');
for (const l of ['zh', 'en']) ok(STRINGS[l].quizPrompt.includes('9') && STRINGS[l].quizPrompt.includes('5'), 'quiz prompt matches QUIZ');
ok(app.includes("mode: 'none'") && M.roadFromTrees(7, 5, 'none').L === 40, 'step 5 default: 7 trees, neither end, 5 m → 40 m');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['rel_both', 'rel_one', 'rel_none', 'rel_loop']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) if (!m[1].endsWith('_')) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const p of ['mode_', 'why_', 'rel_']) for (const m of M.MODES) ok(STRINGS.zh[p + m] !== undefined, 'dynamic key ' + p + m);
for (const id of ['n0', 'pair0', 'L1', 'd1', 'd2', 'k3', 'per3', 'cut3', 'all3', 'reset3', 'a4', 'T4', 'b4', 'sc4clock', 'sc4stairs', 'T5', 'd5', 'checkQuiz', ...M.MODES.flatMap(m => ['m2' + m, 'm5' + m])]) ok(html.includes(`id="${id}"`), 'control ' + id);

// ---- deep links land on existing step anchors; comparison link and provenance hooks ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/intervals-fences/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS intervals-fences core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
