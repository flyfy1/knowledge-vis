'use strict';
// Diversification lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, dot, curve and readout comes from window.DV_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks in reserved rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.DV_MODEL;
const t = (...a) => window.DV_I18N.t(...a);
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

/* ---------- steps 0–1 share one set of 20 simulated years ---------- */
const town = { set: 0, years: null };
const townYears = () => town.years || (town.years = M.shopYears(M.SEEDS[town.set]));

/* ---------- step 0: one basket ---------- */
const s0 = { shop: 'U' };
function draw0() {
  const ys = townYears(), key = s0.shop, r = ys.map(q => q[key]), st = M.stats(r);
  $('shopU').setAttribute('aria-pressed', key === 'U'); $('shopI').setAttribute('aria-pressed', key === 'I');
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0.3, xMax: M.YEARS + 0.7, yMin: -25, yMax: 35, yTicks: [-20, -10, 0, 10, 20, 30], xTicks: ticks(1, M.YEARS, W - 52, 26, [1, 2, 5]).filter(v => v >= 1), title: t('c0a') });
  const mu = M.SHOP.mean, sd = Math.sqrt(M.shopVar());
  ctx.save(); ctx.fillStyle = 'rgba(85,101,122,0.28)'; ctx.fillRect(A.P.l, A.y(mu + sd), A.P.r - A.P.l, A.y(mu - sd) - A.y(mu + sd)); ctx.restore();
  const bw = Math.min(22, (A.x(2) - A.x(1)) * 0.66);
  r.forEach((v, i) => { ctx.fillStyle = ys[i].W === 1 ? C.blue : C.orange; const Y0 = A.y(0), Y1 = A.y(v); ctx.fillRect(A.x(i + 1) - bw / 2, Math.min(Y0, Y1), bw, Math.max(1.5, Math.abs(Y1 - Y0))); });
  hdash(ctx, A.P.l, A.P.r, A.y(mu));
  $('r0').textContent = t('s0readout', { shop: t(key === 'U' ? 'nameU' : 'nameI'), set: town.set + 1, avg: sgn(st.mean, 1), sd: fmt(st.sd, 1), loss: r.filter(v => v < 0).length, worst: sgn(Math.min(...r), 0) });
}

/* ---------- step 1: a bit of each shop ---------- */
const s1 = { tried: new Set([100]) };
function draw1() {
  const wp = num('w1'), w = wp / 100, ys = townYears(), mix = ys.map(q => w * q.U + (1 - w) * q.I);
  $('w1v').textContent = wp + '%';
  let { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0.3, xMax: M.YEARS + 0.7, yMin: -25, yMax: 35, yTicks: [-20, -10, 0, 10, 20, 30], xTicks: ticks(1, M.YEARS, W - 52, 26, [1, 2, 5]).filter(v => v >= 1), title: t('c1a') });
  const bw = Math.min(9, (A.x(2) - A.x(1)) * 0.3);
  ys.forEach((q, i) => {
    [[q.U, C.cyan, -bw / 2 - 0.5], [q.I, C.pink, bw / 2 + 0.5]].forEach(([v, col, dx]) => { ctx.fillStyle = col; ctx.globalAlpha = 0.55; const Y0 = A.y(0), Y1 = A.y(v); ctx.fillRect(A.x(i + 1) + dx - bw / 2, Math.min(Y0, Y1), bw, Math.max(1.5, Math.abs(Y1 - Y0))); });
  });
  ctx.globalAlpha = 1;
  hdash(ctx, A.P.l, A.P.r, A.y(M.SHOP.mean), C.text, 0.45);
  polyline(ctx, mix.map((v, i) => [A.x(i + 1), A.y(v)]), C.text, 2.4);
  mix.forEach((v, i) => dot(ctx, A.x(i + 1), A.y(v), 3, C.text));
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const B = panel(ctx, W, { top: 28, bottom: H - 28, left: 34, xMin: 0, xMax: 100, yMin: 0, yMax: 20, yTicks: [0, 5, 10, 15, 20], xTicks: ticks(0, 100, W - 46, 34, [10, 20, 25, 50]), xLabel: v => fmt(v, 0) + '%', title: t('c1b') });
  const pts = []; for (let i = 0; i <= 100; i++) pts.push([B.x(i), B.y(M.mixSd(i / 100))]);
  polyline(ctx, pts, C.green, 2);
  [...s1.tried].forEach(v => { if (v !== wp) dot(ctx, B.x(v), B.y(M.mixSd(v / 100)), 4, C.text); });
  dot(ctx, B.x(wp), B.y(M.mixSd(w)), 6.5, C.orange);
  $('r1').textContent = t('s1readout', { w: wp, iw: 100 - wp, sd: fmt(M.mixSd(w), 1), sample: fmt(M.stats(mix).sd, 1), worst: sgn(Math.min(...mix), 1) });
}

