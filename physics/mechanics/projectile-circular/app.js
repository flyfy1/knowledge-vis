/* projectile-circular: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const G = 9.8, GM = 398600, RE = 6371, VESC = Math.sqrt(2 * GM / RE), VCIRC = Math.sqrt(GM / RE);
/* Projectile with no air drag: horizontal motion is uniform, vertical motion has constant acceleration -g. */
const pos = (v0, th, t, h0) => { const r = th * Math.PI / 180; return { x: v0 * Math.cos(r) * t, y: h0 + v0 * Math.sin(r) * t - 0.5 * G * t * t }; };
const vel = (v0, th, t) => { const r = th * Math.PI / 180; return { vx: v0 * Math.cos(r), vy: v0 * Math.sin(r) - G * t }; };
const flightTime = (v0, th, h0) => { const vy = v0 * Math.sin(th * Math.PI / 180); return (vy + Math.sqrt(vy * vy + 2 * G * h0)) / G; };
const rangeOf = (v0, th) => v0 * v0 * Math.sin(2 * th * Math.PI / 180) / G;
const maxHeight = (v0, th) => Math.pow(v0 * Math.sin(th * Math.PI / 180), 2) / (2 * G);
const centripetal = (v, r) => v * v / r, periodOf = (v, r) => 2 * Math.PI * r / v;
/* Orbit around a point-mass Earth, launched horizontally at the surface with speed v (km/s). RK4, time step 5 s. */
function orbit(v, tmax) { let s = [RE, 0, 0, v]; const out = [[0, s[0], s[1]]], acc = (x, y) => { const r3 = Math.pow(x * x + y * y, 1.5); return [-GM * x / r3, -GM * y / r3]; }, dt = 5; let rmin = RE, hit = false;
  for (let k = 1; k * dt <= tmax; k++) { const f = st => { const a = acc(st[0], st[1]); return [st[2], st[3], a[0], a[1]]; }, k1 = f(s), s2 = s.map((q, i) => q + dt / 2 * k1[i]), k2 = f(s2), s3 = s.map((q, i) => q + dt / 2 * k2[i]), k3 = f(s3), s4 = s.map((q, i) => q + dt * k3[i]), k4 = f(s4); s = s.map((q, i) => q + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    const r = Math.hypot(s[0], s[1]); if (r < rmin) rmin = r; if (r < RE - 1) { hit = true; out.push([k * dt, s[0], s[1]]); break; } out.push([k * dt, s[0], s[1]]); if (r > 12 * RE) break; } return { path: out, rmin, hit }; }
function classifyV(v) { if (v < VCIRC - 0.05) return 'fall'; if (v <= VCIRC + 0.05) return 'circle'; if (v < VESC) return 'ellipse'; return 'escape'; }
/* Analytic perigee radius for a horizontal launch at the surface (launch point is apogee when v < circular speed). */
function perigee(v) { const e = v * RE, eps = v * v / 2 - GM / RE; if (eps >= 0) return RE; const a = -GM / (2 * eps), ecc = Math.sqrt(1 + 2 * eps * e * e / (GM * GM)); return v < VCIRC ? a * (1 - ecc) : RE; }
const circVel = h => Math.sqrt(GM / (RE + h)), circPeriod = h => 2 * Math.PI * Math.sqrt(Math.pow(RE + h, 3) / GM);
const SATS = [['ISS', 420], ['GPS', 20200], ['GEO', 35786]];
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100), f0 = v => String(Math.round(v));
const S = { v0: 15, tau0: 2.02, raf0: 0, th1: 30, keep: [], th2: 50, t2: 1, r3: 3, v3: 5, ang: 0, cut: false, cutT: 0, paused: false, raf3: 0, v4: 7.0, rev4: 1, raf4: 0, h5: 420 };
const H0 = 20;
function axes(ctx, R, xm, ym, xl, yl, xt, yt) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); const X = v => R.x + v / xm * R.w, Y = v => R.y + R.h - v / ym * R.h; xt.forEach(v => text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 })); yt.forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, String(v), R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); }); if (xl) text(ctx, xl, R.x + R.w, R.y + R.h + 27, { align: 'right', size: 11 }); if (yl) text(ctx, yl, R.x, R.y - 5, { size: 11 }); return { X, Y }; }
function arrow(ctx, x1, y1, x2, y2, col, lw) { if (Math.hypot(x2 - x1, y2 - y1) < 2) return; line(ctx, x1, y1, x2, y2, col, lw || 3); const a = Math.atan2(y2 - y1, x2 - x1); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(a - 0.45), y2 - 9 * Math.sin(a - 0.45)); ctx.lineTo(x2 - 9 * Math.cos(a + 0.45), y2 - 9 * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); }
function render0() { const { ctx, w, h } = setup($('cv0')), R = { x: 40, y: 16, w: w - 56, h: h - 56 }, M = axes(ctx, R, 65, 22, t('xAxis'), t('yAxis'), [0, 20, 40, 60], [0, 10, 20]), tf = Math.sqrt(2 * H0 / G), v0 = S.v0, tau = S.tau0;
  line(ctx, M.X(0), M.Y(0), M.X(0), M.Y(H0), COL.muted, 4);
  for (let k = 0; k * 0.25 <= Math.min(tau, tf) + 1e-9; k++) { const tt = k * 0.25, a = pos(v0, 0, tt, H0), b = { x: 3, y: H0 - 0.5 * G * tt * tt }; line(ctx, M.X(a.x), M.Y(a.y), M.X(b.x), M.Y(b.y), 'rgba(168,186,196,0.25)', 1, [3, 3]); dot(ctx, M.X(a.x), M.Y(a.y), 4.5, COL.cyan); dot(ctx, M.X(b.x), M.Y(b.y), 4.5, COL.orange); }
  const tt = Math.min(tau, tf), a = pos(v0, 0, tt, H0); dot(ctx, M.X(a.x), M.Y(a.y), 7, COL.cyan); dot(ctx, M.X(3), M.Y(H0 - 0.5 * G * tt * tt), 7, COL.orange); text(ctx, t('legA', { v: v0 }), R.x + 8, R.y + 16, { size: 12, color: COL.cyan }); text(ctx, t('legB'), R.x + 8, R.y + 32, { size: 12, color: COL.orange }); text(ctx, t('clock', { t: f2(tt) }), R.x + R.w - 8, R.y + 16, { align: 'right', size: 12, color: COL.ink });
  $('v0v').textContent = v0; $('ro0').textContent = t('s0ro', { v: v0, tf: f2(tf), x: f1(v0 * tf), h: H0, y: f1(H0 - 0.5 * G * tt * tt) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), R = { x: 40, y: 16, w: w - 56, h: h - 56 }, M = axes(ctx, R, 45, 22, t('xAxis'), t('yAxis'), [0, 10, 20, 30, 40], [0, 10, 20]), v0 = 20, curve = (th, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); const T = flightTime(v0, th, 0); for (let i = 0; i <= 80; i++) { const p = pos(v0, th, T * i / 80, 0); i ? ctx.lineTo(M.X(p.x), M.Y(p.y)) : ctx.moveTo(M.X(p.x), M.Y(p.y)); } ctx.stroke(); ctx.setLineDash([]); };
  S.keep.forEach(th => curve(th, 'rgba(103,215,249,0.55)', 2)); curve(90 - S.th1, COL.violet, 2, [5, 4]); curve(S.th1, COL.orange, 3); const rg = rangeOf(v0, S.th1); dot(ctx, M.X(rg), M.Y(0), 5, COL.orange); line(ctx, M.X(rg), M.Y(0), M.X(rg), M.Y(2.5), COL.orange, 1.5);
  text(ctx, t('legNow', { th: S.th1 }), R.x + 8, R.y + 16, { size: 12, color: COL.orange }); text(ctx, t('legComp', { th: 90 - S.th1 }), R.x + 8, R.y + 32, { size: 12, color: COL.violet }); if (S.keep.length) text(ctx, t('legKept', { n: S.keep.length }), R.x + 8, R.y + 48, { size: 12, color: COL.cyan }); $('th1v').textContent = S.th1;
  $('ro1').textContent = t('s1ro', { th: S.th1, r: f1(rg), rc: f1(rangeOf(v0, 90 - S.th1)), c: 90 - S.th1, hmax: f1(maxHeight(v0, S.th1)), T: f2(flightTime(v0, S.th1, 0)) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), R = { x: 40, y: 16, w: w - 56, h: h - 56 }, M = axes(ctx, R, 45, 22, t('xAxis'), t('yAxis'), [0, 10, 20, 30, 40], [0, 10, 20]), v0 = 20, th = S.th2, T = flightTime(v0, th, 0), tt = Math.min(S.t2, T); ctx.strokeStyle = COL.grid; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const p = pos(v0, th, T * i / 80, 0); i ? ctx.lineTo(M.X(p.x), M.Y(p.y)) : ctx.moveTo(M.X(p.x), M.Y(p.y)); } ctx.stroke();
  for (let k = 0; k * 0.5 <= T; k++) { const p = pos(v0, th, k * 0.5, 0); dot(ctx, M.X(p.x), M.Y(p.y), 3, COL.muted); } const p = pos(v0, th, tt, 0), v = vel(v0, th, tt), k = 3.2, px = M.X(p.x), py = M.Y(p.y); dot(ctx, px, py, 6, COL.orange);
  arrow(ctx, px, py, px + v.vx * k, py, COL.cyan, 3); arrow(ctx, px, py, px, py - v.vy * k, COL.green, 3); arrow(ctx, px, py, px + v.vx * k, py - v.vy * k, COL.orange, 3.5); text(ctx, 'vₓ', px + v.vx * k + 4, py + 14, { size: 12, color: COL.cyan }); text(ctx, 'v_y', px + 6, py - v.vy * k - 4, { size: 12, color: COL.green }); text(ctx, t('clock', { t: f2(tt) }), R.x + R.w - 8, R.y + 16, { align: 'right', size: 12 });
  const sp = Math.hypot(v.vx, v.vy); $('th2v').textContent = th; $('t2v').textContent = S.t2; $('ro2').textContent = t('s2ro', { t: f2(tt), vx: f2(v.vx), vy: f2(v.vy), sp: f2(sp), ang: f1(Math.atan2(v.vy, v.vx) * 180 / Math.PI), top: f2(v0 * Math.sin(th * Math.PI / 180) / G), tag: Math.abs(v.vy) < 0.15 ? t('atTop') : '' }); }
