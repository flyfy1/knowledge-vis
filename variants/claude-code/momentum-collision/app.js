'use strict';
// Momentum & collisions lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every cart position, curve and readout comes from window.MOM_MODEL (model.js). Canvas text is limited to
// panel titles (own row), axis ticks and the one-letter cart names inside the carts; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MOM_MODEL;
const t = (...a) => window.MOM_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', track: '#3a4c63' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros; show −0 as 0; use a real minus sign.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; return s.replace('-', '−'); };
const sgn = (v, d = 2) => (v > 0.5 * Math.pow(10, -d) ? '+' : '') + fmt(v, d);

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

// Panel title in its own row; the font shrinks until the text fits the canvas width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Ticks for a dynamic range: at most ~5 labels.
function autoTicks(lo, hi) {
  const step = [0.5, 1, 2, 4, 5, 10, 20].find(s => (hi - lo) / s <= 5) || 20, out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

// A plot panel: title row above, y tick labels left, x tick labels below.
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, o.yDigits || 2), P.l - 6, y(v) + 4);
  }
  if (o.frame) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke(); }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.5, 1, 2, 4, 5, 10]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, o.xDigits || 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, col, ring) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function vguide(ctx, X, y0, y1, color = C.orange) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function curve(ctx, m, f, x0, x1, col, lw = 2, dash = null, n = 200) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
