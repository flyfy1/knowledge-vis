'use strict';
// Parabola (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node variants/claude-code/parabola/tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const grid = (lo, hi, st) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += st) out.push(Math.round(v * 1000) / 1000); return out; };

// ---- step 0: the dots of the default shot ----
const S = M.DEFAULT_SHOT, dots = M.shotDots(S), rises = M.rises(dots);
assert.equal(dots.length, 17); checks++;                                   // t = 0 … 1.6 s (slider max 1.6)
ok(dots[16].y > 0 && M.shotAt(S, 1.7).y < 0, 'the last dot (1.6 s) is the last one above the floor');
near(M.landTime(S), 1.6726, 1e-4, 'lands between 1.6 s and 1.7 s');
near(rises[0], 0.651, 1e-9, 'first climb +0.651 m (s0rule r0)');
for (let i = 1; i < rises.length; i++) near(rises[i - 1] - rises[i], M.G * M.DT * M.DT, 1e-9, 'climb shrinks by g·Δt² = 0.098 m');
assert.equal(M.num(M.G * M.DT * M.DT, 3), '0.098'); checks++;
ok(rises[6] > 0 && rises[7] < 0, 'climb turns negative in the 8th interval (0.7–0.8 s), where the peak is');
const P = M.peak(S);
near(P.t, 5 / 7, 1e-12, 'peak time 5/7 s'); ok(P.t > 0.7 && P.t < 0.8, 'peak falls between two dots');
assert.equal(M.num(P.t), '0.71'); assert.equal(M.num(P.x), '2.86'); assert.equal(M.num(P.y), '4.5'); checks += 3;
// symmetry: dots the same time either side of the peak are at the same height
for (const d of [0.1, 0.3, 0.5]) near(M.shotAt(S, P.t - d).y, M.shotAt(S, P.t + d).y, 1e-12, 'symmetric about the peak');

// ---- the shot written in x: vertex form agrees with the time formula ----
for (const vx of grid(3, 6, 0.1)) for (const vy of grid(5, 9, 0.5)) {
  const s = { vx, vy }, vf = M.shotVertexForm(s);
  for (const x of [0, 1.3, 2.9, 4.4, 6.1]) near(M.f(vf.a, vf.h, vf.k, x), M.heightAtX(s, x), 1e-9, 'vertex form = path');
  near(vf.a, -4.9 / (vx * vx), 1e-12, 'a = −4.9 ÷ vx² (s4e)');
}

// ---- step 1: y = a·x² ----
assert.deepEqual(M.A1_CHOICES, [-2, -1.5, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 1.5, 2]); checks++;
for (const a of M.A1_CHOICES) {
  const r = M.stepRises(a);
  near(r[0], a, 1e-12, 'first climb a'); near(r[1], 3 * a, 1e-12, 'second 3a'); near(r[2], 5 * a, 1e-12, 'third 5a');
  near(r[1] - r[0], 2 * a, 1e-12, 'each climb 2a more'); near(r[0] + r[1] + r[2], 9 * a, 1e-12, 'sum = 9a = y(3)');
}
ok(M.equation(0, 0, 0) === 'y = 0', 'a = 0 collapses to y = 0');

// ---- equation formatting (vertex form; sample set) ----
const expect = {
  '-2|0|0': 'y = −2x²', '1|2|1': 'y = (x − 2)² + 1', '-1|-1|3': 'y = −(x + 1)² + 3', '0.5|-3|-2': 'y = 0.5(x + 3)² − 2',
  '-0.5|2|1': 'y = −0.5(x − 2)² + 1', '2|-1|3': 'y = 2(x + 1)² + 3', '1|0|0': 'y = x²', '-1|0|-2': 'y = −x² − 2', '2|-3|0': 'y = 2(x + 3)²'
};
for (const [k, v] of Object.entries(expect)) { const [a, h, kk] = k.split('|').map(Number); assert.equal(M.equation(a, h, kk), v); checks++; }
for (const a of M.A_CHOICES) for (const [h, k] of [[0, 0], [2, 1], [-1, 3], [-3, -2]]) {
  const e = M.equation(a, h, k);
  ok(!/--|\+ -|− -|\+ −|− −/.test(e) && !e.includes('-'), 'no doubled signs / ASCII minus: ' + e);
}
assert.equal(M.equation(M.QUIZ.q1.a, M.QUIZ.q1.h, M.QUIZ.q1.k), STRINGS.zh.q1A); checks++;   // quiz ① answer A is the drawn graph

// ---- step 2: vertex, axis, mirror pair ----
for (const a of M.A_CHOICES) for (const h of grid(-4, 4, 0.5)) for (const k of grid(-4, 4, 0.5)) {
  near(M.f(a, h, k, h), k, 1e-12, 'vertex (h, k)');
  near(M.f(a, h, k, h - 2), M.f(a, h, k, h + 2), 1e-12, 'mirror pair');
  near(M.f(a, h, k, h + 2), 4 * a + k, 1e-12, 'pair height 4a + k');
  ok(a > 0 ? M.f(a, h, k, h + 0.7) > k : M.f(a, h, k, h + 0.7) < k, 'vertex is lowest (a > 0) / highest (a < 0)');
}

