#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: this script overwrites them.
   Each diagram is a <figure class="dia"> holding two inline SVGs: a wide one (class "w", viewBox 720 wide) shown above
   640 px and a narrow one (class "n", viewBox 360 wide) shown at or below 640 px, so labels render at 11 px or more on
   every screen. Every <text> carries a data-i18n key whose string lives in the ::: diagram block of content.<lang>.md;
   the only literal text is language-neutral (bit indices, digits). Numbers drawn from the models come in through
   bindings.cjs ({=dg.*} in the block). Colours: sign red, exponent cyan, significand gold, the same on every diagram. */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'figures');

const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254', card: '#1a1f2b' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const FS = 14;

function drawing(name, v) {
  const parts = [], used = new Set();
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.solid ? col : tint(col, o.a == null ? 0.14 : o.a)}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    path(d, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.solid ? col : tint(col, 0.16)}" stroke="${col}" stroke-width="${o.sw || 1.3}"/>`); },
    // text: key → data-i18n="dg.<name>.<key>"; {raw:'31'} → literal language-neutral text
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${x}" y="${y}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}`;
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

/* ── ch1: the 32 bits of binary32, filled with 0.1 ── */
figure('f32', g => {
  const X = 20, W = 680, cw = W / 32, y = 70, h = 40;
  const xs = X, xe = X + cw, xm = X + 9 * cw, xr = X + W;
  g.t(xs + cw / 2, 24, 'ls', { a: 'middle', c: 'r' });
  g.t((xe + xm) / 2, 24, 'le', { a: 'middle', c: 'c' });
  g.t((xm + xr) / 2, 24, 'lm', { a: 'middle', c: 'g' });
  [[xs + 2, '31'], [xe + 2, '30'], [xm - 2, '23', 'end'], [xm + 2, '22'], [xr - 2, '0', 'end']].forEach(([x, s, a]) => g.t(x, 52, { raw: s }, { a: a || 'start', c: 'm', fs: 14 }));
  g.box(xs, y, cw, h, C.red, { rx: 3 }); g.box(xe, y, xm - xe, h, C.cyan, { rx: 3 }); g.box(xm, y, xr - xm, h, C.gold, { rx: 3 });
  for (let i = 1; i < 32; i++) if (i !== 1 && i !== 9) g.line(X + i * cw, y + 4, X + i * cw, y + h - 4, C.line, { sw: 1 });
  g.t(xs + cw / 2, y + h / 2, 'bs', { a: 'middle', mono: true, fs: 15 });
  g.t((xe + xm) / 2, y + h / 2, 'be', { a: 'middle', mono: true, fs: 15 });
  g.t((xm + xr) / 2, y + h / 2, 'bm', { a: 'middle', mono: true, fs: 15 });
  // values under each field
  const yv = 140;
  g.line(xs + cw / 2, y + h + 4, xs + cw / 2, yv - 12, C.red, { arrow: true });
  g.line((xe + xm) / 2, y + h + 4, (xe + xm) / 2, yv - 12, C.cyan, { arrow: true });
  g.line((xm + xr) / 2, y + h + 4, (xm + xr) / 2, yv - 12, C.gold, { arrow: true });
  g.t(xs, yv, 'vs', { c: 'r' });
  g.t((xe + xm) / 2, yv, 've', { a: 'middle', c: 'c', mono: true });
  g.t((xm + xr) / 2, yv, 'vm', { a: 'middle', c: 'g', mono: true });
  g.t((xm + xr) / 2, yv + 24, 'hid', { a: 'middle', c: 'm', fs: 14 });
  g.line(X, 192, X + W, 192, C.line, { sw: 1 });
  g.t(X + W / 2, 214, 'eq', { a: 'middle', mono: true });
  return [720, 236];
}, g => {
  const X = 20, W = 320;
  // row 1: sign + exponent (9 bits), row 2: significand (23 bits)
  const cw = 34, y1 = 46, h = 38;
  g.t(X + cw / 2, 20, 'ls', { a: 'middle', c: 'r' });
  g.t(X + cw + 8 + 75, 20, 'le', { a: 'middle', c: 'c' });
  g.box(X, y1, cw, h, C.red, { rx: 3 }); g.box(X + cw + 8, y1, 150, h, C.cyan, { rx: 3 });
  g.t(X + cw / 2, y1 + h / 2, 'bs', { a: 'middle', mono: true, fs: 15 });
  g.t(X + cw + 8 + 75, y1 + h / 2, 'be', { a: 'middle', mono: true, fs: 15 });
  g.t(X + cw + 8 + 150 + 10, y1 + h / 2, 've', { c: 'c', mono: true, fs: 14 });
  g.t(X, y1 + h + 20, 'vs', { c: 'r', fs: 14 });
  const y2 = 150;
  g.t(X + W / 2, y2 - 22, 'lm', { a: 'middle', c: 'g' });
  g.box(X, y2, W, h, C.gold, { rx: 3 });
  g.t(X + W / 2, y2 + h / 2, 'bm', { a: 'middle', mono: true, fs: 14 });
  g.t(X + W / 2, y2 + h + 18, 'vm', { a: 'middle', c: 'g', mono: true, fs: 14 });
  g.t(X + W / 2, y2 + h + 40, 'hid', { a: 'middle', c: 'm', fs: 14 });
  g.line(X, y2 + h + 60, X + W, y2 + h + 60, C.line, { sw: 1 });
  g.t(X + W / 2, y2 + h + 80, 'eq1', { a: 'middle', mono: true, fs: 14 });
  g.t(X + W / 2, y2 + h + 102, 'eq2', { a: 'middle', mono: true, fs: 14 });
  return [360, 306];
});

require('./diagrams-more.cjs')(figure, C);

fs.mkdirSync(OUT, { recursive: true });
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), html + '\n');
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
