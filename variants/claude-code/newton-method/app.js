'use strict';
// Newton's method lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, tangent, bar and readout comes from window.NEWTON_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrunk to fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.NEWTON_MODEL;
const t = (...a) => window.NEWTON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/\.?0+$/, '') : s; };
const sci = v => { if (v === 0) return '0'; const a = Math.abs(v); if (a >= 1e-3 && a < 1e5) return fmt(v, 4); const e = Math.floor(Math.log10(a)); return (v / Math.pow(10, e)).toFixed(2) + 'e' + e; };
const full = v => v.toPrecision(16).replace(/0+$/, '').replace(/\.$/, '');
const subs = n => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
const logTick = v => (v === 0 ? '1' : '1e' + v);

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
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const yf = o.yFmt || (v => fmt(v, 2));
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 && !o.yFmt ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yf(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks !== false) {
    const step = o.xStep || niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step, dg = step < 0.01 ? 3 : step < 0.1 ? 2 : 1;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      const lab = fmt(v, dg), hw = ctx.measureText(lab).width / 2; // keep edge labels inside the canvas
      ctx.fillText(lab, Math.max(hw + 2, Math.min(W - hw - 2, x(v))), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P, o };
}
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
const inX = (m, v) => v >= m.o.xMin && v <= m.o.xMax;
function plot(ctx, m, f, color, lw = 2.2, dash = null) {
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  const n = 400; let pen = false;
  for (let i = 0; i <= n; i++) {
    const v = m.o.xMin + (m.o.xMax - m.o.xMin) * i / n, fv = f(v);
    if (!isFinite(fv)) { pen = false; continue; }
    const Y = m.y(Math.max(m.o.yMin - 50, Math.min(m.o.yMax + 50, fv)));
    if (!pen) { ctx.moveTo(m.x(v), Y); pen = true; } else ctx.lineTo(m.x(v), Y);
  }
  ctx.stroke(); ctx.restore();
}
function seg(ctx, m, x0, y0, x1, y1, color, lw = 1.8, dash = null) {
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(m.x(x0), m.y(y0)); ctx.lineTo(m.x(x1), m.y(y1)); ctx.stroke(); ctx.restore();
}
function vline(ctx, m, X, color, dash = [5, 4], lw = 1.5) { if (!inX(m, X)) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.x(X), m.P.t); ctx.lineTo(m.x(X), m.P.b); ctx.stroke(); ctx.restore(); }
function hline(ctx, m, Y, color, dash = [5, 4], lw = 1.5) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, m.y(Y)); ctx.lineTo(m.P.r, m.y(Y)); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, fill, stroke = C.bg) { ctx.save(); ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function ring(ctx, X, Y, r, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke(); ctx.restore(); }
// Newton path: vertical drop to the curve, then along the tangent to the axis.
function cobweb(ctx, m, fn, xs, upto, alphaFade = true) {
  for (let i = 0; i < Math.min(upto, xs.length - 1); i++) {
    const a = xs[i], b = xs[i + 1], fa = fn.f(a), al = alphaFade ? 0.35 + 0.65 * (i + 1) / upto : 1;
    ctx.save(); ctx.globalAlpha = al;
    seg(ctx, m, a, 0, a, fa, C.muted, 1.2, [3, 3]);
    seg(ctx, m, a, fa, b, 0, C.orange, 2);
    ctx.restore();
  }
}
function axisDots(ctx, m, xs, upto, last = C.green) {
  for (let i = 0; i <= Math.min(upto, xs.length - 1); i++) if (inX(m, xs[i])) dot(ctx, m.x(xs[i]), m.y(0), i === upto ? 5.5 : 4, i === upto ? last : C.text);
}

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

/* ---------- step 0: one tangent ---------- */
const s0 = { trail: new Set() };
function draw0() {
  const F = M.FUNCS.sq2, x0 = num('x00'), x1 = M.step(F, x0), r = F.root;
  s0.trail.add(x0); $('x00v').textContent = fmt(x0, 2);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 26, bottom: 236, xMin: F.xMin, xMax: F.xMax, yMin: F.yMin, yMax: F.yMax, yTicks: [0, 5, 10], title: t('c0a') });
  vline(ctx, A, r, C.green, [4, 4], 1.2);
  plot(ctx, A, F.f, C.cyan);
  plot(ctx, A, x => F.f(x0) + F.df(x0) * (x - x0), C.orange, 1.8);
  seg(ctx, A, x0, 0, x0, F.f(x0), C.muted, 1.2, [3, 3]);
  dot(ctx, A.x(x0), A.y(F.f(x0)), 4, C.text);
  dot(ctx, A.x(x0), A.y(0), 5, C.text); dot(ctx, A.x(x1), A.y(0), 5.5, C.green);
  const B = panel(ctx, W, { top: 280, bottom: H - 26, xMin: 0.3, xMax: 3.5, yMin: -6, yMax: 1, yTicks: [-6, -4, -2, 0], yFmt: logTick, left: 46, title: t('c0b') });
  const le = x => Math.log10(Math.max(1e-12, Math.abs(x - r)));
  plot(ctx, B, x => le(x), C.raw, 1.8);
  plot(ctx, B, x => le(M.step(F, x)), C.cyan, 2.2);
  for (const x of s0.trail) dot(ctx, B.x(x), B.y(Math.max(-6, le(M.step(F, x)))), 3.4, C.text);
  ring(ctx, B.x(x0), B.y(Math.max(-6, le(x1))), 7, C.cyan);
  const e0 = Math.abs(x0 - r), e1 = Math.abs(x1 - r);
  $('out0').textContent = t('s0readout', { x0: fmt(x0, 2), f: fmt(F.f(x0), 4), d: fmt(F.df(x0), 4), x1: fmt(x1, 6), e0: sci(e0), e1: sci(e1), q: e0 > 1e-9 ? fmt(e1 / (e0 * e0), 4) : '—', c: fmt(1 / (2 * x0), 4) });
}

