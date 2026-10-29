/* binomial-normal: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: n independent left/right steps, right with probability p. Everything below is a pure function. */
function lnFact(n) { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; }
const LF = [0]; for (let i = 1; i <= 400; i++) LF.push(LF[i - 1] + Math.log(i));
const choose = (n, k) => (k < 0 || k > n) ? 0 : Math.round(Math.exp(LF[n] - LF[k] - LF[n - k]));
function pmf(n, p, k) { if (k < 0 || k > n) return 0; if (p <= 0) return k === 0 ? 1 : 0; if (p >= 1) return k === n ? 1 : 0; return Math.exp(LF[n] - LF[k] - LF[n - k] + k * Math.log(p) + (n - k) * Math.log(1 - p)); }
const mean = (n, p) => n * p, variance = (n, p) => n * p * (1 - p), sd = (n, p) => Math.sqrt(n * p * (1 - p));
const npdf = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
function erf(x) { const sg = x < 0 ? -1 : 1; x = Math.abs(x); const a = 1 / (1 + 0.3275911 * x), y = 1 - (((((1.061405429 * a - 1.453152027) * a) + 1.421413741) * a - 0.284496736) * a + 0.254829592) * a * Math.exp(-x * x); return sg * y; }
const ncdf = z => 0.5 * (1 + erf(z / Math.SQRT2));
function maxGap(n, p) { const mu = mean(n, p), s = sd(n, p); let g = 0; for (let k = 0; k <= n; k++) g = Math.max(g, Math.abs(pmf(n, p, k) - npdf(k, mu, s))); return g; }
function tailExact(n, p, k) { let s = 0; for (let j = Math.max(0, k); j <= n; j++) s += pmf(n, p, j); return s; }
const tailNormal = (n, p, k, cc) => 1 - ncdf((k - (cc ? 0.5 : 0) - mean(n, p)) / sd(n, p));
const roughOK = (n, p) => n * p >= 10 && n * (1 - p) >= 10;
function dropBall(R, n, p) { const path = []; let k = 0; for (let i = 0; i < n; i++) { const r = R() < p; path.push(r ? 1 : 0); if (r) k++; } return { path, k }; }
const f2 = v => (Math.round(v * 100) / 100).toFixed(2), f3 = v => (Math.round(v * 1000) / 1000).toFixed(3), f4 = v => (Math.round(v * 10000) / 10000).toFixed(4);
const S = { n0: 5, k0: 2, n1: 10, p1: 0.5, bins: [], total: 0, R: rng(7), fall: null, n2: 20, p2: 0.5, n3: 30, p3: 0.5, p4: 0.5, n4: 40, n5: 100, k5: 60 };
function resetBoard() { S.bins = new Array(S.n1 + 1).fill(0); S.total = 0; S.R = rng(7); S.fall = null; fallT.stop(); }
const fallT = ticker(dt => { const f = S.fall; if (!f) return false; f.t += dt * 6; if (f.t >= S.n1) { S.bins[f.k]++; S.total++; S.fall = null; render1(); return false; } render1(); });
function dropMany(c) { for (let i = 0; i < c; i++) { S.bins[dropBall(S.R, S.n1, S.p1).k]++; S.total++; } }

