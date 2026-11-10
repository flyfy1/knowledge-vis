'use strict';
// Acid–base equilibrium lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, count and readout comes from window.ACID_MODEL (model.js). Canvas text is limited to panel
// titles and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.ACID_MODEL;
const t = (...a) => window.ACID_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', cell: '#16222f' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(ch => SUP[ch]).join('');
// 1.8×10⁻⁵ style; plain decimals between 0.01 and 100.
function sci(v, sig = 2) {
  if (v >= 0.01 && v < 100) return String(Number(v.toPrecision(sig)));
  let e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e);
  let ms = m.toPrecision(sig); if (Number(ms) >= 10) { e += 1; ms = (m / 10).toPrecision(sig); }
  return `${ms}×10${sup(e)}`;
}
const pct = a => (a * 100).toPrecision(3) + '%';
const pow10Label = e => (e === 0 ? '1' : '10' + sup(e));

function fitCanvas(canvas, H) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = H || Number(canvas.getAttribute('height')) || 300;
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}

// Panel title: shrinks the font until it fits (never overflows, never squeezes glyphs).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

// Plot panel inside rect {l, r, t, b}. Title sits in its own row above; ticks left of / below the plot.
function panel(ctx, R, o) {
  const x = v => R.l + (v - o.xMin) / (o.xMax - o.xMin) * (R.r - R.l);
  const y = v => R.b - (v - o.yMin) / (o.yMax - o.yMin) * (R.b - R.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(R.l, y(v)); ctx.lineTo(R.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), R.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  for (const v of o.xTicks || []) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), R.b); ctx.lineTo(x(v), R.b + 4); ctx.stroke();
    ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), R.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, o.titleX != null ? o.titleX : 8, R.t - 9, o.titleW || (R.r - (o.titleX != null ? o.titleX : 8)));
  return { x, y, R };
}
function line(ctx, pts, color, { lw = 2, dash = null, alpha = 1 } = {}) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function clipTo(ctx, R) { ctx.save(); ctx.beginPath(); ctx.rect(R.l, R.t - 1, R.r - R.l, R.b - R.t + 2); ctx.clip(); }
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
function niceCeil(v) { const p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1e-9)))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return 10 * p; }

/* ---------- molecule ledger (steps 0 and 3) ---------- */
const DT = 1 / 30, COLS = 20, ROWS = 10, WINDOW = 20, RATE_TICKS = 60;
function makeRun(opts) {
  const sim = M.makeSim(opts);
  return { sim, opts, hist: [], ticks: [], flash: new Float64Array(sim.N), flashDir: new Int8Array(sim.N), running: true, acc: 0 };
}
function tickRun(run, animateFlash) {
  const e = M.stepSim(run.sim, DT);
  run.ticks.push([e.fwd, e.rev]); if (run.ticks.length > RATE_TICKS) run.ticks.shift();
  const win = run.ticks.length * DT, fwd = run.ticks.reduce((s, q) => s + q[0], 0) / win, rev = run.ticks.reduce((s, q) => s + q[1], 0) / win;
  run.hist.push({ t: run.sim.t, n: M.nSplit(run.sim), fwd, rev });
  if (run.hist.length > (WINDOW + 2) / DT) run.hist.shift();
  if (animateFlash) { const now = performance.now(); e.idx.forEach(([i, d]) => { run.flash[i] = now; run.flashDir[i] = d; }); }
}
function advanceRun(run, seconds) { const n = Math.round(seconds / DT); for (let i = 0; i < n; i++) tickRun(run, false); }

