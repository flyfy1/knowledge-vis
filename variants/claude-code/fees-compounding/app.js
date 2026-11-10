'use strict';
// Fees & compounding lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.FC_MODEL (model.js). Canvas text is limited to panel
// titles and axis ticks in reserved rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.FC_MODEL;
const t = (...a) => window.FC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', blue: '#5b8def', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (90 stays 90). Minus sign is U+2212.
function fmt(v, d = 2) {
  if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
  let s = v.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace(/^-/, '−');
}
const sgn = (v, d = 1) => (v > 1e-9 ? '+' : '') + fmt(v, d);

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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  (o.yTicks || []).forEach(v => {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 6, y(v) + 4);
  });
  if (o.xTicks) {
    ctx.textAlign = 'center';
    o.xTicks.forEach(v => {
      if (o.xGrid) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); }
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15);
    });
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function ticks(min, max, px, minPx, steps) {
  const step = steps.find(s => s / (max - min) * px >= minPx) || steps[steps.length - 1];
  const out = []; for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}
const dot = (ctx, X, Y, r, col) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = col; ctx.fill(); };
function hdash(ctx, x0, x1, Y, col = C.text, alpha = 0.7) { ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }
function vguide(ctx, X, y0, y1, col = C.orange) { ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function polyline(ctx, pts, col, lw, alpha = 1) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore(); }
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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

const lang = () => window.FC_I18N.getLang();
const B0 = M.BASE;
const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const money = v => t('money', { v: (v < 0 ? '−' : '') + group(Math.abs(v)) });
// Money axis label: 万 in Chinese, k in English.
const axisMoney = v => (v === 0 ? '0' : t('thousand', { v: lang() === 'zh' ? fmt(v / 10000, 1) : fmt(v / 1000, 0) }));
const pct = (v, d = 1) => fmt(100 * v, d);

/* ---------- step 0: guess, then watch the gap open ---------- */
const s0 = { reveal: 0, checked: false };
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 46, xMin: 0, xMax: 30, yMin: 0, yMax: 120000, yTicks: [0, 20000, 40000, 60000, 80000, 100000, 120000], yLabel: axisMoney, xTicks: ticks(0, 30, W - 58, 28, [5, 10]), title: t('c0a') });
  const tEnd = s0.reveal * 30, steps = Math.round(tEnd * 4);
  const ptsA = [], ptsB = [];
  for (let i = 0; i <= steps; i++) { const tt = i / 4; ptsA.push([A.x(tt), A.y(M.value(B0.P, B0.r, 0, tt))]); ptsB.push([A.x(tt), A.y(M.value(B0.P, B0.r, B0.f, tt))]); }
  if (ptsA.length > 1) {
    ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.35)'; ctx.beginPath(); ptsA.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); for (let i = ptsB.length - 1; i >= 0; i--) ctx.lineTo(ptsB[i][0], ptsB[i][1]); ctx.closePath(); ctx.fill(); ctx.restore();
    polyline(ctx, ptsA, C.text, 2.4); polyline(ctx, ptsB, C.cyan, 2.6);
  }
  dot(ctx, A.x(0), A.y(B0.P), 5, C.text);
  const a0 = M.value(B0.P, B0.r, 0, 30), af = M.value(B0.P, B0.r, B0.f, 30);
  $('r0').textContent = s0.checked ? t('s0readout', { a0: money(a0), af: money(af), gap: money(a0 - af), lost: pct(1 - af / a0), kept: pct(af / a0) }) : t('s0pending');
}

