'use strict';
// Probability distribution lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.DIST_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and a few value labels; legends and tables live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.DIST_MODEL;
const t = (...a) => window.DIST_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', white: '#e8edf4', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', panel: '#152131', ghost: '#9aaabd' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (toFixed(0) of 90 stays "90").
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s.replace(/^-/, '−'); };
const pct = (p, d = 1) => fmt(p * 100, d) + '%';

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
function label(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const niceStep = (span, px, minPx) => [0.5, 1, 2, 5, 10, 20, 25, 50, 100].find(s => s / span * px >= minPx) || 100;
// A bar-chart panel on [xMin, xMax] × [0, yMax]. Title sits on its own row above the plot.
function panel(ctx, W, o) {
  const P = { l: 46, r: W - 12, t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - v / o.yMax * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  o.yTicks.forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4); });
  if (o.xTicks !== false) {
    const step = o.xStep || niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 26);
    ctx.textAlign = 'center';
    for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v, 1), x(v), P.b + 15); }
  }
  ctx.restore();
  if (o.title) label(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function bars(ctx, A, d, color, { width, alpha = 0.88, colorFn } = {}) {
  d.xs.forEach((x, i) => { const p = d.ps[i]; if (p <= 0) return; ctx.globalAlpha = alpha; ctx.fillStyle = colorFn ? colorFn(x, i) : color; ctx.fillRect(A.x(x) - width / 2, A.y(p), width, A.P.b - A.y(p)); });
  ctx.globalAlpha = 1;
}
function outline(ctx, A, d, width) {
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.3;
  d.xs.forEach((x, i) => { const p = d.ps[i]; if (p < 1e-4) return; ctx.strokeRect(A.x(x) - width / 2, A.y(p), width, A.P.b - A.y(p)); });
  ctx.restore();
}
function band(ctx, A, m, s) {
  const x0 = Math.max(A.P.l, A.x(m - s)), x1 = Math.min(A.P.r, A.x(m + s));
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.13)'; ctx.fillRect(x0, A.P.t, Math.max(2, x1 - x0), A.P.b - A.P.t);
  ctx.strokeStyle = 'rgba(103,215,249,0.55)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0, A.P.t); ctx.lineTo(x0, A.P.b); ctx.moveTo(x1, A.P.t); ctx.lineTo(x1, A.P.b); ctx.stroke();
  ctx.setLineDash([]); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.x(m), A.P.t); ctx.lineTo(A.x(m), A.P.b); ctx.stroke(); ctx.restore();
}
const yMaxFor = (top, opts = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1]) => opts.find(v => v >= top * 1.12) || 1;
const yTicksFor = yMax => [0, yMax / 2, yMax];

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
// "Before this drag" snapshot: taken at the first input of a drag, kept until the next drag starts.
function dragGhost() {
  const g = { dist: null, active: false, timer: null };
  g.touch = before => { if (!g.active) { g.dist = before; g.active = true; } clearTimeout(g.timer); g.timer = setTimeout(() => { g.active = false; }, 700); };
  return g;
}

