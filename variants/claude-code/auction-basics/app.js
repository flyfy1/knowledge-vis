'use strict';
// Auctions lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.AUCTION_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrunk to fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.AUCTION_MODEL;
const t = (...a) => window.AUCTION_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros after the decimal point only; show −0 as 0.
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/\.?0+$/, '') : s; };
const pct = v => (v * 100).toFixed(1) + '%';

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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel: title row above, y ticks left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const yf = o.yFmt || (v => fmt(v, 2));
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yf(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks !== false) {
    const step = o.xStep || niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      const lab = fmt(v, 2), hw = ctx.measureText(lab).width / 2; // keep edge labels inside the canvas
      ctx.fillText(lab, Math.max(hw + 2, Math.min(W - hw - 2, x(v))), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function vline(ctx, m, X, color, dash = [5, 4], lw = 1.5) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(m.x(X), m.P.t); ctx.lineTo(m.x(X), m.P.b); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, Y, color, dash = [5, 4], lw = 1.5) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(m.P.l, m.y(Y)); ctx.lineTo(m.P.r, m.y(Y)); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, fill, stroke = C.bg) { ctx.save(); ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function ring(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = C.bg; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function curve(ctx, m, f, x0, x1, color, lw = 2.2, dash = null, n = 240) {
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

/* ---------- step 0: first price, rival bid known ---------- */
function draw0() {
  const v = num('v0'), r = num('r0'), b = num('b0');
  $('v0v').textContent = v; $('r0v').textContent = r; $('b0v').textContent = b;
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 100, yMin: -100, yMax: 100, yTicks: [-100, -50, 0, 50, 100], title: t('c0') });
  if (r < v) { ctx.fillStyle = 'rgba(126,226,168,0.12)'; ctx.fillRect(m.x(r), m.P.t, m.x(v) - m.x(r), m.P.b - m.P.t); }
  vline(ctx, m, r, C.orange); vline(ctx, m, v, C.green);
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(m.x(0), m.y(0)); ctx.lineTo(m.x(r), m.y(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m.x(r), m.y(v - r)); ctx.lineTo(m.x(100), m.y(v - 100)); ctx.stroke(); ctx.restore();
  dot(ctx, m.x(r), m.y(0), 4, C.cyan); ring(ctx, m.x(r), m.y(v - r), 4.5, C.cyan); // tie goes to the rival
  dot(ctx, m.x(b), m.y(M.fpPayoff(v, b, r)), 6.5, C.text);
  const pay = M.fpPayoff(v, b, r);
  const now = b > r ? t(pay >= 0 ? 's0win' : 's0winLoss', { b, r, v, u: fmt(Math.abs(pay)) }) : t('s0lose', { b, r });
  const best = r < v ? t('s0best', { r, g: fmt(v - r) }) : t('s0bestNone', { r, v });
  $('out0').textContent = now + ' ' + best;
}

/* ---------- step 1: first price, rival bid unknown ---------- */
const s1 = { tried: new Map() };
function draw1() {
  const v = num('v1'), b = num('b1');
  $('v1v').textContent = v; $('b1v').textContent = b;
  const sim = M.fpSimulated(v, b); s1.tried.set(b, sim.mean);
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: 120, xMin: 0, xMax: 100, yMin: 0, yMax: 1, yTicks: [], title: t('c1a') });
  ctx.save();
  M.RIVALS.forEach((r, i) => { const jy = ((i * 0.6180339887) % 1); ctx.fillStyle = r < b ? 'rgba(255,180,84,0.75)' : 'rgba(85,101,122,0.75)'; ctx.fillRect(A.x(r) - 1, A.y(0.06 + 0.88 * jy) - 1, 2, 2); });
  ctx.restore();
  vline(ctx, A, b, C.text, [], 1.6);
  const yMax = 26, yMin = -12;
  const B = panel(ctx, W, { top: 164, bottom: H - 26, xMin: 0, xMax: 100, yMin, yMax, yTicks: [-10, 0, 10, 20], title: t('c1b', { v }) });
  vline(ctx, B, M.fpBest(v), C.green);
  curve(ctx, B, x => M.fpExpected(v, x), 0, 100, C.cyan);
  ring(ctx, B.x(b), B.y(Math.max(yMin, M.fpExpected(v, b))), 7, C.cyan);
  for (const [bb, mean] of s1.tried) if (mean >= yMin && mean <= yMax) dot(ctx, B.x(bb), B.y(mean), 3.6, C.text);
  const E = M.fpExpected(v, b);
  $('out1').textContent = t('s1readout', { b, w: pct(sim.winRate), wt: pct(M.winProb(b)), g: fmt(v - b), e: fmt(sim.mean, 2), et: fmt(E, 2), best: fmt(M.fpBest(v)), bv: fmt(M.fpBestValue(v), 2) });
}

