'use strict';
// Genetics & probability model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every square, bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: gene A (flower colour; A purple dominant over a white), gene B (seed shape; B round
// dominant over b wrinkled). Complete dominance, no selection, no mutation, fair segregation (1/2 each).
(function (root) {
  // ---- exact fractions (so 3/4, 9/16, 2/3 are shown exactly) ----
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g, v: n / d }; }
  const fstr = f => (f.n === 0 ? '0' : f.d === 1 ? String(f.n) : f.n + '/' + f.d);

  // A genotype is a two-letter string such as 'Aa' (dominant letter first).
  const norm = (x, y) => (x <= y ? x + y : y + x); // uppercase sorts before lowercase
  // Segregation: each of the two alleles goes into a gamete with probability 1/2.
  function gametes(g) { return [g[0], g[1]]; }
  function gameteProbs(g) { const out = {}; gametes(g).forEach(a => { out[a] = (out[a] || 0) + 0.5; }); return out; }
  const dominantShown = g => g[0] === g[0].toUpperCase();

  // Monohybrid cross: 2×2 Punnett square, each cell 1/4.
  function punnett(g1, g2) {
    const rows = gametes(g1), cols = gametes(g2), cells = [];
    rows.forEach((r, i) => cols.forEach((c, j) => cells.push({ i, j, row: r, col: c, g: norm(r, c) })));
    return { rows, cols, cells };
  }
  function cross(g1, g2) {
    const L = g1[0].toUpperCase(), l = L.toLowerCase(), keys = [L + L, L + l, l + l];
    const geno = {}; keys.forEach(k => { geno[k] = 0; });
    punnett(g1, g2).cells.forEach(c => { geno[c.g] += 1; });
    const dom = geno[L + L] + geno[L + l], rec = geno[l + l];
    return { geno: Object.fromEntries(keys.map(k => [k, frac(geno[k], 4)])), dom: frac(dom, 4), rec: frac(rec, 4), keys };
  }

  // ---- binomial: number of recessive (white) offspring among n ----
  function choose(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  function binomPMF(n, p) { return Array.from({ length: n + 1 }, (_, k) => choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)); }

  // ---- seeded randomness (mulberry32), so every simulation is reproducible ----
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // One gamete from genotype g: pick one of the two alleles with probability 1/2.
  const drawGamete = (g, r) => g[r() < 0.5 ? 0 : 1];
  // One family of n offspring from Aa × Aa: count the white (aa) ones.
  function family(n, r) { let k = 0; for (let i = 0; i < n; i++) if (drawGamete('Aa', r) === 'a' && drawGamete('Aa', r) === 'a') k++; return k; }

  // ---- dihybrid cross with independent assortment: 4×4 square ----
  // parent = { A: 'Aa', B: 'Bb' }; each gamete carries one A-allele and one B-allele, 1/4 each.
  function gametes2(p) { const out = []; gametes(p.A).forEach(a => gametes(p.B).forEach(b => out.push(a + b))); return out; }
  const PHENO = ['AB', 'Ab', 'aB', 'ab']; // AB = purple & round, Ab = purple & wrinkled, aB = white & round, ab = white & wrinkled
  function pheno2(gA, gB) { return (dominantShown(gA) ? 'A' : 'a') + (dominantShown(gB) ? 'B' : 'b'); }
  function dihybrid(p1, p2) {
    const rows = gametes2(p1), cols = gametes2(p2), cells = [];
    rows.forEach((r, i) => cols.forEach((c, j) => {
      const gA = norm(r[0], c[0]), gB = norm(r[1], c[1]);
      cells.push({ i, j, row: r, col: c, gA, gB, ph: pheno2(gA, gB) });
    }));
    const count = Object.fromEntries(PHENO.map(k => [k, 0]));
    cells.forEach(c => { count[c.ph]++; });
    return { rows, cols, cells, count, prob: Object.fromEntries(PHENO.map(k => [k, frac(count[k], 16)])) };
  }
  // The same answer by the product rule: P(both traits) = P(trait A) × P(trait B).
  function productRule(p1, p2) {
    const a = cross(p1.A, p2.A), b = cross(p1.B, p2.B);
    const pa = { A: a.dom, a: a.rec }, pb = { B: b.dom, b: b.rec };
    return Object.fromEntries(PHENO.map(k => [k, frac(pa[k[0]].n * pb[k[1]].n, pa[k[0]].d * pb[k[1]].d)]));
  }
  // The crosses offered on the page for each gene.
  const CROSSES_A = [['Aa', 'Aa'], ['Aa', 'aa'], ['AA', 'aa']];
  const CROSSES_B = [['Bb', 'Bb'], ['Bb', 'bb'], ['BB', 'bb']];

  // ---- linkage: AB/ab parent (A with B on one chromosome, a with b on the other) ----
  // r = recombination frequency (share of gametes in which a crossover between the genes swapped partners), 0 ≤ r ≤ 1/2.
  function linkedGametes(r) { return { AB: (1 - r) / 2, ab: (1 - r) / 2, Ab: r / 2, aB: r / 2 }; }
  // Test cross AB/ab × ab/ab: the offspring phenotype simply reads off the gamete from the first parent.
  function testcross(r) { const g = linkedGametes(r); return { AB: g.AB, Ab: g.Ab, aB: g.aB, ab: g.ab }; }
  // Selfing AB/ab × AB/ab (both parents in coupling phase).
  function selfLinked(r) {
    const g = linkedGametes(r), out = { AB: 0, Ab: 0, aB: 0, ab: 0 };
    for (const [x, px] of Object.entries(g)) for (const [y, py] of Object.entries(g)) {
      const A = x[0] === 'A' || y[0] === 'A', B = x[1] === 'B' || y[1] === 'B';
      out[(A ? 'A' : 'a') + (B ? 'B' : 'b')] += px * py;
    }
    return out;
  }
  // Simulated test-cross offspring; returns counts per phenotype.
  function simulateTestcross(r, n, rand) {
    const out = { AB: 0, Ab: 0, aB: 0, ab: 0 }, g = linkedGametes(r), keys = ['AB', 'ab', 'Ab', 'aB'];
    for (let i = 0; i < n; i++) { let u = rand(), k = 0; while (k < 3 && u >= g[keys[k]]) { u -= g[keys[k]]; k++; } out[keys[k]]++; }
    return out;
  }

  // ---- conditional probability on Aa × Aa ----
  // evidence: 'none' | 'dom' (purple) | 'rec' (white); returns the surviving cells and P(target | evidence).
  function conditional(evidence, target) {
    const cells = punnett('Aa', 'Aa').cells;
    const keep = c => evidence === 'none' || (evidence === 'dom' ? dominantShown(c.g) : !dominantShown(c.g));
    const kept = cells.filter(keep), hit = kept.filter(c => c.g === target);
    return { cells: cells.map(c => ({ ...c, kept: keep(c) })), p: frac(hit.length, kept.length), hit: hit.length, kept: kept.length };
  }
  // A purple offspring of Aa × Aa is crossed with `partner`; chance that their offspring is white.
  function nextGeneration(partner) {
    const branches = ['AA', 'Aa'].map(g => {
      const w = conditional('dom', g).p, white = cross(g, partner).rec;
      return { g, w, white, path: frac(w.n * white.n, w.d * white.d) };
    });
    const total = branches.reduce((s, b) => s + b.path.v, 0);
    // exact sum of the two path fractions
    const sum = branches.reduce((acc, b) => frac(acc.n * b.path.d + b.path.n * acc.d, acc.d * b.path.d), frac(0, 1));
    return { branches, total, sum };
  }

  const api = { frac, fstr, gametes, gameteProbs, dominantShown, punnett, cross, choose, binomPMF, rng, drawGamete, family, gametes2, PHENO, dihybrid, productRule, CROSSES_A, CROSSES_B, linkedGametes, testcross, selfLinked, simulateTestcross, conditional, nextGeneration };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GENE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
