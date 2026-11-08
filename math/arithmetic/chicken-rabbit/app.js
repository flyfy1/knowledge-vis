/* chicken-rabbit: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const legsOf = type => type === 'rabbit' ? 4 : 2;
const feetTotal = (H, r, a, b) => (a || 2) * (H - r) + (b || 4) * r;
const solveFromChickens = (H, F, a, b) => { a = a || 2; b = b || 4; const allA = a * H, sur = F - allA, per = b - a, r = sur / per; return { allA, sur, per, r, c: H - r, ok: sur >= 0 && Number.isInteger(r) && r <= H, lo: a * H, hi: b * H }; };
const solveFromRabbits = (H, F, a, b) => { a = a || 2; b = b || 4; const allB = b * H, def = allB - F, per = b - a, c = def / per; return { allB, def, per, c, r: H - c, ok: def >= 0 && Number.isInteger(c) && c <= H }; };
const SCEN = [{ a: 2, b: 4, H: 35, F: 94 }, { a: 2, b: 3, H: 20, F: 48 }, { a: 4, b: 6, H: 10, F: 50 }];
const S = { r0: 5, k1: 0, timer: null, hyp: 'C', sc: 0 };
function animals(H, r) { return Array.from({ length: H }, (_, i) => i < H - r ? 'chicken' : 'rabbit'); }
function drawAnimal(ctx, x, y, s, type) { const rab = type === 'rabbit', col = rab ? COL.orange : COL.cyan, legs = legsOf(type);
  for (let i = 0; i < legs; i++) { const dx = (i - (legs - 1) / 2) * s * (rab ? 0.28 : 0.45); line(ctx, x + dx, y + s * 0.3, x + dx, y + s * 0.75, COL.muted, 1.5); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, s * 0.42, s * 0.32, 0, 0, 6.2832); ctx.fill();
  if (rab) { line(ctx, x - s * 0.12, y - s * 0.28, x - s * 0.18, y - s * 0.6, col, 2); line(ctx, x + s * 0.12, y - s * 0.28, x + s * 0.18, y - s * 0.6, col, 2); } else { ctx.fillStyle = COL.orange; ctx.beginPath(); ctx.moveTo(x + s * 0.4, y - s * 0.1); ctx.lineTo(x + s * 0.6, y); ctx.lineTo(x + s * 0.4, y + s * 0.05); ctx.fill(); }
  dot(ctx, x + s * 0.18, y - s * 0.08, 1.8, '#0a0e14'); return legs; }
function drawFlock(ctx, box, list) { const n = list.length, cols = Math.ceil(Math.sqrt(n * box.w / box.h)), rows = Math.ceil(n / cols), s = Math.min(box.w / cols, box.h / rows) * 0.9; let feet = 0;
  list.forEach((tp, i) => { const cx = box.x + (i % cols + 0.5) * box.w / cols, cy = box.y + (Math.floor(i / cols) + 0.4) * box.h / rows; feet += drawAnimal(ctx, cx, cy, s * 0.85, tp); }); return feet; }
/* generic ladder chart: x = swaps, y = total; points up to k, target line */
function ladder(ctx, w, h, lo, hi, per, kmax, k, F, dirSign) { const L = { x: 40, y: 12, w: w - 56, h: h - 40 }, X = v => L.x + v / kmax * L.w, Y = v => L.y + L.h - (v - Math.min(lo, hi)) / (Math.abs(hi - lo) || 1) * L.h;
  line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1);
  text(ctx, String(Math.min(lo, hi)), L.x - 5, L.y + L.h + 4, { align: 'right', size: 11 }); text(ctx, String(Math.max(lo, hi)), L.x - 5, L.y + 8, { align: 'right', size: 11 }); text(ctx, '0', L.x, L.y + L.h + 15, { align: 'center', size: 11 }); text(ctx, String(kmax), L.x + L.w, L.y + L.h + 15, { align: 'center', size: 11 });
  line(ctx, L.x, Y(F), L.x + L.w, Y(F), COL.green, 1.5, [5, 4]); text(ctx, String(F), L.x + L.w, Y(F) - 5, { align: 'right', size: 12, color: COL.green, bold: true });
  ctx.strokeStyle = COL.dim; ctx.lineWidth = 1; for (let i = 0; i <= kmax; i++) dot(ctx, X(i), Y(lo + dirSign * per * i), 2, COL.dim);
  for (let i = 0; i <= k; i++) { const v = lo + dirSign * per * i; if (i) line(ctx, X(i - 1), Y(v - dirSign * per), X(i), Y(v), COL.cyan, 2); dot(ctx, X(i), Y(v), i === k ? 6 : 3, i === k ? COL.orange : COL.cyan); }
  return { X, Y }; }
