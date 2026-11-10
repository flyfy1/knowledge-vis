'use strict';
// Binary search lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every interval, count and readout on the page is computed here; tests/core.cjs pins the claims.
// One "comparison" = looking at one element and learning <, = or > (one loop iteration).
(function (root) {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- step 0: guess a number in 1..100 ---------- */
  const G = { lo: 1, hi: 100 };
  const secret = seed => 1 + Math.floor(mulberry32(seed * 7 + 3)() * 100);
  // Apply one guess to the candidate range [lo, hi]; returns the new range and the answer.
  function answer(range, s, g) {
    if (g === s) return { lo: g, hi: g, ans: 'hit' };
    if (g < s) return { lo: Math.max(range.lo, g + 1), hi: range.hi, ans: 'higher' };
    return { lo: range.lo, hi: Math.min(range.hi, g - 1), ans: 'lower' };
  }
  const midGuess = r => Math.floor((r.lo + r.hi) / 2);
  // Questions the halving strategy needs for secret s (guess the middle every time).
  function halvingRun(s, range = G) {
    let r = { lo: range.lo, hi: range.hi }; const guesses = [];
    for (;;) { const g = midGuess(r); guesses.push(g); const a = answer(r, s, g); if (a.ans === 'hit') return guesses; r = a; }
  }
  // Worst-case questions for n candidates: ⌊log₂ n⌋ + 1.
  const worstQuestions = n => Math.floor(Math.log2(n)) + 1;

  /* ---------- step 1: binary search in a sorted array (closed interval [lo, hi]) ---------- */
  const ARR = (() => { const r = mulberry32(21), out = new Set(); while (out.size < 24) out.add(2 + Math.floor(r() * 97)); return [...out].sort((a, b) => a - b); })();
  // variant: 'ok' | 'loMid' (lo = mid, can loop) | 'ltHi' (while lo < hi, misses) | 'hiMid' (hi = mid, can loop)
  function search(a, x, variant = 'ok', cap = 64) {
    let lo = 0, hi = a.length - 1; const steps = [], seen = new Set();
    for (;;) {
      const cont = variant === 'ltHi' ? lo < hi : lo <= hi;
      if (!cont) return { steps, found: -1, loop: false, lo, hi };
      const key = lo + ',' + hi;
      if (seen.has(key) || steps.length >= cap) return { steps, found: -1, loop: true, lo, hi };
      seen.add(key);
      const mid = Math.floor((lo + hi) / 2), v = a[mid], rel = v === x ? 'eq' : v < x ? 'lt' : 'gt';
      steps.push({ lo, hi, mid, v, rel });
      if (rel === 'eq') return { steps, found: mid, loop: false, lo, hi };
      if (rel === 'lt') lo = variant === 'loMid' ? mid : mid + 1;
      else hi = variant === 'hiMid' ? mid : mid - 1;
    }
  }
  const worstSearch = n => Math.floor(Math.log2(n)) + 1;
  // Exhaustive check over every present target and every gap: max and mean comparisons.
  function profile(n) {
    const a = Array.from({ length: n }, (_, i) => 2 * i + 1); let max = 0, sumHit = 0, maxMiss = 0;
    for (let i = 0; i < n; i++) { const c = search(a, a[i]).steps.length; max = Math.max(max, c); sumHit += c; }
    for (let i = 0; i <= n; i++) maxMiss = Math.max(maxMiss, search(a, 2 * i).steps.length);
    return { max, meanHit: sumHit / n, maxMiss };
  }

  /* ---------- step 3: four versions on a small array ---------- */
  const SMALL = [10, 20, 30, 40, 50, 60, 70, 80];
  const TARGETS = Array.from({ length: 17 }, (_, i) => 5 + 5 * i); // 5, 10, …, 85
  const VARIANTS = ['ok', 'loMid', 'ltHi', 'hiMid'];
  // Outcome for each target: 'right' (correct answer), 'wrong' (says absent but present, or vice versa), 'loop'.
  function grade(variant) {
    return TARGETS.map(x => {
      const r = search(SMALL, x, variant), truth = SMALL.indexOf(x);
      if (r.loop) return 'loop';
      return r.found === truth ? 'right' : 'wrong';
    });
  }

  /* ---------- step 4: duplicates — first position ≥ x and first position > x (half-open [lo, hi)) ---------- */
  const DUP = [2, 4, 4, 4, 7, 9, 9, 12, 15, 15, 15, 15, 18, 21, 21, 25];
  function bound(a, x, strict) { // strict=false: first i with a[i] ≥ x; strict=true: first i with a[i] > x
    let lo = 0, hi = a.length; const steps = [];
    while (lo < hi) { const mid = (lo + hi) >> 1, go = strict ? a[mid] <= x : a[mid] < x; steps.push({ lo, hi, mid }); if (go) lo = mid + 1; else hi = mid; }
    return { idx: lo, steps };
  }

  /* ---------- step 5: bisection on a yes/no question: smallest x ≥ 0 with x² ≥ c ---------- */
  function bisect(c, K) {
    let lo = 0, hi = Math.max(1, c); const rows = [{ lo, hi }];
    for (let k = 0; k < K; k++) { const m = (lo + hi) / 2; if (m * m >= c) hi = m; else lo = m; rows.push({ lo, hi }); }
    return rows;
  }
  // Decimal digits pinned down when the interval has width w: how many digits after the point lo and hi share.
  function sharedDigits(lo, hi) { for (let d = 0; d <= 15; d++) { const f = Math.pow(10, d); if (Math.floor(lo * f) !== Math.floor(hi * f)) return d - 1; } return 15; }

  const api = { mulberry32, G, secret, answer, midGuess, halvingRun, worstQuestions, ARR, search, worstSearch, profile, SMALL, TARGETS, VARIANTS, grade, DUP, bound, bisect, sharedDigits };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
