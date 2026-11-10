'use strict';
// Nerve signals lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every trace, curve and readout comes from window.NEURO_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrink-to-fit), axis ticks and two side labels; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.NEURO_MODEL;
const t = (...a) => window.NEURO_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const ION_COL = { K: C.cyan, Na: C.orange };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const sgn = (v, d = 1) => (v > 0 ? '+' : '') + fmt(v, d);

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

// Panel title in its own row; the font shrinks until it fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

// A plot panel. xTicks / yTicks are [value, label] pairs; tick labels sit left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const [v, label] of o.yTicks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(label, P.l - 6, y(v) + 4);
  }
  // x labels: skip any label that would collide with the previous one
  let lastRight = -Infinity;
  ctx.textAlign = 'center';
  for (const [v, label] of o.xTicks) {
    const X = x(v), w = ctx.measureText(label).width;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b); ctx.stroke();
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
    let cx = Math.min(Math.max(X, P.l + w / 2), W - 2 - w / 2);
    if (cx - w / 2 < lastRight + 6) continue;
    ctx.fillText(label, cx, P.b + 15); lastRight = cx + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
const linTicks = (a, b, s, d = 0) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push([v, fmt(v, d)]); return out; };
const thinTicks = (ticks, px, minPx) => { const step = Math.max(1, Math.ceil(minPx / px)); return ticks.filter((_, i) => i % step === 0); };

function line(ctx, m, xs, ys, color, { lw = 2, alpha = 1, dash = null, clip = true } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  if (clip) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
  ctx.beginPath(); let started = false;
  for (let i = 0; i < xs.length; i++) {
    if (!isFinite(ys[i])) { started = false; continue; }
    const X = m.x(xs[i]), Y = m.y(ys[i]);
    if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
  }
  ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4], lw = 1.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore(); }
function vline(ctx, m, v, color, dash = [5, 4], lw = 1.4) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, color, { r = 5, hollow = false, ring = C.bg } = {}) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
  else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = ring; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
