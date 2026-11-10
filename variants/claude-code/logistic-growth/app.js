'use strict';
// Population Growth (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, count and classification comes from window.POP_MODEL (model.js).
// Canvas text is limited to panel titles (their own row) and axis ticks.
(function () {

const $ = id => document.getElementById(id);
const M = window.POP_MODEL;
const t = (...a) => window.POP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#5d6f85', k: '#e8edf4' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(c => SUP[c]).join('');
function sci(x) {
  if (x === 0) return '0';
  if (x >= 0.01 && x < 1e6) return x >= 100 ? Math.round(x).toLocaleString('en-US') : fmt(x, 2);
  const e = Math.floor(Math.log10(x)); let m = x / Math.pow(10, e);
  if (Number(m.toFixed(1)) >= 10) return sci(Number((x).toPrecision(2)));
  return `${fmt(m, 1)} × 10${sup(e)}`;
}
function massText(g) {
  if (g < 1000) return t('unit_g', { v: sci(g) });
  if (g < 1e6) return t('unit_kg', { v: sci(g / 1000) });
  return t('unit_t', { v: sci(g / 1e6) });
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
function label(ctx, text, X, Y, maxW, { align = 'left', size = 12, weight = 600, color = C.text } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Plot panel with ticks given as [value, text] or numbers; title in its own row.
function panel(ctx, W, H, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top || 30, b: H - (o.bottom || 26) };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const tk of o.yTicks) { const [v, s] = Array.isArray(tk) ? tk : [tk, fmt(tk)]; ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(s, P.l - 5, y(v) + 4); }
  ctx.textAlign = 'center';
  for (const tk of o.xTicks || []) { const [v, s] = Array.isArray(tk) ? tk : [tk, fmt(tk)]; ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(s, x(v), P.b + 15); }
  ctx.restore();
  label(ctx, o.title, 8, 17, W - 16);
  return { x, y, P };
}
function clipTo(ctx, A) { ctx.save(); ctx.beginPath(); ctx.rect(A.P.l, A.P.t - 1, A.P.r - A.P.l, A.P.b - A.P.t + 2); ctx.clip(); }
function curve(ctx, A, f, x0, x1, color, w = 2.5, dash = null, n = 240) {
  clipTo(ctx, A); ctx.strokeStyle = color; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n; let yy = A.y(f(v)); yy = Math.max(A.P.t - 50, Math.min(A.P.b + 50, yy)); ctx[i ? 'lineTo' : 'moveTo'](A.x(v), yy); }
  ctx.stroke(); ctx.restore();
}
function seg(ctx, x0, y0, x1, y1, color, w = 1.5, dash = null) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, color, ring) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = color; ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 1.5; ctx.stroke(); } }
const ticksFor = (W, wide, narrow) => (W < 360 ? narrow : wide);

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

/* ---------- step 0: doubling ---------- */
const s0 = { log: false, fbKey: '' };
function draw0() {
  const g = num('g0'), N = M.cellsAfter(g), mass = M.gramsAfter(g);
  $('g0v').textContent = String(g);
  $('log0').setAttribute('aria-pressed', s0.log ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c0'));
  const xMax = Math.max(g, 10) + 0.5;
  let A;
  if (s0.log) {
    const top = Math.max(1, Math.ceil(Math.log10(N))), step = [1, 2, 5, 10, 20].find(s => top / s <= 5) || 20;
    const ticks = []; for (let e = 0; e <= top; e += step) ticks.push([e, e === 0 ? '1' : '10' + sup(e)]);
    A = panel(ctx, W, H, { xMin: -0.5, xMax, yMin: 0, yMax: top, yTicks: ticks, xTicks: [], title: t('c0log'), left: 44 });
  } else {
    A = panel(ctx, W, H, { xMin: -0.5, xMax, yMin: 0, yMax: N, yTicks: [[0, '0'], [N / 2, sci(N / 2)], [N, sci(N)]], xTicks: [], title: t('c0lin'), left: W < 360 ? 58 : 70 });
  }
  const xs = ticksFor(W, 6, 3), stepX = Math.max(1, Math.ceil(xMax / xs / 6) * 6);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let v = 0; v <= xMax; v += stepX) ctx.fillText(String(v), A.x(v), A.P.b + 15);
  ctx.restore();
  const bw = Math.max(1, (A.x(1) - A.x(0)) * 0.8);
  for (let k = 0; k <= g; k++) {
    const v = s0.log ? Math.log10(M.cellsAfter(k)) : M.cellsAfter(k), Y = A.y(v);
    ctx.fillStyle = k === g ? C.orange : C.cyan; ctx.fillRect(A.x(k) - bw / 2, Y, bw, A.P.b - Y);
    if (A.P.b - Y < 1 && !s0.log) { ctx.fillStyle = 'rgba(103,215,249,0.5)'; ctx.fillRect(A.x(k) - bw / 2, A.P.b - 1, bw, 1); }
  }
  const ref = M.biggestBelow(mass);
  const cmp = !ref ? '' : ref.id === 'earth' ? t('cmpEarth', { x: sci(mass / ref.g) }) : t('cmpObj', { obj: t('o_' + ref.id) });
  $('r0').textContent = t('s0readout', { g, h: fmt(g / 3, 1), N: sci(N), mass: massText(mass), cmp });
  if (s0.fbKey) { const p = { N: sci(M.cellsAfter(72)), mass: massText(M.gramsAfter(72)) }; $('fb0').textContent = t(s0.fbKey, p); $('fb0').style.color = s0.fbKey === 'fb0right' ? C.green : C.orange; }
}

