'use strict';
// Activation-energy lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.AE_MODEL (model.js). Canvas text is limited to panel
// titles (own row, shrunk to fit), axis ticks and a few short symbols placed in reserved spots;
// legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.AE_MODEL;
const I = window.AE_I18N;
const t = (...a) => I.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#6b7c92', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => M.trim(M.fix(v, d));
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = e => (e === 0 ? '1' : e === 1 ? '10' : '10' + String(e).split('').map(c => SUP[c]).join(''));
const pct = v => (v >= 0.1 ? fmt(v * 100, 1) : v >= 0.001 ? fmt(v * 100, 2) : M.sci(v * 100, 1)) + '%';
function timeText(sec) {
  const h = M.humanTime(sec);
  const v = h.value >= 100 ? Math.round(h.value).toLocaleString('en-US') : fmt(h.value, h.value >= 10 ? 0 : 1);
  return v + ' ' + t('unit_' + h.unit);
}

// Model values quoted inside static paragraphs (filled before the first render).
Object.assign(I.STATIC_PARAMS, {
  dec: fmt(M.decadeStep(M.T0), 2),
  ea2: fmt(M.doublingEa(M.T0, 10), 1),
  w50: () => timeText(M.wait(50)),
  w100: () => timeText(M.wait(100))
});

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

// Text that shrinks until it fits maxW (never overflows, never squeezes glyphs).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, X, Y, maxW) => fitText(ctx, text, X, Y, maxW);

// A plot panel; the title sits in its own row above the plot, ticks left of / below it.
// o: top, bottom, left, right, xMin, xMax, yMin, yMax, yTicks [{v, s}] or numbers, xTicks [{v, s}] or null
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const q of o.yTicks || []) {
    const v = typeof q === 'number' ? q : q.v, s = typeof q === 'number' ? fmt(q, 2) : q.s;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l + 1, y(v)); ctx.lineTo(P.r - 1, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(s, P.l - 6, y(v) + 4);
  }
  for (const q of o.xTicks || []) {
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(q.v), P.b); ctx.lineTo(x(q.v), P.b + 4); ctx.stroke();
    const w = ctx.measureText(q.s).width, X = Math.min(W - 3 - w / 2, Math.max(3 + w / 2, x(q.v)));
    ctx.textAlign = 'center'; ctx.fillText(q.s, X, P.b + 16);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
// Evenly spaced x ticks whose labels are at least minPx apart.
function xticks(lo, hi, px, steps, minPx = 34, f = v => fmt(v, 2)) {
  let step = steps[steps.length - 1];
  for (const s of steps) if (s / (hi - lo) * px >= minPx) { step = s; break; }
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push({ v, s: f(v) });
  return out;
}
function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
// Vertical double-headed arrow from v0 to v1 at X, with a short symbol label beside it.
function varrow(ctx, X, Y0, Y1, color, label, side) {
  if (Math.abs(Y1 - Y0) < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(X, Y0); ctx.lineTo(X, Y1); ctx.stroke();
  const head = (Y, dir) => { ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - 4, Y - 6 * dir); ctx.lineTo(X + 4, Y - 6 * dir); ctx.closePath(); ctx.fill(); };
  const dir = Y1 > Y0 ? 1 : -1;
  if (Math.abs(Y1 - Y0) > 12) { head(Y1, dir); head(Y0, -dir); }
  ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = side < 0 ? 'right' : 'left';
  ctx.fillText(label, X + side * 6, (Y0 + Y1) / 2 + 4);
  ctx.restore();
}

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
function finish(name) { const a = anims[name]; if (!a) return; cancelAnimationFrame(a.id); delete anims[name]; a.frame(1); if (a.done) a.done(); }

