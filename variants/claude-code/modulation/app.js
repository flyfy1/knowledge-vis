'use strict';
// Modulation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every waveform, spectral line and readout comes from window.MOD_MODEL (model.js): real samples and FFTs.
// Canvas text is limited to panel titles and axis ticks laid out in fixed rows.
(function () {

const $ = id => document.getElementById(id);
const M = window.MOD_MODEL;
const t = (...a) => window.MOD_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#6b7c92', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0; Unicode minus.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s).replace(/^-/, '−'); };
const fmtk = f => fmt(f / 1000, 2) + ' kHz';
const tickHz = f => (f >= 1000 ? fmt(f / 1000, 0) + 'k' : fmt(f, 0));
const tms = n => n / M.FS * 1000;

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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel. With o.log the x axis is log10(f) between o.xMin and o.xMax (given in log10 units)
// and ticks sit on decades labelled 100, 1k, 10k.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const xr = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const x = o.log ? f => xr(Math.log10(f)) : xr;
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, o.yDigits || 2), P.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  if (o.log) {
    for (let d = Math.ceil(o.xMin - 1e-9); d <= o.xMax + 1e-9; d++) {
      const X = xr(d); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b + 4); ctx.stroke();
      ctx.fillText(tickHz(Math.pow(10, d)), X, P.b + 15);
    }
  } else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.25, 0.5, 1, 2, 5, 10]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(xr(v), P.b); ctx.lineTo(xr(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2), xr(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P, o };
}
function clipTo(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
function curve(ctx, m, xs, ys, color, lw = 2, dash = null) {
  clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  xs.forEach((v, i) => { const X = m.x(v), Y = m.y(ys[i]); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, m, X, Y, color, r = 4.5) {
  const lo = m.o.yMin, hi = m.o.yMax, v = Math.max(lo, Math.min(hi, Y)), px = m.x(X), py = m.y(v);
  ctx.save(); ctx.fillStyle = color;
  if (v !== Y) { const s = Y > hi ? 1 : -1; ctx.beginPath(); ctx.moveTo(px - 5, py + s * 7); ctx.lineTo(px + 5, py + s * 7); ctx.lineTo(px, py); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
function vline(ctx, X, y0, y1, color = C.orange, alpha = 0.7) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
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


function stemAt(ctx, m, X, v, color, lw = 2.2) {
  const hi = m.o.yMax, vc = Math.min(hi, v), px = m.x(X);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(px, m.y(0)); ctx.lineTo(px, m.y(vc)); ctx.stroke();
  ctx.beginPath(); ctx.arc(px, m.y(vc), 3, 0, 7); ctx.fill(); ctx.restore();
}
const range = (n0, n1, step = 1) => { const o = []; for (let n = n0; n <= n1; n += step) o.push(n); return o; };

/* ---------- step 0: multiply by a carrier ---------- */
const cache = new Map();
const memo = (key, fn) => { if (!cache.has(key)) { if (cache.size > 200) cache.clear(); cache.set(key, fn()); } return cache.get(key); };
/* fine-grid analytic curves for drawing fast carriers (the 102.4 kHz samples are too coarse to look smooth) */
const mAt = (tm, which = 'A') => M.MSG[which].reduce((q, [f, a]) => q + a * Math.cos(2 * Math.PI * f * tm / 1000), 0);
const fine = (t0, t1, n = 1600) => Array.from({ length: n + 1 }, (_, i) => t0 + (t1 - t0) * i / n);

function draw0() {
  const fc = num('fc0'), r = memo('mul' + fc, () => M.multiply(fc, 'A'));
  $('fc0v').textContent = fmtk(fc);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 26, bottom: 170, xMin: 0, xMax: 2, yMin: -1.2, yMax: 1.2, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.5, 1], title: t('c0a') });
  const ns = range(0, 205), ts = ns.map(tms);
  curve(ctx, A, ts, ns.map(n => r.m[n]), C.ghost, 1.2, [4, 4]); curve(ctx, A, ts, ns.map(n => -r.m[n]), C.ghost, 1.2, [4, 4]);
  { const tf = fine(0, 2); curve(ctx, A, tf, tf.map(q => mAt(q) * Math.cos(2 * Math.PI * fc * q / 1000)), C.cyan, 1.4); } curve(ctx, A, ts, ns.map(n => r.m[n]), C.orange, 2.2);
  const B = panel(ctx, W, { top: 212, bottom: H - 26, xMin: 0, xMax: 45, yMin: 0, yMax: 0.7, yTicks: [0, 0.3, 0.6], xTicks: true, xSteps: [5, 10, 20], title: t('c0b') });
  r.mLines.forEach(([f, a]) => stemAt(ctx, B, f / 1000, a, C.orange)); r.sLines.forEach(([f, a]) => stemAt(ctx, B, f / 1000, a, C.cyan));
  vline(ctx, B.x(fc / 1000), B.P.t, B.P.b, C.ghost, 0.6);
  const lines = r.sLines.map(([f, a]) => `${fmtk(f)} (${fmt(a, 2)})`).join(t('sep'));
  $('r0').textContent = t('s0readout', { fc: fmtk(fc), lines, lo: fmtk(fc - M.BAND), hi: fmtk(fc + M.BAND), w: fmtk(2 * M.BAND) });
}

/* ---------- step 1: two voices on one wire ---------- */
const FA = 20000;
function draw1() {
  const fB = num('fB1'), r = memo('share' + fB, () => M.share(FA, fB));
  const la = memo('mul' + FA, () => M.multiply(FA, 'A')).sLines, lb = memo('mulB' + fB, () => M.multiply(fB, 'B')).sLines;
  $('fB1v').textContent = fmtk(fB);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: 170, xMin: 15, xMax: 35, yMin: 0, yMax: 0.45, yTicks: [0, 0.2, 0.4], xTicks: true, xSteps: [2, 5, 10], title: t('c1a') });
  ctx.fillStyle = 'rgba(103,215,249,0.16)'; ctx.fillRect(A.x((FA - M.BAND) / 1000), A.P.t, A.x((FA + M.BAND) / 1000) - A.x((FA - M.BAND) / 1000), A.P.b - A.P.t);
  la.forEach(([f, a]) => stemAt(ctx, A, f / 1000, a, C.orange)); lb.forEach(([f, a]) => stemAt(ctx, A, f / 1000, a, C.pink));
  const B = panel(ctx, W, { top: 212, bottom: H - 26, xMin: 0, xMax: 4, yMin: -2.1, yMax: 2.1, yTicks: [-2, -1, 0, 1, 2], xTicks: true, xSteps: [1, 2], title: t('c1b') });
  const ns = range(0, 410), ts = ns.map(tms);
  curve(ctx, B, ts, ns.map(n => r.mA[n]), C.text, 1.4, [5, 4]); curve(ctx, B, ts, ns.map(n => r.out[n]), C.cyan, 2.2);
  const x = Number.isFinite(r.xtalkDb) ? t('s1some', { db: fmt(r.xtalkDb, 1), pct: fmt(r.err * 100, 1) }) : t('s1none');
  $('r1').textContent = t('s1readout', { d: fmtk(fB - FA), x });
}

