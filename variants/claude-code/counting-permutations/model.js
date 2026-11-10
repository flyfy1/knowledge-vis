'use strict';
// Permutations & combinations lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, list and probability on the page is computed here; tests/core.cjs pins the claims.
// All counts used on the page stay below 2^53, so plain numbers are exact.
(function (root) {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  // A(n, k): ordered selections of k from n = n(n−1)…(n−k+1) = n!/(n−k)!
  const perm = (n, k) => { if (k < 0 || k > n) return 0; let p = 1; for (let i = 0; i < k; i++) p *= n - i; return p; };
  // C(n, k): unordered selections = A(n, k)/k!
  const comb = (n, k) => { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return Math.round(c); };
  const factors = (n, k) => Array.from({ length: k }, (_, i) => n - i);   // n, n−1, …, n−k+1

  // Step 0: every route through three legs with a, b, c roads, as [i, j, l] (1-based road numbers).
  function routes(a, b, c) { const out = []; for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) for (let l = 1; l <= c; l++) out.push([i, j, l]); return out; }

  // Ordered selections of k items from 0..n−1, in lexicographic order; k = n gives all arrangements.
  function orderedPicks(n, k) {
    const out = [], used = new Array(n).fill(false), cur = [];
    (function rec() { if (cur.length === k) { out.push(cur.slice()); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; cur.push(i); rec(); cur.pop(); used[i] = false; } })();
    return out;
  }
  const setKey = pick => pick.slice().sort((x, y) => x - y).join(',');
  // Group ordered picks by the set of people chosen: one row per set, k! orderings in each.
  function groupBySet(n, k) {
    const picks = orderedPicks(n, k), rows = new Map();
    picks.forEach((p, i) => { const key = setKey(p); if (!rows.has(key)) rows.set(key, []); rows.get(key).push(i); });
    return { picks, rows: [...rows.entries()].map(([key, idx]) => ({ key, idx })) };
  }

  // Step 4: does the order matter? Each scenario: choose k from n; ordered → A(n, k), else C(n, k).
  const SCENARIOS = [
    { id: 'officers', n: 10, k: 2, ordered: true },
    { id: 'delegates', n: 10, k: 2, ordered: false },
    { id: 'league', n: 5, k: 2, ordered: false },
    { id: 'homeAway', n: 5, k: 2, ordered: true },
    { id: 'podium', n: 8, k: 3, ordered: true },
    { id: 'hand', n: 52, k: 5, ordered: false }
  ];
  const answer = s => (s.ordered ? perm(s.n, s.k) : comb(s.n, s.k));

  // Step 5: birthdays. 365 equally likely days, independent people.
  const DAYS = 365;
  function allDifferent(n) { let q = 1; for (let i = 0; i < n; i++) q *= (DAYS - i) / DAYS; return q; }
  const shared = n => 1 - allDifferent(n);
  const firstAbove = target => { for (let n = 1; n <= DAYS + 1; n++) if (shared(n) > target) return n; return null; };
  // Simulate `rooms` classes of n people; returns how many classes had at least one shared birthday.
  function simulateRooms(n, rooms, seed) {
    const r = mulberry32(seed), seen = new Uint8Array(DAYS); let hits = 0;
    for (let q = 0; q < rooms; q++) {
      seen.fill(0); let hit = false;
      for (let i = 0; i < n; i++) { const d = Math.floor(r() * DAYS); if (seen[d]) { hit = true; } seen[d] = 1; }
      if (hit) hits++;
    }
    return hits;
  }

  const api = { mulberry32, fact, perm, comb, factors, routes, orderedPicks, setKey, groupBySet, SCENARIOS, answer, DAYS, allDifferent, shared, firstAbove, simulateRooms };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
