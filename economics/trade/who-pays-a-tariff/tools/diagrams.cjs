#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`. Do not hand-edit the output:
   `build-pages.cjs --check` reruns this script (page.json "generators") and fails on any difference.
   Each diagram is a <figure class="dia"> with a wide SVG (class "w", viewBox 720 wide, shown above 640 px) and a narrow
   one (class "n", 360 wide), font-size 14 in both so labels render at 11 px or more at 320 px. Every worded <text>
   carries a data-i18n key whose string lives in the ::: diagram block of content.<lang>.md. Literal text is
   language-neutral only: Ricardo's labour numbers and the IEA shares, from ../models.js, pinned in tests/models.cjs.
   Colours as in the labs: buyers / demand gold, foreign supply cyan, home producers violet, loss red, government green. */
const fs = require('fs');
const path = require('path');
const M = require('../models.js');
const OUT = path.join(__dirname, '..', 'figures');
const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;

function drawing(name, v) {
  const parts = [], used = new Set();
  const mk = col => `ar-${name}-${v}-${col.slice(1)}`;
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.solid ? col : tint(col, o.a == null ? 0.14 : o.a)}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#${mk(col)})"` : ''}/>`); },
    path(d, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.5}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#${mk(col)})"` : ''}/>`); },
    poly(pts, col, a) { parts.push(`<polygon points="${pts.map(p => p.map(r1).join(',')).join(' ')}" fill="${tint(col, a == null ? 0.3 : a)}" stroke="none"/>`); },
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}`;
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    }
  };
  g.finish = (W, H) => {
    const defs = used.size ? '<defs>' + [...used].map(col => `<marker id="${mk(col)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`).join('') + '</defs>' : '';
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

/* ── elasticity: steep vs flat demand ── */
function curvesPanel(g, x0, y0, w, h, steep) {
  const L = x0 + 34, B = y0 + h - 30, R = x0 + w - 10, T = y0 + 30;
  g.line(L, T, L, B, C.mute, { sw: 1 }); g.line(L, B, R, B, C.mute, { sw: 1 });
  g.t(L + 6, T - 12, 'p', { c: 'm' }); g.t(R, B + 16, 'q', { a: 'end', c: 'm' });
  const p0 = B - (B - T) * 0.45, p1 = B - (B - T) * 0.7, qx0 = L + (R - L) * 0.62;
  const qx1 = steep ? qx0 - (R - L) * 0.07 : qx0 - (R - L) * 0.42;
  const k = (qx1 - qx0) / (p1 - p0);
  const ya = Math.max(T + 4, p0 + (L + 4 - qx0) / k), yb = Math.min(B - 6, p0 + (R - 4 - qx0) / k); // keep the line inside the axes
  g.line(qx0 + (ya - p0) * k, ya, qx0 + (yb - p0) * k, yb, C.gold, { sw: 2.4 });
  g.line(L, p0, qx0, p0, C.mute, { dash: '3 3', sw: 1 }); g.line(L, p1, qx1, p1, C.mute, { dash: '3 3', sw: 1 });
  g.line(L + 12, p0 - 3, L + 12, p1 + 6, C.red, { arrow: true, sw: 1.6 });
  g.line(qx0, p1 - 14, qx1 + 6, p1 - 14, C.cyan, { arrow: true, sw: 1.6 });
  g.t(L + 20, (p0 + p1) / 2, 'up', { c: 'r' });
  g.t((L + R) / 2 + 8, y0 + 10, steep ? 'steep' : 'flat', { a: 'middle', weight: 600 });
  g.t(Math.min(qx0, qx1) - 4, p1 - 32, steep ? 'small' : 'big', { a: steep ? 'end' : 'start', c: 'c' });
}
figure('curves', g => { curvesPanel(g, 0, 0, 350, 250, true); curvesPanel(g, 370, 0, 350, 250, false); return [720, 250]; },
  g => { curvesPanel(g, 0, 0, 360, 230, true); curvesPanel(g, 0, 240, 360, 230, false); return [360, 470]; });

