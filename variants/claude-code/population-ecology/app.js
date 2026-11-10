'use strict';
// Population ecology lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve and readout comes from window.POP_MODEL (model.js). Canvas text is limited to panel titles,
// axis ticks and the K / K/2 tags, laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.POP_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#55657a', dash: '#8fa3ba', water: '#10283a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const fmtInt = v => { const r = Math.round(v); return (r === 0 ? 0 : r).toLocaleString('en-US'); };

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

// Panel title: shrinks the font until it fits (never overflows the canvas).
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceCeil(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v - 1e-9) return m * p; return 10 * p; }
function niceStep(span, px, minPx) { const raw = span * minPx / px, p = Math.pow(10, Math.floor(Math.log10(raw))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p; return 10 * p; }

// A plot panel. Title in its own row above; y ticks left (margin sized to the widest tick); x ticks below.
// o: top, bottom, xMin, xMax, yMin, yMax, yTicks[], yFmt, xStep, xFmt, title, right
function panel(ctx, W, o) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif';
  const yFmt = o.yFmt || (v => fmt(v)), xFmt = o.xFmt || (v => fmt(v));
  const left = 10 + Math.max(...o.yTicks.map(v => ctx.measureText(yFmt(v)).width));
  const P = { l: left, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.lineWidth = 1; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yFmt(v), P.l - 6, y(v) + 4);
  }
  if (o.yMin < 0 && !o.yTicks.includes(0)) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(0)); ctx.lineTo(P.r, y(0)); ctx.stroke(); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, P.b); ctx.stroke();
  // x ticks: spacing chosen so labels never touch
  const widest = Math.max(ctx.measureText(xFmt(o.xMin)).width, ctx.measureText(xFmt(o.xMax)).width);
  const step = o.xStep || niceStep(o.xMax - o.xMin, P.r - P.l, widest + 14);
  ctx.textAlign = 'center';
  for (let v = Math.ceil(o.xMin / step - 1e-9) * step; v <= o.xMax + 1e-9; v += step) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    const lab = xFmt(v), wl = ctx.measureText(lab).width;
    const X = Math.min(W - 2 - wl / 2, Math.max(wl / 2 + 2, x(v)));
    ctx.fillText(lab, X, P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P, clip: () => { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 1, P.r - P.l, P.b - P.t + 2); ctx.clip(); } };
}
function yTicksFor(max, n = 4) { const s = niceStep(max, 100, 100 / n); const out = []; for (let v = 0; v <= max + 1e-9; v += s) out.push(v); return out; }
function line(ctx, pts, color, lw = 2.2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, color, r = 5, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
  else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function arrow(ctx, X, Y, dir, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X + 6 * dir, Y); ctx.lineTo(X - 4 * dir, Y - 5); ctx.lineTo(X - 4 * dir, Y + 5); ctx.closePath(); ctx.fill(); ctx.restore();
}
function tag(ctx, text, X, Y, color, align = 'right') { ctx.save(); ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore(); }

/* ---------- shared animation runner (reduced motion → jump to the end; hidden page → finish) ---------- */
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

