'use strict';
// Kepler orbits (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const both = (key, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`));

// ---- Kepler's equation and geometry ----
for (const e of [0, 0.1, 0.5, 0.9, 0.967]) for (let i = 0; i <= 200; i++) {
  const Mm = 2 * Math.PI * i / 200, E = M.solveKepler(Mm, e);
  near(E - e * Math.sin(E), Mm, 1e-10, `Kepler eq e=${e}`);
  const p = M.pointE(1, e, E);
  near(p.r, 1 - e * Math.cos(E), 1e-12, 'r = a(1 − e cos E)');
  const fd = M.focalDistances(1, e, E);
  near(fd.r1 + fd.r2, 2, 1e-12, 'r1 + r2 = 2a'); // step 0 readout sum
}
// step 0: perihelion / aphelion, presets
for (const e of [0, 0.017, 0.093, 0.206, 0.5, 0.967]) {
  const S = M.shape(1, e);
  near(S.rp, 1 - e, 1e-15, 'rp'); near(S.ra, 1 + e, 1e-15, 'ra');
  near(M.pointE(1, e, 0).r, S.rp, 1e-12, 'E = 0 is perihelion'); near(M.pointE(1, e, Math.PI).r, S.ra, 1e-12, 'E = π is aphelion');
  // nearest/farthest over the orbit really are these
  let mn = Infinity, mx = 0; for (let i = 0; i < 3600; i++) { const r = M.pointE(1, e, 2 * Math.PI * i / 3600).r; mn = Math.min(mn, r); mx = Math.max(mx, r); }
  near(mn, S.rp, 1e-9, 'min r'); near(mx, S.ra, 1e-9, 'max r');
}
// s0hint: Earth's near/far differ by about 3%
{ const S = M.shape(1, 0.017); ok(S.ra / S.rp - 1 > 0.03 && S.ra / S.rp - 1 < 0.04, 'Earth far/near ≈ 3%'); both('s0hint', '0.017'); both('s0hint', '3%'); }
for (const v of ['0.017', '0.093', '0.206', '0.967']) ok(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes(`data-preset="${v}"`), 'preset ' + v);

// ---- step 1: equal areas; arcs differ ----
for (const e of [0, 0.3, 0.6, 0.9]) {
  const S = M.slices(e, 12);
  for (let k = 0; k < 12; k++) near(M.sectorAreaNumeric(1, e, k / 12, (k + 1) / 12, 2000) / S.total, 1 / 12, 2e-6, `equal area e=${e} k=${k}`);
  if (e === 0) near(S.longest / S.shortest, 1, 1e-6, 'circle: equal arcs');
  else ok(S.longest / S.shortest > 1.5, 'ellipse: arcs differ');
}
// arc ratio grows with e (the readout's direction)
{ let prev = 0; for (let e = 0; e <= 0.9; e += 0.1) { const r = M.slices(e).longest / M.slices(e).shortest; ok(r >= prev - 1e-9, 'arc ratio grows with e'); prev = r; } }
// numerically: dA/dt constant = πab/T at many sample times
for (const e of [0.2, 0.8]) for (let i = 0; i < 50; i++) { const q = i / 50, h = 1e-5; near(M.sectorAreaNumeric(1, e, q, q + h, 4) / h, Math.PI * Math.sqrt(1 - e * e), 1e-3, 'areal velocity constant'); }

