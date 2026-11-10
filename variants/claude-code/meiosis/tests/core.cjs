'use strict';
// Meiosis (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const Z = STRINGS.zh, E = STRINGS.en;

// ---- step 0 ----
ok(M.SPECIES.human === 46 && M.SPECIES.pea === 14 && M.SPECIES.fly === 8, 'species 2n');
for (const k of Object.keys(M.SPECIES)) for (let g = 0; g <= 6; g++) {
  ok(M.zygoteCount(M.SPECIES[k], g, true) === M.SPECIES[k], 'halved stays constant');
  ok(M.zygoteCount(M.SPECIES[k], g, false) === M.SPECIES[k] * 2 ** g, 'unhalved doubles');
}
ok(M.zygoteCount(46, 6, false) === 2944, '46 × 64');

// ---- step 1: counts per cell, and the drawn chromatids match them ----
const n = 3;
const mei = [...Array(M.STAGES.meiosis).keys()].map(s => M.counts('meiosis', s, n));
const mit = [...Array(M.STAGES.mitosis).keys()].map(s => M.counts('mitosis', s, n));
ok(mei.map(c => c.chr).join() === '6,6,6,6,6,3,3,3', 'meiosis chromosomes: halves only at stage 5');
ok(mei.map(c => c.dna).join() === '6,12,12,12,12,6,6,3', 'meiosis DNA: doubles at 1, halves at 5 and 7');
ok(mit.map(c => c.chr).join() === '6,6,6,6,12,6', 'mitosis chromosomes: doubles at anaphase then back to 6');
ok(mit.map(c => c.dna).join() === '6,12,12,12,12,6', 'mitosis DNA');
ok(mei[7].cells === 4 && mit[5].cells === 2, 'cell counts');
// conservation: total DNA molecules across cells after S = 4n
ok(mei.slice(1).every(c => c.cells * c.dna === 12) && mit.slice(1).every(c => c.cells * c.dna === 12), 'total DNA conserved after S');
const r = M.rng(5);
for (let trial = 0; trial < 200; trial++) {
  const orient = [r() < .5, r() < .5, r() < .5], cross = [0.25 + r() * .5, 0.25 + r() * .5, 0.25 + r() * .5];
  const m = M.meiosis(3, orient, cross);
  ok(m.gametes.length === 4 && m.gametes.every(g => g.length === 3 && g.map(c => c.pair).join() === '0,1,2'), 'each gamete gets one of each pair');
  ok(m.cells.every(c => c.length === 3 && c.every(ch => ch.length === 2)), 'after division I: n replicated chromosomes');
  ok(m.gametes.flat().filter(M.isRecombinant).length === 6, 'one crossover per pair → 2 recombinant chromatids per pair');
  // every chromatid conserves length: segments tile [0,1]
  m.gametes.flat().forEach(ch => { let x = 0; ch.segs.forEach(s => { near(s.a, x, 1e-12, 'segment tiling'); x = s.b; }); near(x, 1, 1e-12, 'segment end'); });
  // material conservation: per pair, maternal and paternal lengths both sum to 2 across the 4 gametes
  for (let i = 0; i < 3; i++) for (const o of ['m', 'p']) near(m.gametes.reduce((s, g) => s + g[i].segs.filter(q => q.o === o).reduce((t, q) => t + q.b - q.a, 0), 0), 2, 1e-9, 'material conserved');
}

// ---- step 2 ----
for (let k = 1; k <= 4; k++) ok(M.nTypes(k) === 2 ** k, '2^n');
ok(M.nTypes(23) === 8388608, 'human 2^23 = 8,388,608');
for (let k = 1; k <= 4; k++) for (let mask = 0; mask < 2 ** k; mask++) {
  const orient = [...Array(k).keys()].map(i => !!((mask >> i) & 1)), tp = M.assortTypes(k, orient);
  ok(new Set(tp).size === 2 && tp[0] === mask && (tp[0] ^ tp[2]) === 2 ** k - 1, 'one meiosis: 2 complementary types, 2 each');
}
{
  const tally = M.simulateAssort(3, 51, 42); // 1 + 50 meioses, as after the first "Run 50 more"
  ok(tally.reduce((a, b) => a + b, 0) === 204, '4 gametes per meiosis');
  // with 51 meioses, missing a type has probability 8·(3/4)^51 < 1e-5
  ok(8 * Math.pow(0.75, 51) < 1e-5, 's2hint: all 8 types appear after 50 more (prob)');
  const big = M.simulateAssort(3, 20000, 1); big.forEach(c => near(c / 80000, 1 / 8, 0.01, 'uniform types'));
}

