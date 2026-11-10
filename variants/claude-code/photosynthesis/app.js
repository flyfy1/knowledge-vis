'use strict';
// Photosynthesis (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, mass, rate and daily total comes from window.PHOTO_MODEL (model.js).
// Canvas text is limited to panel titles, axis ticks and one caption row under bar groups.
(function () {

const $ = id => document.getElementById(id);
const M = window.PHOTO_MODEL;
const t = (...a) => window.PHOTO_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#ffd166', blue: '#4f8fd6', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', water: '#173a5c', leaf: '#3fae5f', el: { C: '#9aa4b1', H: '#e8edf4', O: '#ff7a93' }, sugarC: '#ffb454', sugarW: '#ffe3b0', co2: '#8f7fd1', h2o: '#4f8fd6', o2: '#67d7f9' };
const RUNCOL = ['#ffb454', '#7ee2a8', '#b79cff', '#ff7a93'];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };

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
function label(ctx, text, X, Y, maxW, { align = 'left', size = 12, weight = 600, color = C.text } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
// Plot panel: title in its own row above; y ticks left; x ticks below.
function panel(ctx, W, o) {
  const P = { l: o.left || 38, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4); }
  if (o.xTicks) { ctx.textAlign = 'center'; for (const v of o.xTicks) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(String(v), x(v), P.b + 15); } }
  ctx.restore();
  if (o.title) label(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
const xTicksFor = (W, wide, narrow) => (W < 360 ? narrow : wide);
function line(ctx, pts, color, width = 2, dash = null) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash); ctx.beginPath(); pts.forEach(([X, Y], i) => ctx[i ? 'lineTo' : 'moveTo'](X, Y)); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, color, ring) { ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = color; ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 1.5; ctx.stroke(); } }

