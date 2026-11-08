/* chaos-threebody: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Models: logistic map, Lorenz system (RK4) and the planar figure-8 three-body orbit (G = m = 1). Pure functions only. */
const logistic = (r, x) => r * x * (1 - x);
function orbit(r, x0, n) { const a = [x0]; for (let i = 0; i < n; i++) a.push(logistic(r, a[i])); return a; }
function sepStep(r, x0, d, thr, n) { let a = x0, b = x0 + d; for (let i = 1; i <= n; i++) { a = logistic(r, a); b = logistic(r, b); if (Math.abs(a - b) > thr) return i; } return -1; }
function lyap(r) { let x = 0.4; for (let i = 0; i < 300; i++) x = logistic(r, x); let s = 0; const N = 3000; for (let i = 0; i < N; i++) { x = logistic(r, x); s += Math.log(Math.max(1e-12, Math.abs(r * (1 - 2 * x)))); } return s / N; }
function attractor(r) { let x = 0.4; for (let i = 0; i < 300; i++) x = logistic(r, x); const p = []; for (let i = 0; i < 50; i++) { x = logistic(r, x); p.push(x); } return p; }
const SIG = 10, BETA = 8 / 3, LORENZ_LAMBDA = 0.9056;
const lorenzF = (s, rho) => [SIG * (s[1] - s[0]), s[0] * (rho - s[2]) - s[1], s[0] * s[1] - BETA * s[2]];
function rk4(f, s, dt) { const add = (a, b, k) => a.map((v, i) => v + b[i] * k), k1 = f(s), k2 = f(add(s, k1, dt / 2)), k3 = f(add(s, k2, dt / 2)), k4 = f(add(s, k3, dt)); return s.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); }
function lorenzTraj(rho, s0, T, dt) { const f = s => lorenzF(s, rho), out = [s0]; let s = s0; for (let i = 0; i < T / dt; i++) { s = rk4(f, s, dt); out.push(s); } return out; }
const ATT0 = (() => { const tr = lorenzTraj(28, [1, 1, 1], 20, 0.01); return tr[tr.length - 1]; })();
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
function sepSeries(d, T, dt) { const f = s => lorenzF(s, 28); let a = ATT0, b = [ATT0[0] + d, ATT0[1], ATT0[2]]; const out = [dist3(a, b)], xa = [a[0]], xb = [b[0]]; for (let i = 0; i < T / dt; i++) { a = rk4(f, a, dt); b = rk4(f, b, dt); out.push(dist3(a, b)); xa.push(a[0]); xb.push(b[0]); } return { sep: out, xa, xb, dt }; }
function sepTime(d, thr) { const f = s => lorenzF(s, 28), dt = 0.005; let a = ATT0, b = [ATT0[0] + d, ATT0[1], ATT0[2]]; for (let i = 0; i < 120 / dt; i++) { a = rk4(f, a, dt); b = rk4(f, b, dt); if (dist3(a, b) > (thr || 1)) return (i + 1) * dt; } return Infinity; }
const HORIZON = {}; const horizon = k => (HORIZON[k] = HORIZON[k] || sepTime(Math.pow(10, -k), 1));
const predictedHorizon = (d, thr) => Math.log((thr || 1) / d) / LORENZ_LAMBDA;
/* three bodies: state [x1,y1,x2,y2,x3,y3,vx1,vy1,vx2,vy2,vx3,vy3] */
function accel(s) { const a = new Array(6).fill(0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (i === j) continue; const dx = s[2 * j] - s[2 * i], dy = s[2 * j + 1] - s[2 * i + 1], d2 = dx * dx + dy * dy + 1e-9, inv = 1 / (d2 * Math.sqrt(d2)); a[2 * i] += dx * inv; a[2 * i + 1] += dy * inv; } return a; }
const tbF = s => { const a = accel(s); return s.slice(6).concat(a); };
const FIG8 = [-0.97000436, 0.24308753, 0.97000436, -0.24308753, 0, 0, 0.466203685, 0.43236573, 0.466203685, 0.43236573, -0.93240737, -0.86473146];
const FIG8_T = 6.3259;
function energy(s) { let k = 0, u = 0; for (let i = 0; i < 3; i++) k += 0.5 * (s[6 + 2 * i] ** 2 + s[7 + 2 * i] ** 2); for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) u -= 1 / Math.hypot(s[2 * i] - s[2 * j], s[2 * i + 1] - s[2 * j + 1]); return k + u; }
function threeBody(eps, T) { const s0 = FIG8.slice(); s0[0] += eps; const dt = 0.002, stride = 25, out = [s0.slice()]; let s = s0; for (let i = 1; i <= T / dt; i++) { s = rk4(tbF, s, dt); if (i % stride === 0) out.push(s.slice()); } return { frames: out, dtFrame: dt * stride }; }
function minPair(s) { let m = Infinity; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) m = Math.min(m, Math.hypot(s[2 * i] - s[2 * j], s[2 * i + 1] - s[2 * j + 1])); return m; }
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2), f3 = v => (Math.round(v * 1000) / 1000).toFixed(3), sci = v => v.toExponential(1);
const S = { r0: 3.9, d0: 4, r1: 3.9, rho: 28, cur2: 0, e3: -8, k4: 8, eps: 0, T5: 20, cur5: 0 };
let LTR = null, LTR_RHO = null; const getLorenz = () => { if (LTR_RHO !== S.rho) { LTR = lorenzTraj(S.rho, [1, 1, 1], 60, 0.01); LTR_RHO = S.rho; } return LTR; };
let TB = null, TB_KEY = ''; const getTB = () => { const k = S.eps + '|' + S.T5; if (k !== TB_KEY) { TB = threeBody(S.eps, S.T5); TB_KEY = k; } return TB; };
const play2 = ticker(dt => { const n = getLorenz().length; S.cur2 = Math.min(n - 1, S.cur2 + Math.round(dt * 700)); render2(); if (S.cur2 >= n - 1) return false; });
const play5 = ticker(dt => { const n = getTB().frames.length; S.cur5 = Math.min(n - 1, S.cur5 + Math.max(1, Math.round(dt * 400 / 25 * 3))); render5(); if (S.cur5 >= n - 1) return false; });

