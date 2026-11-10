'use strict';
// Chaos and the three-body problem (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// ---- step 0: two starts, r = 3.9 ----
const split0 = k => M.splitAt(M.orbit(3.9, 0.4, 60), M.orbit(3.9, 0.4 + 10 ** -k, 60));
for (let k = 2; k <= 12; k++) ok(split0(k) !== null, 'r = 3.9 splits within 60 steps for k = ' + k);
ok(split0(12) - split0(2) <= 45 && split0(12) > split0(2), `10 orders of magnitude only delay the split by a few dozen steps (${split0(2)} → ${split0(12)})`);
{ const a = M.orbit(3.2, 0.4, 60), b = M.orbit(3.2, 0.4 + 1e-2, 60); ok(M.splitAt(a, b) === null && Math.abs(a[60] - b[60]) < 1e-8, 'r = 3.2: the two runs merge'); }
for (let r = 2.8; r <= 4.0001; r += 0.01) for (let k = 2; k <= 12; k++) { const R = Math.round(r * 100) / 100, a = M.orbit(R, 0.4, 60), b = M.orbit(R, 0.4 + 10 ** -k, 60); for (let i = 0; i <= 60; i++) ok(a[i] >= 0 && a[i] <= 1 && Math.abs(a[i] - b[i]) <= 1, 'x stays in [0,1] (chart range)'); }

// ---- step 1: λ ----
near(M.lyapunov(4), Math.log(2), 0.01, 'λ(4) = ln 2');
ok(M.lyapunov(3.2) < 0 && M.periodOf(3.2) === 2, 'r = 3.2: period 2, λ < 0');
ok(M.periodOf(3.5) === 4 && M.periodOf(3.56) === 8, 'period doubling 4 → 8');
ok(M.periodOf(3.83) === 3 && M.lyapunov(3.83) < 0, 'period-3 window near 3.83');
ok(M.lyapunov(3.7) > 0.3 && M.periodOf(3.7) === null, 'r = 3.7 chaotic');
// λ touches 0 at the first period-doubling r = 3 and 1 + √6
ok(Math.abs(M.lyapunov(3.0, 0.4, 300, 20000)) < 0.02, 'λ ≈ 0 at r = 3');
ok(Math.abs(M.lyapunov(1 + Math.sqrt(6), 0.4, 300, 20000)) < 0.03, 'λ ≈ 0 at r = 1 + √6');
// beyond ~3.57 λ is mostly positive
{ let pos = 0, n = 0; for (let r = 3.58; r <= 4; r += 0.005) { n++; if (M.lyapunov(r) > 0) pos++; } ok(pos / n > 0.75, 'λ mostly > 0 beyond 3.57 (' + pos + '/' + n + ')'); }
{ let neg = 0; for (let r = 2.8; r < 3.56; r += 0.005) if (M.lyapunov(r) <= 0.001) neg++; ok(neg === Math.ceil((3.56 - 2.8) / 0.005), 'λ ≤ 0 everywhere below 3.56'); }
// prediction vs simulation for δ = 1e−10 (readout): same order of magnitude on chaotic grid points
for (let r = 3.6; r <= 4.0001; r += 0.005) {
  const lam = M.lyapunov(r); if (lam < 0.2) continue;
  const sim = M.splitAt(M.orbit(r, 0.4, 400), M.orbit(r, 0.4 + 1e-10, 400)), pred = Math.log(1e9) / lam;
  ok(sim !== null && sim < 3 * pred && sim > pred / 3, `r=${r.toFixed(3)} sim ${sim} vs pred ${pred.toFixed(0)}`);
}
for (let i = 0; i <= 480; i++) { const r = 2.8 + 1.2 * i / 480, l = M.lyapunov(r); ok(l <= 0.8, 'λ inside the chart top'); }

// ---- step 2: 32-bit rounding ----
const s32 = r => M.splitAt(M.orbit(r, 0.4, 80), M.orbit32(r, 0.4, 80));
ok(s32(4) >= 18 && s32(4) <= 28, '“twenty-odd steps” at r = 4: ' + s32(4));
ok(s32(3.5) === null, 'r = 3.5: rounding not amplified');
{ const a = M.orbit(4, 0.4, 14), b = M.orbit32(4, 0.4, 14); for (let i = 0; i <= 14; i++) ok(Math.abs(a[i] - b[i]) < 1e-3, 'lines look identical for the first dozen steps'); }
near(Math.abs(Math.fround(0.5 + 2 ** -25 * 0.9) - 0.5) <= 2 ** -24, true, 0, '32-bit rounding near 0.5 ≈ 3×10⁻⁸');
for (let r = 3.5; r <= 4.0001; r += 0.01) {
  r = Math.round(r * 100) / 100;
  const lam = M.lyapunov(r), n = s32(r), pred = Math.log(0.1 / 2 ** -25) / lam;
  if (n !== null && lam < 0.1) { ok(r >= 3.82 && r <= 3.86, 'only near the period-3 window does the transient message (s2trans) appear: r=' + r.toFixed(2)); continue; }
  if (n !== null) ok(n < 2.5 * pred && n > pred / 2.5, `32-bit split r=${r.toFixed(2)}: ${n} vs ${pred.toFixed(0)}`);
}

