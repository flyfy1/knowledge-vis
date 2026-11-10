'use strict';
// Ohm's law (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const range = (a, b, d) => { const out = []; for (let v = a; v <= b + 1e-9; v += d) out.push(Math.round(v * 1e6) / 1e6); return out; };

// ---- step 0: n cells × 1.5 V across 10 Ω ----
ok(M.CELL === 1.5 && M.R0 === 10 && M.NMAX === 6, 'step 0 constants');
for (let n = 1; n <= 6; n++) {
  const r = M.cells(n);
  near(r.U, 1.5 * n, 1e-12, 'cells add up'); near(r.I, 0.15 * n, 1e-12, 'I = U/10'); near(r.ratio, 10, 1e-12, 'U ÷ I = 10 Ω for every point');
  if (n <= 3) near(M.cells(2 * n).I, 2 * r.I, 1e-12, 'double U → double I');
  ok(r.I <= 1 && r.U <= 9.6, 'fits the I–U axes');
}
ok(M.cells(0).I === 0 && isNaN(M.cells(0).ratio), '0 cells: no current, ratio undefined');

// ---- step 1: I = U/R over the slider grid; quiz ----
for (const U of range(1.5, 9, 1.5)) for (let R = 2; R <= 30; R++) {
  const r = M.ohm(U, R);
  near(r.I, U / R, 1e-12, 'I = U/R'); near(r.IR, U, 1e-12, 'I × R = U');
  near(M.ohm(U, 2 * R).I, r.I / 2, 1e-12, 'double R → half I');
  ok(r.I <= U / 2 * 1.08 + 1e-12, 'fits the per-U axis');
}
const qa = M.quizAnswer(); near(qa.R, 20, 1e-12, 'quiz R = 20 Ω'); near(qa.I2, 0.3, 1e-12, 'quiz I = 0.3 A');
const quizKeys = { a: STRINGS.zh.quizA, b: STRINGS.zh.quizB, c: STRINGS.zh.quizC };
ok(quizKeys.a.includes('0.3 A') && quizKeys.a.includes('20 Ω'), 'option a is the right answer');
ok(fs.readFileSync(path.join(dir, 'app.js'), 'utf8').includes("choice.value === 'a'"), 'app checks option a');
ok([1.5, 3, 4.5, 6, 7.5, 9].includes(6) && 20 <= 30, 'quiz check values reachable on the sliders');

// ---- step 2: R = 1.0 Ω · L / S (nichrome), copper 0.017 Ω ----
for (const L of range(0.2, 2, 0.1)) for (const S of range(0.2, 1, 0.1)) {
  const R = M.wire(L, S);
  near(R, L / S, 1e-12, 'R = 1.0 Ω × L ÷ S');
  ok(R >= 0.2 - 1e-12 && R <= 10 + 1e-12, 'R inside 0.2–10 Ω (fits the 10.5 axis)');
  if (L <= 1) near(M.wire(2 * L, S), 2 * R, 1e-12, 'double L → double R');
  if (S <= 0.5) near(M.wire(L, 2 * S), R / 2, 1e-12, 'double S → half R');
  near(M.wire(L, S, 'copper') / R, 0.017, 1e-12, 'copper is 0.017 of nichrome');
}
near(M.wire(1, 1), 1.0, 1e-12, 'table value 1 m, 1 mm² = 1.0 Ω');
assert.equal((M.WIRE.nichrome / M.WIRE.copper).toFixed(0), '59'); checks++;

// ---- step 3: voltmeter–ammeter method ----
ok(M.METER.dU === 0.1 && M.METER.dI === 0.02 && M.METER.Umax === 3 && M.METER.Imax === 0.6, 'meter ranges and divisions');
ok(M.MYSTERY.every(R => Math.abs(R - M.METER.dU / M.METER.dI) > 1e-9), 'no hidden R equals dU/dI (where rounding errors cancel exactly)');
for (const R of M.MYSTERY) {
  let worstLow = 0, worstHigh = 0; const high = [];
  for (const U of range(0.5, 3, 0.05)) {
    const r = M.reading(U, R);
    ok(r.I <= 0.6 + 1e-12 && r.U <= 3 + 1e-12, 'readings stay inside the meter ranges');
    ok(r.I > 0, 'current reading never rounds to 0 on the knob range');
    near(r.U, Math.round(U / 0.1 + 1e-9) * 0.1, 1e-9, 'voltmeter to 0.1 V'); near(r.I, Math.round(U / R / 0.02 + 1e-9) * 0.02, 1e-9, 'ammeter to 0.02 A');
    ok(Math.abs(r.U - U) <= 0.05 + 1e-9 && Math.abs(r.I - U / R) <= 0.01 + 1e-9, 'reading within half a division');
    const e = Math.abs(M.relErr(r.U / r.I, R));
    if (U <= 0.7 + 1e-9) worstLow = Math.max(worstLow, e);
    if (U >= 2 - 1e-9) { worstHigh = Math.max(worstHigh, e); high.push(r); }
  }
  // s3hint: near 0.5 V a single pair is badly off; at 2–3 V every single pair is better; fitting them together is better still
  ok(worstLow > 0.15, `R=${R}: a low-voltage single reading can be off by >15% (${worstLow})`);
  ok(worstHigh < worstLow / 2, `R=${R}: every 2–3 V reading beats the worst low one`);
  const fitErr = Math.abs(M.relErr(M.fitR(high), R));
  ok(fitErr < worstHigh, `R=${R}: fit over 2–3 V beats the worst single 2–3 V reading (${fitErr} < ${worstHigh})`);
  // the fit with exact readings recovers R; the fit is a least-squares line through the origin
  near(M.fitR([{ U: 1, I: 1 / R }, { U: 2, I: 2 / R }]), R, 1e-12, 'exact data → exact R');
}
// least squares through the origin: no other slope gives a smaller squared error
{
  const pts = [{ U: 0.5, I: 0.06 }, { U: 1.2, I: 0.16 }, { U: 2.9, I: 0.36 }], R = M.fitR(pts);
  const sse = k => pts.reduce((s, p) => s + (p.I - k * p.U) ** 2, 0);
  ok(sse(1 / R) <= sse(1 / R + 1e-3) && sse(1 / R) <= sse(1 / R - 1e-3), 'fitR is the least-squares slope');
}

