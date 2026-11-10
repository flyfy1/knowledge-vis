'use strict';
// Wavelets lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, band and readout comes from window.WAVELET_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.WAVELET_MODEL;
const t = (...a) => window.WAVELET_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa', gap: '#2a3546' };
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


/* ---------- heat-map helper: values[col][row] → coloured image inside a panel ---------- */
const STOPS = [[13, 22, 33], [29, 79, 122], [103, 215, 249], [255, 180, 84], [255, 243, 196]];
function cmap(v) {
  v = Math.max(0, Math.min(1, v)) * (STOPS.length - 1); const i = Math.min(STOPS.length - 2, Math.floor(v)), f = v - i;
  return STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f));
}
// cols × rows grid; get(c, r) returns the value; rows drawn bottom (r = 0) to top.
function heat(ctx, m, cols, rows, get, max) {
  const off = document.createElement('canvas'); off.width = cols; off.height = rows;
  const oc = off.getContext('2d'), img = oc.createImageData(cols, rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const [R, G, B] = cmap(get(c, r) / max), p = ((rows - 1 - r) * cols + c) * 4;
    img.data[p] = R; img.data[p + 1] = G; img.data[p + 2] = B; img.data[p + 3] = 255;
  }
  oc.putImageData(img, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.restore();
}
function box(ctx, X0, Y0, X1, Y1, color, lw = 1.5, dash = null, fill = null) {
  ctx.save(); if (fill) { ctx.fillStyle = fill; ctx.fillRect(Math.min(X0, X1), Math.min(Y0, Y1), Math.abs(X1 - X0), Math.abs(Y1 - Y0)); }
  ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.strokeRect(Math.min(X0, X1), Math.min(Y0, Y1), Math.abs(X1 - X0), Math.abs(Y1 - Y0)); ctx.restore();
}

/* ---------- step 0: the spectrum does not know when ---------- */
const REF0 = M.burstSpectrum(0.3);
function draw0() {
  const t0 = num('t0'), x = M.burst(t0), S = M.burstSpectrum(t0);
  $('t0v').textContent = t0.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 26, bottom: 140, xMin: 0, xMax: 1, yMin: -1.15, yMax: 1.15, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.1, 0.2, 0.25, 0.5], title: t('c0a') });
  poly(ctx, x.map((v, n) => [A.x(n / M.FS), A.y(v)]), C.cyan, 1.6);
  const B = panel(ctx, W, { top: 184, bottom: H - 26, xMin: 0, xMax: 64, yMin: 0, yMax: 0.12, yTicks: [0, 0.05, 0.1], xTicks: true, xSteps: [8, 16, 32], title: t('c0b'), left: 42 });
  const bw = Math.max(1.5, (B.x(1) - B.x(0)) * 0.6);
  ctx.save(); ctx.fillStyle = C.cyan;
  for (let k = 0; k <= 64; k++) { const Y = B.y(S.mag[k]); ctx.fillRect(B.x(k) - bw / 2, Y, bw, B.y(0) - Y); }
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4;
  for (let k = 0; k <= 64; k++) if (REF0.mag[k] > 0.004) { ctx.beginPath(); ctx.arc(B.x(k), B.y(REF0.mag[k]), 3.2, 0, 7); ctx.stroke(); }
  ctx.restore();
  const d = Math.max(...S.mag.map((v, k) => Math.abs(v - REF0.mag[k])));
  $('r0').textContent = t('s0readout', { t: t0.toFixed(2), d: d === 0 ? '0' : d.toExponential(1), p: Math.max(...S.mag).toFixed(3), ph: Math.round(S.phase * 180 / Math.PI) });
}

