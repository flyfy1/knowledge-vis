'use strict';
// Trigonometry (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes "${s}"`); };

// ---- step 0: radians ----
near(1 / M.DEG, 57.2958, 1e-4, '1 rad in degrees'); both('s0hint', '57.3');
near(2 * Math.PI, 6.283, 5e-4, '2π'); both('s0hint', '6.283');
near(2 * Math.PI - 6, 0.283, 5e-4, 'left over after 6 radii'); both('s0hint', '0.283');
ok(M.arc(2 * Math.PI, 1).wholeRadii === 6, 'six whole radii in a turn');
for (let th = 0; th <= 6.28; th += 0.01) for (const r of [0.5, 0.75, 1, 1.25, 1.5]) {
  const a = M.arc(th, r); near(a.s / r, th, 1e-12, 's/r = θ for every radius'); near(a.deg, th * 180 / Math.PI, 1e-9, 'degrees');
  ok(a.wholeRadii === Math.floor(th + 1e-12), 'whole radii');
}
ok(M.arc(1, 1).wholeRadii === 1 && M.arc(0.99, 1).wholeRadii === 0, 'chunk boundary at exactly 1 rad');
ok(Math.abs(6.28 - 2 * Math.PI) < 0.01, 'θ slider max is one full turn to slider precision');

// ---- step 1: definition, exact values, Pythagoras ----
for (let d = 0; d <= 360; d++) {
  const c = M.cosDeg(d), s = M.sinDeg(d);
  near(c * c + s * s, 1, 1e-15, 'cos² + sin² = 1 at ' + d);
  near(c, Math.cos(d * M.DEG), 1e-15, 'cosDeg'); near(s, Math.sin(d * M.DEG), 1e-15, 'sinDeg');
  if (d % 90 === 0) ok([0, 1, -1].includes(c) && [0, 1, -1].includes(s), 'exact at quarter turns ' + d);
  const q = M.quadrant(d);
  if (q === 1) ok(c > 0 && s > 0, 'Q1 signs'); if (q === 2) ok(c < 0 && s > 0, 'Q2 signs');
  if (q === 3) ok(c < 0 && s < 0, 'Q3 signs'); if (q === 4) ok(c > 0 && s < 0, 'Q4 signs');
  if (q === 0) ok(d % 90 === 0, 'axis only at quarter turns');
}
assert.equal(M.exactOf(M.sinDeg(30)), '1/2'); assert.equal(M.exactOf(M.cosDeg(45)), '√2/2'); assert.equal(M.exactOf(M.sinDeg(60)), '√3/2'); checks += 3;
assert.equal(M.exactOf(M.cosDeg(135)), '−√2/2'); assert.equal(M.exactOf(M.sinDeg(210)), '−1/2'); assert.equal(M.exactOf(M.cosDeg(300)), '1/2'); checks += 3;
assert.equal(M.exactOf(M.cosDeg(90)), '0'); checks++;
near(M.sinDeg(30), M.cosDeg(60), 1e-15, 'sin 30° = cos 60°');
for (const d of [30, 45, 60, 90, 135, 210, 300]) ok(M.isSpecial(d) && M.exactOf(M.sinDeg(d)) && M.exactOf(M.cosDeg(d)), 'preset has exact forms ' + d);
ok(!M.isSpecial(31) && !M.isSpecial(89.9), 'non-special angles get decimals');
for (const l of ['zh', 'en']) ok(['1/2', '√2/2', '√3/2'].every(v => STRINGS[l].s1hint.includes(v)), 'hint quotes the exact values');

// ---- step 2: the sine curve ----
near(Math.sin(Math.PI / 2), 1, 0, 'max at π/2'); near(Math.sin(3 * Math.PI / 2), -1, 0, 'min at 3π/2');
for (const z of [0, Math.PI, 2 * Math.PI]) near(Math.sin(z), 0, 1e-15, 'zero');
for (let th = 0; th <= 6.28; th += 0.01) {
  near(Math.cos(th), Math.sin(th + Math.PI / 2), 1e-15, 'cos θ = sin(θ + π/2)');
  near(Math.sin(th + 2 * Math.PI), Math.sin(th), 1e-14, 'period 2π');
  ok(Math.abs(Math.sin(th)) <= 1, 'bounded by 1');
}

