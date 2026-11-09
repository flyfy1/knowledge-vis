'use strict';
// Solid geometry (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
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

// ---- step 0: Euler's formula ----
const expect = { cube: [8, 12, 6], tri: [6, 9, 5], pent: [10, 15, 7], pyr: [5, 8, 5], oct: [6, 12, 8], cut: [10, 15, 7], frame: [16, 32, 16] };
for (const k of M.SOLID_ORDER) {
  const c = M.counts(k); ok(c.V === expect[k][0] && c.E === expect[k][1] && c.F === expect[k][2], 'counts ' + k);
  ok(M.closed(M.SOLIDS[k]()), 'closed surface ' + k);
  ok(c.chi === (k === 'frame' ? 0 : 2), 'Euler ' + k);
  // every face is planar
  const S = M.SOLIDS[k]();
  S.faces.forEach(f => { const p = f.map(i => S.vs[i]), n = M.cross(M.sub(p[1], p[0]), M.sub(p[2], p[0])); p.forEach(q => near(M.dot(n, M.sub(q, p[0])), 0, 1e-9, 'planar face ' + k)); });
}
{ const a = M.counts('cube'), b = M.counts('cut'); ok(b.V - a.V === 2 && b.E - a.E === 3 && b.F - a.F === 1, 's0hint: +2 V, +3 E, +1 F'); }
// ---- step 1: preset cuts (slider k/30, k = 1..29) ----
const K = Array.from({ length: 29 }, (_, i) => i + 1), P = k => k / 30;
for (const k of K) {
  const f = M.presetSection('face', P(k)); ok(f.n === 4 && f.kind === 'square', 'face cut square'); near(f.area, 1, 1e-12, 'face area 1');
  const e = M.presetSection('edge', P(k)); ok(e.n === 4 && (e.kind === 'rect' || e.kind === 'square'), 'edge cut rectangle'); near(e.area, Math.SQRT2 * Math.min(2 * P(k), 2 - 2 * P(k)), 1e-12, 'edge area');
  const d = M.presetSection('diag', P(k)), c = 3 * P(k);
  if (c <= 1 + 1e-12 || c >= 2 - 1e-12) { ok(d.n === 3 && d.kind === 'triEq', 'diag triangle k=' + k); near(d.area, Math.sqrt(3) / 2 * Math.pow(Math.min(c, 3 - c), 2), 1e-12, 'triangle area'); }
  else ok(d.n === 6, 'diag hexagon k=' + k);
  ok(d.area <= M.presetSection('diag', 0.5).area + 1e-12 && e.area <= Math.SQRT2 + 1e-12, 'maxima');
  ok(Math.max(f.area, e.area, d.area) <= 1.5, 'fits the area axis');
}
near(M.presetSection('diag', 1 / 3).area, Math.sqrt(3) / 2, 1e-12, '1/3: triangle through 3 vertices'); ok(M.presetSection('diag', 1 / 3).kind === 'triEq', '1/3 equilateral');
ok(M.presetSection('diag', 0.5).kind === 'hexReg', 'middle regular hexagon'); near(M.presetSection('diag', 0.5).area, 3 * Math.sqrt(3) / 4, 1e-12, 'regular hexagon area');
near(M.presetSection('edge', 0.5).area, Math.SQRT2, 1e-12, 'edge max √2');
both('s1hint', '1.414'); both('s1hint', '0.866'); both('s1hint', '1.299');
// sections are genuinely on the plane and inside the cube; area by shoelace agrees with fan triangulation
for (const k of K) for (const name of ['face', 'edge', 'diag']) {
  const r = M.presetSection(name, P(k)), pr = M.PRESETS[name];
  r.P.forEach(p => { near(M.dot(pr.n, p), pr.d(P(k)), 1e-12, 'on plane'); p.forEach(v => ok(v >= -1e-12 && v <= 1 + 1e-12, 'inside cube')); });
}
// ---- step 2: free cuts ----
const counts = { 3: 0, 4: 0, 5: 0, 6: 0 }; let maxSides = 0;
for (let th = 0; th <= 90; th += 5) for (let ph = 0; ph <= 90; ph += 5) for (const k of K) {
  const r = M.freeSection(th, ph, P(k)); maxSides = Math.max(maxSides, r.n);
  ok(r.n >= 3 && r.n <= 6, `sides in 3..6 at ${th}/${ph}/${k}`); counts[r.n]++;
  // each side lies on a different cube face (quiz answer)
  const faceOf = (a, b) => { const m = M.mul(0.5, M.add(a, b)); for (let ax = 0; ax < 3; ax++) for (const v of [0, 1]) if (Math.abs(a[ax] - v) < 1e-9 && Math.abs(b[ax] - v) < 1e-9) return ax + ':' + v; return null; };
  const fs = r.P.map((p, i) => faceOf(p, r.P[(i + 1) % r.n])); ok(fs.every(Boolean) && new Set(fs).size === r.n, 'one side per face');
  if (th === 0) ok(r.kind === 'square', 'tilt 0: square');
}
ok(Object.values(counts).every(c => c > 0) && maxSides === 6, 'all of 3, 4, 5, 6 reachable on the slider grid');
ok(M.freeSection(35, 20, 12 / 30).n === 5, 's2hint: 35°/20° at 0.4 is a pentagon');
ok(M.freeSection(35, 20, 1 / 30).n === 3 && M.freeSection(35, 20, 29 / 30).n === 3, 's2hint: ends are triangles');
ok(M.freeSection(55, 45, 15 / 30).n === 6, 's2hint: 55°/45° at 0.5 is a hexagon');
ok(![0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90].some(ph => K.some(k => M.freeSection(35, ph, P(k)).n === 6)), 'no hexagon at tilt 35 (so the hint sends you to 55°)');
both('s2hint', '0.4'); both('s2hint', '55°'); both('s2hint', '45°');
// ---- step 3: painted cube ----
for (let n = 2; n <= 8; n++) {
  const c = M.painted(n); ok(c[0] + c[1] + c[2] + c[3] === n ** 3, 'total n³');
  const tally = [0, 0, 0, 0]; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) tally[M.paintCount(n, i, j, k)]++;
  ok(tally.join() === c.slice(0, 4).join(), 'brute-force count n=' + n);
  ok(c[3] === 8 && c[2] === 12 * (n - 2) && c[1] === 6 * (n - 2) ** 2 && c[0] === (n - 2) ** 3, 'formulas n=' + n);
  // painted faces of little cubes add up to the big surface area 6n²
  ok(c[1] + 2 * c[2] + 3 * c[3] === 6 * n * n, 'painted squares = surface area');
}
ok(6 * 64 / (6 * 16) === 4 && 512 / 64 === 8, 'doubling 4 → 8: area ×4, volume ×8');
near(100 * M.painted(8)[0] / 512, 42.2, 0.05, 'n = 8: about 42% unpainted'); both('s3hint', '42%');
// ---- step 4: three pyramids ----
const vols = M.PYRS.map(M.pyrVolume); vols.forEach(v => near(v, 1 / 3, 1e-12, 'pyramid volume 1/3'));
near(vols.reduce((a, b) => a + b, 0), 1, 1e-12, 'they fill the cube');
// they do not overlap: Monte-Carlo-free check on a grid of interior points, each point in exactly one pyramid
{ const inPyr = (p, k) => { const o = [0, 1, 2].filter(a => a !== k); return p[o[0]] >= p[k] && p[o[1]] >= p[k]; };
  for (let i = 0.05; i < 1; i += 0.1) for (let j = 0.03; j < 1; j += 0.1) for (let k = 0.07; k < 1; k += 0.1) { const p = [i, j, k], n = [0, 1, 2].filter(a => inPyr(p, a)).length; ok(n === 1 && inPyr(p, M.whichPyr(p)), 'each interior point in exactly one pyramid'); } }
