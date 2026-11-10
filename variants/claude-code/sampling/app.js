'use strict';
// Sampling & aliasing lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.SAMP_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SAMP_MODEL;
const t = (...a) => window.SAMP_I18N.t(...a);
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

/* ---------- step 0: the strobed wheel ---------- */
const s0 = { m: 5, playing: false, tried: new Set([23]) };
function draw0() {
  const f = num('f0'), w = M.wheel(f);
  $('f0v').textContent = fmt(f, 1);
  let { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 17, W - 16);
  const cx = W / 2, cy = (H + 26) / 2, R = Math.min(W / 2 - 24, (H - 26) / 2 - 22);
  ctx.save();
  ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(cx + (R - 6) * Math.sin(a), cy - (R - 6) * Math.cos(a)); ctx.lineTo(cx + R * Math.sin(a), cy - R * Math.cos(a)); ctx.stroke(); }
  const P = deg => [cx + R * 0.86 * Math.sin(deg * Math.PI / 180), cy - R * 0.86 * Math.cos(deg * Math.PI / 180)];
  const m = s0.m, from = Math.max(0, m - 5);
  for (let j = from; j < m; j++) {
    const [X, Y] = P(M.spoke(f, j)); ctx.globalAlpha = 0.18 + 0.5 * (j - from + 1) / (m - from + 1);
    ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(X, Y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (m > 0 && !w.edge && Math.abs(w.app) > 0.5) {
    // the eye's shortest-path step from the previous frame to this one
    const a0 = M.spoke(f, m - 1), a1 = a0 + w.app, r = R * 0.5;
    ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath();
    const toRad = d => (d - 90) * Math.PI / 180;
    ctx.arc(cx, cy, r, toRad(a0), toRad(a1), w.app < 0); ctx.stroke();
    const ex = cx + r * Math.cos(toRad(a1)), ey = cy + r * Math.sin(toRad(a1)), dir = w.app > 0 ? 1 : -1, tg = toRad(a1) + dir * Math.PI / 2;
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(ex + 7 * Math.cos(tg), ey + 7 * Math.sin(tg)); ctx.lineTo(ex + 4 * Math.cos(tg + 2.2), ey + 4 * Math.sin(tg + 2.2)); ctx.lineTo(ex + 4 * Math.cos(tg - 2.2), ey + 4 * Math.sin(tg - 2.2)); ctx.fill();
  }
  const [X, Y] = P(M.spoke(f, m));
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(X, Y); ctx.stroke();
  dot(ctx, X, Y, 6, C.cyan); dot(ctx, cx, cy, 4, C.text, false);
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c0b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 50, yMin: -13, yMax: 13, yTicks: [-12, -6, 0, 6, 12], xTicks: true, xSteps: [6, 12, 24], minPx: 26, title: t('c0b') });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
  for (let k = 0; k <= 2; k++) { // one tooth per multiple of 24, drawn separately so the jumps are not joined
    const a = Math.max(0, 24 * k - 12), b = Math.min(50, 24 * k + 12);
    ctx.beginPath(); ctx.moveTo(B.x(a), B.y(a - 24 * k)); ctx.lineTo(B.x(b), B.y(b - 24 * k)); ctx.stroke();
  }
  ctx.restore();
  for (const v of s0.tried) if (v !== f) dot(ctx, B.x(v), B.y(M.wheel(v).appHz), 3.5, C.text);
  dot(ctx, B.x(f), B.y(w.appHz), 6, C.cyan);
  vline(ctx, B.x(f), B.P.t, B.P.b, C.cyan);
  const dir = w.edge ? t('dirEdge') : Math.abs(w.appHz) < 1e-9 ? t('dirStill') : w.appHz > 0 ? t('dirCW') : t('dirCCW');
  $('r0').textContent = t('s0readout', { f: fmt(f, 1), step: fmt(w.step, 1), k: w.turns, app: fmt(w.app, 1), dir, fa: fmt(Math.abs(w.appHz), 1) });
  $('r0b').textContent = s0.playing || s0.m === 24 ? t('s0play', { m: s0.m, tr: fmt(f * s0.m / 24, 2), ap: fmt(w.appHz * s0.m / 24, 2) }) : '';
}

