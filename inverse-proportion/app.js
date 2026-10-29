/* inverse-proportion: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const inv = (k, x) => k / x, product = (x, y) => x * y, ratio = (x, y) => y / x;
const tripTime = v => 120 / v, workDays = n => 60 / n;
const QUESTIONS = [{ x0: 3, y0: 8, x1: 6 }, { x0: 4, y0: 5, x1: 10 }, { x0: 2, y0: 9, x1: 3 }, { x0: 6, y0: 2, x1: 4 }];
const fmt = v => String(Math.round(v * 100) / 100);
const S = { sc: 0, q: 0, checked: false };
function axes(ctx, w, h, xr, yr, xt, yt) { const L = { x: 34, y: 10, w: w - 50, h: h - 30 }, X = v => L.x + v / xr * L.w, Y = v => L.y + L.h - v / yr * L.h; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1.5); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1.5); xt.forEach(v => text(ctx, String(v), X(v), L.y + L.h + 13, { align: 'center', size: 10 })); yt.forEach(v => text(ctx, String(v), L.x - 5, Y(v) + 3, { align: 'right', size: 10 })); text(ctx, 'x', L.x + L.w, L.y + L.h - 5, { align: 'right', size: 12, color: COL.ink }); text(ctx, 'y', L.x + 6, L.y + 8, { size: 12, color: COL.ink }); return { L, X, Y }; }
function curve(ctx, g, fn, x0, x1, col, yr) { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); let first = true; for (let i = 0; i <= 200; i++) { const x = x0 + (x1 - x0) * i / 200, y = fn(x); if (y > yr * 1.05) { first = true; continue; } const px = g.X(x), py = g.Y(y); if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py); } ctx.stroke(); }
function render0() { const { ctx, w, h } = setup($('cv0')), L = +$('L0').value; $('L0v').textContent = L; const W = inv(12, L), sc = Math.min((w - 40) / 12, (h - 30) / 12), x0 = 20, y0 = h - 20; ctx.fillStyle = 'rgba(103,215,249,0.3)'; ctx.fillRect(x0, y0 - W * sc, L * sc, W * sc);
  for (let i = 0; i <= L; i++) line(ctx, x0 + i * sc, y0 - W * sc, x0 + i * sc, y0, 'rgba(10,14,20,0.5)', 1); for (let j = 0; j <= W; j++) line(ctx, x0, y0 - j * sc, x0 + L * sc, y0 - j * sc, 'rgba(10,14,20,0.5)', 1); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.strokeRect(x0, y0 - W * sc, L * sc, W * sc);
  text(ctx, 'L = ' + fmt(L), x0 + L * sc / 2, y0 + 14, { align: 'center', size: 12, color: COL.orange, bold: true }); text(ctx, 'W = ' + fmt(W), x0 + L * sc + 6, y0 - W * sc / 2, { size: 12, color: COL.green, bold: true }); $('ro0').textContent = t('s0ro', { L, W: fmt(W), A: fmt(L * W) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), m = +$('m1').value; $('m1v').textContent = m; const L = 2 * m, W = 6 / m, sc = (w - 80) / 12;
  ctx.fillStyle = COL.orange; ctx.fillRect(60, h * 0.2, L * sc, h * 0.2); ctx.fillStyle = COL.cyan; ctx.fillRect(60, h * 0.55, W * sc, h * 0.2); text(ctx, 'L', 12, h * 0.34, { size: 14, color: COL.orange, bold: true }); text(ctx, 'W', 12, h * 0.69, { size: 14, color: COL.cyan, bold: true }); text(ctx, fmt(L), 60 + L * sc + 6, h * 0.34, { size: 12, color: COL.ink }); text(ctx, fmt(W), 60 + W * sc + 6, h * 0.69, { size: 12, color: COL.ink });
  $('ro1').textContent = t('s1ro', { m, L: fmt(L), W: fmt(W), A: fmt(L * W) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), k = +$('k2').value, x = +$('x2').value; $('k2v').textContent = k; $('x2v').textContent = x; const g = axes(ctx, w, h, 10, 10, [0, 2, 4, 6, 8, 10], [0, 2, 4, 6, 8, 10]), y = inv(k, x);
  ctx.fillStyle = 'rgba(246,164,91,0.3)'; ctx.fillRect(g.X(0), g.Y(Math.min(y, 10)), g.X(x) - g.X(0), g.Y(0) - g.Y(Math.min(y, 10))); curve(ctx, g, v => inv(k, v), 0.2, 10, COL.cyan, 10); if (y <= 10) { dot(ctx, g.X(x), g.Y(y), 7, COL.orange); line(ctx, g.X(x), g.Y(0), g.X(x), g.Y(y), COL.orange, 1, [4, 4]); line(ctx, g.X(0), g.Y(y), g.X(x), g.Y(y), COL.orange, 1, [4, 4]); }
  text(ctx, 'k = ' + k, g.X(0) + 8, g.Y(0) - 8, { size: 12, color: COL.orange, bold: true }); $('ro2').textContent = t('s2ro', { k, x, y: fmt(y), A: fmt(x * y) }) + (y > 10 ? ' ' + t('s2roOff') : ''); }
function bars(ctx, box, fn, col, title, hl, ymax) { const n = 6, bw = box.w / n; text(ctx, title, box.x, box.y - 4, { size: 11, color: COL.ink }); line(ctx, box.x, box.y + box.h, box.x + box.w, box.y + box.h, COL.grid, 1); for (let x = 1; x <= n; x++) { const v = fn(x), hh = Math.min(box.h, v / ymax * box.h); ctx.fillStyle = x === hl ? COL.orange : col; ctx.fillRect(box.x + (x - 1) * bw + 3, box.y + box.h - hh, bw - 6, hh); text(ctx, fmt(v), box.x + (x - 0.5) * bw, box.y + box.h - hh - 3, { align: 'center', size: 9, color: COL.ink }); text(ctx, String(x), box.x + (x - 0.5) * bw, box.y + box.h + 11, { align: 'center', size: 9 }); } }
function render3() { const { ctx, w, h, wide } = setup($('cv3')), x = +$('x3').value; $('x3v').textContent = x; const cw = wide ? w / 2 - 20 : w - 20, ch = wide ? h / 2 - 34 : h / 4 - 30, pos = (i, j) => wide ? { x: 10 + j * (w / 2), y: 22 + i * (h / 2), w: cw, h: ch } : { x: 10, y: 22 + (i * 2 + j) * (h / 4), w: cw, h: ch };
  bars(ctx, pos(0, 0), v => ratio(v, 2 * v), COL.cyan, t('dirRatio'), x, 14); bars(ctx, pos(0, 1), v => product(v, 2 * v), COL.green, t('dirProd'), x, 80); bars(ctx, pos(1, 0), v => ratio(v, 12 / v), COL.green, t('invRatio'), x, 14); bars(ctx, pos(1, 1), v => product(v, 12 / v), COL.cyan, t('invProd'), x, 14);
  $('ro3').textContent = t('s3ro', { x, yd: fmt(2 * x), rd: fmt(ratio(x, 2 * x)), pd: fmt(product(x, 2 * x)), yi: fmt(12 / x), ri: fmt(ratio(x, 12 / x)), pi: fmt(product(x, 12 / x)) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), sc = S.sc, v = +$('v4').value; $('v4v').textContent = v; [0, 1].forEach(i => { const b = $('sc' + i); b.classList.toggle('active', i === sc); b.setAttribute('aria-pressed', i === sc ? 'true' : 'false'); });
  const tmax = sc === 0 ? 6 : 6, g = axes(ctx, w, h, 120, tmax, [0, 40, 80, 120], [0, 2, 4, 6]), fn = sc === 0 ? tripTime : workDays; curve(ctx, g, fn, 10, 120, COL.cyan, tmax); const vv = sc === 0 ? v : Math.max(10, v), y = fn(vv); if (y <= tmax) dot(ctx, g.X(vv), g.Y(y), 7, COL.orange); line(ctx, g.X(vv), g.Y(0), g.X(vv), g.Y(Math.min(y, tmax)), COL.orange, 1, [4, 4]);
  $('ro4').textContent = t(sc === 0 ? 's4roTrip' : 's4roWork', { v: vv, t: fmt(y), p: fmt(vv * y) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), q = QUESTIONS[S.q % QUESTIONS.length], k = q.x0 * q.y0, ymax = 12, g = axes(ctx, w, h, 12, ymax, [0, 3, 6, 9, 12], [0, 3, 6, 9, 12]); curve(ctx, g, v => inv(k, v), 0.3, 12, COL.cyan, ymax); dot(ctx, g.X(q.x0), g.Y(q.y0), 7, COL.orange); text(ctx, '(' + q.x0 + ', ' + q.y0 + ')', g.X(q.x0) + 8, g.Y(q.y0) - 8, { size: 12, color: COL.orange, bold: true });
  const y1 = k / q.x1; line(ctx, g.X(q.x1), g.Y(0), g.X(q.x1), g.Y(Math.min(ymax, y1)), COL.green, 1.5, [4, 4]); if (S.checked) dot(ctx, g.X(q.x1), g.Y(y1), 7, COL.green); else text(ctx, '?', g.X(q.x1), g.Y(Math.min(ymax, y1)) - 8, { align: 'center', size: 16, color: COL.green, bold: true });
  const gs = parseFloat($('g5').value); if (!S.checked) { $('ro5').textContent = t('s5roAsk', { x0: q.x0, y0: q.y0, x1: q.x1 }); return; } $('ro5').textContent = Math.abs(gs - y1) < 0.01 ? t('s5roOk', { k, x1: q.x1, y1: fmt(y1) }) : t('s5roNo', { x0: q.x0, y0: q.y0, k, x1: q.x1, y1: fmt(y1), g: isNaN(gs) ? '?' : gs }); }
function wire() {
  slider('L0', render0); slider('m1', render1); slider('k2', render2); slider('x2', render2); slider('x3', render3); [0, 1].forEach(i => $('sc' + i).addEventListener('click', () => { S.sc = i; const v = $('v4'); if (i === 0) { v.min = 20; v.max = 120; v.step = 10; v.value = 60; } else { v.min = 5; v.max = 60; v.step = 5; v.value = 20; } render4(); })); slider('v4', render4);
  $('chk5').addEventListener('click', () => { S.checked = true; render5(); }); $('nx5').addEventListener('click', () => { S.q++; S.checked = false; $('g5').value = ''; render5(); }); $('g5').addEventListener('input', () => { S.checked = false; render5(); });
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
if (typeof module !== 'undefined') module.exports = { inv,product,ratio,QUESTIONS,tripTime,workDays };
