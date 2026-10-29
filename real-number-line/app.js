/* real-number-line: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const diagonalLength = s => Math.hypot(s, s);
/* Closest fraction p/q to x over denominators 1..N (and the smallest |p^2 - 2 q^2| found, for x = sqrt 2). */
function bestFraction(N, x) { let best = null; for (let q = 1; q <= N; q++) { const p = Math.round(x * q), err = Math.abs(p / q - x); if (!best || err < best.err) best = { p, q, err }; } return best; }
const minPQ = N => { let m = Infinity; for (let q = 1; q <= N; q++) { const p = Math.round(Math.SQRT2 * q); m = Math.min(m, Math.abs(p * p - 2 * q * q)); } return m; };
/* Exact digits of sqrt(n) to k decimals using BigInt integer square root. */
function isqrt(v) { if (v < 2n) return v; let x = BigInt(Math.floor(Math.sqrt(Number(v)))); while (x * x > v) x--; while ((x + 1n) * (x + 1n) <= v) x++; return x; }
function sqrtDigits(n, k) { const s = isqrt(BigInt(n) * 10n ** BigInt(2 * k)).toString().padStart(k + 1, '0'); return k === 0 ? s : s.slice(0, s.length - k) + '.' + s.slice(s.length - k); }
const fracDigits = (num, den, k) => { const v = (BigInt(num) * 10n ** BigInt(k)) / BigInt(den), s = v.toString().padStart(k + 1, '0'); return k === 0 ? s : s.slice(0, s.length - k) + '.' + s.slice(s.length - k); };
function bisectStep(lo, hi) { const m = (lo + hi) / 2, small = m * m < 2; return { lo: small ? m : lo, hi: small ? hi : m, m, m2: m * m, small }; }
function spiral(n) { const pts = [[1, 0]]; for (let k = 0; k < n; k++) { const [x, y] = pts[k], r = Math.hypot(x, y); pts.push([x - y / r, y + x / r]); } return pts; }
const isPerfectSquare = n => Number.isInteger(Math.sqrt(n));
const fmt = v => String(Math.round(v * 1e6) / 1e6);
const S = { w: 2, lo: 1, hi: 2, k: 0, hist: [{ lo: 1, hi: 2 }], last: null };
function numLine(ctx, w, y, lo, hi, step) { const X = v => 20 + (v - lo) / (hi - lo) * (w - 40); line(ctx, 20, y, w - 20, y, COL.muted, 2); for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) { line(ctx, X(v), y - 5, X(v), y + 5, COL.muted, 1.5); text(ctx, String(Math.round(v * 1e6) / 1e6), X(v), y + 18, { align: 'center', size: 10 }); } return X; }
function render0() { const { ctx, w, h } = setup($('cv0')), a = +$('r0').value; $('r0v').textContent = a; const sc = (w - 60) / 2, ox = 24, oy = h - 34, d = diagonalLength(1), th = a * Math.PI / 180;
  ctx.fillStyle = 'rgba(103,215,249,0.18)'; ctx.fillRect(ox, oy - sc, sc, sc); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.strokeRect(ox, oy - sc, sc, sc); text(ctx, '1', ox + sc / 2, oy - sc - 6, { align: 'center', size: 12, color: COL.cyan }); line(ctx, ox - 6, oy, w - 14, oy, COL.muted, 2); [0, 1, 2].forEach(v => { line(ctx, ox + v * sc, oy - 5, ox + v * sc, oy + 5, COL.muted, 1.5); text(ctx, String(v), ox + v * sc, oy + 20, { align: 'center', size: 11 }); });
  ctx.strokeStyle = COL.dim; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ox, oy, d * sc, -Math.PI / 4, 0); ctx.stroke(); const px = ox + Math.cos(th) * d * sc, py = oy - Math.sin(th) * d * sc; line(ctx, ox, oy, px, py, COL.orange, 3); dot(ctx, px, py, 6, COL.orange); if (a === 0) { dot(ctx, px, oy, 8, COL.orange); text(ctx, '√2', px, oy - 14, { align: 'center', size: 13, color: COL.orange, bold: true }); }
  $('ro0').textContent = t('s0ro', { d: fmt(d), a, x: fmt(Math.cos(th) * d), y: fmt(Math.sin(th) * d) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), N = +$('N1').value; $('N1v').textContent = N; const b = bestFraction(N, Math.SQRT2), L = { x: 44, y: 14, w: w - 60, h: h - 44 }, X = n => L.x + (n - 1) / 199 * L.w, Y = e => L.y + L.h - (Math.log10(Math.max(e, 1e-6)) + 6) / 6 * L.h;
  line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [[0.1, '10⁻¹'], [0.001, '10⁻³'], [1e-5, '10⁻⁵']].forEach(([e, l]) => text(ctx, l, L.x - 4, Y(e) + 4, { align: 'right', size: 10 })); [1, 100, 200].forEach(n => text(ctx, String(n), X(n), L.y + L.h + 14, { align: 'center', size: 10 }));
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); for (let n = 1; n <= 200; n++) { const e = bestFraction(n, Math.SQRT2).err, px = X(n), py = Y(e); n > 1 ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); dot(ctx, X(N), Y(b.err), 6, COL.orange); text(ctx, b.p + '/' + b.q, Math.min(L.x + L.w - 30, X(N) + 10), Y(b.err) - 10, { size: 12, color: COL.orange, bold: true });
  $('ro1').textContent = t('s1ro', { N, p: b.p, q: b.q, v: fmt(b.p / b.q), err: b.err.toExponential(2), m: minPQ(N) }); }
