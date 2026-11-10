'use strict';
// Monte Carlo lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, band and readout comes from window.MC_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MC_MODEL;
const t = (...a) => window.MC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa', gap: '#2a3546' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.indexOf('.') < 0 ? s : s.replace(/0+$/, '').replace(/\.$/, ''); };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title: shrinks the font until it fits (never overflows).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function ticks(lo, hi, px, minPx = 24) {
  const s = niceStep(hi - lo, px, minPx, [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50]);
  const out = []; for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9; v += s) out.push(Math.round(v / s) * s);
  return out;
}
// A plot panel; o: top, bottom, xMin, xMax, yMin, yMax, yTicks, xTicks, xSteps, minPx, title, left, right, xDigits, logX
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const lx = v => Math.log10(v);
  const x = o.logX ? v => P.l + (lx(v) - lx(o.xMin)) / (lx(o.xMax) - lx(o.xMin)) * (P.r - P.l) : v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yT = o.yTicks || ticks(o.yMin, o.yMax, P.b - P.t, 22);
  for (const v of yT) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    let list;
    if (o.logX) list = o.xList;
    else { const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 28, o.xSteps || [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 40]); list = []; for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) list.push(v); }
    ctx.textAlign = 'center';
    for (const v of list) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clip(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function poly(ctx, pts, color, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
}
function band(ctx, m, ks, lo, hi, color = 'rgba(103,215,249,0.18)') {
  if (!ks.length) return;
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  ks.forEach((k, i) => (i ? ctx.lineTo(m.x(k), m.y(hi[i])) : ctx.moveTo(m.x(k), m.y(hi[i]))));
  for (let i = ks.length - 1; i >= 0; i--) ctx.lineTo(m.x(ks[i]), m.y(lo[i]));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 4) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], alpha = 0.8) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hline(ctx, m, v, color, dash = [5, 4]) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); }

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

const L10 = Math.log10;
// Tick labels for a panel whose y values are log10 of the data.
function logYTicks(ctx, m, vals) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  vals.forEach(v => { const Y = m.y(L10(v)); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(m.P.l, Y); ctx.lineTo(m.P.r, Y); ctx.stroke(); ctx.fillText(String(v), m.P.l - 6, Y + 4); });
  ctx.restore();
}
function square(ctx, W, H, ttl) {
  const side = Math.max(120, Math.min(W - 52, H - 52));
  const left = Math.max(38, Math.round((W - side) / 2));
  return panel(ctx, W, { top: 26, bottom: 26 + side, left, right: W - left - side, xMin: 0, xMax: 1, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.5], title: ttl });
}
function arc(ctx, m) {
  const pts = []; for (let i = 0; i <= 90; i++) { const a = i / 90 * Math.PI / 2; pts.push([m.x(Math.cos(a)), m.y(Math.sin(a))]); }
  poly(ctx, pts, C.text, 1.6);
}
// Indices to draw for a long running estimate (all early, sparser later).
function sampleIdx(n) { const out = []; for (let i = 1; i <= n; i += Math.max(1, Math.floor(i / 150))) out.push(i); if (out[out.length - 1] !== n) out.push(n); return out; }

