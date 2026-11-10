'use strict';
// DNA replication & translation (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };

// ---- step 0: pairing and hydrogen bonds ----
eq(M.complement(M.DEFAULT_TOP), 'TACGCATGGATC', 'default complement');
eq(M.hbonds(M.DEFAULT_TOP), 30, 'default: 6 A–T × 2 + 6 G–C × 3'); eq(M.gcCount(M.DEFAULT_TOP), 6, 'default GC');
for (let seed = 1; seed < 400; seed++) {
  const s = M.randomStrand(seed);
  ok(s.length === 12 && /^[ATGC]+$/.test(s), 'random strand');
  ok(M.complement(M.complement(s)) === s, 'complement is an involution (one strand fixes the other)');
  ok(M.hbonds(s) === 24 + M.gcCount(s), 'bonds = 2×12 + GC (all points on one line)');
  ok(M.hbonds(M.complement(s)) === M.hbonds(s), 'pairs counted the same from either strand');
}
ok(M.BASES.every(b => M.cycleBase(M.cycleBase(M.cycleBase(M.cycleBase(b)))) === b), 'A→T→G→C cycle');
ok(M.cycleBase('A') === 'T' && M.cycleBase('T') === 'G' && M.cycleBase('G') === 'C' && M.cycleBase('C') === 'A', 'cycle order as labelled');

// ---- step 1: hypotheses vs bands ----
const firstMismatch = h => { for (let g = 0; g <= 4; g++) if (!M.sameBands(M.bands(h, g), M.observed(g))) return g; return null; };
eq(firstMismatch('semi'), null, 'semi-conservative matches every generation');
eq(firstMismatch('cons'), 1, 'conservative fails at g = 1 (two bands)');
eq(firstMismatch('disp'), 2, 'dispersive fails at g = 2');
eq(M.bands('cons', 1).length, 2, 'conservative g=1 two bands');
eq(M.bands('disp', 1).map(b => b.f), [0.5], 'dispersive g=1 one middle band');
eq(M.bands('disp', 2).map(b => b.f), [0.25], 'dispersive g=2 band at 25% heavy');
eq(M.observed(2).map(b => [b.f, b.share]), [[0.5, 0.5], [0, 0.5]], 'measured g=2: middle + light, equal');
for (let g = 1; g <= 4; g++) {
  const mid = M.observed(g).find(b => b.f === 0.5);
  ok(mid.count === 2 && Math.abs(mid.share - 2 / Math.pow(2, g)) < 1e-12, 'middle band always 2 molecules, share 2/2^g');
  // conservation: heavy material is 2 strands in every hypothesis
  for (const h of ['semi', 'cons', 'disp']) { const heavy = M.generation(h, g).reduce((s, m) => s + m[0] + m[1], 0); ok(Math.abs(heavy - 2) < 1e-9, 'heavy strands conserved ' + h); }
  // semi lineage: hybrids are i=0 and i=n−1, whose parents (i>>1) are hybrids too (the tree draws parent i>>1)
  const gen = M.generation('semi', g), par = M.generation('semi', g - 1);
  gen.forEach((m, i) => { if (m[0] + m[1] > 0) ok(par[i >> 1][0] + par[i >> 1][1] > 0, 'heavy strand descends from a heavy parent'); });
}
// quiz: after 3 rounds, 2 of 8 molecules carry an original strand
eq(M.generation('semi', 3).filter(m => m[0] + m[1] > 0).length, 2, 'quiz answer 2');
eq(M.generation('semi', 3).length, 8, 'quiz 8 molecules');
// stripe drawing for dispersive uses 16 segments with every (1/f)-th heavy: exact for g ≤ 4
for (let g = 1; g <= 4; g++) { const f = 1 / Math.pow(2, g), every = Math.round(1 / f); let h = 0; for (let i = 0; i < 16; i++) if (i % every === 0) h++; ok(h / 16 === f, 'stripe share = heavy fraction'); }

// ---- step 2: fork ----
for (let p = 0; p <= 3000; p += 50) for (let L = 100; L <= 2000; L += 100) {
  const f = M.fork(p, L);
  ok(f.leading === p, 'leading strand follows the fork');
  ok(f.laggingDone + f.gap === p && f.gap >= 0 && f.gap < L, 'lagging done + bare gap = opened, gap < fragment');
  ok(f.primers === f.fragments + 1, 'primers = fragments + 1 (leading)');
}
const d = M.fork(1800, 500); eq([d.fragments, d.gap, d.primers], [3, 300, 4], 'default readout');
ok(M.fork(3000, 200).primers > 3 * M.fork(3000, 1000).primers, 'shorter fragments multiply primers (16 vs 4)');
eq(Math.round(M.ecoliMinutes()), 38, 'E. coli ≈ 38 min');

// ---- step 3: transcription ----
const T = M.templateOf(M.GENE), R = M.transcribe(T);
eq(R, M.GENE.replace(/T/g, 'U'), 'mRNA = coding strand with T→U');
ok(!/T/.test(R) && R.length === 30, 'RNA has no T');
for (let n = 0; n <= 30; n++) ok(R.slice(0, n) === M.GENE.slice(0, n).replace(/T/g, 'U'), 'prefix matches at every slider value');

