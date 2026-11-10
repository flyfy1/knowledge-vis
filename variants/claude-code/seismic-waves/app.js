'use strict';
// Seismic waves lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every wavefront, ray, travel time and readout comes from window.SEIS_MODEL (model.js). Canvas text is limited
// to panel titles, axis ticks and the three station letters on the step 1 map; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SEIS_MODEL;
const t = (...a) => window.SEIS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', star: '#ffd27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', ring: '#9fb4cc' };
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
  let height = Number(canvas.dataset.h);
  // square top views: no taller than the width needs (narrow screens would otherwise leave a blank band)
  if (canvas.dataset.square) { height = Math.min(height, Math.round(width) + 44); canvas.style.height = height + 'px'; }
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
  const yL = o.yLabel || tickLabel, xL = o.xLabel || tickLabel;
  const left = o.left || Math.max(30, ...yT.map(v => ctx.measureText(yL(v)).width + 12));
  ctx.restore();
  const P = { l: left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of yT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yL(v), P.l - 6, y(v) + 4);
  }
  const xT = o.xTicks || ticks(o.xMin, o.xMax, Math.max(2, Math.floor((P.r - P.l) / 46)));
  ctx.textAlign = 'center';
  for (const v of xT) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(xL(v), x(v), P.b + 15);
  }
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
// A square top view centred on the Earth: ±ext in Earth radii, ticks at whole radii along the bottom.
function skyView(ctx, W, H, ext, ttl, yOff = 0) {
  const top = 26, bottom = H - 24, size = Math.min(W - 24, bottom - top), cx = W / 2, cy = top + size / 2, s = size / (2 * ext);
  const P = { l: cx - size / 2, r: cx + size / 2, t: top, b: top + size };
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(P.l, P.t, size, size);
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  const st = ext > 8 ? 4 : ext > 4 ? 2 : 1;
  for (let v = -Math.floor(ext / st) * st; v <= ext; v += st) { const X = cx + v * s; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke(); ctx.fillText(String(v).replace('-', '−'), X, P.b + 15); }
  ctx.restore();
  title(ctx, ttl, 8, top - 9, W - 16);
  return { X: v => cx + v * s, Y: v => cy - (v - yOff) * s, s, P, cx, cy };
}
function disc(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }

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

function tri(ctx, X, Y, s = 7, color = C.text) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X, Y - s); ctx.lineTo(X - s * 0.85, Y + s * 0.6); ctx.lineTo(X + s * 0.85, Y + s * 0.6); ctx.closePath(); ctx.fill(); ctx.restore(); }
function cross(ctx, X, Y, s = 6, color = C.text) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(X - s, Y - s); ctx.lineTo(X + s, Y + s); ctx.moveTo(X + s, Y - s); ctx.lineTo(X - s, Y + s); ctx.stroke(); ctx.restore(); }

