'use strict';
// Fourier lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.FOURIER_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.FOURIER_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', red: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', dot: '#8ea3bb', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, then trailing zeros dropped only after a decimal point (90 stays 90); −0 shows as 0.
const fmt = (v, d = 2) => {
  if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
  let s = v.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('-', '−');
};
// Two significant figures, plain decimal notation (no exponent) for the pressure ticks.
const sig = (v, n = 2) => { if (!v) return '0'; const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v)))); return fmt(v, d); };

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

// Text that shrinks until it fits maxW (never overflows, never squeezes glyphs).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

// A plot panel. The title sits in its own row above the plot; tick labels sit left of / below it.
// o: top, bottom, xMin, xMax, yMin, yMax, yTicks [values], yLabel(v), xTicks [values] | null, xLabel(v), title, left, right
function panel(ctx, W, o) {
  const P = { l: o.left || 46, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l + 0.5, P.t + 0.5, P.r - P.l - 1, P.b - P.t - 1);
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 && o.yMin < 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.textAlign = 'center';
    for (const v of o.xTicks) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 8, o.titleY || P.t - 9, W - 16);
  return { x, y, P };
}
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6); return out; };
// Tick spacing that keeps labels at least minPx apart.
function ticks(a, b, px, minPx, steps) { for (const s of steps) if (s / (b - a) * px >= minPx) return range(Math.ceil(a / s) * s, b, s); return [a, b]; }
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function curve(ctx, m, f, x0, x1, n, color, lw = 2, dash = null) {
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function vline(ctx, X, y0, y1, color, lw = 1.2, dash = [4, 4], alpha = 0.7) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}

/* ---------- shared one-shot animation runner (reduced motion → final frame; hidden page → final frame) ---------- */
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

const deg = r => r * 180 / Math.PI;
const signalX = tt => M.mix(M.TARGET, tt);

/* ---------- step 0: guess the three amplitudes by eye ---------- */
const s0 = { g: [0.5, 0.5, 0.5], shown: false };
const PARTCOL = ['#c9a7ff', '#8fd6c0', '#e6c27a'];
function buildGuess() {
  const box = $('gControls');
  M.TARGET.forEach((c, i) => {
    const lab = document.createElement('label');
    lab.innerHTML = `<span class="g-name"></span><output id="g${i}v"></output><input id="g${i}" data-step="0" type="range" min="0" max="1" step="0.05" value="${s0.g[i]}">`;
    box.appendChild(lab);
    lab.querySelector('input').addEventListener('input', e => { s0.g[i] = Number(e.target.value); draw0(); });
  });
}
function draw0() {
  const guessComps = M.TARGET.map((c, i) => ({ f: c.f, a: s0.g[i] }));
  const gx = tt => M.mix(guessComps, tt);
  M.TARGET.forEach((c, i) => { $('g' + i + 'v').textContent = fmt(s0.g[i], 2); $('g' + i).closest('label').querySelector('.g-name').textContent = t('guess', { f: c.f }); });
  $('reveal0').textContent = t(s0.shown ? 'hide' : 'reveal'); $('reveal0').setAttribute('aria-pressed', s0.shown ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 1, yMin: -2, yMax: 2, yTicks: [-1.5, 0, 1.5], xTicks: ticks(0, 1, W - 58, 34, [0.1, 0.2, 0.25, 0.5]), xLabel: v => fmt(v, 2), title: t('c0a') });
  if (s0.shown) M.TARGET.forEach((c, i) => curve(ctx, m, tt => M.mix([c], tt), 0, 1, 600, PARTCOL[i], 1.4, [5, 4]));
  curve(ctx, m, tt => signalX(tt) - gx(tt), 0, 1, 800, C.red, 1.4);
  curve(ctx, m, signalX, 0, 1, 800, C.text, 2.4);
  curve(ctx, m, gx, 0, 1, 800, C.cyan, 2);
  const e = M.rmsDiff(signalX, gx);
  const ans = s0.shown ? t('s0ans', { a: M.TARGET.map(c => c.f + ' Hz ' + fmt(c.a, 2)).join(' · ') }) : '';
  $('r0').textContent = t('s0readout', { g: M.TARGET.map((c, i) => c.f + ' Hz ' + fmt(s0.g[i], 2)).join(' · '), e: fmt(e, 3), ans });
}

