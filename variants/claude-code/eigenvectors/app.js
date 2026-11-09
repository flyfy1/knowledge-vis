'use strict';
// Eigenvector lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, curve and readout comes from window.EIGEN_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrink to fit) and axis ticks outside the plot area; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EIGEN_MODEL;
const t = (...a) => window.EIGEN_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', '−'); };
const trim = (v, d = 2) => fmt(v, d).replace(/\.?0+$/, '') || '0';
const hue = deg => `hsl(${Math.round(deg)},75%,66%)`;

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = canvas.dataset.aspect ? Math.min(Number(canvas.dataset.h), Math.round(width * Number(canvas.dataset.aspect))) : Number(canvas.dataset.h);
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Square-pixel view of a plane box fitted in the plot area (ticks outside on the left and bottom).
function planeView(W, H, box, o = {}) {
  const top = o.top || 28, l = 30, b = 20, r = 8, aw = W - l - r, ah = H - top - b;
  const s = Math.min(aw / (box.x1 - box.x0), ah / (box.y1 - box.y0)), pw = (box.x1 - box.x0) * s, ph = (box.y1 - box.y0) * s;
  const P = { l: l + (aw - pw) / 2, t: top + (ah - ph) / 2 }; P.r = P.l + pw; P.b = P.t + ph;
  return { P, s, box, sx: x => P.l + (x - box.x0) * s, sy: y => P.b - (y - box.y0) * s };
}
function planeAxes(ctx, V) {
  const { P, box } = V;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  const step = niceStep(box.x1 - box.x0, P.r - P.l, 26, [1, 2, 5]);
  ctx.textAlign = 'center';
  for (let v = Math.ceil(box.x0 / step - 1e-9) * step; v <= box.x1 + 1e-9; v += step) { ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(V.sx(v), P.t); ctx.lineTo(V.sx(v), P.b); ctx.stroke(); ctx.fillText(trim(v), V.sx(v), P.b + 14); }
  ctx.textAlign = 'right';
  for (let v = Math.ceil(box.y0 / step - 1e-9) * step; v <= box.y1 + 1e-9; v += step) { ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, V.sy(v)); ctx.lineTo(P.r, V.sy(v)); ctx.stroke(); ctx.fillText(trim(v), P.l - 5, V.sy(v) + 4); }
  ctx.restore();
}
function clip(ctx, V) { ctx.beginPath(); ctx.rect(V.P.l, V.P.t, V.P.r - V.P.l, V.P.b - V.P.t); ctx.clip(); }
function arrow(ctx, x0, y0, x1, y1, col, lw = 2.4, alpha = 1) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), h = Math.min(9, L * 0.45);
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - h * 0.7 * Math.cos(a), y1 - h * 0.7 * Math.sin(a)); ctx.stroke();
  if (L > 1.5) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.42), y1 - h * Math.sin(a - 0.42)); ctx.lineTo(x1 - h * Math.cos(a + 0.42), y1 - h * Math.sin(a + 0.42)); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function dline(ctx, V, deg, col = C.text, lw = 1.3, dash = [6, 5], alpha = 0.8) {
  const u = M.unit(deg), L = 20; ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(V.sx(-L * u[0]), V.sy(-L * u[1])); ctx.lineTo(V.sx(L * u[0]), V.sy(L * u[1])); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, col) { ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function seg(ctx, x0, y0, x1, y1, col, lw = 1.5, dash = null) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
// A graph panel with numeric ticks.
function graph(ctx, P, o) {
  const x = v => P.l + (v - o.x0) / (o.x1 - o.x0) * (P.r - P.l), y = v => P.b - ((o.ylog ? Math.log10(v) : v) - o.y0) / (o.y1 - o.y0) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1; ctx.textAlign = 'right';
  for (const [v, lab] of o.yTicks) { ctx.strokeStyle = (!o.ylog && v === 0) ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillText(lab, P.l - 5, y(v) + 4); }
  ctx.textAlign = 'center';
  for (const [v, lab] of o.xTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); ctx.fillText(lab, x(v), P.b + 15); }
  ctx.restore();
  return { x, y, P };
}
const matStr = A => `[[${trim(A[0][0])}, ${trim(A[0][1])}], [${trim(A[1][0])}, ${trim(A[1][1])}]]`;

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

