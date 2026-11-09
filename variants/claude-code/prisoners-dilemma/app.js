'use strict';
// Prisoner's dilemma lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every move, score, curve and readout comes from window.PD_MODEL (model.js). Canvas text is limited to panel
// titles, row labels in a fixed left column, triangle corner names and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PD_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/\.?0+$/, '') || '0'; };
const sci = v => { const a = Math.abs(v); if (a === 0) return '0'; if (a >= 0.01 && a < 1000) return fmt(v, a < 0.1 ? 3 : 2); return v.toExponential(1).replace('e', '×10^').replace(/\^\+?(-?\d+)/, (_, e) => toSup(e)); };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const toSup = e => String(e).split('').map(ch => SUP[ch]).join('');
const niceCeil = v => { const steps = [1, 2, 2.5, 4, 5, 8, 10, 12, 15, 16, 20, 25, 30, 40, 50]; for (const s of steps) if (v <= s) return s; return Math.ceil(v / 50) * 50; };

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
// Text that shrinks until it fits maxW (never overflows the canvas).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function ticks(lo, hi, px, minPx, minStep = 0) {
  const span = hi - lo; let step = 1;
  for (const s of [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]) { if (s < minStep || (minStep >= 1 && s % 1)) continue; step = s; if (s / span * px >= minPx) break; }
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
// A plot panel: title row above, y ticks left, x ticks below. yTicks may be given explicitly (with labels).
function panel(ctx, W, o) {
  const P = { l: o.left || 34, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yt = o.yTicks || ticks(o.yMin, o.yMax, P.b - P.t, 26).map(v => ({ v, s: fmt(v) }));
  for (const q of yt) {
    const v = typeof q === 'number' ? q : q.v, s = typeof q === 'number' ? fmt(q) : q.s;
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(s, P.l - 5, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.textAlign = 'center';
  for (const v of ticks(o.xMin, o.xMax, P.r - P.l, o.minPx || 30, o.xStepMin || 0)) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(fmt(v), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 6, P.t - 9, W - 12);
  return { x, y, P };
}
const clip = (ctx, m) => { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); };
function polyline(ctx, m, xs, ys, i0, i1, color, lw, alpha = 1, dash = null) {
  if (i1 - i0 < 1) return;
  clip(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); const stride = Math.max(1, Math.floor((i1 - i0) / 1500));
  for (let i = i0; i <= i1; i += stride) { const X = m.x(xs[i]), Y = m.y(ys[i]); if (i === i0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.lineTo(m.x(xs[i1]), m.y(ys[i1])); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = true) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function arrow(ctx, X0, Y0, X1, Y1, color, lw = 2, head = 7, alpha = 1) {
  const L = Math.hypot(X1 - X0, Y1 - Y0); if (L < 1) return;
  const ux = (X1 - X0) / L, uy = (Y1 - Y0) / L, hh = Math.min(head, L * 0.6);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1 - ux * hh * 0.7, Y1 - uy * hh * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X1 - ux * hh - uy * hh * 0.5, Y1 - uy * hh + ux * hh * 0.5); ctx.lineTo(X1 - ux * hh + uy * hh * 0.5, Y1 - uy * hh - ux * hh * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function vline(ctx, X, y0, y1, color, alpha = 0.6, dash = [4, 4], lw = 1.3) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hline(ctx, Y, x0, x1, color, alpha = 0.6, dash = [4, 4], lw = 1.3) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

/* ---------- horizontal bars from 0 (labels in a fixed left column) ---------- */
function hbars(ctx, W, top, bottom, rows, ttl, max, labFrac = 0.22) {
  fitText(ctx, ttl, 6, top - 9, W - 12);
  const labW = Math.min(150, Math.max(50, W * labFrac)), l = labW + 10, r = W - 14;
  const x = v => l + Math.max(0, v) / max * (r - l), rowH = (bottom - top) / rows.length;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (const v of ticks(0, max, r - l, 46)) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), top); ctx.lineTo(x(v), bottom); ctx.stroke(); ctx.fillText(fmt(v), x(v), bottom + 14); }
  ctx.restore();
  rows.forEach((q, i) => {
    const cy = top + rowH * (i + 0.5), bh = Math.min(22, rowH * 0.62);
    fitText(ctx, q.label, labW, cy + 4, labW - 4, { size: 12, weight: q.bold ? 700 : 500, color: q.dim ? C.raw : q.bold ? C.text : C.muted, align: 'right' });
    ctx.save(); ctx.globalAlpha = q.dim ? 0.35 : 1; ctx.fillStyle = q.color; ctx.fillRect(x(0), cy - bh / 2, Math.max(1.5, x(q.v) - x(0)), bh); ctx.restore();
    if (q.outline) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.strokeRect(x(0) - 3, cy - bh / 2 - 3, Math.max(1.5, x(q.v) - x(0)) + 6, bh + 6); ctx.restore(); }
  });
}
const SCOL = { allc: C.green, alld: C.pink, tft: C.cyan, grim: '#b79cff', wsls: C.orange };
const sname = k => t('sn_' + k);

/* ---------- step 0: one-shot game ---------- */
const s0 = { me: 1, them: 1 };
function draw0() {
  $('mhC').textContent = t('C'); $('mhD').textContent = t('D'); $('mrC').textContent = t('C'); $('mrD').textContent = t('D');
  document.querySelectorAll('#matrix .cell').forEach(b => {
    const me = Number(b.dataset.me), them = Number(b.dataset.them);
    b.textContent = t('mCell', { me: M.pay(me, them), them: M.pay(them, me) });
    b.setAttribute('aria-pressed', me === s0.me && them === s0.them ? 'true' : 'false');
  });
  const { ctx, W, H } = fitCanvas($('c0'));
  const P = M.PAY;
  hbars(ctx, W, 28, 100, [{ label: t('s0lgC'), v: P.R, color: C.cyan, dim: s0.them !== 1, outline: s0.them === 1 && s0.me === 1 }, { label: t('s0lgD'), v: P.T, color: C.orange, dim: s0.them !== 1, outline: s0.them === 1 && s0.me === 0 }], t('c0a'), 5, 0.2);
  hbars(ctx, W, 152, H - 26, [{ label: t('s0lgC'), v: P.S, color: C.cyan, dim: s0.them !== 0, outline: s0.them === 0 && s0.me === 1 }, { label: t('s0lgD'), v: P.P, color: C.orange, dim: s0.them !== 0, outline: s0.them === 0 && s0.me === 0 }], t('c0b'), 5, 0.2);
  const a = M.pay(s0.me, s0.them), b = M.pay(s0.them, s0.me);
  $('r0').innerHTML = t('s0readout', { me: t(s0.me ? 'C' : 'D'), them: t(s0.them ? 'C' : 'D'), a, b, sum: a + b, gain1: P.T - P.R, gain2: P.P - P.S });
}

/* ---------- step 1: repeated match ---------- */
const s1 = { k: null };
function draw1() {
  const A = $('sA').value, B = $('sB').value, n = num('n1'), g = M.play(A, B, n), k = s1.k === null ? n : s1.k;
  $('n1v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c1'));
  fitText(ctx, t('c1a'), 6, 18, W - 12);
  const l = 26, r = W - 12, cw = (r - l) / n;
  [['A', g.a, 30], ['B', g.b, 64]].forEach(([lab, mv, y0]) => {
    fitText(ctx, lab, 8, y0 + 18, 16, { size: 13, weight: 700, color: C.muted });
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i < k ? (mv[i] ? C.green : C.pink) : '#1a2533';
      ctx.fillRect(l + i * cw + 1, y0, Math.max(1, cw - 2), 26);
    }
  });
  const yMax = niceCeil(Math.max(5, g.totalA, g.totalB));
  const m = panel(ctx, W, { top: 136, bottom: H - 26, xMin: 0, xMax: n, yMin: 0, yMax, title: t('c1b'), minPx: 26, xStepMin: 1 });
  const xs = [0, ...g.a.map((_, i) => i + 1)], ya = [0, ...g.scoreA], yb = [0, ...g.scoreB];
  polyline(ctx, m, xs, ya, 0, k, C.cyan, 2.4); polyline(ctx, m, xs, yb, 0, k, C.orange, 2.4, 1, [6, 3]);
  dot(ctx, m.x(k), m.y(ya[k]), 4, C.cyan); dot(ctx, m.x(k), m.y(yb[k]), 4, C.orange);
  let cc = 0, dd = 0; for (let i = 0; i < k; i++) { if (g.a[i] && g.b[i]) cc++; if (!g.a[i] && !g.b[i]) dd++; }
  const prog = k < n ? t('s1progress', { k, n }) : '';
  $('r1').textContent = t('s1readout', { prog, nA: sname(A), nB: sname(B), a: ya[k], b: yb[k], pa: k ? fmt(ya[k] / k) : '0', pb: k ? fmt(yb[k] / k) : '0', cc, dd });
}

