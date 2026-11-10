'use strict';
// Chaos and the three-body problem (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Every curve, dot and readout comes from window.CHAOS_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks whose spacing is chosen from the measured label width.
(function () {

const $ = id => document.getElementById(id);
const M = window.CHAOS_MODEL;
const t = (...a) => window.CHAOS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', dot: '#9fb4cc', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = k => '10' + String(-k).split('').map(c => SUP[c]).join('');
// Readable size: plain decimals between 0.01 and 1000, otherwise a×10ⁿ.
function sci(v) {
  if (v === 0) return '0';
  if (Math.abs(v) >= 0.01 && Math.abs(v) < 1000) return fmt(v, Math.abs(v) < 1 ? 3 : 2);
  const e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
  return fix(m, 1) + '×10' + String(e).split('').map(c => SUP[c]).join('');
}

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function ticks(min, max, px, minPx) {
  const span = max - min; let step = span;
  if (!(px > 0) || !(span > 0)) return [];
  const e0 = Math.floor(Math.log10(span));
  outer: for (let e = e0 - 3; e <= e0 + 1; e++) for (const m of [1, 2, 5]) { const s = m * Math.pow(10, e); if (s / span * px >= minPx) { step = s; break outer; } }
  const out = []; for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
  return out;
}
// o: top, bottom, xMin, xMax, yMin, yMax, title, yTickList, xFmt, yFmt, left, right
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const yF = o.yFmt || (v => fmt(v)), xF = o.xFmt || (v => fmt(v));
  const yT = o.yTickList || ticks(o.yMin, o.yMax, o.bottom - o.top, 24);
  const left = o.left || (yT.length ? Math.max(...yT.map(v => ctx.measureText(yF(v)).width)) + 14 : 14);
  const P = { l: left, r: o.right || W - 14, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of yT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yF(v), P.l - 6, y(v) + 4);
  }
  const probe = [o.xMin, o.xMax, (o.xMin + o.xMax) / 2].map(v => ctx.measureText(xF(v)).width + 12);
  const xT = ticks(o.xMin, o.xMax, P.r - P.l, Math.max(28, ...probe, o.xMinStep ? o.xMinStep / (o.xMax - o.xMin) * (P.r - P.l) : 0));
  ctx.textAlign = 'center';
  for (const v of xT) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    const lab = xF(v), w = ctx.measureText(lab).width;
    ctx.fillText(lab, Math.min(Math.max(x(v), w / 2 + 2), W - w / 2 - 2), P.b + 16);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function path(ctx, pts, color, lw, dash, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5) { ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function clip(ctx, P) { ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); }
const lg = v => Math.log10(Math.max(v, 1e-300));
const LOGF = v => (v === 0 ? '1' : pow10(-v));   // log-axis tick label: 10ⁿ

/* ---------- frame loops ---------- */
const loops = {};
function loop(name, step, onStop) {
  stopLoop(name);
  let last = performance.now();
  const tick = now => { const dt = Math.min(64, now - last); last = now; if (step(dt) === false) { delete loops[name]; if (onStop) onStop(); return; } loops[name].id = requestAnimationFrame(tick); };
  loops[name] = { id: requestAnimationFrame(tick), onStop };
}
function stopLoop(name) { const l = loops[name]; if (!l) return; cancelAnimationFrame(l.id); delete loops[name]; if (l.onStop) l.onStop(); }
const running = name => !!loops[name];

/* ---------- step 0: two starts a hair apart ---------- */
const N0 = 60;
function draw0() {
  const r = num('r0'), k = num('k0'), d = Math.pow(10, -k);
  $('r0v').textContent = r.toFixed(2); $('k0v').textContent = String(k);
  const a = M.orbit(r, 0.4, N0), b = M.orbit(r, 0.4 + d, N0), n = M.splitAt(a, b);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: N0, yMin: 0, yMax: 1, yTickList: [0, 0.5, 1], title: t('c0a') });
  const pts = s => s.map((v, i) => [A.x(i), A.y(v)]);
  path(ctx, pts(a), C.cyan, 1.8); path(ctx, pts(b), C.orange, 1.4, [4, 3]);
  const B = panel(ctx, W, { top: 252, bottom: H - 28, xMin: 0, xMax: N0, yMin: -16, yMax: 0, yTickList: [-16, -12, -8, -4, 0], yFmt: LOGF, title: t('c0b') });
  path(ctx, [[B.P.l, B.y(-1)], [B.P.r, B.y(-1)]], C.pink, 1.4, [5, 4]);
  ctx.save(); clip(ctx, B.P);
  path(ctx, a.map((v, i) => [B.x(i), B.y(Math.max(-16.5, lg(Math.abs(v - b[i]))))]), C.text, 1.8);
  ctx.restore();
  if (n !== null) { path(ctx, [[A.x(n), A.P.t], [A.x(n), B.P.b]], C.pink, 1, [2, 4], 0.7); dot(ctx, B.x(n), B.y(Math.min(0, lg(Math.abs(a[n] - b[n])))), C.pink, 4.5); }
  $('out0').textContent = n !== null ? t('s0readout', { r: r.toFixed(2), d: pow10(k), n, g: fix(Math.pow(0.1 / d, 1 / n), 2) })
    : t('s0none', { r: r.toFixed(2), d: pow10(k), dd: sci(Math.abs(a[N0] - b[N0])) });
}