/* ---------- step 0: two dice ---------- */
const DICE = M.twoDice();
const s0 = { counts: new Array(13).fill(0), n: 0, last: null, rand: M.rng(36) };
function roll() { const a = M.rollDie(s0.rand), b = M.rollDie(s0.rand); s0.counts[a + b]++; s0.n++; s0.last = [a, b]; }
function dieFace(ctx, X, Y, s, v) {
  ctx.save(); ctx.fillStyle = C.white; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(X, Y, s, s, 7) : ctx.rect(X, Y, s, s); ctx.fill();
  const P = { 1: [[0.5, 0.5]], 2: [[0.27, 0.27], [0.73, 0.73]], 3: [[0.27, 0.27], [0.5, 0.5], [0.73, 0.73]], 4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]], 5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]], 6: [[0.27, 0.25], [0.73, 0.25], [0.27, 0.5], [0.73, 0.5], [0.27, 0.75], [0.73, 0.75]] };
  ctx.fillStyle = '#0a0e14'; P[v].forEach(([u, w]) => { ctx.beginPath(); ctx.arc(X + u * s, Y + w * s, s * 0.09, 0, 7); ctx.fill(); }); ctx.restore();
}
function table0() {
  $('tab0').innerHTML = `<tbody><tr><th>${t('thX')}</th>${DICE.xs.map(x => `<td>${x}</td>`).join('')}</tr><tr><th>${t('thP')}</th>${DICE.ps.map(p => `<td>${Math.round(p * 36)}/36</td>`).join('')}</tr></tbody>`;
}
function draw0() {
  table0();
  const { ctx, W, H } = fitCanvas($('c0'));
  if (s0.last) { const [a, b] = s0.last; label(ctx, t('c0dice', { a, b, s: a + b }), 8, 18, W - 16); dieFace(ctx, 12, 30, 44, a); dieFace(ctx, 66, 30, 44, b); }
  else label(ctx, t('c0none'), 8, 18, W - 16, { color: C.muted });
  const freq = DICE.xs.map(x => (s0.n ? s0.counts[x] / s0.n : 0));
  const yMax = yMaxFor(Math.max(1 / 6, ...freq), [0.2, 0.3, 0.5, 1]);
  const A = panel(ctx, W, { top: 128, bottom: H - 30, xMin: 1.4, xMax: 12.6, yMax, yTicks: yTicksFor(yMax), yFmt: v => pct(v, 0), xStep: 1, title: t('c0bars', { n: s0.n }) });
  const bw = Math.min(34, (A.x(2) - A.x(1)) * 0.7);
  bars(ctx, A, { xs: DICE.xs, ps: freq }, C.cyan, { width: bw });
  ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 3;
  DICE.xs.forEach((x, i) => { ctx.beginPath(); ctx.moveTo(A.x(x) - bw / 2 - 4, A.y(DICE.ps[i])); ctx.lineTo(A.x(x) + bw / 2 + 4, A.y(DICE.ps[i])); ctx.stroke(); });
  ctx.restore();
  if (!s0.n) { $('r0').textContent = t('s0readout0', { p7: pct(6 / 36), p2: pct(1 / 36) }); return; }
  const gap = Math.max(...DICE.ps.map((p, i) => Math.abs(freq[i] - p)));
  $('r0').textContent = t('s0readout', { n: s0.n, n7: s0.counts[7], f7: pct(s0.counts[7] / s0.n), p7: pct(6 / 36), gap: fmt(gap * 100, 1) });
}

