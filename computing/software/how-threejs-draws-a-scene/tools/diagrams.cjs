#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: this script overwrites them, and `build-pages.cjs --check` reruns it (page.json
   "generators") and fails on any difference.
   One SVG per diagram, viewBox 360 wide, shown at most 560 px wide (page.css): every label is 14 units, so it renders at
   11.2 px or more on a 320 px screen and at most 21.8 px on a wide one. Every <text> has x, y and font-size and no
   transform, so the build's label-room check sees it; its words are a data-i18n key whose string lives in the ::: diagram
   block of content.<lang>.md. Literal text is language-neutral only (digits, sizes such as 64², code names). The mip
   chain is drawn from models.js (the same box-filtered checker the ch9 lab samples). */
const fs = require('fs');
const path = require('path');
const M = require('../models.js');
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
    // text: key → data-i18n="dg.<name>.<key>"; {raw:'64²'} → literal language-neutral text
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      // o.halo: a background-coloured outline under the glyphs, so a label can sit over grid dots or cell borders
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

/* ── ch1: the layer stack ── */
figure('stack', g => {
  const cols = [C.gold, C.cyan, C.violet, C.green, C.red], bh = 58, gap = 34;
  for (let i = 0; i < 5; i++) {
    const y = 14 + i * (bh + gap);
    g.box(20, y, 320, bh, cols[i]);
    g.t(34, y + 19, 'l' + (i + 1), { weight: 600 });
    g.t(34, y + 43, 'l' + (i + 1) + 's', { c: 'm' });
    if (i < 4) { const yy = y + bh; g.line(44, yy + 4, 44, yy + gap - 4, C.mute, { arrow: true }); g.t(58, yy + gap / 2, 'x' + (i + 1), { c: 'g', mono: true }); }
  }
  return [360, 14 + 5 * bh + 4 * gap + 14];
});

/* ── ch2: the scene tree ── */
figure('tree', g => {
  const cols = [C.mute, C.gold, C.dim, C.cyan, C.dim, C.violet], h = 34, step = 48;
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 10, y = 14 + i * step;
    if (i > 0) g.line(x - 10 + 14, y - step + h, x - 10 + 14, y + h / 2, C.line, { sw: 1.5 }), g.line(x - 10 + 14, y + h / 2, x, y + h / 2, C.line, { sw: 1.5 });
    g.box(x, y, 270 - i * 10, h, cols[i] === C.dim ? C.mute : cols[i], { a: cols[i] === C.dim ? 0.06 : 0.14, dash: cols[i] === C.dim ? '4 3' : null });
    g.t(x + 12, y + h / 2, 'n' + i, { weight: i === 0 ? 600 : 400, mono: i === 0 });
  }
  const y = 14 + 6 * step + 6;
  g.line(20, y, 340, y, C.line, { sw: 1 });
  g.t(20, y + 22, 'm', { c: 'c', mono: true });
  g.t(20, y + 46, 'w', { c: 'g', mono: true });
  return [360, y + 62];
});

