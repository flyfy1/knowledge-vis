'use strict';
// LTI lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every stem, curve and readout comes from window.LTI_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.LTI_MODEL;
const t = (...a) => window.LTI_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s).replace(/^-/, '−'); };
const fmtRes = v => (v < M.TOL ? (v === 0 ? '0' : v.toExponential(0).replace('-', '−')) : fmt(v, 3));
const NICE = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32, 40];
const niceMax = v => NICE.find(s => s >= v * 1.05) || NICE[NICE.length - 1];

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

// Panel title in its own row; shrinks the font until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 26, o.xSteps || [1, 2, 4, 5, 10, 20]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P, o };
}
const symTicks = m => [-m, 0, m];
function stem(ctx, m, n, v, color, { lw = 2.2, r = 3.8, hollow = false, alpha = 1, dx = 0 } = {}) {
  const lo = m.o.yMin, hi = m.o.yMax, vc = Math.max(lo, Math.min(hi, v)), X = m.x(n) + dx, Y = m.y(vc), Y0 = m.y(Math.max(lo, Math.min(hi, 0)));
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X, Y0); ctx.lineTo(X, Y); ctx.stroke();
  if (vc !== v) { // clipped: arrowhead instead of a dot
    const s = v > 0 ? -1 : 1; ctx.beginPath(); ctx.moveTo(X - 4.5, Y - s * 6); ctx.lineTo(X + 4.5, Y - s * 6); ctx.lineTo(X, Y); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } else ctx.fill();
  }
  ctx.restore();
}
function ring(ctx, m, n, v, color = C.orange, r = 5.5) {
  if (!Number.isFinite(v)) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x(n), m.y(v), r, 0, 7); ctx.stroke(); ctx.restore();
}
function vguide(ctx, X, y0, y1, color = C.orange) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
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

/* ---------- box chooser rows ---------- */
function boxRow(containerId, ids, getCur, onPick) {
  const box = $(containerId);
  ids.forEach(id => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn'; b.dataset.box = id; b.dataset.step = containerId.slice(-1);
    b.addEventListener('click', () => onPick(id));
    box.appendChild(b);
  });
  return () => box.querySelectorAll('button').forEach(b => { b.textContent = t('box_' + b.dataset.box); b.setAttribute('aria-pressed', String(b.dataset.box === getCur())); });
}
const ruleText = (id, a) => t('ruleLabel') + (id === 'smooth' && a !== undefined ? t('rule_smoothA', { a: fmt(a, 1), b: fmt(1 - a, 1) }) : t('rule_' + id));
const list = arr => arr.map(v => fmt(v)).join(', ');

/* ---------- step 0: take the input apart ---------- */
const s0 = { preset: 0 };
const curX = () => M.PRESETS[s0.preset];
function draw0() {
  const c = num('cnt0'), x = curX();
  $('c0v').textContent = String(c);
  const { ctx, W, H } = fitCanvas($('c0'));
  const opt = { xMin: -0.6, xMax: 8.6, xTicks: true, yMin: -2, yMax: 2, yTicks: [-2, -1, 0, 1, 2] };
  const A = panel(ctx, W, { ...opt, top: 26, bottom: 136, yTicks: [-2, 0, 2], title: t('c0a') });
  if (c > 0) stem(ctx, A, c - 1, x[c - 1], C.orange, { hollow: x[c - 1] === 0 });
  const B = panel(ctx, W, { ...opt, top: 178, bottom: H - 26, yTicks: [-2, 0, 2], title: t('c0b') });
  x.forEach((v, k) => ring(ctx, B, k, v, C.ghost, 6));
  M.partialSum(x, c, 9).forEach((v, n) => { if (n < c) stem(ctx, B, n, v, C.cyan, { hollow: v === 0 }); });
  if (c > 0) vguide(ctx, A.x(c - 1), A.P.t, B.P.b);
  if (c === 0) $('r0').textContent = t('s0readout0');
  else if (c >= x.length) $('r0').textContent = t('s0readoutFull', { e: fmt(M.maxAbsDiff(M.partialSum(x, c, x.length), x), 3) });
  else $('r0').textContent = t('s0readout', { c, k: c - 1, v: fmt(x[c - 1]) });
}

