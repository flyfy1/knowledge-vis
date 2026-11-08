/* water-cycle: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const PARAMS = { ke20: 0.004, kp: 0.11, phi: 0.3, kr: 0.05, total: 1000, kg: 0.05 };
const es = T => 6.1078 * Math.pow(10, 7.5 * T / (T + 237.3));
const keOf = T => PARAMS.ke20 * es(T) / es(20);
/* Lifting condensation level in metres: temperature falls 9.8 C/km, dew point 1.8 C/km. */
const lcl = (T0, Td) => Math.max(0, (T0 - Td) / (9.8 - 1.8)) * 1000;
function steadyState(T) { const ke = keOf(T), P = PARAMS, O = P.total / (1 + ke / P.kp + P.phi * ke / P.kr); return { O, A: ke * O / P.kp, L: P.phi * ke * O / P.kr }; }
function stepBoxes(s, T, dt) { const P = PARAMS, E = keOf(T) * s.O, Pr = P.kp * s.A, R = P.kr * s.L; return { O: s.O + dt * (-E + (1 - P.phi) * Pr + R), A: s.A + dt * (E - Pr), L: s.L + dt * (P.phi * Pr - R) }; }
const returned = (f, n) => (1 - f) * 100 + f * 100 * (1 - Math.pow(1 - PARAMS.kg, n));
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100);
const S = { c: 0, n: 0, tot: 0, rainMsg: false, b: { O: 900, A: 20, L: 80 }, day: 0, hist: [{ day: 0, A: 20, L: 80 }], run: false, raf: 0, last: 0, acc: 0 };
const TH = 8;
function render0() { const { ctx, w, h, wide } = setup($('cv0')), T = +$('T0').value; $('T0v').textContent = T; const A = wide ? { x: 0, y: 0, w: w * 0.45, h } : { x: 0, y: 0, w, h: h * 0.5 }, B = wide ? { x: w * 0.47, y: 0, w: w * 0.53, h } : { x: 0, y: h * 0.5, w, h: h * 0.5 };
  dot(ctx, A.x + A.w * 0.8, A.y + A.h * 0.2, 14 + (T / 40) * 6, '#ffd966'); ctx.fillStyle = 'rgba(103,215,249,0.35)'; ctx.fillRect(A.x + 6, A.y + A.h * 0.72, A.w - 12, A.h * 0.26); const rel = es(T) / es(20), n = Math.round(rel * 6);
  for (let k = 0; k < Math.min(24, n); k++) { const x = A.x + 20 + (k * 53 % Math.max(40, A.w - 40)), y = A.y + A.h * 0.7 - ((k * 37) % 100) / 100 * A.h * 0.45; line(ctx, x, y, x, y - 12, COL.green, 2); dot(ctx, x, y - 14, 2.5, COL.green); }
  const L = { x: B.x + 34, y: B.y + 12, w: B.w - 50, h: B.h - 36 }, X = v => L.x + v / 40 * L.w, Y = v => L.y + L.h - v / 80 * L.h; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1);
  [0, 40, 80].forEach(v => text(ctx, String(v), L.x - 4, Y(v) + 4, { align: 'right', size: 10 })); [0, 20, 40].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 })); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); for (let v = 0; v <= 40; v++) v ? ctx.lineTo(X(v), Y(es(v))) : ctx.moveTo(X(v), Y(es(v))); ctx.stroke(); dot(ctx, X(T), Y(es(T)), 6, COL.orange);
  $('ro0').textContent = t('s0ro', { T, es: f1(es(T)), rel: f2(rel) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), T0 = +$('a1').value; $('a1v').textContent = T0; const bEl = $('b1'); const Td = Math.min(+bEl.value, T0); if (+bEl.value > T0) bEl.value = T0; $('b1v').textContent = Td;
  const L = { x: 40, y: 12, w: w - 56, h: h - 40 }, zmax = 6, tmin = -40, tmax = 45, X = T => L.x + (T - tmin) / (tmax - tmin) * L.w, Y = z => L.y + L.h - z / zmax * L.h; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 2, 4, 6].forEach(z => text(ctx, String(z), L.x - 4, Y(z) + 4, { align: 'right', size: 10 })); text(ctx, 'km', L.x - 4, L.y - 2, { align: 'right', size: 10 });
  line(ctx, X(T0), Y(0), X(T0 - 9.8 * zmax), Y(zmax), COL.orange, 2.5); line(ctx, X(Td), Y(0), X(Td - 1.8 * zmax), Y(zmax), COL.green, 2.5); const z = lcl(T0, Td) / 1000; if (z <= zmax) { const xT = X(T0 - 9.8 * z); ctx.fillStyle = 'rgba(230,240,250,0.85)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(xT - 30 + k * 18, Y(z) - 6 - (k % 2) * 6, 11, 0, 6.2832); ctx.fill(); } dot(ctx, xT, Y(z), 5, COL.ink); line(ctx, L.x, Y(z), L.x + L.w, Y(z), COL.muted, 1, [4, 4]); }
  text(ctx, '°C', L.x + L.w, L.y + L.h + 14, { align: 'right', size: 10 }); $('ro1').textContent = Td >= T0 ? t('s1roDry') : t('s1ro', { T0, Td, d: f1(T0 - Td), z: Math.round(lcl(T0, Td)), zk: f2(z) }); }
