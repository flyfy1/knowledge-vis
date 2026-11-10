'use strict';
// Special relativity lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every line, tick and readout comes from window.SR_MODEL (model.js). Spacetime diagrams keep x and ct on the
// same scale so light always runs at 45°. Canvas text is limited to panel titles, axis ticks and the event labels A/B.
(function () {

const $ = id => document.getElementById(id);
const M = window.SR_MODEL;
const t = (...a) => window.SR_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', yellow: '#ffe27a', muted: '#9aaabd', grid: '#22303f', grid2: '#2b3a4d', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);

/* ---------- number formatting ---------- */
// Trim trailing zeros only when there is a decimal point (toFixed(0) of 90 stays 90).
const trim = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return trim(v.toFixed(d)); };
const fix = (v, d = 2) => (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d);
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = n => String(n).split('').map(ch => SUP[ch] || ch).join('');
function small(v) {   // probabilities: plain down to 0.001, then m × 10ⁿ
  if (v >= 1e-3) return trim(v.toPrecision(3));
  let e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e);
  if (Number(m.toFixed(1)) >= 10) { m /= 10; e += 1; }
  return `${m.toFixed(1)} × 10${sup(e)}`;
}

/* ---------- canvas helpers ---------- */
function fitCanvas(canvas, hOverride) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) canvas.dataset.h = canvas.getAttribute('height') || 300;
  const height = Math.round(hOverride || Number(canvas.dataset.h));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel. opts: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks, yFmt, xTicks, xSteps, xFmt, title
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 44, o.xSteps || [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10]);
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
function clipTo(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
function poly(ctx, m, pts, color, lw = 2, dash = null, alpha = 1) {
  clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(m.x(a), m.y(b)) : ctx.moveTo(m.x(a), m.y(b)))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, hollow = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }
function label(ctx, text, X, Y, color = C.text, align = 'left') { ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore(); }
const linspace = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));

// Spacetime frame with equal scales on x and ct: returns mapping plus the pixel box.
function spacetime(ctx, W, o) {
  const P = { l: o.ox, r: o.ox + (o.xMax - o.xMin) * o.s, t: o.top, b: o.top + (o.tMax - o.tMin) * o.s };
  const x = v => P.l + (v - o.xMin) * o.s, y = v => P.b - (v - o.tMin) * o.s;
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const step = o.s >= 22 ? 1 : 2;
  for (let v = Math.ceil(o.xMin); v <= o.xMax; v++) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); if (v % step === 0) { ctx.textAlign = 'center'; ctx.fillText(String(v), x(v), P.b + 15); } }
  for (let v = Math.ceil(o.tMin); v <= o.tMax; v++) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); if (v % step === 0) { ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); } }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}

/* ---------- animation runner (respects hidden pages) ---------- */
const anims = {};
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function loop(name, frame) {
  stopAnim(name); let last = performance.now();
  const tick = now => { const dt = Math.min(0.1, (now - last) / 1000); last = now; if (frame(dt) === false) { delete anims[name]; return; } anims[name] = { id: requestAnimationFrame(tick) }; };
  anims[name] = { id: requestAnimationFrame(tick) };
}