function render0() { const { ctx, w, h } = setup($('cv0')), r = +$('r0').value; $('r0v').textContent = r; const feet = drawFlock(ctx, { x: 6, y: 6, w: w - 12, h: h - 12 }, animals(35, r)), d = Math.abs(94 - feet);
  $('ro0').textContent = t('s0ro', { r, c: 35 - r, f: feet, cmp: feet === 94 ? t('cmpEq') : feet < 94 ? t('cmpLess', { d }) : t('cmpMore', { d }) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), k = S.k1, f = feetTotal(35, k); ladder(ctx, w, h, 70, 140, 2, 35, k, 94, 1);
  $('ro1').textContent = f >= 94 ? t('s1roDone', { k, f, c: 35 - k }) : t('s1ro', { k, f, gap: 94 - f, need: (94 - f) / 2 }); $('swap1').disabled = f >= 94; }
const stop1 = () => { if (S.timer) { clearInterval(S.timer); S.timer = null; } };
const onHide = stop1;
function render2() { const { ctx, w, h } = setup($('cv2')), H = +$('H2').value, F = +$('F2').value; $('H2v').textContent = H; $('F2v').textContent = F; const s = solveFromChickens(H, F);
  const ro = $('ro2');
  if (F % 2) ro.textContent = t('bad1', { F }); else if (F < 2 * H) ro.textContent = t('bad2', { F, min: 2 * H }); else if (F > 4 * H) ro.textContent = t('bad3', { F, max: 4 * H }); else ro.textContent = t('s2ro', { H, F, r: s.r, c: s.c, chk: feetTotal(H, s.r) });
  const L = { x: 44, y: 12, w: w - 60, h: h - 40 }, X = v => L.x + v / H * L.w, Y = v => L.y + L.h - (v - 0) / Math.max(4 * H, F, 1) * L.h;
  line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); text(ctx, '0', L.x, L.y + L.h + 15, { align: 'center', size: 11 }); text(ctx, String(H), L.x + L.w, L.y + L.h + 15, { align: 'center', size: 11 }); text(ctx, 'r', L.x + L.w / 2, L.y + L.h + 28, { align: 'center', size: 11 });
  line(ctx, X(0), Y(2 * H), X(H), Y(4 * H), COL.cyan, 2.5); line(ctx, L.x, Y(F), L.x + L.w, Y(F), COL.green, 1.5, [5, 4]);
  if (!(F % 2) && F >= 2 * H && F <= 4 * H) { dot(ctx, X(s.r), Y(F), 7, COL.orange); text(ctx, 'r = ' + s.r, X(s.r), Y(F) - 12, { align: 'center', bold: true, color: COL.ink }); } }
function hs() { const H = +$('H2').value, F = +$('F2').value; return { H, F, ok: F % 2 === 0 && F >= 2 * H && F <= 4 * H }; }
function render3() { const { ctx, w, h } = setup($('cv3')), { H, F, ok } = hs(); const kmax = ok ? Math.max(solveFromChickens(H, F).r, 0) : 0, hyp = S.hyp;
  ['C', 'R'].forEach(x => { const b = $('hyp' + x); b.classList.toggle('active', x === hyp); b.setAttribute('aria-pressed', x === hyp ? 'true' : 'false'); });
  $('k3').max = Math.max(1, H); const k = Math.min(+$('k3').value, H); $('k3v').textContent = k;
  if (!ok) { $('ro3').textContent = t('s3roBad'); text(ctx, '?', w / 2, h / 2 + 12, { size: 40, align: 'center' }); return; }
  const lo = 2 * H, hi = 4 * H, X = v => 24 + (v - lo) / (hi - lo) * (w - 48), y = h * 0.55, sgn = hyp === 'C' ? 1 : -1, start = hyp === 'C' ? lo : hi, f = start + sgn * 2 * k;
  line(ctx, X(lo), y, X(hi), y, COL.dim, 6); text(ctx, String(lo), X(lo), y + 26, { align: 'center', size: 11 }); text(ctx, String(hi), X(hi), y + 26, { align: 'center', size: 11 });
  const clamped = clamp(f, lo, hi); line(ctx, X(start), y, X(clamped), y, hyp === 'C' ? COL.cyan : COL.orange, 6); dot(ctx, X(clamped), y, 9, COL.ink);
  line(ctx, X(F), y - 28, X(F), y + 10, COL.green, 3); text(ctx, String(F), X(F), y - 34, { align: 'center', size: 13, bold: true, color: COL.green });
  const need = hyp === 'C' ? solveFromChickens(H, F).r : solveFromRabbits(H, F).c;
  $('ro3').textContent = (f === F) ? t('s3roDone', { f, k, r: solveFromChickens(H, F).r }) : t('s3ro', { hyp: t(hyp === 'C' ? 'hypC' : 'hypR'), start: t(hyp === 'C' ? 'startC' : 'startR') + ' ' + start, dir: t(hyp === 'C' ? 'dirUp' : 'dirDown'), F, need, k, f: clamped }); }
