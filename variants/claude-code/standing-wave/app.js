'use strict';
// Standing-wave lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, marker and readout comes from window.SW_MODEL (model.js); there is no separate visual layer.
// Canvas text is limited to panel titles (own row) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SW_MODEL;
const t = (...a) => window.SW_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#7d8ea3', ghost: '#8696aa', fn: '#6b7f97' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 9);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel; title in its own row above, ticks left of / below the plot. yFmt formats y tick labels.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === (o.yAxisAt === undefined ? 0 : o.yAxisAt) ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.5, 1, 2, 5]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v, 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function curve(ctx, m, f, x0, x1, color, lw = 2, n = 240, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const xv = x0 + (x1 - x0) * i / n, X = m.x(xv), Y = m.y(f(xv)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
const dot = (ctx, X, Y, r, fill, stroke) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } };
function ring(ctx, X, Y) { ctx.save(); dot(ctx, X, Y, 4.5, C.bg, C.orange); ctx.restore(); }
function diamond(ctx, X, Y) { ctx.save(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(X, Y - 5); ctx.lineTo(X + 5, Y); ctx.lineTo(X, Y + 5); ctx.lineTo(X - 5, Y); ctx.closePath(); ctx.fill(); ctx.restore(); }
function tri(ctx, X, Y, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X - 6, Y); ctx.lineTo(X + 6, Y); ctx.lineTo(X, Y + 9); ctx.closePath(); ctx.fill(); ctx.restore(); }
function vguide(ctx, X, y0, y1, color = C.cyan) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function clamp(ctx, X, yTop, yBot) { ctx.save(); ctx.fillStyle = '#3a4b60'; ctx.fillRect(X - 4, yTop, 8, yBot - yTop); ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(X - 4, yTop, 8, yBot - yTop); ctx.restore(); }

/* ---------- clocks: one rAF loop, only for playing steps that are on screen ---------- */
const anim = { on: [false, false, false, false, false], t: [0.6, 0.5, 0, 0, 0], visible: new Set(), raf: null, last: 0 };
const DRAW = [];
function anyActive() { return !document.hidden && anim.on.some((on, s) => on && anim.visible.has(s)); }
function ensureLoop() { if (anim.raf === null && anyActive()) { anim.last = performance.now(); anim.raf = requestAnimationFrame(loop); } }
function loop(now) {
  const dt = Math.min(0.1, (now - anim.last) / 1000); anim.last = now;
  let any = false;
  if (!document.hidden) anim.on.forEach((on, s) => { if (on && anim.visible.has(s)) { anim.t[s] += dt; any = true; DRAW[s](); } });
  anim.raf = any ? requestAnimationFrame(loop) : null;
}
function setPlay(s, on) { anim.on[s] = on; const b = $('play' + s); b.textContent = t(on ? 'pause' : 'play'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) ensureLoop(); }

