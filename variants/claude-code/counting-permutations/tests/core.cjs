'use strict';
// Permutations & combinations (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, text) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(text), `${l}.${key} quotes "${text}"`));
const bothEach = (key, texts) => texts.forEach(x => both(key, x));

// ---- number formatting ----
const trim = eval(app.match(/const trim = ([^\n]+);/)[1]);
ok(trim('90') === '90' && trim('100') === '100' && trim('0.50') === '0.5' && trim('40.00') === '40', 'trim keeps integer zeros');

// ---- basic counting functions ----
ok(M.fact(0) === 1 && M.fact(1) === 1 && M.fact(10) === 3628800, 'factorials');
for (let n = 0; n <= 12; n++) {
  for (let k = 0; k <= n; k++) {
    ok(M.perm(n, k) === M.fact(n) / M.fact(n - k), `A(${n},${k}) = n!/(n−k)!`);
    ok(M.comb(n, k) === M.perm(n, k) / M.fact(k), `C(${n},${k}) = A/k!`);
    ok(M.factors(n, k).reduce((a, b) => a * b, 1) === M.perm(n, k), 'product of the cyan factors');
    if (k > 0 && k < n) ok(M.comb(n, k) === M.comb(n - 1, k - 1) + M.comb(n - 1, k), 'Pascal rule');
  }
  ok(M.perm(n, n + 1) === 0 && M.comb(n, -1) === 0, 'out of range is 0');
}

// ---- step 0: multiplication principle ----
for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) for (let c = 1; c <= 4; c++) {
  const r = M.routes(a, b, c); ok(r.length === a * b * c, 'route count a·b·c');
  ok(new Set(r.map(x => x.join())).size === r.length, 'routes distinct');
  ok(r.every(([i, j, l]) => i >= 1 && i <= a && j >= 1 && j <= b && l >= 1 && l <= c), 'route roads in range');
}
ok(M.routes(3, 2, 4).length === 24, 'default 3 × 2 × 4 = 24');
ok(M.routes(3, 2, 2).length === 12, 'c 4 → 2 halves the total (s0hint)');
ok(html.includes('id="a0" data-step="0" type="range" min="1" max="4" step="1" value="3"') && html.includes('id="b0" data-step="0" type="range" min="1" max="4" step="1" value="2"') && html.includes('id="c0in" data-step="0" type="range" min="1" max="4" step="1" value="4"'), 'step 0 defaults 3, 2, 4');
bothEach('s0hint', ['4', '2']);

// ---- step 1: n! ----
for (let n = 1; n <= 6; n++) { const o = M.orderedPicks(n, n); ok(o.length === M.fact(n) && new Set(o.map(x => x.join())).size === o.length, `${n}! orders listed`); }
ok(M.fact(3) === 6 && M.fact(4) === 24 && M.fact(8) === 40320 && M.fact(10) === 3628800, 's1hint values');
bothEach('s1hint', ['3 × 2 × 1', '24', '40320', '3,628,800']);
ok(STRINGS.zh.s1hint.includes('6 小条') && /Six strips/.test(STRINGS.en.s1hint) && M.fact(3) === 6, 's1hint quotes 6 strips');
ok(html.includes('id="n1" data-step="1" type="range" min="1" max="10" step="1" value="3"'), 'step 1 slider 1..10, default 3');
both('play1', '4');
{ // log axis: each grid line ×100 covers 10! within 4 decades
  ok(Math.log10(M.fact(10)) < 7 && Math.log10(M.fact(10)) > 6, '10! is between 10^6 and 10^7');
  both('s1e', '100');
}

// ---- step 2: A(n, k) ----
const a8 = Array.from({ length: 9 }, (_, k) => M.perm(8, k));
assert.deepEqual(a8, [1, 8, 56, 336, 1680, 6720, 20160, 40320, 40320]); checks++;
ok(STRINGS.zh.s2hint.includes(a8.join('、')) && STRINGS.en.s2hint.includes(a8.join(', ')), 's2hint lists A(8, k)');
ok(M.perm(8, 7) === M.perm(8, 8), 'last two equal');
for (let n = 1; n <= 10; n++) for (let k = 0; k <= n; k++) ok(M.fact(n) / M.fact(n - k) === M.factors(n, k).reduce((a, b) => a * b, 1), 'n!/(n−k)! = product of cyan');
ok(html.includes('id="n2" data-step="2" type="range" min="1" max="10" step="1" value="8"') && html.includes('id="k2" data-step="2" type="range" min="0" max="8" step="1" value="3"'), 'step 2 defaults n = 8, k = 3');
ok(M.perm(8, 3) === 336, 'default A(8,3) = 336');

