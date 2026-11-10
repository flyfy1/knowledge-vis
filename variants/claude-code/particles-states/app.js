'use strict';
// Particles & states lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every particle position, reading and state name comes from window.PS_MODEL (model.js); the page
// only advances the simulations and draws them. Canvas text is limited to panel titles and ticks.
(function () {

const $ = id => document.getElementById(id);
const M = window.PS_MODEL;
const t = (...a) => window.PS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', blue: '#8aa8ff', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', link: '#6c809a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const stName = s => t(s === 'solid' ? 'stSolid' : s === 'liquid' ? 'stLiquid' : 'stGas');
const HIST_EVERY = 25, HIST_MAX = 700;

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
function panel(ctx, W, o) {
  const P = { l: o.left || 36, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 6, y(v) + 4); }
  if (o.xTicks) { ctx.textAlign = 'center'; o.xTicks.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15); }); }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function line(ctx, pts, color, lw = 2) { if (pts.length < 2) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore(); }
function dashed(ctx, x0, y0, x1, y1, color, alpha = 0.8) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
const mix = (a, b, f) => `rgb(${[0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * f)).join(',')})`;
const SLOW = [79, 127, 216], FAST = [255, 180, 84];

/* ---------- simulations ---------- */
const SIMS = {};
function makeSim(i, seed, heater, warm, sub) {
  const sim = M.createSim({ seed, heater: 0.1 });
  const S = { i, sim, seed, sub, hist: [], playing: !reduceMotion(), visible: false, track: 41, trail: [] };
  SIMS[i] = S;
  sim.heater = heater; advance(S, warm);
  return S;
}
function sample(S) {
  const s = S.sim, m = s.measured;
  S.hist.push({ t: s.t, T: M.tempReading(s), j: M.jiggle(s), psi: s.psiEma, st: M.stateOf(s), liq: m.liquid, air: m.air, esc: m.escaped });
  if (S.hist.length > HIST_MAX) S.hist.shift();
  if (S.i === 0) { const k = S.track; S.trail.push([s.x[k], s.y[k], Math.hypot(s.x[k] - s.sx[k], s.y[k] - s.sy[k])]); if (S.trail.length > 160) S.trail.shift(); }
}
function advance(S, n) {
  for (let k = 0; k < n; k++) {
    if (S.i === 5 && s5.cycle) { const tc = S.sim.t - s5.cycle.t0; S.sim.heater = M.cycleHeater(tc); if (tc >= M.CYCLE_END) endCycle(); }
    M.step(S.sim);
    if (S.sim.sub % HIST_EVERY === 0) { sample(S); if (S.i === 5 && s5.cycle) noteCycleState(); }
  }
}

