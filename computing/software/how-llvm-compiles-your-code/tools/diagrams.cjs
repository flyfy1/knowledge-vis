#!/usr/bin/env node
'use strict';
/* Writes static inline SVG diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   ViewBox is 360 wide, shown at <= 560 px wide. Every <text> has explicit x, y, font-size >= 14,
   no transform, and stacked text lines inside boxes are >= 22 px apart (box height >= 54).
   All natural-language strings live in data-i18n="dg.<name>.<key>" (never literal {id}). */
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

/* ── ch1: N frontends -> 1 LLVM IR -> M backends ── */
figure('arch', g => {
  const fes = [
    { key: 'f1', sub: 'C / C++', y: 14, col: C.gold },
    { key: 'f2', sub: 'Rust', y: 78, col: C.gold },
    { key: 'f3', sub: 'Swift/Julia', y: 142, col: C.gold },
  ];
  for (const f of fes) {
    g.box(12, f.y, 96, 54, f.col);
    g.t(60, f.y + 17, f.key, { a: 'middle', weight: 600 });
    g.t(60, f.y + 39, { raw: f.sub }, { a: 'middle', c: 'm' });
    g.line(108, f.y + 27, 136, 105, C.mute, { arrow: true });
  }
  g.box(138, 38, 84, 134, C.cyan, { a: 0.16 });
  g.t(180, 82, { raw: 'LLVM' }, { a: 'middle', c: 'c', weight: 700, mono: true });
  g.t(180, 106, { raw: 'IR' }, { a: 'middle', c: 'c', weight: 700, mono: true });
  g.t(180, 134, 'opt', { a: 'middle', c: 'm' });

  const bes = [
    { raw: 'AArch64', sub: 'arm64', y: 14, col: C.green },
    { raw: 'x86_64', sub: 'amd64', y: 78, col: C.green },
    { raw: 'RISC-V', sub: 'rv64', y: 142, col: C.green },
  ];
  for (const b of bes) {
    g.line(222, 105, 250, b.y + 27, C.mute, { arrow: true });
    g.box(252, b.y, 96, 54, b.col);
    g.t(300, b.y + 17, { raw: b.raw }, { a: 'middle', weight: 600, mono: true });
    g.t(300, b.y + 39, { raw: b.sub }, { a: 'middle', c: 'm', mono: true });
  }
  g.t(180, 218, 'sum', { a: 'middle', c: 'g' });
  return [360, 236];
});

/* ── ch2: -O0 alloca stack slots vs -O2 registers ── */
figure('alloca', g => {
  g.t(16, 18, 'left', { c: 'r', weight: 600 });
  g.box(16, 36, 152, 54, C.red, { a: 0.12 });
  g.t(24, 53, { raw: '%5 = alloca i32' }, { mono: true });
  g.t(24, 75, 'slot', { c: 'm' });

  g.box(16, 104, 152, 54, C.red, { a: 0.12 });
  g.t(24, 121, { raw: 'load->add->store' }, { mono: true });
  g.t(24, 143, 'mem', { c: 'm' });

  g.line(170, 105, 194, 105, C.gold, { arrow: true, sw: 2 });

  g.t(198, 18, 'right', { c: 'n', weight: 600 });
  g.box(198, 36, 148, 54, C.green, { a: 0.12 });
  g.t(206, 53, { raw: '%63 = phi i32' }, { mono: true });
  g.t(206, 75, 'vreg', { c: 'm' });

  g.box(198, 104, 148, 54, C.green, { a: 0.12 });
  g.t(206, 121, { raw: '%66 = add nsw' }, { mono: true });
  g.t(206, 143, 'nomem', { c: 'm' });
  return [360, 174];
});

/* ── ch3: SSA Dominance Frontier & phi node ── */
figure('ssa', g => {
  // B0 top
  g.box(92, 12, 176, 54, C.cyan);
  g.t(180, 29, { raw: 'B0: entry' }, { a: 'middle', mono: true, weight: 600 });
  g.t(180, 51, { raw: '%x.0 = add %a, 1' }, { a: 'middle', c: 'm', mono: true });

  // B1 left, B2 right
  g.line(130, 66, 90, 96, C.mute, { arrow: true });
  g.line(230, 66, 270, 96, C.mute, { arrow: true });

  g.box(14, 98, 152, 54, C.gold);
  g.t(90, 115, { raw: 'B1: then' }, { a: 'middle', mono: true, weight: 600 });
  g.t(90, 137, { raw: '%x.1 = mul %b, 2' }, { a: 'middle', c: 'm', mono: true });

  g.box(194, 98, 152, 54, C.violet);
  g.t(270, 115, { raw: 'B2: else' }, { a: 'middle', mono: true, weight: 600 });
  g.t(270, 137, { raw: '%x.2 = sub %a, 3' }, { a: 'middle', c: 'm', mono: true });

  // Merge B3
  g.line(90, 152, 130, 184, C.mute, { arrow: true });
  g.line(270, 152, 230, 184, C.mute, { arrow: true });

  g.box(34, 186, 292, 62, C.green, { a: 0.16 });
  g.t(180, 205, 'df', { a: 'middle', c: 'n', weight: 600 });
  g.t(180, 229, { raw: '%x.3=phi[%x.1,%B1],[%x.2,%B2]' }, { a: 'middle', mono: true });
  return [360, 264];
});

