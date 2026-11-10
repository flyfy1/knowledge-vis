'use strict';
// Atmospheric circulation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, arrow and readout comes from window.CIRC_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and a few short labels that are measured first and only drawn where they fit.
(function () {

const $ = id => document.getElementById(id);
const M = window.CIRC_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const lang = () => window.LESSON_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#ffd166', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', blue: '#678cf9', brown: '#6b5638', sea: '#1d4f7c' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const degC = () => (lang() === 'zh' ? ' ℃' : ' °C');
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (90 stays 90).
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const group = s => { const [i, f] = s.split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : ''); };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Draw `text` shrinking the font until it fits maxW; returns false (draws nothing) if it cannot fit at minSize.
function fitText(ctx, text, X, Y, maxW, { size = 12, min = 8, weight = '', color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.textAlign = align; ctx.fillStyle = color;
  let s = size;
  for (; s >= min; s -= 0.5) { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; }
  const ok = s >= min; if (ok) ctx.fillText(text, X, Y); ctx.restore(); return ok;
}
const title = (ctx, text, X, Y, maxW) => fitText(ctx, text, X, Y, maxW, { size: 12, min: 7, weight: '600' });
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Linear plot panel. Title sits in its own row above the plot; tick labels left of / below it.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 2), P.l - 6, y(v) + 4);
  }
  const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);
  ctx.textAlign = 'center';
  if (!o.noX) for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v, 2), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function polyline(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (ring) { ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
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
const latFmt = v => (v === 0 ? '0°' : Math.abs(v) + '°' + (v > 0 ? 'N' : 'S'));
function arrowHead(ctx, x, y, ang, size, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(ang - 0.45) * size, y - Math.sin(ang - 0.45) * size); ctx.lineTo(x - Math.cos(ang + 0.45) * size, y - Math.sin(ang + 0.45) * size); ctx.closePath(); ctx.fill(); ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, color, lw = 2) { const a = Math.atan2(y1 - y0, x1 - x0), hs = 5 + lw * 1.5; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hs * 0.7, y1 - Math.sin(a) * hs * 0.7); ctx.stroke(); ctx.restore(); arrowHead(ctx, x1, y1, a, hs, color); }
function shadeBetween(ctx, xs, ya, yb, colPos, colNeg) {
  for (let i = 0; i < xs.length - 1; i++) {
    const pos = (ya[i] + ya[i + 1]) < (yb[i] + yb[i + 1]); // canvas y: smaller = higher, so a above b
    ctx.fillStyle = pos ? colPos : colNeg; ctx.beginPath(); ctx.moveTo(xs[i], ya[i]); ctx.lineTo(xs[i + 1] + 0.6, ya[i + 1]); ctx.lineTo(xs[i + 1] + 0.6, yb[i + 1]); ctx.lineTo(xs[i], yb[i]); ctx.closePath(); ctx.fill();
  }
}

