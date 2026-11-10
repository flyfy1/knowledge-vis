'use strict';
// Blackbody radiation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const rel = (a, b) => Math.abs(a / b - 1);

// ---- constants quoted on the page ----
near(M.sigma, 5.670374419e-8, 1e-16, 'σ from h, c, k'); ok(M.sigma.toPrecision(3) === '5.67e-8', 'σ ≈ 5.67e-8 as quoted');
near(M.b * 1e3, 2.897771955, 1e-8, 'Wien b'); ok((M.b * 1e3).toFixed(3) === '2.898', 'b ≈ 2.898 mm·K as quoted');
near(M.WIEN_X, 5 * (1 - Math.exp(-M.WIEN_X)), 1e-12, 'Wien x solves x = 5(1 − e^−x)');

// ---- Wien: numerical argmax = b/T across the whole slider ranges (steps 0–2) ----
for (let T = 250; T <= 12000; T += 10) ok(rel(M.peakNumeric(T), M.wienPeak(T)) < 1e-6, 'numeric peak = b/T at ' + T);
// step 2: λpeak·T constant; "shape identical on a log axis": M(λ,T)/Mpeak(T) depends on λT only
for (const [T1, T2] of [[310, 5772], [1000, 9940], [2800, 250]]) for (const u of [0.2, 0.5, 1, 2, 5, 20]) {
  const l1 = u * M.b / T1, l2 = u * M.b / T2;
  near(M.planck(l1, T1) / M.peakValue(T1), M.planck(l2, T2) / M.peakValue(T2), 1e-12, 'normalised shape depends on λT only');
}
// presets and quiz: body 310 K → ≈ 9.3 μm, > 12 × 0.75 μm, "near 10 μm"
const body = M.wienPeak(310) * 1e6; near(body, 9.35, 0.01, 'body peak'); ok(body / 0.75 > 12 && body / 0.75 < 13, 'more than 12× the longest visible wavelength');
ok(body.toFixed(1) === '9.3' || body.toFixed(1) === '9.4', 'quiz quotes ≈ 9.3 μm'); ok(Math.round(body) === 9, 'quiz option b “about 9 μm”');
ok(M.wienPeak(5772) > M.VIS[0] && M.wienPeak(5772) < M.VIS[1], 'Sun peak inside the visible band');
ok(M.PRESETS.filter(p => M.wienPeak(p.T) >= M.VIS[0] && M.wienPeak(p.T) <= M.VIS[1]).map(p => p.id).join() === 'sun', 'only the Sun preset peaks in the visible band'); checks++;
ok(M.wienPeak(9940) < M.VIS[0], 'Sirius peak in the UV'); ok(M.wienPeak(2800) > M.VIS[1], 'bulb peak in the IR');
// step 1 hint: at 1500 K the top is near 2000 nm, inside the 0–3000 nm window
near(M.wienPeak(1500) * 1e9, 2000, 100, '1500 K peak near 2000 nm'); ok(M.wienPeak(1500) * 1e9 < 3000, 'peak drawn inside the window');

// ---- step 0: colour walk red → white → blue-white; visible share rises then falls ----
const col = T => M.colorOf(T).rgb;
{ const [r, g, b] = col(1000); ok(r === 255 && g < 120 && b < 40, 'embers 1000 K look red-orange ' + col(1000)); }
{ const [r, g, b] = col(5772); ok(Math.min(r, g, b) > 220, 'Sun looks nearly white ' + col(5772)); }
{ const [r, g, b] = col(9940); ok(b === 255 && r < b, 'Sirius looks bluish white ' + col(9940)); }
for (let T = 600; T <= 5000; T += 100) ok(col(T)[2] >= col(T - 100)[2], 'blue channel rises with T up to 5000 K');
// Planckian locus check against tabulated CIE chromaticities (fit accuracy, ±0.01)
for (const [T, x, y] of [[1000, 0.6528, 0.3444], [2856, 0.4476, 0.4074], [6500, 0.3135, 0.3237], [10000, 0.2807, 0.2884]]) {
  const c = M.colorOf(T); near(c.x, x, 0.012, 'chromaticity x at ' + T); near(c.y, y, 0.012, 'chromaticity y at ' + T);
}
ok(M.visibleShare(1000) < 1e-4, 'visible share at 1000 K is tiny'); ok(M.visibleShare(5772) > 0.4, 'more than 40% visible for the Sun');
ok(M.visibleShare(5772) / M.visibleShare(1000) > 1e4, '1000 K vs 5772 K: over ten-thousandfold');
// visible power by Simpson vs a fine midpoint sum
{ let s = 0; for (let nm = 380.05; nm < 750; nm += 0.1) s += M.planck(nm * 1e-9, 3000) * 0.1e-9; ok(rel(M.visiblePower(3000), s) < 1e-6, 'visible power integral'); }

// ---- step 1: peak ∝ T⁵, total ∝ T⁴ (readout multiples relative to 3000 K) ----
for (let T = 1500; T <= 6500; T += 50) {
  near(M.peakValue(T) / M.peakValue(3000), Math.pow(T / 3000, 5), 1e-9, 'peak ∝ T⁵');
  near(M.total(T) / M.total(3000), Math.pow(T / 3000, 4), 1e-12, 'total ∝ T⁴');
}
ok(M.peakValue(6500) / 1e12 > 140 && M.peakValue(6500) / 1e12 < 160, 'fixed axis top (6500 K peak) ≈ 149 kW/(m²·nm)');

