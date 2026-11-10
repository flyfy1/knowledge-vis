'use strict';
// Contour lines lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every line, height and readout comes from window.CONTOUR_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and the 50 / 100 index labels on the step 1 map; sentences and legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.CONTOUR_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', faint: '#4f6a86', ghost: '#8696aa', panel: '#121a24' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point; −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
// Fixed decimals for readouts (no trimming, so precision stays visible).
const fx = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  // Map and 3-D canvases shrink to what their drawing needs when stacked on a narrow screen.
  let height = Number(canvas.dataset.h);
  if (canvas.dataset.fit === 'map') height = Math.min(height, Math.round(width + 24));
  else if (canvas.dataset.fit === '3d') height = Math.min(height, Math.round(Number(canvas.dataset.top) + (width - 20) * TILT / 0.64 + 12));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Panel title: shrink the font until it fits (never overflows the canvas).
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// x–y plot panel: title row above, y ticks left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [1, 2, 5, 10, 20, 50, 100, 200, 500]);
  const first = Math.ceil((o.xMin - 1e-9) / step) * step;
  ctx.textAlign = 'center';
  if (!o.noXTicks) for (let v = first; v <= o.xMax + 1e-9; v += step) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(fmt(v, 2), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill();
  if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore();
}
/* ---------- terrain drawing shared by every step ---------- */
const GA = M.grid(M.hillA, 100), GB = M.grid(M.hillB, 120);
const GRID = { A: GA, B: GB }, FN = { A: M.hillA, B: M.hillB };
const RANGE = { A: [10, 125], B: [0, 200] };
const cCache = new Map();
const contourOf = (land, L) => { const k = land + L; if (!cCache.has(k)) cCache.set(k, M.contour(GRID[land], L)); return cCache.get(k); };
// Hypsometric tint: green lowland → khaki → brown → pale summit.
const STOPS = [[0, [62, 102, 70]], [0.35, [128, 140, 82]], [0.65, [150, 118, 78]], [1, [206, 196, 178]]];
function tint(h, land, shade = 1) {
  const [lo, hi] = RANGE[land], s = Math.max(0, Math.min(1, (h - lo) / (hi - lo)));
  let k = 1; while (k < STOPS.length - 1 && STOPS[k][0] < s) k++;
  const [s0, c0] = STOPS[k - 1], [s1, c1] = STOPS[k], u = (s - s0) / (s1 - s0);
  return c0.map((v, i) => Math.round((v + (c1[i] - v) * u) * shade));
}
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

// Square map inside a canvas, title row above it.
function mapFrame(W, H, top = 30) {
  const S = Math.min(W - 16, H - top - 10), ox = (W - S) / 2, oy = top;
  return { S, ox, oy, X: x => ox + x * S, Y: y => oy + (1 - y) * S, inv: (px, py) => [(px - ox) / S, 1 - (py - oy) / S] };
}
const tintCache = new Map();
function drawMapBase(ctx, F, land) {
  const n = 100, key = land + Math.round(F.S);
  if (!tintCache.has(key)) {
    const off = document.createElement('canvas'); off.width = n; off.height = n; const o = off.getContext('2d'), img = o.createImageData(n, n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = tint(FN[land]((i + 0.5) / n, 1 - (j + 0.5) / n), land, 0.55), p = (j * n + i) * 4; img.data[p] = c[0]; img.data[p + 1] = c[1]; img.data[p + 2] = c[2]; img.data[p + 3] = 255; }
    o.putImageData(img, 0, 0); tintCache.set(key, off);
  }
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(tintCache.get(key), F.ox, F.oy, F.S, F.S);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(F.ox, F.oy, F.S, F.S); ctx.restore();
}
function drawSegs(ctx, F, segs, color, lw, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.beginPath();
  segs.forEach(([p, q]) => { ctx.moveTo(F.X(p[0]), F.Y(p[1])); ctx.lineTo(F.X(q[0]), F.Y(q[1])); }); ctx.stroke(); ctx.restore();
}
// Contour set: index lines (multiples of `index`) thicker.
function drawContours(ctx, F, land, levels, index) {
  levels.forEach(L => { const idx = index && L % index === 0; drawSegs(ctx, F, contourOf(land, L), idx ? '#f2f5f9' : '#c3cedb', idx ? 2.2 : 1, idx ? 1 : 0.85); });
}
function mapPoint(ctx, F, x, y, col, r = 6) { dot(ctx, F.X(x), F.Y(y), r, col, true); }
function clickToMap(canvas, ev) {
  const r = canvas.getBoundingClientRect(), F = mapFrame(r.width, r.height);
  const p = F.inv(ev.clientX - r.left, ev.clientY - r.top);
  return p[0] >= 0 && p[0] <= 1 && p[1] >= 0 && p[1] <= 1 ? p : null;
}

