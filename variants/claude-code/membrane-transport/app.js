'use strict';
// Membrane transport lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, particle and readout comes from window.MEM_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and a few short tags in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MEM_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#55657a', dash: '#8fa3ba', water: '#10283a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only after a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (v == null || Number.isNaN(v)) return '—'; if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
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

/* ---------- step 0: random walkers ---------- */
const s0 = { sim: null, seed: 1, running: false, raf: 0, visible: true };
const STEPS_PER_FRAME = 8;
function newSim0() { stop0(); s0.sim = M.makeDiffusion(num('no0'), num('ni0'), s0.seed); }
function stop0() { s0.running = false; cancelAnimationFrame(s0.raf); }
function loop0() {
  if (!s0.running) return;
  if (document.hidden || !s0.visible) { stop0(); draw0(); return; }
  s0.sim.step(STEPS_PER_FRAME); draw0();
  s0.raf = requestAnimationFrame(loop0);
}
function draw0() {
  const sim = s0.sim, nOut0 = num('no0'), nIn0 = num('ni0');
  $('no0v').textContent = String(nOut0); $('ni0v').textContent = String(nIn0);
  const a = fitCanvas($('c0'));
  title(a.ctx, t('c0a'), 8, 18, a.W - 16);
  const bx = 8, by = 28, bw = a.W - 16, bh = a.H - 36;
  const X = x => bx + x / 2 * bw, Y = y => by + y * bh;
  a.ctx.fillStyle = 'rgba(255,180,84,0.06)'; a.ctx.fillRect(bx, by, bw / 2, bh);
  a.ctx.fillStyle = 'rgba(103,215,249,0.06)'; a.ctx.fillRect(bx + bw / 2, by, bw / 2, bh);
  a.ctx.strokeStyle = C.axis; a.ctx.lineWidth = 1; a.ctx.strokeRect(bx, by, bw, bh);
  // membrane with pores
  a.ctx.fillStyle = '#8293a8';
  let y0 = 0; const gaps = M.PORES.map(c => [c - M.PORE_HALF, c + M.PORE_HALF]).concat([[1, 1]]);
  const mx = X(1 - M.HALF_THICK), mw = Math.max(4, X(1 + M.HALF_THICK) - mx);
  for (const [g0, g1] of gaps) { a.ctx.fillRect(mx, Y(y0), mw, Y(g0) - Y(y0)); y0 = g1; }
  sim.parts.forEach((p, i) => { a.ctx.fillStyle = i < nOut0 ? C.orange : C.cyan; a.ctx.beginPath(); a.ctx.arc(X(p.x), Y(p.y), 2.6, 0, 7); a.ctx.fill(); });

  const b = fitCanvas($('c0b')), mid = Math.round(b.H / 2), total = nOut0 + nIn0;
  const hist = sim.hist, sMax = Math.max(1000, niceCeil(sim.steps || 1));
  const yMax = Math.max(10, niceCeil(total * 1.05));
  const A = panel(b.ctx, b.W, { top: 28, bottom: mid - 16, xMin: 0, xMax: sMax, yMin: 0, yMax, yTicks: yTicksFor(yMax, 2), yFmt: v => fmt(v, 0), xFmt: fmtInt, title: t('c0b') });
  line(b.ctx, [[A.P.l, A.y(total / 2)], [A.P.r, A.y(total / 2)]], C.dash, 1.2, [4, 4]);
  line(b.ctx, hist.map(h => [A.x(h.s), A.y(h.out)]), C.orange, 2.2);
  line(b.ctx, hist.map(h => [A.x(h.s), A.y(h.in)]), C.cyan, 2.2);
  const last = hist[hist.length - 1], cMax = Math.max(10, niceCeil(Math.max(last.inward, last.outward) * 1.1));
  const B = panel(b.ctx, b.W, { top: mid + 30, bottom: b.H - 26, xMin: 0, xMax: sMax, yMin: 0, yMax: cMax, yTicks: yTicksFor(cMax, 2), yFmt: v => fmt(v, 0), xFmt: fmtInt, title: t('c0c') });
  line(b.ctx, hist.map(h => [B.x(h.s), B.y(h.inward)]), C.green, 2.2);
  line(b.ctx, hist.map(h => [B.x(h.s), B.y(h.outward)]), C.pink, 2.2);

  const c = sim.count();
  if (sim.steps === 0) { $('r0').textContent = t('s0start'); return; }
  let recent = '';
  const back = hist.length - 1 - 50;
  if (back >= 0) {
    const h0 = hist[back], win = hist.slice(back);
    const ra = last.inward - h0.inward, rb = last.outward - h0.outward;
    const avgOut = win.reduce((s, h) => s + h.out, 0) / win.length, avgIn = win.reduce((s, h) => s + h.in, 0) / win.length;
    recent = Math.abs(avgOut - avgIn) <= 0.1 * total ? t('s0recentEq', { ra, rb }) : t('s0recent', { ra, rb, rn: ra - rb });
  }
  $('r0').textContent = t('s0readout', { k: fmtInt(sim.steps), a: last.inward, b: last.outward, net: last.inward - last.outward, no: c.out, ni: c.in, recent });
}

