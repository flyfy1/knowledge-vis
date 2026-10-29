/* relativity: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* Units: c = 1, so speeds are fractions beta of the speed of light and time is measured as ct (distance light travels). */
const gamma = b => 1 / Math.sqrt(1 - b * b);
const boost = (x, ct, b) => { const g = gamma(b); return { x: g * (x - b * ct), ct: g * (ct - b * x) }; };
const addV = (v, w) => (v + w) / (1 + v * w);
const interval = (x, ct) => ct * ct - x * x;
const kindOf = s => Math.abs(s) < 1e-9 ? 'light' : s > 0 ? 'time' : 'space';
const lengthOf = (L0, b) => L0 / gamma(b);
/* Cosmic-ray muons: produced at height h km, mean life 2.2 microseconds at rest. */
const TAU = 2.197, CKM = 0.299792458; /* us, km per us */
function muons(b, hkm) { const tLab = hkm / (b * CKM), g = gamma(b); return { tLab, survNo: Math.exp(-tLab / TAU), survYes: Math.exp(-tLab / (g * TAU)), tauLab: g * TAU, hMuon: hkm / g }; }
const keClassical = b => 0.5 * b * b, keRel = b => gamma(b) - 1;
const f2 = v => String(Math.round(v * 100) / 100), f3 = v => String(Math.round(v * 1000) / 1000), f1 = v => String(Math.round(v * 10) / 10);
const sci = v => v === 0 ? '0' : v < 1e-3 ? v.toExponential(1).replace('e-', '×10⁻') : f3(v);
const S = { b0: 0.8, b1: 0.6, bx: 2, bt: 3, b2: 0.5, b3: 0.99, v4: 0.8, w4: 0.8, b5: 0.9 };
function arrow(ctx, x1, y1, x2, y2, col, lw) { if (Math.hypot(x2 - x1, y2 - y1) < 2) return; line(ctx, x1, y1, x2, y2, col, lw || 3); const a = Math.atan2(y2 - y1, x2 - x1); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8 * Math.cos(a - 0.45), y2 - 8 * Math.sin(a - 0.45)); ctx.lineTo(x2 - 8 * Math.cos(a + 0.45), y2 - 8 * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill(); }
function render0() { const { ctx, w, h, wide } = setup($('cv0')), b = S.b0, g = gamma(b), hh = h * 0.62, base = h * 0.84, sc = Math.min(hh, (w * 0.9) / (1 + b * g * 1.0) * 0.8);
  const x0 = w * 0.1, L = hh; line(ctx, x0 - 18, base, x0 + 18, base, COL.ink, 4); line(ctx, x0 - 18, base - L, x0 + 18, base - L, COL.ink, 4); arrow(ctx, x0, base, x0, base - L, COL.green, 3); text(ctx, t('atRest'), x0, base + 18, { align: 'center', size: 12, color: COL.muted }); text(ctx, t('oneWay', { t: '1' }), x0 + 22, base - L / 2, { size: 11, color: COL.green });
  const x1 = w * 0.3, dx = Math.min(w * 0.62, b * g * L), sx = dx / (b * g * L || 1); line(ctx, x1 - 18, base, x1 + dx + 18, base, COL.grid, 1); line(ctx, x1 - 18, base - L, x1 + dx + 18, base - L, COL.grid, 1);
  line(ctx, x1 - 18, base, x1 + 18, base, COL.ink, 4); line(ctx, x1 - 18, base - L, x1 + 18, base - L, COL.ink, 4); line(ctx, x1 + dx - 18, base, x1 + dx + 18, base, 'rgba(234,244,248,0.45)', 4); line(ctx, x1 + dx - 18, base - L, x1 + dx + 18, base - L, 'rgba(234,244,248,0.45)', 4);
  const Lp = L * g * 0 + L; arrow(ctx, x1, base, x1 + dx, base - L, COL.orange, 3); line(ctx, x1, base, x1 + dx, base, COL.cyan, 1.5, [4, 3]); line(ctx, x1 + dx, base, x1 + dx, base - L, COL.green, 1.5, [4, 3]); text(ctx, t('moving'), x1 + dx / 2, base + 18, { align: 'center', size: 12, color: COL.muted }); text(ctx, t('oneWay', { t: f2(g) }), x1 + dx / 2, base - L / 2 - 8, { align: 'center', size: 11, color: COL.orange });
  text(ctx, t('shift', { d: f2(b * g) }), x1 + dx / 2, base - 4, { align: 'center', size: 11, color: COL.cyan }); if (sx < 0.999) text(ctx, t('squeezed'), w - 8, 16, { align: 'right', size: 11, color: COL.muted }); $('b0v').textContent = b;
  $('ro0').textContent = t('s0ro', { b, g: f2(g), tick: f2(g), rate: f2(1 / g), pct: f1((1 - 1 / g) * 100) }); }