/* ── ch3: the buffers of one quad ── */
figure('quad', g => {
  // plane with gx = gy = 1 as BoxGeometry's buildPlane: vertices 0 (top-left), 1 (top-right), 2 (bottom-left), 3 (bottom-right)
  const P = [[40, 20], [150, 20], [40, 120], [150, 120]], vc = [C.gold, C.cyan, C.violet, C.green];
  g.box(40, 20, 110, 100, C.mute, { a: 0.06, rx: 0 });
  g.line(40, 120, 150, 20, C.mute, { sw: 1.2, dash: '4 3' });
  g.t(47, 35, 't1', { c: 'm' }); g.t(140, 106, 't2', { c: 'm', a: 'end' });
  P.forEach(([x, y], i) => { g.circle(x, y, 11, vc[i], { solid: true }); g.t(x, y, { raw: String(i) }, { a: 'middle', c: 'k', weight: 700 }); });
  g.t(190, 70, 'b', { c: 'm' });
  // arrays: one cell per float, coloured by vertex
  let y = 150;
  const row = (key, per) => {
    g.t(20, y, key, {}); y += 18;
    const cw = per === 3 ? 26 : 40;
    for (let v = 0; v < 4; v++) for (let k = 0; k < per; k++) g.box(20 + (v * per + k) * cw, y, cw - 2, 20, vc[v], { rx: 2, a: 0.3 });
    if (per === 3) for (let v = 0; v < 4; v++) g.t(20 + (v * per + per / 2) * cw - 1, y + 10, { raw: String(v) }, { a: 'middle', fs: 14, weight: 600 });
    else for (let v = 0; v < 4; v++) for (let k = 0; k < per; k++) g.t(20 + (v * per + k + 0.5) * cw - 1, y + 10, { raw: String(v) }, { a: 'middle', fs: 14, weight: 600 });
    y += 40;
  };
  row('pos', 3); row('nor', 3); row('uv', 2);
  g.t(20, y, 'idx', {}); y += 18;
  const idx = [0, 2, 1, 2, 3, 1];
  idx.forEach((v, i) => { g.box(20 + i * 40 + (i >= 3 ? 12 : 0), y, 38, 22, vc[v], { rx: 2, a: 0.3 }); g.t(39 + i * 40 + (i >= 3 ? 12 : 0), y + 11, { raw: String(v) }, { a: 'middle', mono: true, weight: 600 }); });
  return [360, y + 34];
});

/* ── ch4: the frustum and the clip cube ── */
figure('frustum', g => {
  const cx = 26, cy = 110, nx = 70, fx = 200, k = 0.5;   // half-height = (x − cx)·k
  g.path(`M${cx},${cy} L${fx},${cy - (fx - cx) * k} M${cx},${cy} L${fx},${cy + (fx - cx) * k}`, C.line, { sw: 1.2 });
  g.path(`M${nx},${cy - (nx - cx) * k} L${fx},${cy - (fx - cx) * k} L${fx},${cy + (fx - cx) * k} L${nx},${cy + (nx - cx) * k} Z`, C.cyan, { fill: tint(C.cyan, 0.1) });
  g.line(nx, cy - (nx - cx) * k, nx, cy + (nx - cx) * k, C.gold, { sw: 2 });
  g.line(fx, cy - (fx - cx) * k, fx, cy + (fx - cx) * k, C.violet, { sw: 2 });
  g.circle(cx, cy, 6, C.ink, { solid: true });
  g.t(cx, cy + 22, 'cam', { a: 'middle', c: 'm' });
  g.path(`M${cx + 24},${cy - 12} A26,26 0 0 1 ${cx + 24},${cy + 12}`, C.mute, { sw: 1.2 });
  g.t(4, 40, 'fov', { c: 'm' });
  g.t(nx, cy + (fx - cx) * k + 18, 'near', { a: 'middle', c: 'g' });
  g.t(fx, cy + (fx - cx) * k + 18, 'far', { a: 'middle', c: 'v' });
  g.circle(150, 92, 5, C.red, { solid: true }); g.t(158, 80, 'p', { c: 'r' });
  // clip cube
  g.line(214, cy, 246, cy, C.mute, { arrow: true });
  g.box(256, 66, 88, 88, C.cyan, { a: 0.1, rx: 2 });
  for (let i = 1; i < 6; i++) g.line(256 + 88 * (1 - Math.pow(0.55, i)), 66, 256 + 88 * (1 - Math.pow(0.55, i)), 154, C.line, { sw: 1 });
  g.circle(256 + 88 * 0.86, 66 + 44 - 0.32 * 44, 5, C.red, { solid: true });
  g.t(300, 48, 'cube', { a: 'middle', c: 'c' });
  g.t(300, 172, 'ndc', { a: 'middle', c: 'm' });
  return [360, cy + (fx - cx) * k + 34];
});

