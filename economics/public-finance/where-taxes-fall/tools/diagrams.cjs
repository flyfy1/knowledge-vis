#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`. Do not hand-edit the output:
   `build-pages.cjs --check` reruns this script (page.json "generators") and fails on any difference.
   One SVG per diagram, viewBox 360 wide, shown at most 560 px wide; font-size 14 so labels render at 11 px or more at
   320 px. Every worded <text> carries a data-i18n key whose string is in the ::: diagram block of content.<lang>.md.
   Literal text is digits only, from ../models.js (pinned in tests/models.cjs).
   Colours as in the labs: buyers / demand gold, sellers / supply cyan, government green, loss red, shortage violet.
   Drawing helper adapted from economics/trade/who-pays-a-tariff/tools/diagrams.cjs. */
const fs = require('fs');
const path = require('path');
const M = require('../models.js');
const OUT = path.join(__dirname, '..', 'figures');
const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;
const f = (x, d) => M.fmt(x, d);

function drawing(name) {
  const parts = [], used = new Set();
  const mk = col => `ar-${name}-${col.slice(1)}`;
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${tint(col, o.a == null ? 0.14 : o.a)}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#${mk(col)})"` : ''}/>`); },
    poly(pts, col, a) { parts.push(`<polygon points="${pts.map(p => p.map(r1).join(',')).join(' ')}" fill="${tint(col, a == null ? 0.3 : a)}" stroke="none"/>`); },
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}`;
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    }
  };
  g.finish = (W, H) => {
    const defs = used.size ? '<defs>' + [...used].map(col => `<marker id="${mk(col)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`).join('') + '</defs>' : '';
    return `<svg viewBox="0 0 ${W} ${H}" role="img" data-i18n-aria="dg.${name}.aria">${defs}${parts.join('')}</svg>`;
  };
  return g;
}
const D = {};
function figure(name, draw) {
  const g = drawing(name), [W, H] = draw(g);
  D[name] = `<figure class="dia" id="dg-${name}" data-dg="${name}">${g.finish(W, H)}<figcaption data-i18n-html="dg.${name}.cap"></figcaption></figure>`;
}

/* a schematic supply–demand frame: axes from (L,B) to (R,T); demand falls, supply rises, cross at the middle */
function axes(g, L, T, R, B) {
  g.line(L, T, L, B, C.mute, { sw: 1 }); g.line(L, B, R, B, C.mute, { sw: 1 });
  g.t(L + 6, T - 10, 'p', { c: 'm' }); g.t(R, B + 16, 'q', { a: 'end', c: 'm' });
}

/* ── ch1: the wedge ── */
figure('wedge', g => {
  const L = 84, T = 34, R = 350, B = 222;
  axes(g, L, T, R, B);
  const dY = x => T + 10 + (x - L - 10) * (B - T - 30) / (R - L - 30), sY = x => B - 20 - (x - L - 10) * (B - T - 30) / (R - L - 30);
  const xe = (L + 10 + R - 20) / 2, x1 = xe - 40, yb = dY(x1), ys = sY(x1), ye = dY(xe);
  g.box(L, yb, x1 - L, ys - yb, C.gold, { a: 0.22, nostroke: true, rx: 0 });
  g.poly([[x1, yb], [x1, ys], [xe, ye]], C.red, 0.4);
  g.line(L + 10, dY(L + 10), R - 20, dY(R - 20), C.gold, { sw: 2.4 }); g.line(L + 10, sY(L + 10), R - 20, sY(R - 20), C.cyan, { sw: 2.4 });
  g.line(L, ye, xe, ye, C.mute, { dash: '3 3', sw: 1 });
  g.line(x1, yb, x1, B, C.mute, { dash: '3 3', sw: 1 });
  g.t(R - 18, dY(R - 20) - 14, 'd', { a: 'end', c: 'g' }); g.t(R - 18, sY(R - 20) + 14, 's', { a: 'end', c: 'c' });
  g.t(L - 6, yb, 'pb', { a: 'end', c: 'g' }); g.t(L - 6, ys, 'ps', { a: 'end', c: 'c' }); g.t(L - 6, ye, 'p0', { a: 'end', c: 'm' });
  g.t((L + x1) / 2, (yb + ys) / 2, 'rev', { a: 'middle', c: 'n' });
  g.t(xe + 12, ye + 30, 'dwl', { c: 'r' });
  g.line(xe + 10, ye + 22, (x1 + xe) / 2 + 6, ye + 4, C.red, { sw: 1 });
  return [360, 244];
});