// Small upward triangles on the time axis marking stimulus onsets.
function stimMarks(ctx, m, times, color = C.orange) {
  ctx.save(); ctx.fillStyle = color;
  for (const s of times) { const X = m.x(s); if (X < m.P.l - 1 || X > m.P.r + 1) continue; ctx.beginPath(); ctx.moveTo(X, m.P.b - 9); ctx.lineTo(X - 5, m.P.b); ctx.lineTo(X + 5, m.P.b); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
const VTICKS = [[-80, '−80'], [-40, '−40'], [0, '0'], [40, '40']];
const minus = s => String(s).replace(/^-/, '−').replace(/ -/g, ' −');

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

/* ---------- background computation queue (chunked so the page never freezes) ---------- */
const jobs = [];
let jobTimer = null;
function enqueue(fn) { jobs.push(fn); if (!jobTimer) jobTimer = setTimeout(runJobs, 30); }
function runJobs() {
  const until = performance.now() + 14;
  while (jobs.length && performance.now() < until) { const more = jobs[0](); if (!more) jobs.shift(); }
  jobTimer = jobs.length ? setTimeout(runJobs, 0) : null;
}

/* ---------- step 0: one ion, Nernst ---------- */
const s0 = { ion: 'K', tried: [] };
const rnd = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
function draw0() {
  const o = num('o0'), i = num('i0'), ion = s0.ion, z = M.ION[ion].z, E = M.nernst(o, i, z), ratio = o / i;
  $('o0v').textContent = String(o); $('i0v').textContent = String(i);
  $('ionK').setAttribute('aria-pressed', ion === 'K'); $('ionNa').setAttribute('aria-pressed', ion === 'Na');
  $('sw0').style.background = ION_COL[ion]; $('lg0ion').textContent = t(ion === 'K' ? 'lgIonK' : 'lgIonNa');
  const { ctx, W, H } = fitCanvas($('c0'));
  // --- top: membrane picture ---
  title(ctx, t('c0top'), 8, 17, W - 16);
  const L = 8, R = W - 8, yo0 = 28, yo1 = 92, ym0 = 92, ym1 = 110, yi1 = 174;
  ctx.fillStyle = '#132131'; ctx.fillRect(L, yo0, R - L, yo1 - yo0);
  ctx.fillStyle = '#1a1f2e'; ctx.fillRect(L, ym1, R - L, yi1 - ym1);
  ctx.fillStyle = '#3a4a5e'; ctx.fillRect(L, ym0, R - L, ym1 - ym0);
  const chX = (L + R) / 2;
  ctx.fillStyle = C.bg; ctx.fillRect(chX - 7, ym0, 14, ym1 - ym0);
  ctx.strokeStyle = ION_COL[ion]; ctx.lineWidth = 2; ctx.strokeRect(chX - 7, ym0 + 1, 14, ym1 - ym0 - 2);
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left';
  const lo = t('outside'), li = t('inside'), labW = Math.max(ctx.measureText(lo).width, ctx.measureText(li).width) + 16;
  ctx.fillText(lo, L + 6, yo0 + 15); ctx.fillText(li, L + 6, yi1 - 7); ctx.restore();
  const dots = (conc, y0, y1, seed) => {
    const n = Math.max(1, Math.round(conc / 200 * 60));
    ctx.fillStyle = ION_COL[ion];
    for (let k = 0; k < n; k++) {
      const X = L + labW + 4 + rnd(seed + k) * (R - L - labW - 12), Y = y0 + 6 + rnd(seed + k + 500) * (y1 - y0 - 12);
      ctx.beginPath(); ctx.arc(X, Y, 3, 0, 7); ctx.fill();
    }
  };
  dots(o, yo0, yo1, 1); dots(i, ym1, yi1, 2000);
  // charge separation: + / − signs hugging the membrane, count ∝ |E|
  const nSign = Math.round(Math.min(1, Math.abs(E) / 120) * 9);
  if (nSign > 0) {
    ctx.save(); ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'center';
    const span = R - L - labW - 20;
    for (let k = 0; k < nSign; k++) {
      const X = L + labW + 10 + (k + 0.5) / nSign * span;
      if (Math.abs(X - chX) < 14) continue;
      ctx.fillStyle = E < 0 ? C.pink : C.cyan; ctx.fillText(E < 0 ? '+' : '−', X, ym0 - 3);
      ctx.fillStyle = E < 0 ? C.cyan : C.pink; ctx.fillText(E < 0 ? '−' : '+', X, ym1 + 12);
    }
    ctx.restore();
  }
  // --- bottom: E against the ratio on a log axis ---
  const xt = [[-2, '0.01'], [-1, '0.1'], [0, '1'], [1, '10'], [2, '100']];
  const m = panel(ctx, W, { top: 216, bottom: H - 26, xMin: -2.4, xMax: 2.4, yMin: -150, yMax: 150, yTicks: [[-120, '−120'], [-60, '−60'], [0, '0'], [60, '60'], [120, '120']], xTicks: xt, title: t('c0bot') });
  line(ctx, m, [-2.4, 2.4], [-2.4 * M.SLOPE10, 2.4 * M.SLOPE10], C.ghost, { lw: 1.5, dash: [6, 4] });
  for (const q of s0.tried) dot(ctx, m.x(q.lr), m.y(q.E), C.ghost, { r: 3.5 });
  dot(ctx, m.x(Math.log10(ratio)), m.y(E), C.text, { r: 6, ring: ION_COL[ion] });
  const key = ion + o + '/' + i;
  if (!s0.tried.some(q => q.key === key)) { s0.tried.push({ key, lr: Math.log10(ratio), E }); if (s0.tried.length > 60) s0.tried.shift(); }
  const ionName = ion === 'K' ? 'K⁺' : 'Na⁺', r = fmt(ratio, ratio < 0.1 ? 4 : 3);
  if (o === i) $('r0').textContent = t('s0zero', { ion: ionName, o, i });
  else $('r0').textContent = minus(t('s0readout', { ion: ionName, o, i, r, E: sgn(E, 1), abs: fmt(Math.abs(E), 1), dir: t(E < 0 ? 'dirNeg' : 'dirPos') }));
}
function pickIon(ion) {
  s0.ion = ion; $('o0').value = M.ION[ion].out; $('i0').value = M.ION[ion].in; draw0();
}

/* ---------- step 1: resting potential (GHK) ---------- */
const s1 = { tried: new Set([5]) };
function draw1() {
  const lp = num('p1'), p = Number(Math.pow(10, lp).toPrecision(2)), ko = num('k1');
  s1.tried.add(ko);
  $('p1v').textContent = fmt(p, p < 0.01 ? 4 : p < 0.1 ? 3 : 2); $('k1v').textContent = fmt(ko, 1);
  const EK = M.nernst(ko, M.ION.K.in), ENa = M.nernst(M.ION.Na.out, M.ION.Na.in), V = M.ghk(p, ko);
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: -3, xMax: 0, yMin: -125, yMax: 80, left: 44,
    yTicks: [[-120, '−120'], [-90, '−90'], [-60, '−60'], [-30, '−30'], [0, '0'], [30, '30'], [60, '60']],
    xTicks: [[-3, '0.001'], [-2, '0.01'], [-1, '0.1'], [0, '1']], title: t('c1') });
  const xs = []; for (let v = -3; v <= 0.0001; v += 0.02) xs.push(v);
  for (const k of s1.tried) if (k !== ko) line(ctx, m, xs, xs.map(v => M.ghk(Math.pow(10, v), k)), C.green, { lw: 1.4, alpha: 0.28 });
  hline(ctx, m, EK, C.cyan); hline(ctx, m, ENa, C.orange);
  line(ctx, m, xs, xs.map(v => M.ghk(Math.pow(10, v), ko)), C.green, { lw: 2.6 });
  dot(ctx, m.x(Math.log10(p)), m.y(V), C.text, { r: 6, ring: C.green });
  const pct = (V - EK) / (ENa - EK) * 100;
  $('r1').textContent = minus(t('s1readout', { p: $('p1v').textContent, ko: fmt(ko, 1), ek: fmt(EK, 1), ena: sgn(ENa, 1), v: fmt(V, 1), pct: fmt(pct, 1) }));
}