/* ---------- step 1: one sine probe, multiply and average ---------- */
const s1 = { asked: new Map() };
function fillSigned(ctx, m, g, n) {
  const path = () => { ctx.beginPath(); ctx.moveTo(m.x(0), m.y(0)); for (let i = 0; i <= n; i++) { const v = i / n; ctx.lineTo(m.x(v), m.y(g(v))); } ctx.lineTo(m.x(1), m.y(0)); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.y(0) - m.P.t); ctx.clip(); path(); ctx.fillStyle = 'rgba(126,226,168,0.7)'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.y(0), m.P.r - m.P.l, m.P.b - m.y(0)); ctx.clip(); path(); ctx.fillStyle = 'rgba(255,122,147,0.7)'; ctx.fill(); ctx.restore();
}
function draw1() {
  const k = num('k1'), probe = tt => Math.sin(M.TWO_PI * k * tt), b = M.sinProbe(signalX, k);
  s1.asked.set(k, b);
  $('k1v').textContent = k + ' Hz';
  const { ctx, W, H } = fitCanvas($('c1'));
  const xt = ticks(0, 1, W - 58, 34, [0.1, 0.2, 0.25, 0.5]);
  const A = panel(ctx, W, { top: 26, bottom: 128, xMin: 0, xMax: 1, yMin: -1.9, yMax: 1.9, yTicks: [-1, 0, 1], title: t('c1a') });
  curve(ctx, A, signalX, 0, 1, 800, C.raw, 2);
  curve(ctx, A, probe, 0, 1, 800, C.orange, 1.8);
  const B = panel(ctx, W, { top: 170, bottom: 272, xMin: 0, xMax: 1, yMin: -1.9, yMax: 1.9, yTicks: [-1, 0, 1], xTicks: xt, xLabel: v => fmt(v, 2), title: t('c1b') });
  fillSigned(ctx, B, tt => signalX(tt) * probe(tt), 1200);
  const Cp = panel(ctx, W, { top: 320, bottom: H - 26, xMin: 0, xMax: 12.8, yMin: -0.1, yMax: 1, yTicks: [0, 0.5, 1], xTicks: W < 420 ? range(2, 12, 2) : range(1, 12, 1), xLabel: v => String(v), title: t('c1c') });
  const bw = Math.min(22, (Cp.x(1) - Cp.x(0)) * 0.6);
  s1.asked.forEach((v, q) => { ctx.fillStyle = q === k ? C.cyan : 'rgba(103,215,249,0.45)'; const y0 = Cp.y(0), y1 = Cp.y(v); ctx.fillRect(Cp.x(q) - bw / 2, Math.min(y0, y1), bw, Math.max(1.5, Math.abs(y1 - y0))); });
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.strokeRect(Cp.x(k) - bw / 2 - 3, Cp.P.t + 2, bw + 6, Cp.P.b - Cp.P.t - 4);
  const hit = M.TARGET.find(c => c.f === k);
  const prog = s1.asked.size < 12 ? t('s1progress', { c: s1.asked.size, N: 12 }) : '';
  $('r1').textContent = t('s1readout', { prog, k, m: fmt(b / 2, 3), b: fmt(b, 3), why: hit ? t('s1hit', { k }) : t('s1miss', { k }) });
}

/* ---------- step 2: sine + cosine probe, magnitude and phase ---------- */
const s2 = { trail: new Set([0]) };
function draw2() {
  const phDeg = num('ph2'), ph = phDeg * Math.PI / 180;
  s2.trail.add(phDeg);
  const comps = M.TARGET.map(c => (c.f === 5 ? { ...c, ph } : c)), x = tt => M.mix(comps, tt), p = M.probePair(x, 5);
  $('ph2v').textContent = phDeg + '°';
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 1, yMin: -2, yMax: 2, yTicks: [-1.5, 0, 1.5], xTicks: ticks(0, 1, W - 58, 34, [0.1, 0.2, 0.25, 0.5]), xLabel: v => fmt(v, 2), title: t('c2a') });
  curve(ctx, A, x, 0, 1, 800, C.text, 2);
  curve(ctx, A, tt => 0.5 * Math.sin(M.TWO_PI * 5 * tt + ph), 0, 1, 600, C.cyan, 2);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const size = Math.min(W - 70, H - 64), left = Math.max(46, (W - size) / 2 + 10);
  const B = panel(ctx, W, { top: 30, bottom: 30 + size, left, right: W - left - size, xMin: -0.65, xMax: 0.65, yMin: -0.65, yMax: 0.65, yTicks: [-0.5, 0, 0.5], xTicks: [-0.5, 0, 0.5], title: t('c2b') });
  ctx.save(); clipTo(ctx, B);
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(B.x(0), B.P.t); ctx.lineTo(B.x(0), B.P.b); ctx.stroke();
  ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(B.x(0), B.y(0), B.x(0.5) - B.x(0), 0, 7); ctx.stroke(); ctx.setLineDash([]);
  s2.trail.forEach(d => { if (d === phDeg) return; const r = d * Math.PI / 180; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(B.x(0.5 * Math.cos(r)), B.y(0.5 * Math.sin(r)), 3, 0, 7); ctx.fill(); });
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0)); ctx.lineTo(B.x(p.s), B.y(p.c)); ctx.stroke();
  ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(B.x(p.s), B.y(p.c)); ctx.lineTo(B.x(p.s), B.y(0)); ctx.moveTo(B.x(p.s), B.y(p.c)); ctx.lineTo(B.x(0), B.y(p.c)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(B.x(p.s), B.y(p.c), 6, 0, 7); ctx.fill();
  ctx.restore();
  const warn = Math.abs(p.s) < 0.1 ? t('s2warn') : '';
  $('r2').textContent = t('s2readout', { ph: phDeg, s: fmt(p.s, 3), c: fmt(p.c, 3), m: fmt(p.mag, 3), ang: fmt(deg(p.ang), 0), warn });
}

