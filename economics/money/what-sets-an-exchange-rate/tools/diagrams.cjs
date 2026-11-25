#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: page.json "generators" makes `build-pages.cjs --check` rerun this script.
   Helper follows economics/markets/why-a-few-firms-win/tools/diagrams.cjs: each <figure class="dia"> holds a wide SVG
   (class "w", 720 units, shown above 640 px) and a narrow one (class "n", 360 units, shown at or below 640 px).
   Every worded <text> has a data-i18n key whose string lives in the ::: diagram block of content.<lang>.md. Literal
   text is language-neutral only: numbers computed here from ../models.js and symbols (S, F, q, μ, ±2%, $).
   Colours as in the labs: dollar side gold, yuan / home side cyan, central bank violet, loss red, money green. */
const fs = require('fs');
const path = require('path');
const M = require('../models.js');
const OUT = path.join(__dirname, '..', 'figures');

const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;

function drawing(name, v) {
  const parts = [], used = new Set();
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 8 : o.rx}" fill="${tint(col, o.a == null ? 0.12 : o.a)}" stroke="${col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.6}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    path(d, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.6}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${tint(col, o.a == null ? 0.16 : o.a)}" stroke="${col}" stroke-width="${o.sw || 1.3}"/>`); },
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'middle'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}`;
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
const fx = (x, d) => M.fmt(x, d, 'en');

/* ── ch1: who sells and who buys dollars ── */
figure('flows', g => {
  g.t(130, 20, 'sell', { c: 'g', weight: 600 }); g.t(590, 20, 'buy', { c: 'c', weight: 600 });
  g.box(30, 44, 200, 44, C.gold); g.t(130, 66, 's1');
  g.box(30, 104, 200, 44, C.gold); g.t(130, 126, 's2');
  g.box(490, 44, 200, 44, C.cyan); g.t(590, 66, 'b1');
  g.box(490, 104, 200, 44, C.cyan); g.t(590, 126, 'b2');
  g.box(275, 60, 170, 72, C.ink, { a: 0.06 }); g.t(360, 82, 'mk', { weight: 600 }); g.t(360, 110, 'rate', { c: 'm', fs: 13 });
  g.line(232, 66, 273, 86, C.gold, { arrow: 1 }); g.line(232, 126, 273, 108, C.gold, { arrow: 1 });
  g.line(488, 66, 447, 86, C.cyan, { arrow: 1 }); g.line(488, 126, 447, 108, C.cyan, { arrow: 1 });
  g.box(150, 184, 420, 44, C.violet); g.t(360, 206, 'cb');
  g.line(330, 182, 330, 136, C.violet, { arrow: 1 }); g.line(390, 136, 390, 182, C.violet, { arrow: 1 });
  return [720, 240];
}, g => {
  g.t(180, 18, 'sell', { c: 'g', weight: 600 });
  g.box(20, 36, 155, 42, C.gold); g.t(97.5, 57, 's1', { fs: 13 });
  g.box(185, 36, 155, 42, C.gold); g.t(262.5, 57, 's2', { fs: 13 });
  g.line(97.5, 80, 160, 116, C.gold, { arrow: 1 }); g.line(262.5, 80, 200, 116, C.gold, { arrow: 1 });
  g.box(60, 118, 240, 64, C.ink, { a: 0.06 }); g.t(180, 138, 'mk', { weight: 600 }); g.t(180, 162, 'rate', { c: 'm', fs: 13 });
  g.line(160, 222, 160, 184, C.cyan, { arrow: 1 }); g.line(200, 222, 200, 184, C.cyan, { arrow: 1 });
  g.box(20, 224, 155, 42, C.cyan); g.t(97.5, 245, 'b1', { fs: 13 });
  g.box(185, 224, 155, 42, C.cyan); g.t(262.5, 245, 'b2', { fs: 13 });
  g.t(180, 288, 'buy', { c: 'c', weight: 600 });
  g.box(10, 310, 340, 44, C.violet); g.t(180, 332, 'cb', { fs: 12 });
  return [360, 366];
});

/* ── ch2: Big Mac arithmetic, China vs US, July 2026 (numbers from models.js) ── */
const cn = M.bigmac.get('CHN');
figure('ppp', g => {
  g.box(20, 30, 180, 80, C.gold); g.t(110, 54, 'us'); g.t(110, 86, { raw: '$' + fx(M.BIGMAC.usPrice, 2) }, { c: 'g', fs: 20, weight: 600 });
  g.box(20, 130, 180, 80, C.cyan); g.t(110, 154, 'cn'); g.t(110, 186, { raw: '¥' + fx(26.5, 1) }, { c: 'c', fs: 20, weight: 600 });
  g.line(202, 70, 268, 110, C.mute, { arrow: 1 }); g.line(202, 170, 268, 130, C.mute, { arrow: 1 });
  g.box(270, 80, 190, 80, C.ink, { a: 0.06 }); g.t(365, 104, 'imp'); g.t(365, 136, { raw: fx(cn.ppp, 2) }, { fs: 20, weight: 600 });
  g.box(510, 30, 190, 80, C.ink, { a: 0.06 }); g.t(605, 54, 'mkt'); g.t(605, 86, { raw: fx(cn.ex, 2) }, { fs: 20, weight: 600 });
  g.box(510, 130, 190, 80, C.red); g.t(605, 154, 'gap', { fs: 13 }); g.t(605, 186, { raw: fx(cn.raw * 100, 1) + '%' }, { c: 'r', fs: 20, weight: 600 });
  g.line(462, 120, 508, 75, C.mute, { arrow: 1 }); g.line(605, 112, 605, 128, C.mute, { arrow: 1 });
  return [720, 230];
}, g => {
  g.box(10, 10, 160, 74, C.gold); g.t(90, 32, 'us'); g.t(90, 62, { raw: '$' + fx(M.BIGMAC.usPrice, 2) }, { c: 'g', fs: 18, weight: 600 });
  g.box(190, 10, 160, 74, C.cyan); g.t(270, 32, 'cn'); g.t(270, 62, { raw: '¥' + fx(26.5, 1) }, { c: 'c', fs: 18, weight: 600 });
  g.line(90, 86, 160, 112, C.mute, { arrow: 1 }); g.line(270, 86, 200, 112, C.mute, { arrow: 1 });
  g.box(90, 114, 180, 70, C.ink, { a: 0.06 }); g.t(180, 136, 'imp'); g.t(180, 164, { raw: fx(cn.ppp, 2) }, { fs: 18, weight: 600 });
  g.box(10, 210, 160, 74, C.ink, { a: 0.06 }); g.t(90, 232, 'mkt'); g.t(90, 262, { raw: fx(cn.ex, 2) }, { fs: 18, weight: 600 });
  g.box(190, 210, 160, 74, C.red); g.t(270, 232, 'gap', { fs: 12 }); g.t(270, 262, { raw: fx(cn.raw * 100, 1) + '%' }, { c: 'r', fs: 18, weight: 600 });
  g.line(180, 186, 180, 206, C.mute, { arrow: 1 });
  return [360, 294];
});

/* ── ch3: three parts of the real exchange rate ── */
figure('real', g => {
  [['s', C.gold, 50, 'dn'], ['pcn', C.cyan, 130, 'up'], ['pus', C.violet, 210, 'dn']].forEach(([k, col, y, dir]) => {
    g.box(20, y - 26, 190, 52, col); g.t(115, y, k, { weight: 600 });
    g.line(212, y, 440, 130, col, { arrow: 1 });
    g.t(330, y < 130 ? y - 6 : y + 6, dir, { fs: 12, c: dir === 'up' ? 'n' : 'r' });
  });
  g.box(450, 96, 250, 68, C.green); g.t(575, 118, 'q', { weight: 600 }); g.t(575, 144, { raw: 'q = P / (S · P*)' }, { mono: 1, fs: 13, c: 'm' });
  return [720, 250];
}, g => {
  [['s', C.gold, 30, 'dn'], ['pcn', C.cyan, 110, 'up'], ['pus', C.violet, 190, 'dn']].forEach(([k, col, y, dir]) => {
    g.box(10, y - 24, 150, 48, col); g.t(85, y, k, { weight: 600, fs: 13 });
    g.t(260, y, dir, { fs: 11, c: dir === 'up' ? 'n' : 'r' });
    g.line(85, y + 26, 85, y + 54, col);
  });
  g.line(85, 244, 85, 262, C.green, { arrow: 1 });
  g.box(10, 266, 340, 60, C.green); g.t(180, 286, 'q', { weight: 600 }); g.t(180, 310, { raw: 'q = P / (S · P*)' }, { mono: 1, fs: 13, c: 'm' });
  return [360, 336];
});

/* ── ch4: two riskless paths fix the forward ── */
figure('cip', g => {
  g.box(20, 100, 130, 56, C.cyan); g.t(85, 128, 'now', { weight: 600 });
  g.box(570, 100, 130, 56, C.cyan); g.t(635, 128, 'later', { weight: 600 });
  g.path('M150,112 C250,40 470,40 570,112', C.cyan, { arrow: 1 }); g.t(360, 44, 'p1', { c: 'c' });
  g.line(150, 150, 220, 200, C.gold, { arrow: 1 }); g.t(180, 222, 'p2a', { fs: 13 });
  g.box(225, 186, 270, 46, C.gold); g.t(360, 209, 'p2b');
  g.line(495, 200, 570, 150, C.gold, { arrow: 1 }); g.t(560, 222, 'p2c', { fs: 13 });
  g.t(360, 264, 'eq', { c: 'g', weight: 600 });
  return [720, 284];
}, g => {
  g.box(10, 10, 140, 50, C.cyan); g.t(80, 35, 'now', { weight: 600, fs: 13 });
  g.box(210, 10, 140, 50, C.cyan); g.t(280, 35, 'later', { weight: 600, fs: 13 });
  g.line(152, 35, 206, 35, C.cyan, { arrow: 1 }); g.t(180, 76, 'p1', { c: 'c', fs: 13 });
  g.line(80, 62, 80, 108, C.gold, { arrow: 1 }); g.t(180, 98, 'p2a', { fs: 12 });
  g.box(10, 112, 340, 44, C.gold); g.t(180, 134, 'p2b', { fs: 13 });
  g.line(280, 158, 280, 196, C.gold, { arrow: 1 }); g.t(180, 178, 'p2c', { fs: 12 });
  g.box(210, 198, 140, 40, C.cyan, { dash: '4 3' }); g.t(280, 218, 'later', { fs: 12 });
  g.t(180, 262, 'eq', { c: 'g', weight: 600, fs: 13 });
  return [360, 280];
});

/* ── ch6: carry payoff shape: small steps up, rare cliffs ── */
function stairs(x0, y0, w, h) {
  let d = `M${x0},${y0}`, y = y0; const n = 30, dx = w / n;
  for (let i = 1; i <= n; i++) { const x = x0 + i * dx; y -= h * 0.035; d += ` L${r1(x)},${r1(y)}`; if (i === 11 || i === 23) { y += h * 0.34; d += ` L${r1(x)},${r1(y)}`; } }
  return d;
}
figure('carry', g => {
  g.line(40, 220, 690, 220, C.line, { sw: 1 }); g.line(40, 30, 40, 220, C.line, { sw: 1 });
  g.path(stairs(40, 190, 640, 300), C.gold, { sw: 2.4 });
  g.t(240, 60, 'up', { c: 'g' }); g.t(460, 200, 'crash', { c: 'r' });
  g.line(300, 186, 280, 140, C.red, { arrow: 1 });
  return [720, 240];
}, g => {
  g.line(20, 200, 350, 200, C.line, { sw: 1 }); g.line(20, 60, 20, 200, C.line, { sw: 1 });
  g.path(stairs(20, 180, 320, 220), C.gold, { sw: 2.2 });
  g.t(180, 22, 'up', { c: 'g', fs: 13 }); g.t(180, 44, 'crash', { c: 'r', fs: 13 });
  return [360, 214];
});

/* ── ch7: the triangle ── */
figure('tri', g => {
  const A = [360, 40], B = [120, 250], Cc = [600, 250];
  g.path(`M${A} L${B} L${Cc} Z`, C.mute, { sw: 1.4 });
  g.circle(...A, 8, C.gold, { a: 0.9 }); g.circle(...B, 8, C.cyan, { a: 0.9 }); g.circle(...Cc, 8, C.violet, { a: 0.9 });
  g.t(360, 18, 'a', { weight: 600, c: 'g' }); g.t(120, 276, 'b', { weight: 600, c: 'c' }); g.t(600, 276, 'c', { weight: 600, c: 'v' });
  g.t(190, 140, 'ab', { a: 'end', fs: 13 }); g.t(530, 140, 'ac', { a: 'start', fs: 13 }); g.t(360, 232, 'bc', { fs: 13 });
  g.circle(360, 175, 6, C.green, { a: 0.9 }); g.t(360, 196, 'mid', { fs: 12, c: 'n' });
  return [720, 290];
}, g => {
  const A = [180, 40], B = [50, 230], Cc = [310, 230];
  g.path(`M${A} L${B} L${Cc} Z`, C.mute, { sw: 1.4 });
  g.circle(...A, 7, C.gold, { a: 0.9 }); g.circle(...B, 7, C.cyan, { a: 0.9 }); g.circle(...Cc, 7, C.violet, { a: 0.9 });
  g.t(180, 18, 'a', { weight: 600, c: 'g', fs: 13 }); g.t(90, 252, 'b', { weight: 600, c: 'c', fs: 13 }); g.t(270, 272, 'c', { weight: 600, c: 'v', fs: 13 });
  g.circle(180, 160, 5, C.green, { a: 0.9 });
  g.t(180, 300, 'ab', { fs: 12 }); g.t(180, 322, 'bc', { fs: 12 }); g.t(180, 344, 'ac', { fs: 12 }); g.t(180, 366, 'mid', { fs: 11, c: 'n' });
  return [360, 380];
});

/* ── ch8: the central bank's balance sheet under a peg ── */
figure('peg', g => {
  g.t(200, 20, 'assets', { weight: 600 }); g.t(520, 20, 'liab', { weight: 600 });
  g.box(60, 40, 280, 110, C.cyan); g.t(200, 95, 'd');
  g.box(60, 150, 280, 80, C.gold); g.t(200, 190, 'r');
  g.box(380, 40, 280, 190, C.green); g.t(520, 125, 'm'); g.t(520, 155, 'fix', { c: 'm', fs: 13 });
  g.line(345, 140, 345, 70, C.cyan, { arrow: 1 }); g.line(355, 160, 355, 220, C.gold, { arrow: 1 });
  return [720, 244];
}, g => {
  g.t(90, 16, 'assets', { weight: 600, fs: 13 }); g.t(270, 16, 'liab', { weight: 600, fs: 13 });
  g.box(10, 32, 160, 120, C.cyan); g.t(90, 92, 'd', { fs: 11 });
  g.box(10, 152, 160, 90, C.gold); g.t(90, 197, 'r', { fs: 11 });
  g.box(190, 32, 160, 210, C.green); g.t(270, 122, 'm', { fs: 11 }); g.t(270, 150, 'fix', { c: 'm', fs: 11 });
  return [360, 254];
});

/* ── ch10: fixing and band ── */
figure('fix', g => {
  [['close', 50], ['basket', 120], ['ccf', 190]].forEach(([k, y]) => { g.box(20, y - 24, 200, 48, C.cyan); g.t(120, y, k); g.line(222, y, 318, 120, C.cyan, { arrow: 1 }); });
  g.box(320, 92, 160, 56, C.gold); g.t(400, 120, 'fix', { weight: 600, fs: 13 });
  g.line(482, 120, 520, 120, C.gold, { arrow: 1 });
  g.box(524, 40, 176, 160, C.violet, { a: 0.08, dash: '5 4' }); g.line(524, 120, 700, 120, C.gold, { sw: 2 });
  g.t(612, 60, { raw: '+2%' }, { c: 'm', mono: 1 }); g.t(612, 180, { raw: '−2%' }, { c: 'm', mono: 1 });
  g.t(612, 228, 'band', { fs: 13 });
  return [720, 248];
}, g => {
  [['close', 30], ['basket', 84], ['ccf', 138]].forEach(([k, y]) => { g.box(10, y - 22, 220, 44, C.cyan); g.t(120, y, k, { fs: 13 }); g.line(232, y, 268, 84, C.cyan); });
  g.line(290, 108, 290, 176, C.gold, { arrow: 1 }); g.circle(280, 84, 4, C.cyan, { a: 0.9 });
  g.box(70, 180, 220, 48, C.gold); g.t(180, 204, 'fix', { weight: 600, fs: 12 });
  g.box(70, 244, 220, 86, C.violet, { a: 0.08, dash: '5 4' }); g.line(70, 287, 290, 287, C.gold, { sw: 2 });
  g.t(180, 262, { raw: '+2%' }, { c: 'm', mono: 1 }); g.t(180, 312, { raw: '−2%' }, { c: 'm', mono: 1 });
  g.t(180, 350, 'band', { fs: 12 });
  return [360, 366];
});

/* ── ch11: the Fed's swap network ── */
figure('swap', g => {
  const cx = 250, cy = 150;
  g.circle(cx, cy, 44, C.gold, { a: 0.25 }); g.t(cx, cy, 'fed', { weight: 600 });
  const std = ['ecb', 'boj', 'boe', 'snb', 'boc'];
  std.forEach((k, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + 120 * Math.cos(a), y = cy + 112 * Math.sin(a); g.line(cx + 44 * Math.cos(a), cy + 44 * Math.sin(a), x - 30 * Math.cos(a), y - 18 * Math.sin(a), C.cyan, { sw: 2 }); g.t(x, y, k, { fs: 13, c: 'c' }); });
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / 9, x = cx + 140 * Math.cos(a) * 1.05, y = cy + 132 * Math.sin(a) * 0.98; g.line(cx + 46 * Math.cos(a), cy + 46 * Math.sin(a), x, y, C.mute, { dash: '4 4', sw: 1 }); g.circle(x, y, 4, C.mute, { a: 0.5 }); }
  g.line(450, 70, 480, 70, C.cyan, { sw: 2 }); g.t(492, 70, 'std', { a: 'start', fs: 13 });
  g.line(450, 110, 480, 110, C.mute, { dash: '4 4', sw: 1 }); g.t(492, 110, 'tmp', { a: 'start', fs: 13 });
  g.box(444, 150, 260, 44, C.violet); g.t(574, 172, 'fima', { fs: 12 });
  return [720, 300];
}, g => {
  const cx = 180, cy = 140;
  g.circle(cx, cy, 38, C.gold, { a: 0.25 }); g.t(cx, cy, 'fed', { weight: 600, fs: 13 });
  ['ecb', 'boj', 'boe', 'snb', 'boc'].forEach((k, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + 112 * Math.cos(a), y = cy + 100 * Math.sin(a); g.line(cx + 38 * Math.cos(a), cy + 38 * Math.sin(a), x - 28 * Math.cos(a), y - 16 * Math.sin(a), C.cyan, { sw: 2 }); g.t(x, y, k, { fs: 12, c: 'c' }); });
  g.line(20, 274, 50, 274, C.cyan, { sw: 2 }); g.t(60, 274, 'std', { a: 'start', fs: 12 });
  g.line(20, 300, 50, 300, C.mute, { dash: '4 4', sw: 1 }); g.t(60, 300, 'tmp', { a: 'start', fs: 12 });
  g.box(10, 320, 340, 40, C.violet); g.t(180, 340, 'fima', { fs: 12 });
  return [360, 370];
});

const HEAD = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [k, v] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${k}.html`), HEAD + v + '\n');
if (require.main === module) console.log('wrote', Object.keys(D).length, 'diagrams');
