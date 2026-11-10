'use strict';
// Climate feedback lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.CF_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and ledger rows laid out in fixed columns; legends and sentences live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.CF_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', faint: '#4f6a86', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point; −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
// Fixed decimals for readouts and ledger values (no trimming, so precision stays visible).
const fx = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const sgn = (v, d = 2) => (v > 0 && Number(fx(v, d)) !== 0 ? '+' : '') + fx(v, d);

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Panel title: shrink the font until it fits (never overflows the canvas).
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// x–y plot panel: title row above, y ticks left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [1, 2, 5, 10, 20, 50, 100, 200, 500]);
  const first = Math.ceil((o.xMin - 1e-9) / step) * step;
  ctx.textAlign = 'center';
  for (let v = first; v <= o.xMax + 1e-9; v += step) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(fmt(v, 2), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill();
  if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore();
}
// Ledger rows: label column | bar area | value column. rows: {label, from, to, color, value, dim}
function ledgerRows(ctx, W, o) {
  ctx.save(); ctx.font = '12px system-ui,sans-serif';
  const labW = Math.min(W * 0.34, Math.max(...o.rows.map(r => ctx.measureText(r.label).width)) + 12);
  const valW = 50, X0 = 8 + labW, X1 = W - valW - 8;
  const x = v => X0 + (v - o.min) / (o.max - o.min) * (X1 - X0);
  const rowH = o.rowH || 28;
  // grid and ticks under the rows
  const yEnd = o.top + rowH * o.rows.length;
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const step = niceStep(o.max - o.min, X1 - X0, 34, o.steps || [0.5, 1, 2, 5, 10]);
  for (let v = Math.ceil(o.min / step) * step; v <= o.max + 1e-9; v += step) {
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(v), o.top - 4); ctx.lineTo(x(v), yEnd + 2); ctx.stroke();
    ctx.fillText(fmt(v, 2), x(v), yEnd + 15);
  }
  o.rows.forEach((r, i) => {
    const yc = o.top + rowH * i + rowH / 2;
    ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = r.dim ? C.faint : C.text;
    let s = 12; while (ctx.measureText(r.label).width > labW - 8 && s > 8) { s -= 0.5; ctx.font = `${s}px system-ui,sans-serif`; }
    ctx.fillText(r.label, 8, yc + 4);
    const a = x(Math.min(r.from, r.to)), b = x(Math.max(r.from, r.to));
    ctx.globalAlpha = r.dim ? 0.3 : 1; ctx.fillStyle = r.color; ctx.fillRect(a, yc - rowH * 0.3, Math.max(1.5, b - a), rowH * 0.6); ctx.globalAlpha = 1;
    if (r.link !== undefined) { ctx.strokeStyle = C.ghost; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x(r.link), yc - rowH * 0.5 - rowH * 0.3); ctx.lineTo(x(r.link), yc - rowH * 0.3); ctx.stroke(); ctx.setLineDash([]); }
    ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = r.dim ? C.faint : r.color;
    ctx.fillText(r.value, W - 8, yc + 4);
  });
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, o.top - 10, W - 16);
  return { x, yEnd };
}

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