/* ---------- step 0: how much heat must move ---------- */
const EBM0 = M.ebm(0);
function draw0() {
  const D = num('D0'), r = M.ebm(D);
  $('D0v').textContent = fmt(D, 2);
  const { ctx, W, H } = fitCanvas($('c0'));
  // cell centres plus the pole itself (value of the last cell: no flux crosses the pole)
  const lat = [...r.xs.map(x => Math.asin(x) / M.DEG), 90], Tr = [...r.T, r.T[r.T.length - 1]], T0 = [...EBM0.T, EBM0.T[EBM0.T.length - 1]], xsx = [...r.xs, 1];
  const xo = { xMin: 0, xMax: 90, xSteps: [15, 30], minPx: 34, xFmt: v => v + '°', left: 42 };
  const A = panel(ctx, W, { ...xo, top: 26, bottom: 168, yMin: -60, yMax: 60, yTicks: [-60, -30, 0, 30, 60], title: t('c0a') });
  polyline(ctx, lat.map((p, i) => [A.x(p), A.y(T0[i])]), C.ghost, 1.6, [5, 4]);
  polyline(ctx, lat.map((p, i) => [A.x(p), A.y(Tr[i])]), C.text, 2.6);
  const B = panel(ctx, W, { ...xo, top: 214, bottom: 372, yMin: 50, yMax: 350, yTicks: [50, 150, 250, 350], title: t('c0b') });
  const xs = lat.map(p => B.x(p)), yin = xsx.map(x => B.y(M.absorbed(x))), yout = Tr.map(T => B.y(M.EBM.A + M.EBM.B * T));
  shadeBetween(ctx, xs, yin, yout, 'rgba(255,180,84,.35)', 'rgba(103,140,249,.35)');
  polyline(ctx, xs.map((X, i) => [X, yin[i]]), C.orange, 2.4); polyline(ctx, xs.map((X, i) => [X, yout[i]]), C.cyan, 2.4);
  if (r.cross !== null) { ctx.save(); ctx.strokeStyle = C.yellow; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.x(r.cross), B.P.t); ctx.lineTo(B.x(r.cross), B.P.b); ctx.stroke(); ctx.restore(); }
  const Cp = panel(ctx, W, { ...xo, top: 418, bottom: H - 26, yMin: 0, yMax: 8, yTicks: [0, 2, 4, 6, 8], title: t('c0c') });
  polyline(ctx, r.F.map((F, i) => [Cp.x(Math.asin(Math.min(1, i / M.EBM.N)) / M.DEG), Cp.y(F / 1e15)]), C.green, 2.6);
  if (r.peakPW > 0) dot(ctx, Cp.x(r.peakLat), Cp.y(r.peakPW), 4.5, C.green);
  const gap = r.eq - r.pole, gap0 = EBM0.eq - EBM0.pole;
  $('r0').textContent = D === 0 ? t('s0none', { eq: fmt(r.eq, 1), pole: fmt(r.pole, 1), gap: fmt(gap, 0), mean: fmt(r.mean, 1) })
    : t('s0readout', { D: fmt(D, 2), eq: fmt(r.eq, 1), pole: fmt(r.pole, 1), gap: fmt(gap, 0), gap0: fmt(gap0, 0), cross: fmt(r.cross, 0), pw: fmt(r.peakPW, 1), lat: fmt(r.peakLat, 0), mean: fmt(r.mean, 1) });
}

