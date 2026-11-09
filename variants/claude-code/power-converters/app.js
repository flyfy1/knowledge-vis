'use strict';
// Buck/boost lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every waveform, voltage, current and power comes from window.PC_MODEL (model.js). Canvas text is limited to
// panel titles (own row), axis ticks, bar labels (own row) and one-letter component labels at fixed offsets.
(function () {

const $ = id => document.getElementById(id);
const M = window.PC_MODEL;
const t = (...a) => window.PC_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', off: '#3a4a5e' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return (((s) => s.includes('.') ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s)(v.toFixed(d)) || '0').replace('-', '−'); };
const US = 1e6;

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
function title(ctx, text, X, Y, maxW, color = C.text) {
  let size = 12;
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// y range and ticks that hold [lo, hi] with about four gridlines
function autoTicks(lo, hi) {
  const span = Math.max(hi - lo, 1e-6), step = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20].find(s => span / s <= 4.5) || 50;
  const a = Math.floor(lo / step - 1e-9) * step, b = Math.ceil(hi / step + 1e-9) * step, ticks = [];
  for (let v = a; v <= b + 1e-9; v += step) ticks.push(Math.round(v / step) * step);
  return { min: a, max: b, ticks };
}
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  if (o.xTicks !== false) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 28, o.xSteps || [1, 2, 5, 10, 20, 50]);
    ctx.textAlign = 'center';
    for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function line(ctx, m, pts, color, lw = 2.2, dash = null) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([a, b], k) => { const X = m.x(a), Y = m.y(b); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
  ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }
function cursor(ctx, X, y0, y1, color = C.text) { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.7; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore(); }

/* ---------- animation runner ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion() || ms <= 0) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); const d = anims[name].done; delete anims[name]; if (d) d(); } }
const running = name => !!anims[name];

/* ---------- schematics: segments in a unit box, each tagged with the loops it belongs to ---------- */
const TOP = 0.22, BOT = 0.86;
const BUCK = [
  { k: 'V', a: [0.06, BOT], b: [0.06, TOP], on: 1 }, { k: 'w', a: [0.06, TOP], b: [0.16, TOP], on: 1 },
  { k: 'S', a: [0.16, TOP], b: [0.32, TOP], on: 1 }, { k: 'w', a: [0.32, TOP], b: [0.4, TOP], on: 1 },
  { k: 'D', a: [0.4, BOT], b: [0.4, TOP], off: 1 }, { k: 'w', a: [0.4, TOP], b: [0.46, TOP], on: 1, off: 1 },
  { k: 'L', a: [0.46, TOP], b: [0.64, TOP], on: 1, off: 1 }, { k: 'w', a: [0.64, TOP], b: [0.74, TOP], on: 1, off: 1 },
  { k: 'w', a: [0.74, TOP], b: [0.92, TOP], on: 1, off: 1 }, { k: 'C', a: [0.74, TOP], b: [0.74, BOT], on: 1, off: 1 },
  { k: 'R', a: [0.92, TOP], b: [0.92, BOT], on: 1, off: 1 }, { k: 'w', a: [0.92, BOT], b: [0.74, BOT], on: 1, off: 1 },
  { k: 'w', a: [0.74, BOT], b: [0.4, BOT], on: 1, off: 1 }, { k: 'w', a: [0.4, BOT], b: [0.06, BOT], on: 1 }
];
const BOOST = [
  { k: 'V', a: [0.06, BOT], b: [0.06, TOP], on: 1, off: 1 }, { k: 'w', a: [0.06, TOP], b: [0.12, TOP], on: 1, off: 1 },
  { k: 'L', a: [0.12, TOP], b: [0.32, TOP], on: 1, off: 1 }, { k: 'w', a: [0.32, TOP], b: [0.42, TOP], on: 1, off: 1 },
  { k: 'S', a: [0.42, TOP], b: [0.42, BOT], on: 1 }, { k: 'D', a: [0.42, TOP], b: [0.6, TOP], off: 1 },
  { k: 'w', a: [0.6, TOP], b: [0.74, TOP], off: 1 }, { k: 'w', a: [0.74, TOP], b: [0.92, TOP], off: 1, cap: 1 },
  { k: 'C', a: [0.74, TOP], b: [0.74, BOT], off: 1, cap: 1 }, { k: 'R', a: [0.92, TOP], b: [0.92, BOT], off: 1, cap: 1 },
  { k: 'w', a: [0.92, BOT], b: [0.74, BOT], off: 1, cap: 1 }, { k: 'w', a: [0.74, BOT], b: [0.42, BOT], off: 1 },
  { k: 'w', a: [0.42, BOT], b: [0.06, BOT], on: 1, off: 1 }
];
const LABEL = { V: 'Vin', S: 'S', D: 'D', L: 'L', C: 'C', R: 'R' };
function schematic(ctx, W, H, segs, on) {
  const x0 = 14, x1 = W - 14, y0 = 34, y1 = H - 10, X = u => x0 + u * (x1 - x0), Y = v => y0 + v * (y1 - y0);
  const colorOf = s => (on ? s.on : s.off) ? C.orange : (on && s.cap) ? C.cyan : C.off;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of segs) {
    const ax = X(s.a[0]), ay = Y(s.a[1]), bx = X(s.b[0]), by = Y(s.b[1]), col = colorOf(s), active = col !== C.off;
    const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len, nx = -uy, ny = ux, mx = (ax + bx) / 2, my = (ay + by) / 2;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = active ? 3 : 2;
    const body = s.k === 'w' ? 0 : Math.min(36, len * 0.6), p0 = [mx - ux * body / 2, my - uy * body / 2], p1 = [mx + ux * body / 2, my + uy * body / 2];
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(...p0); ctx.moveTo(...p1); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath();
    if (s.k === 'w') { ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
    else if (s.k === 'L') { const n = 4, r = body / n / 2; for (let k = 0; k < n; k++) { const cx = p0[0] + ux * (r + 2 * r * k), cy = p0[1] + uy * (r + 2 * r * k); ctx.moveTo(cx - ux * r, cy - uy * r); ctx.arc(cx, cy, r, Math.atan2(uy, ux) + Math.PI, Math.atan2(uy, ux) + 2 * Math.PI, false); } ctx.stroke(); }
    else if (s.k === 'R') { const n = 6; ctx.moveTo(...p0); for (let k = 1; k <= n; k++) { const f = k / n, s2 = k === n ? 0 : (k % 2 ? 1 : -1) * 6; ctx.lineTo(p0[0] + ux * body * f + nx * s2, p0[1] + uy * body * f + ny * s2); } ctx.stroke(); }
    else if (s.k === 'C') { const g = 5; ctx.moveTo(...p0); ctx.lineTo(mx - ux * g, my - uy * g); ctx.moveTo(mx + ux * g, my + uy * g); ctx.lineTo(...p1); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx - ux * g + nx * 11, my - uy * g + ny * 11); ctx.lineTo(mx - ux * g - nx * 11, my - uy * g - ny * 11); ctx.moveTo(mx + ux * g + nx * 11, my + uy * g + ny * 11); ctx.lineTo(mx + ux * g - nx * 11, my + uy * g - ny * 11); ctx.stroke(); }
    else if (s.k === 'S') { const closed = on; ctx.moveTo(...p0); if (closed) ctx.lineTo(...p1); else ctx.lineTo(p1[0] + nx * 12 - ux * 4, p1[1] + ny * 12 - uy * 4); ctx.stroke(); dot(ctx, ...p0, 3, col); dot(ctx, ...p1, 3, col); }
    else if (s.k === 'D') { const h = 9; ctx.moveTo(p0[0] + nx * h, p0[1] + ny * h); ctx.lineTo(p0[0] - nx * h, p0[1] - ny * h); ctx.lineTo(mx + ux * 6, my + uy * 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(mx + ux * 6 + nx * h, my + uy * 6 + ny * h); ctx.lineTo(mx + ux * 6 - nx * h, my + uy * 6 - ny * h); ctx.stroke(); }
    else if (s.k === 'V') { ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke(); ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(mx, my, 13, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(mx - 4, my - 5); ctx.lineTo(mx + 4, my - 5); ctx.moveTo(mx, my - 9); ctx.lineTo(mx, my - 1); ctx.moveTo(mx - 4, my + 6); ctx.lineTo(mx + 4, my + 6); ctx.stroke(); }
    // direction arrow on active wires (segments are authored along the current direction; none on capacitors)
    if (active && s.k === 'w' && len > 26) { const ah = 6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(mx + ux * ah, my + uy * ah); ctx.lineTo(mx - ux * ah + nx * ah * 0.8, my - uy * ah + ny * ah * 0.8); ctx.lineTo(mx - ux * ah - nx * ah * 0.8, my - uy * ah - ny * ah * 0.8); ctx.closePath(); ctx.fill(); }
    if (LABEL[s.k]) {
      ctx.font = '600 12px system-ui,sans-serif'; ctx.fillStyle = active ? C.text : C.muted;
      const vertical = Math.abs(uy) > 0.5;
      if (vertical) { const left = s.k === 'C'; ctx.textAlign = left ? 'right' : 'left'; ctx.fillText(LABEL[s.k], mx + (left ? -16 : s.k === 'R' ? 12 : 16), my + 4); }
      else { ctx.textAlign = 'center'; ctx.fillText(LABEL[s.k], mx, my - 14); }
    }
  }
  ctx.restore();
}

/* ---------- step 0 ---------- */
function bars(ctx, W, rows, scale, y0, gap) {
  rows.forEach((r, i) => {
    const Y = y0 + i * gap, bx = 12, bw = W - 24;
    title(ctx, r.label, bx, Y, bw, C.muted);
    ctx.fillStyle = C.grid; ctx.fillRect(bx, Y + 8, bw, 22);
    let x = bx; r.parts.forEach(([v, col]) => { const w = bw * v / scale; ctx.fillStyle = col; ctx.fillRect(x, Y + 8, Math.max(0, w), 22); x += w; });
  });
}
function draw0() {
  const vo = num('Vo0'), io = num('Io0'), Vin = M.P.buck.Vin, lin = M.linear(Vin, vo, io), sw = M.ideal(Vin, vo, io);
  $('Vo0v').textContent = fmt(vo, 1) + ' V'; $('Io0v').textContent = fmt(io, 1) + ' A';
  const { ctx, W } = fitCanvas($('c0'));
  bars(ctx, W, [{ label: t('c0lin', { pin: fmt(lin.pin, 1) }), parts: [[lin.pout, C.cyan], [lin.heat, C.orange]] }, { label: t('c0sw', { pin: fmt(sw.pin, 1) }), parts: [[sw.pout, C.cyan]] }], Vin * 3, 26, 72);
  $('r0').textContent = t('s0readout', { vo: fmt(vo, 1), io: fmt(io, 1), po: fmt(lin.pout, 2), pl: fmt(lin.pin, 2), heat: fmt(lin.heat, 2), eff: fmt(lin.eff * 100, 1), iin: fmt(sw.iin, 3) });
}

/* ---------- step 1: inductor pulses ---------- */
const s1 = { V: [] }, MAXP = 16;
function draw1() {
  const V = num('V1'); $('V1v').textContent = fmt(V, 0) + ' V';
  const pts = [[0, 0]]; let i = 0;
  s1.V.forEach((v, k) => { i += M.pulseStep(v); pts.push([(k + 1) * M.P.pulse * US, i]); });
  const { ctx, W, H } = fitCanvas($('c1'));
  const ys = pts.map(p => p[1]), rg = autoTicks(Math.min(-2, ...ys), Math.max(2, ...ys));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: MAXP * 10, yMin: rg.min, yMax: rg.max, yTicks: rg.ticks, xSteps: [10, 20, 40, 80], minPx: 30, title: t('c1T') });
  s1.V.forEach((v, k) => { const col = v > 0 ? C.orange : v < 0 ? C.cyan : C.muted; line(ctx, m, [pts[k], pts[k + 1]], col, 2.6); });
  pts.forEach(p => dot(ctx, m.x(p[0]), m.y(p[1]), 3, C.text));
  $('pulse1').disabled = s1.V.length >= MAXP;
  $('r1').textContent = t('s1readout', { n: s1.V.length, max: MAXP, i: fmt(i, 3), e: fmt(M.energy(M.P.L, i) * 1e6, 2) });
  const last = s1.V[s1.V.length - 1];
  $('r1b').textContent = s1.V.length >= MAXP ? t('s1full', { max: MAXP }) : last === undefined ? t('s1none') : t('s1last', { v: fmt(last, 0), slope: fmt(last / M.P.L / US, 4), di: fmt(M.pulseStep(last), 3) });
}