/* ---------- step 1: expectation as a balance point ---------- */
const NAMES = { dice2: 'preDice2', die1: 'preDie1', coins3: 'preCoins3', parcels: 'preParcels' };
const s1 = { key: 'dice2', c: 4 };
const dist1 = () => M.PRESETS[s1.key]();
function setPreset(key) {
  s1.key = key; const d = dist1(), lo = d.xs[0], hi = d.xs[d.xs.length - 1];
  $('c1').min = lo; $('c1').max = hi;
  s1.c = Math.round((lo + (hi - lo) * 0.2) / 0.05) * 0.05; $('c1').value = s1.c;
}
function draw1() {
  const d = dist1(), m = M.mean(d), tq = M.torque(d, s1.c), lo = d.xs[0], hi = d.xs[d.xs.length - 1], mo = M.modes(d);
  Object.keys(NAMES).forEach(k => $('pre_' + k).setAttribute('aria-pressed', k === s1.key));
  $('c1v').textContent = fmt(s1.c, 2);
  const state = Math.abs(tq) < 0.005 ? t('stLevel') : tq > 0 ? t('stUp') : t('stDown');
  const { ctx, W, H } = fitCanvas($('cv1'));
  label(ctx, t('c1title', { c: fmt(s1.c, 2), state }), 8, 18, W - 16);
  const P = { l: 30, r: W - 30 }, x = v => P.l + (v - (lo - 0.6)) / ((hi + 0.6) - (lo - 0.6)) * (P.r - P.l);
  const beamY = 214, px = x(s1.c), span = hi - lo + 1.2;
  // The rod rests on the pivot; it can only tip until its lower end touches the ground (22 px below the beam).
  const reach = Math.max(px - x(lo - 0.6), x(hi + 0.6) - px), thetaMax = Math.atan(21 / Math.max(reach, 1));
  const theta = thetaMax * Math.tanh(tq / (span * 0.03));
  const hScale = 130 / Math.max(...d.ps), bw = Math.min(30, (x(lo + 1) - x(lo)) * 0.6);
  const uniform = mo.length === d.xs.length;
  ctx.save(); ctx.translate(px, beamY); ctx.rotate(theta);
  ctx.fillStyle = '#56708f'; ctx.fillRect(x(lo - 0.6) - px, -3, x(hi + 0.6) - x(lo - 0.6), 6);
  d.xs.forEach((v, i) => { ctx.fillStyle = !uniform && mo.includes(v) ? C.orange : C.violet; ctx.globalAlpha = 0.9; ctx.fillRect(x(v) - px - bw / 2, -3 - d.ps[i] * hScale, bw, d.ps[i] * hScale); });
  ctx.globalAlpha = 1;
  // mean marker on the beam
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x(m) - px, -3); ctx.lineTo(x(m) - px, -150); ctx.stroke();
  ctx.restore();
  // pivot and ground
  ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(px, beamY + 3); ctx.lineTo(px - 11, beamY + 24); ctx.lineTo(px + 11, beamY + 24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(8, beamY + 24); ctx.lineTo(W - 8, beamY + 24); ctx.stroke();
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const step = [1, 2, 5].find(q => q / (hi - lo) * (x(hi) - x(lo)) >= 22) || 5;
  for (let v = lo; v <= hi + 1e-9; v += step) ctx.fillText(String(v), x(v), beamY + 44);
  ctx.restore();
  label(ctx, 'E(X)', x(m), beamY - 158, 40, { size: 11, weight: 700, color: C.cyan, align: 'center' });
  let note;
  if (uniform) note = t('noteUniform');
  else if (!d.xs.some(v => Math.abs(v - m) < 1e-9)) note = t('noteNotAttainable', { mean: fmt(m, 2) });
  else if (!mo.some(v => Math.abs(v - m) < 1e-9)) note = t('noteSkew');
  else note = t('noteSym');
  const sep = window.DIST_I18N.getLang() === 'zh' ? '、' : ', ';
  $('r1').textContent = t('s1readout', { name: t(NAMES[s1.key]), c: fmt(s1.c, 2), tq: fmt(tq, 3), state, mean: fmt(m, 2), mode: uniform ? d.xs[0] + '–' + d.xs[d.xs.length - 1] : mo.join(sep), note });
}

/* ---------- step 2: variance ---------- */
const s2 = { ghost: dragGhost(), cur: null };
function draw2() {
  const s = num('s2'), d = M.spreadFamily(s), m = M.mean(d), v = M.variance(d), sd = Math.sqrt(v), con = M.contributions(d);
  s2.cur = d; $('s2v').textContent = fmt(s, 2);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: 188, xMin: 0.4, xMax: 9.6, yMax: 0.8, yTicks: [0, 0.4, 0.8], yFmt: v => fmt(v, 1), xStep: 1, title: t('c2top') });
  const bw = Math.min(40, (A.x(2) - A.x(1)) * 0.62);
  band(ctx, A, m, sd);
  bars(ctx, A, d, C.violet, { width: bw });
  if (s2.ghost.dist) outline(ctx, A, s2.ghost.dist, bw);
  const B = panel(ctx, W, { top: 236, bottom: H - 28, xMin: 0.4, xMax: 9.6, yMax: 1.4, yTicks: [0, 0.7, 1.4], yFmt: v => fmt(v, 1), xStep: 1, title: t('c2bot') });
  bars(ctx, B, { xs: d.xs, ps: con }, C.green, { width: bw });
  const iMax = con.indexOf(Math.max(...con)), inside = d.xs.reduce((acc, x, i) => acc + (x >= m - sd - 1e-12 && x <= m + sd + 1e-12 ? d.ps[i] : 0), 0);
  $('r2').textContent = t('s2readout', { m: fmt(m, 2), v: fmt(v, 2), s: fmt(sd, 2), xmax: d.xs[iMax], dist: Math.abs(d.xs[iMax] - m), cmax: fmt(con[iMax], 3), inside: pct(inside) });
}

