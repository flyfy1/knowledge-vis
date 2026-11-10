'use strict';
// Cosmic expansion lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout comes from window.COSMO_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and the A/B/C galaxy tags (drawn only when they fit); sentences and legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.COSMO_MODEL;
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
  const height = Number(canvas.dataset.h);
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
/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

/* ---------- galaxy map shared by steps 0 and 1 ---------- */
const HOMES = [[0, 0], [3, -1], [-2, 2], [5, 3], [-4, -3]];
const R1 = 46; // step 1 shows galaxies within this physical radius (Mpc)
const MARK = [[1, 0, 'A'], [1, 2, 'B'], [-2, -1, 'C']];
const MCOL = [C.cyan, C.green, C.pink];
const VIEW = 40; // the shorter half-side of the map shows this many physical Mpc
const map = { home: HOMES[0].slice(), hi: 0 };
const marked = () => MARK.map(([di, dj, name], k) => ({ g: [map.home[0] + di, map.home[1] + dj], name, col: MCOL[k] }));
// Map geometry: home galaxy at the centre, y up.
function mapFrame(W, top, bottom) {
  const cx = W / 2, cy = (top + bottom) / 2, s = Math.min(W / 2 - 12, (bottom - top) / 2 - 8) / VIEW;
  return { cx, cy, s, top, bottom, X: dx => cx + dx * s, Y: dy => cy - dy * s, inside: (X, Y, m = 0) => X > m && X < W - m && Y > top + m && Y < bottom - m };
}
// All lattice galaxies whose physical position at scale a falls in the frame.
function visible(F, a, W) {
  const out = [], hc = M.chi(map.home[0], map.home[1]), R = (Math.max(W / 2, (F.bottom - F.top) / 2) / F.s) / Math.min(a, 1) / M.SPACING + 2;
  for (let i = Math.floor(map.home[0] - R); i <= Math.ceil(map.home[0] + R); i++) for (let j = Math.floor(map.home[1] - R); j <= Math.ceil(map.home[1] + R); j++) {
    const p = M.chi(i, j), d0 = [p[0] - hc[0], p[1] - hc[1]];
    out.push({ g: [i, j], d0, d: [a * d0[0], a * d0[1]] });
  }
  return out;
}
function pickHome(canvas, ev, a, top, bottom) {
  const r = canvas.getBoundingClientRect(), W = r.width, F = mapFrame(W, top, bottom);
  const px = ev.clientX - r.left, py = ev.clientY - r.top;
  if (py < top || py > bottom) return false;
  let best = null, bd = Infinity;
  visible(F, a, W).forEach(o => { const q = Math.hypot(F.X(o.d[0]) - px, F.Y(o.d[1]) - py); if (q < bd) { bd = q; best = o.g; } });
  if (!best || bd > 30) return false;
  map.home = best.slice(); return true;
}
function drawHome(ctx, F) {
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(F.cx, F.cy, 8, 0, 7); ctx.stroke();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(F.cx, F.cy, 3.5, 0, 7); ctx.fill(); ctx.restore();
}
function label(ctx, F, W, X, Y, text, col) {
  ctx.save(); ctx.font = '700 12px system-ui,sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'left';
  const tx = X + 7, ty = Y - 7;
  if (tx > 4 && tx + 12 < W - 4 && ty - 11 > F.top && ty + 2 < F.bottom) ctx.fillText(text, tx, ty);
  ctx.restore();
}
const homeName = () => `${map.home[0]}, ${map.home[1]}`;

