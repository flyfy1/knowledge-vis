'use strict';
// Risk & return lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, path and readout comes from window.RR_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and a few short labels placed in reserved slots; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.RR_MODEL;
const t = (...a) => window.RR_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (90 stays 90). Minus sign is U+2212.
function fmt(v, d = 2) {
  if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
  let s = v.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace(/^-/, '−');
}
const sgn = (v, d = 1) => (v > 1e-9 ? '+' : '') + fmt(v, d);
const money = (v, d = 0) => t('money', { v: fmt(v, d) });

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
// Panel title on its own row; shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// A plot panel: title row above, y tick labels left of the plot, x tick labels below it.
// o: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks, yLabel(fn), xTicks(array), xLabel(fn), yMap(fn)/yInv
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const tf = o.yMap || (v => v);
  const y = v => P.b - (tf(v) - tf(o.yMin)) / (tf(o.yMax) - tf(o.yMin)) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  (o.yTicks || []).forEach(v => {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 6, y(v) + 4);
  });
  if (o.xTicks) {
    ctx.textAlign = 'center';
    o.xTicks.forEach(v => {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15);
    });
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
// Tick values every `step` that leave at least minPx between labels.
function ticks(min, max, px, minPx, steps) {
  const step = steps.find(s => s / (max - min) * px >= minPx) || steps[steps.length - 1];
  const out = []; for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}
const dot = (ctx, X, Y, r, col, ring) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (ring) { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); } };
function vdash(ctx, X, y0, y1, col = C.text, alpha = 0.7) { ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }
function hdash(ctx, x0, x1, Y, col = C.text, alpha = 0.7) { ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }

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

/* ---------- step 0: pick, then look ---------- */
const s0 = { pick: null, rolls: [], die: M.rng(7) };
function draw0() {
  const { m, s } = M.DEFAULT, f = M.faces(m, s), amt = f.map(r => M.START * M.growth(r));
  $('pickA').setAttribute('aria-pressed', s0.pick === 'A'); $('pickB').setAttribute('aria-pressed', s0.pick === 'B');
  $('pick0').innerHTML = s0.pick ? t(s0.pick === 'A' ? 'pickedA' : 'pickedB') : '';
  const { ctx, W, H } = fitCanvas($('c0'));
  const xMin = 75, xMax = 131;
  const A = panel(ctx, W, { top: 30, bottom: H - 28, left: 30, xMin, xMax, yMin: 0, yMax: 1, xTicks: ticks(xMin, xMax, W - 42, 34, [5, 10, 20]).filter(v => v >= 80 && v <= 130), title: t('c0a') });
  const yA = A.P.t + (A.P.b - A.P.t) * 0.28, yB = A.P.t + (A.P.b - A.P.t) * 0.78, yTally = yB - 26;
  ctx.save(); ctx.strokeStyle = C.raw; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.x(100), A.P.t); ctx.lineTo(A.x(100), A.P.b); ctx.stroke(); ctx.restore();
  vdash(ctx, A.x(103), A.P.t, A.P.b);
  ctx.save(); ctx.strokeStyle = C.grid; [yA, yB].forEach(Y => { ctx.beginPath(); ctx.moveTo(A.P.l, Y); ctx.lineTo(A.P.r, Y); ctx.stroke(); });
  ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.cyan; ctx.fillText(t('rowA'), 14, yA + 4); ctx.fillStyle = C.orange; ctx.fillText(t('rowB'), 14, yB + 4); ctx.restore();
  dot(ctx, A.x(103), yA, 8, C.cyan);
  const counts = M.faceCounts(s0.rolls), last = s0.rolls.length ? s0.rolls[s0.rolls.length - 1] : -1;
  amt.forEach((v, k) => {
    const lit = last === -1 || last === k;
    ctx.save(); ctx.globalAlpha = lit ? 1 : 0.35; dot(ctx, A.x(v), yB, 7, C.orange); ctx.restore();
    if (last === k) dot(ctx, A.x(v), yB, 12, C.text, true);
    if (s0.rolls.length) {
      ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(A.x(v) - 11, yTally - 10, 22, 16);
      ctx.fillStyle = C.text; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(counts[k]), A.x(v), yTally + 2); ctx.restore();
    }
  });
  const lastTxt = s0.rolls.length ? t('s0last', { n: s0.rolls.length, r: sgn(f[last], 0), amt: money(amt[last]) }) : t('s0none');
  $('r0').textContent = t('s0readout', { a: money(103), amts: amt.map(v => money(v)).join(lang() === 'zh' ? '、' : ', '), avg: money(M.mean(amt)), loss: M.countWhere(amt, v => v < M.START), last: lastTxt });
}
const lang = () => window.RR_I18N.getLang();