/* ---------- step 2: summation of two sub-threshold inputs ---------- */
const s2 = { tried: [], edge: null, zoom: false };
const FRACS = []; for (let f = 0.5; f <= 0.9001; f += 0.05) FRACS.push(Math.round(f * 100) / 100);
const singleCache = new Map();
function singleRun(amp) { const k = amp.toFixed(4); if (!singleCache.has(k)) singleCache.set(k, M.single(amp, 30)); return singleCache.get(k); }
function draw2() {
  const f = num('f2'), g = num('g2'), amp = f * M.THRESHOLD;
  $('f2v').textContent = fmt(f, 2); $('g2v').textContent = fmt(g, 2) + ' ms';
  const both = M.pair(f, g, 30), one = singleRun(amp), fires = both.spikes.length > 0;
  const key = f + '/' + g; if (!s2.tried.some(q => q.key === key)) { s2.tried.push({ key, f, g, fires }); if (s2.tried.length > 80) s2.tried.shift(); }
  const { ctx, W, H } = fitCanvas($('c2'));
  const zoom = s2.zoom;
  $('zoom2').setAttribute('aria-pressed', zoom ? 'true' : 'false');
  const top = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: 25, yMin: zoom ? -68 : -85, yMax: zoom ? -52 : 50,
    yTicks: zoom ? [[-66, '−66'], [-62, '−62'], [-58, '−58'], [-54, '−54']] : VTICKS, xTicks: linTicks(0, 25, 5), title: t(zoom ? 'c2topZoom' : 'c2top') });
  if (!zoom) hline(ctx, top, M.SPIKE_LEVEL, C.pink);
  line(ctx, top, one.t, one.V, C.ghost, { lw: 1.5, dash: [5, 4] });
  line(ctx, top, one.t.map(s => s + g), one.V, C.ghost, { lw: 1.5, dash: [5, 4] });
  line(ctx, top, both.t, both.V, C.green, { lw: 2.4 });
  stimMarks(ctx, top, [M.T0, M.T0 + g]);
  const bot = panel(ctx, W, { top: 250, bottom: H - 26, xMin: 0, xMax: 8, yMin: 0.28, yMax: 0.92, yTicks: [[0.3, '0.3'], [0.5, '0.5'], [0.7, '0.7'], [0.9, '0.9']], xTicks: linTicks(0, 8, 1), title: t('c2bot') });
  if (s2.edge && s2.edge.length) {
    const pts = s2.edge.filter(q => q.gap >= 0);
    ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.12)'; ctx.beginPath(); ctx.moveTo(bot.x(0), bot.y(pts[0].f));
    pts.forEach(q => ctx.lineTo(bot.x(Math.min(8, q.gap)), bot.y(q.f)));
    ctx.lineTo(bot.x(0), bot.y(pts[pts.length - 1].f)); ctx.closePath(); ctx.fill(); ctx.restore();
    line(ctx, bot, pts.map(q => Math.min(8, q.gap)), pts.map(q => q.f), C.text, { lw: 2 });
  }
  for (const q of s2.tried) dot(ctx, bot.x(q.g), bot.y(q.f), C.ghost, { r: 3.5, hollow: !q.fires });
  dot(ctx, bot.x(g), bot.y(f), C.green, { r: 6, hollow: !fires });
  const mg = M.maxGap(f, 30);
  const edge = mg < 0 ? t('s2never', { sum: fmt(2 * f, 2) }) : t('s2edge', { mg: fmt(mg, 2) });
  $('r2').textContent = minus(t('s2readout', { f: fmt(f, 2), a: fmt(amp, 2), g: fmt(g, 2), p1: fmt(one.peak, 1), p2: fmt(both.peak, 1), res: t(fires ? 'fired' : 'notFired'), edge }));
}
function buildEdge2() {
  const out = []; let i = 0;
  enqueue(() => { const f = FRACS[i]; out.push({ f, gap: M.maxGap(f, 30) }); i++; s2.edge = out.slice(); if (i >= FRACS.length) { draw2(); return false; } return true; });
}

