'use strict';
// Blackbody radiation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, colour and readout comes from window.BB_MODEL (model.js). Canvas text is limited to panel
// titles (own row, shrunk to fit) and axis tick labels (skipped when they would touch); legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BB_MODEL;
const t = (...a) => window.BB_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', dim: '#4f6a86', ir: '#5a2f3a', uv: '#3a2f66' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = e => '10' + String(e).split('').map(ch => SUP[ch]).join('');

/* ---------- number formatting ---------- */
function sig(v, n = 3) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e6 || a < 1e-3) { const e = Math.floor(Math.log10(a)); const m = v / Math.pow(10, e); return Number(m.toPrecision(n)) + ' × ' + pow10(e); }
  const s = Number(v.toPrecision(n));
  return a >= 1000 ? s.toLocaleString('en-US') : String(s);
}
const fmtLam = m => (m < 1e-6 ? sig(m * 1e9, 3) + ' nm' : sig(m * 1e6, 3) + ' μm');
function fmtPow(w) { // W per m²
  const u = [[1e9, 'GW'], [1e6, 'MW'], [1e3, 'kW'], [1, 'W'], [1e-3, 'mW'], [1e-6, 'μW'], [1e-9, 'nW']];
  for (const [f, s] of u) if (w >= f) return Number((w / f).toPrecision(3)) + ' ' + s;
  return sig(w, 3) + ' W';
}
const fmtPowArea = w => fmtPow(w) + '/m²';
const pct = f => { const p = f * 100; return (p >= 1 ? p.toFixed(1) : p >= 0.01 ? p.toPrecision(2) : sig(p, 2)) + '%'; };
const KW_NM = 1e12; // W/m³ → kW/(m²·nm)
const lamFromIdx = i => 1e-7 * Math.pow(10, i / 100); // slider 0..300 → 0.1 μm … 100 μm

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}

// A plot panel with linear or log axes. Ticks: arrays of [value, label]. Labels that would touch are skipped.
// o: top, bottom, right, x:{min,max,log}, y:{min,max,log}, xt, yt, title
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const left = o.left || Math.ceil(Math.max(...o.yt.map(([, l]) => ctx.measureText(l).width), 10)) + 12;
  const P = { l: left, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const tx = (a, v) => (a.log ? Math.log10(v) : v), span = a => tx(a, a.max) - tx(a, a.min);
  const x = v => P.l + (tx(o.x, Math.max(v, o.x.log ? 1e-300 : -Infinity)) - tx(o.x, o.x.min)) / span(o.x) * (P.r - P.l);
  const y = v => P.b - (tx(o.y, o.y.log ? Math.max(v, 1e-300) : v) - tx(o.y, o.y.min)) / span(o.y) * (P.b - P.t);
  ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  let lastY = Infinity;
  for (const [v, l] of o.yt) {
    const Y = y(v); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y); ctx.lineTo(P.r, Y); ctx.stroke();
    if (Math.abs(lastY - Y) < 13) continue;
    ctx.textAlign = 'right'; ctx.fillText(l, P.l - 6, Y + 4); lastY = Y;
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  let lastR = -Infinity;
  for (const [v, l] of o.xt) {
    const X = x(v); if (X < P.l - 1 || X > P.r + 1) continue;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b + 4); ctx.stroke();
    const w = ctx.measureText(l).width; let x0 = X - w / 2; if (x0 < 2) x0 = 2; if (x0 + w > W - 2) x0 = W - 2 - w;
    if (x0 < lastR + 8) continue;
    ctx.textAlign = 'left'; ctx.fillText(l, x0, P.b + 16); lastR = x0 + w;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clipTo(ctx, P) { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 2, P.r - P.l, P.b - P.t + 2); ctx.clip(); }
