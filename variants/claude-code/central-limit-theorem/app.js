'use strict';
// Central limit theorem lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, dot, curve and readout comes from window.CLT_MODEL (model.js).
// Canvas text is limited to panel titles and axis ticks; tick labels are placed with a collision check.
(function () {

const $ = id => document.getElementById(id);
const M = window.CLT_MODEL;
const t = (...a) => window.CLT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', cell: '#1b2737' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s) || '0'; };
const pct1 = v => fmt(v * 100, 1) + '%';
const log10 = Math.log10;

function fitCanvas(canvas, hOf) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = Math.round(hOf(width));
  canvas.style.height = height + 'px';
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
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Tick labels placed in priority order; a label that would touch an already placed one is skipped.
function placeLabels(ctx, items, axis, lo, hi) {
  const taken = [];
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const it of items) {
    const w = ctx.measureText(it.text).width;
    let a, b;
    if (axis === 'x') { a = it.pos - w / 2; b = it.pos + w / 2; if (a < lo) { a = lo; b = lo + w; } if (b > hi) { b = hi; a = hi - w; } }
    else { a = it.pos - 7; b = it.pos + 7; }
    if (taken.some(([p, q]) => a < q + 6 && b > p - 6)) continue;
    taken.push([a, b]);
    if (axis === 'x') { ctx.textAlign = 'left'; ctx.fillText(it.text, a, it.y); }
    else { ctx.textAlign = 'right'; ctx.fillText(it.text, it.x, it.pos + 4); }
  }
  ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Generic plot panel: title row above, y ticks on the left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  ctx.restore();
  placeLabels(ctx, o.yTicks.map(v => ({ text: (o.yFmt || fmt)(v), pos: y(v), x: P.l - 6 })), 'y');
  if (o.xTicks) {
    const xs = [];
    if (Array.isArray(o.xTicks)) o.xTicks.forEach(v => { if (v >= o.xMin - 1e-9 && v <= o.xMax + 1e-9) xs.push(v); });
    else { const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200]); for (let v = Math.ceil(o.xMin / step - 1e-9) * step; v <= o.xMax + 1e-9; v += step) xs.push(v); }
    ctx.save(); ctx.strokeStyle = C.grid; xs.forEach(v => { ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); }); ctx.restore();
    placeLabels(ctx, xs.map(v => ({ text: (o.xFmt || fmt)(v), pos: x(v), y: P.b + 15 })), 'x', 2, W - 2);
  }
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function curve(ctx, m, xs, ys, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); xs.forEach((v, i) => { const X = m.x(v), Y = Math.max(m.P.t - 2, m.y(ys[i])); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function vguide(ctx, X, y0, y1, color = C.orange) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (ring) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }
function arrow(ctx, x0, x1, Y, color, lw, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke();
  if (Math.abs(x1 - x0) > 4) { const s = Math.sign(x1 - x0), hs = 4 + lw; ctx.beginPath(); ctx.moveTo(x1, Y); ctx.lineTo(x1 - s * hs * 1.4, Y - hs); ctx.lineTo(x1 - s * hs * 1.4, Y + hs); ctx.closePath(); ctx.fill(); }
  ctx.restore();
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


/* ---------- shared source selection (steps 0–3) ---------- */
const state = { src: 'die' };
function buildSourceRows() {
  document.querySelectorAll('.src-row').forEach(row => {
    row.innerHTML = M.ORDER.map(k => `<button class="btn toggle" type="button" data-step="${row.dataset.srcRow}" data-src="${k}"></button>`).join('');
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      if (state.src === b.dataset.src) return;
      state.src = b.dataset.src; clearExperiments(true); stopAnim('s2'); draw0(); draw1(); draw2(); draw3();
    }));
  });
}
function paintSourceRows() {
  document.querySelectorAll('.src-row button').forEach(b => { b.textContent = t('src_' + b.dataset.src); b.setAttribute('aria-pressed', String(b.dataset.src === state.src)); });
}
const xTicksFor = S => (S.vals.length === 2 ? [0, 0.5, 1] : [0, 1, 2, 3, 4, 5, 6]);
function niceTicks(max, px, minPx = 28) {
  const step = niceStep(max, px, minPx, [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50]);
  const out = []; for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toFixed(6)); return out;
}
// Step outline of a lattice distribution: each point s/n owns a cell of width 1/n; height = value.
function stepOutline(ctx, m, pts, h, color, lw, fill) {
  ctx.save(); ctx.beginPath(); let started = false;
  pts.forEach(q => { const x0 = m.x(q.x - h / 2), x1 = m.x(q.x + h / 2), Y = m.y(q.y); if (!started) { ctx.moveTo(x0, m.y(0)); started = true; } ctx.lineTo(x0, Y); ctx.lineTo(x1, Y); });
  if (started) ctx.lineTo(m.x(pts[pts.length - 1].x + h / 2), m.y(0));
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); ctx.restore();
}

