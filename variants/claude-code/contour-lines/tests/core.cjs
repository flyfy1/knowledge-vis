'use strict';
// Contour lines (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s, s2 = s) => { ok(STRINGS.zh[key].includes(s), `zh.${key} quotes ${s}`); ok(STRINGS.en[key].includes(s2), `en.${key} quotes ${s2}`); };
const fmt = (v, d) => { const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
ok(fmt(90, 0) === '90' && fmt(120, 2) === '120' && fmt(1.5, 2) === '1.5', 'trailing-zero trim only after a decimal point');
const R = Math.round;

// ---- landscape A: foot, top, the hill as a whole ----
const GA = M.grid(M.hillA, 100), LA = M.levels(GA, 10);
const fine = (f, n) => { let lo = Infinity, hi = -Infinity, at = null; for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const h = f(i / n, j / n); lo = Math.min(lo, h); if (h > hi) { hi = h; at = [i / n, j / n]; } } return { lo, hi, at }; };
const FA = fine(M.hillA, 400);
ok(R(FA.lo) === 12, 'hill foot ≈ 12 m ' + FA.lo); ok(R(FA.hi) === 122, 'hill top ≈ 122 m ' + FA.hi);
both('s0e', '12 m'); both('s0e', '122 m'); both('s0e', '1000 m × 1000 m'); both('s1e', '10 m'); both('s1e', '50 m');
near(FA.at[0], 0.56, 0.005, 'summit at 560 m east'); both('s2hint', '560 m');

// ---- step 0: flooding ----
const pcs = L => M.pieces(M.contour(GA, L));
for (let L = 20; L <= 120; L += 10) { const p = pcs(L); ok(p.length >= 1 && p.every(q => q.closed), `level ${L}: closed shoreline`); }
ok(pcs(20).length === 2, 'at 20 m the mound is an island (two rings)'); ok(pcs(30).length === 1, 'at 30 m the mound is under water');
for (let L = 30; L <= 120; L += 10) ok(pcs(L).length === 1, `one ring at ${L} m`);
both('s0hint', '20 m'); both('s0hint', '30 m'); both('s0hint', '120 m');
ok(FA.hi > 120 && FA.hi < 130, 'a small patch of summit stays dry at 120 m');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
ok(/id="w0"[^>]*min="20" max="120" step="10" value="20"/.test(html), 'water slider 20–120 step 10');
ok(M.segLength(M.contour(GA, 120)) < M.segLength(M.contour(GA, 30)), 'shoreline shrinks as water rises');

// ---- step 1: bracket readings ----
ok(LA.list[0] === 20 && LA.list[LA.list.length - 1] === 120, 'contours 20…120 on the step-1 map');
both('whereBelow', '12 m'); both('s1hint', '50–60 m', '50–60 m'); both('s1hint', '120 m'); both('s1hint', '130 m');
for (let j = 0; j <= 100; j += 5) for (let i = 0; i <= 100; i += 5) {
  const h = M.hillA(i / 100, j / 100), [lo, hi] = M.bracket(h, 10);
  ok(lo <= h && h < hi && hi - lo === 10, 'bracket holds the true height');
  if (lo >= 20 && hi <= 120) ok(M.contour(GA, lo).length > 0 && M.contour(GA, hi).length > 0, 'both bracket lines exist on the map');
}
ok(FA.hi < 130, 'no 130 m line: summit under 130 m');
// index labels 50 and 100 sit on the row y = 0.5 west of the summit
for (const L of [50, 100]) { let lo = 0, hi = 0.56; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (M.hillA(m, 0.5) < L) lo = m; else hi = m; } near(M.hillA(lo, 0.5), L, 0.01, 'index label ' + L + ' on its line'); }

