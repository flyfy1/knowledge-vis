/* probability-frequency: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const spinResult = (th, r, b) => th < r * 360 ? 'cRed' : th < (r + b) * 360 ? 'cBlue' : 'cGreen';
const runCount = (rand, n, p) => { let c = 0; for (let i = 0; i < n; i++) if (rand() < p) c++; return c; };
/* Sequences of fair tosses: among those that start with k heads, how many have heads on toss k+1. */
function streakNext(rand, N, k, p) { let sn = 0, nh = 0, heads = 0; for (let s = 0; s < N; s++) { let ok = true; for (let i = 0; i < k; i++) { const h = rand() < p; if (h) heads++; if (!h) ok = false; } const nx = rand() < p; if (nx) heads++; if (ok) { sn++; if (nx) nh++; } } return { streaks: sn, nextHeads: nh, allHeads: heads / (N * (k + 1)) }; }
const band95 = (p, n) => { const se = Math.sqrt(p * (1 - p) / n); return { lo: p - 1.96 * se, hi: p + 1.96 * se, se }; };
const rand = mulberry32(20261030);
const pct = v => String(Math.round(v * 1000) / 10);
const S = { n0: 0, th0: null, c0: '', n1: 0, r1: 0, hist1: [], rows: { 10: [], 100: [], 1000: [] }, sel2: 100, st4: null, runs5: [] };
function wheel(ctx, cx, cy, R, r, b, th) { const sec = (a0, a1, col) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, -Math.PI / 2 + a0 * Math.PI / 180, -Math.PI / 2 + a1 * Math.PI / 180); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 2; ctx.stroke(); };
  sec(0, r * 360, '#d9645a'); sec(r * 360, (r + b) * 360, '#5a8fd9'); sec((r + b) * 360, 360, '#5ab87a'); if (th !== null && th !== undefined) { const a = -Math.PI / 2 + th * Math.PI / 180; line(ctx, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, COL.ink, 4); dot(ctx, cx, cy, 6, COL.ink); } ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(cx, cy - R - 4); ctx.lineTo(cx - 6, cy - R - 14); ctx.lineTo(cx + 6, cy - R - 14); ctx.fill(); }
function render0() { const { ctx, w, h } = setup($('cv0')), p = +$('p0').value; $('p0v').textContent = p; const R = Math.min(w, h) * 0.38; wheel(ctx, w / 2, h / 2 + 6, R, p / 100, 0.35 * (1 - p / 100), S.th0);
  $('ro0').textContent = S.th0 === null ? t('s0roIdle', { p, a: Math.round(p * 3.6) }) : t('s0ro', { p, a: Math.round(p * 3.6), th: Math.round(S.th0), c: t(S.c0), n: S.n0 }); }
function render1() { const { ctx, w, h } = setup($('cv1')), p = 0.3, L = { x: 40, y: 12, w: w - 56, h: h - 40 }, nmax = Math.max(20, S.n1), X = n => L.x + n / nmax * L.w, Y = f => L.y + L.h - f * L.h; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 0.5, 1].forEach(v => text(ctx, Math.round(v * 100) + '%', L.x - 4, Y(v) + 4, { align: 'right', size: 10 })); [0, nmax].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 }));
  line(ctx, L.x, Y(p), L.x + L.w, Y(p), COL.orange, 2, [6, 4]); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); S.hist1.forEach((f, i) => i ? ctx.lineTo(X(i + 1), Y(f)) : ctx.moveTo(X(1), Y(f))); ctx.stroke(); if (S.n1) dot(ctx, X(S.n1), Y(S.r1 / S.n1), 5, COL.green);
  ['s1a', 's1b', 's1c', 's1d'].forEach((id, i) => { $(id).disabled = S.n1 + [1, 10, 100, 500][i] > 5000; }); $('ro1').textContent = S.n1 ? t('s1ro', { n: S.n1, r: S.r1, f: pct(S.r1 / S.n1), p: 30, d: Math.abs(Math.round((S.r1 / S.n1 - p) * 1000) / 10) }) : t('s1roIdle', { p: 30 }); }
function spinMany(k) { for (let i = 0; i < k; i++) { S.n1++; if (rand() < 0.3) S.r1++; S.hist1.push(S.r1 / S.n1); } render1(); }
function render2() { const { ctx, w, h } = setup($('cv2')), L = { x: 30, y: 8, w: w - 46, h: h - 34 }, X = f => L.x + f * L.w, rowH = L.h / 3, ns = [10, 100, 1000]; [10, 100, 1000].forEach(n => { const b = $('e' + n); b.classList.toggle('active', n === S.sel2); b.setAttribute('aria-pressed', n === S.sel2 ? 'true' : 'false'); });
  line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 0.3, 0.5, 1].forEach(v => { text(ctx, Math.round(v * 100) + '%', X(v), L.y + L.h + 14, { align: 'center', size: 10, color: v === 0.3 ? COL.orange : COL.muted }); }); line(ctx, X(0.3), L.y, X(0.3), L.y + L.h, COL.orange, 1.5, [5, 4]);
  ns.forEach((n, i) => { const y0 = L.y + (i + 1) * rowH - 6; text(ctx, 'n=' + n, 4, y0 - rowH / 2 + 4, { size: 10, color: COL.ink }); S.rows[n].forEach((f, j) => dot(ctx, X(f), y0 - 6 - (j % 7) * 5, 3.5, n === S.sel2 ? COL.cyan : 'rgba(103,215,249,0.55)')); line(ctx, L.x, y0 + 2, L.x + L.w, y0 + 2, '#16222e', 1); });
  const rr = S.rows[S.sel2]; if (!rr.length) { $('ro2').textContent = t('s2roIdle'); return; } const lo = Math.min.apply(null, rr), hi = Math.max.apply(null, rr); $('ro2').textContent = t('s2ro', { n: S.sel2, m: rr.length, lo: pct(lo), hi: pct(hi), rg: pct(hi - lo), se: pct(band95(0.3, S.sel2).se) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), r = +$('r3').value; const bEl = $('b3'); bEl.max = 100 - r; if (+bEl.value > 100 - r) bEl.value = 100 - r; const b = +bEl.value; $('r3v').textContent = r; $('b3v').textContent = b; const g = 100 - r - b; wheel(ctx, w / 2, h / 2 + 6, Math.min(w, h) * 0.38, r / 100, b / 100, null);
  $('ro3').textContent = t('s3ro', { r, b, g, s: r + b + g, nr: 100 - r, nr2: b + g }); }
