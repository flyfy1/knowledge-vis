#!/usr/bin/env node
'use strict';
/* Writes the static diagrams figures/dg-*.html (STANDARD.md §4a, site-template shape (b)).
   Edit the drawings here, run `node tools/diagrams.cjs`, then `node scripts/build-pages.cjs <page-dir>`.
   Do not hand-edit figures/dg-*.html: this script overwrites them, and `build-pages.cjs --check` reruns it
   (page.json "generators") and fails on any difference.
   Each diagram is a <figure class="dia"> with two inline SVGs: a wide one (class "w", viewBox 720 wide) shown above
   640 px and a narrow one (class "n", viewBox 360 wide) at or below 640 px, so labels render at 11 px or more.
   Every <text> with words carries a data-i18n key whose string lives in the ::: diagram block of content.<lang>.md;
   literal text is language-neutral only (formulas, digits, units). Curves, levels and data points are computed from
   ../models.js, so what is drawn to scale is the model's own output.
   Colours: gold = electrons / filled / bonding, cyan = nuclei and positive ions, red = repulsion or energy paid,
   green = energy released, violet = measured or extrapolated reference. */
const fs = require('fs');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const OUT = path.join(__dirname, '..', 'figures');

const C = { ink: '#ebe8e0', mute: '#a3aab8', line: '#2b3242', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254', card: '#1a1f2b' };
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const r1 = v => Math.round(v * 10) / 10;
const FS = 14;

function drawing(name, v) {
  const parts = [], used = new Set();
  const mk = (col, o) => { if (o.arrow) used.add(col); return `${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.arrow ? ` marker-end="url(#ar-${name}-${v}-${col.slice(1)})"` : ''}`; };
  const g = {
    box(x, y, w, h, col, o = {}) { parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.rx == null ? 6 : o.rx}" fill="${o.solid ? col : tint(col, o.a == null ? 0.14 : o.a)}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.3}"/>`); },
    line(x1, y1, x2, y2, col = C.mute, o = {}) { parts.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${col}" stroke-width="${o.sw || 1.5}"${mk(col, o)}/>`); },
    path(d, col = C.mute, o = {}) { parts.push(`<path d="${d}" fill="${o.fill || 'none'}" stroke="${o.nostroke ? 'none' : col}" stroke-width="${o.sw || 1.5}" stroke-linejoin="round"${mk(col, o)}/>`); },
    circle(cx, cy, r, col, o = {}) { parts.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${o.solid ? col : o.hollow ? '#0c0e13' : tint(col, o.a == null ? 0.16 : o.a)}" stroke="${col}" stroke-width="${o.sw || 1.3}"/>`); },
    ellipse(cx, cy, rx, ry, rot, col, o = {}) { parts.push(`<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${rx}" ry="${ry}" transform="rotate(${r1(rot)} ${r1(cx)} ${r1(cy)})" fill="${tint(col, o.a == null ? 0.22 : o.a)}" stroke="${col}" stroke-width="1.2"/>`); },
    // key → data-i18n="dg.<name>.<key>"; {raw: '154 pm'} → literal language-neutral text
    t(x, y, key, o = {}) {
      const cls = [o.c || '', o.mono ? 'mono' : ''].filter(Boolean).join(' ');
      const attrs = `x="${r1(x)}" y="${r1(y)}" font-size="${Math.max(o.fs || FS, v === 'n' ? 14 : 12)}" text-anchor="${o.a || 'start'}" dominant-baseline="central"${cls ? ` class="${cls}"` : ''}`;
      parts.push(typeof key === 'object' ? `<text ${attrs}>${key.raw}</text>` : `<text ${attrs} data-i18n="dg.${name}.${key}"></text>`);
    },
    curve(pts, col, o = {}) { g.path('M' + pts.map(p => r1(p[0]) + ',' + r1(p[1])).join(' L') + (o.close ? ' Z' : ''), col, o); }
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

/* ── ch1: two narrow boxes against one wide box (the half-sine is the ground state of each box, drawn to scale) ── */
function well(g, x, w, floor, top, amp) {
  g.path(`M${x},${top} L${x},${floor} L${x + w},${floor} L${x + w},${top}`, C.mute, { sw: 2 });
  const pts = []; for (let i = 0; i <= 40; i++) pts.push([x + w * i / 40, floor - 4 - amp * Math.sin(Math.PI * i / 40)]);
  g.curve([[x, floor - 4]].concat(pts, [[x + w, floor - 4]]), C.gold, { fill: tint(C.gold, 0.16), sw: 2, close: true });
}
figure('box', g => {
  g.t(175, 20, 'two', { a: 'middle' }); g.t(550, 20, 'one', { a: 'middle' });
  well(g, 60, 110, 150, 44, 78); well(g, 180, 110, 150, 44, 78); well(g, 440, 220, 150, 44, 55);
  g.line(350, 100, 415, 100, C.mute, { arrow: true });
  g.t(115, 172, 'wl', { a: 'middle', c: 'm' }); g.t(235, 172, 'wl', { a: 'middle', c: 'm' }); g.t(550, 172, 'w2', { a: 'middle', c: 'm' });
  g.t(175, 198, 'e1', { a: 'middle', c: 'r' }); g.t(550, 198, 'e2', { a: 'middle', c: 'n' });
  return [720, 216];
}, g => {
  g.t(180, 18, 'two', { a: 'middle' });
  well(g, 40, 130, 140, 40, 78); well(g, 190, 130, 140, 40, 78);
  g.t(105, 160, 'wl', { a: 'middle', c: 'm' }); g.t(255, 160, 'wl', { a: 'middle', c: 'm' });
  g.t(180, 184, 'e1', { a: 'middle', c: 'r' });
  g.line(180, 200, 180, 226, C.mute, { arrow: true });
  g.t(180, 246, 'one', { a: 'middle' });
  well(g, 50, 260, 364, 268, 55);
  g.t(180, 384, 'w2', { a: 'middle', c: 'm' }); g.t(180, 408, 'e2', { a: 'middle', c: 'n' });
  return [360, 424];
});

/* ── ch2: the bonding and antibonding combinations of two 1s orbitals at R = 2 a0, to scale ── */
function lcaoPanel(g, cx, base, sign, u, amp) {
  const R = 2, a = R / 2, S = M.h2plus(R, 1).S, nrm = 1 / Math.sqrt(2 * (1 + sign * S));
  const psi = x => nrm * (Math.exp(-Math.abs(x - a)) + sign * Math.exp(-Math.abs(x + a)));
  const pts = []; for (let i = -90; i <= 90; i++) { const x = i / 20; pts.push([cx + x * u, base - amp * psi(x)]); }
  g.line(cx - 4.7 * u, base, cx + 4.7 * u, base, C.line, { sw: 1.2 });
  g.curve([[cx - 4.5 * u, base]].concat(pts, [[cx + 4.5 * u, base]]), sign > 0 ? C.gold : C.red, { fill: tint(sign > 0 ? C.gold : C.red, 0.14), sw: 2, close: true });
  g.circle(cx - a * u, base, 5, C.cyan, { solid: true }); g.circle(cx + a * u, base, 5, C.cyan, { solid: true });
}
figure('lcao', g => {
  g.t(180, 20, 'bond', { a: 'middle', c: 'g' }); g.t(540, 20, 'anti', { a: 'middle', c: 'r' });
  lcaoPanel(g, 180, 136, 1, 34, 85); lcaoPanel(g, 540, 136, -1, 34, 85);
  g.line(540, 50, 540, 222, C.mute, { dash: '4 4', sw: 1.2 });
  g.t(180, 160, 'nuc', { a: 'middle', c: 'c' });
  g.t(180, 244, 'mid', { a: 'middle', c: 'm' }); g.t(540, 244, 'node', { a: 'middle', c: 'm' });
  return [720, 262];
}, g => {
  g.t(180, 18, 'bond', { a: 'middle', c: 'g' });
  lcaoPanel(g, 180, 112, 1, 34, 85);
  g.t(180, 134, 'nuc', { a: 'middle', c: 'c' }); g.t(180, 158, 'mid', { a: 'middle', c: 'm' });
  g.t(180, 196, 'anti', { a: 'middle', c: 'r' });
  lcaoPanel(g, 180, 296, -1, 34, 85);
  g.line(180, 212, 180, 380, C.mute, { dash: '4 4', sw: 1.2 });
  g.t(180, 400, 'node', { a: 'middle', c: 'm' });
  return [360, 418];
});

/* ── ch3: filling σ and σ* with one to four electrons ── */
function moCol(g, cx, top, m, hw) {
  const yS = top + 86, yA = top + 34;
  g.t(cx, top, { raw: m.f }, { a: 'middle', fs: 17 });
  g.line(cx - hw, yA, cx + hw, yA, C.red, { sw: 2 }); g.line(cx - hw, yS, cx + hw, yS, C.gold, { sw: 2 });
  const el = (y, k, col) => { for (let i = 0; i < k; i++) { const x = cx + (k === 1 ? 0 : (i ? 9 : -9)), up = i === 0; g.line(x, up ? y + 13 : y - 13, x, up ? y - 13 : y + 13, col, { arrow: true, sw: 1.8 }); } };
  el(yS, m.nb, C.ink); el(yA, m.na, C.ink);
  g.t(cx, top + 124, { raw: m.order === 0.5 ? '½' : String(m.order) }, { a: 'middle', fs: 16, c: m.order ? 'g' : 'r' });
  if (m.d0) g.t(cx, top + 150, { raw: M.fmt(m.d0, 2) + ' eV' }, { a: 'middle', c: 'v' }); else g.t(cx, top + 150, 'none', { a: 'middle', c: 'r' });
}
function moRows(g, x, top) { g.t(x, top + 34, 'sigs', { c: 'r' }); g.t(x, top + 86, 'sig', { c: 'g' }); g.t(x, top + 124, 'bo', { c: 'm' }); g.t(x, top + 150, 'd0', { c: 'm' }); }
figure('mo', g => {
  moRows(g, 16, 24); M.MO_FILL.forEach((m, i) => moCol(g, 230 + i * 135, 24, m, 34));
  return [720, 196];
}, g => {
  moRows(g, 8, 22); moCol(g, 172, 22, M.MO_FILL[0], 30); moCol(g, 290, 22, M.MO_FILL[1], 30);
  moRows(g, 8, 216); moCol(g, 172, 216, M.MO_FILL[2], 30); moCol(g, 290, 216, M.MO_FILL[3], 30);
  return [360, 388];
});

/* ── ch4: one layer of rock salt and the first shells of neighbours ── */
function saltGrid(g, x0, y0, s) {
  const c = [x0 + 2 * s, y0 + 2 * s];
  g.line(c[0], c[1], c[0] + s, c[1], C.gold, { sw: 2.2 }); g.line(c[0], c[1], c[0] + s, c[1] - s, C.cyan, { sw: 2.2, dash: '5 3' });
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const pos = (i + j) % 2 === 0, x = x0 + i * s, y = y0 + j * s, mid = i === 2 && j === 2;
    g.circle(x, y, pos ? 11 : 15, pos ? C.cyan : C.gold, { a: mid ? 0.6 : 0.2, sw: mid ? 2.4 : 1.3 });
    g.t(x, y, { raw: pos ? '+' : '−' }, { a: 'middle', fs: 14 });
  }
}
figure('nacl', g => {
  saltGrid(g, 40, 30, 44);
  g.t(270, 40, 'n1', { c: 'g' }); g.t(270, 76, 'n2', { c: 'c' }); g.t(270, 112, 'n3', { c: 'g' }); g.t(270, 148, 'n4', { c: 'm' });
  g.t(270, 196, { raw: 'M = 6 − 12/√2 + 8/√3 − 6/2 + 24/√5 − …' }, { mono: true, fs: 14 });
  return [720, 236];
}, g => {
  saltGrid(g, 92, 30, 44);
  g.t(12, 250, 'n1', { c: 'g' }); g.t(12, 278, 'n2', { c: 'c' }); g.t(12, 306, 'n3', { c: 'g' }); g.t(12, 334, 'n4', { c: 'm' });
  g.t(12, 368, { raw: 'M = 6 − 12/√2 + 8/√3 − 6/2 + …' }, { mono: true, fs: 14 });
  return [360, 388];
});

/* ── ch4: the Born–Haber cycle of NaCl, heights to scale ── */
function bornHaber(g, x0, dx, top, bottom, lx, ly, lw) {
  const d = M.BORN_HABER, lat = M.bornHaber();
  const L = [0, d.sub, d.sub + d.diss, d.sub + d.diss + d.ie, d.sub + d.diss + d.ie + d.ea, d.hf];
  const lo = d.hf, hi = L[3], Y = E => bottom - (E - lo) / (hi - lo) * (bottom - top);
  const xs = i => x0 + i * dx;
  // level segments
  const seg = (E, a, b, col) => g.line(xs(a) - 14, Y(E), xs(b) + 14, Y(E), col || C.mute, { sw: 2 });
  seg(L[0], -1, 0); seg(L[1], 0, 1); seg(L[2], 1, 2); seg(L[3], 2, 3); seg(L[4], 3, 4); seg(L[5], -1, 4, C.ink);
  const steps = [[0, L[0], L[1]], [1, L[1], L[2]], [2, L[2], L[3]], [3, L[3], L[4]], [4, L[4], L[5]]];
  steps.forEach(([i, a, b]) => { const up = b > a, col = up ? C.red : C.green; g.line(xs(i), Y(a) + (up ? -2 : 2), xs(i), Y(b) + (up ? 3 : -3), col, { arrow: true, sw: 2 }); g.t(xs(i) + 9, (Y(a) + Y(b)) / 2, { raw: '①②③④⑤'[i] }, { fs: 15, c: up ? 'r' : 'n' }); });
  g.line(xs(-1), Y(L[0]) + 2, xs(-1), Y(L[5]) - 3, C.violet, { arrow: true, sw: 2 }); g.t(xs(-1) + 9, (Y(L[0]) + Y(L[5])) / 2, { raw: '⑥' }, { fs: 15, c: 'v' });
  const vals = [d.sub, d.diss, d.ie, d.ea, lat, d.hf], keys = ['s1', 's2', 's3', 's4', 's5', 's6'], cls = ['r', 'r', 'r', 'n', 'n', 'v'];
  vals.forEach((v, i) => { g.t(lx, ly + i * 26, keys[i], { c: cls[i] }); g.t(lx + lw, ly + i * 26, { raw: (v > 0 ? '+' : '−') + M.fmt(Math.abs(v), 0) }, { a: 'end', mono: true, c: cls[i] }); });
  g.t(lx + lw, ly + 6 * 26, { raw: 'kJ/mol' }, { a: 'end', c: 'm', fs: 13 });
  return Y;
}
figure('bh', g => {
  const d = M.BORN_HABER, Y = bornHaber(g, 110, 64, 30, 300, 462, 60, 240);
  g.t(58, Y(0) + 14, { raw: 'Na(s) + ½Cl₂(g)' }, { fs: 13, c: 'm' });
  g.t(238, Y(d.sub + d.diss + d.ie) - 13, { raw: 'Na⁺(g) + e⁻ + Cl(g)' }, { fs: 13, c: 'm', a: 'middle' });
  g.t(356, Y(d.sub + d.diss + d.ie + d.ea) + 14, { raw: 'Na⁺(g) + Cl⁻(g)' }, { fs: 13, c: 'm', a: 'end' });
  g.t(58, Y(d.hf) + 14, { raw: 'NaCl(s)' }, { fs: 13 });
  return [720, 330];
}, g => {
  const d = M.BORN_HABER, Y = bornHaber(g, 82, 58, 30, 290, 16, 336, 326);
  g.t(36, Y(0) + 14, { raw: 'Na(s) + ½Cl₂(g)' }, { c: 'm' });
  g.t(198, Y(d.sub + d.diss + d.ie) - 13, { raw: 'Na⁺(g) + e⁻ + Cl(g)' }, { c: 'm', a: 'middle' });
  g.t(306, Y(d.sub + d.diss + d.ie + d.ea) + 14, { raw: 'Na⁺(g) + Cl⁻(g)' }, { c: 'm', a: 'end' });
  g.t(36, Y(d.hf) + 14, { raw: 'NaCl(s)' }, {});
  return [360, 510];
});

/* ── ch5: levels of a chain of N atoms (the model's eigenvalues), merging into a band ── */
function bandCols(g, cxs, hw, mid, sc, labY) {
  [1, 2, 4, 8].forEach((N, i) => {
    const t = M.tbChain(N, 0), cx = cxs[i];
    t.E.forEach((E, k) => { const filled = N === 1 || k < t.nOcc; g.line(cx - hw, mid - E * sc, cx + hw, mid - E * sc, filled ? C.gold : C.mute, { sw: filled ? 2.4 : 1.6 }); });
    g.t(cx, labY, { raw: 'N = ' + N }, { a: 'middle', c: 'm' });
  });
  const cx = cxs[4];
  g.box(cx - hw, mid - 2 * sc, 2 * hw, 2 * sc, C.dim, { rx: 0, a: 0.5 }); g.box(cx - hw, mid, 2 * hw, 2 * sc, C.gold, { rx: 0, a: 0.55 });
  g.t(cx, labY, { raw: 'N → ∞' }, { a: 'middle', c: 'm' });
}
figure('band', g => {
  g.t(14, 22, 'en', { c: 'm' });
  bandCols(g, [130, 250, 370, 490, 620], 34, 136, 46, 250);
  g.line(672, 44, 672, 228, C.mute, { sw: 1.2 }); g.line(666, 44, 678, 44, C.mute, { sw: 1.2 }); g.line(666, 228, 678, 228, C.mute, { sw: 1.2 });
  g.t(682, 136, { raw: '4|β|' }, { fs: 13, c: 'm' });
  g.t(130, 282, 'fill', { c: 'g' }); g.t(370, 282, 'empty', { c: 'm' });
  return [720, 302];
}, g => {
  g.t(8, 18, 'en', { c: 'm' });
  bandCols(g, [40, 108, 176, 244, 316], 24, 130, 44, 240);
  g.t(8, 272, 'fill', { c: 'g' }); g.t(8, 298, 'empty', { c: 'm' });
  return [360, 316];
});

/* ── ch6: sp, sp², sp³ hybrids and the angle between them (cos θ = −1/n) ── */
function hybrid(g, cx, cy, n, len, title, key) {
  const dirs = n === 1 ? [0, 180] : n === 2 ? [90, 210, 330] : [90, 200, 340, 268];
  dirs.forEach((a, i) => { const l = n === 3 && i === 3 ? len * 0.62 : len, rad = a * Math.PI / 180, x = cx + Math.cos(rad) * l / 2, y = cy - Math.sin(rad) * l / 2; g.ellipse(x, y, l / 2, n === 3 && i === 3 ? 13 : 10, -a, C.gold); });
  g.circle(cx, cy, 6, C.cyan, { solid: true });
  g.t(cx, cy - len - 34, { raw: title }, { a: 'middle', fs: 17 });
  g.t(cx, cy + len + 4, { raw: M.fmt(M.hybridAngle(n), n === 3 ? 1 : 0) + '°' }, { a: 'middle', mono: true, c: 'g' });
  g.t(cx, cy + len + 28, key, { a: 'middle', c: 'm' });
  g.t(cx, cy + len + 52, { raw: 's ' + M.fmt(100 / (1 + n), 0) + '%' }, { a: 'middle', c: 'm' });
}
figure('hyb', g => {
  hybrid(g, 120, 120, 1, 62, 'sp', 'lin'); hybrid(g, 360, 120, 2, 62, 'sp²', 'tri'); hybrid(g, 600, 120, 3, 62, 'sp³', 'tet');
  return [720, 256];
}, g => {
  hybrid(g, 62, 100, 1, 44, 'sp', 'lin'); hybrid(g, 180, 100, 2, 44, 'sp²', 'tri'); hybrid(g, 298, 100, 3, 44, 'sp³', 'tet');
  return [360, 214];
});

/* ── ch7: typical energies on a log scale, against kT at room temperature ── */
function forceRows(g, x0, x1, y0, dy, labelAbove, labX) {
  const X = v => x0 + (x1 - x0) * (Math.log10(v) + 2) / 6;
  const yEnd = y0 + dy * M.FORCES.length;
  [0.01, 0.1, 1, 10, 100, 1000, 10000].forEach(v => { g.line(X(v), y0 - 8, X(v), yEnd, C.line, { sw: 1 }); g.t(X(v), yEnd + 14, { raw: v >= 1000 ? (v === 1000 ? '10³' : '10⁴') : String(v) }, { a: 'middle', c: 'm', fs: 13 }); });
  M.FORCES.forEach((f, i) => {
    const y = y0 + i * dy + (labelAbove ? 22 : 4), col = i < 3 ? C.gold : C.cyan;
    g.box(X(f.lo), y, X(f.hi) - X(f.lo), 14, col, { rx: 4, a: 0.5 });
    if (labelAbove) g.t(labX, y - 13, f.id, { c: i < 3 ? 'g' : 'c' }); else g.t(labX, y + 7, f.id, { c: i < 3 ? 'g' : 'c' });
  });
  const xk = X(M.kT(298.15));
  g.line(xk, y0 - 8, xk, yEnd, C.red, { dash: '5 4', sw: 1.8 });
  return { xk, yEnd };
}
figure('forces', g => {
  const r = forceRows(g, 220, 700, 46, 30, false, 14);
  g.t(r.xk + 8, 22, 'kt', { c: 'r' });
  g.t(700, r.yEnd + 40, 'unit', { a: 'end', c: 'm', fs: 13 });
  return [720, 284];
}, g => {
  const r = forceRows(g, 14, 346, 52, 46, true, 14);
  g.t(346, 20, 'kt', { c: 'r', a: 'end' });
  g.t(346, r.yEnd + 40, 'unit', { a: 'end', c: 'm' });
  return [360, 386];
});

/* ── ch7: the Lennard-Jones curve, to scale ── */
function ljPlot(g, L, R, T, B) {
  const X = r => L + (R - L) * (r - 0.85) / (2.6 - 0.85), Y = v => B - (B - T) * (v + 1.25) / 2.75;
  g.line(L, T, L, B, C.mute, { sw: 1.2 }); g.line(L, Y(0), R, Y(0), C.mute, { sw: 1.2, dash: '4 4' });
  const pts = []; for (let r = 0.955; r <= 2.6; r += 0.01) pts.push([X(r), Y(M.lj(r))]);
  g.curve(pts, C.gold, { sw: 2.4 });
  g.line(X(M.LJ.rmin), Y(-1), X(M.LJ.rmin), Y(0), C.green, { sw: 1.4, dash: '3 3' });
  g.circle(X(M.LJ.rmin), Y(-1), 4.5, C.green, { solid: true }); g.circle(X(1), Y(0), 4, C.mute, { solid: true });
  g.t(X(1) - 6, Y(0) + 14, { raw: 'σ' }, { a: 'end', c: 'm' }); g.t(X(2), Y(0) - 13, { raw: '2σ' }, { a: 'middle', c: 'm' });
  g.line(X(2), Y(0) - 4, X(2), Y(0) + 4, C.mute, { sw: 1.2 });
  g.t(L - 6, Y(-1), { raw: '−ε' }, { a: 'end', c: 'n' }); g.t(L - 6, Y(0), { raw: '0' }, { a: 'end', c: 'm' });
  g.line(L - 3, Y(-1), L + 3, Y(-1), C.mute, { sw: 1.2 });
  return { X, Y };
}
figure('lj', g => {
  const p = ljPlot(g, 70, 470, 40, 236);
  g.t(70, 20, 'ay', { c: 'm' }); g.t(470, 222, 'ax', { a: 'end', c: 'm' });
  g.t(500, 60, 'rep', { c: 'r' }); g.t(500, 96, 'min', { c: 'n' }); g.t(500, 132, 'att', { c: 'g' }); g.t(500, 168, 'far', { c: 'm' });
  return [720, 256];
}, g => {
  ljPlot(g, 44, 346, 40, 236);
  g.t(44, 20, 'ay', { c: 'm' }); g.t(346, 222, 'ax', { a: 'end', c: 'm' });
  g.t(12, 270, 'rep', { c: 'r' }); g.t(12, 296, 'min', { c: 'n' }); g.t(12, 322, 'att', { c: 'g' }); g.t(12, 348, 'far', { c: 'm' });
  return [360, 368];
});

/* ── ch7: boiling points of the group-14 and group-16 hydrides, to scale ── */
function boilPlot(g, x0, dx, base, sc) {
  const X = p => x0 + (p - 2) * dx, Y = T => base - T * sc, w = M.waterWithoutHBonds();
  [0, 100, 200, 300, 400].forEach(T => { g.line(X(2) - 24, Y(T), X(5) + 24, Y(T), C.line, { sw: 1 }); g.t(X(2) - 30, Y(T), { raw: String(T) }, { a: 'end', c: 'm', fs: 13 }); });
  [2, 3, 4, 5].forEach(p => g.t(X(p), base + 16, { raw: String(p) }, { a: 'middle', c: 'm', fs: 13 }));
  const serie = (arr, col, cls, above) => { g.curve(arr.map(q => [X(q.p), Y(q.T)]), col, { sw: 2 }); arr.forEach(q => { g.circle(X(q.p), Y(q.T), 4.5, col, { solid: true }); g.t(X(q.p) + (q.p === 5 ? -8 : q.p === 4 ? 0 : above && q.p === 3 ? 12 : 8), Y(q.T) + (above ? -15 : 16), { raw: q.f }, { a: q.p === 5 ? 'end' : q.p === 4 ? 'middle' : 'start', c: cls, fs: 14 }); }); };
  g.line(X(3), Y(M.BOIL.g16[1].T), X(2), Y(w.T), C.violet, { dash: '5 4', sw: 1.6 });
  g.circle(X(2), Y(w.T), 5, C.violet, { hollow: true, sw: 2 });
  serie(M.BOIL.g14, C.cyan, 'c', false); serie(M.BOIL.g16, C.gold, 'g', true);
  return { X, Y, w };
}
figure('bp', g => {
  boilPlot(g, 100, 135, 276, 0.57);
  g.t(40, 12, 'ay', { c: 'm', fs: 13 }); g.t(529, 314, 'ax', { a: 'end', c: 'm', fs: 13 });
  g.t(560, 70, 'g16', { c: 'g' }); g.t(560, 102, 'g14', { c: 'c' });
  g.circle(566, 146, 5, C.violet, { hollow: true, sw: 2 }); g.t(578, 146, 'ext', { c: 'v' }); g.t(578, 170, 'ext2', { c: 'v' });
  return [720, 330];
}, g => {
  boilPlot(g, 62, 88, 276, 0.57);
  g.t(8, 12, 'ay', { c: 'm' }); g.t(350, 316, 'ax', { a: 'end', c: 'm' });
  g.t(12, 346, 'g16', { c: 'g' }); g.t(12, 372, 'g14', { c: 'c' });
  g.circle(18, 398, 5, C.violet, { hollow: true, sw: 2 }); g.t(30, 398, 'ext', { c: 'v' }); g.t(30, 422, 'ext2', { c: 'v' });
  return [360, 440];
});

/* ── ch8: diamond and graphite ── */
function diamond(g, cx, cy, s) {
  const nb = [[0, -1], [-0.92, 0.42], [0.92, 0.42], [0.12, 0.86]];
  nb.forEach(([x, y], i) => { g.line(cx, cy, cx + x * s, cy + y * s, C.gold, { sw: i === 3 ? 4 : 2.4 }); });
  nb.forEach(([x, y], i) => { g.circle(cx + x * s, cy + y * s, i === 3 ? 11 : 9, C.cyan, { a: 0.5 }); });
  g.circle(cx, cy, 10, C.cyan, { a: 0.8 });
  g.t(cx + 10, cy - s * 0.55, { raw: M.CARBON.diamondBond + ' pm' }, { c: 'g', mono: true });
}
function graphite(g, cx, cy, s, gap) {
  const k = 0.36, hw = Math.sqrt(3) / 2 * s;
  const layer = y0 => { // a ribbon of fused hexagons seen at an angle
    const seen = new Set(), pts = [];
    [-1.5, -0.5, 0.5, 1.5].forEach(q => {
      const x = cx + q * 2 * hw, v = [[x, y0 - s * k], [x + hw, y0 - s * k / 2], [x + hw, y0 + s * k / 2], [x, y0 + s * k], [x - hw, y0 + s * k / 2], [x - hw, y0 - s * k / 2]];
      g.curve(v, C.gold, { sw: 2, close: true });
      v.forEach(p => { const key = r1(p[0]) + ',' + r1(p[1]); if (!seen.has(key)) { seen.add(key); pts.push(p); } });
    });
    pts.forEach(p => g.circle(p[0], p[1], 4, C.cyan, { solid: true }));
  };
  layer(cy - gap / 2); layer(cy + gap / 2);
  g.line(cx, cy - gap / 2 + s * k + 7, cx, cy + gap / 2 - s * k - 7, C.violet, { dash: '4 4', sw: 1.6 });
  g.t(cx + 8, cy, { raw: M.CARBON.graphiteLayer + ' pm' }, { c: 'v', mono: true });
  g.t(cx, cy - gap / 2 - s * k - 14, { raw: M.CARBON.graphiteBond + ' pm' }, { a: 'middle', c: 'g', mono: true });
}
figure('carbon', g => {
  g.t(180, 20, 'dia', { a: 'middle' }); g.t(540, 20, 'gra', { a: 'middle' });
  diamond(g, 180, 124, 70); graphite(g, 540, 136, 34, 92);
  g.t(180, 222, 'dian', { a: 'middle', c: 'm' }); g.t(540, 222, 'gran', { a: 'middle', c: 'm' });
  g.t(180, 246, 'dian2', { a: 'middle', c: 'g' }); g.t(540, 246, 'gran2', { a: 'middle', c: 'v' });
  return [720, 264];
}, g => {
  g.t(180, 18, 'dia', { a: 'middle' });
  diamond(g, 180, 116, 66);
  g.t(180, 204, 'dian', { a: 'middle', c: 'm' }); g.t(180, 228, 'dian2', { a: 'middle', c: 'g' });
  g.t(180, 272, 'gra', { a: 'middle' });
  graphite(g, 180, 376, 34, 92);
  g.t(180, 462, 'gran', { a: 'middle', c: 'm' }); g.t(180, 486, 'gran2', { a: 'middle', c: 'v' });
  return [360, 504];
});

/* ── ch9: the 12-residue HP chain, stretched out and in its ground state (found by the model's exhaustive search) ── */
function hpDraw(g, seq, pts, x0, y0, s) {
  for (let i = 1; i < pts.length; i++) g.line(x0 + pts[i - 1][0] * s, y0 - pts[i - 1][1] * s, x0 + pts[i][0] * s, y0 - pts[i][1] * s, C.mute, { sw: 2.4 });
  pts.forEach((p, i) => g.circle(x0 + p[0] * s, y0 - p[1] * s, Math.min(10, s * 0.36), seq[i] === 'H' ? C.gold : C.cyan, seq[i] === 'H' ? { solid: true } : { hollow: true, sw: 2 }));
}
function hpPair(g, xo, yo, so, xf, yf, sf) {
  const seq = M.HP_SEQS.s12, best = M.hpBest(seq), open = M.hpFold(seq, 'R'.repeat(seq.length - 1)), fold = M.hpFold(seq, best.dirs);
  hpDraw(g, seq, open.pts, xo, yo, so);
  const xs = fold.pts.map(p => p[0]), ys = fold.pts.map(p => p[1]), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const fx = xf - mx * sf, fy = yf + my * sf;
  fold.contacts.forEach(([i, j]) => g.line(fx + fold.pts[i][0] * sf, fy - fold.pts[i][1] * sf, fx + fold.pts[j][0] * sf, fy - fold.pts[j][1] * sf, C.red, { dash: '3 4', sw: 2.2 }));
  hpDraw(g, seq, fold.pts, fx, fy, sf);
}
figure('hp', g => {
  g.t(170, 20, 'open', { a: 'middle' }); g.t(540, 20, 'fold', { a: 'middle' });
  hpPair(g, 27, 100, 26, 540, 112, 38);
  g.line(340, 100, 410, 100, C.mute, { arrow: true });
  g.circle(40, 170, 8, C.gold, { solid: true }); g.t(56, 170, 'h', { c: 'g' });
  g.circle(40, 198, 8, C.cyan, { hollow: true, sw: 2 }); g.t(56, 198, 'p', { c: 'c' });
  g.line(470, 208, 500, 208, C.red, { dash: '3 4', sw: 2.2 }); g.t(508, 208, 'con', { c: 'r' });
  return [720, 228];
}, g => {
  g.t(180, 18, 'open', { a: 'middle' });
  hpPair(g, 15, 56, 30, 180, 190, 40);
  g.t(180, 100, 'fold', { a: 'middle' });
  g.circle(20, 290, 8, C.gold, { solid: true }); g.t(36, 290, 'h', { c: 'g' });
  g.circle(20, 316, 8, C.cyan, { hollow: true, sw: 2 }); g.t(36, 316, 'p', { c: 'c' });
  g.line(12, 342, 30, 342, C.red, { dash: '3 4', sw: 2.2 }); g.t(36, 342, 'con', { c: 'r' });
  return [360, 362];
});

for (const [name, html] of Object.entries(D)) {
  fs.writeFileSync(path.join(OUT, `dg-${name}.html`), `<!-- GENERATED by tools/diagrams.cjs (page.json generators); edit tools/diagrams.cjs and rerun, do not edit this file. -->\n${html}\n`);
}
console.log(`wrote ${Object.keys(D).length} diagrams to figures/`);
