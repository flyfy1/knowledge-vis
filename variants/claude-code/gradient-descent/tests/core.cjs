'use strict';
// Gradient descent (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const grid = (lo, hi, st) => { const out = []; for (let i = 0; lo + i * st <= hi + 1e-9; i++) out.push(Number((lo + i * st).toFixed(6))); return out; };
const both = (key, ...subs) => { for (const l of ['zh', 'en']) for (const s of subs[l === 'zh' ? 0 : 1]) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes "${s}"`); };

// ---- step 0: one step on ½(x − 1)² ----
for (const x of grid(-3, 5, 0.1)) for (const eta of grid(0.1, 2.4, 0.1)) {
  const s = M.step0(x, eta);
  near(s.g, x - 1, 1e-12, 'slope');
  ok(Math.sign(s.xn - x) === -Math.sign(s.g) || s.g === 0 || Math.abs(s.g) < 1e-12, 'moves against the slope');
  // actual change = −η g² (1 − η/2); forecast − actual = −½ η² g²
  near(s.actual, -eta * s.g * s.g * (1 - eta / 2), 1e-9, 'actual change');
  near(s.pred - s.actual, -0.5 * eta * eta * s.g * s.g, 1e-9, 'tangent overestimates the drop by ½η²g²');
  if (Math.abs(s.g) > 1e-9) {
    if (eta < 2 - 1e-9) ok(s.actual < 0, 'η < 2 lowers f'); else if (eta > 2 + 1e-9) ok(s.actual > 0, 'η > 2 raises f'); else near(s.actual, 0, 1e-9, 'η = 2 keeps f');
  }
}
near(M.step0(4, 1).xn, 1, 1e-12, 'η = 1 lands on the bottom'); near(M.step0(4, 2).xn, -2, 1e-12, 'η = 2 lands on the mirror point');
// step size grows with steepness at fixed η (s0hint)
ok(Math.abs(M.step0(4, 0.5).xn - 4) > Math.abs(M.step0(2, 0.5).xn - 2), 'steeper → longer step');

// ---- step 1: x ← (1 − ηa) x ----
for (const a of grid(0.5, 4, 0.5)) for (const eta of grid(0.05, 1.5, 0.05)) {
  const xs = M.run1D(a, eta), r = 1 - eta * a, reg = M.regime(a, eta);
  xs.forEach((x, k) => near(x, M.X1 * Math.pow(r, k), 1e-9 * Math.max(1, Math.abs(x)), 'iterate = r^k x0'));
  const expect = Math.abs(r) < 1e-9 ? 'one' : r > 0 ? 'mono' : Math.abs(r + 1) < 1e-9 ? 'bounce' : r > -1 ? 'osc' : 'diverge';
  assert.equal(reg, expect); checks++;
  ok((eta < 2 / a - 1e-9) === (Math.abs(r) < 1 - 1e-9), 'convergence ⇔ η < 2/a');
  const n = M.stepsTo(r, 1e-3);
  if (isFinite(n)) {
    ok(Math.abs(xs.length > n ? xs[n] : M.X1 * Math.pow(r, n)) <= M.X1 * 1e-3 + 1e-12, 'below 1/1000 after n steps');
    if (n > 1) ok(Math.abs(M.X1 * Math.pow(r, n - 1)) > M.X1 * 1e-3, 'not yet at n − 1');
  } else ok(Math.abs(r) >= 1 - 1e-9, 'never only when |r| ≥ 1');
  // colours in s1hint: all dots orange (x ≥ 0) iff r ≥ 0
  ok(xs.every(x => x >= -1e-12) === (r >= -1e-12), 'all-orange iff r ≥ 0');
}
assert.equal(M.stepsTo(1 - 0.3 * 2, 1e-3), 8); checks++;
// s1hint: with a = 2 the switch points are η = 0.5 (one step) and η = 1 (bounce); a = 4 moves the limit to 0.5
assert.equal(M.regime(2, 0.5), 'one'); assert.equal(M.regime(2, 1), 'bounce'); assert.equal(M.regime(4, 0.55), 'diverge'); assert.equal(M.regime(2, 0.55), 'osc'); checks += 4;
// quiz answer b: η = 1/a = 0.5
near(M.run1D(2, 0.5)[1], 0, 1e-12, 'quiz: one step');
ok(M.regime(2, 0.25) === 'mono' && M.regime(2, 1) === 'bounce', 'quiz distractors');

// ---- step 2: ½(x² + κy²) ----
for (let k = 1; k <= 20; k++) for (const eta of grid(0.01, 0.25, 0.005)) {
  const pts = M.run2D(k, eta, M.P2, 60);
  pts.forEach((p, i) => { near(p[0], M.P2[0] * Math.pow(1 - eta, i), 1e-9, 'x factor 1 − η'); near(p[1], M.P2[1] * Math.pow(1 - eta * k, i), 1e-6 * Math.max(1, Math.abs(p[1])), 'y factor 1 − ηκ'); });
  const n = M.arrive2D(k, eta), stable = Math.abs(1 - eta * k) < 1 - 1e-9;
  ok(isFinite(n) === stable, `arrival ⇔ η < 2/κ (κ=${k}, η=${eta})`);
}
assert.equal(M.arrive2D(10, 0.15), 38); checks++;
assert.equal(M.arrive2D(10, 0.05), 120); checks++;
ok(!isFinite(M.arrive2D(10, 0.205)), 'κ=10: η past 0.2 diverges');
near(M.angleToMin(1), 0, 1e-4, 'κ = 1: downhill points at the bottom');
ok(Math.round(M.angleToMin(10)) === 54, 'κ=10 angle 54°');
// −∇f is perpendicular to the contour: tangent of the ellipse at p is (−κy, x)
for (let k = 1; k <= 20; k++) { const [x, y] = M.P2, g = M.grad2(k, x, y); near(g[0] * (-k * y) + g[1] * x, 0, 1e-9, 'gradient ⟂ contour'); }
// the two plotted canvases use one scale on both axes (bowlView) — documented in s2e
for (const l of ['zh', 'en']) ok(/(同比例|same scale)/.test(STRINGS[l].s2e), 'equal-scale claim present');

// ---- step 3: choosing η ----
for (let k = 1; k <= 50; k++) {
  near(M.best2(k) / M.limit2(k), k / (1 + k), 1e-12, 'η*/limit = κ/(1+κ)');
  near(Math.abs(1 - M.best2(k)), Math.abs(1 - M.best2(k) * k), 1e-12, 'η* balances the two factors');
  near(Math.max(Math.abs(1 - M.best2(k)), Math.abs(1 - k * M.best2(k))), M.rateBest(k), 1e-12, 'rate (κ−1)/(κ+1)');
  const nb = M.arrive2D(k, M.best2(k));
  if (k >= 2) { const r = nb / k; ok(r >= 3.0 && r <= 3.25, `best steps ≈ 3.1κ at κ=${k}: ${r}`); }
  if (k <= 25 || k % 5 === 0) { const g = M.bestOnGrid(k, 300); ok(nb <= g.steps + 2, `η* within 2 steps of the grid best (κ=${k})`); }
  ok(!isFinite(M.arrive2D(k, 1.01 * M.limit2(k))) || k === 1, 'past the limit: never arrives');
}
assert.equal(M.arrive2D(1, 1), 1); checks++;
// s3hint: κ = 10, q = 0.05 costs hundreds of steps (608)
assert.equal(M.arrive2D(10, 0.05 * 0.2), 608); checks++;
both('s3hint', ['3.1 × κ', '2 到 50'], ['3.1 × κ', 'between 2 and 50']);

// ---- step 4: two valleys ----
near(M.d4(M.MINS4.left), 0, 1e-12, 'left stationary'); near(M.d4(M.MINS4.right), 0, 1e-12, 'right stationary'); near(M.d4(M.MINS4.hump), 0, 1e-12, 'hump stationary');
ok(M.dd4(M.MINS4.left) > 0 && M.dd4(M.MINS4.right) > 0 && M.dd4(M.MINS4.hump) < 0, 'two minima, one maximum');
ok(M.f4(M.MINS4.left) < M.f4(M.MINS4.right), 'left valley is the global minimum');
for (let x = -4; x <= 4; x += 0.001) ok(M.f4(x) >= M.f4(M.MINS4.left) - 1e-12, 'global on [−4, 4]');
near(M.MINS4.hump, 0.357, 5e-4, 'hump ≈ 0.357 (legend)');
for (const eta of grid(0.05, 0.8, 0.05)) {
  const b = M.basins(eta);
  ok(b.none === 0, 'every start settles for η ≤ 0.8');
  if (eta <= 0.55 + 1e-9) M.GRID4.forEach((x, i) => assert.equal(b.out[i], x < M.MINS4.hump ? 'left' : 'right', `clean split at η=${eta}, x0=${x}`));
  else ok(M.GRID4.some((x, i) => x > M.MINS4.hump && b.out[i] === 'left'), 'η ≥ 0.6: some right starts jump left');
}
ok(M.outcome4(4, 0.55) === 'right' && M.outcome4(4, 0.6) === 'left', 'x0 = 4 flips between η 0.55 and 0.6');
{ const b = M.basins(0.8), flipped = M.GRID4.filter((x, i) => x < M.MINS4.hump && b.out[i] === 'right'); assert.deepEqual(flipped, [-4, -3.95]); checks++; }
assert.equal(M.outcome4(1, 0.2), 'right'); checks++;

// ---- step 5: fitting a line ----
assert.equal(M.DATA.length, 24); checks++;
ok(M.DATA.every(p => p.x >= 0.5 && p.x <= 9.5), 'x in [0.5, 9.5]');
const oR = M.optimum5(false), oC = M.optimum5(true);
near(oR.kappa, 157, 0.5, 'raw κ ≈ 157'); near(oC.kappa, 6.9, 0.05, 'centred κ ≈ 6.9');
near(oR.loss, oC.loss, 1e-12, 'same best loss either way'); near(oR.w, oC.w, 1e-12, 'same slope');
// the optimum really is the minimum: zero full-batch gradient
for (const c of [false, true]) { const o = M.optimum5(c), g = M.grad5(o.w, o.c, c, M.DATA.map((_, i) => i)); near(g[0], 0, 1e-9, 'grad w'); near(g[1], 0, 1e-9, 'grad c'); }
both('s5e', ['157', '6.9'], ['157', '6.9']);
// raw feature, full batch: still above the minimum after 300 updates for every factor on the slider
for (const q of grid(0.05, 0.5, 0.05)) { const R = M.run5(false, 24, q); ok(R.final > oR.loss + 0.01, `raw, full batch, q=${q}: not there after 300`); }
// centred feature, full batch, default factor 0.3: within 0.001 of the minimum by update 60 ("a few dozen")
{ const R = M.run5(true, 24, 0.3), k = R.losses.findIndex(v => v - oC.loss < 1e-3); ok(k > 0 && k <= 60, 'centred arrives within 60 updates: ' + k); }
// centred, B = 1: last-100 mean stays above the minimum and grows with the factor from 0.1 to 0.5, for all 5 orders
for (let seed = 1; seed <= 5; seed++) {
  let prev = -Infinity;
  for (const q of grid(0.1, 0.5, 0.05)) { const R = M.run5(true, 1, q, seed); ok(R.tailMean > oC.loss + 0.02, 'B=1 floor above minimum'); ok(R.tailMean > prev, `B=1 gap grows with η (seed ${seed}, q ${q})`); prev = R.tailMean; }
}
// full batch is deterministic: the sampling order does not matter
near(M.run5(true, 24, 0.3, 1).final, M.run5(true, 24, 0.3, 4).final, 1e-12, 'B = 24 ignores order');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['quizA', 'quizB', 'quizC', 's1lgF', 's4lgF', 'qSlider', 's3lgBest']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/(左图|右图|left chart|right chart|left panel|right panel)/i.test(v), 'no left/right chart wording in ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const r of ['one', 'mono', 'osc', 'bounce', 'diverge']) ok(STRINGS.zh['reg_' + r] && STRINGS.en['reg_' + r], 'regime key ' + r);
for (const id of ['x0', 'e0', 'next0', 'a1', 'e1', 'run1', 'k2', 'e2', 'run2', 'k3', 'q3', 'best3', 'x4', 'e4', 'run4', 'q5', 'run5', 'seed5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../computing/ml/gradient-descent/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS gradient-descent core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
