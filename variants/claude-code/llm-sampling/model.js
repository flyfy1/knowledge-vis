'use strict';
// LLM sampling lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// The scores (logits) are hand-set toy numbers, not the output of a real language model.
(function (root) {
  const VOCAB = 1000;          // words the toy model can choose from at each position
  const NAMED = 10;            // words shown by name; the other 990 form the "tail"
  // Tail logits: a Zipf-like decay, the same shape for every prompt, shifted by `tailTop`.
  function tailLogits(tailTop) { const out = []; for (let i = 1; i <= VOCAB - NAMED; i++) out.push(tailTop - Math.log(i)); return out; }
  // Two prompts. Word labels live in i18n.js under the ids below.
  const PROMPTS = {
    capital: { ids: ['paris', 'lyon', 'marseille', 'a', 'beautiful', 'famous', 'which', 'nice', 'europe', 'rome'],
      z: [7.2, 3.7, 3.0, 2.6, 2.2, 2.0, 1.6, 1.3, 1.0, 0.6], tailTop: 0.5 },
    weekend: { ids: ['hiking', 'beach', 'movie', 'camping', 'shopping', 'fishing', 'museum', 'swimming', 'running', 'picnic'],
      z: [3.0, 2.85, 2.7, 2.5, 2.35, 2.2, 2.0, 1.85, 1.7, 1.5], tailTop: 0.9 }
  };
  function logits(name) { const P = PROMPTS[name]; return P.z.concat(tailLogits(P.tailTop)); }

  // softmax(z / T), numerically stable.
  function softmax(z, T = 1) {
    let m = -Infinity; for (const v of z) if (v / T > m) m = v / T;
    const e = z.map(v => Math.exp(v / T - m)), s = e.reduce((a, b) => a + b, 0);
    return e.map(v => v / s);
  }
  // Temperature → top-k → top-p → renormalise. Returns the final distribution and what was kept.
  // top-p keeps the fewest highest-probability words whose (top-k-renormalised) cumulative share reaches p.
  function shape(z, { T = 1, k = Infinity, p = 1 } = {}) {
    const q = softmax(z, T);
    const order = q.map((v, i) => i).sort((a, b) => q[b] - q[a] || a - b);
    let keep = order.slice(0, Math.max(1, Math.min(k, order.length)));
    const massK = keep.reduce((s, i) => s + q[i], 0);
    if (p < 1) {
      let c = 0, n = 0;
      for (const i of keep) { c += q[i] / massK; n++; if (c >= p - 1e-12) break; }
      keep = keep.slice(0, n);
    }
    const kept = new Set(keep), mass = keep.reduce((s, i) => s + q[i], 0);
    const out = q.map((v, i) => (kept.has(i) ? v / mass : 0));
    return { q, out, keep, kept, mass, count: keep.length };
  }
  const sum = (a, from = 0, to = a.length) => { let s = 0; for (let i = from; i < to; i++) s += a[i]; return s; };
  // Shares of the named words and of the 990-word tail.
  function tailShare(dist) { return sum(dist, NAMED); }
  function entropyBits(dist) { let h = 0; for (const v of dist) if (v > 0) h -= v * Math.log2(v); return h; }
  // Chance that a reply of L words contains at least one tail word (each position independent, same tail share q).
  function atLeastOne(q, L) { return 1 - Math.pow(1 - q, L); }

  // Seeded PRNG (mulberry32) so every draw on the page is reproducible.
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function draw(dist, u) { let c = 0; for (let i = 0; i < dist.length; i++) { c += dist[i]; if (u < c) return i; } for (let i = dist.length - 1; i >= 0; i--) if (dist[i] > 0) return i; return 0; }
  // Draw counts lumped into the 11 displayed columns (10 named words + tail).
  function lump(dist) { const out = dist.slice(0, NAMED); out.push(tailShare(dist)); return out; }
  // Total variation distance between two distributions over the same columns: ½ Σ |a − b|.
  function tv(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / 2; }

  // ---- step 5: a tiny first-order (bigram) language model over 12 tokens ----
  // Token 0 is the full stop; every sentence starts after it.
  const TOKENS = ['stop', 'cat', 'dog', 'bird', 'chases', 'watches', 'finds', 'ball', 'fish', 'moon', 'shadow', 'then'];
  const ODD = -2; // logit of every transition that breaks the toy grammar
  // Grammatical transitions with their logits; everything else gets ODD.
  const GOOD = {
    stop: { cat: 3.0, dog: 2.4, bird: 1.8 },
    cat: { chases: 2.6, watches: 2.0, finds: 1.4 },
    dog: { chases: 3.0, finds: 2.0, watches: 1.2 },
    bird: { watches: 2.6, finds: 1.8, chases: 1.0 },
    chases: { ball: 2.8, shadow: 2.0, fish: 1.2, moon: 0.5 },
    watches: { moon: 2.6, fish: 1.8, shadow: 1.6, ball: 1.2 },
    finds: { fish: 2.6, ball: 2.2, shadow: 1.0, moon: 0.4 },
    ball: { stop: 2.8, then: 1.8 }, fish: { stop: 2.7, then: 1.8 }, moon: { stop: 2.8, then: 1.5 }, shadow: { stop: 2.6, then: 1.7 },
    then: { chases: 2.0, watches: 1.6, finds: 1.4, dog: 1.2, cat: 1.0, bird: 0.8 }
  };
  const BIG = TOKENS.map(a => TOKENS.map(b => (GOOD[a][b] !== undefined ? GOOD[a][b] : ODD)));
  const isOdd = (a, b) => GOOD[TOKENS[a]][TOKENS[b]] === undefined;
  const SENT_LEN = 24;
  // Generate SENT_LEN tokens after a full stop. Returns tokens, the probability each was drawn with, and odd flags.
  function generate({ T = 1, p = 1, seed = 1, len = SENT_LEN } = {}) {
    const u = rng(seed), toks = [], probs = [], odd = [];
    let prev = 0;
    for (let i = 0; i < len; i++) {
      const s = shape(BIG[prev], { T, p });
      const next = draw(s.out, u());
      toks.push(next); probs.push(s.out[next]); odd.push(isOdd(prev, next)); prev = next;
    }
    return { toks, probs, odd, stats: stats(toks, odd) };
  }
  // Repeat rate: share of 3-token windows that already appeared earlier in the same text.
  function stats(toks, odd) {
    const seen = new Set(); let rep = 0, n = 0;
    const seq = [0].concat(toks);
    for (let i = 0; i + 2 < seq.length; i++) { const key = seq[i] + ',' + seq[i + 1] + ',' + seq[i + 2]; if (seen.has(key)) rep++; seen.add(key); n++; }
    return { repeat: rep / n, odd: odd.filter(Boolean).length, oddShare: odd.filter(Boolean).length / odd.length, distinct: new Set(toks).size };
  }
  // Averages over many seeds (the curves in step 5).
  const T_GRID = []; for (let i = 0; i <= 30; i++) T_GRID.push(0.1 + i * 0.1);
  function sweep(p, seeds = 200) {
    return T_GRID.map(T => {
      let r = 0, o = 0;
      for (let s = 1; s <= seeds; s++) { const g = generate({ T, p, seed: s }); r += g.stats.repeat; o += g.stats.oddShare; }
      return { T, repeat: r / seeds, odd: o / seeds };
    });
  }

  const api = { VOCAB, NAMED, PROMPTS, logits, softmax, shape, sum, tailShare, entropyBits, atLeastOne, rng, draw, lump, tv,
    TOKENS, GOOD, BIG, ODD, isOdd, SENT_LEN, generate, stats, T_GRID, sweep };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.LLM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
