'use strict';
// Equation-balancing (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const both = (key, frag) => { for (const l of ['zh', 'en']) { const f = l === 'zh' ? frag.replace(/(\d), /g, '$1、') : frag; ok(STRINGS[l][key].includes(f), `${l}.${key} quotes ${f}`); } };
const ORIGINAL = { zh: '化学方程式配平', en: 'Balancing Chemical Equations' };

// ---- parser ----
eq(M.parse('H2O'), { H: 2, O: 1 }, 'H2O'); eq(M.parse('Ca(OH)2'), { Ca: 1, O: 2, H: 2 }, 'Ca(OH)2');
eq(M.parse('Al2(SO4)3'), { Al: 2, S: 3, O: 12 }, 'parentheses'); eq(M.parse('KClO3'), { K: 1, Cl: 1, O: 3 }, 'two-letter symbols');
ok(M.pretty('C3H8') === 'C₃H₈', 'subscripts');

// ---- every reaction has exactly one simplest solution within 1..12, and it is what the page says ----
const ANSWERS = { water: [2, 1, 2], peroxide: [1, 1, 1], methane: [1, 2, 1, 2], ethane: [2, 7, 4, 6], propane: [1, 5, 3, 4],
  ammonia: [1, 3, 2], magnesium: [2, 1, 2], chlorate: [2, 2, 3], iron: [1, 3, 2, 3], lime: [1, 2, 1, 2], aluminium: [2, 6, 2, 3] };
for (const rx in M.REACTIONS) {
  eq(M.solve(rx), [ANSWERS[rx]], 'unique simplest solution for ' + rx);
  // every balanced set up to 12 is a whole multiple of the simplest one
  M.allBalanced(rx).forEach(c => { const k = c[0] / ANSWERS[rx][0]; ok(Number.isInteger(k) && c.every((v, i) => v === k * ANSWERS[rx][i]), 'multiple of simplest ' + rx); });
  // the hint, followed repeatedly from all-ones, always names an unbalanced element
  const c = M.species(rx).map(() => 1); let guard = 0, h;
  while ((h = M.hint(rx, c)) && guard++ < 30) {
    const tl = M.tally(rx, c).find(q => q.el === h.el); ok(!tl.ok, 'hint names an unbalanced element');
    if (h.idx >= 0) { c[h.idx] = h.to; ok(M.tally(rx, c).find(q => q.el === h.el).ok, 'the suggested change levels that scale'); } else break;
  }
}
// step 0 opening state: H level, O tipped left; the two moves in s0hint
{ const t0 = M.tally('water', [1, 1, 1]); ok(t0[0].ok && t0[0].L === 2 && t0[1].L === 2 && t0[1].R === 1, 'H 2:2, O 2:1');
  const t1 = M.tally('water', [1, 1, 2]); ok(t1[1].ok && t1[0].L === 2 && t1[0].R === 4, 'after 2H2O: O level, H 2:4');
  ok(M.balanced('water', [2, 1, 2]), 'then 2H2 balances'); }
both('s0hint', '2'); 
// step 1: the subscript change balances the counts, the coefficient change does not yet
ok(M.balanced('peroxide', [1, 1, 1]) && !M.balanced('water', [1, 1, 2]), 'r1 texts');
ok(M.parse('H2O2').O === 2 && M.parse('H2O').O === 1, 'different substance');
// quiz: Fe + O2 -> Fe2O3 is 4, 3, 2
{ const r = { L: ['Fe', 'O2'], R: ['Fe2O3'] }; M.REACTIONS.rust = r; eq(M.solve('rust'), [[4, 3, 2]], 'quiz answer 4Fe + 3O2 → 2Fe2O3'); delete M.REACTIONS.rust; }
both('fb1ok', '4Fe + 3O₂ → 2Fe₂O₃');
// step 2: methane order C, H, O and the walkthrough in s2hint
eq(M.order('methane'), ['C', 'H', 'O'], 'methane working order');
{ const t = M.tally('methane', [1, 1, 1, 2]); ok(t[0].ok && t[1].ok && t[2].R === 4, 'after 2H2O: right side has 2 + 2 = 4 O'); }
// step 3: ethane with halves
{ const c = [1, 3.5, 2, 3]; ok(M.balanced('ethane', c) && M.hasHalf(c), '3.5 O2 levels oxygen');
  ok(M.tally('ethane', [1, 1, 2, 3])[2].R === 7, '2 × 2 + 3 = 7 O'); eq(c.map(v => v * 2), [2, 7, 4, 6], 'doubling'); ok(M.simplest([2, 7, 4, 6]), 'simplest'); }
// doubling never breaks a level scale (any reaction, any balanced set)
for (const rx in M.REACTIONS) M.allBalanced(rx, 6).forEach(c => ok(M.balanced(rx, c.map(v => v * 2)), 'doubling keeps balance'));
// step 4: equations and solving order, "only two sets"
eq(M.equations('propane').map(e => e.text), ['3a = c', '8a = 2d', '2b = 2c + d'], 'propane equations');
eq(M.allBalanced('propane'), [[1, 5, 3, 4], [2, 10, 6, 8]], 'only 1,5,3,4 and 2,10,6,8 up to 12');
ok(M.gcdAll([2, 10, 6, 8]) === 2, 'common factor 2');
for (const k of ['solveC', 'solveD', 'solveB']) for (const l of ['zh', 'en']) ok(/= \d/.test(STRINGS[l][k]), 'solve stage text');
both('solveC', 'c = 3'); both('solveD', 'd = 4'); both('solveB', 'b = 5'); both('s4hint', '2, 10, 6, 8'); both('s4hint', '1, 5, 3, 4');
// step 5: practice set, hint for chlorate needs the lcm 6; s5hint numbers
eq(M.PRACTICE.length, 6, 'six practice reactions');
{ const h = M.hint('chlorate', [1, 1, 1]); ok(h.el === 'O' && h.L === 3 && h.R === 2 && h.idx === -1 && h.lcm === 6, 'chlorate: 3 vs 2, aim for 6'); }
{ const t = M.tally('aluminium', [1, 1, 1, 1]); ok(t.find(q => q.el === 'Cl').L === 1 && t.find(q => q.el === 'Cl').R === 3 && t.find(q => q.el === 'H').L === 1 && t.find(q => q.el === 'H').R === 2, 'Al + HCl: Cl 1 vs 3, H 1 vs 2'); }
// scale count fits the canvas: at most 4 elements per reaction
for (const rx in M.REACTIONS) ok(M.elements(rx).length <= 4, 'at most four scales');
ok(!M.simplest([2, 2, 4]) && M.simplest([1, 3, 2]) && !M.simplest([1, 1.5, 1]), 'simplest check');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => [...new Set(s.match(/\{[a-zA-Z0-9]+\}/g) || [])].sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set([]);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5') && STRINGS[l].foot.includes(ORIGINAL[l]), 'footer names model and original');
for (const l of ['zh', 'en']) for (const [k, v] of Object.entries(STRINGS[l])) ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(v), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['r1coef', 'r1sub', 'fb1ok', 'fb1no', 'solveA', 'solveC', 'solveD', 'solveB']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const rx of M.PRACTICE) ok(STRINGS.zh['rx_' + rx] && STRINGS.en['rx_' + rx], 'practice name ' + rx);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder');
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../chemistry/reactions/equation-balancing/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS equation-balancing core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
