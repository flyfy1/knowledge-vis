'use strict';
// Recursion and divide-and-conquer model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every frame, tree node, bar and readout on the page is computed here; tests/core.cjs pins the claims.
// All counts come from actually running the recursions (or exact sums), not from formulas typed into the page.
(function (root) {
  const BASE = 3; // steps 0–1 compute 3^n

  /* ---------- step 0: pow(n) = 3 · pow(n − 1), pow(0) = 1 ---------- */
  // Execution trace: one event per call and one per return. State after s events = trace.states[s].
  function linearTrace(n) {
    const events = [];
    (function pow(k, depth) {
      events.push({ type: 'call', k, depth });
      const v = k === 0 ? 1 : BASE * pow(k - 1, depth + 1);
      events.push({ type: 'ret', k, depth, value: v });
      return v;
    })(n, 0);
    // stack snapshots: frames {k, value|null}; a frame shows its value only once it has returned (then it is popped)
    const states = [{ stack: [], last: null }];
    const stack = [];
    let mults = 0;
    events.forEach(e => {
      if (e.type === 'call') stack.push({ k: e.k, waiting: e.k > 0 });
      else { stack.pop(); if (e.k > 0) mults++; }
      states.push({ stack: stack.map(f => ({ ...f })), last: e, mults });
    });
    const depthAt = states.map(s => s.stack.length);
    return { n, events, states, depthAt, maxDepth: Math.max(...depthAt), mults, value: Math.pow(BASE, n) };
  }

  /* ---------- step 1: two recursions for the same 3^n ---------- */
  // Linear: pow(n) = 3·pow(n−1). Halving: pow(n) = h·h (·3 if n odd), h = pow(⌊n/2⌋). Both stop at pow(0) = 1.
  // We only count frames and multiplications, so n can be large without computing 3^n itself.
  function linearCost(n) { return { frames: n + 1, mults: n }; }
  function halvingChain(n) { const chain = [n]; while (chain[chain.length - 1] > 0) chain.push(Math.floor(chain[chain.length - 1] / 2)); return chain; }
  function halvingCost(n) {
    const chain = halvingChain(n);
    let mults = 0;
    chain.forEach(k => { if (k > 0) mults += 1 + (k % 2); }); // one squaring, plus one extra ×3 when k is odd
    return { frames: chain.length, mults, chain };
  }
  const digitsOfPow = n => (n === 0 ? 1 : Math.floor(n * Math.log10(BASE)) + 1);

  /* ---------- step 2: merge sort, traced ---------- */
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function makeArray(seed, n = 8) { const r = mulberry32(seed * 7919 + 13); return Array.from({ length: n }, () => 1 + Math.floor(r() * 99)); }
  // Nodes are ranges [lo, hi). Events: 'enter' (call starts; a leaf is already sorted) and 'merge' (two sorted halves combined).
  function mergeTrace(arr) {
    const nodes = [], events = [];
    let cmpTotal = 0;
    function sort(lo, hi, depth, parent) {
      const id = nodes.length;
      nodes.push({ id, lo, hi, depth, parent, kids: [], input: arr.slice(lo, hi), output: null });
      if (parent !== null) nodes[parent].kids.push(id);
      if (hi - lo === 1) { nodes[id].output = arr.slice(lo, hi); events.push({ type: 'enter', id, cmp: 0, leaf: true }); return nodes[id].output; }
      events.push({ type: 'enter', id, cmp: 0, leaf: false });
      const mid = (lo + hi) >> 1;
      const L = sort(lo, mid, depth + 1, id), R = sort(mid, hi, depth + 1, id);
      const out = []; let i = 0, j = 0, cmp = 0;
      while (i < L.length && j < R.length) { cmp++; if (L[i] <= R[j]) out.push(L[i++]); else out.push(R[j++]); }
      while (i < L.length) out.push(L[i++]);
      while (j < R.length) out.push(R[j++]);
      nodes[id].output = out; cmpTotal += cmp;
      events.push({ type: 'merge', id, cmp });
      return out;
    }
    const sorted = sort(0, arr.length, 0, null);
    // per event: which nodes are reached / merged, the live call stack and comparisons so far
    const states = [];
    const reached = new Set(), done = new Set();
    let cmp = 0;
    const stackOf = id => { const s = []; for (let q = id; q !== null; q = nodes[q].parent) s.unshift(q); return s; };
    states.push({ reached: new Set(), done: new Set(), stack: [], cmp: 0, ev: null });
    events.forEach(e => {
      reached.add(e.id);
      if (e.type === 'merge' || e.leaf) done.add(e.id);
      cmp += e.cmp;
      // live stack at this event: the call doing the work (entering, or merging) and its ancestors; it returns before the next event
      states.push({ reached: new Set(reached), done: new Set(done), stack: stackOf(e.id), cmp, ev: e });
    });
    const levels = Math.max(...nodes.map(q => q.depth)) + 1;
    return { arr: arr.slice(), nodes, events, states, sorted, cmpTotal, levels };
  }
  const log2 = Math.log2;
  // Worst case of top-down merge sort on n items: n⌈log2 n⌉ − 2^⌈log2 n⌉ + 1 (= 17 for n = 8).
  const mergeWorst = n => { const c = Math.ceil(log2(n)); return n * c - Math.pow(2, c) + 1; };

  /* ---------- step 3: the recursion tree's bill, T(n) = a·T(n/2) + n^d ---------- */
  function treeLevels(a, d, m) {
    const n = Math.pow(2, m), rows = [];
    for (let k = 0; k <= m; k++) {
      const nodes = Math.pow(a, k), size = n / Math.pow(2, k), each = Math.pow(size, d);
      rows.push({ k, nodes, size, each, total: nodes * each });
    }
    const total = rows.reduce((s, r) => s + r.total, 0);
    const ratio = a / Math.pow(2, d); // level k+1 total ÷ level k total
    const regime = Math.abs(ratio - 1) < 1e-12 ? 'even' : ratio < 1 ? 'top' : 'bottom';
    return { n, rows, total, ratio, regime, critical: log2(a) };
  }
  // The growth law the regime predicts, for comparison in the readout.
  function predicted(a, d, n) {
    const r = a / Math.pow(2, d);
    if (Math.abs(r - 1) < 1e-12) return Math.pow(n, d) * (log2(n) + 1);
    if (r < 1) return Math.pow(n, d);
    return Math.pow(n, log2(a));
  }

  /* ---------- step 4: overlapping subproblems (Fibonacci) ---------- */
  // fib(0) = 0, fib(1) = 1, fib(k) = fib(k−1) + fib(k−2). Count how often each fib(k) is called.
  function fibCalls(n, memo) {
    const count = new Array(n + 1).fill(0), cache = new Map();
    let calls = 0;
    (function fib(k) {
      calls++; count[k]++;
      if (memo && cache.has(k)) return cache.get(k);
      const v = k < 2 ? k : fib(k - 1) + fib(k - 2);
      if (memo) cache.set(k, v);
      return v;
    })(n);
    return { count, calls };
  }
  // Same counts without running the exponential recursion (needed for n up to 40): naive calls of fib(k) inside fib(n).
  function fibCountsFast(n, memo) {
    const count = new Array(n + 1).fill(0);
    if (memo) return fibCalls(n, true); // linear: each fib(k) is computed once, later calls are cache hits
    count[n] = 1;
    for (let k = n; k >= 2; k--) { count[k - 1] += count[k]; count[k - 2] += count[k]; }
    return { count, calls: count.reduce((s, v) => s + v, 0) };
  }
  function fibValue(n) { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; }

  /* ---------- step 5: uneven splits (quicksort-style) ---------- */
  // Split n items around one pivot: the smaller part gets s = ⌊p·(n − 1)⌋, the larger n − 1 − s; the split costs n − 1 comparisons.
  function splitCost(n, p) {
    // iterative over sizes with memo (sizes repeat a lot)
    const memoC = new Map(), memoD = new Map();
    function C(k) { if (k <= 1) return 0; if (memoC.has(k)) return memoC.get(k); const s = Math.floor(p * (k - 1)); const v = (k - 1) + C(s) + C(k - 1 - s); memoC.set(k, v); return v; }
    function D(k) { if (k <= 1) return k; if (memoD.has(k)) return memoD.get(k); const s = Math.floor(p * (k - 1)); const v = 1 + Math.max(D(s), D(k - 1 - s)); memoD.set(k, v); return v; }
    // build C bottom-up to avoid deep JS recursion when p = 0
    for (let k = 2; k <= n; k++) { C(k); D(k); }
    return { cmp: C(n), depth: D(n) };
  }
  // Whole tables C[k], D[k] for k = 0..nmax in one pass (for the comparison curve).
  function splitTable(p, nmax) {
    const C = new Float64Array(nmax + 1), D = new Int32Array(nmax + 1);
    if (nmax >= 1) D[1] = 1;
    for (let k = 2; k <= nmax; k++) { const s = Math.floor(p * (k - 1)); C[k] = (k - 1) + C[s] + C[k - 1 - s]; D[k] = 1 + Math.max(D[s], D[k - 1 - s]); }
    return { C, D };
  }
  // Icicle rows for the picture: each row lists the intervals [start, len) alive at that depth (len ≥ 1).
  function splitRows(n, p) {
    const rows = [];
    let cur = [[0, n]];
    while (cur.length) {
      rows.push(cur);
      const next = [];
      cur.forEach(([st, len]) => {
        if (len <= 1) return;
        const s = Math.floor(p * (len - 1));
        if (s > 0) next.push([st, s]);
        if (len - 1 - s > 0) next.push([st + s + 1, len - 1 - s]);
      });
      cur = next;
    }
    return rows;
  }

  const api = { BASE, linearTrace, linearCost, halvingChain, halvingCost, digitsOfPow, makeArray, mergeTrace, mergeWorst, treeLevels, predicted, fibCalls, fibCountsFast, fibValue, splitCost, splitTable, splitRows };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.REC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
