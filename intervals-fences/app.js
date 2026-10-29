/* intervals-fences: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const SPACINGS = [2, 3, 4, 6, 8, 12], MODES = ['both', 'one', 'none', 'ring'], MODE_KEY = { both: 'mBoth', one: 'mOne', none: 'mNone', ring: 'mRing' };
/* Tree positions (metres from the left end) on a straight road of length L; for 'ring' positions are arc distances. */
function plantPositions(mode, L, d) { const seg = Math.round(L / d), out = []; for (let k = 0; k <= seg; k++) { out.push(k * d); }
  if (mode === 'both') return out; if (mode === 'one') return out.slice(1); if (mode === 'none') return out.slice(1, -1); return out.slice(0, -1); }
const gapsOf = (pts) => { let g = 0; for (let i = 1; i < pts.length; i++) g++; return g; };
const sawCuts = c => ({ cuts: c, pieces: c + 1, time: 3 * c, wrong: 3 * (c + 1) });
const flightsTime = (a, b, ta) => ({ fa: a - 1, fb: b - 1, per: ta / (a - 1), t: (b - 1) * ta / (a - 1), wrong: ta * b / a });
const lengthFromTrees = (mode, T, d) => { const seg = mode === 'both' ? T - 1 : mode === 'none' ? T + 1 : T; return { seg, len: seg * d, min: mode === 'both' ? 1 : 1 }; };
const S = { mode2: 'both', mode5: 'both', cuts: 0 };
const fmtN = v => String(Math.round(v * 100) / 100);
function tree(ctx, x, y, s, col) { line(ctx, x, y, x, y - s * 0.6, '#8a6b4a', Math.max(2, s * 0.25)); dot(ctx, x, y - s * 0.9, s * 0.55, col); }
function road(ctx, box, mode, L, d, numbered) { const pts = plantPositions(mode, L, d), x0 = box.x + 20, x1 = box.x + box.w - 20, Lm = L || 1, X = v => x0 + v / Lm * (x1 - x0), y = box.y + box.h * 0.7, ts = Math.min(14, (x1 - x0) / Lm * d * 0.45);
  if (mode === 'ring') { const cx = box.x + box.w / 2, cy = box.y + box.h / 2, R = Math.min(box.w, box.h) * 0.36; ctx.strokeStyle = COL.dim; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();
    pts.forEach((p, i) => { const a = p / L * 6.2832 - 1.5708; tree(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R + 4, 10, COL.green); if (numbered) text(ctx, String(i + 1), cx + Math.cos(a) * (R + 22), cy + Math.sin(a) * (R + 22) + 4, { align: 'center', size: 11, color: COL.ink }); }); return pts; }
  const seg = Math.round(L / d); for (let k = 0; k < seg; k++) line(ctx, X(k * d) + 1, y + 10, X((k + 1) * d) - 1, y + 10, k % 2 ? COL.orange : COL.cyan, 4);
  line(ctx, x0, y, x1, y, COL.dim, 3); [0, L].forEach(v => line(ctx, X(v), y - 6, X(v), y + 6, COL.muted, 2));
  pts.forEach((p, i) => { tree(ctx, X(p), y, ts, COL.green); if (numbered) text(ctx, String(i + 1), X(p), y - ts * 2 - 4, { align: 'center', size: 11, color: COL.ink }); }); return pts; }
function render0() { const { ctx, w, h } = setup($('cv0')), n = +$('n0').value; $('n0v').textContent = n; const x0 = 24, x1 = w - 24, X = i => x0 + i * (x1 - x0) / 9, y = h * 0.6; let g = 0;
  for (let i = 0; i < n; i++) { if (i) { g++; ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(i - 1) + 6, y - 22); ctx.lineTo(X(i - 1) + 6, y - 28); ctx.lineTo(X(i) - 6, y - 28); ctx.lineTo(X(i) - 6, y - 22); ctx.stroke(); text(ctx, String(g), (X(i) + X(i - 1)) / 2, y - 34, { align: 'center', size: 11, color: COL.cyan, bold: true }); } }
  for (let i = 0; i < n; i++) { dot(ctx, X(i), y, 8, COL.orange); text(ctx, String(i + 1), X(i), y + 24, { align: 'center', size: 11, color: COL.ink }); }
  $('ro0').textContent = t('s0ro', { n, g }); }
function render1() { const { ctx, w, h } = setup($('cv1')), d = SPACINGS[+$('g1').value]; $('g1v').textContent = d; const pts = road(ctx, { x: 0, y: 0, w, h }, 'both', 24, d, true);
  $('ro1').textContent = t('s1ro', { d, seg: 24 / d, trees: 24 / d + 1, counted: pts.length }); }
