'use strict';
// Action potential (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- step 0: resting voltage = conductance-weighted average ----
const R = M.REST, gna0 = M.gNaOf(R), gk0 = M.gKOf(R);
near(R.V, -65, 0.05, 'rest ≈ −65 mV'); both('tagline', '−65 mV');
near(M.target(gna0, gk0), R.V, 1e-9, 'rest is the weighted average');
ok(gk0 / gna0 > 20 && gk0 / gna0 < 60, 'K⁺ open tens of times more than Na⁺ (' + (gk0 / gna0).toFixed(1) + ')');
// a resting membrane stays put (no drift over 50 ms)
{ const r = M.simulate(() => 0, 50, 0.01, 50); ok(Math.max(...r.V.map(v => Math.abs(v - R.V))) < 1e-6, 'rest is stationary'); }
for (let a = 0; a <= 4 + 1e-9; a += 0.1) for (let b = -1; b <= 2 + 1e-9; b += 0.1) {
  const V = M.target(gna0 * 10 ** a, gk0 * 10 ** b);
  ok(V > M.HH.EK && V < M.HH.ENa, 'V between E_K and E_Na');
}
ok(M.target(gna0 * 1000, gk0) > 40, 'Na⁺ ×1000 pulls V near E_Na'); ok(M.target(gna0, gk0 * 100) < -75, 'K⁺ ×100 pulls V near E_K');
both('s0e', '−77'); both('s0e', '+50');

// ---- step 1: threshold and all-or-none ----
const thr1 = M.threshold1();
near(thr1, 6.92, 0.005, 'threshold for a 1-ms pulse'); both('s1hint', '6.92'); both('formula', '6.92'); both('s3lgSingle', '6.92');
near(M.threshold1(0.005), thr1, 0.01, 'threshold converged in dt');
const lift = I => M.peak(M.single(I)).V - R.V;
near(lift(4) / lift(2), 2, 0.1, 'local potential roughly proportional'); near(lift(6) / lift(2), 3, 0.3, 'local potential roughly proportional (6 vs 2)');
ok(M.peak(M.single(6.5)).V < M.SPIKE_MV && M.peak(M.single(7)).V > 30, '6.5 below, 7 above +30 mV (s1hint)');
let lo = Infinity, hi = -Infinity;
for (let I = 0; I <= 30 + 1e-9; I += 0.5) { const pk = M.peak(M.single(I)).V; if (I > thr1) { lo = Math.min(lo, pk); hi = Math.max(hi, pk); ok(pk > 30, 'every suprathreshold peak above +30 mV'); } else ok(pk < -55, 'subthreshold stays local'); }
ok(hi - lo < 7, 'suprathreshold peaks within a narrow band (' + lo.toFixed(1) + '..' + hi.toFixed(1) + ')');

// ---- step 2: the handoff ----
const r2 = M.simulate(M.pulse(10, 1, 1), 15, 0.01, 5);
const argmax = arr => arr.indexOf(Math.max(...arr));
near(r2.t[argmax(r2.gNa)], 3.6, 0.1, 'g_Na peaks ≈ 3.6 ms'); near(r2.t[argmax(r2.gK)], 5.1, 0.1, 'g_K peaks ≈ 5.1 ms');
for (const l of ['zh', 'en']) ok(STRINGS[l].s2hint.includes('3.6') && STRINGS[l].s2hint.includes('5.1') && STRINGS[l].s2hint.includes('+40') && STRINGS[l].s2hint.includes('−76'), 's2hint numbers');
{ const tg = r2.t.map((_, k) => M.target(r2.gNa[k], r2.gK[k])); near(Math.max(...tg), 40, 1.5, 'target peaks near +40'); near(Math.min(...tg), -76, 1, 'target bottoms near −76'); }
ok(Math.min(...r2.V) < R.V - 10, 'undershoot below rest');
// V always moves toward the target when no stimulus is applied: dV/dt has the sign of (target − V)
for (let k = 1; k < r2.t.length - 1; k++) {
  if (r2.t[k] >= 0.9 && r2.t[k] <= 2.1) continue;
  const dV = r2.V[k + 1] - r2.V[k - 1], gap = M.target(r2.gNa[k], r2.gK[k]) - r2.V[k];
  if (Math.abs(gap) > 0.05) ok(Math.sign(dV) === Math.sign(gap), 'V chases the target at t=' + r2.t[k].toFixed(2));
}
// inactivation: h falls during the spike and recovers slowly
ok(Math.min(...r2.h) < 0.1 && r2.h[r2.h.length - 1] > 0.5, 'h dips then recovers');
near(M.peak(r2).V, 39, 0.5, 'single 10-µA spike ≈ +39 mV (s4rate)'); both('s4rate', '+39');