/* ---------- step 0: scatter ---------- */
const NMAX0 = 10000;
const s0 = { n: 100, seed: 1, data: null };
function data0() { if (!s0.data || s0.data.seed !== s0.seed) s0.data = { seed: s0.seed, ...M.scatter(s0.seed, NMAX0) }; return s0.data; }
function draw0() {
  const D = data0(), n = s0.n;
  let { ctx, W, H } = fitCanvas($('c0'));
  const A = square(ctx, W, H, t('c0a'));
  ctx.save();
  for (let i = 0; i < n; i++) { const [x, y, hit] = D.pts[i]; ctx.fillStyle = hit ? C.cyan : C.orange; ctx.fillRect(A.x(x) - 1, A.y(y) - 1, n > 3000 ? 1.6 : 2.4, n > 3000 ? 1.6 : 2.4); }
  ctx.restore();
  arc(ctx, A);
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 1, xMax: NMAX0, yMin: 2.5, yMax: 3.8, yTicks: [2.6, 3, 3.4, 3.8], logX: true, xTicks: true, xList: [1, 10, 100, 1000, 10000], title: t('c0b'), right: 24 });
  clip(ctx, B);
  const ks = sampleIdx(NMAX0); band(ctx, B, ks, ks.map(k => Math.PI - 2 * M.seTheory(k)), ks.map(k => Math.PI + 2 * M.seTheory(k)), 'rgba(103,215,249,0.12)');
  hline(ctx, B, Math.PI, C.text);
  if (n) { const idx = sampleIdx(n); poly(ctx, idx.map(i => [B.x(i), B.y(D.est[i - 1])]), C.orange, 1.8); dot(ctx, B.x(n), B.y(D.est[n - 1]), C.orange, 4.5); }
  ctx.restore();
  if (!n) { $('r0').textContent = t('s0none'); return; }
  let k = 0; for (let i = 0; i < n; i++) if (D.pts[i][2]) k++;
  $('r0').textContent = t('s0readout', { n, k, r: (k / n).toFixed(4), est: (4 * k / n).toFixed(4), err: (4 * k / n - Math.PI).toFixed(4) });
}

/* ---------- step 1: spread of repeated estimates ---------- */
const s1 = { seen: new Set([0]), cache: {}, last: null, prev: null };
function rep1(i) { const N = M.NS[i]; if (!s1.cache[N]) s1.cache[N] = M.replicate(N); return s1.cache[N]; }
function draw1() {
  const i = num('N1'), N = M.NS[i], R = rep1(i), se = R.se;
  $('N1v').textContent = String(N);
  let { ctx, W, H } = fitCanvas($('c1'));
  const lo = Math.PI - 0.6, hi = Math.PI + 0.6, q = 4 / N, bw = q * Math.max(1, Math.round(se / 2.5 / q));
  const e0 = (Math.floor(lo / q) - 0.5) * q, nb = Math.ceil((hi - e0) / bw), cnt = new Array(nb).fill(0);
  R.ests.forEach(v => { const b = Math.floor((v - e0) / bw); if (b >= 0 && b < nb) cnt[b]++; });
  const dens = cnt.map(c => c / (R.ests.length * bw)), peak = 1 / (se * Math.sqrt(2 * Math.PI));
  const yMax = Math.max(peak, ...dens) * 1.12;
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: lo, xMax: hi, yMin: 0, yMax, yTicks: [0], xTicks: true, xSteps: [0.2, 0.4], title: t('c1a'), left: 14 });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.75)';
  dens.forEach((d, b) => { if (!d) return; const x0 = A.x(Math.max(lo, e0 + b * bw)), x1 = A.x(Math.min(hi, e0 + (b + 1) * bw)); if (x1 > x0) ctx.fillRect(x0, A.y(d), Math.max(1, x1 - x0 - 0.5), A.y(0) - A.y(d)); });
  ctx.restore();
  const curve = []; for (let j = 0; j <= 300; j++) { const x = lo + (hi - lo) * j / 300; curve.push([A.x(x), A.y(Math.exp(-0.5 * ((x - Math.PI) / se) ** 2) / (se * Math.sqrt(2 * Math.PI)))]); }
  clip(ctx, A); poly(ctx, curve, C.orange, 2); ctx.restore();
  vline(ctx, A.x(Math.PI), A.P.t, A.P.b, C.text, [4, 4], 0.7);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 50, xMax: 12800, yMin: L10(0.01), yMax: L10(0.3), yTicks: [], logX: true, xTicks: true, xList: M.NS, minPx: 30, title: t('c1b'), left: 42, right: 20 });
  logYTicks(ctx, B, [0.01, 0.03, 0.1, 0.3]);
  poly(ctx, [50, 12800].map(n => [B.x(n), B.y(L10(M.seTheory(n)))]), C.ghost, 1.5, [5, 4]);
  [...s1.seen].forEach(j => { const r = rep1(j); dot(ctx, B.x(M.NS[j]), B.y(L10(r.sd)), j === i ? C.cyan : C.text, j === i ? 6 : 4); });
  let prev = '';
  if (s1.prev !== null && s1.prev !== i) { const p = rep1(s1.prev); prev = t('s1prev', { pN: M.NS[s1.prev], ratio: (R.sd / p.sd).toFixed(2) }); }
  $('r1').textContent = t('s1readout', { N, sd: R.sd.toFixed(4), se: se.toFixed(4), w: (100 * R.within).toFixed(1), prev });
}

