'use strict';
// Area-model multiplication lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, area and partial product on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  // Step 0: r rows of c dots. Optionally the last row is one short ("uneven").
  function rows(r, c, uneven) {
    const counts = Array.from({ length: r }, (_, i) => (uneven && i === r - 1 ? c - 1 : c));
    const total = counts.reduce((s, v) => s + v, 0);
    const running = counts.reduce((acc, v) => { acc.push((acc.length ? acc[acc.length - 1] : 0) + v); return acc; }, []);
    return { r, c, counts, total, running, product: r * c, even: counts.every(v => v === c) };
  }

  // Step 1: a rectangle a long and b wide, tiled with unit squares.
  const area = (a, b) => a * b;

  // Step 2: cut a rows × cols rectangle after column k.
  function split(rws, cols, k) {
    const left = rws * k, right = rws * (cols - k);
    return { rws, cols, k, left, right, total: left + right, whole: rws * cols };
  }

  // Step 3: two-digit × two-digit as four blocks, cut at the tens.
  function digits(n) { return { tens: Math.floor(n / 10) * 10, ones: n % 10 }; }
  function fourBlocks(m, n) {
    const A = digits(m), B = digits(n);
    // block order: tens×tens, tens×ones, ones×tens, ones×ones (m runs down the side, n across the top)
    const blocks = [
      { key: 'tt', h: A.tens, w: B.tens }, { key: 'to', h: A.tens, w: B.ones },
      { key: 'ot', h: A.ones, w: B.tens }, { key: 'oo', h: A.ones, w: B.ones }
    ].map(b => ({ ...b, area: b.h * b.w }));
    const total = blocks.reduce((s, b) => s + b.area, 0);
    // the written method: m × (ones of n) on the first line, m × (tens of n) on the second
    const line1 = m * B.ones, line2 = m * B.tens;
    return { m, n, A, B, blocks, total, product: m * n, line1, line2 };
  }

  // Step 4: lay N tiles in columns w tall. Full columns q, left over r.
  function tiling(N, w) {
    const q = Math.floor(N / w), r = N % w;
    return { N, w, q, r, exact: r === 0, cols: q + (r ? 1 : 0), missing: r ? w - r : 0 };
  }
  function factorPairs(N) {
    const out = [];
    for (let w = 1; w * w <= N; w++) if (N % w === 0) out.push([w, N / w]);
    return out;
  }
  const pairKey = (N, w) => { const p = Math.min(w, N / w); return p + '×' + Math.max(w, N / w); };

  // Step 5 self-test. Each question: options and the index of the right one, plus the numbers it quotes.
  const QUIZ = [
    { id: 'q1', options: ['10×6 + 4×6', '10×6 + 4', '14 + 6'], answer: 0, check: () => 10 * 6 + 4 * 6 === 14 * 6 && 10 * 6 + 4 !== 14 * 6 && 14 + 6 !== 14 * 6 },
    { id: 'q2', options: ['200 + 100 + 30 + 15', '200 + 15', '20×10 + 3×5'], answer: 0, check: () => fourBlocks(23, 15).blocks.map(b => b.area).join() === '200,100,30,15' && 200 + 30 + 100 + 15 === 23 * 15 && 200 + 15 !== 345 && 20 * 10 + 3 * 5 !== 345 },
    { id: 'q3', options: ['4', '5', '9'], answer: 1, check: () => factorPairs(36).length === 5 }
  ];

  const api = { rows, area, split, digits, fourBlocks, tiling, factorPairs, pairKey, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AREA_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
