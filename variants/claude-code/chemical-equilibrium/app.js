'use strict';
// Chemical equilibrium lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every particle, count, rate and share comes from window.EQ_MODEL (model.js): seeded simulations plus
// their exact expectations. Canvas text sits in fixed rows (titles, axis ticks); numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EQ_MODEL;
const I = window.LESSON_I18N;
const t = (...a) => I.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', box: '#101c29' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FONT = 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const pct = (v, d = 1) => fmt(v * 100, d) + '%';

function fitCanvas(canvas, heightFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = heightFor ? heightFor(width) : Number(canvas.getAttribute('height')) || 300;
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function textRow(ctx, text, x, y, maxW, { size = 12, weight = 600, color = C.text, lh = 1.35 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let s = size; const font = v => `${weight} ${v}px ${FONT}`; ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 10) { s -= 0.5; ctx.font = font(s); }
  const lines = [];
  if (ctx.measureText(text).width <= maxW) lines.push(text);
  else {
    const tokens = /\s/.test(text) ? text.split(/(\s+)/) : [...text]; let cur = '';
    for (const tok of tokens) { const next = cur + tok; if (cur && ctx.measureText(next.trimEnd()).width > maxW) { lines.push(cur.trimEnd()); cur = tok.trimStart(); } else cur = next; }
    if (cur.trim()) lines.push(cur.trimEnd());
  }
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * s * lh));
  ctx.restore();
  return y + lines.length * s * lh;
}
function frame(ctx, P, o) {
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.font = `400 11px ${FONT}`; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of o.yTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : String(v), P.l - 6, y(v) + 4); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  for (const v of o.xTicks || []) { ctx.textAlign = v === o.xMin ? 'left' : v === o.xMax ? 'right' : 'center'; ctx.fillText(o.xFmt ? o.xFmt(v) : String(v), x(v), P.b + 15); }
  ctx.restore();
  return { x, y, P };
}
function line(ctx, f, pts, color, { w = 2, dash = null, alpha = 1 } = {}) {
  if (!pts.length) return;
  ctx.save(); ctx.beginPath(); ctx.rect(f.P.l, f.P.t - 2, f.P.r - f.P.l, f.P.b - f.P.t + 4); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(f.x(a), f.y(b)) : ctx.moveTo(f.x(a), f.y(b)))); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, r, color, { ring = null, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (color) { ctx.fillStyle = color; ctx.fill(); } if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
}
// Particle box: A cyan, B orange, white ring on a particle that switched in the last few steps.
function drawBox(ctx, x, y, w, h, sim, { track = -1 } = {}) {
  ctx.save(); ctx.fillStyle = C.box; ctx.strokeStyle = '#2c3b50'; ctx.lineWidth = 1; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore();
  const r = Math.max(2.4, Math.min(4.2, Math.sqrt(w * h / sim.N) * 0.22)), pad = r + 2;
  sim.parts.forEach((p, i) => {
    const X = x + pad + p.x * (w - 2 * pad), Y = y + pad + p.y * (h - 2 * pad);
    dot(ctx, X, Y, r, p.s ? C.orange : C.cyan, { ring: p.flash > 0 ? '#ffffff' : null, alpha: track >= 0 && i !== track ? 0.55 : 1 });
  });
  if (track >= 0) { const p = sim.parts[track]; dot(ctx, x + pad + p.x * (w - 2 * pad), y + pad + p.y * (h - 2 * pad), r + 4.5, null, { ring: C.green }); }
}
const series = (sim, from, to, fn) => { const out = []; for (let i = Math.max(0, from); i <= Math.min(to, sim.t); i++) out.push([i, fn(i)]); return out; };
// Windowed rate series (mean events per step over the last 30 steps) for plotting.
function rateSeries(sim, key, to, w = 30) {
  const out = []; let acc = 0; const h = sim.hist[key];
  for (let i = 0; i <= Math.min(to, sim.t); i++) { acc += h[i]; if (i >= w) acc -= h[i - w]; if (i >= 1) out.push([i, acc / Math.min(w, i)]); }
  return out;
}