// ---- step 3: grouping ordered picks by set ----
for (let n = 2; n <= 6; n++) for (let k = 1; k <= Math.min(3, n); k++) {
  const g = M.groupBySet(n, k);
  ok(g.picks.length === M.perm(n, k), `A(${n},${k}) strips`);
  ok(g.rows.length === M.comb(n, k), `C(${n},${k}) frames`);
  g.rows.forEach(r => {
    ok(r.idx.length === M.fact(k), 'k! strips per frame');
    ok(r.idx.every(i => M.setKey(g.picks[i]) === r.key), 'same set in a frame');
    ok(new Set(r.idx.map(i => g.picks[i].join())).size === r.idx.length, 'different orders in a frame');
  });
}
ok(M.perm(5, 3) === 60 && M.comb(5, 3) === 10 && M.fact(3) === 6, 's3hint 60 → 10 × 6');
bothEach('s3hint', ['60', '10', '6', 'k = 1']);
ok(M.groupBySet(5, 2).rows.every(r => r.idx.length === 2), 'k = 2: 2 per frame');
ok(M.comb(5, 1) === M.perm(5, 1), 'k = 1: equally many');
ok(M.groupBySet(6, 3).rows.length === 20, 'n = 6, k = 3 → 20 frames');
ok(html.includes('id="n3" data-step="3" type="range" min="2" max="6" step="1" value="5"') && html.includes('id="k3" data-step="3" type="range" min="1" max="3" step="1" value="3"'), 'step 3 defaults');

// ---- step 4: does the order matter? ----
const SC = M.SCENARIOS; ok(SC.length === 6, 'six scenarios'); both('s4readout', '6');
const expected = [90, 45, 10, 20, 336, 2598960];
SC.forEach((s, i) => {
  ok(M.answer(s) === expected[i], `scenario ${i + 1} answer`);
  ok(M.perm(s.n, s.k) === M.comb(s.n, s.k) * M.fact(s.k), 'bars differ by k!');
  for (const l of ['zh', 'en']) { const q = STRINGS[l]['sc' + i + 'q']; ok(q.includes(String(s.n)) || (s.k === 5 && q.includes('52')), `sc${i}q quotes n`); }
  const why = STRINGS.zh['sc' + i + 'why']; ok(s.ordered ? !why.includes('不算数') : why.includes('不算数'), `sc${i}why agrees with ordered flag`);
  const whyEn = STRINGS.en['sc' + i + 'why']; ok(s.ordered ? !whyEn.includes('does not count') : whyEn.includes('does not count'), `en sc${i}why agrees`);
});
ok(M.perm(52, 5) === 311875200 && M.comb(52, 5) === 2598960 && M.fact(5) === 120, 'five-card hand');
ok(M.comb(5, 2) === 10 && M.perm(5, 2) === 20, 'round robin vs home-and-away');
bothEach('s4hint', ['C(5, 2) = 10', 'A(5, 2) = 20', '2! = 2', '5! = 120']);
ok(['sc2q', 'sc3q'].every(k => STRINGS.zh[k].includes('5') && STRINGS.en[k].includes('5')), '5 teams');
ok(STRINGS.zh.sc4q.includes('8') && STRINGS.zh.sc5q.includes('52') && STRINGS.zh.sc5q.includes('5'), 'podium and hand sizes');

