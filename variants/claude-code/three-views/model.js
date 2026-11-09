'use strict';
// Three views model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A stack is a 3×3 height map: h[y][x], x = 0..2 left → right, y = 0..2 front → back, each 0..3 unit cubes,
// no floating cubes. Every view, count, candidate list and area on the page is computed here.
(function (root) {
  const N = 3, HMAX = 3;
  // "back/middle/front" rows, x left → right, e.g. '300/200/211'.
  function parse(s) { const rows = s.split('/').map(r => r.split('').map(Number)); return [rows[2], rows[1], rows[0]]; }
  const toStr = h => [h[2], h[1], h[0]].map(r => r.join('')).join('/');
  const clone = h => h.map(r => r.slice());
  const empty = () => [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  // Front view (主视图): looking from the front towards the back; column x shows the tallest stack in that column.
  const front = h => [0, 1, 2].map(x => Math.max(h[0][x], h[1][x], h[2][x]));
  // Left view (左视图): looking from the left towards the right; drawn back-on-the-left, front-on-the-right.
  // Returned in drawing order: [back row, middle row, front row] = y = 2, 1, 0.
  const left = h => [2, 1, 0].map(y => Math.max(...h[y]));
  // Top view (俯视图): which cells hold at least one cube; drawn back row on top, front row at the bottom.
  // Returned as rows in drawing order (back first), each x left → right, 1 = occupied.
  const top = h => [2, 1, 0].map(y => h[y].map(v => (v > 0 ? 1 : 0)));
  const count = h => h.flat().reduce((s, v) => s + v, 0);
  const sameArr = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  // Which views differ between two stacks.
  const diffViews = (a, b) => ['front', 'left', 'top'].filter(v => !sameArr(VIEWS[v](a), VIEWS[v](b)));
  const VIEWS = { front, left, top };

  // Extents used for 长对正 / 高平齐 / 宽相等: occupied x-span, height, occupied y-span.
  function extents(h) {
    const xs = [0, 1, 2].filter(x => h.some(r => r[x] > 0)), ys = [0, 1, 2].filter(y => h[y].some(v => v > 0));
    return { length: xs.length ? xs[xs.length - 1] - xs[0] + 1 : 0, height: Math.max(0, ...h.flat()), width: ys.length ? ys[ys.length - 1] - ys[0] + 1 : 0 };
  }

  // Step 3: every stack consistent with the given front and left views (and optionally the top view).
  function candidates(F, L, T) {
    // L is in drawing order (y = 2,1,0); index by y.
    const Ly = [L[2], L[1], L[0]], caps = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) caps.push(Math.min(F[x], Ly[y]));
    const out = [], cur = new Array(9).fill(0);
    (function rec(i) {
      if (i === 9) {
        const h = [cur.slice(0, 3), cur.slice(3, 6), cur.slice(6, 9)];
        if (sameArr(front(h), F) && sameArr(left(h), L) && (!T || sameArr(top(h), T))) out.push(h);
        return;
      }
      for (let v = 0; v <= caps[i]; v++) { cur[i] = v; rec(i + 1); }
    })(0);
    out.sort((a, b) => count(a) - count(b) || toStr(a).localeCompare(toStr(b)));
    return out;
  }
  function ambiguity(h, withTop) {
    const list = candidates(front(h), left(h), withTop ? top(h) : null);
    const counts = list.map(count);
    return { list, n: list.length, min: Math.min(...counts), max: Math.max(...counts) };
  }

  // Step 5: surface area.
  function contacts(h) {
    let j = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      j += Math.max(0, h[y][x] - 1);                    // cube on cube
      if (x + 1 < N) j += Math.min(h[y][x], h[y][x + 1]); // side by side, left–right
      if (y + 1 < N) j += Math.min(h[y][x], h[y + 1][x]); // side by side, front–back
    }
    return j;
  }
  // Total variation of a padded line of heights = number of exposed vertical faces along that line.
  const tv = a => { const p = [0, ...a, 0]; let s = 0; for (let i = 1; i < p.length; i++) s += Math.abs(p[i] - p[i - 1]); return s; };
  function surface(h) {
    const n = count(h), j = contacts(h), occ = h.flat().filter(v => v > 0).length;
    const lr = [0, 1, 2].reduce((s, y) => s + tv(h[y]), 0);                   // faces pointing left or right
    const fb = [0, 1, 2].reduce((s, x) => s + tv([h[0][x], h[1][x], h[2][x]]), 0); // faces pointing front or back
    const F = front(h).reduce((s, v) => s + v, 0), Lv = left(h).reduce((s, v) => s + v, 0);
    const bound = 2 * (F + Lv + occ);
    return { n, j, S: 6 * n - 2 * j, tb: 2 * occ, fb, lr, F, L: Lv, T: occ, bound, hidden: 6 * n - 2 * j - bound, fbView: 2 * F, lrView: 2 * Lv };
  }

  const PRESETS = {
    L: '300/200/211',
    stairs: '321/210/100',
    middle: '010/131/010',
    valley: '000/101/313',
    towers: '003/000/300'
  };
  // Step 4 problems: the answer and two look-alikes; order is the order of the A/B/C cards.
  const QUIZ = [
    { cards: ['100/100/312', '100/100/321', '100/200/321'], answer: 1 },
    { cards: ['001/011/111', '011/011/111', '001/012/111'], answer: 0 },
    { cards: ['003/000/300', '300/000/002', '300/000/003'], answer: 2 },
    { cards: ['120/110/111', '210/110/111', '120/120/111'], answer: 0 }
  ];

  const api = { N, HMAX, parse, toStr, clone, empty, front, left, top, count, diffViews, extents, candidates, ambiguity, contacts, tv, surface, PRESETS, QUIZ, sameArr };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TV_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