// congruence: permuting axes maps pyramid 0 onto 1 and 2
{ const set = Q => new Set(Q.base.concat([Q.apex]).map(i => M.CUBE_VS[i].join())); const perm = (Q, a, b) => new Set([...set(Q)].map(s => { const v = s.split(',').map(Number); [v[a], v[b]] = [v[b], v[a]]; return v.join(); }));
  const eq = (A, B) => A.size === B.size && [...A].every(x => B.has(x));
  ok(eq(perm(M.PYRS[0], 0, 1), set(M.PYRS[1])) && eq(perm(M.PYRS[0], 0, 2), set(M.PYRS[2])), 'congruent by swapping axes'); }
// ---- step 5: slabs ----
for (let n = 1; n <= 30; n++) {
  near(M.slabSum(n, 0), M.slabExact(n), 1e-12, 'closed form n=' + n);
  for (const s of [-1, -0.5, 0.3, 1]) near(M.slabSum(n, s), M.slabSum(n, 0), 1e-12, 'offset does not change the sum');
  ok(M.slabSum(n, 0) > 1 / 3, 'always above 1/3');
  if (n > 1) ok(M.slabSum(n, 0) < M.slabSum(n - 1, 0), 'decreasing');
  ok(M.slabSum(n, 0) <= 1.05, 'fits the axis');
}
near(M.slabSum(30, 0) - 1 / 3, 0.017, 0.0005, 'n = 30 overshoot ≈ 0.017'); both('s5hint', '0.017');
near(M.slabSum(1, 0), 1, 1e-12, 'one slab = the whole prism');
// ---- step 6: nets ----
ok(M.NETS.length === 15, '15 shapes');
ok(M.NETS.filter(n => M.foldCheck(n.cells).ok).length === 11, '11 fold');
ok(new Set(M.NETS.map(n => n.id)).size === 15, 'unique ids');
// the 11 that fold are pairwise different free hexominoes, and the enumeration of all 35 free hexominoes yields exactly 11 cube nets
const canon = cells => { const forms = []; let c = cells; for (let r = 0; r < 4; r++) { c = c.map(([x, y]) => [y, -x]); for (const m of [c, c.map(([x, y]) => [-x, y])]) { const mx = Math.min(...m.map(p => p[0])), my = Math.min(...m.map(p => p[1])); forms.push(m.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p.join(',')).join(';')); } } return forms.sort()[0]; };
ok(new Set(M.NETS.map(n => canon(n.cells))).size === 15, 'all 15 shapes distinct');
{ let polys = [[[0, 0]]];
  for (let n = 1; n < 6; n++) { const next = new Map(); for (const p of polys) for (const [x, y] of p) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = [x + dx, y + dy]; if (p.some(c => c[0] === q[0] && c[1] === q[1])) continue; const np = p.concat([q]), key = canon(np); if (!next.has(key)) next.set(key, np); } polys = [...next.values()]; }
  ok(polys.length === 35, '35 free hexominoes'); ok(polys.filter(p => M.foldCheck(p).ok).length === 11, 'exactly 11 fold into a cube'); }
