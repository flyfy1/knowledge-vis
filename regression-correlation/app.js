/* regression-correlation: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const gauss = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(6.283185307 * r());
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
/* Pearson correlation: the average product of the two standardised deviations. */
function pearson(xs, ys) { const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { const dx = x - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }); return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0; }
/* Least-squares line y = m x + b minimising the sum of squared vertical gaps. */
function lsq(xs, ys) { const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); }); const m = sxx > 0 ? sxy / sxx : 0; return { m, b: my - m * mx }; }
const sse = (xs, ys, m, b) => xs.reduce((s, x, i) => { const e = ys[i] - (m * x + b); return s + e * e; }, 0);
function cloud(rho, n, seed) { const r = rng(seed), xs = [], ys = []; for (let i = 0; i < n; i++) { const z1 = gauss(r), z2 = gauss(r); xs.push(z1); ys.push(rho * z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2); } return { xs, ys }; }
function smallSet() { const r = rng(7), xs = [], ys = []; for (let i = 1; i <= 12; i++) { xs.push(i); ys.push(2 + 0.9 * i + 1.4 * gauss(r)); } return { xs, ys }; }
function withOutlier(xo, yo) { const d = smallSet(); return { xs: d.xs.concat([xo]), ys: d.ys.concat([yo]), base: d }; }
function confounded(seed) { const r = rng(seed), T = [], x = [], y = []; for (let i = 0; i < 150; i++) { const t0 = 10 + 25 * r(); T.push(t0); x.push(3 * t0 + 14 * gauss(r)); y.push(0.4 * t0 + 2.2 * gauss(r)); } return { T, x, y }; }
function bands(c) { const idx = c.T.map((v, i) => i).sort((a, b) => c.T[a] - c.T[b]), out = [[], [], [], [], []]; idx.forEach((i, k) => out[Math.min(4, Math.floor(k / 30))].push(i)); return out; }
function shapeSet(kind, seed) { const r = rng(seed), xs = [], ys = [], n = 40; for (let i = 0; i < n; i++) { let x, y; if (kind === 'line') { x = -1 + 2 * (i + 0.5) / n; y = x + 0.25 * gauss(r); } else if (kind === 'curve') { x = -1 + 2 * (i + 0.5) / n; y = x * x + 0.04 * gauss(r); } else if (kind === 'ring') { const a = 6.2832 * (i + 0.5) / n; x = Math.cos(a) + 0.05 * gauss(r); y = Math.sin(a) + 0.05 * gauss(r); } else { x = 0.45 * gauss(r); y = 0.45 * gauss(r); if (i === n - 1) { x = 5; y = 5; } } xs.push(x); ys.push(y); } return { xs, ys }; }
function heights(rho, seed) { const r = rng(seed), P = [], C = []; for (let i = 0; i < 300; i++) { const p = 170 + 7 * gauss(r); P.push(p); C.push(170 + rho * (p - 170) + 7 * Math.sqrt(1 - rho * rho) * gauss(r)); } return { P, C }; }
const f2 = v => String(Math.round(v * 100) / 100), f1 = v => String(Math.round(v * 10) / 10), sg = v => (v >= 0 ? '+' : '') + f2(v);
const S = { rho0: 0.8, seed0: 1, m1: 0.3, b1: 6, sq1: false, xo2: 14, yo2: 3, hold2: false, split3: false, shape4: 'line', rho5: 0.5 };
const SC = { x: 40, y: 18 };
function scat(ctx, R, xr, yr, xt, yt) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); const X = v => R.x + (v - xr[0]) / (xr[1] - xr[0]) * R.w, Y = v => R.y + R.h - (v - yr[0]) / (yr[1] - yr[0]) * R.h; (xt || []).forEach(v => text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 })); (yt || []).forEach(v => text(ctx, String(v), R.x - 4, Y(v) + 4, { align: 'right', size: 10 })); return { X, Y }; }
function lineThrough(ctx, M, R, xr, m, b, col, lw, dash) { line(ctx, M.X(xr[0]), M.Y(m * xr[0] + b), M.X(xr[1]), M.Y(m * xr[1] + b), col, lw || 2.5, dash); }
function render0() { const { ctx, w, h } = setup($('cv0')), d = cloud(S.rho0, 80, S.seed0), R = { x: 30, y: 16, w: w - 46, h: h - 36 }, xr = [-3.2, 3.2], yr = [-3.2, 3.2], M = scat(ctx, R, xr, yr), mx = mean(d.xs), my = mean(d.ys), r = pearson(d.xs, d.ys);
  ctx.fillStyle = 'rgba(116,223,170,0.07)'; ctx.fillRect(M.X(mx), R.y, R.x + R.w - M.X(mx), M.Y(my) - R.y); ctx.fillRect(R.x, M.Y(my), M.X(mx) - R.x, R.y + R.h - M.Y(my)); ctx.fillStyle = 'rgba(224,100,78,0.07)'; ctx.fillRect(R.x, R.y, M.X(mx) - R.x, M.Y(my) - R.y); ctx.fillRect(M.X(mx), M.Y(my), R.x + R.w - M.X(mx), R.y + R.h - M.Y(my));
  line(ctx, M.X(mx), R.y, M.X(mx), R.y + R.h, COL.muted, 1, [4, 3]); line(ctx, R.x, M.Y(my), R.x + R.w, M.Y(my), COL.muted, 1, [4, 3]); d.xs.forEach((x, i) => dot(ctx, M.X(x), M.Y(d.ys[i]), 3.6, (x - mx) * (d.ys[i] - my) >= 0 ? COL.green : COL.red)); text(ctx, t('legPos'), R.x + 6, R.y + 14, { size: 11, color: COL.green }); text(ctx, t('legNeg'), R.x + 6, R.y + 30, { size: 11, color: COL.red });
  const pos = d.xs.filter((x, i) => (x - mx) * (d.ys[i] - my) >= 0).length; $('rho0v').textContent = S.rho0; $('ro0').textContent = t('s0ro', { rho: S.rho0, r: f2(r), pos, neg: d.xs.length - pos }); }
