'use strict';
// Climate energy ledger (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`));

// ---- step 0 ----
both('s0e', '1361');
for (let lat = 0; lat <= 80; lat++) {
  near(M.noonFlux(lat), 1361 * Math.cos(lat * Math.PI / 180), 1e-9, 'S sin h = S cos φ at equinox noon');
  near(M.spread(lat) * M.noonFlux(lat), M.S, 1e-9, 'footprint × irradiance = S (energy in the beam conserved)');
}
near(M.spread(60), 2, 1e-12, '60° → footprint ×2'); near(M.noonFlux(60) / M.noonFlux(0), 0.5, 1e-12, '60° → half'); both('s0hint', '60°'); both('s0hint', '2');

// ---- step 1 ----
near(M.globalMean(), 340.25, 1e-9, 'S/4');
near(M.runningMean(9), M.S / 4, 1e-9, 'all bands → S/4 exactly');
// equinox daily mean at the equator; first pair of bands ≈ 431 W/m² (s1hint)
near(M.dailyMean(0), M.S / Math.PI, 1e-9, 'equator daily mean S/π');
near(M.runningMean(1), 431, 0.5, 'first pair mean ≈ 431'); both('s1hint', '431');
for (let k = 2; k <= 9; k++) ok(M.runningMean(k) < M.runningMean(k - 1), 'running mean falls monotonically');
// band means vs numerical integration; areas add to one hemisphere
let area = 0;
for (const [a, b] of M.BANDS) {
  area += M.bandArea(a, b);
  let num = 0, den = 0; for (let i = 0; i < 2000; i++) { const p = a + (b - a) * (i + 0.5) / 2000, w = Math.cos(p * Math.PI / 180); num += M.dailyMean(p) * w; den += w; }
  near(M.bandMean(a, b), num / den, 1e-4, `band mean ${a}–${b}`);
}
near(area, 0.5, 1e-12, 'nine bands cover one hemisphere (half the globe)');
// global integral of the true daily-mean curve over the sphere
{ let num = 0, den = 0; for (let i = 0; i < 20000; i++) { const p = -90 + 180 * (i + 0.5) / 20000, w = Math.cos(p * Math.PI / 180); num += M.dailyMean(p) * w; den += w; } near(num / den, M.S / 4, 1e-3, 'sphere average = S/4'); }
both('s1e', '340');

// ---- step 2 ----
for (const s of M.SURFACES) ok(STRINGS.zh['pre_' + s.id].includes(s.alpha.toFixed(2)) && STRINGS.en['pre_' + s.id].includes(s.alpha.toFixed(2)), 'preset label ' + s.id);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const s of M.SURFACES) ok(html.includes(`data-alpha="${s.alpha.toFixed(2)}"`), 'preset button ' + s.id);
for (let a = 0; a <= 0.9; a += 0.01) near(M.absorbed(a) + a * M.S / 4, M.S / 4, 1e-9, 'reflected + absorbed = 340.25');
near(M.absorbed(0.3), 238.175, 1e-9, 'Earth absorbs ≈ 238'); both('s6fin', '238'); both('s2e', '0.30');

// ---- step 3 ----
near(M.Te(0.3), 254.6, 0.05, 'Te ≈ 255 K'); both('s3hint', '255 K'); both('s3hint', '−18'); near(M.Te(0.3) - 273.15, -18.6, 0.1, '≈ −18.6 °C (text: about −18 °C)');
both('s3hint', '288 K'); both('s3hint', '33 K'); near(288 - M.Te(0.3), 33.4, 0.1, 'gap ≈ 33 K');
for (const a of [0, 0.3, 0.6]) near(M.emit(M.Te(a)), M.absorbed(a), 1e-9, 'σTe⁴ = absorbed');
// relaxation from both sides converges to Te (10 years, 50 m layer); never overshoots
ok(/id="a3"[^>]*max="0.6"/.test(fs.readFileSync(path.join(dir, 'index.html'), 'utf8')) && M.Te(0.6) > 200, 'step-3 albedo range keeps Te inside the 190–330 K plot');
for (const a of [0, 0.3, 0.6]) for (const T0 of [200, 255, 320]) {
  const r = M.relax(a, 0, T0, 10, 0.02), te = M.Te(a), end = r[r.length - 1];
  ok(Math.abs(end.T - te) < (a === 0.3 ? 1 : 0.1 * Math.abs(T0 - te) + 0.5), `converges a=${a} T0=${T0}: ${end.T}`);
  for (let i = 1; i < r.length; i++) ok((T0 < te ? r[i].T >= r[i - 1].T - 1e-9 && r[i].T <= te + 1e-6 : r[i].T <= r[i - 1].T + 1e-9 && r[i].T >= te - 1e-6), 'monotone, no overshoot');
  // N = income − spending in every sample, and its sign drives dT/dt
  for (let i = 1; i < r.length; i += 25) ok(Math.sign(r[i].T - r[i - 1].T) === Math.sign(r[i - 1].N) || Math.abs(r[i - 1].N) < 1e-6, 'sign(dT) = sign(N)');
}
// RK4 step vs a much finer step
{ const a = M.relax(0.3, 0, 200, 10, 0.02), b = M.relax(0.3, 0, 200, 10, 0.002); near(a[a.length - 1].T, b[b.length - 1].T, 1e-4, 'time step converged'); }
near(M.tauYears(0.3, 0), 1.77, 0.01, 'τ ≈ 1.8 years');
// e-folding: after τ the gap from Te shrinks to about 1/e for a small displacement
{ const te = M.Te(0.3), tau = M.tauYears(0.3, 0), r = M.relax(0.3, 0, te - 2, 3 * tau, tau / 200); near((te - r[200].T) / 2, Math.exp(-1), 0.01, 'linear e-folding'); }
// slider range 200–320 K sits inside the plotted 190–330 K; σT⁴ ≤ 650 W/m²
ok(M.emit(320) < 650 && M.Te(0) < 330 && M.Te(0.6) > 190, 'plot ranges');

