/* newton-method: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const FN = {
  sq: { f: x => x * x - 2, df: x => 2 * x, xr: [-0.5, 3.6], yr: [-3, 8], hint: 1.5, name: 'x² − 2' },
  cosx: { f: x => Math.cos(x) - x, df: x => -Math.sin(x) - 1, xr: [-1, 3], yr: [-3, 2], hint: 0.7, name: 'cos x − x' },
  ex: { f: x => Math.exp(x) - 3, df: x => Math.exp(x), xr: [-1, 3], yr: [-4, 14], hint: 1, name: 'eˣ − 3' },
  cub: { f: x => x * x * x - 2 * x + 2, df: x => 3 * x * x - 2, xr: [-2.6, 2.6], yr: [-8, 9], hint: -1.7, name: 'x³ − 2x + 2' },
  tri: { f: x => x * x * x - x, df: x => 3 * x * x - 1, xr: [-2, 2], yr: [-3, 3], hint: 1, name: 'x³ − x' }
};
const stepN = (F, x) => { const d = F.df(x); return d === 0 ? NaN : x - F.f(x) / d; };
function orbit(F, x0, n) { const o = [x0]; for (let k = 0; k < n; k++) { const x = stepN(F, o[o.length - 1]); if (!isFinite(x) || Math.abs(x) > 1e8) { o.push(NaN); break; } o.push(x); if (Math.abs(x - o[o.length - 2]) < 1e-15) break; } return o; }
function rootOf(F) { let x = F.hint; for (let k = 0; k < 80; k++) { const y = stepN(F, x); if (!isFinite(y)) break; x = y; } return x; }
const digits = e => e <= 1e-15 ? 15 : Math.min(15, -Math.log10(e));
function bisect(F, lo, hi, n) { const out = []; for (let k = 0; k < n; k++) { const mid = (lo + hi) / 2; out.push(mid); if (F.f(lo) * F.f(mid) <= 0) hi = mid; else lo = mid; } return out; }
/* Classify what Newton's method does from x0: converged to a real root, trapped in a cycle, hit a flat tangent, or ran away. */
function classify(F, x0, roots) { const o = orbit(F, x0, 60), last = o[o.length - 1]; if (isNaN(last)) return { kind: 'flat', o }; const hit = roots.findIndex(r => Math.abs(last - r) < 1e-9); if (hit >= 0) return { kind: 'root', root: hit, o };
  const n = o.length; if (n >= 4 && Math.abs(o[n - 1] - o[n - 3]) < 1e-9) return { kind: 'cycle', o }; return { kind: 'lost', o }; }