// ---- step 2: crowded vs sparse ----
const sp = x => M.spacing(M.hillA, x, 0.5, 10), dg = x => M.slope(M.hillA, x, 0.5).deg;
ok(R(sp(0.35)) === 32 && R(dg(0.35)) === 17, `350 m: ${sp(0.35)} m, ${dg(0.35)}°`);
ok(R(sp(0.65)) === 14 && R(dg(0.65)) === 36, `650 m: ${sp(0.65)} m, ${dg(0.65)}°`);
both('s2hint', '350 m'); both('s2hint', '32 m'); both('s2hint', '17°'); both('s2hint', '650 m'); both('s2hint', '14 m'); both('s2hint', '36°');
both('s2e', '14 m'); both('s2e', '32 m'); both('s2e', '100 m');
ok(dg(0.56) < 1, 'slope ≈ 0 at the summit');
ok(dg(0.35) >= 10 && dg(0.35) < 20 && dg(0.65) >= 20, 'grade words: 350 m 较陡, 650 m 陡坡');
// the profile panel (0–140 m) holds the whole cut, and every slider value has a readout
for (let x = 0; x <= 1000; x += 10) { const h = M.hillA(x / 1000, 0.5); ok(h > 0 && h < 140, 'profile inside axis'); }
// map spacing equals the profile's crossing spacing near 650 m (yellow dots)
{ const P = M.profile(M.hillA, [0, 0.5], [1, 0.5], 4000), cr = []; for (let k = 1; k < P.length; k++) for (let L = 20; L <= 120; L += 10) if ((P[k - 1].h - L) * (P[k].h - L) < 0) cr.push(P[k].x * 1000);
  cr.sort((a, b) => a - b); const east = cr.filter(c => c > 600 && c < 700); ok(east.length >= 2, 'crossings east');
  for (let k = 1; k < east.length; k++) ok(east[k] - east[k - 1] < 20, 'east crossings < 20 m apart');
  const west = cr.filter(c => c > 300 && c < 400); for (let k = 1; k < west.length; k++) ok(west[k] - west[k - 1] > 25, 'west crossings > 25 m apart'); }

// ---- step 3: contour interval and the mound ----
const K = M.knollInfo();
ok(R(K.top) === 23 && R(K.saddle) === 17 && R(K.top - K.saddle) === 5, `mound top ${K.top}, link ${K.saddle}`);
both('s3e', '23 m'); both('s3e', '17 m'); both('s3e', '5 m'); both('knollNo', '17–23 m', '17 and 23 m');
assert.deepEqual(M.INTERVALS.map(I => M.knollVisible(I)), [true, true, true, false, false]); checks++;
for (const I of [5, 10, 20]) ok(Math.floor(K.top / I) * I === 20, '20 m line rings the mound at interval ' + I);
both('s3hint', '5 m'); both('s3hint', '20 m'); both('s3hint', '25'); both('s3hint', '50 m');
// a visible ring really is a separate closed piece on the map at that level
ok(M.pieces(M.contour(GA, 20)).length === 2 && M.pieces(M.contour(GA, 25)).length === 1, 'ring at 20, none at 25');
for (const I of M.INTERVALS) { const plo = Math.floor(FA.hi / I) * I; ok(plo <= FA.hi && FA.hi < plo + I, 'summit range at ' + I); }
ok(/id="i3"[^>]*min="0" max="4"/.test(html), 'interval slider indexes the five intervals');

