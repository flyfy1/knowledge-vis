'use strict';
// Mechanism design lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, cell and readout comes from window.MECH_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.MECH_MODEL;
const t = (...a) => window.MECH_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/\.?0+$/, '') : s; };

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
// Panel title in its own row; the font shrinks until it fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel: ticks left of / below the plot, title in a row above it.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [10, 20, 25, 50, 100]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function vline(ctx, m, X, color, dash = [5, 4], lw = 1.4, alpha = 0.9) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(m.x(X), m.P.t); ctx.lineTo(m.x(X), m.P.b); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, Y, color, dash = [5, 4], lw = 1.4) {
  ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(m.P.l, m.y(Y)); ctx.lineTo(m.P.r, m.y(Y)); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, hollow = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7);
  if (hollow) { ctx.fillStyle = C.bg; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
// Utility as a function of your bid b (0..100) against a known rival bid r: two pieces and a tie point.
function utilityCurve(ctx, m, rule, v, r, color, lw = 2.4) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(m.x(0), m.y(0)); ctx.lineTo(m.x(Math.min(r, 100)), m.y(0)); ctx.stroke();
  if (r < 100) { ctx.beginPath(); ctx.moveTo(m.x(r), m.y(M.utility(rule, v, r + 1e-9, r))); ctx.lineTo(m.x(100), m.y(M.utility(rule, v, 100, r))); ctx.stroke(); }
  ctx.restore();
  dot(ctx, m.x(r), m.y(M.utility(rule, v, r, r)), 3, color, true);
}

/* ---------- shared animation runner (reduced motion and hidden pages) ---------- */
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

const U_TICKS = [-100, -50, 0, 50, 100];

/* ---------- step 0: first price, rival's bid known ---------- */
function draw0() {
  const v = num('v0'), r = num('r0'), b = num('b0');
  $('v0v').textContent = v; $('r0v').textContent = r; $('b0v').textContent = b;
  const { ctx, W, H } = fitCanvas($('c0'));
  const m = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 100, yMin: -100, yMax: 100, yTicks: U_TICKS, xTicks: true, title: t('c0') });
  vline(ctx, m, v, C.orange); vline(ctx, m, r, C.pink, [2, 3]);
  utilityCurve(ctx, m, 'first', v, r, C.cyan);
  const o = M.outcome('first', v, b, r), best = M.bestReply('first', v, r);
  dot(ctx, m.x(b), m.y(o.u), 6, C.text);
  const truth = M.utility('first', v, v, r);
  const res = o.win === 1 ? t('s0win', { pay: b, u: fmt(o.u) }) : o.win === 0.5 ? t('s0tie', { u: fmt(o.u) }) : t('s0lose');
  const bestTxt = best.u > 0 ? t('s0best', { bb: best.bids[best.bids.length - 1], u: fmt(best.u) }) : t('s0bestNone');
  $('r0txt').textContent = t('s0readout', { b, r, res, truth: fmt(truth), best: bestTxt });
}

/* ---------- step 1: first price, rival unknown ---------- */
const s1 = { values: M.rivalValues(400, 11), shown: 400 };
function draw1() {
  const v = num('v1'), beta = num('k1'), b = num('b1');
  $('v1v').textContent = v; $('k1v').textContent = beta.toFixed(2); $('b1v').textContent = b;
  const { ctx, W, H } = fitCanvas($('c1'));
  const top = panel(ctx, W, { top: 26, bottom: 196, xMin: 0, xMax: 100, yMin: -40, yMax: 60, yTicks: [-40, -20, 0, 20, 40, 60], xTicks: true, title: t('c1a') });
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4; ctx.beginPath();
  for (let i = 0; i <= 400; i++) { const bb = i / 4, Y = top.y(Math.max(-40, M.expectedU(v, bb, beta))); if (!i) ctx.moveTo(top.x(bb), Y); else ctx.lineTo(top.x(bb), Y); }
  ctx.stroke(); ctx.restore();
  vline(ctx, top, v, C.orange);
  const opt = M.bestBid(v, beta);
  vline(ctx, top, opt.b, C.green, [2, 3]);
  dot(ctx, top.x(opt.b), top.y(opt.eu), 5, C.green);
  const eu = M.expectedU(v, b, beta);
  dot(ctx, top.x(b), top.y(Math.max(-40, eu)), 6, C.text);
  // bottom: each simulated rival is a dot at its bid; filled green = you beat it
  const bot = panel(ctx, W, { top: 240, bottom: H - 26, xMin: 0, xMax: 100, yMin: 0, yMax: 1, yTicks: [], xTicks: true, title: t('c1b') });
  const vals = s1.values.slice(0, s1.shown), sim = M.simulateFirst(v, b, beta, vals.length ? vals : [0]);
  vals.forEach((rv, i) => {
    const rb = beta * rv, jy = ((i * 0.6180339887) % 1) * 0.86 + 0.07;
    ctx.fillStyle = b > rb ? C.green : C.raw; ctx.globalAlpha = b > rb ? 0.9 : 0.75;
    ctx.beginPath(); ctx.arc(bot.x(rb), bot.y(jy), 2.4, 0, 7); ctx.fill();
  });
  ctx.globalAlpha = 1;
  vline(ctx, bot, b, C.text, [], 2, 1);
  vline(ctx, bot, 100 * beta, C.pink, [2, 3]);
  const n = vals.length;
  const prog = n < 400 ? t('s1progress', { c: n, N: 400 }) : '';
  $('r1txt').textContent = prog + t('s1readout', {
    b, p: (M.winProb(b, beta) * 100).toFixed(0), eu: fmt(eu), won: Math.round(sim.won), n, mean: n ? fmt(sim.mean) : '—',
    bb: fmt(opt.b), beu: fmt(opt.eu), top: fmt(100 * beta), half: fmt(v / 2)
  });
}

