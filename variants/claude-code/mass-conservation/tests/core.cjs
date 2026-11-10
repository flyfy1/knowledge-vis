'use strict';
// Mass conservation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

// ---- relative masses quoted on the page ----
eq([M.AR.H, M.AR.C, M.AR.O], [1, 12, 16], 'H 1, C 12, O 16');
eq(M.molarMass('H2O'), 18, 'H2O = 18'); eq(M.molarMass('CaCO3'), 100, 'CaCO3 = 100'); eq(M.molarMass('HCl'), 36.5, 'HCl = 36.5');
eq(M.molarMass('CaCl2'), 111, 'CaCl2 = 111'); eq(M.molarMass('CO2'), 44, 'CO2 = 44'); eq(M.molarMass('MgO'), 40, 'MgO = 40');
// composition derived from the drawn atoms matches the formula
const FORMULA = { H2: { H: 2 }, O2: { O: 2 }, H2O: { H: 2, O: 1 }, C: { C: 1 }, CO2: { C: 1, O: 2 }, CH4: { C: 1, H: 4 }, CaCO3: { Ca: 1, C: 1, O: 3 }, HCl: { H: 1, Cl: 1 }, CaCl2: { Ca: 1, Cl: 2 }, Mg: { Mg: 1 }, MgO: { Mg: 1, O: 1 } };
for (const [sp, comp] of Object.entries(FORMULA)) eq(M.SPECIES[sp].comp, comp, 'composition ' + sp);

// ---- step 1: every listed reaction is balanced; the atom pairing keeps each element ----
for (const [name, rx] of Object.entries(M.REACTIONS)) {
  const L = M.ledger(rx.left, rx.right);
  ok(L.balanced && L.massEqual, name + ' balanced and mass-equal');
  const A = M.atoms(rx.left), B = M.atoms(rx.right), pair = M.pairing(rx);
  eq(A.length, B.length, name + ' same atom count');
  eq(new Set(pair).size, B.length, name + ' pairing is one-to-one');
  pair.forEach((j, i) => eq(A[i].el, B[j].el, name + ' pairs same element'));
}
// s1hint: 2 H2 + O2 → 2 H2O : 4 H and 2 O
eq(M.count(M.REACTIONS.hydrogen.left), { H: 4, O: 2 }, 'hydrogen: 4 H + 2 O');
eq(M.count(M.REACTIONS.marble.right), { Ca: 1, Cl: 2, H: 2, O: 3, C: 1 }, 'marble products');

// ---- step 2: balancing with coefficients 1..4 ----
const h2 = (a, b, c) => M.ledger([['H2', a], ['O2', b]], [['H2O', c]]);
const ch4 = (a, b, c, d) => M.ledger([['CH4', a], ['O2', b]], [['CO2', c], ['H2O', d]]);
// s2hint path: 1,1,1 → water 2 (O matches, H off) → hydrogen 2 (balanced)
ok(!h2(1, 1, 1).balanced, '1,1,1 unbalanced');
const w2 = h2(1, 1, 2); ok(w2.rows.find(r => r.el === 'O').ok && !w2.rows.find(r => r.el === 'H').ok, 'water 2: O matches, H off');
ok(h2(2, 1, 2).balanced, '2,1,2 balanced');
eq(M.molarMass('H2O') * 2, 36, 'balanced water side 36');
// atoms equal ⇒ masses equal (all grids); the methane counter-example 3,1,1,2 is mass-equal but not balanced
let found = [];
for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) for (let c = 1; c <= 4; c++) {
  const L = h2(a, b, c); if (L.balanced) ok(L.massEqual, 'balanced ⇒ mass equal (H2)');
  for (let d = 1; d <= 4; d++) { const K = ch4(a, b, c, d); if (K.balanced) ok(K.massEqual, 'balanced ⇒ mass equal (CH4)'); if (K.massEqual && !K.balanced) found.push([a, b, c, d].join()); }
}
ok(found.includes('3,1,1,2'), 'counter-example 3,1,1,2 exists');
const ce = ch4(3, 1, 1, 2); eq([ce.mL, ce.mR], [80, 80], 'counter-example masses 80 = 80');
eq(ce.rows.find(r => r.el === 'C'), { el: 'C', left: 3, right: 1, ok: false }, 'carbon 3 vs 1');
// the beam tilts toward the heavier side and is level only when masses match
ok(M.tilt(10, 20) > 0 && M.tilt(20, 10) < 0 && M.tilt(5, 5) === 0, 'tilt direction');
ok(Math.abs(M.tilt(1, 100)) <= 0.18, 'tilt capped');

