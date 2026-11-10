'use strict';
// Pinhole camera (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (k, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][k].includes(s), `${l}.${k} quotes "${s}"`));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const attr = (id, a) => Number(new RegExp(`id="${id}"[^>]*${a}="([^"]+)"`).exec(html)[1]);

// ---- step 0: shadow edges lie on the lamp → card-edge lines ----
for (let c = attr('cpos', 'min'); c <= attr('cpos', 'max'); c++) {
  const sh = M.shadow(c);
  near(sh.top, 10 * 100 / c, 1e-9, 'top edge on the line through the card top');
  near(sh.bot, -10 * 100 / c, 1e-9, 'bottom edge');
  ok(sh.top <= 45 && sh.bot >= -45, 'shadow fits the 90 cm screen drawn, c=' + c);
  // the fan: blocked exactly when the straight ray meets the card; unblocked rays never land inside the shadow
  M.fan(c, 25, 0.45).forEach(r => {
    ok(r.blocked === (Math.abs(r.m * c) <= 10 + 1e-9), 'blocked iff the ray hits the card');
    if (!r.blocked) ok(r.end.y >= sh.top - 1e-9 || r.end.y <= sh.bot + 1e-9, 'lit points fall outside the shadow');
    if (!r.blocked) ok(Math.abs(r.end.y) <= 45 + 1e-9, 'ray lands on the drawn screen');
  });
  ok(M.fan(c, 25, 0.45).some(r => r.blocked) && M.fan(c, 25, 0.45).some(r => !r.blocked), 'some rays blocked, some not');
}
ok(M.shadow(25).height > M.shadow(80).height, 'card nearer the lamp → bigger shadow');
near(M.shadow(40).height, 50, 1e-9, 'default: 50 cm shadow from a 20 cm card at 40 cm');

// ---- steps 1–2: image endpoints two ways (ray intersection vs H·v/u) ----
let worstPx = 0;
for (let H = 20; H <= 60; H += 4) for (let u = 60; u <= 160; u += 5) for (let v = 30; v <= 160; v += 5) {
  const im = M.image(H, u, v);
  near(im.h, im.hFormula, 1e-9, 'ray-traced height = H·v/u');
  ok(im.inverted, 'always upside down');
  near(im.Ai.y, -H / 2 * v / u, 1e-9, 'A′ lands at −(H/2)·v/u'); near(im.Bi.y, H / 2 * v / u, 1e-9, 'B′');
  near(im.h / H, v / u, 1e-12, 'h/H = v/u');
  // the drawn image stays on the drawn screen (±84 cm) and inside the scene box (y −90..88)
  ok(im.h / 2 <= 84, `image fits the screen H=${H} u=${u} v=${v}`);
  worstPx = Math.max(worstPx, Math.abs(im.hRay + im.hFormula) * 2.3); // px at the 1280 scale (≈2.3 px/cm)
}
ok(worstPx < 1.5, 'two ways agree within 1.5 px');
for (const [u, v, r] of [[90, 90, 1], [120, 60, 0.5], [70, 140, 2]]) { // the three preset buttons
  ok(u >= attr('u2', 'min') && u <= attr('u2', 'max') && v >= attr('v2', 'min') && v <= attr('v2', 'max'), 'preset inside slider range');
  near(M.image(60, u, v).h / 60, r, 1e-12, `preset ratio ${r}`);
}
ok(app.includes('preset(90, 90)') && app.includes('preset(120, 60)') && app.includes('preset(70, 140)'), 'app uses the tested presets');
// step 1 scene: u = 90, v = 60, H = 60 → A′ at −20, B′ at +20
{ const im = M.image(60, 90, 60); near(im.Ai.y, -20, 1e-9, 'A′'); near(im.Bi.y, 20, 1e-9, 'B′'); }
// front view: a half turn — the green (right) half lands on the left, the flame points down
{
  const P = M.candleParts(60);
  P.green.forEach(([r, y]) => { const q = M.mapPoint(r, y, 90, 60); ok(q.x <= 1e-12, 'green half moves to the left'); });
  P.flame.forEach(([r, y]) => { const q = M.mapPoint(r, y, 90, 60); ok(q.y < 0, 'flame below the middle'); near(q.x, -r * 60 / 90, 1e-12, 'scaled by v/u'); });
}
// ratio chart axis 0..2.8 covers every reachable v/u
ok(160 / 60 <= 2.8 && 30 / 160 >= 0, 'ratio chart range');

// ---- step 3: blur spots ----
for (let d = attr('d3', 'min'); d <= attr('d3', 'max') + 1e-9; d += 0.5) {
  const b = M.blur(60, 90, 90, d);
  near(b.width, d * (90 + 90) / 90, 1e-9, 'spot = d(u+v)/u');
  b.spots.forEach(sp => { near(sp.hi - sp.lo, b.width, 1e-9, 'each spot has the computed width'); near(sp.centre, -sp.y0, 1e-9, 'spot centred on the pinhole image (size unchanged)'); });
  // edge rays through the hole's top / bottom land exactly at the spot ends
  const r = M.spotRays(30, d, 90, 90); near(Math.abs(r[0].hit - r[2].hit), b.width, 1e-9, 'edge rays bound the spot');
  near(b.gap, 15, 1e-9, 'neighbouring image points 15 cm apart (s3hint)');
  ok(b.merged === (d > 7.5), 'spots overlap exactly when 2d > 15');
  near(M.brightness(d), d * d, 1e-12, 'light ∝ area');
  ok(30 + b.width / 2 <= 50, 'spots stay on the 100 cm screen drawn');
}
near(M.brightness(2) / M.brightness(1), 4, 1e-12, 'double the width → 4× light (s3hint)');
both('s3hint', '15 cm'); both('s3e', '90'); both('s3readout', '90 + 90');

// ---- quiz ----
{ const o = M.QUIZ.q1Options(); near(o.right, 30, 1e-12, 'q1 = 30'); near(o.same, 60, 1e-12, 'distractor 60'); near(o.flipped, 120, 1e-12, 'distractor 120 = H·u/v'); }
ok(M.image(60, 90, 120).h > M.image(60, 90, 90).h, 'q2: further screen → bigger'); near(M.image(60, 90, 90).h, 60, 1e-9, 'q2 h0'); near(M.image(60, 90, 120).h, 80, 1e-9, 'q2 h1');
{ const a = M.blur(60, 90, 90, 1), b = M.blur(60, 90, 90, 15); a.spots.forEach((s, i) => near(s.centre, b.spots[i].centre, 1e-12, 'q2/q4: hole size does not move the image')); }
{ const q = M.mapPoint(1, 1, 90, 60); ok(q.x < 0 && q.y < 0, 'q3: both directions swap'); }
ok(M.blur(60, 90, 90, 15).merged, 'q4: a 15 cm hole blurs'); near(M.spotWidth(15, 90, 90), 30, 1e-12, 'q4 spot 30 cm');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['optCm']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- keys, controls, provenance ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const q of ['q2', 'q3', 'q4']) for (const c of ['b', 'c']) ok(STRINGS.zh[`${q}${c}_no`] !== undefined, `wrong-answer feedback ${q}${c}`);
for (const id of ['cpos', 'fly0', 'light1', 'H2', 'u2', 'v2', 'preEq', 'preHalf', 'preDouble', 'clear2', 'd3', 'score']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!/canvas-label-guard/.test(html), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/optics/pinhole-camera/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS pinhole-camera core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · two-way image height agreement ${worstPx.toExponential(1)} px`);
