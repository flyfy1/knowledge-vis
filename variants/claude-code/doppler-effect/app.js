'use strict';
// Doppler effect lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every ring, tick, curve and readout comes from window.DOPPLER_MODEL (model.js). Canvas text is limited
// to panel titles, axis ticks and one-letter markers in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.DOPPLER_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (!isFinite(v)) return '—'; if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const fx = (v, d) => (isFinite(v) ? (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d) : '—');
const c = M.C_AIR;

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

// Panel title in its own row; shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }

// Plot panel: title row above, y ticks to the left, x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const v of (o.yTicks || [])) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 34, o.xSteps || [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v, 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}

// A strip of arrival ticks on a time axis (times in the model's unit, shown × scale).
function strip(ctx, W, top, h, t0, t1, ticks, color, ttl, scale, steps) {
  const m = panel(ctx, W, { top, bottom: top + h, xMin: t0 * scale, xMax: t1 * scale, xTicks: true, xSteps: steps, title: ttl, left: 12, minPx: 40 });
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2;
  ticks.forEach(v => { const X = m.x(v * scale); ctx.beginPath(); ctx.moveTo(X, top + 4); ctx.lineTo(X, top + h - 4); ctx.stroke(); });
  ctx.restore();
  return m;
}
function dot(ctx, X, Y, r, color, hollow) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function letter(ctx, s, X, Y, color) { ctx.save(); ctx.font = '700 12px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(s, X, Y); ctx.restore(); }

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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
function playButton(id, name, ms, frame) {
  const b = $(id);
  b.addEventListener('click', () => {
    b.textContent = t('playing'); b.dataset.busy = '1';
    animate(name, ms, frame, () => { delete b.dataset.busy; b.textContent = t(b.dataset.i18n); });
  });
}

// Rings of a (possibly moving) source, clipped to a rectangle; world → canvas via (X0, Y0, s px per metre).
function drawRings(ctx, rings, X0, Y0, s, box, color, alpha) {
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = 1.4;
  rings.forEach(r => { if (r.r <= 0) return; ctx.globalAlpha = alpha(r); ctx.beginPath(); ctx.arc(X0 + r.cx * s, Y0, r.r * s, 0, 7); ctx.stroke(); });
  ctx.restore();
}

/* ---------- step 0: a still source; count arrivals ---------- */
const S0 = { win: 0.020, xL: 3, slowMs: 6000, tt: 0.020 };
function draw0() {
  const f = num('f0'); $('f0v').textContent = f + ' Hz';
  const { ctx, W, H } = fitCanvas($('c0'));
  const box = { x: 8, y: 30, w: W - 16, h: 190 };
  const xMin = -2.2, xMax = 3.8, s = box.w / (xMax - xMin), X0 = box.x - xMin * s, Y0 = box.y + box.h / 2;
  title(ctx, t('c0a'), 8, 20, W - 16);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.restore();
  const tt = S0.tt, rings = M.rings(f, c, 0, tt, 6);
  drawRings(ctx, rings, X0, Y0, s, box, C.cyan, () => 0.85);
  dot(ctx, X0, Y0, 6, C.orange);
  const XL = X0 + S0.xL * s; dot(ctx, XL, Y0, 6, C.green); letter(ctx, 'L', XL, Y0 - 12, C.green);
  // 1 m scale bar
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(box.x + 10, box.y + box.h - 10); ctx.lineTo(box.x + 10 + s, box.y + box.h - 10); ctx.stroke();
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.bg; ctx.fillRect(box.x + 10 + s / 2 - 14, box.y + box.h - 27, 28, 15); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText('1 m', box.x + 10 + s / 2, box.y + box.h - 15); ctx.restore();
  const arr = M.arrivals(f, c, 0, S0.xL, 0, 0, tt);
  strip(ctx, W, 270, 34, 0, S0.win, arr, C.text, t('c0b'), 1000, [1, 2, 5, 10]);
  const dt = M.meanInterval(arr);
  $('r0').textContent = t('s0readout', { T: fx(1000 / f, 3), lam: fx(c / f, 3), win: fmt(tt * 1000, 1), n: arr.length, dt: fx(dt * 1000, 3), fh: fx(1 / dt, 1) });
  $('h0').textContent = t('s0hint', { slow: Math.round(S0.slowMs / 1000 / S0.win) });
}

/* ---------- step 1: a moving source, listeners ahead and behind ---------- */
const S1 = { f: M.F0, xA: 5, xB: -5, half: 8, p: 1 };
function draw1() {
  const v = num('v1'), f = S1.f, T = 1 / f; $('v1v').textContent = v + ' m/s';
  const t0 = -S1.half * T, t1 = S1.half * T, tt = t0 + S1.p * (t1 - t0);
  const { ctx, W, H } = fitCanvas($('c1'));
  const box = { x: 8, y: 30, w: W - 16, h: 200 };
  const xh = Math.max(6, Math.min(9.3, box.w / 2 / 22)), s = box.w / (2 * xh), X0 = box.x + box.w / 2, Y0 = box.y + box.h / 2;
  title(ctx, t('c1a'), 8, 20, W - 16);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.restore();
  drawRings(ctx, M.rings(f, c, v, tt, 2 * xh), X0, Y0, s, box, C.cyan, () => 0.8);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X0 + v * t0 * s, Y0); ctx.lineTo(X0 + v * tt * s, Y0); ctx.stroke(); ctx.restore();
  dot(ctx, X0 + v * tt * s, Y0, 6, C.orange);
  const XA = X0 + S1.xA * s, XB = X0 + S1.xB * s;
  dot(ctx, XA, Y0, 6, C.green); letter(ctx, 'A', XA, Y0 - 12, C.green);
  dot(ctx, XB, Y0, 6, C.pink); letter(ctx, 'B', XB, Y0 - 12, C.pink);
  const aA = M.arrivals(f, c, v, S1.xA, 0, t0, tt), aB = M.arrivals(f, c, v, S1.xB, 0, t0, tt);
  strip(ctx, W, 272, 30, 0, t1 - t0, aA.map(q => q - t0), C.green, t('c1b'), 1000, [1, 2, 5, 10]);
  strip(ctx, W, 354, 30, 0, t1 - t0, aB.map(q => q - t0), C.pink, t('c1c'), 1000, [1, 2, 5, 10]);
  // readout from the full run (so it does not jump while the animation plays)
  const fA = M.arrivals(f, c, v, S1.xA, 0, t0, t1), fB = M.arrivals(f, c, v, S1.xB, 0, t0, t1);
  const ta = M.meanInterval(fA), tb = M.meanInterval(fB);
  $('r1').textContent = t('s1readout', { la: fx((c - v) / f, 3), ta: fx(ta * 1000, 3), fa: fx(1 / ta, 1), faf: fx(M.heard(f, c, 0, v), 1), lb: fx((c + v) / f, 3), tb: fx(tb * 1000, 3), fb: fx(1 / tb, 1), fbf: fx(M.heard(f, c, 0, -v), 1) });
}