/* ---------- energy-profile drawing shared by steps 0 and 5 ---------- */
function profilePanel(ctx, W, top, bottom, Ea, dH, yMin, yMax, yTicks, titleText) {
  const m = panel(ctx, W, { top, bottom, xMin: -0.3, xMax: 1.3, yMin, yMax, yTicks, title: titleText });
  // reference levels: reactants (0) across, summit and products dashed toward their arrows
  line(ctx, [[m.P.l, m.y(0)], [m.P.r, m.y(0)]], C.ghost, 1, [4, 4], 0.8);
  line(ctx, [[m.x(0.5), m.y(Ea)], [m.x(0.86), m.y(Ea)]], C.ghost, 1, [4, 4], 0.8);
  line(ctx, [[m.x(0.86), m.y(dH)], [m.P.r, m.y(dH)]], C.ghost, 1, [4, 4], 0.8);
  const pts = []; for (let i = 0; i <= 160; i++) { const xi = -0.3 + 1.6 * i / 160; pts.push([m.x(xi), m.y(M.profile(xi, Ea, dH))]); }
  line(ctx, pts, C.cyan, 2.4);
  varrow(ctx, m.x(0.5), m.y(0), m.y(Ea), C.orange, 'Eₐ', -1);
  varrow(ctx, m.x(0.86), m.y(dH), m.y(Ea), C.pink, 'Eₐ′', 1);
  varrow(ctx, m.x(1.18), m.y(0), m.y(dH), C.green, 'ΔH', -1);
  return m;
}

/* ---------- step 0: the hill along the reaction coordinate ---------- */
const s0 = { lo: 0.2, hi: 0.2 };
function drawAtoms(ctx, W, top, bottom, xi) {
  const a = M.atoms(xi), cy = (top + bottom) / 2;
  const u = Math.min(62, (W - 70) / 4.4), r = Math.min(17, u * 0.36);
  const span = (a.dAB + a.dBC) * u, xA = W / 2 - span / 2, xB = xA + a.dAB * u, xC = xB + a.dBC * u;
  const bond = (x0, x1, order) => {
    if (order <= 0) return;
    ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.35 + 0.65 * order; ctx.lineWidth = 2 + 3 * order;
    if (order < 0.999) ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(x0 + r, cy); ctx.lineTo(x1 - r, cy); ctx.stroke(); ctx.restore();
  };
  bond(xA, xB, a.bondAB); bond(xB, xC, a.bondBC);
  [[xA, 'A', C.orange], [xB, 'B', C.cyan], [xC, 'C', C.green]].forEach(([X, s, col]) => {
    ctx.save(); ctx.beginPath(); ctx.arc(X, cy, r, 0, 7); ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fill(); ctx.restore();
    ctx.save(); ctx.fillStyle = '#061118'; ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(s, X, cy + 4.5); ctx.restore();
  });
}
function draw0() {
  const xi = num('xi0'), Ea = num('ea0'), dH = num('dh0');
  $('xi0v').textContent = xi.toFixed(2); $('ea0v').textContent = String(Ea); $('dh0v').textContent = String(dH);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0top'), 8, 17, W - 16);
  drawAtoms(ctx, W, 26, 120, xi);
  const m = profilePanel(ctx, W, 160, H - 14, Ea, dH, -90, 175, [-80, -40, 0, 40, 80, 120, 160], t('c0bot'));
  const trail = []; for (let i = 0; i <= 80; i++) { const q = s0.lo + (s0.hi - s0.lo) * i / 80; trail.push([m.x(q), m.y(M.profile(q, Ea, dH))]); }
  if (s0.hi > s0.lo) line(ctx, trail, C.orange, 5, null, 0.75);
  const E = M.profile(xi, Ea, dH);
  dot(ctx, m.x(xi), m.y(E), 7, C.text);
  const kind = dH < 0 ? t('kindExo') : dH > 0 ? t('kindEndo') : t('kindZero');
  $('r0').textContent = t('s0readout', { xi: xi.toFixed(2), E: fmt(E, 1), Ea, dH, kind, Ear: Ea - dH });
}