/* ---------- step 0: the gap ---------- */
function draw0() {
  const c = num('co2'), F = M.forcing(c), inc = M.ABSORBED, out = inc - F;
  $('c0v').textContent = String(c);
  const { ctx, W, H } = fitCanvas($('c0'));
  const lo = 220, hi = 248;
  const L = ledgerRows(ctx, W, { top: 32, min: lo, max: hi, steps: [2, 5, 10], title: t('c0a'), rowH: 34, rows: [
    { label: t('rowIn'), from: lo, to: inc, color: C.orange, value: fx(inc, 1) },
    { label: t('rowOut'), from: lo, to: out, color: C.cyan, value: fx(out, 1) }
  ] });
  // the gap, drawn on the spending row between spending and income
  const yc = 32 + 34 * 1.5;
  if (Math.abs(F) > 1e-9) { ctx.fillStyle = C.pink; ctx.globalAlpha = 0.85; ctx.fillRect(Math.min(L.x(out), L.x(inc)), yc - 10, Math.abs(L.x(inc) - L.x(out)), 20); ctx.globalAlpha = 1; }
  line(ctx, [[L.x(inc), 38], [L.x(inc), yc + 12]], C.orange, 1, [3, 3]);
  const B = panel(ctx, W, { top: 172, bottom: H - 28, xMin: 140, xMax: 1120, yMin: -4.5, yMax: 8, yTicks: [-4, 0, 4, 8], xSteps: [100, 140, 200, 280, 500], minPx: 40, title: t('c0b') });
  // equal steps per doubling
  [280, 560, 1120].forEach(cc => {
    const X = B.x(cc), Y = B.y(M.forcing(cc));
    line(ctx, [[X, B.P.b], [X, Y]], C.ghost, 1.2, [4, 4]); line(ctx, [[B.P.l, Y], [X, Y]], C.ghost, 1.2, [4, 4]);
  });
  const pts = []; for (let cc = 140; cc <= 1120; cc += 5) pts.push([B.x(cc), B.y(M.forcing(cc))]);
  line(ctx, pts, C.pink, 2.4);
  dot(ctx, B.x(c), B.y(F), 6, C.pink, true);
  $('r0').textContent = t('s0readout', { c, ratio: fx(c / M.C0, 2), F: fx(F, 2), inc: fx(inc, 1), out: fx(out, 1), pct: fx(Math.abs(F) / inc * 100, 1) });
}

/* ---------- step 1: Planck response alone ---------- */
const s1 = { tried: new Set([0]) };
function draw1() {
  const dT = num('dT1'), F = M.F2X, P = M.LP * dT, N = M.imbalance(F, dT);
  $('d1v').textContent = dT.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c1'));
  ledgerRows(ctx, W, { top: 32, min: -6.5, max: 4.5, steps: [1, 2, 5], title: t('c1a'), rows: [
    { label: t('rowF'), from: 0, to: F, color: C.orange, value: sgn(F) },
    { label: t('rowP'), from: F, to: F - P, color: C.cyan, value: sgn(-P), link: F },
    { label: t('rowNet'), from: 0, to: N, color: C.text, value: sgn(N), link: F - P }
  ] });
  const B = panel(ctx, W, { top: 180, bottom: H - 28, xMin: 0, xMax: 3, yMin: -6.5, yMax: 4.5, yTicks: [-6, -4, -2, 0, 2, 4], xSteps: [0.25, 0.5, 1], title: t('c1b') });
  line(ctx, [[B.x(0), B.y(F)], [B.x(3), B.y(M.imbalance(F, 3))]], C.ghost, 1.6);
  const eq = M.equilibrium(F);
  line(ctx, [[B.x(eq), B.P.t], [B.x(eq), B.P.b]], C.ghost, 1, [3, 4]);
  [...s1.tried].forEach(v => { if (v !== dT) dot(ctx, B.x(v), B.y(M.imbalance(F, v)), 3.2, C.text); });
  dot(ctx, B.x(dT), B.y(N), 6.5, N > 0.08 ? C.orange : N < -0.08 ? C.cyan : C.green, true);
  const state = Math.abs(N) < M.LP * 0.025 ? t('s1flat', { eq: fmt(eq, 2) }) : N > 0 ? t('s1warm') : t('s1cool');
  $('r1').textContent = t('s1readout', { dT: dT.toFixed(2), p: fx(P, 2), N: fx(N, 2), state });
}