/* ---------- step 1: risk is spread ---------- */
const s1 = { tried: new Set([20]) };
function draw1() {
  const s = num('s1'), m = M.DEFAULT.m, f = M.faces(m, s), mad = M.mad(f);
  $('s1v').textContent = String(s);
  const { ctx, W, H } = fitCanvas($('c1'));
  const xMin = -30, xMax = 36;
  const A = panel(ctx, W, { top: 28, bottom: 190, left: 40, xMin, xMax, yMin: 0, yMax: 7, xTicks: ticks(xMin, xMax, W - 52, 34, [5, 10, 20]), xLabel: v => fmt(v, 0), title: t('c1a') });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(A.x(0), A.P.t); ctx.lineTo(A.x(0), A.P.b); ctx.stroke(); ctx.restore();
  vdash(ctx, A.x(m), A.P.t, A.P.b);
  f.forEach((v, k) => {
    const Y = A.y(6 - k);
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(A.x(m), Y); ctx.lineTo(A.x(v), Y); ctx.stroke(); ctx.restore();
    dot(ctx, A.x(v), Y, 6.5, C.orange);
  });
  const B = panel(ctx, W, { top: 242, bottom: H - 28, left: 40, xMin: 0, xMax: 30, yMin: 0, yMax: 20, yTicks: [0, 10, 20], xTicks: ticks(0, 30, W - 52, 30, [2, 5, 10]), xLabel: v => fmt(v, 0), title: t('c1b') });
  ctx.save(); ctx.strokeStyle = C.raw; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0)); ctx.lineTo(B.x(30), B.y(18)); ctx.stroke(); ctx.restore();
  [...s1.tried].forEach(v => { if (v !== s) dot(ctx, B.x(v), B.y(M.mad(M.faces(m, v))), 4, C.text); });
  dot(ctx, B.x(s), B.y(mad), 6.5, C.pink);
  $('r1').textContent = t('s1readout', { s, lo: sgn(f[0], 0), hi: sgn(f[5], 0), avg: sgn(M.mean(f), 0), mad: fmt(mad, 1), loss: M.countWhere(f, v => v < 0) });
}

/* ---------- step 2: averages need many tries ---------- */
const s2 = { set: 0, k: 100 };
function draw2() {
  const { m, s } = M.DEFAULT, f = M.faces(m, s), seq = M.rolls(100, M.SEEDS[s2.set]), run = M.runningMean(m, s, seq), k = s2.k;
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 40, xMin: 0, xMax: 101, yMin: -20, yMax: 26, yTicks: [-20, -10, 0, 10, 20], yLabel: v => fmt(v, 0), xTicks: ticks(0, 100, W - 52, 34, [10, 20, 25, 50]), title: t('c2a') });
  hdash(ctx, A.P.l, A.P.r, A.y(m));
  ctx.save(); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.75;
  for (let i = 0; i < k; i++) { ctx.beginPath(); ctx.arc(A.x(i + 1), A.y(f[seq[i]]), 2.4, 0, 7); ctx.fill(); }
  ctx.restore();
  if (k > 0) {
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i < k; i++) { const X = A.x(i + 1), Y = A.y(Math.max(-20, Math.min(26, run[i]))); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke(); dot(ctx, A.x(k), A.y(run[k - 1]), 4.5, C.text); ctx.restore();
  }
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const cnt = M.faceCounts(seq.slice(0, k)), top = Math.max(30, Math.ceil(Math.max(...cnt) / 10) * 10);
  const B = panel(ctx, W, { top: 28, bottom: H - 28, left: 34, xMin: -0.5, xMax: 5.5, yMin: 0, yMax: top, yTicks: [0, top / 2, top], xTicks: [0, 1, 2, 3, 4, 5], xLabel: i => sgn(f[i], 0), title: t('c2b') });
  const bw = Math.min(34, (B.x(1) - B.x(0)) * 0.62);
  cnt.forEach((c, i) => { ctx.fillStyle = f[i] < 0 ? C.pink : C.orange; ctx.fillRect(B.x(i) - bw / 2, B.y(c), bw, B.y(0) - B.y(c)); });
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.6; ctx.setLineDash([5, 4]); const exp = k / 6; ctx.beginPath(); ctx.moveTo(B.P.l, B.y(exp)); ctx.lineTo(B.P.r, B.y(exp)); ctx.stroke(); ctx.restore();
  const done = seq.slice(0, k).map(i => f[i]), lossN = M.countWhere(done, v => v < 0);
  const prog = k < 100 ? t('s2progress', { k }) : '';
  $('r2').textContent = t('s2readout', { prog, set: s2.set + 1, run: k ? sgn(run[k - 1], 2) : '—', lossN, lossPct: k ? fmt(100 * lossN / k, 0) : '—', lo: k ? sgn(Math.min(...done), 0) : '—', hi: k ? sgn(Math.max(...done), 0) : '—' });
}

