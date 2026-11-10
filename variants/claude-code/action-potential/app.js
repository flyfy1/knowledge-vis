'use strict';
// Action potential lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every trace and readout comes from window.AP_MODEL (model.js, Hodgkin–Huxley). Canvas text is limited to panel
// titles, axis ticks and a few short tags in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.AP_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#55657a', dash: '#8fa3ba', violet: '#b79cff' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const fmtInt = v => { const r = Math.round(v); return (r === 0 ? 0 : r).toLocaleString('en-US'); };

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

// Panel title: shrinks the font until it fits (never overflows the canvas).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceCeil(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v - 1e-9) return m * p; return 10 * p; }
function niceStep(span, px, minPx) { const raw = span * minPx / px, p = Math.pow(10, Math.floor(Math.log10(raw))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p; return 10 * p; }

// A plot panel. Title in its own row above; y ticks left (margin sized to the widest tick); x ticks below.
// o: top, bottom, xMin, xMax, yMin, yMax, yTicks[], yFmt, xStep, xFmt, title, right
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const yFmt = o.yFmt || (v => fmt(v)), xFmt = o.xFmt || (v => fmt(v));
  const left = 10 + Math.max(...o.yTicks.map(v => ctx.measureText(yFmt(v)).width));
  const P = { l: left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.lineWidth = 1; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yFmt(v), P.l - 6, y(v) + 4);
  }
  if (o.yMin < 0 && !o.yTicks.includes(0)) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(0)); ctx.lineTo(P.r, y(0)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  // x ticks: spacing chosen so labels never touch
  const widest = Math.max(ctx.measureText(xFmt(o.xMin)).width, ctx.measureText(xFmt(o.xMax)).width);
  const step = o.xStep || niceStep(o.xMax - o.xMin, P.r - P.l, widest + 14);
  ctx.textAlign = 'center';
  for (let v = Math.ceil(o.xMin / step - 1e-9) * step; v <= o.xMax + 1e-9; v += step) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    const lab = xFmt(v), wl = ctx.measureText(lab).width;
    const X = Math.min(W - 2 - wl / 2, Math.max(wl / 2 + 2, x(v)));
    ctx.fillText(lab, X, P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P, clip: () => { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 1, P.r - P.l, P.b - P.t + 2); ctx.clip(); } };
}
function yTicksFor(max, n = 4) { const s = niceStep(max, 100, 100 / n); const out = []; for (let v = 0; v <= max + 1e-9; v += s) out.push(v); return out; }
function line(ctx, pts, color, lw = 2.2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
  else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function arrow(ctx, X, Y, dir, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X + 6 * dir, Y); ctx.lineTo(X - 4 * dir, Y - 5); ctx.lineTo(X - 4 * dir, Y + 5); ctx.closePath(); ctx.fill(); ctx.restore();
}
function tag(ctx, text, X, Y, color, align = 'right') { ctx.save(); ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore(); }

/* ---------- shared animation runner (reduced motion → jump to the end; hidden page → finish) ---------- */
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

