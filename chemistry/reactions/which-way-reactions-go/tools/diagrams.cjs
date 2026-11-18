#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: this script overwrites them, and `build-pages.cjs --check` reruns it
   (page.json "generators") and fails on any difference.
   Each diagram is a <figure class="dia"> holding two inline SVGs: a wide one (class "w", viewBox 720 wide) shown above
   640 px and a narrow one (class "n", viewBox 360 wide) shown at or below 640 px, so labels render at 11 px or more on
   every screen. Every <text> carries a data-i18n key whose string lives in the ::: diagram block of content.<lang>.md;
   literal text is language-neutral (digits, chemical formulas, symbols). Bars drawn to scale take their lengths from
   models.js here, and the numbers printed next to them come from bindings.cjs ({=dg.*} in the block).
   Colours: gold = the system / what the reader owns, cyan = surroundings / bath / products, red = cost or barrier,
   green = what goes by itself, violet = catalyst or third series. */
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
    path(d, col = C.mute, o = {}) { if (o.arrow) used.add(col); parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}/>`); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${o.solid ? col : tint(col, 0.16)}" stroke="${col}" stroke-width="${o.sw || 1.3}"/>`); },
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
// draw(g, wide) returns [W, H]; called once for each variant
function figure(name, draw) {
  const gw = drawing(name, 'w'), gn = drawing(name, 'n');
  const [W1, H1] = draw(gw, true), [W2, H2] = draw(gn, false);
  D[name] = `<figure class="dia" id="dg-${name}" data-dg="${name}">${gw.finish(W1, H1)}${gn.finish(W2, H2)}<figcaption data-i18n-html="dg.${name}.cap"></figcaption></figure>`;
}

/* ── ch1: the system inside its surroundings; heat crosses the boundary ── */
figure('ledger', (g, wide) => {
  const W = wide ? 720 : 360, H = wide ? 236 : 300;
  g.box(10, 10, W - 20, H - 60, C.cyan, { a: 0.07 });
  g.t(24, 30, 'surr', { c: 'c' });
  if (wide) {
    g.box(270, 62, 180, 90, C.gold); g.t(360, 92, 'sys', { a: 'middle', c: 'g' }); g.t(360, 122, 'sysS', { a: 'middle', mono: true });
    g.line(120, 107, 262, 107, C.red, { arrow: true, sw: 2 }); g.t(60, 86, 'heat', { c: 'r' });
    g.t(476, 92, 'surrS', { c: 'c', mono: true }); g.t(476, 122, 'surrWhy', { c: 'm' });
  } else {
    g.box(90, 118, 180, 78, C.gold); g.t(180, 144, 'sys', { a: 'middle', c: 'g' }); g.t(180, 172, 'sysS', { a: 'middle', mono: true });
    g.line(180, 70, 180, 110, C.red, { arrow: true, sw: 2 }); g.t(180, 56, 'heat', { a: 'middle', c: 'r' });
    g.t(180, 216, 'surrS', { a: 'middle', c: 'c', mono: true });
  }
  g.t(W / 2, H - 24, 'total', { a: 'middle', mono: true, fs: wide ? 15 : 14 });
  return [W, H];
});

/* ── ch2: four particles, two halves: 16 arrangements in five groups, bars to scale ── */
figure('count', (g, wide) => {
  const W = wide ? 720 : 360, H = 250, cw = (W - 20) / 5, bw = wide ? 84 : 52, unit = 15;
  g.t(W / 2, 18, 'top', { a: 'middle', c: 'm' });
  for (let k = 0; k <= 4; k++) {
    const cx = 10 + cw * (k + 0.5), w = M.binom(4, k), x = cx - bw / 2;
    // the box with k particles on the left and 4 − k on the right
    g.box(x, 36, bw, 30, C.mute, { a: 0.05, rx: 3 }); g.line(cx, 36, cx, 66, C.mute, { sw: 1, dash: '3 3' });
    const r = wide ? 4.5 : 3.5, gap = wide ? 9 : 5.5;
    for (let i = 0; i < k; i++) g.circle(x + (wide ? 8 : 5) + (i % 2) * gap * 1.6, 44 + Math.floor(i / 2) * 13, r, C.gold, { solid: true });
    for (let i = 0; i < 4 - k; i++) g.circle(cx + (wide ? 8 : 5) + (i % 2) * gap * 1.6, 44 + Math.floor(i / 2) * 13, r, C.gold, { solid: true });
    g.t(cx, 84, { raw: k + ' : ' + (4 - k) }, { a: 'middle', c: 'm', mono: true });
    const y0 = 206, h = w * unit;
    g.box(x, y0 - h, bw, h, k === 2 ? C.gold : C.cyan, { a: k === 2 ? 0.3 : 0.18, rx: 3 });
    g.t(cx, y0 - h - 12, { raw: String(w) }, { a: 'middle', c: k === 2 ? 'g' : 'c', mono: true, fs: 15 });
  }
  g.line(10, 206, W - 10, 206, C.line, { sw: 1 });
  g.t(W / 2, 228, 'bottom', { a: 'middle' });
  return [W, H];
});