/* ---------- step 3: the price of risk ---------- */
function draw3() {
  const s = num('s3'), m = num('m3'), f = M.faces(m, s), n = M.willing(m, s);
  $('s3v').textContent = String(s); $('m3v').textContent = fmt(m, 1) + '%';
  let { ctx, W, H } = fitCanvas($('c3'));
  const xMin = -30, xMax = 45;
  const A = panel(ctx, W, { top: 28, bottom: 108, left: 30, xMin, xMax, yMin: 0, yMax: 3, xTicks: ticks(xMin, xMax, W - 42, 34, [5, 10, 15, 30]), xLabel: v => fmt(v, 0), title: t('c3a') });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(A.x(0), A.P.t); ctx.lineTo(A.x(0), A.P.b); ctx.stroke(); ctx.restore();
  const yA = A.y(2.2), yB = A.y(0.8);
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.cyan; ctx.fillText(t('rowA'), 14, yA + 4); ctx.fillStyle = C.orange; ctx.fillText(t('rowB'), 14, yB + 4); ctx.restore();
  vdash(ctx, A.x(M.SAFE), A.P.t, A.P.b, C.cyan, 0.6); vdash(ctx, A.x(m), A.P.t, A.P.b, C.orange, 0.8);
  dot(ctx, A.x(M.SAFE), yA, 7, C.cyan);
  f.forEach(v => dot(ctx, A.x(v), yB, 6, C.orange));
  // buyer grid: 10 × 10, most relaxed buyer first
  const gTop = 140, gBot = H - 10, side = Math.min((W - 40) / 10, (gBot - gTop) / 10), x0 = (W - side * 10) / 2;
  M.BUYERS.forEach((c, i) => {
    const r = Math.floor(i / 10), q = i % 10, yes = m - M.SAFE >= c * s - 1e-9;
    ctx.fillStyle = yes ? C.green : C.raw; ctx.globalAlpha = yes ? 0.95 : 0.55;
    ctx.fillRect(x0 + q * side + 2, gTop + r * side + 2, side - 4, side - 4);
  });
  ctx.globalAlpha = 1;
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 28, bottom: H - 28, left: 34, xMin: 0, xMax: 30, yMin: 0, yMax: 15, yTicks: [0, 5, 10, 15], xTicks: ticks(0, 30, W - 46, 30, [5, 10, 15]), title: t('c3b') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.07)'; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0)); ctx.lineTo(B.x(30), B.y(M.premiumFor(50, 30))); ctx.lineTo(B.x(30), B.y(15)); ctx.lineTo(B.x(0), B.y(15)); ctx.closePath(); ctx.fill(); ctx.restore();
  [[50, 'c3bHalf', C.green, 0.65], [90, 'c3bMost', C.green, 1]].forEach(([k, key, col, a]) => {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0)); ctx.lineTo(B.x(30), B.y(M.premiumFor(k, 30))); ctx.stroke();
    // label sits above the line's right end; the line only drops further to the left, so it never touches the text
    ctx.font = '11px system-ui,sans-serif'; const lab = t(key), w = ctx.measureText(lab).width;
    ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(lab, B.P.r - w - 4, B.y(M.premiumFor(k, 30)) - 7); ctx.restore();
  });
  dot(ctx, B.x(s), B.y(Math.min(15, m - M.SAFE)), 6.5, C.text);
  $('r3').textContent = t('s3readout', { s, m: fmt(m, 1), p: fmt(m - M.SAFE, 1), n, half: fmt(M.premiumFor(50, s), 1), most: fmt(M.premiumFor(90, s), 1), behind: M.countWhere(f, v => v < M.SAFE) });
}

