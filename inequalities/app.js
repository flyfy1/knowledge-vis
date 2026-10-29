/* inequalities: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const holds = (op, a, b) => op === '<' ? a < b : op === '≤' ? a <= b : op === '>' ? a > b : a >= b;
const flipOp = op => ({ '<': '>', '≤': '≥', '>': '<', '≥': '≤' }[op]);
/* a x + b op c  ->  x op' (c - b)/a  (flip when a < 0). */
function solveIneq(a, b, c, op) { return { op2: a < 0 ? flipOp(op) : op, bound: (c - b) / a }; }
const maxItems = (M, p) => Math.floor(M / p + 1e-12);
const tilt = (left, right) => Math.max(-22, Math.min(22, (left - right) * 8));
const fmt = v => String(Math.round(v * 100) / 100);
const S = { tests: [], showSol: false, op4: '<' };
function nline(ctx, box, lo, hi, step) { const X = v => box.x + (v - lo) / (hi - lo) * box.w, y = box.y + box.h * 0.6; line(ctx, box.x, y, box.x + box.w, y, COL.muted, 2); for (let v = Math.ceil(lo); v <= hi; v += step) { line(ctx, X(v), y - 5, X(v), y + 5, COL.muted, 1.5); text(ctx, String(v), X(v), y + 20, { align: 'center', size: 11, color: v === 0 ? COL.ink : COL.muted }); } return { X, y }; }
function shade(ctx, g, from, to, box, col) { ctx.fillStyle = col; ctx.fillRect(g.X(from), g.y - 12, g.X(to) - g.X(from), 12); }
function circle(ctx, x, y, open, col) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.2832); if (!open) { ctx.fillStyle = col; ctx.fill(); } else { ctx.fillStyle = '#0d1520'; ctx.fill(); } ctx.stroke(); }
function render0() { const { ctx, w, h } = setup($('cv0')), x = +$('x0').value; $('x0v').textContent = x; const l = x + 2, ang = tilt(l, 5) * Math.PI / 180, cx = w / 2, cy = h * 0.3, bl = Math.min(w * 0.38, 200); line(ctx, cx, cy, cx, h * 0.92, COL.muted, 4); line(ctx, cx - 30, h * 0.92, cx + 30, h * 0.92, COL.muted, 5);
  const lx = cx - Math.cos(ang) * bl, ly = cy + Math.sin(ang) * bl, rx = cx + Math.cos(ang) * bl, ry = cy - Math.sin(ang) * bl; line(ctx, lx, ly, rx, ry, COL.ink, 5); dot(ctx, cx, cy, 6, COL.ink);
  const pan = (px, py, label, col) => { line(ctx, px, py, px - 28, py + 36, COL.muted, 1.5); line(ctx, px, py, px + 28, py + 36, COL.muted, 1.5); line(ctx, px - 32, py + 36, px + 32, py + 36, COL.muted, 3); ctx.fillStyle = col; ctx.fillRect(px - 20, py + 8, 40, 26); text(ctx, label, px, py + 26, { align: 'center', size: 13, color: '#0a0e14', bold: true }); };
  pan(lx, ly, 'x+2', COL.orange); pan(rx, ry, '5', COL.cyan); $('ro0').textContent = t('s0ro', { x, l: fmt(l), res: t(l > 5 ? 'lHeavy' : l < 5 ? 'lLight' : 'lEq') }); }