/* ---------- step 2: integrals ---------- */
const s2 = { f: 'gauss', seed: 1, cache: {}, reps: {}, ex: {} };
function run2() { const key = s2.f + ':' + s2.seed; if (!s2.cache[key]) s2.cache[key] = M.integrate(s2.f, s2.seed, 2000); return s2.cache[key]; }
function draw2() {
  const N = num('N2'), R = run2(), F = M.FUNCS[s2.f];
  if (!s2.ex[s2.f]) { s2.ex[s2.f] = M.exact(s2.f); s2.reps[s2.f] = M.integrateReps(s2.f, 400); }
  const E = s2.ex[s2.f], RP = s2.reps[s2.f];
  $('N2v').textContent = String(N);
  $('fGauss').setAttribute('aria-pressed', String(s2.f === 'gauss')); $('fCircle').setAttribute('aria-pressed', String(s2.f === 'circle'));
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.25, 0.5], title: t('c2a') });
  ctx.save();
  for (let i = 0; i < N; i++) { const p = R.pts[i]; ctx.fillStyle = p.hit ? C.green : C.raw; ctx.fillRect(A.x(p.x) - 1.2, A.y(p.y) - 1.2, 2.4, 2.4); }
  ctx.restore();
  const cv = []; for (let j = 0; j <= 200; j++) { const x = j / 200; cv.push([A.x(x), A.y(F.f(x))]); }
  poly(ctx, cv, C.text, 2.2);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: N, yMin: E.I - 0.25, yMax: E.I + 0.25, yTicks: [Math.round((E.I - 0.2) * 10) / 10, Math.round(E.I * 10) / 10, Math.round((E.I + 0.2) * 10) / 10], xTicks: true, xSteps: [5, 10, 25, 50, 100, 250, 500, 1000], minPx: 34, title: t('c2b'), left: 40 });
  clip(ctx, B);
  hline(ctx, B, E.I, C.text);
  const idx = []; for (let i = 1; i <= N; i += Math.max(1, Math.floor(N / 400))) idx.push(i); if (idx[idx.length - 1] !== N) idx.push(N);
  poly(ctx, idx.map(i => [B.x(i), B.y(R.hitEst[i - 1])]), C.orange, 1.6);
  poly(ctx, idx.map(i => [B.x(i), B.y(R.meanEst[i - 1])]), C.cyan, 2);
  ctx.restore();
  const h = R.hitEst[N - 1], m = R.meanEst[N - 1];
  $('r2').textContent = t('s2readout', { I: E.I.toFixed(4), N, h: h.toFixed(4), eh: (h - E.I).toFixed(4), m: m.toFixed(4), em: (m - E.I).toFixed(4), sh: E.sdHit.toFixed(3), sm: E.sdMean.toFixed(3), x: ((E.sdHit / E.sdMean) ** 2).toFixed(1), rh: RP.sdHit.toFixed(4), rm: RP.sdMean.toFixed(4) });
}