/* ── ch3: a small system takes ε from a large bath ── */
figure('bath', (g, wide) => {
  const W = wide ? 720 : 360, H = wide ? 220 : 330;
  const sx = wide ? 30 : 60, sy = 40, sw = wide ? 200 : 240, bx = wide ? 400 : 30, by = wide ? 20 : 190, bw = wide ? 300 : 300, bh = wide ? 150 : 96;
  g.t(sx + sw / 2, 18, 'sys', { a: 'middle', c: 'g' });
  // three levels of the small system
  ['2ε', 'ε', '0'].forEach((s, i) => { const y = sy + 14 + i * 36; g.line(sx + 34, y, sx + sw - 10, y, C.gold, { sw: 2 }); g.t(sx + 24, y, { raw: s }, { a: 'end', c: 'm', mono: true }); });
  g.circle(sx + sw / 2 + 12, sy + 50 - 9, 7, C.gold, { solid: true });
  g.line(sx + sw / 2 - 20, sy + 80, sx + sw / 2 - 20, sy + 56, C.red, { arrow: true, sw: 2 });
  g.box(bx, by, bw, bh, C.cyan, { a: 0.08 });
  g.t(bx + bw / 2, by + 20, 'bath', { a: 'middle', c: 'c' });
  // dots standing for the bath's quanta
  for (let i = 0; i < (wide ? 33 : 24); i++) { const cols = wide ? 11 : 12; g.circle(bx + 26 + (i % cols) * (bw - 52) / (cols - 1), by + 46 + Math.floor(i / cols) * (wide ? 22 : 18), 3.5, C.cyan, { solid: true }); }
  g.t(bx + bw / 2, by + bh - 16, 'less', { a: 'middle', c: 'm' });
  if (wide) { g.line(bx - 8, 95, sx + sw + 12, 95, C.red, { arrow: true, sw: 2 }); g.t((bx + sx + sw) / 2, 76, 'take', { a: 'middle', c: 'r' }); }
  else { g.line(180, by - 8, 180, 160, C.red, { arrow: true, sw: 2 }); g.t(194, 174, 'take', { c: 'r' }); }
  g.t(W / 2, H - 20, 'factor', { a: 'middle', mono: true, fs: wide ? 15 : 14 });
  return [W, H];
});

/* ── ch4: the four sign combinations ── */
figure('quad', (g, wide) => {
  const W = wide ? 720 : 360, H = wide ? 250 : 300, L = wide ? 60 : 10, T = 34, cw = (W - L - 10) / 2, ch = (H - T - 14) / 2;
  const cells = [['cold', C.cyan, 'N₂ + 3H₂ → 2NH₃'], ['always', C.green, '2H₂O₂ → 2H₂O + O₂'], ['never', C.red, '3O₂ → 2O₃'], ['hot', C.gold, 'CaCO₃ → CaO + CO₂']];
  g.t(L + cw / 2, 16, 'exo', { a: 'middle', c: 'm' }); g.t(L + cw * 1.5, 16, 'endo', { a: 'middle', c: 'm' });
  // columns: ΔH < 0 | ΔH > 0; rows: ΔS > 0 on top
  const pos = { always: [0, 0], hot: [1, 0], cold: [0, 1], never: [1, 1] };
  for (const [k, col, f] of cells) {
    const [i, j] = pos[k], x = L + i * cw, y = T + j * ch;
    g.box(x + 3, y + 3, cw - 6, ch - 6, col, { a: 0.1 });
    g.t(x + cw / 2, y + ch / 2 - 24, k + 'S', { a: 'middle', c: 'm', fs: 14 });
    g.t(x + cw / 2, y + ch / 2, k, { a: 'middle', fs: wide ? 16 : 15, c: { always: 'n', hot: 'g', cold: 'c', never: 'r' }[k] });
    g.t(x + cw / 2, y + ch / 2 + 26, { raw: f }, { a: 'middle', c: 'm', mono: true, fs: wide ? 14 : 14 });
  }
  return [W, H];
});