// ---- step 3: tangent ----
ok(M.tanDeg(90) === null && M.tanDeg(270) === null, 'undefined at 90°, 270°');
for (let k = -4; k <= 4; k++) ok(M.tanDeg(90 + 180 * k) === null, 'undefined at 90 + 180k');
near(M.tanDeg(89.9), 572.96, 0.01, 'tan 89.9°'); near(M.tanDeg(90.1), -572.96, 0.01, 'tan 90.1°');
both('s3hint', '573'); both('s3hint', '−573');
near(M.tanDeg(45), 1, 1e-15, 'tan 45°'); near(M.tanDeg(225), 1, 1e-14, 'tan 225°');
for (let i = 0; i < 3600; i++) { const d = i / 10;
  const tn = M.tanDeg(d); if (tn === null) continue;
  // slope of OP = height at x = 1: the point (1, tan θ) lies on the line through O and P
  near(tn * M.cosDeg(d) - M.sinDeg(d), 0, 1e-12, 'meeting point on OP');
  const t2 = M.tanDeg(d + 180); if (t2 !== null) near(t2, tn, 1e-9 * Math.max(1, Math.abs(tn)), 'period 180°');
}
// slider: step 0.1 hits 90 and 270 exactly (rounding of the range value)
ok(Number((900 * 0.1).toFixed(1)) === 90, 'slider can sit exactly on 90');
// the plot never joins across a pole
{ const smp = M.tanSamples(1440, 4); for (let i = 1; i < smp.length; i++) if (!isNaN(smp[i][1]) && !isNaN(smp[i - 1][1])) ok(Math.abs(smp[i][1] - smp[i - 1][1]) < 1, 'no join across a pole'); }

// ---- step 4: symmetry ----
for (let d = 0; d <= 360; d++) {
  const a = M.reference(d); ok(a >= 0 && a <= 90, 'reference in [0, 90]');
  near(Math.abs(M.sinDeg(d)), M.sinDeg(a), 1e-15, '|sin θ| = sin α'); near(Math.abs(M.cosDeg(d)), M.cosDeg(a), 1e-15, '|cos θ| = cos α');
  const [m1, m2, m3, m4] = M.mirrors(a);
  near(M.sinDeg(m2), M.sinDeg(m1), 1e-15, 'sin(180 − α) = sin α'); near(M.cosDeg(m2), -M.cosDeg(m1), 1e-15, 'cos(180 − α) = −cos α');
  near(M.sinDeg(m3), -M.sinDeg(m1), 1e-15, 'sin(180 + α) = −sin α'); near(M.cosDeg(m3), -M.cosDeg(m1), 1e-15, 'cos(180 + α)');
  near(M.sinDeg(m4), -M.sinDeg(m1), 1e-15, 'sin(360 − α)'); near(M.cosDeg(m4), M.cosDeg(m1), 1e-15, 'cos(360 − α)');
  ok(M.mirrors(a).some(m => M.norm360(m) === M.norm360(d)), 'θ is one of its own mirror images');
}
ok(M.reference(150) === 30, 'reference of 150°'); near(M.sinDeg(150), 0.5, 1e-15, 'sin 150° = 0.5'); near(M.cosDeg(150), -M.cosDeg(30), 1e-15, 'cos 150° = −cos 30°');
both('s4hint', '150°');

