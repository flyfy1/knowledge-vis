/* externalities: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: linear market with a constant external damage e per unit. Inverse demand P = a - b*Q; private marginal cost P = c + d*Q; social marginal cost adds e. Pure functions. */
const BASE = { a: 100, b: 1, c: 20, d: 1 };
const qPrivate = (m, t) => Math.max(0, (m.a - m.c - (t || 0)) / (m.b + m.d));
const qSocial = (m, e) => Math.max(0, (m.a - m.c - e) / (m.b + m.d));
const priceAt = (m, Q) => m.a - m.b * Q;
const dwl = (m, e) => 0.5 * e * Math.max(0, qPrivate(m) - qSocial(m, e));
const welfare = (m, e, t) => { const Q = qPrivate(m, t), cs = 0.5 * m.b * Q * Q, ps = 0.5 * m.d * Q * Q, rev = (t || 0) * Q, dmg = e * Q; return cs + ps + rev - dmg; };   // consumer + producer surplus + tax revenue - external damage
const surplus = (m) => { const Q = qPrivate(m); return { cs: 0.5 * m.b * Q * Q, ps: 0.5 * m.d * Q * Q, Q: Q, P: priceAt(m, Q) }; };
const commonsN = (m, A, c, herders) => herders / (herders + 1) * (A - c);
const commonsProfit = (N, A, c) => N * (A - N - c);
function coase(G, D, right, T) { const bargain = Math.abs(G - D) > T; let pollute; if (bargain) pollute = G > D; else pollute = right === 'factory'; let pay = 0; if (bargain && right === 'neighbor' && G > D) pay = (G + D) / 2; if (bargain && right === 'factory' && G < D) pay = -(G + D) / 2;
  return { pollute: pollute, pay: pay, total: pollute ? G - D : 0 }; } // pay > 0: factory pays neighbour; pay < 0: neighbour pays factory
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f0 = v => String(Math.round(v));
const S = { a0: 100, c0: 20, e1: 20, e2: 20, d2: 10, e3: 20, t3: 10, m4: 1, G5: 60, D5: 40, right5: 'neighbor', T5: 0 };
function frame(ctx, w, h, qmax, pmax, box) { const L = box || { x: 40, y: 12, w: w - 56, h: h - 44 }; axes(ctx, L); const X = q => L.x + q / qmax * L.w, Y = p => L.y + L.h - p / pmax * L.h; [0, qmax / 2, qmax].forEach(q => text(ctx, f0(q), X(q), L.y + L.h + 14, { align: 'center', size: 10 })); [0, pmax / 2, pmax].forEach(p => text(ctx, f0(p), L.x - 4, Y(p) + 3, { align: 'right', size: 10 })); text(ctx, t('axQ'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axP'), L.x + 4, L.y + 10, { size: 11 }); return { L, X, Y }; }
function poly(ctx, F, pts, col, alpha) { ctx.fillStyle = col; ctx.globalAlpha = alpha; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(F.X(p[0]), F.Y(p[1])) : ctx.moveTo(F.X(p[0]), F.Y(p[1]))); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
function lines(ctx, F, m, e, tax, qmax) { const D = q => priceAt(m, q), Sf = (q, add) => m.c + (add || 0) + m.d * q; curve(ctx, [[F.X(0), F.Y(m.a)], [F.X(qmax), F.Y(D(qmax))]], COL.cyan, 2.5); curve(ctx, [[F.X(0), F.Y(m.c)], [F.X(qmax), F.Y(Sf(qmax))]], COL.orange, 2.5);
  if (e) curve(ctx, [[F.X(0), F.Y(m.c + e)], [F.X(qmax), F.Y(Sf(qmax, e))]], COL.red, 2.5, [5, 4]); if (tax) curve(ctx, [[F.X(0), F.Y(m.c + tax)], [F.X(qmax), F.Y(Sf(qmax, tax))]], COL.green, 2.5); }
function render0() {
  const { ctx, w, h } = setup($('cv0')), m = Object.assign({}, BASE, { a: S.a0, c: S.c0 }), s = surplus(m), qmax = 110, F = frame(ctx, w, h, qmax, 130);
  poly(ctx, F, [[0, m.a], [s.Q, s.P], [0, s.P]], COL.cyan, 0.25); poly(ctx, F, [[0, s.P], [s.Q, s.P], [0, m.c]], COL.orange, 0.25); lines(ctx, F, m, 0, 0, qmax); dot(ctx, F.X(s.Q), F.Y(s.P), 6, COL.ink); text(ctx, t('lblCS'), F.X(s.Q * 0.2), F.Y((m.a + s.P) / 2), { size: 11, color: COL.cyan }); text(ctx, t('lblPS'), F.X(s.Q * 0.2), F.Y((m.c + s.P) / 2), { size: 11, color: COL.orange });
  text(ctx, t('lblDemand'), F.X(qmax) - 4, F.Y(priceAt(m, qmax)) - 8, { align: 'right', size: 11, color: COL.cyan }); text(ctx, t('lblSupply'), F.X(qmax) - 4, F.Y(m.c + m.d * qmax) - 8, { align: 'right', size: 11, color: COL.orange });
  $('ro0').textContent = t('s0ro', { Q: f1(s.Q), P: f1(s.P), cs: f0(s.cs), ps: f0(s.ps), tot: f0(s.cs + s.ps) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), m = BASE, e = S.e1, s = surplus(m), qmax = 110, F = frame(ctx, w, h, qmax, 130), qs = qSocial(m, e);
  poly(ctx, F, [[0, m.c], [s.Q, m.c + m.d * s.Q], [s.Q, m.c + e + m.d * s.Q], [0, m.c + e]], COL.red, 0.28); lines(ctx, F, m, e, 0, qmax); dot(ctx, F.X(s.Q), F.Y(s.P), 6, COL.orange); dot(ctx, F.X(qs), F.Y(priceAt(m, qs)), 6, COL.green);
  text(ctx, t('lblMarket'), F.X(s.Q) + 6, F.Y(s.P) - 8, { size: 11, color: COL.orange }); text(ctx, t('lblOptimum'), F.X(qs) - 6, F.Y(priceAt(m, qs)) - 8, { size: 11, color: COL.green, align: 'right' }); text(ctx, t('lblSocial'), F.X(qmax) - 4, F.Y(m.c + e + m.d * qmax) - 8, { align: 'right', size: 11, color: COL.red });
  $('ro1').textContent = t('s1ro', { e: e, Q: f1(s.Q), P: f1(s.P), qs: f1(qs), dmg: f0(e * s.Q), over: f1(s.Q - qs) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), m = Object.assign({}, BASE, { d: S.d2 / 10 }), e = S.e2, qm = qPrivate(m), qs = qSocial(m, e), qmax = 110, F = frame(ctx, w, h, qmax, 130);
  poly(ctx, F, [[qs, m.c + e + m.d * qs], [qm, m.c + e + m.d * qm], [qs, priceAt(m, qs)]], COL.red, 0.5); lines(ctx, F, m, e, 0, qmax); dot(ctx, F.X(qm), F.Y(priceAt(m, qm)), 6, COL.orange); dot(ctx, F.X(qs), F.Y(priceAt(m, qs)), 6, COL.green);
  $('d2v').textContent = m.d.toFixed(1); text(ctx, t('lblDwl'), F.X(qm) + 6, F.Y(priceAt(m, qs)) + 4, { size: 11, color: COL.red, bold: true }); $('ro2').textContent = t('s2ro', { e: e, d: m.d.toFixed(1), over: f1(qm - qs), dwl: f1(dwl(m, e)), formula: '½ × ' + e + ' × ' + f1(qm - qs) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), m = BASE, e = S.e3, tx = S.t3, qmax = 110, top = { x: 40, y: 12, w: w - 56, h: h * 0.5 - 24 }, F = frame(ctx, w, h, qmax, 130, top), Q = qPrivate(m, tx);
  lines(ctx, F, m, e, tx, qmax); dot(ctx, F.X(Q), F.Y(priceAt(m, Q)), 6, COL.green); dot(ctx, F.X(qSocial(m, e)), F.Y(priceAt(m, qSocial(m, e))), 4, COL.red); text(ctx, t('lblTaxSupply', { t: tx }), F.X(qmax) - 4, F.Y(m.c + tx + m.d * qmax) - 8, { align: 'right', size: 11, color: COL.green });
  const B = { x: 40, y: h * 0.5 + 36, w: w - 56, h: h * 0.5 - 78 }; axes(ctx, B); const tmax = 60, Wmax = welfare(m, e, e) * 1.1 || 1, Wmin = Math.min(welfare(m, e, 0), welfare(m, e, tmax)) , X2 = q => B.x + q / tmax * B.w, Y2 = v => B.y + B.h - (v - Wmin) / (Wmax - Wmin) * B.h;
  const pts = []; for (let q = 0; q <= tmax; q += 1) pts.push([X2(q), Y2(welfare(m, e, q))]); curve(ctx, pts, COL.orange, 2.5); line(ctx, X2(e), B.y, X2(e), B.y + B.h, COL.muted, 1, [4, 3]); dot(ctx, X2(tx), Y2(welfare(m, e, tx)), 6, COL.green);
  text(ctx, t('axTax'), B.x + B.w, B.y + B.h + 28, { align: 'right', size: 11 }); text(ctx, t('axWelfare'), B.x + 4, B.y + 10, { size: 11 }); [0, 20, 40, 60].forEach(q => text(ctx, String(q), X2(q), B.y + B.h + 14, { align: 'center', size: 10 }));
  $('ro3').textContent = t('s3ro', { t: tx, e: e, Q: f1(Q), W: f0(welfare(m, e, tx)), Wopt: f0(welfare(m, e, e)), loss: f0(welfare(m, e, e) - welfare(m, e, tx)), rev: f0(tx * Q), verdict: tx === e ? t('vExact') : tx < e ? t('vUnder') : t('vOver') });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), A = 100, c = 20, mh = S.m4, N = commonsN(null, A, c, mh), Ns = commonsN(null, A, c, 1), L = { x: 44, y: 14, w: w - 60, h: h * 0.55 }, X = n => L.x + n / 90 * L.w, pmax = commonsProfit(40, A, c) * 1.1, pmin = -commonsProfit(40, A, c) * 0.1, Y = v => L.y + L.h - (v - pmin) / (pmax - pmin) * L.h; axes(ctx, L);
  const pts = []; for (let n = 0; n <= 90; n++) pts.push([X(n), Y(commonsProfit(n, A, c))]); curve(ctx, pts, COL.orange, 2.5); line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.muted, 1);
  dot(ctx, X(Ns), Y(commonsProfit(Ns, A, c)), 6, COL.green); text(ctx, t('lblSocialOpt'), X(Ns), Y(commonsProfit(Ns, A, c)) - 10, { align: 'center', size: 11, color: COL.green }); dot(ctx, X(N), Y(commonsProfit(N, A, c)), 7, COL.red); text(ctx, t('lblHerd', { n: mh }), Math.min(X(N), w - 110), Y(commonsProfit(N, A, c)) - 10 + (N > 60 ? 28 : 0), { align: 'center', size: 11, color: COL.red });
  [0, 30, 60, 90].forEach(n => text(ctx, String(n), X(n), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axCows'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axProfitAll'), L.x + 4, L.y + 10, { size: 11 });
  const B = { x: 44, y: L.y + L.h + 48, w: L.w, h: h - (L.y + L.h) - 64 }; axes(ctx, B); const Xb = k => B.x + (k - 1) / 19 * B.w, Yb = n => B.y + B.h - n / 85 * B.h; const p2 = []; for (let k = 1; k <= 20; k++) p2.push([Xb(k), Yb(commonsN(null, A, c, k))]); curve(ctx, p2, COL.cyan, 2); dot(ctx, Xb(mh), Yb(N), 5, COL.red); text(ctx, t('axHerders'), B.x + B.w, B.y + B.h + 14, { align: 'right', size: 11 }); text(ctx, t('axTotalCows'), B.x + 4, B.y + 10, { size: 11 });
  $('ro4').textContent = t('s4ro', { m: mh, N: f1(N), Ns: f1(Ns), pr: f0(commonsProfit(N, A, c)), ps: f0(commonsProfit(Ns, A, c)) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), G = S.G5, D = S.D5, T = S.T5, r = coase(G, D, S.right5, T), bw = (w - 40) / 2;
  const sc = (h - 110) / 100; [['lblGain', G, COL.green], ['lblDamage', D, COL.red]].forEach(([k, v, col], i) => { const x = 14 + i * (bw + 12), hh = v * sc; ctx.fillStyle = col; ctx.fillRect(x, 60 + (100 * sc - hh), bw, hh); text(ctx, t(k) + ' ' + v, x + bw / 2, 52, { align: 'center', size: 12, color: col, bold: true }); });
  text(ctx, t(r.pollute ? 'lblPollutes' : 'lblNoPoll'), w / 2, h - 36, { align: 'center', size: 14, color: r.pollute ? COL.red : COL.green, bold: true }); text(ctx, r.pay > 0 ? t('lblPayN', { v: f1(r.pay) }) : r.pay < 0 ? t('lblPayF', { v: f1(-r.pay) }) : t('lblNoPay'), w / 2, h - 14, { align: 'center', size: 12 });
  ['neighbor', 'factory'].forEach(k => { const b = $('rt_' + k); b.classList.toggle('active', S.right5 === k); b.setAttribute('aria-pressed', S.right5 === k ? 'true' : 'false'); });
  $('ro5').textContent = t('s5ro', { G: G, D: D, right: t('rt_' + S.right5), T: T, bargain: Math.abs(G - D) > T ? t('bYes') : t('bNo'), out: r.pollute ? t('lblPollutes') : t('lblNoPoll'), total: f0(r.total), best: f0(Math.max(0, G - D)) });
}
function wire() {
  slider('a0', v => { S.a0 = v; render0(); }); slider('c0', v => { S.c0 = v; render0(); }); slider('e1', v => { S.e1 = v; render1(); }); slider('e2', v => { S.e2 = v; render2(); }); $('d2').addEventListener('input', e => { S.d2 = +e.target.value; render2(); });
  slider('e3', v => { S.e3 = v; render3(); }); slider('t3', v => { S.t3 = v; render3(); }); slider('m4', v => { S.m4 = v; render4(); });
  slider('G5', v => { S.G5 = v; render5(); }); slider('D5', v => { S.D5 = v; render5(); }); slider('T5', v => { S.T5 = v; render5(); }); ['neighbor', 'factory'].forEach(k => $('rt_' + k).addEventListener('click', () => { S.right5 = k; render5(); }));
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

if (typeof module !== 'undefined') module.exports = { BASE, qPrivate, qSocial, priceAt, dwl, welfare, surplus, commonsN, commonsProfit, coase };
