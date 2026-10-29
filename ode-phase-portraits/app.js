/* ode-phase-portraits: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const P0 = { a: 1, b: 0.5, c: 0.75, d: 0.25, e: 0 };
const TMAX = 30, DT = 0.01, SAMPLE = 5;
/* Predator-prey: prey x grows at rate a (slowed by crowding e*x), predators y eat prey at rate b, and convert it into growth at rate d, dying at rate c. */
const deriv = (s, p) => [p.a * s[0] * (1 - p.e * s[0]) - p.b * s[0] * s[1], -p.c * s[1] + p.d * s[0] * s[1]];
function rk4(s, p, h) { const k1 = deriv(s, p), s2 = [s[0] + h / 2 * k1[0], s[1] + h / 2 * k1[1]], k2 = deriv(s2, p), s3 = [s[0] + h / 2 * k2[0], s[1] + h / 2 * k2[1]], k3 = deriv(s3, p), s4 = [s[0] + h * k3[0], s[1] + h * k3[1]], k4 = deriv(s4, p); return [s[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), s[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; }
const euler = (s, p, h) => { const k = deriv(s, p); return [s[0] + h * k[0], s[1] + h * k[1]]; };
const Hq = (s, p) => p.d * s[0] - p.c * Math.log(s[0]) + p.b * s[1] - p.a * Math.log(s[1]);
const equil = p => { const x = p.c / p.d; return [x, (p.a / p.b) * (1 - p.e * x)]; };
/* Sample the solution every SAMPLE steps; stop if values leave the plotted range for good. */
function traj(x0, y0, p, T, h, method) { const step = method === 'euler' ? euler : rk4, out = [[0, x0, y0]]; let s = [x0, y0], n = Math.round(T / h); for (let k = 1; k <= n; k++) { s = step(s, p, h); if (!isFinite(s[0]) || !isFinite(s[1]) || s[0] > 1e6 || s[1] > 1e6) { out.push([k * h, NaN, NaN]); break; } if (k % Math.max(1, Math.round(SAMPLE * DT / h)) === 0) out.push([k * h, s[0], s[1]]); } return out; }
const f2 = v => String(Math.round(v * 100) / 100), f1 = v => String(Math.round(v * 10) / 10);
const S = { x0: 4, y0: 1, rev: [1, 1, 1, 1, 1, 1], raf: [0, 0, 0, 0, 0, 0], x1: 6, y1: 2, px: 5, py: 4, meth: 'rk4', dt: 0.05, a4: 1, c4: 0.75, e5: 0.1 };
const XR = [0, 10], YR = [0, 8];
function frame(ctx, R, xr, yr, xl, yl) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); const X = v => R.x + (v - xr[0]) / (xr[1] - xr[0]) * R.w, Y = v => R.y + R.h - (v - yr[0]) / (yr[1] - yr[0]) * R.h;
  for (let v = Math.ceil(xr[0]); v <= xr[1]; v += Math.max(1, Math.round((xr[1] - xr[0]) / 6))) { text(ctx, String(v), X(v), R.y + R.h + 14, { align: 'center', size: 10 }); } for (let v = Math.ceil(yr[0]); v <= yr[1]; v += Math.max(1, Math.round((yr[1] - yr[0]) / 4))) text(ctx, String(v), R.x - 5, Y(v) + 4, { align: 'right', size: 10 });
  if (xl) text(ctx, xl, R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); if (yl) text(ctx, yl, R.x + 2, R.y - 4, { size: 11 }); return { X, Y, R }; }