/* ---------- step 1: bifurcation diagram and λ(r) ---------- */
const R1 = { min: 2.8, max: 4, n: 480 };
let BIF = null;
function bif() {
  if (BIF) return BIF;
  BIF = { rs: [], vals: [], lam: [] };
  for (let i = 0; i <= R1.n; i++) { const r = R1.min + (R1.max - R1.min) * i / R1.n; BIF.rs.push(r); BIF.vals.push(M.longTerm(r, 0.4, 500, 128)); BIF.lam.push(M.lyapunov(r)); }
  return BIF;
}
function draw1() {
  const r = num('r1'), lam = M.lyapunov(r), D = bif();
  $('r1v').textContent = r.toFixed(3);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 30, bottom: 240, xMin: R1.min, xMax: R1.max, yMin: 0, yMax: 1, yTickList: [0, 0.5, 1], title: t('c1a') });
  ctx.fillStyle = 'rgba(159,180,204,0.55)';
  D.rs.forEach((rr, i) => { const X = A.x(rr); for (const v of D.vals[i]) ctx.fillRect(X - 0.6, A.y(v) - 0.6, 1.2, 1.2); });
  path(ctx, [[A.x(r), A.P.t], [A.x(r), A.P.b]], C.orange, 1.6);
  const B = panel(ctx, W, { top: 292, bottom: H - 28, xMin: R1.min, xMax: R1.max, yMin: -1.6, yMax: 0.8, yTickList: [-1.5, -1, -0.5, 0, 0.5], title: t('c1b') });
  ctx.save(); clip(ctx, B.P); path(ctx, D.rs.map((rr, i) => [B.x(rr), B.y(Math.max(-1.7, D.lam[i]))]), C.green, 1.4); ctx.restore();
  path(ctx, [[B.x(r), B.P.t], [B.x(r), B.P.b]], C.orange, 1.6);
  dot(ctx, B.x(r), B.y(Math.max(-1.6, lam)), C.orange, 5);
  if (lam > 0.001) {
    const a = M.orbit(r, 0.4, 400), b = M.orbit(r, 0.4 + 1e-10, 400), sim = M.splitAt(a, b);
    $('out1').textContent = t('s1chaos', { r: r.toFixed(3), lam: fix(lam, 3), mult: fix(Math.exp(lam), 2), pred: fix(Math.log(0.1 / 1e-10) / lam, 0), sim: sim === null ? '>400' : String(sim) });
  } else {
    const p = M.periodOf(r);
    $('out1').textContent = p ? t('s1reg', { r: r.toFixed(3), lam: fix(lam, 3), mult: fix(Math.exp(lam), 2), p }) : t('s1regNoP', { r: r.toFixed(3), lam: fix(lam, 3) });
  }
}