/* ---------- step 2: round robin ---------- */
const s2 = { on: new Set(M.ORDER) };
const tourCache = new Map();
function series(names) {
  const key = names.join(',');
  if (!tourCache.has(key)) { const rows = []; for (let n = 1; n <= 50; n++) rows.push(M.tournament(names, n)); tourCache.set(key, rows); }
  return tourCache.get(key);
}
function draw2() {
  const names = M.ORDER.filter(k => s2.on.has(k)), n = num('n2'), S = series(names), cur = S[n - 1];
  $('n2v').textContent = String(n);
  document.querySelectorAll('#picks label span').forEach(sp => { sp.textContent = sname(sp.dataset.k); });
  $('lg2').innerHTML = names.map(k => `<span class="lg"><span class="sw" style="background:${SCOL[k]}"></span><span>${sname(k)}</span></span>`).join('');
  let { ctx, W, H } = fitCanvas($('c2'));
  const all = S.flatMap(r => names.map(k => r.tot[k])), hi = Math.max(...all), lo = Math.min(...all);
  hbars(ctx, W, 28, H - 26, cur.rank.map(k => ({ label: sname(k), v: cur.tot[k], color: SCOL[k] })), t('c2a'), niceCeil(hi), 0.36);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const yMin = Math.max(0, Math.floor(lo - 1)), yMax = Math.ceil(hi + 1);
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 1, xMax: 50, yMin, yMax, title: t('c2b') });
  const ns = S.map((_, i) => i + 1);
  names.forEach(k => polyline(ctx, m, ns, S.map(r => r.tot[k]), 0, 49, SCOL[k], 2, 0.95, k === 'grim' ? [5, 4] : null));
  vline(ctx, m.x(n), m.P.t, m.P.b, C.text, 0.7, [], 1);
  names.forEach(k => dot(ctx, m.x(n), m.y(cur.tot[k]), 3.8, SCOL[k]));
  let flip;
  if (!s2.on.has('alld') || !s2.on.has('tft')) flip = t('s2na');
  else { const i = S.findIndex(r => r.tot.tft > r.tot.alld); flip = i < 0 ? t('s2noflip') : t('s2flip', { k: i + 1 }); }
  $('r2').textContent = t('s2readout', { n, rank: cur.rank.map((k, i) => (i ? (Math.abs(cur.tot[k] - cur.tot[cur.rank[i - 1]]) < 1e-9 ? ' = ' : ' > ') : '') + `${sname(k)} ${fmt(cur.tot[k])}`).join(''), flip });
}