/* ── ch2: who writes the cheque, who bears it ── */
figure('wedge', g => {
  const xs = [20, 200, 380, 560], keys = ['f', 'i', 'r', 'c'], cols = [C.cyan, C.mute, C.mute, C.gold];
  xs.forEach((x, i) => { g.box(x, 60, 140, 44, cols[i]); g.t(x + 70, 82, keys[i], { a: 'middle' }); if (i < 3) g.line(x + 142, 82, x + 176, 82, C.mute, { arrow: true }); });
  g.box(200, 160, 140, 40, C.green); g.t(270, 180, 'gov', { a: 'middle', c: 'n' });
  g.line(270, 106, 270, 156, C.green, { arrow: true }); g.t(282, 132, 'pay', { c: 'n' });
  g.t(20, 24, 'legal', { c: 'm' }); g.t(700, 24, 'econ', { a: 'end', c: 'm' });
  g.path('M 190 124 C 150 150, 110 150, 90 110', C.cyan, { arrow: true }); g.t(20, 156, 'back', { c: 'c' });
  g.path('M 350 124 C 470 160, 580 150, 630 110', C.gold, { arrow: true }); g.t(700, 180, 'fwd', { a: 'end', c: 'g' });
  return [720, 210];
}, g => {
  const keys = ['f', 'i', 'r', 'c'], cols = [C.cyan, C.mute, C.mute, C.gold];
  g.t(180, 14, 'legal', { a: 'middle', c: 'm' });
  keys.forEach((k, i) => { const y = 30 + i * 64; g.box(90, y, 180, 40, cols[i]); g.t(180, y + 20, k, { a: 'middle' }); if (i < 3) g.line(180, y + 42, 180, y + 60, C.mute, { arrow: true }); });
  g.box(10, 92, 70, 40, C.green); g.t(45, 112, 'gov', { a: 'middle', c: 'n' }); g.line(88, 116, 82, 116, C.green, { arrow: true });
  g.t(180, 300, 'econ', { a: 'middle', c: 'm' });
  g.t(180, 326, 'back', { a: 'middle', c: 'c' }); g.t(180, 352, 'fwd', { a: 'middle', c: 'g' });
  g.t(300, 112, 'pay', { a: 'middle', c: 'n' });
  return [360, 370];
});