/* ---------- step 2: coherent demodulation ---------- */
function draw2() {
  const df = num('df2'), ph = num('ph2'), r = memo(`coh${df}|${ph}`, () => M.coherent(FA, df, ph));
  $('df2v').textContent = fmt(df, 1) + ' Hz'; $('ph2v').textContent = fmt(ph, 0) + '°';
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 80, yMin: -1.2, yMax: 1.2, yTicks: [-1, 0, 1], xTicks: true, xSteps: [10, 20, 40], title: t('c2a') });
  const ns = range(0, M.N - 1, 4), ts = ns.map(tms);
  curve(ctx, A, ts, ns.map(n => r.m[n]), C.raw, 1); curve(ctx, A, ts, ns.map(n => r.out[n]), C.cyan, 1.4);
  curve(ctx, A, ts, ts.map(q => Math.cos(2 * Math.PI * df * q / 1000 + ph * Math.PI / 180)), C.text, 1.6, [6, 4]);
  const beat = df > 0 ? t('s2beat', { T: fmt(1000 / df, 0) }) : t('s2nobeat');
  $('r2').textContent = t('s2readout', { df: fmt(df, 1), ph: fmt(ph, 0), sc: fmt(r.scale, 3), cos: fmt(Math.cos(ph * Math.PI / 180), 3), err: r.err < 1e-9 ? '< 10⁻⁹' : fmt(r.err, 3), beat }).trim();
}