/* ---------- step 1: repeat ---------- */
const MAX1 = 8;
const s1 = { key: 'sq2', n: 2 }; // open with two steps drawn so the path is visible on first view
const TICKS1 = { sq2: [0, 5, 10], cosx: [-4, -2, 0, 2], exp3: [0, 10, 20] };
const FN_NAME = { sq2: 'fnNameSq2', cosx: 'fnNameCos', exp3: 'fnNameExp' };
const FN_IDS = { sq2: 'fnSq2', cosx: 'fnCos', exp3: 'fnExp' };
function setFn(key) {
  stopAnim('s1'); s1.key = key; s1.n = 0;
  const F = M.FUNCS[key], el = $('x10'); el.min = F.x0.min; el.max = F.x0.max; el.value = F.x0.def;
  draw1();
}
function draw1() {
  const F = M.FUNCS[s1.key], x0 = num('x10'), xs = M.iterate(F, x0, MAX1), n = Math.min(s1.n, xs.length - 1);
  Object.entries(FN_IDS).forEach(([k, id]) => $(id).setAttribute('aria-pressed', k === s1.key));
  $('x10v').textContent = fmt(x0, 2);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: 246, xMin: F.xMin, xMax: F.xMax, yMin: F.yMin, yMax: F.yMax, yTicks: TICKS1[s1.key], title: t('c1a', { fn: t(FN_NAME[s1.key]) }) });
  vline(ctx, A, F.root, C.green, [4, 4], 1.2);
  plot(ctx, A, F.f, C.cyan);
  cobweb(ctx, A, F, xs, n);
  axisDots(ctx, A, xs, n, n ? C.green : C.text);
  const B = panel(ctx, W, { top: 290, bottom: H - 26, xMin: -0.6, xMax: MAX1 + 0.6, yMin: 0, yMax: 16, yTicks: [0, 4, 8, 12, 16], xStep: 1, title: t('c1b') });
  const bw = Math.min(40, (B.x(1) - B.x(0)) * 0.6);
  for (let i = 0; i <= n; i++) { const d = M.digits(xs[i], F.root); ctx.fillStyle = C.orange; ctx.globalAlpha = i === n ? 1 : 0.7; ctx.fillRect(B.x(i) - bw / 2, B.y(d), bw, B.y(0) - B.y(Math.max(0.15, d))); ctx.globalAlpha = 1; }
  $('step1b').disabled = $('play1').disabled = n >= Math.min(MAX1, xs.length - 1);
  const rows = xs.slice(0, n + 1).map((x, i) => t('s1row', { i: subs(i), x: full(x), d: M.digits(x, F.root).toFixed(1) })).join(t('sep'));
  $('out1').textContent = t('s1readout', { n, N: MAX1, root: full(F.root) }) + ' ' + rows;
}

