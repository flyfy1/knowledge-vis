'use strict';
// Simple circuits (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const both = (key, ...subs) => { for (const l of ['zh', 'en']) for (const s of subs) ok(STRINGS[l][key].includes(s), `${l}.${key} quotes ${s}`); };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const fmt = eval('(' + app.match(/const fmt = ([^\n]+);\n/)[1] + ')');
ok(fmt(90, 0) === '90' && fmt(100, 1) === '100' && fmt(0.2717, 3) === '0.272' && fmt(2.5, 2) === '2.5', 'fmt keeps integer zeros');

// ---- the solver: Kirchhoff and Ohm on a few hand-solvable circuits ----
{
  const S = M.solve({ n: 2, els: [{ kind: 'cell', a: 0, b: 1, E: 3, r: 1 }, { kind: 'R', a: 1, b: 0, R: 10 }] });
  near(S.I[1], 3 / 11, 1e-12, 'one loop: I = E / (R + r)'); near(S.I[0], S.I[1], 1e-12, 'same current through cell and bulb');
  const P = M.solve({ n: 2, els: [{ kind: 'cell', a: 0, b: 1, E: 3, r: 1 }, { kind: 'R', a: 1, b: 0, R: 10 }, { kind: 'R', a: 1, b: 0, R: 10 }] });
  near(P.I[0], 3 / 6, 1e-12, 'two 10 Ω in parallel = 5 Ω'); near(P.I[1] + P.I[2], P.I[0], 1e-12, 'currents add at a junction');
  ok(M.BULB.ratedP === 0.9 && M.BULB.burnP === 1.8 && M.BULB.R === 10 && M.CELL.E === 1.5 && M.CELL.r === 0.5, 'model constants match the text');
  both('boundary', '1.5', '0.5', '10', '0.02', '1.8');
}

// ---- step 0: where the leads go ----
for (const r of ['tip', 'side', 'none']) for (const b of ['tip', 'side', 'plus', 'none']) {
  const H = M.hookup(r, b), lit = M.lit(H.bulbP), good = (r === 'tip' && b === 'side') || (r === 'side' && b === 'tip');
  ok(lit === good, `bulb lights only with one lead on each contact (${r}, ${b})`);
  ok(H.short === ((r !== 'none' && r === b) || b === 'plus'), `short when both leads share a contact or − joins + (${r}, ${b})`);
  if (!lit && !H.short) near(H.batI, 0, 1e-9, 'open: no current');
}
near(M.hookup('tip', 'side').bulbI, 3 / 11, 1e-3, 'lit current ≈ 0.272 A');
ok(fmt(M.hookup('tip', 'side').bulbI, 3) === '0.272', 'readout 0.272');
ok(M.hookup('tip', 'tip').batI > 10 * M.hookup('tip', 'side').batI, 'short current is more than 10× normal');

// ---- step 1: one loop ----
{
  const L = M.loop(true), I = L.cur.bat;
  for (const id of M.LOOP) near(Math.abs(L.cur[id]), Math.abs(I), 1e-9, 'same current in ' + id);
  ok(M.lit(L.pow.bulb), 'closed loop lights');
  ok(fmt(Math.abs(L.cur.w1), 3) === fmt(Math.abs(L.cur.w2), 3) && fmt(Math.abs(L.cur.w2), 3) === fmt(Math.abs(L.cur.w4), 3), 'three meters read the same');
  for (const cut of ['w1', 'w2', 'w3', 'w4']) { const C = M.loop(true, [cut]); ok(!M.lit(C.pow.bulb), 'cut ' + cut + ' puts the bulb out'); for (const id of M.LOOP) near(C.cur[id], 0, 1e-9, 'all zero after cutting ' + cut); }
  const O = M.loop(false); for (const id of M.LOOP) near(O.cur[id], 0, 1e-9, 'switch open: zero in ' + id);
}

