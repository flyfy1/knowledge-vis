'use strict';
// Mandelbrot (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes "${s}"`); };
const byId = id => M.ORBITS.find(o => o.id === id).c;

// ---- step 0: the preset orbits behave as the hint says ----
{
  const o0 = M.orbit(0, 0, 50); ok(o0.esc < 0 && o0.pts.every(p => p[0] === 0 && p[1] === 0), 'c = 0 stays at 0');
  const o1 = M.orbit(-1, 0, 50); ok(o1.esc < 0 && o1.pts.every((p, n) => p[1] === 0 && p[0] === (n % 2 ? -1 : 0)), 'c = −1 hops 0, −1');
  const oi = M.orbit(0, 1, 50);
  ok(oi.esc < 0, 'c = i bounded');
  assert.deepEqual(oi.pts.slice(0, 5), [[0, 0], [0, 1], [-1, 1], [0, -1], [-1, 1]]); checks++;
  for (let n = 2; n < oi.pts.length; n++) ok(String(oi.pts[n]) === (n % 2 ? '0,-1' : '-1,1'), 'c = i cycles −1+i, −i');
  const sw = M.attractor(...byId('swirl')); ok(sw.period === 1, 'swirl settles on a fixed point');
  // it spirals: the angle around the fixed point keeps turning the same way for the first steps
  { const o = M.orbit(...byId('swirl'), 30).pts, f = sw.cycle[0]; let turns = 0;
    for (let n = 2; n < 30; n++) { const a = Math.atan2(o[n][1] - f[1], o[n][0] - f[0]) - Math.atan2(o[n - 1][1] - f[1], o[n - 1][0] - f[0]); const d = Math.atan2(Math.sin(a), Math.cos(a)); turns += Math.sign(d); }
    ok(Math.abs(turns) >= 24, 'swirl winds round its fixed point'); }
  // c = 0.25: monotone, ever slower creep towards 0.5, never escapes
  { const o = M.orbit(0.25, 0, 5000).pts; ok(M.orbit(0.25, 0, 5000).esc < 0, '0.25 bounded');
    for (let n = 1; n < o.length; n++) ok(o[n][0] > o[n - 1][0] && o[n][0] < 0.5, '0.25 creeps up to 0.5');
    ok(o[2][0] - o[1][0] > o[100][0] - o[99][0], 'and slows down'); }
  assert.equal(M.orbit(0.3, 0, 100).esc, 12); checks++; both('s0hint', '12');
  assert.equal(M.orbit(-0.1, 0.65, 100).esc, 75); checks++; both('s0hint', '75'); both('s0hint', '74');
  ok(M.escapeTime(0.3, 0, 100) === 12 && M.escapeTime(-0.1, 0.65, 100) === 75, 'escapeTime agrees with orbit');
}

// ---- step 1: radius 2 is a point of no return (grid over |c| ≤ 2.5) ----
{
  let crossed = 0;
  for (let cr = -2.5; cr <= 2.5; cr += 0.05) for (let ci = -1.5; ci <= 1.5; ci += 0.05) {
    const { mods, esc } = M.modSeq(cr, ci, 200, 6), cm = Math.hypot(cr, ci);
    if (esc < 0) { ok(mods.every(m => m <= 2), 'bounded run stays ≤ 2'); continue; }
    crossed++;
    ok(mods[esc] >= cm - 1e-12, 'at the first crossing |z| ≥ |c|');
    for (let n = esc; n + 1 < mods.length; n++) {
      ok(mods[n + 1] > mods[n], 'strictly growing after the first crossing');
      ok(mods[n + 1] >= mods[n] * (mods[n] - 1) * (1 - 1e-12), 'growth factor ≥ |z| − 1');
    }
  }
  ok(crossed > 1000, 'grid has many escaping c');
  const e = M.modSeq(-2, 0, 80); ok(e.esc < 0 && e.mods.slice(2).every(m => m === 2), 'c = −2 sits at |z| = 2 exactly');
  assert.equal(M.modSeq(2.1, 0, 80).esc, 1); checks++;
  assert.equal(M.modSeq(-0.1, 0.65, 80).esc, 75); checks++; // the default fits inside the 80-step chart
  // s1hint: on the log₂(1 + |z|) axis, 16→256 and 256→4096 take about the same height
  { const h = v => Math.log2(1 + v); ok(Math.abs((h(256) - h(16)) - (h(4096) - h(256))) < 0.2, 'squashed axis claim'); }
}