/* ---------- step 2: 64-bit vs 32-bit arithmetic ---------- */
const N2 = 80, EPS32 = Math.pow(2, -25);
function draw2() {
  const r = num('r2'), lam = M.lyapunov(r);
  $('r2v').textContent = r.toFixed(2);
  const a = M.orbit(r, 0.4, N2), b = M.orbit32(r, 0.4, N2), n = M.splitAt(a, b);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: N2, yMin: 0, yMax: 1, yTickList: [0, 0.5, 1], title: t('c2a') });
  path(ctx, a.map((v, i) => [A.x(i), A.y(v)]), C.cyan, 1.8); path(ctx, b.map((v, i) => [A.x(i), A.y(v)]), C.orange, 1.4, [4, 3]);
  const B = panel(ctx, W, { top: 252, bottom: H - 28, xMin: 0, xMax: N2, yMin: -12, yMax: 0, yTickList: [-12, -8, -4, 0], yFmt: LOGF, title: t('c2b') });
  ctx.save(); clip(ctx, B.P);
  path(ctx, a.map((v, i) => [B.x(i), B.y(Math.max(-12.5, lg(Math.abs(v - b[i]))))]), C.text, 1.8);
  if (lam > 0) path(ctx, [[B.x(0), B.y(lg(EPS32))], [B.x(N2), B.y(lg(EPS32) + N2 * lam / Math.LN10)]], C.green, 1.4, [5, 4]);
  ctx.restore();
  path(ctx, [[B.P.l, B.y(-1)], [B.P.r, B.y(-1)]], C.pink, 1, [2, 4], 0.7);
  if (n !== null && lam < 0.1) $('out2').textContent = t('s2trans', { r: r.toFixed(2), lam: fix(lam, 3), n });
  else if (n !== null) $('out2').textContent = t('s2readout', { r: r.toFixed(2), lam: fix(lam, 3), n, pred: fix(Math.log(0.1 / EPS32) / lam, 0) });
  else $('out2').textContent = t('s2none', { r: r.toFixed(2), lam: fix(lam, 3), dd: sci(Math.max(...a.map((v, i) => Math.abs(v - b[i])))) });
}

/* ---------- step 3: Lorenz twins ---------- */
const T3 = 50;
const s3 = { key: '', run: null, t: T3 };
function run3() {
  const rho = num('rho3'), k = num('k3'), key = rho + '|' + k;
  if (s3.key !== key) { s3.key = key; s3.run = M.lorenzTwin(rho, Math.pow(10, -k), T3); }
  return s3.run;
}
function draw3() {
  const rho = num('rho3'), k = num('k3'), R = run3(), ev = R.every, iNow = Math.min(R.A.length - 1, Math.round(s3.t / ev));
  $('rho3v').textContent = fmt(rho, 1); $('k3v').textContent = String(k);
  $('play3').textContent = t(running('s3') ? 'pause' : 'play');
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: 320, xMin: -26, xMax: 26, yMin: 0, yMax: 75, title: t('c3a') });
  ctx.save(); clip(ctx, A.P);
  path(ctx, R.A.slice(0, iNow + 1).map(s => [A.x(s[0]), A.y(s[2])]), C.cyan, 1.1, null, 0.85);
  path(ctx, R.B.slice(0, iNow + 1).map(s => [A.x(s[0]), A.y(s[2])]), C.orange, 1.1, null, 0.85);
  ctx.restore();
  dot(ctx, A.x(R.A[iNow][0]), A.y(R.A[iNow][2]), C.cyan, 5); dot(ctx, A.x(R.B[iNow][0]), A.y(R.B[iNow][2]), C.orange, 5);
  const B = panel(ctx, W, { top: 372, bottom: H - 28, xMin: 0, xMax: T3, yMin: -16, yMax: 2, yTickList: [-16, -12, -8, -4, 0], yFmt: LOGF, title: t('c3b') });
  const iSplit = R.sep.findIndex(v => v > 1);
  ctx.save(); clip(ctx, B.P);
  path(ctx, R.sep.slice(0, iNow + 1).map((v, i) => [B.x(i * ev), B.y(Math.max(-17, lg(v)))]), C.text, 1.6);
  if (rho > M.RHO_HOPF && iSplit > 0) { const ts = iSplit * ev, sl = M.LORENZ_LAMBDA / Math.LN10; path(ctx, [[B.x(0), B.y(-ts * sl)], [B.x(T3), B.y((T3 - ts) * sl)]], C.green, 1.3, [5, 4]); if (ts) path(ctx, [[B.x(ts), B.P.t], [B.x(ts), B.P.b]], C.pink, 1, [2, 4], 0.7); }
  ctx.restore();
  path(ctx, [[B.P.l, B.y(0)], [B.P.r, B.y(0)]], C.pink, 1, [5, 4], 0.8);
  const regime = M.lorenzRegime(rho), rk = { origin: 'rgOrigin', steady: 'rgSteady', mixed: 'rgMixed', chaos: 'rgChaos' }[regime];
  const split = iSplit >= 0 ? t('splitAt', { ts: fix(iSplit * ev, 2) }) : t('splitNone');
  $('out3').textContent = t('s3readout', { rho: fmt(rho, 1), regime: t(rk), t: fix(iNow * ev, 1), sep: sci(R.sep[iNow]), split });
}
function play3() {
  if (running('s3')) { stopLoop('s3'); draw3(); return; }
  if (s3.t >= T3) s3.t = 0;
  if (reduceMotion()) { s3.t = T3; draw3(); return; }
  loop('s3', dt => { s3.t = Math.min(T3, s3.t + dt / 1000 * (T3 / 14)); draw3(); return s3.t < T3; }, () => setTimeout(draw3, 0));
}