function render1() { const { ctx, w, h } = setup($('cv1')), d = smallSet(), R = { x: 30, y: 16, w: w - 46, h: h - 36 }, xr = [0, 13], yr = [0, 18], M = scat(ctx, R, xr, yr, [0, 4, 8, 12], [0, 6, 12, 18]), m = S.m1, b = S.b1, best = lsq(d.xs, d.ys), pxPerY = R.h / (yr[1] - yr[0]);
  d.xs.forEach((x, i) => { const yh = m * x + b, e = d.ys[i] - yh, sz = Math.abs(e) * pxPerY; ctx.fillStyle = 'rgba(246,164,91,0.22)'; ctx.fillRect(M.X(x), e > 0 ? M.Y(d.ys[i]) : M.Y(yh), sz, sz); line(ctx, M.X(x), M.Y(d.ys[i]), M.X(x), M.Y(yh), COL.orange, 1.5); });
  lineThrough(ctx, M, R, xr, m, b, COL.cyan, 2.5); if (S.sq1) lineThrough(ctx, M, R, xr, best.m, best.b, COL.green, 2, [6, 4]); d.xs.forEach((x, i) => dot(ctx, M.X(x), M.Y(d.ys[i]), 4.5, COL.ink)); const e = sse(d.xs, d.ys, m, b), eb = sse(d.xs, d.ys, best.m, best.b);
  text(ctx, t('legSq'), R.x + 6, R.y + 14, { size: 11, color: COL.orange }); $('m1v').textContent = m; $('b1v').textContent = b; $('best1').classList.toggle('active', S.sq1); $('ro1').textContent = t('s1ro', { m, b, sse: f2(e), bm: f2(best.m), bb: f2(best.b), bsse: f2(eb), gap: f2(e - eb) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), d = withOutlier(S.xo2, S.yo2), R = { x: 30, y: 16, w: w - 46, h: h - 36 }, xr = [0, 22], yr = [-6, 26], M = scat(ctx, R, xr, yr, [0, 5, 10, 15, 20], [-5, 5, 15, 25]), f0 = lsq(d.base.xs, d.base.ys), f1_ = lsq(d.xs, d.ys);
  lineThrough(ctx, M, R, xr, f0.m, f0.b, COL.muted, 2, [6, 4]); lineThrough(ctx, M, R, xr, f1_.m, f1_.b, COL.cyan, 2.5); d.base.xs.forEach((x, i) => dot(ctx, M.X(x), M.Y(d.base.ys[i]), 4, COL.ink)); dot(ctx, M.X(S.xo2), M.Y(S.yo2), 7, COL.red); text(ctx, t('outlier'), M.X(S.xo2) + 9, M.Y(S.yo2) - 6, { size: 11, color: COL.red });
  text(ctx, t('legWithout'), R.x + 6, R.y + 14, { size: 11, color: COL.muted }); text(ctx, t('legWith'), R.x + 6, R.y + 30, { size: 11, color: COL.cyan }); $('xo2v').textContent = S.xo2; $('yo2v').textContent = S.yo2; const r0 = pearson(d.base.xs, d.base.ys), r1 = pearson(d.xs, d.ys);
  $('ro2').textContent = t('s2ro', { xo: S.xo2, yo: S.yo2, m0: f2(f0.m), m1: f2(f1_.m), r0: f2(r0), r1: f2(r1) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), c = confounded(5), R = { x: 40, y: 16, w: w - 56, h: h - 40 }, xr = [0, 150], yr = [0, 20], M = scat(ctx, R, xr, yr, [0, 50, 100, 150], [0, 10, 20]), bs = bands(c), cols = [COL.cyan, COL.violet, COL.orange, COL.green, '#ffe45c'];
  if (S.split3) bs.forEach((b, k) => { b.forEach(i => dot(ctx, M.X(c.x[i]), M.Y(c.y[i]), 3.6, cols[k])); const f = lsq(b.map(i => c.x[i]), b.map(i => c.y[i])), xs = b.map(i => c.x[i]), a0 = Math.min(...xs), a1 = Math.max(...xs); line(ctx, M.X(a0), M.Y(f.m * a0 + f.b), M.X(a1), M.Y(f.m * a1 + f.b), cols[k], 3); }); else { c.x.forEach((x, i) => dot(ctx, M.X(x), M.Y(c.y[i]), 3.6, COL.ink)); const f = lsq(c.x, c.y); lineThrough(ctx, M, R, xr, f.m, f.b, COL.red, 2.5); }
  text(ctx, t('xLab3'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); text(ctx, t('yLab3'), R.x, R.y - 4, { size: 11 }); const rAll = pearson(c.x, c.y), rb = bs.map(b => pearson(b.map(i => c.x[i]), b.map(i => c.y[i])));
  $('split3').classList.toggle('active', S.split3); $('ro3').textContent = t('s3ro', { r: f2(rAll), rmax: f2(Math.max(...rb.map(Math.abs))), rmean: f2(mean(rb)), rT: f2(pearson(c.T, c.x)), rT2: f2(pearson(c.T, c.y)) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), d = shapeSet(S.shape4, 3), R = { x: 30, y: 16, w: w - 46, h: h - 36 }, ext = S.shape4 === 'outlier' ? 5.6 : 1.6, xr = [-ext, ext], yr = [-ext, ext], M = scat(ctx, R, xr, yr), f = lsq(d.xs, d.ys), r = pearson(d.xs, d.ys);
  lineThrough(ctx, M, R, xr, f.m, f.b, COL.red, 2.5, [6, 4]); d.xs.forEach((x, i) => dot(ctx, M.X(x), M.Y(d.ys[i]), 4, S.shape4 === 'outlier' && i === d.xs.length - 1 ? COL.red : COL.cyan)); ['line', 'curve', 'ring', 'outlier'].forEach(k => $('sh_' + k).classList.toggle('active', S.shape4 === k));
  $('ro4').textContent = t('s4ro', { shape: t('sh_' + S.shape4), r: f2(r), r2: f2(r * r), note: t('note_' + S.shape4) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), d = heights(S.rho5, 11), R = { x: 40, y: 16, w: w - 56, h: h - 40 }, xr = [145, 195], M = scat(ctx, R, xr, xr, [150, 160, 170, 180, 190], [150, 160, 170, 180, 190]), f = lsq(d.P, d.C), cut = 170 + 1.28 * 7;
  line(ctx, M.X(145), M.Y(145), M.X(195), M.Y(195), COL.muted, 1.5, [5, 4]); const topIdx = d.P.map((p, i) => i).filter(i => d.P[i] >= cut); d.P.forEach((p, i) => dot(ctx, M.X(p), M.Y(d.C[i]), 3, d.P[i] >= cut ? COL.orange : 'rgba(103,215,249,0.6)')); lineThrough(ctx, M, R, xr, f.m, f.b, COL.green, 2.5);
  const pm = mean(topIdx.map(i => d.P[i])), cmn = mean(topIdx.map(i => d.C[i])); line(ctx, M.X(pm), M.Y(145), M.X(pm), M.Y(pm), COL.orange, 1.5, [3, 3]); dot(ctx, M.X(pm), M.Y(cmn), 7, COL.orange); dot(ctx, M.X(pm), M.Y(pm), 5, COL.muted); text(ctx, t('xLab5'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); text(ctx, t('yLab5'), R.x, R.y - 4, { size: 11 }); text(ctx, t('legId'), R.x + 6, R.y + 14, { size: 11, color: COL.muted }); text(ctx, t('legFit'), R.x + 6, R.y + 30, { size: 11, color: COL.green });
  $('rho5v').textContent = S.rho5; $('ro5').textContent = t('s5ro', { rho: S.rho5, slope: f2(f.m), pm: f1(pm), cm: f1(cmn), gap: f1(pm - 170), cgap: f1(cmn - 170), n: topIdx.length }); }
function wire() {
  slider('rho0', v => { S.rho0 = v; render0(); }); $('nw0').addEventListener('click', () => { S.seed0++; render0(); }); slider('m1', v => { S.m1 = v; render1(); }); slider('b1', v => { S.b1 = v; render1(); }); $('best1').addEventListener('click', () => { S.sq1 = !S.sq1; render1(); }); $('snap1').addEventListener('click', () => { const b = lsq(smallSet().xs, smallSet().ys); S.m1 = Math.round(b.m * 20) / 20; S.b1 = Math.round(b.b * 10) / 10; $('m1').value = S.m1; $('b1').value = S.b1; render1(); });
  slider('xo2', v => { S.xo2 = v; render2(); }); slider('yo2', v => { S.yo2 = v; render2(); }); $('split3').addEventListener('click', () => { S.split3 = !S.split3; render3(); }); ['line', 'curve', 'ring', 'outlier'].forEach(k => $('sh_' + k).addEventListener('click', () => { S.shape4 = k; render4(); })); slider('rho5', v => { S.rho5 = v; render5(); });
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
if (typeof module !== 'undefined') module.exports = { rng, mean, pearson, lsq, sse, cloud, smallSet, withOutlier, confounded, bands, shapeSet, heights };