// ---- step 3: numerical integral = σT⁴; doubling = 16; height ×32, width ÷2 ----
for (let T = 200; T <= 10000; T += 200) ok(rel(M.totalNumeric(T), M.total(T)) < 1e-6, 'numeric area = σT⁴ at ' + T);
for (let T = 200; T <= 5000; T += 10) near(M.total(2 * T) / M.total(T), 16, 1e-9, 'doubling gives 16');
near(M.peakValue(2000) / M.peakValue(1000), 32, 1e-9, 'peak height ×32');
near(M.wienPeak(2000) / M.wienPeak(1000), 0.5, 1e-12, 'width (peak position) ÷2');
// a full-width check that the curve really is half as wide: half-maximum points scale with 1/T
const halfMax = T => { const pk = M.peakValue(T), xs = []; let prev = M.planck(1e-8, T) - pk / 2; for (let i = 1; i <= 20000; i++) { const l = 1e-8 * Math.pow(1e4, i / 20000), v = M.planck(l, T) - pk / 2; if ((v > 0) !== (prev > 0)) xs.push(l); prev = v; } return xs; };
{ const a = halfMax(1000), b2 = halfMax(2000); ok(a.length === 2 && b2.length === 2, 'two half-max points'); near((b2[1] - b2[0]) / (a[1] - a[0]), 0.5, 2e-3, 'FWHM halves'); }

// ---- step 4: Rayleigh–Jeans ----
for (let T = 1000; T <= 8000; T += 100) for (let i = 0; i <= 300; i += 5) {
  const lam = 1e-7 * Math.pow(10, i / 100), x = M.xOf(lam, T);
  ok(M.rayleighJeans(lam, T) >= M.planck(lam, T), 'classical always above Planck');
  if (x < 700) near(M.rayleighJeans(lam, T) / M.planck(lam, T), Math.expm1(x) / x, 1e-9 * Math.expm1(x) / x, 'ratio = (eˣ−1)/x');
}
near(M.rayleighJeans(1e-4, 1000) / M.planck(1e-4, 1000), 1, 0.08, 'long-wave end: classical ≈ Planck (within 8% at 100 μm, 1000 K)');
ok(M.rayleighJeans(1e-7, 8000) / M.planck(1e-7, 8000) > 1e4, 'short-wave end: thousands of times too big even at 8000 K');
{ const x0 = M.rjValidX(0.05); near(Math.expm1(x0) / x0, 1.05, 1e-9, '5% boundary'); ok(M.rjValidLambda(1000) > M.rjValidLambda(8000), 'cooler → classical breaks at longer λ'); near(M.rjValidLambda(1000) / M.rjValidLambda(2000), 2, 1e-12, 'boundary ∝ 1/T'); }
for (const lam of [1e-7, 1e-6, 1e-5]) near(M.rjTail(lam / 10, 5000) / M.rjTail(lam, 5000), 1000, 1e-9, 'tail ×1000 per tenfold cut');
{ const tail = M.integrate(5000, 1e-6, 1e-1, 8000, M.rayleighJeans); ok(rel(tail, M.rjTail(1e-6, 5000) - M.rjTail(1e-1, 5000)) < 1e-6, 'tail formula = integral'); }
ok(M.rjTail(1e-7, 5000) / M.total(5000) > 1000, 'tail at 0.1 μm dwarfs σT⁴');

// ---- step 5: lumps ----
for (const x of [0.01, 0.1, 0.5, 1, 2, 5, 20, 100]) {
  let s = 0, e = 0; for (let n = 0; n < 200000 && n * x < 800; n++) { const p = M.occupancy(x, n); s += p; e += p * n * x; }
  near(s, 1, 1e-9, 'probabilities sum to 1 at x=' + x); near(e, M.meanEnergyRatio(x), 1e-7, 'mean energy = x/(eˣ−1) at x=' + x);
  near(1 - M.occupancy(x, 0), Math.exp(-x), 1e-12, 'P(at least one) = e⁻ˣ');
}
near(M.meanEnergyRatio(1e-6), 1, 1e-6, 'small x → classical kT'); ok(M.meanEnergyRatio(30) < 1e-11, 'large x → 0');
for (let i = 0; i <= 300; i += 7) for (const T of [1000, 5000, 8000]) {
  const lam = 1e-7 * Math.pow(10, i / 100), x = M.xOf(lam, T);
  if (x < 700) near(M.modeFactor(lam) * M.k * T * M.meanEnergyRatio(x), M.planck(lam, T), 1e-9 * M.planck(lam, T) + 1e-300, 'modes × ⟨E⟩ = Planck');
  near(M.modeFactor(lam) * M.k * T, M.rayleighJeans(lam, T), 1e-6 * M.rayleighJeans(lam, T), 'modes × kT = Rayleigh–Jeans');
}
// slider range covers both regimes the hint describes: rung spacing below and above kT
ok(M.xOf(1e-4, 8000) < 0.05 && M.xOf(1e-7, 1000) > 100, 'λ/T sliders span x from < 0.05 to > 100');
near(M.h * M.c / 1e-6 / M.eV, 1.24, 0.001, 'hν at 1 μm ≈ 1.24 eV');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.compare.includes('黑体辐射 · 热的物体为什么发光') && STRINGS.en.compare.includes('Blackbody Radiation · Why Hot Things Glow'), 'compare link names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const p of M.PRESETS) ok(STRINGS.zh['pre_' + p.id] !== undefined, 'preset label ' + p.id);
for (const id of ['T0', 'heat0', 'T1', 'yFix1', 'yAuto1', 'T2', 'clear2', 'checkQuiz', 'T3', 'sweep3', 'clear3', 'T4', 'L4', 'T5', 'L5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel2, anchor] = h.split('#'), target = path.join(dir, rel2, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/modern/blackbody-radiation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS blackbody-radiation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
