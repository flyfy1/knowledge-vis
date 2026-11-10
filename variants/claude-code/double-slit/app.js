'use strict';
// Double-slit lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.DSLIT_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and a few short labels laid out in fixed slots or greedy rows; legends live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.DSLIT_MODEL;
const t = (...a) => window.DSLIT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(ch => SUP[ch] || ch).join('');
// 3 significant digits in a×10ⁿ form (plain digits between 0.01 and 10 000).
function sci(v) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e < 4) return String(Number(v.toPrecision(3)));
  let m = v / Math.pow(10, e), ee = e; if (Number(m.toFixed(2)) >= 10) { m /= 10; ee++; }
  return `${m.toFixed(2)}×10${sup(ee)}`;
}

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// One-line title that shrinks until it fits.
function title(ctx, text, X, Y, maxW, color = C.text) {
  let size = 12;
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y, maxW); ctx.restore(); // maxW only bites below 8 px
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel; the title sits in its own row above, ticks left of / below the plot.
function panel(ctx, W, o) {
  const P = { l: o.left || 36, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    ctx.textAlign = 'center';
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2).replace('-', '−'), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 10, W - 16);
  return { x, y, P };
}
// Curve f(u) over the plot's x range, sampled every half pixel so dense fringes still render.
function curve(ctx, m, f, uMin, uMax, color, lw = 2, dash = null) {
  const n = Math.max(2, Math.round((m.x(uMax) - m.x(uMin)) * 2));
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  for (let i = 0; i <= n; i++) { const u = uMin + (uMax - uMin) * i / n, X = m.x(u), Y = m.y(f(u)); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
// Screen strip: one column per pixel, coloured by wavelength, brightness = relative intensity.
function strip(ctx, m, yTop, yBot, f, nm) {
  ctx.save(); ctx.fillStyle = '#05080c'; ctx.fillRect(m.P.l, yTop, m.P.r - m.P.l, yBot - yTop);
  for (let X = Math.floor(m.P.l); X < m.P.r; X++) {
    const u = m.uAt(X + 0.5); const I = Math.max(0, Math.min(1, f(u)));
    ctx.fillStyle = M.lamColor(nm, I); ctx.fillRect(X, yTop, 1.2, yBot - yTop);
  }
  ctx.strokeStyle = C.line || '#2c3b50'; ctx.strokeRect(m.P.l, yTop, m.P.r - m.P.l, yBot - yTop); ctx.restore();
}
function withInverse(m, uMin, uMax) { m.uAt = X => uMin + (X - m.P.l) / (m.P.r - m.P.l) * (uMax - uMin); return m; }
function dot(ctx, X, Y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); }
function vline(ctx, X, y0, y1, color, dash = [4, 4], lw = 1.2, alpha = 0.7) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash(dash); ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
// Greedy row layout for short labels: each label takes the first row where it does not touch its neighbour.
function rowLayout(ctx, items, rows, minX, maxX, font) {
  ctx.save(); ctx.font = font; const ends = rows.map(() => -Infinity), out = [];
  items.slice().sort((a, b) => a.x - b.x).forEach(it => {
    const w = ctx.measureText(it.text).width;
    let X = Math.max(minX + w / 2, Math.min(maxX - w / 2, it.x));
    let r = ends.findIndex(e => X - w / 2 >= e + 6); if (r < 0) r = ends.indexOf(Math.min(...ends));
    ends[r] = X + w / 2; out.push({ ...it, X, Y: rows[r], w });
  });
  ctx.restore(); return out;
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: path difference decides bright or dark ---------- */
const S0 = { lam: 650e-9, d: 0.25e-3, L: 1, Y: 6, dy: 0.05 };
const N0 = Math.round(2 * S0.Y / S0.dy) + 1;
const s0 = { visited: new Uint8Array(N0) };
const idx0 = y => Math.round((y + S0.Y) / S0.dy);
const I0 = ymm => M.pointIntensity(ymm * 1e-3, S0.lam, S0.d, S0.L);
function draw0() {
  const y = num('y0'); s0.visited[idx0(y)] = 1;
  $('y0v').textContent = fmt(y, 2);
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0geo'), 8, 16, W - 16);
  const g0 = 34, g1 = 248, gc = (g0 + g1) / 2, half = (g1 - g0) / 2 - 6;
  const bx = Math.round(Math.max(52, W * 0.14)), sx = Math.round(W * 0.56), px0 = sx + 12, px1 = W - 58;
  const py = v => gc - v / S0.Y * half;
  const s1y = gc - 20, s2y = gc + 20;
  ctx.save();
  // incoming plane waves
  ctx.strokeStyle = '#26364a'; ctx.lineWidth = 1.2;
  for (let X = 12; X < bx - 6; X += 9) { ctx.beginPath(); ctx.moveTo(X, g0 + 20); ctx.lineTo(X, g1 - 20); ctx.stroke(); }
  // barrier with two slits
  ctx.strokeStyle = C.muted; ctx.lineWidth = 4;
  [[g0, s1y - 3], [s1y + 3, s2y - 3], [s2y + 3, g1]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(bx, a); ctx.lineTo(bx, b); ctx.stroke(); });
  // screen
  ctx.strokeStyle = C.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, g0); ctx.lineTo(sx, g1); ctx.stroke();
  // rays
  const P = py(y);
  ctx.lineWidth = 2; ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(bx, s1y); ctx.lineTo(sx, P); ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(bx, s2y); ctx.lineTo(sx, P); ctx.stroke();
  // intensity side plot: axes at I = 0 and I = 1, trail of visited positions
  ctx.lineWidth = 1; ctx.strokeStyle = C.grid; [px0, px1].forEach(X => { ctx.beginPath(); ctx.moveTo(X, g0); ctx.lineTo(X, g1); ctx.stroke(); });
  ctx.strokeStyle = C.text; ctx.lineWidth = 1.6; ctx.beginPath(); let pen = false;
  for (let i = 0; i < N0; i++) {
    if (!s0.visited[i]) { pen = false; continue; }
    const v = -S0.Y + i * S0.dy, X = px0 + I0(v) * (px1 - px0), Y = py(v);
    if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y);
  }
  ctx.stroke();
  for (let i = 0; i < N0; i++) if (s0.visited[i]) { const v = -S0.Y + i * S0.dy; dot(ctx, px0 + I0(v) * (px1 - px0), py(v), 1.6, C.text); }
  const Inow = I0(y);
  ctx.setLineDash([3, 3]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(sx, P); ctx.lineTo(px0 + Inow * (px1 - px0), P); ctx.stroke(); ctx.setLineDash([]);
  dot(ctx, px0 + Inow * (px1 - px0), P, 5, C.cyan); dot(ctx, sx, P, 5, C.text);
  // labels in fixed slots: slit names left of the barrier, screen ticks left of the screen, I ticks under the side plot
  ctx.font = '600 12px system-ui,sans-serif'; ctx.fillStyle = C.text; ctx.textAlign = 'right';
  ctx.fillText('S₁', bx - 8, s1y - 4); ctx.fillText('S₂', bx - 8, s2y + 14);
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left';
  [-5, 0, 5].forEach(v => { ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px1, py(v)); ctx.lineTo(px1 + 5, py(v)); ctx.stroke(); ctx.fillText((v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + ' mm', px1 + 8, py(v) + 4); });
  ctx.textAlign = 'center'; ctx.fillText('0', px0, g1 + 14); ctx.fillText('1', px1, g1 + 14);
  ctx.restore();
  // the two waves arriving at P
  const ph = 2 * Math.PI * M.paths(y * 1e-3, S0.d, S0.L).delta / S0.lam;
  const A = panel(ctx, W, { top: 300, bottom: H - 26, xMin: 0, xMax: 3, yMin: -2.3, yMax: 2.3, yTicks: [-2, 0, 2], xTicks: true, xSteps: [1], title: t('c0wave') });
  curve(ctx, A, u => Math.sin(2 * Math.PI * u), 0, 3, C.cyan, 1.6);
  curve(ctx, A, u => Math.sin(2 * Math.PI * u - ph), 0, 3, C.orange, 1.6);
  curve(ctx, A, u => Math.sin(2 * Math.PI * u) + Math.sin(2 * Math.PI * u - ph), 0, 3, C.text, 2.6);
  const p = M.paths(y * 1e-3, S0.d, S0.L), dl = p.delta / S0.lam, deg = ((dl * 360) % 360 + 360) % 360;
  const cnt = s0.visited.reduce((s, v) => s + v, 0), pct = Math.round(100 * cnt / N0);
  const verdict = Inow > 0.9 ? t('verdictBright') : Inow < 0.1 ? t('verdictDark') : t('verdictMid');
  $('r0').textContent = t('s0readout', { prog: cnt > 1 && pct < 100 ? t('s0prog', { pct }) : '', y: fmt(y, 2), dnm: (p.delta * 1e9).toFixed(0), dl: dl.toFixed(2), deg: deg.toFixed(0), I: Inow.toFixed(2), verdict });
}

