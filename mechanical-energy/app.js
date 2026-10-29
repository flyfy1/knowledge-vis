/* mechanical-energy: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: a point mass sliding on a track, g = 9.8 m/s^2. Frictionless energy bookkeeping uses E = m g h + 1/2 m v^2 per unit mass where m = 1 kg unless stated. Pure functions. */
const G = 9.8;
const trackH = x => { if (x < 0) return 10 - 1.5 * x; if (x > 24) return 1 + (x - 24) * 2.5; return 1 + 4.5 * (1 + Math.cos(Math.PI * x / 8)) * (1 - 0.45 * x / 24); };
const slope = x => (trackH(x + 1e-4) - trackH(x - 1e-4)) / 2e-4;
const speedAt = (h0, h) => (h <= h0 ? Math.sqrt(2 * G * (h0 - h)) : NaN);       // frictionless: 1/2 v^2 = g (h0 - h)
const startX = h0 => { let lo = 0, hi = 8; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (trackH(m) > h0) lo = m; else hi = m; } return (lo + hi) / 2; };
const reachable = (h0, x0) => { let a = x0, b = x0; const step = 0.01; while (a > -4 && trackH(a - step) <= h0) a -= step; while (b < 28 && trackH(b + step) <= h0) b += step; return [a, b]; };
function simulate(h0, mu, T, dt) { let x = startX(h0), s = 0, vs = 0, Q = 0, t = 0; const out = [{ t: 0, x: x, v: 0, Q: 0, h: trackH(x) }]; let stopped = false;
  for (let i = 1; i <= T / dt; i++) { const sl = slope(x), c = 1 / Math.sqrt(1 + sl * sl), sinT = sl * c, cosT = c; let a = -G * sinT; vs += a * dt; if (mu > 0) { const f = mu * G * cosT * dt; if (Math.abs(vs) <= f) { if (Math.abs(sl) <= mu) { Q += 0.5 * vs * vs; vs = 0; stopped = true; } else vs = 0; } else { vs -= Math.sign(vs) * f; } }
    const dx = vs * c * dt; Q += mu * G * cosT * Math.abs(vs) * dt; x += dx; if (stopped) { out.push({ t: i * dt, x: x, v: 0, Q: Q, h: trackH(x) }); break; }
    if (i % Math.round(0.02 / dt) === 0) out.push({ t: i * dt, x: x, v: Math.abs(vs), Q: Q, h: trackH(x) }); }
  return out; }
const loopSpeed2 = (h0, R, phi) => 2 * G * (h0 - R * (1 - Math.cos(phi)));          // v^2 at angle phi from the bottom of a loop of radius R (start height measured from the bottom)
const loopNormal = (h0, R, phi) => loopSpeed2(h0, R, phi) / R + G * Math.cos(phi);   // N/m in m/s^2
const loopMinH = R => 2.5 * R;
const completesLoop = (h0, R) => { for (let k = 0; k <= 180; k++) { const phi = k * Math.PI / 180; if (loopSpeed2(h0, R, phi) < 0 || loopNormal(h0, R, phi) < -1e-9) return false; } return true; };
const springEnergy = (k, x) => 0.5 * k * x * x;
const springHeight = (k, m, x) => springEnergy(k, x) / (m * G);
const springSpeed = (k, m, x) => x * Math.sqrt(k / m);
const stopDist = (vKmh, mu) => { const v = vKmh / 3.6; return v * v / (2 * mu * G); };
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2), f0 = v => String(Math.round(v));
const S = { h1: 10, x1: 4, h2: 10, mu2: 5, sim2: null, cur2: 0, h3: 15, phi3: 90, R3: 4, k4: 200, m4: 0.5, x4: 15, v5: 50, mu5: 70 };
const play2 = ticker(dt => { const sim = getSim(); S.t2 = (S.t2 || 0) + dt; while (S.cur2 < sim.length - 1 && sim[S.cur2 + 1].t <= S.t2) S.cur2++; render2(); if (S.cur2 >= sim.length - 1) return false; });
function getSim() { const key = S.h2 + '|' + S.mu2; if (!S.sim2 || S.sim2.key !== key) { const arr = simulate(S.h2, S.mu2 / 100, 60, 0.001); arr.key = key; S.sim2 = arr; } return S.sim2; }
function trackPlot(ctx, w, h, L, h0, x, marker) { const X = q => L.x + (q + 4) / 32 * L.w, Y = hh => L.y + L.h - hh / 17 * L.h; ctx.strokeStyle = '#6f93a8'; ctx.lineWidth = 3; ctx.beginPath(); for (let q = -4; q <= 28.01; q += 0.2) { q === -4 ? ctx.moveTo(X(q), Y(trackH(q))) : ctx.lineTo(X(q), Y(trackH(q))); } ctx.stroke();
  line(ctx, L.x, Y(h0), L.x + L.w, Y(h0), COL.muted, 1, [5, 4]); text(ctx, t('lblStartH', { h: f1(h0) }), L.x + L.w - 4, Y(h0) - 4, { align: 'right', size: 10 }); return { X, Y }; }
