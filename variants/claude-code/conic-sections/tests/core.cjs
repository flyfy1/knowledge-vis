'use strict';
// Conic sections (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };

// ---- step 0: the cut really lies on the cone; type and e follow the tilt ----
const SIDE = 90 - M.ALPHA;
ok(SIDE === 60, 'side of the cone is 60° from horizontal');
for (let beta = 0; beta <= 85; beta++) {
  const kd = M.kind(beta), e = M.ecc(beta);
  ok(kd === (beta === 0 ? 'circle' : beta < SIDE ? 'ellipse' : beta === SIDE ? 'parabola' : 'hyperbola'), `type at β=${beta}`);
  near(e, Math.sin(beta * M.D2R) / Math.sin(SIDE * M.D2R), 1e-12, 'e = sin β ÷ sin 60°');
  ok((e < 1 - 1e-9) === (beta < SIDE) && (e > 1 + 1e-9) === (beta > SIDE), 'e < 1, = 1, > 1 match the comparison');
  // every drawn point is on the cone
  for (const run of M.sectionRuns(beta, -12, 12, 300)) for (const [u, w] of run.filter((_, i) => i % 7 === 0)) near(M.onCone(M.to3D(u, w, beta)), 0, 1e-9, `point on cone β=${beta}`);
  // the drawn (parametric) curve is on the cone too, with one closed loop below 60° and two branches above
  const drawn = M.sectionCurve(beta);
  for (const run of drawn) for (const [u, w] of run.filter((_, i) => i % 9 === 0)) near(M.onCone(M.to3D(u, w, beta)) / (1 + u * u), 0, 1e-9, `drawn point on cone β=${beta}`);
  ok(drawn.length === (beta > SIDE ? 2 : 1), 'drawn runs');
  if (beta < SIDE) { const r = drawn[0]; near(r[0][0], r[r.length - 1][0], 1e-9, 'loop closes'); }
  const sh = M.sectionShape(beta);
  // e from the true shape agrees with sin β ÷ sin 60° (independent route)
  if (sh.kind === 'ellipse' || sh.kind === 'circle') near(Math.sqrt(1 - (sh.b / sh.a) ** 2), e, 1e-9, 'ellipse e from a, b');
  if (sh.kind === 'hyperbola') near(Math.sqrt(1 + (sh.b / sh.a) ** 2), e, 1e-9, 'hyperbola e from a, b');
  // closed for β < 60 (one run), one open run at 60, two runs (two cones) above 60 when the window is wide enough
  const runs = M.sectionRuns(beta, -400, 400, 40000);
  if (beta < SIDE) ok(runs.length === 1, 'one closed loop'); else if (beta === SIDE) ok(runs.length === 1, 'parabola: one branch');
  else { ok(runs.length === 2, 'hyperbola: two branches at β=' + beta); const zs = runs.map(r => Math.sign(M.to3D(r[0][0], r[0][1], beta)[2])); ok(zs[0] !== zs[1], 'one branch on each cone'); }
  // side-view hits are where the trace meets the generators
  M.sideHits(beta).forEach(u => near(Math.abs(M.onCone(M.to3D(u, 0, beta))), 0, 1e-9, 'side hit on cone'));
}
near(M.sectionShape(0).a, M.H * Math.tan(30 * M.D2R), 1e-12, 'β = 0 circle radius = 1.5·tan30°');
near(M.ecc(20), 0.395, 0.0005, 'default readout e at β = 20°');