/* ---------- step 2: round by round ---------- */
const ROUNDS = 12;
const s2 = { k: ROUNDS, old: new Set() };
function draw2() {
  const f = num('f2'), F = M.F2X, R = M.rounds(F, f, ROUNDS);
  $('f2v').textContent = f.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c2'));
  const top = Math.max(R.limit, ...[...s2.old].map(fo => M.equilibrium(F, fo))) * 1.12;
  const yMax = [1.5, 2, 3, 4, 5].find(v => v >= top) || 5, yTicks = yMax <= 2 ? [0, 0.5, 1, 1.5, 2].filter(v => v <= yMax) : [0, 1, 2, 3, 4, 5].filter(v => v <= yMax);
  const A = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 0.4, xMax: ROUNDS + 0.6, yMin: 0, yMax, yTicks, xSteps: [1, 2, 3, 4], minPx: 24, title: t('c2a') });
  [...s2.old].forEach(fo => { if (Math.abs(fo - f) < 1e-9) return; const q = M.rounds(F, fo, ROUNDS); line(ctx, q.list.map(r => [A.x(r.k), A.y(r.total)]), C.faint, 1.6); });
  const bw = Math.min(30, (A.x(1) - A.x(0)) * 0.62);
  R.list.slice(0, s2.k).forEach(r => {
    const X = A.x(r.k) - bw / 2, prev = r.total - r.inc;
    ctx.fillStyle = C.cyan; ctx.fillRect(X, A.y(prev), bw, A.y(0) - A.y(prev));
    ctx.fillStyle = C.orange; ctx.fillRect(X, A.y(r.total), bw, Math.max(1.5, A.y(prev) - A.y(r.total)));
  });
  line(ctx, [[A.P.l, A.y(R.limit)], [A.P.r, A.y(R.limit)]], C.text, 1.6, [6, 4]);
  line(ctx, [[A.P.l, A.y(F / M.LP)], [A.P.r, A.y(F / M.LP)]], C.ghost, 1.4, [3, 4]);
  const cur = R.list[Math.max(0, s2.k - 1)];
  $('r2').textContent = t('s2readout', { f: f.toFixed(2), r: fx(R.r, 3), k: s2.k, inc: fx(cur.inc, 3), tot: fx(cur.total, 2), lim: fx(R.limit, 2), p0: fx(F / M.LP, 2), g: fx(M.gain(f), 2), n95: M.roundsTo(f, 0.95) });
}

/* ---------- step 3: the feedback list ---------- */
function draw3() {
  const wv = $('wv3').checked, ice = $('ice3').checked, cl = num('cloud3');
  $('cl3v').textContent = cl.toFixed(2);
  const sum = M.fbSum(wv, ice, cl), lam = M.restoring(sum), F = M.F2X, ecs = M.equilibrium(F, sum);
  const { ctx, W, H } = fitCanvas($('c3'));
  let run = -M.LP;
  const rows = [{ label: t('rowP'), from: 0, to: -M.LP, color: C.cyan, value: sgn(-M.LP) }];
  [['rowWv', M.FB.wv, wv], ['rowIce', M.FB.ice, ice], ['rowCloud', cl, true]].forEach(([k, v, on]) => {
    const add = on ? v : 0;
    rows.push({ label: t(k), from: run, to: run + add, color: add >= 0 ? C.orange : C.cyan, value: on ? sgn(v) : '0.00', dim: !on, link: run });
    run += add;
  });
  rows.push({ label: t('rowNetL'), from: 0, to: -lam, color: C.text, value: sgn(-lam), link: run });
  ledgerRows(ctx, W, { top: 32, min: -3.6, max: 0.6, steps: [0.5, 1], title: t('c3a'), rowH: 26, rows });
  const B = panel(ctx, W, { top: 228, bottom: H - 28, xMin: -0.2, xMax: 1.2, yMin: 0, yMax: 10, yTicks: [0, 2, 4, 6, 8, 10], xSteps: [0.1, 0.2, 0.5], minPx: 34, title: t('c3b') });
  const [lo, hi] = M.CLOUD_RANGE;
  ctx.fillStyle = 'rgba(255,180,84,0.12)'; ctx.fillRect(B.x(lo), B.P.t, B.x(hi) - B.x(lo), B.P.b - B.P.t);
  const curve = (w, i) => { const pts = []; for (let c = -0.2; c <= 1.2 + 1e-9; c += 0.01) { const e = M.equilibrium(F, M.fbSum(w, i, c)); if (e <= 10.2) pts.push([B.x(c), B.y(Math.min(10, e))]); } return pts; };
  line(ctx, curve(wv, ice), C.orange, 2.4);
  const eLo = M.equilibrium(F, M.fbSum(wv, ice, lo)), eHi = M.equilibrium(F, M.fbSum(wv, ice, hi)), eMid = M.equilibrium(F, M.fbSum(wv, ice, M.FB.cloud));
  [[lo, eLo], [hi, eHi]].forEach(([c, e]) => { line(ctx, [[B.P.l, B.y(e)], [B.x(c), B.y(e)]], C.ghost, 1, [3, 4]); dot(ctx, B.x(c), B.y(e), 4.5, C.text); });
  dot(ctx, B.x(cl), B.y(Math.min(10, ecs)), 6.5, C.cyan, true);
  $('r3').textContent = t('s3readout', { lam: fx(lam, 2), ecs: fx(ecs, 2), p0: fx(F / M.LP, 2), g: fx(M.gain(sum), 2), lo: fx(eLo, 2), hi: fx(eHi, 2), dlo: fx(eMid - eLo, 2), dhi: fx(eHi - eMid, 2) });
}

