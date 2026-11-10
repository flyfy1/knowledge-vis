'use strict';
// Lorentz-force lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every arrow, path, landing mark and readout comes from window.MF_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrink-to-fit), axis ticks and the v / F arrow tags; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MF_MODEL;
const t = (...a) => window.MF_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', field: '#33455c', dee: '#1a2a3c' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 9);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
function niceTicks(max, n = 3) {
  const raw = max / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  const step = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, out = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toPrecision(10));
  return out;
}
// Chart panel with y ticks on the left and x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 42, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  o.yTicks.forEach(v => { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 2), P.l - 6, y(v) + 4); });
  ctx.textAlign = 'center';
  (o.xTicks || []).forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v, 2), x(v), P.b + 15); });
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 14, W - 16);
  return { x, y, P };
}
// Equal-scale view of world box [x0,x1]×[y0,y1] inside rect; world y points up. Optional unit grid with ticks.
function view(ctx, rect, b, o = {}) {
  const s = Math.min((rect.r - rect.l) / (b.x1 - b.x0), (rect.b - rect.t) / (b.y1 - b.y0));
  const cx = (rect.l + rect.r) / 2 - (b.x0 + b.x1) / 2 * s, cy = (rect.t + rect.b) / 2 + (b.y0 + b.y1) / 2 * s;
  const X = v => cx + v * s, Y = v => cy - v * s;
  if (o.grid) {
    ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
    const st = o.grid, xs0 = Math.ceil(b.x0 / st) * st, ys0 = Math.ceil(b.y0 / st) * st;
    for (let v = xs0; v <= b.x1 + 1e-9; v += st) { ctx.beginPath(); ctx.moveTo(X(v), Y(b.y0)); ctx.lineTo(X(v), Y(b.y1)); ctx.stroke(); }
    for (let v = ys0; v <= b.y1 + 1e-9; v += st) { ctx.beginPath(); ctx.moveTo(X(b.x0), Y(v)); ctx.lineTo(X(b.x1), Y(v)); ctx.stroke(); }
    ctx.textAlign = 'center'; for (let v = xs0; v <= b.x1 + 1e-9; v += st * (o.every || 1)) ctx.fillText(fmt(v), X(v), Y(b.y0) + 14);
    ctx.textAlign = 'right'; for (let v = ys0; v <= b.y1 + 1e-9; v += st * (o.every || 1)) ctx.fillText(fmt(v), X(b.x0) - 5, Y(v) + 4);
    ctx.restore();
  }
  return { X, Y, s };
}
function polyline(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, color, lw = 3) {
  const a = Math.atan2(y1 - y0, x1 - x0), h = 10;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * h * 0.6, y1 - Math.sin(a) * h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.4), y1 - h * Math.sin(a - 0.4)); ctx.lineTo(x1 - h * Math.cos(a + 0.4), y1 - h * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); ctx.restore();
}
// B symbols: × (into) or · (out of) the screen, drawn as shapes on a grid.
function fieldMarks(ctx, l, tp, r, b, into, step = 34) {
  ctx.save(); ctx.strokeStyle = C.field; ctx.fillStyle = C.field; ctx.lineWidth = 1.6;
  for (let y = tp + step / 2; y < b; y += step) for (let x = l + step / 2; x < r; x += step) {
    if (into) { ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}

/* ---------- animation runner ---------- */
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

/* ---------- step 0: direction ---------- */
const s0 = { q: 1, into: true };
function draw0() {
  const a = num('ang0'); $('ang0v').textContent = a + '°';
  $('qPos0').setAttribute('aria-pressed', String(s0.q > 0)); $('qNeg0').setAttribute('aria-pressed', String(s0.q < 0));
  $('bIn0').setAttribute('aria-pressed', String(s0.into)); $('bOut0').setAttribute('aria-pressed', String(!s0.into));
  const vx = Math.cos(a * Math.PI / 180), vy = Math.sin(a * Math.PI / 180), Bz = s0.into ? -1 : 1, F = M.lorentz(s0.q, vx, vy, Bz);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 16, W - 16);
  fieldMarks(ctx, 8, 26, W - 8, H - 6, s0.into);
  const cx = W / 2, cy = (26 + H) / 2, L = Math.min(110, W / 2 - 40, (H - 26) / 2 - 34);
  // right-angle mark between v and F
  const ux = vx, uy = -vy, fx = F.fx, fy = -F.fy, k = 16;
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.2; ctx.beginPath();
  ctx.moveTo(cx + ux * k, cy + uy * k); ctx.lineTo(cx + ux * k + fx * k, cy + uy * k + fy * k); ctx.lineTo(cx + fx * k, cy + fy * k); ctx.stroke(); ctx.restore();
  arrow(ctx, cx, cy, cx + ux * L, cy + uy * L, C.cyan); arrow(ctx, cx, cy, cx + fx * L, cy + fy * L, C.orange);
  ctx.save(); ctx.font = '600 15px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C.cyan; ctx.fillText('v', cx + ux * (L + 16), cy + uy * (L + 16)); ctx.fillStyle = C.orange; ctx.fillText('F', cx + fx * (L + 16), cy + fy * (L + 16)); ctx.restore();
  dot(ctx, cx, cy, 13, s0.q > 0 ? '#d9534f' : '#3f7fd9', C.text);
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); if (s0.q > 0) { ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6); } ctx.stroke(); ctx.restore();
  const turnDeg = M.turn(vx, vy, F.fx, F.fy);
  $('r0').textContent = t('s0readout', { va: a, fa: Math.round(M.angleDeg(F.fx, F.fy)) % 360, dir: t(turnDeg > 0 ? 'ccw' : 'cw'), ang: Math.round(Math.abs(turnDeg)), dot: (F.fx * vx + F.fy * vy).toFixed(3), F: fmt(Math.hypot(F.fx, F.fy)) });
}