const ROOTS = { cub: [rootOf(FN.cub)], tri: [-1, 0, 1] };
const f2 = v => String(Math.round(v * 100) / 100), g6 = v => v.toPrecision(7).replace(/\.?0+$/, ''), eFmt = v => v === 0 ? '0' : v.toExponential(1);
const S = { x0: 3, fn: 'sq', orb: [3], s1: 3, run: 0, x2: 3, x3: 0, x4: 0.3, a5: 10, tx: 2, basins: null };
function plot(ctx, R, F, xr, yr) { const X = x => R.x + (x - xr[0]) / (xr[1] - xr[0]) * R.w, Y = y => R.y + R.h - (y - yr[0]) / (yr[1] - yr[0]) * R.h; ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
  if (yr[0] < 0 && yr[1] > 0) line(ctx, R.x, Y(0), R.x + R.w, Y(0), COL.muted, 1.5); if (xr[0] < 0 && xr[1] > 0) line(ctx, X(0), R.y, X(0), R.y + R.h, COL.grid, 1);
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); let pen = false; for (let i = 0; i <= 240; i++) { const x = xr[0] + (xr[1] - xr[0]) * i / 240, y = F.f(x); if (!isFinite(y)) { pen = false; continue; } pen ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); pen = true; } ctx.stroke(); ctx.restore(); ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); return { X, Y }; }
/* One tangent hop: vertical drop to the curve, tangent line down to the x-axis. */
function hop(ctx, M, F, x, col, R) { const y = F.f(x), d = F.df(x), nx = stepN(F, x); ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip(); line(ctx, M.X(x), M.Y(0), M.X(x), M.Y(y), col, 1.5, [4, 3]); if (isFinite(nx)) line(ctx, M.X(x), M.Y(y), M.X(nx), M.Y(0), col, 2); else line(ctx, R.x, M.Y(y), R.x + R.w, M.Y(y), col, 2); ctx.restore(); dot(ctx, M.X(x), M.Y(y), 4, col); dot(ctx, M.X(x), M.Y(0), 3.5, COL.ink); }
const area = (w, h) => ({ x: 14, y: 14, w: w - 28, h: h - 40 });
function render0() { const { ctx, w, h } = setup($('cv0')), F = FN.sq, R = area(w, h), M = plot(ctx, R, F, F.xr, F.yr), x0 = S.x0, nx = stepN(F, x0), r = Math.SQRT2;
  hop(ctx, M, F, x0, COL.orange, R); dot(ctx, M.X(nx), M.Y(0), 6, COL.green); dot(ctx, M.X(r), M.Y(0), 5, COL.violet); text(ctx, t('trueRoot'), M.X(r), M.Y(0) + 20, { align: 'center', size: 11, color: COL.violet }); text(ctx, t('x1Label'), M.X(nx), M.Y(0) - 12, { align: 'center', size: 11, color: COL.green }); text(ctx, t('x0Label'), M.X(x0), M.Y(0) + 20, { align: 'center', size: 11, color: COL.orange });
  text(ctx, 'y = ' + F.name, R.x + 8, R.y + 16, { size: 12, color: COL.cyan }); $('x0v').textContent = x0;
  $('ro0').textContent = t('s0ro', { x0, f: f2(F.f(x0)), d: f2(F.df(x0)), x1: g6(nx), e0: eFmt(Math.abs(x0 - r)), e1: eFmt(Math.abs(nx - r)) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), F = FN[S.fn], R = area(w, h), M = plot(ctx, R, F, F.xr, F.yr), o = S.orb, r = rootOf(F);
  o.slice(0, -1).forEach((x, k) => hop(ctx, M, F, x, k === o.length - 2 ? COL.orange : COL.muted, R)); dot(ctx, M.X(o[o.length - 1]), M.Y(0), 6, COL.green); dot(ctx, M.X(r), M.Y(0), 4, COL.violet);
  text(ctx, 'y = ' + F.name, R.x + 8, R.y + 16, { size: 12, color: COL.cyan }); text(ctx, t('iterCount', { n: o.length - 1 }), R.x + R.w - 8, R.y + 16, { align: 'right', size: 12, color: COL.orange });
  ['sq', 'cosx', 'ex'].forEach(k => $('fn' + k).classList.toggle('active', S.fn === k)); $('x1v').textContent = S.s1;
  const n = o.length - 1, e = Math.abs(o[n] - r); $('ro1').textContent = t('s1ro', { n, x: g6(o[n]), e: eFmt(e), dg: f2(digits(e)), r: g6(r) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), F = FN.sq, r = Math.SQRT2, N = 8, o = orbit(F, S.x2, N), b = bisect(F, 1, 2, N + 1), R = { x: 40, y: 18, w: w - 56, h: h - 56 }, bw = R.w / (N + 1) / 2.4; $('x2v').textContent = S.x2;
  line(ctx, R.x, R.y + R.h, R.x + R.w, R.y + R.h, COL.grid, 1); for (let dg = 0; dg <= 15; dg += 5) { const y = R.y + R.h - dg / 15 * R.h; line(ctx, R.x, y, R.x + R.w, y, COL.grid, 1); text(ctx, String(dg), R.x - 6, y + 4, { align: 'right', size: 10 }); }
  text(ctx, t('digitsAxis'), 4, 12, { size: 11 }); const dN = [], dB = [];
  for (let k = 0; k <= N; k++) { const xN = k < o.length ? o[k] : o[o.length - 1], dn = digits(Math.abs(xN - r)), db = k === 0 ? digits(Math.abs(1.5 - r)) : digits(Math.abs(b[k - 1] - r)); dN.push(dn); dB.push(db); const x = R.x + (k + 0.5) / (N + 1) * R.w;
    ctx.fillStyle = COL.orange; ctx.fillRect(x - bw, R.y + R.h - dn / 15 * R.h, bw, dn / 15 * R.h); ctx.fillStyle = COL.violet; ctx.fillRect(x, R.y + R.h - db / 15 * R.h, bw, db / 15 * R.h); text(ctx, String(k), x, R.y + R.h + 14, { align: 'center', size: 10 }); }
  text(ctx, t('stepAxis'), R.x + R.w, R.y + R.h + 30, { align: 'right', size: 11 }); text(ctx, t('legNewton'), R.x + 8, R.y + 12, { size: 12, color: COL.orange }); text(ctx, t('legBisect'), R.x + 8, R.y + 28, { size: 12, color: COL.violet });
  $('ro2').textContent = t('s2ro', { x0: S.x2, d1: f2(dN[1]), d2: f2(dN[2]), d3: f2(dN[3]), d4: f2(dN[4]), b4: f2(dB[4]) }); }
const KIND = { root: 'kRoot', cycle: 'kCycle', flat: 'kFlat', lost: 'kLost' };
function render3() { const { ctx, w, h } = setup($('cv3')), F = FN.cub, R = area(w, h), M = plot(ctx, R, F, F.xr, F.yr), c = classify(F, S.x3, ROOTS.cub), o = c.o.slice(0, 9);
  o.slice(0, -1).forEach((x, k) => { if (isFinite(x)) hop(ctx, M, F, x, k === 0 ? COL.orange : k < 4 ? COL.red : COL.muted, R); }); dot(ctx, M.X(ROOTS.cub[0]), M.Y(0), 5, COL.violet);
  text(ctx, 'y = ' + F.name, R.x + 8, R.y + 16, { size: 12, color: COL.cyan }); text(ctx, t(KIND[c.kind]), R.x + R.w - 8, R.y + 16, { align: 'right', size: 13, color: c.kind === 'root' ? COL.green : COL.red, bold: true }); $('x3v').textContent = S.x3;
  $('ro3').textContent = t('s3ro', { x0: S.x3, seq: c.o.slice(0, 7).map(v => isNaN(v) ? '—' : f2(v)).join(' → '), kind: t(KIND[c.kind]), fd: f2(F.df(S.x3)) }); }
function basinStrip(n) { const F = FN.tri, out = []; for (let i = 0; i < n; i++) { const x0 = -2 + 4 * (i + 0.5) / n, c = classify(F, x0, ROOTS.tri); out.push(c.kind === 'root' ? c.root : -1); } return out; }
const BCOL = ['#b79cff', '#f6a45b', '#67d7f9'];
function render4() { const { ctx, w, h } = setup($('cv4')), F = FN.tri, R = { x: 14, y: 14, w: w - 28, h: h * 0.52 }, sx = x => R.x + (x + 2) / 4 * R.w, M = plot(ctx, R, F, F.xr, F.yr), st = { x: R.x, y: R.y + R.h + 14, w: R.w, h: 26 }, n = Math.floor(R.w), bs = basinStrip(n);
  for (let i = 0; i < n; i++) { ctx.fillStyle = bs[i] < 0 ? COL.dim : BCOL[bs[i]]; ctx.fillRect(st.x + i * R.w / n, st.y, R.w / n + 1, st.h); }
  [-1, 0, 1].forEach((r, k) => { dot(ctx, M.X(r), M.Y(0), 5, BCOL[k]); }); const c = classify(F, S.x4, ROOTS.tri); c.o.slice(0, 8).slice(0, -1).forEach((x, k) => { if (isFinite(x)) hop(ctx, M, F, x, k === 0 ? COL.ink : COL.muted, R); });
  line(ctx, sx(S.x4), st.y - 4, sx(S.x4), st.y + st.h + 4, COL.ink, 3); text(ctx, t('basinAxis'), st.x, st.y + st.h + 18, { size: 11 }); text(ctx, 'y = ' + F.name, R.x + 8, R.y + 16, { size: 12, color: COL.cyan }); $('x4v').textContent = S.x4;
  const names = ['−1', '0', '1']; $('ro4').textContent = c.kind === 'root' ? t('s4ro', { x0: S.x4, r: names[c.root], n: c.o.length - 1 }) : t('s4roNo', { x0: S.x4, kind: t(KIND[c.kind]) }); }
function sqrtRuns(a) { const F = { f: x => x * x - a, df: x => 2 * x }, r = Math.sqrt(a), nw = orbit(F, a, 40), bi = bisect(F, 0, Math.max(a, 1), 60), eN = nw.map(x => Math.abs(x - r)), eB = bi.map(x => Math.abs(x - r)); const first = (arr, tol) => { const i = arr.findIndex(e => e < tol); return i < 0 ? -1 : i; }; return { eN, eB, nN: first(eN, 1e-10), nB: first(eB, 1e-10) + 1 }; }
function render5() { const { ctx, w, h } = setup($('cv5')), a = S.a5, d = sqrtRuns(a), R = { x: 44, y: 16, w: w - 60, h: h - 56 }, K = 30, X = k => R.x + k / K * R.w, Y = e => R.y + R.h - Math.max(0, Math.min(1, (Math.log10(Math.max(e, 1e-16)) + 16) / 18)) * R.h;
  for (let p = -16; p <= 2; p += 4) { line(ctx, R.x, Y(Math.pow(10, p)), R.x + R.w, Y(Math.pow(10, p)), COL.grid, 1); text(ctx, '1e' + p, R.x - 4, Y(Math.pow(10, p)) + 4, { align: 'right', size: 10 }); }
  line(ctx, R.x, Y(1e-10), R.x + R.w, Y(1e-10), COL.green, 1.5, [5, 4]); const drawS = (arr, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); arr.slice(0, K + 1).forEach((e, k) => k ? ctx.lineTo(X(k), Y(e)) : ctx.moveTo(X(k), Y(e))); ctx.stroke(); arr.slice(0, K + 1).forEach((e, k) => dot(ctx, X(k), Y(e), 3, col)); };
  drawS(d.eB, COL.violet); drawS(d.eN, COL.orange); text(ctx, t('stepAxis'), R.x + R.w, R.y + R.h + 22, { align: 'right', size: 11 }); text(ctx, t('errAxis'), 4, 12, { size: 11 }); text(ctx, t('legNewton'), R.x + 8, R.y + 14, { size: 12, color: COL.orange }); text(ctx, t('legBisect'), R.x + 8, R.y + 30, { size: 12, color: COL.violet }); text(ctx, t('tolLine'), R.x + R.w - 4, Y(1e-10) - 5, { align: 'right', size: 10, color: COL.green }); $('a5v').textContent = a;
  $('ro5').textContent = t('s5ro', { a, r: g6(Math.sqrt(a)), nN: d.nN, nB: d.nB }); }
let timer = 0;
function stopRun() { clearTimeout(timer); timer = 0; S.run = 0; $('run1').textContent = t('run'); }
function stepOnce() { const F = FN[S.fn], x = stepN(F, S.orb[S.orb.length - 1]); if (isFinite(x)) S.orb.push(x); }
function resetOrbit() { stopRun(); S.orb = [S.s1]; render1(); }
function onHide() { stopRun(); }
function wire() {
  slider('x0', v => { S.x0 = v; render0(); }); slider('x1', v => { S.s1 = v; resetOrbit(); }); slider('x2', v => { S.x2 = v; render2(); }); slider('x3', v => { S.x3 = v; render3(); }); slider('x4', v => { S.x4 = v; render4(); }); slider('a5', v => { S.a5 = v; render5(); });
  ['sq', 'cosx', 'ex'].forEach(k => $('fn' + k).addEventListener('click', () => { S.fn = k; const F = FN[k]; S.s1 = k === 'sq' ? 3 : 2.5; $('x1').value = S.s1; resetOrbit(); }));
  $('st1').addEventListener('click', () => { stopRun(); stepOnce(); render1(); }); $('rs1').addEventListener('click', () => { S.s1 = +$('x1').value; resetOrbit(); });
  $('run1').addEventListener('click', () => { if (S.run) { stopRun(); render1(); return; } S.run = 1; $('run1').textContent = t('pause'); const tick = () => { if (!S.run) return; stepOnce(); render1(); const o = S.orb; if (o.length > 12 || Math.abs(o[o.length - 1] - o[o.length - 2]) < 1e-14) { stopRun(); render1(); return; } timer = setTimeout(tick, reduceMotion() ? 0 : 700); }; tick(); });
  [['p0', 0], ['p1', -2], ['p2', 0.8165], ['p3', 1.5]].forEach(([id, v]) => $(id).addEventListener('click', () => { S.x3 = v; $('x3').value = v; render3(); }));
  [['q0', 0.3], ['q1', 0.5], ['q2', 0.58], ['q3', 1.4]].forEach(([id, v]) => $(id).addEventListener('click', () => { S.x4 = v; $('x4').value = v; render4(); }));
  window.addEventListener('langchange', () => { $('run1').textContent = t(S.run ? 'pause' : 'run'); });
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
if (typeof module !== 'undefined') module.exports = { FN, stepN, orbit, rootOf, digits, bisect, classify, ROOTS, basinStrip, sqrtRuns };
