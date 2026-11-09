'use strict';
// Convolution lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every stem, curve and readout comes from window.CONV_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.CONV_MODEL;
const t = (...a) => window.CONV_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa' };
const KCOL = [C.cyan, C.orange, C.green, C.pink, C.violet];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const par = v => (v < 0 ? '(' + fmt(v) + ')' : fmt(v));

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  // CSS height is fixed once from the authored attribute; only the bitmap follows the DPR.
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

// Panel title: shrinks the font until it fits the canvas width (never overflows, never squeezes glyphs).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// A plot panel. Title sits in its own row above the plot; tick labels sit left of / below the plot.
// opts: top, bottom (px), xMin, xMax, yMin, yMax, yTicks, xTicks (bool), xSteps, title, left, right, xDigits
function panel(ctx, W, o) {
  const P = { l: o.left || 36, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 26, o.xSteps || [1, 2, 5, 10, 20, 40, 60, 120]);
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

function stem(ctx, m, n, v, color, { lw = 2.4, r = 4, hollow = false, alpha = 1, dx = 0, dash = null } = {}) {
  const X = m.x(n) + dx, Y = m.y(v);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(X, m.y(0)); ctx.lineTo(X, Y); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } else ctx.fill();
  ctx.restore();
}
function vguide(ctx, X, y0, y1, color = C.orange) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
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

/* ---------- step 0: one clap, shifted and scaled ---------- */
function draw0() {
  const k = num('k0'), a = num('a0'), h = M.ECHO;
  $('k0v').textContent = String(k); $('a0v').textContent = fmt(a, 1);
  const { ctx, W, H } = fitCanvas($('c0'));
  const top = panel(ctx, W, { top: 26, bottom: 124, xMin: -0.5, xMax: 9.5, yMin: -2.2, yMax: 2.2, yTicks: [-2, 0, 2], xTicks: true, title: t('c0top') });
  if (a !== 0) stem(ctx, top, k, a, C.orange); else stem(ctx, top, k, 0, C.orange, { hollow: true });
  const bot = panel(ctx, W, { top: 166, bottom: H - 26, xMin: -0.5, xMax: 9.5, yMin: -2.2, yMax: 2.2, yTicks: [-2, 0, 2], xTicks: true, title: t('c0bot') });
  h.forEach((v, j) => stem(ctx, bot, j, v, C.ghost, { lw: 1.6, r: 3, hollow: true, dx: -5, dash: [3, 3] }));
  const y = new Array(10).fill(0); h.forEach((v, j) => { if (k + j < 10) y[k + j] = a * v; });
  y.forEach((v, n) => { if (v !== 0) stem(ctx, bot, n, v, C.cyan); });
  vguide(ctx, top.x(k), top.P.t, bot.P.b);
  $('r0').textContent = t('s0readout', { a: fmt(a, 1), k, n0: k, n1: k + 1, n2: k + 2, y0: fmt(a * h[0]), y1: fmt(a * h[1]), y2: fmt(a * h[2]) });
}

