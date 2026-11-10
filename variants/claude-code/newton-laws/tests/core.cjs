'use strict';
// Newton's laws (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const range = (a, b, d) => { const out = []; for (let v = a; v <= b + 1e-9; v += d) out.push(Math.round(v * 1e6) / 1e6); return out; };
const G = 9.8;

// ---- step 0: puck on ice, v0 = 4 m/s, 12 m strip, strobe every 0.25 s ----
ok(M.G === G && M.S0.v0 === 4 && M.S0.track === 12 && M.S0.dt === 0.25, 'step 0 constants match the text');
for (const mu of range(0.02, 0.4, 0.02)) {
  const g = M.glide(mu);
  near(g.a, mu * G, 1e-12, 'deceleration μg');
  near(g.dStop, 16 / (2 * mu * G), 1e-9, 'stopping distance v0²/(2μg)');
  near(g.tStop, 4 / (mu * G), 1e-9, 'stopping time v0/(μg)');
  near(M.glidePos(mu, g.tStop + 5), g.dStop, 1e-9, 'puck stays where it stopped');
  // halving μ doubles the distance (s0hint)
  near(M.glide(mu / 2).dStop, 2 * g.dStop, 1e-9, 'μ halves → distance doubles');
  const S = M.glideStrobe(mu);
  ok(S.stops === (g.dStop <= 12), 'stops on the strip iff dStop ≤ 12');
  if (!S.stops) {
    const tx = M.glideExit(mu);
    near(M.glidePos(mu, tx), 12, 1e-9, 'exit time hits the 12 m line');
    ok(4 - g.a * tx > 0, 'still moving when it leaves the strip');
  }
  S.pts.forEach((q, k) => { near(q.t, k * 0.25, 1e-12, 'strobe every 0.25 s'); ok(q.x <= 12 + 1e-9, 'strobe stays on the strip'); });
}
// μ = 0 (s0readoutZero): no deceleration, 12 m in 3 s, never stops
ok(M.glide(0).a === 0 && M.glide(0).dStop === Infinity, 'μ = 0 never stops');
near(M.glideExit(0), 3, 1e-12, 'μ = 0: 12 m in 3 s');
// default μ = 0.2 readout: 1.96 m/s per s, 2.04 s, 4.08 m
near(M.glide(0.2).a, 1.96, 1e-9, 'μ = 0.2 deceleration'); near(M.glide(0.2).tStop, 2.0408, 1e-4, 'μ = 0.2 time'); near(M.glide(0.2).dStop, 4.0816, 1e-4, 'μ = 0.2 distance');
// the slider's smallest non-zero μ still lands inside or is flagged off the 0–14 m plot (cap marker)
ok(M.glide(0.02).dStop > 14 && M.glide(0.06).dStop > 12 && M.glide(0.08).dStop < 12, 'strip boundary sits between μ = 0.06 and 0.08');

// ---- step 1: m = 2 kg, pull 0–8 N, strobe 0.5 s × 4 ----
ok(M.S1.m === 2 && M.S1.dt === 0.5 && M.S1.n === 4, 'step 1 constants (2 kg, 0.5 s, 2 s)');
const pts1 = [];
for (const F of range(0, 8, 0.5)) {
  const a = F / M.S1.m, x = M.strobe(a, 0.5, 4), gp = M.gaps(x);
  for (let k = 1; k < gp.length; k++) near(gp[k] - gp[k - 1], a * 0.25, 1e-12, 'each gap longer by a·dt²');
  near(M.aFromStrobe(x, 0.5), a, 1e-12, 'a read back from the strobe = F/m');
  ok(x[4] <= 9 + 1e-9, 'cart stays on the 9 m track in 2 s');
  ok(a <= 4.5, 'a fits the 0–4.5 axis');
  pts1.push([F, M.aFromStrobe(x, 0.5)]);
}
near(M.slopeThroughOrigin(pts1.filter(p => p[0] > 0)), 0.5, 1e-12, 'fit slope = 1/m = 0.5');
// default F = 2 N readout: gaps 0.125/0.375/0.625/0.875, +0.25 each, a = 1
assert.deepEqual(M.gaps(M.strobe(1, 0.5, 4)), [0.125, 0.375, 0.625, 0.875]); checks++;
// doubling F doubles a
near(M.aFromStrobe(M.strobe(8 / 2, 0.5, 4), 0.5), 2 * M.aFromStrobe(M.strobe(4 / 2, 0.5, 4), 0.5), 1e-12, 'F doubles → a doubles');

// ---- step 2: F = 6 N, m 0.5–4 kg, strobe 0.25 s × 4 ----
ok(M.S2.F === 6 && M.S2.dt === 0.25 && M.S2.n === 4, 'step 2 constants (6 N, 0.25 s, 1 s)');
for (const m of range(0.5, 4, 0.25)) {
  const x = M.strobe(6 / m, 0.25, 4), a = M.aFromStrobe(x, 0.25);
  near(m * a, 6, 1e-9, 'm × a = 6 N');
  near(6 / (2 * m), a / 2, 1e-12, 'doubling m halves a');
  ok(x[4] <= 7 + 1e-9 && a <= 13, 'fits the 7 m track and 13 m/s² axis');
  ok(1 / m <= 2.1, '1/m fits the 0–2.1 axis');
}