function diagram(ctx, w, h, b, o) { const R = { x: 14, y: 12, w: w - 28, h: h - 30 }, xr = 4, tr0 = -1, tr1 = 5.2, X = v => R.x + (v + xr) / (2 * xr) * R.w, Y = v => R.y + R.h - (v - tr0) / (tr1 - tr0) * R.h; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
  for (let k = -4; k <= 5; k++) { line(ctx, X(k), Y(tr0), X(k), Y(tr1), 'rgba(168,186,196,0.18)', 1); line(ctx, X(-xr), Y(k), X(xr), Y(k), 'rgba(168,186,196,0.18)', 1); } line(ctx, X(0), Y(tr0), X(0), Y(tr1), COL.muted, 1.5); line(ctx, X(-xr), Y(0), X(xr), Y(0), COL.muted, 1.5);
  line(ctx, X(-xr), Y(-xr), X(xr), Y(xr), COL.orange, 1.5, [6, 4]); line(ctx, X(xr), Y(-xr), X(-xr), Y(xr), COL.orange, 1.5, [6, 4]); const g = gamma(b);
  if (o.grid) for (let k = -8; k <= 8; k++) { const c = k / g * 1; line(ctx, X(c + b * tr0), Y(tr0), X(c + b * tr1), Y(tr1), 'rgba(103,215,249,0.35)', 1); line(ctx, X(-xr), Y(c + b * -xr), X(xr), Y(c + b * xr), 'rgba(103,215,249,0.35)', 1); }
  line(ctx, X(b * tr0), Y(tr0), X(b * tr1), Y(tr1), COL.cyan, 2.5); line(ctx, X(-xr), Y(-b * xr), X(xr), Y(b * xr), COL.cyan, 2.5); ctx.restore(); text(ctx, t('axX'), R.x + R.w - 4, Y(0) - 6, { align: 'right', size: 11, color: COL.muted }); text(ctx, t('axT'), X(0) + 6, R.y + 14, { size: 11, color: COL.muted }); text(ctx, t('axXp'), R.x + R.w - 4, Y(b * xr) + 14, { align: 'right', size: 11, color: COL.cyan }); text(ctx, t('axTp'), X(b * 4.6) + 6, Y(4.6), { size: 11, color: COL.cyan }); text(ctx, t('lightLine'), X(2.6) + 6, Y(3.4), { size: 11, color: COL.orange }); return { X, Y, R }; }