/* ---------- step 1: the collision lottery ---------- */
const BIN = 0.5, NB = 40, SHOW = 40;
const s1 = { Es: [], rng: M.rng(20261109), target: 0, prog: '' };
function addCollisions(n) { for (let i = 0; i < n; i++) s1.Es.push(M.sampleEnergy(s1.rng(), M.T0)); }
function draw1() {
  const Ea = num('ea1'), Es = s1.Es, N = Es.length;
  $('ea1v').textContent = fmt(Ea, 1);
  const { ctx, W, H } = fitCanvas($('c1'));
  // top: last 40 collisions as bars
  const A = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax: SHOW, yMin: 0, yMax: 20, yTicks: [0, 5, 10, 15, 20], title: t('c1top') });
  const recent = Es.slice(-SHOW), bw = (A.P.r - A.P.l) / SHOW;
  recent.forEach((E, i) => {
    const X = A.P.l + (SHOW - recent.length + i) * bw, win = E >= Ea;
    ctx.fillStyle = win ? C.green : C.raw; ctx.globalAlpha = i === recent.length - 1 ? 1 : 0.85;
    const Y = A.y(Math.min(20, E)); ctx.fillRect(X + bw * 0.15, Y, bw * 0.7, A.P.b - Y);
    if (E > 20) { ctx.fillStyle = C.green; ctx.fillRect(X + bw * 0.15, A.P.t, bw * 0.7, 3); }
    ctx.globalAlpha = 1;
  });
  line(ctx, [[A.P.l, A.y(Ea)], [A.P.r, A.y(Ea)]], C.text, 1.4, [5, 4]);
  // bottom: histogram split into winners and losers, with the predicted counts
  const B0 = 196, xt = xticks(0, 20, W - 52, [2, 5, 10], 30, v => fmt(v, 0));
  const win = new Array(NB).fill(0), lose = new Array(NB).fill(0);
  Es.forEach(E => { const i = Math.floor(E / BIN); if (i < NB) (E >= Ea ? win : lose)[i]++; });
  const expect = i => N * (Math.exp(-i * BIN / M.RT(M.T0)) - Math.exp(-(i + 1) * BIN / M.RT(M.T0)));
  const peak = Math.max(1, ...win.map((v, i) => v + lose[i]), expect(0));
  const nice = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000].find(v => v >= peak * 1.08) || peak * 1.1;
  const B = panel(ctx, W, { top: B0, bottom: H - 28, xMin: 0, xMax: 20, yMin: 0, yMax: nice, yTicks: [0, nice / 2, nice].map(v => ({ v, s: String(v) })), xTicks: xt, title: t('c1bot') });
  for (let i = 0; i < NB; i++) {
    const X0 = B.x(i * BIN) + 0.5, Wd = B.x((i + 1) * BIN) - B.x(i * BIN) - 1;
    let Y = B.P.b;
    if (lose[i]) { const h = B.P.b - B.y(lose[i]); ctx.fillStyle = C.raw; ctx.fillRect(X0, Y - h, Wd, h); Y -= h; }
    if (win[i]) { const h = B.P.b - B.y(win[i]); ctx.fillStyle = C.green; ctx.fillRect(X0, Y - h, Wd, h); }
  }
  if (N) { const pts = []; for (let i = 0; i < NB; i++) pts.push([B.x((i + 0.5) * BIN), B.y(expect(i))]); line(ctx, pts, C.orange, 2); }
  line(ctx, [[B.x(Ea), B.P.t], [B.x(Ea), B.P.b]], C.text, 1.4, [5, 4]);
  const theo = M.fraction(Ea, M.T0);
  if (!N) { $('r1').textContent = t('s1empty', { theo: pct(theo) }); return; }
  const s = M.successes(Es, Ea);
  $('r1').textContent = t('s1readout', { prog: s1.prog, N: N.toLocaleString('en-US'), s: s.toLocaleString('en-US'), Ea: fmt(Ea, 1), meas: pct(s / N), theo: pct(theo) });
}