/* ---------- step 3: all-or-none ---------- */
const AMP3 = []; for (let k = 0; k <= 200; k++) AMP3.push(k / 10);
const s3 = { curve: [], tried: new Map(), recent: [], sweeping: false };
function peakRun(a) { const r = singleRun(a); return r; }
function draw3(progress = null) {
  const a = num('a3'), r = peakRun(a), f = a / M.THRESHOLD, fires = r.spikes.length > 0;
  s3.tried.set(a.toFixed(1), r.peak);
  if (!s3.recent.length || s3.recent[s3.recent.length - 1] !== a) { s3.recent.push(a); if (s3.recent.length > 6) s3.recent.shift(); }
  $('a3v').textContent = fmt(a, 1) + ' µA/cm²';
  const { ctx, W, H } = fitCanvas($('c3'));
  const top = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: 25, yMin: -85, yMax: 50, yTicks: VTICKS, xTicks: linTicks(0, 25, 5), title: t('c3top') });
  hline(ctx, top, M.SPIKE_LEVEL, C.pink);
  for (const b of s3.recent) if (b !== a) { const q = peakRun(b); line(ctx, top, q.t, q.V, C.green, { lw: 1.3, alpha: 0.25 }); }
  line(ctx, top, r.t, r.V, C.green, { lw: 2.4 });
  stimMarks(ctx, top, [M.T0]);
  const bot = panel(ctx, W, { top: 250, bottom: H - 26, xMin: 0, xMax: 20, yMin: -85, yMax: 55, yTicks: VTICKS, xTicks: linTicks(0, 20, 2), title: t('c3bot') });
  vline(ctx, bot, M.THRESHOLD, C.orange);
  if (s3.curve.length > 1) line(ctx, bot, AMP3.slice(0, s3.curve.length), s3.curve, C.text, { lw: 1.8 });
  for (const [k, pk] of s3.tried) dot(ctx, bot.x(Number(k)), bot.y(pk), C.ghost, { r: 3.5 });
  dot(ctx, bot.x(a), bot.y(r.peak), C.green, { r: 6 });
  $('r3').textContent = minus((progress !== null ? t('s3progress', { a: fmt(progress, 1) }) + ' ' : '') + t('s3readout', { a: fmt(a, 1), f: fmt(f, 2), p: fmt(r.peak, 1), res: t(fires ? 'fired' : 'notFired') }));
}
function buildCurve3() {
  let i = 0;
  enqueue(() => { s3.curve.push(singleRun(AMP3[i]).peak); i++; if (i % 20 === 0 || i >= AMP3.length) draw3(); return i < AMP3.length; });
}

