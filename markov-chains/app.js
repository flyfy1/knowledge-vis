/* markov-chains: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
function arrow(ctx, x1, y1, x2, y2, col, lw) { line(ctx, x1, y1, x2, y2, col, lw || 2); const a = Math.atan2(y2 - y1, x2 - x1), s = 6 + (lw || 2) * 1.6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
function curve(ctx, pts, col, lw) { if (!pts.length) return; ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
function axes(ctx, L, col) { line(ctx, L.x, L.y, L.x, L.y + L.h, col || COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, col || COL.grid, 1); }
/* deterministic RNG so every run of a demo is repeatable */
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const TICKERS = [];
/* ticker(fn): fn(dtSeconds) returns false to stop. Stops when the tab is hidden. */
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
function pointerXY(c, ev) { const r = c.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
function slider10(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value / 10); const o = $(id + 'v'); if (o) o.textContent = (e.value / 10).toFixed(1); }); }

/* Model: finite Markov chains with a row-stochastic transition matrix P (row i = distribution of the next state given state i). Pure functions. */
const P2 = (a, b) => [[1 - a, a], [b, 1 - b]];                      // state 0 = sunny, 1 = rainy; a = P(sun->rain), b = P(rain->sun)
const matMul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const matPow = (P, n) => { let R = P.map((r, i) => r.map((_, j) => (i === j ? 1 : 0))); let base = P, k = n; while (k > 0) { if (k & 1) R = matMul(R, base); base = matMul(base, base); k >>= 1; } return R; };
const stepDist = (d, P) => P[0].map((_, j) => d.reduce((s, v, i) => s + v * P[i][j], 0));
const stationary2 = (a, b) => [b / (a + b), a / (a + b)];
const lambda2 = (a, b) => 1 - a - b;
function powerIter(P, iters) { let d = P.map(() => 1 / P.length); for (let i = 0; i < (iters || 2000); i++) d = stepDist(d, P); return d; }
const tv = (p, q) => 0.5 * p.reduce((s, v, i) => s + Math.abs(v - q[i]), 0);
function simChain(P, start, n, seed) { const R = rng(seed), out = [start]; let s = start; for (let i = 0; i < n; i++) { const u = R(); let c = 0, nx = P[s].length - 1; for (let j = 0; j < P[s].length; j++) { c += P[s][j]; if (u < c) { nx = j; break; } } s = nx; out.push(s); } return out; }
const P3 = r => { const rest = 1 - r; return [[0.7, 0.2, 0.1], [0.3, 0.4, 0.3], [(rest) * 0.5, rest * 0.5, r]]; };
const gamblerP = (N, p) => { const M = []; for (let i = 0; i <= N; i++) { const row = new Array(N + 1).fill(0); if (i === 0 || i === N) row[i] = 1; else { row[i + 1] = p; row[i - 1] = 1 - p; } M.push(row); } return M; };
const ruinProb = (p, N, i) => { if (Math.abs(p - 0.5) < 1e-12) return 1 - i / N; const r = (1 - p) / p; return (Math.pow(r, i) - Math.pow(r, N)) / (1 - Math.pow(r, N)); };
const NAMES2 = ['stSun', 'stRain'], COLS = [COL.orange, COL.cyan, COL.green];
const f2 = v => (Math.round(v * 100) / 100).toFixed(2), f3 = v => (Math.round(v * 1000) / 1000).toFixed(3), pc = v => (Math.round(v * 1000) / 10).toFixed(1);
const S = { a: 0.3, b: 0.5, path: [], seed: 1, n2: 3, r3: 40, n4: 30, p5: 45, i5: 5, n5: 20 };
function resetPath() { S.path = []; S.seed = 1; }
function diagram2(ctx, w, h, a, b, dist) { const y = h * 0.42, x0 = w * 0.25, x1 = w * 0.75, R = Math.min(34, w * 0.1); [[x0, 0], [x1, 1]].forEach(([x, i]) => { ctx.fillStyle = COLS[i]; ctx.globalAlpha = 0.25 + 0.7 * (dist ? dist[i] : 0.5); ctx.beginPath(); ctx.arc(x, y, R, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = COLS[i]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.2832); ctx.stroke(); text(ctx, t(NAMES2[i]), x, y + 4, { align: 'center', size: 12, color: COL.ink, bold: true }); });
  const loop = (x, i, p) => { ctx.strokeStyle = COLS[i]; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(x, y - R - 8, 10, 0.3 * Math.PI, 2.7 * Math.PI); ctx.stroke(); text(ctx, f2(p), x, y - R - 24, { align: 'center', size: 11, color: COLS[i] }); };
  loop(x0, 0, 1 - a); loop(x1, 1, 1 - b); arrow(ctx, x0 + R + 4, y - 10, x1 - R - 4, y - 10, COLS[0], 1 + 3 * a); text(ctx, f2(a), w / 2, y - 18, { align: 'center', size: 11, color: COLS[0] }); arrow(ctx, x1 - R - 4, y + 12, x0 + R + 4, y + 12, COLS[1], 1 + 3 * b); text(ctx, f2(b), w / 2, y + 28, { align: 'center', size: 11, color: COLS[1] }); return y; }
