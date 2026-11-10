'use strict';
// Stocks & bonds lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every square, bar, line and readout comes from window.SB_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SB_MODEL;
const t = (...a) => window.SB_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', grey: '#3a4757', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = (v, d = 1) => fmt(v * 100, d) + '%';
const group = v => { const r = Math.round(v), s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (r < 0 ? '−' : '') + s; };
const money = v => (v < -0.5 ? '−' : '') + t('money', { v: group(Math.abs(v)) });
const signed = v => (v > 0.5 ? '+' : '') + group(v);

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
const ticks = (lo, hi, st) => { const out = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(8)); return out; };
function panel(ctx, W, o) {
  const P = { l: o.left || 48, r: W - (o.right || 24), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : group(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const st = o.xStep || niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 40, o.xSteps || [1, 2, 5, 10]);
    ctx.textAlign = 'center';
    for (const v of ticks(o.xFirst !== undefined ? o.xFirst : o.xMin, o.xMax, st)) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(o.xFmt ? o.xFmt(v) : group(v), x(v), P.b + 15); }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, fill, stroke) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } }
function vguide(ctx, X, y0, y1, color = C.text) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function line(ctx, m, f, x0, x1, col, lw = 2.4, steps = 200) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
  for (let i = 0; i <= steps; i++) { const v = x0 + (x1 - x0) * i / steps; if (!i) ctx.moveTo(m.x(v), m.y(f(v))); else ctx.lineTo(m.x(v), m.y(f(v))); }
  ctx.stroke(); ctx.restore();
}

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

/* ---------- step 0: a slice of ownership ---------- */
function draw0() {
  const k = num('k0'), p = num('p0'), o = M.owner(k, p);
  $('k0v').textContent = String(k); $('p0v').textContent = money(p);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0top'), 8, 18, W - 16);
  const cell = Math.min(18, (W - 24) / 10), g0x = 12, g0y = 30;
  for (let i = 0; i < M.SHARES; i++) {
    const r = Math.floor(i / 10), c = i % 10;
    ctx.fillStyle = i < k ? C.cyan : C.grey; ctx.fillRect(g0x + c * cell + 1, g0y + r * cell + 1, cell - 2, cell - 2);
  }
  const B = panel(ctx, W, { top: 266, bottom: H - 44, left: 24, right: 24, xMin: 0, xMax: 8000, yMin: 0, yMax: 1, yTicks: [], xTicks: true, xSteps: [1000, 2000, 4000], minPx: 46, title: t('c0bot') });
  if (p > 0) {
    const bh = B.P.b - B.P.t;
    ctx.fillStyle = C.green; ctx.fillRect(B.x(0), B.P.t, B.x(o.dividends) - B.x(0), bh);
    ctx.fillStyle = C.violet; ctx.fillRect(B.x(o.dividends), B.P.t, B.x(p) - B.x(o.dividends), bh);
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
    ctx.strokeRect(B.x(0) + 1, B.P.t + 1, Math.max(2, B.x(o.dividends * o.frac) - B.x(0) - 2), bh - 2);
    ctx.strokeRect(B.x(o.dividends) + 1, B.P.t + 1, Math.max(2, B.x(o.dividends + o.kept * o.frac) - B.x(o.dividends) - 2), bh - 2);
    ctx.restore();
  }
  $('rd0').textContent = p > 0
    ? t('s0readout', { k, cost: money(o.cost), frac: pct(o.frac, 0), p: money(p), div: money(o.dividends), mine: money(o.mine), kept: money(o.kept), keptMine: money(o.kept * o.frac) })
    : t('s0zero', { k, cost: money(o.cost), frac: pct(o.frac, 0) });
}