/* ── ch5: the order of work in render() ── */
figure('render', g => {
  const steps = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'], cols = [C.gold, C.gold, C.cyan, C.cyan, C.violet, C.mute, C.green, C.green, C.green];
  let y = 22;
  steps.forEach((s, i) => {
    g.circle(30, y, 11, cols[i], { solid: true }); g.t(30, y, { raw: String(i + 1) }, { a: 'middle', c: 'k', weight: 700 });
    if (i < steps.length - 1) g.line(30, y + 12, 30, y + 26 + (s === 's1' || s === 's5' ? 22 : 0), C.line, { sw: 1.2 });
    g.t(52, y, s, { mono: s === 's1' || s === 's5' });
    if (s === 's1' || s === 's5') { y += 22; g.t(52, y, s + 'n', { c: 'm' }); }
    y += 38;
  });
  return [360, y - 16];
});

/* ── ch6: program assembly ── */
figure('program', g => {
  const row = (y, key, col, o = {}) => { g.box(20, y, 320, 34, col, o); g.t(34, y + 17, key, { mono: !!o.mono, c: o.tc }); };
  row(12, 'mat', C.gold); row(54, 'scn', C.violet);
  g.line(180, 90, 180, 110, C.mute, { arrow: true });
  row(114, 'par', C.cyan, { mono: true });
  g.line(180, 150, 180, 170, C.mute, { arrow: true });
  row(174, 'key', C.cyan, { mono: true });
  g.line(180, 210, 180, 230, C.mute, { arrow: true });
  row(234, 'hit', C.green);
  row(276, 'miss', C.red);
  g.line(40, 312, 40, 330, C.mute, { arrow: true });
  g.box(36, 334, 304, 30, C.mute, { a: 0.06 }); g.t(48, 349, 'chunks', { mono: true });
  g.box(36, 370, 304, 30, C.mute, { a: 0.06 }); g.t(48, 385, 'defs', { mono: true });
  return [360, 412];
});

/* ── ch7: N, L, V, H ── */
figure('brdf', g => {
  const P = [180, 196], v = (a, l) => [P[0] + Math.cos(a) * l, P[1] - Math.sin(a) * l];
  const aL = Math.PI * 0.72, aV = Math.PI * 0.2, aH = (aL + aV) / 2;
  g.path('M30,196 L330,196', C.mute, { sw: 2 });
  for (let x = 40; x < 330; x += 16) g.line(x, 198, x - 8, 210, C.line, { sw: 1 });
  g.t(330, 222, 's', { a: 'end', c: 'm' });
  const L = v(aL, 130), V = v(aV, 130), N = v(Math.PI / 2, 140), H = v(aH, 110);
  g.line(P[0], P[1], L[0], L[1], C.gold, { arrow: true, sw: 2 });
  g.line(P[0], P[1], V[0], V[1], C.cyan, { arrow: true, sw: 2 });
  g.line(P[0], P[1], N[0], N[1], C.ink, { arrow: true, sw: 2 });
  g.line(P[0], P[1], H[0], H[1], C.violet, { arrow: true, sw: 2, dash: '5 3' });
  g.t(L[0] - 4, L[1] - 14, 'L', { a: 'middle', c: 'g' });
  g.t(V[0] + 2, V[1] - 14, 'V', { a: 'start', c: 'c' });
  g.t(N[0], N[1] - 14, 'N', { a: 'middle' });
  g.t(H[0] + 10, H[1] - 6, 'H', { c: 'v' });
  g.circle(P[0], P[1], 4, C.ink, { solid: true });
  g.t(180, 250, 'f1', { a: 'middle', mono: true });
  g.t(180, 276, 'f2', { a: 'middle', mono: true });
  return [360, 294];
});

