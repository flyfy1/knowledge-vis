'use strict';
// DNA replication & translation lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.DNA_MODEL) and node tests (module.exports).
(function (root) {

const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
const BASES = ['A', 'T', 'G', 'C'];
const HB = { A: 2, T: 2, G: 3, C: 3 };

/* ---------- step 0: base pairing ---------- */
const DEFAULT_TOP = 'ATGCGTACCTAG';
const complement = s => s.split('').map(b => COMP[b]).join('');
const hbonds = s => s.split('').reduce((n, b) => n + HB[b], 0);
const gcCount = s => s.split('').filter(b => b === 'G' || b === 'C').length;
const cycleBase = b => BASES[(BASES.indexOf(b) + 1) % 4];
// deterministic pseudo-random strand (mulberry32), so "another strand" is reproducible
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function randomStrand(seed, n = 12) { const r = mulberry32(seed); let s = ''; for (let i = 0; i < n; i++) s += BASES[Math.floor(r() * 4)]; return s; }

/* ---------- step 1: three replication hypotheses vs density bands ---------- */
// Each molecule = two strands; each strand is described by its heavy (¹⁵N) fraction.
// Returns the molecules of generation g (g = 0 is the all-heavy parent).
function generation(hyp, g) {
  const n = Math.pow(2, g), mols = [];
  for (let i = 0; i < n; i++) {
    if (hyp === 'semi') {
      // the two original heavy strands end up in two different molecules, each paired with a new light strand
      mols.push(g === 0 ? [1, 1] : (i === 0 || i === n - 1 ? (i === 0 ? [1, 0] : [0, 1]) : [0, 0]));
    } else if (hyp === 'cons') {
      mols.push(i === 0 ? [1, 1] : [0, 0]);
    } else { // dispersive: every strand is a patchwork; heavy material is shared out evenly
      mols.push([1 / n, 1 / n]);
    }
  }
  return mols;
}
// Density bands: group molecules by heavy fraction (mean of its two strands).
function bands(hyp, g) {
  const map = new Map();
  generation(hyp, g).forEach(m => { const f = Math.round((m[0] + m[1]) / 2 * 1e6) / 1e6; map.set(f, (map.get(f) || 0) + 1); });
  const total = Math.pow(2, g);
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([f, c]) => ({ f, count: c, share: c / total }));
}
// Meselson & Stahl (1958) observed: gen 1 one hybrid band; gen ≥ 2 hybrid + light, hybrid share 2/2^g.
const observed = g => bands('semi', g);
const sameBands = (a, b) => a.length === b.length && a.every((x, i) => Math.abs(x.f - b[i].f) < 1e-9 && Math.abs(x.share - b[i].share) < 1e-9);

/* ---------- step 2: the replication fork ---------- */
const FORK = { maxProgress: 3000, speed: 1000, ecoliGenome: 4.6e6 };
function fork(progress, fragLen) {
  const fragments = Math.floor(progress / fragLen);
  return {
    leading: progress, fragments, laggingDone: fragments * fragLen, gap: progress - fragments * fragLen,
    primers: 1 + fragments, seconds: progress / FORK.speed,
    frags: Array.from({ length: fragments }, (_, i) => ({ from: i * fragLen, to: (i + 1) * fragLen }))
  };
}
// Two forks run outward from one origin on the circular E. coli chromosome.
const ecoliMinutes = (speed = FORK.speed) => FORK.ecoliGenome / (2 * speed) / 60;

/* ---------- steps 3–5: one short gene ---------- */
// Coding strand 5′→3′ of a made-up 10-codon gene (start ATG … stop TAA).
const GENE = 'ATGGCTTGGAAAGAGTTCTGTCAGGGATAA';
const templateOf = coding => complement(coding);           // written under the coding strand, read 3′→5′ left to right
const transcribe = template => complement(template).replace(/T/g, 'U'); // RNA pairs with the template; U instead of T
// Standard genetic code, table order T C A G for 1st/2nd/3rd base.
const ORDER = 'TCAG';
const AAS = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const THREE = { F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', C: 'Cys', W: 'Trp', P: 'Pro', H: 'His', Q: 'Gln', R: 'Arg', I: 'Ile', M: 'Met', T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp', E: 'Glu', G: 'Gly', '*': 'Stop' };
function aaOf(codon) { // accepts DNA or RNA letters
  const c = codon.replace(/U/g, 'T');
  return AAS[ORDER.indexOf(c[0]) * 16 + ORDER.indexOf(c[1]) * 4 + ORDER.indexOf(c[2])];
}
const ALL_CODONS = [];
for (const a of ORDER) for (const b of ORDER) for (const c of ORDER) ALL_CODONS.push(a + b + c);
// codons per amino acid (degeneracy)
function degeneracy() { const d = {}; ALL_CODONS.forEach(c => { const a = aaOf(c); d[a] = (d[a] || 0) + 1; }); return d; }
// Read codons from `start`; stop at the first stop codon (included as '*') or when bases run out.
function translate(seq, start = 0, untilStop = true) {
  const s = seq.replace(/U/g, 'T'), out = [];
  for (let i = start; i + 3 <= s.length; i += 3) {
    const a = aaOf(s.slice(i, i + 3)); out.push({ at: i, codon: s.slice(i, i + 3), aa: a });
    if (a === '*' && untilStop) break;
  }
  return out;
}
const protein = seq => translate(seq).filter(x => x.aa !== '*').map(x => x.aa).join('');
const hasStop = seq => translate(seq).some(x => x.aa === '*');

/* ---------- step 5: mutations ---------- */
function mutate(seq, pos, kind, base) {
  if (kind === 'sub') return seq.slice(0, pos) + base + seq.slice(pos + 1);
  if (kind === 'del') return seq.slice(0, pos) + seq.slice(pos + 1);
  if (kind === 'ins') return seq.slice(0, pos) + base + seq.slice(pos);
  return seq;
}
// Classify by comparing what the ribosome actually makes.
function classify(orig, mut) {
  if (mut === orig) return { cls: 'none' };
  const p0 = protein(orig), p1 = protein(mut), stop1 = hasStop(mut);
  const lenDiff = mut.length - orig.length;
  if (lenDiff % 3 !== 0) return { cls: 'frameshift', p0, p1, stop: stop1 };
  if (!stop1) return { cls: 'stoploss', p0, p1, stop: false };
  if (lenDiff !== 0) return { cls: 'inframe', p0, p1, stop: true };
  if (p1 === p0) return { cls: 'silent', p0, p1, stop: true };
  if (p1.length < p0.length) return { cls: 'nonsense', p0, p1, stop: true };
  return { cls: 'missense', p0, p1, stop: true };
}
// Every single-base substitution in the sense codons of `seq`, tallied by codon position (1st/2nd/3rd).
function substitutionTally(seq) {
  const nSense = translate(seq).filter(x => x.aa !== '*').length;
  const tally = [0, 1, 2].map(() => ({ silent: 0, missense: 0, nonsense: 0, total: 0 }));
  for (let i = 0; i < nSense * 3; i++) for (const b of BASES) {
    if (b === seq[i]) continue;
    const c = classify(seq, mutate(seq, i, 'sub', b)).cls, row = tally[i % 3];
    row[c]++; row.total++;
  }
  return tally;
}

const api = { COMP, BASES, HB, DEFAULT_TOP, complement, hbonds, gcCount, cycleBase, randomStrand, generation, bands, observed, sameBands,
  FORK, fork, ecoliMinutes, GENE, templateOf, transcribe, ORDER, AAS, THREE, aaOf, ALL_CODONS, degeneracy, translate, protein, hasStop,
  mutate, classify, substitutionTally };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.DNA_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
