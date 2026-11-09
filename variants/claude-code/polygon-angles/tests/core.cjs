'use strict';
// Polygon angle sums (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const grid = (lo, hi, step) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000); return out; };

// ---- steps 0 and 1: every slider position of C (both steps use the same ranges) ----
for (const cx of grid(-1, 7, 0.25)) for (const cy of grid(1.5, 5.5, 0.25)) {
  const T = M.triangle(cx, cy), g = M.triAngles(T);
  near(g.a + g.b + g.c, 180, 1e-9, `triangle sum at C=(${cx},${cy})`);
  ok(M.signedArea(T) > 0, 'A, B, C run anticlockwise');
  const par = M.parallelAngles(T);
  near(par.left, g.a, 1e-9, 'alternate angle on the left of ℓ = α');
  near(par.right, g.b, 1e-9, 'alternate angle on the right of ℓ = β');
  near(par.left + par.mid + par.right, 180, 1e-9, 'three angles along ℓ make a straight angle');
  // tearing: the wedges end side by side, α | γ | β, covering exactly 0°..180° above one point
  const plan = M.tearPlan(T);
  near(plan.b.targetStart, 0, 1e-12, 'β starts at 0°');
  near(plan.c.targetStart, plan.b.targetStart + plan.b.span, 1e-9, 'γ follows β');
  near(plan.a.targetStart, plan.c.targetStart + plan.c.span, 1e-9, 'α follows γ');
  near(plan.a.targetStart + plan.a.span, 180, 1e-9, 'α ends at 180°');
  // each wedge's original position is the interior angle at its own corner
  for (const k of ['a', 'b', 'c']) {
    const w = plan[k], mid = (w.start + w.span / 2) * Math.PI / 180;
    const probe = { x: w.V.x + 0.01 * Math.cos(mid), y: w.V.y + 0.01 * Math.sin(mid) };
    const [A, B, C] = T, s = (P, Q, R) => (Q.x - P.x) * (R.y - P.y) - (Q.y - P.y) * (R.x - P.x);
    ok(s(A, B, probe) > 0 && s(B, C, probe) > 0 && s(C, A, probe) > 0, 'wedge points into the triangle');
  }
}

// ---- step 2: cutting n-gons into triangles (every n on the slider, ten shapes each) ----
for (let n = 3; n <= 12; n++) for (let seed = 0; seed <= 10; seed++) {
  const P = M.shape(n, seed), ints = M.interiorAngles(P);
  ok(M.isConvex(P) && M.isSimple(P), `shape n=${n} seed=${seed} is convex`);
  near(M.sum(ints), M.formulaSum(n), 1e-8, `measured sum n=${n} seed=${seed}`);
  ok(M.fanTriangles(n).length === n - 2 && M.diagonalsFromOneVertex(n) === n - 3, 'n − 3 diagonals, n − 2 triangles');
  // the fan triangles' angles add up to the polygon's angles
  const triSum = M.sum(M.fanTriangles(n).map(([i, j, k]) => M.angleAt(P[i], P[j], P[k]) + M.angleAt(P[j], P[k], P[i]) + M.angleAt(P[k], P[i], P[j])));
  near(triSum, M.sum(ints), 1e-8, 'fan triangles = polygon angles');
  const cut = M.centreCut(P);
  near(cut.around, 360, 1e-8, 'the inside point is surrounded by a full turn');
  near(n * 180 - cut.around, M.sum(ints), 1e-8, 'n·180 − 360 = measured sum');
  // step 3 uses n = 3..8 and the same shapes: turns are the exterior angles, all left turns, summing to 360
  const tu = M.turns(P);
  near(M.sum(tu), 360, 1e-8, 'exterior angles add to 360°');
  tu.forEach((v, i) => { ok(v > 0 && v < 180, 'convex: every turn is a left turn below 180°'); near(v, 180 - ints[i], 1e-9, 'exterior = 180° − interior'); });
  ok(Math.min(...ints) > 20, 'no sliver angles in the generated shapes');
}

// ---- step 4: the dented pentagon over the whole slider range, and the star ----
for (const p of grid(0, 1.5, 0.05)) {
  const D = M.dented(p), ints = M.interiorAngles(D), tu = M.turns(D);
  ok(M.isSimple(D) && M.signedArea(D) > 0, `dented pentagon p=${p} is simple and anticlockwise`);
  near(M.sum(ints), 540, 1e-8, `dented sum p=${p}`);
  near(M.sum(tu), 360, 1e-8, `net turn p=${p}`);
  ok((ints[0] > 180 + 1e-9) === (p > M.P_STRAIGHT), 'reflex exactly when vertex 1 passes the chord');
  ok((tu[0] < 0) === (ints[0] > 180 + 1e-9), 'right turn exactly at the reflex corner');
  ints.slice(1).forEach(v => ok(v < 180, 'the other four corners stay below 180°'));
}
ok(M.P_STRAIGHT > 0.65 && M.P_STRAIGHT < 0.7, 'the default p = 0.3 is still convex; the slider passes 180° between 0.65 and 0.7');
const S = M.star();
ok(!M.isSimple(S), 'star sides cross');
near(M.sum(M.turns(S)), 720, 1e-8, 'star: two full turns');
M.turns(S).forEach(v => near(v, 144, 1e-9, 'star: 144° left turn at every point'));
near(M.sum(M.starTips(S)), 180, 1e-8, 'star point angles add to 180°');

// ---- step 5: regular tiles round one point; only n = 3, 4, 6 close up ----
const exact = [];
for (let n = 3; n <= 1000; n++) {
  const r = M.aroundPoint(n);
  near(r.a, 180 - 360 / n, 1e-9, 'interior = 180 − 360/n');
  if (r.exact) exact.push(n);
  if (n >= 7) { ok(r.a > 120 && r.fit === 2, `n=${n}: angle over 120°, two tiles fit`); ok(r.gap > 0 && r.a - r.gap > 0, 'gap and overlap both positive'); }
}
assert.deepEqual(exact, [3, 4, 6]); checks++;
ok(M.aroundPoint(3).fit === 6 && M.aroundPoint(4).fit === 4 && M.aroundPoint(6).fit === 3, '6 triangles, 4 squares, 3 hexagons');
near(M.aroundPoint(5).gap, 36, 1e-9, 'pentagon leaves a 36° gap');
near(M.sidesFromInterior(150), 12, 1e-9, 'quiz: 150° → 12 sides');
near(M.aroundPoint(12).a, 150, 1e-9, 'quiz check: the regular 12-gon has 150° angles');
ok(Math.abs(M.sidesFromInterior(150) - 10) > 0.5 && Math.abs(M.sidesFromInterior(150) - 15) > 0.5, 'distractors are wrong');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['s1st0', 's1st1', 's1st2', 's1st3', 'untear']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['cx0', 'cy0', 'tear0', 'cx1', 'cy1', 'next1', 'restart1', 'n2', 'mode2v', 'mode2c', 'cut2', 'shape2', 'n3', 'one3', 'all3', 'reset3', 'shape3', 'p4', 'dent4', 'star4', 'walk4', 'n5', 'place5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/geometry/polygon-angles/index.html')), 'comparison link target exists');
ok(STRINGS.zh.compare.includes('多边形内角和 · 撕下来拼一拼') && STRINGS.en.compare.includes('Polygon Angle Sums · Tear and Rearrange'), 'compare link names the original');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS polygon-angles core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