/* ---------- step 4: refractory period ---------- */
const GAP4 = []; for (let g = 2; g <= 25.0001; g += 0.5) GAP4.push(Math.round(g * 10) / 10);
const s4 = { need: new Map(), tried: [], absRef: null };
function needAt(g) { const k = g.toFixed(1); if (!s4.need.has(k)) s4.need.set(k, M.secondThreshold(g)); return s4.need.get(k); }
function draw4() {
  const g = num('g4'), mlt = num('m4');
  $('g4v').textContent = fmt(g, 1) + ' ms'; $('m4v').textContent = fmt(mlt, 2) + ' ×';
  const q = M.paired(g, mlt, 40), r = q.run;
  const key = g + '/' + mlt; if (!s4.tried.some(z => z.key === key)) { s4.tried.push({ key, g, m: mlt, fires: q.fires }); if (s4.tried.length > 80) s4.tried.shift(); }
  const { ctx, W, H } = fitCanvas($('c4'));
  const top = panel(ctx, W, { top: 30, bottom: 180, xMin: 0, xMax: 40, yMin: -85, yMax: 50, yTicks: VTICKS, xTicks: linTicks(0, 40, 5), title: t('c4top') });
  hline(ctx, top, M.SPIKE_LEVEL, C.pink);
  line(ctx, top, r.t, r.V, C.green, { lw: 2.2 });
  stimMarks(ctx, top, [M.T0, M.T0 + g]);
  const mid = panel(ctx, W, { top: 220, bottom: 310, xMin: 0, xMax: 40, yMin: 0, yMax: 1, yTicks: [[0, '0'], [0.5, '0.5'], [1, '1']], xTicks: linTicks(0, 40, 5), title: t('c4mid') });
  line(ctx, mid, r.t, r.h, C.orange, { lw: 2 }); line(ctx, mid, r.t, r.n, C.cyan, { lw: 2 });
  vline(ctx, mid, M.T0 + g, C.text, [3, 3], 1);
  const bot = panel(ctx, W, { top: 352, bottom: H - 26, xMin: 2, xMax: 25, yMin: 0, yMax: 10.5, yTicks: [[1, '1'], [4, '4'], [7, '7'], [10, '10']], xTicks: linTicks(5, 25, 5), title: t('c4bot') });
  const known = GAP4.filter(z => s4.need.has(z.toFixed(1)));
  const absEdge = s4.absRef !== null ? s4.absRef : (known.find(z => isFinite(needAt(z))) || null);
  if (absEdge !== null) { ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.18)'; ctx.fillRect(bot.P.l, bot.P.t, bot.x(absEdge) - bot.P.l, bot.P.b - bot.P.t); ctx.restore(); }
  hline(ctx, bot, 1, C.ghost, [2, 4], 1);
  const fin = known.filter(z => isFinite(needAt(z)));
  if (fin.length > 1) line(ctx, bot, fin, fin.map(needAt), C.text, { lw: 2 });
  for (const z of s4.tried) dot(ctx, bot.x(z.g), bot.y(z.m), C.ghost, { r: 3.5, hollow: !z.fires });
  dot(ctx, bot.x(g), bot.y(mlt), C.green, { r: 6, hollow: !q.fires });
  const i0 = r.t.findIndex(s => s >= M.T0 + g);
  const need = needAt(g);
  $('r4').textContent = minus(t('s4readout', { g: fmt(g, 1), m: fmt(mlt, 2), res: q.fires ? t('s4yes', { pk: fmt(q.peak2, 1) }) : t('s4no'), h: fmt(r.h[i0], 3), n: fmt(r.n[i0], 3), need: isFinite(need) ? t('needX', { x: fmt(need, 2) }) : t('needInf') }));
}
function buildCurve4() {
  let i = 0;
  enqueue(() => { needAt(GAP4[i]); i++; if (i % 6 === 0 || i >= GAP4.length) draw4(); return i < GAP4.length; });
  enqueue(() => { s4.absRef = M.absoluteRefractory(); draw4(); draw5(); return false; });
}