// ---- step 4: landforms on landscape B ----
const F = M.features(), B = M.hillB, GB = M.grid(B, 120);
const pk = B(...F.peak.at), sd = B(...F.saddle.at), p2 = B(...M.climb(B, M.B.p2[0], M.B.p2[1], 1));
ok(R(pk) === 199 && pk > 180, 'summit ≈ 199 m, inside 180 ring ' + pk); both('rdPeak', '180 m'); both('rdPeak', '140、160、180', '140, 160 and 180');
ok(sd > 60 && sd < 80, 'saddle between 60 and 80 m ' + sd);
ok(p2 > 80 && p2 < pk, 'second summit above 80 m');
ok(M.regionFrom(B, F.peak.at, 60).has(M.B.p2) && !M.regionFrom(B, F.peak.at, 60).edge, '60 m ring wraps both summits');
ok(!M.regionFrom(B, F.peak.at, 80).has(M.B.p2), '80 m rings each summit separately'); both('rdSaddle', '80 m'); both('rdSaddle', '60 m');
const crossProfile = (cut, n = 200) => M.profile(B, cut[0], cut[1], n).map(p => p.h);
const mid = a => a[(a.length - 1) / 2];
{ const a = crossProfile(F.saddle.cut), c = crossProfile(F.saddle.cross); ok(Math.min(...a.slice(40, 161)) >= mid(a) - 1e-6, 'saddle lowest along the summit line'); ok(Math.max(...c.slice(60, 141)) <= mid(c) + 1e-6, 'saddle highest across'); }
{ const a = crossProfile(F.peak.cut); ok(Math.max(...a) <= mid(a) + 0.5, 'summit profile high in the middle'); }
{ const a = crossProfile(F.ridge.cut); ok(Math.max(...a) <= mid(a) + 0.5 && a[0] < mid(a) - 15 && a[200] < mid(a) - 15, 'ridge profile high in the middle');
  const u = M.B.ridgeU, c = F.ridge.at; ok(u[0] < 0 && u[1] < 0, 'ridge runs south-west');
  let prev = -Infinity; for (let s = 0.1; s >= -0.1; s -= 0.02) { const h = B(c[0] + u[0] * s, c[1] + u[1] * s); ok(h > prev, 'ridge climbs toward the north-east'); prev = h; } }
{ const a = crossProfile(F.valley.cut); ok(Math.min(...a) >= mid(a) - 0.5 && a[0] > mid(a) + 10 && a[200] > mid(a) + 10, 'valley profile low in the middle');
  const c = F.valley.at; let prev = Infinity; for (let y = c[1] + 0.1; y >= 0; y -= 0.02) { const h = B(c[0] + (y - c[1]) * -0.12, y); ok(h < prev, 'valley drops to the south'); prev = h; } }
// contours bulge toward lower ground at the ridge (south-west) and toward higher ground at the valley (north)
{ const L = 80, c = F.ridge.at, u = M.B.ridgeU, perp = [-u[1], u[0]], dist = off => { let s = 0; while (B(c[0] + perp[0] * off + u[0] * s, c[1] + perp[1] * off + u[1] * s) > L && s < 0.5) s += 0.001; return s; };
  ok(B(...c) > L, 'ridge point above 80 m'); ok(dist(0) > dist(0.06) && dist(0) > dist(-0.06), 'the 80 m line reaches farther down the ridge axis'); }
{ const L = 40, c = F.valley.at, dist = dx => { let y = c[1]; while (B(c[0] + dx, y) < L && y < 1) y += 0.001; return y; };
  ok(dist(0) > dist(0.06) && dist(0) > dist(-0.06), 'the 40 m line reaches farther north along the valley'); }
both('rdRidge', '西南', 'south-west'); both('rdValley', '向北', 'bulge north');
// basin
const bs = F.basin.at, floor = B(...bs);
ok(R(floor) === 55 && floor < 60, 'basin floor ≈ 55 m ' + floor);
let rim = Infinity; for (let k = 0; k < 72; k++) { const th = k / 72 * 2 * Math.PI; let mx = -1; for (let r = 0.02; r < 0.15; r += 0.002) mx = Math.max(mx, B(bs[0] + r * Math.cos(th), bs[1] + r * Math.sin(th))); rim = Math.min(rim, mx); }
ok(Math.floor(rim) === 74 && rim > 60, 'basin rim lowest point ≈ 74 m ' + rim);
{ const row = M.profile(B, [bs[0] - 0.18, bs[1]], [bs[0] + 0.18, bs[1]], 720); let n60 = 0; for (let k = 1; k < row.length; k++) if ((row[k - 1].h - 60) * (row[k].h - 60) < 0) n60++; ok(n60 === 4, '60 m line crossed four times through the basin (inner + outer ring) ' + n60);
  const a = row.map(p => p.h), inner = a.slice(160, 561); ok(Math.min(...inner) >= mid(a) - 0.5 && Math.max(...a.slice(160, 360)) > mid(a) + 15 && Math.max(...a.slice(360, 561)) > mid(a) + 15, 'basin profile low in the middle, rim high on both sides'); }
{ const p60 = M.pieces(M.contour(GB, 60)); ok(p60.length === 3 && p60.every(p => p.closed), '60 m: summits ring + two basin rings'); }
ok(M.pieces(M.contour(GB, 80)).filter(p => p.closed).length >= 2, '80 m: a ring per summit'); both('rdBasin', '60 m');
const fb = M.levels(GB, 20); ok(fb.lo > 0 && fb.hi < 200 && R(fb.hi) === 199, 'landscape B within 0–200 m');
both('s4e', '20 m'); both('c4a', '20 m');