/* ---------- Earth slice drawing (steps 3–5) ---------- */
function earthView(ctx, W, H, ttl, rc = M.RCMB) {
  const top = 26, size = Math.min(W - 16, H - top - 8), k = size / 2 / M.RE, cx = W / 2, cy = top + size / 2;
  const V = { k, cx, cy, X: (r, phi) => cx + r * Math.sin(phi) * k, Y: (r, phi) => cy - r * Math.cos(phi) * k };
  const ring = (r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, 7); ctx.fill(); };
  ctx.save(); ring(M.RE, '#24384e'); ring(rc, '#5a4126'); ring(M.RICB * rc / M.RCMB, '#8a6233');
  ctx.strokeStyle = C.axis; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx, cy - M.RE * k); ctx.lineTo(cx, cy + M.RE * k); ctx.stroke(); ctx.restore();
  title(ctx, ttl, 8, top - 9, W - 16);
  return V;
}
function rayPath(ctx, V, tr, color, lw, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath();
  tr.path.forEach((q, i) => { const X = V.X(q.r, q.phi), Y = V.Y(q.r, q.phi); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
  ctx.stroke(); ctx.restore();
}
function surfaceArc(ctx, V, a, b, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(V.cx, V.cy, M.RE * V.k + 4, -Math.PI / 2 + a * Math.PI / 180, -Math.PI / 2 + b * Math.PI / 180); ctx.stroke(); ctx.restore(); }
function sourceMark(ctx, V) { disc(ctx, V.X(M.RE, 0), V.Y(M.RE, 0), 5.5, C.star); }

/* ---------- step 0: S − P ---------- */
const s0 = { t: null };
function draw0() {
  const d = num('d0'), a = M.arrivals(d), tEnd = a.tS * 1.3 + 8, tt = s0.t === null ? tEnd : s0.t;
  $('d0v').textContent = String(d);
  let { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 17, W - 16);
  const L = 22, Rr = W - 22, X = km => L + km / 650 * (Rr - L), surf = 40, kz = (Rr - L) / 650;
  ctx.save(); ctx.fillStyle = '#1a2836'; ctx.fillRect(0, surf, W, H - surf); ctx.beginPath(); ctx.rect(0, surf, W, H - surf); ctx.clip();
  const front = (r, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(X(0), surf, r * kz, 0, Math.PI); ctx.stroke(); };
  front(M.VP * tt, C.cyan); front(M.VS * tt, C.orange);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, surf); ctx.lineTo(W, surf); ctx.stroke(); ctx.restore();
  disc(ctx, X(0), surf, 6, C.star); tri(ctx, X(d), surf - 6, 8);

  ({ ctx, W, H } = fitCanvas($('c0b')));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: tEnd, yMin: -1.2, yMax: 1.2, yTicks: [0], yLabel: () => '', left: 14, title: t('c0b') });
  if (tt >= a.tS) { ctx.fillStyle = 'rgba(126,226,168,0.16)'; ctx.fillRect(P.x(a.tP), P.P.t, P.x(a.tS) - P.x(a.tP), P.P.b - P.P.t); }
  ctx.save(); ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
  if (tt >= a.tP) { ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(P.x(a.tP), P.P.t); ctx.lineTo(P.x(a.tP), P.P.b); ctx.stroke(); }
  if (tt >= a.tS) { ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(P.x(a.tS), P.P.t); ctx.lineTo(P.x(a.tS), P.P.b); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.3; ctx.beginPath();
  const n = Math.max(200, Math.round((P.P.r - P.P.l) * 2));
  for (let i = 0; i <= n; i++) { const q = tEnd * i / n; if (q > tt) break; const Y = P.y(M.seismo(d, q)); if (!i) ctx.moveTo(P.x(q), Y); else ctx.lineTo(P.x(q), Y); }
  ctx.stroke(); ctx.restore();
  const prog = tt < tEnd - 1e-6 ? t('s0prog', { t: fmt(tt, 1) }) : '';
  $('r0').textContent = t('s0readout', { d, tp: fmt(a.tP, 1), ts: fmt(a.tS, 1), sp: fmt(a.sp, 1), back: Math.round(Number(fmt(a.sp, 1)) * 8.4), prog });
}

/* ---------- step 1: three circles ---------- */
function draw1() {
  const ex = num('ex1'), ey = num('ey1'), dl = num('dl1'), L = M.locate(ex, ey, dl, 1);
  $('ex1v').textContent = String(ex); $('ey1v').textContent = String(ey); $('dl1v').textContent = fmt(dl, 1);
  const { ctx, W, H } = fitCanvas($('c1'));
  const top = 26, size = Math.min(W - 40, H - top - 24), k = size / 400, l = (W - size) / 2;
  const X = v => l + v * k, Y = v => top + size - v * k;
  ctx.save(); ctx.fillStyle = '#132131'; ctx.fillRect(l, top, size, size); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let v = 0; v <= 400; v += 100) { ctx.beginPath(); ctx.moveTo(X(v), top); ctx.lineTo(X(v), top + size); ctx.moveTo(l, Y(v)); ctx.lineTo(l + size, Y(v)); ctx.stroke(); ctx.fillText(String(v), X(v), top + size + 15); }
  ctx.beginPath(); ctx.rect(l, top, size, size); ctx.clip();
  const cols = [C.cyan, C.orange, C.green];
  M.STATIONS.forEach((s, i) => { ctx.strokeStyle = cols[i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), L.radii[i] * k, 0, 7); ctx.stroke(); });
  ctx.restore();
  disc(ctx, X(ex), Y(ey), 6, C.pink);
  cross(ctx, X(L.x), Y(L.y), 6);
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center';
  M.STATIONS.forEach((s, i) => { tri(ctx, X(s.x), Y(s.y), 8, cols[i]); ctx.fillStyle = cols[i]; ctx.fillText('ABC'[i], X(s.x), Y(s.y) - 12); });
  ctx.restore();
  title(ctx, t('c1a'), 8, top - 9, W - 16);
  $('r1').textContent = t('s1readout', { a: fmt(L.sp[0], 1), b: fmt(L.sp[1], 1), c: fmt(L.sp[2], 1), ra: Math.round(L.radii[0]), rb: Math.round(L.radii[1]), rc: Math.round(L.radii[2]), x: Math.round(L.x), y: Math.round(L.y), miss: fmt(L.miss, 1), rms: fmt(L.rms, 1) });
}

