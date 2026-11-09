'use strict';
// Linear functions lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, slope, intercept, equation string and crossing on the page is computed here;
// tests/core.cjs pins the claims. Scope: straight lines y = kx + b with real k, b (plus the vertical
// line x = c, which is a straight line but not a function of x).
(function (root) {
  const MINUS = '−';
  const y = (k, b, x) => k * x + b;

  // Step 0: a quantity that changes by the same amount every step, vs one whose change keeps growing.
  // Readings at x = 0..n. 'equal': add k each step. 'growing': add k/4, 2k/4, 3k/4, … (the change itself grows by k/4 each step).
  function readings(k, b, n, mode) {
    const out = [{ x: 0, y: b }];
    for (let i = 1; i <= n; i++) out.push({ x: i, y: out[i - 1].y + (mode === 'growing' ? k * i / 4 : k) });
    return out;
  }
  // First differences (change per step) and whether all of them are equal.
  function diffs(pts) { const d = []; for (let i = 1; i < pts.length; i++) d.push(pts[i].y - pts[i - 1].y); return d; }
  function onOneLine(pts, eps = 1e-9) {
    const d = diffs(pts); return d.every(v => Math.abs(v - d[0]) <= eps);
  }

  // Step 1: rise over run between two points of the line.
  function riseRun(k, b, xA, xB) {
    if (xA === xB) return { run: 0, rise: 0, ratio: null };
    const run = xB - xA, rise = y(k, b, xB) - y(k, b, xA);
    return { run, rise, ratio: rise / run };
  }

  // Number formatting shared by readouts: at most 2 decimals, trailing zeros dropped, true minus sign.
  function fmt(v, d = 2) {
    if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
    const s = Math.abs(v).toFixed(d).replace(/\.?0+$/, '') || '0';
    return (v < 0 ? MINUS : '') + s;
  }

  // Rationals (step 4): integer numerator/denominator, reduced, denominator > 0.
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
  function frac(n, d) { if (d === 0) throw new Error('zero denominator'); const g = gcd(n, d), s = d < 0 ? -1 : 1; return { n: s * n / g, d: s * d / g }; }
  const fval = f => f.n / f.d;
  function fstr(f) { const a = Math.abs(f.n); const body = f.d === 1 ? String(a) : `${a}/${f.d}`; return (f.n < 0 ? MINUS : '') + body; }

  // Equation text y = kx + b with the usual conventions: k = 1 → x, k = −1 → −x, k = 0 → no x term,
  // b = 0 → no constant (unless nothing else is left), negative b written as “− |b|”.
  // k and b may be numbers or fractions {n, d}; fractional k is written in brackets: (2/3)x.
  function eq(k, b) {
    const isF = v => typeof v === 'object';
    const kv = isF(k) ? fval(k) : k, bv = isF(b) ? fval(b) : b;
    const kAbs = isF(k) ? fstr({ n: Math.abs(k.n), d: k.d }) : fmt(Math.abs(kv));
    const bAbs = isF(b) ? fstr({ n: Math.abs(b.n), d: b.d }) : fmt(Math.abs(bv));
    let xTerm = '';
    if (kv !== 0) {
      const coef = Math.abs(kv) === 1 ? '' : (isF(k) && k.d !== 1 ? `(${kAbs})` : kAbs);
      xTerm = (kv < 0 ? MINUS : '') + coef + 'x';
    }
    if (!xTerm) return 'y = ' + (bv === 0 ? '0' : (bv < 0 ? MINUS : '') + bAbs);
    if (bv === 0) return 'y = ' + xTerm;
    return 'y = ' + xTerm + (bv < 0 ? ' ' + MINUS + ' ' : ' + ') + bAbs;
  }

  // Step 4: the line through two lattice points. Vertical when x1 = x2 (not a function of x).
  function through(x1, y1, x2, y2) {
    if (x1 === x2 && y1 === y2) return { kind: 'same' };
    if (x1 === x2) return { kind: 'vertical', x: x1 };
    const k = frac(y2 - y1, x2 - x1), b = frac(y1 * (x2 - x1) - (y2 - y1) * x1, x2 - x1);
    return { kind: 'line', k, b, kv: fval(k), bv: fval(b) };
  }

  // Step 5: where y = k1 x + b1 meets y = k2 x + b2. The gap g(x) = (k1 − k2) x + (b1 − b2) is itself linear:
  // it changes by k1 − k2 per step, so it reaches 0 exactly once unless k1 = k2.
  function meet(k1, b1, k2, b2) {
    if (k1 === k2) return { kind: b1 === b2 ? 'same' : 'parallel', gapStep: 0, gap0: b1 - b2 };
    const x = (b2 - b1) / (k1 - k2);
    return { kind: 'one', x, y: y(k1, b1, x), gapStep: k1 - k2, gap0: b1 - b2 };
  }
  const gap = (k1, b1, k2, b2, x) => y(k1, b1, x) - y(k2, b2, x);

  // Step 6 quiz.
  const QUIZ = {
    q1: { k: -1, b: 2, options: [[1, 2], [-1, 2], [-1, -2], [2, -1]] },  // a drawn line; pick its equation
    q2: { start: 8, perKm: 2, km: 5, options: [10, 18, 15, 42] },          // taxi: y = 2x + 8 at x = 5
    q3: { a: [3, 10], b: [5, 0], options: [2, 5, 10, 25] }                 // two plans: where equal
  };
  function quizAnswers() {
    const a1 = QUIZ.q1.options.findIndex(([k, b]) => k === QUIZ.q1.k && b === QUIZ.q1.b);
    const a2 = QUIZ.q2.options.indexOf(y(QUIZ.q2.perKm, QUIZ.q2.start, QUIZ.q2.km));
    const m = meet(QUIZ.q3.a[0], QUIZ.q3.a[1], QUIZ.q3.b[0], QUIZ.q3.b[1]);
    const a3 = QUIZ.q3.options.indexOf(m.x);
    return [a1, a2, a3];
  }

  const api = { MINUS, y, readings, diffs, onOneLine, riseRun, fmt, gcd, frac, fval, fstr, eq, through, meet, gap, QUIZ, quizAnswers };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LIN_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
