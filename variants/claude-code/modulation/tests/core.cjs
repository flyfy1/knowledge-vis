'use strict';
// Modulation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- sampling set-up: every frequency on a 12.5 Hz bin; FFT is right ----
ok(M.DF === 12.5 && M.N === 8192 && M.FS === 102400, 'fs, N, bin');
{ const x = Array.from({ length: M.N }, (_, n) => 0.7 * Math.cos(2 * Math.PI * 1000 * n / M.FS)); const a = M.amplitude(x); near(a[M.bin(1000)], 0.7, 1e-9, 'FFT amplitude'); ok(a.filter(v => v > 1e-9).length === 1, 'no leakage'); }
// message A: peak |m| = 1 at t = 1 ms, bandwidth 1.5 kHz
{ const m = M.msgArr(M.MSG.A); near(Math.min(...m), -1, 1e-12, 'min m = −1'); near(Math.max(...m), 1, 1e-12, 'max m = 1'); near(m[512], -1, 1e-9, 'm(5 ms) = −1'); ok(M.BAND === 1500, 'B = 1.5 kHz'); }

// ---- step 0: lines at fc ± f with half amplitude, nothing at fc ----
for (let fc = 5000; fc <= 40000; fc += 500) {
  const r = M.multiply(fc);
  assert.deepEqual(r.sLines.map(l => l[0]), [fc - 1500, fc - 500, fc + 500, fc + 1500]); checks++;
  r.sLines.forEach(([f, a]) => near(a, Math.abs(f - fc) === 500 ? 0.3 : 0.2, 1e-9, 'half amplitude'));
  ok(M.amplitude(r.s)[M.bin(fc)] < 1e-9, 'no carrier line');
  ok(fc + 1500 <= 45000, 'fits the 0–45 kHz axis');
}

// ---- step 1: crosstalk vanishes exactly when the spacing reaches 2B = 3 kHz ----
for (let fB = 20500; fB <= 30000; fB += 500) {
  const r = M.share(20000, fB), d = fB - 20000;
  ok((r.err < 1e-9) === (d >= 3000), `crosstalk zero iff spacing ≥ 3 kHz (d = ${d})`);
  ok(Math.max(...r.out.slice(0, 411).map(Math.abs)) < 2.1, 'step 1 waveform axis');
}
near(M.share(20000, 22500).xtalkDb, -13.6, 0.05, 'spacing 2.5 kHz: −13.6 dB');
ok(22500 - 1200 > 18500 && 22500 - 1200 < 21500, 'at 2.5 kHz spacing B’s inner line (21.3 kHz) lies inside A’s slot');
ok(23000 - 1200 > 21500, 'at 3 kHz spacing B has left A’s slot');

// ---- step 2: cos φ and beats ----
for (let df = 0; df <= 50; df += 12.5) for (let ph = 0; ph <= 180; ph += 15) {
  const r = M.coherent(20000, df, ph);
  ok(r.err < 1e-9, `output = m·cos(2πΔf t + φ) (Δf ${df}, φ ${ph})`);
  if (df === 0) near(r.scale, Math.cos(ph * Math.PI / 180), 1e-9, 'scale = cos φ'); else near(r.scale, 0, 1e-9, 'beats cancel over the window');
}
near(M.coherent(20000, 0, 60).scale, 0.5, 1e-9, 'φ = 60°: half'); near(M.coherent(20000, 0, 90).scale, 0, 1e-9, 'φ = 90°: gone');
near(12.5 / 20000 * 100, 0.0625, 1e-12, '12.5 Hz is 0.06 % of 20 kHz');

// ---- step 3: AM ----
for (let i = 1; i <= 15; i++) {
  const mu = i / 10, r = M.am(20000, mu);
  ok((r.dist < 1e-9) === (mu <= 1 + 1e-9), `no distortion iff μ ≤ 1 (μ = ${mu})`);
  near(r.minEnv, 1 - mu, 1e-9, 'min envelope 1 − μ');
  const car = r.sLines.find(l => l[0] === 20000); near(car[1], 1, 1e-9, 'carrier line height 1');
  ok(Math.max(...r.env.slice(0, 206), ...r.s.slice(0, 206).map(Math.abs)) < 2.6, 'step 3 axis');
  if (i > 1) ok(r.eff > M.am(20000, mu - 0.1).eff, 'efficiency grows with μ');
}
near(M.am(20000, 1).eff * 100, 20.6, 0.05, 'μ = 1: efficiency ≈ 21 %'); ok(1 - M.am(20000, 1).eff > 0.79, 'nearly 4/5 in the carrier');
near(M.am(20000, 1.1).dist * 100, 6.7, 0.05, 'μ = 1.1: 6.7 %'); near(M.am(20000, 1.5).dist * 100, 34, 0.5, 'μ = 1.5: 34 %');

