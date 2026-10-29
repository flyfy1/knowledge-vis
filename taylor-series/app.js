/* taylor-series: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const FN = {
  sin: { f: Math.sin, c: (k, a) => Math.sin(a + k * Math.PI / 2) / fact(k), rad: Infinity },
  cos: { f: Math.cos, c: (k, a) => Math.cos(a + k * Math.PI / 2) / fact(k), rad: Infinity },
  exp: { f: Math.exp, c: (k, a) => Math.exp(a) / fact(k), rad: Infinity },
  geo: { f: x => 1 / (1 - x), c: (k, a) => 1 / Math.pow(1 - a, k + 1), rad: 1 },
  ln: { f: x => Math.log(1 + x), c: (k, a) => k === 0 ? Math.log(1 + a) : Math.pow(-1, k - 1) / (k * Math.pow(1 + a, k)), rad: 1 }
};
function fact(k) { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; }
/* Taylor polynomial of degree n around a: sum of c_k (x-a)^k with c_k = f^(k)(a)/k!. */
const taylor = (id, n, a, x) => { let s = 0; for (let k = 0; k <= n; k++) s += FN[id].c(k, a) * Math.pow(x - a, k); return s; };
const coeffs = (id, n, a) => Array.from({ length: n + 1 }, (_, k) => FN[id].c(k, a));
const err = (id, n, a, x) => Math.abs(FN[id].f(x) - taylor(id, n, a, x));
/* Cosine Fourier partial sum of g(x) = 1/(1+x^2) on [-pi, pi] (an even function), coefficients by Simpson's rule. */
const G = x => 1 / (1 + x * x), FC = [];
function fcoef(k) { if (FC[k] !== undefined) return FC[k]; const N = 2000, h = 2 * Math.PI / N; let s = 0; for (let i = 0; i <= N; i++) { const x = -Math.PI + i * h, w = i === 0 || i === N ? 1 : i % 2 ? 4 : 2; s += w * G(x) * Math.cos(k * x); } return (FC[k] = s * h / 3 / Math.PI); }
const fourier = (N, x) => { let s = fcoef(0) / 2; for (let k = 1; k <= N; k++) s += fcoef(k) * Math.cos(k * x); return s; };
const termsNeeded = (x, tol) => { let s = 0, term = 1; for (let k = 0; k < 60; k++) { s += term; if (Math.abs(Math.exp(x) - s) < tol) return k; term *= x / (k + 1); } return 60; };
const NAMES = { sin: 'sin x', cos: 'cos x', exp: 'eˣ', geo: '1/(1−x)', ln: 'ln(1+x)' };
const f2 = v => String(Math.round(v * 100) / 100), sci = v => Math.abs(v) < 1e-3 && v !== 0 ? v.toExponential(1).replace('e-', '×10⁻') : (Math.abs(v) >= 1e4 ? v.toExponential(1).replace('e+', '×10^') : String(Math.round(v * 10000) / 10000));
const S = { n0: 3, id1: 'sin', n1: 5, a1: 0, id2: 'geo', n2: 6, n3: 5, id3: 'exp', x4: 1, ng: 6, nf: 4 };
function axes(ctx, R, xr, yr, X, Y) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); if (yr[0] < 0) line(ctx, R.x, Y(0), R.x + R.w, Y(0), COL.muted, 1); if (xr[0] < 0) line(ctx, X(0), R.y, X(0), R.y + R.h, COL.muted, 1); for (let v = Math.ceil(xr[0]); v <= xr[1]; v++) text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 }); }
function curve(ctx, fn, xr, X, Y, yr, col, lw, dash) { ctx.save(); ctx.beginPath(); ctx.rect(X(xr[0]) - 1, Y(yr[1]), X(xr[1]) - X(xr[0]) + 2, Y(yr[0]) - Y(yr[1])); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let pen = false; for (let i = 0; i <= 300; i++) { const x = xr[0] + (xr[1] - xr[0]) * i / 300, y = fn(x); if (!isFinite(y)) { pen = false; continue; } pen ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); pen = true; } ctx.stroke(); ctx.restore(); }
function plotFn(ctx, w, h, id, n, a, opt) { const R = { x: 30, y: 14, w: w - 44, h: h - 38 }, xr = opt.xr || [-4, 4], yr = opt.yr || [-3, 3], X = x => R.x + (x - xr[0]) / (xr[1] - xr[0]) * R.w, Y = y => R.y + R.h - (y - yr[0]) / (yr[1] - yr[0]) * R.h; axes(ctx, R, xr, yr, X, Y); curve(ctx, FN[id].f, xr, X, Y, yr, COL.cyan, 2.5); curve(ctx, x => taylor(id, n, a, x), xr, X, Y, yr, COL.orange, 2.5); dot(ctx, X(a), Y(FN[id].f(a)), 5, COL.ink); text(ctx, NAMES[id], R.x + 6, R.y + 14, { size: 12, color: COL.cyan }); text(ctx, t('legPoly', { n }), R.x + 6, R.y + 30, { size: 12, color: COL.orange }); return { X, Y, R, xr, yr }; }
function render0() { const { ctx, w, h } = setup($('cv0')), n = S.n0; plotFn(ctx, w, h, 'sin', n, 0, {}); $('n0v').textContent = n; const x = 1.5; $('ro0').textContent = t('s0ro', { n, p: f2(taylor('sin', n, 0, x)), s: f2(Math.sin(x)), e: sci(err('sin', n, 0, x)), terms: coeffs('sin', n, 0).map((c, k) => c === 0 || Math.abs(c) < 1e-12 ? null : (c < 0 ? '−' : '+') + sci(Math.abs(c)) + 'x^' + k).filter(Boolean).join(' ').replace(/^\+/, '') || '0' }); }
function render1() { const { ctx, w, h } = setup($('cv1')), id = S.id1, yr = id === 'exp' ? [-1, 8] : id === 'geo' ? [-3, 5] : id === 'ln' ? [-3, 3] : [-3, 3], xr = id === 'ln' || id === 'geo' ? [-1.5, 3] : [-4, 4]; plotFn(ctx, w, h, id, S.n1, S.a1, { xr, yr }); Object.keys(FN).forEach(k => $('f1_' + k).classList.toggle('active', k === id)); $('n1v').textContent = S.n1; $('a1v').textContent = S.a1;
  const x = S.a1 + 0.3; $('ro1').textContent = t('s1ro', { name: NAMES[id], n: S.n1, a: S.a1, x: f2(x), p: sci(taylor(id, S.n1, S.a1, x)), f: sci(FN[id].f(x)), near: sci(err(id, S.n1, S.a1, S.a1 + 0.3)), far: sci(err(id, S.n1, S.a1, S.a1 + 2.3)) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), id = S.id2, n = S.n2, a = 0, R = { x: 40, y: 18, w: w - 56, h: h - 56 }, xr = [-2, 2], X = x => R.x + (x - xr[0]) / 4 * R.w, Y = lg => R.y + R.h - (lg + 8) / 10 * R.h; axes(ctx, R, xr, [-8, 2], X, Y); [-8, -6, -4, -2, 0, 2].forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, '10^' + v, R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); });
  const rad = FN[id].rad; if (isFinite(rad)) { ctx.fillStyle = 'rgba(224,100,78,0.1)'; ctx.fillRect(R.x, R.y, X(-rad) - R.x, R.h); ctx.fillRect(X(rad), R.y, R.x + R.w - X(rad), R.h); line(ctx, X(rad), R.y, X(rad), R.y + R.h, COL.red, 1.5, [4, 3]); line(ctx, X(-rad), R.y, X(-rad), R.y + R.h, COL.red, 1.5, [4, 3]); text(ctx, t('radLab'), X(rad) + 4, R.y + 14, { size: 11, color: COL.red }); }
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); let pen = false; for (let i = 0; i <= 200; i++) { const x = xr[0] + 4 * i / 200; if (id === 'geo' && x >= 0.999) { pen = false; continue; } const e = err(id, n, a, x), lg = Math.log10(Math.max(1e-9, e)); if (id === 'ln' && x <= -0.999) { pen = false; continue; } pen ? ctx.lineTo(X(x), Y(Math.min(2, lg))) : ctx.moveTo(X(x), Y(Math.min(2, lg))); pen = true; } ctx.stroke(); ['geo', 'ln', 'sin'].forEach(k => $('f2_' + k).classList.toggle('active', k === id)); text(ctx, t('errAxis'), R.x, R.y - 5, { size: 11 }); text(ctx, 'x', R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 });
  $('n2v').textContent = n; $('ro2').textContent = t('s2ro', { name: NAMES[id], n, e5: sci(err(id, n, 0, 0.5)), e15: sci(err(id, n, 0, 1.5)), rad: isFinite(rad) ? rad : t('inf'), kind: t(isFinite(rad) ? 'limited' : 'everywhere') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), id = S.id3, n = S.n3, c = coeffs(id, 9, 0), R = { x: 36, y: 22, w: w - 52, h: h - 64 }, m = Math.max(0.1, ...c.map(Math.abs)) * 1.15, bw = R.w / 10; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); const Y = v => R.y + R.h / 2 - v / m * R.h / 2; line(ctx, R.x, Y(0), R.x + R.w, Y(0), COL.muted, 1);
  c.forEach((v, k) => { const y0 = Y(0), y1 = Y(v); ctx.fillStyle = k <= n ? (v >= 0 ? 'rgba(103,215,249,0.7)' : 'rgba(224,100,78,0.7)') : COL.dim; ctx.fillRect(R.x + k * bw + 3, Math.min(y0, y1), bw - 6, Math.abs(y1 - y0) || 1); text(ctx, 'x^' + k, R.x + k * bw + bw / 2, R.y + R.h + 13, { align: 'center', size: 10 }); text(ctx, sci(v), R.x + k * bw + bw / 2, (v >= 0 ? Y(v) - 4 : Y(v) + 12), { align: 'center', size: 9 }); });
  ['sin', 'exp', 'ln'].forEach(k => $('f3_' + k).classList.toggle('active', k === id)); text(ctx, t('coefTitle', { name: NAMES[id] }), R.x, R.y - 6, { size: 11 }); $('n3v').textContent = n; $('ro3').textContent = t('s3ro', { name: NAMES[id], k: Math.min(n, 3), c3: sci(FN[id].c(3, 0)), f3: sci(FN[id].c(3, 0) * fact(3)), n }); }