/* ---------- step 3: high dimensions ---------- */
const TABLE3 = M.dimTable();
function draw3() {
  const d = num('d3'), row = TABLE3.find(r => r.d === d);
  $('d3v').textContent = String(d);
  const { ctx, W, H } = fitCanvas($('c3'));
  const cl = v => Math.max(1e-3, Math.min(1.5, v));
  const A = panel(ctx, W, { top: 26, bottom: 236, xMin: 1.6, xMax: 10.4, yMin: L10(1e-3), yMax: L10(1.5), yTicks: [], xTicks: true, xSteps: [1, 2], title: t('c3a'), left: 46 });
  logYTicks(ctx, A, [0.001, 0.01, 0.1, 1]);
  poly(ctx, TABLE3.map(r => [A.x(r.d), A.y(L10(cl(r.mc.relSe)))]), C.text, 1.5, [5, 4]);
  poly(ctx, TABLE3.map(r => [A.x(r.d), A.y(L10(cl(r.gridRel)))]), C.orange, 2);
  TABLE3.forEach(r => { dot(ctx, A.x(r.d), A.y(L10(cl(r.gridRel))), C.orange, 3.5); dot(ctx, A.x(r.d), A.y(L10(cl(r.mcRel))), C.cyan, 4.5); });
  const B = panel(ctx, W, { top: 292, bottom: H - 26, xMin: 1.6, xMax: 10.4, yMin: L10(1e-3), yMax: L10(1), yTicks: [], xTicks: true, xSteps: [1, 2], title: t('c3b'), left: 46 });
  logYTicks(ctx, B, [0.001, 0.01, 0.1, 1]);
  poly(ctx, TABLE3.map(r => [B.x(r.d), B.y(L10(r.p))]), C.green, 2);
  TABLE3.forEach(r => dot(ctx, B.x(r.d), B.y(L10(r.p)), C.green, 3));
  vline(ctx, A.x(d), A.P.t, B.P.b, C.text, [3, 3], 0.6);
  const pf = v => (v < 0.01 ? v.toExponential(2) : v.toFixed(4));
  $('r3').textContent = t('s3readout', { d, p: pf(row.p), m: row.grid.m, used: row.grid.used, g: pf(row.grid.frac), ge: (100 * row.gridRel).toFixed(1) + '%', r: pf(row.mc.frac), re: (100 * row.mcRel).toFixed(1) + '%', rs: (100 * row.mc.relSe).toFixed(1) + '%' });
}

/* ---------- step 4: stratified sampling ---------- */
const ROWS4 = M.KS.map(k => M.stratReps(k));
const SLOPES4 = { plain: M.slope(ROWS4, 'sdPlain'), strat: M.slope(ROWS4, 'sdStrat') };
function draw4() {
  const i = num('k4'), k = M.KS[i], row = ROWS4[i], pts = M.jitter(k, M.mulberry(31 + k));
  $('k4v').textContent = String(k);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = square(ctx, W, H, t('c4a'));
  if (k <= 16) { ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; for (let j = 1; j < k; j++) { ctx.beginPath(); ctx.moveTo(A.x(j / k), A.y(0)); ctx.lineTo(A.x(j / k), A.y(1)); ctx.moveTo(A.x(0), A.y(j / k)); ctx.lineTo(A.x(1), A.y(j / k)); ctx.stroke(); } ctx.restore(); }
  ctx.save(); const sz = k >= 64 ? 1.4 : 2.6;
  pts.forEach(([x, y]) => { ctx.fillStyle = x * x + y * y <= 1 ? C.cyan : C.orange; ctx.fillRect(A.x(x) - sz / 2, A.y(y) - sz / 2, sz, sz); });
  ctx.restore();
  arc(ctx, A);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 10, xMax: 6500, yMin: L10(0.002), yMax: L10(0.6), yTicks: [], logX: true, xTicks: true, xList: [16, 256, 4096], title: t('c4b'), left: 46, right: 20 });
  logYTicks(ctx, B, [0.003, 0.01, 0.03, 0.1, 0.3]);
  poly(ctx, [10, 6500].map(n => [B.x(n), B.y(L10(M.seTheory(n)))]), C.ghost, 1.5, [5, 4]);
  poly(ctx, ROWS4.map(r => [B.x(r.N), B.y(L10(r.sdStrat))]), C.cyan, 1.6);
  ROWS4.forEach((r, j) => { dot(ctx, B.x(r.N), B.y(L10(r.sdPlain)), C.text, j === i ? 6 : 4); dot(ctx, B.x(r.N), B.y(L10(r.sdStrat)), C.cyan, j === i ? 6 : 4); });
  vline(ctx, B.x(row.N), B.P.t, B.P.b, C.text, [3, 3], 0.5);
  $('r4').textContent = t('s4readout', { k, N: row.N, sp: row.sdPlain.toFixed(4), ss: row.sdStrat.toFixed(4), ratio: (row.sdStrat / row.sdPlain).toFixed(2), a: SLOPES4.plain.toFixed(2), b: SLOPES4.strat.toFixed(2) });
}