/* ---------- step 0: two waves meet ---------- */
// Opaque colour for a displacement in [−1, 1]: background → cyan (above) or orange (below).
const BG = [13, 22, 33], UP = [103, 215, 249], DN = [255, 180, 84];
function blend(v) { const a = Math.min(1, Math.abs(v)), c = v >= 0 ? UP : DN; return `rgb(${c.map((ch, i) => Math.round(BG[i] + (ch - BG[i]) * a)).join(',')})`; }
const s0 = { view: 'both' };
const X = M.ROPE;
function draw0() {
  const lam = M.LAMBDA0; anim.t[0] = ((anim.t[0] % 8) + 8) % 8; const tt = anim.t[0];
  $('t0').value = tt; $('t0v').textContent = tt.toFixed(2);
  ['Right', 'Left', 'Both'].forEach(v => $('view' + v).setAttribute('aria-pressed', s0.view === v.toLowerCase()));
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 30, bottom: 196, xMin: 0, xMax: X, yMin: -2.4, yMax: 2.4, yTicks: [-2, 0, 2], xTicks: true, title: t('c0a') });
  const showR = s0.view !== 'left', showL = s0.view !== 'right', both = s0.view === 'both';
  if (showR) curve(ctx, A, x => M.yRight(x, tt, lam), 0, X, C.cyan, both ? 1.6 : 2.6, 240, null, both ? 0.55 : 1);
  if (showL) curve(ctx, A, x => M.yLeft(x, tt, lam), 0, X, C.orange, both ? 1.6 : 2.6, 240, null, both ? 0.55 : 1);
  if (both) curve(ctx, A, x => M.ySum(x, tt, lam), 0, X, C.text, 3);
  if (showR) M.crests('right', tt, lam).forEach(x => tri(ctx, A.x(x), A.P.t + 1, C.cyan));
  if (showL) M.crests('left', tt, lam).forEach(x => tri(ctx, A.x(x), A.P.t + 1, C.orange));
  // space–time strip: rows from now (top) back to 4 s ago (bottom)
  const B = panel(ctx, W, { top: 248, bottom: H - 26, xMin: 0, xMax: X, yMin: -4, yMax: 0, yTicks: [-4, -2, 0], yAxisAt: 1, xTicks: true, title: t('c0b') });
  const nx = Math.min(160, Math.floor((B.P.r - B.P.l) / 3)), ny = 48, cw = (B.P.r - B.P.l) / nx, ch = (B.P.b - B.P.t) / ny;
  for (let j = 0; j < ny; j++) {
    const ago = -4 * (j + 0.5) / ny, tj = tt + ago;
    for (let i = 0; i < nx; i++) {
      const x = X * (i + 0.5) / nx;
      const v = both ? M.ySum(x, tj, lam) / 2 : (showR ? M.yRight(x, tj, lam) : M.yLeft(x, tj, lam));
      ctx.fillStyle = blend(v);
      ctx.fillRect(B.P.l + i * cw, B.P.t + j * ch, cw + 0.5, ch + 0.5);
    }
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(B.P.l, B.P.t, B.P.r - B.P.l, B.P.b - B.P.t);
  const v = M.speed(lam);
  if (s0.view === 'right') $('r0').textContent = t('s0right', { xs: M.crests('right', tt, lam).map(x => x.toFixed(2)).join(', '), v: fmt(v) });
  else if (s0.view === 'left') $('r0').textContent = t('s0left', { xs: M.crests('left', tt, lam).map(x => x.toFixed(2)).join(', '), v: fmt(v) });
  else $('r0').textContent = t('s0both', { s: M.clock(tt).toFixed(2), nodes: M.nodes(lam).map(x => fmt(x)).join(', ') });
}