// ---- step 4 ----
near(M.Ts(0.3, 0.78), 288.06, 0.05, 'ε = 0.78 → ≈ 288 K'); both('s4e', '288 K'); both('s4e', '0.78');
for (let e = 0; e <= 1.0001; e += 0.01) for (const a of [0.1, 0.3, 0.5]) {
  const L = M.ledger(a, e);
  near(L.olr, L.abs, 1e-9, `TOA balance ε=${e}`);
  near(L.surfaceIn, L.up, 1e-9, 'surface balance');
  near(L.intoLayer, L.layerUp + L.layerDown, 1e-9, 'layer balance');
  near(L.inc, L.refl + L.abs, 1e-9, 'shortwave split');
  if (e > 0.01) ok(M.Ts(a, e) > M.Ts(a, e - 0.01), 'Ts rises with ε');
}
near(M.Ts(0.3, 0), M.Te(0.3), 1e-9, 'ε = 0 → back to Te'); both('s4hint', '255 K');
near(M.ledger(0.3, 0.78).up, 390.45, 0.05, 'surface emits ≈ 390');

// ---- step 5 ----
{
  const T0 = M.Ts(0.3, 0.78), T1 = M.Ts(0.3, 0.80), r = M.relax(0.3, 0.80, T0, 15, 0.02);
  near(r[0].N, 3.9, 0.01, 'Δε = +0.02 → N ≈ +3.9 W/m²'); both('s5hint', '3.9');
  near(T1 - T0, 1.2, 0.01, 'Δε = +0.02 → ≈ +1.2 K'); both('s5hint', '1.2 K');
  ok(Math.abs(r[r.length - 1].T - T1) < 0.01, 'within 15 years the run reaches the new balance');
  for (let i = 1; i < r.length; i++) { ok(r[i].N <= r[i - 1].N + 1e-12 && r[i].N >= -1e-9, 'N decays to 0'); ok(r[i].T >= r[i - 1].T - 1e-12, 'T rises'); }
  const c = M.relax(0.32, 0.78, T0, 15, 0.02); ok(c[0].N < 0 && M.Ts(0.32, 0.78) < T0, 'Δα = +0.02 cools');
  // the plots autoscale; their largest ranges (±30 W/m², 278–298 K) cover every slider combination
  for (let de = -0.05; de <= 0.0501; de += 0.005) for (let da = -0.05; da <= 0.0501; da += 0.005) {
    const t1 = M.Ts(0.3 + da, 0.78 + de), n0 = M.relax(0.3 + da, 0.78 + de, T0, 0.02, 0.02)[0].N;
    ok(Math.abs(n0) < 30, 'N0 inside the largest autoscaled axis (±30)');
    ok(t1 > 278 && t1 < 298, 'T1 inside the largest temperature axis');
  }
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['wm2', 'lbS4', 's1lgS4']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|上图|下图|\bleft (plot|panel|chart)\b|\bright (plot|panel|chart)\b/i.test(v), `no positional figure reference in ${l}.${k}`);

// ---- keys, controls, provenance ----
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['lat0', 'play1', 'all1', 'a2', 'a3', 'T03', 'run3', 'clear3', 'e4', 'a4', 'de5', 'da5', 'run5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/climate/climate-energy/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS climate-energy core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
