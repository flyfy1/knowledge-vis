'use strict';
// Hypothesis-testing lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.HT_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.HT_MODEL;
const t = (...a) => window.HT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const pct = (v, d = 1) => fmt(100 * v, d) + '%';

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
// One line of canvas text that shrinks (never squeezes) until it fits maxW.
function label(ctx, text, X, Y, maxW, { size = 12, color = C.text, weight = 600, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceTicks(lo, hi, maxN) {
  const span = hi - lo || 1, raw = span / Math.max(1, maxN), p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw) || 10 * p;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9 * step; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}
// A plot panel: title row above, y ticks left, x ticks below. xLog uses log10 positions.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const lx = v => (o.xLog ? Math.log10(v) : v), L0 = lx(o.xMin), L1 = lx(o.xMax);
  const x = v => P.l + (lx(v) - L0) / (L1 - L0) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yf = o.yFmt || (v => fmt(v));
  for (const v of o.yTicks) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yf(v), P.l - 5, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  if (o.xTicks) {
    const xf = o.xFmt || (v => fmt(v)); ctx.textAlign = 'center';
    // drop ticks whose labels would touch the previous one
    let lastR = -Infinity;
    for (const v of o.xTicks) {
      const X = x(v), s = xf(v), w = ctx.measureText(s).width;
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
      const cx = Math.min(Math.max(X, P.l - 4 + w / 2), W - 2 - w / 2);
      if (cx - w / 2 < lastR + 6) continue;
      ctx.fillText(s, cx, P.b + 15); lastR = cx + w / 2;
    }
  }
  ctx.restore();
  if (o.title) label(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function vline(ctx, X, y0, y1, color, dash = [4, 4], lw = 1.4, alpha = 0.85) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) { vlineH(ctx, m.P.l, m.P.r, m.y(v), color, dash); }
function vlineH(ctx, x0, x1, Y, color, dash) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }
function tri(ctx, X, Y, s, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - s, Y + s * 1.5); ctx.lineTo(X + s, Y + s * 1.5); ctx.closePath(); ctx.fill(); ctx.restore(); }
/* ---------- shared animation runner (reduced motion, hidden pages) ---------- */
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

/* ---------- step 0: the p-value ---------- */
function syncK0() { const n = num('n0'), k = $('k0'); k.max = String(n); if (num('k0') > n) k.value = String(n); }
function bars(ctx, A, P, color, n) {
  const bw = Math.max(1, Math.min(22, (A.x(1) - A.x(0)) * 0.78));
  P.forEach((v, j) => { const c = color(j); if (!c) return; ctx.fillStyle = c; ctx.fillRect(A.x(j) - bw / 2, A.y(v), bw, A.y(0) - A.y(v)); });
  void n;
}
function xTicksFor(n, W) { return niceTicks(0, n, Math.max(4, Math.floor(W / 60))).filter(v => Number.isInteger(v)); }
function draw0() {
  syncK0();
  const n = num('n0'), k = num('k0'), P = M.pmf(n, 0.5), d = M.dist(n, k), p = M.pValue(n, k);
  $('n0v').textContent = String(n); $('k0v').textContent = String(k);
  const { ctx, W, H } = fitCanvas($('c0'));
  const top = Math.max(...P) * 1.18;
  const A = panel(ctx, W, { top: 36, bottom: H - 46, xMin: -0.6, xMax: n + 0.6, yMin: 0, yMax: top, yTicks: niceTicks(0, top, 3), yFmt: v => fmt(v, 2), xTicks: xTicksFor(n, W), title: t('c0title', { n }) });
  bars(ctx, A, P, j => (M.dist(n, j) >= d ? C.pink : C.cyan));
  tri(ctx, A.x(k), A.P.b + 22, 6, C.text);
  vline(ctx, A.x(n / 2), A.P.t, A.P.b, C.ghost, [3, 4], 1.2);
  const lo = Math.floor((n - d) / 2), hi = Math.ceil((n + d) / 2);
  const set = d === 0 ? t('s0all') : t('s0set', { lo, hi });
  const verdict = p <= 0.05 ? t('s0rare') : t('s0notRare');
  $('r0').textContent = t('s0readout', { n, k, half: fmt(n / 2, 1), dev: fmt(d / 2, 1), set, p: fmt(p, 4), verdict });
}

