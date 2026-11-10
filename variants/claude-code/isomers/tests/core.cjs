'use strict';
// Isomers (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const both = (key, frag) => { for (const l of ['zh', 'en']) { const f = l === 'zh' ? frag.replace(/(\d), (?=\d)/g, '$1、') : frag; ok(STRINGS[l][key].includes(f), `${l}.${key} quotes ${f}`); } };
const ORIGINAL = { zh: '同分异构体 · 同一组原子，不同的拼法', en: 'Isomers · The Same Atoms, Put Together Differently' };
const A = id => M.ALKANES.find(a => a.id === id);

// ---- step 2: skeleton counts (OEIS A000602) ----
eq([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => M.skeletons(n).length), [1, 1, 1, 2, 3, 5, 9, 18, 35, 75], 'alkane isomer counts');
both('s2hint', '1, 1, 1, 2, 3, 5, 9, 18'); both('s2hint', '35'); both('s2hint', '75'); both('formula', '1, 1, 1, 2, 3, 5, 9, 18');
for (let n = 1; n <= 8; n++) M.skeletons(n).forEach(g => {
  ok(g.adj.every(a => a.length <= 4), 'at most four C–C bonds');
  ok(g.adj.reduce((s, a) => s + a.length, 0) / 2 === n - 1, 'tree: no rings');
  eq(M.formula(g), { C: n, H: 2 * n + 2, O: 0 }, 'CnH2n+2');
});
// canonical form does not depend on vertex numbering
{ const r = M.rng(5); for (let n = 4; n <= 8; n++) M.skeletons(n).forEach(g => { for (let k = 0; k < 4; k++) {
  const perm = g.el.map((_, i) => i).sort(() => r() - 0.5), inv = []; perm.forEach((p, i) => { inv[p] = i; });
  const h = { el: g.el.slice(), adj: g.el.map((_, i) => g.adj[perm[i]].map(u => inv[u])) };
  ok(M.canon(h) === M.canon(g), 'relabelling keeps the canonical form'); } }); }
// quiz: C6H14 has 5 (option b); fb2no: 2-methylpentane = 4-methylpentane
ok(M.skeletons(6).length === 5, 'quiz C6H14 = 5');
ok(M.canon(M.alkane(5, [[2, 1]])) === M.canon(M.alkane(5, [[4, 1]])), '2- and 4-methylpentane are one molecule');
// every skeleton up to 7 has a name and boiling point on the page
for (let n = 4; n <= 7; n++) { ok(M.skeletons(n).every(g => M.named(g)), 'named ' + n); ok(M.byN(n).length === M.skeletons(n).length, 'no duplicates ' + n); }

// ---- step 0 ----
eq(M.formula(A('butane').g), M.formula(A('methylpropane').g), 'same formula'); ok(M.formulaText(M.formula(A('butane').g)) === 'C₄H₁₀', 'C4H10');
ok(M.canon(A('butane').g) !== M.canon(A('methylpropane').g), 'different structure');
ok(M.longestPath(A('butane').g).length === 4 && M.longestPath(A('methylpropane').g).length === 3, 'longest chains 4 and 3');
both('s0e', '−0.5 °C'); both('s0e', '−11.7 °C'); ok(Math.round(A('butane').bp - A('methylpropane').bp) === 11, 'tagline: 11 °C apart'); both('tagline', '11 °C');

// ---- step 1: questions are well-formed; "same" answers really are the same molecule ----
for (const n of [5, 6, 7]) { let same = 0; for (let k = 0; k < 200; k++) {
  const q = M.question(n, k); ok(q.A.g.el.length === n && q.B.g.el.length === n, 'right carbon count');
  ok(q.same === (M.canon(q.A.g) === M.canon(q.B.g)), 'truth from canonical form');
  ok(q.A.path.length >= 2 && M.leaves(q.A.g).includes(q.A.path[0]) && M.leaves(q.A.g).includes(q.A.path.at(-1)), 'drawn chain runs leaf to leaf');
  if (q.same) { same++; const look = d => { const L = d.path.length, b = d.bend < 0 ? -1 : Math.min(d.bend, L - 1 - d.bend); return JSON.stringify([d.path.slice().sort((x, y) => x - y), b]); };
    ok(look(q.A) !== look(q.B), '"same" pair is drawn two visibly different ways'); } }
  ok(same > 60 && same < 140, 'about half the questions are "same" for C' + n); }
ok(M.question(6, 3).same === M.question(6, 3).same && JSON.stringify(M.question(6, 3).A.path) === JSON.stringify(M.question(6, 3).A.path), 'questions are reproducible');