/* ---------- step 2: layered bending ---------- */
function draw2() {
  const i0 = num('i2'), r = M.layerRay(i0);
  $('i2v').textContent = i0 + '°';
  const { ctx, W, H } = fitCanvas($('c2'));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 200, yMin: -50, yMax: 5, xTicks: [0, 50, 100, 150, 200], yTicks: [0, -16, -32, -48], yLabel: v => String(-v), title: t('c2a') });
  let z = 0;
  M.LAYERS.forEach((Ly, kk) => { const shade = 0.12 + 0.11 * kk; ctx.fillStyle = `rgba(80,140,200,${shade})`; ctx.fillRect(P.P.l, P.y(-z), P.P.r - P.P.l, P.y(-(z + Ly.h)) - P.y(-z)); z += Ly.h; });
  ctx.save(); ctx.beginPath(); ctx.rect(P.P.l, P.P.t, P.P.r - P.P.l, P.P.b - P.P.t); ctx.clip();
  const draw = (rr, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); rr.path.forEach((q, i) => { const X = P.x(q.x), Y = P.y(-q.z); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); };
  for (let a = 15; a <= 75; a += 10) if (a !== i0) draw(M.layerRay(a), 'rgba(154,170,189,0.55)', 1.2);
  draw(r, C.orange, 2.6);
  ctx.restore();
  disc(ctx, P.x(0), P.y(0), 5, C.star);
  if (r.X !== null) tri(ctx, P.x(r.X), P.y(0) - 4, 7);
  const fate = r.turnLayer === null ? t('s2pass') : t('s2turn', { k: r.turnLayer + 1, v: fmt(M.LAYERS[r.turnLayer].v, 1), z: r.depth, x: fmt(r.X, 1) });
  $('r2').textContent = t('s2readout', { i: i0, q: fmt(r.q, 4), angles: r.angles.map(v => fmt(v, 1) + '°').join(' → '), fate });
}

