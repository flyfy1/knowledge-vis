#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html. Every <text> has x, y and font-size >= 14 and no transform. */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'figures');

const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254', card: '#1a1f2b', bg: '#0f1219' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;

function drawing(name) {
  const parts = [], used = new Set();
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.fill || (o.solid ? col : tint(col, o.a == null ? 0.14 : o.a))}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${col.slice(1)})"` : ''}/>`); },
    path(d, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${col.slice(1)})"` : ''}/>`); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${o.fill || (o.solid ? col : tint(col, 0.16))}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"/>`); },
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}${o.halo ? ` stroke="${C.bg}" stroke-width="8" stroke-linejoin="round" paint-order="stroke"` : ''}`;
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

/* ── ch1: aeMain event loop & latency scales ── */
figure('loop', g => {
  const steps = [
    ['s1', C.cyan],
    ['s2', C.gold],
    ['s3', C.green],
    ['s4', C.violet]
  ];
  let y = 14;
  for (let i = 0; i < steps.length; i++) {
    const [k, col] = steps[i];
    g.box(20, y, 320, 54, col);
    g.t(34, y + 16, k, { weight: 600, mono: i === 0 || i === 2 });
    g.t(34, y + 39, k + 's', { c: 'm' });
    if (i < steps.length - 1) g.line(180, y + 56, 180, y + 68, C.mute, { arrow: true });
    y += 70;
  }
  // return loop arrow on left margin
  g.path(`M20,251 L6,251 L6,41 L18,41`, C.gold, { arrow: true, dash: '4 3' });
  g.line(20, y + 4, 340, y + 4, C.line, { sw: 1 });
  g.t(20, y + 24, 'sc', { c: 'g' });
  return [360, y + 44];
});

/* ── ch2: RESP length-prefixed framing & pipelining ── */
figure('resp', g => {
  // wire buffer boxes
  g.t(20, 18, 'wire', { c: 'm' });
  const tok = [
    ['*3', 44, C.violet],
    ['$3', 42, C.cyan],
    ['SET', 48, C.gold],
    ['$7', 42, C.cyan],
    ['user:42', 76, C.ink],
    ['$5', 42, C.cyan],
    ['alice', 62, C.green]
  ];
  let x = 20, y = 34;
  for (let i = 0; i < tok.length; i++) {
    const [lbl, w, col] = tok[i];
    if (x + w > 340) { x = 20; y += 34; }
    g.box(x, y, w, 26, col, { rx: 4 });
    g.t(x + w / 2, y + 13, { raw: lbl }, { a: 'middle', mono: true });
    x += w + 6;
  }
  y += 44;
  g.line(180, y - 10, 180, y + 6, C.mute, { arrow: true });
  g.box(20, y + 8, 320, 34, C.cyan);
  g.t(180, y + 25, 'qbuf', { a: 'middle', mono: true });
  y += 56;
  // sequential vs pipelined bars
  g.t(20, y, 'seq', { c: 'r' });
  for (let i = 0; i < 3; i++) {
    g.box(20 + i * 106, y + 14, 96, 18, C.red, { rx: 3, a: 0.25 });
    g.t(20 + i * 106 + 48, y + 23, { raw: 'RTT' }, { a: 'middle', mono: true });
  }
  y += 52;
  g.t(20, y, 'pip', { c: 'g' });
  g.box(20, y + 14, 96, 18, C.gold, { rx: 3, a: 0.25 });
  g.t(68, y + 23, { raw: '1 RTT' }, { a: 'middle', mono: true });
  g.box(122, y + 14, 60, 18, C.green, { rx: 3, a: 0.3 });
  g.t(152, y + 23, { raw: '3×CPU' }, { a: 'middle', mono: true });
  return [360, y + 46];
});