/* ---------- step 0: raw material ---------- */
function draw0() {
  paintSourceRows();
  const S = M.SOURCES[state.src], mo = M.moments(state.src);
  const { ctx, W, H } = fitCanvas($('c0'), () => 300);
  const ymax = Math.max(...S.p) * 1.18;
  const m = panel(ctx, W, { top: 26, bottom: H - 28, xMin: S.lo, xMax: S.hi, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, H - 54), xTicks: xTicksFor(S), title: t('c0title') });
  ctx.fillStyle = 'rgba(255,180,84,0.16)'; ctx.fillRect(m.x(mo.mu - mo.sigma), m.P.t, m.x(mo.mu + mo.sigma) - m.x(mo.mu - mo.sigma), m.P.b - m.P.t);
  const bw = Math.min(46, (m.x(1) - m.x(0)) * (S.vals.length === 2 ? 0.3 : 0.62));
  S.vals.forEach((v, i) => { if (!S.p[i]) return; ctx.fillStyle = C.cyan; ctx.fillRect(m.x(v) - bw / 2, m.y(S.p[i]), bw, m.y(0) - m.y(S.p[i])); });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(m.x(mo.mu), m.P.t); ctx.lineTo(m.x(mo.mu), m.P.b); ctx.stroke(); ctx.restore();
  $('r0').textContent = t('s0readout', { desc: t('srcD_' + state.src), mu: fmt(mo.mu, 3), sigma: fmt(mo.sigma, 3) });
}
function quizProb() { const pm = M.sumDist('die', 100); let c = 0; pm.forEach((p, s) => { if (s >= 320 && s <= 380) c += p; }); return c; }