function field(ctx, M, R, p, n) { for (let i = 1; i < n; i++) for (let j = 1; j < n * 0.8; j++) { const x = XR[0] + (XR[1] - XR[0]) * i / n, y = YR[0] + (YR[1] - YR[0]) * j / (n * 0.8), d = deriv([x, y], p), l = Math.hypot(d[0] / (XR[1] - XR[0]), d[1] / (YR[1] - YR[0])) || 1, ux = d[0] / (XR[1] - XR[0]) / l, uy = d[1] / (YR[1] - YR[0]) / l, px = M.X(x), py = M.Y(y), len = 9;
    ctx.strokeStyle = 'rgba(168,186,196,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px - ux * len / 2, py + uy * len / 2); ctx.lineTo(px + ux * len / 2, py - uy * len / 2); ctx.stroke(); dot(ctx, px + ux * len / 2, py - uy * len / 2, 1.8, 'rgba(168,186,196,0.8)'); } }
function drawPath(ctx, M, pts, col, frac, lw) { ctx.save(); ctx.beginPath(); ctx.rect(M.R.x, M.R.y, M.R.w, M.R.h); ctx.clip(); const n = Math.max(1, Math.floor((pts.length - 1) * frac)); ctx.strokeStyle = col; ctx.lineWidth = lw || 2.5; ctx.beginPath(); let started = false, last = null; for (let k = 0; k <= n; k++) { const p = pts[k]; if (!isFinite(p[1])) break; const px = M.X(p[1]), py = M.Y(p[2]); started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; last = p; } ctx.stroke(); if (last) dot(ctx, M.X(last[1]), M.Y(last[2]), 5, col); ctx.restore(); return last; }
const rect = (w, h, lm) => ({ x: lm || 36, y: 18, w: w - (lm || 36) - 14, h: h - 56 });
function render0() { const { ctx, w, h } = setup($('cv0')), R = rect(w, h), tr = traj(S.x0, S.y0, P0, TMAX, DT, 'rk4'), yr = [0, Math.max(8, Math.ceil(Math.max(...tr.map(p => isFinite(p[1]) ? Math.max(p[1], p[2]) : 0)) * 1.1))], M = frame(ctx, R, [0, TMAX], yr, t('timeAxis'), t('popAxis')), fr = S.rev[0], n = Math.max(1, Math.floor((tr.length - 1) * fr));
  const draw = (ix, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= n; k++) { const q = tr[k]; k ? ctx.lineTo(M.X(q[0]), M.Y(q[ix])) : ctx.moveTo(M.X(q[0]), M.Y(q[ix])); } ctx.stroke(); dot(ctx, M.X(tr[n][0]), M.Y(tr[n][ix]), 4.5, col); };
  draw(1, COL.cyan); draw(2, COL.orange); text(ctx, t('legPrey'), R.x + 8, R.y + 14, { size: 12, color: COL.cyan }); text(ctx, t('legPred'), R.x + 8, R.y + 30, { size: 12, color: COL.orange }); $('x0v').textContent = S.x0; $('y0v').textContent = S.y0;
  const q = tr[n]; $('ro0').textContent = t('s0ro', { x0: S.x0, y0: S.y0, tt: f1(q[0]), x: f2(q[1]), y: f2(q[2]) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), R = rect(w, h), M = frame(ctx, R, XR, YR, t('preyAxis'), t('predAxis')); field(ctx, M, R, P0, 10); const e = equil(P0), tr = traj(S.x1, S.y1, P0, TMAX, DT, 'rk4'), last = drawPath(ctx, M, tr, COL.orange, S.rev[1]);
  dot(ctx, M.X(e[0]), M.Y(e[1]), 5, COL.green); text(ctx, t('eqLabel'), M.X(e[0]) + 8, M.Y(e[1]) - 6, { size: 11, color: COL.green }); dot(ctx, M.X(S.x1), M.Y(S.y1), 4, COL.ink); $('x1v').textContent = S.x1; $('y1v').textContent = S.y1;
  const xs = tr.map(q => q[1]), ys = tr.map(q => q[2]); $('ro1').textContent = t('s1ro', { x0: S.x1, y0: S.y1, xmin: f2(Math.min(...xs)), xmax: f2(Math.max(...xs)), ymin: f2(Math.min(...ys)), ymax: f2(Math.max(...ys)) }); }
const sgn = v => v > 1e-9 ? 'up' : v < -1e-9 ? 'down' : 'flat';
function render2() { const { ctx, w, h } = setup($('cv2')), R = rect(w, h), M = frame(ctx, R, XR, YR, t('preyAxis'), t('predAxis')); field(ctx, M, R, P0, 10); const e = equil(P0);
  line(ctx, M.X(XR[0]), M.Y(P0.a / P0.b), M.X(XR[1]), M.Y(P0.a / P0.b), COL.cyan, 2, [6, 4]); line(ctx, M.X(P0.c / P0.d), M.Y(YR[0]), M.X(P0.c / P0.d), M.Y(YR[1]), COL.orange, 2, [6, 4]); text(ctx, t('ncPrey', { v: P0.a / P0.b }), R.x + R.w - 4, M.Y(P0.a / P0.b) - 5, { align: 'right', size: 11, color: COL.cyan }); text(ctx, t('ncPred', { v: P0.c / P0.d }), M.X(P0.c / P0.d) + 5, R.y + 14, { size: 11, color: COL.orange });
  dot(ctx, M.X(e[0]), M.Y(e[1]), 5, COL.green); const d = deriv([S.px, S.py], P0), ex = d[0] / (XR[1] - XR[0]) * R.w, ey = -d[1] / (YR[1] - YR[0]) * R.h, L = Math.hypot(ex, ey) || 1, sc = Math.min(70, L * 2) / L;
  const px = M.X(S.px), py = M.Y(S.py); line(ctx, px, py, px + ex * sc, py + ey * sc, COL.ink, 3); dot(ctx, px, py, 5, COL.ink); $('px2v').textContent = S.px; $('py2v').textContent = S.py;
  $('ro2').textContent = t('s2ro', { x: S.px, y: S.py, dx: f2(d[0]), dy: f2(d[1]), px: t(sgn(d[0]) === 'up' ? 'rises' : sgn(d[0]) === 'down' ? 'falls' : 'steady'), py: t(sgn(d[1]) === 'up' ? 'rises' : sgn(d[1]) === 'down' ? 'falls' : 'steady') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), W = w, top = { x: 36, y: 16, w: W - 50, h: h * 0.52 }, M = frame(ctx, top, XR, YR, t('preyAxis'), t('predAxis')), tr = traj(S.x1, S.y1, P0, TMAX, S.dt, S.meth), n = Math.max(1, Math.floor((tr.length - 1) * S.rev[3]));
  drawPath(ctx, M, tr, S.meth === 'euler' ? COL.red : COL.cyan, S.rev[3]); dot(ctx, M.X(S.x1), M.Y(S.y1), 4, COL.ink);
  const hs = tr.slice(0, n + 1).filter(q => isFinite(q[1]) && q[1] > 0 && q[2] > 0).map(q => [q[0], Hq([q[1], q[2]], P0)]), h0 = Hq([S.x1, S.y1], P0), bot = { x: 36, y: top.y + top.h + 30, w: W - 50, h: h - top.y - top.h - 52 };
  ctx.strokeStyle = COL.grid; ctx.strokeRect(bot.x, bot.y, bot.w, bot.h); const span = Math.max(0.5, ...hs.map(q => Math.abs(q[1] - h0))) * 1.2, Y = v => bot.y + bot.h / 2 - (v - h0) / span * bot.h / 2; line(ctx, bot.x, Y(h0), bot.x + bot.w, Y(h0), COL.muted, 1, [4, 3]);
  ctx.strokeStyle = S.meth === 'euler' ? COL.red : COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); hs.forEach((q, k) => { const x = bot.x + q[0] / TMAX * bot.w; k ? ctx.lineTo(x, Y(q[1])) : ctx.moveTo(x, Y(q[1])); }); ctx.stroke(); text(ctx, t('hAxis'), bot.x + 4, bot.y + 13, { size: 11 }); text(ctx, t('timeAxis'), bot.x + bot.w, bot.y + bot.h + 14, { align: 'right', size: 11 });
  $('rk4').classList.toggle('active', S.meth === 'rk4'); $('eul').classList.toggle('active', S.meth === 'euler'); $('dt3v').textContent = S.dt; const lastH = hs.length ? hs[hs.length - 1][1] : h0, bad = tr[tr.length - 1][1] !== tr[tr.length - 1][1];
  $('ro3').textContent = t('s3ro', { m: t(S.meth === 'euler' ? 'mEuler' : 'mRk4'), dt: S.dt, h0: f2(h0), h1: f2(lastH), dr: f2((lastH - h0)), bad: bad ? t('blown') : '' }); }
function render4() { const { ctx, w, h } = setup($('cv4')), R = rect(w, h), xr = [0, 14], yr = [0, 10], M = frame(ctx, R, xr, yr, t('preyAxis'), t('predAxis')), p = { ...P0, a: S.a4, c: S.c4 }, e = equil(p);
  ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip(); [0.3, 0.55, 0.8].forEach((s, k) => { const tr = traj(e[0], e[1] * s, p, 40, 0.01, 'rk4'); ctx.strokeStyle = [COL.violet, COL.cyan, COL.orange][k]; ctx.lineWidth = 2.2; ctx.beginPath(); tr.forEach((q, i) => { if (!isFinite(q[1])) return; i ? ctx.lineTo(M.X(q[1]), M.Y(q[2])) : ctx.moveTo(M.X(q[1]), M.Y(q[2])); }); ctx.stroke(); }); ctx.restore();
  dot(ctx, M.X(e[0]), M.Y(e[1]), 6, COL.green); text(ctx, t('eqLabel'), M.X(e[0]) + 9, M.Y(e[1]) - 7, { size: 11, color: COL.green }); line(ctx, M.X(e[0]), M.Y(0), M.X(e[0]), M.Y(e[1]), COL.green, 1, [3, 3]); line(ctx, M.X(0), M.Y(e[1]), M.X(e[0]), M.Y(e[1]), COL.green, 1, [3, 3]); $('a4v').textContent = S.a4; $('c4v').textContent = S.c4;
  $('ro4').textContent = t('s4ro', { a: S.a4, c: S.c4, ex: f2(e[0]), ey: f2(e[1]) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), R = rect(w, h), M = frame(ctx, R, XR, YR, t('preyAxis'), t('predAxis')), p = { ...P0, e: S.e5 }, e = equil(p), tr = traj(6, 1, p, 60, DT, 'rk4'); field(ctx, M, R, p, 10); const last = drawPath(ctx, M, tr, COL.orange, S.rev[5]);
  dot(ctx, M.X(e[0]), M.Y(e[1]), 6, COL.green); text(ctx, t('eqLabel'), M.X(e[0]) + 9, M.Y(e[1]) - 7, { size: 11, color: COL.green }); dot(ctx, M.X(6), M.Y(1), 4, COL.ink); $('e5v').textContent = S.e5; const end = tr[tr.length - 1], dist = Math.hypot(end[1] - e[0], end[2] - e[1]), d0 = Math.hypot(6 - e[0], 1 - e[1]);
  $('ro5').textContent = t('s5ro', { e: S.e5, k: S.e5 > 0 ? f1(1 / S.e5) : t('inf'), ex: f2(e[0]), ey: f2(e[1]), d0: f2(d0), d1: f2(dist), kind: t(S.e5 > 0 ? 'kSpiral' : 'kLoop') }); }
function replay(i) { cancelAnimationFrame(S.raf[i]); if (reduceMotion()) { S.rev[i] = 1; RENDERS[i](); return; } S.rev[i] = 0; const t0 = performance.now(), dur = 7000; const tick = now => { S.rev[i] = Math.max(0, Math.min(1, (now - t0) / dur)); RENDERS[i](); if (S.rev[i] < 1) S.raf[i] = requestAnimationFrame(tick); }; S.raf[i] = requestAnimationFrame(tick); }
function stopAll() { S.raf.forEach((r, i) => { cancelAnimationFrame(r); S.rev[i] = 1; }); }
function onHide() { stopAll(); renderAll(); }
function wire() {
  const sl = (id, key, i) => slider(id, v => { cancelAnimationFrame(S.raf[i]); S.rev[i] = 1; S[key] = v; RENDERS[i](); });
  sl('x0', 'x0', 0); sl('y0', 'y0', 0); sl('x1', 'x1', 1); sl('y1', 'y1', 1); sl('px2', 'px', 2); sl('py2', 'py', 2); sl('dt3', 'dt', 3); sl('a4', 'a4', 4); sl('c4', 'c4', 4); sl('e5', 'e5', 5);
  [0, 1, 3, 5].forEach(i => $('rp' + i).addEventListener('click', () => replay(i)));
  $('rk4').addEventListener('click', () => { S.meth = 'rk4'; S.rev[3] = 1; render3(); }); $('eul').addEventListener('click', () => { S.meth = 'euler'; S.rev[3] = 1; render3(); });
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
if (typeof module !== 'undefined') module.exports = { P0, deriv, rk4, euler, Hq, equil, traj };