// The ring of 24 unit arrows and their images under A (shared by steps 0 and 3).
function ring(ctx, V, A, eig) {
  ctx.save(); clip(ctx, V);
  ctx.strokeStyle = C.muted; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(V.sx(0), V.sy(0), V.s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i <= 120; i++) { const w = M.apply(A, M.unit(i * 3)); if (!i) ctx.moveTo(V.sx(w[0]), V.sy(w[1])); else ctx.lineTo(V.sx(w[0]), V.sy(w[1])); } ctx.stroke();
  (eig.dirs || []).forEach(dg => dline(ctx, V, dg));
  for (let k = 0; k < 24; k++) {
    const dg = k * 15, v = M.unit(dg), w = M.apply(A, v);
    arrow(ctx, V.sx(0), V.sy(0), V.sx(v[0]), V.sy(v[1]), hue(dg), 1.2, 0.45);
    arrow(ctx, V.sx(0), V.sy(0), V.sx(w[0]), V.sy(w[1]), hue(dg), 2.2);
  }
  ctx.restore();
}
function eigText(e) {
  if (e.type === 'complex') return t('eigNone');
  if (e.type === 'scalar') return t('eigAll', { l: trim(e.l1, 3) });
  if (e.type === 'repeated') return t('eigOne', { l: trim(e.l1, 3), d: e.dirs[0].toFixed(1) });
  return t('eigTwo', { l1: trim(e.l1, 3), l2: trim(e.l2, 3), d1: e.dirs[0].toFixed(1), d2: e.dirs[1].toFixed(1) });
}

/* ---------- step 0: a matrix moves every arrow ---------- */
const getA = () => [[num('ma'), num('mb')], [num('mc'), num('md')]];
const BOX = { x0: -3.4, x1: 3.4, y0: -3.4, y1: 3.4 };
function draw0() {
  const A = getA(), e = M.eig2(A);
  ['ma', 'mb', 'mc', 'md'].forEach(id => { $(id + '_v').textContent = trim(num(id), 1); });
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0title'), 8, 17, W - 16);
  const V = planeView(W, H, BOX); planeAxes(ctx, V); ring(ctx, V, A, e);
  $('r0').textContent = t('s0readout', { A: matStr(A), eig: eigText(e) });
}

/* ---------- step 1: rotate v and watch how far Av turns ---------- */
const s1 = { seen: new Uint8Array(361), last: null, th: 10 }; // th: exact direction (a jump can land between slider steps)
const idx1 = th => Math.round(th * 2);
function mark1(th) { const i = idx1(th), j = s1.last === null ? i : s1.last; for (let q = Math.min(i, j); q <= Math.max(i, j); q++) s1.seen[q] = 1; s1.last = i; }
function draw1() {
  const A = getA(), e = M.eig2(A), th = s1.th, v = M.unit(th), sp = M.split(A, v), tn = M.turn(A, v);
  $('th1v').textContent = (Math.abs(th * 2 - Math.round(th * 2)) < 1e-9 ? th.toFixed(1) : th.toFixed(3)) + '°';
  $('jump1a').disabled = !(e.dirs && e.dirs.length >= 1); $('jump1b').disabled = !(e.dirs && e.dirs.length >= 2);
  let { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1title', { A: matStr(A) }), 8, 17, W - 16);
  const V = planeView(W, H, BOX); planeAxes(ctx, V);
  ctx.save(); clip(ctx, V);
  dline(ctx, V, th, C.cyan, 1.2, [5, 5], 0.6);
  arrow(ctx, V.sx(0), V.sy(0), V.sx(v[0]), V.sy(v[1]), C.cyan, 2.6);
  arrow(ctx, V.sx(0), V.sy(0), V.sx(sp.w[0]), V.sy(sp.w[1]), C.orange, 2.6);
  if (sp.rn > 1e-9) seg(ctx, V.sx(sp.p * v[0]), V.sy(sp.p * v[1]), V.sx(sp.w[0]), V.sy(sp.w[1]), C.pink, 2.2);
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c1b')));
  title(ctx, t('c1btitle'), 8, 17, W - 16);
  const G = graph(ctx, { l: 34, r: W - 16, t: 30, b: H - 24 }, { x0: 0, x1: 180, y0: -90, y1: 90, yTicks: [[-90, '−90°'], [-45, '−45°'], [0, '0°'], [45, '45°'], [90, '90°']], xTicks: [[0, '0°'], [45, '45°'], [90, '90°'], [135, '135°'], [180, '180°']].filter((_, i) => W > 280 || i % 2 === 0) });
  (e.dirs || []).forEach(dg => seg(ctx, G.x(dg), G.P.t, G.x(dg), G.P.b, C.text, 1.2, [5, 4]));
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.2; ctx.beginPath(); let pen = false, prev = null;
  for (let i = 0; i <= 360; i++) {
    if (!s1.seen[i]) { pen = false; continue; }
    const a = M.turn(A, M.unit(i / 2)); if (a === null) { pen = false; continue; }
    if (pen && prev !== null && Math.abs(a - prev) > 90) pen = false; // a jump of 180° is the fold, not a real change
    const X = G.x(i / 2), Y = G.y(a); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); prev = a;
  }
  ctx.stroke(); ctx.restore();
  if (tn !== null) dot(ctx, G.x(th), G.y(tn), 5.5, C.text);
  const prog = s1.play ? t('s1progress', { c: s1.play, N: 360 }) : '';
  let msg;
  if (tn === null) msg = t('s1zero', { th: th.toFixed(1) });
  else if (sp.rn <= 64 * Number.EPSILON * Math.max(1, Math.hypot(...sp.w))) msg = t('s1exact', { th: th.toFixed(1), p: trim(sp.p, 4) });
  else msg = t('s1readout', { th: th.toFixed(1), a: fmt(tn, 2), p: fmt(sp.p, 3), r: fmt(sp.rn, 3) }) + (Math.abs(tn) < 1 ? t('s1near') : '');
  $('r1').textContent = prog + msg;
}