function cloud(ctx, cx, cy, r, fill) { ctx.fillStyle = fill; [[-1.1, 0.2, 0.7], [-0.4, -0.3, 0.9], [0.5, -0.2, 0.85], [1.2, 0.2, 0.65], [0.1, 0.35, 0.9]].forEach(a => { ctx.beginPath(); ctx.arc(cx + a[0] * r, cy + a[1] * r, a[2] * r, 0, 6.2832); ctx.fill(); }); }
function render2() { const { ctx, w, h } = setup($('cv2')), c = S.c, g = 200 - Math.round(c / TH * 120); cloud(ctx, w * 0.35, h * 0.3, Math.min(w, 400) * 0.09, 'rgb(' + g + ',' + g + ',' + (g + 20) + ')'); for (let k = 0; k < c; k++) dot(ctx, w * 0.35 - 40 + (k % 4) * 24, h * 0.3 - 6 + Math.floor(k / 4) * 16, 4, COL.cyan);
  if (S.rainMsg) for (let k = 0; k < 14; k++) line(ctx, w * 0.22 + k * 16, h * 0.55, w * 0.22 + k * 16 - 4, h * 0.55 + 22 + (k % 3) * 8, COL.cyan, 2); ctx.fillStyle = 'rgba(103,215,249,0.3)'; ctx.fillRect(w * 0.1, h * 0.88 - Math.min(0.3, S.tot * 0.01) * h, w * 0.8, Math.min(0.3, S.tot * 0.01) * h + 2); text(ctx, S.tot + '', w * 0.9, h * 0.86, { align: 'right', size: 12, color: COL.cyan, bold: true });
  const bx = w * 0.62, bw = w * 0.3; ctx.strokeStyle = COL.muted; ctx.lineWidth = 2; ctx.strokeRect(bx, h * 0.12, bw, h * 0.5); ctx.fillStyle = COL.cyan; ctx.fillRect(bx + 2, h * 0.62 - 2 - (h * 0.5 - 4) * c / TH, bw - 4, (h * 0.5 - 4) * c / TH); text(ctx, c + '/' + TH, bx + bw / 2, h * 0.12 - 4, { align: 'center', size: 12, color: COL.ink, bold: true });
  $('ro2').textContent = S.rainMsg ? t('s2roRain', { th: TH, c }) + ' ' + t('s2ro', { c, th: TH, n: S.n, tot: S.tot }) : t('s2ro', { c, th: TH, n: S.n, tot: S.tot }); }
function addVapor(k) { S.rainMsg = false; for (let i = 0; i < k; i++) { S.c++; if (S.c >= TH) { S.tot += S.c; S.n++; S.c = 0; S.rainMsg = true; } } render2(); }
function render3() { const { ctx, w, h } = setup($('cv3')), f = +$('f3').value / 100, d = +$('d3').value; $('f3v').textContent = Math.round(f * 100); $('d3v').textContent = d; const L = { x: 40, y: 12, w: w - 56, h: h - 40 }, X = v => L.x + v / 60 * L.w, Y = v => L.y + L.h - v / 100 * L.h;
  line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 50, 100].forEach(v => text(ctx, String(v), L.x - 4, Y(v) + 4, { align: 'right', size: 10 })); [0, 30, 60].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 })); text(ctx, t('day'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 10 });
  ctx.setLineDash([5, 4]); ctx.strokeStyle = COL.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), Y(100)); ctx.lineTo(X(60), Y(100)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); for (let n = 0; n <= 60; n++) { const y = Y(n === 0 ? 0 : returned(f, n)); n ? ctx.lineTo(X(n), y) : ctx.moveTo(X(n), y); } ctx.stroke(); dot(ctx, X(d), Y(d === 0 ? 0 : returned(f, d)), 6, COL.orange);
  const r = d === 0 ? 0 : returned(f, d), run = d === 0 ? 0 : (1 - f) * 100; $('ro3').textContent = t('s3ro', { f: Math.round(f * 100), d, r: f1(r), run: f1(run), gw: f1(r - run) }); }