/* ---------- step 1: fringe spacing ---------- */
const DEF1 = { lam: 650, d: 0.25, L: 1 };
function draw1() {
  const lam = num('lam1'), d = num('d1'), L = num('L1');
  $('lam1v').textContent = String(lam); $('d1v').textContent = d.toFixed(2); $('L1v').textContent = L.toFixed(1);
  const p = { lam: lam * 1e-9, d: d * 1e-3, L, a: 0 }, p0 = { lam: DEF1.lam * 1e-9, d: DEF1.d * 1e-3, L: DEF1.L, a: 0 };
  const { ctx, W, H } = fitCanvas($('c1'));
  const Y = 10;
  const A = withInverse(panel(ctx, W, { top: 112, bottom: H - 26, xMin: -Y, xMax: Y, yMin: 0, yMax: 1.18, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [2, 5, 10], title: t('c1curve') }), -Y, Y);
  title(ctx, t('c1strip'), 8, 16, W - 16);
  strip(ctx, A, 24, 70, u => M.intensity(u * 1e-3, p), lam);
  curve(ctx, A, u => M.intensity(u * 1e-3, p0), -Y, Y, C.ghost, 1.3, [4, 4]);
  curve(ctx, A, u => M.intensity(u * 1e-3, p), -Y, Y, C.text, 1.8);
  const meas = M.firstMaxExact(p.lam, p.d, p.L) * 1e3, approx = M.spacingApprox(p.lam, p.d, p.L) * 1e3;
  // Δy bracket from the central band to the next bright band (clipped at the plot edge)
  const x0 = A.x(0), x1 = A.x(Math.min(meas, Y)), by = A.y(1.09);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, by + 5); ctx.lineTo(x0, by); ctx.lineTo(x1, by); if (meas <= Y) ctx.lineTo(x1, by + 5); ctx.stroke();
  [x0, x1].forEach((X, i) => { if (i === 1 && meas > Y) return; vline(ctx, X, by, A.y(0), C.orange, [3, 4], 1, 0.6); });
  ctx.fillStyle = C.orange; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Δy', x1 - x0 >= 26 ? (x0 + x1) / 2 - 7 : x1 + 5, by - 4);
  ctx.restore();
  const meas0 = M.firstMaxExact(p0.lam, p0.d, p0.L) * 1e3;
  $('r1').textContent = t('s1readout', { meas: meas.toFixed(3), approx: approx.toFixed(3), rel: (Math.abs(meas - approx) / approx * 100).toFixed(4),
    kl: fmt(lam / DEF1.lam, 3), kL: fmt(L / DEF1.L, 3), kd: fmt(d / DEF1.d, 3), ky: fmt(meas / meas0, 3) });
}

