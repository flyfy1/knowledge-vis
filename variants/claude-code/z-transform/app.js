'use strict';
// Z-transform lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.Z_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.Z_MODEL;
const t = (...a) => window.Z_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, trailing zeros trimmed only after a decimal point; −0 shown as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };

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

// Panel title: shrinks the font until it fits the canvas width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Plot panel: title in its own row above, y ticks to the left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function curve(ctx, m, xs, fn, color, { lw = 2, dash = null, alpha = 1, clip = true } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  if (clip) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
  ctx.beginPath(); xs.forEach((v, i) => { const X = m.x(v), Y = m.y(fn(v, i)); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = true) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], alpha = 0.7) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
const grid = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);

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

function cross(ctx, X, Y, r, color, lw = 2.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X - r, Y - r); ctx.lineTo(X + r, Y + r); ctx.moveTo(X + r, Y - r); ctx.lineTo(X - r, Y + r); ctx.stroke(); ctx.restore(); }
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function axisLine(ctx, m, v, color = C.text, alpha = 0.55) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); ctx.restore(); }
const cfmt = (z, d = 3) => fmt(z[0], d) + (z[1] < 0 ? ' − ' : ' + ') + fmt(Math.abs(z[1]), d) + 'j';
function niceMax(v, opts = [1, 1.5, 2, 3, 5, 10, 15, 20]) { for (const o of opts) if (v <= o * 1.02) return o; return opts[opts.length - 1]; }

function ring(ctx, X, Y, r, color, lw = 2.2) { ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = C.bg; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
// Complex-plane panel with equal scales on both axes; R is the half-width that must fit.
function zpanel(ctx, W, top, bottom, R, title, ticks = [-1, 0, 1]) {
  const l = 38, r = W - 12, unit = Math.min(r - l, bottom - top) / (2 * R), xr = (r - l) / 2 / unit, yr = (bottom - top) / 2 / unit;
  const m = panel(ctx, W, { top, bottom, xMin: -xr, xMax: xr, yMin: -yr, yMax: yr, yTicks: ticks.filter(v => Math.abs(v) <= yr), xTicks: true, xSteps: [0.5, 1, 2], minPx: 30, title });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(m.x(0), m.P.t); ctx.lineTo(m.x(0), m.P.b); ctx.stroke(); ctx.restore();
  m.unit = unit; return m;
}
function circle(ctx, m, rad, color, dash = [5, 4], lw = 1.5, alpha = 0.9) { ctx.save(); clipTo(ctx, m); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.arc(m.x(0), m.y(0), rad * m.unit, 0, 7); ctx.stroke(); ctx.restore(); }
function stems(ctx, m, ns, f, color, lim) {
  ctx.save(); clipTo(ctx, m);
  for (const n of ns) { const v = f(n), vc = Math.max(-lim, Math.min(lim, v)); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x(n), m.y(0)); ctx.lineTo(m.x(n), m.y(vc)); ctx.stroke(); ctx.fillStyle = Math.abs(v) > lim ? C.pink : color; ctx.beginPath(); ctx.arc(m.x(n), m.y(vc), 3, 0, 7); ctx.fill(); }
  ctx.restore();
}

