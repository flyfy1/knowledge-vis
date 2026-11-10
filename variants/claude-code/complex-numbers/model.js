'use strict';
// Complex numbers (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09. A complex number is a pair {re, im}; every reading on
// the page (components, modulus, argument, sums, products) is computed here from that pair.
(function (root) {

const DEG = Math.PI / 180;
const cx = (re, im) => ({ re, im });
const add = (z, w) => cx(z.re + w.re, z.im + w.im);
// Algebraic route: (a + bi)(c + di) = (ac − bd) + (ad + bc)i, using i² = −1.
const mul = (z, w) => cx(z.re * w.re - z.im * w.im, z.re * w.im + z.im * w.re);
const scale = (z, k) => cx(z.re * k, z.im * k);
const mod = z => Math.hypot(z.re, z.im);
const I = cx(0, 1);
// Principal angle in (−180°, 180°]; −180 is reported as +180 (a point on the negative real axis has angle 180°).
function normDeg(a) { let v = ((a + 180) % 360 + 360) % 360 - 180; if (v <= -180 + 1e-12) v = 180; return v; }
// Argument: angle from the positive real axis, anticlockwise. The origin has no argument (null).
const ORIGIN_EPS = 1e-12;
function arg(z) { if (mod(z) < ORIGIN_EPS) return null; return normDeg(Math.atan2(z.im, z.re) / DEG); }
const fromPolar = (r, deg) => cx(r * Math.cos(deg * DEG), r * Math.sin(deg * DEG));
// Geometric route for a product: multiply the moduli, add the angles.
function mulPolar(z, w) { const az = arg(z), aw = arg(w); if (az === null || aw === null) return cx(0, 0); return fromPolar(mod(z) * mod(w), az + aw); }
const near = (z, w, tol = 1e-9) => Math.abs(z.re - w.re) <= tol && Math.abs(z.im - w.im) <= tol;

// ---- step 0: turning the arrow 1 by φ twice ----
const turnTwice = phi => ({ first: fromPolar(1, phi), second: fromPolar(1, 2 * phi) });
// The turn angles in [0, 360) that land on −1 after two turns.
const halfTurnRoots = () => [90, 270];

// ---- step 3: powers of i and the ×i orbit ----
const timesI = z => mul(z, I);
function orbit(z, n) { const out = [z]; for (let k = 0; k < n; k++) out.push(timesI(out[out.length - 1])); return out; }
// An F-shaped outline, not symmetric, so any rotation of it is easy to see.
const SHAPE_F = [[0.6, 0.4], [0.6, 2.4], [1.9, 2.4], [1.9, 2.0], [1.0, 2.0], [1.0, 1.6], [1.6, 1.6], [1.6, 1.2], [1.0, 1.2], [1.0, 0.4]].map(([a, b]) => cx(a, b));
const mapShape = (shape, w) => shape.map(z => mul(z, w));

// ---- step 5: repeated multiplication ----
function powers(w, n) { const out = [cx(1, 0)]; for (let k = 0; k < n; k++) out.push(mul(out[out.length - 1], w)); return out; }

// ---- step 6 quiz: answers computed, never typed in ----
const QUIZ = {
  q1: mul(mul(cx(3, 2), I), I),                    // −3 − 2i
  q2: [mod(cx(3, 4)), mod(cx(-4, 3))],             // 5 and 5
  q3: mul(cx(1, 1), cx(1, 1))                      // 2i
};
const QUIZ_OPTIONS = { q1: { a: cx(-3, 2), b: cx(-3, -2), c: cx(3, -2) }, q3: { a: cx(2, 0), b: cx(0, 2), c: cx(1, 1) } };
function quizKey(q) {
  if (q === 'q2') { const [a, b] = QUIZ.q2; return Math.abs(a - b) < 1e-12 ? 'b' : a > b ? 'a' : 'c'; }
  const o = QUIZ_OPTIONS[q]; return Object.keys(o).find(k => near(o[k], QUIZ[q])) || null;
}

const api = { DEG, cx, add, mul, scale, mod, I, normDeg, arg, fromPolar, mulPolar, near, turnTwice, halfTurnRoots, timesI, orbit, SHAPE_F, mapShape, powers, QUIZ, QUIZ_OPTIONS, quizKey, ORIGIN_EPS };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.COMPLEX_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
