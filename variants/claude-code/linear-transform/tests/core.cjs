'use strict';
// 2D linear maps (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
const both = (key, ...subs) => ['zh', 'en'].forEach(l => subs.forEach(s => ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`)));
let seed = 3; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 * 4 - 2; };
const randM = () => M.M(rnd(), rnd(), rnd(), rnd());

// ---- step 0/1: columns are the images of e₁, e₂; Ap = x·Ae₁ + y·Ae₂ ----
for (let i = 0; i < 300; i++) {
  const A = randM(), x = rnd() * 1.5, y = rnd() * 1.5;
  const e1 = M.apply(A, [1, 0]), e2 = M.apply(A, [0, 1]), Ap = M.apply(A, [x, y]);
  near(e1[0], A.a, 0, 'Ae₁ = (a, c)'); near(e1[1], A.c, 0, 'Ae₁ y'); near(e2[0], A.b, 0, 'Ae₂ = (b, d)'); near(e2[1], A.d, 0, 'Ae₂ y');
  near(Ap[0], x * e1[0] + y * e2[0], 1e-12, 'Ap = x·Ae₁ + y·Ae₂ (x)'); near(Ap[1], x * e1[1] + y * e2[1], 1e-12, 'Ap (y)');
  // grid point (i, j) goes to i·Ae₁ + j·Ae₂ (s0e): integer lattice maps onto the lattice of the columns
  const g = M.apply(A, [2, 1]); near(g[0], 2 * A.a + A.b, 1e-12, 'grid (2,1)'); near(g[1], 2 * A.c + A.d, 1e-12, 'grid (2,1) y');
  // lerp used by the morph: endpoints are I and A
  ok(M.same(M.lerp(M.I, A, 0), M.I) && M.same(M.lerp(M.I, A, 1), A), 'morph endpoints');
}
near(M.det(M.DEFAULT), 1.75, 1e-12, 'default det');
// presets: what their buttons say (slider rounding to 0.01 keeps them within 0.01)
const P = M.PRESETS;
ok(M.same(P.identity, M.I), 'identity'); near(M.det(P.flatten), 0, 1e-12, 'flatten has det 0'); near(M.det(P.mirror), -1, 0, 'mirror flips');
ok(P.shear.a === 1 && P.shear.c === 0, 'shear keeps e₁'); near(M.det(P.rotate), 1, 1e-12, 'rotation keeps area');
{ const r = v => Math.round(v * 100) / 100, R = M.M(r(P.rotate.a), r(P.rotate.b), r(P.rotate.c), r(P.rotate.d)); near(M.det(R), 1, 0.01, 'rounded 45° preset ≈ rotation'); }
for (const l of ['zh', 'en']) ok(STRINGS[l].s0hint.length > 0, 'hint');

// ---- step 2: linearity rules ----
const { u, v } = M.S2;
for (const lam of [-2, -1.5, -1, -0.5, 0, 0.25, 0.5, 1, 1.5, 2]) {
  const L = M.linearityGaps(M.MAPS.linear, u, v, lam);
  near(L.sum, 0, 1e-12, 'linear: additive'); near(L.scale, 0, 1e-12, 'linear: homogeneous'); near(L.origin, 0, 0, 'linear: origin');
  const S = M.linearityGaps(M.MAPS.shifted, u, v, lam);
  near(S.sum, Math.hypot(...M.S2.shift), 1e-12, 'shift: rule-1 gap = shift length (s2hint)');
  ok(S.origin > 0.9, 'shift moves the origin');
  near(S.scale, Math.abs(1 - lam) * Math.hypot(...M.S2.shift), 1e-12, 'shift: rule 2 only at λ = 1');
  const N = M.linearityGaps(M.MAPS.bent, u, v, lam);
  near(N.origin, 0, 0, 'bent keeps the origin'); ok(N.sum > 0.3, 'bent: rule 1 fails visibly');
  ok((N.scale < 1e-12) === (lam === 0 || lam === 1), 'bent: rule 2 holds only at λ = 0, 1');
}
// the pink gap grows as λ moves away from 0 and 1 (s2hint)
{ const g = l => M.linearityGaps(M.MAPS.bent, u, v, l).scale; ok(g(2) > g(1.5) && g(1.5) > g(1.25) && g(-2) > g(-1) && g(-1) > g(-0.5), 'bent: gap grows away from 0 and 1'); }
both('s2hint', 'λ = 1'); ok(STRINGS.zh.vShift.includes('仿射') && STRINGS.en.vShift.includes('affine'), 'shift is called affine');

// ---- step 3: determinant = signed area factor ----
for (let th = 0; th <= 360; th += 5) {
  const A = M.step3Matrix(th), D = M.det(A);
  near(D, 1.68 * Math.sin((th - 30) * Math.PI / 180), 1e-12, 'det = 1.68·sin(θ − 30°) (s3hint)');
  near(M.area(M.UNIT_SQUARE.map(p => M.apply(A, p))), D, 1e-12, 'unit square image = det');
  near(M.area(M.F_SHAPE.map(p => M.apply(A, p))), 0.81 * D, 1e-12, 'F area × det');
  if (th > 30 && th < 210) ok(D > 0, 'positive between 30° and 210°');
  if (th > 210 || th < 30) ok(D < 0, 'negative outside');
  if (th === 30 || th === 210) near(D, 0, 1e-12, 'zero at 30°, 210°');
  // orientation: det sign = sign of the turn from Ae₁ to Ae₂
  const e1 = M.apply(A, [1, 0]), e2 = M.apply(A, [0, 1]); near(e1[0] * e2[1] - e1[1] * e2[0], D, 1e-12, 'cross product = det');
}
near(M.area(M.F_SHAPE), 0.81, 1e-12, 'F area 0.81, counter-clockwise'); near(M.area(M.UNIT_SQUARE), 1, 0, 'unit square');
near(M.det(M.step3Matrix(120)), 1.68, 1e-12, 'max |det| = 1.4 × 1.2 when perpendicular');
both('s3hint', '30°', '210°', '1.68'); both('s3e', '1.4', '30°', '1.2');
// random matrices: every polygon's area scales by det (s3e "every shape")
for (let i = 0; i < 100; i++) { const A = randM(); near(M.area(M.F_SHAPE.map(p => M.apply(A, p))), 0.81 * M.det(A), 1e-9, 'F area random'); }

// ---- step 4: inverse ----
for (let i = 0; i <= 30; i++) {
  const s = i / 10, A = M.step4Matrix(s), D = M.det(A), inv = M.inverse(A);
  near(D, 1 - 0.5 * s, 1e-12, 'det = 1 − 0.5s');
  if (i === 20) { ok(inv === null, 'no inverse at s = 2'); const n = M.nullDir(A), q = M.apply(A, n); near(Math.hypot(...q), 0, 1e-12, 'null direction squashed'); continue; }
  ok(inv !== null, 'inverse exists s=' + s);
  const Ap = M.apply(A, M.S4.p), back = M.apply(inv, Ap);
  near(back[0], M.S4.p[0], 1e-9, 'A⁻¹ sends Ap back'); near(back[1], M.S4.p[1], 1e-9, 'A⁻¹ sends Ap back (y)');
  ok(M.same(M.mul(inv, A), M.I, 1e-9) && M.same(M.mul(A, inv), M.I, 1e-9), 'A⁻¹A = AA⁻¹ = I');
  // farthest point of the sent-back error circle = 0.2 / smallest stretch (sampled check)
  let far = 0; for (let k = 0; k < 3600; k++) { const a = 2 * Math.PI * k / 3600, q = M.apply(inv, [0.2 * Math.cos(a), 0.2 * Math.sin(a)]); far = Math.max(far, Math.hypot(...q)); }
  near(far, 0.2 / M.stretches(A).min, 1e-5 * far, 'error magnification = 1/σmin');
  const st = M.stretches(A); near(st.max * st.min, Math.abs(D), 1e-9, 'σmax·σmin = |det|');
}
// the magnification grows as det → 0 from either side (s4hint)
{ const g = s => 1 / M.stretches(M.step4Matrix(s)).min; ok(g(0) < g(1) && g(1) < g(1.5) && g(1.5) < g(1.9) && g(3) < g(2.1), 'magnification grows near s = 2'); }
ok(M.det(M.step4Matrix(2.5)) < 0 && M.inverse(M.step4Matrix(2.5)) !== null, 'past 2: det < 0 but invertible');
both('s4e', '1 − 0.5s', 's = 2'); both('s4readout', '0.2');

// ---- step 5: order ----
for (let th = -180; th <= 180; th += 15) for (let k = 0; k <= 1.5; k += 0.25) {
  const R = M.rot(th), S = M.shearX(k), SR = M.mul(S, R), RS = M.mul(R, S);
  // composition = doing the right-hand one first
  const p = [0.7, -0.4]; const a = M.apply(SR, p), b = M.apply(S, M.apply(R, p)); near(a[0], b[0], 1e-12, 'S·R = R first'); near(a[1], b[1], 1e-12, 'S·R y');
  near(M.det(SR), M.det(RS), 1e-12, 'same det either order'); near(M.det(SR), 1, 1e-12, 'det S × det R = 1');
  const commute = M.same(SR, RS, 1e-9), expect = k === 0 || th === 0 || Math.abs(th) === 180;
  ok(commute === expect, `commute exactly when k = 0 or θ ∈ {0, ±180}: θ=${th} k=${k}`);
}
for (let i = 0; i < 50; i++) { const A = randM(), B = randM(); near(M.det(M.mul(A, B)), M.det(A) * M.det(B), 1e-9, 'det(AB) = det A det B'); }
for (const a of [30, 75, -120]) for (const b of [45, -60]) ok(M.same(M.mul(M.rot(a), M.rot(b)), M.rot(a + b), 1e-12), 'rotations add angles');
both('s5hint', 'θ = 90°', 'k = 1', '180°');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s1readout', 's2lgSum', 's2lgSum2']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['mapL', 'mapT', 'mapN', 'vLinear', 'vShift', 'vBent', 'oPos', 'oNeg', 'oZero', 'sSame', 'sDiff']) ok(STRINGS.zh[k] !== undefined, 'indirect key ' + k);
for (const p of Object.keys(M.PRESETS)) ok(html.includes(`data-preset="${p}"`), 'preset button ' + p);
for (const id of ['a0', 'b0', 'c0s', 'd0', 'morph0', 'x1', 'y1', 'mapL', 'mapT', 'mapN', 'lam2', 'th3', 'sweep3', 's4', 'th5', 'k5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const val of Object.values(STRINGS[l])) for (const m of val.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/linear-algebra/linear-transform/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS linear-transform core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
