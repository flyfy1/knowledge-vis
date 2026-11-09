'use strict';
// Convex lens (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const range = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)"`)); return { min: +m[1], max: +m[2], step: +m[3] }; };
const grid = ({ min, max, step }) => { const out = []; const n = Math.round((max - min) / step); for (let i = 0; i <= n; i++) out.push(+(min + i * step).toFixed(6)); return out; };
const f = M.F;

// ---- the lens formula and the anchor values ----
for (const [u, v, m] of [[30, 15, -0.5], [20, 20, -1], [15, 30, -2], [6, -15, 2.5], [2, -2.5, 1.25], [40, 40 / 3, -1 / 3]]) {
  const im = M.image(u, f); near(im.v, v, 1e-12, 'v at u=' + u); near(im.M, m, 1e-12, 'M at u=' + u);
}
ok(M.image(10, 10).type === 'infinity' && M.image(10, 10).v === null, 'u = f: no finite image');
ok(M.image(0, 10).type === 'invalid' && M.image(-3, 10).type === 'invalid', 'invalid inputs');
for (const u of grid(range('u2'))) {
  const im = M.image(u, f), z = M.zone(u, f), d = M.describe(im.M);
  if (u === f) { ok(im.type === 'infinity' && z === 'atf', 'exact focus state'); continue; }
  near(1 / u + 1 / im.v, 1 / f, 1e-12, 'thin-lens equation u=' + u);
  // the readout's words follow from zone; zones decided on exact values
  if (z === 'beyond2f') ok(im.type === 'real' && !d.upright && d.size === 'smaller', 'beyond 2f → reduced real ' + u);
  if (z === 'at2f') ok(u === 20 && im.type === 'real' && d.size === 'same', 'at 2f → same size');
  if (z === 'between') ok(im.type === 'real' && !d.upright && d.size === 'larger', 'between → enlarged real ' + u);
  if (z === 'inside') ok(im.type === 'virtual' && d.upright && d.size === 'larger' && im.v < 0, 'inside → enlarged virtual ' + u);
}
ok(M.zone(19.9, 10) === 'between' && M.zone(20.1, 10) === 'beyond2f' && M.zone(9.9, 10) === 'inside' && M.zone(10.1, 10) === 'between', 'slider neighbours of F and 2F');
// sweep path (40 → 2 in 0.5 cm steps) passes exactly through 2F and F; v grows as u falls toward f
const sweep = []; for (let x = 400; x >= 20; x -= 5) sweep.push(x / 10);
ok(sweep.includes(20) && sweep.includes(10) && sweep[0] === 40 && sweep[sweep.length - 1] === 2, 'sweep visits 2F and F');
for (let i = 1; i < sweep.length; i++) { const a = sweep[i - 1], b = sweep[i]; if (b > f) ok(M.image(b, f).v > M.image(a, f).v && Math.abs(M.image(b, f).M) > Math.abs(M.image(a, f).M), 'real image grows and recedes'); }

// ---- step 0: a parallel beam meets at the focus ----
for (const ff of grid(range('f0'))) M.beamCross(ff, [-3, -2, -1, 1, 2, 3]).forEach(x => near(x, ff, 1e-12, 'beam crosses at f=' + ff));

// ---- step 1 (and 2, 4): the three rays meet at the formula's image point ----
for (const u of [...grid(range('u1')), 2, 6, 9.5, 10.5, 12, 30, 40]) for (const h of grid(range('h1'))) {
  const im = M.image(u, f), R = M.rays(u, h, f);
  for (const [a, b] of [[0, 1], [0, 2], [1, 2]]) {
    const p = M.meet(R[a], R[b]);
    near(p.x, im.v, 1e-9 * Math.max(1, Math.abs(im.v)), `crossing x u=${u}`); near(p.y, im.M * h, 1e-9 * Math.max(1, Math.abs(im.M * h)), `crossing y u=${u}`);
  }
  // ray 3 really passes through the near focus before the lens
  near(h + (R[2].y0 - h) * (u - f) / u, 0, 1e-12, 'ray 3 aims through (−f, 0)');
}
ok(M.rays(10, 3, 10)[2] === null, 'ray 3 undefined at u = f');
// step-1 window keeps object and image inside the drawn ranges x ∈ [−42, 34], y ∈ [−11, 11]
for (const u of grid(range('u1'))) for (const h of grid(range('h1'))) { const im = M.image(u, f); ok(im.v <= 34 && im.M * h >= -11 && u <= 42 && h <= 11, 'step 1 stays in view'); }

