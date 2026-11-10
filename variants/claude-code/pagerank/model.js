'use strict';
// PageRank lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every node size, bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Convention: r_{k+1}[j] = (1 − d)/N + d · Σ_{i→j} r_k[i] / out(i); a page with no out-links (dead end)
// passes its whole share to every page equally, as if it linked to all N pages.
(function (root) {
  const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  // The toy web. Each entry: page → pages it links to.
  const BASE = { A: ['B'], B: ['A', 'C'], C: ['A', 'G'], D: ['G', 'A'], E: ['G', 'D'], F: ['G', 'E'], G: ['C'] };
  // Variants for step 3.
  const VARIANTS = {
    normal: BASE,
    trap: { ...BASE, F: ['G'], G: ['F'] },       // F and G only link to each other: a spider trap
    deadend: { ...BASE, G: [] }                  // G links nowhere: a dead end
  };
  // Layout in a unit box (x right, y down) for drawing.
  const POS = { A: [0.45, 0.1], B: [0.88, 0.22], C: [0.18, 0.4], D: [0.66, 0.5], E: [0.9, 0.84], F: [0.45, 0.95], G: [0.1, 0.82] };

  function build(links, names = Object.keys(links)) {
    const idx = {}; names.forEach((n, i) => { idx[n] = i; });
    const out = names.map(n => (links[n] || []).map(m => idx[m]));
    return { names, idx, out, N: names.length };
  }
  function inCounts(g) { const c = new Array(g.N).fill(0); g.out.forEach(o => o.forEach(j => c[j]++)); return c; }
  // One power-iteration step.
  function step(g, r, d) {
    const N = g.N, next = new Array(N).fill((1 - d) / N);
    let dangling = 0;
    g.out.forEach((o, i) => { if (!o.length) dangling += r[i]; else o.forEach(j => { next[j] += d * r[i] / o.length; }); });
    if (dangling) for (let j = 0; j < N; j++) next[j] += d * dangling / N;
    return next;
  }
  // The same step without the dead-end rule: a dead end's share is simply lost (used to show the problem).
  function stepLeaky(g, r, d) {
    const N = g.N, next = new Array(N).fill((1 - d) / N);
    g.out.forEach((o, i) => o.forEach(j => { next[j] += d * r[i] / o.length; }));
    return next;
  }
  const uniform = N => new Array(N).fill(1 / N);
  const l1 = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0);
  // Iterate from uniform until the L1 change is below tol; returns r and the number of iterations.
  function pagerank(g, d = 0.85, tol = 1e-8, maxIt = 100000) {
    let r = uniform(g.N), it = 0;
    for (; it < maxIt; it++) { const n = step(g, r, d); const ch = l1(n, r); r = n; if (ch < tol) { it++; break; } }
    return { r, iterations: it };
  }
  function history(g, d, K, r0 = uniform(g.N)) { const out = [r0]; let r = r0; for (let k = 0; k < K; k++) { r = step(g, r, d); out.push(r); } return out; }
  const order = r => r.map((v, i) => i).sort((a, b) => r[b] - r[a] || a - b);

  // Seeded PRNG (mulberry32).
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // One random-surfer move: with probability d follow a random out-link, otherwise (or at a dead end) jump to a random page.
  function surf(g, at, d, u) {
    const o = g.out[at];
    if (o.length && u() < d) return { to: o[Math.floor(u() * o.length)], jump: false };
    return { to: Math.floor(u() * g.N), jump: true };
  }

  // Step 5: a link farm of m fake pages, each linking only to `target`; optionally one real page adds a link to it.
  function withFarm(links, target, m, extra = null) {
    const L = {}; Object.keys(links).forEach(k => { L[k] = links[k].slice(); });
    if (extra) L[extra.from] = L[extra.from].concat([extra.to]);
    for (let i = 1; i <= m; i++) L['x' + i] = [target];
    return L;
  }

  // Smallest farm size whose lift on `target` matches a given score (search up to maxM).
  function farmNeeded(links, target, score, maxM = 2000) {
    for (let m = 0; m <= maxM; m++) { const g = build(withFarm(links, target, m)); if (pagerank(g).r[g.idx[target]] >= score) return m; }
    return Infinity;
  }

  const api = { stepLeaky, farmNeeded, NAMES, BASE, VARIANTS, POS, build, inCounts, step, uniform, l1, pagerank, history, order, rng, surf, withFarm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
