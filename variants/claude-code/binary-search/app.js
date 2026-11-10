'use strict';
// Binary search lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every interval, cell and readout comes from window.BS_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and array values laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BS_MODEL;
const t = (...a) => window.BS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', cell: '#1c2a3b', out: '#141c27', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
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
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 14), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const q of o.yTicks) {
    const v = typeof q === 'number' ? q : q.v, lab = typeof q === 'number' ? int(q) : q.label;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  let lastR = -Infinity;
  for (const q of o.xTicks || []) {
    const X = x(q.v), w = ctx.measureText(q.label).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    if (X - w / 2 > lastR + 6 && X + w / 2 <= W - 2 && X - w / 2 >= 2) { ctx.fillText(q.label, X, P.b + 15); lastR = X + w / 2; }
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function polyline(ctx, pts, color, lw = 2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }
// A row of array cells with values written inside when they fit; style(i) → {fill, stroke, text}.
function cells(ctx, arr, X0, Y0, w, h, style) {
  const n = arr.length, cw = w / n;
  ctx.save(); ctx.font = `${Math.min(12, Math.max(8, cw * 0.42))}px system-ui,sans-serif`; ctx.textAlign = 'center';
  const fits = ctx.measureText('88').width <= cw - 3;
  arr.forEach((v, i) => {
    const s = style(i), X = X0 + i * cw;
    ctx.fillStyle = s.fill; ctx.fillRect(X + 1, Y0, cw - 2, h);
    if (s.stroke) { ctx.strokeStyle = s.stroke; ctx.lineWidth = 2; ctx.strokeRect(X + 1, Y0, cw - 2, h); }
    if (fits) { ctx.fillStyle = s.text || C.text; ctx.fillText(String(v), X + cw / 2, Y0 + h / 2 + 4); }
  });
  ctx.restore();
  return { x: i => X0 + (i + 0.5) * cw, cw, fits };
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

/* ---------- step 0: guess my number ---------- */
const s0 = { seed: 4, hist: [] }; // hist: [{g, lo, hi, ans}] — range after each answer
function range0() { return s0.hist.length ? s0.hist[s0.hist.length - 1] : { lo: M.G.lo, hi: M.G.hi, ans: null }; }
function ask0(g) {
  const r = range0(); if (r.ans === 'hit') return;
  const a = M.answer(r, M.secret(s0.seed), g); s0.hist.push({ g, lo: a.lo, hi: a.hi, ans: a.ans, before: { lo: r.lo, hi: r.hi } });
}
function draw0() {
  const g = num('g0'), r = range0(), sec = M.secret(s0.seed), solved = r.ans === 'hit';
  $('g0v').textContent = String(g);
  const { ctx, W, H } = fitCanvas($('c0'));
  const rows = Math.max(8, s0.hist.length + 1), x0 = 34, x1 = W - 14, rh = Math.min(30, (H - 56) / rows);
  const X = v => x0 + (v - 0.5) / 100 * (x1 - x0);
  title(ctx, t('c0'), 8, 17, W - 16);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (const v of [1, 25, 50, 75, 100]) ctx.fillText(String(v), X(v), 26 + rows * rh + 16);
  ctx.textAlign = 'right';
  const states = [{ lo: 1, hi: 100 }, ...s0.hist];
  states.forEach((st, k) => {
    const Y = 28 + k * rh;
    if (k === 0 || k % 2 === 0 || rows <= 10) ctx.fillText(String(k), x0 - 8, Y + rh / 2 + 4);
    ctx.fillStyle = C.out; ctx.fillRect(x0, Y + 3, x1 - x0, rh - 6);
    ctx.fillStyle = st.ans === 'hit' ? C.green : 'rgba(103,215,249,0.45)'; ctx.fillRect(X(st.lo - 0.5 + 0.5) - (x1 - x0) / 200, Y + 3, (st.hi - st.lo + 1) * (x1 - x0) / 100, rh - 6);
    const nxt = states[k + 1];
    if (nxt) { ctx.fillStyle = C.orange; ctx.fillRect(X(nxt.g) - 1.5, Y + 1, 3, rh - 2); }
    ctx.fillStyle = C.muted;
  });
  ctx.restore();
  // guess marker on the current row
  if (!solved) { const Y = 28 + s0.hist.length * rh; ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(g), Y); ctx.lineTo(X(g), Y + rh); ctx.stroke(); }
  const last = s0.hist[s0.hist.length - 1];
  const fb = !last ? t('s0none') : t('ans_' + last.ans, { g: last.g });
  $('r0').textContent = t('s0readout', { fb, k: s0.hist.length, lo: r.lo, hi: r.hi, left: r.hi - r.lo + 1 }) + (solved ? t('s0solved', { k: s0.hist.length, w: M.worstQuestions(100) }) : '');
  $('ask0').disabled = solved; $('mid0').disabled = solved;
}

/* ---------- step 1: lo, mid, hi on a sorted array ---------- */
const s1 = { k: 99 }; // k beyond the run length = show the whole run
function draw1() {
  const x = num('x1'), run = M.search(M.ARR, x), K = run.steps.length, k = Math.min(s1.k, K);
  $('x1v').textContent = String(x);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1'), 8, 17, W - 16);
  const n = M.ARR.length, x0 = 30, w = W - x0 - 10, rh = Math.min(w / n >= 19 ? 34 : 42, (H - 30) / 6);
  const maxRow = Math.min(5, run.found >= 0 && k === K ? K - 1 : k); // a hit ends on its own row
  for (let r = 0; r <= maxRow; r++) {
    const Y = 26 + r * rh;
    ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(String(r), x0 - 6, Y + rh / 2 + 2); ctx.restore();
    const st = r < K ? run.steps[r] : null, prev = r < k;
    const lo = st ? st.lo : run.lo, hi = st ? st.hi : run.hi;
    const style = i => {
      const inside = i >= lo && i <= hi;
      if (prev && st && i === st.mid) return { fill: st.rel === 'eq' ? C.green : C.orange, text: '#061118' };
      return { fill: inside ? C.cell : C.out, text: inside ? C.text : '#3d4b5c' };
    };
    // narrow screens: two lines of 12 cells per step so every value stays readable
    if (w / n >= 19) cells(ctx, M.ARR, x0, Y, w, rh - 8, style);
    else { const h2 = (rh - 8) / 2, half = n / 2; cells(ctx, M.ARR.slice(0, half), x0, Y - 1, w, h2, style); cells(ctx, M.ARR.slice(half), x0, Y + h2, w, h2, i => style(i + half)); }
  }
  const st = run.steps[k - 1];
  let status;
  if (k === 0) status = t('s1start', { hi: n - 1 });
  else if (st.rel === 'eq') status = t('s1eq', { mid: st.mid, v: st.v });
  else status = t(st.rel === 'lt' ? 's1lt' : 's1gt', { mid: st.mid, v: st.v, x, lo: st.rel === 'lt' ? st.mid + 1 : st.lo, hi: st.rel === 'lt' ? st.hi : st.mid - 1 });
  const end = k === K ? (run.found >= 0 ? t('s1found', { i: run.found, k: K }) : t('s1absent', { k: K, lo: run.lo, hi: run.hi })) : '';
  $('r1').textContent = t('s1readout', { k, status }) + end;
}

/* ---------- step 2: how the count grows ---------- */
function draw2() {
  const p = num('p2'), n = Math.round(Math.pow(10, p)), b = M.worstSearch(n);
  $('p2v').textContent = int(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  const xt = []; for (let e = 0; e <= 9; e += 1) xt.push({ v: e, label: e === 0 ? '1' : e < 4 ? int(10 ** e) : '10' + '⁰¹²³⁴⁵⁶⁷⁸⁹'[e] });
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 9.2, yMin: 0, yMax: 32, yTicks: [0, 10, 20, 30], xTicks: xt, title: t('c2') });
  const stair = []; for (let e = 0; e <= 9.2; e += 0.002) { const m = Math.max(1, Math.floor(10 ** e)); stair.push([A.x(e), A.y(M.worstSearch(m))]); }
  polyline(ctx, stair, C.cyan, 2.2);
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.4; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(A.x(p), A.P.t); ctx.lineTo(A.x(p), A.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(p), A.y(b), 6, C.text);
  $('r2').textContent = t('s2readout', { n: int(n), b, lin: int(n), avg: int((n + 1) / 2), ratio: int(n / b) });
}

/* ---------- step 3: four versions, every target ---------- */
const s3 = { variant: 'loMid' };
function draw3() {
  const x = num('x3'), run = M.search(M.SMALL, x, s3.variant, 12);
  $('x3v').textContent = String(x);
  document.querySelectorAll('[data-variant]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.variant === s3.variant)));
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 17, W - 16);
  const x0 = 30, w = W - x0 - 10, rh = 26, show = Math.min(run.steps.length, 6);
  for (let r = 0; r < show; r++) {
    const st = run.steps[r], Y = 26 + r * rh;
    ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(String(r + 1), x0 - 6, Y + rh / 2 + 1); ctx.restore();
    cells(ctx, M.SMALL, x0, Y, w, rh - 6, i => i === st.mid ? { fill: st.rel === 'eq' ? C.green : C.orange, text: '#061118' } : i >= st.lo && i <= st.hi ? { fill: C.cell } : { fill: C.out, text: '#3d4b5c' });
  }
  // grid: rows = versions, columns = targets 5..85
  const gy = 26 + 6 * rh + 30, gx = 54, gw = W - gx - 10, ch = 24, cw = gw / M.TARGETS.length;
  title(ctx, t('c3b'), 8, gy - 10, W - 16);
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  M.VARIANTS.forEach((v, r) => {
    const out = M.grade(v), Y = gy + r * (ch + 4);
    ctx.fillStyle = v === s3.variant ? C.text : C.muted; ctx.textAlign = 'right'; ctx.fillText(t('vshort_' + v), gx - 6, Y + ch / 2 + 4);
    out.forEach((o, i) => { ctx.fillStyle = o === 'right' ? C.green : o === 'loop' ? C.violet : C.pink; ctx.globalAlpha = v === s3.variant ? 1 : 0.55; ctx.fillRect(gx + i * cw + 1, Y, cw - 2, ch); ctx.globalAlpha = 1; });
    if (v === s3.variant) { const i = M.TARGETS.indexOf(x); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.strokeRect(gx + i * cw, Y - 1, cw, ch + 2); }
  });
  ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const yl = gy + 4 * (ch + 4) + 12; let lastR = -Infinity;
  M.TARGETS.forEach((v, i) => { const X = gx + (i + 0.5) * cw, wd = ctx.measureText(String(v)).width; if (X - wd / 2 > lastR + 4) { ctx.fillText(String(v), X, yl); lastR = X + wd / 2; } });
  ctx.restore();
  const g = M.grade(s3.variant), truth = M.SMALL.indexOf(x);
  const res = run.loop ? t('s3loop', { lo: run.lo, hi: run.hi, k: run.steps.length }) : run.found >= 0 ? t('s3found', { i: run.found }) : truth >= 0 ? t('s3missed', { i: truth }) : t('s3absent');
  $('r3').textContent = t('s3readout', { ver: t('v_' + s3.variant), x, res, R: g.filter(o => o === 'right').length, L: g.filter(o => o === 'loop').length, Wr: g.filter(o => o === 'wrong').length, N: g.length });
}

/* ---------- step 4: duplicates ---------- */
function draw4() {
  const x = num('x4'), a = M.DUP, lb = M.bound(a, x, false), ub = M.bound(a, x, true), any = M.search(a, x);
  $('x4v').textContent = String(x);
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4'), 8, 17, W - 16);
  const x0 = 14, w = W - 28, n = a.length, cw = w / n;
  const g = cells(ctx, a, x0, 34, w, 36, i => i >= lb.idx && i < ub.idx ? { fill: 'rgba(126,226,168,0.35)', stroke: i === any.found ? C.orange : null } : { fill: C.cell, stroke: i === any.found ? C.orange : null });
  ctx.save(); ctx.font = '10px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const every = cw < 18 ? 3 : 1;
  for (let i = 0; i <= n; i += every) ctx.fillText(String(i), x0 + i * cw, 86);
  ctx.restore();
  // boundary markers sit between cells: index i = the gap before cell i
  const mark = (i, color, row) => { const X = x0 + i * cw; ctx.fillStyle = color; ctx.fillRect(X - 1.5, 26, 3, 52); ctx.beginPath(); ctx.moveTo(X, 92 + row * 16); ctx.lineTo(X - 6, 102 + row * 16); ctx.lineTo(X + 6, 102 + row * 16); ctx.closePath(); ctx.fill(); };
  mark(lb.idx, C.cyan, 0); mark(ub.idx, C.violet, 1);
  void g;
  // compare the number of looks
  const B = panel(ctx, W, { top: 162, bottom: H - 26, left: 14, xMin: 0, xMax: 6, yMin: 0, yMax: 3, yTicks: [], xTicks: [0, 1, 2, 3, 4, 5].map(v => ({ v, label: String(v) })), title: t('c4b') });
  [[any.steps.length, C.orange], [lb.steps.length, C.cyan], [ub.steps.length, C.violet]].forEach(([v, c], r) => { ctx.fillStyle = c; ctx.fillRect(B.x(0), B.y(2.75 - r) , B.x(v) - B.x(0), (B.P.b - B.P.t) / 3 - 10); });
  const cnt = ub.idx - lb.idx;
  $('r4').textContent = t('s4readout', { x, any: any.found >= 0 ? t('s4any', { i: any.found }) : t('s4none'), lb: lb.idx, ub: ub.idx, cnt, ka: any.steps.length, kl: lb.steps.length, ku: ub.steps.length, n });
}

/* ---------- step 5: bisection ---------- */
function draw5() {
  const c = num('cv5'), K = num('k5'), rows = M.bisect(c, K), last = rows[K], w = last.hi - last.lo;
  $('cv5v').textContent = fmt(c, 1); $('k5v').textContent = String(K);
  let { ctx, W, H } = fitCanvas($('c5'));
  const top = M.bisect(c, 0)[0].hi, show = Math.min(K, 8);
  title(ctx, t('c5a', { top: fmt(top, 1) }), 8, 17, W - 16);
  const x0 = 30, x1 = W - 14, X = v => x0 + v / top * (x1 - x0), rh = (H - 60) / 9;
  for (let k = 0; k <= show; k++) {
    const r = rows[k], Y = 26 + k * rh;
    ctx.fillStyle = C.out; ctx.fillRect(x0, Y + 2, x1 - x0, rh - 4);
    ctx.fillStyle = 'rgba(103,215,249,0.55)'; ctx.fillRect(X(r.lo), Y + 2, Math.max(2, X(r.hi) - X(r.lo)), rh - 4);
    ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(String(k), x0 - 6, Y + rh / 2 + 4); ctx.restore();
  }
  const sq = Math.sqrt(c);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(sq), 24); ctx.lineTo(X(sq), 26 + 9 * rh); ctx.stroke(); ctx.setLineDash([]);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const stepT = top > 6 ? 2 : 1; for (let v = 0; v <= top + 1e-9; v += stepT) ctx.fillText(String(v), X(v), 26 + 9 * rh + 16);
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const yt = []; for (let p = 0; p >= -10; p -= 2) yt.push({ v: p, label: p === 0 ? '1' : '10' + String(p).split('').map(ch => ({ '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' })[ch]).join('') });
  const B = panel(ctx, W, { top: 26, bottom: H - 26, left: 44, xMin: 0, xMax: 40, yMin: -12.5, yMax: 1.2, yTicks: yt, xTicks: [0, 10, 20, 30, 40].map(v => ({ v, label: String(v) })), title: t('c5b') });
  const all = M.bisect(c, 40);
  polyline(ctx, all.map((r, k) => [B.x(k), B.y(Math.max(-12.5, Math.log10(r.hi - r.lo)))]), C.ghost, 1.3, [4, 4]);
  polyline(ctx, all.slice(0, K + 1).map((r, k) => [B.x(k), B.y(Math.max(-12.5, Math.log10(r.hi - r.lo)))]), C.cyan, 2.4);
  dot(ctx, B.x(K), B.y(Math.max(-12.5, Math.log10(w))), 5.5, C.text);
  const dg = M.sharedDigits(last.lo, last.hi);
  $('r5').textContent = t('s5readout', { c: fmt(c, 1), k: K, lo: last.lo.toFixed(10), hi: last.hi.toFixed(10), w: (() => { const p = Math.floor(Math.log10(w)), m = w / 10 ** p; return p === 0 ? fmt(w, 3) : fmt(m, 2) + '×10' + String(p).split('').map(ch => ({ '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' })[ch]).join(''); })(), d: Math.max(0, dg), sq: sq.toFixed(10) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('g0').addEventListener('input', draw0);
  $('ask0').addEventListener('click', () => { ask0(num('g0')); draw0(); });
  $('mid0').addEventListener('click', () => { const g = M.midGuess(range0()); $('g0').value = g; ask0(g); draw0(); });
  $('new0').addEventListener('click', () => { s0.seed = s0.seed % 97 + 1; s0.hist = []; draw0(); });

  $('x1').addEventListener('input', () => { stopAnim('s1'); s1.k = 99; draw1(); });
  $('next1').addEventListener('click', () => { stopAnim('s1'); const K = M.search(M.ARR, num('x1')).steps.length; s1.k = s1.k >= K ? 0 : s1.k + 1; draw1(); });
  $('run1').addEventListener('click', () => { const K = M.search(M.ARR, num('x1')).steps.length; s1.k = 0; draw1(); animate('s1', K * 700, p => { s1.k = Math.round(p * K); draw1(); }); });

  $('p2').addEventListener('input', draw2);

  $('x3').addEventListener('input', draw3);
  document.querySelectorAll('[data-variant]').forEach(b => b.addEventListener('click', () => { s3.variant = b.dataset.variant; draw3(); }));

  $('x4').addEventListener('input', draw4);
  ['cv5', 'k5'].forEach(id => $(id).addEventListener('input', draw5));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshBinarySearch = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