/* ---------- step 1: spectrogram with a fixed window ---------- */
const RES = M.LENS.map(L => M.stftResolution(L));
const FMAX1 = 100;
function spectro(ctx, m, S) {
  const kMax = Math.round(FMAX1 / S.df), cols = S.frames.length;
  let mx = 0; S.frames.forEach(c => { for (let k = 0; k <= kMax; k++) mx = Math.max(mx, c[k]); });
  heat(ctx, m, cols, kMax + 1, (c, r) => S.frames[c][r], mx);
}
function draw1() {
  const i = num('L1'), L = M.LENS[i], R = RES[i], sp = M.winSpread(L);
  $('L1v').textContent = String(L);
  let { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 2, yMin: 0, yMax: FMAX1, yTicks: [0, 20, 40, 60, 80, 100], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c1a') });
  spectro(ctx, A, R.S);
  const st = M.winSigmaT(L), sf = M.winSigmaF(L);
  [[0.4, 16], [1.0, 72]].forEach(([tc, fc]) => box(ctx, A.x(Math.max(0, tc - st)), A.y(Math.max(0, fc - sf)), A.x(Math.min(2, tc + st)), A.y(Math.min(FMAX1, fc + sf)), C.text, 1.5));
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -0.5, xMax: 4.5, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], xTicks: false, title: t('c1b') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(B.x(i - 0.5), B.P.t, B.x(i + 0.5) - B.x(i - 0.5), B.P.b - B.P.t); ctx.restore();
  const gw = B.x(1) - B.x(0), bw = Math.min(22, gw * 0.3);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  RES.forEach((r, j) => {
    ctx.fillStyle = C.cyan; ctx.fillRect(B.x(j) - bw - 1, B.y(r.tones.dip), bw, B.y(0) - B.y(r.tones.dip));
    ctx.fillStyle = C.orange; ctx.fillRect(B.x(j) + 1, B.y(r.clicks.dip), bw, B.y(0) - B.y(r.clicks.dip));
    ctx.fillStyle = j === i ? C.text : C.muted; ctx.fillText(String(M.LENS[j]), B.x(j), B.P.b + 15);
  });
  ctx.restore();
  hline(ctx, B, 0.5, C.text, [5, 4]);
  const v = d => (d.ok ? t('yes') : t('no'));
  $('r1').textContent = t('s1readout', { L, st: (1000 * st).toFixed(1), sf: sf.toFixed(2), prod: sp.prod.toFixed(4), dt: R.tones.dip.toFixed(2), vt: v(R.tones), dc: R.clicks.dip.toFixed(2), vc: v(R.clicks) });
}

/* ---------- step 2: the stretching window ---------- */
const W0_2 = 8, L2 = 64;
const f2val = i => 4 * Math.pow(24, i / 40);
function draw2() {
  const f = f2val(num('f2'));
  $('f2v').textContent = f.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c2'));
  const stS = M.winSigmaT(L2), sfS = M.winSigmaF(L2), stW = M.morletSigmaT(f, W0_2), sfW = M.morletSigmaF(f, W0_2);
  const atom = (m, st, col) => {
    const pts = [], env = [], nenv = [];
    for (let i = 0; i <= 600; i++) { const tt = -0.25 + 0.5 * i / 600, g = Math.exp(-0.5 * (tt / st) ** 2); pts.push([m.x(tt), m.y(g * Math.cos(2 * Math.PI * f * tt))]); env.push([m.x(tt), m.y(g)]); nenv.push([m.x(tt), m.y(-g)]); }
    poly(ctx, env, C.ghost, 1, [3, 3]); poly(ctx, nenv, C.ghost, 1, [3, 3]); poly(ctx, pts, col, 1.8);
    vline(ctx, m.x(-st), m.P.t, m.P.b, C.muted, [2, 3], 0.6); vline(ctx, m.x(st), m.P.t, m.P.b, C.muted, [2, 3], 0.6);
  };
  const A = panel(ctx, W, { top: 26, bottom: 112, xMin: -0.25, xMax: 0.25, yMin: -1.1, yMax: 1.1, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.05, 0.1, 0.25], title: t('c2a') });
  atom(A, stS, C.text);
  const B = panel(ctx, W, { top: 156, bottom: 242, xMin: -0.25, xMax: 0.25, yMin: -1.1, yMax: 1.1, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.05, 0.1, 0.25], title: t('c2b') });
  atom(B, stW, C.orange);
  const Cp = panel(ctx, W, { top: 286, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax: 128, yTicks: [0, 32, 64, 96, 128], xTicks: true, xSteps: [0.1, 0.2, 0.25, 0.5], title: t('c2c') });
  ctx.save(); ctx.beginPath(); ctx.rect(Cp.P.l, Cp.P.t, Cp.P.r - Cp.P.l, Cp.P.b - Cp.P.t); ctx.clip();
  const tile = (tc, fc, st, sf, color, dash, fill) => box(ctx, Cp.x(tc - st), Cp.y(fc - sf), Cp.x(tc + st), Cp.y(fc + sf), color, 1.4, dash, fill);
  [8, 24, 48, 96].forEach(fc => { tile(0.2, fc, stS, sfS, C.orange, [4, 3]); tile(0.65, fc, M.morletSigmaT(fc, W0_2), M.morletSigmaF(fc, W0_2), 'rgba(103,215,249,0.6)'); });
  tile(0.2, f, stS, sfS, C.cyan, null, 'rgba(103,215,249,0.35)');
  tile(0.65, f, stW, sfW, C.cyan, null, 'rgba(103,215,249,0.35)');
  ctx.restore();
  $('r2').textContent = t('s2readout', { f: f.toFixed(1), wt: (1000 * stW).toFixed(1), wf: sfW.toFixed(2), wc: M.cyclesInside(f, W0_2).toFixed(2), st: (1000 * stS).toFixed(1), sf: sfS.toFixed(2), sc: (2 * stS * f).toFixed(2) });
}

