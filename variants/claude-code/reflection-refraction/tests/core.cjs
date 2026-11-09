'use strict';
// Reflection & refraction (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const asinD = x => Math.asin(x) * 180 / Math.PI, sinD = d => Math.sin(d * Math.PI / 180);

// ---- step 0: law of reflection; the angle to the mirror is 90° minus it ----
for (let a = 0; a <= 85; a++) { ok(M.reflect(a) === a, 'reflection = incidence ' + a); }

// ---- step 1: every ray obeys the law on its own facet; smooth = parallel, rough = spread ----
for (let r = 0; r <= 1.0001; r += 0.05) for (let th = 10; th <= 40; th++) {
  const B = M.beam(th, r);
  ok(B.lawErr < 1e-9, `law on each facet r=${r} th=${th}`);
  ok(B.rays.every(q => q.escaped && q.hits.length >= 1), 'every ray hits and leaves upward');
  ok(B.rays.every(q => q.hits.every(h => Math.abs(h.tilt) < 20)), 'facet tilt below 20°');
  ok((B.spread < 0.05) === (r < 1e-9), `"spread 0" note only on the smooth surface r=${r} th=${th}`);
  if (r < 1e-9) B.rays.forEach(q => near(q.out, th, 1e-9, 'smooth surface: out = in'));
  if (r > 0.999) ok(B.spread > 25, 'rough paper fans out widely: ' + B.spread);
}

// ---- step 2: Snell, air → water / glass ----
for (const [a, n] of [[30, 1.33], [50, 1.33], [80, 1.33], [45, 1.5]]) near(M.snell(1, n, a).theta2, asinD(sinD(a) / n), 1e-12, `snell ${a} ${n}`);
near(M.snell(1, 1.33, 40).theta2, 28.9, 0.05, 'default readout 28.9°');
for (const n of [M.N_WATER, M.N_GLASS]) {
  let prevGap = -1;
  for (let a = 1; a <= 85; a++) {
    const b = M.snell(M.N_AIR, n, a).theta2;
    ok(b < a, 'bends toward the normal (below the diagonal)');
    ok(a - b > prevGap, 'gap grows with incidence'); prevGap = a - b;
    near(sinD(a) / sinD(b), n / M.N_AIR, 1e-9, 'sin ratio = n2/n1');
    if (n === M.N_WATER) ok(M.snell(M.N_AIR, M.N_GLASS, a).theta2 < b, 'glass bends more than water');
  }
}
ok(M.snell(1, 1.33, 0).theta2 === 0, '0° goes straight');
ok(M.snell(1, 1.33, 85).theta2 < 48.8, 'curve stays below the critical angle');

// ---- step 3: water → air; critical angle and total internal reflection ----
const crit = M.critical(M.N_WATER, M.N_AIR);
near(crit, asinD(1 / 1.33), 1e-12, 'θc = arcsin(1/1.33)'); ok(crit.toFixed(1) === '48.8', 'θc shown as 48.8°');
ok(M.critical(1, 1.33) === null && M.critical(1.33, 1.33) === null, 'no critical angle into a denser or equal medium');
ok(M.snell(1.33, 1, crit).type === 'grazing' && M.snell(1.33, 1, crit).theta2 === 90, 'exactly critical → 90° grazing ray');
for (let a = 0; a <= 85; a += 0.1) {
  const q = M.snell(1.33, 1, a);
  if (a < crit - 1e-6) {
    ok(q.type === 'refract' && (a === 0 ? q.theta2 === 0 : q.theta2 > a), 'bends away from the normal');
    near(M.snell(1, 1.33, q.theta2).theta2, a, 1e-9, 'reversible path');
  } else if (a > crit + 1e-6) ok(q.type === 'tir' && q.theta2 === null && q.s > 1, 'past critical: no refracted ray');
}
ok(M.snell(1.33, 1, 48.7).type === 'refract' && M.snell(1.33, 1, 48.8).type === 'tir', 'slider neighbours of θc');
near(M.snell(1.33, 1, 60).s, 1.33 * sinD(60), 1e-12, 'sin θ2 asked for at 60°');