/* ── ch8: a triangle over the pixel grid ── */
figure('edge', g => {
  const X0 = 20, Y0 = 14, cs = 26, nx = 12, ny = 8;
  const A = [X0 + 1.4 * cs, Y0 + 7.4 * cs], B = [X0 + 11.2 * cs, Y0 + 5.6 * cs], Cc = [X0 + 5.3 * cs, Y0 + 0.5 * cs];
  for (let i = 0; i <= nx; i++) g.line(X0 + i * cs, Y0, X0 + i * cs, Y0 + ny * cs, C.line, { sw: 1 });
  for (let j = 0; j <= ny; j++) g.line(X0, Y0 + j * cs, X0 + nx * cs, Y0 + j * cs, C.line, { sw: 1 });
  const ef = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const area = ef(A, B, Cc);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const p = [X0 + (i + 0.5) * cs, Y0 + (j + 0.5) * cs];
    const w0 = ef(B, Cc, p) / area, w1 = ef(Cc, A, p) / area, w2 = ef(A, B, p) / area;
    const inside = w0 >= 0 && w1 >= 0 && w2 >= 0;
    if (inside) g.box(X0 + i * cs + 1, Y0 + j * cs + 1, cs - 2, cs - 2, C.gold, { a: 0.22, nostroke: true, rx: 0 });
    g.circle(p[0], p[1], 3.2, inside ? C.gold : C.mute, inside ? { solid: true } : { fill: 'none', sw: 1 });
  }
  g.path(`M${A[0]},${A[1]} L${B[0]},${B[1]} L${Cc[0]},${Cc[1]} Z`, C.cyan, { sw: 2 });
  // edge labels sit on grid lines between two rows of pixel centres, so no centre dot falls under a label
  g.t((A[0] + B[0]) / 2 + 10, Y0 + 7 * cs, 'e2', { a: 'middle', c: 'c', halo: true });
  g.t((B[0] + Cc[0]) / 2 + 40, Y0 + 2 * cs, 'e0', { a: 'middle', c: 'c', halo: true });
  g.t((Cc[0] + A[0]) / 2 - 40, Y0 + 4 * cs, 'e1', { a: 'middle', c: 'c', halo: true });
  const y = Y0 + ny * cs + 22;
  g.circle(28, y, 4, C.gold, { solid: true }); g.t(40, y, 'in', {});
  g.circle(28, y + 24, 4, C.mute, { fill: 'none', sw: 1 }); g.t(40, y + 24, 'out', { c: 'm' });
  g.t(20, y + 52, 'b', { mono: true });
  return [360, y + 68];
});

/* ── ch9: the mip chain (drawn from models.js MIPS: 64 × 64 checker of 8-texel squares, box-filtered) ── */
figure('mip', g => {
  let x = 18;
  const y0 = 30, sizes = [128, 64, 32, 16, 8, 4, 2];
  sizes.forEach((px, lv) => {
    const L = M.MIPS[lv], s = Math.round(Math.sqrt(L.length)), cells = Math.min(s, 8), step = s / cells, cp = px / cells;
    for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) {
      const val = L[Math.floor(j * step) * s + Math.floor(i * step)], gv = Math.round(30 + val * 200);
      g.box(x + i * cp, y0 + j * cp, cp, cp, C.mute, { fill: `rgb(${gv},${gv},${Math.min(255, gv + 8)})`, nostroke: true, rx: 0 });
    }
    g.box(x, y0, px, px, C.line, { fill: 'none', rx: 0, sw: 1 });
    if (lv < 4) g.t(x + px / 2, y0 + 128 + 18, { raw: `${s}²` }, { a: 'middle', c: 'm', mono: true });
    x += px + 10;
  });
  g.t(18, 14, 'l0', { c: 'g' });
  g.line(160, 14, 290, 14, C.mute, { arrow: true, sw: 1.2 });
  g.t(18, y0 + 128 + 48, 'lk', { c: 'm' });
  g.t(18, y0 + 128 + 74, 'sum', { mono: true, c: 'c' });
  return [360, y0 + 128 + 92];
});

