'use strict';
// Gravitational lensing lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every ray, image and readout comes from window.LENS_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and the resolution labels in step 2, each laid out in its own row; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.LENS_MODEL;
const t = (...a) => window.LENS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', star: '#ffd27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point; −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
// Significant figures without exponent notation for 0.001 ≤ |v| < 10000, else a × 10ⁿ.
function sig(v, n = 3) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e-3 && a < 1e4) { const d = Math.max(0, n - 1 - Math.floor(Math.log10(a))); return fmt(v, d); }
  let e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
  if (Math.abs(Number(m.toFixed(n - 1))) >= 10) { e += 1; m /= 10; }
  return fmt(m, n - 1) + '×10' + String(e).split('').map(ch => SUP[ch]).join('');
}

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
  return { ctx, W: width, H: height, dpr };
}

// Panel title: shrinks the font until it fits (never overflows, never squeezes glyphs).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, target) {
  const raw = span / Math.max(1, target), p = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
}
function ticks(lo, hi, target) { const s = niceStep(hi - lo, target), out = []; for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9 * s; v += s) out.push(Math.abs(v) < 1e-12 ? 0 : v); return out; }
const tickLabel = v => { const a = Math.abs(v); if (a === 0) return '0'; if (a >= 1e4) return sig(v, 2); return fmt(v, a >= 10 ? 0 : a >= 1 ? 1 : 2); };

// A plot panel: title in its own row above; y ticks left; x ticks below.
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const yT = o.yTicks || ticks(o.yMin, o.yMax, 4);
  const left = o.left || Math.max(30, ...yT.map(v => ctx.measureText(tickLabel(v)).width + 12));
  ctx.restore();
  const P = { l: left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of yT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(tickLabel(v), P.l - 6, y(v) + 4);
  }
  const xT = o.xTicks || ticks(o.xMin, o.xMax, Math.max(2, Math.floor((P.r - P.l) / 46)));
  ctx.textAlign = 'center';
  for (const v of xT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(tickLabel(v), x(v), P.b + 15);
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
// A square sky/source view centred on the lens: ±ext in θE units, ticks at whole numbers along the bottom.
function skyView(ctx, W, H, ext, ttl) {
  const top = 26, bottom = H - 24, size = Math.min(W - 24, bottom - top), cx = W / 2, cy = top + size / 2, s = size / (2 * ext);
  const P = { l: cx - size / 2, r: cx + size / 2, t: top, b: top + size };
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(P.l, P.t, size, size);
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let v = -Math.floor(ext); v <= Math.floor(ext); v++) { const X = cx + v * s; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke(); ctx.fillText(String(v).replace('-', '−'), X, P.b + 15); }
  ctx.restore();
  title(ctx, ttl, 8, top - 9, W - 16);
  return { X: v => cx + v * s, Y: v => cy - v * s, s, P, cx, cy };
}
function ring(ctx, v, r, color = C.ghost) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(v.X(0), v.Y(0), r * v.s, 0, 7); ctx.stroke(); ctx.restore(); }
function lensDot(ctx, X, Y) { ctx.save(); ctx.fillStyle = 'rgba(232,237,244,0.25)'; ctx.beginPath(); ctx.arc(X, Y, 6, 0, 7); ctx.fill(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(X, Y, 3, 0, 7); ctx.fill(); ctx.restore(); }
function starMark(ctx, X, Y, r = 6) { ctx.save(); ctx.strokeStyle = C.star; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X - r - 3, Y); ctx.lineTo(X + r + 3, Y); ctx.moveTo(X, Y - r - 3); ctx.lineTo(X, Y + r + 3); ctx.stroke(); ctx.restore(); }
function disc(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }
const imgR = m => Math.min(15, 4.5 * Math.sqrt(Math.abs(m))); // disc area ∝ brightness, capped

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
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

