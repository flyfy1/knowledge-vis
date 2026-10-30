/* fees-compounding: pure model -> state -> render. Numbers shown are computed from the model at runtime. */

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
function slider10(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value / 10); const o = $(id + 'v'); if (o) o.textContent = (e.value / 10).toFixed(1); }); }
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

/* Model: A = P(1+r)^t, fee turns r into r-f. Pure functions exported for tests. */
const amt = (P, r, t) => P * Math.pow(1 + r, t);
const feeAmt = (P, r, f, t) => P * Math.pow(1 + r - f, t);
const gapPct = (r, f, t) => (1 - Math.pow((1 + r - f) / (1 + r), t)) * 100;
const S = { guess: null, r1: 5, f1: 1, y2: 30, f2: 1, a3: 100000, f4: 1 };
function bars(ctx, L, vals, cols) {
  const max = Math.max.apply(null, vals), bw = L.w / vals.length;
  vals.forEach((v, i) => { ctx.fillStyle = cols[i]; ctx.fillRect(L.x + i * bw + 8, L.y + L.h - v / max * L.h, bw - 16, v / max * L.h); text(ctx, money(v), L.x + i * bw + bw / 2, L.y + L.h - v / max * L.h - 6, { align: 'center', size: 11, color: cols[i] }); });
}
function render0() {
  const { ctx, w, h } = setup($('cv0'));
  const nf = amt(10000, 0.05, 30), ff = feeAmt(10000, 0.05, 0.01, 30);
  const L = { x: 40, y: 30, w: w - 80, h: h - 70 };
  axes(ctx, L);
  const max = Math.max(nf, ff), bw = L.w / 2;
  ctx.fillStyle = COL.cyan; ctx.fillRect(L.x + 8, L.y + L.h - nf / max * L.h, bw - 16, nf / max * L.h);
  ctx.fillStyle = COL.orange; ctx.fillRect(L.x + bw + 8, L.y + L.h - ff / max * L.h, bw - 16, ff / max * L.h);
  if (S.guess !== null) {
    text(ctx, money(nf), L.x + bw / 2, L.y + L.h - nf / max * L.h - 6, { align: 'center', size: 11, color: COL.cyan });
    text(ctx, money(ff), L.x + bw + bw / 2, L.y + L.h - ff / max * L.h - 6, { align: 'center', size: 11, color: COL.orange });
  }
  text(ctx, t('lblNoFee'), L.x + L.w / 4, L.y + L.h + 16, { align: 'center', size: 11, color: COL.cyan });
  text(ctx, t('lblWithFee') + ' 1%', L.x + L.w * 3 / 4, L.y + L.h + 16, { align: 'center', size: 11, color: COL.orange });
  ['g0', 'g1', 'g2'].forEach((id, i) => $(id).classList.toggle('active', S.guess === i));
  if (S.guess === null) $('ro0').textContent = '';
  else $('ro0').textContent = t('s0ro', { nf: money(nf), ff: money(ff), gap: money(nf - ff), pct: f1((nf - ff) / nf * 100), verdict: S.guess === 2 ? t('s0vRight') : t('s0vWrong') });
}
function render1() {
  const { ctx, w, h } = setup($('cv1'));
  const r = S.r1 / 100, f = S.f1 / 100, T = 30;
  const L = { x: 52, y: 20, w: w - 68, h: h - 56 };
  axes(ctx, L);
  const ymax = amt(10000, r, T) * 1.05;
  const X = tt => L.x + tt / T * L.w, Y = v => L.y + L.h - v / ymax * L.h;
  const p1 = [], p2 = [];
  for (let tt = 0; tt <= T; tt += 0.5) { p1.push([X(tt), Y(amt(10000, r, tt))]); p2.push([X(tt), Y(feeAmt(10000, r, f, tt))]); }
  curve(ctx, p1, COL.cyan, 2.5); curve(ctx, p2, COL.orange, 2.5);
  text(ctx, t('lblNoFee'), X(T) - 4, Y(amt(10000, r, T)) - 8, { align: 'right', size: 11, color: COL.cyan });
  text(ctx, t('lblWithFee'), X(T) - 4, Y(feeAmt(10000, r, f, T)) + 18, { align: 'right', size: 11, color: COL.orange });
  [0, 10, 20, 30].forEach(tt => text(ctx, tt + '', X(tt), L.y + L.h + 14, { align: 'center', size: 10 }));
  const nf = amt(10000, r, T), ff = feeAmt(10000, r, f, T);
  $('ro1').textContent = t('s1ro', { r: S.r1, f: S.f1, nf: money(nf), ff: money(ff), gap: money(nf - ff), pct: f1((nf - ff) / nf * 100) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2'));
  const r = 0.05, f = S.f2 / 100, T = 40;
  const L = { x: 52, y: 20, w: w - 68, h: h - 56 };
  axes(ctx, L);
  const ymax = amt(10000, r, T) - feeAmt(10000, r, f, T);
  const X = tt => L.x + tt / T * L.w, Y = v => L.y + L.h - v / (ymax * 1.05) * L.h;
  const pts = [];
  for (let tt = 0; tt <= T; tt++) pts.push([X(tt), Y(amt(10000, r, tt) - feeAmt(10000, r, f, tt))]);
  curve(ctx, pts, COL.orange, 2.5);
  line(ctx, X(S.y2), L.y, X(S.y2), L.y + L.h, COL.ink, 1.5, [4, 3]);
  dot(ctx, X(S.y2), Y(amt(10000, r, S.y2) - feeAmt(10000, r, f, S.y2)), 5, COL.cyan);
  [0, 10, 20, 30, 40].forEach(tt => text(ctx, tt + '', X(tt), L.y + L.h + 14, { align: 'center', size: 10 }));
  text(ctx, t('lblGap'), L.x + 6, L.y + 12, { size: 11, color: COL.orange });
  const nf = amt(10000, r, S.y2), ff = feeAmt(10000, r, f, S.y2);
  $('ro2').textContent = t('s2ro', { f: S.f2, t: S.y2, nf: money(nf), ff: money(ff), gap: money(nf - ff), pct: f1((nf - ff) / nf * 100) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3'));
  const L = { x: 52, y: 30, w: w - 68, h: h - 70 };
  axes(ctx, L);
  const fee = S.a3 * 0.01;
  const max = 500000 * 0.01;
  ctx.fillStyle = COL.orange; ctx.fillRect(L.x, L.y + L.h - fee / max * L.h, L.w / 2, fee / max * L.h);
  text(ctx, money(fee), L.x + L.w / 4, L.y + L.h - fee / max * L.h - 6, { align: 'center', size: 12, color: COL.orange });
  text(ctx, t('lblYearFee'), L.x + L.w / 4, L.y + L.h + 16, { align: 'center', size: 11, color: COL.orange });
  $('ro3').textContent = t('s3ro', { a: money(S.a3), fee: money(fee) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4'));
  const L = { x: 52, y: 20, w: w - 68, h: h - 56 };
  axes(ctx, L);
  const X = f => L.x + f / 2 * L.w, Y = g => L.y + L.h - g / 50 * L.h;
  const pts = [];
  for (let f = 0; f <= 2; f += 0.1) pts.push([X(f), Y(gapPct(0.05, f / 100, 30))]);
  curve(ctx, pts, COL.orange, 2.5);
  line(ctx, X(S.f4), L.y, X(S.f4), L.y + L.h, COL.ink, 1.5, [4, 3]);
  dot(ctx, X(S.f4), Y(gapPct(0.05, S.f4 / 100, 30)), 5, COL.cyan);
  [0, 0.5, 1, 1.5, 2].forEach(f => text(ctx, f.toFixed(1) + '%', X(f), L.y + L.h + 14, { align: 'center', size: 10 }));
  [0, 25, 50].forEach(g => text(ctx, g + '%', L.x - 4, Y(g) + 3, { align: 'right', size: 10 }));
  $('ro4').textContent = t('s4ro', { f: S.f4.toFixed(1), g: f1(gapPct(0.05, S.f4 / 100, 30)) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5'));
  const nf = amt(10000, 0.05, 30), ff = feeAmt(10000, 0.05, 0.01, 30);
  const L = { x: 40, y: 30, w: w - 80, h: h - 70 };
  axes(ctx, L);
  bars(ctx, L, [nf, ff], [COL.cyan, COL.orange]);
  text(ctx, t('lblNoFee'), L.x + L.w / 4, L.y + L.h + 16, { align: 'center', size: 11, color: COL.cyan });
  text(ctx, t('lblWithFee') + ' 1%', L.x + L.w * 3 / 4, L.y + L.h + 16, { align: 'center', size: 11, color: COL.orange });
}
function wire() {
  ['g0', 'g1', 'g2'].forEach((id, i) => $(id).addEventListener('click', () => { S.guess = i; render0(); }));
  slider('r1', v => { S.r1 = v; render1(); }); slider('f1', v => { S.f1 = v; render1(); });
  slider('y2', v => { S.y2 = v; render2(); }); slider('f2', v => { S.f2 = v; render2(); });
  slider('a3', v => { S.a3 = v; render3(); });
  slider10('f4', v => { S.f4 = v; render4(); });
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
if (typeof module !== 'undefined') module.exports = { amt, feeAmt, gapPct };
