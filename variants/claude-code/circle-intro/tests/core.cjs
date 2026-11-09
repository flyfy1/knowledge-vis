'use strict';
// Circle (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- step 0: every footprint is r from the centre (all slider positions) ----
for (let r = 1; r <= 5; r += 0.5) for (let th = 0; th < 360; th += 5) near(M.dist(M.point(r, th)), r, 1e-12, 'footprint distance = r');
ok(360 / 5 === 72, '72 footprints, one every 5°');

// ---- step 1: chord; longest at 180° and equal to 2r; never longer ----
for (let r = 2; r <= 5; r += 0.5) {
  let best = 0, at = -1;
  for (let phi = 0; phi <= 360; phi += 5) { const c = M.chord(r, phi, 200); ok(c <= 2 * r + 1e-12, 'chord ≤ diameter'); if (c > best + 1e-12) { best = c; at = phi; } }
  ok(at === 180, 'longest chord at 180°'); near(best, 2 * r, 1e-12, 'longest chord = 2r');
  near(M.chord(r, 0, 200), 0, 1e-12, 'chord at 0° is 0'); near(M.chord(r, 360, 200), 0, 1e-12, 'chord at 360° is 0');
  for (let phi = 0; phi <= 180; phi += 5) near(M.chord(r, phi, 200), M.chord(r, 360 - phi, 200), 1e-12, 'rise and fall are mirror images');
}
near(M.chord(3, 70, 200), 3.44, 0.005, 'default readout: AB = 3.44 cm at r = 3, 70°');

// ---- step 2: rolled length; C ÷ d is the same for every wheel and is "a little over 3" ----
const q2 = [];
for (let d = 1; d <= 5; d += 0.5) {
  near(M.rolled(d, 1), M.rimLength(d), 1e-12, 'one turn lays down the rim');
  near(M.rolled(d, 0.5), M.rimLength(d) / 2, 1e-12, 'half a turn lays down half');
  q2.push(M.rimLength(d) / d);
}
for (const q of q2) { near(q, q2[0], 1e-12, 'C ÷ d same for every d'); ok(q > 3 && q < 3.2, 'a little over 3'); ok(q.toFixed(4) === '3.1416', 'shown as 3.1416'); }
near(q2[0], Math.PI, 1e-6, '4096-piece rim measure matches π');

// ---- step 3: polygons trap π; inner rises, outer falls; doubling sequence exists ----
let prev = null;
for (const n of M.N_LIST) {
  const q = M.polyRatios(n);
  ok(q.inner < Math.PI && Math.PI < q.outer, `π trapped at n = ${n}`);
  near(q.inner, n * Math.sin(Math.PI / n), 1e-12, 'inner from coordinates = n sin(π/n)');
  near(q.outer, n * Math.tan(Math.PI / n), 1e-12, 'outer from coordinates = n tan(π/n)');
  if (prev) { ok(q.inner > prev.inner, 'inner rises'); ok(q.outer < prev.outer, 'outer falls'); ok(q.gap < prev.gap, 'window narrows'); }
  prev = q;
}
for (const n of [6, 12, 24, 48, 96]) ok(M.N_LIST.includes(n), 'doubling sequence on the slider: ' + n);
ok(M.polyRatios(6).inner.toFixed(4) === '3.0000', 'hexagon inside = 3 exactly');
ok(M.polyRatios(96).inner.toFixed(4) === '3.1410' && M.polyRatios(96).outer.toFixed(4) === '3.1427', '96-gon window 3.1410–3.1427');
ok(M.polyRatios(3).outer > 3.7 && M.polyRatios(4).outer > 3.7 && M.polyRatios(5).outer < 3.7, 'only n = 3, 4 run off the top of the chart');