/* ---------- step 2: buck volt-second balance ---------- */
function draw2() {
  const D = num('D2'), Vg = num('Vg2'), ph = num('ph2'), Vin = M.P.buck.Vin, R = M.P.buck.R, T = M.P.T * US, on = ph < D * T - 1e-9;
  $('D2v').textContent = fmt(D, 2); $('Vg2v').textContent = fmt(Vg, 1) + ' V'; $('ph2v').textContent = fmt(ph, 1) + ' µs';
  $('play2').textContent = running('s2') ? t('pause') : t('play2');
  let { ctx, W, H } = fitCanvas($('c2s'));
  title(ctx, t('c2s', { phase: on ? t('phOn') : t('phOff') }), 8, 18, W - 16);
  schematic(ctx, W, H, BUCK, on);
  ({ ctx, W, H } = fitCanvas($('c2w')));
  const N = 6, xMax = N * T;
  const A = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax, yMin: -12, yMax: 12, yTicks: [-12, 0, 12], xSteps: [10, 20], minPx: 30, title: t('c2v') });
  for (let c = 0; c < N; c++) {
    const t0 = c * T, t1 = t0 + D * T, t2 = t0 + T, von = Vin - Vg;
    ctx.fillStyle = 'rgba(255,180,84,0.35)'; ctx.fillRect(A.x(t0), Math.min(A.y(von), A.y(0)), A.x(t1) - A.x(t0), Math.abs(A.y(von) - A.y(0)));
    ctx.fillStyle = 'rgba(103,215,249,0.35)'; ctx.fillRect(A.x(t1), A.y(0), A.x(t2) - A.x(t1), A.y(-Vg) - A.y(0));
    line(ctx, A, [[t0, von], [t1, von], [t1, -Vg], [t2, -Vg]], C.text, 1.6);
  }
  // inductor current with the output held at Vg, starting from the true steady-state valley
  const i0 = D * Vin / R - M.buckRipple(Vin, D) / 2, up = (Vin - Vg) / M.P.L / US, dn = -Vg / M.P.L / US, pts = [[0, i0]];
  let i = i0; for (let c = 0; c < N; c++) { i += up * D * T; pts.push([c * T + D * T, i]); i += dn * (1 - D) * T; pts.push([(c + 1) * T, i]); }
  const ys = pts.map(p => p[1]), rg = autoTicks(Math.min(0, ...ys), Math.max(...ys));
  const B = panel(ctx, W, { top: 192, bottom: H - 26, xMin: 0, xMax, yMin: rg.min, yMax: rg.max, yTicks: rg.ticks, xSteps: [10, 20], minPx: 30, title: t('c2i') });
  line(ctx, B, [[0, i0], [xMax, i0]], C.muted, 1, [3, 4]);
  line(ctx, B, pts, C.green, 2.4);
  const iNow = ph < D * T ? i0 + up * ph : i0 + up * D * T + dn * (ph - D * T);
  cursor(ctx, A.x(ph), A.P.t, B.P.b); dot(ctx, B.x(ph), B.y(iNow), 5, C.text);
  const drift = M.buckDrift(Vin, D, Vg), tol = 0.005;
  const verdict = drift > tol ? t('s2up') : drift < -tol ? t('s2down') : t('s2ok', { vo: fmt(D * Vin, 2) });
  $('r2').textContent = t('s2readout', { d: fmt(D, 2), vg: fmt(Vg, 1), von: fmt(Vin - Vg, 1), ton: fmt(D * T, 1), toff: fmt((1 - D) * T, 1), drift: (drift > 0 ? '+' : '') + fmt(drift, 3), verdict });
}