/* ---------- simulations for each step ---------- */
const P300 = M.probs(M.T0);
const S = {
  0: { sim: new M.Sim(200, 80, 101), playing: false, track: -1, trackHist: [], tps: 20 },
  1: { sim: new M.Sim(200, 0, 202), playing: false, tps: 30, max: 300, start: 0 },
  2: { sim: new M.Sim(200, 80, 303), playing: false, tps: 20, last: null, cap: false },
  3: { sim: new M.Sim(200, 80, 404), playing: false, tps: 20, meas: new Map() },
  4: { plain: new M.Sim(200, 0, 41), cat: new M.Sim(200, 0, 41), playing: false, tps: 60, max: 600 }
};
const probOf = k => (k === 3 ? M.probs(Number($('T3').value)) : P300);
function stepSim(k, n) {
  const st = S[k];
  for (let i = 0; i < n; i++) {
    if (st.max && (k === 4 ? st.plain.t : st.sim.t) >= st.max) { st.playing = false; break; }
    if (k === 4) { st.plain.step(M.probs(M.T0, false)); st.cat.step(M.probs(M.T0, true)); }
    else { st.sim.step(probOf(k)); if (k === 0 && st.track >= 0) st.trackHist.push(st.sim.parts[st.track].s); }
  }
}

/* ---------- step 0 ---------- */
function draw0() {
  const st = S[0], sim = st.sim;
  const { ctx, W, H } = fitCanvas($('c0'), w => (w >= 600 ? 360 : 540));
  const wide = W >= 600, bw = wide ? W * 0.42 : W - 20;
  const yb = textRow(ctx, t('c0box', { t: sim.t, N: sim.N }), 10, 20, bw, { size: 13 });
  const boxH = wide ? H - yb - 16 : 190;
  drawBox(ctx, 10, yb + 6, bw, boxH, sim, { track: st.track });
  const px = wide ? bw + 30 : 10, pw = wide ? W - bw - 40 : W - 20, py = wide ? 20 : yb + boxH + 30;
  const yp = textRow(ctx, t('c0plot'), px, py, pw, { size: 13 });
  const stripH = 16, stripTitleH = 22;
  const P = { l: px + 34, r: px + pw, t: yp + 10, b: H - 24 - stripH - stripTitleH - 22 };
  const x0 = Math.max(0, sim.t - 300), x1 = Math.max(300, sim.t);
  const f = frame(ctx, P, { xMin: x1 - 300, xMax: x1, yMin: 0, yMax: 200, yTicks: [0, 100, 200], xTicks: [x1 - 300, x1] });
  line(ctx, f, series(sim, x0, sim.t, i => sim.N - sim.hist.b[i]), C.cyan);
  line(ctx, f, series(sim, x0, sim.t, i => sim.hist.b[i]), C.orange);
  // tracked particle strip
  const sy = textRow(ctx, t('c0strip'), px, P.b + 36, pw, { size: 11, weight: 400, color: C.muted });
  const hist = st.trackHist.slice(-300), sw = (P.r - P.l) / 300;
  ctx.save(); ctx.strokeStyle = '#2c3b50'; ctx.strokeRect(P.l, sy - 4, P.r - P.l, stripH); ctx.restore();
  hist.forEach((s, i) => { ctx.fillStyle = s ? C.orange : C.cyan; ctx.fillRect(P.r - (hist.length - i) * sw, sy - 4, Math.max(1, sw), stripH); });
  const w = sim.rate(30), tr = st.track >= 0 ? sim.parts[st.track] : null;
  $('r0').textContent = t('s0readout', { t: sim.t, a: sim.N - sim.nB(), b: sim.nB(), f: sim.total.f, r: sim.total.r, wf: fmt(w.f, 1), wr: fmt(w.r, 1), trk: tr ? t('trk', { k: tr.flips - st.flips0, s: tr.s ? 'B' : 'A' }) : '' });
  $('play0').textContent = t(st.playing ? 'pause' : 'play');
}

