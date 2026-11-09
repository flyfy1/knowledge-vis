'use strict';
// Momentum & collisions (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6); return out; };
const both = (frag, msg) => { for (const l of ['zh', 'en']) ok(Object.values(STRINGS[l]).some(s => s.includes(frag)), `${msg} (${l}: "${frag}")`); };

// ---- step 0: stopping time = p / F, whatever m and v are ----
const B = M.braking(M.REF.m, M.REF.v);
near(B.p, 3, 1e-12, 'reference cart B has p = 3');
both('2 kg', 'B mass quoted'); both('1.5 m/s', 'B speed quoted'); both('3 kg·m/s', 'B momentum quoted');
let maxT = 0, maxD = 0;
for (const m of range(0.5, 4, 0.5)) for (const v of range(0.5, 4, 0.5)) {
  const r = M.braking(m, v);
  near(r.tStop, r.p / M.BRAKE_F, 1e-12, 't = p / F');
  near(r.vel(r.tStop), 0, 1e-9, 'speed reaches 0 at tStop');
  near(r.pos(r.tStop), r.dist, 1e-9, 'distance consistent');
  near(r.pos(r.tStop + 5), r.dist, 1e-9, 'stays stopped');
  // trail marks get closer together as it slows (strictly decreasing gaps)
  for (let k = 1; (k + 1) * 0.5 <= r.tStop; k++) ok(r.pos((k + 1) * 0.5) - r.pos(k * 0.5) < r.pos(k * 0.5) - r.pos((k - 1) * 0.5), 'gaps shrink');
  maxT = Math.max(maxT, r.tStop); maxD = Math.max(maxD, r.dist);
}
ok(maxT <= 8.6 && maxD <= 17, `axes hold every case: t ≤ ${maxT}, d ≤ ${maxD}`);
// "1 kg at 3 m/s stops with B" but slides a different distance; the middle plot has same-speed dots at different heights
{ const A = M.braking(1, 3); near(A.tStop, B.tStop, 1e-12, 'same p, same time'); ok(Math.abs(A.dist - B.dist) > 0.5, 'same p, different distance'); }
ok(M.braking(1, 2).tStop !== M.braking(3, 2).tStop, 'same speed, different stopping time');
ok(STRINGS.zh.s0hint.includes('1 kg、3 m/s') && STRINGS.en.s0hint.includes('1 kg at 3 m/s'), 'example quoted');

// ---- step 1: impulse = change in momentum, independent of mass ----
both('0.5 m/s', 'start speed quoted'); both('t = 0.5 s', 'push start quoted');
ok(M.PUSH.v0 === 0.5 && M.PUSH.t0 === 0.5, 'push constants match text');
for (const m of range(1, 4, 0.5)) for (const F of range(0, 6, 0.5)) for (const dt of range(0.1, 2, 0.1)) {
  const r = M.push(m, F, dt);
  near(r.p1 - r.p0, F * dt, 1e-9, 'Δp = F·Δt'); near(r.J, F * dt, 1e-12, 'J');
  near(r.p(M.PUSH.T), r.p1, 1e-9, 'push over before the window ends');
  near(r.v1 - r.v0, r.J / m, 1e-9, 'Δv = J / m');
  ok(r.p1 <= 15 && r.t1 <= M.PUSH.T - 0.5 + 1e-9, 'fits the p–t axis');
}
near(M.push(2, 4, 0.5).p1, M.push(2, 1, 2).p1, 1e-12, '4 N × 0.5 s = 1 N × 2 s'); near(M.push(2, 4, 0.5).J, 2, 1e-12, 'both 2 N·s');
near(M.push(1, 3, 1).p1 - M.push(1, 3, 1).p0, M.push(4, 3, 1).p1 - M.push(4, 3, 1).p0, 1e-12, 'Δp independent of m');

// ---- step 2: same Δp, longer time, smaller average force ----
near(M.EGG.m, 0.06, 0, 'egg mass'); both('0.06 kg', 'egg mass quoted'); both('25 N', 'limit quoted');
ok(M.EGG.limit === 25, 'limit 25 N');
const w = M.cushion(5, 0.1).weight; ok(w > 0.585 && w < 0.595, 'weight ≈ 0.59 N'); both('0.59 N', 'weight quoted');
for (const v of range(2, 8, 0.5)) for (const dt of range(0.005, 0.1, 0.0025)) {
  const r = M.cushion(v, dt);
  near(r.F * r.dt, r.dp, 1e-12, 'area = Δp'); ok(r.F <= 100, 'F inside 0–100 N axis');
  ok(r.safe === (dt >= r.dtMin - 1e-12), 'safe ⇔ Δt ≥ Δt_min');
  ok(r.weight < 0.05 * r.F || r.F < 12, 'weight negligible next to the impact force when it matters');
}
// slider default (5 m/s, 0.005 s) breaks; the slider's top end is safe for every speed
ok(!M.cushion(5, 0.005).safe && M.cushion(8, 0.1).safe, 'default breaks; 0.1 s is safe');
near(M.cushion(5, 0.1).F * 10, M.cushion(5, 0.01).F, 1e-9, 'quiz feedback: 10× time → one tenth the force');

