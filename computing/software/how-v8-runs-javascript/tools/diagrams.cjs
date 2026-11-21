#!/usr/bin/env node
'use strict';
/* Writes static inline SVG diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   ViewBox is 360 wide, rendered at <= 560 px wide. Every <text> uses font-size >= 14, explicit x/y,
   no transform, and stacked text lines inside boxes are >= 22px apart (box height >= 54). */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'figures');

const C = {
  ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242',
  gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
  green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254', bg: '#0f1219',
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
    },
  };
  g.finish = (W, H) => {
    const defs = used.size ? '<defs>' + [...used].map(col => `<marker id="ar-${name}-${col.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`).join('') + '</defs>' : '';
    return `<svg viewBox="0 0 ${W} ${H}" role="img" data-i18n-aria="dg.${name}.aria">${defs}${parts.join('')}</svg>`;
  };
  return g;
}

const D = {};
function figure(name, draw) {
  const g = drawing(name), [W, H] = draw(g);
  D[name] = `<figure class="dia" id="dg-${name}" data-dg="${name}">${g.finish(W, H)}<figcaption data-i18n-html="dg.${name}.cap"></figcaption></figure>`;
}

/* ── ch1: 4-tier pipeline + deopt bailout ── */
figure('pipeline', g => {
  const cols = [C.mute, C.cyan, C.green, C.gold, C.violet];
  const bh = 54, gap = 34;
  for (let i = 0; i < 5; i++) {
    const y = 12 + i * (bh + gap);
    g.box(14, y, 258, bh, cols[i]);
    g.t(24, y + 17, 'l' + (i + 1), { weight: 600 });
    g.t(24, y + 39, 'l' + (i + 1) + 's', { c: 'm' });
    if (i < 4) {
      const yy = y + bh;
      g.line(40, yy + 3, 40, yy + gap - 3, C.mute, { arrow: true });
      g.t(52, yy + gap / 2, 'x' + (i + 1), { c: 'g', mono: true });
    }
  }
  const yIgn = 12 + 1 * (bh + gap) + bh / 2;
  const yMag = 12 + 3 * (bh + gap) + bh / 2;
  const yTf = 12 + 4 * (bh + gap) + bh / 2;
  g.path(`M274,${yTf} L346,${yTf} L346,${yIgn} L276,${yIgn}`, C.red, { dash: '5 3', arrow: true });
  g.line(274, yMag, 346, yMag, C.red, { dash: '5 3' });
  g.t(340, 12 + 3 * (bh + gap) - gap / 2, 'deopt', { a: 'end', c: 'r', halo: true });
  return [360, 12 + 5 * bh + 4 * gap + 12];
});

/* ── ch2: Pointer tagging (32-bit compressed vs 64-bit full) ── */
figure('tagging', g => {
  // Section 1: 32-bit Chrome compressed
  g.t(14, 16, 'm32', { c: 'c', weight: 600 });
  g.box(14, 34, 278, 54, C.green);
  g.box(296, 34, 50, 54, C.green, { a: 0.28 });
  g.t(24, 51, 's31p', { mono: true });
  g.t(24, 73, 's31d', { c: 'm' });
  g.t(321, 61, { raw: '0' }, { a: 'middle', mono: true, weight: 700, c: 'n' });

  g.box(14, 98, 278, 54, C.gold);
  g.box(296, 98, 50, 54, C.gold, { a: 0.28 });
  g.t(24, 115, 'p31p', { mono: true });
  g.t(24, 137, 'p31d', { c: 'm' });
  g.t(321, 125, { raw: '1' }, { a: 'middle', mono: true, weight: 700, c: 'g' });

  // Section 2: 64-bit Node full + HeapNumber box
  g.t(14, 174, 'm64', { c: 'v', weight: 600 });
  g.box(14, 192, 162, 54, C.green);
  g.box(180, 192, 166, 54, C.mute, { a: 0.08 });
  g.t(95, 209, 's32p', { a: 'middle', mono: true });
  g.t(95, 231, 's32d', { a: 'middle', c: 'm' });
  g.t(263, 219, { raw: '0x00000000' }, { a: 'middle', mono: true, c: 'm' });

  g.box(14, 260, 278, 54, C.red);
  g.box(296, 260, 50, 54, C.red, { a: 0.28 });
  g.t(24, 277, 'h64p', { mono: true });
  g.t(24, 299, 'h64d', { c: 'm' });
  g.t(321, 287, { raw: '1' }, { a: 'middle', mono: true, weight: 700, c: 'r' });

  g.line(180, 316, 180, 342, C.red, { arrow: true });
  g.box(14, 346, 332, 54, C.red, { a: 0.10 });
  g.t(24, 363, 'hn1', { mono: true, weight: 600 });
  g.t(24, 385, 'hn2', { c: 'm' });
  return [360, 412];
});