// ---- step 1: Dandelin spheres ----
for (let beta = 0; beta <= 40; beta++) {
  const D = M.dandelin(beta), sh = M.sectionShape(beta);
  D.forEach(s => {
    // sphere tangent to the cone side and to the plane
    near(s.r, s.zc * Math.sin(M.ALPHA * M.D2R), 1e-12, 'tangent to cone');
    near(Math.abs(Math.cos(beta * M.D2R) * (s.zc - M.H)), s.r, 1e-12, 'tangent to plane');
  });
  ok(D[0].zc < M.H && D[1].zc > M.H, 'one sphere below, one above the plane');
  // foci from the spheres = foci from the true-shape ellipse (uc ± a·e)
  near(D[0].focusU, sh.uc - sh.a * sh.e, 1e-9, 'F1 matches ellipse focus'); near(D[1].focusU, sh.uc + sh.a * sh.e, 1e-9, 'F2 matches ellipse focus');
  for (let tp = 0; tp < 360; tp += 5) {
    const [u, w] = M.ellipsePoint(beta, tp), q = M.focalCheck(beta, u, w);
    near(M.onCone(M.to3D(u, w, beta)), 0, 1e-9, 'P on cone');
    near(q.sum, q.L, 1e-9, `PF1 + PF2 = generator piece (β=${beta}, t=${tp})`);
    near(q.sum, 2 * sh.a, 1e-9, '= major axis 2a');
    near(q.toC1, q.d1, 1e-9, 'equal tangents to the small sphere'); near(q.toC2, q.d2, 1e-9, 'equal tangents to the big sphere');
  }
  // the side view box (y up to 6.8) holds the big sphere for β ≤ 40
  ok(D[1].zc + D[1].r <= 6.8, 'big sphere fits the side view at β=' + beta);
}
near(M.dandelin(0)[0].focusU, 0, 1e-12, 'β = 0: foci coincide'); near(M.dandelin(0)[1].focusU, 0, 1e-12, 'β = 0: foci coincide');

// ---- step 2: pins and string ----
for (let a10 = 5; a10 <= 50; a10++) for (let c10 = 0; c10 <= 45; c10++) {
  const a = a10 / 10, c = c10 / 10;
  const E = M.pinCurve('sum', a, c), Hh = M.pinCurve('diff', a, c);
  ok(!!E === a > c, 'ellipse exists iff a > c'); ok(!!Hh === a < c, 'hyperbola exists iff a < c');
  for (const cur of [E, Hh]) {
    if (!cur) continue;
    near(cur.e, c / a, 1e-12, 'e = c/a');
    for (let k = 0; k < 200; k += 7) {
      const P = M.pencil(cur, k / 200), d = M.pinDistances(cur, P);
      if (cur.mode === 'sum') { near(d.sum, 2 * a, 1e-9, 'sum = 2a'); near(P[0] ** 2 / a ** 2 + P[1] ** 2 / cur.b ** 2, 1, 1e-9, 'ellipse equation'); }
      else { near(d.diff, 2 * a, 1e-9, '|diff| = 2a'); near(P[0] ** 2 / a ** 2 - P[1] ** 2 / cur.b ** 2, 1, 1e-9, 'hyperbola equation'); }
    }
  }
}
// pencil: first half of the hyperbola parameter is the right branch, second half the left
{ const cur = M.pinCurve('diff', 1.6, 2.6); ok(M.pencil(cur, 0.2)[0] > 0 && M.pencil(cur, 0.7)[0] < 0, 'right branch then left'); }
// defaults: ellipse a = 4, c = 2.4 fits the drawn box (|x| ≤ 6.2, |y| ≤ 3.9) — b = 3.2
{ const cur = M.pinCurve('sum', 4, 2.4); near(cur.b, 3.2, 1e-12, 'default b'); ok(cur.a <= 6.2 && cur.b <= 3.9, 'default ellipse fits'); }
// flatter as c grows (fixed a)
{ let prev = Infinity; for (let c = 0; c < 4; c += 0.5) { const b = M.pinCurve('sum', 4, c).b; ok(b < prev, 'flatter as pins separate'); prev = b; } }

