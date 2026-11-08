/* auctions: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
function pointerXY(c, ev) { const r = c.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }

/* Model: one item, private values uniform on [0,100], risk-neutral bidders. All functions are pure. */
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
const winProbFirst = b => clampN(b / 50, 0, 1);                        // rival bids half her value, so her bid is uniform on [0,50]
const expectedFirst = (v, b) => (v - b) * winProbFirst(b);
const bestBidFirst = v => v / 2;                                      // maximises (v-b)*b/50 when v/2 <= 50
const payoffSecond = (v, b, r) => (b > r ? v - r : 0);                // win if strictly higher, pay the rival bid
function maxGainOverTruth(v, b) { let g = -Infinity; for (let r = 0; r <= 100; r += 0.5) g = Math.max(g, payoffSecond(v, b, r) - payoffSecond(v, v, r)); return g; }
function draw(seed, n) { const R = rng(seed), a = []; for (let i = 0; i < n; i++) a.push(Math.round(R() * 1000) / 10); return a; }
const sortDesc = a => a.slice().sort((x, y) => y - x);
const priceFirst = vals => sortDesc(vals)[0] * (vals.length - 1) / vals.length;   // symmetric equilibrium bid of the top value
const priceSecond = vals => sortDesc(vals)[1];
const priceEnglish = vals => sortDesc(vals)[1];                       // clock stops when the runner-up drops out
const priceDutch = vals => priceFirst(vals);                          // first to shout pays own bid, same equilibrium bid as sealed first-price
const theoryRevenue = n => 100 * (n - 1) / (n + 1);
/* Winner's curse: common value V ~ U[0,100], signal = V + e, e ~ U[-sigma, sigma]; winner = highest bid; bid = signal - shade. */
function curseMean(n, sigma, shade, seed) { const R = rng(seed); let tot = 0; const M = 4000; for (let k = 0; k < M; k++) { const V = R() * 100; let top = -Infinity; for (let i = 0; i < n; i++) { const e = (R() * 2 - 1) * sigma; top = Math.max(top, V + e - shade); } tot += V - top; } return tot / M; }
const curseTheory = (n, sigma, shade) => shade - sigma * (n - 1) / (n + 1);
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2);
const S = { v0: 80, b0: 70, v1: 60, b1: 80, r1: 70, n2: 4, runs: [], sum1: 0, sum2: 0, hist: [], seed2: 11, price3: 0, seed3: 3, seed4: 5, n4: 5, acc4: [0, 0, 0, 0], cnt4: 0, n5: 6, sig5: 20, shade5: 0 };
function addRun() { const vals = draw(S.seed2++, S.n2); S.sum1 += priceFirst(vals); S.sum2 += priceSecond(vals); S.cnt2 = (S.cnt2 || 0) + 1; if (S.cnt2 % 5 === 0 || S.cnt2 < 20) S.hist.push([S.cnt2, S.sum1 / S.cnt2, S.sum2 / S.cnt2]); }
const tick2 = ticker(() => { for (let i = 0; i < 5; i++) addRun(); render2(); if (S.cnt2 >= 1000) { return false; } });
function resetRuns() { tick2.stop(); S.sum1 = 0; S.sum2 = 0; S.cnt2 = 0; S.hist = []; S.seed2 = 11; }
const tick3 = ticker(dt => { const vals = draw(S.seed3, 5), v2 = priceEnglish(vals); S.price3 = Math.min(v2, S.price3 + 12 * dt); render3(); if (S.price3 >= v2) return false; });

