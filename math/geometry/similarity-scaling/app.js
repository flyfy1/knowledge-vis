/* similarity-scaling: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const TRI = [[0, 0], [4, 0], [1, 3]];
const scaleTri = (tri, k) => tri.map(p => [p[0] * k, p[1] * k]);
const angleAt = (p, q, r) => { const ux = q[0] - p[0], uy = q[1] - p[1], vx = r[0] - p[0], vy = r[1] - p[1]; return Math.acos((ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))) * 180 / Math.PI; };
const side = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const treeHeight = (hs, ss, S) => hs * S / ss;
/* Real length in km from a map length in cm at scale 1:N. */
const mapReal = (cm, N) => cm * N / 100000;
const squareCube = k => ({ length: k, area: k * k, volume: k * k * k, stress: (k * k * k) / (k * k) });
const cubeCount = k => ({ volume: k * k * k, surface: 6 * k * k });
const fmt = v => String(Math.round(v * 100) / 100);
const DENS = [10000, 25000, 50000, 100000], S = { den: 2 };
function poly(ctx, pts, fill, stroke, dash) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.setLineDash(dash || []); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); } }
function render0() { const { ctx, w, h } = setup($('cv0')), k = +$('k0').value; $('k0v').textContent = k; const sc = Math.min((w - 40) / (4 * 2.5), (h - 30) / (3 * 2.5)), ox = 20, oy = h - 16, P = pt => [ox + pt[0] * sc, oy - pt[1] * sc];
  poly(ctx, scaleTri(TRI, k).map(P), 'rgba(246,164,91,0.28)', COL.orange); poly(ctx, TRI.map(P), 'rgba(103,215,249,0.2)', COL.cyan, [5, 4]); const T = scaleTri(TRI, k); ['A', 'B', 'C'].forEach((n, i) => text(ctx, n, P(T[i])[0] + (i === 0 ? -12 : 6), P(T[i])[1] + (i === 2 ? -6 : 14), { size: 12, color: COL.ink, bold: true }));
  const s0 = [side(TRI[0], TRI[1]), side(TRI[1], TRI[2]), side(TRI[2], TRI[0])]; $('ro0').textContent = t('s0ro', { k, a: fmt(k * s0[0]), b: fmt(k * s0[1]), c: fmt(k * s0[2]), a0: fmt(s0[0]), b0: fmt(s0[1]), c0: fmt(s0[2]), x: fmt(angleAt(T[0], T[1], T[2])), y: fmt(angleAt(T[1], T[2], T[0])), z: fmt(angleAt(T[2], T[0], T[1])) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), k = +$('k1').value; $('k1v').textContent = k; const u = Math.min((w * 0.62) / 6, (h - 24) / 6, 40), ox = 16, oy = h - 14; let n = 0;
  for (let r = 0; r < k; r++) for (let c = 0; c < k; c++) { n++; ctx.fillStyle = (r + c) % 2 ? 'rgba(103,215,249,0.55)' : 'rgba(103,215,249,0.35)'; ctx.fillRect(ox + c * u, oy - (r + 1) * u, u - 1, u - 1); } ctx.fillStyle = COL.orange; ctx.fillRect(ox, oy - u, u - 1, u - 1); text(ctx, '1', ox + u / 2, oy - u / 2 + 4, { align: 'center', size: 12, color: '#0a0e14', bold: true });
  const bx = ox + 6 * u + 20, bw = Math.max(40, w - bx - 16); text(ctx, 'k', bx, 26, { size: 12 }); ctx.fillStyle = COL.cyan; ctx.fillRect(bx, 32, bw * k / 36 * 6 / 6 * 1, 14); text(ctx, 'k²', bx, 78, { size: 12 }); ctx.fillStyle = COL.green; ctx.fillRect(bx, 84, Math.min(bw, bw * k * k / 36), 14);
  $('ro1').textContent = t('s1ro', { k, n }); }
function cubeIso(ctx, x, y, s, col) { const top = [[x, y], [x + s * 0.87, y - s * 0.5], [x + 1.74 * s, y], [x + s * 0.87, y + s * 0.5]], left = [[x, y], [x + s * 0.87, y + s * 0.5], [x + s * 0.87, y + 1.5 * s], [x, y + s]], right = [[x + s * 0.87, y + s * 0.5], [x + 1.74 * s, y], [x + 1.74 * s, y + s], [x + s * 0.87, y + 1.5 * s]]; poly(ctx, top, col[0], '#0a0e14'); poly(ctx, left, col[1], '#0a0e14'); poly(ctx, right, col[2], '#0a0e14'); }
function render2() { const { ctx, w, h } = setup($('cv2')), k = +$('k2').value; $('k2v').textContent = k; const s = Math.min(w * 0.8 / (1.74 * k), (h - 24) / (2 * k), 38), cx = (w - 1.74 * k * s) / 2 - 0.87 * s, cy = (h - 2 * k * s) / 2 + 0.5 * s;
  for (let z = 0; z < k; z++) for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) { const px = cx + (x + y) * s * 0.87 + 0, py = cy + (y - x) * s * 0.5 * -1 + (k - 1 - z) * s + (x - y) * 0; cubeIso(ctx, cx + (x - y + k) * s * 0.87, cy + (x + y) * s * 0.5 + (k - 1 - z) * s, s, ['#8fe3ff', '#4fa9c7', '#2f7e99']); }
  const c = cubeCount(k); $('ro2').textContent = t('s2ro', { k, v: c.volume, s: c.surface }); }