/* ---------- step 0: light clock ---------- */
const s0 = { tau: 0, running: false };      // tau: ground time in ns
const SEC_PER_NS = 1.8;                      // animation: 1 ns of ground time = 1.8 s on screen
function tri(u, period) { const p = ((u / period) % 1 + 1) % 1; return p < 0.5 ? 2 * p : 2 - 2 * p; }
function draw0() {
  const b = num('b0'), lc = M.lightClock(b), g = lc.gamma, tau = s0.tau;
  $('b0v').textContent = fix(b);
  const { ctx, W, H } = fitCanvas($('c0'));
  const G = 82, lanes = [{ top: 40, title: t('c0a') }, { top: 40 + (H - 40) / 2 + 6, title: t('c0b') }];
  lanes.forEach(L => { title(ctx, L.title, 8, L.top - 12, W - 16); ctx.save(); ctx.strokeStyle = C.grid; ctx.strokeRect(6.5, L.top - 4.5, W - 13, G + 22); ctx.restore(); });
  const mirror = (X, top) => { ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X - 20, top + 4); ctx.lineTo(X + 20, top + 4); ctx.moveTo(X - 20, top + 8 + G); ctx.lineTo(X + 20, top + 8 + G); ctx.stroke(); ctx.restore(); };
  const yOf = (top, u, period) => top + 8 + G - G * tri(u, period);
  // resting clock
  const xa = 48, ta = lanes[0].top; mirror(xa, ta);
  ctx.save(); ctx.strokeStyle = C.xs; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xa, ta + 8); ctx.lineTo(xa, ta + 8 + G); ctx.stroke(); ctx.restore();
  dot(ctx, xa, yOf(ta, tau, 1), 5, C.xs);
  // moving clock: drifts right at 2Gβ px per ns, wraps around the lane
  const tb = lanes[1].top, x0 = 48, span = W - 48 - x0, cpx = 2 * G, vx = cpx * b;
  const dist = vx * tau, k = vx > 0 ? Math.floor(dist / span) : 0, uStart = vx > 0 ? k * span / vx : 0;
  const xAt = u => x0 + vx * u - k * span;
  const pts = [uStart];
  for (let m = Math.ceil(uStart / (g / 2)); m * g / 2 < tau; m++) if (m * g / 2 > uStart) pts.push(m * g / 2);
  pts.push(tau);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.85; ctx.beginPath();
  pts.forEach((u, i) => { const X = xAt(u), Y = yOf(tb, u, g); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
  mirror(xAt(tau), tb);
  dot(ctx, xAt(tau), yOf(tb, tau, g), 5, C.cyan);
  const n0 = Math.floor(tau + 1e-9), n1 = Math.floor(tau / g + 1e-9);
  $('r0').textContent = t('s0readout', { b: fix(b), g: fix(g, 3), t0: fix(lc.rest * 1e9, 2), t1: fix(lc.moving * 1e9, 3), drift: fix(lc.drift * 100, 1), diag: fix(lc.diag * 100, 1), n0, n1, ratio: n1 ? fix(n0 / n1, 2) : '—' });
  $('play0').textContent = t(s0.running ? 'pause' : 'play');
}
function play0() {
  if (s0.running) { s0.running = false; stopAnim('s0'); draw0(); return; }
  if (reduceMotion()) { s0.tau += 10; draw0(); return; }
  s0.running = true;
  loop('s0', dt => { s0.tau += dt / SEC_PER_NS; draw0(); return s0.running; });
  draw0();
}

/* ---------- step 1: spacetime diagram and Lorentz transformation ---------- */
const X1 = [-4.5, 4.5], T1 = [-0.5, 5];
function draw1() {
  const b = num('b1'), xB = num('x1'), tB = num('t1'), g = M.gamma(b);
  $('b1v').textContent = fix(b); $('x1v').textContent = fix(xB); $('t1v').textContent = fix(tB);
  const c = $('c1'), Wc = Math.max(240, c.clientWidth || 600);
  const s = Math.min((Wc - 56) / (X1[1] - X1[0]), 64), H = Math.round(s * (T1[1] - T1[0]) + 58);
  const { ctx, W } = fitCanvas(c, H);
  const ox = Math.max(36, (W - s * (X1[1] - X1[0])) / 2);
  const m = spacetime(ctx, W, { ox, top: 32, s, xMin: X1[0], xMax: X1[1], tMin: T1[0], tMax: T1[1], title: t('c1') });
  const box = { P: m.P, x: m.x, y: m.y };
  // moving observer's grid (x′ = k, ct′ = k) and axes
  const far = 12;
  for (let k = -8; k <= 8; k++) {
    const a1 = M.inverse(k, -far, b), a2 = M.inverse(k, far, b), c1 = M.inverse(-far, k, b), c2 = M.inverse(far, k, b);
    poly(ctx, box, [[a1.x, a1.ct], [a2.x, a2.ct]], C.cyan, k === 0 ? 2.2 : 1, null, k === 0 ? 1 : 0.22);
    poly(ctx, box, [[c1.x, c1.ct], [c2.x, c2.ct]], C.cyan, k === 0 ? 2.2 : 1, null, k === 0 ? 1 : 0.22);
  }
  // light lines
  poly(ctx, box, [[-6, -6], [6, 6]], C.yellow, 1.6, [6, 4]); poly(ctx, box, [[6, -6], [-6, 6]], C.yellow, 1.6, [6, 4]);
  // invariant hyperbola through B
  const s2 = M.interval(xB, tB);
  if (Math.abs(s2) > 1e-9) {
    const pts = s2 > 0 ? linspace(-6, 6, 300).map(x => [x, Math.sqrt(s2 + x * x)]) : linspace(-6, 6, 300).map(ct => [Math.sign(xB) * Math.sqrt(-s2 + ct * ct), ct]);
    poly(ctx, box, pts, C.text, 1.4, [2, 3], 0.8);
  }
  // read-off lines from B parallel to the moving axes
  const P = M.lorentz(xB, tB, b), onX = M.inverse(P.x, 0, b), onT = M.inverse(0, P.ct, b);
  poly(ctx, box, [[xB, tB], [onX.x, onX.ct]], C.cyan, 1.2, [3, 3], 0.9);
  poly(ctx, box, [[xB, tB], [onT.x, onT.ct]], C.cyan, 1.2, [3, 3], 0.9);
  dot(ctx, m.x(xB), m.y(tB), 6, C.orange);
  const kind = M.kind(s2) === 'time' ? t('kindTime') : M.kind(s2) === 'space' ? t('kindSpace') : t('kindLight');
  $('r1').textContent = t('s1readout', { x: fix(xB), ct: fix(tB), b: fix(b), g: fix(g, 3), xp: fix(P.x, 3), ctp: fix(P.ct, 3), s1: fix(s2, 3), s2: fix(M.interval(P.x, P.ct), 3), kind });
}

/* ---------- step 2: simultaneity in a train car ---------- */
const X2 = [-3, 7], T2 = [0, 6.5], L2 = 4;
const s2 = { running: false };
function draw2() {
  const b = num('b2'), tg = num('t2'), f = M.carFlash(b, L2);
  $('b2v').textContent = fix(b); $('t2v').textContent = fix(tg) + ' s';
  const c = $('c2'), Wc = Math.max(240, c.clientWidth || 600);
  const s = Math.min((Wc - 56) / (X2[1] - X2[0]), 54), strip = 64, H = Math.round(s * (T2[1] - T2[0]) + strip + 92);
  const { ctx, W } = fitCanvas(c, H);
  const ox = Math.max(36, (W - s * (X2[1] - X2[0])) / 2);
  // strip: the car at ground time t
  const sx = v => ox + (v - X2[0]) * s, sy = 46;
  title(ctx, t('c2strip'), 8, 20, W - 16);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(sx(X2[0]), sy + 18); ctx.lineTo(sx(X2[1]), sy + 18); ctx.stroke();
  ctx.fillStyle = 'rgba(103,215,249,0.16)'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5;
  const r = f.rear(tg), fr = f.front(tg); ctx.fillRect(sx(r), sy - 12, sx(fr) - sx(r), 26); ctx.strokeRect(sx(r), sy - 12, sx(fr) - sx(r), 26); ctx.restore();
  dot(ctx, sx(f.lamp(tg)), sy + 1, 4, C.yellow);
  const lx = tg < f.A.ct ? -tg : f.A.x, rx = tg < f.B.ct ? tg : f.B.x;
  dot(ctx, sx(lx), sy + 1, tg >= f.A.ct ? 7 : 4.5, C.yellow, tg >= f.A.ct); dot(ctx, sx(rx), sy + 1, tg >= f.B.ct ? 7 : 4.5, C.yellow, tg >= f.B.ct);
  // spacetime diagram
  const m = spacetime(ctx, W, { ox, top: strip + 50, s, xMin: X2[0], xMax: X2[1], tMin: T2[0], tMax: T2[1], title: t('c2') });
  poly(ctx, m, [[f.rear(0), 0], [f.rear(T2[1]), T2[1]]], C.cyan, 2.2);
  poly(ctx, m, [[f.front(0), 0], [f.front(T2[1]), T2[1]]], C.cyan, 2.2);
  poly(ctx, m, [[0, 0], [f.lamp(T2[1]), T2[1]]], C.cyan, 1, [2, 3], 0.6);
  poly(ctx, m, [[0, 0], [-Math.min(tg, f.A.ct), Math.min(tg, f.A.ct)]], C.yellow, 2, [6, 4]);
  poly(ctx, m, [[0, 0], [Math.min(tg, f.B.ct), Math.min(tg, f.B.ct)]], C.yellow, 2, [6, 4]);
  // passengers' "same moment" through A and B; the ground's "now"
  const slope = b, at = x => f.A.ct + slope * (x - f.A.x);
  poly(ctx, m, [[X2[0], at(X2[0])], [X2[1], at(X2[1])]], C.cyan, 1.6, [6, 4], 0.95);
  poly(ctx, m, [[X2[0], tg], [X2[1], tg]], C.muted, 1.2, [2, 3], 0.8);
  dot(ctx, m.x(f.A.x), m.y(f.A.ct), 5.5, C.orange, tg < f.A.ct); dot(ctx, m.x(f.B.x), m.y(f.B.ct), 5.5, C.orange, tg < f.B.ct);
  label(ctx, 'A', m.x(f.A.x) - 10, m.y(f.A.ct) - 8, C.orange, 'right'); label(ctx, 'B', m.x(f.B.x) + 10, m.y(f.B.ct) + 4, C.orange, 'left');
  const status = tg < f.A.ct ? t('stBoth') : tg < f.B.ct - 1e-9 ? t('stRear') : t('stDone');
  $('r2').textContent = t('s2readout', { b: fix(b), g: fix(f.gamma, 3), Lg: fix(2 * f.half, 3), tA: fix(f.A.ct, 3), tB: fix(f.B.ct, 3), dt: fix(f.dt, 3), tp: fix(f.Ap.ct, 3), t: fix(tg), status });
  $('play2').textContent = t(s2.running ? 'pause' : 'play');
}
function play2() {
  if (s2.running) { s2.running = false; stopAnim('s2'); draw2(); return; }
  if (reduceMotion()) { $('t2').value = T2[1]; draw2(); return; }
  if (num('t2') >= T2[1] - 1e-9) $('t2').value = 0;
  s2.running = true;
  loop('s2', dt => { const v = Math.min(T2[1], num('t2') + dt * 1.2); $('t2').value = v; if (v >= T2[1]) s2.running = false; draw2(); return s2.running; });
  draw2();
}

/* ---------- step 3: muons ---------- */
function draw3() {
  const b = num('b3'), q = M.muon(b);
  $('b3v').textContent = b.toFixed(4);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = panel(ctx, W, { top: 32, bottom: 230, xMin: 0, xMax: 15, yMin: 0, yMax: 1, yTicks: [0, 0.25, 0.5, 0.75, 1], xTicks: true, xSteps: [1, 2.5, 5], title: t('c3') });
  const zs = linspace(0, 15, 300);
  poly(ctx, m, zs.map(z => [z, q.survivalAt(z * 1000, false)]), C.orange, 2, [6, 4]);
  poly(ctx, m, zs.map(z => [z, q.survivalAt(z * 1000, true)]), C.cyan, 2.4);
  dot(ctx, m.x(15), m.y(q.relGround), 5, C.cyan);
  // two views of the atmosphere, drawn to the same km scale as the plot
  const bar = (top, ttl, km) => {
    title(ctx, ttl, 8, top - 8, W - 16);
    ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.25)'; ctx.strokeStyle = 'rgba(103,215,249,0.6)';
    const w = Math.max(2, m.x(km) - m.x(0)); ctx.fillRect(m.x(0), top, w, 18); ctx.strokeRect(m.x(0) + 0.5, top + 0.5, w - 1, 17); ctx.restore();
  };
  bar(H - 108, t('c3g'), 15);
  bar(H - 40, t('c3m', { h: fix(q.hMuon / 1000, 2) }), q.hMuon / 1000);
  $('r3').textContent = t('s3readout', { b: b.toFixed(4), g: fix(q.gamma, 2), tg: fix(q.tGround * 1e6, 2), tm: fix(q.tMuon * 1e6, 3), pc: small(q.classical), gt: fix(q.gamma * M.MUON.tau * 1e6, 1), pg: small(q.relGround), hm: fix(q.hMuon / 1000, 2), pm: small(q.relMuon) });
}

