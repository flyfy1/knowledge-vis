'use strict';
// Photosynthesis (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`); checks++; };
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const AIR = M.RATE.airCO2;

// ---- formulas and masses ----
assert.deepEqual(M.parse('C6H12O6'), { C: 6, H: 12, O: 6 }); assert.deepEqual(M.parse('CO2'), { C: 1, O: 2 }); checks += 2;
ok(M.molarMass('CO2') === 44 && M.molarMass('H2O') === 18 && M.molarMass('O2') === 32 && M.molarMass('C6H12O6') === 180, 'molar masses');

// ---- step 1: the only balance within the slider range is 6, 6, 6 ----
const sols = [];
for (let a = 0; a <= M.COEF_MAX; a++) for (let b = 0; b <= M.COEF_MAX; b++) for (let d = 0; d <= M.COEF_MAX; d++) if (M.ledger(a, b, d).balanced) sols.push([a, b, d]);
assert.deepEqual(sols, [[6, 6, 6]]); checks++;
ok(M.ledger(1, 1, 1).left.O === 3 && M.ledger(1, 1, 1).right.O === 8, 'default 1,1,1 is unbalanced');
ok(Math.max(...[0, 12].map(a => M.ledger(a, 12, 12).left.O), M.ledger(12, 12, 12).right.O) <= 36, 'at most 36 atoms per bar (9 rows of 4 dots)');
// the full isotope-consistent version also balances (boundary text)
const L = M.countSide([[6, 'CO2'], [12, 'H2O']]), R = M.countSide([[1, 'C6H12O6'], [6, 'O2'], [6, 'H2O']]);
ok(['C', 'H', 'O'].every(e => L[e] === R[e]), '6CO2 + 12H2O → C6H12O6 + 6O2 + 6H2O balances');
ok(M.countSide([[12, 'H2O']]).O === 2 * 6, 'twelve waters supply exactly the 12 O atoms of 6 O2');

// ---- step 2: mass ledger ----
const b180 = M.massBook(180);
ok(b180.co2 === 264 && b180.water === 108 && b180.o2 === 192 && b180.fromCO2 === 168 && b180.fromWater === 12, '180 g ledger');
near(b180.shareCO2 * 100, 93.3, 0.05, '93.3% of sugar mass from CO2 (q2 answer, fb2right)');
for (let m = 18; m <= 900; m += 18) { const B = M.massBook(m); near(B.co2 + B.water, B.sugar + B.o2, 1e-9, 'mass conserved'); near(B.shareCO2, 168 / 180, 1e-12, 'share independent of amount'); ok(B.co2 + B.water <= 2000, 'fits the 2000 g axis'); }
const LB = 0.45359237;
near(5 * LB, M.HELMONT.startKg, 0.01, '5 lb ≈ 2.27 kg'); near((169 + 3 / 16) * LB, M.HELMONT.endKg, 0.01, '169 lb 3 oz ≈ 76.74 kg'); near(2 / 16 * LB * 1000, M.HELMONT.soilLossG, 0.5, '2 oz ≈ 57 g');
ok(STRINGS.zh.s2e.includes('2.3 kg') && STRINGS.zh.s2e.includes('76.7 kg') && STRINGS.zh.s2e.includes('57 g') && STRINGS.en.s2e.includes('76.7 kg'), 'Helmont numbers in text');

// ---- step 0: lamp and bubbles ----
near(M.lightFromDistance(20), 100, 1e-12, '100% at 20 cm'); near(M.lightFromDistance(40), 25, 1e-12, 'double distance → quarter light');
let prev = -1;
for (let d = 100; d >= 20; d -= 5) { const b = M.bubbles(M.lightFromDistance(d), AIR); ok(b >= prev, 'closer lamp never fewer bubbles'); prev = b; }
ok(M.bubbles(M.lightFromDistance(100), AIR) === 0, 'no bubbles at 100 cm');
const dSat = M.LAMP.refCm * Math.sqrt(100 / M.saturationLight(AIR));
near(dSat, 28.3, 0.05, 'saturation distance ≈ 28 cm (s0hint)');
for (let d = 20; d <= 100; d += 5) { const b = M.bubbles(M.lightFromDistance(d), AIR), bmax = M.bubbles(100, AIR); ok((d < dSat) === (b === bmax), `bubbles max exactly inside 28 cm (d=${d})`); }
ok(M.bubbles(0, AIR) === 0, 'lamp off → no bubbles');