// ---- step 4: the 2.5 V 0.3 A bulb ----
near(M.BULB.Rhot, 8.3333, 1e-4, 'hot resistance 8.33 Ω'); near(M.BULB.c, 4.2222, 1e-4, 'c ≈ 4.22 per W');
near(M.bulb(2.5).I, 0.3, 1e-12, 'rated point 2.5 V → 0.3 A'); near(M.bulb(2.5).R, 8.3333, 1e-4, 'rated R');
let prevR = M.BULB.Rcold, prevI = 0;
for (const U of range(0.05, 3, 0.05)) {
  const b = M.bulb(U);
  near(b.U, b.I * M.BULB.Rcold * (1 + M.BULB.c * b.P), 1e-12, 'filament equation holds');
  ok(b.R > prevR && b.I > prevI, 'R and I both rise with U');
  ok((U < 2.5 - 1e-9) === (b.I > U / M.BULB.Rhot + 1e-12), 'bulb above the 8.33 Ω line below 2.5 V, below it above 2.5 V');
  ok(b.I <= 0.4 && b.R <= 10.5, 'fits the axes');
  prevR = b.R; prevI = b.I;
}
near(M.bulb(1e-6).R, 2, 1e-4, 'R → 2 Ω as U → 0'); ok(M.bulb(0).I === 0 && M.bulb(0).R === 2, 'U = 0 readout');
near(M.bulb(3).R, 9.8, 0.05, 'about 9.8 Ω at 3 V (s4hint)');
ok(M.bulb(3).P <= 0.93 && fs.readFileSync(path.join(dir, 'app.js'), 'utf8').includes('b.P / 0.93'), 'glow scale 0.93 W covers the slider range');

// ---- step 5: heat in parallel and in series ----
for (let R2 = 2; R2 <= 40; R2++) {
  const p = M.heat('parallel', R2), s = M.heat('series', R2);
  near(p.P1, 3.6, 1e-12, 'parallel P1 = 36/10'); near(p.P2, 36 / R2, 1e-12, 'parallel P2 = U²/R2');
  near(p.I, p.I1 + p.I2, 1e-12, 'currents add in parallel');
  near(s.U1 + s.U2, 6, 1e-12, 'voltages add in series'); near(s.P2, s.I * s.I * R2, 1e-12, 'series P2 = I²R2'); near(s.P1 + s.P2, 6 * s.I, 1e-12, 'series power = U·I');
  ok((R2 < 10) === (p.P2 > p.P1) && (R2 < 10) === (s.P2 < s.P1), 'parallel: smaller R hotter; series: larger R hotter');
  ok(p.P2 <= 19 && p.P1 <= 19 && s.P1 <= 2.6 && s.P2 <= 2.6, 'fits the per-mode axes');
  ok(Math.sqrt(p.P2 / 18) <= 1 + 1e-12 && Math.sqrt(s.P1 / 2.5) <= 1 + 1e-12, 'glow scale covers the range');
  ok(s.P2 <= M.heat('series', 10).P2 + 1e-12, 'series P2 peaks at R2 = 10');
}
near(M.heat('series', 10).P2, 0.9, 1e-12, 'series peak 0.9 W'); near(M.heat('series', 10).P1, M.heat('series', 10).P2, 1e-12, 'R2 = R1 equally hot');

// ---- strings ----
const zh = STRINGS.zh, en = STRINGS.en;
assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort()); checks++;
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
for (const k of Object.keys(zh)) {
  assert.equal(ph(zh[k]), ph(en[k]), 'placeholders for ' + k); checks++;
  ok(zh[k].trim() && en[k].trim(), 'non-empty ' + k);
  ok(!/左图|右图|左边的图|右边的图/.test(zh[k]) && !/(left|right) (panel|graph|plot)|on the (left|right)\b/i.test(en[k]), 'no left/right panel wording ' + k);
}
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="(\w+)"/g)) ok(m[1] in zh, 'html key exists: ' + m[1]);
for (const m of app.matchAll(/\bt\('(\w+)'/g)) ok(m[1] in zh, 'app key exists: ' + m[1]);
// deep links and the compare link point at real pages and anchors
const root = path.resolve(dir, '../../..');
const links = [...html.matchAll(/href="\.\.\/\.\.\/\.\.\/([^"#]+)(#step\d)?"/g), ...Object.values(zh).join(' ').matchAll(/href="\.\.\/\.\.\/\.\.\/([^"#]+)(#step\d)?"/g)];
for (const m of links) {
  const f = path.join(root, m[1], m[1].endsWith('/') ? 'index.html' : '');
  ok(fs.existsSync(f), 'link target exists: ' + m[1]);
  if (m[2]) ok(fs.readFileSync(f, 'utf8').includes(`id="${m[2].slice(1)}"`), 'anchor exists: ' + m[1] + m[2]);
}
ok(zh.foot.includes('claude-opus-5-5') && en.foot.includes('claude-opus-5-5'), 'footer names the model');
ok(zh.compare.includes('欧姆定律 · 电流是调出来的') && en.compare.includes('Ohm’s Law · Current You Tune by Hand'), 'compare link names the original');

console.log(`ohms-law core: ${checks} checks passed`);