/* ---------- step 3: scalogram vs spectrogram ---------- */
const CW = {}, CWR = {};
const SIGNAL = M.testSignal();
function draw3() {
  const w0 = num('w3'), i = num('L3'), L = M.LENS[i];
  $('w3v').textContent = String(w0); $('L3v').textContent = String(L);
  if (!CW[w0]) { CW[w0] = M.cwt(SIGNAL, w0); CWR[w0] = M.cwtResolution(w0); }
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 2, yMin: 0, yMax: FMAX1, yTicks: [0, 20, 40, 60, 80, 100], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c3a') });
  spectro(ctx, A, RES[i].S);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const fr = M.FGRID, lf = Math.log;
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 2, yMin: lf(fr[0]), yMax: lf(fr[fr.length - 1]), yTicks: [], xTicks: true, xSteps: [0.25, 0.5, 1], title: t('c3b') });
  const rows = CW[w0].rows; let mx = 0; rows.forEach(r => r.forEach(v => { mx = Math.max(mx, v); }));
  heat(ctx, B, rows[0].length, rows.length, (c, r) => rows[r][c], mx);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [5, 10, 20, 50, 100].forEach(f => { ctx.fillText(String(f), B.P.l - 6, B.y(lf(f)) + 4); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(B.P.l - 3, B.y(lf(f))); ctx.lineTo(B.P.l, B.y(lf(f))); ctx.stroke(); });
  ctx.restore();
  const S = RES[i], Wr = CWR[w0], v = d => (d.ok ? t('yes') : t('no'));
  $('r3').textContent = t('s3readout', { L, st: v(S.tones), sdt: S.tones.dip.toFixed(2), sc: v(S.clicks), sdc: S.clicks.dip.toFixed(2), w: w0, wt: v(Wr.tones), wdt: Wr.tones.dip.toFixed(2), wc: v(Wr.clicks), wdc: Wr.clicks.dip.toFixed(2), verdict: Wr.tones.ok && Wr.clicks.ok ? t('both') : t('notBoth') });
}

