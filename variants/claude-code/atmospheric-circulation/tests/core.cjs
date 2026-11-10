'use strict';
// Atmospheric circulation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- step 0: energy-balance model ----
const r0 = M.ebm(0);
r0.T.forEach((T, i) => near(M.EBM.A + M.EBM.B * T, M.absorbed(r0.xs[i]), 1e-9, 'D = 0: each strip balances locally'));
r0.F.forEach(F => near(F, 0, 1e-6, 'D = 0: no transport'));
const gap0 = r0.eq - r0.pole;
ok(gap0 > 100 && gap0 < 120, 'no-transport gap “over a hundred degrees” ≈ 115 (s0hint, s3hint, s6fin)');
near(Math.round(gap0 / 5) * 5, 115, 0, 'step 3 default difference 115 = rounded D = 0 gap');
let prevGap = Infinity, prevPeak = -1;
for (let D = 0; D <= 1.5 + 1e-9; D += 0.05) {
  const r = M.ebm(D);
  near(r.mean, r0.mean, 1e-6, 'global mean independent of D');
  // energy conservation: integral of (absorbed − emitted) over the hemisphere is zero, and the transport at the
  // pole-ward face of each cell equals the accumulated surplus equatorward of it
  let acc = 0; const dx = 1 / M.EBM.N, area = 2 * Math.PI * M.R_EARTH * M.R_EARTH * dx;
  r.xs.forEach((x, i) => { acc += (M.absorbed(x) - M.EBM.A - M.EBM.B * r.T[i]) * area; near(r.F[i + 1], acc, Math.max(1e7, Math.abs(acc) * 1e-6), 'transport = accumulated surplus'); });
  const gap = r.eq - r.pole; ok(gap < prevGap + 1e-9, 'gap shrinks as D grows'); prevGap = gap;
  if (D > 0) { ok(r.peakPW > prevPeak, 'peak transport grows with D'); prevPeak = r.peakPW; ok(r.cross > 30 && r.cross < 36, 'surplus/deficit boundary in the mid-30s'); }
}
near(r0.mean, 14.6, 0.05, 'global mean 14.6 °C');
const r65 = M.ebm(0.65);
ok(r65.peakPW > 5.3 && r65.peakPW < 5.7, 'D = 0.65 → peak ≈ 5.5 PW (s0hint, s6fin “about 5 PW”)');
ok(r65.peakLat > 30 && r65.peakLat < 36, 'peak a little past 30°');
ok(r65.eq - r65.pole > 38 && r65.eq - r65.pole < 44, 'D = 0.65 gap “around forty” (s6fin)');
ok(M.ebm(1.5).peakPW < 8, 'transport axis 0–8 PW covers the slider');
ok(r0.eq < 60 && r0.pole > -60, 'temperature axis ±60 covers D = 0');
for (let i = 0; i < r0.xs.length; i++) { const a = M.absorbed(r0.xs[i]); ok(a > 50 && a < 350, 'energy axis 50–350 covers absorbed'); }

// ---- step 1: columns ----
near(M.zOf(500, 289) - M.zOf(500, 288), 287 / 9.81 * Math.log(2), 1e-9, '≈ 20 m per °C at 500 hPa');
ok(Math.abs(287 / 9.81 * Math.log(2) - 20) < 0.5, '“about 20 m” per degree (s1hint)');
for (let dT = -20; dT <= 20; dT++) {
  const c = M.columns(dT);
  ok(Math.sign(c.z500land - c.z500sea) === Math.sign(dT), 'warm column has the higher 500 hPa surface');
  ok(Math.sign(c.dp5km) === Math.sign(dT), 'higher pressure aloft over the warm column');
  for (let p = 900; p >= 300; p -= 100) { const d = M.zOf(p, c.Tland) - M.zOf(p, c.Tsea); ok(Math.abs(d) >= Math.abs(M.zOf(p + 100, c.Tland) - M.zOf(p + 100, c.Tsea)) - 1e-9, 'tilt grows with height'); ok(M.zOf(p, c.Tland) < 10000 && M.zOf(p, c.Tsea) < 10000, '300 hPa below 10 km axis'); }
}
near(M.pAt(M.zOf(500, 288), 288), 500, 1e-9, 'pAt inverts zOf');

// ---- step 2: angular momentum ----
near(M.groundSpeed(0), 465, 1, 'equator ground ≈ 465 m/s');
near(M.uAM(30), 134, 0.5, '30° → 134 m/s'); ok(M.uAM(60) > 690 && M.uAM(60) < 700, '60° → nearly 700 m/s');
for (let p = -60; p <= 60; p++) {
  const c = Math.cos(p * M.DEG);
  near((M.groundSpeed(p) + M.uAM(p)) * M.R_EARTH * c, M.OMEGA * M.R_EARTH * M.R_EARTH, 1e-3 * M.OMEGA * M.R_EARTH * M.R_EARTH, 'angular momentum conserved');
  near(M.uAM(p), M.uAM(-p), 1e-9, 'westerly in both hemispheres'); ok(M.uAM(p) <= 750, 'speed axis covers ±60°');
  ok(Math.sign(M.coriolisF(p)) === Math.sign(p), 'f > 0 north (right), < 0 south (left), 0 at equator');
}

