'use strict';
// Dissolution & saturation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, bar, curve and readout comes from window.SOL_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrunk to fit), axis ticks, formula labels in reserved slots and bar percentages;
// legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SOL_MODEL;
const I = window.SOL_I18N;
const t = (...a) => I.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#6b7c92', ghost: '#8696aa', water: '#163b5a', solid: '#e9e4d4' };
const SUBCOL = { NaCl: C.cyan, KNO3: C.orange, CaOH2: C.green };
const FORMULA = { NaCl: 'NaCl', KNO3: 'KNO₃', CaOH2: 'Ca(OH)₂' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => M.trim(M.fix(v, d));

Object.assign(I.STATIC_PARAMS, {
  Tall: fmt(M.dissolveAllT('KNO3', 60), 0),
  cross: fmt(M.crossing('KNO3', 'NaCl'), 0),
  k0: fmt(M.S('KNO3', 80), 0), n0: fmt(M.S('NaCl', 80), 1),
  kp20: fmt(M.crystallise('KNO3', 80, 100, 20, 0).share * 100, 0), np20: fmt(M.crystallise('NaCl', 80, 100, 20, 0).share * 100, 0),
  wk: fmt(M.mix('KNO3', 20, 25, 100).fraction * 100, 0), wc: fmt(M.mix('CaOH2', 20, 1, 100).fraction * 100, 2)
});

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
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, X, Y, maxW) => fitText(ctx, text, X, Y, maxW);
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const q of o.yTicks || []) {
    const v = typeof q === 'number' ? q : q.v, s = typeof q === 'number' ? fmt(q, 2) : q.s;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l + 1, y(v)); ctx.lineTo(P.r - 1, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(s, P.l - 6, y(v) + 4);
  }
  for (const q of o.xTicks || []) {
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(q.v), P.b); ctx.lineTo(x(q.v), P.b + 4); ctx.stroke();
    const w = ctx.measureText(q.s).width, X = Math.min(W - 3 - w / 2, Math.max(3 + w / 2, x(q.v)));
    ctx.textAlign = 'center'; ctx.fillText(q.s, X, P.b + 16);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function xticks(lo, hi, px, steps, minPx = 34, f = v => fmt(v, 2)) {
  let step = steps[steps.length - 1];
  for (const s of steps) if (s / (hi - lo) * px >= minPx) { step = s; break; }
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push({ v, s: f(v) });
  return out;
}
function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = color; ctx.fill(); ctx.restore(); }
// Stable pseudo-random positions for drawn dots (index → [0, 1)²).
const hash = i => { let a = (i + 1) * 2654435761 >>> 0; a ^= a >>> 15; a = Math.imul(a, 2246822519) >>> 0; a ^= a >>> 13; return (a >>> 0) / 4294967296; };
// A beaker with water up to `level` (0..1 of its height), `dots` dissolved dots and a solid pile of `pile` px².
function beaker(ctx, x0, y0, bw, bh, level, dots, pile, dotColor = C.cyan) {
  const wy = y0 + bh * (1 - level);
  ctx.fillStyle = C.water; ctx.fillRect(x0, wy, bw, y0 + bh - wy);
  // solid pile: a low mound centred on the floor
  if (pile > 0.5) {
    const h = Math.min(bh * level * 0.7, Math.sqrt(pile) * 0.55), w = Math.min(bw - 8, pile / Math.max(1, h) * 1.4);
    ctx.fillStyle = C.solid; ctx.beginPath(); ctx.moveTo(x0 + bw / 2 - w / 2, y0 + bh); ctx.quadraticCurveTo(x0 + bw / 2, y0 + bh - 2 * h, x0 + bw / 2 + w / 2, y0 + bh); ctx.fill();
  }
  ctx.fillStyle = dotColor;
  for (let i = 0; i < dots; i++) ctx.fillRect(x0 + 3 + hash(i) * (bw - 6), wy + 3 + hash(i + 7919) * (y0 + bh - wy - 6), 2.2, 2.2);
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 - 6); ctx.lineTo(x0, y0 + bh); ctx.lineTo(x0 + bw, y0 + bh); ctx.lineTo(x0 + bw, y0 - 6); ctx.stroke();
}
function setPressed(ids, on) { ids.forEach(id => $(id).setAttribute('aria-pressed', String(id === on))); }