/* ---------- step 2: slit width and the envelope ---------- */
function draw2() {
  const a = num('a2'), d = num('d2');
  $('a2v').textContent = String(a); $('d2v').textContent = d.toFixed(2);
  const p = { lam: 650e-9, d: d * 1e-3, L: 1, a: a * 1e-6 };
  const y0 = M.envelopeZero(p.lam, p.a, p.L) * 1e3, Y = Math.max(6, Math.min(40, Math.ceil(y0 * 1.3 / 2) * 2));
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = withInverse(panel(ctx, W, { top: 112, bottom: H - 26, xMin: -Y, xMax: Y, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [2, 5, 10, 20], title: t('c2curve') }), -Y, Y);
  title(ctx, t('c2strip'), 8, 16, W - 16);
  strip(ctx, A, 24, 70, u => M.intensity(u * 1e-3, p), 650);
  [-y0, y0].forEach(v => { if (Math.abs(v) <= Y) { vline(ctx, A.x(v), A.P.t, A.P.b, C.pink, [2, 3], 1.6, 0.9); vline(ctx, A.x(v), 24, 70, C.pink, [2, 3], 1.6, 0.9); } });
  curve(ctx, A, u => M.envelope(u * 1e-3, p), -Y, Y, C.orange, 1.6, [5, 4]);
  curve(ctx, A, u => M.intensity(u * 1e-3, p), -Y, Y, C.text, 1.6);
  const f = M.lobeOrders(p);
  $('r2').textContent = t('s2readout', { y0: y0.toFixed(2), r: fmt(f.ratio, 2), n: f.count, miss: f.missing ? t('s2missing', { m: f.missing }) : '' });
}