/* ---------- step 1: year-by-year ledger ---------- */
const LED = M.ledger(B0.P, B0.r, B0.f, 30);
function draw1(prog = '') {
  const tt = num('t1'), row = LED[tt - 1];
  $('t1v').textContent = String(tt);
  let { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0.3, xMax: 30.7, yMin: 0, yMax: 1000, yTicks: [0, 250, 500, 750, 1000], xTicks: ticks(1, 30, W - 52, 26, [5, 10]).filter(v => v >= 1), title: t('c1a') });
  const bw = Math.min(16, (A.x(2) - A.x(1)) * 0.7);
  LED.forEach(q => { ctx.globalAlpha = q.t <= tt ? 1 : 0.18; ctx.fillStyle = C.orange; ctx.fillRect(A.x(q.t) - bw / 2, A.y(q.fee), bw, A.y(0) - A.y(q.fee)); });
  ctx.globalAlpha = 1;
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const Bp = panel(ctx, W, { top: 28, bottom: H - 28, left: 46, xMin: 0, xMax: 30, yMin: 0, yMax: 32000, yTicks: [0, 10000, 20000, 30000], yLabel: axisMoney, xTicks: ticks(0, 30, W - 58, 26, [5, 10]), title: t('c1b') });
  const shown = [{ t: 0, cum: 0, gap: 0 }].concat(LED.slice(0, tt));
  ctx.save(); ctx.fillStyle = 'rgba(85,101,122,0.55)'; ctx.beginPath();
  shown.forEach((q, i) => (i ? ctx.lineTo(Bp.x(q.t), Bp.y(q.gap)) : ctx.moveTo(Bp.x(q.t), Bp.y(q.gap))));
  for (let i = shown.length - 1; i >= 0; i--) ctx.lineTo(Bp.x(shown[i].t), Bp.y(shown[i].cum));
  ctx.closePath(); ctx.fill(); ctx.restore();
  polyline(ctx, shown.map(q => [Bp.x(q.t), Bp.y(q.cum)]), C.orange, 2.4);
  polyline(ctx, shown.map(q => [Bp.x(q.t), Bp.y(q.gap)]), C.pink, 2.4);
  dot(ctx, Bp.x(tt), Bp.y(row.gap), 5, C.pink); dot(ctx, Bp.x(tt), Bp.y(row.cum), 5, C.orange);
  const start = tt === 1 ? B0.P : LED[tt - 2].bal;
  $('r1').textContent = t('s1readout', { prog, t: tt, start: money(start), before: money(start * (1 + B0.r)), fee: money(row.fee), bal: money(row.bal), cum: money(row.cum), gap: money(row.gap), lg: money(row.lostGrowth), lgPct: fmt(row.gap > 0 ? 100 * row.lostGrowth / row.gap : 0, 0) });
}

/* ---------- step 2: share kept ---------- */
const s2 = { tried: new Set([1]) };
function draw2() {
  const fp = +num('f2').toFixed(1), f = fp / 100, T = num('T2');
  $('f2v').textContent = fmt(fp, 1) + '%'; $('T2v').textContent = String(T);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0, xMax: 50, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xTicks: ticks(0, 50, W - 52, 28, [5, 10]), title: t('c2a') });
  const curve = (ff, col, lw, a) => { const pts = []; for (let y = 0; y <= 50; y++) pts.push([A.x(y), A.y(100 * M.kept(ff, y))]); polyline(ctx, pts, col, lw, a); };
  [...s2.tried].forEach(v => { if (Math.abs(v - fp) > 1e-9) curve(v / 100, C.raw, 1.4, 0.9); });
  curve(f, C.cyan, 2.6, 1);
  dot(ctx, A.x(T), A.y(100 * M.kept(f, T)), 6.5, C.orange);
  const lost = 1 - M.kept(f, T), fT = f * T, over = 100 * (fT - lost);
  const approx = over < 0.5 ? t('s2approxNear') : t('s2approxFar', { over: fmt(over, 1) });
  $('r2').textContent = t('s2readout', { f: fmt(fp, 1), T, kept: pct(M.kept(f, T)), lost: pct(lost), fT: fmt(100 * fT, 1), approx });
}

/* ---------- step 3: share of the gain ---------- */
function draw3() {
  const rp = num('r3'), r = rp / 100;
  $('r3v').textContent = fmt(rp, 1) + '%';
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 1, xMax: 10, yMin: 0, yMax: 120, yTicks: [0, 25, 50, 75, 100], xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], title: t('c3a') });
  hdash(ctx, A.P.l, A.P.r, A.y(100));
  const sf = 1 - M.kept(B0.f, 30);
  polyline(ctx, [[A.x(1), A.y(100 * sf)], [A.x(10), A.y(100 * sf)]], C.cyan, 2.4);
  const pts = []; for (let v = 1; v <= 10.0001; v += 0.05) pts.push([A.x(v), A.y(Math.min(120, 100 * M.gainShareLost(B0.P, v / 100, B0.f, 30)))]);
  polyline(ctx, pts, C.orange, 2.6);
  const sg = M.gainShareLost(B0.P, r, B0.f, 30);
  dot(ctx, A.x(rp), A.y(100 * sf), 5.5, C.cyan); dot(ctx, A.x(rp), A.y(Math.min(120, 100 * sg)), 6.5, C.orange);
  const a0 = M.value(B0.P, r, 0, 30), af = M.value(B0.P, r, B0.f, 30);
  $('rd3').textContent = t('s3readout', { r: fmt(rp, 1), a0: money(a0), g0: money(a0 - B0.P), af: money(af), sf: pct(sf), sg: pct(sg), note: sg > 1 ? t('s3noteOver') : t('s3noteOk') }).trim();
}