/* ---------- step 1: one set of samples, many cosines ---------- */
const s1 = { all: false };
function draw1() {
  const f = num('f1'), k = num('k1'), fs = M.S1.fs, r = M.sameSamples(f, k);
  $('f1v').textContent = fmt(f, 1); $('k1v').textContent = String(k);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 1, yMin: -1.25, yMax: 1.25, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.125, 0.25, 0.5], xDigits: 3, minPx: 38, title: t('c1') });
  const ts = grid(0, 1, Math.max(400, Math.round(W * 1.5)));
  if (s1.all) for (let kk = -2; kk <= 2; kk++) if (kk !== k && kk !== 0) { const g = Math.abs(f + kk * fs); curve(ctx, A, ts, v => M.cosw(g, v), C.orange, { lw: 1.2, alpha: 0.35 }); }
  curve(ctx, A, ts, v => M.cosw(f, v), C.ghost, { lw: 2, dash: [6, 4] });
  if (k !== 0) curve(ctx, A, ts, v => M.cosw(r.g, v), C.orange, { lw: 2 });
  for (let n = 0; n <= fs; n++) dot(ctx, A.x(n / fs), A.y(M.cosw(f, n / fs)), 5, C.text);
  $('r1').textContent = t('s1readout', { f: fmt(f, 1), k, g: fmt(r.g, 1), d0: r.d0.toFixed(3), d1: r.d1.toFixed(3), low: fmt(r.low, 1) }) + (k === 0 ? t('s1self') : '');
}

/* ---------- step 2: the folding chart ---------- */
const s2 = { tried: new Set([30]) };
function draw2() {
  const fs = M.RATES[num('fs2')], f = num('f2'), { k, g } = M.aliasSigned(f, fs), fa = Math.abs(g);
  $('fs2v').textContent = fmt(fs, 2); $('f2v').textContent = fmt(f, 1);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 60, yMin: 0, yMax: 25, yTicks: [0, 5, 10, 15, 20, 25], xTicks: true, xSteps: [5, 10, 20, 30], minPx: 30, title: t('c2') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(A.P.l, A.y(fs / 2), A.P.r - A.P.l, A.y(0) - A.y(fs / 2)); ctx.restore();
  for (let j = 1; j * fs / 2 < 60; j++) vline(ctx, A.x(j * fs / 2), A.P.t, A.P.b, j % 2 ? C.muted : C.axis, [3, 4], 0.45);
  curve(ctx, A, grid(0, 60, 1200), v => M.fold(v, fs), C.orange, { lw: 2 });
  for (const v of s2.tried) if (Math.abs(v - f) > 1e-9) dot(ctx, A.x(v), A.y(M.fold(v, fs)), 3.5, C.text);
  vline(ctx, A.x(f), A.y(fa), A.P.b, C.cyan, [4, 4], 0.8);
  dot(ctx, A.x(f), A.y(fa), 6, C.cyan);
  const ny = fs / 2, state = Math.abs(f - ny) < 1e-9 ? t('s2at') : f < ny ? t('s2below') : t('s2above');
  $('r2').textContent = t('s2readout', { f: fmt(f, 1), fs: fmt(fs, 2), k, kfs: fmt(k * fs, 2), g: fmt(Math.abs(f - k * fs), 2), fa: fmt(fa, 2), ny: fmt(ny, 3), state });
}