/* ---------- step 2: correlation ---------- */
const s2 = { tried: new Set([0]) };
const PAIR_SEED = 7;
function draw2() {
  const rho = +num('rho2').toFixed(1), pr = M.pairYears(rho, PAIR_SEED), a = pr.map(q => q.a), b = pr.map(q => q.b), mix = pr.map(q => (q.a + q.b) / 2);
  $('r2v').textContent = fmt(rho, 1);
  let { ctx, W, H } = fitCanvas($('c2'));
  // square plot area, centred horizontally
  const top = 28, bottom = H - 28, side = Math.min(bottom - top, W - 52), left = Math.max(40, (W - side) / 2 + 10);
  const A = panel(ctx, W, { top, bottom, left, right: W - left - side, xMin: -60, xMax: 70, yMin: -60, yMax: 70, yTicks: [-50, 0, 50], xTicks: [-50, 0, 50], xGrid: true, title: t('c2a') });
  pr.forEach(q => { ctx.globalAlpha = 0.85; dot(ctx, A.x(clamp(q.a, -60, 70)), A.y(clamp(q.b, -60, 70)), 3.6, C.text); });
  ctx.globalAlpha = 1;
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 28, bottom: H - 28, left: 34, xMin: -1, xMax: 1, yMin: 0, yMax: 22, yTicks: [0, 5, 10, 15, 20], xTicks: [-1, -0.5, 0, 0.5, 1], title: t('c2b') });
  const pts = []; for (let i = 0; i <= 200; i++) { const r = -1 + i / 100; pts.push([B.x(r), B.y(M.portSd(2, r))]); }
  polyline(ctx, pts, C.green, 2);
  [...s2.tried].forEach(v => { if (Math.abs(v - rho) > 1e-9) dot(ctx, B.x(v), B.y(M.portSd(2, v)), 4, C.text); });
  dot(ctx, B.x(rho), B.y(M.portSd(2, rho)), 6.5, C.orange);
  const note = rho >= 1 - 1e-9 ? t('s2noteOne') : rho <= -1 + 1e-9 ? t('s2noteMinus') : t('s2noteMid');
  $('r2').textContent = t('s2readout', { rho: fmt(rho, 1), sd: fmt(M.portSd(2, rho), 1), sr: fmt(M.corr(a, b), 2), ss: fmt(M.stats(mix).sd, 1), note }).trim();
}

/* ---------- step 3: count is not the point ---------- */
const s3 = { tried: new Set([0.5]) };
function draw3() {
  const n = num('n3'), rho = +num('rho3').toFixed(1);
  $('n3v').textContent = String(n); $('p3v').textContent = fmt(rho, 1);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 1, xMax: 40, yMin: 0, yMax: 22, yTicks: [0, 5, 10, 15, 20], xTicks: [1, 10, 20, 30, 40], title: t('c3a') });
  const curve = (r, col, lw, alpha) => { const pts = []; for (let k = 1; k <= 40; k++) pts.push([A.x(k), A.y(M.portSd(k, r))]); polyline(ctx, pts, col, lw, alpha); };
  [...s3.tried].forEach(r => { if (Math.abs(r - rho) > 1e-9) curve(r, C.raw, 1.4, 0.9); });
  hdash(ctx, A.P.l, A.P.r, A.y(M.floorSd(rho)), C.text, 0.75);
  curve(rho, C.cyan, 2.6, 1);
  for (let k = 1; k <= 40; k++) dot(ctx, A.x(k), A.y(M.portSd(k, rho)), 2.2, C.cyan);
  vguide(ctx, A.x(n), A.P.t, A.P.b);
  dot(ctx, A.x(n), A.y(M.portSd(n, rho)), 6.5, C.orange);
  const sd = M.portSd(n, rho), fl = M.floorSd(rho);
  $('r3').textContent = t('s3readout', { n, rho: fmt(rho, 1), sd: fmt(sd, 1), floor: fmt(fl, 1), gap: fmt(sd - fl, 1), indep: fmt(M.portSd(n, 0), 1) });
}