/* ---------- step 0: deflection of a grazing ray ---------- */
const FAN = [1, 1.5, 2, 3, 4, 6, 8, 12, 16, 20];
function draw0() {
  const b = num('b0'), m = num('m0');
  $('b0v').textContent = fmt(b, 1); $('m0v').textContent = fmt(m, 1);
  const { ctx, W, H } = fitCanvas($('c0'));
  // Sketch: rays above and below the axis; the vertical scale zooms out so the current ray always fits.
  const top = 34, bot = 226, axisY = (top + bot) / 2, lensX = Math.round(W * 0.22), bRange = Math.max(4, b * 1.2), pxPerR = (axisY - top - 4) / bRange, K = M.schematicFactor();
  title(ctx, t('c0a', { k: Math.round(K / 100) * 100 }), 8, 18, W - 16);
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, bot - top); ctx.clip();
  ctx.strokeStyle = C.axis; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke(); ctx.setLineDash([]);
  const g = ctx.createRadialGradient(lensX, axisY, 0, lensX, axisY, pxPerR * 1.6);
  g.addColorStop(0, '#ffe3a3'); g.addColorStop(0.62, '#ffb454'); g.addColorStop(0.63, 'rgba(255,180,84,0.18)'); g.addColorStop(1, 'rgba(255,180,84,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lensX, axisY, pxPerR * 1.6, 0, 7); ctx.fill();
  const ray = (bb, color, lw, alpha) => {
    const ang = M.deflectionArcsec(m, bb) * K / 3600 * Math.PI / 180;
    for (const sgn of [-1, 1]) {
      const Y0 = axisY - sgn * bb * pxPerR, Y1 = Y0 + sgn * Math.tan(ang) * (W - lensX);
      ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(0, Y0); ctx.lineTo(lensX, Y0); ctx.lineTo(W, Y1); ctx.stroke();
      const cross = lensX + bb * pxPerR / Math.tan(ang);
      if (cross < W - 4) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cross, axisY, 3.5, 0, 7); ctx.fill(); }
      ctx.restore();
    }
  };
  FAN.forEach(bb => { if (bb !== b && bb <= bRange) ray(bb, C.ghost, 1.2, 0.75); });
  ray(b, C.orange, 2.6, 1);
  ctx.restore();
  // Chart: α against b.
  const amax = M.deflectionArcsec(m, 1), yMax = niceStep(amax * 1.15, 1) * Math.ceil(amax * 1.15 / niceStep(amax * 1.15, 1));
  const A = panel(ctx, W, { top: 266, bottom: H - 26, xMin: 0, xMax: 20, yMin: 0, yMax, title: t('c0b') });
  const curve = (f, color, dash) => {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; if (dash) ctx.setLineDash(dash); ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const bb = 1 + 19 * i / 200, Y = A.y(f(m, bb)); if (!i) ctx.moveTo(A.x(bb), Y); else ctx.lineTo(A.x(bb), Y); }
    ctx.stroke(); ctx.restore();
  };
  curve(M.deflectionArcsec, C.cyan); curve(M.newtonArcsec, C.cyan, [5, 4]);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(b), A.P.t); ctx.lineTo(A.x(b), A.P.b); ctx.stroke(); ctx.restore();
  disc(ctx, A.x(b), A.y(M.newtonArcsec(m, b)), 3.5, C.cyan);
  disc(ctx, A.x(b), A.y(M.deflectionArcsec(m, b)), 5.5, C.orange);
  $('r0').textContent = t('s0readout', { m: fmt(m, 1), b: fmt(b, 1), a: fmt(M.deflectionArcsec(m, b), 3), n: fmt(M.newtonArcsec(m, b), 3), f: sig(M.focusAU(m, b), 3) });
}

