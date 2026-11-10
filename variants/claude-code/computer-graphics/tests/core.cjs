'use strict';
// Rendering-pipeline (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const sliderVals = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)"`)); const [lo, hi, st] = m.slice(1).map(Number), out = []; for (let v = lo; v <= hi + 1e-9; v += st) out.push(Math.round(v / st) * st); return out; };

// ---- step 0: homogeneous transforms ----
for (const a of sliderVals('rot')) for (const s of sliderVals('scl')) {
  // no move: both orders agree (s0hint)
  const A = M.compose('TRS', a * M.DEG, s, 0, 0), B = M.compose('RST', a * M.DEG, s, 0, 0);
  for (const p of M.SHAPE) { const P = M.apply(A, p), Q = M.apply(B, p); near(P[0], Q[0], 1e-12, 'no move: orders agree x'); near(P[1], Q[1], 1e-12, 'no move: orders agree y'); }
  for (const [tx, ty] of [[2, 0.5], [-1.3, 1.7], [0.4, -2]]) {
    const T = M.compose('TRS', a * M.DEG, s, tx, ty), R = M.compose('RST', a * M.DEG, s, tx, ty);
    // T·R·S moves the origin by exactly (tx, ty); R·S·T moves it by R·S·(tx, ty)
    const o1 = M.apply(T, [0, 0]), o2 = M.apply(R, [0, 0]);
    near(o1[0], tx, 1e-12, 'TRS moves by t'); near(o1[1], ty, 1e-12, 'TRS moves by t');
    const c = Math.cos(a * M.DEG), sn = Math.sin(a * M.DEG);
    near(o2[0], s * (c * tx - sn * ty), 1e-12, 'RST moves by R·S·t'); near(o2[1], s * (sn * tx + c * ty), 1e-12, 'RST moves by R·S·t');
    // the gap between the two images of any vertex is |R·S·t − t|
    const P = M.apply(T, [1, 0]), Q = M.apply(R, [1, 0]);
    near(Math.hypot(P[0] - Q[0], P[1] - Q[1]), Math.hypot(o2[0] - tx, o2[1] - ty), 1e-12, 'gap = |RSt − t|');
  }
}
// default view keeps every slider combination's shapes within ±6.6 (view is ±5; the canvas clips beyond)
{ let mx = 0; for (const a of sliderVals('rot')) for (const s of [0.5, 1.5]) for (const tx of [-2, 2]) for (const ty of [-2, 2]) for (const o of ['TRS', 'RST']) for (const p of M.SHAPE) { const q = M.apply(M.compose(o, a * M.DEG, s, tx, ty), p); mx = Math.max(mx, Math.abs(q[0]), Math.abs(q[1])); } ok(mx < 6.7, 'transformed extent ' + mx); }

// ---- step 1: perspective ----
both('s1e', '1.2 m'); both('s1hint', 'z ≥ f');
ok(appSrc.includes('const LAT = [-0.35, 0.25, 0.9]') && appSrc.includes('M.project(f, 0.12, z)'), 'app post positions and widths match the test');
ok(M.POST_H === 1.2 && M.POSTS.join() === '2,4,6', 'posts 1.2 m tall at 2, 4, 6 m');
for (const f of sliderVals('f')) for (const c of sliderVals('dolly')) {
  M.POSTS.forEach((z0, k) => { const z = z0 - c, h = 2 * M.project(f, 0.6, z); near(h * z, f * 1.2, 1e-12, 'image height × distance = f × 1.2'); ok(z >= f - 1e-9, 'posts stay beyond the image plane (z ≥ f)'); ok(h / 2 <= 0.75 + 1e-9 && Math.abs(M.project(f, [-0.35, 0.25, 0.9][k], z)) + M.project(f, 0.06, z) <= 0.75, 'image fits the ±0.75 m picture'); });
}
// s1hint: nearest post 2 m → 1 m doubles; farthest 6 m → 5 m grows by a fifth
near(M.project(1, 0.6, 1) / M.project(1, 0.6, 2), 2, 1e-12, 'doubles'); near(M.project(1, 0.6, 5) / M.project(1, 0.6, 6), 1.2, 1e-12, 'a fifth');
ok(sliderVals('dolly').includes(1), 'dolly reaches 1 m');
// similar-triangle check: the ray from the eye to the post top crosses the plane z = f at y′
for (const z of [0.5, 2, 6]) { const yTop = 0.6, f = 1.3; near(yTop * f / z, M.project(f, yTop, z), 1e-12, 'similar triangles'); }

