'use strict';
// Sampling & aliasing (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, frag) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(frag), `${l}.${key} quotes ${frag}`); };

// ---- alias arithmetic ----
for (let f = -50; f <= 60; f += 0.05) for (const fsr of [8, 10, 24, 44.1, 48]) {
  const { k, g } = M.aliasSigned(f, fsr);
  ok(g > -fsr / 2 - 1e-9 && g <= fsr / 2 + 1e-9, 'g in (−fs/2, fs/2]');
  near(f - k * fsr, g, 1e-9, 'g = f − k fs');
  ok(Number.isInteger(k), 'k integer');
  near(M.fold(f, fsr), Math.abs(f - fsr * Math.round(f / fsr)), 1e-9, 'fold = |f − fs·round(f/fs)|');
}

// ---- step 0: the wheel (fs = 24) ----
near(M.wheel(24).appHz, 0, 1e-12, 'f = 24 stands still'); ok(!M.wheel(24).edge, '24 not an edge');
near(M.wheel(23).appHz, -1, 1e-12, 'f = 23 looks like −1 rev/s (backwards)');
near(M.wheel(23).step, 345, 1e-12, '345° per frame'); near(M.wheel(23).app, -15, 1e-12, '−15° per frame'); assert.equal(M.wheel(23).turns, 1); checks++;
near(M.wheel(25).appHz, 1, 1e-12, 'f = 25 looks like +1 rev/s');
ok(M.wheel(12).edge && M.wheel(36).edge, 'half a turn per frame is ambiguous');
for (let f = 0; f <= 50; f += 0.5) {
  const w = M.wheel(f);
  near(w.appHz, M.wheel(f + 24).appHz, 1e-9, 'sawtooth period 24');
  ok(Math.abs(w.app) <= 180 + 1e-9, 'apparent step within ±180°');
  // the spoke the camera sees in frame m equals the one implied by stepping app° each frame
  for (let m = 0; m <= 24; m++) { const d = M.spoke(f, m) - m * w.app; near(d - 360 * Math.round(d / 360), 0, 1e-6, 'frames consistent with apparent step'); }
}
// 1 s of film at f = 23: really 23 turns, on screen −1 turn (s0hint)
near(23 * 24 / 24, 23, 0, 'true turns'); near(M.wheel(23).appHz * 24 / 24, -1, 1e-12, 'apparent turns');
both('s0hint', '23'); both('s0hint', '24');

// ---- step 1: same samples ----
for (let f = 0; f <= 12; f += 0.5) for (let k = -2; k <= 2; k++) {
  const r = M.sameSamples(f, k);
  ok(r.d0 < 1e-9, `samples identical f=${f} k=${k}`);
  const same = Math.abs(r.g - f) < 1e-9;
  ok(same ? r.d1 < 1e-9 : r.d1 > 0.5, `curves differ between samples unless the candidate is the signal f=${f} k=${k}`);
  if (f === 3 && k !== 0) ok(r.d1 > 1, 'f = 3 example: large gap (s1hint)');
  near(r.low, M.fold(f, 8), 1e-12, 'lowest alias');
  ok(r.low <= 4 + 1e-12, 'lowest alias ≤ fs/2');
}
near(M.sameSamples(3, 1).g, 11, 1e-12, '3 + 8 = 11'); near(M.sameSamples(3, -1).g, 5, 1e-12, '|3 − 8| = 5');

// ---- step 2: folding ----
near(M.fold(30, 44.1), 14.1, 1e-9, '30 kHz at 44.1 → 14.1 kHz (title)');
near(M.fold(40, 48), 8, 1e-12, 'quiz: 40 kHz at 48 → 8 kHz');
assert.equal(M.aliasSigned(40, 48).k, 1); checks++;
near(M.fold(22.05, 44.1), 22.05, 1e-9, 'turning point at fs/2'); near(M.fold(44.1, 44.1), 0, 1e-9, 'back to 0 at fs');
ok(M.RATES.includes(44.1) && M.RATES.includes(48), 'rates offered');
for (const r of M.RATES) for (let f = 0; f <= 60; f += 0.1) ok(M.fold(f, r) <= r / 2 + 1e-9, 'f_a ≤ fs/2');
both('s2hint', '22.05'); both('s2hint', '44.1');