/* ── ch3: Map transition tree ── */
figure('map-tree', g => {
  // Root M0 at top
  g.box(116, 12, 128, 54, C.mute, { a: 0.12 });
  g.t(180, 29, { raw: 'M0 {}' }, { a: 'middle', mono: true, weight: 600 });
  g.t(180, 51, 'root', { a: 'middle', c: 'm' });

  // Left branch: +x -> M1 -> +y -> M2
  g.line(146, 66, 86, 108, C.green, { arrow: true });
  g.t(102, 82, { raw: '+x' }, { a: 'end', mono: true, c: 'n' });
  g.box(14, 112, 144, 54, C.green);
  g.t(86, 129, { raw: 'M1 {x}' }, { a: 'middle', mono: true, weight: 600 });
  g.t(86, 151, 'off0', { a: 'middle', c: 'm' });

  g.line(86, 166, 86, 206, C.green, { arrow: true });
  g.t(94, 186, { raw: '+y' }, { mono: true, c: 'n' });
  g.box(14, 210, 144, 54, C.green);
  g.t(86, 227, { raw: 'M2 {x, y}' }, { a: 'middle', mono: true, weight: 600 });
  g.t(86, 249, 'fast2', { a: 'middle', c: 'n' });

  // Right branch: +y -> M3 -> +x -> M4
  g.line(214, 66, 274, 108, C.gold, { arrow: true });
  g.t(258, 82, { raw: '+y' }, { mono: true, c: 'g' });
  g.box(202, 112, 144, 54, C.gold);
  g.t(274, 129, { raw: 'M3 {y}' }, { a: 'middle', mono: true, weight: 600 });
  g.t(274, 151, 'off0', { a: 'middle', c: 'm' });

  g.line(274, 166, 274, 206, C.gold, { arrow: true });
  g.t(282, 186, { raw: '+x' }, { mono: true, c: 'g' });
  g.box(202, 210, 144, 54, C.gold);
  g.t(274, 227, { raw: 'M4 {y, x}' }, { a: 'middle', mono: true, weight: 600 });
  g.t(274, 249, 'fork', { a: 'middle', c: 'g' });

  // Bottom: delete fallback to dictionary
  g.line(180, 268, 180, 304, C.red, { dash: '5 3', arrow: true });
  g.t(190, 286, 'del', { mono: true, c: 'r' });
  g.box(24, 308, 312, 54, C.red);
  g.t(180, 325, 'dict1', { a: 'middle', weight: 600, c: 'r' });
  g.t(180, 347, 'dict2', { a: 'middle', c: 'm' });
  return [360, 374];
});

/* ── ch4: Inline Cache FeedbackVector slot transitions ── */
figure('ic', g => {
  const rows = [
    { key: 'u', sub: 'us', col: C.mute, edge: 'e1' },
    { key: 'm', sub: 'ms', col: C.green, edge: 'e2' },
    { key: 'p', sub: 'ps', col: C.gold, edge: 'e3' },
    { key: 'g', sub: 'gs', col: C.red, edge: null },
  ];
  const bh = 54, gap = 32;
  rows.forEach((r, i) => {
    const y = 12 + i * (bh + gap);
    g.box(14, y, 332, bh, r.col);
    g.t(28, y + 17, r.key, { weight: 600, mono: i > 0 });
    g.t(28, y + 39, r.sub, { c: 'm' });
    if (r.edge) {
      const yy = y + bh;
      g.line(48, yy + 3, 48, yy + gap - 3, C.mute, { arrow: true });
      g.t(62, yy + gap / 2, r.edge, { c: 'c' });
    }
  });
  return [360, 12 + 4 * bh + 3 * gap + 12];
});

