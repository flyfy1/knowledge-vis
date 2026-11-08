/* interest-rates-bonds: pure model -> state -> render. Numbers shown are computed from the model at runtime. */

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

/* Model: PV = FV/(1+r)^t; bond PV = sum of discounted coupons + principal. Pure functions exported. */
const pv = (fv, r, t) => fv / Math.pow(1 + r, t);
const bondPV = (coupon, years, principal, r) => { let s = 0; for (let k = 1; k <= years; k++) s += coupon / Math.pow(1 + r, k); return s + principal / Math.pow(1 + r, years); };
const S = { r1: 5, t1: 5, r2: 5, r3: 8, r4: 5 };
function render0() {
  const { ctx, w, h } = setup($('cv0'));
  const L = { x: 44, y: 30, w: w - 60, h: h - 70 };
  axes(ctx, L);
  const bw = L.w / 5;
  for (let k = 1; k <= 5; k++) {
    const v = k === 5 ? 1050 : 50, top = 1050;
    ctx.fillStyle = COL.orange; ctx.fillRect(L.x + (k - 1) * bw + 8, L.y + L.h - v / top * L.h, bw - 16, v / top * L.h);
    text(ctx, money(v), L.x + (k - 0.5) * bw, L.y + L.h - v / top * L.h - 6, { align: 'center', size: 11, color: COL.orange });
    text(ctx, k + '', L.x + (k - 0.5) * bw, L.y + L.h + 14, { align: 'center', size: 10 });
  }
  text(ctx, t('lblCoupon') + ' 50', L.x, L.y + L.h + 30, { size: 11, color: COL.orange });
  text(ctx, t('lblPrincipal') + ' 1000', L.x + 120, L.y + L.h + 30, { size: 11, color: COL.cyan });
  $('ro0').textContent = t('s0ro');
}
function render1() {
  const { ctx, w, h } = setup($('cv1'));
  const r = S.r1 / 100;
  const L = { x: 52, y: 20, w: w - 68, h: h - 56 };
  axes(ctx, L);
  const X = tt => L.x + tt / 10 * L.w, Y = v => L.y + L.h - v / 1000 * L.h;
  const pts = [];
  for (let tt = 0; tt <= 10; tt += 0.25) pts.push([X(tt), Y(pv(1000, r, tt))]);
  curve(ctx, pts, COL.orange, 2.5);
  line(ctx, X(S.t1), L.y, X(S.t1), L.y + L.h, COL.ink, 1.5, [4, 3]);
  dot(ctx, X(S.t1), Y(pv(1000, r, S.t1)), 5, COL.cyan);
  [0, 5, 10].forEach(tt => text(ctx, tt + '', X(tt), L.y + L.h + 14, { align: 'center', size: 10 }));
  $('ro1').textContent = t('s1ro', { t: S.t1, r: S.r1, pv: money(pv(1000, r, S.t1)) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2'));
  const L = { x: 52, y: 20, w: w - 68, h: h - 56 };
  axes(ctx, L);
  const X = r => L.x + (r - 1) / 9 * L.w, Y = v => L.y + L.h - (v - 600) / 600 * L.h;
  const pts = [];
  for (let r = 1; r <= 10; r += 0.25) pts.push([X(r), Y(bondPV(50, 5, 1000, r / 100))]);
  curve(ctx, pts, COL.orange, 2.5);
  const r = S.r2 / 100, v = bondPV(50, 5, 1000, r);
  line(ctx, X(S.r2), L.y, X(S.r2), L.y + L.h, COL.ink, 1.5, [4, 3]);
  dot(ctx, X(S.r2), Y(v), 5, COL.cyan);
  [1, 5, 10].forEach(rr => text(ctx, rr + '%', X(rr), L.y + L.h + 14, { align: 'center', size: 10 }));
  text(ctx, t('lblBondPV'), L.x + 6, L.y + 12, { size: 11, color: COL.orange });
  $('ro2').textContent = t('s2ro', { r: S.r2, pv: money(v) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3'));
  const r = S.r3 / 100, old = bondPV(50, 5, 1000, r);
  const L = { x: 52, y: 30, w: w - 68, h: h - 70 };
  axes(ctx, L);
  const bw = L.w / 2 - 20, Y = v => L.y + L.h - v / 1100 * L.h;
  ctx.fillStyle = COL.orange; ctx.fillRect(L.x, Y(old), bw, L.y + L.h - Y(old));
  ctx.fillStyle = COL.cyan; ctx.fillRect(L.x + bw + 40, Y(1000), bw, L.y + L.h - Y(1000));
  text(ctx, money(Math.round(old)), L.x + bw / 2, Y(old) - 6, { align: 'center', size: 12, color: COL.orange });
  text(ctx, '1000', L.x + bw + 40 + bw / 2, Y(1000) - 6, { align: 'center', size: 12, color: COL.cyan });
  text(ctx, t('lblOldBond'), L.x + bw / 2, L.y + L.h + 16, { align: 'center', size: 11, color: COL.orange });
  text(ctx, t('lblNewBond'), L.x + bw + 40 + bw / 2, L.y + L.h + 16, { align: 'center', size: 11, color: COL.cyan });
  $('ro3').textContent = t('s3ro', { r: S.r3, p: money(Math.round(old)) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4'));
  const L = { x: 52, y: 20, w: w - 68, h: h - 56 };
  axes(ctx, L);
  const X = r => L.x + (r - 1) / 9 * L.w, Y = v => L.y + L.h - (v - 500) / 700 * L.h;
  const p2 = [], p10 = [];
  for (let r = 1; r <= 10; r += 0.25) { p2.push([X(r), Y(bondPV(50, 2, 1000, r / 100))]); p10.push([X(r), Y(bondPV(50, 10, 1000, r / 100))]); }
  curve(ctx, p2, COL.cyan, 2.5); curve(ctx, p10, COL.orange, 2.5);
  const r = S.r4 / 100, v2 = bondPV(50, 2, 1000, r), v10 = bondPV(50, 10, 1000, r);
  line(ctx, X(S.r4), L.y, X(S.r4), L.y + L.h, COL.ink, 1.5, [4, 3]);
  dot(ctx, X(S.r4), Y(v2), 5, COL.cyan); dot(ctx, X(S.r4), Y(v10), 5, COL.orange);
  text(ctx, t('lblShort'), X(10) - 4, Y(bondPV(50, 2, 1000, 0.10)) - 8, { align: 'right', size: 11, color: COL.cyan });
  text(ctx, t('lblLong'), X(10) - 4, Y(bondPV(50, 10, 1000, 0.10)) + 18, { align: 'right', size: 11, color: COL.orange });
  [1, 5, 10].forEach(rr => text(ctx, rr + '%', X(rr), L.y + L.h + 14, { align: 'center', size: 10 }));
  const d2 = f1((v2 - 1000) / 1000 * 100), d10 = f1((v10 - 1000) / 1000 * 100);
  $('ro4').textContent = t('s4ro', { r: S.r4, p2: money(Math.round(v2)), d2: (d2 > 0 ? '+' : '') + d2, p10: money(Math.round(v10)), d10: (d10 > 0 ? '+' : '') + d10 });
}
function render5() {
  const { ctx, w, h } = setup($('cv5'));
  const L = { x: 52, y: 20, w: w - 68, h: h - 56 };
  axes(ctx, L);
  const X = r => L.x + (r - 1) / 9 * L.w, Y = v => L.y + L.h - (v - 600) / 600 * L.h;
  const pts = [];
  for (let r = 1; r <= 10; r += 0.25) pts.push([X(r), Y(bondPV(50, 5, 1000, r / 100))]);
  curve(ctx, pts, COL.orange, 2.5);
  line(ctx, X(5), L.y, X(5), L.y + L.h, COL.ink, 1.5, [4, 3]);
  dot(ctx, X(5), Y(1000), 5, COL.cyan);
  text(ctx, t('lblBondPV'), L.x + 6, L.y + 12, { size: 11, color: COL.orange });
}
function wire() {
  slider('r1', v => { S.r1 = v; render1(); }); slider('t1', v => { S.t1 = v; render1(); });
  slider('r2', v => { S.r2 = v; render2(); });
  slider('r3', v => { S.r3 = v; render3(); });
  slider('r4', v => { S.r4 = v; render4(); });
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
if (typeof module !== 'undefined') module.exports = { pv, bondPV };