// ---- step 2: vis-viva ----
near(M.vCirc(1), 29.78, 0.005, 'circular speed at 1 AU = 29.78 km/s'); both('s2hint', '29.78');
near(M.periodDays(1), 365.256, 0.001, 'period at 1 AU');
for (const e of [0, 0.3, 0.5, 0.9]) {
  const S = M.shape(1, e), vp = M.speedAt(1, S.rp), va = M.speedAt(1, S.ra);
  near(vp / va, (1 + e) / (1 - e), 1e-9, 'v_p / v_a = (1+e)/(1−e)');
  near(vp * S.rp, va * S.ra, 1e-9, 'angular momentum at apsides');
  for (let i = 0; i <= 200; i++) {
    const s = M.state(1, e, i / 200);
    // vis-viva vs numerical derivative of position
    const h = 1e-6, s2 = M.state(1, e, i / 200 + h), vNum = Math.hypot(s2.x - s.x, s2.y - s.y) * M.AU / (h * M.periodSec(1)) / 1000;
    near(s.v, vNum, 2e-3 * s.v + 1e-3, 'vis-viva = |dr/dt|');
    ok(s.v <= vp + 1e-9 && s.v >= va - 1e-9, 'speed between aphelion and perihelion values');
  }
  if (e === 0) for (let i = 0; i <= 20; i++) near(M.state(1, 0, i / 20).v, M.vCirc(1), 1e-9, 'e = 0: constant speed');
}
// v(t) peak is narrower than the trough (s2hint): time spent above the mean speed < half a period for e = 0.5
{ let above = 0; const vbar = (M.speedAt(1, 0.5) + M.speedAt(1, 1.5)) / 2; for (let i = 0; i < 1000; i++) if (M.state(1, 0.5, i / 1000).v > vbar) above++; ok(above < 400, 'fast part is brief: ' + above + '/1000'); }

// ---- step 3: third law ----
for (const b of M.BODIES) near(M.periodYears(b.a) / b.T, 1, 0.006, 'T = a^{3/2} vs measured for ' + b.id);
near(M.periodYears(17.83), 75.3, 0.05, 'Halley formula'); both('s3readout', '75.3'); both('s3readout', '17.83'); both('s3readout', '0.967');
near(M.periodYears(4) / M.periodYears(1), 8, 1e-9, '4× a → 8× T'); both('s3hint', '√(4³) = 8');
// same a, any e: both back at perihelion after one period (state at q = 1 equals q = 0)
for (const e of [0, 0.6, 0.9]) { const s0 = M.state(1, e, 0), s1 = M.state(1, e, 1); near(s0.x, s1.x, 1e-9, 'lap closes x'); near(s0.y, s1.y, 1e-9, 'lap closes y'); }
// slider range 10^−0.6 .. 10^1.6 inside the plot's 10^−0.7 .. 10^1.7; all bodies inside
ok(M.BODIES.every(b => Math.log10(b.a) > -0.7 && Math.log10(b.a) < 1.7 && Math.log10(b.T) > -1 && Math.log10(b.T) < 2.6), 'bodies inside log plot');
ok(Math.log10(M.periodYears(Math.pow(10, 1.6))) < 2.6 && Math.log10(M.periodYears(Math.pow(10, -0.6))) > -1, 'slider range inside plot');

