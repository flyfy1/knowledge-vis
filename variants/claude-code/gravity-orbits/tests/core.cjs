'use strict';
// Gravity and orbits (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s, s2 = s) => { ok(STRINGS.zh[key].includes(s), `zh.${key} quotes ${s}`); ok(STRINGS.en[key].includes(s2), `en.${key} quotes ${s2}`); };
const R = M.R, R0 = R + M.TOWER;

// ---- step 0 ----
near(M.G0, 9.82, 0.005, 'g₀ ≈ 9.82'); both('s0e', '9.82');
near(M.gAt(2) / M.G0, 0.25, 1e-12, 'r = 2 → 1/4'); near(M.gAt(10) / M.G0, 0.01, 1e-12, 'r = 10 → 1/100');
near(M.MOON.a / R, 60.3, 0.05, 'Moon at 60.3 R⊕'); both('s0e', '60.3');
near(M.gAt(60.3), 0.00270, 0.000005, 'inverse square at the Moon 0.00270'); both('s0hint', '0.00270');
near(M.moonAccel(), 0.00272, 0.000005, 'Moon centripetal 0.00272'); both('s0hint', '0.00272');
near(Math.abs(M.moonAccel() / M.gAt(M.MOON.a / R) - 1), 0.01, 0.003, 'they differ by about 1%');

// ---- step 1: the cannon (numerical paths vs closed forms) ----
near(M.vCirc(R0) / 1e3, 7.35, 0.005, 'circular speed 7.35'); both('s1e', '7.35');
near(M.vEsc(R0) / 1e3, 10.40, 0.005, 'escape speed 10.40'); both('s1e', '10.40');
near(M.vGraze(R0) / 1e3, 7.08, 0.005, 'grazing speed 7.08'); both('s1e', '7.08'); both('s1hint', '7.08');
for (let v = 1000; v <= 11000; v += 50) {
  const f = M.fly(R0, v, { rMax: M.FRAME1 }), cls = M.classify(R0, v);
  if (cls === 'ground') ok(f.outcome === 'ground', `v=${v} lands`);
  else if (cls === 'escape') ok(f.outcome === 'escape', `v=${v} escapes`);
  else {
    const other = M.otherTurn(R0, v);
    if (Math.max(other, R0) < M.FRAME1) {
      ok(f.outcome === 'orbit', `v=${v} closes an orbit`);
      near(f.rmin, Math.min(other, R0), 2e3, `v=${v} perigee vs closed form`); near(f.rmax, Math.max(other, R0), 2e3, `v=${v} apogee vs closed form`);
      near(f.T, M.periodOf((other + R0) / 2), 3, `v=${v} period vs Kepler`);
    } else ok(f.outcome === 'escape' && v < M.vEsc(R0), `v=${v} leaves the frame though bound (s1far)`);
  }
  // energy conservation along the integrated path (RK4, dt = 2 s)
  const E0 = v * v / 2 - M.GM / R0, E1 = f.vEnd * f.vEnd / 2 - M.GM / Math.hypot(f.pts[f.pts.length - 1].x, f.pts[f.pts.length - 1].y);
  if (f.outcome !== 'ground') near(E1 / Math.abs(E0), E0 / Math.abs(E0), 1e-6, `energy conserved v=${v}`);
}
{ const lo = M.fly(R0, 7060, { rMax: M.FRAME1 }), hi = M.fly(R0, 7100, { rMax: M.FRAME1 }); ok(lo.outcome === 'ground' && hi.outcome === 'orbit', 'the 7.08 divide'); }
near(Math.sqrt(2), M.vEsc(R0) / M.vCirc(R0), 1e-12, 'escape = √2 × circular');

// ---- step 2: straight up ----
near(M.vEsc(R) / 1e3, 11.19, 0.005, 'surface escape 11.19'); both('s2e', '11.19'); both('s2hint', '11.19');
near(M.riseTrue(3000) / 1e3, 494, 0.5, 'v = 3: 494 km'); near(M.riseFlat(3000) / 1e3, 458, 0.5, 'v = 3 flat: 458 km'); both('s2hint', '494'); both('s2hint', '458');
near(M.riseTrue(9000) / M.riseFlat(9000), 2.84, 0.01, 'v = 9: nearly 3×');
ok(M.riseTrue(11190) === Infinity && isFinite(M.riseTrue(11180)), 'escape threshold');
for (let v = 50; v < 11180; v += 50) {
  ok(M.riseTrue(v) > M.riseFlat(v), 'inverse square always rises higher');
  near(M.U(R + M.riseTrue(v)), v * v / 2 - M.GM / R, 1e-6 * M.GM / R, 'turning point: E = U(r_top)');
  near(M.Uflat(R + M.riseFlat(v)), v * v / 2 - M.GM / R, 1e-6 * M.GM / R, 'flat turning point on the straight line');
}