// ---- step 4: squares bound the area; gap narrows overall ----
const gaps = {};
for (let r = M.R_GRID.min; r <= M.R_GRID.max; r++) {
  const g = M.gridCells(r);
  ok(g.inside <= Math.PI * r * r && Math.PI * r * r <= g.touch, `π r² between the counts at r = ${r}`);
  ok(g.cells.length === 4 * r * r, 'grid is 2r × 2r');
  ok(g.partial === g.touch - g.inside && g.partial > 0, 'some squares are partly inside');
  // brute-force check of each square's state with a fine sample
  if (r <= 6) for (const c of g.cells) {          // brute-force: sample each square on a 41 × 41 lattice
    let any = false, all = true;
    for (let a = 0; a <= 40; a++) for (let b = 0; b <= 40; b++) { const h = Math.hypot(c.i + a / 40, c.j + b / 40); any = any || h < r - 1e-9; all = all && h <= r + 1e-9; }
    ok((c.state === 2) === all, 'inside state');
    if (any) ok(c.state >= 1, 'a square with a sample inside counts as touching');
    if (c.state === 0) ok(!any, 'an untouched square has no sample inside');
  }
  gaps[r] = g.hi - g.lo;
}
for (let r = M.R_GRID.min; r + 4 <= M.R_GRID.max; r++) ok(gaps[r + 4] < gaps[r], `gap narrows overall (r = ${r} → ${r + 4})`);
ok(gaps[20] < gaps[2] / 4, 'gap at r = 20 is a small fraction of r = 2');
{ const g = M.gridCells(4); ok(g.inside === 32 && g.touch === 60, 'default r = 4: 32 green, 28 orange'); }

// ---- step 5: staircase = π r² (n + 1) / n; extra = triangle / n; triangle = π r² ----
for (let n = 2; n <= 30; n++) {
  const s = M.strips(M.R_ONION, n), A = Math.PI * M.R_ONION ** 2;
  near(s.triangle, A, 1e-5, 'triangle = π r²');
  near(s.area, A * (n + 1) / n, 1e-5, 'staircase area');
  near(s.extra, s.triangle / n, 1e-5, 'extra = triangle / n');
  ok(s.list.length === n && s.list[0].len > s.list[n - 1].len, 'stacked longest first');
  if (n > 2) ok(s.extra < M.strips(M.R_ONION, n - 1).extra, 'extra shrinks as n grows');
}

// ---- step 6: round trips ----
for (const v of [0.1, 1, 5, 12.5, 1000]) for (const k of ['r', 'd', 'C', 'A']) {
  const q = M.fromKnown(k, v);
  near(q[k], v, 1e-9 * Math.max(1, v), 'round trip ' + k);
  near(q.d, 2 * q.r, 1e-12, 'd = 2r'); near(q.C, Math.PI * q.d, 1e-9, 'C = πd'); near(q.A, Math.PI * q.r * q.r, 1e-9, 'A = πr²');
  const e = M.fromKnown(k, v, 3.14);
  near(e[k], v, 1e-9 * Math.max(1, v), '3.14 version keeps the given value');
  for (const key of ['r', 'd', 'C', 'A']) ok(Math.abs(e[key] - q[key]) <= 0.0011 * q[key], 'π vs 3.14 differ by about 0.05% ("only a hair")');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula', 's3lgPi']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(/圆的认识 · 圆规、半径与 π|The Circle · Compass, Radius and π/.test(STRINGS[l].foot), 'footer names the original'); }
ok(STRINGS.zh.compare.startsWith('对照另一版本：圆的认识 · 圆规、半径与 π'), 'compare link text');

// ---- every key referenced in HTML/app exists; controls; structure ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['r0', 'th0', 'go0', 'clr0', 'r1', 'p1', 'd2', 'u2', 'roll2', 'clr2', 'n3', 'dbl3', 'r4', 'n5', 'peel5', 'v6']) ok(html.includes(`id="${id}"`), 'control ' + id);
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
ok(!/canvas-label-guard/.test(html + app), 'no canvas-label-guard');
ok(/<meta name="stage" content="primary">/.test(html) && /<meta name="category" content="math">/.test(html), 'stage/category match the original');

// ---- links land on existing pages/anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../math/geometry/circle-intro/index.html')), 'comparison link target exists');

console.log(`PASS circle-intro core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