function render4() { const { ctx, w, h } = setup($('cv4')), x = S.x4, R = { x: 40, y: 18, w: w - 56, h: h - 56 }, terms = []; let tm = 1; for (let k = 0; k < 20; k++) { terms.push(tm); tm *= x / (k + 1); } const ymax = Math.max(1, ...terms.map(Math.abs)) * 1.1; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); const bw = R.w / 20, Y = v => R.y + R.h - v / ymax * R.h;
  terms.forEach((v, k) => { ctx.fillStyle = 'rgba(103,215,249,0.65)'; ctx.fillRect(R.x + k * bw + 2, Y(Math.abs(v)), bw - 4, Y(0) - Y(Math.abs(v))); text(ctx, String(k), R.x + k * bw + bw / 2, R.y + R.h + 13, { align: 'center', size: 10 }); }); const need = termsNeeded(x, 5e-7); line(ctx, R.x + (need + 1) * bw, R.y, R.x + (need + 1) * bw, R.y + R.h, COL.green, 2, [4, 3]); text(ctx, t('enough', { n: need }), R.x + Math.min((need + 1) * bw + 5, R.w - 120), R.y + 14, { size: 11, color: COL.green }); text(ctx, t('termAxis'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 });
  let s = 0; for (let k = 0; k <= need; k++) s += terms[k] === undefined ? 0 : terms[k]; $('x4v').textContent = x; $('ro4').textContent = t('s4ro', { x, need, approx: sci(taylor('exp', need, 0, x)), exact: sci(Math.exp(x)), sa: sci(taylor('sin', 3, 0, 0.5)), se: sci(Math.sin(0.5)), sse: sci(Math.abs(Math.sin(0.5) - 0.5)) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), R = { x: 30, y: 14, w: w - 44, h: h - 38 }, xr = [-3.2, 3.2], yr = [-0.4, 1.6], X = x => R.x + (x - xr[0]) / 6.4 * R.w, Y = y => R.y + R.h - (y - yr[0]) / 2 * R.h; axes(ctx, R, xr, yr, X, Y); line(ctx, X(-Math.PI), R.y, X(-Math.PI), R.y + R.h, COL.grid, 1, [3, 3]); line(ctx, X(Math.PI), R.y, X(Math.PI), R.y + R.h, COL.grid, 1, [3, 3]); curve(ctx, G, xr, X, Y, yr, COL.cyan, 2.5); curve(ctx, x => taylor0g(S.ng, x), xr, X, Y, yr, COL.orange, 2.5); curve(ctx, x => fourier(S.nf, x), xr, X, Y, yr, COL.green, 2.5, [6, 4]);
  text(ctx, t('legG'), R.x + 6, R.y + 14, { size: 12, color: COL.cyan }); text(ctx, t('legT', { n: S.ng }), R.x + 6, R.y + 30, { size: 12, color: COL.orange }); text(ctx, t('legF', { n: S.nf }), R.x + 6, R.y + 46, { size: 12, color: COL.green }); $('ng5v').textContent = S.ng; $('nf5v').textContent = S.nf; const x = 2.5;
  $('ro5').textContent = t('s5ro', { x, g: sci(G(x)), tay: sci(taylor0g(S.ng, x)), fou: sci(fourier(S.nf, x)), et: sci(Math.abs(G(x) - taylor0g(S.ng, x))), ef: sci(Math.abs(G(x) - fourier(S.nf, x))) }); }
