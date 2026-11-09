'use strict';
// Pythagorean theorem (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: the straight line is always shorter, and c×c = a×a + b×b on every slider pair ----
for (let a = 1; a <= 8; a++) for (let b = 1; b <= 8; b++) {
  const w = M.walk(a, b);
  ok(w.c < w.around, `c < a + b for ${a},${b}`);
  near(w.c2, a * a + b * b, 1e-9, 'c² = a² + b²');
  ok(w.c2.toFixed(2) === (a * a + b * b).toFixed(2), 'table c×c shows the whole number to 2 dp');
}
// the default pair is the 3-4-5 triangle
near(M.walk(3, 4).c, 5, 1e-12, '3-4-5');

// ---- step 1: the hinge. Equality only at 90°, c² rising with the angle, crossing at 90° for every a, b ----
for (let a = 2; a <= 6; a++) for (let b = 2; b <= 6; b++) {
  let prev = -Infinity;
  for (let deg = 30; deg <= 150; deg++) {
    const h = M.hinge(a, b, deg);
    ok(h.c2 > prev, 'c² increases with the angle'); prev = h.c2;
    ok(h.verdict === (deg === 90 ? 'eq' : deg > 90 ? 'gt' : 'lt'), `verdict a=${a} b=${b} θ=${deg}`);
    near(h.c2, a * a + b * b - 2 * a * b * Math.cos(deg * Math.PI / 180), 1e-9, 'law of cosines');
    // each square has the side it stands on, and stands outside the triangle
    for (const [Q, len] of [[h.sqA, a], [h.sqB, b], [h.sqC, h.c]]) {
      for (let i = 0; i < 4; i++) near(Math.hypot(Q[(i + 1) % 4][0] - Q[i][0], Q[(i + 1) % 4][1] - Q[i][1]), len, 1e-9, 'square side');
      near(M.polyArea(Q), len * len, 1e-9, 'square area = side²');
    }
    const cen = [(h.tri[0][0] + h.tri[1][0] + h.tri[2][0]) / 3, (h.tri[0][1] + h.tri[1][1] + h.tri[2][1]) / 3];
    for (const Q of [h.sqA, h.sqB, h.sqC]) {
      const [P, R, F] = Q, d = [R[0] - P[0], R[1] - P[1]], side = v => d[0] * (v[1] - P[1]) - d[1] * (v[0] - P[0]);
      ok(Math.sign(side(F)) !== Math.sign(side(cen)), 'square built outward');
    }
  }
  // the default view: a = 3, b = 4 at 90° is the 3-4-5 triangle
}
near(M.hinge(3, 4, 90).c, 5, 1e-9, 'hinge 3,4 at 90° gives 5');

// ---- step 2: rearrangement proof on every slider pair (0.5 steps) ----
for (let a = 1; a <= 6; a += 0.5) for (let b = 1; b <= 6; b += 0.5) {
  const f = M.frame(a, b), s = a + b;
  near(M.polyArea(f.holeA), a * a + b * b, 1e-9, 'tilted gap = c² = a² + b²');
  f.holeA.forEach((p, i) => near(Math.hypot(f.holeA[(i + 1) % 4][0] - p[0], f.holeA[(i + 1) % 4][1] - p[1]), f.c, 1e-9, 'gap side = c'));
  near(M.polyArea(f.holesB[0]) + M.polyArea(f.holesB[1]), a * a + b * b, 1e-9, 'gaps a² + b²');
  near(f.holeAArea, f.frameArea - 4 * f.triArea, 1e-12, 'frame − triangles');
  for (const lay of [f.A, f.B]) {
    let tot = 0;
    for (const T of lay) {
      near(Math.hypot(T[1][0] - T[0][0], T[1][1] - T[0][1]), a, 1e-12, 'leg a'); near(Math.hypot(T[2][0] - T[0][0], T[2][1] - T[0][1]), b, 1e-12, 'leg b');
      ok(T.every(p => p[0] >= -1e-12 && p[0] <= s + 1e-12 && p[1] >= -1e-12 && p[1] <= s + 1e-12), 'triangle inside the frame');
      tot += M.polyArea(T);
    }
    near(tot, 4 * a * b / 2, 1e-9, 'four triangles');
  }
  // triangles do not overlap each other or the gaps: total of pieces = frame (checked by sampling)
  const inTri = (T, x, y) => { const s1 = (T[1][0] - T[0][0]) * (y - T[0][1]) - (T[1][1] - T[0][1]) * (x - T[0][0]), s2 = (T[2][0] - T[1][0]) * (y - T[1][1]) - (T[2][1] - T[1][1]) * (x - T[1][0]), s3 = (T[0][0] - T[2][0]) * (y - T[2][1]) - (T[0][1] - T[2][1]) * (x - T[2][0]); return (s1 > 0 && s2 > 0 && s3 > 0) || (s1 < 0 && s2 < 0 && s3 < 0); };
  for (let i = 0; i < 23; i++) for (let j = 0; j < 23; j++) {
    const x = (i + 0.37) / 23 * s, y = (j + 0.61) / 23 * s;
    const inB = f.B.filter(T => inTri(T, x, y)).length, inHole = (x < a && y < a) || (x > a && y > a);
    ok(inB + (inHole ? 1 : 0) === 1, 'layout 2 tiles the frame exactly once');
  }
}
// "the bottom-right triangle stays put"; the others only slide (translation vectors)
{ const f = M.frame(3, 4); assert.deepEqual(f.moves[1], [0, 0]); assert.deepEqual(f.A[1][0], [7, 0]); checks += 2; }

