#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)). Closeout 2026-11-25.
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: page.json "generators" makes `build-pages.cjs --check` rerun this script and
   fail on any difference.
   The drawing helper follows investment/derivatives/a-fair-price-for-a-bet/tools/diagrams.cjs: each <figure class="dia">
   holds a wide SVG (class "w", 720 units, shown above 640 px) and a narrow one (class "n", 360 units, shown at or below
   640 px), so labels stay at 11 px or more on a 320 px screen (font-size 14 or more in both). Every worded <text> has a
   data-i18n key whose string lives in the ::: diagram block of content.<lang>.md. Literal text is language-neutral
   only: numbers computed here from ../models.js (pinned in tests/models.cjs) and the symbols α, β, δ, φ, A, B, M.
   Colours, as in the labs: buyers and users cyan, the seller or platform gold, money green, loss or blocked red,
   the other side / rival violet. */
const fs = require('fs');
const path = require('path');
const M = require('../models.js');
const OUT = path.join(__dirname, '..', 'figures');

const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', card: '#1a1f2b' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const FS = 14;
const r1 = x => Math.round(x * 10) / 10;

function drawing(name, v) {
  const parts = [], used = new Set();
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.solid ? col : tint(col, o.a == null ? 0.14 : o.a)}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    path(d, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.5}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${o.solid ? col : tint(col, o.a == null ? 0.16 : o.a)}" stroke="${col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
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

/* ── ch2: where the cost sits — a bakery against a chip design (schematic) ── */
function costPanel(g, x, y, w, k, fixH, margH) {
  g.t(x + w / 2, y + 12, k + 't', { a: 'middle', weight: 600 });
  const base = y + 196, bw = 56, bx = x + 16;
  g.box(bx, base - fixH, bw, fixH, C.gold);
  g.box(bx + bw + 14, base - margH, bw, Math.max(margH, 2), C.cyan);
  g.line(x + 8, base, x + w - 8, base, C.line, { sw: 1 });
  const lx = bx + 2 * bw + 30;
  g.t(lx, y + 64, k + 'f1', { c: 'g' }); g.t(lx, y + 86, k + 'f2', { c: 'm' });
  g.t(lx, y + 134, k + 'm1', { c: 'c' }); g.t(lx, y + 156, k + 'm2', { c: 'm' });
  g.t(x + w / 2, base + 22, k + 'mes', { a: 'middle' });
}
figure('cost', g => {
  costPanel(g, 10, 6, 340, 'a', 60, 46);
  costPanel(g, 370, 6, 340, 'b', 170, 4);
  return [720, 240];
}, g => {
  costPanel(g, 6, 6, 348, 'a', 60, 46);
  costPanel(g, 6, 250, 348, 'b', 170, 4);
  return [360, 484];
});

/* ── ch5: links grow faster than people: n people, n(n−1)/2 pairs ── */
function cluster(g, cx, cy, n, R) {
  const P = Array.from({ length: n }, (_, i) => [cx + R * Math.cos(-Math.PI / 2 + 2 * Math.PI * i / n), cy + R * Math.sin(-Math.PI / 2 + 2 * Math.PI * i / n)]);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) g.line(P[i][0], P[i][1], P[j][0], P[j][1], C.gold, { sw: 1 });
  for (const [x, y] of P) g.circle(x, y, 7, C.cyan, { a: 0.9, solid: false });
}
const NS = [2, 3, 5, 8];
figure('links', g => {
  NS.forEach((n, i) => {
    const cx = 90 + i * 180;
    cluster(g, cx, 86, n, 52);
    g.t(cx, 170, { raw: String(n) }, { a: 'middle', c: 'c', mono: true, fs: 18 });
    g.t(cx, 196, { raw: String(n * (n - 1) / 2) }, { a: 'middle', c: 'g', mono: true, fs: 18 });
  });
  g.t(12, 170, 'people', { c: 'c' }); g.t(12, 196, 'pairs', { c: 'g' });
  return [720, 214];
}, g => {
  NS.forEach((n, i) => {
    const cx = 92 + (i % 2) * 176, cy = 64 + Math.floor(i / 2) * 178;
    cluster(g, cx, cy, n, 44);
    g.t(cx, cy + 66, { raw: String(n) }, { a: 'middle', c: 'c', mono: true, fs: 16 });
    g.t(cx, cy + 88, { raw: String(n * (n - 1) / 2) }, { a: 'middle', c: 'g', mono: true, fs: 16 });
  });
  g.t(180, 374, 'people', { a: 'middle', c: 'c' }); g.t(180, 398, 'pairs', { a: 'middle', c: 'g' });
  return [360, 414];
});