function render0() {
  const { ctx, w, h } = setup($('cv0')), v = S.v0, b = S.b0, L = { x: 38, y: 14, w: w - 54, h: h - 46 };
  const ymax = Math.max(10, v * v / 200 * 1.2), X = x => L.x + x / 100 * L.w, Y = y => L.y + L.h - y / ymax * L.h;
  axes(ctx, L); const pts = []; for (let x = 0; x <= 100; x += 2) pts.push([X(x), Y(Math.max(0, expectedFirst(v, x)))]); curve(ctx, pts, COL.orange, 2.5);
  const pw = []; for (let x = 0; x <= 100; x += 2) pw.push([X(x), L.y + L.h - winProbFirst(x) * L.h * 0.35]); curve(ctx, pw, '#35566b', 1.5);
  text(ctx, t('axBid'), L.x + L.w, L.y + L.h + 16, { align: 'right', size: 11 }); text(ctx, t('axExp'), L.x + 4, L.y + 10, { size: 11, color: COL.orange }); text(ctx, t('axWin'), L.x + L.w - 4, L.y + L.h - 0.35 * L.h - 6, { align: 'right', size: 10, color: '#6f93a8' });
  line(ctx, X(v), L.y, X(v), L.y + L.h, COL.muted, 1, [3, 3]); text(ctx, t('lblValue'), X(v), L.y + L.h + 28, { align: 'center', size: 10 });
  const bb = bestBidFirst(v); dot(ctx, X(bb), Y(expectedFirst(v, bb)), 6, COL.green); text(ctx, t('lblBest'), X(bb), Y(expectedFirst(v, bb)) - 10, { align: 'center', size: 11, color: COL.green });
  line(ctx, X(b), L.y, X(b), L.y + L.h, COL.cyan, 2); dot(ctx, X(b), Y(Math.max(0, expectedFirst(v, b))), 6, COL.cyan);
  $('ro0').textContent = t('s0ro', { v: v, b: b, p: Math.round(winProbFirst(b) * 100), g: f1(v - b), e: f2(expectedFirst(v, b)), bb: f1(bb), eb: f2(expectedFirst(v, bb)) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), v = S.v1, b = S.b1, r = S.r1, L = { x: 38, y: 14, w: w - 54, h: h - 46 };
  const X = x => L.x + x / 100 * L.w, Y = y => L.y + (100 - y) / 160 * L.h;
  axes(ctx, L); line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.muted, 1);
  // shaded region where deviating differs from truth
  const lo = Math.min(v, b), hi = Math.max(v, b); ctx.fillStyle = 'rgba(224,100,78,.18)'; if (hi > lo) ctx.fillRect(X(lo), L.y, X(hi) - X(lo), L.h);
  const pt = [], py = []; for (let x = 0; x <= 100; x += 1) { pt.push([X(x), Y(payoffSecond(v, v, x))]); py.push([X(x), Y(payoffSecond(v, b, x))]); }
  curve(ctx, pt, COL.green, 3); curve(ctx, py, COL.orange, 2, ); 
  text(ctx, t('axRival'), L.x + L.w, L.y + L.h + 16, { align: 'right', size: 11 }); text(ctx, t('axPay'), L.x + 4, L.y + 10, { size: 11 });
  text(ctx, t('lblTruth'), X(Math.min(98, v)), Y(Math.max(0, v - Math.min(v, 98))) - 4, { align: 'center', size: 10, color: COL.green });
  line(ctx, X(r), L.y, X(r), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(r), Y(payoffSecond(v, b, r)), 6, COL.cyan);
  const g = maxGainOverTruth(v, b), me = payoffSecond(v, b, r), tr = payoffSecond(v, v, r);
  $('ro1').textContent = t('s1ro', { v: v, b: b, r: r, me: f1(me), tr: f1(tr), g: f1(g), verdict: g <= 0 ? t('vNever') : t('vBetter') });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), n = S.n2, th = theoryRevenue(n), L = { x: 38, y: 14, w: w - 54, h: h - 46 }, N = Math.max(60, S.cnt2 || 0), X = x => L.x + x / N * L.w, Y = y => L.y + L.h - y / 100 * L.h;
  axes(ctx, L); line(ctx, L.x, Y(th), L.x + L.w, Y(th), COL.muted, 1.5, [5, 4]); text(ctx, t('lblTheory', { th: f1(th) }), L.x + L.w - 2, Y(th) - 5, { align: 'right', size: 11 });
  curve(ctx, S.hist.map(p => [X(p[0]), Y(p[1])]), COL.orange, 2.2); curve(ctx, S.hist.map(p => [X(p[0]), Y(p[2])]), COL.cyan, 2.2);
  text(ctx, t('axCount'), L.x + L.w, L.y + L.h + 16, { align: 'right', size: 11 }); text(ctx, t('axRev'), L.x + 4, L.y + 10, { size: 11 });
  text(ctx, t('rule1'), L.x + 6, L.y + L.h - 22, { size: 11, color: COL.orange, bold: true }); text(ctx, t('rule2'), L.x + 6, L.y + L.h - 8, { size: 11, color: COL.cyan, bold: true });
  const c = S.cnt2 || 0; $('run2').textContent = tick2.running ? t('pause') : t('run');
  $('ro2').textContent = c ? t('s2ro', { n: n, c: c, a1: f1(S.sum1 / c), a2: f1(S.sum2 / c), th: f1(th) }) : t('s2ro0', { n: n, th: f1(th) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), vals = draw(S.seed3, 5), v2 = priceEnglish(vals), p = S.price3, L = { x: 34, y: 12, w: w - 84, h: h - 40 }, bw = L.h / 5, X = x => L.x + x / 100 * L.w;
  const order = vals.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
  vals.forEach((v, i) => { const y = L.y + i * bw, active = v > p, top = v === order[0][0]; ctx.fillStyle = active ? (p >= v2 && top ? COL.green : COL.cyan) : '#1e2f3d'; ctx.fillRect(L.x, y + 4, X(v) - L.x, bw - 8); text(ctx, t('bidder', { i: i + 1 }), L.x - 4, y + bw / 2 + 4, { align: 'right', size: 11 }); text(ctx, f1(v), X(v) + 4, y + bw / 2 + 4, { size: 11, color: active ? COL.ink : COL.muted }); });
  line(ctx, X(p), L.y, X(p), L.y + L.h, COL.orange, 2.5); text(ctx, t('lblPrice', { p: f1(p) }), X(p), L.y + L.h + 14, { align: 'center', size: 11, color: COL.orange, bold: true });
  const left = vals.filter(v => v > p).length, done = p >= v2;
  $('auto3').textContent = tick3.running ? t('pause') : t('auto');
  $('ro3').textContent = done ? t('s3roDone', { w: order[0][1] + 1, pay: f1(v2), v1: f1(order[0][0]) }) : t('s3ro', { p: f1(p), k: left });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), n = S.n4, vals = draw(S.cnt4 ? S.seed4 - 1 : S.seed4, n), pr = [priceFirst(vals), priceSecond(vals), priceEnglish(vals), priceDutch(vals)], names = ['fmt1', 'fmt2', 'fmt3', 'fmt4'], cols = [COL.orange, COL.cyan, COL.green, COL.violet];
  const L = { x: 12, y: 12, w: w - 24, h: h - 56 }, bw = L.w / 4; axes(ctx, L);
  pr.forEach((p, i) => { const hh = p / 100 * L.h; ctx.fillStyle = cols[i]; ctx.fillRect(L.x + i * bw + 8, L.y + L.h - hh, bw - 16, hh); text(ctx, f1(p), L.x + i * bw + bw / 2, L.y + L.h - hh - 5, { align: 'center', size: 12, color: COL.ink, bold: true }); text(ctx, t(names[i]), L.x + i * bw + bw / 2, L.y + L.h + 16, { align: 'center', size: 11 }); });
  const c = S.cnt4, th = theoryRevenue(n); $('ro4').textContent = t('s4ro', { vals: sortDesc(vals).map(f1).join(', '), n: n }) + ' ' + (c ? t('s4avg', { c: c, a: S.acc4.map(x => f1(x / c)).join(' / '), th: f1(th) }) : t('s4none', { th: f1(th) }));
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), sg = S.sig5, sh = S.shade5, L = { x: 40, y: 16, w: w - 56, h: h - 48 }, ns = [2, 3, 4, 5, 6, 7, 8, 9, 10], bw = L.w / ns.length;
  const ymax = 30, Y = y => L.y + L.h / 2 - y / ymax * (L.h / 2);
  axes(ctx, { x: L.x, y: L.y, w: L.w, h: L.h }); line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.muted, 1.5);
  ns.forEach((n, i) => { const m = curseMean(n, sg, sh, 99), y = Y(m), y0 = Y(0); ctx.fillStyle = m >= 0 ? COL.green : COL.red; ctx.globalAlpha = n === S.n5 ? 1 : 0.55; ctx.fillRect(L.x + i * bw + 6, Math.min(y, y0), bw - 12, Math.abs(y - y0)); ctx.globalAlpha = 1; text(ctx, String(n), L.x + i * bw + bw / 2, L.y + L.h + 14, { align: 'center', size: 11 }); });
  text(ctx, t('axN'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axProfit'), L.x + 4, L.y + 10, { size: 11 });
  const m = curseMean(S.n5, sg, sh, 99); $('ro5').textContent = t('s5ro', { n: S.n5, s: sg, sh: sh, m: f2(m), th: f2(curseTheory(S.n5, sg, sh)), verdict: m < 0 ? t('vLose') : t('vWin') });
}
function wire() {
  slider('v0', v => { S.v0 = v; render0(); }); slider('b0', v => { S.b0 = v; render0(); });
  slider('v1', v => { S.v1 = v; render1(); }); slider('b1', v => { S.b1 = v; render1(); }); slider('r1', v => { S.r1 = v; render1(); });
  slider('n2', v => { S.n2 = v; resetRuns(); render2(); });
  $('run2').addEventListener('click', () => { if (tick2.running) tick2.stop(); else if (reduceMotion()) { for (let i = 0; i < 200; i++) addRun(); } else tick2.start(); render2(); });
  $('reset2').addEventListener('click', () => { resetRuns(); render2(); });
  $('up3').addEventListener('click', () => { const v2 = priceEnglish(draw(S.seed3, 5)); S.price3 = Math.min(v2, Math.floor(S.price3 / 5) * 5 + 5); render3(); });
  $('auto3').addEventListener('click', () => { if (tick3.running) tick3.stop(); else if (reduceMotion()) { S.price3 = priceEnglish(draw(S.seed3, 5)); } else tick3.start(); render3(); });
  $('new3').addEventListener('click', () => { tick3.stop(); S.seed3++; S.price3 = 0; render3(); });
  $('reset3').addEventListener('click', () => { tick3.stop(); S.price3 = 0; render3(); });
  $('new4').addEventListener('click', () => { addDraw4(1); render4(); }); $('more4').addEventListener('click', () => { addDraw4(50); render4(); });
  $('reset4').addEventListener('click', () => { S.seed4 = 5; S.acc4 = [0, 0, 0, 0]; S.cnt4 = 0; render4(); });
  slider('n5', v => { S.n5 = v; render5(); }); slider('sg5', v => { S.sig5 = v; render5(); }); slider('sh5', v => { S.shade5 = v; render5(); });
}
function addDraw4(k) { for (let i = 0; i < k; i++) { const vals = draw(S.seed4++, S.n4); [priceFirst(vals), priceSecond(vals), priceEnglish(vals), priceDutch(vals)].forEach((p, j) => { S.acc4[j] += p; }); S.cnt4++; } }

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

if (typeof module !== 'undefined') module.exports = { winProbFirst, expectedFirst, bestBidFirst, payoffSecond, maxGainOverTruth, draw, priceFirst, priceSecond, priceEnglish, priceDutch, theoryRevenue, curseMean, curseTheory };
