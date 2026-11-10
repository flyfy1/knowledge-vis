'use strict';
// Carbon cycle (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (s, m) => { for (const l of ['zh', 'en']) ok(Object.values(STRINGS[l]).some(v => v.includes(s)), `${m} (“${s}” in ${l})`); };

// ---- step 0: ledger ----
for (const b of M.BOXES) near(M.grossIn(b), M.grossOut(b), 1e-9, 'pre-industrial balance ' + b);
const r0 = M.run(() => 0, 300, { every: 50 });
r0.forEach(r => M.BOXES.forEach(b => near(r[b], M.STOCK0[b], 1e-6, 'E = 0 stays at equilibrium ' + b)));
near(M.ppm(M.STOCK0.air), 277.8, 0.1, '590 GtC ≈ 278 ppm'); both('2.124', 'GtC per ppm'); both('278 ppm', 'pre-industrial ppm');
near(M.GTC_PER_PPM, 2.124, 0, 'conversion factor');
const tau = Object.fromEntries(M.BOXES.map(b => [b, M.turnover(b)]));
near(tau.air, 3.4, 0.05, 'air turnover 3.4 years (s0hint, s6fin)'); both('3.4', 'air turnover in text');
for (const b of ['air', 'plants', 'surf']) ok(tau[b] >= 3 && tau[b] <= 6, '“three to six years” ' + b);
ok(tau.soil > 25 && tau.soil < 35, 'soil “about thirty”'); ok(tau.deep > 330 && tau.deep < 400, 'deep “nearly four hundred”');

// ---- step 1: tagged atoms vs excess ----
const pulses = {};
for (let P = 100; P <= 2000; P += 100) {
  const c = M.pulse(P, 200); pulses[P] = c;
  near(c[0].tagged, 1, 1e-9, 'both start at 100%'); near(c[0].excess, 1, 1e-9, 'both start at 100%');
  ok(c[10].tagged > 0.18 && c[10].tagged < 0.22, 'tagged “drops to two-tenths within ten years”');
  ok(c[100].excess > 0.2 && c[100].excess < 0.3, 'excess “more than two-tenths” after 100 years; quiz b “about a quarter”');
  ok(c[100].tagged < 0.07, 'tagged ≈ 5% at 100 years');
  for (let t = 1; t <= 200; t++) { ok(c[t].excess > c[t].tagged, 'excess outlives tagged atoms'); ok(c[t].excess <= c[t - 1].excess + 1e-12, 'excess decays'); ok(c[t].excess <= 1 && c[t].tagged >= 0, 'axis 0–100%'); }
  if (P > 100) { near(c[50].tagged, pulses[100][50].tagged, 1e-12, 'tagged independent of P'); ok(c[10].excess > pulses[P - 100][10].excess, 'bigger pulse → higher excess'); }
}
ok(pulses[2000][20].excess - pulses[100][20].excess > pulses[2000][150].excess - pulses[100][150].excess, 'P effect strongest in the first decades');
const p500 = pulses[500];
near(Math.round(p500[100].excess * 100), 23, 0, 's6fin ex100 = 23%'); near(Math.round(p500[100].tagged * 100), 5, 0, 's6fin tag100 = 5%');
// closure of the excess: air + land + ocean gain = pulse
const pr = M.run(() => 0, 200, { start: { air: M.STOCK0.air + 500 }, every: 50 });
pr.forEach(r => near(M.BOXES.reduce((s, b) => s + r[b] - M.STOCK0[b], 0), 500, 1e-6, 'pulse carbon conserved'));

// ---- step 2: constant emission ----
const AF = {};
for (let E = 0; E <= 20; E++) {
  const r = M.run(() => E, 150, { every: 1 }); AF[E] = r;
  r.forEach(q => { near(M.excess(q) + q.landCum + q.oceanCum, q.cum, 1e-6 * (1 + q.cum), 'air + land + ocean = cumulative emission'); ok(q.ppm >= 250 && q.ppm <= 800, 'ppm axis 250–800'); ok(q.cum <= 3000, 'stack axis 0–3000'); });
  near(r[150].cum, 150 * E, 1e-6, 'cumulative = E × years');
}
const af = (E, y) => M.excess(AF[E][y]) / AF[E][y].cum;
near(af(10, 150), M.airborne(10, 150), 1e-9, 'airborne helper agrees');
for (const y of [25, 50, 100, 150]) for (const E of [5, 15, 20]) near(af(E, y), af(10, y), 0.03, 'airborne fraction “almost the same” across E at ' + y);
for (const E of [5, 10, 15]) { for (let y = 2; y <= 150; y++) ok(af(E, y) < af(E, y - 1) + 1e-9, 'airborne fraction falls under constant E'); ok(af(E, 25) > 0.45 && af(E, 50) < 0.55 && af(E, 50) > 0.45, '“about half in the first decades”'); ok(af(E, 150) > 0.3 && af(E, 150) < 0.4, '“a bit over three-tenths” by year 150'); }
const rise = E => AF[E][150].ppm - AF[0][150].ppm;
ok(rise(10) / rise(5) > 1.9 && rise(10) / rise(5) < 2.15, 'doubling E nearly doubles the rise');
for (const y of [50, 100, 150]) ok(af(10, y) >= 0.3 && af(10, y) <= 0.5, 's6fin “three to five tenths”');
near(Math.round(AF[10][150].ppm), 516, 0, 'E = 10 → 516 ppm at year 150');
both('44%', 'observed airborne fraction');

