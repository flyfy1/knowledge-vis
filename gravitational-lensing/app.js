/* gravitational-lensing: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
function arrow(ctx, x1, y1, x2, y2, col, lw) { line(ctx, x1, y1, x2, y2, col, lw || 2); const a = Math.atan2(y2 - y1, x2 - x1), s = 6 + (lw || 2) * 1.6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
function curve(ctx, pts, col, lw) { if (!pts.length) return; ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
function axes(ctx, L, col) { line(ctx, L.x, L.y, L.x, L.y + L.h, col || COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, col || COL.grid, 1); }
/* deterministic RNG so every run of a demo is repeatable */
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const TICKERS = [];
/* ticker(fn): fn(dtSeconds) returns false to stop. Stops when the tab is hidden. */
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
function pointerXY(c, ev) { const r = c.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
function slider10(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value / 10); const o = $(id + 'v'); if (o) o.textContent = (e.value / 10).toFixed(1); }); }

/* Model: point-mass lens, thin-lens weak-field GR, small angles, Euclidean distances (a teaching simplification). Pure functions. */
const G = 6.6743e-11, C = 2.99792458e8, MSUN = 1.98847e30, PC = 3.0856776e16, ASEC = 206264.806;
const deflection = (Msun, b) => 4 * G * Msun * MSUN / (C * C * b);                       // rad, GR (twice the Newtonian value)
const einsteinAngle = (Msun, Dl, Ds) => Math.sqrt(4 * G * Msun * MSUN / (C * C) * (Ds - Dl) / (Dl * Ds));  // rad
const imagePos = u => ({ plus: (u + Math.sqrt(u * u + 4)) / 2, minus: (u - Math.sqrt(u * u + 4)) / 2 });  // in units of theta_E, signed along the source direction
const magnification = u => { const a = (u * u + 2) / (u * Math.sqrt(u * u + 4)); return { plus: (a + 1) / 2, minus: (a - 1) / 2, total: a }; };
const lensMass = (thetaE, Dl, Ds) => thetaE * thetaE * C * C * Dl * Ds / (4 * G * (Ds - Dl)) / MSUN;
const uOfT = (u0, t) => Math.sqrt(u0 * u0 + t * t);
const mapPoint = (bx, by) => { const b = Math.hypot(bx, by); if (b < 1e-9) return null; const p = imagePos(b), ex = bx / b, ey = by / b; return { plus: [p.plus * ex, p.plus * ey], minus: [p.minus * ex, p.minus * ey] }; };
const R_SUN = 6.957e8, KPC = 1000 * PC, MPC = 1e6 * PC;
const SCEN = [{ id: 'sStar', M: 1, Dl: 4 * KPC, Ds: 8 * KPC }, { id: 'sGalaxy', M: 1e12, Dl: 1000 * MPC, Ds: 2000 * MPC }, { id: 'sCluster', M: 1e14, Dl: 1500 * MPC, Ds: 3000 * MPC }];
const fmtAng = rad => { const mas = rad * ASEC * 1000; return mas >= 1000 ? (mas / 1000).toFixed(2) + '″' : mas >= 1 ? mas.toFixed(2) + ' mas' : mas.toExponential(2) + ' mas'; };
const fmtMass = m => m >= 1e9 ? (m / 1e12 >= 0.01 ? (m / 1e12).toFixed(2) + '×10¹² M☉' : (m / 1e9).toFixed(1) + '×10⁹ M☉') : m.toPrecision(3) + ' M☉';
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2);
const S = { logM0: 0, b0: 3, beta1: 5, sc2: 0, logM2: 0, x2: 50, u03: 0.3, t3: 0, beta4: 0.3, rho4: 0.2, th5: 15, Dl5: 1000, f5: 20 };
function sky(ctx, L, scale, cx, cy) { ctx.strokeStyle = '#25384a'; ctx.lineWidth = 1; ctx.strokeRect(L.x, L.y, L.w, L.h); dot(ctx, cx, cy, 5, COL.ink); ctx.strokeStyle = COL.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, scale, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]); }
function render0() {
  $('logM0v').textContent = '10^' + S.logM0.toFixed(1); $('b0v').textContent = S.b0 + ' R☉';
  const { ctx, w, h } = setup($('cv0')), M = Math.pow(10, S.logM0), b = S.b0, alpha = deflection(M, b * R_SUN), cx = w / 2, cy = h * 0.5, r = 28;
  const off = (h * 0.28) * (b - 1) / 49 + 14, y = cy - off - r * 0.4; dot(ctx, cx, cy, Math.min(18, 8 + Math.log10(M) * 2), '#f6d36b'); text(ctx, t('lblMass'), cx, cy + 34, { align: 'center', size: 11, color: '#f6d36b' });
  const ang = Math.min(0.7, 0.3 * Math.sqrt(alpha * ASEC)); line(ctx, 10, y, cx, y, COL.cyan, 2); const ex = cx + (w / 2 - 20) * Math.cos(ang), ey = y + (w / 2 - 20) * Math.sin(ang); line(ctx, cx, y, ex, ey, COL.cyan, 2);
  line(ctx, cx, cy, cx, y, COL.muted, 1, [3, 3]); text(ctx, 'b', cx + 6, (cy + y) / 2, { size: 12 }); text(ctx, t('lblExag'), 10, h - 8, { size: 10 }); line(ctx, cx, y, cx + 70, y, COL.muted, 1, [3, 3]);
  $('ro0').textContent = t('s0ro', { M: M >= 1000 ? M.toExponential(0) : M, b: b, a: (alpha * ASEC).toFixed(alpha * ASEC < 0.01 ? 4 : 3), n: (alpha * ASEC / 2).toFixed(alpha * ASEC < 0.01 ? 4 : 3) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), beta = S.beta1, s = Math.min(w, h) * 0.14, cx = w / 2, cy = h / 2, L = { x: 6, y: 6, w: w - 12, h: h - 12 }, im = imagePos(beta), mg = magnification(Math.max(beta, 0.01));
  sky(ctx, L, s, cx, cy); const sx = cx + beta * s; dot(ctx, sx, cy, 5, COL.green); text(ctx, t('lblSource'), sx, cy + 18, { align: 'center', size: 11, color: COL.green });
  dot(ctx, cx + im.plus * s, cy, 7, COL.orange); dot(ctx, cx + im.minus * s, cy, 5, COL.orange); text(ctx, t('lblImgP'), cx + im.plus * s, cy - 12, { align: 'center', size: 11, color: COL.orange }); text(ctx, t('lblImgM'), cx + im.minus * s, cy - 12, { align: 'center', size: 11, color: COL.orange }); text(ctx, t('lblRing'), cx, cy - s - 6, { align: 'center', size: 10, color: COL.muted });
  if (beta < 0.05) { ctx.strokeStyle = COL.orange; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, s, 0, 6.2832); ctx.stroke(); }
  $('beta1v').textContent = beta.toFixed(1); $('ro1').textContent = beta < 0.05 ? t('s1roRing') : t('s1ro', { b: f2(beta), p: f2(im.plus), m: f2(im.minus), mp: f2(mg.plus), mm: f2(mg.minus), tot: f2(mg.total) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), sc = SCEN[S.sc2], M = Math.pow(10, S.logM2), Ds = sc.Ds, Dl = Ds * S.x2 / 100, th = einsteinAngle(M, Dl, Ds), L = { x: 14, y: 30, w: w - 28, h: h - 64 }, lo = -3.5, hi = 2.5, X = v => L.x + (Math.log10(v) - lo) / (hi - lo) * L.w;
  $('lm2v').textContent = '10^' + S.logM2.toFixed(1); $('x2v').textContent = S.x2 + '%'; ctx.fillStyle = '#101d2a'; ctx.fillRect(L.x, L.y + 20, L.w, 22);
  [[1e-3, 'lblMas'], [1, 'lblAsec'], [0.05, 'lblHst'], [1, 'lblSeeing']].forEach(([v, k], i) => { const x = X(i === 2 ? 0.05 : v); line(ctx, x, L.y + 14, x, L.y + 52, COL.muted, 1.2, [3, 3]); text(ctx, t(k), x, L.y + 64 + (i === 3 ? 14 : 0), { align: 'center', size: 10, color: COL.muted }); });
  const thAs = th * ASEC, xx = X(Math.max(1e-3 * 0.001, thAs)); ctx.fillStyle = COL.orange; ctx.fillRect(L.x, L.y + 20, Math.max(2, Math.min(L.w, xx - L.x)), 22); dot(ctx, Math.min(L.x + L.w - 4, xx), L.y + 31, 7, COL.red); const rightSide = xx > L.x + L.w * 0.5; text(ctx, t('lblEin', { v: fmtAng(th) }), Math.min(L.x + L.w - 4, Math.max(L.x + 4, xx)), L.y + 12, { align: rightSide ? 'right' : 'left', size: 12, color: COL.orange, bold: true });
  text(ctx, t('axAng'), L.x, L.y + L.h + 26, { size: 10 }); SCEN.forEach((q, i) => { const b = $('sc' + i); b.classList.toggle('active', i === S.sc2); b.setAttribute('aria-pressed', i === S.sc2 ? 'true' : 'false'); });
  $('ro2').textContent = t('s2ro', { sc: t(sc.id), M: fmtMass(M), Dl: (Dl / PC >= 1e6 ? (Dl / MPC).toFixed(0) + ' Mpc' : (Dl / KPC).toFixed(1) + ' kpc'), Ds: (Ds / PC >= 1e6 ? (Ds / MPC).toFixed(0) + ' Mpc' : (Ds / KPC).toFixed(1) + ' kpc'), th: fmtAng(th), res: thAs > 0.05 ? t('vResolved') : t('vUnresolved') });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), u0 = S.u03, tt = S.t3, uu = uOfT(u0, tt), s = Math.min(w * 0.18, h * 0.16), top = { x: 6, y: 6, w: w - 12, h: h * 0.42 }, cx = w / 2, cy = top.y + top.h / 2;
  sky(ctx, top, s, cx, cy); line(ctx, top.x + 4, cy - u0 * s, top.x + top.w - 4, cy - u0 * s, '#35566b', 1, [4, 4]); const sx = cx + tt * s, sy = cy - u0 * s; dot(ctx, sx, sy, 5, COL.green); const im = mapPoint(tt, u0); if (im) { dot(ctx, cx + im.plus[0] * s, cy - im.plus[1] * s, 6, COL.orange); dot(ctx, cx + im.minus[0] * s, cy - im.minus[1] * s, 4, COL.orange); }
  const B = { x: 40, y: top.y + top.h + 22, w: w - 56, h: h - (top.y + top.h) - 56 }; axes(ctx, B); const amax = Math.max(3, magnification(u0).total * 1.1), X = q => B.x + (q + 3) / 6 * B.w, Y = a => B.y + B.h - (a - 1) / (amax - 1) * B.h;
  const pts = []; for (let q = -3; q <= 3.001; q += 0.05) pts.push([X(q), Y(magnification(uOfT(u0, q)).total)]); curve(ctx, pts, COL.orange, 2.5); line(ctx, X(tt), B.y, X(tt), B.y + B.h, COL.cyan, 1.2, [3, 3]); dot(ctx, X(tt), Y(magnification(uu).total), 6, COL.cyan);
  text(ctx, t('axTimeE'), B.x + B.w, B.y + B.h + 14, { align: 'right', size: 11 }); text(ctx, t('axAmp'), B.x + 4, B.y + 10, { size: 11 }); [-2, 0, 2].forEach(q => text(ctx, String(q), X(q), B.y + B.h + 14, { align: 'center', size: 10 }));
  $('u03v').textContent = u0.toFixed(2); $('t3v').textContent = tt.toFixed(1); $('ro3').textContent = t('s3ro', { u0: f2(u0), peak: f2(magnification(u0).total), t: tt.toFixed(1), u: f2(uu), A: f2(magnification(uu).total) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), beta = S.beta4, rho = S.rho4, s = Math.min(w, h) * 0.3, cx = w / 2, cy = h / 2, L = { x: 6, y: 6, w: w - 12, h: h - 12 }; sky(ctx, L, s, cx, cy);
  ctx.strokeStyle = COL.green; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx + beta * s, cy, rho * s, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
  const N = 240, outer = [], inner = []; for (let i = 0; i <= N; i++) { const a = i / N * 6.2832, im = mapPoint(beta + rho * Math.cos(a), rho * Math.sin(a)); if (!im) continue; outer.push([cx + im.plus[0] * s, cy - im.plus[1] * s]); inner.push([cx + im.minus[0] * s, cy - im.minus[1] * s]); }
  [outer, inner].forEach(poly => { ctx.fillStyle = 'rgba(246,164,91,.55)'; ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.5; ctx.beginPath(); poly.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); ctx.stroke(); });
  text(ctx, t('lblSourceExt'), cx + beta * s, cy + rho * s + 14, { align: 'center', size: 10, color: COL.green }); $('beta4v').textContent = beta.toFixed(2); $('rho4v').textContent = rho.toFixed(2);
  $('ro4').textContent = t('s4ro', { b: f2(beta), r: f2(rho), kind: beta < rho * 0.6 ? t('kRingLike') : beta < 1 ? t('kArc') : t('kTwo') });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), th = S.th5 / 10 / ASEC, Dl = S.Dl5 * MPC, Ds = Dl * S.f5 / 10, M = lensMass(th, Dl, Ds), cy = h * 0.45, ox = 24, lx = ox + (w - 80) * 0.35, sx = w - 30;
  line(ctx, ox, cy, sx, cy, '#25384a', 1.5, [4, 4]); dot(ctx, ox, cy, 6, COL.cyan); text(ctx, t('lblObs'), ox, cy + 22, { align: 'center', size: 11 }); dot(ctx, lx, cy, 9, '#f6d36b'); text(ctx, t('lblLensG'), lx, cy + 22, { align: 'center', size: 11, color: '#f6d36b' }); dot(ctx, sx, cy, 6, COL.green); text(ctx, t('lblSrc'), w - 6, cy + 22, { align: 'right', size: 11, color: COL.green });
  const ang = Math.min(0.5, th * 6); [-1, 1].forEach(sg => { line(ctx, sx, cy, lx, cy + sg * (lx - ox) * Math.tan(ang) * 0.6, COL.orange, 1.6); line(ctx, lx, cy + sg * (lx - ox) * Math.tan(ang) * 0.6, ox, cy, COL.orange, 1.6); });
  text(ctx, t('lblDlDs', { dl: S.Dl5, ds: Math.round(S.Dl5 * S.f5 / 10) }), w / 2, 18, { align: 'center', size: 11 }); text(ctx, t('lblInferred', { m: fmtMass(M) }), w / 2, h - 18, { align: 'center', size: 14, color: COL.orange, bold: true });
  $('th5v').textContent = (S.th5 / 10).toFixed(1) + '″'; $('Dl5v').textContent = S.Dl5 + ' Mpc'; $('f5v').textContent = '×' + (S.f5 / 10).toFixed(1);
  $('ro5').textContent = t('s5ro', { th: (S.th5 / 10).toFixed(1), Dl: S.Dl5, Ds: Math.round(S.Dl5 * S.f5 / 10), m: fmtMass(M) });
}
function wire() {
  $('logM0').addEventListener('input', e => { S.logM0 = +e.target.value / 2; render0(); }); slider('b0', v => { S.b0 = v; render0(); });
  slider10('beta1', v => { S.beta1 = v; render1(); });
  SCEN.forEach((q, i) => $('sc' + i).addEventListener('click', () => { S.sc2 = i; S.logM2 = Math.log10(q.M); $('lm2').value = Math.round(S.logM2 * 2); S.x2 = Math.round(q.Dl / q.Ds * 100); $('x2').value = S.x2; render2(); }));
  $('lm2').addEventListener('input', e => { S.logM2 = +e.target.value / 2; render2(); }); $('x2').addEventListener('input', e => { S.x2 = +e.target.value; render2(); });
  $('u03').addEventListener('input', e => { S.u03 = +e.target.value / 20; render3(); }); $('t3').addEventListener('input', e => { S.t3 = +e.target.value / 10; render3(); });
  $('beta4').addEventListener('input', e => { S.beta4 = +e.target.value / 100; render4(); }); $('rho4').addEventListener('input', e => { S.rho4 = +e.target.value / 100; render4(); });
  $('th5').addEventListener('input', e => { S.th5 = +e.target.value; render5(); }); $('Dl5').addEventListener('input', e => { S.Dl5 = +e.target.value; render5(); }); $('f5').addEventListener('input', e => { S.f5 = +e.target.value; render5(); });
}

/* boot */
const RENDERS = [render0, render1, render2, render3, render4, render5];
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();

if (typeof module !== 'undefined') module.exports = { deflection, einsteinAngle, imagePos, magnification, lensMass, uOfT, mapPoint, SCEN, ASEC, MSUN, R_SUN, MPC, KPC };