function barChart(ctx, L, vals, col, hi) { const m = vals.length, bw = L.w / m; vals.forEach((v, i) => { ctx.fillStyle = (hi && hi(i)) ? COL.orange : col; const hh = v * L.h; ctx.fillRect(L.x + i * bw + 1, L.y + L.h - hh, Math.max(1, bw - 2), hh); }); }
function render0() {
  const { ctx, w, h } = setup($('cv0')), n = S.n0, k = S.k0, rowH = (h - 40) / (n + 1);
  for (let r = 0; r <= n; r++) for (let j = 0; j <= r; j++) {
    const x = w / 2 + (j - r / 2) * Math.min(48, (w - 30) / (n + 1)), y = 18 + r * rowH, c = choose(r, j), on = r === n && j === k;
    ctx.fillStyle = on ? COL.orange : r === n ? '#27506a' : '#15283a'; ctx.beginPath(); ctx.arc(x, y, Math.min(17, rowH * 0.45, (w - 30) / (n + 1) * 0.42), 0, 6.2832); ctx.fill();
    text(ctx, String(c), x, y + 4, { align: 'center', size: n > 8 ? 9 : 11, color: on ? '#0a0e14' : COL.ink, bold: on });
  }
  text(ctx, t('rowsLbl', { n: n }), 6, h - 8, { size: 11 });
  $('ro0').textContent = t('s0ro', { n: n, k: k, c: choose(n, k), tot: Math.pow(2, n), p: f3(choose(n, k) / Math.pow(2, n)) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), n = S.n1, p = S.p1, top = h * 0.5, gx = 20, gw = w - 40, N = S.total;
  const dx = gw / (n + 1), rowH = (top - 16) / n;
  for (let r = 0; r < n; r++) for (let j = 0; j <= r; j++) dot(ctx, w / 2 + (j - r / 2) * dx, 12 + r * rowH, 2.2, '#3b5d73');
  if (S.fall) { const f = S.fall, r = Math.min(n, Math.floor(f.t)), fr = f.t - r; let kk = 0; for (let i = 0; i < r; i++) kk += f.path[i]; const nxt = r < n ? f.path[r] : 0; const jx = kk + nxt * fr; dot(ctx, w / 2 + (jx - (r + fr) / 2) * dx, 12 + (r + fr) * rowH, 5, COL.orange); }
  const L = { x: gx, y: top + 6, w: gw, h: h - top - 28 }; axes(ctx, L);
  const probs = []; for (let k = 0; k <= n; k++) probs.push(pmf(n, p, k)); const pm = Math.max.apply(null, probs), ymax = Math.max(pm * 1.15, N ? Math.max.apply(null, S.bins) / N * 1.1 : 0);
  const bw = L.w / (n + 1); S.bins.forEach((c, i) => { const hh = N ? c / N / ymax * L.h : 0; ctx.fillStyle = COL.cyan; ctx.fillRect(L.x + i * bw + 2, L.y + L.h - hh, bw - 4, hh); text(ctx, String(i), L.x + i * bw + bw / 2, L.y + L.h + 13, { align: 'center', size: n > 12 ? 9 : 11 }); });
  probs.forEach((q, i) => dot(ctx, L.x + i * bw + bw / 2, L.y + L.h - q / ymax * L.h, 4, COL.orange));
  text(ctx, t('legend1'), w - 6, L.y + 10, { align: 'right', size: 10 });
  const em = N ? S.bins.reduce((a, c, i) => a + c * i, 0) / N : 0;
  $('ro1').textContent = N ? t('s1ro', { N: N, n: n, p: p, em: f2(em), tm: f2(mean(n, p)) }) : t('s1ro0', { n: n, p: p });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), n = S.n2, p = S.p2, L = { x: 14, y: 14, w: w - 28, h: h - 40 }, mu = mean(n, p), s = sd(n, p);
  const vals = []; for (let k = 0; k <= n; k++) vals.push(pmf(n, p, k)); const ymax = Math.max.apply(null, vals) * 1.15, bw = L.w / (n + 1);
  const X = x => L.x + (x + 0.5) * bw;
  ctx.fillStyle = 'rgba(103,215,249,.12)'; ctx.fillRect(X(mu - s), L.y, X(mu + s) - X(mu - s), L.h);
  vals.forEach((v, i) => { const hh = v / ymax * L.h; ctx.fillStyle = Math.abs(i - mu) <= s ? COL.cyan : '#2b6a85'; ctx.fillRect(L.x + i * bw + 1, L.y + L.h - hh, Math.max(1, bw - 2), hh); });
  line(ctx, X(mu), L.y, X(mu), L.y + L.h, COL.orange, 2); const left = X(mu) > L.x + L.w * 0.6; text(ctx, t('lblMean', { m: f2(mu) }), X(mu) + (left ? -4 : 4), L.y + 12, { size: 11, color: COL.orange, align: left ? 'right' : 'left' });
  [0, Math.round(n / 2), n].forEach(k => text(ctx, String(k), X(k), L.y + L.h + 14, { align: 'center', size: 11 }));
  const within = vals.reduce((a, v, i) => a + (Math.abs(i - mu) <= s ? v : 0), 0);
  $('ro2').textContent = t('s2ro', { n: n, p: p, mu: f2(mu), v: f2(variance(n, p)), s: f2(s), w: Math.round(within * 100) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), n = S.n3, p = S.p3, L = { x: 14, y: 14, w: w - 28, h: h - 40 }, mu = mean(n, p), s = sd(n, p);
  const vals = []; for (let k = 0; k <= n; k++) vals.push(pmf(n, p, k)); const ymax = Math.max(Math.max.apply(null, vals), npdf(mu, mu, s)) * 1.15, bw = L.w / (n + 1), X = x => L.x + (x + 0.5) * bw;
  vals.forEach((v, i) => { const hh = v / ymax * L.h; ctx.fillStyle = '#2b6a85'; ctx.fillRect(L.x + i * bw + 1, L.y + L.h - hh, Math.max(1, bw - 2), hh); });
  const pts = []; for (let x = -0.5; x <= n + 0.5; x += 0.25) pts.push([X(x), L.y + L.h - npdf(x, mu, s) / ymax * L.h]); curve(ctx, pts.filter(q => q[0] >= L.x - 1 && q[0] <= L.x + L.w + 1), COL.orange, 2.5);
  [0, Math.round(n / 2), n].forEach(k => text(ctx, String(k), X(k), L.y + L.h + 14, { align: 'center', size: 11 }));
  text(ctx, t('legend3'), L.x + L.w, L.y + 10, { align: 'right', size: 10 });
  const g = maxGap(n, p); $('ro3').textContent = t('s3ro', { n: n, p: p, mu: f2(mu), s: f2(s), g: f4(g), gp: f2(g / Math.max.apply(null, vals) * 100), ok: roughOK(n, p) ? t('okYes') : t('okNo') });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), p = S.p4, n = S.n4, L = { x: 40, y: 14, w: w - 56, h: h - 44 }, NMAX = 100;
  const ys = []; let ymax = 0; for (let m = 4; m <= NMAX; m += 2) { const g = maxGap(m, p) / (1 / Math.sqrt(2 * Math.PI * variance(m, p))); ys.push([m, g]); ymax = Math.max(ymax, g); }
  ymax = Math.max(ymax, 0.05); axes(ctx, L); const X = m => L.x + (m - 4) / (NMAX - 4) * L.w, Y = g => L.y + L.h - g / ymax * L.h;
  curve(ctx, ys.map(q => [X(q[0]), Y(q[1])]), COL.cyan, 2.5);
  line(ctx, X(n), L.y, X(n), L.y + L.h, COL.orange, 1.5, [4, 3]); const cur = maxGap(n, p) / (1 / Math.sqrt(2 * Math.PI * variance(n, p))); dot(ctx, X(n), Y(cur), 6, COL.orange);
  text(ctx, t('axN'), L.x + L.w, L.y + L.h + 16, { align: 'right', size: 11 }); text(ctx, t('axGap'), L.x + 4, L.y + 10, { size: 11 });
  [4, 25, 50, 75, 100].forEach(m => text(ctx, String(m), X(m), L.y + L.h + 14, { align: 'center', size: 10 }));
  $('ro4').textContent = t('s4ro', { n: n, p: p, g: f2(cur * 100), ok: roughOK(n, p) ? t('okYes') : t('okNo'), need: Math.ceil(Math.max(10 / p, 10 / (1 - p))) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), n = S.n5, kk = Math.min(S.k5, n), p = 0.5, L = { x: 14, y: 14, w: w - 28, h: h - 40 }, mu = mean(n, p), s = sd(n, p);
  const lo = Math.max(0, Math.floor(mu - 4 * s)), hi = Math.min(n, Math.ceil(mu + 4 * s)), m = hi - lo + 1, bw = L.w / m, X = k => L.x + (k - lo + 0.5) * bw;
  const ymax = pmf(n, p, Math.round(mu)) * 1.2;
  for (let k = lo; k <= hi; k++) { const hh = pmf(n, p, k) / ymax * L.h; ctx.fillStyle = k >= kk ? COL.orange : '#2b6a85'; ctx.fillRect(L.x + (k - lo) * bw + 0.5, L.y + L.h - hh, Math.max(1, bw - 1), hh); }
  const pts = []; for (let x = lo - 0.5; x <= hi + 0.5; x += 0.25) pts.push([X(x), L.y + L.h - npdf(x, mu, s) / ymax * L.h]); curve(ctx, pts, COL.green, 2);
  line(ctx, X(kk - 0.5), L.y, X(kk - 0.5), L.y + L.h, COL.ink, 1.5, [4, 3]);
  [lo, Math.round(mu), hi].forEach(k => text(ctx, String(k), X(k), L.y + L.h + 14, { align: 'center', size: 11 }));
  const ex = tailExact(n, p, kk), a0 = tailNormal(n, p, kk, false), a1 = tailNormal(n, p, kk, true);
  $('ro5').textContent = t('s5ro', { n: n, k: kk, ex: f4(ex), a0: f4(a0), a1: f4(a1), e0: f4(Math.abs(a0 - ex)), e1: f4(Math.abs(a1 - ex)) });
}
function wire() {
  slider('n0', v => { S.n0 = v; if (S.k0 > v) { S.k0 = v; $('k0').value = v; $('k0v').textContent = v; } $('k0').max = v; render0(); }); slider('k0', v => { S.k0 = Math.min(v, S.n0); render0(); });
  slider('n1', v => { S.n1 = v; resetBoard(); render1(); }); slider('p1', v => { S.p1 = v / 100; resetBoard(); render1(); });
  $('drop1').addEventListener('click', () => { if (S.fall) return; const b = dropBall(S.R, S.n1, S.p1); if (reduceMotion()) { S.bins[b.k]++; S.total++; render1(); return; } S.fall = { path: b.path, k: b.k, t: 0 }; fallT.start(); });
  $('drop100').addEventListener('click', () => { if (S.fall) { S.bins[S.fall.k]++; S.total++; S.fall = null; fallT.stop(); } dropMany(100); render1(); });
  $('reset1').addEventListener('click', () => { resetBoard(); render1(); });
  slider('n2', v => { S.n2 = v; render2(); }); slider('p2', v => { S.p2 = v / 100; render2(); });
  slider('n3', v => { S.n3 = v; render3(); }); slider('p3', v => { S.p3 = v / 100; render3(); });
  slider('n4', v => { S.n4 = v; render4(); }); slider('p4', v => { S.p4 = v / 100; render4(); });
  slider('n5', v => { S.n5 = v; $('k5').max = v; render5(); }); slider('k5', v => { S.k5 = v; render5(); });
}
resetBoard();

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

if (typeof module !== 'undefined') module.exports = { choose, pmf, mean, variance, sd, npdf, ncdf, maxGap, tailExact, tailNormal, roughOK, dropBall };
