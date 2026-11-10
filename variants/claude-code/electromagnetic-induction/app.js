'use strict';
// Electromagnetic induction lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09/10.
// Every line, curve and readout comes from window.EMI_MODEL (model.js). Canvas text is limited to panel titles
// (own row, shrink-to-fit), axis ticks and a few fixed symbols (N/S, ⊙/⊗, B); legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EMI_MODEL;
const t = (...a) => window.PAGE_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', red: '#ff6b6b', blue: '#5b9cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', field: '#3d5a78' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (toFixed(0) values are left alone); −0 shows as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s; };
const fix = (v, d) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace('-', '−'); };

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
// Panel title in its own row; the font shrinks until the text fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8.5);
  ctx.fillText(text, X, Y, maxW); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel. o: top, bottom, xMin, xMax, yMin, yMax, yTicks, yDigits, xTicks (bool | array), xSteps, minPx, title, left, right
function panel(ctx, W, o) {
  const P = { l: o.left || 42, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  o.yTicks.forEach(v => {
    ctx.strokeStyle = Math.abs(v) < 1e-12 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, o.yDigits === undefined ? 2 : o.yDigits), P.l - 6, y(v) + 4);
  });
  if (o.xTicks) {
    let vals;
    if (Array.isArray(o.xTicks)) vals = o.xTicks;
    else { const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.5, 1, 2, 5, 10, 20, 45, 90]); vals = []; for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) vals.push(+v.toPrecision(10)); }
    ctx.textAlign = 'center';
    vals.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(fmt(v, 2), x(v), P.b + 15); });
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 12, W - 16);
  return { x, y, P };
}
function polyline(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, color, lw = 2.2, head = 8) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) return;
  const h = Math.min(head, L * 0.6);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - h * 0.7 * Math.cos(a), y1 - h * 0.7 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.45), y1 - h * Math.sin(a - 0.45)); ctx.lineTo(x1 - h * Math.cos(a + 0.45), y1 - h * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
}
function clipPanel(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
// ⊙ (out of the page) or ⊗ (into the page)
function pageSymbol(ctx, X, Y, r, out, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke();
  if (out) { ctx.beginPath(); ctx.arc(X, Y, r * 0.3, 0, 7); ctx.fill(); }
  else { const q = r * 0.62; ctx.beginPath(); ctx.moveTo(X - q, Y - q); ctx.lineTo(X + q, Y + q); ctx.moveTo(X + q, Y - q); ctx.lineTo(X - q, Y + q); ctx.stroke(); }
  ctx.restore();
}
// Round axis limit and 3–5 ticks covering ±max (or 0..max)
function niceLimit(max) { const p = Math.pow(10, Math.floor(Math.log10(max))), m = max / p; return (m <= 1 ? 1 : m <= 1.5 ? 1.5 : m <= 2 ? 2 : m <= 3 ? 3 : m <= 4 ? 4 : m <= 5 ? 5 : m <= 6 ? 6 : m <= 8 ? 8 : 10) * p; }

/* ---------- animation runner (reduced motion → jump to the end; hidden page → finish) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); const d = anims[name].done; delete anims[name]; if (d) d(true); } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: flux through a tilted coil ---------- */
const s0 = { prev: null, key: '' };
function draw0() {
  const B = num('B0'), a = num('a0'), th = num('th0'), S = a * a / 1e4, phi = M.flux(B, S, th) * 1000, sl = M.slice(B, a, th);
  $('B0v').textContent = fix(B, 1); $('a0v').textContent = String(a); $('th0v').textContent = th + '°';
  // side view
  let { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0a'), 8, 16, W - 16);
  const top = 28, bot = H - 10, cx = W / 2, cy = (top + bot) / 2, scale = Math.min((W - 24) / 18, (bot - top) / 16); // px per cm; a ≤ 14 cm
  const th0 = th * Math.PI / 180, half = a / 2 * scale;
  // coil: tilted by θ from horizontal, so that its normal is θ from the vertical field
  const ex = Math.cos(th0) * half, ey = -Math.sin(th0) * half;
  // shaded projection band
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.10)'; ctx.fillRect(cx - Math.abs(ex), top, 2 * Math.abs(ex), bot - top); ctx.restore();
  // field lines (vertical, pointing up), symmetric about the coil centre
  const sp = sl.spacing * scale;
  for (let k = 0; ; k++) {
    const off = (k + 0.5) * sp; if (off > W / 2) break;
    [-1, 1].forEach(sg => {
      const X = cx + sg * off, through = (k + 0.5) * sl.spacing < sl.w / 2 - 1e-9;
      ctx.save(); ctx.strokeStyle = through ? C.cyan : C.field; ctx.lineWidth = through ? 1.8 : 1.2; ctx.beginPath(); ctx.moveTo(X, bot); ctx.lineTo(X, top); ctx.stroke(); ctx.restore();
      arrow(ctx, X, top + 26, X, top + 14, through ? C.cyan : C.field, 1.2, 6);
    });
  }
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - ex, cy - ey); ctx.lineTo(cx + ex, cy + ey); ctx.stroke(); ctx.restore();
  // normal: perpendicular to the coil, θ from vertical (up)
  const nL = Math.min(60, (bot - top) / 2 - 8);
  arrow(ctx, cx, cy, cx - Math.sin(th0) * nL, cy - Math.cos(th0) * nL, C.green, 2.4, 9);
  dot(ctx, cx, cy, 3.5, C.orange);
  // Φ against θ
  ({ ctx, W, H } = fitCanvas($('c0b')));
  const lim = 20, Bp = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 180, yMin: -lim, yMax: lim, yTicks: [-20, -10, 0, 10, 20], yDigits: 0, xTicks: [0, 45, 90, 135, 180], title: t('c0b') });
  const curve = (b, s) => { const pts = []; for (let q = 0; q <= 180; q += 2) pts.push([Bp.x(q), Bp.y(M.flux(b, s, q) * 1000)]); return pts; };
  const key = B + '|' + a;
  if (key !== s0.key) { if (s0.key) s0.prev = s0.key; s0.key = key; }
  if (s0.prev) { const [pb, pa] = s0.prev.split('|').map(Number); polyline(ctx, curve(pb, pa * pa / 1e4), C.raw, 1.6); }
  polyline(ctx, curve(B, S), C.orange, 2.4);
  dot(ctx, Bp.x(th), Bp.y(phi), 6, C.cyan, C.bg);
  $('r0').textContent = t('s0readout', { B: fix(B, 1), S: fmt(S, 4), th, phi: fix(phi, 2), w: fix(sl.w, 1), n: sl.n });
}