/* ---------- step 1: warm and cold columns ---------- */
const s1 = { phase: 0, raf: 0, visible: false, last: 0 };
function loopPath(geo, warmRight) {
  // rectangle loop: up over the warm column, across aloft, down over the cold one, back along the ground
  const xw = warmRight ? geo.xl : geo.xs, xc = warmRight ? geo.xs : geo.xl;
  return [[xw, geo.yb], [xw, geo.yt], [xc, geo.yt], [xc, geo.yb]];
}
function pointOnLoop(pts, f) {
  const seg = pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
  let d = f * seg.reduce((s, v) => s + v, 0);
  for (let i = 0; i < pts.length; i++) { if (d <= seg[i]) { const p = pts[i], q = pts[(i + 1) % pts.length], u = d / seg[i]; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; } d -= seg[i]; }
  return pts[0];
}
function draw1() {
  const dT = num('DT1'), col = M.columns(dT);
  $('DT1v').textContent = (dT > 0 ? '+' : '') + dT + degC();
  const { ctx, W, H } = fitCanvas($('c1'));
  const P = panel(ctx, W, { top: 26, bottom: H - 34, xMin: 0, xMax: 1, yMin: 0, yMax: 10, yTicks: [0, 2, 4, 6, 8, 10], noX: true, title: t('c1'), left: 30 });
  const cw = (P.P.r - P.P.l) * 0.2, xs = P.x(0.26), xl = P.x(0.7);
  ctx.fillStyle = 'rgba(29,79,124,.35)'; ctx.fillRect(xs - cw / 2, P.P.t, cw, P.P.b - P.P.t);
  ctx.fillStyle = 'rgba(107,86,56,.35)'; ctx.fillRect(xl - cw / 2, P.P.t, cw, P.P.b - P.P.t);
  fitText(ctx, t('sea'), xs, P.P.b + 20, cw, { size: 12, weight: '700', color: C.cyan, align: 'center' });
  fitText(ctx, t('land'), xl, P.P.b + 20, cw, { size: 12, weight: '700', color: C.orange, align: 'center' });
  for (let p = 900; p >= 300; p -= 100) {
    const ys = P.y(M.zOf(p, col.Tsea) / 1000), yl = P.y(M.zOf(p, col.Tland) / 1000);
    polyline(ctx, [[xs - cw / 2, ys], [xs + cw / 2, ys], [xl - cw / 2, yl], [xl + cw / 2, yl]], C.cyan, p === 500 ? 2.4 : 1.4, null, p === 500 ? 1 : 0.7);
    fitText(ctx, String(p), xl + cw / 2 + 6, yl + 4, P.P.r - (xl + cw / 2) - 6, { size: 10.5, min: 8, color: p === 500 ? C.cyan : C.muted });
  }
  if (dT !== 0) {
    const geo = { xs, xl, yb: P.y(0.5), yt: P.y(7.5) }, pts = loopPath(geo, dT > 0);
    ctx.save(); ctx.strokeStyle = 'rgba(255,180,84,.35)'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 5]); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; arrowHead(ctx, mx, my, Math.atan2(b[1] - a[1], b[0] - a[0]), 10, C.orange); }
    if (!reduceMotion()) for (let k = 0; k < 10; k++) { const [X, Y] = pointOnLoop(pts, (s1.phase + k / 10) % 1); dot(ctx, X, Y, 3, C.orange); }
  }
  const dir = dT > 0 ? t('s1warm') : dT < 0 ? t('s1cold') : t('s1zero');
  $('r1').textContent = t('s1readout', { tl: fmt(col.Tland - 273.15, 1), ts: fmt(col.Tsea - 273.15, 1), zl: group(fmt(col.z500land, 0)), zs: group(fmt(col.z500sea, 0)), dz: fmt(Math.abs(col.z500land - col.z500sea), 0), dp: fmt(Math.abs(col.dp5km), 1), dir });
}
function tick1(now) {
  s1.raf = 0;
  if (!s1.visible || document.hidden || reduceMotion() || num('DT1') === 0) return;
  const dt = s1.last ? Math.min(0.1, (now - s1.last) / 1000) : 0; s1.last = now;
  s1.phase = (s1.phase + dt * 0.04 * Math.sqrt(Math.abs(num('DT1')))) % 1; // schematic speed, not to scale
  draw1(); s1.raf = requestAnimationFrame(tick1);
}
function run1() { if (!s1.raf && s1.visible && !document.hidden && !reduceMotion()) { s1.last = 0; s1.raf = requestAnimationFrame(tick1); } }
function stop1() { if (s1.raf) cancelAnimationFrame(s1.raf); s1.raf = 0; }