/* ── ch7: a two-sided platform (prices from the ch7 model at its defaults) ── */
const PF = M.platform.monopoly(0.1, 0.8);
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);
figure('platform', g => {
  g.box(20, 70, 190, 70, C.cyan); g.t(115, 94, 's1', { a: 'middle', weight: 600 }); g.t(115, 118, 's1e', { a: 'middle', c: 'm' });
  g.box(265, 70, 190, 70, C.gold); g.t(360, 105, 'pf', { a: 'middle', weight: 600 });
  g.box(510, 70, 190, 70, C.violet); g.t(605, 94, 's2', { a: 'middle', weight: 600 }); g.t(605, 118, 's2e', { a: 'middle', c: 'm' });
  g.line(213, 120, 262, 120, C.green, { arrow: true }); g.line(507, 120, 458, 120, C.green, { arrow: true }); // money flows into the platform
  g.t(237, 158, { raw: 'p₁ = ' + f2(PF.p1) }, { a: 'middle', c: 'n', mono: true });
  g.t(482, 158, { raw: 'p₂ = ' + f2(PF.p2) }, { a: 'middle', c: 'n', mono: true });
  g.t(237, 182, 'p1', { a: 'middle', c: 'm' }); g.t(482, 182, 'p2', { a: 'middle', c: 'm' });
  g.path('M115,66 C115,18 605,18 605,66', C.violet, { arrow: true, sw: 2.2 });
  g.t(360, 12, 'a2', { a: 'middle', c: 'v' });
  g.t(360, 214, 'a1', { a: 'middle', c: 'c' });
  return [720, 230];
}, g => {
  const row = (y, col, k, e) => { g.box(40, y, 280, 56, col); g.t(180, y + (e ? 18 : 28), k, { a: 'middle', weight: 600 }); if (e) g.t(180, y + 40, e, { a: 'middle', c: 'm' }); };
  row(10, C.cyan, 's1', 's1e');
  g.line(180, 70, 180, 156, C.green, { arrow: true }); // money flows into the platform
  g.t(194, 100, { raw: 'p₁ = ' + f2(PF.p1) }, { c: 'n', mono: true }); g.t(194, 124, 'p1', { c: 'm' });
  row(160, C.gold, 'pf');
  g.line(180, 306, 180, 220, C.green, { arrow: true });
  g.t(194, 250, { raw: 'p₂ = ' + f2(PF.p2) }, { c: 'n', mono: true }); g.t(194, 274, 'p2', { c: 'm' });
  row(310, C.violet, 's2', 's2e');
  g.path('M36,38 C2,38 2,338 36,338', C.violet, { arrow: true, sw: 2.2 });
  g.t(180, 392, 'a2', { a: 'middle', c: 'v' });
  g.t(180, 416, 'a1', { a: 'middle', c: 'c' });
  return [360, 432];
});

/* ── ch8: the data loop, with its two brakes ── */
function loop(g, P, bw) {
  const keys = ['users', 'data', 'quality'], cols = [C.cyan, C.gold, C.green];
  P.forEach(([x, y], i) => { g.box(x - bw / 2, y - 22, bw, 44, cols[i]); g.t(x, y, keys[i], { a: 'middle', weight: 600 }); });
  return keys;
}
figure('loop', g => {
  const P = [[150, 70], [570, 70], [360, 210]];
  loop(g, P, 200);
  g.line(254, 70, 466, 70, C.mute, { arrow: true }); g.t(360, 54, 'e1', { a: 'middle', c: 'm' });
  g.line(540, 96, 440, 186, C.mute, { arrow: true }); g.t(520, 160, 'e2', { c: 'm' });
  g.line(280, 186, 180, 96, C.mute, { arrow: true }); g.t(160, 150, 'e3', { a: 'end', c: 'm' });
  g.line(600, 46, 600, 16, C.red, { arrow: true, dash: '4 3' }); g.t(590, 18, 'stale', { a: 'end', c: 'r' });
  g.t(360, 258, 'beta', { a: 'middle', c: 'r' });
  return [720, 276];
}, g => {
  const P = [[180, 30], [180, 140], [180, 250]];
  loop(g, P, 220);
  g.line(180, 54, 180, 114, C.mute, { arrow: true }); g.t(196, 84, 'e1', { c: 'm' });
  g.line(180, 164, 180, 224, C.mute, { arrow: true }); g.t(196, 194, 'e2', { c: 'm' });
  g.path('M70,250 C14,250 14,30 66,30', C.mute, { arrow: true });
  g.t(180, 298, 'e3n', { a: 'middle', c: 'm' });
  g.t(180, 322, 'stale', { a: 'middle', c: 'r' });
  g.t(180, 346, 'beta', { a: 'middle', c: 'r' });
  return [360, 362];
});