/* ---------- step 1 ---------- */
function draw1() {
  const st = S[1], sim = st.sim, N = sim.N, settle = M.settleTicks(P300);
  const { ctx, W, H } = fitCanvas($('c1'), w => (w >= 600 ? 440 : 640));
  const wide = W >= 600, bw = wide ? W * 0.36 : W - 20;
  const yb = textRow(ctx, t('c0box', { t: sim.t, N }), 10, 20, bw, { size: 13 });
  const boxH = wide ? H - yb - 16 : 170;
  drawBox(ctx, 10, yb + 6, bw, boxH, sim);
  const px = wide ? bw + 30 : 10, pw = wide ? W - bw - 40 : W - 20, top = wide ? 20 : yb + boxH + 30;
  const half = (H - top) / 2;
  const y1 = textRow(ctx, t('c1counts'), px, top, pw, { size: 12 });
  const P1 = { l: px + 34, r: px + pw, t: y1 + 8, b: top + half - 26 };
  const f1 = frame(ctx, P1, { xMin: 0, xMax: 300, yMin: 0, yMax: 200, yTicks: [0, 100, 200], xTicks: [0, 150, 300] });
  const exp = i => M.expectedB(N, st.start, P300, i);
  const expPts = []; for (let i = 0; i <= 300; i += 3) expPts.push(i);
  line(ctx, f1, expPts.map(i => [i, N - exp(i)]), C.cyan, { w: 1.4, dash: [5, 4], alpha: 0.7 });
  line(ctx, f1, expPts.map(i => [i, exp(i)]), C.orange, { w: 1.4, dash: [5, 4], alpha: 0.7 });
  line(ctx, f1, series(sim, 0, sim.t, i => N - sim.hist.b[i]), C.cyan);
  line(ctx, f1, series(sim, 0, sim.t, i => sim.hist.b[i]), C.orange);
  const y2 = textRow(ctx, t('c1rates'), px, top + half + 4, pw, { size: 12 });
  const P2 = { l: px + 34, r: px + pw, t: y2 + 8, b: H - 24 };
  const f2 = frame(ctx, P2, { xMin: 0, xMax: 300, yMin: 0, yMax: 6, yTicks: [0, 2, 4, 6], xTicks: [0, 150, 300] });
  line(ctx, f2, expPts.map(i => [i, (N - exp(i)) * P300.f]), C.cyan, { w: 1.4, dash: [5, 4], alpha: 0.7 });
  line(ctx, f2, expPts.map(i => [i, exp(i) * P300.r]), C.orange, { w: 1.4, dash: [5, 4], alpha: 0.7 });
  line(ctx, f2, rateSeries(sim, 'f', sim.t), C.cyan); line(ctx, f2, rateSeries(sim, 'r', sim.t), C.orange);
  const w = sim.rate(30), a = N - sim.nB(), b = sim.nB();
  $('r1').textContent = t('s1readout', { t: sim.t, a, b, q: a ? fmt(b / a) : '∞', K: fmt(M.K()), vf: fmt(w.f, 1), vr: fmt(w.r, 1), state: t(sim.t >= settle ? 'stateAfter' : 'stateBefore', { s: settle }) });
  $('s1hint').textContent = t('s1hint', { s: settle });
  $('play1').textContent = t(st.playing ? 'pause' : 'play');
}