/* ── ch4: Iterative pass pipeline to fixed point ── */
figure('pipeline', g => {
  const steps = [
    { key: 'p1', sub: 'SROA / mem2reg', col: C.cyan },
    { key: 'p2', sub: 'InstCombine', col: C.gold },
    { key: 'p3', sub: 'SimplifyCFG + GVN', col: C.violet },
    { key: 'p4', sub: 'ADCE / DCE', col: C.green },
  ];
  const bh = 54, gap = 22;
  steps.forEach((s, i) => {
    const y = 14 + i * (bh + gap);
    g.box(16, y, 220, bh, s.col);
    g.t(28, y + 17, s.key, { weight: 600 });
    g.t(28, y + 39, { raw: s.sub }, { c: 'm', mono: true });
    if (i < steps.length - 1) {
      g.line(126, y + bh, 126, y + bh + gap - 2, C.mute, { arrow: true });
    }
  });
  const yTop = 14 + 27;
  const yBot = 14 + 3 * (bh + gap) + 27;
  g.path(`M238,${yBot} L256,${yBot} L256,${yTop} L240,${yTop}`, C.gold, { dash: '5 3', arrow: true });
  g.t(266, (yTop + yBot) / 2, 'fix', { a: 'start', c: 'g' });
  return [360, 14 + 4 * bh + 3 * gap + 14];
});

/* ── ch5: LICM preheader + vector loop + tail ── */
figure('licm', g => {
  g.box(18, 14, 324, 54, C.gold);
  g.t(30, 31, 'pre', { c: 'g', weight: 600 });
  g.t(30, 53, { raw: '%k = shl (load ptr %b), 1' }, { c: 'm', mono: true });

  g.line(180, 68, 180, 90, C.mute, { arrow: true });

  g.box(18, 92, 324, 62, C.cyan);
  g.t(30, 111, 'vec', { c: 'c', weight: 600 });
  g.t(30, 135, { raw: 'add <4 x i32> %v, splat(%k)' }, { c: 'm', mono: true });

  g.line(180, 154, 180, 176, C.mute, { arrow: true });

  g.box(18, 178, 324, 54, C.violet);
  g.t(30, 195, 'tail', { c: 'v', weight: 600 });
  g.t(30, 217, 'taild', { c: 'm' });
  return [360, 246];
});

/* ── ch6: UB nsw poison vs hardware two's complement ── */
figure('ub', g => {
  g.box(18, 14, 324, 54, C.ink, { a: 0.08 });
  g.t(180, 31, { raw: 'x = INT_MAX (2,147,483,647)' }, { a: 'middle', mono: true, weight: 600 });
  g.t(180, 53, 'src', { a: 'middle', c: 'm' });

  g.line(100, 68, 90, 96, C.cyan, { arrow: true });
  g.line(260, 68, 270, 96, C.red, { arrow: true });

  g.box(14, 98, 156, 76, C.cyan);
  g.t(92, 117, 'hw', { a: 'middle', c: 'c', weight: 600 });
  g.t(92, 141, { raw: 'INT_MIN < x' }, { a: 'middle', mono: true });
  g.t(92, 162, 'hwres', { a: 'middle', c: 'm' });

  g.box(190, 98, 156, 76, C.red);
  g.t(268, 117, 'ir', { a: 'middle', c: 'r', weight: 600 });
  g.t(268, 141, { raw: 'add nsw -> poison' }, { a: 'middle', mono: true });
  g.t(268, 162, 'irres', { a: 'middle', c: 'm' });
  return [360, 190];
});

