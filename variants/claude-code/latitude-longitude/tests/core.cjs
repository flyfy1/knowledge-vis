'use strict';
// Latitude & longitude (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const D2R = Math.PI / 180;

// ---- geometry basics: vectors, orthographic view ----
for (let lat = -90; lat <= 90; lat += 15) for (let lon = -180; lon < 180; lon += 20) {
  const v = M.vec(lat, lon), b = M.fromVec(v);
  near(b.lat, lat, 1e-9, 'vec → latitude');
  if (Math.abs(lat) < 90) near(M.wrapLon(b.lon - lon), 0, 1e-9, 'vec → longitude');
  for (const [la0, lo0] of [[20, 80], [-30, -40], [35, 56.3]]) {
    const a = M.ortho(lat, lon, la0, lo0), c = M.orthoVec(v, la0, lo0);
    near(a.x, c.x, 1e-12, 'ortho = orthoVec x'); near(a.y, c.y, 1e-12, 'ortho = orthoVec y'); near(a.z, c.z, 1e-12, 'ortho = orthoVec z');
    near(a.x * a.x + a.y * a.y + a.z * a.z, 1, 1e-12, 'unit sphere');
  }
}
{ const c = M.ortho(20, 80, 20, 80); near(c.x, 0, 1e-12, 'view centre x'); near(c.y, 0, 1e-12, 'view centre y'); near(c.z, 1, 1e-12, 'view centre faces viewer'); }
ok(M.ortho(0, -100, 20, 80).z < 0, 'antipodal side hidden');
ok(M.wrapLon(180) === 180 && M.wrapLon(-180) === 180 && M.wrapLon(190) === -170, 'wrapLon');

// ---- step 0 presets ----
for (const k of ['beijing', 'london', 'sydney', 'quito', 'northpole']) ok(M.CITIES[k], 'preset ' + k);
ok(M.CITIES.beijing.lat > 0 && M.CITIES.beijing.lon > 0 && M.CITIES.sydney.lat < 0 && M.CITIES.london.lon < 0 && Math.abs(M.CITIES.quito.lat) < 0.5, 'hemispheres of presets');

// ---- step 1 quiz ----
for (const k of M.QUIZ_ORDER) ok(M.CITIES[k] && STRINGS.zh['c' + k[0].toUpperCase() + k.slice(1)], 'quiz city ' + k);
ok(M.quizGrade(300) === 'great' && M.quizGrade(301) === 'close' && M.quizGrade(1000) === 'close' && M.quizGrade(1001) === 'far', 'grade thresholds 300 / 1000 km');
near(M.distance(10, 20, 10, 20), 0, 1e-9, 'zero distance');
near(M.distance(0, 0, 0, 1), M.KM_PER_DEG, 1e-9, '1° on the equator');
near(M.distance(90, 0, -90, 0), Math.PI * M.R, 1e-6, 'pole to pole');
// great-circle polyline length = haversine distance (also used for the step 1 error line)
for (const [a, b, c, d] of [[51.5, -0.1, 39.9, 116.4], [-33.9, 151.2, 64.1, -21.9], [40, 56.3 - 60, 40, 56.3 + 60]]) {
  const pts = M.greatCirclePoints(a, b, c, d, 400); let L = 0;
  for (let i = 1; i < pts.length; i++) L += M.distance(pts[i - 1].lat, pts[i - 1].lon, pts[i].lat, pts[i].lon);
  near(L, M.distance(a, b, c, d), 0.05, 'great-circle path length');
}

// ---- step 2: 1° lengths (s2e, s2readout, s2hint) ----
near(M.KM_PER_DEG, 111.2, 0.01, '1° of latitude ≈ 111.2 km');
near(M.kmPerDegLon(0), M.KM_PER_DEG, 1e-9, 'equator');
near(M.kmPerDegLon(60), M.KM_PER_DEG / 2, 1e-9, '60° is exactly half');
near(M.kmPerDegLon(90), 0, 1e-9, 'pole: zero');
near(M.parallelLength(0), 40030, 1, 'equator ≈ 40 030 km');
near(M.kmPerDegLon(46), 77.2, 0.05, 'Harbin latitude 46° → 77.2 km');
ok(Math.round(100 * Math.cos(46 * D2R)) === 69, '69% at 46°');
near(M.parallelRadius(46), 4426, 1, 'parallel radius at 46°');
for (let lat = 0; lat < 90; lat++) ok(M.kmPerDegLon(lat + 1) < M.kmPerDegLon(lat), 'shrinks monotonically');

