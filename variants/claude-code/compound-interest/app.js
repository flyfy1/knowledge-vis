'use strict';
// Compound-interest lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.CI_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.CI_MODEL;
const t = (...a) => window.CI_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', grey: '#55657a', ghost: '#8696aa' };
const OCOL = { now: C.cyan, stream: C.green, later: C.orange };
const OKEY = { now: 'offerNow', stream: 'offerStream', later: 'offerLater' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = (v, d = 1) => fmt(v * 100, d) + '%';
const group = v => { const s = String(Math.round(Math.abs(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (v < -0.5 ? '−' : '') + s; };
const money = v => t('money', { v: group(v) });

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
// A round upper bound and a tick step giving at most ~5 intervals.
function niceMax(v) {
  const e = Math.pow(10, Math.floor(Math.log10(v))), cands = [1, 2, 2.5, 5, 10].map(k => k * e);
  const st = cands.find(s => v / s <= 5) || 10 * e; return { max: Math.ceil(v / st - 1e-9) * st, step: st };
}
const ticks = (lo, hi, st) => { const out = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9 * Math.max(1, Math.abs(hi)); v += st) out.push(+v.toFixed(10)); return out; };

// A plot panel. Title sits in its own row above the plot; tick labels sit left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  const xt = o.xTickList || (o.xTicks ? (() => { const st = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [1, 2, 5, 10, 20]); return ticks(o.xMin, o.xMax, st).map(v => [v, o.xFmt ? o.xFmt(v) : fmt(v)]); })() : []);
  ctx.textAlign = 'center';
  for (const [v, lab] of xt) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(lab, x(v), P.b + 15); }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, fill, stroke) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } }
function vguide(ctx, X, y0, y1, color = C.text) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function curve(ctx, m, f, x0, x1, col, lw = 2.2, dash = null, steps = 240) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= steps; i++) { const v = x0 + (x1 - x0) * i / steps, Y = m.y(f(v)); if (!i) ctx.moveTo(m.x(v), Y); else ctx.lineTo(m.x(v), Y); }
  ctx.stroke(); ctx.restore();
}
const moneyTick = v => group(v);

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

/* ---------- step 0: interest on interest ---------- */
const s0 = { shown: null }; // null = every year up to n is shown; k = playing up to year k
function draw0() {
  const r = num('r0'), n = num('n0'), P = M.P0, upto = s0.shown === null ? n : s0.shown;
  $('r0v').textContent = pct(r); $('n0v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c0'));
  const nm = niceMax(M.compound(P, r, n) * 1.04);
  const m = panel(ctx, W, { top: 30, bottom: H - 28, left: 56, xMin: -0.7, xMax: n + 0.7, yMin: 0, yMax: nm.max, yTicks: ticks(0, nm.max, nm.step), yFmt: moneyTick, xTicks: true, xSteps: [1, 2, 5, 10], minPx: 26, title: t('c0title') });
  const bw = Math.max(2, (m.x(1) - m.x(0)) * 0.72);
  for (let k = 0; k <= upto; k++) {
    const s = M.split(P, r, k), X = m.x(k) - bw / 2;
    [[0, s.principal, C.grey], [s.principal, s.principal + s.onPrincipal, C.cyan], [s.principal + s.onPrincipal, s.total, C.orange]].forEach(([a, b, col]) => {
      if (b - a <= 0) return; ctx.fillStyle = col; ctx.fillRect(X, m.y(b), bw, m.y(a) - m.y(b));
    });
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath();
  for (let k = 0; k <= upto; k++) { const Y = m.y(M.simple(P, r, k)); if (!k) ctx.moveTo(m.x(k), Y); else ctx.lineTo(m.x(k), Y); }
  ctx.stroke(); ctx.restore();
  const s = M.split(P, r, upto), int = s.total - P;
  $('rd0').textContent = t('s0readout', { n: upto, r: pct(r), total: money(s.total), simple: money(s.simple), int: money(int), onP: money(s.onPrincipal), onI: money(s.onInterest), share: int > 0 ? pct(s.onInterest / int, 0) : '0%', prog: s0.shown === null ? '' : t('s0prog', { k: upto, N: n }) });
}

