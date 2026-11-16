'use strict';
/* Diagrams for chapters 2–12 (figures 2–13) and the static format table (table 1). Called by tools/diagrams.cjs.
   Same rules as there: every word is a data-i18n key; literal text is only digits, bit counts and format names.
   Font sizes are 14 or more in both variants: the narrow SVG is drawn at 360 units and shown at no less than
   288 px (a 320 px screen), so 14 units ≥ 11.2 px; the wide one is shown at no less than about 600 px (scale 0.83). */
const fs = require('fs');
const path = require('path');
const M = require('../models.js');

module.exports = function (figure, C) {
  const T = 14; // minimum label size

  /* ── fig 2 (ch2): a 3-bit-significand format between 1 and 8, at true positions ── */
  const gridTicks = [];
  for (let k = 0; k < 3; k++) for (let i = 0; i < 8; i++) gridTicks.push({ v: Math.pow(2, k) * (1 + i / 8), k });
  gridTicks.push({ v: 8, k: 3 });
  const segCol = [C.cyan, C.gold, C.red, C.mute];
  function gridLine(g, X0, W, y) {
    const X = v => X0 + (v - 1) / 7 * W;
    g.line(X0 - 6, y, X0 + W + 8, y, C.mute, { sw: 1.4 });
    for (const tk of gridTicks) g.line(X(tk.v), y - 9, X(tk.v), y + 9, segCol[tk.k], { sw: 1.6 });
    [1, 2, 4, 8].forEach(v => g.t(X(v), y + 24, { raw: String(v) }, { a: 'middle', mono: true, fs: T, c: 'm' }));
    return X;
  }
  figure('grid', g => {
    const X = gridLine(g, 40, 640, 60);
    const mids = [1.5, 3, 6];
    ['s1', 's2', 's3'].forEach((k, i) => {
      const lo = Math.pow(2, i), hi = lo * 2;
      g.path(`M${X(lo) + 2},${100} L${X(lo) + 2},${106} L${X(hi) - 2},${106} L${X(hi) - 2},${100}`, segCol[i], { sw: 1.3 });
      g.t(X(mids[i]), 126, k, { a: 'middle', c: ['c', 'g', 'r'][i], fs: T });
    });
    g.t(360, 164, 'each', { a: 'middle', fs: 15 });
    g.t(360, 190, 'rel', { a: 'middle', c: 'm', fs: T });
    return [720, 210];
  }, g => {
    const X = gridLine(g, 24, 312, 40);
    // staggered labels with leaders: segments 1–2 and 2–4 are too narrow at this scale for a label each in one row
    const rows = [[1.5, 's1', 'c', 96], [3, 's2', 'g', 124], [6, 's3', 'r', 152]];
    rows.forEach(([v, k, c, y], i) => {
      const lo = Math.pow(2, i), hi = lo * 2;
      g.path(`M${X(lo) + 1},${76} L${X(lo) + 1},${80} L${X(hi) - 1},${80} L${X(hi) - 1},${76}`, segCol[i], { sw: 1.3 });
      g.line(X(v), 82, X(v), y - 9, segCol[i], { sw: 1 });
      g.t(i < 2 ? X(v) - 4 : X(v), y, k, { a: i < 2 ? 'start' : 'middle', c, fs: T });
    });
    g.t(180, 192, 'each', { a: 'middle', fs: T });
    g.t(180, 218, 'rel', { a: 'middle', c: 'm', fs: T });
    return [360, 236];
  });

  /* ── fig 3 (ch3): guard, round and sticky bits ── */
  function grsRow(g, X0, y, cw, keepN) {
    for (let i = 0; i < keepN; i++) g.box(X0 + i * cw, y, cw - 3, 34, C.gold, { rx: 3 });
    const xg = X0 + keepN * cw + 10;
    g.box(xg, y, cw - 3, 34, C.cyan, { rx: 3 }); g.box(xg + cw, y, cw - 3, 34, C.cyan, { rx: 3 }); g.box(xg + 2 * cw, y, cw - 3, 34, C.violet, { rx: 3 });
    g.line(xg - 5, y - 6, xg - 5, y + 40, C.mute, { sw: 1.2, dash: '3 3' });
    return xg;
  }
  figure('grs', g => {
    const X0 = 60, cw = 40, y = 64, n = 9;
    const xg = grsRow(g, X0, y, cw, n);
    g.t(X0 + (n * cw) / 2, 28, 'keep', { a: 'middle', c: 'g', fs: 15 });
    g.path(`M${X0},44 L${X0},50 L${X0 + n * cw - 3},50 L${X0 + n * cw - 3},44`, C.gold, { sw: 1.2 });
    g.t(X0 + (n - 1) * cw + (cw - 3) / 2, y + 54, 'lsb', { a: 'middle', c: 'g', fs: T });
    [['g', 0], ['r', 1], ['s', 2]].forEach(([k, i]) => g.t(xg + i * cw + (cw - 3) / 2, y + 17, { raw: k.toUpperCase() }, { a: 'middle', mono: true, fs: 15, c: i === 2 ? 'v' : 'c' }));
    g.t(xg + 130, y + 2, 'g', { c: 'c', fs: T }); g.t(xg + 130, y + 22, 'r', { c: 'c', fs: T });
    g.t(xg + 130, y + 42, 's', { c: 'v', fs: T }); g.t(xg + 130, y + 62, 'sx', { c: 'm', fs: T });
    g.line(xg + 2 * cw + 18, y + 34, xg + 124, y + 42, C.violet, { sw: 1 });
    const rows = [['c1', 'c1a'], ['c2', 'c2a'], ['c3', 'c3a']];
    g.line(40, 172, 680, 172, C.line, { sw: 1 });
    rows.forEach(([a, b], i) => { const yy = 198 + i * 32; g.t(40, yy, a, { fs: T }); g.t(330, yy, b, { c: i === 1 ? 'g' : 'm', fs: T }); });
    return [720, 276];
  }, g => {
    const X0 = 20, cw = 26, y = 52, n = 8;
    const xg = grsRow(g, X0, y, cw, n);
    g.t(X0 + (n * cw) / 2, 22, 'keep', { a: 'middle', c: 'g', fs: T });
    g.path(`M${X0},34 L${X0},40 L${X0 + n * cw - 3},40 L${X0 + n * cw - 3},34`, C.gold, { sw: 1.2 });
    g.t(X0 + (n - 1) * cw + (cw - 3) / 2, y + 52, 'lsb', { a: 'end', c: 'g', fs: T });
    [['g', 0], ['r', 1], ['s', 2]].forEach(([k, i]) => g.t(xg + i * cw + (cw - 3) / 2, y + 17, { raw: k.toUpperCase() }, { a: 'middle', mono: true, fs: T, c: i === 2 ? 'v' : 'c' }));
    // the three names, one per line under the cells
    g.t(20, 136, 'g', { c: 'c', fs: T }); g.t(20, 160, 'r', { c: 'c', fs: T }); g.t(20, 184, 's', { c: 'v', fs: T }); g.t(20, 208, 'sx', { c: 'm', fs: T });
    g.line(20, 232, 340, 232, C.line, { sw: 1 });
    [['c1', 'c1a'], ['c2', 'c2a'], ['c3', 'c3a']].forEach(([a, b], i) => { const yy = 256 + i * 54; g.t(20, yy, a, { fs: T }); g.t(36, yy + 24, b, { c: i === 1 ? 'g' : 'm', fs: T }); });
    return [360, 400];
  });

  /* ── fig 4 (ch4): the three cases of the exponent field, and the gap near zero ── */
  function zeroLines(g, X0, W, y1, y2, gapW) {
    const mn = X0 + gapW;
    // without subnormals: 0, then nothing until the smallest normal, then normals at the same spacing, doubling later
    g.line(X0, y1, X0 + W, y1, C.mute, { sw: 1.2 });
    g.line(X0, y1 - 10, X0, y1 + 10, C.ink, { sw: 2 });
    const step = gapW / 8;
    for (let i = 0; i <= 8; i++) g.line(mn + i * step, y1 - 8, mn + i * step, y1 + 8, C.cyan, { sw: 1.5 });
    for (let i = 1; i * 2 * step + mn + 8 * step <= X0 + W; i++) g.line(mn + 8 * step + i * 2 * step, y1 - 8, mn + 8 * step + i * 2 * step, y1 + 8, C.cyan, { sw: 1.5 });
    g.box(X0 + 4, y1 - 13, gapW - 8, 26, C.red, { a: 0.12, dash: '4 3', rx: 4 });
    // with subnormals: the gap holds evenly spaced values at the same spacing
    g.line(X0, y2, X0 + W, y2, C.mute, { sw: 1.2 });
    g.line(X0, y2 - 10, X0, y2 + 10, C.ink, { sw: 2 });
    for (let i = 1; i < 8; i++) g.line(X0 + i * step, y2 - 8, X0 + i * step, y2 + 8, C.violet, { sw: 1.5 });
    for (let i = 0; i <= 8; i++) g.line(mn + i * step, y2 - 8, mn + i * step, y2 + 8, C.cyan, { sw: 1.5 });
    for (let i = 1; i * 2 * step + mn + 8 * step <= X0 + W; i++) g.line(mn + 8 * step + i * 2 * step, y2 - 8, mn + 8 * step + i * 2 * step, y2 + 8, C.cyan, { sw: 1.5 });
    return mn;
  }
  figure('special', g => {
    const cols = [[20, 'e0', ['e0a', 'e0b'], C.violet], [255, 'en', ['ena', 'enb'], C.cyan], [490, 'e255', ['e255a', 'e255b'], C.red]];
    cols.forEach(([x, h, ls, col]) => {
      g.box(x, 16, 210, 104, col, { a: 0.1 });
      g.t(x + 14, 40, h, { mono: true, fs: 15, weight: 600 });
      ls.forEach((k, i) => g.t(x + 14, 70 + i * 26, k, { fs: T, c: i ? 'm' : '' }));
    });
    const mn = zeroLines(g, 60, 600, 196, 290, 160);
    g.t(60, 160, 'gap', { c: 'r', fs: T });
    g.t(60, 254, 'fill', { c: 'v', fs: T });
    [196, 290].forEach(y => { g.t(60, y + 26, 'z', { a: 'middle', mono: true, fs: T, c: 'm' }); g.t(mn, y + 26, 'mn', { a: 'middle', fs: T, c: 'c' }); });
    return [720, 330];
  }, g => {
    const rows = [['e0', ['e0a', 'e0b'], C.violet], ['en', ['ena', 'enb'], C.cyan], ['e255', ['e255a', 'e255b'], C.red]];
    rows.forEach(([h, ls, col], i) => {
      const y = 12 + i * 84;
      g.box(20, y, 320, 74, col, { a: 0.1 });
      g.t(34, y + 20, h, { mono: true, fs: T, weight: 600 });
      ls.forEach((k, j) => g.t(34, y + 42 + j * 20, k, { fs: T, c: j ? 'm' : '' }));
    });
    const mn = zeroLines(g, 30, 310, 322, 420, 96);
    g.t(20, 288, 'gap', { c: 'r', fs: T });
    g.t(20, 386, 'fill', { c: 'v', fs: T });
    [322, 420].forEach(y => { g.t(30, y + 24, 'z', { a: 'middle', mono: true, fs: T, c: 'm' }); g.t(mn, y + 24, 'mn', { a: 'middle', fs: T, c: 'c' }); });
    return [360, 462];
  });

  /* ── fig 5 (ch5): cancellation, in decimal ── */
  const A = '1.0000123', B = '1.0000101', Dd = '0.0000022';
  function digits(g, x0, y, s, pitch, cls, fsz) { [...s].forEach((ch, i) => g.t(x0 + i * pitch + pitch / 2, y, { raw: ch }, { a: 'middle', mono: true, fs: fsz, c: cls })); }
  function cancelBlock(g, x0, y0, pitch, fsz) {
    // digits: index 0 '1', 1 '.', 2..8 the fraction. The first six significant digits (1.00001) are indices 0..6.
    g.box(x0 - 2, y0 - 18, pitch * 7 + 4, 36 + 44, C.mute, { a: 0.08, dash: '4 3', rx: 6 });
    digits(g, x0, y0, A, pitch, '', fsz); digits(g, x0, y0 + 44, B, pitch, '', fsz);
    g.box(x0 + 8 * pitch - 1, y0 - 16, pitch + 2, 32, C.red, { a: 0.18, rx: 4 }); g.box(x0 + 8 * pitch - 1, y0 + 28, pitch + 2, 32, C.red, { a: 0.18, rx: 4 });
    g.t(x0 - pitch, y0 + 44, { raw: '−' }, { a: 'middle', mono: true, fs: fsz });
    g.line(x0 - pitch * 1.5, y0 + 72, x0 + 9 * pitch + 4, y0 + 72, C.ink, { sw: 1.4 });
    digits(g, x0, y0 + 100, Dd, pitch, 'm', fsz);
    g.box(x0 + 7 * pitch - 1, y0 + 84, pitch * 2 + 2, 32, C.gold, { a: 0.18, rx: 4 });
    g.box(x0 + 8 * pitch + 1, y0 + 86, pitch - 2, 28, C.red, { a: 0.3, rx: 3 });
    return { xr: x0 + 9 * pitch };
  }
  figure('cancel', g => {
    const { xr } = cancelBlock(g, 70, 40, 22, 20);
    const xa = xr + 60;
    g.t(xa, 62, 'same', { c: 'm', fs: T }); g.line(xa - 8, 62, 70 + 7 * 22 + 6, 62, C.mute, { sw: 1, dash: '3 3' });
    g.t(xa, 100, 'err', { c: 'r', fs: T }); g.line(xa - 8, 100, xr + 4, 84, C.red, { sw: 1 });
    g.t(xa, 140, 'res', { c: 'g', fs: T }); g.line(xa - 8, 140, xr + 4, 140, C.gold, { sw: 1 });
    return [720, 180];
  }, g => {
    cancelBlock(g, 72, 34, 22, 18);
    g.t(20, 182, 'same', { c: 'm', fs: T });
    g.t(20, 208, 'err', { c: 'r', fs: T });
    g.t(20, 234, 'res', { c: 'g', fs: T });
    return [360, 254];
  });

  /* ── fig 6 (ch6): mul + add vs fused multiply–add ── */
  function flow(g, cx, y0, steps, bw) {
    // steps: [kind, key, colour]; kind 'box' draws a box with a label, 'note' a label beside the arrow
    let y = y0;
    steps.forEach(([kind, key, col], i) => {
      if (kind === 'box') { g.box(cx - bw / 2, y, bw, 34, col, { a: 0.15 }); g.t(cx, y + 17, key, { a: 'middle', fs: T }); y += 34; }
      else if (kind === 'in') { g.t(cx, y + 10, key, { a: 'middle', fs: T, c: 'm' }); y += 20; }
      else if (kind === 'note') { g.t(cx, y + 14, key, { a: 'middle', fs: T, c: col === C.gold ? 'g' : 'c' }); y += 28; }
      if (i < steps.length - 1) { g.line(cx, y + 2, cx, y + 18, C.mute, { arrow: true, sw: 1.3 }); y += 22; }
    });
    return y;
  }
  const sepSteps = [['in', 'in'], ['box', 'mul', C.cyan], ['box', 'rnd', C.red], ['note', 'p24', C.gold], ['box', 'add', C.cyan], ['box', 'rnd', C.red], ['in', 'out']];
  const fusSteps = [['in', 'in'], ['box', 'mul', C.cyan], ['note', 'full', C.cyan], ['box', 'add', C.cyan], ['box', 'rnd', C.red], ['in', 'out']];
  function cIn(g, cx, y, bw) { g.t(cx + bw / 2 + 40, y + 17, 'c', { a: 'middle', mono: true, fs: T, c: 'm' }); g.line(cx + bw / 2 + 30, y + 17, cx + bw / 2 + 4, y + 17, C.mute, { arrow: true, sw: 1.3 }); }
  figure('fma', g => {
    g.t(180, 20, 'sep', { a: 'middle', fs: 15, weight: 600 }); g.t(540, 20, 'fus', { a: 'middle', fs: 15, weight: 600, c: 'g' });
    flow(g, 180, 40, sepSteps, 120); flow(g, 540, 40, fusSteps, 120);
    // c enters the adder: sep adder is the 3rd box (y = 40+20+22 + (34+22)*2 + 28+22) ; compute directly
    cIn(g, 180, 40 + 20 + 22 + 56 + 56 + 50, 120); cIn(g, 540, 40 + 20 + 22 + 56 + 50, 120);
    g.line(360, 36, 360, 380, C.line, { sw: 1 });
    return [720, 386];
  }, g => {
    g.t(92, 18, 'sep', { a: 'middle', fs: T, weight: 600 }); g.t(270, 18, 'fus', { a: 'middle', fs: T, weight: 600, c: 'g' });
    flow(g, 80, 40, sepSteps, 80); flow(g, 262, 40, fusSteps, 80);
    cIn(g, 80, 40 + 20 + 22 + 56 + 56 + 50, 80); cIn(g, 262, 40 + 20 + 22 + 56 + 50, 80);
    g.line(181, 36, 181, 380, C.line, { sw: 1 });
    return [360, 386];
  });

  /* ── fig 7 (ch7): bit layouts of six formats ── */
  const LAY = [['FP32', 'fp32'], ['FP16', 'fp16'], ['BF16', 'bf16'], ['E5M2', 'e5m2'], ['E4M3', 'e4m3'], ['E2M1', 'e2m1']];
  const maxStr = fk => { const v = M.FMT[fk].max; return v >= 1e5 ? M.sci(v, 1) : M.fmt(v, 0, 'en'); };
  function fmtBar(g, x, y, ppb, fk, h) {
    const F = M.FMT[fk]; const segs = [[1, C.red], [F.eb, C.cyan], [F.mb, C.gold]];
    let xx = x;
    segs.forEach(([n, col]) => { const w = n * ppb; g.box(xx, y, w - 2, h, col, { rx: 3, a: 0.22 }); if (w - 2 >= 10) g.t(xx + (w - 2) / 2, y + h / 2, { raw: String(n) }, { a: 'middle', mono: true, fs: T }); xx += w; });
  }
  figure('formats', g => {
    g.t(20, 18, 'name', { c: 'm', fs: T }); g.t(700, 18, 'range', { a: 'end', c: 'm', fs: T });
    LAY.forEach(([nm, fk], i) => {
      const y = 38 + i * 44;
      g.t(20, y + 15, { raw: nm }, { mono: true, fs: 15 });
      fmtBar(g, 100, y, 15.6, fk, 30);
      g.t(700, y + 15, { raw: maxStr(fk) }, { a: 'end', mono: true, fs: T, c: 'm' });
    });
    return [720, 304];
  }, g => {
    g.t(20, 16, 'name', { c: 'm', fs: T }); g.t(340, 16, 'range', { a: 'end', c: 'm', fs: T });
    LAY.forEach(([nm, fk], i) => {
      const y = 36 + i * 62;
      g.t(20, y + 10, { raw: nm }, { mono: true, fs: T });
      g.t(340, y + 10, { raw: maxStr(fk) }, { a: 'end', mono: true, fs: T, c: 'm' });
      fmtBar(g, 20, y + 24, 10, fk, 26);
    });
    return [360, 404];
  });

  /* ── fig 8 (ch8): one scale per tensor vs one per 32-value block ── */
  function cells(g, x, y, n, cw, h, outAt) { for (let i = 0; i < n; i++) g.box(x + i * cw, y, cw - 2, h, i === outAt ? C.red : C.gold, { rx: 2, a: i === outAt ? 0.6 : 0.2, sw: 1 }); }
  figure('mx', g => {
    g.t(20, 20, 'tensor', { fs: 15, weight: 600 });
    g.box(20, 40, 64, 34, C.violet, { a: 0.25 }); g.t(52, 57, 'scale', { a: 'middle', fs: T });
    cells(g, 96, 40, 32, 18.75, 34, 13);
    g.t(96 + 13 * 18.75 + 8, 96, 'out', { a: 'middle', c: 'r', fs: T });
    g.line(96 + 13 * 18.75 + 8, 86, 96 + 13 * 18.75 + 8, 78, C.red, { sw: 1 });
    // four blocks
    const y = 150;
    for (let b = 0; b < 4; b++) {
      const x = 20 + b * 172;
      g.box(x, y, 34, 34, C.violet, { a: 0.25 });
      cells(g, x + 38, y, 8, 15.5, 34, b === 1 ? 3 : -1);
      if (b === 1) g.box(x - 4, y - 6, 166, 46, C.red, { a: 0.05, dash: '4 3' });
    }
    g.path(`M20,${y + 44} L20,${y + 50} L186,${y + 50} L186,${y + 44}`, C.mute, { sw: 1.2 });
    g.t(103, y + 70, 'blk', { a: 'middle', fs: T });
    g.t(37, y - 16, 'e8', { c: 'v', fs: T });
    g.t(20, y + 104, 'elem', { c: 'g', fs: T });
    g.t(364, y + 70, 'hurt', { c: 'r', fs: T });
    return [720, 274];
  }, g => {
    g.t(20, 18, 'tensor', { fs: T, weight: 600 });
    g.box(20, 36, 48, 30, C.violet, { a: 0.25 }); g.t(44, 51, 'scale', { a: 'middle', fs: T });
    cells(g, 74, 36, 16, 16.6, 30, 6);
    g.t(74 + 6 * 16.6 + 7, 88, 'out', { a: 'middle', c: 'r', fs: T });
    g.line(74 + 6 * 16.6 + 7, 78, 74 + 6 * 16.6 + 7, 70, C.red, { sw: 1 });
    g.t(20, 132, 'e8', { c: 'v', fs: T });
    for (let b = 0; b < 4; b++) {
      const x = 20 + (b % 2) * 166, y = 150 + Math.floor(b / 2) * 52;
      g.box(x, y, 26, 30, C.violet, { a: 0.25 });
      cells(g, x + 30, y, 8, 15.5, 30, b === 1 ? 3 : -1);
      if (b === 1) g.box(x - 3, y - 5, 160, 40, C.red, { a: 0.05, dash: '4 3' });
    }
    g.t(20, 270, 'blk', { fs: T });
    g.t(20, 296, 'elem', { c: 'g', fs: T });
    g.t(20, 322, 'hurt', { c: 'r', fs: T });
    return [360, 340];
  });

  /* ── fig 9 (ch9): lanes of a 512-bit register, and a masked vector add ── */
  const LANE_ROWS = [['f64', 8, C.violet], ['f32', 16, C.cyan], ['f16', 32, C.green], ['i8', 64, C.gold]];
  const VA = ['3', '1', '4', '1', '5', '9', '2', '6'], VB = ['2', '7', '1', '8', '2', '8', '1', '8'], KM = [1, 1, 0, 1, 1, 0, 1, 1];
  function addRows(g, x0, y0, cw, labelX, labelAnchor) {
    const rows = [[VA, ''], [VB, '']];
    rows.forEach(([r], j) => r.forEach((d, i) => { g.box(x0 + i * cw, y0 + j * 38, cw - 3, 30, C.cyan, { rx: 3, a: 0.12, sw: 1 }); g.t(x0 + i * cw + (cw - 3) / 2, y0 + j * 38 + 15, { raw: d }, { a: 'middle', mono: true, fs: T }); }));
    g.t(x0 - 14, y0 + 38 + 15, { raw: '+' }, { a: 'middle', mono: true, fs: 16 });
    KM.forEach((k, i) => g.t(x0 + i * cw + (cw - 3) / 2, y0 + 96, { raw: String(k) }, { a: 'middle', mono: true, fs: T, c: k ? 'g' : 'r' }));
    g.line(x0, y0 + 116, x0 + 8 * cw - 3, y0 + 116, C.ink, { sw: 1.2 });
    VA.forEach((d, i) => {
      const on = KM[i];
      g.box(x0 + i * cw, y0 + 124, cw - 3, 30, on ? C.gold : C.dim, { rx: 3, a: on ? 0.25 : 0.15, sw: 1, dash: on ? null : '3 3' });
      if (on) g.t(x0 + i * cw + (cw - 3) / 2, y0 + 139, { raw: String(+d + +VB[i]) }, { a: 'middle', mono: true, fs: T });
    });
    g.t(labelX, y0 + 96, 'k', { a: labelAnchor, c: 'g', fs: T });
    return x0 + 2 * cw + (cw - 3) / 2; // x of an off lane
  }
  figure('lanes', g => {
    g.t(20, 18, 'reg', { fs: 15, weight: 600 });
    LANE_ROWS.forEach(([k, n, col], i) => {
      const y = 36 + i * 36, x0 = 170, W = 530;
      g.t(20, y + 13, k, { fs: T });
      for (let j = 0; j < n; j++) g.box(x0 + j * W / n, y, W / n - 1.5, 26, col, { rx: 2, a: 0.22, sw: 0.8 });
    });
    g.t(20, 200, 'add', { fs: 15, weight: 600 });
    const xo = addRows(g, 210, 220, 44, 196, 'end');
    g.t(xo, 404, 'off', { a: 'middle', c: 'r', fs: T });
    g.line(xo, 392, xo, 378, C.red, { sw: 1 });
    return [720, 420];
  }, g => {
    g.t(20, 16, 'reg', { fs: T, weight: 600 });
    LANE_ROWS.forEach(([k, n, col], i) => {
      const y = 36 + i * 52, x0 = 20, W = 320;
      g.t(20, y + 6, k, { fs: T });
      for (let j = 0; j < n; j++) g.box(x0 + j * W / n, y + 18, W / n - 1, 22, col, { rx: 2, a: 0.22, sw: 0.7 });
    });
    g.t(20, 252, 'add', { fs: T, weight: 600 });
    const xo = addRows(g, 82, 272, 32, 20, 'start');
    g.t(xo, 454, 'off', { a: 'middle', c: 'r', fs: T });
    g.line(xo, 442, xo, 430, C.red, { sw: 1 });
    return [360, 470];
  });

  /* ── fig 10 (ch10): 19 values over 8 lanes, and a gather ── */
  function vecRow(g, x0, y, cw, on, start) {
    for (let i = 0; i < 8; i++) {
      const a = i < on;
      g.box(x0 + i * cw, y, cw - 3, 30, a ? C.cyan : C.dim, { rx: 3, a: a ? 0.2 : 0.1, sw: 1, dash: a ? null : '3 3' });
      if (a) g.t(x0 + i * cw + (cw - 3) / 2, y + 15, { raw: String(start + i) }, { a: 'middle', mono: true, fs: T });
    }
  }
  function gather(g, x0, y, cw, memN) {
    const idx = [2, 9, 5, 13];
    for (let i = 0; i < memN; i++) g.box(x0 + i * cw, y + 96, cw - 2, 28, idx.includes(i) ? C.gold : C.dim, { rx: 2, a: idx.includes(i) ? 0.35 : 0.12, sw: 1 });
    idx.forEach((m, i) => {
      g.box(x0 + i * 2 * cw, y, 2 * cw - 3, 30, C.violet, { rx: 3, a: 0.2, sw: 1 });
      g.t(x0 + i * 2 * cw + cw - 1.5, y + 15, { raw: String(m) }, { a: 'middle', mono: true, fs: T });
      g.line(x0 + i * 2 * cw + cw - 1.5, y + 32, x0 + m * cw + (cw - 2) / 2, y + 92, C.gold, { arrow: true, sw: 1.2 });
    });
  }
  figure('tail', g => {
    [['v1', 8, 0], ['v2', 8, 8], ['v3', 3, 16]].forEach(([k, on, s], i) => { const y = 16 + i * 42; g.t(20, y + 15, k, { fs: T, c: i === 2 ? 'g' : '' }); vecRow(g, 300, y, 46, on, s); });
    g.line(20, 150, 700, 150, C.line, { sw: 1 });
    g.t(20, 186, 'idx', { fs: T, c: 'v' });
    g.t(20, 222, 'gat', { fs: T, c: 'g' });
    g.t(20, 282, 'mem', { fs: T, c: 'm' });
    gather(g, 300, 170, 25, 16);
    return [720, 310];
  }, g => {
    [['v1', 8, 0], ['v2', 8, 8], ['v3', 3, 16]].forEach(([k, on, s], i) => { const y = 14 + i * 64; g.t(20, y, k, { fs: T, c: i === 2 ? 'g' : '' }); vecRow(g, 20, y + 14, 40, on, s); });
    g.line(20, 210, 340, 210, C.line, { sw: 1 });
    g.t(20, 232, 'idx', { fs: T, c: 'v' });
    gather(g, 20, 248, 20, 16);
    g.t(20, 400, 'mem', { fs: T, c: 'm' });
    g.t(20, 426, 'gat', { fs: T, c: 'g' });
    return [360, 444];
  });

  /* ── fig 11 (ch11): FMA issue with 1 vs 8 accumulators (the model's own trace) ── */
  const tr1 = M.fmaTrace(1, M.SRC.fma.lat, 2, 4, 1, 16), tr8 = M.fmaTrace(8, M.SRC.fma.lat, 2, 4, 1, 16);
  function pipeGrid(g, x0, y, cw, n, tr, labelX) {
    [0, 1].forEach(u => {
      g.t(labelX, y + u * 30 + 13, 'u' + u, { fs: T, c: 'm' });
      for (let t = 0; t < n; t++) {
        const j = tr[t][u];
        g.box(x0 + t * cw, y + u * 30, cw - 3, 26, j == null ? C.dim : C.gold, { rx: 3, a: j == null ? 0.12 : 0.3, sw: 1 });
        if (j != null) g.t(x0 + t * cw + (cw - 3) / 2, y + u * 30 + 13, { raw: String(j) }, { a: 'middle', mono: true, fs: T });
      }
    });
  }
  figure('pipe', g => {
    g.t(20, 20, 'one', { fs: 15, weight: 600 });
    pipeGrid(g, 110, 36, 36, 16, tr1, 20);
    g.path(`M${110 + 13},${30} C${110 + 50},${10} ${110 + 4 * 36 - 22},${10} ${110 + 4 * 36 + 13},${30}`, C.red, { arrow: true, sw: 1.2 });
    g.t(110 + 4 * 36 + 22, 16, 'wait', { a: 'start', c: 'r', fs: T }); // beside the arc's head, not on it
    g.t(20, 126, 'eight', { fs: 15, weight: 600 });
    pipeGrid(g, 110, 142, 36, 16, tr8, 20);
    g.line(110, 214, 110 + 16 * 36 - 3, 214, C.mute, { arrow: true, sw: 1.2 });
    g.t(110 + 16 * 36 - 3, 234, 'cyc', { a: 'end', c: 'm', fs: T });
    return [720, 250];
  }, g => {
    g.t(20, 16, 'one', { fs: T, weight: 600 });
    g.t(340, 16, 'wait', { a: 'end', c: 'r', fs: T });
    pipeGrid(g, 82, 34, 21.5, 12, tr1, 20);
    g.t(20, 122, 'eight', { fs: T, weight: 600 });
    pipeGrid(g, 82, 140, 21.5, 12, tr8, 20);
    g.line(82, 208, 82 + 12 * 21.5 - 3, 208, C.mute, { arrow: true, sw: 1.2 });
    g.t(82 + 12 * 21.5 - 3, 228, 'cyc', { a: 'end', c: 'm', fs: T });
    return [360, 244];
  });

  /* ── fig 12 (ch12): the same SVE loop on 128-, 256- and 512-bit hardware, 10 elements ── */
  function vlaGroup(g, x0, y, cw, vl, N) {
    const r = M.vla(vl, N); let yy = y;
    r.rows.forEach(act => { for (let i = 0; i < r.lanes; i++) g.box(x0 + i * cw, yy, cw - 2, 18, i < act ? C.cyan : C.dim, { rx: 2, a: i < act ? 0.45 : 0.08, sw: 1, dash: i < act ? null : '3 2' }); yy += 22; });
    return yy;
  }
  figure('vla', g => {
    g.t(360, 16, 'same', { a: 'middle', fs: 15, weight: 600, c: 'g' });
    let y = 44;
    [[128, 'h128'], [256, 'h256'], [512, 'h512']].forEach(([vl, k]) => { g.t(20, y + 9, k, { fs: T }); y = vlaGroup(g, 230, y, 28, vl, 10) + 16; });
    return [720, y];
  }, g => {
    g.t(20, 14, 'same', { fs: T, weight: 600, c: 'g' });
    let y = 34;
    [[128, 'h128'], [256, 'h256'], [512, 'h512']].forEach(([vl, k]) => { g.t(20, y + 6, k, { fs: T }); y = vlaGroup(g, 20, y + 20, 20, vl, 10) + 14; });
    return [360, y];
  });

  /* ── fig 13 (ch12): outer product into a tile ── */
  function outerDraw(g, x0, y0, cs) {
    for (let i = 0; i < 4; i++) {
      g.box(x0 + (i + 1) * cs + 8, y0, cs - 4, cs - 4, C.gold, { rx: 3, a: 0.3 });
      g.box(x0, y0 + (i + 1) * cs + 8, cs - 4, cs - 4, C.cyan, { rx: 3, a: 0.3 });
      for (let j = 0; j < 4; j++) g.box(x0 + (j + 1) * cs + 8, y0 + (i + 1) * cs + 8, cs - 4, cs - 4, C.violet, { rx: 3, a: 0.25 });
    }
    g.t(x0 + (cs - 4) / 2, y0 + (cs - 4) / 2, { raw: '×' }, { a: 'middle', mono: true, fs: 18, c: 'm' });
    return { right: x0 + 5 * cs + 8, bottom: y0 + 5 * cs + 8 };
  }
  figure('outer', g => {
    const { right, bottom } = outerDraw(g, 60, 20, 44);
    g.t(right + 30, 40, 'row', { c: 'g', fs: T });
    g.t(right + 30, 70, 'col', { c: 'c', fs: T });
    g.t(right + 30, 130, 'tile', { c: 'v', fs: T });
    g.t(right + 30, 180, 'cnt', { fs: 15, weight: 600 });
    return [720, bottom + 14];
  }, g => {
    const { bottom } = outerDraw(g, 70, 12, 40);
    g.t(20, bottom + 20, 'row', { c: 'g', fs: T });
    g.t(20, bottom + 44, 'col', { c: 'c', fs: T });
    g.t(20, bottom + 68, 'tile', { c: 'v', fs: T });
    g.t(20, bottom + 96, 'cnt', { fs: T, weight: 600 });
    return [360, bottom + 112];
  });

  /* ── table 1 (ch7): the format table, computed from the models (a static ::: html partial) ── */
  const p2 = x => { const k = Math.log2(x); return Number.isInteger(k) ? M.pow2s(k) : M.sci(x, 2); };
  const val = x => (x >= 1e5 || x < 1e-3 ? M.sci(x, 2) : M.fmt(x, x < 1 ? 4 : x < 10 ? 1 : 0, 'en').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''));
  const NM = { fp64: 'FP64', fp32: 'FP32', tf32: 'TF32', fp16: 'FP16', bf16: 'BF16', e5m2: 'E5M2', e4m3: 'E4M3', e3m2: 'E3M2', e2m3: 'E2M3', e2m1: 'E2M1' };
  const cols = ['fmt', 'bits', 'exp', 'man', 'max', 'minN', 'minS', 'eps', 'dig', 'span', 'inf'];
  const rows = M.formatTable().map(r => `<tr><td>${NM[r.fk]}</td><td>${r.bits}</td><td>${r.eb}</td><td>${r.mb}</td><td>${val(r.max)}</td><td>${p2(r.minNormal)}</td><td>${p2(r.minSub)}</td><td>${p2(r.eps)}</td><td>${M.fmt(r.digits, 1, 'en')}</td><td>${M.fmt(r.binades, 1, 'en')}</td><td data-i18n="tbl.${r.inf ? 'yes' : 'no'}"></td></tr>`).join('');
  const html = `<figure class="dia tbl" id="fmt-table"><div class="tblwrap" tabindex="0" role="region" data-i18n-aria="tbl.aria"><table class="fmt"><thead><tr>${cols.map(c => `<th scope="col" data-i18n="tbl.${c}"></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><figcaption data-i18n-html="tbl.cap"></figcaption></figure>`;
  fs.writeFileSync(path.join(__dirname, '..', 'figures', 'fmt-table.html'), html + '\n');
};
