/* poisson-process: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Seeded generator so every run is reproducible; "new run" just changes the seed. */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const expGap = (u, lam) => -Math.log(1 - u) / lam;
/* Poisson process on [0,T]: independent exponential gaps with mean 1/lambda. */
function arrivals(lam, T, seed) { const r = rng(seed), out = []; let tt = 0; for (;;) { tt += expGap(r(), lam); if (tt > T) break; out.push(tt); } return out; }
function gaps(lam, n, seed) { const r = rng(seed), out = []; for (let i = 0; i < n; i++) out.push(expGap(r(), lam)); return out; }
const expPdf = (x, lam) => x < 0 ? 0 : lam * Math.exp(-lam * x);
const fact = k => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
const pmf = (k, m) => Math.exp(-m) * Math.pow(m, k) / fact(k);
function countsPer(times, w, nWin) { const c = new Array(nWin).fill(0); times.forEach(x => { const i = Math.floor(x / w); if (i < nWin) c[i]++; }); return c; }
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const variance = a => { const m = mean(a); return a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length; };
/* Three kinds of arrival pattern, all with the same long-run rate: random, regular and clumped. */
function pattern(kind, rate, T, seed) { const r = rng(seed), out = []; if (kind === 'poisson') return arrivals(rate, T, seed);
  if (kind === 'regular') { let tt = 0; for (;;) { tt += (0.7 + 0.6 * r()) / rate; if (tt > T) break; out.push(tt); } return out; }
  let tt = 0; for (;;) { tt += expGap(r(), rate / 3); if (tt > T) break; let k = 1; while (r() < 2 / 3 && k < 30) k++; for (let i = 0; i < k; i++) { const x = tt + (i === 0 ? 0 : expGap(r(), 10)); if (x <= T) out.push(x); } } return out.sort((a, b) => a - b); }
const KINDS = ['poisson', 'regular', 'bursty'];
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100), f3 = v => String(Math.round(v * 1000) / 1000);
const S = { l0: 2, seed0: 11, tau0: 20, raf0: 0, l1: 1, n1: 0, seed1: 5, l2: 2, w2: 1, seed2: 3, l3: 1, s3: 1, l4a: 1, l4b: 1.5, p4: 0.5, seed4: 8, idx5: 0, pick5: -1, checked5: false, l: 2 };
const T0 = 20;
function axes(ctx, R, xm, ym, xl, yl, xt, yt) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); const X = v => R.x + v / xm * R.w, Y = v => R.y + R.h - v / ym * R.h; xt.forEach(v => text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 })); (yt || []).forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, String(v), R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); });
  if (xl) text(ctx, xl, R.x + R.w, R.y + R.h + 27, { align: 'right', size: 11 }); if (yl) text(ctx, yl, R.x, R.y - 5, { size: 11 }); return { X, Y }; }
function ticks(ctx, M, R, times, tmax, col, y, h) { times.forEach(x => { if (x <= tmax) line(ctx, M.X(x), y - h / 2, M.X(x), y + h / 2, col, 2); }); }
function render0() { const { ctx, w, h } = setup($('cv0')), tm = S.tau0, ts = arrivals(S.l0, T0, S.seed0), n = ts.filter(x => x <= tm).length, tl = { x: 40, y: 22, w: w - 56, h: 30 }, M0 = axes(ctx, tl, T0, 1, '', '', [0, 5, 10, 15, 20], []);
  ticks(ctx, M0, tl, ts, tm, COL.orange, tl.y + tl.h / 2, tl.h - 4); line(ctx, M0.X(tm), tl.y - 4, M0.X(tm), tl.y + tl.h + 4, COL.ink, 2); text(ctx, t('timeline'), tl.x, tl.y - 8, { size: 11 });
  const R = { x: 40, y: 84, w: w - 56, h: h - 120 }, ym = Math.max(10, Math.ceil(S.l0 * T0 * 1.3 / 5) * 5), M = axes(ctx, R, T0, ym, t('timeAxis'), t('countAxis'), [0, 5, 10, 15, 20], [0, ym / 2, ym]); line(ctx, M.X(0), M.Y(0), M.X(T0), M.Y(S.l0 * T0), COL.violet, 1.5, [5, 4]); text(ctx, t('expLine', { l: S.l0 }), R.x + 8, R.y + 14, { size: 11, color: COL.violet });
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(M.X(0), M.Y(0)); let c = 0; ts.forEach(x => { if (x > tm) return; ctx.lineTo(M.X(x), M.Y(c)); c++; ctx.lineTo(M.X(x), M.Y(c)); }); ctx.lineTo(M.X(tm), M.Y(c)); ctx.stroke(); $('l0v').textContent = S.l0;
  $('ro0').textContent = t('s0ro', { l: S.l0, tm: f1(tm), n, exp: f1(S.l0 * tm), rate: tm > 0 ? f2(n / tm) : '—' }); }