/* ---------- step 1: experiments ---------- */
const s1 = { means: [], last: null, rng: M.mulberry32(1109), cleared: false };
function clearExperiments(note) { stopAnim('s1'); const had = s1.means.length > 0; s1.means = []; s1.last = null; s1.cleared = note && had; }
function runExperiments(k) { const n = num('n1'); for (let i = 0; i < k; i++) { s1.last = M.experiment(state.src, n, s1.rng); s1.means.push(s1.last.mean); } s1.cleared = false; }
function draw1() {
  paintSourceRows();
  const n = num('n1'), S = M.SOURCES[state.src], mo = M.moments(state.src), se = mo.sigma / Math.sqrt(n);
  $('n1v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c1'), () => 440);
  // top: the latest experiment as a dot plot (equal values stack upward)
  const A = panel(ctx, W, { top: 26, bottom: 128, xMin: S.lo, xMax: S.hi, yMin: 0, yMax: 1, yTicks: [], xTicks: xTicksFor(S), title: t('c1top') });
  if (s1.last) {
    const stacks = {}; s1.last.xs.forEach(v => { stacks[v] = (stacks[v] || 0) + 1; });
    const tall = Math.max(...Object.values(stacks)), r = Math.max(1.6, Math.min(4.5, (A.P.b - A.P.t - 6) / (tall * 2.3)));
    Object.keys(stacks).forEach(v => { for (let j = 0; j < stacks[v]; j++) dot(ctx, A.x(+v), A.P.b - r - 2 - j * r * 2.3, r, C.text); });
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(A.x(s1.last.mean), A.P.t); ctx.lineTo(A.x(s1.last.mean), A.P.b); ctx.stroke(); ctx.restore();
  }
  // bottom: histogram of all means; bins hold k lattice points each (no aliasing)
  const k = Math.max(1, Math.ceil(n * (S.hi - S.lo) / 48)), bw = k / n;
  const counts = new Map(); s1.means.forEach(mv => { const j = Math.floor(Math.round(mv * n) / k); counts.set(j, (counts.get(j) || 0) + 1); });
  const N = s1.means.length, shares = [...counts.values()].map(c => c / N);
  const normalPeak = M.phi(0) / se * bw, ymax = Math.max(0.05, normalPeak, ...shares) * 1.15;
  const B = panel(ctx, W, { top: 172, bottom: H - 28, xMin: S.lo, xMax: S.hi, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, H - 200), xTicks: xTicksFor(S), title: t('c1bot') });
  counts.forEach((c, j) => { const x0 = B.x((j * k - 0.5) / n), x1 = B.x(((j + 1) * k - 0.5) / n), Y = B.y(c / N); ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.85; ctx.fillRect(x0 + 0.5, Y, Math.max(1, x1 - x0 - 1), B.y(0) - Y); ctx.globalAlpha = 1; });
  const xs = Array.from({ length: 301 }, (_, i) => S.lo + (S.hi - S.lo) * i / 300);
  curve(ctx, B, xs, xs.map(x => M.phi((x - mo.mu) / se) / se * bw), C.text, 1.6, [5, 4]);
  if (s1.last) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B.x(s1.last.mean), B.P.t); ctx.lineTo(B.x(s1.last.mean), B.P.b); ctx.stroke(); ctx.restore(); }
  const note = s1.cleared ? ' ' + t('s1cleared') : '';
  if (!N) { $('r1').textContent = t('s1empty') + note; return; }
  const mm = s1.means.reduce((a, b) => a + b, 0) / N, sd = Math.sqrt(s1.means.reduce((a, b) => a + (b - mm) * (b - mm), 0) / N);
  $('r1').textContent = t('s1readout', { k: N, n, m: fmt(mm, 3), mu: fmt(mo.mu, 3), s: fmt(sd, 3), t: fmt(se, 3) });
}
function run1(k) {
  if (k === 1) { stopAnim('s1'); runExperiments(1); draw1(); return; }
  finishAll();
  let done = 0;
  animate('s1', k === 100 ? 1500 : 2500, p => { const target = Math.round(p * k); runExperiments(target - done); done = target; draw1(); });
}