/* ── ch3: redisObject, 44-byte embstr, raw, and listpack ── */
figure('robj', g => {
  // INT
  g.t(20, 18, 'int', { c: 'n' });
  g.box(20, 32, 320, 30, C.green, { rx: 4 });
  g.t(180, 47, 'intb', { a: 'middle', mono: true });

  // EMBSTR 64B single malloc
  g.t(20, 84, 'emb', { c: 'g' });
  g.box(20, 98, 96, 30, C.gold, { rx: 4 });
  g.t(68, 113, { raw: 'robj 16B' }, { a: 'middle', mono: true });
  g.box(118, 98, 70, 30, C.cyan, { rx: 4 });
  g.t(153, 113, { raw: 'sds 3B' }, { a: 'middle', mono: true });
  g.box(190, 98, 150, 30, C.violet, { rx: 4 });
  g.t(265, 113, 'embd', { a: 'middle', mono: true });

  // RAW 2 mallocs
  g.t(20, 150, 'raw', { c: 'r' });
  g.box(20, 164, 110, 30, C.gold, { rx: 4 });
  g.t(75, 179, { raw: 'robj 16B' }, { a: 'middle', mono: true });
  g.line(132, 179, 168, 179, C.red, { arrow: true });
  g.box(172, 164, 168, 30, C.red, { rx: 4 });
  g.t(256, 179, 'rawd', { a: 'middle', mono: true });

  // LISTPACK entry
  g.t(20, 218, 'lp', { c: 'c' });
  g.box(20, 232, 92, 30, C.cyan, { rx: 4 });
  g.t(66, 247, { raw: 'enc' }, { a: 'middle', mono: true });
  g.box(114, 232, 128, 30, C.ink, { rx: 4, a: 0.1 });
  g.t(178, 247, 'lpd', { a: 'middle' });
  g.box(244, 232, 96, 30, C.gold, { rx: 4 });
  g.t(292, 247, { raw: 'backlen' }, { a: 'middle', mono: true });
  return [360, 278];
});

/* ── ch4: dict ht[0] -> ht[1] progressive rehash ── */
figure('rehash', g => {
  g.t(75, 18, { raw: 'ht[0]' }, { a: 'middle', mono: true, c: 'c' });
  g.t(265, 18, { raw: 'ht[1]' }, { a: 'middle', mono: true, c: 'g' });
  for (let i = 0; i < 4; i++) {
    const y = 34 + i * 36;
    const col0 = i === 0 ? C.mute : i === 1 ? C.gold : C.cyan;
    g.box(20, y, 110, 28, col0, { a: i === 0 ? 0.05 : 0.18, dash: i === 0 ? '4 3' : null });
    g.t(75, y + 14, i === 0 ? 'done' : i === 1 ? 'cur' : 'wait', { a: 'middle', c: i === 0 ? 'm' : undefined });
  }
  for (let i = 0; i < 6; i++) {
    const y = 34 + i * 26;
    g.box(210, y, 130, 20, i < 2 ? C.gold : C.line, { a: i < 2 ? 0.2 : 0.08 });
    if (i < 2) g.t(275, y + 10, 'new', { a: 'middle', c: 'g' });
  }
  g.line(134, 84, 204, 58, C.gold, { arrow: true, sw: 2 });
  g.t(180, 206, 'rule', { a: 'middle', c: 'm' });
  return [360, 226];
});

/* ── ch5: ZSET dict + zskiplist ── */
figure('skiplist', g => {
  g.box(20, 14, 320, 36, C.cyan);
  g.t(180, 32, 'dict', { a: 'middle', mono: true });
  // skiplist towers
  const xs = [36, 100, 164, 228, 292];
  const hs = [3, 1, 2, 1, 3];
  const baseY = 176, stepY = 34;
  for (let i = 0; i < xs.length; i++) {
    for (let l = 0; l < hs[i]; l++) {
      g.box(xs[i], baseY - l * stepY, 44, 24, l === 0 ? C.ink : C.gold, { rx: 4, a: l === 0 ? 0.1 : 0.18 });
      if (l === 0) g.t(xs[i] + 22, baseY + 12, { raw: String((i + 1) * 10) }, { a: 'middle', mono: true });
    }
  }
  // L2 pointer spanning 4 steps
  g.line(80, baseY - 2 * stepY + 12, 290, baseY - 2 * stepY + 12, C.gold, { arrow: true, sw: 2 });
  g.t(185, baseY - 2 * stepY - 4, { raw: 'span = 4' }, { a: 'middle', c: 'g', mono: true });
  // L1 pointers
  g.line(80, baseY - stepY + 12, 162, baseY - stepY + 12, C.cyan, { arrow: true });
  g.t(121, baseY - stepY - 4, { raw: 'span=2' }, { a: 'middle', c: 'c', mono: true });
  g.line(208, baseY - stepY + 12, 290, baseY - stepY + 12, C.cyan, { arrow: true });
  g.t(249, baseY - stepY - 4, { raw: 'span=2' }, { a: 'middle', c: 'c', mono: true });
  // L0 pointers
  for (let i = 0; i < 4; i++) g.line(xs[i] + 44, baseY + 12, xs[i + 1] - 2, baseY + 12, C.mute, { arrow: true });
  g.t(180, baseY + 44, 'bot', { a: 'middle', c: 'm' });
  return [360, baseY + 62];
});