/* ---------- step 1: exponential, per-capita rate ---------- */
const s1 = { prev: [] };
function draw1() {
  const r = num('r1'), N0 = 10, Td = M.doublingTime(r);
  $('r1v').textContent = fmt(r);
  {
    const { ctx, W, H } = fitCanvas($('c1'));
    const A = panel(ctx, W, H, { xMin: 0, xMax: 12, yMin: 0, yMax: 1000, yTicks: [0, 500, 1000], xTicks: ticksFor(W, [0, 3, 6, 9, 12], [0, 6, 12]), title: t('c1title') });
    s1.prev.forEach(pr => curve(ctx, A, v => M.expN(N0, pr, v), 0, 12, C.ghost, 1.2, [4, 3]));
    curve(ctx, A, v => M.expN(N0, r, v), 0, 12, C.orange, 2.5);
    for (let k = 0; k * Td <= 12 && M.expN(N0, r, k * Td) <= 1000; k++) dot(ctx, A.x(k * Td), A.y(M.expN(N0, r, k * Td)), 3.5, C.text);
  }
  {
    const { ctx, W, H } = fitCanvas($('c1b'));
    const A = panel(ctx, W, H, { xMin: 0, xMax: 1000, yMin: 0, yMax: 1.6, yTicks: [0, 0.5, 1, 1.5], xTicks: ticksFor(W, [0, 500, 1000], [0, 1000]), title: t('c1btitle') });
    s1.prev.forEach(pr => seg(ctx, A.x(0), A.y(pr), A.x(1000), A.y(pr), C.ghost, 1.2, [4, 3]));
    seg(ctx, A.x(0), A.y(r), A.x(1000), A.y(r), C.orange, 2.5);
  }
  $('rd1').textContent = t('s1readout', { r: fmt(r), td: fmt(Td, 2), t100: fmt(Math.log(100) / r, 2) });
}

/* ---------- step 2: logistic vs exponential ---------- */
function draw2() {
  const r = num('r2'), K = num('k2'), tt = num('t2'), N0 = 10;
  $('r2v').textContent = fmt(r); $('k2v').textContent = String(K); $('t2v').textContent = fmt(tt, 1);
  const nl = M.logN(N0, r, K, tt), ne = M.expN(N0, r, tt), pc = M.perCapita(r, K, nl);
  {
    const { ctx, W, H } = fitCanvas($('c2'));
    const A = panel(ctx, W, H, { xMin: 0, xMax: 24, yMin: 0, yMax: 1100, yTicks: [0, 500, 1000], xTicks: ticksFor(W, [0, 6, 12, 18, 24], [0, 12, 24]), title: t('c2title') });
    seg(ctx, A.P.l, A.y(K), A.P.r, A.y(K), C.k, 1.2, [6, 4]);
    curve(ctx, A, v => M.expN(N0, r, v), 0, 24, C.orange, 2, [6, 4]);
    curve(ctx, A, v => M.logN(N0, r, K, v), 0, 24, C.cyan, 2.8);
    seg(ctx, A.x(tt), A.P.t, A.x(tt), A.P.b, C.orange, 1, [3, 4]);
    dot(ctx, A.x(tt), A.y(nl), 5.5, C.cyan, C.bg);
    if (ne <= 1100) dot(ctx, A.x(tt), A.y(ne), 4.5, C.orange, C.bg);
  }
  {
    const { ctx, W, H } = fitCanvas($('c2b'));
    const A = panel(ctx, W, H, { xMin: 0, xMax: 1100, yMin: 0, yMax: 1.6, yTicks: [0, 0.5, 1, 1.5], xTicks: ticksFor(W, [0, 500, 1000], [0, 1000]), title: t('c2btitle') });
    seg(ctx, A.x(0), A.y(r), A.x(1100), A.y(r), C.orange, 2, [6, 4]);
    seg(ctx, A.x(0), A.y(r), A.x(K), A.y(0), C.cyan, 2.8);
    seg(ctx, A.x(K), A.P.t, A.x(K), A.P.b, C.k, 1.2, [6, 4]);
    if (ne <= 1100) dot(ctx, A.x(ne), A.y(r), 4.5, C.orange, C.bg);
    dot(ctx, A.x(nl), A.y(pc), 5.5, C.cyan, C.bg);
  }
  $('rd2').textContent = t('s2readout', { t: fmt(tt, 1), nl: fmt(nl, 0), ne: sci(ne), pc: fmt(pc, 3), pct: fmt(100 * pc / r, 0) });
}

