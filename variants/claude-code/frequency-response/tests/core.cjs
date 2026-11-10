'use strict';
// Frequency-response (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS, SYMBOLS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const grid = (min, max, step) => { const o = []; for (let i = 0; min + i * step <= max + 1e-9; i++) o.push(M.fFromLog(min + i * step)); return o; };
const deg = r => r * 180 / Math.PI;

// ---- step 0: RC values in the text, bench = formula over the whole slider ----
const RC = 1 / (2 * Math.PI * M.FC0);
near(1590 * 100e-9, RC, 0.002 * RC, 'R = 1.59 kΩ, C = 100 nF gives fc ≈ 1 kHz'); near(RC * 1e3, 0.159, 0.0005, 'RC ≈ 0.159 ms');
const F0 = grid(M.LOGF.min, M.LOGF.max, M.LOGF.step);
ok(F0.length === 53 && Math.abs(F0[0] - 50) < 0.2 && Math.abs(F0[52] - 20000) < 50, '53 frequencies from 50 Hz to 20 kHz');
let worstRel = 0;
for (const f of F0) {
  const m = M.measure(M.RC0, f), g = M.gain(M.RC0, f), ph = M.phase(M.RC0, f);
  worstRel = Math.max(worstRel, Math.abs(m.G - g) / g);
  near(m.ph, ph, 1e-4, 'bench phase = ∠H at ' + f);
  near(m.lag, -ph / (2 * Math.PI * f), 1e-9, 'lag');
  ok(m.lag * f * 360 >= 0 && m.lag * f * 360 < 90, 'output peak lags by < a quarter period');
}
ok(worstRel < 1e-4, 'bench vs formula relative error < 1e-4 (boundary text) ' + worstRel);
// the measured gain falls monotonically; flat-ish below 1 kHz, falling above (s0hint)
for (let i = 1; i < F0.length; i++) ok(M.gain(M.RC0, F0[i]) < M.gain(M.RC0, F0[i - 1]), 'monotone');
ok(M.gain(M.RC0, 50) > 0.998 && M.gain(M.RC0, 20000) < 0.06, 'nearly 1 at 50 Hz, small at 20 kHz');

// ---- step 1: Bode landmarks ----
for (const fc of grid(2, 4, 0.05)) {
  const s = [{ type: 'lp', fc }];
  near(M.dB(M.gain(s, fc)), -3.0103, 1e-4, '−3.01 dB at fc'); near(deg(M.phase(s, fc)), -45, 1e-9, '−45° at fc');
  near(M.dB(M.gain(s, 100 * fc)) - M.dB(M.gain(s, 10 * fc)), -19.96, 0.01, 'slope ≈ −20 dB/decade');
  near(M.dB(M.gain(s, fc / 10)), -0.043, 0.001, '−0.04 dB a decade below'); near(deg(M.phase(s, fc / 10)), -5.71, 0.01, '−5.7° a decade below');
  near(M.dB(M.gain(s, 10 * fc)), -20.04, 0.01, '≈ −20 dB a decade above');
  // shape depends on f/fc only
  near(M.gain(s, 3 * fc), M.gain(M.RC0, 3 * M.FC0), 1e-12, 'depends on f/fc only');
}
ok(M.dB(M.gain([{ type: 'lp', fc: 10000 }], 50)) > -0.01 && M.dB(M.gain([{ type: 'lp', fc: 100 }], 20000)) > -50, 'step 1 curves fit the −50..5 dB axis');

// ---- step 2: two tones ----
const F2 = grid(1.7, 3.5, 0.05);
for (const f1 of F2) {
  const r = M.twoTone(f1);
  near(r.res[0].G, r.g1, 1e-4 * r.g1, 'bench tone 1'); near(r.res[1].G, r.g3, 1e-4 * r.g3, 'bench tone 3');
  ok(r.d1 > r.d3, '3f₁ lags less'); ok(r.d1 <= RC + 1e-12, 'lag ≤ RC');
  ok(Math.max(...r.y.map(Math.abs), ...r.x.map(Math.abs), ...r.ref.map(Math.abs)) < 1.4, 'step 2 axis ±1.4');
}
ok(M.twoTone(50.12).mismatch < 0.001 && Math.abs(M.twoTone(50.12).d1 - RC) < 1e-6, 'f₁ = 50 Hz: distortion < 0.1 %, lag ≈ RC');
{ const m = M.twoTone(1000).mismatch * 100; ok(m > 15 && m < 16.5, 'f₁ = 1 kHz: distortion ≈ 16 % (' + m + ')'); }
for (let i = 1; i < F2.length; i++) ok(M.twoTone(F2[i]).mismatch > M.twoTone(F2[i - 1]).mismatch, 'distortion grows with f₁');
ok(M.lagOf(M.phase(M.RC0, 50), 50) * 1e3 < 0.18, 'lag axis 0..0.18 ms');