// ---- step 3: focus and directrix ----
for (let e100 = 0; e100 <= 250; e100 += 5) {
  const e = e100 / 100;
  ok(M.kindOfE(e) === (e === 0 ? 'circle' : e === 1 ? 'parabola' : e < 1 ? 'ellipse' : 'hyperbola'), 'type by e');
  for (let th = -180; th <= 180; th += 3) {
    const P = M.fdPoint(e, th);
    if (!isFinite(P[0])) { ok(e >= 1, 'only e ≥ 1 has directions to infinity'); continue; }
    const q = M.fdCheck(e, P);
    if (e === 0) near(q.pf, M.LR, 1e-12, 'e = 0: circle radius 1.5');
    else near(q.ratio, e, 1e-9, `PF/PD = e (e=${e}, θ=${th})`);
    if (e < 1) ok(M.polarR(e, th) > 0, 'ellipse: every direction gives a point on the near side');
  }
  // the curve passes 1.5 straight above F (fixed semi-latus rectum)
  near(M.fdPoint(e, 90)[1], 1.5, 1e-12, 'distance from F straight up = 1.5');
  if (e > 0) near(-M.LR / e, -1.5 / e, 1e-12, 'directrix at 1.5/e');
}
// e > 1 near 0° puts P beyond the directrix (the far branch)
ok(M.polarR(2, 0) < 0 && M.fdPoint(2, 0)[0] < -M.LR / 2, 'far branch beyond the directrix');
// the cone's e and the pins' c/a describe the same ellipse: section a, b → c = √(a² − b²), c/a = sin β ÷ sin 60°
for (let beta = 1; beta < 60; beta++) { const sh = M.sectionShape(beta); near(Math.sqrt(sh.a ** 2 - sh.b ** 2) / sh.a, M.ecc(beta), 1e-9, 'c/a = cone e'); }
// …and the focus–directrix ratio on the cone's own ellipse (directrix at uc ± a/e)
for (let beta = 5; beta < 60; beta += 5) {
  const sh = M.sectionShape(beta), F = sh.uc + sh.a * sh.e, Dx = sh.uc + sh.a / sh.e;
  for (let tp = 0; tp < 360; tp += 15) { const [u, w] = M.ellipsePoint(beta, tp); near(Math.hypot(u - F, w) / Math.abs(Dx - u), sh.e, 1e-9, 'PF/PD on the cut ellipse'); }
}

// ---- step 4: reflection ----
for (let n = 3; n <= 24; n++) for (let i = 0; i < n; i++) {
  const x0 = -3.6 + 7.2 * (i + 0.5) / n, r = M.parabolaRay(1, x0, 5.2);
  near(r.miss, 0, 1e-9, 'parabola reflects through focus'); ok(r.towards || Math.abs(x0) < 1e-12, 'heads towards the focus');
  near(r.path, 6.2, 1e-9, 'path = 5.2 + 1');
  ok(r.P[0] >= -4.2 && r.P[0] <= 4.2 && r.P[1] <= 5.2, 'landing point inside the drawn box');
  const q = M.ellipseRay(3, 2, 360 * (i + 0.5) / n);
  near(q.miss, 0, 1e-9, 'ellipse reflects through F2'); near(q.path, 6, 1e-9, 'path = 2a = 6');
  near(q.P[0] ** 2 / 9 + q.P[1] ** 2 / 4, 1, 1e-9, 'lands on the ellipse');
  // law of reflection: equal angles with the normal
  const g = [q.P[0] / 9, q.P[1] / 4], gl = Math.hypot(...g), nrm = [g[0] / gl, g[1] / gl], din = [q.P[0] - q.F1[0], q.P[1] - q.F1[1]], dl = Math.hypot(...din);
  near(Math.abs(din[0] * nrm[0] + din[1] * nrm[1]) / dl, Math.abs(q.out[0] * nrm[0] + q.out[1] * nrm[1]) / Math.hypot(...q.out), 1e-9, 'angle in = angle out');
}
near(Math.sqrt(9 - 4), Math.sqrt(5), 1e-12, 'foci ±√5');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lgPF1', 'lgPF2', 'eqEll', 'eqHyp']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) ok(STRINGS[l].s0hint.includes('60°') && STRINGS[l].c4ell.includes('√5') && STRINGS[l].s3e.includes('1.5'), 'texts quote the tested values');

// ---- keys, controls, provenance ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const kd of ['circle', 'ellipse', 'parabola', 'hyperbola']) ok(STRINGS.zh['k_' + kd] && STRINGS.en['k_' + kd], 'type name ' + kd);
for (const m of app.matchAll(/\$\('([A-Za-z0-9_]+)'\)/g)) ok(html.includes(`id="${m[1]}"`), 'element ' + m[1]);
ok(!html.includes('canvas-label-guard'), 'no label guard');
{ const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique: ' + ids.filter((x, i) => ids.indexOf(x) !== i)); }
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/conic-sections/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS conic-sections core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