/* 3-D view seen from the south-east, heights exaggerated so the relief reads. */
const N3 = 44, ANG = 32 * Math.PI / 180, CA = Math.cos(ANG), SA = Math.sin(ANG), TILT = 0.5;
const H3 = { A: [], B: [] };
['A', 'B'].forEach(land => { for (let j = 0; j <= N3; j++) { const r = []; for (let i = 0; i <= N3; i++) r.push(FN[land](i / N3, j / N3)); H3[land].push(r); } });
const ORDER = []; for (let j = 0; j < N3; j++) for (let i = 0; i < N3; i++) ORDER.push([i, j]);
const depthOf = (u, v) => -u * SA + v * CA; // west and north are farther away
ORDER.sort((a, b) => depthOf((b[0] + 0.5) / N3 - 0.5, (b[1] + 0.5) / N3 - 0.5) - depthOf((a[0] + 0.5) / N3 - 0.5, (a[1] + 0.5) / N3 - 0.5));
function view3D(W, top, bottom, land) {
  const ext = 0.5 * (CA + SA), avail = bottom - top, zFrac = 0.36;
  const k = Math.min((W / 2 - 10) / ext, avail * (1 - zFrac) / (2 * ext * TILT));
  const [lo, hi] = RANGE[land], kz = avail * zFrac / (hi - lo);
  const cx = W / 2, cy = bottom - ext * k * TILT - 4;
  return { P: (x, y, z) => { const u = x - 0.5, v = y - 0.5; return [cx + (u * CA + v * SA) * k, cy - depthOf(u, v) * k * TILT - (z - lo) * kz]; }, lo };
}
// opts: water (level), levels (white lines), hi (orange line level), index
function draw3D(ctx, V, land, opts = {}) {
  const Hh = H3[land], f = FN[land], n = N3;
  ctx.save(); ctx.lineJoin = 'round';
  for (const [i, j] of ORDER) {
    const x0 = i / n, x1 = (i + 1) / n, y0 = j / n, y1 = (j + 1) / n;
    const v = [Hh[j][i], Hh[j][i + 1], Hh[j + 1][i + 1], Hh[j + 1][i]];
    const wl = opts.water, under = wl !== undefined && (v[0] + v[1] + v[2] + v[3]) / 4 < wl;
    const z = v.map(h => (wl !== undefined ? Math.max(h, wl) : h));
    const pts = [V.P(x0, y0, z[0]), V.P(x1, y0, z[1]), V.P(x1, y1, z[2]), V.P(x0, y1, z[3])];
    let col;
    if (under) col = [47, 111, 168];
    else {
      const gx = (v[1] + v[2] - v[0] - v[3]) / 2 * n / 1000 * 3, gy = (v[3] + v[2] - v[0] - v[1]) / 2 * n / 1000 * 3, L = Math.hypot(gx, gy, 1);
      const shade = 0.62 + 0.38 * Math.max(0, (gx * 0.55 - gy * 0.55 + 0.63) / L);
      col = tint((v[0] + v[1] + v[2] + v[3]) / 4, land, shade);
    }
    ctx.fillStyle = rgb(col); ctx.strokeStyle = rgb(col); ctx.lineWidth = 0.8;
    ctx.beginPath(); pts.forEach(([X, Y], q) => (q ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.closePath(); ctx.fill(); ctx.stroke();
    const segLines = (L, color, lw) => { M.cellSegs(v, x0, x1, y0, y1, L).forEach(([p, q]) => { const a = V.P(p[0], p[1], L), b = V.P(q[0], q[1], L); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }); };
    (opts.levels || []).forEach(L => { if (L !== opts.hi) segLines(L, opts.index && L % opts.index === 0 ? 'rgba(242,245,249,0.95)' : 'rgba(232,237,244,0.6)', opts.index && L % opts.index === 0 ? 1.6 : 0.9); });
    if (opts.hi !== undefined) segLines(opts.hi, C.orange, 2.6);
  }
  ctx.restore();
}
function pin3D(ctx, V, land, x, y, col) {
  const h = FN[land](x, y), a = V.P(x, y, V.lo), b = V.P(x, y, h), top = [b[0], b[1] - 26];
  line(ctx, [b, top], col, 2); line(ctx, [a, b], col, 1, [2, 3], 0.6); dot(ctx, b[0], b[1], 4, col, true); dot(ctx, top[0], top[1], 5, col, true);
}
function path3D(ctx, V, land, path, col) { line(ctx, path.filter(p => p[0] >= 0 && p[0] <= 1 && p[1] >= 0 && p[1] <= 1).map(([x, y]) => V.P(x, y, FN[land](x, y) + 1)), col, 2.2); }

/* ---------- step 0: flood the hill ---------- */
const s0 = { seen: new Set([20]) };
function draw0() {
  const h = num('w0');
  $('w0v').textContent = String(h);
  let { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 18, W - 16);
  const V = view3D(W, 30, H - 8, 'A');
  draw3D(ctx, V, 'A', { water: h, hi: h });
  ({ ctx, W, H } = fitCanvas($('c0b')));
  title(ctx, t('c0b'), 8, 18, W - 16);
  const F = mapFrame(W, H);
  drawMapBase(ctx, F, 'A');
  const old = [...s0.seen].filter(L => L !== h).sort((a, b) => a - b);
  drawContours(ctx, F, 'A', old, 0);
  drawSegs(ctx, F, contourOf('A', h), C.orange, 2.8);
  const segs = contourOf('A', h), pcs = M.pieces(segs), list = [...s0.seen].sort((a, b) => a - b);
  const shape = !segs.length ? t('shapeNone') : pcs.length === 1 ? t('shapeOne') : t('shapeMany', { k: pcs.length });
  $('r0').textContent = t('s0readout', { h, len: fx(Math.round(M.segLength(segs) / 10) * 10, 0), shape, n: list.length, list: list.join(window.LESSON_I18N.getLang() === 'zh' ? '、' : ', ') });
}

/* ---------- step 1: read a height ---------- */
const s1 = { x: 0.3, y: 0.5 };
const LEVELS_A10 = []; for (let L = 20; L <= 120; L += 10) LEVELS_A10.push(L);
// where a contour level crosses the row y = 0.5 west of the summit (label positions)
function westCross(L) { let lo = 0, hi = M.A.peak[0]; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (M.hillA(m, 0.5) < L) lo = m; else hi = m; } return (lo + hi) / 2; }
function tag(ctx, X, Y, text) {
  ctx.save(); ctx.font = '600 11px system-ui,sans-serif'; const w = ctx.measureText(text).width + 8;
  ctx.fillStyle = 'rgba(13,22,33,0.88)'; ctx.fillRect(X - w / 2, Y - 8, w, 16); ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.fillText(text, X, Y + 4); ctx.restore();
}
function draw1() {
  const x = s1.x, y = s1.y, h = M.hillA(x, y);
  $('x1').value = Math.round(x * 1000); $('y1').value = Math.round(y * 1000);
  $('x1v').textContent = String(Math.round(x * 1000)); $('y1v').textContent = String(Math.round(y * 1000));
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 18, W - 16);
  const F = mapFrame(W, H);
  drawMapBase(ctx, F, 'A'); drawContours(ctx, F, 'A', LEVELS_A10, 50);
  [50, 100].forEach(L => tag(ctx, F.X(westCross(L)), F.Y(0.5), String(L)));
  mapPoint(ctx, F, x, y, C.pink, 6.5);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  title(ctx, t('c1b'), 8, 18, W - 16);
  const V = view3D(W, 56, H - 8, 'A');
  draw3D(ctx, V, 'A', { levels: LEVELS_A10, index: 50 });
  pin3D(ctx, V, 'A', x, y, C.pink);
  const [lo, hi] = M.bracket(h, 10);
  const where = lo < 20 ? t('whereBelow', { hi: 20 }) : hi > 120 ? t('whereTop', { lo: 120, hi: 130 }) : t('whereBetween', { lo, hi });
  $('r1').textContent = t('s1readout', { x: Math.round(x * 1000), y: Math.round(y * 1000), where, h: fx(h, 1) });
}