/* ---------- step 1: envelope, nodes, antinodes ---------- */
const s1 = { lam: 2, P: 0.3, env: true };
function onLadder(x, lam, base) { // nearest ladder point (base + m·λ/2) that lies on the rope [0, X]
  const step = lam / 2; let m = Math.round((x - base) / step), v = base + m * step;
  if (v > X + 1e-9) v -= step; if (v < -1e-9) v += step; return v;
}
function draw1() {
  const lam = s1.lam, P = s1.P, tt = anim.t[1];
  $('lam1v').textContent = lam.toFixed(1); $('p1v').textContent = P.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 30, bottom: 196, xMin: 0, xMax: X, yMin: -2.4, yMax: 2.4, yTicks: [-2, 0, 2], xTicks: true, title: t('c1a') });
  if (s1.env) { curve(ctx, A, x => M.amp(x, lam), 0, X, C.ghost, 1.5, 300, [5, 4]); curve(ctx, A, x => -M.amp(x, lam), 0, X, C.ghost, 1.5, 300, [5, 4]); }
  curve(ctx, A, x => M.ySum(x, tt, lam), 0, X, C.text, 2.6, 300);
  M.antinodes(lam).forEach(x => diamond(ctx, A.x(x), A.y(0)));
  M.nodes(lam).forEach(x => ring(ctx, A.x(x), A.y(0)));
  const aP = M.amp(P, lam);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.45; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(A.x(P), A.y(aP)); ctx.lineTo(A.x(P), A.y(-aP)); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(P), A.y(M.ySum(P, tt, lam)), 6, C.cyan, C.bg);
  const B = panel(ctx, W, { top: 248, bottom: H - 26, xMin: -4, xMax: 0, yMin: -2.4, yMax: 2.4, yTicks: [-2, 0, 2], xTicks: true, xSteps: [1, 2], title: t('c1b') });
  ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
  [aP, -aP].forEach(v => { ctx.beginPath(); ctx.moveTo(B.P.l, B.y(v)); ctx.lineTo(B.P.r, B.y(v)); ctx.stroke(); }); ctx.restore();
  curve(ctx, B, s => M.ySum(0, tt + s, lam), -4, 0, C.raw, 1.6, 200);
  curve(ctx, B, s => M.ySum(P, tt + s, lam), -4, 0, C.cyan, 2.6, 200);
  dot(ctx, B.x(0), B.y(M.ySum(P, tt, lam)), 5, C.cyan);
  vguide(ctx, A.x(P), A.P.t, A.P.b);
  const xn = onLadder(P, lam, lam / 4), xa = onLadder(P, lam, 0), kind = M.classify(P, lam), ph = M.phaseVsOrigin(P, lam);
  const kindTxt = kind === 'node' ? t('kindNode', { y1: fmt(M.yRight(P, tt, lam)), y2: fmt(M.yLeft(P, tt, lam)) }) : kind === 'antinode' ? t('kindAnti') : t('kindBetween');
  const phTxt = t(ph === 'same' ? 'phSame' : ph === 'opposite' ? 'phOpp' : 'phNone');
  $('r1').textContent = t('s1readout', { x: fmt(P, 3), xl: fmt(P / lam, 3), a: fmt(aP, 3), sw: fmt(M.swing(P, lam, 720), 3), xn: fmt(xn, 3), dn: fmt(Math.abs(P - xn), 3), xa: fmt(xa, 3), da: fmt(Math.abs(P - xa), 3), kind: kindTxt, phase: phTxt });
}

/* ---------- step 2: pinned ends ---------- */
const s2 = { L: 6, lam: 5, hist: new Set(['5']) };
const LAM2 = { min: 1, max: 12 };
function draw2() {
  const L = s2.L, lam = s2.lam, tt = anim.t[2], mc = M.modeCheck(L, lam);
  $('L2v').textContent = fmt(L, 1); $('lam2v').textContent = fmt(lam, 3);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: 200, xMin: -0.3, xMax: 6.3, yMin: -2.4, yMax: 2.4, yTicks: [-2, 0, 2], xTicks: true, xSteps: [1, 2], title: t('c2a') });
  curve(ctx, A, x => M.ampFixed(x, lam), 0, L, C.ghost, 1.5, 400, [5, 4]); curve(ctx, A, x => -M.ampFixed(x, lam), 0, L, C.ghost, 1.5, 400, [5, 4]);
  curve(ctx, A, x => M.yFixed(x, tt, lam), 0, L, mc.ok ? C.green : C.text, 2.6, 400, mc.ok ? null : [8, 5], mc.ok ? 1 : 0.75);
  clamp(ctx, A.x(0), A.y(2.3), A.y(-2.3)); clamp(ctx, A.x(L), A.y(2.3), A.y(-2.3));
  if (mc.ok) for (let m = 0; m <= mc.n; m++) ring(ctx, A.x(m * L / mc.n), A.y(0));
  else { ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(A.x(L) + 10, A.y(mc.end)); ctx.lineTo(A.x(L) + 10, A.y(-mc.end)); ctx.stroke(); ctx.restore(); }
  const B = panel(ctx, W, { top: 252, bottom: H - 26, xMin: LAM2.min, xMax: LAM2.max, yMin: 0, yMax: 2.3, yTicks: [0, 1, 2], xTicks: true, xSteps: [1, 2, 4], title: t('c2b') });
  curve(ctx, B, l => M.endAmp(L, l), LAM2.min, LAM2.max, C.ghost, 1.4, 2400);
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2;
  for (let n = 1; M.modeLambda(L, n) >= LAM2.min - 1e-9; n++) { const l = M.modeLambda(L, n); if (l > LAM2.max + 1e-9) continue; ctx.beginPath(); ctx.moveTo(B.x(l), B.y(0) - 6); ctx.lineTo(B.x(l), B.y(0) + 1); ctx.stroke(); }
  ctx.restore();
  s2.hist.forEach(k => { const l = Number(k); if (Math.abs(l - lam) > 1e-9) dot(ctx, B.x(l), B.y(M.endAmp(L, l)), 3.2, C.text); });
  dot(ctx, B.x(lam), B.y(mc.end), 6, mc.ok ? C.green : C.pink, C.bg);
  vguide(ctx, B.x(lam), B.P.t, B.P.b, mc.ok ? C.green : C.pink);
  const verdict = mc.ok ? t('s2ok', { n: mc.n, nn: M.nodeCount(mc.n) }) : t('s2bad', { end: fmt(mc.end, 3) });
  $('r2').textContent = t('s2readout', { L: fmt(L, 1), lam: fmt(lam, 3), q: fmt(mc.q, 3), n: mc.n, dev: fmt(mc.dev, 3), end: fmt(mc.end, 3), verdict });
}