/* ── ch2: the legal payer, written two ways ── */
figure('legal', g => {
  const I = M.incidence(0.5, 1.5, 10, 'seller');
  const row = (y0, key, buyerPaysTax) => {
    g.t(180, y0, key, { a: 'middle', weight: 600 });
    const by = y0 + 22;
    g.box(8, by, 96, 40, C.gold); g.t(56, by + 20, 'buyer', { a: 'middle' });
    g.box(256, by, 96, 40, C.cyan); g.t(304, by + 20, 'seller', { a: 'middle' });
    g.box(132, by + 74, 96, 36, C.green); g.t(180, by + 92, 'gov', { a: 'middle', c: 'n' });
    g.line(106, by + 20, 252, by + 20, C.gold, { arrow: true });
    g.t(180, by + 8, { raw: f(buyerPaysTax ? I.ps : I.pb, 1) }, { a: 'middle', c: 'g', mono: true });
    if (buyerPaysTax) { g.line(70, by + 42, 140, by + 72, C.green, { arrow: true }); g.t(84, by + 66, { raw: f(10, 0) }, { a: 'end', c: 'n', mono: true }); }
    else { g.line(290, by + 42, 220, by + 72, C.green, { arrow: true }); g.t(276, by + 66, { raw: f(10, 0) }, { a: 'start', c: 'n', mono: true }); }
  };
  row(14, 'onSeller', false);
  row(166, 'onBuyer', true);
  g.t(180, 316, 'same', { a: 'middle', c: 'm' });
  return [360, 330];
});

/* ── ch3: the square law ── */
figure('square', g => {
  const B = 200, small = [[40, B], [100, B], [40, B - 45]];
  g.poly(small, C.red, 0.45);
  g.t(70, B + 16, 'tt', { a: 'middle', c: 'm' }); g.t(70, 120, 'x1', { a: 'middle', c: 'r' });
  const x0 = 190, w = 120, h = 90;
  g.poly([[x0, B], [x0 + w, B], [x0, B - h]], C.red, 0.45);
  g.line(x0 + w / 2, B, x0 + w / 2, B - h / 2, C.ink, { sw: 1, dash: '3 3' });
  g.line(x0, B - h / 2, x0 + w / 2, B - h / 2, C.ink, { sw: 1, dash: '3 3' });
  g.line(x0 + w / 2, B, x0, B - h, C.ink, { sw: 0 });
  g.line(x0, B, x0 + w / 2, B - h / 2, C.ink, { sw: 1, dash: '3 3' });
  g.t(x0 + w / 2, B + 16, 't2', { a: 'middle', c: 'm' }); g.t(x0 + w / 2, 70, 'x4', { a: 'middle', c: 'r' });
  g.t(180, 24, 'head', { a: 'middle' });
  return [360, 226];
});

/* ── ch5: marginal staircase and the average rate (first four brackets of the annual table) ── */
figure('bracket', g => {
  const L = 44, R = 344, T = 40, B = 200, xMax = 420000, yMax = 0.3;
  const X = x => L + (R - L) * x / xMax, Y = y => B - (B - T) * y / yMax;
  g.line(L, T, L, B, C.mute, { sw: 1 }); g.line(L, B, R, B, C.mute, { sw: 1 });
  let lo = 0;
  for (const [hi, r] of M.IIT_YEAR.slice(0, 4)) {
    g.box(X(lo), Y(r), X(hi) - X(lo), B - Y(r), C.cyan, { a: 0.2, rx: 0, sw: 1 });
    g.t((X(lo) + X(Math.min(hi, xMax))) / 2, Y(r) - 10, { raw: f(r * 100, 0) + '%' }, { a: 'middle', c: 'c', mono: true, fs: 13 });
    lo = hi;
  }
  const pts = []; for (let i = 1; i <= 60; i++) { const x = xMax * i / 60; pts.push([X(x), Y(M.bracketTax(M.IIT_YEAR, x) / x)]); }
  for (let i = 1; i < pts.length; i++) g.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], C.gold, { sw: 2.2 });
  g.t(L + 4, T - 22, 'marg', { c: 'c' }); g.t(R, T - 22, 'avg', { a: 'end', c: 'g' });
  g.t(X(144000), B + 16, 'k144', { a: 'middle', c: 'm' }); g.t(X(300000), B + 16, 'k300', { a: 'middle', c: 'm' });
  g.t(R, B + 36, 'x', { a: 'end', c: 'm' });
  return [360, 246];
});