/* ---------- step 3: AM and the envelope ---------- */
function draw3() {
  const mu = Math.round(num('mu3') * 10) / 10, r = memo('am' + mu, () => M.am(FA, mu));
  $('mu3v').textContent = fmt(mu, 1);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: 210, xMin: 0, xMax: 2, yMin: -2.6, yMax: 2.6, yTicks: [-2, -1, 0, 1, 2], xTicks: true, xSteps: [0.5, 1], title: t('c3a') });
  const ns = range(0, 205), ts = ns.map(tms);
  { const tf = fine(0, 2); curve(ctx, A, tf, tf.map(q => (1 + mu * mAt(q)) * Math.cos(2 * Math.PI * FA * q / 1000)), C.raw, 1.1); }
  curve(ctx, A, ts, ns.map(n => 1 + mu * r.m[n]), C.text, 1.6, [6, 4]);
  curve(ctx, A, ts, ns.map(n => r.env[n]), C.cyan, 2.4);
  const B = panel(ctx, W, { top: 252, bottom: H - 26, xMin: 18, xMax: 22, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.5, 1], title: t('c3b') });
  r.sLines.forEach(([f, a]) => stemAt(ctx, B, f / 1000, a, Math.abs(f - FA) < 1 ? C.orange : C.green));
  $('r3').textContent = t('s3readout', { mu: fmt(mu, 1), min: fmt(r.minEnv, 2), dist: fmt(r.dist * 100, 1), eff: fmt(r.eff * 100, 1), rest: fmt(100 - r.eff * 100, 1) });
}

/* ---------- step 4: FM ---------- */
const FC4 = 25000;
function draw4() {
  const fm = num('fm4'), dev = num('dev4'), r = memo(`fm${fm}|${dev}`, () => M.fm(FC4, fm, dev));
  $('fm4v').textContent = fmtk(fm); $('dev4v').textContent = fmtk(dev);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 150, xMin: 0, xMax: 4, yMin: 13, yMax: 37, yTicks: [15, 25, 35], xTicks: true, xSteps: [1, 2], title: t('c4a') });
  const ts = range(0, 400).map(i => i / 100);
  curve(ctx, A, ts, ts.map(q => (FC4 + dev * Math.cos(2 * Math.PI * fm * q / 1000)) / 1000), C.cyan, 2.2);
  const B = panel(ctx, W, { top: 192, bottom: H - 26, xMin: 5, xMax: 45, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [5, 10, 20], title: t('c4b') });
  const cl = (FC4 - r.carson / 2) / 1000, ch = (FC4 + r.carson / 2) / 1000;
  ctx.fillStyle = 'rgba(103,215,249,0.14)'; ctx.fillRect(B.x(cl), B.P.t, B.x(ch) - B.x(cl), B.P.b - B.P.t);
  if (r.bw98 > 0) { const bl = (FC4 - r.bw98 / 2) / 1000, bh = (FC4 + r.bw98 / 2) / 1000; ctx.save(); ctx.strokeStyle = 'rgba(255,122,147,0.85)'; ctx.lineWidth = 1.5; ctx.strokeRect(B.x(bl), B.P.t + 2, B.x(bh) - B.x(bl), B.P.b - B.P.t - 2); ctx.restore(); }
  r.lines.forEach(([f, a]) => stemAt(ctx, B, f / 1000, a, C.orange, 1.8));
  $('r4').textContent = t('s4readout', { beta: fmt(r.beta, 2), c: fmt(r.carrierLine, 4), n: r.lines.length, bw: fmtk(r.bw98), carson: fmtk(r.carson), p: fmt(r.power, 3) });
}