/* ---------- step 0: add until it stops ---------- */
const s0 = { sub: 'NaCl' };
function draw0() {
  const m = num('m0'), w = num('w0'), r = M.mix(s0.sub, 20, m, w), S = M.S(s0.sub, 20);
  $('m0v').textContent = m + ' g'; $('w0v').textContent = w + ' g';
  setPressed(['sub0NaCl', 'sub0KNO3'], 'sub0' + s0.sub);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0'), 8, 17, W - 16);
  const bw = Math.min(220, W * 0.5), bh = 250, gap = 48, total = bw + gap + 26, x0 = (W - total) / 2 - 12, y0 = 48;
  beaker(ctx, x0, y0, bw, bh, w / 220, Math.round(r.dissolved * 3), r.solid * 70);
  // mass scale: 0..100 g, cyan = dissolved, white = left at the bottom, dashed = capacity
  const bx = x0 + bw + gap, top = y0, bot = y0 + bh, gy = g => bot - (bot - top) * g / 100;
  ctx.strokeStyle = C.axis; ctx.strokeRect(bx, top, 22, bh);
  ctx.fillStyle = C.cyan; ctx.fillRect(bx + 1, gy(r.dissolved), 20, bot - gy(r.dissolved));
  if (r.solid > 0) { ctx.fillStyle = C.solid; ctx.fillRect(bx + 1, gy(m), 20, gy(r.dissolved) - gy(m)); }
  line(ctx, [[bx - 6, gy(Math.min(100, r.cap))], [bx + 28, gy(Math.min(100, r.cap))]], C.text, 1.6, [4, 3]);
  ctx.save(); ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'left';
  [0, 50, 100].forEach(g => ctx.fillText(g + ' g', bx + 28, gy(g) + 4)); ctx.restore();
  const state = r.solid > 1e-9 ? t('s0sat') : r.saturated ? t('s0exact') : t('s0unsat', { more: fmt(r.cap - m, 1) });
  $('r0').textContent = t('s0readout', { sub: t('nm' + s0.sub), S: fmt(S, 1), w, cap: fmt(r.cap, 1), m, d: fmt(r.dissolved, 1), s: fmt(r.solid, 1), state });
}

