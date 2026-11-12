/* A secret in public: every model behind the page, as pure functions (no DOM).
 * Loaded by index.html as window.SecretModels and by tests/models.cjs via require().
 * All arithmetic on keys is exact (BigInt). The toy parameters are tiny on purpose; each section notes the real size.
 * THE CODE HERE IS FOR UNDERSTANDING ONLY. It is not constant-time, has no padding, uses a seeded (predictable) RNG
 * and tiny parameters. Never use it to protect anything.
 * Sources for each model are named next to it and listed in BRIEF.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SecretModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── shared: seeded RNG and BigInt number theory ───────── */
  // mulberry32: small seeded PRNG so every run of the page shows the same numbers (NOT a cryptographic RNG)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const B = x => BigInt(x);
  const mod = (a, m) => { const r = a % m; return r < 0n ? r + m : r; };
  function bitLength(n) { return n <= 0n ? 0 : n.toString(2).length; }
  function popcount(n) { let c = 0; for (const ch of n.toString(2)) if (ch === '1') c++; return c; }
  // right-to-left square-and-multiply (used everywhere; the counted left-to-right version is powTrace below)
  function modPow(b, e, m) {
    let r = 1n; b = mod(b, m);
    while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; }
    return r;
  }
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; }
  // extended Euclid: returns [g, x, y] with a·x + b·y = g
  function egcd(a, b) { let [r0, r1, s0, s1, t0, t1] = [a, b, 1n, 0n, 0n, 1n]; while (r1) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; [t0, t1] = [t1, t0 - q * t1]; } return [r0, s0, t0]; }
  function modInv(a, m) { const [g, x] = egcd(mod(a, m), m); if (g !== 1n) return null; return mod(x, m); }
  const SMALL = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  // Miller–Rabin. With the first 12 prime bases it is deterministic below 3.3·10^24 (Sorenson & Webster 2015);
  // above that, 12 extra seeded random bases make an error astronomically unlikely (not a proof).
  function isPrime(n) {
    n = B(n); if (n < 2n) return false;
    for (const p of SMALL) { const P = B(p); if (n === P) return true; if (n % P === 0n) return false; }
    let d = n - 1n, s = 0; while (!(d & 1n)) { d >>= 1n; s++; }
    const bases = SMALL.slice(0, 12).map(B);
    if (n >= 3317044064679887385961981n) { const r = rng(Number(n % 2147483647n)); for (let i = 0; i < 12; i++) bases.push(2n + randBelow(n - 4n, r)); }
    outer: for (const a of bases) {
      let x = modPow(a, d, n); if (x === 1n || x === n - 1n) continue;
      for (let i = 1; i < s; i++) { x = x * x % n; if (x === n - 1n) continue outer; }
      return false;
    }
    return true;
  }
  function randBits(bits, r) { let x = 0n; for (let i = 0; i < bits; i += 16) x = (x << 16n) | B(Math.floor(r() * 65536)); return x & ((1n << B(bits)) - 1n); }
  function randBelow(n, r) { const b = bitLength(n) + 16; return randBits(b, r) % n; }
  // a random prime of exactly `bits` bits, optionally with p % m === res (seeded)
  function randomPrime(bits, r, m, res) {
    for (;;) {
      let p = randBits(bits, r) | (1n << B(bits - 1)) | 1n;
      if (m && p % B(m) !== B(res)) continue;
      if (isPrime(p)) return p;
    }
  }
  // integer k-th root by Newton's method (floor)
  function iroot(n, k) {
    if (n < 2n) return n; const K = B(k);
    let x = 1n << B(Math.ceil(bitLength(n) / k) + 1);
    for (;;) { const y = ((K - 1n) * x + n / (x ** (K - 1n))) / K; if (y >= x) break; x = y; }
    while (x ** K > n) x--; while ((x + 1n) ** K <= n) x++;
    return x;
  }
  // text ⇄ integer (big-endian bytes, ASCII/UTF-8)
  function textToInt(s) { let x = 0n; for (const b of new TextEncoder().encode(s)) x = (x << 8n) | B(b); return x; }
  function intToText(x) { const bytes = []; while (x > 0n) { bytes.unshift(Number(x & 255n)); x >>= 8n; } try { return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes)); } catch (e) { return null; } }

  /* ───────── ch1 · the key-distribution problem ─────────
   * n people who each want a private line to every other person: with shared (symmetric) keys every pair needs
   * its own key, C(n,2) = n(n−1)/2; with public-key cryptography each person publishes one key pair: n. */
  const keys = {
    pairs: n => n * (n - 1) / 2,
    joinCost: n => n,        // the (n+1)-th person needs n new shared keys, one with each existing member
    publicPairs: n => n
  };

  /* ───────── ch2 · one-way functions: modular exponentiation vs discrete logarithm ─────────
   * Forward: left-to-right binary exponentiation (Knuth TAOCP vol. 2 §4.6.3): bitlen−1 squarings and
   * popcount−1 multiplications. Backward: brute force (try 1, 2, 3, …) and Shanks's baby-step giant-step
   * (Menezes, van Oorschot, Vanstone, Handbook of Applied Cryptography, Alg. 3.56), run for real. */
  function powTrace(g, x, p) {
    g = B(g); x = B(x); p = B(p);
    const bits = x.toString(2), rows = [];
    let r = g % p; rows.push({ bit: '1', op: 'start', v: r });
    for (let i = 1; i < bits.length; i++) {
      r = r * r % p; rows.push({ bit: bits[i], op: 'sq', v: r });
      if (bits[i] === '1') { r = r * g % p; rows.push({ bit: bits[i], op: 'mul', v: r }); }
    }
    return { rows, value: r, squarings: bits.length - 1, mults: popcount(x) - 1, total: bits.length - 1 + popcount(x) - 1 };
  }
  // the largest safe prime p < 2^bits (p = 2q + 1 with q prime); g = 4 generates the subgroup of order q
  const safeCache = {};
  function safePrimeBelow(bits) {
    if (safeCache[bits]) return safeCache[bits];
    let p = (1n << B(bits)) - 1n; p -= mod(p - 11n, 12n); // safe primes > 7 are 11 mod 12
    for (; p > 7n; p -= 12n) {
      const q = (p - 1n) / 2n;
      let bad = false; for (const s of SMALL) { const S = B(s); if ((q % S === 0n && q !== S) || (p % S === 0n && p !== S)) { bad = true; break; } }
      if (bad) continue;
      if (isPrime(q) && isPrime(p)) return (safeCache[bits] = { p, q, g: 4n, bits });
    }
    return null;
  }
  // one discrete-log instance per prime size, with a seeded secret exponent x in [1, q−1]
  function dlogInstance(bits, seed) {
    const G = safePrimeBelow(bits), r = rng(seed * 7919 + bits);
    const x = 1n + randBelow(G.q - 1n, r);
    return { p: G.p, q: G.q, g: G.g, x, h: modPow(G.g, x, G.p), bits };
  }
  // brute force: γ = g, g², g³, … until γ = h. It needs exactly x multiplications. Resumable in slices.
  function bruteStart(I) { return { I, k: 1n, y: I.g % I.p, done: I.g % I.p === I.h, steps: 1 }; }
  function bruteRun(s, budget) {
    const { p, g, h } = s.I;
    let y = s.y, k = s.k, n = 0;
    while (!s.done && n < budget) { y = y * g % p; k++; n++; if (y === h) s.done = true; }
    s.y = y; s.k = k; s.steps = Number(k);
    return s;
  }
  // baby-step giant-step in the order-q subgroup: m = ⌈√q⌉ baby steps, then giant steps of g^(−m).
  // steps = baby-table entries + giant steps taken (group multiplications, not counting one inversion).
  function bsgs(I) {
    const { p, q, g, h } = I;
    const m = iroot(q - 1n, 2) + 1n, M = Number(m), table = new Map();
    let e = 1n;
    for (let j = 0; j < M; j++) { if (!table.has(e)) table.set(e, j); e = e * g % p; }
    const gm = modPow(modInv(g, p), m, p);
    let y = h;
    for (let i = 0; i <= M; i++) {
      const j = table.get(y);
      if (j !== undefined) { const x = mod(B(i) * m + B(j), q); return { x, steps: M + i, m: M }; }
      y = y * gm % p;
    }
    return { x: null, steps: 2 * M, m: M };
  }
  // log2 of the expected work of each method in a group of order q ≈ 2^(bits−1)
  const race = {
    forwardMax: bits => 2 * (bits - 1),                 // worst case for a (bits−1)-bit exponent
    bruteExpectedLog2: bits => (bits - 1) - 1,          // q/2 on average
    bsgsLog2: bits => 1 + (bits - 1) / 2                // at most 2·√q
  };

  /* ───────── ch3 · Diffie–Hellman (Diffie & Hellman 1976, IEEE Trans. Inf. Theory 22(6)) ───────── */
  const DH_BITS = 11;
  function dh(a, b) {
    const G = safePrimeBelow(DH_BITS), { p, g } = G; a = B(a); b = B(b);
    const A = modPow(g, a, p), Bv = modPow(g, b, p);
    return { p, q: G.q, g, a, b, A, B: Bv, sA: modPow(Bv, a, p), sB: modPow(A, b, p) };
  }
  // the eavesdropper sees p, g, A, B; she solves one discrete log (BSGS) and recomputes the secret
  function eve(x) { const I = { p: x.p, q: x.q, g: x.g, h: x.A }; const r = bsgs(I); return { a: r.x, steps: r.steps, s: modPow(x.B, r.x, x.p) }; }
  // man in the middle: Mallory swaps A and B for her own g^m1, g^m2 and ends up with one key per side
  function mitm(x, m1, m2) {
    const M1 = modPow(x.g, B(m1), x.p), M2 = modPow(x.g, B(m2), x.p);
    return { M1, M2, kAlice: modPow(M2, x.a, x.p), kBob: modPow(M1, x.b, x.p), kMalA: modPow(x.A, B(m2), x.p), kMalB: modPow(x.B, B(m1), x.p) };
  }

  /* ───────── ch4 · RSA (Rivest, Shamir, Adleman 1978, CACM 21(2)) ───────── */
  function primesBetween(lo, hi) { const out = []; for (let n = lo; n <= hi; n++) { let ok = n > 1; for (let d = 2; d * d <= n; d++) if (n % d === 0) { ok = false; break; } if (ok) out.push(n); } return out; }
  const RSA_PRIMES = primesBetween(101, 997);
  const E_CHOICES = [65537n, 257n, 17n, 5n, 3n, 7n, 11n, 13n];
  function rsaKey(p, q) {
    p = B(p); q = B(q); const n = p * q, phi = (p - 1n) * (q - 1n);
    const e = E_CHOICES.find(e => e < phi && gcd(e, phi) === 1n);
    const d = modInv(e, phi);
    return { p, q, n, phi, e, d };
  }
  const rsaEnc = (k, m) => modPow(B(m), k.e, k.n);
  const rsaDec = (k, c) => modPow(B(c), k.d, k.n);
  const rsaSign = (k, m) => modPow(B(m), k.d, k.n);
  const rsaVerify = (k, m, s) => modPow(B(s), k.e, k.n) === mod(B(m), k.n);
  // malleability of textbook RSA: (c · t^e)^d = m · t (mod n)
  const rsaScale = (k, c, t) => c * modPow(B(t), k.e, k.n) % k.n;
  // trial division: the eavesdropper's honest first try. Returns the divisor found and the count of divisions.
  function trialDivide(n) { n = B(n); let tries = 0; if (n % 2n === 0n) return { f: 2n, tries: 1 }; for (let d = 3n; d * d <= n; d += 2n) { tries++; if (n % d === 0n) return { f: d, tries }; } return { f: n, tries }; }
  // a 512-bit RSA key with e = 3 (both primes ≡ 2 mod 3), for the cube-root attack on unpadded short messages
  let big3 = null;
  function rsaBig3() {
    if (big3) return big3;
    const r = rng(20261111); const p = randomPrime(256, r, 3, 2); let q; do q = randomPrime(256, r, 3, 2); while (q === p);
    const n = p * q, phi = (p - 1n) * (q - 1n);
    return (big3 = { p, q, n, phi, e: 3n, d: modInv(3n, phi) });
  }
  // cube-root attack (Coppersmith/Håstad family; the trivial case: m^3 < n, so the "mod n" never wraps)
  function cubeRootAttack(k, c) { const r = iroot(c, 3); return { m: r, exact: r ** 3n === c }; }
  // a random-padded message (a stand-in for real padding: the integer now fills most of n's bits)
  function padRandom(m, k, seed) { const r = rng(seed); const pad = randBits(bitLength(k.n) - 24, r) | (1n << B(bitLength(k.n) - 25)); return ((pad >> 136n) << 136n) | m; }

  /* ───────── ch5 · elliptic curves (Silverman, The Arithmetic of Elliptic Curves, ch. III; Hasse bound) ───────── */
  // over the real numbers: y² = x³ + a x + b
  const ecR = {
    rhs: (x, a, b) => x * x * x + a * x + b,
    // P + Q by the chord-and-tangent rule; null = the point at infinity
    add(P, Q, a) {
      if (!P) return Q; if (!Q) return P;
      let s;
      if (Math.abs(P.x - Q.x) < 1e-9) { if (Math.abs(P.y + Q.y) < 1e-9) return null; s = (3 * P.x * P.x + a) / (2 * P.y); }
      else s = (Q.y - P.y) / (Q.x - P.x);
      const x = s * s - P.x - Q.x, y = s * (P.x - x) - P.y;
      return { x, y, s };
    },
    // the leftmost real root of x³ + ax + b (one real component when the discriminant is positive)
    root(a, b) { let lo = -10, hi = 10; const f = x => ecR.rhs(x, a, b); for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; } return (lo + hi) / 2; }
  };
  // over the field F_p: same formulas with division replaced by the modular inverse
  const EC_A = 2, EC_B = 3;
  const EC_PRIMES = primesBetween(13, 251).filter(p => mod(4n * B(EC_A) ** 3n + 27n * B(EC_B) ** 2n, B(p)) !== 0n);
  function ecPoints(p, a = EC_A, b = EC_B) {
    const sq = new Map(); for (let y = 0; y < p; y++) { const s = (y * y) % p; if (!sq.has(s)) sq.set(s, []); sq.get(s).push(y); }
    const pts = [];
    for (let x = 0; x < p; x++) { const r = ((x * x * x + a * x + b) % p + p) % p; for (const y of (sq.get(r) || [])) pts.push({ x, y }); }
    return pts; // affine points; the group has pts.length + 1 elements (plus the point at infinity)
  }
  function ecAdd(P, Q, p, a = EC_A) {
    if (!P) return Q; if (!Q) return P;
    let s;
    if (P.x === Q.x) { if ((P.y + Q.y) % p === 0) return null; s = (3 * P.x * P.x + a) * Number(modInv(B(2 * P.y), B(p))); }
    else s = (Q.y - P.y) * Number(modInv(B(((Q.x - P.x) % p + p) % p), B(p)));
    s = ((s % p) + p) % p;
    const x = ((s * s - P.x - Q.x) % p + 2 * p) % p, y = ((s * (P.x - x) - P.y) % p + 2 * p * p) % p;
    return { x, y };
  }
  // k·P by double-and-add, counting group operations
  function ecMul(k, P, p) { let R = null, D = P, ops = 0; while (k > 0) { if (k & 1) { R = ecAdd(R, D, p); ops++; } k >>= 1; if (k) { D = ecAdd(D, D, p); ops++; } } return { R, ops }; }
  function ecOrder(P, p) { let Q = P, k = 1; while (Q) { Q = ecAdd(Q, P, p); k++; if (k > 4 * p + 10) return null; } return k; }
  // the base point used on the page: the point of largest order (first by x, then y)
  function ecGroup(p) {
    const pts = ecPoints(p), N = pts.length + 1;
    let best = null, bo = 0; for (const P of pts) { const o = ecOrder(P, p); if (o > bo) { bo = o; best = P; } if (o === N) break; }
    return { p, pts, N, G: best, order: bo, hasse: 2 * Math.sqrt(p) };
  }
  // multiples G, 2G, … , kG (for drawing the jumps)
  function ecMultiples(G, k, p) { const out = []; let Q = null; for (let i = 1; i <= k; i++) { Q = ecAdd(Q, G, p); out.push(Q); } return out; }
  // NIST SP 800-57 Part 1 Rev. 5 (2020), Table 2: comparable security strengths
  const NIST_TABLE = [
    { s: 80, rsa: 1024, ecc: 160 }, { s: 112, rsa: 2048, ecc: 224 }, { s: 128, rsa: 3072, ecc: 256 },
    { s: 192, rsa: 7680, ecc: 384 }, { s: 256, rsa: 15360, ecc: 512 }
  ];

  /* ───────── ch6 · hash-then-sign and a chain of certificates ─────────
   * SHA-256 per FIPS 180-4; textbook RSA signature s = H(m)^d mod n on 512-bit toy keys. */
  const K256 = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function sha256(str) {
    const msg = new TextEncoder().encode(str), l = msg.length, nb = ((l + 9 + 63) >> 6) << 6, buf = new Uint8Array(nb);
    buf.set(msg); buf[l] = 0x80; const bl = l * 8; for (let i = 0; i < 8; i++) buf[nb - 1 - i] = Math.floor(bl / Math.pow(2, 8 * i)) & 255;
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], W = new Array(64);
    const rot = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < nb; o += 64) {
      for (let t = 0; t < 16; t++) W[t] = (buf[o + 4 * t] << 24) | (buf[o + 4 * t + 1] << 16) | (buf[o + 4 * t + 2] << 8) | buf[o + 4 * t + 3];
      for (let t = 16; t < 64; t++) { const s0 = rot(W[t - 15], 7) ^ rot(W[t - 15], 18) ^ (W[t - 15] >>> 3), s1 = rot(W[t - 2], 17) ^ rot(W[t - 2], 19) ^ (W[t - 2] >>> 10); W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0; }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = rot(e, 6) ^ rot(e, 11) ^ rot(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K256[t] + W[t]) | 0;
        const S0 = rot(a, 2) ^ rot(a, 13) ^ rot(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const hashInt = (s, n) => BigInt('0x' + sha256(s)) % n;
  const keyCache = {};
  function rsaKeyBits(bits, seed) { // a seeded toy RSA key of `bits` bits, e = 65537
    const id = bits + ':' + seed; if (keyCache[id]) return keyCache[id];
    const r = rng(seed); for (;;) { const p = randomPrime(bits / 2, r), q = randomPrime(bits / 2, r); if (p === q) continue; const phi = (p - 1n) * (q - 1n); if (gcd(65537n, phi) !== 1n) continue; const n = p * q; return (keyCache[id] = { p, q, n, phi, e: 65537n, d: modInv(65537n, phi), bits }); }
  }
  // certificate = the text that is signed: subject name, subject's public key, issuer name
  const certBody = c => `subject=${c.subject};n=${c.n.toString(16)};e=${c.e};issuer=${c.issuer}`;
  const signCert = (body, k) => modPow(hashInt(body, k.n), k.d, k.n);
  const verifyCert = (body, sig, n, e) => modPow(sig, e, n) === hashInt(body, n);
  // the page's chain: root CA (in the browser's trust store) → intermediate → site; plus Mallory's own key
  function chain(tamper) {
    const root = rsaKeyBits(512, 101), inter = rsaKeyBits(512, 202), site = rsaKeyBits(512, 303), mal = rsaKeyBits(512, 404);
    const certs = [
      { id: 'root', subject: 'Toy Root CA', issuer: 'Toy Root CA', n: root.n, e: root.e, signer: root },
      { id: 'inter', subject: 'Toy Intermediate CA', issuer: 'Toy Root CA', n: inter.n, e: inter.e, signer: root },
      { id: 'site', subject: 'shop.example', issuer: 'Toy Intermediate CA', n: site.n, e: site.e, signer: inter }
    ];
    for (const c of certs) c.sig = signCert(certBody(c), c.signer); // issued honestly
    // what the attacker changes after issuance
    if (tamper === 'name') certs[2].subject = 'bank.example';
    if (tamper === 'key') { certs[2].n = mal.n; certs[2].e = mal.e; }
    if (tamper === 'resign') { certs[2].n = mal.n; certs[2].e = mal.e; certs[2].sig = signCert(certBody(certs[2]), mal); }
    if (tamper === 'selfroot') { // Mallory makes her own "root" and signs everything with it
      certs[0].n = mal.n; certs[0].e = mal.e; certs[0].subject = 'Toy Root CA';
      certs[0].sig = signCert(certBody(certs[0]), mal); certs[1].sig = signCert(certBody(certs[1]), mal);
    }
    const trusted = { n: root.n, e: root.e }; // the browser's trust store holds the real root key
    const links = certs.map((c, i) => {
      const issuerKey = i === 0 ? { n: c.n, e: c.e } : { n: certs[i - 1].n, e: certs[i - 1].e };
      return { id: c.id, hash: sha256(certBody(c)), sigOk: verifyCert(certBody(c), c.sig, issuerKey.n, issuerKey.e) };
    });
    const rootTrusted = certs[0].n === trusted.n;
    return { certs, links, rootTrusted, ok: rootTrusted && links.every(l => l.sigOk) };
  }

  /* ───────── ch7 · what "secure" means: best-known attack cost ─────────
   * General number field sieve heuristic L_n[1/3, (64/9)^(1/3)] (Lenstra & Lenstra 1993; Crandall & Pomerance,
   * Prime Numbers §6.2) with the o(1) term dropped — that is the usual rough estimate, not a precise cost.
   * Pollard rho on an elliptic curve group of order ≈ 2^f: √(π·2^f/4) group operations (Pollard 1978). */
  const GNFS_C = Math.cbrt(64 / 9);
  function gnfsLog2(nbits) { const ln = nbits * Math.LN2, lnln = Math.log(ln); return GNFS_C * Math.cbrt(ln) * Math.pow(lnln, 2 / 3) / Math.LN2; }
  const rhoLog2 = fbits => fbits / 2 + Math.log2(Math.sqrt(Math.PI) / 2);
  const SECONDS_PER_YEAR = 365.25 * 24 * 3600;
  const yearsLog10 = (log2ops, rate) => log2ops * Math.LOG10E * Math.LN2 - Math.log10(rate) - Math.log10(SECONDS_PER_YEAR);
  // public records for factoring and finite-field discrete logs (bits, year); sources in BRIEF.md
  const RECORDS = [
    { id: 'rsa768', kind: 'fact', bits: 768, year: 2009 },
    { id: 'dlp795', kind: 'dlp', bits: 795, year: 2019 },
    { id: 'rsa250', kind: 'fact', bits: 829, year: 2020 },
    { id: 'rsa260', kind: 'fact', bits: 862, year: 2026 },
    { id: 'rsa896', kind: 'fact', bits: 896, year: 2026 }
  ];

  /* ───────── ch8 · the quantum threat ─────────
   * Shor 1994/1997 (SIAM J. Comput. 26(5)): factoring N reduces to finding the order r of a random a mod N.
   * A quantum computer finds r with the quantum Fourier transform; here r is found by classical search
   * (the exponentially slow part), and the classical reduction around it is exactly Shor's. */
  function order(a, N) { a = B(a); N = B(N); if (gcd(a, N) !== 1n) return null; let x = a % N, r = 1; while (x !== 1n) { x = x * a % N; r++; if (r > 1e6) return null; } return r; }
  function shorTry(a, N) {
    a = B(a); N = B(N);
    const g0 = gcd(a, N); if (g0 !== 1n) return { kind: 'lucky', f1: g0, f2: N / g0, r: null };
    const r = order(a, N);
    if (r % 2 === 1) return { kind: 'odd', r };
    const y = modPow(a, B(r / 2), N);
    if (y === N - 1n) return { kind: 'minus1', r, y };
    const f1 = gcd(y - 1n, N), f2 = gcd(y + 1n, N);
    return { kind: 'ok', r, y, f1, f2 };
  }
  function shorStats(N) { let ok = 0, tot = 0; for (let a = 2; a < N - 1; a++) { const t = shorTry(a, N); if (t.kind === 'lucky') continue; tot++; if (t.kind === 'ok') ok++; } return { ok, tot, share: ok / tot }; }
  const SHOR_NS = [15, 21, 33, 35, 39, 51, 55, 77, 91, 143, 187, 221, 323, 391, 667, 899, 1147, 3233];
  // Mosca's inequality (Mosca 2015/2018, IEEE Security & Privacy 16(5)): worry if x + y > z
  // x = how long the data must stay secret, y = how long migration takes, z = years until a quantum computer can break it
  const mosca = { exposed: (x, y, z) => Math.max(0, x + y - z), worry: (x, y, z) => x + y > z };
  // Grover (1996): searching 2^k keys takes about (π/4)·2^(k/2) quantum iterations, run one after another
  const groverLog2 = k => k / 2 + Math.log2(Math.PI / 4);

  /* ───────── ch9 · lattices: closest vector with a good and a bad basis; LWE ─────────
   * Babai's rounding (Babai 1986, Combinatorica 6) and Regev's LWE encryption (Regev 2005/2009, J. ACM 56(6)). */
  const LAT_GOOD = [[7, 1], [-2, 6]];
  // the bad basis: the same lattice after k column operations, b1 ← b1 + k·b2 then b2 ← b2 + k·b1 (determinant 1 transform)
  function latBasis(k) { const [g1, g2] = LAT_GOOD; const b1 = [g1[0] + k * g2[0], g1[1] + k * g2[1]]; const b2 = [g2[0] + k * b1[0], g2[1] + k * b1[1]]; return [b1, b2]; }
  const det2 = ([b1, b2]) => b1[0] * b2[1] - b1[1] * b2[0];
  // Babai rounding: write t in the basis, round each coordinate, map back
  function babai(basis, t) {
    const [b1, b2] = basis, D = det2(basis);
    const c1 = (t[0] * b2[1] - t[1] * b2[0]) / D, c2 = (b1[0] * t[1] - b1[1] * t[0]) / D;
    const k1 = Math.round(c1), k2 = Math.round(c2);
    return { k: [k1, k2], v: [k1 * b1[0] + k2 * b2[0], k1 * b1[1] + k2 * b2[1]] };
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  // exact closest vector by enumeration in the good basis around its own rounding (the lattice is the same)
  function cvpExact(t) {
    const g = babai(LAT_GOOD, t); let best = g.v, bd = dist(g.v, t);
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const k1 = g.k[0] + i, k2 = g.k[1] + j; const v = [k1 * LAT_GOOD[0][0] + k2 * LAT_GOOD[1][0], k1 * LAT_GOOD[0][1] + k2 * LAT_GOOD[1][1]]; const d = dist(v, t); if (d < bd - 1e-12) { bd = d; best = v; } }
    return { v: best, d: bd };
  }
  // the page's target points: seed s gives one point in [−20, 20] × [−15, 15]
  function latTarget(seed) { const r = rng(seed * 31); return [r() * 40 - 20, r() * 30 - 15]; }
  // Hadamard ratio (det / product of lengths)^(1/2): 1 for an orthogonal basis, near 0 for a skewed one
  const hadamard = basis => Math.sqrt(Math.abs(det2(basis)) / (Math.hypot(...basis[0]) * Math.hypot(...basis[1])));
  // share of random targets for which Babai rounding finds the true closest point
  function babaiSuccess(k, trials, seed) { const r = rng(seed), basis = latBasis(k); let ok = 0; for (let i = 0; i < trials; i++) { const t = [r() * 60 - 30, r() * 60 - 30]; const e = cvpExact(t); if (Math.abs(dist(babai(basis, t).v, t) - e.d) < 1e-9) ok++; } return ok / trials; }

  // centred binomial noise with parameter η (as in ML-KEM): sum of η coin pairs, values in [−η, η], variance η/2
  function cbd(eta, r) { let s = 0; for (let i = 0; i < eta; i++) s += (r() < 0.5) - (r() < 0.5); return s; }
  const modq = (x, q) => ((x % q) + q) % q;
  // Regev's public-key scheme: secret s ∈ Z_q^n; public (A, b = A s + e) with m rows; bit μ → (u = Aᵀr, v = b·r + μ⌊q/2⌋), r ∈ {0,1}^m
  function lweKeygen(n, m, q, eta, seed, noNoise) {
    const r = rng(seed);
    const s = Array.from({ length: n }, () => Math.floor(r() * q));
    const A = Array.from({ length: m }, () => Array.from({ length: n }, () => Math.floor(r() * q)));
    const e = Array.from({ length: m }, () => noNoise ? 0 : cbd(eta, r));
    const b = A.map((row, i) => modq(row.reduce((acc, a, j) => acc + a * s[j], 0) + e[i], q));
    return { n, m, q, eta, s, A, b, e };
  }
  function lweEnc(K, bit, r) {
    const pick = Array.from({ length: K.m }, () => r() < 0.5 ? 1 : 0);
    const u = Array.from({ length: K.n }, (_, j) => modq(K.A.reduce((acc, row, i) => acc + (pick[i] ? row[j] : 0), 0), K.q));
    const v = modq(K.b.reduce((acc, bi, i) => acc + (pick[i] ? bi : 0), 0) + bit * Math.floor(K.q / 2), K.q);
    const noise = K.e.reduce((acc, ei, i) => acc + (pick[i] ? ei : 0), 0); // known only to the page, for the chart
    return { u, v, noise };
  }
  function lweDec(K, c) { const w = modq(c.v - c.u.reduce((acc, uj, j) => acc + uj * K.s[j], 0), K.q); return (w > K.q / 4 && w < 3 * K.q / 4) ? 1 : 0; }
  // encrypt `trials` random bits; count decryption failures and record the accumulated noise e·r
  function lweTrial(n, m, q, eta, trials, seed) {
    const K = lweKeygen(n, m, q, eta, seed), r = rng(seed + 1), noise = []; let fail = 0;
    for (let i = 0; i < trials; i++) { const bit = r() < 0.5 ? 1 : 0, c = lweEnc(K, bit, r); noise.push(c.noise); if (lweDec(K, c) !== bit) fail++; }
    return { K, fail, trials, rate: fail / trials, noise };
  }
  // the normal approximation: e·r has variance m·η/4; decryption fails when |e·r| > q/4
  function erfc(x) { const t = 1 / (1 + 0.5 * Math.abs(x)); const y = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? y : 2 - y; }
  const lwePredict = (m, q, eta) => { const sd = Math.sqrt(m * eta / 4); return erfc((q / 4) / (sd * Math.SQRT2)); };
  // For one fixed key the picture shifts: with r ∈ {0,1}, e·r has mean Σe/2 and variance Σe²/4 (the key's own errors).
  // Failure = the centred value of e·r (mod q) lands outside (−q/4, q/4); the normal approximation counts the wrap-arounds.
  const Phi = x => 0.5 * erfc(-x / Math.SQRT2);
  function lwePredictKey(K) {
    const mu = K.e.reduce((a, x) => a + x, 0) / 2, sd = Math.sqrt(K.e.reduce((a, x) => a + x * x, 0) / 4);
    if (sd === 0) return Math.abs(((mu % K.q) + K.q * 1.5) % K.q - K.q / 2) < K.q / 4 ? 0 : 1;
    let ok = 0; for (let j = -6; j <= 6; j++) ok += Phi((j * K.q + K.q / 4 - mu) / sd) - Phi((j * K.q - K.q / 4 - mu) / sd);
    return Math.min(1, Math.max(0, 1 - ok));
  }
  const lweKeyShift = K => ({ mu: K.e.reduce((a, x) => a + x, 0) / 2, sd: Math.sqrt(K.e.reduce((a, x) => a + x * x, 0) / 4) });
  // the eavesdropper with no noise: n equations A s = b (mod q) are solved by Gaussian elimination
  function solveModQ(A, b, q) {
    // uses the first n independent equations it meets (pivots may come from any of the m rows)
    const n = A[0].length, rows = A.length, M = A.map((row, i) => [...row, b[i]].map(x => modq(x, q)));
    for (let c = 0; c < n; c++) {
      let piv = -1; for (let r = c; r < rows; r++) if (M[r][c]) { piv = r; break; }
      if (piv < 0) return null; [M[c], M[piv]] = [M[piv], M[c]];
      const inv = Number(modInv(B(M[c][c]), B(q)));
      for (let k = c; k <= n; k++) M[c][k] = modq(M[c][k] * inv, q);
      for (let r = 0; r < n; r++) if (r !== c && M[r][c]) { const f = M[r][c]; for (let k = c; k <= n; k++) M[r][k] = modq(M[r][k] - f * M[c][k], q); }
      for (let r = n; r < rows; r++) if (M[r][c]) { const f = M[r][c]; for (let k = c; k <= n; k++) M[r][k] = modq(M[r][k] - f * M[c][k], q); }
    }
    return M.slice(0, n).map(row => row[n]);
  }
  // with noise, the same elimination gives a wrong s; check it against the other m − n equations
  function eveLinear(K) { const s = solveModQ(K.A, K.b, K.q); if (!s) return null; const right = s.every((x, i) => x === K.s[i]); return { s, right, wrongCoords: s.filter((x, i) => x !== K.s[i]).length }; }
  // brute force over all q^n secrets, as log10
  const lweBruteLog10 = (n, q) => n * Math.log10(q);

  // ML-KEM (FIPS 203, Aug 2024) parameter sets and their byte sizes: ek = 384k + 32, ct = 32(k·du + dv), shared key 32
  const MLKEM = [
    // dfpLog2: log2 of the decryption-failure probability (draft-cfrg-schwabe-kyber-04, Table 4)
    { name: 'ML-KEM-512', k: 2, eta1: 3, eta2: 2, du: 10, dv: 4, cat: 1, dfpLog2: -139 },
    { name: 'ML-KEM-768', k: 3, eta1: 2, eta2: 2, du: 10, dv: 4, cat: 3, dfpLog2: -164 },
    { name: 'ML-KEM-1024', k: 4, eta1: 2, eta2: 2, du: 11, dv: 5, cat: 5, dfpLog2: -174 }
  ];
  const mlkemSizes = P => ({ ek: 384 * P.k + 32, ct: 32 * (P.k * P.du + P.dv), ss: 32, dim: 256 * P.k, q: 3329 });
  // Figures of merit (bytes; speed as measured by Cloudflare, "The state of the post-quantum Internet", 5 Mar 2024,
  // which calls them a rough indication only). KEM: client operations per second. Signatures: CPU time relative to Ed25519.
  // ML-KEM sizes come from mlkemSizes(); the others are cross-checked against liboqs's algorithm tables (Nov 2026).
  const MERIT = [
    { id: 'x25519', kind: 'kem', pq: false, pk: 32, ct: 32, ops: 19000 },
    { id: 'mlkem512', kind: 'kem', pq: true, mlkem: 0, ops: 45000 },
    { id: 'mlkem768', kind: 'kem', pq: true, mlkem: 1, ops: 29000 },
    { id: 'mlkem1024', kind: 'kem', pq: true, mlkem: 2, ops: 20000 },
    { id: 'ed25519', kind: 'sig', pq: false, pk: 32, sig: 64, sign: 1, verify: 1 },
    { id: 'rsa2048', kind: 'sig', pq: false, pk: 256, sig: 256, sign: 70, verify: 0.3 },
    { id: 'mldsa44', kind: 'sig', pq: true, pk: 1312, sig: 2420, sign: 4.8, verify: 0.5 },
    { id: 'fndsa512', kind: 'sig', pq: true, pk: 897, sig: 666, sign: 8, verify: 0.5 },
    { id: 'slhdsa128s', kind: 'sig', pq: true, pk: 32, sig: 7856, sign: 8000, verify: 2.8 },
    { id: 'slhdsa128f', kind: 'sig', pq: true, pk: 32, sig: 17088, sign: 550, verify: 7 }
  ];
  const meritRow = r => r.mlkem != null ? Object.assign({}, r, { pk: mlkemSizes(MLKEM[r.mlkem]).ek, ct: mlkemSizes(MLKEM[r.mlkem]).ct }) : r;

  /* ───────── ch10 · FRONTIER DATA BLOCK (facts that will go stale) ─────────
   * Every entry: what, when (as of), group (established / demonstrated / claimed), source key in BRIEF.md.
   * The prose for each entry is copy key `fx.<id>`; tests check that the copy repeats `date`. */
  const FRONTIER = [
    { id: 'fips', group: 'std', date: '2024-08' },          // FIPS 203/204/205 published (NIST news, 13 Aug 2024)
    { id: 'hqc', group: 'std', date: '2025-03' },           // HQC selected (NIST, 11 Mar 2025); FIPS under development per IR 8547 (Oct 2026)
    { id: 'fndsa', group: 'std', date: '2025-09' },         // FN-DSA (FIPS 206) presented Sep 2025; no public draft found as of Nov 2026
    { id: 'sigs', group: 'std', date: '2026-05' },          // additional signatures round 3, nine candidates (NIST, 14 May 2026)
    { id: 'ir8547', group: 'std', date: '2026-10' },        // NIST IR 8547 final (27 Oct 2026)
    { id: 'rfc', group: 'std', date: '2026-08' },           // RFC 10024 hybrid ML-KEM key agreement for TLS 1.3 (Aug 2026)
    { id: 'tls', group: 'deploy', date: '2026-09' },        // ~70 % of browser traffic to Cloudflare uses hybrid ML-KEM; ~15 % of origins
    { id: 'browsers', group: 'deploy', date: '2026-06' },   // Chrome/Edge 131, Firefox 132, Safari 26 default X25519MLKEM768
    { id: 'msg', group: 'deploy', date: '2025-10' },        // Signal PQXDH (Sep 2023), SPQR (Oct 2025); iMessage PQ3 (Feb 2024)
    { id: 'os', group: 'deploy', date: '2025-11' },         // OpenSSH 10.0 default (Apr 2025); Windows ML-KEM/ML-DSA GA (Nov 2025); OpenSSL 3.5
    { id: 'gov', group: 'deploy', date: '2026-10' },        // migration deadlines: US (EO 14412/M-26-15), UK NCSC 2028/2031/2035, EU 2026/2030/2035
    { id: 'sike', group: 'attack', date: '2022-07' },       // SIKE broken (Castryck–Decru, ePrint 2022/975)
    { id: 'rainbow', group: 'attack', date: '2022-02' },    // Rainbow broken (Beullens, ePrint 2022/214)
    { id: 'chen', group: 'attack', date: '2024-04' },       // quantum LWE algorithm claimed, bug found in 9 days (ePrint 2024/555)
    { id: 'records', group: 'attack', date: '2026-09' },    // RSA-260 (3 Sep 2026), RSA-896 (19 Sep 2026); DLP-795 (2019)
    { id: 'qdemo', group: 'attack', date: '2025-07' },      // what quantum factoring has actually demonstrated: toy-sized numbers (Gutmann & Neuhaus)
    { id: 'qrsa', group: 'claim', date: '2025-05' },        // Gidney: RSA-2048 in < 1 week with < 1M noisy qubits (estimate)
    { id: 'qecc', group: 'claim', date: '2026-03' },        // Google Quantum AI: 256-bit ECDLP < 1200 logical qubits (estimate)
    { id: 'survey', group: 'claim', date: '2026-03' }       // GRI expert survey: 28–49 % within 10 years
  ];

  return {
    rng, mod, bitLength, popcount, modPow, gcd, egcd, modInv, isPrime, randBits, randomPrime, iroot, textToInt, intToText,
    keys, powTrace, safePrimeBelow, dlogInstance, bruteStart, bruteRun, bsgs, race,
    DH_BITS, dh, eve, mitm,
    RSA_PRIMES, rsaKey, rsaEnc, rsaDec, rsaSign, rsaVerify, rsaScale, trialDivide, rsaBig3, cubeRootAttack, padRandom,
    ecR, EC_A, EC_B, EC_PRIMES, ecPoints, ecAdd, ecMul, ecOrder, ecGroup, ecMultiples, NIST_TABLE,
    sha256, hashInt, rsaKeyBits, certBody, chain,
    gnfsLog2, rhoLog2, yearsLog10, RECORDS,
    order, shorTry, shorStats, SHOR_NS, mosca, groverLog2,
    LAT_GOOD, latBasis, det2, babai, cvpExact, latTarget, hadamard, babaiSuccess, dist,
    cbd, lweKeygen, lweEnc, lweDec, lweTrial, lwePredict, lwePredictKey, lweKeyShift, solveModQ, eveLinear, lweBruteLog10, MLKEM, mlkemSizes, MERIT, meritRow,
    FRONTIER
  };
}));
