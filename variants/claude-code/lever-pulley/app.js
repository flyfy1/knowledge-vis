'use strict';
// Levers & pulleys lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every force, lever arm, distance and amount of work comes from window.LP_MODEL (model.js); the canvases draw
// those numbers to scale and the readouts print the same numbers. Canvas text is limited to ruler/axis ticks,
// arm letters (L阻/L动, h, s), ledger row names and segment numbers, laid out so they cannot collide.
(function () {

const $ = id => document.getElementById(id);
const M = window.LP_MODEL;
const t = (...a) => window.LP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', yellow: '#ffe27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', wood: '#b08a5a', steel: '#8fa3b8', rock: '#6f7d8c', ground: '#2b3a4b', rope: '#c9b98c', ghost: '#8696aa', free: '#8696aa' };
const FONT = '600 12px system-ui,sans-serif';
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Math.round(Number($(id).value) * 1000) / 1000;
const trim = s => s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return trim(v.toFixed(d)); };
// A value that is a whole number prints as one with "="; otherwise one decimal with "≈".
const exact = v => Math.abs(v - Math.round(v)) < 1e-6;
const whole = v => (exact(v) ? { eq: '=', s: String(Math.round(v)) } : { eq: '≈', s: v.toFixed(1) });

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  let height;
  if (canvas.dataset.aspect) height = Math.round(Math.min(Number(canvas.dataset.max), Math.max(Number(canvas.dataset.min), width * Number(canvas.dataset.aspect))));
  else { if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300; height = Number(canvas.dataset.h); }
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// World (m) → canvas px, one scale for both axes so lengths and angles are true to each other.
function view(W, H, box, pad = 12) {
  const s = Math.min((W - 2 * pad) / (box.x1 - box.x0), (H - 2 * pad) / (box.y1 - box.y0));
  const ox = (W - s * (box.x1 - box.x0)) / 2, oy = (H - s * (box.y1 - box.y0)) / 2;
  return { s, X: x => ox + (x - box.x0) * s, Y: y => oy + (box.y1 - y) * s };
}
function seg(ctx, x0, y0, x1, y1, color, lw = 1.6, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 3) {
  const L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.5) return;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L, head = Math.min(10, Math.max(5, L * 0.45));
  seg(ctx, x0, y0, x1 - ux * head * 0.7, y1 - uy * head * 0.7, color, lw);
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - ux * head - uy * head * 0.5, y1 - uy * head + ux * head * 0.5);
  ctx.lineTo(x1 - ux * head + uy * head * 0.5, y1 - uy * head - ux * head * 0.5); ctx.closePath(); ctx.fill(); ctx.restore();
}
// Horizontal double-arrow dimension from X0 to X1 at height Y; optional label sits on a background chip.
function dimH(ctx, X0, X1, Y, color, text, W) {
  const a = Math.min(X0, X1), b = Math.max(X0, X1);
  seg(ctx, a, Y, b, Y, color, 1.4); seg(ctx, a, Y - 5, a, Y + 5, color, 1.4); seg(ctx, b, Y - 5, b, Y + 5, color, 1.4);
  if (b - a > 12) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(a, Y); ctx.lineTo(a + 6, Y - 3.5); ctx.lineTo(a + 6, Y + 3.5); ctx.fill(); ctx.beginPath(); ctx.moveTo(b, Y); ctx.lineTo(b - 6, Y - 3.5); ctx.lineTo(b - 6, Y + 3.5); ctx.fill(); ctx.restore(); }
  if (!text) return;
  ctx.save(); ctx.font = FONT; const w = ctx.measureText(text).width + 8;
  const mid = b - a < w + 4 ? a - w / 2 - 3 : (a + b) / 2; // too narrow: label sits just left of the span
  const cx = Math.max(w / 2 + 2, Math.min(W - w / 2 - 2, mid));
  ctx.fillStyle = C.bg; ctx.fillRect(cx - w / 2, Y - 17, w, 15);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, cx, Y - 9.5); ctx.restore();
}
// Vertical bracket from Y0 to Y1 at X with a one-letter label on the given side.
function bracketV(ctx, X, Y0, Y1, color, text, side) {
  if (Math.abs(Y1 - Y0) < 1) return;
  seg(ctx, X, Y0, X, Y1, color, 2); seg(ctx, X - 4, Y0, X + 4, Y0, color, 2); seg(ctx, X - 4, Y1, X + 4, Y1, color, 2);
  ctx.save(); ctx.font = 'italic 700 13px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textBaseline = 'middle';
  ctx.textAlign = side < 0 ? 'right' : 'left'; ctx.fillText(text, X + side * 7, (Y0 + Y1) / 2); ctx.restore();
}
function title(ctx, text, x, y, maxW) {
  let size = 12; ctx.save(); ctx.font = `600 ${size}px system-ui,sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 9) { size -= 0.5; ctx.font = `600 ${size}px system-ui,sans-serif`; }
  ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y); ctx.restore();
}
// Two-row horizontal bar chart (torques or a work ledger) with its own title row and a tick axis.
function hbars(id, rows, max, step, ttl, mark = null) {
  const { ctx, W } = fitCanvas($(id));
  title(ctx, ttl, 10, 12, W - 20);
  ctx.save(); ctx.font = FONT;
  const lw = Math.max(...rows.map(r => ctx.measureText(r.label).width)) + 10;
  const x0 = 10 + lw, x1 = W - 20, sx = v => x0 + (x1 - x0) * Math.max(0, Math.min(max, v)) / max;
  rows.forEach((r, i) => {
    const y = 28 + i * 28;
    ctx.fillStyle = r.color; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(r.label, x0 - 6, y + 9);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x0, y, x1 - x0, 18);
    ctx.fillStyle = r.color; ctx.fillRect(x0, y, sx(r.value) - x0, 18);
  });
  const ya = 28 + rows.length * 28 + 2;
  if (mark !== null) seg(ctx, sx(mark), 24, sx(mark), ya, C.green, 2, [4, 3]);
  seg(ctx, x0, ya, x1, ya, C.axis, 1);
  ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let v = 0; v <= max + 1e-9; v += step) { seg(ctx, sx(v), ya, sx(v), ya + 4, C.axis, 1); ctx.fillText(String(Math.round(v)), sx(v), ya + 13); }
  ctx.restore();
}
function triangle(ctx, X, Ytop, Ybase, half, fill) { ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(X, Ytop); ctx.lineTo(X - half, Ybase); ctx.lineTo(X + half, Ybase); ctx.closePath(); ctx.fill(); ctx.restore(); }
function ground(ctx, W, Y) { ctx.save(); ctx.fillStyle = '#121c27'; ctx.fillRect(0, Y, W, 4000); seg(ctx, 0, Y, W, Y, C.ground, 2); ctx.restore(); }

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
const ease = p => p * p * (3 - 2 * p);

/* ---------- step 0: seesaw ---------- */
const S0 = { pivotH: 0.6, half: 2.3, box: { x0: -2.55, x1: 2.55, y0: -0.6, y1: 2.15 } };
const s0 = { cur: null, raf: 0 };
function person(ctx, V, x, y, phi, big, color) {
  // seated figure, upright, centred on the board point (x, y)
  const w = big ? 0.3 : 0.22, h = big ? 0.5 : 0.36, r = big ? 0.13 : 0.1, k = V.s;
  ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 0.9;
  ctx.fillRect(V.X(x) - w / 2 * k, V.Y(y + 0.05 + h), w * k, h * k);
  ctx.beginPath(); ctx.arc(V.X(x), V.Y(y + 0.05 + h + r + 0.02), r * k, 0, 7); ctx.fill(); ctx.restore();
}
function draw0(animTo = true) {
  const dL = num('dL'), dR = num('dR');
  $('dLv').textContent = dL.toFixed(1) + ' m'; $('dRv').textContent = dR.toFixed(1) + ' m';
  const r = M.seesaw(M.SEE.adult, dL, M.SEE.child, dR);
  if (s0.cur === null || !animTo || reduceMotion()) { s0.cur = r.tilt; cancelAnimationFrame(s0.raf); s0.raf = 0; }
  else if (Math.abs(s0.cur - r.tilt) > 0.02 && !s0.raf) {
    const step = () => { s0.cur += (r2().tilt - s0.cur) * 0.14; if (Math.abs(s0.cur - r2().tilt) < 0.02) { s0.cur = r2().tilt; s0.raf = 0; } else s0.raf = requestAnimationFrame(step); paint0(); };
    s0.raf = requestAnimationFrame(step);
  }
  paint0();
  hbars('c0b', [{ label: t('barL'), value: r.ML, color: C.orange }, { label: t('barR'), value: r.MR, color: C.cyan }], 1200, 300, t('c0b'), r.balanced ? r.ML : null);
  const verdict = r.balanced ? t('s0bal') : r.diff > 0 ? t('s0left', { d: fmt(r.diff, 0) }) : t('s0right', { d: fmt(-r.diff, 0) });
  $('r0').textContent = t('s0readout', { dL: dL.toFixed(1), dR: dR.toFixed(1), ML: fmt(r.ML, 0), MR: fmt(r.MR, 0), verdict });
}
const r2 = () => M.seesaw(M.SEE.adult, num('dL'), M.SEE.child, num('dR'));
function paint0() {
  const dL = num('dL'), dR = num('dR'), r = r2();
  const { ctx, W, H } = fitCanvas($('c0')), V = view(W, H, S0.box);
  const phi = s0.cur * Math.PI / 180, P = x => [x * Math.cos(phi), S0.pivotH + x * Math.sin(phi)];
  ground(ctx, W, V.Y(0));
  // ruler (fixed, level): horizontal distance from the pivot
  const yr = -0.32;
  seg(ctx, V.X(-2), V.Y(yr), V.X(2), V.Y(yr), C.axis, 1.2);
  ctx.save(); ctx.font = FONT; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = -10; i <= 10; i++) { const x = i * 0.2, major = i % 5 === 0; seg(ctx, V.X(x), V.Y(yr), V.X(x), V.Y(yr) + (major ? 6 : 3), C.axis, 1); if (major) ctx.fillText(Math.abs(i) === 10 ? '2 m' : String(Math.abs(x)), V.X(x), V.Y(yr) + 15); }
  ctx.restore();
  // lever arms: horizontal distance pivot → each person's line of action
  const aL = P(-dL), aR = P(dR), ya = V.Y(yr) - 9;
  dimH(ctx, V.X(0), V.X(aL[0]), ya, C.text, '', W); dimH(ctx, V.X(0), V.X(aR[0]), ya, C.text, '', W);
  seg(ctx, V.X(aL[0]), V.Y(aL[1]), V.X(aL[0]), ya, C.ghost, 1, [3, 4]); seg(ctx, V.X(aR[0]), V.Y(aR[1]), V.X(aR[0]), ya, C.ghost, 1, [3, 4]);
  // pivot and board
  triangle(ctx, V.X(0), V.Y(S0.pivotH), V.Y(0), 0.22 * V.s, r.balanced ? C.green : '#55657a');
  const e0 = P(-S0.half), e1 = P(S0.half);
  seg(ctx, V.X(e0[0]), V.Y(e0[1]), V.X(e1[0]), V.Y(e1[1]), C.wood, Math.max(5, 0.07 * V.s));
  // seat notches every 0.2 m
  for (let i = 2; i <= 10; i++) [-1, 1].forEach(sg => { const q = P(sg * i * 0.2); dotP(ctx, V.X(q[0]), V.Y(q[1]), 1.6, '#3b2d1c'); });
  person(ctx, V, aL[0], aL[1], phi, true, C.orange); person(ctx, V, aR[0], aR[1], phi, false, C.cyan);
  // weights: arrows from each person's centre straight down, length ∝ force (600 N ↔ 0.55 m)
  const k = 0.55 / 600;
  arrow(ctx, V.X(aL[0]), V.Y(aL[1] + 0.3), V.X(aL[0]), V.Y(aL[1] + 0.3 - r.FL * k), C.orange, 3.5);
  arrow(ctx, V.X(aR[0]), V.Y(aR[1] + 0.22), V.X(aR[0]), V.Y(aR[1] + 0.22 - r.FR * k), C.cyan, 3.5);
}
function dotP(ctx, X, Y, rr, fill) { ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(X, Y, rr, 0, 7); ctx.fill(); ctx.restore(); }

/* ---------- steps 1–2: crowbar scenes ---------- */
// Bar pivots on the fulcrum at (Lr, yb); rock rests on the bar's tip at x = 0 on a ledge of height yb.
function crowbarScene(ctx, V, W, o) {
  const { Lr, Le, yb, alpha, F, G, arms, marks } = o;
  ground(ctx, W, V.Y(0));
  ctx.save(); ctx.fillStyle = '#1b2735'; ctx.fillRect(V.X(-0.62), V.Y(yb), 0.6 * V.s, yb * V.s); ctx.restore(); // ledge
  const ca = Math.cos(alpha), sa = Math.sin(alpha);
  const tip = [Lr - Lr * ca, yb + Lr * sa], hand = [Lr + Le * ca, yb - Le * sa];
  if (marks) { seg(ctx, V.X(0), V.Y(yb), V.X(Lr + Le), V.Y(yb), C.ghost, 1.5, [5, 4]); }
  // rock: sits on the tip, rises with it
  const rise = tip[1] - yb, rx0 = -0.55, rx1 = 0.02;
  ctx.save(); ctx.fillStyle = C.rock; ctx.beginPath();
  [[rx0, 0], [rx1, 0], [rx1 - 0.04, 0.32], [-0.2, 0.46], [rx0 + 0.05, 0.4], [rx0 - 0.02, 0.15]].forEach(([x, y], i) => { const X = V.X(x), Y = V.Y(yb + rise + y); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
  ctx.closePath(); ctx.fill(); ctx.restore();
  triangle(ctx, V.X(Lr), V.Y(yb) + 2, V.Y(0), 0.09 * V.s, '#55657a');
  seg(ctx, V.X(tip[0]), V.Y(tip[1]), V.X(hand[0]), V.Y(hand[1]), C.steel, Math.max(4, 0.04 * V.s));
  dotP(ctx, V.X(hand[0]), V.Y(hand[1]), Math.max(5, 0.05 * V.s), C.orange);
  // forces, one scale: 800 N ↔ 0.45 m
  const k = 0.45 / 800;
  arrow(ctx, V.X(-0.26), V.Y(yb + rise + 0.3), V.X(-0.26), V.Y(yb + rise + 0.3 - G * k), C.cyan, 3.5);
  arrow(ctx, V.X(hand[0]), V.Y(hand[1] + F * k + 0.04), V.X(hand[0]), V.Y(hand[1] + 0.04), C.orange, 3.5);
  if (arms) {
    const Yd = V.Y(yb + 0.62);
    dimH(ctx, V.X(0), V.X(Lr), Yd, C.cyan, t('armR'), W);
    dimH(ctx, V.X(Lr), V.X(Lr + Le), Yd, C.orange, t('armE'), W);
  }
  return { tip, hand, rise };
}
const S1 = { yb: 0.5, box: { x0: -0.72, x1: 1.62, y0: -0.05, y1: 1.25 } };
const s1 = { p: 0, lifted: false, hist: new Set() };
function draw1() {
  const Lr = num('Lr'), cb = M.crowbar(Lr);
  $('Lrv').textContent = fmt(Lr, 2) + ' m';
  s1.hist.add(Lr.toFixed(2));
  const { ctx, W, H } = fitCanvas($('c1')), V = view(W, H, S1.box);
  // visual lift: the hand may drop at most 0.4 m, so the rock rises 0.4·Lr/Le (capped at 6 cm)
  const riseMax = Math.min(0.06, 0.4 * Lr / cb.Le), alpha = Math.asin(riseMax / Lr) * ease(s1.p);
  crowbarScene(ctx, V, W, { Lr, Le: cb.Le, yb: S1.yb, alpha, F: cb.F, G: M.BAR.rock, arms: true, marks: false });
  drawCurve1(Lr);
  const F = whole(cb.F);
  $('r1').textContent = t('s1readout', { Lr: fmt(Lr, 2), Le: fmt(cb.Le, 2), eq: F.eq, F: F.s, Min: fmt(cb.Min, 1), Mout: fmt(cb.Mout, 1), gain: fmt(cb.gain, 2), lift: s1.lifted ? t('s1lifted') : '' }).trim();
}
function drawCurve1(Lr) {
  const { ctx, W, H } = fitCanvas($('c1b'));
  title(ctx, t('c1b'), 10, 12, W - 20);
  const x0 = 46, x1 = W - 18, y0 = H - 26, y1 = 30, LX = v => x0 + (x1 - x0) * (v - 0.05) / 0.5, LY = v => y0 - (y0 - y1) * v / 600;
  ctx.save(); ctx.font = FONT; ctx.fillStyle = C.muted; ctx.textBaseline = 'middle';
  for (let v = 0; v <= 600; v += 200) { seg(ctx, x0, LY(v), x1, LY(v), C.grid, 1); ctx.textAlign = 'right'; ctx.fillText(String(v), x0 - 6, LY(v)); }
  for (let i = 1; i <= 5; i++) { const v = i / 10; seg(ctx, LX(v), y0, LX(v), y0 + 4, C.axis, 1); ctx.textAlign = 'center'; ctx.fillText(v.toFixed(1), LX(v), y0 + 14); }
  seg(ctx, x0, y0, x1, y0, C.axis, 1); seg(ctx, x0, y0, x0, y1 - 6, C.axis, 1);
  ctx.restore();
  const pts = [...s1.hist].map(Number).sort((a, b) => a - b).map(v => [LX(v), LY(M.crowbar(v).F)]);
  ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
  pts.forEach(([X, Y]) => dotP(ctx, X, Y, 3.5, C.text));
  const cx = LX(Lr), cy = LY(M.crowbar(Lr).F);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.stroke(); ctx.restore();
}

const S2 = { yb: 0.35, box: { x0: -0.84, x1: 1.75, y0: -0.05, y1: 1.05 } };
const s2 = { ratio: 3, frac: 1, playing: false };
function draw2() {
  const L = M.ledger(s2.ratio, s2.frac);
  document.querySelectorAll('[data-ratio]').forEach(b => { b.textContent = t('ratioN', { r: b.dataset.ratio }); b.setAttribute('aria-pressed', String(Number(b.dataset.ratio) === s2.ratio)); });
  const { ctx, W, H } = fitCanvas($('c2')), V = view(W, H, S2.box);
  crowbarScene(ctx, V, W, { Lr: L.Lr, Le: L.Le, yb: S2.yb, alpha: L.theta * Math.PI / 180, F: L.F, G: M.LEDGER.G, arms: false, marks: true });
  bracketV(ctx, V.X(-0.68), V.Y(S2.yb), V.Y(S2.yb + L.h), C.cyan, 'h', -1);
  bracketV(ctx, V.X(L.Lr + L.Le + 0.09), V.Y(S2.yb), V.Y(S2.yb - L.s), C.orange, 's', 1);
  hbars('c2b', [{ label: t('wIn'), value: L.Win, color: C.orange }, { label: t('wOut'), value: L.Wout, color: C.cyan }], 50, 10, t('c2b'));
  const F = whole(L.F);
  $('r2').textContent = t('s2readout', { prog: s2.playing ? t('s2prog', { k: Math.round(s2.frac * 100) }) : '', r: s2.ratio, eq: F.eq, F: F.s, s: fmt(L.s, 3), h: fmt(L.h, 3), sh: fmt(s2.ratio, 2), Win: fmt(L.Win, 1), Wout: fmt(L.Wout, 1) });
}

/* ---------- step 3: fixed pulley ---------- */
const S3 = { cx: 0, cy: 2.05, R: 0.16, beam: 2.3, load0: 0.12, boxH: 0.32, boxW: 0.36, box: { x0: -0.75, x1: 1.75, y0: -0.02, y1: 2.4 } };
const s3 = { mode: 'down' };
function draw3() {
  const s = num('s3'), r = M.fixedPulley(s);
  $('s3v').textContent = fmt(s, 2) + ' m';
  document.querySelectorAll('[data-pull]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pull === s3.mode)));
  const { ctx, W, H } = fitCanvas($('c3')), V = view(W, H, S3.box), { cx, cy, R } = S3;
  ground(ctx, W, V.Y(0));
  seg(ctx, V.X(-0.6), V.Y(S3.beam), V.X(0.6), V.Y(S3.beam), C.steel, 6); seg(ctx, V.X(cx), V.Y(S3.beam), V.X(cx), V.Y(cy), C.steel, 3);
  // load side: rope from the left of the wheel straight down to the box
  const boxBot = S3.load0 + r.h, boxTop = boxBot + S3.boxH, lx = cx - R;
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.strokeRect(V.X(lx - S3.boxW / 2), V.Y(S3.load0 + S3.boxH), S3.boxW * V.s, S3.boxH * V.s); ctx.restore();
  ctx.save(); ctx.fillStyle = '#3a4b5e'; ctx.fillRect(V.X(lx - S3.boxW / 2), V.Y(boxTop), S3.boxW * V.s, S3.boxH * V.s); ctx.restore();
  // hand side: tangent point and pull direction
  const dir = s3.mode === 'down' ? [0, -1] : [Math.SQRT1_2, -Math.SQRT1_2];
  const tp = s3.mode === 'down' ? [cx + R, cy] : [cx + R * Math.SQRT1_2, cy + R * Math.SQRT1_2];
  const len = 0.35 + r.s, hand = [tp[0] + dir[0] * len, tp[1] + dir[1] * len];
  // rope: one colour all the way (same tension)
  ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.moveTo(V.X(lx), V.Y(boxTop)); ctx.lineTo(V.X(lx), V.Y(cy));
  const a1 = s3.mode === 'down' ? 0 : -Math.PI / 4;
  ctx.arc(V.X(cx), V.Y(cy), R * V.s, Math.PI, 2 * Math.PI + a1); ctx.lineTo(V.X(hand[0]), V.Y(hand[1])); ctx.stroke(); ctx.restore();
  // wheel, spokes turn with the rope
  ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(V.X(cx), V.Y(cy), R * V.s, 0, 7); ctx.stroke();
  const turn = r.s / R; for (let i = 0; i < 3; i++) { const a = turn + i * 2 * Math.PI / 3; seg(ctx, V.X(cx), V.Y(cy), V.X(cx + R * 0.85 * Math.cos(a)), V.Y(cy - R * 0.85 * Math.sin(a)), C.steel, 1.5); }
  ctx.restore();
  dotP(ctx, V.X(hand[0]), V.Y(hand[1]), Math.max(5, 0.05 * V.s), C.orange);
  // forces, one scale: 200 N ↔ 0.4 m
  const k = 0.4 / 200;
  arrow(ctx, V.X(hand[0]), V.Y(hand[1]), V.X(hand[0] + dir[0] * r.F * k), V.Y(hand[1] + dir[1] * r.F * k), C.orange, 3.5);
  arrow(ctx, V.X(lx), V.Y(boxBot + S3.boxH / 2), V.X(lx), V.Y(boxBot + S3.boxH / 2 - r.F * k), C.cyan, 3.5);
  bracketV(ctx, V.X(lx - S3.boxW / 2 - 0.1), V.Y(S3.load0), V.Y(boxBot), C.cyan, 'h', -1);
  $('r3').textContent = t('s3readout', { F: fmt(r.F, 0), s: fmt(r.s, 2), h: fmt(r.h, 2), Win: fmt(r.Win, 1), Wout: fmt(r.Wout, 1) });
}

/* ---------- step 4: pulley block ---------- */
const S4 = { g: 0.26, yT: 2.85, beam: 3.08, yB0: 1.3, hand0: 2.45, boxW: 0.42, boxH: 0.34, box: { x0: -0.62, x1: 1.62, y0: -0.02, y1: 3.15 } };
const s4 = { n: 2, k: null };
// Geometry of the rope for n supporting segments, at pull s. Exported for the tests through window.
function blockGeometry(n, s) {
  const w = M.winding(n), r = S4.g / 2, h = s / n, yB = S4.yB0 + h;
  const xs = i => i * S4.g;
  const frameY = yB - r - 0.07;
  const segs = [];
  for (let i = 0; i < n; i++) {
    let top = S4.yT, bot = yB;
    if (i === 0) { if (w.tiedTop) top = S4.beam; else bot = frameY; }
    segs.push({ x: xs(i), top, bot });
  }
  const topSheaves = w.topTurns.map(i => (xs(i) + xs(i + 1)) / 2), botSheaves = w.bottomTurns.map(i => (xs(i) + xs(i + 1)) / 2);
  const att = botSheaves.slice(); if (!w.tiedTop) att.push(xs(0));
  const fx0 = Math.min(...att) - 0.06, fx1 = Math.max(...att) + 0.06;
  return { w, r, h, yB, frameY, segs, topSheaves, botSheaves, fx0, fx1, freeX: xs(n), hand: S4.hand0 - s };
}
function draw4() {
  const n = s4.n, s = num('s4'), P = M.pulleyBlock(n, s), Gm = blockGeometry(n, s);
  $('s4v').textContent = fmt(s, 1) + ' m';
  document.querySelectorAll('[data-n]').forEach(b => { b.textContent = t('nSeg', { n: b.dataset.n }); b.setAttribute('aria-pressed', String(Number(b.dataset.n) === n)); });
  const { ctx, W, H } = fitCanvas($('c4')), V = view(W, H, S4.box), r = Gm.r;
  ground(ctx, W, V.Y(0));
  const xs = [...Gm.segs.map(q => q.x), Gm.freeX];
  seg(ctx, V.X(Math.min(...xs) - 0.15), V.Y(S4.beam), V.X(Math.max(...xs) + 0.15), V.Y(S4.beam), C.steel, 6);
  // straps
  Gm.topSheaves.forEach(x => seg(ctx, V.X(x), V.Y(S4.beam), V.X(x), V.Y(S4.yT), C.steel, 3));
  Gm.botSheaves.forEach(x => seg(ctx, V.X(x), V.Y(Gm.yB), V.X(x), V.Y(Gm.frameY), C.steel, 3));
  // frame and load
  seg(ctx, V.X(Gm.fx0), V.Y(Gm.frameY), V.X(Gm.fx1), V.Y(Gm.frameY), C.steel, 5);
  const bx = (Gm.fx0 + Gm.fx1) / 2, boxTop = Gm.frameY - 0.14, boxBot0 = S4.yB0 - r - 0.07 - 0.14 - S4.boxH;
  seg(ctx, V.X(bx), V.Y(Gm.frameY), V.X(bx), V.Y(boxTop), C.steel, 2);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.strokeRect(V.X(bx - S4.boxW / 2), V.Y(boxBot0 + S4.boxH), S4.boxW * V.s, S4.boxH * V.s); ctx.restore();
  ctx.save(); ctx.fillStyle = '#3a4b5e'; ctx.fillRect(V.X(bx - S4.boxW / 2), V.Y(boxTop), S4.boxW * V.s, S4.boxH * V.s); ctx.restore();
  // rope arcs (neutral), then segments (bright when counted), then the free end (grey)
  ctx.save(); ctx.strokeStyle = C.rope; ctx.lineWidth = 2.2;
  Gm.topSheaves.forEach(x => { ctx.beginPath(); ctx.arc(V.X(x), V.Y(S4.yT), r * V.s, Math.PI, 2 * Math.PI); ctx.stroke(); });
  Gm.botSheaves.forEach(x => { ctx.beginPath(); ctx.arc(V.X(x), V.Y(Gm.yB), r * V.s, 0, Math.PI); ctx.stroke(); });
  ctx.restore();
  [...Gm.topSheaves.map(x => [x, S4.yT]), ...Gm.botSheaves.map(x => [x, Gm.yB])].forEach(([x, y]) => { ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(V.X(x), V.Y(y), r * V.s * 0.82, 0, 7); ctx.stroke(); ctx.restore(); dotP(ctx, V.X(x), V.Y(y), 2.5, C.steel); });
  const lit = s4.k === null ? n : s4.k;
  Gm.segs.forEach((q, i) => seg(ctx, V.X(q.x), V.Y(q.top), V.X(q.x), V.Y(q.bot), i < lit ? C.yellow : C.rope, i < lit ? 3.2 : 2.2, null, i < lit ? 1 : 0.6));
  seg(ctx, V.X(Gm.freeX), V.Y(S4.yT), V.X(Gm.freeX), V.Y(Gm.hand), C.free, 2.4);
  // segment numbers on chips, at mid-gap between the blocks
  const yNum = V.Y((S4.yT + Gm.yB) / 2);
  ctx.save(); ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  Gm.segs.forEach((q, i) => { if (i >= lit) return; dotP(ctx, V.X(q.x), yNum, 8, C.yellow); ctx.fillStyle = '#07131a'; ctx.fillText(String(i + 1), V.X(q.x), yNum + 0.5); });
  ctx.restore();
  dotP(ctx, V.X(Gm.freeX), V.Y(Gm.hand), Math.max(5, 0.05 * V.s), C.orange);
  // forces, one scale: 600 N ↔ 0.5 m
  const k = 0.5 / 600;
  arrow(ctx, V.X(Gm.freeX), V.Y(Gm.hand), V.X(Gm.freeX), V.Y(Gm.hand - P.F * k), C.orange, 3.5);
  const bc = boxTop - S4.boxH / 2;
  arrow(ctx, V.X(bx), V.Y(bc), V.X(bx), V.Y(bc - M.BLOCK.G * k), C.cyan, 3.5);
  bracketV(ctx, V.X(bx - S4.boxW / 2 - 0.09), V.Y(boxBot0), V.Y(boxBot0 + P.h), C.cyan, 'h', -1);
  bracketV(ctx, V.X(Gm.freeX + 0.14), V.Y(S4.hand0), V.Y(Gm.hand), C.orange, 's', 1);
  hbars('c4b', [{ label: t('wIn'), value: P.Win, color: C.orange }, { label: t('wOut'), value: P.Wout, color: C.cyan }], 600, 100, t('c4b'));
  const hq = exact(P.h * 100) ? { eq: '=', s: fmt(P.h, 2) } : { eq: '≈', s: P.h.toFixed(2) };
  $('r4').textContent = t('s4readout', { prog: s4.k !== null ? t('s4prog', { k: s4.k }) : '', n, F: fmt(P.F, 0), s: fmt(s, 1), heq: hq.eq, h: hq.s, Win: fmt(P.Win, 1), Wout: fmt(P.Wout, 1) });
}

/* ---------- step 5: quiz ---------- */
const quiz = {};
const OPTS = {
  q1: { ok: M.QUIZ.q1(), 1: 1.0, '05': 0.5, unit: 'optM', fixed: 1 },
  q2: { ok: M.QUIZ.q2(), 600: 600, 1800: 1800, unit: 'optN' },
  q3: { ok: M.QUIZ.q3(), 3: 3, 12: 12, unit: 'optM' }
};
function renderQuiz() {
  Object.keys(OPTS).forEach(q => Object.keys(OPTS[q]).forEach(v => { if (v === 'unit' || v === 'fixed') return; const el = $(`${q}o${v}`); if (el) el.textContent = t(OPTS[q].unit, { x: OPTS[q].fixed ? OPTS[q][v].toFixed(OPTS[q].fixed) : fmt(OPTS[q][v], 2) }); }));
  let right = 0;
  Object.keys(quiz).forEach(q => {
    const st = quiz[q], fb = $('fb-' + q);
    fb.textContent = st.choice === 'ok' ? t(q + 'ok', { x: OPTS[q].fixed ? OPTS[q].ok.toFixed(OPTS[q].fixed) : fmt(OPTS[q].ok, 2) }) : t(`${q}_${st.choice}`);
    fb.dataset.state = st.choice === 'ok' ? 'correct' : 'wrong'; if (st.choice === 'ok') right++;
  });
  const n = Object.keys(quiz).length;
  $('score').textContent = n ? (right === 3 ? t('allRight') : t('score', { k: right })) : '';
}
function checkQuiz(q) { const ch = document.querySelector(`input[name="${q}"]:checked`); if (!ch) return; quiz[q] = { choice: ch.value }; renderQuiz(); }

function refresh() { draw0(false); draw1(); draw2(); draw3(); draw4(); renderQuiz(); }
function setup() {
  ['dL', 'dR'].forEach(id => $(id).addEventListener('input', () => draw0(true)));
  $('Lr').addEventListener('input', () => { stopAnim('s1'); s1.p = 0; s1.lifted = false; draw1(); });
  $('push1').addEventListener('click', () => { s1.lifted = false; s1.p = 0; animate('s1', 1600, p => { s1.p = p; draw1(); }, () => { s1.lifted = true; draw1(); }); });
  document.querySelectorAll('[data-ratio]').forEach(b => b.addEventListener('click', () => { stopAnim('s2'); s2.playing = false; s2.ratio = Number(b.dataset.ratio); s2.frac = 1; draw2(); }));
  $('lift2').addEventListener('click', () => { s2.playing = true; s2.frac = 0; animate('s2', 2400, p => { s2.frac = ease(p); draw2(); }, () => { s2.playing = false; s2.frac = 1; draw2(); }); });
  document.querySelectorAll('[data-pull]').forEach(b => b.addEventListener('click', () => { s3.mode = b.dataset.pull; draw3(); }));
  $('s3').addEventListener('input', draw3);
  document.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { stopAnim('s4'); s4.k = null; s4.n = Number(b.dataset.n); draw4(); }));
  $('s4').addEventListener('input', draw4);
  $('count4').addEventListener('click', () => { const n = s4.n; s4.k = 0; draw4(); animate('s4', 700 * n + 300, p => { s4.k = Math.min(n, Math.floor(p * (n + 0.4))); draw4(); }, () => { s4.k = null; draw4(); }); });
  document.querySelectorAll('[data-check]').forEach(b => b.addEventListener('click', () => checkQuiz(b.dataset.check)));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); draw0(false); } });
  window.refreshLever = refresh;
  window.LP_GEOMETRY = blockGeometry;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
