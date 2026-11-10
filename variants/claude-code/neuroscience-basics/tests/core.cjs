'use strict';
// Nerve signals (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const fmt = (v, d) => { let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
// A number quoted in the copy must appear in both languages.
const says = (keys, text, msg) => { for (const l of ['zh', 'en']) { const all = [].concat(keys).map(k => STRINGS[l][k]).join(' '); ok(all.includes(text), `${l} ${[].concat(keys)} should say "${text}" (${msg})`); } };

// ---- formatting rule: trailing zeros are trimmed only after a decimal point ----
ok(fmt(90, 0) === '90' && fmt(2.50, 2) === '2.5' && fmt(100, 1) === '100', 'fmt keeps integer zeros');

// ---- step 0: Nernst ----
near(M.SLOPE10, 61.54, 0.01, '61.5 mV per decade at 37 °C'); says('s0e', '61.5 mV', 'slope');
const EK = M.nernst(5, 140), ENa = M.nernst(145, 12);
near(EK, -89.06, 0.01, 'E_K'); near(ENa, 66.60, 0.01, 'E_Na');
says('s1e', '−89.1 mV', 'E_K'); says('s1e', '+66.6 mV', 'E_Na'); says('s0hint', '+66.6 mV', 'E_Na default');
for (let o = 1; o <= 200; o += 7) for (let i = 1; i <= 200; i += 11) {
  near(M.nernst(o, i) - M.nernst(o * 10, i), -M.SLOPE10, 1e-9, 'tenfold = one slope');
  ok(Math.sign(M.nernst(o, i)) === Math.sign(Math.log(o / i)), 'sign follows the ratio');
}
near(M.nernst(50, 50), 0, 1e-12, 'ratio 1 → 0 mV');
assert.deepEqual(M.ION, { K: { in: 140, out: 5, z: 1 }, Na: { in: 12, out: 145, z: 1 } }); checks++;
for (const l of ['zh', 'en']) ok(STRINGS[l].s0e.includes('140') && STRINGS[l].s0e.includes('5 mM'), 'K concentrations quoted');

// ---- step 1: GHK resting potential ----
const V0 = M.ghk(M.P_REST);
near(V0, -68.57, 0.01, 'resting potential'); says('s1e', '−68.6 mV', 'V_rest'); says('s1hint', '−68.6 mV', 'V_rest');
says('s1e', '0.04', 'p'); ok(M.P_REST === 0.04, 'P_REST');
// slider default −1.4 rounds to p = 0.04 exactly (2 significant digits), so the readout matches the text
ok(Number(Math.pow(10, -1.4).toPrecision(2)) === 0.04, 'slider default = 0.04');
near(M.ghk(0.04, 10), -58.40, 0.01, 'K out 10 mM'); says('s1hint', '−58.4 mV', 'hyperkalemia');
// V always between E_K and E_Na and rises with p; p → 0 approaches E_K; p = 1 is close to 0
for (let lp = -3; lp <= 0.0001; lp += 0.05) for (let ko = 2; ko <= 20; ko += 0.5) {
  const p = Math.pow(10, lp), V = M.ghk(p, ko), ek = M.nernst(ko, 140);
  ok(V > ek && V < ENa, 'V between E_K and E_Na');
  ok(M.ghk(p * 1.05, ko) > V, 'V rises with p');
  ok(M.ghk(p, ko + 0.5) > V, 'V rises with outside K⁺');
}
ok(Math.abs(M.ghk(1)) < 1, 'p = 1 → V ≈ 0'); ok(M.ghk(0.001) - EK < 1, 'p = 0.001 → V within 1 mV of E_K');
// pct is closer to E_K than to E_Na at rest
ok((V0 - EK) / (ENa - EK) < 0.2, 'rest sits in the lowest fifth');

// ---- HH model sanity ----
near(M.REST[0], -65, 0.01, 'HH rest ≈ −65 mV'); says('s2e', '−65 mV', 'HH rest');
// dt convergence: the threshold at dt = 0.005 matches dt = 0.01 within 0.2 %
const thrFine = (() => { let lo = 0, hi = 40; while (hi - lo > 1e-4) { const mid = (lo + hi) / 2; const r = M.simulate(M.pulses([{ t0: M.T0, dur: 1, amp: mid }]), 30, { dt: 0.005 }); if (r.spikes.length) hi = mid; else lo = mid; } return hi; })();
near(thrFine / M.THRESHOLD, 1, 0.002, 'threshold converged in dt');
// the rate sweep uses dt = 0.02: same rate as dt = 0.01 within 0.5 %
for (const I of [10, 40, 90]) near(M.rate(I).hz / M.rate(I, { dt: 0.01 }).hz, 1, 0.005, 'rate converged in dt at ' + I);

