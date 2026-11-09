'use strict';
// Velocity–time lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, speed and area comes from window.VT_MODEL (model.js). Canvas text is limited to
// panel titles (own row), axis ticks and two lane letters in a fixed gutter; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.VT_MODEL;
const t = (...a) => window.VT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', lane: '#2c3b50' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/\.?0+$/, '') : s) || '0'; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Panel title in its own row; shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel: title row above, y ticks left of the plot, x ticks below it.
function panel(ctx, W, o) {
  const P = { l: o.left || 34, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  if (o.xTicks !== false) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 26, o.xSteps || [1, 2, 4, 5, 10, 20, 40]);
    ctx.textAlign = 'center';
    for (let v = Math.ceil(o.xMin / step) * step; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
// A straight track: lanes stacked from `top`, distance ticks under the last lane. Lane letters sit in a fixed left gutter.
function track(ctx, W, o) {
  const L = 34, R = W - 14, x = v => L + v / o.xMax * (R - L);
  title(ctx, o.title, 8, o.top - 12, W - 16);
  const laneY = i => o.top + 10 + i * o.gap;
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif';
  o.lanes.forEach((ln, i) => {
    const Y = laneY(i);
    ctx.strokeStyle = C.lane; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(L, Y); ctx.lineTo(R, Y); ctx.stroke();
    if (ln.letter) { ctx.fillStyle = ln.color; ctx.textAlign = 'left'; ctx.fillText(ln.letter, 8, Y + 4); }
  });
  const base = laneY(o.lanes.length - 1) + 10;
  const step = niceStep(o.xMax, R - L, 34, [2, 4, 5, 8, 10, 12, 20, 24, 40]);
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.lineWidth = 1; ctx.strokeStyle = C.axis;
  for (let v = 0; v <= o.xMax + 1e-9; v += step) { ctx.beginPath(); ctx.moveTo(x(v), base); ctx.lineTo(x(v), base + 4); ctx.stroke(); ctx.fillText(fmt(v), x(v), base + 16); }
  ctx.restore();
  return { x, laneY };
}
function dot(ctx, X, Y, r, color, hollow) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function curve(ctx, m, f, t0, t1, color, { lw = 2.4, dash = null, n = 120 } = {}) {
  if (t1 <= t0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const tt = t0 + (t1 - t0) * i / n, X = m.x(tt), Y = m.y(f(tt)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function vguide(ctx, X, y0, y1, color = C.muted) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}

/* ---------- animation runner: reduced motion jumps to the end; hidden pages stop ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion() || ms <= 0) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms); frame(p);
    if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); const d = anims[name].done; delete anims[name]; if (d) d(); } }
const running = name => !!anims[name];

/* ---------- step 0: steady walking on a track ---------- */
function draw0() {
  const v = num('v0'), tt = num('t0');
  $('v0v').textContent = v + ' m/s'; $('t0v').textContent = fmt(tt) + ' s';
  const { ctx, W } = fitCanvas($('c0'));
  const tr = track(ctx, W, { top: 44, gap: 0, xMax: 48, title: t('c0title'), lanes: [{}] });
  const Y = tr.laneY(0);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 2;
  for (let k = 0; k <= Math.floor(tt + 1e-9); k++) { const X = tr.x(M.distanceAt(M.constant(v), k)); ctx.beginPath(); ctx.moveTo(X, Y - 16); ctx.lineTo(X, Y - 6); ctx.stroke(); }
  ctx.restore();
  dot(ctx, tr.x(M.distanceAt(M.constant(v), tt)), Y, 7, C.cyan);
  $('r0').textContent = t('s0readout', { v, t: fmt(tt), s: fmt(M.distanceAt(M.constant(v), tt)) });
}

/* ---------- step 1: two runners, track + x–t graph on one clock ---------- */
function draw1() {
  const va = num('vA'), vb = num('vB'), tt = num('t1'), A = M.constant(va), B = M.constant(vb);
  $('vAv').textContent = va + ' m/s'; $('vBv').textContent = vb + ' m/s'; $('t1v').textContent = tt.toFixed(1) + ' s';
  $('play1').textContent = running('s1') ? t('pause') : tt >= M.RACE_T - 1e-9 ? t('replay') : t('play');
  const { ctx, W, H } = fitCanvas($('c1'));
  const tr = track(ctx, W, { top: 44, gap: 30, xMax: 48, title: t('c1track'), lanes: [{ letter: t('laneA'), color: C.cyan }, { letter: t('laneB'), color: C.orange }] });
  const xa = M.distanceAt(A, tt), xb = M.distanceAt(B, tt);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; const midY = (tr.laneY(0) + tr.laneY(1)) / 2;
  ctx.beginPath(); ctx.moveTo(tr.x(xa), midY); ctx.lineTo(tr.x(xb), midY); ctx.stroke(); ctx.restore();
  dot(ctx, tr.x(xa), tr.laneY(0), 7, C.cyan); dot(ctx, tr.x(xb), tr.laneY(1), 7, C.orange);
  const g = panel(ctx, W, { top: 160, bottom: H - 26, xMin: 0, xMax: 8, yMin: 0, yMax: 48, yTicks: [0, 12, 24, 36, 48], title: t('c1xt') });
  curve(ctx, g, s => M.distanceAt(A, s), 0, tt, C.cyan); curve(ctx, g, s => M.distanceAt(B, s), 0, tt, C.orange);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(g.x(tt), g.y(xa)); ctx.lineTo(g.x(tt), g.y(xb)); ctx.stroke(); ctx.restore();
  dot(ctx, g.x(tt), g.y(xa), 5, C.cyan); dot(ctx, g.x(tt), g.y(xb), 5, C.orange);
  $('r1').textContent = t('s1readout', { t: tt.toFixed(1), xa: fmt(xa), xb: fmt(xb), gap: fmt(Math.abs(xa - xb)), ka: fmt(M.slope(A, 0, 1)), kb: fmt(M.slope(B, 0, 1)) });
}
function play(name, input, tMax, draw) {
  if (running(name)) { stopAnim(name); draw(); return; }
  let t0 = Number($(input).value); if (t0 >= tMax - 1e-9) t0 = 0;
  animate(name, (tMax - t0) * 500, p => { $(input).value = (t0 + (tMax - t0) * p).toFixed(1); draw(); }, () => setTimeout(draw, 0));
  draw();
}

/* ---------- step 2: the same race on x–t and v–t ---------- */
const RACE = () => [{ p: M.constant(4), c: C.cyan }, { p: M.constant(2), c: C.orange }, { p: M.RUNNER_C, c: C.green, dash: [7, 5] }];
function draw2() {
  const tt = num('t2'); $('t2v').textContent = tt.toFixed(1) + ' s';
  $('play2').textContent = running('s2') ? t('pause') : tt >= M.RACE_T - 1e-9 ? t('replay') : t('play');
  let { ctx, W, H } = fitCanvas($('c2a'));
  const a = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 8, yMin: 0, yMax: 32, yTicks: [0, 8, 16, 24, 32], title: t('c2aT') });
  RACE().forEach(r => { curve(ctx, a, s => M.distanceAt(r.p, s), 0, tt, r.c, { dash: r.dash }); dot(ctx, a.x(tt), a.y(M.distanceAt(r.p, tt)), 4.5, r.c); });
  vguide(ctx, a.x(tt), a.P.t, a.P.b);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const b = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 8, yMin: 0, yMax: 5, yTicks: [0, 1, 2, 3, 4, 5], title: t('c2bT') });
  RACE().forEach(r => { curve(ctx, b, s => M.speedAt(r.p, s), 0, tt, r.c, { dash: r.dash }); dot(ctx, b.x(tt), b.y(M.speedAt(r.p, tt)), 4.5, r.c); });
  vguide(ctx, b.x(tt), b.P.t, b.P.b);
  const [A, B, Cc] = RACE().map(r => r.p);
  const vc = M.speedAt(Cc, tt), lag = M.distanceAt(A, tt) - M.distanceAt(Cc, tt);
  const note = vc < 4 - 1e-9 ? t('s2noteUp') : t('s2noteFlat', { lag: fmt(lag) });
  $('r2').textContent = t('s2readout', { t: tt.toFixed(1), va: fmt(M.speedAt(A, tt)), xa: fmt(M.distanceAt(A, tt)), vb: fmt(M.speedAt(B, tt)), xb: fmt(M.distanceAt(B, tt)), vc: fmt(vc), xc: fmt(M.distanceAt(Cc, tt)), note });
}