const W2 = { 2: { name: 'w2', dig: k => sqrtDigits(2, k) }, 3: { name: 'w3', dig: k => fracDigits(1, 3, k) }, 4: { name: 'w4', dig: k => fracDigits(1, 4, k) } };
function render2() { const { ctx, w, h } = setup($('cv2')), k = +$('k2').value; $('k2v').textContent = k; [2, 3, 4].forEach(i => { const b = $('w' + i + 'b'); b.classList.toggle('active', i === S.w); b.setAttribute('aria-pressed', i === S.w ? 'true' : 'false'); });
  const cfg = W2[S.w], digs = cfg.dig(k), lo = digs, hiN = (BigInt(digs.replace('.', '')) + 1n).toString().padStart(digs.replace('.', '').length, '0'), hi = k === 0 ? hiN : hiN.slice(0, hiN.length - k) + '.' + hiN.slice(hiN.length - k);
  const loV = parseFloat(lo), width = Math.pow(10, -k), y = h * 0.34; const Xc = v => 20 + (v - loV) / width * (w - 40) / 1; line(ctx, 20, y, w - 20, y, COL.muted, 2); for (let i = 0; i <= 10; i++) { const x = 20 + i / 10 * (w - 40); line(ctx, x, y - 5, x, y + 5, COL.muted, 1.5); } const val = S.w === 2 ? Math.SQRT2 : S.w === 3 ? 1 / 3 : 0.25; const fr = Math.max(0, Math.min(1, (val - loV) / width)); dot(ctx, 20 + fr * (w - 40), y, 7, COL.orange);
  text(ctx, lo, 20, y + 22, { size: 11, color: COL.ink }); text(ctx, hi, w - 20, y + 22, { align: 'right', size: 11, color: COL.ink });
  const ds = digs.split(''), bw = Math.min(26, (w - 20) / (ds.length + 1)); ds.forEach((c, i) => { const x = 10 + i * bw; ctx.fillStyle = c === '.' ? 'transparent' : '#243846'; if (c !== '.') ctx.fillRect(x, h * 0.62, bw - 3, 30); text(ctx, c, x + (bw - 3) / 2, h * 0.62 + 21, { align: 'center', size: 15, color: c === '.' ? COL.orange : COL.ink, bold: true }); });
  $('ro2').textContent = t('s2ro', { name: t(cfg.name), k, digits: digs, lo, hi }); }
