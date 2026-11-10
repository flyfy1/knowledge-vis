'use strict';
// Gravitational lensing (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s) => { for (const l of ['zh', 'en']) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };

// ---- step 0: deflection ----
near(M.deflectionArcsec(1, 1), 1.75, 0.005, 'Sun limb 1.75″');
both('s0hint', '1.75″');
for (let m = 1; m <= 10; m += 0.5) for (let b = 1; b <= 20; b += 0.5) {
  near(M.newtonArcsec(m, b) * 2, M.deflectionArcsec(m, b), 1e-12, 'Newton is exactly half');
  near(M.deflectionArcsec(m, 2 * b), M.deflectionArcsec(m, b) / 2, 1e-12, 'double b → half α');
  near(M.focusAU(m, 2 * b) / M.focusAU(m, b), 4, 1e-9, 'double b → 4× crossing distance');
  near(M.deflectionArcsec(m, b), m * M.deflectionArcsec(1, b), 1e-12, 'α ∝ M');
  ok(M.deflection(m, b) < 1e-4, 'weak field: α ≪ 1 rad over the slider range');
}
near(M.focusAU(1, 1), 548, 0.5, 'limb ray crosses the axis ≈ 548 AU');
both('s0hint', '548 AU');
// the sketch factor is one number for every ray (the title quotes it rounded to 100)
near(M.schematicFactor() * M.deflectionArcsec(1, 1) / 3600, M.SCHEMATIC_DEG_AT_LIMB, 1e-9, 'sketch factor');
// convex-lens contrast: a lens with α ∝ b focuses every ray at one point; α ∝ 1/b does not
ok(M.focusAU(1, 1) < M.focusAU(1, 2) && M.focusAU(1, 2) < M.focusAU(1, 3), 'no single focus');

// ---- step 1: lens equation ----
for (let b = 0.05; b <= 2.5 + 1e-9; b += 0.05) {
  const im = M.images(b);
  near(M.betaOf(im.tp), b, 1e-12, 'θ₊ solves the equation'); near(M.betaOf(im.tm), b, 1e-12, 'θ₋ solves the equation');
  ok(im.tp > 1 && im.tm < 0 && im.tm > -1, 'one image outside the circle on the source side, one inside opposite');
  ok(im.mp > 1 && im.mm < 0, 'outer image brightened; inner image mirror-flipped (μ < 0)');
  ok(Math.abs(im.mm) < im.mp, 'inner image always fainter');
  near(im.A, M.totalA(b), 1e-9, '|μ₊| + |μ₋| = A(u)');
  near(im.sep, Math.sqrt(b * b + 4), 1e-12, 'separation √(β² + 4)');
  near(im.mp - Math.abs(im.mm), 1, 1e-9, 'μ₊ − |μ₋| = 1');
  near(im.tp - b, 1 / im.tp, 1e-12, 'outer image approaches the source');
}
{ // quiz: from β = 0.2 to 2.5 the inner image moves in and fades monotonically; ≈ 0.015× at 2.5
  let pt = Infinity, pm = Infinity;
  for (let b = 0.2; b <= 2.5 + 1e-9; b += 0.01) { const im = M.images(b); ok(Math.abs(im.tm) < pt && Math.abs(im.mm) < pm, 'inner image moves in and fades'); pt = Math.abs(im.tm); pm = Math.abs(im.mm); }
  near(Math.abs(M.images(2.5).mm), 0.015, 0.0005, 'inner image ≈ 0.015× at β = 2.5'); both('correct', '0.015');
  ok(M.images(2.5).mp < 1.02, 'outer image brightness → 1 at large β');
}
ok(M.images(0).ring, 'β = 0 gives a ring');