/* ── ch6: the VAT chain ── */
figure('vat', g => {
  const V = M.vat('vat', 0.13), names = ['farm', 'mill', 'bake'], va = M.VAT.va;
  let sales = 0;
  names.forEach((k, i) => {
    const y = 16 + i * 82; sales += va[i];
    g.box(10, y, 150, 56, C.cyan); g.t(85, y + 18, k, { a: 'middle' });
    g.t(85, y + 40, { raw: f(sales, 0) + ' + ' + f(V.stage[i].tax, 1) }, { a: 'middle', c: 'm', mono: true, fs: 13 });
    g.box(214, y + 8, 136, 40, C.green); g.t(282, y + 28, { raw: f(V.stage[i].collected, 1) }, { a: 'middle', c: 'n', mono: true });
    g.line(162, y + 28, 210, y + 28, C.green, { arrow: true });
    if (i < 2) g.line(85, y + 58, 85, y + 78, C.mute, { arrow: true });
  });
  g.t(85, 268, 'sales', { a: 'middle', c: 'm' }); g.t(282, 268, 'pays', { a: 'middle', c: 'n' });
  g.t(180, 296, 'sum', { a: 'middle', c: 'g' });
  return [360, 312];
});

/* ── ch8: a ceiling below the market price ── */
figure('cap', g => {
  const L = 84, T = 34, R = 350, B = 222;
  axes(g, L, T, R, B);
  const dY = x => T + 10 + (x - L - 10) * (B - T - 30) / (R - L - 30), sY = x => B - 20 - (x - L - 10) * (B - T - 30) / (R - L - 30);
  const xe = (L + 10 + R - 20) / 2, ye = dY(xe), yc = ye + 34;
  const xs = L + 10 + (B - 20 - yc) * (R - L - 30) / (B - T - 30), xd = L + 10 + (yc - T - 10) * (R - L - 30) / (B - T - 30);
  g.line(L + 10, dY(L + 10), R - 20, dY(R - 20), C.gold, { sw: 2.4 }); g.line(L + 10, sY(L + 10), R - 20, sY(R - 20), C.cyan, { sw: 2.4 });
  g.line(L, ye, xe, ye, C.mute, { dash: '3 3', sw: 1 });
  g.line(L, yc, R - 10, yc, C.red, { sw: 2 });
  g.box(xs, yc - 6, xd - xs, 12, C.violet, { a: 0.5, nostroke: true, rx: 2 });
  g.t((xs + xd) / 2, yc + 20, 'short', { a: 'middle', c: 'v' });
  const ysh = dY(xs);
  g.line(L, ysh, xs, ysh, C.violet, { dash: '4 3', sw: 1.2 }); g.line(xs, ysh, xs, B, C.violet, { dash: '4 3', sw: 1 });
  g.t(L - 6, yc, 'cap', { a: 'end', c: 'r' }); g.t(L - 6, ye, 'p0', { a: 'end', c: 'm' }); g.t(L - 6, ysh, 'shadow', { a: 'end', c: 'v' });
  g.t(R - 18, dY(R - 20) - 14, 'd', { a: 'end', c: 'g' }); g.t(R - 18, sY(R - 20) + 14, 's', { a: 'end', c: 'c' });
  return [360, 244];
});

/* ── ch10: a fixed supply of land ── */
figure('land', g => {
  const L = 84, T = 34, R = 350, B = 222, xq = 216;
  axes(g, L, T, R, B);
  g.line(xq, T + 4, xq, B, C.cyan, { sw: 2.6 });
  const d1 = x => T + 20 + (x - L - 10) * 0.55, d2 = x => d1(x) + 56;
  g.line(L + 10, d1(L + 10), R - 20, d1(R - 20), C.gold, { sw: 2.4 });
  g.line(L + 10, d2(L + 10), R - 20, d2(R - 20), C.gold, { sw: 1.6, dash: '5 4' });
  g.line(L, d1(xq), xq, d1(xq), C.mute, { dash: '3 3', sw: 1 }); g.line(L, d2(xq), xq, d2(xq), C.mute, { dash: '3 3', sw: 1 });
  g.box(L, d1(xq), xq - L, d2(xq) - d1(xq), C.green, { a: 0.22, nostroke: true, rx: 0 });
  g.t(L - 6, d1(xq), 'pb', { a: 'end', c: 'g' }); g.t(L - 6, d2(xq), 'ps', { a: 'end', c: 'c' });
  g.t((L + xq) / 2, (d1(xq) + d2(xq)) / 2, 'rev', { a: 'middle', c: 'n' });
  g.t(xq + 8, T + 10, 's', { c: 'c' });
  g.t(R - 18, d1(R - 20) - 14, 'd', { a: 'end', c: 'g' });
  g.t(xq + 10, B - 14, 'nodwl', { c: 'm' });
  return [360, 244];
});

fs.mkdirSync(OUT, { recursive: true });
const HEAD = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEAD + html + '\n');
console.log('wrote ' + Object.keys(D).map(n => 'dg-' + n).join(', '));