/* ---------- step 3: the harmonic ladder ---------- */
const s3 = { n: 1, L: M.L_GUITAR, ghost: false };
const VIS = 440; // animation slow-down factor for steps 3–4 (real Hz ÷ 440 = on-screen Hz)
function draw3() {
  const n = s3.n, L = s3.L, f = M.fN(n, L), tt = anim.t[3];
  $('L3v').textContent = L.toFixed(3);
  document.querySelectorAll('#modeBtns .btn').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.n) === n));
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: 200, xMin: -0.02, xMax: 0.7, yMin: -1.3, yMax: 1.3, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.1, 0.2], minPx: 34, title: t('c3a') });
  const c = Math.cos(2 * Math.PI * f / VIS * tt);
  if (s3.ghost) { curve(ctx, A, x => M.modeShape(x, L, 1), 0, L, C.ghost, 1.5, 200, [5, 4]); curve(ctx, A, x => -M.modeShape(x, L, 1), 0, L, C.ghost, 1.5, 200, [5, 4]); }
  curve(ctx, A, x => M.modeShape(x, L, n) * c, 0, L, C.cyan, 2.8, 300);
  clamp(ctx, A.x(0), A.y(1.25), A.y(-1.25)); clamp(ctx, A.x(L), A.y(1.25), A.y(-1.25));
  for (let m = 0; m <= n; m++) ring(ctx, A.x(m * L / n), A.y(0));
  const fMax = 1500;
  const B = panel(ctx, W, { top: 252, bottom: H - 26, xMin: 0, xMax: fMax, yMin: 0, yMax: 6.6, yTicks: [0, 2, 4, 6], xTicks: true, xSteps: [100, 250, 500], minPx: 40, xFmt: v => String(Math.round(v)), title: t('c3b') });
  ctx.save(); ctx.strokeStyle = 'rgba(255,180,84,0.35)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0));
  for (let m = 1; m <= 6; m++) { ctx.lineTo(B.x(M.fN(m, L)), B.y(m - 1)); ctx.lineTo(B.x(M.fN(m, L)), B.y(m)); }
  ctx.stroke(); ctx.restore();
  for (let m = 1; m <= 6; m++) {
    const fm = M.fN(m, L), on = m === n;
    ctx.fillStyle = on ? C.orange : 'rgba(255,180,84,0.32)';
    ctx.fillRect(B.x(fm) - (on ? 3.5 : 2.5), B.y(m), on ? 7 : 5, B.y(0) - B.y(m));
  }
  $('r3').textContent = t('s3readout', { n, lam: fmt(M.modeLambda(L, n), 3), f: fmt(f, 1), r: fmt(f / M.fN(1, L), 3), f1: fmt(M.fN(1, L), 1), nn: M.nodeCount(n), na: M.loopCount(n) });
}