/* ---------- step 2: digits double — Newton vs bisection for √a ---------- */
function draw2() {
  const a = num('a2'), r = Math.sqrt(a), N = M.newtonSqrt(a, 12), B = M.bisectSqrt(a, 61);
  $('a2v').textContent = a;
  const { ctx, W, H } = fitCanvas($('c2'));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 60, yMin: 0, yMax: 16.5, yTicks: [0, 4, 8, 12, 16], title: t('c2', { a }) });
  hline(ctx, P, 10, C.text, [6, 5], 1.2);
  const line = (xs, color) => {
    ctx.save(); clipTo(ctx, P); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath();
    xs.forEach((x, i) => { const X = P.x(i), Y = P.y(M.digits(x, r)); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
    xs.forEach((x, i) => dot(ctx, P.x(i), P.y(M.digits(x, r)), 2.8, color));
  };
  line(B, C.violet); line(N, C.orange);
  const n10 = M.stepsTo(N, r, 10), b10 = M.stepsTo(B, r, 10), n15 = M.stepsTo(N, r, 15), b15 = M.stepsTo(B, r, 15);
  const ratios = []; for (let i = 0; i < N.length - 1; i++) { const e0 = Math.abs(N[i] - r), e1 = Math.abs(N[i + 1] - r); if (e0 < 1 && e1 > 1e-13) ratios.push(fmt(e1 / (e0 * e0), 4)); }
  const digs = N.slice(0, Math.max(1, n15) + 1).map(x => M.digits(x, r).toFixed(1)).join(' → ');
  $('out2').textContent = t('s2readout', { a, r: full(r), n10, b10, n15, b15, digs, ratios: ratios.join(', ') || '—', c: fmt(M.quadConst(a), 4) });
}

/* ---------- step 3: repeated roots ---------- */
const KCOL = { 1: C.cyan, 2: C.orange, 3: C.pink };
const s3 = { k: 2, tried: new Set([1, 2]) };
function measured(k, x0) {
  const e = M.errors(M.multi(k), x0, 60);
  let i = -1; for (let j = 0; j < e.length - 1; j++) if (e[j] > 1e-7 && e[j + 1] > 0) i = j;
  return { e, i, ratio: i >= 0 ? e[i + 1] / e[i] : NaN, quad: i >= 0 ? e[i + 1] / (e[i] * e[i]) : NaN, n6: e.findIndex(v => v < 1e-6), floor: Math.min(...e.filter(v => v > 0)) };
}
function draw3() {
  const x0 = num('x30'), k = s3.k; s3.tried.add(k);
  $('x30v').textContent = fmt(x0, 2);
  [1, 2, 3].forEach(j => $('k' + j).setAttribute('aria-pressed', j === k));
  const { ctx, W, H } = fitCanvas($('c3'));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 40, yMin: -16, yMax: 1, yTicks: [-16, -12, -8, -4, 0], yFmt: logTick, left: 46, title: t('c3') });
  for (const j of [...s3.tried].sort((a, b) => (a === k) - (b === k))) {
    const { e } = measured(j, x0);
    ctx.save(); clipTo(ctx, P); ctx.strokeStyle = KCOL[j]; ctx.lineWidth = j === k ? 2.6 : 1.4; ctx.globalAlpha = j === k ? 1 : 0.55; ctx.beginPath();
    let pen = false; e.forEach((v, i) => { if (v <= 0) { pen = false; return; } const X = P.x(i), Y = P.y(Math.max(-16, Math.log10(v))); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); });
    ctx.stroke(); ctx.restore();
    if (j === k) e.forEach((v, i) => { if (v > 0 && i <= 40) dot(ctx, P.x(i), P.y(Math.max(-16, Math.log10(v))), 2.6, KCOL[j]); });
  }
  $('lg3').innerHTML = [...s3.tried].sort().map(j => `<span class="lg"><span class="sw" style="background:${KCOL[j]}"></span><span>${t('s3lgK', { k: j })}</span></span>`).join('');
  const m = measured(k, x0);
  $('out3').textContent = k === 1
    ? t('s3readout1', { x0: fmt(x0, 2), q: fmt(m.quad, 3), n6: m.n6, fl: sci(m.floor) })
    : t('s3readoutK', { k, x0: fmt(x0, 2), r: fmt(m.ratio, 3), th: fmt(M.multiRatio(k), 3), n6: m.n6, fl: sci(m.floor) });
}

