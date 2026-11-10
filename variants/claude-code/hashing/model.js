'use strict';
// Hashing model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bit, bucket, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// The teaching hash is 32-bit FNV-1a (not cryptographic), optionally followed by the MurmurHash3 32-bit finaliser.
(function (root) {
  const OFFSET = 2166136261, PRIME = 16777619;
  // Sample inputs offered as buttons in step 0 (data, shown verbatim in both languages).
  const SAMPLES = ['cat', 'cats', 'hello world', '你好，世界', 'The quick brown fox jumps over the lazy dog'];

  function utf8(str) {
    const out = [];
    for (const ch of str) {
      let c = ch.codePointAt(0);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  // FNV-1a over bytes; trace[i] = state after byte i (trace has one entry per byte).
  function fnv1a(bytes, withTrace = false) {
    let h = OFFSET >>> 0; const trace = [];
    for (const b of bytes) { h ^= b; h = Math.imul(h, PRIME) >>> 0; if (withTrace) trace.push(h); }
    return withTrace ? { h, trace } : h;
  }
  // MurmurHash3 fmix32: spreads every input bit over all output bits (a bijection on 32-bit words).
  function fmix32(h) {
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16; return h >>> 0;
  }
  const mixed = bytes => fmix32(fnv1a(bytes));
  const hashStr = (s, kind = 'mixed') => (kind === 'fnv' ? fnv1a(utf8(s)) : kind === 'sum' ? utf8(s).reduce((a, b) => a + b, 0) : mixed(utf8(s)));
  const hex = h => (h >>> 0).toString(16).padStart(8, '0');
  const bits = h => { const a = []; for (let i = 31; i >= 0; i--) a.push((h >>> i) & 1); return a; }; // MSB first
  const popcount = x => { x >>>= 0; let c = 0; while (x) { x &= x - 1; c++; } return c; };

  /* ---------- step 1: avalanche ---------- */
  // Flip each input bit once; record how many output bits change and how often each output bit changes.
  function avalanche(bytes, fn) {
    const base = fn(bytes), N = bytes.length * 8, perBit = new Array(32).fill(0), flips = [];
    for (let i = 0; i < N; i++) {
      const b2 = bytes.slice(); b2[i >> 3] ^= 1 << (i & 7);
      const d = (base ^ fn(b2)) >>> 0; flips.push(popcount(d));
      for (let k = 0; k < 32; k++) if ((d >>> k) & 1) perBit[k]++;
    }
    const mean = flips.reduce((a, b) => a + b, 0) / Math.max(1, N);
    return { base, N, flips, mean, min: Math.min(...flips), max: Math.max(...flips), perBitFrac: perBit.map(c => c / Math.max(1, N)) };
  }
  const flipBit = (bytes, i) => { const b2 = bytes.slice(); b2[i >> 3] ^= 1 << (i & 7); return b2; };

  /* ---------- step 2: hash table with chaining ---------- */
  const KEYS = Array.from({ length: 200 }, (_, i) => 'item-' + i);
  function table(n, m, kind) {
    const buckets = Array.from({ length: m }, () => []);
    for (let i = 0; i < n; i++) { const k = KEYS[i]; buckets[hashStr(k, kind) % m].push(k); }
    const lens = buckets.map(b => b.length);
    const empty = lens.filter(l => l === 0).length, longest = Math.max(...lens);
    // successful lookup: a key at position j (1-based) in its chain costs j probes
    const probes = n ? lens.reduce((s, l) => s + l * (l + 1) / 2, 0) / n : 0;
    const hist = new Array(longest + 1).fill(0); lens.forEach(l => hist[l]++);
    return { buckets, lens, empty, longest, probes, hist, alpha: n / m };
  }
  // Expected values for a uniformly random hash (each key independently uniform over m buckets).
  function poissonBins(n, m, kmax) { const a = n / m, out = []; let p = Math.exp(-a); for (let k = 0; k <= kmax; k++) { out.push(m * p); p *= a / (k + 1); } return out; }
  const expectEmpty = (n, m) => m * Math.pow(1 - 1 / m, n);
  const expectProbes = (n, m) => 1 + (n - 1) / (2 * m);

  /* ---------- step 3: birthday collisions ---------- */
  // P(at least one repeat among k values drawn uniformly from d) = 1 − Π_{i<k} (1 − i/d).
  function pCollide(k, d) { let q = 1; for (let i = 1; i < k; i++) q *= 1 - i / d; return 1 - q; }
  function k50(d) { let k = 1; while (pCollide(k, d) < 0.5) k++; return k; }
  // One trial: hash "t<trial>-<j>" for j = 0, 1, …, keep the top b bits, stop at the first repeat. Returns how many keys were inserted.
  function firstCollision(trial, b) {
    const seen = new Set();
    for (let j = 0; ; j++) { const v = mixed(utf8('t' + trial + '-' + j)) >>> (32 - b); if (seen.has(v)) return j + 1; seen.add(v); }
  }

  /* ---------- step 4: how many bits ---------- */
  // P(any collision among N fingerprints of b bits) ≈ 1 − exp(−N(N−1)/2 / 2^b) (birthday approximation, accurate when N ≪ 2^b or P near 1).
  function pAny(N, b) { const lam = N * (N - 1) / 2 / Math.pow(2, b); return -Math.expm1(-lam); }
  // Smallest whole number of bits with P ≤ p.
  function bitsNeeded(N, p) { const lam = -Math.log1p(-p); return Math.ceil(Math.log2(N * (N - 1) / 2 / lam)); }

  const api = { SAMPLES, OFFSET, PRIME, utf8, fnv1a, fmix32, mixed, hashStr, hex, bits, popcount, avalanche, flipBit, KEYS, table, poissonBins, expectEmpty, expectProbes, pCollide, k50, firstCollision, pAny, bitsNeeded };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HASH_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