// ---- step 3: Held–Hou ----
const e24 = M.hadleyEdge(24, 115), e12 = M.hadleyEdge(12, 115), e48 = M.hadleyEdge(48, 115), e96 = M.hadleyEdge(96, 115);
ok(e24.deg > 30 && e24.deg < 32 && e24.valid, '24 h, 115 °C → ≈ 31°, valid');
near(e12.deg, e24.deg / 2, 1e-9, '12 h halves the cell'); near(e48.deg, e24.deg * 2, 1e-9, '48 h doubles (quiz)');
ok(e48.deg > 55 && e48.deg < 65 && !e48.valid, '48 h → ≈ 60°, beyond the range (quiz answer b)');
ok(e96.deg > 90 && !e96.valid, '96 h → beyond the pole, flagged');
near(M.hadleyEdge(24, 4 * 40).deg, 2 * M.hadleyEdge(24, 40).deg, 1e-9, 'edge ∝ √ΔT');

// ---- step 4: belts ----
const fromAt = p => { const w = M.surfaceWind(p); return M.fromDir(w.u, w.v); };
[[15, 'NE'], [45, 'SW'], [75, 'NE'], [-15, 'SE'], [-45, 'NW'], [-75, 'SE']].forEach(([p, d]) => ok(fromAt(p) === d, `wind at ${p} from ${d}`));
for (let p = -85; p <= 85; p++) {
  const b = M.band(p), a = Math.abs(p);
  ok(b.belt === (a < 30 ? 'trade' : a < 60 ? 'westerly' : 'polar'), 'belt name');
  const w = M.surfaceWind(p);
  if (a > 3 && a < 27) ok(w.v * Math.sign(p) < 0 && w.u < 0, 'trades blow toward the equator and west');
  if (a > 33 && a < 57) ok(w.v * Math.sign(p) > 0 && w.u > 0, 'westerlies blow poleward and east');
}
ok(M.band(0).motion === 'rise' && M.band(30).motion === 'sink' && M.band(-60).motion === 'rise' && M.band(85).motion === 'sink', 'rising and sinking belts');

// ---- step 5: monsoon ----
const ins = M.MONTH_DAY.map(d => M.dailyInsolation(20, d));
ok(ins[5] > ins[11] + 100, '20° N gets far more sun in June than December');
near(M.dailyInsolation(0, 80), 1361 / Math.PI, 1e-6, 'equinox at the equator = S0/π');
const m50 = M.monsoon(50), m10 = M.monsoon(10);
ok(m50.landAmp > 5 * m50.seaAmp, 'land swings far more than a 50 m sea');
ok(m10.seaAmp > m50.seaAmp && Math.max(...m10.diff) < Math.max(...m50.diff), 'shallower sea swings more; land–sea contrast shrinks (s5hint)');
ok(m50.seaPeak > m50.landPeak + 30, 'sea peaks later than land');
ok(M.monthOfDay(m50.landPeak) === 6 && M.monthOfDay(m50.seaPeak) === 8, 'land warmest in July, sea in September (default)');
[5, 6, 7, 8].forEach(i => ok(m50.diff[M.MONTH_DAY[i]] > 1, 'Jun–Sep: land warmer → SW monsoon'));
[10, 11, 0, 1, 2].forEach(i => ok(m50.diff[M.MONTH_DAY[i]] < -1, 'Nov–Mar: land colder → NE monsoon'));
for (let dpt = 10; dpt <= 100; dpt += 10) { const m = M.monsoon(dpt); [...m.land, ...m.sea].forEach(v => ok(Math.abs(v) < 36, 'anomaly axis ±36 covers every depth')); near(m.land.reduce((s, v) => s + v, 0) / 365, 0, 0.05, 'land anomaly averages to 0'); }
ok(m50.landAmp > 20, 'model land swing is larger than real (stated in s5hint and boundary)');
for (let d = 0; d < 365; d++) ok(M.monthOfDay(d) >= 0 && M.monthOfDay(d) <= 11, 'month index');
M.MONTH_DAY.forEach((d, i) => ok(M.monthOfDay(d) === i, 'mid-month maps to its month'));

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (let i = 1; i <= 12; i++) ok(STRINGS.zh['mon' + i] && STRINGS.en['mon' + i], 'month ' + i);
for (const d of M.COMPASS) ok(STRINGS.zh['dir' + d] !== undefined, 'compass ' + d);
for (const id of ['D0', 'DT1', 'P2', 'H3', 'T3', 'P4', 'M5', 'D5', 'play5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/climate/atmospheric-circulation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS atmospheric-circulation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · peak ${r65.peakPW.toFixed(2)} PW @ ${r65.peakLat.toFixed(1)}° · Hadley ${e24.deg.toFixed(1)}°`);
