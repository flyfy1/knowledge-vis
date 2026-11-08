'use strict';
// Step response core checks. Author: Claude Code (claude-opus-5-5), 2026-11-08.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const S = require(path.join(dir, 'sim-core.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));

// 1. Simulated metrics agree with the textbook closed forms for 0 < ζ < 1.
for (const [z, w] of [[0.1, 2], [0.3, 2], [0.5, 1], [0.6, 5], [0.9, 3]]) {
  const m = S.metrics(S.simulate(z, w, 40)), fo = S.formulas(z, w);
  assert.ok(Math.abs(m.overshoot - fo.overshoot) < 0.05, `overshoot ζ=${z}: ${m.overshoot} vs ${fo.overshoot}`);
  assert.ok(Math.abs(m.peakTime - fo.peakTime) < 0.01, `peak time ζ=${z}`);
}
// 4/(ζωn) is only an estimate: within ±25 % of the measured settling time over the page's range.
for (let z = 0.1; z < 0.951; z += 0.05) { const r = S.metrics(S.simulate(z, 1, 200)).settling / (4 / z); assert.ok(r > 0.75 && r < 1.3, `settling ratio ζ=${z.toFixed(2)}: ${r}`); }
// Overshoot does not depend on ωn; time scales as 1/ωn.
const a = S.metrics(S.simulate(0.4, 1, 30)), b = S.metrics(S.simulate(0.4, 2, 30));
assert.ok(Math.abs(a.overshoot - b.overshoot) < 0.02);
assert.ok(Math.abs(a.peakTime / b.peakTime - 2) < 0.01 && Math.abs(a.settling / b.settling - 2) < 0.01);
// No overshoot at or above critical damping; formulas refuse to apply there.
for (const z of [1, 1.5, 2]) { assert.equal(S.metrics(S.simulate(z, 2, 20)).overshoot < 1e-6, true); assert.equal(S.formulas(z, 2).settling, null); }
// Unsettled runs are reported as unsettled, not as a lucky in-band sample.
assert.equal(S.metrics(S.simulate(0.05, 1, 30)).settling, null);
// Poles: |p| = ωn, cos θ = ζ for the underdamped pair; real for ζ ≥ 1.
const p = S.poles(0.5, 2)[0];
assert.ok(Math.abs(Math.hypot(p.re, p.im) - 2) < 1e-9 && Math.abs(-p.re / 2 - 0.5) < 1e-9);
assert.ok(S.poles(1.5, 2).every(q => q.im === 0 && q.re < 0));
// Design constants quoted in the text.
assert.ok(Math.abs(S.zetaForOvershoot(10) - 0.591) < 0.001);
assert.ok(Math.abs(Math.acos(S.zetaForOvershoot(10)) * 180 / Math.PI - 53.8) < 0.05);
// The design challenge is solvable on the slider grid (z5 step 0.01, w5 step 0.1).
const ok = S.metrics(S.simulate(0.7, 3, 6));
assert.ok(ok.overshoot <= 10 && ok.settling !== null && ok.settling <= 2, 'ζ=0.7, ωn=3 meets the spec');

// 2. Bilingual parity: same keys, same placeholders.
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join();
for (const k of zk) assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k);

// 3. Every i18n key referenced in the HTML exists; app.js keys exist.
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) assert.ok(STRINGS.zh[m[1]], 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) assert.ok(STRINGS.zh[m[1]], 'app key ' + m[1]);
for (const r of ['under', 'critical', 'over']) assert.ok(STRINGS.zh['regime_' + r]);

// 4. Every deep link (HTML and i18n) lands on an existing step anchor.
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const lang of ['zh', 'en']) for (const v of Object.values(STRINGS[lang])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
assert.ok(hrefs.length >= 5);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#');
  const target = path.join(dir, rel, 'index.html');
  assert.ok(fs.existsSync(target), 'link target ' + h);
  assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
// Seven steps, nav matches.
for (let i = 0; i <= 6; i++) assert.ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`));
console.log(`PASS step-response core: sim vs closed form, ωn scaling, poles, design spec, ${zk.length} bilingual keys, ${new Set(hrefs).size} deep links`);
