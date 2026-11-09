'use strict';
// Frozen-bubble lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every number, crystal, trail and curve comes from window.FB_MODEL (model.js). Canvas text is limited to
// panel titles (own row), axis ticks and two bar labels in their own rows; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.FB_MODEL;
const t = (...a) => window.FB_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ice: '#e6f7ff', iceFill: 'rgba(170,225,255,0.16)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return (((s) => s.includes('.') ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s)(v.toFixed(d)) || '0').replace('-', '−'); };
const deg = v => (v > 0 ? '+' : '') + fmt(v) + ' °C';

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
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  const yf = o.yFmt || (v => fmt(v, 2));
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yf(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  if (o.xTicks !== false) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 28, o.xSteps || [1, 2, 5, 10, 20]);
    ctx.textAlign = 'center';
    for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function dot(ctx, X, Y, r, color, hollow) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function hline(ctx, m, v, color, dash = [6, 4]) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(v)); ctx.lineTo(m.P.r, m.y(v)); ctx.stroke(); ctx.restore();
}
function vline(ctx, m, v, color, dash = [6, 4]) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.x(v), m.P.t); ctx.lineTo(m.x(v), m.P.b); ctx.stroke(); ctx.restore();
}

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
function play(name, input, tMax, rate, draw) {
  if (running(name)) { stopAnim(name); draw(); return; }
  let t0 = Number($(input).value); if (t0 >= tMax - 1e-9) t0 = 0;
  animate(name, (tMax - t0) / rate * 1000, p => { $(input).value = (t0 + (tMax - t0) * p).toFixed(2); draw(); }, () => setTimeout(draw, 0));
  draw();
}

/* ---------- step 0: bubble vs air ---------- */
function draw0() {
  const D = num('D0'), h = num('h0'), b = M.bubble(D, h);
  $('D0v').textContent = D + ' cm'; $('h0v').textContent = fmt(h) + ' µm';
  const { ctx, W, H } = fitCanvas($('c0'));
  const split = Math.min(W * 0.42, 260), Rmax = Math.min(split / 2 - 16, (H - 50) / 2), R = Rmax * D / 12, cx = split / 2, cy = 30 + (H - 30) / 2;
  title(ctx, t('c0bubble'), 8, 18, split - 12);
  const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  g.addColorStop(0, '#b79cff'); g.addColorStop(0.35, '#67d7f9'); g.addColorStop(0.65, '#7ee2a8'); g.addColorStop(1, '#ffb454');
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.07)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
  ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.5, h * 1.6); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
  // bars (one row of text above each bar)
  const bx = split + 10, bw = W - bx - 14, scale = Math.max(b.airMass, b.filmMass);
  const rows = [{ label: t('c0film') + ' · ' + fmt(b.filmMass, 3) + ' g', v: b.filmMass, c: C.orange }, { label: t('c0air') + ' · ' + fmt(b.airMass, 3) + ' g', v: b.airMass, c: C.cyan }];
  rows.forEach((r, i) => {
    const Y = 50 + i * ((H - 60) / 2);
    title(ctx, r.label, bx, Y, bw, C.muted);
    ctx.fillStyle = C.grid; ctx.fillRect(bx, Y + 10, bw, 22);
    ctx.fillStyle = r.c; ctx.fillRect(bx, Y + 10, Math.max(2, bw * r.v / scale), 22);
  });
  $('r0').textContent = t('s0readout', { D, h: fmt(h), mf: fmt(b.filmMass, 3), ma: fmt(b.airMass, 3), r: fmt(b.ratio, 1), hr: fmt(b.hairRatio, 0), drops: fmt(b.filmMass / M.K.drop, 1) });
}