/* ---------- step 3: one particle at a time ---------- */
const P3 = { lam: 650e-9, d: 0.25e-3, a: 0.05e-3, L: 1 }, Y3 = 14e-3, BINS = 140;
const samp3 = M.sampler(P3, Y3), dark3 = M.darkStats(P3, Y3);
const s3 = { hits: [], dark: 0, rng: M.mulberry32(20261109), target: 0, from: 0 };
function addHits(n) {
  for (let i = 0; i < n; i++) {
    const y = samp3(s3.rng()), v = s3.rng();
    s3.hits.push({ y, v }); if (M.isDark(y, P3, dark3.peak)) s3.dark++;
  }
}
function niceMax(v) { const s = [4, 10, 20, 30, 40, 60, 80, 100, 150, 200, 300, 400, 600, 800, 1000, 1500, 2000, 3000, 4000]; for (const q of s) if (q >= v) return q; return Math.ceil(v / 2000) * 2000; }
function draw3() {
  const { ctx, W, H } = fitCanvas($('c3'));
  const n = s3.hits.length, Ymm = Y3 * 1e3;
  const counts = new Array(BINS).fill(0);
  s3.hits.forEach(h => { const b = Math.min(BINS - 1, Math.max(0, Math.floor((h.y + Y3) / (2 * Y3) * BINS))); counts[b]++; });
  const exp = M.expectedBins(P3, Y3, BINS, Math.max(n, 1));
  const top = Math.max(...counts, n ? Math.max(...exp) : 0, 4) * 1.1, ymax = niceMax(top);
  const A = panel(ctx, W, { top: 166, bottom: H - 26, xMin: -Ymm, xMax: Ymm, yMin: 0, yMax: ymax, yTicks: [0, ymax / 2, ymax], xTicks: true, xSteps: [2, 5, 10], title: t('c3hist') });
  title(ctx, t('c3screen'), 8, 16, W - 16);
  // detector screen
  const sy0 = 24, sy1 = 126;
  ctx.save(); ctx.fillStyle = '#05080c'; ctx.fillRect(A.P.l, sy0, A.P.r - A.P.l, sy1 - sy0); ctx.strokeStyle = '#2c3b50'; ctx.strokeRect(A.P.l, sy0, A.P.r - A.P.l, sy1 - sy0);
  const r = n > 3000 ? 1 : n > 600 ? 1.3 : 1.8;
  ctx.fillStyle = 'rgba(232,237,244,0.82)';
  s3.hits.forEach(h => { ctx.fillRect(A.x(h.y * 1e3) - r, sy0 + 4 + h.v * (sy1 - sy0 - 8) - r, 2 * r, 2 * r); });
  if (n) { const h = s3.hits[n - 1]; ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(A.x(h.y * 1e3), sy0 + 4 + h.v * (sy1 - sy0 - 8), 6, 0, 7); ctx.stroke(); }
  // histogram and expectation
  const bw = (A.P.r - A.P.l) / BINS;
  ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.85;
  counts.forEach((c, b) => { if (c) ctx.fillRect(A.P.l + b * bw + 0.15 * bw, A.y(c), Math.max(1, 0.7 * bw), A.y(0) - A.y(c)); });
  ctx.globalAlpha = 1; ctx.restore();
  if (n) {
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.beginPath();
    exp.forEach((e, b) => { const X = A.P.l + (b + 0.5) * bw, Yp = A.y(e); if (!b) ctx.moveTo(X, Yp); else ctx.lineTo(X, Yp); });
    ctx.stroke(); ctx.restore();
  }
  const prog = s3.target > n ? t('s3prog', { c: n - s3.from, N: s3.target - s3.from }) : '';
  $('r3').textContent = n ? t('s3readout', { prog, n, w: (dark3.widthShare * 100).toFixed(1), k: s3.dark, s: (s3.dark / n * 100).toFixed(1), e: (dark3.hitShare * 100).toFixed(1) }) : t('s3empty');
}
function fire(k) {
  finishAll();
  s3.from = s3.hits.length; s3.target = s3.from + k;
  if (k <= 10) { addHits(k); draw3(); return; }
  animate('s3', k >= 1000 ? 2600 : 1200, p => {
    const want = s3.from + Math.round(p * k), add = want - s3.hits.length;
    if (add > 0) addHits(add); draw3();
  });
}