// ---- step 2: Einstein radius ----
const P = M.PRESETS, rc = k => M.ringCase(P[k].logM, P[k].logDs, P[k].x);
const star = rc('star'), gal = rc('galaxy'), clu = rc('cluster');
near(star.sepArcsec * 1e3, 1.4, 0.05, 'star 2θE ≈ 1.4 mas'); both('s2hint', '1.4 mas');
ok(star.arcsec * 1e3 < 1, 'star θE under 1 mas (s3e)');
near(gal.sepArcsec, 4, 0.1, 'galaxy 2θE ≈ 4″'); both('s2hint', '4″');
near(clu.sepArcsec / 60, 2, 0.15, 'cluster 2θE ≈ 2′'); both('s2hint', '2′');
near(M.HUBBLE, 0.05, 0.003, 'Hubble diffraction limit ≈ 0.05″');
// the verdict each preset gets (s2v3, s2v1, s2v0)
ok(star.sepArcsec < M.HUBBLE && gal.sepArcsec > 1 && gal.sepArcsec < 60 && clu.sepArcsec > 60, 'preset verdicts');
// θE ∝ √M, decreasing in x, and equals the closed form; R_E = θE·D_l peaks at x = 0.5
for (let x = 0.05; x < 0.95; x += 0.05) {
  const a = M.ringCase(12, 9, x), b2 = M.ringCase(12, 9, x + 0.05);
  ok(b2.arcsec < a.arcsec, 'θE shrinks as the lens moves away');
  near(a.arcsec / M.ringCase(12, 9, 0.5).arcsec, Math.sqrt((1 - x) / x), 1e-9, 'θE ∝ √((1 − x)/x)');
  near(M.ringCase(14, 9, x).arcsec / a.arcsec, 10, 1e-9, '100× mass → 10× θE');
}
// θE solves the β = 0 lens equation: θ = (D_ls/D_s)·α(b = θ·D_l)
{ const ds = 1e9 * M.PC, dl = 0.4 * ds, m = 1e12, th = M.thetaE(m, dl, ds);
  near(th, (ds - dl) / ds * 4 * M.G * m * M.MSUN / (M.c * M.c * th * dl), 1e-15, 'θE from the lens equation'); }

// ---- step 3: microlensing ----
near(M.totalA(1), 1.34, 0.005, 'A(1) = 1.34'); both('s3hint', '1.34');
near(M.totalA(0.1), 10.04, 0.005, 'A(0.1) = 10.04'); both('s3hint', '10.04');
for (let u0 = 0.1; u0 <= 1.5 + 1e-9; u0 += 0.05) {
  for (let tt = 0; tt <= 2; tt += 0.02) near(M.lightCurve(u0, tt), M.lightCurve(u0, -tt), 1e-12, 'symmetric light curve');
  for (let tt = 0.02; tt <= 2; tt += 0.02) ok(M.lightCurve(u0, tt) < M.lightCurve(u0, tt - 0.02), 'falls away from the peak');
  ok(M.totalA(u0) > M.totalA(u0 + 0.05), 'smaller u₀ → higher peak');
}
for (const u0 of [0.1, 0.05, 0.02]) near(M.totalA(u0) * u0, 1, 0.005, 'peak ≈ 1/u₀ for small u₀');
near(M.dMag(Math.pow(10, 0.4)), 1, 1e-12, '1 magnitude = 10^0.4 ≈ 2.5×'); near(Math.pow(10, 0.4), 2.5, 0.02, '≈ 2.5');

