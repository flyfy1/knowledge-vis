/* sequences-series: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const arith = (a1, d, n) => a1 + (n - 1) * d;
const arithSum = (a1, d, n) => n * (2 * a1 + (n - 1) * d) / 2;
const geo = (a1, r, n) => a1 * Math.pow(r, n - 1);
const geoSum = (a1, r, n) => r === 1 ? a1 * n : a1 * (1 - Math.pow(r, n)) / (1 - r);
const geoLimit = (a1, r) => Math.abs(r) < 1 ? a1 / (1 - r) : null;
/* First n at which the geometric partial sum overtakes the arithmetic one (both from term 1), or null within the horizon. */
function crossover(a1, d, b1, r, horizon) { for (let n = 2; n <= horizon; n++) if (geoSum(b1, r, n) > arithSum(a1, d, n)) return n; return null; }
const QUIZ = [{ seq: [3, 7, 11, 15], kind: 'arith', next: 19, par: 4 }, { seq: [2, 6, 18, 54], kind: 'geo', next: 162, par: 3 }, { seq: [1, 4, 9, 16], kind: 'neither', next: 25, par: 0 }, { seq: [100, 90, 80, 70], kind: 'arith', next: 60, par: -10 }, { seq: [64, 32, 16, 8], kind: 'geo', next: 4, par: 0.5 }];
const classify = seq => { const d = seq[1] - seq[0]; if (seq.every((v, i) => i === 0 || Math.abs(v - seq[i - 1] - d) < 1e-9)) return 'arith'; const r = seq[1] / seq[0]; if (seq.every((v, i) => i === 0 || Math.abs(v / seq[i - 1] - r) < 1e-9)) return 'geo'; return 'neither'; };
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100), sci = v => Math.abs(v) >= 1e6 ? v.toExponential(2).replace('e+', '×10^') : String(Math.round(v * 100) / 100);
const S = { a1: 2, d: 3, n1: 8, r2: 2, n2: 12, r3: 0.5, n3: 10, d4: 20, r4: 1.06, i5: 0, pick5: '', chk5: false };
function ax(ctx, R) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); }
function syncAD() { ['a10', 'a11'].forEach(id => { $(id).value = S.a1; $(id + 'v').textContent = S.a1; }); ['d0', 'd1'].forEach(id => { $(id).value = S.d; $(id + 'v').textContent = S.d; }); }
function render0() { const { ctx, w, h } = setup($('cv0')), n = 10, R = { x: 30, y: 16, w: w - 46, h: h - 36 }, ys = Array.from({ length: n }, (_, i) => arith(S.a1, S.d, i + 1)), ym = Math.max(10, ...ys) * 1.1, bw = R.w / n; ax(ctx, R); const Y = v => R.y + R.h - v / ym * R.h;
  ys.forEach((v, i) => { ctx.fillStyle = i === 0 ? COL.green : 'rgba(103,215,249,0.55)'; ctx.fillRect(R.x + i * bw + 3, Y(Math.max(0, v)), bw - 6, Y(0) - Y(Math.max(0, v))); text(ctx, String(v), R.x + i * bw + bw / 2, Y(Math.max(0, v)) - 5, { align: 'center', size: 10 }); text(ctx, 'a' + (i + 1), R.x + i * bw + bw / 2, R.y + R.h + 13, { align: 'center', size: 10 }); if (i) { const x = R.x + i * bw; line(ctx, x - 2, Y(ys[i - 1]), x + 6, Y(ys[i - 1]), COL.orange, 2); text(ctx, '+' + S.d, x + 2, Y(ys[i - 1]) - 14, { size: 9, color: COL.orange }); } });
  syncAD(); $('ro0').textContent = t('s0ro', { a1: S.a1, d: S.d, a5: arith(S.a1, S.d, 5), a10: arith(S.a1, S.d, 10), form: S.a1 + ' + (n−1)×' + S.d }); }