// ---- step 3: sinks ----
const afX = (xi, beta) => M.airborne(10, 100, { xi, beta });
for (const beta of [0, 0.3, 0.6]) { let prev = 0; for (let xi = 1; xi <= 15; xi += 0.5) { const a = afX(xi, beta); ok(a > prev, 'larger ξ → more stays airborne'); ok(a < 0.7, 'axis 0–70%'); prev = a; } }
for (let xi = 1; xi <= 15; xi += 1) { ok(afX(xi, 0) > afX(xi, 0.3) && afX(xi, 0.3) > afX(xi, 0.6), 'β = 0 curve is the highest'); }
ok(afX(1, 0.3) > 0.1 && afX(1, 0.3) < 0.2, 'ξ = 1 → “a bit over one tenth”'); ok(afX(15, 0.3) > 0.4 && afX(15, 0.3) < 0.5, 'ξ = 15 → “a bit over four tenths”');
near(Math.round(afX(10, 0.3) * 100), 39, 0, 'default 39%');
const r3 = M.run(() => 10, 100, { every: 100 })[1]; near(r3.cum, 1000, 1e-6, '100 years × 10 = 1000 GtC (s3readout)');

// ---- step 4: stopping ----
const ex = q => M.ppm(M.excess(q)); let lastPeak = 0, lastTail = 0;
for (let T = 20; T <= 150; T += 5) {
  const r = M.run(M.stopAt(10, T), 700, { every: 1 });
  ok(r.length === 701, 'run covers 0–700'); ok(T + 500 <= 700, 'T + 500 inside the axis');
  for (let t = 1; t <= 700; t++) { if (t <= T) ok(ex(r[t]) > ex(r[t - 1]), 'rises while emitting'); else ok(ex(r[t]) < ex(r[t - 1]), 'falls after stopping'); ok(ex(r[t]) < 250, 'axis 0–250 ppm'); }
  const d1 = ex(r[T]) - ex(r[T + 20]), d2 = ex(r[T + 200]) - ex(r[T + 220]); ok(d1 > 5 * d2, 'fast first, then slower');
  ok(ex(r[T]) > lastPeak && ex(r[T + 500]) > lastTail, 'later stop → higher peak and higher tail'); lastPeak = ex(r[T]); lastTail = ex(r[T + 500]);
}
const r100 = M.run(M.stopAt(10, 100), 700, { every: 1 }), rr = k => ex(r100[100 + k]) / ex(r100[100]);
near(Math.round(r100[100].ppm), 459, 0, 'T = 100 peak 459 ppm');
ok(rr(500) > 0.25 && rr(500) < 0.35, '“about three tenths” remain centuries later (s6fin)'); ok(rr(50) > rr(200) && rr(200) > rr(500), 'remaining fraction keeps falling');

// ---- step 5: stabilising ----
let prevHeld = 0, prevE0 = 0;
for (let g = 350; g <= 600; g += 10) {
  const s = M.stabilise(g, 10, 500); ok(s.held !== null && s.held < 450, 'every target reached and followed on the axis ' + g);
  ok(s.held > prevHeld, 'higher target → reached later'); prevHeld = s.held;
  const h = Math.ceil(s.held), e0 = s.e0; ok(e0 > s.out[h].emit - 1e-9 && e0 < 10, 'e0 is the first held emission'); ok(e0 > prevE0 - 1e-9, 'higher target → more allowed at first'); prevE0 = e0;
  ok(h + 200 < s.out.length, 'year held + 200 sampled');
  for (let i = h + 1; i < s.out.length; i++) { ok(s.out[i].emit < s.out[i - 1].emit, 'allowed emission keeps falling'); near(s.out[i].ppm, g, 0.5, 'concentration held'); }
  s.out.forEach(q => { ok(q.ppm >= 250 && q.ppm <= 650, 'ppm axis 250–650'); ok(q.emit >= 0 && q.emit <= 12, 'emission axis 0–12'); });
}
const s450 = M.stabilise(450, 10, 500), h450 = Math.ceil(s450.held);
near(Math.round(s450.held), 93, 0, '450 ppm reached in year 93');
near(s450.e0, 7.3, 0.05, '450 ppm: about 7.3 GtC/yr at first'); near(s450.out[h450 + 50].emit, 4.6, 0.05, '4.6 fifty years on'); near(s450.out[h450 + 200].emit, 3.0, 0.05, '3 two hundred years on');
ok(M.ppm(M.STOCK0.air) < 350, 's5never only applies below the slider range (min 350 > 278)');

// ---- bilingual ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right figure references: ' + k);

// ---- keys, controls, provenance ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/\$\('([A-Za-z0-9_]+)'\)/g)) ok(html.includes(`id="${m[1]}"`), 'element ' + m[1]);
for (const id of ['bAir', 'bPlants', 'bSoil', 'bSurf', 'bDeep', 'P1', 'play1', 'E2', 'Y2', 'play2', 'clear2', 'X3', 'B3', 'T4', 'G5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard') && !app.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(html.includes('href="../../../earth/climate/carbon-cycle/"') && fs.existsSync(path.join(dir, '../../../earth/climate/carbon-cycle/index.html')), 'comparison link');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS carbon-cycle core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · τ_air ${tau.air.toFixed(2)} y · AF(100) ${afX(10, 0.3).toFixed(3)} · pulse@100 ${p500[100].excess.toFixed(3)}/${p500[100].tagged.toFixed(3)}`);
