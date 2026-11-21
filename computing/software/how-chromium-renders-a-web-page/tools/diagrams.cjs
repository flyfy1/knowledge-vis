#!/usr/bin/env node
'use strict';
/* Writes static inline-SVG diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Every <text> uses explicit x, y, font-size >= 14 and no transform, with text from data-i18n="dg.<name>.<key>".
   Stacked 14px lines inside boxes are separated by >= 22px (box height >= 54) so CJK fallback fonts never overlap. */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'figures');
const C = {
  ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949',
  cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb',
  dim: '#3a4254', card: '#1a1f2b', bg: '#0f1219'
};
const tint = (col, a) => {
  const n = parseInt(col.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;

function drawing(name) {
  const parts = [];
  const used = new Set();
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
      if (typeof key === 'object') parts.push(`<text ${attrs}>${key.raw}</text>`);
      else parts.push(`<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    }
  };
  g.finish = (W, H) => {
    const defs = used.size
      ? '<defs>' + [...used].map(col =>
        `<marker id="ar-${name}-${col.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`
      ).join('') + '</defs>'
      : '';
    return `<svg viewBox="0 0 ${W} ${H}" role="img" data-i18n-aria="dg.${name}.aria">${defs}${parts.join('')}</svg>`;
  };
  return g;
}

const D = {};
function figure(name, draw) {
  const g = drawing(name);
  const [W, H] = draw(g);
  D[name] = `<figure class="dia" id="dg-${name}" data-dg="${name}">${g.finish(W, H)}<figcaption data-i18n-html="dg.${name}.cap"></figcaption></figure>`;
}

/* ── ch1: Multi-process RenderingNG pipeline stack ── */
figure('pipeline', g => {
  const cols = [C.gold, C.cyan, C.violet, C.green];
  const bh = 60, gap = 32;
  for (let i = 0; i < 4; i++) {
    const y = 14 + i * (bh + gap);
    g.box(12, y, 336, bh, cols[i]);
    g.t(24, y + 19, 'l' + (i + 1), { weight: 600 });
    g.t(24, y + 42, 'l' + (i + 1) + 's', { c: 'm' });
    if (i < 3) {
      const yy = y + bh;
      g.line(42, yy + 4, 42, yy + gap - 4, C.mute, { arrow: true });
      g.t(56, yy + gap / 2, 'x' + (i + 1), { c: 'g', mono: true });
    }
  }
  return [360, 14 + 4 * bh + 3 * gap + 14];
});

/* ── ch2: HTML parser + PreloadScanner + CSSOM + blocking/defer/async ── */
figure('parse', g => {
  const rows = [
    { y: 14, col: C.gold, t: 'r1', s: 'r1s' },
    { y: 82, col: C.cyan, t: 'r2', s: 'r2s' },
    { y: 150, col: C.red, t: 'r3', s: 'r3s' },
    { y: 218, col: C.green, t: 'r4', s: 'r4s' }
  ];
  for (const r of rows) {
    g.box(16, r.y, 328, 56, r.col);
    g.t(30, r.y + 18, r.t, { weight: 600 });
    g.t(30, r.y + 40, r.s, { c: 'm' });
  }
  g.line(180, 70, 180, 80, C.mute, { arrow: true });
  g.line(180, 138, 180, 148, C.mute, { arrow: true });
  g.line(180, 206, 180, 216, C.mute, { arrow: true });
  return [360, 288];
});

/* ── ch3: Right-to-Left selector matching, Bloom filter, InvalidationSet ── */
figure('style', g => {
  g.box(16, 14, 328, 56, C.cyan);
  g.t(30, 32, 'sel', { mono: true, weight: 600, c: 'c' });
  g.t(30, 54, 'sels', { c: 'm' });

  g.line(180, 70, 180, 92, C.mute, { arrow: true });

  g.box(16, 94, 328, 56, C.gold);
  g.t(30, 112, 's1', { weight: 600 });
  g.t(30, 134, 's1s', { c: 'm' });

  g.line(180, 150, 180, 172, C.mute, { arrow: true });

  g.box(16, 174, 328, 56, C.violet);
  g.t(30, 192, 's2', { weight: 600 });
  g.t(30, 214, 's2s', { c: 'm' });

  g.line(180, 230, 180, 252, C.mute, { arrow: true });

  g.box(16, 254, 328, 56, C.green);
  g.t(30, 272, 's3', { weight: 600 });
  g.t(30, 294, 's3s', { c: 'm' });

  return [360, 324];
});

/* ── ch4: LayoutNG immutable fragments vs Forced Synchronous Layout ── */
figure('layoutng', g => {
  g.box(16, 14, 328, 56, C.cyan);
  g.t(30, 32, 'cs', { weight: 600, c: 'c' });
  g.t(30, 54, 'css', { c: 'm' });

  g.line(180, 70, 180, 92, C.mute, { arrow: true });

  g.box(16, 94, 328, 56, C.green);
  g.t(30, 112, 'frag', { weight: 600, c: 'n' });
  g.t(30, 134, 'frags', { c: 'm' });

  g.line(16, 170, 344, 170, C.line, { sw: 1.2 });

  g.box(16, 184, 328, 56, C.gold, { a: 0.1 });
  g.t(30, 202, 'bat', { weight: 600, c: 'g' });
  g.t(30, 224, 'bats', { c: 'm' });

  g.box(16, 252, 328, 56, C.red, { a: 0.14 });
  g.t(30, 270, 'thr', { weight: 600, c: 'r' });
  g.t(30, 292, 'thrs', { c: 'm' });

  return [360, 322];
});

/* ── ch5: Pre-Paint & 4 RenderingNG Property Trees ── */
figure('proptrees', g => {
  const rows = [
    { y: 14, col: C.gold, t: 'tr', s: 'trs' },
    { y: 78, col: C.cyan, t: 'cl', s: 'cls' },
    { y: 142, col: C.violet, t: 'ef', s: 'efs' },
    { y: 206, col: C.green, t: 'sc', s: 'scs' }
  ];
  for (const r of rows) {
    g.box(16, r.y, 328, 54, r.col);
    g.t(30, r.y + 18, r.t, { weight: 600 });
    g.t(30, r.y + 40, r.s, { c: 'm' });
  }
  g.line(180, 262, 180, 286, C.mute, { arrow: true });

  g.box(16, 288, 328, 56, C.cyan, { a: 0.1 });
  g.t(30, 306, 'chunk', { weight: 600 });
  g.t(30, 328, 'chunks', { c: 'm' });

  return [360, 358];
});

/* ── ch6: PaintArtifactCompositor squashing vs Layer Explosion ── */
figure('layers', g => {
  g.t(16, 18, 'topTitle', { weight: 600, c: 'n' });
  g.box(16, 34, 328, 56, C.green);
  g.t(30, 52, 'sq', { weight: 600 });
  g.t(30, 74, 'sqs', { c: 'm' });

  g.line(16, 108, 344, 108, C.line, { sw: 1.2 });

  g.t(16, 126, 'botTitle', { weight: 600, c: 'r' });
  g.box(16, 142, 328, 54, C.gold);
  g.t(30, 160, 'bg', { weight: 600, c: 'g' });
  g.t(30, 182, 'bgs', { c: 'm' });

  for (let i = 0; i < 3; i++) {
    const y = 204 + i * 24;
    g.box(26 + i * 10, y, 318 - i * 10, 20, C.red, { rx: 4, a: 0.16 });
  }
  g.box(16, 276, 328, 56, C.red, { a: 0.14 });
  g.t(30, 294, 'exp', { weight: 600, c: 'r' });
  g.t(30, 316, 'exps', { c: 'm' });

  return [360, 346];
});

/* ── ch7: cc::TileManager PendingTree -> ActiveTree double buffering ── */
figure('trees', g => {
  g.box(16, 14, 328, 54, C.gold);
  g.t(30, 32, 'pend', { weight: 600, c: 'g' });
  g.t(30, 54, 'pends', { c: 'm' });

  g.line(180, 68, 180, 86, C.mute, { arrow: true });

  g.box(16, 88, 328, 54, C.green);
  g.t(30, 106, 'act', { weight: 600, c: 'n' });
  g.t(30, 128, 'acts', { c: 'm' });

  // 4x2 schematic tile grid
  const gx = 40, gy = 158, tw = 68, th = 40;
  const states = [
    ['n', 'n', 'n', 'n'],
    ['g', 'g', 'r', 'r']
  ];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const st = states[r][c];
      const col = st === 'n' ? C.green : st === 'g' ? C.gold : C.red;
      g.box(gx + c * tw, gy + r * th, tw - 4, th - 4, col, { rx: 3, a: st === 'r' ? 0.24 : 0.16 });
      g.t(gx + c * tw + (tw - 4) / 2, gy + r * th + (th - 4) / 2, { raw: '256×256' }, { a: 'middle', mono: true, c: st === 'r' ? 'r' : 'm' });
    }
  }
  g.box(16, 250, 328, 56, C.cyan, { a: 0.1 });
  g.t(30, 268, 'prio', { weight: 600 });
  g.t(30, 290, 'prios', { c: 'm' });

  return [360, 320];
});

