'use strict';
// Simultaneous equations model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, line, derivation row and readout on the page is computed here; tests/core.cjs pins the claims.
// An equation a·x + b·y = c is stored as { a, b, c }. A system is two equations, A and B.
(function (root) {
  // Step 0–1 story: x = price of one apple, y = price of one pear (yuan).
  // A: 1 apple + 2 pears = 10, B: 3 apples + 1 pear = 15  →  (4, 3).
  // Presets used in steps 1–3. Equation A always has x-coefficient 1 so substitution starts with "x = …".
  const SYSTEMS = [
    { A: { a: 1, b: 2, c: 10 }, B: { a: 3, b: 1, c: 15 } },
    { A: { a: 1, b: 1, c: 7 }, B: { a: 2, b: 4, c: 22 } },
    { A: { a: 1, b: -1, c: 1 }, B: { a: 2, b: 3, c: 12 } }
  ];
  const EPS = 1e-9;
  const clean = v => (Math.abs(v) < EPS ? 0 : Math.round(v * 1e9) / 1e9);

  const residual = (e, x, y) => clean(e.a * x + e.b * y - e.c);

  // Cramer's rule. kind: 'one' | 'none' (parallel) | 'many' (same line).
  function solve(A, B) {
    const D = clean(A.a * B.b - B.a * A.b), Dx = clean(A.c * B.b - B.c * A.b), Dy = clean(A.a * B.c - B.a * A.c);
    if (D !== 0) return { kind: 'one', D, Dx, Dy, x: clean(Dx / D), y: clean(Dy / D) };
    return { kind: Dx === 0 && Dy === 0 ? 'many' : 'none', D, Dx, Dy };
  }

  // Step 0: points of A with a given x.
  const yOn = (e, x) => clean((e.c - e.a * x) / e.b);

  // Step 2: substitution, with every intermediate number. Needs A.a === 1.
  function substitution(S) {
    const { A, B } = S;
    if (A.a !== 1) throw new Error('substitution expects A.a = 1');
    const k = B.a * A.c;          // constant after distributing B.a over (A.c − A.b·y)
    const m1 = -B.a * A.b;        // y-term from the distribution
    const coefY = clean(m1 + B.b); // collected y coefficient
    const rhs = clean(B.c - k);
    const y = clean(rhs / coefY), x = clean(A.c - A.b * y);
    return { k, m1, coefY, rhs, y, x, check: clean(B.a * x + B.b * y) };
  }
  // Residual of B along line A, as a function of y: r(y) = B.a·(A.c − A.b·y) + B.b·y − B.c.
  const residualAlongA = (S, y) => residual(S.B, S.A.c - S.A.b * y, y);

  // Step 3: B − m·A. Every such combination passes through the solution of the system.
  const combine = (S, m) => ({ a: clean(S.B.a - m * S.A.a), b: clean(S.B.b - m * S.A.b), c: clean(S.B.c - m * S.A.c) });
  // Multipliers that remove x or y.
  const elimX = S => S.B.a / S.A.a, elimY = S => S.B.b / S.A.b;

  // Step 4: A fixed (x + 2y = 10), B: k·x + 2y = c.
  const FIXED_A = { a: 1, b: 2, c: 10 };
  const family = (k, c) => solve(FIXED_A, { a: k, b: 2, c });

  // Step 5: receipts. Receipt 1: 1 apple + 2 pears; receipt 2: 3 apples + 1 pear (or the "copy" 2 apples + 4 pears).
  function receipts(p, q, copy) {
    const r1 = { a: 1, b: 2 }, r2 = copy ? { a: 2, b: 4 } : { a: 3, b: 1 };
    r1.c = clean(r1.a * p + r1.b * q); r2.c = clean(r2.a * p + r2.b * q);
    return { r1, r2, sol: solve(r1, r2) };
  }

  const api = { SYSTEMS, residual, solve, yOn, substitution, residualAlongA, combine, elimX, elimY, FIXED_A, family, receipts, clean };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SIMEQ_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