/* ---------- step 1: no work ---------- */
const P1 = { B: { q: 1, m: 1, Bz: -1, x0: 0, y0: 0, vx: 1, vy: 0 }, E: { q: 1, m: 1, Ey: 0.2, x0: 0, y0: 0, vx: 1, vy: 0 } };
const T1 = 6.28;
const s1 = { mode: 'B', reached: { B: 0, E: 0 } };
const state1 = (mode, tt) => (mode === 'B' ? M.orbitAt(P1.B, tt) : M.eFieldAt(P1.E, tt));
function draw1() {
  const tt = num('t1'), mode = s1.mode; s1.reached[mode] = Math.max(s1.reached[mode], tt);
  $('t1v').textContent = tt.toFixed(2);
  $('fieldB1').setAttribute('aria-pressed', String(mode === 'B')); $('fieldE1').setAttribute('aria-pressed', String(mode === 'E'));
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 16, W - 16);
  const V = view(ctx, { l: 40, t: 30, r: W - 14, b: 224 }, { x0: -1.4, x1: 6.7, y0: -0.4, y1: 4.2 }, { grid: 1, every: 2 });
  ['B', 'E'].forEach(md => {
    const pts = []; for (let q = 0; q <= s1.reached[md] + 1e-9; q += 0.02) { const s = state1(md, q); pts.push([V.X(s.x), V.Y(s.y)]); }
    polyline(ctx, pts, md === 'B' ? C.cyan : C.pink, md === mode ? 2.4 : 1.4, null, md === mode ? 1 : 0.55);
  });
  const s = state1(mode, tt), F = mode === 'B' ? M.lorentz(1, s.vx, s.vy, -1) : { fx: 0, fy: 0.2 };
  const sc = 34; arrow(ctx, V.X(s.x), V.Y(s.y), V.X(s.x) + s.vx / Math.hypot(s.vx, s.vy) * sc, V.Y(s.y) - s.vy / Math.hypot(s.vx, s.vy) * sc, C.cyan, 2.4);
  const fl = Math.hypot(F.fx, F.fy); arrow(ctx, V.X(s.x), V.Y(s.y), V.X(s.x) + F.fx / fl * sc, V.Y(s.y) - F.fy / fl * sc, C.orange, 2.4);
  dot(ctx, V.X(s.x), V.Y(s.y), 6, C.text);
  const B = panel(ctx, W, { top: 272, bottom: H - 26, xMin: 0, xMax: T1, yMin: 0, yMax: 1.5, yTicks: [0, 0.5, 1, 1.5], xTicks: [0, 1, 2, 3, 4, 5, 6], title: t('c1b') });
  ['B', 'E'].forEach(md => {
    const pts = []; for (let q = 0; q <= s1.reached[md] + 1e-9; q += 0.02) { const st = state1(md, q); pts.push([B.x(q), B.y(0.5 * (st.vx * st.vx + st.vy * st.vy))]); }
    polyline(ctx, pts, md === 'B' ? C.cyan : C.pink, md === mode ? 2.4 : 1.4, null, md === mode ? 1 : 0.55);
  });
  const ke = 0.5 * (s.vx * s.vx + s.vy * s.vy); dot(ctx, B.x(tt), B.y(ke), 5, mode === 'B' ? C.cyan : C.pink);
  const steps = Math.round(tt / 0.005), w = steps ? M.rk4(P1[mode], mode, tt / steps, steps).work : 0;
  const ang = Math.acos(Math.max(-1, Math.min(1, (F.fx * s.vx + F.fy * s.vy) / (fl * Math.hypot(s.vx, s.vy))))) * 180 / Math.PI;
  $('r1').textContent = t('s1readout', { field: t(mode === 'B' ? 's1nameB' : 's1nameE'), t: tt.toFixed(2), v: Math.hypot(s.vx, s.vy).toFixed(3), ke: ke.toFixed(3), ang: ang.toFixed(1), w: (Math.abs(w) < 5e-4 ? 0 : w).toFixed(3), dke: (ke - 0.5).toFixed(3) });
}

