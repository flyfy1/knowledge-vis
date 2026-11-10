'use strict';
// Complex numbers (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const zNear = (z, w, tol, msg) => ok(M.near(z, w, tol), `${msg}: (${z.re}, ${z.im}) vs (${w.re}, ${w.im})`);
const cx = M.cx;
let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 * 8 - 4; };

// ---- basic definitions ----
zNear(M.mul(M.I, M.I), cx(-1, 0), 0, 'i² = −1 exactly');
near(M.arg(cx(-3, 0)), 180, 0, 'negative real axis is +180°, not −180°'); ok(M.arg(cx(0, 0)) === null, 'origin has no argument');
for (let a = -720; a <= 720; a += 5) { const v = M.normDeg(a); ok(v > -180 && v <= 180, 'principal range'); near(((v - a) % 360 + 360) % 360 % 360, 0, 1e-9, 'same direction'); }
near(M.normDeg(170 + 170), -20, 1e-12, '170° + 170° shows as −20°');

// ---- step 0: two turns of φ ----
for (let phi = 0; phi <= 360; phi++) {
  const { first, second } = M.turnTwice(phi);
  near(M.mod(first), 1, 1e-12, 'turning keeps length'); zNear(second, M.fromPolar(1, 2 * phi), 1e-12, 'two turns = 2φ');
  const hit = M.near(second, cx(-1, 0), 1e-9);
  ok(hit === M.halfTurnRoots().includes(phi), 'lands on −1 exactly at φ = 90°, 270° (phi=' + phi + ')');
}
zNear(M.turnTwice(90).first, cx(0, 1), 1e-12, 'the quarter turn lands on i (off the number line)');
for (let k = -4; k <= 4; k += 0.25) ok(k * k >= 0, 'k·k ≥ 0 for real k');

// ---- step 1: components, modulus, argument ----
near(M.mod(cx(3, 4)), 5, 0, '|3 + 4i| = 5 exactly'); near(M.arg(cx(-2, 0)), 180, 0, 'arg −2 = 180°'); near(M.arg(cx(0, 2)), 90, 1e-12, 'arg 2i = 90°');
near(M.mod(M.fromPolar(1, 40)), 1, 1e-12, 'unit-circle preset modulus 1'); near(M.arg(M.fromPolar(1, 40)), 40, 1e-9, 'unit-circle preset at 40°');
for (let a = -4; a <= 4; a += 0.5) for (let b = -4; b <= 4; b += 0.5) {
  const z = cx(a, b); near(M.mod(z), Math.sqrt(a * a + b * b), 1e-12, 'Pythagoras');
  if (a || b) zNear(M.fromPolar(M.mod(z), M.arg(z)), z, 1e-9, 'polar ↔ components');
}

// ---- step 2: addition adds components = shift ----
for (let i = 0; i < 300; i++) {
  const z = cx(rnd(), rnd()), w = cx(rnd(), rnd()), s = M.add(z, w);
  near(s.re, z.re + w.re, 0, 'real parts add'); near(s.im, z.im + w.im, 0, 'imaginary parts add');
  M.SHAPE_F.forEach(p => { const q = M.add(p, w); near(q.re - p.re, w.re, 1e-12, 'every point moves by w'); near(q.im - p.im, w.im, 1e-12, 'every point moves by w'); });
}
zNear(M.add(cx(2, 1), cx(-1, 1.5)), cx(1, 2.5), 0, 'step 2 default sum');

// ---- step 3: ×i is a quarter turn ----
zNear(M.timesI(cx(3, 2)), cx(-2, 3), 0, '(3 + 2i)·i = −2 + 3i exactly');
const ipow = M.orbit(cx(1, 0), 8);
[cx(1, 0), cx(0, 1), cx(-1, 0), cx(0, -1), cx(1, 0)].forEach((v, k) => zNear(ipow[k], v, 0, 'i^' + k + ' exact'));
for (let k = 0; k <= 4; k++) zNear(ipow[k + 4], ipow[k], 0, 'period 4');
for (let a = -3; a <= 3; a += 0.5) for (let b = -3; b <= 3; b += 0.5) {
  const z = cx(a, b), o = M.orbit(z, 4);
  zNear(o[1], cx(-b, a), 0, '(a, b) → (−b, a)'); near(M.mod(o[1]), M.mod(z), 1e-12, 'length unchanged'); near(z.re * o[1].re + z.im * o[1].im, 0, 1e-12, 'perpendicular');
  zNear(o[2], cx(-a, -b), 0, 'two presses = ×(−1)'); zNear(o[4], z, 0, 'four presses = back');
  if (a || b) near(M.normDeg(M.arg(o[1]) - M.arg(z)), 90, 1e-9, 'argument +90°');
}

