'use strict';
// Simultaneous equations (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const grid = (lo, hi, st) => { const a = []; for (let v = lo; v <= hi + 1e-9; v += st) a.push(Math.round(v * 1e6) / 1e6); return a; };

// ---- step 0: x + 2y = 10; every slider x has a matching y; 21 positions; walking along A: +1 in x, −0.5 in y ----
const A = M.SYSTEMS[0].A;
ok(A.a === 1 && A.b === 2 && A.c === 10, 'equation A is x + 2y = 10');
const xs0 = grid(0, 10, 0.5); ok(xs0.length === 21, '21 slider positions (s0hint)');
for (const x of xs0) { const y = M.yOn(A, x); ok(M.residual(A, x, y) === 0, 'solution on A at x=' + x); ok(y >= 0, 'prices stay non-negative'); }
ok(M.yOn(A, 3.14) === 3.43, 'x = 3.14 also has a partner y (s0hint)');
for (const x of grid(0, 9, 0.5)) ok(M.yOn(A, x + 1) === M.clean(M.yOn(A, x) - 0.5), 'along A: +1 in x needs −0.5 in y (s1hint)');

// ---- steps 1–3: presets ----
const B0 = M.SYSTEMS[0].B; ok(B0.a === 3 && B0.b === 1 && B0.c === 15, 'equation B is 3x + y = 15');
const sols = M.SYSTEMS.map(q => M.solve(q.A, q.B));
assert.deepEqual(sols.map(s => [s.kind, s.x, s.y]), [['one', 4, 3], ['one', 3, 4], ['one', 3, 2]]); checks++;
M.SYSTEMS.forEach((q, i) => {
  const s = sols[i];
  ok(M.residual(q.A, s.x, s.y) === 0 && M.residual(q.B, s.x, s.y) === 0, 'solution satisfies both');
  // step 1: on the slider grid (x 0..10, y 0..8, step 0.5) exactly one point has both misses 0
  let both = 0; for (const x of xs0) for (const y of grid(0, 8, 0.5)) if (M.residual(q.A, x, y) === 0 && M.residual(q.B, x, y) === 0) both++;
  ok(both === 1, 'exactly one grid point fits both, preset ' + i);
  // step 2: substitution agrees with Cramer; the answer y is on the y2 slider grid (0..5.5)
  ok(q.A.a === 1, 'substitution presets start with x = …');
  const d = M.substitution(q);
  ok(d.x === s.x && d.y === s.y && d.check === q.B.c, 'substitution = Cramer, check row holds');
  ok(d.y >= 0 && d.y <= 5.5 && Math.abs(d.y * 2 - Math.round(d.y * 2)) < 1e-9, 'y* reachable on the step 2 slider');
  // residual of B along A is linear in y: slope = collected coefficient (row 4), zero at y* (row 6)
  for (const y of grid(0, 5.5, 0.5)) ok(Math.abs(M.residualAlongA(q, y) - (d.coefY * y - d.rhs)) < 1e-9, 'r(y) = coefY·y − rhs');
  ok(M.residualAlongA(q, d.y) === 0, 'r(y*) = 0');
  // step 3: every B − m·A on the slider grid passes through the solution
  for (const m of grid(-4, 4, 0.5)) ok(M.residual(M.combine(q, m), s.x, s.y) === 0, `combination m=${m} passes through the solution`);
  for (const [m, zero, other] of [[M.elimY(q), 'b', 'a'], [M.elimX(q), 'a', 'b']]) {
    ok(m >= -4 && m <= 4 && Math.abs(m * 2 - Math.round(m * 2)) < 1e-9, 'eliminating multiplier is on the slider grid');
    const e = M.combine(q, m); ok(e[zero] === 0 && e[other] !== 0, 'one unknown removed');
    ok(e.c / e[other] === (zero === 'b' ? s.x : s.y), 'remaining unknown reads off the solution');
  }
  // s3hint: special m = ratio of the same unknown's coefficients in B and A
  ok(M.elimX(q) === q.B.a / q.A.a && M.elimY(q) === q.B.b / q.A.b, 'special m are coefficient ratios');
  // the step 0–3 view (x −1..11, y −1..9) shows every solution
  ok(s.x > -1 && s.x < 11 && s.y > -1 && s.y < 9, 'solution inside the view');
});
// the default derivation numbers (rows 3–6: 30 − 6y + y = 15, 30 − 5y = 15, −5y = −15, y = 3)
{ const d = M.substitution(M.SYSTEMS[0]); assert.deepEqual([d.k, d.m1, d.coefY, d.rhs, d.y, d.x], [30, -6, -5, -15, 3, 4]); checks++; }
// default elimination: m = 0.5 gives 2.5x = 10, m = 3 gives −5y = −15
assert.deepEqual(M.combine(M.SYSTEMS[0], 0.5), { a: 2.5, b: 0, c: 10 }); assert.deepEqual(M.combine(M.SYSTEMS[0], 3), { a: 0, b: -5, c: -15 }); checks += 2;

