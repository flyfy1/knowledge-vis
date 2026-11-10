'use strict';
// Reaction-rates lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every particle, count and curve comes from window.RATES_MODEL (model.js). Canvas text is limited to panel titles
// and axis ticks laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.RATES_MODEL;
const t = (...a) => window.RATES_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', bar: '#55657a', box: '#0a121b' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const pct = f => (f * 100).toFixed(1) + '%';
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sci(v, sig = 2) { const e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); return `${m.toPrecision(sig)}×10${String(e).split('').map(c => SUP[c]).join('')}`; }

function fitCanvas(canvas, H) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  const height = H || Number(canvas.getAttribute('height')) || 300;
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Panel title: one line when it fits at ≥ 10 px; otherwise split at " · " into two lines (the first one 13 px higher).
// Each line shrinks until it fits, so a title never leaves the canvas.
function fitLine(ctx, text, X, Y, maxW) {
  let size = 12;
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); return size;
}
function title(ctx, text, X, Y, maxW) {
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  ctx.font = '600 10px system-ui,sans-serif';
  const cut = text.indexOf(' · ');
  if (ctx.measureText(text).width > maxW && cut > 0) { fitLine(ctx, text.slice(0, cut), X, Y - 13, maxW); fitLine(ctx, text.slice(cut + 3), X, Y, maxW); }
  else fitLine(ctx, text, X, Y, maxW);
  ctx.restore();
}
function panel(ctx, R, o) {
  const x = v => R.l + (v - o.xMin) / (o.xMax - o.xMin) * (R.r - R.l);
  const y = v => R.b - (v - o.yMin) / (o.yMax - o.yMin) * (R.b - R.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(R.l, y(v)); ctx.lineTo(R.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), R.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  for (const v of o.xTicks || []) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), R.b); ctx.lineTo(x(v), R.b + 4); ctx.stroke();
    ctx.fillText(o.xFmt ? o.xFmt(v) : fmt(v), x(v), R.b + 15);
  }
  ctx.restore();
  const tx = o.titleX != null ? o.titleX : 8;
  if (o.title) title(ctx, o.title, tx, R.t - 9, R.r - tx);
  return { x, y, R };
}
function line(ctx, pts, color, { lw = 2, dash = null, alpha = 1 } = {}) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
function clipTo(ctx, R) { ctx.save(); ctx.beginPath(); ctx.rect(R.l, R.t - 1, R.r - R.l, R.b - R.t + 2); ctx.clip(); }

// Layout: wide → box on the left, charts stacked on the right; narrow → box on top, charts below.
function layout(W, nCharts) {
  const wide = W >= 620;
  if (wide) {
    const bw = Math.min(0.52 * W, 470), s = (bw - 10) / M.BOX.w, bh = M.BOX.h * s;
    const H = Math.max(nCharts === 2 ? 430 : 340, 30 + bh + 14), left = bw + 52, rt = 44, rb = H - 26;
    const panels = nCharts === 1 ? [{ l: left, r: W - 14, t: rt, b: rb }]
      : [{ l: left, r: W - 14, t: rt, b: Math.round((rt + rb) / 2) - 34 }, { l: left, r: W - 14, t: Math.round((rt + rb) / 2) + 34, b: rb }];
    return { wide, H, box: { x: 10, y: 30, s }, boxTitleW: bw - 10, panels, titleX: bw + 14 };
  }
  const s = (W - 20) / M.BOX.w, bh = M.BOX.h * s; let y = 30 + bh + 50; const panels = [];
  for (let i = 0; i < nCharts; i++) { panels.push({ l: 46, r: W - 12, t: y, b: y + 110 }); y += 110 + 66; }
  return { wide, H: y - 66 + 26, box: { x: 10, y: 30, s }, boxTitleW: W - 20, panels, titleX: 8 };
}