function drawBox(canvas, S, opt = {}) {
  const s = S.sim, { ctx, W, H } = fitCanvas(canvas);
  title(ctx, t(opt.title), 8, 17, W - 16);
  const sc = Math.min((W - 20) / M.P.BW, (H - 36) / M.P.BH), bw = sc * M.P.BW, bh = sc * M.P.BH, x0 = (W - bw) / 2, y0 = 28;
  const X = v => x0 + v * sc, Y = v => y0 + (M.P.BH - v) * sc;
  ctx.fillStyle = '#0a121c'; ctx.fillRect(x0, y0, bw, bh);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + bh); ctx.lineTo(x0 + bw, y0 + bh); ctx.lineTo(x0 + bw, y0); ctx.stroke();
  if (s.lid) { ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + bw, y0); ctx.stroke(); }
  else dashed(ctx, x0, y0, x0 + bw, y0, C.orange, 0.9);
  if (opt.links) {
    ctx.save(); ctx.strokeStyle = C.link; ctx.lineWidth = Math.max(1, sc * 0.08); ctx.globalAlpha = 0.85; ctx.beginPath();
    for (let i = 0; i < s.N; i++) if (s.alive[i]) for (let j = i + 1; j < s.N; j++) if (s.alive[j]) { const dx = s.x[i] - s.x[j], dy = s.y[i] - s.y[j]; if (dx * dx + dy * dy < 1.25 * 1.25) { ctx.moveTo(X(s.x[i]), Y(s.y[i])); ctx.lineTo(X(s.x[j]), Y(s.y[j])); } }
    ctx.stroke(); ctx.restore();
  }
  const r = Math.max(2, sc * (opt.links ? 0.3 : 0.45));
  for (let i = 0; i < s.N; i++) {
    if (!s.alive[i]) continue;
    const v = Math.hypot(s.vx[i], s.vy[i]), f = Math.min(1, v / 2.2);
    ctx.fillStyle = mix(SLOW, FAST, f); ctx.beginPath(); ctx.arc(X(s.x[i]), Y(s.y[i]), r, 0, 7); ctx.fill();
  }
  if (opt.track) {
    const k = S.track;
    ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(s.sx[k]), Y(s.sy[k]), sc * 0.55, 0, 7); ctx.stroke(); ctx.restore();
    line(ctx, S.trail.map(([a, b]) => [X(a), Y(b)]), C.orange, 1.6);
    ctx.fillStyle = C.orange; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(s.x[k]), Y(s.y[k]), r + 1.5, 0, 7); ctx.fill(); ctx.stroke();
  }
}
// time chart helper: keys → panels; x = the last `span` time units of the history
function timeAxis(S, span) { const h = S.hist, tEnd = h.length ? h[h.length - 1].t : 0, t0 = h.length ? Math.max(h[0].t, tEnd - span) : 0; return { h, t0, t1: t0 + span }; }

