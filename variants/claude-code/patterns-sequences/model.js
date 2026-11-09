'use strict';
// Patterns lesson model (tables pushed together). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Seats are counted from the drawing itself: build the table outlines, find the edges that touch another
// table (no one can sit there), and put one seat on every free edge. The formulas on the page are
// checked against this count in tests/core.cjs; they are never used to draw the seats.
(function (root) {
  const SHAPES = { triangle: 3, square: 4, hexagon: 6 };
  const R3 = Math.sqrt(3);

  // Table outlines (side length 1) for n tables of one shape pushed into a row, each sharing one edge with the next.
  function row(shape, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      if (shape === 'square') out.push([[i, 0], [i + 1, 0], [i + 1, 1], [i, 1]]);
      else if (shape === 'triangle') {
        const h = R3 / 2, x = Math.floor(i / 2);
        out.push(i % 2 === 0 ? [[x, 0], [x + 1, 0], [x + 0.5, h]] : [[x + 0.5, h], [x + 1, 0], [x + 1.5, h]]);
      } else { // hexagon, pointy top, neighbours share a vertical edge
        const cx = i * R3, cy = 0;
        out.push(Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + k * Math.PI / 3; return [cx + Math.cos(a), cy + Math.sin(a)]; }));
      }
    }
    return out;
  }
  // k × k block of square tables.
  function block(k) {
    const out = [];
    for (let r = 0; r < k; r++) for (let c = 0; c < k; c++) out.push([[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]]);
    return out;
  }
  const key = p => `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)}`;
  // Free edges = edges that belong to exactly one table. Each gets one seat, placed just outside its midpoint.
  function seats(polys) {
    const count = new Map(), list = [];
    polys.forEach((poly, pi) => poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length], k = [key(p), key(q)].sort().join('|');
      count.set(k, (count.get(k) || 0) + 1); list.push({ k, p, q, pi });
    }));
    const free = [], hidden = [];
    list.forEach(e => {
      const poly = polys[e.pi], cx = poly.reduce((s, v) => s + v[0], 0) / poly.length, cy = poly.reduce((s, v) => s + v[1], 0) / poly.length;
      const mx = (e.p[0] + e.q[0]) / 2, my = (e.p[1] + e.q[1]) / 2, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy);
      const seat = { x: mx + dx / d * 0.32, y: my + dy / d * 0.32, table: e.pi, mx, my };
      (count.get(e.k) === 1 ? free : hidden).push(seat);
    });
    return { free, hidden, tables: polys.length };
  }
  // Seating order used when the page numbers the seats: walk round the outline (by angle about the centre).
  function seatOrder(free) {
    const cx = free.reduce((s, v) => s + v.x, 0) / free.length, cy = free.reduce((s, v) => s + v.y, 0) / free.length;
    return free.slice().sort((a, b) => Math.atan2(b.y - cy, b.x - cx) - Math.atan2(a.y - cy, a.x - cx));
  }
  const countRow = (shape, n) => seats(row(shape, n)).free.length;
  // The rule the page finds: every table brings its own seats, every joint hides two.
  const perTable = shape => SHAPES[shape] - 2;
  const formula = (shape, n) => perTable(shape) * n + 2;
  // Reverse question: fewest tables for S guests (at least one table).
  function tablesNeeded(S, shape = 'square') { return Math.max(1, Math.ceil((S - 2) / perTable(shape))); }
  // Increments between neighbouring terms.
  const diffs = arr => arr.slice(1).map((v, i) => v - arr[i]);

  const api = { SHAPES, row, block, seats, seatOrder, countRow, perTable, formula, tablesNeeded, diffs };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PATTERN_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
