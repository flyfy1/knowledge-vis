'use strict';
// Recursion and divide-and-conquer lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every frame, node, bar and readout comes from window.REC_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and labels inside boxes that are sized to fit them; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.REC_MODEL;
const t = (...a) => window.REC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', dim: '#3a4a5e' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const big = v => Math.round(v).toLocaleString('en-US');
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = e => (e === 0 ? '1' : e === 1 ? '10' : e === 2 ? '100' : '10' + String(e).split('').map(c => SUP[c]).join(''));

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
// Text that shrinks until it fits maxW (never overflows its box).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 400, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, Y, W) => fitText(ctx, text, 8, Y, W - 16, { weight: 600 });

// A plot panel with optional log axes. Title in its own row above; tick labels left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 44, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const tx = v => (o.xLog ? Math.log10(v) : v), ty = v => (o.yLog ? Math.log10(v) : v);
  const x0 = tx(o.xMin), x1 = tx(o.xMax), y0 = ty(o.yMin), y1 = ty(o.yMax);
  const x = v => P.l + (tx(v) - x0) / (x1 - x0) * (P.r - P.l);
  const y = v => P.b - (ty(v) - y0) / (y1 - y0) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  (o.yTicks || []).forEach(([v, lab]) => {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 6, y(v) + 4);
  });
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  // x ticks: drop labels that would collide with the previous one
  let lastR = -1e9; ctx.textAlign = 'center';
  (o.xTicks || []).forEach(([v, lab]) => {
    const X = x(v), w = ctx.measureText(lab).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    const L = Math.max(X - w / 2, 2), R = L + w;
    if (L > lastR + 6 && R <= W - 2) { ctx.fillText(lab, L + w / 2, P.b + 15); lastR = R; }
  });
  ctx.restore();
  if (o.title) title(ctx, o.title, P.t - 9, W);
  return { x, y, P };
}
function dot(ctx, X, Y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* ---------- stepping player (reduced motion jumps to the end; hidden page stops it) ---------- */
const players = {};
function play(name, input, msPerStep, redraw, btn) {
  if (players[name]) { stop(name); return; }
  const el = $(input), max = Number(el.max);
  if (Number(el.value) >= max) el.value = 0;
  if (reduceMotion()) { el.value = max; redraw(); return; }
  let last = performance.now();
  const tick = now => {
    if (now - last >= msPerStep) { last = now; el.value = Math.min(max, Number(el.value) + 1); redraw(); }
    if (Number(el.value) >= max) { stop(name); return; }
    players[name].id = requestAnimationFrame(tick);
  };
  players[name] = { id: requestAnimationFrame(tick), btn };
  $(btn).textContent = t('pause');
}
function stop(name) { const p = players[name]; if (!p) return; cancelAnimationFrame(p.id); delete players[name]; $(p.btn).textContent = t('play'); }
function stopAll() { Object.keys(players).forEach(stop); }

/* ---------- step 0: the call stack of pow(n) = 3 · pow(n − 1) ---------- */
let tr0 = null;
function draw0() {
  const n = num('n0');
  if (!tr0 || tr0.n !== n) { tr0 = M.linearTrace(n); $('e0').max = tr0.events.length; if (num('e0') > tr0.events.length) $('e0').value = 0; }
  const s = num('e0'), E = tr0.events.length, st = tr0.states[s];
  $('n0v').textContent = String(n); $('e0v').textContent = `${s}/${E}`;
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0stack'), 18, W);
  const top = 30, bottom = 250, fh = Math.min(26, (bottom - top) / 11), bw = Math.min(W - 24, 420), bx = (W - bw) / 2;
  if (!st.stack.length) fitText(ctx, t('stackEmpty'), W / 2, bottom - 6, W - 24, { color: C.muted, align: 'center' });
  st.stack.forEach((f, i) => {
    const Y = bottom - (i + 1) * fh, isTop = i === st.stack.length - 1;
    let label, col;
    if (f.k === 0) { label = t('frameBase'); col = C.green; }
    else if (isTop && st.last && st.last.type === 'ret' && st.last.k === f.k - 1) { label = t('frameReady', { k: f.k, v: st.last.value, r: M.BASE * st.last.value }); col = C.green; }
    else { label = t('frameWait', { k: f.k, k1: f.k - 1 }); col = C.orange; }
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = col; roundRect(ctx, bx, Y + 1, bw, fh - 3, 4); ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = isTop ? 2 : 1.2; roundRect(ctx, bx, Y + 1, bw, fh - 3, 4); ctx.stroke(); ctx.restore();
    fitText(ctx, label, bx + 10, Y + fh / 2 + 3, bw - 20, { size: Math.min(13, fh - 8) });
  });
  // depth history
  const maxD = n + 1;
  const pl = panel(ctx, W, { top: 292, bottom: H - 26, xMin: 0, xMax: E, yMin: 0, yMax: maxD, yTicks: [[0, '0'], [maxD, String(maxD)]], xTicks: [[0, '0'], [E / 2, String(E / 2)], [E, String(E)]], title: t('c0depth'), left: 34 });
  ctx.save(); ctx.strokeStyle = C.dim; ctx.setLineDash([3, 4]); ctx.beginPath();
  tr0.depthAt.forEach((d, i) => { if (!i) ctx.moveTo(pl.x(i), pl.y(d)); else ctx.lineTo(pl.x(i), pl.y(d)); }); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let i = 0; i <= s; i++) { const X = pl.x(i), Y = pl.y(tr0.depthAt[i]); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  dot(ctx, pl.x(s), pl.y(tr0.depthAt[s]), 5, C.text);
  let what;
  if (!st.last) what = t('s0start');
  else if (s === E) what = t('s0done', { n, v: tr0.value });
  else if (st.last.type === 'call') what = st.last.k === 0 ? t('s0callBase') : t('s0call', { k: st.last.k });
  else what = t('s0ret', { k: st.last.k, v: st.last.value });
  $('r0').textContent = t('s0readout', { s, E, what, depth: st.stack.length, max: tr0.maxDepth, mults: st.mults || 0 });
}

/* ---------- step 1: minus one vs halving ---------- */
const HALF_FRAMES = (() => { const a = [0]; for (let n = 1; n <= 1024; n++) a.push(M.halvingCost(n).frames); return a; })();
function draw1() {
  const n = num('n1'), lin = M.linearCost(n), half = M.halvingCost(n);
  $('n1v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1chain'), 18, W);
  // chain boxes, wrapped into rows
  ctx.font = '600 12px system-ui,sans-serif';
  const bw = Math.max(34, ctx.measureText('1024').width + 14), bh = 26, gap = 16, avail = W - 16;
  const perRow = Math.max(1, Math.floor((avail + gap) / (bw + gap)));
  const rows = Math.ceil(half.chain.length / perRow), rowH = Math.min(40, (150 - 30) / Math.max(rows, 3));
  half.chain.forEach((k, i) => {
    const r = Math.floor(i / perRow), c = i % perRow, X = 8 + c * (bw + gap), Y = 32 + r * rowH;
    const odd = k % 2 === 1;
    ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = C.cyan; roundRect(ctx, X, Y, bw, bh, 5); ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = odd ? C.orange : C.cyan; ctx.lineWidth = odd ? 2.2 : 1.2; roundRect(ctx, X, Y, bw, bh, 5); ctx.stroke(); ctx.restore();
    fitText(ctx, String(k), X + bw / 2, Y + bh / 2 + 4, bw - 8, { weight: 600, align: 'center' });
    if (i < half.chain.length - 1 && c < perRow - 1) {
      ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X + bw + 3, Y + bh / 2); ctx.lineTo(X + bw + gap - 4, Y + bh / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X + bw + gap - 4, Y + bh / 2); ctx.lineTo(X + bw + gap - 8, Y + bh / 2 - 3); ctx.lineTo(X + bw + gap - 8, Y + bh / 2 + 3); ctx.closePath(); ctx.fillStyle = C.muted; ctx.fill(); ctx.restore();
    }
  });
  const chainBottom = 32 + (rows - 1) * rowH + bh;
  const pl = panel(ctx, W, { top: chainBottom + 48, bottom: H - 26, xMin: 1, xMax: 1024, yMin: 1, yMax: 2000, yLog: true, yTicks: [[1, '1'], [10, '10'], [100, '100'], [1000, '1000']], xTicks: [1, 256, 512, 768, 1024].map(v => [v, String(v)]), title: t('c1plot') });
  ctx.save(); ctx.lineWidth = 2;
  ctx.strokeStyle = C.orange; ctx.beginPath(); for (let k = 1; k <= 1024; k++) { if (k === 1) ctx.moveTo(pl.x(k), pl.y(k + 1)); else ctx.lineTo(pl.x(k), pl.y(k + 1)); } ctx.stroke();
  ctx.strokeStyle = C.cyan; ctx.beginPath();
  for (let k = 1; k <= 1024; k++) { const X = pl.x(k), Y = pl.y(HALF_FRAMES[k]); if (k === 1) ctx.moveTo(X, Y); else { ctx.lineTo(X, pl.y(HALF_FRAMES[k - 1])); ctx.lineTo(X, Y); } }
  ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.35; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pl.x(n), pl.P.t); ctx.lineTo(pl.x(n), pl.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, pl.x(n), pl.y(lin.frames), 5, C.text); dot(ctx, pl.x(n), pl.y(half.frames), 5, C.text);
  $('r1').textContent = t('s1readout', { n, fl: lin.frames, ml: lin.mults, fh: half.frames, mh: half.mults, dig: M.digitsOfPow(n) });
}

