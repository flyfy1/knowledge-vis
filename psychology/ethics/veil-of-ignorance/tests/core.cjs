'use strict';
// Veil of ignorance core checks. Author: Claude Code (claude-opus-5-5), 2026-11-08.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const V = require(path.join(dir, 'sim-core.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const S = V.SOCIETIES, close = (a, b, tol, m) => assert.ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// 1. The two rules pick what the text says.
assert.equal(V.choose.average(S).k, 'B'); assert.equal(V.mean(S.B), 45);
assert.equal(V.choose.maximin(S).k, 'A'); assert.deepEqual(['A', 'B', 'C'].map(k => V.min(S[k])), [30, 10, 20]);
// 2. Certainty equivalent: η = 0 is the mean, large η approaches the minimum, monotone in η.
for (const k of ['A', 'B', 'C']) {
  close(V.ce(S[k], 0), V.mean(S[k]), 1e-12, 'ce(0)=mean ' + k);
  close(V.ce(S[k], 200), V.min(S[k]), 0.5, 'ce(large)≈min ' + k);
  let prev = Infinity; for (let e = 0; e <= 8; e += 0.25) { const v = V.ce(S[k], e); assert.ok(v <= prev + 1e-9, 'monotone ' + k); prev = v; }
}
close(V.ce([4, 9], 1), 6, 1e-12, 'η=1 is the geometric mean');
// 3. Regime boundaries quoted in s3hint: B until about 0.8, C until about 3.5, then A.
const winner = e => V.choose.eta(S, e).k;
assert.equal(winner(0), 'B'); assert.equal(winner(0.75), 'B'); assert.equal(winner(0.85), 'C');
assert.equal(winner(3.45), 'C'); assert.equal(winner(3.55), 'A'); assert.equal(winner(8), 'A');
// 4. Redistribution: k = 0 → maximin goes to t = 1; k = 0.6 → interior optimum solving 63t² + 12t − 35 = 0.
assert.equal(V.bestT(S.B, 0, V.min).t, 1);
close(V.bestT(S.B, 0.6, V.min).t, (-12 + Math.sqrt(144 + 4 * 63 * 35)) / 126, 0.001, 'maximin best t');
assert.equal(V.bestT(S.B, 0.6, V.mean).t, 0, 'average rule never levels when levelling is costly');
const tEta = V.bestT(S.B, 0.6, xs => V.ce(xs, 2)).t; assert.ok(tEta > 0 && tEta < V.bestT(S.B, 0.6, V.min).t, 'η in between');
// Redistribution preserves the mean when k = 0 and shrinks it by (1 − k t²) otherwise.
close(V.mean(V.redistribute(S.B, 0.5, 0)), 45, 1e-9, 'mean kept'); close(V.mean(V.redistribute(S.B, 0.5, 0.6)), 45 * 0.85, 1e-9, 'mean shrinks');
// 5. Draws are uniform over the five positions (deterministic generator).
const d = V.drawer(5), cnt = [0, 0, 0, 0, 0]; for (let i = 0; i < 50000; i++) cnt[d()]++;
cnt.forEach(c => close(c / 50000, 0.2, 0.01, 'uniform draw'));

// 6. Bilingual parity, keys, links.
const zk = Object.keys(STRINGS.zh).sort(); assert.deepEqual(zk, Object.keys(STRINGS.en).sort());
const ph = s => (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders ' + k); assert.ok(STRINGS.zh[k] && STRINGS.en[k], 'non-empty ' + k); }
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) assert.ok(STRINGS.zh[m[1]], 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) assert.ok(STRINGS.zh[m[1]], 'app key ' + m[1]);
for (const k of ['A', 'B', 'C']) assert.ok(STRINGS.zh['soc' + k]);
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) { const [rel, a] = h.split('#'), tg = path.join(dir, rel, 'index.html'); assert.ok(fs.existsSync(tg), h); assert.ok(fs.readFileSync(tg, 'utf8').includes(`id="${a}"`), h); }
for (let i = 0; i <= 5; i++) assert.ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`));
console.log(`PASS veil-of-ignorance core: rule choices, CE limits, regime boundaries, redistribution optimum, ${zk.length} bilingual keys, ${new Set(hrefs).size} deep links`);