/* ---------- step 0 ---------- */
function draw0() {
  const S = SIMS[0], s = S.sim, k = S.track;
  drawBox($('c0'), S, { title: 'c0a', track: true });
  const d = Math.hypot(s.x[k] - s.sx[k], s.y[k] - s.sy[k]), dmax = Math.max(d, ...S.trail.map(q => q[2]));
  $('r0').textContent = t('s0readout', { state: stName(M.stateOf(s)), d: fmt(d), dmax: fmt(dmax), j: fmt(M.jiggle(s)), T: fmt(M.tempReading(s), 0) });
}
/* ---------- step 1 ---------- */
function draw1() {
  const S = SIMS[1], s = S.sim;
  $('h1v').textContent = String(num('h1'));
  drawBox($('c1'), S, { title: 'c1a' });
  const { ctx, W, H } = fitCanvas($('c1b')), A = timeAxis(S, 40);
  const half = (H - 26) / 2;
  const p1 = panel(ctx, W, { top: 26, bottom: 26 + half - 26, xMin: A.t0, xMax: A.t1, yMin: 0, yMax: 25, yTicks: [0, 10, 20], title: t('c1b') });
  const p2 = panel(ctx, W, { top: 36 + half, bottom: H - 14, xMin: A.t0, xMax: A.t1, yMin: 0, yMax: 0.6, yTicks: [0, 0.3, 0.6] });
  const vis = A.h.filter(q => q.t >= A.t0);
  dashed(ctx, p1.P.l, p1.y(num('h1')), p1.P.r, p1.y(num('h1')), C.blue, 0.45);
  line(ctx, vis.map(q => [p1.x(q.t), p1.y(Math.min(25, q.T))]), C.blue, 2);
  line(ctx, vis.map(q => [p2.x(q.t), p2.y(Math.min(0.6, q.j))]), C.orange, 2);
  $('r1').textContent = t('s1readout', { set: num('h1'), T: fmt(M.tempReading(s), 0), j: fmt(M.jiggle(s)), state: stName(M.stateOf(s)) });
}
/* ---------- step 2 ---------- */
function draw2() {
  const S = SIMS[2], s = S.sim;
  $('h2v').textContent = String(num('h2'));
  drawBox($('c2'), S, { title: 'c2a', links: true });
  const { ctx, W, H } = fitCanvas($('c2b')), A = timeAxis(S, 60);
  const half = (H - 26) / 2;
  const p1 = panel(ctx, W, { top: 26, bottom: 26 + half - 26, xMin: A.t0, xMax: A.t1, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], title: t('c2b') });
  const p2 = panel(ctx, W, { top: 36 + half, bottom: H - 14, xMin: A.t0, xMax: A.t1, yMin: 0, yMax: 60, yTicks: [0, 30, 60] });
  const vis = A.h.filter(q => q.t >= A.t0);
  dashed(ctx, p1.P.l, p1.y(M.PSI_SOLID), p1.P.r, p1.y(M.PSI_SOLID), C.green, 0.7);
  line(ctx, vis.map(q => [p1.x(q.t), p1.y(q.psi)]), C.green, 2);
  line(ctx, vis.map(q => [p2.x(q.t), p2.y(Math.min(60, q.T))]), C.blue, 2);
  $('r2').textContent = t('s2readout', { set: num('h2'), T: fmt(M.tempReading(s), 0), psi: fmt(s.psiEma), state: stName(M.stateOf(s)), n: M.aliveCount(s) });
}
/* ---------- step 3: water heating curve ---------- */
const SEGS = M.heatingSegments(), TOTAL = SEGS[SEGS.length - 1].E1;
const plateau = kind => { const g = SEGS.find(q => q.kind === kind); return (g.E1 - g.E0) / M.WATER.P; };
function draw3() {
  const time = num('t3'), h = M.heatingAt(time);
  $('t3v').textContent = String(time);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: 270, xMin: -8, xMax: 320, yMin: -30, yMax: 130, yTicks: [-20, 0, 50, 100], xTicks: [0, 100, 200, 300].concat(W >= 420 ? [50, 150, 250] : []), title: t('c3a') });
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.07)';
  SEGS.filter(g => g.kind === 'melt' || g.kind === 'boil').forEach(g => ctx.fillRect(A.x(g.E0 / M.WATER.P), A.P.t, A.x(g.E1 / M.WATER.P) - A.x(g.E0 / M.WATER.P), A.P.b - A.P.t));
  ctx.restore();
  SEGS.forEach(g => {
    const flat = g.kind === 'melt' || g.kind === 'boil', a = g.E0 / M.WATER.P, b = g.E1 / M.WATER.P;
    line(ctx, [[A.x(a), A.y(g.Ta)], [A.x(b), A.y(g.Tb)]], flat ? 'rgba(255,180,84,0.35)' : 'rgba(138,168,255,0.35)', 2);
    const e = Math.min(time, b); if (e > a) line(ctx, [[A.x(a), A.y(g.Ta)], [A.x(e), A.y(g.Ta + (g.Tb - g.Ta) * (e - a) / (b - a))]], flat ? C.orange : C.blue, 3);
  });
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(Math.min(time, TOTAL / M.WATER.P)), A.y(h.T), 6, 0, 7); ctx.fill();
  const B = panel(ctx, W, { top: 320, bottom: H - 30, xMin: 0, xMax: 320000, yMin: 0, yMax: 1, yTicks: [], xTicks: [0, 100000, 200000, 300000], xLabel: v => fmt(v / 1000, 0) + ' kJ', title: t('c3b') });
  const bh = B.P.b - B.P.t - 6;
  ctx.fillStyle = 'rgba(232,237,244,0.06)'; ctx.fillRect(B.x(0), B.P.t + 3, B.x(TOTAL) - B.x(0), bh);
  ctx.fillStyle = C.blue; ctx.fillRect(B.x(0), B.P.t + 3, B.x(h.warm) - B.x(0), bh);
  ctx.fillStyle = C.orange; ctx.fillRect(B.x(h.warm), B.P.t + 3, B.x(h.warm + h.apart) - B.x(h.warm), bh);
  const fl = fmt(plateau('melt'), 1), bl = fmt(plateau('boil'), 1);
  $('r3').textContent = t('s3readout', { t: time, kind: t('k3' + h.kind), T: fmt(h.T, 1), E: Math.round(h.E), warm: Math.round(h.warm), apart: Math.round(h.apart), fl, bl });
  $('h3').textContent = t('s3hint', { fl, bl });
}
/* ---------- step 4 ---------- */
function draw4() {
  const S = SIMS[4], s = S.sim, m = s.measured;
  $('h4v').textContent = String(num('h4'));
  $('lid4').textContent = t(s.lid ? 'lid4' : 'lidClose4');
  drawBox($('c4'), S, { title: 'c4a' });
  const { ctx, W, H } = fitCanvas($('c4b')), A = timeAxis(S, 60);
  const p = panel(ctx, W, { top: 26, bottom: H - 14, xMin: A.t0, xMax: A.t1, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], title: t('c4b') });
  const vis = A.h.filter(q => q.t >= A.t0);
  line(ctx, vis.map(q => [p.x(q.t), p.y(q.liq)]), C.cyan, 2);
  line(ctx, vis.map(q => [p.x(q.t), p.y(q.air)]), C.text, 2);
  line(ctx, vis.map(q => [p.x(q.t), p.y(q.esc)]), C.orange, 2);
  $('r4').textContent = t('s4readout', { lid: t(s.lid ? 'lidOn' : 'lidOff'), T: fmt(M.tempReading(s), 0), liq: m.liquid, air: m.air, esc: m.escaped, sum: m.liquid + m.air + m.escaped });
}
/* ---------- step 5 ---------- */
const s5 = { cycle: null, seq: [] };
const BAND = { solid: 'rgba(126,226,168,0.16)', liquid: 'rgba(103,215,249,0.15)', gas: 'rgba(255,180,84,0.17)' };
function noteCycleState() { const st = M.stateOf(SIMS[5].sim); if (s5.seq[s5.seq.length - 1] !== st) s5.seq.push(st); }
function endCycle() { s5.cycle = null; $('cycle5').disabled = false; }
function draw5() {
  const S = SIMS[5], s = S.sim;
  if (s5.cycle) $('h5').value = String(Math.round(s.heater * 100 / 5) * 5);
  $('h5v').textContent = String(num('h5'));
  drawBox($('c5'), S, { title: 'c5a', links: true });
  const { ctx, W, H } = fitCanvas($('c5b')), A = timeAxis(S, 160);
  const p = panel(ctx, W, { top: 26, bottom: H - 14, xMin: A.t0, xMax: A.t1, yMin: 0, yMax: 260, yTicks: [0, 100, 200], title: t('c5b') });
  const vis = A.h.filter(q => q.t >= A.t0);
  for (let i = 0; i < vis.length; i++) { const a = vis[i], b = vis[i + 1] || a; ctx.fillStyle = BAND[a.st]; ctx.fillRect(p.x(a.t), p.P.t, Math.max(1, p.x(b.t) - p.x(a.t) + 0.5), p.P.b - p.P.t); }
  line(ctx, vis.map(q => [p.x(q.t), p.y(Math.min(260, q.T))]), C.blue, 2);
  const prog = s5.cycle ? t('s5prog', { p: Math.min(100, Math.round(100 * (s.t - s5.cycle.t0) / M.CYCLE_END)) }) : '';
  $('r5').textContent = t('s5readout', { prog, set: num('h5'), T: fmt(M.tempReading(s), 0), state: stName(M.stateOf(s)), h: fmt(M.height90(s), 1), n: M.aliveCount(s) });
  $('r5b').textContent = s5.seq.length > 1 ? t('s5seq', { seq: s5.seq.map(stName).join(' → ') }) : '';
}