// ---- step 4: FM ----
let maxGapPairs = 0;
for (let fm = 500; fm <= 3000; fm += 250) for (let dev = 0; dev <= 10000; dev += 250) {
  const r = M.fm(25000, fm, dev);
  near(r.power, 0.5, 1e-6, 'constant power');
  if (r.beta > 0.2 + 1e-9) maxGapPairs = Math.max(maxGapPairs, Math.abs(r.bw98 - r.carson) / (2 * fm)); else ok(r.bw98 === 0, 'β ≤ 0.2: carrier alone holds 98 %');
  ok(r.lines.every(([f]) => f >= 5000 && f <= 45000), 'lines inside 5–45 kHz');
  ok(r.lines.every(([f]) => Math.abs(((f - 25000) / fm) - Math.round((f - 25000) / fm)) < 1e-9), 'lines spaced by f_m');
  if (dev === 0) ok(r.lines.length === 1, 'Δf = 0: one line');
}
ok(maxGapPairs <= 1 + 1e-9, 'β > 0.2: Carson vs 98 % bandwidth differ by at most one pair: ' + maxGapPairs);
{ const r = M.fm(25000, 1250, 3000); near(r.beta, 2.4, 1e-12, 'β = 2.4'); ok(r.carrierLine < 0.003, 'carrier nearly vanishes'); near(r.carrierLine, 0.0025, 0.00005, '0.0025'); }
for (const beta of [0.5, 1, 2.4, 5]) { const r = M.fm(25000, 1000, beta * 1000); for (let k = 0; k <= 6; k++) near(M.amplitude(r.s)[M.bin(25000 + k * 1000)], Math.abs(M.besselJ(k, beta)), 1e-6, `|J_${k}(${beta})|`); }

// ---- step 5: AM vs FM in noise (3 seeds) ----
let lo = Infinity, hi = -Infinity;
for (let seed = 1; seed <= 3; seed++) for (let c = -6; c <= 20; c += 2) {
  const r = M.noisy(c, seed), d = r.snrFM - r.snrAM;
  if (c >= 6) { lo = Math.min(lo, d); hi = Math.max(hi, d); }
  if (c <= -2) ok(d < 0, `FM worse than AM at ${c} dB (seed ${seed})`);
  ok(r.snrAM > -5 && r.snrAM < 55 && r.snrFM > -5 && r.snrFM < 55, 'SNR chart axis −5..55');
}
ok(lo >= 15.5 && hi <= 19, `FM ahead by 16–19 dB for inputs ≥ 6 dB: ${lo}..${hi}`);
{ const z = M.noisy(300, 1); near(z.snrFM, 51, 1, 'FM noiseless floor ≈ 51 dB'); ok(z.snrAM > 100, 'AM noiseless is exact'); near(z.pAM, 0.63, 0.005, 'AM power 0.63'); near(z.pFM, 0.5, 1e-6, 'FM power 0.5'); }
ok((M.NOISE.dev + M.BAND) * 2 / (2 * M.BAND) === 6, 'FM uses 6× the AM bandwidth'); ok(M.NOISE.dev / M.BAND === 5, 'β = 5');
// noise level matches its definition: σ² = 0.5 / 10^(cnr/10)
{ const w = M.gauss(1); near(M.power(Array.from(w)), 1, 0.05, 'unit-variance noise'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s2nobeat', 'nav4', 's3lgIdeal']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '调制与频移 · 把信号搬上高频运走' : 'Modulation · Shipping Signals on a Carrier'), 'footer');
for (const l of ['zh', 'en']) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right chart wording');
for (const l of ['zh', 'en']) { const s = STRINGS[l]; ok(s.s3hint.includes('6.7%') && s.s3hint.includes('34%') && s.s1hint.includes('−13.6') && s.s5hint.includes('16–19') && s.s4hint.includes('0.0025'), 'quoted numbers present'); }

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
ok(fs.existsSync(path.join(dir, '../../../signal/sampling/modulation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS modulation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · FM lead ${lo.toFixed(1)}–${hi.toFixed(1)} dB`);