// ---- step 3: light curve ----
near(M.saturationLight(AIR), 50, 1e-9, 'light saturation at 50%');
near(M.compensationLight(AIR), 8.33, 0.01, 'compensation ≈ 8% (s3hint)');
for (let I = 0; I <= 100; I++) {
  const r = M.rate(I, AIR);
  ok((r.net > 1e-12) === (I > M.compensationLight(AIR)), 'net positive exactly above compensation');
  ok(r.gross <= 6 + 1e-12 && r.net >= -1 - 1e-12 && r.gross <= 7, 'fits the −2..7 axis');
  ok((r.limit === 'light') === (I < 50), 'light-limited below 50%, CO2-limited above');
  ok(M.bubbles(I, AIR) === Math.max(0, Math.round(3 * r.net)), 'bubbles = 3 × net (illustrative)');
}

// ---- step 4: planks ----
near(M.lightTerm(80) / M.RATE.bCO2, 672, 1e-6, 'at 80% light the CO2 plank overtakes light at 672 ppm');
ok(M.rate(80, 420).limit === 'co2' && M.rate(80, 1000).limit === 'light', 's4hint crossover');
ok(M.rate(80, 1000).gross === M.rate(80, 1200).gross, 'past the crossover extra CO2 adds nothing');
for (let c = 260; c <= 1200; c += 20) near(M.marginal(30, c).co2, 0, 1e-12, 'at 30% light CO2 is useless');
for (let I = 0; I <= 100; I++) for (let c = 0; c <= 1200; c += 20) { const r = M.rate(I, c); ok(r.gross <= 18 && r.K <= 18, 'fits plank and curve axes'); }

// ---- step 5: a day ----
const sun = M.day(420, false), cloud = M.day(420, true), sunHi = M.day(1000, false), cloudHi = M.day(1000, true);
near(sun.used, 24, 1e-9, 'respiration 24 units·h');
near(cloud.net, cloudHi.net, 1e-12, 'overcast: 1000 ppm = 420 ppm (light limits)');
ok(cloud.net > 0 && cloud.net < 0.15 * sun.net, 'overcast leaves only a small surplus');
ok(sunHi.net > sun.net, 'enrichment helps on a sunny day');
const up = sun.pts.find(p => p.h > 6 && p.net > 0).h;
ok(up - 6 < 0.5, `net turns positive less than half an hour after sunrise (${(up - 6).toFixed(2)} h)`);
ok(sun.pts.filter(p => p.h < 6).every((p, i, a) => i === 0 || p.cum < a[i - 1].cum), 'account slides overnight');
for (const d of [sun, cloud, sunHi, cloudHi]) ok(d.pts.every(p => p.cum >= -10 && p.cum <= 80), "day curve fits −10..80 axis");

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|left chart|right chart|left picture|right picture/i.test(v), 'no left/right figure references');

// ---- keys used in HTML/app exist ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['d0', 'lamp0', 'test0', 'a1', 'b1', 'd1', 'solve1', 'reset1', 'check2', 'm2', 'i3', 'sweep3', 'clear3', 'i4', 'c4s', 'play5', 'clear5']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!/canvas-label-guard/.test(html), 'no label guard');

// ---- links ----
const hrefs = [...html.matchAll(/href="(\.\.\/[^"]+)"/g)].map(m => m[1]).filter(h => !h.endsWith('.css'));
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  if (anchor) ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(html.includes('href="../../../biology/cells/photosynthesis/"'), 'comparison link');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS photosynthesis core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} links · day nets sunny ${sun.net.toFixed(1)} / overcast ${cloud.net.toFixed(1)} / sunny+CO2 ${sunHi.net.toFixed(1)}`);
