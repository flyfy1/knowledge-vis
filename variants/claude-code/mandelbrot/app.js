'use strict';
// Mandelbrot lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every orbit, picture and readout comes from window.MANDEL_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrink to fit) and axis ticks outside the plot area; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MANDEL_MODEL;
const t = (...a) => window.MANDEL_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', inside: '#05080c' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return (v.toFixed(d).replace(/\.?0+$/, '') || '0').replace('-', '−'); };
const cstr = (x, y, d = 3) => { const a = fmt(x, d), b = fmt(Math.abs(y), d); return Math.abs(y) < 0.5 * Math.pow(10, -d) ? a : `${a} ${y < 0 ? '−' : '+'} ${b}i`; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = v => { if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e); return e === 0 ? m.toFixed(2) : `${m.toFixed(2)}×10${String(e).split('').map(ch => SUP[ch]).join('')}`; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  // optional data-aspect: on narrow screens the height follows the width (never taller than the authored height)
  const height = canvas.dataset.aspect ? Math.min(Number(canvas.dataset.h), Math.round(width * Number(canvas.dataset.aspect))) : Number(canvas.dataset.h);
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// A square-pixel view of a rectangle of the complex plane, fitted inside the plot area and centred.
function planeView(W, H, box, o = {}) {
  const top = o.top || 26, l = o.left == null ? 46 : o.left, b = o.bottom == null ? 22 : o.bottom, r = o.right == null ? 10 : o.right;
  const aw = W - l - r, ah = H - top - b;
  const s = Math.min(aw / (box.x1 - box.x0), ah / (box.y1 - box.y0));
  const pw = (box.x1 - box.x0) * s, ph = (box.y1 - box.y0) * s;
  const P = { l: l + (aw - pw) / 2, t: top + (ah - ph) / 2 }; P.r = P.l + pw; P.b = P.t + ph;
  return { P, s, box, sx: x => P.l + (x - box.x0) * s, sy: y => P.b - (y - box.y0) * s, inv: (px, py) => [box.x0 + (px - P.l) / s, box.y0 + (P.b - py) / s] };
}
// Re/Im ticks outside the plot rectangle; faint grid lines inside.
function planeAxes(ctx, V, { grid = true, axes = true } = {}) {
  const { P, box } = V;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  const step = niceStep(box.x1 - box.x0, P.r - P.l, 34, [0.25, 0.5, 1, 2]);
  ctx.textAlign = 'center';
  for (let v = Math.ceil(box.x0 / step - 1e-9) * step; v <= box.x1 + 1e-9; v += step) {
    if (grid) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(V.sx(v), P.t); ctx.lineTo(V.sx(v), P.b); ctx.stroke(); }
    ctx.fillText(fmt(v), V.sx(v), P.b + 14);
  }
  const ystep = niceStep(box.y1 - box.y0, P.b - P.t, 24, [0.25, 0.5, 1, 2]);
  ctx.textAlign = 'right';
  for (let v = Math.ceil(box.y0 / ystep - 1e-9) * ystep; v <= box.y1 + 1e-9; v += ystep) {
    if (grid) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, V.sy(v)); ctx.lineTo(P.r, V.sy(v)); ctx.stroke(); }
    ctx.fillText(fmt(v) + (Math.abs(v) < 1e-9 ? '' : 'i'), P.l - 5, V.sy(v) + 4);
  }
  if (axes) {
    ctx.strokeStyle = C.axis;
    if (box.y0 < 0 && box.y1 > 0) { ctx.beginPath(); ctx.moveTo(P.l, V.sy(0)); ctx.lineTo(P.r, V.sy(0)); ctx.stroke(); }
    if (box.x0 < 0 && box.x1 > 0) { ctx.beginPath(); ctx.moveTo(V.sx(0), P.t); ctx.lineTo(V.sx(0), P.b); ctx.stroke(); }
  }
  ctx.restore();
}