/* ---------- step 2: exact shape and KS distance ---------- */
const KS = {};
function ksTrack(src) { if (!KS[src]) KS[src] = Array.from({ length: 301 }, (_, n) => (n ? M.ksGap(src, n) : NaN)); return KS[src]; }
const firstBelow = (src, th) => { const a = ksTrack(src); for (let n = 1; n <= 300; n++) if (a[n] < th) return n; return null; };
function draw2() {
  paintSourceRows();
  const n = num('n2'), S = M.SOURCES[state.src], mo = M.moments(state.src), se = mo.sigma / Math.sqrt(n);
  $('n2v').textContent = String(n);
  const pm = M.sumDist(state.src, n);
  const { ctx, W, H } = fitCanvas($('c2'), () => 450);
  const pk = Math.max(...pm), np = M.phi(0) / se / n, ymax = Math.max(pk, np) * 1.15;
  const A = panel(ctx, W, { top: 26, bottom: 214, xMin: S.lo, xMax: S.hi, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, 188, 26), xTicks: xTicksFor(S), title: t('c2top') });
  const cell = A.x(1 / n) - A.x(0), bw = Math.max(1, cell * (n === 1 && S.vals.length === 2 ? 0.3 : 0.7));
  ctx.fillStyle = C.cyan;
  pm.forEach((p, s) => { if (p < 1e-12) return; const X = A.x(s / n); ctx.fillRect(X - bw / 2, A.y(p), bw, A.y(0) - A.y(p)); });
  const xs = Array.from({ length: 401 }, (_, i) => S.lo + (S.hi - S.lo) * i / 400);
  curve(ctx, A, xs, xs.map(x => M.phi((x - mo.mu) / se) / se / n), C.text, 1.6, [5, 4]);
  // bottom: KS distance against n (log axis)
  const lx = v => log10(v);
  const B = panel(ctx, W, { top: 258, bottom: H - 28, xMin: 0, xMax: lx(300), yMin: 0, yMax: 0.56, yTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], xTicks: [1, 2, 5, 10, 20, 50, 100, 300].map(lx), xFmt: v => fmt(Math.pow(10, v), 0), title: t('c2bot') });
  hline(ctx, B, 0.05, C.ghost);
  const ns = Array.from({ length: 300 }, (_, i) => i + 1);
  M.ORDER.forEach(src => { if (src !== state.src) curve(ctx, B, ns.map(lx), ns.map(v => ksTrack(src)[v]), C.raw, 1.4); });
  curve(ctx, B, ns.map(lx), ns.map(v => ksTrack(state.src)[v]), C.orange, 2.4);
  const ks = ksTrack(state.src)[n];
  dot(ctx, B.x(lx(n)), B.y(ks), 5.5, C.orange);
  vguide(ctx, B.x(lx(n)), B.P.t, B.P.b, C.text);
  $('r2').textContent = t('s2readout', { n, ks: ks.toFixed(4), first: firstBelow(state.src, 0.05) });
}

/* ---------- step 3: precision priced by √n ---------- */
function draw3() {
  paintSourceRows();
  const n = num('n3'), e = num('e3'), S = M.SOURCES[state.src], mo = M.moments(state.src);
  $('n3v').textContent = String(n); $('e3v').textContent = fmt(e, 2);
  const d = k => M.sumDist(state.src, k).map((p, s) => ({ x: s / k, y: p * k })).filter(q => q.y > 1e-9 || true);
  const trim = pts => { let a = 0, b = pts.length - 1; while (a < b && pts[a].y < 1e-9) a++; while (b > a && pts[b].y < 1e-9) b--; return pts.slice(a, b + 1); };
  const d1 = trim(d(1)), dn = trim(d(n)), d4 = trim(d(4 * n));
  const { ctx, W, H } = fitCanvas($('c3'), () => 450);
  const ymax = Math.max(...d1.map(q => q.y), ...dn.map(q => q.y), ...d4.map(q => q.y)) * 1.12;
  const A = panel(ctx, W, { top: 26, bottom: 214, xMin: S.lo, xMax: S.hi, yMin: 0, yMax: ymax, yTicks: niceTicks(ymax, 188, 26), xTicks: xTicksFor(S), title: t('c3top') });
  stepOutline(ctx, A, d1, 1, C.raw, 1.4, 'rgba(85,101,122,0.25)');
  stepOutline(ctx, A, dn, 1 / n, C.cyan, 2, 'rgba(103,215,249,0.12)');
  stepOutline(ctx, A, d4, 1 / (4 * n), C.orange, 2, null);
  const lx = v => log10(v), NMAX = 20000;
  const B = panel(ctx, W, { top: 258, bottom: H - 28, xMin: 0, xMax: lx(NMAX), yMin: 0, yMax: mo.sigma * 1.08, yTicks: niceTicks(mo.sigma * 1.08, H - 286, 24), xTicks: [1, 10, 100, 1000, 10000].map(lx), xFmt: v => fmt(Math.pow(10, v), 0), title: t('c3bot') });
  const grid = Array.from({ length: 201 }, (_, i) => Math.pow(NMAX, i / 200));
  curve(ctx, B, grid.map(lx), grid.map(v => mo.sigma / Math.sqrt(v)), C.text, 1.8);
  const need = M.nNeeded(mo.sigma, e);
  if (e <= mo.sigma * 1.08) {
    hline(ctx, B, e, C.green, [6, 3]);
    if (need <= NMAX) { vguide(ctx, B.x(lx(need)), B.y(e), B.P.b, C.green); dot(ctx, B.x(lx(need)), B.y(e), 5, C.green); }
  }
  const s1v = M.sdOfMean(state.src, n).sd, s4v = M.sdOfMean(state.src, 4 * n).sd;
  dot(ctx, B.x(lx(n)), B.y(s1v), 5.5, C.cyan); dot(ctx, B.x(lx(4 * n)), B.y(s4v), 5.5, C.orange);
  $('r3').textContent = t('s3readout', { n, s1: fmt(s1v, 4), n4: 4 * n, s4: fmt(s4v, 4), r: (s4v / s1v).toFixed(3), e: fmt(e, 2), need });
}

