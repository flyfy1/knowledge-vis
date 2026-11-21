#!/usr/bin/env node
'use strict';
/* Writes static inline-SVG diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Run: node computing/software/how-react-updates-the-dom/tools/diagrams.cjs */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'figures');

const C = {
  ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242',
  gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
  green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254',
  card: '#1a1f2b', bg: '#0f1219'
};
const tint = (col, a) => {
  const n = parseInt(col.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;

function drawing(name) {
  const parts = [], used = new Set();
  const g = {
    box(x, y, w, h, col, o = {}) {
      parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.fill || (o.solid ? col : tint(col, o.a == null ? 0.14 : o.a))}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`);
    },
    line(x1, y1, x2, y2, col = C.mute, o = {}) {
      if (o.arrow) used.add(col);
      parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${col.slice(1)})"` : ''}/>`);
    },
    path(d, col = C.mute, o = {}) {
      if (o.arrow) used.add(col);
      parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${col.slice(1)})"` : ''}/>`);
    },
    circle(cx, cy, r, col, o = {}) {
      parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${o.fill || (o.solid ? col : tint(col, 0.16))}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"/>`);
    },
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}${o.halo ? ` stroke="${C.bg}" stroke-width="8" stroke-linejoin="round" paint-order="stroke"` : ''}`;
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    }
  };
  g.finish = (W, H) => {
    const defs = used.size
      ? '<defs>' + [...used].map(col => `<marker id="ar-${name}-${col.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`).join('') + '</defs>'
      : '';
    return `<svg viewBox="0 0 ${W} ${H}" role="img" data-i18n-aria="dg.${name}.aria">${defs}${parts.join('')}</svg>`;
  };
  return g;
}

const D = {};
function figure(name, draw) {
  const g = drawing(name), [W, H] = draw(g);
  D[name] = `<figure class="dia" id="dg-${name}" data-dg="${name}">${g.finish(W, H)}<figcaption data-i18n-html="dg.${name}.cap"></figcaption></figure>`;
}

/* ── ch1: Two trees, two phases ── */
figure('phases', g => {
  const rows = [
    { key: 's1', sub: 's1s', col: C.gold },
    { key: 's2', sub: 's2s', col: C.cyan },
    { key: 's3', sub: 's3s', col: C.red },
    { key: 's4', sub: 's4s', col: C.green },
    { key: 's5', sub: 's5s', col: C.violet }
  ];
  const bh = 54, gap = 24;
  rows.forEach((r, i) => {
    const y = 12 + i * (bh + gap);
    g.box(16, y, 328, bh, r.col);
    g.t(30, y + 18, r.key, { weight: 600 });
    g.t(30, y + 39, r.sub, { c: 'm' });
    if (i < rows.length - 1) {
      g.line(40, y + bh + 2, 40, y + bh + gap - 2, C.mute, { arrow: true });
    }
  });
  return [360, 12 + rows.length * bh + (rows.length - 1) * gap + 12];
});

/* ── ch2: React Element vs Fiber Node ── */
figure('element', g => {
  g.box(8, 14, 160, 194, C.gold);
  g.t(88, 34, 'el', { a: 'middle', c: 'g', weight: 600 });
  g.line(18, 50, 158, 50, C.line, { sw: 1 });
  g.t(18, 72, 'e1', { mono: true });
  g.t(18, 100, 'e2', { mono: true });
  g.t(18, 128, 'e3', { mono: true });
  g.t(18, 156, 'e4', { mono: true });
  g.t(18, 188, 'e5', { c: 'm' });

  g.line(170, 110, 188, 110, C.mute, { arrow: true });

  g.box(190, 14, 162, 194, C.cyan);
  g.t(271, 34, 'fib', { a: 'middle', c: 'c', weight: 600 });
  g.line(200, 50, 342, 50, C.line, { sw: 1 });
  g.t(200, 72, 'f1', { mono: true });
  g.t(200, 100, 'f2', { mono: true });
  g.t(200, 128, 'f3', { mono: true });
  g.t(200, 156, 'f4', { mono: true });
  g.t(200, 188, 'f5', { c: 'm' });
  return [360, 222];
});