// ---- step 3: Wiener index and the boiling-point trend ----
eq(M.byN(5).map(a => a.W), [20, 18, 16], 'pentane W 20 → 16'); both('s3hint', '20'); both('s3hint', '16');
eq(M.byN(5).map(a => a.bp), [36.1, 27.7, 9.5], 'pentane bp'); both('s3hint', '36.1 °C'); both('s3hint', '9.5 °C');
eq(M.trend(5), { agree: 3, total: 3, against: [] }, 'C5 all follow');
{ const t6 = M.trend(6); ok(t6.agree === 9 && t6.total === 10 && t6.against.length === 1 && t6.against[0].join() === 'm2pentane,m3pentane', 'C6: one exception'); }
ok(A('m3pentane').W === 31 && A('m2pentane').W === 32 && A('m3pentane').bp > A('m2pentane').bp, '3-methylpentane exception'); both('s3hint', 'W = 31'); both('s3hint', 'W = 32');
{ const t7 = M.trend(7); ok(t7.total === 34 && t7.total - t7.agree === 8, 'C7: 8 of 34 against'); both('s3hint', '34'); }
// Wiener index of a straight chain: (n³ − n)/6
for (let n = 2; n <= 10; n++) ok(M.wiener(M.chain(n)) === (n ** 3 - n) / 6, 'chain Wiener');

// ---- step 4: functional-group isomers ----
eq(M.FUNCTIONAL.map(f => M.formulaText(M.formula(f.g))), ['C₂H₆O', 'C₂H₆O', 'C₃H₈O', 'C₃H₈O', 'C₃H₈O'], 'formulas counted from structure');
eq(M.FUNCTIONAL.map(f => M.ohCount(f.g)), [1, 0, 1, 1, 0], 'O–H only in alcohols');
M.FUNCTIONAL.forEach(f => ok((f.kind === 'alcohol') === (M.ohCount(f.g) > 0), 'kind matches O–H'));
near(78.4 - (-24.0), 100, 3, 'ethanol vs DME ≈ 100 °C'); both('s4hint', '100 °C');
ok(M.FUNCTIONAL.find(f => f.id === 'propanol2').bp < M.FUNCTIONAL.find(f => f.id === 'propanol1').bp, '2-propanol lower');
ok(Math.min(97.2, 82.3) > 7.4, 'both alcohols above the ether');

// ---- step 5: torsion ----
near(M.torsion('single', 0), 19, 0.01, 'syn 19'); near(M.torsion('single', 60), 3.8, 0.01, 'gauche 3.8'); near(M.torsion('single', 180), 0, 1e-9, 'anti 0');
near(M.torsion('double', 0) - M.torsion('double', 180), 4, 1e-9, 'cis 4 above trans'); near(M.torsion('double', 90), 267, 0.01, '267 at 90°');
let maxS = 0, maxD = 0; for (let d = 0; d <= 360; d++) { maxS = Math.max(maxS, M.torsion('single', d)); maxD = Math.max(maxD, M.torsion('double', d)); }
near(maxS, 19, 0.01, 'single peak 19'); ok(maxS / M.RT < 10, 'a few times RT'); ok(maxD / M.RT > 100, 'over a hundred times RT');
both('s5hint', '19 kJ/mol'); both('s5hint', '267 kJ/mol'); near(M.RT, 2.48, 0.005, 'RT at 25 °C');
for (let d = 0; d <= 360; d += 5) { ok(M.torsion('single', d) >= -1e-9 && M.torsion('single', d) <= 20, 'single within 0–20 panel'); ok(M.torsion('double', d) >= -1e-9 && M.torsion('double', d) <= 300, 'double within 0–300 panel'); }

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
for (const k of ['r0C', 'r0H', 'r0L', 'r1right', 'r1wrong', 'fb2ok', 'fb2no', 'stS', 'stCis', 'stTrans', 'stMid', 'bondS', 'bondD', 'r2one', 'r2more']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const a of M.ALKANES) ok(STRINGS.zh['iso_' + a.id] && STRINGS.en['iso_' + a.id], 'name ' + a.id);
for (const f of M.FUNCTIONAL) ok(STRINGS.zh['fn_' + f.id] && STRINGS.en['fn_' + f.id] && STRINGS.zh['kind_' + f.kind], 'name ' + f.id);
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
ok(fs.existsSync(path.join(dir, '../../../chemistry/matter/isomers/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS isomers core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