// ---- step 3: refractoriness ----
const abs = M.absRefractory();
near(abs, 6.4, 0.2, 'absolute refractory ≈ 6.4 ms');
ok(M.threshold2(6) === Infinity && M.threshold2(7) < 120, 'Δt 6 impossible, 7 possible below 120 (s3hint)');
ok(M.fires2(10, 40) && !M.fires2(9, 40), 'at 40 µA/cm² the cutoff is between 9 and 10 ms (s3hint)');
{ const g = []; for (let d = 7; d <= 25; d++) g.push({ d, thr: M.threshold2(d) });
  for (let i = 1; i < g.length && g[i].d <= 19; i++) ok(g[i].thr < g[i - 1].thr, 'threshold falls with the gap');
  const rel = g.find(q => q.thr <= 1.1 * thr1), mn = g.reduce((m, q) => (q.thr < m.thr ? q : m), g[0]);
  ok(rel && rel.d >= 14 && rel.d <= 18, 'relative period ends ≈ 16 ms (' + (rel && rel.d) + ')');
  ok(mn.thr < thr1, 'supernormal dip below the single-pulse threshold (' + mn.d + ' ms, ' + mn.thr.toFixed(2) + ')');
  for (const q of g) ok(q.thr <= 120 || q.d < 8, 'curve inside the 0–125 axis after 8 ms'); }
// the threshold curve and the yes/no decision agree
for (const [d, I] of [[8, 70], [8, 60], [12, 20], [12, 16], [20, 8], [20, 5]]) ok(M.fires2(d, I) === (I >= M.threshold2(d)), `fires2 consistent with threshold at ${d} ms, ${I}`);

// ---- step 4: firing rate ----
const rate = I => M.train(I).rate;
ok(rate(6) === 0 && rate(5) === 0, 'no repetitive firing at 5–6');
near(rate(6.5), 55, 0.5, '6.5 → 55 Hz'); near(rate(40), 108.6, 0.5, '40 → ≈109 Hz'); near(rate(10), 68.4, 0.5, '10 → ≈68 Hz (quiz)');
for (const l of ['zh', 'en']) ok(STRINGS[l].s4hint.includes('55') && STRINGS[l].s4hint.includes('109') && STRINGS[l].s4hint.includes('6.5'), 's4hint numbers');
let prev = 0, prevTop = Infinity;
for (let I = 7; I <= 40; I += 1) {
  const tr = M.train(I); ok(tr.rate >= prev - 1e-9, 'rate never falls with current (I=' + I + ')'); prev = tr.rate;
  const top = Math.max(...tr.peaksWin); ok(top < 39, 'steady spikes no taller than a single spike'); ok(top <= prevTop + 1, 'spike tops do not rise with current'); prevTop = top;
  const isi = tr.ts.slice(1).map((t, i) => t - tr.ts[i]); ok(Math.min(...isi) > abs, 'no interval shorter than the absolute refractory period');
}
ok(M.train(80).rate === 0 && M.train(80).ts.length === 1, '80 µA/cm²: one spike at switch-on, then silence (s4e)'); both('s4e', '80');

// ---- step 5: conduction ----
const speeds = {};
for (let d = 0.1; d <= 1.0001; d += 0.1) { const k = Math.round(d * 10) / 10; speeds[k] = M.propagate(k).speed; ok(speeds[k] > 0, 'spike reaches both timing points'); }
for (const k of Object.keys(speeds)) near(speeds[k] / speeds[0.5], Math.sqrt(k / 0.5), 0.01 * Math.sqrt(k / 0.5), 'speed ∝ √d at d=' + k);
near(speeds[1] / speeds[0.2], Math.sqrt(5), 0.03, 'factor-5 diameter'); ok(Math.abs(speeds[0.4] / speeds[0.1] - 2) < 0.02, '×4 diameter → ×2 speed');
// numerical convergence
near(M.propagate(0.5, { dx: 0.0125 }).speed, speeds[0.5], 0.02 * speeds[0.5], 'dx halved'); near(M.propagate(0.5, { dt: 0.005 }).speed, speeds[0.5], 0.02 * speeds[0.5], 'dt halved');
ok(Object.values(speeds).every(v => v < 20), 'speeds fit the 0–20 axis');
{ const p = M.propagate(0.5); ok(p.tB < M.CABLE.T && p.snaps.length >= 119, 'arrives within the 12 ms window'); ok(Math.max(...p.snaps.at(-1).V) < 60, 'profile inside the axis'); }
{ const p = M.propagate(0.1); ok(p.tB < 12, 'slowest fibre still reaches 4 cm within 12 ms'); }
// the spike keeps its height as it travels (regenerates, does not fade)
{ const p = M.propagate(0.5), at = x => Math.max(...p.snaps.map(s => s.V[Math.round(x / p.dx)])); ok(Math.abs(at(2) - at(4)) < 2, 'peak at 2 cm ≈ peak at 4 cm'); }
ok(STRINGS.zh.s5e.includes('0.25 mm') && STRINGS.en.s5e.includes('0.25 mm') && M.CABLE.dx === 0.025, 'section length stated');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(k === 'foot' || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(STRINGS[l][k]), 'no left/right figure references in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['phRest', 'phStim', 'phRise', 'phFall', 'phUnder', 'phRecover']) ok(app.includes(`'${k}'`), 'phase key used ' + k);
for (const id of ['na0', 'k0', 'i1', 't2', 'play2', 'g3', 'i3', 'i4', 'checkQuiz', 'd5', 't5', 'play5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/body/action-potential/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS action-potential core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · threshold ${thr1.toFixed(3)} µA/cm² · abs. refractory ${abs.toFixed(2)} ms · v(0.5 mm) ${speeds[0.5].toFixed(2)} m/s`);