/* ---------- drawing the box ---------- */
function drawGas(ctx, g, B, now) {
  const s = B.s, rr = Math.max(2.2, M.R * s);
  ctx.fillStyle = C.box; ctx.fillRect(B.x, B.y, M.BOX.w * s, M.BOX.h * s);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(B.x + 0.5, B.y + 0.5, M.BOX.w * s - 1, M.BOX.h * s - 1);
  const rm = reduceMotion();
  for (let i = 0; i < g.n; i++) {
    const X = B.x + g.x[i] * s, Y = B.y + g.y[i] * s;
    ctx.fillStyle = g.kind[i] ? C.orange : C.cyan; ctx.beginPath(); ctx.arc(X, Y, rr, 0, 7); ctx.fill();
    const age = (now - g.flash[i]) / 0.5;
    if (!rm && age >= 0 && age < 1) {
      ctx.save(); ctx.globalAlpha = 1 - age; ctx.strokeStyle = g.flashOk[i] ? C.green : C.ghost; ctx.lineWidth = g.flashOk[i] ? 2.4 : 1.4;
      ctx.beginPath(); ctx.arc(X, Y, rr * (g.flashOk[i] ? 2.2 + 2 * age : 1.8 + age), 0, 7); ctx.stroke(); ctx.restore();
    }
  }
}
function drawSolid(ctx, sol, B, now) {
  const s = B.s, cell = M.CELL * s;
  ctx.fillStyle = C.box; ctx.fillRect(B.x, B.y, M.BOX.w * s, M.BOX.h * s);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(B.x + 0.5, B.y + 0.5, M.BOX.w * s - 1, M.BOX.h * s - 1);
  const maxHit = Math.max(1, ...sol.hits);
  sol.sites.forEach((q, k) => {
    const X = B.x + q.x * s, Y = B.y + q.y * s, h = sol.hits[k] / maxHit;
    ctx.fillStyle = `rgb(${Math.round(58 + 197 * h)},${Math.round(48 + 132 * h)},${Math.round(38 + 46 * h)})`;
    ctx.fillRect(X - cell / 2 + 0.5, Y - cell / 2 + 0.5, cell - 1, cell - 1);
    if (M.exposed(q)) { ctx.strokeStyle = C.orange; ctx.lineWidth = 1; ctx.strokeRect(X - cell / 2 + 1, Y - cell / 2 + 1, cell - 2, cell - 2); }
  });
  const rr = Math.max(1.8, M.RG * s * 1.2), rm = reduceMotion();
  for (let i = 0; i < sol.nA; i++) {
    const X = B.x + sol.x[i] * s, Y = B.y + sol.y[i] * s;
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(X, Y, rr, 0, 7); ctx.fill();
    const age = (now - sol.flash[i]) / 0.5;
    if (!rm && age >= 0 && age < 1 && sol.flashOk[i]) { ctx.save(); ctx.globalAlpha = 1 - age; ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, rr * (2.5 + 2 * age), 0, 7); ctx.stroke(); ctx.restore(); }
  }
}

/* ---------- simulations and their measurement ledgers ---------- */
const sims = {};
function makeEntry(key, build) { const e = { key, sim: build(), running: true, acc: 0, wall: 0, meas: new Map(), cur: null }; sims[key] = e; return e; }
function ledger(e, k) { if (!e.meas.has(k)) e.meas.set(k, { coll: 0, ok: 0, t: 0 }); e.cur = k; return e.meas.get(k); }
function stepEntry(e, steps) {
  const L = e.meas.get(e.cur), solid = e.key === 's4';
  for (let i = 0; i < steps; i++) {
    e.wall += M.DT;
    const r = solid ? M.stepSolid(e.sim, M.DT, e.wall) : M.stepGas(e.sim, M.DT, e.wall);
    if (L) { L.coll += r.coll; L.ok += r.ok; L.t += M.DT; }
  }
}
const rateOf = L => (L && L.t > 0 ? { cr: L.coll / L.t, or: L.ok / L.t, f: L.coll ? L.ok / L.coll : 0 } : { cr: 0, or: 0, f: 0 });