// ---- step 2: threshold stimulus and summation ----
near(M.THRESHOLD, 6.919, 0.001, 'threshold stimulus'); says(['s2e', 's3hint', 's3lgThr'], '6.92 µA/cm²', 'threshold');
ok(M.single(0.999 * M.THRESHOLD).spikes.length === 0 && M.single(1.001 * M.THRESHOLD).spikes.length === 1, 'threshold is sharp');
// sub-threshold responses are graded: peak rises with the input
let prev = -Infinity; for (let f = 0.1; f < 0.95; f += 0.1) { const p = M.peakOf(f * M.THRESHOLD); ok(p > prev && p < M.SPIKE_LEVEL, 'graded'); prev = p; }
const mg07 = M.maxGap(0.7);
near(mg07, 2.04, 0.01, 'critical gap at 0.70'); says('s2hint', '2.04 ms', 'critical gap');
for (let f = 0.3; f < 0.4999; f += 0.05) ok(M.maxGap(f) === -1, 'below 0.5 never fires ' + f);
ok(M.maxGap(0.5) >= 0, '0.5 + 0.5 just fires when simultaneous'); says('s2hint', '0.5', 'never below 0.5');
// on the slider grid (0.3..0.9 × 0..8 ms) the firing set is exactly gap ≤ maxGap — no islands (contiguous)
let lastEdge = -1;
for (let f = 0.3; f <= 0.9001; f += 0.05) {
  const edge = M.maxGap(f);
  ok(edge >= lastEdge, 'critical gap grows with strength'); lastEdge = edge;
  for (let g = 0; g <= 30; g += 0.25) ok((M.pair(f, g).spikes.length > 0) === (edge >= 0 && g <= edge + 1e-9), `contiguous f=${f.toFixed(2)} g=${g}`);
}

// ---- step 3: all-or-none ----
const p105 = M.peakOf(1.05 * M.THRESHOLD), p2 = M.peakOf(2 * M.THRESHOLD), p3 = M.peakOf(3 * M.THRESHOLD);
says('s3hint', fmt(p105, 1) + ' mV', '1.05× peak'); says('s3hint', fmt(p3, 1) + ' mV', '3× peak');
ok(fmt(p105, 1) === '36.5' && fmt(p3, 1) === '40.6', 'quoted peaks');
near(p3 - p2, 0.6, 0.05, '2× → 3× changes ~0.6 mV'); says('correct', '0.6 mV', 'quiz');
// the slider grid: every value above 1.01 × threshold peaks between 30 and 42 mV; every value below 0.99 × stays under −50 mV
for (let k = 0; k <= 200; k++) {
  const a = k / 10, f = a / M.THRESHOLD, pk = M.peakOf(a);
  if (f > 1.01) ok(pk > 30 && pk < 42, 'all-or-none above threshold ' + a);
  if (f < 0.99) ok(pk < -50, 'graded below threshold ' + a);
}
// near threshold the spike is late and lower (±1 %)
const late = M.single(1.002 * M.THRESHOLD), norm = M.single(1.5 * M.THRESHOLD);
ok(late.spikes[0] - norm.spikes[0] > 1 && late.peak < norm.peak, 'near-threshold delay');
// quiz hint "drag from 14 to 20 (about 2 to 3 times threshold)"
near(14 / M.THRESHOLD, 2, 0.03, '14 ≈ 2×'); near(20 / M.THRESHOLD, 2.9, 0.03, '20 ≈ 3×');

