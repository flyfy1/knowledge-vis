'use strict';
// Sound from vibration (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// ---- step 0: the drum ----
ok(M.DRUM.f === 100 && M.SLOW_DRUM === 20, 'text: 100 vibrations a second, shown 20× slower');
ok(M.DRUM.A < 1, 'text: the drumhead moves less than 1 mm');
ok(M.ringTime() < 0.9, 'the unmuted ring dies (below 1%) inside the 0.9 s run, so “sound stopped” is reached');
ok(M.soundOn(0) && !M.soundOn(0.9), 'sound on at the tap, off by the end of the run');
near(M.env(M.ringTime()), M.SILENT, 1e-12, 'stopped = 1% of the start');
// muting stops the sound within 0.06 s wherever it happens while still sounding
for (let tm = 0.01; tm < M.ringTime(); tm += 0.01) ok(!M.soundOn(tm + 0.06, tm), 'mute stops the sound fast at ' + tm.toFixed(2));
// membrane derivatives are consistent with the displacement (finite differences)
for (const tt of [0.0013, 0.02, 0.1]) for (const x of [0, 0.5]) {
  const h = 1e-7, m0 = M.membrane(tt, x, 0.5, 100), mp = M.membrane(tt + h, x, 0.5, 100), mm = M.membrane(tt - h, x, 0.5, 100);
  near((mp.y - mm.y) / (2 * h), m0.v, 1e-3 * Math.max(1, Math.abs(m0.v)), 'v = dy/dt');
  near((mp.v - mm.v) / (2 * h), m0.a, 1e-3 * Math.max(1, Math.abs(m0.a)), 'a = dv/dt');
}
// rice with the default tap really jumps, highest in the middle, and stops jumping as the sound fades
const sims = M.GRAINS.map(x => M.grain(M.DRUM.A, M.DRUM.f, x, 0.9));
const mid = sims[M.GRAINS.indexOf(0)];
ok(mid.lift > 2, 'middle grain jumps millimetres high');
for (let g = 0; g < M.GRAINS.length; g++) if (Math.abs(M.GRAINS[g]) > 0) ok(sims[g].lift < mid.lift, 'middle grain jumps highest');
ok(Math.max(...sims.map(s => s.maxH)) * 24 < 165, 'grain flight fits above the drum (24 px/mm, 200 px baseline, title at 20 px)');
const late = mid.ts.map((tt, k) => (tt > 0.6 ? mid.ys[k] - mid.ms[k] : 0));
ok(Math.max(...late) < 1e-9, 'after 0.6 s the grain rides the drumhead (no more jumps)');
for (let k = 0; k < mid.ts.length; k++) ok(mid.ys[k] >= mid.ms[k] - 1e-9, 'grain never below the drumhead');
ok(Math.max(...mid.ms.map(Math.abs)) <= 0.6, 'trace fits the ±0.6 mm axis');

// ---- step 1: air ----
near(M.SPEEDS.air / 1000, 0.343, 1e-12, '0.343 m per millisecond');
ok(M.airShift(2, 0.005, 100) === 0 && M.airShift(1, 0.005, 100) !== 0, 'nothing moves before the front arrives');
for (let tt = 0; tt <= 0.03; tt += 0.0005) ok(Math.abs(M.airShift(1.5, tt, 300)) <= 1, 'marked parcel only swings in place');
near(M.airShift(1, 0.004 + 1 / 343, 100), Math.sin(2 * Math.PI * 100 * 0.004), 1e-9, 'pattern travels at v');

// ---- step 2: amplitude ----
const th = M.jumpThreshold(100);
near(th, 9810 / Math.pow(200 * Math.PI, 2), 1e-12, 'threshold: A·ω² = g');
for (let a = 0.01; a <= 1.0001; a += 0.01) {
  const A = Math.round(a * 100) / 100, s = M.grain(A, 100, 0, 0.3);
  if (A < th) { ok(s.lift === 0, 'below threshold the grain never leaves (A=' + A + ')'); ok(s.ys.every((v, k) => Math.abs(v - s.ms[k]) < 1e-12), 'rides exactly'); }
  ok(s.lift <= 22, 'lift fits the 0..22 mm axis');
  ok(s.maxH <= Math.max(A * 1.3, s.maxH * 1.12), 'top chart range covers the flight');
}
for (const [a, b] of [[0.25, 0.5], [0.5, 1]]) { const r = M.grain(b, 100, 0, 0.3).lift / M.grain(a, 100, 0, 0.3).lift; ok(r > 3.5 && r < 4.8, `doubling amplitude ≈ 4× the jump (${r.toFixed(2)})`); }
near(M.energyRatio(0.2), 4, 1e-12, '2× amplitude = 4× energy');
near(M.dB(0.2), 6.0206, 1e-3, '≈ 6 dB'); near(M.dB(0.1 * Math.sqrt(10)), 10, 1e-9, '10× energy = +10 dB');
near(M.dB(0.1), 0, 1e-12, 'reference 0 dB');

// ---- step 3: frequency ----
for (let f = 100; f <= 1000; f += 10) {
  near(f * 0.02, f / 50, 1e-12, 'cycles in 20 ms');
  near(M.period(f) * f, 1000, 1e-9, 'period');
  ok(M.wavelength(f) <= 3.6, 'wavelength bar fits 0..3.6 m');
  ok(Math.abs(M.nearestNote(f).cents) <= 50 + 1e-9, 'nearest note within half a semitone');
}
assert.equal(M.nearestNote(440).name, 'A4'); assert.equal(M.nearestNote(880).name, 'A5'); assert.equal(M.nearestNote(262).name, 'C4'); checks += 3;
near(M.nearestNote(200).cents - M.nearestNote(400).cents, 0, 1e-9, 'doubling f = one octave (same note, next octave)');
assert.equal(M.nearestNote(200).name.slice(0, -1), M.nearestNote(400).name.slice(0, -1)); checks++;

// ---- step 4: jar (schematic) ----
ok(M.jarLevel(1) === 'clear' && M.jarLevel(0.2) === 'faint' && M.jarLevel(0.04) === 'none' && M.jarLevel(0.05) === 'faint', 'jar thresholds (5% stated in text)');
near(M.jarOut(0.5), 0.5, 0, 'proportional (as stated)');

// ---- step 5: speeds ----
near(M.travel(1000, 'air'), 2.915, 1e-3, '1 km in air ≈ 2.92 s');
near(3 * M.SPEEDS.air, 1029, 0, 'rule of thumb 3 s ≈ 1029 m');
for (let d = 200; d <= 3000; d += 100) { ok(M.travel(d, 'steel') < M.travel(d, 'water') && M.travel(d, 'water') < M.travel(d, 'air'), 'steel < water < air'); near(M.travel(2 * d, 'air'), 2 * M.travel(d, 'air'), 1e-12, 'double distance, double time'); }
ok(3000 / 3e8 <= 1e-5 + 1e-18, 'light crosses 3 km in a hundred-thousandth of a second');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording in ' + k);

// ---- keys used by HTML/app exist; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['soundOn', 'soundOff', 'soundMuted', 'lvClear', 'lvFaint', 'lvNone']) ok(STRINGS.zh[k], 'dynamic key ' + k);
for (const id of ['hit0', 'mute0', 'reset0', 'play1', 'reset1', 'A2', 'f3', 'listen3', 'stop3', 'a4', 'pump4', 'fill4', 'd5', 'go5', 'reset5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [relp, anchor] = h.split('#'), target = path.join(dir, relp, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/waves/sound-vibration/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS sound-vibration core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · threshold ${th.toFixed(4)} mm`);