// ---- step 4: translation ----
eq(M.ALL_CODONS.length, 64, '64 codons');
const deg = M.degeneracy();
eq(deg['*'], 3, '3 stops'); eq(Object.keys(deg).length - 1, 20, '20 amino acids'); eq(deg.L, 6, 'Leu 6'); eq(deg.M, 1, 'Met 1'); eq(deg.W, 1, 'Trp 1');
['UAA', 'UAG', 'UGA'].forEach(c => ok(M.aaOf(c) === '*', 'stop ' + c)); ok(M.aaOf('AUG') === 'M', 'AUG = Met');
// spot checks against the standard table
[['UUU', 'F'], ['GCU', 'A'], ['UGG', 'W'], ['AAA', 'K'], ['GAG', 'E'], ['UUC', 'F'], ['UGU', 'C'], ['CAG', 'Q'], ['GGA', 'G'], ['AGA', 'R'], ['AGU', 'S'], ['CUA', 'L'], ['AUA', 'I']].forEach(([c, a]) => ok(M.aaOf(c) === a, c));
const tr0 = M.translate(R, 0);
eq(tr0.length, 10, 'frame 0: 10 codons incl. stop'); eq(tr0[9].codon, 'TAA', 'UAA stops'); eq(M.protein(M.GENE), 'MAWKEFCQG', 'protein');
eq(tr0.slice(0, 4).map(x => M.THREE[x.aa]).join('–'), 'Met–Ala–Trp–Lys', 'default k=4 readout');
for (const f of [1, 2]) {
  const tr = M.translate(R, f);
  ok(tr.every(x => x.aa !== '*'), 'shifted frame meets no stop (as the hint says) f=' + f);
  const same = tr.filter((x, i) => tr0[i] && x.aa === tr0[i].aa).length; ok(same <= 1, 'nearly every amino acid changes');
}
ok(M.translate(R, 1).length <= 10 && M.translate(R, 2).length <= 10, 'slider max 10 covers every frame');

// ---- step 5: mutations (hint examples) ----
const cls = (pos1, kind, b) => M.classify(M.GENE, M.mutate(M.GENE, pos1 - 1, kind, b));
['A', 'G', 'C'].forEach(b => eq(cls(6, 'sub', b).cls, 'silent', 'GCT 3rd position → still Ala ' + b));
const m7 = cls(7, 'sub', 'C'); eq(m7.cls, 'missense'); eq(m7.p1[2], 'R', 'TGG→CGG = Arg');
const n9 = cls(9, 'sub', 'A'); eq(n9.cls, 'nonsense'); eq(n9.p1.length, 2, 'TGA truncates to 2');
for (let p = 1; p <= 30; p++) {
  ok(cls(p, 'del').cls === 'frameshift' && cls(p, 'ins', 'A').cls === 'frameshift', 'single indel = frameshift');
  for (const b of M.BASES) if (b !== M.GENE[p - 1]) ok(['silent', 'missense', 'nonsense', 'stoploss'].includes(cls(p, 'sub', b).cls), 'substitution class');
}
ok(cls(30, 'sub', 'C').cls === 'stoploss', 'TAA→TAC loses the stop');
const tal = M.substitutionTally(M.GENE);
eq(tal.map(r => r.total), [27, 27, 27], '27 per position'); eq(tal.map(r => r.silent), [0, 0, 11], 'silent counts quoted in s5stat');
tal.forEach(r => ok(r.silent + r.missense + r.nonsense === r.total, 'tally adds up'));
// whole code: a second-position change is never synonymous for a sense codon
for (const c of M.ALL_CODONS) { if (M.aaOf(c) === '*') continue; for (const b of 'TCAG') if (b !== c[1]) ok(M.aaOf(c[0] + b + c[2]) !== M.aaOf(c), '2nd position never silent ' + c); }

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
eq(zk, ek, 'zh/en key sets match');
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['bandItem', 'c5rowDNA', 's3lgRNA']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left (chart|plot|panel)|right (chart|plot|panel)/i.test(STRINGS[l][k]), 'no left/right figure references ' + k);
ok(STRINGS.zh.s2hint.includes('{min}') && STRINGS.zh.s4hint.includes('{leu}'), 'hint numbers come from the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/data-i18n="([A-Za-z0-9_]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app html key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'(?!\s*\+)/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const c of ['none', 'silent', 'missense', 'nonsense', 'frameshift', 'stoploss', 'inframe']) ok(STRINGS.zh['cls_' + c] && STRINGS.en['cls_' + c], 'class label ' + c);
for (const id of ['rand0', 'reset0', 'hSemi', 'hCons', 'hDisp', 'g1', 'p2', 'L2', 'play2', 'n3', 'all3', 'clear3', 'frame0', 'frame1', 'frame2', 'k4', 'pos5', 'subA', 'subT', 'subG', 'subC', 'del5', 'ins5', 'reset5', 'checkQuiz']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../biology/cells/dna-replication/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS dna-replication core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