function render3() { const { ctx, w, h } = setup($('cv3')), s = +$('s3').value, S3 = +$('S3').value; $('s3v').textContent = s; $('S3v').textContent = S3; const r = 1.5 / s, H = treeHeight(1.5, s, S3), sc = Math.min((w - 70) / (S3 + 4), (h - 30) / (Math.max(H, 3) + 1)), gy = h - 18, x0 = 30;
  line(ctx, 10, gy, w - 10, gy, COL.muted, 2); const sx = x0 + 40; line(ctx, sx, gy, sx, gy - 1.5 * sc, COL.orange, 4); line(ctx, sx, gy, sx + s * sc, gy, '#4a4f57', 4); line(ctx, sx, gy - 1.5 * sc, sx + s * sc, gy, COL.orange, 1.5, [4, 4]);
  const tx = sx + s * sc + 30; line(ctx, tx, gy, tx, gy - H * sc, COL.green, 6); dot(ctx, tx, gy - H * sc - 6, Math.max(6, 0.12 * H * sc), 'rgba(116,223,170,0.5)'); line(ctx, tx, gy, tx + S3 * sc, gy, '#4a4f57', 5); line(ctx, tx, gy - H * sc, tx + S3 * sc, gy, COL.green, 1.5, [4, 4]);
  text(ctx, '1.5', sx - 6, gy - 0.75 * sc, { align: 'right', size: 11, color: COL.orange }); text(ctx, fmt(H) + ' m', tx - 8, gy - H * sc / 2, { align: 'right', size: 12, color: COL.green, bold: true });
  $('ro3').textContent = t('s3ro', { s, r: fmt(r), S: S3, H: fmt(H) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), L = +$('L4').value, N = DENS[S.den]; $('L4v').textContent = L; DENS.forEach((d, i) => { const b = $('d' + i); b.textContent = '1 : ' + d.toLocaleString('en-US'); b.classList.toggle('active', i === S.den); b.setAttribute('aria-pressed', i === S.den ? 'true' : 'false'); });
  const u = Math.min((w - 40) / 10, (h - 40) / 10), x0 = 20, y0 = h - 20; ctx.fillStyle = 'rgba(103,215,249,0.25)'; ctx.fillRect(x0, y0 - L * u, L * u, L * u); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.strokeRect(x0, y0 - L * u, L * u, L * u); for (let i = 0; i <= L; i++) { line(ctx, x0 + i * u, y0 - 4, x0 + i * u, y0 + 4, COL.muted, 1); } text(ctx, L + ' cm', x0 + L * u / 2, y0 + 16, { align: 'center', size: 11 });
  const R = mapReal(L, N); text(ctx, fmt(R) + ' km', x0 + L * u + 10, y0 - L * u / 2, { size: 13, color: COL.orange, bold: true }); text(ctx, fmt(R * R) + ' km²', x0 + L * u / 2, y0 - L * u / 2 + 4, { align: 'center', size: 12, color: COL.ink, bold: true }); $('ro4').textContent = t('s4ro', { N: N.toLocaleString('en-US'), L, R: fmt(R), A: fmt(L * L), AR: fmt(R * R) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), k = +$('g5').value; $('g5v').textContent = k; const q = squareCube(k), mx = 125, bw = (w - 40) / 4, base = h - 30, hh = h - 60;
  [['k', q.length, COL.cyan], ['k²', q.area, COL.green], ['k³', q.volume, COL.orange], ['k', q.stress, k > 3 ? COL.red : COL.violet]].forEach(([lab, v, col], i) => { const x = 20 + i * bw, bh = Math.max(2, v / mx * hh); ctx.fillStyle = col; ctx.fillRect(x + 8, base - bh, bw - 16, bh); text(ctx, fmt(v), x + bw / 2, base - bh - 5, { align: 'center', size: 12, color: COL.ink, bold: true }); text(ctx, lab, x + bw / 2, h - 12, { align: 'center', size: 12 }); });
  line(ctx, 20 + 3 * bw + 4, base - 3 / mx * hh, w - 16, base - 3 / mx * hh, COL.red, 1, [4, 3]); $('ro5').textContent = t('s5ro', { k, a: fmt(q.area), v: fmt(q.volume), st: fmt(q.stress), res: t(q.stress > 3 ? 'failRes' : 'okRes') }); }
function wire() {
  slider('k0', render0); slider('k1', render1); slider('k2', render2); slider('s3', render3); slider('S3', render3); DENS.forEach((d, i) => $('d' + i).addEventListener('click', () => { S.den = i; render4(); })); slider('L4', render4); slider('g5', render5);
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
if (typeof module !== 'undefined') module.exports = { scaleTri,angleAt,TRI,treeHeight,mapReal,squareCube,cubeCount };