/* ---------- step 4: twins ---------- */
const s4 = { p: 1, running: false };
function draw4() {
  const b = num('b4'), D = num('d4'), tw = M.twins(b, D), g = tw.gamma, T = tw.tEarth;
  $('b4v').textContent = fix(b); $('d4v').textContent = fix(D, 1);
  const c = $('c4'), Wc = Math.max(240, c.clientWidth || 600);
  const xr = [-0.6, D + 0.6], tr = [0, T + 0.4];
  const s = Math.min((Wc - 60) / (xr[1] - xr[0]), 380 / (tr[1] - tr[0]), 60), H = Math.round(s * (tr[1] - tr[0]) + 40 + 110);
  const { ctx, W } = fitCanvas(c, H);
  const ox = Math.max(36, (W - s * (xr[1] - xr[0])) / 2);
  const m = spacetime(ctx, W, { ox, top: 32, s, xMin: xr[0], xMax: xr[1], tMin: tr[0], tMax: tr[1], title: t('c4') });
  const tNow = s4.p * T;
  poly(ctx, m, [[0, 0], [tr[1], tr[1]]], C.yellow, 1.2, [6, 4], 0.7);
  poly(ctx, m, [[0, T], [D, T - D]], C.yellow, 1.2, [6, 4], 0.4);
  // "same moment" lines at the turn, and the stretch of Earth time they skip
  poly(ctx, m, [[0, tw.nowOut], [D + 0.6, tw.nowOut + b * (D + 0.6)]], C.cyan, 1.4, [6, 4], 0.9);
  poly(ctx, m, [[0, tw.nowIn], [D + 0.6, tw.nowIn - b * (D + 0.6)]], C.cyan, 1.4, [6, 4], 0.9);
  poly(ctx, m, [[0, tw.nowOut], [0, tw.nowIn]], C.cyan, 5, null, 0.35);
  // world lines up to now
  poly(ctx, m, [[0, 0], [0, tNow]], C.xs, 2.4);
  const shipX = tt => (tt <= T / 2 ? b * tt : D - b * (tt - T / 2));
  const path = [[0, 0]]; if (tNow > T / 2) path.push([D, T / 2]); path.push([shipX(tNow), tNow]);
  poly(ctx, m, path, C.cyan, 2.4);
  // one tick per year of each twin's own clock
  ctx.save(); ctx.lineWidth = 2;
  for (let k = 1; k <= Math.floor(tNow + 1e-9); k++) { ctx.strokeStyle = C.xs; ctx.beginPath(); ctx.moveTo(m.x(0) - 6, m.y(k)); ctx.lineTo(m.x(0) + 6, m.y(k)); ctx.stroke(); }
  for (let k = 1; k * g <= tNow + 1e-9; k++) { const tt = k * g, X = m.x(shipX(tt)), Y = m.y(tt); ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(X - 6, Y); ctx.lineTo(X + 6, Y); ctx.stroke(); }
  ctx.restore();
  dot(ctx, m.x(0), m.y(tNow), 4.5, C.xs); dot(ctx, m.x(shipX(tNow)), m.y(tNow), 4.5, C.cyan);
  // bars: years on each clock so far
  const top = m.P.b + 50, bl = 64, br = W - 14, scale = (br - bl) / T;
  title(ctx, t('c4bars'), 8, top - 10, W - 16);
  [[t('barEarth'), tNow, C.xs], [t('barShip'), tNow / g, C.cyan]].forEach(([name, yrs, col], i) => {
    const y = top + i * 26; label(ctx, name, bl - 8, y + 12, C.muted, 'right');
    ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.8; ctx.fillRect(bl, y, Math.max(1, yrs * scale), 16); ctx.restore();
  });
  const earthLeg = tw.nowOut;
  $('r4').textContent = t('s4readout', { te: fix(T, 2), tt: fix(tw.tTrav, 2), diff: fix(T - tw.tTrav, 2), leg: fix(tw.legTrav, 2), earthLeg: fix(earthLeg, 2), nowOut: fix(tw.nowOut, 2), nowIn: fix(tw.nowIn, 2), jump: fix(tw.jump, 2) });
  $('r4p').textContent = t('s4progress', { t: fix(tNow, 1), te: fix(T, 1) });
  $('play4').textContent = t(s4.running ? 'pause' : 'playTrip');
}
function play4() {
  if (s4.running) { s4.running = false; stopAnim('s4'); draw4(); return; }
  if (reduceMotion()) { s4.p = 1; draw4(); return; }
  if (s4.p >= 1) s4.p = 0;
  s4.running = true;
  loop('s4', dt => { s4.p = Math.min(1, s4.p + dt / 6); if (s4.p >= 1) s4.running = false; draw4(); return s4.running; });
  draw4();
}