/* ---------- steps 1–2: crystals in a patch ---------- */
function patchGeom(W, H, top) { const R = Math.min(W / 2 - 14, (H - top - 12) / 2); return { cx: W / 2, cy: top + R + 4, R }; }
function drawPatch(ctx, g, seeds, tt, dT) {
  const { cx, cy, R } = g, P = (x, y) => [cx + x * R, cy - y * R];
  ctx.save();
  const bgr = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  bgr.addColorStop(0, 'rgba(183,156,255,0.20)'); bgr.addColorStop(0.6, 'rgba(103,215,249,0.12)'); bgr.addColorStop(1, 'rgba(126,226,168,0.10)');
  ctx.fillStyle = bgr; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
  const live = seeds.filter(s => s.born <= tt + 1e-9);
  // reached region = union of hexagons (same winding → nonzero fill gives the union)
  ctx.fillStyle = C.iceFill; ctx.beginPath();
  live.forEach(s => { const L = M.armLen(s, tt, dT); if (L <= 0) return; for (let k = 0; k <= 6; k++) { const a = s.th + k * Math.PI / 3, [X, Y] = P(s.x + L * Math.cos(a), s.y + L * Math.sin(a)); if (!k) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.closePath(); });
  ctx.fill('nonzero');
  const gap = M.branchGap(dT);
  ctx.strokeStyle = C.ice; ctx.lineCap = 'round';
  live.forEach(s => {
    const i = seeds.indexOf(s);
    for (let k = 0; k < 6; k++) {
      const a = s.th + k * Math.PI / 3, reach = M.armReach(i, a, seeds, tt, dT);
      if (reach <= 0) continue;
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(...P(s.x, s.y)); ctx.lineTo(...P(s.x + reach * Math.cos(a), s.y + reach * Math.sin(a))); ctx.stroke();
      ctx.lineWidth = 1.1;
      for (let d = gap; d < reach; d += gap) {
        const len = 0.35 * (reach - d), bx = s.x + d * Math.cos(a), by = s.y + d * Math.sin(a);
        for (const side of [-1, 1]) { const b = a + side * Math.PI / 3; ctx.beginPath(); ctx.moveTo(...P(bx, by)); ctx.lineTo(...P(bx + len * Math.cos(b), by + len * Math.sin(b))); ctx.stroke(); }
      }
    }
  });
  ctx.restore();
  live.forEach(s => dot(ctx, ...P(s.x, s.y), 3.5, dT > 0 ? '#ffffff' : C.pink));
}

const s1 = { seeds: [], cache: null };
function covCurve(seeds, dT) {
  const key = JSON.stringify(seeds) + '|' + dT;
  if (!s1.cache || s1.cache.key !== key) { const pts = []; for (let i = 0; i <= 60; i++) pts.push(M.coverage(seeds, i * 0.5, dT)); s1.cache = { key, pts }; }
  return s1.cache.pts;
}
function draw1() {
  const T = num('T1'), tt = num('t1'), dT = M.undercool(T);
  $('T1v').textContent = deg(T); $('t1v').textContent = tt.toFixed(1) + ' s';
  $('grow1').textContent = running('s1') ? t('pause') : t('grow');
  $('seed1').disabled = s1.seeds.length >= M.MAX_SEEDS || tt >= M.T_END - 1e-9;
  let { ctx, W, H } = fitCanvas($('c1a'));
  title(ctx, t('c1a'), 8, 18, W - 16);
  const g = patchGeom(W, H, 28); s1.geom = { ...g, W };
  drawPatch(ctx, g, s1.seeds, tt, dT);
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 30, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xSteps: [5, 10], title: t('c1b') });
  const pts = covCurve(s1.seeds, dT);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4; ctx.beginPath();
  const last = Math.floor(tt / 0.5 + 1e-9);
  for (let i = 0; i <= last; i++) { const X = m.x(i * 0.5), Y = m.y(pts[i] * 100); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  const covNow = M.coverage(s1.seeds, tt, dT);
  ctx.lineTo(m.x(tt), m.y(covNow * 100)); ctx.stroke(); ctx.restore();
  dot(ctx, m.x(tt), m.y(covNow * 100), 5, C.cyan);
  const note = dT <= 0 ? t('s1noteWarm') : !s1.seeds.length ? t('s1noteNone') : tt >= M.T_END - 1e-9 ? t('s1noteEnd') : s1.seeds.length > 1 ? t('s1noteGrow') : t('s1noteFull');
  $('r1').textContent = t('s1readout', { T: fmt(T), dT: fmt(dT), n: s1.seeds.length, max: M.MAX_SEEDS, t: tt.toFixed(1), cov: fmt(covNow * 100, 0), note });
}
function addSeed(x, y) {
  const tt = num('t1');
  if (s1.seeds.length >= M.MAX_SEEDS || tt >= M.T_END - 1e-9) return;
  s1.seeds.push(M.makeSeed(s1.seeds.length, tt, x, y)); draw1();
}

