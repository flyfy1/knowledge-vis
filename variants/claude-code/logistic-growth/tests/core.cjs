'use strict';
// Population Growth (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const Z = STRINGS.zh, E = STRINGS.en;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const attr = (id, a) => Number(html.match(new RegExp(`id="${id}"[^>]*\\b${a}="([^"]+)"`))[1]);

// ---- step 0: doubling ----
ok(M.cellsAfter(10) === 1024, '2^10');
near(M.cellsAfter(72), 4.72e21, 0.01e21, '2^72 ≈ 4.7 × 10²¹ cells');
near(M.gramsAfter(72) / 1e6, 4722, 1, 'one day (72 gens) ≈ 4722 t');
ok(72 * M.BACT.genMin === 24 * 60, '72 generations of 20 min = 24 h');
// quiz: option c (≈ 5000 t) is the only one within a factor of 2
const opts = { a: 1, b: 1e6, c: 5e9 }, m72 = M.gramsAfter(72);
ok(Object.entries(opts).filter(([, g]) => g / m72 < 2 && m72 / g < 2).map(([k]) => k).join() === 'c', 'quiz answer c');
ok(html.includes('value="c"') && /value === 'c'/.test(app), 'app checks option c');
const gen = id => Math.ceil(M.gensToReach(M.REF.find(x => x.id === id).g));
ok(gen('human') < gen('whale') && gen('whale') < gen('pyramid') && gen('pyramid') < gen('earth'), 'references passed in order human, whale, pyramid, earth');
ok(gen('earth') === 133 && gen('earth') <= attr('g0', 'max'), 'Earth passed at generation 133, within the slider');
near(gen('earth') / 3, 44.3, 0.05, 'Earth at ≈ 44.3 h (s0hint, < 2 days in tagline)');
ok(gen('earth') * M.BACT.genMin / 60 < 48, 'less than two days');
ok(M.biggestBelow(M.gramsAfter(gen('earth'))).id === 'earth' && M.biggestBelow(M.gramsAfter(gen('earth') - 1)).id === 'pyramid', 'earth comparison switches exactly at 133');
ok(M.biggestBelow(1) === null, 'no comparison for tiny masses');
for (const l of ['zh', 'en']) ok(STRINGS[l].o_human.includes('60') && STRINGS[l].o_whale.includes('150'), 'reference masses in labels ' + l);
ok(Z.o_pyramid.includes('600 万吨') && E.o_pyramid.includes('6 million'), 'pyramid 6e12 g');

// ---- step 1: exponential ----
for (let r = 0.1; r <= 1.5001; r += 0.05) {
  const Td = M.doublingTime(r);
  near(M.expN(10, r, Td), 20, 1e-9, 'doubling time ln2/r');
  near(M.expN(1000, r, 3 + Td) / M.expN(1000, r, 3), 2, 1e-9, 'doubling independent of N');
  near(M.expN(10, r, Math.log(100) / r), 1000, 1e-9, '10 → 1000 in ln100/r');
}
near(M.doublingTime(1) / M.doublingTime(2), 2, 1e-12, 'r doubled → spacing halved');
near(M.perCapita(0.5, Infinity, 1000), 0.5, 1e-12, 'exponential per-capita rate equals r');
ok(1.5 <= 1.6, 'r range fits per-capita axis 0..1.6');

// ---- step 2: logistic ----
for (const K of [200, 600, 1000]) for (const r of [0.1, 0.5, 1.5]) {
  near(M.logN(10, r, K, 0), 10, 1e-9, 'starts at N0');
  const nh = K / 2, th = M.tInflection(10, r, K);
  near(M.logN(10, r, K, th), nh, 1e-6, 'N = K/2 at t*');
  near(M.perCapita(r, K, nh), r / 2, 1e-12, 'half of K → half of r (s2hint)');
  ok(M.logN(10, r, K, 24) <= K + 1e-9, 'never above K from below');
  for (let t = 0; M.expN(10, r, t) < K / 10; t += 0.1) ok(M.logN(10, r, K, t) / M.expN(10, r, t) > 0.9, 'while N ≪ K the two curves nearly coincide');
  for (let t = 0; t <= 24; t += 0.2) ok(M.logN(10, r, K, t) <= M.expN(10, r, t) + 1e-9, 'logistic below exponential');
}
near(M.logN(10, 0.5, 600, 24), 600, 2, 'default curve levels off at K by 24 h');
ok(attr('k2', 'max') <= 1100, 'K fits the 0..1100 axis');
ok(Math.abs(M.logN(10, 0.5, 200, 3) - M.logN(10, 0.5, 1000, 3)) / M.logN(10, 0.5, 1000, 3) < 0.12, 'K barely changes the early part (s2hint)');