/* ---------- step 0 ---------- */
function reset0() {
  const e = makeEntry('s0', () => M.makeGas({ nA: 30, nB: 30, T: 300, e0: M.E0_DEFAULT, seed: 1 })); ledger(e, 'all');
  if (reduceMotion()) { advance('s0', 10); e.running = false; }
}
// Whole-second bins (collisions, successes) rebuilt from the simulation's tick log; only complete seconds are shown.
function bins0() {
  const g = sims.s0.sim, per = Math.round(1 / M.DT), total = Math.round(g.t / M.DT), firstTick = total - g.log.length;
  const done = Math.floor(total / per), from = Math.max(Math.ceil(firstTick / per), done - 20), bins = [];
  for (let sec = from; sec < done; sec++) { let c = 0, o = 0; for (let k = sec * per; k < (sec + 1) * per; k++) { const q = g.log[k - firstTick]; c += q[0]; o += q[1]; } bins.push([c, o]); }
  return { from, bins };
}
function draw0(now) {
  const e = sims.s0, cv = $('c0'), W = Math.max(240, cv.clientWidth || 600), L = layout(W, 1), { ctx } = fitCanvas(cv, L.H);
  title(ctx, t('c0box'), 10, 18, L.boxTitleW); drawGas(ctx, e.sim, L.box, now);
  const { from: first, bins } = bins0();
  const peak = Math.max(30, ...bins.map(b => b[0]));
  const top = Math.ceil(peak / 10) * 10;
  const P = panel(ctx, L.panels[0], { xMin: first, xMax: first + 20, yMin: 0, yMax: top, yTicks: [0, top / 2, top], xTicks: [first, first + 5, first + 10, first + 15, first + 20].filter((v, i) => L.panels[0].r - L.panels[0].l > 260 || i % 2 === 0), xFmt: v => fmt(v, 0), title: t('c0bars'), titleX: L.titleX });
  const bw = (P.x(1) - P.x(0)) * 0.72;
  bins.forEach(([c, o], i) => {
    const X = P.x(first + i + 0.5) - bw / 2;
    ctx.fillStyle = C.bar; ctx.fillRect(X, P.y(c), bw, P.y(0) - P.y(c));
    ctx.fillStyle = C.green; ctx.fillRect(X, P.y(o), bw, P.y(0) - P.y(o));
  });
  const r = rateOf(e.meas.get('all'));
  $('r0').textContent = t('s0readout', { t: fmt(e.sim.t, 1), c: e.meas.get('all').coll, o: e.meas.get('all').ok, f: pct(r.f), cr: r.cr.toFixed(1), or: r.or.toFixed(2), ft: pct(M.successFraction(M.E0_DEFAULT, 300)) });
}

/* ---------- step 1: concentration ---------- */
function set1(n) {
  const old = sims.s1, meas = old ? old.meas : null;
  const e = makeEntry('s1', () => M.makeGas({ nA: n, nB: n, T: 300, e0: M.E0_DEFAULT, seed: 100 + n }));
  if (meas) e.meas = meas; if (old) e.running = old.running;
  ledger(e, n);
  if (reduceMotion()) advance('s1', 5);
}
function draw1(now) {
  const e = sims.s1, n = num('n1'), cv = $('c1'), W = Math.max(240, cv.clientWidth || 600), L = layout(W, 1), { ctx } = fitCanvas(cv, L.H);
  $('n1v').textContent = String(n);
  title(ctx, t('c0box'), 10, 18, L.boxTitleW); drawGas(ctx, e.sim, L.box, now);
  const narrow = L.panels[0].r - L.panels[0].l < 260;
  const P = panel(ctx, L.panels[0], { xMin: 0, xMax: 3600, yMin: 0, yMax: 80, yTicks: [0, 20, 40, 60, 80], xTicks: narrow ? [0, 1200, 2400, 3600] : [0, 900, 1800, 2700, 3600], xFmt: v => fmt(v, 0), title: t('c1chart'), titleX: L.titleX });
  line(ctx, [[P.x(0), P.y(0)], [P.x(3600), P.y(M.collisionRate(60, 60, 300))]], C.ghost, { lw: 1.6 });
  for (const [k, Lg] of e.meas) if (Lg.t >= 0.5) { const r = rateOf(Lg); dot(ctx, P.x(k * k), P.y(Math.min(80, r.cr)), k === n ? 6 : 4.5, k === n ? C.orange : C.green); }
  const r = rateOf(e.meas.get(n));
  $('r1').textContent = t('s1readout', { n, nn: n * n, t: fmt(e.meas.get(n).t, 1), cr: r.cr.toFixed(1), zt: M.collisionRate(n, n, 300).toFixed(1), f: pct(r.f), or: r.or.toFixed(2) });
}