/* ---------- step 3: start-up simulation ---------- */
const s3 = { key: null, run: null, k: null };
function run3() {
  const D = num('D3'), R = num('R3'), key = D + '|' + R;
  if (s3.key !== key) { s3.key = key; s3.run = M.startup(D, R); s3.k = s3.run.cycles; }
  return s3.run;
}
function draw3() {
  const D = num('D3'), R = num('R3'), S = run3(), n = S.cycles, k = s3.k, per = S.per;
  $('D3v').textContent = fmt(D, 2); $('R3v').textContent = R + ' Ω';
  $('play3').textContent = running('s3') ? t('pause') : t('play3');
  const { ctx, W, H } = fitCanvas($('c3'));
  const ms = n * M.P.T * 1e3, upto = k * per;
  const vr = autoTicks(0, Math.max(S.peak, S.target) * 1.05);
  const A = panel(ctx, W, { top: 30, bottom: 186, xMin: 0, xMax: ms, yMin: vr.min, yMax: vr.max, yTicks: vr.ticks, xSteps: [0.5, 1, 2], minPx: 30, title: t('c3v') });
  line(ctx, A, [[0, S.target], [ms, S.target]], C.muted, 1.2, [5, 4]);
  const step = Math.max(1, Math.floor(upto / 1500)), vp = [];
  for (let q = 0; q <= upto && q < S.run.length; q += step) vp.push([S.run[q].t * 1e3, S.run[q].v]);
  if (vp.length > 1) line(ctx, A, vp, C.cyan, 2);
  // current band: per-cycle max and min
  const env = []; let imax = 0, imin = 0;
  for (let c = 0; c < n; c++) { let lo = Infinity, hi = -Infinity; for (let q = c * per; q < (c + 1) * per; q++) { lo = Math.min(lo, S.run[q].i); hi = Math.max(hi, S.run[q].i); } env.push([lo, hi]); imax = Math.max(imax, hi); imin = Math.min(imin, lo); }
  const ir = autoTicks(imin, imax);
  const B = panel(ctx, W, { top: 232, bottom: H - 26, xMin: 0, xMax: ms, yMin: ir.min, yMax: ir.max, yTicks: ir.ticks, xSteps: [0.5, 1, 2], minPx: 30, title: t('c3i') });
  if (k > 0) {
    ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.55)'; ctx.beginPath();
    for (let c = 0; c < k; c++) ctx.lineTo(B.x((c + 0.5) * M.P.T * 1e3), B.y(env[c][1]));
    for (let c = k - 1; c >= 0; c--) ctx.lineTo(B.x((c + 0.5) * M.P.T * 1e3), B.y(env[c][0]));
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  const tNow = k * M.P.T * 1e3, vNow = S.run[Math.min(upto, S.run.length - 1)].v;
  cursor(ctx, A.x(tNow), A.P.t, B.P.b);
  $('r3').textContent = t('s3readout', { k, n, ms: fmt(tNow, 2), v: fmt(vNow, 2) });
  const F = M.filter(R);
  $('r3b').innerHTML = k >= n ? t('s3final', { vf: fmt(S.final, 3), vt: fmt(S.target, 2), pk: fmt(S.peak, 2), os: fmt(S.overshoot * 100, 0), f0: fmt(F.f0, 0), z: fmt(F.zeta, 3) }) : '';
}

