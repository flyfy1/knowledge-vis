'use strict';
// Photoelectric-effect lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve, dot and readout comes from window.PE_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and a few labels in reserved slots; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.PE_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', metal: '#8ea3b8', glass: '#2a3a4e', ghost: '#8696aa', grey: '#55657a' };
const MCOL = { Cs: C.violet, Na: C.cyan, Zn: C.green };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trailing zeros are trimmed only when there is a decimal point (toFixed(0) keeps 90 as 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const supNum = e => String(e).split('').map(c => SUP[c]).join('');
// Scientific notation for very large or very small values, plain digits otherwise.
function sci(v, d = 2) {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 0.01 && a < 1e4) return fmt(v, 2);
  let e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
  if (Math.abs(Number(m.toFixed(d))) >= 10) { e += 1; m = v / Math.pow(10, e); }
  return fmt(m, d) + ' × 10' + supNum(e);
}
const SYM = { ms: 'ms', us: 'µs', ns: 'ns', ps: 'ps', fs: 'fs' };
function humanTime(sec) { const h = M.human(sec); const u = SYM[h.unit] || t('u_' + h.unit); return fmt(h.v, h.v < 10 ? 2 : h.v < 100 ? 1 : 0) + ' ' + u; }

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

// Text that shrinks until it fits maxW and is clamped inside [4, W − 4].
function label(ctx, text, x, y, { align = 'left', maxW = 9999, size = 12, weight = 400, color = C.text, W = 9999 } = {}) {
  ctx.save(); ctx.fillStyle = color; let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  const w = ctx.measureText(text).width;
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(4, Math.min(W - 4 - w, x0));
  ctx.textAlign = 'left'; ctx.fillText(text, x0, y); ctx.restore();
  return { x0, x1: x0 + w };
}
const title = (ctx, text, W) => label(ctx, text, 8, 17, { maxW: W - 16, size: 12, weight: 600, W });

function arrowHead(ctx, x, y, ang, color, size = 7) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y);
  ctx.lineTo(x - size * Math.cos(ang - 0.45), y - size * Math.sin(ang - 0.45)); ctx.lineTo(x - size * Math.cos(ang + 0.45), y - size * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
}

// A plot frame: ticks on the left and bottom, the title in its own row above.
function frame(ctx, o) {
  const x = v => o.l + (v - o.xMin) / (o.xMax - o.xMin) * (o.r - o.l);
  const y = v => o.b - (v - o.yMin) / (o.yMax - o.yMin) * (o.b - o.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = Math.abs(v) < 1e-9 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(o.l, y(v)); ctx.lineTo(o.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), o.l - 5, y(v) + 4); }
  for (const v of o.xTicks) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), o.b); ctx.lineTo(x(v), o.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), o.b + 16); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(o.l, o.t); ctx.lineTo(o.l, o.b); ctx.lineTo(o.r, o.b); ctx.stroke();
  ctx.restore();
  return { x, y };
}
function dashed(ctx, x0, y0, x1, y1, color, lw = 1.3, dash = [5, 4]) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, r, color, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}

/* ---------- small tween runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }

/* ---------- continuous scenes (step 0 phototube, step 2 electron rows): run only while visible ---------- */
const visible = { c0: false, c2: false };
let loopId = 0, lastT = 0;
function wantLoop() { return !reduceMotion() && !document.hidden && (visible.c0 || visible.c2); }
function startLoop() { if (loopId || !wantLoop()) return; lastT = performance.now(); loopId = requestAnimationFrame(loop); }
function stopLoop() { if (loopId) cancelAnimationFrame(loopId); loopId = 0; }
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (visible.c0) { step0Sim(dt); draw0(); }
  if (visible.c2) { s2.phase = (s2.phase + dt * 0.45) % 1; drawRows2(); }
  loopId = wantLoop() ? requestAnimationFrame(loop) : 0;
}

