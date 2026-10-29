/* gravity-orbits: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: Newtonian gravity in units GM = 1 and launch radius r0 = 1 unless stated. Orbits come from numerical integration (velocity Verlet), not from the formulas they are checked against. Pure functions. */
const RP = 0.12;                                           // radius of the central body in simulation units
const accel = (x, y) => { const r = Math.hypot(x, y), k = -1 / (r * r * r); return [k * x, k * y]; };
function simulate(v0, r0, Tmax, dt, stopR) { let x = r0, y = 0, vx = 0, vy = v0, [ax, ay] = accel(x, y), t = 0; const pts = [[0, x, y]]; let crashed = false;
  while (t < Tmax) { x += vx * dt + 0.5 * ax * dt * dt; y += vy * dt + 0.5 * ay * dt * dt; const [bx, by] = accel(x, y); vx += 0.5 * (ax + bx) * dt; vy += 0.5 * (ay + by) * dt; ax = bx; ay = by; t += dt; pts.push([t, x, y]); const r = Math.hypot(x, y); if (r < RP) { crashed = true; break; } if (stopR && r > stopR) break; }
  return { pts: pts, crashed: crashed }; }
const energy = (v0, r0) => 0.5 * v0 * v0 - 1 / (r0 || 1);
const ecc = (v0, r0) => { const L = v0 * r0, E = energy(v0, r0); return Math.sqrt(Math.max(0, 1 + 2 * E * L * L)); };
const semiMajor = (v0, r0) => { const E = energy(v0, r0); return E < 0 ? -1 / (2 * E) : Infinity; };
const apsides = (v0, r0) => { const E = energy(v0, r0), L = v0 * r0; if (E >= 0) { const e = ecc(v0, r0), p = L * L; return { rmin: p / (1 + e), rmax: Infinity }; } const a = -1 / (2 * E), e = ecc(v0, r0); return { rmin: a * (1 - e), rmax: a * (1 + e) }; };
const vEff = (r, L) => L * L / (2 * r * r) - 1 / r;
const circularSpeed = r => 1 / Math.sqrt(r), escapeSpeed = r => Math.sqrt(2 / r);
const orbitKind = v0 => (Math.abs(v0 - 1) < 0.01 ? 'circle' : v0 < 1 ? 'ellipse' : v0 < Math.SQRT2 - 0.005 ? 'ellipse' : v0 < Math.SQRT2 + 0.005 ? 'parabola' : 'hyperbola');
function periodSim(r0, v0) { const dt = 0.002 * Math.min(1, r0 ** 1.5), a = semiMajor(v0, r0), Tmax = 3 * 2 * Math.PI * Math.pow(a, 1.5); let x = r0, y = 0, vx = 0, vy = v0, [ax, ay] = accel(x, y), t = 0, th = 0, prev = 0; const fn = () => Math.atan2(y, x);
  while (t < Tmax) { x += vx * dt + 0.5 * ax * dt * dt; y += vy * dt + 0.5 * ay * dt * dt; const [bx, by] = accel(x, y); vx += 0.5 * (ax + bx) * dt; vy += 0.5 * (ay + by) * dt; ax = bx; ay = by; t += dt; let a2 = fn(); let d = a2 - prev; if (d < -Math.PI) d += 2 * Math.PI; if (d > Math.PI) d -= 2 * Math.PI; th += d; prev = a2; if (th >= 2 * Math.PI) { return t - dt * (th - 2 * Math.PI) / d; } }
  return NaN; }
function sweptAreas(v0, nIntervals) { const T = periodSim(1, v0), sim = simulate(v0, 1, T, 0.002, 0), step = T / nIntervals, areas = []; const at = tt => { const i = Math.min(sim.pts.length - 1, Math.round(tt / 0.002)); return sim.pts[i]; };
  for (let k = 0; k < nIntervals; k++) { const a = at(k * step), b = at((k + 1) * step); let s = 0; const i0 = Math.round(k * step / 0.002), i1 = Math.round((k + 1) * step / 0.002); for (let i = i0; i < i1 && i + 1 < sim.pts.length; i++) { const p = sim.pts[i], q = sim.pts[i + 1]; s += 0.5 * (p[1] * q[2] - p[2] * q[1]); } areas.push(s); } return { areas: areas, T: T, sim: sim, step: step }; }