/* ---------- step 4: one-time charge vs yearly fee ---------- */
function draw4() {
  const Lp = num('L4'), fp = +num('f4').toFixed(1), L = Lp / 100, f = fp / 100;
  $('L4v').textContent = fmt(Lp, 1) + '%'; $('f4v').textContent = fmt(fp, 1) + '%';
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0, xMax: 50, yMin: 0, yMax: 5.2, yTicks: [0, 1, 2, 3, 4, 5], xTicks: ticks(0, 50, W - 52, 28, [5, 10]), title: t('c4a') });
  const pts = []; for (let T = 1; T <= 50; T += 0.25) pts.push([A.x(T), A.y(100 * M.loadAsAnnual(L, T))]);
  polyline(ctx, pts, C.orange, 2.6);
  polyline(ctx, [[A.x(0), A.y(fp)], [A.x(50), A.y(fp)]], C.cyan, 2.4);
  const be = M.breakEvenYears(L, f);
  if (be <= 50) dot(ctx, A.x(be), A.y(100 * M.loadAsAnnual(L, be)), 6.5, C.text);
  $('r4').textContent = t('s4readout', { L: fmt(Lp, 1), e1: fmt(100 * M.loadAsAnnual(L, 1), 2), e10: fmt(100 * M.loadAsAnnual(L, 10), 2), e30: fmt(100 * M.loadAsAnnual(L, 30), 2), f: fmt(fp, 1), verdict: be <= 50 ? t('s4be', { be }) : t('s4never') });
}

/* ---------- step 5: break-even extra return ---------- */
const F1 = 0.001;
function draw5() {
  const fp = +num('f5').toFixed(1), f2 = fp / 100;
  $('f5v').textContent = fmt(fp, 1) + '%';
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0, xMax: 2.6, yMin: 0, yMax: 3, yTicks: [0, 1, 2, 3], xTicks: [0, 0.5, 1, 1.5, 2, 2.5], title: t('c5a') });
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.7; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A.x(0.1), A.y(0)); ctx.lineTo(A.x(2.5), A.y(2.4)); ctx.stroke(); ctx.restore();
  const pts = []; for (let v = 0.1; v <= 2.5001; v += 0.02) pts.push([A.x(v), A.y(100 * M.extraNeeded(B0.r, F1, v / 100))]);
  polyline(ctx, pts, C.green, 2.6);
  const x = M.extraNeeded(B0.r, F1, f2);
  dot(ctx, A.x(fp), A.y(100 * x), 6.5, C.orange);
  const lost = 1 - Math.pow((1 - f2) / (1 - F1), 30);
  $('r5').textContent = t('s5readout', { f2: fmt(fp, 1), x: fmt(100 * x, 2), d: fmt(fp - 0.1, 1), lost: pct(lost) });
}

/* ---------- step 6: table ---------- */
const TF = [0.1, 0.5, 1, 1.5, 2], TT = [10, 20, 30, 40];
function draw6() {
  $('table6').innerHTML = `<thead><tr><th>${t('tableHead')}</th>${TT.map(T => `<th>${t('tableYears', { T })}</th>`).join('')}</tr></thead><tbody>` +
    TF.map(f => `<tr><td>${fmt(f, 1)}%</td>${TT.map(T => `<td>${(100 * (1 - M.kept(f / 100, T))).toFixed(1)}%</td>`).join('')}</tr>`).join('') + '</tbody>';
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    if (!choice) return;
    const ok = choice.value === 'c', lost = pct(1 - M.kept(B0.f, 30), 0);
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong', { lost });
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
    s0.checked = true;
    animate('s0', 3000, p => { s0.reveal = p; draw0(); });
  });
  $('t1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('play1').addEventListener('click', () => {
    animate('s1', 30 * 180, p => { const v = Math.max(1, Math.round(p * 30)); $('t1').value = v; draw1(v < 30 ? t('s1progress', { t: v }) : ''); });
  });
  $('f2').addEventListener('input', () => { s2.tried.add(+num('f2').toFixed(1)); draw2(); });
  $('T2').addEventListener('input', draw2);
  $('r3').addEventListener('input', draw3);
  ['L4', 'f4'].forEach(id => $(id).addEventListener('input', draw4));
  $('f5').addEventListener('input', draw5);

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
