#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: this script overwrites them, and `build-pages.cjs --check` reruns it
   (page.json "generators") and fails on any difference.
   Each diagram is a <figure class="dia"> holding two inline SVGs: a wide one (class "w", viewBox 720 wide) shown above
   640 px and a narrow one (class "n", viewBox 360 wide) shown at or below 640 px, so labels render at 11 px or more on
   every screen (font-size 14 or more in both). Every worded <text> carries a data-i18n key whose string lives in the
   ::: diagram block of content.<lang>.md. Literal text is language-neutral only: numbers computed here from ../models.js
   (the tree's node values, the netting example's amounts) and the letters A–D, K. tests/models.cjs pins those numbers.
   Colours, the same on every diagram and in the labs: stock or spot cyan, option gold, cash green, loss red, model violet. */
const fs = require('fs');
const path = require('path');
const M = require('../models.js');
const OUT = path.join(__dirname, '..', 'figures');

const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254', card: '#1a1f2b' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;

function drawing(name, v) {
  const parts = [], used = new Set();
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.solid ? col : tint(col, o.a == null ? 0.14 : o.a)}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    path(d, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.5}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${o.solid ? col : tint(col, o.a == null ? 0.16 : o.a)}" stroke="${col}" stroke-width="${o.sw || 1.3}"/>`); },
    // text: key → data-i18n="dg.<name>.<key>"; {raw:'31'} → literal language-neutral text
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}`;
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    }
  };
  g.finish = (W, H) => {
    const defs = used.size ? '<defs>' + [...used].map(col => `<marker id="ar-${name}-${v}-${col.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`).join('') + '</defs>' : '';
    return `<svg class="${v}" viewBox="0 0 ${W} ${H}" role="img" data-i18n-aria="dg.${name}.aria">${defs}${parts.join('')}</svg>`;
  };
  return g;
}
const D = {};
function figure(name, w, n) {
  const gw = drawing(name, 'w'), gn = drawing(name, 'n');
  const [W1, H1] = w(gw), [W2, H2] = n(gn);
  D[name] = `<figure class="dia" id="dg-${name}" data-dg="${name}">${gw.finish(W1, H1)}${gn.finish(W2, H2)}<figcaption data-i18n-html="dg.${name}.cap"></figcaption></figure>`;
}

/* ── ch1: cash and carry ── */
const CARRY = [['a1', 'b1', C.green], ['a2', 'b2', C.cyan], ['a3', 'b3', C.gold]];
figure('carry', g => {
  g.t(190, 22, 'now', { a: 'middle', c: 'm' }); g.t(530, 22, 'later', { a: 'middle', c: 'm' });
  CARRY.forEach(([a, b, col], i) => {
    const y = 42 + i * 52;
    g.box(40, y, 300, 40, col); g.box(380, y, 300, 40, col);
    g.t(190, y + 20, a, { a: 'middle' }); g.t(530, y + 20, b, { a: 'middle' });
    g.line(342, y + 20, 376, y + 20, col, { arrow: true });
  });
  g.line(40, 204, 680, 204, C.line, { sw: 1 });
  g.t(190, 228, 'na', { a: 'middle', c: 'm' }); g.t(530, 228, 'nb', { a: 'middle', c: 'g', weight: 600, fs: 16 });
  return [720, 250];
}, g => {
  g.t(180, 16, 'now', { a: 'middle', c: 'm' });
  CARRY.forEach(([a, , col], i) => { const y = 30 + i * 44; g.box(10, y, 340, 36, col); g.t(180, y + 18, a, { a: 'middle' }); });
  g.t(180, 176, 'na', { a: 'middle', c: 'm' });
  g.line(180, 190, 180, 206, C.mute, { arrow: true });
  g.t(180, 222, 'later', { a: 'middle', c: 'm' });
  CARRY.forEach(([, b, col], i) => { const y = 236 + i * 44; g.box(10, y, 340, 36, col); g.t(180, y + 18, b, { a: 'middle' }); });
  g.t(180, 384, 'nb', { a: 'middle', c: 'g', weight: 600, fs: 16 });
  return [360, 404];
});