/* ---------- step 4: resonance ---------- */
const s4 = { hist: new Map(), prog: '' };
const F4 = { min: 20, max: 500 };
const curveCache = new Map(), shapeCache = new Map();
function gainCurve(z) {
  const key = z.toFixed(3); if (curveCache.has(key)) return curveCache.get(key);
  const pts = []; for (let f = F4.min; f <= F4.max + 1e-9; f += 0.5) pts.push([f, M.gain(f, z)]);
  curveCache.set(key, pts); return pts;
}
function shape(f, z) { const key = f + '|' + z.toFixed(3); if (!shapeCache.has(key)) { if (shapeCache.size > 400) shapeCache.clear(); shapeCache.set(key, M.shapeAt(f, z)); } return shapeCache.get(key); }
const lg = v => Math.log10(Math.max(0.1, v));
const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
function draw4() {
  const f = num('f4'), z = num('z4'), tt = anim.t[4], L = M.L_GUITAR, sm = M.maxAbs(shape(0, 0));
  $('f4v').textContent = String(f); $('z4v').textContent = z.toFixed(3);
  const g = M.gain(f, z), top = 1.15 * M.gain(M.fN(1), z);
  const { ctx, W, H } = fitCanvas($('c4'));
  const yt = top > 20 ? [-20, 0, 20].filter(v => Math.abs(v) < top) : top > 8 ? [-5, 0, 5] : [-2, 0, 2];
  const A = panel(ctx, W, { top: 30, bottom: 206, xMin: -0.02, xMax: 0.7, yMin: -top, yMax: top, yTicks: yt, xTicks: true, xSteps: [0.1, 0.2], minPx: 34, title: t('c4a') });
  const S = shape(f, z), ph = 2 * Math.PI * f / VIS * tt, c = Math.cos(ph), s = Math.sin(ph);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.8; ctx.beginPath();
  for (let i = 0; i < M.GRID; i++) { const xv = L * i / (M.GRID - 1), yv = (S.re[i] * c - S.im[i] * s) / sm, Y = A.y(Math.max(-top, Math.min(top, yv))); if (!i) ctx.moveTo(A.x(xv), Y); else ctx.lineTo(A.x(xv), Y); }
  ctx.stroke(); ctx.restore();
  clamp(ctx, A.x(0), A.y(top * 0.95), A.y(-top * 0.95)); clamp(ctx, A.x(L), A.y(top * 0.95), A.y(-top * 0.95));
  // push arrow below the string at x = 0.1 L
  const ax = A.x(M.DRIVE * L);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.fillStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ax, A.P.b - 2); ctx.lineTo(ax, A.P.b - 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ax - 6, A.P.b - 26); ctx.lineTo(ax + 6, A.P.b - 26); ctx.lineTo(ax, A.P.b - 36); ctx.closePath(); ctx.fill(); ctx.restore();

  const B = panel(ctx, W, { top: 258, bottom: H - 26, xMin: F4.min, xMax: F4.max, yMin: -1, yMax: 2.1, yTicks: [-1, 0, 1, 2], yAxisAt: -1, yFmt: v => String(Math.pow(10, v)), xTicks: true, xSteps: [50, 100, 200], minPx: 36, xFmt: v => String(Math.round(v)), title: t('c4b') });
  ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.fn; ctx.lineWidth = 1.2;
  for (let n = 1; M.fN(n) <= F4.max; n++) { ctx.beginPath(); ctx.moveTo(B.x(M.fN(n)), B.P.t); ctx.lineTo(B.x(M.fN(n)), B.P.b); ctx.stroke(); }
  ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.3; ctx.beginPath();
  gainCurve(z).forEach(([fq, gv], i) => { const X = B.x(fq), Y = B.y(Math.min(2.1, lg(gv))); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
  s4.hist.forEach((gv, fq) => { if (fq !== f) dot(ctx, B.x(fq), B.y(Math.min(2.1, lg(gv))), 2.8, C.text); });
  dot(ctx, B.x(f), B.y(Math.min(2.1, lg(g))), 6, C.cyan, C.bg);
  vguide(ctx, B.x(f), B.P.t, B.P.b);
  const n = Math.max(1, Math.round(f / M.fN(1))), fn = M.fN(n), hw = z * fn, bm = M.bestMode(f, z);
  const hit = Math.abs(f - fn) <= hw + 1e-9;
  const note = hit ? t('s4hit', { n, hw: fmt(hw, 1) }) : t('s4miss', { hw: fmt(hw, 1) });
  $('r4').textContent = t('s4readout', { prog: s4.prog, f, g: g.toFixed(2), n: SUB[n] || n, fn: fmt(fn, 1), df: fmt(Math.abs(f - fn), 1), m: bm.n, like: bm.like.toFixed(3), note });
}

/* ---------- step 5: quiz ---------- */
const quiz = {};
function quizAnswer(q) { const v = M.QUIZ[q](); return typeof v === 'number' ? v : String(v); }
function renderQuiz() {
  Object.keys(quiz).forEach(q => {
    const st = quiz[q], fb = $('fb-' + q); if (!st) return;
    let params = {};
    if (q === 'q1') params = { a: fmt(M.amp(1, 4), 3) };
    if (q === 'q2') params = { lam: fmt(M.QUIZ.q2()) };
    if (q === 'q4') params = { r: fmt(M.QUIZ.q4()), f0: fmt(M.fN(1)), f1: fmt(M.fN(1, M.L_GUITAR / 2)) };
    fb.textContent = st.ok ? t(q + 'ok', params) : t(q + 'no');
    fb.dataset.state = st.ok ? 'correct' : 'wrong';
  });
}
function checkQuiz(q) {
  const ch = document.querySelector(`input[name="${q}"]:checked`);
  const ans = quizAnswer(q);
  const ok = !!ch && (typeof ans === 'number' ? Math.abs(Number(ch.value) - ans) < 1e-9 : ch.value === ans);
  quiz[q] = { ok }; renderQuiz();
}

/* ---------- wiring ---------- */
function refresh() {
  for (let s = 0; s <= 4; s++) $('play' + s).textContent = t(anim.on[s] ? 'pause' : 'play');
  document.querySelectorAll('#modeBtns .btn').forEach(b => { b.textContent = t('modeN', { n: b.dataset.n }); });
  DRAW.forEach(d => d()); renderQuiz();
}
function setup() {
  DRAW.push(draw0, draw1, draw2, draw3, draw4);
  const box = $('modeBtns');
  for (let n = 1; n <= 6; n++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn mode'; b.dataset.n = n; b.dataset.step = '3'; b.addEventListener('click', () => { s3.n = n; draw3(); }); box.appendChild(b); }
  for (let s = 0; s <= 4; s++) $('play' + s).addEventListener('click', () => { setPlay(s, !anim.on[s]); DRAW[s](); });

  ['Right', 'Left', 'Both'].forEach(v => $('view' + v).addEventListener('click', () => { s0.view = v.toLowerCase(); draw0(); }));
  $('t0').addEventListener('input', () => { setPlay(0, false); anim.t[0] = num('t0'); draw0(); });

  $('lam1').addEventListener('input', () => { s1.lam = num('lam1'); draw1(); });
  $('p1').addEventListener('input', () => { s1.P = num('p1'); draw1(); });
  $('toNode').addEventListener('click', () => { s1.P = onLadder(s1.P, s1.lam, s1.lam / 4); $('p1').value = s1.P; draw1(); });
  $('toAnti').addEventListener('click', () => { s1.P = onLadder(s1.P, s1.lam, 0); $('p1').value = s1.P; draw1(); });
  $('env1').addEventListener('change', () => { s1.env = $('env1').checked; draw1(); });

  $('L2').addEventListener('input', () => { s2.L = num('L2'); s2.hist = new Set([String(s2.lam)]); draw2(); });
  $('lam2').addEventListener('input', () => { s2.lam = num('lam2'); s2.hist.add(String(s2.lam)); draw2(); });
  $('snap2').addEventListener('click', () => { const sn = M.snap(s2.L, s2.lam); s2.lam = Math.min(LAM2.max, Math.max(LAM2.min, sn.lambda)); if (Math.abs(s2.lam - sn.lambda) > 1e-12) s2.lam = M.modeLambda(s2.L, Math.max(1, Math.ceil(2 * s2.L / LAM2.max))); $('lam2').value = s2.lam; s2.hist.add(String(s2.lam)); draw2(); });
  $('clear2').addEventListener('click', () => { s2.hist = new Set([String(s2.lam)]); draw2(); });

  $('L3').addEventListener('input', () => { s3.L = num('L3'); draw3(); });
  $('ghost3').addEventListener('change', () => { s3.ghost = $('ghost3').checked; draw3(); });

  const add4 = () => { const f = num('f4'); s4.hist.set(f, M.gain(f, num('z4'))); };
  $('f4').addEventListener('input', () => { stopSweep(); add4(); draw4(); });
  $('z4').addEventListener('input', () => { stopSweep(); s4.hist.clear(); add4(); draw4(); });
  $('clear4').addEventListener('click', () => { stopSweep(); s4.hist.clear(); add4(); draw4(); });
  $('sweep4').addEventListener('click', startSweep);
  add4();

  document.querySelectorAll('[data-check]').forEach(b => b.addEventListener('click', () => checkQuiz(b.dataset.check)));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const vis = new IntersectionObserver(es => es.forEach(e => { const s = Number(e.target.dataset.step); if (e.isIntersecting) anim.visible.add(s); else anim.visible.delete(s); }), { rootMargin: '0px' });
    steps.forEach(s => vis.observe(s));
    const vis2 = new IntersectionObserver(() => ensureLoop(), {}); steps.forEach(s => vis2.observe(s));
  } else steps.forEach((s, i) => anim.visible.add(i));
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSweep(true); else ensureLoop(); });
  window.refreshStanding = refresh;
  if (!reduceMotion()) for (let s = 0; s <= 4; s++) anim.on[s] = true;
  refresh(); ensureLoop();
}