/* ---------- step 0: the threshold ---------- */
const NA = M.phiOf('Na');
const s0 = { ph: [], el: [], flash: [], acc: 0, np: 0, nk: 0, ne: 0, dots: [], lastCount: 0 };
const VIS_RATE = 14; // photons per second on screen at 100% (slow motion)
function geo0(W) {
  return { lamp: { x: 0.52 * W, y: 42 }, tube: { x0: 0.1 * W, x1: 0.9 * W, y0: 62, y1: 196 }, cat: { x: 0.2 * W, y0: 90, y1: 168 }, an: { x: 0.82 * W, y0: 90, y1: 168 }, wireY: 226, meter: { x: 0.51 * W, y: 226 } };
}
let seedV = 12345; const vrand = () => { seedV = (seedV * 1103515245 + 12345) % 2147483648; return seedV / 2147483648; };
function step0Sim(dt) {
  const W = $('c0').clientWidth || 600, g = geo0(W), lam = num('lam0'), pct = num('int0');
  const em = M.emits(lam, NA), K = M.kmax(lam, NA);
  s0.acc += dt * VIS_RATE * pct / 100;
  while (s0.acc >= 1) { s0.acc -= 1; s0.ph.push({ p: 0, ty: g.cat.y0 + 6 + vrand() * (g.cat.y1 - g.cat.y0 - 12) }); }
  const sp = 1.4; // fraction of the beam per second
  s0.ph = s0.ph.filter(q => {
    q.p += dt * sp;
    if (q.p < 1) return true;
    s0.np++; s0.nk++;
    if (em && s0.nk % 10 === 0) { s0.ne++; s0.el.push({ x: g.cat.x + 6, y: q.ty, v: 60 + 150 * Math.sqrt(K / 3) }); }
    else s0.flash.push({ y: q.ty, life: 0.35 });
    return false;
  });
  s0.el = s0.el.filter(e => { e.x += e.v * dt; return e.x < g.an.x - 3; });
  s0.flash = s0.flash.filter(f => (f.life -= dt) > 0);
  if (performance.now() - s0.lastCount > 250) { s0.lastCount = performance.now(); counter0(); }
}
function counter0() {
  const lam = num('lam0'), pct = num('int0');
  if (reduceMotion()) { $('r0c').textContent = t('s0still'); return; }
  $('r0c').textContent = t('s0count', { rate: fmt(VIS_RATE * pct / 100, 1), nph: sci(M.photonRate(M.P_FULL * pct / 100, lam)), np: s0.np, ne: s0.ne });
}
function resetCount0() { s0.np = 0; s0.nk = 0; s0.ne = 0; s0.el = []; counter0(); }
function photonPath(ctx, x0, y0, x1, y1, color, wiggle = true) {
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
  for (let s = 0; s <= len; s += 1) { const w = wiggle ? Math.sin(s * 0.9) * 3 : 0; const X = x0 + ux * s - uy * w, Y = y0 + uy * s + ux * w; if (s === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function draw0() {
  const lam = num('lam0'), pct = num('int0'), col = M.colour(lam), em = M.emits(lam, NA);
  const { ctx, W } = fitCanvas($('c0')), g = geo0(W);
  title(ctx, t('c0a'), W);
  // tube, electrodes, circuit
  ctx.save(); ctx.strokeStyle = C.glass; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(g.tube.x0, g.tube.y0, g.tube.x1 - g.tube.x0, g.tube.y1 - g.tube.y0, 22) : ctx.rect(g.tube.x0, g.tube.y0, g.tube.x1 - g.tube.x0, g.tube.y1 - g.tube.y0); ctx.stroke();
  ctx.strokeStyle = C.metal; ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.moveTo(g.cat.x + 3, g.cat.y1); ctx.lineTo(g.cat.x + 3, g.wireY); ctx.lineTo(g.meter.x - 12, g.wireY);
  ctx.moveTo(g.meter.x + 12, g.wireY); ctx.lineTo(g.an.x + 3, g.wireY); ctx.lineTo(g.an.x + 3, g.an.y1); ctx.stroke();
  ctx.beginPath(); ctx.arc(g.meter.x, g.meter.y, 12, 0, 7); ctx.stroke();
  ctx.fillStyle = C.metal; ctx.fillRect(g.cat.x, g.cat.y0, 7, g.cat.y1 - g.cat.y0); ctx.fillRect(g.an.x, g.an.y0, 6, g.an.y1 - g.an.y0);
  ctx.restore();
  label(ctx, 'A', g.meter.x, g.meter.y + 4, { align: 'center', size: 12, weight: 700, color: C.text, W });
  label(ctx, t('lbMeter'), g.meter.x, g.meter.y + 30, { align: 'center', size: 11, color: C.muted, W, maxW: 0.3 * W });
  label(ctx, t('lbCathode', { m: 'Na' }), g.cat.x - 2, 186, { align: 'left', size: 11, color: C.muted, W, maxW: 0.3 * W });
  label(ctx, t('lbAnode'), g.an.x + 8, 186, { align: 'right', size: 11, color: C.muted, W, maxW: 0.2 * W });
  // lamp
  ctx.save(); ctx.fillStyle = pct > 0 ? col : C.grey; ctx.globalAlpha = 0.35 + 0.65 * pct / 100; ctx.beginPath(); ctx.arc(g.lamp.x, g.lamp.y, 9, 0, 7); ctx.fill(); ctx.restore();
  label(ctx, t('lbLamp'), g.lamp.x + 15, g.lamp.y + 4, { size: 11, color: C.muted, W, maxW: 0.3 * W });
  // beam envelope
  if (pct > 0) { ctx.save(); ctx.globalAlpha = 0.07 + 0.1 * pct / 100; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(g.lamp.x - 4, g.lamp.y + 6); ctx.lineTo(g.cat.x + 7, g.cat.y0 + 4); ctx.lineTo(g.cat.x + 7, g.cat.y1 - 4); ctx.lineTo(g.lamp.x + 4, g.lamp.y + 8); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const tx = g.cat.x + 8;
  if (reduceMotion()) {
    if (pct > 0) for (let i = 0; i < 4; i++) { const p = 0.25 + 0.17 * i, ty = g.cat.y0 + 14 + i * 16; const x = g.lamp.x + (tx - g.lamp.x) * p, y = g.lamp.y + 8 + (ty - g.lamp.y - 8) * p; photonPath(ctx, x - 10, y - 8, x + 4, y + 3, col); }
    if (pct > 0 && em) for (let i = 0; i < 2; i++) { const y = g.cat.y0 + 26 + i * 30, x = g.cat.x + 40 + i * 60; dot(ctx, x, y, 4, C.cyan); arrowHead(ctx, x + 16, y, 0, C.cyan, 7); }
  } else {
    s0.ph.forEach(q => { const p = q.p, ty = q.ty; const x = g.lamp.x + (tx - g.lamp.x) * p, y = g.lamp.y + 8 + (ty - g.lamp.y - 8) * p; const ang = Math.atan2(ty - g.lamp.y, tx - g.lamp.x); photonPath(ctx, x - 12 * Math.cos(ang), y - 12 * Math.sin(ang), x, y, col); });
    s0.flash.forEach(f => { ctx.save(); ctx.globalAlpha = f.life / 0.35 * 0.8; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(g.cat.x + 8, f.y, 3, 0, 7); ctx.fill(); ctx.restore(); });
    s0.el.forEach(e => dot(ctx, e.x, e.y, 4, C.cyan));
  }
}
function drawCurve0() {
  const pct = num('int0'), lam = num('lam0');
  const { ctx, W, H } = fitCanvas($('c0b'));
  title(ctx, t('c0b'), W);
  const f = frame(ctx, { l: 40, r: W - 12, t: 34, b: H - 34, xMin: 200, xMax: 750, yMin: 0, yMax: 50, yTicks: [0, 10, 20, 30, 40, 50], xTicks: [200, 300, 400, 500, 600, 700], xFmt: v => fmt(v, 0) });
  const l0 = M.threshold(NA).lambda0;
  dashed(ctx, f.x(l0), 34, f.x(l0), H - 34, C.orange);
  label(ctx, 'λ₀', f.x(l0) + 5, 48, { size: 12, color: C.orange, W });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath();
  for (let L = 200; L <= 750; L += 1) { const I = M.photocurrent(M.P_FULL * pct / 100, L, NA) * 1e6; const X = f.x(L), Y = f.y(I); if (L === 200) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); if (L < l0 && L + 1 >= l0) { ctx.lineTo(f.x(l0), Y); ctx.lineTo(f.x(l0), f.y(0)); } }
  ctx.stroke(); ctx.restore();
  s0.dots.forEach(d => dot(ctx, f.x(d.lam), f.y(d.I), 3.2, C.text));
  const Icur = M.photocurrent(M.P_FULL * pct / 100, lam, NA) * 1e6;
  dot(ctx, f.x(lam), f.y(Icur), 6, C.cyan, true);
}
function addDot0() {
  const lam = num('lam0'), pct = num('int0'), I = M.photocurrent(M.P_FULL * pct / 100, lam, NA) * 1e6;
  if (!s0.dots.some(d => d.lam === lam && d.pct === pct)) s0.dots.push({ lam, pct, I });
}
function update0() {
  const lam = num('lam0'), pct = num('int0'), P = M.P_FULL * pct / 100;
  $('lam0v').textContent = fmt(lam, 0); $('int0v').textContent = fmt(pct, 0) + '%';
  const ev = M.photonEV(lam), nph = M.photonRate(P, lam);
  if (pct === 0) $('r0').textContent = t('s0dark');
  else {
    const verdict = M.emits(lam, NA) ? t('s0yes', { ne: sci(M.electronRateP(P, lam, NA)), I: fmt(M.photocurrent(P, lam, NA) * 1e6, 1) }) : t('s0no', { gap: fmt(NA - ev, 2) });
    $('r0').textContent = t('s0readout', { lam: fmt(lam, 0), ev: fmt(ev, 2), phi: fmt(NA, 2), pct: fmt(pct, 0), nph: sci(nph), verdict });
  }
  $('h0').textContent = t('s0hint', { l0: fmt(M.threshold(NA).lambda0, 0) });
  counter0(); draw0(); drawCurve0();
}

/* ---------- step 1: one photon's budget ---------- */
const s1 = { metal: 'Na' };
function draw1() {
  const lam = num('lam1'), phi = M.phiOf(s1.metal), hf = M.photonEV(lam), K = M.kmax(lam, phi), col = M.colour(lam);
  $('lam1v').textContent = fmt(lam, 0);
  // budget bars
  { const { ctx, W, H } = fitCanvas($('c1'));
    title(ctx, t('c1a'), W);
    const f = frame(ctx, { l: 34, r: W - 30, t: 34, b: H - 40, xMin: 0, xMax: 1, yMin: 0, yMax: 7, yTicks: [0, 1, 2, 3, 4, 5, 6, 7], xTicks: [] });
    const pw = W - 64, bw = Math.min(56, pw * 0.26), c1x = f.x(0.3), c2x = f.x(0.72);
    ctx.save(); ctx.fillStyle = col; ctx.fillRect(c1x - bw / 2, f.y(hf), bw, f.y(0) - f.y(hf)); ctx.restore();
    if (hf >= phi) {
      ctx.save(); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.85; ctx.fillRect(c2x - bw / 2, f.y(phi), bw, f.y(0) - f.y(phi));
      ctx.globalAlpha = 1; ctx.fillStyle = C.green; ctx.fillRect(c2x - bw / 2, f.y(hf), bw, f.y(phi) - f.y(hf)); ctx.restore();
      if (f.y(phi) - f.y(hf) >= 30) label(ctx, t('lbK'), c2x + bw / 2 + 4, (f.y(phi) + f.y(hf)) / 2 + 4, { size: 11, color: C.green, W, maxW: W - (c2x + bw / 2 + 4) - 30 });
    } else {
      ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.3; ctx.fillRect(c2x - bw / 2, f.y(hf), bw, f.y(0) - f.y(hf));
      ctx.globalAlpha = 1; ctx.strokeStyle = C.orange; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(c2x - bw / 2, f.y(phi), bw, f.y(0) - f.y(phi)); ctx.restore();
    }
    dashed(ctx, f.x(0), f.y(phi), f.x(1), f.y(phi), C.orange, 1.5);
    dashed(ctx, c1x + bw / 2, f.y(hf), c2x - bw / 2, f.y(hf), C.ghost, 1, [2, 3]);
    label(ctx, t('lbPhi'), W - 26, f.y(phi) + 4, { size: 12, color: C.orange, W });
    label(ctx, t('col1'), c1x, H - 22, { align: 'center', size: 11, color: C.muted, W, maxW: pw * 0.42 });
    label(ctx, t('col2'), c2x, H - 22, { align: 'center', size: 11, color: C.muted, W, maxW: pw * 0.48 });
  }
  // K_max vs f lines
  { const { ctx, W, H } = fitCanvas($('c1b'));
    title(ctx, t('c1b'), W);
    const f = frame(ctx, { l: 34, r: W - 12, t: 34, b: H - 40, xMin: 3.5, xMax: 15.5, yMin: 0, yMax: 5, yTicks: [0, 1, 2, 3, 4, 5], xTicks: [4, 6, 8, 10, 12, 14], xFmt: v => fmt(v, 0) });
    const slope = M.H_EVS * 1e14;
    const order = M.METALS.filter(m => m.id !== s1.metal).concat(M.METALS.filter(m => m.id === s1.metal));
    order.forEach(m => {
      const f0 = M.threshold(m.phi).f0 / 1e14, sel = m.id === s1.metal;
      ctx.save(); ctx.strokeStyle = sel ? C.orange : C.grey; ctx.lineWidth = sel ? 2.6 : 1.5; ctx.beginPath(); ctx.moveTo(f.x(f0), f.y(0)); const fEnd = Math.min(15.5, f0 + 5 / slope); ctx.lineTo(f.x(fEnd), f.y(slope * (fEnd - f0))); ctx.stroke(); ctx.restore();
    });
    const fq = M.freq(lam) / 1e14;
    dashed(ctx, f.x(fq), 34, f.x(fq), H - 40, col, 1.2, [3, 3]);
    if (K > 0) dot(ctx, f.x(fq), f.y(K), 6, C.green); else dot(ctx, f.x(fq), f.y(0), 6, C.pink, true);
  }
  const th = M.threshold(phi), p = { metal: t('mt_' + s1.metal), lam: fmt(lam, 0), f: fmt(M.freq(lam) / 1e14, 2), ev: fmt(hf, 2), phi: fmt(phi, 2), k: fmt(K, 2), f0: fmt(th.f0 / 1e14, 2), l0: fmt(th.lambda0, 0) };
  $('r1').textContent = t(hf > phi ? 's1yes' : 's1no', p);
  $('h1').textContent = t('s1hint', { dk: fmt(M.H_EVS * 1e14, 3), lCu: fmt(M.threshold(M.phiOf('Cu')).lambda0, 0) });
  document.querySelectorAll('#metals1 .btn').forEach(b => { b.textContent = t('mt_' + b.dataset.metal); b.setAttribute('aria-pressed', b.dataset.metal === s1.metal ? 'true' : 'false'); });
}

/* ---------- step 2: stopping voltage ---------- */
const s2 = { pct: 100, phase: 0, dots: [] };
const ROWS = 10;
function drawRows2() {
  const V = num('v2'), lam = num('lam2'), K = M.kmax(lam, NA);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), W);
  const cx = 30, ax = W - 30, top = 40, bot = H - 40, gap = ax - cx - 8;
  // a reverse voltage is a hill: shade it
  if (V < 0) { ctx.save(); const gr = ctx.createLinearGradient(cx, 0, ax, 0); gr.addColorStop(0, 'rgba(255,122,147,0)'); gr.addColorStop(1, `rgba(255,122,147,${Math.min(0.22, -V * 0.06)})`); ctx.fillStyle = gr; ctx.fillRect(cx + 7, top - 6, ax - cx - 7, bot - top + 12); ctx.restore(); }
  ctx.fillStyle = C.metal; ctx.fillRect(cx, top - 6, 7, bot - top + 12); ctx.fillRect(ax, top - 6, 6, bot - top + 12);
  label(ctx, t('lbCathode', { m: 'Na' }), cx, H - 14, { size: 11, color: C.muted, W, maxW: W / 2 - 34 });
  label(ctx, t('lbAnode'), ax + 6, H - 14, { align: 'right', size: 11, color: C.muted, W, maxW: W / 2 - 34 });
  const Ks = K > 0 ? M.sampleK(K, ROWS) : [];
  for (let i = 0; i < ROWS; i++) {
    const y = bot - (i + 0.5) * (bot - top) / ROWS;
    ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 8, y); ctx.lineTo(ax - 1, y); ctx.stroke(); ctx.restore();
    if (!Ks.length) continue;
    const r = M.reach(Ks[i], V), x1 = cx + 8 + r * gap, ok = r >= 1, colr = ok ? C.green : C.pink;
    ctx.save(); ctx.strokeStyle = colr; ctx.globalAlpha = 0.55; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 8, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
    if (ok) arrowHead(ctx, ax - 1, y, 0, colr, 7); else if (x1 > cx + 12) arrowHead(ctx, x1 - 6, y, Math.PI, colr, 6);
    // moving electron (out and back if it turns)
    let p = (s2.phase + i * 0.137) % 1, x;
    if (reduceMotion()) p = 0.5;
    if (ok) x = cx + 8 + p * gap * Math.min(1, 1);
    else { const q = p < 0.5 ? 2 * p : 2 - 2 * p; x = cx + 8 + r * gap * (1 - (1 - q) * (1 - q)); }
    dot(ctx, x, y, 3.6, colr);
  }
}
function drawIV2() {
  const V = num('v2'), lam = num('lam2'), K = M.kmax(lam, NA);
  const { ctx, W, H } = fitCanvas($('c2b'));
  title(ctx, t('c2b'), W);
  const f = frame(ctx, { l: 40, r: W - 12, t: 34, b: H - 40, xMin: -4, xMax: 2, yMin: 0, yMax: 50, yTicks: [0, 10, 20, 30, 40, 50], xTicks: [-4, -3, -2, -1, 0, 1, 2] });
  const curve = (pct, color, dash) => {
    const Is = M.photocurrent(M.P_FULL * pct / 100, lam, NA) * 1e6;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = dash ? 1.5 : 2.4; if (dash) ctx.setLineDash([5, 4]); ctx.beginPath();
    for (let v = -4; v <= 2.0001; v += 0.01) { const X = f.x(v), Y = f.y(M.iv(v, K, Is)); if (v === -4) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke(); ctx.restore();
  };
  curve(s2.pct === 100 ? 50 : 100, C.ghost, true);
  curve(s2.pct, C.cyan, false);
  s2.dots.filter(d => d.lam === lam).forEach(d => dot(ctx, f.x(d.V), f.y(d.I), 2.6, d.pct === s2.pct ? C.text : C.ghost));
  if (K > 0) {
    const vs = M.findStopping(K);
    dashed(ctx, f.x(-vs), 34, f.x(-vs), H - 40, C.pink, 1.3);
    label(ctx, t('lbVs'), f.x(-vs) + 5, 48, { size: 12, color: C.pink, W });
  }
  const Is = M.photocurrent(M.P_FULL * s2.pct / 100, lam, NA) * 1e6;
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(f.x(V), 56); ctx.lineTo(f.x(V), H - 40); ctx.stroke(); ctx.restore();
  dot(ctx, f.x(V), f.y(M.iv(V, K, Is)), 6, C.cyan, true);
}
function addDot2() {
  const V = num('v2'), lam = num('lam2'), K = M.kmax(lam, NA), Is = M.photocurrent(M.P_FULL * s2.pct / 100, lam, NA) * 1e6;
  if (!s2.dots.some(d => d.lam === lam && d.pct === s2.pct && Math.abs(d.V - V) < 1e-9)) s2.dots.push({ lam, pct: s2.pct, V, I: M.iv(V, K, Is) });
}
function update2() {
  const V = num('v2'), lam = num('lam2'), K = M.kmax(lam, NA), P = M.P_FULL * s2.pct / 100, Is = M.photocurrent(P, lam, NA) * 1e6;
  $('v2v').textContent = (V > 0 ? '+' : '') + fmt(V, 2); $('lam2v').textContent = fmt(lam, 0);
  ['int2Full', 'int2Half'].forEach(id => $(id).setAttribute('aria-pressed', (id === 'int2Full') === (s2.pct === 100) ? 'true' : 'false'));
  if (K <= 0) $('r2').textContent = t('s2none', { lam: fmt(lam, 0), ev: fmt(M.photonEV(lam), 2), phi: fmt(NA, 2) });
  else {
    const vs = M.findStopping(K), I = M.iv(V, K, Is);
    const state = V >= 0 ? t('s2stFwd') : (-V < K ? t('s2stPart', { ev: fmt(-V, 2) }) : t('s2stStop'));
    $('r2').textContent = t('s2readout', { lam: fmt(lam, 0), pct: s2.pct, V: (V > 0 ? '+' : '') + fmt(V, 2), k: fmt(K, 2), vs: fmt(vs, 2), state, I: fmt(I, 1), isat: fmt(Is, 1), frac: fmt(100 * I / Is, 0) });
  }
  drawRows2(); drawIV2();
}

/* ---------- step 3: measure h ---------- */
const METALS3 = ['Cs', 'Na', 'Zn'];
const s3 = { metal: 'Na', data: { Cs: new Map(), Na: new Map(), Zn: new Map() }, miss: { Cs: new Set(), Na: new Set(), Zn: new Set() }, last: null };
const ptsOf = id => [...s3.data[id].entries()].sort((a, b) => a[0] - b[0]).map(([i, V]) => ({ i, lam: M.HG_LINES[i], f: M.freq(M.HG_LINES[i]), V }));
function fitOf(id) { const p = ptsOf(id); return p.length >= 2 ? M.fit(p) : null; }
function record3(i) {
  const V = M.measureVs(i, s3.metal);
  if (V === null) s3.miss[s3.metal].add(i); else s3.data[s3.metal].set(i, V);
  s3.last = { i, metal: s3.metal, V };
}
function draw3() {
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3'), W);
  const f = frame(ctx, { l: 40, r: W - 14, t: 34, b: H - 40, xMin: 0, xMax: 13, yMin: -5, yMax: 4, yTicks: [-4, -2, 0, 2, 4], xTicks: [0, 2, 4, 6, 8, 10, 12], xFmt: v => fmt(v, 0) });
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(f.x(0), f.y(0)); ctx.lineTo(f.x(13), f.y(0)); ctx.stroke(); ctx.restore();
  // spectral line positions along the bottom
  M.HG_LINES.forEach(L => { const X = f.x(M.freq(L) / 1e14); ctx.save(); ctx.strokeStyle = M.colour(L); ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, H - 40); ctx.lineTo(X, H - 46); ctx.stroke(); ctx.restore(); });
  const order = METALS3.filter(m => m !== s3.metal).concat([s3.metal]);
  order.forEach(id => {
    const pts = ptsOf(id), F = fitOf(id), colr = MCOL[id], sel = id === s3.metal;
    ctx.save(); ctx.globalAlpha = sel ? 1 : 0.45;
    if (F) {
      const k = F.slope * 1e14, b = F.intercept, fs = pts.map(p => p.f / 1e14), lo = Math.min(...fs), hi = Math.max(...fs);
      const yv = x => k * x + b;
      // clip the line to the plot's V range
      const xA = Math.max(0, (-5 - b) / k), xB = Math.min(13, (4 - b) / k);
      dashed(ctx, f.x(xA), f.y(yv(xA)), f.x(xB), f.y(yv(xB)), colr, 1.4, [5, 4]);
      ctx.strokeStyle = colr; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(f.x(lo), f.y(yv(lo))); ctx.lineTo(f.x(hi), f.y(yv(hi))); ctx.stroke();
      if (b >= -5) dot(ctx, f.x(0), f.y(b), 4.5, colr, true);
    }
    pts.forEach(p => dot(ctx, f.x(p.f / 1e14), f.y(p.V), sel ? 4.5 : 3.5, colr));
    ctx.restore();
  });
}
function update3() {
  const id = s3.metal, nm = m => t('mt_' + m);
  document.querySelectorAll('#metals3 .btn').forEach(b => { b.textContent = nm(b.dataset.metal); b.setAttribute('aria-pressed', b.dataset.metal === id ? 'true' : 'false'); });
  document.querySelectorAll('#lines3 .btn').forEach(b => { const i = Number(b.dataset.i); b.classList.toggle('done', s3.data[id].has(i)); b.classList.toggle('miss', s3.miss[id].has(i)); });
  const L = s3.last;
  if (!L) $('r3').textContent = t('s3start');
  else {
    const lam = M.HG_LINES[L.i], p = { metal: nm(L.metal), lam: fmt(lam, 1), f: fmt(M.freq(lam) / 1e14, 2), ev: fmt(M.photonEV(lam), 2) };
    $('r3').textContent = L.V === null ? t('s3miss', p) : t('s3got', Object.assign(p, { vs: fmt(L.V, 3), vt: fmt(M.findStopping(M.kmax(lam, M.phiOf(L.metal))), 3) }));
  }
  const F = fitOf(id), n = s3.data[id].size;
  let txt = F ? t('s3fit', { metal: nm(id), n, slope: fmt(F.slope * 1e14, 4), h: fmt(F.h * 1e34, 3), err: fmt(Math.abs(F.h / M.H - 1) * 100, 1), b: fmt(F.intercept, 2), phi: fmt(F.phi, 2), f0: fmt(F.f0 / 1e14, 2) }) : t('s3few', { metal: nm(id), n });
  const others = METALS3.filter(m => m !== id && fitOf(m));
  if (F && others.length) txt += ' ' + t('s3others', { list: others.map(m => t('s3item', { metal: nm(m), h: fmt(fitOf(m).h * 1e34, 3) })).join(lang() === 'zh' ? '；' : '; ') });
  $('r3b').textContent = txt;
  const all = M.fit(M.measuredPoints('Na')), pair = M.fit(M.measuredPoints('Na').filter(q => q.lam === 404.7 || q.lam === 435.8));
  $('h3').textContent = t('s3hint', { errPair: fmt(Math.abs(pair.h / M.H - 1) * 100, 1), errAll: fmt(Math.abs(all.h / M.H - 1) * 100, 1) });
  $('lg3').innerHTML = METALS3.filter(m => s3.data[m].size || m === id).map(m => `<span class="lg"><span class="sw sw-dot" style="background:${MCOL[m]}"></span><span>${nm(m)}</span></span>`).join('') + `<span class="lg"><span class="sw" style="background:${MCOL[id]}"></span><span>${t('s3lgFit')}</span></span>`;
  draw3();
}
const lang = () => window.LESSON_I18N.getLang();

