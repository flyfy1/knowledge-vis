/* averaging-leveling: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const L0 = [7, 3, 9, 5, 6], CAP = 16;
const sum = a => a.reduce((s, v) => s + v, 0), mean = a => sum(a) / a.length;
const fmt = v => String(Math.round(v * 100) / 100);
function pour(a, i, j) { const r = a.slice(); if (i === j || r[i] <= 0) return null; r[i]--; r[j]++; return r; }
/* One whole-unit move: tallest to lowest, only while it still narrows the gap. */
function levelStep(a) { let hi = 0, lo = 0; a.forEach((v, i) => { if (v > a[hi]) hi = i; if (v < a[lo]) lo = i; }); return a[hi] - a[lo] >= 2 ? pour(a, hi, lo) : null; }
const excess = a => a.reduce((s, v) => s + Math.max(0, v - mean(a)), 0);
function levelWhole(T, n) { const q = Math.floor(T / n), r = T - q * n; return Array.from({ length: n }, (_, i) => i < r ? q + 1 : q); }
const S = { l0: L0.slice(), k0: 0, l1: L0.slice(), k1: 0, timer: null, mode3: 'whole' };
const lv = a => '[' + a.join(', ') + ']';
function drawCups(ctx, box, levels, o) { o = o || {}; const n = levels.length, mx = o.max || CAP, cw = box.w / n, ch = box.h - 18, unit = ch / mx, bw = cw * 0.62;
  levels.forEach((v, i) => { const x = box.x + i * cw + (cw - bw) / 2, yb = box.y + ch, faded = o.fade && o.fade(i);
    ctx.globalAlpha = faded ? 0.3 : 1; ctx.strokeStyle = o.hl && o.hl[i] ? o.hl[i] : COL.muted; ctx.lineWidth = o.hl && o.hl[i] ? 3 : 2; ctx.beginPath(); ctx.moveTo(x, yb - mx * unit); ctx.lineTo(x, yb); ctx.lineTo(x + bw, yb); ctx.lineTo(x + bw, yb - mx * unit); ctx.stroke();
    ctx.fillStyle = 'rgba(103,215,249,0.55)'; ctx.fillRect(x + 1.5, yb - v * unit, bw - 3, v * unit);
    if (o.blocks !== false && unit > 5) for (let b = 1; b < v; b++) line(ctx, x + 1.5, yb - b * unit, x + bw - 1.5, yb - b * unit, 'rgba(10,14,20,0.35)', 1);
    text(ctx, fmt(v), x + bw / 2, yb - v * unit - 5, { align: 'center', size: 12, color: COL.ink, bold: true }); text(ctx, o.names ? o.names[i] : '#' + (i + 1), x + bw / 2, yb + 14, { align: 'center', size: 11 }); ctx.globalAlpha = 1; });
  return { Y: v => box.y + ch - v * unit, x0: box.x, x1: box.x + box.w }; }
function meanLine(ctx, g, m) { line(ctx, g.x0, g.Y(m), g.x1, g.Y(m), COL.green, 2, [6, 4]); text(ctx, fmt(m), g.x1, g.Y(m) - 5, { align: 'right', size: 12, color: COL.green, bold: true }); }
function render0() { const { ctx, w, h } = setup($('cv0')), a = S.l0, f = +$('f0').value - 1, g = +$('g0').value - 1; $('f0v').textContent = f + 1; $('g0v').textContent = g + 1; const hl = {}; hl[f] = COL.orange; hl[g] = COL.cyan;
  drawCups(ctx, { x: 8, y: 8, w: w - 16, h: h - 16 }, a, { hl }); const why = f === g ? 'whySame' : a[f] <= 0 ? 'whyEmpty' : a[g] >= CAP ? 'whyFull' : null; $('pour0').disabled = !!why;
  $('ro0').textContent = t('s0ro', { levels: lv(a), total: sum(a), total0: sum(L0), k: S.k0 }) + (why ? ' ' + t('s0roBad', { why: t(why) }) : ''); }
function render1() { const { ctx, w, h } = setup($('cv1')), a = S.l1, done = !levelStep(a); const g = drawCups(ctx, { x: 8, y: 8, w: w - 16, h: h - 16 }, a, {}); const mx = Math.max.apply(null, a), mn = Math.min.apply(null, a);
  if (done) meanLine(ctx, g, mean(a)); $('move1').disabled = done; $('auto1').disabled = done;
  $('ro1').textContent = done ? t('s1roDone', { m: fmt(mean(a)), k: S.k1, ex: fmt(excess(L0)) }) : t('s1ro', { k: S.k1, levels: lv(a), mx, mn }); }