/* ── ch5: chemical potential as a level; matter runs downhill until the levels match ── */
figure('mu', (g, wide) => {
  const W = wide ? 720 : 360, H = wide ? 220 : 400;
  const panel = (x0, y0, hi, lo, eq) => {
    const pw = 320, base = y0 + 150;
    g.box(x0 + 30, base - hi, 100, hi, C.gold, { a: 0.22, rx: 3 }); g.box(x0 + 190, base - lo, 100, lo, C.cyan, { a: 0.22, rx: 3 });
    g.line(x0 + 20, base, x0 + pw - 20, base, C.line, { sw: 1 });
    g.t(x0 + 80, base + 16, { raw: 'N₂O₄' }, { a: 'middle', c: 'g', mono: true }); g.t(x0 + 240, base + 16, { raw: '2 NO₂' }, { a: 'middle', c: 'c', mono: true });
    g.t(x0 + 80, base - hi - 14, eq ? 'same' : 'high', { a: 'middle', c: 'g' }); g.t(x0 + 240, base - lo - 14, eq ? 'same' : 'low', { a: 'middle', c: 'c' });
    if (!eq) g.line(x0 + 136, base - hi + 14, x0 + 184, base - lo - 4, C.green, { arrow: true, sw: 2 });
    else g.line(x0 + 30, base - hi, x0 + 290, base - lo, C.mute, { sw: 1, dash: '4 4' });
    g.t(x0 + pw / 2, y0 + 12, eq ? 'after' : 'before', { a: 'middle', c: 'm' });
  };
  panel(wide ? 20 : 20, 10, 100, 46, false);
  panel(wide ? 380 : 20, wide ? 10 : 200, 70, 70, true);
  return [W, H];
});

/* ── ch7: the barrier; a catalyst lowers the hill and leaves both ends where they were ── */
figure('barrier', (g, wide) => {
  const W = wide ? 720 : 360, H = 250, k = W / 720;
  const x = v => 30 * k + v * (W - 60 * k) / 100, yR = 150, yP = 190, yT = 44, yC = 96;
  const hill = top => `M${r1(x(0))},${yR} L${r1(x(22))},${yR} C${r1(x(36))},${yR} ${r1(x(40))},${top} ${r1(x(50))},${top} C${r1(x(60))},${top} ${r1(x(64))},${yP} ${r1(x(78))},${yP} L${r1(x(100))},${yP}`;
  g.path(hill(yC), C.violet, { sw: 2, dash: '6 5' });
  g.path(hill(yT), C.red, { sw: 2.2 });
  g.t(x(11), yR - 16, 'react', { a: 'middle', c: 'g' }); g.t(x(89), yP - 16, 'prod', { a: 'middle', c: 'c' });
  g.t(x(50), yT - 16, 'ts', { a: 'middle', c: 'r' });
  g.t(x(50), yC + 20, 'cat', { a: 'middle', c: 'v' });
  // ΔG‡ arrow on the left of the hill, ΔG° arrow on the right
  g.line(x(27), yR - 4, x(27), yT + 4, C.red, { arrow: true, sw: 1.4 }); g.t(x(27) - 6, (yR + yT) / 2 - 10, { raw: 'ΔG‡' }, { a: 'end', c: 'r', mono: true });
  g.line(x(70), yR, x(98), yR, C.mute, { sw: 1, dash: '3 3' });
  g.line(x(94), yR + 3, x(94), yP - 4, C.green, { arrow: true, sw: 1.4 });
  g.t(x(50), H - 22, 'same', { a: 'middle', c: 'n' });
  return [W, H];
});

/* ── ch8: coupling, three bars to scale (kJ/mol) from the model ── */
figure('couple', (g, wide) => {
  const W = wide ? 720 : 360, H = 290, y0 = 62, sc = 2.6;       // px per kJ/mol
  const atp = M.atpDG(10, 0.01), up = M.ATP.glucose, net = up + atp;
  const cw = (W - 20) / 3, bw = wide ? 90 : 60;
  g.line(10, y0, W - 10, y0, C.mute, { sw: 1 }); g.t(W - 12, y0 - 12, { raw: 'ΔG = 0' }, { a: 'end', c: 'm', mono: true });
  const bar = (i, v, col, cls, key, val) => {
    const cx = 10 + cw * (i + 0.5), h = Math.abs(v) * sc;
    g.box(cx - bw / 2, v > 0 ? y0 - h : y0, bw, h, col, { a: 0.25, rx: 3 });
    g.t(cx, v > 0 ? y0 - h - 12 : y0 + h + 14, val, { a: 'middle', c: cls, mono: true });
    g.t(cx, H - 36, key, { a: 'middle', c: cls }); g.t(cx, H - 14, key + '2', { a: 'middle', c: 'm' });
  };
  bar(0, up, C.red, 'r', 'up', 'upV'); bar(1, atp, C.gold, 'g', 'atp', 'atpV'); bar(2, net, C.green, 'n', 'net', 'netV');
  return [W, H];
});

