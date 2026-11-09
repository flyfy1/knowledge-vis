'use strict';
// Equation balance model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// One state shape drives every pan, tilt, equation echo and readout on the page:
//   { a, b, c, d } = left pan holds a bags + b loose marbles, right pan holds c bags + d marbles.
// Every bag holds the same hidden number x of marbles (the bag itself weighs nothing), so the
// equation is a·x + b = c·x + d. All counts are whole numbers; balance is exact equality.
(function (root) {
  const LIMIT = { bags: 6, marbles: 24 };
  const TILT_MAX = 14; // degrees, drawing only

  const clone = s => ({ a: s.a, b: s.b, c: s.c, d: s.d });
  const weigh = (s, x) => ({ L: s.a * x + s.b, R: s.c * x + s.d });
  const isBalanced = (s, x) => { const w = weigh(s, x); return w.L === w.R; };
  // Illustrative only: 4° per marble of difference, clamped. Positive = left pan lower.
  const tiltDeg = (s, x) => { const w = weigh(s, x); return Math.max(-TILT_MAX, Math.min(TILT_MAX, (w.L - w.R) * 4)); };
  const heavier = (s, x) => { const w = weigh(s, x); return w.L > w.R ? 'L' : w.L < w.R ? 'R' : '='; };

  function gcd(p, q) { p = Math.abs(p); q = Math.abs(q); while (q) [p, q] = [q, p % q]; return p; }
  // Divisors k > 1 that split every non-empty pile on both pans evenly.
  function divisors(s) {
    const nz = [s.a, s.b, s.c, s.d].filter(v => v > 0);
    if (!nz.length) return [];
    const g = nz.reduce(gcd);
    const out = []; for (let k = 2; k <= g; k++) if (g % k === 0) out.push(k);
    return out;
  }
  const withinLimits = s => s.a <= LIMIT.bags && s.c <= LIMIT.bags && s.b <= LIMIT.marbles && s.d <= LIMIT.marbles;
  const nonEmpty = s => s.a + s.b > 0 && s.c + s.d > 0;

  // op: { kind: 'add'|'sub', what: 'm'|'bag', n } (both pans), { kind: 'mul'|'div', k } (both pans),
  //     { kind: 'oneAdd', side: 'L'|'R', what, n } and { kind: 'oneMul', side, k } (deliberate one-pan mistakes).
  // Returns { ok, state, reason } — reason is a string key when the move is refused.
  function applyOp(s, op) {
    const t = clone(s);
    const key = op.what === 'bag' ? ['a', 'c'] : ['b', 'd'];
    if (op.kind === 'add') { t[key[0]] += op.n; t[key[1]] += op.n; }
    else if (op.kind === 'sub') {
      if (t[key[0]] < op.n || t[key[1]] < op.n) return { ok: false, state: s, reason: op.what === 'bag' ? 'needBags' : 'needMarbles' };
      t[key[0]] -= op.n; t[key[1]] -= op.n;
      if (!nonEmpty(t)) return { ok: false, state: s, reason: 'emptyPan' };
    } else if (op.kind === 'mul') { t.a *= op.k; t.b *= op.k; t.c *= op.k; t.d *= op.k; }
    else if (op.kind === 'div') {
      if (!divisors(s).includes(op.k)) return { ok: false, state: s, reason: 'notEven' };
      t.a /= op.k; t.b /= op.k; t.c /= op.k; t.d /= op.k;
    } else if (op.kind === 'oneAdd') { t[op.side === 'L' ? key[0] : key[1]] += op.n; }
    else if (op.kind === 'oneMul') { if (op.side === 'L') { t.a *= op.k; t.b *= op.k; } else { t.c *= op.k; t.d *= op.k; } }
    else throw new Error('unknown op ' + op.kind);
    if (!withinLimits(t)) return { ok: false, state: s, reason: 'tooMany' };
    return { ok: true, state: t, reason: null };
  }

  // x alone on one pan and nothing else there; the other pan has marbles only.
  function isolated(s) {
    if (s.a === 1 && s.b === 0 && s.c === 0) return 'L';
    if (s.c === 1 && s.d === 0 && s.a === 0) return 'R';
    return null;
  }
  const isolatedValue = s => { const side = isolated(s); return side === 'L' ? s.d : side === 'R' ? s.b : null; };
  // Exact solution of a·x + b = c·x + d (null when a = c).
  const solve = s => (s.a === s.c ? null : (s.d - s.b) / (s.a - s.c));

  function sideString(n, m) {
    const parts = [];
    if (n) parts.push(n === 1 ? 'x' : n + 'x');
    if (m || !n) parts.push(String(m));
    return parts.join(' + ');
  }
  const exprString = s => sideString(s.a, s.b) + ' = ' + sideString(s.c, s.d);
  // The check by substitution: "3×4 + 2 = 14" style pieces, evaluated from the state.
  function substitute(s, x) {
    const piece = (n, m) => {
      const parts = [];
      if (n) parts.push(n === 1 ? String(x) : n + '×' + x);
      if (m || !n) parts.push(String(m));
      return parts.join(' + ');
    };
    const w = weigh(s, x);
    return { left: piece(s.a, s.b), right: piece(s.c, s.d), L: w.L, R: w.R, ok: w.L === w.R };
  }

  // Lesson data. Hidden values are never written into the DOM before the learner earns them.
  const STEP0_BAGS = [7, 5, 11];      // step 0: what the sealed bag holds, cycled by "another bag"
  const STEP0_MAX = 15;               // right-pan marbles available in step 0
  const STEP1 = { start: { a: 1, b: 2, c: 0, d: 8 }, x: 6 };
  const STEP2 = { start: { a: 1, b: 2, c: 0, d: 5 }, x: 3 };
  const STEP3 = { start: { a: 1, b: 5, c: 0, d: 9 }, x: 4 };
  const STEP4 = [
    { start: { a: 3, b: 2, c: 0, d: 14 }, x: 4 },   // dividing first is impossible: gcd(3, 2, 14) = 1
    { start: { a: 2, b: 6, c: 0, d: 16 }, x: 5 },   // either order works
    { start: { a: 4, b: 8, c: 0, d: 20 }, x: 3 }    // either order works; ÷4 or ÷2 twice
  ];
  const STEP5 = [
    { start: { a: 3, b: 1, c: 1, d: 9 }, x: 4 },
    { start: { a: 4, b: 3, c: 2, d: 13 }, x: 5 }
  ];
  const QUIZ = [
    { start: { a: 1, b: 7, c: 0, d: 12 }, options: [5, 19, 12, 7], answer: 5 },
    { start: { a: 2, b: 3, c: 0, d: 15 }, options: [9, 6, 12, 7], answer: 6 }
  ];

  const api = { LIMIT, TILT_MAX, clone, weigh, isBalanced, tiltDeg, heavier, gcd, divisors, applyOp, isolated, isolatedValue, solve, exprString, substitute,
    STEP0_BAGS, STEP0_MAX, STEP1, STEP2, STEP3, STEP4, STEP5, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EQ_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