/* ---------- step 3: Y = aX + b ---------- */
function formulaY(a, b) {
  const minus = '−';
  let s = 'Y = ';
  if (a === 0) return s + fmt(b, 0);
  s += a === 1 ? 'X' : a === -1 ? minus + 'X' : fmt(a, 1) + 'X';
  if (b !== 0) s += (b > 0 ? ' + ' : ' ' + minus + ' ') + Math.abs(b);
  return s;
}
function draw3() {
  const a = num('a3'), b = num('b3'), X = DICE, Y = M.linear(X, a, b);
  $('a3v').textContent = fmt(a, 1); $('b3v').textContent = fmt(b, 0);
  const all = [...X.xs, ...Y.xs], lo = Math.min(...all) - 1, hi = Math.max(...all) + 1;
  const { ctx, W, H } = fitCanvas($('c3'));
  const spacing = Math.max(0.5, Math.abs(a) || 1), unit = (W - 58) / (hi - lo);
  const bw = Math.max(2, Math.min(22, unit * 0.7, unit * spacing * 0.7)), bwX = Math.max(2, Math.min(22, unit * 0.7));
  const yx = yMaxFor(Math.max(...X.ps)), yy = yMaxFor(Math.max(...Y.ps));
  const A = panel(ctx, W, { top: 30, bottom: 160, xMin: lo, xMax: hi, yMax: yx, yTicks: yTicksFor(yx), yFmt: v => pct(v, 0), minPx: 30, title: t('c3top') });
  band(ctx, A, M.mean(X), M.sd(X)); bars(ctx, A, X, C.violet, { width: bwX });
  const f = formulaY(a, b);
  const B = panel(ctx, W, { top: 210, bottom: H - 30, xMin: lo, xMax: hi, yMax: yy, yTicks: yTicksFor(yy), yFmt: v => pct(v, 0), minPx: 30, title: t('c3bot', { f }) });
  band(ctx, B, M.mean(Y), M.sd(Y)); bars(ctx, B, Y, C.cyan, { width: bw });
  $('r3').textContent = t('s3readout', { vx: fmt(M.variance(X), 2), sx: fmt(M.sd(X), 2), f, ey: fmt(M.mean(Y), 2), vy: fmt(M.variance(Y), 2), sy: fmt(M.sd(Y), 2), ey2: fmt(a * M.mean(X) + b, 2), vy2: fmt(a * a * M.variance(X), 2) });
}

/* ---------- step 4: binomial ---------- */
const s4 = { ghost: dragGhost(), cur: null };
function draw4() {
  const n = num('n4'), p = num('p4'), d = M.binom(n, p), m = M.mean(d), v = M.variance(d);
  s4.cur = d; $('n4v').textContent = String(n); $('p4v').textContent = fmt(p, 2);
  const { ctx, W, H } = fitCanvas($('c4'));
  const ghost = s4.ghost.dist, top = Math.max(...d.ps, ...(ghost ? ghost.ps : [0])), yMax = yMaxFor(top);
  const A = panel(ctx, W, { top: 30, bottom: H - 30, xMin: -0.6, xMax: 30.6, yMax, yTicks: yTicksFor(yMax), yFmt: v => pct(v, 0), minPx: 28, title: t('c4title', { n, p: fmt(p, 2) }) });
  const bw = Math.min(20, (A.x(1) - A.x(0)) * 0.72);
  band(ctx, A, m, Math.sqrt(v)); bars(ctx, A, d, C.violet, { width: bw });
  if (ghost) outline(ctx, A, ghost, bw);
  const mode = d.xs[d.ps.indexOf(Math.max(...d.ps))];
  $('r4').textContent = t('s4readout', { n, p: fmt(p, 2), m1: fmt(m, 3), m2: fmt(n * p, 3), v1: fmt(v, 3), v2: fmt(n * p * (1 - p), 3), s: fmt(Math.sqrt(v), 3), mode });
}