/* ---------- step 1: several claps, echoes stacked ---------- */
const s1 = { x: M.DEFAULT_X.slice(), reveal: 5 };
function buildXControls() {
  const box = $('xControls');
  s1.x.forEach((v, k) => {
    const lab = document.createElement('label');
    lab.innerHTML = `<span><span class="sw" style="background:${KCOL[k]};margin-right:6px"></span><span class="xk-name"></span></span><output id="x${k}v"></output><input id="x${k}" data-step="1" type="range" min="-2" max="2" step="0.5" value="${v}">`;
    box.appendChild(lab);
    lab.querySelector('input').addEventListener('input', e => { s1.x[k] = Number(e.target.value); draw1(); draw2(); });
  });
}
function draw1() {
  const x = s1.x, h = M.ECHO, N = x.length, L = N + h.length - 1;
  x.forEach((v, k) => { $('x' + k + 'v').textContent = fmt(v, 1); $('x' + k).closest('label').querySelector('.xk-name').textContent = t('xk', { k }); });
  $('lg1').innerHTML = x.map((_, k) => `<span class="lg"><span class="sw" style="background:${KCOL[k]}"></span><span>${t('xk', { k })}</span></span>`).join('') + `<span class="lg"><span class="sw sw-dot"></span><span>${t('s1lgNet')}</span></span>`;
  const { ctx, W, H } = fitCanvas($('c1'));
  const top = panel(ctx, W, { top: 26, bottom: 132, xMin: -1.5, xMax: 9.5, yMin: -2.2, yMax: 2.2, yTicks: [-2, 0, 2], xTicks: true, title: t('c1top') });
  x.forEach((v, k) => stem(ctx, top, k, v, KCOL[k], { alpha: k < s1.reveal ? 1 : 0.3, hollow: v === 0 }));
  const bot = panel(ctx, W, { top: 176, bottom: H - 26, xMin: -1.5, xMax: 9.5, yMin: -4.2, yMax: 4.2, yTicks: [-4, -2, 0, 2, 4], xTicks: true, title: t('c1bot') });
  const rows = M.copies(x, h), bw = Math.min(26, (bot.x(1) - bot.x(0)) * 0.62);
  for (let n = 0; n < L; n++) {
    let pos = 0, neg = 0, net = 0;
    for (let k = 0; k < s1.reveal; k++) {
      const v = rows[k][n]; if (!v) continue;
      const from = v > 0 ? pos : neg, to = from + v;
      ctx.fillStyle = KCOL[k]; ctx.globalAlpha = 0.9;
      const Y0 = bot.y(from), Y1 = bot.y(to);
      ctx.fillRect(bot.x(n) - bw / 2, Math.min(Y0, Y1), bw, Math.max(1.5, Math.abs(Y1 - Y0)));
      ctx.globalAlpha = 1; ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(bot.x(n) - bw / 2, Math.min(Y0, Y1), bw, Math.abs(Y1 - Y0));
      if (v > 0) pos = to; else neg = to; net += v;
    }
    if (s1.reveal > 0) { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(bot.x(n), bot.y(net), 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  const partial = x.map((v, k) => (k < s1.reveal ? v : 0));
  const y = M.conv(partial, h);
  const prog = s1.reveal < N ? t('s1progress', { c: s1.reveal, N }) : '';
  $('r1').textContent = t('s1readout', { prog, y: y.map(v => fmt(v)).join(', '), last: L - 1, L });
}

/* ---------- step 2: one column = flip, slide, multiply, add ---------- */
const s2 = { visited: new Set([2]) };
const N2 = { min: -2, max: 8 };
function draw2() {
  const n = num('n2'), x = s1.x, h = M.ECHO, col = M.terms(x, h, n), yAll = M.conv(x, h);
  $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  const opt = { xMin: -3.5, xMax: 9.5, xTicks: true };
  const A = panel(ctx, W, { ...opt, top: 26, bottom: 140, yMin: -2.2, yMax: 2.2, yTicks: [-2, 0, 2], title: t('c2a') });
  // overlap band
  if (col.terms.length) {
    const k0 = Math.min(...col.terms.map(q => q.k)), k1 = Math.max(...col.terms.map(q => q.k));
    ctx.fillStyle = 'rgba(255,180,84,0.08)'; ctx.fillRect(A.x(k0 - 0.45), A.P.t, A.x(k1 + 0.45) - A.x(k0 - 0.45), A.P.b - A.P.t);
  }
  x.forEach((v, k) => stem(ctx, A, k, v, C.xs, { hollow: v === 0, dx: -4 }));
  h.forEach((v, j) => { const k = n - j; if (k >= opt.xMin && k <= opt.xMax) stem(ctx, A, k, v, C.orange, { hollow: true, dx: 4, lw: 2 }); });
  const B = panel(ctx, W, { ...opt, top: 182, bottom: 280, yMin: -2.2, yMax: 2.2, yTicks: [-2, 0, 2], title: t('c2b') });
  col.terms.forEach(q => stem(ctx, B, q.k, q.prod, C.green, { hollow: q.prod === 0 }));
  const Cp = panel(ctx, W, { ...opt, top: 322, bottom: H - 26, yMin: -4.2, yMax: 4.2, yTicks: [-4, 0, 4], title: t('c2c') });
  [...s2.visited].forEach(m => { const v = m >= 0 && m < yAll.length ? yAll[m] : 0; if (m !== n) stem(ctx, Cp, m, v, C.cyan, { alpha: 0.75, hollow: v === 0, r: 3.5 }); });
  stem(ctx, Cp, n, col.sum, C.text, { r: 5, hollow: Math.abs(col.sum) < 1e-12 });
  vguide(ctx, A.x(n), A.P.t, Cp.P.b);
  const total = N2.max - N2.min + 1;
  const prog = s2.visited.size < total ? t('s2progress', { c: s2.visited.size, N: total }) : '';
  if (!col.terms.length) { $('r2').textContent = prog + t('s2none', { n }); return; }
  const sym = col.terms.map(q => `x[${q.k}]·h[${q.j}]`).join(' + ');
  const nums = col.terms.map(q => `${par(q.xk)}×${fmt(q.hj)}`).join(' + ');
  $('r2').textContent = prog + t('s2readout', { n, terms: sym + ' = ' + nums, y: fmt(col.sum) });
}

/* ---------- step 3: smoothing trade-off ---------- */
const s3 = { set: 0, hist: new Set([1]) };
function draw3() {
  const w = num('w3'), S = M.scene(s3.set), r = M.smoothing(w, s3.set);
  $('w3v').textContent = String(w);
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: S.L - 1, yMin: -0.9, yMax: 1.9, yTicks: [0, 1], xTicks: true, xSteps: [20, 40, 60, 120], minPx: 30, title: t('c3a') });
  ctx.save(); ctx.fillStyle = C.raw;
  S.raw.forEach((v, n) => { const Y = A.y(Math.max(-0.9, Math.min(1.9, v))); ctx.fillRect(A.x(n) - 1, Y - 1, 2, 2); });
  ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath();
  S.clean.forEach((v, n) => { if (n === 0) ctx.moveTo(A.x(n), A.y(v)); else { ctx.lineTo(A.x(n), A.y(S.clean[n - 1])); ctx.lineTo(A.x(n), A.y(v)); } }); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
  r.out.forEach((v, n) => { const Y = A.y(Math.max(-0.9, Math.min(1.9, v))); if (n === 0) ctx.moveTo(A.x(n), Y); else ctx.lineTo(A.x(n), Y); }); ctx.stroke();
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: 136, xMin: 0, xMax: 16, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: false, title: t('c3b') });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let v = 1; v <= 15.001; v += 0.1) { const Y = B.y(1 / Math.sqrt(v)); if (v === 1) ctx.moveTo(B.x(v), Y); else ctx.lineTo(B.x(v), Y); }
  ctx.stroke(); ctx.restore();
  const D = panel(ctx, W, { top: 178, bottom: H - 26, xMin: 0, xMax: 16, yMin: 0, yMax: 15, yTicks: [0, 7, 14], xTicks: true, xSteps: [1, 2, 4, 8], minPx: 22, title: t('c3c') });
  const dot = (m, X, Y, col, rad) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(m.x(X), m.y(Y), rad, 0, 7); ctx.fill(); };
  [...s3.hist].forEach(v => { if (v === w) return; const q = M.smoothing(v, s3.set); dot(B, v, q.noiseRatio, C.text, 3.5); dot(D, v, q.ramp, C.text, 3.5); });
  dot(B, w, r.noiseRatio, C.cyan, 5.5); dot(D, w, r.ramp, C.cyan, 5.5);
  vguide(ctx, B.x(w), B.P.t, D.P.b, C.cyan);
  $('r3').textContent = t('s3readout', { set: s3.set + 1, w, r: r.noiseRatio.toFixed(3), rt: r.theory.toFixed(3), e: r.ramp, wm1: w - 1 });
}

