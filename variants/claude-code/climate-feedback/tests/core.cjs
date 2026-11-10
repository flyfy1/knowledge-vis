'use strict';
// Climate feedback (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`));
const fmt = (v, d) => { const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
// the page's formatter keeps whole numbers intact (90 must not become 9)
ok(fmt(90, 0) === '90' && fmt(1.5, 2) === '1.5' && fmt(2, 2) === '2', 'trailing-zero trim only after a decimal point');

// ---- step 0: the ledger and the forcing ----
near(M.ABSORBED, 238.2, 0.05, 'absorbed sunlight 1361/4 × 0.7'); both('s0e', '238'); both('s0e', '1361'); both('s0e', '30%');
near(M.forcing(280), 0, 1e-12, 'no forcing at 280 ppm');
near(M.F2X, 3.71, 0.005, 'doubling forcing'); both('s0hint', '3.71'); both('s1e', '3.71'); both('s6fin', '3.71');
near(M.forcing(1120) - M.forcing(560), M.forcing(560) - M.forcing(280), 1e-12, 'each doubling adds the same forcing');
near(M.forcing(140), -M.F2X, 1e-12, 'halving subtracts the same forcing');
// the gap stays a few percent of income on the slider range; about 3% at 1120 ppm
let maxPct = 0; for (let c = 140; c <= 1120; c += 10) maxPct = Math.max(maxPct, Math.abs(M.forcing(c)) / M.ABSORBED * 100);
ok(maxPct > 2.9 && maxPct < 3.2, 'max gap ≈ 3% ' + maxPct); both('s0hint', '1120');
// the step-0 axis 220–248 holds both bars for every slider value
for (let c = 140; c <= 1120; c += 10) ok(M.ABSORBED - M.forcing(c) > 220 && M.ABSORBED - M.forcing(c) < 248, 'spending inside axis');

// ---- step 1: Planck response ----
near(M.T_EMIT, 255, 0.6, 'emission temperature ≈ 255 K'); near(M.PLANCK_BB, 3.74, 0.005, '4σT³'); both('s1e', '255 K'); both('s1e', '3.74'); both('s1e', '3.22');
const eq0 = M.equilibrium(M.F2X); near(eq0, 1.15, 0.005, 'Planck-only equilibrium'); both('s1hint', '1.15'); both('s6fin', '1.15');
// exactly one slider position (step 0.05 on 0..3) reports "balanced"; it is 1.15
const flat = []; for (let i = 0; i <= 60; i++) { const d = i * 0.05; if (Math.abs(M.imbalance(M.F2X, d)) < M.LP * 0.025) flat.push(d.toFixed(2)); }
assert.deepEqual(flat, ['1.15']); checks++;
// ledger rows add up to the net
for (let d = 0; d <= 3; d += 0.25) { const L = M.ledger(M.F2X, d, M.FB); near(L.net, M.imbalance(M.F2X, d, M.FB.wv + M.FB.ice + M.FB.cloud), 1e-12, 'ledger sum'); }
// step-1 axis −6.5..4.5 holds the waterfall at ΔT = 3
ok(M.imbalance(M.F2X, 3) > -6.5, 'net inside axis at ΔT = 3');

// ---- step 2: round by round ----
for (let f = 0; f <= 2.4 + 1e-9; f += 0.05) {
  const R = M.rounds(M.F2X, f, 400);
  near(R.list[0].inc, M.F2X / M.LP, 1e-12, 'round 1 = F/λP');
  near(R.list[399].total, R.limit, 1e-9, 'rounds converge to F/(λP − f) for f=' + f.toFixed(2));
  near(R.limit / eq0, 1 / (1 - f / M.LP), 1e-12, 'gain = 1/(1 − r)');
  const n = M.roundsTo(f, 0.95), R12 = M.rounds(M.F2X, f, 12);
  ok(n <= 12, '95% within the 12 drawn rounds for f=' + f.toFixed(2));
  if (n > 1) ok(R12.list[n - 1].total >= 0.95 * R.limit - 1e-12 && R12.list[n - 2].total < 0.95 * R.limit, 'roundsTo is the first round past 95%');
  ok(R.limit <= 5, 'limit inside the 0–5 K axis');
}
ok(2.4 < M.LP, 'slider maximum below λP: the sum always converges'); both('s2hint', '2.4'); both('s2hint', '3.22');
near(M.FB.wv + M.FB.ice, 1.65, 1e-12, '1.65 = water vapour + ice'); both('s2hint', '1.65');
both('s2e', '0.35'); ok(M.FB.ice === 0.35, 'ice feedback 0.35');
ok(M.roundsTo(1.65, 0.95) > M.roundsTo(0.35, 0.95), 'stronger feedback needs more rounds');

// ---- step 3: the feedback list ----
both('s3e', '+1.30'); both('s3e', '+0.35'); both('s3e', '+0.42'); both('s3e', '−0.10'); both('s3e', '+0.94');
const all = c => M.equilibrium(M.F2X, M.fbSum(true, true, c));
near(M.LAMBDA_C, 1.15, 1e-12, 'central restoring strength'); both('s4e', '1.15');
near(all(0.42), 3.22, 0.005, 'central ECS'); both('s6fin', '3.2');
near(all(-0.10), 2.22, 0.005, 'ECS at cloud −0.10'); near(all(0.94), 5.89, 0.005, 'ECS at cloud 0.94');
ok(all(0.94) - all(0.42) > 2.5 * (all(0.42) - all(-0.10)), 'long warm tail: upper spread ≫ lower spread');
// convexity: the curve steepens to the right for every toggle state (the "long tail" claim in s3hint)
for (const w of [false, true]) for (const i of [false, true]) {
  const e = c => M.equilibrium(M.F2X, M.fbSum(w, i, c));
  for (let c = -0.18; c <= 1.18; c += 0.02) ok(e(c + 0.02) - e(c) > e(c) - e(c - 0.02), 'convex');
}
// removing water vapour flattens the curve: smaller spread across the cloud range
const noWv = c => M.equilibrium(M.F2X, M.fbSum(false, true, c));
ok(noWv(0.94) - noWv(-0.10) < 0.5 * (all(0.94) - all(-0.10)), 'unticking water vapour shrinks the cloud spread');
// the cloud slider grid hits −0.10, 0.42 and 0.94 exactly
const grid = []; for (let i = 0; i <= 52; i++) grid.push(+(-0.1 + i * 0.02).toFixed(2));
ok(grid.includes(0.42) && grid[52] === 0.94, 'cloud slider grid');
// every slider state keeps the restoring strength positive and the curve below the 10 K axis inside the band
for (const c of grid) ok(M.restoring(M.fbSum(true, true, c)) > 0.6 && all(c) < 10, 'stable everywhere on the slider');

// ---- step 4: the ocean's delay ----
for (const h of [25, 50, 75, 100, 125, 150, 175, 200]) {
  const Cap = M.heatCap(h), tau = Cap / M.LAMBDA_C;
  near(M.oneLayer(M.F2X, M.LAMBDA_C, Cap, tau).T / (M.F2X / M.LAMBDA_C), 1 - Math.exp(-1), 1e-12, '63% at τ');
  ok(M.oneLayer(M.F2X, M.LAMBDA_C, Cap, 3 * tau).T / (M.F2X / M.LAMBDA_C) > 0.95, '95% at 3τ');
  for (const tt of [1, 5, 20, 60]) {
    const s = M.oneLayer(M.F2X, M.LAMBDA_C, Cap, tt);
    near(s.N + M.LAMBDA_C * s.T, M.F2X, 1e-12, 'N = F − ΛT');
    near(M.oneLayerEuler(M.F2X, M.LAMBDA_C, Cap, tt), s.T, 2e-3, `Euler vs closed form h=${h} t=${tt}`);
  }
  ok(tau > 1.5 && tau < 17, 'τ from a few years to a couple of decades');
}
ok(M.heatCap(200) / M.LAMBDA_C < 60, 'τ line falls inside the 60-year axis');
both('s4e', '63%'); both('s4e', '95%'); both('s4e', '71%');
// 75 m vs 200 m: same end point, slower climb
{ const a = M.oneLayer(M.F2X, M.LAMBDA_C, M.heatCap(75), 10).T, b = M.oneLayer(M.F2X, M.LAMBDA_C, M.heatCap(200), 10).T; ok(b < a, 'deeper is slower'); }

// ---- step 5: the carbon books ----
near(M.GTC_PER_PPM, 2.12, 0.005, 'GtC per ppm'); both('s5e', '2.12'); both('s5e', '420');
near(M.ppmRate(10, 0.55), 10 * 0.45 / 2.124, 1e-12, 'ppm rate');
const cross = (E, s) => (560 - 420) / M.ppmRate(E, s);
ok(cross(10, 0.40) < cross(10, 0.55), 'weaker sinks cross 560 earlier');
ok(cross(10, 0.55) < 80, 'default settings cross 560 within 80 years');
ok(M.ppmAt(0, 0.55, 80) === 420, 'zero emissions: CO₂ stays at 420 in this model');
ok(M.ppmAt(16, 0.30, 80) < 900 && M.eqWarming(M.ppmAt(16, 0.30, 80)) < 6, 'largest setting inside both axes');
ok(M.eqWarming(420) > 1.2 + 0.5, 'equilibrium warming at 420 ppm is well above the ~1.2 K observed (boundary note)');
both('boundary', '1.2 K'); both('boundary', '420');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s4lgTau']); // symbols only
for (const k of zk) if (!NEUTRAL.has(k)) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|on the left|on the right/i.test(STRINGS[l][k]), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['co2', 'dT1', 'f2', 'run2', 'all2', 'wv3', 'ice3', 'cloud3', 'h4', 'run4', 'clear4', 'e5', 's5', 'pin5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/climate/climate-feedback/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS climate-feedback core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · ECS ${all(-0.1).toFixed(2)}/${all(0.42).toFixed(2)}/${all(0.94).toFixed(2)} K`);
