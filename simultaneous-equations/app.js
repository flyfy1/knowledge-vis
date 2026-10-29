/* simultaneous-equations: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

/* A system is {a1,b1,c1,a2,b2,c2}: a1 x + b1 y = c1 and a2 x + b2 y = c2. */
const PRESETS = [{ a1: 1, b1: 1, c1: 10, a2: 2, b2: -1, c2: 2 }, { a1: -2, b1: 1, c1: 1, a2: 1, b2: 1, c2: 7 }, { a1: 1, b1: 2, c1: 8, a2: 3, b2: -1, c2: 3 }, { a1: 2, b1: 1, c1: 11, a2: 1, b2: -1, c2: 1 }];
const det = s => s.a1 * s.b2 - s.a2 * s.b1;
function solve(s) { const D = det(s); if (Math.abs(D) > 1e-12) return { kind: 'one', x: (s.c1 * s.b2 - s.c2 * s.b1) / D, y: (s.a1 * s.c2 - s.a2 * s.c1) / D }; const same = Math.abs(s.a1 * s.c2 - s.a2 * s.c1) < 1e-12 && Math.abs(s.b1 * s.c2 - s.b2 * s.c1) < 1e-12; return { kind: same ? 'many' : 'none' }; }
const residual = (a, b, c, x, y) => a * x + b * y - c;
const fmt = v => { const r = Math.round(v * 100) / 100; return String(r === 0 ? 0 : r); };
const term = (co, v, first) => { if (co === 0) return ''; const ab = Math.abs(co), body = (ab === 1 ? '' : fmt(ab)) + v; return first ? (co < 0 ? '−' : '') + body : ' ' + (co < 0 ? '−' : '+') + ' ' + body; };
const eqStr = (a, b, c) => { let s = term(a, 'x', true); s += term(b, 'y', s === ''); return s + ' = ' + fmt(c); };
const lin = (c0, c1) => { let s = fmt(c0); if (c1 !== 0) s += (c1 < 0 ? ' − ' : ' + ') + (Math.abs(c1) === 1 ? '' : fmt(Math.abs(c1))) + 'x'; return s; };
/* Substitution steps: solve eq1 for y, put into eq2. Needs b1 != 0. Every number is computed. */
function subSteps(s) { const sol = solve(s), y0 = s.c1 / s.b1, yx = -s.a1 / s.b1, A = s.a2 + s.b2 * yx, B = s.c2 - s.b2 * y0; return [{ k: 'sub0', e1: eqStr(s.a1, s.b1, s.c1), e2: eqStr(s.a2, s.b2, s.c2) }, { k: 'sub1', expr: lin(y0, yx) }, { k: 'sub2', lhs: fmt(s.a2) + 'x + ' + fmt(s.b2) + '·(' + lin(y0, yx) + ')', c2: fmt(s.c2) }, { k: 'sub3', A: fmt(A), B: fmt(B) }, { k: 'sub4', x: fmt(sol.x) }, { k: 'sub5', y: fmt(sol.y) }, { k: 'sub6', l1: fmt(s.a1 * sol.x + s.b1 * sol.y), c1: fmt(s.c1), l2: fmt(s.a2 * sol.x + s.b2 * sol.y), c2: fmt(s.c2) }]; }
/* Elimination of y: eq1 * k1 + eq2 * k2 with k1*b1 + k2*b2 = 0. */
function elimSteps(s) { const sol = solve(s); let k1, k2; if (s.b1 === -s.b2) { k1 = 1; k2 = 1; } else if (s.b1 === s.b2) { k1 = 1; k2 = -1; } else { k1 = s.b2; k2 = -s.b1; } const A = k1 * s.a1 + k2 * s.a2, B = k1 * s.c1 + k2 * s.c2;
  return [{ k: 'el0', e1: eqStr(s.a1, s.b1, s.c1), e2: eqStr(s.a2, s.b2, s.c2) }, { k: 'el1', k1: fmt(k1), k2: fmt(k2), e1s: eqStr(k1 * s.a1, k1 * s.b1, k1 * s.c1), e2s: eqStr(k2 * s.a2, k2 * s.b2, k2 * s.c2) }, { k: 'el2', A: fmt(A), B: fmt(B) }, { k: 'el3', x: fmt(B / A) }, { k: 'el4', y: fmt(sol.y) }, { k: 'el5', l1: fmt(s.a1 * sol.x + s.b1 * sol.y), c1: fmt(s.c1), l2: fmt(s.a2 * sol.x + s.b2 * sol.y), c2: fmt(s.c2) }, { vx: B / A }]; }