// ---- step 2: rasterization ----
const TRI2 = [[0.12, 0.15], [0.88, 0.32], [0.40, 0.90]];
ok(appSrc.includes('[[0.12, 0.15], [0.88, 0.32], [0.40, 0.90]]'), 'app uses the tested default triangle');
const A2 = Math.abs(M.area(TRI2));
let mx24 = 0, mxSmall = 0;
for (const N of sliderVals('n')) {
  const n = M.count(M.rasterize(TRI2, N)), e = Math.abs(n / (N * N) - A2) / A2;
  if (N >= 24) mx24 = Math.max(mx24, e); else mxSmall = Math.max(mxSmall, e);
  // the inside test is exactly "all three edge functions ≥ 0"
  const lit = M.rasterize(TRI2, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const E = M.edgeValues(TRI2, [(i + 0.5) / N, (j + 0.5) / N]); ok(!!lit[j * N + i] === E.every(v => v >= 0), 'lit ⟺ all E ≥ 0'); }
}
ok(mx24 < 0.01, 'N = 24..48 within ±1%: ' + mx24); ok(mxSmall > 0.03, 'small N can be several per cent off: ' + mxSmall);
both('s2hint', '±1%');
// orientation does not matter (vertices are reordered counter-clockwise)
ok(M.count(M.rasterize([TRI2[0], TRI2[2], TRI2[1]], 20)) === M.count(M.rasterize(TRI2, 20)), 'clockwise input handled');
// edge function sign: left of a→b is positive
ok(M.edge([0, 0], [1, 0], [0.5, 0.5]) > 0 && M.edge([0, 0], [1, 0], [0.5, -0.5]) < 0, 'left is positive');

// ---- step 3: barycentric weights, depth buffer vs painter ----
for (let k = 0; k < 200; k++) {
  const p = [((k * 37) % 100) / 100, ((k * 61) % 100) / 100], w = M.bary(M.TRI_A, p);
  near(w[0] + w[1] + w[2], 1, 1e-12, 'weights sum to 1');
  const q = [0, 1].map(d => w[0] * M.TRI_A[0][d] + w[1] * M.TRI_A[1][d] + w[2] * M.TRI_A[2][d]);
  near(q[0], p[0], 1e-12, 'weights reproduce p'); near(q[1], p[1], 1e-12, 'weights reproduce p');
  ok(M.inside(M.TRI_A, p) === w.every(v => v >= -1e-12), 'inside ⟺ all weights ≥ 0');
}
both('s3e', '0.5');
let anyWrong = false;
for (const tilt of sliderVals('tilt')) for (const shift of sliderVals('shift')) {
  const c = M.compareMethods(40, tilt, shift);
  ok(c.aNear + c.bNear === c.both, 'overlap split');
  // the painter's algorithm is wrong only when the triangles pass through each other inside the overlap,
  // and then exactly on the pixels where the triangle it drew last is the farther one
  if (c.aNear === 0 || c.bNear === 0) ok(c.wrong === 0, `no interpenetration → painter correct (${tilt}, ${shift})`);
  else { ok(c.wrong === c.aNear || c.wrong === c.bNear, `painter gives the whole overlap to one triangle (${tilt}, ${shift})`); anyWrong = true; }
  // the z-buffer owner is the nearer triangle wherever both cover a pixel
  const zb = M.renderDepth(40, tilt, shift, 'zbuffer');
  for (let k = 0; k < 1600; k += 7) if (zb.owner[k]) ok(Number.isFinite(zb.depth[k]), 'depth stored');
}
ok(anyWrong, 'some slider settings interpenetrate');
{ const c = M.compareMethods(40, 0.8, 0.06); ok(c.aNear > 0 && c.bNear > 0 && c.wrong > 0, 'default interpenetrates and painter errs'); }
ok(M.compareMethods(40, 0.8, 0.4).bNear === 0 && M.compareMethods(40, 0.8, -0.4).aNear === 0, 'slider ends separate the triangles');

