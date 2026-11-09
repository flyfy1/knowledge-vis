'use strict';
// Real numbers & the number line (Claude Code edition) — pure arithmetic shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Decimal digits are exact: square roots use BigInt integer square roots, fractions use long division.
(function (root) {

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
function isqrtBig(n) {                       // floor(√n) for a non-negative BigInt
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2) + 1);   // a start above √n
  for (;;) { const y = (x + n / x) / 2n; if (y >= x) break; x = y; }  // Newton from above decreases to floor(√n)
  return x;
}
// √n truncated to k decimals: { int, digits } with digits a string of length k.
function sqrtDigits(n, k) {
  const r = isqrtBig(BigInt(n) * 10n ** BigInt(2 * k)).toString().padStart(k + 1, '0');
  return { int: r.slice(0, r.length - k), digits: r.slice(r.length - k) };
}
const isSquare = n => { const r = Math.round(Math.sqrt(n)); return r * r === n; };

// p/q (q > 0) by long division: integer part, first k digits, and where the repeating block starts.
function fracDigits(p, q, k) {
  const g = gcd(p, q); p /= g; q /= g;
  const int = Math.floor(p / q); let r = p - int * q;
  const seen = new Map(), digits = [];
  let repeatStart = -1, period = 0;
  for (let i = 0; i < Math.max(k, 2 * q + 2); i++) {
    if (r === 0) break;
    if (repeatStart < 0 && seen.has(r)) { repeatStart = seen.get(r); period = i - repeatStart; }
    if (!seen.has(r)) seen.set(r, i);
    r *= 10; digits.push(Math.floor(r / q)); r %= q;
  }
  const terminates = r === 0 && repeatStart < 0;
  const out = []; for (let i = 0; i < k; i++) out.push(i < digits.length ? digits[i] : (terminates ? 0 : digits[repeatStart + (i - repeatStart) % period]));
  return { int, digits: out.join(''), terminates, repeatStart, period, q };
}
// A terminating decimal exactly when the reduced denominator has no prime factors other than 2 and 5.
const terminatesByDenominator = (p, q) => { q /= gcd(p, q); while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1; };

/* ---------- the numbers used on the page ---------- */
// kind: 'sqrt' (√n), 'frac' (p/q), 'pi' (π, digits quoted), 'pattern' (0.1 01 001 0001 …)
const PI_DIGITS = '14159265358979323846264338327950288419716939937510';
function patternDigits(k) { let s = ''; for (let z = 0; s.length < k; z++) s += '0'.repeat(z) + '1'; return s.slice(0, k); }
function digitsOf(num, k) {
  if (num.kind === 'sqrt') return sqrtDigits(num.n, k);
  if (num.kind === 'frac') { const f = fracDigits(Math.abs(num.p), num.q, k); return { int: (num.p < 0 ? '-' : '') + f.int, digits: f.digits, info: f }; }
  if (num.kind === 'pi') return { int: '3', digits: PI_DIGITS.slice(0, k) };
  return { int: '0', digits: patternDigits(k) };
}
function valueOf(num) {
  if (num.kind === 'sqrt') return Math.sqrt(num.n);
  if (num.kind === 'frac') return num.p / num.q;
  if (num.kind === 'pi') return Math.PI;
  return Number('0.' + patternDigits(40));
}
// Classification as the page states it. Square roots: integer when n is a perfect square, otherwise irrational
// (the step-3 argument). π: irrational by a known theorem (not proved on the page). The 0.1 01 001 … pattern:
// its blocks of zeros keep growing, so no block of digits repeats forever.
function classify(num) {
  if (num.kind === 'sqrt') return isSquare(num.n) ? 'integer' : 'irrational';
  if (num.kind === 'frac') return terminatesByDenominator(Math.abs(num.p), num.q) ? 'terminating' : 'repeating';
  return 'irrational';
}

/* ---------- step 0: swinging a diagonal down onto the line ---------- */
// A 1 × b rectangle standing on [0, 1]; its diagonal from 0 has length √(1 + b²). Rotating it by angle θ
// (degrees, from its own slope down to 0) keeps the length, so the tip lands at √(1 + b²).
const diagLen = b => Math.hypot(1, b);
const diagSlope = b => Math.atan2(b, 1) * 180 / Math.PI;
const tipAt = (b, theta) => { const L = diagLen(b), a = theta * Math.PI / 180; return { x: L * Math.cos(a), y: L * Math.sin(a) }; };

/* ---------- step 2: fractions trying to hit √2 ---------- */
function bestFor(q) { const p = Math.round(q * Math.SQRT2); return { p, q, err: Math.abs(p / q - Math.SQRT2), gap: p * p - 2 * q * q }; }
// Best fraction with denominator up to N (the error is computed exactly enough: |p/q − √2| = |p² − 2q²| / (q(p + q√2))).
function bestUpTo(N) {
  let best = null;
  for (let q = 1; q <= N; q++) { const b = bestFor(q); b.errExact = Math.abs(b.gap) / (q * (b.p + q * Math.SQRT2)); if (!best || b.errExact < best.errExact) best = b; }
  return best;
}
function records(N) { const out = []; let e = Infinity; for (let q = 1; q <= N; q++) { const b = bestFor(q); const x = Math.abs(b.gap) / (q * (b.p + q * Math.SQRT2)); if (x < e) { e = x; out.push(Object.assign(b, { errExact: x })); } } return out; }

/* ---------- step 3: counting factors of 2 ---------- */
const twos = n => { let c = 0; while (n % 2 === 0 && n > 0) { n /= 2; c++; } return c; };

/* ---------- step 5: √n on the graph of y = x² ---------- */
function rootInfo(n, k = 12) {
  const d = sqrtDigits(n, k), lo = Math.floor(Math.sqrt(n) + 1e-12);
  return { d, lo, hi: isSquare(n) ? lo : lo + 1, square: isSquare(n) };
}

const api = { gcd, isqrtBig, sqrtDigits, isSquare, fracDigits, terminatesByDenominator, PI_DIGITS, patternDigits, digitsOf, valueOf, classify,
  diagLen, diagSlope, tipAt, bestFor, bestUpTo, records, twos, rootInfo };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.REAL_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