/* ── ch3: the welfare areas ── */
function ledgerPanel(g, W, H, narrow) {
  const L = 40, B = H - 34, R = W - 10, T = 26;
  const X = q => L + (R - L) * q / 110, Y = p => B - (B - T) * (p - 60) / 80;
  g.line(L, T, L, B, C.mute, { sw: 1 }); g.line(L, B, R, B, C.mute, { sw: 1 });
  const D = p => 100 - (p - 100), S = p => 40 + 0.4 * (p - 100);
  const pw = 100, pt = 116, ps = 96, d0 = D(pw), d1 = D(pt), s0 = S(pw), s1 = S(pt);
  g.poly([[X(0), Y(pt)], [X(s1), Y(pt)], [X(s0), Y(pw)], [X(0), Y(pw)]], C.violet, 0.35);
  g.poly([[X(s0), Y(pw)], [X(s1), Y(pt)], [X(s1), Y(pw)]], C.red, 0.4);
  g.poly([[X(s1), Y(pt)], [X(d1), Y(pt)], [X(d1), Y(pw)], [X(s1), Y(pw)]], C.gold, 0.32);
  g.poly([[X(d1), Y(pt)], [X(d0), Y(pw)], [X(d1), Y(pw)]], C.red, 0.4);
  g.poly([[X(s1), Y(pw)], [X(d1), Y(pw)], [X(d1), Y(ps)], [X(s1), Y(ps)]], C.cyan, 0.32);
  g.line(X(D(140)), Y(140), X(D(92)), Y(92), C.gold, { sw: 2.2 });
  g.line(X(S(62)), Y(62), X(S(138)), Y(138), C.violet, { sw: 2.2 });
  g.line(L, Y(pw), R, Y(pw), C.mute, { sw: 1, dash: '4 3' }); g.line(L, Y(pt), R, Y(pt), C.ink, { sw: 1 }); g.line(L, Y(ps), X(d1), Y(ps), C.cyan, { sw: 1, dash: '3 3' });
  if (!narrow) {
    g.t(R, Y(pw) - 10, 'pw', { a: 'end', c: 'm' }); g.t(R, Y(pt) - 10, 'pt', { a: 'end' }); g.t(X(d1) + 6, Y(ps) + 8, 'ps', { c: 'c' });
    g.t(X(D(138)) + 8, Y(138), 'd', { c: 'g' }); g.t(X(S(136)) - 8, Y(136), 's', { a: 'end', c: 'v' });
    g.t(L + 8, B + 18, 'imp', { c: 'm' });
  }
  return { X, Y, s0, s1, d0, d1, pw, pt, ps };
}
figure('ledger', g => {
  const P = ledgerPanel(g, 470, 320, false);
  const keys = [['a', C.violet, 'v'], ['b', C.red, 'r'], ['c', C.gold, 'g'], ['dd', C.red, 'r'], ['e', C.cyan, 'c']];
  keys.forEach(([k, col, c], i) => { const y = 40 + i * 50; g.box(500, y, 20, 20, col, { a: 0.4 }); g.t(530, y + 10, k, { c }); });
  void P; return [720, 320];
}, g => {
  ledgerPanel(g, 360, 280, true);
  const keys = [['a', C.violet, 'v'], ['b', C.red, 'r'], ['c', C.gold, 'g'], ['dd', C.red, 'r'], ['e', C.cyan, 'c'], ['pt', C.ink, ''], ['pw', C.mute, 'm']];
  keys.forEach(([k, col, c], i) => { const y = 296 + i * 28; g.box(20, y - 8, 16, 16, col, { a: 0.4 }); g.t(46, y, k, { c }); });
  return [360, 490];
});

/* ── ch4: Ricardo's table ── */
const RC = M.RICARDO;
figure('ricardo', g => {
  g.t(360, 18, 'h', { a: 'middle', c: 'm' });
  g.t(260, 52, 'cloth', { a: 'middle' }); g.t(380, 52, 'wine', { a: 'middle' }); g.t(560, 52, 'ratio', { a: 'middle', c: 'm' });
  [['en', RC.E, C.cyan, 'cloth'], ['pt', RC.P, C.violet, 'wine']].forEach(([k, r, col, sp], i) => {
    const y = 80 + i * 60;
    g.box(40, y, 640, 44, col, { a: 0.1 });
    g.t(60, y + 22, k, { weight: 600 });
    g.t(260, y + 22, { raw: String(r.cloth) }, { a: 'middle', mono: true, c: sp === 'cloth' ? 'g' : '' });
    g.t(380, y + 22, { raw: String(r.wine) }, { a: 'middle', mono: true, c: sp === 'wine' ? 'g' : '' });
    g.t(560, y + 22, { raw: (r.cloth / r.wine).toFixed(2) }, { a: 'middle', mono: true });
  });
  g.t(60, 226, 'spec', { c: 'g' });
  g.line(150, 226, 236, 226, C.gold, { arrow: true }); g.t(250, 226, 'cloth', { c: 'c' });
  g.line(420, 226, 506, 226, C.gold, { arrow: true }); g.t(520, 226, 'wine', { c: 'v' });
  return [720, 250];
}, g => {
  g.t(180, 14, 'h', { a: 'middle', c: 'm' });
  g.t(160, 44, 'cloth', { a: 'middle' }); g.t(250, 44, 'wine', { a: 'middle' }); g.t(318, 44, { raw: '÷' }, { a: 'middle', c: 'm' });
  [['en', RC.E, C.cyan, 'cloth'], ['pt', RC.P, C.violet, 'wine']].forEach(([k, r, col, sp], i) => {
    const y = 64 + i * 52;
    g.box(6, y, 348, 40, col, { a: 0.1 });
    g.t(16, y + 20, k, { weight: 600 });
    g.t(170, y + 20, { raw: String(r.cloth) }, { a: 'middle', mono: true, c: sp === 'cloth' ? 'g' : '' });
    g.t(240, y + 20, { raw: String(r.wine) }, { a: 'middle', mono: true, c: sp === 'wine' ? 'g' : '' });
    g.t(310, y + 20, { raw: (r.cloth / r.wine).toFixed(2) }, { a: 'middle', mono: true });
  });
  g.t(180, 186, 'ratio', { a: 'middle', c: 'm' });
  g.t(16, 216, 'spec', { c: 'g' }); g.t(120, 216, 'en', {}); g.line(190, 216, 226, 216, C.gold, { arrow: true }); g.t(236, 216, 'cloth', { c: 'c' });
  g.t(120, 244, 'pt', {}); g.line(190, 244, 226, 244, C.gold, { arrow: true }); g.t(236, 244, 'wine', { c: 'v' });
  return [360, 262];
});