/* ---------- step 4: a promise is not a payout ---------- */
const P4 = { m: M.DEFAULT.mPremium, s: M.DEFAULT.s, Tmax: 20, n: 200 };
const s4 = { set: 0, paths: null, stats: [] };
function buildPaths() { s4.paths = M.paths(P4.m, P4.s, P4.Tmax, P4.n, 1000 + M.SEEDS[s4.set]); }
function draw4() {
  const T = num('t4'); $('t4v').textContent = String(T);
  if (!s4.paths) buildPaths();
  if (!s4.stats.length) for (let y = 1; y <= P4.Tmax; y++) s4.stats[y] = M.endStats(P4.m, P4.s, y);
  const st = s4.stats[T];
  let { ctx, W, H } = fitCanvas($('c4'));
  const lo = 25, hi = 1600;
  const A = panel(ctx, W, { top: 28, bottom: H - 28, left: 44, xMin: 0, xMax: P4.Tmax, yMin: lo, yMax: hi, yMap: Math.log2, yTicks: [25, 50, 100, 200, 400, 800, 1600], yLabel: v => fmt(v, 0), xTicks: ticks(0, P4.Tmax, W - 56, 28, [1, 2, 5, 10]), title: t('c4a') });
  const clampY = v => A.y(Math.max(lo, Math.min(hi, v)));
  ctx.save(); ctx.lineWidth = 1; ctx.globalAlpha = 0.28;
  const safeEnd = st.safe;
  s4.paths.forEach(row => { ctx.strokeStyle = row[T] < safeEnd - 1e-9 ? C.pink : C.orange; ctx.beginPath(); for (let y = 0; y <= T; y++) { if (!y) ctx.moveTo(A.x(y), clampY(row[y])); else ctx.lineTo(A.x(y), clampY(row[y])); } ctx.stroke(); });
  ctx.restore();
  const curve = (g, col, lw) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let y = 0; y <= T; y++) { const Y = clampY(M.START * Math.pow(g, y)); if (!y) ctx.moveTo(A.x(y), Y); else ctx.lineTo(A.x(y), Y); } ctx.stroke(); ctx.restore(); };
  curve(M.growth(P4.m), C.text, 2.2); curve(M.growth(M.SAFE), C.cyan, 2.6);
  vdash(ctx, A.x(T), A.P.t, A.P.b, C.text, 0.4);
  const simBehind = s4.paths.filter(row => row[T] < safeEnd - 1e-9).length;
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const B = panel(ctx, W, { top: 28, bottom: H - 28, left: 34, xMin: 0, xMax: P4.Tmax, yMin: 0, yMax: 40, yTicks: [0, 10, 20, 30, 40], xTicks: ticks(0, P4.Tmax, W - 46, 28, [2, 5, 10]), title: t('c4b') });
  [['pBelowSafe', C.pink], ['pLoss', C.green]].forEach(([key, col]) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let y = 1; y <= P4.Tmax; y++) { const Y = B.y(100 * s4.stats[y][key]); if (y === 1) ctx.moveTo(B.x(y), Y); else ctx.lineTo(B.x(y), Y); }
    ctx.stroke(); dot(ctx, B.x(T), B.y(100 * st[key]), 5.5, col); ctx.restore();
  });
  vdash(ctx, B.x(T), B.P.t, B.P.b, C.text, 0.4);
  $('r4').textContent = t('s4readout', { T, safe: money(st.safe), promised: money(st.promised), median: money(st.median), behind: fmt(100 * st.pBelowSafe, 1), loss: fmt(100 * st.pLoss, 1), simBehind });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  $('pickA').addEventListener('click', () => { s0.pick = 'A'; draw0(); });
  $('pickB').addEventListener('click', () => { s0.pick = 'B'; draw0(); });
  $('roll0').addEventListener('click', () => { s0.rolls.push(Math.min(5, Math.floor(s0.die() * 6))); draw0(); });
  $('s1').addEventListener('input', () => { s1.tried.add(num('s1')); draw1(); });
  $('play2').addEventListener('click', () => { s2.k = 0; draw2(); animate('s2', 6000, p => { s2.k = Math.round(p * 100); draw2(); }); });
  $('seed2').addEventListener('click', () => { stopAnim('s2'); s2.set = (s2.set + 1) % M.SEEDS.length; s2.k = 100; draw2(); });
  ['s3', 'm3'].forEach(id => $(id).addEventListener('input', draw3));
  $('t4').addEventListener('input', draw4);
  $('seed4').addEventListener('click', () => { s4.set = (s4.set + 1) % M.SEEDS.length; buildPaths(); draw4(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