function render4() { const { ctx, w, h } = setup($('cv4')), k = +$('k4').value; $('k4v').textContent = k; const r = S.st4, L = { x: 20, y: 14, w: w - 40, h: h - 40 }, bw = L.w / 2; const vals = r ? [r.nextHeads / Math.max(1, r.streaks), r.allHeads] : [0, 0];
  line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h * 0.5, L.x + L.w, L.y + L.h * 0.5, COL.orange, 1.5, [5, 4]); text(ctx, '50%', L.x + L.w, L.y + L.h * 0.5 - 4, { align: 'right', size: 10, color: COL.orange }); [[vals[0], COL.cyan], [vals[1], COL.green]].forEach(([v, col], i) => { const hh = v * L.h; ctx.fillStyle = col; ctx.fillRect(L.x + i * bw + 20, L.y + L.h - hh, bw - 40, hh); if (r) text(ctx, pct(v) + '%', L.x + i * bw + bw / 2, L.y + L.h - hh - 5, { align: 'center', size: 13, color: COL.ink, bold: true }); });
  $('ro4').textContent = r ? t('s4ro', { k: r.k, sn: r.streaks, f: pct(r.nextHeads / Math.max(1, r.streaks)), all: pct(r.allHeads) }) : t('s4roIdle'); }
function render5() { const { ctx, w, h } = setup($('cv5')), p = +$('p5').value / 100, n = +$('n5').value; $('p5v').textContent = Math.round(p * 100); $('n5v').textContent = n; const bd = band95(p, n), L = { x: 20, y: 10, w: w - 40, h: h - 36 }, X = f => L.x + f * L.w;
  ctx.fillStyle = 'rgba(246,164,91,0.25)'; ctx.fillRect(X(Math.max(0, bd.lo)), L.y, X(Math.min(1, bd.hi)) - X(Math.max(0, bd.lo)), L.h); line(ctx, X(p), L.y, X(p), L.y + L.h, COL.orange, 2); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 0.5, 1].forEach(v => text(ctx, Math.round(v * 100) + '%', X(v), L.y + L.h + 14, { align: 'center', size: 10 }));
  S.runs5.forEach((f, j) => dot(ctx, X(f.f), L.y + L.h - 8 - (j % 12) * 8, 3.5, f.f >= bd.lo && f.f <= bd.hi ? COL.green : COL.red)); const inn = S.runs5.filter(f => f.f >= bd.lo && f.f <= bd.hi).length;
  $('ro5').textContent = S.runs5.length ? t('s5ro', { lo: pct(Math.max(0, bd.lo)), hi: pct(Math.min(1, bd.hi)), m: S.runs5.length, in: inn, pct: pct(inn / S.runs5.length) }) : t('s5roIdle', { lo: pct(Math.max(0, bd.lo)), hi: pct(Math.min(1, bd.hi)) }); }
function run5(k) { const p = +$('p5').value / 100, n = +$('n5').value; for (let i = 0; i < k && S.runs5.length < 200; i++) S.runs5.push({ f: runCount(rand, n, p) / n }); render5(); }
function wire() {
  slider('p0', () => { S.th0 = null; S.n0 = 0; render0(); }); $('spin0').addEventListener('click', () => { const p = +$('p0').value / 100, th = rand() * 360; S.th0 = th; S.n0++; S.c0 = spinResult(th, p, 0.35 * (1 - p)); render0(); });
  [['s1a', 1], ['s1b', 10], ['s1c', 100], ['s1d', 500]].forEach(([id, k]) => $(id).addEventListener('click', () => spinMany(k))); $('reset1').addEventListener('click', () => { S.n1 = 0; S.r1 = 0; S.hist1 = []; render1(); });
  [10, 100, 1000].forEach(n => $('e' + n).addEventListener('click', () => { S.sel2 = n; render2(); })); $('exp2').addEventListener('click', () => { const n = S.sel2; for (let i = 0; i < 20 && S.rows[n].length < 200; i++) S.rows[n].push(runCount(rand, n, 0.3) / n); render2(); }); $('reset2').addEventListener('click', () => { S.rows = { 10: [], 100: [], 1000: [] }; render2(); });
  slider('r3', render3); slider('b3', render3); slider('k4', () => { S.st4 = null; render4(); }); $('sim4').addEventListener('click', () => { const k = +$('k4').value, r = streakNext(rand, 20000, k, 0.5); r.k = k; S.st4 = r; render4(); }); $('reset4').addEventListener('click', () => { S.st4 = null; render4(); });
  slider('p5', () => { S.runs5 = []; render5(); }); slider('n5', () => { S.runs5 = []; render5(); }); $('r5a').addEventListener('click', () => run5(1)); $('r5b').addEventListener('click', () => run5(50)); $('reset5').addEventListener('click', () => { S.runs5 = []; render5(); });
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
if (typeof module !== 'undefined') module.exports = { mulberry32,spinResult,runCount,streakNext,band95 };