/* ---------- step 1: many experiments ---------- */
const N1 = 50, MAX1 = 20000;
const s1 = { seed: 1, ps: [], counts: new Array(20).fill(0) };
function reset1() { s1.rnd = M.rng(s1.seed); s1.ps = []; s1.counts = new Array(20).fill(0); s1.low = 0; }
function draw1() {
  const q = num('q1'), exact = M.pBins(N1, q), n = s1.ps.length;
  $('q1v').textContent = fmt(q, 2);
  const { ctx, W, H } = fitCanvas($('c1'));
  const shares = s1.counts.map(c => (n ? c / n : 0));
  const top = Math.max(0.1, ...exact, ...shares) * 1.12;
  const A = panel(ctx, W, { top: 36, bottom: H - 28, xMin: 0, xMax: 1, yMin: 0, yMax: top, yTicks: niceTicks(0, top, 4), yFmt: v => fmt(v, 2), xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], title: t('c1title', { n: N1 }) });
  const bw = (A.x(0.05) - A.x(0)) * 0.84;
  shares.forEach((v, i) => { if (!v) return; ctx.fillStyle = i === 0 ? C.pink : C.cyan; ctx.fillRect(A.x(i * 0.05 + 0.025) - bw / 2, A.y(v), bw, A.y(0) - A.y(v)); });
  exact.forEach((v, i) => { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(A.x(i * 0.05) + 2, A.y(v)); ctx.lineTo(A.x(i * 0.05 + 0.05) - 2, A.y(v)); ctx.stroke(); ctx.restore(); });
  ['run100', 'run1000'].forEach((id, i) => { $(id).disabled = n + [100, 1000][i] > MAX1; });
  const ex = M.shareBelow(N1, q, 0.05);
  const truth = Math.abs(q - 0.5) < 1e-9 ? t('s1h0') : t('s1h1', { q: fmt(q, 2) });
  if (!n) { $('r1').textContent = t('s1empty', { truth, ex: pct(ex, 1) }); return; }
  $('r1').textContent = t('s1readout', { truth, n: n.toLocaleString('en-US'), N: MAX1.toLocaleString('en-US'), low: s1.low, share: pct(s1.low / n, 1), ex: pct(ex, 1) });
}
function run1(m) {
  const q = num('q1'), start = s1.ps.length, target = Math.min(MAX1, start + m);
  animate('s1', m >= 1000 ? 1400 : 700, pr => {
    const want = Math.round(start + (target - start) * pr);
    while (s1.ps.length < want) { const p = M.pValue(N1, M.flips(N1, q, s1.rnd)); s1.ps.push(p); s1.counts[Math.max(0, Math.min(19, Math.floor(p * 20 - 1e-9)))]++; if (p <= 0.05 + 1e-12) s1.low++; }
    draw1();
  });
}

/* ---------- step 2: α and the rejection region ---------- */
function draw2() {
  const a = num('a2') / 100, n = num('n2'), P = M.pmf(n, 0.5), R = M.region(n, a), s = M.size(n, a);
  $('a2v').textContent = pct(a, 0); $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  const top = Math.max(...P) * 1.18;
  const A = panel(ctx, W, { top: 36, bottom: H - 28, xMin: -0.6, xMax: n + 0.6, yMin: 0, yMax: top, yTicks: niceTicks(0, top, 3), yFmt: v => fmt(v, 2), xTicks: xTicksFor(n, W), title: t('c2title', { n }) });
  bars(ctx, A, P, j => (M.dist(n, j) >= R.d ? C.pink : C.cyan));
  if (R.d <= n) { vline(ctx, A.x(R.lo + 0.5), A.P.t, A.P.b, C.orange, [4, 3], 1.6, 1); vline(ctx, A.x(R.hi - 0.5), A.P.t, A.P.b, C.orange, [4, 3], 1.6, 1); }
  const reg = R.d <= n ? t('s2region', { lo: R.lo, hi: R.hi }) : t('s2never');
  $('r2').textContent = t('s2readout', { a: pct(a, 0), n, reg, s: pct(s, 2), gap: pct(a - s, 2) });
}

