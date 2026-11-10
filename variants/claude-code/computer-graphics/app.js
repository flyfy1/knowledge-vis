'use strict';
// Rendering-pipeline lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every shape, pixel and readout comes from window.GFX_MODEL (model.js). Canvas text is limited to panel
// titles (own row, shrunk to fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.GFX_MODEL;
const t = (...a) => window.GFX_I18N.t(...a);
const DEG = M.DEG;
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#1f2c3b', axis: '#3d5068', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, trailing zeros trimmed only after a decimal point, −0 shown as 0, true minus sign.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace('-', '−'); };
// Two fixed decimals (matrix entries, coordinates), −0 shown as 0.00.
const f2 = q => (Math.abs(q) < 0.005 ? 0 : q).toFixed(2).replace('-', '−');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const maxH = Number(canvas.getAttribute('height')) || 300;
  // CSS height: the authored height, or width × aspect when that is smaller (square world views on phones).
  const height = canvas.dataset.aspect ? Math.min(maxH, Math.round(width * Number(canvas.dataset.aspect))) : maxH;
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title in its own row; the font shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y, maxW); ctx.restore(); // last resort: squeeze rather than overflow
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Equal-aspect world view. The y range is fixed; the x range widens to fill the canvas (or the scale
// shrinks if the x range would not fit). Ticks sit left of and below the plot box.
function world(ctx, W, H, o) {
  const top = 32, bottom = H - 22, left = 34, right = W - 10;
  let s = (bottom - top) / (o.y1 - o.y0);
  if ((o.x1 - o.x0) * s > right - left) s = (right - left) / (o.x1 - o.x0);
  const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2, mx = (left + right) / 2, my = (top + bottom) / 2;
  const X = v => mx + (v - cx) * s, Y = v => my - (v - cy) * s;
  const xv0 = cx - (mx - left) / s, xv1 = cx + (right - mx) / s, yv0 = cy - (bottom - my) / s, yv1 = cy + (my - top) / s;
  const step = niceStep(1, s, 34, o.steps || [0.25, 0.5, 1, 2]);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (let v = Math.ceil(xv0 / step) * step; v <= xv1 + 1e-9; v += step) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(v), Y(yv1)); ctx.lineTo(X(v), Y(yv0)); ctx.stroke();
    const lx = X(v); if (lx > left + 8 && lx < right - 8) { ctx.textAlign = 'center'; ctx.fillText(fmt(v), lx, bottom + 15); }
  }
  for (let v = Math.ceil(yv0 / step) * step; v <= yv1 + 1e-9; v += step) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(X(xv0), Y(v)); ctx.lineTo(X(xv1), Y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), left - 5, Y(v) + 4);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, top - 9, W - 16);
  return { X, Y, s, box: { l: left, r: right, t: top, b: bottom } };
}