/* ---------- step 0: exponential growth ---------- */
const s0 = { ghosts: [] };
const T0 = 10, N00 = 20;
function draw0() {
  const b = num('b0'), d = num('d0'), r = b - d;
  $('b0v').textContent = fmt(b); $('d0v').textContent = fmt(d);
  const { ctx, W, H } = fitCanvas($('c0'));
  const end = M.expo(N00, r, T0);
  const ymax = niceCeil(Math.max(N00 * 1.25, end * 1.05));
  const P = panel(ctx, W, { top: 28, bottom: H - 26, xMin: 0, xMax: T0, yMin: 0, yMax: ymax, yTicks: yTicksFor(ymax), yFmt: fmtInt, xStep: 1, title: t('c0') });
  const curve = rr => Array.from({ length: 201 }, (_, i) => { const tt = i / 200 * T0; return [P.x(tt), P.y(M.expo(N00, rr, tt))]; });
  P.clip();
  s0.ghosts.forEach(g => { if (Math.abs(g - r) > 1e-9) line(ctx, curve(g), C.ghost, 1.4); });
  const td = M.doublingTime(r);
  if (r > 1e-9) {
    for (let k = 1; k * td <= T0 + 1e-9 && k <= 20; k++) {
      const X = P.x(k * td), Y = P.y(N00 * Math.pow(2, k));
      line(ctx, [[X, P.P.b], [X, Y]], C.orange, 1.2, [4, 4], 0.75);
      dot(ctx, X, Y, C.orange, 3.5);
    }
  }
  line(ctx, curve(r), C.cyan, 2.6);
  ctx.restore();
  dot(ctx, P.x(0), P.y(N00), C.cyan, 4);
  if (Math.abs(r) < 1e-9) $('r0').textContent = t('s0flat');
  else if (r > 0) $('r0').textContent = t('s0up', { r: fmt(r), td: fmt(td, 2), n10: fmtInt(end), k: fmt(T0 / td, 1) });
  else $('r0').textContent = t('s0down', { r: fmt(r), td: fmt(td, 2), n10: fmt(end, end < 10 ? 1 : 0) });
}
function remember0() { const r = Math.round((num('b0') - num('d0')) * 100) / 100; s0.ghosts = s0.ghosts.filter(g => Math.abs(g - r) > 1e-9); s0.ghosts.push(r); if (s0.ghosts.length > 6) s0.ghosts.shift(); }

/* ---------- step 1: per-capita birth and death lines ---------- */
// fixed scatter positions for up to 160 fish dots and 80 food dots in the pond
function scatter(n, seed) { let s = seed; const u = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; return Array.from({ length: n }, () => [u(), u()]); }
const FISH = scatter(160, 11), FOOD = scatter(80, 977);
function draw1() {
  const N = num('n1'), K = num('k1'), r = M.DEFAULT.r;
  $('n1v').textContent = fmtInt(N); $('k1v').textContent = fmtInt(K);
  const { ctx, W, H } = fitCanvas($('c1'));
  const P = panel(ctx, W, { top: 28, bottom: H - 26, xMin: 0, xMax: 1600, yMin: 0, yMax: 0.7, yTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], xFmt: fmtInt, title: t('c1a') });
  const bAt = n => M.birthRate(n, K, r), dAt = n => M.deathRate(n, K, r);
  // shaded gap between the lines
  for (const [a, z, col] of [[0, Math.min(K, 1600), 'rgba(126,226,168,0.16)'], [K, 1600, 'rgba(255,122,147,0.16)']]) {
    if (z <= a) continue;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(P.x(a), P.y(bAt(a))); ctx.lineTo(P.x(z), P.y(bAt(z))); ctx.lineTo(P.x(z), P.y(dAt(z))); ctx.lineTo(P.x(a), P.y(dAt(a))); ctx.closePath(); ctx.fill();
  }
  line(ctx, [[P.x(0), P.y(bAt(0))], [P.x(1600), P.y(bAt(1600))]], C.green, 2.4);
  line(ctx, [[P.x(0), P.y(dAt(0))], [P.x(1600), P.y(dAt(1600))]], C.pink, 2.4);
  // K marker
  line(ctx, [[P.x(K), P.P.t], [P.x(K), P.P.b]], C.muted, 1, [3, 4], 0.8);
  tag(ctx, 'K', P.x(K) + 5, P.P.t + 12, C.muted, 'left');
  // current N: the net gap
  const X = P.x(N), net = bAt(N) - dAt(N);
  line(ctx, [[X, P.P.b], [X, P.P.t]], C.text, 1, [2, 3], 0.5);
  line(ctx, [[X, P.y(bAt(N))], [X, P.y(dAt(N))]], net >= 0 ? C.green : C.pink, 5);
  dot(ctx, X, P.y(bAt(N)), C.green, 4.5); dot(ctx, X, P.y(dAt(N)), C.pink, 4.5);

  // pond
  const pd = fitCanvas($('c1b'));
  title(pd.ctx, t('c1b'), 8, 19, pd.W - 16);
  const px = 10, py = 30, pw = pd.W - 20, ph = pd.H - 40;
  pd.ctx.fillStyle = C.water; pd.ctx.beginPath(); pd.ctx.roundRect ? pd.ctx.roundRect(px, py, pw, ph, 14) : pd.ctx.rect(px, py, pw, ph); pd.ctx.fill();
  const nFood = Math.round(K / 20), nFish = Math.round(N / 10);
  pd.ctx.fillStyle = 'rgba(126,226,168,0.55)';
  for (let i = 0; i < nFood; i++) { const [u, v] = FOOD[i]; pd.ctx.fillRect(px + 8 + u * (pw - 16) - 1.5, py + 8 + v * (ph - 16) - 1.5, 3, 3); }
  for (let i = 0; i < nFish; i++) {
    const [u, v] = FISH[i], fx = px + 10 + u * (pw - 20), fy = py + 10 + v * (ph - 20);
    pd.ctx.fillStyle = C.cyan; pd.ctx.beginPath(); pd.ctx.ellipse(fx, fy, 4.2, 2.3, 0, 0, 7); pd.ctx.fill();
    pd.ctx.beginPath(); pd.ctx.moveTo(fx - 3.5, fy); pd.ctx.lineTo(fx - 7, fy - 2.5); pd.ctx.lineTo(fx - 7, fy + 2.5); pd.ctx.closePath(); pd.ctx.fill();
  }
  const verdict = Math.abs(N - K) < 1e-9 ? t('s1at') : N < K ? t('s1below') : t('s1above');
  $('r1').textContent = t('s1readout', { N: String(N), K: String(K), b: fmt(bAt(N), 3), d: fmt(dAt(N), 3), net: fmt(net, 3), verdict });
}