/* ── ch3: Fiber linked list (child, sibling, return, alternate) ── */
figure('fiber', g => {
  const bx = (x, y, w, h, col, key, mono) => {
    g.box(x, y, w, h, col);
    g.t(x + w / 2, y + h / 2, key, { a: 'middle', mono });
  };
  // Left tree: current (or tree structure)
  bx(118, 16, 124, 34, C.mute, 'n0', true);
  bx(118, 84, 124, 34, C.cyan, 'n1', true);
  bx(24, 154, 128, 34, C.gold, 'n2', true);
  bx(208, 154, 128, 34, C.gold, 'n3', true);
  bx(24, 224, 128, 34, C.violet, 'n4', true);

  // child pointers (cyan solid down)
  g.line(180, 50, 180, 82, C.cyan, { arrow: true });
  g.line(146, 118, 104, 152, C.cyan, { arrow: true });
  g.line(74, 188, 74, 222, C.cyan, { arrow: true });

  // sibling pointer (gold right)
  g.line(154, 171, 206, 171, C.gold, { arrow: true });

  // return pointers (violet dashed up)
  g.line(258, 152, 210, 120, C.violet, { arrow: true, dash: '4 3' });
  g.line(102, 222, 102, 190, C.violet, { arrow: true, dash: '4 3' });

  // double buffer bar at bottom
  g.line(16, 276, 344, 276, C.line, { sw: 1 });
  g.box(20, 290, 134, 38, C.green);
  g.t(87, 309, 'cur', { a: 'middle', c: 'n', mono: true });
  g.line(156, 304, 204, 304, C.gold, { arrow: true });
  g.line(204, 314, 156, 314, C.cyan, { arrow: true });
  g.box(206, 290, 134, 38, C.cyan);
  g.t(273, 309, 'wip', { a: 'middle', c: 'c', mono: true });

  // Legend row
  g.t(18, 346, 'lc', { c: 'c', mono: true });
  g.t(130, 346, 'ls', { c: 'g', mono: true });
  g.t(248, 346, 'lr', { c: 'v', mono: true });
  return [360, 366];
});

/* ── ch4: Key reconciliation vs Index key ── */
figure('reconcile', g => {
  const pill = (x, y, txt, col, sub) => {
    g.box(x, y, 48, 34, col);
    g.t(x + 24, y + 17, { raw: txt }, { a: 'middle', weight: 600 });
    if (sub) g.t(x + 24, y + 48, { raw: sub }, { a: 'middle', c: 'm', mono: true });
  };
  g.t(16, 22, 'old', { weight: 600 });
  ['A', 'B', 'C'].forEach((ch, i) => pill(116 + i * 62, 6, ch, C.mute, String(i)));

  g.line(16, 72, 344, 72, C.line, { sw: 1 });

  // Case 1: key={id}
  g.t(16, 94, 'byId', { c: 'n', weight: 600 });
  pill(54, 112, 'X', C.gold, '+');
  ['A', 'B', 'C'].forEach((ch, i) => pill(116 + i * 62, 112, ch, C.green, String(i)));
  g.t(16, 182, 'idRes', { c: 'm' });

  g.line(16, 206, 344, 206, C.line, { sw: 1 });

  // Case 2: key={index}
  g.t(16, 228, 'byIdx', { c: 'r', weight: 600 });
  ['X', 'A', 'B'].forEach((ch, i) => pill(54 + i * 62, 246, ch, C.red, String(i)));
  pill(240, 246, 'C', C.gold, '+');
  g.t(16, 316, 'idxRes', { c: 'r' });
  return [360, 336];
});

/* ── ch5: Hooks singly linked list + circular pending queue ── */
figure('hooks', g => {
  g.box(12, 24, 78, 46, C.gold);
  g.t(51, 47, 'fib', { a: 'middle', mono: true, c: 'g' });
  g.line(92, 47, 114, 47, C.mute, { arrow: true });

  const hk = (x, key) => {
    g.box(x, 24, 66, 46, C.cyan);
    g.t(x + 33, 47, key, { a: 'middle', mono: true });
  };
  hk(116, 'h0');
  g.line(184, 47, 198, 47, C.mute, { arrow: true });
  hk(200, 'h1');
  g.line(268, 47, 282, 47, C.mute, { arrow: true });
  hk(284, 'h2');

  // queue.pending circular ring below h0
  g.line(149, 72, 149, 108, C.gold, { arrow: true });
  g.t(18, 92, 'q', { c: 'g', mono: true });

  g.box(96, 112, 64, 34, C.violet);
  g.t(128, 129, 'u1', { a: 'middle', mono: true });
  g.line(162, 129, 198, 129, C.violet, { arrow: true });
  g.box(200, 112, 64, 34, C.violet);
  g.t(232, 129, 'u2', { a: 'middle', mono: true });

  // wrap-around arrow u2 -> u1
  g.path('M232,148 L232,168 L128,168 L128,148', C.gold, { arrow: true });
  g.t(180, 186, 'ring', { a: 'middle', c: 'm' });
  return [360, 206];
});