// ---- step 3: equal areas ----
for (let v = 7400; v <= 9800; v += 200) {
  const w = M.wedges(R0, v);
  ok(w !== null, `v=${v} bound orbit within slice integration`);
  ok(w.spread < 0.003, `equal areas v=${v}: spread ${w.spread}`);
  near(w.vp / w.va, w.ra / w.rp, 1e-6 * w.ra / w.rp, `v_p/v_a = r_a/r_p v=${v}`);
  near(w.areas.reduce((a, b) => a + b, 0) / w.ellipseArea, 1, 1e-4, 'slices add up to the ellipse');
  near(w.rp, R0, 1, 'launch point is perigee');
}
{ const w = M.wedges(R0, 9000); ok(w.lenRatio > 2.5, 'v = 9: path lengths differ a lot'); ok(w.spread < 0.0002, 'v = 9: areas within 0.02%');
  const c = M.wedges(R0, 7400); ok(c.lenRatio < 1.05, 'v = 7.4: path lengths nearly level'); }

// ---- step 4: period law from simulation ----
for (const h of [200, 1000, 5000, 20000, 40000]) for (const q of [0.8, 0.9, 0.95, 1, 1.1, 1.2, 1.3]) {
  const m = M.measureOrbit(h, q), r0 = R + h * 1e3, other = M.otherTurn(r0, q * M.vCirc(r0));
  ok(m.ok === (Math.min(other, r0) > R), `h=${h} q=${q} crash iff perigee below ground`);
  if (m.ok) { near(m.ratio / m.law, 1, 1e-6, `T²/a³ = 4π²/GM h=${h} q=${q}`); }
}
{ const a = M.measureOrbit(1000, 1), b = M.measureOrbit(1000, 1.2); near(a.T / 3600, 1.75, 0.01, 'default orbit ≈ 1.75 h'); ok(b.T > a.T, 'bigger a, longer period'); }
// the chart ranges hold every measurable orbit on the sliders
{ const m = M.measureOrbit(40000, 1.3); ok(Math.log10(m.a / 1e6) < 2.4 && Math.log10(m.T / 3600) < 2.6, 'largest orbit inside the log chart');
  const s = M.measureOrbit(200, 1); ok(Math.log10(s.a / 1e6) > 0.75 && Math.log10(s.T / 3600) > -0.05, 'smallest orbit inside the log chart'); }

// ---- step 5: circular satellites ----
const [iss, gps, geo, moon] = M.SATS.map(s => M.circular(s.alt));
near(iss.T / 60, 93, 0.5, 'ISS ≈ 93 min'); both('s5hint', '93');
near(gps.T / 3600, 12, 0.05, 'GPS ≈ 12 h'); both('s5hint', '12');
near(geo.T, M.SIDEREAL_DAY, 1e-6, 'GEO period = sidereal day');
near((M.aForPeriod(M.SIDEREAL_DAY) - R) / 1e3, 35790, 10, 'GEO ≈ 35790 km'); both('s5hint', '35790'); both('s6fin', '35790');
near(moon.T / 86400, 27.45, 0.005, 'Moon by formula 27.45 d'); both('s5hint', '27.45');
ok(moon.T / 86400 > 27.32, 'longer than the measured month');
near(M.SIDEREAL_DAY, 23 * 3600 + 56 * 60 + 4, 0.5, '23 h 56 min');
ok(Math.log10(M.SATS[0].alt / 1e3) > 2.3 && Math.log10(M.SATS[3].alt / 1e3) < 5.6, 'satellites inside the slider range');
for (let x = 2.3; x < 5.6; x += 0.05) ok(M.circular(Math.pow(10, x + 0.05) * 1e3).T > M.circular(Math.pow(10, x) * 1e3).T, 'higher → longer period');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['s0lgCurve']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/t\(v < M\.vCirc\(R0\) \? '([A-Za-z0-9]+)' : '([A-Za-z0-9]+)'/g)) ok(STRINGS.zh[m[1]] && STRINGS.zh[m[2]], 'ellipse keys');
for (const s of M.SATS) ok(STRINGS.zh[s.key] !== undefined, 'satellite label ' + s.key);
for (const id of ['r0', 'moon0', 'v1', 'fire1', 'circ1', 'esc1', 'clear1', 'v2', 'v3', 'play3', 'h4', 'q4', 'add4', 'clear4', 'alt5', 'geo5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/astronomy/gravity-orbits/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS gravity-orbits core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