/* ---------- step 1: dynamic equilibrium (seeded particle model) ---------- */
const TEND = 90, SPEED = 3;
const s1 = { sim: null, playing: false, raf: null, last: 0, grams: 48 };
function newSim() { s1.sim = M.makeSim(num('m1')); s1.grams = num('m1'); }
function draw1() {
  const sim = s1.sim; $('m1v').textContent = num('m1') + ' g';
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 17, W - 16);
  // beaker with particles
  const bw = Math.min(360, W - 40), x0 = (W - bw) / 2, y0 = 34, bh = 150, ph = reduceMotion() ? 0 : performance.now() / 1000;
  ctx.fillStyle = C.water; ctx.fillRect(x0, y0 + 10, bw, bh - 10);
  sim.dis.forEach(p => {
    const jx = 3 * Math.sin(ph * 2 + p.id), jy = 3 * Math.cos(ph * 1.7 + p.id * 1.3);
    ctx.fillStyle = p.tag ? C.pink : C.cyan;
    ctx.fillRect(x0 + 4 + (p.x !== undefined ? p.x : hash(p.id)) * (bw - 12) + jx, y0 + 14 + (p.y !== undefined ? p.y : hash(p.id + 99)) * (bh - 44) + jy, p.tag ? 3.5 : 2.4, p.tag ? 3.5 : 2.4);
  });
  const sq = 4, cols = Math.max(8, Math.floor((bw - 20) / (sq + 1)));
  sim.solid.forEach((p, i) => { const c = i % cols, rr = Math.floor(i / cols); ctx.fillStyle = p.tag ? C.pink : C.solid; ctx.fillRect(x0 + bw / 2 - cols * (sq + 1) / 2 + c * (sq + 1), y0 + bh - 2 - (rr + 1) * (sq + 1), sq, sq); });
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + bh); ctx.lineTo(x0 + bw, y0 + bh); ctx.lineTo(x0 + bw, y0); ctx.stroke();
  // dissolved mass vs time
  const xt = xticks(0, TEND, W - 52, [10, 15, 30], 30, v => fmt(v, 0));
  const A = panel(ctx, W, { top: 222, bottom: 330, xMin: 0, xMax: TEND, yMin: 0, yMax: 60, yTicks: [0, 20, 40, 60].map(v => ({ v, s: String(v) })), xTicks: xt, title: t('c1b') });
  line(ctx, [[A.P.l, A.y(M.P.CAP * M.P.GRAM)], [A.P.r, A.y(M.P.CAP * M.P.GRAM)]], C.ghost, 1.2, [5, 4]);
  line(ctx, [[A.x(0), A.y(0)]].concat(sim.hist.map(h => [A.x(h.t), A.y(h.dissolved)])), C.text, 2);
  // rates
  const rs = M.smoothRates(sim).filter(q => q.t >= 1); // the first second is too short to average
  const B = panel(ctx, W, { top: 376, bottom: H - 28, xMin: 0, xMax: TEND, yMin: 0, yMax: 6, yTicks: [0, 2, 4, 6].map(v => ({ v, s: String(v) })), xTicks: xt, title: t('c1c') });
  line(ctx, rs.map(q => [B.x(q.t), B.y(Math.min(6, q.d))]), C.cyan, 2);
  line(ctx, rs.map(q => [B.x(q.t), B.y(Math.min(6, q.c))]), C.orange, 2);
  // readout
  const d = sim.dis.length * M.P.GRAM, s = sim.solid.length * M.P.GRAM, last = rs[rs.length - 1] || { d: 0, c: 0 };
  const prog = s1.playing ? t('s1run') : sim.t >= TEND - 1e-9 ? t('s1end', { T: TEND }) : t('s1pause');
  const cap = M.P.CAP * M.P.GRAM;
  // once the dissolved mass has reached the limit with solid still present, the solution stays saturated
  const reached = sim.hist.some(h => h.dissolved >= cap - 1e-9);
  const state = !sim.solid.length ? t('s1gone', { more: fmt(Math.max(0, cap - d), 1) }) : reached ? t('s1sat') : t('s1grow');
  const ti = sim.dis.filter(p => p.tag).length, ts = sim.solid.filter(p => p.tag).length;
  $('r1').textContent = t('s1readout', { prog, t: fmt(sim.t, 1), d: fmt(d, 1), s: fmt(s, 1), rd: fmt(last.d, 2), rc: fmt(last.c, 2), state, tag: ti + ts ? t('s1tag', { ti, ts }) : '' });
  $('tag1').disabled = sim.t >= TEND - 1e-9;
}
function loop1(now) {
  s1.raf = null;
  if (!s1.playing) return;
  if (document.hidden) { s1.playing = false; draw1(); return; }
  const dt = Math.min(0.1, (now - s1.last) / 1000); s1.last = now;
  const target = Math.min(TEND, s1.sim.t + dt * SPEED);
  s1.sim.run(target);
  if (s1.sim.t >= TEND - 1e-9) s1.playing = false;
  draw1();
  if (s1.playing) s1.raf = requestAnimationFrame(loop1);
}
function play1() {
  if (s1.sim.t >= TEND - 1e-9) newSim();
  if (reduceMotion()) { s1.sim.run(TEND); s1.playing = false; draw1(); return; }
  s1.playing = true; s1.last = performance.now(); if (!s1.raf) s1.raf = requestAnimationFrame(loop1);
}
function pause1() { s1.playing = false; if (s1.raf) { cancelAnimationFrame(s1.raf); s1.raf = null; } draw1(); }