/* sweep for step 4 (finishes immediately under reduced motion or when the page is hidden) */
let sweepRaf = null;
function stopSweep(finish) {
  if (sweepRaf === null) return; cancelAnimationFrame(sweepRaf); sweepRaf = null;
  if (finish) { const z = num('z4'); for (let f = F4.min; f <= F4.max; f += 2) s4.hist.set(f, M.gain(f, z)); }
  s4.prog = ''; draw4();
}
function startSweep() {
  stopSweep(); const z = num('z4'); s4.hist.clear();
  const N = (F4.max - F4.min) / 2 + 1;
  if (reduceMotion()) { for (let f = F4.min; f <= F4.max; f += 2) s4.hist.set(f, M.gain(f, z)); $('f4').value = F4.max; s4.prog = ''; draw4(); return; }
  const start = performance.now(), ms = 9000;
  const tick = now => {
    const p = Math.min(1, (now - start) / ms), k = Math.min(N - 1, Math.floor(p * N));
    for (let i = 0; i <= k; i++) { const f = F4.min + 2 * i; if (!s4.hist.has(f)) s4.hist.set(f, M.gain(f, z)); }
    $("f4").value = F4.min + 2 * k; s4.prog = p < 1 ? t('s4prog', { c: k + 1, N }) : '';
    draw4();
    sweepRaf = p < 1 ? requestAnimationFrame(tick) : null;
  };
  sweepRaf = requestAnimationFrame(tick);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
