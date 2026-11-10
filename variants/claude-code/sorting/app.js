'use strict';
// Sorting & Big O lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, count and curve comes from window.SORT_MODEL (model.js), which runs the real algorithms.
// Canvas text is limited to panel titles and axis ticks in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SORT_MODEL;
const t = (...a) => window.SORT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', bar: '#4b5e75', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (toFixed(0) "90" stays "90").
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const int = v => (Math.round(v) || 0).toLocaleString('en-US');

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
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel; ticks are [{v, label}] or numbers; xTicks true = automatic.
function panel(ctx, W, o) {
  const P = { l: o.left || 46, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const q of o.yTicks) {
    const v = typeof q === 'number' ? q : q.v, lab = typeof q === 'number' ? int(q) : q.label;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  let xt = [];
  if (Array.isArray(o.xTicks)) xt = o.xTicks;
  else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]);
    for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) xt.push({ v, label: int(v) });
  }
  // drop ticks whose labels would collide (keeps the first and every label that fits)
  let lastR = -Infinity;
  for (const q of xt) {
    const X = x(q.v), w = ctx.measureText(q.label).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    if (X - w / 2 > lastR + 6 && X + w / 2 <= W - 2) { ctx.fillText(q.label, X, P.b + 15); lastR = X + w / 2; }
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clip(ctx, P) { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 6, P.r - P.l + 6, P.b - P.t + 7); ctx.clip(); }
function polyline(ctx, pts, color, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }
// Draw an array as bars inside a box; colorOf(i) picks each bar's colour.
function bars(ctx, arr, X0, Y0, w, h, maxV, colorOf, outline) {
  const n = arr.length, bw = w / n, gap = Math.min(3, bw * 0.18);
  arr.forEach((v, i) => {
    const bh = Math.max(2, v / maxV * h);
    ctx.fillStyle = colorOf ? colorOf(i) : C.bar; ctx.fillRect(X0 + i * bw + gap / 2, Y0 + h - bh, bw - gap, bh);
    if (outline && outline(i)) { ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(X0 + i * bw + gap / 2 - 1, Y0 + h - bh - 1, bw - gap + 2, bh + 2); }
  });
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

/* ---------- step 0: counting comparisons in selection sort ---------- */
const N0 = 8;
const s0 = { input: 'shuffled', seed: 3, log: [], k: 0 };
function build0() {
  const a = s0.input === 'sorted' ? M.ascending(N0) : M.shuffled(N0, s0.seed);
  s0.start = a; s0.log = []; M.selection(a, s0.log); s0.k = 0;
}
function draw0() {
  const ev = s0.k > 0 ? s0.log[s0.k - 1] : null, arr = ev ? ev.a : s0.start, cmp = ev ? ev.cmp : 0, total = N0 * (N0 - 1) / 2, done = ev ? ev.done : 0;
  document.querySelectorAll('[data-input0]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.input0 === s0.input)));
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 17, W - 16);
  const bx = 20, bw = W - 40, by = 34, bh = H - 130;
  bars(ctx, arr, bx, by, bw, bh, N0, i => i < done ? C.cyan : ev && ev.kind === 'cmp' && i === ev.j ? C.green : C.bar, i => ev && ev.kind === 'cmp' && (i === ev.i || i === ev.j));
  // tally strip: one cell per comparison selection sort will make
  title(ctx, t('c0b'), 8, H - 70, W - 16);
  const cw = (W - 40) / total;
  for (let q = 0; q < total; q++) { ctx.fillStyle = q < cmp ? C.orange : '#1d2a3a'; ctx.fillRect(20 + q * cw + 1, H - 58, Math.max(1, cw - 2), 22); }
  ctx.strokeStyle = C.axis; ctx.strokeRect(20, H - 58, W - 40, 22);
  const status = !ev ? t('s0start') : ev.kind === 'cmp' ? t('s0cmp', { a: ev.a[ev.i], b: ev.a[ev.j] }) : t('s0place', { i: ev.i + 1 });
  $('r0').textContent = t('s0readout', { k: cmp, total, status, n: N0 });
  $('next0').disabled = s0.k >= s0.log.length;
}

/* ---------- step 1: insertion sort on three kinds of input ---------- */
function draw1() {
  const n = num('n1'), cs = M.insertionCases(n);
  $('n1v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c1'));
  const kinds = [['sorted', M.ascending(n)], ['random', M.shuffled(n, M.SEED1 + n)], ['reversed', M.descending(n)]];
  const gw = (W - 40) / 3;
  kinds.forEach(([k, a], i) => { title(ctx, t('in_' + k), 20 + i * gw, 17, gw - 10); bars(ctx, a, 20 + i * gw, 26, gw - 14, 70, n, () => [C.green, C.violet, C.pink][i]); });
  const ymax = 64 * 63 / 2;
  const B = panel(ctx, W, { top: 136, bottom: H - 26, xMin: 0, xMax: 65, yMin: 0, yMax: ymax * 1.05, yTicks: [0, 500, 1000, 1500, 2000], xTicks: true, xSteps: [8, 16, 32], title: t('c1b') });
  const series = (f, color, dash) => { const pts = []; for (let m = 2; m <= 64; m++) pts.push([B.x(m), B.y(f(m))]); polyline(ctx, pts, color, 2, dash); };
  series(m => M.insertionCases(m).reversed, C.pink);
  series(m => M.insertionCases(m).random, C.violet);
  series(m => M.insertionCases(m).sorted, C.green);
  series(m => m * (m - 1) / 4, C.ghost, [5, 4]);
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.4; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(B.x(n), B.P.t); ctx.lineTo(B.x(n), B.P.b); ctx.stroke(); ctx.restore();
  [[cs.reversed, C.pink], [cs.random, C.violet], [cs.sorted, C.green]].forEach(([v, c]) => dot(ctx, B.x(n), B.y(v), 5, c));
  $('r1').textContent = t('s1readout', { n, s: cs.sorted, r: cs.random, v: cs.reversed, sel: cs.selection, nm1: n - 1, half: n * (n - 1) / 2, q: fmt(n * (n - 1) / 4, 1), ratio: fmt(cs.random / (n * (n - 1) / 4), 2) });
}