/* ---------- histogram + fraction chart (steps 2, 3) ---------- */
function drawHist(ctx, P, g, T, e0, showOld) {
  const bw = 0.25, nb = 32, counts = new Array(nb).fill(0), E = g.energies;
  E.forEach(v => { const b = Math.floor(v / bw); if (b < nb) counts[b]++; }); // energies past the axis still count in the total
  const total = Math.max(1, E.length);
  counts.forEach((c, b) => {
    const dens = c / total / bw, X0 = P.x(b * bw), X1 = P.x((b + 1) * bw);
    ctx.fillStyle = (b + 0.5) * bw >= e0 ? C.green : C.bar; ctx.globalAlpha = 0.9;
    ctx.fillRect(X0 + 0.5, P.y(Math.min(P.yMax, dens)), Math.max(1, X1 - X0 - 1), P.y(0) - P.y(Math.min(P.yMax, dens))); ctx.globalAlpha = 1;
  });
  const pts = []; for (let v = 0; v <= 8.0001; v += 0.05) pts.push([P.x(v), P.y(Math.min(P.yMax, 300 / T * Math.exp(-v * 300 / T)))]);
  line(ctx, pts, C.text, { lw: 1.6 });
  if (showOld) line(ctx, [[P.x(M.E0_DEFAULT), P.R.t], [P.x(M.E0_DEFAULT), P.R.b]], C.ghost, { lw: 1.6, dash: [5, 4] });
  line(ctx, [[P.x(e0), P.R.t], [P.x(e0), P.R.b]], C.orange, { lw: 2.4 });
}
function histPanel(ctx, R, titleKey, titleX, yMax) {
  const P = panel(ctx, R, { xMin: 0, xMax: 8, yMin: 0, yMax, yTicks: [0, yMax / 2, yMax], xTicks: [0, 2, 4, 6, 8], xFmt: v => fmt(v, 0), title: t(titleKey), titleX });
  P.yMax = yMax; return P;
}

function set2(T) {
  const e = sims.s2; M.thermalise(e.sim, T); e.sim.energies.length = 0; ledger(e, T);
  if (reduceMotion()) advance('s2', 5);
}
function draw2(now) {
  const e = sims.s2, T = num('t2'), cv = $('c2'), W = Math.max(240, cv.clientWidth || 600), L = layout(W, 2), { ctx } = fitCanvas(cv, L.H);
  $('t2v').textContent = T + ' K';
  title(ctx, t('c0box'), 10, 18, L.boxTitleW); drawGas(ctx, e.sim, L.box, now);
  const H1 = histPanel(ctx, L.panels[0], 'c2hist', L.titleX, 1.6);
  drawHist(ctx, H1, e.sim, T, M.E0_DEFAULT, false);
  const narrow = L.panels[1].r - L.panels[1].l < 260;
  const P = panel(ctx, L.panels[1], { xMin: 200, xMax: 600, yMin: 0, yMax: 0.4, yTicks: [0, 0.2, 0.4], yFmt: v => fmt(v * 100, 0) + '%', xTicks: narrow ? [200, 400, 600] : [200, 300, 400, 500, 600], xFmt: v => fmt(v, 0), title: t('c2frac'), titleX: L.titleX });
  const pts = []; for (let v = 200; v <= 600; v += 5) pts.push([P.x(v), P.y(M.successFraction(M.E0_DEFAULT, v))]); line(ctx, pts, C.ghost, { lw: 1.6 });
  for (const [k, Lg] of e.meas) if (Lg.coll >= 10) dot(ctx, P.x(k), P.y(Math.min(0.4, rateOf(Lg).f)), k === T ? 6 : 4.5, k === T ? C.orange : C.green);
  const r = rateOf(e.meas.get(T)), zr = M.collisionRate(30, 30, T) / M.collisionRate(30, 30, 300), fr = M.successFraction(M.E0_DEFAULT, T) / M.successFraction(M.E0_DEFAULT, 300);
  $('r2').textContent = t('s2readout', { T, Tm: fmt(M.measuredT(e.sim), 0), t: fmt(e.meas.get(T).t, 1), cr: r.cr.toFixed(1), f: pct(r.f), ft: pct(M.successFraction(M.E0_DEFAULT, T)), zr: zr.toFixed(2), fr: fr.toFixed(2), rr: (zr * fr).toFixed(2) });
}

