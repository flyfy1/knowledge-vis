'use strict';
// Laplace transform lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.LAP_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.LAP_MODEL;
const t = (...a) => window.LAP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, trailing zeros trimmed only after a decimal point; −0 shown as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title: shrinks the font until it fits the canvas width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Plot panel: title in its own row above, y ticks to the left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function curve(ctx, m, xs, fn, color, { lw = 2, dash = null, alpha = 1, clip = true } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  if (clip) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
  ctx.beginPath(); xs.forEach((v, i) => { const X = m.x(v), Y = m.y(fn(v, i)); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = true) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], alpha = 0.7) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
const grid = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);

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

function cross(ctx, X, Y, r, color, lw = 2.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X - r, Y - r); ctx.lineTo(X + r, Y + r); ctx.moveTo(X + r, Y - r); ctx.lineTo(X - r, Y + r); ctx.stroke(); ctx.restore(); }
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function axisLine(ctx, m, v, color = C.text, alpha = 0.55) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); ctx.restore(); }
const cfmt = (z, d = 3) => fmt(z[0], d) + (z[1] < 0 ? ' − ' : ' + ') + fmt(Math.abs(z[1]), d) + 'j';
const big = v => (!isFinite(v) || v > 1e6 ? '∞' : fmt(v, 2));
function niceMax(v, opts = [1, 1.5, 2, 3, 5, 10, 15, 20]) { for (const o of opts) if (v <= o * 1.02) return o; return opts[opts.length - 1]; }

/* ---------- step 0: the building block e^{st} ---------- */
const s0 = { tried: new Set(['-0.4,4']) };
function draw0() {
  const sig = num('sg0'), w = num('w0'), ch = M.character(sig, w);
  $('sg0v').textContent = fmt(sig, 2); $('w0v').textContent = fmt(w, 2);
  let { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -1.6, xMax: 1.1, yMin: -0.6, yMax: 12.6, yTicks: [0, 4, 8, 12], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c0a') });
  axisLine(ctx, A, 0);
  for (const key of s0.tried) { const [a, b] = key.split(',').map(Number); if (a !== sig || b !== w) dot(ctx, A.x(a), A.y(b), 3.5, C.text); }
  dot(ctx, A.x(sig), A.y(w), 6.5, C.cyan);
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 4, yMin: -3, yMax: 3, yTicks: [-2, 0, 2], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c0b') });
  const ts = grid(0, 4, Math.max(400, Math.round(W * 1.5)));
  curve(ctx, B, ts, v => Math.exp(sig * v), C.ghost, { lw: 1.4, dash: [5, 4] });
  curve(ctx, B, ts, v => -Math.exp(sig * v), C.ghost, { lw: 1.4, dash: [5, 4] });
  curve(ctx, B, ts, v => M.est(sig, w, v)[0], C.orange, { lw: 2.2 });
  const life = ch.half ? t('s0half', { h: fmt(ch.half, 2) }) : ch.dbl ? t('s0dbl', { h: fmt(ch.dbl, 2) }) : t('s0flat');
  const osc = ch.period ? t('s0per', { p: fmt(ch.period, 2) }) : t('s0noosc');
  $('r0').textContent = t('s0readout', { sig: fmt(sig, 2), w: fmt(w, 2), life, osc });
}

/* ---------- step 1: when does the integral converge? ---------- */
const s1 = { tried: new Set([0]) };
function draw1() {
  const a = num('a1'), sig = num('sg1');
  $('a1v').textContent = fmt(a, 1); $('sg1v').textContent = fmt(sig, 1);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: 150, xMin: 0, xMax: 10, yMin: 0, yMax: 3, yTicks: [0, 1, 2, 3], xTicks: true, xSteps: [1, 2, 5], minPx: 30, title: t('c1a') });
  const ts = grid(0, 10, 500);
  curve(ctx, A, ts, v => Math.min(3.2, Math.exp((a - sig) * v)), C.orange, { lw: 2.2 });
  const B = panel(ctx, W, { top: 196, bottom: 330, xMin: 0, xMax: 10, yMin: 0, yMax: 12, yTicks: [0, 4, 8, 12], xTicks: true, xSteps: [1, 2, 5], minPx: 30, title: t('c1b') });
  const conv = M.converges(a, sig), lim = M.limit(a, sig);
  if (conv && lim <= 12) { ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(B.P.l, B.y(lim)); ctx.lineTo(B.P.r, B.y(lim)); ctx.stroke(); ctx.restore(); }
  curve(ctx, B, ts, v => Math.min(12.5, M.runningIntegral(a, sig, v)), C.cyan, { lw: 2.4 });
  const Cp = panel(ctx, W, { top: 376, bottom: H - 26, xMin: -1, xMax: 2, yMin: -1, yMax: 1, yTicks: [], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c1c') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.16)'; ctx.fillRect(Cp.x(a), Cp.P.t, Cp.P.r - Cp.x(a), Cp.P.b - Cp.P.t);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Cp.P.l, Cp.y(0)); ctx.lineTo(Cp.P.r, Cp.y(0)); ctx.stroke();
  ctx.strokeStyle = C.cyan; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(Cp.x(a), Cp.P.t); ctx.lineTo(Cp.x(a), Cp.P.b); ctx.stroke(); ctx.restore();
  for (const v of s1.tried) if (v !== sig) dot(ctx, Cp.x(v), Cp.y(0), 4.5, M.converges(a, v) ? C.green : C.pink);
  dot(ctx, Cp.x(sig), Cp.y(0), 7, conv ? C.green : C.pink);
  const i10 = M.runningIntegral(a, sig, 10);
  const verdict = Math.abs(sig - a) < 1e-9 ? t('s1edge') : conv ? t('s1conv', { i10: fmt(i10, 3), lim: fmt(lim, 3) }) : t('s1div', { i10: i10 > 1e4 ? i10.toExponential(2) : fmt(i10, 1) });
  $('r1').textContent = t('s1readout', { a: fmt(a, 1), sig: fmt(sig, 1), d: fmt(sig - a, 1), verdict });
}