function render1() { const { ctx, w, h } = setup($('cv1')), b = S.b1, M = diagram(ctx, w, h, b, { grid: true }), ev = boost(S.bx, S.bt, b), s = interval(S.bx, S.bt); dot(ctx, M.X(0), M.Y(0), 5, COL.ink); text(ctx, 'A', M.X(0) + 7, M.Y(0) + 14, { size: 12, color: COL.ink }); dot(ctx, M.X(S.bx), M.Y(S.bt), 6, COL.green); text(ctx, 'B', M.X(S.bx) + 8, M.Y(S.bt) - 6, { size: 12, color: COL.green });
  $('b1v').textContent = b; $('bx1v').textContent = S.bx; $('bt1v').textContent = S.bt; $('ro1').textContent = t('s1ro', { b, g: f2(gamma(b)), x: S.bx, ct: S.bt, xp: f2(ev.x), ctp: f2(ev.ct), s: f2(s), kind: t('k_' + kindOf(s)) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), b = S.b2, M = diagram(ctx, w, h, b, { grid: false }), E1 = [-2, 0], E2 = [2, 0], e1 = boost(E1[0], E1[1], b), e2 = boost(E2[0], E2[1], b);
  [[E1, COL.violet, 'E₁', e1], [E2, COL.green, 'E₂', e2]].forEach(([e, col, lab, bb]) => { const c0 = e[1] - b * e[0]; line(ctx, M.X(-4), M.Y(c0 - b * 4), M.X(4), M.Y(c0 + b * 4), col, 2, [5, 4]); dot(ctx, M.X(e[0]), M.Y(e[1]), 7, col); text(ctx, lab, M.X(e[0]), M.Y(e[1]) + 20, { align: 'center', size: 12, color: col }); });
  line(ctx, M.X(-4), M.Y(0), M.X(4), M.Y(0), COL.muted, 2, [2, 3]); text(ctx, t('simS'), M.R.x + 6, M.Y(0) - 6, { size: 11, color: COL.muted }); text(ctx, t('simSp'), M.R.x + 6, M.Y(-b * 4) - 6, { size: 11, color: COL.cyan }); $('b2v').textContent = b;
  $('ro2').textContent = t('s2ro', { b, g: f2(gamma(b)), t1: f2(e1.ct), t2: f2(e2.ct), d: f2(e2.ct - e1.ct), first: t(Math.abs(e2.ct - e1.ct) < 1e-9 ? 'sameTime' : e2.ct < e1.ct ? 'firstE2' : 'firstE1') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), b = S.b3, m = muons(b, 15), R = { x: 14, y: 14, w: w - 28, h: h - 40 }, rows = [['mNo', m.survNo, COL.red, t('lblNo', { t: f1(m.tLab), tau: TAU })], ['mYes', m.survYes, COL.green, t('lblYes', { t: f1(m.tauLab) })]], rh = R.h / 2.2;
  rows.forEach(([k, v, col, lab], i) => { const y = R.y + i * rh * 1.1 + 6, lg = Math.max(0, 1 + Math.log10(Math.max(v, 1e-11)) / 11), bw = (R.w - 8) * lg; ctx.fillStyle = COL.dim; ctx.fillRect(R.x, y + 22, R.w, 16); ctx.fillStyle = col; ctx.fillRect(R.x, y + 22, bw, 16); text(ctx, t(k), R.x, y + 14, { size: 12, color: col, bold: true }); text(ctx, lab, R.x + R.w, y + 14, { align: 'right', size: 11 }); text(ctx, sci(v), R.x + 6, y + 35, { size: 11, color: '#0a0e14', bold: true }); });
  text(ctx, t('logBar'), R.x, R.y + R.h + 14, { size: 10 }); $('b3v').textContent = b; $('ro3').textContent = t('s3ro', { b, g: f2(gamma(b)), tl: f1(m.tLab), no: sci(m.survNo), yes: sci(m.survYes), h: f2(m.hMuon), ratio: m.survNo > 0 ? sci(m.survYes / m.survNo) : '∞' }); }
function render4() { const { ctx, w, h } = setup($('cv4')), v = S.v4, wv = S.w4, u = addV(v, wv), naive = v + wv, R = { x: 24, y: 40, w: w - 48, h: 18 }, X = s => R.x + s / 2 * R.w; ctx.fillStyle = COL.dim; ctx.fillRect(R.x, R.y, R.w * 0.5, R.h); ctx.fillStyle = 'rgba(224,100,78,0.2)'; ctx.fillRect(R.x + R.w * 0.5, R.y, R.w * 0.5, R.h); line(ctx, X(1), R.y - 8, X(1), R.y + R.h + 8, COL.orange, 2); text(ctx, t('cLine'), X(1), R.y - 12, { align: 'center', size: 11, color: COL.orange });
  [[naive, COL.red, 'naive', 0], [u, COL.green, 'rel', 1]].forEach(([val, col, k, i]) => { const y = R.y + 36 + i * 46; ctx.fillStyle = COL.dim; ctx.fillRect(R.x, y, R.w, 16); ctx.fillStyle = col; ctx.fillRect(R.x, y, Math.min(R.w, X(val) - R.x), 16); text(ctx, t(k === 'naive' ? 'naiveLab' : 'relLab', { s: f3(val) }), R.x, y - 6, { size: 12, color: col }); if (val > 1) text(ctx, t('overC'), X(1) + 6, y + 12, { size: 11, color: '#0a0e14', bold: true }); });
  const P = { x: 40, y: R.y + 140, w: w - 64, h: h - R.y - 190 }; ctx.strokeStyle = COL.grid; ctx.strokeRect(P.x, P.y, P.w, P.h); const Xw = a => P.x + a * P.w, Yu = a => P.y + P.h - Math.min(a, 2) / 2 * P.h; line(ctx, P.x, Yu(1), P.x + P.w, Yu(1), COL.orange, 1.5, [5, 4]); [[x => v + x, COL.red], [x => addV(v, x), COL.green]].forEach(([fn, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const a = i / 60, y = Yu(fn(a)); i ? ctx.lineTo(Xw(a), y) : ctx.moveTo(Xw(a), y); } ctx.stroke(); }); dot(ctx, Xw(wv), Yu(naive), 5, COL.red); dot(ctx, Xw(wv), Yu(u), 6, COL.green); text(ctx, t('wAxis'), P.x + P.w, P.y + P.h + 14, { align: 'right', size: 11 }); text(ctx, t('uAxis'), P.x, P.y - 6, { size: 11 });
  $('v4v').textContent = v; $('w4v').textContent = wv; $('ro4').textContent = t('s4ro', { v, w: wv, n: f3(naive), u: f3(u), tail: wv === 1 ? t('lightStays') : naive > 1 ? t('naiveBreaks') : '' }); }
function render5() { const { ctx, w, h } = setup($('cv5')), R = { x: 44, y: 16, w: w - 60, h: h - 56 }, bm = 0.99, ym = 8, X = b => R.x + b / bm * R.w, Y = v => R.y + R.h - Math.min(v, ym) / ym * R.h; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); [0, 2, 4, 6, 8].forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, String(v), R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); }); [0, 0.25, 0.5, 0.75, 0.99].forEach(v => text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 }));
  [[keClassical, COL.cyan], [keRel, COL.orange]].forEach(([fn, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const b = bm * i / 200; i ? ctx.lineTo(X(b), Y(fn(b))) : ctx.moveTo(X(b), Y(fn(b))); } ctx.stroke(); }); const b = S.b5; line(ctx, X(b), R.y, X(b), R.y + R.h, COL.muted, 1, [4, 3]); dot(ctx, X(b), Y(keClassical(b)), 5, COL.cyan); dot(ctx, X(b), Y(keRel(b)), 6, COL.orange);
  text(ctx, t('legCl'), R.x + 8, R.y + 14, { size: 12, color: COL.cyan }); text(ctx, t('legRel'), R.x + 8, R.y + 30, { size: 12, color: COL.orange }); text(ctx, t('betaAxis'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); text(ctx, t('keAxis'), R.x, R.y - 4, { size: 11 }); $('b5v').textContent = b;
  const MEV = 0.511; $('ro5').textContent = t('s5ro', { b, kc: f3(keClassical(b)), kr: f3(keRel(b)), ratio: f2(keRel(b) / keClassical(b)), mev: f2(keRel(b) * MEV), g: f2(gamma(b)) }); }
function wire() { slider('b0', v => { S.b0 = v; render0(); }); slider('b1', v => { S.b1 = v; render1(); }); slider('bx1', v => { S.bx = v; render1(); }); slider('bt1', v => { S.bt = v; render1(); }); slider('b2', v => { S.b2 = v; render2(); }); slider('b3', v => { S.b3 = v; render3(); }); slider('v4', v => { S.v4 = v; render4(); }); slider('w4', v => { S.w4 = v; render4(); }); slider('b5', v => { S.b5 = v; render5(); }); }

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
if (typeof module !== 'undefined') module.exports = { gamma, boost, addV, interval, kindOf, lengthOf, muons, keClassical, keRel, TAU, CKM };