// ---- step 3: inflection ----
const r3 = 0.5, K3 = 600;
near(M.tInflection(10, r3, K3), 8.16, 0.01, 't* ≈ 8.2 h');
ok(M.peakN(K3) === 300 && M.peakGrowth(r3, K3) === 75, 'peak at N = 300, rK/4 = 75');
let best = { g: -1 };
for (let N = 0; N <= K3; N += 0.5) { const g = M.growth(r3, K3, N); if (g > best.g) best = { g, N }; }
ok(best.N === 300 && near0(best.g - 75), 'parabola maximum is K/2');
function near0(x) { return Math.abs(x) < 1e-9; }
let steep = { s: -1 };
for (let t = 0; t <= 24; t += 0.01) { const s = (M.logN(10, r3, K3, t + 1e-4) - M.logN(10, r3, K3, t - 1e-4)) / 2e-4; if (s > steep.s) steep = { s, t }; }
near(steep.t, M.tInflection(10, r3, K3), 0.011, 'S-curve steepest at t*');
near(steep.s, 75, 0.01, 'steepest slope equals rK/4');
for (let N = 0; N <= 600; N += 10) ok(M.growth(r3, K3, N) <= 90, 'fits 0..90 axis');

// ---- step 4: K attracts ----
for (let n0 = 10; n0 <= attr('n4', 'max'); n0 += 10) {
  const n24 = M.logN(n0, 0.5, 600, 24);
  near(n24, 600, 3, `start ${n0} → near K after 24 h`);
  ok(n24 <= 1050 && n0 <= 1050, 'fits 0..1050 axis');
  if (n0 > 600) ok(M.growth(0.5, 600, n0) < 0 && M.growth(0.5, 600, n0) >= -350, 'above K shrinks, within −350 axis');
  if (n0 < 600) ok(M.growth(0.5, 600, n0) > 0, 'below K grows');
}
ok(M.logN(600, 0.5, 600, 13) === 600, 'start at K stays flat');
ok(M.growth(0.5, 600, 0) === 0 && M.growth(0.5, 600, 600) === 0, 'equilibria 0 and K');
ok(M.growth(0.5, 600, 1) > 0, '0 is unstable: one individual grows');
ok(attr('n4', 'value') === 1000 && attr('n4', 'step') === 10, 'default 1000, step lets 600 be chosen');

// ---- step 5: yeast ----
ok(M.YEAST.length === 19 && M.YEAST[0] === 9.6 && M.YEAST[18] === 661.8, 'Carlson data 0..18 h');
const F = M.fitLogistic();
near(F.r, 0.54, 0.005, 'fit r ≈ 0.54 (s7fin)'); near(F.K, 664, 0.5, 'fit K ≈ 664 (s7fin)');
for (const [dr, dK] of [[0.01, 0], [-0.01, 0], [0, 5], [0, -5]]) ok(M.sse(F.r + dr, F.K + dK) > F.sse, 'fit is a local minimum');
// "auto-fit" snaps to the slider grid; that grid point is the best grid point
const gr = Math.round(F.r * 100) / 100, gK = Math.round(F.K / 5) * 5;
let gb = Infinity, gbAt = null;
for (let r = 0.2; r <= 1.0001; r += 0.01) for (let K = 400; K <= 900; K += 5) { const e = M.sse(r, K); if (e < gb) { gb = e; gbAt = [Math.round(r * 100) / 100, K]; } }
ok(gbAt[0] === gr && gbAt[1] === gK, `fit button lands on the best slider point (${gbAt})`);
ok(F.r >= attr('r5', 'min') && F.r <= attr('r5', 'max') && F.K >= attr('k5', 'min') && F.K <= attr('k5', 'max'), 'fit inside slider ranges');
near(M.rms(F.r, F.K), 3.34, 0.01, 'RMS ≈ 3.3');
ok(M.rms(0.4, 800) > 20 * M.rms(F.r, F.K), 'default setting is visibly bad');
const X = M.fitExpEarly(7);
near(X.r, 0.477, 0.001, 'early exponential r');
ok(X.at(18) > 50 * M.YEAST[18], 'exponential overshoots by far at 18 h (s5hint)');
ok(X.at(18) > 900, 'exponential leaves the 0..900 axis');
for (let i = 0; i < 7; i++) ok(Math.abs(Math.log(X.at(i) / M.YEAST[i])) < 0.15, 'exponential describes the first hours');
for (let r = 0.2; r <= 1.0001; r += 0.05) for (let K = 400; K <= 900; K += 50) ok(M.logN(9.6, r, K, 18) <= 900, 'model fits 0..900 axis');

