'use strict';
// Pythagorean theorem lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every length, area, angle and verdict on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  const hyp = (a, b) => Math.sqrt(a * a + b * b);
  const isSquare = n => Number.isInteger(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
  const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;

  // Step 0: walk a east and b north on the grid; the straight line home is c.
  function walk(a, b) {
    const c = hyp(a, b);
    return { a, b, around: a + b, c, saving: a + b - c, a2: a * a, b2: b * b, c2: c * c };
  }

  // Step 1: two sides a, b with angle θ (degrees) between them. The third side from coordinates:
  // C = (0, 0), B = (a, 0), A = b(cos θ, sin θ); c = |AB|. Squares are built outward on each side.
  function hinge(a, b, deg) {
    const th = deg * Math.PI / 180;
    const C = [0, 0], B = [a, 0], A = [b * Math.cos(th), b * Math.sin(th)];
    const c = Math.hypot(A[0] - B[0], A[1] - B[1]);
    const c2 = c * c, sum = a * a + b * b;
    // outward square on segment P→Q, given a point O inside the triangle
    const square = (P, Q, O) => {
      const dx = Q[0] - P[0], dy = Q[1] - P[1];
      let nx = -dy, ny = dx; // left normal
      const mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2;
      if ((O[0] - mx) * nx + (O[1] - my) * ny > 0) { nx = -nx; ny = -ny; }
      return [P, Q, [Q[0] + nx, Q[1] + ny], [P[0] + nx, P[1] + ny]];
    };
    const O = [(A[0] + B[0]) / 3, (A[1] + B[1]) / 3];
    return {
      deg, a, b, c, c2, sum, diff: c2 - sum,
      verdict: Math.abs(c2 - sum) < 1e-9 ? 'eq' : c2 > sum ? 'gt' : 'lt',
      tri: [C, B, A],
      sqA: square(C, B, O), sqB: square(A, C, O), sqC: square(B, A, O)
    };
  }
  // c² as a function of the hinge angle (used for the traced curve). Same value as hinge(...).c2.
  const c2At = (a, b, deg) => { const h = hinge(a, b, deg); return h.c2; };

  // Step 2: the rearrangement proof. A frame of side s = a + b holds four copies of the right triangle
  // (legs a and b). Each triangle is [R, Pa, Pb]: right-angle corner, end of leg a, end of leg b.
  // Layout A leaves a tilted square of side c; layout B leaves an a×a and a b×b square.
  // From A to B, T2 stays and the other three only slide (no turning): see `moves`.
  function frame(a, b) {
    const s = a + b;
    const A = [
      [[0, 0], [a, 0], [0, b]],
      [[s, 0], [s, a], [a, 0]],
      [[s, s], [b, s], [s, a]],
      [[0, s], [0, b], [b, s]]
    ];
    const moves = [[0, a], [0, 0], [-b, 0], [a, -b]];
    const B = A.map((T, i) => T.map(p => [p[0] + moves[i][0], p[1] + moves[i][1]]));
    const holeA = [[a, 0], [s, a], [b, s], [0, b]];
    const holesB = [[[0, 0], [a, 0], [a, a], [0, a]], [[a, a], [s, a], [s, s], [a, s]]];
    const triArea = a * b / 2;
    return { a, b, s, A, B, moves, holeA, holesB, frameArea: s * s, triArea, holeAArea: s * s - 4 * triArea, holesBArea: s * s - 4 * triArea, c: hyp(a, b) };
  }
  const polyArea = P => Math.abs(P.reduce((acc, p, i) => { const q = P[(i + 1) % P.length]; return acc + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  const lerpPos = (T, mv, p) => T.map(q => [q[0] + mv[0] * p, q[1] + mv[1] * p]);

  // Step 3: distance between two grid points.
  function distance(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1), d = hyp(dx, dy);
    return { dx, dy, d, d2: dx * dx + dy * dy, whole: isSquare(dx * dx + dy * dy) };
  }

  // Step 4: classify a triangle from three side lengths by comparing the longest side's square with the others'.
  function classify(p, q, r) {
    const s = [p, q, r].slice().sort((u, v) => u - v), [a, b, c] = s;
    if (a + b <= c) return { ok: false, a, b, c, gap: c - (a + b) };
    const c2 = c * c, sum = a * a + b * b;
    const kind = c2 === sum ? 'right' : c2 > sum ? 'obtuse' : 'acute';
    const maxAngle = Math.acos(Math.max(-1, Math.min(1, (sum - c2) / (2 * a * b)))) * 180 / Math.PI;
    return { ok: true, a, b, c, c2, sum, diff: c2 - sum, kind, maxAngle };
  }
  // Place the triangle with the longest side c on the x-axis from (0,0) to (c,0); returns the apex.
  function layout(a, b, c) {
    const x = (c * c + b * b - a * a) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x));
    return [[0, 0], [c, 0], [x, y]];
  }
  const QUIZ = [[5, 12, 13], [6, 7, 10], [7, 8, 9], [9, 12, 15], [4, 5, 7], [8, 15, 17]];

  // Step 5: which integer legs 1..N give a whole-number hypotenuse?
  function wholeGrid(N) {
    const cells = [];
    for (let a = 1; a <= N; a++) for (let b = 1; b <= N; b++) if (isSquare(a * a + b * b)) cells.push([a, b, Math.round(hyp(a, b))]);
    return cells;
  }
  // a primitive triple has no common factor; the others are its multiples (same ray through the origin)
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const primitive = (a, b) => { const g = gcd(a, b); return [a / g, b / g, g]; };
  // best fraction p/q (q ≤ Q) for √2 and how far p² is from 2q²
  function sqrt2Fractions(Q) {
    const out = [];
    for (let q = 1; q <= Q; q++) { const p = Math.round(q * Math.SQRT2); out.push({ p, q, miss: p * p - 2 * q * q, err: p / q - Math.SQRT2 }); }
    return out;
  }

  const api = { hyp, isSquare, round, walk, hinge, c2At, frame, polyArea, lerpPos, distance, classify, layout, QUIZ, wholeGrid, gcd, primitive, sqrt2Fractions };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PYTH_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
