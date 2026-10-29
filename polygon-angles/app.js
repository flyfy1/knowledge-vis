/* polygon-angles: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const isCCW = P => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a > 0; };
const norm = a => { while (a <= -Math.PI) a += 2 * Math.PI; while (a > Math.PI) a -= 2 * Math.PI; return a; };
/* Signed turning angle (radians, left turn positive for CCW) at each vertex. */
function turns(P) { const ccw = isCCW(P), n = P.length; return P.map((p, i) => { const a = P[(i + n - 1) % n], b = P[(i + 1) % n], h1 = Math.atan2(p[1] - a[1], p[0] - a[0]), h2 = Math.atan2(b[1] - p[1], b[0] - p[0]); const d = norm(h2 - h1); return ccw ? d : -d; }); }
const exteriorAngles = P => turns(P).map(d => d * 180 / Math.PI);
const interiorAngles = P => exteriorAngles(P).map(e => 180 - e);
const regularPoly = (n, R, cx, cy) => Array.from({ length: n }, (_, k) => [(cx || 0) + R * Math.cos(Math.PI / 2 + 2 * Math.PI * k / n), (cy || 0) + R * Math.sin(Math.PI / 2 + 2 * Math.PI * k / n)]).reverse();
const jitterPoly = (n, R) => Array.from({ length: n }, (_, k) => { const a = Math.PI / 2 + 2 * Math.PI * k / n + 0.32 * (2 * Math.PI / n) * Math.sin(5 * k + 1); return [R * Math.cos(a), R * Math.sin(a)]; }).reverse();
const sumFormula = n => (n - 2) * 180;
const nFromAngle = a => 360 / (180 - a);
const f1 = v => String(Math.round(v * 10) / 10), f0 = v => String(Math.round(v));
const sum = a => a.reduce((s, v) => s + v, 0);
const S = { irr: false };
const X = (box, v) => box.x + v, Y = (box, v) => box.y + box.h - v;
function wedge(ctx, box, x, y, r, a0, sw, col) { ctx.beginPath(); ctx.moveTo(box.x + x, box.y + box.h - y); ctx.arc(box.x + x, box.y + box.h - y, r, -a0, -(a0 + sw), true); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 1; ctx.stroke(); }
function polyDraw(ctx, box, P, fill, stroke, sc, ox, oy) { ctx.beginPath(); P.forEach((p, i) => { const x = ox + p[0] * sc, y = oy - p[1] * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
const COLS3 = ['rgba(246,164,91,0.8)', 'rgba(103,215,249,0.8)', 'rgba(116,223,170,0.8)'];
function render0() { const { ctx, w, h } = setup($('cv0')), cx = +$('cx0').value, cy = +$('cy0').value, jn = +$('j0').value; $('cx0v').textContent = cx; $('cy0v').textContent = cy; $('j0v').textContent = jn; const P = [[0, 0], [5, 0], [cx, cy]], sc = Math.min((w - 40) / 5.5, (h * 0.6) / 4), ox = 20, oy = h - 12, ang = interiorAngles(P);
  const box = { x: ox, y: oy - h * 0.99, w: 0, h: h * 0.99 }; const px = (x, y) => [x * sc, y * sc]; polyDraw(ctx, box, P, 'rgba(103,215,249,0.12)', COL.muted, sc, ox, oy); const ccw = isCCW(P), pts = ccw ? P : P.slice().reverse(), an = ccw ? ang : ang.slice().reverse(), n = 3; const B = { x: 0, y: 0, w: w, h: h }; const r = Math.min(58, sc * 1.1); let cum = 0; const Px = (w - 40) * 0.62 + 20, Py = 0.3 * h;
  for (let i = 0; i < 3; i++) { const v = pts[i], nx = pts[(i + 1) % 3], phi0 = Math.atan2(nx[1] - v[1], nx[0] - v[0]), sw = an[i] * Math.PI / 180, target = cum, cur = phi0 + norm(target - phi0) * jn, vx = ox + v[0] * sc, vy = oy - v[1] * sc; const cxp = vx + (Px - vx) * jn, cyp = vy + (Py - vy) * jn;
    ctx.beginPath(); ctx.moveTo(cxp, cyp); ctx.arc(cxp, cyp, r, -cur, -(cur + sw), true); ctx.closePath(); ctx.fillStyle = COLS3[i]; ctx.fill(); ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 1; ctx.stroke(); text(ctx, f0(an[i]) + '°', cxp + Math.cos(-(cur + sw / 2)) * (r + 12), cyp + Math.sin(-(cur + sw / 2)) * (r + 12), { align: 'center', size: 11, color: COLS3[i] }); cum += sw; }
  if (jn > 0.98) line(ctx, Px - r - 24, Py, Px + r + 24, Py, COL.ink, 2); $('ro0').textContent = t('s0ro', { a: f1(ang[0]), b: f1(ang[1]), c: f1(ang[2]), s: f1(sum(ang)) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), dx = +$('dx1').value, dy = +$('dy1').value; $('dx1v').textContent = dx; $('dy1v').textContent = dy; const P = [[0, 0], [5, 0], [4.4, 3.2], [dx, dy]], sc = Math.min((w - 40) / 5.5, (h - 30) / 4.8), ox = 20, oy = h - 14, ang = interiorAngles(P);
  polyDraw(ctx, null, [P[0], P[1], P[2]], 'rgba(246,164,91,0.28)', null, sc, ox, oy); polyDraw(ctx, null, [P[0], P[2], P[3]], 'rgba(103,215,249,0.28)', null, sc, ox, oy); polyDraw(ctx, null, P, null, COL.ink, sc, ox, oy); line(ctx, ox, oy, ox + 4.4 * sc, oy - 3.2 * sc, COL.green, 2, [5, 4]);
  P.forEach((p, i) => { text(ctx, ['A', 'B', 'C', 'D'][i] + ' ' + f0(ang[i]) + '°', ox + p[0] * sc + (i === 1 || i === 2 ? 8 : -8), oy - p[1] * sc + (i < 2 ? 16 : -8), { size: 12, color: COL.ink, align: i === 1 || i === 2 ? 'left' : 'right', bold: true }); });
  $('ro1').textContent = t('s1ro', { a: f1(ang[0]), b: f1(ang[1]), c: f1(ang[2]), d: f1(ang[3]), s: f1(sum(ang)), t: 360 }); }
function render2() { const { ctx, w, h } = setup($('cv2')), n = +$('n2').value; $('n2v').textContent = n; const R = Math.min(w, h) * 0.42, P = regularPoly(n, 1), ang = interiorAngles(P), sc = R, ox = w / 2, oy = h / 2 + 2;
  for (let k = 1; k < n - 1; k++) polyDraw(ctx, null, [P[0], P[k], P[k + 1]], k % 2 ? 'rgba(246,164,91,0.35)' : 'rgba(103,215,249,0.35)', null, sc, ox, oy); polyDraw(ctx, null, P, null, COL.ink, sc, ox, oy); for (let k = 2; k < n - 1; k++) line(ctx, ox + P[0][0] * sc, oy - P[0][1] * sc, ox + P[k][0] * sc, oy - P[k][1] * sc, COL.green, 1.5);
  $('ro2').textContent = t('s2ro', { n, k: n - 2, f: sumFormula(n), s: f1(sum(ang)), each: f1(sum(ang) / n) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), n = +$('n3').value; $('n3v').textContent = n; $('reg3').classList.toggle('active', !S.irr); $('irr3').classList.toggle('active', S.irr); $('reg3').setAttribute('aria-pressed', S.irr ? 'false' : 'true'); $('irr3').setAttribute('aria-pressed', S.irr ? 'true' : 'false'); $('w3').max = n;
  const wk = Math.min(+$('w3').value, n); $('w3v').textContent = wk; const P = S.irr ? jitterPoly(n, 1) : regularPoly(n, 1), ext = exteriorAngles(P), sc = Math.min(w, h) * 0.34, ox = w * 0.38, oy = h / 2 + 4; polyDraw(ctx, null, P, 'rgba(103,215,249,0.1)', COL.muted, sc, ox, oy);
  const Q = i => [ox + P[i][0] * sc, oy - P[i][1] * sc]; const done = Math.floor(wk + 1e-9); for (let i = 0; i < n; i++) { const a = Q((i + n - 1) % n), p = Q(i), ang = Math.atan2(p[1] - a[1], p[0] - a[0]), ex = ext[i] * Math.PI / 180; const col = i < done ? COL.orange : COL.dim; const len = 22; line(ctx, p[0], p[1], p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len, col, 1.5, [3, 3]); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p[0], p[1], 15, ang, ang + ex, false); ctx.stroke(); }
  const k = Math.floor(wk), fr = wk - k, a = Q(k % n), b = Q((k + 1) % n); dot(ctx, a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr, 6, COL.green);
  const cum = sum(ext.slice(0, Math.min(done, n))); const cx2 = w * 0.84, cy2 = h * 0.5, rr = Math.min(w, h) * 0.16; ctx.strokeStyle = COL.dim; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx2, cy2, rr, 0, 6.2832); ctx.stroke(); ctx.strokeStyle = COL.orange; ctx.beginPath(); ctx.arc(cx2, cy2, rr, -Math.PI / 2, -Math.PI / 2 + cum * Math.PI / 180); ctx.stroke(); text(ctx, f0(cum) + '°', cx2, cy2 + 5, { align: 'center', size: 15, color: COL.ink, bold: true });
  $('ro3').textContent = t('s3ro', { n, k: done, cum: f1(cum), tot: f1(sum(ext)) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), d = +$('p4').value; $('p4v').textContent = d; const base = regularPoly(5, 1), P = base.map((p, i) => i === 2 ? [p[0] * (1 - 0.95 * d), p[1] * (1 - 0.95 * d)] : p), ang = interiorAngles(P), sc = Math.min(w, h) * 0.4, ox = w / 2, oy = h / 2 + 6; polyDraw(ctx, null, P, 'rgba(103,215,249,0.2)', COL.ink, sc, ox, oy);
  const mx = Math.max.apply(null, ang); P.forEach((p, i) => { const px = ox + p[0] * sc, py = oy - p[1] * sc, dxv = p[0] * 1.0, dyv = p[1] * 1.0, mg = Math.hypot(dxv, dyv) || 1; text(ctx, f0(ang[i]) + '°', px + dxv / mg * 24 * (i === 2 ? -1 : 1), py - dyv / mg * 18 * (i === 2 ? -1 : 1) + 4, { align: 'center', size: 12, color: ang[i] > 180 ? COL.red : COL.ink, bold: true }); });
  $('ro4').textContent = t('s4ro', { angles: ang.map(f0).join('°, ') + '°', s: f1(sum(ang)), mx: f1(mx), kind: t(mx > 180 ? 'kindReflex' : 'kindConvex') }); }
function render5() { const { ctx, w, h } = setup($('cv5')), a = +$('a5').value; $('a5v').textContent = a; const e = 180 - a, nn = nFromAngle(a), ok = Math.abs(nn - Math.round(nn)) < 1e-9;
  if (ok) { const n = Math.round(nn), P = regularPoly(n, 1), sc = Math.min(w, h) * 0.38; polyDraw(ctx, null, P, 'rgba(116,223,170,0.25)', COL.green, sc, w / 2, h / 2 + 4); $('ro5').textContent = t('s5roYes', { a, e, n }); } else { text(ctx, '?', w / 2, h / 2 + 14, { align: 'center', size: 48, color: COL.muted }); $('ro5').textContent = t('s5roNo', { a, e, nn: f1(nn) }); } }
function wire() {
  ['cx0', 'cy0', 'j0'].forEach(id => slider(id, render0)); slider('dx1', render1); slider('dy1', render1); slider('n2', render2); $('reg3').addEventListener('click', () => { S.irr = false; render3(); }); $('irr3').addEventListener('click', () => { S.irr = true; render3(); }); slider('n3', render3); slider('w3', render3); slider('p4', render4); slider('a5', render5);
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
if (typeof module !== 'undefined') module.exports = { interiorAngles,regularPoly,jitterPoly,sumFormula,nFromAngle,isCCW,exteriorAngles };