/* ---------- step 2: radius ---------- */
const s2 = { hist: new Map(), prog: 1 };
const key2 = (v, B, m) => `${v}|${B}|${m}`;
const p2 = (v, B, m) => ({ q: 1, m, Bz: -B, x0: 0, y0: 0, vx: v, vy: 0 });
function measured2(v, B, m) { const k = key2(v, B, m); if (!s2.hist.has(k)) s2.hist.set(k, { v, B, m, r: M.measureRadius(p2(v, B, m)) }); return s2.hist.get(k); }
function draw2() {
  const v = num('v2'), B = num('B2'), m = num('m2'), cur = measured2(v, B, m), rf = M.radius(m, v, 1, B);
  $('v2v').textContent = fmt(v); $('B2v').textContent = fmt(B); $('m2v').textContent = fmt(m, 1);
  let { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 16, W - 16);
  let R = 1; s2.hist.forEach(h => { R = Math.max(R, M.radius(h.m, h.v, 1, h.B)); });
  const st = R > 4 ? 2 : R > 2 ? 1 : 0.5;
  const Vw = view(ctx, { l: 40, t: 30, r: W - 14, b: H - 26 }, { x0: -R * 1.1, x1: R * 1.1, y0: -R * 0.1, y1: R * 2.1 }, { grid: st, every: 2 });
  const circle = (h, color, lw, frac = 1) => { const p = p2(h.v, h.B, h.m), T = M.period(h.m, 1, h.B), pts = []; for (let i = 0; i <= 200 * frac; i++) { const s = M.orbitAt(p, T * i / 200); pts.push([Vw.X(s.x), Vw.Y(s.y)]); } polyline(ctx, pts, color, lw); };
  s2.hist.forEach(h => { if (h !== cur) circle(h, C.raw, 1.4); });
  circle(cur, C.cyan, 2.6, s2.prog);
  // measured diameter: start point to the farthest point (the top of the circle)
  polyline(ctx, [[Vw.X(0), Vw.Y(0)], [Vw.X(0), Vw.Y(2 * cur.r)]], C.orange, 1.6, [5, 4]);
  const now = M.orbitAt(p2(v, B, m), M.period(m, 1, B) * s2.prog);
  dot(ctx, Vw.X(now.x), Vw.Y(now.y), 6, C.text);
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const top = 8.4, ticks = [0, 2, 4, 6, 8];
  const Pn = panel(ctx, W, { top: 30, bottom: H - 26, left: 34, xMin: 0, xMax: top, yMin: 0, yMax: top, yTicks: ticks, xTicks: ticks, title: t('c2b') });
  polyline(ctx, [[Pn.x(0), Pn.y(0)], [Pn.x(top), Pn.y(top)]], C.orange, 1.8);
  s2.hist.forEach(h => dot(ctx, Pn.x(M.radius(h.m, h.v, 1, h.B)), Pn.y(h.r), h === cur ? 6 : 4, h === cur ? C.cyan : C.text, C.bg));
  $('r2').textContent = t('s2readout', { v: fmt(v), B: fmt(B), m: fmt(m, 1), rf: rf.toFixed(3), rm: cur.r.toFixed(3), dev: Math.abs(cur.r - rf).toExponential(1), n: s2.hist.size });
}