/* ---------- step 0: powers of z0 ---------- */
function draw0() {
  const r = num('r0'), thd = num('th0'), th = thd * Math.PI / 180;
  $('r0v').textContent = fmt(r, 2); $('th0v').textContent = thd + '°';
  let { ctx, W, H } = fitCanvas($('c0'));
  const A = zpanel(ctx, W, 26, H - 26, 1.6, t('c0a'));
  circle(ctx, A, 1, C.ghost);
  ctx.save(); clipTo(ctx, A); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let n = 0; n <= 24; n++) { const z = M.cpow(M.polar(r, th), n); if (n === 0) ctx.moveTo(A.x(z[0]), A.y(z[1])); else ctx.lineTo(A.x(z[0]), A.y(z[1])); }
  ctx.stroke(); ctx.globalAlpha = 1;
  for (let n = 24; n >= 0; n--) { const z = M.cpow(M.polar(r, th), n); ctx.globalAlpha = 0.25 + 0.75 * (1 - n / 24); dot(ctx, A.x(z[0]), A.y(z[1]), 3.2, C.orange, false); }
  ctx.restore();
  const z0 = M.polar(r, th); dot(ctx, A.x(z0[0]), A.y(z0[1]), 6.5, C.cyan);
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -0.8, xMax: 30.8, yMin: -2.2, yMax: 2.2, yTicks: [-2, -1, 0, 1, 2], xTicks: true, xSteps: [5, 10], minPx: 30, title: t('c0b') });
  stems(ctx, B, grid(0, 30, 30), n => M.seq0(r, th, n), C.orange, 2.15);
  const kind = Math.abs(r - 1) < 1e-9 ? t('s0on') : r < 1 ? t('s0in') : t('s0out');
  const per = thd === 0 ? t('s0noper') : thd === 180 ? t('s0half') : t('s0per', { p: fmt(360 / thd, 2) });
  $('rd0').textContent = t('s0readout', { r: fmt(r, 2), th: thd, r10: fmt(Math.pow(r, 10), 3), kind, per });
}