/* ---------- step 2 ---------- */
function draw2() {
  const st = S[2], sim = st.sim, N = sim.N, x = M.xEq();
  const { ctx, W, H } = fitCanvas($('c2'), w => (w >= 600 ? 360 : 480));
  const wide = W >= 600, bw = wide ? W * 0.42 : W - 20;
  const yb = textRow(ctx, t('c2box', { t: sim.t, N }), 10, 20, bw, { size: 13 });
  const boxH = wide ? H - yb - 16 : 190;
  drawBox(ctx, 10, yb + 6, bw, boxH, sim);
  const px = wide ? bw + 30 : 10, pw = wide ? W - bw - 40 : W - 20, py = wide ? 20 : yb + boxH + 30;
  const yp = textRow(ctx, t('c2plot'), px, py, pw, { size: 13 });
  const P = { l: px + 34, r: px + pw, t: yp + 10, b: H - 24 };
  const x1 = Math.max(400, sim.t), x0 = x1 - 400;
  const f = frame(ctx, P, { xMin: x0, xMax: x1, yMin: 0, yMax: 300, yTicks: [0, 100, 200, 300], xTicks: [x0, x1] });
  // particle total per tick: N grows only at marks; rebuild from the marks
  const Nat = i => 200 + 50 * sim.marks.filter(m => m <= i).length;
  sim.marks.forEach(m => { if (m >= x0) { ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(f.x(m), P.t); ctx.lineTo(f.x(m), P.b); ctx.stroke(); ctx.restore(); } });
  line(ctx, f, series(sim, x0, sim.t, i => Nat(i) - sim.hist.b[i]), C.cyan);
  line(ctx, f, series(sim, x0, sim.t, i => sim.hist.b[i]), C.orange);
  const b = sim.nB(), a = N - b, Q = a ? b / a : Infinity, K = M.K();
  // "near" = within two standard deviations of the B count at balance, expressed through Q
  const sd = Math.sqrt(N * x * (1 - x)), near = Math.abs(b - N * x) <= 2 * sd;
  const dir = near ? t('qNear') : Q < K ? t('qLess') : t('qMore');
  let plan = t('planNone');
  if (st.last) {
    const L = st.last, a1 = Math.round(N * (1 - x)), b1 = Math.round(N * x);
    plan = L.kind === 'A' ? t('planA', { a0: L.a0, b0: L.b0, a1, b1, c: b1 - L.b0, d: a1 - L.a0 }) : t('planB', { a0: L.a0, b0: L.b0, a1, b1, c: a1 - L.a0, d: b1 - L.b0 });
  }
  $('r2').textContent = t('s2readout', { t: sim.t, N, a, b, q: Number.isFinite(Q) ? fmt(Q) : '∞', K: fmt(K), dir, plan }) + (st.cap ? ' ' + t('capNote') : '');
  $('addA2').disabled = $('addB2').disabled = N + 50 > 300;
  $('play2').textContent = t(st.playing ? 'pause' : 'play');
}
function add2(kind) {
  const st = S[2], sim = st.sim, x = M.xEq();
  if (sim.N + 50 > 300) { st.cap = true; draw2(); return; }
  st.last = { kind, a0: Math.round(sim.N * (1 - x)), b0: Math.round(sim.N * x) };
  sim.inject(50, kind === 'A' ? 0 : 1); draw2();
}

