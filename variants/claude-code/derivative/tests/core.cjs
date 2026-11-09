'use strict';
// Derivative (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node variants/claude-code/derivative/tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const grid = (lo, hi, st) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += st) out.push(Math.round(v * 1000) / 1000); return out; };

// ---- step 0: average speed = slope of the secant; for s = t² it is a + b ----
for (const a of grid(0, 4, 0.1)) for (const b of grid(0, 4, 0.1)) if (a !== b) near(M.avg(a, b), a + b, 1e-9, 'average over [a, b] = a + b');
for (const [a, b, v] of [[1, 3, 4], [2, 3, 5], [1, 2, 3], [1.9, 2.1, 4]]) assert.equal(M.num(M.avg(a, b)), String(v)), checks++;  // s0hint examples differ

// ---- step 1: secant slope through P = (2, 4) is exactly 4 + Δt ----
for (const dt of grid(-1, 1, 0.01)) if (dt !== 0) { const m = M.secant(M.s, M.T0, dt); near(m, 4 + dt, 1e-9, 'slope 4 + Δt'); ok(m !== 4, 'never exactly 4 for Δt ≠ 0'); ok((m > 4) === (dt > 0), 'right side above 4, left side below'); }
assert.deepEqual([1, 0.1, 0.01].map(d => M.num(M.secant(M.s, 2, d), 4)), ['5', '4.1', '4.01']); checks++;
assert.deepEqual([-1, -0.1, -0.01].map(d => M.num(M.secant(M.s, 2, d), 4)), ['3', '3.9', '3.99']); checks++;
ok(M.num(4 + 0.01, 4) === '4.01', 'sweep ends at 4.01');

// ---- step 2: zooming; the gap is w², the window height 10w, so the share is 10w % ----
for (const z of M.ZOOMS) {
  const { w, hy } = M.zoomWindow(z);
  near(M.maxGapNumeric(M.s, x => 2 * x, M.T0, w), M.maxGap(w), 1e-12 + 1e-9 * w * w, 'max gap = w² at ×' + z);
  near(hy, 5 * w, 1e-15, 'window half-height 5w');
  near(M.maxGap(w) / (2 * hy) * 100, 10 * w, 1e-12, 'share = 10w %');
}
near(M.maxGap(M.zoomWindow(100).w) / (2 * M.zoomWindow(100).hy) * 100, 0.2, 1e-12, '×100 → 0.2 % of the window');
for (let i = 1; i < M.ZOOMS.length; i++) ok(M.maxGap(M.zoomWindow(M.ZOOMS[i]).w) / M.zoomWindow(M.ZOOMS[i]).hy < M.maxGap(M.zoomWindow(M.ZOOMS[i - 1]).w) / M.zoomWindow(M.ZOOMS[i - 1]).hy, 'share shrinks with zoom');

// ---- step 3: measured slopes vs rules ----
let worst = 0;
for (const x of grid(-2, 2, 0.1)) {
  near(M.measure('sq', x) - M.FUNCS.sq.d(x), M.H_MEASURE, 1e-9, 'x²: measured − 2x = Δx exactly');
  const e = M.measure('cube', x) - M.FUNCS.cube.d(x); worst = Math.max(worst, Math.abs(e));
  near(e, 3 * x * M.H_MEASURE + M.H_MEASURE * M.H_MEASURE, 1e-9, 'x³: measured − 3x² = 3xΔx + Δx²');
  ok(M.FUNCS.sq.f(x) >= -0.6 && M.FUNCS.sq.f(x) <= 4.6 && Math.abs(M.measure('sq', x)) <= 4.6, 'x² fits its plots');
  ok(Math.abs(M.FUNCS.cube.f(x)) <= 8.5 && M.measure('cube', x) >= -1 && M.measure('cube', x) <= 12.8, 'x³ fits its plots');
}
ok(worst < 0.0061, 'x³ measurement within 0.0061 of 3x² on the slider range');
assert.equal(M.num(M.measure('cube', 0), 3), '0'); checks++;   // slope 0 at x = 0 for x³ (s3hint)
ok(M.FUNCS.cube.f(-0.1) < M.FUNCS.cube.f(0) && M.FUNCS.cube.f(0) < M.FUNCS.cube.f(0.1), 'x³ does not turn back at 0');

// ---- step 4: the shot ----
for (const tt of grid(0, 1.6, 0.01)) {
  near((M.height(tt + 1e-6) - M.height(tt - 1e-6)) / 2e-6, M.vspeed(tt), 1e-6, 'h′(t) = 7 − 9.8t');
  ok(M.height(tt) >= 0 && M.height(tt) <= 5, 'height inside the plot'); ok(M.vspeed(tt) >= -10.5 && M.vspeed(tt) <= 8, 'h′ inside the plot');
}
near(M.topTime, 5 / 7, 1e-12, 'top at 5/7 s'); near(M.height(M.topTime), 4.5, 1e-12, 'peak 4.5 m'); near(M.vspeed(M.topTime), 0, 1e-12, 'h′ = 0 at the top');
ok(M.vspeed(0) === 7 && M.vspeed(1.6) < 0, 'h′ goes from 7 into negatives (s4hint)');
for (const tt of grid(0, 1.6, 0.01)) if (Math.abs(tt - M.topTime) > 1e-9) ok((M.vspeed(tt) > 0) === (tt < M.topTime), 'rising before the top, falling after');
ok(!grid(0, 1.6, 0.01).some(tt => Math.abs(tt - M.topTime) < 1e-9), 'the top is not on the slider grid, hence the jump button');

// ---- step 5: quiz ----
assert.deepEqual(M.QUIZ.q1.dxs.map(d => M.num(M.secant(M.FUNCS.sq.f, M.QUIZ.q1.x0, d), 4)), ['7', '6.1', '6.01']); checks++;
assert.equal(STRINGS.zh.q1C, String(M.FUNCS.sq.d(M.QUIZ.q1.x0))); checks++;
assert.equal(M.num(M.measure('cube', 1), 3), '3.003'); assert.equal(STRINGS.zh.q2C, String(M.QUIZ.q2.answer)); assert.equal(M.FUNCS.cube.d(1), 3); checks += 3;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['fnSq', 'fnCube', 'ruleSq', 'ruleCube', 'q1A', 'q1B', 'q1C', 'q2A', 'q2B', 'q2C', 'q2D', 'lg0Curve', 'lg1Curve', 'lg2Curve', 'dt1', 'dt01', 'dt001']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) { ok(STRINGS[l].s3e.includes('0.001') && STRINGS[l].s4e.includes('2 + 7t − 4.9t²') && STRINGS[l].s4e.includes('7 − 9.8t'), 'formulas quoted in text match the model'); ok(STRINGS[l].s1hint.includes('5 → 4.1 → 4.01') && STRINGS[l].s1hint.includes('3 → 3.9 → 3.99'), 'squeeze sequences in s1hint'); }

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['t1', 't2', 'dt', 'dt1', 'dt01', 'dt001', 'flip1', 'sweep1', 'zoom', 'x3', 'fnSq', 'fnCube', 'sweep3', 'rule3', 't4', 'top4', 'q1check', 'q2check', 'q3check']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/calculus/derivative/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS derivative core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · worst x³ measurement error ${worst.toFixed(4)}`);