/* ---------- step 5: firing-rate ceiling ---------- */
const I5 = []; for (let k = 0; k <= 200; k++) I5.push(k);
const s5 = { rates: new Map(), done: 0 };
function rateAt(I) { if (!s5.rates.has(I)) s5.rates.set(I, M.rate(I)); return s5.rates.get(I); }
function draw5() {
  const I = num('i5'), q = rateAt(I), r = q.run;
  $('i5v').textContent = fmt(I, 0) + ' µA/cm²';
  const { ctx, W, H } = fitCanvas($('c5'));
  const top = panel(ctx, W, { top: 30, bottom: 200, xMin: 0, xMax: 150, yMin: -85, yMax: 50, yTicks: VTICKS, xTicks: linTicks(0, 150, 25), title: t('c5top') });
  hline(ctx, top, M.SPIKE_LEVEL, C.pink);
  const cut = r.t.findIndex(s => s > 150);
  line(ctx, top, r.t.slice(0, cut), r.V.slice(0, cut), C.green, { lw: 1.8 });
  const bot = panel(ctx, W, { top: 250, bottom: H - 26, xMin: 0, xMax: 200, yMin: 0, yMax: 170, yTicks: linTicks(0, 160, 40), xTicks: linTicks(0, 200, 25), title: t('c5bot') });
  if (s4.absRef) hline(ctx, bot, 1000 / s4.absRef, C.orange);
  const xs = I5.filter(v => s5.rates.has(v));
  // draw the curve as separate runs so the jump at rheobase and the drop at block are not smeared by connecting lines
  ctx.save(); ctx.fillStyle = C.text;
  for (const v of xs) { const z = s5.rates.get(v); ctx.beginPath(); ctx.arc(bot.x(v), bot.y(z.hz), 1.8, 0, 7); ctx.fill(); }
  ctx.restore();
  dot(ctx, bot.x(I), bot.y(q.hz), C.green, { r: 6 });
  let text;
  if (q.hz > 0) text = t('s5fire', { I, hz: fmt(q.hz, 1), isi: fmt(q.isi, 2), pk: fmt(q.hi, 1) });
  else if (q.swing < 1 && I < 50) text = t('s5none', { I, n: q.early + q.count, v: fmt(q.lo, 1) });
  else if (q.swing < 1) text = t('s5block', { I, v: fmt((q.hi + q.lo) / 2, 1) });
  else text = t('s5small', { I, lo: fmt(q.lo, 1), hi: fmt(q.hi, 1) });
  if (s5.done < I5.length) text += ' ' + t('s5pending', { c: s5.done, N: I5.length });
  $('r5').textContent = minus(text);
}
function buildCurve5() {
  let i = 0;
  enqueue(() => { rateAt(I5[i]); i++; s5.done = i; if (i % 10 === 0 || i >= I5.length) draw5(); return i < I5.length; });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['o0', 'i0'].forEach(id => $(id).addEventListener('input', draw0));
  $('ionK').addEventListener('click', () => pickIon('K'));
  $('ionNa').addEventListener('click', () => pickIon('Na'));
  ['p1', 'k1'].forEach(id => $(id).addEventListener('input', draw1));
  $('reset1').addEventListener('click', () => { $('p1').value = Math.log10(M.P_REST).toFixed(2); $('k1').value = 5; draw1(); });
  ['f2', 'g2'].forEach(id => $(id).addEventListener('input', draw2));
  $('zoom2').addEventListener('click', () => { s2.zoom = !s2.zoom; draw2(); });
  $('a3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('sweep3').addEventListener('click', () => {
    animate('s3', 5000, p => {
      const a = Math.round(p * 200) / 10;
      for (let k = 0; k <= Math.round(p * 200); k += 5) s3.tried.set((k / 10).toFixed(1), singleRun(k / 10).peak);
      $('a3').value = a; draw3(p < 1 ? a : null);
    });
  });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.tried.clear(); s3.recent = []; draw3(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });
  ['g4', 'm4'].forEach(id => $(id).addEventListener('input', draw4));
  $('clear4').addEventListener('click', () => { s4.tried = []; draw4(); });
  $('i5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('sweep5').addEventListener('click', () => {
    animate('s5', 6000, p => { $('i5').value = Math.round(p * 200); draw5(); });
  });

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
  window.refreshNeuro = refresh;
  refresh();
  buildEdge2(); buildCurve3(); buildCurve4(); buildCurve5();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
