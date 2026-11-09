'use strict';
// Division & remainders (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, ...needles) => { for (const l of ['zh', 'en']) for (const n of needles) ok(STRINGS[l][key].includes(n), `${l}.${key} quotes ${n}`); };

// ---- the identity and uniqueness, over every slider combination on the page (and more) ----
for (let N = 0; N <= 400; N++) for (let d = 1; d <= 12; d++) {
  const { q, r } = M.divmod(N, d);
  ok(d * q + r === N && r >= 0 && r < d, `identity ${N} ÷ ${d}`);
  // step 1: exactly one "how many each" is 'done'; smaller ones are 'more', larger ones 'short'
  const statuses = []; for (let k = 0; k <= Math.floor(N / d) + 2; k++) statuses.push(M.tryShare(N, d, k).status);
  ok(statuses.filter(s => s === 'done').length === 1 && statuses.indexOf('done') === q, `unique quotient ${N} ÷ ${d}`);
  ok(statuses.slice(0, q).every(s => s === 'more') && statuses.slice(q + 1).every(s => s === 'short'), `order of statuses ${N} ÷ ${d}`);
  // step 3: exactly one candidate passes both tests; the trap kinds are what the hint says
  const cs = M.candidates(N, d);
  ok(cs.filter(c => M.check(N, d, c.q, c.r).ok).length === 1, `one right candidate ${N} ÷ ${d}`);
  ok(new Set(cs.map(c => c.q + ':' + c.r)).size === 3, `candidates distinct ${N} ÷ ${d}`);
  for (const c of cs) { const v = M.check(N, d, c.q, c.r); if (c.kind === 'big') ok(v.identity && !v.small, 'big trap passes test 1 only'); if (c.kind === 'off') ok(!v.identity && c.r >= 0, 'off trap fails test 1'); }
  // step 2: hops land on multiples of d, last landing = q·d ≤ N < (q+1)·d, remainder shorter than a hop
  const h = M.hops(N, d);
  ok(h.lands.length === q + 1 && h.last === q * d && h.last <= N && h.next > N && N - h.last === r && r < d, `hops ${N} ÷ ${d}`);
}
ok(Math.max(...[].concat(...Array.from({ length: 36 }, (_, i) => Array.from({ length: 10 }, (_, j) => M.hops(i + 5 > 40 ? 40 : i + 5, j + 1).next)))) <= 50, 'next hop stays on the 0..50 axis');
for (let N = 1; N <= 40; N++) for (let d = 1; d <= 10; d++) ok(M.hops(N, d).next <= 50, 'next hop within axis');

// ---- step 0: dealing in rounds reaches the same q, r; plates are always level after a full round ----
for (let N = 5; N <= 30; N++) for (let d = 2; d <= 8; d++) {
  const { q, r, moves } = M.deal(N, d);
  ok(moves.length === q * d, 'dealt cookies = q·d');
  const fin = M.dealState(N, d, moves.length);
  ok(fin.finished && fin.pile === r && !fin.canDealRound && fin.plates.every(p => p === q), `deal ends level ${N} ÷ ${d}`);
  for (let k = 0; k < q; k++) { const s = M.dealState(N, d, k * d); ok(s.canDealRound && s.plates.every(p => p === k), 'after each round the pile still covers a round'); }
  ok(M.dealState(N, d, 10 * N).dealt === q * d, 'dealState clamps');
}
// the page’s default example 13 ÷ 4 = 3 …… 1, and the step-1, 2, 3 examples
assert.deepEqual(M.divmod(13, 4), { q: 3, r: 1 }); checks++;
ok(M.tryShare(17, 5, 2).status === 'more' && M.tryShare(17, 5, 2).left === 7, 's1e: “2 each, 7 left” is not finished');
both('s1e', '17', '5', '2', '7');
assert.deepEqual(M.divmod(17, 5), { q: 3, r: 2 }); checks++;
both('s2e', '0 → 5 → 10 → 15', '20', '3 × 5 = 15');
both('s3e', '47 ÷ 6');
assert.deepEqual(M.divmod(47, 6), { q: 7, r: 5 }); checks++;

