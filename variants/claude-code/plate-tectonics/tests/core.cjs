'use strict';
// Plate tectonics (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const both = (key, s) => ['zh', 'en'].forEach(l => ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`));

// ---- step 0: stripes ----
ok(M.polarityAt(0.1) === 1 && M.polarityAt(0.9) === -1 && M.polarityAt(1.0) === 1, 'polarity timeline');
for (let i = 1; i < M.NORMAL.length; i++) ok(M.NORMAL[i][0] > M.NORMAL[i - 1][1], 'intervals ordered and disjoint');
near(M.NORMAL[M.NORMAL.length - 1][1], M.T0, 0, 'simulation starts at the end of the oldest listed normal interval');
for (let u = 1; u <= 8.0001; u += 0.1) {
  near(M.brunhesKm(u), 7.8 * u, 1e-9, '0.78 Ma boundary = u × 0.78 × 10');
  const st = M.stripes(u, 0);
  // stripes tile [0, width] without gaps, alternate polarity, and match crustAt
  near(st[0].x0, 0, 1e-12, 'starts at ridge'); near(st[st.length - 1].x1, M.widthAt(u, 0), 1e-9, 'ends at width');
  for (let i = 1; i < st.length; i++) { near(st[i].x0, st[i - 1].x1, 1e-9, 'contiguous'); ok(st[i].pol !== st[i - 1].pol, 'alternating'); }
  for (const s of st) { const c = M.crustAt((s.x0 + s.x1) / 2, u, 0); ok(c && c.pol === s.pol, 'stripe polarity = crust polarity'); }
  // the first normal stripe ends at the Brunhes boundary
  near(st[0].x1, M.brunhesKm(u), 1e-9, 'central stripe width');
  // symmetric profile
  for (let x = 5; x < 400; x += 37) near(M.profile(u, 0, x), M.profile(u, 0, -x), 1e-12, 'mirror symmetry');
  ok(M.widthAt(u, 0) <= 450 * 0.94, 'whole sea floor fits the ±450 km view');
}
// mid-simulation: crust only out to (T0 − tNow) × 10u; older-than-T0 crust absent
for (const tNow of [5, 3, 1, 0.5]) { const u = 3; ok(M.crustAt(M.widthAt(u, tNow) - 0.01, u, tNow) && !M.crustAt(M.widthAt(u, tNow) + 0.01, u, tNow), 'growth front'); ok(M.stripes(u, tNow).every(s => s.x0 >= -1e-9), 'stripes from the ridge'); }
// quiz: 39 km at 0.78 Ma → 5 cm/yr
{ const u = 39 / 0.78 / 10; near(u, 5, 1e-12, 'quiz answer'); both('quizPrompt', '39'); both('correct', '5 cm/'); both('quizB', '5 cm/'); near(M.brunhesKm(5), 39, 1e-9, 'u = 5 → 39 km'); }
near(M.brunhesKm(2.5), 19.5, 1e-9, 'default 2.5 cm/yr → 19.5 km');
both('s0e', '0.78'); near(M.T0, 5.23, 0, 'T0 = 5.23 Ma');
ok(STRINGS.zh.play0.includes('523 万年') && STRINGS.en.play0.includes('5.23 million'), 'play label quotes T0');

// ---- step 1: relative motion ----
for (let th = 0; th < 360; th += 5) for (const v of [1, 5, 10]) {
  const r = M.relMotion(v, th);
  near(Math.hypot(r.normal, r.shear), v, 1e-9, 'components recombine');
  const off = Math.min(...[90, 270].map(b => Math.min(Math.abs(th - b), 360 - Math.abs(th - b))));
  ok((r.type === 'transform') === (off < 20 - 1e-9), `transform iff within 20° of N–S at θ=${th}`);
  if (r.type !== 'transform') ok((r.type === 'divergent') === (Math.cos(th * Math.PI / 180) > 0), 'opening → divergent');
  ok(r.type === M.relMotion(1, th).type, 'speed never changes the type');
}
ok(M.relMotion(5, 0).type === 'divergent' && M.relMotion(5, 180).type === 'convergent' && M.relMotion(5, 90).type === 'transform', 'presets');
// s1hint: from 0° to 90°, the switch happens past 70°
ok(M.relMotion(5, 70).type === 'divergent' && M.relMotion(5, 75).type === 'transform', 'flip between 70° and 75°'); both('s1hint', '70°'); both('s1e', '20°');

// ---- step 2: who sinks ----
near(M.seaDepth(0), 2500, 1e-9, 'ridge depth'); both('s2hint', '2500 + 350√');
ok(Math.abs(M.dYoung(M.T_SWITCH) - M.dOld(M.T_SWITCH)) < 1e-6, 'switch at the crossing'); near(M.T_SWITCH, 26.3, 0.1, 'crossing near 26 Ma');
for (let a = 20; a <= 70; a += 0.5) ok(Math.abs(M.dYoung(a) - M.dOld(a)) < 100, 'fits agree within 100 m over 20–70 Ma');
for (let a = 1; a <= 180; a++) ok(M.seaDepth(a) > M.seaDepth(a - 1), 'older is deeper');
ok(M.whoSinks({ kind: 'ocean', age: 120 }, { kind: 'ocean', age: 40 }).sinks === 'a', 'older A sinks');
ok(M.whoSinks({ kind: 'ocean', age: 20 }, { kind: 'ocean', age: 90 }).sinks === 'b', 'older B sinks');
ok(M.whoSinks({ kind: 'ocean', age: 30 }, { kind: 'cont', age: 0 }).sinks === 'a', 'ocean under continent');
ok(M.whoSinks({ kind: 'cont', age: 0 }, { kind: 'cont', age: 0 }).sinks === 'none', 'continents collide');
ok(M.whoSinks({ kind: 'ocean', age: 60 }, { kind: 'ocean', age: 60 }).sinks === 'tie', 'same age tie');
// the switch happens exactly where A's age passes B's age (s2hint), apart from the <50 m tie band
for (let b = 2; b <= 180; b += 7) for (let a = 2; a <= 180; a++) { const w = M.whoSinks({ kind: 'ocean', age: a }, { kind: 'ocean', age: b }); if (w.sinks !== 'tie') ok((w.sinks === 'a') === (a > b), 'older sinks for every age pair'); }
ok(M.RHO.cont < M.RHO.ocean && M.RHO.ocean < M.RHO.mantle, 'density order'); both('s2e', '2.7'); both('s2e', '2.9'); both('s2e', '3.3');