/* ---------- step 1: slap, predict, run ---------- */
const s1 = { box: 'echo', rev: M.L, pred: true, ran: true }; // first view shows the finished experiment; every button replays it
let paint1 = () => {};
function draw1() {
  paint1();
  $('rule1').textContent = ruleText(s1.box);
  const r = M.slapAndPredict(s1.box, curX());
  $('pred1').disabled = s1.rev < M.L;
  const { ctx, W, H } = fitCanvas($('c1'));
  const opt = { xMin: -0.6, xMax: M.L - 0.4, xTicks: true };
  const A = panel(ctx, W, { ...opt, top: 26, bottom: 124, yMin: -1.2, yMax: 1.2, yTicks: [-1, 0, 1], title: t('c1a') });
  r.h.forEach((v, n) => { if (n < s1.rev) stem(ctx, A, n, v, C.green, { hollow: Math.abs(v) < 1e-12, r: 3.2 }); });
  const B = panel(ctx, W, { ...opt, top: 166, bottom: 248, yMin: -2, yMax: 2, yTicks: [-2, 0, 2], title: t('c1b') });
  r.x.forEach((v, n) => { if (n < M.N_IN) stem(ctx, B, n, v, C.xs, { hollow: v === 0, r: 3.2 }); });
  const ym = niceMax(Math.max(...r.act.map(Math.abs), ...r.pred.map(Math.abs), 1));
  const Cp = panel(ctx, W, { ...opt, top: 290, bottom: H - 26, yMin: -ym, yMax: ym, yTicks: symTicks(ym), title: t('c1c') });
  if (s1.ran) r.act.forEach((v, n) => stem(ctx, Cp, n, v, C.cyan, { hollow: Math.abs(v) < 1e-12, r: 3.2 }));
  if (s1.pred) r.pred.forEach((v, n) => ring(ctx, Cp, n, v));
  const parts = [];
  if (s1.rev === 0) parts.push(t('s1wait'));
  else if (s1.rev < M.L) parts.push(t('s1progress', { c: s1.rev, N: M.L }));
  else parts.push(t('s1h', { h: list(r.h) }));
  if (s1.pred) parts.push(t('s1pred', { y: list(r.pred) }));
  if (s1.pred && s1.ran) parts.push(t('s1cmp', { e: fmtRes(r.err), verdict: t(r.err < M.TOL ? 's1same' : 's1off') }));
  $('r1').textContent = parts.join(' ');
}

