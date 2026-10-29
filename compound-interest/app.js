/* compound-interest: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: money with a fixed annual rate. All functions are pure. Amounts are in currency units, rates are fractions per year. */
const simpleAmt = (P, r, t) => P * (1 + r * t);
const compoundAmt = (P, r, t, m) => (m === Infinity ? P * Math.exp(r * t) : P * Math.pow(1 + r / m, m * t));
const doublingExact = r => Math.log(2) / Math.log(1 + r);
const rule72 = rPct => 72 / rPct;
const presentValue = (fv, r, t) => fv / Math.pow(1 + r, t);
const fvAnnuity = (C, r, n) => (r === 0 ? C * n : C * (Math.pow(1 + r, n) - 1) / r);
const loanPayment = (P, r, years) => { const i = r / 12, n = years * 12; return i === 0 ? P / n : P * i / (1 - Math.pow(1 + i, -n)); };
const loanBalance = (P, r, years, months) => { const i = r / 12, pay = loanPayment(P, r, years); return i === 0 ? P - pay * months : P * Math.pow(1 + i, months) - pay * (Math.pow(1 + i, months) - 1) / i; };
const MS = [1, 2, 4, 12, 365, Infinity];
const money = v => Math.round(v).toLocaleString('en-US');
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2);
const S = { r0: 6, t0: 30, r1: 8, t1: 10, m1: 3, r2: 6, r3: 5, t3: 20, C4: 1000, r4: 5, n4: 30, P5: 200, r5: 5, y5: 30 };
const PC = 1000;
function frame2(ctx, w, h, xmax, ymax, xt) { const L = { x: 52, y: 14, w: w - 66, h: h - 46 }; axes(ctx, L); const X = x => L.x + x / xmax * L.w, Y = y => L.y + L.h - y / ymax * L.h; xt.forEach(v => text(ctx, v + '', X(v), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 0.5, 1].forEach(q => text(ctx, money(ymax * q), L.x - 4, Y(ymax * q) + 3, { align: 'right', size: 10 })); return { L, X, Y }; }
function render0() {
  const { ctx, w, h } = setup($('cv0')), r = S.r0 / 100, T = 40, ymax = Math.max(simpleAmt(PC, r, T), compoundAmt(PC, r, T, 1)) * 1.05, F = frame2(ctx, w, h, T, ymax, [0, 10, 20, 30, 40]);
  const ps = [], pc = []; for (let t = 0; t <= T; t += 0.5) { ps.push([F.X(t), F.Y(simpleAmt(PC, r, t))]); pc.push([F.X(t), F.Y(compoundAmt(PC, r, t, 1))]); }
  curve(ctx, ps, COL.cyan, 2.5); curve(ctx, pc, COL.orange, 3); text(ctx, t('lblSimple'), F.X(T) - 4, F.Y(simpleAmt(PC, r, T)) - 6, { align: 'right', size: 11, color: COL.cyan }); text(ctx, t('lblCompound'), F.X(T * 0.62), F.Y(compoundAmt(PC, r, T * 0.62, 1)) - 12, { align: 'right', size: 11, color: COL.orange });
  line(ctx, F.X(S.t0), F.L.y, F.X(S.t0), F.L.y + F.L.h, COL.ink, 1.5, [4, 3]); dot(ctx, F.X(S.t0), F.Y(simpleAmt(PC, r, S.t0)), 5, COL.cyan); dot(ctx, F.X(S.t0), F.Y(compoundAmt(PC, r, S.t0, 1)), 6, COL.orange);
  text(ctx, t('axYears'), F.L.x + F.L.w, F.L.y + F.L.h + 28, { align: 'right', size: 11 });
  const a = simpleAmt(PC, r, S.t0), b = compoundAmt(PC, r, S.t0, 1); $('ro0').textContent = t('s0ro', { r: S.r0, t: S.t0, a: money(a), b: money(b), d: money(b - a), x: f1(b / a) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), r = S.r1 / 100, T = S.t1, L = { x: 14, y: 18, w: w - 28, h: h - 56 }, base = compoundAmt(PC, r, T, 1), top = compoundAmt(PC, r, T, Infinity), lo = PC;
  const bw = L.w / MS.length, Y = v => L.y + L.h - (v - lo) / (top * 1.02 - lo) * L.h;
  MS.forEach((m, i) => { const v = compoundAmt(PC, r, T, m), on = i === S.m1; ctx.fillStyle = on ? COL.orange : '#2b6a85'; ctx.fillRect(L.x + i * bw + 6, Y(v), bw - 12, L.y + L.h - Y(v)); text(ctx, money(v), L.x + i * bw + bw / 2, Y(v) - 5, { align: 'center', size: 10, color: on ? COL.orange : COL.ink }); text(ctx, t('freq' + i), L.x + i * bw + bw / 2, L.y + L.h + 14, { align: 'center', size: 10 }); });
  text(ctx, t('lblBarBase', { v: money(lo) }), L.x, L.y + L.h + 32, { size: 10 }); MS.forEach((m, i) => { const b = $('fq' + i); b.classList.toggle('active', i === S.m1); b.setAttribute('aria-pressed', i === S.m1 ? 'true' : 'false'); });
  const m = MS[S.m1], v = compoundAmt(PC, r, T, m); $('ro1').textContent = t('s1ro', { m: t('freq' + S.m1), r: S.r1, t: T, v: money(v), gain: f2((v - base)), limit: money(top) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), r = S.r2, L = { x: 40, y: 14, w: w - 56, h: h - 46 }, rmax = 24, ymax = 40, X = v => L.x + v / rmax * L.w, Y = v => L.y + L.h - v / ymax * L.h; axes(ctx, L);
  const pe = [], p7 = []; for (let q = 1.5; q <= rmax; q += 0.25) { pe.push([X(q), Y(doublingExact(q / 100))]); p7.push([X(q), Y(rule72(q))]); } curve(ctx, pe, COL.orange, 3); curve(ctx, p7, COL.cyan, 2, ); text(ctx, t('lblExact'), X(14), Y(doublingExact(0.14)) - 28, { size: 11, color: COL.orange }); text(ctx, t('lblRule'), X(14), Y(rule72(14)) - 10, { size: 11, color: COL.cyan });
  line(ctx, X(r), L.y, X(r), L.y + L.h, COL.ink, 1.5, [4, 3]); dot(ctx, X(r), Y(doublingExact(r / 100)), 6, COL.orange); dot(ctx, X(r), Y(rule72(r)), 5, COL.cyan);
  [0, 6, 12, 18, 24].forEach(v => text(ctx, v + '%', X(v), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 20, 40].forEach(v => text(ctx, v + '', L.x - 4, Y(v) + 3, { align: 'right', size: 10 })); text(ctx, t('axRate'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axDouble'), L.x + 4, L.y + 10, { size: 11 });
  const e = doublingExact(r / 100), a = rule72(r); $('ro2').textContent = t('s2ro', { r: r, e: f2(e), a: f2(a), err: f1(Math.abs(a - e) / e * 100), g: money(compoundAmt(PC, r / 100, e, 1)) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), r = S.r3 / 100, FV = 10000, T = 40, F = frame2(ctx, w, h, T, FV, [0, 10, 20, 30, 40]);
  const p = []; for (let t = 0; t <= T; t += 0.5) p.push([F.X(t), F.Y(presentValue(FV, r, t))]); curve(ctx, p, COL.orange, 3); line(ctx, F.L.x, F.Y(FV), F.L.x + F.L.w, F.Y(FV), COL.muted, 1, [4, 4]);
  line(ctx, F.X(S.t3), F.L.y, F.X(S.t3), F.L.y + F.L.h, COL.ink, 1.5, [4, 3]); dot(ctx, F.X(S.t3), F.Y(presentValue(FV, r, S.t3)), 6, COL.orange); text(ctx, t('axYears'), F.L.x + F.L.w, F.L.y + F.L.h + 28, { align: 'right', size: 11 });
  const pv = presentValue(FV, r, S.t3); $('ro3').textContent = t('s3ro', { fv: money(FV), t: S.t3, r: S.r3, pv: money(pv), back: money(compoundAmt(pv, r, S.t3, 1)) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), r = S.r4 / 100, C = S.C4, n = S.n4, L = { x: 52, y: 14, w: w - 66, h: h - 46 }, top = fvAnnuity(C, r, n) * 1.05 + 1, bw = L.w / n, Y = v => L.y + L.h - v / top * L.h; axes(ctx, L);
  for (let k = 1; k <= n; k++) { const dep = C * k, val = fvAnnuity(C, r, k), x = L.x + (k - 1) * bw; ctx.fillStyle = COL.cyan; ctx.fillRect(x + 0.5, Y(dep), Math.max(1, bw - 1), L.y + L.h - Y(dep)); ctx.fillStyle = COL.orange; ctx.fillRect(x + 0.5, Y(val), Math.max(1, bw - 1), Y(dep) - Y(val)); }
  [0, 0.5, 1].forEach(q => text(ctx, money(top * q), L.x - 4, Y(top * q) + 3, { align: 'right', size: 10 })); [1, Math.round(n / 2), n].forEach(k => text(ctx, k + '', L.x + (k - 0.5) * bw, L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axYears'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 });
  text(ctx, t('lblDeposits'), L.x + 6, L.y + 14, { size: 11, color: COL.cyan }); text(ctx, t('lblInterest'), L.x + 6, L.y + 28, { size: 11, color: COL.orange });
  const fv = fvAnnuity(C, r, n), dep = C * n; $('ro4').textContent = t('s4ro', { C: money(C), r: S.r4, n: n, fv: money(fv), dep: money(dep), int: money(fv - dep), share: f1((fv - dep) / fv * 100) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), r = S.r5 / 100, P = S.P5 * 1000, Y5 = S.y5, L = { x: 52, y: 14, w: w - 66, h: h - 46 }, X = m => L.x + m / (Y5 * 12) * L.w, Yv = v => L.y + L.h - v / P * L.h; axes(ctx, L);
  const pts = []; for (let m = 0; m <= Y5 * 12; m += Math.max(1, Math.round(Y5 * 12 / 120))) pts.push([X(m), Yv(loanBalance(P, r, Y5, m))]); pts.push([X(Y5 * 12), Yv(0)]); curve(ctx, pts, COL.orange, 3);
  const half = loanBalance(P, r, Y5, Y5 * 6); dot(ctx, X(Y5 * 6), Yv(half), 5, COL.cyan); text(ctx, t('lblHalfTime', { b: f1(half / P * 100) }), X(Y5 * 6) - 8, Yv(half) + 22, { size: 11, color: COL.cyan, align: 'right' });
  [0, 0.5, 1].forEach(q => text(ctx, money(P * q / 1000) + 'k', L.x - 4, Yv(P * q) + 3, { align: 'right', size: 10 })); [0, Y5 / 2, Y5].forEach(y => text(ctx, f1(y).replace('.0', ''), X(y * 12), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axYears'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 });
  const pay = loanPayment(P, r, Y5), tot = pay * Y5 * 12; $('ro5').textContent = t('s5ro', { P: money(P), r: S.r5, y: Y5, pay: money(pay), tot: money(tot), int: money(tot - P), half: f1(half / P * 100) });
}
function wire() {
  slider('r0', v => { S.r0 = v; render0(); }); slider('t0', v => { S.t0 = v; render0(); });
  slider('r1', v => { S.r1 = v; render1(); }); slider('t1', v => { S.t1 = v; render1(); }); MS.forEach((m, i) => $('fq' + i).addEventListener('click', () => { S.m1 = i; render1(); }));
  slider('r2', v => { S.r2 = v; render2(); }); slider('r3', v => { S.r3 = v; render3(); }); slider('t3', v => { S.t3 = v; render3(); });
  slider('C4', v => { S.C4 = v; render4(); }); slider('r4', v => { S.r4 = v; render4(); }); slider('n4', v => { S.n4 = v; render4(); });
  slider('P5', v => { S.P5 = v; render5(); }); slider('r5', v => { S.r5 = v; render5(); }); slider('y5', v => { S.y5 = v; render5(); });
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

if (typeof module !== 'undefined') module.exports = { simpleAmt, compoundAmt, doublingExact, rule72, presentValue, fvAnnuity, loanPayment, loanBalance, MS };