/* ---------- step 2: a ring of air keeps its angular momentum ---------- */
function draw2() {
  const phi = num('P2');
  $('P2v').textContent = latFmt(phi);
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 17, W - 16);
  const cx = W / 2, cy = 30 + (H - 30) / 2, Rr = Math.min(W * 0.36, (H - 70) / 2);
  ctx.fillStyle = '#16324d'; ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, 7); ctx.fill();
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(cx, cy - Rr - 16); ctx.lineTo(cx, cy + Rr + 16); ctx.stroke(); ctx.restore();
  const ring = (lat, color, dash, lw) => {
    const y = cy - Rr * Math.sin(lat * M.DEG), rx = Rr * Math.cos(lat * M.DEG), ry = Math.max(2, rx * 0.22);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.ellipse(cx, y, rx, ry, 0, 0, 7); ctx.stroke(); ctx.restore();
    return { y, rx, ry };
  };
  ring(0, C.ghost, [5, 4], 1.4);
  const g = ring(phi, C.cyan, null, 2.6);
  arrowHead(ctx, cx + 6, g.y + g.ry, 0, 10, C.cyan); // the near side of the ring moves east = to the right
  polyline(ctx, [[cx, g.y], [cx + g.rx, g.y]], C.orange, 2, [4, 3]);
  dot(ctx, cx + g.rx, g.y, 5, C.orange);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -60, xMax: 60, yMin: 0, yMax: 750, yTicks: [0, 250, 500, 750], xSteps: [15, 30], minPx: 34, xFmt: latFmt, left: 40, title: t('c2b') });
  const curve = f => { const pts = []; for (let p = -60; p <= 60; p += 0.5) pts.push([P.x(p), P.y(f(p))]); return pts; };
  polyline(ctx, curve(M.groundSpeed), C.raw, 2); polyline(ctx, curve(M.uAM), C.orange, 2.6);
  ctx.save(); ctx.strokeStyle = C.yellow; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(P.x(phi), P.P.t); ctx.lineTo(P.x(phi), P.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, P.x(phi), P.y(M.uAM(phi)), 5.5, C.orange); dot(ctx, P.x(phi), P.y(M.groundSpeed(phi)), 4, C.raw);
  const r = M.R_EARTH * Math.cos(phi * M.DEG) / 1000, gs = M.groundSpeed(phi), u = M.uAM(phi);
  $('r2').textContent = t('s2readout', { phi: latFmt(phi), r: group(fmt(r, 0)), pct: fmt(Math.cos(phi * M.DEG) * 100, 0), g: fmt(gs, 0), abs: fmt(gs + u, 0), u: fmt(u, 0), f: fmt(M.coriolisF(phi) * 1e4, 2), side: t(phi > 0 ? 's2north' : phi < 0 ? 's2south' : 's2eq') });
}

/* ---------- step 3: how far does the Hadley cell reach? ---------- */
function draw3() {
  const hrs = num('H3'), dT = num('T3'), e = M.hadleyEdge(hrs, dT);
  $('H3v').textContent = hrs + (lang() === 'zh' ? ' 小时' : ' h'); $('T3v').textContent = dT + degC();
  const { ctx, W, H } = fitCanvas($('c3'));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 90, yMin: 0, yMax: 15, yTicks: [0, 5, 10, 15], xSteps: [15, 30], minPx: 34, xFmt: v => v + '°', left: 34, title: t('c3') });
  const edge = Math.min(88, e.deg);
  if (edge < 88) { // eddy-dominated region poleward of the cell
    ctx.fillStyle = 'rgba(103,215,249,.12)'; ctx.fillRect(P.x(edge), P.P.t, P.P.r - P.x(edge), P.P.b - P.P.t);
    ctx.save(); ctx.strokeStyle = 'rgba(103,215,249,.45)'; ctx.lineWidth = 1.4;
    for (let k = 0; k < 3; k++) { const yb = P.y(3 + k * 3.5); ctx.beginPath(); for (let X = P.x(edge) + 6; X <= P.P.r - 4; X += 2) { const Y = yb + Math.sin((X - P.x(edge)) / 9 + k) * 5; if (X === P.x(edge) + 6) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke(); }
    ctx.restore();
  }
  // the Hadley loop: rises at the equator, flows poleward aloft, sinks at the edge, returns along the ground
  const x0 = P.x(1.5), x1 = P.x(Math.max(3, edge - 1.5)), yT = P.y(11), yB = P.y(1.2), rx = (x1 - x0) / 2, ry = (yB - yT) / 2;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(x0 + rx, yT + ry, rx, ry, 0, 0, 7); ctx.stroke(); ctx.restore();
  arrowHead(ctx, x0 + rx, yT, 0, 11, C.orange); arrowHead(ctx, x0 + rx, yB, Math.PI, 11, C.orange);
  arrowHead(ctx, x0, yT + ry, -Math.PI / 2, 11, C.orange); arrowHead(ctx, x1, yT + ry, Math.PI / 2, 11, C.orange);
  polyline(ctx, [[P.x(30), P.P.t], [P.x(30), P.P.b]], C.green, 1.6, [5, 4]);
  const u = M.uAMat(Math.min(89.9, e.deg), e.omega);
  $('r3').textContent = e.deg >= 90 ? t('s3pole', { h: hrs, dT, phi: fmt(e.deg, 0) }) : t('s3readout', { h: hrs, dT, phi: fmt(e.deg, 0), u: fmt(u, 0), note: t(e.valid ? 's3valid' : 's3invalid') });
}

