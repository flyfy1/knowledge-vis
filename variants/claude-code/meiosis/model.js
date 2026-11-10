'use strict';
// Meiosis lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.MEIOSIS_MODEL) and node tests (module.exports).
(function (root) {
  // Seeded generator (mulberry32) so every "run N times" button is reproducible in tests.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // ---- step 0: why halve ----
  const SPECIES = { human: 46, pea: 14, fly: 8 };
  // Chromosomes in a fertilised egg after g generations, if gametes are halved (2n) or not (2n·2^g).
  const zygoteCount = (twoN, g, halve) => (halve ? twoN : twoN * Math.pow(2, g));

  // ---- step 1: the stages, counted per cell ----
  // Meiosis: G1, after S, prophase I, metaphase I, anaphase I, after division I, metaphase II, gametes.
  // Mitosis: G1, after S, prophase, metaphase, anaphase, two daughter cells.
  const STAGES = { meiosis: 8, mitosis: 6 };
  // chr = chromosomes per cell (count centromeres), dna = DNA molecules (chromatids) per cell.
  function counts(mode, stage, n) {
    const two = 2 * n;
    if (mode === 'mitosis') {
      return [
        { cells: 1, chr: two, dna: two }, { cells: 1, chr: two, dna: 2 * two }, { cells: 1, chr: two, dna: 2 * two },
        { cells: 1, chr: two, dna: 2 * two }, { cells: 1, chr: 2 * two, dna: 2 * two }, { cells: 2, chr: two, dna: two }
      ][stage];
    }
    return [
      { cells: 1, chr: two, dna: two }, { cells: 1, chr: two, dna: 2 * two }, { cells: 1, chr: two, dna: 2 * two },
      { cells: 1, chr: two, dna: 2 * two }, { cells: 1, chr: two, dna: 2 * two }, { cells: 2, chr: n, dna: two },
      { cells: 2, chr: n, dna: two }, { cells: 4, chr: n, dna: n }
    ][stage];
  }
  const LENGTHS = [1, 0.74, 0.5];
  // A chromatid is a list of segments {a, b, o} along its length (0 = top, 1 = bottom), o = 'm' or 'p'.
  const whole = (pair, o) => ({ pair, segs: [{ a: 0, b: 1, o }] });
  // One meiosis for n pairs. orient[i] = true sends the paternal homolog of pair i to cell A.
  // cross[i] = crossover position in (0,1) between maternal chromatid 1 and paternal chromatid 0, or null.
  function meiosis(n, orient, cross) {
    const pairs = [];
    for (let i = 0; i < n; i++) {
      const m = [whole(i, 'm'), whole(i, 'm')], p = [whole(i, 'p'), whole(i, 'p')], c = cross[i];
      if (c != null) {
        m[1] = { pair: i, segs: [{ a: 0, b: c, o: 'm' }, { a: c, b: 1, o: 'p' }] };
        p[0] = { pair: i, segs: [{ a: 0, b: c, o: 'p' }, { a: c, b: 1, o: 'm' }] };
      }
      pairs.push({ m, p });
    }
    const cellA = pairs.map(q => (orient[q.m[0].pair] ? q.p : q.m)), cellB = pairs.map(q => (orient[q.m[0].pair] ? q.m : q.p));
    const gametes = [cellA.map(c => c[0]), cellA.map(c => c[1]), cellB.map(c => c[0]), cellB.map(c => c[1])];
    return { pairs, cells: [cellA, cellB], gametes };
  }
  const isRecombinant = ch => ch.segs.length > 1;

  // ---- step 2: independent assortment ----
  // Gamete type as a bit mask: bit i set = pair i came from the father. Without crossing over one meiosis
  // gives two gametes of its type and two of the complementary type.
  function assortTypes(n, orient) {
    let a = 0; for (let i = 0; i < n; i++) if (orient[i]) a |= 1 << i;
    const b = ((1 << n) - 1) ^ a;
    return [a, a, b, b];
  }
  function simulateAssort(n, meioses, seed) {
    const r = rng(seed), tally = new Array(1 << n).fill(0);
    for (let k = 0; k < meioses; k++) {
      const orient = Array.from({ length: n }, () => r() < 0.5);
      assortTypes(n, orient).forEach(tp => tally[tp]++);
    }
    return tally;
  }
  const nTypes = n => Math.pow(2, n);

  // ---- step 3: crossing over between two genes ----
  // Gene A/a sits at position pa, B/b at pb (0..1 along the chromosome, pa < pb). Exactly one crossover per
  // meiosis, at a uniformly random position, between one maternal and one paternal chromatid.
  function twoGeneGametes(pa, pb, c) {
    const gene = (ch, pos) => { const s = ch.segs.find(q => pos >= q.a && pos <= q.b); return s.o; };
    const m = meiosis(1, [false], [c]).pairs[0], chs = [m.m[0], m.m[1], m.p[0], m.p[1]];
    return chs.map(ch => (gene(ch, pa) === 'm' ? 'A' : 'a') + (gene(ch, pb) === 'm' ? 'B' : 'b'));
  }
  const expectedRF = (pa, pb) => Math.abs(pb - pa) / 2;
  function simulateRF(pa, pb, meioses, seed) {
    const r = rng(seed), tally = { AB: 0, ab: 0, Ab: 0, aB: 0 };
    for (let k = 0; k < meioses; k++) {
      const c = 1e-6 + r() * (1 - 2e-6);
      twoGeneGametes(pa, pb, c).forEach(g => tally[g]++);
    }
    const total = 4 * meioses;
    return { tally, total, rf: total ? (tally.Ab + tally.aB) / total : 0 };
  }

  // ---- step 4: two siblings ----
  // For every pair, each child gets the grandfather's or the grandmother's copy from each parent (no crossing over).
  function siblingPair(n, r) {
    const kid = () => Array.from({ length: n }, () => [r() < 0.5 ? 0 : 1, r() < 0.5 ? 0 : 1]);
    const a = kid(), b = kid();
    let shared = 0;
    for (let i = 0; i < n; i++) for (let s = 0; s < 2; s++) if (a[i][s] === b[i][s]) shared++;
    return { a, b, shared };
  }
  function simulateSiblings(n, trials, seed) {
    const r = rng(seed), hist = new Array(2 * n + 1).fill(0);
    let last = null;
    for (let k = 0; k < trials; k++) { last = siblingPair(n, r); hist[last.shared]++; }
    return { hist, last };
  }
  const pIdentical = n => Math.pow(2, -2 * n);
  const sharedSD = n => Math.sqrt(0.25 / (2 * n)); // sd of the shared fraction: binomial(2n, 1/2)/2n

  // ---- step 5: when a pair fails to separate ----
  // copies = copies of the tracked chromosome in each of the 4 gametes; chr = total chromosome count.
  function nondisjunction(mode, n = 23) {
    const copies = mode === 'I' ? [2, 2, 0, 0] : mode === 'II' ? [2, 0, 1, 1] : [1, 1, 1, 1];
    const afterI = mode === 'I' ? [2, 0] : [1, 1]; // homologs of the tracked pair in each cell after division I
    const gam = copies.map(c => n - 1 + c);
    return { afterI, afterIChr: afterI.map(c => n - 1 + c), copies, gametes: gam, zygotes: gam.map(g => g + n), normal: gam.filter(g => g === n).length };
  }

  const api = { rng, SPECIES, zygoteCount, STAGES, counts, LENGTHS, meiosis, isRecombinant, assortTypes, simulateAssort, nTypes, twoGeneGametes, expectedRF, simulateRF, siblingPair, simulateSiblings, pIdentical, sharedSD, nondisjunction };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MEIOSIS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