/* ---------- step 3: ideal reconstruction ---------- */
function draw3() {
  const f = num('f3'), phd = num('p3'), ph = phd * Math.PI / 180, R = M.reconRun(f, ph), fs = M.S3.fs;
  $('f3v').textContent = fmt(f, 2); $('p3v').textContent = phd + '°';
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 2, yMin: -1.3, yMax: 1.3, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.1, 0.2, 0.25, 0.5], minPx: 34, title: t('c3') });
  const ts = grid(0, 2, Math.max(400, Math.round(W * 1.5)));
  curve(ctx, A, ts, v => M.cosw(f, v, ph), C.ghost, { lw: 1.8, dash: [6, 4] });
  curve(ctx, A, R.ts, (v, i) => R.y[i], C.cyan, { lw: 2.4 });
  for (let n = 0; n <= 2 * fs; n++) dot(ctx, A.x(n / fs), A.y(M.cosw(f, n / fs, ph)), 4.5, C.text);
  const P = R.P, g = P.g;
  const note = Math.abs(g) < 1e-9 && f > 0 ? t('s3zero') : P.edge ? t('s3edge') : f < fs / 2 ? t('s3below') : t('s3above');
  const rph = Math.round(P.phase * 180 / Math.PI);
  $('r3').textContent = t('s3readout', { f: fmt(f, 2), ph: phd, fa: fmt(P.fa, 2), amp: fmt(P.amp, 3), rph: P.amp < 0 ? 0 : rph, e0: R.eOrig.toFixed(3), e1: R.eAlias.toFixed(3), note });
}

/* ---------- step 4: spectral copies ---------- */
function draw4() {
  const B = num('b4'), fs = num('fs4');
  $('b4v').textContent = fmt(B, 1); $('fs4v').textContent = fmt(fs, 1);
  const { ctx, W, H } = fitCanvas($('c4'));
  const opt = { xMin: -30, xMax: 30, xTicks: true, xSteps: [5, 10, 15, 30], minPx: 30 };
  const A = panel(ctx, W, { ...opt, top: 26, bottom: 130, yMin: 0, yMax: 1.25, yTicks: [0, 1], title: t('c4a') });
  const fsx = grid(-30, 30, Math.max(600, Math.round(W * 1.5)));
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.25)'; ctx.beginPath(); ctx.moveTo(A.x(-30), A.y(0)); fsx.forEach(v => ctx.lineTo(A.x(v), A.y(M.tri(v, B)))); ctx.lineTo(A.x(30), A.y(0)); ctx.fill(); ctx.restore();
  curve(ctx, A, fsx, v => M.tri(v, B), C.cyan, { lw: 2 });
  const Bp = panel(ctx, W, { ...opt, top: 174, bottom: H - 26, yMin: 0, yMax: 2.1, yTicks: [0, 1, 2], title: t('c4b') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(Bp.x(-fs / 2), Bp.P.t, Bp.x(fs / 2) - Bp.x(-fs / 2), Bp.P.b - Bp.P.t); ctx.restore();
  vline(ctx, Bp.x(-fs / 2), Bp.P.t, Bp.P.b, C.cyan, [3, 3], 0.6); vline(ctx, Bp.x(fs / 2), Bp.P.t, Bp.P.b, C.cyan, [3, 3], 0.6);
  // pink: the excess of the sum over the largest single copy, i.e. where copies pile up
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.55)';
  const K = Math.ceil(30 / fs) + 2, copyMax = v => { let m = 0; for (let k = -K; k <= K; k++) m = Math.max(m, M.tri(v - k * fs, B)); return m; };
  for (let i = 1; i < fsx.length; i++) {
    const v = (fsx[i - 1] + fsx[i]) / 2, s = M.sampledSpec(v, B, fs, K), mx = copyMax(v);
    if (s - mx > 1e-6) ctx.fillRect(Bp.x(fsx[i - 1]), Bp.y(s), Bp.x(fsx[i]) - Bp.x(fsx[i - 1]) + 0.5, Bp.y(mx) - Bp.y(s));
  }
  ctx.restore();
  for (let k = -K; k <= K; k++) if (k !== 0) curve(ctx, Bp, fsx, v => M.tri(v - k * fs, B), C.orange, { lw: 1.5, alpha: 0.9 });
  curve(ctx, Bp, fsx, v => M.tri(v, B), C.cyan, { lw: 2 });
  curve(ctx, Bp, fsx, v => M.sampledSpec(v, B, fs, K), C.text, { lw: 1.6, dash: [5, 3] });
  const tb = 2 * B, pct = 100 * M.aliasFraction(B, fs, 8000);
  const state = Math.abs(fs - tb) < 1e-9 ? t('s4touch') : fs > tb ? t('s4gap', { gap: fmt(fs - tb, 1) }) : t('s4lack', { lack: fmt(tb - fs, 1) });
  const theory = fs < tb && fs >= B ? t('s4theory', { th: fmt(100 * M.aliasFractionTheory(B, fs), 1) }) : '';
  $('r4').textContent = t('s4readout', { fs: fmt(fs, 1), tb: fmt(tb, 1), state, pct: fmt(pct, 1), theory });
}