// ---- step 3: Benioff zone ----
for (let dip = 15; dip <= 75; dip++) {
  const q = M.slabQuakes(dip, 300, 11), est = M.fitDip(q);
  near(est, dip, 1.5, 'fitted dip recovers the set dip at ' + dip);
  ok(q.every(p => p.z > 0 && p.z < 700), 'depths within 0–700 km');
  near(M.arcDistance(dip), 100 / Math.tan(dip * Math.PI / 180), 1e-9, 'arc distance');
  ok(Math.max(...q.map(p => p.z)) > 600, 'deep quakes reach > 600 km');
}
near(M.arcDistance(30), 173, 0.5, 'arc at 30° ≈ 173 km'); near(M.arcDistance(60), 58, 0.5, 'arc at 60° ≈ 58 km'); both('s3hint', '173'); both('s3hint', '58');
both('s3e', '670'); both('s3e', '100');
// partial records (batches of 30 in the animation) still fit within a few degrees once ≥ 60 quakes are in
for (const dip of [20, 45, 70]) for (let n = 60; n <= 300; n += 30) near(M.fitDip(M.slabQuakes(dip, 300, 11).slice(0, n)), dip, 4, `partial fit n=${n}`);

// ---- step 4: stick-slip ----
for (let v = 1; v <= 6; v += 0.5) for (let D = 1; D <= 8; D += 0.5) {
  const S = M.stickSlip(v, D, 1000);
  near(S.recurrence, D / (v / 100), 1e-9, 'recurrence = D / rate');
  S.events.forEach((e, i) => near(e.year, (i + 1) * S.recurrence, 1e-6, 'regular cycle'));
  ok(S.events.length === Math.floor(1000 / S.recurrence + 1e-9), 'count in 1000 years');
  // conservation: released + deficit = rate × time at any moment
  for (let y = 0; y <= 1000; y += 37) near(S.releasedAt(y) + S.deficitAt(y), S.rate * y, 1e-9, 'released + deficit = v·t');
  ok([...Array(101).keys()].every(i => S.deficitAt(i * 10) <= D + 1e-9), 'deficit never exceeds D');
  const I = M.stickSlip(v, D, 1000, true);
  for (let y = 0; y <= 1000; y += 37) near(I.releasedAt(y) + I.deficitAt(y), I.rate * y, 1e-9, 'irregular: conservation');
  I.events.forEach(e => ok(e.slip >= 0.7 * D - 1e-9 && e.slip <= 1.3 * D + 1e-9, '±30% strength'));
}
// irregular: long-run mean interval close to D / rate (s4hint)
{ const S = M.stickSlip(3.5, 4, 200000, true, 9); const mean = S.events[S.events.length - 1].year / S.events.length; near(mean / (4 / 0.035), 1, 0.03, 'irregular mean interval'); }
near(M.stickSlip(3.5, 4, 1000).recurrence, 114.29, 0.01, 'default recurrence ≈ 114 years');

// ---- step 5: sites ----
const SITE_TYPES = ['transform', 'divergent', 'convergent']; // page order
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
ok(app.includes("const SITE_TYPES = ['transform', 'divergent', 'convergent']"), 'app uses the same site order');
SITE_TYPES.forEach((type, i) => {
  const q = M.siteQuakes(type, 140, 31 + i), st = M.depthStats(q);
  if (type === 'convergent') { ok(st.max > 600, 'site 3 deeper than 600 km'); ok(st.deepShare > 0.3, 'many deep'); }
  if (type === 'divergent') ok(st.max < 15, 'site 2 all shallower than 15 km');
  if (type === 'transform') ok(st.max < 20, 'site 1 all shallower than 20 km');
});
both('ev1', '20 km'); both('ev2', '15 km'); both('ev3', '600 km'); both('ev3', '140 km');
near(M.arcDistance(35), 140, 3, 'site 3 arc ≈ 140 km (35° slab)');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['lbBrunhes', 'lb100']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|\bleft (plot|panel|chart)\b|\bright (plot|panel|chart)\b/i.test(v), `no left/right figure reference in ${l}.${k}`);

// ---- keys, controls, provenance ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const ty of ['divergent', 'convergent', 'transform', 'none']) ok(STRINGS.zh['t_' + ty], 'type name ' + ty);
for (const r of ['oceanVsCont', 'older', 'sameAge', 'collide']) ok(STRINGS.zh['v_' + r], 'verdict ' + r);
for (let i = 1; i <= 3; i++) ok(STRINGS.zh['why' + i] && STRINGS.zh['site' + i], 'site strings ' + i);
for (const id of ['u0', 't0', 'play0', 'checkQuiz', 'th1', 'v1', 'pairOO', 'pairOC', 'pairCC', 'ageA', 'ageB', 'dip3', 'rec3', 'clear3', 'v4', 'd4', 'y4', 'irr4', 'play4', 'pick1', 'pick2', 'pick3', 'check5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../earth/geo/plate-tectonics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS plate-tectonics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