/* ---------- step 2: axiom check-up ---------- */
const s2 = { box: 'echo', test: 'sup', board: {} };
M.IDS.forEach(id => { s2.board[id] = { sup: null, shift: null, pred: null }; });
let paint2 = () => {};
function run2() {
  const A = num('A2'), d = num('d2'), id = s2.box;
  const r = s2.test === 'shift' ? M.shift(id, A, d) : M.TESTS[s2.test](id, A, d);
  return { r, A, d };
}
function draw2(record = true) {
  paint2();
  $('rule2').textContent = ruleText(s2.box);
  const { r, A, d } = run2();
  $('A2v').textContent = fmt(A); $('d2v').textContent = String(d);
  ['Sup', 'Shift', 'Pred'].forEach(k => $('test' + k).setAttribute('aria-pressed', String(s2.test === k.toLowerCase())));
  $('d2').disabled = s2.test !== 'shift';
  if (record) s2.board[s2.box][s2.test] = { res: r.res, A, d };
  const { ctx, W, H } = fitCanvas($('c2'));
  const opt = { xMin: -0.6, xMax: M.L - 0.4, xTicks: true };
  const ins = s2.test === 'shift' ? [...r.x, ...r.xs] : r.x;
  const yi = niceMax(Math.max(...ins.map(Math.abs), 1));
  const Ap = panel(ctx, W, { ...opt, top: 26, bottom: 130, yMin: -yi, yMax: yi, yTicks: symTicks(yi), title: t('c2a_' + s2.test) });
  r.x.forEach((v, n) => stem(ctx, Ap, n, v, C.xs, { hollow: Math.abs(v) < 1e-12, r: 3.2, dx: s2.test === 'shift' ? -3 : 0 }));
  if (s2.test === 'shift') r.xs.forEach((v, n) => { if (Math.abs(v) > 1e-12) stem(ctx, Ap, n, v, C.orange, { r: 3.2, dx: 3, lw: 1.6 }); });
  const outs = [...r.r1, ...r.r2.filter(Number.isFinite)];
  const yo = niceMax(Math.max(...outs.map(Math.abs), 1));
  const Bp = panel(ctx, W, { ...opt, top: 172, bottom: H - 26, yMin: -yo, yMax: yo, yTicks: symTicks(yo), title: t('c2b_' + s2.test) });
  if (s2.test === 'shift' && d > 0) { ctx.fillStyle = 'rgba(134,150,170,0.12)'; ctx.fillRect(Bp.P.l, Bp.P.t, Bp.x(d - 0.5) - Bp.P.l, Bp.P.b - Bp.P.t); }
  r.r1.forEach((v, n) => {
    const w = r.r2[n];
    if (Number.isFinite(w) && Math.abs(v - w) > M.TOL) { ctx.fillStyle = 'rgba(255,122,147,0.22)'; ctx.fillRect(Bp.x(n - 0.42), Bp.P.t, Bp.x(n + 0.42) - Bp.x(n - 0.42), Bp.P.b - Bp.P.t); }
  });
  r.r1.forEach((v, n) => stem(ctx, Bp, n, v, C.cyan, { hollow: Math.abs(v) < 1e-12, r: 3.2 }));
  r.r2.forEach((v, n) => ring(ctx, Bp, n, v));
  const sw = (cls, key, extra = '') => `<span class="lg"><span class="sw ${cls}"></span><span>${t(key, extra)}</span></span>`;
  $('lg2').innerHTML = sw('sw-x', 's2lgIn') + (s2.test === 'shift' ? sw('sw-orange', 's2lgDelayed') : '') + sw('sw-cyan', 's2lgR1') + sw('sw-ring', 's2lgR2') + sw('sw-pink', 's2lgBad');
  const dpart = s2.test === 'shift' ? t('s2dpart', { d }) : '';
  $('r2').textContent = t('s2readout', { box: t('box_' + s2.box), test: t('test' + { sup: 'Sup', shift: 'Shift', pred: 'Pred' }[s2.test]), A: fmt(A), dpart, res: fmtRes(r.res), verdict: t(r.res < M.TOL ? 'pass' : 'fail') });
  drawBoard();
}
function drawBoard() {
  const head = `<tr><th>${t('bBox')}</th><th>${t('testSup')}</th><th>${t('testShift')}</th><th>${t('testPred')}</th></tr>`;
  const rows = M.IDS.map(id => {
    const cells = ['sup', 'shift', 'pred'].map(k => {
      const c = s2.board[id][k];
      if (!c) return `<td class="none">${t('cellNone')}</td>`;
      return c.res < M.TOL ? `<td class="pass">${t('cellPass', { A: fmt(c.A) })}</td>` : `<td class="fail">${t('cellFail', { res: fmt(c.res, 3), A: fmt(c.A) })}</td>`;
    }).join('');
    return `<tr class="${id === s2.box ? 'cur' : ''}"><td>${t('box_' + id)}</td>${cells}</tr>`;
  }).join('');
  $('board2').innerHTML = head + rows;
}