// ---- step 4: x + 2y = 10 with kx + 2y = c; D = 1×2 − k×2 ----
for (const k of grid(-2, 3, 0.25)) for (const c of grid(0, 20, 1)) {
  const s = M.family(k, c);
  ok(s.D === M.clean(2 - 2 * k), 'D = 2 − 2k');
  if (k !== 1) { ok(s.kind === 'one', 'D ≠ 0 → one'); ok(Math.abs(s.x + 2 * s.y - 10) < 1e-6 && Math.abs(k * s.x + 2 * s.y - c) < 1e-6, 'crossing fits both'); }
  else ok(s.kind === (c === 10 ? 'many' : 'none'), 'k = 1: parallel unless c = 10');
}
{ const s = M.family(3, 15); ok(s.x === 2.5 && s.y === 3.75, 'default crossing (2.5, 3.75)'); }
// s4hint: with c = 15, dragging k from 3 towards 1 sends the crossing further along A (|x| grows) and off the graph
{ let prev = 0, off = false; for (const k of grid(1.25, 3, 0.25).reverse()) { const s = M.family(k, 15); ok(Math.abs(s.x) > prev, 'crossing runs away as k → 1'); prev = Math.abs(s.x); if (s.x > 14 || s.x < -4 || s.y > 10 || s.y < -4) off = true; } ok(off, 'crossing leaves the graph before k = 1'); }
// quiz: x + y = 3, 2x + 2y = 7 has no solution
ok(M.solve({ a: 1, b: 1, c: 3 }, { a: 2, b: 2, c: 7 }).kind === 'none', 'quiz answer: none');

// ---- step 5: receipts recover the prices; the doubled receipt cannot ----
for (const p of grid(1, 9, 0.5)) for (const q of grid(1, 9, 0.5)) {
  const R = M.receipts(p, q, false); ok(R.sol.kind === 'one' && R.sol.x === p && R.sol.y === q && R.sol.D === -5, 'prices recovered');
  const C2 = M.receipts(p, q, true); ok(C2.sol.kind === 'many' && C2.r2.c === 2 * C2.r1.c, 'doubled receipt: coincident lines');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s3lgC']); // symbols only
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['s1both', 's1onlyA', 's1onlyB', 's1none', 'd1', 'd8', 'correct', 'wrong']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['x0', 'sweep0', 'clear0', 'x1', 'y1', 'clear1', 'y2', 'next2', 'reset2', 'm3', 'elimY3', 'elimX3', 'clear3', 'k4', 'c4in', 'clear4', 'checkQuiz', 'p5', 'q5', 'copy5']) ok(html.includes(`id="${id}"`), 'control ' + id);
// slider ranges quoted by the tests above
ok(html.includes('id="y2" data-step="2" type="range" min="0" max="5.5" step="0.5"'), 'y2 range');
ok(html.includes('id="m3" data-step="3" type="range" min="-4" max="4" step="0.5"'), 'm3 range');
ok(html.includes('id="k4" data-step="4" type="range" min="-2" max="3" step="0.25" value="3"') && html.includes('id="c4in" data-step="4" type="range" min="0" max="20" step="1" value="15"'), 'step 4 ranges');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/algebra/simultaneous-equations/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS simultaneous-equations core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