const DRAW = { 0: draw0, 1: draw1, 2: draw2, 4: draw4, 5: draw5 };
function playLabels() { document.querySelectorAll('button.play').forEach(b => { const S = SIMS[b.dataset.sim]; b.textContent = t(S.playing ? 'pause' : 'play'); b.setAttribute('aria-pressed', S.playing ? 'true' : 'false'); }); }
function refresh() { playLabels(); [0, 1, 2, 4, 5].forEach(i => DRAW[i]()); draw3(); }

let raf = null;
function loop() {
  raf = null;
  if (document.hidden) return;
  let any = false;
  Object.values(SIMS).forEach(S => {
    if (!S.playing || !S.visible) return;
    any = true;
    advance(S, S.i === 5 && s5.cycle ? 36 : S.sub);
    DRAW[S.i]();
  });
  if (any) raf = requestAnimationFrame(loop);
}
const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };
// a heater change: with reduced motion (or while paused) jump ahead so the new state is shown at once
function heaterChanged(i, value) {
  const S = SIMS[i]; S.sim.heater = value / 100;
  if (!S.playing) advance(S, 2500);
  DRAW[i](); kick();
}

const anims = {};
function animate(name, ms, frame, done) {
  if (anims[name]) cancelAnimationFrame(anims[name].id);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame }; else delete anims[name]; };
  anims[name] = { id: requestAnimationFrame(tick), frame };
}