/* ── ch2: the four basic payoffs ── */
function hockey(g, x, y, w, key, kind) { // panel origin (x, y), width w; zero line at y + 82
  const z = y + 82, k = x + w / 2, L = x + 14, R = x + w - 14, amp = 44;
  g.t(x + w / 2, y + 14, key, { a: 'middle' });
  g.line(L, z, R, z, C.mute, { sw: 1 }); g.line(k, z - 4, k, z + 4, C.mute, { sw: 1 });
  g.t(k, z + 18, { raw: 'K' }, { a: 'middle', c: 'm', mono: true });
  const d = kind === 'call' ? `M${L},${z} L${k},${z} L${R},${z - amp}` : kind === 'put' ? `M${L},${z - amp} L${k},${z} L${R},${z}`
    : kind === 'scall' ? `M${L},${z} L${k},${z} L${R},${z + amp}` : `M${L},${z + amp} L${k},${z} L${R},${z}`;
  g.path(d, kind[0] === 's' ? C.red : C.gold, { sw: 2.6 });
}
const PAY = [['t1', 'call'], ['t2', 'put'], ['t3', 'scall'], ['t4', 'sput']];
figure('payoff', g => {
  PAY.forEach(([k, kind], i) => hockey(g, 12 + i * 176, 6, 168, k, kind));
  g.t(360, 172, 'ax', { a: 'middle', c: 'm' });
  return [720, 192];
}, g => {
  PAY.forEach(([k, kind], i) => hockey(g, 8 + (i % 2) * 176, 4 + Math.floor(i / 2) * 150, 168, k, kind));
  g.t(180, 314, 'ax', { a: 'middle', c: 'm' });
  return [360, 334];
});

/* ── ch3: one step ── */
figure('onestep', g => {
  g.box(20, 106, 170, 40, C.cyan); g.t(105, 126, 's0', { a: 'middle' });
  g.line(190, 118, 268, 62, C.mute, { arrow: true }); g.line(190, 134, 268, 190, C.mute, { arrow: true });
  g.box(270, 26, 170, 64, C.dim, { a: 0.35 }); g.t(355, 46, 'up', { a: 'middle', c: 'c' }); g.t(355, 70, 'fu', { a: 'middle', c: 'g' });
  g.box(270, 162, 170, 64, C.dim, { a: 0.35 }); g.t(355, 182, 'dn', { a: 'middle', c: 'c' }); g.t(355, 206, 'fd', { a: 'middle', c: 'g' });
  g.t(456, 58, 'ru', { c: 'n' }); g.t(456, 194, 'rd', { c: 'n' });
  g.line(20, 244, 700, 244, C.line, { sw: 1 });
  g.t(20, 268, 'rep', { c: 'n' }); g.t(700, 268, 'pr', { a: 'end', c: 'g', weight: 600 });
  return [720, 290];
}, g => {
  g.box(95, 8, 170, 38, C.cyan); g.t(180, 27, 's0', { a: 'middle' });
  g.line(150, 46, 96, 84, C.mute, { arrow: true }); g.line(210, 46, 264, 84, C.mute, { arrow: true });
  g.box(8, 86, 168, 60, C.dim, { a: 0.35 }); g.t(92, 104, 'up', { a: 'middle', c: 'c' }); g.t(92, 128, 'fu', { a: 'middle', c: 'g' });
  g.box(184, 86, 168, 60, C.dim, { a: 0.35 }); g.t(268, 104, 'dn', { a: 'middle', c: 'c' }); g.t(268, 128, 'fd', { a: 'middle', c: 'g' });
  g.t(180, 172, 'ru', { a: 'middle', c: 'n' }); g.t(180, 198, 'rd', { a: 'middle', c: 'n' });
  g.line(10, 218, 350, 218, C.line, { sw: 1 });
  g.t(180, 240, 'rep', { a: 'middle', c: 'n' }); g.t(180, 266, 'pr', { a: 'middle', c: 'g', weight: 600 });
  return [360, 286];
});