/* ── ch5: Ignition Accumulator VM + FeedbackVector ── */
figure('ignition', g => {
  g.box(14, 12, 332, 64, C.cyan);
  g.t(26, 29, 'bc', { weight: 600 });
  g.t(26, 53, { raw: 'GetNamedProperty a0, [0:"x"], FBV[1]' }, { mono: true, c: 'c' });

  g.line(100, 76, 100, 108, C.cyan, { arrow: true });
  g.line(250, 76, 250, 108, C.gold, { arrow: true });

  g.box(14, 112, 160, 62, C.green);
  g.t(94, 130, 'acc', { a: 'middle', weight: 600, c: 'n' });
  g.t(94, 154, 'accs', { a: 'middle', c: 'm' });

  g.box(186, 112, 160, 62, C.gold);
  g.t(266, 130, 'reg', { a: 'middle', weight: 600, c: 'g' });
  g.t(266, 154, { raw: 'a0, r0, r1, ...' }, { a: 'middle', mono: true, c: 'm' });

  g.line(180, 174, 180, 206, C.violet, { arrow: true });
  g.box(14, 210, 332, 54, C.violet);
  g.t(26, 227, 'fbv', { weight: 600, c: 'v' });
  g.t(26, 249, 'fbvs', { c: 'm' });
  return [360, 276];
});

/* ── ch6: Speculative optimization & Deopt bailout ── */
figure('deopt', g => {
  g.box(14, 12, 332, 54, C.gold);
  g.t(180, 29, 'jit', { a: 'middle', weight: 600, c: 'g' });
  g.t(180, 51, { raw: 'CheckMaps(o, M1) / CheckSmi(x)' }, { a: 'middle', mono: true, c: 'm' });

  g.line(108, 66, 108, 106, C.green, { arrow: true });
  g.t(98, 86, 'ok', { a: 'end', c: 'n' });
  g.box(14, 110, 160, 54, C.green);
  g.t(94, 127, 'fast1', { a: 'middle', weight: 600, c: 'n' });
  g.t(94, 149, { raw: '[rax + 24]' }, { a: 'middle', mono: true, c: 'm' });

  g.line(252, 66, 252, 106, C.red, { arrow: true });
  g.t(262, 86, 'fail', { c: 'r' });
  g.box(186, 110, 160, 54, C.red);
  g.t(266, 127, 'bail1', { a: 'middle', weight: 600, c: 'r' });
  g.t(266, 149, 'bail2', { a: 'middle', c: 'm' });

  g.line(265, 164, 265, 198, C.red, { arrow: true });
  g.box(14, 202, 332, 54, C.cyan);
  g.t(180, 219, 'ign1', { a: 'middle', weight: 600, c: 'c' });
  g.t(180, 241, 'ign2', { a: 'middle', c: 'm' });
  return [360, 268];
});

/* ── ch7: One-way ElementsKind lattice ── */
figure('elements', g => {
  const bw = 100, bh = 54;
  const cols = [14, 130, 246];
  // Top row: PACKED
  g.box(cols[0], 14, bw, bh, C.green);
  g.t(cols[0] + 50, 31, { raw: 'PACKED_SMI' }, { a: 'middle', mono: true, c: 'n', weight: 600 });
  g.t(cols[0] + 50, 53, 'ps', { a: 'middle', c: 'm' });

  g.line(cols[0] + bw, 41, cols[1], 41, C.mute, { arrow: true });
  g.box(cols[1], 14, bw, bh, C.cyan);
  g.t(cols[1] + 50, 31, { raw: 'PACKED_DBL' }, { a: 'middle', mono: true, c: 'c', weight: 600 });
  g.t(cols[1] + 50, 53, 'pd', { a: 'middle', c: 'm' });

  g.line(cols[1] + bw, 41, cols[2], 41, C.mute, { arrow: true });
  g.box(cols[2], 14, bw, bh, C.gold);
  g.t(cols[2] + 50, 31, { raw: 'PACKED' }, { a: 'middle', mono: true, c: 'g', weight: 600 });
  g.t(cols[2] + 50, 53, 'pt', { a: 'middle', c: 'm' });

  // Vertical one-way arrows down to HOLEY
  for (let i = 0; i < 3; i++) g.line(cols[i] + 50, 68, cols[i] + 50, 108, C.red, { arrow: true });

  // Middle row: HOLEY
  g.box(cols[0], 112, bw, bh, C.gold);
  g.t(cols[0] + 50, 129, { raw: 'HOLEY_SMI' }, { a: 'middle', mono: true, c: 'g', weight: 600 });
  g.t(cols[0] + 50, 151, 'hs', { a: 'middle', c: 'm' });

  g.line(cols[0] + bw, 139, cols[1], 139, C.mute, { arrow: true });
  g.box(cols[1], 112, bw, bh, C.violet);
  g.t(cols[1] + 50, 129, { raw: 'HOLEY_DBL' }, { a: 'middle', mono: true, c: 'v', weight: 600 });
  g.t(cols[1] + 50, 151, 'hd', { a: 'middle', c: 'm' });

  g.line(cols[1] + bw, 139, cols[2], 139, C.mute, { arrow: true });
  g.box(cols[2], 112, bw, bh, C.red);
  g.t(cols[2] + 50, 129, { raw: 'HOLEY' }, { a: 'middle', mono: true, c: 'r', weight: 600 });
  g.t(cols[2] + 50, 151, 'ht', { a: 'middle', c: 'm' });

  // Bottom: Dictionary fallback
  g.line(296, 166, 296, 204, C.red, { dash: '5 3', arrow: true });
  g.box(14, 208, 332, bh, C.red, { a: 0.10 });
  g.t(180, 225, { raw: 'DICTIONARY_ELEMENTS' }, { a: 'middle', mono: true, c: 'r', weight: 600 });
  g.t(180, 247, 'dict', { a: 'middle', c: 'm' });
  return [360, 274];
});