/* ---------- step 4: which-path information ---------- */
const P4 = { lam: 650e-9, d: 0.25e-3, a: 20e-6, L: 1 }, Y4 = 8e-3;
const U4 = (() => { const r = M.mulberry32(4), out = []; for (let i = 0; i < 1500; i++) out.push([r(), r()]); return out; })();
function draw4() {
  const D = num('D4'), V = M.visibility(D), p = { ...P4, V };
  $('D4v').textContent = D.toFixed(2);
  const samp = M.sampler(p, Y4, 3000), Ymm = Y4 * 1e3;
  const { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 150, bottom: H - 26, xMin: -Ymm, xMax: Ymm, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [2, 4, 8], title: t('c4curve') });
  title(ctx, t('c4screen'), 8, 16, W - 16);
  const sy0 = 24, sy1 = 112;
  ctx.save(); ctx.fillStyle = '#05080c'; ctx.fillRect(A.P.l, sy0, A.P.r - A.P.l, sy1 - sy0); ctx.strokeStyle = '#2c3b50'; ctx.strokeRect(A.P.l, sy0, A.P.r - A.P.l, sy1 - sy0);
  ctx.fillStyle = 'rgba(255,122,110,0.85)';
  U4.forEach(([u, v]) => { ctx.fillRect(A.x(samp(u) * 1e3) - 1.1, sy0 + 3 + v * (sy1 - sy0 - 6) - 1.1, 2.2, 2.2); });
  ctx.restore();
  curve(ctx, A, u => M.intensity(u * 1e-3, { ...P4, V: 1 }), -Ymm, Ymm, C.ghost, 1.3, [4, 4]);
  curve(ctx, A, u => M.intensity(u * 1e-3, { ...P4, V: 0 }), -Ymm, Ymm, C.orange, 1.5, [6, 4]);
  curve(ctx, A, u => M.intensity(u * 1e-3, p), -Ymm, Ymm, C.text, 2);
  const mc = M.measuredContrast(p), yMin = M.firstMaxExact(P4.lam, P4.d, P4.L) / 2 * 1e3;
  dot(ctx, A.x(0), A.y(mc.hi), 4.5, C.pink); dot(ctx, A.x(yMin), A.y(mc.lo), 4.5, C.pink);
  $('r4').textContent = t('s4readout', { D: D.toFixed(2), g: (M.guessRight(D) * 100).toFixed(1), hi: mc.hi.toFixed(3), lo: mc.lo.toFixed(3), vm: mc.V.toFixed(3), vf: V.toFixed(3), sum: (mc.V * mc.V + D * D).toFixed(3) });
}