function render1() { const { ctx, w, h } = setup($('cv1')), x = +$('x1').value; $('x1v').textContent = x; const box = { x: 20, y: 0, w: w - 40, h }, g = nline(ctx, box, -2, 8, 1); if (S.showSol) { shade(ctx, g, -2, 3, box, 'rgba(116,223,170,0.35)'); circle(ctx, g.X(3), g.y, true, COL.green); text(ctx, 'x < 3', g.X(0.5), g.y - 22, { align: 'center', size: 12, color: COL.green, bold: true }); }
  S.tests.forEach(p => dot(ctx, g.X(p.x), g.y - 28 - (p.i % 3) * 7, 5, p.ok ? COL.green : COL.red)); dot(ctx, g.X(x), g.y, 7, COL.orange); $('sol1').setAttribute('aria-pressed', S.showSol ? 'true' : 'false'); const gc = S.tests.filter(p => p.ok).length;
  const last = S.tests[S.tests.length - 1]; $('ro1').textContent = !last ? t('s1roNone') : t('s1ro', { n: S.tests.length, g: gc, r: S.tests.length - gc, x: last.x, l: fmt(last.x + 2), res: t(last.ok ? 'holdsYes' : 'holdsNo', { l: fmt(last.x + 2) }) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), c = +$('c2').value; $('c2v').textContent = c; const box = { x: 20, y: 0, w: w - 40, h }, g = nline(ctx, box, -4, 12, 2); [[2, COL.cyan], [5, COL.orange]].forEach(([v, col]) => { dot(ctx, g.X(v), g.y, 6, 'rgba(200,210,220,0.5)'); line(ctx, g.X(v), g.y - 16, g.X(v + c), g.y - 16, col, 2); dot(ctx, g.X(v + c), g.y, 8, col); text(ctx, fmt(v + c), g.X(v + c), g.y - 24, { align: 'center', size: 12, color: col, bold: true }); });
  line(ctx, g.X(2 + c), g.y + 30, g.X(5 + c), g.y + 30, COL.green, 2); $('ro2').textContent = t('s2ro', { c, a: fmt(2 + c), b: fmt(5 + c), op: '<', d: 3 }); }
function render3() { const { ctx, w, h } = setup($('cv3')), m = +$('m3').value; $('m3v').textContent = m; const box = { x: 20, y: 0, w: w - 40, h }, g = nline(ctx, box, -20, 20, 5); const a = 2 * m, b = 5 * m; [[2, a, COL.cyan], [5, b, COL.orange]].forEach(([v, r, col]) => { dot(ctx, g.X(v), g.y, 5, 'rgba(200,210,220,0.5)'); line(ctx, g.X(v), g.y - 16, g.X(r), g.y - 16, col, 2); dot(ctx, g.X(r), g.y, 8, col); text(ctx, fmt(r), g.X(r), g.y - 24, { align: 'center', size: 12, color: col, bold: true }); });
  const op = a < b ? '<' : a > b ? '>' : '='; $('ro3').textContent = t('s3ro', { m, a: fmt(a), b: fmt(b), op, note: t(m > 0 ? 'nPos' : m < 0 ? 'nNeg' : 'nZero') }); }
function render4() { const { ctx, w, h } = setup($('cv4')), a = +$('a4').value, b = +$('b4').value, c = +$('c4').value, xt = +$('t4').value, op = S.op4; ['a4', 'b4', 'c4', 't4'].forEach(id => $(id + 'v').textContent = $(id).value); $('op4lt').classList.toggle('active', op === '<'); $('op4le').classList.toggle('active', op === '≤'); $('op4lt').setAttribute('aria-pressed', op === '<' ? 'true' : 'false'); $('op4le').setAttribute('aria-pressed', op === '≤' ? 'true' : 'false');
  const box = { x: 20, y: 0, w: w - 40, h }, g = nline(ctx, box, -10, 10, 2); if (a === 0) { $('ro4').textContent = t('s4roZero'); dot(ctx, g.X(xt), g.y, 7, COL.orange); return; }
  const s = solveIneq(a, b, c, op), open = s.op2 === '<' || s.op2 === '>', lo = s.op2 === '<' || s.op2 === '≤' ? -10 : s.bound, hi = s.op2 === '<' || s.op2 === '≤' ? s.bound : 10; shade(ctx, g, Math.max(-10, lo), Math.min(10, hi), box, 'rgba(116,223,170,0.35)'); circle(ctx, g.X(s.bound), g.y, open, COL.green); text(ctx, 'x ' + s.op2 + ' ' + fmt(s.bound), g.X(Math.max(-9, Math.min(9, s.bound))), g.y - 24, { align: 'center', size: 12, color: COL.green, bold: true });
  const val = a * xt + b, ok = holds(op, val, c), inside = holds(s.op2, xt, s.bound); dot(ctx, g.X(xt), g.y, 7, ok ? COL.orange : COL.red); $('ro4').textContent = t('s4ro', { lhs: eqL(a, b), op, c, op2: s.op2, bd: fmt(s.bound), x: xt, v: fmt(val), res: t(ok ? 'yes' : 'no'), in: t(inside ? 'inShade' : 'outShade') }); }
function eqL(a, b) { return (a === 1 ? '' : a === -1 ? '−' : a) + 'x' + (b === 0 ? '' : (b < 0 ? ' − ' : ' + ') + Math.abs(b)); }
function render5() { const { ctx, w, h } = setup($('cv5')), M = +$('M5').value, p = +$('p5').value; $('M5v').textContent = M; $('p5v').textContent = p; const n = maxItems(M, p), hi = Math.max(10, n + 2), box = { x: 20, y: 0, w: w - 40, h }, g = nline(ctx, box, 0, hi, hi > 20 ? 5 : 1); for (let k = 0; k <= hi; k++) dot(ctx, g.X(k), g.y, 5, k <= n ? COL.green : COL.dim);
  line(ctx, g.X(0), g.y - 14, g.X(M / p), g.y - 14, COL.orange, 2); text(ctx, fmt(M / p), g.X(Math.min(hi, M / p)), g.y - 22, { align: 'center', size: 12, color: COL.orange, bold: true }); $('ro5').textContent = t('s5ro', { p, M, q: fmt(M / p), n, cost: n * p, left: M - n * p }); }
function wire() {
  slider('x0', render0); slider('x1', render1); $('try1').addEventListener('click', () => { const x = +$('x1').value; S.tests.push({ x, ok: holds('<', x + 2, 5), i: S.tests.length }); render1(); }); $('sol1').addEventListener('click', () => { S.showSol = !S.showSol; render1(); }); $('clr1').addEventListener('click', () => { S.tests = []; S.showSol = false; render1(); });
  slider('c2', render2); slider('m3', render3); ['a4', 'b4', 'c4', 't4'].forEach(id => slider(id, render4)); $('op4lt').addEventListener('click', () => { S.op4 = '<'; render4(); }); $('op4le').addEventListener('click', () => { S.op4 = '≤'; render4(); }); slider('M5', render5); slider('p5', render5);
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
if (typeof module !== 'undefined') module.exports = { holds,flipOp,solveIneq,maxItems,tilt };