/* ---------- step 3: count unit cells under a flat v–t line ---------- */
const s3 = { n: null };
function draw3() {
  const v = num('v3'), d = num('t3'), area = M.distanceAt(M.constant(v), d);
  if (s3.n === null) s3.n = area;
  $('v3v').textContent = v + ' m/s'; $('t3v').textContent = d + ' s';
  const { ctx, W, H } = fitCanvas($('c3'));
  const g = panel(ctx, W, { top: 30, bottom: 250, xMin: 0, xMax: 8, yMin: 0, yMax: 6.5, yTicks: [0, 1, 2, 3, 4, 5, 6], title: t('c3top') });
  let k = 0;
  for (let i = 0; i < d; i++) for (let j = 0; j < v; j++) {
    const X0 = g.x(i), X1 = g.x(i + 1), Y0 = g.y(j + 1), Y1 = g.y(j);
    ctx.fillStyle = k < s3.n ? 'rgba(103,215,249,0.28)' : 'rgba(103,215,249,0.05)'; ctx.fillRect(X0 + 1, Y0 + 1, X1 - X0 - 2, Y1 - Y0 - 2);
    ctx.strokeStyle = k < s3.n ? C.cyan : C.grid; ctx.lineWidth = 1; ctx.strokeRect(X0 + 1.5, Y0 + 1.5, X1 - X0 - 3, Y1 - Y0 - 3);
    k++;
  }
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(g.x(0), g.y(v)); ctx.lineTo(g.x(8), g.y(v)); ctx.stroke(); ctx.restore();
  vguide(ctx, g.x(d), g.P.t, g.P.b, C.text);
  const tr = track(ctx, W, { top: H - 74, gap: 0, xMax: 48, title: t('c3track'), lanes: [{}] });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tr.x(0), tr.laneY(0)); ctx.lineTo(tr.x(s3.n), tr.laneY(0)); ctx.stroke(); ctx.restore();
  dot(ctx, tr.x(area), tr.laneY(0), 6, C.orange, true);
  $('r3').textContent = t('s3readout', { v, t: d, area: fmt(area), n: s3.n });
  $('count3').textContent = running('s3') ? t('counting') : t('countCells');
}

