'use strict';
// Seismic waves (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s, s2 = s) => { ok(STRINGS.zh[key].includes(s), `zh.${key} quotes ${s}`); ok(STRINGS.en[key].includes(s2), `en.${key} quotes ${s2}`); };

// ---- step 0: S − P ----
both('s0e', '6.0'); both('s0e', '3.5'); near(M.VP, 6.0, 0, 'vP'); near(M.VS, 3.5, 0, 'vS');
near(M.kmPerSecond, 8.4, 0.005, 'km per second of S − P'); both('s0e', '8.4');
near(M.arrivals(100).sp, 11.9, 0.05, '100 km → 11.9 s'); both('s0hint', '11.9');
for (let d = 20; d <= 600; d += 10) {
  const a = M.arrivals(d);
  near(a.tP, d / 6, 1e-9, 'tP'); near(a.tS, d / 3.5, 1e-9, 'tS');
  near(M.arrivals(2 * d).sp, 2 * a.sp, 1e-9, 'S − P doubles with d');
  near(M.distFromSP(a.sp), d, 1e-9, 'distance from S − P');
}
ok(Math.abs(M.seismo(200, 10)) < 1e-12, 'quiet before P arrives');

// ---- step 1: three circles ----
for (let x = 20; x <= 380; x += 40) for (let y = 20; y <= 380; y += 40) { const L = M.locate(x, y, 0); ok(L.miss < 0.5, `δ = 0 recovers (${x},${y}): miss ${L.miss}`); }
const L2 = M.locate(180, 200, 2, 1);
near(L2.miss, 15, 1, 'δ = +2 at (180,200) misses by about 15 km'); both('s1hint', '15'); both('s1hint', '(180, 200)');
ok(L2.radii[1] > Math.hypot(180 - M.STATIONS[1].x, 200 - M.STATIONS[1].y), 'B circle grows with δ > 0');
near(M.locate(180, 200, 1, 1).radii[1] - M.locate(180, 200, 0, 1).radii[1], 8.4, 0.005, '1 s of clock error = 8.4 km of radius'); both('s1hint', '8.4');
ok(M.locate(180, 200, 2, 1).rms > 0.5, 'circles no longer meet');

// ---- step 2: layers ----
both('s2e', '4.0'); both('s2e', '8.0'); ok(M.LAYERS.length === 6 && M.LAYERS.every(l => l.h === 8), '6 × 8 km');
near(M.LAYERS[0].v, 4.0, 0, 'top 4.0'); near(M.LAYERS[5].v, 8.0, 0, 'bottom 8.0');
for (let a = 10; a <= 80; a++) {
  const r = M.layerRay(a);
  r.angles.forEach((ang, k) => near(Math.sin(ang * Math.PI / 180) / M.LAYERS[k].v, r.q, 1e-12, 'sin i / v invariant'));
  for (let k = 1; k < r.angles.length; k++) ok(r.angles[k] > r.angles[k - 1], 'angle grows layer by layer');
  ok((a < 30) === (r.turnLayer === null), `i₀ = ${a}: passes all 6 layers iff below 30°`);
  if (r.X !== null) ok(r.X > 0 && r.X <= 200 && isFinite(r.X), 'return point inside the 0–200 km chart');
  if (a > 10) ok(r.depth <= M.layerRay(a - 1).depth, 'steeper goes at least as deep');
}
both('s2hint', '30°');

// ---- step 3: P fan and shadow ----
both('s3e', '3480'); both('s3e', '2891'); near(M.RE - M.RCMB, 2891, 0, 'CMB depth');
both('s3e', '13.7'); both('s3e', '8.1');
near(M.interp(M.MANTLE.P, M.RCMB), 13.72, 0.05, 'mantle P at the CMB ≈ 13.7');
const shP = M.shells('P'), coreTop = shP.find(s => s.ro <= M.RCMB + 1e-9), mantleBottom = shP.filter(s => s.ri >= M.RCMB - 1e-9).pop();
near(coreTop.v, 8.1, 0.06, 'outer core P ≈ 8.1'); near(mantleBottom.v, 13.7, 0.06, 'lowest mantle shell ≈ 13.7');
both('s3e', '1913'); both('s3e', '1936');
ok(M.gaps('P', M.RCMB, { noCore: true }).length === 0, 'no core → no shadow');
const gO = M.gaps('P', M.RCMB, { noInner: true }), gF = M.gaps('P', M.RCMB, {});
ok(gO.length === 1 && Math.round(gO[0][0]) === 97 && Math.round(gO[0][1]) === 141, 'outer core only: 97°–141°'); both('s3hint', '97°–141°');
ok(gF.length === 1 && Math.round(gF[0][0]) === 97 && Math.round(gF[0][1]) === 114, 'with inner core the shadow ends at 114°'); both('s3hint', '114°');
both('s3hint', '104°–140°');