function setModes(step) { MODES.forEach(m => { const b = $('m' + step + m), on = S['mode' + step] === m; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
function render2() { const { ctx, w, h } = setup($('cv2')), d = SPACINGS[+$('g2').value], m = S.mode2; $('g2v').textContent = d; setModes(2); const pts = road(ctx, { x: 0, y: 0, w, h }, m, 24, d, true), seg = 24 / d;
  $('ro2').textContent = t('s2ro', { mode: t(MODE_KEY[m]), d, seg, trees: pts.length, counted: pts.length, diff: pts.length - seg }); }
function render3() { const { ctx, w, h } = setup($('cv3')), c = S.cuts, p = c + 1, x0 = 20, x1 = w - 20, y = h * 0.5, hh = Math.min(46, h * 0.4);
  for (let i = 0; i < p; i++) { ctx.fillStyle = i % 2 ? '#8a6b4a' : '#a67c52'; const a = x0 + i * (x1 - x0) / p, b = x0 + (i + 1) * (x1 - x0) / p; ctx.fillRect(a + (i ? 2 : 0), y - hh / 2, b - a - (i ? 2 : 0) - (i < p - 1 ? 2 : 0), hh); text(ctx, String(i + 1), (a + b) / 2, y + 4, { align: 'center', size: 12, color: '#1b1209', bold: true }); }
  for (let i = 1; i < p; i++) { const x = x0 + i * (x1 - x0) / p; line(ctx, x, y - hh / 2 - 12, x, y + hh / 2 + 12, COL.orange, 2); text(ctx, '✂' + i, x, y - hh / 2 - 16, { align: 'center', size: 11, color: COL.orange }); }
  const r = sawCuts(c); $('ro3').textContent = t(c >= 9 ? 's3roFull' : 's3ro', { c: r.cuts, p: r.pieces, time: r.time, wrong: r.wrong }); $('saw3').disabled = c >= 9; }
function render4() { const { ctx, w, h } = setup($('cv4')), a = +$('a4').value, b = +$('b4').value; $('a4v').textContent = a; $('b4v').textContent = b; const N = 12, fh = (h - 30) / (N), x0 = 30, sw = Math.min(40, (w - 90) / N);
  for (let f = 1; f <= N; f++) { const y = h - 12 - (f - 1) * fh; line(ctx, x0, y, w - 20, y, '#1b2d3c', 1); text(ctx, String(f), 8, y + 4, { size: 11, color: f === a || f === b ? COL.orange : COL.muted, bold: f === a || f === b }); }
  for (let f = 1; f < N; f++) { const y0 = h - 12 - (f - 1) * fh, y1 = y0 - fh, xs = x0 + 20 + (f - 1) * sw * 0.9; const col = f < a ? COL.cyan : COL.dim; line(ctx, xs, y0, xs + sw * 0.9, y1, f < a ? COL.cyan : (f < b ? COL.orange : COL.dim), f < a || f < b ? 4 : 2); }
  const r = flightsTime(a, b, 30); $('ro4').textContent = t('s4ro', { a, b, fa: r.fa, fb: r.fb, per: fmtN(r.per), t: fmtN(r.t), wrong: fmtN(r.wrong) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), m = S.mode5, T = clamp(Math.round(+$('T5').value) || 1, 1, 200), d = clamp(Math.round(+$('d5').value) || 1, 1, 100); setModes(5); const r = lengthFromTrees(m, T, d);
  const minT = m === 'none' ? 1 : 1; const L = r.len; if (m === 'ring') road(ctx, { x: 0, y: 0, w, h }, 'ring', r.seg, 1, false); else road(ctx, { x: 0, y: 0, w, h }, m, r.seg, 1, false);
  $('ro5').textContent = t('s5ro', { mode: t(MODE_KEY[m]), T, d, seg: r.seg, len: L }); }
function wire() {
  slider('n0', render0); slider('g1', render1); slider('g2', render2);
  MODES.forEach(m => { $('m2' + m).addEventListener('click', () => { S.mode2 = m; render2(); }); $('m5' + m).addEventListener('click', () => { S.mode5 = m; render5(); }); });
  $('saw3').addEventListener('click', () => { if (S.cuts < 9) S.cuts++; render3(); }); $('reset3').addEventListener('click', () => { S.cuts = 0; render3(); });
  slider('a4', render4); slider('b4', render4); $('T5').addEventListener('input', render5); $('d5').addEventListener('input', render5);
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
if (typeof module !== 'undefined') module.exports = { plantPositions,gapsOf,sawCuts,flightsTime,lengthFromTrees,SPACINGS };