/* ---------- step 4: forecast horizon vs digits ---------- */
const s4 = { pts: new Map() };
const HCACHE = {};
const hor = k => (HCACHE[k] === undefined ? (HCACHE[k] = M.horizon(k)) : HCACHE[k]);
function draw4() {
  const k = num('k4'); $('k4v').textContent = String(k);
  s4.pts.set(k, hor(k));
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 1, xMax: 15, yMin: 0, yMax: 45, xMinStep: 1, title: t('c4a') });
  const pts = [...s4.pts.entries()].filter(p => p[1] !== null).sort((a, b) => a[0] - b[0]);
  let fit = null;
  if (pts.length >= 2) {
    fit = M.fitLine(pts);
    const th = Math.LN10 / M.LORENZ_LAMBDA, mx = pts.reduce((s, p) => s + p[0], 0) / pts.length, my = fit.icpt + fit.slope * mx;
    path(ctx, [[A.x(1), A.y(fit.icpt + fit.slope)], [A.x(15), A.y(fit.icpt + fit.slope * 15)]], C.text, 1.6);
    path(ctx, [[A.x(1), A.y(my + th * (1 - mx))], [A.x(15), A.y(my + th * (15 - mx))]], C.green, 1.4, [5, 4]);
  }
  pts.forEach(([kk, h]) => dot(ctx, A.x(kk), A.y(h), kk === k ? C.cyan : C.dot, kk === k ? 6.5 : 4.5));
  const h = hor(k);
  $('out4').textContent = fit ? t('s4readout', { k, h: fix(h, 2), n: pts.length, sl: fix(fit.slope, 2), th: fix(Math.LN10 / M.LORENZ_LAMBDA, 2) }) : t('s4one', { k, h: fix(h, 2) });
}

