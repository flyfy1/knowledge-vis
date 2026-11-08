/* circle-intro: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const fmt = v => String(Math.round(v * 100) / 100);
const penDistance = (cx, cy, r, deg) => { const a = deg * Math.PI / 180, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); return Math.hypot(x - cx, y - cy); };
const chordLength = (r, deg) => { const a = deg * Math.PI / 180, p = [r * Math.cos(-Math.PI / 2 - a / 2), r * Math.sin(-Math.PI / 2 - a / 2)], q = [r * Math.cos(-Math.PI / 2 + a / 2), r * Math.sin(-Math.PI / 2 + a / 2)]; return Math.hypot(p[0] - q[0], p[1] - q[1]); };
/* Perimeter of the regular n-gon inscribed in a circle of radius r, summed from vertex coordinates. */
function polyPerimeter(n, r) { let s = 0; for (let k = 0; k < n; k++) { const a = 2 * Math.PI * k / n, b = 2 * Math.PI * (k + 1) / n; s += Math.hypot(r * Math.cos(a) - r * Math.cos(b), r * Math.sin(a) - r * Math.sin(b)); } return s; }
const ratioPi = (n, r) => polyPerimeter(n, r) / (2 * r);
const sectorWidth = (n, r) => (n / 2) * 2 * r * Math.sin(Math.PI / n);
function solveCircle(kind, v) { const r = kind === 'R' ? v : kind === 'D' ? v / 2 : kind === 'C' ? v / (2 * Math.PI) : Math.sqrt(v / Math.PI); return { r, d: 2 * r, c: 2 * Math.PI * r, a: Math.PI * r * r }; }
const S = { k5: 'R' };
function render0() { const { ctx, w, h } = setup($('cv0')), r = +$('r0').value, a = +$('a0').value; $('r0v').textContent = r; $('a0v').textContent = a; const cx = w / 2, cy = h / 2, sc = Math.min(w, h) / 2 / 5.6, R = r * sc;
  ctx.strokeStyle = COL.dim; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + a * Math.PI / 180); ctx.stroke();
  for (let k = 0; k * 45 <= a; k++) { const ang = -Math.PI / 2 + k * Math.PI / 4; line(ctx, cx, cy, cx + R * Math.cos(ang), cy + R * Math.sin(ang), 'rgba(246,164,91,0.5)', 1.5); dot(ctx, cx + R * Math.cos(ang), cy + R * Math.sin(ang), 3, COL.orange); }
  const pa = -Math.PI / 2 + a * Math.PI / 180, px = cx + R * Math.cos(pa), py = cy + R * Math.sin(pa); line(ctx, cx, cy, px, py, COL.ink, 2.5); dot(ctx, cx, cy, 5, COL.ink); dot(ctx, px, py, 6, COL.orange);
  text(ctx, 'r', (cx + px) / 2 + 8, (cy + py) / 2 - 6, { color: COL.ink, bold: true }); const dist = penDistance(0, 0, r, a - 90); $('ro0').textContent = t('s0ro', { r, a, dist: fmt(dist) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), r = +$('r1').value, phi = +$('c1').value; $('r1v').textContent = r; $('c1v').textContent = phi; const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 18;
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke(); line(ctx, cx - R, cy, cx + R, cy, COL.green, 3); line(ctx, cx, cy, cx + R * Math.cos(-0.7), cy + R * Math.sin(-0.7), COL.orange, 3);
  const a = phi * Math.PI / 180, p = [cx + R * Math.cos(Math.PI / 2 - a / 2 + Math.PI), cy + R * Math.sin(Math.PI / 2 - a / 2 + Math.PI)], q = [cx + R * Math.cos(Math.PI / 2 + a / 2 + Math.PI), cy + R * Math.sin(Math.PI / 2 + a / 2 + Math.PI)];
  line(ctx, p[0], p[1], q[0], q[1], COL.violet, 3.5); dot(ctx, p[0], p[1], 4, COL.violet); dot(ctx, q[0], q[1], 4, COL.violet); dot(ctx, cx, cy, 5, COL.ink);
  const lab = (s, x, y, c) => text(ctx, s, x, y, { color: c, bold: true, size: 13 }); lab('d', cx - R * 0.5, cy + 16, COL.green); lab('r', cx + R * 0.45, cy - R * 0.3 - 4, COL.orange); lab('c', (p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 8, COL.violet);
  const c = chordLength(r, phi), d = 2 * r; $('ro1').textContent = t('s1ro', { r, d, c: fmt(c), cmp: Math.abs(d - c) < 0.005 ? t('cmpEq') : t('cmpShort', { diff: fmt(d - c) }) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), d = +$('d2').value, tn = +$('t2').value; $('d2v').textContent = d; $('t2v').textContent = tn; const C = Math.PI * d, sc = (w - 40) / (C + d + 0.5), r = d / 2 * sc, gy = h * 0.72, x0 = 20 + r, len = tn * C;
  line(ctx, 20, gy, w - 10, gy, COL.muted, 2); for (let k = 0; k <= Math.ceil(C + d); k++) { line(ctx, 20 + k * sc, gy, 20 + k * sc, gy + 6, COL.muted, 1); }
  line(ctx, 20, gy + 14, 20 + len * sc, gy + 14, COL.orange, 5); const cx = x0 + len * sc, cy = gy - r; ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke();
  const ang = len / (d / 2); dot(ctx, cx - r * Math.sin(ang), cy + r * Math.cos(ang), 5, COL.orange); dot(ctx, cx, cy, 3, COL.ink); line(ctx, cx, cy, cx - r * Math.sin(ang), cy + r * Math.cos(ang), COL.dim, 1.5);
  line(ctx, 20, gy - 2, 20, gy + 22, COL.orange, 2); $('ro2').textContent = t('s2ro', { d, turn: fmt(tn), len: fmt(len), c: fmt(C), ratio: fmt(C / d) }); }
function render3() { const { ctx, w, h, wide } = setup($('cv3')), n = +$('n3').value, r = +$('r3').value; $('n3v').textContent = n; $('r3v').textContent = r; const A = wide ? { x: 0, y: 0, w: w * 0.4, h } : { x: 0, y: 0, w, h: h * 0.5 }, B = wide ? { x: w * 0.42, y: 0, w: w * 0.58, h } : { x: 0, y: h * 0.5, w, h: h * 0.5 };
  const cx = A.x + A.w / 2, cy = A.y + A.h / 2, R = Math.min(A.w, A.h) / 2 - 10; ctx.strokeStyle = COL.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= n; k++) { const a = 2 * Math.PI * k / n - Math.PI / 2, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  const L = { x: B.x + 40, y: B.y + 14, w: B.w - 56, h: B.h - 44 }, Y = v => L.y + L.h - (v - 2.5) / (3.2 - 2.5) * L.h, X = k => L.x + (k - 3) / 93 * L.w; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1);
  [2.5, 3, 3.2].forEach(v => text(ctx, String(v), L.x - 5, Y(v) + 4, { align: 'right', size: 11 })); [3, 48, 96].forEach(k => text(ctx, String(k), X(k), L.y + L.h + 15, { align: 'center', size: 11 })); text(ctx, 'n', L.x + L.w, L.y + L.h + 29, { align: 'right', size: 11 });
  line(ctx, L.x, Y(Math.PI), L.x + L.w, Y(Math.PI), COL.green, 1.5, [5, 4]); text(ctx, 'π', L.x + L.w + 2, Y(Math.PI) + 4, { size: 13, color: COL.green, bold: true });
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 3; k <= 96; k++) { const x = X(k), y = Y(ratioPi(k, 1)); k > 3 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); dot(ctx, X(n), Y(ratioPi(n, r)), 6, COL.orange);
  const rt = ratioPi(n, r); $('ro3').textContent = t('s3ro', { n, p: fmt(polyPerimeter(n, r)), d: 2 * r, ratio: String(Math.round(rt * 10000) / 10000), pi: '3.1416', gap: String(Math.round((Math.PI - rt) * 10000) / 10000) }); }