/* ---------- step 4: Haar sparsity ---------- */
function draw4() {
  const j = num('j4'), K = num('K4'), R = M.stepRecon(j, K), N = M.S4.N;
  $('j4v').textContent = String(j); $('K4v').textContent = String(K);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 178, xMin: -0.5, xMax: N - 0.5, yMin: -0.4, yMax: 1.4, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [8, 16, 32], title: t('c4a') });
  const stair = arr => { const p = []; arr.forEach((v, n) => { p.push([A.x(n - 0.5), A.y(v)]); p.push([A.x(n + 0.5), A.y(v)]); }); return p; };
  poly(ctx, stair(R.x), C.text, 1.4, [5, 3]);
  poly(ctx, stair(R.dctRec), C.orange, 1.8);
  poly(ctx, stair(R.haarRec), C.cyan, 2.2);
  // coefficient levels: row 0 = overall average, rows 1..6 = coarse → fine differences
  const levels = [R.h.approx].concat(R.h.details), nRows = levels.length;
  const B = panel(ctx, W, { top: 222, bottom: H - 26, xMin: 0, xMax: N, yMin: -0.5, yMax: nRows - 0.5, yTicks: [], xTicks: true, xSteps: [8, 16, 32], title: t('c4b') });
  const keep = M.keepK(R.hc, K); let idx = 0;
  const cmax = Math.max(...R.hc.map(Math.abs)) || 1;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = C.muted;
  levels.forEach((row, r) => {
    const Y = B.y(nRows - 1 - r); ctx.fillText(String(r), B.P.l - 6, Y + 4);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(B.P.l, Y); ctx.lineTo(B.P.r, Y); ctx.stroke();
    row.forEach((c, q) => {
      const X = B.x((q + 0.5) * N / row.length), kept = keep[idx] !== 0, mag = Math.abs(c); idx++;
      ctx.beginPath(); ctx.arc(X, Y, mag < 1e-9 ? 1.4 : 2.5 + 5 * mag / cmax, 0, 7);
      ctx.fillStyle = mag < 1e-9 ? C.raw : kept ? C.cyan : 'rgba(103,215,249,0.25)'; ctx.fill();
    });
  });
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const ymax = Math.max(R.dctCurve[0], R.haarCurve[0]) * 1.1;
  const Cq = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 1, xMax: N, yMin: 0, yMax: ymax, xTicks: true, xSteps: [8, 16, 32], title: t('c4c') });
  poly(ctx, R.dctCurve.map((v, q) => [Cq.x(q + 1), Cq.y(v)]), C.orange, 2);
  poly(ctx, R.haarCurve.map((v, q) => [Cq.x(q + 1), Cq.y(Math.max(0, v))]), C.cyan, 2);
  vline(ctx, Cq.x(K), Cq.P.t, Cq.P.b, C.text, [3, 3], 0.6);
  dot(ctx, Cq.x(K), Cq.y(R.dctCurve[K - 1]), C.orange, 5); dot(ctx, Cq.x(K), Cq.y(Math.max(0, R.haarCurve[K - 1])), C.cyan, 5);
  const e = v => (v < 5e-7 ? '0' : v.toFixed(3));
  $('r4').textContent = t('s4readout', { j, nz: R.nz, nzd: R.nzD, K, eh: e(R.haarCurve[K - 1]), ed: e(R.dctCurve[K - 1]), d5: R.dct5, d1: R.dct1 });
}

/* ---------- step 5: denoising ---------- */
const SEEDS5 = [5, 1, 2, 3, 4];
const s5 = { i: 0, cache: {} };
function draw5() {
  const T = num('T5'), seed = SEEDS5[s5.i];
  $('T5v').textContent = T.toFixed(2);
  if (!s5.cache[seed]) s5.cache[seed] = { y: M.noisy(seed), curve: M.denoiseCurve(seed) };
  const { y, curve } = s5.cache[seed], x = M.blocks(), d = M.denoise(y, T), N = M.S5.N;
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: N - 1, yMin: -4, yMax: 5, yTicks: [-4, -2, 0, 2, 4], xTicks: true, xSteps: [32, 64, 128], minPx: 34, title: t('c5a') });
  clip(ctx, A);
  y.forEach((v, n) => dot(ctx, A.x(n), A.y(v), C.raw, 1.6));
  poly(ctx, x.map((v, n) => [A.x(n), A.y(v)]), C.orange, 1.5, [5, 3]);
  poly(ctx, d.out.map((v, n) => [A.x(n), A.y(v)]), C.cyan, 2);
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const ymax = Math.max(curve.raw, ...curve.pts.map(p => p.rmse)) * 1.15;
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 3, yMin: 0, yMax: ymax, xTicks: true, xSteps: [0.5, 1], title: t('c5b') });
  hline(ctx, B, curve.raw, C.ghost);
  poly(ctx, curve.pts.map(p => [B.x(p.T), B.y(p.rmse)]), C.text, 1.8);
  const e = M.rmse(d.out, x);
  dot(ctx, B.x(T), B.y(e), C.cyan, 6);
  $('r5').textContent = t('s5readout', { T: T.toFixed(2), e: e.toFixed(3), raw: curve.raw.toFixed(3), kept: d.kept, total: d.total, bT: curve.best.T.toFixed(2), bE: curve.best.rmse.toFixed(3) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('t0').addEventListener('input', draw0);
  $('L1').addEventListener('input', draw1);
  $('f2').addEventListener('input', draw2);
  ['w3', 'L3'].forEach(id => $(id).addEventListener('input', draw3));
  ['j4', 'K4'].forEach(id => $(id).addEventListener('input', draw4));
  $('T5').addEventListener('input', draw5);
  $('reroll5').addEventListener('click', () => { s5.i = (s5.i + 1) % SEEDS5.length; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  window.refreshWavelets = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
