'use strict';
// Externalities lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.EXT_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrunk to fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EXT_MODEL;
const t = (...a) => window.EXT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros after the decimal point only; show −0 as 0.
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };

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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4);
  }
  if (o.xTicks !== false) {
    const step = o.xStep || niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20, 25, 50, 100]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      const lab = fmt(v, 2), hw = ctx.measureText(lab).width / 2; // keep edge labels inside the canvas
      ctx.fillText(lab, Math.max(hw + 2, Math.min(W - hw - 2, x(v))), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function line(ctx, m, f, x0, x1, color, lw = 2.2, dash = null) {
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  const n = 160; for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n; if (i === 0) ctx.moveTo(m.x(v), m.y(f(v))); else ctx.lineTo(m.x(v), m.y(f(v))); }
  ctx.stroke(); ctx.restore();
}
// Fill the region between two functions of Q over [q0, q1].
function band(ctx, m, f, g, q0, q1, fill) {
  if (q1 <= q0) return;
  ctx.save(); clipTo(ctx, m); ctx.fillStyle = fill; ctx.beginPath();
  const n = 60; for (let i = 0; i <= n; i++) { const q = q0 + (q1 - q0) * i / n; if (i === 0) ctx.moveTo(m.x(q), m.y(f(q))); else ctx.lineTo(m.x(q), m.y(f(q))); }
  for (let i = n; i >= 0; i--) { const q = q0 + (q1 - q0) * i / n; ctx.lineTo(m.x(q), m.y(g(q))); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
let hatchPat = null;
function hatch(ctx) {
  if (hatchPat) return hatchPat;
  const c = document.createElement('canvas'); c.width = c.height = 8; const g = c.getContext('2d');
  g.strokeStyle = 'rgba(154,170,189,0.85)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 8); g.lineTo(8, 0); g.moveTo(-2, 2); g.lineTo(2, -2); g.moveTo(6, 10); g.lineTo(10, 6); g.stroke();
  hatchPat = ctx.createPattern(c, 'repeat'); return hatchPat;
}
function vline(ctx, m, X, color, dash = [5, 4], lw = 1.5) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.x(X), m.P.t); ctx.lineTo(m.x(X), m.P.b); ctx.stroke(); ctx.restore(); }
function hline(ctx, m, Y, color, dash = [5, 4], lw = 1.5) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, m.y(Y)); ctx.lineTo(m.P.r, m.y(Y)); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, fill, stroke = C.bg) { ctx.save(); ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function ring(ctx, X, Y, r, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke(); ctx.restore(); }

// Supply–demand panel shared by steps 0–3: Q (tonnes) across, yuan per tonne up.
function market(ctx, W, top, bottom, ttl) {
  return panel(ctx, W, { top, bottom, xMin: 0, xMax: 80, yMin: 0, yMax: 140, yTicks: [0, 40, 80, 120], xStep: 10, title: ttl });
}

/* ---------- animation runner ---------- */
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

/* ---------- step 0: the private market ---------- */
const s0 = { trail: new Set() };
function draw0() {
  const Q = num('q0'), p = M.BASE, Qm = M.marketQ(), Pm = M.marketP();
  s0.trail.add(Q); $('q0v').textContent = Q;
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = market(ctx, W, 26, 220, t('c0a'));
  band(ctx, A, q => M.MB(q), q => M.MPC(q), 0, Math.min(Q, Qm), 'rgba(126,226,168,0.4)');
  if (Q > Qm) band(ctx, A, q => M.MPC(q), q => M.MB(q), Qm, Q, 'rgba(255,122,147,0.45)');
  line(ctx, A, q => M.MB(q), 0, 80, C.cyan); line(ctx, A, q => M.MPC(q), 0, 80, C.orange);
  vline(ctx, A, Q, C.text, [], 1.4);
  dot(ctx, A.x(Qm), A.y(Pm), 5, C.text);
  const B = panel(ctx, W, { top: 264, bottom: H - 26, xMin: 0, xMax: 80, yMin: 0, yMax: 1800, yTicks: [0, 800, 1600], xStep: 10, left: 46, title: t('c0b') });
  line(ctx, B, q => M.privateSurplus(q), 0, 80, 'rgba(232,237,244,0.35)', 1.4, [4, 4]);
  for (const q of s0.trail) dot(ctx, B.x(q), B.y(M.privateSurplus(q)), 3.6, C.text);
  ring(ctx, B.x(Q), B.y(M.privateSurplus(Q)), 7, C.cyan);
  const last = Q > 0 ? M.unitGain(Q) : 0;
  $('out0').textContent = t('s0readout', { q: Q, mb: fmt(M.MB(Q)), mpc: fmt(M.MPC(Q)), g: fmt(last), s: fmt(M.privateSurplus(Q)) }) + ' ' +
    t('s0market', { qm: fmt(Qm), pm: fmt(Pm), cs: fmt(M.consumerSurplus()), ps: fmt(M.producerSurplus()), smax: fmt(M.privateSurplus(Qm)) });
}

/* ---------- step 1: the external cost ---------- */
function draw1() {
  const e = num('e1'), Qm = M.marketQ(), Qs = M.socialQ(e);
  $('e1v').textContent = e;
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = market(ctx, W, 26, 220, t('c1a'));
  band(ctx, A, q => M.MSC(q, e), q => M.MPC(q), 0, Qm, hatch(ctx));
  line(ctx, A, q => M.MB(q), 0, 80, C.cyan); line(ctx, A, q => M.MPC(q), 0, 80, C.orange); line(ctx, A, q => M.MSC(q, e), 0, 80, C.pink, 2.2, [7, 5]);
  dot(ctx, A.x(Qm), A.y(M.MB(Qm)), 5, C.text); dot(ctx, A.x(Qs), A.y(M.MB(Qs)), 5, C.green);
  const B = panel(ctx, W, { top: 264, bottom: H - 26, xMin: 0, xMax: 80, yMin: -40, yMax: 80, yTicks: [-40, 0, 40, 80], xStep: 10, title: t('c1b') });
  const bw = Math.max(1, (B.x(1) - B.x(0)) * 0.8);
  let red = 0;
  for (let q = 1; q <= Math.round(Qm); q++) {
    const g = M.unitGain(q, e); if (g < 0) red -= g;
    ctx.fillStyle = g >= 0 ? C.green : C.pink; ctx.globalAlpha = 0.85;
    ctx.fillRect(B.x(q - 0.5) - bw / 2, Math.min(B.y(g), B.y(0)), bw, Math.max(1, Math.abs(B.y(g) - B.y(0))));
  }
  ctx.globalAlpha = 1;
  $('out1').textContent = t('s1readout', { e, qm: fmt(Qm), qs: fmt(Qs), dm: fmt(M.damage(Qm, e)), ds: fmt(M.damage(Qs, e)), wm: fmt(M.welfare(Qm, e)), ws: fmt(M.welfare(Qs, e)), red: fmt(red), n: Math.max(0, Math.round(Qm - Qs)) });
}

/* ---------- step 2: deadweight loss ---------- */
const s2 = { pts: [], ds: new Set([1]) };
function draw2() {
  const e = num('e2'), d = num('d2'), p = { ...M.BASE, d }, Qm = M.marketQ(p), Qs = M.socialQ(e, p), L = M.deadweight(e, p);
  s2.ds.add(d); if (!s2.pts.some(q => q.e === e && q.d === d)) s2.pts.push({ e, d, L });
  $('e2v').textContent = e; $('d2v').textContent = d.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = market(ctx, W, 26, 220, t('c2a', { d: d.toFixed(1) }));
  band(ctx, A, q => M.MSC(q, e, p), q => M.MB(q, p), Qs, Qm, 'rgba(255,122,147,0.5)');
  line(ctx, A, q => M.MB(q, p), 0, 80, C.cyan); line(ctx, A, q => M.MPC(q, p), 0, 80, C.orange); line(ctx, A, q => M.MSC(q, e, p), 0, 80, C.pink, 2.2, [7, 5]);
  dot(ctx, A.x(Qm), A.y(M.MB(Qm, p)), 5, C.text); dot(ctx, A.x(Qs), A.y(M.MB(Qs, p)), 5, C.green);
  const B = panel(ctx, W, { top: 264, bottom: H - 26, xMin: 0, xMax: 40, yMin: 0, yMax: 650, yTicks: [0, 200, 400, 600], xStep: 5, left: 44, title: t('c2b') });
  for (const dd of s2.ds) if (Math.abs(dd - d) > 1e-9) line(ctx, B, x => M.deadweightFormula(x, { ...M.BASE, d: dd }), 0, 40, C.raw, 1.4);
  line(ctx, B, x => M.deadweightFormula(x, p), 0, 40, C.text, 2.2);
  for (const q of s2.pts) dot(ctx, B.x(q.e), B.y(q.L), 3.2, Math.abs(q.d - d) < 1e-9 ? C.text : C.raw);
  ring(ctx, B.x(e), B.y(L), 7, C.pink);
  const half = M.deadweightFormula(e / 2, p);
  $('out2').textContent = t('s2readout', { e, d: d.toFixed(1), qm: fmt(Qm), qs: fmt(Qs), gap: fmt(Qm - Qs, 2), L: fmt(L, 1), half: fmt(half, 1), eh: fmt(e / 2) });
}

/* ---------- step 3: Pigouvian tax ---------- */
const s3 = { trail: new Map() };
function draw3() {
  const e = num('e3'), tax = num('t3'), Qt = M.taxedQ(tax), Qs = M.socialQ(e), W3 = M.taxWelfare(tax, e), Wbest = M.taxWelfare(e, e);
  s3.trail.set(tax, W3);
  $('e3v').textContent = e; $('t3v').textContent = tax;
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = market(ctx, W, 26, 220, t('c3a'));
  ctx.save(); clipTo(ctx, A); ctx.fillStyle = 'rgba(255,180,84,0.32)'; ctx.fillRect(A.x(0), A.y(M.MPC(Qt) + tax), A.x(Qt) - A.x(0), A.y(M.MPC(Qt)) - A.y(M.MPC(Qt) + tax)); ctx.restore();
  if (Qt > Qs) band(ctx, A, q => M.MSC(q, e), q => M.MB(q), Qs, Qt, 'rgba(255,122,147,0.5)');
  else band(ctx, A, q => M.MB(q), q => M.MSC(q, e), Qt, Qs, 'rgba(255,122,147,0.5)');
  line(ctx, A, q => M.MB(q), 0, 80, C.cyan); line(ctx, A, q => M.MPC(q), 0, 80, C.orange);
  line(ctx, A, q => M.MSC(q, e), 0, 80, C.pink, 2.2, [7, 5]); line(ctx, A, q => M.MPC(q) + tax, 0, 80, C.cyan, 1.8, [3, 4]);
  dot(ctx, A.x(Qt), A.y(M.MB(Qt)), 5, C.text); dot(ctx, A.x(Qs), A.y(M.MB(Qs)), 4, C.green);
  // y range follows the current e so the hill is visible (W varies by a few hundred yuan across t)
  let wLo = Infinity, wHi = -Infinity; for (let x = 0; x <= 60; x++) { const w = M.taxWelfare(x, e); wLo = Math.min(wLo, w); wHi = Math.max(wHi, w); }
  const yLo = Math.max(0, Math.floor((wLo - 50) / 100) * 100), yHi = Math.ceil((wHi + 50) / 100) * 100, ys = yHi - yLo > 800 ? 400 : 200, yt = [];
  for (let v = Math.ceil(yLo / ys) * ys; v <= yHi; v += ys) yt.push(v);
  const B = panel(ctx, W, { top: 264, bottom: H - 26, xMin: 0, xMax: 60, yMin: yLo, yMax: yHi, yTicks: yt, xStep: 10, left: 46, title: t('c3b', { e }) });
  vline(ctx, B, M.bestTax(e), C.green);
  line(ctx, B, x => M.taxWelfare(x, e), 0, 60, 'rgba(232,237,244,0.35)', 1.4, [4, 4]);
  for (const [x, w] of s3.trail) dot(ctx, B.x(x), B.y(w), 3.4, C.text);
  ring(ctx, B.x(tax), B.y(W3), 7, C.cyan);
  const side = Math.abs(tax - e) < 1e-9 ? t('s3exact') : t(tax < e ? 's3low' : 's3high');
  $('out3').textContent = t('s3readout', { t: tax, q: fmt(Qt), qs: fmt(Qs), w: fmt(W3), wb: fmt(Wbest), loss: fmt(Wbest - W3), rev: fmt(M.taxRevenue(tax)), e }) + ' ' + side;
}

/* ---------- step 4: the commons ---------- */
const s4 = { m: 5, path: M.commonsPath(5), idx: 0 };
const HCOL = ['#67d7f9', '#9fb4cc'];
function draw4() {
  const m = s4.m, P = s4.path, st = P[s4.idx], rounds = (P.length - 1) / m;
  $('m4v').textContent = m;
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 190, xMin: 0.4, xMax: m + 0.6, yMin: 0, yMax: 45, yTicks: [0, 20, 40], xStep: m > 12 ? 2 : 1, title: t('c4a') });
  const bw = Math.min(46, (A.x(1) - A.x(0)) * 0.6);
  st.n.forEach((v, i) => { ctx.fillStyle = i === st.who ? C.orange : C.xs; ctx.globalAlpha = 0.9; ctx.fillRect(A.x(i + 1) - bw / 2, A.y(v), bw, A.y(0) - A.y(v)); ctx.globalAlpha = 1; });
  const B = panel(ctx, W, { top: 234, bottom: H - 26, xMin: 0, xMax: rounds, yMin: 30, yMax: 85, yTicks: [40, 60, 80], title: t('c4b') });
  hline(ctx, B, M.commonsOpt(), C.green); hline(ctx, B, M.commonsEq(m), C.orange);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let i = 0; i <= s4.idx; i++) { const X = B.x(i / m), Y = B.y(P[i].N); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  dot(ctx, B.x(s4.idx / m), B.y(st.N), 5, C.cyan);
  const eqN = M.commonsEq(m), share = M.totalProfit(eqN) / M.totalProfit(M.commonsOpt());
  const r = Math.floor(s4.idx / m), k = s4.idx;
  let why = '';
  if (m > 1) { const i = st.who >= 0 ? st.who : 0, x = M.extraCow(st.n[i], st.N); why = ' ' + t('s4why', { i: i + 1, own: fmt(x.own, 1), all: fmt(x.all, 1), oth: fmt(x.othersLoss, 1) }); }
  $('play4').disabled = $('step4b').disabled = s4.idx >= P.length - 1;
  $('out4').textContent = t('s4readout', { r, R: rounds, k, K: P.length - 1, N: fmt(st.N, 1), per: fmt(M.net(st.N), 1), tot: fmt(M.totalProfit(st.N), 0), opt: fmt(M.totalProfit(M.commonsOpt()), 0) }) + ' ' +
    t('s4eq', { m, eq: fmt(eqN, 1), sh: Math.round(share * 100) }) + why;
}