/* ---------- step 3: steepest moment ---------- */
const P3 = { r: 0.5, K: 600, N0: 10 };
function draw3() {
  const tt = num('t3'), { r, K, N0 } = P3, n = M.logN(N0, r, K, tt), g = M.growth(r, K, n), ts = M.tInflection(N0, r, K);
  $('t3v').textContent = fmt(tt, 1);
  {
    const { ctx, W, H } = fitCanvas($('c3'));
    const A = panel(ctx, W, H, { xMin: 0, xMax: 24, yMin: 0, yMax: 700, yTicks: [0, 300, 600], xTicks: ticksFor(W, [0, 6, 12, 18, 24], [0, 12, 24]), title: t('c3title') });
    seg(ctx, A.P.l, A.y(K), A.P.r, A.y(K), C.k, 1.2, [6, 4]);
    seg(ctx, A.x(ts), A.P.t, A.x(ts), A.P.b, C.green, 1.2, [3, 4]);
    curve(ctx, A, v => M.logN(N0, r, K, v), 0, 24, C.cyan, 2.8);
    clipTo(ctx, A); seg(ctx, A.x(tt - 3), A.y(n - 3 * g), A.x(tt + 3), A.y(n + 3 * g), C.orange, 2.5); ctx.restore();
    dot(ctx, A.x(tt), A.y(n), 5.5, C.cyan, C.bg);
  }
  {
    const { ctx, W, H } = fitCanvas($('c3b'));
    const A = panel(ctx, W, H, { xMin: 0, xMax: 650, yMin: 0, yMax: 90, yTicks: [0, 25, 50, 75], xTicks: ticksFor(W, [0, 300, 600], [0, 600]), title: t('c3btitle') });
    seg(ctx, A.x(K / 2), A.P.t, A.x(K / 2), A.P.b, C.green, 1.2, [3, 4]);
    curve(ctx, A, v => M.growth(r, K, v), 0, K, C.green, 2.8);
    dot(ctx, A.x(n), A.y(g), 5.5, C.orange, C.bg);
  }
  $('rd3').textContent = t('s3readout', { t: fmt(tt, 1), n: fmt(n, 0), g: fmt(g, 1), half: K / 2, ts: fmt(ts, 1), pk: fmt(M.peakGrowth(r, K), 0) });
}