/* ---------- step 3: P fan and shadow ---------- */
const MODES = { no: { noCore: true }, outer: { noInner: true }, full: {} };
const s3 = { mode: 'outer', cache: {} };
function modeData(m) {
  if (!s3.cache[m]) {
    const sh = M.shells('P', M.RCMB, MODES[m]), rays = [];
    for (let a = 2; a <= 88; a += 2) rays.push(M.rayTrace(sh, M.takeoffToP(sh, a)));
    s3.cache[m] = { sh, rays, gaps: M.gaps('P', M.RCMB, MODES[m]) };
  }
  return s3.cache[m];
}
function draw3() {
  const i0 = num('i3'), D = modeData(s3.mode), hi = M.rayTrace(D.sh, M.takeoffToP(D.sh, i0));
  $('i3v').textContent = fmt(i0, 1) + '°';
  ['no', 'outer', 'full'].forEach(m => $('mode' + m[0].toUpperCase() + m.slice(1)).setAttribute('aria-pressed', s3.mode === m));
  const { ctx, W, H } = fitCanvas($('c3'));
  const V = earthView(ctx, W, H, t('c3a'), s3.mode === 'no' ? 0.001 : M.RCMB);
  if (s3.mode === 'outer') { ctx.save(); ctx.fillStyle = '#5a4126'; ctx.beginPath(); ctx.arc(V.cx, V.cy, M.RCMB * V.k, 0, 7); ctx.fill(); ctx.restore(); }
  D.rays.forEach(r => rayPath(ctx, V, r, r.core ? C.green : C.cyan, 1, 0.75));
  D.gaps.forEach(g => surfaceArc(ctx, V, g[0], g[1], C.pink));
  rayPath(ctx, V, hi, C.orange, 2.6);
  sourceMark(ctx, V);
  let shadow;
  if (s3.mode === 'no') shadow = t('s3noShadow');
  else if (s3.mode === 'outer') shadow = t('s3shadow', { a: Math.round(D.gaps[0][0]), b: Math.round(D.gaps[0][1]) });
  else shadow = t('s3shadowWeak', { a: Math.round(D.gaps[0][0]), b: Math.round(D.gaps[0][1]), c: Math.round(modeData('outer').gaps[0][1]) });
  const turn = Math.min(...hi.path.map(q => q.r)), via = turn < 300 ? t('s3viaDeep') : hi.core ? t('s3viaCore') : t('s3viaMantle');
  const modeName = t(s3.mode === 'no' ? 'modeNo' : s3.mode === 'outer' ? 'modeOuter' : 'modeFull');
  $('r3').textContent = t('s3readout', { mode: modeName, shadow, i: fmt(i0, 1), d: fmt(hi.delta, 1), t: fmt(hi.time / 60, 1), z: Math.round(M.RE - turn), via });
}

/* ---------- step 4: S rays and travel times ---------- */
let F4 = null;
function data4() {
  if (!F4) {
    const FP = M.fan('P', M.RCMB, { n: 1500 }), FS = M.fan('S', M.RCMB, { n: 1500 }), shS = M.shells('S'), sRays = [];
    for (let a = 2; a <= 88; a += 2) sRays.push(M.rayTrace(shS, M.takeoffToP(shS, a)));
    F4 = { FP, FS, sRays };
  }
  return F4;
}
function draw4() {
  const d = num('st4'), D = data4(), arr = M.firstArrivals(d, D.FP, D.FS);
  $('st4v').textContent = d + '°';
  let { ctx, W, H } = fitCanvas($('c4'));
  const V = earthView(ctx, W, H, t('c4a'));
  D.sRays.forEach(r => { rayPath(ctx, V, r, C.orange, 1.1, 0.8); if (r.stopped) { const q = r.path[r.path.length - 1]; cross(ctx, V.X(q.r, q.phi), V.Y(q.r, q.phi), 2.5, C.pink); } });
  sourceMark(ctx, V);
  const ph = d * Math.PI / 180; ctx.save(); ctx.translate(V.X(M.RE + 250, ph), V.Y(M.RE + 250, ph)); ctx.rotate(ph); tri(ctx, 0, 0, 7); ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 180, yMin: 0, yMax: 30, xTicks: [0, 30, 60, 90, 120, 150, 180], yTicks: [0, 10, 20, 30], right: 16, title: t('c4b') });
  const dots = (F, core, col) => { ctx.fillStyle = col; F.rays.forEach(r => { if (r.stopped || r.core !== core || r.delta > 180) return; ctx.fillRect(P.x(r.delta) - 1, P.y(r.time / 60) - 1, 2, 2); }); };
  dots(D.FP, false, C.cyan); dots(D.FP, true, C.green); dots(D.FS, false, C.orange);
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(P.x(d), P.P.t); ctx.lineTo(P.x(d), P.P.b); ctx.stroke(); ctx.restore();
  if (arr.P) disc(ctx, P.x(d), P.y(arr.P / 60), 5, C.cyan);
  if (arr.PKP) disc(ctx, P.x(d), P.y(arr.PKP / 60), 5, C.green);
  if (arr.S) disc(ctx, P.x(d), P.y(arr.S / 60), 5, C.orange);
  const list = [];
  if (arr.P) list.push(t('s4arrP', { t: fmt(arr.P / 60, 2) }));
  if (arr.PKP) list.push(t('s4arrPKP', { t: fmt(arr.PKP / 60, 2) }));
  if (arr.S) list.push(t('s4arrS', { t: fmt(arr.S / 60, 2) }));
  if (arr.P && arr.S) list.push(t('s4sp', { t: fmt((arr.S - arr.P) / 60, 2) }));
  if (!arr.P && !arr.PKP) list.push(t('s4none'));
  if (!arr.S && (arr.P || arr.PKP)) list.push(t('s4noS'));
  $('r4').textContent = t('s4readout', { d, km: Math.round(d * Math.PI / 180 * M.RE), list: list.join(window.SEIS_I18N.getLang() === 'zh' ? '；' : '; ') });
}