/* ---------- step 3: the period ignores speed ---------- */
const SPEEDS = [0.5, 1, 1.5], COL3 = [C.cyan, C.orange, C.green], T3 = 26;
const s3 = { key: '', traces: null, periods: null };
function prep3() {
  const B = num('B3'), m = num('m3'), k = B + '|' + m; if (k === s3.key) return; s3.key = k;
  const dt = 0.01, n = Math.round(T3 / dt);
  s3.traces = SPEEDS.map(v => { const p = { q: 1, m, Bz: -B, x0: 0, y0: 0, vx: v, vy: 0 }, laps = [0]; let prev = [v, 0], tot = 0; M.rk4(p, 'B', dt, n, (tt, s) => { tot += M.turn(prev[0], prev[1], s[2], s[3]); prev = [s[2], s[3]]; laps.push(Math.abs(tot) / 360); }); return laps; });
  s3.periods = SPEEDS.map(v => M.measurePeriod({ q: 1, m, Bz: -B, x0: 0, y0: 0, vx: v, vy: 0 }));
}
function draw3() {
  prep3();
  const B = num('B3'), m = num('m3'), tt = num('t3'), T = M.period(m, 1, B);
  $('B3v').textContent = fmt(B); $('m3v').textContent = fmt(m, 1); $('t3v').textContent = tt.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 16, W - 16);
  const V = view(ctx, { l: 40, t: 30, r: W - 14, b: 236 }, { x0: -3.3, x1: 3.3, y0: -0.3, y1: 6.3 }, { grid: 1, every: 2 });
  SPEEDS.forEach((v, i) => {
    const p = { q: 1, m, Bz: -B, x0: 0, y0: 0, vx: v, vy: 0 }, pts = [];
    for (let j = 0; j <= 120; j++) { const s = M.orbitAt(p, T * j / 120); pts.push([V.X(s.x), V.Y(s.y)]); }
    polyline(ctx, pts, COL3[i], 1.4, [4, 4], 0.7);
  });
  SPEEDS.forEach((v, i) => {
    const s = M.orbitAt({ q: 1, m, Bz: -B, x0: 0, y0: 0, vx: v, vy: 0 }, tt), sp = Math.hypot(s.vx, s.vy);
    arrow(ctx, V.X(s.x), V.Y(s.y), V.X(s.x) + s.vx / sp * 30, V.Y(s.y) - s.vy / sp * 30, COL3[i], 2.4);
    dot(ctx, V.X(s.x), V.Y(s.y), 5.5, COL3[i], C.bg);
  });
  const lapsMax = T3 / Math.PI + 0.3; // ω t / 2π at the fastest setting (B = 2, m = 1)
  const Bp = panel(ctx, W, { top: 286, bottom: H - 26, xMin: 0, xMax: T3, yMin: 0, yMax: lapsMax, yTicks: [0, 2, 4, 6, 8], xTicks: [0, 5, 10, 15, 20, 25], title: t('c3b') });
  ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ghost; ctx.lineWidth = 1;
  for (let k = 1; k * T <= T3; k++) { ctx.beginPath(); ctx.moveTo(Bp.x(k * T), Bp.P.t); ctx.lineTo(Bp.x(k * T), Bp.P.b); ctx.stroke(); }
  ctx.restore();
  const n = Math.round(tt / 0.01);
  s3.traces.forEach((laps, i) => { const pts = []; for (let j = 0; j <= n; j += 2) pts.push([Bp.x(j * 0.01), Bp.y(laps[j])]); pts.push([Bp.x(tt), Bp.y(laps[n])]); polyline(ctx, pts, COL3[i], [5, 3.2, 1.6][i], null, [0.55, 0.75, 1][i]); });
  const r = SPEEDS.map(v => M.radius(m, v, 1, B));
  $('r3').textContent = t('s3readout', { B: fmt(B), m: fmt(m, 1), r1: r[0].toFixed(3), r2: r[1].toFixed(3), r3: r[2].toFixed(3), T: T.toFixed(3), T1: s3.periods[0].toFixed(3), T2: s3.periods[1].toFixed(3), T3: s3.periods[2].toFixed(3), t: tt.toFixed(2), laps: s3.traces[1][n].toFixed(2) });
}

