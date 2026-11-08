/* vectors: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const mag = v => Math.hypot(v[0], v[1]), angDeg = v => Math.atan2(v[1], v[0]) * 180 / Math.PI;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], scale = (k, a) => [k * a[0], k * a[1]];
const dotp = (a, b) => a[0] * b[0] + a[1] * b[1];
const angleBetween = (a, b) => { const m = mag(a) * mag(b); return m === 0 ? 0 : Math.acos(Math.max(-1, Math.min(1, dotp(a, b) / m))) * 180 / Math.PI; };
const proj = (a, b) => { const bb = dotp(b, b); return bb === 0 ? [0, 0] : scale(dotp(a, b) / bb, b); };
/* A weight W hangs from two ropes, each making angle theta with the horizontal: equilibrium needs 2 T sin(theta) = W. */
const tension = (W, thDeg) => W / (2 * Math.sin(thDeg * Math.PI / 180));
/* Boat of speed s heading at angle h from the bank-perpendicular (towards upstream positive) in a river of current c, width wd. */
function river(s, h, c, wd) { const hr = h * Math.PI / 180, vx = c - s * Math.sin(hr), vy = s * Math.cos(hr), tt = vy > 0 ? wd / vy : Infinity; return { vx, vy, t: tt, drift: vx * tt, speed: Math.hypot(vx, vy) }; }
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100);
const S = { ax: 3, ay: 2, bx: 1, by: 3, k: 2, ang: 60, wt: 40, th: 35, hd: 0 };
function grid(ctx, w, h, range) { const R = { x: 14, y: 12, w: w - 28, h: h - 28 }, sx = R.w / (2 * range[0]), sy = R.h / (2 * range[1]), s = Math.min(sx, sy), ox = R.x + R.w / 2, oy = R.y + R.h / 2, P = v => [ox + v[0] * s, oy - v[1] * s]; ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; for (let i = -range[0]; i <= range[0]; i++) line(ctx, ox + i * s, R.y, ox + i * s, R.y + R.h, 'rgba(41,64,82,0.6)', 1); for (let j = -range[1]; j <= range[1]; j++) line(ctx, R.x, oy - j * s, R.x + R.w, oy - j * s, 'rgba(41,64,82,0.6)', 1); line(ctx, R.x, oy, R.x + R.w, oy, COL.muted, 1.5); line(ctx, ox, R.y, ox, R.y + R.h, COL.muted, 1.5); return { P, s, ox, oy }; }
function arrow(ctx, a, b, col, lw, label) { if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 2) return; line(ctx, a[0], a[1], b[0], b[1], col, lw || 3); const an = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - 10 * Math.cos(an - 0.4), b[1] - 10 * Math.sin(an - 0.4)); ctx.lineTo(b[0] - 10 * Math.cos(an + 0.4), b[1] - 10 * Math.sin(an + 0.4)); ctx.closePath(); ctx.fill(); if (label) text(ctx, label, b[0] + 6, b[1] - 6, { size: 13, color: col, bold: true }); }
function render0() { const { ctx, w, h } = setup($('cv0')), G = grid(ctx, w, h, [6, 4]), a = [S.ax, S.ay], O = G.P([0, 0]); line(ctx, O[0], O[1], G.P([a[0], 0])[0], G.P([a[0], 0])[1], COL.cyan, 2, [5, 4]); line(ctx, G.P([a[0], 0])[0], G.P([a[0], 0])[1], G.P(a)[0], G.P(a)[1], COL.green, 2, [5, 4]); arrow(ctx, O, G.P(a), COL.orange, 4, 'a'); text(ctx, 'aₓ = ' + a[0], G.P([a[0] / 2, 0])[0], G.P([0, 0])[1] + 18, { align: 'center', size: 12, color: COL.cyan }); text(ctx, 'a_y = ' + a[1], G.P([a[0], a[1] / 2])[0] + 8, G.P([a[0], a[1] / 2])[1], { size: 12, color: COL.green });
  $('ax0v').textContent = a[0]; $('ay0v').textContent = a[1]; $('ro0').textContent = t('s0ro', { x: a[0], y: a[1], m: f2(mag(a)), an: f1(angDeg(a)), chk: f2(Math.sqrt(a[0] * a[0] + a[1] * a[1])) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), G = grid(ctx, w, h, [8, 6]), a = [S.ax, S.ay], b = [S.bx, S.by], c = add(a, b), O = G.P([0, 0]); const ab = G.P(add(a, b)); line(ctx, G.P(a)[0], G.P(a)[1], ab[0], ab[1], 'rgba(246,164,91,0.45)', 2, [5, 4]); line(ctx, G.P(b)[0], G.P(b)[1], ab[0], ab[1], 'rgba(103,215,249,0.45)', 2, [5, 4]);
  arrow(ctx, O, G.P(a), COL.cyan, 3, 'a'); arrow(ctx, G.P(a), ab, COL.orange, 3, 'b'); arrow(ctx, O, G.P(b), COL.orange, 2, ''); arrow(ctx, O, ab, COL.green, 4, 'a+b'); $('ax1v').textContent = a[0]; $('ay1v').textContent = a[1]; $('bx1v').textContent = b[0]; $('by1v').textContent = b[1];
  $('ro1').textContent = t('s1ro', { ax: a[0], ay: a[1], bx: b[0], by: b[1], cx: c[0], cy: c[1], m: f2(mag(c)), tri: f2(mag(a) + mag(b)), cmp: mag(c) <= mag(a) + mag(b) + 1e-9 ? t('yes') : t('no') }); }
function render2() { const { ctx, w, h } = setup($('cv2')), G = grid(ctx, w, h, [8, 6]), a = [S.ax, S.ay], b = [S.bx, S.by], k = S.k, O = G.P([0, 0]); arrow(ctx, O, G.P(a), COL.cyan, 3, 'a'); arrow(ctx, O, G.P(scale(k, a)), COL.orange, 3, k + 'a'); arrow(ctx, O, G.P(b), COL.violet, 2, 'b'); arrow(ctx, O, G.P(sub(a, b)), COL.green, 3, 'a − b'); const nb = scale(-1, b); line(ctx, G.P(a)[0], G.P(a)[1], G.P(add(a, nb))[0], G.P(add(a, nb))[1], 'rgba(176,156,255,0.6)', 2, [4, 3]);
  $('k2v').textContent = k; $('ro2').textContent = t('s2ro', { k, kx: f2(k * a[0]), ky: f2(k * a[1]), m: f2(mag(scale(k, a))), ma: f2(mag(a)), dx: f2(a[0] - b[0]), dy: f2(a[1] - b[1]), dir: t(k > 0 ? 'same' : k < 0 ? 'opposite' : 'zeroV') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), G = grid(ctx, w, h, [6, 4]), a = [4, 0], th = S.ang * Math.PI / 180, b = [3 * Math.cos(th), 3 * Math.sin(th)], O = G.P([0, 0]), p = proj(b, a); line(ctx, G.P(b)[0], G.P(b)[1], G.P(p)[0], G.P(p)[1], COL.muted, 1.5, [4, 3]); arrow(ctx, O, G.P(a), COL.cyan, 3, 'a'); arrow(ctx, O, G.P(b), COL.orange, 3, 'b'); if (Math.abs(p[0]) > 0.02) arrow(ctx, [O[0], O[1] + 14], [G.P(p)[0], O[1] + 14], COL.green, 4, '');
  text(ctx, t('projLab'), G.P([p[0] / 2, 0])[0], O[1] + 34, { align: 'center', size: 11, color: COL.green }); ctx.strokeStyle = COL.violet; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(O[0], O[1], 30, 0, -th, th > 0); ctx.stroke(); text(ctx, S.ang + '°', O[0] + 36 * Math.cos(th / 2), O[1] - 36 * Math.sin(th / 2), { size: 12, color: COL.violet });
  $('ang3v').textContent = S.ang; const d = dotp(a, b); $('ro3').textContent = t('s3ro', { ang: S.ang, d: f2(d), mm: f2(mag(a) * mag(b) * Math.cos(th)), comp: f2(a[0] * b[0] + a[1] * b[1]), p: f2(p[0]), kind: t(Math.abs(d) < 1e-9 ? 'perp' : d > 0 ? 'acute' : 'obtuse') }); }
function render4() { const { ctx, w, h } = setup($('cv4')), G = grid(ctx, w, h, [6, 4]), W = S.wt, th = S.th, T = tension(W, th), r = th * Math.PI / 180, sc = 0.05, O = G.P([0, 0]), tl = [-T * Math.cos(r), T * Math.sin(r)], tr = [T * Math.cos(r), T * Math.sin(r)], wv = [0, -W];
  line(ctx, G.P([-5.6, 3.6])[0], G.P([-5.6, 3.6])[1], G.P([5.6, 3.6])[0], G.P([5.6, 3.6])[1], COL.muted, 3); const A = G.P([-3.2, 0.9]), B2 = G.P([3.2, 0.9]); [-1, 1].forEach(sg => { const Lr = 3.6 / Math.sin(r), ex = Math.max(-5.6, Math.min(5.6, sg * Lr * Math.cos(r))), ey = ex === sg * Lr * Math.cos(r) ? 3.6 : Math.abs(ex) * Math.tan(r); line(ctx, O[0], O[1], G.P([ex, ey])[0], G.P([ex, ey])[1], COL.muted, 2); }); dot(ctx, O[0], O[1], 8, COL.ink); const kk = Math.min(0.06, 1.8 / Math.max(T, W)); arrow(ctx, O, [O[0] + tl[0] * kk * G.s, O[1] - tl[1] * kk * G.s], COL.cyan, 3, 'T₁'); arrow(ctx, O, [O[0] + tr[0] * kk * G.s, O[1] - tr[1] * kk * G.s], COL.orange, 3, 'T₂'); arrow(ctx, O, [O[0], O[1] + W * kk * G.s], COL.red, 3, 'W');
  const q1 = [O[0] + tl[0] * kk * G.s, O[1] - tl[1] * kk * G.s]; const t2 = [q1[0] + tr[0] * kk * G.s, q1[1] - tr[1] * kk * G.s]; ctx.globalAlpha = 0.5; arrow(ctx, [w * 0.82, h * 0.25], [w * 0.82 + tl[0] * kk * G.s * 0.5, h * 0.25 - tl[1] * kk * G.s * 0.5], COL.cyan, 2, ''); arrow(ctx, [w * 0.82 + tl[0] * kk * G.s * 0.5, h * 0.25 - tl[1] * kk * G.s * 0.5], [w * 0.82 + (tl[0] + tr[0]) * kk * G.s * 0.5, h * 0.25 - (tl[1] + tr[1]) * kk * G.s * 0.5], COL.orange, 2, ''); arrow(ctx, [w * 0.82 + (tl[0] + tr[0]) * kk * G.s * 0.5, h * 0.25 - (tl[1] + tr[1]) * kk * G.s * 0.5], [w * 0.82, h * 0.25], COL.red, 2, ''); ctx.globalAlpha = 1; text(ctx, t('closed'), w * 0.82, h * 0.25 + 22, { align: 'center', size: 11, color: COL.muted });
  $('wt4v').textContent = W; $('th4v').textContent = th; const net = add(add(tl, tr), wv); $('ro4').textContent = t('s4ro', { W, th, T: f1(T), sx: f2(tl[0] + tr[0]), sy: f2(tl[1] + tr[1] - W), ratio: f2(T / W), note: t(th < 15 ? 'flat' : 'normal') }); }
function render5() { const { ctx, w, h } = setup($('cv5')), s = 4, c = 2, wd = 60, hd = S.hd, r = river(s, hd, c, wd), R = { x: 24, y: 24, w: w - 48, h: h - 70 }, X = d => R.x + R.w / 2 + d * R.w / 80, Y = y => R.y + R.h - y / wd * R.h; ctx.fillStyle = 'rgba(78,131,170,0.18)'; ctx.fillRect(R.x, R.y, R.w, R.h); line(ctx, R.x, R.y, R.x + R.w, R.y, COL.green, 3); line(ctx, R.x, R.y + R.h, R.x + R.w, R.y + R.h, COL.green, 3);
  for (let i = 1; i < 6; i++) arrow(ctx, [R.x + 20, R.y + R.h * i / 6], [R.x + 20 + c * 14, R.y + R.h * i / 6], 'rgba(103,215,249,0.55)', 2, ''); const x0 = X(0), y0 = Y(0), k = R.h / wd; text(ctx, t('current', { c }), R.x + 4, R.y + 14, { size: 11, color: COL.cyan }); text(ctx, t('far'), R.x + R.w - 4, R.y - 6, { align: 'right', size: 11, color: COL.green });
  const hr = hd * Math.PI / 180, sh = [-s * Math.sin(hr), s * Math.cos(hr)]; arrow(ctx, [x0, y0], [x0 + sh[0] * 12, y0 - sh[1] * 12], COL.orange, 3, t('lblBoat')); arrow(ctx, [x0, y0], [x0 + c * 12, y0], COL.cyan, 2, ''); if (isFinite(r.t)) { arrow(ctx, [x0, y0], [x0 + r.drift * R.w / 80, R.y], COL.green, 4, t('lblActual')); text(ctx, t('drift', { d: f1(r.drift) }), (x0 + x0 + r.drift * R.w / 80) / 2, R.y + R.h / 2, { size: 11, color: COL.green }); }
  $('hd5v').textContent = hd; $('ro5').textContent = isFinite(r.t) ? t('s5ro', { s, c, hd, vx: f2(r.vx), vy: f2(r.vy), sp: f2(r.speed), t: f1(r.t), d: f1(r.drift), wd }) : t('s5roNo', { hd }); }
function wire() { ['ax0', 'ay0'].forEach(id => slider(id, v => { S[id === 'ax0' ? 'ax' : 'ay'] = v; syncAB(); renderAll(); })); ['ax1', 'ay1', 'bx1', 'by1'].forEach(id => slider(id, v => { S[id.slice(0, 2)] = v; syncAB(); renderAll(); })); slider('k2', v => { S.k = v; render2(); }); slider('ang3', v => { S.ang = v; render3(); }); slider('wt4', v => { S.wt = v; render4(); }); slider('th4', v => { S.th = v; render4(); }); slider('hd5', v => { S.hd = v; render5(); }); }
function syncAB() { [['ax0', S.ax], ['ay0', S.ay], ['ax1', S.ax], ['ay1', S.ay], ['bx1', S.bx], ['by1', S.by]].forEach(([id, v]) => { $(id).value = v; $(id + 'v').textContent = v; }); }

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
if (typeof module !== 'undefined') module.exports = { mag, angDeg, add, sub, scale, dotp, angleBetween, proj, tension, river };