/* ---------- step 0: the weighted average ---------- */
const VMIN = -100, VMAX = 60;
function draw0() {
  const fNa = Math.pow(10, num('na0')), fK = Math.pow(10, num('k0'));
  const gna = M.gNaOf(M.REST) * fNa, gk = M.gKOf(M.REST) * fK, gl = M.HH.gL, tot = gna + gk + gl;
  const V = M.target(gna, gk, gl);
  $('na0v').textContent = '×' + fmtMult(fNa); $('k0v').textContent = '×' + fmtMult(fK);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 18, W - 16);
  const L = 14, R = W - 14, bw = R - L;
  let x = L;
  for (const [g, col] of [[gna, C.orange], [gk, C.cyan], [gl, C.violet]]) { const w = bw * g / tot; ctx.fillStyle = col; ctx.fillRect(x, 28, Math.max(0, w), 24); x += w; }
  title(ctx, t('c0b'), 8, 84, W - 16);
  const X = v => L + (v - VMIN) / (VMAX - VMIN) * bw, axisY = 168;
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, axisY); ctx.lineTo(R, axisY); ctx.stroke();
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (const v of [-100, -50, 0, 50]) { ctx.beginPath(); ctx.moveTo(X(v), axisY); ctx.lineTo(X(v), axisY + 4); ctx.stroke(); ctx.fillText(String(v), Math.min(R - 10, Math.max(L + 12, X(v))), axisY + 17); }
  ctx.restore();
  // pulls: from V toward each reversal potential, thickness ∝ share
  for (const [E, g, col, dy] of [[M.HH.ENa, gna, C.orange, -8], [M.HH.EK, gk, C.cyan, -16], [M.HH.EL, gl, C.violet, -24]]) {
    const w = g / tot; if (w < 0.004) continue;
    line(ctx, [[X(V), axisY + dy], [X(E), axisY + dy]], col, 1 + 9 * w, null, 0.75);
  }
  // reversal-potential ticks and tags (E_K and E_Na in one row, E_L in its own row)
  for (const [E, col, lab, row] of [[M.HH.EK, C.cyan, 'E_K −77', 0], [M.HH.ENa, C.orange, 'E_Na +50', 0], [M.HH.EL, C.violet, 'E_L −54', 1]]) {
    line(ctx, [[X(E), axisY - 30], [X(E), axisY + 4]], col, 2);
    const yT = row === 0 ? axisY - 36 : axisY - 52;
    ctx.save(); ctx.font = '600 11px system-ui,sans-serif'; const wl = ctx.measureText(lab).width; ctx.restore();
    tag(ctx, lab, Math.min(R - wl / 2, Math.max(L + wl / 2, X(E))), yT, col, 'center');
  }
  // V marker on its own row below the ticks
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(X(V), axisY + 2); ctx.lineTo(X(V) - 7, axisY + 14); ctx.lineTo(X(V) + 7, axisY + 14); ctx.closePath(); ctx.fill();
  line(ctx, [[X(V), axisY - 30], [X(V), axisY]], C.text, 2);
  const vl = 'V = ' + fmt(V, 1) + ' mV';
  ctx.save(); ctx.font = '600 11px system-ui,sans-serif'; const wv = ctx.measureText(vl).width; ctx.restore();
  tag(ctx, vl, Math.min(R - wv / 2, Math.max(L + wv / 2, X(V))), axisY + 44, C.text, 'center');
  $('r0').textContent = t('s0readout', { gna: fmtG(gna), gk: fmtG(gk), wna: fmt(100 * gna / tot, 1), wk: fmt(100 * gk / tot, 1), wl: fmt(100 * gl / tot, 1), V: fmt(V, 1) });
}
function fmtMult(f) { return f >= 10 ? fmtInt(f) : f >= 1 ? fmt(f, 1) : fmt(f, 2); }
function fmtG(g) { return g >= 10 ? fmt(g, 1) : g >= 0.1 ? fmt(g, 3) : fmt(g, 4); }

