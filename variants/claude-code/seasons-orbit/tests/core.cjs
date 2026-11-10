'use strict';
// Earth's orbit & the seasons (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const md = n => { const q = M.monthDay(n); return `${q.m + 1}/${q.d}`; };
const D2R = Math.PI / 180;

// ---- calendar ----
let n = 1; for (let m = 0; m < 12; m++) for (let d = 1; d <= M.MONTH_DAYS[m]; d++) { const q = M.monthDay(n); ok(q.m === m && q.d === d && M.dayOf(m, d) === n, 'calendar ' + n); n++; }
ok(n - 1 === M.YEAR_DAYS, '365 days');

// ---- key dates (s0hint, s1e, page defaults) ----
const K = M.keyDates();
ok(md(K.perihelion) === '1/3', 'perihelion Jan 3'); ok(md(K.aphelion) === '7/5', 'aphelion Jul 5');
ok(md(K.marchEquinox) === '3/20', 'March equinox Mar 20'); ok(md(K.septEquinox) === '9/23', 'September equinox Sep 23');
ok(md(K.juneSolstice) === '6/21', 'June solstice Jun 21'); ok(md(K.decSolstice) === '12/21', 'December solstice Dec 21');
near(M.declination(K.juneSolstice), 23.44, 0.01, 'max declination = tilt'); near(M.declination(K.decSolstice), -23.44, 0.01, 'min declination = −tilt');
for (let d = 1; d <= 365; d++) ok(Math.abs(M.declination(d)) <= M.TILT + 1e-9, 'subsolar point stays between the tropics');
ok(/value="3"/.test(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').match(/<input id="d0"[^>]+>/)[0]), 'page opens on Jan 3');

// ---- step 0: distance ----
const dMin = M.distanceMkm(K.perihelion), dMax = M.distanceMkm(K.aphelion);
ok(dMin.toFixed(2) === '147.10' && dMax.toFixed(2) === '152.10', 'distance range 147.10–152.10 Mkm');
ok((dMax - dMin).toFixed(1) === '5.0' && (100 * (dMax - dMin) / M.AU_MKM).toFixed(1) === '3.3', 'span 5 Mkm, 3.3% (s0hint; finale "about 3%")');
ok((100 * M.relIntensity(K.aphelion)).toFixed(1) === '96.7' && (100 * M.relIntensity(K.perihelion)).toFixed(1) === '103.4', 'sunlight 96.7%–103.4%');
for (let d = 1; d <= 365; d++) { ok(M.distanceMkm(d) >= dMin - 1e-9 && M.distanceMkm(d) <= dMax + 1e-9, 'distance within range'); ok(M.distanceMkm(d) > 146.6 && M.distanceMkm(d) < 152.6, 'inside chart axis'); }
{ const r = M.dailyInsolation(40, K.perihelion) / M.dailyInsolation(-40, K.perihelion); ok(r > 0.28 && r < 0.36, 'Jan 3: 40°N gets about a third of 40°S (s0hint): ' + r.toFixed(3)); }
{ const r = M.dailyInsolation(-40, K.aphelion) / M.dailyInsolation(40, K.aphelion); ok(r > 0.28 && r < 0.36, 'Jul 5: mirror image: ' + r.toFixed(3)); }
ok(M.seasonNorth(K.perihelion) === 'winter' && M.seasonNorth(K.aphelion) === 'summer', 'closest in northern winter');
ok(M.seasonNorth(K.marchEquinox + 1) === 'spring' && M.seasonNorth(K.septEquinox + 1) === 'autumn', 'season boundaries');
ok((100 * (M.relIntensity(K.perihelion) / M.relIntensity(K.aphelion) - 1)).toFixed(0) === '7', 'southern summer gets ~7% more TOA sunlight (boundary)');
// the orbit drawn at true proportions: max deviation from the circle is tiny compared with the radius
for (let d = 1; d <= 365; d++) { const p = M.earthPos(d); near(Math.hypot(p.x, p.y), p.r, 1e-12, 'earthPos radius'); ok(Math.abs(p.r - 1) < 0.018, 'nearly circular'); }

// ---- step 1: which pole leans to the Sun ----
ok(M.declination(K.juneSolstice) > 0 && M.declination(K.decSolstice) < 0, 'north leans in June, south in December');
near(M.declination(K.marchEquinox), 0, 0.25, 'March equinox at the equator'); near(M.declination(K.septEquinox), 0, 0.25, 'September equinox at the equator');
// axis direction in the slanted view is the same vector all year (app uses a constant); Earth on the June side is on the left
{ const p = M.earthPos(K.juneSolstice); ok(p.y / p.r < -0.999, 'June Earth on the −y side (drawn on the left)'); const q = M.earthPos(K.decSolstice); ok(q.y / q.r > 0.999, 'December Earth on the right'); }

// ---- step 2: noon Sun height ----
for (let lat = -90; lat <= 90; lat += 5) for (let d = 1; d <= 365; d += 7) {
  const dec = M.declination(d), h = M.noonAltitude(lat, dec);
  // independent check: altitude from the dot product of the zenith and the Sun direction at noon
  const z = [Math.cos(lat * D2R), Math.sin(lat * D2R)], s = [Math.cos(dec * D2R), Math.sin(dec * D2R)];
  near(h, 90 - Math.acos(Math.max(-1, Math.min(1, z[0] * s[0] + z[1] * s[1]))) / D2R, 1e-9, 'noon altitude geometry');
  ok(h >= -30 && h <= 90, 'inside chart axis');
}
near(M.noonAltitude(40, M.declination(K.juneSolstice)), 73.44, 0.02, 'Beijing June solstice 73.44°');
near(M.noonAltitude(40, M.declination(K.decSolstice)), 26.56, 0.02, 'Beijing December solstice 26.56°');
ok(M.noonAltitude(23, M.declination(K.juneSolstice)) > 89.4, 'Guangzhou: Sun almost overhead at the June solstice');
{ let best = 1; for (let d = 1; d <= 365; d++) if (M.noonAltitude(-34, M.declination(d)) > M.noonAltitude(-34, M.declination(best))) best = d; ok(md(best) === '12/21', 'Sydney: highest in December'); }
{ let best = 1; for (let d = 1; d <= 365; d++) if (M.noonAltitude(40, M.declination(d)) > M.noonAltitude(40, M.declination(best))) best = d; ok(md(best) === '6/21', 'Beijing: highest in June'); }

// ---- step 3: day length ----
for (let lat = -60; lat <= 60; lat += 5) { near(M.dayLength(lat, M.declination(K.marchEquinox)).hours, 12, 0.1, 'equinox ≈ 12 h'); near(M.dayLength(lat, M.declination(K.septEquinox)).hours, 12, 0.1, 'equinox ≈ 12 h'); }
for (let d = 1; d <= 365; d++) near(M.dayLength(0, M.declination(d)).hours, 12, 1e-9, 'equator 12 h all year');
ok(M.dayLength(70, M.declination(K.juneSolstice)).kind === 'polarDay' && M.dayLength(70, M.declination(K.decSolstice)).kind === 'polarNight', '70°N: polar day and polar night');
for (let lat = -89; lat <= 89; lat += 1) for (let d = 1; d <= 365; d += 4) {
  const dec = M.declination(d), a = M.dayLength(lat, dec).hours, b = M.dayLength(-lat, dec).hours;
  near(a + b, 24, 1e-9, 'opposite latitudes share 24 h'); ok(a >= 0 && a <= 24, 'day length in range');
  // independent: count the minutes the Sun is above the horizon
  if (lat % 10 === 0 && d % 20 === 1) { let up = 0; for (let k = 0; k < 1440; k++) { const H = (k + 0.5) / 1440 * 360 - 180; const sinAlt = Math.sin(lat * D2R) * Math.sin(dec * D2R) + Math.cos(lat * D2R) * Math.cos(dec * D2R) * Math.cos(H * D2R); if (sinAlt > 0) up++; } near(a * 60, up, 1.01, 'day length by minute count'); }
}
ok(Math.abs(M.dayLength(40, M.declination(K.juneSolstice)).hours - 14.85) < 0.01, 'Beijing longest day ≈ 14 h 51 min');
// polar day/night begins exactly at the polar circle
ok(M.dayLength(90 - M.TILT + 0.01, M.TILT).kind === 'polarDay' && M.dayLength(90 - M.TILT - 0.01, M.TILT).kind === 'normal', 'polar circle boundary');

// ---- step 4: the tilt as a what-if ----
for (let d = 1; d <= 365; d++) { near(M.declination(d, 0), 0, 1e-12, 'zero tilt: Sun over the equator'); near(M.noonAltitude(40, M.declination(d, 0)), 50, 1e-9, 'zero tilt: 50° every day'); near(M.dayLength(40, M.declination(d, 0)).hours, 12, 1e-9, 'zero tilt: 12 h'); }
for (const eps of [5, 10, 23.44, 30, 45]) {
  let hmin = 90, hmax = -90, nmin = 90, nmax = -90;
  for (let d = 1; d <= 365; d++) { const dec = M.declination(d, eps); hmin = Math.min(hmin, M.noonAltitude(40, dec)); hmax = Math.max(hmax, M.noonAltitude(40, dec)); nmin = Math.min(nmin, M.noonAltitude(-40, dec)); nmax = Math.max(nmax, M.noonAltitude(-40, dec)); ok(Math.abs(dec) <= eps + 1e-9, 'subsolar within ±ε');
    ok(Math.sign(M.noonAltitude(40, dec) - 50) === -Math.sign(M.noonAltitude(-40, dec) - 50) || Math.abs(dec) < 1e-9, 'hemispheres opposite'); }
  near(hmax - hmin, eps <= 40 ? 2 * eps : 90 - (90 - 40 - eps), 0.05, 'swing ≈ 2ε at 40°N (beyond ε = 40° the Sun passes the zenith)'); near(nmax - nmin, hmax - hmin, 0.02, '40°S swings just as much (to the 0.1° shown)');
  ok(hmin >= 0, 'curve stays above 0° on the chart');
}
ok(90 - 45 === 45, 'at 45° the tropics and polar circles meet');

// ---- bilingual keys and placeholders ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek); checks++;
const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
const loose = new Set(['dateFmt']); // zh uses {m}, en uses {mon}
for (const k of zk) { if (loose.has(k)) continue; assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'translated: ' + k);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/[左右]图|left panel|right panel|left chart|right chart/i.test(v), 'no left/right figure references');
ok(STRINGS.zh.foot.includes('claude-opus-5-5') && STRINGS.en.foot.includes('claude-opus-5-5'), 'footer names the model');

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(m[1] in STRINGS.zh, 'html key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9]+)'[,)]/g)) ok(m[1] in STRINGS.zh, 'app key ' + m[1]);
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) { const [p, a] = h.split('#'), target = path.resolve(dir, p, 'index.html'); ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${a}"`), 'anchor ' + h); }
ok(fs.existsSync(path.join(dir, '../../../earth/astronomy/seasons-orbit/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS seasons-orbit core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