/* ---------- step 1: Faraday — ramps of B and the emf they make ---------- */
const N1 = 100, S1 = 0.01;
const s1 = { ghosts: new Set(), Bkey: null, t: null };
function draw1() {
  const Bm = num('Bm1'), tau = num('tau1'), T = M.RAMP.T;
  $('Bm1v').textContent = fix(Bm, 1); $('tau1v').textContent = fix(tau, 1);
  if (s1.Bkey !== Bm) { s1.ghosts.clear(); s1.Bkey = Bm; }
  s1.ghosts.add(tau);
  const tEnd = s1.t === null ? T : s1.t;
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax: T, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], yDigits: 1, xTicks: true, xSteps: [0.5, 1, 2], title: t('c1a') });
  const ptsB = (tt1, b, ta) => { const out = []; for (let q = 0; q <= tt1 + 1e-9; q += 0.005) out.push([A.x(q), A.y(M.Bramp(b, ta, q))]); return out; };
  if (s1.t !== null) polyline(ctx, ptsB(T, Bm, tau), C.raw, 1.2, [4, 4]);
  polyline(ctx, ptsB(tEnd, Bm, tau), C.cyan, 2.4);
  const lim = 10.5, E = panel(ctx, W, { top: 196, bottom: H - 26, xMin: 0, xMax: T, yMin: -lim, yMax: lim, yTicks: [-10, -5, 0, 5, 10], yDigits: 0, xTicks: true, xSteps: [0.5, 1, 2], title: t('c1b') });
  clipPanel(ctx, E);
  const ptsE = (tt1, b, ta) => { const out = []; for (let q = 0; q <= tt1 + 1e-9; q += 0.0025) out.push([E.x(q), E.y(M.emfRamp(N1, S1, b, ta, q))]); return out; };
  // earlier τ values (same Bmax) as grey outlines
  [...s1.ghosts].forEach(g => { if (Math.abs(g - tau) > 1e-9) polyline(ctx, ptsE(T, Bm, g), C.raw, 1.4); });
  // shaded ∫ε dt during the two ramps, up to tEnd
  const e = M.emfRamp(N1, S1, Bm, tau, M.RAMP.t1 + tau / 2);
  [[M.RAMP.t1, e], [M.RAMP.t2, -e]].forEach(([t0, val]) => {
    const t1 = Math.min(t0 + tau, tEnd); if (t1 <= t0) return;
    ctx.fillStyle = val < 0 ? 'rgba(103,215,249,0.30)' : 'rgba(255,180,84,0.30)';
    ctx.fillRect(E.x(t0), Math.min(E.y(0), E.y(val)), E.x(t1) - E.x(t0), Math.abs(E.y(val) - E.y(0)));
  });
  polyline(ctx, ptsE(tEnd, Bm, tau), C.cyan, 2.4);
  ctx.restore();
  if (s1.t !== null) { dot(ctx, A.x(tEnd), A.y(M.Bramp(Bm, tau, tEnd)), 5, C.text); dot(ctx, E.x(tEnd), E.y(M.emfRamp(N1, S1, Bm, tau, tEnd)), 5, C.text); }
  const area = M.emfArea(N1, S1, Bm, tau, M.RAMP.t1, M.RAMP.t1 + tau);
  $('r1').textContent = t('s1readout', { now: s1.t === null ? '' : t('s1now', { t: fix(s1.t, 2) }), tau: fix(tau, 1), e: fix(e, 2), B: fix(Bm, 1), area: fix(area, 3), nsb: fix(-N1 * S1 * Bm, 3) });
}