/* ---------- step 3: shadow of the future ---------- */
function draw3() {
  const d = num('d3'), T = num('T3'), s = M.shadow(d, T);
  $('d3v').textContent = d.toFixed(2); $('T3v').textContent = fmt(T, 1);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax: 10, title: t('c3') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.08)'; ctx.fillRect(m.x(s.star), m.P.t, m.P.r - m.x(s.star), m.P.b - m.P.t); ctx.restore();
  polyline(ctx, m, [0, 1], [3, 3], 0, 1, C.cyan, 2.4);
  polyline(ctx, m, [0, 1], [T, M.PAY.P], 0, 1, C.pink, 2.4);
  vline(ctx, m.x(s.star), m.P.t, m.P.b, C.green, 0.8);
  dot(ctx, m.x(s.star), m.y(3), 6, C.green);
  vline(ctx, m.x(d), m.P.t, m.P.b, C.text, 0.7, [], 1);
  dot(ctx, m.x(d), m.y(s.coop), 4.5, C.cyan); dot(ctx, m.x(d), m.y(s.defect), 4.5, C.pink);
  const diff = s.coop - s.defect, verdict = t(Math.abs(diff) < 1e-9 ? 'vTie' : diff > 0 ? 'vCoop' : 'vDef');
  $('r3').textContent = t('s3readout', { d: d.toFixed(2), rounds: s.rounds.toFixed(1), c: fmt(s.coop, 3), df: fmt(s.defect, 3), verdict, T: fmt(T, 1), star: fmt(s.star, 3) });
}