/* ---------- step 1: partial sums and the ROC ---------- */
const PHI = Math.PI / 4;
const s1 = { tried: new Set([1.2]) };
function draw1() {
  const a = num('a1'), rho = num('rho1'), z = M.polar(rho, PHI), q = Math.abs(a) / rho;
  $('a1v').textContent = fmt(a, 1); $('rho1v').textContent = fmt(rho, 2);
  let { ctx, W, H } = fitCanvas($('c1'));
  const A = zpanel(ctx, W, 26, H - 26, 2.2, t('c1a'), [-2, -1, 0, 1, 2]);
  ctx.save(); clipTo(ctx, A); ctx.fillStyle = 'rgba(103,215,249,0.16)'; ctx.beginPath(); ctx.rect(A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t); ctx.moveTo(A.x(0) + Math.abs(a) * A.unit, A.y(0)); ctx.arc(A.x(0), A.y(0), Math.abs(a) * A.unit, 0, 2 * Math.PI, true); ctx.fill('evenodd'); ctx.restore();
  circle(ctx, A, Math.abs(a), C.cyan, [4, 3], 1.5);
  circle(ctx, A, 1, C.ghost, [2, 4], 1, 0.6);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.4; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(A.x(0), A.y(0)); ctx.lineTo(A.x(2.2 * Math.cos(PHI)), A.y(2.2 * Math.sin(PHI))); ctx.stroke(); ctx.restore();
  cross(ctx, A.x(a), A.y(0), 6, C.pink, 2.6);
  for (const v of s1.tried) if (v !== rho) { const p = M.polar(v, PHI); dot(ctx, A.x(p[0]), A.y(p[1]), 3.8, Math.abs(a) < v ? C.green : C.pink); }
  dot(ctx, A.x(z[0]), A.y(z[1]), 6.5, C.cyan);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const B = zpanel(ctx, W, 26, H - 26, 3.2, t('c1b'), [-3, -2, -1, 0, 1, 2, 3]);
  const S = M.partialSums(a, z, 40), cf = M.closed1(a, z), conv = q < 1 - 1e-12;
  ctx.save(); clipTo(ctx, B); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.beginPath();
  S.forEach((s, i) => { const X = B.x(Math.max(-50, Math.min(50, s[0]))), Y = B.y(Math.max(-50, Math.min(50, s[1]))); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke();
  S.forEach((s, i) => { if (Math.abs(s[0]) < 50 && Math.abs(s[1]) < 50) dot(ctx, B.x(s[0]), B.y(s[1]), i === 40 ? 4.5 : 2.4, C.orange, false); });
  ctx.restore();
  if (conv) ring(ctx, B.x(cf[0]), B.y(cf[1]), 7, C.green, 2.4);
  const s40 = S[40];
  const verdict = a === 0 ? t('s1zero') : Math.abs(q - 1) < 1e-9 ? t('s1edge') : conv ? t('s1conv', { s40: cfmt(s40), cf: cfmt(cf), err: M.cabs(M.csub(s40, cf)).toExponential(1) }) : t('s1div', { m40: fmt(M.cabs(s40), 1) });
  $('rd1').textContent = t('s1readout', { a: fmt(a, 1), rho: fmt(rho, 2), q: fmt(q, 3), verdict });
}

/* ---------- step 2: z = e^{sT} ---------- */
const s2 = { trail: [[-0.3, 1]] };
function draw2() {
  const sg = num('sg2'), w = num('w2'), m = M.s2z(sg, w);
  $('sg2v').textContent = fmt(sg, 2); $('w2v').textContent = fmt(w, 1);
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -1.6, xMax: 0.6, yMin: -7.5, yMax: 7.5, yTicks: [-6, -3, 0, 3, 6], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c2a') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(A.P.l, A.y(Math.PI), A.P.r - A.P.l, A.y(-Math.PI) - A.y(Math.PI)); ctx.restore();
  for (const v of [-3 * Math.PI, -Math.PI, Math.PI, 3 * Math.PI]) { ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.P.l, A.y(v)); ctx.lineTo(A.P.r, A.y(v)); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A.x(0), A.P.t); ctx.lineTo(A.x(0), A.P.b); ctx.stroke(); ctx.restore();
  for (let k = -3; k <= 3; k++) { const v = w + 2 * Math.PI * k; if (k !== 0 && v >= -7.5 && v <= 7.5) ring(ctx, A.x(sg), A.y(v), 5, C.orange, 2); }
  dot(ctx, A.x(sg), A.y(w), 6.5, C.cyan);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const B = zpanel(ctx, W, 26, H - 26, 1.75, t('c2b'));
  circle(ctx, B, 1, C.ghost);
  for (const [a, b] of s2.trail) { const z = M.s2z(a, b).z; dot(ctx, B.x(z[0]), B.y(z[1]), 2.8, C.text, false); }
  dot(ctx, B.x(m.z[0]), B.y(m.z[1]), 6.5, C.cyan);
  const where = Math.abs(sg) < 1e-9 ? t('s2onc') : sg < 0 ? t('s2inside') : t('s2outside');
  const twin = Math.abs(w) > Math.PI + 1e-9 ? t('s2twin') : '';
  $('rd2').textContent = t('s2readout', { sg: fmt(sg, 2), w: fmt(w, 1), r: fmt(m.r, 3), ang: fmt(m.ang, 3), deg: fmt(m.ang * 180 / Math.PI, 1), where, twin });
}

/* ---------- step 3: three ROCs ---------- */
const P1 = 0.5;
const s3 = { roc: 'ring' };
function draw3() {
  const p2 = num('p2'), roc = s3.roc, [lo, hi] = M.rocRange(P1, p2, roc);
  $('p2v').textContent = fmt(p2, 2);
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = zpanel(ctx, W, 26, H - 26, 1.8, t('c3a'));
  ctx.save(); clipTo(ctx, A); ctx.fillStyle = 'rgba(103,215,249,0.20)'; ctx.beginPath();
  if (hi === Infinity) ctx.rect(A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t); else { ctx.moveTo(A.x(0) + hi * A.unit, A.y(0)); ctx.arc(A.x(0), A.y(0), hi * A.unit, 0, 2 * Math.PI); }
  if (lo > 0) { ctx.moveTo(A.x(0) + lo * A.unit, A.y(0)); ctx.arc(A.x(0), A.y(0), lo * A.unit, 0, 2 * Math.PI, true); }
  ctx.fill('evenodd'); ctx.restore();
  circle(ctx, A, Math.abs(P1), C.muted, [4, 3], 1.2); circle(ctx, A, Math.abs(p2), C.muted, [4, 3], 1.2);
  circle(ctx, A, 1, C.text, null, 1.8, 0.9);
  cross(ctx, A.x(P1), A.y(0), 6, C.pink, 2.6); cross(ctx, A.x(p2), A.y(0), 6, C.pink, 2.6);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -12.8, xMax: 12.8, yMin: -3, yMax: 3, yTicks: [-2, -1, 0, 1, 2], xTicks: true, xSteps: [2, 4, 6], minPx: 30, title: t('c3b') });
  stems(ctx, B, grid(-12, 12, 24), n => M.seq3(P1, p2, roc, n), C.cyan, 2.9);
  const zm = roc === 'out' ? Math.abs(p2) + 0.3 : roc === 'ring' ? Math.sqrt(Math.abs(P1 * p2)) : P1 - 0.2, z = M.polar(zm, 0.7);
  const stab = M.stable3(P1, p2, roc);
  const range = roc === 'out' ? '|z| > ' + fmt(Math.abs(p2), 2) : roc === 'ring' ? fmt(P1, 2) + ' < |z| < ' + fmt(Math.abs(p2), 2) : '|z| < ' + fmt(P1, 2);
  const shape = t(roc === 'out' ? 's3right' : roc === 'ring' ? 's3two' : 's3left');
  $('rd3').textContent = t('s3readout', { p2: fmt(p2, 2), range, shape, has: t(stab ? 's3has' : 's3not'), stab: t(stab ? 's3stable' : 's3unstable'), zm: fmt(zm, 3), num: cfmt(M.series3(P1, p2, roc, z)), form: cfmt(M.X3(P1, p2, z)) });
}

