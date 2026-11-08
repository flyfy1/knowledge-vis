/* double-slit: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Model: Fraunhofer double slit, scalar waves. Lengths: wavelength in nm, slit separation d and width a in mm, screen distance L in m, screen position y in mm. Pure functions. */
const H_ = 6.62607015e-34, E_ = 1.602176634e-19, ME = 9.1093837015e-31, AMU = 1.66053906660e-27;
const sinc = x => (Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x);
const spacing = (lam, d, L) => lam * 1e-9 * L / (d * 1e-3) * 1e3;                      // fringe spacing in mm
const envZero = (lam, a, L) => lam * 1e-9 * L / (a * 1e-3) * 1e3;                      // first single-slit zero in mm
function intensity(y, p) { const beta = Math.PI * (p.d * 1e-3) * (y * 1e-3) / (p.lam * 1e-9 * p.L), alpha = Math.PI * (p.a * 1e-3) * (y * 1e-3) / (p.lam * 1e-9 * p.L);
  const env = Math.pow(sinc(alpha), 2); if (p.slit2 === false) return env;
  let fr = 0; const n = p.spread > 0 ? 9 : 1; for (let i = 0; i < n; i++) { const f = n === 1 ? 1 : 1 + p.spread * (i / (n - 1) - 0.5); fr += 0.5 * (1 + p.V * Math.cos(2 * beta / f)); } return env * fr / n; }