// ---- step 3: Lorenz ----
for (const rho of [0, 0.5]) ok(M.lorenzTwin(rho, 1e-8, 50).A.at(-1).every(v => Math.abs(v) < 1e-3), 'ρ < 1 → origin');
for (let rho = 1; rho <= 23.5; rho += 0.5) { const R = M.lorenzTwin(rho, 1e-8, 50); ok(R.sep.findIndex(v => v > 1) < 0 && R.sep.at(-1) < 1e-8, 'ρ = ' + rho + ' settles, separation shrinks'); }
{ const R = M.lorenzTwin(24, 1e-8, 50); ok(R.sep.findIndex(v => v > 1) < 0 && R.sep.at(-1) > 1e-4, 'ρ = 24 has not settled by t = 50 (text)'); }
ok(M.lorenzTwin(24.5, 1e-8, 50).sep.findIndex(v => v > 1) > 0, 'ρ = 24.5 (border zone) keeps wandering from this start');
{ const R = M.lorenzTwin(20, 1e-8, 50), a = R.A.at(-1), c = Math.sqrt(M.BETA * 19); ok(Math.abs(Math.abs(a[0]) - c) < 0.01 && Math.abs(a[2] - 19) < 0.01, 'ρ = 20 stops on a fixed point (±√(β(ρ−1)), ρ−1)'); }
for (const k of [2, 4, 6, 8, 10]) { const R = M.lorenzTwin(28, 10 ** -k, 50), i = R.sep.findIndex(v => v > 1); ok(i > 0, 'ρ = 28 splits within 50 for k = ' + k); }
{ const i = M.lorenzTwin(28, 1e-8, 50).sep.findIndex(v => v > 1) * 0.02; ok(i > 22 && i < 32, '“after about t = 25” at k = 8: ' + i); }
for (let rho = 0; rho <= 40; rho += 0.5) { const R = M.lorenzTwin(rho, 1e-8, 50); for (const s of R.A) ok(Math.abs(s[0]) <= 26 && s[2] >= 0 && s[2] <= 75, 'path inside the x–z chart'); }
for (let rho = 25; rho <= 40; rho += 0.5) ok(M.lorenzTwin(rho, 1e-8, 50).sep.findIndex(v => v > 1) > 0, 'chaotic regime splits for ρ = ' + rho);
ok(M.lorenzRegime(0.5) === 'origin' && M.lorenzRegime(20) === 'steady' && M.lorenzRegime(28) === 'chaos' && M.lorenzRegime(24.5) === 'mixed', 'regime labels');

// ---- step 4: horizon ----
const H = []; for (let k = 2; k <= 14; k++) { const h = M.horizon(k); ok(h !== null && h <= 45, 'horizon on chart for k = ' + k); H.push([k, h]); }
const fit = M.fitLine(H), th = Math.LN10 / M.LORENZ_LAMBDA;
near(th, 2.54, 0.005, 'ln10/λ = 2.54');
ok(Math.abs(fit.slope - th) / th < 0.15, `fitted slope ${fit.slope.toFixed(2)} within 15% of ${th.toFixed(2)}`);
{ const gain = M.horizon(12) - M.horizon(2); ok(gain > 20 && gain < 30, '12 vs 2 digits: “twenty-odd” more time units: ' + gain.toFixed(1)); }

// ---- step 5: three bodies ----
{ const y = M.eightStart(0); let px = 0, py = 0; for (let s = 0; s < 3; s++) { px += y[6 + 2 * s]; py += y[7 + 2 * s]; } near(px, 0, 1e-8, 'zero momentum'); near(py, 0, 1e-8, 'zero momentum'); }
{ // figure-eight returns close to its start after one period
  const r = M.threeBody(0, M.F8.period * 1.0001, M.F8.period * 1.0001 / 500); let d = 0; const a = r.out[0], b = r.out.at(-1); for (let k = 0; k < 6; k++) d = Math.max(d, Math.abs(a[k] - b[k])); ok(d < 1e-3, 'figure-eight period ≈ 6.3259: return within ' + d.toExponential(1));
}
const regular = [], chaotic = [];
for (let i = 0; i <= 30; i++) {
  const e = i / 100, a = M.threeBody(e), b = M.threeBody(e + M.TWIN), g = M.gap(a, b), split = g.findIndex(v => v > 0.1);
  ok(a.drift < 1e-5, `energy drift small at ε=${e}: ${a.drift.toExponential(1)}`);
  if (e <= 0.12) { ok(split < 0 && M.maxRadius(a) < 1.25, `ε=${e}: stays a figure-eight, twins never 0.1 apart`); regular.push(e); }
  if (e >= 0.14) { ok(split >= 0 || M.maxRadius(a) > 5, `ε=${e}: splits or ejects`); if (split >= 0) chaotic.push(e); }
}
ok(chaotic.length >= 14, 'most ε ≥ 0.14 grid points split within 60: ' + chaotic.length + '/17');
{ const a = M.threeBody(0.2), b = M.threeBody(0.2 + M.TWIN), i = M.gap(a, b).findIndex(v => v > 0.1) * 0.02; ok(i > 10 && i < 60, 'ε = 0.2 splits within a few dozen time units: ' + i); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left-hand|right-hand/i.test(v), 'no left/right chart wording in ' + k);

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['rgOrigin', 'rgSteady', 'rgMixed', 'rgChaos']) ok(STRINGS.zh[k], 'dynamic key ' + k);
for (const id of ['r0', 'k0', 'r1', 'r2', 'rho3', 'k3', 'play3', 'end3', 'k4', 'all4', 'clear4', 'e5', 'play5', 'end5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [relp, anchor] = h.split('#'), target = path.join(dir, relp, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/mechanics/chaos-threebody/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS chaos-threebody core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · horizon slope ${fit.slope.toFixed(2)} vs ${th.toFixed(2)} · regular ε ≤ ${Math.max(...regular)}, split ${chaotic.length}/17`);
