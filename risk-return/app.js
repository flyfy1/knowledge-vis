/* risk-return: pure model -> state -> render. Numbers shown are computed from the model at runtime. */

const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', red: '#e0644e', violet: '#b79cff', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', dim: '#1b2d3c' };
const $ = id => document.getElementById(id);
function setup(c) {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const w = Math.max(200, Math.round(c.getBoundingClientRect().width || 300));
  const ratio = (w >= 560 && c.dataset.wide) ? +c.dataset.wide : +c.dataset.ratio;
  const h = Math.round(w * ratio);
  c.style.height = h + 'px';
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (c.width !== bw) c.width = bw;
  if (c.height !== bh) c.height = bh;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h, wide: w >= 560 };
}
function text(ctx, s, x, y, o) { o = o || {}; ctx.fillStyle = o.color || COL.muted; ctx.font = (o.bold ? '600 ' : '') + (o.size || 13) + 'px system-ui,sans-serif'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.fillText(s, x, y); }
function line(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); }
function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
function slider(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value); const o = $(id + 'v'); if (o) o.textContent = e.value; }); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function arrow(ctx, x1, y1, x2, y2, col, lw) { line(ctx, x1, y1, x2, y2, col, lw || 2); const a = Math.atan2(y2 - y1, x2 - x1), s = 6 + (lw || 2) * 1.6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
function curve(ctx, pts, col, lw) { if (!pts.length) return; ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
function axes(ctx, L, col) { line(ctx, L.x, L.y, L.x + L.h, col || COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, col || COL.grid, 1); }
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const TICKERS = [];
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
const money = v => Math.round(v).toLocaleString('en-US');
const f1 = v => (Math.round(v * 10) / 10).toFixed(1);

/* Model: toy uniform distributions. Pure functions exported for tests. */
const uniformVar = w => w * w / 3;
const trialsB = seed => { const r = rng(seed), out = []; for (let i = 0; i < 100; i++) out.push(-10 + r() * 30); return out; };
const S = { pick: 'A', w1: 15, seed2: 7, m3: 5, seed4: 3 };
function hist(ctx, L, vals, bins, col) {
  const counts = bins.map(() => 0);
  vals.forEach(v => { for (let i = 0; i < bins.length; i++) if (v >= bins[i][0] && (i === bins.length - 1 ? v <= bins[i][1] : v < bins[i][1])) { counts[i]++; break; } });
  const max = Math.max.apply(null, counts), bw = L.w / bins.length;
  counts.forEach((c, i) => { ctx.fillStyle = col; ctx.fillRect(L.x + i * bw + 2, L.y + L.h - c / max * L.h, bw - 4, c / max * L.h); text(ctx, c + '', L.x + i * bw + bw / 2, L.y + L.h - c / max * L.h - 4, { align: 'center', size: 10 }); });
  return counts;
}
function render0() {
  const { ctx, w, h } = setup($('cv0'));
  const L = { x: 40, y: 30, w: w - 80, h: h - 70 };
  axes(ctx, L);
  const X = v => L.x + (v + 12) / 34 * L.w;
  line(ctx, X(3), L.y, X(3), L.y + L.h, COL.cyan, 2.5);
  ctx.fillStyle = COL.orange; ctx.fillRect(X(-10), L.y + L.h * 0.4, X(20) - X(-10), 8);
  text(ctx, 'A 3%', X(3) + 6, L.y + 16, { size: 12, color: COL.cyan });
  text(ctx, 'B -10~20', X(-10), L.y + L.h * 0.4 - 8, { size: 12, color: COL.orange });
  $('b0a').classList.toggle('active', S.pick === 'A');
  $('b0b').classList.toggle('active', S.pick === 'B');
  $('ro0').textContent = t('s0ro', { pick: S.pick, desc: S.pick === 'A' ? t('s0descA') : t('s0descB') });
}
function render1() {
  const { ctx, w, h } = setup($('cv1'));
  const L = { x: 40, y: 30, w: w - 80, h: h - 70 };
  axes(ctx, L);
  const X = v => L.x + (v + 30) / 60 * L.w, mean = 5;
  ctx.fillStyle = COL.cyan; ctx.fillRect(X(mean - 2), L.y + L.h * 0.55, X(mean + 2) - X(mean - 2), 8);
  ctx.fillStyle = COL.orange; ctx.fillRect(X(mean - S.w1), L.y + L.h * 0.3, X(mean + S.w1) - X(mean - S.w1), 8);
  line(ctx, X(mean), L.y, X(mean), L.y + L.h, COL.ink, 1, [4, 3]);
  text(ctx, t('lblSteady') + ' ±2', X(mean - 2), L.y + L.h * 0.55 - 6, { size: 11, color: COL.cyan });
  text(ctx, t('lblVolatile') + ' ±' + S.w1, X(mean - S.w1), L.y + L.h * 0.3 - 6, { size: 11, color: COL.orange });
  $('ro1').textContent = t('s1ro', { w: S.w1, v: f1(uniformVar(S.w1)) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2'));
  const vals = trialsB(S.seed2);
  const L = { x: 40, y: 30, w: w - 80, h: h - 70 };
  axes(ctx, L);
  const bins = [[-10, -5], [-5, 0], [0, 5], [5, 10], [10, 15], [15, 20.1]];
  hist(ctx, L, vals, bins, COL.orange);
  const neg = vals.filter(v => v < 0).length, pos = vals.filter(v => v > 3).length;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  $('ro2').textContent = t('s2ro', { neg: neg, pos: pos, mean: f1(mean) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3'));
  const L = { x: 40, y: 40, w: w - 80, h: h - 80 };
  const bw = L.w / 2 - 20;
  const Y = v => L.y + L.h - v / 12 * L.h;
  ctx.fillStyle = COL.cyan; ctx.fillRect(L.x, Y(3), bw, L.y + L.h - Y(3));
  ctx.fillStyle = COL.orange; ctx.fillRect(L.x + bw + 40, Y(S.m3), bw, L.y + L.h - Y(S.m3));
  text(ctx, 'A 3%', L.x + bw / 2, Y(3) - 6, { align: 'center', size: 12, color: COL.cyan });
  text(ctx, 'B ' + S.m3 + '%', L.x + bw + 40 + bw / 2, Y(S.m3) - 6, { align: 'center', size: 12, color: COL.orange });
  text(ctx, t('lblPremium') + ' ' + (S.m3 - 3) + '%', L.x + bw + 40 + bw / 2, Y(3) + 30, { align: 'center', size: 12, color: COL.green });
  $('ro3').textContent = t('s3ro', { m: S.m3, p: S.m3 - 3 });
}
function render4() {
  const { ctx, w, h } = setup($('cv4'));
  const r = rng(S.seed4), vals = [];
  for (let i = 0; i < 10; i++) vals.push(-10 + r() * 30);
  const L = { x: 40, y: 30, w: w - 80, h: h - 70 };
  axes(ctx, L);
  const X = i => L.x + i / 10 * L.w, Y = v => L.y + L.h - (v + 12) / 34 * L.h;
  line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.muted, 1, [4, 4]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  line(ctx, L.x, Y(mean), L.x + L.w, Y(mean), COL.ink, 1, [4, 3]);
  const bw = L.w / 10;
  vals.forEach((v, i) => { ctx.fillStyle = v < 0 ? COL.red : COL.green; ctx.fillRect(X(i) + 3, Math.min(Y(0), Y(v)), bw - 6, Math.abs(Y(v) - Y(0))); });
  text(ctx, t('lblLoss'), L.x, L.y + L.h + 28, { size: 11, color: COL.red });
  text(ctx, t('lblGain'), L.x + 90, L.y + L.h + 28, { size: 11, color: COL.green });
  $('ro4').textContent = t('s4ro', { neg: vals.filter(v => v < 0).length, mean: f1(mean) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5'));
  const L = { x: 40, y: 40, w: w - 80, h: h - 80 };
  const bw = L.w / 2 - 20;
  const Y = v => L.y + L.h - (v + 12) / 34 * L.h;
  dot(ctx, L.x + bw / 2, Y(3), 6, COL.cyan);
  ctx.fillStyle = COL.orange; ctx.fillRect(L.x + bw + 40, Y(20), bw, Y(-10) - Y(20));
  text(ctx, 'A 3%', L.x + bw / 2, Y(3) - 10, { align: 'center', size: 12, color: COL.cyan });
  text(ctx, 'B -10~20', L.x + bw + 40 + bw / 2, Y(20) - 8, { align: 'center', size: 12, color: COL.orange });
}
function wire() {
  $('b0a').addEventListener('click', () => { S.pick = 'A'; render0(); });
  $('b0b').addEventListener('click', () => { S.pick = 'B'; render0(); });
  slider('w1', v => { S.w1 = v; render1(); });
  $('b2again').addEventListener('click', () => { S.seed2 += 13; render2(); });
  slider('m3', v => { S.m3 = v; render3(); });
  $('b4again').addEventListener('click', () => { S.seed4 += 7; render4(); });
}
const RENDERS = [render0, render1, render2, render3, render4, render5];
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();
if (typeof module !== 'undefined') module.exports = { uniformVar, trialsB };
