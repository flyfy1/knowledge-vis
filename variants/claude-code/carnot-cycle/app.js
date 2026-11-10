'use strict';
// Carnot cycle lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.CARNOT_MODEL (model.js). Canvas text is limited to
// panel titles (own row) and axis ticks whose spacing is chosen from the measured label width.
(function () {

const $ = id => document.getElementById(id);
const M = window.CARNOT_MODEL;
const t = (...a) => window.CARNOT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', dim: '#6f8096' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (so 90 stays 90). −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d); };
const sgn = (v, d) => (v > 0 && fix(v, d) !== fix(0, d) ? '+' : '') + fix(v, d);

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
// Linear ticks: smallest 1-2-5 step whose spacing clears minPx.
function ticks(min, max, px, minPx) {
  const span = max - min; let step = span;
  if (!(px > 0) || !(span > 0)) return [];
  for (let e = Math.floor(Math.log10(span)) - 3; e <= Math.floor(Math.log10(span)) + 1; e++) { let found = false; for (const m of [1, 2, 5]) { const s = m * Math.pow(10, e); if (s / span * px >= minPx) { step = s; found = true; break; } } if (found) break; }
  const out = []; for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
  return out;
}
// Plot panel. Title in its own row above the plot; y labels left of it, x labels below it.
// o: top, bottom, xMin, xMax, yMin, yMax, title, yLog, yTickList, xFmt, yFmt
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const yF = o.yFmt || (v => fmt(v)), xF = o.xFmt || (v => fmt(v));
  const ly = o.yLog ? (v => Math.log10(v)) : (v => v);
  const plotH = o.bottom - o.top;
  const yT = o.yTickList || ticks(o.yMin, o.yMax, plotH, 24);
  const left = o.left || (yT.length ? Math.max(...yT.map(v => ctx.measureText(yF(v)).width)) + 14 : 14);
  const P = { l: left, r: W - 14, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (ly(v) - ly(o.yMin)) / (ly(o.yMax) - ly(o.yMin)) * (P.b - P.t);
  ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of yT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yF(v), P.l - 6, y(v) + 4);
  }
  // x ticks: spacing must clear the widest label plus a gap
  const probe = [o.xMin, o.xMax, (o.xMin + o.xMax) / 2].map(v => ctx.measureText(xF(v)).width + 12);
  const xT = ticks(o.xMin, o.xMax, P.r - P.l, Math.max(28, ...probe));
  ctx.textAlign = 'center';
  for (const v of xT) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    const lab = xF(v), w = ctx.measureText(lab).width, X = Math.min(Math.max(x(v), w / 2 + 2), W - w / 2 - 2);
    ctx.fillText(lab, X, P.b + 16);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function path(ctx, pts, color, lw, dash) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5.5) { ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function clipRect(ctx, P) { ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); }
const LEGCOL = [C.pink, C.orange, C.cyan, C.orange];
// Sample a stretch u ∈ [u0, u1] of the cycle as canvas points.
function cyclePts(cy, u0, u1, m, kind = 'pV', S0 = 0) {
  const out = [], n = Math.max(2, Math.ceil((u1 - u0) * 90));
  for (let i = 0; i <= n; i++) { const q = M.pointAt(cy, Math.min(3.999999, u0 + (u1 - u0) * i / n)); out.push(kind === 'pV' ? [m.x(q.V), m.y(q.p)] : [m.x(q.S - S0), m.y(q.T)]); }
  return out;
}
function legOf(u) { return u >= 4 ? t('legDone') : t('leg' + Math.min(3, Math.floor(u))); }

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); const d = anims[name].done; delete anims[name]; if (d) d(true); } }
function stopAll() { Object.keys(anims).forEach(stopAnim); }

