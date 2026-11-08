'use strict';
// Signal detection core checks. Author: Claude Code (claude-opus-5-5), 2026-11-08.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const S = require(path.join(dir, 'sim-core.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// 1. Reproduce Table 1 of M. Georgeson's Birmingham SDT handout (p. 3), to its 3 printed decimals.
close(S.z(0.8), 0.842, 5e-4, 'z(0.80)'); close(S.z(0.98), 2.054, 5e-4, 'z(0.98)'); close(S.z(0.38), -0.305, 5e-4, 'z(0.38)');
const doc = S.measures(0.8, 0.2), mac = S.measures(0.98, 0.38);
close(doc.dprime, 1.683, 5e-4, "doctors d'"); close(doc.c, 0, 5e-4, 'doctors C'); close(doc.pc, 0.8, 1e-12, 'doctors P(c)');
close(mac.dprime, 2.359, 5e-4, "machine d'"); close(mac.c, -0.874, 5e-4, 'machine C'); close(mac.pc, 0.8, 1e-12, 'machine P(c)');

// 2. Model consistency: rates from (d, k) recover d and c exactly; c is k minus the midpoint.
for (const d of [0.5, 1, 1.5, 2.5]) for (const c of [-1, -0.3, 0, 0.7]) {
  const r = S.rates(d, S.kFromC(d, c)), m = S.measures(r.H, r.F);
  close(m.dprime, d, 1e-6, `d recovered (d=${d}, c=${c})`); close(m.c, c, 1e-6, `c recovered (d=${d}, c=${c})`);
}
// Moving the criterion moves H and F in the same direction (lax → both up).
const strict = S.rates(1.5, S.kFromC(1.5, 1)), lax = S.rates(1.5, S.kFromC(1.5, -1));
assert.ok(lax.H > strict.H && lax.F > strict.F);
// d' = 0 is the ROC diagonal.
for (const k of [-1, 0, 0.5, 2]) { const r = S.rates(0, k); close(r.H, r.F, 1e-12, 'diagonal'); }

// 3. Simulated trials converge on the model rates (fixed seed, so this is deterministic).
const tl = S.tally(S.trials(1.5, 0.75, 40000, 7)), model = S.rates(1.5, 0.75);
close(tl.hit / 20000, model.H, 0.01, 'simulated H'); close(tl.fa / 20000, model.F, 0.01, 'simulated F');
assert.deepEqual(S.trials(1.5, 0.75, 20, 3), S.trials(1.5, 0.75, 20, 3), 'reproducible');

// 4. Expected-cost minimum matches the likelihood-ratio rule x* = ln(beta)/d' + d'/2,
//    beta = ((1−p)·f)/(p·m) (equal-variance model), and moves the right way.
for (const [p, m] of [[0.5, 1], [0.5, 4], [0.2, 1], [0.8, 10]]) {
  const best = S.bestK(1.5, p, m, 1), beta = (1 - p) / (p * m);
  close(best.k, Math.log(beta) / 1.5 + 0.75, 0.002, `optimal criterion p=${p} m=${m}`);
}
assert.ok(S.bestK(1.5, 0.5, 10, 1).k < S.bestK(1.5, 0.5, 1, 1).k, 'costlier misses → laxer');
assert.ok(S.bestK(1.5, 0.8, 1, 1).k < S.bestK(1.5, 0.2, 1, 1).k, 'commoner signal → laxer');

// 5. Bilingual parity, keys used, deep links resolve.
const zk = Object.keys(STRINGS.zh).sort();
assert.deepEqual(zk, Object.keys(STRINGS.en).sort());
const ph = s => (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join();
for (const k of zk) assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders ' + k);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) assert.ok(STRINGS.zh[m[1]], 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) assert.ok(STRINGS.zh[m[1]], 'app key ' + m[1]);
for (const p of ['A', 'B', 'C']) assert.ok(STRINGS.zh['pred' + p]);
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  assert.ok(fs.existsSync(target), 'link target ' + h);
  assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
for (let i = 0; i <= 6; i++) assert.ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`));
console.log(`PASS signal-detection core: handout Table 1 reproduced, model round-trip, simulation, cost optimum, ${zk.length} bilingual keys, ${new Set(hrefs).size} deep links`);