// ---- step 4: arcs and rings ----
// extended-source magnification: ring integral vs pixel count on a fine grid
for (const [b, r] of [[0.5, 0.2], [0.1, 0.2], [1, 0.1], [0.3, 0.3], [1.5, 0.5], [0, 0.2], [0.8, 0.05]]) {
  near(M.maskMag(b, r, 1400, M.EXT4) / M.extendedMag(b, r), 1, 0.01, `area ratio by pixels vs integral β=${b} ρ=${r}`);
}
ok(isFinite(M.extendedMag(0, 0.2)), 'β = 0: the disc’s area ratio is finite');
near(Math.abs(M.extendedMag(1, 0.2) / M.totalA(1) - 1), 0.004, 0.001, 'ρ = 0.2, β = 1: ≈ 0.4% apart'); both('s4hint', '0.4%');
near(Math.abs(M.extendedMag(0.2, 0.2) / M.totalA(0.2) - 1), 0.27, 0.01, 'ρ = 0.2, β = 0.2: ≈ 27% apart'); both('s4hint', '27%');
// arc span: the azimuths covered by the outer image = 2·asin(ρ/β); full circle iff β ≤ ρ
function azSpan(b, r, which) {
  const n = 700, ext = M.EXT4, m = M.imageMask(b, r, n, ext), d = 2 * ext / n, bins = new Uint8Array(720);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (m[j * n + i] === which) {
    const x = -ext + (i + 0.5) * d, y = ext - (j + 0.5) * d; bins[Math.floor(((Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * 720) % 720] = 1;
  }
  return bins.reduce((s, v) => s + v, 0) / 2; // degrees
}
for (const [b, r] of [[0.5, 0.2], [1, 0.3], [1.5, 0.5], [0.6, 0.1]]) {
  near(azSpan(b, r, 1), M.arcSpanDeg(b, r), 3, `outer arc span β=${b} ρ=${r}`);
  near(azSpan(b, r, 2), M.arcSpanDeg(b, r), 4, `inner arc span β=${b} ρ=${r}`);
}
for (const [b, r] of [[0.1, 0.2], [0.2, 0.25], [0, 0.1]]) { ok(M.arcSpanDeg(b, r) === 360, 'ring when β ≤ ρ'); ok(azSpan(b, r, 1) >= 359, 'pixels form a closed ring'); }
// mirror flip: the inner image's upper half comes from the disc's lower half
{ const n = 400, ext = M.EXT4, d = 2 * ext / n; let flipped = 0, kept = 0;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = -ext + (i + 0.5) * d, y = ext - (j + 0.5) * d; if (!M.inSource(x, y, 0.5, 0.2) || Math.abs(y) < 0.02) continue; const s = M.sourceOf(x, y); const inner = x * x + y * y < 1; if (inner) { if (Math.sign(y) !== Math.sign(s[1])) flipped++; } else if (Math.sign(y) === Math.sign(s[1])) kept++; }
  ok(flipped > 50 && kept > 50, 'inner image colours upside down, outer image upright'); }

// ---- step 5: weighing ----
near(M.massFromRing(1.5, 1000, 2000) / 1e11, 5.52, 0.01, 'default M = 5.52×10¹¹ M☉');
near(M.ringRadiusKpc(1.5, 1000), 7.27, 0.01, 'ring radius 7.27 kpc');
near(1e3 * M.PC / 9.4607e15, 3260, 5, '1 kpc ≈ 3260 light-years'); both('s5readout', '3260') ;
for (let th = 0.3; th <= 3; th += 0.05) {
  near(M.massFromRing(2 * th, 1000, 2000) / M.massFromRing(th, 1000, 2000), 4, 1e-9, 'double θE → 4× M');
  // round trip with step 2's formula
  const m = M.massFromRing(th, 800, 2400), back = M.thetaE(m, 800e6 * M.PC, 2400e6 * M.PC) / M.ARCSEC;
  near(back, th, 1e-9, 'M → θE round trip');
}
near((0.95 * 0.95 - 1) * 100, -9.75, 1e-9, '−5% θE → −9.75% M'); near((1.05 * 1.05 - 1) * 100, 10.25, 1e-9, '+5% θE → +10.25% M');
for (let ds = 1050; ds < 4000; ds += 50) ok(M.massFromRing(1.5, 1000, ds + 50) < M.massFromRing(1.5, 1000, ds), 'farther source → smaller M');
ok(M.massFromRing(1.5, 1000, 4000) > M.massFromRing(1.5, 1000, 1e12), 'never below the floor');
near(M.massFromRing(1.5, 1000, 1e12), M.c * M.c * Math.pow(1.5 * M.ARCSEC, 2) * 1e9 * M.PC / (4 * M.G) / M.MSUN, 1e-3 * M.massFromRing(1.5, 1000, 1e12), 'floor c²θE²D_l/(4G)');
ok(Number.isNaN(M.massFromRing(1.5, 1000, 1000)), 'D_s ≤ D_l rejected');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const q of M.RESOLUTION) ok(STRINGS.zh[q.key] !== undefined, 'resolution label ' + q.key);
for (const id of ['b0', 'm0', 'beta1', 'lm2', 'ds2', 'x2', 'pStar', 'pGalaxy', 'pCluster', 'u03', 't3', 'play3', 'clear3', 'beta4', 'rho4', 'th5', 'dl5', 'ds5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/astronomy/gravitational-lensing/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS gravitational-lensing core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
