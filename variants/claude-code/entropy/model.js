'use strict';
// Entropy lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, tree, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// All logarithms are base 2, so information is measured in bits.
(function (root) {
  const log2 = Math.log2;
  const surprise = p => (p > 0 ? -log2(p) : Infinity);
  function entropy(ps) { let h = 0; for (const p of ps) if (p > 0) h -= p * log2(p); return h; }
  const binaryH = p => entropy([p, 1 - p]);

  // Step 0: guessing one of N equally likely items by halving.
  // Each question asks "is it in the first part?", the first part being ⌈m/2⌉ of the m candidates left.
  function halving(N, secret) {
    let lo = 0, hi = N; const steps = [];
    while (hi - lo > 1) { const mid = lo + Math.ceil((hi - lo) / 2), yes = secret < mid; steps.push({ lo, hi, mid, yes }); if (yes) hi = mid; else lo = mid; }
    return steps;
  }
  const questionsFor = (N, s) => halving(N, s).length;
  // Average over a uniformly random secret, closed form for a complete binary tree.
  function avgQuestions(N) { const k = Math.floor(log2(N)); return k + 2 * (N - Math.pow(2, k)) / N; }

  // Steps 3–5: a six-symbol weather source, p_i ∝ exp(−α·i). α = 0 is uniform.
  const SYMBOLS = ['sun', 'cloud', 'rain', 'fog', 'snow', 'hail'];
  function source(alpha) { const w = SYMBOLS.map((_, i) => Math.exp(-alpha * i)), Z = w.reduce((a, b) => a + b, 0); return w.map(v => v / Z); }

  // Huffman code: repeatedly merge the two least likely nodes. Ties broken by creation order (deterministic).
  function huffman(ps) {
    let id = 0;
    let nodes = ps.map((p, i) => ({ p, leaf: i, id: id++ }));
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.p - b.p || a.id - b.id);
      const [a, b] = nodes.splice(0, 2);
      nodes.push({ p: a.p + b.p, kids: [a, b], id: id++ });
    }
    const codes = new Array(ps.length).fill('');
    const walk = (n, c) => { if (n.leaf !== undefined) { codes[n.leaf] = c || '0'; return; } walk(n.kids[0], c + '0'); walk(n.kids[1], c + '1'); };
    walk(nodes[0], '');
    const lengths = codes.map(c => c.length);
    return { root: nodes[0], codes, lengths, avg: ps.reduce((s, p, i) => s + p * lengths[i], 0) };
  }
  // Code blocks of k symbols at once: Huffman on the 6^k joint distribution (independent symbols).
  function blockAvg(ps, k) {
    let joint = [1];
    for (let j = 0; j < k; j++) { const next = []; for (const a of joint) for (const p of ps) next.push(a * p); joint = next; }
    return huffman(joint).avg / k;
  }
  const kraft = lengths => lengths.reduce((s, l) => s + Math.pow(2, -l), 0);

  // Random numbers: mulberry32 (deterministic seeds so the page and the tests agree).
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sampleIndex(ps, r) { let u = r(), i = 0; while (i < ps.length - 1 && u >= ps[i]) { u -= ps[i]; i++; } return i; }
  // Encode n sampled symbols with the Huffman code; total bits used.
  function encodeSample(ps, n, seed) {
    const r = mulberry32(seed), L = huffman(ps).lengths; let bits = 0, surp = 0;
    for (let i = 0; i < n; i++) { const s = sampleIndex(ps, r); bits += L[s]; surp += surprise(ps[s]); }
    return { bits, perSymbol: bits / n, avgSurprise: surp / n };
  }
  // Step 2: running average surprise of coin flips with P(heads) = p.
  function coinRun(p, n, seed) {
    const r = mulberry32(seed), out = new Float64Array(n); let s = 0;
    for (let i = 0; i < n; i++) { s += r() < p ? surprise(p) : surprise(1 - p); out[i] = s / (i + 1); }
    return out;
  }

  // Step 5: coding with the wrong distribution.
  function crossEntropy(p, q) { let h = 0; for (let i = 0; i < p.length; i++) if (p[i] > 0) h += q[i] > 0 ? -p[i] * log2(q[i]) : Infinity; return h; }
  const kl = (p, q) => crossEntropy(p, q) - entropy(p);
  // A model that rules out the last symbol (hail): q_hail = 0, the rest renormalised.
  function withoutLast(q) { const s = q.slice(0, -1).reduce((a, b) => a + b, 0); return q.map((v, i) => (i === q.length - 1 ? 0 : v / s)); }

  const api = { log2, surprise, entropy, binaryH, halving, questionsFor, avgQuestions, SYMBOLS, source, huffman, blockAvg, kraft, mulberry32, sampleIndex, encodeSample, coinRun, crossEntropy, kl, withoutLast };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ENTROPY_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