// ---- step 4: refractory period ----
const absRef = M.absoluteRefractory(), relRef = M.relativeRefractory();
near(absRef, 7.2, 0.01, 'absolute refractory'); says(['s4hint', 's5hint', 's5lgRef'], '7.2 ms', 'absRef');
near(relRef, 15.8, 0.05, 'relative refractory end'); says('s4hint', '15.8 ms', 'relRef');
near(M.secondThreshold(10), 3.76, 0.005, 'need at 10 ms'); says('s4hint', '3.76', 'need at 10 ms');
ok(!M.paired(absRef - 0.05, M.CAP).fires && M.paired(absRef + 0.05, M.CAP).fires, 'abs edge at 10×');
// supernormal dip on the slider grid
let best = { g: 0, need: Infinity };
for (let g = 2; g <= 25.0001; g += 0.5) { const n = M.secondThreshold(g); if (n < best.need) best = { g, need: n }; }
ok(best.g === 19 || best.g === 19.5, 'dip near 19 ms'); ok(fmt(best.need, 2) === '0.84', 'dip value'); says('s4hint', '0.84', 'dip');
// required strength falls as h recovers (monotone between abs edge and 18 ms)
let lastNeed = Infinity, lastH = 0;
for (let g = 7.5; g <= 18; g += 0.5) {
  const n = M.secondThreshold(g), r = M.paired(g, 1).run, i = r.t.findIndex(s => s >= M.T0 + g);
  ok(n < lastNeed, 'need falls ' + g); if (g <= 15) ok(r.h[i] > lastH, 'h recovers ' + g); lastNeed = n; lastH = r.h[i];
}
// the conditioning stimulus fires exactly one spike alone
ok(M.single(M.COND * M.THRESHOLD, 40).spikes.length === 1, 'conditioning spike');

// ---- step 5: rate ceiling (slider grid 0..200 step 1) ----
const fi = []; for (let I = 0; I <= 200; I++) fi.push(M.rate(I));
ok(fi[6].hz === 0 && fi[7].hz > 0, 'rheobase between 6 and 7'); ok(fmt(fi[7].hz, 0) === '58', 'starts at 58/s'); says('s5hint', '58', 'first rate');
let maxI = 0; fi.forEach((r, I) => { if (r.hz > fi[maxI].hz) maxI = I; });
ok(maxI === 99 && fmt(fi[99].hz, 0) === '147', 'max 147/s at 99'); says('s5hint', '147', 'max rate'); says('s5hint', '99 µA/cm²', 'max at');
ok(fmt(fi[99].isi, 1) === '6.8', 'shortest interval 6.8 ms'); says('s5hint', '6.8 ms', 'shortest interval');
near(fi[99].isi / absRef, 1, 0.07, 'shortest interval comparable to absolute refractory period');
for (let I = 7; I <= 99; I++) ok(fi[I].hz > fi[I - 1].hz || I === 7, 'rate rises ' + I);
for (let I = 100; I <= 200; I++) ok(fi[I].hz === 0, 'no spikes past 100 ' + I);
// spikes shrink as the current grows
ok(fi[10].hi > fi[50].hi && fi[50].hi > fi[99].hi && fi[99].hi < -15, 'spikes shrink');
// oscillation dies out (< 1 mV swing) first at 160 on the grid, and stays out
let settle = -1; for (let I = 100; I <= 200; I++) if (fi[I].swing < 1) { settle = I; break; }
ok(settle === 160, 'oscillation dies at 160: ' + settle); says('s5hint', '160 µA/cm²', 'block');
for (let I = settle; I <= 200; I++) ok(fi[I].swing < 1, 'stays blocked ' + I);
ok(fi[6].swing < 1 && fi[6].early >= 1, 'below rheobase: onset spikes then quiet');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['foot', 's1lgENa']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes('神经科学基础 · 从静息到脉冲'), 'footer names the model and the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
// strings with markup are only rendered through data-i18n-html
const htmlKeys = new Set([...html.matchAll(/data-i18n-html="([^"]+)"/g)].map(m => m[1]));
for (const k of zk) if (/<[a-z]/.test(STRINGS.zh[k] + STRINGS.en[k])) ok(htmlKeys.has(k), 'markup key rendered as HTML: ' + k);
for (const id of ['o0', 'i0', 'ionK', 'ionNa', 'p1', 'k1', 'reset1', 'f2', 'g2', 'a3', 'sweep3', 'clear3', 'checkQuiz', 'g4', 'm4', 'clear4', 'i5', 'sweep5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#[\w-]+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#[\w-]+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/body/neuroscience-basics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS neuroscience-basics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · threshold ${M.THRESHOLD.toFixed(3)} µA/cm² · abs refractory ${absRef.toFixed(2)} ms`);