/* ── ch6: subtreeFlags bubbling & skip ── */
figure('flags', g => {
  const bx = (x, y, w, key, col) => {
    g.box(x, y, w, 34, col);
    g.t(x + w / 2, y + 17, key, { a: 'middle', mono: true });
  };
  bx(116, 14, 128, 'root', C.cyan);
  g.line(150, 48, 92, 76, C.mute, { sw: 1.4 });
  g.line(210, 48, 268, 76, C.line, { sw: 1.4, dash: '4 3' });

  bx(22, 78, 140, 'left', C.cyan);
  bx(204, 78, 134, 'clean', C.mute);

  g.line(92, 112, 92, 140, C.mute, { sw: 1.4 });
  bx(22, 142, 140, 'leaf', C.gold);

  // Upward bubble arrow on left
  g.line(14, 158, 14, 32, C.gold, { arrow: true });
  g.t(22, 202, 'bub', { c: 'g' });
  g.t(204, 140, 'skip', { c: 'm' });
  return [360, 224];
});

/* ── ch7: Commit & Effect timeline ── */
figure('commit', g => {
  const blocks = [
    { x: 14, w: 68, col: C.cyan, key: 'b1' },
    { x: 86, w: 72, col: C.gold, key: 'b2' },
    { x: 162, w: 66, col: C.red, key: 'b3' },
    { x: 232, w: 54, col: C.green, key: 'b4' },
    { x: 290, w: 56, col: C.violet, key: 'b5' }
  ];
  blocks.forEach(b => {
    g.box(b.x, 42, b.w, 46, b.col);
    g.t(b.x + b.w / 2, 65, b.key, { a: 'middle' });
  });
  g.t(180, 20, 'sync', { a: 'middle', c: 'g' });
  g.line(86, 32, 228, 32, C.gold, { sw: 1.5 });
  g.t(18, 114, 'p1', { c: 'g', mono: true });
  g.t(18, 140, 'p2', { c: 'n', mono: true });
  g.t(18, 166, 'p3', { c: 'v', mono: true });
  return [360, 188];
});

/* ── ch8: Event delegation + return walk + batch ── */
figure('events', g => {
  g.box(16, 14, 328, 42, C.cyan);
  g.t(30, 35, 'root', { mono: true, c: 'c' });

  g.box(46, 86, 268, 42, C.mute);
  g.t(60, 107, 'card', { mono: true });

  g.box(76, 158, 208, 42, C.gold);
  g.t(90, 179, 'btn', { mono: true, c: 'g' });

  // Native bubble up on left
  g.line(28, 179, 28, 58, C.gold, { arrow: true });
  // Synthetic capture down & bubble up on right
  g.line(316, 58, 316, 176, C.cyan, { arrow: true });
  g.line(332, 176, 332, 58, C.violet, { arrow: true });

  g.t(16, 224, 'nat', { c: 'g' });
  g.t(16, 250, 'syn', { c: 'c' });
  g.t(16, 276, 'bat', { c: 'v' });
  return [360, 296];
});

/* ── ch9: 31-bit Lane bitmask ── */
figure('lanes', g => {
  const lanes = [
    { bit: '1', key: 'l0', val: '2', col: C.red },
    { bit: '3', key: 'l1', val: '8', col: C.gold },
    { bit: '5', key: 'l2', val: '32', col: C.cyan },
    { bit: '8..21', key: 'l3', val: '256+', col: C.violet },
    { bit: '28', key: 'l4', val: '2^28', col: C.mute }
  ];
  let x = 16;
  const widths = [50, 56, 68, 96, 50];
  lanes.forEach((ln, i) => {
    const w = widths[i];
    g.box(x, 42, w, 54, ln.col);
    g.t(x + w / 2, 58, { raw: ln.bit }, { a: 'middle', mono: true, c: 'm' });
    g.t(x + w / 2, 80, ln.key, { a: 'middle', weight: 600 });
    x += w + 2;
  });
  g.t(16, 20, 'hdr', { c: 'm', mono: true });
  g.t(16, 122, 'pick', { c: 'g', mono: true });
  g.t(16, 148, 'slice', { c: 'v' });
  return [360, 170];
});

fs.mkdirSync(OUT, { recursive: true });
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
}
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