/* ── ch9: the synthesis loop ── */
figure('loop', (g, wide) => {
  if (wide) {
    const y = 96, h = 56, xs = [20, 190, 360, 530], w = 150;
    ['feed', 'comp', 'react', 'cond'].forEach((k, i) => { g.box(xs[i], y, w, h, [C.gold, C.mute, C.red, C.cyan][i]); g.t(xs[i] + w / 2, y + 18, k, { a: 'middle', c: ['g', '', 'r', 'c'][i] }); g.t(xs[i] + w / 2, y + 40, k + '2', { a: 'middle', c: 'm' }); if (i) g.line(xs[i - 1] + w + 2, y + h / 2, xs[i] - 4, y + h / 2, C.mute, { arrow: true }); });
    g.line(605, y + h + 2, 605, 206, C.cyan, { arrow: true, sw: 2 }); g.t(605, 222, 'out', { a: 'middle', c: 'c' });
    g.path(`M605,${y - 2} L605,40 L265,40 L265,${y - 6}`, C.violet, { arrow: true, sw: 2 }); g.t(435, 24, 'rec', { a: 'middle', c: 'v' });
    return [720, 240];
  }
  const x = 30, w = 220, h = 50, ys = [16, 96, 176, 256];
  ['feed', 'comp', 'react', 'cond'].forEach((k, i) => { g.box(x, ys[i], w, h, [C.gold, C.mute, C.red, C.cyan][i]); g.t(x + w / 2, ys[i] + 16, k, { a: 'middle', c: ['g', '', 'r', 'c'][i] }); g.t(x + w / 2, ys[i] + 36, k + '2', { a: 'middle', c: 'm' }); if (i) g.line(x + w / 2, ys[i - 1] + h + 2, x + w / 2, ys[i] - 4, C.mute, { arrow: true }); });
  g.line(x + w / 2, 308, x + w / 2, 336, C.cyan, { arrow: true, sw: 2 }); g.t(x + w / 2, 352, 'out', { a: 'middle', c: 'c' });
  g.path(`M${x + w + 2},281 L310,281 L310,121 L${x + w + 6},121`, C.violet, { arrow: true, sw: 2 }); g.t(326, 201, 'recN', { a: 'middle', c: 'v' }); g.t(326, 221, 'recN2', { a: 'middle', c: 'v' });
  return [360, 370];
});

/* ── ch11: the voltages of a water electrolyser, bars to scale ── */
figure('volt', (g, wide) => {
  const W = wide ? 720 : 360, L = wide ? 250 : 14, R = W - 70, rowH = wide ? 44 : 62, top = 14;
  const real = M.FRONTIER.electrolysis.doeStack2022 / M.kWhPerKgH2(1);
  const rows = [['rev', M.E_REV, C.green, 'n', 'revV'], ['tn', M.E_TN, C.cyan, 'c', 'tnV'], ['real', real, C.gold, 'g', 'realV']];
  const X = v => L + (R - L) * v / 2.0;
  rows.forEach(([k, v, col, cls, val], i) => {
    const y = top + i * rowH;
    if (wide) { g.t(L - 12, y + 14, k, { a: 'end', c: cls }); g.box(L, y, X(v) - L, 28, col, { a: 0.28, rx: 3 }); g.t(X(v) + 8, y + 14, val, { c: cls, mono: true }); }
    else { g.t(L, y + 10, k, { c: cls }); g.box(L, y + 24, X(v) - L, 24, col, { a: 0.28, rx: 3 }); g.t(X(v) + 8, y + 36, val, { c: cls, mono: true }); }
  });
  const yb = top + 3 * rowH + 2;
  g.line(L, yb, R, yb, C.line, { sw: 1 });
  [0, 0.5, 1, 1.5, 2].forEach(v => { g.line(X(v), yb, X(v), yb + 5, C.mute, { sw: 1 }); g.t(X(v), yb + 18, { raw: v.toFixed(1) + ' V' }, { a: 'middle', c: 'm', mono: true, fs: 14 }); });
  return [W, yb + 34];
});

fs.mkdirSync(OUT, { recursive: true });
// The first line marks the file as generated (page.json "generators"; build-pages strips it and --check reruns this script).
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