/* ---------- step 4: dim light ---------- */
const s4 = { seed: 7 };
const LAM4 = 400;
function update4() {
  const e = num('i4'), I = Math.pow(10, e), tw = M.classicalWait(I, NA), rate = M.electronRate(I, LAM4, NA), tp = 1 / rate;
  const times = M.emissionTimes(rate, 10, s4.seed);
  $('i4v').textContent = sci(I);
  $('r4').textContent = t('s4readout', { I: sci(I), tw: humanTime(tw), tws: sci(tw), rate: sci(rate), tp: sci(tp), t1: sci(times[0]), ratio: sci(tw / tp, 1) });
  $('h4').textContent = t('s4hint', { ratio: sci(tw / tp, 1) });
  const { ctx, W } = fitCanvas($('c4'));
  title(ctx, t('c4'), W);
  const l = 16, r = W - 16, LO = -15, HI = 8, x = lg => l + (Math.max(LO, Math.min(HI, lg)) - LO) / (HI - LO) * (r - l);
  label(ctx, t('row1'), l, 44, { size: 11.5, color: C.muted, W, maxW: r - l });
  ctx.save(); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.85; ctx.fillRect(l, 54, x(Math.log10(tw)) - l, 12); ctx.restore();
  ctx.save(); ctx.fillStyle = C.orange; ctx.fillRect(x(Math.log10(tw)) - 1.5, 50, 3, 20); ctx.restore();
  label(ctx, t('row2'), l, 96, { size: 11.5, color: C.muted, W, maxW: r - l });
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(Math.log10(tp)), 104); ctx.lineTo(x(Math.log10(tp)), 128); ctx.stroke(); ctx.restore();
  times.forEach((tt, k) => dot(ctx, x(Math.log10(tt)), 116, k === 0 ? 4.6 : 3.4, C.cyan, k === 0));
  // log time axis
  const ay = 150;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l, ay); ctx.lineTo(r, ay); ctx.stroke();
  for (let d = LO; d <= HI; d++) { ctx.beginPath(); ctx.moveTo(x(d), ay); ctx.lineTo(x(d), ay + (d % 3 === 0 ? 6 : 3)); ctx.stroke(); }
  ctx.restore();
  const ticks = [[-15, '1 fs'], [-12, '1 ps'], [-9, '1 ns'], [-6, '1 µs'], [-3, '1 ms'], [0, '1 s'], [Math.log10(3600), t('tk_h')], [Math.log10(M.UNITS[0][1]), t('tk_yr')]];
  let last = -Infinity;
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  ticks.forEach(([lg, s]) => {
    const w = ctx.measureText(s).width, X = x(lg), x0 = Math.max(4, Math.min(W - 4 - w, X - w / 2));
    if (x0 < last + 6) return;
    if (lg !== Math.round(lg)) { ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(X, ay); ctx.lineTo(X, ay + 6); ctx.stroke(); }
    ctx.fillStyle = C.muted; ctx.fillText(s, x0, ay + 20); last = x0 + w;
  });
  ctx.restore();
}