/* ---------- step 5: AM vs FM in noise ---------- */
const s5 = { set: 0, hist: new Set() };
const CNR = { min: -6, max: 20, step: 2 };
const noisy = (c, set) => memo(`nz${c}|${set}`, () => M.noisy(c, set + 1));
function draw5() {
  const c = num('cnr5'), r = noisy(c, s5.set);
  s5.hist.add(c);
  $('cnr5v').textContent = fmt(c, 0) + ' dB';
  const { ctx, W, H } = fitCanvas($('c5'));
  const ns = range(0, 410), ts = ns.map(tms);
  const A = panel(ctx, W, { top: 26, bottom: 136, xMin: 0, xMax: 4, yMin: -1.6, yMax: 1.6, yTicks: [-1, 0, 1], xTicks: true, xSteps: [1, 2], title: t('c5a') });
  curve(ctx, A, ts, ns.map(n => r.m[n]), C.text, 1.3, [5, 4]); curve(ctx, A, ts, ns.map(n => r.outAM[n]), C.orange, 1.8);
  const B = panel(ctx, W, { top: 178, bottom: 288, xMin: 0, xMax: 4, yMin: -1.6, yMax: 1.6, yTicks: [-1, 0, 1], xTicks: true, xSteps: [1, 2], title: t('c5b') });
  curve(ctx, B, ts, ns.map(n => r.m[n]), C.text, 1.3, [5, 4]); curve(ctx, B, ts, ns.map(n => r.outFM[n]), C.cyan, 1.8);
  const D = panel(ctx, W, { top: 330, bottom: H - 26, xMin: CNR.min - 1, xMax: CNR.max + 1, yMin: -5, yMax: 55, yTicks: [0, 20, 40], xTicks: true, xSteps: [2, 4, 10], title: t('c5c') });
  const xs = [...s5.hist].sort((a, b) => a - b);
  for (const [key, col] of [['snrAM', C.orange], ['snrFM', C.cyan]]) {
    curve(ctx, D, xs, xs.map(q => noisy(q, s5.set)[key]), col, 1.6);
    xs.forEach(q => dot(ctx, D, q, noisy(q, s5.set)[key], col, q === c ? 5.5 : 3.5));
  }
  vline(ctx, D.x(c), D.P.t, D.P.b, C.ghost, 0.5);
  const d = r.snrFM - r.snrAM;
  $('r5').textContent = t('s5readout', { set: s5.set + 1, cnr: fmt(c, 0), am: fmt(r.snrAM, 1), fm: fmt(r.snrFM, 1), cmp: t(d >= 0 ? 's5ahead' : 's5behind', { d: fmt(Math.abs(d), 1) }) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('fc0').addEventListener('input', draw0);
  $('fB1').addEventListener('input', draw1);
  ['df2', 'ph2'].forEach(id => $(id).addEventListener('input', draw2));
  $('mu3').addEventListener('input', draw3);
  ['fm4', 'dev4'].forEach(id => $(id).addEventListener('input', draw4));
  $('cnr5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('sweep5').addEventListener('click', () => {
    s5.hist.clear();
    const count = (CNR.max - CNR.min) / CNR.step + 1;
    animate('s5', count * 220, p => {
      const idx = Math.min(count - 1, Math.floor(p * count));
      for (let i = 0; i <= idx; i++) s5.hist.add(CNR.min + i * CNR.step);
      $('cnr5').value = CNR.min + idx * CNR.step; draw5();
    });
  });
  $('seed5').addEventListener('click', () => { stopAnim('s5'); s5.set = (s5.set + 1) % 3; s5.hist.clear(); draw5(); });

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
  window.refreshMOD = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
