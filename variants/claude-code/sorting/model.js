'use strict';
// Sorting & Big O lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count on the page is produced by running the real algorithms below on real arrays and counting
// comparisons (calls to less(a, b)); tests/core.cjs pins the claims.
(function (root) {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // A shuffled array of 1..n from a seed (Fisher–Yates).
  function shuffled(n, seed) {
    const a = Array.from({ length: n }, (_, i) => i + 1), r = mulberry32(seed);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const ascending = n => Array.from({ length: n }, (_, i) => i + 1);
  const descending = n => Array.from({ length: n }, (_, i) => n - i);
  const isSorted = a => a.every((v, i) => !i || a[i - 1] <= v);

  /* ---------- the algorithms, each counting comparisons; optional event log ---------- */
  function selection(input, log) {
    const a = input.slice(); let cmp = 0, swaps = 0;
    for (let i = 0; i < a.length - 1; i++) {
      let m = i;
      for (let j = i + 1; j < a.length; j++) { cmp++; const less = a[j] < a[m]; if (log) log.push({ kind: 'cmp', i: j, j: m, a: a.slice(), done: i, cmp }); if (less) m = j; }
      if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; swaps++; }
      if (log) log.push({ kind: 'place', i, j: m, a: a.slice(), done: i + 1, cmp });
    }
    return { a, cmp, swaps };
  }
  function insertion(input) {
    const a = input.slice(); let cmp = 0, moves = 0;
    for (let i = 1; i < a.length; i++) {
      const v = a[i]; let j = i - 1;
      while (j >= 0) { cmp++; if (a[j] > v) { a[j + 1] = a[j]; moves++; j--; } else break; }
      a[j + 1] = v;
    }
    return { a, cmp, moves };
  }
  // Top-down merge sort; returns comparisons and the comparisons made at each recursion level.
  function merge(input, onCompare) {
    const a = input.slice(); let cmp = 0; const perLevel = [];
    function rec(lo, hi, d) {
      if (hi - lo <= 1) return;
      const mid = (lo + hi) >> 1; rec(lo, mid, d + 1); rec(mid, hi, d + 1);
      const L = a.slice(lo, mid), R = a.slice(mid, hi); let i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length) { cmp++; perLevel[d] = (perLevel[d] || 0) + 1; const less = onCompare ? onCompare(L[i], R[j]) : L[i] <= R[j]; if (less) a[k++] = L[i++]; else a[k++] = R[j++]; }
      while (i < L.length) a[k++] = L[i++]; while (j < R.length) a[k++] = R[j++];
    }
    rec(0, a.length, 0);
    return { a, cmp, perLevel };
  }
  // Bottom-up merge for step 2's picture: runs of width 1, 2, 4, … ; per-level comparisons.
  function mergeLevels(input) {
    let a = input.slice(); const levels = [{ width: 1, a: a.slice(), cmp: 0 }];
    for (let w = 1; w < a.length; w *= 2) {
      const b = []; let cmp = 0;
      for (let lo = 0; lo < a.length; lo += 2 * w) {
        const L = a.slice(lo, lo + w), R = a.slice(lo + w, lo + 2 * w); let i = 0, j = 0;
        while (i < L.length && j < R.length) { cmp++; if (L[i] <= R[j]) b.push(L[i++]); else b.push(R[j++]); }
        while (i < L.length) b.push(L[i++]); while (j < R.length) b.push(R[j++]);
      }
      a = b; levels.push({ width: 2 * w, a: a.slice(), cmp });
    }
    return levels;
  }
  // Quicksort with Lomuto partition. pivot: 'first' | 'random' | 'median3'. Records each partition call.
  function quick(input, pivot = 'first', seed = 1) {
    const a = input.slice(), r = mulberry32(seed), calls = []; let cmp = 0, maxDepth = 0;
    function part(lo, hi, d) { // sorts a[lo..hi] inclusive
      if (lo >= hi) { if (lo === hi) calls.push({ lo, hi, d, p: lo }); return; }
      maxDepth = Math.max(maxDepth, d);
      let pi = lo;
      if (pivot === 'random') pi = lo + Math.floor(r() * (hi - lo + 1));
      else if (pivot === 'median3') { const m = (lo + hi) >> 1, c = [lo, m, hi].sort((x, y) => a[x] - a[y]); pi = c[1]; }
      [a[lo], a[pi]] = [a[pi], a[lo]];
      const pv = a[lo]; let s = lo;
      for (let i = lo + 1; i <= hi; i++) { cmp++; if (a[i] < pv) { s++; [a[s], a[i]] = [a[i], a[s]]; } }
      [a[lo], a[s]] = [a[s], a[lo]];
      calls.push({ lo, hi, d, p: s });
      part(lo, s - 1, d + 1); part(s + 1, hi, d + 1);
    }
    part(0, a.length - 1, 0);
    return { a, cmp, calls, depth: maxDepth + 1 };
  }
  // Counting sort: no comparisons between elements; work ~ n + k (k = number of possible keys).
  function counting(input, k) {
    const c = new Array(k + 1).fill(0); for (const v of input) c[v]++;
    const out = []; for (let v = 0; v <= k; v++) for (let q = 0; q < c[v]; q++) out.push(v);
    return { a: out, cmp: 0, work: input.length + k + 1 };
  }

  /* ---------- step 1: inputs ---------- */
  const SEED1 = 11;
  function insertionCases(n) {
    return { sorted: insertion(ascending(n)).cmp, random: insertion(shuffled(n, SEED1 + n)).cmp, reversed: insertion(descending(n)).cmp, selection: selection(shuffled(n, SEED1 + n)).cmp };
  }

  /* ---------- step 3: measured growth (mean over 3 shuffled arrays per n) ---------- */
  const NS = [8, 16, 32, 64, 128, 256, 512, 1024, 2048];
  const TRIALS = 3;
  const growthCache = {};
  function growth(n) {
    if (growthCache[n]) return growthCache[n];
    const out = { selection: 0, insertion: 0, merge: 0, quick: 0 };
    for (let s = 1; s <= TRIALS; s++) {
      const a = shuffled(n, 1000 * s + n);
      out.selection += selection(a).cmp; out.insertion += insertion(a).cmp; out.merge += merge(a).cmp; out.quick += quick(a, 'random', s).cmp;
    }
    for (const k in out) out[k] /= TRIALS;
    return (growthCache[n] = out);
  }
  const nlogn = n => n * Math.log2(n);

  /* ---------- step 5: how many orderings are still possible ---------- */
  function permutations(n) {
    const out = [], a = ascending(n);
    (function rec(k) { if (k === n) { out.push(a.slice()); return; } for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; rec(k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(0);
    return out;
  }
  const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);
  const log2fact = n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log2(i); return s; };
  // Merge-sort a hidden arrangement of n items (positions 0..n−1, values = hidden ranks).
  // After each comparison "is item p before item q in sorted order?", count the arrangements still consistent.
  function candidates(hidden) {
    const n = hidden.length, perms = permutations(n), history = [perms.length], asked = [];
    let alive = perms;
    const idx = Array.from({ length: n }, (_, i) => i); // sort item indices by hidden rank
    merge(idx, (p, q) => {
      const ans = hidden[p] <= hidden[q];
      asked.push({ p, q, ans });
      alive = alive.filter(pm => (pm[p] <= pm[q]) === ans);
      history.push(alive.length);
      return ans;
    });
    return { history, asked, total: perms.length };
  }
  // Largest number of comparisons merge sort ever needs for n items (over every arrangement).
  function mergeWorst(n) { let w = 0; for (const pm of permutations(n)) w = Math.max(w, merge(pm).cmp); return w; }

  const api = { mulberry32, shuffled, ascending, descending, isSorted, selection, insertion, merge, mergeLevels, quick, counting, SEED1, insertionCases, NS, TRIALS, growth, nlogn, permutations, factorial, log2fact, candidates, mergeWorst };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SORT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
