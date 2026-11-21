#!/usr/bin/env node
'use strict';
/* Writes static inline SVG diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Every box with two 14px text lines keeps height >= 56 and >= 24px vertical gap between baselines so CJK fallback
   fonts never overlap at 390/320. Run `node tools/diagrams.cjs` then `node scripts/build-pages.cjs <dir>`. */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'figures');

const C = {
  ink: '#ebe8e0',
  mute: '#a3aab8',
  line: '#2b3242',
  gold: '#e9b949',
  cyan: '#63c7e6',
  red: '#f07a6d',
  green: '#7ad6a0',
  violet: '#b39dfb',
  dim: '#3a4254',
  card: '#1a1f2b',
  bg: '#0f1219'
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
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    }
  };
  g.finish = (W, H) => {
    const defs = used.size
      ? '<defs>' + [...used].map(col => `<marker id="ar-${name}-${col.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`).join('') + '</defs>'
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

/* ── 1. ch1: Query pipeline (5 stages + Volcano pull) ── */
figure('pipeline', g => {
  const cols = [C.gold, C.cyan, C.violet, C.green, C.red];
  const bh = 58, gap = 28;
  for (let i = 0; i < 5; i++) {
    const y = 14 + i * (bh + gap);
    g.box(16, y, 328, bh, cols[i]);
    g.t(30, y + 18, 's' + (i + 1), { weight: 600 });
    g.t(30, y + 42, 's' + (i + 1) + 'd', { c: 'm' });
    if (i < 4) {
      const yy = y + bh;
      g.line(42, yy + 3, 42, yy + gap - 3, C.mute, { arrow: true });
      g.t(56, yy + gap / 2, 'x' + (i + 1), { c: 'g', mono: true });
    }
  }
  return [360, 14 + 5 * bh + 4 * gap + 14];
});

/* ── 2. ch2: Seq Scan vs Index Scan vs Bitmap Heap Scan on 8 KiB blocks ── */
figure('costpaths', g => {
  const drawStrip = (y, labelKey, col, hits, arrows, tagKey) => {
    g.t(16, y, labelKey, { weight: 600, c: col === C.gold ? 'g' : col === C.cyan ? 'c' : 'n' });
    g.t(344, y, tagKey, { a: 'end', c: 'm', mono: true });
    const bx = 16, by = y + 16, bw = 28, bh = 28, gap = 4;
    for (let i = 0; i < 10; i++) {
      const hit = hits.includes(i);
      g.box(bx + i * (bw + gap), by, bw, bh, hit ? col : C.dim, { a: hit ? 0.35 : 0.08, rx: 4 });
      g.t(bx + i * (bw + gap) + bw / 2, by + bh / 2, { raw: String(i) }, { a: 'middle', mono: true, c: hit ? '' : 'm' });
    }
    if (arrows === 'seq') {
      g.line(16, by + bh + 12, 336, by + bh + 12, col, { arrow: true, sw: 2 });
    } else if (arrows === 'rand') {
      // Jumping arrows back and forth between scattered blocks
      const pts = [6, 1, 8, 3, 6];
      for (let k = 0; k < pts.length - 1; k++) {
        const x1 = bx + pts[k] * (bw + gap) + bw / 2;
        const x2 = bx + pts[k + 1] * (bw + gap) + bw / 2;
        g.path(`M${x1},${by + bh + 2} Q${(x1 + x2) / 2},${by + bh + 18} ${x2},${by + bh + 2}`, col, { arrow: true, sw: 1.4 });
      }
    } else {
      g.line(16, by + bh + 12, 336, by + bh + 12, col, { arrow: true, dash: '5 3', sw: 1.8 });
    }
  };
  drawStrip(18, 'seq', C.gold, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'seq', 'seqTag');
  drawStrip(112, 'idx', C.cyan, [1, 3, 6, 8], 'rand', 'idxTag');
  drawStrip(206, 'bmp', C.green, [1, 3, 6, 8], 'bmp', 'bmpTag');
  return [360, 280];
});

/* ── 3. ch3: 8,192 B Slotted Page Layout ── */
figure('pagelayout', g => {
  // Outer 8192-byte page box
  g.box(16, 32, 328, 224, C.line, { fill: '#111520', sw: 1.6 });
  g.t(16, 16, 'top', { c: 'm', mono: true });
  g.t(344, 16, { raw: '0 .. 8192 B' }, { a: 'end', c: 'm', mono: true });

  // PageHeaderData (0..24)
  g.box(24, 42, 312, 46, C.gold, { a: 0.18 });
  g.t(34, 65, 'hdr', { weight: 600, c: 'g' });
  g.t(326, 65, { raw: '0..24' }, { a: 'end', mono: true, c: 'g' });

  // ItemIdData array (24..pd_lower)
  g.box(24, 94, 312, 44, C.cyan, { a: 0.16 });
  g.t(34, 116, 'items', { c: 'c' });
  g.t(326, 116, 'lower', { a: 'end', mono: true, c: 'c' });

  // Down arrow and Up arrow in Free Space
  g.box(24, 144, 312, 40, C.dim, { a: 0.06, dash: '4 3' });
  g.line(54, 142, 54, 162, C.cyan, { arrow: true, sw: 1.8 });
  g.line(54, 186, 54, 166, C.green, { arrow: true, sw: 1.8 });
  g.t(190, 164, 'free', { a: 'middle', c: 'm' });

  // Tuple data (pd_upper..pd_special)
  g.box(24, 190, 312, 56, C.green, { a: 0.16 });
  g.t(34, 208, 'tuples', { c: 'n' });
  g.t(34, 232, 'hot', { c: 'm' });
  g.t(326, 208, 'upper', { a: 'end', mono: true, c: 'n' });

  // Footer note on pd_special
  g.t(16, 276, 'special', { c: 'v', mono: true });
  return [360, 294];
});

/* ── 4. ch4: MVCC Timeline & SnapshotData ── */
figure('mvtline', g => {
  // Vertical snapshot line and shaded [xmin, xmax) bracket
  g.box(106, 20, 164, 214, C.gold, { a: 0.08, dash: '4 3', sw: 1 });
  g.t(106, 12, 'sxmin', { a: 'middle', c: 'g', mono: true });
  g.t(270, 12, 'sxmax', { a: 'middle', c: 'g', mono: true });

  const rows = [
    { y: 40, x1: 24, x2: 96, col: C.green, k: 't100', st: 't100s' },
    { y: 92, x1: 106, x2: 242, col: C.gold, k: 't101', st: 't101s' },
    { y: 144, x1: 124, x2: 214, col: C.cyan, k: 't102', st: 't102s' },
    { y: 196, x1: 142, x2: 332, col: C.red, k: 't103', st: 't103s' }
  ];
  rows.forEach(r => {
    g.t(24, r.y, r.k, { mono: true, weight: 600 });
    g.line(r.x1, r.y + 18, r.x2, r.y + 18, r.col, { sw: 4 });
    g.circle(r.x2, r.y + 18, 4.5, r.col, { solid: true });
    g.t(344, r.y, r.st, { a: 'end', c: r.col === C.green ? 'n' : r.col === C.gold ? 'g' : r.col === C.cyan ? 'c' : 'r' });
  });
  g.t(16, 256, 'rule', { c: 'm' });
  return [360, 274];
});

/* ── 5. ch5: 32-bit Modular XID Wraparound Circle ── */
figure('xidcircle', g => {
  const cx = 180, cy = 136, R = 66;
  // Past half (left/bottom semi-circle) green, Future half (right semi-circle) red
  g.path(`M${cx},${cy - R} A${R},${R} 0 0,0 ${cx},${cy + R}`, C.green, { sw: 6 });
  g.path(`M${cx},${cy + R} A${R},${R} 0 0,0 ${cx},${cy - R}`, C.red, { sw: 6 });
  g.line(cx, cy - R - 10, cx, cy + R + 10, C.line, { dash: '4 3', sw: 1.2 });

  // CurrentXID at top (12 o'clock)
  g.circle(cx, cy - R, 6, C.gold, { solid: true });
  g.t(cx, cy - R - 20, 'now', { a: 'middle', c: 'g', weight: 600 });

  // autovacuum_freeze_max_age (200M) marker counter-clockwise
  const aFreeze = -Math.PI / 2 - 0.55;
  const fx = cx + Math.cos(aFreeze) * R, fy = cy + Math.sin(aFreeze) * R;
  g.circle(fx, fy, 5, C.cyan, { solid: true });
  g.t(fx - 12, fy - 14, 'freeze', { a: 'end', c: 'c' });

  // Opposite boundary 2^31 at 6 o'clock
  g.circle(cx, cy + R, 5, C.red, { solid: true });
  g.t(cx, cy + R + 22, 'half', { a: 'middle', c: 'r', mono: true });

  // Past and Future side labels clearly outside ring
  g.t(cx - R - 14, cy + 4, 'past', { a: 'end', c: 'n' });
  g.t(cx + R + 14, cy + 4, 'future', { a: 'start', c: 'r' });

  g.t(180, 260, 'frozen', { a: 'middle', c: 'm' });
  return [360, 280];
});

/* ── 6. ch6: Shared Buffers + OS Page Cache Double Buffering + Ring Buffer ── */
figure('doublebuf', g => {
  // Top: Postgres Executor
  g.box(24, 14, 312, 46, C.gold, { a: 0.16 });
  g.t(180, 37, 'exec', { a: 'middle', weight: 600, c: 'g' });

  // Middle: shared_buffers (left) + 256 KiB ring (right)
  g.box(24, 86, 200, 74, C.cyan, { a: 0.14 });
  g.t(34, 108, 'sb', { weight: 600, c: 'c' });
  g.t(34, 134, 'clock', { c: 'm' });

  g.box(236, 86, 100, 74, C.violet, { a: 0.16 });
  g.t(286, 108, 'ring', { a: 'middle', weight: 600, c: 'v' });
  g.t(286, 134, { raw: '256 KiB' }, { a: 'middle', mono: true, c: 'v' });

  g.line(124, 84, 124, 62, C.cyan, { arrow: true });
  g.line(286, 84, 286, 62, C.violet, { arrow: true });

  // OS Page Cache
  g.box(24, 186, 312, 58, C.green, { a: 0.14 });
  g.t(34, 205, 'os', { weight: 600, c: 'n' });
  g.t(34, 229, 'osSub', { c: 'm' });
  g.line(180, 184, 180, 162, C.green, { arrow: true });

  // Storage NVMe/SSD
  g.box(24, 268, 312, 46, C.mute, { a: 0.1 });
  g.t(180, 291, 'disk', { a: 'middle', c: 'm' });
  g.line(180, 266, 180, 246, C.mute, { arrow: true });

  return [360, 330];
});

/* ── 7. ch7: Lehman & Yao nbtree Page Split & High-Key Right Link ── */
figure('nbtreesplit', g => {
  // Stale parent node
  g.box(100, 14, 160, 44, C.mute, { a: 0.14 });
  g.t(180, 36, 'parent', { a: 'middle', weight: 600 });

  // Left leaf (after split, holds HIKEY)
  g.box(16, 106, 148, 88, C.cyan, { a: 0.14 });
  g.t(28, 126, 'p1', { weight: 600, c: 'c' });
  g.t(28, 150, { raw: '[10, 20]' }, { mono: true });
  g.t(28, 174, 'hikey', { c: 'g', mono: true });

  // Right leaf (new sibling via btpo_next)
  g.box(196, 106, 148, 88, C.green, { a: 0.14 });
  g.t(208, 126, 'p2', { weight: 600, c: 'n' });
  g.t(208, 150, { raw: '[30, 40]' }, { mono: true });
  g.t(208, 174, 'inf', { c: 'm', mono: true });

  // Downlink from parent -> Left leaf, and right-link arrow P1 -> P2
  g.line(150, 58, 90, 104, C.mute, { arrow: true });
  g.line(166, 150, 194, 150, C.gold, { arrow: true, sw: 2.2 });
  g.t(180, 88, 'next', { a: 'middle', c: 'g', mono: true });

  // Reader path note
  g.t(16, 222, 'walk', { c: 'm' });
  g.t(16, 246, 'opaque', { c: 'v', mono: true });
  return [360, 266];
});

/* ── 8. ch8: In-Memory Hash Join vs Multi-Batch work_mem Disk Spill ── */
figure('joinspill', g => {
  // Top panel: nbatch = 1 fits in work_mem
  g.t(16, 16, 'inMem', { weight: 600, c: 'n' });
  g.box(16, 32, 328, 56, C.green, { a: 0.14 });
  g.t(28, 50, 'ramBox', { c: 'n' });
  g.t(28, 74, 'ramSub', { c: 'm' });

  // Bottom panel: exceeds work_mem -> Grace Hash batches to pgsql_tmp
  g.t(16, 114, 'spill', { weight: 600, c: 'r' });
  g.box(16, 130, 150, 62, C.gold, { a: 0.14 });
  g.t(28, 148, 'b0', { c: 'g', mono: true });
  g.t(28, 172, 'b0Sub', { c: 'm' });

  g.line(168, 161, 194, 161, C.red, { arrow: true, sw: 2 });

  g.box(198, 130, 146, 62, C.red, { a: 0.16 });
  g.t(210, 148, 'bDisk', { c: 'r', mono: true });
  g.t(210, 172, 'bDiskSub', { c: 'm' });

  g.t(16, 218, 'note', { c: 'm' });
  return [360, 236];
});

/* ── 9. ch9: WAL Full-Page Writes (FPW) Surviving an 8 KiB Torn Page ── */
figure('walfpw', g => {
  // Left: Torn 8 KiB page on disk (two 4 KiB sectors: top new, bottom old)
  g.t(16, 16, 'diskTitle', { weight: 600, c: 'r' });
  g.box(16, 32, 144, 42, C.cyan, { a: 0.2 });
  g.t(88, 53, 'sec1', { a: 'middle', c: 'c' });
  g.box(16, 76, 144, 42, C.red, { a: 0.22, dash: '4 3' });
  g.t(88, 97, 'sec2', { a: 'middle', c: 'r' });

  // Arrow across to WAL stream
  g.line(164, 75, 196, 75, C.gold, { arrow: true, sw: 2 });

  // Right: WAL timeline (Checkpoint -> FPW 8 KiB -> compact delta)
  g.t(200, 16, 'walTitle', { weight: 600, c: 'g' });
  g.box(200, 32, 144, 42, C.gold, { a: 0.22 });
  g.t(272, 53, 'fpw', { a: 'middle', c: 'g' });
  g.box(200, 78, 144, 40, C.green, { a: 0.16 });
  g.t(272, 98, 'delta', { a: 'middle', c: 'n' });

  // Recovery result box at bottom
  g.box(16, 142, 328, 56, C.green, { a: 0.12 });
  g.t(28, 160, 'fix1', { weight: 600, c: 'n' });
  g.t(28, 184, 'fix2', { c: 'm' });
  return [360, 214];
});

fs.mkdirSync(OUT, { recursive: true });
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
}
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