/* ---------- step 4: boost ---------- */
const s4 = { key: null, st: null };
function draw4() {
  const D = num('D4'), ph = num('ph4'), Vin = M.P.boost.Vin, R = M.P.boost.R, T = M.P.T * US, on = ph < D * T - 1e-9;
  $('D4v').textContent = fmt(D, 2); $('ph4v').textContent = fmt(ph, 1) + ' µs';
  $('play4').textContent = running('s4') ? t('pause') : t('play4');
  if (s4.key !== D) { s4.key = D; s4.st = M.steady('boost', Vin, D, R); }
  const st = s4.st, seg = st.seg, sub = seg.length;
  let { ctx, W, H } = fitCanvas($('c4s'));
  title(ctx, t('c4s', { phase: on ? t('phOnB') : t('phOffB') }), 8, 18, W - 16);
  schematic(ctx, W, H, BOOST, on);
  ({ ctx, W, H } = fitCanvas($('c4w')));
  const N = 3, xMax = N * T, il = [], id = [];
  for (let c = 0; c < N; c++) seg.forEach((p, q) => { const tt = c * T + q / sub * T; il.push([tt, p.i]); id.push([tt, p.on ? 0 : p.i]); });
  const rg = autoTicks(0, Math.max(...il.map(p => p[1])) * 1.05);
  const A = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax, yMin: rg.min, yMax: rg.max, yTicks: rg.ticks, xSteps: [5, 10], minPx: 30, title: t('c4i') });
  line(ctx, A, il, C.green, 2.4);
  const B = panel(ctx, W, { top: 192, bottom: H - 26, xMin: 0, xMax, yMin: rg.min, yMax: rg.max, yTicks: rg.ticks, xSteps: [5, 10], minPx: 30, title: t('c4o') });
  line(ctx, B, id, C.orange, 2.2);
  const vo = Vin * M.boostRatio(D), io = vo / R;
  line(ctx, B, [[0, io], [xMax, io]], C.text, 1.2, [5, 4]);
  const q = Math.min(sub - 1, Math.floor(ph / T * sub)), pNow = seg[q];
  cursor(ctx, A.x(ph), A.P.t, B.P.b); dot(ctx, A.x(ph), A.y(pNow.i), 5, C.text); dot(ctx, B.x(ph), B.y(on ? 0 : pNow.i), 5, C.text);
  const ilAvg = io / (1 - D);
  $('r4').textContent = t('s4readout', { d: fmt(D, 2), vo: fmt(vo, 2), vs: fmt(st.v, 2), io: fmt(io, 3), il: fmt(ilAvg, 3), pin: fmt(Vin * ilAvg, 2), pout: fmt(vo * io, 2) });
}

