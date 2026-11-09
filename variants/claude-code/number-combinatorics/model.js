'use strict';
// Number theory & counting model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number on the page comes from here; tests/core.cjs pins the claims the text makes.
// Scope: positive integers in the slider ranges below; exact integer arithmetic (all values < 2^31).
(function (root) {
  const RANGE = { n0: [2, 400], n1: [2, 400], euclid: [6, 120], lamp: [2, 24], gridR: [1, 6], gridU: [1, 5], pool: [3, 6], pick: [1, 3] };

  const isPrime = n => { if (n < 2) return false; for (let p = 2; p * p <= n; p++) if (n % p === 0) return false; return true; };

  // Prime factorisation as [[p, e], ...] with p increasing.
  function factorize(n) {
    const out = []; let m = n;
    for (let p = 2; p * p <= m; p++) if (m % p === 0) { let e = 0; while (m % p === 0) { m /= p; e++; } out.push([p, e]); }
    if (m > 1) out.push([m, 1]);
    return out;
  }
  const leavesOf = n => factorize(n).flatMap(([p, e]) => new Array(e).fill(p));

  // Factor pairs a × b = n with 1 < a ≤ b: the possible first cuts of a factor tree.
  function splits(n) { const out = []; for (let a = 2; a * a <= n; a++) if (n % a === 0) out.push([a, n / a]); return out; }

  // A factor tree whose root is cut by splits(n)[choice]; every lower node is cut into the pair closest
  // to its square root (a different rule from the root, so trees really differ from one choice to the next).
  function factorTree(n, choice = 0) {
    const build = (m, pick) => {
      const s = splits(m);
      if (!s.length) return { v: m, prime: true, kids: [] };
      const [a, b] = pick === null ? s[s.length - 1] : s[pick % s.length];
      return { v: m, prime: false, kids: [build(a, null), build(b, null)] };
    };
    return build(n, choice);
  }
  function treeLeaves(node) { return node.kids.length ? node.kids.flatMap(treeLeaves) : [node.v]; }
  function treeDepth(node) { return node.kids.length ? 1 + Math.max(...node.kids.map(treeDepth)) : 0; }

  function divisors(n) { const out = []; for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d); return out; }
  const divisorCount = n => factorize(n).reduce((s, [, e]) => s * (e + 1), 1);

  // The divisor table of step 1: rows = powers of the smallest prime p (p^0..p^a), columns = divisors of
  // the rest m = n / p^a. Every cell p^i · c is a divisor of n, and every divisor appears exactly once.
  function divisorTable(n) {
    const f = factorize(n), [p, a] = f[0], rest = n / Math.pow(p, a);
    const cols = divisors(rest), rows = Array.from({ length: a + 1 }, (_, i) => Math.pow(p, i));
    return { p, a, rest, rows, cols, cells: rows.map(r => cols.map(c => r * c)) };
  }
  const isSquare = n => Number.isInteger(Math.sqrt(n));

  const gcdBrute = (a, b) => { let g = 1; for (let d = 1; d <= Math.min(a, b); d++) if (a % d === 0 && b % d === 0) g = d; return g; };
  // Euclid's algorithm: each row a = q·b + r; the square-cutting picture removes q squares of side b.
  function euclid(a, b) {
    let x = Math.max(a, b), y = Math.min(a, b); const rows = [];
    while (y > 0) { const q = Math.floor(x / y), r = x % y; rows.push({ a: x, b: y, q, r }); x = y; y = r; }
    return { rows, gcd: x, steps: rows.length, squares: rows.reduce((s, q) => s + q.q, 0) };
  }
  const gcd = (a, b) => euclid(a, b).gcd;
  const lcm = (a, b) => a / gcd(a, b) * b;
  // gcd/lcm read from the prime exponents: min exponent for gcd, max exponent for lcm.
  function exponentView(a, b) {
    const fa = new Map(factorize(a)), fb = new Map(factorize(b));
    const primes = [...new Set([...fa.keys(), ...fb.keys()])].sort((x, y) => x - y);
    const rows = primes.map(p => ({ p, ea: fa.get(p) || 0, eb: fb.get(p) || 0 }));
    const prod = pick => rows.reduce((s, r) => s * Math.pow(r.p, pick(r.ea, r.eb)), 1);
    return { rows, gcd: prod(Math.min), lcm: prod(Math.max) };
  }

  // Step 3: two lamps flash at multiples of a and b. Flash times on [0, T] and the first common one after 0.
  function lamps(a, b, T) {
    const fa = [], fb = []; for (let t = 0; t <= T; t += a) fa.push(t); for (let t = 0; t <= T; t += b) fb.push(t);
    let first = null; for (let t = 1; t <= a * b; t++) if (t % a === 0 && t % b === 0) { first = t; break; }
    return { fa, fb, first };
  }

  // Counting.
  function choose(n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return Math.round(c); }
  const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1));
  const perm = (n, k) => factorial(n) / factorial(n - k);
  // Paths on an r × u street grid (right/up moves only): ways[i][j] = ways into (i, j) = left + below.
  function pathTable(r, u) {
    const w = Array.from({ length: r + 1 }, () => new Array(u + 1).fill(0));
    for (let i = 0; i <= r; i++) for (let j = 0; j <= u; j++) w[i][j] = (i === 0 || j === 0) ? 1 : w[i - 1][j] + w[i][j - 1];
    return w;
  }
  // Every shortest path as a word of 'R' and 'U', in lexicographic order (R before U).
  function allPaths(r, u) {
    const out = [], rec = (s, i, j) => { if (i === r && j === u) { out.push(s); return; } if (i < r) rec(s + 'R', i + 1, j); if (j < u) rec(s + 'U', i, j + 1); };
    rec('', 0, 0); return out;
  }
  // Step 5: ordered picks of k from the first n letters, grouped by the set they use.
  const LETTERS = 'ABCDEF';
  function subsets(n, k) {
    const out = [], rec = (start, cur) => { if (cur.length === k) { out.push(cur.join('')); return; } for (let i = start; i < n; i++) rec(i + 1, cur.concat(LETTERS[i])); };
    rec(0, []); return out;
  }
  function orderings(set) {
    if (set.length <= 1) return [set];
    const out = []; for (let i = 0; i < set.length; i++) for (const rest of orderings(set.slice(0, i) + set.slice(i + 1))) out.push(set[i] + rest);
    return out;
  }
  function orderedPicks(n, k) {
    const out = [], rec = cur => { if (cur.length === k) { out.push(cur); return; } for (let i = 0; i < n; i++) if (!cur.includes(LETTERS[i])) rec(cur + LETTERS[i]); };
    rec(''); return out;
  }

  // Step 6: transfer check. Deterministic question bank (seeded), answers computed here.
  function mulberry32(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function question(seed) {
    const R = mulberry32(seed * 7919 + 13), pick = (lo, hi) => lo + Math.floor(R() * (hi - lo + 1)), kind = seed % 4;
    if (kind === 0) { const m = Math.pow(2, pick(1, 3)) * Math.pow(3, pick(0, 2)) * Math.pow(5, pick(0, 1)) * (pick(0, 1) ? 7 : 1); return { kind: 'qDiv', n: m, answer: divisorCount(m) }; }
    if (kind === 1) { const g = pick(2, 9), a = g * pick(3, 13); let b = g * pick(2, 11); if (b === a) b += g; return { kind: 'qGcd', a, b, answer: gcd(a, b) }; }
    if (kind === 2) { const a = pick(3, 15), b = pick(4, 18); return { kind: 'qLcm', a, b, answer: lcm(a, b) }; }
    const r = pick(2, 5), u = pick(2, 4); return { kind: 'qPath', r, u, answer: choose(r + u, u) };
  }

  const api = { RANGE, isPrime, factorize, leavesOf, splits, factorTree, treeLeaves, treeDepth, divisors, divisorCount, divisorTable, isSquare, gcdBrute, euclid, gcd, lcm, exponentView, lamps, choose, factorial, perm, pathTable, allPaths, LETTERS, subsets, orderings, orderedPicks, question };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