/* ---------- step 5: anti-aliasing filter ---------- */
function draw5() {
  const fc = num('fc5'), N = num('n5'), r = M.antiAlias(fc, N), S = M.S5;
  $('fc5v').textContent = fmt(fc, 1); $('n5v').textContent = String(N);
  const clampDb = v => Math.max(-80, v);
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 50, yMin: -80, yMax: 5, yTicks: [-80, -60, -40, -20, 0], xTicks: true, xSteps: [5, 10, 25], minPx: 30, title: t('c5a') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(A.x(0), A.P.t, A.x(S.hear) - A.x(0), A.P.b - A.P.t); ctx.restore();
  vline(ctx, A.x(S.fs / 2), A.P.t, A.P.b, C.muted, [4, 4], 0.8); vline(ctx, A.x(r.stop), A.P.t, A.P.b, C.muted, [2, 3], 0.8);
  curve(ctx, A, grid(0, 50, 600), v => clampDb(M.dB(M.butter(v, fc, N))), C.cyan, { lw: 2.2 });
  dot(ctx, A.x(S.want), A.y(clampDb(r.want)), 6, C.green);
  dot(ctx, A.x(S.hum), A.y(clampDb(r.hum)), 6, C.pink);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const Bp = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: S.fs / 2, yMin: -80, yMax: 5, yTicks: [-80, -60, -40, -20, 0], xTicks: true, xSteps: [5, 10], minPx: 30, title: t('c5b') });
  const bar = (f, v, col) => { const w = Math.max(10, (Bp.P.r - Bp.P.l) * 0.06); ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(Bp.x(f) - w / 2, Bp.y(clampDb(v)), w, Bp.y(-80) - Bp.y(clampDb(v))); ctx.restore(); };
  bar(S.want, r.want, C.green); bar(r.humAt, r.hum, C.pink);
  $('r5').textContent = t('s5readout', { fc: fmt(fc, 1), N, w: fmt(r.want, 2), h: fmt(r.hum, 1), e: fmt(-r.edge, 1), s: fmt(-r.stopDb, 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('f0').addEventListener('input', () => { stopAnim('s0'); s0.playing = false; s0.m = 5; s0.tried.add(num('f0')); draw0(); });
  $('play0').addEventListener('click', () => {
    s0.playing = true; s0.m = 0; draw0();
    animate('s0', 24 * 260, p => { s0.m = Math.min(24, Math.floor(p * 24.999)); draw0(); }, () => { s0.playing = false; s0.m = 24; draw0(); });
  });
  $('reset0').addEventListener('click', () => { stopAnim('s0'); s0.playing = false; s0.m = 5; s0.tried = new Set([num('f0')]); draw0(); });

  ['f1', 'k1'].forEach(id => $(id).addEventListener('input', draw1));
  $('all1').addEventListener('click', () => { s1.all = !s1.all; $('all1').setAttribute('aria-pressed', String(s1.all)); $('all1').dataset.i18n = s1.all ? 'one1' : 'all1'; $('all1').textContent = t($('all1').dataset.i18n); draw1(); });

  $('fs2').addEventListener('input', () => { s2.tried = new Set([num('f2')]); draw2(); });
  $('f2').addEventListener('input', () => { s2.tried.add(num('f2')); draw2(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  ['f3', 'p3'].forEach(id => $(id).addEventListener('input', draw3));
  ['b4', 'fs4'].forEach(id => $(id).addEventListener('input', draw4));
  ['fc5', 'n5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshSampling = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