function draw2() {
  const TA = num('TA'), TB = num('TB'), tt = num('t2'), dA = M.undercool(TA), dB = M.undercool(TB);
  $('TAv').textContent = deg(TA); $('TBv').textContent = deg(TB); $('t2v').textContent = tt.toFixed(1) + ' s';
  $('grow2').textContent = running('s2') ? t('pause') : t('grow');
  const seed = [M.makeSeed(0, 0)];
  [['c2a', 'c2aT', TA, dA], ['c2b', 'c2bT', TB, dB]].forEach(([id, key, T, dT]) => {
    const { ctx, W, H } = fitCanvas($(id));
    title(ctx, t(key, { T: fmt(T), dT: fmt(dT) }), 8, 18, W - 16);
    drawPatch(ctx, patchGeom(W, H, 28), seed, tt, dT);
  });
  const la = M.armLen(seed[0], tt, dA), lb = M.armLen(seed[0], tt, dB);
  let cmp = '';
  if (dA <= 0 || dB <= 0) cmp = t('s2zero');
  else if (Math.abs(dA - dB) < 1e-9) cmp = t('s2same');
  else if (tt > 0) cmp = dA > dB ? t('s2cmp', { d: fmt(dA - dB), r: fmt(la / lb, 2), da: fmt(dA), db: fmt(dB) }) : t('s2cmpB', { d: fmt(dB - dA), r: fmt(lb / la, 2), da: fmt(dB), db: fmt(dA) });
  $('r2').textContent = t('s2readout', { t: tt.toFixed(1), la: fmt(la, 3), lb: fmt(lb, 3), cmp });
}

