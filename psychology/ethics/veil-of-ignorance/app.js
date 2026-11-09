'use strict';
// Veil of ignorance lesson. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// Scores, averages, minima, certainty equivalents and best t all come from VEIL (sim-core.js).
(function () {

const $ = id => document.getElementById(id);
const V = window.VEIL, SOC = V.SOCIETIES, KEYS = ['A', 'B', 'C'];
const t = (...a) => window.VEIL_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', text: '#e8edf4', bg: '#0d1621' };
const COL = { A: C.green, B: C.orange, C: C.cyan };
const num = id => Number($(id).value);
const f = (v, d = 1) => Number(v).toFixed(d);
// Draw records are kept per society, so switching society never silently discards what the learner drew.
const state = { soc0: null, draws0: { A: [], B: [], C: [] }, last0: { A: null, B: null, C: null }, rnd0: V.drawer(11), soc1: 'B', runs: { A: [], B: [], C: [] }, rnd1: V.drawer(29) };
const draws = () => state.soc0 ? state.draws0[state.soc0] : [];

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
function label(ctx, text, X, Y, color = C.text, align = 'left', size = 12) {
  ctx.save(); ctx.font = size + 'px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore();
}

// Three small bar groups (one per society) sharing a 0..100 score axis.
function societyBars(ctx, W, H, { highlight = null, dots = null, worstBox = false, bottom = 30 }) {
  const P = { l: 34, r: W - 8, t: 24, b: H - bottom };
  const y = v => P.b - v / 100 * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = 0; v <= 100; v += 25) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); label(ctx, String(v), P.l - 5, y(v) + 4, C.muted, 'right', 10); }
  const gw = (P.r - P.l) / 3;
  KEYS.forEach((k, gi) => {
    const xs = SOC[k], gx = P.l + gi * gw + 8, bw = (gw - 16) / 5;
    const dim = highlight && highlight !== k;
    // Full society name only when it fits its column; otherwise the letter (the buttons below carry the names).
    ctx.font = '11px system-ui,sans-serif';
    const name = ctx.measureText(t('soc' + k)).width <= gw - 12 ? t('soc' + k) : k;
    label(ctx, name, gx, P.t - 8, dim ? C.muted : COL[k], 'left', 11);
    const lo = V.min(xs);
    xs.forEach((v, i) => {
      ctx.globalAlpha = dim ? 0.3 : 1; ctx.fillStyle = COL[k];
      ctx.fillRect(gx + i * bw + 2, y(v), bw - 4, P.b - y(v)); ctx.globalAlpha = 1;
      if (worstBox && v === lo && i === xs.indexOf(lo)) { ctx.strokeStyle = C.pink; ctx.lineWidth = 2.5; ctx.strokeRect(gx + i * bw, y(v) - 4, bw, P.b - y(v) + 4); label(ctx, String(v), gx + i * bw + bw / 2, y(v) - 8, C.pink, 'center', 11); }
      if (dots && highlight === k) {
        const n = dots[i] || 0;
        if (n) label(ctx, '●×' + n, gx + i * bw + bw / 2, P.b + 16, C.text, 'center', 10);
      }
    });
    const m = V.mean(xs);
    ctx.save(); ctx.globalAlpha = dim ? 0.3 : 1; ctx.strokeStyle = C.text; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(gx, y(m)); ctx.lineTo(gx + 5 * bw, y(m)); ctx.stroke(); ctx.restore();
  });
  return { y, P, gw };
}