/* ---------- step 2: source moves vs listener moves ---------- */
const S2 = { f: M.F0, n: 10, xMin: -6, xMax: 8, xS: -3, xL: 5, p: 1 };
function lane2(sp) {
  const f = S2.f, T = 1 / f, mid = S2.n / 2 * T;
  return {
    T, tEnd: S2.n * T,
    srcA: tt => S2.xS + sp * (tt - mid), xA0: S2.xS - sp * mid,
    lisB: tt => S2.xL - sp * (tt - mid), xB0: S2.xL + sp * mid
  };
}
function draw2() {
  const sp = num('s2'), f = S2.f, L = lane2(sp), tt = S2.p * L.tEnd; $('s2v').textContent = sp + ' m/s';
  let { ctx, W, H } = fitCanvas($('c2'));
  const lanes = [{ top: 30, ttl: t('c2top') }, { top: 196, ttl: t('c2bot') }];
  const box = (top) => ({ x: 8, y: top, w: W - 16, h: 56 });
  const s = (W - 16) / (S2.xMax - S2.xMin), X = x => 8 + (x - S2.xMin) * s;
  const arrA = M.arrivals(f, c, sp, S2.xL - L.xA0, 0, 0, tt);
  const arrB = M.arrivalsMovingListener(f, c, sp, S2.xS, L.xB0, 0, tt);
  lanes.forEach((ln, i) => {
    const b = box(ln.top); title(ctx, ln.ttl, 8, ln.top - 8, W - 16);
    ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
    const xs = i === 0 ? L.srcA(tt) : S2.xS, xl = i === 0 ? S2.xL : L.lisB(tt);
    const crests = i === 0 ? M.laneCrests(f, c, sp, L.xA0, tt, xs, S2.xMax + 1) : M.laneCrests(f, c, 0, S2.xS, tt, xs, S2.xMax + 1);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
    crests.forEach(x => { ctx.beginPath(); ctx.moveTo(X(x), b.y + 8); ctx.lineTo(X(x), b.y + b.h - 8); ctx.stroke(); });
    ctx.restore();
    dot(ctx, X(xs), b.y + b.h / 2, 6, C.orange); dot(ctx, X(xl), b.y + b.h / 2, 6, C.green);
    strip(ctx, W, ln.top + 86, 26, 0, L.tEnd, i === 0 ? arrA : arrB, C.text, t('c2strip'), 1000, [1, 2, 5, 10]);
  });
  const fullA = M.arrivals(f, c, sp, S2.xL - L.xA0, 0, 0, L.tEnd), fullB = M.arrivalsMovingListener(f, c, sp, S2.xS, L.xB0, 0, L.tEnd);
  const ma = 1 / M.meanInterval(fullA), mb = 1 / M.meanInterval(fullB);

  ({ ctx, W, H } = fitCanvas($('c2b')));
  const G = panel(ctx, W, { top: 40, bottom: H - 28, xMin: -0.6, xMax: 0.6, yMin: 0.4, yMax: 2.6, yTicks: [0.5, 1, 1.5, 2, 2.5], xTicks: true, xSteps: [0.2, 0.3, 0.6], left: 34, title: t('c2b') });
  const curve = (fn, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const b = -0.6 + 1.2 * i / 120, Y = G.y(fn(b)); if (!i) ctx.moveTo(G.x(b), Y); else ctx.lineTo(G.x(b), Y); } ctx.stroke(); ctx.restore(); };
  curve(b => 1 / (1 - b), C.orange); curve(b => 1 + b, C.green);
  const be = sp / c;
  dot(ctx, G.x(be), G.y(1 / (1 - be)), 5.5, C.orange); dot(ctx, G.x(be), G.y(1 + be), 5.5, C.green);
  const fa = M.heard(f, c, 0, sp), fb = M.heard(f, c, sp, 0);
  $('r2').textContent = t('s2readout', { la: fx((c - sp) / f, 3), ma: fx(ma, 1), fa: fx(fa, 1), lb: fx(c / f, 3), mb: fx(mb, 1), fb: fx(fb, 1), diff: fx(fa - fb, 1) });
}

