#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit drawings here, run `node computing/software/how-git-stores-history/tools/diagrams.cjs`,
   then `node scripts/build-pages.cjs computing/software/how-git-stores-history`.
   All SVGs use viewBox 360 wide, font-size 14 (renders >= 11.2 px at 320 px screen width),
   explicit x/y, zero transforms on <text>, and data-i18n keys for every label. */
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
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}${o.halo ? ` stroke="${C.bg}" stroke-width="9" stroke-linejoin="round" paint-order="stroke"` : ''}`;
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    }
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

/* ── 1. ch1: Four regions of a Git repository ── */
figure('gitmap', g => {
  const cols = [C.gold, C.cyan, C.green, C.violet], bh = 58, gap = 36;
  for (let i = 0; i < 4; i++) {
    const y = 14 + i * (bh + gap);
    g.box(20, y, 320, bh, cols[i]);
    g.t(34, y + 19, 'l' + (i + 1), { weight: 600 });
    g.t(34, y + 43, 'l' + (i + 1) + 's', { c: 'm' });
    if (i < 3) {
      const yy = y + bh;
      g.line(44, yy + 4, 44, yy + gap - 4, C.mute, { arrow: true });
      g.t(58, yy + gap / 2, 'x' + (i + 1), { c: 'g', mono: true });
    }
  }
  return [360, 14 + 4 * bh + 3 * gap + 14];
});

/* ── 2. ch2: Blob header, hash, zlib, shard ── */
figure('blob', g => {
  g.box(20, 14, 320, 52, C.gold);
  g.t(34, 31, 'in', { weight: 600 });
  g.t(34, 52, 'inv', { c: 'm', mono: true });

  g.line(180, 66, 180, 92, C.mute, { arrow: true });
  g.t(194, 79, 'prep', { c: 'g' });

  g.box(20, 96, 320, 52, C.cyan);
  g.t(34, 113, 'hdr', { weight: 600 });
  g.t(34, 134, 'hdrv', { c: 'c', mono: true });

  g.line(100, 148, 96, 178, C.violet, { arrow: true });
  g.line(260, 148, 264, 178, C.green, { arrow: true });

  g.box(20, 182, 152, 60, C.violet);
  g.t(96, 202, 'hash', { a: 'middle', weight: 600 });
  g.t(96, 224, 'oid', { a: 'middle', c: 'v', mono: true });

  g.box(188, 182, 152, 60, C.green);
  g.t(264, 202, 'zlib', { a: 'middle', weight: 600 });
  g.t(264, 224, 'zsz', { a: 'middle', c: 'n', mono: true });

  g.line(96, 242, 140, 272, C.violet, { arrow: true });
  g.line(264, 242, 220, 272, C.green, { arrow: true });

  g.box(20, 276, 320, 54, C.ink, { a: 0.08 });
  g.t(34, 294, 'path', { weight: 600 });
  g.t(34, 316, 'pathv', { c: 'g', mono: true });
  return [360, 344];
});

/* ── 3. ch3: Tree binary entry + structural sharing ── */
figure('tree', g => {
  g.t(20, 20, 'fmt', { weight: 600 });
  g.box(20, 36, 76, 36, C.gold); g.t(58, 54, 'mode', { a: 'middle', c: 'g', mono: true });
  g.box(100, 36, 108, 36, C.cyan); g.t(154, 54, 'name', { a: 'middle', c: 'c', mono: true });
  g.box(212, 36, 128, 36, C.violet); g.t(276, 54, 'oid', { a: 'middle', c: 'v', mono: true });

  g.line(20, 88, 340, 88, C.line, { sw: 1 });

  g.box(20, 104, 140, 40, C.mute, { a: 0.12 }); g.t(90, 124, 't1', { a: 'middle', weight: 600 });
  g.box(200, 104, 140, 40, C.gold); g.t(270, 124, 't2', { a: 'middle', c: 'g', weight: 600 });

  g.box(20, 174, 140, 40, C.mute, { a: 0.1 }); g.t(90, 194, 'b1', { a: 'middle' });
  g.box(200, 174, 140, 40, C.gold); g.t(270, 194, 'b2', { a: 'middle', c: 'g' });

  g.line(60, 144, 60, 172, C.mute, { arrow: true });
  g.line(300, 144, 300, 172, C.gold, { arrow: true });

  g.box(64, 242, 232, 44, C.green);
  g.t(180, 264, 'shared', { a: 'middle', c: 'n', weight: 600 });

  // Diagonal arrows from T1 and T2 down to shared subtree box without touching b1/b2
  g.path('M130,144 L170,174 L170,240', C.green, { arrow: true, dash: '4 3' });
  g.path('M230,144 L190,174 L190,240', C.green, { arrow: true });
  return [360, 300];
});

/* ── 4. ch4: Commit payload + immutable DAG (amend) ── */
figure('dag', g => {
  g.box(20, 14, 320, 108, C.cyan);
  g.t(32, 32, 'ct', { mono: true, c: 'c' });
  g.t(32, 54, 'cp', { mono: true });
  g.t(32, 76, 'ca', { mono: true, c: 'm' });
  g.t(32, 98, 'cm', { c: 'g' });

  g.line(20, 136, 340, 136, C.line, { sw: 1 });

  // DAG nodes C0 <- C1 <- C2 (old, red dashed) and C2' (gold)
  g.circle(52, 186, 18, C.mute); g.t(52, 186, { raw: 'C0' }, { a: 'middle', weight: 600, mono: true });
  g.circle(142, 186, 18, C.cyan); g.t(142, 186, { raw: 'C1' }, { a: 'middle', c: 'c', weight: 600, mono: true });
  g.circle(236, 186, 18, C.red, { dash: '4 3' }); g.t(236, 186, { raw: 'C2' }, { a: 'middle', c: 'r', weight: 600, mono: true });
  g.circle(236, 256, 18, C.gold); g.t(236, 256, { raw: "C2'" }, { a: 'middle', c: 'g', weight: 600, mono: true });

  g.line(124, 186, 72, 186, C.cyan, { arrow: true });
  g.line(218, 186, 162, 186, C.red, { arrow: true, dash: '4 3' });
  g.path('M218,256 Q178,256 152,202', C.gold, { arrow: true });

  g.t(264, 186, 'old', { c: 'r' });
  g.box(274, 238, 66, 36, C.green); g.t(307, 256, 'ptr', { a: 'middle', c: 'n', mono: true });
  g.line(274, 256, 256, 256, C.green, { arrow: true });
  return [360, 290];
});

/* ── 5. ch5: .git/index layout & stat cache shortcut ── */
figure('index', g => {
  g.box(20, 14, 100, 36, C.gold); g.t(70, 32, 'sig', { a: 'middle', c: 'g', mono: true });
  g.box(126, 14, 94, 36, C.mute); g.t(173, 32, 'ver', { a: 'middle', mono: true });
  g.box(226, 14, 114, 36, C.mute); g.t(283, 32, 'cnt', { a: 'middle', mono: true });

  g.box(20, 62, 320, 96, C.cyan);
  g.t(34, 80, 'ent', { weight: 600 });
  g.box(32, 96, 296, 24, C.gold, { a: 0.16 }); g.t(42, 108, 'stat', { c: 'g', mono: true });
  g.box(32, 126, 296, 24, C.violet, { a: 0.16 }); g.t(42, 138, 'oid', { c: 'v', mono: true });

  g.box(20, 168, 320, 34, C.mute, { a: 0.08 }); g.t(34, 185, 'ext', { c: 'm', mono: true });

  g.box(20, 224, 144, 52, C.ink, { a: 0.08 }); g.t(92, 250, 'chk', { a: 'middle', weight: 600 });
  g.line(164, 238, 192, 226, C.green, { arrow: true });
  g.line(164, 262, 192, 274, C.red, { arrow: true });
  g.box(196, 208, 144, 36, C.green); g.t(268, 226, 'hit', { a: 'middle', c: 'n' });
  g.box(196, 256, 144, 36, C.red); g.t(268, 274, 'miss', { a: 'middle', c: 'r' });
  return [360, 306];
});

/* ── 6. ch6: HEAD, branches, tags, and reflog ── */
figure('refs', g => {
  g.box(20, 16, 106, 46, C.gold); g.t(73, 39, 'head', { a: 'middle', c: 'g', mono: true, weight: 600 });
  g.line(126, 39, 164, 39, C.gold, { arrow: true });
  g.box(168, 16, 172, 46, C.cyan); g.t(254, 39, 'branch', { a: 'middle', c: 'c', mono: true });

  g.circle(254, 104, 17, C.cyan); g.t(254, 104, { raw: 'C3' }, { a: 'middle', c: 'c', mono: true });
  g.circle(254, 158, 17, C.mute); g.t(254, 158, { raw: 'C2' }, { a: 'middle', mono: true });
  g.circle(254, 212, 17, C.mute); g.t(254, 212, { raw: 'C1' }, { a: 'middle', mono: true });
  g.line(254, 62, 254, 85, C.cyan, { arrow: true });
  g.line(254, 121, 254, 139, C.mute, { arrow: true });
  g.line(254, 175, 254, 193, C.mute, { arrow: true });

  // Annotated tag pointing to C2
  g.box(20, 140, 132, 36, C.green); g.t(86, 158, 'tag', { a: 'middle', c: 'n', mono: true });
  g.line(152, 158, 235, 158, C.green, { arrow: true });

  // Reset commit C4 still held alive by logs/HEAD
  g.circle(136, 104, 17, C.red, { dash: '4 3' }); g.t(136, 104, { raw: 'C4' }, { a: 'middle', c: 'r', mono: true });
  g.line(151, 114, 238, 150, C.red, { arrow: true, dash: '4 3' });

  g.box(20, 246, 320, 48, C.violet);
  g.t(34, 261, 'log', { c: 'v', mono: true, weight: 600 });
  g.t(34, 281, 'logs', { c: 'm' });
  g.path('M96,246 L96,204 L126,120', C.violet, { arrow: true, dash: '4 3' });
  return [360, 308];
});

/* ── 7. ch7: 3-Way Merge on DAG & conflict hunks ── */
figure('merge', g => {
  g.box(122, 14, 116, 40, C.mute); g.t(180, 34, 'base', { a: 'middle', weight: 600 });
  g.box(20, 88, 124, 42, C.gold); g.t(82, 109, 'ours', { a: 'middle', c: 'g', weight: 600 });
  g.box(216, 88, 124, 42, C.cyan); g.t(278, 109, 'theirs', { a: 'middle', c: 'c', weight: 600 });
  g.box(110, 166, 140, 42, C.green); g.t(180, 187, 'out', { a: 'middle', c: 'n', weight: 600 });

  g.line(150, 54, 102, 86, C.gold, { arrow: true });
  g.line(210, 54, 258, 86, C.cyan, { arrow: true });
  g.line(102, 130, 150, 164, C.gold, { arrow: true });
  g.line(258, 130, 210, 164, C.cyan, { arrow: true });

  g.box(20, 224, 320, 56, C.red);
  g.t(34, 242, 'rule', { weight: 600 });
  g.t(34, 264, 'cfl', { c: 'r', mono: true });
  return [360, 294];
});

/* ── 8. ch8: Packfile layout, delta opcodes & .idx v2 ── */
figure('pack', g => {
  g.t(20, 20, 'phdr', { weight: 600 });
  g.box(20, 36, 98, 36, C.gold); g.t(69, 54, 'pmag', { a: 'middle', c: 'g', mono: true });
  g.box(122, 36, 102, 36, C.cyan); g.t(173, 54, 'pobj', { a: 'middle', c: 'c', mono: true });
  g.box(228, 36, 112, 36, C.violet); g.t(284, 54, 'pofs', { a: 'middle', c: 'v', mono: true });

  g.box(20, 88, 320, 74, C.cyan);
  g.t(34, 106, 'dtitle', { weight: 600 });
  g.box(32, 122, 144, 28, C.cyan, { a: 0.16 }); g.t(104, 136, 'copy', { a: 'middle', c: 'c', mono: true });
  g.box(184, 122, 144, 28, C.gold, { a: 0.16 }); g.t(256, 136, 'ins', { a: 'middle', c: 'g', mono: true });

  g.box(20, 178, 320, 84, C.green);
  g.t(34, 196, 'idx', { weight: 600 });
  g.box(32, 212, 92, 36, C.green, { a: 0.16 }); g.t(78, 230, 'fan', { a: 'middle', c: 'n' });
  g.line(124, 230, 140, 230, C.mute, { arrow: true });
  g.box(142, 212, 92, 36, C.cyan, { a: 0.16 }); g.t(188, 230, 'oids', { a: 'middle', c: 'c' });
  g.line(234, 230, 250, 230, C.mute, { arrow: true });
  g.box(252, 212, 76, 36, C.gold, { a: 0.16 }); g.t(290, 230, 'off', { a: 'middle', c: 'g' });
  return [360, 276];
});

/* ── 9. ch9: Wire protocol v2 negotiation ── */
figure('wire', g => {
  g.box(20, 14, 112, 36, C.gold); g.t(76, 32, 'cli', { a: 'middle', c: 'g', weight: 600 });
  g.box(228, 14, 112, 36, C.cyan); g.t(284, 32, 'srv', { a: 'middle', c: 'c', weight: 600 });
  g.line(76, 50, 76, 216, C.line, { sw: 1.5, dash: '4 3' });
  g.line(284, 50, 284, 216, C.line, { sw: 1.5, dash: '4 3' });

  const msgs = [
    ['m1', true, C.gold],
    ['m2', false, C.cyan],
    ['m3', true, C.gold],
    ['m4', false, C.green]
  ];
  msgs.forEach(([k, right, col], idx) => {
    const y = 78 + idx * 42;
    if (right) g.line(82, y, 278, y, col, { arrow: true });
    else g.line(278, y, 82, y, col, { arrow: true });
    g.t(180, y - 13, k, { a: 'middle', halo: true, mono: idx !== 3 });
  });

  g.box(20, 224, 320, 54, C.violet);
  g.t(34, 242, 'flt', { weight: 600 });
  g.t(34, 263, 'flts', { c: 'v', mono: true });
  return [360, 292];
});

/* ── 10. ch10: files + packed-refs vs reftable ── */
figure('reftable', g => {
  g.box(20, 14, 320, 86, C.red);
  g.t(34, 34, 'f1', { c: 'r', weight: 600 });
  g.t(34, 58, 'f2', { mono: true });
  g.t(34, 82, 'f3', { c: 'm' });

  g.box(20, 116, 320, 128, C.green);
  g.t(34, 136, 'r1', { c: 'n', weight: 600 });
  g.box(32, 152, 92, 34, C.green, { a: 0.16 }); g.t(78, 169, 'rb1', { a: 'middle', mono: true });
  g.box(132, 152, 92, 34, C.green, { a: 0.16 }); g.t(178, 169, 'rb2', { a: 'middle', mono: true });
  g.box(232, 152, 96, 34, C.gold, { a: 0.18 }); g.t(280, 169, 'rb3', { a: 'middle', c: 'g' });
  g.t(34, 204, 'r2', { c: 'm' });
  g.t(34, 226, 'r3', { c: 'c', mono: true });
  return [360, 258];
});

fs.mkdirSync(OUT, { recursive: true });
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
}
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
