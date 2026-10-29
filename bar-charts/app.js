/* bar-charts: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', red: '#e0644e', violet: '#b79cff', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', dim: '#1b2d3c' };
const $ = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

const DATA0 = [138, 142, 135, 150, 146, 141, 155, 139];
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const fmt = (v, d) => String(Math.round(v * Math.pow(10, d == null ? 2 : d)) / Math.pow(10, d == null ? 2 : d));
const surplusDeficit = (a, L) => ({ up: a.reduce((s, v) => s + Math.max(0, v - L), 0), down: a.reduce((s, v) => s + Math.max(0, L - v), 0) });
/* Drawn length of the tallest/shortest bar for an axis starting at base, versus the true ratio. */
const visualRatio = (a, base) => { const mx = Math.max.apply(null, a), mn = Math.min.apply(null, a); return { lmax: mx - base, lmin: Math.max(0, mn - base), vis: mn - base > 0 ? (mx - base) / (mn - base) : Infinity, real: mx / mn }; };
const meanShift = (a, x) => ({ m0: mean(a), m1: mean(a.concat([x])), chk: (x - mean(a)) / (a.length + 1) });
function parseOwn(s) { const v = String(s).split(/[\s,\uFF0C;]+/).filter(Boolean).map(Number); return (v.length >= 2 && v.length <= 12 && v.every(x => isFinite(x) && x > 0)) ? v : null; }
const S = { data: DATA0.slice(), line: 135 };
/* Bars on [ymin,ymax]; returns the coordinate mappers so callers can draw overlays. */
function drawBars(ctx, w, h, vals, o) {
  const L = { x: 44, y: 14, w: w - 56, h: h - 40 }, n = vals.length, Y = v => L.y + L.h - (clamp(v, o.ymin, o.ymax) - o.ymin) / (o.ymax - o.ymin) * L.h, bw = L.w / n, X = i => L.x + (i + 0.5) * bw;
  const ticks = 5; for (let k = 0; k <= ticks; k++) { const v = o.ymin + (o.ymax - o.ymin) * k / ticks; line(ctx, L.x, Y(v), L.x + L.w, Y(v), k ? '#1b2d3c' : COL.grid, 1); text(ctx, String(Math.round(v)), L.x - 6, Y(v) + 4, { align: 'right', size: 11 }); }
  text(ctx, t('unit'), 4, L.y + 4, { size: 11 });
  vals.forEach((v, i) => { const col = o.color ? o.color(i) : COL.cyan; ctx.fillStyle = col; ctx.fillRect(X(i) - bw * 0.34, Y(v), bw * 0.68, Y(o.ymin) - Y(v)); if (o.val !== false) text(ctx, String(v), X(i), Y(v) - 5, { align: 'center', size: 11, color: COL.ink }); text(ctx, '#' + (i + 1), X(i), L.y + L.h + 16, { align: 'center', size: 11 }); });
  return { X, Y, L, bw };
}
function render0() { const { ctx, w, h } = setup($('cv0')), i = +$('who0').value - 1; $('hgt0').value = S.data[i]; $('hgt0v').textContent = S.data[i]; $('who0v').textContent = i + 1;
  drawBars(ctx, w, h, S.data, { ymin: 100, ymax: 170, color: k => k === i ? COL.orange : COL.cyan });
  $('ro0').textContent = t('s0ro', { i: i + 1, v: S.data[i], max: Math.max.apply(null, S.data), min: Math.min.apply(null, S.data) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), a = +$('a1').value - 1, b = +$('b1').value - 1, d = S.data, mx = Math.max.apply(null, d), mn = Math.min.apply(null, d);
  const g = drawBars(ctx, w, h, d, { ymin: 100, ymax: 170, color: k => k === a || k === b ? COL.orange : d[k] === mx ? COL.green : d[k] === mn ? COL.violet : COL.cyan });
  line(ctx, g.X(Math.min(a, b)), g.Y(d[a]), g.X(Math.max(a, b)) + g.bw / 2, g.Y(d[a]), COL.orange, 1.5, [5, 4]); line(ctx, g.X(Math.min(a, b)), g.Y(d[b]), g.X(Math.max(a, b)) + g.bw / 2, g.Y(d[b]), COL.orange, 1.5, [5, 4]);
  const bx = g.X(Math.max(a, b)) + g.bw * 0.45; line(ctx, bx, g.Y(d[a]), bx, g.Y(d[b]), COL.ink, 2); text(ctx, String(Math.abs(d[a] - d[b])), bx + 5, (g.Y(d[a]) + g.Y(d[b])) / 2 + 4, { color: COL.ink, bold: true });
  $('ro1').textContent = a === b ? t('s1roSame') : t('s1ro', { a: a + 1, b: b + 1, va: d[a], vb: d[b], d: d[a] - d[b] }); }
function render2() { const { ctx, w, h } = setup($('cv2')), base = +$('base2').value, d = S.data; $('base2v').textContent = base;
  drawBars(ctx, w, h, d, { ymin: base, ymax: 160, val: true, color: () => COL.cyan }); const r = visualRatio(d, base);
  $('ro2').textContent = r.lmin <= 0 ? t('s2roGone', { base, min: Math.min.apply(null, d) }) : t('s2ro', { base, lmax: r.lmax, lmin: r.lmin, vis: fmt(r.vis, 2), real: fmt(r.real, 2) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), d = S.data, L = +$('line3').value; $('line3v').textContent = L;
  const g = drawBars(ctx, w, h, d, { ymin: 120, ymax: 160, val: false, color: () => COL.cyan });
  d.forEach((v, i) => { const x = g.X(i) - g.bw * 0.34, bw2 = g.bw * 0.68; if (v > L) { ctx.fillStyle = COL.orange; ctx.fillRect(x, g.Y(v), bw2, g.Y(L) - g.Y(v)); } else if (v < L) { ctx.fillStyle = 'rgba(183,156,255,0.55)'; ctx.fillRect(x, g.Y(L), bw2, g.Y(v) - g.Y(L)); } });
  line(ctx, g.L.x, g.Y(L), g.L.x + g.L.w, g.Y(L), COL.ink, 2); const sd = surplusDeficit(d, L), diff = sd.up - sd.down;
  $('ro3').textContent = t('s3ro', { L: fmt(L, 2), up: fmt(sd.up, 2), down: fmt(sd.down, 2), diff: fmt(diff, 2) }) + (Math.abs(diff) < 0.4 ? ' ' + t('s3roBal', { m: fmt(mean(d), 2) }) : ''); }
function render4() { const { ctx, w, h } = setup($('cv4')), x = +$('x4').value, d = S.data.concat([x]); $('x4v').textContent = x; const sh = meanShift(S.data, x);
  const g = drawBars(ctx, w, h, d, { ymin: 100, ymax: 200, val: false, color: i => i === 8 ? COL.orange : COL.cyan });
  line(ctx, g.L.x, g.Y(sh.m0), g.L.x + g.L.w, g.Y(sh.m0), COL.muted, 1.5, [6, 4]); line(ctx, g.L.x, g.Y(sh.m1), g.L.x + g.L.w, g.Y(sh.m1), COL.green, 2.5);
  $('ro4').textContent = t('s4ro', { m0: fmt(sh.m0, 2), x, m1: fmt(sh.m1, 2), sh: fmt(sh.m1 - sh.m0, 3), chk: fmt(sh.chk, 3) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), v = parseOwn($('own5').value);
  if (!v) { $('ro5').textContent = t('s5roBad'); text(ctx, '?', w / 2, h / 2, { size: 40, align: 'center' }); return; }
  const mx = Math.max.apply(null, v), mn = Math.min.apply(null, v), m = mean(v), g = drawBars(ctx, w, h, v, { ymin: 0, ymax: Math.ceil(mx * 1.15), color: () => COL.cyan });
  line(ctx, g.L.x, g.Y(m), g.L.x + g.L.w, g.Y(m), COL.green, 2.5); $('ro5').textContent = t('s5ro', { n: v.length, m: fmt(m, 2), max: mx, min: mn }); }
function wire() {
  $('who0').addEventListener('input', render0);
  $('hgt0').addEventListener('input', e => { S.data[+$('who0').value - 1] = +e.target.value; render0(); render1(); render2(); render3(); render4(); });
  ['a1', 'b1'].forEach(id => slider(id, render1)); slider('base2', render2); slider('line3', render3); slider('x4', render4);
  $('snap3').addEventListener('click', () => { $('line3').value = mean(S.data); render3(); }); $('own5').addEventListener('input', render5);
}

const RENDERS = [typeof render0 === 'function' && render0, typeof render1 === 'function' && render1, typeof render2 === 'function' && render2, typeof render3 === 'function' && render3, typeof render4 === 'function' && render4, typeof render5 === 'function' && render5].filter(Boolean);
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && typeof onHide === 'function') onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();
if (typeof module !== 'undefined') module.exports = { mean,DATA0,surplusDeficit,visualRatio,parseOwn,meanShift };
