'use strict';
// Similarity & scaling (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const grid = (lo, hi, step) => { const out = []; for (let v = lo; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000); return out; };

// ---- step 0: enlargement from O over the whole slider grid ----
const a0 = M.angles(M.QUAD);
near(a0.reduce((s, v) => s + v, 0), 360, 1e-9, 'quadrilateral angles add to 360°');
const s0 = M.sides(M.QUAD); for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) ok(Math.abs(s0[i] - s0[j]) > 0.02, 'no two sides equal');
a0.forEach(v => ok(Math.abs(v - 90) > 5, 'no right angles'));
for (const k of grid(0.25, 3, 0.05)) for (const ox of grid(0, 2, 0.1)) {
  const O = { x: ox, y: 0 }, img = M.dilatePoly(M.QUAD, O, k);
  M.ratios(img, M.QUAD).forEach(r => near(r, k, 1e-12, `side ratio = k at k=${k}`));
  M.angles(img).forEach((v, i) => near(v, a0[i], 1e-9, 'angles unchanged'));
  img.forEach((P, i) => { near(M.dist(O, P), k * M.dist(O, M.QUAD[i]), 1e-12, "OA' = k·OA"); ok(P.x > -1.3 && P.x < 6.9 && P.y > -0.4 && P.y < 5.0, 'image inside the drawn box'); });
}

// ---- step 1: stretching — similar exactly when kx = ky ----
for (const kx of grid(0.5, 2.5, 0.1)) for (const ky of grid(0.5, 2.5, 0.1)) {
  const S = M.stretch(M.QUAD, kx, ky), r = M.ratios(S, M.QUAD), sim = M.spread(r) < 1e-9;
  ok(sim === (Math.abs(kx - ky) < 1e-9), `similar iff kx = ky (${kx}, ${ky})`);
  if (!sim) ok(M.angles(S).some((v, i) => Math.abs(v - a0[i]) > 0.05), 'unequal stretch changes some angle (shown to 1 decimal)');
  if (!sim) ok(M.spread(r) >= 0.005, 'the ratio spread is visible at 2 decimals');
  S.forEach(P => ok(P.x > 0.7 && P.x < 4.1 && P.y > 0.25 && P.y < 3.45, 'stretched shape inside the drawn box'));
  r.forEach(v => ok(v > 0 && v < 2.8, 'bars fit the 0–2.8 axis'));
}

// ---- step 2: perimeter × k, area × k² ----
near(M.area(M.ELL), 3, 1e-12, 'L area 3'); near(M.perimeter(M.ELL), 8, 1e-12, 'L perimeter 8');
for (const k of grid(0.5, 3, 0.5)) {
  const S = M.scale(M.ELL, k);
  near(M.perimeter(S) / 8, k, 1e-12, 'perimeter ratio k'); near(M.area(S) / 3, k * k, 1e-12, 'area ratio k²');
  ok(k * k <= 9.6, 'area ratio fits the chart');
}
near(M.area(M.scale(M.ELL, 3)) / 3, 9, 1e-12, 'k = 3: area 9 times');

// ---- step 3: cubes ----
for (let k = 1; k <= 5; k++) {
  ok(M.cubeCount(k) === k ** 3 && M.layers(k).reduce((s, v) => s + v, 0) === k ** 3, 'layers add to k³');
  // count exposed unit faces of a k×k×k block directly
  let faces = 0; const inside = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < k && y < k && z < k;
  for (let x = 0; x < k; x++) for (let y = 0; y < k; y++) for (let z = 0; z < k; z++) for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) if (!inside(x + dx, y + dy, z + dz)) faces++;
  ok(faces === M.cubeSurface(k), 'surface = 6k² by counting faces');
}
assert.deepEqual([1, 2, 3, 4, 5].map(k => Math.round(M.cubeSurface(k) / M.cubeCount(k) * 100) / 100), [6, 3, 2, 1.5, 1.2]); checks++;

// ---- step 4: sighting ----
for (const D of grid(10, 120, 5)) for (const h of grid(1, 15, 0.5)) {
  const H = M.heightFromSighting(h, D);
  near(H, (h / 100) * (D / M.ARM), 1e-12, 'H = k·h');
  near(M.sightAngle(h / 100, M.ARM), M.sightAngle(H, D), 1e-9, 'same angle at the eye: the triangles are similar');
  ok(H <= 30 + 1e-9, 'height fits the drawing scale (≤ 30 m)');
}
near(M.heightFromSighting(10, 90), 15, 1e-12, 'default: 10 cm at 90 m → 15 m');

// ---- step 5: cutting ----
for (let m = 1; m <= 6; m++) {
  const c = M.cut(m);
  ok(c.pieces === m ** 3, 'pieces m³'); near(c.volume, 216, 1e-9, 'volume stays 216 cm³'); near(c.total, 216 * m, 1e-9, 'total surface = 216·m'); near(c.total / M.cut(1).total, m, 1e-12, 'm times the block');
  ok(c.total <= 1400, 'fits the chart');
}

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

for (const id of ['k0', 'o0', 'kx1', 'ky1', 'k2', 'k3', 'stack3', 'd4', 'h4', 'm5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/geometry/similarity-scaling/index.html')), 'comparison link target exists');
ok(STRINGS.zh.compare.includes('相似与缩放 · 长度、面积、体积各变几倍') && STRINGS.en.compare.includes('Similarity & Scaling · Lengths, Areas and Volumes Each Change Differently'), 'compare link names the original');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS similarity-scaling core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