/* ── ch4: the three-step CRR tree, values from the model ── */
const TREE = M.crr(Object.assign({}, M.EX.base, { N: 3, keep: true }));
function tree(g, xs, cy, dy, bw, bh) {
  const pos = (i, j) => [xs[i], cy - (2 * j - i) * dy];
  for (let i = 0; i < 3; i++) for (let j = 0; j <= i; j++) { const [x, y] = pos(i, j); for (const jj of [j, j + 1]) { const [x2, y2] = pos(i + 1, jj); g.line(x + bw / 2, y, x2 - bw / 2, y2, C.line, { sw: 1.3 }); } }
  for (let i = 0; i <= 3; i++) for (let j = 0; j <= i; j++) {
    const [x, y] = pos(i, j);
    g.box(x - bw / 2, y - bh / 2, bw, bh, i === 3 ? C.gold : C.dim, { a: i === 3 ? 0.12 : 0.35 });
    g.t(x, y - 9, { raw: M.fmt(M.crrNode(100, TREE.u, i, j), 2) }, { a: 'middle', c: 'c', mono: true });
    g.t(x, y + 10, { raw: M.fmt(TREE.levels[i][j], 2) }, { a: 'middle', c: 'g', mono: true });
  }
}
figure('tree', g => {
  tree(g, [80, 260, 440, 620], 180, 46, 104, 44);
  g.t(16, 20, 'st', { c: 'c' }); g.t(16, 42, 'op', { c: 'g' });
  g.t(80, 222, 't0', { a: 'middle', c: 'm' }); g.t(620, 358, 't3', { a: 'middle', c: 'm' });
  g.t(300, 358, 'back', { a: 'middle', c: 'm' });
  return [720, 378];
}, g => {
  tree(g, [43, 134, 225, 316], 176, 42, 82, 40);
  g.t(4, 14, 'st', { c: 'c' }); g.t(4, 34, 'op', { c: 'g' });
  g.t(43, 214, 't0', { a: 'middle', c: 'm' }); g.t(316, 338, 't3', { a: 'middle', c: 'm' });
  g.t(4, 364, 'back', { c: 'm' });
  return [360, 382];
});

/* ── ch6: the finite-difference grid ── */
function grid(g, x0, dx, nc, ys, sc) { // sc: stencil centre column
  for (let rIdx = 0; rIdx < ys.length; rIdx++) g.line(x0, ys[rIdx], x0 + dx * (nc - 1), ys[rIdx], C.line, { sw: 1 });
  for (let c = 0; c < nc; c++) g.line(x0 + c * dx, ys[0], x0 + c * dx, ys[ys.length - 1], C.line, { sw: 1 });
  for (const c of [sc - 1, sc, sc + 1]) g.line(x0 + c * dx, ys[1], x0 + sc * dx, ys[2] + (c === sc ? 9 : 4), C.violet, { sw: 1.6, arrow: c === sc });
  for (let rIdx = 0; rIdx < ys.length; rIdx++) for (let c = 0; c < nc; c++) {
    const edge = c === 0 || c === nc - 1, st = rIdx === 1 && Math.abs(c - sc) <= 1, tgt = rIdx === 2 && c === sc;
    g.circle(x0 + c * dx, ys[rIdx], tgt ? 7 : 5, rIdx === 0 ? C.gold : edge ? C.green : st ? C.cyan : tgt ? C.violet : C.mute, { solid: rIdx === 0 || edge || st || tgt, a: 0.3 });
  }
}
figure('stencil', g => {
  grid(g, 110, 62.5, 9, [236, 186, 136, 86], 5);
  g.t(12, 22, 'ay', { c: 'm' }); g.t(700, 22, 'edge', { a: 'end', c: 'n' });
  g.t(422, 52, 'st', { a: 'middle', c: 'v' }); g.line(422, 62, 422, 126, C.violet, { sw: 1, dash: '3 3' });
  g.t(360, 268, 'row0', { a: 'middle', c: 'g' }); g.t(700, 268, 'ax', { a: 'end', c: 'm' });
  return [720, 290];
}, g => {
  grid(g, 40, 40, 8, [250, 205, 160, 115], 4);
  g.t(4, 16, 'ay', { c: 'm' }); g.t(356, 16, 'edge', { a: 'end', c: 'n' });
  g.t(180, 50, 'st', { a: 'middle', c: 'v' }); g.line(200, 60, 200, 150, C.violet, { sw: 1, dash: '3 3' });
  g.t(180, 282, 'row0', { a: 'middle', c: 'g' }); g.t(356, 308, 'ax', { a: 'end', c: 'm' });
  return [360, 326];
});