// A cart: rectangle with its letter centred inside, wheels below. (cx, base) = centre bottom.
function cart(ctx, cx, base, w, h, col, letter) {
  ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.92; ctx.fillRect(cx - w / 2, base - h - 4, w, h); ctx.globalAlpha = 1;
  ctx.fillStyle = C.bg; [cx - w / 4, cx + w / 4].forEach(X => { ctx.beginPath(); ctx.arc(X, base - 2.5, 2.5, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#071019'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center';
  if (h >= 12 && w >= 12) ctx.fillText(letter, cx, base - 4 - h / 2 + 4);
  ctx.restore();
}

/* ---------- shared animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

/* ---------- step 0: which cart is harder to stop? ---------- */
const s0 = { time: Infinity, hist: new Map() }; // Infinity = show the finished run (both stopped)
function addHist0() { const m = num('m0'), v = num('v0'); s0.hist.set(m + ',' + v, { m, v }); }
function draw0() {
  const m = num('m0'), v = num('v0'), A = M.braking(m, v), B = M.braking(M.REF.m, M.REF.v);
  $('m0v').textContent = fmt(m) + ' kg'; $('v0v').textContent = fmt(v) + ' m/s';
  const { ctx, W, H } = fitCanvas($('c0'));
  const tt = Math.min(s0.time, Math.max(A.tStop, B.tStop));
  // strip: two lanes, carts' fronts start at 0 m
  const S = panel(ctx, W, { top: 30, bottom: 112, xMin: 0, xMax: 17, yMin: 0, yMax: 1, xTicks: true, xSteps: [2, 4, 8], frame: true, title: t('c0strip', { clock: fmt(tt, 2), F: fmt(M.BRAKE_F) }) });
  const scale = (S.P.r - S.P.l) / 17, cw = Math.max(18, Math.min(30, scale * 1.6));
  [[A, 64, C.cyan, 'A'], [B, 100, C.orange, 'B']].forEach(([car, base, col, L]) => {
    ctx.save(); ctx.strokeStyle = C.track; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(S.P.l - cw, base); ctx.lineTo(S.P.r, base); ctx.stroke(); ctx.restore();
    for (let k = 0; k * 0.5 <= Math.min(tt, car.tStop) + 1e-9; k++) dot(ctx, S.x(car.pos(k * 0.5)), base + 5, 2.2, col);
    cart(ctx, S.x(car.pos(tt)) - cw / 2, base, cw, 12 + 5 * car.m, col, L);
  });
  // stop time vs speed: scattered
  const P1 = panel(ctx, W, { top: 162, bottom: 300, xMin: 0, xMax: 4.3, yMin: 0, yMax: 8.6, yTicks: [0, 2, 4, 6, 8], xTicks: true, xSteps: [0.5, 1], title: t('c0mid') });
  const P2 = panel(ctx, W, { top: 352, bottom: H - 26, xMin: 0, xMax: 16.6, yMin: 0, yMax: 8.6, yTicks: [0, 2, 4, 6, 8], xTicks: true, xSteps: [2, 4, 8], title: t('c0bot') });
  curve(ctx, P2, p => p / M.BRAKE_F, 0, 16.6, C.ghost, 1.4, [5, 4], 2);
  for (const q of s0.hist.values()) { const r = M.braking(q.m, q.v); dot(ctx, P1.x(q.v), P1.y(r.tStop), 3, C.text); dot(ctx, P2.x(r.p), P2.y(r.tStop), 3, C.text); }
  dot(ctx, P1.x(B.v), P1.y(B.tStop), 5.5, C.orange, true); dot(ctx, P2.x(B.p), P2.y(B.tStop), 5.5, C.orange, true);
  dot(ctx, P1.x(A.v), P1.y(A.tStop), 5.5, C.cyan, true); dot(ctx, P2.x(A.p), P2.y(A.tStop), 5.5, C.cyan, true);
  const d = A.tStop - B.tStop;
  const cmp = Math.abs(d) < 1e-9 ? t(Math.abs(A.dist - B.dist) < 1e-9 ? 's0same' : 's0sameDiffDist', { da: fmt(A.dist), db: fmt(B.dist) }) : t(d < 0 ? 's0Afirst' : 's0Bfirst', { gap: fmt(Math.abs(d)) });
  $('r0').textContent = t('s0readout', { m: fmt(m), v: fmt(v), p: fmt(A.p), F: fmt(M.BRAKE_F), ta: fmt(A.tStop), da: fmt(A.dist), pb: fmt(B.p), tb: fmt(B.tStop), db: fmt(B.dist), cmp, n: s0.hist.size });
}

/* ---------- step 1: impulse changes momentum ---------- */
const s1 = { hist: [] };
function addHist1() {
  const key = [num('m1'), num('f1'), num('d1')].join(',');
  s1.hist = s1.hist.filter(k => k !== key); s1.hist.push(key); if (s1.hist.length > 7) s1.hist.shift();
}
function draw1() {
  const m = num('m1'), F = num('f1'), dt = num('d1'), r = M.push(m, F, dt);
  $('f1v').textContent = fmt(F) + ' N'; $('d1v').textContent = fmt(dt) + ' s'; $('m1v').textContent = fmt(m) + ' kg';
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 30, bottom: 172, xMin: 0, xMax: M.PUSH.T, yMin: 0, yMax: 6.6, yTicks: [0, 2, 4, 6], xTicks: true, title: t('c1a') });
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.3)'; ctx.fillRect(A.x(r.t0), A.y(F), A.x(r.t1) - A.x(r.t0), A.y(0) - A.y(F));
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(0)); ctx.lineTo(A.x(r.t0), A.y(0)); ctx.lineTo(A.x(r.t0), A.y(F)); ctx.lineTo(A.x(r.t1), A.y(F)); ctx.lineTo(A.x(r.t1), A.y(0)); ctx.lineTo(A.x(M.PUSH.T), A.y(0)); ctx.stroke(); ctx.restore();
  const B = panel(ctx, W, { top: 226, bottom: H - 26, xMin: 0, xMax: M.PUSH.T, yMin: 0, yMax: 15.6, yTicks: [0, 5, 10, 15], xTicks: true, title: t('c1b') });
  const key = [m, F, dt].join(',');
  s1.hist.forEach(k => { if (k === key) return; const [mm, ff, dd] = k.split(',').map(Number), q = M.push(mm, ff, dd); curve(ctx, B, q.p, 0, M.PUSH.T, C.raw, 1.6, null, 300); });
  curve(ctx, B, r.p, 0, M.PUSH.T, C.cyan, 2.6, null, 300);
  // Δp bracket at the right edge
  const bx = B.x(M.PUSH.T) - 8;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, B.y(r.p0)); ctx.lineTo(bx, B.y(r.p1)); ctx.stroke();
  ctx.lineWidth = 1.5; [r.p0, r.p1].forEach(v => { ctx.beginPath(); ctx.moveTo(bx - 5, B.y(v)); ctx.lineTo(bx + 5, B.y(v)); ctx.stroke(); }); ctx.restore();
  vguide(ctx, A.x(r.t0), A.P.t, B.P.b, C.ghost); vguide(ctx, A.x(r.t1), A.P.t, B.P.b, C.ghost);
  $('r1').textContent = t('s1readout', { F: fmt(F), dt: fmt(dt), J: fmt(r.J), m: fmt(m), v0: fmt(r.v0), p0: fmt(r.p0), p1: fmt(r.p1), v1: fmt(r.v1), dv: fmt(r.dv) });
}