/* ---------- step 0: one factor ---------- */
function draw0() {
  const a = num('a0');
  $('a0v').textContent = a.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 18, W - 16);
  const F = mapFrame(W, 28, H - 6);
  ctx.save(); ctx.beginPath(); ctx.rect(0, F.top, W, F.bottom - F.top); ctx.clip();
  const gal = visible(F, a, W);
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 1;
  gal.forEach(o => { const X = F.X(o.d0[0]), Y = F.Y(o.d0[1]); if (F.inside(X, Y, -6)) { ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(X, Y, 4, 0, 7); ctx.stroke(); } });
  ctx.globalAlpha = 1;
  // radial guide from the ring to the dot for every visible galaxy
  gal.forEach(o => { const X0 = F.X(o.d0[0]), Y0 = F.Y(o.d0[1]), X = F.X(o.d[0]), Y = F.Y(o.d[1]); if (F.inside(X, Y, -6) || F.inside(X0, Y0, -6)) line(ctx, [[X0, Y0], [X, Y]], C.faint, 1, null, 0.8); });
  gal.forEach(o => { const X = F.X(o.d[0]), Y = F.Y(o.d[1]); if (F.inside(X, Y, -6)) dot(ctx, X, Y, 2.8, C.text); });
  const mk = marked().map(m => { const o = { g: m.g, d: M.separation(a, map.home, m.g), d1: M.separation(1, map.home, m.g) }; return { ...m, ...o }; });
  mk.forEach(m => { const X = F.X(m.d[0]), Y = F.Y(m.d[1]); line(ctx, [[F.cx, F.cy], [X, Y]], m.col, 1.6, [5, 4]); dot(ctx, X, Y, 5, m.col, true); });
  ctx.restore();
  mk.forEach(m => { const X = F.X(m.d[0]), Y = F.Y(m.d[1]); if (F.inside(X, Y)) label(ctx, F, W, X, Y, m.name, m.col); });
  drawHome(ctx, F);
  const r = {}; mk.forEach(m => { r['d' + m.name] = fx(M.dist(m.d), 1); r['d' + m.name + '1'] = fx(M.dist(m.d1), 1); });
  $('r0').textContent = t('s0readout', { home: homeName(), a: a.toFixed(2), ...r });
}