/* ---------- step 5: adding velocities ---------- */
const s5 = { trail: new Set(), v: null };
function draw5() {
  const v = num('v5'), w = num('w5'), u = M.addV(v, w), naive = v + w;
  if (s5.v !== v) { s5.trail.clear(); s5.v = v; }
  s5.trail.add(w);
  $('v5v').textContent = fix(v); $('w5v').textContent = fix(w);
  const { ctx, W, H } = fitCanvas($('c5'));
  const m = panel(ctx, W, { top: 32, bottom: H - 30, xMin: 0, xMax: 1, yMin: 0, yMax: 2, yTicks: [0, 0.5, 1, 1.5, 2], xTicks: true, title: t('c5') });
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.08)'; ctx.fillRect(m.P.l, m.P.t, m.P.r - m.P.l, m.y(1) - m.P.t); ctx.restore();
  poly(ctx, m, [[0, 1], [1, 1]], C.pink, 1.6);
  const ws = linspace(0, 1, 200);
  poly(ctx, m, ws.map(x => [x, v + x]), C.orange, 2, [6, 4]);
  poly(ctx, m, ws.map(x => [x, M.addV(v, x)]), C.cyan, 2.4);
  s5.trail.forEach(x => dot(ctx, m.x(x), m.y(M.addV(v, x)), 2.6, C.text));
  dot(ctx, m.x(w), m.y(naive), 5, C.orange); dot(ctx, m.x(w), m.y(u), 5.5, C.cyan);
  $('r5').textContent = t('s5readout', { v: fix(v), w: fix(w), naive: fix(naive), over: naive > 1 + 1e-9 ? t('over') : '', u: fix(u, 4), diff: fix(naive - u, 4) });
}