/* ---------- step 2: same change in momentum, longer time, smaller force ---------- */
const s2 = { hist: new Set() };
function draw2() {
  const v = num('v2'), dt = num('t2'), r = M.cushion(v, dt);
  $('v2v').textContent = fmt(v) + ' m/s'; $('t2v').textContent = fmt(dt, 4) + ' s';
  s2.hist.add(dt.toFixed(4));
  const { ctx, W, H } = fitCanvas($('c2'));
  const P = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 0.105, yMin: 0, yMax: 104, yTicks: [0, 25, 50, 75, 100], xTicks: true, xSteps: [0.01, 0.02, 0.05], minPx: 34, title: t('c2') });
  ctx.save(); ctx.beginPath(); ctx.rect(P.P.l, P.P.t, P.P.r - P.P.l, P.P.b - P.P.t); ctx.clip();
  curve(ctx, P, x => r.dp / x, r.dp / 104, 0.105, C.ghost, 1.4, [5, 4], 300);
  ctx.strokeStyle = C.orange; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(P.P.l, P.y(r.limit)); ctx.lineTo(P.P.r, P.y(r.limit)); ctx.stroke(); ctx.setLineDash([]);
  [...s2.hist].forEach(k => { const d = Number(k); if (Math.abs(d - dt) < 1e-9) return; const q = M.cushion(v, d); ctx.strokeStyle = q.safe ? C.green : C.pink; ctx.globalAlpha = 0.45; ctx.lineWidth = 1.2; ctx.strokeRect(P.x(0), P.y(Math.min(100, q.F)), P.x(d) - P.x(0), P.y(0) - P.y(Math.min(100, q.F))); });
  ctx.globalAlpha = 1; const col = r.safe ? C.green : C.pink;
  ctx.fillStyle = col; ctx.globalAlpha = 0.55; ctx.fillRect(P.x(0), P.y(Math.min(100, r.F)), P.x(dt) - P.x(0), P.y(0) - P.y(Math.min(100, r.F)));
  ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(P.x(0), P.y(Math.min(100, r.F)), P.x(dt) - P.x(0), P.y(0) - P.y(Math.min(100, r.F)));
  ctx.restore();
  dot(ctx, P.x(dt), P.y(Math.min(100, r.F)), 5, col, true);
  $('r2').textContent = t(r.safe ? 's2safe' : 's2break', { m: fmt(M.EGG.m), v: fmt(v), dp: fmt(r.dp, 3), dt: fmt(dt, 4), F: fmt(r.F, 1), lim: fmt(r.limit), tmin: fmt(r.dtMin, 3), n: s2.hist.size });
}