/* ---------- step 5: normal approximation ---------- */
function draw5() {
  const n = num('n5'), p = num('p5'); $('k5').max = n; const k = Math.min(num('k5'), n);
  $('n5v').textContent = String(n); $('p5v').textContent = fmt(p, 2); $('k5v').textContent = String(k);
  const d = M.binom(n, p), mu = n * p, sg = Math.sqrt(n * p * (1 - p));
  let lo = Math.max(0, Math.floor(mu - 4.5 * sg)), hi = Math.min(n, Math.ceil(mu + 4.5 * sg));
  lo = Math.min(lo, k); hi = Math.max(hi, Math.min(n, k + 1)); if (hi - lo < 10) { hi = Math.min(n, lo + 10); lo = Math.max(0, hi - 10); }
  const { ctx, W, H } = fitCanvas($('c5'));
  const top = Math.max(...d.ps, M.normalPdf(mu, mu, sg)), yMax = yMaxFor(top, [0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5]);
  const A = panel(ctx, W, { top: 30, bottom: H - 30, xMin: lo - 0.7, xMax: hi + 0.7, yMax, yTicks: yTicksFor(yMax), yFmt: v => pct(v, 0), minPx: 30, title: t('c5title', { n, p: fmt(p, 2), mu: fmt(mu, 1), v: fmt(sg * sg, 2), k }) });
  // shaded area under the curve from k − 0.5
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.18)'; ctx.beginPath(); const a0 = Math.max(lo - 0.7, k - 0.5);
  ctx.moveTo(A.x(a0), A.P.b); for (let i = 0; i <= 200; i++) { const xv = a0 + (hi + 0.7 - a0) * i / 200; ctx.lineTo(A.x(xv), A.y(M.normalPdf(xv, mu, sg))); } ctx.lineTo(A.x(hi + 0.7), A.P.b); ctx.closePath(); ctx.fill(); ctx.restore();
  const bw = Math.max(1.5, (A.x(1) - A.x(0)) * 0.86);
  const win = { xs: d.xs.filter(x => x >= lo && x <= hi), ps: d.ps.filter((_, i) => d.xs[i] >= lo && d.xs[i] <= hi) };
  bars(ctx, A, win, C.violet, { width: bw, alpha: 0.8, colorFn: x => (x >= k ? C.orange : C.violet) });
  ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let i = 0; i <= 300; i++) { const xv = lo - 0.7 + (hi - lo + 1.4) * i / 300, Y = A.y(M.normalPdf(xv, mu, sg)); if (!i) ctx.moveTo(A.x(xv), Y); else ctx.lineTo(A.x(xv), Y); }
  ctx.stroke(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(A.x(k - 0.5), A.P.t); ctx.lineTo(A.x(k - 0.5), A.P.b); ctx.stroke(); ctx.restore();
  const exact = M.tail(d, k), approx = M.tailNormal(n, p, k);
  $('r5').textContent = t('s5readout', { k, exact: pct(exact, 2), kc: fmt(k - 0.5, 1), approx: pct(approx, 2), diff: fmt(Math.abs(exact - approx) * 100, 2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('roll1').addEventListener('click', () => { stopAnim('s0'); roll(); draw0(); });
  $('roll100').addEventListener('click', () => {
    const start = s0.n;
    animate('s0', 1200, p => { const want = start + Math.round(p * 100); while (s0.n < want) roll(); draw0(); });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.counts.fill(0); s0.n = 0; s0.last = null; draw0(); });

  Object.keys(NAMES).forEach(k => $('pre_' + k).addEventListener('click', () => { stopAnim('s1'); setPreset(k); draw1(); }));
  $('c1').addEventListener('input', () => { stopAnim('s1'); s1.c = num('c1'); draw1(); });
  $('balance1').addEventListener('click', () => {
    const from = s1.c, to = M.mean(dist1());
    animate('s1', 900, p => { s1.c = from + (to - from) * (1 - Math.pow(1 - p, 3)); $('c1').value = s1.c; draw1(); }, () => { s1.c = to; draw1(); });
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange; $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('s2').addEventListener('input', () => { s2.ghost.touch(s2.cur); draw2(); });
  ['a3', 'b3'].forEach(id => $(id).addEventListener('input', draw3));
  ['n4', 'p4'].forEach(id => $(id).addEventListener('input', () => { s4.ghost.touch(s4.cur); draw4(); }));
  ['n5', 'p5', 'k5'].forEach(id => $(id).addEventListener('input', draw5));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshDist = refresh;
  setPreset('dice2');
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
