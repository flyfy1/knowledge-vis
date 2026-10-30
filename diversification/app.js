/* diversification: pure model -> state -> render. Numbers shown are computed from the model at runtime. */

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

/* Model: toy paths, equal weights, sigma 20%. Pure functions exported for tests. */
const portSigma = rho => 20 * Math.sqrt((1 + rho) / 2);
const totalSigma = n => Math.sqrt(100 + 400 / n);
const randn = r => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * r()); };
const S = { seed0: 5, rho1: 0, mode2: 'apart', n4: 5 };
function drawPath(ctx, L, vals, vmin, vmax, col, lw) {
  const X = i => L.x + i / (vals.length - 1) * L.w, Y = v => L.y + L.h - (v - vmin) / (vmax - vmin) * L.h;
  const pts = vals.map((v, i) => [X(i), Y(v)]);
  curve(ctx, pts, col, lw || 2);
  return { X: X, Y: Y };
}
function frame(ctx, w, h, vmin, vmax) {
  const L = { x: 44, y: 20, w: w - 60, h: h - 56 };
  axes(ctx, L);
  [vmin, 100, vmax].forEach(v => text(ctx, Math.round(v) + '', L.x - 4, L.y + L.h - (v - vmin) / (vmax - vmin) * L.h + 3, { align: 'right', size: 10 }));
  return L;
}
function render0() {
  const { ctx, w, h } = setup($('cv0'));
  const L = frame(ctx, w, h, 40, 180);
  const r = rng(S.seed0), vals = [100];
  for (let i = 0; i < 20; i++) vals.push(vals[vals.length - 1] * (1 + randn(r) * 0.045));
  drawPath(ctx, L, vals, 40, 180, COL.cyan, 2.5);
  dot(ctx, L.x + L.w, L.y + L.h - (vals[vals.length - 1] - 40) / 140 * L.h, 5, COL.cyan);
  $('ro0').textContent = t('s0ro', { end: money(vals[vals.length - 1]) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1'));
  const L = frame(ctx, w, h, 40, 180);
  const rho = S.rho1, r = rng(11), a = [100], b = [100], p = [100];
  for (let i = 0; i < 20; i++) {
    const z1 = randn(r), z2 = randn(r), x1 = z1 * 0.045, x2 = (rho * z1 + Math.sqrt(1 - rho * rho) * z2) * 0.045;
    a.push(a[a.length - 1] * (1 + x1)); b.push(b[b.length - 1] * (1 + x2)); p.push(p[p.length - 1] * (1 + (x1 + x2) / 2));
  }
  drawPath(ctx, L, a, 40, 180, COL.cyan, 1.5);
  drawPath(ctx, L, b, 40, 180, COL.orange, 1.5);
  drawPath(ctx, L, p, 40, 180, COL.green, 3);
  const sp = portSigma(rho);
  const msg = rho === 1 ? t('s1msg1') : (rho === -1 ? t('s1msgNeg') : (rho === 0 ? t('s1msg0') : t('s1msgMid')));
  $('ro1').textContent = t('s1ro', { rho: rho.toFixed(1), sp: f1(sp), msg: msg });
}
function render2() {
  const { ctx, w, h } = setup($('cv2'));
  const L = frame(ctx, w, h, 40, 180);
  const r = rng(23), paths = [], shared = [];
  for (let i = 0; i < 20; i++) shared.push(randn(r));
  for (let k = 0; k < 10; k++) {
    const vals = [100];
    for (let i = 0; i < 20; i++) { const z = S.mode2 === 'tog' ? shared[i] * 0.9 + randn(r) * 0.02 : randn(r); vals.push(vals[vals.length - 1] * (1 + z * 0.045)); }
    paths.push(vals);
    drawPath(ctx, L, vals, 40, 180, k === 0 ? COL.cyan : COL.dim, 1);
  }
  const port = [100];
  for (let i = 0; i < 20; i++) { let s = 0; paths.forEach(p => { s += p[i + 1] / p[i] - 1; }); port.push(port[port.length - 1] * (1 + s / 10)); }
  drawPath(ctx, L, port, 40, 180, COL.green, 3);
  const est = S.mode2 === 'tog' ? 18 : 20 / Math.sqrt(10);
  $('ro2').textContent = t('s2ro', { mode: S.mode2 === 'tog' ? t('s2modeT') : t('s2modeA'), sp: f1(est), msg: S.mode2 === 'tog' ? t('s2msgT') : t('s2msgA') });
}
function render3() {
  const { ctx, w, h } = setup($('cv3'));
  const mid = w / 2;
  const L1 = { x: 16, y: 30, w: mid - 32, h: h - 70 };
  const L2 = { x: mid + 16, y: 30, w: w - mid - 32, h: h - 70 };
  const r = rng(31);
  const avg = [];
  for (let i = 0; i < 20; i++) { let s = 0; for (let k = 0; k < 20; k++) s += (r() < 0.1 ? 1 : 0); avg.push(s / 20); }
  const Y1 = v => L1.y + L1.h - v / 0.4 * L1.h;
  curve(ctx, avg.map((v, i) => [L1.x + i / 19 * L1.w, Y1(v)]), COL.cyan, 2);
  line(ctx, L1.x, Y1(0.1), L1.x + L1.w, Y1(0.1), COL.muted, 1, [4, 4]);
  const r2 = rng(41), a = [100], b = [100], p = [100];
  for (let i = 0; i < 20; i++) { const z1 = randn(r2), z2 = randn(r2); a.push(a[a.length - 1] * (1 + z1 * 0.045)); b.push(b[b.length - 1] * (1 + z2 * 0.045)); p.push(p[p.length - 1] * (1 + (z1 + z2) / 2 * 0.045)); }
  const Y2 = v => L2.y + L2.h - (v - 40) / 140 * L2.h;
  curve(ctx, a.map((v, i) => [L2.x + i / 20 * L2.w, Y2(v)]), COL.cyan, 1.5);
  curve(ctx, b.map((v, i) => [L2.x + i / 20 * L2.w, Y2(v)]), COL.orange, 1.5);
  curve(ctx, p.map((v, i) => [L2.x + i / 20 * L2.w, Y2(v)]), COL.green, 3);
  $('ro3').textContent = t('s3ro');
}
function render4() {
  const { ctx, w, h } = setup($('cv4'));
  const L = { x: 44, y: 20, w: w - 60, h: h - 56 };
  axes(ctx, L);
  const X = n => L.x + (n - 1) / 29 * L.w, Y = v => L.y + L.h - (v - 8) / 24 * L.h;
  const pts = [];
  for (let n = 1; n <= 30; n++) pts.push([X(n), Y(totalSigma(n))]);
  curve(ctx, pts, COL.orange, 2.5);
  line(ctx, L.x, Y(10), L.x + L.w, Y(10), COL.ink, 1.5, [4, 3]);
  text(ctx, t('lblFloor'), L.x + L.w, Y(10) - 8, { align: 'right', size: 11, color: COL.ink });
  dot(ctx, X(S.n4), Y(totalSigma(S.n4)), 5, COL.cyan);
  [1, 10, 20, 30].forEach(n => text(ctx, n + '', X(n), L.y + L.h + 14, { align: 'center', size: 10 }));
  [10, 20, 30].forEach(v => text(ctx, v + '%', L.x - 4, Y(v) + 3, { align: 'right', size: 10 }));
  const idio = 20 / Math.sqrt(S.n4);
  $('ro4').textContent = t('s4ro', { n: S.n4, idio: f1(idio), tot: f1(totalSigma(S.n4)) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5'));
  const L = frame(ctx, w, h, 40, 180);
  const r = rng(51), a = [100], b = [100], p = [100];
  for (let i = 0; i < 20; i++) { const z1 = randn(r), z2 = randn(r); a.push(a[a.length - 1] * (1 + z1 * 0.045)); b.push(b[b.length - 1] * (1 + z2 * 0.045)); p.push(p[p.length - 1] * (1 + (z1 + z2) / 2 * 0.045)); }
  drawPath(ctx, L, a, 40, 180, COL.cyan, 1.5);
  drawPath(ctx, L, b, 40, 180, COL.orange, 1.5);
  drawPath(ctx, L, p, 40, 180, COL.green, 3);
  text(ctx, t('lblPortfolio'), L.x + 6, L.y + 14, { size: 12, color: COL.green });
}
function wire() {
  $('b0again').addEventListener('click', () => { S.seed0 += 11; render0(); });
  $('rho1').addEventListener('input', () => { S.rho1 = +$('rho1').value / 10; $('rho1v').textContent = S.rho1.toFixed(1); render1(); });
  $('b2tog').addEventListener('click', () => { S.mode2 = 'tog'; render2(); });
  $('b2apart').addEventListener('click', () => { S.mode2 = 'apart'; render2(); });
  slider('n4', v => { S.n4 = v; render4(); });
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
if (typeof module !== 'undefined') module.exports = { portSigma, totalSigma };