/* ── ch8: Orinoco Generational GC ── */
figure('gc', g => {
  // Young Gen container
  g.box(14, 12, 332, 96, C.cyan, { a: 0.08 });
  g.t(24, 30, 'yg', { weight: 600, c: 'c' });
  g.box(24, 46, 140, 50, C.gold);
  g.t(94, 71, 'from', { a: 'middle' });
  g.line(166, 71, 194, 71, C.green, { arrow: true });
  g.box(196, 46, 140, 50, C.green);
  g.t(266, 71, 'to', { a: 'middle' });

  // Staggered y levels for Write Barrier (y=128) and Promotion (y=154) so labels never share a baseline
  g.line(292, 108, 292, 174, C.gold, { arrow: true });
  g.t(280, 152, 'promo', { a: 'end', c: 'g' });

  g.line(68, 176, 68, 110, C.red, { dash: '4 3', arrow: true });
  g.t(80, 128, 'wb', { c: 'r' });

  // Old Gen
  g.box(14, 176, 332, 92, C.violet, { a: 0.10 });
  g.t(24, 194, 'og', { weight: 600, c: 'v' });
  g.t(24, 220, 'tri', { c: 'm' });
  g.t(24, 246, 'conc', { c: 'n' });
  return [360, 280];
});

/* ── ch9: Event loop seam (V8 MicrotaskCheckpoint vs Host libuv) ── */
figure('eventloop', g => {
  // Left: V8 Engine (wider 172px box so microtask labels fit comfortably inside)
  g.box(12, 12, 172, 180, C.cyan, { a: 0.08 });
  g.t(98, 30, 'v8', { a: 'middle', weight: 600, c: 'c' });
  g.box(22, 48, 152, 54, C.green);
  g.t(98, 65, 'stack', { a: 'middle', weight: 600 });
  g.t(98, 87, 'stacks', { a: 'middle', c: 'm' });

  g.line(98, 102, 98, 126, C.gold, { arrow: true });
  g.box(22, 128, 152, 54, C.gold);
  g.t(98, 145, 'micro', { a: 'middle', weight: 600, c: 'g' });
  g.t(98, 167, 'micros', { a: 'middle', c: 'm' });

  // Right: Host libuv
  g.box(198, 12, 150, 180, C.violet, { a: 0.08 });
  g.t(273, 30, 'host', { a: 'middle', weight: 600, c: 'v' });
  g.box(208, 48, 130, 54, C.violet);
  g.t(273, 65, 'timers', { a: 'middle', mono: true });
  g.t(273, 87, 'poll', { a: 'middle', c: 'm' });

  g.box(208, 128, 130, 54, C.mute, { a: 0.12 });
  g.t(273, 145, 'check', { a: 'middle', mono: true });
  g.t(273, 167, 'macro', { a: 'middle', c: 'm' });

  g.line(208, 75, 174, 75, C.cyan, { arrow: true });
  g.line(174, 155, 206, 155, C.gold, { arrow: true });
  g.t(180, 212, 'seam', { a: 'middle', c: 'r' });
  return [360, 232];
});

fs.mkdirSync(OUT, { recursive: true });
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
}
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