function bars2(ctx, x, y, w, labels, dist, hgt) { const bw = w / dist.length; dist.forEach((p, i) => { const hh = p * hgt; ctx.fillStyle = COLS[i % 3]; ctx.fillRect(x + i * bw + 8, y + hgt - hh, bw - 16, hh); text(ctx, pc(p) + '%', x + i * bw + bw / 2, y + hgt - hh - 4, { align: 'center', size: 11, color: COL.ink }); text(ctx, t(labels[i]), x + i * bw + bw / 2, y + hgt + 14, { align: 'center', size: 11 }); }); }
function render0() {
  const { ctx, w, h } = setup($('cv0')), P = P2(S.a, S.b), d = stepDist([1, 0], P); diagram2(ctx, w, h, S.a, S.b, d); bars2(ctx, 10, h * 0.62, w - 20, NAMES2, d, h * 0.22); text(ctx, t('lblTomorrow'), 12, h * 0.6, { size: 11, color: COL.muted });
  $('ro0').textContent = t('s0ro', { a: f2(S.a), b: f2(S.b), ps: pc(d[0]), pr: pc(d[1]), ps2: pc(stepDist([0, 1], P)[0]) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), path = S.path, n = path.length, L = { x: 40, y: h * 0.4, w: w - 56, h: h * 0.5 - 20 }, pi = stationary2(S.a, S.b)[0];
  const cols = Math.min(60, Math.max(1, n)), cw = (w - 20) / 60; path.slice(-60).forEach((s, i) => { ctx.fillStyle = COLS[s]; ctx.fillRect(10 + i * cw, 10, cw - 1, 26); }); text(ctx, t('lblLast60'), 10, 52, { size: 10 });
  axes(ctx, L); const Y = v => L.y + L.h - v * L.h, X = i => L.x + i / Math.max(100, n) * L.w; line(ctx, L.x, Y(pi), L.x + L.w, Y(pi), COL.muted, 1.2, [5, 4]); text(ctx, 'π', L.x - 4, Y(pi) + 4, { align: 'right', size: 11, color: COL.muted });
  if (n) { const pts = []; let c = 0; path.forEach((s, i) => { if (s === 0) c++; if (i % Math.max(1, Math.floor(n / 200)) === 0 || i === n - 1) pts.push([X(i + 1), Y(c / (i + 1))]); }); curve(ctx, pts, COL.orange, 2.2); }
  text(ctx, t('axDays'), L.x + L.w, L.y + L.h + 14, { align: 'right', size: 11 }); text(ctx, t('axFracSun'), L.x + 4, L.y + 10, { size: 11 }); [0, 0.5, 1].forEach(v => text(ctx, f2(v), L.x - 4, Y(v) + 3, { align: 'right', size: 10 }));
  const sun = path.filter(s => s === 0).length; $('ro1').textContent = n ? t('s1ro', { n: n, frac: pc(sun / n), pi: pc(pi) }) : t('s1ro0', { pi: pc(pi) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), P = P2(S.a, S.b), pi = stationary2(S.a, S.b)[0], L = { x: 40, y: 14, w: w - 56, h: h - 46 }, X = i => L.x + i / 30 * L.w, Y = v => L.y + L.h - v * L.h; axes(ctx, L);
  line(ctx, L.x, Y(pi), L.x + L.w, Y(pi), COL.muted, 1.2, [5, 4]); [[0, COLS[0]], [1, COLS[1]]].forEach(([st, col]) => { const pts = []; for (let n = 0; n <= 30; n++) pts.push([X(n), Y(matPow(P, n)[st][0])]); curve(ctx, pts, col, 2.5); });
  const n = S.n2; line(ctx, X(n), L.y, X(n), L.y + L.h, COL.ink, 1.2, [4, 3]); const Pn = matPow(P, n); dot(ctx, X(n), Y(Pn[0][0]), 5, COLS[0]); dot(ctx, X(n), Y(Pn[1][0]), 5, COLS[1]); [0, 10, 20, 30].forEach(i => text(ctx, String(i), X(i), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 0.5, 1].forEach(v => text(ctx, f2(v), L.x - 4, Y(v) + 3, { align: 'right', size: 10 }));
  text(ctx, t('axDaysN'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPSun'), L.x + 4, L.y + 10, { size: 11 }); text(ctx, t('lblStartSun'), X(30) - 4, Y(matPow(P, 30)[0][0]) - 8, { align: 'right', size: 10, color: COLS[0] }); text(ctx, t('lblStartRain'), X(30) - 4, Y(matPow(P, 30)[1][0]) + 14, { align: 'right', size: 10, color: COLS[1] });
  $('n2v').textContent = n; $('ro2').textContent = t('s2ro', { n: n, a: f3(Pn[0][0]), b: f3(Pn[1][0]), pi: f3(pi) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), r = S.r3 / 100, P = P3(r), pi = powerIter(P, 3000), names = ['stSun', 'stCloud', 'stRain'], d = stepDist(pi, P), resid = Math.max.apply(null, d.map((v, i) => Math.abs(v - pi[i])));
  text(ctx, t('lblMatrix'), 10, 16, { size: 11, color: COL.muted }); P.forEach((row, i) => row.forEach((v, j) => { const x = 10 + j * 54, y = 24 + i * 26; ctx.fillStyle = '#101d2a'; ctx.fillRect(x, y, 50, 22); ctx.globalAlpha = 0.2 + 0.7 * v; ctx.fillStyle = COLS[j]; ctx.fillRect(x, y, 50, 22); ctx.globalAlpha = 1; text(ctx, f2(v), x + 25, y + 16, { align: 'center', size: 12, color: COL.ink }); })); ['stSun', 'stCloud', 'stRain'].forEach((k, i) => text(ctx, t(k), 176, 40 + i * 26, { size: 10 }));
  bars2(ctx, 10, h * 0.42, w - 20, names, pi, h * 0.36); text(ctx, t('lblPi'), 12, h * 0.4, { size: 11, color: COL.muted });
  $('r3v').textContent = f2(r); $('ro3').textContent = t('s3ro', { r: f2(r), ps: pc(pi[0]), pc: pc(pi[1]), pr: pc(pi[2]), res: resid.toExponential(1) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), P = P2(S.a, S.b), pi = stationary2(S.a, S.b), l2 = lambda2(S.a, S.b), L = { x: 44, y: 14, w: w - 60, h: h - 46 }, X = i => L.x + i / 30 * L.w, lo = -8, Y = v => L.y + L.h - (Math.max(lo, Math.log10(Math.max(v, 1e-12))) - lo) / (0 - lo) * L.h; axes(ctx, L);
  const pts = [], ref = []; for (let n = 0; n <= 30; n++) { pts.push([X(n), Y(tv(matPow(P, n)[0], pi))]); ref.push([X(n), Y(Math.pow(Math.abs(l2), n) * tv([1, 0], pi))]); } curve(ctx, ref, COL.muted, 1.5); curve(ctx, pts, COL.orange, 2.5);
  const n = S.n4; line(ctx, X(Math.min(30, n)), L.y, X(Math.min(30, n)), L.y + L.h, COL.cyan, 1.2, [4, 3]); [0, 10, 20, 30].forEach(i => text(ctx, String(i), X(i), L.y + L.h + 14, { align: 'center', size: 10 })); [0, -2, -4, -6, -8].forEach(v => text(ctx, '10^' + v, L.x - 4, L.y + L.h - (v - lo) / (0 - lo) * L.h + 3, { align: 'right', size: 10 }));
  text(ctx, t('axDaysN'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axDist'), L.x + 4, L.y + 10, { size: 11 });
  const d = tv(matPow(P, Math.min(n, 400))[0], pi), half = Math.abs(l2) > 0 && Math.abs(l2) < 1 ? Math.log(0.5) / Math.log(Math.abs(l2)) : Infinity; $('n4v').textContent = n;
  $('ro4').textContent = t('s4ro', { l2: f3(l2), n: n, d: d < 1e-12 ? '< 10⁻¹²' : d.toExponential(1), half: Number.isFinite(half) ? f2(half) : '∞', kind: l2 < 0 ? t('kOsc') : l2 === 0 ? t('kInstant') : t('kMono') });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), N = 10, p = S.p5 / 100, i0 = S.i5, n = S.n5, d0 = new Array(N + 1).fill(0); d0[i0] = 1; const d = matPow(gamblerP(N, p), n)[i0], L = { x: 14, y: 20, w: w - 28, h: h - 52 }, bw = L.w / (N + 1); axes(ctx, L);
  d.forEach((v, i) => { const hh = v * L.h; ctx.fillStyle = (i === 0) ? COL.red : (i === N) ? COL.green : COL.cyan; ctx.fillRect(L.x + i * bw + 2, L.y + L.h - hh, bw - 4, hh); text(ctx, String(i), L.x + i * bw + bw / 2, L.y + L.h + 14, { align: 'center', size: 10 }); }); text(ctx, t('lblBroke'), L.x, L.y - 6, { size: 11, color: COL.red }); text(ctx, t('lblRich'), L.x + L.w, L.y - 6, { align: 'right', size: 11, color: COL.green });
  const dInf = matPow(gamblerP(N, p), 4000)[i0]; $('p5v').textContent = f2(p); $('i5v').textContent = i0; $('n5v').textContent = n; $('ro5').textContent = t('s5ro', { p: f2(p), i: i0, n: n, ruin: pc(d[0]), win: pc(d[N]), ru: pc(dInf[0]), f: pc(ruinProb(p, N, i0)) });
}
function allAB() { ['a0', 'a1', 'a2', 'a4'].forEach(id => { const e = $(id); e.value = Math.round(S.a * 100); $(id + 'v').textContent = f2(S.a); }); ['b0', 'b1', 'b2', 'b4'].forEach(id => { const e = $(id); e.value = Math.round(S.b * 100); $(id + 'v').textContent = f2(S.b); }); }
function setAB(k, v) { S[k] = v / 100; resetPath(); allAB(); [render0, render1, render2, render4].forEach(f => f()); }
function wire() {
  ['a0', 'a1', 'a2', 'a4'].forEach(id => $(id).addEventListener('input', e => setAB('a', +e.target.value))); ['b0', 'b1', 'b2', 'b4'].forEach(id => $(id).addEventListener('input', e => setAB('b', +e.target.value)));
  [10, 100, 1000].forEach(k => $('sim' + k).addEventListener('click', () => { const base = S.path.length; S.path = simChain(P2(S.a, S.b), 0, Math.min(5000, base + k) - 1, S.seed + 7); render1(); })); $('rs1').addEventListener('click', () => { resetPath(); render1(); });
  slider('n2', v => { S.n2 = v; render2(); }); slider('r3', v => { S.r3 = v; render3(); }); slider('n4', v => { S.n4 = v; render4(); });
  $('p5').addEventListener('input', e => { S.p5 = +e.target.value; render5(); }); slider('i5', v => { S.i5 = v; render5(); }); slider('n5', v => { S.n5 = v; render5(); });
  allAB();
}

/* boot */
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

if (typeof module !== 'undefined') module.exports = { P2, matMul, matPow, stepDist, stationary2, lambda2, powerIter, tv, simChain, P3, gamblerP, ruinProb };