function render0() {
  $('r0v').textContent = S.r0.toFixed(1);
  const { ctx, w, h } = setup($('cv0')), r = S.r0, d = Math.pow(10, -S.d0), N = 60, L = { x: 36, y: 14, w: w - 52, h: h - 46 }, X = i => L.x + i / N * L.w, Y = v => L.y + L.h - v * L.h;
  axes(ctx, L); const a = orbit(r, 0.4, N), b = orbit(r, 0.4 + d, N); curve(ctx, a.map((v, i) => [X(i), Y(v)]), COL.cyan, 2.5); curve(ctx, b.map((v, i) => [X(i), Y(v)]), COL.orange, 2);
  const sp = sepStep(r, 0.4, d, 0.1, N); if (sp > 0) { line(ctx, X(sp), L.y, X(sp), L.y + L.h, COL.red, 1.5, [4, 3]); text(ctx, t('lblSplit', { n: sp }), X(sp) + 4, L.y + 12, { size: 11, color: COL.red }); }
  [0, 20, 40, 60].forEach(i => text(ctx, i + '', X(i), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axStep'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, 'x', L.x + 4, L.y + 10, { size: 11 });
  $('ro0').textContent = sp > 0 ? t('s0ro', { r: r.toFixed(2), d: sci(d), n: sp }) : t('s0roNo', { r: r.toFixed(2), d: sci(d), N: N });
}
function render1() {
  $('r1v').textContent = S.r1.toFixed(1);
  const { ctx, w, h } = setup($('cv1')), r = S.r1, L = { x: 36, y: 12, w: w - 52, h: h * 0.52 }, X = rr => L.x + (rr - 2.5) / 1.5 * L.w, Y = v => L.y + L.h - v * L.h; axes(ctx, L);
  ctx.fillStyle = 'rgba(103,215,249,.75)'; for (let i = 0; i <= 240; i++) { const rr = 2.5 + 1.5 * i / 240; attractor(rr).forEach(v => ctx.fillRect(X(rr), Y(v), 1.2, 1.2)); }
  line(ctx, X(r), L.y, X(r), L.y + L.h, COL.orange, 1.5, [4, 3]); text(ctx, t('axAttr'), L.x + 4, L.y + 10, { size: 11 });
  const M = { x: L.x, y: L.y + L.h + 26, w: L.w, h: h - (L.y + L.h) - 46 }, ly = rr => lyap(rr), lo = -1.5, hi = 0.8, YL = v => M.y + M.h - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * M.h; axes(ctx, M);
  line(ctx, M.x, YL(0), M.x + M.w, YL(0), COL.muted, 1, [3, 3]); const pts = []; for (let i = 0; i <= 150; i++) { const rr = 2.5 + 1.5 * i / 150; pts.push([X(rr), YL(ly(rr))]); } curve(ctx, pts, COL.green, 2);
  line(ctx, X(r), M.y, X(r), M.y + M.h, COL.orange, 1.5, [4, 3]); dot(ctx, X(r), YL(lyap(r)), 5, COL.orange); text(ctx, t('axLyap'), M.x + 4, M.y + 10, { size: 11 });
  [2.5, 3, 3.5, 4].forEach(rr => text(ctx, rr + '', X(rr), M.y + M.h + 14, { align: 'center', size: 10 })); text(ctx, 'r', M.x + M.w, M.y + M.h + 28, { align: 'right', size: 11 });
  const lam = lyap(r); $('ro1').textContent = t('s1ro', { r: r.toFixed(2), l: f2(lam), kind: lam > 0.01 ? t('kChaos') : t('kOrder'), k: attractor(r).filter((v, i, a) => a.findIndex(u => Math.abs(u - v) < 1e-4) === i).length });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), tr = getLorenz(), cur = S.cur2, L = { x: 14, y: 12, w: w - 28, h: h - 40 }, X = x => L.x + (x + 25) / 50 * L.w, Y = z => L.y + L.h - z / 55 * L.h; axes(ctx, L);
  ctx.lineWidth = 1; for (let i = 1; i <= cur; i += 1) { ctx.strokeStyle = 'hsl(' + Math.round(190 + 170 * i / tr.length) + ',80%,62%)'; ctx.beginPath(); ctx.moveTo(X(tr[i - 1][0]), Y(tr[i - 1][2])); ctx.lineTo(X(tr[i][0]), Y(tr[i][2])); ctx.stroke(); }
  const p = tr[cur]; dot(ctx, X(p[0]), Y(p[2]), 5, COL.orange); text(ctx, 'x', L.x + L.w, L.y + L.h + 14, { align: 'right', size: 11 }); text(ctx, 'z', L.x + 4, L.y + 10, { size: 11 });
  const rho = S.rho, reg = rho < 1 ? 'regA' : rho < 24.74 ? 'regB' : 'regC'; $('play2').textContent = play2.running ? t('pause') : t('play');
  $('ro2').textContent = t('s2ro', { rho: rho, reg: t(reg), x: f1(p[0]), y: f1(p[1]), z: f1(p[2]), tm: f1(cur * 0.01) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), d = Math.pow(10, S.e3), T = 40, sr = sepSeries(d, T, 0.01), n = sr.sep.length, L1 = { x: 36, y: 12, w: w - 52, h: h * 0.4 }, X = i => L1.x + i / (n - 1) * L1.w;
  axes(ctx, L1); const Y1 = x => L1.y + L1.h / 2 - x / 25 * L1.h / 2; curve(ctx, sr.xa.map((v, i) => [X(i), Y1(v)]), COL.cyan, 2.2); curve(ctx, sr.xb.map((v, i) => [X(i), Y1(v)]), COL.orange, 1.6); text(ctx, t('axX'), L1.x + 4, L1.y + 10, { size: 11 });
  const L2 = { x: 36, y: L1.y + L1.h + 26, w: L1.w, h: h - (L1.y + L1.h) - 52 }, lo = -12, hi = 2, Y2 = v => L2.y + L2.h - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * L2.h; axes(ctx, L2);
  curve(ctx, sr.sep.map((v, i) => [X(i), Y2(Math.log10(Math.max(v, 1e-12)))]), COL.red, 2); line(ctx, L2.x, Y2(0), L2.x + L2.w, Y2(0), COL.muted, 1, [3, 3]); text(ctx, t('axSep'), L2.x + 4, L2.y + 10, { size: 11 });
  const ts = sepTime(d, 1); if (isFinite(ts) && ts <= T) { line(ctx, X(ts / 0.01), L1.y, X(ts / 0.01), L2.y + L2.h, COL.ink, 1.5, [4, 3]); } [0, 10, 20, 30, 40].forEach(q => text(ctx, q + '', X(q / 0.01), L2.y + L2.h + 14, { align: 'center', size: 10 })); text(ctx, t('axTime'), L2.x + L2.w, L2.y + L2.h + 28, { align: 'right', size: 11 });
  $('ro3').textContent = t('s3ro', { d: sci(d), ts: f1(ts), pred: f1(predictedHorizon(d, 1)) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), k = S.k4, L = { x: 40, y: 14, w: w - 56, h: h - 46 }, X = kk => L.x + (kk - 2) / 10 * L.w, Y = v => L.y + L.h - v / 30 * L.h; axes(ctx, L);
  const pts = [], pr = []; for (let kk = 2; kk <= 12; kk++) { pts.push([X(kk), Y(horizon(kk))]); pr.push([X(kk), Y(predictedHorizon(Math.pow(10, -kk), 1))]); } curve(ctx, pr, COL.muted, 1.5); curve(ctx, pts, COL.orange, 3); pts.forEach(p => dot(ctx, p[0], p[1], 3, COL.orange));
  line(ctx, X(k), L.y, X(k), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(k), Y(horizon(k)), 6, COL.cyan);
  [2, 4, 6, 8, 10, 12].forEach(kk => text(ctx, '10^-' + kk, X(kk), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 10, 20, 30].forEach(v => text(ctx, v + '', L.x - 4, Y(v) + 3, { align: 'right', size: 10 })); text(ctx, t('axPrec'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axHor'), L.x + 4, L.y + 10, { size: 11 });
  const gain = k < 12 ? horizon(k + 1) - horizon(k) : horizon(12) - horizon(11);
  $('ro4').textContent = t('s4ro', { k: k, h: f1(horizon(k)), pred: f1(predictedHorizon(Math.pow(10, -k), 1)), g: f1(gain), g2: f1(Math.LN10 / LORENZ_LAMBDA) });
}
function render5() {
  $('eps5v').textContent = S.eps.toFixed(3);
  const { ctx, w, h } = setup($('cv5')), tb = getTB(), cur = Math.min(S.cur5, tb.frames.length - 1), L = { x: 10, y: 10, w: w - 20, h: h - 38 }, sc = Math.min(L.w, L.h) / 3.4, cx = L.x + L.w / 2, cy = L.y + L.h / 2, cols = [COL.cyan, COL.orange, COL.green];
  axes(ctx, { x: L.x, y: L.y, w: L.w, h: L.h }); const ref = threeBodyRef(); ctx.strokeStyle = '#2b4658'; ctx.lineWidth = 1; for (let b = 0; b < 3; b++) { ctx.beginPath(); ref.forEach((fr, i) => { const x = cx + fr[2 * b] * sc, y = cy - fr[2 * b + 1] * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
  for (let b = 0; b < 3; b++) { ctx.strokeStyle = cols[b]; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= cur; i++) { const x = cx + tb.frames[i][2 * b] * sc, y = cy - tb.frames[i][2 * b + 1] * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); const f = tb.frames[cur]; dot(ctx, cx + f[2 * b] * sc, cy - f[2 * b + 1] * sc, 6, cols[b]); }
  text(ctx, t('legend5'), L.x + 6, L.y + L.h + 16, { size: 10 }); $('play5').textContent = play5.running ? t('pause') : t('play');
  const f = tb.frames[cur], e0 = energy(FIG8), dev = Math.max.apply(null, [0, 1, 2, 3, 4, 5].map(i => Math.abs(f[i] - ref[Math.min(cur, ref.length - 1)][i])));
  $('ro5').textContent = t('s5ro', { eps: S.eps, T: f1(cur * tb.dtFrame), dev: f2(dev), de: sci(Math.abs(energy(f) / e0 - 1)), mn: f2(minPair(f)) });
}
let REF = null; const threeBodyRef = () => REF = REF || threeBody(0, 30).frames;
function wire() {
  slider10('r0', v => { S.r0 = v; render0(); }); slider('d0', v => { S.d0 = v; render0(); }); slider10('r1', v => { S.r1 = v; render1(); });
  slider('rho2', v => { S.rho = v; S.cur2 = 0; play2.stop(); render2(); });
  $('play2').addEventListener('click', () => { if (play2.running) play2.stop(); else if (reduceMotion()) S.cur2 = getLorenz().length - 1; else { if (S.cur2 >= getLorenz().length - 1) S.cur2 = 0; play2.start(); } render2(); });
  $('reset2').addEventListener('click', () => { play2.stop(); S.cur2 = 0; render2(); }); $('all2').addEventListener('click', () => { play2.stop(); S.cur2 = getLorenz().length - 1; render2(); });
  slider('e3', v => { S.e3 = v; render3(); }); slider('k4', v => { S.k4 = v; render4(); });
  $('eps5').addEventListener('input', e => { S.eps = +e.target.value / 1000; play5.stop(); S.cur5 = 0; render5(); }); slider('T5', v => { S.T5 = v; play5.stop(); S.cur5 = 0; render5(); });
  $('play5').addEventListener('click', () => { const n = getTB().frames.length; if (play5.running) play5.stop(); else if (reduceMotion()) S.cur5 = n - 1; else { if (S.cur5 >= n - 1) S.cur5 = 0; play5.start(); } render5(); });
  $('reset5').addEventListener('click', () => { play5.stop(); S.cur5 = 0; render5(); }); $('all5').addEventListener('click', () => { play5.stop(); S.cur5 = getTB().frames.length - 1; render5(); });
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

if (typeof module !== 'undefined') module.exports = { logistic, orbit, sepStep, lyap, lorenzF, rk4, lorenzTraj, ATT0, sepTime, predictedHorizon, LORENZ_LAMBDA, energy, threeBody, FIG8, FIG8_T, minPair };