/* ---------- step 2: merge sort, event by event ---------- */
const s2 = { seed: 1, tr: null };
function build2() { s2.tr = M.mergeTrace(M.makeArray(s2.seed)); $('e2').max = s2.tr.events.length; }
function draw2() {
  const tr = s2.tr, k = num('e2'), E = tr.events.length, st = tr.states[k];
  $('e2v').textContent = `${k}/${E}`;
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2tree'), 18, W);
  const n = tr.arr.length, L = tr.levels, top = 36, rowGap = (H - top - 14) / L, bh = Math.min(32, rowGap - 30), cellW = (W - 16) / n;
  const onStack = new Set(st.stack);
  const box = q => ({ X: 8 + q.lo * cellW + 3, Y: top + q.depth * rowGap, w: (q.hi - q.lo) * cellW - 6, h: bh });
  // edges first
  tr.nodes.forEach(q => { if (q.parent === null) return; const a = box(tr.nodes[q.parent]), b = box(q);
    const reached = st.reached.has(q.id);
    ctx.save(); ctx.strokeStyle = onStack.has(q.id) ? C.orange : reached ? C.ghost : C.dim; ctx.lineWidth = onStack.has(q.id) ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(b.X + b.w / 2, b.Y); ctx.lineTo(a.X + a.w / 2, a.Y + a.h); ctx.stroke(); ctx.restore(); });
  tr.nodes.forEach(q => {
    const { X, Y, w, h } = box(q), reached = st.reached.has(q.id), done = st.done.has(q.id), live = onStack.has(q.id);
    const current = st.ev && st.ev.id === q.id;
    const vals = done ? q.output : q.input;
    ctx.save();
    if (done) { ctx.globalAlpha = current ? 0.4 : 0.2; ctx.fillStyle = C.green; roundRect(ctx, X, Y, w, h, 5); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = done ? C.green : live ? C.orange : C.ghost; ctx.lineWidth = live || current ? 2.2 : 1.2;
    if (!reached) ctx.setLineDash([4, 3]);
    roundRect(ctx, X, Y, w, h, 5); ctx.stroke(); ctx.restore();
    const cw = w / vals.length;
    vals.forEach((v, i) => fitText(ctx, String(v), X + cw * (i + 0.5), Y + h / 2 + 4, cw - 4, { size: 13, weight: done ? 600 : 400, color: reached ? C.text : C.dim, align: 'center' }));
  });
  let what;
  const ev = st.ev, vs = a => a.join(', ');
  if (!ev) what = t('s2start', { vals: vs(tr.arr) });
  else if (ev.type === 'enter') { const q = tr.nodes[ev.id]; what = ev.leaf ? t('s2leaf', { vals: vs(q.input) }) : t('s2enter', { vals: vs(q.input), len: q.hi - q.lo }); }
  else { const q = tr.nodes[ev.id], [a, b] = q.kids.map(id => tr.nodes[id].output); what = t('s2merge', { a: vs(a), b: vs(b), out: vs(q.output), c: ev.cmp }); }
  $('r2').textContent = t('s2readout', { k, E, what, depth: st.stack.length, cmp: st.cmp, total: tr.cmpTotal, worst: M.mergeWorst(n) });
}

/* ---------- step 3: the recursion tree's bill ---------- */
const PRESETS = [['pBinary', 1, 0], ['pMax', 2, 0], ['pMerge', 2, 1], ['pKara', 3, 1], ['pFour', 4, 1]];
function buildPresets() {
  const box = $('presets3');
  box.innerHTML = '<span class="preset-label"></span>' + PRESETS.map(([key]) => `<button class="btn preset" type="button" data-step="3" data-preset="${key}"></button>`).join('');
  box.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => { const p = PRESETS.find(q => q[0] === b.dataset.preset); $('a3').value = p[1]; $('d3').value = p[2]; draw3(); }));
}
function lawText(a, d) {
  const r = a / Math.pow(2, d);
  if (Math.abs(r - 1) < 1e-12) return d === 0 ? '(log₂n + 1)' : `n${d === 1 ? '' : SUP[d]}·(log₂n + 1)`;
  if (r < 1) return d === 1 ? 'n' : `n${SUP[d]}`;
  const e = Math.log2(a); return Number.isInteger(e) ? (e === 1 ? 'n' : `n${SUP[e]}`) : `n^${fmt(e, 3)}`;
}
function draw3() {
  const a = num('a3'), d = num('d3'), m = num('m3'), R = M.treeLevels(a, d, m);
  $('a3v').textContent = String(a); $('d3v').textContent = String(d); $('m3v').textContent = `${m} (n = ${R.n})`;
  document.querySelectorAll('[data-preset]').forEach(b => { const p = PRESETS.find(q => q[0] === b.dataset.preset); b.setAttribute('aria-pressed', p[1] === a && p[2] === d ? 'true' : 'false'); });
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3bars'), 18, W);
  const rows = R.rows, maxT = Math.max(...rows.map(r => r.total)), top = 30, area = 270, rowH = Math.min(36, area / rows.length);
  ctx.font = '11px system-ui,sans-serif';
  const labW = Math.max(...rows.map(r => ctx.measureText(t('levelTag', { k: r.k })).width)) + 10;
  const valW = Math.max(...rows.map(r => ctx.measureText(big(r.total)).width)) + 10;
  const x0 = 8 + labW, x1 = W - 8 - valW;
  rows.forEach((r, i) => {
    const Y = top + i * rowH, len = Math.max(1.5, (x1 - x0) * r.total / maxT), isMax = Math.abs(r.total - maxT) < 1e-9;
    ctx.fillStyle = isMax ? C.orange : C.cyan; ctx.globalAlpha = 0.85; ctx.fillRect(x0, Y + 2, len, rowH - 5); ctx.globalAlpha = 1;
    const fs = Math.min(11, rowH - 4);
    fitText(ctx, t('levelTag', { k: r.k }), 8, Y + rowH / 2 + fs / 2 - 1, labW - 6, { size: fs, color: C.muted });
    fitText(ctx, big(r.total), W - 8, Y + rowH / 2 + fs / 2 - 1, valW - 6, { size: fs, color: isMax ? C.orange : C.text, align: 'right' });
  });
  // ratio T(n) / law for m = 1..10
  const ratios = []; for (let j = 1; j <= 10; j++) { const q = M.treeLevels(a, d, j); ratios.push(q.total / M.predicted(a, d, q.n)); }
  const yMax = Math.max(1, Math.ceil(Math.max(...ratios) * 1.15 * 2) / 2);
  const pl = panel(ctx, W, { top: 340, bottom: H - 26, xMin: 0.5, xMax: 10.5, yMin: 0, yMax, yTicks: [[0, '0'], [yMax / 2, fmt(yMax / 2, 2)], [yMax, fmt(yMax, 2)]], xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => [v, String(v)]), title: t('c3ratio'), left: 36 });
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.2; ctx.beginPath(); ratios.forEach((v, i) => { const X = pl.x(i + 1), Y = pl.y(v); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
  ratios.forEach((v, i) => dot(ctx, pl.x(i + 1), pl.y(v), i + 1 === m ? 6 : 3.5, i + 1 === m ? C.cyan : C.text));
  const share = R.regime === 'top' ? rows[0].total / R.total : rows[rows.length - 1].total / R.total;
  const regime = R.regime === 'even' ? t('regEven', { each: big(rows[0].total), levels: rows.length }) : t(R.regime === 'top' ? 'regTop' : 'regBottom', { share: fmt(100 * share, 1) });
  const L = M.predicted(a, d, R.n);
  $('r3').textContent = t('s3readout', { a, d, n: R.n, r: fmt(R.ratio, 2), regime, T: big(R.total), law: lawText(a, d), L: Number.isInteger(L) ? big(L) : fmt(L, 1), ratio: fmt(R.total / L, 3) });
}

/* ---------- step 4: overlapping subproblems ---------- */
const FIB_TOTAL = (() => { const a = []; for (let n = 0; n <= 40; n++) a.push({ naive: M.fibCountsFast(n, false).calls, memo: M.fibCountsFast(n, true).calls }); return a; })();
function draw4() {
  const n = num('n4'), nv = M.fibCountsFast(n, false), mm = M.fibCountsFast(n, true);
  $('n4v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c4'));
  const ticks = [0, 2, 4, 6, 8].map(e => [Math.pow(10, e), pow10(e)]);
  const xt = n <= 12 ? Array.from({ length: n + 1 }, (_, k) => [k, String(k)]) : Array.from({ length: Math.floor(n / 5) + 1 }, (_, i) => [i * 5, String(i * 5)]);
  const A = panel(ctx, W, { top: 30, bottom: 210, xMin: -0.6, xMax: n + 0.6, yMin: 0.6, yMax: 3e8, yLog: true, yTicks: ticks, xTicks: xt, title: t('c4bars') });
  const slot = (A.P.r - A.P.l) / (n + 1.2), bw = Math.max(1.2, slot * 0.38);
  for (let k = 0; k <= n; k++) {
    const X = A.x(k);
    if (nv.count[k] > 0) { ctx.fillStyle = C.orange; const Y = A.y(nv.count[k]); ctx.fillRect(X - bw - 0.5, Y, bw, A.P.b - Y); }
    if (mm.count[k] > 0) { ctx.fillStyle = C.green; const Y = A.y(mm.count[k]); ctx.fillRect(X + 0.5, Y, bw, A.P.b - Y); }
  }
  const B = panel(ctx, W, { top: 262, bottom: H - 26, xMin: 2, xMax: 40, yMin: 1, yMax: 1e9, yLog: true, yTicks: ticks, xTicks: [2, 10, 20, 30, 40].map(v => [v, String(v)]), title: t('c4calls') });
  [['naive', C.orange], ['memo', C.green]].forEach(([key, col]) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
    for (let q = 2; q <= 40; q++) { const X = B.x(q), Y = B.y(FIB_TOTAL[q][key]); if (q === 2) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke(); ctx.restore();
    dot(ctx, B.x(n), B.y(FIB_TOTAL[n][key]), 5.5, col);
  });
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.35; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.x(n), B.P.t); ctx.lineTo(B.x(n), B.P.b); ctx.stroke(); ctx.restore();
  $('r4').textContent = t('s4readout', { n, n1: n + 1, v: big(M.fibValue(n)), cn: big(nv.calls), c1: big(nv.count[1]), c2: big(nv.count[2]), cm: big(mm.calls), x: big(nv.calls / mm.calls) });
}