function set3(e0) {
  const e = sims.s3; e.sim.e0 = e0; e.sim.energies.length = 0; ledger(e, e0);
  if (reduceMotion()) advance('s3', 5);
}
function draw3(now) {
  const e = sims.s3, e0 = num('e3'), cv = $('c3'), W = Math.max(240, cv.clientWidth || 600), L = layout(W, 2), { ctx } = fitCanvas(cv, L.H);
  $('e3v').textContent = e0.toFixed(2);
  $('noCat').setAttribute('aria-pressed', e0 === 2 ? 'true' : 'false'); $('withCat').setAttribute('aria-pressed', e0 === 1 ? 'true' : 'false');
  title(ctx, t('c0box'), 10, 18, L.boxTitleW); drawGas(ctx, e.sim, L.box, now);
  const H1 = histPanel(ctx, L.panels[0], 'c2hist', L.titleX, 1.2);
  drawHist(ctx, H1, e.sim, 300, e0, true);
  const P = panel(ctx, L.panels[1], { xMin: 0.5, xMax: 4, yMin: 0, yMax: 0.7, yTicks: [0, 0.35, 0.7], yFmt: v => fmt(v * 100, 0) + '%', xTicks: [1, 2, 3, 4], xFmt: v => fmt(v, 0), title: t('c3frac'), titleX: L.titleX });
  const pts = []; for (let v = 0.5; v <= 4.0001; v += 0.05) pts.push([P.x(v), P.y(M.successFraction(v, 300))]); line(ctx, pts, C.ghost, { lw: 1.6 });
  for (const [k, Lg] of e.meas) if (Lg.coll >= 10) dot(ctx, P.x(k), P.y(Math.min(0.7, rateOf(Lg).f)), k === e0 ? 6 : 4.5, k === e0 ? C.orange : C.green);
  const r = rateOf(e.meas.get(e0));
  $('r3').textContent = t('s3readout', { e0: e0.toFixed(2), t: fmt(e.meas.get(e0).t, 1), cr: r.cr.toFixed(1), f: pct(r.f), ft: pct(M.successFraction(e0, 300)), or: r.or.toFixed(2), v: M.meanSpeedOf(e.sim).toFixed(0), v0: M.meanSpeed(300).toFixed(0), rr: (M.successFraction(e0, 300) / M.successFraction(2, 300)).toFixed(2) });
}