/* ---------- step 4: failure modes ---------- */
function draw4() {
  const x0 = num('x40'), c = M.classify(x0, 60), F = M.FAIL, xs = c.xs;
  $('x40v').textContent = fmt(x0, 4);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 236, xMin: -2.6, xMax: 2.6, yMin: -6, yMax: 10, yTicks: [-5, 0, 5, 10], title: t('c4a') });
  vline(ctx, A, M.FAIL_ROOT, C.green, [4, 4], 1.2); vline(ctx, A, M.FLAT, C.pink, [3, 4], 1.2); vline(ctx, A, -M.FLAT, C.pink, [3, 4], 1.2);
  plot(ctx, A, F.f, C.cyan);
  cobweb(ctx, A, F, xs, 12);
  axisDots(ctx, A, xs, Math.min(12, xs.length - 1), C.text);
  const B = panel(ctx, W, { top: 280, bottom: H - 26, xMin: 0, xMax: 40, yMin: -3, yMax: 3, yTicks: [-2, 0, 2], title: t('c4b') });
  hline(ctx, B, M.FAIL_ROOT, C.green, [4, 4], 1.2);
  ctx.save(); clipTo(ctx, B); ctx.strokeStyle = 'rgba(232,237,244,0.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
  xs.slice(0, 41).forEach((x, i) => { const Y = B.y(Math.max(-3.2, Math.min(3.2, x))); if (i === 0) ctx.moveTo(B.x(i), Y); else ctx.lineTo(B.x(i), Y); }); ctx.stroke(); ctx.restore();
  xs.slice(0, 41).forEach((x, i) => { const off = x > 3 || x < -3, Y = B.y(Math.max(-3, Math.min(3, x))); if (off) ring(ctx, B.x(i), Y, 3.5, C.pink); else dot(ctx, B.x(i), Y, 3, C.text); });
  const far = xs.reduce((m, x) => (Math.abs(x) > Math.abs(m) ? x : m), 0);
  let msg;
  if (c.kind === 'root') msg = t('s4root', { at: c.at, r: fmt(M.FAIL_ROOT, 4), far: sci(far) });
  else if (c.kind === 'cycle') msg = t('s4cycle', { a: fmt(c.pair[0], 4), b: fmt(c.pair[1], 4) });
  else if (c.kind === 'flat') msg = t('s4flat', { n: xs.length - 1, x: fmt(xs[xs.length - 1], 4) });
  else msg = t('s4wander');
  $('out4').textContent = t('s4head', { x0: fmt(x0, 4), d: sci(F.df(x0)) }) + ' ' + msg;
}