// ---- step 2: escape-time picture and area ----
{
  // the fast escape (cardioid/disc shortcuts + exact cycle check) never changes the answer
  for (let cr = -2.2; cr <= 0.7; cr += 0.013) for (let ci = -1.4; ci <= 1.4; ci += 0.017) for (const N of [7, 100])
    ok(M.escapeFast(cr, ci, N) === M.escapeTime(cr, ci, N), `escapeFast = escapeTime at ${cr},${ci},${N}`);
  // the shortcuts are honest: cardioid and period-2 disc points never escape
  for (let th = 0; th < 6.28; th += 0.05) for (const s of [0.3, 0.7, 0.97]) {
    const [bx, by] = M.cardioidPoint(th), cx = 0.25 + (bx - 0.25) * s, cy = by * s; // shrink towards the cusp-free interior
    if (M.inCardioid(cx, cy)) ok(M.escapeTime(cx, cy, 3000) < 0, 'cardioid interior bounded');
    const dx = -1 + 0.25 * s * Math.cos(th), dy = 0.25 * s * Math.sin(th); ok(M.inDisc2(dx, dy) && M.escapeTime(dx, dy, 3000) < 0, 'disc interior bounded');
  }
  // N = 1 leaves exactly the disc |c| ≤ 2
  for (let k = 0; k < 400; k++) { const r = 0.01 * k, a = k * 2.399; ok((M.escapeTime(r * Math.cos(a), r * Math.sin(a), 1) < 0) === (r <= 2), 'N=1 = disc of radius 2'); }
  // the set fits in the frame: survivors of N = 1000 on a fine grid stay within Re [−2, 0.48], |Im| < 1.13 (grid evidence, not a proof)
  let xmin = 9, xmax = -9, ymax = 0;
  for (let cr = -2.1; cr <= 0.6; cr += 0.004) for (let ci = 0; ci <= 1.2; ci += 0.004) if (M.escapeFast(cr, ci, 1000) < 0) { xmin = Math.min(xmin, cr); xmax = Math.max(xmax, cr); ymax = Math.max(ymax, ci); }
  ok(xmin >= -2 - 1e-9 && xmax < 0.48 && ymax < 1.13, `extent ${xmin} ${xmax} ${ymax}`);
  both('s2e', '0.48'); both('s2e', '1.13');
  ok(M.FRAME.x0 < -2 && M.FRAME.x1 > 0.48 && M.FRAME.y1 > 1.13 && M.FRAME.y0 < -1.13, 'frame contains the set');
  // area never grows with N, ≈ 1.51 at N = 1000 (300 × 300 grid), ≈ 1.507 with 1200 × 1200 and N = 5000
  const NLIST = [1, 2, 3, 4, 5, 7, 10, 15, 20, 30, 50, 100, 200, 500, 1000];
  const areas = NLIST.map(N => M.areaEstimate(N, 300));
  for (let i = 1; i < areas.length; i++) ok(areas[i] <= areas[i - 1], 'area non-increasing in N');
  near(areas[areas.length - 1], 1.51, 0.005, 'area at N = 1000'); both('s2hint', '1.51'); both('s6fin', '1.51');
  near(M.areaEstimate(5000, 1200), 1.507, 0.0015, 'fine-grid area'); both('s2hint', '1.507');
  ok(areas[11] - areas[14] < 0.04, 'nearly flat after N = 100');
}