// ---- step 4: two roads to the product ----
for (let i = 0; i < 2000; i++) {
  const z = cx(rnd(), rnd()), w = cx(rnd() / 2, rnd() / 2), p = M.mul(z, w);
  zNear(M.mulPolar(z, w), p, 1e-9, 'algebra = moduli multiply, angles add');
  near(M.mod(p), M.mod(z) * M.mod(w), 1e-9, '|zw| = |z||w|');
  near(M.normDeg(M.arg(p) - M.arg(z) - M.arg(w)), 0, 1e-7, 'arg(zw) = arg z + arg w (mod 360)');
}
for (let r = 0; r <= 2 + 1e-9; r += 0.05) for (let f = -180; f <= 180; f += 5) for (let a = -2.5; a <= 2.5; a += 0.5) for (let b = -2.5; b <= 2.5; b += 0.5) {
  const w = M.fromPolar(r, f), z = cx(a, b), p = M.mul(z, w);
  if (r < 1e-12 || (!a && !b)) { near(M.mod(p), 0, 1e-12, 'zero product at the origin'); continue; }
  zNear(M.mulPolar(z, w), p, 1e-9, 'slider grid: both roads agree');
}
// presets: 2 only stretches, i only turns, 1 + i turns 45° and stretches by √2
near(M.arg(cx(2, 0)), 0, 0, 'w = 2 does not turn'); near(M.mod(cx(0, 1)), 1, 0, 'w = i does not stretch');
near(M.arg(cx(1, 1)), 45, 1e-12, '1 + i turns 45°'); near(M.mod(cx(1, 1)), Math.SQRT2, 1e-15, '1 + i stretches by √2'); near(Math.SQRT2, 1.414, 5e-4, '√2 ≈ 1.414');
// shape is preserved: pairwise distances scale by |w|
{ const w = M.fromPolar(1.5, 60), S = M.SHAPE_F, T = M.mapShape(S, w); for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) near(M.mod(M.add(T[i], M.scale(T[j], -1))), 1.5 * M.mod(M.add(S[i], M.scale(S[j], -1))), 1e-9, 'similar shape'); }

// ---- step 5: powers ----
for (let r = 0.8; r <= 1.15 + 1e-9; r += 0.05) for (let f = -180; f <= 180; f += 15) for (let n = 1; n <= 24; n++) {
  const w = M.fromPolar(r, f), p = M.powers(w, n);
  near(M.mod(p[n]), Math.pow(r, n), 1e-9 * Math.max(1, Math.pow(r, n)), '|wⁿ| = rⁿ');
  if (M.mod(p[n]) > 1e-9) near(M.normDeg(M.arg(p[n]) - n * f), 0, 1e-6, 'arg wⁿ = nφ');
}
{ const p = M.powers(cx(0, 1), 4); [cx(1, 0), cx(0, 1), cx(-1, 0), cx(0, -1), cx(1, 0)].forEach((v, k) => zNear(p[k], v, 0, 'preset i: 1, i, −1, −i, 1')); }
{ const p = M.powers(M.fromPolar(1, 72), 5); zNear(p[5], cx(1, 0), 1e-9, 'preset 72°×5 returns to 1'); for (let k = 0; k < 5; k++) near(M.mod(M.add(p[k + 1], M.scale(p[k], -1))), M.mod(M.add(p[1], M.scale(p[0], -1))), 1e-9, 'regular pentagon'); }
ok(M.mod(M.powers(M.fromPolar(0.9, 30), 24)[24]) < 0.1 && M.mod(M.powers(M.fromPolar(1.1, 30), 12)[12]) > 3, 'spiral presets go in / out');

// ---- step 6 quiz ----
zNear(M.QUIZ.q1, cx(-3, -2), 0, 'q1'); near(M.QUIZ.q2[0], 5, 0, 'q2 a'); near(M.QUIZ.q2[1], 5, 0, 'q2 b'); zNear(M.QUIZ.q3, cx(0, 2), 0, 'q3');
ok(M.quizKey('q1') === 'b' && M.quizKey('q2') === 'b' && M.quizKey('q3') === 'b', 'quiz keys from the model');
zNear(M.timesI(cx(3, 4)), cx(-4, 3), 0, 'q2 feedback: −4 + 3i = i·(3 + 4i)');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['q1a', 'q1b', 'q1c', 'q3a', 'q3b', 'q3c', 's2lgZ', 's2lgSum', 's4lgW', 's4lgZ', 's4lgZW', 's5lgW', 'timesI']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['phi0', 'a1', 'b1', 'pr34', 'prNeg', 'prImag', 'prUnit', 'prO', 'za2', 'zb2', 'wa2', 'wb2', 'za3', 'zb3', 'times3', 'reset3', 'r4', 'f4', 'za4', 'zb4', 'w2', 'wi', 'w1i', 'wm1', 'r5', 'f5', 'n5', 'play5', 'q4i', 'q5', 'qin', 'qout', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]); ok(ids.length === new Set(ids).size, 'element ids are unique');
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/complex-numbers/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS complex-numbers core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