function render3() { const { ctx, w, h } = setup($('cv3')), cx = w / 2, cy = h / 2, sc = Math.min(w, h) / 2 / 6.5, r = S.r3 * sc, v = S.v3, ac = centripetal(v, S.r3), bx = cx + r * Math.cos(S.ang), by = cy - r * Math.sin(S.ang);
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, S.cut ? S.cutR : r, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]); dot(ctx, cx, cy, 4, COL.muted);
  let px = bx, py = by, ux = -Math.sin(S.ang), uy = -Math.cos(S.ang);
  if (S.cut) { const d = S.cutT * v * S.cutSc * 0.25; ux = S.cutU[0]; uy = S.cutU[1]; px = S.cutP[0] + d * ux; py = S.cutP[1] + d * uy; line(ctx, S.cutP[0], S.cutP[1], px, py, COL.orange, 2, [5, 4]); }
  else { line(ctx, cx, cy, bx, by, COL.muted, 2); S.lastB = { p: [bx, by], u: [ux, uy], r, sc }; }
  dot(ctx, px, py, 9, COL.cyan); const vl = 12 * v; arrow(ctx, px, py, px + ux * vl, py + uy * vl, COL.orange, 3); text(ctx, 'v', px + ux * vl + 6, py + uy * vl, { size: 13, color: COL.orange, bold: true });
  if (!S.cut) { const al = 5 * ac, dx = (cx - bx) / r, dy = (cy - by) / r; arrow(ctx, bx, by, bx + dx * al, by + dy * al, COL.green, 3); text(ctx, 'a', bx + dx * al + 4, by + dy * al - 4, { size: 13, color: COL.green, bold: true }); }
  text(ctx, t('slowNote'), 8, 16, { size: 11 }); if (S.cut) text(ctx, t('cutNote'), w - 8, 16, { align: 'right', size: 12, color: COL.orange });
  $('r3v').textContent = S.r3; $('v3v').textContent = S.v3; $('pause3').textContent = t(S.paused ? 'resume' : 'pause'); $('cut3').classList.toggle('active', S.cut); $('r3').disabled = S.cut;
  $('ro3').textContent = S.cut ? t('s3roCut', { v }) : t('s3ro', { r: S.r3, v, a: f2(ac), T: f2(periodOf(v, S.r3)), f: f2(v / (2 * Math.PI * S.r3)) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), R = { x: 0, y: 0, w, h }, cx = w * 0.5, cy = h * 0.5, sc = Math.min(w, h) * 0.5 / (2.8 * RE), o = orbit(S.v4, 40000), n = Math.max(1, Math.floor((o.path.length - 1) * S.rev4));
  ctx.fillStyle = '#16384f'; ctx.beginPath(); ctx.arc(cx, cy, RE * sc, 0, 6.2832); ctx.fill(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.stroke(); ctx.save(); ctx.beginPath(); ctx.rect(2, 2, w - 4, h - 4); ctx.clip();
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= n; i++) { const p = o.path[i], X = cx + p[1] * sc, Y = cy - p[2] * sc; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); const q = o.path[n]; dot(ctx, cx + q[1] * sc, cy - q[2] * sc, 5, COL.orange); ctx.restore(); dot(ctx, cx + RE * sc, cy, 4, COL.ink); text(ctx, t('launchPt'), cx + RE * sc + 8, cy - 8, { size: 11, color: COL.ink });
  const kind = classifyV(S.v4); text(ctx, t('k_' + kind), 10, 18, { size: 14, color: kind === 'fall' ? COL.red : COL.green, bold: true }); $('v4v').textContent = S.v4;
  $('ro4').textContent = t('s4ro', { v: S.v4, vc: f2(VCIRC), ve: f2(VESC), kind: t('k_' + kind), rp: f0(perigee(S.v4)), re: RE, hit: t(o.hit ? 'hitYes' : 'hitNo'), rmin: f0(o.rmin) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), R = { x: 46, y: 20, w: w - 64, h: h - 58 }, rl0 = Math.log10(6000), rl1 = Math.log10(50000), tl0 = Math.log10(1), tl1 = Math.log10(40), X = r => R.x + (Math.log10(r) - rl0) / (rl1 - rl0) * R.w, Y = T => R.y + R.h - (Math.log10(T) - tl0) / (tl1 - tl0) * R.h;
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); [7000, 10000, 20000, 40000].forEach(r => { line(ctx, X(r), R.y, X(r), R.y + R.h, COL.grid, 1); text(ctx, String(r), X(r), R.y + R.h + 13, { align: 'center', size: 10 }); }); [1, 2, 5, 10, 24].forEach(T => { line(ctx, R.x, Y(T), R.x + R.w, Y(T), COL.grid, 1); text(ctx, String(T), R.x - 4, Y(T) + 4, { align: 'right', size: 10 }); }); text(ctx, t('rAxis'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); text(ctx, t('tAxis'), R.x, R.y - 6, { size: 11 });
  const per = hh => circPeriod(hh) / 3600; ctx.strokeStyle = COL.violet; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); for (let i = 0; i <= 40; i++) { const hh = 100 + 44000 * i / 40; i ? ctx.lineTo(X(RE + hh), Y(per(hh))) : ctx.moveTo(X(RE + hh), Y(per(hh))); } ctx.stroke(); ctx.setLineDash([]);
  SATS.forEach(([nm, hh]) => { dot(ctx, X(RE + hh), Y(per(hh)), 5, COL.green); text(ctx, nm, X(RE + hh) + 7, Y(per(hh)) + 14, { size: 11, color: COL.green }); }); dot(ctx, X(RE + S.h5), Y(per(S.h5)), 8, COL.orange);
  const r = RE + S.h5, v = circVel(S.h5), fall = 0.5 * GM / (r * r) * 1000, away = v * v / (2 * r) * 1000; $('h5v').textContent = S.h5;
  $('ro5').textContent = t('s5ro', { h: S.h5, v: f2(v), Tm: f0(circPeriod(S.h5) / 60), Th: f2(circPeriod(S.h5) / 3600), k: f2(Math.pow(circPeriod(S.h5), 2) / Math.pow(r, 3) * 1e5), fall: f2(fall), away: f2(away) }); }