/* ---------- step 4: surface area ---------- */
function set4(idx) {
  const piece = M.PIECES[idx], old = sims.s4;
  const e = makeEntry('s4', () => M.makeSolid({ piece, nA: 60, T: 300, e0: M.E0_DEFAULT, seed: 40 + piece }));
  if (old) { e.meas = old.meas; e.running = old.running; }
  ledger(e, piece);
  if (reduceMotion()) advance('s4', 5);
}
function draw4(now) {
  const e = sims.s4, piece = M.PIECES[num('p4')], cv = $('c4'), W = Math.max(240, cv.clientWidth || 600), L = layout(W, 1), { ctx } = fitCanvas(cv, L.H);
  $('p4v').textContent = String(piece);
  title(ctx, t('c4box'), 10, 18, L.boxTitleW); drawSolid(ctx, e.sim, L.box, now);
  const P = panel(ctx, L.panels[0], { xMin: 0, xMax: 150, yMin: 0, yMax: 60, yTicks: [0, 20, 40, 60], xTicks: [0, 24, 48, 72, 144], xFmt: v => fmt(v, 0), title: t('c4chart'), titleX: L.titleX });
  const known = [...e.meas].filter(([, Lg]) => Lg.t >= 0.5).sort((a, b) => M.perimeter(a[0]) - M.perimeter(b[0]));
  line(ctx, known.map(([k, Lg]) => [P.x(M.perimeter(k)), P.y(Math.min(60, rateOf(Lg).cr))]), C.green, { lw: 1.2, alpha: 0.5 });
  known.forEach(([k, Lg]) => dot(ctx, P.x(M.perimeter(k)), P.y(Math.min(60, rateOf(Lg).cr)), k === piece ? 6 : 4.5, k === piece ? C.orange : C.green));
  const r = rateOf(e.meas.get(piece)), inner = e.sim.sites.reduce((a, q, k) => a + (M.exposed(q) ? 0 : e.sim.hits[k]), 0);
  $('r4').textContent = t('s4readout', { k: (M.SOLID_SIDE / piece) ** 2, s: piece, ex: M.exposedCount(piece), p: M.perimeter(piece), t: fmt(e.meas.get(piece).t, 1), cr: r.cr.toFixed(1), f: pct(r.f), or: r.or.toFixed(2), inner });
}

/* ---------- step 5: real numbers ---------- */
function draw5() {
  const ea = num('ea5'), T = num('t5'), cv = $('c5'), { ctx, W, H } = fitCanvas(cv);
  $('ea5v').textContent = ea + ' kJ/mol'; $('t5v').textContent = `${T} K (${T - 273} °C)`;
  const lg = v => Math.log10(v);
  const P = panel(ctx, { l: 50, r: W - 14, t: 40, b: H - 26 }, { xMin: 273, xMax: 348, yMin: -2, yMax: 3, yTicks: [-2, -1, 0, 1, 2, 3], yFmt: v => (v >= 0 ? fmt(Math.pow(10, v), 0) : Math.pow(10, v).toFixed(-v)), xTicks: W < 420 ? [273, 298, 323, 348] : [273, 283, 298, 308, 323, 348], xFmt: v => fmt(v, 0), title: t('c5') });
  line(ctx, [[P.x(298), P.R.t], [P.x(298), P.R.b]], C.grid, { lw: 1 });
  const rate = [], coll = [];
  for (let v = 273; v <= 348.0001; v += 0.5) { rate.push([P.x(v), P.y(lg(M.rateRatio(ea, 298, v)))]); coll.push([P.x(v), P.y(lg(M.collisionRatio(298, v)))]); }
  clipTo(ctx, P.R); line(ctx, coll, C.ghost, { lw: 1.8 }); line(ctx, rate, C.green, { lw: 2.6 }); ctx.restore();
  line(ctx, [[P.x(T), P.R.t], [P.x(T), P.R.b]], C.orange, { lw: 1.2, dash: [4, 4], alpha: 0.6 });
  dot(ctx, P.x(T), P.y(Math.max(-2, Math.min(3, lg(M.rateRatio(ea, 298, T))))), 6, C.orange);
  const zr = M.collisionRatio(298, T), fr = M.fractionRatio(ea, 298, T);
  $('r5').textContent = t('s5readout', { ea, T, zr: zr.toFixed(3), fr: fr.toPrecision(3), rr: (zr * fr).toPrecision(3), r10: M.rateRatio(ea, 298, 308).toFixed(2), z10: M.collisionRatio(298, 308).toFixed(3) });
  $('s5e').innerHTML = t('s5e', { ea0: M.e0ToKJ(M.E0_DEFAULT).toFixed(1), f50: sci(Math.exp(-50000 / (M.R_GAS * 298))) });
}