/* ---------- step 2: crowded or sparse ---------- */
const PROF = M.profile(M.hillA, [0, 0.5], [1, 0.5], 400);
function draw2() {
  const xm = num('p2'), x = xm / 1000, h = M.hillA(x, 0.5), sl = M.slope(M.hillA, x, 0.5), dhdx = sl.g[0] / 1000;
  $('p2v').textContent = String(xm);
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 18, W - 16);
  const F = mapFrame(W, H);
  drawMapBase(ctx, F, 'A'); drawContours(ctx, F, 'A', LEVELS_A10, 50);
  line(ctx, [[F.X(0), F.Y(0.5)], [F.X(1), F.Y(0.5)]], C.text, 1.4, [6, 4]);
  // crossings on the cut
  const cross = []; for (let k = 1; k < PROF.length; k++) { const a = PROF[k - 1], b = PROF[k]; LEVELS_A10.forEach(L => { if ((a.h - L) * (b.h - L) < 0) cross.push(a.x + (b.x - a.x) * (L - a.h) / (b.h - a.h)); }); }
  cross.forEach(cx => dot(ctx, F.X(cx), F.Y(0.5), 3, '#ffe066'));
  mapPoint(ctx, F, x, 0.5, C.pink, 6.5);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const A = panel(ctx, W, { top: 44, bottom: H - 28, xMin: 0, xMax: 1000, yMin: 0, yMax: 140, yTicks: [0, 20, 40, 60, 80, 100, 120, 140], xSteps: [100, 200, 250, 500], minPx: 38, title: t('c2b'), left: 38 });
  LEVELS_A10.forEach(L => line(ctx, [[A.P.l, A.y(L)], [A.P.r, A.y(L)]], C.grid, 1));
  line(ctx, PROF.map(p => [A.x(p.x * 1000), A.y(p.h)]), '#c9b38a', 2.4);
  cross.forEach(cx => dot(ctx, A.x(cx * 1000), A.y(M.hillA(cx, 0.5)), 3.4, '#ffe066'));
  const half = 70; line(ctx, [[A.x(xm - half), A.y(h - dhdx * half)], [A.x(xm + half), A.y(h + dhdx * half)]], C.cyan, 2.4);
  dot(ctx, A.x(xm), A.y(h), 6, C.pink, true);
  const rise = Math.abs(dhdx) * 100, deg = sl.deg;
  const dir = rise < 0.5 ? t('flat') : dhdx > 0 ? t('up') : t('down');
  const grade = deg < 10 ? t('gentle') : deg < 20 ? t('medium') : t('steep');
  const gap = sl.rise > 1e-3 ? fx(M.spacing(M.hillA, x, 0.5, 10), 0) : '—';
  $('r2').textContent = t('s2readout', { x: xm, h: fx(h, 1), dir, rise: fx(rise, 1), deg: fx(deg, 0), grade, gap });
}