const S = { p: 0, st2: 0, st3: 0 };
const RG = [-1, 13];
function plane(ctx, w, h, rng) { const L = { x: 34, y: 10, w: w - 48, h: h - 32 }, X = v => L.x + (v - rng[0]) / (rng[1] - rng[0]) * L.w, Y = v => L.y + L.h - (v - rng[0]) / (rng[1] - rng[0]) * L.h; for (let v = Math.ceil(rng[0]); v <= rng[1]; v += 2) { line(ctx, X(v), L.y, X(v), L.y + L.h, '#16222e', 1); line(ctx, L.x, Y(v), L.x + L.w, Y(v), '#16222e', 1); text(ctx, String(v), X(v), L.y + L.h + 13, { align: 'center', size: 10 }); text(ctx, String(v), L.x - 5, Y(v) + 3, { align: 'right', size: 10 }); }
  line(ctx, X(0), L.y, X(0), L.y + L.h, COL.grid, 1.5); line(ctx, L.x, Y(0), L.x + L.w, Y(0), COL.grid, 1.5); text(ctx, 'x', L.x + L.w, Y(0) - 5, { align: 'right', size: 12, color: COL.ink }); text(ctx, 'y', X(0) + 6, L.y + 8, { size: 12, color: COL.ink }); return { L, X, Y }; }
function drawEq(ctx, g, a, b, c, col, rng) { ctx.save(); ctx.beginPath(); ctx.rect(g.L.x, g.L.y, g.L.w, g.L.h); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); if (Math.abs(b) > 1e-9) { ctx.moveTo(g.X(rng[0]), g.Y((c - a * rng[0]) / b)); ctx.lineTo(g.X(rng[1]), g.Y((c - a * rng[1]) / b)); } else { ctx.moveTo(g.X(c / a), g.Y(rng[0])); ctx.lineTo(g.X(c / a), g.Y(rng[1])); } ctx.stroke(); ctx.restore(); }
function render0() { const { ctx, w, h } = setup($('cv0')), x = +$('x0').value; $('x0v').textContent = x; const g = plane(ctx, w, h, RG); drawEq(ctx, g, 1, 1, 10, COL.cyan, RG); for (let k = 0; k <= 10; k++) dot(ctx, g.X(k), g.Y(10 - k), 3.5, COL.green); dot(ctx, g.X(x), g.Y(10 - x), 7, COL.orange); line(ctx, g.X(x), g.Y(0), g.X(x), g.Y(10 - x), COL.orange, 1, [4, 4]); line(ctx, g.X(0), g.Y(10 - x), g.X(x), g.Y(10 - x), COL.orange, 1, [4, 4]); $('ro0').textContent = t('s0ro', { x, y: fmt(10 - x) }); }
function presetButtons(box, step) { const b = $(box); if (b.children.length) return; PRESETS.forEach((s, i) => { const bt = document.createElement('button'); bt.id = 'ps' + step + '_' + i; bt.dataset.step = String(step); bt.addEventListener('click', () => { S.p = i; S.st2 = 0; S.st3 = 0; renderAll(); }); b.appendChild(bt); }); }
function markPresets(step) { PRESETS.forEach((s, i) => { const bt = $('ps' + step + '_' + i); bt.textContent = eqStr(s.a1, s.b1, s.c1) + ' ; ' + eqStr(s.a2, s.b2, s.c2); bt.classList.toggle('active', i === S.p); bt.setAttribute('aria-pressed', i === S.p ? 'true' : 'false'); }); }
function render1() { const { ctx, w, h } = setup($('cv1')), s = PRESETS[S.p], x = +$('px').value, y = +$('py').value; $('pxv').textContent = x; $('pyv').textContent = y; markPresets(1); const g = plane(ctx, w, h, RG); drawEq(ctx, g, s.a1, s.b1, s.c1, COL.cyan, RG); drawEq(ctx, g, s.a2, s.b2, s.c2, COL.green, RG);
  const sol = solve(s); dot(ctx, g.X(sol.x), g.Y(sol.y), 4, COL.ink); dot(ctx, g.X(x), g.Y(y), 8, COL.orange); const r1 = residual(s.a1, s.b1, s.c1, x, y), r2 = residual(s.a2, s.b2, s.c2, x, y), ok = Math.abs(r1) < 1e-9 && Math.abs(r2) < 1e-9;
  $('ro1').textContent = t('s1ro', { e1: eqStr(s.a1, s.b1, s.c1), r1: fmt(r1), e2: eqStr(s.a2, s.b2, s.c2), r2: fmt(r2), res: t(ok ? 'bothOk' : 'notBoth') }); }