/* ---------- step 4: replicator dynamics on the mix triangle ---------- */
const s4 = { hist: new Map(), p: 1, geo: null };
const startMix = () => { const d = num('d4'), tt = num('t4'); return [d, (1 - d) * tt, (1 - d) * (1 - tt)]; };
const mixKey = x => x.map(v => v.toFixed(3)).join(',');
function runFor(x0) { const k = mixKey(x0) + '|' + num('n4'); if (!s4.hist.has(k)) s4.hist.set(k, M.replicator(x0, num('n4'))); return s4.hist.get(k); }
function triGeo(W, H) {
  const top = 44, bot = H - 30, side = Math.min(W - 40, (bot - top) * 2 / Math.sqrt(3)), h = side * Math.sqrt(3) / 2, cx = W / 2;
  return { D: [cx, bot - h], T: [cx - side / 2, bot], C: [cx + side / 2, bot] };
}
const toXY = (g, x) => [x[0] * g.D[0] + x[1] * g.T[0] + x[2] * g.C[0], x[0] * g.D[1] + x[1] * g.T[1] + x[2] * g.C[1]];
function draw4() {
  const n = num('n4'), x0 = startMix(), cur = runFor(x0), steps = cur.xs.length - 1, iEnd = Math.round(s4.p * steps);
  $('n4v').textContent = String(n); $('d4v').textContent = Math.round(num('d4') * 100) + '%'; $('t4v').textContent = Math.round(num('t4') * 100) + '%';
  let { ctx, W, H } = fitCanvas($('c4'));
  fitText(ctx, t('c4a'), 6, 17, W - 12);
  const g = s4.geo = triGeo(W, H);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...g.D); ctx.lineTo(...g.T); ctx.lineTo(...g.C); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = 'rgba(103,215,249,0.04)'; ctx.fill(); ctx.restore();
  // grid lines at 25 % steps
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (const f of [0.25, 0.5, 0.75]) { const a = toXY(g, [f, 1 - f, 0]), b = toXY(g, [f, 0, 1 - f]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  ctx.restore();
  fitText(ctx, sname('alld'), g.D[0], g.D[1] - 7, W - 12, { size: 12, color: C.pink, align: 'center' });
  fitText(ctx, sname('tft'), Math.max(4, g.T[0] - 6), g.T[1] + 17, W / 2 - 10, { size: 12, color: C.cyan });
  fitText(ctx, sname('allc'), Math.min(W - 4, g.C[0] + 6), g.C[1] + 17, W / 2 - 10, { size: 12, color: C.green, align: 'right' });
  const path = (run, i1, color, lw, alpha) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath(); run.xs.slice(0, i1 + 1).forEach((x, i) => { const [X, Y] = toXY(g, x); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore(); };
  const curKey = mixKey(x0) + '|' + n;
  for (const [k, run] of s4.hist) { if (k === curKey || !k.endsWith('|' + n)) continue; path(run, run.xs.length - 1, C.ghost, 1.2, 0.6); const [X, Y] = toXY(g, run.xs[0]); dot(ctx, X, Y, 2.5, C.ghost, false); }
  path(cur, iEnd, C.text, 2.4, 1);
  const th = M.tftThreshold(n);
  if (th <= 1) { const [X, Y] = toXY(g, [1 - th, th, 0]); ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(X, Y, 6, 0, 7); ctx.stroke(); ctx.restore(); }
  { const [X, Y] = toXY(g, x0); dot(ctx, X, Y, 5, C.text); const [X1, Y1] = toXY(g, cur.xs[iEnd]); const w = cur.xs[iEnd].indexOf(Math.max(...cur.xs[iEnd])); dot(ctx, X1, Y1, 5.5, [C.pink, C.cyan, C.green][w]); }

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 60, yMin: 0, yMax: 100, title: t('c4b') });
  const ts = cur.xs.map((_, i) => i * cur.dt);
  [0, 1, 2].forEach(j => polyline(ctx, m, ts, cur.xs.map(x => x[j] * 100), 0, iEnd, [C.pink, C.cyan, C.green][j], 2.2));
  const fin = cur.xs[iEnd];
  let pk = 0, pi = 0; cur.xs.slice(0, iEnd + 1).forEach((x, i) => { if (x[0] > pk) { pk = x[0]; pi = i; } });
  const peak = pi > 0 && pk > x0[0] + 0.01 ? t('s4peak', { p: (pk * 100).toFixed(1), g: (pi * cur.dt).toFixed(1) }) : '';
  const thr = n >= 2 ? t('s4thr', { th: (th * 100).toFixed(1) }) : t('s4thr1');
  const prog = s4.p < 1 ? t('s4progress', { g: (iEnd * cur.dt).toFixed(0) }) : '';
  const pc = v => (v * 100).toFixed(1);
  $('r4').textContent = t('s4readout', { prog, d0: pc(x0[0]), t0: pc(x0[1]), c0: pc(x0[2]), d1: pc(fin[0]), t1: pc(fin[1]), c1: pc(fin[2]), peak, thr });
}