/* ---------- step 5: three stars ---------- */
const T5 = 60;
const s5 = { key: '', a: null, b: null, gap: null, t: T5 };
function run5() {
  const e = num('e5'), key = e.toFixed(2);
  if (s5.key !== key) { s5.key = key; s5.a = M.threeBody(e, T5); s5.b = M.threeBody(e + M.TWIN, T5); s5.gap = M.gap(s5.a, s5.b); }
}
function draw5() {
  run5();
  const e = num('e5'), ev = s5.a.every, iNow = Math.min(s5.a.out.length - 1, Math.round(s5.t / ev));
  $('e5v').textContent = e.toFixed(2);
  $('play5').textContent = t(running('s5') ? 'pause' : 'play');
  const { ctx, W, H } = fitCanvas($('c5'));
  const side = Math.min(W - 40, 360), ox = (W - side) / 2;
  title(ctx, t('c5a'), 8, 20, W - 16);
  const A = { x: v => ox + (v + 2) / 4 * side, y: v => 30 + side / 2 - v / 4 * side, P: { l: ox, r: ox + side, t: 30, b: 30 + side } };
  ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(ox, 30, side, side);
  ctx.beginPath(); ctx.moveTo(A.x(0), 30); ctx.lineTo(A.x(0), 30 + side); ctx.moveTo(ox, A.y(0)); ctx.lineTo(ox + side, A.y(0)); ctx.stroke();
  clip(ctx, A.P);
  const COL = [C.cyan, C.orange, C.green], from = 0;
  for (let s = 0; s < 3; s++) {
    path(ctx, s5.b.out.slice(from, iNow + 1).map(y => [A.x(y[2 * s]), A.y(y[2 * s + 1])]), C.ghost, 1, [3, 4], 0.8);
    path(ctx, s5.a.out.slice(from, iNow + 1).map(y => [A.x(y[2 * s]), A.y(y[2 * s + 1])]), COL[s], 1.3, null, 0.8);
  }
  ctx.restore();
  const yNow = s5.a.out[iNow];
  let rmax = 0, rmin = Infinity;
  for (let i = 0; i <= iNow; i++) { const y = s5.a.out[i]; for (let s = 0; s < 3; s++) rmax = Math.max(rmax, Math.hypot(y[2 * s], y[2 * s + 1])); rmin = Math.min(rmin, M.accel(y).rmin); }
  for (let s = 0; s < 3; s++) if (Math.abs(yNow[2 * s]) < 2 && Math.abs(yNow[2 * s + 1]) < 2) dot(ctx, A.x(yNow[2 * s]), A.y(yNow[2 * s + 1]), COL[s], 6);
  const B = panel(ctx, W, { top: side + 82, bottom: H - 28, xMin: 0, xMax: T5, yMin: -10, yMax: 1, yTickList: [-10, -8, -6, -4, -2, 0], yFmt: LOGF, title: t('c5b') });
  ctx.save(); clip(ctx, B.P);
  path(ctx, s5.gap.slice(0, iNow + 1).map((v, i) => [B.x(i * ev), B.y(Math.max(-10.5, lg(v)))]), C.text, 1.5);
  ctx.restore();
  path(ctx, [[B.P.l, B.y(-1)], [B.P.r, B.y(-1)]], C.pink, 1, [5, 4], 0.8);
  const iGap = s5.gap.findIndex(v => v > 0.1);
  const split = iGap >= 0 && iGap <= iNow ? t('gapAt', { ts: fix(iGap * ev, 1) }) : iNow === s5.gap.length - 1 ? t('gapNone') : '';
  const off = [0, 1, 2].some(s => Math.abs(yNow[2 * s]) > 2 || Math.abs(yNow[2 * s + 1]) > 2) ? t('off') : '';
  $('out5').textContent = t('s5readout', { e: e.toFixed(2), t: fix(iNow * ev, 1), rmax: fix(rmax, 2), rmin: fix(rmin, 3), gap: sci(s5.gap[iNow]), split, drift: sci(s5.a.drift), off }).replace(/\s+$/, '');
}
function play5() {
  if (running('s5')) { stopLoop('s5'); draw5(); return; }
  if (s5.t >= T5) s5.t = 0;
  if (reduceMotion()) { s5.t = T5; draw5(); return; }
  loop('s5', dt => { s5.t = Math.min(T5, s5.t + dt / 1000 * (T5 / 20)); draw5(); return s5.t < T5; }, () => setTimeout(draw5, 0));
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['r0', 'k0'].forEach(id => $(id).addEventListener('input', draw0));
  $('r1').addEventListener('input', draw1);
  $('r2').addEventListener('input', draw2);
  ['rho3', 'k3'].forEach(id => $(id).addEventListener('input', () => { stopLoop('s3'); s3.t = T3; draw3(); }));
  $('play3').addEventListener('click', play3);
  $('end3').addEventListener('click', () => { stopLoop('s3'); s3.t = T3; draw3(); });
  $('k4').addEventListener('input', draw4);
  $('all4').addEventListener('click', () => { for (let k = 2; k <= 14; k++) s4.pts.set(k, hor(k)); draw4(); });
  $('clear4').addEventListener('click', () => { s4.pts.clear(); draw4(); });
  $('e5').addEventListener('input', () => { stopLoop('s5'); s5.t = T5; draw5(); });
  $('play5').addEventListener('click', play5);
  $('end5').addEventListener('click', () => { stopLoop('s5'); s5.t = T5; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) Object.keys(loops).forEach(stopLoop); });
  window.refreshChaos = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
