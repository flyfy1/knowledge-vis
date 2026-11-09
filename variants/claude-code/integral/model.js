'use strict';
// Definite-integral lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every strip, square, sum and readout on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  const sq = x => x * x;

  // ---- step 0: count grid squares under y = x² on [0, 1] (N × N grid on the unit square) ----
  // Column i covers x ∈ [i/N, (i+1)/N]. x² is increasing there, so a square lies fully under the curve
  // when its top is ≤ (i/N)², and it touches the region when its bottom is < ((i+1)/N)².
  const GRID_NS = [4, 5, 10, 20, 40];
  function gridColumns(N) {
    const cols = [];
    for (let i = 0; i < N; i++) cols.push({ inside: Math.floor(i * i / N + 1e-12), touch: Math.ceil((i + 1) * (i + 1) / N - 1e-12) });
    return cols;
  }
  function gridBounds(N) {
    const cols = gridColumns(N);
    const inside = cols.reduce((s, c) => s + c.inside, 0), touch = cols.reduce((s, c) => s + c.touch, 0);
    return { N, inside, touch, lower: inside / (N * N), upper: touch / (N * N) };
  }

  // ---- step 1: Riemann sums ----
  const NS = [1, 2, 4, 8, 16, 32, 64];
  function riemann(fn, a, b, n, mode) {
    const w = (b - a) / n; let s = 0; const strips = [];
    for (let i = 0; i < n; i++) {
      const x0 = a + i * w, xs = mode === 'left' ? x0 : mode === 'right' ? x0 + w : x0 + w / 2, h = fn(xs);
      strips.push({ x0, x1: x0 + w, h, area: h * w }); s += h * w;
    }
    return { sum: s, strips, w };
  }
  // Closed forms for y = x² on [0, 1].
  const Lsq = n => (n - 1) * (2 * n - 1) / (6 * n * n);
  const Rsq = n => (n + 1) * (2 * n + 1) / (6 * n * n);
  const Msq = n => 1 / 3 - 1 / (12 * n * n);

  // ---- step 2: a braking car, v(t) = 12 − 3t m/s for 0 ≤ t ≤ 4 s ----
  const V = t => 12 - 3 * t;
  const T_END = 4;
  const DIST = 24;                                   // exact: triangle ½ · 4 · 12
  const NS2 = [1, 2, 4, 8, 16, 32];
  // Running total after each strip (left-height strips: the speed at the start of each slice).
  function cumulative(n, mode = 'left') {
    const r = riemann(V, 0, T_END, n, mode); let s = 0;
    return r.strips.map(q => { s += q.area; return { t: q.x1, total: s, part: q.area, h: q.h }; });
  }

  // ---- step 3: signed accumulation, g(x) = x² − 1 on [0, b] ----
  const g = x => x * x - 1;
  const Gant = x => x * x * x / 3 - x;               // an antiderivative of g
  function signedParts(b) {
    // g < 0 on [0, 1), g > 0 after 1.
    const neg = Gant(Math.min(b, 1)) - Gant(0);       // ≤ 0
    const pos = b > 1 ? Gant(b) - Gant(1) : 0;        // ≥ 0
    return { neg, pos, net: neg + pos };
  }
  const ZERO_NET = Math.sqrt(3);                     // b³/3 − b = 0

  // ---- step 4: accumulation function A(x) = ∫₀ˣ t² dt and its growth rate ----
  const A = x => x * x * x / 3;
  const DXS = [0.5, 0.2, 0.1, 0.01];
  const A_TRACE_N = 400;                              // fine strips for the drawn trace (an approximation)
  const Atrace = x => (x <= 0 ? 0 : riemann(sq, 0, x, A_TRACE_N, 'mid').sum);
  function growth(x, dx) { const dA = A(x + dx) - A(x); return { dA, rate: dA / dx, f: sq(x), excess: dA / dx - sq(x) }; }

  // Number formatting shared with the tests: trim zeros, Unicode minus, −0 → 0.
  function num(v, d = 2) {
    if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
    let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s.replace('-', '−');
  }

  const QUIZ = { q1: { b: 2, answer: 2 }, q2: { n: 4 }, q4: { a: 1, b: 2, answer: 7 / 3 } };

  const api = { sq, GRID_NS, gridColumns, gridBounds, NS, riemann, Lsq, Rsq, Msq, V, T_END, DIST, NS2, cumulative, g, Gant, signedParts, ZERO_NET, A, DXS, A_TRACE_N, Atrace, growth, num, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.INTEG_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