/* ---------- step 0: choose, then draw ---------- */
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  const counts = [0, 0, 0, 0, 0]; draws().forEach(d => counts[d.pos]++);
  const last = state.soc0 ? state.last0[state.soc0] : null;
  const m = societyBars(ctx, W, H, { highlight: state.soc0, dots: counts });
  if (last) {
    const gi = KEYS.indexOf(state.soc0), bw = (m.gw - 16) / 5, gx = m.P.l + gi * m.gw + 8, v = SOC[state.soc0][last.pos];
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.strokeRect(gx + last.pos * bw, m.y(v) - 2, bw, m.P.b - m.y(v) + 2);
    label(ctx, '★', gx + last.pos * bw + bw / 2, m.y(v) - 6, C.text, 'center', 14);
  }
  document.querySelectorAll('[data-soc]').forEach(b => { b.classList.toggle('primary', b.dataset.soc === state.soc0); b.setAttribute('aria-pressed', String(b.dataset.soc === state.soc0)); });
  $('lift').disabled = !state.soc0;
  const name = state.soc0 ? t('soc' + state.soc0) : '';
  if (!state.soc0) $('r0').textContent = t('s0pick');
  else if (!last) $('r0').textContent = t('s0ready', { soc: name });
  else {
    const vals = draws().map(d => SOC[state.soc0][d.pos]);
    $('r0').textContent = t('s0readout', { soc: name, pos: last.pos + 1, v: SOC[state.soc0][last.pos], n: vals.length, avg: f(V.mean(vals)), worst: Math.min(...vals) });
  }
}

/* ---------- step 1: running average ---------- */
function draw1() {
  const xs = SOC[state.soc1], mu = V.mean(xs);
  const { ctx, W, H } = fitCanvas($('c1'));
  const run = state.runs[state.soc1];
  const P = { l: 40, r: W - 12, t: 14, b: H - 30 }, n = run.length, N = Math.max(100, n);
  const x = i => P.l + i / N * (P.r - P.l), y = v => P.b - v / 100 * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = 0; v <= 100; v += 25) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); label(ctx, String(v), P.l - 5, y(v) + 4, C.muted, 'right', 10); }
  label(ctx, '0', P.l, P.b + 14, C.muted, 'center', 10); label(ctx, String(N), P.r, P.b + 14, C.muted, 'right', 10);
  // individual draws as faint dots, running average as the line
  let sum = 0; const avg = [];
  run.forEach((v, i) => { sum += v; avg.push(sum / (i + 1)); ctx.fillStyle = 'rgba(154,170,189,.35)'; ctx.fillRect(x(i + 1) - 1, y(v) - 1, 2, 2); });
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(P.l, y(mu)); ctx.lineTo(P.r, y(mu)); ctx.stroke(); ctx.restore();
  label(ctx, t('mean') + ' ' + f(mu), P.r - 4, y(mu) - 6, C.text, 'right', 11);
  if (n) { ctx.strokeStyle = COL[state.soc1]; ctx.lineWidth = 2.4; ctx.beginPath(); avg.forEach((a, i) => i ? ctx.lineTo(x(i + 1), y(a)) : ctx.moveTo(x(1), y(a))); ctx.stroke(); }
  document.querySelectorAll('[data-soc1]').forEach(b => { b.classList.toggle('primary', b.dataset.soc1 === state.soc1); b.setAttribute('aria-pressed', String(b.dataset.soc1 === state.soc1)); });
  $('r1').textContent = t('s1readout', { soc: t('soc' + state.soc1), mean: f(mu), n, run: n ? f(avg[n - 1], 2) : '—' });
}

/* ---------- step 2: maximin ---------- */
function draw2() {
  const { ctx, W, H } = fitCanvas($('c2'));
  societyBars(ctx, W, H, { worstBox: true });
  $('r2').textContent = t('s2readout', { a: V.min(SOC.A), b: V.min(SOC.B), c: V.min(SOC.C), win: V.choose.maximin(SOC).k, avgWin: V.choose.average(SOC).k });
}