function render1() { const { ctx, w, h } = setup($('cv1')), n = S.n1, a = S.a1, d = S.d, an = arith(a, d, n), R = { x: 20, y: 24, w: w - 40, h: h - 56 }, tot = a + an, bh = R.h / n; ax(ctx, R); const X = v => R.x + v / tot * R.w;
  for (let i = 0; i < n; i++) { const v = arith(a, d, i + 1), y = R.y + i * bh; ctx.fillStyle = 'rgba(103,215,249,0.6)'; ctx.fillRect(R.x, y + 1, X(Math.max(0, v)) - R.x, bh - 2); ctx.fillStyle = 'rgba(246,164,91,0.6)'; ctx.fillRect(X(Math.max(0, v)), y + 1, X(tot) - X(Math.max(0, v)), bh - 2); text(ctx, String(v), R.x + 4, y + bh / 2 + 4, { size: 10, color: '#0a0e14' }); }
  text(ctx, t('rectTitle', { w: tot, n }), R.x, 14, { size: 12, color: COL.ink }); text(ctx, t('legFwd'), R.x, R.y + R.h + 14, { size: 11, color: COL.cyan }); text(ctx, t('legRev'), R.x + R.w, R.y + R.h + 14, { size: 11, color: COL.orange, align: 'right' }); syncAD(); $('n1v').textContent = n; $('ro1').textContent = t('s1ro', { n, a1: a, an, rect: n * tot, half: arithSum(a, d, n), chk: (function () { let s = 0; for (let i = 1; i <= n; i++) s += arith(a, d, i); return s; })() }); }