// ---- step 2: conductors and insulators ----
{
  const cu = M.tester('copper');
  for (const id of ['copper', 'iron', 'foil']) { const T = M.tester(id); ok(T.cls === 'good' && T.P >= 0.8 * cu.P, id + ' lights fully'); }
  const lead = M.tester('lead'); ok(lead.cls === 'good' && lead.P < 0.8 * cu.P && M.lit(lead.P), 'pencil lead lights, dimmer (clsGoodDim)');
  const salt = M.tester('salt'); ok(salt.cls === 'poor' && !M.lit(salt.P) && salt.I >= 1e-3, 'salt water: measurable current, no glow');
  for (const id of ['plastic', 'rubber', 'wood', 'glass', 'paper']) { const T = M.tester(id); ok(T.cls === 'none' && T.I < 1e-6, id + ' is an insulator (< 1 µA)'); }
  ok(M.tester(null).I === 0 || M.tester(null).I < 1e-12, 'empty gap: no current');
  ok(M.MATERIALS.length === 10, 'ten materials'); for (const m of M.MATERIALS) ok(STRINGS.zh['mat_' + m.id] && STRINGS.en['mat_' + m.id], 'material name ' + m.id);
}

// ---- step 3: two bulbs ----
{
  const p0 = M.cells(2).P, s = M.twoBulbs('series'), p = M.twoBulbs('parallel');
  near(s.pow.b1, s.pow.b2, 1e-9, 'series bulbs equal'); ok(s.pow.b1 < 0.3 * p0, 'series: each much dimmer than one bulb');
  ok(p.pow.b1 > 2 * s.pow.b1 && p.pow.b1 < p0 && p.pow.b1 > 0.75 * p0, 'parallel: far brighter than series, somewhat dimmer than one bulb (noteP)');
  near(p.pow.b1, p.pow.b2, 0.01, 'parallel bulbs nearly equal');
  ok(!M.lit(M.twoBulbs('series', ['b2']).pow.b1), 'series: unscrewing bulb 2 puts bulb 1 out');
  const pg = M.twoBulbs('parallel', ['b2']); ok(M.lit(pg.pow.b1) && Math.round(100 * pg.pow.b1 / p0) === 100, 'parallel: bulb 1 stays lit, like a single bulb');
}

// ---- step 4: short circuit ----
{
  const off = M.shorted(false), on = M.shorted(true);
  ok(M.lit(off.pow.bulb) && !M.lit(on.pow.bulb), 'short wire puts the bulb out');
  ok(on.batI / off.batI > 10 && on.heat / off.heat > 100, `current ×${(on.batI / off.batI).toFixed(1)}, battery heat ×${Math.round(on.heat / off.heat)}`);
  ok(on.shortI > 0.99 * on.batI, 'almost all the current takes the short wire');
  ok(on.batI > 1 && off.batI < 1, 'only the short circuit draws wires hot (> 1 A)');
}

// ---- step 5: more cells ----
{
  const pct = n => Math.round(100 * M.cells(n).P0 / M.BULB.ratedP);
  ok(pct(1) < 60 && pct(2) >= 60 && pct(2) <= 120 && pct(3) > 120, `1 cell dim, 2 near normal, 3 over (${pct(1)}, ${pct(2)}, ${pct(3)} %)`);
  ok(!M.cells(3).burnt && M.cells(4).burnt && M.cells(4).P0 > M.BULB.burnP, '4 cells burn the filament');
  ok(M.cells(4).I === 0 && M.cells(4).P === 0, 'burnt filament: current 0');
  ok(M.cells(4).P0 < 2.75, 'chart y-range covers every point');
  both('s5e', '0.9', '1.5', '3'); both('s5hint', '1.8', '10'); both('stBurnt', '1.8');
  ok(/id="n5"[^>]*min="1" max="4" step="1"/.test(html), 'cell slider 1–4');
}

// ---- step 6: quiz answers agree with the explanations ----
{
  const want = { open: false, normal: true, seriesGone: false, parallelGone: true, shortWire: false, plastic: false, lead: true, samePole: false };
  for (const q of M.QUIZ) { ok(M.quizLit(M.quiz(q)) === want[q], 'quiz ' + q); ok(STRINGS.zh['why_' + q] && STRINGS.en['why_' + q], 'explanation ' + q); }
  ok(M.QUIZ.length === 8, 'eight questions');
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left panel|right panel/i.test(v), `no left/right chart wording in ${l}.${k}`);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['sw1', 'cutA', 'cutB', 'cutC', 'cutD', 'mend1', 'mats2', 'clear2', 'series3', 'parallel3', 'unscrew3', 'short4', 'n5', 'new5', 'check6', 'next6']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('../../../page-provenance.css') && html.includes('<!-- page-provenance -->'), 'provenance hooks');

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h); ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(html.includes('href="../../../physics/circuits/simple-circuits/"') && fs.existsSync(path.join(dir, '../../../physics/circuits/simple-circuits/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS simple-circuits core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size - 0} links`);