/* ---------- step 3: risk attitude ---------- */
function draw3() {
  const eta = num('e3'); $('e3v').textContent = f(eta, 2);
  let { ctx, W, H } = fitCanvas($('c3'));
  const P = { l: 34, r: W - 10, t: 22, b: H - 30 }, y = v => P.b - v / 50 * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = 0; v <= 50; v += 10) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); label(ctx, String(v), P.l - 5, y(v) + 4, C.muted, 'right', 10); }
  // Societies whose certainty equivalents are equal at display precision are shown as a tie,
  // so the readout never names one winner next to two identical numbers (e.g. A and C at η = 3.50).
  const best = f(Math.max(...KEYS.map(k => V.ce(SOC[k], eta)))), tops = KEYS.filter(k => f(V.ce(SOC[k], eta)) === best);
  const isWin = k => tops.includes(k), win = tops.length > 1 ? tops.join(' / ') + t('tieMark') : tops[0], bw = (P.r - P.l) / 3;
  KEYS.forEach((k, i) => {
    const v = V.ce(SOC[k], eta), X = P.l + i * bw + bw * 0.2;
    ctx.globalAlpha = isWin(k) ? 1 : 0.45; ctx.fillStyle = COL[k]; ctx.fillRect(X, y(v), bw * 0.6, P.b - y(v)); ctx.globalAlpha = 1;
    label(ctx, f(v), X + bw * 0.3, y(v) - 6, COL[k], 'center', 12);
    label(ctx, k + (isWin(k) ? ' ✓' : ''), X + bw * 0.3, P.b + 16, COL[k], 'center', 12);
    ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X, y(V.mean(SOC[k]))); ctx.lineTo(X + bw * 0.6, y(V.mean(SOC[k]))); ctx.moveTo(X, y(V.min(SOC[k]))); ctx.lineTo(X + bw * 0.6, y(V.min(SOC[k]))); ctx.stroke(); ctx.restore();
  });
  label(ctx, t('ceAxis'), P.l + 4, P.t - 8, C.muted, 'left', 11);
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const Q = { l: 34, r: W - 10, t: 14, b: H - 30 }, x2 = e => Q.l + e / 8 * (Q.r - Q.l), y2 = v => Q.b - v / 50 * (Q.b - Q.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = 0; v <= 50; v += 10) { ctx.beginPath(); ctx.moveTo(Q.l, y2(v)); ctx.lineTo(Q.r, y2(v)); ctx.stroke(); label(ctx, String(v), Q.l - 5, y2(v) + 4, C.muted, 'right', 10); }
  for (let e = 0; e <= 8; e += 2) label(ctx, String(e), x2(e), Q.b + 14, C.muted, 'center', 10);
  label(ctx, t('etaAxis'), Q.r, Q.b + 26, C.muted, 'right', 11);
  KEYS.forEach(k => { ctx.strokeStyle = COL[k]; ctx.lineWidth = 2; ctx.beginPath(); for (let e = 0; e <= 8.001; e += 0.05) { const Y = y2(V.ce(SOC[k], +e.toFixed(2))); e === 0 ? ctx.moveTo(x2(e), Y) : ctx.lineTo(x2(e), Y); } ctx.stroke(); label(ctx, k, Q.r - 4, y2(V.ce(SOC[k], 8)) - 5, COL[k], 'right', 11); });
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x2(eta), Q.t); ctx.lineTo(x2(eta), Q.b); ctx.stroke();
  $('r3').textContent = t('s3readout', { eta: f(eta, 2), a: f(V.ce(SOC.A, eta)), b: f(V.ce(SOC.B, eta)), c: f(V.ce(SOC.C, eta)), win });
}