// A plain plot panel (x and y scaled independently). yLog: y values are log10.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 10), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const tk of o.yTicks) {
    const v = typeof tk === 'object' ? tk.v : tk, lab = typeof tk === 'object' ? tk.label : fmt(v);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 5, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.textAlign = 'center';
    for (const v of o.xTicks) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke();
      if (!o.noXLabels) ctx.fillText(fmt(v, 0), x(v), P.b + 15);
    }
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 8, W - 16);
  return { x, y, P };
}
function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 2.6) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.5) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hs = Math.min(10, L * 0.45);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hs * 0.7, y1 - uy * hs * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hs - uy * hs * 0.5, y1 - uy * hs + ux * hs * 0.5); ctx.lineTo(x1 - ux * hs + uy * hs * 0.5, y1 - uy * hs - ux * hs * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* ---------- shared animation runner (reduced motion → final frame; hidden page → finish) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

// Unit-square raster view: maps [0, 1]² (y up) to the largest square below the title row.
function screen(ctx, W, H, ttl) {
  const top = 30, pad = 8, size = Math.min(W - 2 * pad, H - top - pad), x0 = (W - size) / 2, y0 = top;
  if (ttl) title(ctx, ttl, 8, top - 10, W - 16);
  return { X: u => x0 + u * size, Y: v => y0 + size - v * size, size, x0, y0 };
}
function poly(ctx, pts, { fill = null, stroke = null, lw = 2, dash = null, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.stroke(); }
  ctx.restore();
}

/* ---------- step 0: homogeneous transforms ---------- */
const s0 = { order: 'TRS' };
function draw0() {
  const a = num('rot'), s = num('scl'), tx = num('tx'), ty = num('ty');
  $('rotv').textContent = a + '°'; $('sclv').textContent = fmt(s, 1); $('txv').textContent = fmt(tx, 1); $('tyv').textContent = fmt(ty, 1);
  $('oTRS').setAttribute('aria-pressed', s0.order === 'TRS'); $('oRST').setAttribute('aria-pressed', s0.order === 'RST');
  const other = s0.order === 'TRS' ? 'RST' : 'TRS';
  const Mx = M.compose(s0.order, a * DEG, s, tx, ty), Mo = M.compose(other, a * DEG, s, tx, ty);
  const { ctx, W, H } = fitCanvas($('c0'));
  const V = world(ctx, W, H, { x0: -3.6, x1: 3.6, y0: -3.6, y1: 3.6, steps: [1, 2, 5], title: t('c0') });
  ctx.save(); ctx.beginPath(); ctx.rect(V.box.l, V.box.t, V.box.r - V.box.l, V.box.b - V.box.t); ctx.clip();
  const toC = p => [V.X(p[0]), V.Y(p[1])];
  poly(ctx, M.SHAPE.map(toC), { fill: 'rgba(232,237,244,0.16)', stroke: 'rgba(232,237,244,0.45)', lw: 1.2 });
  line(ctx, [toC([0, 0]), toC([tx, ty])], C.ghost, 1.2, [3, 4]);
  poly(ctx, M.SHAPE.map(p => toC(M.apply(Mo, p))), { stroke: C.orange, lw: 2, dash: [7, 5] });
  poly(ctx, M.SHAPE.map(p => toC(M.apply(Mx, p))), { fill: 'rgba(103,215,249,0.28)', stroke: C.cyan, lw: 2.4 });
  const P = M.apply(Mx, [1, 0]), Q = M.apply(Mo, [1, 0]);
  dot(ctx, ...toC(Q), 5, C.pink, true); dot(ctx, ...toC(P), 5.5, C.pink);
  dot(ctx, ...toC([1, 0]), 3.5, C.ghost);
  ctx.restore();
  const name = o => (o === 'TRS' ? 'T·R·S' : 'R·S·T');
  $('r0').textContent = t('s0readout', { ord: name(s0.order), ord2: name(other), a: f2(Mx[0][0]), b: f2(Mx[0][1]), c: f2(Mx[0][2]), d: f2(Mx[1][0]), e: f2(Mx[1][1]), f: f2(Mx[1][2]), x: f2(P[0]), y: f2(P[1]), ox: f2(Q[0]), oy: f2(Q[1]), dist: f2(Math.hypot(P[0] - Q[0], P[1] - Q[1])) });
}

/* ---------- step 1: perspective ---------- */
const LAT = [-0.35, 0.25, 0.9], PCOL = [C.orange, C.pink, C.violet];
function draw1() {
  const f = num('f'), c = num('dolly'), half = M.POST_H / 2;
  $('fv').textContent = fmt(f) + ' m'; $('dollyv').textContent = fmt(c) + ' m';
  const zs = M.POSTS.map(z => z - c), hs = zs.map(z => 2 * M.project(f, half, z));
  let { ctx, W, H } = fitCanvas($('c1a'));
  const V = world(ctx, W, H, { x0: -0.3, x1: 6.3, y0: -1.25, y1: 1.25, steps: [0.5, 1, 2], title: t('c1a') });
  ctx.save(); ctx.beginPath(); ctx.rect(V.box.l, V.box.t, V.box.r - V.box.l, V.box.b - V.box.t); ctx.clip();
  // image plane
  line(ctx, [[V.X(f), V.Y(-1.2)], [V.X(f), V.Y(1.2)]], C.text, 1.6, null, 0.8);
  zs.forEach((z, k) => {
    line(ctx, [[V.X(0), V.Y(0)], [V.X(z), V.Y(half)]], C.cyan, 1.1, [4, 4], 0.75);
    line(ctx, [[V.X(0), V.Y(0)], [V.X(z), V.Y(-half)]], C.cyan, 1.1, [4, 4], 0.75);
    ctx.save(); ctx.strokeStyle = PCOL[k]; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(V.X(z), V.Y(-half)); ctx.lineTo(V.X(z), V.Y(half)); ctx.stroke(); ctx.restore();
    const y = hs[k] / 2, dx = (k - 1) * 4;
    ctx.save(); ctx.strokeStyle = PCOL[k]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(V.X(f) + dx, V.Y(-y)); ctx.lineTo(V.X(f) + dx, V.Y(y)); ctx.stroke(); ctx.restore();
  });
  ctx.restore();
  dot(ctx, V.X(0), V.Y(0), 5.5, C.text);

  ({ ctx, W, H } = fitCanvas($('c1b')));
  const E = 0.75, S = world(ctx, W, H, { x0: -E, x1: E, y0: -E, y1: E, steps: [0.25, 0.5, 1], title: t('c1b') });
  ctx.save(); ctx.beginPath(); ctx.rect(S.X(-E), S.Y(E), S.X(E) - S.X(-E), S.Y(-E) - S.Y(E)); ctx.clip();
  ctx.fillStyle = 'rgba(126,226,168,0.05)'; ctx.fillRect(S.X(-E), S.Y(E), S.X(E) - S.X(-E), S.Y(-E) - S.Y(E));
  [2, 1, 0].forEach(k => { // far first so near posts cover far ones
    const z = zs[k], xc = M.project(f, LAT[k], z), w = M.project(f, 0.12, z), h = hs[k];
    ctx.fillStyle = PCOL[k]; ctx.fillRect(S.X(xc - w / 2), S.Y(h / 2), Math.max(2, w * S.s), h * S.s);
  });
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.2; ctx.strokeRect(S.X(-E), S.Y(E), S.X(E) - S.X(-E), S.Y(-E) - S.Y(E)); ctx.restore();
  const k = zs.map((z, i) => hs[i] * z);
  $('r1').textContent = t('s1readout', { f: fmt(f), c: fmt(c), z1: fmt(zs[0]), z2: fmt(zs[1]), z3: fmt(zs[2]), h1: fmt(hs[0], 3), h2: fmt(hs[1], 3), h3: fmt(hs[2], 3), k1: fmt(k[0], 3), k2: fmt(k[1], 3), k3: fmt(k[2], 3), k: fmt(f * M.POST_H, 3) });
}

/* ---------- step 2: rasterization ---------- */
const s2 = { tri: [[0.12, 0.15], [0.88, 0.32], [0.40, 0.90]], probe: [0.47, 0.45], rows: Infinity, view: null, drag: -1 };
function draw2() {
  const N = num('n'); $('nv').textContent = N + ' × ' + N;
  const tri = s2.tri, lit = M.rasterize(tri, N), rowsShown = Math.min(N, s2.rows);
  const { ctx, W, H } = fitCanvas($('c2'));
  const S = screen(ctx, W, H, t('c2')); s2.view = S;
  const px = S.size / N;
  ctx.fillStyle = '#0a1119'; ctx.fillRect(S.x0, S.y0, S.size, S.size);
  // rows are scanned from the top (j = N − 1) down
  for (let j = 0; j < N; j++) {
    const scanned = N - 1 - j < rowsShown;
    for (let i = 0; i < N; i++) if (scanned && lit[j * N + i]) { ctx.fillStyle = 'rgba(103,215,249,0.78)'; ctx.fillRect(S.X(i / N), S.Y((j + 1) / N), px, px); }
  }
  if (rowsShown < N) { const j = N - 1 - rowsShown; ctx.fillStyle = 'rgba(255,180,84,0.22)'; ctx.fillRect(S.x0, S.Y((j + 1) / N), S.size, px); }
  ctx.save(); ctx.strokeStyle = 'rgba(154,170,189,0.22)'; ctx.lineWidth = 1;
  for (let k = 0; k <= N; k++) { ctx.beginPath(); ctx.moveTo(S.X(k / N), S.y0); ctx.lineTo(S.X(k / N), S.y0 + S.size); ctx.stroke(); ctx.beginPath(); ctx.moveTo(S.x0, S.Y(k / N)); ctx.lineTo(S.x0 + S.size, S.Y(k / N)); ctx.stroke(); }
  ctx.restore();
  if (px >= 9) { ctx.fillStyle = 'rgba(232,237,244,0.45)'; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { ctx.beginPath(); ctx.arc(S.X((i + 0.5) / N), S.Y((j + 0.5) / N), 1.3, 0, 7); ctx.fill(); } }
  poly(ctx, tri.map(p => [S.X(p[0]), S.Y(p[1])]), { stroke: C.text, lw: 2 });
  tri.forEach(p => dot(ctx, S.X(p[0]), S.Y(p[1]), 7, C.orange));
  const pi = Math.min(N - 1, Math.floor(s2.probe[0] * N)), pj = Math.min(N - 1, Math.floor(s2.probe[1] * N));
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.5; ctx.strokeRect(S.X(pi / N) + 1, S.Y((pj + 1) / N) + 1, px - 2, px - 2); ctx.restore();
  const n = M.count(lit), ta = Math.abs(M.area(tri)), pa = n / (N * N), E = M.edgeValues(tri, [(pi + 0.5) / N, (pj + 0.5) / N]);
  const prog = rowsShown < N ? t('s2progress', { c: rowsShown, N }) : '';
  $('r2').textContent = t('s2readout', { prog, N, n, pa: fmt(pa, 4), ta: fmt(ta, 4), err: fmt(ta > 0 ? (pa - ta) / ta * 100 : 0, 1), i: pi + 1, j: pj + 1, e1: fmt(E[0], 3), e2: fmt(E[1], 3), e3: fmt(E[2], 3), inout: t(E.every(v => v >= 0) ? 's2in' : 's2out') });
}
function setupPick2() {
  const cv = $('c2');
  const toUnit = e => { const b = cv.getBoundingClientRect(), S = s2.view; return [(e.clientX - b.left - S.x0) / S.size, 1 - (e.clientY - b.top - S.y0) / S.size]; };
  cv.addEventListener('pointerdown', e => {
    if (!s2.view) return; const u = toUnit(e);
    const k = s2.tri.findIndex(p => Math.hypot(p[0] - u[0], p[1] - u[1]) * s2.view.size < 18);
    if (k >= 0) { s2.drag = k; cv.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    if (u[0] >= 0 && u[0] < 1 && u[1] >= 0 && u[1] < 1) { s2.probe = u; draw2(); }
  });
  cv.addEventListener('pointermove', e => {
    if (s2.drag < 0) return; const u = toUnit(e).map(v => Math.max(0.02, Math.min(0.98, v)));
    s2.tri[s2.drag] = u; draw2();
  });
  const end = () => { s2.drag = -1; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}

/* ---------- step 3: depth ---------- */
const N3 = 40, s3 = { method: 'zbuffer' };
const depthShade = d => { const u = Math.max(0, Math.min(1, d)); const g = Math.round(242 - 215 * u); return `rgb(${g},${Math.round(g * 1.01) > 255 ? 255 : Math.round(g * 1.01)},${Math.min(255, g + 9)})`; };
function draw3() {
  const tilt = num('tilt'), shift = num('shift');
  $('tiltv').textContent = fmt(tilt, 1); $('shiftv').textContent = fmt(shift);
  $('mZ').setAttribute('aria-pressed', s3.method === 'zbuffer'); $('mP').setAttribute('aria-pressed', s3.method === 'painter');
  const R = M.renderDepth(N3, tilt, shift, s3.method), Z = s3.method === 'zbuffer' ? R : M.renderDepth(N3, tilt, shift, 'zbuffer');
  const cmp = M.compareMethods(N3, tilt, shift);
  let { ctx, W, H } = fitCanvas($('c3a'));
  let S = screen(ctx, W, H, t('c3a')); let px = S.size / N3;
  ctx.fillStyle = '#0a1119'; ctx.fillRect(S.x0, S.y0, S.size, S.size);
  for (let j = 0; j < N3; j++) for (let i = 0; i < N3; i++) {
    const o = R.owner[j * N3 + i]; if (!o) continue;
    ctx.fillStyle = o === 1 ? C.cyan : C.orange; ctx.fillRect(S.X(i / N3), S.Y((j + 1) / N3), px + 0.4, px + 0.4);
  }
  if (s3.method === 'painter') {
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 1.6;
    for (let k = 0; k < N3 * N3; k++) if (R.owner[k] !== Z.owner[k]) { const i = k % N3, j = Math.floor(k / N3); ctx.strokeRect(S.X(i / N3) + 1, S.Y((j + 1) / N3) + 1, px - 2, px - 2); }
    ctx.restore();
  }
  [M.TRI_A, M.TRI_B].forEach(tr => poly(ctx, tr.map(p => [S.X(p[0]), S.Y(p[1])]), { stroke: 'rgba(232,237,244,0.75)', lw: 1.2 }));
  ({ ctx, W, H } = fitCanvas($('c3b')));
  S = screen(ctx, W, H, t('c3b')); px = S.size / N3;
  ctx.fillStyle = '#0a1119'; ctx.fillRect(S.x0, S.y0, S.size, S.size);
  for (let k = 0; k < N3 * N3; k++) { if (!R.owner[k]) continue; const i = k % N3, j = Math.floor(k / N3); ctx.fillStyle = depthShade(R.depth[k]); ctx.fillRect(S.X(i / N3), S.Y((j + 1) / N3), px + 0.4, px + 0.4); }
  [M.TRI_A, M.TRI_B].forEach((tr, q) => poly(ctx, tr.map(p => [S.X(p[0]), S.Y(p[1])]), { stroke: q ? C.orange : C.cyan, lw: 1.4 }));
  const zb = M.depthsB(tilt, shift);
  $('r3').textContent = t('s3readout', { m: t(s3.method === 'zbuffer' ? 'mZ' : 'mP'), z1: f2(zb[0]), z2: f2(zb[1]), z3: f2(zb[2]), both: cmp.both, an: cmp.aNear, bn: cmp.bNear, wrong: cmp.wrong });
}

/* ---------- step 4: shading ---------- */
const N4 = 64;
function draw4() {
  const az = num('az'), el = num('el'), ka = num('ka'), p = num('p');
  $('azv').textContent = az + '°'; $('elv').textContent = el + '°'; $('kav').textContent = fmt(ka); $('pv').textContent = p === 0 ? '0' : String(p);
  const l = M.lightDir(az, el), px = M.renderSphere(N4, l, ka, p);
  let { ctx, W, H } = fitCanvas($('c4a'));
  const S = screen(ctx, W, H, t('c4a')), cs = S.size / N4;
  ctx.fillStyle = '#05080c'; ctx.fillRect(S.x0, S.y0, S.size, S.size);
  px.forEach(q => { const g = Math.round(255 * q.I); ctx.fillStyle = `rgb(${g},${g},${Math.min(255, Math.round(g * 1.04))})`; ctx.fillRect(S.x0 + q.i * cs, S.y0 + S.size - (q.j + 1) * cs, cs + 0.4, cs + 0.4); });
  // light direction projected onto the picture plane (dashed when the light is behind the ball)
  const cx = S.x0 + S.size / 2, cy = S.y0 + S.size / 2, R = S.size / 2 / 1.05, lp = Math.hypot(l[0], l[1]);
  if (lp > 1e-6) {
    const ux = l[0] / lp, uy = l[1] / lp, r0 = R * 0.15, r1 = R * (0.15 + 0.8 * lp);
    if (l[2] >= 0) arrow(ctx, cx + ux * r0, cy - uy * r0, cx + ux * r1, cy - uy * r1, C.pink, 2.4);
    else line(ctx, [[cx + ux * r0, cy - uy * r0], [cx + ux * r1, cy - uy * r1]], C.pink, 2.4, [5, 4]);
  } else dot(ctx, cx, cy, 5, C.pink, l[2] < 0);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const xt = W < 360 ? [0, 90, 180] : [0, 45, 90, 135, 180];
  const B = panel(ctx, W, { top: 32, bottom: H - 24, left: 38, xMin: 0, xMax: 180, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], xTicks: xt, title: t('c4b') });
  const curve = []; for (let a = 0; a <= 180; a += 1) curve.push([B.x(a), B.y(ka + (1 - ka) * Math.max(0, Math.cos(a * DEG)))]);
  line(ctx, curve, C.orange, 5, null, 0.55);
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.8)';
  let spec = 0;
  px.forEach(q => { const a = Math.acos(Math.max(-1, Math.min(1, q.ndl))) / DEG, lam = ka + (1 - ka) * Math.max(0, q.ndl); if (q.I > lam + 0.02) spec++; ctx.fillRect(B.x(a) - 1.2, B.y(q.I) - 1.2, 2.4, 2.4); });
  ctx.restore();
  const g = Math.acos(Math.max(-1, Math.min(1, l[2]))) / DEG, lit = M.litFraction(px) * 100, pred = (1 + l[2]) / 2 * 100;
  const max = px.reduce((m, q) => Math.max(m, q.I), 0);
  $('r4').textContent = t('s4readout', { g: fmt(g, 1), lit: fmt(lit, 1), pred: fmt(pred, 1), max: fmt(max, 3), spec: spec ? t('s4spec1', { n: spec }) : t('s4spec0') });
}

/* ---------- step 5: supersampling ---------- */
const N5 = 16;
function draw5() {
  const k = num('spp'), n = M.SPP_N[k], spp = n * n, dy = num('dy');
  $('sppv').textContent = String(spp); $('dyv').textContent = fmt(dy);
  const tri = M.shiftTri(M.SLIVER, dy / N5), res = M.aaError(tri, N5, n);
  let { ctx, W, H } = fitCanvas($('c5a'));
  const S = screen(ctx, W, H, t('c5a')), cs = S.size / N5;
  for (let j = 0; j < N5; j++) for (let i = 0; i < N5; i++) { const g = Math.round(13 + 220 * res.c[j * N5 + i]); ctx.fillStyle = `rgb(${g},${Math.min(255, g + 6)},${Math.min(255, g + 14)})`; ctx.fillRect(S.X(i / N5), S.Y((j + 1) / N5), cs + 0.4, cs + 0.4); }
  ctx.save(); ctx.strokeStyle = 'rgba(154,170,189,0.25)'; ctx.lineWidth = 1;
  for (let q = 0; q <= N5; q++) { ctx.beginPath(); ctx.moveTo(S.X(q / N5), S.y0); ctx.lineTo(S.X(q / N5), S.y0 + S.size); ctx.stroke(); ctx.beginPath(); ctx.moveTo(S.x0, S.Y(q / N5)); ctx.lineTo(S.x0 + S.size, S.Y(q / N5)); ctx.stroke(); }
  ctx.restore();
  poly(ctx, tri.map(p => [S.X(p[0]), S.Y(p[1])]), { stroke: C.text, lw: 1.6 });
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const errs = M.SPP_N.map(m => M.aaError(tri, N5, m).mean);
  const B = panel(ctx, W, { top: 32, bottom: H - 24, left: 46, xMin: -0.3, xMax: 4.3, yMin: -3.3, yMax: 0.2, yTicks: [{ v: 0, label: '1' }, { v: -1, label: '0.1' }, { v: -2, label: '0.01' }, { v: -3, label: '0.001' }], xTicks: [0, 1, 2, 3, 4], noXLabels: true, title: t('c5b') });
  ctx.save(); ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  M.SPP_N.forEach((m, q) => ctx.fillText(String(m * m), B.x(q), B.P.b + 15)); ctx.restore();
  line(ctx, errs.map((e, q) => [B.x(q), B.y(Math.log10(e))]), C.green, 1.6, null, 0.7);
  errs.forEach((e, q) => dot(ctx, B.x(q), B.y(Math.log10(e)), q === k ? 6 : 4, q === k ? C.text : C.green));
  const sum = res.c.reduce((a, b) => a + b, 0), ex = res.e.reduce((a, b) => a + b, 0);
  $('r5').textContent = t('s5readout', { spp, dy: fmt(dy), m: res.touched, mean: fmt(res.mean, 4), worst: fmt(res.worst, 3), sum: fmt(sum, 2), ex: fmt(ex, 2) });
  $('h5').textContent = t('s5hint', { e1: fmt(errs[0], 3), e256: fmt(errs[4], 4) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['rot', 'scl', 'tx', 'ty'].forEach(id => $(id).addEventListener('input', draw0));
  $('oTRS').addEventListener('click', () => { s0.order = 'TRS'; draw0(); });
  $('oRST').addEventListener('click', () => { s0.order = 'RST'; draw0(); });
  ['f', 'dolly'].forEach(id => $(id).addEventListener('input', draw1));
  $('n').addEventListener('input', () => { stopAnim('s2'); s2.rows = Infinity; draw2(); });
  $('scan2').addEventListener('click', () => { const N = num('n'); s2.rows = 0; draw2(); animate('s2', Math.min(5000, 140 * N), p => { s2.rows = Math.round(p * N); draw2(); }, () => { s2.rows = Infinity; draw2(); }); });
  setupPick2();
  ['tilt', 'shift'].forEach(id => $(id).addEventListener('input', draw3));
  $('mZ').addEventListener('click', () => { s3.method = 'zbuffer'; draw3(); });
  $('mP').addEventListener('click', () => { s3.method = 'painter'; draw3(); });
  ['az', 'el', 'ka', 'p'].forEach(id => $(id).addEventListener('input', draw4));
  ['spp', 'dy'].forEach(id => $(id).addEventListener('input', draw5));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshGfx = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
