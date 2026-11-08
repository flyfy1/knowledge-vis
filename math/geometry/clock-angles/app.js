/* clock-angles: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const hourAngle = t => (0.5 * t) % 360, minuteAngle = t => (6 * t) % 360;
const angleBetween = t => { const d = Math.abs(hourAngle(t) - minuteAngle(t)); return Math.min(d, 360 - d); };
/* Times in [0,720) minutes at which the smaller angle equals theta (0..180). */
function crossings(theta) { const out = []; for (let k = 0; k <= 11; k++) [theta, 360 - theta].forEach(a => { const t = (a + 360 * k) / 5.5; if (t >= 0 && t < 720 - 1e-9 && out.every(o => Math.abs(o - t) > 1e-9)) out.push(t); }); return out.sort((a, b) => a - b); }
function fmtTime(t) { const sec = Math.round(t * 60), h = Math.floor(sec / 3600) % 12 || 12, m = Math.floor(sec / 60) % 60, s = sec % 60; return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }
const fmtHM = t => { const h = Math.floor(t / 60) % 12 || 12, m = t - Math.floor(t / 60) * 60; return h + ':' + (m < 10 ? '0' : '') + (Math.round(m * 100) / 100); };
const solveInHour = (h, theta) => { const hh = h % 12; return crossings(theta).filter(t => t >= 60 * hh - 1e-9 && t < 60 * hh + 60 - 1e-9).map(t => t - 60 * hh); };
const CHALLENGES = [185, 95, 310, 415, 550, 645];
const r1 = v => String(Math.round(v * 10) / 10), r2 = v => String(Math.round(v * 100) / 100);
const S = { t3: 0, playing: false, raf: 0, last: 0, c5: 0, checked: false };
function drawClock(ctx, cx, cy, R, t, o) {
  o = o || {}; ctx.fillStyle = '#0f1c29'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, l = i % 5 ? 4 : 9; line(ctx, cx + Math.sin(a) * (R - l), cy - Math.cos(a) * (R - l), cx + Math.sin(a) * R, cy - Math.cos(a) * R, COL.muted, i % 5 ? 1 : 2); }
  for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; text(ctx, String(i), cx + Math.sin(a) * (R - 22), cy - Math.cos(a) * (R - 22) + 5, { align: 'center', size: Math.max(11, R / 8), color: COL.ink }); }
  const ah = hourAngle(t) * Math.PI / 180, am = minuteAngle(t) * Math.PI / 180;
  if (o.arc) { const a1 = ah - Math.PI / 2, a2 = am - Math.PI / 2, d = ((am - ah) % 6.2832 + 6.2832) % 6.2832; ctx.fillStyle = 'rgba(183,156,255,0.28)'; ctx.beginPath(); ctx.moveTo(cx, cy); if (d <= Math.PI) ctx.arc(cx, cy, R * 0.45, a1, a2); else ctx.arc(cx, cy, R * 0.45, a2, a1); ctx.closePath(); ctx.fill(); }
  if (o.sweep) { ctx.strokeStyle = COL.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R * 0.3, -Math.PI / 2, ah - Math.PI / 2); ctx.stroke(); ctx.strokeStyle = COL.cyan; ctx.beginPath(); ctx.arc(cx, cy, R * 0.62, -Math.PI / 2, (am - Math.PI / 2) - (am === 0 ? 0 : 0)); ctx.stroke(); }
  line(ctx, cx, cy, cx + Math.sin(ah) * R * 0.5, cy - Math.cos(ah) * R * 0.5, COL.orange, 6); line(ctx, cx, cy, cx + Math.sin(am) * R * 0.8, cy - Math.cos(am) * R * 0.8, COL.cyan, 3.5); dot(ctx, cx, cy, 5, COL.ink);
}
const split = (w, h, wide) => wide ? [{ x: 0, y: 0, w: w * 0.42, h }, { x: w * 0.44, y: 0, w: w * 0.56, h }] : [{ x: 0, y: 0, w, h: h * 0.52 }, { x: 0, y: h * 0.52, w, h: h * 0.48 }];
function render0() { const { ctx, w, h } = setup($('cv0')), tm = +$('t0').value; $('t0v').textContent = tm; drawClock(ctx, w / 2, h / 2, Math.min(w, h) / 2 - 8, tm, { sweep: true });
  $('ro0').textContent = t('s0ro', { time: fmtTime(tm), t: tm, mb: r1(minuteAngle(tm)), hb: r1(hourAngle(tm)) }); }
function render1() { const { ctx, w, h, wide } = setup($('cv1')), hr = +$('h1').value, m = +$('m1').value; $('h1v').textContent = hr; $('m1v').textContent = m; const tm = (hr % 12) * 60 + m;
  drawClock(ctx, w / 2, h / 2, Math.min(w, h) / 2 - 8, tm, { arc: true }); const raw = Math.abs(hourAngle(tm) - minuteAngle(tm));
  $('ro1').textContent = t('s1ro', { time: hr + ':' + String(m).padStart(2, '0'), hb: r1(hourAngle(tm)), mb: r1(minuteAngle(tm)), raw: r1(raw), ang: r1(angleBetween(tm)) }); }