/* ---------- step 1: Hubble's law ---------- */
function draw1() {
  const H0 = num('h1');
  $('h1v').textContent = String(H0);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 18, W - 16);
  const F = mapFrame(W, 28, 300);
  ctx.save(); ctx.beginPath(); ctx.rect(0, F.top, W, F.bottom - F.top); ctx.clip();
  const gal = visible(F, 1, W).filter(o => M.dist(o.d) <= R1 && F.inside(F.X(o.d[0]), F.Y(o.d[1]), -4)); // a round patch keeps the radial pattern readable
  const k = 0.32 / 70; // arrow length = 0.32 × distance at H0 = 70
  gal.forEach(o => {
    if (o.g[0] === map.home[0] && o.g[1] === map.home[1]) return;
    const X = F.X(o.d[0]), Y = F.Y(o.d[1]), v = M.velocity(H0, 1, map.home, o.g);
    const X2 = F.X(o.d[0] + v[0] * k), Y2 = F.Y(o.d[1] + v[1] * k);
    arrow(ctx, X, Y, X2, Y2, C.orange);
    dot(ctx, X, Y, 2.6, C.text);
  });
  const mk = marked();
  mk.forEach(m => { const d = M.separation(1, map.home, m.g); dot(ctx, F.X(d[0]), F.Y(d[1]), 5, m.col, true); });
  ctx.restore();
  mk.forEach(m => { const d = M.separation(1, map.home, m.g); label(ctx, F, W, F.X(d[0]), F.Y(d[1]), m.name, m.col); });
  drawHome(ctx, F);
  const B = panel(ctx, W, { top: 342, bottom: H - 28, xMin: 0, xMax: 50, yMin: 0, yMax: 5000, yTicks: [0, 1000, 2000, 3000, 4000, 5000], xSteps: [10, 20], title: t('c1b'), left: 48 });
  line(ctx, [[B.x(0), B.y(0)], [B.x(50), B.y(H0 * 50)]], C.cyan, 2);
  gal.forEach(o => { const d = M.dist(o.d); if (d > 0) dot(ctx, B.x(d), B.y(H0 * d), 3, C.text); });
  const r = {};
  mk.forEach(m => { const d = M.dist(M.separation(1, map.home, m.g)), v = M.dist(M.velocity(H0, 1, map.home, m.g)); r['d' + m.name] = fx(d, 1); r['v' + m.name] = fx(v, 0); dot(ctx, B.x(d), B.y(v), 5, m.col, true); });
  $('r1').textContent = t('s1readout', { home: homeName(), H: H0, ...r, tH: fx(M.hubbleTime(H0), 2) });
}
function arrow(ctx, X1, Y1, X2, Y2, col) {
  const L = Math.hypot(X2 - X1, Y2 - Y1); if (L < 2) return;
  const ux = (X2 - X1) / L, uy = (Y2 - Y1) / L, h = Math.min(6, L * 0.45);
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X2 - ux * h * 0.6, Y2 - uy * h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X2, Y2); ctx.lineTo(X2 - ux * h - uy * h * 0.5, Y2 - uy * h + ux * h * 0.5); ctx.lineTo(X2 - ux * h + uy * h * 0.5, Y2 - uy * h - ux * h * 0.5); ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ---------- step 2: measuring H0 ---------- */
const s2 = { set: 1, hist: [] };
function record2() { const i = num('d2'), dm = M.DMAX[i], h = M.fitH(M.catalogue(s2.set, dm)); if (!s2.hist.some(q => q.i === i && q.set === s2.set)) s2.hist.push({ i, set: s2.set, h }); }
function draw2() {
  const i = num('d2'), dm = M.DMAX[i], cat = M.catalogue(s2.set, dm), h = M.fitH(cat);
  $('d2v').textContent = String(dm);
  const { ctx, W, H } = fitCanvas($('c2'));
  const vTop = Math.max(...cat.map(p => p.v), M.H_TRUE * dm) * 1.08, vMin = Math.min(0, ...cat.map(p => p.v)) * 1.08;
  const yStep = niceStep(vTop - vMin, 150, 30, [250, 500, 1000, 2500, 5000, 10000]);
  const yT = []; for (let v = Math.ceil(vMin / yStep) * yStep; v <= vTop; v += yStep) yT.push(v);
  const A = panel(ctx, W, { top: 30, bottom: 220, xMin: 0, xMax: dm, yMin: Math.min(vMin, yT[0]), yMax: vTop, yTicks: yT, xSteps: [1, 2, 5, 10, 20, 50, 100], title: t('c2a'), left: 50 });
  line(ctx, [[A.x(0), A.y(0)], [A.x(dm), A.y(M.H_TRUE * dm)]], C.ghost, 1.6, [5, 4]);
  line(ctx, [[A.x(0), A.y(0)], [A.x(dm), A.y(h * dm)]], C.orange, 2.2);
  cat.forEach(p => dot(ctx, A.x(p.d), A.y(p.v), 3, C.text));
  // lower panel: index axis with the DMAX labels
  const B = panel(ctx, W, { top: 266, bottom: H - 28, xMin: -0.5, xMax: 9.5, yMin: 55, yMax: 85, yTicks: [55, 60, 65, 70, 75, 80, 85], noXTicks: true, title: t('c2b'), left: 50 });
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const every = W < 420 ? 3 : 1;
  M.DMAX.forEach((d, k) => { if (k % every === 0 || k === 9) ctx.fillText(String(d), B.x(k), B.P.b + 15); });
  ctx.restore();
  const band = []; const band2 = [];
  M.DMAX.forEach((d, k) => { const sg = M.sigmaH(d); band.push([B.x(k), B.y(Math.min(85, M.H_TRUE + sg))]); band2.push([B.x(k), B.y(Math.max(55, M.H_TRUE - sg))]); });
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.16)'; ctx.beginPath(); band.forEach(([X, Y], k) => (k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); band2.reverse().forEach(([X, Y]) => ctx.lineTo(X, Y)); ctx.closePath(); ctx.fill(); ctx.restore();
  line(ctx, [[B.P.l, B.y(70)], [B.P.r, B.y(70)]], C.ghost, 1.4, [5, 4]);
  s2.hist.forEach(q => { const cur = q.i === i && q.set === s2.set; if (!cur) dot(ctx, B.x(q.i), B.y(Math.max(55, Math.min(85, q.h))), 3.5, C.cyan); });
  dot(ctx, B.x(i), B.y(Math.max(55, Math.min(85, h))), 6, C.orange, true);
  const vmax = M.H_TRUE * dm;
  $('r2').textContent = t('s2readout', { s: s2.set, dmax: dm, h: fx(h, 1), e: fx((h - 70) / 70 * 100, 1), vmax: fx(vmax, 0), pct: fx(M.SIG_PEC / vmax * 100, vmax >= 3000 ? 1 : 0), sig: fx(M.sigmaH(dm), 1) });
}