/* ---------- step 1: the lens equation, solved graphically ---------- */
function draw1() {
  const beta = num('beta1'), im = M.images(beta);
  $('beta1v').textContent = fmt(beta, 2);
  let { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -3, xMax: 3, yMin: -3, yMax: 3, xTicks: [-3, -2, -1, 0, 1, 2, 3], yTicks: [-3, -2, -1, 0, 1, 2, 3], title: t('c1a') });
  ctx.save(); ctx.beginPath(); ctx.rect(A.P.l, A.P.t, A.P.r - A.P.l, A.P.b - A.P.t); ctx.clip();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2;
  for (const sgn of [-1, 1]) { ctx.beginPath(); let first = true; for (let i = 0; i <= 300; i++) { const th = sgn * (0.25 + 2.75 * i / 300), bb = M.betaOf(th); if (first) { ctx.moveTo(A.x(th), A.y(bb)); first = false; } else ctx.lineTo(A.x(th), A.y(bb)); } ctx.stroke(); }
  ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(beta)); ctx.lineTo(A.P.r, A.y(beta)); ctx.stroke();
  ctx.setLineDash([3, 4]); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.5;
  for (const th of [im.tp, im.tm]) { ctx.beginPath(); ctx.moveTo(A.x(th), A.y(beta)); ctx.lineTo(A.x(th), A.y(0)); ctx.stroke(); }
  ctx.restore();
  disc(ctx, A.x(im.tp), A.y(beta), 5.5, C.text); disc(ctx, A.x(im.tm), A.y(beta), 5.5, C.text);

  ({ ctx, W, H } = fitCanvas($('c1b')));
  const V = skyView(ctx, W, H, 2.8, t('c1b'));
  ring(ctx, V, 1); lensDot(ctx, V.X(0), V.Y(0));
  if (im.ring) {
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), V.s, 0, 7); ctx.stroke(); ctx.restore();
  } else {
    disc(ctx, V.X(im.tp), V.Y(0), imgR(im.mp), C.text);
    disc(ctx, V.X(im.tm), V.Y(0), Math.max(1.5, imgR(im.mm)), C.text);
  }
  starMark(ctx, V.X(beta), V.Y(0), 5);
  $('r1').textContent = im.ring ? t('s1ring') : t('s1readout', { b: fmt(beta, 2), tp: fmt(im.tp, 3), tm: fmt(im.tm, 3), mp: fmt(Math.abs(im.mp), 3), mm: fmt(Math.abs(im.mm), 3), sep: fmt(im.sep, 3), A: fmt(im.A, 3) });
}