// ---- step 6: discrete ----
const kinds = r => M.classify(r);
for (let r = 0.1; r <= 1.0001; r += 0.05) { ok(kinds(r).kind === 'monotone', 'monotone for r ≤ 1: ' + r); ok(M.iterate(0.05, r, 200).every(x => x <= 1 + 1e-12), 'never above K'); }
for (let r = 1.05; r <= 2.0001; r += 0.05) ok(kinds(r).kind === 'damped', 'damped for 1 < r ≤ 2: ' + r);
for (let r = 2.05; r <= 2.4001; r += 0.05) ok(kinds(r).kind === 'cycle' && kinds(r).period === 2, '2-cycle ' + r);
ok(kinds(2.45).period === 4 && kinds(2.5).period === 4, '4-cycle from ≈ 2.45');
ok(kinds(2.55).kind === 'cycle' && kinds(2.55).period === 8, 'period 8 at 2.55');
for (let r = 2.6; r <= 2.9001; r += 0.05) ok(kinds(r).kind === 'chaos', 'chaos ' + r);
for (const [id, r] of [['p6a', 0.8], ['p6b', 1.8], ['p6c', 2.2], ['p6d', 2.8]]) ok(html.includes(`id="${id}" type="button" data-step="6" data-r="${r}"`) && STRINGS.zh[id] === 'r = ' + r, 'preset ' + id);
{ const xs = M.iterate(0.05, 1.8, 40); ok(Math.max(...xs) > 1.05 && xs.slice(1).some((x, i) => x < 1 && xs[i] > 1), 'r = 1.8 visibly overshoots and swings back'); }
ok(kinds(0.8).kind === 'monotone' && kinds(1.8).kind === 'damped' && kinds(2.2).kind === 'cycle' && kinds(2.8).kind === 'chaos', 'four presets show four behaviours');
near(Math.sqrt(6), 2.449, 0.001, 'period-4 onset √6 ≈ 2.45');
for (let r = 0.1; r <= 2.9001; r += 0.05) ok(M.iterate(0.05, r, 40).every(x => x > 0 && x < 1.4), 'series fits 0..1.4 axis');
// sensitivity: 1e-6 apart → very different after 50 gens at r = 2.8
ok(Math.abs(M.iterate(0.05, 2.8, 60)[60] - M.iterate(0.050001, 2.8, 60)[60]) > 0.1, 'chaos: tiny start difference grows');
ok(attr('r6', 'max') === M.MAX_R, 'slider capped at 2.9');

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lgParab', 'p6a', 'p6b', 'p6c', 'p6d']);
for (const k of zk) ok(NEUTRAL.has(k) || Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left picture|right picture/i.test(v), 'no left/right figure references');
for (const l of ['zh', 'en']) { ok(STRINGS[l].s7fin.includes('0.54') && STRINGS[l].s7fin.includes('664'), 'finale fit numbers ' + l); }
for (const l of ['zh', 'en']) ok(STRINGS[l].s3e.includes('0.5') && STRINGS[l].s3e.includes('600') && STRINGS[l].s3e.includes('10'), 'step 3 parameters ' + l);
for (const l of ['zh', 'en']) ok(STRINGS[l].s6hint.includes('2.45') && STRINGS[l].s6hint.includes('2.57'), 'step 6 thresholds ' + l);
ok(Z.s3hint.includes('1992') && E.s3hint.includes('1992'), 'cod collapse year');

// ---- keys used in HTML/app exist ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (const kind of ['monotone', 'damped', 'cycle', 'chaos']) ok(Z['k_' + kind] !== undefined, 'kind key ' + kind);
for (const id of ['human', 'whale', 'pyramid', 'earth']) ok(Z['o_' + id] !== undefined, 'object key ' + id);
for (const u of ['g', 'kg', 't']) ok(Z['unit_' + u] !== undefined, 'unit key ' + u);
ok(!/canvas-label-guard/.test(html), 'no label guard');

// ---- links ----
const allText = html + Object.values(Z).join(' ') + Object.values(E).join(' ');
const hrefs = [...allText.matchAll(/href="(\.\.\/[^"]+)"/g)].map(m => m[1]).filter(h => !h.endsWith('.css'));
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  if (anchor) ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(html.includes('href="../../../biology/ecology/logistic-growth/"'), 'comparison link');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS logistic-growth core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} links · fit r=${F.r.toFixed(3)} K=${F.K.toFixed(1)}`);