/* ---------- step 4: K attracts ---------- */
const P4 = { r: 0.5, K: 600 };
const s4 = { starts: [1000] };
function draw4() {
  const n0 = num('n4'), { r, K } = P4;
  $('n4v').textContent = String(n0);
  {
    const { ctx, W, H } = fitCanvas($('c4'));
    const A = panel(ctx, W, H, { xMin: 0, xMax: 24, yMin: 0, yMax: 1050, yTicks: [0, 300, 600, 900], xTicks: ticksFor(W, [0, 6, 12, 18, 24], [0, 12, 24]), title: t('c4title') });
    seg(ctx, A.P.l, A.y(K), A.P.r, A.y(K), C.k, 1.2, [6, 4]);
    s4.starts.forEach(s => curve(ctx, A, v => (s === 0 ? 0 : M.logN(s, r, K, v)), 0, 24, s > K ? C.pink : s < K ? C.cyan : C.text, 2.2));
    dot(ctx, A.x(0), A.y(n0), 5, C.orange, C.bg);
  }
  {
    const { ctx, W, H } = fitCanvas($('c4b'));
    const A = panel(ctx, W, H, { xMin: -40, xMax: 1050, yMin: -350, yMax: 100, yTicks: [-300, -150, 0, 75], xTicks: ticksFor(W, [0, 300, 600, 900], [0, 600]), title: t('c4btitle') });
    curve(ctx, A, v => M.growth(r, K, v), 0, 1050, C.green, 2.5);
    // arrows along the axis: right where dN/dt > 0, left where < 0
    const y0 = A.y(0);
    for (const v of [150, 300, 450, 750, 900]) {
      const dir = M.growth(r, K, v) > 0 ? 1 : -1, X = A.x(v);
      ctx.fillStyle = dir > 0 ? C.cyan : C.pink; ctx.beginPath(); ctx.moveTo(X + dir * 7, y0); ctx.lineTo(X - dir * 5, y0 - 6); ctx.lineTo(X - dir * 5, y0 + 6); ctx.closePath(); ctx.fill();
    }
    dot(ctx, A.x(K), y0, 6, C.text); dot(ctx, A.x(0) + 0.5, y0, 6, C.bg, C.text);
    seg(ctx, A.x(n0), A.P.t, A.x(n0), A.P.b, C.orange, 1.2, [3, 4]);
    dot(ctx, A.x(n0), A.y(M.growth(r, K, n0)), 5, C.orange, C.bg);
  }
  const items = s4.starts.map(s => (s === 0 ? t('s4zero') : t('s4item', { n0: s, n: fmt(M.logN(s, r, K, 24), 0) })));
  $('rd4').textContent = items.length ? t('s4readout', { list: items.join(t('s4sep')) }) : t('s4empty');
}

/* ---------- step 5: yeast fit ---------- */
const s5 = { exp: false };
const BEST = M.fitLogistic(), EXP = M.fitExpEarly(7);
function draw5() {
  const r = num('r5'), K = num('k5'), D = M.YEAST, N0 = D[0];
  $('r5v').textContent = fmt(r); $('k5v').textContent = String(K);
  $('exp5').setAttribute('aria-pressed', s5.exp ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, H, { xMin: 0, xMax: 18.5, yMin: 0, yMax: 900, yTicks: [0, 300, 600, 900], xTicks: ticksFor(W, [0, 3, 6, 9, 12, 15, 18], [0, 6, 12, 18]), title: t('c5title') });
  if (s5.exp) curve(ctx, A, v => EXP.at(v), 0, 18.5, C.orange, 2, [6, 4]);
  curve(ctx, A, v => M.logN(N0, r, K, v), 0, 18.5, C.cyan, 2.5);
  D.forEach((y, i) => { const m = M.logN(N0, r, K, i); seg(ctx, A.x(i), A.y(y), A.x(i), A.y(m), C.pink, 2); });
  D.forEach((y, i) => dot(ctx, A.x(i), A.y(y), 4, C.text, C.bg));
  const isBest = Math.abs(r - Math.round(BEST.r * 100) / 100) < 1e-9 && Math.abs(K - Math.round(BEST.K / 5) * 5) < 1e-9;
  const best = isBest ? t('s5best') : t('s5notbest', { rb: fmt(BEST.r, 2), kb: fmt(BEST.K, 0), rmsb: fmt(Math.sqrt(BEST.sse / D.length), 1) });
  let text = t('s5readout', { r: fmt(r), K, sse: fmt(M.sse(r, K), 0), rms: fmt(M.rms(r, K), 1), best });
  if (s5.exp) text += t('s5exp', { re: fmt(EXP.r, 2), pe: sci(EXP.at(18)), obs: fmt(D[18], 1) });
  $('rd5').textContent = text;
}