function plot2(ctx, box, t, target, marks) { const L = { x: box.x + 34, y: box.y + 14, w: box.w - 46, h: box.h - 40 }, X = v => L.x + v / 720 * L.w, Y = a => L.y + L.h - a / 180 * L.h;
  line(ctx, L.x, L.y, L.x, L.y + L.h, COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, COL.grid, 1); [0, 90, 180].forEach(a => text(ctx, String(a), L.x - 5, Y(a) + 4, { align: 'right', size: 11 })); for (let k = 0; k <= 12; k += 3) text(ctx, String(k), X(k * 60), L.y + L.h + 14, { align: 'center', size: 11 });
  line(ctx, L.x, Y(target), L.x + L.w, Y(target), COL.orange, 1.2, [5, 4]); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 720; i += 2) { const px = X(i), py = Y(angleBetween(i)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
  marks.forEach(m => dot(ctx, X(m.t), Y(m.a), m.r || 3, m.c)); dot(ctx, X(t), Y(angleBetween(t)), 6, COL.ink); }
function render2() { const { ctx, w, h, wide } = setup($('cv2')), tm = +$('t2').value; $('t2v').textContent = tm; const [a, b] = split(w, h, wide); drawClock(ctx, a.x + a.w / 2, a.y + a.h / 2, Math.min(a.w, a.h) / 2 - 8, tm, { arc: true });
  const cr = crossings(90); plot2(ctx, b, tm, 90, cr.map(x => ({ t: x, a: 90, c: x <= tm ? COL.green : COL.orange, r: 4 })));
  const nx = cr.find(x => x > tm + 1e-9); $('ro2').textContent = t('s2ro', { time: fmtTime(tm), ang: r1(angleBetween(tm)), n: cr.length, next: nx === undefined ? fmtTime(cr[0]) : fmtTime(nx) }); }
const overlaps = () => crossings(0);
function render3() { const { ctx, w, h, wide } = setup($('cv3')), tm = S.t3, [a, b] = split(w, h, wide), ov = overlaps(); drawClock(ctx, a.x + a.w / 2, a.y + a.h / 2, Math.min(a.w, a.h) / 2 - 8, tm, {});
  const L = { x: b.x + 14, y: b.y + b.h * 0.45, w: b.w - 28 }, X = v => L.x + v / 720 * L.w; line(ctx, L.x, L.y, L.x + L.w, L.y, COL.grid, 3); line(ctx, X(tm), L.y - 16, X(tm), L.y + 16, COL.ink, 2);
  ov.forEach(x => { const on = x <= tm + 1e-9; dot(ctx, X(x), L.y, on ? 8 : 5, on ? COL.green : COL.dim); }); for (let k = 0; k <= 12; k += 3) text(ctx, String(k), X(k * 60), L.y + 34, { align: 'center', size: 11 });
  const c = ov.filter(x => x <= tm + 1e-9).length; $('ro3').textContent = t('s3ro', { time: fmtTime(tm), ang: r1(angleBetween(tm)), c, tot: ov.length });
  $('play3').textContent = S.playing ? t('pause') : t('play'); $('k3v').textContent = $('k3').value; }
function tick3(ts) { if (!S.playing) return; const dt = Math.min(0.1, (ts - S.last) / 1000); S.last = ts; S.t3 += dt * 60; if (S.t3 >= 719.99) { S.t3 = 719.99; S.playing = false; } render3(); if (S.playing) S.raf = requestAnimationFrame(tick3); }
function stop3() { S.playing = false; cancelAnimationFrame(S.raf); }
function onHide() { stop3(); render3(); }
function render4() { const { ctx, w, h, wide } = setup($('cv4')), hr = +$('h4').value, th = +$('th4').value; $('h4v').textContent = hr; $('th4v').textContent = th; const sol = solveInHour(hr, th), base = (hr % 12) * 60;
  drawClock(ctx, w / 2, h / 2, Math.min(w, h) / 2 - 8, base + (sol.length ? sol[0] : 0), { arc: sol.length > 0 });
  $('ro4').textContent = sol.length ? t('s4ro', { h: hr, th, list: sol.map(m => hr + ':' + (m < 10 ? '0' : '') + r2(m)).join(' , ') }) : t('s4roNone', { h: hr, th }); }
function render5() { const { ctx, w, h } = setup($('cv5')), tm = CHALLENGES[S.c5 % CHALLENGES.length]; drawClock(ctx, w / 2, h / 2, Math.min(w, h) / 2 - 8, tm, {});
  const g = parseFloat($('g5').value); if (!S.checked) { $('ro5').textContent = t('s5roAsk', { time: fmtHM(tm) }); return; }
  $('ro5').textContent = Math.abs(g - angleBetween(tm)) < 0.51 ? t('s5roOk', { time: fmtHM(tm), ang: r1(angleBetween(tm)) }) : t('s5roNo', { time: fmtHM(tm), hb: r1(hourAngle(tm)), mb: r1(minuteAngle(tm)), g: isNaN(g) ? '?' : g }); }
function wire() {
  slider('t0', render0); slider('h1', render1); slider('m1', render1); slider('t2', render2); slider('h4', render4); slider('th4', render4);
  $('play3').addEventListener('click', () => { if (S.playing) { stop3(); render3(); return; } if (S.t3 >= 719) S.t3 = 0; if (reduceMotion()) { S.t3 = 719.99; render3(); return; } S.playing = true; S.last = performance.now(); S.raf = requestAnimationFrame(tick3); render3(); });
  $('reset3').addEventListener('click', () => { stop3(); S.t3 = 0; render3(); });
  slider('k3', k => { stop3(); S.t3 = overlaps()[k]; render3(); });
  $('chk5').addEventListener('click', () => { S.checked = true; render5(); });
  $('nx5').addEventListener('click', () => { S.c5++; S.checked = false; $('g5').value = ''; render5(); }); $('g5').addEventListener('input', () => { S.checked = false; render5(); });
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
if (typeof module !== 'undefined') module.exports = { hourAngle,minuteAngle,angleBetween,crossings,fmtTime,solveInHour,CHALLENGES };