// Layout: wide → grid on the left, two charts on the right; narrow → stacked.
function simLayout(W, strip) {
  const wide = W >= 620;
  if (wide) {
    const gw = Math.min(0.42 * W, 420), cell = Math.min((gw - 16) / COLS, 18), gridH = cell * ROWS;
    const stripH = strip ? stripHeight(cell * COLS, strip) : 0;
    const H = Math.max(330, 30 + gridH + (strip ? 18 + stripH : 0) + 16);
    const left = gw + 52, mid = Math.round(H / 2);
    return { H, wide, grid: { x: 10, y: 30, cell }, strip: strip ? { x: 10, y: 30 + gridH + 18, w: cell * COLS, h: stripH } : null,
      p1: { l: left, r: W - 14, t: 30, b: mid - 30 }, p2: { l: left, r: W - 14, t: mid + 24, b: H - 26 }, titleX: gw + 14 };
  }
  const cell = Math.min((W - 20) / COLS, 18), gridH = cell * ROWS, stripH = strip ? stripHeight(cell * COLS, strip) : 0;
  let y = 30 + gridH; const st = strip ? { x: 10, y: y + 18, w: cell * COLS, h: stripH } : null; if (strip) y += 18 + stripH;
  const p1 = { l: 44, r: W - 12, t: y + 36, b: y + 36 + 96 }, p2 = { l: 44, r: W - 12, t: p1.b + 52, b: p1.b + 52 + 96 };
  return { H: p2.b + 26, wide, grid: { x: 10, y: 30, cell }, strip: st, p1, p2, titleX: 8 };
}
const STRIP_GAP = 6;
function stripHeight(w, maxDots) { const cols = Math.max(1, Math.floor(w / STRIP_GAP)); return Math.ceil(maxDots / cols) * STRIP_GAP; }