function work(id, steps, stage, nTotal) { const ol = $(id); ol.innerHTML = ''; steps.slice(0, stage + 1).forEach(st => { if (!st.k) return; const li = document.createElement('li'); const o = { ...st }; delete o.k; li.textContent = t(st.k, o); ol.appendChild(li); }); }
function render2() { const { ctx, w, h } = setup($('cv2')), s = PRESETS[S.p], sol = solve(s), st = subSteps(s), k = S.st2; markPresets(2); const g = plane(ctx, w, h, RG); drawEq(ctx, g, s.a1, s.b1, s.c1, COL.cyan, RG); drawEq(ctx, g, s.a2, s.b2, s.c2, COL.green, RG);
  if (k >= 4) { drawEq(ctx, g, 1, 0, sol.x, COL.orange, RG); } if (k >= 5) dot(ctx, g.X(sol.x), g.Y(sol.y), 7, COL.orange);
  work('work2', st, k, 7); $('b2').disabled = k <= 0; $('n2').disabled = k >= 6; $('ro2').textContent = k === 0 ? t('s2roStart') : t('s2ro', { k, x: fmt(sol.x), y: fmt(sol.y) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), s = PRESETS[S.p], sol = solve(s), st = elimSteps(s), k = S.st3; markPresets(3); const g = plane(ctx, w, h, RG); drawEq(ctx, g, s.a1, s.b1, s.c1, COL.cyan, RG); drawEq(ctx, g, s.a2, s.b2, s.c2, COL.green, RG);
  if (k >= 3) drawEq(ctx, g, 1, 0, st[6].vx, COL.orange, RG); if (k >= 4) dot(ctx, g.X(sol.x), g.Y(sol.y), 7, COL.orange);
  work('work3', st.slice(0, 6), k, 6); $('b3').disabled = k <= 0; $('n3').disabled = k >= 5; $('ro3').textContent = k === 0 ? t('s2roStart') : t('s3ro', { k, x: fmt(sol.x), y: fmt(sol.y) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), k = +$('k4').value, c = +$('c4').value; $('k4v').textContent = k; $('c4v').textContent = c; const rg = [-1, 10], g = plane(ctx, w, h, rg), s = { a1: 1, b1: 1, c1: 4, a2: k, b2: 1, c2: c }; drawEq(ctx, g, 1, 1, 4, COL.cyan, rg); drawEq(ctx, g, k, 1, c, COL.green, rg); const sol = solve(s), D = det(s);
  if (sol.kind === 'one') dot(ctx, g.X(sol.x), g.Y(sol.y), 7, COL.orange); $('ro4').textContent = t('s4ro', { e2: eqStr(k, 1, c), D: fmt(D), res: sol.kind === 'one' ? t('oneSol', { x: fmt(sol.x), y: fmt(sol.y) }) : t(sol.kind === 'none' ? 'noSol' : 'manySol') }); }
function render5() { const { ctx, w, h } = setup($('cv5')), p = +$('pa').value, q = +$('po').value; $('pav').textContent = p; $('pov').textContent = q; const t1 = 3 * p + 2 * q, t2 = 2 * p + 4 * q, s = { a1: 3, b1: 2, c1: t1, a2: 2, b2: 4, c2: t2 }, sol = solve(s), rg = [-1, 11], g = plane(ctx, w, h, rg);
  drawEq(ctx, g, 3, 2, t1, COL.cyan, rg); drawEq(ctx, g, 2, 4, t2, COL.green, rg); dot(ctx, g.X(sol.x), g.Y(sol.y), 7, COL.orange); text(ctx, 'p', g.L.x + g.L.w, g.Y(0) - 5, { align: 'right', size: 12, color: COL.ink });
  $('ro5').textContent = t('s5ro', { p, q, t1, t2, sp: fmt(sol.x), sq: fmt(sol.y), ok: Math.abs(sol.x - p) < 1e-9 && Math.abs(sol.y - q) < 1e-9 ? t('same') : '≠' }); }
function wire() {
  slider('x0', render0); presetButtons('pr1', 1); presetButtons('pr2', 2); presetButtons('pr3', 3); slider('px', render1); slider('py', render1); $('snap1').addEventListener('click', () => { const sol = solve(PRESETS[S.p]); $('px').value = sol.x; $('py').value = sol.y; render1(); });
  $('n2').addEventListener('click', () => { if (S.st2 < 6) S.st2++; render2(); }); $('b2').addEventListener('click', () => { if (S.st2 > 0) S.st2--; render2(); }); $('r2').addEventListener('click', () => { S.st2 = 0; render2(); });
  $('n3').addEventListener('click', () => { if (S.st3 < 5) S.st3++; render3(); }); $('b3').addEventListener('click', () => { if (S.st3 > 0) S.st3--; render3(); }); $('r3').addEventListener('click', () => { S.st3 = 0; render3(); });
  slider('k4', render4); slider('c4', render4); slider('pa', render5); slider('po', render5);
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
if (typeof module !== 'undefined') module.exports = { det,solve,residual,subSteps,elimSteps,eqStr,PRESETS };