// ---- step 3: 5 kg crate, μs = 0.5, μk = 0.4 ----
const c0 = M.crate(0);
near(c0.N, 49, 1e-9, 'weight 49 N'); near(c0.fsMax, 24.5, 1e-9, 'static ceiling 24.5 N'); near(c0.fk, 19.6, 1e-9, 'kinetic 19.6 N');
for (const F of range(0, 40, 0.5)) {
  const r = M.crate(F);
  if (F <= 24.5) { ok(!r.moving && r.f === F && r.a === 0, 'static: friction matches the push, a = 0'); }
  else { ok(r.moving, 'slides above 24.5 N'); near(r.f, 19.6, 1e-9, 'kinetic friction'); near(r.net, F - 19.6, 1e-9, 'net = F − f'); near(r.a, (F - 19.6) / 5, 1e-12, 'a = net/m'); }
  ok(r.a <= 4.5 && 0.5 * r.a * 4 <= 9, 'fits the a axis and the 9 m floor');
  ok(r.f <= 30, 'friction fits the 0–30 axis');
}
near(M.crate(24.5 + 1e-9).a, 0.98, 1e-6, 'just past 24.5 N, a jumps to about 1 m/s² (s3hint)'); near(M.crate(25).a, 1.08, 1e-9, 'first sliding notch ≈ 1 m/s²');

// ---- step 4: cart + hanging mass ----
for (const m1 of range(0.5, 3, 0.1)) for (const m2 of range(0.05, 2, 0.05)) {
  const h = M.hanger(m1, m2);
  near(h.a, m2 * G / (m1 + m2), 1e-12, 'a = m2 g/(m1+m2)');
  ok(h.a < G, 'a stays below g (quiz)');
  near(h.T, m1 * h.a, 1e-12, 'T = m1 a'); ok(h.T < h.W2, 'tension below the hanging weight');
  near(h.netHanger, m2 * h.a, 1e-9, 'net on the weight = m2 a');
  near((m1 + m2) * h.a, h.W2, 1e-9, 'whole system: (m1+m2) a = m2 g');
  ok(h.a <= 10.5, 'fits the a axis');
}
near(M.hanger(0.5, 2).a, 7.84, 1e-9, 'quiz example ≈ 7.8 m/s²');
const h0 = M.hanger(1, 0.2); near(h0.a, 1.6333, 1e-4, 'default a'); near(h0.ratio * 100, 83.33, 0.01, 'default T/W = 83.3 %');

// ---- step 5: spring 400 N/m squeezed 0.1 m ----
ok(M.S5.k === 400 && M.S5.c0 === 0.1 && M.S5.tMax === 0.3, 'step 5 constants');
for (const m1 of range(0.5, 3, 0.25)) for (const m2 of range(0.5, 3, 0.25)) {
  const s = M.springApart(m1, m2);
  ok(s.tRel > 0.01 && s.tRel < 0.1 && s.tRel < M.S5.tMax, 'push lasts a few hundredths of a second, inside the 0.3 s plot');
  for (let i = 0; i <= 60; i++) { const q = s.at(i * 0.005); near(q.F1, -q.F2, 1e-12, 'equal and opposite at every instant'); near(m1 * q.v1 + m2 * q.v2, 0, 1e-9, 'momentum stays 0'); }
  near(s.p1 + s.p2, 0, 1e-12, 'total momentum 0');
  near(Math.abs(s.v1 / s.v2), m2 / m1, 1e-12, 'speed ratio = m2/m1');
  near(M.impulse(m1, m2), s.p2, 2e-3 * Math.abs(s.p2), 'impulse ∫F dt = momentum gained');
  near(s.Fpeak, 40, 1e-12, 'peak force 40 N');
  ok(Math.abs(s.v1) <= 3.2 && Math.abs(s.v2) <= 3.2, 'velocities fit the ±3.2 axis');
  ok(Math.abs(s.at(0.3).x1) <= 1.2 && Math.abs(s.at(0.3).x2) <= 1.2, 'carts stay on the ±1.2 m track');
  near(0.5 * m1 * s.v1 ** 2 + 0.5 * m2 * s.v2 ** 2, 0.5 * 400 * 0.01, 1e-9, 'spring energy 2 J ends up as kinetic energy');
}

// ---- strings: same keys, same placeholders, no left/right panel wording ----
const zh = STRINGS.zh, en = STRINGS.en;
assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort()); checks++;
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
for (const k of Object.keys(zh)) { assert.equal(ph(zh[k]), ph(en[k]), 'placeholders for ' + k); checks++; ok(zh[k].trim() && en[k].trim(), 'non-empty ' + k); }
for (const k of Object.keys(zh)) { ok(!/左图|右图|左边看|右边看/.test(zh[k]), 'no left/right panel wording (zh) ' + k); ok(!/(left|right) panel|on the (left|right)\b/i.test(en[k]), 'no left/right panel wording (en) ' + k); }
ok(zh.foot.includes('claude-opus-5-5') && en.foot.includes('claude-opus-5-5'), 'footer names the model');
ok(zh.compare.includes('牛顿运动定律 · F = ma 是调出来的') && en.compare.includes('Newton’s Laws of Motion · F = ma, Tuned by Hand'), 'compare link names the original');

console.log(`newton-laws core: ${checks} checks passed`);