/* ---------- step 3: what A loses, B gains ---------- */
const s3 = { mode: 'stick', time: M.CONTACT.T };
const e3 = () => (s3.mode === 'stick' ? 0 : 1);
function params3() { return [num('ma3'), num('mb3'), num('va3'), num('vb3')]; }
function draw3() {
  const [mA, mB, vA, vB] = params3(), T = M.CONTACT.T, tt = s3.time, r = M.timeline(mA, mB, vA, vB, e3());
  $('ma3v').textContent = fmt(mA) + ' kg'; $('mb3v').textContent = fmt(mB) + ' kg'; $('va3v').textContent = fmt(vA) + ' m/s'; $('vb3v').textContent = fmt(vB) + ' m/s';
  $('modeStick').setAttribute('aria-pressed', s3.mode === 'stick'); $('modeBounce').setAttribute('aria-pressed', s3.mode === 'bounce');
  const { ctx, W, H } = fitCanvas($('c3'));
  const S = panel(ctx, W, { top: 30, bottom: 130, xMin: 0, xMax: 14, yMin: 0, yMax: 1, xTicks: true, xSteps: [2, 4, 7], frame: true, title: t('c3strip', { clock: fmt(tt, 2) }) });
  const base = 104, cw = (S.P.r - S.P.l) / 14 * M.CONTACT.D;
  ctx.save(); ctx.beginPath(); ctx.rect(S.P.l, S.P.t, S.P.r - S.P.l, S.P.b - S.P.t + 1); ctx.clip();
  ctx.strokeStyle = C.track; ctx.beginPath(); ctx.moveTo(S.P.l, base); ctx.lineTo(S.P.r, base); ctx.stroke();
  for (let k = 0; k * 0.5 <= tt + 1e-9; k++) { dot(ctx, S.x(r.xA(k * 0.5)), base + 7, 2.2, C.cyan); dot(ctx, S.x(r.xB(k * 0.5)), base + 14, 2.2, C.orange); }
  cart(ctx, S.x(r.xA(tt)), base, cw, 12 + 7 * mA, C.cyan, 'A');
  cart(ctx, S.x(r.xB(tt)), base, cw, 12 + 7 * mB, C.orange, 'B');
  ctx.restore();
  // momentum vs time
  const vals = [r.pA, r.pB, r.pA2, r.pB2, r.pBefore, 0];
  const lo = Math.floor(Math.min(...vals) - 0.5), hi = Math.ceil(Math.max(...vals) + 0.5);
  const P = panel(ctx, W, { top: 180, bottom: H - 26, xMin: 0, xMax: T, yMin: lo, yMax: hi, yTicks: autoTicks(lo, hi), xTicks: true, title: t('c3p') });
  if (tt > 0) {
    curve(ctx, P, r.pAt, 0, tt, C.cyan, 2.4, null, 400);
    curve(ctx, P, r.pBt, 0, tt, C.orange, 2.4, null, 400);
    curve(ctx, P, q => r.pAt(q) + r.pBt(q), 0, tt, C.text, 2, [6, 4], 400);
  }
  vguide(ctx, P.x(tt), P.P.t, P.P.b, C.ghost);
  const key = s3.mode === 'stick' ? 'modeStickShort' : 'modeBounceShort';
  if (!r.hit) $('r3').textContent = t('s3none', { pa: fmt(r.pA), pb: fmt(r.pB), tot: fmt(r.pBefore) });
  else $('r3').textContent = t('s3readout', { mode: t(key), pa: fmt(r.pA), pb: fmt(r.pB), tot: fmt(r.pBefore), pa2: fmt(r.pA2), pb2: fmt(r.pB2), tot2: fmt(r.pAfter), lose: fmt(r.pA - r.pA2), gain: fmt(r.pB2 - r.pB), va2: fmt(r.vA2), vb2: fmt(r.vB2) });
}