// ---- step 3: distance on the grid ----
const FIVE = [];
for (let x = 0; x <= 10; x++) for (let y = 0; y <= 7; y++) {
  const r = M.distance(2, 1, x, y);
  near(r.d * r.d, r.dx * r.dx + r.dy * r.dy, 1e-9, 'd² = Δx² + Δy²');
  if (r.d2 === 25) FIVE.push([x, y]);
}
ok(FIVE.length === 4 && FIVE.some(([x, y]) => x !== 2 && y !== 1), 'four points 5 away, some off the axes');
ok(M.distance(2, 1, 5, 5).whole && M.distance(2, 1, 5, 5).d === 5, 'Δx 3, Δy 4 gives 5');

// ---- step 4: converse ----
const want = ['right', 'obtuse', 'acute', 'right', 'obtuse', 'right'];
M.QUIZ.forEach((q, i) => ok(M.classify(...q).kind === want[i], 'quiz answer ' + q));
for (let p = 1; p <= 15; p++) for (let q = 1; q <= 15; q++) for (let r = 1; r <= 15; r++) {
  const c = M.classify(p, q, r);
  if (!c.ok) { ok(c.a + c.b <= c.c, 'cannot close'); continue; }
  const T = M.layout(c.a, c.b, c.c);
  near(Math.hypot(T[2][0], T[2][1]), c.b, 1e-9, 'layout side b'); near(Math.hypot(T[2][0] - c.c, T[2][1]), c.a, 1e-9, 'layout side a');
  ok(T[2][0] >= -1e-9 && T[2][0] <= c.c + 1e-9, 'apex above the base');
  if (c.kind === 'right') near(c.maxAngle, 90, 1e-9, 'right = 90°'); else ok(c.kind === 'obtuse' ? c.maxAngle > 90 : c.maxAngle < 90, 'kind matches the measured angle');
}
// hint walk-through: 3,4,5 right; 3,4,6 obtuse; 3,4,2 → longest is 4 and the triangle is obtuse
ok(M.classify(3, 4, 5).kind === 'right' && M.classify(3, 4, 6).kind === 'obtuse', '3-4-5 / 3-4-6');
ok(M.classify(3, 4, 2).c === 4 && M.classify(3, 4, 2).kind === 'obtuse', '3-4-2');

// ---- step 5: whole-number hypotenuses ----
const lit = M.wholeGrid(20);
ok(lit.length === 14, 'lit count in 1..20 is ' + lit.length);
for (const [p, q] of [[3, 4], [6, 8], [9, 12], [4, 3], [5, 12], [8, 15]]) ok(lit.some(([a, b]) => a === p && b === q), 'lit ' + p + ',' + q);
ok(!M.isSquare(2), '√2 not whole');
// every lit pair is a multiple of a primitive triple whose ray passes through it
for (const [a, b, c] of lit) { const [pa, pb, g] = M.primitive(a, b); ok(M.isSquare(pa * pa + pb * pb) && c === Math.round(Math.hypot(pa, pb)) * g, 'multiple of a primitive triple'); }
for (const f of M.sqrt2Fractions(10000)) ok(f.miss !== 0, 'p² ≠ 2q² for q = ' + f.q);
assert.deepEqual(M.sqrt2Fractions(5)[4], { p: 7, q: 5, miss: -1, err: 7 / 5 - Math.SQRT2 }); checks++;

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['thA', 'thB', 'thSum', 'thA2', 'thB2', 'thC2', 'formula', 'cmpEq']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(kind(?:Right|Acute|Obtuse)|cmp(?:Gt|Lt)|s1(?:gt|lt)|q(?:Next|Restart))'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['a0', 'b0', 'clear0', 'a1', 'b1', 'th1', 'snap1', 'a2', 'b2', 'move2', 'reset2', 'bx3', 'by3', 'p4', 'q4', 's4', 'qRight', 'qAcute', 'qObtuse', 'qNext', 'a5', 'b5', 'q5', 'rays5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/geometry/pythagoras/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS pythagoras core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · ${lit.length} whole-number leg pairs in 1..20`);