/* ---------- animation runner (reduced motion → end state; hidden → finish) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: pondweed under a lamp ---------- */
const s0 = { off: false, splint: null, bubbles: [], last: 0, acc: 0, raf: 0, visible: false };
function light0() { return s0.off ? 0 : M.lightFromDistance(num('d0')); }
function rate0() { return M.bubbles(light0(), M.RATE.airCO2); }
function geom0(W, H) {
  const bw = Math.min(130, W * 0.32), bx = W - bw - 14, top = 64, floor = H - 34;
  const pxPerCm = (bx - 46) / 100, lampX = bx - num('d0') * pxPerCm;
  const tubeX = bx + bw / 2, tubeTop = 40, tubeBot = top + 92;
  return { bw, bx, top, floor, pxPerCm, lampX, tubeX, tubeTop, tubeBot, lampY: top + 70 };
}
function draw0() {
  const d = num('d0'), I = light0(), b = rate0();
  $('d0v').textContent = d + ' cm';
  $('lamp0').textContent = t(s0.off ? 'lampOn' : 'lampOff'); $('lamp0').setAttribute('aria-pressed', s0.off ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c0')), G = geom0(W, H);
  label(ctx, s0.off ? t('c0titleOff') : t('c0title', { d, I: fmt(I, 0) }), 8, 17, W - 16);
  // light cone
  if (I > 0) {
    const g = ctx.createLinearGradient(G.lampX, 0, G.bx + G.bw, 0); const a = 0.08 + 0.32 * Math.min(1, I / 100);
    g.addColorStop(0, `rgba(255,214,102,${a})`); g.addColorStop(1, `rgba(255,214,102,${a * 0.35})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(G.lampX + 10, G.lampY - 8); ctx.lineTo(G.bx + G.bw, G.top + 10); ctx.lineTo(G.bx + G.bw, G.floor - 4); ctx.lineTo(G.lampX + 10, G.lampY + 8); ctx.closePath(); ctx.fill();
  }
  // lamp: stand, shade, bulb
  ctx.strokeStyle = '#8796a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(G.lampX - 12, G.floor); ctx.lineTo(G.lampX - 12, G.lampY); ctx.lineTo(G.lampX, G.lampY); ctx.stroke();
  ctx.fillStyle = '#5c6b7d'; ctx.beginPath(); ctx.moveTo(G.lampX - 4, G.lampY - 16); ctx.lineTo(G.lampX + 12, G.lampY - 22); ctx.lineTo(G.lampX + 12, G.lampY + 22); ctx.lineTo(G.lampX - 4, G.lampY + 16); ctx.closePath(); ctx.fill();
  dot(ctx, G.lampX + 13, G.lampY, 7, I > 0 ? C.yellow : '#3a4656');
  ctx.fillStyle = '#5c6b7d'; ctx.fillRect(G.lampX - 26, G.floor - 4, 28, 4);
  // distance ruler
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(G.lampX + 13, G.floor + 14); ctx.lineTo(G.bx, G.floor + 14); ctx.stroke(); ctx.setLineDash([]);
  for (const X of [G.lampX + 13, G.bx]) { ctx.beginPath(); ctx.moveTo(X, G.floor + 9); ctx.lineTo(X, G.floor + 19); ctx.stroke(); }
  // beaker with water
  ctx.fillStyle = C.water; ctx.fillRect(G.bx, G.top + 14, G.bw, G.floor - G.top - 14);
  ctx.strokeStyle = '#a9c3dc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(G.bx, G.top); ctx.lineTo(G.bx, G.floor); ctx.lineTo(G.bx + G.bw, G.floor); ctx.lineTo(G.bx + G.bw, G.top); ctx.stroke();
  // pondweed
  ctx.strokeStyle = C.leaf; ctx.lineWidth = 2.5;
  const stems = [-0.22, 0, 0.2].map(f => G.tubeX + f * G.bw);
  stems.forEach((sx, i) => {
    ctx.beginPath(); ctx.moveTo(sx, G.floor - 2); ctx.quadraticCurveTo(sx + (i - 1) * 10, (G.floor + G.tubeBot) / 2, G.tubeX + (i - 1) * 5, G.tubeBot + 16); ctx.stroke();
    for (let k = 1; k <= 5; k++) {
      const yy = G.floor - 2 - k * (G.floor - G.tubeBot - 20) / 6, xx = sx + ((i - 1) * 10) * (k / 6) * 0.6;
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 9, yy - 6); ctx.moveTo(xx, yy); ctx.lineTo(xx + 9, yy - 6); ctx.stroke();
    }
  });
  // inverted test tube with collected gas (steady-state level grows with the bubble rate)
  const tw = 22, gasFrac = Math.min(0.8, b / 18);
  ctx.fillStyle = 'rgba(103,215,249,0.12)'; ctx.fillRect(G.tubeX - tw / 2, G.tubeTop, tw, G.tubeBot - G.tubeTop);
  ctx.fillStyle = C.water; ctx.fillRect(G.tubeX - tw / 2, G.tubeTop + (G.tubeBot - G.tubeTop) * gasFrac, tw, (G.tubeBot - G.tubeTop) * (1 - gasFrac));
  ctx.strokeStyle = '#a9c3dc'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(G.tubeX - tw / 2, G.tubeBot); ctx.lineTo(G.tubeX - tw / 2, G.tubeTop + 8); ctx.arc(G.tubeX, G.tubeTop + 8, tw / 2, Math.PI, 0); ctx.lineTo(G.tubeX + tw / 2, G.tubeBot); ctx.stroke();
  // bubbles
  ctx.fillStyle = 'rgba(232,240,250,0.85)';
  if (reduceMotion()) {
    const n = Math.round(b / 2);
    for (let k = 0; k < n; k++) { const f = (k + 0.5) / n; dot(ctx, G.tubeX + Math.sin(k * 2.1) * 6, G.floor - 30 - f * (G.floor - 30 - G.tubeBot), 2.6, 'rgba(232,240,250,0.85)'); }
  } else s0.bubbles.forEach(p => dot(ctx, p.x, p.y, 2.6, 'rgba(232,240,250,0.85)'));
  // splint
  if (s0.splint) {
    const sx = G.tubeX - tw / 2 - 30, sy = G.tubeTop + 4;
    ctx.strokeStyle = '#b08a5a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx - 26, sy - 14); ctx.lineTo(sx, sy); ctx.stroke();
    if (s0.splint === 'yes') { ctx.fillStyle = C.orange; ctx.beginPath(); ctx.ellipse(sx + 3, sy - 4, 5, 9, 0.5, 0, 7); ctx.fill(); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.ellipse(sx + 3, sy - 2, 2.5, 5, 0.5, 0, 7); ctx.fill(); }
    else dot(ctx, sx, sy, 2.5, '#d9603b');
  }
  let text = s0.off ? t('s0dark') : t('s0readout', { d, I: fmt(I, 0), b });
  if (s0.splint) text += ' ' + t(s0.splint === 'yes' ? 'splintYes' : 'splintNo');
  $('r0').innerHTML = text;
}
function loop0(now) {
  if (!s0.visible || document.hidden || reduceMotion()) { s0.raf = 0; return; }
  const dt = Math.min(0.05, (now - (s0.last || now)) / 1000); s0.last = now;
  const c = $('c0'), W = c.clientWidth || 600, H = Number(c.dataset.h || 340), G = geom0(W, H);
  s0.acc += rate0() / 4 * dt;                // teaching speed: one simulated minute every 4 s
  while (s0.acc >= 1) { s0.acc -= 1; s0.bubbles.push({ x: G.tubeX + (Math.random() - 0.5) * G.bw * 0.4, y: G.floor - 30 - Math.random() * 40 }); }
  s0.bubbles.forEach(p => { p.y -= 55 * dt; p.x += (G.tubeX - p.x) * 0.6 * dt; });
  s0.bubbles = s0.bubbles.filter(p => p.y > G.tubeBot);
  draw0();
  s0.raf = requestAnimationFrame(loop0);
}
function start0() { if (!s0.raf && s0.visible && !document.hidden && !reduceMotion()) { s0.last = 0; s0.raf = requestAnimationFrame(loop0); } }

/* ---------- step 1: atom ledger ---------- */
function draw1() {
  const a = num('a1'), b = num('b1'), d = num('d1'), L = M.ledger(a, b, d);
  $('a1v').textContent = a; $('b1v').textContent = b; $('d1v').textContent = d;
  $('eq1').innerHTML = `<b>${a}</b> CO₂ + <b>${b}</b> H₂O <span class="arrow">—${t('eqLight')}→</span> 1 C₆H₁₂O₆ + <b>${d}</b> O₂`;
  $('eq1').classList.toggle('ok', L.balanced);
  const { ctx, W, H } = fitCanvas($('c1'));
  label(ctx, t('c1title'), 8, 17, W - 16);
  const els = ["C", "H", "O"], gw = (W - 16) / 3, base = H - 30, cols = W < 500 ? 3 : 4;
  els.forEach((el, gi) => {
    const gx = 8 + gi * gw, barW = Math.min(64, gw * 0.36), sp = barW / cols, r = Math.max(2.2, Math.min(5, sp * 0.36));
    const maxRows = Math.floor((base - 34) / sp);
    [[L.left[el], gx + gw / 2 - barW - 5, 'rgba(255,255,255,0.05)'], [L.right[el], gx + gw / 2 + 5, 'rgba(103,215,249,0.07)']].forEach(([n, x0, bg], side) => {
      ctx.fillStyle = bg; ctx.fillRect(x0, 30, barW, base - 30);
      for (let k = 0; k < n; k++) {
        const row = Math.floor(k / cols), col = k % cols;
        if (row >= maxRows) break;
        dot(ctx, x0 + sp * (col + 0.5), base - sp * (row + 0.5), r, C.el[el], el === 'H' ? null : null);
      }
      if (side === 0) ctx.fillStyle = C.muted;
    });
    // match marker: a bar across both columns at the taller height; green when equal
    const hl = Math.ceil(L.left[el] / cols) * sp, hr = Math.ceil(L.right[el] / cols) * sp, eq = L.left[el] === L.right[el];
    ctx.strokeStyle = eq ? C.green : C.orange; ctx.lineWidth = 2; ctx.setLineDash(eq ? [] : [4, 3]);
    ctx.beginPath(); ctx.moveTo(gx + gw / 2 - barW - 7, base - hl); ctx.lineTo(gx + gw / 2 - 3, base - hl); ctx.moveTo(gx + gw / 2 + 3, base - hr); ctx.lineTo(gx + gw / 2 + barW + 7, base - hr); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, el + (eq ? ' ✓' : ''), gx + gw / 2, H - 10, gw - 8, { align: 'center', size: 13, weight: 700, color: eq ? C.green : C.text });
  });
  const bad = ['C', 'H', 'O'].filter(el => L.left[el] !== L.right[el]).map(el => t('el' + el)).join(t('s1sep'));
  $('r1').textContent = t('s1readout', { lc: L.left.C, rc: L.right.C, lh: L.left.H, rh: L.right.H, lo: L.left.O, ro: L.right.O, verdict: L.balanced ? t('s1ok') : t('s1no', { bad }) });
}

/* ---------- step 2: mass ledger ---------- */
const s2 = { fb: '', state: '' };
function draw2() {
  const m = num('m2'), B = M.massBook(m);
  $('m2v').textContent = m + ' g';
  const { ctx, W, H } = fitCanvas($('c2'));
  const yMax = 2000, A = panel(ctx, W, { top: 26, bottom: H - 30, xMin: 0, xMax: 1, yMin: 0, yMax, yTicks: [0, 500, 1000, 1500, 2000], left: 44, title: t('c2a') + ' · ' + t('c2unit') });
  const bw = Math.min(120, (A.P.r - A.P.l) * 0.3), xs = [A.P.l + (A.P.r - A.P.l) * 0.3 - bw / 2, A.P.l + (A.P.r - A.P.l) * 0.72 - bw / 2];
  const stack = (x0, parts) => { let acc = 0; parts.forEach(([v, col]) => { const y0 = A.y(acc), y1 = A.y(acc + v); ctx.fillStyle = col; ctx.fillRect(x0, y1, bw, y0 - y1); ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(x0, y1, bw, y0 - y1); acc += v; }); return acc; };
  const tin = stack(xs[0], [[B.co2, C.co2], [B.water, C.h2o]]);
  const tout = stack(xs[1], [[B.fromCO2, C.sugarC], [B.fromWater, C.sugarW], [B.o2, C.o2]]);
  // equal-height guide
  ctx.save(); ctx.strokeStyle = C.green; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xs[0] - 6, A.y(tin)); ctx.lineTo(xs[1] + bw + 6, A.y(tout)); ctx.stroke(); ctx.restore();
  label(ctx, t('c2in'), xs[0] + bw / 2, H - 10, bw + 20, { align: 'center', weight: 600, color: C.muted });
  label(ctx, t('c2out'), xs[1] + bw / 2, H - 10, bw + 20, { align: 'center', weight: 600, color: C.muted });
  $('r2').textContent = t('s2readout', { m, co2: fmt(B.co2, 1), w: fmt(B.water, 1), o2: fmt(B.o2, 1), tot: fmt(B.co2 + B.water, 1), fc: fmt(B.fromCO2, 1), fw: fmt(B.fromWater, 1), share: fmt(B.shareCO2 * 100, 1) });
  $('fb2').textContent = s2.fb; $('fb2').style.color = s2.state === 'correct' ? C.green : C.orange;
}

/* ---------- step 3: light curve ---------- */
const s3 = { tried: new Set([30]) };
function draw3() {
  const I = num('i3'), r = M.rate(I, M.RATE.airCO2), b = M.bubbles(I, M.RATE.airCO2);
  $('i3v').textContent = I + '%';
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: H - 46, xMin: 0, xMax: 100, yMin: -2, yMax: 7, yTicks: [-2, 0, 2, 4, 6], xTicks: xTicksFor(W, [0, 20, 40, 60, 80, 100], [0, 50, 100]), title: t('c3title') });
  label(ctx, t('c3x'), (A.P.l + A.P.r) / 2, H - 8, A.P.r - A.P.l, { align: 'center', weight: 500, size: 11, color: C.muted });
  // loss zone tint
  ctx.fillStyle = 'rgba(255,122,147,0.06)'; ctx.fillRect(A.P.l, A.y(0), A.P.r - A.P.l, A.y(-2) - A.y(0));
  const xs = Array.from({ length: 201 }, (_, i) => i / 2);
  line(ctx, xs.map(v => [A.x(v), A.y(M.rate(v, M.RATE.airCO2).gross)]), C.cyan, 2.5);
  line(ctx, [[A.x(0), A.y(M.RATE.resp)], [A.x(100), A.y(M.RATE.resp)]], C.pink, 1.5, [6, 4]);
  line(ctx, xs.map(v => [A.x(v), A.y(M.rate(v, M.RATE.airCO2).net)]), C.green, 2.5);
  s3.tried.forEach(v => dot(ctx, A.x(v), A.y(M.rate(v, M.RATE.airCO2).gross), 3.2, C.text));
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(I), A.P.t); ctx.lineTo(A.x(I), A.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, A.x(I), A.y(r.gross), 6, C.cyan, C.bg); dot(ctx, A.x(I), A.y(r.net), 6, C.green, C.bg);
  const Ic = M.compensationLight(M.RATE.airCO2), Is = M.saturationLight(M.RATE.airCO2);
  const state = Math.abs(r.net) < 1e-9 ? t('st_comp', { Ic: fmt(Ic, 1) }) : r.net < 0 ? t('st_dark') : r.limit === 'light' ? t('st_rise') : t('st_sat', { Is: fmt(Is, 0) });
  $('r3').textContent = t('s3readout', { I, g: fmt(r.gross), r: fmt(r.resp), n: fmt(r.net), state, b });
}

/* ---------- step 4: two planks ---------- */
function draw4() {
  const I = num('i4'), Cc = num('c4s'), r = M.rate(I, Cc), mg = M.marginal(I, Cc);
  $('i4v').textContent = I + '%'; $('c4v').textContent = Cc + ' ppm';
  {
    const { ctx, W, H } = fitCanvas($('c4'));
    const A = panel(ctx, W, { top: 30, bottom: H - 46, xMin: 0, xMax: 100, yMin: 0, yMax: 18, yTicks: [0, 6, 12, 18], xTicks: xTicksFor(W, [0, 20, 40, 60, 80, 100], [0, 50, 100]), title: t('c4title') });
    label(ctx, t('c3x'), (A.P.l + A.P.r) / 2, H - 8, A.P.r - A.P.l, { align: 'center', weight: 500, size: 11, color: C.muted });
    const xs = Array.from({ length: 101 }, (_, i) => i);
    for (const c of [200, 420, 1000]) line(ctx, xs.map(v => [A.x(v), A.y(M.rate(v, c).gross)]), '#5d6f85', 1.2, [4, 3]);
    // the two planks as lines: light term (diagonal) and CO2 term (flat); the rate is the lower of the two
    line(ctx, xs.filter(v => M.lightTerm(v) <= 18).map(v => [A.x(v), A.y(M.lightTerm(v))]), C.yellow, 1.5);
    const kY = Math.min(18, M.co2Term(Cc)); line(ctx, [[A.x(0), A.y(kY)], [A.x(100), A.y(kY)]], C.violet, 1.5);
    line(ctx, xs.map(v => [A.x(v), A.y(M.rate(v, Cc).gross)]), C.cyan, 3);
    dot(ctx, A.x(I), A.y(r.gross), 6, C.cyan, C.bg);
  }
  {
    const { ctx, W, H } = fitCanvas($('c4b'));
    const A = panel(ctx, W, { top: 30, bottom: H - 30, xMin: 0, xMax: 1, yMin: 0, yMax: 18, yTicks: [0, 6, 12, 18], title: t('c4btitle') });
    const span = A.P.r - A.P.l, pw = Math.min(46, span * 0.22), x1 = A.P.l + span * 0.3 - pw / 2, x2 = A.P.l + span * 0.7 - pw / 2;
    // water between the planks, up to the shorter one
    ctx.fillStyle = 'rgba(103,215,249,0.35)'; ctx.fillRect(x1 + pw, A.y(r.gross), x2 - x1 - pw, A.P.b - A.y(r.gross));
    line(ctx, [[x1 + pw, A.y(r.gross)], [x2, A.y(r.gross)]], C.cyan, 2.5);
    ctx.fillStyle = C.yellow; ctx.fillRect(x1, A.y(r.L), pw, A.P.b - A.y(r.L));
    ctx.fillStyle = C.violet; ctx.fillRect(x2, A.y(Math.min(18, r.K)), pw, A.P.b - A.y(Math.min(18, r.K)));
    const short = r.limit === 'light' ? x1 : r.limit === 'co2' ? x2 : null;
    if (short !== null) { ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.strokeRect(short - 2, A.y(Math.min(18, Math.min(r.L, r.K))) - 2, pw + 4, A.P.b - A.y(Math.min(18, Math.min(r.L, r.K))) + 2); }
    label(ctx, '☀', x1 + pw / 2, H - 9, pw + 10, { align: 'center', size: 13, color: C.yellow });
    label(ctx, 'CO₂', x2 + pw / 2, H - 9, pw + 16, { align: 'center', size: 12, color: C.violet });
  }
  const who = r.limit === 'light' ? t('who_light') : r.limit === 'co2' ? t('who_co2') : t('who_both');
  $('r4').textContent = t('s4readout', { L: fmt(r.L), K: fmt(r.K), g: fmt(r.gross), who, dl: fmt(mg.light), dc: fmt(mg.co2) });
}

/* ---------- step 5: a day ---------- */
const s5 = { runs: [], cur: null, h: 24 };
const radio = name => document.querySelector(`input[name="${name}"]:checked`).value;
function scenario5() { const cloud = radio('sky5') === 'cloud', co2 = Number(radio('co25')); return { cloud, co2, res: M.day(co2, cloud) }; }
function draw5() {
  const sc = s5.cur || scenario5(), h = s5.cur ? s5.h : 24;
  const { ctx, W, H } = fitCanvas($('c5'));
  const xt = xTicksFor(W, [0, 6, 12, 18, 24], [0, 12, 24]);
  const top = panel(ctx, W, { top: 28, bottom: 128, xMin: 0, xMax: 24, yMin: 0, yMax: 100, yTicks: [0, 50, 100], xTicks: xt, title: t('c5top') });
  const bot = panel(ctx, W, { top: 176, bottom: H - 44, xMin: 0, xMax: 24, yMin: -10, yMax: 80, yTicks: [0, 20, 40, 60, 80], xTicks: xt, title: t('c5bot') });
  label(ctx, t('c5x'), (bot.P.l + bot.P.r) / 2, H - 8, bot.P.r - bot.P.l, { align: 'center', weight: 500, size: 11, color: C.muted });
  // night shading in both panels
  for (const A of [top, bot]) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(A.x(0), A.P.t, A.x(6) - A.x(0), A.P.b - A.P.t); ctx.fillRect(A.x(18), A.P.t, A.x(24) - A.x(18), A.P.b - A.P.t); }
  s5.runs.forEach((run, i) => {
    line(ctx, run.res.pts.map(p => [bot.x(p.h), bot.y(p.cum)]), RUNCOL[i % RUNCOL.length], 1.5, [5, 3]);
  });
  const pts = sc.res.pts.filter(p => p.h <= h + 1e-9);
  line(ctx, sc.res.pts.map(p => [top.x(p.h), top.y(p.I)]), 'rgba(255,209,102,0.35)', 1.5);
  line(ctx, pts.map(p => [top.x(p.h), top.y(p.I)]), C.yellow, 2.5);
  line(ctx, pts.map(p => [bot.x(p.h), bot.y(p.cum)]), C.cyan, 3);
  const last = pts[pts.length - 1]; dot(ctx, bot.x(last.h), bot.y(last.cum), 5, C.cyan, C.bg);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(top.x(last.h), top.P.t); ctx.lineTo(top.x(last.h), bot.P.b); ctx.stroke(); ctx.restore();
  // partial totals up to h
  let made = 0, used = 0, net = 0, pos = 0; const dt = sc.res.pts[1].h;
  for (let i = 0; i < pts.length - 1; i++) { made += pts[i].gross * dt; used += M.RATE.resp * dt; net += pts[i].net * dt; if (pts[i].net > 0) pos += dt; }
  const prog = h < 24 - 1e-9 ? t('s5progress', { h: fmt(Math.floor(h), 0) }) : '';
  $('r5').textContent = t('s5readout', { prog, made: fmt(made, 1), used: fmt(used, 1), net: fmt(net, 1), pos: fmt(pos, 1) });
  $('runs5').innerHTML = s5.runs.map((run, i) => `<li><span class="sw" style="background:${RUNCOL[i % RUNCOL.length]}"></span>${t('runLabel', { sky: t(run.cloud ? 'skyCloud' : 'skySun'), co2: run.co2, net: fmt(run.res.net, 1) })}</li>`).join('');
}
function play5() {
  const sc = scenario5(); s5.cur = sc; s5.h = 0;
  animate('s5', 7000, p => { s5.h = 24 * p; draw5(); }, () => {
    s5.runs = s5.runs.filter(r => !(r.cloud === sc.cloud && r.co2 === sc.co2)); s5.runs.push(sc); if (s5.runs.length > 4) s5.runs.shift();
    s5.cur = null; draw5();
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  // step 0
  $('d0').addEventListener('input', () => { s0.splint = null; draw0(); });
  $('lamp0').addEventListener('click', () => { s0.off = !s0.off; s0.splint = null; draw0(); });
  $('test0').addEventListener('click', () => { s0.splint = rate0() > 0 ? 'yes' : 'no'; draw0(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { s0.visible = e.isIntersecting; if (s0.visible) start0(); })).observe($('c0'));
  // step 1
  ['a1', 'b1', 'd1'].forEach(id => $(id).addEventListener('input', draw1));
  $('solve1').addEventListener('click', () => { $('a1').value = M.BALANCED.a; $('b1').value = M.BALANCED.b; $('d1').value = M.BALANCED.d; draw1(); });
  $('reset1').addEventListener('click', () => { ['a1', 'b1', 'd1'].forEach(id => { $(id).value = 1; }); draw1(); });
  // step 2
  $('m2').addEventListener('input', draw2);
  $('check2').addEventListener('click', () => {
    const r = document.querySelector('input[name="q2"]:checked');
    const share = fmt(M.massBook(180).shareCO2 * 100, 1);
    if (!r) { s2.fb = t('fb2none'); s2.state = 'wrong'; } else if (r.value === '93') { s2.fb = t('fb2right', { share }); s2.state = 'correct'; } else { s2.fb = t('fb2wrong'); s2.state = 'wrong'; }
    $('fb2').dataset.state = s2.state; s2.key = r ? (r.value === '93' ? 'fb2right' : 'fb2wrong') : 'fb2none'; draw2();
  });
  // step 3
  $('i3').addEventListener('input', () => { stopAnim('s3'); s3.tried.add(num('i3')); draw3(); });
  $('sweep3').addEventListener('click', () => { s3.tried.clear(); animate('s3', 5000, p => { const v = Math.round(100 * p); for (let k = 0; k <= v; k += 2) s3.tried.add(k); $('i3').value = v; draw3(); }); });
  $('clear3').addEventListener('click', () => { stopAnim('s3'); s3.tried = new Set([num('i3')]); draw3(); });
  // step 4
  ['i4', 'c4s'].forEach(id => $(id).addEventListener('input', draw4));
  // step 5
  document.querySelectorAll('input[name="sky5"],input[name="co25"]').forEach(r => r.addEventListener('change', () => { stopAnim('s5'); s5.cur = null; draw5(); }));
  $('play5').addEventListener('click', play5);
  $('clear5').addEventListener('click', () => { stopAnim('s5'); s5.cur = null; s5.runs = []; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); if (s0.raf) { cancelAnimationFrame(s0.raf); s0.raf = 0; } } else start0(); });
  window.refreshPhoto = () => { if (s2.key) s2.fb = t(s2.key, { share: fmt(M.massBook(180).shareCO2 * 100, 1) }); refresh(); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