/* ── ch7: the hedging loop ── */
figure('loop', g => {
  g.box(20, 24, 200, 46, C.gold); g.t(120, 47, 'b1', { a: 'middle' });
  g.box(260, 24, 200, 46, C.cyan); g.t(360, 47, 'b2', { a: 'middle' });
  g.box(500, 24, 200, 46, C.dim, { a: 0.35 }); g.t(600, 47, 'b3', { a: 'middle' });
  g.box(500, 126, 200, 46, C.cyan); g.t(600, 149, 'b4', { a: 'middle' });
  g.box(140, 126, 260, 46, C.gold); g.t(270, 149, 'end', { a: 'middle' });
  g.line(222, 47, 256, 47, C.mute, { arrow: true }); g.line(462, 47, 496, 47, C.mute, { arrow: true });
  g.line(560, 72, 560, 122, C.red, { arrow: true }); g.line(640, 124, 640, 74, C.red, { arrow: true });
  g.line(498, 149, 404, 149, C.mute, { arrow: true, dash: '5 4' });
  g.t(360, 208, 'note', { a: 'middle', c: 'r' });
  return [720, 230];
}, g => {
  const bx = (y, key, col, o) => { g.box(40, y, 250, 42, col, o); g.t(165, y + 21, key, { a: 'middle' }); };
  bx(8, 'b1', C.gold); bx(72, 'b2', C.cyan); bx(136, 'b3', C.dim, { a: 0.35 }); bx(200, 'b4', C.cyan); bx(280, 'end', C.gold);
  g.line(165, 51, 165, 69, C.mute, { arrow: true }); g.line(165, 115, 165, 133, C.mute, { arrow: true }); g.line(165, 179, 165, 197, C.red, { arrow: true });
  g.path('M290,221 L326,221 L326,157 L294,157', C.red, { arrow: true });
  g.line(165, 243, 165, 277, C.mute, { arrow: true, dash: '5 4' });
  g.t(180, 346, 'note', { a: 'middle', c: 'r' });
  return [360, 368];
});

/* ── ch9: bilateral against central clearing, amounts from the model's example ── */
const NET = M.netting(M.NET_EXAMPLE.owes), NAMES = M.NET_EXAMPLE.names;
function web(g, ox, oy, tKey, sKey, central) {
  const P = [[ox + 60, oy + 62], [ox + 280, oy + 62], [ox + 280, oy + 202], [ox + 60, oy + 202]], cx = ox + 170, cy = oy + 132;
  g.t(cx, oy + 16, tKey, { a: 'middle' });
  if (!central) {
    for (const pr of NET.pairs) {
      const [x1, y1] = P[pr.i], [x2, y2] = P[pr.j], diag = Math.abs(pr.i - pr.j) === 2, f = diag ? 0.3 : 0.5;
      g.line(x1, y1, x2, y2, C.mute, { sw: 1.3 });
      const lx = x1 + (x2 - x1) * f, ly = y1 + (y2 - y1) * f, horiz = y1 === y2, vert = x1 === x2;
      g.box(lx - 16, ly - 11, 32, 22, C.card, { solid: true, nostroke: true, rx: 4 });
      g.t(lx, ly, { raw: String(Math.abs(pr.net)) }, { a: 'middle', c: 'r', mono: true });
      void horiz; void vert;
    }
  } else {
    P.forEach(([x, y], i) => {
      g.line(x, y, cx, cy, C.green, { sw: 1.5 });
      const lx = (x + cx) / 2, ly = (y + cy) / 2;
      g.box(lx - 16, ly - 11, 32, 22, C.card, { solid: true, nostroke: true, rx: 4 });
      g.t(lx, ly, { raw: String(Math.abs(NET.net[i])) }, { a: 'middle', c: 'n', mono: true });
    });
    g.box(cx - 50, cy - 20, 100, 40, C.card, { solid: true, nostroke: true }); g.box(cx - 50, cy - 20, 100, 40, C.green, { a: 0.25 }); g.t(cx, cy, 'ccp', { a: 'middle' });
  }
  P.forEach(([x, y], i) => { g.circle(x, y, 19, C.card, { solid: true }); g.circle(x, y, 19, C.cyan, { a: 0.3 }); g.t(x, y, { raw: NAMES[i] }, { a: 'middle', mono: true, fs: 15 }); });
  g.t(cx, oy + 250, sKey, { a: 'middle', c: central ? 'n' : 'r' });
}
figure('ccp', g => { web(g, 10, 6, 't1', 's1', false); web(g, 370, 6, 't2', 's2', true); return [720, 282]; },
  g => { web(g, 10, 4, 't1', 's1', false); web(g, 10, 286, 't2', 's2', true); return [360, 562]; });