/* ---------- step 4: continuous convolution as overlap area ---------- */
const T4 = { min: -0.5, max: 3.5, d: 0.02 };
const s4 = { shape: 'box', visited: new Uint8Array(Math.round((T4.max - T4.min) / T4.d) + 1), last: null };
const tIdx = v => Math.round((v - T4.min) / T4.d);
function markT(v) {
  const i = tIdx(v), j = s4.last === null ? i : s4.last;
  for (let q = Math.min(i, j); q <= Math.max(i, j); q++) s4.visited[q] = 1;
  s4.last = i;
}
function clear4() { s4.visited.fill(0); s4.last = null; markT(num('t4')); }
function draw4() {
  const tt = num('t4'), b = num('b4'), sh = s4.shape;
  $('t4v').textContent = tt.toFixed(2); $('b4v').textContent = b.toFixed(2);
  $('shapeBox').setAttribute('aria-pressed', sh === 'box'); $('shapeRamp').setAttribute('aria-pressed', sh === 'ramp');
  const { ctx, W, H } = fitCanvas($('c4'));
  const opt = { xMin: -2.6, xMax: 4.1, xTicks: true, xSteps: [0.5, 1, 2], minPx: 28 };
  const A = panel(ctx, W, { ...opt, top: 26, bottom: 168, yMin: 0, yMax: 1.25, yTicks: [0, 1], title: t('c4a') });
  // f: rectangle on [0, 1]
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.16)'; ctx.fillRect(A.x(0), A.y(1), A.x(1) - A.x(0), A.y(0) - A.y(1));
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.x(opt.xMin), A.y(0)); ctx.lineTo(A.x(0), A.y(0)); ctx.lineTo(A.x(0), A.y(1)); ctx.lineTo(A.x(1), A.y(1)); ctx.lineTo(A.x(1), A.y(0)); ctx.lineTo(A.x(opt.xMax), A.y(0)); ctx.stroke();
  // overlap: τ in [max(0, t−b), min(1, t)], height g(t − τ)
  const o = M.overlap(b, tt);
  if (o) {
    ctx.fillStyle = 'rgba(126,226,168,0.45)'; ctx.beginPath(); ctx.moveTo(A.x(o.lo), A.y(0));
    for (let i = 0; i <= 60; i++) { const tau = o.lo + (o.hi - o.lo) * i / 60; ctx.lineTo(A.x(tau), A.y(M.g(sh, b, tt - tau))); }
    ctx.lineTo(A.x(o.hi), A.y(0)); ctx.closePath(); ctx.fill();
  }
  // g(t − τ): flipped, slid to t; support τ ∈ [t − b, t] (always inside the axis for the slider ranges)
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(A.x(tt - b), A.y(0));
  for (let i = 0; i <= 80; i++) { const tau = tt - b + b * i / 80; ctx.lineTo(A.x(tau), A.y(M.g(sh, b, tt - tau))); }
  ctx.lineTo(A.x(tt), A.y(0));
  ctx.stroke(); ctx.restore();
  const Bp = panel(ctx, W, { ...opt, top: 210, bottom: H - 26, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], title: t('c4b') });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.4; ctx.beginPath();
  let pen = false;
  s4.visited.forEach((on, i) => { const v = T4.min + i * T4.d; if (!on) { pen = false; return; } const X = Bp.x(v), Y = Bp.y(M.contY(sh, b, v)); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); });
  ctx.stroke();
  const yNow = M.contY(sh, b, tt);
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(Bp.x(tt), Bp.y(yNow), 5.5, 0, 7); ctx.fill(); ctx.restore();
  vguide(ctx, A.x(tt), A.P.t, Bp.P.b);
  const st = M.contStats(sh, b);
  const ov = o ? t('s4ov', { lo: o.lo.toFixed(2), hi: o.hi.toFixed(2), y: yNow.toFixed(3) }) : t('s4nov');
  $('r4').textContent = t('s4readout', { t: tt.toFixed(2), ov, end: st.end.toFixed(2), peak: st.peak.toFixed(3), flat: st.flat.toFixed(2), total: st.total.toFixed(3), ga: st.gArea.toFixed(3) });
}

