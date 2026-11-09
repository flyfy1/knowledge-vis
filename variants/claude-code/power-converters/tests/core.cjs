'use strict';
// Buck/boost (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
const rel = (a, b) => Math.abs(a / b - 1);
const grid = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v / s) * s); return out; };
const P = M.P;

// ---- step 0: linear vs ideal switching ----
for (const vo of grid(1, 11, 0.5)) for (const io of grid(0.2, 3, 0.1)) {
  const l = M.linear(12, vo, io), s = M.ideal(12, vo, io);
  near(l.pin, l.pout + l.heat, 1e-12, 'linear: in = out + heat'); near(l.eff, vo / 12, 1e-12, 'linear efficiency = Vout/Vin');
  near(s.pin, s.pout, 1e-12, 'ideal: in = out'); ok(s.iin < io, 'switching draws less current than the load when stepping down');
  ok(l.pin <= 36 + 1e-9, 'bars scaled to 12 V × 3 A');
}

// ---- step 1: inductor pulses ----
near(M.pulseStep(6), 6 * 10e-6 / 47e-6, 1e-15, 'Δi = VΔt/L'); near(M.pulseStep(0), 0, 0, '0 V → no change');
near(M.pulseStep(-6), -M.pulseStep(6), 1e-15, 'same slope back down'); near(M.energy(P.L, 2), 0.5 * 47e-6 * 4, 1e-18, '½Li²');
near(M.energy(P.L, -1.5), M.energy(P.L, 1.5), 0, 'energy ignores direction');
ok(P.L === 47e-6 && P.C === 100e-6 && P.f === 100e3 && Math.abs(P.T - 1 / P.f) < 1e-18, 'component values quoted on the page');

// ---- step 2: volt-second balance ----
for (const D of grid(0.1, 0.9, 0.05)) {
  const Vs = Number((D * 12).toFixed(1));
  ok(Math.abs(M.buckDrift(12, D, Vs)) < 0.005, 'snap button lands on zero drift D=' + D);
  ok(M.buckDrift(12, D, Vs - 0.1) > 0.005 && M.buckDrift(12, D, Vs + 0.1) < -0.005, 'one slider notch away is a visible drift');
  for (const Vg of grid(0, 12, 0.1)) ok(Math.sign(Math.round(M.buckDrift(12, D, Vg) * 1e9)) === Math.sign(Math.round((D * 12 - Vg) * 1e9)), 'drift up iff Vg below D·Vin');
  ok(M.buckCCM(D, P.L, P.buck.R), 'default buck stays in CCM for every D');
  const st = M.steady('buck', 12, D, P.buck.R);
  ok(rel(st.v, D * 12) < 0.003, `simulated buck output = D·Vin (D=${D}, ${st.v})`);
  near(st.iMax - st.iMin, M.buckRipple(12, D), 0.01, 'simulated ripple = (Vin − Vout)DT/L');
}

// ---- step 3: start-up ----
let worst = 0;
for (const D of grid(0.2, 0.8, 0.05)) for (let R = 2; R <= 10; R++) {
  const S = M.startup(D, R); worst = Math.max(worst, rel(S.final, S.target));
  ok(S.peak > S.target, 'start-up overshoots (underdamped LC)'); ok(M.buckCCM(D, P.L, R), 'start-up slider range stays in CCM');
}
ok(worst < 0.005, 'after 600 cycles the output is within 0.5% of D·12 V: ' + worst);
for (let R = 2; R < 10; R++) ok(M.filter(R + 1).zeta < M.filter(R).zeta, 'bigger R → less damping');
ok(M.startup(0.5, 10).overshoot > M.startup(0.5, 2).overshoot, 'lighter load rings harder');

// ---- step 4: boost ----
for (const D of grid(0.1, 0.8, 0.05)) {
  const st = M.steady('boost', 5, D, P.boost.R), vo = 5 / (1 - D), io = vo / P.boost.R;
  ok(rel(st.v, vo) < 0.003, `simulated boost = Vin/(1−D) (D=${D}, ${st.v})`);
  ok(st.iMin > 0, 'boost stays in CCM at every D');
  ok(rel(st.i, io / (1 - D)) < 0.01, 'inductor average current = Iout/(1−D)');
  ok(rel(5 * st.i, st.v * st.v / P.boost.R) < 0.01, 'power in = power out (ideal parts)');
  // current to the output flows only while the switch is off
  const toOut = st.seg.reduce((s, p) => s + (p.on ? 0 : p.i), 0) / st.seg.length;
  ok(rel(toOut, st.v / P.boost.R) < 0.01, 'diode current averages to the load current');
}