/* ---------- step 4: polls ---------- */
const s4 = { polls: [], rng: M.mulberry32(4242), cleared: false };
const ROWS = 100;
function draw4() {
  const p = num('p4') / 100, n = num('n4'), mg = M.margin(p, n), ex = M.exactCoverage(p, n);
  $('p4v').textContent = num('p4') + '%'; $('n4v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c4'), () => 30 + ROWS * 3 + 34);
  const R = Math.max(0.06, 4.2 * Math.sqrt(p * (1 - p) / n)), x0 = Math.max(0, p - R), x1 = Math.min(1, p + R);
  const step = niceStep(x1 - x0, W - 60, 46, [0.01, 0.02, 0.05, 0.1, 0.2]);
  const xt = []; for (let v = Math.ceil(x0 / step - 1e-9) * step; v <= x1 + 1e-9; v += step) xt.push(+v.toFixed(4));
  const m = panel(ctx, W, { top: 26, bottom: H - 30, xMin: x0, xMax: x1, yMin: 0, yMax: ROWS, yTicks: [], xTicks: xt, xFmt: v => fmt(v * 100, 0) + '%', left: 14, right: 14, title: t('c4title') });
  const shown = s4.polls.slice(-ROWS);
  shown.forEach((q, i) => {
    const Y = m.P.t + 2 + i * 3;
    ctx.strokeStyle = q.covers ? C.cyan : C.orange; ctx.globalAlpha = q.covers ? 0.75 : 1; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(m.x(Math.max(x0, q.lo)), Y); ctx.lineTo(m.x(Math.min(x1, q.hi)), Y); ctx.stroke();
  });
  ctx.globalAlpha = 1;
  vguide(ctx, m.x(p), m.P.t, m.P.b, C.text);
  const note = s4.cleared ? ' ' + t('s4cleared') : '';
  if (!s4.polls.length) { $('r4').textContent = t('s4empty', { m: pct1(mg), ex: pct1(ex) }) + note; return; }
  const c = s4.polls.filter(q => q.covers).length;
  $('r4').textContent = t('s4readout', { k: s4.polls.length, c, cr: pct1(c / s4.polls.length), m: pct1(mg), ex: pct1(ex) });
}
function clearPolls(note) { stopAnim('s4'); const had = s4.polls.length > 0; s4.polls = []; s4.cleared = note && had; }