/* ---------- step 4: the ocean's delay ---------- */
const YEARS = 60;
const s4 = { t: YEARS, old: [], cur: 75 };
function draw4() {
  const h = num('h4'), Cap = M.heatCap(h), lam = M.LAMBDA_C, F = M.F2X, eq = F / lam;
  $('h4v').textContent = String(h);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: 190, xMin: 0, xMax: YEARS, yMin: 0, yMax: 3.6, yTicks: [0, 1, 2, 3], xSteps: [5, 10, 20], title: t('c4a') });
  const B = panel(ctx, W, { top: 246, bottom: H - 28, xMin: 0, xMax: YEARS, yMin: 0, yMax: 4, yTicks: [0, 1, 2, 3, 4], xSteps: [5, 10, 20], title: t('c4b') });
  const curve = (hh, tEnd, key, m) => { const Cc = M.heatCap(hh), pts = []; for (let s = 0; s <= tEnd + 1e-9; s += 0.25) pts.push([m.x(s), m.y(M.oneLayer(F, lam, Cc, s)[key])]); return pts; };
  s4.old.forEach(hh => { if (hh === h) return; line(ctx, curve(hh, YEARS, 'T', A), C.faint, 1.6); line(ctx, curve(hh, YEARS, 'N', B), C.faint, 1.6); });
  line(ctx, [[A.P.l, A.y(eq)], [A.P.r, A.y(eq)]], C.text, 1.4, [6, 4]);
  const tau = Cap / lam;
  if (tau <= YEARS) { line(ctx, [[A.x(tau), A.P.t], [A.x(tau), A.P.b]], C.ghost, 1, [3, 4]); line(ctx, [[B.x(tau), B.P.t], [B.x(tau), B.P.b]], C.ghost, 1, [3, 4]); }
  line(ctx, curve(h, s4.t, 'T', A), C.orange, 2.6); line(ctx, curve(h, s4.t, 'N', B), C.pink, 2.6);
  const now = M.oneLayer(F, lam, Cap, s4.t);
  dot(ctx, A.x(s4.t), A.y(now.T), 5.5, C.orange, true); dot(ctx, B.x(s4.t), B.y(now.N), 5.5, C.pink, true);
  $('r4').textContent = t('s4readout', { h, C: fx(Cap, 1), tau: fx(tau, 1), t: Math.round(s4.t), T: fx(now.T, 2), eq: fx(eq, 2), pct: fx(now.T / eq * 100, 0), N: fx(now.N, 2) });
}