function render1() { const { ctx, w, h } = setup($('cv1')), l = S.l1, g = gaps(l, 4000, S.seed1).slice(0, S.n1), xm = 5 / l, nb = 20, bw = xm / nb, R = { x: 40, y: 22, w: w - 56, h: h - 62 }, cnt = new Array(nb).fill(0); g.forEach(v => { const i = Math.floor(v / bw); if (i < nb) cnt[i]++; });
  const dens = cnt.map(c => g.length ? c / (g.length * bw) : 0), ym = l * 1.15, M = axes(ctx, R, xm, ym, t('gapAxis'), t('densAxis'), [0, 1, 2, 3, 4, 5].map(k => Math.round(k * xm / 5 * 100) / 100), []);
  dens.forEach((d, i) => { ctx.fillStyle = 'rgba(103,215,249,0.55)'; const x = M.X(i * bw), y = M.Y(Math.min(d, ym)); ctx.fillRect(x + 1, y, M.X(bw) - M.X(0) - 2, M.Y(0) - y); });
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const x = xm * i / 100; i ? ctx.lineTo(M.X(x), M.Y(expPdf(x, l))) : ctx.moveTo(M.X(x), M.Y(expPdf(x, l))); } ctx.stroke(); text(ctx, t('legTheory'), R.x + R.w - 8, R.y + 16, { align: 'right', size: 12, color: COL.orange }); text(ctx, t('legData', { n: g.length }), R.x + R.w - 8, R.y + 32, { align: 'right', size: 12, color: COL.cyan }); $('l1v').textContent = l;
  $('ro1').textContent = t('s1ro', { l, n: g.length, m: g.length ? f3(mean(g)) : '—', th: f3(1 / l), lh: g.length ? f2(g.length / g.reduce((s, v) => s + v, 0)) : '—' }); }