/* ---------- step 1: carrier saturation ---------- */
function draw1() {
  const Co = num('co1'), mult = num('car1'), P = M.CARRIER;
  $('co1v').textContent = String(Co); $('car1v').textContent = '×' + fmt(mult, 1);
  const a = fitCanvas($('c1'));
  const A = panel(a.ctx, a.W, { top: 28, bottom: a.H - 26, xMin: 0, xMax: 50, yMin: 0, yMax: 22, yTicks: [0, 5, 10, 15, 20], yFmt: v => fmt(v, 0), xStep: 10, title: t('c1a') });
  line(a.ctx, [[A.P.l, A.y(mult * P.Jmax)], [A.P.r, A.y(mult * P.Jmax)]], C.orange, 1.3, [5, 4], 0.85);
  line(a.ctx, [[A.x(P.Km), A.P.t], [A.x(P.Km), A.P.b]], C.muted, 1, [2, 4], 0.7);
  tag(a.ctx, 'Km', A.x(P.Km) + 5, A.P.t + 12, C.muted, 'left');
  line(a.ctx, [[A.x(0), A.y(0)], [A.x(50), A.y(M.jSimple(50))]], C.ghost, 2.4);
  line(a.ctx, Array.from({ length: 201 }, (_, i) => { const c = i / 4; return [A.x(c), A.y(M.jCarrier(c, 0, mult))]; }), C.cyan, 2.6);
  dot(a.ctx, A.x(Co), A.y(M.jSimple(Co)), C.ghost, 4.5);
  dot(a.ctx, A.x(Co), A.y(M.jCarrier(Co, 0, mult)), C.text, 5.5);

  // membrane schematic
  const b = fitCanvas($('c1b'));
  title(b.ctx, t('c1b'), 8, 18, b.W - 16);
  const top = 30, H = b.H - top - 8, mY = top + H * 0.5, band = 30, W = b.W;
  const n = Math.round(10 * mult), busy = Math.round(M.occupancy(Co) * n);
  b.ctx.fillStyle = 'rgba(255,180,84,0.05)'; b.ctx.fillRect(8, top, W - 16, mY - band / 2 - top);
  // lipid heads
  b.ctx.fillStyle = '#3a4d63';
  for (let x = 12; x < W - 10; x += 9) { b.ctx.beginPath(); b.ctx.arc(x, mY - band / 2 + 4, 3.5, 0, 7); b.ctx.fill(); b.ctx.beginPath(); b.ctx.arc(x, mY + band / 2 - 4, 3.5, 0, 7); b.ctx.fill(); }
  const slot = (W - 24) / n;
  for (let i = 0; i < n; i++) {
    const cx = 12 + slot * (i + 0.5), w = Math.min(14, slot * 0.6), on = i < busy;
    b.ctx.fillStyle = on ? C.green : '#55657a'; b.ctx.fillRect(cx - w / 2, mY - band / 2 - 4, w, band + 8);
    if (on) { b.ctx.fillStyle = C.text; b.ctx.beginPath(); b.ctx.arc(cx, mY, 3, 0, 7); b.ctx.fill(); }
  }
  // glucose outside, density ∝ Co
  const dots = Math.round(Co * 1.6), pts = scatter(80, 31);
  b.ctx.fillStyle = C.orange;
  for (let i = 0; i < dots; i++) { const [u, v] = pts[i]; b.ctx.beginPath(); b.ctx.arc(14 + u * (W - 28), top + 6 + v * (mY - band / 2 - top - 16), 2.4, 0, 7); b.ctx.fill(); }

  if (Co === 0) { $('r1').textContent = t('s1zero'); return; }
  const jc = M.jCarrier(Co, 0, mult), j2 = M.jCarrier(2 * Co, 0, mult);
  $('r1').textContent = t('s1readout', { c: String(Co), c2: String(2 * Co), jc: fmt(jc, 2), occ: fmt(100 * M.occupancy(Co), 0), jm: fmt(mult * P.Jmax, 0), js: fmt(M.jSimple(Co), 2), rc: fmt(j2 / jc, 2) });
}
function scatter(n, seed) { const u = M.mulberry32(seed); return Array.from({ length: n }, () => [u(), u()]); }