/* ---------- step 2: second price, rival's bid known ---------- */
function draw2() {
  const v = num('v2'), r = num('r2'), b = num('b2');
  $('v2v').textContent = v; $('r2v').textContent = r; $('b2v').textContent = b;
  const { ctx, W, H } = fitCanvas($('c2'));
  const top = panel(ctx, W, { top: 26, bottom: 178, xMin: 0, xMax: 100, yMin: -100, yMax: 100, yTicks: U_TICKS, xTicks: true, title: t('c2a') });
  vline(ctx, top, v, C.orange); vline(ctx, top, r, C.pink, [2, 3]);
  utilityCurve(ctx, top, 'second', v, r, C.cyan);
  const o = M.outcome('second', v, b, r);
  dot(ctx, top.x(b), top.y(o.u), 6, C.text);
  // bottom: utility against every possible rival bid, your bid vs bidding v
  const bot = panel(ctx, W, { top: 222, bottom: H - 26, xMin: 0, xMax: 100, yMin: -100, yMax: 100, yTicks: U_TICKS, xTicks: true, title: t('c2b') });
  const lo = Math.min(b, v), hi = Math.max(b, v);
  if (hi > lo) { ctx.fillStyle = 'rgba(255,122,147,0.16)'; ctx.fillRect(bot.x(lo), bot.P.t, bot.x(hi) - bot.x(lo), bot.P.b - bot.P.t); }
  const line = (bid, col, dash, lw) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const rr = i / 4; const u = rr < bid ? v - rr : rr === bid ? 0.5 * (v - rr) : 0; const Y = bot.y(u); if (!i) ctx.moveTo(bot.x(rr), Y); else ctx.lineTo(bot.x(rr), Y); }
    ctx.stroke(); ctx.restore();
  };
  line(v, C.text, [6, 4], 2); line(b, C.cyan, [], 2.4);
  vline(ctx, bot, r, C.pink, [2, 3]);
  dot(ctx, bot.x(r), bot.y(o.u), 6, C.text);
  const uTruth = M.utility('second', v, v, r);
  const res = o.win === 1 ? t('s2win', { pay: r, u: fmt(o.u) }) : o.win === 0.5 ? t('s2tie', { u: fmt(o.u) }) : t('s2lose');
  let zone;
  if (b === v) zone = t('s2zoneTruth');
  else if (b > v) zone = t('s2zoneOver', { lo: v, hi: b });
  else zone = t('s2zoneUnder', { lo: b, hi: v });
  $('r2txt').textContent = t('s2readout', { b, r, res, ut: fmt(uTruth), zone });
}