function taylor0g(n, x) { let s = 0; for (let k = 0; k <= n; k += 2) s += Math.pow(-1, k / 2) * Math.pow(x, k); return s; }
function wire() {
  slider('n0', v => { S.n0 = v; render0(); }); Object.keys(FN).forEach(k => $('f1_' + k).addEventListener('click', () => { S.id1 = k; if ((k === 'geo' || k === 'ln') && S.a1 <= -1) S.a1 = 0; render1(); })); slider('n1', v => { S.n1 = v; render1(); }); slider('a1', v => { S.a1 = v; render1(); });
  ['geo', 'ln', 'sin'].forEach(k => $('f2_' + k).addEventListener('click', () => { S.id2 = k; render2(); })); slider('n2', v => { S.n2 = v; render2(); }); ['sin', 'exp', 'ln'].forEach(k => $('f3_' + k).addEventListener('click', () => { S.id3 = k; render3(); })); slider('n3', v => { S.n3 = v; render3(); }); slider('x4', v => { S.x4 = v; render4(); }); slider('ng5', v => { S.ng = v; render5(); }); slider('nf5', v => { S.nf = v; render5(); });
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
if (typeof module !== 'undefined') module.exports = { FN, taylor, coeffs, err, fourier, fcoef, termsNeeded, taylor0g, fact };