/* ---------- step 5: ripple and DCM ---------- */
const s5 = { key: null, dots: new Map(), cache: new Map() };
function steady5(D, L, R) { const k = D + '|' + L + '|' + R; if (!s5.cache.has(k)) { if (s5.cache.size > 400) s5.cache.clear(); s5.cache.set(k, M.steady('buck', M.P.buck.Vin, D, R, L * 1e-6)); } return s5.cache.get(k); }
function draw5() {
  const D = num('D5'), L = num('L5'), R = num('R5'), Vin = M.P.buck.Vin, T = M.P.T * US;
  $('D5v').textContent = fmt(D, 2); $('L5v').textContent = L + ' µH'; $('R5v').textContent = R + ' Ω';
  const key = D + '|' + R; if (s5.key !== key) { s5.key = key; s5.dots = new Map(); }
  const st = steady5(D, L, R); s5.dots.set(L, st.v / Vin);
  let { ctx, W, H } = fitCanvas($('c5a'));
  const seg = st.seg, sub = seg.length, pts = [];
  for (let c = 0; c < 3; c++) seg.forEach((p, q) => pts.push([c * T + q / sub * T, p.i]));
  const rg = autoTicks(Math.min(0, ...pts.map(p => p[1])), Math.max(...pts.map(p => p[1])) * 1.05);
  const A = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 3 * T, yMin: rg.min, yMax: rg.max, yTicks: rg.ticks, xSteps: [5, 10], minPx: 30, title: t('c5a') });
  line(ctx, A, pts, C.green, 2.4);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const B = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 100, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], xSteps: [20, 25, 50], minPx: 30, title: t('c5b') });
  line(ctx, B, [[0, D], [100, D]], C.muted, 1.2, [5, 4]);
  const curve = []; for (let l = 1; l <= 100; l += 0.5) curve.push([l, M.buckM(D, l * 1e-6, R)]);
  line(ctx, B, curve, C.orange, 2.2);
  const lc = M.Lcrit(D, R) * US; if (lc <= 100) cursor(ctx, B.x(lc), B.P.t, B.P.b, C.pink);
  s5.dots.forEach((m, l) => dot(ctx, B.x(l), B.y(m), l === L ? 6 : 3.5, l === L ? C.text : C.cyan));
  const ccm = M.buckCCM(D, L * 1e-6, R), rip = ccm ? M.buckRipple(Vin, D, L * 1e-6) : st.iMax - st.iMin; // DCM: simulated peak-to-peak
  $('r5').textContent = t('s5readout', { l: L, r: R, d: fmt(D, 2), ri: fmt(rip, 3), ia: fmt(st.v / R, 3), lc: fmt(lc, 1), mode: ccm ? t('modeCCM') : t('modeDCM'), vs: fmt(st.v, 3), vt: fmt(Vin * M.buckM(D, L * 1e-6, R), 3), vd: fmt(D * Vin, 2) });
}

