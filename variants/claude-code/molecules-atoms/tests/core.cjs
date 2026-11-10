'use strict';
// Molecules & atoms (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..'), root = path.resolve(dir, '../../..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

// ---- pictures agree with formulas (the sketches are the counted objects) ----
Object.keys(M.FORMULA).forEach(f => { const c = {}; M.LAYOUT[f].forEach(([e]) => { c[e] = (c[e] || 0) + 1; }); ok(JSON.stringify(Object.entries(c).sort()) === JSON.stringify(Object.entries(M.FORMULA[f]).sort()), 'layout = formula ' + f); });

// ---- step 0: subscript × coefficient ----
ok(M.atomTotal('H2O') === 3 && M.atomsIn('H2O', 3).H === 6 && M.atomsIn('H2O', 3).O === 3 && M.atomTotal('H2O', 3) === 9, '3H2O = 6 H + 3 O = 9 atoms');
ok(M.atomsIn('CH4').C === 1 && M.atomsIn('CH4').H === 4, 'CH4: C subscript 1');
['H2O', 'CO2', 'O2', 'NH3', 'CH4'].forEach(f => { for (let n = 1; n <= 4; n++) Object.keys(M.FORMULA[f]).forEach(e => ok(M.atomsIn(f, n)[e] === n * M.FORMULA[f][e], 'linear in n')); });

// ---- step 1: same elements, different molecules ----
ok(M.HO_SET.every(f => Object.keys(M.FORMULA[f]).every(e => e === 'H' || e === 'O')), 'only H and O');
ok(M.sameKinds('H2O2', 'H2O') && !M.sameMolecule('H2O2', 'H2O'), 'H2O2: same elements, other molecule');
ok(M.atomsIn('H2O2').O - M.atomsIn('H2O').O === 1, 'one extra O');
ok(M.BOIL.H2O === 100 && M.BOIL.H2O2 === 150.2, 'boiling points quoted');
{ const d = M.BOIL.O3 - M.BOIL.O2; ok(d > 70 && d < 80, 'O2/O3 more than 70 degrees apart'); }
ok(M.stateAt('H2O', 20) === 'liquid' && M.stateAt('H2O2', 20) === 'liquid' && ['H2', 'O2', 'O3'].every(f => M.stateAt(f, 20) === 'gas'), 'room-temperature states');

// ---- step 2: phases and the steam spacing note ----
ok(M.phase(-1) === 'solid' && M.phase(0) === 'liquid' && M.phase(99) === 'liquid' && M.phase(100) === 'gas', 'phase boundaries 0 and 100 °C');
{ const r = M.steamSpacingRatio(100); ok(Math.round(r.spacing) === 12, 'about 12 times farther apart'); ok(Math.round(r.volume / 100) * 100 === 1600, 'about 1600 times the volume'); }
{ const tl = M.tally({ H2O: 12 }); ok(tl.atoms.H === 24 && tl.atoms.O === 12 && tl.molecules === 12, 'ledger 12 H2O, 24 H, 12 O'); }

// ---- step 3: electrolysis ----
for (let start = 4; start <= 16; start += 2) {
  const t0 = M.tally({ H2O: start });
  for (let k = 0; k <= start / 2; k++) {
    const e = M.electrolysis(start, k), tl = M.tally({ H2O: e.H2O, H2: e.H2, O2: e.O2 });
    ok(tl.atoms.H === t0.atoms.H && tl.atoms.O === t0.atoms.O, 'atoms unchanged');
    ok(e.H2 === 2 * e.O2, 'H2 = 2 × O2');
    ok(e.H2O >= 0, 'no negative water');
  }
  ok(M.electrolysis(start, 99).H2O === 0 && M.electrolysis(start, 99).max === start / 2, 'runs out after start/2 events');
}

// ---- step 4: the test classifies every scenario as intended ----
const expect = { melt: false, alcohol: false, iodine: false, charcoal: true, hydrogen: true, ozone: true, electro: true };
M.SCENARIOS.forEach(sc => {
  const v = M.classify(sc); ok(v.chemical === expect[sc.id], 'verdict ' + sc.id);
  const bal = list => { const a = {}; list.forEach(f => Object.keys(M.FORMULA[f]).forEach(e => { a[e] = 1; })); return Object.keys(a).sort().join(); };
  ok(bal(sc.before) === bal(sc.after), 'same elements on both sides ' + sc.id);
});
ok(M.classify(M.SCENARIOS.find(s => s.id === 'ozone')).sameElements, 'ozone: same element, still chemical');

// ---- step 5: ledger ----
{ const t0 = M.tally(M.burn(0)); ok(t0.molecules === 12 && t0.mass === 144 && t0.atoms.H === 16 && t0.atoms.O === 8, 'start 8 H2 + 4 O2');
  ok(M.BURN_MAX === 4, '4 reactions');
  for (let r = 0; r <= 4; r++) { const tl = M.tally(M.burn(r)); ok(tl.molecules === 12 - r, 'one molecule fewer per reaction'); ok(tl.mass === 144 && tl.atoms.H === 16 && tl.atoms.O === 8, 'atoms and mass constant'); }
  ok(M.tally(M.burn(4)).molecules === 8, 'ends at 8'); ok(M.molMass('H2') === 2 && M.molMass('O2') === 32 && M.molMass('H2O') === 18, 'relative masses quoted'); }

// ---- bilingual strings, html keys, links ----
const zh = STRINGS.zh, en = STRINGS.en, ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
ok(JSON.stringify(Object.keys(zh).sort()) === JSON.stringify(Object.keys(en).sort()), 'same key sets');
Object.keys(zh).forEach(k => ok(ph(zh[k]) === ph(en[k]), 'placeholders ' + k));
Object.keys(zh).forEach(k => { if (!['foot'].includes(k) && /[一-鿿]/.test(zh[k])) ok(zh[k] !== en[k] && !/[一-鿿]/.test(en[k]), 'en translated ' + k); });
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
[...html.matchAll(/data-i18n(?:-html|-aria)?="(\w+)"/g)].forEach(m => ok(m[1] in zh, 'html key ' + m[1]));
[...app.matchAll(/\bt\('(\w+)'[,)]/g)].forEach(m => ok(m[1] in zh, 'app key ' + m[1]));
M.SCENARIOS.forEach(s => ok(('sc_' + s.id) in zh, 'scenario name')); ['solid', 'liquid', 'gas'].forEach(s => ok(('st_' + s) in zh && ('ph_' + s) in zh, 'state names'));
const re = /href="\.\.\/\.\.\/\.\.\/([^"#]*)(#step(\d+))?"/g;
const links = [...html.matchAll(re)].concat(...Object.values(zh).concat(Object.values(en)).map(s => [...s.matchAll(re)]));
links.filter(m => m[1] === '' || m[1].endsWith('/')).forEach(m => { const f = path.join(root, m[1], 'index.html'); ok(fs.existsSync(f), 'link target ' + m[1]); if (m[3]) ok(fs.readFileSync(f, 'utf8').includes(`id="step${m[3]}"`), 'anchor ' + m[1] + m[2]); });
ok(html.includes('href="../../../chemistry/matter/molecules-atoms/"') && html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'compare link, provenance slot, css');
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(!/左图|右图|左边是|右边是/.test(zh.s2e + zh.s3e + zh.s4e), 'no left/right figure references');
console.log(`molecules-atoms core: ${checks} checks passed`);