function render4() { const { ctx, w, h } = setup($('cv4')), sc = SCEN[S.sc], H = +$('H4').value, F = +$('F4').value; $('H4v').textContent = H; $('F4v').textContent = F;
  [0, 1, 2].forEach(i => { const b = $('sc' + i); b.classList.toggle('active', i === S.sc); b.setAttribute('aria-pressed', i === S.sc ? 'true' : 'false'); });
  const s = solveFromChickens(H, F, sc.a, sc.b), id = 'sc' + S.sc, p = { na: t(id + 'a'), nb: t(id + 'b'), u: t(id + 'u') };
  if (s.ok) { ladder(ctx, w, h, sc.a * H, sc.b * H, sc.b - sc.a, H, s.r, F, 1); $('ro4').textContent = t('s4ro', { H, F, ...p, allA: s.allA, sur: s.sur, per: s.per, r: s.r, c: s.c }); }
  else { ladder(ctx, w, h, sc.a * H, sc.b * H, sc.b - sc.a, H, 0, clamp(F, sc.a * H, sc.b * H), 1); $('ro4').textContent = t('s4roBad', { ...p, a: sc.a, b: sc.b, lo: s.lo, hi: s.hi }); } }
function render5() { const { ctx, w, h } = setup($('cv5')), c = +$('c5').value, r = +$('r5').value; $('c5v').textContent = c; $('r5v').textContent = r; const H = c + r, list = animals(H, r), F = drawFlock(ctx, { x: 6, y: 6, w: w - 12, h: h - 12 }, list), s = solveFromChickens(H, F);
  $('ro5').textContent = t('s5ro', { H, F, allA: s.allA, sur: s.sur, r: s.r, r0: r, ok: s.r === r ? t('same') : '≠' }); }
function wire() {
  slider('r0', render0);
  $('swap1').addEventListener('click', () => { if (feetTotal(35, S.k1) < 94) S.k1++; render1(); });
  $('auto1').addEventListener('click', () => { stop1; if (feetTotal(35, S.k1) >= 94) return; if (reduceMotion()) { while (feetTotal(35, S.k1) < 94) S.k1++; render1(); return; } stop1(); S.timer = setInterval(() => { if (feetTotal(35, S.k1) < 94) S.k1++; render1(); if (feetTotal(35, S.k1) >= 94) stop1(); }, 220); });
  $('reset1').addEventListener('click', () => { stop1(); S.k1 = 0; render1(); });
  slider('H2', () => { render2(); render3(); }); slider('F2', () => { render2(); render3(); });
  $('hypC').addEventListener('click', () => { S.hyp = 'C'; $('k3').value = 0; render3(); }); $('hypR').addEventListener('click', () => { S.hyp = 'R'; $('k3').value = 0; render3(); }); slider('k3', render3);
  [0, 1, 2].forEach(i => $('sc' + i).addEventListener('click', () => { S.sc = i; $('H4').value = SCEN[i].H; $('F4').value = SCEN[i].F; render4(); })); slider('H4', render4); slider('F4', render4);
  slider('c5', render5); slider('r5', render5);
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
if (typeof module !== 'undefined') module.exports = { feetTotal,solveFromChickens,solveFromRabbits,legsOf,SCEN };