/* ---------- step 3: regret map, both rules ---------- */
const s3 = { rule: 'first', cache: {} };
function table3(rule, v) { const k = rule + v; return s3.cache[k] || (s3.cache[k] = M.regretTable(rule, v)); }
function heat(x) { // 0 → dark blue-grey, 1 → orange-pink
  const a = [22, 36, 52], b = [255, 180, 84], c = [255, 122, 147];
  const mix = (p, q, s) => p.map((u, i) => Math.round(u + (q[i] - u) * s));
  return x < 0.5 ? mix(a, b, x * 2) : mix(b, c, (x - 0.5) * 2);
}
function draw3() {
  const v = num('v3'), b = num('b3'), rule = s3.rule;
  $('v3v').textContent = v; $('b3v').textContent = b;
  $('rule3first').setAttribute('aria-pressed', rule === 'first'); $('rule3second').setAttribute('aria-pressed', rule === 'second');
  const T = table3(rule, v), row = T.rows[b];
  let { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 100, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xTicks: true, title: t('c3a') });
  const cw = (A.P.r - A.P.l) / 101, ch = (A.P.b - A.P.t) / 101, SCALE = 100;
  for (let bb = 0; bb <= 100; bb++) {
    const R = T.rows[bb].row;
    for (let r = 0; r <= 100; r++) {
      const c = heat(Math.min(1, R[r] / SCALE));
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      ctx.fillRect(A.P.l + r * cw, A.P.b - (bb + 1) * ch, cw + 0.6, ch + 0.6);
    }
  }
  // the chosen row and the truthful row
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.strokeRect(A.P.l, A.P.b - (b + 1) * ch, A.P.r - A.P.l, ch); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A.P.l, A.P.b - (v + 0.5) * ch); ctx.lineTo(A.P.r, A.P.b - (v + 0.5) * ch); ctx.stroke(); ctx.restore();
  dot(ctx, A.P.l + (row.at + 0.5) * cw, A.P.b - (b + 0.5) * ch, 4.5, C.text, true);

  ({ ctx, W, H } = fitCanvas($('c3b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 100, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xTicks: true, title: t('c3b') });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath();
  T.rows.forEach((q, i) => { const X = B.x(q.b), Y = B.y(q.worst); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
  vline(ctx, B, v, C.cyan);
  T.safest.forEach(sb => dot(ctx, B.x(sb), B.y(T.minWorst), 4, C.green));
  dot(ctx, B.x(b), B.y(row.worst), 6, C.text);
  const safest = T.safest.length > 1 ? `${T.safest[0]}–${T.safest[T.safest.length - 1]}` : String(T.safest[0]);
  $('r3txt').textContent = t('s3readout', { rule: t(rule === 'first' ? 'ruleFirst' : 'ruleSecond'), b, w: fmt(row.worst), at: row.at, safe: safest, sw: fmt(T.minWorst), v });
}

/* ---------- step 4: revenue with n bidders ---------- */
const s4 = { seed: 1, total: 1000, shown: 1000, data: null, key: '' };
function data4() { const n = num('n4'), key = n + ':' + s4.seed; if (s4.key !== key) { s4.data = M.simulateRevenue(n, s4.total, s4.seed); s4.key = key; } return s4.data; }
function draw4() {
  const n = num('n4'); $('n4v').textContent = n;
  const D = data4().slice(0, s4.shown), k = D.length;
  const { ctx, W, H } = fitCanvas($('c4'));
  const theory = M.eSecond(n);
  const A = panel(ctx, W, { top: 26, bottom: 186, xMin: 0, xMax: s4.total, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xTicks: true, xSteps: [100, 200, 250, 500, 1000], minPx: 34, title: t('c4a') });
  hline(ctx, A, theory, C.text, [6, 4], 1.4);
  const run = (key, col) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); let s = 0;
    D.forEach((q, i) => { s += q[key]; const X = A.x(i + 1), Y = A.y(s / (i + 1)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke(); ctx.restore();
  };
  run('second', C.cyan); run('first', C.orange);
  // histograms (bins of 5) of the revenue from single auctions
  const B = panel(ctx, W, { top: 230, bottom: H - 26, xMin: 0, xMax: 100, yMin: 0, yMax: 0.3, yTicks: [0, 0.1, 0.2, 0.3], yFmt: v => Math.round(v * 100) + '%', xTicks: true, title: t('c4b') });
  const bins = key => { const h = new Array(20).fill(0); D.forEach(q => { h[Math.min(19, Math.floor(q[key] / 5))]++; }); return h.map(c => (k ? c / k : 0)); };
  const hf = bins('first'), hs = bins('second'), bw = (B.x(5) - B.x(0));
  hs.forEach((p, i) => { ctx.fillStyle = 'rgba(103,215,249,0.55)'; ctx.fillRect(B.x(i * 5) + 1, B.y(Math.min(0.3, p)), bw / 2 - 1, B.y(0) - B.y(Math.min(0.3, p))); });
  hf.forEach((p, i) => { ctx.fillStyle = 'rgba(255,180,84,0.8)'; ctx.fillRect(B.x(i * 5) + bw / 2, B.y(Math.min(0.3, p)), bw / 2 - 1, B.y(0) - B.y(Math.min(0.3, p))); });
  vline(ctx, B, theory, C.text, [6, 4]);
  const sf = M.stats(D.map(q => q.first)), ss = M.stats(D.map(q => q.second)), sd = M.revenueSD(n);
  const prog = k < s4.total ? t('s4progress', { c: k, N: s4.total }) : '';
  $('r4txt').textContent = prog + t('s4readout', { n, k, mf: fmt(sf.mean), ms: fmt(ss.mean), th: fmt(theory), sh: fmt(M.fpShade(n) * 100, 0), df: fmt(sf.sd), ds: fmt(ss.sd), tdf: fmt(sd.first), tds: fmt(sd.second), set: s4.seed });
}

/* ---------- step 5: reserve price ---------- */
function draw5() {
  const R = num('R5'), n = num('n5');
  $('R5v').textContent = R; $('n5v').textContent = n;
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 220, xMin: 0, xMax: 100, yMin: 0, yMax: 100, yTicks: [0, 25, 50, 75, 100], xTicks: true, title: t('c5a') });
  const curve = (m, f, col, dash = []) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = i / 2, Y = m.y(f(x)); if (!i) ctx.moveTo(m.x(x), Y); else ctx.lineTo(m.x(x), Y); } ctx.stroke(); ctx.restore(); };
  // the gap between welfare and revenue is the winner's surplus; shade the welfare lost to unsold items
  const w0 = M.reserveExact(n, 0).welfare;
  if (R > 0) {
    ctx.save(); ctx.fillStyle = 'rgba(255,122,147,0.22)'; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(w0)); ctx.lineTo(A.x(R), A.y(w0));
    for (let i = 0; i <= 100; i++) { const x = R * (1 - i / 100); ctx.lineTo(A.x(x), A.y(M.reserveExact(n, x).welfare)); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    hline(ctx, { P: { l: A.x(0), r: A.x(R) }, y: A.y }, w0, C.green, [3, 3], 1);
  }
  curve(A, x => M.reserveExact(n, x).welfare, C.green);
  curve(A, x => M.reserveExact(n, x).revenue, C.orange);
  const best = M.bestReserve(n), q = M.reserveExact(n, R), q0 = M.reserveExact(n, 0);
  vline(ctx, A, best.R, C.orange, [2, 3], 1.2, 0.6);
  vline(ctx, A, R, C.text, [], 1.6, 0.8);
  dot(ctx, A.x(R), A.y(q.revenue), 6, C.orange); dot(ctx, A.x(R), A.y(q.welfare), 6, C.green);
  const B = panel(ctx, W, { top: 264, bottom: H - 26, xMin: 0, xMax: 100, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], yFmt: v => Math.round(v * 100) + '%', xTicks: true, title: t('c5b') });
  curve(B, x => M.reserveExact(n, x).noSale, C.pink);
  vline(ctx, B, R, C.text, [], 1.6, 0.8);
  dot(ctx, B.x(R), B.y(q.noSale), 6, C.pink);
  $('r5txt').textContent = t('s5readout', { R, n, rev: fmt(q.revenue), rev0: fmt(q0.revenue), wel: fmt(q.welfare), wel0: fmt(q0.welfare), ns: fmt(q.noSale * 100), bR: best.R, bRev: fmt(best.revenue), gain: fmt(best.revenue - q0.revenue) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['v0', 'r0', 'b0'].forEach(id => $(id).addEventListener('input', draw0));
  $('truth0').addEventListener('click', () => { $('b0').value = $('v0').value; draw0(); });
  ['v1', 'k1', 'b1'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s1'); s1.shown = 400; draw1(); }));
  $('best1').addEventListener('click', () => { stopAnim('s1'); s1.shown = 400; $('b1').value = Math.round(M.bestBid(num('v1'), num('k1')).b); draw1(); });
  $('sim1').addEventListener('click', () => { s1.shown = 0; draw1(); animate('s1', 4000, p => { s1.shown = Math.round(p * 400); draw1(); }); });
  ['v2', 'r2', 'b2'].forEach(id => $(id).addEventListener('input', draw2));
  $('truth2').addEventListener('click', () => { $('b2').value = $('v2').value; draw2(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'c';
    $('quizFeedback').textContent = t(choice ? (ok ? 'correct' : 'wrong') : 'pickOne');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });
  ['v3', 'b3'].forEach(id => $(id).addEventListener('input', draw3));
  $('rule3first').addEventListener('click', () => { s3.rule = 'first'; draw3(); });
  $('rule3second').addEventListener('click', () => { s3.rule = 'second'; draw3(); });
  $('n4').addEventListener('input', () => { stopAnim('s4'); s4.shown = s4.total; draw4(); });
  $('run4').addEventListener('click', () => { s4.shown = 0; draw4(); animate('s4', 5000, p => { s4.shown = Math.round(p * s4.total); draw4(); }); });
  $('new4').addEventListener('click', () => { s4.seed = s4.seed % 5 + 1; s4.shown = 0; draw4(); animate('s4', 5000, p => { s4.shown = Math.round(p * s4.total); draw4(); }); });
  ['R5', 'n5'].forEach(id => $(id).addEventListener('input', draw5));
  $('best5').addEventListener('click', () => { $('R5').value = M.bestReserve(num('n5')).R; draw5(); });

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
  window.refreshMechanism = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