/* ---------- step 3: redshift ---------- */
const s3 = { a: null, playing: false };
function draw3() {
  const ae = num('ae3'), a = s3.a === null ? 1 : s3.a;
  $('ae3v').textContent = ae.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 18, W - 16);
  const cx = W / 2, cy = 92, u = (W - 40) / 12, L1 = 2 * u;
  // comoving grid ticks, spaced by a·u
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
  line(ctx, [[8, cy + 46], [W - 8, cy + 46]], C.axis, 1);
  for (let k = -30; k <= 30; k++) { const X = cx + k * a * u; if (X < 8 || X > W - 8) continue; ctx.beginPath(); ctx.moveTo(X, cy + 40); ctx.lineTo(X, cy + 52); ctx.stroke(); }
  ctx.restore();
  const wave = (aa, col, lw, alpha) => {
    const lam = aa * L1, half = 1.5 * lam, pts = [];
    for (let X = cx - half; X <= cx + half + 0.01; X += Math.max(0.5, lam / 40)) pts.push([X, cy - 30 * Math.sin(2 * Math.PI * (X - cx) / lam)]);
    line(ctx, pts, col, lw, null, alpha);
  };
  wave(ae, C.faint, 2, 1);
  wave(a, C.orange, 2.4, 1);
  // spectrum panel, log wavelength axis
  const lo = Math.log(300), hi = Math.log(8000), P = { l: 14, r: W - 14, t: 214, b: H - 40 };
  const X = l => P.l + (Math.log(l) - lo) / (hi - lo) * (P.r - P.l);
  title(ctx, t('c3b'), 8, P.t - 10, W - 16);
  const grad = ctx.createLinearGradient(X(380), 0, X(750), 0);
  ['#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'].forEach((c, k) => grad.addColorStop(k / 5, c));
  ctx.fillStyle = C.panel; ctx.fillRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.globalAlpha = 0.55; ctx.fillStyle = grad; ctx.fillRect(X(380), P.t, X(750) - X(380), P.b - P.t); ctx.globalAlpha = 1;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const ticks = W < 420 ? [300, 1000, 3000, 8000] : [300, 500, 1000, 2000, 5000, 8000];
  ticks.forEach(l => { line(ctx, [[X(l), P.b], [X(l), P.b + 4]], C.grid, 1); ctx.fillText(String(l), X(l), P.b + 16); });
  ctx.restore();
  const lr = M.LAMBDA_HA, lnow = lr / ae * a;
  line(ctx, [[X(lr), P.t], [X(lr), P.b]], C.ghost, 1.6, [4, 3]);
  if (lnow > lr * 1.001) arrow(ctx, X(lr), (P.t + P.b) / 2, X(lnow), (P.t + P.b) / 2, C.faint);
  line(ctx, [[X(lnow), P.t], [X(lnow), P.b]], C.pink, 3);
  const z = M.redshift(ae), lobs = M.observed(lr, ae);
  const base = t('s3readout', { ae: ae.toFixed(2), opz: fx(1 + z, 2), z: fx(z, 2), lobs: fx(lobs, 1), vis: lobs <= 750 ? t('visIn') : t('visOut'), tl: fx(M.lookback(z), 2), cz: fx(z, 2) });
  $('r3').textContent = (s3.playing ? t('s3prog', { a: a.toFixed(2), l: fx(lnow, 0) }) : '') + base;
}

/* ---------- step 4: expansion history ---------- */
const T4 = 30;
const s4 = { old: new Set([0.3]) };
function draw4() {
  const Om = num('om4'), th = M.hubbleTime(M.H_TRUE);
  $('om4v').textContent = Om.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: 236, xMin: 0, xMax: T4, yMin: 0, yMax: 3, yTicks: [0, 1, 2, 3], xSteps: [5, 10], title: t('c4a') });
  const B = panel(ctx, W, { top: 282, bottom: H - 28, xMin: 0, xMax: T4, yMin: 0, yMax: 0.25, yTicks: [0, 0.1, 0.2], xSteps: [5, 10], title: t('c4b') });
  const rate = (a, om) => Math.sqrt(om / a + (1 - om) * a * a) / th;
  const curves = (om, col, lw) => {
    const pa = [], pr = [];
    for (let tt = 0.02; tt <= T4 + 1e-9; tt += 0.1) { const a = M.scaleAt(tt, om); if (a > 3.05) break; pa.push([A.x(tt), A.y(a)]); const r = rate(a, om); if (r <= 0.26) pr.push([B.x(tt), B.y(r)]); }
    line(ctx, pa, col, lw); line(ctx, pr, col, lw);
  };
  [...s4.old].forEach(om => { if (Math.abs(om - Om) > 1e-9) curves(om, C.faint, 1.6); });
  line(ctx, [[A.P.l, A.y(1)], [A.P.r, A.y(1)]], C.ghost, 1, [4, 4]);
  curves(Om, C.cyan, 2.6);
  const age = M.age(Om), aAcc = M.accelA(Om);
  line(ctx, [[A.x(age), A.P.t], [A.x(age), A.P.b]], C.ghost, 1, [2, 4]); line(ctx, [[B.x(age), B.P.t], [B.x(age), B.P.b]], C.ghost, 1, [2, 4]);
  dot(ctx, A.x(age), A.y(1), 6, C.text, true); dot(ctx, B.x(age), B.y(rate(1, Om)), 5, C.text, true);
  let acc;
  if (!isFinite(aAcc)) acc = t('s4accNever');
  else {
    const tA = M.timeAt(aAcc, Om);
    if (tA <= T4 && aAcc <= 3) { dot(ctx, A.x(tA), A.y(aAcc), 5.5, C.green, true); dot(ctx, B.x(tA), B.y(rate(aAcc, Om)), 5.5, C.green, true); }
    acc = aAcc <= 1 ? t('s4acc', { a: fx(aAcc, 2), z: fx(1 / aAcc - 1, 2), t: fx(tA, 2) }) : t('s4accFuture', { a: fx(aAcc, 2) });
  }
  $('r4').textContent = t('s4readout', { Om: Om.toFixed(2), OL: (1 - Om).toFixed(2), age: fx(age, 2), tH: fx(th, 2), ratio: fx(age / th, 3), q0: fx(M.q0(Om), 3), acc });
}