/* ---------- step 2: Lenz — a magnet along the coil axis ---------- */
const Z2 = { min: -8, max: 8, d: 0.2 };
const s2 = { pole: 1, visited: new Uint8Array(Math.round((Z2.max - Z2.min) / Z2.d) + 1), last: null };
const zIdx = z => Math.round((z - Z2.min) / Z2.d);
function mark2(z) { const i = zIdx(z), j = s2.last === null ? i : s2.last; for (let q = Math.min(i, j); q <= Math.max(i, j); q++) s2.visited[q] = 1; s2.last = i; }
function clear2() { s2.visited.fill(0); s2.last = null; mark2(num('z2')); }
function draw2() {
  const zc = num('z2'), v = num('v2'), z = zc / 100, pole = s2.pole, L = M.lenz(z, v, pole);
  $('z2v').textContent = fix(zc, 1); $('v2v').textContent = fix(v, 2);
  $('pass2').disabled = v === 0 || !!anims.s2;
  const { ctx, W, H } = fitCanvas($('c2'));
  // --- side view ---
  title(ctx, t('c2a'), 8, 16, W - 16);
  const top = 28, bot = 170, cy = (top + bot) / 2, xl = 30, xr = W - 30;
  const X = zz => xl + (zz - Z2.min - (-1)) / (Z2.max - Z2.min + 2) * (xr - xl); // zz in cm, view spans −9..9 cm
  const ppc = X(1) - X(0), R = Math.min(2 * ppc, (bot - top) / 2 - 22); // coil radius 2 cm (drawn at scale unless the panel is too short)
  // axis
  ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(xl, cy); ctx.lineTo(xr, cy); ctx.stroke(); ctx.restore();
  // magnet: length 3 cm, height 1.2 cm, centre at z; the half on the +z side is N when pole = +1
  const mw = 1.5 * ppc, mh = Math.max(12, Math.min(0.6 * ppc, 18)), mx = X(zc);
  ctx.save(); ctx.globalAlpha = 0.95;
  ctx.fillStyle = pole > 0 ? C.blue : C.red; ctx.fillRect(mx - mw, cy - mh, mw, 2 * mh);
  ctx.fillStyle = pole > 0 ? C.red : C.blue; ctx.fillRect(mx, cy - mh, mw, 2 * mh);
  ctx.fillStyle = '#071019'; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(pole > 0 ? 'S' : 'N', mx - mw / 2, cy + 1); ctx.fillText(pole > 0 ? 'N' : 'S', mx + mw / 2, cy + 1);
  ctx.restore();
  // coil: edge-on ellipse at z = 0
  const cx0 = X(0);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx0, cy, Math.max(5, R * 0.22), R, 0, 0, 7); ctx.stroke(); ctx.restore();
  if (L.sense) {
    // current sense +1 = right-handed about +z (rightwards): out of the page at the top, into it at the bottom
    pageSymbol(ctx, cx0, cy - R, 7, L.sense > 0, C.cyan); pageSymbol(ctx, cx0, cy + R, 7, L.sense < 0, C.cyan);
    arrow(ctx, cx0 - L.inducedB * 22, cy, cx0 + L.inducedB * 22, cy, C.green, 2.6, 9);
    // force on the magnet, drawn just above it
    const fy = cy - mh - 12; arrow(ctx, mx - L.force * 4, fy, mx + L.force * 34, fy, C.orange, 2.6, 9);
  }
  // velocity tick under the magnet
  if (v !== 0) arrow(ctx, mx, cy + mh + 12, mx + Math.sign(v) * (14 + 10 * Math.abs(v)), cy + mh + 12, C.text, 1.6, 7);
  // --- NΦ(z) and ε(z) ---
  const zs = []; for (let q = Z2.min; q <= Z2.max + 1e-9; q += Z2.d) zs.push(+q.toFixed(2));
  const opt = { xMin: Z2.min, xMax: Z2.max, xTicks: [-8, -4, 0, 4, 8] };
  const F = panel(ctx, W, { ...opt, top: 210, bottom: 300, yMin: -3.6, yMax: 3.6, yTicks: [-3, 0, 3], yDigits: 0, title: t('c2b') });
  const E = panel(ctx, W, { ...opt, top: 342, bottom: H - 26, yMin: -0.3, yMax: 0.3, yTicks: [-0.3, -0.15, 0, 0.15, 0.3], title: t('c2c') });
  const phiN = q => M.MAG.N * M.dipoleFlux(q / 100, pole) * 1000;
  polyline(ctx, zs.map(q => [F.x(q), F.y(phiN(q))]), C.raw, 1.2, [4, 4]);
  if (v !== 0) polyline(ctx, zs.map(q => [E.x(q), E.y(M.magnetEmf(q / 100, v, pole))]), C.raw, 1.2, [4, 4]);
  // visited stretches, drawn bright
  const segs = []; let cur = null;
  zs.forEach((q, i) => { if (s2.visited[i]) { if (!cur) segs.push(cur = []); cur.push(q); } else cur = null; });
  segs.forEach(sg => {
    polyline(ctx, sg.map(q => [F.x(q), F.y(phiN(q))]), C.violet, 2.4);
    polyline(ctx, sg.map(q => [E.x(q), E.y(M.magnetEmf(q / 100, v, pole))]), C.cyan, 2.4);
  });
  dot(ctx, F.x(zc), F.y(phiN(zc)), 5, C.violet, C.bg); dot(ctx, E.x(zc), E.y(L.emf), 5, C.cyan, C.bg);
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.35; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(F.x(zc), F.P.t); ctx.lineTo(E.x(zc), E.P.b); ctx.stroke(); ctx.restore();
  let txt;
  if (v === 0) txt = t('s2still', { z: fix(zc, 1) });
  else if (Math.abs(zc) < 1e-9) txt = t('s2center');
  else txt = t('s2readout', { z: fix(zc, 1), moving: t(v > 0 ? 'movRight' : 'movLeft', { v: fix(Math.abs(v), 2) }), fdir: t(pole > 0 ? 'dirRight' : 'dirLeft'), trend: t(L.dphi * pole > 0 ? 'trendUp' : 'trendDown'), e: fix(L.emf, 3), dir: t(L.inducedB > 0 ? 'dirRight' : 'dirLeft'), face: L.nearFace, mface: L.magnetFacing, rel: t(L.repel ? 'relRepel' : 'relAttract'), effect: t(L.approaching ? 'effApproach' : 'effLeave') });
  $('r2').textContent = txt;
}
function pass2() {
  const v = num('v2'); if (v === 0) return;
  const from = v > 0 ? Z2.min : Z2.max, to = -from;
  s2.visited.fill(0); s2.last = zIdx(from);
  animate('s2', 4000, p => { const z = Math.round((from + (to - from) * p) / Z2.d) * Z2.d; $('z2').value = z.toFixed(1); mark2(num('z2')); draw2(); }, () => draw2());
}