/* ---------- step 4: mass spectrometer ---------- */
const ICOL = [C.cyan, C.green, C.orange], XMAX4 = 0.27, DEPTH4 = 0.135;
function draw4() {
  const U = num('U4'), B = num('B4'); $('U4v').textContent = U + ' V'; $('B4v').textContent = B.toFixed(2) + ' T';
  const res = M.ISOTOPES.map(i => M.spectro(i.u, U, B));
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 16, W - 16);
  const xs = 34, yPlate = 92, bottom = H - 120, s = Math.min((W - xs - 22) / XMAX4, (bottom - yPlate) / DEPTH4);
  // field region below the plate
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.04)'; ctx.fillRect(xs - 12, yPlate, XMAX4 * s + 24, bottom - yPlate); ctx.restore();
  fieldMarks(ctx, xs - 12, yPlate, xs + XMAX4 * s + 12, bottom, true, 30);
  // source and accelerating plates above the slit
  ctx.save(); ctx.fillStyle = C.dee; ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.2; ctx.fillRect(xs - 9, 28, 18, 14); ctx.strokeRect(xs - 9, 28, 18, 14);
  ctx.strokeStyle = C.pink; ctx.lineWidth = 2; [50, 66].forEach(y => { ctx.beginPath(); ctx.moveTo(xs - 16, y); ctx.lineTo(xs - 4, y); ctx.moveTo(xs + 4, y); ctx.lineTo(xs + 16, y); ctx.stroke(); });
  ctx.strokeStyle = C.text; ctx.globalAlpha = 0.6; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xs, 42); ctx.lineTo(xs, yPlate); ctx.stroke(); ctx.restore();
  // plate with cm ruler
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xs + 5, yPlate); ctx.lineTo(xs + XMAX4 * s + 10, yPlate); ctx.stroke();
  ctx.lineWidth = 1; ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  const cmStep = s * 0.05 >= 34 ? 5 : 10;
  for (let cm = 0; cm <= XMAX4 * 100 + 1e-9; cm += 1) { const X = xs + cm / 100 * s, big = cm % cmStep === 0; ctx.strokeStyle = C.ghost; ctx.beginPath(); ctx.moveTo(X, yPlate - (big ? 8 : 4)); ctx.lineTo(X, yPlate); ctx.stroke(); if (big && cm > 0) ctx.fillText(String(cm), X, yPlate - 11); }
  ctx.restore();
  res.forEach((r, i) => {
    const pts = []; for (let j = 0; j <= 90; j++) { const a = Math.PI * j / 90; pts.push([xs + (r.r - r.r * Math.cos(a)) * s, yPlate + r.r * Math.sin(a) * s]); }
    polyline(ctx, pts, ICOL[i], 2);
    dot(ctx, xs + r.x * s, yPlate, 4.5, ICOL[i], C.bg);
  });
  // magnified strip: ±15 mm around the ²¹Ne landing point
  const mid = res[1].x * 1000;
  const Z = panel(ctx, W, { top: H - 70, bottom: H - 26, left: 34, xMin: -15, xMax: 15, yMin: 0, yMax: 1, yTicks: [], xTicks: [-15, -10, -5, 0, 5, 10, 15], title: t('c4b') });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(Z.P.l, Z.P.b); ctx.lineTo(Z.P.r, Z.P.b); ctx.stroke(); ctx.restore();
  res.forEach((r, i) => { const d = r.x * 1000 - mid; if (Math.abs(d) <= 15) { ctx.save(); ctx.fillStyle = ICOL[i]; ctx.fillRect(Z.x(d) - 2, Z.P.t + 4, 4, Z.P.b - Z.P.t - 4); ctx.restore(); } });
  const dx = (res[2].x - res[0].x) * 1000;
  $('r4').textContent = t('s4readout', { x0: (res[0].x * 100).toFixed(2), x1: (res[1].x * 100).toFixed(2), x2: (res[2].x * 100).toFixed(2), dx: dx.toFixed(2), rel: ((res[2].x - res[0].x) / res[0].x * 100).toFixed(1) + '%', v0: (res[0].v / 1000).toFixed(1), mr: M.massFromX(res[2].x, U, B).toFixed(3) });
}

