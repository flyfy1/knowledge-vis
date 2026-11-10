'use strict';
// Double-slit (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: bright where Δ = mλ, dark where Δ = (m + ½)λ; Δ ≈ d·y/L ----
const lam = 650e-9, d = 0.25e-3, L = 1;
for (let i = -120; i <= 120; i++) {
  const y = i * 0.05e-3, p = M.paths(y, d, L);
  near(p.delta, p.r2 - p.r1, 1e-18, 'Δ = r₂ − r₁');
  near(p.delta, d * y / L, 1e-10, 'Δ ≈ d·y/L on the ±6 mm screen (within 0.1 nm)');
  const I = M.pointIntensity(y, lam, d, L), c = Math.cos(Math.PI * p.delta / lam);
  near(I, c * c, 1e-12, 'cos²(πΔ/λ)');
}
for (let m = -2; m <= 2; m++) {
  // bright band at Δ = mλ, dark at Δ = (m + ½)λ, found from the exact geometry
  const yb = m * M.firstMaxExact(lam, d, L);
  near(M.pointIntensity(yb, lam, d, L), 1, 1e-6, 'bright at Δ = mλ');
  near(M.pointIntensity(yb + M.firstMaxExact(lam, d, L) / 2, lam, d, L), 0, 1e-6, 'dark half way');
}
// the slider range ±6 mm holds the centre and at least two bright bands on each side
ok(2 * M.firstMaxExact(lam, d, L) < 6e-3, 'two bands each side within ±6 mm');

// ---- step 1: spacing ≈ λL/d over the whole slider grid; ratios multiply ----
let worst = 0;
const meas0 = M.firstMaxExact(lam, d, L);
near(meas0 * 1e3, 2.6, 1e-4, 'default spacing 2.6 mm');
for (let l = 400; l <= 700; l += 5) for (let dd = 0.1; dd <= 0.6001; dd += 0.01) for (let LL = 0.5; LL <= 3.0001; LL += 0.1) {
  const m = M.firstMaxExact(l * 1e-9, dd * 1e-3, LL), a = M.spacingApprox(l * 1e-9, dd * 1e-3, LL);
  worst = Math.max(worst, Math.abs(m - a) / a);
  near(m / meas0 / ((l / 650) * (LL / 1) / (dd / 0.25)), 1, 1e-4, 'Δy factor (relative) = λ factor × L factor ÷ d factor');
}
ok(worst < 1e-4, 'exact spacing within 0.01% of λL/d on the slider grid: ' + worst);
// doubling L doubles Δy, doubling d halves it (s1hint)
near(M.firstMaxExact(lam, d, 2) / meas0, 2, 1e-5, 'double L'); near(M.firstMaxExact(lam, 0.5e-3, L) / meas0, 0.5, 1e-5, 'double d');

// ---- step 2: envelope, orders inside the central lobe, missing orders ----
for (let a = 20; a <= 200; a += 5) for (let dd = 0.10; dd <= 0.6001; dd += 0.05) {
  const p = { lam, d: dd * 1e-3, L, a: a * 1e-6 }, y0 = M.envelopeZero(lam, p.a, L), f = M.fringesInLobe(p.d, p.a);
  near(M.envelope(y0, p), 0, 1e-12, 'envelope zero');
  near(y0 / (lam * L / p.a), 1, 1e-3, 'zero ≈ λL/a (within 0.1%)');
  // visible orders: never more than the |m| < d/a rule; equal to it whenever no order sits within 0.1 of d/a
  const v = M.lobeOrders(p), sp = M.firstMaxExact(lam, p.d, L), frac = p.d / p.a - Math.floor(p.d / p.a);
  ok(v.count <= f.count, 'visible ≤ rule');
  if (frac > 0.1 && frac < 0.9) { assert.equal(v.count, f.count, `orders inside lobe a=${a} d=${dd.toFixed(2)}`); checks++; }
  if (f.missing) { assert.equal(v.missing, f.missing); checks++; }
  // the missing note fires exactly when an order lies within 0.1 of d/a, and that order is (nearly) dark
  if (v.missing) ok(M.intensity(v.missing * sp, p) < 0.03, 'noted missing order is dark');
  if (f.missing) near(M.intensity(f.missing * sp, p), 0, 1e-6, 'missing order is dark');
}
{ const f = M.lobeOrders({ lam, d: 0.25e-3, L, a: 50e-6 }); assert.equal(f.count, 9); assert.equal(f.missing, 5); checks += 2; } // s2hint: a = 50 µm, d = 0.25 mm → ±5 missing
// envelope depends only on a; spacing only on d
near(M.envelopeZero(lam, 50e-6, L), M.envelopeZero(lam, 50e-6, L), 0, 'envelope independent of d');