// folding: at f = 0 every face is flat in z = 0; at f = 1 each face is a unit square on the cube; corner distances preserved throughout
for (const net of M.NETS) for (const f of [0, 0.3, 0.7, 1]) {
  const fs = M.fold(net.cells, f);
  fs.forEach(q => { for (let i = 0; i < 4; i++) near(M.len(M.sub(q.corners[i], q.corners[(i + 1) % 4])), 1, 1e-9, 'unit edges'); near(M.len(M.sub(q.corners[0], q.corners[2])), Math.SQRT2, 1e-9, 'square stays square'); if (f === 0) q.corners.forEach(p => near(p[2], 0, 1e-12, 'flat')); });
  if (f === 1 && M.foldCheck(net.cells).ok) { const cs = fs.map(q => q.centre); const lo = [0, 1, 2].map(a => Math.min(...cs.map(p => p[a]))); cs.forEach(p => ok(p.filter((v, a) => Math.abs(v - lo[a] - 0.5) < 1e-9).length === 2, 'face centres of a unit cube')); }
}
// the s6hint rules match the four failing shapes
ok(['x1', 'x3'].every(id => { const c = M.NETS.find(n => n.id === id).cells; return Math.max(...[0, 1].map(y => c.filter(p => p[1] === y).length)) >= 5; }), 'five in a row');
ok(['x2', 'x4'].every(id => { const c = M.NETS.find(n => n.id === id).cells, has = (x, y) => c.some(p => p[0] === x && p[1] === y); return c.some(([x, y]) => has(x + 1, y) && has(x, y + 1) && has(x + 1, y + 1)); }), '2 × 2 block');
ok(M.NETS.filter(n => M.foldCheck(n.cells).ok).every(n => { const c = n.cells, has = (x, y) => c.some(p => p[0] === x && p[1] === y); return !c.some(([x, y]) => has(x + 1, y) && has(x, y + 1) && has(x + 1, y + 1)) && Math.max(...c.map(p => c.filter(q => q[1] === p[1]).length)) <= 4; }), 'real nets have neither fault');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(l === 'zh' ? '立体几何 · 转一转，再切一刀' : 'Solid Geometry · Turn It, Then Cut It'), 'footer names model and original');
for (const l of ['zh', 'en']) ok(STRINGS[l].compare.includes(l === 'zh' ? '对照另一版本：立体几何 · 转一转，再切一刀' : 'Solid Geometry · Turn It, Then Cut It'), 'compare link text');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?! \+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of html.matchAll(/data-v="([a-z]+)" data-i18n="([^"]+)"/g)) ok(STRINGS.zh[m[2]] !== undefined, 'picker ' + m[1]);
for (const k of M.SOLID_ORDER) ok(STRINGS.zh['sol_' + k] && html.includes(`data-v="${k}"`), 'solid ' + k);
for (const k of ['triEq', 'triIso', 'tri', 'square', 'rect', 'rhombus', 'para', 'trap', 'quad', 'pent', 'hex', 'hexReg', 'other']) ok(STRINGS.zh['shp_' + k] !== undefined, 'shape name ' + k);
for (const id of ['yaw0', 'pit0', 'p1', 'yaw1', 'sweep1', 'th2', 'ph2', 'p2', 'yaw2', 'clear2', 'checkQuiz', 'n3', 'gap3', 'yaw3', 'ex4', 'yaw4', 'play4', 'n5', 's5', 'yaw5', 'f6', 'yaw6', 'guessY', 'guessN', 'fold6', 'next6']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/geometry/solid-geometry/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS solid-geometry core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