// ---- step 3: crossings ----
const seen = { 0: 0, 1: 0, 2: 0 };
for (const a of M.A_CHOICES) for (const h of grid(-3, 3, 0.5)) for (const k of grid(-4, 4, 0.5)) {
  const c = M.crossings(a, h, k); seen[c.count]++;
  const expected = k === 0 ? 1 : (a > 0) === (k < 0) ? 2 : 0;
  assert.equal(c.count, expected, `count a=${a} h=${h} k=${k}`); checks++;
  c.xs.forEach(x => near(M.f(a, h, k, x), 0, 1e-9, 'crossing is a root'));
  if (c.count === 2) near((c.xs[0] + c.xs[1]) / 2, h, 1e-12, 'roots mirrored about x = h');
  ok((c.count === 1) === (k === 0), 'one crossing ⇔ vertex on the axis');
}
ok(seen[0] && seen[1] && seen[2], 'all three cases reachable on the step-3 sliders');
// the approximate sign is used exactly when the root is not a 2-decimal number
ok(M.exactAt(3) && M.exactAt(-0.5) && !M.exactAt(Math.SQRT2), '≈ only for inexact roots');
const r1 = M.crossings(1, 1, -2).xs; assert.equal(M.num(r1[0]), '−0.41'); assert.equal(M.num(r1[1]), '2.41'); checks += 2;

// ---- step 4: back to the court ----
near(M.HOOP_X, 5.033, 1e-3, 'hoop where the default shot comes down through 3.05 m');
const j0 = M.judgeShot(S); ok(j0.made && j0.falling, 'the step-0 shot scores');
let made = 0, high = 0, low = 0, rising = 0, prev = null;
for (const vx of grid(3, 5, 0.1)) for (const vy of grid(5, 8, 0.1)) {
  const s = { vx, vy }, vf = M.shotVertexForm(s), c = M.crossings(vf.a, vf.h, vf.k), j = M.judgeShot(s);
  assert.equal(c.count, 2); checks++;
  ok(c.xs[0] < 0, 'the other root is behind the shooter');
  near(c.xs[1], vx * M.landTime(s), 1e-9, 'landing root = vx × landing time');
  ok(c.xs[1] <= 10 && vf.k <= 6, 'whole shot fits the plot (x ≤ 10 m, peak ≤ 6 m)');
  if (!j.falling) rising++; else if (j.made) made++; else if (j.miss > 0) high++; else low++;
}
ok(made > 1, 'more than one scoring pair (s4hint)'); ok(high > 0 && low > 0, 'too high and too short both reachable');
// s4hint: more upward speed → vertex higher and further right, lands further; more sideways speed → |a| smaller
for (const vx of [3, 4, 5]) for (const vy of grid(5, 7.9, 0.1)) {
  const A = M.shotVertexForm({ vx, vy }), B = M.shotVertexForm({ vx, vy: vy + 0.1 });
  ok(B.k > A.k && B.h > A.h, 'vertex up and right with vy');
  ok(M.crossings(B.a, B.h, B.k).xs[1] > M.crossings(A.a, A.h, A.k).xs[1], 'lands further with vy');
}
for (const vx of grid(3, 4.9, 0.1)) ok(Math.abs(M.shotVertexForm({ vx: vx + 0.1, vy: 7 }).a) < Math.abs(M.shotVertexForm({ vx, vy: 7 }).a), '|a| shrinks with vx');

// ---- step 5: quiz ----
const q3 = M.crossings(M.QUIZ.q3.a, M.QUIZ.q3.h, M.QUIZ.q3.k);
assert.deepEqual(q3.xs, [-1, 3]); checks++;
ok(grid(-4, 4, 0.5).includes(M.QUIZ.q2.h) && grid(-4, 4, 0.5).includes(M.QUIZ.q2.k), 'quiz ② target reachable on its sliders');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['c2', 'q1A', 'q1B', 'q1C', 'h5Slider', 'k5Slider']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) { ok(STRINGS[l].s4e.includes('3.05'), 'rim height in text'); ok(STRINGS[l].made.includes('0.1'), 'rim tolerance in text'); }
assert.equal(M.RIM_TOL, 0.1); checks++;

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['t0', 'play0', 'a1', 'h2', 'k2', 'a2', 'h3', 'k3', 'a3', 'vx', 'vy', 'reset4', 'h5', 'k5', 'up5', 'down5', 'q1check', 'q2check', 'q3check']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/algebra/parabola/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS parabola core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · scoring pairs ${made}, high ${high}, short ${low}, rising ${rising}`);