// ---- step 4: S shadow and travel times ----
const gS = M.gaps('S', M.RCMB, {});
ok(gS.length === 1 && Math.round(gS[0][0]) === 101 && gS[0][1] >= 179.9, 'S shadow from 101° to 180°'); both('s4e', '101°'); both('s4hint', '101°');
near(M.shadowStart('S', M.RCMB), 101, 0.5, 'S shadow start ~101');
const FP = M.fan('P', M.RCMB, { n: 1500 }), FS = M.fan('S', M.RCMB, { n: 1500 });
const A = d => M.firstArrivals(d, FP, FS);
near((A(10).S - A(10).P) / 60, 1.8, 0.05, 'S − P at 10° ≈ 1.8 min'); both('s4hint', '1.8');
near((A(90).S - A(90).P) / 60, 11, 0.2, 'S − P at 90° ≈ 11 min'); both('s4hint', '11');
for (let d = 10; d <= 90; d += 5) ok(A(d).P && A(d).S && A(d).S > A(d).P, `P and S at ${d}°`);
for (let d = 10; d < 90; d += 5) ok(A(d + 5).S - A(d + 5).P > A(d).S - A(d).P, 'S − P grows with distance');
ok(A(100).S && !A(100).P && !A(100).PKP, '100°: only S'); ok(!A(110).P && !A(110).PKP && !A(110).S, '110°: nothing');
for (let d = 120; d <= 180; d += 10) ok(A(d).PKP && !A(d).S && !A(d).P, `${d}°: PKP only`);
for (const d of [5, 30, 60, 90, 120, 150, 180]) for (const k of ['P', 'PKP', 'S']) if (A(d)[k]) ok(A(d)[k] / 60 < 30, 'fits the 0–30 min chart');

// ---- step 5: inversion ----
near(M.OBSERVED_RC, 3480, 0, 'observed core radius'); near(M.shadowStart('P', M.OBSERVED_RC), 97.2, 0.05, 'observed start 97.2'); both('s5e', '97.2'); both('s5hint', '97.2');
near(M.shadowStart('P', 2500), 124, 0.5, 'rc 2500 → 124°'); both('s5hint', '124°');
near(M.shadowStart('P', 4500), 70, 0.5, 'rc 4500 → ~70°'); both('s5hint', '70°');
both('s5hint', '3480'); both('s5hint', '2891'); both('s5hint', '2500'); both('s5hint', '4500');
let prev = Infinity, matches = 0;
for (let r = 2500; r <= 4500; r += 50) { const s = M.shadowStart('P', r); ok(s < prev, 'monotonic decreasing'); prev = s; ok(s > 60 && s < 130, 'inside the 60–130° chart'); }
for (let r = 2500; r <= 4500; r += 10) if (Math.abs(M.shadowStart('P', r) - 97.24) < 0.5) matches++;
ok(matches >= 1 && matches <= 6, 'only a narrow band of radii matches within 0.5°');

// ---- finale ----
for (const l of ['zh', 'en']) { ok(STRINGS[l].s6fin.includes('8.4') && STRINGS[l].s6fin.includes('101°') && STRINGS[l].s6fin.includes('3480'), 'finale numbers'); ok(STRINGS[l].formula.includes('8.4'), 'formula'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(Object.keys(STRINGS.zh).filter(k => STRINGS.zh[k] === STRINGS.en[k] && /^(s0lg[PS]|s4lg|s4arr)/.test(k)));
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const m of app.matchAll(/'(s3via[A-Za-z]+|s5(?:bigger|smaller)|mode(?:No|Outer|Full))'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'd0', 'play0', 'ex1', 'ey1', 'dl1', 'i2', 'i3', 'modeNo', 'modeOuter', 'modeFull', 'st4', 'rc5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard') && !app.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + stylesheet');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/geo/seismic-waves/index.html')), 'comparison link target exists');
ok(html.includes('href="../../../earth/geo/seismic-waves/"'), 'comparison link');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS seismic-waves core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
