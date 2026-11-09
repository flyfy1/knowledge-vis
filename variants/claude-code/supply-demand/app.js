'use strict';
// Supply & demand lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every line, point, area and readout comes from window.SD_MODEL (model.js).
// Canvas text: axis titles and ticks in fixed rows outside the plot, plus short tags (D, S, E, Pb …)
// placed inside the plot by a small placer that refuses any spot overlapping an earlier tag.
(function () {

const $ = id => document.getElementById(id);
const M = window.SD_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals with trailing zeros trimmed (only after a decimal point); −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/\.?0+$/, '') : s; };
const sgn = (v, d = 2) => (v > 0.5 * Math.pow(10, -d) ? '+' : '') + fmt(v, d);
const B = M.BASE, E0 = M.equilibrium(B);

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

// Single line of text that shrinks until it fits maxW.
function fitText(ctx, text, X, Y, maxW, align = 'left', color = C.muted, size = 12, weight = '') {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

// Plot frame. Y title sits in its own row above the plot, x title in its own row below the tick labels.
function chart(ctx, W, H, o) {
  const P = { l: o.left || 44, r: W - (o.right || 12), t: o.top || 30, b: H - (o.bottom || 42) };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textBaseline = 'alphabetic';
  o.yTicks.forEach(v => {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText((o.fy || fmt)(v), P.l - 6, y(v) + 4);
  });
  o.xTicks.forEach(v => {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillText((o.fx || fmt)(v), x(v), P.b + 16);
  });
  ctx.restore();
  if (o.yTitle) fitText(ctx, o.yTitle, 8, P.t - 12, W - 16, 'left');
  if (o.xTitle) fitText(ctx, o.xTitle, W - 8, P.b + 34, W - 16, 'right');
  const clip = () => { ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t, P.r - P.l, P.b - P.t); ctx.clip(); };
  return { x, y, P, clip, unclip: () => ctx.restore(), tags: tagPlacer(ctx, P) };
}

// Places short tags near an anchor, inside the plot, never overlapping an earlier tag.
function tagPlacer(ctx, P) {
  const boxes = [];
  const hit = b => boxes.some(q => b.x0 < q.x1 + 3 && b.x1 > q.x0 - 3 && b.y0 < q.y1 + 3 && b.y1 > q.y0 - 3);
  return {
    put(text, ax, ay, color, prefs = ['ne', 'se', 'nw', 'sw', 'e', 'w', 'n', 's']) {
      ctx.save(); ctx.font = '600 12px system-ui,sans-serif';
      const w = ctx.measureText(text).width, h = 12;
      for (const d of [7, 13, 22, 34]) for (const p of prefs) {
        const dx = p.includes('e') ? d : p.includes('w') ? -d - w : -w / 2;
        const dy = p.includes('n') ? -d : p.includes('s') ? d + h : h / 2 - 1;
        const X = ax + dx, Y = ay + dy, b = { x0: X - 2, x1: X + w + 2, y0: Y - h, y1: Y + 3 };
        if (b.x0 < P.l + 2 || b.x1 > P.r - 2 || b.y0 < P.t + 2 || b.y1 > P.b - 2 || hit(b)) continue;
        boxes.push(b);
        ctx.fillStyle = 'rgba(13,22,33,0.82)'; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
        ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, X, Y);
        ctx.restore(); return true;
      }
      ctx.restore(); return false; // no free spot: the DOM legend and readout still carry the meaning
    }
  };
}

const marketAxes = (ctx, W, H) => chart(ctx, W, H, { xMin: 0, xMax: M.AX.qMax, yMin: 0, yMax: M.AX.pMax, xTicks: [0, 20, 40, 60, 80, 100], yTicks: [0, 5, 10, 15, 20, 25], yTitle: t('axP'), xTitle: t('axQ'), left: 36 });