/* ---------- step 4: strip sums under a rising line ---------- */
const s4 = { tried: new Set([1]) };
function draw4() {
  const idx = num('n4'), N = M.STRIPS[idx], s = M.stripSums(N);
  s4.tried.add(idx);
  $('n4v').textContent = String(N);
  let { ctx, W, H } = fitCanvas($('c4a'));
  const a = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 6, yMin: 0, yMax: 6.5, yTicks: [0, 2, 4, 6], title: t('c4aT') });
  for (let i = 0; i < N; i++) {
    const t0 = i * s.dt, t1 = t0 + s.dt, lo = M.rampV(t0), hi = M.rampV(t1);
    ctx.fillStyle = 'rgba(103,215,249,0.35)'; ctx.fillRect(a.x(t0), a.y(lo), a.x(t1) - a.x(t0), a.y(0) - a.y(lo));
    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4; ctx.strokeRect(a.x(t0), a.y(hi), a.x(t1) - a.x(t0), a.y(0) - a.y(hi));
  }
  curve(ctx, a, M.rampV, 0, 6, C.text, { lw: 2.2, n: 2 });
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const b = panel(ctx, W, { top: 30, bottom: H - 26, xMin: -0.5, xMax: 5.5, yMin: 0, yMax: 36, yTicks: [0, 9, 18, 27, 36], xTicks: false, title: t('c4bT') });
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  M.STRIPS.forEach((n, i) => ctx.fillText(String(n), b.x(i), b.P.b + 15)); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.P.l, b.y(M.RAMP_EXACT)); ctx.lineTo(b.P.r, b.y(M.RAMP_EXACT)); ctx.stroke(); ctx.restore();
  [...s4.tried].sort((p, q) => p - q).forEach(i => {
    const q = M.stripSums(M.STRIPS[i]), big = i === idx;
    ctx.save(); ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(b.x(i), b.y(q.low)); ctx.lineTo(b.x(i), b.y(q.high)); ctx.stroke(); ctx.restore();
    dot(ctx, b.x(i), b.y(q.low), big ? 6 : 4, C.cyan); dot(ctx, b.x(i), b.y(q.high), big ? 6 : 4, C.orange, true);
  });
  $('r4').textContent = t('s4readout', { n: N, dt: fmt(s.dt, 2), low: fmt(s.low, 2), high: fmt(s.high, 2), gap: fmt(s.gap, 2), exact: fmt(s.exact) });
}