function render3() { const { ctx, w, h } = setup($('cv3')), rows = S.hist, X = v => 20 + (v - 1) / 1 * (w - 40), rh = Math.min(22, (h - 40) / Math.max(rows.length, 6)); line(ctx, 20, 16, w - 20, 16, COL.muted, 2); [1, 1.5, 2].forEach(v => { line(ctx, X(v), 11, X(v), 21, COL.muted, 1.5); text(ctx, String(v), X(v), 8, { align: 'center', size: 10 }); }); line(ctx, X(Math.SQRT2), 12, X(Math.SQRT2), h - 10, COL.green, 1, [3, 4]);
  rows.forEach((r, i) => { const y = 30 + i * rh; ctx.fillStyle = i === rows.length - 1 ? COL.orange : COL.cyan; ctx.fillRect(X(r.lo), y, Math.max(2, X(r.hi) - X(r.lo)), rh - 4); });
  const last = rows[rows.length - 1]; $('ro3').textContent = S.last ? t('s3ro', { k: rows.length - 1, lo: fmt(last.lo), hi: fmt(last.hi), w: fmt(last.hi - last.lo), m: fmt(S.last.m), m2: fmt(S.last.m2), cmp: t(S.last.small ? 'lt' : 'ge') }) : t('s3roStart'); $('bis').disabled = rows.length > 30; $('bis10').disabled = rows.length > 21; }
function bisect() { const r = bisectStep(S.hist[S.hist.length - 1].lo, S.hist[S.hist.length - 1].hi); S.hist.push({ lo: r.lo, hi: r.hi }); S.last = r; }
function render4() { const { ctx, w, h } = setup($('cv4')), n = +$('n4').value; $('n4v').textContent = n; const pts = spiral(n), R = Math.sqrt(n + 1), sc = Math.min(w, h) * 0.46 / R, cx = w * 0.42, cy = h / 2; let c = 0;
  for (let k = 0; k < n; k++) { const a = pts[k], b = pts[k + 1], sq = Math.sqrt(k + 2), isInt = isPerfectSquare(k + 2); if (isInt) c++; ctx.fillStyle = isInt ? 'rgba(116,223,170,0.35)' : 'rgba(103,215,249,0.18)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + a[0] * sc, cy - a[1] * sc); ctx.lineTo(cx + b[0] * sc, cy - b[1] * sc); ctx.closePath(); ctx.fill(); ctx.strokeStyle = isInt ? COL.green : COL.cyan; ctx.lineWidth = 1.2; ctx.stroke(); }
  const last = pts[n]; text(ctx, '√' + (n + 1), cx + last[0] * sc * 1.08 + 4, cy - last[1] * sc * 1.08, { size: 12, color: COL.orange, bold: true }); dot(ctx, cx, cy, 3, COL.ink); $('ro4').textContent = t('s4ro', { n, k: n + 1, v: fmt(Math.sqrt(n + 1)), c: Array.from({ length: n }, (_, k) => k + 2).filter(isPerfectSquare).length }); }
function render5() { const { ctx, w, h } = setup($('cv5')), n = Math.max(1, Math.min(200, Math.round(+$('n5').value) || 1)), r = Math.sqrt(n), X = numLine(ctx, w, h * 0.55, 0, 15, 1); dot(ctx, X(r), h * 0.55, 8, isPerfectSquare(n) ? COL.green : COL.orange); text(ctx, '√' + n, X(r), h * 0.55 - 14, { align: 'center', size: 12, color: COL.ink, bold: true });
  $('ro5').textContent = t('s5ro', { n, digits: sqrtDigits(n, 20), kind: isPerfectSquare(n) ? t('kInt', { r, n }) : t('kIrr', { n }) }); }
function wire() {
  slider('r0', render0); slider('N1', render1); [2, 3, 4].forEach(i => $('w' + i + 'b').addEventListener('click', () => { S.w = i; render2(); })); slider('k2', render2);
  $('bis').addEventListener('click', () => { if (S.hist.length <= 30) bisect(); render3(); }); $('bis10').addEventListener('click', () => { for (let i = 0; i < 10 && S.hist.length <= 30; i++) bisect(); render3(); }); $('rb').addEventListener('click', () => { S.hist = [{ lo: 1, hi: 2 }]; S.last = null; render3(); });
  slider('n4', render4); $('n5').addEventListener('input', render5);
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
if (typeof module !== 'undefined') module.exports = { diagonalLength,bestFraction,sqrtDigits,bisectStep,spiral,isPerfectSquare,minPQ };