// ---- step 4: glass rod ----
near(M.acceptance(1.5, 1.0), 90, 0, 'air outside: every angle trapped');
near(M.acceptance(1.5, 1.33), asinD(Math.sqrt(1.5 ** 2 - 1.33 ** 2)), 1e-12, 'water outside acceptance');
ok(M.acceptance(1.5, 1.33).toFixed(1) === '43.9', 'hint quotes 43.9°');
ok(M.acceptance(1.5, 1.46).toFixed(1) === '20.1' && M.acceptance(1.5, 1.46) < M.acceptance(1.5, 1.33), 'cladding limit is smaller');
for (const o of [M.N_AIR, M.N_WATER, M.N_CLAD]) for (let a = 0; a <= 80; a++) for (const len of [3, 6.1, 13.6]) {
  const r = M.rod(a, M.N_GLASS, o, len), acc = M.acceptance(M.N_GLASS, o);
  ok(r.trapped === (a < acc - 1e-9) || (acc >= 90 && r.trapped), `trapped iff below acceptance ${o} ${a}`);
  ok(r.trapped === (r.wall > r.crit), 'trapped iff wall angle > critical');
  near(Math.sin(r.thC * Math.PI / 180) * 1.5, sinD(a), 1e-12, 'end-face Snell');
  ok(r.pts.every(p => Math.abs(p.y) <= 0.5 + 1e-9 && p.x <= len + 1e-9), 'path stays inside the rod');
  if (r.trapped) ok(r.bounces === r.pts.filter(p => Math.abs(Math.abs(p.y) - 0.5) < 1e-9).length, 'bounce count = wall contacts');
  else { ok(r.escape && r.escape.theta >= r.wall, 'escaping ray bends away from the wall normal'); ok(r.pts.length === 2, 'leaks at the first wall'); }
}

// ---- step 5: apparent depth ----
let prev = Infinity;
for (let X = 0; X <= 3.0001; X += 0.05) {
  const v = M.fishView(X);
  ok(v.apparent < M.FISH.d, 'looks shallower');
  ok(v.apparent <= prev + 1e-12, 'more slanted view → shallower'); prev = v.apparent;
  if (!v.limit) {
    near(M.FISH.n * sinD(v.thW), sinD(v.thA), 1e-9, 'Snell at the exit point');
    near(v.apparent, v.s / Math.tan(v.thA * Math.PI / 180), 1e-9, 'backward extension meets the vertical line');
    ok(v.s > 0 && v.s < X, 'exit point between fish and eye');
  }
}
near(M.fishView(0).apparent, 1.2 / 1.33, 1e-12, 'overhead limit d/n');
near(M.fishView(0.001).apparent, M.fishView(0).apparent, 1e-4, 'limit is continuous');
const quarter = 1 - 1 / 1.33; ok(quarter > 0.24 && quarter < 0.26, '"about a quarter shallower" overhead');
near(M.fishView(1.5).ratio, 0.64, 0.005, 'default readout ratio 0.64');

// ---- step 6: quiz ----
const Q = M.quiz();
ok(Q.q1 === 55, 'q1 = 55°'); ok(Math.round(Q.q2) === 28, 'q2 ≈ 28°'); near(1.5 * sinD(Q.q2), sinD(45), 1e-12, 'q2 obeys Snell');
ok(Q.q3 === 'tir' && 50 > Q.q3crit, 'q3: total internal reflection');
for (const l of ['zh', 'en']) { ok(STRINGS[l].q1b === '55°', 'q1 option b'); ok(/28/.test(STRINGS[l].q2a), 'q2 option a'); }

// ---- text that quotes numbers ----
for (const l of ['zh', 'en']) {
  ok(STRINGS[l].s3e.includes('{crit}') && STRINGS[l].s4hint.includes('{w}'), 'static numbers come from the model');
  ok(STRINGS[l].s2e.includes('1.33') && STRINGS[l].s2e.includes('1.50') && M.N_WATER === 1.33 && M.N_GLASS === 1.5, 'indices quoted = model');
  ok(STRINGS[l].s4e.includes('1.46') && M.N_CLAD === 1.46, 'cladding index quoted = model');
  ok(STRINGS[l].c5title.includes('{d}') && STRINGS[l].c5title.includes('{h}'), 'scene sizes from the model');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['preset30', 'preset60', 'q1a', 'q1b', 'q1c', 'q2b', 'p30', 'p60', 'lbTh1', 'lbTh2', 's2lgS1', 's2lgS2', 'acceptDeg', 'unitM']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/\[\s*'q\d', '([A-Za-z0-9]+)', '([A-Za-z0-9]+)'/g)) ok(STRINGS.zh[m[1]] && STRINGS.zh[m[2]], 'quiz keys');
for (const id of ['i0', 'p0a', 'p0b', 'p0c', 'g1', 'b1', 'smooth1', 'rough1', 'i2', 'mWater', 'mGlass', 'sweep2', 'i3', 'p3a', 'p3b', 'p3c', 'sweep3', 'a4', 'oAir', 'oWater', 'oClad', 'x5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/optics/reflection-refraction/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS reflection-refraction core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · θc ${crit.toFixed(3)}°`);