// ---- step 0 and step 3: the marble experiment ----
const c0 = M.marbleContents(0), c1 = M.marbleContents(1);
eq([c0.CaCO3, c0.HCl, +c0.water.toFixed(6)], [10, 7.3, 92.7], 'start: 10 g CaCO3, 7.3 g HCl, 92.7 g water');
near(c1.CaCO3, 0, 1e-12, 'all CaCO3 used'); near(c1.HCl, 0, 1e-9, 'HCl used exactly (stoichiometric)');
near(c1.CaCl2, 11.1, 1e-9, '11.1 g CaCl2'); near(c1.CO2, 4.4, 1e-9, '4.4 g CO2'); near(c1.water, 94.5, 1e-9, '94.5 g water');
for (let k = 0; k <= 100; k++) {
  const p = k / 100, c = M.marbleContents(p);
  near(M.sum(c), 110, 1e-9, 'contents always 110 g');
  Object.values(c).forEach(v => ok(v >= 0, 'no negative masses'));
  near(M.marbleReading(p, false), 260, 1e-9, 'sealed reads 260 g');
  near(M.marbleReading(p, true) + c.CO2, 260, 1e-9, 'open reading + CO2 = 260 g');
}
near(M.marbleReading(1, false) - M.marbleReading(1, true), 4.4, 1e-9, 'gap at 100% = 4.4 g');
ok(M.marbleReading(1, true) < M.marbleReading(0, true), 'open reading goes down');

// ---- step 4: magnesium ----
const m0 = M.magnesium(0), m1 = M.magnesium(1);
eq([m0.Mg, m0.solid], [2.4, 2.4], 'start 2.4 g'); near(m1.MgO, 4.0, 1e-9, '4.0 g MgO'); near(m1.O2in, 1.6, 1e-9, '1.6 g O2 taken in');
near(m0.solid + m0.O2total, 4.0, 1e-9, 'ledger line at 4.0 g');
for (let k = 0; k <= 100; k++) {
  const q = M.magnesium(k / 100);
  near(q.solid - q.O2in, 2.4, 1e-9, 'solid − O2 in = 2.4 g');
  near(q.solid + (q.O2total - q.O2in), 4.0, 1e-9, 'solid + O2 yet to react = 4.0 g');
  near(q.reading, 20 + q.solid, 1e-9, 'reading = crucible + solid');
  ok(q.solid >= 2 && q.solid + (q.O2total - q.O2in) <= 4.5, 'inside the plot range 2–4.5 g');
}
near(m1.solid - m0.solid, 1.6, 1e-9, 'gain 1.6 g');
// step 3 plot range 254–261 g covers every reading
for (let k = 0; k <= 100; k++) for (const open of [false, true]) { const r = M.marbleReading(k / 100, open); ok(r >= 254 && r <= 261, 'plot range'); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|左边的图|右边的图|left chart|right chart|left panel|right panel/i.test(v), 'no left/right figure references: ' + k);
// numbers quoted in static text match the model
for (const l of ['zh', 'en']) {
  ok(STRINGS[l].s0e.includes('150 g') && STRINGS[l].s0e.includes('10 g') && STRINGS[l].s0e.includes('100 g') && STRINGS[l].s0e.includes('7.3 g'), 's0e amounts');
  ok(STRINGS[l].s4e.includes('2.4 g') && STRINGS[l].s4e.includes('20 g'), 's4e amounts');
  ok(STRINGS[l].s2hint.includes('3, 1, 1, 2') && STRINGS[l].s2hint.includes('3') && STRINGS[l].s2e.includes('H₂O = 2 × 1 + 16 = 18'), 's2 quoted numbers');
}
eq(M.MARBLE, { flask: 150, CaCO3: 10, acid: 100, HCl: 7.3 }, 'marble set-up'); eq(M.MAGNESIUM, { crucible: 20, Mg: 2.4 }, 'magnesium set-up');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const el of Object.keys(M.AR)) ok(STRINGS.zh['el' + el] !== undefined, 'element name ' + el);
for (const id of ['p0', 'run0', 'reset0', 'betBtn', 'g1', 'play1', 'rx1hydrogen', 'rx1carbon', 'rx1methane', 'rx1marble', 'rx2hydrogen', 'rx2methane', 'coefs', 'mode3sealed', 'mode3open', 'p3', 'run3', 'reset3', 'p4', 'run4', 'reset4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css') && !html.includes('canvas-label-guard'), 'provenance placeholder, no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/reactions/mass-conservation/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS mass-conservation core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · counter-examples ${found.join(' / ')}`);