/* ---------- step 3: window length and resolution ---------- */
const s3 = { map: new Map(), curve: null };
function thresholdCurve() {
  if (!s3.curve) { s3.curve = []; for (let T = 0.5; T <= 4.0001; T += 0.125) s3.curve.push([T, M.threshold(T)]); }
  return s3.curve;
}
function draw3() {
  const T = num('T3'), d = num('d3'), comps = [{ f: M.F1, a: 1 }, { f: M.F1 + d, a: 1 }];
  const ratio = M.valleyRatio(d, T), ok3 = ratio < M.DIP;
  s3.map.set(T + ',' + d, { T, d, ok: ok3 });
  $('T3v').textContent = fmt(T, 2) + ' s'; $('d3v').textContent = fmt(d, 2) + ' Hz';
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 2, xMax: 9, yMin: 0, yMax: 2.15, yTicks: [0, 1, 2], xTicks: ticks(2, 9, W - 58, 30, [1, 2]), xLabel: v => String(v), title: t('c3a') });
  [M.F1, M.F1 + d].forEach(f => vline(ctx, A.x(f), A.P.t, A.P.b, C.orange, 1.6, [4, 3], 0.85));
  curve(ctx, A, f => M.windowSpectrum(comps, f, T), 2, 9, 700, C.cyan, 2.2);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0.4, xMax: 4.1, yMin: 0, yMax: 2.1, yTicks: [0, 0.5, 1, 1.5, 2], xTicks: [1, 2, 3, 4], xLabel: v => String(v), title: t('c3b') });
  ctx.save(); clipTo(ctx, B); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath();
  thresholdCurve().forEach(([TT, dd], i) => { if (i) ctx.lineTo(B.x(TT), B.y(dd)); else ctx.moveTo(B.x(TT), B.y(dd)); }); ctx.stroke(); ctx.setLineDash([]);
  s3.map.forEach(q => { const cur = q.T === T && q.d === d; ctx.fillStyle = q.ok ? C.green : C.red; ctx.beginPath(); ctx.arc(B.x(q.T), B.y(q.d), cur ? 6 : 3.5, 0, 7); ctx.fill(); if (cur) { ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.stroke(); } });
  ctx.restore();
  $('r3').textContent = t('s3readout', { T: fmt(T, 2), d: fmt(d, 2), dT: fmt(d * T, 3), w: fmt(M.lobeWidth(T), 2), ratio: fmt(ratio * 100, 0) + '%', res: t(ok3 ? 's3yes' : 's3no') });
}

/* ---------- step 4: partial sums of a square wave ---------- */
const s4 = { tried: new Set([3]), cache: new Map() };
const stats = n => { if (!s4.cache.has(n)) s4.cache.set(n, M.squareStats(n)); return s4.cache.get(n); };
function draw4() {
  const n = num('n4'), st = stats(n);
  s4.tried.add(n);
  $('n4v').textContent = t('nOut', { n, k: st.kMax });
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 190, xMin: 0, xMax: 1, yMin: -1.45, yMax: 1.45, yTicks: [-1, 0, 1], xTicks: ticks(0, 1, W - 58, 34, [0.1, 0.25, 0.5]), xLabel: v => fmt(v, 2), title: t('c4a') });
  curve(ctx, A, M.square, 0, 1, 2000, C.ghost, 1.5, [5, 4]);
  curve(ctx, A, tt => M.partialSquare(n, tt), 0, 1, 2400, C.cyan, 2);
  ctx.save(); clipTo(ctx, A); ctx.strokeStyle = C.orange; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(A.P.l, A.y(st.peak)); ctx.lineTo(A.P.r, A.y(st.peak)); ctx.stroke(); ctx.restore();
  const B = panel(ctx, W, { top: 236, bottom: H - 26, xMin: 0, xMax: 41, yMin: 0, yMax: 0.5, yTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], xTicks: ticks(0, 40, W - 58, 30, [5, 10, 20]), xLabel: v => String(v), title: t('c4b') });
  ctx.save(); clipTo(ctx, B);
  s4.tried.forEach(q => { const s = stats(q), cur = q === n; ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(B.x(q), B.y(s.overshoot), cur ? 6 : 3.5, 0, 7); ctx.fill(); ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(B.x(q), B.y(s.rms), cur ? 6 : 3.5, 0, 7); ctx.fill(); });
  ctx.restore();
  vline(ctx, B.x(n), B.P.t, B.P.b, C.text, 1, [3, 4], 0.4);
  $('r4').textContent = t('s4readout', { n, k: st.kMax, peak: fmt(st.peak, 3), os: fmt(st.overshoot, 3), pct: fmt(st.overshoot / 2 * 100, 1), rms: fmt(st.rms, 3) });
}