/* ---------- step 3: step response ---------- */
const s3 = { box: 'smooth', rev: M.L };
let paint3 = () => {};
function draw3() {
  paint3();
  const a = num('a3');
  $('a3v').textContent = fmt(a, 1); $('a3').disabled = s3.box !== 'smooth';
  $('rule3').textContent = ruleText(s3.box, s3.box === 'smooth' ? a : undefined);
  const st = M.stepStudy(s3.box, a);
  const { ctx, W, H } = fitCanvas($('c3'));
  const opt = { xMin: -0.6, xMax: M.L - 0.4, xTicks: true };
  const A = panel(ctx, W, { ...opt, top: 26, bottom: 136, yMin: -1.2, yMax: 1.2, yTicks: [-1, 0, 1], title: t('c3a') });
  st.h.forEach((v, n) => stem(ctx, A, n, v, C.green, { hollow: Math.abs(v) < 1e-12, r: 3.2, alpha: n < s3.rev ? 1 : 0.28 }));
  const B = panel(ctx, W, { ...opt, top: 178, bottom: H - 26, yMin: -0.25, yMax: 1.75, yTicks: [0, 0.5, 1, 1.5], title: t('c3b') });
  st.cum.forEach((v, n) => { if (n < s3.rev) stem(ctx, B, n, v, C.cyan, { hollow: Math.abs(v) < 1e-12, r: 3.2 }); });
  st.s.forEach((v, n) => ring(ctx, B, n, v));
  if (s3.rev > 0 && s3.rev < M.L) vguide(ctx, A.x(s3.rev - 1), A.P.t, B.P.b, C.green);
  const gap = Math.abs(st.dc - st.last);
  const prog = s3.rev < M.L ? t('s3progress', { c: s3.rev, N: M.L }) : '';
  $('r3').textContent = t('s3readout', { prog, box: t('box_' + s3.box), s: fmt(st.last, 3), e1: fmtRes(st.errCum), e2: fmtRes(st.errBack), dc: fmt(st.dc), note: gap > 0.005 ? t('s3noteSlow', { gap: fmt(gap, 3) }) : '' });
  // (the trailing period lives in the template only when no note follows)
  if (gap <= 0.005) $('r3').textContent += lang() === 'zh' ? '。' : '.';
}
const lang = () => window.LTI_I18N.getLang();