/* ---------- step 4: three cells and wind belts ---------- */
const DIR_KEY = { N: 'dirN', NE: 'dirNE', E: 'dirE', SE: 'dirSE', S: 'dirS', SW: 'dirSW', W: 'dirW', NW: 'dirNW' };
function draw4() {
  const phi = num('P4');
  $('P4v').textContent = latFmt(phi);
  const { ctx, W, H } = fitCanvas($('c4'));
  // top: pole-to-pole slice with six cells
  const A = panel(ctx, W, { top: 26, bottom: 196, xMin: -90, xMax: 90, yMin: 0, yMax: 1, yTicks: [], xSteps: [30, 60], minPx: 40, xFmt: latFmt, left: 12, right: 14, title: t('c4a') });
  [[0, 'rgba(103,215,249,.3)'], [60, 'rgba(103,215,249,.3)'], [-60, 'rgba(103,215,249,.3)'], [30, 'rgba(255,180,84,.3)'], [-30, 'rgba(255,180,84,.3)'], [90, 'rgba(255,180,84,.3)'], [-90, 'rgba(255,180,84,.3)']].forEach(([p, col]) => {
    const x0 = A.x(Math.max(-90, p - 5)), x1 = A.x(Math.min(90, p + 5)); ctx.fillStyle = col; ctx.fillRect(x0, A.P.b - 10, x1 - x0, 10);
  });
  const cells = [[0, 30, 1], [30, 60, -1], [60, 90, 1]]; // +1: clockwise in this view (top flows toward +latitude)
  [1, -1].forEach(hemi => cells.forEach(([a, b, cwise]) => {
    const lo = hemi > 0 ? a : -b, hi = hemi > 0 ? b : -a, dirn = cwise * hemi; // mirror image in the south
    const x0 = A.x(lo) + 4, x1 = A.x(hi) - 4, yT = A.P.t + 14, yB = A.P.b - 18, rx = (x1 - x0) / 2, ry = (yB - yT) / 2, cxx = x0 + rx, cyy = yT + ry;
    const inCell = Math.abs(phi) >= a && Math.abs(phi) < b && Math.sign(phi || 1) === hemi;
    ctx.save(); ctx.strokeStyle = inCell ? C.yellow : (a === 30 ? C.ghost : C.orange); ctx.lineWidth = inCell ? 2.6 : 1.8; if (a === 30) ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.ellipse(cxx, cyy, rx, ry, 0, 0, 7); ctx.stroke(); ctx.restore();
    const col = inCell ? C.yellow : (a === 30 ? C.ghost : C.orange);
    arrowHead(ctx, cxx, yT, dirn > 0 ? 0 : Math.PI, 9, col); arrowHead(ctx, cxx, yB, dirn > 0 ? Math.PI : 0, 9, col);
  }));
  polyline(ctx, [[A.x(phi), A.P.t], [A.x(phi), A.P.b]], C.yellow, 1.4, [4, 4]);
  dot(ctx, A.x(phi), A.P.b - 22, 5, C.yellow);
  // bottom: idealised map of surface winds
  const top = 242, bot = H - 14, L = 46, R = W - 12;
  title(ctx, t('c4b'), 8, top - 10, W - 16);
  const Y = p => top + (90 - p) / 180 * (bot - top);
  ctx.fillStyle = '#10263b'; ctx.fillRect(L, top, R - L, bot - top);
  ctx.save(); ctx.font = '10.5px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [-60, -30, 0, 30, 60].forEach(p => { ctx.strokeStyle = p === 0 ? C.axis : C.grid; ctx.setLineDash(p === 0 ? [] : [4, 4]); ctx.beginPath(); ctx.moveTo(L, Y(p)); ctx.lineTo(R, Y(p)); ctx.stroke(); ctx.fillText(latFmt(p), L - 6, Y(p) + 4); });
  ctx.restore();
  const nx = Math.max(4, Math.floor((R - L) / 70));
  for (let p = -75; p <= 75; p += 15) {
    if (p % 30 === 0 && p !== 0) continue;
    const w = M.surfaceWind(p), len = 22 * Math.hypot(w.u, w.v) / Math.SQRT2;
    if (len < 4) continue;
    for (let k = 0; k < nx; k++) {
      const X = L + (k + 0.5) * (R - L) / nx, ang = Math.atan2(-w.v, w.u), dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
      arrow(ctx, X - dx, Y(p) - dy, X + dx, Y(p) + dy, Math.abs(p - phi) < 7.5 ? C.yellow : C.cyan, 1.8);
    }
  }
  polyline(ctx, [[L, Y(phi)], [R, Y(phi)]], C.yellow, 1.4, [4, 4]);
  const w = M.surfaceWind(phi), b = M.band(phi);
  $('r4').textContent = t('s4readout', { phi: latFmt(phi), belt: t(b.belt), dir: t(DIR_KEY[M.fromDir(w.u, w.v)]), cell: t(b.cell), motion: t(b.motion) });
}