/* ---------- step 5: the carbon books ---------- */
const Y5 = 80;
const s5 = { pins: [] };
function draw5() {
  const E = num('e5'), s = num('s5') / 100;
  $('e5v').textContent = E.toFixed(1); $('s5v').textContent = String(num('s5'));
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 30, bottom: 190, xMin: 0, xMax: Y5, yMin: 400, yMax: 900, yTicks: [400, 500, 600, 700, 800, 900], xSteps: [10, 20, 40], title: t('c5a'), left: 44 });
  const B = panel(ctx, W, { top: 246, bottom: H - 28, xMin: 0, xMax: Y5, yMin: 0, yMax: 6, yTicks: [0, 2, 4, 6], xSteps: [10, 20, 40], title: t('c5b'), left: 44 });
  line(ctx, [[A.P.l, A.y(560)], [A.P.r, A.y(560)]], C.ghost, 1.2, [4, 4]);
  line(ctx, [[B.P.l, B.y(M.eqWarming(560))], [B.P.r, B.y(M.eqWarming(560))]], C.ghost, 1.2, [4, 4]);
  const paths = (EE, ss, col, lw) => {
    const top = [], bot = [];
    for (let y = 0; y <= Y5; y++) { const c = M.ppmAt(EE, ss, y); top.push([A.x(y), A.y(Math.min(900, c))]); bot.push([B.x(y), B.y(Math.min(6, M.eqWarming(c)))]); }
    line(ctx, top, col, lw); line(ctx, bot, col, lw);
  };
  s5.pins.forEach(p => paths(p.E, p.s, C.faint, 1.8));
  paths(E, s, C.orange, 2.6);
  const rate = M.ppmRate(E, s), c80 = M.ppmAt(E, s, Y5), yCross = rate > 0 ? (560 - M.NOW_PPM) / rate : Infinity;
  if (yCross <= Y5) { dot(ctx, A.x(yCross), A.y(560), 5.5, C.text, true); dot(ctx, B.x(yCross), B.y(M.eqWarming(560)), 5.5, C.text, true); }
  const cross = yCross <= Y5 ? t('s5cross', { y: fx(yCross, 0) }) : t('s5nocross');
  $('r5').textContent = t('s5readout', { E: fx(E, 1), s: num('s5'), air: fx(E * (1 - s), 2), rate: fx(rate, 2), c80: fx(c80, 0), cross, w: fx(M.eqWarming(c80), 2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('co2').addEventListener('input', draw0);
  $('dT1').addEventListener('input', () => { s1.tried.add(num('dT1')); draw1(); });
  $('f2').addEventListener('input', () => { draw2(); });
  $('f2').addEventListener('change', () => { if (s2.k === ROUNDS) s2.old.add(num('f2')); draw2(); });
  $('run2').addEventListener('click', () => {
    s2.k = 1; draw2();
    animate('s2', ROUNDS * 380, p => { s2.k = Math.max(1, Math.min(ROUNDS, Math.ceil(p * ROUNDS))); draw2(); }, () => { s2.old.add(num('f2')); draw2(); });
  });
  $('all2').addEventListener('click', () => { stopAnim('s2'); s2.k = ROUNDS; s2.old.add(num('f2')); draw2(); });
  s2.old.add(num('f2'));
  ['wv3', 'ice3'].forEach(id => $(id).addEventListener('change', draw3));
  $('cloud3').addEventListener('input', draw3);
  $('h4').addEventListener('input', () => { stopAnim('s4'); s4.t = YEARS; draw4(); });
  $('h4').addEventListener('change', () => { if (s4.cur !== num('h4') && !s4.old.includes(s4.cur)) s4.old.push(s4.cur); s4.cur = num('h4'); draw4(); });
  $('run4').addEventListener('click', () => { s4.t = 0; draw4(); animate('s4', 4200, p => { s4.t = p * YEARS; draw4(); }); });
  $('clear4').addEventListener('click', () => { s4.old = []; draw4(); });
  ['e5', 's5'].forEach(id => $(id).addEventListener('input', draw5));
  $('pin5').addEventListener('click', () => { const p = { E: num('e5'), s: num('s5') / 100 }; if (!s5.pins.some(q => q.E === p.E && q.s === p.s)) s5.pins.push(p); if (s5.pins.length > 6) s5.pins.shift(); draw5(); });
  $('clear5').addEventListener('click', () => { s5.pins = []; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