/* ---------- shared loop: only visible, unpaused simulations run; nothing runs while the page is hidden ---------- */
const visible = new Set(), DRAW = { s0: draw0, s1: draw1, s2: draw2, s3: draw3, s4: draw4 };
const SECTION = { s0: 'step0', s1: 'step1', s2: 'step2', s3: 'step3', s4: 'step4' };
function advance(key, seconds) { stepEntry(sims[key], Math.round(seconds / M.DT)); }
let raf = null, last = 0;
function loop(nowMs) {
  raf = null;
  if (document.hidden || reduceMotion()) return;
  const dt = Math.min(0.05, (nowMs - (last || nowMs)) / 1000); last = nowMs;
  let busy = false;
  for (const key of Object.keys(DRAW)) {
    const e = sims[key]; if (!e || !e.running || !visible.has(SECTION[key])) continue;
    e.acc += dt; const n = Math.floor(e.acc / M.DT + 1e-9); e.acc -= n * M.DT; stepEntry(e, n);
    DRAW[key](e.wall); busy = true;
  }
  if (busy) raf = requestAnimationFrame(loop); else last = 0;
}
function kick() { if (!raf && !document.hidden && !reduceMotion()) { last = 0; raf = requestAnimationFrame(loop); } }
function pauseLabels() {
  const rm = reduceMotion();
  ['0', '1', '2', '3', '4'].forEach(i => { const e = sims['s' + i]; $('pause' + i).textContent = rm ? t('advance') : t(e.running ? 'pause' : 'resume'); });
}

let quizState = null;
function quizFeedback() {
  if (!quizState) return; const fb = $('quizFeedback');
  fb.textContent = t(quizState === 'none' ? 'quizNone' : quizState === 'correct' ? 'quizRight' : 'quizWrong');
  fb.style.color = quizState === 'correct' ? C.green : C.orange;
}

function refresh() { Object.keys(DRAW).forEach(k => DRAW[k](sims[k].wall)); draw5(); pauseLabels(); quizFeedback(); }

function setup() {
  reset0();
  set1(num('n1'));
  makeEntry('s2', () => M.makeGas({ nA: 30, nB: 30, T: 300, e0: M.E0_DEFAULT, seed: 2 })); set2(num('t2'));
  makeEntry('s3', () => M.makeGas({ nA: 30, nB: 30, T: 300, e0: M.E0_DEFAULT, seed: 3 })); set3(num('e3'));
  set4(num('p4'));

  $('reset0').addEventListener('click', () => { const run = sims.s0.running; reset0(); if (!reduceMotion()) sims.s0.running = run; draw0(sims.s0.wall); pauseLabels(); kick(); });
  ['0', '1', '2', '3', '4'].forEach(i => $('pause' + i).addEventListener('click', () => {
    const key = 's' + i;
    if (reduceMotion()) advance(key, 5); else sims[key].running = !sims[key].running;
    pauseLabels(); DRAW[key](sims[key].wall); kick();
  }));
  $('n1').addEventListener('input', () => { set1(num('n1')); draw1(sims.s1.wall); kick(); });
  $('checkQuiz').addEventListener('click', () => { const c = document.querySelector('input[name="quiz"]:checked'); quizState = !c ? 'none' : c.value === 'b' ? 'correct' : 'wrong'; quizFeedback(); });
  $('t2').addEventListener('input', () => { set2(num('t2')); draw2(sims.s2.wall); kick(); });
  $('e3').addEventListener('input', () => { set3(num('e3')); draw3(sims.s3.wall); kick(); });
  $('noCat').addEventListener('click', () => { $('e3').value = 2; set3(2); draw3(sims.s3.wall); kick(); });
  $('withCat').addEventListener('click', () => { $('e3').value = 1; set3(1); draw3(sims.s3.wall); kick(); });
  $('p4').addEventListener('input', () => { set4(num('p4')); draw4(sims.s4.wall); kick(); });
  ['ea5', 't5'].forEach(id => $(id).addEventListener('input', draw5));

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const nav = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(en.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => nav.observe(s));
    const vis = new IntersectionObserver(es => { es.forEach(en => { if (en.isIntersecting) visible.add(en.target.id); else visible.delete(en.target.id); }); kick(); }, { threshold: 0.05 });
    steps.forEach(s => vis.observe(s));
  } else Object.values(SECTION).forEach(id => visible.add(id));
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; } else kick(); });
  window.refreshRates = refresh;
  refresh(); kick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