/* ---------- step 1: an IOU ---------- */
function draw1() {
  const c = num('cr1'), T = num('T1'), b = M.bondFlows(c, T);
  $('c1v').textContent = pct(c); $('T1v').textContent = String(T);
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 0.3, xMax: 10.7, yMin: 0, yMax: 2000, yTicks: [0, 500, 1000, 1500, 2000], xTicks: true, xFirst: 1, xStep: 1, title: t('c1title') });
  const bw = (m.x(2) - m.x(1)) * 0.6;
  let cum = 0; const pts = [[m.x(0.3), m.y(0)]];
  b.flows.forEach(f => {
    const X = m.x(f.year) - bw / 2;
    ctx.fillStyle = C.green; ctx.fillRect(X, m.y(f.coupon), bw, m.y(0) - m.y(f.coupon));
    if (f.principal) { ctx.fillStyle = C.cyan; ctx.fillRect(X, m.y(f.coupon + f.principal), bw, m.y(f.coupon) - m.y(f.coupon + f.principal)); }
    cum += f.coupon + f.principal; pts.push([m.x(f.year), m.y(cum)]);
  });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
  pts.slice(1).forEach(([X, Y]) => dot(ctx, X, Y, 3.2, C.text));
  $('rd1').textContent = t('s1readout', { c: pct(c), T, cp: money(M.FACE * c), face: money(M.FACE), total: money(b.total), int: money(b.interest) });
}

/* ---------- step 2: good years and bad ---------- */
const s2 = { k: 0 };
function draw2() {
  const p = num('p2'), y = M.year(p), be = M.breakEven();
  $('p2v').textContent = money(p);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: 226, xMin: -2000, xMax: 6000, yMin: -250, yMax: 600, yTicks: [-200, 0, 200, 400, 600], xTicks: true, xSteps: [1000, 2000, 4000], minPx: 46, title: t('c2top') });
  line(ctx, A, v => M.year(v).myBond, -2000, 6000, C.orange);
  line(ctx, A, v => M.year(v).myStock, -2000, 6000, C.cyan);
  dot(ctx, A.x(be), A.y(M.year(be).myStock), 6, C.text, C.bg);
  vguide(ctx, A.x(p), A.P.t, A.P.b);
  dot(ctx, A.x(p), A.y(y.myBond), 5, C.orange, C.bg); dot(ctx, A.x(p), A.y(y.myStock), 5, C.cyan, C.bg);
  const B = panel(ctx, W, { top: 282, bottom: H - 28, xMin: 0.4, xMax: M.RUN.length + 0.6, yMin: -100, yMax: 400, yTicks: [-100, 0, 100, 200, 300, 400], xTicks: true, xFirst: 1, xStep: 1, title: t('c2bot') });
  const bw = (B.x(2) - B.x(1)) * 0.32;
  for (let i = 0; i < s2.k; i++) {
    const r = M.year(M.RUN[i]), X = B.x(i + 1);
    [[r.myStock, C.cyan, -bw], [r.myBond, C.orange, 0]].forEach(([v, col, dx]) => { ctx.fillStyle = col; ctx.fillRect(X + dx, Math.min(B.y(v), B.y(0)), bw, Math.abs(B.y(v) - B.y(0))); });
  }
  const cmp = Math.abs(y.myStock - y.myBond) < 0.5 ? t('s2same') : y.myStock > y.myBond ? t('s2more') : t('s2less');
  $('rd2').textContent = t('s2readout', { p: money(p), paid: money(y.paid), b: money(y.myBond), own: money(y.toOwners), s: money(y.myStock), cmp }) + ' ' + t('s2be', { be: money(be) });
  if (!s2.k) { $('rd2b').textContent = t('s2idle'); return; }
  const done = M.RUN.slice(0, s2.k).map(M.year);
  const st = done.map(r => r.myStock);
  $('rd2b').textContent = t('s2run', { k: s2.k, N: M.RUN.length, bc: money(done.reduce((a, r) => a + r.myBond, 0)), sc: money(st.reduce((a, v) => a + v, 0)), best: money(Math.max(...st)), worst: money(Math.min(...st)), fixed: money(done[0].myBond) });
}