/* ---------- step 2: merge sort, level by level ---------- */
const N2 = 16;
const s2 = { seed: 5, shown: 4 };
const PAL = ['#67d7f9', '#ffb454', '#7ee2a8', '#ff7a93', '#b79cff', '#f3e37c', '#8fb3ff', '#ff9e6d'];
function draw2() {
  const levels = M.mergeLevels(M.shuffled(N2, s2.seed)), L = levels.length - 1;
  const { ctx, W, H } = fitCanvas($('c2'));
  const rows = L + 1, rh = (H - 30) / rows;
  for (let d = 0; d <= L; d++) {
    const lv = levels[d], y0 = 26 + d * rh;
    title(ctx, d === 0 ? t('c2row0') : t('c2row', { d, w: lv.width, c: lv.cmp }), 8, y0 + 9, W - 16);
    if (d > s2.shown) { ctx.fillStyle = '#121c28'; ctx.fillRect(20, y0 + 16, W - 40, rh - 24); continue; }
    bars(ctx, lv.a, 20, y0 + 16, W - 40, rh - 24, N2, i => PAL[Math.floor(i / lv.width) % PAL.length]);
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    for (let b = lv.width; b < N2; b += lv.width) { const X = 20 + b * (W - 40) / N2; ctx.beginPath(); ctx.moveTo(X, y0 + 14); ctx.lineTo(X, y0 + rh - 6); ctx.stroke(); }
  }
  const shownCmp = levels.slice(1, s2.shown + 1).map(l => l.cmp), tot = shownCmp.reduce((s, v) => s + v, 0);
  $('r2').textContent = t('s2readout', { k: s2.shown, L, list: shownCmp.length ? shownCmp.join(' + ') : '0', tot, n: N2, nl: N2 * Math.log2(N2) });
  $('next2').disabled = s2.shown >= L;
}