// ---- steps 3–4: collisions ----
const Ms = range(0.5, 4, 0.5), VA = range(0.5, 4, 0.5), VB = range(-2, 2, 0.5), Es = range(0, 1, 0.1);
let hits = 0;
for (const mA of Ms) for (const mB of Ms) for (const vA of VA) for (const vB of VB) {
  for (const e of Es) {
    const r = M.collide(mA, mB, vA, vB, e);
    near(r.pAfter, r.pBefore, 1e-9, 'momentum conserved');
    if (!r.hit) { ok(vB >= vA, 'no hit only if B is not slower'); near(r.vA2, vA, 0, 'no change'); continue; }
    if (e === 0) hits++;
    near(r.pA - r.pA2, r.pB2 - r.pB, 1e-9, 'A loses what B gains'); ok(r.pA - r.pA2 > 0, 'A loses momentum');
    near(r.sep, e * r.u, 1e-9, 'separation = e × approach');
    near(r.keLost, M.keLossFormula(mA, mB, vA, vB, e), 1e-9, 'KE loss closed form');
    ok(r.keFrac <= 1 + 1e-12 && r.keFrac >= -1e-12, 'KE fraction in [0, 1]');
    if (e === 1) near(r.keAfter, r.keBefore, 1e-9, 'elastic keeps KE');
    if (e === 0) { near(r.vA2, r.vB2, 1e-12, 'sticky: common speed'); near(r.vA2, r.vCommon, 1e-12, 'common speed = p / M'); }
  }
  // KE fraction rises with e (bottom plot of step 4)
  const fr = Es.map(e => M.collide(mA, mB, vA, vB, e).keFrac);
  if (vA > vB) for (let i = 1; i < fr.length; i++) ok(fr[i] > fr[i - 1] - 1e-12, 'KE kept grows with e');
  // timeline: total momentum flat at every instant, carts touch at tc, never pass through each other
  for (const e of [0, 1]) {
    const T = M.timeline(mA, mB, vA, vB, e), c = M.CONTACT;
    for (let tt = 0; tt <= c.T + 1e-9; tt += 0.01) near(T.pAt(tt) + T.pBt(tt), T.pBefore, 1e-9, 'total flat in time');
    if (T.hit) {
      near(T.xB(c.tc) - T.xA(c.tc), c.D, 1e-9, 'touch at tc');
      for (let tt = 0; tt <= c.T + 1e-9; tt += 0.005) ok(T.xB(tt) - T.xA(tt) >= c.D - T.u * c.tau / 2 - 1e-9, 'squeeze at most u·τ/2');
      near(T.xA(c.tc + c.tau + 0.5) - T.xA(c.tc + c.tau), T.vA2 * 0.5, 1e-9, 'moves at vA2 after contact');
      ok(T.xA(0) > -1 && T.xB(0) < 14 + 1, 'start on (or just at the edge of) the 0–14 m track');
    } else for (let tt = 0; tt <= c.T + 1e-9; tt += 0.05) ok(T.xB(tt) - T.xA(tt) >= c.D, 'no-hit carts stay apart');
  }
}
ok(hits > 0, 'collisions happen');
// readout example in the defaults: A 2 kg at 3 m/s, B 1 kg at rest, sticky → both 2 m/s, A 6 → 4, B 0 → 2
{ const r = M.collide(2, 1, 3, 0, 0); near(r.vA2, 2, 1e-12, 'default sticky speed'); near(r.pA2, 4, 1e-12, 'A after'); near(r.pB2, 2, 1e-12, 'B after'); near(r.keFrac, 2 / 3, 1e-12, 'KE kept 2/3'); }
// total can be zero (head-on, equal and opposite) — the step-3 hint says "maybe even zero"
near(M.collide(1, 1, 2, -2, 0.5).pBefore, 0, 0, 'zero total possible'); both('0.08 s', 'contact time quoted'); ok(M.CONTACT.tau === 0.08, 'contact 0.08 s');

// ---- step 5: recoil from rest ----
for (const m1 of range(30, 80, 5)) for (const m2 of range(30, 80, 5)) for (const J of range(20, 120, 10)) {
  const r = M.recoil(m1, m2, J);
  near(r.total, 0, 1e-12, 'total stays 0'); near(r.speedRatio, m1 / m2, 1e-12, 'speed ratio = mass ratio');
  ok(r.v1 < 0 && r.v2 > 0, '1 left, 2 right'); ok(r.d1 + 0.7 <= M.ICE.X && r.d2 + 0.7 <= M.ICE.X, 'stays on the rink'); ok(Math.abs(r.p1) <= 120, 'arrow scale');
}
{ const r = M.recoil(80, 40, 60); ok(Math.abs(r.v1) < r.v2, 'heavier is slower'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula', 's0lgLine']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(s0Afirst|s0Bfirst|s0same|s0sameDiffDist|s2safe|s2break|modeStickShort|modeBounceShort|correct|wrong|pick)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['m0', 'v0', 'brake0', 'clear0', 'f1', 'd1', 'm1', 'clear1', 'v2', 't2', 'checkQuiz', 'ma3', 'mb3', 'va3', 'vb3', 'modeStick', 'modeBounce', 'play3', 'e4', 'm15', 'm25', 'j5', 'push5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');
ok(!html.includes('canvas-label-guard'), 'no label guard');
{ const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique'); }

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/mechanics/momentum-collision/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS momentum-collision core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