/* ---------- step 2: terrain and slice ---------- */
const RAMP = [[11, 26, 42], [31, 111, 143], [103, 215, 249], [255, 180, 84]];
function rampColor(u) { u = Math.max(0, Math.min(1, u)) * (RAMP.length - 1); const i = Math.min(RAMP.length - 2, Math.floor(u)), f = u - i; return RAMP[i].map((c, k) => Math.round(c + (RAMP[i + 1][k] - c) * f)); }
const heatCache = { key: '', img: null };
function heat(alpha, beta, w, h, m) {
  const key = [alpha, beta, w, h].join();
  if (heatCache.key === key) return heatCache.img;
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const c = off.getContext('2d'), img = c.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const s = [m.xMin + (i + 0.5) / w * (m.xMax - m.xMin), m.yMax - (j + 0.5) / h * (m.yMax - m.yMin)];
    const v = Math.log10(M.cabs(M.Hpair(alpha, beta, s)) + 1e-12), col = rampColor((v + 1.2) / 2.6);
    const dim = s[0] <= -alpha ? 0.38 : 1, o = (j * w + i) * 4;
    img.data[o] = col[0] * dim; img.data[o + 1] = col[1] * dim; img.data[o + 2] = col[2] * dim; img.data[o + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  heatCache.key = key; heatCache.img = off; return off;
}
function draw2() {
  const al = num('al2'), be = num('be2'), s0v = num('s02');
  $('al2v').textContent = fmt(al, 2); $('be2v').textContent = fmt(be, 1); $('s02v').textContent = fmt(s0v, 2);
  const { ctx, W, H } = fitCanvas($('c2'));
  const box = { xMin: -3, xMax: 1.2, yMin: -3.5, yMax: 3.5 };
  const A = panel(ctx, W, { ...box, top: 26, bottom: 268, yTicks: [-3, 0, 3], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c2a') });
  const pw = Math.max(1, Math.round((A.P.r - A.P.l) / 3)), ph = Math.max(1, Math.round((A.P.b - A.P.t) / 3));
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(heat(al, be, pw, ph, box), A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t); ctx.restore();
  axisLine(ctx, A, 0, C.text, 0.5);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(0)); ctx.lineTo(A.P.r, A.y(0)); ctx.stroke(); ctx.restore();
  const inRoc = s0v > -al + 1e-9;
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; if (!inRoc) ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(A.x(s0v), A.P.t); ctx.lineTo(A.x(s0v), A.P.b); ctx.stroke(); ctx.restore();
  cross(ctx, A.x(-al), A.y(be), 6, C.pink, 2.6); cross(ctx, A.x(-al), A.y(-be), 6, C.pink, 2.6);
  const sp = M.slicePeak(al, be, s0v), ymax = niceMax(Math.min(20, sp.peak * 1.05));
  const B = panel(ctx, W, { top: 312, bottom: H - 26, xMin: -3.5, xMax: 3.5, yMin: 0, yMax: ymax, yTicks: [0, ymax / 2, ymax], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c2b') });
  const ws = grid(-3.5, 3.5, 700);
  curve(ctx, B, ws, v => Math.min(ymax * 1.05, M.cabs(M.Hpair(al, be, [s0v, v]))), C.text, { lw: 2, dash: inRoc ? null : [6, 4] });
  const four = inRoc && Math.abs(s0v) < 1e-9 ? t('s2four') : '';
  const inroc = inRoc ? t('s2in', { dist: fmt(s0v + al, 2) }) : t('s2out');
  $('r2').textContent = t('s2readout', { al: fmt(al, 2), be: fmt(be, 1), s0: fmt(s0v, 2), inroc, pw: fmt(sp.at, 2), pk: big(sp.peak), fourier: four });
}

/* ---------- step 3: one formula, two signals ---------- */
const s3 = { right: true };
function draw3() {
  const a = num('a3'), right = s3.right;
  $('a3v').textContent = fmt(a, 1);
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -2, xMax: 2, yMin: -2, yMax: 2, yTicks: [-2, -1, 0, 1, 2], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c3a') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.18)';
  if (right) ctx.fillRect(A.x(a), A.P.t, A.P.r - A.x(a), A.P.b - A.P.t); else ctx.fillRect(A.P.l, A.P.t, A.x(a) - A.P.l, A.P.b - A.P.t);
  ctx.restore();
  axisLine(ctx, A, 0, C.text, 0.9);
  cross(ctx, A.x(a), A.y(0), 7, C.pink, 2.8);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -4, xMax: 4, yMin: -3, yMax: 3, yTicks: [-2, 0, 2], xTicks: true, xSteps: [1, 2], minPx: 30, title: t('c3b') });
  const tr = grid(0, 4, 400), tl = grid(-4, 0, 400), clip3 = v => Math.max(-3.3, Math.min(3.3, v));
  if (right) { curve(ctx, B, tr, v => clip3(Math.exp(a * v)), C.cyan, { lw: 2.4 }); curve(ctx, B, tl, () => 0, C.cyan, { lw: 2.4 }); }
  else { curve(ctx, B, tl, v => clip3(-Math.exp(a * v)), C.cyan, { lw: 2.4 }); curve(ctx, B, tr, () => 0, C.cyan, { lw: 2.4 }); }
  const sx = right ? a + 0.5 : a - 0.5, s = [sx, 1];
  const num_ = right ? M.laplaceRightNumeric(a, s, 40, 40000) : M.laplaceLeftNumeric(a, s, 40, 40000), form = M.cdiv([1, 0], [sx - a, 1]);
  const contains = right ? a < 0 : a > 0;
  const stab = Math.abs(a) < 1e-9 ? t('s3edgeA') : contains ? t('s3stable') : t('s3unstable');
  const af = fmt(a, 1);
  $('r3').textContent = t('s3readout', { a: af, roc: t(right ? 's3right' : 's3left'), sig: t(right ? 's3sigR' : 's3sigL', { a: af }), side: t(right ? 's3causal' : 's3anti'), axis: t(contains ? 's3has' : 's3not'), stab, sx: fmt(sx, 1), num: cfmt(num_), form: cfmt(form) });
}

/* ---------- step 4: poles as character ---------- */
const s4 = { tried: new Set(['-0.3,3']) };
function draw4() {
  const sp = num('sp4'), wp = num('wp4'), ch = M.poleCharacter(sp, wp);
  $('sp4v').textContent = fmt(sp, 2); $('wp4v').textContent = fmt(wp, 2);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -1.7, xMax: 0.7, yMin: -6.6, yMax: 6.6, yTicks: [-6, -3, 0, 3, 6], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c4a') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.07)'; ctx.fillRect(A.P.l, A.P.t, A.x(0) - A.P.l, A.P.b - A.P.t); ctx.fillStyle = 'rgba(255,122,147,0.08)'; ctx.fillRect(A.x(0), A.P.t, A.P.r - A.x(0), A.P.b - A.P.t); ctx.restore();
  axisLine(ctx, A, 0, C.text, 0.8);
  const col = k => (k === 'stable' ? C.green : k === 'marginal' ? C.orange : C.pink);
  for (const key of s4.tried) { const [a, b] = key.split(',').map(Number); if (a === sp && b === wp) continue; const c = col(M.poleCharacter(a, b).kind); dot(ctx, A.x(a), A.y(b), 3.5, c); dot(ctx, A.x(a), A.y(-b), 3.5, c); }
  cross(ctx, A.x(sp), A.y(wp), 6.5, C.text, 2.6); cross(ctx, A.x(sp), A.y(-wp), 6.5, C.text, 2.6);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 8, yMin: -3, yMax: 3, yTicks: [-2, 0, 2], xTicks: true, xSteps: [1, 2], minPx: 30, title: t('c4b') });
  const ts = grid(0, 8, Math.max(500, Math.round(W * 1.5))), cl = v => Math.max(-3.3, Math.min(3.3, v));
  curve(ctx, B, ts, v => cl(Math.exp(sp * v)), C.ghost, { lw: 1.3, dash: [5, 4] });
  curve(ctx, B, ts, v => cl(-Math.exp(sp * v)), C.ghost, { lw: 1.3, dash: [5, 4] });
  curve(ctx, B, ts, v => cl(M.hPole(sp, wp, v)), C.cyan, { lw: 2.2 });
  const kind = t(ch.kind === 'stable' ? 's4stable' : ch.kind === 'marginal' ? 's4marg' : 's4unst');
  const decay = ch.settle ? t('s4settle', { ts: fmt(ch.settle, 2) }) : ch.grow ? t('s4grow', { tg: fmt(ch.grow, 2) }) : t('s4flat');
  const osc = ch.period ? t('s4per', { p: fmt(ch.period, 2) }) : t('s4noper');
  $('r4').textContent = t('s4readout', { sp: fmt(sp, 2), wp: fmt(wp, 2), kind, decay, osc });
}