/* ---------- step 2: real hills, real waiting times ---------- */
const s2 = { hist: new Set([50]) };
const Y2 = { min: -10, max: 27 };
function draw2() {
  const Ea = num('ea2'); s2.hist.add(Ea);
  $('ea2v').textContent = String(Ea);
  const { ctx, W, H } = fitCanvas($('c2'));
  const yt = [-6, 0, 6, 12, 18, 24].map(e => ({ v: e, s: pow10(e) }));
  const m = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 200, yMin: Y2.min, yMax: Y2.max, yTicks: yt, xTicks: xticks(0, 200, W - 52, [20, 50, 100], 32, v => fmt(v, 0)), title: t('c2') });
  [[0, 'ref1s'], [Math.log10(M.YEAR), 'ref1y'], [Math.log10(M.UNIVERSE), 'refU']].forEach(([v, k]) => {
    line(ctx, [[m.P.l, m.y(v)], [m.P.r, m.y(v)]], C.ghost, 1, [4, 4]);
    fitText(ctx, t(k), m.P.l + 5, m.y(v) - 5, (m.P.r - m.P.l) * 0.42, { size: 11, weight: 500, color: C.muted });
  });
  const pts = []; for (let i = 0; i <= 200; i++) pts.push([m.x(i), m.y(Math.log10(M.wait(i)))]);
  line(ctx, pts, C.cyan, 2.4);
  [...s2.hist].forEach(v => { if (v !== Ea) dot(ctx, m.x(v), m.y(Math.log10(M.wait(v))), 3.5, C.text); });
  const lw = Math.log10(M.wait(Ea));
  line(ctx, [[m.x(Ea), m.P.b], [m.x(Ea), m.y(lw)], [m.P.l, m.y(lw)]], C.orange, 1.2, [3, 3], 0.8);
  dot(ctx, m.x(Ea), m.y(lw), 6, C.cyan);
  const w = M.wait(Ea), p = M.fraction(Ea, M.T0), h = M.humanTime(w);
  const note = w < 1 ? t('noteFast') : w < M.YEAR ? t('noteMid') : h.universes < 1 ? t('noteSlow') : t('noteNever', { u: M.sci(h.universes, 1) });
  $('r2').textContent = t('s2readout', { Ea, p: M.sci(p, 1), zp: M.sci(M.Z * p, 1), wait: timeText(w), note });
}

/* ---------- step 3: heating ---------- */
const s3 = { key: '', hist: new Set() };
function draw3() {
  const T = num('t3'), dT = num('dt3'), Ea = num('ea3'), T2 = T + dT;
  $('t3v').textContent = String(T); $('dt3v').textContent = String(dT); $('ea3v').textContent = String(Ea);
  const key = T + '/' + dT; if (key !== s3.key) { s3.key = key; s3.hist = new Set(); }
  s3.hist.add(Ea);
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3top'), 8, 17, W - 16);
  const m1 = M.RT(T), m2 = M.RT(T2), p1 = M.fraction(Ea, T), p2 = M.fraction(Ea, T2);
  const barMax = W - 16 - 96;
  const pair = (y0, label, a, b, sa, sb) => {
    fitText(ctx, label, 8, y0, W - 16, { size: 12, weight: 500, color: C.muted });
    const top = Math.max(a, b);
    [[a, sa, C.cyan], [b, sb, C.orange]].forEach(([v, s, col], i) => {
      const L = Math.max(2, barMax * v / top), Y = y0 + 8 + i * 18;
      ctx.fillStyle = col; ctx.fillRect(8, Y, L, 12);
      ctx.save(); ctx.fillStyle = C.text; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(s, 8 + L + 6, Y + 10); ctx.restore();
    });
  };
  pair(44, t('barMean'), m1, m2, fmt(m1, 2) + ' kJ/mol', fmt(m2, 2) + ' kJ/mol');
  pair(110, t('barFrac'), p1, p2, M.sci(p1, 1), M.sci(p2, 1));
  // bottom: rate factor vs Eₐ on a log axis
  const r = v => M.heatRatio(v, T, dT), top = Math.max(Math.log10(4), Math.log10(r(150)) * 1.06);
  const cand = [1, 2, 5, 10, 100, 1e3, 1e4, 1e5, 1e6].filter(v => Math.log10(v) <= top);
  const P0 = 196, Pb = H - 28, pxPer = (Pb - P0) / top, yt = [];
  cand.forEach(v => { const Y = Math.log10(v) * pxPer; if (!yt.length || Y - yt[yt.length - 1].px >= 18) yt.push({ v: Math.log10(v), s: '×' + (v >= 1e3 ? pow10(Math.round(Math.log10(v))) : String(v)), px: Y }); });
  const m = panel(ctx, W, { top: P0, bottom: Pb, left: 46, xMin: 0, xMax: 150, yMin: 0, yMax: top, yTicks: yt, xTicks: xticks(0, 150, W - 58, [10, 25, 50], 30, v => fmt(v, 0)), title: t('c3bot') });
  line(ctx, [[m.P.l, m.y(Math.LN2 / Math.LN10)], [m.P.r, m.y(Math.LN2 / Math.LN10)]], C.ghost, 1.2, [5, 4]);
  const pts = []; for (let i = 0; i <= 150; i++) pts.push([m.x(i), m.y(Math.log10(r(i)))]);
  line(ctx, pts, C.green, 2.4);
  [...s3.hist].forEach(v => { if (v !== Ea) dot(ctx, m.x(v), m.y(Math.log10(r(v))), 3.2, C.text); });
  dot(ctx, m.x(Ea), m.y(Math.log10(r(Ea))), 6, C.orange);
  $('r3').textContent = t('s3readout', { T, T2, mr: fmt(m2 / m1, 3), m1: fmt(m1, 2), m2: fmt(m2, 2), Ea, p1: M.sci(p1, 2), p2: M.sci(p2, 2), r: fmt(r(Ea), 2) });
}