/* ---------- step 2: the hump dN/dt = rN(1 − N/K) ---------- */
const s2 = { visited: new Set([200]) };
const K2 = M.DEFAULT.K, R2 = M.DEFAULT.r, NMAX2 = 1400;
function draw2() {
  const N = num('n2');
  $('n2v').textContent = fmtInt(N);
  const { ctx, W, H } = fitCanvas($('c2'));
  const mid = Math.round(H * 0.42);
  const A = panel(ctx, W, { top: 28, bottom: mid, xMin: 0, xMax: NMAX2, yMin: -0.25, yMax: 0.55, yTicks: [-0.2, 0, 0.2, 0.4], xFmt: fmtInt, title: t('c2a') });
  const pc = M.perCapita(N, R2, K2), g = M.growth(N, R2, K2);
  ctx.fillStyle = 'rgba(255,180,84,0.28)'; ctx.strokeStyle = C.orange; ctx.lineWidth = 1.5;
  const ry = Math.min(A.y(0), A.y(pc)), rh = Math.abs(A.y(pc) - A.y(0));
  ctx.fillRect(A.x(0), ry, A.x(N) - A.x(0), rh); ctx.strokeRect(A.x(0), ry, A.x(N) - A.x(0), rh);
  line(ctx, [[A.x(0), A.y(M.perCapita(0, R2, K2))], [A.x(NMAX2), A.y(M.perCapita(NMAX2, R2, K2))]], C.green, 2.4);
  dot(ctx, A.x(N), A.y(pc), C.orange, 4.5);
  const B = panel(ctx, W, { top: mid + 48, bottom: H - 26, xMin: 0, xMax: NMAX2, yMin: -300, yMax: 160, yTicks: [-250, -125, 0, 125], xFmt: fmtInt, title: t('c2b') });
  line(ctx, Array.from({ length: 141 }, (_, i) => { const n = i / 140 * NMAX2; return [B.x(n), B.y(M.growth(n, R2, K2))]; }), C.cyan, 2.4);
  // direction arrows on the axis and the two equilibria
  for (const n of [150, 400, 650, 850]) arrow(ctx, B.x(n), B.y(0), 1, C.muted);
  for (const n of [1150, 1300]) arrow(ctx, B.x(n), B.y(0), -1, C.muted);
  dot(ctx, B.x(0), B.y(0), C.pink, 4.5, true); dot(ctx, B.x(K2), B.y(0), C.green, 5);
  line(ctx, [[B.x(K2 / 2), B.P.t], [B.x(K2 / 2), B.P.b]], C.muted, 1, [3, 4], 0.6);
  tag(ctx, 'K/2', B.x(K2 / 2) + 5, B.P.t + 12, C.muted, 'left');
  tag(ctx, 'K', B.x(K2) + 5, B.P.t + 12, C.muted, 'left');
  [...s2.visited].forEach(n => { if (n !== N) dot(ctx, B.x(n), B.y(M.growth(n, R2, K2)), 'rgba(232,237,244,0.55)', 2.6); });
  line(ctx, [[A.x(N), A.y(pc)], [B.x(N), B.y(g)]], C.orange, 1, [3, 4], 0.5);
  dot(ctx, B.x(N), B.y(g), C.text, 5.5);
  const pk = M.peakGrowth(R2, K2);
  $('r2').textContent = t('s2readout', { N: fmtInt(N), pc: fmt(pc, 3), g: fmt(g, 1), half: fmtInt(pk.N), max: fmt(pk.g, 1) });
}