/* ---------- step 3: a car passes ---------- */
const T3 = { min: -3, max: 3, d: 0.01 };
const S3 = { visited: new Uint8Array(601).fill(1), last: null };
const idx3 = v => Math.round((v - T3.min) / T3.d);
function mark3(v) { const i = idx3(v), j = S3.last === null ? i : S3.last; for (let q = Math.min(i, j); q <= Math.max(i, j); q++) S3.visited[q] = 1; S3.last = i; }
function draw3() {
  const v = num('v3'), d = num('d3'), tr = num('t3'), f = M.F0;
  $('v3v').textContent = v + ' m/s'; $('d3v').textContent = d + ' m'; $('t3v').textContent = tr.toFixed(2) + ' s';
  const pb = M.passBy(f, c, v, d, tr);
  const { ctx, W, H } = fitCanvas($('c3'));
  // top view: equal scale on both axes so the angle is true
  const box = { x: 8, y: 30, w: W - 16, h: 180 };
  const X = Math.max(v * 3.4, d * 1.2), s = Math.min(box.w / (2 * X), (box.h - 40) / d);
  const Xc = box.x + box.w / 2, Yroad = box.y + box.h - 26, Yyou = Yroad - d * s;
  title(ctx, t('c3a'), 8, 20, W - 16);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  ctx.strokeStyle = C.axis; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(box.x, Yroad); ctx.lineTo(box.x + box.w, Yroad); ctx.stroke();
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(box.x, Yroad); ctx.lineTo(box.x + box.w, Yroad); ctx.stroke(); ctx.setLineDash([]);
  const Xe = Xc + pb.xe * s, Xn = Xc + v * tr * s;
  ctx.strokeStyle = C.violet; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(Xe, Yroad); ctx.lineTo(Xc, Yyou); ctx.stroke(); ctx.setLineDash([]);
  // angle θ between the velocity (+x) and the line of sight from the emission point
  const ang = Math.atan2(Yyou - Yroad, Xc - Xe);
  ctx.strokeStyle = C.violet; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(Xe, Yroad, 18, ang, 0); ctx.stroke();
  ctx.restore();
  dot(ctx, Xe, Yroad, 6, C.violet, true);
  ctx.save(); ctx.fillStyle = C.orange; ctx.fillRect(Xn - 9, Yroad - 5, 18, 10); ctx.restore();
  dot(ctx, Xc, Yyou, 6, C.green);
  const thX = Xe + 24 * Math.cos(ang / 2), thY = Yroad + 24 * Math.sin(ang / 2) + 4;
  if (thX > box.x + 6 && thX < box.x + box.w - 6) letter(ctx, 'θ', thX, Math.min(thY, Yroad - 6), C.violet);
  // graph
  const G = panel(ctx, W, { top: 262, bottom: H - 28, xMin: T3.min, xMax: T3.max, yMin: 340, yMax: 600, yTicks: [350, 400, 450, 500, 550, 600], xTicks: true, xSteps: [0.5, 1, 2], left: 40, title: t('c3b') });
  const fmax = M.heard(f, c, 0, v), fmin = M.heard(f, c, 0, -v);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
  [f, fmax, fmin].forEach(q => { ctx.beginPath(); ctx.moveTo(G.P.l, G.y(q)); ctx.lineTo(G.P.r, G.y(q)); ctx.stroke(); });
  ctx.strokeStyle = C.violet; ctx.beginPath(); ctx.moveTo(G.x(d / c), G.P.t); ctx.lineTo(G.x(d / c), G.P.b); ctx.stroke();
  ctx.setLineDash([]); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(G.x(0), G.P.t); ctx.lineTo(G.x(0), G.P.b); ctx.stroke(); ctx.globalAlpha = 1;
  // faint full curve, bright traced part
  ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.22; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 600; i++) { const q = T3.min + i * T3.d, Y = G.y(M.passBy(f, c, v, d, q).f); if (!i) ctx.moveTo(G.x(q), Y); else ctx.lineTo(G.x(q), Y); }
  ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 2.6; ctx.beginPath(); let pen = false;
  S3.visited.forEach((on, i) => { if (!on) { pen = false; return; } const q = T3.min + i * T3.d, Xq = G.x(q), Y = G.y(M.passBy(f, c, v, d, q).f); if (!pen) { ctx.moveTo(Xq, Y); pen = true; } else ctx.lineTo(Xq, Y); });
  ctx.stroke(); ctx.restore();
  dot(ctx, G.x(tr), G.y(pb.f), 5.5, C.text);
  $('r3').textContent = t('s3readout', { t: tr.toFixed(2), xc: fx(v * tr, 1), te: fx(pb.te, 3), xe: fx(pb.xe, 1), lag: fx(tr - pb.te, 3), th: fx(pb.theta * 180 / Math.PI, 1), f: fx(pb.f, 1), fmax: fx(fmax, 1), fmin: fx(fmin, 1), tz: fx(d / c, 3) });
}