/* ---------- step 4: gain on the unit circle ---------- */
const s4 = { tried: new Set([0.5]), walking: false };
function draw4() {
  const W4 = num('w4'), r = num('r4'), g = M.resGeometry(r, W4), F = M.res(r), pk = M.peakInfo(r, M.OMP, 4000);
  $('w4v').textContent = fmt(W4, 2); $('r4v').textContent = fmt(r, 2);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = zpanel(ctx, W, 26, H - 26, 1.3, t('c4a'));
  circle(ctx, A, 1, C.ghost);
  const e = M.polar(1, W4), p = M.polar(r, M.OMP);
  ctx.save(); ctx.lineWidth = 2.2; ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(A.x(e[0]), A.y(e[1])); ctx.lineTo(A.x(p[0]), A.y(p[1])); ctx.stroke();
  ctx.strokeStyle = C.green; ctx.beginPath(); ctx.moveTo(A.x(e[0]), A.y(e[1])); ctx.lineTo(A.x(p[0]), A.y(-p[1])); ctx.stroke(); ctx.restore();
  cross(ctx, A.x(p[0]), A.y(p[1]), 6, C.pink, 2.6); cross(ctx, A.x(p[0]), A.y(-p[1]), 6, C.pink, 2.6);
  dot(ctx, A.x(e[0]), A.y(e[1]), 6.5, C.cyan);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: Math.PI, yMin: -10, yMax: 36, yTicks: [-10, 0, 10, 20, 30], xTicks: true, xSteps: [0.5, 1], minPx: 30, title: t('c4b') });
  const dbOf = v => 20 * Math.log10(M.resGeometry(r, v).gain);
  curve(ctx, B, grid(0, Math.PI, 700), dbOf, C.text, { lw: 1.8 });
  for (const v of s4.tried) if (v !== W4) dot(ctx, B.x(v), B.y(dbOf(v)), 3.3, C.text);
  vline(ctx, B.x(W4), B.y(dbOf(W4)), B.P.b, C.cyan, [4, 4], 0.8); dot(ctx, B.x(W4), B.y(dbOf(W4)), 6.5, C.cyan);
  const prog = s4.walking ? t('s4prog', { c: s4.tried.size, N: 158 }) : '';
  $('rd4').textContent = t('s4readout', { prog, w: fmt(W4, 2), d1: fmt(g.d1, 3), d2: fmt(g.d2, 3), g: fmt(g.gain, 3), gdb: fmt(20 * Math.log10(g.gain), 1), meas: fmt(M.measureGain(F.b, F.a, W4), 3), pw: fmt(pk.at, 3), pk: fmt(pk.peak, 2), bw: fmt(pk.width, 3), bw0: fmt(2 * (1 - r), 3) });
}