/* ---------- step 6: budget ---------- */
const s6 = { checked: false };
function quizOptions() {
  const Q = M.QUIZ, real = M.budget(Q.Vin, Q.Vout, Q.Iout, Q.eff).iin, idl = M.budget(Q.Vin, Q.Vout, Q.Iout, 1).iin;
  return { ok: real, list: [Q.Iout * Q.Vin / Q.Vout, Q.Iout, idl, real].map(v => Math.round(v * 100) / 100) };
}
function buildQuiz() {
  const prev = document.querySelector('input[name="q6"]:checked'), keep = prev ? prev.value : null, O = quizOptions();
  $('q6o').innerHTML = O.list.map(v => `<label><input type="radio" name="q6" value="${v}"${String(v) === keep ? ' checked' : ''}><span>${t('optA', { v: fmt(v, 2) })}</span></label>`).join('');
}
function draw6() {
  const Q = M.QUIZ, eff = num('E6') / 100, b = M.budget(Q.Vin, Q.Vout, Q.Iout, eff), idl = M.budget(Q.Vin, Q.Vout, Q.Iout, 1);
  $('E6v').textContent = fmt(eff * 100, 0) + '%'; $('E6').disabled = !s6.checked;
  const { ctx, W } = fitCanvas($('c6'));
  if (s6.checked) bars(ctx, W, [{ label: t('c6T', { pin: fmt(b.pin, 2), pout: fmt(b.pout, 2), loss: fmt(b.loss, 2) }), parts: [[b.pout, C.cyan], [b.loss, C.orange]] }], Q.Vout * Q.Iout / 0.7, 30, 0);
  else bars(ctx, W, [{ label: '', parts: [] }], 1, 30, 0);
  $('r6').textContent = s6.checked ? t('s6readout', { eff: fmt(eff * 100, 0), pin: fmt(b.pin, 2), iin: fmt(b.iin, 3), loss: fmt(b.loss, 2), iid: fmt(idl.iin, 2) }) : t('s6locked');
  const fb = $('fb6'); if (fb.dataset.state) { const okk = fb.dataset.state === 'right'; fb.textContent = t(okk ? 's6right' : fb.dataset.state === 'ideal' ? 's6ideal' : 's6wrong'); fb.style.color = okk ? C.green : C.orange; }
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); buildQuiz(); draw6(); }

