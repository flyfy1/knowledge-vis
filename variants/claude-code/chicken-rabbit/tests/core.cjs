'use strict';
// Chickens & Rabbits (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, needle, msg) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(needle), `${msg} (${l}: ${key} contains ${needle})`); };

// ---- the puzzle: 10 heads, 28 feet → 6 chickens, 4 rabbits ----
const s = M.solveCR(M.S0.heads, M.S0.feet);
ok(s.ok && s.nb === 4 && s.na === 6 && M.feet(6, 4) === 28, '10 heads, 28 feet: 6 chickens, 4 rabbits');
ok(s.base === 20 && s.gap === 8 && s.step === 2 && s.top === 40 && s.over === 12, 'all chickens 20 (gap 8), all rabbits 40 (over 12)');
for (const k of ['s1e']) { both(k, '20', 'assume-all-chickens feet'); both(k, '8 ÷ 2 = 4', 'gap ÷ 2'); }
both('s4e', '40', 'all rabbits 40'); both('s4e', '12 ÷ 2 = 6', 'over ÷ 2'); both('s4e', '10 − 6 = 4', 'rabbits from chickens');
both('s2e', '28 − 20 = 8', 'lifting leaves 8'); both('s2e', '8 ÷ 2 = 4', 'lifting gives 4 rabbits');

// ---- step 0: every guess adds exactly 2 feet; only r = 4 hits ----
for (let r = 0; r <= 10; r++) {
  const f = M.feet(10 - r, r);
  ok(f === 20 + 2 * r, 'feet = 20 + 2r');
  ok((f === 28) === (r === 4), 'only 4 rabbits gives 28');
  ok(f >= 18 && f <= 42, 'guess fits the drawn number line 18..42');
}

// ---- step 1: swap path from all chickens ----
assert.deepEqual(M.pathFromChickens(10, 28), [20, 22, 24, 26, 28]); checks++;
assert.deepEqual(M.pathFromRabbits(10, 28), [40, 38, 36, 34, 32, 30, 28]); checks++;

// ---- step 2: lifting ----
const L = M.lift(10, 28);
ok(L.lifted === 20 && L.ground === 8 && L.rabbits === 4, 'lift: 20 up, 8 down, 4 rabbits');

// ---- step 3: the general rule over the whole slider grid ----
for (let H = M.S3.hMin; H <= M.S3.hMax; H++) for (let F = M.S3.fMin; F <= M.S3.fMax; F++) {
  const q = M.solveCR(H, F);
  if (F < 2 * H) ok(!q.ok && q.reason === 'low', 'too few feet');
  else if (F > 4 * H) ok(!q.ok && q.reason === 'high', 'too many feet');
  else if (F % 2) ok(!q.ok && q.reason === 'frac', 'odd feet');
  else {
    ok(q.ok && q.nb === (F - 2 * H) / 2 && q.na === (4 * H - F) / 2, 'rabbits = (F − 2H)/2, chickens = (4H − F)/2 (formula in s6)');
    ok(M.feet(q.na, q.nb) === F && q.na + q.nb === H, 'answer checks out');
    // step 4: both walks end at the same answer; swap counts add up to H
    const pc = M.pathFromChickens(H, F), pr = M.pathFromRabbits(H, F);
    ok(pc[pc.length - 1] === F && pr[pr.length - 1] === F, 'both paths reach F');
    ok(pc.length - 1 === q.nb && pr.length - 1 === q.na && (pc.length - 1) + (pr.length - 1) === H, 'chicken path steps = rabbits, rabbit path steps = chickens, sum = H');
    pc.forEach((v, i) => ok(i === 0 || v - pc[i - 1] === 2, 'each swap adds 2'));
    // lifting agrees with the gap rule
    ok(M.lift(H, F).rabbits === q.nb, 'lifting = gap ÷ 2');
  }
}

// ---- step 5: stories ----
const exp5 = { bikes: [5, 7], tickets: [9, 6], bugs: [4, 6] };
M.STORIES.forEach(st => {
  const q = M.solve(st.n, st.total, st.a, st.b);
  ok(q.ok && q.na === exp5[st.id][0] && q.nb === exp5[st.id][1], `${st.id} default answer`);
  ok(st.n * st.b <= st.tMax && st.n <= st.nMax, `${st.id} default fits the sliders`);
  for (const l of ['zh', 'en']) {
    const story = STRINGS[l][st.id + 'Story'];
    ok(story && story.includes(String(st.a)) && story.includes(String(st.b)), `${st.id} story quotes ${st.a} and ${st.b} (${l})`);
    for (const suf of ['A', 'B', 'U', 'Q']) ok(STRINGS[l][st.id + suf], `${st.id}${suf} (${l})`);
  }
  for (let n = 1; n <= st.nMax; n++) for (let T = 1; T <= st.tMax; T++) {
    const r = M.solve(n, T, st.a, st.b);
    if (r.ok) ok(r.na * st.a + r.nb * st.b === T && r.na + r.nb === n && r.na >= 0 && r.nb >= 0, 'story answer checks out');
    else if (r.reason === 'frac') ok(r.lo < r.gap / r.step && r.gap / r.step < r.hi, 'frac bounds');
    else ok((r.reason === 'low') === (T < n * st.a) && (r.reason === 'high') === (T > n * st.b), 'range reasons');
  }
});
ok(M.STORIES.map(st => st.b - st.a).join() === '1,3,2', 's5hint: step heights 1, 3, 2');
for (const l of ['zh', 'en']) ok(/1.*3.*2/s.test(STRINGS[l].s5hint), 's5hint quotes the step heights in order');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
// {q} is the Chinese measure word (辆/张/只); English phrasing does not need it.
const ph = x => (x.match(/\{[a-zA-Z0-9]+\}/g) || []).filter(p => p !== '{q}').sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.compare.includes('鸡兔同笼 · 先假设，差额会说话') && STRINGS.en.compare.includes('Chickens & Rabbits · Assume First, Let the Gap Speak'), 'compare link names the original');

// ---- keys, controls, provenance ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['r0', 'clear0', 'swap1', 'auto1', 'reset1', 'lift2', 'down2', 'h3', 'f3', 'fromC4', 'fromR4', 'both4', 'story0', 'story1', 'story2', 'n5', 't5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('value="10"') && html.includes('value="28"'), 'step 3 defaults 10 / 28');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/chicken-rabbit/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS chicken-rabbit core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