/* ── ch8: Viz SurfaceAggregator combining Chrome + Main + OOPIF ── */
figure('viz', g => {
  const srcs = [
    { x: 16, col: C.gold, t: 'ui', s: 'uis' },
    { x: 128, col: C.cyan, t: 'main', s: 'mains' },
    { x: 240, col: C.violet, t: 'oop', s: 'oops' }
  ];
  for (const s of srcs) {
    g.box(s.x, 14, 104, 56, s.col);
    g.t(s.x + 52, 32, s.t, { a: 'middle', weight: 600 });
    g.t(s.x + 52, 54, s.s, { a: 'middle', c: 'm' });
    g.line(s.x + 52, 72, 180, 102, C.mute, { arrow: true });
  }

  g.box(16, 104, 328, 58, C.cyan);
  g.t(30, 123, 'agg', { weight: 600, c: 'c' });
  g.t(30, 146, 'aggs', { c: 'm' });

  g.line(180, 162, 180, 188, C.mute, { arrow: true });

  g.box(16, 190, 328, 58, C.green);
  g.t(30, 209, 'gpu', { weight: 600, c: 'n' });
  g.t(30, 232, 'gpus', { c: 'm' });

  return [360, 262];
});

fs.mkdirSync(OUT, { recursive: true });
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
}
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