/* ---------- step 5: cyclotron ---------- */
const R5 = 0.5;
const s5 = { key: '', run: null, prev: null, k: null };
function prep5() {
  const B = num('B5'), U = num('U5') * 1000, d = num('d5') / 100, key = [B, U, d].join('|');
  if (key === s5.key) return;
  if (s5.run) s5.prev = s5.run;
  s5.key = key; s5.run = { B, U, d, ...M.cyclotron({ B, Ugap: U, delta: d, R: R5 }), tol: M.tolerance({ B, Ugap: U, R: R5 }), need: M.cyclotron({ B, Ugap: U, delta: 0, R: R5 }).halfTurns };
  s5.k = null;
}
function draw5() {
  prep5();
  const run = s5.run, B = run.B; $('B5v').textContent = B.toFixed(1) + ' T'; $('U5v').textContent = (run.U / 1000) + ' kV'; $('d5v').textContent = (run.d * 100).toFixed(2) + '%';
  const k = s5.k === null ? run.steps.length : s5.k, shown = run.steps.slice(0, k);
  let { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5a'), 8, 16, W - 16);
  const V = view(ctx, { l: 12, t: 30, r: W - 12, b: H - 12 }, { x0: -0.56, x1: 0.56, y0: -0.56, y1: 0.56 });
  fieldMarks(ctx, V.X(-0.56), V.Y(0.56), V.X(0.56), V.Y(-0.56), false, 30); // B out of the screen: protons circle clockwise
  const gap = 0.012;
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.07)'; ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.5;
  [[1, -Math.PI / 2, Math.PI / 2], [-1, Math.PI / 2, 3 * Math.PI / 2]].forEach(([sg, a0, a1]) => { ctx.beginPath(); ctx.arc(V.X(sg * gap), V.Y(0), R5 * V.s, a0, a1); ctx.closePath(); ctx.fill(); ctx.stroke(); });
  ctx.restore();
  const arcs = M.cycloPath(shown);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = arcs.length > 200 ? 0.7 : 1.2; ctx.globalAlpha = 0.85;
  arcs.forEach(a => { ctx.beginPath(); if (a.right) ctx.arc(V.X(0), V.Y(a.cy), a.r * V.s, -Math.PI / 2, Math.PI / 2); else ctx.arc(V.X(0), V.Y(a.cy), a.r * V.s, Math.PI / 2, 3 * Math.PI / 2); ctx.stroke(); });
  ctx.restore();
  if (arcs.length) { const a = arcs[arcs.length - 1]; dot(ctx, V.X(0), V.Y(a.y1), 5, C.text); }
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const runs = [run, s5.prev].filter(Boolean), tMax = Math.max(...runs.map(r => r.time)) * 1e6 * 1.04, eTop = Math.max(...runs.map(r => r.Emax)) / M.MEV * 1.1;
  const xt = niceTicks(tMax), yt = niceTicks(eTop);
  const P = panel(ctx, W, { top: 30, bottom: H - 26, left: 36, xMin: 0, xMax: tMax, yMin: 0, yMax: eTop, yTicks: yt, xTicks: xt, title: t('c5b') });
  polyline(ctx, [[P.x(0), P.y(run.Emax / M.MEV)], [P.x(tMax), P.y(run.Emax / M.MEV)]], C.ghost, 1.4, [6, 5]);
  const curve = (r, upto) => [[P.x(0), P.y(0)], ...r.steps.slice(0, upto).map(s => [P.x(s.t * 1e6), P.y(s.E / M.MEV)])];
  if (s5.prev) polyline(ctx, curve(s5.prev, s5.prev.steps.length), C.raw, 1.6);
  polyline(ctx, curve(run, k), C.cyan, 2.2);
  if (k > 0) { const s = run.steps[k - 1]; dot(ctx, P.x(s.t * 1e6), P.y(s.E / M.MEV), 5, C.cyan); }
  const status = s5.k !== null && s5.k < run.steps.length ? t('s5progress', { k, n: run.steps.length, e: (shown.length ? shown[shown.length - 1].E / M.MEV : 0).toFixed(2) })
    : t('st_' + run.status, { n: run.halfTurns, t: (run.time * 1e6).toFixed(2), e: (run.Eend / M.MEV).toFixed(2), peak: (run.peak / M.MEV).toFixed(2) });
  $('r5').textContent = t('s5readout', { fc: (run.fc / 1e6).toFixed(2), frf: (run.frf / 1e6).toFixed(3), d: (run.d * 100).toFixed(2), status, emax: (run.Emax / M.MEV).toFixed(2), need: run.need, tol: (run.tol * 100).toFixed(2), g: ((M.gamma(run.Emax, M.MP) - 1) * 100).toFixed(2) });
}
function play5() {
  prep5(); const n = s5.run.steps.length; s5.k = 0;
  animate('s5', Math.min(6000, 1500 + n * 8), p => { s5.k = Math.min(n, Math.round(p * n)); draw5(); }, () => { s5.k = null; draw5(); });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('ang0').addEventListener('input', draw0);
  $('qPos0').addEventListener('click', () => { s0.q = 1; draw0(); }); $('qNeg0').addEventListener('click', () => { s0.q = -1; draw0(); });
  $('bIn0').addEventListener('click', () => { s0.into = true; draw0(); }); $('bOut0').addEventListener('click', () => { s0.into = false; draw0(); });

  $('t1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('fieldB1').addEventListener('click', () => { stopAnim('s1'); s1.mode = 'B'; $('t1').value = 0; draw1(); });
  $('fieldE1').addEventListener('click', () => { stopAnim('s1'); s1.mode = 'E'; $('t1').value = 0; draw1(); });
  $('play1').addEventListener('click', () => animate('s1', 5000, p => { $('t1').value = (p * T1).toFixed(2); draw1(); }));

  ['v2', 'B2', 'm2'].forEach(id => { $(id).addEventListener('input', () => { stopAnim('s2'); s2.prog = 1; draw2(); }); });
  $('play2').addEventListener('click', () => animate('s2', 2500, p => { s2.prog = p; draw2(); }));
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.hist.clear(); s2.prog = 1; draw2(); });

  ['B3', 'm3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); draw3(); }));
  $('t3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('play3').addEventListener('click', () => { const T = M.period(num('m3'), 1, num('B3')), end = Math.min(26, 2 * T); animate('s3', 6000, p => { $('t3').value = (p * end).toFixed(2); draw3(); }); });

  ['U4', 'B4'].forEach(id => $(id).addEventListener('input', draw4));

  ['B5', 'U5', 'd5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.k = null; draw5(); }));
  $('play5').addEventListener('click', play5);
  $('end5').addEventListener('click', () => { stopAnim('s5'); s5.k = null; draw5(); });

  const deut = M.cyclotron({ m: M.MD, delta: M.MD / M.MP - 1 });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    const fb = $('quizFeedback'); fb.textContent = ok ? t('correct', { peak: (deut.peak / M.MEV).toFixed(3) }) : t('wrong'); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLorentz = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