/* ---------- step 5: random-number generators ---------- */
const s5 = { kind: 'bad' };
function draw5() {
  const seed = num('seed5'), kind = s5.kind, pr = M.pairs(kind, seed, 2000);
  $('seed5v').textContent = String(seed);
  $('genGood').setAttribute('aria-pressed', String(kind === 'good')); $('genBad').setAttribute('aria-pressed', String(kind === 'bad'));
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = square(ctx, W, H, t('c5a'));
  ctx.save(); ctx.fillStyle = kind === 'good' ? C.cyan : C.orange;
  pr.forEach(([x, y]) => ctx.fillRect(A.x(x) - 1.2, A.y(y) - 1.2, 2.4, 2.4));
  ctx.restore();
  const G = M.scatter(seed, 10000, 'good'), Bd = M.scatter(seed, 10000, 'bad');
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 1, xMax: 10000, yMin: 2.6, yMax: 3.7, yTicks: [2.8, 3, 3.2, 3.4, 3.6], logX: true, xTicks: true, xList: [1, 10, 100, 1000, 10000], title: t('c5b'), right: 24 });
  clip(ctx, B); hline(ctx, B, Math.PI, C.text);
  const idx = sampleIdx(10000);
  poly(ctx, idx.map(i => [B.x(i), B.y(G.est[i - 1])]), C.cyan, 1.8);
  poly(ctx, idx.map(i => [B.x(i), B.y(Bd.est[i - 1])]), C.orange, 1.8);
  ctx.restore();
  const eg = G.est[9999], eb = Bd.est[9999];
  $('r5').textContent = t('s5readout', { name: t(kind === 'good' ? 'genGood' : 'genBad'), seed, first: M.firstNumbers(kind, seed).map(v => v.toFixed(4)).join(', '), dg: M.distinctPairs('good', seed, 5000), db: M.distinctPairs('bad', seed, 5000), eg: eg.toFixed(4), erg: (eg - Math.PI).toFixed(4), eb: eb.toFixed(4), erb: (eb - Math.PI).toFixed(4) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  const add = k => { stopAnim('s0'); s0.n = Math.min(NMAX0, s0.n + k); draw0(); };
  $('add1').addEventListener('click', () => add(1));
  $('add100').addEventListener('click', () => add(100));
  $('add1000').addEventListener('click', () => add(1000));
  $('play0').addEventListener('click', () => {
    if (s0.n >= NMAX0) s0.n = 0;
    const n0 = s0.n;
    // geometric pacing: equal time per factor of 10, so the early swings stay visible
    animate('s0', 6000, p => { s0.n = Math.round(Math.max(n0, 1) * Math.pow(NMAX0 / Math.max(n0, 1), p)); draw0(); });
  });
  $('reset0').addEventListener('click', () => { stopAnim('s0'); s0.n = 0; draw0(); });
  $('reroll0').addEventListener('click', () => { stopAnim('s0'); s0.seed = s0.seed % 20 + 1; draw0(); });

  $('N1').addEventListener('input', () => { const i = num('N1'); if (s1.last !== i) { s1.prev = s1.last; s1.last = i; } s1.seen.add(i); draw1(); });
  s1.last = num('N1');

  $('N2').addEventListener('input', draw2);
  $('fGauss').addEventListener('click', () => { s2.f = 'gauss'; draw2(); });
  $('fCircle').addEventListener('click', () => { s2.f = 'circle'; draw2(); });
  $('reroll2').addEventListener('click', () => { s2.seed = s2.seed % 20 + 1; draw2(); });

  $('d3').addEventListener('input', draw3);
  $('k4').addEventListener('input', draw4);
  $('seed5').addEventListener('input', draw5);
  $('genGood').addEventListener('click', () => { s5.kind = 'good'; draw5(); });
  $('genBad').addEventListener('click', () => { s5.kind = 'bad'; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshMonteCarlo = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