// ---- step 3: periods, bulbs, rotation around α ----
{
  ok(M.attractor(0, 0).period === 1 && M.attractor(-1, 0).period === 2, 'c = 0 period 1, c = −1 period 2');
  // the cardioid is period 1 and the disc period 2 (sampled well inside)
  for (let th = 0.2; th < 6.1; th += 0.3) {
    const m = 0.8, ax = m * Math.cos(th) / 2 - m * m * Math.cos(2 * th) / 4, ay = m * Math.sin(th) / 2 - m * m * Math.sin(2 * th) / 4; // c = μ/2 − μ²/4, |μ| < 1
    ok(M.inCardioid(ax, ay) && M.attractor(ax, ay).period === 1, 'cardioid period 1');
    const d = M.attractor(-1 + 0.2 * Math.cos(th), 0.2 * Math.sin(th)); ok(d.period === 2, 'disc period 2');
  }
  for (const [p, q] of [[1, 2], [1, 3], [2, 5], [1, 4], [1, 5], [3, 7], [2, 3]]) {
    const c = M.bulbCenter(p, q), a = M.attractor(c[0], c[1]);
    ok(a.period === q, `bulb ${p}/${q} has period ${q}`);
    // centre: the orbit of 0 returns to 0 after exactly q steps
    const o = M.orbit(c[0], c[1], q).pts; near(Math.hypot(...o[q]), 0, 1e-10, `centre of ${p}/${q}`);
    for (let k = 1; k < q; k++) ok(Math.hypot(...o[k]) > 1e-3, 'no earlier return');
    near(Math.hypot(...M.multiplier(a.cycle)), 0, 1e-6, 'superattracting at the centre');
    const al = M.alphaFixed(c[0], c[1]); near(al[0] * al[0] - al[1] * al[1] + c[0], al[0], 1e-12, 'α is fixed'); near(2 * al[0] * al[1] + c[1], al[1], 1e-12, 'α is fixed (im)');
    ok(M.rotationAround(a.cycle, al) === p, `${p}/${q}: jumps ${p} places around α`);
    // same period and rotation part-way from the centre towards the cardioid tangency point
    const [tx, ty] = M.cardioidPoint(2 * Math.PI * p / q);
    for (const s of [0.25, 0.5]) { const cx = c[0] + (tx - c[0]) * s, cy = c[1] + (ty - c[1]) * s, b = M.attractor(cx, cy); ok(b.period === q && M.rotationAround(b.cycle, M.alphaFixed(cx, cy)) === p, `${p}/${q} constant inside the bulb (s=${s})`); }
  }
  // the multiplier of the cycle at default c is below 1 whenever a period is reported (sampled grid)
  for (let cr = -1.9; cr <= 0.4; cr += 0.1) for (let ci = 0; ci <= 1.1; ci += 0.1) { const a = M.attractor(cr, ci); if (!a.escaped && a.period) ok(Math.hypot(...M.multiplier(a.cycle)) < 1 + 1e-3, 'reported cycles attract'); }
}

// ---- step 4: zoom targets and precision ----
{
  near(Math.hypot(...M.orbit(-1.7548776662466927, 0, 3).pts[3]), 0, 1e-12, 'mini-Mandelbrot centre is period 3');
  ok(M.attractor(-1.7548776662466927, 0).period === 3, 'period 3');
  // seahorse: a border point with escape-time detail at every depth; mini copy: the view goes all-black past 10^3
  { const T = M.TARGETS[0].c;
    for (let z = 0; z <= 9; z++) { const r = 1.6 * Math.pow(10, -z), es = new Set(); let inn = 0;
      for (let k = 0; k < 400; k++) { const a = k * 2.399, rr = r * Math.sqrt((k + 0.5) / 400), e = M.escapeFast(T[0] + rr * Math.cos(a), T[1] + rr * Math.sin(a), M.iterFor(z)); if (e < 0) inn++; else es.add(e); }
      ok(inn > 0 && es.size > 30, `seahorse detail at 10^${z} (${inn} in, ${es.size} escape times)`); } }
  { const C0 = [-0.6, 0], T = M.TARGETS[1].c, box = z => { const f = Math.pow(10, -z), w = M.BASE_W * f, h = w * 0.45, cx = T[0] + (C0[0] - T[0]) * f, cy = T[1] + (C0[1] - T[1]) * f; return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 }; };
    const s15 = M.insideShare(box(1.5), M.iterFor(1.5)); ok(s15 > 0.05 && s15 < 0.6, 'whole small copy visible at 10^1.5: ' + s15);
    for (let z = 3; z <= 9; z += 0.5) ok(M.insideShare(box(z), M.iterFor(z)) === 1, 'all black past 10^3 at ' + z); }
  // precision claims: at 10⁹ pixels are ≥ 10⁴ × the double spacing for any canvas width the page uses; at 10¹³ within a few dozen
  for (const W of [240, 320, 390, 600, 920]) for (const tg of M.TARGETS) {
    const u = M.ulp(Math.max(Math.abs(tg.c[0]), Math.abs(tg.c[1]))), px9 = M.BASE_W * 1e-9 / (W * 0.7), px13 = M.BASE_W * 1e-13 / (W * 0.7);
    ok(px9 / u > 1e4, `10^9 still ≥ 10^4 ulp (${W}, ${tg.id})`); ok(px13 / u < 50, `10^13 within a few dozen ulp (${W}, ${tg.id})`);
  }
  near(M.ulp(1), Math.pow(2, -52), 0, 'ulp(1)');
  ok(M.iterFor(9) > M.iterFor(0), 'cap rises with zoom');
}