/* ---------- step 5: frequency response from pole distances ---------- */
const BETA = 2;
const s5 = { tried: new Set([1]), walking: false };
function draw5() {
  const w = num('w5'), al = num('al5'), g = M.geometry(al, BETA, w), h = M.cabs(M.Hpair(al, BETA, [0, w]));
  $('w5v').textContent = fmt(w, 2); $('al5v').textContent = fmt(al, 2);
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -2, xMax: 0.6, yMin: -3, yMax: 5.2, yTicks: [-2, 0, 2, 4], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c5a') });
  axisLine(ctx, A, 0, C.text, 0.8);
  ctx.save(); clipTo(ctx, A); ctx.lineWidth = 2.2;
  ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(w)); ctx.lineTo(A.x(-al), A.y(BETA)); ctx.stroke();
  ctx.strokeStyle = C.green; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(w)); ctx.lineTo(A.x(-al), A.y(-BETA)); ctx.stroke(); ctx.restore();
  cross(ctx, A.x(-al), A.y(BETA), 6, C.pink, 2.6); cross(ctx, A.x(-al), A.y(-BETA), 6, C.pink, 2.6);
  dot(ctx, A.x(0), A.y(w), 6.5, C.cyan);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const pw = M.peakW(al, BETA), pk = M.geometry(al, BETA, pw).gain, ymax = niceMax(pk * 1.05, [1.5, 2, 3, 5, 8, 12]);
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 5, yMin: 0, yMax: ymax, yTicks: [0, ymax / 2, ymax], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c5b') });
  curve(ctx, B, grid(0, 5, 800), v => M.geometry(al, BETA, v).gain, C.text, { lw: 1.8 });
  for (const v of s5.tried) if (v !== w) dot(ctx, B.x(v), B.y(M.geometry(al, BETA, v).gain), 3.5, C.text);
  vline(ctx, B.x(w), B.y(g.gain), B.P.b, C.cyan, [4, 4], 0.8);
  dot(ctx, B.x(w), B.y(g.gain), 6.5, C.cyan);
  const prog = s5.walking ? t('s5prog', { c: s5.tried.size, N: 101 }) : '';
  $('r5').textContent = prog + t('s5readout', { w: fmt(w, 2), d1: fmt(g.d1, 3), d2: fmt(g.d2, 3), g: fmt(g.gain, 3), h: fmt(h, 3), pw: fmt(pw, 3), pk: fmt(pk, 3) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['sg0', 'w0'].forEach(id => $(id).addEventListener('input', () => { s0.tried.add(num('sg0') + ',' + num('w0')); draw0(); }));
  $('a1').addEventListener('input', draw1);
  $('sg1').addEventListener('input', () => { s1.tried.add(num('sg1')); draw1(); });
  ['al2', 'be2', 's02'].forEach(id => $(id).addEventListener('input', draw2));
  $('a3').addEventListener('input', draw3);
  const setRoc = r => { s3.right = r; $('rocR').setAttribute('aria-pressed', String(r)); $('rocL').setAttribute('aria-pressed', String(!r)); draw3(); };
  $('rocR').addEventListener('click', () => setRoc(true)); $('rocL').addEventListener('click', () => setRoc(false));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  ['sp4', 'wp4'].forEach(id => $(id).addEventListener('input', () => { s4.tried.add(num('sp4') + ',' + num('wp4')); draw4(); }));
  $('w5').addEventListener('input', () => { stopAnim('s5'); s5.walking = false; s5.tried.add(num('w5')); draw5(); });
  $('al5').addEventListener('input', () => { s5.tried = new Set([num('w5')]); draw5(); });
  $('sweep5').addEventListener('click', () => {
    s5.tried = new Set(); s5.walking = true;
    animate('s5', 5000, p => { const k = Math.min(100, Math.floor(p * 100.999)); for (let i = 0; i <= k; i++) s5.tried.add(Math.round(i * 5) / 100); $('w5').value = (k * 0.05).toFixed(2); draw5(); }, () => { s5.walking = false; draw5(); });
  });

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
  window.refreshLaplace = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
