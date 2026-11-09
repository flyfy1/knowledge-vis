'use strict';
// Perimeter vs area lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every perimeter, area and verdict on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  const key = (x, y) => x + ',' + y;
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // A shape is a set of unit cells "x,y" on a cols × rows board. Perimeter = unit edges between a
  // filled cell and an empty cell (or the outside), so the edges round a hole count too.
  function stats(cells, cols, rows) {
    let per = 0;
    cells.forEach(k => { const [x, y] = k.split(',').map(Number); N4.forEach(([dx, dy]) => { if (!cells.has(key(x + dx, y + dy))) per++; }); });
    // pieces: connected groups of filled cells (edge neighbours)
    const seen = new Set(); let pieces = 0;
    cells.forEach(k => {
      if (seen.has(k)) return; pieces++;
      const st = [k]; seen.add(k);
      while (st.length) { const [x, y] = st.pop().split(',').map(Number); N4.forEach(([dx, dy]) => { const q = key(x + dx, y + dy); if (cells.has(q) && !seen.has(q)) { seen.add(q); st.push(q); } }); }
    });
    // holes: empty regions that cannot reach the outside of the board
    const out = new Set(), st = [];
    for (let x = -1; x <= cols; x++) for (const y of [-1, rows]) st.push(key(x, y));
    for (let y = -1; y <= rows; y++) for (const x of [-1, cols]) st.push(key(x, y));
    st.forEach(k => out.add(k));
    while (st.length) {
      const [x, y] = st.pop().split(',').map(Number);
      N4.forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy, q = key(nx, ny); if (nx < -1 || ny < -1 || nx > cols || ny > rows || out.has(q) || cells.has(q)) return; out.add(q); st.push(q); });
    }
    let holeCells = 0; for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) { const q = key(x, y); if (!cells.has(q) && !out.has(q)) holeCells++; }
    return { area: cells.size, perimeter: per, pieces, holeCells };
  }
  // How many filled neighbours a cell has; adding it changes the perimeter by 4 − 2 × that number.
  function neighbours(cells, x, y) { return N4.filter(([dx, dy]) => cells.has(key(x + dx, y + dy))).length; }
  function toggle(cells, x, y) {
    const k = key(x, y), had = cells.has(k), s = neighbours(cells, x, y);
    const next = new Set(cells); if (had) next.delete(k); else next.add(k);
    return { cells: next, added: !had, shared: s, dA: had ? -1 : 1, dP: had ? -(4 - 2 * s) : 4 - 2 * s };
  }
  const PRESETS = {
    line: ['0,0', '1,0', '2,0', '3,0', '4,0', '5,0'],
    block: ['0,0', '1,0', '2,0', '0,1', '1,1', '2,1'],
    ell: ['0,0', '1,0', '2,0', '3,0', '0,1', '0,2'],
    ring: ['0,0', '1,0', '2,0', '0,1', '2,1', '0,2', '1,2', '2,2']
  };
  const placed = (name, ox, oy) => new Set(PRESETS[name].map(k => { const [x, y] = k.split(',').map(Number); return key(x + ox, y + oy); }));

  // Step 1: a 24 m rope round a rectangle with whole-metre sides.
  const ROPE = 24;
  const rect = (L, W) => ({ L, W, perimeter: 2 * (L + W), area: L * W });
  const ropeRects = (P = ROPE) => { const out = []; for (let L = 1; L < P / 2; L++) out.push(rect(L, P / 2 - L)); return out; };

  // Step 2: stretch the 6 × 6 square by d: (6 + d) × (6 − d). Move the strip that sticks out on the right
  // up onto the strip that was lost at the top: it covers all but a d × d corner. Area = 36 − d × d.
  function stretch(d) {
    const s = ROPE / 4, r = rect(s + d, s - d);
    return { d, s, L: s + d, W: s - d, area: r.area, perimeter: r.perimeter, lost: s * d, gained: d * (s - d), corner: d * d };
  }

  // Step 3: fixed area, different ropes.
  function fixedArea(A) {
    const out = [];
    for (let w = 1; w * w <= A; w++) if (A % w === 0) out.push(rect(A / w, w));
    return out;
  }

  // Step 4: scale a shape by k (every cell becomes a k × k block).
  const BASES = { rect: ['0,0', '1,0', '2,0', '0,1', '1,1', '2,1'], ell: ['0,0', '1,0', '2,0', '0,1', '0,2'] };
  function scaled(name, k) {
    const cells = new Set();
    BASES[name].forEach(q => { const [x, y] = q.split(',').map(Number); for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) cells.add(key(x * k + i, y * k + j)); });
    return { cells, ...stats(cells, 3 * k, 3 * k) };
  }

  // Step 5 self-test.
  const QUIZ = [
    { id: 'q1', options: ['@q1a', '@q1b'], answer: 1, check: () => rect(1, 5).perimeter === rect(3, 3).perimeter && rect(1, 5).area !== rect(3, 3).area },
    { id: 'q2', options: ['24', '25', '100'], answer: 1, check: () => Math.max(...ropeRects(20).map(r => r.area)) === 25 && rect(5, 5).perimeter === 20 },
    { id: 'q3', options: ['30', '60', '120'], answer: 1, check: () => rect(6, 10).area === 60 && rect(3, 5).area * 4 === 60 }
  ];

  const api = { key, stats, neighbours, toggle, PRESETS, placed, ROPE, rect, ropeRects, stretch, fixedArea, BASES, scaled, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PA_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