function loop3(now) { S.raf3 = requestAnimationFrame(loop3); const bb = $('cv3').getBoundingClientRect(); if (S.paused || document.hidden || reduceMotion() || bb.bottom < 0 || bb.top > window.innerHeight) { S.last3 = now; return; } const dt = Math.min(0.05, (now - (S.last3 || now)) / 1000); S.last3 = now; if (S.cut) S.cutT += dt; else S.ang = (S.ang + dt * S.v3 / S.r3 * 0.25) % 6.2832; render3(); }
function replay(i) { const key = 'raf' + i; cancelAnimationFrame(S[key]); const fin = () => { if (i === 0) S.tau0 = Math.sqrt(2 * H0 / G); else S.rev4 = 1; (i === 0 ? render0 : render4)(); }; if (reduceMotion()) { fin(); return; } const t0 = performance.now(); const tick = now => { const f = Math.max(0, Math.min(1, (now - t0) / (i === 0 ? 2020 : 6000))); if (i === 0) { S.tau0 = f * Math.sqrt(2 * H0 / G); render0(); } else { S.rev4 = f; render4(); } if (f < 1) S[key] = requestAnimationFrame(tick); }; S[key] = requestAnimationFrame(tick); }
function onHide() { cancelAnimationFrame(S.raf0); cancelAnimationFrame(S.raf4); S.tau0 = Math.sqrt(2 * H0 / G); S.rev4 = 1; render0(); render4(); }
function wire() {
  S.tau0 = Math.sqrt(2 * H0 / G); slider('v0', v => { cancelAnimationFrame(S.raf0); S.tau0 = Math.sqrt(2 * H0 / G); S.v0 = v; render0(); }); $('rp0').addEventListener('click', () => replay(0));
  slider('th1', v => { S.th1 = v; render1(); }); $('keep1').addEventListener('click', () => { if (!S.keep.includes(S.th1) && S.keep.length < 6) S.keep.push(S.th1); render1(); }); $('clr1').addEventListener('click', () => { S.keep = []; render1(); });
  slider('th2', v => { S.th2 = v; render2(); }); slider('t2', v => { S.t2 = v; render2(); });
  slider('r3', v => { if (!S.cut) { S.r3 = v; render3(); } }); slider('v3', v => { S.v3 = v; render3(); }); $('pause3').addEventListener('click', () => { S.paused = !S.paused; render3(); }); $('cut3').addEventListener('click', () => { if (!S.cut && S.lastB) { S.cut = true; S.cutT = 0; S.cutP = S.lastB.p; S.cutU = S.lastB.u; S.cutSc = S.lastB.sc; S.cutR = S.lastB.r; if (reduceMotion()) S.cutT = 6; } render3(); }); $('rs3').addEventListener('click', () => { S.cut = false; S.cutT = 0; S.paused = false; render3(); });
  slider('v4', v => { cancelAnimationFrame(S.raf4); S.rev4 = 1; S.v4 = v; render4(); }); $('rp4').addEventListener('click', () => replay(4)); slider('h5', v => { S.h5 = v; render5(); });
  if (!reduceMotion()) S.raf3 = requestAnimationFrame(loop3);
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
if (typeof module !== 'undefined') module.exports = { G, GM, RE, VCIRC, VESC, pos, vel, flightTime, rangeOf, maxHeight, centripetal, periodOf, orbit, classifyV, perigee, circVel, circPeriod };