/* ── ch5: saving, investment and the current account ── */
figure('flows', g => {
  g.box(20, 40, 300, 200, C.cyan, { a: 0.06 }); g.t(170, 22, 'home', { a: 'middle', weight: 600 });
  g.box(400, 40, 300, 200, C.violet, { a: 0.06 }); g.t(550, 22, 'abroad', { a: 'middle', weight: 600 });
  g.box(40, 70, 120, 40, C.cyan); g.t(100, 90, 's', { a: 'middle' });
  g.box(180, 130, 120, 40, C.gold); g.t(240, 150, 'i', { a: 'middle' });
  g.box(440, 130, 140, 40, C.violet); g.t(510, 150, 'fs', { a: 'middle' });
  g.line(160, 98, 200, 128, C.cyan, { arrow: true });
  g.line(438, 150, 304, 150, C.violet, { arrow: true, dash: '5 3' }); g.t(370, 130, 'gap', { a: 'middle', c: 'r', fs: 13 });
  g.line(400, 200, 322, 200, C.mute, { arrow: true }); g.t(560, 200, 'goods', { a: 'middle', c: 'm' });
  g.line(322, 222, 400, 222, C.mute, { arrow: true }); g.t(170, 222, 'assets', { a: 'middle', c: 'm' });
  return [720, 250];
}, g => {
  g.t(180, 14, 'home', { a: 'middle', weight: 600 });
  g.box(10, 30, 160, 40, C.cyan); g.t(90, 50, 's', { a: 'middle' });
  g.box(190, 30, 160, 40, C.violet); g.t(270, 50, 'fs', { a: 'middle' });
  g.line(90, 72, 160, 116, C.cyan, { arrow: true }); g.line(270, 72, 200, 116, C.violet, { arrow: true, dash: '5 3' });
  g.box(100, 118, 160, 40, C.gold); g.t(180, 138, 'i', { a: 'middle' });
  g.t(180, 184, 'gap', { a: 'middle', c: 'r' });
  g.t(180, 214, 'abroad', { a: 'middle', weight: 600 });
  g.t(180, 242, 'goods', { a: 'middle', c: 'm' }); g.t(180, 268, 'assets', { a: 'middle', c: 'm' });
  return [360, 284];
});