/* ---------- step 1: doubling time ---------- */
const s1 = { log: true };
const YEARS1 = 40;
function draw1() {
  const r = num('r1'); $('r1v').textContent = pct(r);
  $('axLog').setAttribute('aria-pressed', s1.log ? 'true' : 'false'); $('axLin').setAttribute('aria-pressed', s1.log ? 'false' : 'true');
  const { ctx, W, H } = fitCanvas($('c1'));
  const T = M.doubling(r), g40 = M.compound(1, r, YEARS1), k40 = Math.floor(YEARS1 / T + 1e-9);
  let m;
  if (s1.log) {
    const top = Math.max(1, Math.ceil(Math.log2(g40) - 1e-9)), every = Math.max(1, Math.ceil(top / 5));
    const yt = []; for (let j = 0; j <= top; j += every) yt.push(j);
    m = panel(ctx, W, { top: 30, bottom: 236, left: 56, xMin: 0, xMax: YEARS1, yMin: 0, yMax: top, yTicks: yt, yFmt: j => group(Math.pow(2, j)) + '×', xTicks: true, xSteps: [5, 10, 20], title: t('c1top') });
    // fainter grid line for every doubling not labelled
    ctx.save(); ctx.strokeStyle = C.grid; ctx.globalAlpha = 0.5; for (let j = 1; j <= top; j++) if (j % every) { ctx.beginPath(); ctx.moveTo(m.P.l, m.y(j)); ctx.lineTo(m.P.r, m.y(j)); ctx.stroke(); } ctx.restore();
    curve(ctx, m, v => Math.log2(M.compound(1, r, v)), 0, YEARS1, C.cyan, 2.4);
    for (let j = 1; j <= k40; j++) dot(ctx, m.x(j * T), m.y(j), 4.5, C.orange, C.bg);
  } else {
    const nm = niceMax(g40 * 1.04);
    m = panel(ctx, W, { top: 30, bottom: 236, left: 56, xMin: 0, xMax: YEARS1, yMin: 0, yMax: nm.max, yTicks: ticks(0, nm.max, nm.step), yFmt: v => group(v) + '×', xTicks: true, xSteps: [5, 10, 20], title: t('c1top') });
    curve(ctx, m, v => M.compound(1, r, v), 0, YEARS1, C.cyan, 2.4);
    for (let j = 1; j <= k40; j++) dot(ctx, m.x(j * T), m.y(Math.pow(2, j)), 4.5, C.orange, C.bg);
  }
  const b = panel(ctx, W, { top: 290, bottom: H - 28, left: 56, xMin: 0.01, xMax: 0.30, yMin: -0.10, yMax: 0.06, yTicks: [-0.1, -0.05, 0, 0.05], yFmt: v => pct(v, 0), xTicks: true, xSteps: [0.05, 0.1], xFmt: v => pct(v, 0), title: t('c1bot') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.14)'; ctx.fillRect(b.P.l, b.y(0.02), b.P.r - b.P.l, b.y(-0.02) - b.y(0.02)); ctx.restore();
  curve(ctx, b, M.rule72Err, 0.01, 0.30, C.green, 2.2);
  vguide(ctx, b.x(r), b.P.t, b.P.b); dot(ctx, b.x(r), b.y(M.rule72Err(r)), 5.5, C.cyan, C.bg);
  const band = M.rule72Band(0.02);
  $('rd1').textContent = t('s1readout', { r: pct(r), T: fmt(T, 2), R: fmt(M.rule72(r), 2), e: (M.rule72Err(r) >= 0 ? '+' : '') + pct(M.rule72Err(r), 1), k: k40, g: fmt(g40, g40 < 100 ? 1 : 0), lo: pct(band.lo, 1), hi: pct(band.hi, 1) });
}

/* ---------- step 2: compounding frequency ---------- */
const FKEYS = ['1', '2', '4', '12', '52', '365', 'Inf'];
const s2 = { m: 12 };
const fkey = m => (m === Infinity ? 'Inf' : String(m));
function buildFreq() {
  const row = $('freqRow');
  M.FREQS.forEach(m => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.step = '2'; b.dataset.m = fkey(m); row.appendChild(b); b.addEventListener('click', () => { s2.m = m; draw2(); }); });
}
function draw2() {
  const r = num('r2'), mm = s2.m; $('r2v').textContent = pct(r);
  document.querySelectorAll('[data-m]').forEach(b => { b.textContent = t(`f${b.dataset.m}`); b.setAttribute('aria-pressed', b.dataset.m === fkey(mm) ? 'true' : 'false'); });
  const { ctx, W, H } = fitCanvas($('c2'));
  const cap = Math.exp(r), st = cap - 1 > 0.1 ? 0.05 : cap - 1 > 0.04 ? 0.02 : 0.01;
  const yTop = Math.ceil((cap - 1) / st - 1e-9) * st;
  const A = panel(ctx, W, { top: 30, bottom: 216, left: 56, xMin: 0, xMax: 12, yMin: 1, yMax: 1 + yTop, yTicks: ticks(0, yTop, st).map(v => 1 + v), yFmt: v => fmt(v, 2), xTicks: true, xSteps: [1, 2, 3, 6], title: t('c2top') });
  curve(ctx, A, mo => Math.exp(r * mo / 12), 0, 12, C.text, 1.6, [5, 4]);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4; ctx.beginPath();
  if (mm === Infinity) { for (let i = 0; i <= 240; i++) { const mo = 12 * i / 240, Y = A.y(Math.exp(r * mo / 12)); if (!i) ctx.moveTo(A.x(mo), Y); else ctx.lineTo(A.x(mo), Y); } }
  else { for (let k = 0; k < mm; k++) { const v = Math.pow(1 + r / mm, k), x0 = A.x(12 * k / mm), x1 = A.x(12 * (k + 1) / mm), v1 = Math.pow(1 + r / mm, k + 1); if (!k) ctx.moveTo(x0, A.y(v)); ctx.lineTo(x1, A.y(v)); ctx.lineTo(x1, A.y(v1)); } }
  ctx.stroke(); ctx.restore();
  // bottom: effective rate against log10(m); continuous plotted one notch to the right of daily
  const XINF = 3.05, xOf = m => (m === Infinity ? XINF : Math.log10(m));
  const lo = r, hi = cap - 1, pad = (hi - lo) * 0.15 + 1e-6;
  const yt = [lo, (lo + hi) / 2, hi];
  const B = panel(ctx, W, { top: 268, bottom: H - 28, left: 56, xMin: -0.15, xMax: XINF + 0.15, yMin: lo - pad, yMax: hi + pad, yTicks: yt, yFmt: v => pct(v, 2), xTickList: [[0, '1'], [Math.log10(4), '4'], [Math.log10(12), '12'], [Math.log10(52), '52'], [Math.log10(365), '365'], [XINF, '∞']], title: t('c2bot') });
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(B.P.l, B.y(hi)); ctx.lineTo(B.P.r, B.y(hi)); ctx.stroke(); ctx.restore();
  curve(ctx, B, lx => M.ear(r, Math.pow(10, lx)), 0, Math.log10(365), C.grey, 1.4);
  M.FREQS.forEach(m => dot(ctx, B.x(xOf(m)), B.y(M.ear(r, m)), m === mm ? 6.5 : 4.5, C.orange, m === mm ? C.text : C.bg));
  const e = M.ear(r, mm);
  $('rd2').textContent = t('s2readout', { r: pct(r), freq: t(`f${fkey(mm)}`), f: fmt(M.factor(r, mm), 5), ear: pct(e, 3), gain: fmt((e - r) * 100, 3), cap: pct(hi, 3), gap: fmt((hi - e) * 100, 3) });
}