// ---- step 3: reconstruction ----
let worst = 0, worstAt = null, belowMax = 0;
for (let f = 0; f <= 20 + 1e-9; f += 0.25) for (let pd = 0; pd <= 180; pd += 5) {
  const R = M.reconRun(f, pd * Math.PI / 180);
  if (R.eAlias > worst) { worst = R.eAlias; worstAt = [f, pd]; }
  ok(R.P.fa <= 5 + 1e-9, 'reconstruction never exceeds fs/2');
  if (f < 5) { belowMax = Math.max(belowMax, R.eOrig); near(R.P.fa, f, 1e-12, 'below Nyquist: same frequency'); }
  if (f > 5 && Math.abs(R.P.g - f) > 1e-9) ok(R.eOrig > 0.1, `above Nyquist the reconstruction is not the original f=${f} φ=${pd}`);
}
ok(worst < 0.013, 'truncation error < 0.013 over the slider grid: ' + worst);
assert.equal(worstAt[0] % 10, 5); checks++; // largest at an edge (5 or 15 Hz)
ok(belowMax < 0.013, 'below 5 Hz the reconstruction is the original');
both('s3hint', '0.013');
{ const R = M.reconRun(7, 0); near(R.P.fa, 3, 1e-12, '7 Hz → 3 Hz'); ok(R.eAlias < 0.005 && R.eOrig > 0.9, '7 Hz example'); }
{ const R = M.reconRun(7, Math.PI / 4); near(R.P.phase, -Math.PI / 4, 1e-12, 'folding flips the phase'); }
{ const R = M.reconRun(5, Math.PI / 2); ok(Math.max(...R.y.map(Math.abs)) < 0.01, 'φ = 90° at 5 Hz: flat line'); near(R.P.amp, 0, 1e-12, 'cos 90° = 0'); }
{ const R = M.reconRun(10, 1); ok(R.P.fa === 0 && R.eAlias < 0.005, '10 Hz → constant cos φ'); }
// the sinc kernel is 1 at its own sample and 0 at the others (s3e)
near(M.sinc(0), 1, 0, 'sinc(0) = 1'); for (let n = 1; n < 6; n++) near(M.sinc(n), 0, 1e-15, 'sinc(n) = 0');

// ---- step 4: spectral copies ----
for (let B = 2; B <= 10; B += 0.5) for (let fsr = 6; fsr <= 24; fsr += 0.5) {
  const a = M.aliasFraction(B, fsr, 4000);
  if (fsr >= 2 * B) near(a, 0, 1e-12, `no overlap when fs ≥ 2B (B=${B}, fs=${fsr})`);
  else ok(a > 0, 'overlap when fs < 2B');
  if (fsr >= B) near(a, M.aliasFractionTheory(B, fsr), 2e-4, `(1 − fs/2B)² B=${B} fs=${fsr}`);
}
near(M.aliasFraction(6, 12), 0, 1e-12, 'B = 6, fs = 12 just touches (s4hint)'); both('s4hint', '12');

// ---- step 5: anti-aliasing ----
near(M.antiAlias(20, 10).stopDb, -16.3, 0.05, 'N = 10 at 24.1 kHz ≈ −16 dB (s5hint)'); both('s5hint', '16');
near(M.S5.fs - M.S5.hear, 24.1, 1e-9, '44.1 − 20 = 24.1'); near(M.antiAlias(20, 3).humAt, 14.1, 1e-9, '30 kHz folds to 14.1 kHz');
let prev = 0;
for (let N = 1; N <= 10; N++) {
  const r = M.antiAlias(20, N);
  ok(r.hum < prev, 'interference sinks as N grows'); prev = r.hum;
  ok(r.want > -0.3, 'wanted 5 kHz barely changes at fc = 20');
  near(r.edge, -3.0103, 1e-3, 'fc is the −3 dB point');
  ok(r.stopDb > -17, 'never better than ~16 dB at 24.1 kHz with fc = 20');
}
ok(M.antiAlias(15, 10).stopDb < M.antiAlias(20, 10).stopDb && M.antiAlias(15, 10).edge < M.antiAlias(20, 10).edge, 'lower fc: more attenuation, duller treble');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left-hand|right-hand|left chart|right chart/i.test(v) || k === '__', `${l}.${k} avoids left/right figure wording`);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['f0', 'play0', 'reset0', 'f1', 'k1', 'all1', 'fs2', 'f2', 'checkQuiz', 'f3', 'p3', 'b4', 'fs4', 'fc5', 'n5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
const pending = [];
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  if (!fs.existsSync(target) && rel.startsWith('../') && !rel.startsWith('../../')) { pending.push(h); continue; } // sibling Claude edition written in the same batch
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../signal/sampling/sampling/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS sampling core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links${pending.length ? ' (pending sibling: ' + pending.join(', ') + ')' : ''} · max reconstruction gap ${worst.toFixed(4)}`);