/* ---------- step 3 ---------- */
function draw3() {
  const st = S[3], sim = st.sim, T = Number($('T3').value), p = M.probs(T), K = M.K(T), x = M.xEq(T);
  $('T3v').textContent = T + ' K';
  const { ctx, W, H } = fitCanvas($('c3'), w => (w >= 600 ? 360 : 480));
  const wide = W >= 600, bw = wide ? W * 0.42 : W - 20;
  const yb = textRow(ctx, t('c3box', { T, t: sim.t }), 10, 20, bw, { size: 13 });
  const boxH = wide ? H - yb - 16 : 190;
  drawBox(ctx, 10, yb + 6, bw, boxH, sim);
  const px = wide ? bw + 30 : 10, pw = wide ? W - bw - 40 : W - 20, py = wide ? 20 : yb + boxH + 30;
  const yp = textRow(ctx, t('c3plot'), px, py, pw, { size: 13 });
  const P = { l: px + 40, r: px + pw - 6, t: yp + 10, b: H - 24 };
  const f = frame(ctx, P, { xMin: 260, xMax: 340, yMin: 0.2, yMax: 0.6, yTicks: [0.2, 0.3, 0.4, 0.5, 0.6], yFmt: v => Math.round(v * 100) + '%', xTicks: [260, 300, 340], xFmt: v => v + ' K' });
  const th = []; for (let T2 = 260; T2 <= 340; T2 += 2) th.push([T2, M.xEq(T2)]);
  line(ctx, f, th, C.text, { w: 1.8 });
  st.meas.forEach((v, T2) => dot(ctx, f.x(T2), f.y(v), 4.5, C.text, { ring: '#0d1621' }));
  const now = Math.max(0.2, Math.min(0.6, sim.nB() / sim.N));
  dot(ctx, f.x(T), f.y(now), 6, null, { ring: C.cyan });
  const m = st.meas.get(T);
  const meas = m === undefined ? t('measNo') : t('measYes', { m: pct(m), d: fmt((m - x) * 100, 1) });
  $('r3').textContent = t('s3readout', { T, pf: fmt(p.f, 4), pr: fmt(p.r, 4), K: fmt(K), x: pct(x), meas });
  $('play3').textContent = t(st.playing ? 'pause' : 'play');
}

/* ---------- step 4 ---------- */
function draw4() {
  const st = S[4], A = st.plain, B = st.cat, p0 = M.probs(M.T0, false), p1 = M.probs(M.T0, true);
  $('s4e').innerHTML = t('s4e', { fac: fmt(p1.f / p0.f, 1) });
  const { ctx, W, H } = fitCanvas($('c4'), w => (w >= 600 ? 400 : 460));
  const half = (W - 30) / 2, boxH = W >= 600 ? 140 : 120;
  const ya = textRow(ctx, t('c4plain', { t: A.t }), 10, 20, half, { size: 12 });
  const yb2 = textRow(ctx, t('c4cat', { t: B.t }), 20 + half, 20, half, { size: 12 });
  const yTop = Math.max(ya, yb2) + 6;
  drawBox(ctx, 10, yTop, half, boxH, A); drawBox(ctx, 20 + half, yTop, half, boxH, B);
  const yp = textRow(ctx, t('c4plot'), 10, yTop + boxH + 26, W - 20, { size: 13 });
  const P = { l: 44, r: W - 12, t: yp + 10, b: H - 24 };
  const f = frame(ctx, P, { xMin: 0, xMax: 600, yMin: 0, yMax: 120, yTicks: [0, 40, 80, 120], xTicks: [0, 200, 400, 600] });
  const s0 = M.settleTicks(p0), s1 = M.settleTicks(p1);
  [[s0, C.orange], [s1, C.pink]].forEach(([s, col]) => { ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(f.x(s), P.t); ctx.lineTo(f.x(s), P.b); ctx.stroke(); ctx.restore(); });
  const ex = []; for (let i = 0; i <= 600; i += 4) ex.push(i);
  line(ctx, f, ex.map(i => [i, M.expectedB(200, 0, p0, i)]), C.orange, { w: 1.3, dash: [5, 4], alpha: 0.65 });
  line(ctx, f, ex.map(i => [i, M.expectedB(200, 0, p1, i)]), C.pink, { w: 1.3, dash: [5, 4], alpha: 0.65 });
  line(ctx, f, series(A, 0, A.t, i => A.hist.b[i]), C.orange); line(ctx, f, series(B, 0, B.t, i => B.hist.b[i]), C.pink);
  const tail = A.t >= 600 ? t('tailDone', { x0: pct(A.meanB(200, 600) / 200), x1: pct(B.meanB(200, 600) / 200), x: pct(M.xEq()) }) : t('tailWait');
  $('r4').textContent = t('s4readout', { t: A.t, b0: A.nB(), b1: B.nB(), s0, s1, fx: fmt(s0 / s1, 1), tail });
  $('play4').textContent = t(st.playing ? 'pause' : 'play');
}