function wedge(ctx, ax, ay, r, a0, a1, col) { ctx.fillStyle = col; ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.arc(ax, ay, r, a0, a1); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function render4() { const { ctx, w, h } = setup($('cv4')), n = +$('n4').value, r = +$('r4').value; $('n4v').textContent = n; $('r4v').textContent = r; const al = Math.PI / n, R = Math.min(h * 0.2, w * 0.13), c = 2 * R * Math.sin(al), cx = w * 0.2, cy = h * 0.27;
  for (let k = 0; k < n; k++) wedge(ctx, cx, cy, R, k * 2 * al - Math.PI / 2 - al, (k + 1) * 2 * al - Math.PI / 2 - al, k % 2 ? COL.orange : COL.cyan);
  const W = (n / 2) * c, x0 = (w - W - c / 2) / 2 + c / 2, yb = h * 0.9; for (let j = 0; j < n / 2; j++) { wedge(ctx, x0 + j * c, yb, R, -Math.PI / 2 - al, -Math.PI / 2 + al, COL.cyan); wedge(ctx, x0 + j * c + c / 2, yb - R * Math.cos(al), R, Math.PI / 2 - al, Math.PI / 2 + al, COL.orange); }
  text(ctx, String(n), cx, cy + R + 18, { align: 'center', size: 12 }); line(ctx, x0 - c / 2, yb + 10, x0 + W - c / 2, yb + 10, COL.green, 2); text(ctx, '≈ πr', x0 + W / 2 - c / 2, yb + 26, { align: 'center', size: 12, color: COL.green, bold: true }); text(ctx, 'r', x0 - c / 2 - 10, yb - R / 2, { size: 12, color: COL.ink, bold: true });
  const Wr = sectorWidth(n, r); $('ro4').textContent = t('s4ro', { n, w: fmt(Wr), r, a: fmt(Wr * r), a0: fmt(Math.PI * r * r) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), k = S.k5, v = Math.max(0.1, +$('v5').value || 0.1), s = solveCircle(k, v); ['R', 'D', 'C', 'A'].forEach(x => { const b = $('k' + x); b.classList.toggle('active', x === k); b.setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
  const R = Math.min(w, h) / 2 - 14, rr = Math.min(R, Math.max(10, R * Math.min(1, s.r / 12))), cx = w / 2, cy = h / 2; ctx.fillStyle = 'rgba(103,215,249,0.2)'; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.fill(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.stroke(); line(ctx, cx - rr, cy, cx + rr, cy, COL.green, 2); line(ctx, cx, cy, cx, cy - rr, COL.orange, 2); dot(ctx, cx, cy, 4, COL.ink);
  $('ro5').textContent = t('s5ro', { r: fmt(s.r), d: fmt(s.d), c: fmt(s.c), a: fmt(s.a) }); }
function wire() {
  slider('r0', render0); slider('a0', render0); slider('r1', render1); slider('c1', render1); slider('d2', render2); slider('t2', render2); slider('n3', render3); slider('r3', render3); slider('n4', render4); slider('r4', render4);
  ['R', 'D', 'C', 'A'].forEach(x => $('k' + x).addEventListener('click', () => { S.k5 = x; render5(); })); $('v5').addEventListener('input', render5);
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
if (typeof module !== 'undefined') module.exports = { polyPerimeter,ratioPi,chordLength,sectorWidth,solveCircle,penDistance };