/* ---------- step 3: growth shapes ---------- */
const s3 = { log: true };
const ALGS = [['selection', C.pink], ['insertion', C.violet], ['quick', C.orange], ['merge', C.cyan]];
function draw3() {
  const idx = num('n3'), n = M.NS[idx], nPrev = M.NS[Math.max(0, idx - 1)], g = M.growth(n), gp = M.growth(nPrev);
  $('n3v').textContent = String(n);
  document.querySelectorAll('[data-axes]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.axes === 'log') === s3.log)));
  const { ctx, W, H } = fitCanvas($('c3'));
  const ns = M.NS.slice(0, idx + 1);
  let A;
  if (s3.log) {
    const yt = []; for (let p = 1; p <= 7; p++) yt.push({ v: p, label: p <= 3 ? int(Math.pow(10, p)) : '10' + '⁰¹²³⁴⁵⁶⁷'[p] });
    A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 2.8, xMax: 11.2, yMin: 0.8, yMax: 6.6, yTicks: yt.filter(q => q.v <= 6), xTicks: M.NS.map(v => ({ v: Math.log2(v), label: String(v) })), title: t('c3log') });
    const P = (m, v) => [A.x(Math.log2(m)), A.y(Math.log10(Math.max(1, v)))];
    clip(ctx, A.P);
    polyline(ctx, M.NS.map(m => P(m, m * (m - 1) / 2)), C.ghost, 1.3, [5, 4]);
    polyline(ctx, M.NS.map(m => P(m, M.nlogn(m))), C.ghost, 1.3, [2, 4]);
    for (const [k, c] of ALGS) { polyline(ctx, ns.map(m => P(m, M.growth(m)[k])), c, 2.2); ns.forEach(m => dot(ctx, ...P(m, M.growth(m)[k]), m === n ? 5 : 3, c)); }
    ctx.restore();
  } else {
    const ymax = g.selection * 1.08, step = niceStep(ymax, H - 52, 34, [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000]);
    const yt = []; for (let v = 0; v <= ymax; v += step) yt.push({ v, label: v >= 10000 ? int(v / 1000) + 'k' : int(v) });
    A = panel(ctx, W, { top: 26, bottom: H - 26, left: 50, xMin: 0, xMax: n * 1.04, yMin: 0, yMax: ymax, yTicks: yt, xTicks: true, title: t('c3lin') });
    clip(ctx, A.P);
    const curve = f => { const pts = []; for (let i = 0; i <= 120; i++) { const m = 2 + (n - 2) * i / 120; pts.push([A.x(m), A.y(f(m))]); } return pts; };
    polyline(ctx, curve(m => m * (m - 1) / 2), C.ghost, 1.3, [5, 4]);
    polyline(ctx, curve(M.nlogn), C.ghost, 1.3, [2, 4]);
    for (const [k, c] of ALGS) { polyline(ctx, ns.map(m => [A.x(m), A.y(M.growth(m)[k])]), c, 2.2); ns.forEach(m => dot(ctx, A.x(m), A.y(M.growth(m)[k]), m === n ? 5 : 3, c)); }
    ctx.restore();
  }
  const r = k => idx > 0 ? fmt(g[k] / gp[k], 2) : '—';
  $('r3').textContent = t('s3readout', { n, sel: int(g.selection), ins: int(g.insertion), mer: int(g.merge), qu: int(g.quick), np: nPrev, rs: r('selection'), ri: r('insertion'), rm: r('merge'), rq: r('quick'), cm: fmt(g.merge / M.nlogn(n), 2), cq: fmt(g.quick / M.nlogn(n), 2), cs: fmt(g.selection / (n * n), 3) });
}