/* ---------- step 2: the Einstein radius against resolution ---------- */
const s2 = { logM: 12, logDs: Math.log10(2e9), x: 0.5, hist: [] };
function fmtAngle(arcsec) {
  if (arcsec >= 1) return sig(arcsec, 3) + '″';
  if (arcsec >= 1e-3) return sig(arcsec * 1e3, 3) + ' mas';
  return sig(arcsec * 1e6, 3) + ' μas';
}
function fmtDist(pc) { if (pc >= 1e9) return sig(pc / 1e9, 3) + ' Gpc'; if (pc >= 1e6) return sig(pc / 1e6, 3) + ' Mpc'; if (pc >= 1e3) return sig(pc / 1e3, 3) + ' kpc'; return sig(pc, 3) + ' pc'; }
function fmtLen(AUv) { const kpc = AUv * M.AU / M.PC / 1e3; return AUv < 1e5 ? sig(AUv, 3) + ' AU' : sig(kpc, 3) + ' kpc'; }
function remember2() { const r = M.ringCase(s2.logM, s2.logDs, s2.x); const v = r.sepArcsec; if (!s2.hist.some(h => Math.abs(Math.log10(h / v)) < 0.01)) s2.hist.push(v); if (s2.hist.length > 12) s2.hist.shift(); }
function syncSliders2() { $('lm2').value = s2.logM; $('ds2').value = s2.logDs; $('x2').value = s2.x; }
function draw2() {
  const r = M.ringCase(s2.logM, s2.logDs, s2.x);
  $('lm2v').textContent = fmt(s2.logM, 1) + ' → ' + sig(r.mSun, 2) + ' M☉'; $('ds2v').textContent = fmtDist(Math.pow(10, s2.logDs)); $('x2v').textContent = fmt(s2.x, 2);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2a'), 8, 18, W - 16);
  const L = 16, R = W - 16, lo = -6, hi = 3, X = v => L + (Math.log10(v) - lo) / (hi - lo) * (R - L), rulerY = 112;
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  // resolution yardsticks: one label row each, so labels never meet
  M.RESOLUTION.forEach((q, i) => {
    const rowY = 38 + i * 16, Xq = X(q.arcsec), label = t(q.key), w = ctx.measureText(label).width;
    const tx = Math.max(L + w / 2, Math.min(R - w / 2, Xq));
    ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(label, tx, rowY);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Xq, rowY + 4); ctx.lineTo(Xq, rulerY + 6); ctx.stroke();
  });
  // shaded "can be split" side for Hubble
  ctx.fillStyle = 'rgba(126,226,168,0.10)'; ctx.fillRect(X(M.HUBBLE), rulerY - 8, R - X(M.HUBBLE), 16);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, rulerY); ctx.lineTo(R, rulerY); ctx.stroke();
  ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let e = lo; e <= hi; e++) { const Xe = X(Math.pow(10, e)); ctx.beginPath(); ctx.moveTo(Xe, rulerY - 4); ctx.lineTo(Xe, rulerY + 4); ctx.stroke(); }
  [[1e-6, '1 μas'], [1e-3, '1 mas'], [1, '1″'], [1e3, '1000″']].forEach(([v, s]) => { const w = ctx.measureText(s).width; ctx.fillText(s, Math.max(L + w / 2, Math.min(R - w / 2, X(v))), rulerY + 22); });
  ctx.restore();
  s2.hist.forEach(v => { if (Math.abs(Math.log10(v / r.sepArcsec)) > 0.01) disc(ctx, X(Math.min(1e3, Math.max(1e-6, v))), rulerY, 4, C.text); });
  const Xn = X(Math.min(1e3, Math.max(1e-6, r.sepArcsec)));
  ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(Xn, rulerY - 2); ctx.lineTo(Xn - 7, rulerY - 14); ctx.lineTo(Xn + 7, rulerY - 14); ctx.closePath(); ctx.fill(); ctx.restore();
  disc(ctx, Xn, rulerY, 5, C.orange);
  // θE against x, in a unit chosen from the largest value on the curve
  const ds = Math.pow(10, s2.logDs) * M.PC, thx = xx => M.thetaE(r.mSun, xx * ds, ds) / M.ARCSEC;
  const peak = thx(0.05), unit = peak >= 1 ? { k: 1, s: '″' } : peak >= 1e-3 ? { k: 1e3, s: ' mas' } : { k: 1e6, s: ' μas' };
  const yMax = peak * unit.k * 1.08;
  const B = panel(ctx, W, { top: 176, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax, xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], title: t('c2b') + ' (' + unit.s.trim() + ')' });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 180; i++) { const xx = 0.05 + 0.9 * i / 180, Y = B.y(thx(xx) * unit.k); if (!i) ctx.moveTo(B.x(xx), Y); else ctx.lineTo(B.x(xx), Y); }
  ctx.stroke(); ctx.restore();
  disc(ctx, B.x(s2.x), B.y(r.arcsec * unit.k), 5.5, C.orange);
  const k = M.HUBBLE / r.sepArcsec;
  const verdict = r.sepArcsec > 60 ? t('s2v0') : r.sepArcsec > 1 ? t('s2v1') : r.sepArcsec > M.HUBBLE ? t('s2v2') : t('s2v3', { k: sig(k, 2) });
  $('r2').textContent = t('s2readout', { m: sig(r.mSun, 2), ds: fmtDist(Math.pow(10, s2.logDs)), x: fmt(s2.x, 2), th: fmtAngle(r.arcsec), sep: fmtAngle(r.sepArcsec), re: fmtLen(r.RE_AU), verdict });
}