/* ---------- step 3: power ---------- */
const A3 = [0.01, 0.05, 0.1];
function draw3() {
  const q = num('q3'), n = num('n3'), a = A3[num('a3')], R = M.region(n, a), P0 = M.pmf(n, 0.5), Pq = M.pmf(n, q);
  const pw = M.power(n, q, a), s = M.size(n, a);
  $('q3v').textContent = fmt(q, 2); $('n3v').textContent = String(n); $('a3v').textContent = pct(a, 0);
  const { ctx, W, H } = fitCanvas($('c3'));
  const top = Math.max(...P0, ...Pq) * 1.15, mid = Math.round(H / 2);
  const inR = j => M.dist(n, j) >= R.d;
  const A = panel(ctx, W, { top: 36, bottom: mid - 24, xMin: -0.6, xMax: n + 0.6, yMin: 0, yMax: top, yTicks: niceTicks(0, top, 2), yFmt: v => fmt(v, 2), xTicks: xTicksFor(n, W), title: t('c3a') });
  bars(ctx, A, P0, j => (inR(j) ? C.pink : C.ghost));
  const B = panel(ctx, W, { top: mid + 30, bottom: H - 28, xMin: -0.6, xMax: n + 0.6, yMin: 0, yMax: top, yTicks: niceTicks(0, top, 2), yFmt: v => fmt(v, 2), xTicks: xTicksFor(n, W), title: t('c3b', { q: fmt(q, 2) }) });
  bars(ctx, B, Pq, j => (inR(j) ? C.green : C.violet));
  // region edges drawn inside each panel only, so they never cross the lower panel's title
  if (R.d <= n) [R.lo + 0.5, R.hi - 0.5].forEach(v => { vline(ctx, A.x(v), A.P.t, A.P.b, C.orange, [4, 3], 1.4, 0.9); vline(ctx, B.x(v), B.P.t, B.P.b, C.orange, [4, 3], 1.4, 0.9); });
  $('r3').textContent = t('s3readout', { n, a: pct(a, 0), q: fmt(q, 2), s: pct(s, 2), pw: pct(pw, 1), b: pct(1 - pw, 1) });
}