function seg(ctx, ch, q0, p0, q1, p1, color, lw = 2.4, dash = null, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(ch.x(q0), ch.y(p0)); ctx.lineTo(ch.x(q1), ch.y(p1)); ctx.stroke(); ctx.restore();
}
// Demand line Q = a − bP for P in [0, choke]; supply Q = c + dP for P from the shut-down price up.
function demandLine(ctx, ch, m, color, opts = {}) { seg(ctx, ch, M.qd(m, 0), 0, 0, M.choke(m), color, opts.lw, opts.dash, opts.alpha); }
function supplyLine(ctx, ch, m, color, opts = {}, lift = 0) { const p0 = M.floorP(m), p1 = M.AX.pMax + 10; seg(ctx, ch, M.qs(m, p0), p0 + lift, M.qs(m, p1), p1 + lift, color, opts.lw, opts.dash, opts.alpha); }
// Tag spot: where the line leaves the top of the chart (or its right end).
function demandTagAt(m) { const P = Math.min(M.choke(m), M.AX.pMax - 1.5); return { q: M.qd(m, P), p: P }; }
function supplyTagAt(m, lift = 0) { const Q = Math.min(M.AX.qMax - 4, m.c + m.d * (M.AX.pMax - 1.5 - lift)); return { q: Q, p: M.pSupplyAt(m, Q) + lift }; }
function dot(ctx, ch, q, p, color, r = 5, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(ch.x(q), ch.y(p), r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function poly(ctx, ch, pts, fill) {
  ctx.save(); ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(([q, p], i) => (i ? ctx.lineTo(ch.x(q), ch.y(p)) : ctx.moveTo(ch.x(q), ch.y(p)))); ctx.closePath(); ctx.fill(); ctx.restore();
}
function curves(ctx, ch, m, opts = {}) {
  ch.clip(); demandLine(ctx, ch, m, C.cyan); supplyLine(ctx, ch, m, C.orange); ch.unclip();
  if (opts.tags !== false) {
    const d = demandTagAt(m), s = supplyTagAt(m);
    ch.tags.put('D', ch.x(d.q), ch.y(d.p), C.cyan, ['e', 'ne', 'se', 'w']);
    ch.tags.put('S', ch.x(s.q), ch.y(s.p), C.orange, ['w', 'nw', 'sw', 'e']);
  }
}

/* ---------- animation runner ---------- */
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

/* ---------- step 0: the price line ---------- */
const s0 = { trail: new Set() };
function draw0() {
  const P = num('p0'); s0.trail.add(P);
  $('p0v').textContent = fmt(P, 1);
  const { ctx, W, H } = fitCanvas($('c0')), ch = marketAxes(ctx, W, H);
  ch.clip();
  s0.trail.forEach(v => { if (v === P) return; const a = M.qd(B, v), b = M.qs(B, v); if (Math.abs(a - b) > 1e-9) seg(ctx, ch, a, v, b, v, a > b ? C.violet : C.pink, 3, null, 0.35); });
  ch.unclip();
  curves(ctx, ch, B);
  const a = M.qd(B, P), b = M.qs(B, P), g = a - b;
  seg(ctx, ch, 0, P, M.AX.qMax, P, C.text, 1.2, [5, 5], 0.7);
  if (Math.abs(g) > 1e-9) seg(ctx, ch, a, P, b, P, g > 0 ? C.violet : C.pink, 5);
  dot(ctx, ch, a, P, C.cyan); dot(ctx, ch, b, P, C.orange);
  ch.tags.put('P = ' + fmt(P, 1), ch.x(0), ch.y(P), C.text, ['ne', 'se']);
  const mid = (a + b) / 2;
  if (Math.abs(g) > 1e-9) ch.tags.put((g > 0 ? '+' : '−') + fmt(Math.abs(g)), ch.x(mid), ch.y(P), g > 0 ? C.violet : C.pink, ['n', 's', 'ne', 'nw']);
  else ch.tags.put('E', ch.x(a), ch.y(P), C.green, ['ne', 'se', 'nw', 'sw']);
  const key = Math.abs(g) < 1e-9 ? 's0eq' : g > 0 ? 's0short' : 's0sur';
  $('r0').textContent = t(key, { P: fmt(P, 1), qd: fmt(a), qs: fmt(b), g: fmt(Math.abs(g)) });
}

/* ---------- step 1: the adjustment rule ---------- */
const N1 = 12;
const s1 = { path: null, shown: 0, ghost: null };
const kindOf = r => (r > 0 ? 'kindMono' : r > -1 + 1e-9 ? 'kindOsc' : Math.abs(r + 1) < 1e-9 ? 'kindEdge' : 'kindDiv');
function draw1() {
  const P0 = num('p1'), k = num('k1'), r = M.adjustFactor(B, k);
  $('p1v').textContent = fmt(P0, 0); $('k1v').textContent = k.toFixed(2);
  const path = s1.path ? s1.path.slice(0, s1.shown + 1) : [P0];
  const Pnow = path[path.length - 1];
  let { ctx, W, H } = fitCanvas($('c1'));
  const ch = marketAxes(ctx, W, H);
  ch.clip(); path.slice(0, -1).forEach(v => seg(ctx, ch, 0, v, M.AX.qMax, v, C.text, 1, null, 0.18)); ch.unclip();
  curves(ctx, ch, B);
  if (Pnow >= 0 && Pnow <= M.AX.pMax) {
    const a = M.qd(B, Pnow), b = M.qs(B, Pnow);
    seg(ctx, ch, 0, Pnow, M.AX.qMax, Pnow, C.text, 1.4, [5, 5], 0.8);
    if (Math.abs(a - b) > 1e-9) seg(ctx, ch, a, Pnow, b, Pnow, a > b ? C.violet : C.pink, 4);
    dot(ctx, ch, a, Pnow, C.cyan, 4.5); dot(ctx, ch, b, Pnow, C.orange, 4.5);
  }
  ({ ctx, W, H } = fitCanvas($('c1b')));
  const tc = chart(ctx, W, H, { xMin: 0, xMax: N1, yMin: 0, yMax: M.AX.pMax, xTicks: [0, 3, 6, 9, 12], yTicks: [0, 5, 10, 15, 20, 25], yTitle: t('axPrice'), xTitle: t('axRound'), left: 34 });
  seg(ctx, tc, 0, E0.P, N1, E0.P, C.text, 1.2, [5, 5], 0.8);
  const line = (pts, col, alpha) => {
    tc.clip(); ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
    pts.forEach((v, i) => (i ? ctx.lineTo(tc.x(i), tc.y(v)) : ctx.moveTo(tc.x(i), tc.y(v)))); ctx.stroke();
    ctx.fillStyle = col; pts.forEach((v, i) => { ctx.beginPath(); ctx.arc(tc.x(i), tc.y(v), 3.5, 0, 7); ctx.fill(); }); ctx.restore(); tc.unclip();
  };
  if (s1.ghost) line(s1.ghost, C.ghost, 0.45);
  line(path, C.text, 1);
  const kind = t(kindOf(r));
  if (!s1.path) { $('r1').textContent = t('s1idle', { k: k.toFixed(2), r: fmt(r) }); return; }
  if (Pnow < 0 || Pnow > M.AX.pMax) { $('r1').textContent = t('s1left', { n: s1.shown, k: k.toFixed(2), r: fmt(r), kind }); return; }
  $('r1').textContent = t('s1readout', { n: s1.shown, N: N1, P: fmt(Pnow), g: sgn(M.gap(B, Pnow)), dev: sgn(Pnow - E0.P, 3), k: k.toFixed(2), r: fmt(r), kind });
}
function reset1() { stopAnim('s1'); if (s1.path) s1.ghost = s1.path.slice(0, s1.shown + 1); s1.path = null; s1.shown = 0; draw1(); }

/* ---------- step 2: shifting curves ---------- */
function draw2() {
  const dA = num('dA2'), dC = num('dC2'), m = M.shifted(B, dA, dC), e = M.equilibrium(m);
  $('dA2v').textContent = sgn(dA, 0); $('dC2v').textContent = sgn(dC, 0);
  const { ctx, W, H } = fitCanvas($('c2')), ch = marketAxes(ctx, W, H);
  ch.clip(); demandLine(ctx, ch, B, C.ghost, { dash: [5, 4], lw: 1.6 }); supplyLine(ctx, ch, B, C.ghost, { dash: [5, 4], lw: 1.6 }); ch.unclip();
  curves(ctx, ch, m, { tags: false });
  const moved = dA !== 0 || dC !== 0;
  if (moved) {
    ctx.save(); ctx.strokeStyle = C.green; ctx.fillStyle = C.green; ctx.lineWidth = 2;
    const x0 = ch.x(E0.Q), y0 = ch.y(E0.P), x1 = ch.x(e.Q), y1 = ch.y(e.P), L = Math.hypot(x1 - x0, y1 - y0);
    if (L > 14) {
      const ux = (x1 - x0) / L, uy = (y1 - y0) / L;
      ctx.beginPath(); ctx.moveTo(x0 + ux * 7, y0 + uy * 7); ctx.lineTo(x1 - ux * 8, y1 - uy * 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - ux * 7, y1 - uy * 7); ctx.lineTo(x1 - ux * 15 - uy * 5, y1 - uy * 15 + ux * 5); ctx.lineTo(x1 - ux * 15 + uy * 5, y1 - uy * 15 - ux * 5); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  dot(ctx, ch, E0.Q, E0.P, C.ghost, 5.5, true);
  dot(ctx, ch, e.Q, e.P, C.green, 5.5);
  const d = demandTagAt(m), s = supplyTagAt(m);
  ch.tags.put(dA ? 'D′' : 'D', ch.x(d.q), ch.y(d.p), C.cyan, ['e', 'ne', 'se', 'w']);
  ch.tags.put(dC ? 'S′' : 'S', ch.x(s.q), ch.y(s.p), C.orange, ['w', 'nw', 'sw', 'e']);
  if (moved) ch.tags.put('E′', ch.x(e.Q), ch.y(e.P), C.green, ['ne', 'se', 'nw', 'sw', 'e', 'w']);
  ch.tags.put('E', ch.x(E0.Q), ch.y(E0.P), C.ghost, moved ? ['sw', 'nw', 'se', 'ne', 'w', 'e'] : ['ne', 'se', 'nw', 'sw']);
  $('r2').textContent = t('s2readout', { P: fmt(e.P), Q: fmt(e.Q), dP: sgn(e.P - E0.P), dQ: sgn(e.Q - E0.Q) });
}

/* ---------- step 3: elasticity ---------- */
const CUT = 20; // supply falls by 20 hundred cups at every price
const s3 = { tried: new Set([4]) };
function shock(b) {
  const m = M.pivotDemand(B, b), m2 = M.shifted(m, 0, -CUT), e2 = M.equilibrium(m2);
  const dP = e2.P - E0.P, dQ = E0.Q - e2.Q;
  return { m, m2, e2, dP, dQ, pp: dP / E0.P * 100, qp: dQ / E0.Q * 100, eps: Math.abs(M.elasticityD(m, E0.P, E0.Q)) };
}
const kindEps = e => (Math.abs(e - 1) < 1e-9 ? 'unit' : e > 1 ? 'elastic' : 'inelastic');
function draw3() {
  const b = num('b3'), r = shock(b); s3.tried.add(b);
  $('b3v').textContent = String(b);
  let { ctx, W, H } = fitCanvas($('c3'));
  const ch = marketAxes(ctx, W, H);
  ch.clip(); supplyLine(ctx, ch, B, C.ghost, { dash: [5, 4], lw: 1.6 }); demandLine(ctx, ch, r.m, C.cyan); supplyLine(ctx, ch, r.m2, C.orange); ch.unclip();
  seg(ctx, ch, 0, r.e2.P, r.e2.Q, r.e2.P, C.text, 1, [3, 4], 0.6); seg(ctx, ch, r.e2.Q, 0, r.e2.Q, r.e2.P, C.text, 1, [3, 4], 0.6);
  dot(ctx, ch, E0.Q, E0.P, C.ghost, 5.5, true); dot(ctx, ch, r.e2.Q, r.e2.P, C.green, 5.5);
  const d = demandTagAt(r.m), s = supplyTagAt(r.m2);
  ch.tags.put('D', ch.x(d.q), ch.y(d.p), C.cyan, ['e', 'ne', 'se', 'w']);
  ch.tags.put('S′', ch.x(s.q), ch.y(s.p), C.orange, ['w', 'nw', 'sw', 'e']);
  ch.tags.put('E′', ch.x(r.e2.Q), ch.y(r.e2.P), C.green, ['nw', 'ne', 'sw', 'se', 'w', 'e']);
  ch.tags.put('E', ch.x(E0.Q), ch.y(E0.P), C.ghost, ['se', 'sw', 'e', 'ne', 's']);

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const pc = chart(ctx, W, H, { xMin: 0, xMax: 4, yMin: 0, yMax: 30, xTicks: [0, 1, 2, 3, 4], yTicks: [0, 10, 20, 30], yTitle: t('axPct'), xTitle: t('axEps'), left: 34 });
  pc.clip(); ctx.save(); ctx.lineWidth = 1.8;
  [['pp', C.orange], ['qp', C.cyan]].forEach(([key, col]) => {
    ctx.strokeStyle = col; ctx.globalAlpha = 0.55; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const e = 0.05 + 3.95 * i / 200, bb = e * E0.Q / E0.P, q = shock(bb)[key]; if (!i) ctx.moveTo(pc.x(e), pc.y(q)); else ctx.lineTo(pc.x(e), pc.y(q)); }
    ctx.stroke();
  });
  ctx.restore(); pc.unclip();
  seg(ctx, pc, r.eps, 0, r.eps, 30, C.text, 1, [3, 4], 0.5);
  s3.tried.forEach(bb => { const q = shock(bb), cur = bb === b; dot(ctx, pc, q.eps, q.pp, C.orange, cur ? 5.5 : 3.5); dot(ctx, pc, q.eps, q.qp, C.cyan, cur ? 5.5 : 3.5); });
  $('r3').textContent = t('s3readout', { b, e: r.eps.toFixed(2), kind: t(kindEps(r.eps)), dP: fmt(r.dP), pp: r.pp.toFixed(1), dQ: fmt(r.dQ), qp: r.qp.toFixed(1) });
}

/* ---------- step 4: the tax wedge ---------- */
const s4 = { tried: new Set([4]) };
function draw4() {
  const tx = num('t4'), b = num('b4'), m = M.pivotDemand(B, b), r = M.policy(m, tx); s4.tried.add(b);
  $('t4v').textContent = fmt(tx, 1); $('b4v').textContent = String(b);
  let { ctx, W, H } = fitCanvas($('c4'));
  const ch = marketAxes(ctx, W, H);
  ch.clip(); demandLine(ctx, ch, m, C.cyan); supplyLine(ctx, ch, m, C.orange); if (tx > 0) supplyLine(ctx, ch, m, C.orange, { dash: [6, 4], lw: 1.8 }, tx); ch.unclip();
  const d = demandTagAt(m), s = supplyTagAt(m);
  ch.tags.put('D', ch.x(d.q), ch.y(d.p), C.cyan, ['e', 'ne', 'se', 'w']);
  ch.tags.put('S', ch.x(s.q), ch.y(s.p), C.orange, ['w', 'nw', 'sw', 'e']);
  if (tx > 0) { const s2 = supplyTagAt(m, tx); ch.tags.put('S + t', ch.x(s2.q), ch.y(s2.p), C.orange, ['w', 'nw', 'sw']); }
  dot(ctx, ch, E0.Q, E0.P, C.ghost, 4.5, true);
  if (tx > 0) {
    seg(ctx, ch, 0, r.Pb, r.Q, r.Pb, C.cyan, 1, [3, 4], 0.7); seg(ctx, ch, 0, r.Ps, r.Q, r.Ps, C.green, 1, [3, 4], 0.7);
    seg(ctx, ch, r.Q, r.Ps, r.Q, r.Pb, C.text, 4);
    dot(ctx, ch, r.Q, r.Pb, C.cyan, 5); dot(ctx, ch, r.Q, r.Ps, C.green, 5);
    ch.tags.put('Pb', ch.x(r.Q), ch.y(r.Pb), C.cyan, ['ne', 'e', 'nw', 'n']);
    ch.tags.put('Ps', ch.x(r.Q), ch.y(r.Ps), C.green, ['se', 'e', 'sw', 's']);
  }
  ({ ctx, W, H } = fitCanvas($('c4b')));
  // top: the split of t into the buyers' and the cafés' part (fixed rows: title, bar, two numbers)
  fitText(ctx, t('barTitle'), 8, 18, W - 16, 'left', C.text, 12, '600');
  const L = 10, R = W - 10, up = r.Pb - E0.P, down = E0.P - r.Ps;
  ctx.fillStyle = '#1b2838'; ctx.fillRect(L, 28, R - L, 22);
  if (tx > 0) { const xm = L + (R - L) * up / tx; ctx.fillStyle = C.cyan; ctx.fillRect(L, 28, xm - L, 22); ctx.fillStyle = C.green; ctx.fillRect(xm, 28, R - xm, 22); }
  fitText(ctx, `${t('s4lgB')}  ${fmt(up)}`, L, 68, (R - L) / 2 - 6, 'left', C.cyan, 12);
  fitText(ctx, `${t('s4lgS')}  ${fmt(down)}`, R, 68, (R - L) / 2 - 6, 'right', C.green, 12);
  // bottom: buyers' share against |εd|, dots at the slopes tried
  const sc = chart(ctx, W, H, { top: 112, xMin: 0, xMax: 4, yMin: 0, yMax: 1, xTicks: [0, 1, 2, 3, 4], yTicks: [0, 0.5, 1], fy: v => Math.round(v * 100) + '%', yTitle: t('shareTitle'), xTitle: t('axEps'), left: 40 });
  sc.clip(); ctx.save(); ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.8; ctx.beginPath();
  const es = M.elasticityS(B, E0.P, E0.Q);
  for (let i = 0; i <= 200; i++) { const e = 4 * i / 200, f = es / (es + e); if (!i) ctx.moveTo(sc.x(e), sc.y(f)); else ctx.lineTo(sc.x(e), sc.y(f)); }
  ctx.stroke(); ctx.restore(); sc.unclip();
  s4.tried.forEach(bb => { const mm = M.pivotDemand(B, bb), e = Math.abs(M.elasticityD(mm, E0.P, E0.Q)); dot(ctx, sc, e, M.buyerShare(mm), C.cyan, bb === b ? 5.5 : 3.5); });
  const eps = Math.abs(M.elasticityD(m, E0.P, E0.Q)), f = es / (es + eps);
  if (tx <= 0) { $('r4').textContent = t('s4zero'); return; }
  $('r4').textContent = t('s4readout', { t: fmt(tx, 1), b, Pb: fmt(r.Pb), up: fmt(up), Ps: fmt(r.Ps), down: fmt(down), Q: fmt(r.Q), sh: (up / tx * 100).toFixed(1), f: (f * 100).toFixed(1) });
}

/* ---------- step 5: surplus and deadweight loss ---------- */
const s5 = { tried: new Set([0]) };
function draw5() {
  const tx = num('t5'), S = M.surplus(B, tx); s5.tried.add(tx);
  $('t5v').textContent = fmt(tx, 1);
  let { ctx, W, H } = fitCanvas($('c5'));
  const ch = marketAxes(ctx, W, H), ch0 = M.choke(B), fl = M.floorP(B);
  ch.clip();
  poly(ctx, ch, [[0, ch0], [0, S.Pb], [S.Q, S.Pb]], 'rgba(103,215,249,0.32)');
  poly(ctx, ch, [[0, fl], [0, S.Ps], [S.Q, S.Ps]], 'rgba(126,226,168,0.30)');
  if (tx > 0) poly(ctx, ch, [[0, S.Ps], [S.Q, S.Ps], [S.Q, S.Pb], [0, S.Pb]], 'rgba(255,180,84,0.42)');
  if (tx < 0) {
    poly(ctx, ch, [[0, S.Pb], [S.Q, S.Pb], [S.Q, S.Ps], [0, S.Ps]], 'rgba(183,156,255,0.22)');
    ctx.save(); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.strokeRect(ch.x(0), ch.y(S.Ps), ch.x(S.Q) - ch.x(0), ch.y(S.Pb) - ch.y(S.Ps)); ctx.restore();
  }
  if (tx !== 0) poly(ctx, ch, [[E0.Q, E0.P], [S.Q, S.Pb], [S.Q, S.Ps]], 'rgba(255,122,147,0.75)');
  ch.unclip();
  curves(ctx, ch, B);
  if (tx !== 0) { dot(ctx, ch, S.Q, S.Pb, C.cyan, 4); dot(ctx, ch, S.Q, S.Ps, C.green, 4); }
  dot(ctx, ch, E0.Q, E0.P, C.text, 4, true);

  ({ ctx, W, H } = fitCanvas($('c5b')));
  const dc = chart(ctx, W, H, { xMin: -6, xMax: 10, yMin: 0, yMax: 130, xTicks: [-6, -3, 0, 3, 6, 10], yTicks: [0, 40, 80, 120], yTitle: t('axDWL'), xTitle: t('axT'), left: 34 });
  dc.clip(); ctx.save(); ctx.strokeStyle = C.pink; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.8; ctx.beginPath();
  for (let i = 0; i <= 160; i++) { const v = -6 + 16 * i / 160, y = M.dwlFormula(B, v); if (!i) ctx.moveTo(dc.x(v), dc.y(y)); else ctx.lineTo(dc.x(v), dc.y(y)); }
  ctx.stroke(); ctx.restore(); dc.unclip();
  s5.tried.forEach(v => dot(ctx, dc, v, M.surplus(B, v).DWL, v === tx ? C.pink : C.text, v === tx ? 5.5 : 3.5));
  const govLabel = t(tx > 0 ? 'govTax' : tx < 0 ? 'govSub' : 'govNone');
  $('r5').textContent = t('s5readout', { t: fmt(tx, 1), Q: fmt(S.Q), cs: fmt(S.CS), ps: fmt(S.PS), govLabel, gov: fmt(tx < 0 ? -S.gov : S.gov), w: fmt(S.W), w0: fmt(S.W0), dwl: fmt(S.DWL), f: fmt(M.dwlFormula(B, tx)) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('p0').addEventListener('input', draw0);
  $('clear0').addEventListener('click', () => { s0.trail.clear(); draw0(); });

  ['p1', 'k1'].forEach(id => $(id).addEventListener('input', reset1));
  $('run1').addEventListener('click', () => {
    if (s1.path) s1.ghost = s1.path.slice(0, s1.shown + 1);
    s1.path = M.adjustPath(B, num('p1'), num('k1'), N1); s1.shown = 0; draw1();
    const last = s1.path.length - 1;
    animate('s1', last * 420, p => { s1.shown = Math.min(last, Math.floor(p * last + 1e-9)); draw1(); });
  });
  $('clear1').addEventListener('click', () => { stopAnim('s1'); s1.path = null; s1.shown = 0; s1.ghost = null; draw1(); });

  ['dA2', 'dC2'].forEach(id => $(id).addEventListener('input', draw2));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('b3').addEventListener('input', draw3);
  $('clear3').addEventListener('click', () => { s3.tried = new Set([num('b3')]); draw3(); });
  ['t4', 'b4'].forEach(id => $(id).addEventListener('input', draw4));
  $('t5').addEventListener('input', draw5);
  $('clear5').addEventListener('click', () => { s5.tried = new Set([num('t5')]); draw5(); });

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
  window.refreshLesson = () => {
    refresh();
    const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state === 'correct' ? 'correct' : 'wrong');
  };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