/* ---------- step 5: the bus trip ---------- */
function draw5() {
  const tt = num('t5'), P = M.TRIP, sum = M.tripSummary(P), T = sum.T, showAvg = $('avg5').checked;
  $('t5v').textContent = tt.toFixed(1) + ' s';
  $('play5').textContent = running('s5') ? t('pause') : tt >= T - 1e-9 ? t('replay') : t('play');
  const { ctx, W, H } = fitCanvas($('c5'));
  const tr = track(ctx, W, { top: 44, gap: 0, xMax: 120, title: t('c5track'), lanes: [{}] });
  const xNow = M.distanceAt(P, tt);
  dot(ctx, tr.x(sum.total), tr.laneY(0), 6, C.muted, true);
  ctx.save(); ctx.fillStyle = C.orange; const bx = tr.x(xNow); ctx.fillRect(bx - 11, tr.laneY(0) - 7, 22, 14); ctx.restore();
  const vt = panel(ctx, W, { top: 118, bottom: 266, xMin: 0, xMax: 15, yMin: 0, yMax: 12, yTicks: [0, 5, 10], title: t('c5vt') });
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.3)'; ctx.beginPath(); ctx.moveTo(vt.x(0), vt.y(0));
  for (let i = 0; i <= 150; i++) { const s = tt * i / 150; ctx.lineTo(vt.x(s), vt.y(M.speedAt(P, s))); }
  ctx.lineTo(vt.x(tt), vt.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
  if (showAvg) { ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.strokeRect(vt.x(0), vt.y(sum.avg), vt.x(T) - vt.x(0), vt.y(0) - vt.y(sum.avg)); ctx.restore(); }
  curve(ctx, vt, s => M.speedAt(P, s), 0, T, C.cyan, { n: 150 });
  dot(ctx, vt.x(tt), vt.y(M.speedAt(P, tt)), 5, C.text);
  const xt = panel(ctx, W, { top: 326, bottom: H - 26, xMin: 0, xMax: 15, yMin: 0, yMax: 120, yTicks: [0, 40, 80, 120], title: t('c5xt') });
  curve(ctx, xt, s => M.distanceAt(P, s), 0, tt, C.orange, { n: 150 });
  dot(ctx, xt.x(tt), xt.y(xNow), 5, C.orange);
  vguide(ctx, vt.x(tt), vt.P.t, xt.P.b);
  const seg = sum.segs.find(q => tt >= q.t0 - 1e-9 && tt <= q.t1 + 1e-9 && !(tt === q.t1 && q.t1 < T));
  const kind = tt >= T - 1e-9 ? t('kindStop') : seg.kind === 'up' ? t('kindUp') : seg.kind === 'down' ? t('kindDown') : t('kindFlat');
  $('r5').textContent = t('s5readout', { t: tt.toFixed(1), kind, v: fmt(M.speedAt(P, tt), 2), x: fmt(xNow, 2) });
  const [g1, g2, g3] = sum.segs;
  $('r5b').textContent = t('s5segs', { d1: g1.t1 - g1.t0, d2: g2.t1 - g2.t0, d3: g3.t1 - g3.t0, v: g2.v0, a1: fmt(g1.area), a2: fmt(g2.area), a3: fmt(g3.area), total: fmt(sum.total),
    avg: showAvg ? t('s5avgNote', { total: fmt(sum.total), T, avg: fmt(sum.avg, 2) }) : '' });
}