/* ── ch6: Redis 8 io-threads pipeline ── */
figure('iothreads', g => {
  const ys = [46, 90, 134];
  g.t(20, 20, 'read', { c: 'c' });
  for (let i = 0; i < 3; i++) {
    g.box(20, ys[i], 96, 30, C.cyan);
    g.t(68, ys[i] + 15, { raw: 'I/O #' + (i + 1) }, { a: 'middle', mono: true });
    g.line(118, ys[i] + 15, 138, 105, C.mute, { arrow: true });
  }
  g.box(142, 72, 96, 66, C.gold);
  g.t(190, 95, 'main', { a: 'middle', weight: 600 });
  g.t(190, 118, { raw: '1 thread' }, { a: 'middle', mono: true, c: 'g' });
  for (let i = 0; i < 3; i++) {
    g.line(240, 105, 260, ys[i] + 15, C.mute, { arrow: true });
    g.box(262, ys[i], 78, 30, C.green);
    g.t(301, ys[i] + 15, 'wr', { a: 'middle' });
  }
  g.t(180, 192, 'cap2', { a: 'middle', c: 'm' });
  return [360, 212];
});

/* ── ch7: BGSAVE fork() CoW & Multi-Part AOF ── */
figure('cow', g => {
  g.box(20, 14, 142, 40, C.gold);
  g.t(91, 34, 'par', { a: 'middle', weight: 600 });
  g.box(198, 14, 142, 40, C.cyan);
  g.t(269, 34, 'chd', { a: 'middle', weight: 600 });

  // shared physical pages + copied dirty page
  g.line(60, 56, 60, 94, C.mute, { arrow: true });
  g.line(240, 56, 110, 94, C.cyan, { arrow: true });
  g.box(20, 98, 148, 38, C.cyan);
  g.t(94, 117, 'shr', { a: 'middle' });

  g.line(130, 56, 260, 94, C.red, { arrow: true });
  g.box(192, 98, 148, 38, C.red);
  g.t(266, 117, 'cpy', { a: 'middle', c: 'r' });

  g.line(20, 152, 340, 152, C.line, { sw: 1 });
  g.t(20, 172, 'aof', { c: 'v' });
  g.box(20, 188, 100, 30, C.violet);
  g.t(70, 203, { raw: 'base.rdb' }, { a: 'middle', mono: true });
  g.box(130, 188, 100, 30, C.violet);
  g.t(180, 203, { raw: 'incr.aof' }, { a: 'middle', mono: true });
  g.box(240, 188, 100, 30, C.violet);
  g.t(290, 203, { raw: 'manifest' }, { a: 'middle', mono: true });
  return [360, 234];
});

/* ── ch8: 24-bit lru field (LRU clock vs LFU ldt+counter) ── */
figure('evict', g => {
  g.t(20, 18, 'lru', { c: 'c' });
  g.box(20, 34, 320, 34, C.cyan);
  g.t(180, 51, 'lrub', { a: 'middle', mono: true });

  g.t(20, 94, 'lfu', { c: 'g' });
  g.box(20, 110, 208, 34, C.violet);
  g.t(124, 127, 'ldt', { a: 'middle', mono: true });
  g.box(232, 110, 108, 34, C.gold);
  g.t(286, 127, 'cnt', { a: 'middle', mono: true, c: 'g' });

  g.line(20, 166, 340, 166, C.line, { sw: 1 });
  g.t(20, 188, 'pool', { c: 'm' });
  return [360, 208];
});

/* ── ch9: 16384 hash slots & -MOVED / -ASK ── */
figure('slots', g => {
  g.box(16, 14, 328, 48, C.gold);
  g.t(180, 29, { raw: 'user:{42}:cart' }, { a: 'middle', mono: true, weight: 600 });
  g.t(180, 49, { raw: 'CRC16("42") & 16383 = 8000' }, { a: 'middle', mono: true, c: 'g' });
  g.line(180, 64, 180, 86, C.mute, { arrow: true });

  const shards = [
    ['N1', '0..5460', C.cyan, 10, 96],
    ['N2', '5461..10922', C.gold, 114, 114],
    ['N3', '10923..16383', C.violet, 236, 116]
  ];
  for (let i = 0; i < 3; i++) {
    const [n, rng, col, x, w] = shards[i];
    g.box(x, 90, w, 46, col, { a: i === 1 ? 0.22 : 0.1 });
    g.t(x + w / 2, 105, { raw: n }, { a: 'middle', mono: true, weight: 600 });
    g.t(x + w / 2, 123, { raw: rng }, { a: 'middle', mono: true, c: 'm' });
  }
  g.box(16, 154, 156, 34, C.red);
  g.t(94, 171, 'moved', { a: 'middle', mono: true, c: 'r' });
  g.box(188, 154, 156, 34, C.green);
  g.t(266, 171, 'ask', { a: 'middle', mono: true, c: 'n' });
  return [360, 204];
});

fs.mkdirSync(OUT, { recursive: true });
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