// ---- step 5: ripple and DCM ----
let dcmWorst = 0;
for (const D of [0.2, 0.35, 0.5, 0.65, 0.8]) for (const L of [2, 5, 10, 20, 30, 47, 70, 100]) for (const R of [2, 6, 15, 30, 60]) {
  const st = M.steady('buck', 12, D, R, L * 1e-6), th = 12 * M.buckM(D, L * 1e-6, R);
  dcmWorst = Math.max(dcmWorst, rel(st.v, th));
  const ccm = M.buckCCM(D, L * 1e-6, R);
  if (!ccm) { ok(th > D * 12, 'DCM output rises above D·Vin'); ok(st.iMin < 1e-9, 'DCM: current sits at 0'); }
  else if (M.Kpar(L * 1e-6, R) > 1.1 * (1 - D)) ok(st.iMin > 0, 'clearly CCM: current never reaches 0');
  near(M.Lcrit(D, R), (1 - D) * R * P.T / 2, 1e-18, 'Lcrit');
  if (Math.abs(L * 1e-6 / M.Lcrit(D, R) - 1) > 1e-9) ok((L * 1e-6 > M.Lcrit(D, R)) === ccm, 'CCM ⇔ L > Lcrit (exact boundary excluded)');
}
ok(dcmWorst < 0.005, 'simulation matches the CCM/DCM formula within 0.5%: ' + dcmWorst);

// ---- step 6: budget ----
const Q = M.QUIZ, b = M.budget(Q.Vin, Q.Vout, Q.Iout, Q.eff), bi = M.budget(Q.Vin, Q.Vout, Q.Iout, 1);
near(b.iin, 12 / 0.9 / 5, 1e-12, 'Iin = 2.67 A'); ok(b.iin.toFixed(2) === '2.67' && b.pin.toFixed(2) === '13.33', 'numbers quoted in s6right');
near(bi.iin, 2.4, 1e-12, 'ideal 2.4 A = 12 ÷ 5 × 1 A'); near(b.loss, b.pin - b.pout, 1e-12, 'loss');
const opts = [Q.Iout * Q.Vin / Q.Vout, Q.Iout, bi.iin, b.iin].map(v => Math.round(v * 100) / 100);
ok(new Set(opts).size === 4, 'four distinct options');
for (const e of grid(70, 100, 1)) { const bb = M.budget(5, 12, 1, e / 100); ok(bb.pout + bb.loss <= 12 / 0.7 + 1e-9, 'bar scale holds η ≥ 70%'); }

// ---- prose quotes the model ----
for (const l of ['zh', 'en']) {
  const S = STRINGS[l];
  ok(S.s1e.includes('47 µH'), 'L quoted'); ok(S.s3e.includes('100 µF') && S.s3e.includes('47 µH'), 'start-up parts quoted');
  ok(S.s4e.includes('24 Ω') && S.s4e.includes('5 V'), 'boost settings quoted'); ok(S.boundary.includes('100 kHz'), 'frequency quoted');
  ok(S.s6hint.includes('2.4'), 'ideal ratio quoted');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['optA']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys, controls, provenance ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) { ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]); ok(!/\{[a-zA-Z0-9]+\}/.test(STRINGS.zh[m[1]]), 'static key without placeholders ' + m[1]); }
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['Vo0', 'Io0', 'V1', 'pulse1', 'reset1', 'D2', 'Vg2', 'ph2', 'snap2', 'play2', 'D3', 'R3', 'play3', 'show3', 'D4', 'ph4', 'play4', 'D5', 'L5', 'R5', 'check6', 'E6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [relp, anchor] = h.split('#'), target = path.join(dir, relp, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/circuits/power-converters/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS power-converters core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · start-up worst ${(worst * 100).toFixed(2)}% · DCM sim vs theory worst ${(dcmWorst * 100).toFixed(2)}%`);