/* ---------- step 6: self-check ---------- */
function quizModel() {
  const P = M.QUIZ, sum = M.tripSummary(P), vAt = M.speedAt(P, M.QUIZ_T), vmax = Math.max(...P.map(p => p[1]));
  const flat = sum.segs.find(s => s.kind === 'flat');
  return { P, sum, vAt, vmax,
    q1: [...new Set([vAt, M.QUIZ_T, vmax])].sort((a, b) => a - b), q1ok: vAt,
    q2: [...new Set([sum.total, vmax * sum.T, flat.area])].sort((a, b) => a - b), q2ok: sum.total };
}
const s6 = { work: false };
function buildQuiz() {
  const Q = quizModel(), keep = name => { const c = document.querySelector(`input[name="${name}"]:checked`); return c ? c.value : null; };
  const k1 = keep('q6a'), k2 = keep('q6b'), k3 = keep('q6c');
  $('q6aP').textContent = t('q6aP', { t: M.QUIZ_T }); $('q6bP').textContent = t('q6bP', { T: Q.sum.T });
  const opts = (name, list) => list.map(o => `<label><input type="radio" name="${name}" value="${o.v}"${o.v === { q6a: k1, q6b: k2, q6c: k3 }[name] ? ' checked' : ''}><span>${o.text}</span></label>`).join('');
  $('q6aO').innerHTML = opts('q6a', Q.q1.map(v => ({ v: String(v), text: t('optV', { v }) })));
  $('q6bO').innerHTML = opts('q6b', Q.q2.map(d => ({ v: String(d), text: t('optM', { d }) })));
  $('q6cO').innerHTML = opts('q6c', [{ v: 'true', text: t('optTrue') }, { v: 'false', text: t('optFalse') }]);
}
function draw6() {
  const Q = quizModel(), { ctx, W, H } = fitCanvas($('c6'));
  const g = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: Q.sum.T, yMin: 0, yMax: 10, yTicks: [0, 2, 4, 6, 8, 10], xSteps: [1, 2, 3], title: t('c6T') });
  ctx.save(); ctx.strokeStyle = C.grid; for (let s = 1; s < Q.sum.T; s++) { ctx.beginPath(); ctx.moveTo(g.x(s), g.P.t); ctx.lineTo(g.x(s), g.P.b); ctx.stroke(); } ctx.restore();
  if (s6.work) {
    const cols = ['rgba(103,215,249,0.3)', 'rgba(255,180,84,0.3)', 'rgba(126,226,168,0.3)'];
    Q.sum.segs.forEach((s, i) => { ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.moveTo(g.x(s.t0), g.y(0)); ctx.lineTo(g.x(s.t0), g.y(s.v0)); ctx.lineTo(g.x(s.t1), g.y(s.v1)); ctx.lineTo(g.x(s.t1), g.y(0)); ctx.closePath(); ctx.fill(); });
    vguide(ctx, g.x(M.QUIZ_T), g.P.t, g.P.b, C.text); dot(ctx, g.x(M.QUIZ_T), g.y(Q.vAt), 5, C.text);
  }
  curve(ctx, g, s => M.speedAt(Q.P, s), 0, Q.sum.T, C.cyan, { n: 90 });
}
function check6(showWork) {
  const Q = quizModel(), pick = n => { const c = document.querySelector(`input[name="${n}"]:checked`); return c ? c.value : null; };
  const a = pick('q6a'), b = pick('q6b'), c = pick('q6c'), fb = $('fb6');
  const lines = [];
  if (!showWork) {
    if (a === null || b === null || c === null) { fb.textContent = t('fbMiss'); fb.dataset.state = 'missing'; fb.style.color = C.orange; return; }
    const r1 = Number(a) === Q.q1ok, r2 = Number(b) === Q.q2ok, r3 = c === 'false', n = [r1, r2, r3].filter(Boolean).length;
    lines.push(t('fbRight', { n }));
    lines.push(r1 ? t('fb1ok', { t: M.QUIZ_T, v: Q.vAt }) : t('fb1no', { t: M.QUIZ_T }));
    lines.push(r2 ? t('fb2ok', { d: Q.q2ok }) : t('fb2no'));
    lines.push(r3 ? t('fb3ok') : t('fb3no'));
    fb.dataset.state = n === 3 ? 'correct' : 'partial'; fb.style.color = n === 3 ? C.green : C.orange;
  }
  if (showWork || s6.work) {
    const [g1, g2, g3] = Q.sum.segs;
    lines.push(t('work', { t: M.QUIZ_T, v: Q.vAt, d1: g1.t1 - g1.t0, d2: g2.t1 - g2.t0, d3: g3.t1 - g3.t0, vm: Q.vmax, a1: fmt(g1.area), a2: fmt(g2.area), a3: fmt(g3.area), d: Q.q2ok }));
    if (showWork) { fb.style.color = C.text; fb.dataset.state = 'work'; }
  }
  fb.textContent = lines.join('\n');
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4(); draw5();
  buildQuiz(); draw6();
  if ($('fb6').dataset.state && $('fb6').dataset.state !== 'missing') check6($('fb6').dataset.state === 'work'); else if ($('fb6').dataset.state === 'missing') $('fb6').textContent = t('fbMiss');
  if ($('fb2').dataset.state) $('fb2').textContent = t($('fb2').dataset.state === 'correct' ? 'q2right' : 'q2wrong');
}

