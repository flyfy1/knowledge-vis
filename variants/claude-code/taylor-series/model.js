'use strict';
// Taylor series (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09. No DOM access here.
(function (root) {

const fact = k => { let p = 1; for (let i = 2; i <= k; i++) p *= i; return p; };

// Taylor coefficients about 0, c_k = f^(k)(0)/k!, and the derivative values f^(k)(0).
const FUNCS = {
  exp: { f: Math.exp, deriv0: () => 1 },
  sin: { f: Math.sin, deriv0: k => [0, 1, 0, -1][k % 4] },
  cos: { f: Math.cos, deriv0: k => [1, 0, -1, 0][k % 4] },
  ln1p: { f: x => (x > -1 ? Math.log(1 + x) : NaN), deriv0: k => (k === 0 ? 0 : (k % 2 ? 1 : -1) * fact(k - 1)) },
  geo: { f: x => (x !== 1 ? 1 / (1 - x) : NaN), deriv0: k => fact(k) }
};
const deriv0 = (name, k) => FUNCS[name].deriv0(k);
const coef = (name, k) => deriv0(name, k) / fact(k);
const coefs = (name, n) => Array.from({ length: n + 1 }, (_, k) => coef(name, k));

// Horner evaluation of Σ c_k (x − a)^k.
function poly(c, x, a = 0) { let s = 0; const u = x - a; for (let k = c.length - 1; k >= 0; k--) s = s * u + c[k]; return s; }
const taylor = (name, n, x) => poly(coefs(name, n), x);

/* ---------- step 0: order of contact for a hand-built quadratic against e^x ---------- */
// mismatch of value, slope and curvature at 0 between e^x and c0 + c1 x + c2 x²
function contact(c0, c1, c2) {
  const d = [1 - c0, 1 - c1, 1 - 2 * c2];
  const err = h => Math.abs(Math.exp(h) - (c0 + c1 * h + c2 * h * h));
  // slope of log|error| against log h between h = 0.05 and h = 0.1: ≈ order of contact
  const slope = Math.log(err(0.1) / err(0.05)) / Math.log(2);
  const tol = 1e-9, order = Math.abs(d[0]) > tol ? 0 : Math.abs(d[1]) > tol ? 1 : Math.abs(d[2]) > tol ? 2 : 3;
  return { d, err, e1: err(0.1), e2: err(0.2), ratio: err(0.2) / err(0.1), slope, order };
}

/* ---------- step 2: how far does P_n stay within 0.01 of sin x? ---------- */
// largest r (grid 0.001, scanned up to 12) with |sin x − P_n(x)| < tol for every |x| ≤ r (sin's error is odd in x)
function goodWindow(n, tol = 0.01, step = 0.001, max = 12) {
  const c = coefs('sin', n);
  let r = 0;
  for (let i = 1; i * step <= max + 1e-12; i++) { const x = i * step; if (Math.abs(Math.sin(x) - poly(c, x)) >= tol) break; r = x; }
  return r;
}

/* ---------- step 3: Lagrange remainder for sin ---------- */
// |sin x − P_n(x)| ≤ |x|^(n+1)/(n+1)!  (every derivative of sin is bounded by 1)
const sinBound = (n, x) => Math.pow(Math.abs(x), n + 1) / fact(n + 1);
const sinError = (n, x) => Math.abs(Math.sin(x) - taylor('sin', n, x));
const FLOOR = 1e-15; // below this the computed error is rounding, not truncation
function firstBelow(fn, tol, nMax = 40) { for (let n = 0; n <= nMax; n++) if (fn(n) < tol) return n; return null; }

/* ---------- step 4: 1/(1 + x²) about a centre a; poles at ±i ---------- */
const lor = x => 1 / (1 + x * x);
// c_k about a, from 1/(1+x²) = (1/2i)[1/(x − i) − 1/(x + i)] and 1/(x − p) = −Σ (x − a)^k / (p − a)^(k+1)
function lorCoefs(a, n) {
  const out = [];
  // w = 1/(i − a) as a complex number; powers w^(k+1)
  const den = a * a + 1, wr = -a / den, wi = -1 / den; // 1/(−a + i) = (−a − i)/(a² + 1)
  let pr = wr, pi = wi; // w^1
  for (let k = 0; k <= n; k++) {
    // term1 = −w^(k+1); term2 = +conj(w)^(k+1); (term1 + term2)/(2i) = (−2i·Im w^(k+1))/(2i) = −Im w^(k+1)
    out.push(-pi);
    const nr = pr * wr - pi * wi, ni = pr * wi + pi * wr; pr = nr; pi = ni;
  }
  return out;
}
const lorRadius = a => Math.hypot(a, 1);
const lorTaylor = (a, n, x) => poly(lorCoefs(a, n), x, a);
const lorError = (a, n, x) => Math.abs(lor(x) - lorTaylor(a, n, x));

/* ---------- step 5: computing e^x by summing terms ---------- */
// S_N = Σ_{k<N} x^k/k!; smallest N with |S_N − e^x| ≤ tol · e^x
function expTerms(x, tol = 1e-6, nMax = 80) {
  let s = 0, term = 1, maxTerm = 0;
  const e = Math.exp(x);
  for (let N = 1; N <= nMax; N++) {
    s += term; maxTerm = Math.max(maxTerm, Math.abs(term));
    if (Math.abs(s - e) <= tol * e) return { N, sum: s, exact: e, maxTerm, relErr: Math.abs(s - e) / e };
    term *= x / N;
  }
  return null;
}
const expTermList = (x, K) => { const out = []; let term = 1; for (let k = 0; k < K; k++) { out.push(term); term *= x / (k + 1); } return out; };

const api = { fact, FUNCS, deriv0, coef, coefs, poly, taylor, contact, goodWindow, sinBound, sinError, FLOOR, firstBelow, lor, lorCoefs, lorRadius, lorTaylor, lorError, expTerms, expTermList };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.TAYLOR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