function render2() { const { ctx, w, h } = setup($('cv2')), r = S.r2, n = S.n2, R = { x: 30, y: 16, w: w - 46, h: h * 0.5 }, cols = 8, rows = 8, cw = Math.min(R.w / cols, (h * 0.5) / rows), ox = R.x + (R.w - cw * cols) / 2; for (let k = 1; k <= 64; k++) { const i = (k - 1) % cols, j = Math.floor((k - 1) / cols), lg = Math.log10(Math.max(1, geo(1, r, k))), mx = Math.log10(Math.max(2, geo(1, r, 64))); ctx.fillStyle = k <= n ? 'rgba(246,164,91,' + (0.2 + 0.7 * lg / mx) + ')' : COL.dim; ctx.fillRect(ox + i * cw + 1, R.y + j * cw + 1, cw - 2, cw - 2); }
  const P = { x: 40, y: R.y + cw * rows + 24, w: w - 56, h: h - R.y - cw * rows - 56 }; ctx.strokeStyle = COL.grid; ctx.strokeRect(P.x, P.y, P.w, P.h); const lm = Math.max(1, Math.log10(geo(1, r, n) + 1)), Y = v => P.y + P.h - Math.log10(Math.max(1, v)) / Math.max(1, Math.log10(geo(1, r, 64))) * P.h; ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 1; k <= 64; k++) { const x = P.x + (k - 1) / 63 * P.w; k > 1 ? ctx.lineTo(x, Y(geo(1, r, k))) : ctx.moveTo(x, Y(geo(1, r, k))); } ctx.stroke(); dot(ctx, P.x + (n - 1) / 63 * P.w, Y(geo(1, r, n)), 5, COL.orange); text(ctx, t('logAxis'), P.x, P.y - 5, { size: 10 }); text(ctx, t('squareAxis'), P.x + P.w, P.y + P.h + 13, { align: 'right', size: 10 });
  $('r2v').textContent = r; $('n2v').textContent = n; $('ro2').textContent = t('s2ro', { r, n, term: sci(geo(1, r, n)), sum: sci(geoSum(1, r, n)), s64: sci(geoSum(1, r, 64)), lin: arith(1, 1, 64) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), r = S.r3, n = S.n3, R = { x: 40, y: 18, w: w - 56, h: h - 56 }, sums = Array.from({ length: n }, (_, i) => geoSum(1, r, i + 1)), lim = geoLimit(1, r), ymax = lim === null ? Math.max(2, ...sums.map(Math.abs)) * 1.1 : Math.max(2.2, Math.abs(lim) * 1.2, ...sums.map(Math.abs)) * 1.05, ymin = Math.min(0, ...sums, lim === null ? 0 : lim) * 1.1; ax(ctx, R); const Y = v => R.y + R.h - (v - ymin) / (ymax - ymin) * R.h, X = i => R.x + i / n * R.w;
  line(ctx, R.x, Y(0), R.x + R.w, Y(0), COL.muted, 1); if (lim !== null) { line(ctx, R.x, Y(lim), R.x + R.w, Y(lim), COL.green, 1.5, [5, 4]); text(ctx, t('limLine', { v: f2(lim) }), R.x + R.w - 4, Y(lim) - 5, { align: 'right', size: 11, color: COL.green }); }
  sums.forEach((v, i) => { ctx.fillStyle = 'rgba(103,215,249,0.55)'; const y0 = Y(0), y1 = Y(v); ctx.fillRect(X(i) + 2, Math.min(y0, y1), R.w / n - 4, Math.abs(y1 - y0)); }); text(ctx, t('stepAxis'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); $('r3v').textContent = r; $('n3v').textContent = n;
  $('ro3').textContent = t('s3ro', { r, n, sn: f2(sums[n - 1]), lim: lim === null ? t('diverges') : f2(lim), gap: lim === null ? '—' : sci(Math.abs(lim - sums[n - 1])) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), N = 40, R = { x: 40, y: 18, w: w - 56, h: h - 56 }, a1 = 100, d = S.d4, r = S.r4, A = [], B = []; for (let n = 1; n <= N; n++) { A.push(arithSum(a1, d, n)); B.push(geoSum(a1, r, n)); } const ym = Math.max(...A, ...B) * 1.05; ax(ctx, R); const X = n => R.x + (n - 1) / (N - 1) * R.w, Y = v => R.y + R.h - v / ym * R.h;
  [[A, COL.cyan], [B, COL.orange]].forEach(([arr, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); arr.forEach((v, i) => { i ? ctx.lineTo(X(i + 1), Y(v)) : ctx.moveTo(X(i + 1), Y(v)); }); ctx.stroke(); }); const c = crossover(a1, d, a1, r, N); if (c) { line(ctx, X(c), R.y, X(c), R.y + R.h, COL.green, 1.5, [4, 3]); text(ctx, t('crossLab', { n: c }), X(c) + 5, R.y + 14, { size: 11, color: COL.green }); }
  text(ctx, t('legArith', { d }), R.x + 8, R.y + 14 + (c ? 16 : 0), { size: 11, color: COL.cyan }); text(ctx, t('legGeo', { r: f2((r - 1) * 100) }), R.x + 8, R.y + 30 + (c ? 16 : 0), { size: 11, color: COL.orange }); text(ctx, t('monthAxis'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); $('d4v').textContent = d; $('r4v').textContent = f2((r - 1) * 100);
  $('ro4').textContent = t('s4ro', { d, g: f2((r - 1) * 100), a40: sci(A[N - 1]), b40: sci(B[N - 1]), cross: c ? t('crossAt', { n: c }) : t('noCross', { N }) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), q = QUIZ[S.i5 % QUIZ.length], bw = Math.min(70, (w - 40) / 6); q.seq.concat([null, null]).forEach((v, i) => { const x = 20 + i * ((w - 40) / 6), vis = v !== null; ctx.fillStyle = vis ? 'rgba(103,215,249,0.25)' : (S.chk5 ? 'rgba(116,223,170,0.25)' : COL.dim); ctx.fillRect(x, 30, bw, 54); ctx.strokeStyle = vis ? COL.cyan : COL.orange; ctx.lineWidth = 2; ctx.strokeRect(x, 30, bw, 54); text(ctx, vis ? String(v) : (S.chk5 ? String(i === 4 ? q.next : nextAfter(q, 2)) : '?'), x + bw / 2, 64, { align: 'center', size: 18, color: vis ? COL.ink : COL.orange, bold: true }); });
  ['arith', 'geo', 'neither'].forEach(k => $('k5_' + k).classList.toggle('active', S.pick5 === k)); const ok = S.pick5 === q.kind; $('ro5').textContent = !S.chk5 || !S.pick5 ? t('s5ro', { n: S.i5 + 1 }) : t(ok ? 's5roOk' : 's5roNo', { kind: t('k_' + q.kind), form: formulaOf(q), next: q.next }); }
function nextAfter(q, k) { return q.kind === 'arith' ? q.next + q.par : q.kind === 'geo' ? q.next * q.par : q.next + 11; }
function formulaOf(q) { return q.kind === 'arith' ? 'aₙ = ' + q.seq[0] + ' + (n−1)×' + q.par : q.kind === 'geo' ? 'aₙ = ' + q.seq[0] + ' × ' + q.par + '^(n−1)' : 'aₙ = n²'; }
function wire() {
  ['a10', 'a11'].forEach(id => slider(id, v => { S.a1 = v; render0(); render1(); })); ['d0', 'd1'].forEach(id => slider(id, v => { S.d = v; render0(); render1(); })); slider('n1', v => { S.n1 = v; render1(); }); slider('r2', v => { S.r2 = v; render2(); }); slider('n2', v => { S.n2 = v; render2(); }); slider('r3', v => { S.r3 = v; render3(); }); slider('n3', v => { S.n3 = v; render3(); });
  slider('d4', v => { S.d4 = v; render4(); }); slider('r4', v => { S.r4 = 1 + v / 100; render4(); }); ['arith', 'geo', 'neither'].forEach(k => $('k5_' + k).addEventListener('click', () => { S.pick5 = k; S.chk5 = false; render5(); })); $('chk5').addEventListener('click', () => { S.chk5 = true; render5(); }); $('nx5').addEventListener('click', () => { S.i5++; S.pick5 = ''; S.chk5 = false; render5(); });
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
if (typeof module !== 'undefined') module.exports = { arith, arithSum, geo, geoSum, geoLimit, crossover, classify, QUIZ };