/* ---------- step 3: contour interval ---------- */
function draw3() {
  const I = M.INTERVALS[num('i3')], lv = M.levels(GA, I).list, idx = 50 % I === 0 ? 50 : 0;
  $('i3v').textContent = String(I);
  let { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 18, W - 16);
  const F = mapFrame(W, H);
  drawMapBase(ctx, F, 'A'); drawContours(ctx, F, 'A', lv, idx);
  const k = KNOLL;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(F.X(k.at[0]), F.Y(k.at[1]), 0.085 * F.S, 0, 7); ctx.stroke(); ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c3b')));
  title(ctx, t('c3b'), 8, 18, W - 16);
  const V = view3D(W, 56, H - 8, 'A');
  draw3D(ctx, V, 'A', { levels: lv, index: idx });
  const top = M.hillA(...M.A.peak), plo = Math.floor(top / I) * I, vis = Math.floor(KNOLL.top / I) * I > KNOLL.saddle, L = Math.floor(k.top / I) * I;
  $('r3').textContent = t('s3readout', { I, n: lv.length, list: lv.join(', '), plo, phi: plo + I, knoll: vis ? t('knollYes', { L }) : t('knollNo') });
}

/* ---------- step 4: landforms ---------- */
const FEAT = M.features();
const KNOLL = M.knollInfo();
const LEVELS_B = []; for (let L = 20; L <= 180; L += 20) LEVELS_B.push(L);
const s4 = { f: 'peak' };
function draw4() {
  const ft = FEAT[s4.f];
  document.querySelectorAll('[data-feature]').forEach(b => b.setAttribute('aria-pressed', b.dataset.feature === s4.f ? 'true' : 'false'));
  let { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 18, W - 16);
  const F = mapFrame(W, H);
  drawMapBase(ctx, F, 'B'); drawContours(ctx, F, 'B', LEVELS_B, 100);
  line(ctx, ft.cut.map(([x, y]) => [F.X(x), F.Y(y)]), C.orange, 2.4);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(F.X(ft.at[0]), F.Y(ft.at[1]), 0.07 * F.S, 0, 7); ctx.stroke(); ctx.restore();
  dot(ctx, F.X(ft.at[0]), F.Y(ft.at[1]), 4.5, C.orange, true);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  title(ctx, t('c4b'), 8, 18, W - 16);
  const V = view3D(W, 30, 262, 'B');
  draw3D(ctx, V, 'B', { levels: LEVELS_B, index: 100 });
  const prof = M.profile(M.hillB, ft.cut[0], ft.cut[1], 120);
  line(ctx, prof.map(p => V.P(p.x, p.y, p.h + 1.5)), C.orange, 2.2);
  pin3D(ctx, V, 'B', ft.at[0], ft.at[1], C.orange);
  const hs = prof.map(p => p.h), y0 = Math.floor(Math.min(...hs) / 20) * 20, y1 = Math.ceil(Math.max(...hs) / 20) * 20;
  const step = (y1 - y0) / 20 > 4 ? 40 : 20, yT = []; for (let v = y0; v <= y1; v += step) yT.push(v);
  const len = prof[prof.length - 1].d;
  const A = panel(ctx, W, { top: 298, bottom: H - 26, xMin: 0, xMax: len, yMin: y0, yMax: y1, yTicks: yT, xSteps: [50, 100, 200], minPx: 40, title: t('c4c'), left: 38 });
  line(ctx, prof.map(p => [A.x(p.d), A.y(p.h)]), '#c9b38a', 2.4);
  const atD = Math.hypot(ft.at[0] - ft.cut[0][0], ft.at[1] - ft.cut[0][1]) * 1000;
  if (atD >= 0 && atD <= len) dot(ctx, A.x(atD), A.y(M.hillB(...ft.at)), 5.5, C.orange, true);
  const hAt = fx(M.hillB(...ft.at), 0);
  const key = { peak: 'rdPeak', ridge: 'rdRidge', valley: 'rdValley', saddle: 'rdSaddle', basin: 'rdBasin' }[s4.f];
  $('r4').textContent = t(key, { h: hAt, p1: fx(M.hillB(...FEAT.peak.at), 0), p2: fx(M.hillB(...M.climb(M.hillB, M.B.p2[0], M.B.p2[1], 1)), 0), rim: fx(Math.floor(basinRim()), 0) });
}
let rimCache = null;
function basinRim() {
  if (rimCache !== null) return rimCache;
  const b = FEAT.basin.at; let rim = Infinity;
  for (let k = 0; k < 72; k++) { const th = k / 72 * 2 * Math.PI; let mx = -1; for (let r = 0.02; r < 0.15; r += 0.002) mx = Math.max(mx, M.hillB(b[0] + r * Math.cos(th), b[1] + r * Math.sin(th))); rim = Math.min(rim, mx); }
  return (rimCache = rim);
}