/* ---------- step 0: work as area under an isotherm ---------- */
function draw0() {
  const T = num('T0'), r = num('r0'), N = num('N0'), V2 = M.V1 * r;
  $('T0v').textContent = String(T); $('r0v').textContent = r.toFixed(1); $('N0v').textContent = String(N);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 0, xMax: 45, yMin: 0, yMax: 800, title: t('c0a') });
  const p = V => M.pressure(V, T);
  ctx.save(); clipRect(ctx, A.P);
  // shaded exact area
  ctx.fillStyle = 'rgba(126,226,168,0.28)'; ctx.beginPath(); ctx.moveTo(A.x(M.V1), A.y(0));
  for (let i = 0; i <= 120; i++) { const V = M.V1 + (V2 - M.V1) * i / 120; ctx.lineTo(A.x(V), A.y(p(V))); }
  ctx.lineTo(A.x(V2), A.y(0)); ctx.closePath(); ctx.fill();
  // strips (midpoint rule)
  const d = (V2 - M.V1) / N;
  for (let i = 0; i < N; i++) {
    const a = M.V1 + i * d, h = p(a + d / 2);
    ctx.fillStyle = 'rgba(255,180,84,0.16)'; ctx.fillRect(A.x(a), A.y(h), A.x(a + d) - A.x(a), A.y(0) - A.y(h));
    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2; ctx.strokeRect(A.x(a), A.y(h), A.x(a + d) - A.x(a), A.y(0) - A.y(h));
  }
  const curve = []; for (let i = 0; i <= 300; i++) { const V = 1 + 44 * i / 300; curve.push([A.x(V), A.y(p(V))]); }
  path(ctx, curve, C.pink, 2.4);
  ctx.restore();
  dot(ctx, A.x(M.V1), A.y(p(M.V1)), C.text, 4.5); dot(ctx, A.x(V2), A.y(p(V2)), C.text, 4.5);
  const Wx = M.isoWork(T, M.V1, V2), S = M.stripSum(p, M.V1, V2, N);
  $('out0').textContent = t('s0readout', { T, V2: fmt(V2, 1), W: Wx.toFixed(0), N, S: S.toFixed(0), err: fix(100 * (S - Wx) / Wx, 2) });
}

/* ---------- step 1: going round — running net work ---------- */
const R1 = 2;
function draw1() {
  const Th = num('Th1'), Tc = num('Tc1'), pct = num('P1'), u = 4 * pct / 100, cy = M.cycle(Th, Tc, R1);
  $('Th1v').textContent = String(Th); $('Tc1v').textContent = String(Tc); $('P1v').textContent = pct + '%';
  const ax = M.axisFor(Th, R1);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 30, bottom: 230, xMin: 0, xMax: Math.ceil(ax.Vmax * 1.05 / 10) * 10, yMin: 0, yMax: Math.ceil(ax.pmax * 1.08 / 100) * 100, title: t('c1a') });
  ctx.save(); clipRect(ctx, A.P);
  // enclosed loop (net work)
  const loop = cyclePts(cy, 0, 4, A);
  ctx.fillStyle = 'rgba(126,226,168,0.22)'; ctx.beginPath(); loop.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.closePath(); ctx.fill();
  const iso = T => { const o = []; for (let i = 0; i <= 200; i++) { const V = 4 + (ax.Vmax * 1.1 - 4) * i / 200; o.push([A.x(V), A.y(M.pressure(V, T))]); } return o; };
  path(ctx, iso(Th), C.pink, 1.4, [6, 5]); path(ctx, iso(Tc), C.cyan, 1.4, [6, 5]);
  if (u > 0) path(ctx, cyclePts(cy, 0, Math.min(u, 4), A), C.orange, 3);
  ctx.restore();
  const q = M.pointAt(cy, Math.min(u, 3.999999)), qq = u >= 4 ? M.pointAt(cy, 0) : q;
  dot(ctx, A.x(qq.V), A.y(qq.p), C.text);
  // bottom: running work vs progress, fixed y range for this Th
  const worst = M.cycle(Th, 250, R1), yMax = Math.ceil((worst.legs[0].W + worst.legs[1].W) * 1.08 / 1000) * 1000;
  const B = panel(ctx, W, { top: 282, bottom: H - 28, xMin: 0, xMax: 100, yMin: 0, yMax, title: t('c1b'), xFmt: v => fmt(v) + '%' });
  ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.axis;
  [25, 50, 75].forEach(v => { ctx.beginPath(); ctx.moveTo(B.x(v), B.P.t); ctx.lineTo(B.x(v), B.P.b); ctx.stroke(); });
  ctx.restore();
  const full = [], done = [];
  for (let i = 0; i <= 400; i++) { const uu = 4 * i / 400, pt = [B.x(100 * uu / 4), B.y(M.cumWork(cy, uu))]; full.push(pt); if (uu <= u + 1e-9) done.push(pt); }
  path(ctx, full, C.dim, 1.2, [4, 4]);
  if (done.length > 1) path(ctx, done, C.orange, 2.6);
  path(ctx, [[B.x(0), B.y(cy.W)], [B.x(100), B.y(cy.W)]], C.green, 1.2, [6, 4]);
  const Wc = M.cumWork(cy, u);
  dot(ctx, B.x(pct), B.y(Wc), C.text);
  $('out1').textContent = t('s1readout', { pct, leg: legOf(u), Wc: Wc.toFixed(0), W: cy.W.toFixed(0), A: M.loopArea(cy, 1500).toFixed(0), W0: fix(M.isoWork(Th, M.V1, R1 * M.V1) + M.isoWork(Th, R1 * M.V1, M.V1), 0) });
}