// ---- step 4: shading ----
for (const az of sliderVals('az')) for (const el of [-60, -20, 0, 20, 50, 80]) {
  const l = M.lightDir(az, el); near(Math.hypot(...l), 1, 1e-12, 'unit light');
  const px = M.renderSphere(64, l, 0, 0);
  // all pixels on the Lambert curve when ka = 0, p = 0
  for (let k = 0; k < px.length; k += 13) near(px[k].I, Math.max(0, px[k].ndl), 1e-12, 'Lambert');
  // moon phase: lit share of the visible disc ≈ (1 + cos γ)/2
  near(M.litFraction(px), (1 + l[2]) / 2, 0.012, `lit fraction az=${az} el=${el}`);
}
{ const px = M.renderSphere(64, M.lightDir(30, 10), 0.3, 0); px.forEach(q => { if (q.ndl <= 0) near(q.I, 0.3, 1e-12, 'ambient floor'); }); checks++; }
for (const p of [32, 64, 128]) { const l = M.lightDir(30, 20), a = M.renderSphere(64, l, 0, 0), b = M.renderSphere(64, l, 0, p); let up = 0; b.forEach((q, k) => { ok(q.I >= a[k].I - 1e-12, 'specular only adds'); if (q.I > a[k].I + 0.02) up++; }); ok(up > 0 && up < b.length / 6, `p = ${p}: highlight is a small cluster (${up})`); }
ok(appSrc.includes('if (q.I > lam + 0.02) spec++'), 'app counts highlight pixels with the tested 0.02 threshold');
both('s4spec1', '0.02');
ok(M.litFraction(M.renderSphere(64, M.lightDir(0, 0), 0, 0)) === 1 && M.litFraction(M.renderSphere(64, M.lightDir(180, 0), 0, 0)) === 0, 'full and new moon');

// ---- step 5: supersampling ----
for (let d = 0; d <= 1.0001; d += 0.05) {
  const tri = M.shiftTri(M.SLIVER, d / 16), errs = M.SPP_N.map(n => M.aaError(tri, 16, n).mean);
  for (let k = 0; k < 4; k++) ok(errs[k] / errs[k + 1] >= 2, `4× samples at least halves the error (raise ${d.toFixed(2)}, ${k})`);
  // exact coverage sums to the triangle area in pixel units
  const e = M.exactCoverage(tri, 16); near(e.reduce((a, b) => a + b, 0), Math.abs(M.area(tri)) * 256, 1e-9, 'coverage sums to area');
}
// clipping: a pixel fully inside a big triangle has coverage 1; the helper agrees with fine sampling
near(M.clipArea([[-1, -1], [3, -1], [-1, 3]], 0, 0, 0.5, 0.5), 0.25, 1e-12, 'full pixel');
{ const tri = M.shiftTri(M.SLIVER, 0.3 / 16), e = M.exactCoverage(tri, 16), c = M.coverage(tri, 16, 64); for (let k = 0; k < 256; k++) near(c[k], e[k], 0.03, 'fine sampling ≈ exact'); }
ok(sliderVals('spp').length === 5 && M.SPP_N.map(n => n * n).join() === '1,4,16,64,256', 'spp 1..256');
both('s5e', '16 × 16');

// ---- number formatting rule ----
const fmt = eval('(' + appSrc.match(/const fmt = [^\n]+/)[0].replace('const fmt = ', '').replace(/;\s*$/, '') + ')');
ok(fmt(90, 0) === '90' && fmt(1.50) === '1.5' && fmt(-0.001) === '0' && fmt(-1.25) === '−1.25' && fmt(100, 1) === '100' && fmt(40, 2) === '40', 'fmt keeps integer zeros');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
both('foot', 'claude-opus-5-5');
ok(STRINGS.zh.foot.includes('计算机图形学 · 从坐标到画面') && STRINGS.en.foot.includes('Computer Graphics · From Coordinates to Pixels'), 'footer names the original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|on the left|on the right/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of appSrc.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) ok(!/\{[a-zA-Z0-9]+\}/.test(STRINGS.zh[m[1]]), 'static key without placeholders ' + m[1]);
for (const id of ['rot', 'scl', 'tx', 'ty', 'oTRS', 'oRST', 'f', 'dolly', 'n', 'scan2', 'tilt', 'shift', 'mZ', 'mP', 'az', 'el', 'ka', 'p', 'spp', 'dy']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no canvas-label-guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and css');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../computing/graphics/computer-graphics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS computer-graphics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · raster error N≥24 ${(mx24 * 100).toFixed(2)}%`);