// ---- step 5: Julia presets ----
{
  const J = Object.fromEntries(M.JULIA.map(j => [j.id, j.c]));
  ok(M.escapeTime(...J.basilica, 2000) < 0 && M.escapeTime(...J.rabbit, 2000) < 0 && M.escapeTime(...J.dendrite, 2000) < 0, 'in-set presets');
  ok(M.escapeTime(...J.dust, 2000) > 0, 'dust preset escapes');
  ok(M.attractor(...J.rabbit).period === 3, 'rabbit is in the period-3 bulb');
  near(J.rabbit[0], M.bulbCenter(1, 3)[0], 1e-12, 'rabbit = 1/3 centre'); near(J.rabbit[1], M.bulbCenter(1, 3)[1], 1e-12, 'rabbit = 1/3 centre im');
  ok(M.attractor(...J.dendrite).period === 2 && Math.hypot(...M.multiplier(M.attractor(...J.dendrite).cycle)) > 1, 'c = i: the cycle repels (no interior)');
  // Julia of c = −1 contains 0 and −1 (the cycle) and is symmetric under z → −z
  ok(M.juliaEscape(-1, 0, 0, 0, 500) < 0 && M.juliaEscape(-1, 0, -1, 0, 500) < 0, 'basilica cycle inside');
  for (let k = 0; k < 200; k++) { const x = Math.cos(k) * 1.6, y = Math.sin(k * 1.3) * 1.2; ok(M.juliaEscape(-1, 0, x, y, 200) === M.juliaEscape(-1, 0, -x, -y, 200), 'symmetric under z → −z'); }
  for (const l of ['zh', 'en']) ok(STRINGS[l].jl_rabbit.includes('0.1226') && STRINGS[l].jl_rabbit.includes('0.7449'), 'rabbit label');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['orb_zero', 'orb_minus1', 'orb_i', 'orb_swirl', 'orb_quarter', 'orb_p03', 'orb_slow', 'p1_p03', 'jl_basilica', 'jl_dendrite', 'jl_dust']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.compare.includes('Mandelbrot 分形 · 无限放大') && STRINGS.en.compare.includes('The Mandelbrot Set · Zoom Without End'), 'compare link names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const o of M.ORBITS) ok(STRINGS.zh['orb_' + o.id] !== undefined, 'orbit label ' + o.id);
for (const o of M.TARGETS) ok(STRINGS.zh['tg_' + o.id] !== undefined, 'target label ' + o.id);
for (const o of M.JULIA) ok(STRINGS.zh['jl_' + o.id] !== undefined, 'julia label ' + o.id);
for (const id of ['slow', 'p03', 'edge', 'far']) ok(STRINGS.zh['p1_' + id] !== undefined, 'step-1 preset ' + id);
for (const id of ['cr0', 'ci0', 'n0', 'play0', 'cr1', 'ci1', 'N2', 'play2', 'clear2', 'cr3', 'ci3', 'z4', 'play4', 'cr5', 'ci5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/calculus/mandelbrot/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS mandelbrot core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