const visibility = D => Math.sqrt(Math.max(0, 1 - D * D));
function curveY(p, ymax, n) { const out = []; for (let i = 0; i <= n; i++) { const y = -ymax + 2 * ymax * i / n; out.push([y, intensity(y, p)]); } return out; }
function sampleHits(count, seed, p, ymax) { const R = rng(seed), c = curveY(p, ymax, 800), cdf = []; let s = 0; c.forEach(q => { s += q[1]; cdf.push(s); }); const hits = []; for (let k = 0; k < count; k++) { const u = R() * s; let lo = 0, hi = cdf.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] >= u) hi = m; else lo = m + 1; } hits.push(c[lo][0] + (R() - 0.5) * 2 * ymax / 800); } return hits; }
const deBroglie = (m, v) => H_ / (m * v);
const electronLambdaNm = volts => H_ / Math.sqrt(2 * ME * E_ * volts) * 1e9;
const OBJ = [['oElectron', ME, 1e6], ['oNeutron', 1.674927498e-27, 2200], ['oC60', 720 * AMU, 200], ['oBall', 0.15, 40]];
const fmtSci = v => v.toExponential(2);
const f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2);
const S = { lam0: 550, d0: 0.3, L0: 2, a1: 0.06, d1: 0.3, hits: [], seed: 1, D3: 0, obj4: 0, spd4: 0, slit5: true, D5: 0, spread5: 0 };
const PBASE = { lam: 550, d: 0.3, a: 0.06, L: 2, V: 1, spread: 0, slit2: true };
const P2 = Object.assign({}, PBASE), Y2 = 30;
function drawPattern(ctx, L, c, ymax, col, fillStrip) { const X = y => L.x + (y + ymax) / (2 * ymax) * L.w, Y = v => L.y + L.h - v * L.h; axes(ctx, L); curve(ctx, c.map(q => [X(q[0]), Y(q[1])]), col, 2.5); return { X, Y }; }
function strip(ctx, L, c, ymax, y0, hgt) { const n = c.length, bw = L.w / (n - 1); c.forEach((q, i) => { const g = Math.max(0, Math.min(1, q[1])); ctx.fillStyle = 'rgb(' + Math.round(15 + g * 230) + ',' + Math.round(22 + g * 220) + ',' + Math.round(34 + g * 150) + ')'; ctx.fillRect(L.x + i * bw - 0.5, y0, bw + 1, hgt); }); }
function ticks(ctx, L, ymax, X) { [-ymax, -ymax / 2, 0, ymax / 2, ymax].forEach(y => text(ctx, Math.round(y) + '', X(y), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('axY'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); }
function render0() {
  const { ctx, w, h } = setup($('cv0')), p = Object.assign({}, PBASE, { lam: S.lam0, d: S.d0, L: S.L0, a: 0.001 }), sp = spacing(p.lam, p.d, p.L), ymax = 15, L = { x: 16, y: 12, w: w - 32, h: h * 0.52 }, c = curveY(p, ymax, 600);
  const F = drawPattern(ctx, L, c, ymax, COL.orange); strip(ctx, L, c, ymax, L.y + L.h + 34, h * 0.14); ticks(ctx, L, ymax, F.X);
  for (let m = -3; m <= 3; m++) { const y = m * sp; if (Math.abs(y) < ymax) dot(ctx, F.X(y), F.Y(1), 3, COL.cyan); } if (sp < ymax) { line(ctx, F.X(0), L.y + 6, F.X(sp), L.y + 6, COL.cyan, 2); text(ctx, t('lblSpacing', { s: f2(sp) }), F.X(sp / 2), L.y + 22, { align: 'center', size: 11, color: COL.cyan }); }
  $('d0v').textContent = S.d0.toFixed(1); $('L0v').textContent = S.L0.toFixed(1);
  $('ro0').textContent = t('s0ro', { lam: S.lam0, d: S.d0, L: S.L0, s: f2(sp) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), p = Object.assign({}, PBASE, { a: S.a1, d: S.d1 }), z = envZero(p.lam, p.a, p.L), ymax = 30, L = { x: 16, y: 12, w: w - 32, h: h * 0.52 }, c = curveY(p, ymax, 800), c1 = curveY(Object.assign({}, p, { slit2: false }), ymax, 400);
  const F = drawPattern(ctx, L, c, ymax, COL.orange); curve(ctx, c1.map(q => [F.X(q[0]), F.Y(q[1])]), COL.cyan, 1.5); strip(ctx, L, c, ymax, L.y + L.h + 34, h * 0.14); ticks(ctx, L, ymax, F.X);
  [-1, 1].forEach(s => { if (Math.abs(z) < ymax) { line(ctx, F.X(s * z), L.y, F.X(s * z), L.y + L.h, COL.red, 1, [4, 3]); } }); text(ctx, t('lblEnv'), L.x + 4, L.y + 12, { size: 11, color: COL.cyan });
  $('a1v').textContent = Math.round(S.a1 * 1000); $('d1v').textContent = S.d1.toFixed(1); $('ro1').textContent = t('s1ro', { a: S.a1, d: S.d1, z: f1(z), sp: f2(spacing(p.lam, p.d, p.L)), n: Math.max(1, Math.floor(z / spacing(p.lam, p.d, p.L)) * 2 + 1), ratio: f1(p.d / p.a) });
}
function fire(n) { const p = Object.assign({}, PBASE, { a: 0.03, d: 0.3 }); S.hits = S.hits.concat(sampleHits(n, S.seed, p, 30)); S.seed += 1; }
function render2() {
  const { ctx, w, h } = setup($('cv2')), p = Object.assign({}, PBASE, { a: 0.03, d: 0.3 }), ymax = 30, L = { x: 16, y: 12, w: w - 32, h: h * 0.62 }, nb = 90, bins = new Array(nb).fill(0);
  S.hits.forEach(y => { const b = Math.floor((y + ymax) / (2 * ymax) * nb); if (b >= 0 && b < nb) bins[b]++; }); const mx = Math.max(1, Math.max.apply(null, bins)), bw = L.w / nb; axes(ctx, L);
  const c = curveY(p, ymax, 600), F = { X: y => L.x + (y + ymax) / (2 * ymax) * L.w };
  bins.forEach((v, i) => { const hh = v / mx * L.h * 0.92; ctx.fillStyle = COL.cyan; ctx.fillRect(L.x + i * bw + 0.5, L.y + L.h - hh, Math.max(1, bw - 1), hh); }); const scale = S.hits.length ? L.h * 0.92 : L.h; curve(ctx, c.map(q => [F.X(q[0]), L.y + L.h - q[1] * scale]), COL.orange, 2);
  const px = L.x; S.hits.slice(-40).forEach((y, i) => dot(ctx, F.X(y), L.y + L.h + 18 + (i % 4) * 5, 2, COL.orange)); ticks(ctx, L, ymax, F.X);
  const sp = spacing(p.lam, p.d, p.L); let dark = 0; S.hits.forEach(y => { if (intensity(y, p) < 0.05) dark++; }); $('ro2').textContent = S.hits.length ? t('s2ro', { n: S.hits.length, dark: dark, pct: f1(dark / S.hits.length * 100) }) : t('s2ro0');
}
function render3() {
  $('D3v').textContent = Math.round(S.D3 * 100) + '%';
  const { ctx, w, h } = setup($('cv3')), D = S.D3, V = visibility(D), p = Object.assign({}, PBASE, { a: 0.05, d: 0.3, V: V }), ymax = 20, L = { x: 16, y: 12, w: w - 32, h: h * 0.52 }, c = curveY(p, ymax, 700);
  const F = drawPattern(ctx, L, c, ymax, COL.orange); strip(ctx, L, c, ymax, L.y + L.h + 34, h * 0.14); ticks(ctx, L, ymax, F.X);
  const bx = w / 2; ctx.strokeStyle = D > 0.02 ? COL.red : COL.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, h - 14, 8, 0, 6.2832); ctx.stroke(); text(ctx, t(D > 0.02 ? 'lblDetOn' : 'lblDetOff'), bx + 14, h - 10, { size: 11 });
  $('ro3').textContent = t('s3ro', { D: f2(D), V: f2(V), sum: f2(D * D + V * V), kind: D > 0.98 ? t('kNone') : D < 0.02 ? t('kFull') : t('kPart') });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), o = OBJ[S.obj4], v = o[2] * Math.pow(10, S.spd4 / 10), lam = deBroglie(o[1], v), L = { x: 14, y: 14, w: w - 28, h: h - 40 };
  const items = OBJ.map(q => [q[0], deBroglie(q[1], q[2])]), lo = -36, hi = -5, X = l => L.x + (Math.log10(l) - lo) / (hi - lo) * L.w; axes(ctx, L);
  items.forEach(([k, l], i) => { const y = L.y + 10 + i * (L.h / 4.4); ctx.fillStyle = i === S.obj4 ? COL.orange : '#2b6a85'; ctx.fillRect(L.x, y, Math.max(2, X(l) - L.x), L.h / 4.4 - 14); text(ctx, t(k) + '  λ = ' + fmtSci(l) + ' m', L.x + 6, y + L.h / 8.8 + 1, { size: 11, color: COL.ink }); });
  const dpos = X(1e-7); line(ctx, dpos, L.y, dpos, L.y + L.h, COL.cyan, 1.5, [4, 3]); text(ctx, t('lblSlit'), dpos - 4, L.y + L.h + 14, { align: 'right', size: 10, color: COL.cyan });
  const sp = lam * 1 / 1e-7; $('spd4v').textContent = '×' + Math.pow(10, S.spd4 / 10).toFixed(1); OBJ.forEach((q, i) => { const b = $('ob' + i); b.classList.toggle('active', i === S.obj4); b.setAttribute('aria-pressed', i === S.obj4 ? 'true' : 'false'); });
  $('ro4').textContent = t('s4ro', { name: t(o[0]), v: fmtSci(v), lam: fmtSci(lam), sp: fmtSci(sp), see: sp > 1e-6 ? t('canSee') : t('cannotSee') });
}
function render5() {
  $('D5v').textContent = Math.round(S.D5 * 100) + '%'; $('sp5v').textContent = S.spread5 + '%';
  const { ctx, w, h } = setup($('cv5')), p = Object.assign({}, PBASE, { a: 0.05, d: 0.3, V: visibility(S.D5), spread: S.spread5 / 100, slit2: S.slit5 }), ymax = 20, L = { x: 16, y: 12, w: w - 32, h: h * 0.52 }, c = curveY(p, ymax, 700);
  const F = drawPattern(ctx, L, c, ymax, COL.orange); strip(ctx, L, c, ymax, L.y + L.h + 34, h * 0.14); ticks(ctx, L, ymax, F.X); $('slit5').textContent = t(S.slit5 ? 'slit2Open' : 'slit2Closed'); $('slit5').setAttribute('aria-pressed', S.slit5 ? 'true' : 'false');
  const sp = spacing(p.lam, p.d, p.L); let mx = 0, mn = Infinity; for (let i = 0; i <= 100; i++) { const y = sp * i / 100; const q = intensity(y, Object.assign({}, p, { a: 1e-6 })); mx = Math.max(mx, q); mn = Math.min(mn, q); } const Vm = S.slit5 ? (mx - mn) / (mx + mn) : 0;
  const first = S.slit5 ? intensity(sp * 6, Object.assign({}, p, { a: 1e-6 })) : 0;
  $('ro5').textContent = t('s5ro', { slit: t(S.slit5 ? 'slit2Open' : 'slit2Closed'), D: f2(S.D5), sp: S.spread5, V: f2(Vm), kind: Vm > 0.7 ? t('kClear') : Vm > 0.15 ? t('kFaint') : t('kGone') });
}
function wire() {
  slider('lam0', v => { S.lam0 = v; render0(); }); slider10('d0', v => { S.d0 = v; render0(); }); slider10('L0', v => { S.L0 = v; render0(); });
  $('a1').addEventListener('input', e => { S.a1 = +e.target.value / 1000; render1(); }); slider10('d1', v => { S.d1 = v; render1(); });
  [1, 10, 100, 1000].forEach(n => $('f' + n).addEventListener('click', () => { fire(n); render2(); })); $('rs2').addEventListener('click', () => { S.hits = []; S.seed = 1; render2(); });
  $('D3').addEventListener('input', e => { S.D3 = +e.target.value / 100; render3(); }); OBJ.forEach((q, i) => $('ob' + i).addEventListener('click', () => { S.obj4 = i; render4(); })); $('spd4').addEventListener('input', e => { S.spd4 = +e.target.value; render4(); });
  $('slit5').addEventListener('click', () => { S.slit5 = !S.slit5; render5(); }); $('D5').addEventListener('input', e => { S.D5 = +e.target.value / 100; render5(); }); slider('sp5', v => { S.spread5 = v; render5(); });
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

if (typeof module !== 'undefined') module.exports = { spacing, envZero, intensity, visibility, curveY, sampleHits, deBroglie, electronLambdaNm, OBJ };