// ---- step 5: water ----
const RP = [(F.ridge.cut[0][0] - F.ridge.at[0]) / 0.17, (F.ridge.cut[0][1] - F.ridge.at[1]) / 0.17];
const d1 = M.flow(B, F.peak.at[0] + 0.03, F.peak.at[1] - 0.03);
ok(d1.end === 'edge' && d1.path[d1.path.length - 1][1] < 0, 'summit drop leaves the map to the south');
ok(d1.path.some(([x, y]) => Math.abs(x - F.valley.at[0]) < 0.04 && Math.abs(y - F.valley.at[1]) < 0.06), 'summit drop runs down the valley');
const r1 = M.flow(B, F.ridge.at[0] + 0.02 * RP[0], F.ridge.at[1] + 0.02 * RP[1]), r2 = M.flow(B, F.ridge.at[0] - 0.02 * RP[0], F.ridge.at[1] - 0.02 * RP[1]);
const e1 = r1.path[r1.path.length - 1], e2 = r2.path[r2.path.length - 1];
ok(r1.end === 'edge' && e1[0] < 0, 'ridge drop 1 leaves to the west'); ok(r2.end === 'edge' && e2[1] < 0, 'ridge drop 2 leaves to the south');
near(Math.hypot(0.04 * RP[0], 0.04 * RP[1]) * 1000, 40, 1e-6, 'ridge drops 40 m apart'); both('s5hint', '几十米', 'a few dozen metres');
const d3 = M.flow(B, bs[0] + 0.06, bs[1] + 0.02); const e3 = d3.path[d3.path.length - 1];
ok(d3.end === 'hollow' && Math.hypot(e3[0] - bs[0], e3[1] - bs[1]) < 0.01, 'rim drop stops at the basin floor');
near(0.004 * M.MAP_M, 4, 1e-12, 'flow step 4 m'); both('s5e', '4 m');
// flow paths cross contours at right angles: each step is antiparallel to the gradient
for (const fl of [d1, r1, r2, d3]) for (let k = 1; k < fl.path.length; k += 7) { const [x, y] = fl.path[k - 1], g = M.grad(B, x, y), s = [fl.path[k][0] - x, fl.path[k][1] - y], c = -(g[0] * s[0] + g[1] * s[1]) / Math.hypot(...g) / Math.hypot(...s); ok(c > 0.999, 'step goes straight downhill'); }
// random drops: every flow ends at the edge or in the basin hollow
for (let k = 0; k < 60; k++) { const x = (k * 0.6180339) % 1, y = (k * 0.4142135 + 0.13) % 1, f = M.flow(B, x, y); ok(f.end === 'edge' || Math.hypot(f.path[f.path.length - 1][0] - bs[0], f.path[f.path.length - 1][1] - bs[1]) < 0.02, 'flow ends at edge or basin from ' + x.toFixed(2) + ',' + y.toFixed(2)); }
both('boundary', '100 × 100');

// ---- bilingual ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
ok(STRINGS.zh.foot.includes('《等高线》') && STRINGS.zh.compare.includes('对照另一版本：等高线'), 'credit and compare name the original');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|左边|右边|左上|右上|左下|右下|右侧|左侧|left chart|right chart|on the left|on the right/i.test(STRINGS[l][k]), 'no left/right chart wording in ' + k);

// ---- keys, controls, links ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['w0', 'x1', 'y1', 'p2', 'i3', 'checkQuiz', 'quizFeedback', 'drop1', 'drop2', 'drop3', 'clear5', 'c0', 'c0b', 'c1', 'c1b', 'c2', 'c2b', 'c3', 'c3b', 'c4', 'c4b', 'c5', 'c5b']) ok(html.includes(`id="${id}"`), 'control ' + id);
for (const f of ['peak', 'ridge', 'valley', 'saddle', 'basin']) ok(html.includes(`data-feature="${f}"`), 'feature button ' + f);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder and stylesheet');
ok(!html.includes('canvas-label-guard'), 'no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/geo/contour-lines/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS contour-lines core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · knoll ${K.top.toFixed(2)}/${K.saddle.toFixed(2)} m · saddle ${sd.toFixed(1)} m`);