/* ---------- step 5: three distances ---------- */
const Z5 = [];
for (let z = 0; z <= 10.0001; z += 0.05) Z5.push(M.distances(z));
function draw5() {
  const z = num('z5');
  $('z5v').textContent = z.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 0, xMax: 10, yMin: 0, yMax: 35, yTicks: [0, 5, 10, 15, 20, 25, 30, 35], xSteps: [1, 2], title: t('c5a') });
  const dH = M.hubbleDist(M.H_TRUE) * M.GLY_PER_MPC;
  line(ctx, [[A.P.l, A.y(dH)], [A.P.r, A.y(dH)]], C.ghost, 1.4, [5, 4]);
  line(ctx, Z5.map(d => [A.x(d.z), A.y(d.chiGly)]), C.cyan, 2.4);
  line(ctx, Z5.map(d => [A.x(d.z), A.y(d.travelGly)]), C.orange, 2.4);
  line(ctx, Z5.map(d => [A.x(d.z), A.y(d.emitGly)]), C.green, 2.4);
  const d = M.distances(z);
  line(ctx, [[A.x(z), A.P.t], [A.x(z), A.P.b]], C.text, 1, [3, 4]);
  dot(ctx, A.x(z), A.y(d.chiGly), 5.5, C.cyan, true); dot(ctx, A.x(z), A.y(d.travelGly), 5.5, C.orange, true); dot(ctx, A.x(z), A.y(d.emitGly), 5.5, C.green, true);
  $('r5').textContent = t('s5readout', { z: z.toFixed(2), lt: fx(d.travelGly, 2), co: fx(d.chiGly, 2), em: fx(d.emitGly, 2), v: fx(d.vOverC, 2), vNote: d.vOverC > 1 ? t('s5vNote') : '' });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('a0').addEventListener('input', draw0);
  const nextHome = () => { map.hi = (map.hi + 1) % HOMES.length; map.home = HOMES[map.hi].slice(); draw0(); draw1(); };
  $('home0').addEventListener('click', nextHome); $('home1').addEventListener('click', nextHome);
  $('c0').addEventListener('click', ev => { if (pickHome($('c0'), ev, num('a0'), 28, Number($('c0').dataset.h) - 6)) { draw0(); draw1(); } });
  $('c1').addEventListener('click', ev => { if (pickHome($('c1'), ev, 1, 28, 300)) { draw0(); draw1(); } });
  $('h1').addEventListener('input', draw1);
  $('d2').addEventListener('input', () => { record2(); draw2(); });
  $('reroll2').addEventListener('click', () => { s2.set = s2.set % M.N_SETS + 1; record2(); draw2(); });
  $('clear2').addEventListener('click', () => { s2.hist = []; record2(); draw2(); });
  record2();
  $('ae3').addEventListener('input', () => { stopAnim('s3'); s3.playing = false; s3.a = null; draw3(); });
  $('play3').addEventListener('click', () => {
    const ae = num('ae3'), t0 = M.timeAt(ae, 0.3), t1 = M.age(0.3);
    s3.playing = true; s3.a = ae; draw3();
    animate('s3', 4000, p => { s3.a = Math.min(1, M.scaleAt(t0 + p * (t1 - t0), 0.3)); if (p >= 1) s3.a = 1; draw3(); }, () => { s3.playing = false; s3.a = null; draw3(); });
  });
  $('om4').addEventListener('input', draw4);
  $('om4').addEventListener('change', () => { s4.old.add(num('om4')); draw4(); });
  $('z5').addEventListener('input', draw5);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