/* ---------- step 4: catalyst ---------- */
const S4 = { Ea: 100, dH: -8, lo: -4, hi: 8 };
const s4 = { now: S4.hi, prog: '' };
function draw4() {
  const drop = num('drop4');
  $('drop4v').textContent = String(drop);
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: 176, xMin: -0.15, xMax: 1.15, yMin: -25, yMax: 115, yTicks: [0, 50, 100], title: t('c4top') });
  const p0 = [], p1 = [];
  for (let i = 0; i <= 160; i++) { const xi = -0.15 + 1.3 * i / 160; p0.push([A.x(xi), A.y(M.profile(xi, S4.Ea, S4.dH))]); p1.push([A.x(xi), A.y(M.catProfile(xi, S4.Ea, S4.dH, drop))]); }
  line(ctx, p0, C.raw, 2.4); line(ctx, p1, C.green, 2.4);
  const B = panel(ctx, W, { top: 222, bottom: H - 28, xMin: S4.lo, xMax: S4.hi, yMin: 0, yMax: 1.05, yTicks: [{ v: 0, s: '0%' }, { v: 0.5, s: '50%' }, { v: 1, s: '100%' }], xTicks: xticks(S4.lo, S4.hi, W - 52, [2, 4], 36, v => pow10(Math.round(v))), title: t('c4bot') });
  const r0 = M.relax(S4.Ea, S4.dH, M.T0, 0), r1 = M.relax(S4.Ea, S4.dH, M.T0, drop);
  line(ctx, [[B.P.l, B.y(r0.xeq)], [B.P.r, B.y(r0.xeq)]], C.ghost, 1.2, [5, 4]);
  const curve = (r, col) => { const pts = []; for (let i = 0; i <= 240; i++) { const lt = S4.lo + (s4.now - S4.lo) * i / 240; pts.push([B.x(lt), B.y(r.x(Math.pow(10, lt)))]); } line(ctx, pts, col, 2.4); dot(ctx, B.x(s4.now), B.y(r.x(Math.pow(10, s4.now))), 5, col); };
  curve(r0, C.raw); curve(r1, C.green);
  if (s4.now < S4.hi) line(ctx, [[B.x(s4.now), B.P.t], [B.x(s4.now), B.P.b]], C.text, 1.2, [3, 3], 0.7);
  $('r4').textContent = t('s4readout', { prog: s4.prog, f: M.sci(M.speedUp(drop), 2), h0: timeText(r0.half), h1: timeText(r1.half), x0: pct(r0.xeq), x1: pct(r1.xeq) });
}