function setup() {
  ['v0', 't0'].forEach(id => $(id).addEventListener('input', draw0));
  ['vA', 'vB'].forEach(id => $(id).addEventListener('input', draw1));
  $('t1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('play1').addEventListener('click', () => play('s1', 't1', M.RACE_T, draw1));
  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('play2').addEventListener('click', () => play('s2', 't2', M.RACE_T, draw2));
  $('check2').addEventListener('click', () => {
    const c = document.querySelector('input[name="q2"]:checked'), ok = !!c && c.value === 'b', fb = $('fb2');
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.style.color = ok ? C.green : C.orange; fb.textContent = t(ok ? 'q2right' : 'q2wrong');
  });
  document.querySelectorAll('input[name="q2"]').forEach(r => r.addEventListener('change', () => { $('fb2').textContent = ''; delete $('fb2').dataset.state; }));

  ['v3', 't3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); s3.n = null; draw3(); }));
  $('count3').addEventListener('click', () => {
    const area = num('v3') * num('t3');
    s3.n = 0; draw3();
    animate('s3', area * 130, p => { s3.n = Math.min(area, Math.floor(p * area + 1e-9)); draw3(); }, () => setTimeout(() => { if (s3.n !== null && s3.n < num('v3') * num('t3')) s3.n = null; draw3(); }, 0));
  });

  $('n4').addEventListener('input', () => { stopAnim('s4'); draw4(); });
  $('refine4').addEventListener('click', () => {
    s4.tried = new Set(); const K = M.STRIPS.length;
    animate('s4', K * 800, p => { const i = Math.min(K - 1, Math.floor(p * K)); for (let j = 0; j <= i; j++) s4.tried.add(j); $('n4').value = i; draw4(); });
  });

  $('t5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('avg5').addEventListener('change', draw5);
  $('play5').addEventListener('click', () => play('s5', 't5', M.tripSummary(M.TRIP).T, draw5));

  document.addEventListener('change', e => { if (e.target.name && /^q6/.test(e.target.name)) { const fb = $('fb6'); fb.textContent = ''; delete fb.dataset.state; s6.work = false; draw6(); } });
  $('check6').addEventListener('click', () => check6(false));
  $('reveal6').addEventListener('click', () => { const st = $('fb6').dataset.state; s6.work = true; draw6(); check6(!(st === 'correct' || st === 'partial')); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) Object.keys(anims).forEach(stopAnim); });
  window.refreshVelocity = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