// ---- step 4: transit depth and duration ----
for (const rp of [0.5, 1, 4, 11.2, 12]) {
  const k = M.kOf(rp);
  near(M.flux(0, k), 1 - k * k, 1e-12, 'full depth k²');
  near(M.flux(1 + k + 1e-9, k), 1, 1e-12, 'no overlap outside');
  // overlap area by grid integration at partial overlap
  const d = 1, g = 600; let inside = 0;
  for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) { const x = d - k + 2 * k * (i + 0.5) / g, y = -k + 2 * k * (j + 0.5) / g; if ((x - d) ** 2 + y * y <= k * k && x * x + y * y <= 1) inside++; }
  near(M.overlap(d, k), inside / (g * g) * 4 * k * k, 4 * k * k * 0.004, 'partial overlap area rp=' + rp);
  for (const a of [0.02, 0.05, 0.3, 1, 1.58]) {
    const tr = M.transit(rp, a, 90);
    // duration = time between first and fourth contact from the projected separation
    const T = M.periodSec(a) / 3600, A = M.aR(a); let lo = null, hi = null;
    for (let i = -20000; i <= 20000; i++) { const ph = i / 20000 * 0.3, s = M.sep(A, 90, ph); if (s.front && s.d < 1 + k) { if (lo === null) lo = ph; hi = ph; } }
    near(tr.durH, (hi - lo) / (2 * Math.PI) * T, T * 0.3 / 20000 / Math.PI * 2 + 1e-6, `duration rp=${rp} a=${a}`);
    // the step-4 slider window (±1.6 R★) covers the whole transit
    ok(M.hoursAtX(a, 1.6) > tr.durH / 2, 'x range covers the transit');
  }
}
{ const E = M.transit(1, 1, 90), J = M.transit(11.2, 1, 90);
  near(E.depth * 1e6, 84, 0.5, 'Earth depth ≈ 84 ppm'); near(E.durH, 13.1, 0.05, 'Earth duration ≈ 13 h');
  near(J.depth, 0.0105, 0.0003, 'Jupiter depth ≈ 1%');
  both('s4hint', '84 ppm'); both('s4hint', '13'); both('s4hint', '1%'); both('s4e', '11.2');
  near(M.R_JUP / M.R_EARTH, 11.2, 0.05, 'Jupiter ≈ 11.2 R⊕');
  // depth ∝ Rp² (double the radius → 4×), duration ~ √a
  near(M.transit(8, 0.1, 90).depth / M.transit(4, 0.1, 90).depth, 4, 1e-9, 'depth ∝ Rp²');
  near(M.transit(1, 0.4, 90).durH / M.transit(1, 0.1, 90).durH, 2, 0.01, 'duration ∝ √a');
}

// ---- step 5: alignment ----
{ const hj = M.transit(11.2, 0.05, 90), e1 = M.transit(11.2, 1, 90);
  near(hj.iMin, 84.1, 0.05, 'a = 0.05 AU window → 84.1°');
  near(90 - e1.iMin, 0.29, 0.005, 'a = 1 AU window ≈ 0.29°'); both('s5hint', '0.29°');
  for (const a of [0.02, 0.05, 0.2, 1]) for (let i = 80; i <= 90; i += 0.01) {
    const tr = M.transit(11.2, a, i);
    ok(tr.hits === (i > tr.iMin), 'hit iff i > iMin');
    // geometric check: minimum projected separation during the front half equals b
    if (Math.abs(i - Math.round(i)) < 1e-9) { let dmin = Infinity; for (let p = -300; p <= 300; p++) dmin = Math.min(dmin, M.sep(tr.A, i, p / 1000).d); near(dmin, tr.b, 1e-6, 'b = closest approach'); }
  }
  // random orientations: fraction → (R★ + Rp)/a
  const cs = M.orientations(200000, 2026);
  for (const a of [0.02, 0.05, 0.2]) { const tr = M.transit(11.2, a, 90), f = cs.filter(c => c * tr.A < 1 + tr.k).length / cs.length; near(f, tr.prob, 0.004, 'Monte Carlo fraction a=' + a); }
  // 1 AU: about 0.5% (s6fin), Earth-size 0.47%
  near(M.transit(1, 1, 90).prob * 100, 0.47, 0.005, 'P(1 AU, Earth) ≈ 0.47%'); both('s6fin', '0.5%');
  // the default (a = 0.05, i = 87) transits; slider 80..90 contains the 84.1 window edge
  ok(M.transit(11.2, 0.05, 87).hits, 'default transits');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['au', 's3lgLaw']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|\bleft (plot|panel|chart)\b|\bright (plot|panel|chart)\b/i.test(v), `no left/right figure reference in ${l}.${k}`);

// ---- every key referenced in HTML/app exists; controls present ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const b of M.BODIES) ok(STRINGS.zh['b_' + b.id] && STRINGS.en['b_' + b.id], 'body name ' + b.id);
for (const id of ['e0', 'p0', 'e1', 'play1', 'all1', 'e2', 'q2', 'play2', 'a3', 'e3', 'play3', 'rp4', 'a4', 'x4', 'sweep4', 'i5', 'a5', 'many5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
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
ok(fs.existsSync(path.join(dir, '../../../earth/astronomy/kepler-orbits/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS kepler-orbits core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