/* ── ch10: notional against gross market value, to scale ── */
const BIS = M.FRONTIER.bisOtc;
figure('notional', g => {
  g.t(20, 20, 'n', { c: 'c' }); g.box(20, 36, 680, 30, C.cyan, { a: 0.35, rx: 3 });
  g.t(20, 92, 'g', { c: 'g' }); g.box(20, 108, r1(680 * BIS.gmvTn / BIS.notionalTn), 30, C.gold, { solid: true, rx: 2 });
  return [720, 150];
}, g => {
  g.t(10, 20, 'n', { c: 'c' }); g.box(10, 36, 340, 30, C.cyan, { a: 0.35, rx: 3 });
  g.t(10, 92, 'g', { c: 'g' }); g.box(10, 108, r1(340 * BIS.gmvTn / BIS.notionalTn), 30, C.gold, { solid: true, rx: 2 });
  return [360, 150];
});

/* ── ch11: a dated future converges, a perpetual is pulled by funding ── */
const WOB = [0, 6, -3, 5, 9, 2, -4, 3, 8, 4, -2, 5, 1, 7, 3, -1, 4]; // a fixed wiggle for the spot line (schematic)
function lines(g, x0, x1, y, perp) {
  const n = WOB.length, X = i => x0 + (x1 - x0) * i / (n - 1), sp = WOB.map((w, i) => [X(i), y - w]);
  const gap = i => (perp ? 26 + 6 * Math.sin(i * 1.3) : 30 * (1 - i / (n - 1)));
  g.path('M' + sp.map(p => `${r1(p[0])},${r1(p[1])}`).join(' L'), C.cyan, { sw: 2 });
  g.path('M' + sp.map((p, i) => `${r1(p[0])},${r1(p[1] - gap(i))}`).join(' L'), perp ? C.violet : C.gold, { sw: 2 });
  if (perp) for (const i of [3, 7, 11, 15]) g.line(X(i), sp[i][1] - gap(i) + 3, X(i), sp[i][1] - 3, C.red, { sw: 1.6, arrow: true });
  else g.line(x1, y - 46, x1, y + 22, C.mute, { sw: 1.2, dash: '4 3' });
  return sp;
}
figure('perp', g => {
  g.t(20, 18, 't1', {}); g.t(700, 18, 'exp', { a: 'end', c: 'm' });
  lines(g, 40, 640, 96, false); g.t(40, 44, 'fut', { c: 'g' }); g.t(40, 118, 'spot', { c: 'c' });
  g.line(20, 146, 700, 146, C.line, { sw: 1 });
  g.t(20, 170, 't2', {}); g.t(700, 170, 'noexp', { a: 'end', c: 'm' });
  lines(g, 40, 690, 252, true); g.t(40, 200, 'perp', { c: 'v' }); g.t(40, 274, 'spot', { c: 'c' });
  g.t(360, 298, 'fund', { a: 'middle', c: 'r' });
  return [720, 318];
}, g => {
  g.t(6, 16, 't1', {});
  lines(g, 14, 330, 100, false); g.t(14, 46, 'fut', { c: 'g' }); g.t(14, 122, 'spot', { c: 'c' });
  g.t(354, 146, 'exp', { a: 'end', c: 'm' });
  g.line(6, 166, 354, 166, C.line, { sw: 1 });
  g.t(6, 188, 't2', {}); g.t(354, 188, 'noexp', { a: 'end', c: 'm' });
  lines(g, 14, 346, 270, true); g.t(14, 216, 'perp', { c: 'v' }); g.t(14, 292, 'spot', { c: 'c' });
  g.t(180, 320, 'fund', { a: 'middle', c: 'r' });
  return [360, 340];
});

fs.mkdirSync(OUT, { recursive: true });
// The first line marks the file as generated (page.json "generators"; build-pages strips it and --check reruns this script).
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