/* ---------- step 5: noise and forgiveness ---------- */
const s5 = { kind: 'tft', seed: 1 };
const lrCache = new Map();
function lr(a, b, e, g) { const k = [a, b, e.toFixed(4), g.toFixed(2)].join('|'); if (!lrCache.has(k)) { const S = x => (x === 'gtft' ? M.gtft(g) : x); lrCache.set(k, M.longRun(S(a), S(b), e)); } return lrCache.get(k); }
function draw5() {
  const e = num('e5'), gg = num('g5'), S = s5.kind === 'gtft' ? M.gtft(gg) : s5.kind, n = 40, g = M.play(S, S, n, { e, seed: s5.seed });
  $('e5v').textContent = e.toFixed(3); $('g5v').textContent = gg.toFixed(2);
  ['tft', 'gtft', 'wsls'].forEach(k => $('k5' + k).setAttribute('aria-pressed', s5.kind === k));
  let { ctx, W, H } = fitCanvas($('c5'));
  fitText(ctx, t('c5a'), 6, 18, W - 12);
  const l = 26, r = W - 12, cw = (r - l) / n;
  [['A', g.a, 34, 1], ['B', g.b, 72, 2]].forEach(([lab, mv, y0, bit]) => {
    fitText(ctx, lab, 8, y0 + 19, 16, { size: 13, weight: 700, color: C.muted });
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = mv[i] ? C.green : C.pink; ctx.fillRect(l + i * cw + 0.5, y0, Math.max(1, cw - 1), 28);
      if (g.flips[i] & bit) dot(ctx, l + (i + 0.5) * cw, y0 + 14, Math.max(1.8, Math.min(3.5, cw / 3)), C.text, false);
    }
  });
  const sm = panel(ctx, W, { top: 136, bottom: H - 26, xMin: 0, xMax: n, yMin: 0, yMax: 5, title: t('c5c'), minPx: 26, xStepMin: 1 });
  const xs = [0, ...g.a.map((_, i) => i + 1)], ys = [0, ...g.scoreA.map((v, i) => v / (i + 1))];
  polyline(ctx, sm, xs, ys, 1, n, C.cyan, 2);

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 0.2, yMin: 0, yMax: 3.2, title: t('c5b') });
  const es = []; for (let i = 0; i <= 80; i++) es.push(i * 0.0025);
  polyline(ctx, m, es, es.map(v => lr('tft', 'tft', v, gg)), 0, 80, C.orange, 2.2);
  polyline(ctx, m, es, es.map(v => lr('gtft', 'gtft', v, gg)), 0, 80, C.cyan, 2.2);
  polyline(ctx, m, es, es.map(v => lr('wsls', 'wsls', v, gg)), 0, 80, C.green, 2.2);
  polyline(ctx, m, es, es.map(v => lr('gtft', 'alld', v, gg)), 0, 80, C.pink, 2, 1, [6, 4]);
  vline(ctx, m.x(e), m.P.t, m.P.b, C.text, 0.7, [], 1);
  const vals = { tft: lr('tft', 'tft', e, gg), gt: lr('gtft', 'gtft', e, gg), ws: lr('wsls', 'wsls', e, gg), ex: lr('gtft', 'alld', e, gg) };
  [[vals.tft, C.orange], [vals.gt, C.cyan], [vals.ws, C.green], [vals.ex, C.pink]].forEach(([v, c]) => dot(ctx, m.x(e), m.y(v), 4, c));
  const flips = g.flips.reduce((s, f) => s + (f & 1) + ((f >> 1) & 1), 0);
  $('r5').textContent = t('s5readout', { e: e.toFixed(3), g: gg.toFixed(2), tft: vals.tft.toFixed(3), gt: vals.gt.toFixed(3), ws: vals.ws.toFixed(3), ex: vals.ex.toFixed(3), sn: sname(s5.kind), avg: fmt(g.totalA / n), flips });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  document.querySelectorAll('#matrix .cell').forEach(b => b.addEventListener('click', () => { s0.me = Number(b.dataset.me); s0.them = Number(b.dataset.them); draw0(); }));

  ['sA', 'sB'].forEach((id, j) => { M.ORDER.forEach(k => { const o = document.createElement('option'); o.value = k; o.dataset.k = k; $(id).appendChild(o); }); $(id).value = j ? 'alld' : 'tft'; });
  const names1 = () => document.querySelectorAll('#sA option, #sB option').forEach(o => { o.textContent = sname(o.dataset.k); });
  ['sA', 'sB', 'n1'].forEach(id => $(id).addEventListener(id === 'n1' ? 'input' : 'change', () => { stopAnim('s1'); s1.k = null; draw1(); }));
  $('play1').addEventListener('click', () => { const n = num('n1'); s1.k = 0; animate('s1', 380 * n, p => { s1.k = Math.round(p * n); draw1(); }, () => { s1.k = null; draw1(); }); });

  M.ORDER.forEach(k => { const lab = document.createElement('label'); lab.innerHTML = `<input type="checkbox" data-step="2" data-k="${k}" checked><span data-k="${k}"></span>`; $('picks').appendChild(lab); });
  $('picks').addEventListener('change', ev => {
    const k = ev.target.dataset.k; if (!k) return;
    if (ev.target.checked) s2.on.add(k); else if (s2.on.size > 2) s2.on.delete(k); else ev.target.checked = true;
    draw2();
  });
  $('n2').addEventListener('input', draw2);
  ['d3', 'T3'].forEach(id => $(id).addEventListener('input', draw3));

  $('n4').addEventListener('input', () => { stopAnim('s4'); s4.p = 1; s4.hist.clear(); draw4(); });
  ['d4', 't4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); s4.p = 1; draw4(); }));
  $('play4').addEventListener('click', () => { s4.p = 0; animate('s4', 6000, p => { s4.p = p; draw4(); }); });
  $('clear4').addEventListener('click', () => { stopAnim('s4'); s4.p = 1; s4.hist.clear(); draw4(); });
  $('c4').addEventListener('click', ev => {
    const g = s4.geo; if (!g) return;
    const rc = $('c4').getBoundingClientRect(), X = ev.clientX - rc.left, Y = ev.clientY - rc.top;
    // barycentric coordinates of (X, Y) in triangle D, T, C
    const [x1, y1] = g.D, [x2, y2] = g.T, [x3, y3] = g.C, den = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    let a = ((y2 - y3) * (X - x3) + (x3 - x2) * (Y - y3)) / den, b = ((y3 - y1) * (X - x3) + (x1 - x3) * (Y - y3)) / den, c = 1 - a - b;
    if (a < -0.05 || b < -0.05 || c < -0.05) return;
    a = Math.min(1, Math.max(0, a)); b = Math.max(0, b); c = Math.max(0, c);
    $('d4').value = Math.round(a * 20) / 20; $('t4').value = b + c > 1e-9 ? Math.round(b / (b + c) * 20) / 20 : num('t4');
    stopAnim('s4'); s4.p = 1; draw4();
  });

  ['tft', 'gtft', 'wsls'].forEach(k => $('k5' + k).addEventListener('click', () => { s5.kind = k; draw5(); }));
  $('reroll5').addEventListener('click', () => { s5.seed += 1; draw5(); });
  ['e5', 'g5'].forEach(id => $(id).addEventListener('input', draw5));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPage = () => { names1(); refresh(); };
  names1(); refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