// ---- step 4: weekdays (0 = Monday) ----
const w100 = M.weekdayAfter(1, 100);
ok(w100.q === 14 && w100.r === 2 && w100.day === 3, '100 days after Tuesday is Thursday');
both('s4e', '100 ÷ 7 = 14', '2');
for (let s = 0; s < 7; s++) for (let D = 1; D <= 365; D++) {
  // brute-force: walk the days one by one
  let day = s; for (let i = 0; i < D; i++) day = (day + 1) % 7;
  ok(M.weekdayAfter(s, D).day === day, 'weekday by walking');
  if (D % 7 === 0) ok(M.weekdayAfter(s, D).day === s, 'multiples of 7 return to the start');
}

// ---- step 5: boats round up, notebooks round down ----
const b23 = M.boats(23, 5), n23 = M.notebooks(23, 5);
ok(b23.q === 4 && b23.r === 3 && b23.need === 5 && n23.buy === 4 && n23.change === 3, '23 ÷ 5: 5 boats, 4 notebooks, 3 change');
both('s5e', '23 ÷ 5', '4 + 1 = 5', '20');
ok(M.boats(20, 5).need === 4 && M.boats(21, 5).need === 5 && M.notebooks(20, 5).buy === 4 && M.notebooks(21, 5).buy === 4 && M.notebooks(21, 5).change === 1, 's5hint: 20 → 21');
for (let N = 5; N <= 40; N++) for (let d = 2; d <= 9; d++) { const b = M.boats(N, d); ok(b.need === Math.ceil(N / d) && M.notebooks(N, d).buy === Math.floor(N / d), 'ceil / floor'); ok(b.need * d >= N && (b.need - 1) * d < N, 'need is the fewest boats'); }

// ---- step 6: quiz answers ----
const A = M.quizAnswers();
ok(A.every(a => a >= 0), 'every quiz has exactly one right option');
const Q = M.QUIZ;
assert.deepEqual(Q.q1.options[A[0]], { q: 4, r: 5 }); checks++;
ok(Q.q2.options[A[1]] === 59 && Q.q2.options.includes(56) && Q.q2.options.includes(63), 'q2: 59, with 56 = 7×8 and 63 = 7×9 as traps');
ok(Q.q3.options[A[2]] === 6, 'q3: 30 days after Friday is Sunday');
ok(Q.q1.options.filter(o => M.check(29, 6, o.q, o.r).identity).length === 2, 'q1 has one “identity but remainder too big” trap');
both('qz1p', '29 ÷ 6'); both('qz2p', '7', '8', '3'); both('qz3p', '30');
ok(STRINGS.zh.qz3p.includes('星期五') && STRINGS.en.qz3p.includes('Friday'), 'q3 starts on Friday (start = 4)');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['qz1p', 'ledgerBack']); // symbols and numbers only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.foot.includes('除法与余数 · 分不完的那一点') && STRINGS.en.foot.includes('Division & Remainders · What Is Left Over'), 'footer names the original');
ok(STRINGS.zh.compare.includes('对照另一版本：除法与余数 · 分不完的那一点'), 'compare link text');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (let k = 0; k < 7; k++) ok(STRINGS.zh['wd' + k] && STRINGS.zh['wds' + k], 'weekday keys ' + k);
for (const n of [1, 2, 3]) for (const s of ['ok', 'no']) ok(STRINGS.zh['qz' + n + s] !== undefined, 'quiz feedback key');
for (const id of ['N0', 'd0', 'round0', 'all0', 'reset0', 'N1', 'd1', 'q1', 'N2', 'd2', 'hop2', 'N3', 'd3', 'cand0', 'cand1', 'cand2', 'start4', 'D4', 'walk4', 'boat5', 'book5', 'N5', 'd5', 'qz1c', 'qz2c', 'qz3c']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, css, no label guard');
ok(/<meta name="stage" content="primary">/.test(html) && /<meta name="category" content="math">/.test(html), 'stage and category match the original');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/arithmetic/division-remainder/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS division-remainder core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