/* ---------- quizzes ---------- */
function wireQuiz(n, answer, textFn) {
  $('check' + n).addEventListener('click', () => {
    const choice = document.querySelector(`input[name="quiz${n}"]:checked`), ok = !!choice && choice.value === answer, fb = $('fb' + n);
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.textContent = textFn(ok); fb.style.color = ok ? C.green : C.orange;
  });
}
const quiz5Text = ok => t(ok ? 'correct5' : 'wrong5', { ev: fmt(M.photonEV(600), 2), phi: fmt(NA, 2) });
const quiz2Text = ok => t(ok ? 'correct2' : 'wrong2');

function refresh() {
  update0(); draw1(); update2(); update3(); update4();
  ['2', '5'].forEach(n => { const fb = $('fb' + n); if (fb.dataset.state) fb.textContent = (n === '2' ? quiz2Text : quiz5Text)(fb.dataset.state === 'correct'); });
}

function setup() {
  // metal buttons
  M.METALS.forEach(m => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.metal = m.id; b.dataset.step = '1'; b.id = 'm1' + m.id; b.addEventListener('click', () => { s1.metal = m.id; draw1(); }); $('metals1').appendChild(b); });
  METALS3.forEach(id => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.dataset.metal = id; b.dataset.step = '3'; b.id = 'm3' + id; b.addEventListener('click', () => { stopAnim('s3'); s3.metal = id; update3(); }); $('metals3').appendChild(b); });
  M.HG_LINES.forEach((L, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn line'; b.dataset.i = i; b.dataset.step = '3'; b.id = 'ln' + i; b.innerHTML = `<span class="sw" style="background:${M.colour(L)}"></span>${L.toFixed(1)}`; b.addEventListener('click', () => { stopAnim('s3'); record3(i); update3(); }); $('lines3').appendChild(b); });

  ['lam0', 'int0'].forEach(id => $(id).addEventListener('input', () => { addDot0(); resetCount0(); update0(); }));
  $('clear0').addEventListener('click', () => { s0.dots = []; addDot0(); update0(); });
  $('lam1').addEventListener('input', draw1);
  $('v2').addEventListener('input', () => { stopAnim('s2'); addDot2(); update2(); });
  $('lam2').addEventListener('input', () => { stopAnim('s2'); addDot2(); update2(); });
  $('int2Full').addEventListener('click', () => { s2.pct = 100; addDot2(); update2(); });
  $('int2Half').addEventListener('click', () => { s2.pct = 50; addDot2(); update2(); });
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.dots = []; addDot2(); update2(); });
  $('sweep2').addEventListener('click', () => {
    const steps = Math.round(6 / 0.05);
    const run = p => { const k = Math.min(steps, Math.floor(p * steps)); for (let j = 0; j <= k; j++) { $('v2').value = (2 - j * 0.05).toFixed(2); addDot2(); } update2(); };
    if (reduceMotion()) { run(1); return; }
    animate('s2', 5000, run);
  });
  $('all3').addEventListener('click', () => {
    const n = M.HG_LINES.length;
    animate('s3', n * 420, p => { const k = Math.min(n - 1, Math.floor(p * n)); for (let i = 0; i <= k; i++) if (!s3.data[s3.metal].has(i) && !s3.miss[s3.metal].has(i)) record3(i); update3(); });
  });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); METALS3.forEach(m => { s3.data[m].clear(); s3.miss[m].clear(); }); s3.last = null; update3(); });
  $('i4').addEventListener('input', update4);
  $('reseed4').addEventListener('click', () => { s4.seed = (s4.seed * 48271) % 2147483647; update4(); });
  wireQuiz('2', 'b', quiz2Text); wireQuiz('5', 'b', quiz5Text);
  addDot0(); addDot2();

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const vis = new IntersectionObserver(es => { es.forEach(e => { visible[e.target.id] = e.isIntersecting; }); if (wantLoop()) startLoop(); }, { rootMargin: '80px 0px' });
    vis.observe($('c0')); vis.observe($('c2'));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); stopLoop(); } else startLoop(); });
  if (window.matchMedia) { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); const on = () => { if (reduceMotion()) stopLoop(); else startLoop(); refresh(); }; if (mq.addEventListener) mq.addEventListener('change', on); }
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