/* ---------- step 5: Coase bargaining ---------- */
function coaseMap(canvas, right, G, D, T, ttl) {
  const { ctx, W, H } = fitCanvas(canvas);
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 100, yMin: 0, yMax: 100, yTicks: [0, 50, 100], xStep: 25, title: ttl });
  const s = 2;
  for (let g = 0; g < 100; g += s) for (let d = 0; d < 100; d += s) {
    const o = M.coase(g + s / 2, d + s / 2, T, right);
    ctx.fillStyle = o.pollute ? 'rgb(115,64,81)' : 'rgb(54,95,82)'; // opaque, so neighbouring cells do not draw seams
    const X0 = A.x(g), X1 = A.x(g + s), Y0 = A.y(d + s), Y1 = A.y(d);
    ctx.fillRect(X0, Y0, X1 - X0 + 0.5, Y1 - Y0 + 0.5);
  }
  // the stuck band: a better outcome exists but the gain is not larger than the cost of making a deal
  ctx.save(); clipTo(ctx, A); ctx.fillStyle = hatch(ctx); ctx.beginPath();
  if (right === 'factory') { ctx.moveTo(A.x(0), A.y(0)); ctx.lineTo(A.x(100), A.y(100)); ctx.lineTo(A.x(100 - T), A.y(100)); ctx.lineTo(A.x(0), A.y(T)); }
  else { ctx.moveTo(A.x(0), A.y(0)); ctx.lineTo(A.x(100), A.y(100)); ctx.lineTo(A.x(100), A.y(100 - T)); ctx.lineTo(A.x(T), A.y(0)); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.5)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(0), A.y(0)); ctx.lineTo(A.x(100), A.y(100)); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(G), A.y(D), 6, C.text);
}
function draw5() {
  const G = num('g5'), D = num('dm5'), T = num('tc5');
  $('g5v').textContent = G; $('dm5v').textContent = D; $('tc5v').textContent = T;
  coaseMap($('c5'), 'factory', G, D, T, t('c5a'));
  coaseMap($('c5b'), 'fishery', G, D, T, t('c5b'));
  const eff = G > D ? t('s5effPol', { G, D }) : G < D ? t('s5effClean', { G, D }) : t('s5effTie', { G });
  const say = right => {
    const o = M.coase(G, D, T, right), who = t(right === 'factory' ? 'rFactory' : 'rFishery');
    const what = t(o.pollute ? 'outPol' : 'outClean');
    const how = o.deal ? t(o.payer === 'fishery' ? 'dealFishPays' : 'dealFactPays', { pay: fmt(o.pay), T }) : (G !== D && !o.matchesEfficient ? t('stuck', { gap: Math.abs(G - D), T }) : t('noNeed'));
    return t('s5case', { who, what, how, f: fmt(o.factory), s: fmt(o.fishery), tot: fmt(o.total) });
  };
  $('out5').textContent = eff + ' ' + say('factory') + ' ' + say('fishery');
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('q0').addEventListener('input', draw0);
  $('clear0').addEventListener('click', () => { s0.trail.clear(); draw0(); });
  $('e1').addEventListener('input', draw1);
  ['e2', 'd2'].forEach(id => $(id).addEventListener('input', draw2));
  $('clear2').addEventListener('click', () => { s2.pts = []; s2.ds = new Set(); draw2(); });
  $('e3').addEventListener('input', () => { s3.trail.clear(); draw3(); });
  $('t3').addEventListener('input', draw3);
  $('clear3').addEventListener('click', () => { s3.trail.clear(); draw3(); });

  $('m4').addEventListener('input', () => { stopAnim('s4'); s4.m = num('m4'); s4.path = M.commonsPath(s4.m); s4.idx = 0; draw4(); });
  $('play4').addEventListener('click', () => {
    const from = s4.idx, to = s4.path.length - 1;
    animate('s4', 6000 * (to - from) / to, p => { s4.idx = from + Math.round((to - from) * p); draw4(); });
  });
  $('step4b').addEventListener('click', () => { stopAnim('s4'); s4.idx = Math.min(s4.path.length - 1, s4.idx + s4.m); draw4(); });
  $('reset4').addEventListener('click', () => { stopAnim('s4'); s4.idx = 0; draw4(); });

  ['g5', 'dm5', 'tc5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshExternalities = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