/* ---------- step 5: where water flows ---------- */
const s5 = { flows: [] };
const RIDGE_PERP = [FEAT.ridge.cut[0][0] - FEAT.ridge.at[0], FEAT.ridge.cut[0][1] - FEAT.ridge.at[1]].map(v => v / 0.17);
const DROPS = {
  drop1: [[FEAT.peak.at[0] + 0.03, FEAT.peak.at[1] - 0.03]],
  drop2: [[FEAT.ridge.at[0] + 0.02 * RIDGE_PERP[0], FEAT.ridge.at[1] + 0.02 * RIDGE_PERP[1]], [FEAT.ridge.at[0] - 0.02 * RIDGE_PERP[0], FEAT.ridge.at[1] - 0.02 * RIDGE_PERP[1]]],
  drop3: [[FEAT.basin.at[0] + 0.06, FEAT.basin.at[1] + 0.02]]
};
function addDrop(x, y) { s5.flows.push(M.flow(M.hillB, x, y)); if (s5.flows.length > 12) s5.flows.shift(); s5.count = (s5.count || 0) + 1; }
function draw5() {
  let { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5a'), 8, 18, W - 16);
  const F = mapFrame(W, H);
  drawMapBase(ctx, F, 'B'); drawContours(ctx, F, 'B', LEVELS_B, 100);
  ctx.save(); ctx.beginPath(); ctx.rect(F.ox, F.oy, F.S, F.S); ctx.clip();
  s5.flows.forEach(fl => line(ctx, fl.path.map(([x, y]) => [F.X(x), F.Y(y)]), C.cyan, 2.4));
  ctx.restore();
  s5.flows.forEach(fl => { const a = fl.path[0], b = fl.path[fl.path.length - 1]; mapPoint(ctx, F, a[0], a[1], C.text, 4.5); mapPoint(ctx, F, Math.max(0, Math.min(1, b[0])), Math.max(0, Math.min(1, b[1])), C.pink, 4.5); });
  ({ ctx, W, H } = fitCanvas($('c5b')));
  title(ctx, t('c5b'), 8, 18, W - 16);
  const V = view3D(W, 52, H - 8, 'B');
  draw3D(ctx, V, 'B', { levels: LEVELS_B, index: 100 });
  s5.flows.forEach(fl => path3D(ctx, V, 'B', fl.path, C.cyan));
  if (!s5.flows.length) { $('r5').textContent = ''; return; }
  const fl = s5.flows[s5.flows.length - 1];
  const end = fl.end === 'edge' ? t('endEdge', { h1: fx(fl.h1, 0) }) : t('endHollow', { h1: fx(fl.h1, 0) });
  $('r5').textContent = t('s5readout', { k: s5.count, h0: fx(fl.h0, 0), len: fx(Math.round(fl.length / 10) * 10, 0), end });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('w0').addEventListener('input', () => { s0.seen.add(num('w0')); draw0(); });
  ['x1', 'y1'].forEach(id => $(id).addEventListener('input', () => { s1.x = num('x1') / 1000; s1.y = num('y1') / 1000; draw1(); }));
  $('c1').addEventListener('click', ev => { const p = clickToMap($('c1'), ev); if (p) { s1.x = Math.round(p[0] * 100) / 100; s1.y = Math.round(p[1] * 100) / 100; draw1(); } });
  $('p2').addEventListener('input', draw2);
  $('i3').addEventListener('input', draw3);
  document.querySelectorAll('[data-feature]').forEach(b => b.addEventListener('click', () => { s4.f = b.dataset.feature; draw4(); }));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  ['drop1', 'drop2', 'drop3'].forEach(id => $(id).addEventListener('click', () => { DROPS[id].forEach(p => addDrop(p[0], p[1])); draw5(); }));
  $('clear5').addEventListener('click', () => { s5.flows = []; s5.count = 0; draw5(); });
  $('c5').addEventListener('click', ev => { const p = clickToMap($('c5'), ev); if (p) { addDrop(p[0], p[1]); draw5(); } });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  DROPS.drop1.forEach(p => addDrop(p[0], p[1]));
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