/* ---------- step 4: the shared part ---------- */
const s4 = { set: 0, world: null, tried: new Set([1]) };
const world = () => s4.world || (s4.world = M.marketWorld(100 + M.SEEDS[s4.set]));
function draw4(prog = '') {
  const n = num('n4'), w = world(), port = w.portfolio(n), one = w.portfolio(1), mk = w.marketPart;
  $('n4v').textContent = String(n);
  let { ctx, W, H } = fitCanvas($('c4'));
  const Y = M.MARKET_YEARS;
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 1, xMax: Y, yMin: -45, yMax: 55, yTicks: [-40, -20, 0, 20, 40], xTicks: ticks(1, Y, W - 52, 28, [5, 10]).filter(v => v >= 1), title: t('c4a') });
  const line = (arr, col, lw, alpha) => polyline(ctx, arr.map((v, i) => [A.x(i + 1), A.y(clamp(v, -45, 55))]), col, lw, alpha);
  line(one, C.raw, 1.6, 0.9); line(mk, C.text, 2.2, 0.9); line(port, C.cyan, 2.6, 1);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0, xMax: M.MAX_N, yMin: 0, yMax: 620, yTicks: [0, 200, 400, 600], xTicks: ticks(1, M.MAX_N, W - 52, 28, [5, 10, 25]).filter(v => v >= 1), title: t('c4b') });
  const sv = M.splitVar(1).shared;
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.55)'; ctx.fillRect(B.x(1), B.y(sv), B.x(M.MAX_N) - B.x(1), B.y(0) - B.y(sv));
  ctx.fillStyle = 'rgba(126,226,168,0.5)'; ctx.beginPath(); ctx.moveTo(B.x(1), B.y(sv));
  for (let k = 1; k <= M.MAX_N; k += 0.25) ctx.lineTo(B.x(k), B.y(sv + M.splitVar(k).own));
  ctx.lineTo(B.x(M.MAX_N), B.y(sv)); ctx.closePath(); ctx.fill(); ctx.restore();
  [...s4.tried].forEach(k => { if (k !== n) dot(ctx, B.x(k), B.y(M.stats(w.portfolio(k)).sd ** 2), 3.2, C.text); });
  vguide(ctx, B.x(n), B.P.t, B.P.b, C.text);
  const sp = M.splitVar(n), tot = sp.shared + sp.own;
  dot(ctx, B.x(n), B.y(tot), 6, C.orange);
  $('r4').textContent = t('s4readout', { prog, n, own: fmt(sp.own, 1), tot: fmt(tot, 1), sd: fmt(Math.sqrt(tot), 1), set: s4.set + 1, ss: fmt(M.stats(port).sd, 1), pw: sgn(Math.min(...port), 1), mw: sgn(Math.min(...mk), 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  $('shopU').addEventListener('click', () => { s0.shop = 'U'; draw0(); });
  $('shopI').addEventListener('click', () => { s0.shop = 'I'; draw0(); });
  $('seed0').addEventListener('click', () => { town.set = (town.set + 1) % M.SEEDS.length; town.years = null; draw0(); draw1(); });
  $('w1').addEventListener('input', () => { s1.tried.add(num('w1')); draw1(); });
  $('rho2').addEventListener('input', () => { s2.tried.add(+num('rho2').toFixed(1)); draw2(); });
  $('n3').addEventListener('input', draw3);
  $('rho3').addEventListener('input', () => { s3.tried.add(+num('rho3').toFixed(1)); draw3(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'c';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  $('n4').addEventListener('input', () => { stopAnim('s4'); s4.tried.add(num('n4')); draw4(); });
  $('grow4').addEventListener('click', () => {
    s4.tried = new Set([1]);
    animate('s4', 5000, p => {
      const n = Math.max(1, Math.round(1 + p * (M.MAX_N - 1)));
      for (let k = 1; k <= n; k++) s4.tried.add(k);
      $('n4').value = n; draw4(n < M.MAX_N ? t('s4progress', { n }) : '');
    });
  });
  $('seed4').addEventListener('click', () => { stopAnim('s4'); s4.set = (s4.set + 1) % M.SEEDS.length; s4.world = null; draw4(); });

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