/* ---------- step 5: lopsided splits ---------- */
const NS = (() => { const a = []; for (let i = 0; i <= 28; i++) a.push(Math.round(16 * Math.pow(2, i / 4))); return a; })();
const s5 = { tried: new Set() };
const tables = new Map();
const table = p => { const key = p.toFixed(2); if (!tables.has(key)) tables.set(key, M.splitTable(Number(key), 2048)); return tables.get(key); };
function draw5() {
  const p = num('p5'), key = p.toFixed(2);
  s5.tried.add(key);
  $('p5v').textContent = fmt(p, 2);
  const { ctx, W, H } = fitCanvas($('c5'));
  const rows = M.splitRows(256, p);
  const A = panel(ctx, W, { top: 30, bottom: 230, xMin: 0, xMax: 256, yMin: 256, yMax: 0, yTicks: [[0, '0'], [128, '128'], [256, '256']], xTicks: [], title: t('c5ice'), left: 38 });
  ctx.fillStyle = C.cyan;
  const rh = A.y(1) - A.y(0);
  rows.forEach((row, lev) => row.forEach(([st, len]) => { const X0 = A.x(st), X1 = A.x(st + len); ctx.fillRect(X0 + (len > 2 ? 0.4 : 0), A.y(lev), Math.max(0.8, X1 - X0 - (len > 2 ? 0.8 : 0)), Math.max(0.8, rh - (rh > 3 ? 1 : 0))); }));
  const B = panel(ctx, W, { top: 272, bottom: H - 26, xMin: 16, xMax: 2048, yMin: 10, yMax: 4e6, xLog: true, yLog: true, yTicks: [1, 3, 5].map(e => [Math.pow(10, e), pow10(e)]), xTicks: [16, 64, 256, 1024, 2048].map(v => [v, String(v)]), title: t('c5plot') });
  const curve = (f, col, lw, dash) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); NS.forEach((q, i) => { const X = B.x(q), Y = B.y(f(q)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore(); };
  curve(q => q * Math.log2(q), C.ghost, 1.2, [5, 4]);
  curve(q => q * (q - 1) / 2, C.ghost, 1.2, [5, 4]);
  [...s5.tried].forEach(k => { if (k !== key) { const tb = table(Number(k)); curve(q => tb.C[q], C.raw, 1.4); } });
  const tb = table(p); curve(q => tb.C[q], C.cyan, 2.4);
  dot(ctx, B.x(256), B.y(tb.C[256]), 5, C.text);
  $('r5').textContent = t('s5readout', { p: fmt(p, 2), depth: tb.D[256], cmp: big(tb.C[256]), ratio: fmt(tb.C[256] / 2048, 2), grow: fmt(tb.C[2048] / tb.C[1024], 2) });
}

function refresh() {
  stopAll();
  document.querySelector('#presets3 .preset-label').textContent = t('presetsLabel');
  document.querySelectorAll('[data-preset]').forEach(b => { b.textContent = t(b.dataset.preset); });
  draw0(); draw1(); draw2(); draw3(); draw4(); draw5();
  ['play0', 'play2'].forEach(id => { $(id).textContent = t('play'); });
}
function redrawOnly() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  build2(); buildPresets();
  $('n0').addEventListener('input', () => { stop('p0'); $('e0').value = 0; draw0(); });
  $('e0').addEventListener('input', () => { stop('p0'); draw0(); });
  $('play0').addEventListener('click', () => play('p0', 'e0', 550, draw0, 'play0'));
  $('next0').addEventListener('click', () => { stop('p0'); const e = $('e0'); e.value = Math.min(Number(e.max), Number(e.value) + 1); draw0(); });
  $('reset0').addEventListener('click', () => { stop('p0'); $('e0').value = 0; draw0(); });

  $('n1').addEventListener('input', draw1);

  $('e2').addEventListener('input', () => { stop('p2'); draw2(); });
  $('play2').addEventListener('click', () => play('p2', 'e2', 700, draw2, 'play2'));
  $('next2').addEventListener('click', () => { stop('p2'); const e = $('e2'); e.value = Math.min(Number(e.max), Number(e.value) + 1); draw2(); });
  $('reset2').addEventListener('click', () => { stop('p2'); $('e2').value = 0; draw2(); });
  $('shuffle2').addEventListener('click', () => { stop('p2'); s2.seed = s2.seed % 50 + 1; build2(); $('e2').value = 0; draw2(); });

  ['a3', 'd3', 'm3'].forEach(id => $(id).addEventListener('input', draw3));
  $('n4').addEventListener('input', draw4);
  $('p5').addEventListener('input', draw5);
  $('clear5').addEventListener('click', () => { s5.tried.clear(); draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(redrawOnly); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  window.refreshRecursion = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