/* ---------- step 4: momentum always kept, kinetic energy not ---------- */
const s4 = { hist: new Set() };
function draw4() {
  const [mA, mB, vA, vB] = params3(), e = num('e4'), r = M.collide(mA, mB, vA, vB, e);
  $('e4v').textContent = fmt(e, 1);
  s4.hist.add(e.toFixed(1));
  const { ctx, W, H } = fitCanvas($('c4'));
  const va = q => M.collide(mA, mB, vA, vB, q).vA2, vb = q => M.collide(mA, mB, vA, vB, q).vB2;
  const vals = [va(0), va(1), vb(0), vb(1), 0];
  const lo = Math.floor(Math.min(...vals) - 0.3), hi = Math.ceil(Math.max(...vals) + 0.3);
  const A = panel(ctx, W, { top: 30, bottom: 186, xMin: 0, xMax: 1, yMin: lo, yMax: hi, yTicks: autoTicks(lo, hi), xTicks: true, xSteps: [0.1, 0.2, 0.5], xDigits: 1, title: t('c4a') });
  curve(ctx, A, va, 0, 1, C.cyan, 2.2, null, 50); curve(ctx, A, vb, 0, 1, C.orange, 2.2, null, 50);
  const B = panel(ctx, W, { top: 240, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [0.1, 0.2, 0.5], xDigits: 1, title: t('c4b') });
  if (Math.abs(r.pBefore) > 1e-9) curve(ctx, B, () => 1, 0, 1, C.ghost, 1.6, [6, 4], 2);
  curve(ctx, B, q => M.collide(mA, mB, vA, vB, q).keFrac, 0, 1, C.green, 2.4, null, 100);
  [...s4.hist].forEach(k => { const q = Number(k); if (Math.abs(q - e) < 1e-9) return; const c = M.collide(mA, mB, vA, vB, q); dot(ctx, A.x(q), A.y(c.vA2), 3, C.text); dot(ctx, A.x(q), A.y(c.vB2), 3, C.text); dot(ctx, B.x(q), B.y(c.keFrac), 3, C.text); });
  dot(ctx, A.x(e), A.y(r.vA2), 5, C.cyan, true); dot(ctx, A.x(e), A.y(r.vB2), 5, C.orange, true); dot(ctx, B.x(e), B.y(r.keFrac), 5.5, C.green, true);
  vguide(ctx, A.x(e), A.P.t, B.P.b, C.ghost);
  const setup = t('s4setup', { ma: fmt(mA), va: fmt(vA), mb: fmt(mB), vb: fmt(vB) });
  if (!r.hit) { $('r4').textContent = setup + t('s4none'); return; }
  $('r4').textContent = setup + t('s4readout', { e: fmt(e, 1), va2: fmt(r.vA2), vb2: fmt(r.vB2), u: fmt(r.u), sep: fmt(r.sep), p: fmt(r.pBefore), p2: fmt(r.pAfter), k: fmt(r.keBefore), k2: fmt(r.keAfter), pct: Math.round(r.keFrac * 100), lost: fmt(r.keLost) });
}