/* ---------- step 3: logistic curve in time ---------- */
const s3 = { trail: new Set() };
const T3 = 30;
function draw3() {
  const N0 = num('n03'), r = num('r3'), K = num('k3'), tt = num('t3');
  $('n03v').textContent = fmtInt(N0); $('r3v').textContent = fmt(r); $('k3v').textContent = fmtInt(K); $('t3v').textContent = fmt(tt, 1);
  const N = M.logistic(N0, r, K, tt), g = M.growth(N, r, K), ne = M.expo(N0, r, tt);
  const top = niceCeil(Math.max(K, N0) * 1.12);
  const { ctx, W, H } = fitCanvas($('c3'));
  const P = panel(ctx, W, { top: 28, bottom: H - 26, xMin: 0, xMax: T3, yMin: 0, yMax: top, yTicks: yTicksFor(top), yFmt: fmtInt, xStep: 5, title: t('c3a') });
  for (const [v, lab] of [[K, 'K'], [K / 2, 'K/2']]) { line(ctx, [[P.P.l, P.y(v)], [P.P.r, P.y(v)]], C.muted, 1, [3, 4], 0.7); tag(ctx, lab, P.P.r - 4, P.y(v) - 5, C.muted); }
  P.clip();
  line(ctx, Array.from({ length: 241 }, (_, i) => { const u = i / 240 * T3; return [P.x(u), P.y(M.expo(N0, r, u))]; }), C.dash, 1.6, [5, 5]);
  line(ctx, Array.from({ length: 241 }, (_, i) => { const u = i / 240 * T3; return [P.x(u), P.y(M.logistic(N0, r, K, u))]; }), C.cyan, 2.6);
  [...s3.trail].forEach(u => dot(ctx, P.x(u), P.y(M.logistic(N0, r, K, u)), 'rgba(232,237,244,0.55)', 2.4));
  const dT = 2.5; line(ctx, [[P.x(tt - dT), P.y(N - g * dT)], [P.x(tt + dT), P.y(N + g * dT)]], C.orange, 2.4);
  ctx.restore();
  dot(ctx, P.x(tt), P.y(N), C.text, 5.5);

  const hb = fitCanvas($('c3b'));
  const nTop = top, gMax = r * K / 4, gMin = Math.min(0, M.growth(nTop, r, K));
  const gHi = niceCeil(gMax * 1.15), gLo = gMin < 0 ? -niceCeil(-gMin * 1.05) : 0;
  const yt = [gLo, 0, gHi].filter((v, i, a) => a.indexOf(v) === i);
  const B = panel(hb.ctx, hb.W, { top: 28, bottom: hb.H - 26, xMin: 0, xMax: nTop, yMin: gLo, yMax: gHi, yTicks: yt, yFmt: v => fmt(v, 0), xFmt: fmtInt, title: t('c3b') });
  line(hb.ctx, Array.from({ length: 121 }, (_, i) => { const n = i / 120 * nTop; return [B.x(n), B.y(M.growth(n, r, K))]; }), C.cyan, 2.2);
  dot(hb.ctx, B.x(K), B.y(0), C.green, 4.5);
  [...s3.trail].forEach(u => { const n = M.logistic(N0, r, K, u); dot(hb.ctx, B.x(n), B.y(M.growth(n, r, K)), 'rgba(232,237,244,0.55)', 2.4); });
  dot(hb.ctx, B.x(N), B.y(g), C.text, 5.5);

  let extra;
  const t90 = M.tReach(N0, r, K, 0.9), ti = M.tInflection(N0, r, K);
  if (t90 === null) extra = t('s3extraHigh', { dir: t(N0 > K ? 's3dirDown' : 's3dirUp') });
  else if (ti === null) extra = t('s3extraHalf', { t90: fmt(t90, 1) });
  else extra = t('s3extraS', { ti: fmt(ti, 1), t90: fmt(t90, 1) });
  $('rd3').textContent = t('s3readout', { t: fmt(tt, 1), N: fmtInt(N), g: fmt(g, 1), ne: ne > 1e7 ? '> 10,000,000' : fmtInt(ne), extra });
}
function clear3() { s3.trail.clear(); }

