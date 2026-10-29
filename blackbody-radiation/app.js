/* blackbody-radiation: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: ideal blackbody (SI units). All functions are pure. */
const H_ = 6.62607015e-34, C_ = 2.99792458e8, K_ = 1.380649e-23, SIGMA = 5.670374419e-8, WIEN_X = 4.965114231744276;
const WIEN_B = H_ * C_ / (K_ * WIEN_X);                                   // m*K, about 2.898e-3
const xOf = (lamNm, T) => H_ * C_ / (lamNm * 1e-9 * K_ * T);
const planckM = (lamNm, T) => { const l = lamNm * 1e-9, x = H_ * C_ / (l * K_ * T); return 2 * Math.PI * H_ * C_ * C_ / Math.pow(l, 5) / Math.expm1(x) * 1e-9; }; // W/m^2 per nm
const rayleighM = (lamNm, T) => { const l = lamNm * 1e-9; return 2 * Math.PI * C_ * K_ * T / Math.pow(l, 4) * 1e-9; };
const peakNm = T => WIEN_B / T * 1e9;
const totalPower = T => SIGMA * Math.pow(T, 4);                           // W/m^2
function integratePlanck(T) { let s = 0, prev = null; const N = 3000, lo = Math.log(10), hi = Math.log(5e6); for (let i = 0; i <= N; i++) { const l = Math.exp(lo + (hi - lo) * i / N), m = planckM(l, T) * l; if (prev !== null) s += 0.5 * (m + prev) * (hi - lo) / N; prev = m; } return s; } // dl = l dlnl
function argmaxPlanck(T) { let best = 0, bl = 0; for (let l = 50; l <= 40000; l += l < 3000 ? 1 : 10) { const m = planckM(l, T); if (m > best) { best = m; bl = l; } } return bl; }
function visibleShare(T) { let v = 0, a = 0; for (let l = 380; l <= 750; l += 2) v += planckM(l, T) * 2; return v; }
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
function tempRGB(T) { const t = T / 100; let r, g, b; r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592); g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492); b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307; return [cl(Math.round(r), 0, 255), cl(Math.round(g), 0, 255), cl(Math.round(b), 0, 255)]; }
let GLOW_DEN = 0;
const glow = T => { if (!GLOW_DEN) GLOW_DEN = Math.log10(visibleShare(10000) / visibleShare(1000) + 1); return cl(Math.log10(visibleShare(T) / visibleShare(1000) + 1) / GLOW_DEN, 0.03, 1); };   // 0..1 brightness cue from visible-band power
const region = nm => nm < 380 ? 'uv' : nm <= 750 ? 'vis' : 'ir';
const occupation = x => 1 / Math.expm1(x), classicalOcc = x => 1 / x;
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2), sci = v => v.toExponential(2);
const S = { T0: 3000, T1: 5000, T2: 5772, T3: 5000, T4: 5000, lam4: 400, T5: 5000, lam5: 500 };
const rainbow = nm => 'hsl(' + Math.round(280 - (nm - 380) / 370 * 280) + ',90%,55%)';
function logAxis(ctx, L, lo, hi, ticks, fmtT) { const X = nm => L.x + (Math.log(nm) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * L.w; for (let nm = 380; nm < 750; nm += 5) { ctx.fillStyle = rainbow(nm); ctx.globalAlpha = 0.5; ctx.fillRect(X(nm), L.y, Math.max(1, X(nm + 5) - X(nm)), L.h); } ctx.globalAlpha = 1; axes(ctx, L); ticks.forEach(nm => text(ctx, fmtT(nm), X(nm), L.y + L.h + 14, { align: 'center', size: 10 })); return X; }
const fmtNm = nm => nm >= 1000 ? (nm / 1000) + 'µm' : nm + 'nm';

function render0() {
  const { ctx, w, h } = setup($('cv0')), T = S.T0, rgb = tempRGB(T), g = glow(T), cx = w / 2, cy = h * 0.34, R = Math.min(w, h) * 0.2;
  const gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, R * 2.3); gr.addColorStop(0, 'rgba(' + rgb + ',' + g + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h * 0.7);
  ctx.fillStyle = 'rgb(' + rgb.map(v => Math.round(v * (0.15 + 0.85 * g))) + ')'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
  const L = { x: 16, y: h * 0.66, w: w - 32, h: h * 0.14 }, X = logAxis(ctx, L, 100, 20000, [100, 380, 750, 3000, 20000], fmtNm), pk = peakNm(T);
  line(ctx, X(pk), L.y - 6, X(pk), L.y + L.h, COL.ink, 2.5); text(ctx, t('lblPeak', { p: Math.round(pk) }), cl(X(pk), 50, w - 50), L.y - 10, { align: 'center', size: 11, color: COL.ink, bold: true });
  text(ctx, t('lblVis'), X(540), L.y + L.h / 2 + 4, { align: 'center', size: 10, color: '#0a0e14', bold: true });
  $('ro0').textContent = t('s0ro', { T: T, p: Math.round(pk), reg: t('reg_' + region(pk)), c: rgb.join(', ') });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), T = S.T1, L = { x: 40, y: 14, w: w - 56, h: h - 46 }, X = nm => L.x + (nm - 100) / 2900 * L.w, ymax = planckM(peakNm(8000), 8000) * 1.08, Y = m => L.y + L.h - m / ymax * L.h;
  for (let nm = 380; nm < 750; nm += 5) { ctx.fillStyle = rainbow(nm); ctx.globalAlpha = 0.28; ctx.fillRect(X(nm), L.y, X(nm + 5) - X(nm) + 0.5, L.h); } ctx.globalAlpha = 1; axes(ctx, L);
  [3000, 6000].forEach(r => { const p = []; for (let nm = 100; nm <= 3000; nm += 20) p.push([X(nm), Y(planckM(nm, r))]); curve(ctx, p, '#35566b', 1.2); text(ctx, r + ' K', X(3000) - 4, Y(planckM(2950, r)) - 5, { align: 'right', size: 10, color: '#6f93a8' }); });
  const p = []; for (let nm = 100; nm <= 3000; nm += 10) p.push([X(nm), Y(planckM(nm, T))]); curve(ctx, p, COL.orange, 3);
  const pk = peakNm(T); if (pk <= 3000) dot(ctx, X(pk), Y(planckM(pk, T)), 6, COL.cyan);
  [100, 1000, 2000, 3000].forEach(nm => text(ctx, nm + '', X(nm), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axLam'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axM'), L.x + 4, L.y + 10, { size: 11 });
  const vs = visibleShare(T) / totalPower(T) * 100;
  $('ro1').textContent = t('s1ro', { T: T, pk: Math.round(pk), m: sci(planckM(pk, T)), tot: sci(totalPower(T)), vis: f1(vs) });
}
function render2() {
  const { ctx, w, h } = setup($('cv2')), T = S.T2, L = { x: 44, y: 14, w: w - 60, h: h - 46 }, tmin = 250, tmax = 10000, X = tt => L.x + (Math.log(tt) - Math.log(tmin)) / (Math.log(tmax) - Math.log(tmin)) * L.w, lmin = 200, lmax = 20000, Y = nm => L.y + L.h - (Math.log(nm) - Math.log(lmin)) / (Math.log(lmax) - Math.log(lmin)) * L.h;
  for (let nm = 380; nm < 750; nm += 5) { ctx.fillStyle = rainbow(nm); ctx.globalAlpha = 0.35; ctx.fillRect(L.x, Y(nm + 5), L.w, Y(nm) - Y(nm + 5) + 0.5); } ctx.globalAlpha = 1; axes(ctx, L);
  const p = []; for (let tt = tmin; tt <= tmax; tt *= 1.04) p.push([X(tt), Y(peakNm(tt))]); curve(ctx, p, COL.orange, 2.8);
  [[310, 'objBody'], [2800, 'objBulb'], [5772, 'objSun']].forEach(([tt, k]) => { dot(ctx, X(tt), Y(peakNm(tt)), 4, COL.ink); text(ctx, t(k), X(tt) + 6, Y(peakNm(tt)) - 6, { size: 10 }); });
  [300, 1000, 3000, 10000].forEach(tt => text(ctx, tt + '', X(tt), L.y + L.h + 14, { align: 'center', size: 10 })); [500, 1000, 5000, 10000].forEach(nm => text(ctx, fmtNm(nm), L.x - 4, Y(nm) + 3, { align: 'right', size: 10 }));
  text(ctx, t('axT'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 });
  line(ctx, X(T), L.y, X(T), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(T), Y(peakNm(T)), 6, COL.cyan);
  $('ro2').textContent = t('s2ro', { T: T, f: Math.round(peakNm(T)), n: argmaxPlanck(T), prod: f2(peakNm(T) * 1e-9 * T * 1000), reg: t('reg_' + region(peakNm(T))) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), T = S.T3, L = { x: 14, y: 14, w: w - 28, h: h - 46 }, tmax = 10000, X = tt => L.x + tt / tmax * L.w, ymax = totalPower(tmax), Y = v => L.y + L.h - v / ymax * L.h;
  axes(ctx, L); const p = []; for (let tt = 0; tt <= tmax; tt += 100) p.push([X(tt), Y(totalPower(tt))]); curve(ctx, p, COL.orange, 2.8);
  line(ctx, X(T), Y(totalPower(T)), X(T), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(T), Y(totalPower(T)), 6, COL.cyan);
  // bars: same T vs half T
  const pw = totalPower(T), ph = totalPower(T / 2); text(ctx, t('lblHalf', { r: Math.round(pw / ph) }), L.x + 8, L.y + 16, { size: 12, color: COL.orange, bold: true });
  [0, 2500, 5000, 7500, 10000].forEach(tt => text(ctx, tt + '', X(tt), L.y + L.h + 14, { align: tt === 10000 ? 'right' : 'center', size: 10 })); text(ctx, t('axT'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 });
  const num = integratePlanck(T); $('ro3').textContent = t('s3ro', { T: T, p: sci(pw), num: sci(num), err: f2(Math.abs(num / pw - 1) * 100), r: Math.round(pw / ph), rs: f2(pw / totalPower(300)) });
}
const lamOf = v => Math.round(Math.pow(10, v / 100));
function render4() {
  const { ctx, w, h } = setup($('cv4')), T = S.T4, lam = S.lam4, L = { x: 16, y: 14, w: w - 32, h: h - 52 }, pk = planckM(peakNm(T), T), top = Math.log10(pk) + 5, dec = 12;
  const X = logAxis(ctx, L, 100, 30000, [100, 1000, 10000, 30000], fmtNm), Y = m => L.y + (top - Math.log10(Math.max(m, 1e-300))) / dec * L.h, cy = y => Math.max(L.y, Math.min(L.y + L.h, y));
  const pc = [], pp = []; for (let i = 0; i <= 300; i++) { const nm = 100 * Math.pow(300, i / 300); pc.push([X(nm), cy(Y(rayleighM(nm, T)))]); pp.push([X(nm), cy(Y(planckM(nm, T)))]); }
  curve(ctx, pc, COL.red, 2.2); curve(ctx, pp, COL.orange, 3);
  text(ctx, t('lblRJ'), L.x + 4, L.y + 14, { size: 11, color: COL.red, bold: true }); text(ctx, t('lblPlanck'), L.x + L.w - 4, Y(planckM(5000, T)) - 8, { align: 'right', size: 11, color: COL.orange, bold: true });
  line(ctx, X(lam), L.y, X(lam), L.y + L.h, COL.cyan, 1.5, [4, 3]); text(ctx, t('axLogM'), L.x + L.w - 4, L.y + 14, { align: 'right', size: 10 });
  $('lam4v').textContent = lam + ' nm';
  const pm = planckM(lam, T), rj = rayleighM(lam, T), r = rj / pm; $('ro4').textContent = t('s4ro', { T: T, lam: lam, pm: sci(pm), rj: sci(rj), r: r >= 100 ? Math.round(r) : f2(r), hk: Math.round(H_ * C_ / (K_ * T) * 1e9) });
}
function render5() {
  $('lam5v').textContent = S.lam5 + ' nm';
  const { ctx, w, h } = setup($('cv5')), T = S.T5, lam = S.lam5, x = xOf(lam, T), L = { x: 40, y: 14, w: w - 56, h: h - 46 }, xmax = 6, X = v => L.x + v / xmax * L.w, ymax = 4, Y = v => L.y + L.h - Math.min(v, ymax) / ymax * L.h;
  axes(ctx, L); const pc = [], pq = []; for (let v = 0.05; v <= xmax; v += 0.05) { pc.push([X(v), Y(classicalOcc(v))]); pq.push([X(v), Y(occupation(v))]); }
  curve(ctx, pc, COL.red, 2.2); curve(ctx, pq, COL.orange, 3);
  text(ctx, t('lblClassic'), X(0.3), Y(3) , { size: 11, color: COL.red, bold: true }); text(ctx, t('lblQuantum'), X(3.2), Y(0.45) - 18, { size: 11, color: COL.orange, bold: true });
  const xc = Math.min(x, xmax); line(ctx, X(xc), L.y, X(xc), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(xc), Y(occupation(xc)), 6, COL.cyan);
  [0, 1, 2, 3, 4, 5, 6].forEach(v => text(ctx, v + '', X(v), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axX'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 });
  $('ro5').textContent = t('s5ro', { T: T, lam: lam, x: f2(x), q: sci(occupation(x)), c: sci(classicalOcc(x)), r: f2(occupation(x) / classicalOcc(x)), v: x > 1 ? t('vSuppress') : t('vClassical') });
}
function wire() {
  slider('T0', v => { S.T0 = v; render0(); }); slider('T1', v => { S.T1 = v; render1(); }); slider('T2', v => { S.T2 = v; render2(); });
  [['p310', 310], ['p2800', 2800], ['p5772', 5772], ['p9940', 9940]].forEach(([id, v]) => $(id).addEventListener('click', () => { S.T2 = v; $('T2').value = v; $('T2v').textContent = v; render2(); }));
  slider('T3', v => { S.T3 = v; render3(); }); slider('T4', v => { S.T4 = v; render4(); }); $('lam4').addEventListener('input', e => { S.lam4 = lamOf(+e.target.value); render4(); }); slider('T5', v => { S.T5 = v; render5(); }); $('lam5').addEventListener('input', e => { S.lam5 = lamOf(+e.target.value); render5(); });
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

if (typeof module !== 'undefined') module.exports = { WIEN_B, planckM, rayleighM, peakNm, totalPower, integratePlanck, argmaxPlanck, visibleShare, tempRGB, glow, region, occupation, classicalOcc, xOf };