/* ---------- step 3: a rod sliding on rails ---------- */
const T3 = 8;
const s3 = { prev: null, key: '' };
function draw3() {
  const v0 = num('v03'), R = num('R3'), tt = num('t3'), r = M.rod(v0, R, tt);
  $('v03v').textContent = fix(v0, 1); $('R3v').textContent = fix(R, 1); $('t3v').textContent = fix(tt, 2);
  const key = v0 + '|' + R; if (key !== s3.key) { if (s3.key) s3.prev = s3.key; s3.key = key; }
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3a'), 8, 16, W - 16);
  // rails: horizontal, to scale along x (0 … 6.4 m); spacing drawn at a fixed 64 px (not to scale)
  const xl = 52, xr = W - 16, ytop = 44, ybot = 108, X = m => xl + 40 + m / 6.4 * (xr - xl - 40);
  // field symbols ⊙
  for (let gx = xl + 18; gx < xr; gx += 34) for (const gy of [ytop + 16, ybot - 16]) pageSymbol(ctx, gx, gy, 5, true, C.field);
  const rx = X(r.x);
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.12)'; ctx.fillRect(xl, ytop, rx - xl, ybot - ytop); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xl, ytop); ctx.lineTo(xr, ytop); ctx.moveTo(xl, ybot); ctx.lineTo(xr, ybot); ctx.stroke();
  // resistor (zig-zag) on the left end
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xl, ytop); const zz = 8; for (let i = 0; i <= zz; i++) ctx.lineTo(xl + (i % 2 ? -8 : 8) * (i && i < zz ? 1 : 0), ytop + (ybot - ytop) * i / zz); ctx.lineTo(xl, ybot); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.fillStyle = C.muted; ctx.font = '700 12px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.fillText('R', xl - 12, (ytop + ybot) / 2 + 4); ctx.restore();
  // rod
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(rx, ytop - 6); ctx.lineTo(rx, ybot + 6); ctx.stroke(); ctx.restore();
  // current: the rod moves along +x in a field out of the page, so q v × B pushes positive charge down the rod
  // (towards the lower rail); the current then runs left along the lower rail, up through R and right along the
  // upper rail: clockwise on screen, whose own field points into the page and opposes the growing flux (Lenz).
  const iLen = Math.min(26, 6 + 20 * r.I / 3), mxr = Math.max((xl + rx) / 2, xl + 26);
  if (r.I > 1e-3) {
    arrow(ctx, rx, (ytop + ybot) / 2 - iLen / 2, rx, (ytop + ybot) / 2 + iLen / 2, C.cyan, 2.4, 8);
    arrow(ctx, mxr - iLen / 2, ytop, mxr + iLen / 2, ytop, C.cyan, 2.4, 8);
    arrow(ctx, mxr + iLen / 2, ybot, mxr - iLen / 2, ybot, C.cyan, 2.4, 8);
    const fl = Math.min(44, 8 + 36 * r.F / 1.5); arrow(ctx, rx - 4, ybot + 18, rx - 4 - fl, ybot + 18, C.pink, 2.6, 9);
  }
  if (r.v > 1e-3) arrow(ctx, rx + 6, ytop - 14, rx + 6 + Math.min(44, 10 + 12 * r.v), ytop - 14, C.text, 1.8, 7);
  const Vp = panel(ctx, W, { top: 170, bottom: H - 26, xMin: 0, xMax: T3, yMin: 0, yMax: 3.2, yTicks: [0, 1, 2, 3], yDigits: 0, xTicks: true, xSteps: [1, 2], title: t('c3b') });
  const curve = (a0, aR, tt1) => { const out = []; for (let q = 0; q <= tt1 + 1e-9; q += 0.02) out.push([Vp.x(q), Vp.y(M.rod(a0, aR, q).v)]); return out; };
  if (s3.prev) { const [pv, pR] = s3.prev.split('|').map(Number); polyline(ctx, curve(pv, pR, T3), C.raw, 1.6); }
  polyline(ctx, curve(v0, R, T3), C.cyan, 1.2, [4, 4], 0.6);
  polyline(ctx, curve(v0, R, tt), C.cyan, 2.6);
  // τ marker
  if (r.tau <= T3) { const tv = M.rod(v0, R, r.tau).v; ctx.save(); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.6; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(Vp.x(r.tau), Vp.P.b); ctx.lineTo(Vp.x(r.tau), Vp.y(tv)); ctx.stroke(); ctx.restore(); }
  dot(ctx, Vp.x(tt), Vp.y(r.v), 5.5, C.text, C.bg);
  $('r3').textContent = t('s3readout', { t: fix(tt, 2), v: fix(r.v, 3), emf: fix(r.emf, 3), I: fix(r.I, 3), F: fix(r.F, 3), Q: fix(r.heat, 3), tau: fix(r.tau, 2), xmax: fix(r.xMax, 2) });
}