function render2() { const { ctx, w, h } = setup($('cv2')), l = S.l2, win = S.w2, m = l * win, N = 300, c = countsPer(arrivals(l, N * win, S.seed2), win, N), kmax = Math.max(12, Math.ceil(m + 4 * Math.sqrt(m))), R = { x: 40, y: 22, w: w - 56, h: h - 62 }, hist = new Array(kmax + 1).fill(0); c.forEach(v => { if (v <= kmax) hist[v]++; });
  const ym = Math.max(0.1, Math.ceil(Math.max(...hist.map(v => v / N), ...hist.map((v, k) => pmf(k, m))) * 10 + 1) / 10), M = axes(ctx, R, kmax + 1, ym, t('kAxis'), t('fracAxis'), [], []), bw = (M.X(1) - M.X(0)); for (let k = 0; k <= kmax; k += 2) text(ctx, String(k), M.X(k) + bw / 2, R.y + R.h + 13, { align: 'center', size: 10 });
  hist.forEach((v, k) => { ctx.fillStyle = 'rgba(103,215,249,0.55)'; const y = M.Y(v / N); ctx.fillRect(M.X(k) + 2, y, bw - 4, M.Y(0) - y); }); hist.forEach((_, k) => dot(ctx, M.X(k) + bw / 2, M.Y(pmf(k, m)), 4, COL.orange)); text(ctx, t('legPmf'), R.x + R.w - 8, R.y + 16, { align: 'right', size: 12, color: COL.orange }); text(ctx, t('legWin', { n: N }), R.x + R.w - 8, R.y + 32, { align: 'right', size: 12, color: COL.cyan });
  $('l2v').textContent = l; $('w2v').textContent = win; const mu = mean(c), va = variance(c); $('ro2').textContent = t('s2ro', { l, w: win, m: f2(m), mu: f2(mu), va: f2(va), fano: f2(va / mu) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), l = S.l3, s = S.s3, g = gaps(l, 8000, 21), rem = g.filter(v => v > s).map(v => v - s), xm = 5 / l, nb = 20, bw = xm / nb, R = { x: 40, y: 22, w: w - 56, h: h - 62 };
  const hist = a => { const c = new Array(nb).fill(0); a.forEach(v => { const i = Math.floor(v / bw); if (i < nb) c[i]++; }); return c.map(v => a.length ? v / (a.length * bw) : 0); }, h0 = hist(g), h1 = hist(rem), ym = l * 1.15, M = axes(ctx, R, xm, ym, t('waitAxis'), t('densAxis'), [0, 1, 2, 3, 4, 5].map(k => Math.round(k * xm / 5 * 100) / 100), []);
  h1.forEach((d, i) => { ctx.fillStyle = 'rgba(246,164,91,0.5)'; const y = M.Y(Math.min(d, ym)); ctx.fillRect(M.X(i * bw) + 1, y, M.X(bw) - M.X(0) - 2, M.Y(0) - y); }); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); h0.forEach((d, i) => { const x0 = M.X(i * bw), x1 = M.X((i + 1) * bw), y = M.Y(Math.min(d, ym)); i ? ctx.lineTo(x0, y) : ctx.moveTo(x0, y); ctx.lineTo(x1, y); }); ctx.stroke();
  text(ctx, t('legAll', { n: g.length }), R.x + R.w - 8, R.y + 16, { align: 'right', size: 12, color: COL.cyan }); text(ctx, t('legRem', { s, n: rem.length }), R.x + R.w - 8, R.y + 32, { align: 'right', size: 12, color: COL.orange }); $('l3v').textContent = l; $('s3v').textContent = s;
  $('ro3').textContent = t('s3ro', { s, n: rem.length, m: f3(mean(rem)), th: f3(1 / l), surv: f3(Math.exp(-l * s)), frac: f3(rem.length / g.length) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), TT = 30, a = arrivals(S.l4a, TT, S.seed4), b = arrivals(S.l4b, TT, S.seed4 + 100), m = a.concat(b).sort((x, y) => x - y), r = rng(77), th = m.filter(() => r() < S.p4), R = { x: 40, y: 18, w: w - 56, h: h - 48 }, M = axes(ctx, { x: R.x, y: R.y, w: R.w, h: R.h }, TT, 1, t('timeAxis'), '', [0, 5, 10, 15, 20, 25, 30], []);
  const rows = [[a, COL.cyan, t('rowA', { l: S.l4a })], [b, COL.violet, t('rowB', { l: S.l4b })], [m, COL.orange, t('rowM')], [th, COL.green, t('rowT', { p: S.p4 })]]; rows.forEach((row, i) => { const y = R.y + (i + 0.5) * R.h / 4; line(ctx, R.x, y + R.h / 8, R.x + R.w, y + R.h / 8, COL.grid, 1); ticks(ctx, M, R, row[0], TT, row[1], y, R.h / 4 - 14); const lab = row[2] + ' · ' + row[0].length; ctx.font = '13px system-ui,sans-serif'; ctx.fillStyle = 'rgba(10,14,20,0.88)'; ctx.fillRect(R.x + 3, y - R.h / 8 + 3, ctx.measureText(lab).width + 10, 18); text(ctx, lab, R.x + 8, y - R.h / 8 + 16, { size: 13, color: row[1] }); });
  const L = 300, ca = arrivals(S.l4a, L, 5).length / L, cb = arrivals(S.l4b, L, 6).length / L, cm = (arrivals(S.l4a, L, 5).length + arrivals(S.l4b, L, 6).length) / L; $('l4av').textContent = S.l4a; $('l4bv').textContent = S.l4b; $('p4v').textContent = S.p4;
  $('ro4').textContent = t('s4ro', { sum: f2(S.l4a + S.l4b), thin: f2((S.l4a + S.l4b) * S.p4), meas: f2(cm), n: m.length }); }
function render5() { const { ctx, w, h } = setup($('cv5')), kind = KINDS[(S.idx5 + (S.idx5 >> 2)) % 3], rate = 2, T = 200, ts = pattern(kind, rate, T, 40 + S.idx5), c = countsPer(ts, 1, T), mu = mean(c), va = variance(c), tl = { x: 40, y: 22, w: w - 56, h: 28 }, M0 = axes(ctx, tl, 30, 1, '', '', [0, 10, 20, 30], []);
  ticks(ctx, M0, tl, ts, 30, COL.orange, tl.y + tl.h / 2, tl.h - 4); text(ctx, t('first30'), tl.x, tl.y - 8, { size: 11 }); const kmax = 10, R = { x: 40, y: 92, w: w - 56, h: h - 128 }, hist = new Array(kmax + 1).fill(0); c.forEach(v => { if (v <= kmax) hist[v]++; });
  const ym = 0.5, M = axes(ctx, R, kmax + 1, ym, t('kAxis'), t('fracAxis'), [], [0, 0.25, 0.5]), bw = M.X(1) - M.X(0); for (let k = 0; k <= kmax; k += 2) text(ctx, String(k), M.X(k) + bw / 2, R.y + R.h + 13, { align: 'center', size: 10 }); hist.forEach((v, k) => { ctx.fillStyle = 'rgba(103,215,249,0.55)'; const y = M.Y(Math.min(ym, v / T)); ctx.fillRect(M.X(k) + 2, y, bw - 4, M.Y(0) - y); }); hist.forEach((_, k) => dot(ctx, M.X(k) + bw / 2, M.Y(Math.min(ym, pmf(k, mu))), 4, COL.orange)); text(ctx, t('legPmf'), R.x + R.w - 8, R.y + 14, { align: 'right', size: 12, color: COL.orange });
  KINDS.forEach((k, i) => { const b = $('k5_' + i); b.classList.toggle('active', S.pick5 === i); }); const ok = S.pick5 >= 0 && KINDS[S.pick5] === kind; $('ro5').textContent = !S.checked5 || S.pick5 < 0 ? t('s5ro', { mu: f2(mu), va: f2(va), fano: f2(va / mu), idx: S.idx5 + 1 }) : t(ok ? 's5roOk' : 's5roNo', { fano: f2(va / mu), kind: t('kind_' + kind), guess: t('kind_' + KINDS[S.pick5]) }); }
function replay0() { cancelAnimationFrame(S.raf0); if (reduceMotion()) { S.tau0 = T0; render0(); return; } S.tau0 = 0; const t0 = performance.now(); const tick = now => { S.tau0 = Math.max(0, Math.min(T0, (now - t0) / 400)); render0(); if (S.tau0 < T0) S.raf0 = requestAnimationFrame(tick); }; S.raf0 = requestAnimationFrame(tick); }
function onHide() { cancelAnimationFrame(S.raf0); S.tau0 = T0; render0(); }
function wire() {
  slider('l0', v => { cancelAnimationFrame(S.raf0); S.tau0 = T0; S.l0 = v; render0(); }); $('rp0').addEventListener('click', replay0); $('nw0').addEventListener('click', () => { S.seed0++; cancelAnimationFrame(S.raf0); S.tau0 = T0; render0(); });
  slider('l1', v => { S.l1 = v; render1(); }); $('add1').addEventListener('click', () => { S.n1 = Math.min(4000, S.n1 + (S.n1 < 100 ? 20 : 200)); render1(); }); $('rs1').addEventListener('click', () => { S.n1 = 0; S.seed1++; render1(); });
  slider('l2', v => { S.l2 = v; render2(); }); slider('w2', v => { S.w2 = v; render2(); }); $('nw2').addEventListener('click', () => { S.seed2++; render2(); });
  slider('l3', v => { S.l3 = v; render3(); }); slider('s3', v => { S.s3 = v; render3(); });
  slider('l4a', v => { S.l4a = v; render4(); }); slider('l4b', v => { S.l4b = v; render4(); }); slider('p4', v => { S.p4 = v; render4(); }); $('nw4').addEventListener('click', () => { S.seed4++; render4(); });
  KINDS.forEach((k, i) => $('k5_' + i).addEventListener('click', () => { S.pick5 = i; S.checked5 = false; render5(); })); $('chk5').addEventListener('click', () => { S.checked5 = true; render5(); }); $('nx5').addEventListener('click', () => { S.idx5++; S.pick5 = -1; S.checked5 = false; render5(); });
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
if (typeof module !== 'undefined') module.exports = { rng, arrivals, gaps, expPdf, pmf, countsPer, mean, variance, pattern, KINDS };
