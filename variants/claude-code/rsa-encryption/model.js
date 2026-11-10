'use strict';
// RSA lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page and tests/core.cjs. Toy keys stay below 2^26, so every
// product fits exactly in a double (no BigInt needed); step 0 numbers stay below 2^41.
(function (root) {

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const r = a % b; a = b; b = r; } return a; };
const isPrime = n => { if (n < 2) return false; if (n % 2 === 0) return n === 2; for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false; return true; };
const prevPrime = n => { let p = n - 1; while (p > 1 && !isPrime(p)) p--; return p; };
const phi = n => { let c = 0; for (let k = 1; k <= n; k++) if (gcd(k, n) === 1) c++; return c; };
const mulmod = (a, b, n) => (a * b) % n; // exact while a, b < n < 2^26

// Square-and-multiply, left to right. Returns the value and the list of operations (the ladder).
function modpow(m, E, n) {
  if (n === 1) return { value: 0, ops: [], squares: 0, mults: 0 };
  const bits = E.toString(2), ops = [];
  let v = m % n, squares = 0, mults = 0;
  ops.push({ bit: 1, kind: 'start', value: v, exp: 1 });
  let exp = 1;
  for (let i = 1; i < bits.length; i++) {
    v = mulmod(v, v, n); exp *= 2; squares++; ops.push({ bit: Number(bits[i]), kind: 'sq', value: v, exp });
    if (bits[i] === '1') { v = mulmod(v, m % n, n); exp += 1; mults++; ops.push({ bit: 1, kind: 'mul', value: v, exp }); }
  }
  if (E === 0) { v = 1 % n; ops.length = 0; }
  return { value: v, ops, squares, mults, bits };
}
// Naive repeated multiplication (used only as a check in tests and for small exponents).
function modpowNaive(m, E, n) { let v = 1 % n; for (let i = 0; i < E; i++) v = mulmod(v, m % n, n); return v; }
const fastCount = E => { if (E <= 1) return 0; const b = E.toString(2); return (b.length - 1) + (b.split('1').length - 2); };

// ---- step 0: multiplying vs splitting, measured ----
// For an even bit size b, p is the largest prime below 2^(b/2) and q the next prime below p:
// the hardest case for trial division (two primes of the same size).
function splitCase(b) {
  const p = prevPrime(Math.pow(2, b / 2)), q = prevPrime(p), n = p * q;
  let divisions = 0, found = 0;
  for (let d = 2; ; d = d === 2 ? 3 : d + 2) { divisions++; if (n % d === 0) { found = d; break; } }
  const dp = String(p).length, dq = String(q).length;
  return { b, p, q, n, nBits: Math.floor(Math.log2(n)) + 1, divisions, found, digitMults: dp * dq, root: Math.floor(Math.sqrt(n)) };
}
const SIZES = []; for (let b = 8; b <= 40; b += 2) SIZES.push(b);
let splitCache = null;
const splitTable = () => (splitCache || (splitCache = SIZES.map(splitCase)));

// ---- step 1: powers going round the clock ----
function orbit(a, n) {
  // a^0, a^1, … mod n until a value repeats; `ret` = first k ≥ 1 with a^k ≡ 1 (0 if never).
  const seq = [1 % n], seen = new Map([[1 % n, 0]]);
  let v = 1 % n, ret = 0;
  for (let k = 1; k <= n + 1; k++) {
    v = mulmod(v, a, n); seq.push(v);
    if (v === 1 % n && !ret) ret = k;
    if (seen.has(v)) return { seq, ret, cycleStart: seen.get(v), cycleLen: k - seen.get(v) };
    seen.set(v, k);
  }
  return { seq, ret, cycleStart: 0, cycleLen: 0 };
}

// ---- step 2: keys ----
const P_LIST = [5, 7, 11, 13, 17, 19, 23];
const Q_LIST = [29, 31, 37, 41, 43, 47];
function egcd(a, b) {
  // Extended Euclid, rows of the table: r_i = s_i·a + t_i·b.
  const rows = [{ r: a, s: 1, t: 0, q: null }, { r: b, s: 0, t: 1, q: null }];
  while (rows[rows.length - 1].r !== 0) {
    const A = rows[rows.length - 2], B = rows[rows.length - 1], q = Math.floor(A.r / B.r);
    B.q = q;
    rows.push({ r: A.r - q * B.r, s: A.s - q * B.s, t: A.t - q * B.t, q: null });
  }
  const g = rows[rows.length - 2];
  return { g: g.r, s: g.s, t: g.t, rows };
}
function validE(ph, count = 8) { const out = []; for (let e = 3; e < ph && out.length < count; e += 2) if (gcd(e, ph) === 1) out.push(e); return out; }
function makeKey(p, q, e) {
  const n = p * q, ph = (p - 1) * (q - 1), E = egcd(ph, e);
  // E.t · e ≡ 1 (mod φ) → d = E.t mod φ
  const d = ((E.t % ph) + ph) % ph, k = (e * d - 1) / ph;
  return { p, q, n, phi: ph, e, d, k, euclid: E };
}
// Plaintexts that encrypt to themselves: (1 + gcd(e−1, p−1)) · (1 + gcd(e−1, q−1)).
const fixedPointsFormula = (p, q, e) => (1 + gcd(e - 1, p - 1)) * (1 + gcd(e - 1, q - 1));

// ---- step 5: the eavesdropper ----
function trialFactor(n) { let tries = 0; for (let d = 2; d * d <= n; d = d === 2 ? 3 : d + 2) { tries++; if (n % d === 0) return { f: d, g: n / d, tries }; } return { f: n, g: 1, tries }; }
// Cost estimates as log10 of "elementary operations" (orders of magnitude only).
const LN10 = Math.log(10);
function gnfsLog10(bits) { const ln = bits * Math.log(2), ll = Math.log(ln); return Math.cbrt(64 / 9) * Math.cbrt(ln) * Math.pow(ll, 2 / 3) / LN10; }
const trialLog10 = bits => (bits / 2 - 1) * Math.log10(2);        // ≈ √n / 2 odd candidates
const legitLog10 = bits => Math.log10(1.5 * Math.pow(bits, 3));   // ≈ 1.5·L modular multiplications × L² bit operations
const OPS_PER_SEC = 1e18, SEC_PER_YEAR = 365.25 * 86400;
const yearLog10 = Math.log10(OPS_PER_SEC * SEC_PER_YEAR);          // one year on a 10^18 op/s machine
const yearsLog10 = l => l - yearLog10;

const api = { gcd, isPrime, prevPrime, phi, modpow, modpowNaive, fastCount, splitCase, SIZES, splitTable, orbit, P_LIST, Q_LIST, egcd, validE, makeKey, fixedPointsFormula, trialFactor, gnfsLog10, trialLog10, legitLog10, OPS_PER_SEC, yearLog10, yearsLog10 };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') root.RSA_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