// ---- step 5: the birthday problem ----
ok(M.DAYS === 365, '365 days');
ok(M.firstAbove(0.5) === 23 && M.shared(22) < 0.5, 'first n above 50% is 23');
ok((100 * M.shared(23)).toFixed(1) === '50.7' && (100 * M.shared(57)).toFixed(1) === '99.0', 'n = 23 → 50.7%, n = 57 → 99.0%');
ok(M.firstAbove(0.99) === 57, '57 is the first n at 99%');
ok(M.comb(23, 2) === 253, '23 people make 253 pairs');
bothEach('s5hint', ['23', '50.7%', '57', '99.0%', '253']);
both('tagline', '23');
for (let n = 1; n <= 80; n++) {
  let q = M.perm(365, Math.min(n, 365)); // exact as a float ratio check
  let r = 1; for (let i = 0; i < n; i++) r *= (365 - i) / 365;
  near(M.allDifferent(n), r, 1e-15, 'all different = A(365, n)/365^n');
  if (n <= 5) near(M.allDifferent(n), q / Math.pow(365, n), 1e-15, 'A(365,n)/365^n directly');
  near(M.shared(n) + M.allDifferent(n), 1, 1e-15, 'complement');
  if (n > 1) ok(M.shared(n) > M.shared(n - 1), 'monotone');
}
ok(html.includes('id="n5" data-step="5" type="range" min="2" max="80" step="1" value="23"'), 'step 5 slider 2..80, default 23');
{ // simulations: 100 classes stay within a few percentage points (±15 over a 600-run sweep)
  // "off by a few percentage points is normal": the binomial spread of 100 classes is at most √(100·¼) = 5 points.
  let sumDev = 0, cnt = 0, within10 = 0;
  for (let n = 2; n <= 80; n += 3) {
    ok(Math.sqrt(100 * M.shared(n) * (1 - M.shared(n))) <= 5, 'spread of 100 classes ≤ 5 points');
    for (let seed = 500; seed < 524; seed++) {
      const d = Math.abs(M.simulateRooms(n, 100, seed) - 100 * M.shared(n));
      sumDev += d; cnt++; if (d <= 10) within10++;
    }
  }
  ok(sumDev / cnt < 3, 'mean deviation a few points: ' + (sumDev / cnt));
  ok(within10 / cnt > 0.95, 'over 95% of presses within ±10 points: ' + (within10 / cnt));
  ok(M.simulateRooms(23, 100, 5) === M.simulateRooms(23, 100, 5), 'seeded and repeatable');
  // a long run converges
  near(M.simulateRooms(23, 20000, 1) / 20000, M.shared(23), 0.012, 'long simulation ≈ 50.7%');
}
both('s5lgSim', '100'); both('sim5', '100'); both('s5lgHalf', '50');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => [...new Set(s.match(/\{[a-zA-Z0-9]+\}/g) || [])].sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['c2eq']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(STRINGS[l].foot.includes(l === 'zh' ? '排列与组合 · 数清楚有多少种' : 'Permutations & Combinations · Counting How Many Ways'), 'footer names the original'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].compare.includes(l === 'zh' ? '对照另一版本：排列与组合 · 数清楚有多少种' : 'Permutations & Combinations · Counting How Many Ways'), 'compare link text');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording in ' + l + '.' + k);

// ---- keys, controls, provenance ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(`([A-Za-z0-9_]*)\$\{/g)) ok(zk.some(k => k.startsWith(m[1])), 'template key prefix ' + m[1]);
for (const m of app.matchAll(/t\(\w+ \? '(\w+)' : '(\w+)'/g)) ok(STRINGS.zh[m[1]] && STRINGS.zh[m[2]], 'ternary keys ' + m[1] + '/' + m[2]);
for (let i = 0; i < 6; i++) for (const s of ['btn', 'q', 'why']) ok(STRINGS.zh['sc' + i + s] !== undefined, 'scenario key sc' + i + s);
for (const id of ['a0', 'b0', 'c0in', 'next0', 'list0', 'n1', 'play1', 'n2', 'k2', 'n3', 'k3', 'group3', 'ungroup3', 'check4', 'fb4', 'n5', 'sim5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard') && !app.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
{ const i18nSrc = fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8'); ok(/try \{ lang = window\.localStorage\.getItem\('knowledge-lang'\)/.test(i18nSrc) && /try \{ localStorage\.setItem\('knowledge-lang'/.test(i18nSrc), 'language stored in knowledge-lang inside try'); }
ok(/prefers-reduced-motion/.test(app) && /visibilitychange/.test(app), 'reduced motion and hidden-page handling');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../probability/basics/counting-permutations/index.html')) && html.includes('href="../../../probability/basics/counting-permutations/"'), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(!html.includes('id="step7"'), 'seven steps');
ok(html.includes('name="stage" content="senior"') && html.includes('name="category" content="probability"'), 'stage and category');

console.log(`PASS counting-permutations core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · birthday 23 → ${(100 * M.shared(23)).toFixed(1)}%`);