/* ---------- step 4: fishing ---------- */
const s4 = { ghosts: [] };
const T4 = 60;
const sim4 = {}; function harvest(H) { if (!sim4[H]) sim4[H] = M.simHarvest(M.DEFAULT.r, M.DEFAULT.K, H, M.DEFAULT.K, 300); return sim4[H]; }
function draw4() {
  const H = num('h4'), r = M.DEFAULT.r, K = M.DEFAULT.K, eq = M.harvestEq(r, K, H);
  $('h4v').textContent = fmtInt(H);
  const a = fitCanvas($('c4'));
  const A = panel(a.ctx, a.W, { top: 28, bottom: a.H - 26, xMin: 0, xMax: K, yMin: 0, yMax: 220, yTicks: [0, 50, 100, 150, 200], yFmt: v => fmt(v, 0), xFmt: fmtInt, title: t('c4a') });
  line(a.ctx, Array.from({ length: 101 }, (_, i) => { const n = i / 100 * K; return [A.x(n), A.y(M.growth(n, r, K))]; }), C.cyan, 2.4);
  line(a.ctx, [[A.P.l, A.y(H)], [A.P.r, A.y(H)]], C.orange, 2.2);
  // arrows along the axis: right where growth > H, left where growth < H
  for (let i = 1; i < 10; i++) { const n = i * K / 10, net = M.growth(n, r, K) - H; if (Math.abs(net) > 1e-9) arrow(a.ctx, A.x(n), A.y(0) - 7, net > 0 ? 1 : -1, net > 0 ? C.green : C.pink); }
  if (eq.exists) { dot(a.ctx, A.x(eq.hi), A.y(H), C.green, 5.5); dot(a.ctx, A.x(eq.lo), A.y(H), C.pink, 5.5, true); }

  const b = fitCanvas($('c4b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 0, xMax: T4, yMin: 0, yMax: 1000, yTicks: [0, 250, 500, 750, 1000], yFmt: fmtInt, xStep: 10, title: t('c4b') });
  const path = s => { const pts = []; for (let i = 0; i < s.ts.length && s.ts[i] <= T4 + 1e-9; i += 10) pts.push([B.x(s.ts[i]), B.y(s.N[i])]); return pts; };
  s4.ghosts.forEach(g => { if (g !== H) line(b.ctx, path(harvest(g)), C.ghost, 1.4); });
  const sim = harvest(H);
  line(b.ctx, path(sim), C.cyan, 2.6);
  if (eq.exists) line(b.ctx, [[B.P.l, B.y(eq.hi)], [B.P.r, B.y(eq.hi)]], C.green, 1, [3, 4], 0.7);

  let txt;
  if (Math.abs(H - eq.msy) < 1e-9) txt = t('s4edge', { n60: fmtInt(sim.N[Math.round(T4 / 0.02)]) });
  else if (eq.exists) txt = t('s4stable', { H: fmtInt(H), hi: fmtInt(eq.hi), lo: fmtInt(eq.lo) });
  else txt = t(sim.collapse > T4 ? 's4crashLate' : 's4crash', { H: fmtInt(H), tc: fmt(sim.collapse, 0) });
  $('r4').textContent = txt;
}
function remember4() { const H = num('h4'); s4.ghosts = s4.ghosts.filter(g => g !== H); s4.ghosts.push(H); if (s4.ghosts.length > 8) s4.ghosts.shift(); }

/* ---------- step 5: predators ---------- */
const s5 = { upto: M.PP.T, playing: false };
const PP5 = { ...M.PP, N0: 100, P0: 5 };
const cache5 = {}; function pp(a, m) { const k = a + '|' + m; if (!cache5[k]) cache5[k] = M.ppLag(a, m, PP5); return cache5[k]; }
function draw5() {
  const a = num('a5'), m = num('m5'), L = pp(a, m), s = L.sim, eq = M.ppEq(a, m, PP5);
  $('a5v').textContent = fmt(a, 3); $('m5v').textContent = fmt(m);
  const iEnd = Math.min(s.ts.length - 1, Math.round(s5.upto / PP5.dt));
  const pMax = niceCeil(Math.max(...s.P) * 1.1), nMax = 1000, fMax = niceCeil(Math.max(...s.N) * 1.08);
  const c = fitCanvas($('c5'));
  const mid = Math.round(c.H / 2);
  const A = panel(c.ctx, c.W, { top: 28, bottom: mid - 18, xMin: 0, xMax: PP5.T, yMin: 0, yMax: nMax, yTicks: [0, 500, 1000], yFmt: fmtInt, xStep: 10, title: t('c5a') });
  const B = panel(c.ctx, c.W, { top: mid + 30, bottom: c.H - 26, xMin: 0, xMax: PP5.T, yMin: 0, yMax: pMax, yTicks: yTicksFor(pMax, 3), yFmt: v => fmt(v, 0), xStep: 10, title: t('c5aP') });
  const series = (Pn, arr) => { const pts = []; for (let i = 0; i <= iEnd; i += 5) pts.push([Pn.x(s.ts[i]), Pn.y(arr[i])]); pts.push([Pn.x(s.ts[iEnd]), Pn.y(arr[iEnd])]); return pts; };
  if (eq.coexist) { line(c.ctx, [[A.P.l, A.y(eq.N)], [A.P.r, A.y(eq.N)]], C.text, 1, [2, 4], 0.45); line(c.ctx, [[B.P.l, B.y(eq.P)], [B.P.r, B.y(eq.P)]], C.text, 1, [2, 4], 0.45); }
  line(c.ctx, series(A, s.N), C.cyan, 2.4);
  line(c.ctx, series(B, s.P), C.orange, 2.4);
  for (const [pk, col] of [[L.prey, C.cyan], [L.pred, C.orange]]) {
    if (!pk || pk.t > s5.upto + 1e-9) continue;
    const X = A.x(pk.t);
    line(c.ctx, [[X, A.P.t], [X, A.P.b]], col, 1.3, [4, 4], 0.85); line(c.ctx, [[X, B.P.t], [X, B.P.b]], col, 1.3, [4, 4], 0.85);
  }
  if (s5.playing) { dot(c.ctx, A.x(s.ts[iEnd]), A.y(s.N[iEnd]), C.text, 4.5); dot(c.ctx, B.x(s.ts[iEnd]), B.y(s.P[iEnd]), C.text, 4.5); }

  const d = fitCanvas($('c5b'));
  const F = panel(d.ctx, d.W, { top: 28, bottom: d.H - 26, xMin: 0, xMax: fMax, yMin: 0, yMax: pMax, yTicks: yTicksFor(pMax, 4), yFmt: v => fmt(v, 0), xFmt: fmtInt, title: t('c5b') });
  const traj = []; for (let i = 0; i <= iEnd; i += 3) traj.push([F.x(s.N[i]), F.y(s.P[i])]); traj.push([F.x(s.N[iEnd]), F.y(s.P[iEnd])]);
  line(d.ctx, traj, C.cyan, 1.8, null, 0.9);
  dot(d.ctx, F.x(PP5.N0), F.y(PP5.P0), C.muted, 4.5, true);
  if (s5.playing) dot(d.ctx, F.x(s.N[iEnd]), F.y(s.P[iEnd]), C.orange, 4.5);
  if (eq.coexist) { d.ctx.save(); d.ctx.lineCap = 'round'; const X = F.x(eq.N), Y = F.y(eq.P); for (const [col, lw] of [[C.bg, 6], [C.text, 2.6]]) { d.ctx.strokeStyle = col; d.ctx.lineWidth = lw; d.ctx.beginPath(); d.ctx.moveTo(X - 9, Y); d.ctx.lineTo(X + 9, Y); d.ctx.moveTo(X, Y - 9); d.ctx.lineTo(X, Y + 9); d.ctx.stroke(); } d.ctx.restore(); }

  const prog = s5.playing ? t('s5progress', { c: fmt(s5.upto, 0) }) : '';
  let txt;
  if (!eq.coexist) txt = t('s5extinct', { Ne: fmtInt(eq.need) });
  else if (L.prey && L.pred) txt = t('s5readout', { tn: fmt(L.prey.t, 1), nn: fmtInt(L.prey.v), tp: fmt(L.pred.t, 1), pp: fmt(L.pred.v, 1), lag: fmt(L.lag, 1), Ne: fmtInt(eq.N), Pe: fmt(eq.P, 1) });
  else txt = t('s5noPeak', { tn: fmt(L.prey ? L.prey.t : 0, 1), nn: fmtInt(L.prey ? L.prey.v : PP5.N0), Ne: fmtInt(eq.N), Pe: fmt(eq.P, 1) });
  $('r5').textContent = prog + txt;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['b0', 'd0'].forEach(id => { $(id).addEventListener('input', draw0); $(id).addEventListener('change', () => { remember0(); draw0(); }); });
  remember0();
  ['n1', 'k1'].forEach(id => $(id).addEventListener('input', draw1));

  $('n2').addEventListener('input', () => { stopAnim('s2'); s2.visited.add(num('n2')); draw2(); });
  $('sweep2').addEventListener('click', () => {
    s2.visited.clear();
    animate('s2', 5000, p => { const n = Math.round(p * NMAX2 / 10) * 10; for (let v = 0; v <= n; v += 50) s2.visited.add(v); s2.visited.add(n); $('n2').value = n; draw2(); });
  });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), fb = $('quizFeedback');
    const bk = fmt(M.birthRate(M.DEFAULT.K, M.DEFAULT.K), 2);
    if (!choice) { fb.textContent = t('quizNone'); fb.style.color = C.muted; fb.dataset.state = 'none'; return; }
    const ok = choice.value === 'b';
    fb.textContent = t(ok ? 'correct' : 'wrong', { bk }); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  });

  $('t3').addEventListener('input', () => { stopAnim('s3'); s3.trail.add(Math.round(num('t3') * 2) / 2); draw3(); });
  ['n03', 'r3', 'k3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); clear3(); draw3(); }));
  $('play3').addEventListener('click', () => {
    clear3();
    animate('s3', 6000, p => { const tt = Math.round(p * T3 * 10) / 10; for (let u = 0; u <= tt + 1e-9; u += 1) s3.trail.add(u); $('t3').value = tt; draw3(); });
  });

  $('h4').addEventListener('input', draw4);
  $('h4').addEventListener('change', () => { remember4(); draw4(); });
  remember4();

  ['a5', 'm5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.playing = false; s5.upto = PP5.T; draw5(); }));
  $('play5').addEventListener('click', () => {
    s5.playing = true;
    animate('s5', 8000, p => { s5.upto = p * PP5.T; draw5(); }, () => { s5.playing = false; s5.upto = PP5.T; draw5(); });
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
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