/* ── ch7: SelectionDAG tiling (madd / shift-add / lea) ── */
figure('isel', g => {
  // DAG nodes on top, dashed tiling boundary, ARM64 + x86_64 boxes below
  g.box(34, 16, 292, 92, C.gold, { dash: '5 3', a: 0.08 });
  g.t(180, 32, 'tile', { a: 'middle', c: 'g', weight: 600 });

  g.box(48, 48, 112, 46, C.cyan);
  g.t(104, 71, { raw: 'mul %a, %b' }, { a: 'middle', mono: true });

  g.line(160, 71, 196, 71, C.mute, { arrow: true });

  g.box(200, 48, 112, 46, C.cyan);
  g.t(256, 71, { raw: 'add %t, %c' }, { a: 'middle', mono: true });

  g.line(104, 108, 92, 140, C.green, { arrow: true });
  g.line(256, 108, 268, 140, C.violet, { arrow: true });

  g.box(14, 142, 158, 54, C.green);
  g.t(93, 159, { raw: 'AArch64 (1 op)' }, { a: 'middle', c: 'n', weight: 600 });
  g.t(93, 181, { raw: 'madd w0,w1,w0,w2' }, { a: 'middle', mono: true });

  g.box(188, 142, 158, 54, C.violet);
  g.t(267, 159, { raw: 'x86_64 (2 ops)' }, { a: 'middle', c: 'v', weight: 600 });
  g.t(267, 181, { raw: 'imull + leal' }, { a: 'middle', mono: true });
  return [360, 212];
});

/* ── ch8: Live intervals & K=3 Interference Graph ── */
figure('regalloc', g => {
  // Left: live intervals; Right: 4-node interference graph with 1 spill at K=3
  g.t(16, 16, 'left', { c: 'c', weight: 600 });
  const bars = [
    { id: '%v0', x: 54, w: 112, y: 38, col: C.gold },
    { id: '%v1', x: 68, w: 84, y: 66, col: C.cyan },
    { id: '%v2', x: 82, w: 56, y: 94, col: C.green },
    { id: '%v3', x: 96, w: 72, y: 122, col: C.red },
  ];
  for (const b of bars) {
    g.t(16, b.y + 8, { raw: b.id }, { mono: true, c: b.col === C.red ? 'r' : '' });
    g.box(b.x, b.y, b.w, 16, b.col, { a: 0.45, rx: 3 });
  }
  g.line(108, 30, 108, 146, C.mute, { dash: '3 3', sw: 1.2 });
  g.t(16, 164, 'peak', { c: 'm' });

  // Right: K_4 clique -> 3 colors + 1 red spill node
  g.t(200, 16, 'right', { c: 'g', weight: 600 });
  const pts = [[240, 54], [320, 54], [240, 128], [320, 128]];
  const pCols = [C.gold, C.cyan, C.green, C.red];
  const tags = ['w0', 'w1', 'w2', 'sp'];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    g.line(pts[i][0], pts[i][1], pts[j][0], pts[j][1], C.line, { sw: 1.4 });
  }
  pts.forEach(([px, py], i) => {
    g.circle(px, py, 16, pCols[i], { a: 0.28, sw: i === 3 ? 2 : 1.5 });
    g.t(px, py, { raw: tags[i] }, { a: 'middle', mono: true, weight: 700, c: i === 3 ? 'r' : '' });
  });
  g.t(280, 164, 'spill', { a: 'middle', c: 'r' });
  return [360, 184];
});

/* ── ch9: Separate -O2 vs ThinLTO bitcode + summary ── */
figure('lto', g => {
  g.t(16, 16, 'sep', { c: 'r', weight: 600 });
  g.box(16, 32, 118, 54, C.mute);
  g.t(75, 49, { raw: 'a.o (arm64)' }, { a: 'middle', mono: true });
  g.t(75, 71, { raw: 'bl _add_mul' }, { a: 'middle', c: 'r', mono: true });

  g.box(156, 32, 118, 54, C.mute);
  g.t(215, 49, { raw: 'b.o (arm64)' }, { a: 'middle', mono: true });
  g.t(215, 71, { raw: '_add_mul:' }, { a: 'middle', c: 'm', mono: true });

  g.line(276, 59, 294, 59, C.mute, { arrow: true });
  g.box(296, 32, 50, 54, C.red, { a: 0.14 });
  g.t(321, 59, { raw: 'ld' }, { a: 'middle', mono: true, c: 'r', weight: 700 });

  g.t(16, 110, 'thin', { c: 'n', weight: 600 });
  g.box(16, 126, 118, 54, C.cyan);
  g.t(75, 143, { raw: 'a.o (IR + idx)' }, { a: 'middle', mono: true });
  g.t(75, 165, 'call', { a: 'middle', c: 'm' });

  g.box(156, 126, 118, 54, C.cyan);
  g.t(215, 143, { raw: 'b.o (IR + idx)' }, { a: 'middle', mono: true });
  g.t(215, 165, 'body', { a: 'middle', c: 'm' });

  g.line(276, 153, 294, 153, C.green, { arrow: true });
  g.box(296, 126, 50, 54, C.green, { a: 0.18 });
  g.t(321, 143, { raw: 'LTO' }, { a: 'middle', mono: true, c: 'n', weight: 700 });
  g.t(321, 165, { raw: '#42' }, { a: 'middle', mono: true, c: 'g', weight: 700 });
  return [360, 196];
});

fs.mkdirSync(OUT, { recursive: true });
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
}
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