// ---- step 3: sampling from the curve; dark-band shares quoted in s3hint ----
const P3 = { lam, d, a: 0.05e-3, L }, Y3 = 14e-3, ds = M.darkStats(P3, Y3);
ok(ds.widthShare > 0.40 && ds.widthShare < 0.45, 'dark bands cover "more than 40%" of the screen: ' + ds.widthShare);
ok(ds.hitShare > 0.015 && ds.hitShare < 0.03, 'dark bands get "about 2%" of hits: ' + ds.hitShare);
ok(M.envelopeZero(lam, P3.a, L) < Y3, 'the ±14 mm screen holds the whole central envelope');
{
  const s = M.sampler(P3, Y3), rng = M.mulberry32(20261109), N = 20000, BINS = 140, counts = new Array(BINS).fill(0);
  let dark = 0;
  for (let i = 0; i < N; i++) { const y = s(rng()); rng(); ok(Math.abs(y) <= Y3, 'hit on screen'); if (M.isDark(y, P3, ds.peak)) dark++; counts[Math.min(BINS - 1, Math.floor((y + Y3) / (2 * Y3) * BINS))]++; }
  near(dark / N, ds.hitShare, 0.004, 'sampled dark share matches prediction');
  const exp = M.expectedBins(P3, Y3, BINS, N);
  near(exp.reduce((a, b) => a + b, 0), N, 1e-6, 'expected counts sum to N');
  let chi = 0, dof = 0; counts.forEach((c, b) => { if (exp[b] > 5) { chi += (c - exp[b]) ** 2 / exp[b]; dof++; } });
  ok(chi / dof < 1.5, 'histogram consistent with the curve, χ²/dof = ' + (chi / dof).toFixed(2));
}

// ---- step 4: complementarity ----
for (let D = 0; D <= 1.0001; D += 0.05) {
  const V = M.visibility(D);
  near(V * V + D * D, 1, 1e-12, 'V² + D² = 1');
  near(M.guessRight(D), (1 + D) / 2, 1e-15, 'guess probability');
  const mc = M.measuredContrast({ lam, d, L, a: 20e-6, V });
  near(mc.V, V, 0.005, 'contrast read from the curve ≈ √(1 − D²) with a = 20 µm');
  near(mc.V * mc.V + D * D, 1, 0.006, 'readout V² + D² ≈ 1');
}
near(M.visibility(0.5), 0.866, 0.001, 'D = 0.5 → V ≈ 0.87 (s4hint)');
// D = 1: pattern = sum of the two single-slit patterns (no fringe term)
for (let y = -8e-3; y <= 8e-3; y += 0.5e-3) near(M.intensity(y, { lam, d, L, a: 20e-6, V: 0 }), M.envelope(y, { lam, d, L, a: 20e-6 }) / 2, 1e-12, 'V = 0 → envelope/2');
near(M.envelope(8e-3, { lam, d, L, a: 20e-6 }), 0.8, 0.03, 'a = 20 µm envelope eases to about 0.8 at ±8 mm');

// ---- step 5: de Broglie wavelengths, spacing and verdicts ----
const lamOf = id => { const o = M.OBJECTS.find(q => q.id === id); return M.deBroglie(o.m, o.v).lam; };
near(lamOf('electron'), 7.27e-11, 0.01e-11, 'electron λ'); near(lamOf('neutron'), 1.98e-10, 0.01e-10, 'neutron λ');
near(lamOf('c60'), 2.52e-12, 0.01e-12, 'C60 λ ≈ 2.5 pm (Arndt 1999 used 220 m/s)'); near(lamOf('baseball'), 1.14e-34, 0.01e-34, 'baseball λ');
const dyOf = l => l * M.MATTER.L / M.MATTER.d;
for (const o of M.OBJECTS) for (let k = -1; k <= 1.0001; k += 0.05) {
  const v = o.v * Math.pow(10, k), { lam: l, gamma } = M.deBroglie(o.m, v);
  ok(v < 3e8 && gamma >= 1, 'subluminal');
  ok(l >= 1e-36 && l <= 1, 'λ on the ruler (10⁻³⁶…1 m) for ' + o.id);
  ok(dyOf(l) >= 1e-36 && dyOf(l) <= 1, 'Δy on the ruler for ' + o.id);
}
// verdict classes at typical speeds: electron, neutron, C60 resolvable; dust in between; baseball never
ok(dyOf(lamOf('electron')) >= 1e-6 && dyOf(lamOf('neutron')) >= 1e-6 && dyOf(lamOf('c60')) >= 1e-6, 'visible fringes');
ok(dyOf(lamOf('dust')) < 1e-6 && dyOf(lamOf('dust')) >= 1e-10, 'dust: hard');
ok(dyOf(lamOf('baseball')) < 1e-10, 'baseball: never');
// s5hint: at every baseball speed λ is more than 10¹⁸ times smaller than a proton, and only grows tenfold at k = −1
const proton = M.REFS.find(r => r.id === 'proton').s, bb = M.OBJECTS.find(o => o.id === 'baseball');
ok(proton / M.deBroglie(bb.m, bb.v / 10).lam > 1e18, 'baseball λ < proton / 10¹⁸ at slowest speed');
near(M.deBroglie(bb.m, bb.v / 10).lam / lamOf('baseball'), 10, 1e-9, 'tenfold');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['markLam', 'markDy']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes(l === 'zh' ? '双缝实验 · 一颗一颗的粒子，也走出干涉条纹' : 'The Double-Slit Experiment · Single Particles Still Build Fringes'), 'footer names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const o of M.OBJECTS) ok(STRINGS.zh['obj_' + o.id] && html.includes(`data-obj="${o.id}"`), 'object ' + o.id);
for (const r of M.REFS) ok(STRINGS.zh['ref_' + r.id], 'ref ' + r.id);
for (const id of ['y0', 'sweep0', 'clear0', 'lam1', 'd1', 'L1', 'reset1', 'a2', 'd2', 'fire1', 'fire10', 'fire100', 'fire1000', 'reset3', 'checkQuiz', 'D4', 'k5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/modern/double-slit/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS double-slit core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · spacing error ${(worst * 100).toExponential(1)}% · dark share ${(ds.hitShare * 100).toFixed(2)}% of hits over ${(ds.widthShare * 100).toFixed(1)}% width`);