// ---- step 3 ----
ok(M.twoGeneGametes(0.05, 0.45, 0.3).sort().join() === 'AB,Ab,aB,ab', 'between → 2 recombinants');
ok(M.twoGeneGametes(0.05, 0.45, 0.01).sort().join() === 'AB,AB,ab,ab', 'before A → parental (both genes swap)');
ok(M.twoGeneGametes(0.05, 0.45, 0.8).sort().join() === 'AB,AB,ab,ab', 'beyond B → parental');
for (let d = 0.05; d <= 0.9001; d += 0.05) {
  near(M.expectedRF(0.05, 0.05 + d), d / 2, 1e-12, 'theory d/2');
  const s = M.simulateRF(0.05, 0.05 + d, 20000, Math.round(d * 100));
  near(s.rf, d / 2, 0.012, 'simulated RF ≈ d/2 at d=' + d.toFixed(2));
  ok(s.tally.Ab + s.tally.aB <= s.total / 2 && Math.abs(s.tally.AB - s.tally.ab) === 0 && s.tally.Ab === s.tally.aB, 'symmetry of the four types');
}
near(100 * M.expectedRF(0, 0.9), 45, 1e-9, 's3hint: max 45%');
ok(0.05 + 0.9 <= 1, 'B stays on the chromosome at max distance');

// ---- step 4 ----
near(M.pIdentical(23), Math.pow(2, -46), 0, '1/2^46');
ok(Math.round(1 / M.pIdentical(23)) === 70368744177664, '2^46 = 70,368,744,177,664');
near(M.sharedSD(23), Math.sqrt(1 / (8 * 23)), 1e-15, 'sd formula');
{
  const sb = M.simulateSiblings(23, 20000, 9); let m = 0, m2 = 0;
  sb.hist.forEach((c, k) => { m += c * k / 46; m2 += c * (k / 46) ** 2; });
  m /= 20000; m2 /= 20000;
  near(m, 0.5, 0.005, 'mean share 50%'); near(Math.sqrt(m2 - m * m), M.sharedSD(23), 0.003, 'sd ≈ theory');
  const s2 = M.simulateSiblings(2, 20000, 10); near(s2.hist[4] / 20000, 1 / 16, 0.01, 'n = 2: all 4 match 1/16 (s4hint: not rare)');
}

// ---- step 5 ----
const nd = { none: M.nondisjunction('none'), I: M.nondisjunction('I'), II: M.nondisjunction('II') };
ok(nd.none.gametes.join() === '23,23,23,23' && nd.none.normal === 4, 'normal');
ok(nd.I.gametes.join() === '24,24,22,22' && nd.I.normal === 0 && nd.I.zygotes.join() === '47,47,45,45', 'MI');
ok(nd.II.gametes.join() === '24,22,23,23' && nd.II.normal === 2 && nd.II.zygotes.join() === '47,45,46,46', 'MII');
ok(nd.I.afterIChr.join() === '24,22' && nd.II.afterIChr.join() === '23,23', 'after division I');
for (const k of Object.keys(nd)) ok(nd[k].copies.reduce((a, b) => a + b, 0) === 4, 'chromatids of the pair conserved');

// ---- bilingual parity ----
const zk = Object.keys(Z).sort(), ek = Object.keys(E).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(Z[k]), ph(E[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['cnt']);
for (const k of zk) ok(NEUTRAL.has(k) || Z[k] !== E[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) ok(!/左图|右图|left (chart|panel|picture)|right (chart|panel|picture)/i.test(v), 'no left/right figure references');

// ---- keys, controls, links ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(Z[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) ok(Z[m[1]] !== undefined, 'app key ' + m[1]);
for (const md of ['meiosis', 'mitosis']) for (let s = 0; s < M.STAGES[md]; s++) ok(Z[`st_${md}_${s}`] && E[`st_${md}_${s}`], 'stage name ' + md + s);
for (const id of ['g0', 'spHuman', 'spPea', 'spFly', 'modeMeiosis', 'modeMitosis', 'st1', 'play1', 'reroll1', 'n2', 'once2', 'many2', 'clear2', 'd3', 'once3', 'many3', 'clear3', 'n4', 'once4', 'many4', 'clear4', 'ndNone', 'ndI', 'ndII', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/cells/meiosis/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS meiosis core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