const DRAW = { 0: draw0, 1: draw1, 2: draw2, 3: draw3, 4: draw4 };
function refresh() { Object.values(DRAW).forEach(d => d()); }

/* ---------- one animation loop for all running simulations ---------- */
const visible = new Set([0, 1, 2, 3, 4]);
let raf = null, last = 0;
const acc = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
function loop(now) {
  raf = null;
  const dt = Math.min(0.1, (now - last) / 1000 || 0); last = now;
  let any = false;
  for (const k of [0, 1, 2, 3, 4]) {
    const st = S[k]; if (!st.playing) continue; any = true;
    if (!visible.has(k)) continue;
    acc[k] += dt * st.tps; const n = Math.floor(acc[k]); acc[k] -= n;
    if (n) { stepSim(k, n); DRAW[k](); }
  }
  if (any && !document.hidden) raf = requestAnimationFrame(loop);
}
function kick() { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } }
// Reduced motion: "Play" jumps ahead instead of animating.
const JUMP = { 0: 100, 1: 300, 2: 200, 3: 200, 4: 600 };
function togglePlay(k) {
  const st = S[k];
  if (reduceMotion()) { stepSim(k, JUMP[k]); st.playing = false; DRAW[k](); return; }
  if (st.max && (k === 4 ? st.plain.t : st.sim.t) >= st.max) return; // finished: use restart
  st.playing = !st.playing; DRAW[k](); kick();
}

function setup() {
  $('play0').addEventListener('click', () => togglePlay(0));
  $('ff0').addEventListener('click', () => { stepSim(0, 100); draw0(); });
  $('track0').addEventListener('click', () => {
    const st = S[0], A = st.sim.parts.map((p, i) => [p, i]).filter(([p]) => p.s === 0);
    const pick = A[(st.sim.t * 7 + 3) % A.length][1];
    st.track = pick; st.trackHist = []; st.flips0 = st.sim.parts[pick].flips; draw0();
  });
  $('play1').addEventListener('click', () => togglePlay(1));
  const restart1 = b0 => { const st = S[1]; st.playing = false; st.start = b0; st.sim = new M.Sim(200, b0, 202 + b0); draw1(); };
  $('fromA1').addEventListener('click', () => restart1(0));
  $('fromB1').addEventListener('click', () => restart1(200));
  $('play2').addEventListener('click', () => togglePlay(2));
  $('addA2').addEventListener('click', () => add2('A'));
  $('addB2').addEventListener('click', () => add2('B'));
  $('restart2').addEventListener('click', () => { const st = S[2]; st.playing = false; st.sim = new M.Sim(200, 80, 303); st.last = null; st.cap = false; draw2(); });
  $('play3').addEventListener('click', () => togglePlay(3));
  $('T3').addEventListener('input', draw3);
  $('measure3').addEventListener('click', () => { const T = Number($('T3').value); S[3].meas.set(T, M.measureShare(T).share); draw3(); });
  $('clear3').addEventListener('click', () => { S[3].meas.clear(); draw3(); });
  $('play4').addEventListener('click', () => togglePlay(4));
  $('restart4').addEventListener('click', () => { const st = S[4]; st.playing = false; st.plain = new M.Sim(200, 0, 41); st.cat = new M.Sim(200, 0, 41); draw4(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    // simulations only advance while their section is on screen
    const vis = new IntersectionObserver(es => es.forEach(e => { const k = Number(e.target.dataset.step); if (e.isIntersecting) { visible.add(k); kick(); } else visible.delete(k); }), { threshold: 0 });
    steps.forEach(s => { if (Number(s.dataset.step) <= 4) vis.observe(s); });
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { Object.values(S).forEach(st => { st.playing = false; }); if (raf) { cancelAnimationFrame(raf); raf = null; } refresh(); }
  });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