/* ---------- colour ---------- */
const STOPS = [[11, 22, 38], [18, 58, 92], [47, 134, 184], [103, 215, 249], [232, 237, 244], [255, 180, 84], [161, 75, 28]];
function palette(u) {
  u = Math.max(0, Math.min(1, u)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(u)), f = u - i, a = STOPS[i], b = STOPS[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
const escColor = (n, ref) => palette(Math.log(1 + n) / Math.log(1 + ref) * 0.92);
const cycColor = s => palette(0.1 + 0.8 * (0.5 - 0.5 * Math.cos(2 * Math.PI * s / 48))); // repeating bands every 48 escape steps
const PERIOD_COL = ['#7ee2a8', '#67d7f9', '#ffb454', '#ff7a93', '#b79cff', '#f2e36b', '#5fb6a6', '#e58bd8', '#9fb4cc', '#d9935b', '#8fd16a', '#6f8cff'];
const hexRGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// Render fn(re, im) → [r,g,b] into an offscreen canvas covering the plot rectangle of V, cached by key.
const fieldCache = new Map();
function field(key, V, res, fn) {
  const w = Math.max(16, Math.round((V.P.r - V.P.l) * res)), h = Math.max(16, Math.round((V.P.b - V.P.t) * res));
  const k = `${key}|${w}x${h}`;
  if (fieldCache.has(k)) return fieldCache.get(k);
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const g = off.getContext('2d'), img = g.createImageData(w, h), d = img.data;
  const { x0, x1, y0, y1 } = V.box;
  for (let j = 0; j < h; j++) {
    const im = y1 - (j + 0.5) / h * (y1 - y0);
    for (let i = 0; i < w; i++) {
      const rgb = fn(x0 + (i + 0.5) / w * (x1 - x0), im), q = 4 * (j * w + i);
      d[q] = rgb[0]; d[q + 1] = rgb[1]; d[q + 2] = rgb[2]; d[q + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  if (fieldCache.size > 40) fieldCache.delete(fieldCache.keys().next().value);
  fieldCache.set(k, off);
  return off;
}
function blit(ctx, V, off) { ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, V.P.l, V.P.t, V.P.r - V.P.l, V.P.b - V.P.t); ctx.restore(); }
const INSIDE = hexRGB(C.inside);
const mandelFn = N => (x, y) => { const n = M.escapeFast(x, y, N); return n < 0 ? INSIDE : escColor(n, 100); };

function ring(ctx, X, Y, r, col, lw = 2.2) { ctx.save(); ctx.strokeStyle = C.bg; ctx.lineWidth = lw + 2.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, col) { ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function dashedCircle(ctx, V, r) { ctx.save(); clipTo(ctx, V); ctx.strokeStyle = C.muted; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(V.sx(0), V.sy(0), r * V.s, 0, 7); ctx.stroke(); ctx.restore(); }
function clipTo(ctx, V) { ctx.beginPath(); ctx.rect(V.P.l, V.P.t, V.P.r - V.P.l, V.P.b - V.P.t); ctx.clip(); }

/* ---------- animation runner ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

// Drag on a canvas to pick a point of its plane view.
function dragPick(canvas, getView, onPick) {
  let down = false;
  const pick = e => { const r = canvas.getBoundingClientRect(), V = getView(); if (!V) return; const [x, y] = V.inv(e.clientX - r.left, e.clientY - r.top); onPick(x, y); };
  canvas.addEventListener('pointerdown', e => { down = true; canvas.setPointerCapture(e.pointerId); pick(e); });
  canvas.addEventListener('pointermove', e => { if (down) pick(e); });
  canvas.addEventListener('pointerup', () => { down = false; });
  canvas.addEventListener('pointercancel', () => { down = false; });
}
const clampTo = (id, v) => { const el = $(id), lo = Number(el.min), hi = Number(el.max), st = Number(el.step); const q = Math.round((Math.max(lo, Math.min(hi, v)) - lo) / st) * st + lo; el.value = q.toFixed(3); return Number(el.value); };

/* ---------- step 0: one orbit ---------- */
const BOX0 = { x0: -2.6, x1: 2.6, y0: -2.2, y1: 2.2 };
let V0 = null;
function draw0() {
  const cr = num('cr0'), ci = num('ci0'), n = num('n0');
  $('cr0v').textContent = fmt(cr); $('ci0v').textContent = fmt(ci); $('n0v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c0'));
  const V = V0 = planeView(W, H, BOX0);
  planeAxes(ctx, V); dashedCircle(ctx, V, 2);
  title(ctx, t('c0title'), 8, 17, W - 16);
  const o = M.orbit(cr, ci, n);
  const pts = o.pts;
  ctx.save(); clipTo(ctx, V);
  for (let k = 1; k < pts.length; k++) {
    const a = 0.25 + 0.75 * k / (pts.length - 1);
    ctx.strokeStyle = `rgba(103,215,249,${a.toFixed(3)})`; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(V.sx(pts[k - 1][0]), V.sy(pts[k - 1][1])); ctx.lineTo(V.sx(pts[k][0]), V.sy(pts[k][1])); ctx.stroke();
  }
  pts.forEach(([x, y], k) => { if (k < pts.length - 1) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(V.sx(x), V.sy(y), 2.6, 0, 7); ctx.fill(); } });
  ctx.restore();
  ring(ctx, V.sx(cr), V.sy(ci), 7, C.orange);
  const last = pts[pts.length - 1];
  const shownN = pts.length - 1;
  const inView = Math.abs(last[0]) < 1e6 && Math.abs(last[1]) < 1e6;
  if (inView && last[0] >= BOX0.x0 && last[0] <= BOX0.x1 && last[1] >= BOX0.y0 && last[1] <= BOX0.y1) dot(ctx, V.sx(last[0]), V.sy(last[1]), 5, C.text);
  const tail = pts.slice(Math.max(1, pts.length - 4)).map((p, i, arr) => `z${sub(pts.length - arr.length + i)} = ${big(p)}`).join(t('sep'));
  const mod = Math.hypot(last[0], last[1]);
  const status = o.esc > 0 ? t('s0esc', { k: o.esc }) : t('s0stay', { n: shownN });
  $('r0').textContent = t('s0readout', { c: cstr(cr, ci, 2), tail, mod: isFinite(mod) && mod < 1e6 ? mod.toFixed(3) : sci(mod), status });
}
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const sub = n => String(n).split('').map(d => SUBS[+d]).join('');
const big = ([x, y]) => (Math.hypot(x, y) < 1e4 ? cstr(x, y, 3) : (isFinite(x) ? `|z| ≈ ${sci(Math.hypot(x, y))}` : '∞'));

/* ---------- step 1: once outside radius 2, there is no way back ---------- */
const s1 = { N: 80 };
function draw1() {
  const cr = num('cr1'), ci = num('ci1');
  $('cr1v').textContent = fmt(cr); $('ci1v').textContent = fmt(ci);
  const { mods, esc } = M.modSeq(cr, ci, s1.N, 6);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1title'), 8, 17, W - 16);
  const P = { l: 42, r: W - 12, t: 30, b: H - 26 }, YMAX = Math.log2(1 + 1e4);
  const xs = n => P.l + (n + 0.5) / (s1.N + 1) * (P.r - P.l), ys = v => P.b - Math.log2(1 + Math.min(v, 1e4)) / YMAX * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  for (const v of [0, 1, 2, 4, 16, 256, 4096]) { ctx.strokeStyle = v === 2 ? C.muted : C.grid; ctx.setLineDash(v === 2 ? [5, 5] : []); ctx.beginPath(); ctx.moveTo(P.l, ys(v)); ctx.lineTo(P.r, ys(v)); ctx.stroke(); ctx.fillText(String(v), P.l - 5, ys(v) + 4); }
  ctx.setLineDash([]); ctx.textAlign = 'center';
  const step = niceStep(s1.N, P.r - P.l, 30, [5, 10, 20, 40]);
  for (let n = 0; n <= s1.N; n += step) ctx.fillText(String(n), xs(n), P.b + 15);
  const bw = Math.max(1.5, (P.r - P.l) / (s1.N + 1) * 0.7);
  mods.forEach((m, n) => {
    const out = m > M.R; ctx.fillStyle = out ? C.orange : C.cyan;
    const top = ys(m); ctx.fillRect(xs(n) - bw / 2, top, bw, Math.max(1, P.b - top));
    if (m > 1e4) { ctx.beginPath(); ctx.moveTo(xs(n) - 4, P.t + 6); ctx.lineTo(xs(n), P.t); ctx.lineTo(xs(n) + 4, P.t + 6); ctx.fill(); }
  });
  // the guaranteed lower bound |z_n|·(|z_n| − 1) for the step after each outside value
  const cm = Math.hypot(cr, ci);
  mods.forEach((m, n) => { if (n + 1 < mods.length && m > M.R && m >= cm) { const lb = m * (m - 1); if (lb <= 1e4) ring(ctx, xs(n + 1), ys(lb), 4, C.orange, 1.6); } });
  ctx.restore();
  const cs = cstr(cr, ci, 2);
  if (esc > 0) {
    const a = mods[esc], b = mods[esc + 1];
    $('r1').textContent = t('s1readoutEsc', { c: cs, cm: cm.toFixed(3), k: esc, a: a.toFixed(3), b: b < 1e6 ? b.toFixed(3) : sci(b), r: (b / a).toFixed(3), lb: (a - 1).toFixed(3) });
  } else {
    const mx = Math.max(...mods);
    $('r1').textContent = t('s1readoutStay', { c: cs, cm: cm.toFixed(3), N: s1.N, mx: mx.toFixed(3) });
  }
}

/* ---------- step 2: colour every c by its escape time ---------- */
const NLIST = [1, 2, 3, 4, 5, 7, 10, 15, 20, 30, 50, 100, 200, 500, 1000];
const AREA_RES = 300;
const areaCache = new Map();
const areaOf = N => { if (!areaCache.has(N)) areaCache.set(N, M.areaEstimate(N, AREA_RES)); return areaCache.get(N); };
const s2 = { hist: new Set([NLIST[5]]) };
function draw2() {
  const N = NLIST[num('N2')];
  $('N2v').textContent = String(N);
  let { ctx, W, H } = fitCanvas($('c2'));
  const F = M.FRAME, V = planeView(W, H, { x0: F.x0, x1: F.x1, y0: F.y0, y1: F.y1 });
  blit(ctx, V, field('m' + N, V, 0.75, mandelFn(N)));
  planeAxes(ctx, V, { grid: false, axes: false });
  title(ctx, t('c2title', { N }), 8, 17, W - 16);
  const area = areaOf(N);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  title(ctx, t('c2btitle'), 8, 17, W - 16);
  const P = { l: 36, r: W - 14, t: 30, b: H - 40 }, LX = Math.log10(1000), YM = 8;
  const xs = n => P.l + Math.log10(n) / LX * (P.r - P.l), ys = a => P.b - a / YM * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.textAlign = 'right';
  for (const v of [0, 2, 4, 6, 8]) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, ys(v)); ctx.lineTo(P.r, ys(v)); ctx.stroke(); ctx.fillText(String(v), P.l - 5, ys(v) + 4); }
  ctx.textAlign = 'center';
  for (const v of [1, 10, 100, 1000]) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(xs(v), P.b); ctx.lineTo(xs(v), P.b + 4); ctx.stroke(); ctx.fillText(String(v), xs(v), P.b + 15); }
  ctx.textAlign = 'left'; ctx.fillText(t('c2bx'), P.l, P.b + 31);
  const hs = [...s2.hist].sort((a, b) => a - b);
  ctx.strokeStyle = 'rgba(232,237,244,0.5)'; ctx.lineWidth = 1.4; ctx.beginPath();
  hs.forEach((n, i) => { const X = xs(n), Y = ys(areaOf(n)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke();
  hs.forEach(n => { if (n !== N) dot(ctx, xs(n), ys(areaOf(n)), 3.5, C.text); });
  dot(ctx, xs(N), ys(area), 6, C.cyan);
  ctx.restore();
  const frameArea = (F.x1 - F.x0) * (F.y1 - F.y0);
  const prog = s2.play ? t('s2progress', { c: s2.play, n: NLIST.length }) : '';
  $('r2').textContent = prog + t('s2readout', { N, a: area.toFixed(3), pct: (100 * area / frameArea).toFixed(1), fa: frameArea.toFixed(2) });
}

/* ---------- step 3: what the orbit settles into ---------- */
const BOX3 = { x0: -2.05, x1: 0.55, y0: -1.2, y1: 1.2 };
const ZBOX3 = { x0: -1.7, x1: 1.7, y0: -1.45, y1: 1.45 };
const BULBS = [[1, 2], [1, 3], [2, 5], [1, 4], [1, 5], [3, 7]];
const s3 = { c: [-0.12, 0.745], bulb: null };
let V3 = null;
const periodFn = (x, y) => {
  if (M.escapeFast(x, y, 150) >= 0) { const n = M.escapeTime(x, y, 150); return escColor(n, 150).map(v => v * 0.45); }
  const a = M.attractor(x, y, 700, 12, 1e-6);
  return a.period ? hexRGB(PERIOD_COL[(a.period - 1) % PERIOD_COL.length]).map(v => v * 0.8) : [42, 52, 66];
};
function draw3() {
  const [cr, ci] = s3.c;
  $('cr3v').textContent = fmt(cr, 4); $('ci3v').textContent = fmt(ci, 4);
  document.querySelectorAll('#bulbs3 .btn').forEach(b => b.setAttribute('aria-pressed', String(s3.bulb === b.dataset.pq)));
  let { ctx, W, H } = fitCanvas($('c3'));
  const V = V3 = planeView(W, H, BOX3);
  blit(ctx, V, field('period', V, 0.6, periodFn));
  planeAxes(ctx, V, { grid: false, axes: false });
  title(ctx, t('c3title'), 8, 17, W - 16);
  ring(ctx, V.sx(cr), V.sy(ci), 7, C.orange);
  const a = M.attractor(cr, ci);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const Z = planeView(W, H, ZBOX3);
  planeAxes(ctx, Z); dashedCircle(ctx, Z, 2);
  title(ctx, t('c3btitle'), 8, 17, W - 16);
  const o = M.orbit(cr, ci, 60);
  ctx.save(); clipTo(ctx, Z); ctx.strokeStyle = 'rgba(154,170,189,0.45)'; ctx.lineWidth = 1; ctx.beginPath();
  o.pts.forEach(([x, y], k) => { if (!k) ctx.moveTo(Z.sx(x), Z.sy(y)); else ctx.lineTo(Z.sx(x), Z.sy(y)); }); ctx.stroke(); ctx.restore();
  let rot = null; const al = M.alphaFixed(cr, ci);
  if (!a.escaped && a.period) {
    const col = PERIOD_COL[(a.period - 1) % PERIOD_COL.length];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
    a.cycle.forEach(([x, y], k) => { if (!k) ctx.moveTo(Z.sx(x), Z.sy(y)); else ctx.lineTo(Z.sx(x), Z.sy(y)); });
    if (a.period > 1) ctx.closePath(); ctx.stroke(); ctx.restore();
    a.cycle.forEach(([x, y]) => dot(ctx, Z.sx(x), Z.sy(y), 5.5, col));
    if (a.period > 1) {
      rot = M.rotationAround(a.cycle, al);
      ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; const X = Z.sx(al[0]), Y = Z.sy(al[1]);
      ctx.beginPath(); ctx.moveTo(X - 5, Y - 5); ctx.lineTo(X + 5, Y + 5); ctx.moveTo(X - 5, Y + 5); ctx.lineTo(X + 5, Y - 5); ctx.stroke(); ctx.restore();
    }
  }
  const pcol = a.period ? PERIOD_COL[(a.period - 1) % PERIOD_COL.length] : '#2a3442';
  $('lg3').innerHTML = `<span class="lg"><span class="sw sw-ring"></span><span>${t('lgC')}</span></span><span class="lg"><span class="sw" style="background:${pcol}"></span><span>${t('lg3cycle')}</span></span><span class="lg"><span class="sw" style="background:rgba(154,170,189,.6);height:2px"></span><span>${t('lg3tail')}</span></span><span class="lg"><span class="sw" style="background:none;color:#e8edf4;font-weight:700;line-height:10px;text-align:center">×</span><span>${t('lg3alpha')}</span></span>`;
  const cs = cstr(cr, ci, 4);
  if (a.escaped) { $('r3').textContent = t('s3esc', { c: cs, k: a.n }); return; }
  if (!a.period) { $('r3').textContent = t('s3none', { c: cs }); return; }
  const [mr, mi] = M.multiplier(a.cycle), lam = Math.hypot(mr, mi);
  const rotTxt = a.period > 1 && rot !== null ? t('s3rot', { r: rot, p: a.period }) : (a.period === 1 ? t('s3fixed') : '');
  $('r3').textContent = t('s3readout', { c: cs, p: a.period, lam: lam.toFixed(3), rot: rotTxt });
}

/* ---------- step 4: zoom toward a boundary point ---------- */
const s4 = { target: 0, res: 0.7 };
function view4(z, W, H) {
  const T = M.TARGETS[s4.target].c, C0 = [-0.6, 0], f = Math.pow(10, -z);
  const w = M.BASE_W * f, h = w * (H - 30) / W;
  // zoom about T: T keeps its place on screen while everything else shrinks toward it
  const cx = T[0] + (C0[0] - T[0]) * f, cy = T[1] + (C0[1] - T[1]) * f;
  return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
}
function draw4() {
  const z = num('z4');
  $('z4v').textContent = '10^' + z.toFixed(1);
  document.querySelectorAll('#targets4 .btn').forEach((b, i) => b.setAttribute('aria-pressed', String(i === s4.target)));
  const { ctx, W, H } = fitCanvas($('c4'));
  const box = view4(z, W, H), V = planeView(W, H, box, { top: 30, left: 0, right: 0, bottom: 0 });
  const N = M.iterFor(z), T = M.TARGETS[s4.target].c;
  const fn = (x, y) => { const n = M.escapeFast(x, y, N); return n < 0 ? INSIDE : cycColor(M.smoothEscape(x, y, N)); };
  blit(ctx, V, field(`z${s4.target}|${z.toFixed(1)}`, V, s4.res, fn));
  ring(ctx, V.sx(T[0]), V.sy(T[1]), 6, C.orange, 1.6);
  title(ctx, t('c4title', { name: t('tg_' + M.TARGETS[s4.target].id) }), 8, 19, W - 16);
  const width = box.x1 - box.x0, px = width / ((V.P.r - V.P.l) * s4.res);
  const u = M.ulp(Math.max(Math.abs(T[0]), Math.abs(T[1]))), share = M.insideShare(box, N);
  const tail = share > 0.999 ? t('s4allin') : '';
  $('r4').textContent = t('s4readout', { mag: '10^' + z.toFixed(1), w: sci(width), N, px: sci(px), u: sci(u), k: sci(px / u), pin: (100 * share).toFixed(0) }) + tail;
}

/* ---------- step 5: Julia sets ---------- */
const BOX5 = { x0: -2.05, x1: 0.6, y0: -1.25, y1: 1.25 }, JBOX = { x0: -1.8, x1: 1.8, y0: -1.5, y1: 1.5 };
const s5 = { c: [-1, 0] };
let V5 = null;
function draw5() {
  const [cr, ci] = s5.c;
  $('cr5v').textContent = fmt(cr, 4); $('ci5v').textContent = fmt(ci, 4);
  let { ctx, W, H } = fitCanvas($('c5'));
  const V = V5 = planeView(W, H, BOX5);
  blit(ctx, V, field('m5', V, 0.6, mandelFn(200)));
  planeAxes(ctx, V, { grid: false, axes: false });
  title(ctx, t('c5title'), 8, 17, W - 16);
  ring(ctx, V.sx(cr), V.sy(ci), 7, C.orange);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const J = planeView(W, H, JBOX);
  const NJ = 200;
  blit(ctx, J, field(`j${cr.toFixed(5)},${ci.toFixed(5)}`, J, 0.6, (x, y) => { const n = M.juliaEscape(cr, ci, x, y, NJ); return n < 0 ? INSIDE : escColor(n, 60); }));
  planeAxes(ctx, J, { grid: false, axes: false });
  title(ctx, t('c5btitle', { c: cstr(cr, ci, 3) }), 8, 17, W - 16);
  const e = M.escapeTime(cr, ci, 2000);
  $('r5').textContent = e < 0 ? t('s5in', { c: cstr(cr, ci, 4) }) : t('s5out', { c: cstr(cr, ci, 4), k: e });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function presetButtons(box, list, prefix, onPick) {
  list.forEach((p, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small toggle'; b.dataset.step = box.closest('.step').dataset.step;
    b.dataset.key = prefix + p.id; b.addEventListener('click', () => onPick(p, i)); box.appendChild(b);
  });
}
function labelButtons() {
  document.querySelectorAll('[data-key]').forEach(b => { b.textContent = t(b.dataset.key); });
  document.querySelectorAll('#bulbs3 .btn').forEach(b => { b.textContent = t('bulb', { pq: b.dataset.pq }); });
}

function setup() {
  presetButtons($('presets0'), M.ORBITS, 'orb_', p => { stopAnim('s0'); clampTo('cr0', p.c[0]); clampTo('ci0', p.c[1]); draw0(); });
  ['cr0', 'ci0', 'n0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); draw0(); }));
  dragPick($('c0'), () => V0, (x, y) => { stopAnim('s0'); clampTo('cr0', x); clampTo('ci0', y); draw0(); });
  $('play0').addEventListener('click', () => {
    const cr = num('cr0'), ci = num('ci0'), o = M.orbit(cr, ci, 100), end = o.esc > 0 ? Math.min(100, o.esc + 2) : 100;
    animate('s0', end * 70, p => { $('n0').value = String(Math.max(1, Math.round(p * end))); draw0(); });
  });

  const P1 = [{ id: 'slow', c: [-0.1, 0.65] }, { id: 'p03', c: [0.3, 0] }, { id: 'edge', c: [-2, 0] }, { id: 'far', c: [2.1, 0] }];
  presetButtons($('presets1'), P1, 'p1_', p => { clampTo('cr1', p.c[0]); clampTo('ci1', p.c[1]); draw1(); });
  ['cr1', 'ci1'].forEach(id => $(id).addEventListener('input', draw1));

  $('N2').addEventListener('input', () => { stopAnim('s2'); s2.play = 0; s2.hist.add(NLIST[num('N2')]); draw2(); });
  $('play2').addEventListener('click', () => {
    s2.hist = new Set();
    animate('s2', NLIST.length * 500, p => {
      const i = Math.min(NLIST.length - 1, Math.floor(p * NLIST.length));
      for (let k = 0; k <= i; k++) s2.hist.add(NLIST[k]);
      s2.play = i + 1; $('N2').value = String(i); draw2();
    }, () => { s2.play = 0; draw2(); });
  });
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.play = 0; s2.hist = new Set([NLIST[num('N2')]]); draw2(); });

  BULBS.forEach(([p, q]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small toggle'; b.dataset.step = '3'; b.dataset.pq = `${p}/${q}`;
    b.addEventListener('click', () => { s3.c = M.bulbCenter(p, q); s3.bulb = b.dataset.pq; clampTo('cr3', s3.c[0]); clampTo('ci3', s3.c[1]); draw3(); });
    $('bulbs3').appendChild(b);
  });
  ['cr3', 'ci3'].forEach(id => $(id).addEventListener('input', () => { s3.c = [num('cr3'), num('ci3')]; s3.bulb = null; draw3(); }));
  dragPick($('c3'), () => V3, (x, y) => { s3.c = [clampTo('cr3', x), clampTo('ci3', y)]; s3.bulb = null; draw3(); });
  s3.c = M.bulbCenter(1, 3); s3.bulb = '1/3'; clampTo('cr3', s3.c[0]); clampTo('ci3', s3.c[1]);

  presetButtons($('targets4'), M.TARGETS, 'tg_', (p, i) => { stopAnim('s4'); s4.target = i; s4.res = 0.7; draw4(); });
  $('z4').addEventListener('input', () => { stopAnim('s4'); s4.res = 0.7; draw4(); });
  $('play4').addEventListener('click', () => {
    s4.res = 0.3;
    animate('s4', 9000, p => { $('z4').value = (Math.round(p * 90) / 10).toFixed(1); draw4(); }, () => { s4.res = 0.7; draw4(); });
  });

  presetButtons($('presets5'), M.JULIA, 'jl_', p => { s5.c = p.c.slice(); clampTo('cr5', p.c[0]); clampTo('ci5', p.c[1]); draw5(); });
  ['cr5', 'ci5'].forEach(id => $(id).addEventListener('input', () => { s5.c = [num('cr5'), num('ci5')]; draw5(); }));
  dragPick($('c5'), () => V5, (x, y) => { s5.c = [clampTo('cr5', x), clampTo('ci5', y)]; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshMandel = () => { labelButtons(); refresh(); };
  labelButtons(); refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