/* ---------- step 5: monsoon ---------- */
const s5 = { day: M.MONTH_DAY[6], depth: 50, run: null };
function draw5() {
  const depth = num('D5');
  if (depth !== s5.depth || !s5.run) { s5.depth = depth; s5.run = M.monsoon(depth); }
  const m = s5.run, d = s5.day, mi = M.monthOfDay(d);
  $('M5v').textContent = t('mon' + (mi + 1)); $('D5v').textContent = depth + (lang() === 'zh' ? ' 米' : ' m');
  const { ctx, W, H } = fitCanvas($('c5'));
  const P = panel(ctx, W, { top: 26, bottom: 250, xMin: 0, xMax: 364, yMin: -36, yMax: 36, yTicks: [-30, -15, 0, 15, 30], noX: true, left: 36, title: t('c5a') });
  // month labels: every month if there is room, else every third
  ctx.save(); ctx.font = '10.5px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const every = (P.P.r - P.P.l) / 12 > 34 ? 1 : 3;
  M.MONTH_DAY.forEach((md, i) => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.x(md - 15), P.P.t); ctx.lineTo(P.x(md - 15), P.P.b); ctx.stroke(); if (i % every === 0) ctx.fillText(t('mon' + (i + 1)), P.x(md), P.P.b + 15); });
  ctx.restore();
  polyline(ctx, m.sea.map((v, i) => [P.x(i), P.y(v)]), C.cyan, 2.4); polyline(ctx, m.land.map((v, i) => [P.x(i), P.y(v)]), C.pink, 2.4);
  polyline(ctx, [[P.x(d), P.P.t], [P.x(d), P.P.b]], C.yellow, 1.4, [4, 4]);
  dot(ctx, P.x(d), P.y(m.land[d]), 5, C.pink); dot(ctx, P.x(d), P.y(m.sea[d]), 5, C.cyan);
  // coast sketch: land to the north (top), sea to the south (bottom)
  const top = 294, bot = H - 12, L = 12, R = W - 12, coast = (top + bot) / 2;
  title(ctx, t('c5b'), 8, top - 10, W - 16);
  ctx.fillStyle = '#3a3122'; ctx.fillRect(L, top, R - L, coast - top);
  ctx.fillStyle = C.sea; ctx.fillRect(L, coast, R - L, bot - coast);
  ctx.save(); ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 2; ctx.beginPath(); for (let X = L; X <= R; X += 3) { const Y = coast + Math.sin(X / 23) * 4; if (X === L) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke(); ctx.restore();
  const diff = m.diff[d], landHigh = diff < 0, lab = (s, X, Y, col) => fitText(ctx, s, X, Y, 60, { size: 20, min: 12, weight: '800', color: col, align: 'center' });
  if (Math.abs(diff) >= 1) { lab(t(landHigh ? 'highH' : 'lowL'), L + (R - L) * 0.2, top + (coast - top) * 0.5 + 7, landHigh ? C.orange : C.cyan); lab(t(landHigh ? 'lowL' : 'highH'), L + (R - L) * 0.2, coast + (bot - coast) * 0.5 + 7, landHigh ? C.cyan : C.orange); }
  fitText(ctx, t('s5lgLand'), R - 8, top + 18, (R - L) * 0.3, { size: 12, weight: '700', color: '#d8c39a', align: 'right' });
  fitText(ctx, t('s5lgSea'), R - 8, bot - 8, (R - L) * 0.3, { size: 12, weight: '700', color: C.cyan, align: 'right' });
  if (Math.abs(diff) >= 1) {
    // surface wind from the cool side to the warm side, turned to the right (northern hemisphere)
    const len = Math.min(1, Math.abs(diff) / 25) * (bot - top) * 0.36 + 14, ang = diff > 0 ? -Math.PI / 4 : (3 * Math.PI) / 4; // SW wind blows toward NE (up-right)
    const cxx = L + (R - L) * 0.55, cyy = coast, dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
    arrow(ctx, cxx - dx, cyy - dy, cxx + dx, cyy + dy, C.yellow, 4);
  }
  const wind = Math.abs(diff) < 1 ? t('s5calm') : t(diff > 0 ? 's5summer' : 's5winter');
  $('r5').textContent = t('s5readout', { m: t('mon' + (mi + 1)), land: (m.land[d] >= 0 ? '+' : '') + fmt(m.land[d], 1), sea: (m.sea[d] >= 0 ? '+' : '') + fmt(m.sea[d], 1), diff: (diff >= 0 ? '+' : '') + fmt(diff, 1), wind, la: fmt(m.landAmp, 1), sa: fmt(m.seaAmp, 1), lp: t('mon' + (M.monthOfDay(m.landPeak) + 1)), sp: t('mon' + (M.monthOfDay(m.seaPeak) + 1)) });
}

function draw6() {
  const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state, { a: fmt(M.hadleyEdge(24, 115).deg, 0), b: fmt(M.hadleyEdge(48, 115).deg, 0) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('D0').addEventListener('input', draw0);
  $('DT1').addEventListener('input', () => { draw1(); run1(); });
  $('P2').addEventListener('input', draw2);
  ['H3', 'T3'].forEach(id => $(id).addEventListener('input', draw3));
  $('P4').addEventListener('input', draw4);
  $('M5').addEventListener('input', () => { stopAnim('s5'); s5.day = M.MONTH_DAY[num('M5') - 1]; draw5(); });
  $('D5').addEventListener('input', draw5);
  $('play5').addEventListener('click', () => animate('s5', 9000, p => { s5.day = Math.min(364, Math.round(p * 364)); $('M5').value = M.monthOfDay(s5.day) + 1; draw5(); }));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b', fb = $('quizFeedback');
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.style.color = ok ? C.green : C.orange; draw6();
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    new IntersectionObserver(es => es.forEach(e => { s1.visible = e.isIntersecting; if (s1.visible) run1(); else stop1(); })).observe($('c1'));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); stop1(); } else run1(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