/* ---------- step 5: matter waves on a log ruler ---------- */
const s5 = { obj: 'electron', seen: new Set(['electron']) };
function draw5() {
  const o = M.OBJECTS.find(q => q.id === s5.obj), k = num('k5'), v = o.v * Math.pow(10, k);
  const { lam } = M.deBroglie(o.m, v), dy = lam * M.MATTER.L / M.MATTER.d;
  $('k5k').textContent = fmt(k, 2); $('k5v').textContent = `${sci(v)} m/s`;
  document.querySelectorAll('#objRow [data-obj]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.obj === s5.obj)));
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5'), 8, 16, W - 16);
  const L = 18, R = W - 18, ry = 112, e0 = -36, e1 = 0;
  const X = s => L + (Math.log10(s) - e0) / (e1 - e0) * (R - L);
  ctx.save();
  ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, ry); ctx.lineTo(R, ry); ctx.stroke();
  ctx.font = '11px system-ui,sans-serif';
  const lbW = ctx.measureText('10⁻³⁶').width + 10, per = (R - L) / (e1 - e0);
  const stepE = [2, 3, 4, 6, 9, 12].find(s => s * per >= lbW) || 12;
  ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  for (let e = e0; e <= e1; e++) {
    const x = L + (e - e0) * per, major = (e - e0) % stepE === 0;
    ctx.strokeStyle = major ? C.muted : C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, ry - (major ? 6 : 3)); ctx.lineTo(x, ry + (major ? 6 : 3)); ctx.stroke();
    if (major) ctx.fillText('10' + sup(e), x, ry + 20);
  }
  // reference sizes above the ruler
  const refs = rowLayout(ctx, M.REFS.map(r => ({ x: X(r.s), text: t(`ref_${r.id}`) })), [44, 62, 80], L, R, '11px system-ui,sans-serif');
  refs.forEach(r => {
    ctx.strokeStyle = C.green; ctx.globalAlpha = 0.6; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(r.x, r.Y + 4); ctx.lineTo(r.x, ry); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.green; ctx.textAlign = 'center'; ctx.font = '11px system-ui,sans-serif'; ctx.fillText(r.text, r.X, r.Y);
  });
  // λ of objects already viewed (at their typical speed)
  ctx.strokeStyle = C.raw; ctx.lineWidth = 3;
  s5.seen.forEach(id => { if (id === s5.obj) return; const q = M.OBJECTS.find(z => z.id === id); const x = X(M.deBroglie(q.m, q.v).lam); ctx.beginPath(); ctx.moveTo(x, ry - 10); ctx.lineTo(x, ry + 2); ctx.stroke(); });
  // current λ and Δy below the ruler
  const marks = rowLayout(ctx, [{ x: X(lam), text: t('markLam'), c: C.cyan }, { x: X(dy), text: t('markDy'), c: C.orange }], [168, 190], L, R, '600 12px system-ui,sans-serif');
  marks.forEach(mk => {
    ctx.strokeStyle = mk.c; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mk.x, ry - 10); ctx.lineTo(mk.x, ry + 8); ctx.stroke();
    ctx.fillStyle = mk.c; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(mk.x, ry + 27); ctx.lineTo(mk.x, mk.Y - 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(mk.text, mk.X, mk.Y);
  });
  ctx.restore();
  const ratio = dy / 1e-10;
  const rs = ratio >= 1 ? t('ratioTimes', { x: sci(ratio) }) : t('ratioFrac', { x: sci(1 / ratio) });
  const verdict = dy >= 1e-6 ? t('verdictSee') : dy >= 1e-10 ? t('verdictHard') : t('verdictNever');
  $('r5').textContent = t('s5readout', { obj: t(`obj_${o.id}`), m: sci(o.m), v: sci(v), lam: sci(lam), dy: sci(dy), ratio: rs, verdict });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('y0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.visited.fill(0);
    animate('s0', 5000, p => { const i = Math.min(N0 - 1, Math.round(p * (N0 - 1))); for (let j = 0; j <= i; j++) s0.visited[j] = 1; $('y0').value = (-S0.Y + i * S0.dy).toFixed(2); draw0(); });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.visited.fill(0); draw0(); });

  ['lam1', 'd1', 'L1'].forEach(id => $(id).addEventListener('input', draw1));
  $('reset1').addEventListener('click', () => { $('lam1').value = DEF1.lam; $('d1').value = DEF1.d; $('L1').value = DEF1.L; draw1(); });
  ['a2', 'd2'].forEach(id => $(id).addEventListener('input', draw2));

  [['fire1', 1], ['fire10', 10], ['fire100', 100], ['fire1000', 1000]].forEach(([id, k]) => $(id).addEventListener('click', () => fire(k)));
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.hits = []; s3.dark = 0; s3.target = 0; s3.from = 0; draw3(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('D4').addEventListener('input', draw4);
  document.querySelectorAll('#objRow [data-obj]').forEach(b => b.addEventListener('click', () => { s5.obj = b.dataset.obj; s5.seen.add(s5.obj); $('k5').value = 0; draw5(); }));
  $('k5').addEventListener('input', draw5);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshDoubleSlit = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