function setup() {
  makeSim(0, 11, 0.1, 1500, 12);
  makeSim(1, 12, 0.05, 1500, 12);
  makeSim(2, 13, 0.2, 2000, 12);
  makeSim(4, 14, 0.6, 4000, 20);
  makeSim(5, 15, 0.1, 1500, 14);
  for (let k = 0; k < 40; k++) advance(SIMS[0], 25); // fill the tracked particle's trail

  document.querySelectorAll('button.play').forEach(b => b.addEventListener('click', () => { const S = SIMS[b.dataset.sim]; S.playing = !S.playing; playLabels(); kick(); }));
  $('track0').addEventListener('click', () => { const S = SIMS[0]; S.track = (S.track + 37) % M.P.N; S.trail = []; for (let k = 0; k < 40; k++) advance(S, 25); draw0(); });
  $('h1').addEventListener('input', () => heaterChanged(1, num('h1')));
  $('h2').addEventListener('input', () => heaterChanged(2, num('h2')));
  $('reset2').addEventListener('click', () => { $('h2').value = '20'; makeSim(2, 13, 0.2, 2000, 12); SIMS[2].visible = true; playLabels(); draw2(); kick(); });
  $('t3').addEventListener('input', draw3);
  $('play3').addEventListener('click', () => animate('s3', 12000, p => { $('t3').value = String(Math.round(p * 310)); draw3(); }));
  $('h4').addEventListener('input', () => heaterChanged(4, num('h4')));
  $('lid4').addEventListener('click', () => { const S = SIMS[4]; S.sim.lid = !S.sim.lid; if (!S.playing) advance(S, 3000); draw4(); kick(); });
  $('reset4').addEventListener('click', () => { const lid = SIMS[4].sim.lid; makeSim(4, 14, num('h4') / 100, 4000, 20); SIMS[4].visible = true; SIMS[4].sim.lid = lid; playLabels(); draw4(); kick(); });
  $('h5').addEventListener('input', () => { if (s5.cycle) endCycle(); heaterChanged(5, num('h5')); });
  $('cycle5').addEventListener('click', () => {
    const S = SIMS[5]; s5.cycle = { t0: S.sim.t }; s5.seq = [M.stateOf(S.sim)]; $('cycle5').disabled = true;
    if (!S.playing) { while (s5.cycle) advance(S, 50); }
    draw5(); kick();
  });
  document.querySelectorAll('.quiz').forEach(q => q.querySelector('button.check').addEventListener('click', () => {
    const n = q.dataset.quiz, choice = q.querySelector('input:checked'), ok = !!choice && choice.value === q.dataset.answer, fb = q.querySelector('.quiz-feedback');
    fb.textContent = t(ok ? `q${n}ok` : `q${n}no`); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  }));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const vio = new IntersectionObserver(es => es.forEach(e => { const S = SIMS[e.target.dataset.step]; if (S) S.visible = e.isIntersecting; }), { rootMargin: '0px' });
    steps.forEach(s => vio.observe(s));
  } else Object.values(SIMS).forEach(S => { S.visible = true; });
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  window.refreshParticles = refresh;
  refresh(); kick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