// ---- step 3: screen ----
const Dap = M.APERTURE;
for (const p of grid(range('p3'))) {
  const bReal = M.blur(p, 15, f), bMag = M.blur(p, 6, f);
  near(bReal, Dap * Math.abs(p - 30) / 30, 1e-12, 'real blur');
  ok((bReal < 1e-9) === (p === 30), 'sharp only at p = v = 30');
  ok(bMag > Dap, 'magnifier patch always wider than the lens');
  // patch edges from the drawn lines agree with the model width
  for (const [u, b] of [[15, bReal], [6, bMag]]) { const im = M.image(u, f), yi = im.M * M.H; const top = Dap / 2 + (Dap / 2 - yi) / (-im.v) * p, bot = -Dap / 2 + (-Dap / 2 - yi) / (-im.v) * p; near(Math.abs(top - bot), b, 1e-9, 'patch width'); near((top + bot) / 2, -M.H * p / u, 1e-9, 'patch centre on the chief ray'); }
}
ok(range('p3').min <= 30 && range('p3').max >= 30, 'slider reaches the real image');
for (const l of ['zh', 'en']) ok(/30 cm/.test(STRINGS[l].s3hint) && STRINGS[l].s3e.includes('{D}'), 's3 text');
near(M.image(6, f).M, 2.5, 1e-12, 'magnifier eye view ×2.5');

// ---- step 4: each device works in its zone over its whole slider range ----
const ZONE = { camera: 'beyond2f', projector: 'between', magnifier: 'inside' };
for (const [d, D] of Object.entries(M.DEVICES)) {
  for (let u = D.uMin; u <= D.uMax + 1e-9; u += 0.5) ok(M.zone(u, D.f) === ZONE[d], `${d} at u=${u} is in ${ZONE[d]}`);
  ok(D.u0 >= D.uMin && D.u0 <= D.uMax && ((D.u0 - D.uMin) / 0.5) % 1 === 0, d + ' default on its slider grid');
}
near(M.image(40, 5).v, 40 / 7, 1e-12, 'camera v'); near(M.image(12, 10).v, 60, 1e-12, 'projector v'); near(M.image(6, 10).v, -15, 1e-12, 'magnifier v');

// ---- step 5: quiz ----
const Q = M.quiz();
ok(Q.q1.zone === 'beyond2f' && Q.q1.v === 15 && Q.q1.d.size === 'smaller' && !Q.q1.d.upright, 'q1 reduced real');
ok(Q.q2.v0 === 15 && Q.q2.v1 === 30 && Math.abs(Q.q2.M1) > Math.abs(Q.q2.M0), 'q2 larger and further');
ok(Q.q3 === 'inside', 'q3 inside f');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['unitCm', 'lbF', 'lb2F', 'zBeyond', 'zBetween', 'zInside', 'q3a', 'q3b', 'q3c']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists; controls present ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['zone_beyond2f', 'zone_at2f', 'zone_between', 'zone_atf', 'zone_inside', 'c4title_camera', 'c4title_projector', 'c4title_magnifier', 'note_camera', 'note_projector', 'note_magnifier', 'fb1ok', 'fb1no', 'fb2ok', 'fb2no', 'fb3ok', 'fb3no', 'larger', 'smaller', 'same']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const id of ['f0', 'mBeam', 'mPoint', 'u1', 'h1', 'ray1', 'ray2', 'ray3', 'u2', 'at2F', 'atF', 'sweep2', 'clear2', 'p3', 'sceneReal', 'sceneMag', 'eyeBtn', 'dCamera', 'dProjector', 'dMagnifier', 'u4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../physics/optics/lens/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS lens core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