/* ── ch5: the bilateral triangle ── */
function tri(g, cx, top, s, narrow) {
  const A = [cx, top + 20], B = [cx + s * 0.866, top + 20 + s * 1.5 * 0.866 * 0.77], Cc = [cx - s * 0.866, top + 20 + s * 1.5 * 0.866 * 0.77];
  const node = (p, k, col) => { g.box(p[0] - 80, p[1] - 18, 160, 36, col); g.t(p[0], p[1], k, { a: 'middle' }); };
  const edge = (p, q, k, off) => { const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; g.line(p[0] + (q[0] - p[0]) * 0.22, p[1] + (q[1] - p[1]) * 0.22, p[0] + (q[0] - p[0]) * 0.78, p[1] + (q[1] - p[1]) * 0.78, C.gold, { arrow: true }); g.t(mx + off[0], my + off[1], k, { a: 'middle', c: 'g' }); };
  edge(B, A, 'ab', narrow ? [52, 0] : [70, 0]); edge(Cc, B, 'bc', [0, 20]); edge(A, Cc, 'ca', narrow ? [-56, 0] : [-80, 0]);
  node(A, 'a', C.cyan); node(B, 'b', C.violet); node(Cc, 'c', C.green);
  return Cc[1];
}
figure('triangle', g => { const y = tri(g, 360, 10, 200, false); g.t(360, y + 46, 'note', { a: 'middle', c: 'm' }); return [720, y + 66]; },
  g => { const y = tri(g, 180, 10, 115, true); g.t(180, y + 46, 'note', { a: 'middle', c: 'm' }); return [360, y + 62]; });

/* ── ch6: diversion and transshipment ── */
function route(g, x, y, w, after) {
  const a = [x + 10, y + 40], us = [x + w - 110, y + 40], b = [x + 10, y + 130];
  g.box(a[0], a[1] - 18, 100, 36, C.red); g.t(a[0] + 50, a[1], 'a', { a: 'middle' });
  g.box(b[0], b[1] - 18, 100, 36, C.cyan); g.t(b[0] + 50, b[1], 'b', { a: 'middle' });
  g.box(us[0], us[1] - 18, 100, 36, C.gold); g.t(us[0] + 50, us[1], 'us', { a: 'middle' });
  g.line(a[0] + 102, a[1], us[0] - 4, us[1], C.red, { arrow: true, sw: after ? 1.4 : 4 });
  g.line(b[0] + 102, b[1] - 8, us[0] + 20, us[1] + 20, C.cyan, { arrow: true, sw: after ? 4 : 1.4 });
  if (after) {
    g.t((a[0] + us[0]) / 2 + 50, a[1] - 14, 'tariff', { a: 'middle', c: 'r' });
    g.path(`M ${a[0] + 50} ${a[1] + 20} L ${b[0] + 50} ${b[1] - 20}`, C.mute, { dash: '4 3', arrow: true });
    g.t(b[0] + 60, (a[1] + b[1]) / 2, 'trans', { c: 'm' });
    g.t(b[0] + 130, b[1] + 26, 'divert', { c: 'c' });
  }
  g.t(x + w / 2, y + 4, after ? 'after' : 'before', { a: 'middle', weight: 600 });
}
figure('reroute', g => { route(g, 0, 10, 340, false); route(g, 370, 10, 350, true); return [720, 190]; },
  g => { route(g, 0, 10, 360, false); route(g, 0, 200, 360, true); return [360, 380]; });

/* ── ch7: rare-earth chain shares (IEA, 2024) ── */
const IEA = M.FRONTIER.iea;
function bars(g, x, y, w, narrow) {
  const rows = [['mine', IEA.mined], ['refine', IEA.refined], ['magnet', IEA.magnets]], lw = narrow ? 110 : 150, bw = w - lw - 60;
  rows.forEach(([k, v], i) => {
    const yy = y + i * 50;
    g.t(x, yy + 14, k, {});
    g.box(x + lw, yy, bw * v / 100, 28, C.red, { a: 0.5, rx: 3 }); g.box(x + lw + bw * v / 100, yy, bw * (100 - v) / 100, 28, C.mute, { a: 0.15, rx: 3 });
    g.t(x + lw + bw * v / 100 - 8, yy + 14, { raw: (k === 'magnet' ? '~' : '') + v + '%' }, { a: 'end', mono: true });
    if (i < 2) g.line(x + 40, yy + 32, x + 40, yy + 46, C.mute, { arrow: true, sw: 1 });
  });
  const ly = y + 160;
  g.box(x + lw, ly - 8, 16, 16, C.red, { a: 0.5, rx: 3 }); g.t(x + lw + 24, ly, 'cn', {});
  g.box(x + lw + 100, ly - 8, 16, 16, C.mute, { a: 0.15, rx: 3 }); g.t(x + lw + 124, ly, 'rest', { c: 'm' });
  g.t(x, ly + 32, 'use', { c: 'm' });
  return ly + 50;
}
figure('rare', g => [720, bars(g, 20, 10, 700, false)], g => [360, bars(g, 6, 10, 354, true)]);

