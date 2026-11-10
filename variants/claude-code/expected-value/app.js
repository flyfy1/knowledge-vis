'use strict';
// Expected-value lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.EV_MODEL (model.js). Canvas text is limited to
// panel titles, row labels on their own lines and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EV_MODEL;
const t = (...a) => window.EV_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const TIER = [C.raw, C.cyan, C.green, C.violet, C.orange, '#d4e157'];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const money = v => Math.round(v).toLocaleString('en-US');
// Percent: fixed decimals for ordinary values, two significant digits for small ones, a floor for vanishing ones.
const pct = (v, d = 1) => (v > 0 && v < 1e-6 ? '< 0.0001%' : v > 0 && v < 0.001 ? Number((100 * v).toPrecision(2)) + '%' : fmt(100 * v, d) + '%');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// One line of canvas text that shrinks (never squeezes) until it fits maxW.
function label(ctx, text, X, Y, maxW, { size = 12, color = C.text, weight = 600, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceTicks(lo, hi, maxN) {
  const span = hi - lo || 1, raw = span / Math.max(1, maxN), p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw) || 10 * p;
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9 * step; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}
// A plot panel: title row above, y ticks left, x ticks below. xLog uses log10 positions.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const lx = v => (o.xLog ? Math.log10(v) : v), L0 = lx(o.xMin), L1 = lx(o.xMax);
  const x = v => P.l + (lx(v) - L0) / (L1 - L0) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  const yf = o.yFmt || (v => fmt(v));
  for (const v of o.yTicks) {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(yf(v), P.l - 5, y(v) + 4);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  if (o.xTicks) {
    const xf = o.xFmt || (v => fmt(v)); ctx.textAlign = 'center';
    // drop ticks whose labels would touch the previous one
    let lastR = -Infinity;
    for (const v of o.xTicks) {
      const X = x(v), s = xf(v), w = ctx.measureText(s).width;
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.b); ctx.lineTo(X, P.b + 4); ctx.stroke();
      const cx = Math.min(Math.max(X, P.l - 4 + w / 2), W - 2 - w / 2);
      if (cx - w / 2 < lastR + 6) continue;
      ctx.fillText(s, cx, P.b + 15); lastR = cx + w / 2;
    }
  }
  ctx.restore();
  if (o.title) label(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
function vline(ctx, X, y0, y1, color, dash = [4, 4], lw = 1.4, alpha = 0.85) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
function hline(ctx, m, v, color, dash = [5, 4]) { vlineH(ctx, m.P.l, m.P.r, m.y(v), color, dash); }
function vlineH(ctx, x0, x1, Y, color, dash) { ctx.save(); ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore(); }
function tri(ctx, X, Y, s, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - s, Y + s * 1.5); ctx.lineTo(X + s, Y + s * 1.5); ctx.closePath(); ctx.fill(); ctx.restore(); }

/* ---------- shared animation runner (reduced motion, hidden pages) ---------- */
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

/* ---------- step 0: the balance point ---------- */
const s0 = { game: 'die', tried: [], revealed: false, g: 6 };
function draw0() {
  const d = M.GAMES[s0.game], g = s0.g, E = M.mean(d), tq = M.torque(d, g), sides = M.torqueSides(d, g);
  $('g0v').textContent = fmt(g, 2);
  ['die', 'six', 'max2'].forEach(k => $('game_' + k).setAttribute('aria-pressed', s0.game === k));
  const { ctx, W, H } = fitCanvas($('c0'));
  label(ctx, t('c0title'), 8, 18, W - 16);
  const L = 40, R = W - 16, X = v => L + v / 12 * (R - L), base = H - 34, beamY = H - 112;
  // number line (fixed, never rotates)
  const ax = panel(ctx, W, { top: base - 1, bottom: base, left: L, right: 16, xMin: 0, xMax: 12, yMin: 0, yMax: 1, yTicks: [], xTicks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
  void ax;
  // tried guesses (history) as small ticks on the number line
  s0.tried.forEach(v => { ctx.fillStyle = C.ghost; ctx.fillRect(X(v) - 1, base - 8, 2, 8); });
  // beam: rotates about the pivot (X(g), beamY); angle grows with the net turning effect E − g
  // the heavier arm dips; cap the angle so its end stays above the number line at any width
  const arm = tq < 0 ? X(g) - X(0) : X(12) - X(g), maxAng = Math.min(0.24, Math.asin(Math.min(1, (base - beamY - 16) / Math.max(1, arm))));
  const ang = Math.atan(tq / 1.2) / (Math.PI / 2) * maxAng;
  const pMax = Math.max(...d.map(o => o.p)), hMax = Math.min(84, beamY - 70);
  ctx.save(); ctx.translate(X(g), beamY); ctx.rotate(ang);
  ctx.fillStyle = '#3b4c63'; ctx.fillRect(X(0) - X(g) - 6, -3, X(12) - X(0) + 12, 6);
  const bw = Math.max(6, (X(1) - X(0)) * 0.56);
  d.forEach(o => { const h = o.p / pMax * hMax, cx = X(o.x) - X(g); ctx.fillStyle = o.x < g ? C.cyan : C.orange; ctx.globalAlpha = 0.9; ctx.fillRect(cx - bw / 2, -3 - h, bw, h); ctx.globalAlpha = 1; ctx.strokeStyle = C.bg; ctx.strokeRect(cx - bw / 2, -3 - h, bw, h); });
  ctx.restore();
  // fulcrum
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.moveTo(X(g), beamY + 3); ctx.lineTo(X(g) - 11, base - 2); ctx.lineTo(X(g) + 11, base - 2); ctx.closePath(); ctx.fill();
  if (Math.abs(tq) < 0.005) { ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(g), beamY, 7, 0, 7); ctx.stroke(); }
  const state = Math.abs(tq) < 0.005 ? t('s0level') : tq > 0 ? t('s0right') : t('s0left');
  if (Math.abs(tq) < 0.005) s0.revealed = true;
  const tail = s0.revealed ? t('s0formula', { E: fmt(E, 3), terms: d.map(o => `${fmt(o.p, 3)}×${o.x}`).join(' + ') }) : t('s0hidden');
  $('r0').textContent = t('s0readout', { g: fmt(g, 2), l: fmt(sides.left, 3), r: fmt(sides.right, 3), tq: fmt(tq, 3), state }) + tail;
}

/* ---------- step 1: the long run ---------- */
const N1 = 10000;
const s1 = { seed: 1, st: null };
function reset1() { s1.rnd = M.rng(s1.seed); s1.st = null; }
function draw1() {
  const d = M.GAMES[s0.game], E = M.mean(d), sd = M.sd(d), st = s1.st, n = st ? st.n : 0;
  const lo = Math.min(...d.map(o => o.x)), hi = Math.max(...d.map(o => o.x));
  let { ctx, W, H } = fitCanvas($('c1'));
  const yT = niceTicks(lo, hi, 4);
  const A = panel(ctx, W, { top: 38, bottom: 214, xMin: 1, xMax: N1, xLog: true, yMin: lo, yMax: hi, yTicks: yT, xTicks: [1, 10, 100, 1000, 10000], xFmt: v => money(v), title: t('c1a') });
  // band E ± 2σ/√n
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.13)'; ctx.beginPath();
  const clampY = v => A.y(Math.max(lo, Math.min(hi, v)));
  for (let i = 0; i <= 120; i++) { const m = Math.pow(10, 4 * i / 120); const X = A.x(m), Y = clampY(E + M.band(d, m)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  for (let i = 120; i >= 0; i--) { const m = Math.pow(10, 4 * i / 120); ctx.lineTo(A.x(m), clampY(E - M.band(d, m))); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  hline(ctx, A, E, C.orange);
  if (st) {
    ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.8; ctx.beginPath();
    let last = -1;
    st.avg.forEach((v, i) => { const X = A.x(i + 1); if (X - last < 0.6 && i < st.avg.length - 1) return; last = X; const Y = clampY(v); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(n), clampY(st.avg[n - 1]), 4.5, 0, 7); ctx.fill(); ctx.restore();
  }
  // bottom: observed share of each outcome vs its probability
  const k = d.length, pTop = Math.max(...d.map(o => o.p)) * 1.25;
  const B = panel(ctx, W, { top: 262, bottom: H - 26, xMin: -0.5, xMax: k - 0.5, yMin: 0, yMax: pTop, yTicks: niceTicks(0, pTop, 3), yFmt: v => fmt(v, 2), xTicks: d.map((_, i) => i), xFmt: i => String(d[i].x), title: t('c1b') });
  const bw = Math.min(40, (B.x(1) - B.x(0)) * 0.6);
  d.forEach((o, i) => {
    const X = B.x(i);
    if (st) { const f = st.counts[i] / n; ctx.fillStyle = C.cyan; ctx.fillRect(X - bw / 2, B.y(Math.min(pTop, f)), bw, B.y(0) - B.y(Math.min(pTop, f))); }
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X - bw / 2 - 3, B.y(o.p)); ctx.lineTo(X + bw / 2 + 3, B.y(o.p)); ctx.stroke(); ctx.restore();
  });
  ['play10', 'play100', 'play1000'].forEach((id, i) => { $(id).disabled = n + [10, 100, 1000][i] > N1; });
  if (!st) { $('r1').textContent = t('s1empty', { E: fmt(E, 3), name: t('game_' + s0.game) }); return; }
  const m = st.sum / n, w = M.band(d, n);
  $('r1').textContent = t('s1readout', { n: money(n), N: money(N1), m: fmt(m, 3), E: fmt(E, 3), gap: fmt(Math.abs(m - E), 3), w: fmt(w, 3), sd: fmt(sd, 3), inside: Math.abs(m - E) <= w ? t('inside') : t('outside') });
}
function play1(k) {
  const d = M.GAMES[s0.game]; if (!s1.st) s1.st = M.play(d, 0, s1.rnd);
  const target = Math.min(N1, s1.st.n + k), start = s1.st.n;
  animate('s1', k >= 1000 ? 1600 : k >= 100 ? 900 : 500, p => { const want = Math.round(start + (target - start) * p); if (want > s1.st.n) M.play(d, want - s1.st.n, s1.rnd, s1.st); draw1(); });
}

/* ---------- step 2: fair price, house edge ---------- */
const s2 = { ticket: 'roulette', seed: 11, paths: [] };
function makePaths2() { const r = M.rng(s2.seed), T = M.TICKETS[s2.ticket]; s2.paths = Array.from({ length: 5 }, () => M.netPath(T.dist, num('c2'), 1000, r)); }
function draw2() {
  const T = M.TICKETS[s2.ticket], c = num('c2'), f = M.fairness(T.dist, c);
  $('c2v').textContent = fmt(c, 1);
  ['roulette', 'dice', 'scratch'].forEach(k => $('tk_' + k).setAttribute('aria-pressed', s2.ticket === k));
  let { ctx, W, H } = fitCanvas($('cv2'));
  const xMax = 30, A = panel(ctx, W, { top: 30, bottom: 128, left: 12, right: 14, xMin: 0, xMax, yMin: 0, yMax: 1, yTicks: [], xTicks: niceTicks(0, xMax, Math.max(3, Math.floor(W / 70))), title: t('c2a') });
  label(ctx, t('c2pay', { c: fmt(c, 1) }), A.P.l, A.P.t + 12, W - 30, { size: 11, weight: 500, color: C.muted });
  ctx.fillStyle = C.pink; ctx.fillRect(A.x(0), A.P.t + 18, A.x(c) - A.x(0), 20);
  label(ctx, t('c2get', { E: fmt(f.E, 2) }), A.P.l, A.P.t + 56, W - 30, { size: 11, weight: 500, color: C.muted });
  let acc = 0;
  f.contributions.forEach((q, i) => { if (q.c <= 0) return; ctx.fillStyle = TIER[i % TIER.length]; const x0 = A.x(acc), x1 = A.x(Math.min(xMax, acc + q.c)); ctx.fillRect(x0, A.P.t + 62, Math.max(1, x1 - x0 - 1), 20); acc += q.c; });
  // the fee marker runs through both bars but skips the label line between them
  vline(ctx, A.x(c), A.P.t + 16, A.P.t + 40, C.pink, [3, 3], 1.2); vline(ctx, A.x(c), A.P.t + 60, A.P.b, C.pink, [3, 3], 1.2);
  // bottom: five players' cumulative net over 1000 plays
  const all = s2.paths.flat(), lo = Math.min(...all, -1000 * Math.max(0, c - f.E)), hi = Math.max(...all, 0);
  const yT = niceTicks(lo, hi, 4), yMin = Math.min(lo, yT[0]), yMax = Math.max(hi, yT[yT.length - 1]);
  const B = panel(ctx, W, { top: 178, bottom: H - 26, left: 58, xMin: 0, xMax: 1000, yMin, yMax, yTicks: yT, yFmt: v => money(v), xTicks: [0, 250, 500, 750, 1000], title: t('c2b') });
  s2.paths.forEach((path, j) => { ctx.save(); ctx.strokeStyle = TIER[j + 1]; ctx.globalAlpha = 0.75; ctx.lineWidth = 1.3; ctx.beginPath(); path.forEach((v, i) => { const X = B.x(i), Y = B.y(v); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore(); });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.setLineDash([7, 4]); ctx.beginPath(); ctx.moveTo(B.x(0), B.y(0)); ctx.lineTo(B.x(1000), B.y(1000 * f.net)); ctx.stroke(); ctx.restore();
  $('lg2').innerHTML = f.contributions.filter(q => q.c > 0).map(q => `<span class="lg"><span class="sw" style="background:${TIER[f.contributions.indexOf(q) % TIER.length]}"></span><span>${t('tierItem', { x: money(q.x), p: fmt(q.p, 5), c: fmt(q.c, 3) })}</span></span>`).join('');
  const ends = s2.paths.map(p => p[p.length - 1]);
  const verdict = Math.abs(f.net) < 0.005 ? t('s2fair') : f.net < 0 ? t('s2house', { edge: pct(f.edge) }) : t('s2player');
  $('r2').textContent = t('s2readout', { E: fmt(f.E, 3), c: fmt(c, 1), net: fmt(f.net, 3), verdict, exp: money(1000 * f.net), ends: ends.map(money).join(t('sep')) });
}

/* ---------- step 3: adding dice ---------- */
const s3 = { mode: 'indep' };
function draw3() {
  const n = num('n3'), d = M.sumDist(n, s3.mode), E = M.mean(d), sd = M.sd(d);
  $('n3v').textContent = String(n);
  ['indep', 'same', 'mirror'].forEach(k => $('md_' + k).setAttribute('aria-pressed', s3.mode === k));
  const { ctx, W, H } = fitCanvas($('c3'));
  const pTop = Math.max(...d.map(o => o.p)) * 1.15;
  const A = panel(ctx, W, { top: 30, bottom: H - 58, xMin: 0, xMax: 31, yMin: 0, yMax: pTop, yTicks: niceTicks(0, pTop, 4), yFmt: v => fmt(v, 2), xTicks: niceTicks(0, 30, Math.max(4, Math.floor(W / 50))), title: t('c3title', { n }) });
  const bw = Math.max(2, (A.x(1) - A.x(0)) * 0.7);
  d.forEach(o => { ctx.fillStyle = C.cyan; ctx.fillRect(A.x(o.x) - bw / 2, A.y(o.p), bw, A.y(0) - A.y(o.p)); });
  // balance point and ±1 SD bracket
  tri(ctx, A.x(E), A.P.b + 20, 7, C.orange);
  const yb = A.P.b + 44;
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.x(E - sd), yb); ctx.lineTo(A.x(E + sd), yb); ctx.moveTo(A.x(E - sd), yb - 5); ctx.lineTo(A.x(E - sd), yb + 5); ctx.moveTo(A.x(E + sd), yb - 5); ctx.lineTo(A.x(E + sd), yb + 5); ctx.stroke(); ctx.restore();
  const sd1 = M.sd(M.GAMES.die);
  $('r3').textContent = t('s3readout', { n, E: fmt(E, 3), n35: fmt(3.5 * n, 1), sd: fmt(sd, 3), mode: t('md_' + s3.mode), indep: fmt(sd1 * Math.sqrt(n), 3), same: fmt(sd1 * n, 3) });
}

/* ---------- step 4: insurance ---------- */
const NS = [100, 300, 1000, 3000, 10000, 30000, 100000];
function draw4() {
  const p = num('p4') / 1000, lo = num('l4') / 100, N = NS[num('n4')], r = M.insurance(p, lo, N), L = M.LOSS;
  $('p4v').textContent = fmt(100 * p, 1) + '%'; $('l4v').textContent = String(Math.round(100 * lo)) + '%'; $('n4v').textContent = money(N);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 30, bottom: 140, left: 14, right: 16, xMin: 0, xMax: L, yMin: 0, yMax: 1, yTicks: [], xTicks: niceTicks(0, L, Math.max(3, Math.floor(W / 80))), xFmt: v => money(v), title: t('c4a') });
  const rowA = A.P.t + 34, rowB = A.P.t + 84;
  label(ctx, t('c4no'), A.P.l, rowA - 16, W - 30, { size: 11, weight: 500, color: C.muted });
  label(ctx, t('c4yes'), A.P.l, rowB - 16, W - 30, { size: 11, weight: 500, color: C.muted });
  const dot = (X, Y, rr, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, rr, 0, 7); ctx.fill(); };
  dot(A.x(0), rowA, 3 + 9 * Math.sqrt(1 - p), C.cyan); dot(A.x(L), rowA, 3 + 9 * Math.sqrt(p), C.pink);
  dot(A.x(r.premium), rowB, 3 + 9, C.green);
  tri(ctx, A.x(r.pL), rowA + 8, 5, C.orange);
  // bottom: insurer's average payout per policy over N policies
  const dist = M.avgClaimDist(N, p), muX = r.pL, s = r.sdAvg;
  const xMax = Math.min(L, Math.max(2.2 * r.premium, muX + 5 * s)), shown = dist.filter(q => q.x <= xMax);
  const pTop = Math.max(...shown.map(q => q.p)) * 1.15, outside = dist.filter(q => q.x > xMax).reduce((a, q) => a + q.p, 0);
  const B = panel(ctx, W, { top: 190, bottom: H - 26, left: 44, xMin: 0, xMax, yMin: 0, yMax: pTop, yTicks: niceTicks(0, pTop, 3), yFmt: v => (pTop < 0.02 ? fmt(v, 4) : fmt(v, 2)), xTicks: niceTicks(0, xMax, Math.max(3, Math.floor(W / 80))), xFmt: v => money(v), title: t('c4b', { N: money(N) }) });
  const sp = (B.x(L / N) - B.x(0)), bw = Math.max(1, Math.min(18, sp * 0.7));
  shown.forEach(q => { ctx.fillStyle = q.x > r.premium + 1e-9 ? C.pink : C.cyan; ctx.fillRect(B.x(q.x) - bw / 2, B.y(q.p), bw, B.y(0) - B.y(q.p)); });
  vline(ctx, B.x(r.premium), B.P.t, B.P.b, C.green, [], 2, 1);
  vline(ctx, B.x(r.pL), B.P.t, B.P.b, C.orange, [5, 4], 1.4, 0.9);
  const off = outside > 1e-4 ? t('s4off', { o: pct(outside, 2) }) : '';
  $('r4').textContent = t('s4readout', { pL: money(r.pL), pp: fmt(100 * p, 1), L: money(L), sd: money(r.sdOne), prem: money(r.premium), extra: money(r.extra), N: money(N), sdN: money(r.sdAvg), pl: pct(r.probLoss, 2), off });
}

/* ---------- step 5: St Petersburg ---------- */
const N5 = 10000;
const s5 = { seed: 5, games: [] };
function reset5() { s5.rnd = M.rng(s5.seed); s5.games = []; s5.avg = []; s5.sum = 0; }
function draw5() {
  const K = num('k5'), E = M.stPeteMean(K), n = s5.games.length;
  $('k5v').textContent = String(K); $('k5c').textContent = money(Math.pow(2, K));
  let { ctx, W, H } = fitCanvas($('c5'));
  const top = Math.max(E, ...(s5.avg.length ? [Math.max(...s5.avg)] : [0]), Math.log2(N5) + 2) * 1.1;
  const A = panel(ctx, W, { top: 38, bottom: 214, left: 44, xMin: 1, xMax: N5, xLog: true, yMin: 0, yMax: top, yTicks: niceTicks(0, top, 4), xTicks: [1, 10, 100, 1000, 10000], xFmt: v => money(v), title: t('c5a') });
  hline(ctx, A, E, C.orange);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([2, 4]); ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i <= 80; i++) { const m = Math.pow(10, 4 * i / 80), X = A.x(m), Y = A.y(Math.min(top, Math.log2(m) + 2)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  if (n) {
    ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.8; ctx.beginPath(); let last = -1;
    s5.avg.forEach((v, i) => { const X = A.x(i + 1); if (X - last < 0.6 && i < n - 1) return; last = X; if (!i) ctx.moveTo(X, A.y(v)); else ctx.lineTo(X, A.y(v)); });
    ctx.stroke(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(A.x(n), A.y(s5.avg[n - 1]), 4.5, 0, 7); ctx.fill(); ctx.restore();
  }
  // bottom: each tier's share of the average (theory: 1 yuan each, 2 for the capped tier)
  const yTop = 4, B = panel(ctx, W, { top: 262, bottom: H - 26, left: 44, xMin: 0.4, xMax: K + 0.6, yMin: 0, yMax: yTop, yTicks: [0, 1, 2, 3, 4], xTicks: niceTicks(1, K, Math.max(3, Math.floor(W / 46))).filter(v => v >= 1 && Number.isInteger(v)), title: t('c5b', { K }) });
  const cnt = new Array(K + 1).fill(0); s5.games.forEach(gm => { cnt[Math.min(gm.k, K)]++; });
  const bw = Math.max(2, (B.x(1) - B.x(0)) * 0.7);
  for (let k = 1; k <= K; k++) {
    const X = B.x(k), th = k < K ? 1 : 2;
    if (n) { const v = cnt[k] * Math.pow(2, k) / n; ctx.fillStyle = C.cyan; ctx.fillRect(X - bw / 2, B.y(Math.min(yTop, v)), bw, B.y(0) - B.y(Math.min(yTop, v))); if (v > yTop) { ctx.fillStyle = C.pink; ctx.beginPath(); ctx.moveTo(X, B.P.t - 6); ctx.lineTo(X - 4, B.P.t + 1); ctx.lineTo(X + 4, B.P.t + 1); ctx.fill(); } }
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(X - bw / 2 - 1, B.y(th)); ctx.lineTo(X + bw / 2 + 1, B.y(th)); ctx.stroke(); ctx.restore();
  }
  ['play5a', 'play5b'].forEach((id, i) => { $(id).disabled = n + [100, 1000][i] > N5; });
  if (!n) { $('r5').textContent = t('s5empty', { K, E, cap: money(Math.pow(2, K)) }); return; }
  const pays = s5.games.map(gm => gm.pay), small = pays.filter(v => v <= 4).length / n, mx = Math.max(...pays);
  $('r5').textContent = t('s5readout', { n: money(n), m: fmt(s5.avg[n - 1], 2), E, K, small: pct(small, 1), mx: money(mx), lg: fmt(Math.log2(n) + 2, 1) });
}
function play5(k) {
  const K = num('k5'), target = Math.min(N5, s5.games.length + k), start = s5.games.length;
  animate('s5', k >= 1000 ? 1600 : 800, p => {
    const want = Math.round(start + (target - start) * p);
    while (s5.games.length < want) { const gm = M.stPetePlay(K, s5.rnd); s5.games.push(gm); s5.sum += gm.pay; s5.avg.push(s5.sum / s5.games.length); }
    draw5();
  });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('g0').addEventListener('input', () => { stopAnim('s0'); s0.g = num('g0'); draw0(); });
  $('g0').addEventListener('change', () => { s0.tried.push(s0.g); if (s0.tried.length > 12) s0.tried.shift(); draw0(); });
  ['die', 'six', 'max2'].forEach(k => $('game_' + k).addEventListener('click', () => { stopAnim('s0'); stopAnim('s1'); s0.game = k; s0.tried = []; s0.revealed = false; reset1(); draw0(); draw1(); }));
  $('find0').addEventListener('click', () => {
    const from = s0.g, to = M.mean(M.GAMES[s0.game]);
    animate('s0', 1400, p => { const e = 1 - Math.pow(1 - p, 3); s0.g = from + (to - from) * e; $('g0').value = String(s0.g); draw0(); }, () => { s0.g = to; $('g0').value = String(to); s0.tried.push(to); draw0(); });
  });

  reset1();
  $('play10').addEventListener('click', () => play1(10));
  $('play100').addEventListener('click', () => play1(100));
  $('play1000').addEventListener('click', () => play1(1000));
  $('reset1').addEventListener('click', () => { stopAnim('s1'); s1.seed++; reset1(); draw1(); });

  ['roulette', 'dice', 'scratch'].forEach(k => $('tk_' + k).addEventListener('click', () => { s2.ticket = k; $('c2').value = String(M.TICKETS[k].price); makePaths2(); draw2(); }));
  $('c2').addEventListener('input', () => { makePaths2(); draw2(); });
  $('new2').addEventListener('click', () => { s2.seed++; makePaths2(); draw2(); });
  makePaths2();

  $('n3').addEventListener('input', draw3);
  ['indep', 'same', 'mirror'].forEach(k => $('md_' + k).addEventListener('click', () => { s3.mode = k; draw3(); }));

  ['p4', 'l4', 'n4'].forEach(id => $(id).addEventListener('input', draw4));

  reset5();
  $('k5').addEventListener('input', () => { stopAnim('s5'); reset5(); draw5(); });
  $('play5a').addEventListener('click', () => play5(100));
  $('play5b').addEventListener('click', () => play5(1000));
  $('reset5').addEventListener('click', () => { stopAnim('s5'); s5.seed++; reset5(); draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshExpectedValue = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