/* ---------- step 5: Cauchy breaks it ---------- */
const s5 = { set: 1, reveal: 1 };
const PATH_COL = [C.cyan, C.orange, C.green, C.pink];
const N5 = 5000;
const pathCache = {};
function paths(kind, set) { const key = kind + set; if (!pathCache[key]) pathCache[key] = [0, 1, 2, 3].map(j => M.runningMeans(kind, set * 10 + j, N5)); return pathCache[key]; }
function draw5() {
  $('lg5').innerHTML = PATH_COL.map((c, i) => `<span class="lg"><span class="sw" style="background:${c}"></span><span>${t('lg5Path', { i: i + 1 })}</span></span>`).join('') + `<span class="lg"><span class="sw sw-ghost"></span><span>μ = 3.5</span></span>`;
  const { ctx, W, H } = fitCanvas($('c5'), () => 460);
  const lx = v => log10(v), xt = [1, 10, 100, 1000, 5000].map(lx), xf = v => fmt(Math.pow(10, v), 0);
  const upto = Math.max(1, Math.round(Math.pow(N5, s5.reveal)));
  const idx = []; for (let i = 1; i <= upto; i = i < 100 ? i + 1 : Math.ceil(i * 1.01)) idx.push(i); if (idx[idx.length - 1] !== upto) idx.push(upto);
  const A = panel(ctx, W, { top: 26, bottom: 206, xMin: 0, xMax: lx(N5), yMin: 1, yMax: 6, yTicks: [1, 2, 3, 4, 5, 6], xTicks: xt, xFmt: xf, title: t('c5top') });
  hline(ctx, A, 3.5, C.ghost);
  paths('die', s5.set).forEach((pp, j) => curve(ctx, A, idx.map(lx), idx.map(i => pp[i - 1]), PATH_COL[j], 1.6));
  const B = panel(ctx, W, { top: 250, bottom: H - 28, xMin: 0, xMax: lx(N5), yMin: -10, yMax: 10, yTicks: [-10, -5, 0, 5, 10], xTicks: xt, xFmt: xf, title: t('c5bot') });
  hline(ctx, B, 0, C.ghost);
  const clip = v => Math.max(-10, Math.min(10, v));
  paths('cauchy', s5.set).forEach((pp, j) => curve(ctx, B, idx.map(lx), idx.map(i => clip(pp[i - 1])), PATH_COL[j], 1.6));
  const dv = paths('die', s5.set).map(pp => pp[N5 - 1]), cv = paths('cauchy', s5.set).map(pp => pp[N5 - 1]);
  const lo = a => Math.min(...a), hi = a => Math.max(...a);
  $('r5').textContent = t('s5readout', { set: s5.set, d0: fmt(lo(dv), 3), d1: fmt(hi(dv), 3), dd: fmt(hi(dv) - lo(dv), 3), c0: fmt(lo(cv), 2), c1: fmt(hi(cv), 2), cd: fmt(hi(cv) - lo(cv), 2) });
}

const quiz = { state: null };
function paintQuiz() {
  if (!quiz.state) return;
  const ok = quiz.state === 'correct';
  $('quizFeedback').textContent = ok ? t('correct', { p: (quizProb() * 100).toFixed(0) }) : t('wrong');
  $('quizFeedback').style.color = ok ? C.green : C.orange;
}
function refresh() { paintQuiz(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildSourceRows();
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    quiz.state = !!choice && choice.value === 'b' ? 'correct' : 'wrong'; paintQuiz();
  });
  $('n1').addEventListener('input', () => { clearExperiments(true); draw1(); });
  $('run1').addEventListener('click', () => run1(1));
  $('run100').addEventListener('click', () => run1(100));
  $('run1000').addEventListener('click', () => run1(1000));
  $('clear1').addEventListener('click', () => { clearExperiments(false); draw1(); });
  $('n2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => animate('s2', 5000, p => { $('n2').value = Math.max(1, Math.round(Math.pow(300, p))); draw2(); }));
  ['n3', 'e3'].forEach(id => $(id).addEventListener('input', draw3));
  ['p4', 'n4'].forEach(id => $(id).addEventListener('input', () => { clearPolls(true); draw4(); }));
  $('poll100').addEventListener('click', () => {
    finishAll();
    const p = num('p4') / 100, n = num('n4'); let done = 0;
    s4.cleared = false;
    animate('s4', 1500, q => { const target = Math.round(q * 100); for (; done < target; done++) s4.polls.push(M.poll(p, n, s4.rng)); draw4(); });
  });
  $('clear4').addEventListener('click', () => { clearPolls(false); draw4(); });
  $('reseed5').addEventListener('click', () => { s5.set++; animate('s5', 1800, p => { s5.reveal = p; draw5(); }); });

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
  window.refreshCLT = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