/* ---------- step 2: det(A − λI) = 0 ---------- */
const BOX2 = { x0: -4, x1: 4, y0: -4, y1: 4 };
const s2 = { l: 1 }; // exact λ (a jump to a root can land between slider steps)
function draw2() {
  const A = getA(), e = M.eig2(A), l = s2.l, S = M.shift(A, l), dS = M.det(S);
  $('l2v').textContent = Math.abs(l * 100 - Math.round(l * 100)) < 1e-6 ? l.toFixed(2) : l.toFixed(4);
  const real = e.type !== 'complex';
  $('jump2a').disabled = !real; $('jump2b').disabled = !(real && e.type === 'two');
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2title', { A: matStr(A) }), 8, 17, W - 16);
  const ys = [-4, -2, 0, 2, 4, 6, 8];
  const G = graph(ctx, { l: 30, r: W - 12, t: 30, b: H - 24 }, { x0: -3, x1: 5, y0: -4, y1: 8, yTicks: ys.map(v => [v, trim(v)]), xTicks: [-2, 0, 2, 4].map(v => [v, trim(v)]) });
  ctx.save(); ctx.beginPath(); ctx.rect(G.P.l, G.P.t, G.P.r - G.P.l, G.P.b - G.P.t); ctx.clip();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath();
  for (let i = 0; i <= 320; i++) { const x = -3 + 8 * i / 320, Y = G.y(M.charPoly(A, x)); if (!i) ctx.moveTo(G.x(x), Y); else ctx.lineTo(G.x(x), Y); } ctx.stroke();
  if (real) [e.l1, e.l2].forEach(r => { if (r >= -3 && r <= 5) dot(ctx, G.x(r), G.y(0), 6, C.green); });
  seg(ctx, G.x(l), G.P.t, G.x(l), G.P.b, C.text, 1.2, [4, 4]);
  if (dS >= -4 && dS <= 8) dot(ctx, G.x(l), G.y(dS), 5, C.text);
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c2b')));
  title(ctx, t('c2btitle', { l: l.toFixed(2) }), 8, 17, W - 16);
  const V = planeView(W, H, BOX2); planeAxes(ctx, V);
  ctx.save(); clip(ctx, V);
  ctx.strokeStyle = C.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(V.sx(0), V.sy(0), V.s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(183,156,255,0.22)'; ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 120; i++) { const w = M.apply(S, M.unit(i * 3)); if (!i) ctx.moveTo(V.sx(w[0]), V.sy(w[1])); else ctx.lineTo(V.sx(w[0]), V.sy(w[1])); } ctx.closePath(); ctx.fill(); ctx.stroke();
  const nd = Math.abs(dS) < 0.02 ? M.nullDir(S) : null;
  if (nd !== null) dline(ctx, V, nd, C.text, 1.6);
  ctx.restore();
  const head = t('s2head', { tr: trim(e.tr, 3), det: trim(e.det, 3), disc: trim(e.disc, 3) });
  const roots = real ? (e.type === 'two' ? t('s2roots2', { l1: trim(e.l1, 3), l2: trim(e.l2, 3) }) : t('s2roots1', { l1: trim(e.l1, 3) })) : t('s2rootsC', { re: trim(e.re, 3), im: trim(e.im, 3) });
  const now = t('s2now', { l: l.toFixed(2), d: fmt(dS, 3), area: (Math.PI * Math.abs(dS)).toFixed(3) }) + (nd !== null ? t(Math.abs(dS) < 1e-9 ? 's2flat' : 's2nearflat', { d: nd.toFixed(1) }) : '');
  $('r2').textContent = head + roots + now;
}

/* ---------- step 3: not every matrix has real eigen-directions ---------- */
const s3 = { mode: 'family', hist: [] };
function A3() { return s3.mode === 'family' ? M.family3(num('k3')) : M.PRESETS3[s3.mode]; }
function draw3() {
  const A = A3(), e = M.eig2(A);
  $('k3v').textContent = trim(num('k3'), 2);
  document.querySelectorAll('#presets3 .btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === s3.mode)));
  let { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3title', { A: matStr(A) }), 8, 17, W - 16);
  const V = planeView(W, H, { x0: -2.6, x1: 2.6, y0: -2.6, y1: 2.6 }); planeAxes(ctx, V); ring(ctx, V, A, e);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  title(ctx, t('c3btitle'), 8, 17, W - 16);
  const G = graph(ctx, { l: 30, r: W - 12, t: 30, b: H - 24 }, { x0: -3.5, x1: 3.5, y0: -1.5, y1: 3, yTicks: [-1, 0, 1, 2, 3].map(v => [v, trim(v)]), xTicks: [-3, -2, -1, 0, 1, 2, 3].filter(v => W > 300 || v % 2 !== 0 || v === 0).map(v => [v, trim(v)]) });
  ctx.save(); ctx.beginPath(); ctx.rect(G.P.l, G.P.t, G.P.r - G.P.l, G.P.b - G.P.t); ctx.clip();
  ctx.fillStyle = 'rgba(255,180,84,0.16)'; ctx.beginPath(); ctx.moveTo(G.x(-3.5), G.y(3)); for (let i = 0; i <= 140; i++) { const x = -3.5 + 7 * i / 140; ctx.lineTo(G.x(x), G.y(x * x / 4)); } ctx.lineTo(G.x(3.5), G.y(3)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 140; i++) { const x = -3.5 + 7 * i / 140; if (!i) ctx.moveTo(G.x(x), G.y(x * x / 4)); else ctx.lineTo(G.x(x), G.y(x * x / 4)); } ctx.stroke();
  s3.hist.forEach(([tr, dt]) => dot(ctx, G.x(tr), G.y(dt), 3.2, C.ghost));
  dot(ctx, G.x(e.tr), G.y(e.det), 6, C.text);
  ctx.restore();
  $('r3').textContent = t('s3readout', { tr: trim(e.tr, 3), det: trim(e.det, 3), disc: trim(e.disc, 3), q: trim(e.tr * e.tr / 4, 3) }) + eigText(e) + t('s3why_' + e.type);
}
function push3() { const e = M.eig2(A3()); s3.hist.push([e.tr, e.det]); if (s3.hist.length > 60) s3.hist.shift(); }

/* ---------- step 4: apply A again and again ---------- */
const s4 = { preset: 'default' };
function draw4() {
  const A = M.PRESETS4[s4.preset], st = num('s4'), K = num('k4'), run = M.power(A, M.unit(st), 12), e = run.eig;
  $('s4v').textContent = st + '°'; $('k4v').textContent = String(K);
  document.querySelectorAll('#presets4 .btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.preset === s4.preset)));
  let { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4title', { A: matStr(A) }), 8, 17, W - 16);
  const V = planeView(W, H, { x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3 }); planeAxes(ctx, V);
  ctx.save(); clip(ctx, V);
  ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(V.sx(0), V.sy(0), V.s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  if (e.domIdx !== null) { dline(ctx, V, e.dirs[e.domIdx], C.text, 1.6); dline(ctx, V, e.dirs[1 - e.domIdx], C.ghost, 1.4); }
  for (let k = 0; k <= K; k++) { const u = run.steps[k].u; arrow(ctx, V.sx(0), V.sy(0), V.sx(u[0]), V.sy(u[1]), C.cyan, k === K ? 2.8 : 1.4, k === K ? 1 : 0.25 + 0.5 * k / Math.max(1, K)); }
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c4b')));
  title(ctx, t('c4btitle'), 8, 17, W - 16);
  const G = graph(ctx, { l: 40, r: W - 12, t: 30, b: H - 24 }, { x0: 0, x1: 12, y0: -6, y1: 2, ylog: true, yTicks: [[100, '100°'], [10, ''], [1, '1°'], [0.1, ''], [0.01, '0.01°'], [0.001, ''], [1e-4, '10⁻⁴°'], [1e-5, ''], [1e-6, '10⁻⁶°']], xTicks: [0, 2, 4, 6, 8, 10, 12].map(v => [v, String(v)]) });
  if (e.domIdx !== null) {
    ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.4)'; ctx.lineWidth = 1.4; ctx.beginPath();
    let pen = false; run.steps.forEach((s, k) => { if (s.ang < 1e-6) { pen = false; return; } const Y = G.y(s.ang); if (!pen) ctx.moveTo(G.x(k), Y); else ctx.lineTo(G.x(k), Y); pen = true; }); ctx.stroke(); ctx.restore();
    run.steps.forEach((s, k) => { if (k <= K && s.ang >= 1e-6) dot(ctx, G.x(k), G.y(s.ang), k === K ? 6 : 4, k === K ? C.text : C.cyan); });
  }
  const s = run.steps[K], prev = K > 0 ? run.steps[K - 1] : null;
  if (e.domIdx === null) { $('r4').textContent = t('s4nodom'); return; }
  const ratio = Math.abs(e.domIdx === 0 ? e.l2 / e.l1 : e.l1 / e.l2), dom = e.domIdx === 0 ? e.l1 : e.l2;
  const angTxt = s.ang < 1e-9 ? '0' : (s.ang < 0.01 ? s.ang.toExponential(2).replace('-', '−') : s.ang.toFixed(3));
  const stepTxt = prev && prev.ang > 1e-9 ? t('s4ratio', { r: (s.ang / prev.ang).toFixed(3), g: s.growth.toFixed(4) }) : '';
  $('r4').textContent = t('s4readout', { k: K, ang: angTxt, q: ratio.toFixed(3), l: trim(dom, 4) }) + stepTxt;
}

/* ---------- step 5: the spread of a data cloud ---------- */
function draw5() {
  const rho = num('rho5'), th = num('th5'), pts = M.cloud(rho), { S, mean } = M.covariance(pts), e = M.eig2(S), vth = M.varAlong(S, th);
  $('rho5v').textContent = fmt(rho, 1); $('th5v').textContent = th + '°';
  let { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5title'), 8, 17, W - 16);
  const V = planeView(W, H, { x0: -3.6, x1: 3.6, y0: -3.6, y1: 3.6 }); planeAxes(ctx, V);
  ctx.save(); clip(ctx, V);
  const u = M.unit(th);
  pts.forEach(([x, y]) => { ctx.fillStyle = 'rgba(154,170,189,0.6)'; ctx.beginPath(); ctx.arc(V.sx(x), V.sy(y), 2.4, 0, 7); ctx.fill(); });
  e.dirs.forEach((dg, i) => { const L = 2 * Math.sqrt(i ? e.l2 : e.l1), w = M.unit(dg); seg(ctx, V.sx(mean[0] - L * w[0]), V.sy(mean[1] - L * w[1]), V.sx(mean[0] + L * w[0]), V.sy(mean[1] + L * w[1]), C.text, 1.6, [6, 5]); });
  seg(ctx, V.sx(mean[0] - 4 * u[0]), V.sy(mean[1] - 4 * u[1]), V.sx(mean[0] + 4 * u[0]), V.sy(mean[1] + 4 * u[1]), C.orange, 2);
  pts.forEach(([x, y]) => { const s = (x - mean[0]) * u[0] + (y - mean[1]) * u[1]; ctx.fillStyle = 'rgba(255,180,84,0.7)'; ctx.beginPath(); ctx.arc(V.sx(mean[0] + s * u[0]), V.sy(mean[1] + s * u[1]), 2, 0, 7); ctx.fill(); });
  ctx.restore();
  ({ ctx, W, H } = fitCanvas($('c5b')));
  title(ctx, t('c5btitle'), 8, 17, W - 16);
  const top = Math.max(2, Math.ceil(e.l1 * 2) / 2);
  const G = graph(ctx, { l: 30, r: W - 18, t: 30, b: H - 24 }, { x0: 0, x1: 180, y0: 0, y1: top, yTicks: [0, top / 2, top].map(v => [v, trim(v, 1)]), xTicks: [[0, '0°'], [45, '45°'], [90, '90°'], [135, '135°'], [180, '180°']].filter((_, i) => W > 280 || i % 2 === 0) });
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.4; ctx.beginPath();
  for (let i = 0; i <= 180; i++) { const Y = G.y(M.varAlong(S, i)); if (!i) ctx.moveTo(G.x(i), Y); else ctx.lineTo(G.x(i), Y); } ctx.stroke(); ctx.restore();
  e.dirs.forEach(dg => seg(ctx, G.x(dg), G.P.t, G.x(dg), G.P.b, C.text, 1.2, [5, 4]));
  dot(ctx, G.x(th), G.y(vth), 6, C.orange);
  const d1 = e.dirs[0], d2 = e.dirs[1];
  $('r5').textContent = t('s5readout', { th, v: vth.toFixed(3), l1: e.l1.toFixed(3), l2: e.l2.toFixed(3), d1: d1.toFixed(1), d2: d2.toFixed(1), gap: Math.abs(d1 - d2).toFixed(1), sum: (e.l1 + e.l2).toFixed(3), tr: (S[0][0] + S[1][1]).toFixed(3) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); labelButtons(); }
function labelButtons() { document.querySelectorAll('[data-key]').forEach(b => { b.textContent = t(b.dataset.key); }); }

function setup() {
  ['ma', 'mb', 'mc', 'md'].forEach(id => $(id).addEventListener('input', () => { s1.seen.fill(0); s1.last = null; mark1(s1.th); s2.l = num('l2'); draw0(); draw1(); draw2(); }));
  $('reset0').addEventListener('click', () => { const A = M.DEFAULT_A; $('ma').value = A[0][0]; $('mb').value = A[0][1]; $('mc').value = A[1][0]; $('md').value = A[1][1]; s1.seen.fill(0); s1.last = null; mark1(s1.th); s2.l = num('l2'); draw0(); draw1(); draw2(); });

  $('th1').addEventListener('input', () => { stopAnim('s1'); s1.play = 0; s1.th = num('th1'); mark1(s1.th); draw1(); });
  $('sweep1').addEventListener('click', () => {
    s1.seen.fill(0); s1.last = 0;
    animate('s1', 6000, p => { const i = Math.round(p * 360); s1.play = i; s1.th = i / 2; $('th1').value = (i / 2).toFixed(1); mark1(i / 2); draw1(); }, () => { s1.play = 0; draw1(); });
  });
  const jump = i => { const e = M.eig2(getA()); if (!e.dirs || e.dirs.length <= i) return; stopAnim('s1'); s1.play = 0; s1.th = e.dirs[i]; $('th1').value = String(e.dirs[i]); mark1(s1.th); draw1(); };
  $('jump1a').addEventListener('click', () => jump(0)); $('jump1b').addEventListener('click', () => jump(1));

  $('l2').addEventListener('input', () => { s2.l = num('l2'); draw2(); });
  const jumpL = i => { const e = M.eig2(getA()); if (e.type === 'complex') return; s2.l = i ? e.l2 : e.l1; $('l2').value = String(s2.l); draw2(); };
  $('jump2a').addEventListener('click', () => jumpL(0)); $('jump2b').addEventListener('click', () => jumpL(1));

  ['rotation', 'shear', 'scalar', 'reflection'].forEach(m => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small toggle'; b.dataset.step = '3'; b.dataset.mode = m; b.dataset.key = 'p3_' + m;
    b.addEventListener('click', () => { s3.mode = m; push3(); draw3(); }); $('presets3').appendChild(b);
  });
  $('k3').addEventListener('input', () => { s3.mode = 'family'; push3(); draw3(); });
  push3();

  Object.keys(M.PRESETS4).forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small toggle'; b.dataset.step = '4'; b.dataset.preset = k; b.dataset.key = 'p4_' + k;
    b.addEventListener('click', () => { stopAnim('s4'); s4.preset = k; draw4(); }); $('presets4').appendChild(b);
  });
  ['s4', 'k4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); draw4(); }));
  $('play4').addEventListener('click', () => animate('s4', 13 * 450, p => { $('k4').value = String(Math.min(12, Math.floor(p * 13))); draw4(); }));

  ['rho5', 'th5'].forEach(id => $(id).addEventListener('input', draw5));
  $('jump5').addEventListener('click', () => { const e = M.eig2(M.covariance(M.cloud(num('rho5'))).S); $('th5').value = String(Math.round(e.dirs[0])); draw5(); });

  mark1(s1.th);
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(en.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshEigen = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