/* ---------- step 6: energy ---------- */
const kFmt = lg => { const v = Math.pow(10, lg); return v >= 1 ? trim(v.toPrecision(3)) : trim(v.toPrecision(2)); };
function draw6() {
  const lg = num('k6'), K = Math.pow(10, lg), km = K / M.ME, br = M.betaFromK(km), bc = M.betaClassical(km);
  $('k6v').textContent = kFmt(lg) + ' MeV';
  const { ctx, W, H } = fitCanvas($('c6'));
  const m = panel(ctx, W, { top: 32, bottom: H - 30, xMin: -2, xMax: 1.3, yMin: 0, yMax: 1.6, yTicks: [0, 0.5, 1, 1.5], xTicks: true, xSteps: [1], xFmt: v => ['0.01', '0.1', '1', '10'][Math.round(v) + 2], title: t('c6') });
  ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.08)'; ctx.fillRect(m.P.l, m.P.t, m.P.r - m.P.l, m.y(1) - m.P.t); ctx.restore();
  poly(ctx, m, [[-2, 1], [1.3, 1]], C.pink, 1.6);
  const ls = linspace(-2, 1.3, 300);
  poly(ctx, m, ls.map(x => [x, M.betaClassical(Math.pow(10, x) / M.ME)]), C.orange, 2, [6, 4]);
  poly(ctx, m, ls.map(x => [x, M.betaFromK(Math.pow(10, x) / M.ME)]), C.cyan, 2.4);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.6; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(m.x(lg), m.P.t); ctx.lineTo(m.x(lg), m.P.b); ctx.stroke(); ctx.restore();
  if (bc <= 1.6) dot(ctx, m.x(lg), m.y(bc), 5, C.orange, true);
  dot(ctx, m.x(lg), m.y(br), 5.5, C.orange);
  $('r6').textContent = t('s6readout', { K: kFmt(lg), km: trim(km.toPrecision(3)), br: br > 0.9999 ? br.toFixed(6) : br.toFixed(4), g: trim(M.gamma(br).toPrecision(4)), bc: bc.toFixed(3), over: bc > 1 ? t('over') : '', K10: kFmt(lg + 1), b10: M.betaFromK(km * 10) > 0.9999 ? M.betaFromK(km * 10).toFixed(6) : M.betaFromK(km * 10).toFixed(4) });
}