/* ── ch10: the light's view against the camera's ── */
figure('shadow', g => {
  // light rays from the upper left onto a slanted ground; one texel's footprint, its centre ray and a farther point in it
  const dir = [0.6, 0.8], gy = x => 210 - (x - 20) * 0.12;
  g.circle(40, 40, 12, C.gold, { solid: true });
  for (let i = 0; i < 6; i++) { const ox = 70 + i * 34, oy = 30; const t = (gy(ox + 0.6 * 200) - oy) / 0.8; g.line(ox, oy, ox + dir[0] * t * 0.97, oy + dir[1] * t * 0.97, C.line, { sw: 1, dash: '3 4' }); }
  g.path(`M20,${gy(20)} L340,${gy(340)}`, C.mute, { sw: 2.5 });
  // texel footprint on the ground between x 170 and 250
  const xa = 170, xb = 250;
  g.path(`M${xa},${gy(xa) + 12} L${xa},${gy(xa) + 20} L${xb},${gy(xb) + 20} L${xb},${gy(xb) + 12}`, C.cyan, { sw: 1.5 });
  g.t((xa + xb) / 2, gy((xa + xb) / 2) + 36, 'tx', { a: 'middle', c: 'c' });
  const cxm = (xa + xb) / 2;
  g.line(cxm - dir[0] * 150, gy(cxm) - dir[1] * 150, cxm, gy(cxm), C.gold, { sw: 2, arrow: true });
  g.circle(cxm, gy(cxm), 5, C.gold, { solid: true });
  g.t(cxm - dir[0] * 150 - 8, gy(cxm) - dir[1] * 150 + 4, 'near', { a: 'end', c: 'g' });
  const px = xa + 10;
  g.circle(px, gy(px), 5, C.red, { solid: true });
  g.t(px - 8, gy(px) - 18, 'me', { a: 'end', c: 'r' });
  g.t(20, 276, 'sh', { c: 'r' });
  g.t(64, 40, 'lv', { c: 'g' });
  g.t(20, 252, 'cv', { c: 'm' });
  return [360, 294];
});

/* ── ch11: N calls against one instanced call ── */
figure('calls', g => {
  const gpu = (y) => { g.box(300, y + 6, 40, 52, C.green, { a: 0.18 }); g.t(320, y + 32, { raw: 'GPU' }, { a: 'middle', fs: 14, c: 'n' }); };
  let y = 12;
  // separate meshes
  g.t(20, y + 14, 'sep', { weight: 600 }); g.t(20, y + 38, 'sepc', { c: 'r' });
  for (let i = 0; i < 6; i++) { g.box(150 + (i % 3) * 22, y + 4 + Math.floor(i / 3) * 28, 16, 16, C.gold, { rx: 2 }); g.line(168 + (i % 3) * 22, y + 12 + Math.floor(i / 3) * 28, 296, y + 32, C.red, { sw: 1 }); }
  gpu(y);
  y += 92;
  g.t(20, y + 14, 'ins', { weight: 600, mono: true }); g.t(20, y + 38, 'insc', { c: 'g' });
  g.box(150, y + 4, 16, 16, C.gold, { rx: 2 }); g.line(168, y + 12, 296, y + 32, C.gold, { sw: 2, arrow: true });
  for (let i = 0; i < 8; i++) g.box(150 + i * 17, y + 30, 15, 14, C.cyan, { rx: 1, a: 0.3 });
  g.t(150, y + 70, 'insm', { c: 'm' });
  gpu(y);
  y += 92;
  g.t(20, y + 14, 'bat', { weight: 600, mono: true }); g.t(20, y + 38, 'batc', { c: 'g' });
  [[0, 3], [3, 2], [5, 4]].forEach(([a, n], i) => g.box(150 + a * 13, y + 4, n * 13 - 2, 16, [C.gold, C.violet, C.cyan][i], { rx: 2, a: 0.3 }));
  g.line(270, y + 12, 296, y + 32, C.gold, { sw: 2, arrow: true });
  g.t(150, y + 40, 'batm', { c: 'm' });
  gpu(y);
  return [360, y + 70];
});

fs.mkdirSync(OUT, { recursive: true });
// The first line marks the file as generated (page.json "generators"; build-pages strips it and --check reruns this script).
const HEADER = '<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n';
for (const [name, html] of Object.entries(D)) fs.writeFileSync(path.join(OUT, `dg-${name}.html`), HEADER + html + '\n');
console.log(`wrote ${Object.keys(D).length} diagrams: ${Object.keys(D).join(', ')}`);