/* ---------- step 4: echo from an approaching cart ---------- */
const S4 = { f: 40000, c: 340, n: 20, xR0: 20, p: 1 };
function draw4() {
  const u = num('u4'), be = u / S4.c, tt = S4.p * S4.n; $('u4v').textContent = u + ' m/s';
  let { ctx, W, H } = fitCanvas($('c4'));
  const box = { x: 8, y: 30, w: W - 16, h: 96 }, xMin = -1, xMax = S4.xR0 + 2, s = box.w / (xMax - xMin), X = x => box.x + (x - xMin) * s;
  title(ctx, t('c4a'), 8, 20, W - 16);
  const L = M.echoLane(be, S4.xR0, tt);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  ctx.lineWidth = 2;
  ctx.strokeStyle = C.cyan; L.out.forEach(x => { ctx.beginPath(); ctx.moveTo(X(x), box.y + 8); ctx.lineTo(X(x), box.y + box.h / 2 - 3); ctx.stroke(); });
  ctx.strokeStyle = C.orange; L.back.forEach(x => { ctx.beginPath(); ctx.moveTo(X(x), box.y + box.h / 2 + 3); ctx.lineTo(X(x), box.y + box.h - 8); ctx.stroke(); });
  ctx.restore();
  ctx.save(); ctx.fillStyle = C.text; ctx.fillRect(X(L.xr), box.y + 10, 12, box.h - 20); ctx.fillStyle = C.green; ctx.fillRect(X(0) - 10, box.y + box.h / 2 - 12, 10, 24); ctx.restore();
  const Tus = 1e6 / S4.f, sent = []; for (let k = 0; k <= tt + 1e-9; k++) sent.push(k);
  strip(ctx, W, 172, 30, 0, S4.n, sent, C.cyan, t('c4b'), Tus, [50, 100, 200]);
  strip(ctx, W, 254, 30, 0, S4.n, M.echoArrivals(be, S4.xR0, 0, tt), C.orange, t('c4c'), Tus, [50, 100, 200]);

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const G = panel(ctx, W, { top: 40, bottom: H - 28, xMin: 0, xMax: 40, yMin: 0, yMax: 12000, yTicks: [0, 4000, 8000, 12000], xTicks: true, xSteps: [10, 20], left: 44, title: t('c4d') });
  ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = C.text; ctx.beginPath();
  for (let i = 0; i <= 80; i++) { const q = 40 * i / 80, Y = G.y(M.reflect(S4.f, S4.c, q).beat); if (!i) ctx.moveTo(G.x(q), Y); else ctx.lineTo(G.x(q), Y); }
  ctx.stroke(); ctx.setLineDash([6, 5]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(G.x(0), G.y(0)); ctx.lineTo(G.x(40), G.y(M.reflect(S4.f, S4.c, 40).approx)); ctx.stroke(); ctx.restore();
  const r = M.reflect(S4.f, S4.c, u), rr = M.reflect(24.15e9, 3e8, u);
  dot(ctx, G.x(u), G.y(r.beat), 5.5, C.orange);
  const rerr = u > 0 ? rr.relErr.toExponential(1).replace(/e([+-])(\d+)/, (m0, sg, e) => '×10' + (sg === '-' ? '⁻' : '') + [...e].map(ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'[ch]).join('')) : '0';
  $('r4').textContent = t('s4readout', { fe: fx(r.echo, 0), beat: fx(r.beat, 0), ap: fx(r.approx, 0), err: u > 0 ? fx(100 * r.relErr, 1) : '0', uback: fx(M.speedFromBeat(S4.f, S4.c, r.beat), 2), rb: fx(rr.beat, 0), rerr });
}

/* ---------- step 5: Mach cone ---------- */
const S5 = { n: 10, p: 1 };
function draw5() {
  const Mn = num('m5'); $('m5v').textContent = Mn.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c5'));
  const box = { x: 8, y: 30, w: W - 16, h: H - 40 };
  title(ctx, t('c5a'), 8, 20, W - 16);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.restore();
  const n = S5.n, tt = -n + S5.p * n; // emission times −n..0; c = 1, one crest per unit time
  const xmin = -n * Mn - n - 0.5, xmax = Math.max(n * (1 - Mn), 0) + 1.5;
  const s = Math.min(box.w / (xmax - xmin), (box.h - 12) / (2 * n + 1));
  const X0 = box.x + (box.w - (xmax - xmin) * s) / 2 - xmin * s, Y0 = box.y + box.h / 2;
  const rings = []; for (let k = -n; k <= Math.floor(tt + 1e-9); k++) rings.push({ cx: Mn * k, r: tt - k });
  drawRings(ctx, rings, X0, Y0, s, box, C.cyan, r => 0.35 + 0.6 * (1 - r.r / (n + 1)));
  const xs = X0 + Mn * tt * s;
  const a = M.machAngle(Mn);
  if (a !== null) {
    const age = tt + n, len = age * Math.sqrt(Mn * Mn - 1) * s;
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2.2; ctx.beginPath();
    ctx.moveTo(xs - len * Math.cos(a), Y0 - len * Math.sin(a)); ctx.lineTo(xs, Y0); ctx.lineTo(xs - len * Math.cos(a), Y0 + len * Math.sin(a)); ctx.stroke(); ctx.restore();
  }
  dot(ctx, xs, Y0, 6, C.orange);
  const v = fx(Mn * c, 0);
  $('r5').textContent = Math.abs(Mn - 1) < 1e-9 ? t('s5sonic', { v }) : Mn < 1 ? t('s5sub', { M: Mn.toFixed(2), v, sp: fx(M.aheadSpacing(Mn), 2) }) : t('s5super', { M: Mn.toFixed(2), v, a: fx(a * 180 / Math.PI, 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('f0').addEventListener('input', () => { stopAnim('s0'); S0.tt = S0.win; draw0(); });
  playButton('play0', 's0', S0.slowMs, p => { S0.tt = p * S0.win; draw0(); });
  $('v1').addEventListener('input', () => { stopAnim('s1'); S1.p = 1; draw1(); });
  playButton('play1', 's1', 8000, p => { S1.p = p; draw1(); });
  $('s2').addEventListener('input', () => { stopAnim('s2'); S2.p = 1; draw2(); });
  playButton('play2', 's2', 7000, p => { S2.p = p; draw2(); });
  ['v3', 'd3'].forEach(id => $(id).addEventListener('input', draw3));
  $('t3').addEventListener('input', () => { stopAnim('s3'); mark3(num('t3')); draw3(); });
  $('drive3').addEventListener('click', () => {
    const b = $('drive3'); b.textContent = t('playing');
    S3.visited.fill(0); S3.last = idx3(T3.min);
    animate('s3', 6000, p => { const q = Math.round((T3.min + p * (T3.max - T3.min)) / T3.d) * T3.d; $('t3').value = q.toFixed(2); mark3(num('t3')); draw3(); }, () => { b.textContent = t('drive'); });
  });
  $('u4').addEventListener('input', () => { stopAnim('s4'); S4.p = 1; draw4(); });
  playButton('play4', 's4', 8000, p => { S4.p = p; draw4(); });
  $('m5').addEventListener('input', () => { stopAnim('s5'); S5.p = 1; draw5(); });
  playButton('play5', 's5', 6000, p => { S5.p = p; draw5(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
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
  window.refreshPage = () => {
    document.querySelectorAll('[data-busy]').forEach(b => { b.textContent = t('playing'); });
    if (anims.s3) $('drive3').textContent = t('playing');
    refresh();
  };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