function bars(ctx, x0, y0, w, hgt, items, E0) { const bw = w / items.length; items.forEach((it, i) => { const hh = Math.max(0, it.v) / E0 * hgt; ctx.fillStyle = it.col; ctx.fillRect(x0 + i * bw + 4, y0 + hgt - hh, bw - 8, hh); text(ctx, t(it.k), x0 + i * bw + bw / 2, y0 + hgt + 13, { align: 'center', size: 10 }); text(ctx, f0(it.v), x0 + i * bw + bw / 2, y0 + hgt - hh - 4, { align: 'center', size: 10, color: COL.ink }); }); }
function render0() {
  const { ctx, w, h } = setup($('cv0')), h0 = S.h1, f = S.x1 / 10, y = h0 * (1 - f), m = 1, Ep = m * G * y, Ek = m * G * (h0 - y), E0 = m * G * h0, gx = w * 0.18, top = 20, hgt = h - 50;
  line(ctx, gx - 24, top + hgt, gx + 24, top + hgt, COL.muted, 2); const by = top + hgt - (y / 20) * hgt; line(ctx, gx, top, gx, top + hgt, '#25384a', 1, [3, 3]); dot(ctx, gx, by, 9, COL.cyan); text(ctx, t('lblHeight', { y: f1(y) }), gx + 14, by + 4, { size: 11 }); arrow(ctx, gx + 30, by, gx + 30, Math.min(top + hgt, by + 14 + (Ek / Math.max(E0, 1)) * 40), COL.orange, 2.5);
  bars(ctx, w * 0.38, top, w * 0.58, hgt, [{ k: 'bEp', v: Ep, col: COL.cyan }, { k: 'bEk', v: Ek, col: COL.orange }, { k: 'bTot', v: Ep + Ek, col: COL.green }], Math.max(E0, 1) * 1.05);
  $('ro0').textContent = t('s0ro', { h0: f1(h0), y: f1(y), Ep: f0(Ep), Ek: f0(Ek), tot: f0(Ep + Ek), v: f1(Math.sqrt(2 * G * (h0 - y))), vg: f1(Math.sqrt(2 * G * h0)) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), L = { x: 8, y: 16, w: w * 0.62, h: h * 0.62 }, x0 = startX(S.h2c), P = trackPlot(ctx, w, h, L, S.h2c, 0); const reach = reachable(S.h2c, x0);
  ctx.fillStyle = 'rgba(224,100,78,.12)'; ctx.fillRect(P.X(-4), L.y, P.X(reach[0]) - P.X(-4), L.h); ctx.fillRect(P.X(reach[1]), L.y, P.X(28) - P.X(reach[1]), L.h);
  const x = Math.min(reach[1] - 0.01, Math.max(reach[0] + 0.01, S.xs1)), hh = trackH(x), v = speedAt(S.h2c, hh), Ep = G * hh, Ek = 0.5 * v * v, E0 = G * S.h2c; dot(ctx, P.X(x), P.Y(hh), 8, COL.cyan);
  bars(ctx, w * 0.7, 16, w * 0.28, h * 0.62, [{ k: 'bEp', v: Ep, col: COL.cyan }, { k: 'bEk', v: Ek, col: COL.orange }], E0 * 1.05); line(ctx, w * 0.7, 16 + h * 0.62 - (E0 / (E0 * 1.05)) * h * 0.62, w * 0.98, 16 + h * 0.62 - (E0 / (E0 * 1.05)) * h * 0.62, COL.green, 1.5, [4, 3]);
  text(ctx, t('lblUnreach'), P.X(-3.8), L.y + 12, { size: 10, color: COL.red }); $('xs1v').textContent = f1(S.xs1); $('h2cv').textContent = f1(S.h2c) + ' m';
  $('ro1').textContent = t('s1ro', { x: f1(x), hh: f1(hh), v: f1(v), Ep: f0(Ep), Ek: f0(Ek), tot: f0(Ep + Ek), hmax: f1(S.h2c) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), sim = getSim(), cur = Math.min(S.cur2, sim.length - 1), st = sim[cur], L = { x: 8, y: 16, w: w * 0.62, h: h * 0.62 }, P = trackPlot(ctx, w, h, L, S.h2, 0), E0 = G * S.h2;
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= cur; i += 3) { const p = sim[i]; i ? ctx.lineTo(P.X(p.x), P.Y(p.h) - 0) : ctx.moveTo(P.X(p.x), P.Y(p.h)); } ctx.stroke(); dot(ctx, P.X(st.x), P.Y(st.h), 8, COL.cyan);
  const Ep = G * st.h, Ek = 0.5 * st.v * st.v; bars(ctx, w * 0.7, 16, w * 0.28, h * 0.62, [{ k: 'bEp', v: Ep, col: COL.cyan }, { k: 'bEk', v: Ek, col: COL.orange }, { k: 'bQ', v: st.Q, col: COL.red }], E0 * 1.05);
  $('mu2v').textContent = (S.mu2 / 100).toFixed(2); $('play2').textContent = play2.running ? t('pause') : t('play'); $('h2v').textContent = f1(S.h2) + ' m';
  $('ro2').textContent = t('s2ro', { mu: (S.mu2 / 100).toFixed(2), t: f1(st.t), Ep: f0(Ep), Ek: f0(Ek), Q: f0(st.Q), tot: f0(Ep + Ek + st.Q), E0: f0(E0) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), R = S.R3, h0 = S.h3, phi = S.phi3 * Math.PI / 180, cx = w * 0.36, cy = h * 0.5, sc = Math.min(h * 0.34 / R, w * 0.2 / R);
  ctx.strokeStyle = '#6f93a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R * sc, 0, 6.2832); ctx.stroke(); line(ctx, 10, cy + R * sc, cx + R * sc * 1.6, cy + R * sc, '#6f93a8', 3);
  const px = cx - R * sc * Math.sin(phi), py = cy + R * sc * Math.cos(phi); dot(ctx, px, py, 7, COL.cyan);
  const hy = cy + R * sc - Math.min(h0, 22) * sc; line(ctx, 10, hy, w * 0.66, hy, COL.muted, 1, [5, 4]); text(ctx, t('lblStartH', { h: f1(h0) }), 12, hy - 4, { size: 10 }); const hmin = loopMinH(R), ym = cy + R * sc - hmin * sc; line(ctx, 10, ym, w * 0.66, ym, COL.green, 1, [3, 3]); text(ctx, t('lblMinH', { h: f1(hmin) }), w * 0.66, ym - 4, { align: 'right', size: 10, color: COL.green });
  const v2 = loopSpeed2(h0, R, phi), N = loopNormal(h0, R, phi) / G, ok = completesLoop(h0, R);
  const bx = w * 0.7, bw = w * 0.26; text(ctx, t('lblNormal'), bx, 30, { size: 11 }); const nn = Math.max(-1, Math.min(5, N)); ctx.fillStyle = nn < 0 ? COL.red : COL.cyan; const zy = 130; ctx.fillRect(bx, nn >= 0 ? zy - nn * 18 : zy, bw * 0.5, Math.abs(nn) * 18); line(ctx, bx - 4, zy, bx + bw, zy, COL.muted, 1);
  text(ctx, t(ok ? 'vLoopOk' : 'vLoopFail'), 12, h - 12, { size: 13, color: ok ? COL.green : COL.red, bold: true });
  $('R3v').textContent = R.toFixed(1) + ' m'; $('h3v').textContent = f1(h0) + ' m'; $('phi3v').textContent = S.phi3 + '°';
  $('ro3').textContent = v2 < 0 ? t('s3roNo', { R: R, hmin: f1(hmin), h0: f1(h0) }) : t('s3ro', { R: R, h0: f1(h0), phi: S.phi3, v: f1(Math.sqrt(v2)), N: f2(N), hmin: f1(hmin), verdict: ok ? t('vLoopOk') : t('vLoopFail') });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), k = S.k4, m = S.m4, x = S.x4 / 100, E = springEnergy(k, x), hh = springHeight(k, m, x), v = springSpeed(k, m, x), floor = h - 24, sc = Math.min((h - 60) / Math.max(hh, 0.3), 220), top = floor - Math.min(hh * sc, h - 50);
  line(ctx, 14, floor, w * 0.5, floor, COL.muted, 3); const sx = 40, coils = 8, ch = (x * 100) * 0.9 + 4; ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, floor); for (let i = 0; i <= coils * 2; i++) ctx.lineTo(sx + (i % 2 ? 10 : -10), floor - (i + 0.5) * ch / (coils * 2)); ctx.lineTo(sx, floor - ch); ctx.stroke(); dot(ctx, sx, floor - ch - 8, 8, COL.cyan);
  dot(ctx, sx + 80, top, 8, 'rgba(103,215,249,.5)'); line(ctx, sx + 80, floor, sx + 80, top, COL.green, 1.5, [4, 3]); text(ctx, t('lblPeak', { h: f2(hh) }), sx + 94, (floor + top) / 2, { size: 11, color: COL.green }); text(ctx, t('lblCompressTag', { x: f2(x) }), sx + 20, floor + 16, { size: 11 });
  bars(ctx, w * 0.56, 16, w * 0.4, h - 60, [{ k: 'bElastic', v: E, col: COL.orange }, { k: 'bKin', v: 0.5 * m * v * v, col: COL.cyan }, { k: 'bEpPeak', v: m * G * hh, col: COL.green }], Math.max(E, 0.5) * 1.05);
  $('k4v').textContent = k + ' N/m'; $('m4v').textContent = m.toFixed(2) + ' kg'; $('x4v').textContent = x.toFixed(2) + ' m'; $('ro4').textContent = t('s4ro', { k: k, m: m.toFixed(2), x: x.toFixed(2), E: f2(E), v: f2(v), h: f2(hh) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), mu = S.mu5 / 100, L = { x: 44, y: 14, w: w - 60, h: h - 46 }, X = v => L.x + v / 130 * L.w, ymax = stopDist(130, 0.1), Y = d => L.y + L.h - Math.min(d, 160) / 160 * L.h; axes(ctx, L);
  [[0.8, COL.green], [0.4, COL.orange], [0.1, COL.cyan]].forEach(([mm, col]) => { const pts = []; for (let v = 0; v <= 130; v += 2) pts.push([X(v), Y(stopDist(v, mm))]); curve(ctx, pts, col, 1.6); }); const pts = []; for (let v = 0; v <= 130; v += 2) pts.push([X(v), Y(stopDist(v, mu))]); curve(ctx, pts, COL.ink, 3);
  const d = stopDist(S.v5, mu); dot(ctx, X(S.v5), Y(d), 7, COL.red); line(ctx, X(S.v5), Y(d), X(S.v5), L.y + L.h, COL.red, 1, [3, 3]); [0, 40, 80, 120].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 80, 160].forEach(v => text(ctx, String(v), L.x - 4, Y(v) + 3, { align: 'right', size: 10 }));
  text(ctx, t('axSpeed'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axDist'), L.x + 4, L.y + 10, { size: 11 }); text(ctx, t('lblCurves'), L.x + 4, L.y + 24, { size: 10, color: COL.muted });
  $('v5v').textContent = S.v5 + ' km/h'; $('mu5v').textContent = mu.toFixed(2); const v = S.v5 / 3.6, ek = 0.5 * 1000 * v * v / 1000; $('ro5').textContent = t('s5ro', { v: S.v5, mu: mu.toFixed(2), d: f1(d), ek: f0(ek), d2: f1(stopDist(S.v5 * 2, mu)) });
}
function wire() {
  $('h1').addEventListener('input', e => { S.h1 = +e.target.value / 10; render0(); }); slider('x1', v => { S.x1 = v; render0(); });
  $('h2c').addEventListener('input', e => { S.h2c = +e.target.value / 10; S.xs1 = Math.min(Math.max(S.xs1, reachable(S.h2c, startX(S.h2c))[0]), reachable(S.h2c, startX(S.h2c))[1]); render1(); }); $('xs1').addEventListener('input', e => { S.xs1 = +e.target.value / 10; render1(); });
  $('h2').addEventListener('input', e => { S.h2 = +e.target.value / 10; resetSim(); render2(); }); $('mu2').addEventListener('input', e => { S.mu2 = +e.target.value; resetSim(); render2(); });
  $('play2').addEventListener('click', () => { const sim = getSim(); if (play2.running) play2.stop(); else if (reduceMotion()) S.cur2 = sim.length - 1; else { if (S.cur2 >= sim.length - 1) { S.cur2 = 0; S.t2 = 0; } play2.start(); } render2(); }); $('reset2').addEventListener('click', () => { resetSim(); render2(); });
  $('R3').addEventListener('input', e => { S.R3 = +e.target.value / 10; render3(); }); $('h3').addEventListener('input', e => { S.h3 = +e.target.value / 10; render3(); }); slider('phi3', v => { S.phi3 = v; render3(); });
  slider('k4', v => { S.k4 = v; render4(); }); $('m4').addEventListener('input', e => { S.m4 = +e.target.value / 100; render4(); }); $('x4').addEventListener('input', e => { S.x4 = +e.target.value; render4(); });
  slider('v5', v => { S.v5 = v; render5(); }); $('mu5').addEventListener('input', e => { S.mu5 = +e.target.value; render5(); }); [['dry', 80], ['wet', 40], ['ice', 10]].forEach(([k, v]) => $('rd_' + k).addEventListener('click', () => { S.mu5 = v; $('mu5').value = v; render5(); }));
}
function resetSim() { play2.stop(); S.sim2 = null; S.cur2 = 0; S.t2 = 0; }
S.h2c = 10; S.xs1 = 4;

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

if (typeof module !== 'undefined') module.exports = { G, trackH, slope, speedAt, startX, reachable, simulate, loopSpeed2, loopNormal, loopMinH, completesLoop, springEnergy, springHeight, springSpeed, stopDist };