/* ---------- step 3: microlensing light curve ---------- */
const T3 = { min: -2, max: 2, d: 0.02 };
const N3 = Math.round((T3.max - T3.min) / T3.d) + 1;
const s3 = { visited: new Uint8Array(N3), last: null, old: [] };
const tIdx = v => Math.round((v - T3.min) / T3.d);
function mark3(v) { const i = tIdx(v), j = s3.last === null ? i : s3.last; for (let q = Math.min(i, j); q <= Math.max(i, j); q++) s3.visited[q] = 1; s3.last = i; }
function visitedCount() { let k = 0; for (const v of s3.visited) k += v; return k; }
function draw3() {
  const u0 = num('u03'), tt = num('t3'), u = M.uAt(u0, tt), A = M.totalA(u);
  $('u03v').textContent = fmt(u0, 2); $('t3v').textContent = fmt(tt, 2);
  let { ctx, W, H } = fitCanvas($('c3'));
  const V = skyView(ctx, W, H, 2.6, t('c3a'));
  ring(ctx, V, 1); lensDot(ctx, V.X(0), V.Y(0));
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(V.X(-2), V.Y(u0)); ctx.lineTo(V.X(2), V.Y(u0)); ctx.stroke(); ctx.restore();
  const im = M.images(u), ux = tt / u, uy = u0 / u;
  disc(ctx, V.X(im.tp * ux), V.Y(im.tp * uy), imgR(im.mp), 'rgba(232,237,244,0.9)');
  disc(ctx, V.X(im.tm * ux), V.Y(im.tm * uy), Math.max(1.5, imgR(im.mm)), 'rgba(232,237,244,0.9)');
  starMark(ctx, V.X(tt), V.Y(u0), 5);

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const peakAll = Math.max(M.totalA(u0), ...s3.old.map(q => M.totalA(q)));
  const yMax = Math.max(1.6, peakAll * 1.08);
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: -2, xMax: 2, yMin: 1, yMax, xTicks: [-2, -1, 0, 1, 2], yTicks: ticks(1, yMax, 4).filter(v => v >= 1), title: t('c3b') });
  const curve = (q, color, lw, onlyVisited) => {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); let pen = false;
    for (let i = 0; i < N3; i++) { if (onlyVisited && !s3.visited[i]) { pen = false; continue; } const v = T3.min + i * T3.d, X = B.x(v), Y = B.y(M.lightCurve(q, v)); if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y); }
    ctx.stroke(); ctx.restore();
  };
  s3.old.forEach(q => curve(q, C.raw, 1.6, false));
  curve(u0, C.cyan, 2.4, true);
  disc(ctx, B.x(tt), B.y(A), 5.5, C.orange);
  const c = visitedCount();
  $('r3').textContent = t('s3readout', { t: fmt(tt, 2), u: fmt(u, 3), A: fmt(A, 3), dm: fmt(M.dMag(A), 2), u0: fmt(u0, 2), pk: fmt(M.totalA(u0), 2), prog: c < N3 ? t('s3prog', { c, N: N3 }) : '' });
}
function retire3() { const u0 = num('u03'); if (visitedCount() > 20 && !s3.old.some(q => Math.abs(q - u0) < 1e-9)) { s3.old.push(u0); if (s3.old.length > 6) s3.old.shift(); } s3.visited.fill(0); s3.last = null; }

