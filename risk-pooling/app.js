/* risk-pooling: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
const LF = (() => { const a = new Float64Array(20002); for (let i = 1; i < a.length; i++) a[i] = a[i - 1] + Math.log(i); return a; })();
const L0 = 10000;
const binPmf = (n, k, p) => k < 0 || k > n ? 0 : p <= 0 ? (k === 0 ? 1 : 0) : p >= 1 ? (k === n ? 1 : 0) : Math.exp(LF[n] - LF[k] - LF[n - k] + k * Math.log(p) + (n - k) * Math.log(1 - p));
const binTail = (n, k, p) => { let s = 0; for (let j = k + 1; j <= n; j++) { const v = binPmf(n, j, p); s += v; if (j > n * p + 12 * Math.sqrt(n * p * (1 - p) + 1) + 20) break; } return s; };
function binSampler(n, p, r) { const sd = Math.sqrt(n * p * (1 - p)), kmax = Math.min(n, Math.ceil(n * p + 10 * sd + 12)), cdf = new Float64Array(kmax + 1); let s = 0; for (let k = 0; k <= kmax; k++) { s += binPmf(n, k, p); cdf[k] = s; } return () => { const u = r() * (s || 1); let lo = 0, hi = kmax; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] >= u) hi = m; else lo = m + 1; } return lo; }; }
const sdAvg = (n, p, L) => L * Math.sqrt(p * (1 - p) / n);
/* With a shared catastrophe (probability q) everyone's loss probability jumps from p0 to pc; independent risk then no longer averages away. */
function sdAvgCorr(n, p0, pc, q, L) { const pe = [p0, pc], w = [1 - q, q], eVar = w[0] * pe[0] * (1 - pe[0]) + w[1] * pe[1] * (1 - pe[1]), mean = w[0] * pe[0] + w[1] * pe[1], vMean = w[0] * Math.pow(pe[0] - mean, 2) + w[1] * Math.pow(pe[1] - mean, 2); return L * Math.sqrt(eVar / n + vMean); }
const corrFloor = (p0, pc, q, L) => L * (pc - p0) * Math.sqrt(q * (1 - q));
function ruinProb(n, p, load) { const thr = Math.floor(n * p * (1 + load) + 1e-9); return binTail(n, thr, p); }
function reserveNeeded(n, p, load, eps) { /* smallest extra reserve (in dollars) so that P(claims > premiums + reserve) <= eps */ const prem = n * p * L0 * (1 + load); let k = 0, tail = 1, acc = 0; for (k = 0; k <= n; k++) { acc += binPmf(n, k, p); if (1 - acc <= eps) break; } return Math.max(0, k * L0 - prem); }
/* Adverse selection: two risk groups choose whether to buy; the premium is the buyers' average expected loss plus a loading. */
const GROUPS = [{ share: 0.7, p: 0.01 }, { share: 0.3, p: 0.05 }];
function spiral(m, load) { let buy = [true, true]; const hist = []; for (let round = 0; round < 8; round++) { const pop = GROUPS.reduce((s, g, i) => s + (buy[i] ? g.share : 0), 0), avg = GROUPS.reduce((s, g, i) => s + (buy[i] ? g.share * g.p : 0), 0) / (pop || 1), prem = avg * L0 * (1 + load); hist.push({ buy: buy.slice(), prem, pop }); const next = GROUPS.map((g, i) => (1 + m) * g.p * L0 >= prem); if (next.every((v, i) => v === buy[i])) break; buy = next; } return hist; }
const NS = [10, 30, 100, 300, 1000, 3000, 10000];
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100), pc = v => (Math.round(v * 1000) / 10) + '%', usd = v => '$' + Math.round(v).toLocaleString('en-US');
const S = { p0: 0.02, seed0: 4, yrs0: 100, raf0: 0, n1: 4, p1: 0.02, seed1: 9, n2: 4, load2: 0.2, q3: 0.05, pc3: 0.2, n3: 4, m4: 1.2, step4: 0, p5: 0.02, load5: 0.2 };
function axes(ctx, R, o) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); (o.xt || []).forEach(([v, lab]) => { line(ctx, o.X(v), R.y, o.X(v), R.y + R.h, COL.grid, 1); text(ctx, lab, o.X(v), R.y + R.h + 13, { align: 'center', size: 10 }); }); (o.yt || []).forEach(([v, lab]) => { line(ctx, R.x, o.Y(v), R.x + R.w, o.Y(v), COL.grid, 1); text(ctx, lab, R.x - 4, o.Y(v) + 4, { align: 'right', size: 10 }); }); if (o.xl) text(ctx, o.xl, R.x + R.w, R.y + R.h + 27, { align: 'right', size: 11 }); if (o.yl) text(ctx, o.yl, R.x, R.y - 5, { size: 11 }); }
function render0() { const { ctx, w, h } = setup($('cv0')), p = S.p0, Y = S.yrs0, r = rng(S.seed0), loss = []; for (let i = 0; i < 100; i++) loss.push(r() < p ? 1 : 0); const R = { x: 40, y: 22, w: w - 56, h: h - 62 }, n = Math.max(1, Math.round(S.yrs0)), bw = R.w / 100, Yp = v => R.y + R.h - v / (1.15 * L0) * R.h, Xp = i => R.x + i * bw;
  axes(ctx, R, { X: i => Xp(i), Y: Yp, yt: [[0, '0'], [5000, '$5k'], [10000, '$10k']], xl: t('yearAxis'), yl: t('lossAxis') }); const upto = Math.min(100, n); loss.slice(0, upto).forEach((v, i) => { if (v) { ctx.fillStyle = COL.red; ctx.fillRect(Xp(i) + 1, Yp(L0), Math.max(2, bw - 2), Yp(0) - Yp(L0)); } });
  line(ctx, R.x, Yp(p * L0), R.x + R.w, Yp(p * L0), COL.green, 1.5, [5, 4]); text(ctx, t('expLine', { e: usd(p * L0) }), R.x + R.w - 4, Yp(p * L0) - 5, { align: 'right', size: 11, color: COL.green }); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); let s = 0; loss.slice(0, upto).forEach((v, i) => { s += v * L0; const m = s / (i + 1); i ? ctx.lineTo(Xp(i) + bw / 2, Yp(m)) : ctx.moveTo(Xp(i) + bw / 2, Yp(m)); }); ctx.stroke(); text(ctx, t('runAvg'), R.x + 6, R.y + 14, { size: 11, color: COL.cyan });
  const hits = loss.slice(0, upto).reduce((a, b) => a + b, 0); $('p0v').textContent = Math.round(p * 1000) / 10; $('ro0').textContent = t('s0ro', { p: pc(p), e: usd(p * L0), L: usd(L0), n: upto, hits, avg: usd(hits * L0 / upto), worst: usd(L0), nonzero: pc(1 - Math.pow(1 - p, upto)) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), n = NS[S.n1], p = S.p1, trials = 400, smp = binSampler(n, p, rng(S.seed1)), nb = 24, xmax = 4, cnt = new Array(nb + 1).fill(0); for (let i = 0; i < trials; i++) { const avg = smp() / n / p; cnt[Math.min(nb, Math.floor(avg / xmax * nb))]++; }
  const R = { x: 40, y: 22, w: w - 56, h: h - 62 }, ym = Math.max(0.2, Math.ceil(Math.max(...cnt) / trials * 10) / 10), X = v => R.x + v / (nb + 1) * R.w, Y = v => R.y + R.h - v / ym * R.h; axes(ctx, R, { X, Y, yt: [[0, '0'], [ym / 2, f2(ym / 2)], [ym, f2(ym)]], xl: t('multAxis'), yl: t('shareAxis') });
  cnt.forEach((c, i) => { ctx.fillStyle = i === nb ? 'rgba(224,100,78,0.7)' : 'rgba(103,215,249,0.6)'; const y = Y(c / trials); ctx.fillRect(X(i) + 1, y, X(1) - X(0) - 2, Y(0) - y); }); [0, 1, 2, 3, 4].forEach(m => text(ctx, m === 4 ? '≥4×' : m + '×', X(m / xmax * nb) + (X(1) - X(0)) / 2, R.y + R.h + 13, { align: 'center', size: 10 })); line(ctx, X(nb / xmax) + 0, R.y, X(nb / xmax), R.y + R.h, COL.green, 1.5, [5, 4]); text(ctx, t('expMark'), X(nb / xmax) + 4, R.y + 14, { size: 11, color: COL.green });
  $('n1o').textContent = n; $('p1v').textContent = Math.round(p * 1000) / 10; const sd = sdAvg(n, p, L0); $('ro1').textContent = t('s1ro', { n, p: pc(p), e: usd(p * L0), sd: usd(sd), rel: f2(sd / (p * L0)), sd1: usd(sdAvg(1, p, L0)), ratio: f1(Math.sqrt(n)) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), n = NS[S.n2], p = 0.02, load = S.load2, mean = n * p, sd = Math.sqrt(n * p * (1 - p)), kLo = Math.max(0, Math.floor(mean - 4.5 * sd - 2)), kHi = Math.min(n, Math.ceil(mean + 4.5 * sd + 3)), thr = Math.floor(n * p * (1 + load) + 1e-9), R = { x: 40, y: 22, w: w - 56, h: h - 62 };
  const ks = []; for (let k = kLo; k <= kHi; k++) ks.push(k); const pm = ks.map(k => binPmf(n, k, p)), ym = Math.max(...pm) * 1.15, X = k => R.x + (k - kLo) / (kHi - kLo + 1) * R.w, Y = v => R.y + R.h - v / ym * R.h; axes(ctx, R, { X, Y, yt: [], xl: t('claimsAxis'), yl: t('probAxis') }); const bw = Math.max(1, R.w / (kHi - kLo + 1));
  ks.forEach((k, i) => { ctx.fillStyle = k > thr ? 'rgba(224,100,78,0.8)' : 'rgba(103,215,249,0.6)'; ctx.fillRect(X(k), Y(pm[i]), Math.max(1, bw - 1), Y(0) - Y(pm[i])); }); const step = Math.max(1, Math.ceil((kHi - kLo) / 6)); for (let k = kLo; k <= kHi; k += step) text(ctx, String(k), X(k) + bw / 2, R.y + R.h + 13, { align: 'center', size: 10 });
  line(ctx, X(thr + 1), R.y, X(thr + 1), R.y + R.h, COL.green, 2, [5, 4]); text(ctx, t('premLine', { k: thr }), X(thr + 1) + 5, R.y + 14, { size: 11, color: COL.green }); text(ctx, t('ruinArea'), R.x + R.w - 4, R.y + 14, { align: 'right', size: 11, color: COL.red }); const ruin = ruinProb(n, p, load); $('n2o').textContent = n; $('load2v').textContent = Math.round(load * 100);
  $('ro2').textContent = t('s2ro', { n, load: Math.round(load * 100), prem: usd(p * L0 * (1 + load)), exp: f1(mean), thr, ruin: ruin < 0.0001 ? '<0.01%' : pc(ruin), profit: usd(n * p * L0 * load) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), p0 = 0.01, pc2 = S.pc3, q = S.q3, R = { x: 52, y: 22, w: w - 68, h: h - 62 }, lx = Math.log10, X = n => R.x + (lx(n) - 1) / 3.3 * R.w, ymin = 1, ymax = 4, Y = v => R.y + R.h - (lx(Math.max(v, 1)) - ymin * 0 - 0) / 4.2 * R.h;
  axes(ctx, R, { X, Y, xt: [[10, '10'], [100, '100'], [1000, '1k'], [10000, '10k']], yt: [[1, '$1'], [10, '$10'], [100, '$100'], [1000, '$1k'], [10000, '$10k']], xl: t('nAxis'), yl: t('sdAxis') }); const cur = (fn, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const n = Math.pow(10, 1 + 3.3 * i / 60); i ? ctx.lineTo(X(n), Y(fn(n))) : ctx.moveTo(X(n), Y(fn(n))); } ctx.stroke(); };
  const mean = (1 - q) * p0 + q * pc2; cur(n => sdAvg(n, mean, L0), COL.cyan); cur(n => sdAvgCorr(n, p0, pc2, q, L0), COL.orange); const fl = corrFloor(p0, pc2, q, L0); if (fl >= 1) { line(ctx, R.x, Y(fl), R.x + R.w, Y(fl), COL.red, 1.5, [5, 4]); text(ctx, t('floorLine', { v: usd(fl) }), R.x + R.w - 4, Y(fl) - 5, { align: 'right', size: 11, color: COL.red }); }
  const n = NS[S.n3]; dot(ctx, X(n), Y(sdAvg(n, mean, L0)), 5, COL.cyan); dot(ctx, X(n), Y(sdAvgCorr(n, p0, pc2, q, L0)), 6, COL.orange); text(ctx, t('legInd'), R.x + 8, R.y + 14, { size: 11, color: COL.cyan }); text(ctx, t('legCorr'), R.x + 8, R.y + 30, { size: 11, color: COL.orange });
  $('q3v').textContent = Math.round(q * 100); $('pc3v').textContent = Math.round(pc2 * 100); $('n3o').textContent = n; $('ro3').textContent = t('s3ro', { n, mean: pc(mean), ind: usd(sdAvg(n, mean, L0)), cor: usd(sdAvgCorr(n, p0, pc2, q, L0)), floor: usd(fl) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), hist = spiral(S.m4, 0.1), k = Math.min(S.step4, hist.length - 1), R = { x: 14, y: 14, w: w - 28, h: h - 30 }, colw = R.w / 8, pmax = 700, Yp = v => R.y + R.h * 0.45 - v / pmax * R.h * 0.4;
  ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); line(ctx, R.x, R.y + R.h * 0.5, R.x + R.w, R.y + R.h * 0.5, COL.grid, 1); text(ctx, t('premiumRow'), R.x + 4, R.y + 12, { size: 11, color: COL.orange }); text(ctx, t('buyersRow'), R.x + 4, R.y + R.h * 0.5 + 14, { size: 11, color: COL.cyan });
  hist.forEach((hh, i) => { if (i > k) return; const x = R.x + colw * (i + 0.5); dot(ctx, x, Yp(hh.prem), 5, COL.orange); if (i) { const pr = hist[i - 1]; line(ctx, R.x + colw * (i - 0.5), Yp(pr.prem), x, Yp(hh.prem), COL.orange, 2); } text(ctx, usd(hh.prem), x, Yp(hh.prem) - 9, { align: 'center', size: 10, color: COL.orange }); GROUPS.forEach((g, gi) => { const y = R.y + R.h * 0.5 + 24 + gi * 26; ctx.fillStyle = hh.buy[gi] ? (gi ? COL.red : COL.cyan) : COL.dim; ctx.fillRect(x - colw * 0.35, y, colw * 0.7, 18); text(ctx, hh.buy[gi] ? t('in') : t('out'), x, y + 13, { align: 'center', size: 10, color: hh.buy[gi] ? '#0a0e14' : COL.muted }); }); text(ctx, t('roundLab', { r: i }), x, R.y + R.h - 6, { align: 'center', size: 10 }); });
  $('m4v').textContent = Math.round(S.m4 * 100); const last = hist[k], final = hist[hist.length - 1];
  $('ro4').textContent = t('s4ro', { m: Math.round(S.m4 * 100), r: k, prem: usd(last.prem), low: t(last.buy[0] ? 'in' : 'out'), high: t(last.buy[1] ? 'in' : 'out'), fin: t(final.buy[0] ? 'finAll' : 'finHigh'), fprem: usd(final.prem), lowC: usd(GROUPS[0].p * L0), highC: usd(GROUPS[1].p * L0) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), p = S.p5, load = S.load5, R = { x: 52, y: 22, w: w - 68, h: h - 62 }, lx = Math.log10, X = n => R.x + (lx(n) - 1) / 3 * R.w, ymax = 4, Y = v => R.y + R.h - (lx(Math.max(v, 1)) - 0) / 4 * R.h; axes(ctx, R, { X, Y, xt: [[10, '10'], [100, '100'], [1000, '1k'], [10000, '10k']], yt: [[1, '$1'], [10, '$10'], [100, '$100'], [1000, '$1k'], [10000, '$10k']], xl: t('nAxis'), yl: t('resAxis') });
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); const pts = NS.concat([20, 50, 200, 500, 2000, 5000]).sort((a, b) => a - b); pts.forEach((n, i) => { const v = reserveNeeded(n, p, load, 0.01) / n; i ? ctx.lineTo(X(n), Y(v)) : ctx.moveTo(X(n), Y(v)); }); ctx.stroke(); NS.forEach(n => dot(ctx, X(n), Y(reserveNeeded(n, p, load, 0.01) / n), 4, COL.orange)); text(ctx, t('legRes'), R.x + 8, R.y + 14, { size: 11, color: COL.orange }); const g = n => reserveNeeded(n, p, load, 0.01) / n;
  $('p5v').textContent = Math.round(p * 1000) / 10; $('load5v').textContent = Math.round(load * 100); $('ro5').textContent = t('s5ro', { p: pc(p), load: Math.round(load * 100), r1: usd(g(100)), r2: usd(g(1000)), r3: usd(g(10000)), ratio: g(100) > 0 && g(10000) > 0 ? f1(g(100) / g(10000)) : '—' }); }
function replay0() { cancelAnimationFrame(S.raf0); if (reduceMotion()) { S.yrs0 = 100; render0(); return; } S.yrs0 = 0; const t0 = performance.now(); const tk = now => { S.yrs0 = Math.max(0, Math.min(100, (now - t0) / 50)); render0(); if (S.yrs0 < 100) S.raf0 = requestAnimationFrame(tk); }; S.raf0 = requestAnimationFrame(tk); }
function onHide() { cancelAnimationFrame(S.raf0); S.yrs0 = 100; render0(); }
function wire() {
  slider('p0', v => { cancelAnimationFrame(S.raf0); S.yrs0 = 100; S.p0 = v / 100; render0(); }); $('rp0').addEventListener('click', replay0); $('nw0').addEventListener('click', () => { S.seed0++; cancelAnimationFrame(S.raf0); S.yrs0 = 100; render0(); });
  slider('n1', v => { S.n1 = v; render1(); }); slider('p1', v => { S.p1 = v / 100; render1(); }); $('nw1').addEventListener('click', () => { S.seed1++; render1(); });
  slider('n2', v => { S.n2 = v; render2(); }); slider('load2', v => { S.load2 = v / 100; render2(); }); slider('q3', v => { S.q3 = v / 100; render3(); }); slider('pc3', v => { S.pc3 = v / 100; render3(); }); slider('n3', v => { S.n3 = v; render3(); });
  slider('m4', v => { S.m4 = v / 100; S.step4 = 0; render4(); }); $('st4').addEventListener('click', () => { S.step4++; render4(); }); $('all4').addEventListener('click', () => { S.step4 = 99; render4(); }); $('rs4').addEventListener('click', () => { S.step4 = 0; render4(); });
  slider('p5', v => { S.p5 = v / 100; render5(); }); slider('load5', v => { S.load5 = v / 100; render5(); });
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
if (typeof module !== 'undefined') module.exports = { rng, binPmf, binTail, binSampler, sdAvg, sdAvgCorr, corrFloor, ruinProb, reserveNeeded, spiral, GROUPS, NS, L0 };