/* ---------- step 6: discrete logistic ---------- */
function draw6() {
  const r = num('r6'), xs = M.iterate(0.05, r, 40), cls = M.classify(r);
  $('r6v').textContent = fmt(r);
  {
    const { ctx, W, H } = fitCanvas($('c6'));
    const A = panel(ctx, W, H, { xMin: -0.5, xMax: 40.5, yMin: 0, yMax: 1.4, yTicks: [0, 0.5, 1], xTicks: ticksFor(W, [0, 10, 20, 30, 40], [0, 20, 40]), title: t('c6title') });
    seg(ctx, A.P.l, A.y(1), A.P.r, A.y(1), C.k, 1.2, [6, 4]);
    ctx.strokeStyle = 'rgba(103,215,249,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); xs.forEach((v, i) => ctx[i ? 'lineTo' : 'moveTo'](A.x(i), A.y(v))); ctx.stroke();
    xs.forEach((v, i) => dot(ctx, A.x(i), A.y(v), 2.8, C.cyan));
  }
  {
    const { ctx, W, H } = fitCanvas($('c6b'));
    const side = Math.min(W - 52, H - 56), ox = 40 + (W - 52 - side) / 2;
    const A = panel(ctx, ox + side + 12, H, { xMin: 0, xMax: 1.4, yMin: 0, yMax: 1.4, yTicks: [0, 0.5, 1], xTicks: [0, 0.5, 1], title: '', left: ox, top: H - 26 - side });
    label(ctx, t('c6btitle'), 8, 17, W - 16);
    seg(ctx, A.x(0), A.y(0), A.x(1.4), A.y(1.4), C.ghost, 1.2, [4, 3]);
    curve(ctx, A, v => M.stepDiscrete(v, r), 0, 1.4, C.green, 2.5);
    clipTo(ctx, A); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(A.x(xs[0]), A.y(0));
    for (let i = 0; i < xs.length - 1; i++) { ctx.lineTo(A.x(xs[i]), A.y(xs[i + 1])); ctx.lineTo(A.x(xs[i + 1]), A.y(xs[i + 1])); }
    ctx.stroke(); ctx.restore();
    dot(ctx, A.x(1), A.y(1), 4.5, C.text, C.bg);
  }
  $('rd6').textContent = t('s6readout', { r: fmt(r), kind: t('k_' + cls.kind, { p: cls.period }) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  const eg = Math.ceil(M.gensToReach(M.REF.find(x => x.id === 'earth').g));
  window.POP_I18N_PARAMS = { earthGen: eg, earthH: fmt(eg / 3, 1) };
  // step 0
  $('g0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('log0').addEventListener('click', () => { s0.log = !s0.log; draw0(); });
  $('play0').addEventListener('click', () => animate('s0', 9000, p => { $('g0').value = Math.round(144 * p); draw0(); }));
  $('check0').addEventListener('click', () => { const c = document.querySelector('input[name="q0"]:checked'); s0.fbKey = !c ? 'fb0none' : c.value === 'c' ? 'fb0right' : 'fb0wrong'; $('fb0').dataset.state = s0.fbKey === 'fb0right' ? 'correct' : 'wrong'; draw0(); });
  // step 1
  let lastR = num('r1');
  $('r1').addEventListener('input', draw1);
  $('r1').addEventListener('change', () => { if (Math.abs(lastR - num('r1')) > 1e-9) { s1.prev = [...s1.prev.filter(v => v !== lastR), lastR].slice(-3); lastR = num('r1'); draw1(); } });
  // step 2
  ['r2', 'k2'].forEach(id => $(id).addEventListener('input', draw2));
  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => animate('s2', 7000, p => { $('t2').value = (24 * p).toFixed(1); draw2(); }));
  // step 3
  $('t3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('play3').addEventListener('click', () => animate('s3', 7000, p => { $('t3').value = (24 * p).toFixed(1); draw3(); }));
  // step 4
  $('n4').addEventListener('input', draw4);
  $('add4').addEventListener('click', () => { const v = num('n4'); if (!s4.starts.includes(v)) s4.starts.push(v); if (s4.starts.length > 8) s4.starts.shift(); draw4(); });
  $('clear4').addEventListener('click', () => { s4.starts = []; draw4(); });
  // step 5
  ['r5', 'k5'].forEach(id => $(id).addEventListener('input', draw5));
  $('fit5').addEventListener('click', () => { $('r5').value = (Math.round(BEST.r * 100) / 100).toFixed(2); $('k5').value = Math.round(BEST.K / 5) * 5; draw5(); });
  $('exp5').addEventListener('click', () => { s5.exp = !s5.exp; draw5(); });
  // step 6
  $('r6').addEventListener('input', draw6);
  ['p6a', 'p6b', 'p6c', 'p6d'].forEach(id => $(id).addEventListener('click', () => { $('r6').value = $(id).dataset.r; draw6(); }));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshPop = () => {
    document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml, window.POP_I18N_PARAMS); });
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n, window.POP_I18N_PARAMS); });
    refresh();
  };
  window.refreshPop();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