/* ---------- step 4: sample size ---------- */
const NMIN4 = 10, NMAX4 = 300;
function draw4() {
  const q = num('q4'), a = A3[num('a4')], n = num('n4');
  $('q4v').textContent = fmt(q, 2); $('a4v').textContent = pct(a, 0); $('n4v').textContent = String(n);
  const curve = M.powerCurve(q, a, NMIN4, NMAX4), need = M.minN(q, a, 0.8, NMIN4, NMAX4), apx = M.approxN(q, a, 0.8);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 42, bottom: H - 28, xMin: 0, xMax: NMAX4, yMin: 0, yMax: 1, yTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], xTicks: niceTicks(0, NMAX4, Math.max(4, Math.floor(W / 60))), title: t('c4title', { q: fmt(q, 2), a: pct(a, 0) }) });
  hline(ctx, A, 0.8, C.green, [5, 4]);
  if (apx <= NMAX4) vline(ctx, A.x(apx), A.P.t, A.P.b, C.ghost, [2, 4], 1.4, 0.9);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.6; ctx.beginPath();
  curve.forEach((c, i) => { const X = A.x(c.n), Y = A.y(c.pw); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
  if (need) { ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(A.x(need), A.y(M.power(need, q, a)), 5, 0, 7); ctx.fill(); }
  const pw = M.power(n, q, a);
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(n), A.y(pw), 5.5, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke();
  vline(ctx, A.x(n), A.y(pw), A.P.b, C.text, [2, 3], 1, 0.6);
  let dips = '';
  if (need) { const after = curve.filter(c => c.n > need && c.pw < 0.8).map(c => c.n); dips = after.length ? t('s4dips', { first: after[0], cnt: after.length }) : t('s4nodips'); }
  const needTxt = need ? t('s4need', { need, apx: fmt(apx, 1) }) : t('s4none', { max: NMAX4, apx: fmt(apx, 0) });
  $('r4').textContent = t('s4readout', { n, pw: pct(pw, 1), need: needTxt, dips });
}

/* ---------- step 5: how many of the convicted coins are innocent ---------- */
const COUNT5 = 1000, ALPHA5 = 0.05;
const s5 = { seed: 3 };
function draw5() {
  const pi = num('pi5') / 100, q = num('q5'), n = num('n5');
  $('pi5v').textContent = pct(pi, 0); $('q5v').textContent = fmt(q, 2); $('n5v').textContent = String(n);
  const b = M.batch(COUNT5, pi, n, q, ALPHA5, M.rng(s5.seed)), v = M.verdicts(pi, n, q, ALPHA5);
  const { ctx, W, H } = fitCanvas($('c5'));
  label(ctx, t('c5title'), 8, 18, W - 16);
  const cols = W >= 560 ? 50 : 25, rows = COUNT5 / cols, sp = Math.min((W - 24) / cols, (H - 40) / rows), r = Math.max(1.6, sp * 0.36);
  const x0 = (W - cols * sp) / 2 + sp / 2, y0 = 32 + sp / 2;
  const order = [['fairAcq', C.raw], ['fairConv', C.pink], ['biasConv', C.green], ['biasAcq', C.violet]];
  let i = 0;
  order.forEach(([key, col]) => { for (let c = 0; c < b[key]; c++, i++) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0 + (i % cols) * sp, y0 + Math.floor(i / cols) * sp, r, 0, 7); ctx.fill(); } });
  $('lg5').innerHTML = order.map(([key, col]) => `<span class="lg"><span class="sw" style="background:${col}"></span><span>${t('lg5_' + key, { c: b[key] })}</span></span>`).join('');
  const conv = b.fairConv + b.biasConv, share = conv ? b.fairConv / conv : 0;
  const fw = M.familyWise(Math.round((1 - pi) * COUNT5), n, ALPHA5);
  $('r5').textContent = t('s5readout', { conv, wrong: b.fairConv, share: conv ? pct(share, 1) : '—', fdr: v.convicted > 0 ? pct(v.fdr, 1) : '—', s: pct(v.size, 2), pw: pct(v.power, 1), fair: COUNT5 - Math.round(pi * COUNT5), fw: fw > 0.9995 ? '> 99.9%' : pct(fw, 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['n0', 'k0'].forEach(id => $(id).addEventListener('input', draw0));
  reset1();
  $('q1').addEventListener('input', () => { stopAnim('s1'); reset1(); draw1(); });
  $('run100').addEventListener('click', () => run1(100));
  $('run1000').addEventListener('click', () => run1(1000));
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.seed++; reset1(); draw1(); });
  ['a2', 'n2'].forEach(id => $(id).addEventListener('input', draw2));
  ['q3', 'n3', 'a3'].forEach(id => $(id).addEventListener('input', draw3));
  ['q4', 'a4', 'n4'].forEach(id => $(id).addEventListener('input', draw4));
  ['pi5', 'q5', 'n5'].forEach(id => $(id).addEventListener('input', draw5));
  $('new5').addEventListener('click', () => { s5.seed++; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshHypothesis = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