function cyclePlay(name, input, draw) {
  if (running(name)) { stopAnim(name); draw(); return; }
  animate(name, 3000, p => { $(input).value = (Math.min(9.9, p * 10)).toFixed(1); draw(); }, () => setTimeout(draw, 0));
  draw();
}

function setup() {
  ['Vo0', 'Io0'].forEach(id => $(id).addEventListener('input', draw0));
  $('V1').addEventListener('input', draw1);
  $('pulse1').addEventListener('click', () => { if (s1.V.length < MAXP) s1.V.push(num('V1')); draw1(); });
  $('reset1').addEventListener('click', () => { s1.V = []; draw1(); });
  ['D2', 'Vg2'].forEach(id => $(id).addEventListener('input', draw2));
  $('ph2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('snap2').addEventListener('click', () => { $('Vg2').value = (num('D2') * M.P.buck.Vin).toFixed(1); draw2(); });
  $('play2').addEventListener('click', () => cyclePlay('s2', 'ph2', draw2));
  ['D3', 'R3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); draw3(); }));
  $('play3').addEventListener('click', () => {
    if (running('s3')) { stopAnim('s3'); draw3(); return; }
    const S = run3(); s3.k = 0; draw3();
    animate('s3', 6000, p => { s3.k = Math.round(p * S.cycles); draw3(); }, () => setTimeout(draw3, 0));
  });
  $('show3').addEventListener('click', () => { stopAnim('s3'); s3.k = run3().cycles; draw3(); });
  $('D4').addEventListener('input', draw4);
  $('ph4').addEventListener('input', () => { stopAnim('s4'); draw4(); });
  $('play4').addEventListener('click', () => cyclePlay('s4', 'ph4', draw4));
  ['D5', 'L5', 'R5'].forEach(id => $(id).addEventListener('input', draw5));
  document.addEventListener('change', e => { if (e.target.name === 'q6') { delete $('fb6').dataset.state; $('fb6').textContent = ''; } });
  $('check6').addEventListener('click', () => {
    const c = document.querySelector('input[name="q6"]:checked'), fb = $('fb6');
    if (!c) { fb.textContent = t('s6locked'); fb.style.color = C.orange; return; }
    const O = quizOptions(), v = Number(c.value), idl = M.budget(M.QUIZ.Vin, M.QUIZ.Vout, M.QUIZ.Iout, 1).iin; fb.dataset.state = Math.abs(v - O.ok) < 0.01 ? 'right' : Math.abs(v - idl) < 0.01 ? 'ideal' : 'wrong'; s6.checked = true; draw6();
  });
  $('E6').addEventListener('input', draw6);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) Object.keys(anims).forEach(stopAnim); });
  window.refreshConverters = refresh;
  s1.V = [6, 6, 0, -6];
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