/* ---------- step 4: extended source → arcs and rings ---------- */
const off4 = document.createElement('canvas');
function draw4() {
  const beta = num('beta4'), rho = num('rho4');
  $('beta4v').textContent = fmt(beta, 2); $('rho4v').textContent = fmt(rho, 2);
  let { ctx, W, H } = fitCanvas($('c4'));
  const S = skyView(ctx, W, H, 2.1, t('c4a'));
  ring(ctx, S, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(S.P.l, S.P.t, S.P.r - S.P.l, S.P.b - S.P.t); ctx.clip();
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(S.X(beta), S.Y(0), rho * S.s, Math.PI, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = C.violet; ctx.beginPath(); ctx.arc(S.X(beta), S.Y(0), rho * S.s, 0, Math.PI); ctx.fill();
  ctx.restore();
  lensDot(ctx, S.X(0), S.Y(0));

  let dpr;
  ({ ctx, W, H, dpr } = fitCanvas($('c4b')));
  const V = skyView(ctx, W, H, M.EXT4, t('c4b'));
  const n = Math.max(80, Math.min(520, Math.round((V.P.r - V.P.l) * Math.min(dpr, 1.5))));
  off4.width = n; off4.height = n;
  const octx = off4.getContext('2d'), img = octx.createImageData(n, n), d = 2 * M.EXT4 / n;
  const top = [103, 215, 249], bot = [183, 156, 255];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = -M.EXT4 + (i + 0.5) * d, y = M.EXT4 - (j + 0.5) * d, s = M.sourceOf(x, y);
    if (!s) continue; const dx = s[0] - beta, dy = s[1];
    if (dx * dx + dy * dy > rho * rho) continue;
    const col = dy >= 0 ? top : bot, k = (j * n + i) * 4;
    img.data[k] = col[0]; img.data[k + 1] = col[1]; img.data[k + 2] = col[2]; img.data[k + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(off4, V.P.l, V.P.t, V.P.r - V.P.l, V.P.b - V.P.t); ctx.restore();
  ring(ctx, V, 1); lensDot(ctx, V.X(0), V.Y(0));
  const span = M.arcSpanDeg(beta, rho), mx = M.extendedMag(beta, rho), mp = beta === 0 ? Infinity : M.totalA(beta);
  const shape = span >= 360 ? t('s4ring') : t('s4arc', { s: fmt(span, 1) });
  $('r4').textContent = t('s4readout', { b: fmt(beta, 2), r: fmt(rho, 2), shape, mx: fmt(mx, 2), mp: isFinite(mp) ? fmt(mp, 2) : t('s4inf') });
}

/* ---------- step 5: weighing the lens ---------- */
const s5 = { hist: [] };
const Y5MAX = 40; // ×10¹¹ M☉; heavier cases show an arrow at the top edge
function draw5() {
  const th = num('th5'), dl = num('dl5'), ds = num('ds5');
  $('th5v').textContent = fmt(th, 2) + '″'; $('dl5v').textContent = String(dl); $('ds5v').textContent = String(ds);
  const { ctx, W, H } = fitCanvas($('c5'));
  const ok = ds > dl, Mof = q => M.massFromRing(q, dl, ds) / 1e11, Mfloor = q => M.massFromRing(q, dl, 1e12) / 1e11;
  const yMax = Y5MAX; // fixed scale, so changing a distance visibly moves the curve
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 3.2, yMin: 0, yMax, title: t('c5a') });
  const clampY = v => P.y(Math.min(yMax, v));
  ctx.save(); ctx.beginPath(); ctx.rect(P.P.l, P.P.t - 1, P.P.r - P.P.l, P.P.b - P.P.t + 2); ctx.clip();
  ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i <= 160; i++) { const q = 3.2 * i / 160, Y = clampY(Mfloor(q)); if (!i) ctx.moveTo(P.x(q), Y); else ctx.lineTo(P.x(q), Y); }
  ctx.stroke(); ctx.restore();
  s5.hist.forEach(h => { if (h.m / 1e11 <= yMax && !(Math.abs(h.th - th) < 1e-9 && h.dl === dl && h.ds === ds)) disc(ctx, P.x(h.th), P.y(h.m / 1e11), 3.5, C.text); });
  if (!ok) { $('r5').textContent = t('s5bad', { ds, dl }); return; }
  const m = M.massFromRing(th, dl, ds);
  ctx.save(); ctx.beginPath(); ctx.rect(P.P.l, P.P.t - 1, P.P.r - P.P.l, P.P.b - P.P.t + 2); ctx.clip(); ctx.fillStyle = 'rgba(103,215,249,0.18)';
  ctx.fillRect(P.x(th * 0.95), P.P.t, P.x(th * 1.05) - P.x(th * 0.95), P.P.b - P.P.t);
  ctx.fillRect(P.P.l, clampY(Mof(th * 1.05)), P.P.r - P.P.l, clampY(Mof(th * 0.95)) - clampY(Mof(th * 1.05)));
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let i = 0; i <= 320; i++) { const q = 3.2 * i / 320, v = Mof(q); if (v > yMax * 1.02) break; const Y = P.y(v); if (!i) ctx.moveTo(P.x(q), Y); else ctx.lineTo(P.x(q), Y); }
  ctx.stroke(); ctx.restore();
  if (m / 1e11 > yMax) { ctx.save(); ctx.fillStyle = C.orange; const X = P.x(th); ctx.beginPath(); ctx.moveTo(X, P.P.t + 1); ctx.lineTo(X - 7, P.P.t + 13); ctx.lineTo(X + 7, P.P.t + 13); ctx.closePath(); ctx.fill(); ctx.restore(); }
  if (m / 1e11 <= yMax) disc(ctx, P.x(th), P.y(m / 1e11), 6, C.orange);
  const lo = (0.95 * 0.95 - 1) * 100, hi = (1.05 * 1.05 - 1) * 100;
  $('r5').textContent = t('s5readout', { th: fmt(th, 2), dl, ds, m: sig(m, 3), rk: fmt(M.ringRadiusKpc(th, dl), 2), lo: fmt(lo, 1), hi: fmt(hi, 1) }) + (m / 1e11 > yMax ? t('s5off') : '');
}
function remember5() { const th = num('th5'), dl = num('dl5'), ds = num('ds5'); if (ds > dl) { s5.hist.push({ th, dl, ds, m: M.massFromRing(th, dl, ds) }); if (s5.hist.length > 16) s5.hist.shift(); } }

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['b0', 'm0'].forEach(id => $(id).addEventListener('input', draw0));
  $('beta1').addEventListener('input', draw1);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const preset = key => { const p = M.PRESETS[key]; s2.logM = p.logM; s2.logDs = p.logDs; s2.x = p.x; syncSliders2(); remember2(); draw2(); };
  $('pStar').addEventListener('click', () => preset('star'));
  $('pGalaxy').addEventListener('click', () => preset('galaxy'));
  $('pCluster').addEventListener('click', () => preset('cluster'));
  [['lm2', 'logM'], ['ds2', 'logDs'], ['x2', 'x']].forEach(([id, key]) => {
    $(id).addEventListener('input', () => { s2[key] = num(id); draw2(); });
    $(id).addEventListener('change', () => { remember2(); draw2(); });
  });

  $('t3').addEventListener('input', () => { stopAnim('s3'); mark3(num('t3')); draw3(); });
  $('u03').addEventListener('input', () => { stopAnim('s3'); retire3(); mark3(num('t3')); draw3(); });
  $('play3').addEventListener('click', () => {
    retire3(); s3.last = tIdx(T3.min);
    animate('s3', 5000, p => { const v = Math.round((T3.min + p * (T3.max - T3.min)) / T3.d) * T3.d; $('t3').value = v.toFixed(2); mark3(num('t3')); draw3(); });
  });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.old = []; s3.visited.fill(0); s3.last = null; mark3(num('t3')); draw3(); });
  mark3(num('t3'));

  ['beta4', 'rho4'].forEach(id => $(id).addEventListener('input', draw4));
  ['th5', 'dl5', 'ds5'].forEach(id => { $(id).addEventListener('input', draw5); $(id).addEventListener('change', () => { remember5(); draw5(); }); });
  remember2(); remember5();

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
  window.refreshLensing = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
