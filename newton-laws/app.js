/* newton-laws: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
const COL = { cyan: '#67d7f9', orange: '#f6a45b', green: '#74dfaa', red: '#e0644e', violet: '#b79cff', ink: '#eaf4f8', muted: '#a8bac4', grid: '#294052', dim: '#1b2d3c' };
const $ = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function setup(c) {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const w = Math.max(200, Math.round(c.getBoundingClientRect().width || 300));
  const ratio = (w >= 560 && c.dataset.wide) ? +c.dataset.wide : +c.dataset.ratio;
  const h = Math.round(w * ratio);
  c.style.height = h + 'px';
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (c.width !== bw) c.width = bw;
  if (c.height !== bh) c.height = bh;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h, wide: w >= 560 };
}
function text(ctx, s, x, y, o) { o = o || {}; ctx.fillStyle = o.color || COL.muted; ctx.font = (o.bold ? '600 ' : '') + (o.size || 13) + 'px system-ui,sans-serif'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic'; ctx.fillText(s, x, y); }
function line(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); }
function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
function slider(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value); const o = $(id + 'v'); if (o) o.textContent = e.value; }); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const G = 9.8, T_END = 3, XMAX = 45, TP = 0.5;
/* Flat floor: pushing force F on mass m with kinetic = static friction coefficient mu. Friction can only cancel the push up to mu*m*g. */
function flatForces(F, m, mu) { const fmax = mu * m * G, fr = Math.min(F, fmax), net = F - fr; return { fmax, fr, net, a: net / m, moves: F > fmax }; }
const dist = (a, t) => 0.5 * a * t * t;
/* Block on a slope of angle theta (deg): gravity splits into a part along the slope and a part pressing into it. */
function slope(thetaDeg, mu) { const th = thetaDeg * Math.PI / 180, along = G * Math.sin(th), press = G * Math.cos(th), fr = Math.min(along, mu * press); return { along, press, fr, a: along - fr, moves: along > mu * press }; }
/* Two carts pushed apart by equal and opposite forces F for TP seconds, then coast. */
function pushApart(F, m1, m2) { const a1 = F / m1, a2 = F / m2, v1 = a1 * TP, v2 = a2 * TP; return { a1, a2, v1, v2, p1: m1 * v1, p2: m2 * v2, ratio: a1 / a2 }; }
const cartPos = (a, t) => t <= TP ? 0.5 * a * t * t : 0.5 * a * TP * TP + a * TP * (t - TP);
/* Scale reading in a lift with upward acceleration a (negative = downward). */
function scaleReading(m, a) { const N = Math.max(0, m * (G + a)); return { N, kg: N / G, W: m * G }; }
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100);
const S = { tau: [T_END, T_END, T_END, 2, 2], raf: [0, 0, 0, 0, 0], F0: 10, F1: 10, m1: 2, F2: 14, mu2: 0.3, th3: 30, mu3: 0.2, F4: 20, ma: 2, mb: 6, am: 70, ac: 2 };
function arrow(ctx, x1, y1, x2, y2, col, lw) { if (Math.hypot(x2 - x1, y2 - y1) < 2) return; line(ctx, x1, y1, x2, y2, col, lw || 3); const a = Math.atan2(y2 - y1, x2 - x1); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(a - 0.45), y2 - 9 * Math.sin(a - 0.45)); ctx.lineTo(x2 - 9 * Math.cos(a + 0.45), y2 - 9 * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); }
function box(ctx, x, y, bw, bh, col, alpha) { ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.fillRect(x, y - bh, bw, bh); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.strokeRect(x, y - bh, bw, bh); ctx.globalAlpha = 1; }
/* Stroboscopic flat view: one ghost box every 0.5 s up to time tau; returns the live box rectangle. */
function strobe(ctx, w, h, a, tau, mass, o) {
  const pad = 22, bw = 26, bh = 22, gy = h * 0.74, sc = (w - 2 * pad - bw) / XMAX; line(ctx, pad, gy, w - pad, gy, COL.grid, 2);
  for (let x = 0; x <= XMAX; x += 5) { const px = pad + x * sc; line(ctx, px, gy, px, gy + 5, COL.grid, 1); if (x % 10 === 0) text(ctx, String(x), px + bw / 2, gy + 18, { align: 'center', size: 10 }); }
  text(ctx, t('posAxis'), w - pad, gy + 34, { align: 'right', size: 11 });
  for (let k = 0; k * 0.5 <= tau + 1e-9; k++) { const tt = k * 0.5, x = dist(a, tt); if (x > XMAX) { text(ctx, '›', w - pad, gy - 8, { size: 16, color: COL.orange }); break; } box(ctx, pad + x * sc, gy, bw, bh, COL.cyan, 0.15 + 0.45 * tt / T_END); if (k % 2 === 0) text(ctx, t('tTick', { t: tt }), pad + x * sc + bw / 2, gy - bh - 6 - (k % 4 ? 12 : 0), { align: 'center', size: 10 }); }
  const x = Math.min(dist(a, tau), XMAX), bx = pad + x * sc; box(ctx, bx, gy, bw, bh, COL.cyan, 1); text(ctx, mass + ' kg', bx + bw / 2, gy - bh / 2 + 4, { align: 'center', size: 10, color: '#0a0e14', bold: true });
  text(ctx, t('clock', { t: f1(tau) }), pad, 18, { size: 13, color: COL.orange }); return { bx, gy, bw, bh };
}
function render0() { const { ctx, w, h } = setup($('cv0')), F = S.F0, m = 2, a = F / m, r = strobe(ctx, w, h, a, S.tau[0], m); arrow(ctx, r.bx - 4 - F * 3, r.gy - r.bh / 2, r.bx - 4, r.gy - r.bh / 2, COL.orange, 4); text(ctx, t('push'), r.bx - 4 - F * 3, r.gy - r.bh / 2 - 8, { size: 11, color: COL.orange });
  $('F0v').textContent = F; $('ro0').textContent = t('s0ro', { F, m, a: f2(a), v: f2(a * T_END), x: f2(dist(a, T_END)) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), F = S.F1, m = S.m1, a = F / m, r = strobe(ctx, w, h, a, S.tau[1], m); arrow(ctx, r.bx - 4 - F * 3, r.gy - r.bh / 2, r.bx - 4, r.gy - r.bh / 2, COL.orange, 4);
  $('F1v').textContent = F; $('m1v').textContent = m; $('ro1').textContent = t('s1ro', { F, m, a: f2(a), dbl: f2(F / (2 * m)) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), F = S.F2, m = 3, mu = S.mu2, d = flatForces(F, m, mu), r = strobe(ctx, w, h, d.a, S.tau[2], m), cy = r.gy - r.bh / 2;
  arrow(ctx, r.bx - 4 - F * 3, cy - 14, r.bx - 4, cy - 14, COL.orange, 4); text(ctx, t('push'), r.bx - 4 - F * 3, cy - 22, { size: 11, color: COL.orange });
  arrow(ctx, r.bx + r.bw + 4, cy + 4, r.bx + r.bw + 4 + d.fr * 3, cy + 4, COL.red, 4); text(ctx, t('fric'), r.bx + r.bw + 4 + d.fr * 3, cy + 22, { size: 11, color: COL.red });
  $('F2v').textContent = F; $('mu2v').textContent = mu;
  $('ro2').textContent = t('s2ro', { F, fr: f2(d.fr), net: f2(d.net), a: f2(d.a), mu, fmax: f2(d.fmax), state: t(d.moves ? 'stMove' : 'stStuck') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), d = slope(S.th3, S.mu3), th = S.th3 * Math.PI / 180, tau = S.tau[3], L = 20;
  const bx0 = 30, by0 = h * 0.86, len = Math.min((w - 70) / Math.cos(th), (h * 0.72) / Math.max(Math.sin(th), 0.05)), sc = len / L, ux = Math.cos(th), uy = -Math.sin(th);
  ctx.fillStyle = '#16293a'; ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx0 + len * ux, by0); ctx.lineTo(bx0 + len * ux, by0 + len * uy); ctx.closePath(); ctx.fill(); line(ctx, bx0, by0, bx0 + len * ux, by0 + len * uy, COL.cyan, 3);
  const bw = 22, bh = 16, place = (s, alpha, solid) => { const px = bx0 + s * sc * ux - 0, py = by0 + s * sc * uy; ctx.save(); ctx.translate(px, py); ctx.rotate(-th); box(ctx, 0, 0, bw, bh, solid ? COL.orange : COL.cyan, alpha); ctx.restore(); return { px, py }; };
  const start = L * 0.98; for (let k = 0; k * 0.5 <= tau + 1e-9; k++) { const s = Math.max(0, start - dist(d.a, k * 0.5)); place(s, 0.15 + 0.4 * k * 0.5 / 2, false); }
  const sl = Math.max(0, start - dist(d.a, tau)), p = place(sl, 1, true), nx = -Math.sin(th), ny = -Math.cos(th), cx = p.px + ux * bw / 2 + nx * bh / 2, cy = p.py + uy * bw / 2 + ny * bh / 2, k = 5;
  arrow(ctx, cx, cy, cx, cy + G * k, COL.violet, 3); text(ctx, 'mg', cx + 6, cy + G * k + 4, { size: 11, color: COL.violet });
  arrow(ctx, cx, cy, cx - ux * d.along * k, cy - uy * d.along * k, COL.green, 3); if (d.fr > 0.05) arrow(ctx, cx + nx * 6, cy + ny * 6, cx + nx * 6 + ux * d.fr * k, cy + ny * 6 + uy * d.fr * k, COL.red, 3);
  text(ctx, t('clock', { t: f1(tau) }), 12, 18, { size: 13, color: COL.orange }); text(ctx, t('slopeNote', { th: S.th3 }), w - 12, 18, { align: 'right', size: 12 });
  $('th3v').textContent = S.th3; $('mu3v').textContent = S.mu3; $('ro3').textContent = t('s3ro', { th: S.th3, along: f2(d.along), fr: f2(d.fr), a: f2(d.a), state: t(d.moves ? 'stSlide' : 'stHold') }); }
function render4() { const { ctx, w, h } = setup($('cv4')), F = S.F4, m1 = S.ma, m2 = S.mb, d = pushApart(F, m1, m2), tau = S.tau[4], pad = 22, gy = h * 0.74, cx = w / 2, sc = (w / 2 - pad - 20) / 32, bw = 26, bh = 22;
  line(ctx, pad, gy, w - pad, gy, COL.grid, 2); const step = 0.5; for (let k = 0; k * step <= tau + 1e-9; k++) { const tt = k * step, x1 = cartPos(d.a1, tt), x2 = cartPos(d.a2, tt), al = 0.15 + 0.4 * tt / T_END; if (x1 <= 32) box(ctx, cx - x1 * sc - bw, gy, bw, bh, COL.cyan, al); if (x2 <= 32) box(ctx, cx + x2 * sc, gy, bw, bh, COL.violet, al); }
  const x1 = Math.min(cartPos(d.a1, tau), 32), x2 = Math.min(cartPos(d.a2, tau), 32); box(ctx, cx - x1 * sc - bw, gy, bw, bh, COL.cyan, 1); box(ctx, cx + x2 * sc, gy, bw, bh, COL.violet, 1);
  text(ctx, m1 + ' kg', cx - x1 * sc - bw / 2, gy - bh / 2 + 4, { align: 'center', size: 10, color: '#0a0e14', bold: true }); text(ctx, m2 + ' kg', cx + x2 * sc + bw / 2, gy - bh / 2 + 4, { align: 'center', size: 10, color: '#0a0e14', bold: true });
  if (tau < TP) { arrow(ctx, cx - x1 * sc - bw, gy - bh - 8, cx - x1 * sc - bw - F * 2, gy - bh - 8, COL.orange, 3); arrow(ctx, cx + x2 * sc + bw, gy - bh - 8, cx + x2 * sc + bw + F * 2, gy - bh - 8, COL.orange, 3); text(ctx, t('pairNote', { F }), cx, 34, { align: 'center', size: 12, color: COL.orange }); }
  text(ctx, t('clock', { t: f1(tau) }), 12, 18, { size: 13, color: COL.orange }); $('F4v').textContent = F; $('ma4v').textContent = m1; $('mb4v').textContent = m2;
  $('ro4').textContent = t('s4ro', { F, m1, m2, a1: f2(d.a1), a2: f2(d.a2), v1: f2(d.v1), v2: f2(d.v2), p: f2(d.p1 - d.p2), ratio: f2(d.ratio), inv: f2(m2 / m1) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), m = S.am, a = S.ac, r = scaleReading(m, a), cx = w * 0.3, top = 14, bot = h - 14;
  ctx.strokeStyle = COL.muted; ctx.lineWidth = 2; ctx.strokeRect(cx - 50, top + 8, 100, bot - top - 16); dot(ctx, cx, bot - 70, 10, COL.ink); line(ctx, cx, bot - 60, cx, bot - 28, COL.ink, 3); line(ctx, cx - 14, bot - 14 - 14, cx + 14, bot - 14 - 14, COL.ink, 3);
  ctx.fillStyle = COL.dim; ctx.fillRect(cx - 30, bot - 22, 60, 8); arrow(ctx, cx + 62, h / 2, cx + 62, h / 2 - a * 7, COL.green, 4); text(ctx, t('liftAcc', { a: f1(a) }), cx + 70, h / 2 + 4, { size: 11, color: COL.green });
  const bx = w * 0.58, bwid = Math.min(60, w * 0.12), maxN = m * (G + 6) * 1.05, Y = n => bot - 20 - n / maxN * (bot - top - 40); ctx.fillStyle = COL.dim; ctx.fillRect(bx, top + 10, bwid, bot - top - 30);
  ctx.fillStyle = r.N > r.W + 0.01 ? COL.orange : r.N < r.W - 0.01 ? COL.cyan : COL.green; ctx.fillRect(bx, Y(r.N), bwid, bot - 20 - Y(r.N)); line(ctx, bx - 8, Y(r.W), bx + bwid + 8, Y(r.W), COL.violet, 2, [5, 4]); text(ctx, t('wLine', { W: Math.round(r.W) }), bx + bwid + 12, Y(r.W) + 4, { size: 11, color: COL.violet }); text(ctx, t('nBar', { N: Math.round(r.N) }), bx, bot - 4, { size: 11, color: COL.ink });
  $('am5v').textContent = m; $('ac5v').textContent = a; $('ro5').textContent = t('s5ro', { m, a: f1(a), N: Math.round(r.N), kg: f1(r.kg), feel: t(a > 0.05 ? 'feelHeavy' : a < -0.05 ? (r.N === 0 ? 'feelNone' : 'feelLight') : 'feelSame') }); }
function replay(i) { cancelAnimationFrame(S.raf[i]); const end = i >= 3 ? 2 : T_END; if (reduceMotion()) { S.tau[i] = end; RENDERS[i](); return; } S.tau[i] = 0; const t0 = performance.now(); const tick = now => { S.tau[i] = Math.max(0, Math.min(end, (now - t0) / 1000)); RENDERS[i](); if (S.tau[i] < end) S.raf[i] = requestAnimationFrame(tick); }; S.raf[i] = requestAnimationFrame(tick); }
function stopAll() { S.raf.forEach((r, i) => { cancelAnimationFrame(r); S.tau[i] = i >= 3 ? 2 : T_END; }); }
function onHide() { stopAll(); renderAll(); }
function wire() {
  slider('F0', v => { S.F0 = v; render0(); }); slider('F1', v => { S.F1 = v; render1(); }); slider('m1', v => { S.m1 = v; render1(); }); slider('F2', v => { S.F2 = v; render2(); }); slider('mu2', v => { S.mu2 = v; render2(); });
  slider('th3', v => { S.th3 = v; render3(); }); slider('mu3', v => { S.mu3 = v; render3(); }); slider('F4', v => { S.F4 = v; render4(); }); slider('ma4', v => { S.ma = v; render4(); }); slider('mb4', v => { S.mb = v; render4(); }); slider('am5', v => { S.am = v; render5(); }); slider('ac5', v => { S.ac = v; render5(); });
  [0, 1, 2, 3, 4].forEach(i => $('rp' + i).addEventListener('click', () => replay(i)));
}

const RENDERS = [typeof render0 === 'function' && render0, typeof render1 === 'function' && render1, typeof render2 === 'function' && render2, typeof render3 === 'function' && render3, typeof render4 === 'function' && render4, typeof render5 === 'function' && render5].filter(Boolean);
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && typeof onHide === 'function') onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();
if (typeof module !== 'undefined') module.exports = { G, flatForces, slope, pushApart, scaleReading, dist, cartPos };