function render4() { const { ctx, w, h, wide } = setup($('cv4')), T = +$('T4').value; $('T4v').textContent = T; const b = S.b, ss = steadyState(T), top = h * 0.2;
  const bx = 14, bw = w - 28; let x = bx; [['O', COL.cyan], ['A', COL.green], ['L', COL.orange]].forEach(([k, col]) => { const wd = b[k] / PARAMS.total * bw; ctx.fillStyle = col; ctx.fillRect(x, 14, wd, top - 8); if (wd > 28) text(ctx, k, x + wd / 2, 14 + (top - 8) / 2 + 5, { align: 'center', size: 13, color: '#0a0e14', bold: true }); x += wd; });
  text(ctx, f1(b.O + b.A + b.L), w - 14, 10, { align: 'right', size: 11, color: COL.ink });
  const L = { x: 40, y: h * 0.36, w: w - 56, h: h * 0.52 }, X = d => L.x + d / 300 * L.w, ymax = 100, Y = v => L.y + L.h - v / ymax * L.h; line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 50, 100].forEach(v => text(ctx, String(v), L.x - 4, Y(v) + 4, { align: 'right', size: 10 })); [0, 150, 300].forEach(v => text(ctx, String(v), X(v), L.y + L.h + 14, { align: 'center', size: 10 }));
  [['A', COL.green, ss.A], ['L', COL.orange, ss.L]].forEach(([k, col, st]) => { line(ctx, L.x, Y(st), L.x + L.w, Y(st), col, 1, [3, 4]); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); S.hist.forEach((p, i) => i ? ctx.lineTo(X(p.day), Y(p[k])) : ctx.moveTo(X(p.day), Y(p[k]))); ctx.stroke(); text(ctx, k, L.x + L.w + 2, Y(S.hist[S.hist.length - 1][k]) + 4, { size: 11, color: col, bold: true }); });
  $('play4').textContent = t(S.run ? 'pause' : 'play'); $('ro4').textContent = t('s4ro', { d: Math.round(S.day), o: f1(b.O), a: f1(b.A), l: f1(b.L), tot: f1(b.O + b.A + b.L), os: f1(ss.O), as: f1(ss.A), ls: f1(ss.L) }); }
function advance(days) { const T = +$('T4').value; let n = Math.round(days / 0.5); for (let i = 0; i < n && S.day < 300; i++) { S.b = stepBoxes(S.b, T, 0.5); S.day += 0.5; if (Math.round(S.day * 2) % 4 === 0) S.hist.push({ day: S.day, A: S.b.A, L: S.b.L }); } }
const stop4 = () => { S.run = false; cancelAnimationFrame(S.raf); };
function tick4(ts) { if (!S.run) return; advance(Math.min(0.1, (ts - S.last) / 1000) * 25); S.last = ts; if (S.day >= 300) S.run = false; render4(); if (S.run) S.raf = requestAnimationFrame(tick4); }
const onHide = () => { stop4(); render4(); };
function render5() { const { ctx, w, h } = setup($('cv5')), T = +$('T5').value; $('T5v').textContent = T; const temps = [10, 15, 20, 25, 30, 35], mx = steadyState(35).A, bw = (w - 60) / temps.length; temps.forEach((tt, i) => { const a = steadyState(tt).A, hh = a / mx * (h - 50), x = 30 + i * bw; ctx.fillStyle = Math.abs(tt - T) < 2.6 ? COL.orange : COL.cyan; ctx.fillRect(x + 6, h - 24 - hh, bw - 12, hh); text(ctx, f1(a), x + bw / 2, h - 28 - hh, { align: 'center', size: 11, color: COL.ink }); text(ctx, String(tt), x + bw / 2, h - 8, { align: 'center', size: 11 }); });
  const a = steadyState(T).A, a20 = steadyState(20).A; $('ro5').textContent = t('s5ro', { T, a: f1(a), a20: f1(a20), pct: f1((a / a20 - 1) * 100) }); }
function wire() {
  slider('T0', render0); slider('a1', render1); slider('b1', render1); $('v1').addEventListener('click', () => addVapor(1)); $('v5').addEventListener('click', () => addVapor(5)); $('reset2').addEventListener('click', () => { S.c = 0; S.n = 0; S.tot = 0; S.rainMsg = false; render2(); }); slider('f3', render3); slider('d3', render3);
  slider('T4', render4); $('play4').addEventListener('click', () => { if (S.run) { stop4(); render4(); return; } if (S.day >= 300) return; if (reduceMotion()) { advance(300); render4(); return; } S.run = true; S.last = performance.now(); S.raf = requestAnimationFrame(tick4); render4(); });
  $('reset4').addEventListener('click', () => { stop4(); S.b = { O: 900, A: 20, L: 80 }; S.day = 0; S.hist = [{ day: 0, A: 20, L: 80 }]; render4(); }); slider('T5', render5);
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
if (typeof module !== 'undefined') module.exports = { es,keOf,lcl,steadyState,stepBoxes,returned,PARAMS };