/* ---------- step 5: notch ---------- */
function draw5() {
  const w0 = num('w05'), rho = num('rho5'), F = M.notch(w0, rho), S = M.S5;
  $('w05v').textContent = fmt(w0, 2); $('rho5v').textContent = fmt(rho, 2);
  const x = Array.from({ length: S.L }, (_, n) => M.input5(n)), y = M.filter(F.b, F.a, x);
  let { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: S.L - 1, yMin: -2.6, yMax: 2.6, yTicks: [-2, -1, 0, 1, 2], xTicks: true, xSteps: [20, 40, 80], minPx: 30, title: t('c5b') });
  curve(ctx, A, grid(0, S.L - 1, S.L - 1), (v, i) => x[i], C.ghost, { lw: 1.1, alpha: 0.8 });
  curve(ctx, A, grid(0, S.L - 1, S.L - 1), (v, i) => Math.max(-2.7, Math.min(2.7, y[i])), C.cyan, { lw: 2 });
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = zpanel(ctx, W, 26, H - 26, 1.3, t('c5a'));
  circle(ctx, B, 1, C.ghost);
  for (const sgn of [1, -1]) { const zr = M.polar(1, sgn * w0), pl = M.polar(rho, sgn * w0); ring(ctx, B.x(zr[0]), B.y(zr[1]), 5.5, C.green); cross(ctx, B.x(pl[0]), B.y(pl[1]), 5.5, C.pink, 2.4); }
  // the two input frequencies, marked on the circle
  for (const [v, c] of [[S.want, C.text], [S.hum, C.orange]]) { const e = M.polar(1, v); dot(ctx, B.x(e[0]), B.y(e[1]), 3.2, c, false); }
  const gw = M.cabs(M.Hw(F.b, F.a, S.want)), gh = M.cabs(M.Hw(F.b, F.a, S.hum));
  const hit = Math.abs(w0 - S.hum) < 1e-9;
  $('rd5').textContent = t('s5readout', { w0: fmt(w0, 2), rho: fmt(rho, 2), gw: fmt(gw, 3), mw: fmt(M.measureGain(F.b, F.a, S.want), 3), gh: fmt(gh, 3), mh: fmt(M.measureGain(F.b, F.a, S.hum), 3), ns: M.settle(rho), note: t(hit ? 's5hit' : 's5miss') });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['r0', 'th0'].forEach(id => $(id).addEventListener('input', draw0));
  $('a1').addEventListener('input', draw1);
  $('rho1').addEventListener('input', () => { s1.tried.add(num('rho1')); draw1(); });
  ['sg2', 'w2'].forEach(id => $(id).addEventListener('input', () => { s2.trail.push([num('sg2'), num('w2')]); if (s2.trail.length > 400) s2.trail.shift(); draw2(); }));
  $('p2').addEventListener('input', draw3);
  const setRoc = r => { s3.roc = r; [['out', 'rocOut'], ['ring', 'rocRing'], ['in', 'rocIn']].forEach(([k, id]) => $(id).setAttribute('aria-pressed', String(k === r))); draw3(); };
  $('rocOut').addEventListener('click', () => setRoc('out')); $('rocRing').addEventListener('click', () => setRoc('ring')); $('rocIn').addEventListener('click', () => setRoc('in'));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  $('w4').addEventListener('input', () => { stopAnim('s4'); s4.walking = false; s4.tried.add(num('w4')); draw4(); });
  $('r4').addEventListener('input', () => { s4.tried = new Set([num('w4')]); draw4(); });
  $('walk4').addEventListener('click', () => {
    s4.tried = new Set(); s4.walking = true;
    animate('s4', 6000, p => { const k = Math.min(157, Math.floor(p * 157.999)); for (let i = 0; i <= k; i++) s4.tried.add(Math.round(i * 2) / 100); $('w4').value = (k * 0.02).toFixed(2); draw4(); }, () => { s4.walking = false; draw4(); });
  });
  ['w05', 'rho5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshZ = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