/* ---------- step 5: inverting for the core radius ---------- */
let CURVE5 = null;
const OBS = () => M.shadowStart('P', M.OBSERVED_RC);
function draw5() {
  const rc = num('rc5'), start = M.shadowStart('P', rc), obs = OBS();
  if (!CURVE5) { CURVE5 = []; for (let r = 2500; r <= 4500; r += 100) CURVE5.push([r, M.shadowStart('P', r)]); }
  $('rc5v').textContent = String(rc);
  let { ctx, W, H } = fitCanvas($('c5'));
  const V = earthView(ctx, W, H, t('c5a'), rc), sh = M.shells('P', rc);
  for (let a = 3; a <= 45; a += 3) { const r = M.rayTrace(sh, M.takeoffToP(sh, a), rc); rayPath(ctx, V, r, r.core ? C.green : C.cyan, 1, 0.7); }
  // the ray that just grazes the core
  let lo = 0, hi = M.RE / sh[0].v; for (let k = 0; k < 50; k++) { const mid = (lo + hi) / 2, tr = M.rayTrace(sh, mid, rc); if (tr.core) lo = mid; else hi = mid; }
  rayPath(ctx, V, M.rayTrace(sh, hi, rc), C.orange, 2.4);
  surfaceArc(ctx, V, start, start + 1.2, C.orange);
  sourceMark(ctx, V);
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const P = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 2500, xMax: 4500, yMin: 60, yMax: 130, xTicks: [2500, 3000, 3500, 4000, 4500], yTicks: [60, 80, 100, 120], xLabel: v => String(v), right: 22, title: t('c5b') });
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(P.P.l, P.y(obs)); ctx.lineTo(P.P.r, P.y(obs)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath(); CURVE5.forEach(([r, s], i) => { if (!i) ctx.moveTo(P.x(r), P.y(s)); else ctx.lineTo(P.x(r), P.y(s)); }); ctx.stroke(); ctx.restore();
  disc(ctx, P.x(rc), P.y(start), 6, C.orange);
  const diff = start - obs, ad = Math.abs(diff);
  const dtxt = ad < 0.5 ? t('s5same', { x: fmt(ad, 1) }) : diff < 0 ? t('s5early', { x: fmt(ad, 1) }) : t('s5late', { x: fmt(ad, 1) });
  const verdict = ad < 0.5 ? t('s5match') : t('s5more', { dir: t(diff > 0 ? 's5bigger' : 's5smaller') });
  $('r5').textContent = t('s5readout', { rc, depth: M.RE - rc, d: fmt(start, 1), diff: dtxt, verdict });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('d0').addEventListener('input', () => { stopAnim('s0'); s0.t = null; draw0(); });
  $('play0').addEventListener('click', () => {
    const a = M.arrivals(num('d0')), tEnd = a.tS * 1.3 + 8;
    animate('s0', 4500, p => { s0.t = p * tEnd; draw0(); }, () => { s0.t = null; draw0(); });
  });
  ['ex1', 'ey1', 'dl1'].forEach(id => $(id).addEventListener('input', draw1));
  $('i2').addEventListener('input', draw2);
  $('i3').addEventListener('input', draw3);
  [['modeNo', 'no'], ['modeOuter', 'outer'], ['modeFull', 'full']].forEach(([id, m]) => $(id).addEventListener('click', () => { s3.mode = m; draw3(); }));
  $('st4').addEventListener('input', draw4);
  $('rc5').addEventListener('input', draw5);

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
  window.refreshSeismic = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
