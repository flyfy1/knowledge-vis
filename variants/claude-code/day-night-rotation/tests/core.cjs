'use strict';
// Day and night (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (k, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][k].includes(s), `${l}.${k} quotes ${s}`));

// ---- step 0: exactly half lit, wherever the lamp is ----
for (let th = 0; th < 360; th++) {
  near(M.litFraction(th), 0.5, 1e-9, 'half lit at ' + th);
  ok(M.litBy(th, th) && !M.litBy(th + 180, th), 'the point facing the lamp is lit, the opposite one dark');
  ok(M.litBy(90, th) === (Math.sin(th * Math.PI / 180) > 1e-12), 'Sam on top is lit iff the lamp is on his side');
}

// ---- step 1: anchor times and direction (guards against a reversed spin) ----
near(M.spinAngle(12), 0, 1e-12, 'noon faces the Sun'); near(M.spinAngle(18), 90, 1e-12, '18:00 at 90°');
near(M.spinAngle(0), 180, 1e-12, 'midnight at 180°'); near(M.spinAngle(6), 270, 1e-12, '06:00 at 270°');
ok(M.phase(6) === 'sunrise' && M.phase(18) === 'sunset' && M.phase(12) === 'day' && M.phase(0) === 'night', 'phase words at the anchors');
// real spin: the angle increases with time (anticlockwise seen from the North Pole), and noon + 6 h is the sunset side
for (let tt = 0; tt < 24; tt += 0.25) { const d = M.wrap360(M.spinAngle(tt + 0.25) - M.spinAngle(tt)); near(d, 3.75, 1e-9, 'anticlockwise 3.75° per 15 min'); }
ok(M.phase(12 + 6) === 'sunset' && M.sunDot(M.spinAngle(17)) > 0 && M.sunDot(M.spinAngle(19)) < 0, 'a quarter turn after noon is sunset (day → night)');
// day exactly 12 h: the strip is half yellow after a full turn
let dayCells = 0; for (let i = 0; i < M.CELLS; i++) if (M.cellIsDay(i)) dayCells++;
ok(dayCells === M.CELLS / 2, 'strip: day cells = night cells = 48');
for (let i = 0; i < M.CELLS; i++) { const mid = (i + 0.5) * M.CELL_H; ok(M.cellIsDay(i) === (mid > 6 && mid < 18), 'day cells are 06:00–18:00'); }
// state words agree with sunDot away from the twilight windows
for (let tt = 0; tt < 24; tt += 0.05) { const p = M.phase(tt); if (p === 'day') ok(M.isDay(M.spinAngle(tt)), 'day word is lit'); if (p === 'night') ok(!M.isDay(M.spinAngle(tt)), 'night word is dark'); }
ok(M.clock(23.999) === '00:00' && M.clock(6.25) === '06:15' && M.clock(24) === '00:00', 'clock wraps without negatives');

// ---- step 2: the sky ----
const s = tt => M.skySun(tt);
near(s(6).beta, 0, 1e-9, 'sunrise on the east horizon'); near(s(12).beta, 90, 1e-9, 'noon overhead'); near(s(18).beta, 180, 1e-9, 'sunset on the west horizon'); near(s(0).beta, 270, 1e-9, 'midnight underfoot');
ok(s(6).x < 0 && s(18).x > 0, 'east is drawn on the left, west on the right');
for (let tt = 0; tt < 24; tt += 0.25) { near(Math.sin(s(tt).altitude * Math.PI / 180), M.sunDot(M.spinAngle(tt)), 1e-9, 'altitude matches the top view'); ok((s(tt).y > 1e-9) === M.isDay(M.spinAngle(tt)), 'above the horizon iff day'); }
for (let tt = 6.25; tt < 12; tt += 0.25) ok(s(tt).x < 0, 'morning Sun in the east');
for (let tt = 12.25; tt < 18; tt += 0.25) ok(s(tt).x > 0, 'afternoon Sun in the west');
// imaginary reversed spin: sunrise (06:00) now on the west horizon, morning Sun in the west
near(M.skySun(6, -1).beta, 180, 1e-9, 'reversed: sunrise in the west'); for (let tt = 6.25; tt < 12; tt += 0.25) ok(M.skySun(tt, -1).x > 0, 'reversed morning Sun in the west');
for (let tt = 0; tt < 24; tt += 0.25) ok(M.isDay(M.spinAngle(tt, -1)) === M.isDay(M.spinAngle(tt)), 'reversed spin keeps 12 h day at the same clock times');