/* ---------- step 4: causality and stability from h ---------- */
function draw4() {
  const r = Math.round(num('r4') * 100) / 100, n0 = num('n04');
  $('r4v').textContent = fmt(r); $('n04v').textContent = fmt(n0, 0);
  const wc = M.worstCase(r, n0);
  const { ctx, W, H } = fitCanvas($('c4'));
  const opt = { xMin: M.S4.nMin - 0.6, xMax: M.S4.nMax + 0.6, xTicks: true, xSteps: [2, 5, 10] };
  const A = panel(ctx, W, { ...opt, top: 26, bottom: 150, yMin: -2, yMax: 2, yTicks: [-2, -1, 0, 1, 2], title: t('c4a') });
  wc.h.forEach((v, i) => { const n = wc.ns[i]; if (v !== 0) stem(ctx, A, n, v, n < 0 ? C.pink : C.green, { r: 2.8, lw: 1.8 }); });
  const top = wc.acc[wc.acc.length - 1];
  const ym = niceMax(Math.min(40, Math.max(2, top, Number.isFinite(wc.bound) ? wc.bound : 0)));
  const B = panel(ctx, W, { ...opt, top: 192, bottom: H - 26, yMin: 0, yMax: ym, yTicks: [0, ym / 2, ym], title: t('c4b') });
  ctx.save(); ctx.beginPath(); ctx.rect(B.P.l, B.P.t - 2, B.P.r - B.P.l, B.P.b - B.P.t + 4); ctx.clip();
  if (Number.isFinite(wc.bound)) { ctx.strokeStyle = C.ghost; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(B.P.l, B.y(wc.bound)); ctx.lineTo(B.P.r, B.y(wc.bound)); ctx.stroke(); ctx.setLineDash([]); }
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  wc.acc.forEach((v, i) => { const X = B.x(wc.ns[i]), Y = B.y(v); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke();
  ctx.fillStyle = C.cyan; wc.acc.forEach((v, i) => { if (v <= ym) { ctx.beginPath(); ctx.arc(B.x(wc.ns[i]), B.y(v), 2.2, 0, 7); ctx.fill(); } });
  ctx.restore();
  vguide(ctx, A.x(0), A.P.t, B.P.b);
  const causal = wc.causal ? t('s4causal') : t('s4noncausal', { e: wc.early, n0: fmt(n0, 0) });
  const ar = fmt(Math.abs(r));
  const stable = wc.stable ? t('s4stable', { ar, tot: fmt(wc.total31, 3), bound: fmt(wc.bound, 3) }) : t('s4unstable', { ar, tot: fmt(wc.total31, 1) });
  $('r4out').textContent = t('s4readout', { causal, stable });
}

/* ---------- step 5: sine in, sine out ---------- */
const s5 = { box: 'smooth', hist: new Set() };
let paint5 = () => {};
function draw5() {
  paint5();
  $('rule5').textContent = ruleText(s5.box);
  const m = num('m5'), A = num('A5');
  $('m5v').textContent = `${m} (ω = ${fmt(m / 32, 5)}π)`; $('A5v').textContent = fmt(A);
  s5.hist.add(m);
  const r = M.sineTest(s5.box, m, A), lti = M.BOXES[s5.box].lti;
  const { ctx, W, H } = fitCanvas($('c5'));
  const n0 = 64, n1 = 95;
  const ya = niceMax(Math.max(A, ...r.y.slice(n0, n1 + 1).map(Math.abs)));
  const Ap = panel(ctx, W, { top: 26, bottom: 140, xMin: n0 - 0.5, xMax: n1 + 0.5, yMin: -ya, yMax: ya, yTicks: symTicks(ya), xTicks: true, xSteps: [4, 8, 16], minPx: 30, title: t('c5a') });
  const line = (arr, col, lw, rad) => {
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let n = n0; n <= n1; n++) { const X = Ap.x(n), Y = Ap.y(arr[n]); if (n === n0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke(); for (let n = n0; n <= n1; n++) { ctx.beginPath(); ctx.arc(Ap.x(n), Ap.y(arr[n]), rad, 0, 7); ctx.fill(); } ctx.restore();
  };
  line(r.x, C.raw, 1.2, 2); line(r.y, C.cyan, 2, 2.6);
  const ys = niceMax(Math.max(...r.amp, 0.5));
  const Bp = panel(ctx, W, { top: 182, bottom: 300, xMin: -0.02, xMax: 1.02, yMin: 0, yMax: ys, yTicks: [0, ys / 2, ys], xTicks: true, xSteps: [0.25, 0.5], minPx: 34, title: t('c5b') });
  r.amp.forEach((v, k) => { if (v > 1e-6 || k === m) stem(ctx, Bp, k / 32, v, k === m ? C.orange : C.cyan, { r: 3, lw: 2, hollow: v <= 1e-6 }); });
  // gain history
  const Hgrid = [];
  if (lti) for (let i = 0; i <= 256; i++) { const w = Math.PI * i / 256; Hgrid.push(M.Hclosed(s5.box, w).mag); }
  const gains = [...s5.hist].map(q => [q, M.sineTest(s5.box, q, A).gain]);
  const yg = niceMax(Math.max(...gains.map(g => g[1]), ...Hgrid, 1));
  const Cp = panel(ctx, W, { top: 342, bottom: H - 26, xMin: -0.02, xMax: 1.02, yMin: 0, yMax: yg, yTicks: [0, yg / 2, yg], xTicks: true, xSteps: [0.25, 0.5], minPx: 34, title: t('c5c') });
  if (lti) { ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.6; ctx.beginPath(); Hgrid.forEach((v, i) => { const X = Cp.x(i / 256), Y = Cp.y(v); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore(); }
  gains.forEach(([q, g]) => { if (q === m) return; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(Cp.x(q / 32), Cp.y(g), 3.3, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(Cp.x(m / 32), Cp.y(r.gain), 5.5, 0, 7); ctx.fill();
  vguide(ctx, Bp.x(m / 32), Bp.P.t, Cp.P.b);
  const ph = r.gain > 1e-6 ? t('s5phase', { p: fmt(r.phase * 180 / Math.PI, 1) }) : t('s5nophase');
  const H5 = lti ? t('s5H', { hm: fmt(r.Hh.mag, 3), hp: fmt(r.Hh.ph * 180 / Math.PI, 1) }) : t('s5noH');
  const nbList = r.newBins.map(k => fmt(k / 32, 5));
  const nb = nbList.length ? t('s5nb', { list: nbList.slice(0, 6).join(', ') + (nbList.length > 6 ? ', …' : '') }) : '';
  $('r5').textContent = t('s5readout', { box: t('box_' + s5.box), w: fmt(m / 32, 5), g: fmt(r.gain, 3), ph, H: H5, o: fmt(r.other * 100, 1), nb });
}

function refresh() { draw0(); draw1(); draw2(false); draw3(); draw4(); draw5(); }

function setup() {
  // step 0
  $('cnt0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('play0').addEventListener('click', () => {
    $('cnt0').value = 0; draw0();
    animate('s0', 9 * 500, p => { $('cnt0').value = Math.min(8, Math.floor(p * 9)); draw0(); });
  });
  $('next0').addEventListener('click', () => { s0.preset = (s0.preset + 1) % M.PRESETS.length; draw0(); draw1(); });
  // step 1
  paint1 = boxRow('boxes1', M.LTI_IDS, () => s1.box, id => { stopAnim('s1'); Object.assign(s1, { box: id, rev: 0, pred: false, ran: false }); draw1(); });
  $('slap1').addEventListener('click', () => {
    s1.rev = 0; s1.pred = false; draw1();
    animate('s1', M.L * 110, p => { s1.rev = Math.min(M.L, Math.floor(p * (M.L + 1))); draw1(); });
  });
  $('pred1').addEventListener('click', () => { s1.pred = true; draw1(); });
  $('run1').addEventListener('click', () => { s1.ran = true; draw1(); });
  // step 2
  paint2 = boxRow('boxes2', M.IDS, () => s2.box, id => { s2.box = id; draw2(); });
  [['testSup', 'sup'], ['testShift', 'shift'], ['testPred', 'pred']].forEach(([b, k]) => $(b).addEventListener('click', () => { s2.test = k; draw2(); }));
  ['A2', 'd2'].forEach(id => $(id).addEventListener('input', () => draw2()));
  // step 3
  paint3 = boxRow('boxes3', M.LTI_IDS, () => s3.box, id => { stopAnim('s3'); s3.box = id; s3.rev = M.L; draw3(); });
  $('a3').addEventListener('input', () => { stopAnim('s3'); s3.rev = M.L; draw3(); });
  $('acc3').addEventListener('click', () => {
    s3.rev = 0; draw3();
    animate('s3', (M.L + 1) * 260, p => { s3.rev = Math.min(M.L, Math.floor(p * (M.L + 1))); draw3(); });
  });
  // step 4
  ['r4', 'n04'].forEach(id => $(id).addEventListener('input', draw4));
  // step 5
  paint5 = boxRow('boxes5', M.IDS, () => s5.box, id => { s5.box = id; s5.hist.clear(); draw5(); });
  $('m5').addEventListener('input', draw5);
  $('A5').addEventListener('input', () => { s5.hist.clear(); draw5(); });

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
  window.refreshLTI = refresh;
  draw2(true);
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
