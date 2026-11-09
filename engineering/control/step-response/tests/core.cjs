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
// 4/(ζωn) is only an estimate: s3hint says measured ≈ 0.70–1.25 × estimate for 0.1 ≤ ζ ≤ 0.95, shortest near 0.78.
let rLo = Infinity, rHi = 0, zLo = 0;
for (let i = 10; i <= 95; i++) { const z = i / 100, r = S.metrics(S.simulate(z, 1, 200)).settling / (4 / z); if (r < rLo) { rLo = r; zLo = z; } rHi = Math.max(rHi, r); }
assert.ok(rLo >= 0.695 && rLo < 0.705 && rHi > 1.245 && rHi < 1.255 && Math.abs(zLo - 0.78) < 0.005, `settling ratio range ${rLo}@${zLo}..${rHi}`);
// s4hint: the oscillation always stays inside the envelope 1 ± e^(−ζωn t)/√(1−ζ²).
for (const [z, w] of [[0.1, 2], [0.3, 2], [0.7, 4], [0.95, 1]]) {
  const k = 1 / Math.sqrt(1 - z * z);
  for (const p of S.simulate(z, w, 10).points) assert.ok(Math.abs(p.y - 1) <= k * Math.exp(-z * w * p.t) + 1e-6, `envelope ζ=${z} t=${p.t}`);
}
// regime_critical: with ωn fixed, ζ = 1 settles fastest among the responses that never pass 1 (ζ ≥ 1).
const tsCrit = S.metrics(S.simulate(1, 2, 30)).settling;
for (const z of [1.05, 1.2, 1.5, 2]) assert.ok(tsCrit < S.metrics(S.simulate(z, 2, 30)).settling, 'critical fastest vs ζ=' + z);
// Step 0 readout (ζ = 0.3, ωn = 2): peak 1.37, i.e. 37 % overshoot.
assert.equal(S.metrics(S.simulate(0.3, 2, 10)).overshoot.toFixed(0), '37');
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
// Step 5 readout/verdict agreement over every slider position (ζ 0.05–1.5 step 0.01, ωn 0.5–8 step 0.1):
// the shown values (overshoot 1 dp, settling 3 dp) must give the same ✓/✗ as the raw values.
for (let zi = 5; zi <= 150; zi++) for (let wi = 5; wi <= 80; wi++) {
  const m = S.metrics(S.simulate(zi / 100, wi / 10, 6));
  assert.equal(+m.overshoot.toFixed(1) <= 10, m.overshoot <= 10, `overshoot verdict ζ=${zi / 100} ωn=${wi / 10}`);
  if (m.settling !== null) assert.equal(+m.settling.toFixed(3) <= 2, m.settling <= 2, `settling verdict ζ=${zi / 100} ωn=${wi / 10}`);
}

// 2. Bilingual parity: same keys, same placeholders.
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match');
for (const l of ['zh', 'en']) assert.ok(STRINGS[l].s3hint.includes('0.70–1.25') && STRINGS[l].s3hint.includes('0.78'), 's3hint quotes the tested settling ratio range');
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