const MU_E = 3.986004418e14, R_E = 6371e3;
const periodAtAltitude = km => { const a = R_E + km * 1000; return 2 * Math.PI * Math.sqrt(a * a * a / MU_E); };
const speedAtAltitude = km => Math.sqrt(MU_E / (R_E + km * 1000));
const gAt = rEarth => 9.80665 / (rEarth * rEarth);
const fmtT = s => s < 7200 ? (s / 60).toFixed(0) + ' min' : s < 172800 ? (s / 3600).toFixed(1) + ' h' : (s / 86400).toFixed(1) + ' d';
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2), f3 = v => (Math.round(v * 1000) / 1000).toFixed(3);
const S = { r0: 2, v1: 0.8, cur1: 0, sim1: null, v2: 0.8, v3: 0.7, a4pts: [], r4: 1.5, k4: 1, alt5: 2.6 };
const REFS5 = [['rISS', 400], ['rGPS', 20200], ['rGEO', 35786], ['rMoon', 384400 - 6371]];
const getSim1 = () => { const key = S.v1; if (!S.sim1 || S.sim1.key !== key) S.sim1 = Object.assign({ key: key }, simulate(S.v1, 1, 60, 0.004, 5)); return S.sim1; };
const play1 = ticker(dt => { const n = getSim1().pts.length; S.cur1 = Math.min(n - 1, S.cur1 + Math.round(dt * 900)); render1(); if (S.cur1 >= n - 1) return false; });
function bodyDraw(ctx, cx, cy, sc) { ctx.fillStyle = '#4e83aa'; ctx.beginPath(); ctx.arc(cx, cy, RP * sc, 0, 6.2832); ctx.fill(); }
function render0() {
  const { ctx, w, h } = setup($('cv0')), r = S.r0, L = { x: 40, y: 14, w: w * 0.55, h: h - 46 }, X = q => L.x + (q - 1) / 5 * L.w, Y = g => L.y + L.h - g / 10 * L.h; axes(ctx, L);
  const pts = []; for (let q = 1; q <= 6; q += 0.05) pts.push([X(q), Y(gAt(q))]); curve(ctx, pts, COL.orange, 3); line(ctx, X(r), L.y, X(r), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(r), Y(gAt(r)), 6, COL.cyan);
  [1, 2, 3, 4, 5, 6].forEach(q => text(ctx, String(q), X(q), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 5, 10].forEach(g => text(ctx, String(g), L.x - 4, Y(g) + 3, { align: 'right', size: 10 })); text(ctx, t('axR'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axG'), L.x + 4, L.y + 10, { size: 11 });
  const cx = L.x + L.w + (w - L.x - L.w) / 2 + 4, cy = h * 0.5, R = Math.min((w - L.x - L.w) * 0.2, 22); ctx.fillStyle = '#4e83aa'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill(); const dy = R * 2.2 * r; dot(ctx, cx, Math.min(h - 10, cy - R - 10 - (r - 1) * 18), 5, COL.ink); const len = 8 + 60 * gAt(r) / 9.81; arrow(ctx, cx, Math.min(h - 10, cy - R - 10 - (r - 1) * 18) + 4, cx, Math.min(h - 10, cy - R - 10 - (r - 1) * 18) + 4 + Math.min(len, 60), COL.orange, 3);
  $('r0v').textContent = r.toFixed(1) + ' R⊕'; $('ro0').textContent = t('s0ro', { r: r.toFixed(1), g: f2(gAt(r)), ratio: f3(gAt(r) / 9.80665), inv: f2(1 / (r * r)), alt: Math.round((r - 1) * 6371) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), v0 = S.v1, sim = getSim1(), cx = w / 2, cy = h / 2, sc = Math.min(w, h) / 6.6, cur = Math.min(S.cur1, sim.pts.length - 1), ap = apsides(v0, 1);
  ctx.strokeStyle = '#1b2d3c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, sc * 1, 0, 6.2832); ctx.stroke(); bodyDraw(ctx, cx, cy, sc); ctx.strokeStyle = COL.orange; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= cur; i++) { const p = sim.pts[i], x = cx + p[1] * sc, y = cy - p[2] * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  const p = sim.pts[cur]; dot(ctx, cx + p[1] * sc, cy - p[2] * sc, 5, COL.cyan); dot(ctx, cx + sc, cy, 4, COL.green); text(ctx, t('lblStart'), cx + sc + 6, cy + 14, { size: 10, color: COL.green });
  $('play1').textContent = play1.running ? t('pause') : t('play'); $('v1v').textContent = v0.toFixed(2);
  const kind = orbitKind(v0), crash = ap.rmin < RP && v0 < Math.SQRT2; $('ro1').textContent = t('s1ro', { v: f2(v0), vc: '1.00', ve: f2(Math.SQRT2), kind: t('k_' + (crash ? 'crash' : kind)), e: f2(ecc(v0, 1)), rp: f2(ap.rmin), ra: Number.isFinite(ap.rmax) ? f2(ap.rmax) : '∞' });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), v0 = S.v2, L = { x: 40, y: 14, w: w - 56, h: h - 46 }, E = energy(v0, 1), Lm = v0, ap = apsides(v0, 1), rmax = 6, X = r => L.x + (r - 0.3) / (rmax - 0.3) * L.w, ymin = -1.2, ymax = 0.6, Y = v => L.y + L.h - (Math.max(ymin, Math.min(ymax, v)) - ymin) / (ymax - ymin) * L.h; axes(ctx, L);
  const pts = []; for (let r = 0.3; r <= rmax; r += 0.03) pts.push([X(r), Y(vEff(r, Lm))]); curve(ctx, pts, COL.orange, 2.5); line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.muted, 1, [4, 4]); line(ctx, L.x, Y(E), L.x + L.w, Y(E), COL.cyan, 2);
  [ap.rmin, ap.rmax].forEach(r => { if (Number.isFinite(r) && r < rmax && r > 0.3) { line(ctx, X(r), L.y, X(r), L.y + L.h, COL.green, 1.2, [3, 3]); dot(ctx, X(r), Y(E), 5, COL.green); } });
  [1, 2, 3, 4, 5, 6].forEach(q => text(ctx, String(q), X(q), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axR2'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axE'), L.x + 4, L.y + 10, { size: 11 }); text(ctx, t('lblE', { e: f2(E) }), L.x + L.w - 4, Y(E) - 6, { align: 'right', size: 11, color: COL.cyan });
  $('v2v').textContent = v0.toFixed(2); $('ro2').textContent = t('s2ro', { v: f2(v0), ke: f2(0.5 * v0 * v0), pe: '−1.00', e: f2(E), kind: E < -1e-9 ? t('bound') : E > 1e-9 ? t('unbound') : t('marginal'), rp: f2(ap.rmin), ra: Number.isFinite(ap.rmax) ? f2(ap.rmax) : '∞', ve: f2(Math.SQRT2) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), v0 = S.v3, sw = sweptAreas(v0, 8), ap = apsides(v0, 1), other = v0 < 1 ? ap.rmin : ap.rmax, scale = Math.min(w, h) * 0.45 / Math.max(1, other), cx = w / 2 - (1 - other) / 2 * scale, cy = h / 2, sim = sw.sim;
  const cols = ['rgba(103,215,249,.35)', 'rgba(246,164,91,.35)'];
  for (let k = 0; k < 8; k++) { const i0 = Math.round(k * sw.step / 0.002), i1 = Math.round((k + 1) * sw.step / 0.002); ctx.fillStyle = cols[k % 2]; ctx.beginPath(); ctx.moveTo(cx, cy); for (let i = i0; i <= i1 && i < sim.pts.length; i += 4) ctx.lineTo(cx + sim.pts[i][1] * scale, cy - sim.pts[i][2] * scale); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.5; ctx.beginPath(); sim.pts.forEach((p, i) => { const x = cx + p[1] * scale, y = cy - p[2] * scale; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); bodyDraw(ctx, cx, cy, scale); text(ctx, t('lblWedges'), 8, h - 8, { size: 10 });
  const area = sw.areas, mn = Math.min.apply(null, area), mx = Math.max.apply(null, area); $('v3v').textContent = v0.toFixed(2);
  $('ro3').textContent = t('s3ro', { v: f2(v0), T: f2(sw.T), a1: f3(area[0]), a2: f3(area[3]), a3: f3(area[6]), exp: f3(0.5 * v0 * sw.T / 8), spread: f2((mx - mn) / mx * 100) });
}
function render4() {
  const a0 = semiMajor(S.k4 * circularSpeed(S.r4), S.r4), M = Math.max(70, 1.1 * a0 * a0 * a0, 1.1 * Math.max.apply(null, [0].concat(S.a4pts.map(q => q.a3)))), { ctx, w, h } = setup($('cv4')), L = { x: 44, y: 14, w: w - 60, h: h - 46 }, K = 4 * Math.PI * Math.PI, X = v => L.x + v / M * L.w, Y = v => L.y + L.h - v / (K * M) * L.h; axes(ctx, L);
  line(ctx, X(0), Y(0), X(M), Y(K * M), COL.muted, 1.5, [5, 4]); text(ctx, t('lblLine'), X(M * 0.55), Y(K * M * 0.55) + 18, { size: 11, color: COL.muted }); S.a4pts.forEach(q => dot(ctx, X(q.a3), Y(q.T2), 5, COL.orange));
  const prev = { a3: a0 * a0 * a0, T2: K * a0 * a0 * a0 }; ctx.strokeStyle = COL.cyan; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(X(prev.a3), Y(prev.T2), 7, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
  [0, 0.5, 1].forEach(q => text(ctx, f1(M * q), X(M * q), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 0.5, 1].forEach(q => text(ctx, f1(K * M * q), L.x - 4, Y(K * M * q) + 3, { align: 'right', size: 10 })); text(ctx, t('axA3'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axT2'), L.x + 4, L.y + 10, { size: 11 });
  $('r4v').textContent = S.r4.toFixed(1); $('k4v').textContent = S.k4.toFixed(2);
  const last = S.a4pts[S.a4pts.length - 1]; $('ro4').textContent = last ? t('s4ro', { n: S.a4pts.length, a: f2(last.a), T: f2(last.T), ratio: f2(last.T2 / last.a3), th: f2(4 * Math.PI * Math.PI) }) : t('s4ro0', { th: f2(4 * Math.PI * Math.PI) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), alt = Math.pow(10, S.alt5), L = { x: 44, y: 14, w: w - 60, h: h - 46 }, lx = a => L.x + (Math.log10(a) - 2) / (6 - 2) * L.w, ly = T => L.y + L.h - (Math.log10(T) - 3) / (7 - 3) * L.h; axes(ctx, L);
  const pts = []; for (let e = 2; e <= 6; e += 0.05) pts.push([lx(Math.pow(10, e)), ly(periodAtAltitude(Math.pow(10, e)))]); curve(ctx, pts, COL.orange, 3); line(ctx, L.x, ly(86164), L.x + L.w, ly(86164), COL.green, 1.2, [4, 4]); text(ctx, t('lblDay'), L.x + 4, ly(86164) - 4, { size: 10, color: COL.green });
  REFS5.forEach(([k, a]) => { dot(ctx, lx(a), ly(periodAtAltitude(a)), 4, COL.ink); text(ctx, t(k), lx(a) + (a > 3e5 ? -6 : 6), ly(periodAtAltitude(a)) + (a > 3e5 ? -8 : 14), { align: a > 3e5 ? 'right' : 'left', size: 10 }); });
  line(ctx, lx(alt), L.y, lx(alt), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, lx(alt), ly(periodAtAltitude(alt)), 6, COL.cyan); [2, 3, 4, 5, 6].forEach(e => text(ctx, '10^' + e, lx(Math.pow(10, e)), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axAlt'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axPeriod'), L.x + 4, L.y + 10, { size: 11 });
  $('alt5v').textContent = Math.round(alt).toLocaleString('en-US') + ' km'; const T = periodAtAltitude(alt); $('ro5').textContent = t('s5ro', { alt: Math.round(alt).toLocaleString('en-US'), T: fmtT(T), v: (speedAtAltitude(alt) / 1000).toFixed(2), hit: Math.abs(T - 86164) < 1500 ? t('hitGeo') : T < 86164 ? t('belowDay') : t('aboveDay') });
}
function wire() {
  $('r0').addEventListener('input', e => { S.r0 = +e.target.value / 10; render0(); });
  $('v1').addEventListener('input', e => { S.v1 = +e.target.value / 100; play1.stop(); S.cur1 = 0; render1(); });
  $('play1').addEventListener('click', () => { const n = getSim1().pts.length; if (play1.running) play1.stop(); else if (reduceMotion()) S.cur1 = n - 1; else { if (S.cur1 >= n - 1) S.cur1 = 0; play1.start(); } render1(); }); $('reset1').addEventListener('click', () => { play1.stop(); S.cur1 = 0; render1(); }); $('all1').addEventListener('click', () => { play1.stop(); S.cur1 = getSim1().pts.length - 1; render1(); });
  $('v2').addEventListener('input', e => { S.v2 = +e.target.value / 100; render2(); }); $('v3').addEventListener('input', e => { S.v3 = +e.target.value / 100; render3(); });
  $('r4').addEventListener('input', e => { S.r4 = +e.target.value / 10; render4(); }); $('k4').addEventListener('input', e => { S.k4 = +e.target.value / 100; render4(); });
  $('add4').addEventListener('click', () => { const v0 = S.k4 * circularSpeed(S.r4), a = semiMajor(v0, S.r4), T = periodSim(S.r4, v0); if (isFinite(T)) { S.a4pts.push({ a: a, T: T, a3: a * a * a, T2: T * T }); } render4(); }); $('rs4').addEventListener('click', () => { S.a4pts = []; render4(); });
  $('alt5').addEventListener('input', e => { S.alt5 = +e.target.value / 100; render5(); });
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

if (typeof module !== 'undefined') module.exports = { simulate, energy, ecc, semiMajor, apsides, vEff, circularSpeed, escapeSpeed, orbitKind, periodSim, sweptAreas, periodAtAltitude, speedAtAltitude, gAt, RP };