/* ── ch7: chip chokepoints ── */
const CH = [['eda', 'w1'], ['tool', 'w2'], ['fab', 'w3'], ['hbm', 'w4'], ['pkg', 'w3']];
figure('chips', g => {
  CH.forEach(([k, w], i) => { const x = 10 + i * 118; g.box(x, 40, 108, 40, C.cyan); g.t(x + 54, 60, k, { a: 'middle', fs: 13 }); g.t(x + 54, 100, w, { a: 'middle', c: 'm', fs: 12 }); g.line(x + 54, 82, x + 54, 88, C.line, { sw: 1 }); });
  g.line(10 + 4 * 118 + 110, 60, 606, 60, C.gold, { arrow: true }); g.box(610, 40, 100, 40, C.gold); g.t(660, 60, 'chip', { a: 'middle' });
  return [720, 120];
}, g => {
  CH.forEach(([k, w], i) => { const y = 10 + i * 52; g.box(10, y, 140, 38, C.cyan); g.t(80, y + 19, k, { a: 'middle' }); g.t(162, y + 19, w, { c: 'm' }); if (i < 4) g.line(80, y + 40, 80, y + 50, C.mute, { arrow: true, sw: 1 }); });
  g.line(80, 10 + 4 * 52 + 40, 80, 10 + 5 * 52 - 4, C.gold, { arrow: true }); g.box(10, 10 + 5 * 52, 140, 38, C.gold); g.t(80, 10 + 5 * 52 + 19, 'chip', { a: 'middle' });
  return [360, 10 + 5 * 52 + 50];
});

/* ── ch8: difference in differences ── */
function did(g, W, H) {
  const L = 30, R = W - 20, T = 40, B = H - 40, x0 = L + (R - L) * 0.15, x1 = L + (R - L) * (W < 400 ? 0.58 : 0.75);
  g.line(L, B, R, B, C.mute, { sw: 1 });
  const mid = (x0 + x1) / 2;
  g.line(mid, T - 10, mid, B, C.line, { dash: '4 4', sw: 1 });
  g.t((L + mid) / 2, B + 18, 'pre', { a: 'middle', c: 'm' }); g.t((mid + R) / 2, B + 18, 'post', { a: 'middle', c: 'm' });
  const yc0 = B - 40, yc1 = B - 80, yt0 = B - 60, yt1 = B - 180;
  g.line(x0, yc0, x1, yc1, C.cyan, { sw: 2.4 }); g.line(x0, yt0, x1, yt1, C.gold, { sw: 2.4 });
  g.line(x0, yt0, x1, yt0 - (yc0 - yc1), C.gold, { sw: 1.2, dash: '4 3' });
  g.line(x1 + 10, yt0 - (yc0 - yc1), x1 + 10, yt1 + 4, C.red, { arrow: true, sw: 1.8 });
  g.t(x1 + 18, (yt0 - (yc0 - yc1) + yt1) / 2, 'effect', { c: 'r' });
  g.t(x1 + 18, yc1, 'ct', { c: 'c' }); g.t(x1 + 18, yt1 - 16, 'tr', { c: 'g' });
  g.t(x0, T - 14, 'common', { c: 'm' });
}
figure('did', g => { did(g, 720, 280); return [720, 280]; }, g => { did(g, 360, 280); return [360, 280]; });

for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), `<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n${html}\n`);
}
console.log('wrote', Object.keys(D).length, 'diagrams');
