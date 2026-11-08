'use strict';
// Vowel space core checks. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// Pinned values are the group means computed by tests/pb-means.cjs from Praat's Peterson & Barney table
// (dwtools/Table_dataSets.cpp @ 6a9874e525d80a2b4c2e6a8d687081963c6d4e6a). They are NOT the published
// rounded Table II of the 1952 article, which this page did not fetch.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const V = require(path.join(dir, 'sim-core.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const M = V.MEANS;

// 1. Pinned data (F0, F1, F2, F3 in Hz) — a sample from each group plus the claims quoted in the text.
assert.deepEqual(M.m.iy, [136, 267, 2294, 2937]); assert.deepEqual(M.m.aa, [124, 718, 1091, 2442]);
assert.deepEqual(M.m.er, [133, 489, 1360, 1709]); assert.deepEqual(M.m.eh, [128, 526, 1854, 2481]);
assert.deepEqual(M.w.iy, [231, 310, 2783, 3312]); assert.deepEqual(M.w.ao, [217, 587, 915, 2736]);
assert.deepEqual(M.c.ih, [270, 534, 2744, 3604]); assert.deepEqual(M.c.ae, [248, 1017, 2334, 3366]);
assert.deepEqual(V.TOKENS, { m: 66, w: 56, c: 30 });
assert.deepEqual(V.IDS, ['iy', 'ih', 'eh', 'ae', 'ah', 'aa', 'ao', 'uh', 'uw', 'er']);
assert.deepEqual(V.VOWELS.map(v => v.word), ['heed', 'hid', 'head', 'had', 'hud', 'hod', 'hawed', 'hood', "who'd", 'heard']);
for (const g of V.GROUPS) for (const v of V.IDS) { const d = M[g][v]; assert.ok(d.length === 4 && d[0] < d[1] && d[1] < d[2] && d[2] < d[3], `F0<F1<F2<F3 ${g} ${v}`); }

// 2. Label sanity (acoustic ordering of the Praat labels): ʌ F2 > ɑ F2 > ɔ F2, and ɔ has the lowest F1 of the three.
for (const g of V.GROUPS) {
  assert.ok(M[g].ah[2] > M[g].aa[2] && M[g].aa[2] > M[g].ao[2], 'F2 order ah>aa>ao ' + g);
  assert.ok(M[g].ao[1] < M[g].ah[1] && M[g].ao[1] < M[g].aa[1], 'ao lowest F1 of the three ' + g);
}
// 3. Statements in s1hint / s1er (men): lowest F1 heed & who'd, highest F1 had & hod, F2 max heed, min hawed; er F3 lowest.
const by = (g, j) => [...V.IDS].sort((a, b) => M[g][a][j] - M[g][b][j]);
assert.deepEqual(by('m', 1).slice(0, 2).sort(), ['iy', 'uw']); assert.deepEqual(by('m', 1).slice(-2).sort(), ['aa', 'ae']);
assert.equal(by('m', 2).at(-1), 'iy'); assert.equal(by('m', 2)[0], 'ao');
assert.equal(by('m', 3)[0], 'er'); assert.equal(Math.min(...V.IDS.filter(v => v !== 'er').map(v => M.m[v][3])), 2239);
// 4. s0hint: harmonic spacing ≈136 Hz (men, heed) vs ≈270 Hz (children, heed).
assert.equal(M.m.iy[0], 136); assert.equal(M.c.iy[0], 270);
assert.deepEqual(V.harmonics(100, 350), [100, 200, 300]);
// 5. s2hint: children ÷ men ratios mostly between 1.2 and 1.5, not all equal; women and children higher than men.
const ratios = V.IDS.flatMap(v => [M.c[v][1] / M.m[v][1], M.c[v][2] / M.m[v][2]]);
assert.ok(ratios.filter(r => r >= 1.2 && r <= 1.5).length >= 14, 'most ratios in 1.2–1.5: ' + ratios.map(r => r.toFixed(2)));
assert.ok(Math.max(...ratios) - Math.min(...ratios) > 0.2, 'ratios not all the same');
for (const v of V.IDS) for (const j of [1, 2]) assert.ok(M.c[v][j] > M.m[v][j] && M.w[v][j] > M.m[v][j], 'higher than men ' + v + j);
// 6. Steps 3–4: nearest men's template. Raw: women 7/10, children 3/10 (children's hid → head). Rescaled: 10/10 both.
assert.equal(V.correct('w', 0), 7); assert.equal(V.correct('c', 0), 3);
assert.equal(V.classify('c', 0).find(r => r.v === 'ih').as, 'eh');
assert.equal(V.correct('w', 1), 10); assert.equal(V.correct('c', 1), 10);
for (const g of ['w', 'c']) { let prev = Infinity; for (let l = 0; l <= 1.0001; l += 0.05) { const s = V.spread(g, l); assert.ok(s <= prev + 1e-12, 'spread shrinks ' + g); prev = s; } }
assert.equal(V.correct('m', 0), 10); assert.equal(V.spread('m', 0.7), 0);
// Rescaling by the geometric-mean ratio is a pure shift in log space (shape preserved).
const d0 = V.dist(V.point('c', 'iy', 0), V.point('c', 'uw', 0)), d1 = V.dist(V.point('c', 'iy', 1), V.point('c', 'uw', 1));
assert.ok(Math.abs(d0 - d1) < 1e-12);
const gm = V.groupLogMean('m').map(Math.exp); assert.ok(Math.abs(gm[0] - 477.6) < 0.1 && Math.abs(gm[1] - 1345.2) < 0.1);

// 7. Bilingual parity, keys, links.
const zk = Object.keys(STRINGS.zh).sort(); assert.deepEqual(zk, Object.keys(STRINGS.en).sort());
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders ' + k); assert.ok(STRINGS.zh[k] && STRINGS.en[k], 'non-empty ' + k); }
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) assert.ok(STRINGS.zh[m[1]], 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) assert.ok(STRINGS.zh[m[1]], 'app key ' + m[1]);
for (const k of ['gm', 'gw', 'gc']) assert.ok(STRINGS.zh[k]);
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) { const [rel, a] = h.split('#'), tg = path.join(dir, rel, 'index.html'); assert.ok(fs.existsSync(tg), h); assert.ok(fs.readFileSync(tg, 'utf8').includes(`id="${a}"`), h); }
for (let i = 0; i <= 5; i++) assert.ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`));
console.log(`PASS vowel-space core: pinned P&B means, label ordering, text claims, template recognition 7/3 → 10/10, ${zk.length} bilingual keys, ${new Set(hrefs).size} deep links`);