const stop1 = () => { if (S.timer) { clearInterval(S.timer); S.timer = null; } };
const onHide = stop1;
function render2() { const { ctx, w, h } = setup($('cv2')), k = +$('k2').value, a = L0.slice(0, k); $('k2v').textContent = k; const m = mean(a), half = (h - 8) / 2;
  const g = drawCups(ctx, { x: 8, y: 4, w: w - 16, h: half - 4 }, a, { blocks: false }); meanLine(ctx, g, m);
  drawCups(ctx, { x: 8, y: half + 6, w: w - 16, h: half - 4 }, a.map(() => m), { blocks: false, names: a.map(() => '=') });
  $('ro2').textContent = t('s2ro', { k, total: sum(a), m: fmt(m) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), T = +$('T3').value; $('T3v').textContent = T; const md = S.mode3; ['w', 'a'].forEach(x => { const b = $('m' + x + '3'), on = (x === 'w') === (md === 'whole'); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  const lvl = md === 'whole' ? levelWhole(T, 5) : Array(5).fill(T / 5), g = drawCups(ctx, { x: 8, y: 8, w: w - 16, h: h - 16 }, lvl, { max: 12, blocks: md === 'whole' }); meanLine(ctx, g, T / 5);
  const q = Math.floor(T / 5), r = T - q * 5; $('ro3').textContent = r === 0 ? t('s3roEven', { T, m: q }) : md === 'whole' ? t('s3ro', { T, m: fmt(T / 5), n1: r, hi: q + 1, n0: 5 - r, lo: q }) : t('s3roAny', { T, m: fmt(T / 5) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), o = +$('o4').value; $('o4v').textContent = o; const a = [7, 3, o, 5, 6], m = mean(a);
  const hl = { 2: COL.orange }, g = drawCups(ctx, { x: 8, y: 8, w: w - 16, h: h - 16 }, a, { max: Math.max(16, o + 2), hl, blocks: false }); meanLine(ctx, g, m);
  $('ro4').textContent = t('s4ro', { levels: lv(a), m: fmt(m), lo: a.filter(v => v < m).length, hi: a.filter(v => v > m).length }); }
function render5() { const { ctx, w, h } = setup($('cv5')), a = ['a5', 'b5', 'c5', 'd5'].map(id => { $(id + 'v').textContent = $(id).value; return +$(id).value; }), m = mean(a);
  const g = drawCups(ctx, { x: 8, y: 8, w: w - 16, h: h - 16 }, a, { max: 20, names: ['A', 'B', 'C', 'D'], blocks: false }); meanLine(ctx, g, m); $('ro5').textContent = t('s5ro', { total: sum(a), m: fmt(m), ex: fmt(excess(a)) }); }
function wire() {
  slider('f0', render0); slider('g0', render0);
  $('pour0').addEventListener('click', () => { const r = pour(S.l0, +$('f0').value - 1, +$('g0').value - 1); if (r && r[+$('g0').value - 1] <= CAP) { S.l0 = r; S.k0++; } render0(); });
  $('reset0').addEventListener('click', () => { S.l0 = L0.slice(); S.k0 = 0; render0(); });
  $('move1').addEventListener('click', () => { const r = levelStep(S.l1); if (r) { S.l1 = r; S.k1++; } render1(); });
  $('auto1').addEventListener('click', () => { stop1(); if (reduceMotion()) { let r; while ((r = levelStep(S.l1))) { S.l1 = r; S.k1++; } render1(); return; } S.timer = setInterval(() => { const r = levelStep(S.l1); if (r) { S.l1 = r; S.k1++; } else stop1(); render1(); }, 450); });
  $('reset1').addEventListener('click', () => { stop1(); S.l1 = L0.slice(); S.k1 = 0; render1(); });
  slider('k2', render2); slider('T3', render3); $('mw3').addEventListener('click', () => { S.mode3 = 'whole'; render3(); }); $('ma3').addEventListener('click', () => { S.mode3 = 'any'; render3(); });
  slider('o4', render4); ['a5', 'b5', 'c5', 'd5'].forEach(id => slider(id, render5));
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
if (typeof module !== 'undefined') module.exports = { mean,pour,levelStep,levelWhole,excess,L0 };