/* ---------- step 1: threshold and all-or-none ---------- */
const s1 = { ghosts: [], visited: new Set() };
const cache1 = {}; function single(I) { if (!cache1[I]) cache1[I] = M.single(I); return cache1[I]; }
let THR1 = null, PEAKS1 = null;
function prep1() {
  if (THR1 !== null) return;
  THR1 = M.threshold1();
  PEAKS1 = []; for (let I = 0; I <= 30 + 1e-9; I += 0.5) PEAKS1.push({ I, pk: M.peak(single(I)).V });
}
function draw1() {
  prep1();
  const I = num('i1'), r = single(I), pk = M.peak(r);
  $('i1v').textContent = fmt(I, 1);
  const a = fitCanvas($('c1'));
  const A = panel(a.ctx, a.W, { top: 28, bottom: a.H - 26, xMin: 0, xMax: 20, yMin: -80, yMax: 50, yTicks: [-80, -40, 0, 40], yFmt: v => fmt(v, 0), xStep: 5, title: t('c1a') });
  line(a.ctx, [[A.P.l, A.y(0)], [A.P.r, A.y(0)]], C.dash, 1, [4, 4], 0.7);
  const trace = rr => rr.t.map((tt, i) => [A.x(tt), A.y(rr.V[i])]);
  s1.ghosts.forEach(g => { if (g !== I) line(a.ctx, trace(single(g)), C.ghost, 1.3); });
  a.ctx.fillStyle = 'rgba(255,180,84,0.25)'; a.ctx.fillRect(A.x(M.P1.t0), A.P.b - 8, A.x(M.P1.t0 + M.P1.w) - A.x(M.P1.t0), 8);
  line(a.ctx, trace(r), C.cyan, 2.4);
  const b = fitCanvas($('c1b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 0, xMax: 30, yMin: -80, yMax: 50, yTicks: [-80, -40, 0, 40], yFmt: v => fmt(v, 0), xStep: 5, title: t('c1b') });
  line(b.ctx, [[B.x(THR1), B.P.t], [B.x(THR1), B.P.b]], C.dash, 1.2, [4, 4]);
  line(b.ctx, PEAKS1.filter(q => q.I < THR1).map(q => [B.x(q.I), B.y(q.pk)]), C.orange, 2.2);
  line(b.ctx, PEAKS1.filter(q => q.I > THR1).map(q => [B.x(q.I), B.y(q.pk)]), C.orange, 2.2);
  [...s1.visited].forEach(v => { if (v !== I) dot(b.ctx, B.x(v), B.y(M.peak(single(v)).V), 'rgba(232,237,244,0.55)', 3); });
  dot(b.ctx, B.x(I), B.y(pk.V), C.text, 5.5);
  const above = PEAKS1.filter(q => q.I > THR1), lo = Math.min(...above.map(q => q.pk)), hi = Math.max(...above.map(q => q.pk));
  if (pk.V > M.SPIKE_MV) $('r1').textContent = t('s1spike', { I: fmt(I, 1), thr: fmt(THR1, 2), pk: fmt(pk.V, 1), tp: fmt(pk.t, 2), lo: fmt(lo, 1), hi: fmt(hi, 1) });
  else $('r1').textContent = t('s1sub', { I: fmt(I, 1), thr: fmt(THR1, 2), pk: fmt(pk.V, 1), dv: fmt(pk.V - M.REST.V, 1) });
}
function remember1() { const I = num('i1'); s1.visited.add(I); s1.ghosts = s1.ghosts.filter(g => g !== I); s1.ghosts.push(I); if (s1.ghosts.length > 6) s1.ghosts.shift(); }

/* ---------- step 2: the Na⁺–K⁺ handoff ---------- */
let R2 = null, TPK2 = 0;
function prep2() { if (R2) return; R2 = M.simulate(M.pulse(10, 1, 1), 15, 0.01, 5); TPK2 = M.peak(R2).t; }
function phase2(i) {
  const tt = R2.t[i], V = R2.V[i], gna = R2.gNa[i], gk = R2.gK[i];
  if (tt < 1) return 'phRest';
  if (tt < TPK2) return gna > gk ? 'phRise' : 'phStim';
  const tMin = R2.t[R2.V.indexOf(Math.min(...R2.V))];
  if (V > M.REST.V && tt <= tMin) return 'phFall';
  if (V < M.REST.V - 0.5) return 'phUnder';
  return 'phRecover';
}
function draw2() {
  prep2();
  const tt = num('t2'); $('t2v').textContent = fmt(tt, 2);
  const i = Math.min(R2.t.length - 1, Math.round(tt / 0.05));
  const { ctx, W, H } = fitCanvas($('c2'));
  const mid = Math.round(H * 0.56);
  const A = panel(ctx, W, { top: 28, bottom: mid, xMin: 0, xMax: 15, yMin: -90, yMax: 60, yTicks: [-80, -40, 0, 40], yFmt: v => fmt(v, 0), xStep: W < 560 ? 3 : 1, title: t('c2a') });
  const B = panel(ctx, W, { top: mid + 48, bottom: H - 26, xMin: 0, xMax: 15, yMin: 0, yMax: 35, yTicks: [0, 10, 20, 30], yFmt: v => fmt(v, 0), xStep: W < 560 ? 3 : 1, title: t('c2b') });
  for (const [E, col] of [[M.HH.ENa, C.orange], [M.HH.EK, C.cyan]]) line(ctx, [[A.P.l, A.y(E)], [A.P.r, A.y(E)]], col, 1, [2, 5], 0.6);
  const seg = (P, arr, from, to) => { const pts = []; for (let k = from; k <= to; k++) pts.push([P.x(R2.t[k]), P.y(arr[k])]); return pts; };
  const tgt = R2.t.map((_, k) => M.target(R2.gNa[k], R2.gK[k]));
  const last = R2.t.length - 1;
  for (const [P, arr, col, dash] of [[A, tgt, C.dash, [5, 4]], [A, R2.V, C.text, null], [B, R2.gNa, C.orange, null], [B, R2.gK, C.cyan, null]]) {
    line(ctx, seg(P, arr, 0, last), col, 1.4, dash, 0.22);
    line(ctx, seg(P, arr, 0, i), col, dash ? 1.8 : 2.4, dash);
  }
  line(ctx, [[A.x(R2.t[i]), A.P.t], [A.x(R2.t[i]), B.P.b]], C.muted, 1, [3, 4], 0.7);
  dot(ctx, A.x(R2.t[i]), A.y(R2.V[i]), C.text, 4.5);
  dot(ctx, B.x(R2.t[i]), B.y(R2.gNa[i]), C.orange, 4); dot(ctx, B.x(R2.t[i]), B.y(R2.gK[i]), C.cyan, 4);
  tag(ctx, 'E_Na', A.P.r - 4, A.y(M.HH.ENa) - 5, C.orange); tag(ctx, 'E_K', A.P.r - 4, A.y(M.HH.EK) + 14, C.cyan);
  $('r2').textContent = t('s2readout', { t: fmt(R2.t[i], 2), V: fmt(R2.V[i], 1), tg: fmt(tgt[i], 1), gna: fmt(R2.gNa[i], 2), gk: fmt(R2.gK[i], 2), h: fmt(R2.h[i], 2), phase: t(phase2(i)) });
}

/* ---------- step 3: refractory period ---------- */
let THR3 = null, ABS3 = null, THR1b = null;
function prep3() {
  if (THR3) return;
  THR3 = []; for (let g = 2; g <= 25; g++) THR3.push({ g, thr: M.threshold2(g) });
  ABS3 = M.absRefractory(); prep1(); THR1b = THR1;
}
const cache3 = {};
function pairRun(g, I) { const k = g + '|' + I; if (!cache3[k]) { const r = M.simulate(M.pair(g, I), M.P3.T, 0.02, 2); cache3[k] = { r, fires: M.fires2(g, I), pk: M.peak(r, M.P3.t0 + g).V }; } return cache3[k]; }
function draw3() {
  prep3();
  const g = num('g3'), I = num('i3'), run = pairRun(g, I), thr = THR3.find(q => q.g === g).thr;
  $('g3v').textContent = String(g); $('i3v').textContent = String(I);
  const a = fitCanvas($('c3'));
  const A = panel(a.ctx, a.W, { top: 28, bottom: a.H - 26, xMin: 0, xMax: M.P3.T, yMin: -90, yMax: 60, yTicks: [-80, -40, 0, 40], yFmt: v => fmt(v, 0), xStep: 10, title: t('c3a') });
  a.ctx.fillStyle = 'rgba(255,180,84,0.35)';
  a.ctx.fillRect(A.x(M.P3.t0), A.P.b - 8, A.x(M.P3.t0 + 1) - A.x(M.P3.t0), 8);
  a.ctx.fillRect(A.x(M.P3.t0 + g), A.P.b - 8 * Math.min(2, Math.max(0.25, I / M.P3.amp1)), A.x(M.P3.t0 + g + 1) - A.x(M.P3.t0 + g), 8 * Math.min(2, Math.max(0.25, I / M.P3.amp1)));
  line(a.ctx, run.r.t.map((tt, k) => [A.x(tt), A.y(run.r.V[k])]), C.cyan, 2.2);
  const b = fitCanvas($('c3b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 2, xMax: 25, yMin: 0, yMax: 125, yTicks: [0, 40, 80, 120], yFmt: v => fmt(v, 0), xStep: 5, title: t('c3b') });
  line(b.ctx, [[B.P.l, B.y(THR1b)], [B.P.r, B.y(THR1b)]], C.dash, 1.2, [4, 4]);
  B.clip();
  const pts = THR3.filter(q => isFinite(q.thr)).map(q => [B.x(q.g), B.y(q.thr)]);
  pts.unshift([B.x(ABS3), B.P.t - 4]);
  line(b.ctx, pts, C.orange, 2.4);
  b.ctx.fillStyle = 'rgba(255,122,147,0.10)'; b.ctx.fillRect(B.P.l, B.P.t, B.x(ABS3) - B.P.l, B.P.b - B.P.t);
  b.ctx.restore();
  dot(b.ctx, B.x(g), B.y(I), C.text, 5.5, !run.fires);
  let txt;
  if (!isFinite(thr)) txt = t('s3abs', { g });
  else txt = t(run.fires ? 's3fire' : 's3noFire', { g, I, thr: fmt(thr, 1), pk: fmt(run.pk, 1) });
  const fin = THR3.filter(q => isFinite(q.thr)), rel = fin.find(q => q.thr <= 1.1 * THR1b), mn = fin.reduce((m, q) => (q.thr < m.thr ? q : m), fin[0]);
  $('r3').textContent = txt + ' ' + t('s3summary', { abs: fmt(ABS3, 1), rel: rel ? rel.g : '—', sn: mn.g, min: fmt(mn.thr, 2) });
}

/* ---------- step 4: firing rate ---------- */
const s4 = { visited: new Set([10]) };
const cache4 = {}; function trainAt(I) { if (!cache4[I]) cache4[I] = M.train(I); return cache4[I]; }
let FI = null;
function prep4() { if (FI) return; FI = []; for (let I = 0; I <= 40; I += 1) FI.push({ I, rate: trainAt(I).rate }); }
function draw4() {
  prep4();
  const I = num('i4'), tr = trainAt(I);
  $('i4v').textContent = fmt(I, 1);
  const a = fitCanvas($('c4'));
  const A = panel(a.ctx, a.W, { top: 28, bottom: a.H - 26, xMin: 0, xMax: 150, yMin: -90, yMax: 60, yTicks: [-80, -40, 0, 40], yFmt: v => fmt(v, 0), xStep: 25, title: t('c4a') });
  const pts = []; for (let k = 0; k < tr.r.t.length && tr.r.t[k] <= 150; k++) pts.push([A.x(tr.r.t[k]), A.y(tr.r.V[k])]);
  line(a.ctx, pts, C.cyan, 1.8);
  const b = fitCanvas($('c4b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 0, xMax: 40, yMin: 0, yMax: 125, yTicks: [0, 40, 80, 120], yFmt: v => fmt(v, 0), xStep: 10, title: t('c4b') });
  line(b.ctx, FI.map(q => [B.x(q.I), B.y(q.rate)]), C.orange, 2.2);
  [...s4.visited].forEach(v => { if (v !== I) dot(b.ctx, B.x(v), B.y(trainAt(v).rate), C.ghost, 3.2); });
  dot(b.ctx, B.x(I), B.y(tr.rate), C.text, 5.5);
  const inWin = tr.ts.filter(x => x >= M.P4.w0);
  if (!tr.ts.length) $('r4').textContent = t('s4none', { I: fmt(I, 1), pk: fmt(M.peak(tr.r).V, 1) });
  else if (inWin.length < 2) { const tail = tr.r.V.slice(-50); $('r4').textContent = t('s4onset', { I: fmt(I, 1), n: tr.ts.length, vs: fmt(tail.reduce((x, y) => x + y, 0) / tail.length, 1) }); }
  else {
    $('r4').textContent = t('s4rate', { I: fmt(I, 1), n: inWin.length, rate: fmt(tr.rate, 0), isi: tr.isi ? fmt(tr.isi, 2) : '—', pmax: fmt(Math.max(...tr.peaksWin), 1), pmin: fmt(Math.min(...tr.peaksWin), 1) });
  }
}

/* ---------- step 5: conduction ---------- */
const cache5 = {}; function prop(d) { const k = d.toFixed(1); if (!cache5[k]) cache5[k] = M.propagate(Number(k)); return cache5[k]; }
function draw5() {
  const d = Math.round(num('d5') * 10) / 10, tt = num('t5'), P = prop(d), ref = prop(0.5);
  $('d5v').textContent = fmt(d, 1); $('t5v').textContent = fmt(tt, 1);
  const a = fitCanvas($('c5'));
  const A = panel(a.ctx, a.W, { top: 28, bottom: a.H - 26, xMin: 0, xMax: P.L, yMin: -90, yMax: 60, yTicks: [-80, -40, 0, 40], yFmt: v => fmt(v, 0), xStep: 1, title: t('c5a') });
  for (const xm of [M.CABLE.xA, M.CABLE.xB]) line(a.ctx, [[A.x(xm), A.P.t], [A.x(xm), A.P.b]], C.orange, 1.2, [4, 4], 0.8);
  const snapAt = time => P.snaps[Math.max(0, Math.min(P.snaps.length - 1, Math.round(time / 0.1) - 1))];
  const prof = s => s.V.map((v, k) => [A.x(k * P.dx), A.y(v)]);
  for (let k = 1; k < tt - 1e-9; k += 1) line(a.ctx, prof(snapAt(k)), C.ghost, 1.2);
  if (tt > 0) line(a.ctx, prof(snapAt(tt)), C.cyan, 2.4);
  else line(a.ctx, [[A.P.l, A.y(M.REST.V)], [A.P.r, A.y(M.REST.V)]], C.cyan, 2.4);
  const b = fitCanvas($('c5b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 0, xMax: 1.05, yMin: 0, yMax: 21.5, yTicks: [0, 5, 10, 15, 20], yFmt: v => fmt(v, 0), xStep: 0.2, title: t('c5b') });
  line(b.ctx, Array.from({ length: 106 }, (_, k) => { const x = k / 100; return [B.x(x), B.y(ref.speed * Math.sqrt(x / 0.5))]; }), C.dash, 1.4, [5, 4]);
  Object.keys(cache5).forEach(k => { if (Number(k) !== d && cache5[k].speed) dot(b.ctx, B.x(Number(k)), B.y(cache5[k].speed), 'rgba(232,237,244,0.6)', 3.4); });
  dot(b.ctx, B.x(d), B.y(P.speed), C.text, 5.5);
  $('r5').textContent = t('s5readout', { d: fmt(d, 1), tA: fmt(P.tA, 3), tB: fmt(P.tB, 3), dt: fmt(Math.round(P.tB * 1000) / 1000 - Math.round(P.tA * 1000) / 1000, 3), v: fmt(P.speed, 1), v5: fmt(ref.speed, 1), ratio: fmt(P.speed / ref.speed, 2), sq: fmt(Math.sqrt(d / 0.5), 2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['na0', 'k0'].forEach(id => $(id).addEventListener('input', draw0));
  $('i1').addEventListener('input', draw1); $('i1').addEventListener('change', () => { remember1(); draw1(); });
  remember1();
  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => animate('s2', 5000, p => { $('t2').value = (p * 15).toFixed(2); draw2(); }));
  ['g3', 'i3'].forEach(id => $(id).addEventListener('input', draw3));
  $('i4').addEventListener('input', () => { s4.visited.add(num('i4')); draw4(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), fb = $('quizFeedback');
    if (!choice) { fb.textContent = t('quizNone'); fb.style.color = C.muted; fb.dataset.state = 'none'; return; }
    const ok = choice.value === 'b', p = { r10: fmt(trainAt(10).rate, 0), r40: fmt(trainAt(40).rate, 0) };
    fb.textContent = t(ok ? 'correct' : 'wrong', p); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  });
  $('d5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('t5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('play5').addEventListener('click', () => animate('s5', 5000, p => { $('t5').value = (p * 12).toFixed(1); draw5(); }));

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
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