/* ---------- text with model-computed numbers ---------- */
function htmlParams() {
  const gps = M.gpsLag(), us = gps.perDay * 1e6;
  return {
    s3e: { ctau: fix(M.C * M.MUON.tau, 0) },
    s6e: { kc: fix(M.ME / 2, 3), me: fix(M.ME, 3) },
    gps: { v: fix(gps.v / 1000, 2), us: fix(us, 1), km: fix(gps.perDay * M.C / 1000, 1) }
  };
}
function fillText() {
  const P = htmlParams();
  document.querySelectorAll('[data-i18n-html]').forEach(node => { const k = node.dataset.i18nHtml; node.innerHTML = t(k, P[k] || {}); });
  $('h6').textContent = t('s6hint', P.s6e);
}

function refresh() { fillText(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('b0').addEventListener('input', () => { s0.tau = 0; draw0(); });
  $('play0').addEventListener('click', play0);
  $('reset0').addEventListener('click', () => { s0.tau = 0; draw0(); });
  ['b1', 'x1', 't1'].forEach(id => $(id).addEventListener('input', draw1));
  $('b2').addEventListener('input', draw2);
  $('t2').addEventListener('input', () => { if (s2.running) { s2.running = false; stopAnim('s2'); } draw2(); });
  $('play2').addEventListener('click', play2);
  $('b3').addEventListener('input', draw3);
  ['b4', 'd4'].forEach(id => $(id).addEventListener('input', () => { if (s4.running) { s4.running = false; stopAnim('s4'); } s4.p = 1; draw4(); }));
  $('play4').addEventListener('click', play4);
  $('all4').addEventListener('click', () => { s4.running = false; stopAnim('s4'); s4.p = 1; draw4(); });
  ['v5', 'w5'].forEach(id => $(id).addEventListener('input', draw5));
  $('k6').addEventListener('input', draw6);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    s0.running = s2.running = s4.running = false; ['s0', 's2', 's4'].forEach(stopAnim); refresh();
  });
  window.refreshRelativity = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