/* ---------- step 2: heating ---------- */
const s2 = { sub: 'KNO3', hist: { KNO3: new Set([20]), NaCl: new Set() } };
function draw2() {
  const T = num('t2'), sub = s2.sub, r = M.mix(sub, T, 60, 100);
  $('t2v').textContent = T + ' °C'; setPressed(['sub2NaCl', 'sub2KNO3'], 'sub2' + sub);
  s2.hist[sub].add(T);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 17, W - 16);
  const bw = Math.min(200, W * 0.5);
  beaker(ctx, (W - bw) / 2, 36, bw, 96, 0.82, Math.round(r.dissolved * 2), r.solid * 30, SUBCOL[sub]);
  const m = panel(ctx, W, { top: 178, bottom: H - 28, left: 44, xMin: 0, xMax: 100, yMin: 0, yMax: 260, yTicks: [0, 50, 100, 150, 200, 250].map(v => ({ v, s: String(v) })), xTicks: xticks(0, 100, W - 56, [10, 20, 25, 50], 30, v => fmt(v, 0)), title: t('c2b') });
  line(ctx, [[m.P.l, m.y(60)], [m.P.r, m.y(60)]], C.ghost, 1.2, [5, 4]);
  ['NaCl', 'KNO3'].forEach(k => {
    const pts = []; for (let q = 0; q <= 100; q++) pts.push([m.x(q), m.y(M.S(k, q))]);
    line(ctx, pts, SUBCOL[k], k === sub ? 2.6 : 1.6, null, k === sub ? 1 : 0.6);
  });
  fitText(ctx, 'KNO₃', m.x(86) - 6, m.y(M.S('KNO3', 86)) - 2, 60, { size: 12, weight: 700, color: C.orange, align: 'right' });
  fitText(ctx, 'NaCl', m.P.r - 4, m.y(M.S('NaCl', 100)) + 16, 60, { size: 12, weight: 700, color: C.cyan, align: 'right' });
  [...s2.hist[sub]].forEach(v => { if (v !== T) dot(ctx, m.x(v), m.y(M.S(sub, v)), 3.2, C.text); });
  line(ctx, [[m.x(T), m.P.b], [m.x(T), m.y(M.S(sub, T))]], C.text, 1, [3, 3], 0.6);
  dot(ctx, m.x(T), m.y(M.S(sub, T)), 6, SUBCOL[sub]);
  const extra = sub === 'KNO3' ? t('s2extraK') : t('s2extraN');
  $('r2').textContent = t('s2readout', { sub: t('nm' + sub), T, S: fmt(r.cap, 1), d: fmt(r.dissolved, 1), s: fmt(r.solid, 1), extra });
}

/* ---------- step 3: saturated vs concentrated ---------- */
const s3 = { sub: 'NaCl' };
function draw3() {
  const m = num('m3'), T = num('t3'), sub = s3.sub, r = M.mix(sub, T, m, 100);
  $('m3v').textContent = m + ' g'; $('t3v').textContent = T + ' °C';
  setPressed(['sub3NaCl', 'sub3KNO3', 'sub3CaOH2'], 'sub3' + sub);
  const { ctx, W, H } = fitCanvas($('c3'));
  const P = panel(ctx, W, { top: 30, bottom: H - 28, xMin: 0, xMax: 120, yMin: 0, yMax: 75, yTicks: [0, 25, 50, 75].map(v => ({ v, s: v + '%' })), xTicks: xticks(0, 120, W - 52, [10, 20, 30, 60], 30, v => fmt(v, 0)), title: t('c3') });
  ['CaOH2', 'NaCl', 'KNO3'].forEach(k => {
    const pts = []; for (let q = 0; q <= 240; q++) { const mm = q / 2; pts.push([P.x(mm), P.y(M.mix(k, T, mm, 100).fraction * 100)]); }
    line(ctx, pts, SUBCOL[k], k === sub ? 2.8 : 1.6, null, k === sub ? 1 : 0.55);
  });
  dot(ctx, P.x(m), P.y(r.fraction * 100), 6.5, C.text);
  $('r3').textContent = t('s3readout', { sub: t('nm' + sub), T, m, d: fmt(r.dissolved, r.dissolved < 1 ? 3 : 1), sol: fmt(r.solution, r.dissolved < 1 ? 3 : 1), w: fmt(r.fraction * 100, r.fraction < 0.01 ? 3 : 1), state: t(r.saturated ? 's3sat' : 's3unsat'), wmax: fmt(r.satFraction * 100, r.satFraction < 0.01 ? 3 : 1) });
}