/* ---------- step 5: pushing apart from rest ---------- */
const s5 = { time: M.ICE.T };
function draw5() {
  const m1 = num('m15'), m2 = num('m25'), J = num('j5'), r = M.recoil(m1, m2, J), tt = s5.time;
  $('m15v').textContent = fmt(m1) + ' kg'; $('m25v').textContent = fmt(m2) + ' kg'; $('j5v').textContent = fmt(J) + ' N·s';
  const { ctx, W, H } = fitCanvas($('c5'));
  const P = panel(ctx, W, { top: 30, bottom: H - 26, xMin: -M.ICE.X, xMax: M.ICE.X, yMin: 0, yMax: 1, xTicks: true, xSteps: [5, 10, 25], frame: true, title: t('c5', { clock: fmt(tt, 2) }) });
  const cy = (P.P.t + P.P.b) / 2, start = 0.7;
  ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(P.x(0), P.P.t); ctx.lineTo(P.x(0), P.P.b); ctx.stroke(); ctx.restore();
  const x1 = q => -start + r.v1 * q, x2 = q => start + r.v2 * q;
  for (let k = 1; k * M.ICE.mark <= tt + 1e-9; k++) { const q = k * M.ICE.mark; dot(ctx, P.x(x1(q)), cy + 22, 2.4, C.cyan); dot(ctx, P.x(x2(q)), cy + 22, 2.4, C.orange); }
  const rad = m => 7 + (m - 30) / 50 * 7;
  [[x1(tt), m1, C.cyan, '1'], [x2(tt), m2, C.orange, '2']].forEach(([X, m, col, L]) => {
    dot(ctx, P.x(X), cy, rad(m), col);
    ctx.save(); ctx.fillStyle = '#071019'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(L, P.x(X), cy + 4); ctx.restore();
  });
  // momentum arrows drawn from the starting point: equal length, opposite direction
  const k = (P.P.r - P.P.l) / 2 * 0.7 / 120;
  [[r.p1, C.cyan], [r.p2, C.orange]].forEach(([p, col]) => {
    const x0 = P.x(0), x1a = x0 + p * k, Y = cy - 34;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1a, Y); ctx.stroke();
    const d = Math.sign(p); ctx.beginPath(); ctx.moveTo(x1a + d * 2, Y); ctx.lineTo(x1a - d * 7, Y - 5); ctx.lineTo(x1a - d * 7, Y + 5); ctx.closePath(); ctx.fill(); ctx.restore();
  });
  $('r5').textContent = t('s5readout', { m1: fmt(m1), m2: fmt(m2), J: fmt(J), v1: fmt(Math.abs(r.v1)), v2: fmt(r.v2), p1: fmt(r.p1), p2: sgn(r.p2), tot: fmt(r.total), ratio: fmt(r.speedRatio), mr: fmt(m1 / m2), d1: fmt(r.d1, 1), d2: fmt(r.d2, 1), T: M.ICE.T });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  addHist0();
  ['m0', 'v0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); s0.time = Infinity; addHist0(); draw0(); }));
  $('brake0').addEventListener('click', () => {
    const A = M.braking(num('m0'), num('v0')), B = M.braking(M.REF.m, M.REF.v), T = Math.max(A.tStop, B.tStop);
    animate('s0', T * 1000, p => { s0.time = Math.round(p * T * 100) / 100; if (p >= 1) s0.time = T; draw0(); });
  });
  $('clear0').addEventListener('click', () => { s0.hist.clear(); addHist0(); draw0(); });

  addHist1();
  ['f1', 'd1', 'm1'].forEach(id => $(id).addEventListener('input', () => { addHist1(); draw1(); }));
  $('clear1').addEventListener('click', () => { s1.hist = []; addHist1(); draw1(); });

  $('t2').addEventListener('input', draw2);
  $('v2').addEventListener('input', () => { s2.hist.clear(); draw2(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(choice ? (ok ? 'correct' : 'wrong') : 'pick');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });

  const on3 = () => { stopAnim('s3'); s3.time = M.CONTACT.T; s4.hist.clear(); draw3(); draw4(); };
  ['ma3', 'mb3', 'va3', 'vb3'].forEach(id => $(id).addEventListener('input', on3));
  $('modeStick').addEventListener('click', () => { s3.mode = 'stick'; stopAnim('s3'); s3.time = M.CONTACT.T; draw3(); });
  $('modeBounce').addEventListener('click', () => { s3.mode = 'bounce'; stopAnim('s3'); s3.time = M.CONTACT.T; draw3(); });
  $('play3').addEventListener('click', () => { animate('s3', 4500, p => { s3.time = Math.round(p * M.CONTACT.T * 100) / 100; draw3(); }); });

  $('e4').addEventListener('input', draw4);

  ['m15', 'm25', 'j5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.time = M.ICE.T; draw5(); }));
  $('push5').addEventListener('click', () => { animate('s5', M.ICE.T * 1000, p => { s5.time = Math.round(p * M.ICE.T * 100) / 100; draw5(); }); });

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
  window.refreshMomentum = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