function drawGrid(ctx, run, G, now) {
  const { cell } = G, s = run.sim, rm = reduceMotion();
  for (let i = 0; i < s.N; i++) {
    const cx = G.x + (i % COLS + 0.5) * cell, cy = G.y + (Math.floor(i / COLS) + 0.5) * cell;
    ctx.fillStyle = C.cell; ctx.fillRect(cx - cell / 2 + 0.5, cy - cell / 2 + 0.5, cell - 1, cell - 1);
    if (!s.split[i]) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(cx, cy, cell * 0.3, 0, 7); ctx.fill(); }
    else {
      ctx.strokeStyle = C.green; ctx.lineWidth = Math.max(1.2, cell * 0.11); ctx.beginPath(); ctx.arc(cx - cell * 0.08, cy + cell * 0.06, cell * 0.24, 0, 7); ctx.stroke();
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(cx + cell * 0.27, cy - cell * 0.27, cell * 0.13, 0, 7); ctx.fill();
    }
    const age = (now - run.flash[i]) / 450;
    if (!rm && age >= 0 && age < 1) {
      ctx.save(); ctx.globalAlpha = 1 - age; ctx.strokeStyle = run.flashDir[i] > 0 ? C.orange : C.cyan; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, cell * (0.42 + 0.12 * age), 0, 7); ctx.stroke(); ctx.restore();
    }
  }
}
function drawStrip(ctx, S, n) {
  const cols = Math.max(1, Math.floor(S.w / STRIP_GAP));
  ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(S.x + 0.5, S.y - 4.5, S.w - 1, S.h + 8);
  ctx.fillStyle = C.green;
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(S.x + (i % cols + 0.5) * STRIP_GAP, S.y + (Math.floor(i / cols) + 0.5) * STRIP_GAP, 1.9, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawHistory(ctx, run, L, eqAlpha) {
  const h = run.hist, tNow = h.length ? h[h.length - 1].t : 0, xMin = Math.max(0, tNow - WINDOW), xMax = xMin + WINDOW;
  const step = (L.p1.r - L.p1.l) < 260 ? 10 : 5, xt = []; for (let v = Math.ceil(xMin / step) * step; v <= xMax + 1e-9; v += step) xt.push(v);
  const xf = v => fmt(v, 0);
  const A = panel(ctx, L.p1, { xMin, xMax, yMin: 0, yMax: 100, yTicks: [0, 50, 100], xTicks: xt, xFmt: xf, title: t(run.titleA), titleX: L.titleX });
  line(ctx, [[A.x(xMin), A.y(eqAlpha * 100)], [A.x(xMax), A.y(eqAlpha * 100)]], C.text, { lw: 1.3, dash: [5, 4], alpha: 0.85 });
  const hv = h.filter(q => q.t >= xMin - DT);
  clipTo(ctx, A.R); line(ctx, hv.map(q => [A.x(q.t), A.y(q.n / run.sim.N * 100)]), C.green, { lw: 2.2 }); ctx.restore();
  const peak = niceCeil(Math.max(10, ...hv.map(q => Math.max(q.fwd, q.rev))));
  const B = panel(ctx, L.p2, { xMin, xMax, yMin: 0, yMax: peak, yTicks: [0, peak / 2, peak], xTicks: xt, xFmt: xf, title: t(run.titleB), titleX: L.titleX });
  const hr = hv.filter((q, i) => i % 2 === 0 || i === hv.length - 1);
  clipTo(ctx, B.R);
  line(ctx, hr.map(q => [B.x(q.t), B.y(q.fwd)]), C.orange, { lw: 2 });
  line(ctx, hr.map(q => [B.x(q.t), B.y(q.rev)]), C.cyan, { lw: 2 });
  ctx.restore();
}
function lastRates(run) { const q = run.hist[run.hist.length - 1]; return q ? q : { t: 0, n: M.nSplit(run.sim), fwd: 0, rev: 0 }; }
function avgShare(run, seconds) {
  const h = run.hist, k = Math.min(h.length, Math.round(seconds / DT)); if (!k) return M.nSplit(run.sim) / run.sim.N;
  let s = 0; for (let i = h.length - k; i < h.length; i++) s += h[i].n; return s / k / run.sim.N;
}

/* ---------- step 0 ---------- */
const TOY = { ka: 0.01, c: 0.1, kf: 0.15 };
let run0 = null;
function restart0(start) {
  run0 = makeRun({ N: 200, c: TOY.c, ka: TOY.ka, kf: TOY.kf, start, seed: start === 'split' ? 7 : 3 });
  run0.titleA = 'c0alpha'; run0.titleB = 'c0rate';
  if (reduceMotion()) { advanceRun(run0, 20); run0.running = false; }
  draw0(); pauseLabels();
}
function draw0() {
  const cv = $('c0'), W = Math.max(240, cv.clientWidth || 600), L = simLayout(W, 0);
  const { ctx } = fitCanvas(cv, L.H);
  title(ctx, t('c0grid'), 10, 18, (L.wide ? L.grid.cell * COLS : W - 20));
  drawGrid(ctx, run0, L.grid, performance.now());
  const eq = M.equilibrium(TOY.ka, TOY.c).alpha;
  drawHistory(ctx, run0, L, eq);
  const q = lastRates(run0), n = M.nSplit(run0.sim);
  $('r0').textContent = t('s0readout', { t: fmt(run0.sim.t, 1), n, N: run0.sim.N, alpha: pct(n / run0.sim.N), fwd: q.fwd.toFixed(1), rev: q.rev.toFixed(1), eq: pct(eq), avg: pct(avgShare(run0, 5)) });
}

/* ---------- step 1: Ka sweep at c = 0.10 ---------- */
const C1 = 0.1, ACID_KEYS = ['hclo2', 'hf', 'acetic', 'hclo', 'hcn'];
let ka1Exact = M.ACIDS.acetic.ka; // exact Ka of a pressed acid button (the slider snaps to 0.05 in lg Ka)
function draw1() {
  const lk = ka1Exact != null ? Math.log10(ka1Exact) : num('ka1'), ka = Math.pow(10, lk), pka = -lk, e = M.equilibrium(ka, C1);
  $('ka1v').textContent = `${sci(ka)} · pKa ${fmt(pka, 2)}`;
  let sel = null;
  document.querySelectorAll('#acidBtns [data-acid]').forEach(b => { const on = Math.abs(-Math.log10(M.ACIDS[b.dataset.acid].ka) - pka) < 0.026; if (on) sel = b.dataset.acid; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  const cv = $('c1'), { ctx, W, H } = fitCanvas(cv);
  const mid = Math.round(H / 2);
  const xt = W < 420 ? [0, 2, 4, 6, 8, 10] : [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // α on a log axis (0.001 % … 100 %): beyond pKa ≈ 3 the curve becomes a straight line of slope −1/2.
  const yt = [-3, -2, -1, 0, 1, 2];
  const A = panel(ctx, { l: 52, r: W - 14, t: 28, b: mid - 30 }, { xMin: -1, xMax: 10, yMin: -3, yMax: 2, yTicks: yt, yFmt: v => (v >= 0 ? fmt(Math.pow(10, v), 0) : Math.pow(10, v).toFixed(-v)) + '%', xTicks: xt, xFmt: v => fmt(v, 0), title: t('c1alpha') });
  const B = panel(ctx, { l: 52, r: W - 14, t: mid + 24, b: H - 26 }, { xMin: -1, xMax: 10, yMin: 0, yMax: 6, yTicks: [0, 2, 4, 6], xTicks: xt, xFmt: v => fmt(v, 0), title: t('c1ph') });
  ACID_KEYS.forEach(k => { const X = A.x(-Math.log10(M.ACIDS[k].ka)); [A, B].forEach(P => line(ctx, [[X, P.R.t], [X, P.R.b]], k === sel ? C.orange : C.ghost, { lw: k === sel ? 1.6 : 1.2, alpha: k === sel ? 0.8 : 0.55 })); });
  const ptsA = [], ptsB = [], la = a => Math.log10(a * 100);
  for (let p = -1; p <= 10.0001; p += 0.05) { const q = M.equilibrium(Math.pow(10, -p), C1); ptsA.push([A.x(p), A.y(la(q.alpha))]); ptsB.push([B.x(p), B.y(q.pH)]); }
  line(ctx, [[B.x(-1), B.y(M.pHStrong(C1))], [B.x(10), B.y(M.pHStrong(C1))]], C.ghost, { lw: 1.5, dash: [6, 4] });
  line(ctx, [[A.x(-1), A.y(2)], [A.x(10), A.y(2)]], C.ghost, { lw: 1.5, dash: [6, 4] });
  line(ctx, ptsA, C.green, { lw: 2.4 }); line(ctx, ptsB, C.green, { lw: 2.4 });
  line(ctx, [[A.x(pka), A.R.t], [B.x(pka), B.R.b]], C.orange, { lw: 1.2, dash: [4, 4], alpha: 0.6 });
  dot(ctx, A.x(pka), A.y(la(e.alpha)), 6, C.orange); dot(ctx, B.x(pka), B.y(e.pH), 6, C.orange);
  $('r1').textContent = t('s1readout', { ka: sci(ka), pka: fmt(pka, 2), x: sci(e.x), alpha: pct(e.alpha), per: e.alpha * 1000 >= 10 ? Math.round(e.alpha * 1000) : fmt(e.alpha * 1000, 2), ph: e.pH.toFixed(2), phs: M.pHStrong(C1).toFixed(2), dph: (e.pH - M.pHStrong(C1)).toFixed(2) });
}

/* ---------- step 2: dilution ---------- */
let acid2 = 'acetic';
const acidName = k => t({ acetic: 'acidAcetic', hf: 'acidHF' }[k]);
function draw2() {
  const lc = num('lc2'), c = Math.pow(10, lc), ka = M.ACIDS[acid2].ka, e = M.equilibrium(ka, c), ap = M.alphaApprox(ka, c), e10 = M.equilibrium(ka, c / 10);
  $('c2v').textContent = sci(c) + ' mol/L';
  $('acid2acetic').setAttribute('aria-pressed', acid2 === 'acetic' ? 'true' : 'false'); $('acid2hf').setAttribute('aria-pressed', acid2 === 'hf' ? 'true' : 'false');
  const cv = $('c2'), { ctx, W, H } = fitCanvas(cv), mid = Math.round(H / 2);
  const xt = [0, -1, -2, -3, -4, -5], xf = v => pow10Label(Math.round(v));
  const A = panel(ctx, { l: 44, r: W - 18, t: 28, b: mid - 30 }, { xMin: 0, xMax: -5, yMin: 0, yMax: 100, yTicks: [0, 50, 100], xTicks: xt, xFmt: xf, title: t('c2alpha') + ' · ' + t('c2x') });
  const B = panel(ctx, { l: 44, r: W - 18, t: mid + 24, b: H - 26 }, { xMin: 0, xMax: -5, yMin: 0, yMax: 6, yTicks: [0, 2, 4, 6], xTicks: xt, xFmt: xf, title: t('c2ph') + ' · ' + t('c2x') });
  const ex = [], apx = [], ph = [], st = [];
  for (let l = 0; l >= -5.0001; l -= 0.025) {
    const cc = Math.pow(10, l), q = M.equilibrium(ka, cc);
    ex.push([A.x(l), A.y(q.alpha * 100)]); apx.push([A.x(l), A.y(Math.min(1.2, M.alphaApprox(ka, cc)) * 100)]);
    ph.push([B.x(l), B.y(q.pH)]); st.push([B.x(l), B.y(M.pHStrong(cc))]);
  }
  clipTo(ctx, A.R); line(ctx, apx, C.text, { lw: 1.4, dash: [5, 4], alpha: 0.85 }); ctx.restore();
  line(ctx, ex, C.green, { lw: 2.4 }); line(ctx, st, C.ghost, { lw: 1.5, dash: [6, 4] }); line(ctx, ph, C.green, { lw: 2.4 });
  line(ctx, [[A.x(lc), A.R.t], [B.x(lc), B.R.b]], C.orange, { lw: 1.2, dash: [4, 4], alpha: 0.6 });
  dot(ctx, A.x(lc), A.y(e.alpha * 100), 6, C.orange); dot(ctx, B.x(lc), B.y(e.pH), 6, C.orange);
  const err = (ap - e.alpha) / e.alpha;
  $('r2').textContent = t('s2readout', { acid: acidName(acid2), c: sci(c), alpha: pct(e.alpha), approx: pct(ap), err: (err >= 0 ? '+' : '') + (err * 100).toFixed(1) + '%', ph: e.pH.toFixed(2), phs: M.pHStrong(c).toFixed(2), alpha10: pct(e10.alpha), dph10: (e10.pH - e.pH).toFixed(2) });
}
function quizNumbers() {
  const ka = M.ACIDS.acetic.ka, e1 = M.equilibrium(ka, 0.1), e2 = M.equilibrium(ka, 0.001);
  return { ph1: e1.pH.toFixed(2), ph2: e2.pH.toFixed(2), d: (e2.pH - e1.pH).toFixed(2), a1: pct(e1.alpha), a2: pct(e2.alpha) };
}
function quizFeedback() {
  const fb = $('quizFeedback'), st = fb.dataset.state; if (!st) return;
  fb.textContent = st === 'none' ? t('quizNone') : t(st === 'correct' ? 'quizRight' : 'quizWrong', quizNumbers());
  fb.style.color = st === 'correct' ? C.green : C.orange;
}

/* ---------- step 3: common ion ---------- */
let run3 = null, s3 = { s: 0, q: null };
function extraCount(s) { return Math.round(s / TOY.c * 200); }
function init3() {
  run3 = makeRun({ N: 200, c: TOY.c, ka: TOY.ka, kf: TOY.kf, start: 'intact', seed: 21 });
  run3.titleA = 'c0alpha'; run3.titleB = 'c0rate';
  advanceRun(run3, 25);
  run3.running = !reduceMotion();
}
function setS3(s) {
  if (Math.abs(s - s3.s) < 1e-12) return;
  s3.q = M.qAfterChange(TOY.ka, TOY.c, s3.s, s) / TOY.ka; s3.s = s;
  run3.sim.extra = extraCount(s);
  if (reduceMotion()) advanceRun(run3, 15);
  draw3();
}
function draw3() {
  $('s3v').textContent = fmt(s3.s, 3) + ' mol/L';
  const cv = $('c3'), W = Math.max(240, cv.clientWidth || 600), L = simLayout(W, extraCount(0.2));
  const { ctx } = fitCanvas(cv, L.H);
  title(ctx, t('c3grid'), 10, 18, (L.wide ? L.grid.cell * COLS : W - 20));
  drawGrid(ctx, run3, L.grid, performance.now());
  drawStrip(ctx, L.strip, run3.sim.extra);
  const e = M.equilibrium(TOY.ka, TOY.c, s3.s), e0 = M.equilibrium(TOY.ka, TOY.c, 0);
  drawHistory(ctx, run3, L, e.alpha);
  const q = lastRates(run3), n = M.nSplit(run3.sim);
  const qk = s3.q == null ? t('qkNone') : t(s3.q > 1 ? 'qkUp' : 'qkDown', { q: s3.q.toFixed(2) });
  $('r3').textContent = t('s3readout', { s: fmt(s3.s, 3), n, N: run3.sim.N, alpha: pct(n / run3.sim.N), fwd: q.fwd.toFixed(1), rev: q.rev.toFixed(1), eq: pct(e.alpha), eq0: pct(e0.alpha), ph: e.pH.toFixed(2), ph0: e0.pH.toFixed(2), qk });
  const ka = M.ACIDS.acetic.ka, a0 = M.equilibrium(ka, 0.1, 0), a1 = M.equilibrium(ka, 0.1, 0.1);
  $('r3b').innerHTML = t('s3acetic', { ph0: a0.pH.toFixed(2), a0: pct(a0.alpha), ph1: a1.pH.toFixed(2), a1: pct(a1.alpha), link: `<a class="xlink" href="../../../chemistry/solutions/buffer-capacity/#step1">${t('bufLink')}</a>` });
}

/* ---------- step 4: end point vs speed ---------- */
const SPEEDS = [0.5, 1, 2, 4, 8], KAS = [0.0025, 0.005, 0.01, 0.02, 0.04], T4 = 15, N4 = 400;
let race = null;
function restart4() {
  const sp = SPEEDS[num('sp4')], kb = KAS[num('kb4')];
  const mk = (ka, kf, seed) => ({ sim: M.makeSim({ N: N4, c: TOY.c, ka, kf, seed }), hist: [{ t: 0, n: 0 }] });
  race = { A: mk(TOY.ka, TOY.kf, 31), B: mk(kb, TOY.kf * sp, 32), sp, kb, done: false };
  if (reduceMotion()) { while (!race.done) tick4(); }
  draw4();
}
function tick4() {
  for (const g of [race.A, race.B]) { M.stepSim(g.sim, DT); g.hist.push({ t: g.sim.t, n: M.nSplit(g.sim) }); }
  if (race.A.sim.t >= T4 - 1e-9) race.done = true;
}
function draw4() {
  const sp = race.sp, kb = race.kb;
  $('sp4v').textContent = '×' + fmt(sp, 1); $('kb4v').textContent = sci(kb);
  const cv = $('c4'), { ctx, W, H } = fitCanvas(cv);
  const xt = W < 420 ? [0, 5, 10, 15] : [0, 3, 6, 9, 12, 15];
  const P = panel(ctx, { l: 44, r: W - 14, t: 28, b: H - 26 }, { xMin: 0, xMax: T4, yMin: 0, yMax: 60, yTicks: [0, 20, 40, 60], xTicks: xt, xFmt: v => fmt(v, 0), title: t('c4') });
  const eA = M.equilibrium(TOY.ka, TOY.c).alpha, eB = M.equilibrium(kb, TOY.c).alpha;
  line(ctx, [[P.x(0), P.y(eA * 100)], [P.x(T4), P.y(eA * 100)]], C.cyan, { lw: 1.4, dash: [6, 5], alpha: 0.9 });
  line(ctx, [[P.x(0), P.y(eB * 100)], [P.x(T4), P.y(eB * 100)]], C.orange, { lw: 1.4, dash: [2, 5], alpha: 0.9 });
  line(ctx, race.A.hist.map(q => [P.x(q.t), P.y(q.n / N4 * 100)]), C.cyan, { lw: 2.1 });
  line(ctx, race.B.hist.map(q => [P.x(q.t), P.y(q.n / N4 * 100)]), C.orange, { lw: 2.1 });
  const tA = M.relaxTime(TOY.ka, TOY.c, TOY.kf).t, tB = M.relaxTime(kb, TOY.c, TOY.kf * sp).t;
  const sameKa = kb === TOY.ka, sameSp = sp === 1;
  const verdict = t(sameKa && sameSp ? 'vSame' : sameKa ? 'vSpeed' : sameSp ? 'vKa' : 'vBoth');
  $('r4').textContent = t('s4readout', { kaA: sci(TOY.ka), aA: pct(eA), tA: fmt(tA, 1), kaB: sci(kb), sp: fmt(sp, 1), aB: pct(eB), tB: fmt(tB, 1), verdict });
  $('r4p').textContent = t('s4progress', { t: fmt(Math.min(T4, race.A.sim.t), 1), T: T4 });
}

/* ---------- shared loop: runs only visible, unpaused simulations; stops when the page is hidden ---------- */
const visible = new Set();
let raf = null, last = 0;
function loop(now) {
  raf = null;
  if (document.hidden || reduceMotion()) return;
  const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
  let busy = false;
  if (visible.has('step0') && run0.running) { run0.acc += dt; while (run0.acc >= DT) { tickRun(run0, true); run0.acc -= DT; } draw0(); busy = true; }
  if (visible.has('step3') && run3.running) { run3.acc += dt; while (run3.acc >= DT) { tickRun(run3, true); run3.acc -= DT; } draw3(); busy = true; }
  if (visible.has('step4') && race && !race.done) { race.acc = (race.acc || 0) + dt; while (race.acc >= DT && !race.done) { tick4(); race.acc -= DT; } draw4(); busy = true; }
  if (busy) raf = requestAnimationFrame(loop); else last = 0;
}
function kick() { if (!raf && !document.hidden && !reduceMotion()) { last = 0; raf = requestAnimationFrame(loop); } }

function pauseLabels() {
  const rm = reduceMotion();
  $('pause0').textContent = rm ? t('advance') : t(run0.running ? 'pause' : 'resume');
  $('pause3').textContent = rm ? t('advance') : t(run3.running ? 'pause' : 'resume');
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); pauseLabels(); quizFeedback(); }

function setup() {
  init3();
  restart0('intact');
  $('intact0').addEventListener('click', () => { restart0('intact'); kick(); });
  $('split0').addEventListener('click', () => { restart0('split'); kick(); });
  $('pause0').addEventListener('click', () => {
    if (reduceMotion()) advanceRun(run0, 5); else run0.running = !run0.running;
    pauseLabels(); draw0(); kick();
  });

  $('ka1').addEventListener('input', () => { ka1Exact = null; draw1(); });
  document.querySelectorAll('#acidBtns [data-acid]').forEach(b => b.addEventListener('click', () => { ka1Exact = M.ACIDS[b.dataset.acid].ka; $('ka1').value = Math.log10(ka1Exact).toFixed(2); draw1(); }));

  $('lc2').addEventListener('input', draw2);
  $('acid2acetic').addEventListener('click', () => { acid2 = 'acetic'; draw2(); });
  $('acid2hf').addEventListener('click', () => { acid2 = 'hf'; draw2(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    $('quizFeedback').dataset.state = !choice ? 'none' : choice.value === 'b' ? 'correct' : 'wrong';
    quizFeedback();
  });

  $('s3').addEventListener('input', () => { setS3(num('s3')); kick(); });
  $('reset3').addEventListener('click', () => { $('s3').value = 0; setS3(0); kick(); });
  $('pause3').addEventListener('click', () => {
    if (reduceMotion()) advanceRun(run3, 5); else run3.running = !run3.running;
    pauseLabels(); draw3(); kick();
  });

  ['sp4', 'kb4'].forEach(id => $(id).addEventListener('input', () => { restart4(); kick(); }));
  $('rerun4').addEventListener('click', () => { restart4(); kick(); });
  restart4();

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const nav = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => nav.observe(s));
    const vis = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); }); kick(); }, { threshold: 0.05 });
    steps.forEach(s => vis.observe(s));
  } else { ['step0', 'step3', 'step4'].forEach(id => visible.add(id)); }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; } else kick(); });
  window.refreshAcidBase = refresh;
  refresh(); kick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