/* ---------- step 3: latent heat budget ---------- */
function draw3() {
  const T = num('T3'), f = num('f3') / 100, dT = M.undercool(T), Tf = M.filmTemp(T, f), fs = M.fStall(dT);
  $('T3v').textContent = deg(T); $('f3v').textContent = fmt(f * 100) + '%';
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 40, yMin: -26, yMax: 0, yTicks: [-25, -20, -15, -10, -5, 0], xSteps: [5, 10], title: t('c3T'), yFmt: v => fmt(v) });
  hline(ctx, m, M.K.Tm, C.pink); hline(ctx, m, T, C.muted, [3, 4]);
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.6; ctx.beginPath();
  for (let i = 0; i <= 400; i++) { const ff = 0.4 * i / 400, X = m.x(ff * 100), Y = m.y(M.filmTemp(T, ff)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  if (dT > 0 && fs <= 0.4) { ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(m.x(fs * 100), m.y(M.K.Tm)); ctx.lineTo(m.x(fs * 100), m.P.b); ctx.stroke(); ctx.restore(); }
  dot(ctx, m.x(f * 100), m.y(Tf), 6, C.pink);
  $('r3').textContent = t('s3readout', { T: fmt(T), dT: fmt(dT), f: fmt(f * 100), Tf: fmt(Tf, 1), fs: fmt(fs * 100, 1) });
  const D = num('D0'), h = num('h0'), hb = M.heatBudget(D, h, T);
  $('r3b').textContent = dT > 0 ? t('s3heat', { D, h: fmt(h), m: fmt(hb.m, 3), fs: fmt(hb.fs * 100, 1), q1: fmt(hb.qFree, 2), Tm: fmt(M.K.Tm), q2: fmt(hb.qRest, 2) }) : t('s3warm');
  $('s3hint').textContent = t('s3hint', { fsCold: fmt(M.fStall(M.undercool(-25)) * 100, 0) });
}

/* ---------- step 4: Marangoni drift ---------- */
function draw4() {
  const x0 = num('x4'), dTw = num('d4'), tt = num('t4'), Tb = M.STRIP_BASE;
  $('x4v').textContent = fmt(x0, 2); $('d4v').textContent = fmt(dTw) + ' °C'; $('t4v').textContent = tt.toFixed(1) + ' s';
  $('play4').textContent = running('s4') ? t('pause') : t('grow');
  const { ctx, W, H } = fitCanvas($('c4'));
  const opt = { xMin: -1, xMax: 1, xTicks: false, left: 44 };
  const A = panel(ctx, W, { ...opt, top: 30, bottom: 116, yMin: Tb - 0.5, yMax: Tb + 5.5, yTicks: [Tb, Tb + 2.5, Tb + 5], yFmt: v => fmt(v), title: t('c4T') });
  const fx = (m, f) => { ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = -1 + 2 * i / 200, X = m.x(x), Y = m.y(f(x)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke(); };
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.4; fx(A, x => M.stripT(x, x0, dTw, Tb)); ctx.restore();
  const g0 = M.gamma(Tb), g1 = M.gamma(Tb + dTw);
  const B = panel(ctx, W, { ...opt, top: 158, bottom: 244, yMin: M.gamma(Tb + 5.5), yMax: M.gamma(Tb - 0.5), yTicks: [M.gamma(Tb + 5), M.gamma(Tb + 2.5), M.gamma(Tb)], yFmt: v => fmt(v, 2), title: t('c4G') });
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.4; fx(B, x => M.gamma(M.stripT(x, x0, dTw, Tb))); ctx.restore();
  // strip
  const top = 290, bot = H - 22, L = 44, R = W - 12, X = x => L + (x + 1) / 2 * (R - L);
  title(ctx, t('c4S'), 8, top - 9, W - 16);
  ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(L, top, R - L, bot - top);
  ctx.strokeStyle = C.axis; ctx.strokeRect(L, top, R - L, bot - top);
  // warm spot glow
  if (dTw > 0) { const gr = ctx.createRadialGradient(X(x0), (top + bot) / 2, 2, X(x0), (top + bot) / 2, (R - L) * M.WARM_W / 2 * 2); gr.addColorStop(0, `rgba(255,122,147,${0.08 * dTw})`); gr.addColorStop(1, 'rgba(255,122,147,0)'); ctx.fillStyle = gr; ctx.fillRect(L, top, R - L, bot - top); }
  // flow arrows along the top edge of the strip
  const umax = Math.abs(M.MU * M.K.dGamma * 5 / M.WARM_W * Math.exp(-0.5)) || 1;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.fillStyle = C.orange; ctx.lineWidth = 2;
  for (let i = 0; i < 13; i++) {
    const x = -0.9 + i * 0.15, u = M.flowU(x, x0, dTw), len = 26 * Math.abs(u) / umax; if (len < 2) continue;
    const s = Math.sign(u), Y = top + 12, X0 = X(x) - s * len / 2, X1 = X(x) + s * len / 2;
    ctx.beginPath(); ctx.moveTo(X0, Y); ctx.lineTo(X1, Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X1, Y); ctx.lineTo(X1 - s * 6, Y - 4); ctx.lineTo(X1 - s * 6, Y + 4); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // crystals with trails (positions from the model)
  let moved = 0, far = 0;
  M.CRYSTALS.forEach((x00, i) => {
    const Y = top + 28 + (i % 3) * ((bot - top - 36) / 2);
    const steps = Math.max(1, Math.round(tt / 0.1));
    ctx.save(); ctx.strokeStyle = 'rgba(230,247,255,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(x00), Y);
    for (let k = 1; k <= steps; k++) ctx.lineTo(X(M.advect(x00, x0, dTw, tt * k / steps)), Y);
    ctx.stroke(); ctx.restore();
    const xn = M.advect(x00, x0, dTw, tt), d = Math.abs(xn - x00);
    if (d > 0.02) moved++; far = Math.max(far, d);
    dot(ctx, X(x00), Y, 2.5, C.muted); dot(ctx, X(xn), Y, 5, C.ice);
  });
  $('r4').textContent = dTw === 0 ? t('s4calm') : t('s4readout', { d: fmt(dTw), g1: fmt(g1, 2), g0: fmt(g0, 2), dg: fmt(g0 - g1, 2), t: tt.toFixed(1), moved, far: fmt(far, 2) });
}

/* ---------- step 5: where the front stops ---------- */
const s5 = { tried: new Set() };
function draw5() {
  const T = num('T5'), z = M.frontStop(T);
  s5.tried.add(T);
  $('T5v').textContent = deg(T);
  let { ctx, W, H } = fitCanvas($('c5a'));
  title(ctx, t('c5a', { base: M.BASE_T }), 8, 18, W - 16);
  const baseY = H - 34, R = Math.min(W / 2 - 24, baseY - 44), cx = W / 2;
  ctx.fillStyle = '#3d5d7a'; ctx.fillRect(cx - R - 18, baseY, 2 * R + 36, 14);
  ctx.save(); ctx.beginPath(); ctx.arc(cx, baseY, R, Math.PI, 2 * Math.PI); ctx.closePath(); ctx.fillStyle = 'rgba(103,215,249,0.06)'; ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(cx - R, baseY - R, cx + R, baseY);
  g.addColorStop(0, '#b79cff'); g.addColorStop(0.5, '#67d7f9'); g.addColorStop(1, '#ffb454');
  ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, baseY, R, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.restore();
  const yFront = baseY - z * R;
  ctx.save(); ctx.beginPath(); ctx.rect(0, yFront, W, baseY - yFront); ctx.clip();
  ctx.fillStyle = 'rgba(170,225,255,0.18)'; ctx.beginPath(); ctx.arc(cx, baseY, R, Math.PI, 2 * Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ice; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, baseY, R, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.restore();
  if (z < 1) { const hw = Math.sqrt(Math.max(0, R * R - (z * R) * (z * R))); ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - hw, yFront); ctx.lineTo(cx + hw, yFront); ctx.stroke(); ctx.restore(); }
  ({ ctx, W, H } = fitCanvas($('c5b')));
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: -26, xMax: 26, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], xSteps: [5, 10, 20], minPx: 30, title: t('c5b') });
  vline(ctx, m, M.K.Tm, C.pink);
  const prof = (TT, color, lw) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const zz = i / 100, X = m.x(M.profileT(zz, TT)), Y = m.y(zz); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke(); ctx.restore(); };
  [...s5.tried].forEach(TT => { if (TT !== T) { prof(TT, 'rgba(154,170,189,0.35)', 1.2); const zz = M.frontStop(TT); if (zz < 1) dot(ctx, m.x(M.K.Tm), m.y(zz), 2.5, C.muted); } });
  prof(T, C.cyan, 2.6);
  if (z < 1) dot(ctx, m.x(M.K.Tm), m.y(z), 6, C.pink);
  $('r5').textContent = t('s5readout', { T: fmt(T), state: z >= 1 ? t('s5full') : t('s5stop', { z: fmt(z * 100, 0) }) });
  $('s5e').innerHTML = t('s5e', { base: M.BASE_T });
  $('s5scope').textContent = t('s5scope', { lam: M.LAMBDA, base: M.BASE_T });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['D0', 'h0'].forEach(id => $(id).addEventListener('input', () => { draw0(); draw3(); }));
  $('T1').addEventListener('input', draw1);
  $('t1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('seed1').addEventListener('click', () => { const k = s1.seeds.length; addSeed(M.SEED_SLOTS[k][0], M.SEED_SLOTS[k][1]); });
  $('c1a').addEventListener('click', e => {
    const g = s1.geom; if (!g) return; const r = $('c1a').getBoundingClientRect();
    const x = (e.clientX - r.left - g.cx) / g.R, y = -(e.clientY - r.top - g.cy) / g.R;
    if (x * x + y * y <= 0.92) addSeed(x, y);
  });
  $('grow1').addEventListener('click', () => play('s1', 't1', M.T_END, 3, draw1));
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.seeds = []; $('t1').value = 0; draw1(); });
  ['TA', 'TB'].forEach(id => $(id).addEventListener('input', draw2));
  $('t2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('grow2').addEventListener('click', () => play('s2', 't2', M.T_END, 3, draw2));
  ['T3', 'f3'].forEach(id => $(id).addEventListener('input', draw3));
  ['x4', 'd4'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s4'); draw4(); }));
  $('t4').addEventListener('input', () => { stopAnim('s4'); draw4(); });
  $('play4').addEventListener('click', () => play('s4', 't4', M.FLOW_T, 1.2, draw4));
  $('T5').addEventListener('input', draw5);
  $('cold5').addEventListener('click', () => { $('T5').value = -18; draw5(); });
  $('warm5').addEventListener('click', () => { $('T5').value = 25; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) Object.keys(anims).forEach(stopAnim); });
  window.refreshBubble = refresh;
  // start with one seed in the middle so the first view is not empty
  s1.seeds = [M.makeSeed(0, 0)]; $('t1').value = 12;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