/* ── ch9: open against tied ── */
function tiePanel(g, x, y, w, tied) {
  g.t(x + w / 2, y + 12, tied ? 'tied' : 'open', { a: 'middle', weight: 600 });
  const bw = Math.min(140, (w - 40) / 2);
  g.box(x + 10, y + 34, bw, 40, C.gold); g.t(x + 10 + bw / 2, y + 54, { raw: 'M · A' }, { a: 'middle', mono: true });
  g.box(x + 10, y + 100, bw, 40, C.gold); g.t(x + 10 + bw / 2, y + 120, { raw: 'M · B' }, { a: 'middle', mono: true });
  g.box(x + w - 10 - bw, y + 100, bw, 40, C.violet); g.t(x + w - 10 - bw / 2, y + 120, 'rival', { a: 'middle' });
  g.box(x + 10, y + 176, w - 20, 40, C.cyan); g.t(x + w / 2, y + 196, 'users', { a: 'middle' });
  const ux = x + 10 + bw / 2, rx = x + w - 10 - bw / 2;
  g.line(ux, y + 174, ux, y + 144, C.mute, { arrow: true });
  if (tied) {
    g.line(ux, y + 76, ux, y + 98, C.gold, { sw: 4 });
    g.line(rx, y + 174, rx, y + 144, C.red, { dash: '4 3' });
    g.t(rx, y + 158, { raw: '×' }, { a: 'middle', c: 'r', fs: 22 });
    g.t(x + w / 2, y + 236, 'tiednote', { a: 'middle', c: 'r' });
  } else {
    g.line(rx, y + 174, rx, y + 144, C.mute, { arrow: true });
    g.t(x + w / 2, y + 236, 'opennote', { a: 'middle', c: 'm' });
  }
}
figure('tie', g => { tiePanel(g, 10, 4, 340, false); tiePanel(g, 370, 4, 340, true); return [720, 256]; },
  g => { tiePanel(g, 6, 4, 348, false); tiePanel(g, 6, 266, 348, true); return [360, 520]; });

/* ── ch10: three ways out of lock-in ── */
function interPanel(g, x, y, w, k) {
  g.t(x + w / 2, y + 12, k, { a: 'middle', weight: 600 });
  const L = [[x + w * 0.22, y + 60], [x + w * 0.12, y + 110], [x + w * 0.32, y + 112]], R = [[x + w * 0.78, y + 60], [x + w * 0.68, y + 112], [x + w * 0.88, y + 110]];
  const tri = (P, col) => { for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) g.line(P[i][0], P[i][1], P[j][0], P[j][1], col, { sw: 1 }); P.forEach(([px, py]) => g.circle(px, py, 8, col)); };
  tri(L, C.cyan); tri(R, C.violet);
  if (k === 'phi') g.line(L[2][0] + 10, L[2][1], R[1][0] - 10, R[1][1], C.gold, { dash: '5 4', sw: 1.6 });
  if (k === 'h') { const mx = x + w / 2, my = y + 86; g.circle(mx, my, 9, C.gold, { a: 0.5 }); g.line(mx - 9, my, L[2][0] + 8, L[2][1], C.gold, { sw: 1 }); g.line(mx + 9, my, R[1][0] - 8, R[1][1], C.gold, { sw: 1 }); }
  g.t(x + w / 2, y + 146, k + 'n', { a: 'middle', c: k === 'none' ? 'r' : 'g' });
}
figure('interop', g => { ['none', 'phi', 'h'].forEach((k, i) => interPanel(g, 6 + i * 238, 4, 230, k)); return [720, 166]; },
  g => { ['none', 'phi', 'h'].forEach((k, i) => interPanel(g, 6, 4 + i * 168, 348, k)); return [360, 506]; });