// ---- step 5: A sin(ωt + φ) ----
for (const A of [0.25, 1, 1.5]) for (let w = 0.5; w <= 3; w += 0.25) for (let pd = -180; pd <= 180; pd += 15) {
  const phi = pd * M.DEG, wv = M.wave(A, w, phi);
  near(wv.T, 2 * Math.PI / w, 1e-12, 'period');
  near(wv.y(wv.peak), A, 1e-12, 'peak height = A'); ok(wv.peak >= 0 && wv.peak < wv.T, 'first peak in [0, T)');
  near(wv.y(wv.rise), 0, 1e-12, 'zero crossing');
  // numeric: no point of the wave on a fine grid exceeds A, and the first grid maximum is next to wv.peak
  let mx = -Infinity, at = 0; for (let i = 0; i < 4000; i++) { const tt = wv.T * i / 4000, v = wv.y(tt); if (v > mx) { mx = v; at = tt; } }
  ok(mx <= A + 1e-12 && Math.abs(at - wv.peak) < wv.T / 1000 + 1e-9 || Math.abs(Math.abs(at - wv.peak) - wv.T) < wv.T / 1000 + 1e-9, 'grid max at the peak');
  // positive φ shifts left by φ/ω
  near(wv.y(1.234), A * Math.sin(w * (1.234 + phi / w)), 1e-12, 'shift φ/ω');
}
const peaks = (w, phi) => { const wv = M.wave(1, w, phi); let n = 0; for (let tp = wv.peak; tp <= 4 * Math.PI + 1e-9; tp += wv.T) n++; return n; };
ok(peaks(1, 0) === 2 && peaks(2, 0) === 4, 'ω 1 → 2: peaks in [0, 4π] go 2 → 4');
for (let tt = 0; tt < 10; tt += 0.1) near(M.wave(1, 1, Math.PI / 2).y(tt), Math.cos(tt), 1e-15, 'φ = 90° gives cos');

// ---- step 6: a cos t + b sin t = R sin(t + φ) ----
for (let a = -1.5; a <= 1.5001; a += 0.1) for (let b = -1.5; b <= 1.5001; b += 0.1) {
  const { R, phi } = M.phasorSum(a, b);
  for (let tt = 0; tt < 6.3; tt += 0.07) near(a * Math.cos(tt) + b * Math.sin(tt), R * Math.sin(tt + phi), 1e-12, 'identity');
  let mx = -Infinity; for (let i = 0; i < 3600; i++) { const v = 2 * Math.PI * i / 3600; mx = Math.max(mx, a * Math.cos(v) + b * Math.sin(v)); }
  near(mx, R, 2e-6 * Math.max(1, R), 'max of the sum = R');
  if (Math.abs(b) > 1e-9) near(Math.tan(phi), a / b, 1e-9 * Math.max(1, Math.abs(a / b)), 'tan φ = a / b');
}
{ const p = M.phasorSum(1, 1); near(p.R, Math.SQRT2, 1e-15, 'R = √2'); near(p.phi / M.DEG, 45, 1e-12, 'φ = 45°'); ok(p.R < 2, 'below 2'); both('s6hint', '1.414'); }
{ const p = M.phasorSum(1, -1); near(p.phi / M.DEG, 135, 1e-12, 'a = 1, b = −1: φ = 135°'); both('s6hint', '135°'); }
near(M.phasorSum(0, 1).phi, 0, 0, 'a = 0: φ = 0');

// ---- formatting helpers ----
assert.equal(M.piForm(Math.PI / 2), 'π/2'); assert.equal(M.piForm(2 * Math.PI), '2π'); assert.equal(M.piForm(-Math.PI / 4), '−π/4'); assert.equal(M.piForm(0), '0'); checks += 4;
ok(M.piForm(1) === null, 'non-multiples of π are decimals');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lgA', 'lgB', 'lgR', 'lgWave']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.compare.includes('三角函数 · 单位圆') && STRINGS.en.compare.includes('Trigonometric Functions · The Unit Circle'), 'compare link names the original');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique');
for (const id of ['th0', 'rad0', 'play0', 'd1', 'th2', 'play2', 'cos2', 'd3', 'd4', 'A5', 'w5', 'p5', 'play5', 'a6', 'b6', 't6', 'play6']) ok(ids.includes(id), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../math/geometry/trigonometry/index.html')), 'comparison link target exists');
for (let i = 0; i <= 7; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS trigonometry core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