// ---- step 3: projections ----
for (let lat = 0; lat <= M.CIRCLE_LAT_MAX; lat += 5) {
  const p = M.measuredStretch('plate', lat, M.CIRCLE_KM), q = M.measuredStretch('mercator', lat, M.CIRCLE_KM);
  const fp = M.stretchFormula('plate', lat), fq = M.stretchFormula('mercator', lat);
  near(p.ns, 1, 1e-3, 'plate keeps north–south spacing');
  ok(Math.abs(p.ew / fp.ew - 1) < 0.025, `plate E–W ≈ 1/cos φ at ${lat}°`);
  ok(Math.abs(q.ew / fq.ew - 1) < 0.025 && Math.abs(q.ns / fq.ns - 1) < 0.045, `Mercator ≈ 1/cos φ both ways at ${lat}°`);
  ok(Math.abs(q.ns / q.ew - 1) < 0.025, `Mercator circles stay round at ${lat}° (s3noteMerc)`);
  ok(q.area >= p.area - 1e-9, 'Mercator inflates area at least as much');
  if (lat > 0) ok(p.ew > 1.0 && p.ns / p.ew < 1, 'plate circles flatten (s3notePlate)');
  if (lat > 0) for (const [m, f] of [[p.ew, fp.ew], [p.area, fp.area], [q.ew, fq.ew], [q.ns, fq.ns], [q.area, fq.area]]) ok(m >= f * (1 - 1e-4), 'measured ≥ formula (s3e)');
}
{ const p = M.measuredStretch('plate', 70, M.CIRCLE_KM), q = M.measuredStretch('mercator', 70, M.CIRCLE_KM), fp = M.stretchFormula('plate', 70), fq = M.stretchFormula('mercator', 70);
  const ex = [p.ew / fp.ew, p.area / fp.area, q.ew / fq.ew, q.ns / fq.ns, q.area / fq.area].map(v => v - 1);
  ok(Math.min(...ex) >= 0.015 && Math.max(...ex) < 0.07, 'at 70°N measured exceeds formula by about 2%–7% (s3e): ' + ex.map(v => v.toFixed(3))); }
{ const e = M.measuredStretch('plate', 0, M.CIRCLE_KM), f = M.measuredStretch('mercator', 0, M.CIRCLE_KM); near(e.ew, 1, 1e-12, 'equator no distortion'); near(f.area, 1, 1e-12, 'equator no distortion (Mercator)'); }
ok(M.stretchFormula('mercator', 72).area.toFixed(1) === '10.5', 'Greenland ~72°: Mercator area ×10.5 (s3hint)');
ok(M.stretchFormula('plate', 60).ew.toFixed(2) === '2.00', 'plate at 60° ×2');
// circles never leave the Mercator window for the slider range (≤ 75° + 4.5°)
ok(M.CIRCLE_LAT_MAX + M.CIRCLE_KM / M.KM_PER_DEG < M.MERC_MAX, 'step 3 circle stays inside ±80°');
ok(/max="70"/.test(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').match(/<input id="lat3"[^>]+>/)[0]) && M.CIRCLE_LAT_MAX === 70, 'lat3 slider max = 70');

// ---- step 4: two routes ----
{ const r = M.routes(40, 120);
  ok(Math.round(r.along) === 10222 && Math.round(r.great) === 9243 && (100 * r.saved).toFixed(1) === '9.6' && r.top.toFixed(1) === '59.2', 'default readout 40°/120°'); }
for (let lat = 0; lat <= 80; lat += 1) for (let dl = 5; dl <= 180; dl += 5) {
  const r = M.routes(lat, dl);
  // independent check: haversine between the two endpoints
  near(r.great, M.distance(lat, -dl / 2, lat, dl / 2), 1e-6, 'great-circle formula = haversine');
  if (lat === 0) { near(r.great, r.along, 1e-6, 'equator: routes coincide'); near(r.saved, 0, 1e-9, 'equator: 0% saved'); }
  else ok(r.great < r.along, 'great circle is shorter off the equator');
  ok(r.top >= lat - 1e-9, 'great circle bulges poleward');
  // vertex latitude from the sampled great circle
  const pts = M.greatCirclePoints(lat, -dl / 2, lat, dl / 2, 180);
  if (!(lat === 0 && dl === 180)) near(Math.max(...pts.map(q => q.lat)), r.top, 1e-6, 'vertex latitude');
  pts.forEach(q => ok(Number.isFinite(q.lat) && Number.isFinite(q.lon), 'finite route points'));
  // saving grows with latitude for fixed Δλ
  if (lat > 0) ok(r.saved > M.routes(lat - 1, dl).saved - 1e-12, 'saving grows with latitude');
}
for (let lat = 5; lat <= 80; lat += 5) { const r = M.routes(lat, 180); near(r.top, 90, 1e-9, 'Δλ = 180° goes over the pole'); near(r.great, M.R * (Math.PI - 2 * lat * D2R), 1e-6, 'over-the-pole distance'); }
near(M.routes(40, 0).great, 0, 1e-9, 'Δλ = 0: zero distance');
ok(Math.abs(M.CITIES.madrid.lat - 40) < 0.5 && Math.abs(M.CITIES.beijing.lat - 40) < 0.5 && Math.abs((M.CITIES.beijing.lon - M.CITIES.madrid.lon) - 120) < 0.2, 'preset ≈ Madrid → Beijing (40°N, ~120°)');

// ---- step 5: longitude and time ----
near(M.noonLon(12), 0, 1e-12, 'noon at 0° at 12:00 UT'); near(M.noonLon(4), 120, 1e-12, 'noon meridian 120°E at 04:00 UT');
for (let u = 0; u < 24; u += 0.25) {
  near(M.solarTime(u, M.noonLon(u)), 12, 1e-9, 'noon meridian has local 12:00');
  near(M.wrapLon(M.noonLon(u) - M.noonLon(u + 1)), 15, 1e-9, 'noon line moves 15° west per hour');
  let day = 0; for (let lon = -179.63; lon < 180; lon += 1) day += M.isDay(u, 0, lon) ? 1 : 0;
  ok(day === 180, 'equinox: half the equator is in daylight');
}
{ const u = 12 - M.CITIES.beijing.lon / 15;
  ok(M.hhmm(M.solarTime(u, M.CITIES.beijing.lon)) === '12:00', 'Beijing noon button');
  ok(M.hhmm(M.solarTime(u, M.CITIES.london.lon)) === '04:14', 'London at Beijing noon');
  ok(M.hhmm(M.solarTime(u, M.CITIES.newyork.lon)) === '23:18', 'New York at Beijing noon');
  ok((M.CITIES.beijing.lon / 15).toFixed(1) === '7.8', '116.4 ÷ 15 ≈ 7.8 h (s5hint)');
  ok(M.beijingLagMinutes().toFixed(0) === '14', 'Beijing solar time ~14 min behind Beijing time'); }
ok(M.hhmm(23.999) === '00:00' && M.hhmm(-0.5) === '23:30', 'hhmm wraps');
for (const k of M.TIME_CITIES) ok(M.CITIES[k], 'time city ' + k);

// ---- coastline data sanity (orientation only) ----
for (const ring of M.LAND) { ok(ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1], 'closed ring'); ring.forEach(([lo, la]) => ok(Math.abs(lo) <= 180 && Math.abs(la) <= 90, 'coastline in range')); }

// ---- bilingual keys and placeholders ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek); checks++;
const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) if (!/^(f[A-Z0-9]|s2lgCurve)/.test(k)) ok(STRINGS.zh[k] !== STRINGS.en[k], 'translated: ' + k);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/[左右]图|left panel|right panel|left chart|right chart/i.test(v), 'no left/right figure references');
ok(STRINGS.zh.foot.includes('claude-opus-5-5') && STRINGS.en.foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(m[1] in STRINGS.zh, 'html key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9]+)'[,)]/g)) ok(m[1] in STRINGS.zh, 'app key ' + m[1]);

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [p, a] = h.split('#'), target = path.resolve(dir, p, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${a}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/geo/latitude-longitude/index.html')), 'comparison link target exists');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS latitude-longitude core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
