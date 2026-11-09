'use strict';
// Vectors (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const html0 = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const sliderRange = id => { const m = html0.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); const [mn, mx, st, val] = m.slice(1).map(Number); const out = []; for (let v = mn; v <= mx + 1e-9; v += st) out.push(Math.round(v * 1e6) / 1e6); return { vals: out, val, mn, mx, st }; };

// ---- step 0: components, magnitude, direction ----
const AX = sliderRange('ax0'), AY = sliderRange('ay0'), BX = sliderRange('bx1'), BY = sliderRange('by1');
for (const x of AX.vals) for (const y of AY.vals) {
  const a = M.v(x, y);
  near(M.mag(a) ** 2, x * x + y * y, 1e-9, 'Pythagoras');
  if (x || y) { const d = M.dirDeg(a), back = M.polar(M.mag(a), d); near(back.x, x, 1e-9, 'polar round trip x'); near(back.y, y, 1e-9, 'polar round trip y'); ok(d >= 0 && d < 360, 'direction in [0, 360)'); }
  else ok(M.dirDeg(a) === null, 'zero vector has no direction');
  // moving the start point does not change end − start (s0hint)
  for (const p of [M.v(0, 0), M.v(-7, -5), M.v(2, -6), M.v(-8, 2), M.v(4, -2)]) { const q = M.add(p, a), d = M.sub(q, p); ok(d.x === x && d.y === y, 'free vector'); }
}
near(M.dirDeg(M.v(3, 2)), 33.69, 0.005, 'default direction');
// ---- step 1: addition ----
for (const ax of AX.vals) for (const ay of AY.vals) for (const bx of BX.vals) for (const by of BY.vals) {
  const a = M.v(ax, ay), b = M.v(bx, by), s = M.add(a, b);
  ok(s.x === ax + bx && s.y === ay + by, 'componentwise');
  const r = M.add(b, a); ok(r.x === s.x && r.y === s.y, 'commutative');
  const lhs = M.mag(s), rhs = M.mag(a) + M.mag(b);
  ok(lhs <= rhs + 1e-9, 'triangle inequality');
  // equality exactly when one is a non-negative multiple of the other (relEq)
  const same = M.cross(a, b) === 0 && M.dot(a, b) >= 0;
  ok((Math.abs(rhs - lhs) < 1e-9) === same, 'equality iff same direction');
  ok(Math.abs(s.x) <= 12 && Math.abs(s.y) <= 9, 'sum inside the plotted plane');
}
ok(Math.abs(M.mag(M.add(M.v(3, 2), M.v(3, 2))) - 2 * M.mag(M.v(3, 2))) < 1e-12, 's1hint example b = (3, 2) gives equality');
// ---- step 2: scaling and subtraction ----
for (const k of sliderRange('k2').vals) for (const ax of AX.vals) for (const ay of AY.vals) {
  const a = M.v(ax, ay), ka = M.scale(k, a);
  near(M.mag(ka), Math.abs(k) * M.mag(a), 1e-9, '|k a| = |k||a|');
  if (k && (ax || ay)) { near(M.cross(a, ka), 0, 1e-9, 'k a on the line of a'); ok((M.dot(a, ka) > 0) === (k > 0), 'direction flips for k < 0'); }
  ok(Math.abs(ka.x) <= 12 && Math.abs(ka.y) <= 9, 'k·a inside plane');
}
for (const ax of AX.vals) for (const ay of AY.vals) for (const bx of BX.vals) for (const by of BY.vals) {
  const a = M.v(ax, ay), b = M.v(bx, by), d = M.sub(a, b), d2 = M.add(a, M.scale(-1, b)), back = M.add(b, d);
  ok(d.x === d2.x && d.y === d2.y && back.x === ax && back.y === ay, 'a − b = a + (−b); b + (a − b) = a');
}
// ---- step 3: decomposition ----
const CX = sliderRange('cx3'), CY = sliderRange('cy3'), S3 = sliderRange('s3'), T3 = sliderRange('t3');
for (const cx of CX.vals) for (const cy of CY.vals) {
  const c = M.v(cx, cy), sol = M.decompose(c, M.BASIS.e1, M.BASIS.e2);
  near(sol.s, (2 * cx - cy) / 4, 1e-12, 's formula in s3e'); near(sol.t, cy / 2, 1e-12, 't formula');
  const m = M.add(M.scale(sol.s, M.BASIS.e1), M.scale(sol.t, M.BASIS.e2)); near(m.x, cx, 1e-12, 'reaches c x'); near(m.y, cy, 1e-12, 'reaches c y');
  // the solution is on the slider grid, so the solve button lands exactly
  ok(S3.vals.some(v => Math.abs(v - sol.s) < 1e-9) && T3.vals.some(v => Math.abs(v - sol.t) < 1e-9), 'solution on slider grid');
  // uniqueness: no other grid pair reaches c
  let hits = 0; for (const s of S3.vals) for (const tt of T3.vals) { const q = M.add(M.scale(s, M.BASIS.e1), M.scale(tt, M.BASIS.e2)); if (Math.abs(q.x - cx) < 1e-9 && Math.abs(q.y - cy) < 1e-9) hits++; }
  ok(hits === 1, 'unique');
  // parallel e2: reachable iff cy = 0
  ok(M.decompose(c, M.BASIS.e1, M.BASIS.e2par) === null, 'parallel: no unique solution');
  let reach = false; for (const s of S3.vals) for (const tt of T3.vals) { const q = M.add(M.scale(s, M.BASIS.e1), M.scale(tt, M.BASIS.e2par)); if (Math.abs(q.y) > 1e-12) reach = true; if (Math.abs(q.x - cx) < 1e-9 && Math.abs(q.y - cy) < 1e-9) reach = reach; }
  ok(!reach, 'parallel combinations never leave the x-axis');
  if (cy === 0) ok(S3.vals.some(v => Math.abs(v - cx / 2) < 1e-9), 'manySol3 example on slider grid');
}
ok(M.cross(M.BASIS.e1, M.BASIS.e2) !== 0 && M.dot(M.BASIS.e1, M.BASIS.e2) !== 0, 'basis independent and not perpendicular');
// ---- step 4: dot product ----
for (const al of sliderRange('al4').vals) for (const be of sliderRange('be4').vals) for (const bl of sliderRange('bl4').vals) {
  const a = M.polar(4, al), b = M.polar(bl, be), th = M.between(a, b);
  near(M.dot(a, b), 4 * bl * Math.cos(th * M.DEG), 1e-9, 'two recipes agree');
  near(M.dot(a, b), M.mag(a) * M.projLen(b, a), 1e-9, 'a·b = |a| × projection');
  ok(th >= 0 && th <= 180 + 1e-9, 'angle range');
  ok(Math.abs(M.dot(a, b)) <= 20 + 1e-9, 'fits the ±20 axis');
  const diff = ((be - al) % 360 + 360) % 360;
  if (diff === 90 || diff === 270) near(M.dot(a, b), 0, 1e-9, 'perpendicular ⇒ 0');
  if (Math.abs(M.dot(a, b)) > 1e-9) ok((M.dot(a, b) > 0) === (th < 90), 'sign matches angle');
}
// ---- step 5: crosswind ----
for (const w of sliderRange('w5').vals) {
  const p = M.aimHeading(w), f = M.flight(p, w);
  near(f.ground.x, 0, 1e-9, 'aimed: no east component'); near(f.drift, 0, 1e-9, 'aimed: no drift');
  near(f.speed, Math.sqrt(200 * 200 - w * w), 1e-9, 'ground speed √(200² − w²)');
  ok(p <= 0 && p >= -30, 'aim inside slider range');
  const z = M.flight(0, w); near(z.drift, 1.5 * w, 1e-9, 'heading 0: drift = wind × 1.5 h'); near(z.hours, 1.5, 1e-12, '1.5 h');
  for (const ph of sliderRange('ph5').vals) { const g = M.flight(ph, w); ok(Math.abs(g.drift) <= 190 && g.ground.y > 0, 'track on map'); ok(Math.abs(g.ground.x) <= 130, 'triangle on plot'); }
}
near(M.flight(0, 80).drift, 120, 1e-9, 's5hint 120 km'); both('s5hint', '120');
both('aimOk', '0.5');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['dirFmt', 'formula', 'e2Name', 'lgKA', 'lgDiff']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '向量 · 有方向的量' : 'Vectors · Quantities With a Direction'), 'footer names model and original');
for (const l of ['zh', 'en']) ok(STRINGS[l].compare.includes(l === 'zh' ? '对照另一版本：向量 · 有方向的量' : 'Vectors · Quantities With a Direction'), 'compare link text');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['ax0', 'ay0', 'move0', 'bx1', 'by1', 'other1', 'k2', 'cx3', 'cy3', 's3', 't3', 'solve3', 'par3', 'checkQuiz', 'al4', 'be4', 'bl4', 'sweep4', 'w5', 'ph5', 'aim5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
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
ok(fs.existsSync(path.join(dir, '../../../math/linear-algebra/vectors/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS vectors core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