// ---- step 3: four cities ----
const city = id => M.CITIES.find(c => c.id === id);
const bj = city('beijing');
near(M.localTime(12, bj.lon, city('newyork').lon), 23 + 18 / 60, 0.02, 'New York ≈ 23:18 when Beijing is at noon');
ok(M.phase(M.localTime(12, bj.lon, city('newyork').lon)) === 'night', 'New York in the dark half, close to midnight');
near(M.localTime(12, bj.lon, city('tokyo').lon) - 12, (139.7 - 116.4) / 15, 1e-9, 'Tokyo earlier by 1.55 h');
for (const c of M.CITIES) ok(STRINGS.zh['city_' + c.id] && STRINGS.en['city_' + c.id], 'city name ' + c.id);
// on the drawn circle the four dots never overlap (dot radius 7 at radius ≥ 0.86 × 60 px): smallest angular gap
const lons = M.CITIES.map(c => c.lon).sort((a, b) => a - b); let gap = 360;
for (let i = 0; i < lons.length; i++) gap = Math.min(gap, M.wrap360(lons[(i + 1) % lons.length] - lons[i]));
ok(2 * 0.86 * 60 * Math.sin(gap * Math.PI / 360) > 16, 'city dots separated (gap ' + gap.toFixed(1) + '°)');
both('s3e', '116'); both('s3e', '74'); both('s3e', '140');

// ---- step 4: speeds ----
near(M.groundSpeed(0).circ, 40000, 100, 'equator ≈ 40 000 km'); near(M.groundSpeed(0).kmh, 1670, 5, 'equator ≈ 1670 km/h');
ok(M.groundSpeed(0).kmh > 900, 'equator faster than a jet'); near(M.groundSpeed(40).kmh, 1280, 5, 'Beijing ≈ 1280 km/h');
let cross = 0; for (let L = 0; L <= 90; L += 0.1) if (M.groundSpeed(L).kmh >= 900) cross = L;
near(cross, 57.3, 0.2, 'slower than the plane beyond about 57°');
ok(M.turnAccel(0) / 9.8 < 0.004 && M.turnAccel(0) / 9.8 > 0.003, 'turning force under 0.4% of gravity');
for (const k of ['s4e', 's4hint']) ['zh', 'en'].forEach(l => ok(/1670|1280|57|0\.4/.test(STRINGS[l][k]), l + ' quotes the numbers'));
both('s4e', '1670'); both('s4e', '0.4%'); both('s4hint', '1280'); both('s4hint', '57');
ok(M.groundSpeed(0).kmh < 1700, 'bar scale (max 1700) holds the fastest bar');

// ---- quiz ----
const d = bj.lon - city('newyork').lon; near(d, 190.4, 1e-9, 'longitude gap'); near(d / 15, 12.69, 0.01, 'hours');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = x => (x.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) { ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model'); ok(!/左图|右图|left panel|right panel|left chart|right chart|left picture|right picture/i.test(Object.values(STRINGS[l]).join(' ')), 'no left/right figure references'); }

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const p of ['ph_noon', 'ph_midnight', 'ph_sunrise', 'ph_sunset', 'ph_day', 'ph_night', 'st_sunrise', 'st_sunset', 'sky_overhead', 'sky_eastRim', 'sky_westRim', 'sky_eastHigh', 'sky_westHigh', 'sky_below', 'f1a', 'f1ok', 'f1c', 'f2ok', 'f2b', 'f2c', 'f3a', 'f3ok', 'f3c']) ok(STRINGS.zh[p] !== undefined, 'dynamic key ' + p);
for (const id of ['a0', 'lamp0', 't1', 'play1', 'clear1', 't2', 'play2', 'rev2', 'b3', 'l4', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance hooks');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/astronomy/day-night-rotation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS day-night-rotation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