/* ---------- step 2: cell size ---------- */
const s2 = { t: 5, ghosts: [] };
const T2 = 60;
function draw2() {
  const R = num('R2');
  $('R2v').textContent = String(R);
  const a = fitCanvas($('c2'));
  title(a.ctx, t('c2a'), 8, 18, a.W - 16);
  const cx = a.W / 2, cy = 30 + (a.H - 30) / 2, rMaxPx = Math.min(a.W / 2 - 14, (a.H - 30) / 2 - 14), sc = rMaxPx / 50;
  s2.ghosts.forEach(g => { if (g !== R) { a.ctx.strokeStyle = C.ghost; a.ctx.lineWidth = 1.2; a.ctx.beginPath(); a.ctx.arc(cx, cy, g * sc, 0, 7); a.ctx.stroke(); } });
  const f = M.cInside(s2.t, R);
  a.ctx.fillStyle = `rgba(103,215,249,${0.08 + 0.72 * f})`; a.ctx.beginPath(); a.ctx.arc(cx, cy, Math.max(1.5, R * sc), 0, 7); a.ctx.fill();
  a.ctx.strokeStyle = C.cyan; a.ctx.lineWidth = 2; a.ctx.stroke();
  // 10 µm scale bar
  a.ctx.strokeStyle = C.muted; a.ctx.lineWidth = 2; a.ctx.beginPath(); a.ctx.moveTo(12, a.H - 12); a.ctx.lineTo(12 + 10 * sc, a.H - 12); a.ctx.stroke();
  tag(a.ctx, '10 µm', 12 + 10 * sc + 6, a.H - 8, C.muted, 'left');

  const b = fitCanvas($('c2b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 0, xMax: T2, yMin: 0, yMax: 1.05, yTicks: [0, 0.5, 1], xStep: 10, title: t('c2b') });
  const curve = r => Array.from({ length: 241 }, (_, i) => { const tt = i / 240 * T2; return [B.x(tt), B.y(M.cInside(tt, r))]; });
  s2.ghosts.forEach(g => { if (g !== R) line(b.ctx, curve(g), C.ghost, 1.4); });
  line(b.ctx, [[B.P.l, B.y(0.5)], [B.P.r, B.y(0.5)]], C.muted, 1, [2, 4], 0.6);
  const th = M.tHalf(R);
  if (th <= T2) line(b.ctx, [[B.x(th), B.P.b], [B.x(th), B.y(0.5)]], C.orange, 1.4, [4, 4]);
  line(b.ctx, curve(R), C.cyan, 2.6);
  dot(b.ctx, B.x(s2.t), B.y(f), C.text, 5);
  $('r2').textContent = t('s2readout', { R: String(R), av: fmt(3 / R, 3), tau: fmt(M.tau(R), 2), th: fmt(th, 2), t9: fmt(M.t90(R), 1), now: t('s2now', { t: fmt(s2.t, 1), f: fmt(f, 2) }) });
}
function remember2() { const R = num('R2'); s2.ghosts = s2.ghosts.filter(g => g !== R); s2.ghosts.push(R); if (s2.ghosts.length > 6) s2.ghosts.shift(); }

/* ---------- step 3: osmosis ---------- */
const s3 = { t: M.OSMO.T, ghosts: [] };
const cache3 = {}; function vol(c) { if (!cache3[c]) cache3[c] = M.simVolume(c); return cache3[c]; }
const DOTS3 = scatter(60, 5), CELL3 = scatter(30, 77);
function vAt(sim, tt) { const i = Math.min(sim.vs.length - 1, Math.round(tt / M.OSMO.dt)); return { v: sim.vs[i], i }; }
function draw3() {
  const c = num('cout3'), sim = vol(c), ve = M.vEq(c);
  $('c3v').textContent = String(c);
  const tEnd = sim.burstAt !== null ? sim.burstAt : M.OSMO.T, tt = Math.min(s3.t, tEnd), { v } = vAt(sim, tt);
  const burst = sim.burstAt !== null && s3.t >= sim.burstAt - 1e-9;
  const a = fitCanvas($('c3'));
  title(a.ctx, t('c3a'), 8, 18, a.W - 16);
  const bx = 10, by = 30, bw = a.W - 20, bh = a.H - 40, cx = bx + bw / 2, cy = by + bh / 2;
  a.ctx.fillStyle = '#10283a'; a.ctx.fillRect(bx, by, bw, bh);
  const r0 = Math.min(bw, bh) * 0.26, r = r0 * Math.cbrt(v);
  // outside solute: one dot per 10 mOsm/L, kept off the cell
  a.ctx.fillStyle = C.orange;
  const nOut = Math.round(c / 10);
  for (let i = 0, k = 0; k < nOut && i < DOTS3.length; i++) { const [u, w] = DOTS3[i]; const x = bx + 6 + u * (bw - 12), y = by + 6 + w * (bh - 12); if (Math.hypot(x - cx, y - cy) < r0 * 1.2 + 6) continue; a.ctx.beginPath(); a.ctx.arc(x, y, 2.3, 0, 7); a.ctx.fill(); k++; }
  // the cell
  a.ctx.save(); a.ctx.fillStyle = 'rgba(103,215,249,0.16)'; a.ctx.strokeStyle = C.cyan; a.ctx.lineWidth = 2.4;
  if (burst) a.ctx.setLineDash([6, 7]);
  a.ctx.beginPath(); a.ctx.arc(cx, cy, r, 0, 7); a.ctx.fill(); a.ctx.stroke(); a.ctx.restore();
  // inside solute: fixed number of particles (30 = 300 mOsm/L at V₀), spread over the current volume
  a.ctx.fillStyle = C.orange;
  CELL3.forEach(([u, w]) => { const ang = u * 2 * Math.PI, rr = Math.sqrt(w) * (r - 6); a.ctx.beginPath(); a.ctx.arc(cx + rr * Math.cos(ang), cy + rr * Math.sin(ang), 2.3, 0, 7); a.ctx.fill(); });
  // water arrows: direction from the sign of dV/dt now
  const rate = burst ? 0 : (M.cInsideOsm(v) - c) / M.OSMO.cIn0;
  if (Math.abs(rate) > 0.004) {
    const len = Math.min(26, 8 + 60 * Math.abs(rate)), dir = rate > 0 ? -1 : 1; // −1: pointing inward
    for (let k = 0; k < 8; k++) {
      const ang = k * Math.PI / 4 + Math.PI / 8, rad = r + 10 + len / 2, x = cx + rad * Math.cos(ang), y = cy + rad * Math.sin(ang);
      const ux = Math.cos(ang) * dir, uy = Math.sin(ang) * dir;
      a.ctx.strokeStyle = '#8fb8ff'; a.ctx.fillStyle = '#8fb8ff'; a.ctx.lineWidth = 2;
      a.ctx.beginPath(); a.ctx.moveTo(x - ux * len / 2, y - uy * len / 2); a.ctx.lineTo(x + ux * len / 2, y + uy * len / 2); a.ctx.stroke();
      const hx = x + ux * len / 2, hy = y + uy * len / 2;
      a.ctx.beginPath(); a.ctx.moveTo(hx + ux * 5, hy + uy * 5); a.ctx.lineTo(hx - uy * 4, hy + ux * 4); a.ctx.lineTo(hx + uy * 4, hy - ux * 4); a.ctx.closePath(); a.ctx.fill();
    }
  }

  const b = fitCanvas($('c3b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 0, xMax: M.OSMO.T, yMin: 0.6, yMax: 1.7, yTicks: [0.6, 0.8, 1, 1.2, 1.4, 1.6], xStep: 2, title: t('c3b') });
  line(b.ctx, [[B.P.l, B.y(M.OSMO.burst)], [B.P.r, B.y(M.OSMO.burst)]], C.pink, 1.4, [5, 4]);
  line(b.ctx, [[B.P.l, B.y(1)], [B.P.r, B.y(1)]], C.muted, 1, [2, 4], 0.6);
  const path = (s, upto) => { const pts = []; for (let i = 0; i < s.vs.length && s.ts[i] <= upto + 1e-9; i += 5) pts.push([B.x(s.ts[i]), B.y(Math.min(1.7, s.vs[i]))]); const j = Math.min(s.vs.length - 1, Math.round(upto / M.OSMO.dt)); pts.push([B.x(s.ts[j]), B.y(Math.min(1.7, s.vs[j]))]); return pts; };
  s3.ghosts.forEach(g => { if (g !== c) line(b.ctx, path(vol(g), M.OSMO.T), C.ghost, 1.4); });
  line(b.ctx, path(sim, tt), C.orange, 2.6);
  dot(b.ctx, B.x(tt), B.y(Math.min(1.7, v)), burst ? C.pink : C.text, 5);

  const ton = M.tonicity(c), now = t('s3now', { t: fmt(tt, 1), vn: fmt(v, 2) });
  let txt;
  if (sim.burstAt !== null) txt = t('s3burst', { c: String(c), v: fmt(ve, 2), tb: fmt(sim.burstAt, 1) });
  else if (Math.abs(ve - M.OSMO.burst) < 1e-9) txt = t('s3edge', { c: String(c) });
  else txt = t('s3readout', { c: String(c), ton: t(ton === 'hypo' ? 'tonHypo' : ton === 'hyper' ? 'tonHyper' : 'tonIso'), dir: t(c < 300 ? 'dirIn' : c > 300 ? 'dirOut' : 'dirNone'), v: fmt(ve, 2), now });
  $('r3').textContent = txt;
}
function run3() { const sim = vol(num('cout3')), end = sim.burstAt !== null ? sim.burstAt : M.OSMO.T; animate('s3', 3000, p => { s3.t = p * end; draw3(); }, () => { s3.t = M.OSMO.T; draw3(); }); }
function remember3() { const c = num('cout3'); s3.ghosts = s3.ghosts.filter(g => g !== c); s3.ghosts.push(c); if (s3.ghosts.length > 6) s3.ghosts.shift(); }
function set3(c) { remember3(); $('cout3').value = c; remember3(); run3(); }

/* ---------- step 4: leak and pump ---------- */
const s4 = { atp: true, trace: null, shown: M.PUMP.T };
function sEff() { return s4.atp ? num('s4') / 100 : 0; }
function newTrace4() {
  const start = s4.trace ? s4.trace.cs[s4.trace.cs.length - 1] : M.steadyNa(1, 1);
  s4.trace = M.simNa(start, sEff(), num('l4'));
  animate('s4', 2500, p => { s4.shown = p * M.PUMP.T; draw4(); });
}
function draw4() {
  const s = sEff(), l = num('l4'), P = M.PUMP, ss = M.steadyNa(s, l);
  $('s4v').textContent = num('s4') + '%'; $('l4v').textContent = '×' + fmt(l, 2);
  $('cut4').classList.toggle('on', !s4.atp); $('restore4').classList.toggle('on', s4.atp);
  $('cut4').setAttribute('aria-pressed', String(!s4.atp)); $('restore4').setAttribute('aria-pressed', String(s4.atp));
  const a = fitCanvas($('c4'));
  const A = panel(a.ctx, a.W, { top: 28, bottom: a.H - 26, xMin: 0, xMax: 150, yMin: 0, yMax: 4, yTicks: [0, 1, 2, 3, 4], xStep: 25, title: t('c4a') });
  line(a.ctx, [[A.x(0), A.y(M.leak(0, l))], [A.x(P.Co), A.y(0)]], C.cyan, 2.4);
  line(a.ctx, Array.from({ length: 151 }, (_, i) => [A.x(i), A.y(M.pumpFlux(i, s))]), C.orange, 2.4);
  dot(a.ctx, A.x(ss), A.y(M.leak(ss, l)), C.text, 5.5);
  const b = fitCanvas($('c4b'));
  const B = panel(b.ctx, b.W, { top: 28, bottom: b.H - 26, xMin: 0, xMax: P.T, yMin: 0, yMax: 160, yTicks: [0, 50, 100, 150], yFmt: v => fmt(v, 0), xStep: 50, title: t('c4b') });
  line(b.ctx, [[B.P.l, B.y(P.Co)], [B.P.r, B.y(P.Co)]], C.muted, 1, [2, 4], 0.7);
  tag(b.ctx, '145', B.P.r - 4, B.y(P.Co) - 5, C.muted);
  const tr = s4.trace, iEnd = Math.min(tr.cs.length - 1, Math.round(s4.shown / P.dt));
  const pts = []; for (let i = 0; i <= iEnd; i += 2) pts.push([B.x(tr.ts[i]), B.y(tr.cs[i])]); pts.push([B.x(tr.ts[iEnd]), B.y(tr.cs[iEnd])]);
  line(b.ctx, pts, C.green, 2.6);
  dot(b.ctx, B.x(tr.ts[iEnd]), B.y(tr.cs[iEnd]), C.text, 4.5);
  const c0 = tr.cs[0], c1 = tr.cs[tr.cs.length - 1];
  if (!s4.atp) { $('r4').textContent = t('s4cut', { c0: fmt(c0, 1), c60: fmt(tr.cs[Math.round(60 / P.dt)], 1), c1: fmt(c1, 1) }); return; }
  const flux = M.leak(ss, l);
  $('r4').textContent = t('s4readout', { s: String(num('s4')), l: fmt(l, 2), ci: fmt(ss, 1), ratio: fmt(P.Co / ss, 1), flux: fmt(flux, 2), atp: fmt(flux / M.NA_PER_ATP, 2), c0: fmt(c0, 1), c1: fmt(c1, 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  newSim0();
  ['no0', 'ni0'].forEach(id => $(id).addEventListener('input', () => { newSim0(); draw0(); }));
  $('run0').addEventListener('click', () => {
    if (reduceMotion()) { s0.sim.step(1000); draw0(); return; }
    if (s0.running) { stop0(); draw0(); return; }
    s0.running = true; s0.visible = true; loop0();
  });
  $('reset0').addEventListener('click', () => { s0.seed += 1; newSim0(); draw0(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { s0.visible = e.isIntersecting; })).observe($('step0'));

  ['co1', 'car1'].forEach(id => $(id).addEventListener('input', draw1));

  $('R2').addEventListener('input', draw2);
  $('R2').addEventListener('change', () => { remember2(); draw2(); });
  remember2();
  $('play2').addEventListener('click', () => animate('s2', 6000, p => { s2.t = p * T2; draw2(); }));

  $('cout3').addEventListener('input', () => { s3.t = 0; run3(); });
  $('cout3').addEventListener('change', () => remember3());
  remember3();
  $('hypo3').addEventListener('click', () => set3(200));
  $('iso3').addEventListener('click', () => set3(300));
  $('hyper3').addEventListener('click', () => set3(500));

  s4.trace = M.simNa(M.steadyNa(1, 1), 1, 1);
  ['s4', 'l4'].forEach(id => $(id).addEventListener('input', newTrace4));
  $('cut4').addEventListener('click', () => { s4.atp = false; newTrace4(); });
  $('restore4').addEventListener('click', () => { s4.atp = true; newTrace4(); });

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), fb = $('quizFeedback');
    if (!choice) { fb.textContent = t('quizNone'); fb.style.color = C.muted; fb.dataset.state = 'none'; return; }
    const ok = choice.value === 'b';
    fb.textContent = t(ok ? 'correct' : 'wrong'); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); stop0(); } });
  window.refreshPage = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