/* ---------- step 2: second price ---------- */
function draw2() {
  const v = num('v2'), b = num('b2'), r = num('r2');
  $('v2v').textContent = v; $('b2v').textContent = b; $('r2v').textContent = r;
  const { ctx, W, H } = fitCanvas($('c2'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 100, yMin: -100, yMax: 100, yTicks: [-100, -50, 0, 50, 100], title: t('c2') });
  const lo = Math.min(b, v), hi = Math.max(b, v);
  if (hi > lo) { // rival bids where your bid and the truthful bid lead to different outcomes
    ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.38)'; ctx.beginPath();
    ctx.moveTo(m.x(lo), m.y(0)); ctx.lineTo(m.x(lo), m.y(v - lo)); ctx.lineTo(m.x(hi), m.y(v - hi)); ctx.lineTo(m.x(hi), m.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // truthful: v − r for r < v, else 0
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = C.text; ctx.lineWidth = 1.8; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(m.x(0), m.y(v)); ctx.lineTo(m.x(v), m.y(0)); ctx.lineTo(m.x(100), m.y(0)); ctx.stroke(); ctx.restore();
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(m.x(0), m.y(v)); ctx.lineTo(m.x(b), m.y(v - b)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m.x(b), m.y(0)); ctx.lineTo(m.x(100), m.y(0)); ctx.stroke(); ctx.restore();
  const you = M.spPayoff(v, b, r), truth = M.spPayoff(v, v, r);
  ring(ctx, m.x(r), m.y(truth), 6, C.text); dot(ctx, m.x(r), m.y(you), 4.5, C.text);
  const cmp = M.spCompare(v, b);
  const here = b > r ? t('s2win', { r, u: fmt(you) }) : t('s2lose', { r });
  const tr = v > r ? t('s2truthWin', { u: fmt(truth) }) : t('s2truthLose');
  const over = b === v ? t('s2same') : t(b < v ? 's2under' : 's2over', { lo, hi, gap: fmt(Math.abs(b - v)), el: fmt(M.spExpectedLoss(v, b), 2) });
  $('out2').textContent = here + ' ' + tr + ' ' + t('s2all', { g: fmt(Math.max(0, cmp.maxGain)) }) + ' ' + over;
}

/* ---------- step 3: revenue of the two sealed-bid rules ---------- */
const CAP3 = 400;
const s3 = { n: 3, rounds: M.revenueRun(3, CAP3), count: 1 };
function draw3() {
  const n = s3.n, k = s3.count, R = s3.rounds.slice(0, k);
  $('n3v').textContent = n;
  const { ctx, W, H } = fitCanvas($('c3'));
  const cur = k ? R[k - 1] : null;
  const A = panel(ctx, W, { top: 26, bottom: 170, xMin: 0.4, xMax: n + 0.6, yMin: 0, yMax: 100, yTicks: [0, 50, 100], xStep: 1, title: cur ? t('c3a', { k }) : t('c3a0') });
  if (cur) {
    const bw = Math.min(46, (A.x(1) - A.x(0)) * 0.55);
    cur.values.forEach((val, i) => {
      ctx.fillStyle = i === cur.winner ? C.xs : C.raw; ctx.fillRect(A.x(i + 1) - bw / 2, A.y(val), bw, A.y(0) - A.y(val));
      const bid = val * M.eqBidFactor(n); ctx.fillStyle = C.orange; ctx.fillRect(A.x(i + 1) - bw / 2 - 3, A.y(bid) - 1.5, bw + 6, 3);
    });
    hline(ctx, A, cur.first, C.orange, [6, 4], 1.4); hline(ctx, A, cur.second, C.cyan, [6, 4], 1.4);
  }
  const xMax = Math.max(20, k);
  const B = panel(ctx, W, { top: 214, bottom: H - 26, xMin: 0, xMax, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], title: t('c3b') });
  hline(ctx, B, M.theoryRevenue(n), C.text, [6, 5], 1.4);
  ctx.save();
  R.forEach((q, i) => { ctx.fillStyle = 'rgba(255,180,84,0.45)'; ctx.fillRect(B.x(i + 1) - 1.5, B.y(q.first) - 1.5, 3, 3); ctx.fillStyle = 'rgba(103,215,249,0.45)'; ctx.fillRect(B.x(i + 1) - 1.5, B.y(q.second) - 1.5, 3, 3); });
  for (const [key, col] of [['first', C.orange], ['second', C.cyan]]) {
    ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); let s = 0;
    R.forEach((q, i) => { s += q[key]; const X = B.x(i + 1), Y = B.y(s / (i + 1)); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke();
  }
  ctx.restore();
  $('one3').disabled = $('run3').disabled = k >= CAP3;
  const th = fmt(M.theoryRevenue(n), 2);
  if (!k) { $('out3').textContent = t('s3empty', { n, th, f: fmt(M.eqBidFactor(n), 3) }); return; }
  const F = M.meanSd(R.map(q => q.first)), S = M.meanSd(R.map(q => q.second));
  const last = t('s3last', { w: cur.winner + 1, hv: fmt(cur.high), p1: fmt(cur.first, 2), p2: fmt(cur.second) });
  $('out3').textContent = last + ' ' + t('s3readout', { k, cap: CAP3, a1: fmt(F.m, 2), a2: fmt(S.m, 2), th, d1: fmt(F.sd, 1), d2: fmt(S.sd, 1), t1: fmt(M.sdFirst(n), 1), t2: fmt(M.sdSecond(n), 1) });
}

/* ---------- step 4: rising and falling clocks ---------- */
const s4 = { set: 0, mode: 'eng' };
function draw4() {
  const vals = M.clockValues(s4.set), p = num('p4'), n = vals.length;
  $('p4v').textContent = fmt(p);
  $('eng4').setAttribute('aria-pressed', s4.mode === 'eng'); $('dut4').setAttribute('aria-pressed', s4.mode === 'dut');
  const { ctx, W, H } = fitCanvas($('c4'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0.4, xMax: n + 0.6, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xStep: 1, title: t(s4.mode === 'eng' ? 'c4eng' : 'c4dut') });
  const bw = Math.min(56, (m.x(1) - m.x(0)) * 0.55);
  if (s4.mode === 'eng') {
    const st = M.english(vals, p);
    vals.forEach((v, i) => {
      const inGame = st.active.includes(i);
      ctx.fillStyle = st.ended && i === st.winner ? C.orange : inGame ? C.cyan : C.raw;
      ctx.globalAlpha = inGame ? 0.9 : 0.55; ctx.fillRect(m.x(i + 1) - bw / 2, m.y(v), bw, m.y(0) - m.y(v)); ctx.globalAlpha = 1;
    });
    hline(ctx, m, Math.min(p, st.price), C.text, [], 2.2);
    $('lg4').innerHTML = legend([['sw-cyan', 'lgIn'], ['sw-grey', 'lgOut'], ['sw-orange', 'lgWinner'], ['sw-white', 'lgClock']]);
    const left = st.active.length; if (st.ended) $('p4v').textContent = fmt(st.price);
    $('out4').textContent = st.ended
      ? t('s4engEnd', { w: st.winner + 1, p: fmt(st.price), hv: fmt(vals[st.winner]) })
      : t('s4engRun', { p: fmt(p), k: left, n, out: n - left });
  } else {
    const st = M.dutch(vals, p);
    vals.forEach((v, i) => {
      ctx.fillStyle = st.ended && i === st.winner ? C.orange : C.cyan; ctx.globalAlpha = 0.85;
      ctx.fillRect(m.x(i + 1) - bw / 2, m.y(v), bw, m.y(0) - m.y(v)); ctx.globalAlpha = 1;
      ctx.fillStyle = C.pink; ctx.fillRect(m.x(i + 1) - bw / 2 - 4, m.y(st.plans[i]) - 1.5, bw + 8, 3);
    });
    hline(ctx, m, Math.max(p, st.price), C.text, [], 2.2);
    $('lg4').innerHTML = legend([['sw-cyan', 'lgVal'], ['sw-pink', 'lgPlan'], ['sw-orange', 'lgWinner'], ['sw-white', 'lgClock']]);
    if (st.ended) $('p4v').textContent = fmt(st.price, 2);
    $('out4').textContent = st.ended
      ? t('s4dutEnd', { w: st.winner + 1, p: fmt(st.price, 2), hv: fmt(vals[st.winner]) })
      : t('s4dutRun', { p: fmt(p), top: fmt(st.price, 2) });
  }
}
const legend = items => items.map(([cls, key]) => `<span class="lg"><span class="sw ${cls}"></span><span>${t(key)}</span></span>`).join('');
function resetClock() { stopAnim('s4'); $('p4').value = s4.mode === 'eng' ? 0 : 100; draw4(); }

/* ---------- step 5: common value, winner's curse ---------- */
const CAP5 = 5000;
const s5 = { list: [], r: M.rng(77) };
function reset5() { stopAnim('s5'); s5.list = []; s5.r = M.rng(77); }
function add5(count) { const n = num('n5'), g = num('g5'), sh = num('h5'); for (let i = 0; i < count && s5.list.length < CAP5; i++) s5.list.push(M.commonAuction(s5.r, n, g, sh)); }
function draw5() {
  const n = num('n5'), g = num('g5'), sh = num('h5'), L = s5.list, k = L.length, V = M.TRUE_VALUE;
  $('n5v').textContent = n; $('g5v').textContent = '±' + g; $('h5v').textContent = sh;
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 120, xMin: 15, xMax: 85, yMin: 0, yMax: 1, yTicks: [], xStep: 10, title: k ? t('c5a', { k }) : t('c5a0') });
  vline(ctx, A, V, C.text, [6, 5], 1.5);
  ctx.save(); ctx.fillStyle = 'rgba(159,180,204,0.12)'; ctx.fillRect(A.x(V - g), A.P.t + 6, A.x(V + g) - A.x(V - g), A.P.b - A.P.t - 12); ctx.restore();
  if (k) {
    const last = L[k - 1];
    last.est.forEach((e, i) => { if (i !== last.winner) dot(ctx, A.x(e), A.y(0.5), 5, C.xs); });
    const we = last.est[last.winner];
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A.x(we), A.y(0.5)); ctx.lineTo(A.x(last.pay), A.y(0.5)); ctx.stroke(); ctx.restore();
    if (sh > 0) ring(ctx, A.x(last.pay), A.y(0.5), 5.5, C.orange);
    dot(ctx, A.x(we), A.y(0.5), 6.5, C.orange);
  }
  // histogram of the winner's profit
  const lo = -35, hi = 65, bw = 2.5, bins = new Array(Math.round((hi - lo) / bw)).fill(0);
  L.forEach(a => { const j = Math.floor((a.profit - lo) / bw); if (j >= 0 && j < bins.length) bins[j]++; });
  const top = k ? Math.max(...bins) / k : 0, yMax = Math.max(0.1, Math.ceil(top * 20) / 20);
  const ticks = []; for (let v = 0; v <= yMax + 1e-9; v += yMax > 0.2 ? 0.1 : 0.05) ticks.push(+v.toFixed(2));
  const B = panel(ctx, W, { top: 164, bottom: H - 26, xMin: lo, xMax: hi, yMin: 0, yMax, yTicks: ticks, xStep: 10, yFmt: v => Math.round(v * 100) + '%', left: 44, title: t('c5b') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.75)';
  bins.forEach((c, j) => { if (!c) return; const x0 = B.x(lo + j * bw), x1 = B.x(lo + (j + 1) * bw); ctx.fillRect(x0 + 0.5, B.y(c / k), Math.max(1, x1 - x0 - 1), B.y(0) - B.y(c / k)); });
  ctx.restore();
  vline(ctx, B, 0, C.axis, [], 1.5);
  const th = M.curseTheory(n, g, sh);
  vline(ctx, B, th, C.orange, [6, 4], 2);
  const be = fmt(M.expectedMaxError(n, g), 2);
  $('one5').disabled = $('run5').disabled = k >= CAP5;
  if (!k) { $('out5').textContent = t('s5empty', { th: fmt(th, 2), be }); return; }
  const ms = M.meanSd(L.map(a => a.profit)), lossShare = L.filter(a => a.profit < 0).length / k;
  const last = L[k - 1];
  $('out5').textContent = t('s5last', { we: fmt(last.est[last.winner], 2), pay: fmt(last.pay, 2), u: fmt(last.profit, 2) }) + ' ' +
    t('s5readout', { k, m: fmt(ms.m, 2), th: fmt(th, 2), loss: pct(lossShare), be });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['v0', 'r0', 'b0'].forEach(id => $(id).addEventListener('input', draw0));
  $('v1').addEventListener('input', () => { s1.tried.clear(); draw1(); });
  $('b1').addEventListener('input', draw1);
  $('clear1').addEventListener('click', () => { s1.tried.clear(); draw1(); });
  ['v2', 'b2', 'r2'].forEach(id => $(id).addEventListener('input', draw2));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    const fb = $('quizFeedback'); fb.textContent = t(ok ? 'correct' : 'wrong'); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  });

  $('n3').addEventListener('input', () => { stopAnim('s3'); s3.n = num('n3'); s3.rounds = M.revenueRun(s3.n, CAP3); s3.count = 0; draw3(); });
  $('one3').addEventListener('click', () => { stopAnim('s3'); s3.count = Math.min(CAP3, s3.count + 1); draw3(); });
  $('run3').addEventListener('click', () => {
    const from = s3.count, to = Math.min(CAP3, from + 100);
    animate('s3', 3200, p => { s3.count = from + Math.round((to - from) * p); draw3(); });
  });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.count = 0; draw3(); });

  $('p4').addEventListener('input', () => { stopAnim('s4'); draw4(); });
  $('eng4').addEventListener('click', () => { s4.mode = 'eng'; resetClock(); });
  $('dut4').addEventListener('click', () => { s4.mode = 'dut'; resetClock(); });
  $('new4').addEventListener('click', () => { s4.set = (s4.set + 1) % 50; resetClock(); });
  $('play4').addEventListener('click', () => {
    const vals = M.clockValues(s4.set), eng = s4.mode === 'eng';
    const from = eng ? 0 : 100, to = eng ? M.english(vals, 0).price : M.dutch(vals, 100).price;
    animate('s4', Math.abs(to - from) * 45, p => { $('p4').value = (from + (to - from) * p).toFixed(1); draw4(); });
  });

  ['n5', 'g5', 'h5'].forEach(id => $(id).addEventListener('input', () => { reset5(); draw5(); }));
  $('one5').addEventListener('click', () => { stopAnim('s5'); add5(1); draw5(); });
  $('run5').addEventListener('click', () => {
    const from = s5.list.length;
    animate('s5', 2500, p => { const want = from + Math.round(500 * p); add5(want - s5.list.length); draw5(); });
  });
  $('clear5').addEventListener('click', () => { reset5(); draw5(); });

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
  add5(1); // one auction on screen so the top panel is not empty on first view
  window.refreshAuction = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