// ---- step 3: cutoff and order ----
for (const fc of grid(2, 4, 0.25)) for (let n = 1; n <= 4; n++) {
  const r = M.cleanup(fc, n), s = M.chain('lp', fc, n);
  near(r.gw, M.gain(s, 200), 1e-4 * r.gw, 'bench tone'); near(r.gh, M.gain(s, 5000), 1e-4 * r.gh + 1e-9, 'bench hiss');
  near(r.slope, -20 * n, 0.05 * n, 'slope −20n dB/decade');
  ok(Math.max(...r.y.map(Math.abs), ...r.x.map(Math.abs)) < 1.7, 'step 3 waveform axis');
}
const best = [1, 2, 3, 4].map(n => M.bestUnderLoss(n, 1));
best.forEach((b, i) => near(-M.dB(M.gain(M.chain('lp', b.fc, i + 1), 200)), 1, 1e-9, '1 dB loss at the optimum'));
assert.deepEqual(best.map(b => Math.round(b.hiss)), [22, 38, 51, 63]); checks++;
// lowering fc below the optimum costs more than 1 dB (so the optimum really is the lowest allowed fc)
best.forEach((b, i) => ok(-M.dB(M.gain(M.chain('lp', b.fc * 0.99, i + 1), 200)) > 1, 'optimum is tight'));
for (const l of ['zh', 'en']) ok(['22', '38', '63'].every(v => STRINGS[l].s3hint.includes(v)), 's3hint quotes 22/38/63 dB');

// ---- step 4: shapes ----
for (const k of ['lp', 'hp']) {
  const s = M.shapeSecs(k);
  near(M.dB(M.gain(s, 1000)), -3.0103, 1e-4, k + ' −3 dB at 1 kHz');
  near(deg(M.phase(s, 1000)), k === 'lp' ? -45 : 45, 1e-9, k + ' phase at 1 kHz');
  near(M.dB(M.gain(s, k === 'lp' ? 10000 : 100)), -20.04, 0.01, k + ' one decade away');
  // mirror images on the log axis
  for (const r of [0.1, 0.5, 2, 7]) near(M.gain(M.shapeSecs('lp'), 1000 * r), M.gain(M.shapeSecs('hp'), 1000 / r), 1e-12, 'mirror');
}
for (let q2 = 1; q2 <= 20; q2++) {
  const Q = q2 / 2, b = M.bandpass(Q);
  near(b.Qm, Q, 1e-6 * Q, 'measured Q = set Q'); near(b.lo * b.hi, 1e6, 1e-3, 'lo·hi = f0²'); near(b.peak, 1, 1e-12, 'peak 0 dB');
  near(deg(M.phase(b.secs, 1000)), 0, 1e-9, 'phase 0 at f0');
  ok(Math.abs(b.lo - 1000) !== Math.abs(b.hi - 1000) || Q > 1e6, 'not symmetric in linear f');
  if (q2 > 1) ok(b.bw < M.bandpass(Q - 0.5).bw, 'bandwidth shrinks with Q');
  // phase flips faster with larger Q: slope at f0
  if (q2 > 1) { const sl = q => deg(M.phase(M.bandpass(q).secs, 1010) - M.phase(M.bandpass(q).secs, 990)); ok(Math.abs(sl(Q)) > Math.abs(sl(Q - 0.5)), 'steeper phase'); }
}
near(M.bandpass(0.5).bw, 2000, 1e-6, 'Q = 0.5: 2 kHz'); near(M.bandpass(10).bw, 100, 1e-6, 'Q = 10: 100 Hz');

// ---- step 5: design to spec ----
const L5 = grid(M.LOGL.min, M.LOGL.max, M.LOGL.step), H5 = grid(M.LOGH.min, M.LOGH.max, M.LOGH.step);
const feas = n => { const out = []; for (const a of L5) for (const b of H5) if (M.verdict(a, b, n).ok) out.push([a, b]); return out; };
ok(feas(1).length === 0, 'n = 1: no solution');
{ const f2 = feas(2); ok(f2.length === 3, 'n = 2: exactly 3 slider combinations'); ok(f2.every(([a, b]) => a >= 151 && a <= 166.5 && Math.abs(b - 3311.3) < 0.5), 'n = 2 sliver location'); }
ok(feas(3).length > 20 && feas(4).length > feas(3).length, 'n = 3, 4 much wider');
// n = 1 impossible in principle, not just on the grid: the best fL and fH each already cost the passband
{ const fL = 50 * Math.sqrt(99), fH = 10000 / Math.sqrt(99); ok(M.verdict(fL, fH, 1).p < -1, 'n = 1 impossible in closed form'); }
// bench = formula for a few designs (including the n = 2 sliver and the default)
let worst5 = 0;
for (const [a, b, n] of [[158.49, 3311.3, 2], [100, 5011.9, 2], [200, 5000, 3], [300, 4000, 4], [31.6, 31622, 1]]) {
  const v = M.verdict(a, b, n), m = M.benchDesign(a, b, n);
  worst5 = Math.max(worst5, Math.abs(m[0] - v.h), Math.abs(m[1] - v.p), Math.abs(m[2] - v.t));
}
ok(worst5 < 1e-3, 'bench design within 0.001 dB of formula ' + worst5);
ok(!M.verdict(100, Math.pow(10, 3.7), 2).ok, 'default design fails (so the learner has work to do)');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(Object.keys(SYMBOLS));
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '频率响应与滤波 · 按频率挑食的盒子' : 'Frequency Response & Filters · A Box That Eats by Frequency'), 'footer');
for (const l of ['zh', 'en']) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right chart wording');

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../signal/systems/frequency-response/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS frequency-response core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · bench rel. err ${worstRel.toExponential(1)}`);