/* ---------- step 4: getting the solute back ---------- */
function draw4() {
  const T = num('t4'), e = num('e4'), k = M.crystallise('KNO3', 80, 100, T, e), n = M.crystallise('NaCl', 80, 100, T, e);
  $('t4v').textContent = T + ' °C'; $('e4v').textContent = e + ' g';
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 17, W - 16);
  const bw = Math.min(150, (W - 60) / 2), gap = Math.min(80, W - 2 * bw - 32), xs = [(W - 2 * bw - gap) / 2, (W + gap) / 2];
  [[k, 'KNO3'], [n, 'NaCl']].forEach(([q, sub], i) => {
    fitText(ctx, FORMULA[sub], xs[i] + bw / 2, 44, bw, { size: 13, weight: 700, color: SUBCOL[sub], align: 'center' });
    beaker(ctx, xs[i], 62, bw, 160, 0.85 * q.wLeft / 100, Math.round(q.keep * 0.9), q.out * 28, SUBCOL[sub]);
  });
  // bars: share of the original solute still dissolved vs crystallised
  title(ctx, t('c4b'), 8, 270, W - 16);
  const L = 58, R = W - 54;
  [[k, 'KNO3'], [n, 'NaCl']].forEach(([q, sub], i) => {
    const Y = 290 + i * 46;
    fitText(ctx, FORMULA[sub], 8, Y + 15, L - 12, { size: 12, weight: 700, color: SUBCOL[sub] });
    const split = L + (R - L) * (1 - q.share);
    ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.8; ctx.fillRect(L, Y, split - L, 22); ctx.globalAlpha = 1;
    ctx.fillStyle = C.orange; ctx.fillRect(split, Y, R - split, 22);
    fitText(ctx, fmt(q.share * 100, 0) + '%', R + 6, Y + 15, W - R - 8, { size: 12, weight: 600, color: C.orange });
  });
  $('r4').textContent = t('s4readout', { T, e, wl: 100 - e, k: fmt(k.out, 1), kp: fmt(k.share * 100, 0), n: fmt(n.out, 1), np: fmt(n.share * 100, 0) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  [['sub0NaCl', 'NaCl'], ['sub0KNO3', 'KNO3']].forEach(([id, s]) => $(id).addEventListener('click', () => { s0.sub = s; draw0(); }));
  ['m0', 'w0'].forEach(id => $(id).addEventListener('input', draw0));

  newSim(); s1.sim.run(TEND); // arrive showing one finished run
  $('run1').addEventListener('click', () => (s1.playing ? pause1() : play1()));
  $('reset1').addEventListener('click', () => { pause1(); newSim(); draw1(); });
  $('m1').addEventListener('input', () => { pause1(); newSim(); draw1(); });
  $('tag1').addEventListener('click', () => { if (s1.sim.t < TEND) { s1.sim.addTagged(3); if (!s1.playing) play1(); else draw1(); } });

  [['sub2NaCl', 'NaCl'], ['sub2KNO3', 'KNO3']].forEach(([id, s]) => $(id).addEventListener('click', () => { s2.sub = s; draw2(); }));
  $('t2').addEventListener('input', draw2);
  [['sub3NaCl', 'NaCl'], ['sub3KNO3', 'KNO3'], ['sub3CaOH2', 'CaOH2']].forEach(([id, s]) => $(id).addEventListener('click', () => { s3.sub = s; draw3(); }));
  ['m3', 't3'].forEach(id => $(id).addEventListener('input', draw3));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  ['t4', 'e4'].forEach(id => $(id).addEventListener('input', draw4));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    // pause the particle model when its section scrolls away
    new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && s1.playing) pause1(); })).observe($('c1'));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && s1.playing) pause1(); });
  window.refreshSolution = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