/* ---------- step 5: the DFT of N samples ---------- */
const s5 = { N: 16 };
function draw5() {
  const N = s5.N, f = num('f5'), xs = M.cosSamples(f, N), X = M.dft(xs), pk = M.dftPeaks(f, N);
  $('f5v').textContent = f + ' Hz';
  $('n16').setAttribute('aria-pressed', N === 16 ? 'true' : 'false'); $('n32').setAttribute('aria-pressed', N === 32 ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 168, xMin: 0, xMax: 1, yMin: -1.3, yMax: 1.3, yTicks: [-1, 0, 1], xTicks: ticks(0, 1, W - 58, 34, [0.125, 0.25, 0.5]), xLabel: v => fmt(v, 3), title: t('c5a') });
  curve(ctx, A, tt => Math.cos(M.TWO_PI * f * tt), 0, 1, 1600, C.orange, 1.8);
  if ((N - f) !== f) curve(ctx, A, tt => Math.cos(M.TWO_PI * (N - f) * tt), 0, 1, 1600, C.cyan, 1.6, [5, 4]);
  xs.forEach((v, i) => { ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(i / N), A.y(v), 4, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2; ctx.stroke(); });
  const B = panel(ctx, W, { top: 214, bottom: H - 26, xMin: -0.8, xMax: N - 0.2, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: range(0, N - 1, N === 16 ? (W < 420 ? 4 : 2) : (W < 420 ? 8 : 4)), xLabel: v => String(v), title: t('c5b') });
  const bw = Math.max(2, Math.min(18, (B.x(1) - B.x(0)) * 0.6));
  X.forEach((q, k) => { const v = q.mag / N; ctx.fillStyle = v > 1e-9 ? C.green : 'rgba(126,226,168,0.25)'; ctx.fillRect(B.x(k) - bw / 2, B.y(v), bw, Math.max(1.5, B.y(0) - B.y(v))); });
  vline(ctx, B.x(N / 2), B.P.t, B.P.b, C.ghost, 1.2, [4, 4], 0.7);
  const half = N / 2, al = f === 0 || f === half || f === N ? t('s5edge') : f > half ? t('s5alias', { half, a: M.alias(f, N) }) : '';
  $('r5').textContent = t('s5readout', { N, f, peaks: pk.join(', '), h: fmt(X[pk[0]].mag / N, 2), al });
}
function setN(N) { s5.N = N; const s = $('f5'); s.max = String(N); if (num('f5') > N) s.value = String(N); draw5(); }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildGuess();
  $('reveal0').addEventListener('click', () => { s0.shown = !s0.shown; draw0(); });
  $('k1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('sweep1').addEventListener('click', () => { s1.asked.clear(); animate('s1', 12 * 450, p => { const k = 1 + Math.min(11, Math.floor(p * 12)); for (let q = 1; q < k; q++) if (!s1.asked.has(q)) s1.asked.set(q, M.sinProbe(signalX, q)); $('k1').value = k; draw1(); }); });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.asked.clear(); draw1(); });
  $('ph2').addEventListener('input', draw2);
  $('clear2').addEventListener('click', () => { s2.trail.clear(); draw2(); });
  ['T3', 'd3'].forEach(id => $(id).addEventListener('input', draw3));
  $('clear3').addEventListener('click', () => { s3.map.clear(); draw3(); });
  $('n4').addEventListener('input', draw4);
  $('clear4').addEventListener('click', () => { s4.tried.clear(); draw4(); });
  $('f5').addEventListener('input', draw5);
  $('n16').addEventListener('click', () => setN(16));
  $('n32').addEventListener('click', () => setN(32));

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
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