/* ---------- step 5: forward vs reverse ---------- */
function draw5() {
  const Ea = num('ea5'), dH = num('dh5'), T = num('t5');
  $('ea5v').textContent = String(Ea); $('dh5v').textContent = String(dH); $('t5v').textContent = String(T);
  const { ctx, W, H } = fitCanvas($('c5'));
  profilePanel(ctx, W, 26, 190, Ea, dH, -60, 150, [-50, 0, 50, 100, 150], t('c5top'));
  const lk = (e, TT) => Math.log10(M.rate(e, TT));
  const all = [lk(Ea, 300), lk(Ea, 500), lk(Ea - dH, 300), lk(Ea - dH, 500)];
  const lo = Math.floor(Math.min(...all) / 2) * 2 - 1, hi = Math.ceil(Math.max(...all) / 2) * 2 + 1;
  const span = hi - lo, stepE = span > 24 ? 6 : span > 12 ? 4 : 2, yt = [];
  for (let e = Math.ceil(lo / stepE) * stepE; e <= hi; e += stepE) yt.push({ v: e, s: pow10(e) });
  const m = panel(ctx, W, { top: 236, bottom: H - 28, left: 46, xMin: 300, xMax: 500, yMin: lo, yMax: hi, yTicks: yt, xTicks: xticks(300, 500, W - 58, [25, 50, 100], 34, v => fmt(v, 0) + ' K'), title: t('c5bot') });
  const curve = (e, col) => { const pts = []; for (let TT = 300; TT <= 500; TT += 2) pts.push([m.x(TT), m.y(lk(e, TT))]); line(ctx, pts, col, 2.4); dot(ctx, m.x(300), m.y(lk(e, 300)), 4.5, col, true); dot(ctx, m.x(T), m.y(lk(e, T)), 6, col); };
  curve(Ea, C.cyan); curve(Ea - dH, C.orange);
  line(ctx, [[m.x(T), m.P.t], [m.x(T), m.P.b]], C.text, 1.2, [3, 3], 0.6);
  const q = M.twoWay(Ea, dH, T);
  const who = T === 300 ? t('whoNone') : dH > 0 ? t('whoF') : dH < 0 ? t('whoR') : t('whoEq');
  $('r5').textContent = t('s5readout', { T, kf: M.sci(q.kf, 2), kr: M.sci(q.kr, 2), K: M.sci(q.K, 2), Ear: q.EaRev, gf: M.sci(q.gainF, 2), gr: M.sci(q.gainR, 2), who });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['ea0', 'dh0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); draw0(); }));
  $('xi0').addEventListener('input', () => { stopAnim('s0'); const v = num('xi0'); s0.lo = Math.min(s0.lo, v); s0.hi = Math.max(s0.hi, v); draw0(); });
  $('play0').addEventListener('click', () => {
    s0.lo = 0; s0.hi = 0;
    animate('s0', 4000, p => { const v = Math.round(p * 100) / 100; $('xi0').value = v; s0.hi = v; draw0(); });
  });

  addCollisions(200); // start with one slow run's worth of collisions so the lottery is visible on arrival
  $('ea1').addEventListener('input', draw1);
  $('run1').addEventListener('click', () => {
    const start = s1.Es.length, n = 200;
    animate('s1', 7000, p => { const c = Math.min(n, Math.floor(p * n + 1e-9)); addCollisions(start + c - s1.Es.length); s1.prog = c < n ? t('s1progress', { c, n }) : ''; draw1(); },
      () => { s1.prog = ''; draw1(); });
  });
  $('bulk1').addEventListener('click', () => { finish('s1'); s1.prog = ''; addCollisions(2000); draw1(); });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.prog = ''; s1.Es = []; draw1(); });

  $('ea2').addEventListener('input', draw2);
  ['t3', 'dt3', 'ea3'].forEach(id => $(id).addEventListener('input', draw3));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('drop4').addEventListener('input', draw4);
  $('run4').addEventListener('click', () => {
    s4.now = S4.lo;
    animate('s4', 6000, p => { s4.now = S4.lo + (S4.hi - S4.lo) * p; s4.prog = p < 1 ? t('s4progress', { t: M.sci(Math.pow(10, s4.now), 1) }) : ''; draw4(); },
      () => { s4.now = S4.hi; s4.prog = ''; draw4(); });
  });

  ['ea5', 'dh5', 't5'].forEach(id => $(id).addEventListener('input', draw5));

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
  window.refreshActivation = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