/* ── ch11: the same costs, booked differently (numbers from the ch11 model) ── */
const MU = M.markups.mu, VC = 1 / MU, C0 = M.markups.cogs0, C1 = 0.65;
const COGS = [VC * C0, VC * C1], SGA = [VC * (1 - C0), VC * (1 - C1)], EST = [MU, MU * C0 / C1];
const pct = x => Math.round(x * 100) + '%';
function stackBar(g, x, y, w, i) {
  const H = 200, segs = [[COGS[i], C.cyan, 'cogs'], [SGA[i], C.violet, 'sga'], [1 - VC, C.gold, 'margin']];
  g.t(x + w / 2, y + 10, i ? 'y1' : 'y0', { a: 'middle', weight: 600 });
  let top = y + 28;
  for (const [v, col] of segs) { const h = v * H; g.box(x, top, 70, h, col, { rx: 2 }); g.t(x + 35, top + h / 2, { raw: pct(v) }, { a: 'middle', mono: true }); top += h; }
  let t2 = y + 28;
  for (const [v, col, k] of segs) { const h = v * H; g.t(x + 80, t2 + h / 2, k, { c: col === C.cyan ? 'c' : col === C.violet ? 'v' : 'g' }); t2 += h; }
  g.t(x + w / 2, y + 250, 'est', { a: 'middle', c: 'm' });
  g.t(x + w / 2, y + 274, { raw: (Math.round(EST[i] * 100) / 100).toFixed(2) }, { a: 'middle', mono: true, c: i ? 'r' : 'g', fs: 18 });
}
function stackBarN(g, x, y, w, i) {
  const H = 200, bx = x + (w - 80) / 2, segs = [[COGS[i], C.cyan], [SGA[i], C.violet], [1 - VC, C.gold]];
  g.t(x + w / 2, y + 10, i ? 'y1' : 'y0', { a: 'middle', weight: 600 });
  let top = y + 28;
  for (const [v, col] of segs) { const h = v * H; g.box(bx, top, 80, h, col, { rx: 2 }); g.t(bx + 40, top + h / 2, { raw: pct(v) }, { a: 'middle', mono: true }); top += h; }
  g.t(x + w / 2, y + 250, { raw: (Math.round(EST[i] * 100) / 100).toFixed(2) }, { a: 'middle', mono: true, c: i ? 'r' : 'g', fs: 18 });
}
figure('cogs', g => { stackBar(g, 60, 4, 260, 0); stackBar(g, 400, 4, 260, 1); g.t(360, 306, 'truth', { a: 'middle', c: 'm' }); return [720, 320]; },
  g => {
    stackBarN(g, 6, 4, 170, 0); stackBarN(g, 184, 4, 170, 1);
    g.t(180, 284, 'est', { a: 'middle', c: 'm' });
    [['cogs', C.cyan, 'c'], ['sga', C.violet, 'v'], ['margin', C.gold, 'g']].forEach(([k, col, c], j) => { const yy = 314 + j * 24; g.box(40, yy - 7, 14, 14, col, { rx: 2 }); g.t(62, yy, k, { c }); });
    g.t(180, 394, 'truth', { a: 'middle', c: 'm' });
    return [360, 410];
  });

/* ── ch12: the AI stack and where the money goes (schematic) ── */
const LAYERS = [['u', C.cyan], ['app', C.violet], ['model', C.gold], ['cloud', C.green], ['chip', C.red]];
figure('stack', g => {
  LAYERS.forEach(([k, col], i) => {
    const y = 8 + i * 74;
    g.box(20, y, 250, 46, col); g.t(145, y + 23, k, { a: 'middle', weight: 600 });
    if (i < LAYERS.length - 1) { g.line(145, y + 48, 145, y + 72, C.green, { arrow: true }); g.t(166, y + 60, k + 'pay', { c: 'n' }); }
    g.t(300, y + 23, k + 'how', { c: 'm' });
  });
  return [720, 374];
}, g => {
  LAYERS.forEach(([k, col], i) => {
    const y = 8 + i * 100;
    g.box(20, y, 320, 50, col); g.t(180, y + 16, k, { a: 'middle', weight: 600 }); g.t(180, y + 36, k + 'how', { a: 'middle', c: 'm' });
    if (i < LAYERS.length - 1) { g.line(40, y + 52, 40, y + 96, C.green, { arrow: true }); g.t(54, y + 75, k + 'pay', { c: 'n' }); }
  });
  return [360, 466];
});

const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
if (require.main === module) console.log('wrote ' + Object.keys(D).map(n => `figures/dg-${n}.html`).join(', '));
module.exports = { COGS, SGA, EST, PF };