/* ---------- step 5: basins of attraction ---------- */
const BCOL = ['#ff7a93', '#ffb454', '#67d7f9'];
function strip(ctx, m, lo, hi) {
  const px = Math.max(1, Math.round(m.P.r - m.P.l)); let prev = null, switches = 0; const seen = new Set();
  for (let i = 0; i < px; i++) {
    const x = lo + (hi - lo) * (i + 0.5) / px, b = M.basin(x);
    ctx.fillStyle = b < 0 ? C.raw : BCOL[b]; ctx.fillRect(m.P.l + i, m.P.t, 1.2, m.P.b - m.P.t);
    if (prev !== null && b !== prev) switches++; prev = b; seen.add(b);
  }
  return { switches, seen };
}
function draw5() {
  const x0 = num('x50'), z = Math.pow(10, num('z5')), w = 2 / z, lo = x0 - w, hi = x0 + w, F = M.BASIN;
  $('x50v').textContent = fmt(x0, 4); $('z5v').textContent = '×' + (z < 10 ? z.toFixed(1) : Math.round(z));
  const xs = M.iterate(F, x0, 80), b = M.basin(x0);
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 210, xMin: -2, xMax: 2, yMin: -2.5, yMax: 2.5, yTicks: [-2, 0, 2], title: t('c5a') });
  M.BASIN_ROOTS.forEach((r, j) => vline(ctx, A, r, BCOL[j], [4, 4], 1.2));
  plot(ctx, A, F.f, C.text, 2);
  cobweb(ctx, A, F, xs, 10);
  M.BASIN_ROOTS.forEach((r, j) => dot(ctx, A.x(r), A.y(0), 5, BCOL[j]));
  if (inX(A, x0)) dot(ctx, A.x(x0), A.y(0), 5.5, C.text);
  const S1 = panel(ctx, W, { top: 254, bottom: 296, xMin: -2, xMax: 2, yMin: 0, yMax: 1, yTicks: [], xStep: 0.5, title: t('c5b') });
  strip(ctx, S1, -2, 2);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  const r0 = Math.max(S1.P.l, S1.x(lo)), r1 = Math.min(S1.P.r, S1.x(hi)); ctx.strokeRect(r0, S1.P.t - 3, Math.max(2, r1 - r0), S1.P.b - S1.P.t + 6); ctx.restore();
  const S2 = panel(ctx, W, { top: 342, bottom: H - 26, xMin: lo, xMax: hi, yMin: 0, yMax: 1, yTicks: [], minPx: 56, title: t('c5c', { lo: fmt(lo, 4), hi: fmt(hi, 4) }) });
  const info = strip(ctx, S2, lo, hi);
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(S2.x(x0), S2.P.t - 4); ctx.lineTo(S2.x(x0), S2.P.b + 4); ctx.stroke(); ctx.restore();
  const steps = b >= 0 ? xs.findIndex(x => Math.abs(x - M.BASIN_ROOTS[b]) < 1e-10) : -1;
  const where = b >= 0 ? t('s5to', { r: M.BASIN_ROOTS[b], n: steps }) : t('s5none');
  $('out5').textContent = t('s5readout', { x0: fmt(x0, 4), where, lo: fmt(lo, 4), hi: fmt(hi, 4), sw: info.switches, k: [...info.seen].filter(v => v >= 0).length });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('x00').addEventListener('input', draw0);
  $('clear0').addEventListener('click', () => { s0.trail.clear(); draw0(); });
  $('fnSq2').addEventListener('click', () => setFn('sq2'));
  $('fnCos').addEventListener('click', () => setFn('cosx'));
  $('fnExp').addEventListener('click', () => setFn('exp3'));
  $('x10').addEventListener('input', () => { stopAnim('s1'); s1.n = 0; draw1(); });
  $('step1b').addEventListener('click', () => { stopAnim('s1'); s1.n = Math.min(MAX1, s1.n + 1); draw1(); });
  $('play1').addEventListener('click', () => {
    const from = s1.n, to = MAX1;
    animate('s1', (to - from) * 650, p => { s1.n = from + Math.min(to - from, Math.floor(p * (to - from + 0.999))); draw1(); });
  });
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.n = 0; draw1(); });
  $('a2').addEventListener('input', draw2);
  [1, 2, 3].forEach(k => $('k' + k).addEventListener('click', () => { s3.k = k; draw3(); }));
  $('x30').addEventListener('input', draw3);
  $('x40').addEventListener('input', draw4);
  const preset = v => () => { $('x40').value = v; draw4(); };
  $('pr0').addEventListener('click', preset(0)); $('pr01').addEventListener('click', preset(0.1));
  $('prFlat').addEventListener('click', preset(0.8165)); $('prM2').addEventListener('click', preset(-2)); $('pr05').addEventListener('click', preset(0.5));
  ['x50', 'z5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshNewton = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