/* ---------- step 4: a spinning coil ---------- */
const S4 = 0.01, T4W = 2;
const s4 = { t: 0, spinning: false, raf: null, last: null, prevPeak: null, key: '' };
function draw4() {
  const f = num('f4'), B = num('B4'), N = num('N4'), g = M.generator(N, B, S4, f, s4.t);
  const th = ((360 * f * s4.t) % 360 + 360) % 360;
  $('f4v').textContent = fix(f, 1); $('B4v').textContent = fix(B, 1); $('N4v').textContent = String(N);
  $('th4').value = String(Math.round(th / 5) * 5 % 360); $('th4v').textContent = Math.round(th) % 360 + '°';
  $('spin4').textContent = t(s4.spinning ? 'pause' : 'spin');
  const key = f + '|' + B + '|' + N; if (key !== s4.key) { if (s4.key) { const [pf, pB, pN] = s4.key.split('|').map(Number); s4.prevPeak = { f: pf, B: pB, N: pN }; } s4.key = key; }
  // end view
  let { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 16, W - 16);
  const top = 30, bot = H - 12, cx = W / 2, cy = (top + bot) / 2, rr = Math.min(W / 2 - 30, (bot - top) / 2 - 10);
  for (let k = -3; k <= 3; k++) { const Y = cy + k * (bot - top) / 7.5; ctx.save(); ctx.strokeStyle = C.field; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(14, Y); ctx.lineTo(W - 14, Y); ctx.stroke(); ctx.restore(); arrow(ctx, W - 40, Y, W - 22, Y, C.field, 1.2, 6); }
  const a = th * Math.PI / 180; // normal at angle θ from B (B points right); coil plane perpendicular to the normal
  const px = -Math.sin(a), py = -Math.cos(a); // in-plane direction (screen y down)
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - px * rr, cy - py * rr); ctx.lineTo(cx + px * rr, cy + py * rr); ctx.stroke(); ctx.restore();
  arrow(ctx, cx, cy, cx + Math.cos(a) * rr * 0.6, cy - Math.sin(a) * rr * 0.6, C.green, 2.4, 9);
  dot(ctx, cx, cy, 4, C.text);
  // Φ and ε over a 2 s window
  ({ ctx, W, H } = fitCanvas($('c4b')));
  const tw = s4.t % T4W, peakAxis = niceLimit(1.08 * Math.max(g.peak, s4.prevPeak ? M.generator(s4.prevPeak.N, s4.prevPeak.B, S4, s4.prevPeak.f, 0).peak : 0));
  const Pp = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax: T4W, yMin: -11, yMax: 11, yTicks: [-10, 0, 10], yDigits: 0, xTicks: true, xSteps: [0.5, 1], title: t('c4b') });
  const Ep = panel(ctx, W, { top: 194, bottom: H - 26, xMin: 0, xMax: T4W, yMin: -peakAxis, yMax: peakAxis, yTicks: [-peakAxis, -peakAxis / 2, 0, peakAxis / 2, peakAxis], yDigits: 3, xTicks: true, xSteps: [0.5, 1], title: t('c4c') });
  const ser = (m, fn, t1) => { const out = []; for (let q = 0; q <= t1 + 1e-9; q += 0.004) out.push([m.x(q), m.y(fn(q))]); return out; };
  if (s4.prevPeak) { const p = s4.prevPeak; polyline(ctx, ser(Ep, q => M.generator(p.N, p.B, S4, p.f, q).emf, T4W), C.raw, 1.4); }
  polyline(ctx, ser(Pp, q => M.generator(N, B, S4, f, q).phi * 1000, T4W), C.violet, 1.2, [4, 4], 0.6);
  polyline(ctx, ser(Ep, q => M.generator(N, B, S4, f, q).emf, T4W), C.cyan, 1.2, [4, 4], 0.6);
  polyline(ctx, ser(Pp, q => M.generator(N, B, S4, f, q).phi * 1000, tw), C.violet, 2.4);
  polyline(ctx, ser(Ep, q => M.generator(N, B, S4, f, q).emf, tw), C.cyan, 2.4);
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.35; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(Pp.x(tw), Pp.P.t); ctx.lineTo(Ep.x(tw), Ep.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, Pp.x(tw), Pp.y(g.phi * 1000), 5, C.violet, C.bg); dot(ctx, Ep.x(tw), Ep.y(g.emf), 5, C.cyan, C.bg);
  const thr = Math.round(th) % 360;
  const note = thr % 180 === 0 ? t('s4maxPhi') : thr % 180 === 90 ? t('s4zeroPhi') : '';
  $('r4').textContent = t('s4readout', { peak: fix(g.peak, 2), w: fix(g.w, 2), rms: fix(g.rms, 2), th: thr, phi: fix(g.phi * 1000, 2), e: fix(g.emf, 2), note });
}
function spinLoop(now) {
  if (!s4.spinning) return;
  if (s4.last !== null) s4.t += Math.min(0.05, (now - s4.last) / 1000);
  s4.last = now; draw4(); s4.raf = requestAnimationFrame(spinLoop);
}
function stopSpin() { s4.spinning = false; if (s4.raf) cancelAnimationFrame(s4.raf); s4.raf = null; s4.last = null; }
function toggleSpin() {
  if (s4.spinning) { stopSpin(); draw4(); return; }
  if (reduceMotion()) { s4.t += 1 / (8 * num('f4')); draw4(); return; } // reduced motion: one eighth of a turn per press
  s4.spinning = true; s4.last = null; s4.raf = requestAnimationFrame(spinLoop); draw4();
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  ['B0', 'a0', 'th0'].forEach(id => $(id).addEventListener('input', draw0));

  ['Bm1', 'tau1'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s1'); draw1(); }));
  $('run1').addEventListener('click', () => {
    $('run1').disabled = true; $('run1').textContent = t('running');
    animate('s1', M.RAMP.T * 1000, p => { s1.t = p * M.RAMP.T; draw1(); }, () => { s1.t = null; $('run1').disabled = false; $('run1').textContent = t('run'); draw1(); });
  });

  $('z2').addEventListener('input', () => { stopAnim('s2'); mark2(num('z2')); draw2(); });
  $('v2').addEventListener('input', () => { stopAnim('s2'); clear2(); draw2(); });
  $('flip2').addEventListener('click', () => { stopAnim('s2'); s2.pole = -s2.pole; clear2(); draw2(); });
  $('pass2').addEventListener('click', pass2);
  mark2(num('z2'));

  ['v03', 'R3'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s3'); draw3(); }));
  $('t3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('push3').addEventListener('click', () => animate('s3', T3 * 1000, p => { $('t3').value = (p * T3).toFixed(2); draw3(); }));

  ['f4', 'B4', 'N4'].forEach(id => $(id).addEventListener('input', draw4));
  $('th4').addEventListener('input', () => { stopSpin(); s4.t = num('th4') / 360 / num('f4'); draw4(); });
  $('spin4').addEventListener('click', toggleSpin);

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    const fb = $('quizFeedback'); fb.textContent = t(ok ? 'correct' : 'wrong'); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); if (s4.spinning) { stopSpin(); draw4(); } } });
  window.refreshPage = () => { refresh(); if (!anims.s1) $('run1').textContent = t('run'); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
