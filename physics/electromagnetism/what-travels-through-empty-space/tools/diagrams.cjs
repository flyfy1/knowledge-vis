#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: this script overwrites them, and `build-pages.cjs --check` reruns it
   (page.json "generators") and fails on any difference.
   Each diagram is a <figure class="dia"> holding two inline SVGs: a wide one (class "w", viewBox 720 wide) shown above
   640 px and a narrow one (class "n", viewBox 360 wide) shown at or below 640 px, so labels render at 11 px or more on
   every screen. Every <text> carries a data-i18n key whose string lives in the ::: diagram block of content.<lang>.md;
   literal text is language-neutral only (digits, SI symbols, i, n). Curves and sizes that stand for model results are
   computed here from ../models.js. Colours: electric field gold, magnetic field cyan, everywhere on the page. */
const fs = require('fs');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const OUT = path.join(__dirname, '..', 'figures');

const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254', card: '#1a1f2b', slate: '#8fa3c8' };
const CLS = { [C.gold]: 'g', [C.cyan]: 'c', [C.red]: 'r', [C.green]: 'n', [C.violet]: 'v', [C.mute]: 'm' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const R = x => Math.round(x * 100) / 100;
const FS = 14;

function drawing(name, v) {
  const parts = [], used = new Set();
  const mk = col => { used.add(col); return ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"`; };
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${R(x)}" y="${R(y)}" width="${R(w)}" height="${R(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.solid ? col : tint(col, o.a == null ? 0.14 : o.a)}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { parts.push(`<line x1="${R(x1)}" y1="${R(y1)}" x2="${R(x2)}" y2="${R(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? mk(col) : ''}/>`); },
    path(d, col = C.mute, o = {}) { parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="${o.sw || 1.5}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? mk(col) : ''}/>`); },
    poly(pts, col, o = {}) { g.path('M' + pts.map(p => R(p[0]) + ',' + R(p[1])).join(' L'), col, o); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${R(cx)}" cy="${R(cy)}" r="${r}" fill="${o.solid ? col : o.none ? 'none' : tint(col, 0.16)}" stroke="${col}" stroke-width="${o.sw || 1.3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`); },
    arc(cx, cy, r, a0, a1, col, o = {}) { // angles in degrees, clockwise from +x (screen coordinates)
      const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)], s = p(a0), e = p(a1);
      g.path(`M${R(s[0])},${R(s[1])} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${R(e[0])},${R(e[1])}`, col, o);
    },
    // text: key → data-i18n="dg.<name>.<key>"; {raw:'31'} → literal language-neutral text
    t(x, y, key, o = {}) {
      const cls = [o.c ? (CLS[o.c] || o.c) : '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${R(x)}" y="${R(y)}" font-size="${o.fs || FS}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}`;
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    },
    legend(x, y, col, key, o = {}) { // swatch + label
      if (o.dot) g.circle(x + 7, y, 5, col, { solid: true }); else if (o.sq) g.box(x + 1, y - 6, 12, 12, col, { solid: true, rx: 2 }); else g.line(x, y, x + 16, y, col, { sw: o.sw || 3, dash: o.dash });
      g.t(x + 24, y, key, { c: o.c });
    }
  };
  g.finish = (W, H) => {
    const defs = used.size ? '<defs>' + [...used].map(col => `<marker id="ar-${name}-${v}-${col.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`).join('') + '</defs>' : '';
    return `<svg class="${v}" viewBox="0 0 ${W} ${H}" role="img" data-i18n-aria="dg.${name}.aria">${defs}${parts.join('')}</svg>`;
  };
  return g;
}
const D = {};
// draw(g, narrow) → [W, H]; file is figures/dg-<file>.html, keys are dg.<name>.*
function figure(file, name, draw) {
  const gw = drawing(name, 'w'), gn = drawing(name, 'n');
  const [W1, H1] = draw(gw, false), [W2, H2] = draw(gn, true);
  D[file] = `<figure class="dia" id="dg-${file}" data-dg="${name}">${gw.finish(W1, H1)}${gn.finish(W2, H2)}<figcaption data-i18n-html="dg.${name}.cap"></figcaption></figure>`;
}

/* ── ch2: the four laws ── */
figure('maxwell', 'mx', (g, nr) => {
  const pw = 360, ph = 176, cols = nr ? 1 : 2;
  for (let i = 0; i < 4; i++) {
    const x0 = (i % cols) * pw, y0 = Math.floor(i / cols) * ph, cx = x0 + pw / 2, cy = y0 + 90;
    g.t(cx, y0 + 18, 't' + (i + 1), { a: 'middle' });
    g.t(cx, y0 + ph - 16, 's' + (i + 1), { a: 'middle', c: C.mute });
    if (i === 0) {
      g.circle(cx, cy, 40, C.mute, { none: true, dash: '5 4' });
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.line(cx + 14 * Math.cos(a), cy + 14 * Math.sin(a), cx + 56 * Math.cos(a), cy + 56 * Math.sin(a), C.gold, { arrow: true }); }
      g.circle(cx, cy, 10, C.red, { solid: true }); g.t(cx, cy, { raw: '+' }, { a: 'middle', c: 'k', weight: 700 });
    } else if (i === 1) {
      g.circle(cx, cy, 40, C.mute, { none: true, dash: '5 4' });
      for (const dy of [-22, 0, 22]) g.line(cx - 70, cy + dy, cx + 70, cy + dy, C.cyan, { arrow: true });
    } else {
      const fieldCol = i === 2 ? C.cyan : C.gold, loopCol = i === 2 ? C.gold : C.cyan;
      g.circle(cx, cy, 44, C.mute, { none: true, dash: '5 4' });
      for (const [dx, dy] of [[-16, -14], [16, -14], [-16, 14], [16, 14]]) g.t(cx + dx, cy + dy, { raw: '×' }, { a: 'middle', c: fieldCol, fs: 18 });
      if (i === 3) { g.circle(cx, cy, 7, C.red, { solid: true }); }
      for (const a of [20, 110, 200, 290]) g.arc(cx, cy, 56, a, a + 55, loopCol, { arrow: true, sw: 2 });
    }
  }
  return [cols * pw, Math.ceil(4 / cols) * ph];
});

/* ── ch2: the charging capacitor, one loop, two surfaces ── */
figure('cap', 'cap', (g, nr) => {
  const cy = 100, xa = nr ? 196 : 216, xb = xa + 70, xl = xa - 96, x0 = nr ? 14 : 24, x1 = xb + 86, xm = xa + 39;
  g.line(x0, cy, xa, cy, C.red, { sw: 2.5 }); g.line(xb + 8, cy, x1, cy, C.red, { sw: 2.5 });
  g.line(x0 + 6, cy - 12, x0 + 40, cy - 12, C.red, { arrow: true });
  g.box(xa, cy - 55, 8, 110, C.mute, { solid: true, rx: 2 }); g.box(xb, cy - 55, 8, 110, C.mute, { solid: true, rx: 2 });
  for (const dy of [-34, 34]) g.line(xa + 14, cy + dy, xb - 6, cy + dy, C.gold, { arrow: true });
  // the bag surface: from the loop, over the first plate, down through the gap, back under the plate
  g.path(`M${xl},${cy - 48} C${xl + 40},${cy - 92} ${xm},${cy - 96} ${xm},${cy} C${xm},${cy + 96} ${xl + 40},${cy + 92} ${xl},${cy + 48}`, C.green, { sw: 2, dash: '6 4' });
  parts_ellipse(g, xl, cy, 13, 48);
  const lx = nr ? 14 : 400, ly = nr ? 216 : 34, dy = nr ? 24 : 30;
  g.legend(lx, ly, C.red, 'wire'); g.legend(lx, ly + dy, C.gold, 'gap'); g.legend(lx, ly + 2 * dy, C.violet, 'loop');
  g.legend(lx, ly + 3 * dy, C.violet, 'flat', { sq: true }); g.legend(lx, ly + 4 * dy, C.green, 'bag', { dash: '6 4' });
  return nr ? [360, 330] : [720, 200];
});
function parts_ellipse(g, cx, cy, rx, ry) { g.path(`M${cx},${cy - ry} A${rx},${ry} 0 1 1 ${cx},${cy + ry} A${rx},${ry} 0 1 1 ${cx},${cy - ry} Z`, C.violet, { sw: 2.2, fill: tint(C.violet, 0.3) }); }

/* ── ch3: E and B at right angles ── */
figure('wave', 'wave', (g, nr) => {
  const x0 = nr ? 16 : 40, len = nr ? 236 : 480, cy = nr ? 128 : 112, A = nr ? 52 : 56, waves = nr ? 1.5 : 2, lam = len / waves, n = 120;
  const E = [], B = [];
  for (let i = 0; i <= n; i++) { const x = x0 + len * i / n, s = Math.sin(2 * Math.PI * (x - x0) / lam); E.push([x, cy - A * s]); B.push([x - 0.5 * A * s, cy + 0.36 * A * s]); }
  for (let i = 4; i < n; i += 8) { g.line(E[i][0], cy, E[i][0], E[i][1], C.gold, { sw: 1 }); g.line(E[i][0], cy, B[i][0], B[i][1], C.cyan, { sw: 1 }); }
  g.line(x0 - 6, cy, x0 + len + (nr ? 92 : 190), cy, C.mute, { arrow: true });
  g.poly(B, C.cyan, { sw: 2.2 }); g.poly(E, C.gold, { sw: 2.2 });
  g.t(x0 + lam / 4, cy - A - 14, 'e', { a: 'middle', c: C.gold });
  g.t(x0 + lam * 0.75 + (nr ? 6 : 0), cy - A * 0.36 - 22, 'b', { a: 'middle', c: C.cyan });
  if (nr) g.t(352, 20, 'dir', { a: 'end', c: C.mute }); else g.t(x0 + len + 96, cy - 16, 'dir', { a: 'middle', c: C.mute });
  const by = cy + A + 22; g.line(x0 + lam / 4, by, x0 + lam * 1.25, by, C.mute, { sw: 1 }); g.line(x0 + lam / 4, by - 5, x0 + lam / 4, by + 5, C.mute, { sw: 1 }); g.line(x0 + lam * 1.25, by - 5, x0 + lam * 1.25, by + 5, C.mute, { sw: 1 });
  g.t(x0 + lam * 0.75, by + 16, 'lam', { a: 'middle', c: C.mute });
  return nr ? [360, 238] : [720, 218];
});

/* ── ch3: the Yee grid ── */
figure('yee', 'yee', (g, nr) => {
  const gx = nr ? 74 : 96, dx = nr ? 78 : 104, yb = 172, dy = 52, cols = 4;
  const ex = i => gx + i * dx, bx = i => gx + (i + 0.5) * dx;
  [['n', yb], ['n+½', yb - dy], ['n+1', yb - 2 * dy]].forEach(([s, y]) => { g.line(gx - 24, y, ex(cols - 1) + 24, y, C.line, { sw: 1 }); g.t(gx - 32, y, { raw: s }, { a: 'end', c: C.mute, mono: true }); });
  ['i−1', 'i', 'i+1', 'i+2'].forEach((s, i) => g.t(ex(i), yb + 24, { raw: s }, { a: 'middle', c: C.mute, mono: true }));
  // new B(i+½, n+½) from E(i, n) and E(i+1, n); new E(i, n+1) from B(i−½), B(i+½) and E(i, n)
  g.line(ex(1) + 5, yb - 6, bx(1) - 8, yb - dy + 8, C.gold, { arrow: true, sw: 1.2 }); g.line(ex(2) - 5, yb - 6, bx(1) + 8, yb - dy + 8, C.gold, { arrow: true, sw: 1.2 });
  g.line(bx(0) + 6, yb - dy - 8, ex(1) - 8, yb - 2 * dy + 8, C.cyan, { arrow: true, sw: 1.2 }); g.line(bx(1) - 6, yb - dy - 8, ex(1) + 8, yb - 2 * dy + 8, C.cyan, { arrow: true, sw: 1.2 });
  g.line(ex(1), yb - 9, ex(1), yb - 2 * dy + 12, C.gold, { arrow: true, sw: 1.2, dash: '3 3' });
  for (let i = 0; i < cols; i++) for (const y of [yb, yb - 2 * dy]) g.circle(ex(i), y, 7, C.gold, { solid: true });
  for (let i = 0; i < cols - 1; i++) g.box(bx(i) - 6.5, yb - dy - 6.5, 13, 13, C.cyan, { solid: true, rx: 2 });
  g.circle(ex(1), yb - 2 * dy, 12, C.ink, { none: true });
  g.t(gx - 60, yb - 2 * dy - 30, 't', { c: C.mute }); g.t(ex(cols - 1) + 30, yb + 24 + (nr ? 22 : 0), 'x', { a: nr ? 'end' : 'start', c: C.mute });
  const lx = nr ? 14 : 470, ly = nr ? 250 : 70;
  g.legend(lx, ly, C.gold, 'e', { dot: true }); g.legend(lx, ly + 26, C.cyan, 'b', { sq: true });
  if (nr) g.t(14, ly + 56, 'rule', { c: C.mute, fs: 14 }); else g.t(360, 228, 'rule', { a: 'middle', c: C.mute });
  return nr ? [360, 326] : [720, 248];
});

/* ── ch4: a pulse meets glass (amplitudes and widths from the Fresnel coefficients) ── */
figure('if', 'if', (g, nr) => {
  const W = nr ? 360 : 720, A = 48, y1 = 98, y2 = 196, fr = M.fresnel(1, 1.5), w = nr ? 20 : 34;
  const pulse = (cx, amp, wid, yb, col) => { const pts = []; for (let i = -60; i <= 60; i++) { const x = cx + i * wid / 20; pts.push([x, yb - amp * A * Math.exp(-Math.pow(i / 20, 2))]); } g.poly(pts, col, { sw: 2.2 }); };
  for (const yb of [y1, y2]) { g.box(W / 2, yb - 62, W / 2 - 8, 80, C.cyan, { a: 0.1, nostroke: true, rx: 0 }); g.line(8, yb, W - 8, yb, C.line, { sw: 1 }); g.line(W / 2, yb - 62, W / 2, yb + 18, C.cyan, { sw: 1.2 }); }
  g.t(W / 4, 16, 'm1', { a: 'middle', c: C.mute }); g.t(W * 0.75, 16, 'm2', { a: 'middle', c: C.cyan });
  g.t(12, y1 + 16, 'before', { c: C.mute }); g.t(12, y2 + 16, 'after', { c: C.mute });
  pulse(W * 0.27, 1, w, y1, C.gold); g.line(W * 0.27 + 2.2 * w, y1 - 20, W * 0.27 + 2.2 * w + 30, y1 - 20, C.gold, { arrow: true });
  g.t(W * 0.27 - 1.9 * w, y1 - 40, 'inc', { a: 'end', c: C.gold });
  pulse(W * 0.25, fr.r, w, y2, C.gold); g.line(W * 0.25 - 1.6 * w, y2 - 16, W * 0.25 - 1.6 * w - 30, y2 - 16, C.gold, { arrow: true });
  g.t(W * 0.25 + 0.2 * w, y2 - 20, 'ref', { c: C.gold });
  pulse(W * 0.75, fr.t, w / 1.5, y2, C.gold); g.line(W * 0.75 + 1.5 * w, y2 - 16, W * 0.75 + 1.5 * w + 30, y2 - 16, C.gold, { arrow: true });
  g.t(W * 0.75 - 1.3 * w, y2 - 46, 'tr', { a: 'end', c: C.gold });
  g.t(W / 2, 236, 'en', { a: 'middle', c: C.mute });
  return [W, 254];
});

/* ── ch5: the kink in the field lines, and the sin² pattern ── */
figure('kink', 'kink', (g, nr) => {
  const ax = 180, ay = 122, r1 = 52, r2 = 70, r3 = 104, sh = 11;
  g.circle(ax, ay, r1, C.line, { none: true, dash: '4 4' }); g.circle(ax, ay, r2, C.line, { none: true, dash: '4 4' });
  for (let k = 0; k < 12; k++) {
    const a = (k + 0.5) * Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
    const p1 = [ax + sh + 9 * c, ay + 9 * s], p2 = [ax + sh + (r1 - sh * c) * c, ay + (r1 - sh * c) * s], p3 = [ax - sh + (r2 + sh * c) * c, ay + (r2 + sh * c) * s], p4 = [ax - sh + r3 * c, ay + r3 * s];
    g.line(p1[0], p1[1], p2[0], p2[1], C.green, { sw: 1.6 }); g.line(p2[0], p2[1], p3[0], p3[1], C.red, { sw: 2.6 }); g.line(p3[0], p3[1], p4[0], p4[1], C.mute, { sw: 1.6 });
  }
  g.circle(ax - sh, ay, 5, C.mute, { none: true, dash: '2 2' }); g.circle(ax + sh, ay, 6, C.red, { solid: true });
  g.legend(nr ? 60 : 70, 246, C.green, 'neu'); g.legend(nr ? 60 : 70, 270, C.red, 'kink'); g.legend(nr ? 60 : 70, 294, C.mute, 'old');
  // pattern: r = R sin²θ about a vertical element
  const bx = nr ? 180 : 540, by = nr ? 420 : 150, Rr = 100, pts = [];
  for (let i = 0; i <= 180; i++) { const th = i * Math.PI / 90, r = Rr * Math.pow(Math.sin(th), 2); pts.push([bx + r * Math.sin(th), by - r * Math.cos(th)]); }
  g.poly(pts, C.gold, { sw: 2, fill: tint(C.gold, 0.12) });
  g.line(bx, by - 26, bx, by + 26, C.ink, { sw: 4 }); g.line(bx - Rr - 14, by, bx + Rr + 14, by, C.line, { sw: 1, dash: '3 4' });
  g.t(bx, by - 70, 'ax', { a: 'middle', c: C.mute }); g.t(bx, by + 62, 'side', { a: 'middle', c: C.gold }); g.t(bx, by + 88, 'pat', { a: 'middle', c: C.mute });
  return nr ? [360, 524] : [720, 314];
});

/* ── ch6: three polarisers (bar heights from Malus's law) ── */
figure('pol', 'pol', (g, nr) => {
  const W = nr ? 360 : 720, base = 132, hmax = 84, I = M.crossedStack(1, 45).I, bw = nr ? 30 : 44;
  const xs = [0.12, 0.38, 0.62, 0.88].map(f => f * W), sx = [0.25, 0.5, 0.75].map(f => f * W), ang = [90, 45, 0];
  g.line(10, base, W - 10, base, C.line, { sw: 1 });
  I.forEach((v, i) => { g.box(xs[i] - bw / 2, base - hmax * v, bw, hmax * v, C.gold, { a: 0.75, rx: 3 }); g.t(xs[i], base - hmax * v - 14, 'i' + i, { a: 'middle', c: C.gold, mono: true }); });
  sx.forEach((x, i) => {
    g.box(x - 9, base - 100, 18, 112, C.violet, { rx: 4 });
    const a = ang[i] * Math.PI / 180, cy = base - 44; g.line(x - 15 * Math.cos(a), cy + 15 * Math.sin(a), x + 15 * Math.cos(a), cy - 15 * Math.sin(a), C.ink, { sw: 2.4 });
    g.t(x, base + 28, 'p' + (i + 1), { a: 'middle', c: C.violet });
  });
  g.t(W / 2, base + 58, 'note', { a: 'middle', c: C.mute });
  return [W, 206];
});

/* ── ch7 and ch8: the spectrum as a log strip with rows ── */
const F0 = 4, F1 = 22, STRIP_X = 70, U = 22;
const fy = f => 18 + (Math.log10(f) - F0) * U;
function strip(g, bands, rows, nr, extra) {
  const H = 18 + (F1 - F0) * U + 18, W = nr ? 360 : 720;
  [[1e6, '1 MHz'], [1e9, '1 GHz'], [1e12, '1 THz'], [1e15, '10¹⁵ Hz'], [1e18, '10¹⁸ Hz'], [1e21, '10²¹ Hz']].forEach(([f, s]) => { g.line(STRIP_X - 5, fy(f), STRIP_X, fy(f), C.mute, { sw: 1 }); g.t(STRIP_X - 9, fy(f), { raw: s }, { a: 'end', c: C.mute, fs: 14 }); });
  const rh = (H - 36) / rows.length;
  bands.forEach(([lo, hi, col, solid]) => g.box(STRIP_X, fy(lo), 18, fy(hi) - fy(lo), col, { solid: solid !== false, a: 0.25, rx: 0, nostroke: solid !== false }));
  rows.forEach(([key, lo, hi, col], i) => {
    const ry = 18 + rh * (i + 0.5), my = (fy(lo) + fy(hi)) / 2;
    g.path(`M${STRIP_X + 19},${R(my)} L${STRIP_X + 30},${R(my)} L${STRIP_X + 42},${R(ry - 11)}`, col, { sw: 1.2 });
    g.t(STRIP_X + 48, ry - 11, key, { c: col, fs: 15, weight: 600 }); g.t(STRIP_X + 48, ry + 11, key + '.d', { c: C.mute });
    if (extra) extra(key, lo, hi, ry);
  });
  return [W, H];
}
const edge = i => M.BANDS[i][1] || Math.pow(10, F0);
const SPEC = [['radio', edge(0), edge(1), C.slate], ['micro', edge(1), edge(2), C.cyan], ['ir', edge(2), edge(3), C.red], ['vis', edge(3), edge(4), C.gold], ['uv', edge(4), edge(5), C.violet], ['xray', edge(5), edge(6), C.green], ['gamma', edge(6), Math.pow(10, F1), C.ink]];
figure('spec', 'spec', (g, nr) => strip(g, SPEC.map(([, lo, hi, col]) => [lo, hi, col]), SPEC, nr, (key, lo, hi, ry) => {
  const u = q => M.withUnit(q, 3);
  const fr = key === 'radio' ? '< ' + u(M.siFreq(hi)) : key === 'gamma' ? '> ' + u(M.siFreq(lo)) : u(M.siFreq(lo)) + ' – ' + u(M.siFreq(hi));
  const la = key === 'radio' ? 'λ > ' + u(M.siLen(M.C0 / hi)) : key === 'gamma' ? 'λ < ' + u(M.siLen(M.C0 / lo)) : 'λ ' + u(M.siLen(M.C0 / lo)) + ' – ' + u(M.siLen(M.C0 / hi));
  g.t(nr ? 352 : 500, ry - 11, { raw: fr }, { a: nr ? 'end' : 'start', c: C.mute, fs: 14, mono: false });
  if (!nr) g.t(500, ry + 11, { raw: la }, { c: C.mute, fs: 14 });
}));
const WIN = [['l', Math.pow(10, F0), 2e7, C.violet], ['r', 2e7, 3e10, C.cyan], ['i', 3e10, M.C0 / 1.1e-6, C.red], ['v', M.C0 / 1.1e-6, M.C0 / 300e-9, C.gold], ['g', M.C0 / 300e-9, Math.pow(10, F1), C.mute]];
figure('win', 'win', (g, nr) => strip(g, [[WIN[0][1], WIN[0][2], C.violet, false], [WIN[1][1], WIN[1][2], C.cyan], [WIN[2][1], WIN[2][2], C.dim], [WIN[3][1], WIN[3][2], C.gold], [WIN[4][1], WIN[4][2], C.dim]], WIN, nr));

/* ── ch9: AM, FM (the model's own waveforms) and a 16-QAM constellation ── */
figure('mod', 'mod', (g, nr) => {
  const wx = nr ? 14 : 20, ww = nr ? 332 : 420, hh = 34;
  const wave = (type, idx, yc, key) => {
    const m = M.modulate(type, 2, idx, 1024, 22), pts = []; const sc = type === 'am' ? 1 + idx : 1;
    for (let k = 0; k < 1024; k += 1) pts.push([wx + ww * k / 1023, yc - hh * m.s[k] / sc]);
    g.t(wx, yc - hh - 16, key, { c: C.gold }); g.poly(pts, C.gold, { sw: 1.3 });
    if (type === 'am') { const env = []; for (let k = 0; k < 1024; k += 8) env.push([wx + ww * k / 1023, yc - hh * (1 + idx * m.msg[k]) / sc]); g.poly(env, C.cyan, { sw: 1.4, dash: '4 3' }); }
  };
  wave('am', 0.6, 70, 'am'); wave('fm', 6, 188, 'fm');
  const cx = nr ? 150 : 562, cy = nr ? 374 : 132, s = nr ? 34 : 30;
  g.t(nr ? 14 : cx, nr ? 262 : 20, 'qam', { a: nr ? 'start' : 'middle', c: C.gold });
  g.line(cx - 2.4 * s, cy, cx + 2.4 * s, cy, C.mute, { sw: 1, arrow: true }); g.line(cx, cy + 2.4 * s, cx, cy - 2.4 * s, C.mute, { sw: 1, arrow: true });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.circle(cx + (i - 1.5) * s, cy + (j - 1.5) * s, 5, C.gold, { solid: true });
  if (nr) { g.t(cx + 2.4 * s + 8, cy, 'i', { c: C.mute }); g.t(cx + 10, cy - 2.4 * s - 2, 'q', { c: C.mute }); g.t(14, cy + 2.4 * s + 26, 'bits', { c: C.mute }); }
  else { g.t(cx + 2.4 * s + 6, cy, 'i', { c: C.mute }); g.t(cx + 8, cy - 2.4 * s + 2, 'q', { c: C.mute }); g.t(cx, cy + 2.4 * s + 26, 'bits', { a: 'middle', c: C.mute }); }
  return nr ? [360, 496] : [720, 246];
});

/* ── ch10: a fibre in section ── */
figure('fibre', 'fib', (g, nr) => {
  const x0 = nr ? 52 : 70, x1 = nr ? 350 : 700, top = 30, ct = 76, cb = 124, bot = 170, cy = 100;
  g.box(x0, top, x1 - x0, bot - top, C.mute, { a: 0.1, rx: 0 }); g.box(x0, ct, x1 - x0, cb - ct, C.cyan, { a: 0.2, rx: 0 });
  const step = nr ? 62 : 84, pts = [[x0, cy]]; let x = x0 + step / 2, up = true;
  while (x < x1 - 6) { pts.push([x, up ? ct + 2 : cb - 2]); up = !up; x += step; }
  pts.push([Math.min(x1 - 2, x), cy]); g.poly(pts, C.gold, { sw: 2.2, arrow: true });
  g.poly([[x0, cy], [x0 + 26, ct]], C.red, { sw: 2 }); g.line(x0 + 26, ct, x0 + 60, top - 14 + 8, C.red, { sw: 2, dash: '5 4', arrow: true });
  g.line(x0, cy, x0 - 44, cy - 12, C.violet, { sw: 1.6 }); g.line(x0, cy, x0 - 44, cy + 12, C.violet, { sw: 1.6 });
  const lx = nr ? 14 : 70, ly = 200, dy = 24, col2 = nr ? lx : 400;
  g.legend(lx, ly, C.cyan, 'core', { sq: true }); g.legend(lx, ly + dy, C.mute, 'clad', { sq: true }); g.legend(lx, ly + 2 * dy, C.gold, 'ray');
  g.legend(col2, nr ? ly + 3 * dy : ly, C.red, 'leak', { dash: '5 4' }); g.legend(col2, nr ? ly + 4 * dy : ly + dy, C.violet, 'cone');
  return nr ? [360, 318] : [720, 268];
});

/* ── ch11: a phased array ── */
figure('arr', 'arr', (g, nr) => {
  const n = 8, de = nr ? 30 : 44, x0 = nr ? 70 : 190, yb = nr ? 200 : 206, th = 25 * Math.PI / 180, dl = de * Math.sin(th), R0 = nr ? 104 : 150;
  const tp = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * de, r = R0 - i * dl;
    g.box(x - 6, yb - 6, 12, 12, C.cyan, { solid: true, rx: 2 });
    const a0 = -90 + 25 - 48, a1 = -90 + 25 + 48; g.arc(x, yb - 7, r, a0, a1, C.cyan, { sw: 1 });
    tp.push([x + r * Math.sin(th), yb - 7 - r * Math.cos(th)]);
  }
  const ex = 26, d = [Math.cos(th), Math.sin(th)];
  g.line(tp[0][0] - ex * d[0], tp[0][1] - ex * d[1], tp[n - 1][0] + ex * d[0], tp[n - 1][1] + ex * d[1], C.gold, { sw: 2.4 });
  const mx = (tp[0][0] + tp[n - 1][0]) / 2, my = (tp[0][1] + tp[n - 1][1]) / 2, L = nr ? 74 : 96;
  g.line(mx, my, mx + L * Math.sin(th), my - L * Math.cos(th), C.gold, { sw: 2, arrow: true });
  g.t(mx + L * Math.sin(th) + 8, my - L * Math.cos(th) + 4, 'beam', { c: C.gold });
  g.t(nr ? 10 : tp[0][0] - ex - 10, nr ? 22 : tp[0][1] - 22, 'wf', { a: nr ? 'start' : 'end', c: C.gold });
  const cx = x0 + (n - 1) * de / 2;
  g.t(nr ? 180 : cx, yb + 26, 'el', { a: 'middle', c: C.cyan }); g.t(nr ? 180 : cx, yb + 50, 'ph', { a: 'middle', c: C.mute });
  return nr ? [360, 266] : [720, 272];
});

const HEAD = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEAD + html + '\n');
console.log(`wrote ${Object.keys(D).length} diagrams to figures/`);