/* ---------- step 3: winding up ---------- */
function draw3() {
  const V = num('V3'), w = M.windUp(V);
  $('V3v').textContent = money(V);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: 90, left: 24, xMin: 0, xMax: 12000, yMin: 0, yMax: 1, yTicks: [], xTicks: true, xSteps: [2000, 4000, 6000], minPx: 46, title: t('c3top') });
  const bh = A.P.b - A.P.t;
  ctx.fillStyle = C.orange; ctx.fillRect(A.x(0), A.P.t, A.x(w.toLenders) - A.x(0), bh);
  ctx.fillStyle = C.cyan; ctx.fillRect(A.x(M.DEBT), A.P.t, A.x(M.DEBT + w.toOwners) - A.x(M.DEBT), bh);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.strokeRect(A.x(0), A.P.t - 4, A.x(M.DEBT) - A.x(0), bh + 8); ctx.restore();
  const B = panel(ctx, W, { top: 150, bottom: H - 28, xMin: 0, xMax: 12000, yMin: 0, yMax: 1100, yTicks: [0, 250, 500, 750, 1000], xTicks: true, xSteps: [2000, 4000, 6000], minPx: 46, title: t('c3bot') });
  line(ctx, B, v => M.windUp(v).myBond, 0, 12000, C.orange);
  line(ctx, B, v => M.windUp(v).myStock, 0, 12000, C.cyan);
  vguide(ctx, B.x(M.DEBT), B.P.t, B.P.b, C.ghost);
  vguide(ctx, B.x(V), B.P.t, B.P.b);
  dot(ctx, B.x(V), B.y(w.myBond), 5, C.orange, C.bg); dot(ctx, B.x(V), B.y(w.myStock), 5, C.cyan, C.bg);
  $('rd3').textContent = t('s3readout', { V: money(V), L: money(w.toLenders), lp: pct(w.toLenders / M.DEBT, 0), O: money(w.toOwners), mb: money(w.myBond), ms: money(w.myStock) });
}

/* ---------- step 4: where prices come from ---------- */
const s4 = { seen: new Set([0]) };
function draw4() {
  const mood = num('m4'), mk = M.market(mood);
  s4.seen.add(mood);
  $('m4v').textContent = signed(mood);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: 250, xMin: 0, xMax: 10, yMin: 40, yMax: 170, yTicks: [50, 75, 100, 125, 150], xTicks: true, xFirst: 1, xStep: 1, title: t('c4top') });
  const stair = (vals, col) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath();
    vals.forEach((v, i) => { if (!i) ctx.moveTo(A.x(0), A.y(v)); else ctx.lineTo(A.x(i), A.y(v)); ctx.lineTo(A.x(i + 1), A.y(v)); });
    ctx.stroke(); ctx.restore();
  };
  // shade the shares that trade
  ctx.save(); ctx.fillStyle = 'rgba(232,237,244,0.07)'; ctx.fillRect(A.x(0), A.P.t, A.x(mk.trades) - A.x(0), A.P.b - A.P.t); ctx.restore();
  stair(mk.sell, C.pink); stair(mk.buy, C.green);
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(mk.price)); ctx.lineTo(A.P.r, A.y(mk.price)); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(mk.trades), A.y(mk.price), 6.5, C.text, C.bg);
  const B = panel(ctx, W, { top: 306, bottom: H - 28, xMin: -30, xMax: 30, yMin: 70, yMax: 130, yTicks: [80, 100, 120], xTicks: true, xSteps: [10, 15, 30], minPx: 40, xFmt: v => signed(v), title: t('c4bot') });
  [...s4.seen].forEach(v => { if (v !== mood) dot(ctx, B.x(v), B.y(M.market(v).price), 3.5, C.muted); });
  dot(ctx, B.x(mood), B.y(mk.price), 6, C.text, C.bg);
  $('rd4').textContent = t('s4readout', { m: signed(mood), q: mk.trades, p: t('money', { v: fmt(mk.price, 1) }), lo: money(mk.lo), hi: money(mk.hi) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  ['k0', 'p0'].forEach(id => $(id).addEventListener('input', draw0));
  ['cr1', 'T1'].forEach(id => $(id).addEventListener('input', draw1));
  $('p2').addEventListener('input', draw2);
  $('run2').addEventListener('click', () => {
    s2.k = 0; draw2();
    animate('s2', M.RUN.length * 700, p => { s2.k = Math.min(M.RUN.length, Math.floor(p * M.RUN.length) + (p >= 1 ? 0 : 1)); draw2(); }, () => { s2.k = M.RUN.length; draw2(); });
  });
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.k = 0; draw2(); });
  $('V3').addEventListener('input', draw3);
  $('m4').addEventListener('input', draw4);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    $('quizFeedback').dataset.state = choice && choice.value === 'b' ? 'correct' : 'wrong'; showQuiz();
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
  window.refreshStocks = () => { showQuiz(); refresh(); };
  refresh();
}
function showQuiz() {
  const fb = $('quizFeedback'), st = fb.dataset.state; if (!st) return;
  fb.textContent = st === 'correct' ? t('correct', { bond: money(M.windUp(4000).myBond) }) : t('wrong');
  fb.style.color = st === 'correct' ? C.green : C.orange;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