/* ---------- step 5: the same kernel, seen by frequency ---------- */
const s5 = { hist: new Set() };
function draw5() {
  const f = num('f5'), w = num('w5');
  $('f5v').textContent = f.toFixed(3); $('w5v').textContent = String(w);
  s5.hist.add(f.toFixed(3));
  const run = M.sineRun(w, f), meas = M.measureGain(w, f), Hf = M.HboxFormula(w, f);
  let { ctx, W, H } = fitCanvas($('c5'));
  const n0 = 100, n1 = 163;
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: n0 - 0.5, xMax: n1 + 0.5, yMin: -1.25, yMax: 1.25, yTicks: [-1, 0, 1], xTicks: true, xSteps: [8, 16, 32], minPx: 30, title: t('c5a') });
  const line = (arr, col, lw, rad) => {
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let n = n0; n <= n1; n++) { const X = A.x(n), Y = A.y(arr[n]); if (n === n0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke(); for (let n = n0; n <= n1; n++) { ctx.beginPath(); ctx.arc(A.x(n), A.y(arr[n]), rad, 0, 7); ctx.fill(); } ctx.restore();
  };
  line(run.x, C.raw, 1.2, 2); line(run.y, C.cyan, 2, 2.6);

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 0.5, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.05, 0.1, 0.25], minPx: 30, xDigits: 2, title: t('c5b') });
  ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.grid; ctx.lineWidth = 1.2;
  for (let m = 1; m / w <= 0.5 + 1e-9; m++) { ctx.beginPath(); ctx.moveTo(B.x(m / w), B.P.t); ctx.lineTo(B.x(m / w), B.P.b); ctx.stroke(); }
  ctx.setLineDash([]); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 400; i++) { const fq = 0.5 * i / 400, Y = B.y(Math.abs(M.HboxFormula(w, fq))); if (!i) ctx.moveTo(B.x(fq), Y); else ctx.lineTo(B.x(fq), Y); }
  ctx.stroke();
  [...s5.hist].forEach(k => { const fq = Number(k); if (Math.abs(fq - f) < 1e-9) return; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(B.x(fq), B.y(M.measureGain(w, fq).amp), 3.2, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(B.x(f), B.y(meas.amp), 5.5, 0, 7); ctx.fill(); ctx.restore();
  vguide(ctx, B.x(f), B.P.t, B.P.b, C.cyan);
  const note = meas.amp < 1e-3 ? t('zeroNote') : meas.a < 0 ? t('flipNote') : '';
  $('r5').textContent = t('s5readout', { w, f: f.toFixed(3), m: meas.amp.toFixed(3), h: Math.abs(Hf).toFixed(3), note });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildXControls();
  ['k0', 'a0'].forEach(id => $(id).addEventListener('input', draw0));
  $('add1').addEventListener('click', () => {
    s1.reveal = 0; draw1();
    animate('s1', 6 * 650, p => { s1.reveal = Math.min(5, Math.floor(p * 6)); draw1(); });
  });
  $('all1').addEventListener('click', () => { stopAnim('s1'); s1.reveal = 5; draw1(); });

  $('n2').addEventListener('input', () => { stopAnim('s2'); s2.visited.add(num('n2')); draw2(); });
  $('sweep2').addEventListener('click', () => {
    s2.visited.clear();
    const total = N2.max - N2.min + 1;
    animate('s2', total * 450, p => {
      const n = N2.min + Math.min(total - 1, Math.floor(p * total));
      for (let m = N2.min; m <= n; m++) s2.visited.add(m);
      $('n2').value = n; draw2();
    });
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('w3').addEventListener('input', () => { s3.hist.add(num('w3')); draw3(); });
  $('reroll3').addEventListener('click', () => { s3.set = (s3.set + 1) % M.SEEDS.length; s3.hist = new Set([num('w3')]); draw3(); });
  $('clear3').addEventListener('click', () => { s3.hist = new Set([num('w3')]); draw3(); });

  $('t4').addEventListener('input', () => { stopAnim('s4'); markT(num('t4')); draw4(); });
  $('b4').addEventListener('input', () => { clear4(); draw4(); });
  $('shapeBox').addEventListener('click', () => { s4.shape = 'box'; clear4(); draw4(); });
  $('shapeRamp').addEventListener('click', () => { s4.shape = 'ramp'; clear4(); draw4(); });
  $('sweep4').addEventListener('click', () => {
    s4.visited.fill(0); s4.last = tIdx(T4.min); // trace from the left end even when the sweep jumps straight to the end
    animate('s4', 4500, p => {
      const v = Math.round((T4.min + p * (T4.max - T4.min)) / T4.d) * T4.d;
      $('t4').value = v.toFixed(2); markT(num('t4')); draw4();
    });
  });
  markT(num('t4'));

  $('f5').addEventListener('input', draw5);
  $('w5').addEventListener('input', () => { s5.hist.clear(); draw5(); });

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
  window.refreshConvolution = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