function curve(ctx, m, xs, f, color, { lw = 2, dash = null, alpha = 1 } = {}) {
  clipTo(ctx, m.P); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); let started = false;
  for (const v of xs) { const Y = m.y(f(v)); if (!isFinite(Y)) { started = false; continue; } const X = m.x(v); if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 4.5, ring = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function vline(ctx, X, y0, y1, color, dash = [5, 4], lw = 1.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;
const logspace = (a, b, n) => Array.from({ length: n }, (_, i) => a * Math.pow(b / a, i / (n - 1)));
const linspace = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
function niceTicks(max, target = 5) {
  const raw = max / target, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, step = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
  const out = []; for (let v = 0; v <= max + 1e-12; v += step) out.push([v, String(Number(v.toPrecision(6)))]); return out;
}
// Fill under a spectrum column by column: visible wavelengths in their own colour, the rest in a dim tone.
const LINECOL = {}; for (let nm = 380; nm <= 750; nm++) LINECOL[nm] = rgb(M.lineColor(nm));
function fillSpectrum(ctx, m, lamOf, f, otherIr, otherUv, alphaOther = 1) {
  clipTo(ctx, m.P);
  const y0 = m.P.b;
  for (let X = Math.floor(m.P.l); X <= m.P.r; X++) {
    const lam = lamOf(X); const v = f(lam); if (!(v > 0)) continue; const Y = Math.max(m.P.t, m.y(v));
    const nm = Math.round(lam * 1e9);
    ctx.globalAlpha = nm >= 380 && nm <= 750 ? 0.95 : alphaOther;
    ctx.fillStyle = nm >= 380 && nm <= 750 ? LINECOL[nm] : nm > 750 ? otherIr : otherUv;
    ctx.fillRect(X, Y, 1.05, y0 - Y);
  }
  ctx.restore();
}
const umTicks = [[1e-7, '0.1 μm'], [1e-6, '1 μm'], [1e-5, '10 μm'], [1e-4, '100 μm']];

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: colour and peak ---------- */
const STRIP = { T0: 500, T1: 10000, cols: null };
function stripCols() { if (!STRIP.cols) STRIP.cols = linspace(STRIP.T0, STRIP.T1, 120).map(T => rgb(M.colorOf(T).rgb)); return STRIP.cols; }
let heating = null;
function draw0() {
  const T = num('T0'); $('T0v').textContent = T + ' K';
  const { ctx, W, H } = fitCanvas($('c0'));
  const col = M.colorOf(T).rgb;
  title(ctx, t('c0a'), 8, 17, W - 16);
  // swatch: a glowing disc in the computed colour
  const cx = 52, cy = 72, R = 34;
  const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R + 14);
  g.addColorStop(0, rgb(col)); g.addColorStop(0.7, rgb(col)); g.addColorStop(1, 'rgba(13,22,33,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R + 14, 0, 7); ctx.fill();
  // colour strip 500–10000 K
  const sx0 = 112, sx1 = W - 16, sy = 52, sh = 26, cols = stripCols();
  for (let i = 0; i < cols.length; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(sx0 + (sx1 - sx0) * i / cols.length, sy, (sx1 - sx0) / cols.length + 1, sh); }
  const sX = T => sx0 + (T - STRIP.T0) / (STRIP.T1 - STRIP.T0) * (sx1 - sx0);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; let lastR = -Infinity;
  for (const v of [500, 2000, 4000, 6000, 8000, 10000]) {
    const l = v + ' K', w = ctx.measureText(l).width; let x0 = sX(v) - w / 2; if (x0 + w > W - 2) x0 = W - 2 - w; if (x0 < lastR + 8) continue;
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(sX(v), sy + sh); ctx.lineTo(sX(v), sy + sh + 4); ctx.stroke();
    ctx.fillText(l, x0, sy + sh + 17); lastR = x0 + w;
  }
  ctx.restore();
  ctx.save(); ctx.fillStyle = C.text; ctx.beginPath(); const mx = sX(T); ctx.moveTo(mx, sy - 2); ctx.lineTo(mx - 6, sy - 11); ctx.lineTo(mx + 6, sy - 11); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(mx - 1.5, sy, 3, sh); ctx.restore();
  // spectrum on a log wavelength axis, normalised to its peak
  const m = panel(ctx, W, { top: 160, bottom: H - 28, x: { min: 1e-7, max: 1e-4, log: true }, y: { min: 0, max: 1.08 }, xt: umTicks, yt: [[0, '0'], [0.5, '0.5'], [1, '1']], title: t('c0b') });
  const pk = M.peakValue(T), lamOf = X => Math.pow(10, -7 + (X - m.P.l) / (m.P.r - m.P.l) * 3);
  fillSpectrum(ctx, m, lamOf, lam => M.planck(lam, T) / pk, C.ir, C.uv);
  curve(ctx, m, logspace(1e-7, 1e-4, 400), lam => M.planck(lam, T) / pk, C.text, { lw: 1.6 });
  vline(ctx, m.x(M.wienPeak(T)), m.P.t, m.P.b, C.text);
  const peak = M.wienPeak(T), where = peak < M.VIS[0] ? t('whereUv') : peak > M.VIS[1] ? t('whereIr') : t('whereVis');
  const text = t('s0readout', { T, C: Math.round(T - 273.15), peak: fmtLam(peak), where, share: pct(M.visibleShare(T)), vis: fmtPowArea(M.visiblePower(T)) });
  $('r0').textContent = heating !== null ? t('heatProgress', { T }) + ' ' + text : text;
}

/* ---------- step 1: the Planck spectrum in real units ---------- */
const s1 = { fixed: true };
function draw1() {
  const T = num('T1'); $('T1v').textContent = T + ' K';
  $('yFix1').setAttribute('aria-pressed', String(s1.fixed)); $('yAuto1').setAttribute('aria-pressed', String(!s1.fixed));
  const { ctx, W, H } = fitCanvas($('c1'));
  const pk = M.peakValue(T) / KW_NM, ymax = s1.fixed ? M.peakValue(6500) / KW_NM * 1.06 : pk * 1.15;
  const m = panel(ctx, W, { top: 26, bottom: H - 28, x: { min: 0, max: 3000 }, y: { min: 0, max: ymax }, xt: [0, 500, 1000, 1500, 2000, 2500, 3000].map(v => [v, String(v)]), yt: niceTicks(ymax), title: t('c1title') });
  const nms = linspace(1, 3000, 600);
  fillSpectrum(ctx, m, X => ((X - m.P.l) / (m.P.r - m.P.l) * 3000) * 1e-9, lam => M.planck(lam, T) / KW_NM, 'rgba(103,215,249,0.22)', 'rgba(103,215,249,0.22)');
  for (const Tr of [3000, 4500, 6000]) curve(ctx, m, nms, nm => M.planck(nm * 1e-9, Tr) / KW_NM, C.ghost, { lw: 1.3, dash: [5, 4] });
  curve(ctx, m, nms, nm => M.planck(nm * 1e-9, T) / KW_NM, C.cyan, { lw: 2.4 });
  const lp = M.wienPeak(T); dot(ctx, m.x(lp * 1e9), m.y(pk), C.text, 4.5);
  $('r1').textContent = t('s1readout', { T, peak: fmtLam(lp), pv: sig(pk), r5: sig(M.peakValue(T) / M.peakValue(3000)), tot: fmtPowArea(M.total(T)), r4: sig(M.total(T) / M.total(3000)), share: pct(M.visibleShare(T)) });
}

/* ---------- step 2: Wien's law ---------- */
const s2 = { hist: [] };
function record2(T) { s2.hist = s2.hist.filter(v => v !== T); s2.hist.push(T); if (s2.hist.length > 40) s2.hist.shift(); }
function draw2() {
  const T = num('T2'); $('T2v').textContent = T + ' K';
  const { ctx, W, H } = fitCanvas($('c2'));
  const top = panel(ctx, W, { top: 26, bottom: 168, x: { min: 1e-7, max: 1e-4, log: true }, y: { min: 0, max: 1.08 }, xt: umTicks, yt: [[0, '0'], [0.5, '0.5'], [1, '1']], title: t('c2a') });
  const lams = logspace(1e-7, 1e-4, 360);
  for (const Th of s2.hist.slice(-8)) if (Th !== T) curve(ctx, top, lams, lam => M.planck(lam, Th) / M.peakValue(Th), C.dim, { lw: 1.5 });
  curve(ctx, top, lams, lam => M.planck(lam, T) / M.peakValue(T), C.cyan, { lw: 2.4 });
  vline(ctx, top.x(M.wienPeak(T)), top.P.t, top.P.b, C.cyan, [4, 4], 1.1);
  const bot = panel(ctx, W, { top: 222, bottom: H - 28, x: { min: 200, max: 12000, log: true }, y: { min: 0.2, max: 15, log: true }, xt: [[200, '200'], [500, '500'], [1000, '1000'], [2000, '2000'], [5000, '5000'], [10000, '10000 K']], yt: [[0.2, '0.2 μm'], [0.5, '0.5 μm'], [1, '1 μm'], [2, '2 μm'], [5, '5 μm'], [10, '10 μm']], title: t('c2b') });
  // visible band as a faint horizontal stripe (rows coloured by wavelength)
  ctx.save(); ctx.globalAlpha = 0.28;
  for (let nm = 380; nm < 750; nm += 2) { ctx.fillStyle = LINECOL[nm]; const y0 = bot.y(nm / 1000), y1 = bot.y((nm + 2) / 1000); ctx.fillRect(bot.P.l + 1, y1, bot.P.r - bot.P.l - 1, y0 - y1 + 0.5); }
  ctx.restore();
  curve(ctx, bot, logspace(200, 12000, 200), T => M.wienPeak(T) * 1e6, C.orange, { lw: 2 });
  for (const Th of s2.hist) dot(ctx, bot.x(Th), bot.y(M.peakNumeric(Th) * 1e6), C.text, 3.6);
  dot(ctx, bot.x(T), bot.y(M.peakNumeric(T) * 1e6), C.cyan, 6, true);
  const pn = M.peakNumeric(T), pw = M.wienPeak(T);
  $('r2').textContent = t('s2readout', { T, num: fmtLam(pn), wien: fmtLam(pw), err: sig(Math.abs(pn / pw - 1), 2), prod: (pn * T * 1e3).toFixed(3), n: s2.hist.length });
}

/* ---------- step 3: Stefan–Boltzmann ---------- */
const s3 = { hist: [], prog: null };
const TOT = new Map(); const totalNum = T => { if (!TOT.has(T)) TOT.set(T, M.totalNumeric(T)); return TOT.get(T); };
const SWEEP3 = logspace(200, 5000, 25).map(v => Math.round(v / 10) * 10);
function draw3() {
  const T = num('T3'); $('T3v').textContent = T + ' K';
  const { ctx, W, H } = fitCanvas($('c3'));
  const yt = [1, 3, 5, 7, 9].map(e => [Math.pow(10, e), pow10(e)]);
  const top = panel(ctx, W, { top: 26, bottom: 216, x: { min: 150, max: 12000, log: true }, y: { min: 10, max: 3e9, log: true }, xt: [[200, '200'], [500, '500'], [1000, '1000'], [2000, '2000'], [5000, '5000'], [10000, '10000 K']], yt, title: t('c3a') });
  curve(ctx, top, logspace(150, 12000, 100), M.total, C.orange, { lw: 2 });
  // doubling path: across from T to 2T, then up by 16
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath();
  ctx.moveTo(top.x(T), top.y(M.total(T))); ctx.lineTo(top.x(2 * T), top.y(M.total(T))); ctx.lineTo(top.x(2 * T), top.y(M.total(2 * T))); ctx.stroke(); ctx.restore();
  for (const Th of s3.hist) dot(ctx, top.x(Th), top.y(totalNum(Th)), C.text, 3.6);
  dot(ctx, top.x(T), top.y(M.total(T)), C.cyan, 6, true); dot(ctx, top.x(2 * T), top.y(M.total(2 * T)), C.pink, 6, true);
  // bottom: spectra at T and 2T, scaled so the 2T peak is 1
  const lmax = 4 * M.b / T * 1e6, pk2 = M.peakValue(2 * T);
  const bot = panel(ctx, W, { top: 270, bottom: H - 28, x: { min: 0, max: lmax }, y: { min: 0, max: 1.08 }, xt: niceTicks(lmax, 5), yt: [[0, '0'], [0.5, '0.5'], [1, '1']], title: t('c3b') });
  const xs = linspace(lmax / 400, lmax, 400);
  for (const [Tc, col] of [[2 * T, C.pink], [T, C.cyan]]) {
    clipTo(ctx, bot.P); ctx.fillStyle = col; ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.moveTo(bot.x(0), bot.y(0));
    for (const u of xs) ctx.lineTo(bot.x(u), bot.y(M.planck(u * 1e-6, Tc) / pk2)); ctx.lineTo(bot.x(lmax), bot.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    curve(ctx, bot, xs, u => M.planck(u * 1e-6, Tc) / pk2, col, { lw: 2.2 });
  }
  const law = M.total(T), nm = totalNum(T);
  const prog = s3.prog !== null ? t('s3progress', { k: s3.prog, N: SWEEP3.length }) : '';
  $('r3').textContent = t('s3readout', { prog, T, law: fmtPowArea(law), num: fmtPowArea(nm), err: sig(Math.abs(nm / law - 1), 2), T2: 2 * T, law2: fmtPowArea(M.total(2 * T)), ratio: sig(M.total(2 * T) / law, 4) });
}

/* ---------- step 4: ultraviolet catastrophe ---------- */
function draw4() {
  const T = num('T4'), lam = lamFromIdx(num('L4'));
  $('T4v').textContent = T + ' K'; $('L4v').textContent = fmtLam(lam);
  const { ctx, W, H } = fitCanvas($('c4'));
  const yt = [-8, -6, -4, -2, 0, 2, 4, 6].map(e => [Math.pow(10, e), pow10(e)]);
  const m = panel(ctx, W, { top: 26, bottom: H - 28, x: { min: 1e-7, max: 1e-4, log: true }, y: { min: 1e-8, max: 1e6, log: true }, xt: umTicks, yt, title: t('c4title') });
  // visible band marker along the bottom
  for (let nm = 380; nm <= 750; nm++) { ctx.fillStyle = LINECOL[nm]; ctx.fillRect(m.x(nm * 1e-9), m.P.b - 6, Math.max(1, m.x((nm + 1) * 1e-9) - m.x(nm * 1e-9)) + 0.5, 6); }
  const lams = logspace(1e-7, 1e-4, 400), P = l => M.planck(l, T) / KW_NM, R = l => M.rayleighJeans(l, T) / KW_NM;
  clipTo(ctx, m.P); ctx.fillStyle = C.pink; ctx.globalAlpha = 0.2; ctx.beginPath();
  lams.forEach((l, i) => { const X = m.x(l), Y = Math.min(m.P.b, m.y(R(l))); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
  for (let i = lams.length - 1; i >= 0; i--) ctx.lineTo(m.x(lams[i]), Math.min(m.P.b, m.y(Math.max(P(lams[i]), 1e-12))));
  ctx.closePath(); ctx.fill(); ctx.restore();
  curve(ctx, m, lams, R, C.pink, { lw: 2.2 });
  curve(ctx, m, lams, l => Math.max(P(l), 1e-12), C.cyan, { lw: 2.4 });
  vline(ctx, m.x(lam), m.P.t, m.P.b, C.text, [4, 4], 1.1);
  if (m.y(R(lam)) >= m.P.t) dot(ctx, m.x(lam), m.y(R(lam)), C.pink, 5);
  if (m.y(P(lam)) <= m.P.b) dot(ctx, m.x(lam), m.y(P(lam)), C.cyan, 5);
  const x = M.xOf(lam, T), ratio = x > 700 ? Infinity : Math.expm1(x) / x;
  $('r4').textContent = t('s4readout', { T, lam: fmtLam(lam), ratio: sig(ratio, 3), valid: fmtLam(M.rjValidLambda(T)), tail: fmtPowArea(M.rjTail(lam, T)), mult: sig(M.rjTail(lam, T) / M.total(T), 3) });
}

/* ---------- step 5: energy in lumps ---------- */
function draw5() {
  const T = num('T5'), lam = lamFromIdx(num('L5'));
  $('T5v').textContent = T + ' K'; $('L5v').textContent = fmtLam(lam);
  const x = M.xOf(lam, T), mean = M.meanEnergyRatio(x);
  const { ctx, W, H } = fitCanvas($('c5'));
  const top = panel(ctx, W, { top: 26, bottom: 220, x: { min: 0, max: 1 }, y: { min: 0, max: 6 }, xt: [[0, '0'], [0.25, '0.25'], [0.5, '0.5'], [0.75, '0.75'], [1, '1']], yt: [0, 1, 2, 3, 4, 5, 6].map(v => [v, v === 1 ? '1 kT' : String(v)]), title: t('c5a') });
  const nMax = Math.min(240, Math.floor(6 / x));
  for (let n = 0; n <= nMax; n++) {
    const Y = top.y(n * x), p = M.occupancy(x, n);
    ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.28)'; ctx.lineWidth = 1; if (nMax < 60) { ctx.beginPath(); ctx.moveTo(top.P.l, Y); ctx.lineTo(top.P.r, Y); ctx.stroke(); }
    ctx.fillStyle = C.cyan; const hgt = Math.min(7, Math.max(1.5, (top.y(0) - top.y(x)) * 0.6)); ctx.fillRect(top.P.l + 1, Y - hgt / 2, Math.max(0, top.x(p) - top.P.l), hgt); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(top.P.l, top.y(1)); ctx.lineTo(top.P.r, top.y(1)); ctx.stroke();
  ctx.setLineDash([]); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(top.P.l, top.y(mean)); ctx.lineTo(top.P.r, top.y(mean)); ctx.stroke(); ctx.restore();
  const bot = panel(ctx, W, { top: 276, bottom: H - 28, x: { min: 0.01, max: 200, log: true }, y: { min: 0, max: 1.15 }, xt: [[0.01, '0.01'], [0.1, '0.1'], [1, '1'], [10, '10'], [100, '100']], yt: [[0, '0'], [0.5, '0.5'], [1, '1']], title: t('c5b') });
  curve(ctx, bot, [0.01, 200], () => 1, C.pink, { lw: 2 });
  curve(ctx, bot, logspace(0.01, 200, 300), M.meanEnergyRatio, C.orange, { lw: 2.4 });
  dot(ctx, bot.x(x), bot.y(mean), C.text, 5.5);
  const hv = M.h * M.c / lam / M.eV, kT = M.k * T / M.eV;
  $('r5').textContent = t('s5readout', { lam: fmtLam(lam), T, hv: sig(hv, 3), kT: sig(kT, 3), x: sig(x, 3), p1: sig(Math.exp(-x), 3), mean: sig(mean, 3) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function presetButtons(box, ids, onPick) {
  const el = $(box); el.innerHTML = '';
  for (const id of ids) {
    const p = M.PRESETS.find(q => q.id === id);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.dataset.preset = id; b.dataset.step = box.slice(-1);
    b.addEventListener('click', () => onPick(p.T)); el.appendChild(b);
  }
}
function labelPresets() { document.querySelectorAll('[data-preset]').forEach(b => { const p = M.PRESETS.find(q => q.id === b.dataset.preset); b.textContent = t('pre_' + p.id, { T: p.T }); }); }

function setup() {
  presetButtons('pre0', ['ember', 'bulb', 'sun', 'sirius'], T => { stopHeat(); $('T0').value = T; draw0(); });
  presetButtons('pre2', ['body', 'ember', 'bulb', 'sun', 'sirius'], T => { $('T2').value = T; record2(num('T2')); draw2(); });
  $('T0').addEventListener('input', () => { stopHeat(); draw0(); });
  function stopHeat() { if (heating !== null) { stopAnim('heat'); heating = null; } }
  $('heat0').addEventListener('click', () => {
    heating = 0;
    animate('heat', 7000, p => { $('T0').value = Math.round((500 + p * 9500) / 50) * 50; heating = p; draw0(); }, () => { heating = null; draw0(); });
  });
  $('T1').addEventListener('input', draw1);
  $('yFix1').addEventListener('click', () => { s1.fixed = true; draw1(); });
  $('yAuto1').addEventListener('click', () => { s1.fixed = false; draw1(); });
  $('T2').addEventListener('input', draw2);
  $('T2').addEventListener('change', () => { record2(num('T2')); draw2(); });
  $('clear2').addEventListener('click', () => { s2.hist = []; record2(num('T2')); draw2(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    const fb = $('quizFeedback'); fb.textContent = t(ok ? 'correct' : 'wrong'); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  });
  $('T3').addEventListener('input', () => { stopAnim('s3'); s3.prog = null; draw3(); });
  $('T3').addEventListener('change', () => { if (!s3.hist.includes(num('T3'))) s3.hist.push(num('T3')); draw3(); });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.prog = null; s3.hist = []; draw3(); });
  $('sweep3').addEventListener('click', () => {
    s3.hist = []; s3.prog = 0;
    animate('s3', SWEEP3.length * 260, p => {
      const k = Math.min(SWEEP3.length, Math.floor(p * SWEEP3.length) + 1);
      s3.hist = SWEEP3.slice(0, k); s3.prog = k; $('T3').value = SWEEP3[k - 1]; draw3();
    });
  });
  ['T4', 'L4'].forEach(id => $(id).addEventListener('input', draw4));
  ['T5', 'L5'].forEach(id => $(id).addEventListener('input', draw5));
  record2(num('T2'));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshBlackbody = () => { labelPresets(); refresh(); };
  window.refreshBlackbody();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