/* ---------- step 2: heat in, heat out — p–V and T–S together ---------- */
const s2 = { u: 0, playing: false };
function draw2() {
  const Th = num('Th2'), Tc = num('Tc2'), r = num('r2'), cy = M.cycle(Th, Tc, r), u = s2.u;
  $('Th2v').textContent = String(Th); $('Tc2v').textContent = String(Tc); $('r2v').textContent = r.toFixed(1);
  $('play2').textContent = t(s2.playing ? 'pause' : 'play');
  const ax = M.axisFor(Th, r);
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 0, xMax: Math.ceil(ax.Vmax * 1.05 / 10) * 10, yMin: 0, yMax: Math.ceil(ax.pmax * 1.08 / 100) * 100, title: t('c2a') });
  const S0 = cy.S[0];
  const drawLoop = (m, kind) => {
    ctx.save(); clipRect(ctx, m.P);
    const loop = cyclePts(cy, 0, 4, m, kind, S0);
    ctx.fillStyle = 'rgba(126,226,168,0.2)'; ctx.beginPath(); loop.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 4; k++) {
      path(ctx, cyclePts(cy, k, k + 1, m, kind, S0), LEGCOL[k], 1.3, [5, 4]);
      if (u > k) path(ctx, cyclePts(cy, k, Math.min(u, k + 1), m, kind, S0), LEGCOL[k], 3.2);
    }
    ctx.restore();
    const q = u >= 4 ? M.pointAt(cy, 0) : M.pointAt(cy, u);
    if (kind === 'pV') dot(ctx, m.x(q.V), m.y(q.p), C.text); else dot(ctx, m.x(q.S - S0), m.y(q.T), C.text);
    return q;
  };
  const q = drawLoop(A, 'pV');
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 0, xMax: 10, yMin: 0, yMax: 1000, title: t('c2b') });
  drawLoop(B, 'TS');
  // ledger table
  const cur = u >= 4 ? -1 : Math.floor(u);
  const row = (cells, cls) => `<tr${cls ? ` class="${cls}"` : ''}>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  const sum = cy.legs.reduce((s, l) => ({ Q: s.Q + l.Q, W: s.W + l.W, dU: s.dU + l.dU }), { Q: 0, W: 0, dU: 0 });
  $('ledger2').innerHTML = `<thead><tr><th>${t('thLeg')}</th><th>${t('thQ')}</th><th>${t('thW')}</th><th>${t('thU')}</th></tr></thead><tbody>` +
    cy.legs.map((l, k) => row([t('leg' + k), fix(l.Q, 0), fix(l.W, 0), fix(l.dU, 0)], k === cur ? 'now' : '')).join('') +
    row([t('rowSum'), fix(sum.Q, 0), fix(sum.W, 0), fix(sum.dU, 0)], 'sum') + '</tbody>';
  const prog = t('s2progress', { c: Math.min(4, Math.floor(u + 1e-9)) });
  $('out2').textContent = t('s2readout', { prog, leg: legOf(u), T: q.T.toFixed(0), V: q.V.toFixed(1), p: q.p.toFixed(0), Qh: cy.Qh.toFixed(0), Qc: cy.Qc.toFixed(0), W: cy.W.toFixed(0), A: ((cy.Th - cy.Tc) * (cy.S[1] - cy.S[0])).toFixed(0) });
}
function run2(target, ms) {
  const from = s2.u; s2.playing = true; draw2();
  animate('s2', ms, p => { s2.u = from + (target - from) * p; draw2(); }, () => { s2.playing = false; draw2(); });
}

/* ---------- step 3: efficiency vs temperature ratio ---------- */
const s3 = { rec: new Map() };
function draw3() {
  const Th = num('Th3'), Tc = num('Tc3'), r = num('r3'), cy = M.cycle(Th, Tc, r);
  $('Th3v').textContent = String(Th); $('Tc3v').textContent = String(Tc); $('r3v').textContent = r.toFixed(1);
  s3.rec.set(`${Th}|${Tc}|${r}`, { x: Tc / Th, eta: cy.W / cy.Qh });
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: 130, xMin: 0, xMax: 9000, yMin: 0, yMax: 2, yTickList: [], title: t('c3a') });
  const bar = (row, a, b, col) => { const y0 = A.y(2 - row) + 8, y1 = A.y(1 - row) - 8; ctx.fillStyle = col; ctx.fillRect(A.x(a), y0, A.x(b) - A.x(a), y1 - y0); ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(A.x(a), y0, A.x(b) - A.x(a), y1 - y0); };
  bar(0, 0, cy.Qh, C.orange); bar(1, 0, cy.W, C.green); bar(1, cy.W, cy.W + cy.Qc, C.cyan);
  const B = panel(ctx, W, { top: 182, bottom: H - 28, xMin: 0.2, xMax: 1, yMin: 0, yMax: 80, title: t('c3b'), yFmt: v => fmt(v) + '%' });
  path(ctx, [[B.x(0.2), B.y(80)], [B.x(1), B.y(0)]], C.pink, 2);
  s3.rec.forEach((d, k) => { if (k !== `${Th}|${Tc}|${r}`) dot(ctx, B.x(d.x), B.y(100 * d.eta), C.text, 4); });
  dot(ctx, B.x(Tc / Th), B.y(100 * cy.eta), C.cyan, 6.5);
  $('out3').textContent = t('s3readout', { Qh: cy.Qh.toFixed(0), W: cy.W.toFixed(0), Qc: cy.Qc.toFixed(0), eta: fix(100 * cy.W / cy.Qh, 1), Tc, Th, etaC: fix(100 * M.carnotEta(Th, Tc), 1), n: s3.rec.size });
}

/* ---------- step 4: the entropy test for a claimed engine ---------- */
const s4 = { eta: 0.4 };
function verdict(tot) { return Math.abs(tot) < 1e-9 ? 'vLimit' : tot > 0 ? 'vPossible' : 'vImpossible'; }
function draw4() {
  const Th = num('Th4'), Tc = num('Tc4'), eta = s4.eta, L = M.ledger(Th, Tc, eta), etaC = M.carnotEta(Th, Tc);
  $('Th4v').textContent = String(Th); $('Tc4v').textContent = String(Tc); $('E4v').textContent = fmt(100 * eta, 2) + '%';
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: 130, xMin: 0, xMax: 1000, yMin: 0, yMax: 2, yTickList: [], title: t('c4a') });
  const bar = (row, a, b, col) => { const y0 = A.y(2 - row) + 8, y1 = A.y(1 - row) - 8; ctx.fillStyle = col; ctx.fillRect(A.x(a), y0, A.x(b) - A.x(a), y1 - y0); ctx.strokeStyle = C.bg; ctx.strokeRect(A.x(a), y0, A.x(b) - A.x(a), y1 - y0); };
  bar(0, 0, 1000, C.orange); bar(1, 0, L.W, C.green); bar(1, L.W, 1000, C.cyan);
  path(ctx, [[A.x(1000 * etaC), A.P.t], [A.x(1000 * etaC), A.P.b]], C.pink, 2, [5, 4]);
  const B = panel(ctx, W, { top: 182, bottom: H - 28, xMin: 0, xMax: 3, yMin: -2.5, yMax: 4.5, title: t('c4b'), xFmt: () => '' });
  const col = (i, v, c) => { const X0 = B.x(i + 0.22), X1 = B.x(i + 0.78), Y0 = B.y(0), Y1 = B.y(v); ctx.fillStyle = c; ctx.fillRect(X0, Math.min(Y0, Y1), X1 - X0, Math.max(2, Math.abs(Y1 - Y0))); };
  col(0, L.dSh, C.orange); col(1, L.dSc, C.cyan); col(2, L.total, C.text);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(B.P.l, B.y(0)); ctx.lineTo(B.P.r, B.y(0)); ctx.stroke(); ctx.restore();
  $('out4').textContent = t('s4readout', { eta: fmt(100 * eta, 2), etaC: fmt(100 * etaC, 2), W: L.W.toFixed(0), Qc: L.Qc.toFixed(0), dSh: sgn(L.dSh, 3), dSc: sgn(L.dSc, 3), tot: sgn(L.total, 3), verdict: t(verdict(L.total)) });
}

/* ---------- step 5: reversed cycle — refrigerator and heat pump ---------- */
const s5 = { mode: 'fridge' };
function draw5() {
  const tc = num('tc5'), th = num('th5'), Tc = M.C2K(tc), Th = M.C2K(th), fr = s5.mode === 'fridge';
  $('tc5v').textContent = String(tc); $('th5v').textContent = String(th);
  $('fridge5').setAttribute('aria-pressed', fr); $('pump5').setAttribute('aria-pressed', !fr);
  const Qc = 1000 * M.copFridge(Th, Tc), Qh = Qc + 1000, cop = fr ? M.copFridge(Th, Tc) : M.copPump(Th, Tc);
  const { ctx, W, H } = fitCanvas($('c5'));
  const xMax = Math.ceil(Qh * 1.05 / 5000) * 5000;
  const A = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax, yMin: 0, yMax: 3, yTickList: [], title: t('c5a') });
  const bar = (row, v, c, useful) => { const y0 = A.y(3 - row) + 6, y1 = A.y(2 - row) - 6; ctx.fillStyle = c; ctx.fillRect(A.x(0), y0, A.x(v) - A.x(0), y1 - y0); if (useful) { ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(A.x(0), y0, A.x(v) - A.x(0), y1 - y0); } };
  bar(0, 1000, C.green, false); bar(1, Qc, C.cyan, fr); bar(2, Qh, C.orange, !fr);
  const B = panel(ctx, W, { top: 202, bottom: H - 28, xMin: -30, xMax: 15, yMin: 1, yMax: 100, yLog: true, yTickList: [1, 2, 5, 10, 20, 50, 100], title: t('c5b', { th }) });
  const curve = f => { const o = []; for (let i = 0; i <= 200; i++) { const c = -30 + 45 * i / 200; o.push([B.x(c), B.y(Math.min(100, f(M.C2K(th), M.C2K(c))))]); } return o; };
  path(ctx, curve(fr ? M.copPump : M.copFridge), C.dim, 1.5, [5, 4]);
  path(ctx, curve(fr ? M.copFridge : M.copPump), C.text, 2.4);
  dot(ctx, B.x(tc), B.y(cop), C.cyan, 6);
  $('out5').textContent = t('s5readout', { mode: t(fr ? 'modeFridge' : 'modePump'), tc, TcK: fix(Tc, 2), th, ThK: fix(Th, 2), dT: String(th - tc), Qc: Qc.toFixed(0), Qh: Qh.toFixed(0), cop: fix(cop, 2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['T0', 'r0', 'N0'].forEach(id => $(id).addEventListener('input', draw0));
  ['Th1', 'Tc1', 'P1'].forEach(id => $(id).addEventListener('input', draw1));
  ['Th2', 'Tc2', 'r2'].forEach(id => $(id).addEventListener('input', draw2));
  $('play2').addEventListener('click', () => {
    if (s2.playing) { stopAnim('s2'); return; }
    if (s2.u >= 4) s2.u = 0;
    run2(4, (4 - s2.u) * 2000);
  });
  $('next2').addEventListener('click', () => { stopAnim('s2'); if (s2.u >= 4) s2.u = 0; run2(Math.min(4, Math.floor(s2.u + 1e-9) + 1), 1500); });
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.u = 0; s2.playing = false; draw2(); });
  ['Th3', 'Tc3', 'r3'].forEach(id => $(id).addEventListener('input', draw3));
  $('clear3').addEventListener('click', () => { s3.rec.clear(); draw3(); });
  ['Th4', 'Tc4'].forEach(id => $(id).addEventListener('input', draw4));
  $('E4').addEventListener('input', () => { s4.eta = num('E4') / 100; draw4(); });
  $('carnot4').addEventListener('click', () => { s4.eta = M.carnotEta(num('Th4'), num('Tc4')); $('E4').value = String(Math.round(s4.eta * 200) / 2); draw4(); });
  ['tc5', 'th5'].forEach(id => $(id).addEventListener('input', draw5));
  $('fridge5').addEventListener('click', () => { s5.mode = 'fridge'; draw5(); });
  $('pump5').addEventListener('click', () => { s5.mode = 'pump'; draw5(); });
  s4.eta = num('E4') / 100;

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  window.refreshCarnot = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