/* ---------- step 4: redistribution ---------- */
function draw4() {
  const tt = num('t4'), k = num('k4'), eta = num('e4');
  $('t4v').textContent = f(tt, 2); $('k4v').textContent = f(k, 2); $('e4v').textContent = f(eta, 2);
  const x0 = SOC.B, ys = V.redistribute(x0, tt, k);
  const lines = [['mean', V.mean, C.text], ['worst', V.min, C.pink], ['ceShort', xs => V.ce(xs, eta), C.cyan]];
  const bests = lines.map(([, fn]) => V.bestT(x0, k, fn));
  // A line that is flat in t (the average when k = 0) has no single best t: report a tie instead of t = 0.
  const flat = lines.map(([, fn]) => { let lo = Infinity, hi = -Infinity; for (let s = 0; s <= 100; s++) { const v = fn(V.redistribute(x0, s / 100, k)); lo = Math.min(lo, v); hi = Math.max(hi, v); } return hi - lo < 1e-9; });
  const bestText = i => flat[i] ? t('anyT') : f(bests[i].t, 2);
  let { ctx, W, H } = fitCanvas($('c4'));
  const P = { l: 34, r: W - 10, t: 14, b: H - 30 }, x = v => P.l + v * (P.r - P.l), y = v => P.b - v / 50 * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = 0; v <= 50; v += 10) { ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); label(ctx, String(v), P.l - 5, y(v) + 4, C.muted, 'right', 10); }
  for (let v = 0; v <= 1.001; v += 0.25) label(ctx, v.toFixed(2), x(v), P.b + 14, C.muted, 'center', 10);
  label(ctx, t('tAxis'), P.r, P.b + 26, C.muted, 'right', 11);
  const labelYs = []; // labels of lines that start at the same height (at η = 0 the CE equals the average)
  lines.forEach(([name, fn, color], i) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let s = 0; s <= 100; s++) { const v = fn(V.redistribute(x0, s / 100, k)); s ? ctx.lineTo(x(s / 100), y(v)) : ctx.moveTo(x(0), y(v)); }
    ctx.stroke();
    const b = bests[i]; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x(b.t), y(b.v), 5.5, 0, 7); ctx.fill();
    // A label that would sit on an earlier one (same start height) continues on the same line after it.
    const ly = y(fn(V.redistribute(x0, 0, k))) - 6, prev = labelYs.filter(l => Math.abs(l.y - ly) < 13);
    const lx = prev.length ? Math.max(...prev.map(l => l.x1)) + 8 : x(0) + 6;
    ctx.save(); ctx.font = '11px system-ui,sans-serif'; labelYs.push({ y: ly, x1: lx + ctx.measureText(t(name)).width }); ctx.restore();
    label(ctx, t(name), lx, ly, color, 'left', 11);
  });
  ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x(tt), P.t); ctx.lineTo(x(tt), P.b); ctx.stroke(); ctx.setLineDash([]);
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const Q = { l: 30, r: W - 10, t: 20, b: H - 30 }, yb = v => Q.b - v / 100 * (Q.b - Q.t), bw = (Q.r - Q.l) / 5;
  label(ctx, t('bars'), Q.l, Q.t - 6, C.muted, 'left', 11);
  for (let v = 0; v <= 100; v += 25) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(Q.l, yb(v)); ctx.lineTo(Q.r, yb(v)); ctx.stroke(); label(ctx, String(v), Q.l - 5, yb(v) + 4, C.muted, 'right', 10); }
  ys.forEach((v, i) => {
    ctx.fillStyle = 'rgba(255,180,84,.25)'; ctx.fillRect(Q.l + i * bw + 6, yb(x0[i]), bw - 12, Q.b - yb(x0[i]));
    ctx.fillStyle = C.orange; ctx.fillRect(Q.l + i * bw + 10, yb(v), bw - 20, Q.b - yb(v));
    label(ctx, f(v, 0), Q.l + i * bw + bw / 2, yb(v) - 5, C.text, 'center', 11);
  });
  $('r4').textContent = t('s4readout', { t: f(tt, 2), mean: f(V.mean(ys)), min: f(V.min(ys)), ce: f(V.ce(ys, eta)), tAvg: bestText(0), tMin: bestText(1), eta: f(eta, 2), tEta: bestText(2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }
window.refreshVeil = refresh;

function setup() {
  document.querySelectorAll('[data-soc]').forEach(b => b.addEventListener('click', () => { state.soc0 = b.dataset.soc; draw0(); }));
  $('lift').addEventListener('click', () => { if (!state.soc0) return; const pos = state.rnd0(); state.last0[state.soc0] = { pos }; state.draws0[state.soc0].push({ pos }); draw0(); });
  $('reset0').addEventListener('click', () => { if (!state.soc0) return; state.draws0[state.soc0] = []; state.last0[state.soc0] = null; draw0(); });
  document.querySelectorAll('[data-soc1]').forEach(b => b.addEventListener('click', () => { state.soc1 = b.dataset.soc1; draw1(); }));
  $('draw100').addEventListener('click', () => { const run = state.runs[state.soc1]; for (let i = 0; i < 100; i++) run.push(SOC[state.soc1][state.rnd1()]); if (run.length > 2000) state.runs[state.soc1] = run.slice(-2000); draw1(); });
  $('e3').addEventListener('input', draw3);
  ['t4', 'k4', 'e4'].forEach(id => $(id).addEventListener('input', draw4));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange;
  });
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
  steps.forEach(s => io.observe(s));
  window.addEventListener('resize', refresh);
  refresh();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