/* ---------- step 3: discounting ---------- */
const F3 = 10000;
function draw3() {
  const r = num('r3'), tt = num('t3'); $('r3v').textContent = pct(r); $('t3v').textContent = String(tt);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = panel(ctx, W, { top: 30, bottom: H - 28, left: 56, xMin: 0, xMax: 40, yMin: 0, yMax: 11000, yTicks: [0, 2500, 5000, 7500, 10000], yFmt: moneyTick, xTicks: true, xSteps: [5, 10, 20], title: t('c3title') });
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(F3)); ctx.lineTo(m.P.r, m.y(F3)); ctx.stroke(); ctx.restore();
  // shaded gap between the two curves up to t: what one extra point of discount rate costs
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.16)'; ctx.beginPath();
  for (let i = 0; i <= 120; i++) { const v = tt * i / 120; const X = m.x(v), Y = m.y(M.pv(F3, r, v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  for (let i = 120; i >= 0; i--) { const v = tt * i / 120; ctx.lineTo(m.x(v), m.y(M.pv(F3, r + 0.01, v))); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  curve(ctx, m, v => M.pv(F3, r + 0.01, v), 0, 40, C.pink, 2);
  curve(ctx, m, v => M.pv(F3, r, v), 0, 40, C.cyan, 2.6);
  vguide(ctx, m.x(tt), m.P.t, m.P.b);
  const pv = M.pv(F3, r, tt), pv1 = M.pv(F3, r + 0.01, tt);
  dot(ctx, m.x(tt), m.y(pv), 5.5, C.cyan, C.bg); dot(ctx, m.x(tt), m.y(pv1), 5, C.pink, C.bg);
  $('rd3').textContent = t('s3readout', { r: pct(r), t: tt, pv: money(pv), df: fmt(M.dfac(r, tt), 4), F: money(M.compound(pv, r, tt)), r1: pct(r + 0.01), pv1: money(pv1), drop: pct(M.pvDrop(r, tt, 0.01), 1) });
}

/* ---------- step 4: three prizes ---------- */
let SW = null;
function draw4() {
  const r = num('r4'); $('r4v').textContent = pct(r);
  if (!SW) SW = M.offerSwitches();
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: 206, left: 56, xMin: -0.8, xMax: 20.8, yMin: 0, yMax: 26000, yTicks: [0, 10000, 20000], yFmt: moneyTick, xTicks: true, xSteps: [1, 2, 5, 10], minPx: 26, title: t('c4top') });
  const bw = Math.max(3, (A.x(1) - A.x(0)) * 0.62);
  M.OFFER_IDS.forEach(id => M.OFFERS[id].forEach(([yr, c]) => {
    const X = A.x(yr) - bw / 2, p = M.pv(c, r, yr);
    ctx.fillStyle = OCOL[id]; ctx.fillRect(X, A.y(p), bw, A.y(0) - A.y(p));
    ctx.save(); ctx.strokeStyle = OCOL[id]; ctx.globalAlpha = 0.8; ctx.setLineDash([3, 2]); ctx.lineWidth = 1.2; ctx.strokeRect(X + 0.5, A.y(c) + 0.5, bw - 1, A.y(0) - A.y(c) - 1); ctx.restore();
  }));
  const B = panel(ctx, W, { top: 260, bottom: H - 28, left: 56, xMin: 0, xMax: 0.12, yMin: 0, yMax: 26000, yTicks: [0, 10000, 20000], yFmt: moneyTick, xTicks: true, xSteps: [0.02, 0.04], xFmt: v => pct(v, 0), title: t('c4bot') });
  M.OFFER_IDS.forEach(id => curve(ctx, B, v => M.pvFlows(M.OFFERS[id], v), 0, 0.12, OCOL[id], 2.4, null, 180));
  SW.forEach(s => { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(B.x(s.at), B.y(M.pvFlows(M.OFFERS[s.to], s.at)), 7, 0, 7); ctx.stroke(); ctx.restore(); });
  vguide(ctx, B.x(r), B.P.t, B.P.b);
  M.OFFER_IDS.forEach(id => dot(ctx, B.x(r), B.y(M.pvFlows(M.OFFERS[id], r)), 4.5, OCOL[id], C.bg));
  const v = id => money(M.pvFlows(M.OFFERS[id], r));
  $('rd4').textContent = t('s4readout', { r: pct(r), a: v('now'), b: v('stream'), c: v('later'), best: t(OKEY[M.bestOffer(r)]),
    x1: pct(SW[0].at, 2), f1: t(OKEY[SW[0].from]), t1: t(OKEY[SW[0].to]), x2: pct(SW[1].at, 2), f2: t(OKEY[SW[1].from]), t2: t(OKEY[SW[1].to]) });
}

/* ---------- step 5: a mortgage ---------- */
function draw5() {
  const L = num('L5'), r = num('r5'), n = num('y5');
  $('L5v').textContent = money(L); $('r5v').textContent = pct(r, 2); $('y5v').textContent = String(n);
  const s = M.schedule(L, r, n);
  const { ctx, W, H } = fitCanvas($('c5'));
  const nm = niceMax(12 * s.M * 1.05);
  const A = panel(ctx, W, { top: 30, bottom: 206, left: 64, xMin: 0.3, xMax: n + 0.7, yMin: 0, yMax: nm.max, yTicks: ticks(0, nm.max, nm.step), yFmt: moneyTick, xTicks: true, xSteps: [1, 2, 5, 10], minPx: 26, title: t('c5top') });
  const bw = Math.max(2, (A.x(2) - A.x(1)) * 0.72);
  s.years.forEach(y => {
    const X = A.x(y.year) - bw / 2;
    ctx.fillStyle = C.orange; ctx.fillRect(X, A.y(y.interest), bw, A.y(0) - A.y(y.interest));
    ctx.fillStyle = C.cyan; ctx.fillRect(X, A.y(y.interest + y.princ), bw, A.y(y.interest) - A.y(y.interest + y.princ));
  });
  const nb = niceMax(L * 1.04);
  const B = panel(ctx, W, { top: 260, bottom: H - 28, left: 64, xMin: 0, xMax: n, yMin: 0, yMax: nb.max, yTicks: ticks(0, nb.max, nb.step), yFmt: moneyTick, xTicks: true, xSteps: [1, 2, 5, 10], minPx: 26, title: t('c5bot') });
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(L)); ctx.lineTo(B.x(n), B.y(0)); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(L));
  s.months.forEach(mo => ctx.lineTo(B.x(mo.k / 12), B.y(mo.bal))); ctx.stroke(); ctx.restore();
  const hy = n / 2; vguide(ctx, B.x(hy), B.P.t, B.P.b, C.orange); dot(ctx, B.x(hy), B.y(s.halfBal), 5, C.orange, C.bg);
  $('rd5').textContent = t('s5readout', { L: money(L), r: pct(r, 2), n, M: money(s.M), total: money(s.M * n * 12), int: money(s.totalInterest), ratio: pct(s.totalInterest / L, 0), half: fmt(hy, 1), hb: money(s.halfBal), hs: pct(s.halfBal / L, 0),
    cross: s.crossMonth === 1 ? t('s5crossFirst') : t('s5cross', { k: s.crossMonth }) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildFreq();
  ['r0', 'n0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); s0.shown = null; draw0(); }));
  $('play0').addEventListener('click', () => {
    const n = num('n0'); s0.shown = 0; draw0();
    animate('s0', Math.min(6000, 220 * n + 400), p => { s0.shown = Math.min(n, Math.floor(p * (n + 1))); draw0(); }, () => { s0.shown = null; draw0(); });
  });
  $('r1').addEventListener('input', draw1);
  $('axLog').addEventListener('click', () => { s1.log = true; draw1(); }); $('axLin').addEventListener('click', () => { s1.log = false; draw1(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong'; showQuiz();
  });
  $('r2').addEventListener('input', draw2);
  ['r3', 't3'].forEach(id => $(id).addEventListener('input', draw3));
  $('r4').addEventListener('input', draw4);
  ['L5', 'r5', 'y5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshCompound = () => { showQuiz(); refresh(); };
  refresh();
}
function showQuiz() {
  const fb = $('quizFeedback'), st = fb.dataset.state; if (!st) return;
  fb.textContent = st === 'correct' ? t('correct', { T4: fmt(Math.log(4) / Math.log(1.09), 2) }) : t('wrong');
  fb.style.color = st === 'correct' ? C.green : C.orange;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