/* ---------- step 4: quicksort and its pivot ---------- */
const N4 = 32;
const s4 = { input: 'sorted', pivot: 'first', seed: 1 };
function input4() { return s4.input === 'sorted' ? M.ascending(N4) : s4.input === 'reversed' ? M.descending(N4) : M.shuffled(N4, 40 + s4.seed); }
function draw4() {
  const q = M.quick(input4(), s4.pivot, s4.seed);
  document.querySelectorAll('[data-input4]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.input4 === s4.input)));
  document.querySelectorAll('[data-pivot]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pivot === s4.pivot)));
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4'), 8, 17, W - 16);
  const top = 30, rows = N4 - 1, rh = (H - top - 26) / rows, x0 = 46, cw = (W - x0 - 12) / N4;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  for (let d = 0; d < rows; d += 8) ctx.fillText(String(d), x0 - 6, top + d * rh + rh / 2 + 4);
  ctx.fillText(String(rows - 1), x0 - 6, top + (rows - 1) * rh + rh / 2 + 4);
  ctx.restore();
  ctx.strokeStyle = C.grid; ctx.strokeRect(x0, top, W - x0 - 12, rows * rh);
  for (const c of q.calls) {
    if (c.hi <= c.lo) continue; // single elements need no partition (no comparisons)
    const Y = top + c.d * rh + 1, h = Math.max(1, rh - 2);
    if (c.hi > c.lo) { ctx.fillStyle = 'rgba(103,215,249,0.28)'; ctx.fillRect(x0 + c.lo * cw, Y, (c.hi - c.lo + 1) * cw, h); }
    ctx.fillStyle = C.orange; ctx.fillRect(x0 + c.p * cw + 1, Y, Math.max(1, cw - 2), h);
  }
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(t('c4x'), x0 + (W - x0 - 12) / 2, H - 8);
  $('r4').textContent = t('s4readout', { inp: t('in_' + s4.input), piv: t('pv_' + s4.pivot), c: q.cmp, d: q.depth, half: N4 * (N4 - 1) / 2, nl: N4 * Math.log2(N4), n: N4 });
}

/* ---------- step 5: the lower bound ---------- */
const s5 = { n: 4, seed: 2, k: 99 }; // k beyond the run length = show the whole run
function hidden5() { return M.shuffled(s5.n, 900 + s5.seed * 10 + s5.n).map(v => v - 1); }
function draw5() {
  const cand = M.candidates(hidden5()), K = cand.asked.length, k = Math.min(s5.k, K), total = cand.total;
  document.querySelectorAll('[data-n5]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.n5) === s5.n)));
  let { ctx, W, H } = fitCanvas($('c5'));
  const L2 = Math.log2(total), xMax = Math.max(K, Math.ceil(L2)) + 0.6;
  const yt = []; for (let v = 1; v <= total; v *= (total > 100 ? 4 : 2)) yt.push({ v: Math.log2(v), label: String(v) });
  if (yt[yt.length - 1].v < L2 - 0.3) yt.push({ v: L2, label: String(total) });
  const A = panel(ctx, W, { top: 26, bottom: H - 26, left: 40, xMin: -0.4, xMax, yMin: -0.3, yMax: L2 + 0.4, yTicks: yt, xTicks: true, xSteps: [1, 2], minPx: 22, title: t('c5a', { n: s5.n, N: total }) });
  // ideal: each answer halves the candidates
  polyline(ctx, [[A.x(0), A.y(L2)], [A.x(L2), A.y(0)]], C.ghost, 1.4, [5, 4]);
  const pts = cand.history.slice(0, k + 1).map((v, i) => [A.x(i), A.y(Math.log2(v))]);
  polyline(ctx, pts, C.orange, 2.2);
  pts.forEach((p, i) => dot(ctx, p[0], p[1], i === k ? 5.5 : 3.5, i === k ? C.text : C.orange));
  ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(A.x(Math.ceil(L2)), A.P.t); ctx.lineTo(A.x(Math.ceil(L2)), A.P.b); ctx.stroke(); ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, left: 44, xMin: 0, xMax: 66, yMin: 0, yMax: 400, yTicks: [0, 100, 200, 300, 400], xTicks: true, xSteps: [8, 16, 32], title: t('c5b') });
  const pl = [], pn = [], pm = [];
  for (let m = 2; m <= 64; m++) { pl.push([B.x(m), B.y(M.log2fact(m))]); pn.push([B.x(m), B.y(M.nlogn(m))]); }
  for (const m of [4, 8, 16, 32, 64]) pm.push([B.x(m), B.y(M.merge(M.shuffled(m, 77 + m)).cmp)]);
  polyline(ctx, pn, C.ghost, 1.4, [5, 4]); polyline(ctx, pl, C.pink, 2.2); polyline(ctx, pm, C.cyan, 2); pm.forEach(p => dot(ctx, p[0], p[1], 3.5, C.cyan));

  const last = k > 0 ? cand.asked[k - 1] : null;
  const q = last ? t('s5q', { p: 'ABCDEF'[last.p], q: 'ABCDEF'[last.q], ans: t(last.ans ? 'yes' : 'no') }) : t('s5q0');
  const hid = hidden5(), ord = hid.map((r, i) => [r, 'ABCDEF'[i]]).sort((x, y) => x[0] - y[0]).map(x => x[1]).join(' < ');
  const done = k >= K ? t('s5done', { K, lb: Math.ceil(L2), ord }) : '';
  $('r5').textContent = t('s5readout', { q, k, left: cand.history[k], N: total, n: s5.n, lb: Math.ceil(L2), lg: fmt(L2, 2) }) + done;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  build0();
  $('next0').addEventListener('click', () => { stopAnim('s0'); s0.k = Math.min(s0.log.length, s0.k + 1); draw0(); });
  $('play0').addEventListener('click', () => { const from = s0.k >= s0.log.length ? 0 : s0.k, L = s0.log.length; animate('s0', (L - from) * 260, p => { s0.k = from + Math.round(p * (L - from)); draw0(); }); });
  document.querySelectorAll('[data-input0]').forEach(b => b.addEventListener('click', () => { stopAnim('s0'); s0.input = b.dataset.input0; if (s0.input === 'shuffled') s0.seed = s0.seed % 9 + 1; build0(); draw0(); }));

  $('n1').addEventListener('input', draw1);

  $('next2').addEventListener('click', () => { stopAnim('s2'); s2.shown = Math.min(4, s2.shown + 1); draw2(); });
  $('reset2').addEventListener('click', () => { stopAnim('s2'); s2.seed = s2.seed % 9 + 1; s2.shown = 0; draw2(); });

  $('n3').addEventListener('input', draw3);
  document.querySelectorAll('[data-axes]').forEach(b => b.addEventListener('click', () => { s3.log = b.dataset.axes === 'log'; draw3(); }));

  document.querySelectorAll('[data-input4]').forEach(b => b.addEventListener('click', () => { s4.input = b.dataset.input4; draw4(); }));
  document.querySelectorAll('[data-pivot]').forEach(b => b.addEventListener('click', () => { s4.pivot = b.dataset.pivot; draw4(); }));
  $('seed4').addEventListener('click', () => { s4.seed = s4.seed % 9 + 1; draw4(); });

  document.querySelectorAll('[data-n5]').forEach(b => b.addEventListener('click', () => { stopAnim('s5'); s5.n = Number(b.dataset.n5); s5.k = 99; draw5(); }));
  $('next5').addEventListener('click', () => { stopAnim('s5'); const K = M.candidates(hidden5()).asked.length; s5.k = s5.k >= K ? 1 : s5.k + 1; draw5(); });
  $('play5').addEventListener('click', () => { const K = M.candidates(hidden5()).asked.length; s5.k = 0; draw5(); animate('s5', K * 600, p => { s5.k = Math.round(p * K); draw5(); }); });
  $('seed5').addEventListener('click', () => { stopAnim('s5'); s5.seed = s5.seed % 9 + 1; s5.k = 99; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshSorting = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
