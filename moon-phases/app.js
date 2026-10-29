/* moon-phases: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const SYNODIC = 29.53, RE = 6371, RM = 1737, DEM = 384400;
const rad = d => d * Math.PI / 180;
const litFraction = th => (1 - Math.cos(rad(th))) / 2;
const phaseIndex = th => Math.round((((th % 360) + 360) % 360) / 45) % 8;
const dayToAngle = d => (d / SYNODIC) * 360;
const moonHeight = (iDeg, nuDeg) => DEM * Math.sin(rad(iDeg)) * Math.sin(rad(nuDeg));
const eclipsePossible = (iDeg, nuDeg) => Math.abs(moonHeight(iDeg, nuDeg)) < RE + RM;
const markerMismatch = (spinning, th) => { if (spinning) return 0; const d = ((th % 360) + 360) % 360; return d > 180 ? 360 - d : d; };
const S = { day: 0, maxDay: 0, playing: false, raf: 0, last: 0, spin: true, c5: 0, checked: false };
const TARGETS = [45, 90, 135, 225, 270, 315];
const pct = th => Math.round(litFraction(th) * 100);
function topDown(ctx, box, th, opt) { opt = opt || {}; const cx = box.x + box.w * 0.5, cy = box.y + box.h * 0.5, Ro = Math.min(box.w, box.h) * 0.36, Re = Ro * 0.2, Rm = Ro * 0.11;
  for (let k = -2; k <= 2; k++) { const y = cy + k * Ro * 0.4; line(ctx, box.x + box.w - 6, y, box.x + box.w * 0.82, y, COL.orange, 1.5); line(ctx, box.x + box.w * 0.82, y, box.x + box.w * 0.82 + 8, y - 4, COL.orange, 1.5); line(ctx, box.x + box.w * 0.82, y, box.x + box.w * 0.82 + 8, y + 4, COL.orange, 1.5); }
  ctx.strokeStyle = COL.dim; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, Ro, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
  dot(ctx, cx, cy, Re, COL.cyan); text(ctx, 'E', cx, cy + 4, { align: 'center', size: Math.max(10, Re), color: '#0a0e14', bold: true });
  const mx = cx + Ro * Math.cos(rad(th)), my = cy - Ro * Math.sin(rad(th)); dot(ctx, mx, my, Rm, '#3a4b58'); ctx.fillStyle = '#f3ecd0'; ctx.beginPath(); ctx.arc(mx, my, Rm, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
  if (opt.marker !== undefined) { const a = rad(opt.marker); const px = mx + Math.cos(a) * Rm * 0.75, py = my - Math.sin(a) * Rm * 0.75; dot(ctx, px, py, Math.max(2.5, Rm * 0.3), COL.orange); }
  text(ctx, 'S', box.x + box.w - 8, cy + 4 - Ro * 0.9 + Ro * 0.9, { align: 'right', size: 11, color: COL.orange }); return { cx, cy, Ro, mx, my, Rm }; }
/* Moon disc as seen from the northern hemisphere: waxing (0..180) lit on the right. */
function disc(ctx, cx, cy, R, th) { ctx.fillStyle = '#26323d'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill(); const k = Math.cos(rad(th)), sg = (((th % 360) + 360) % 360) <= 180 ? 1 : -1;
  ctx.fillStyle = '#f3ecd0'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2, sg < 0); for (let s = Math.PI / 2; s >= -Math.PI / 2 - 1e-9; s -= 0.1) ctx.lineTo(cx + sg * k * R * Math.cos(s), cy + R * Math.sin(s)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = COL.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke(); }
function render0() { const { ctx, w, h } = setup($('cv0')), th = +$('th0').value; $('th0v').textContent = th; topDown(ctx, { x: 0, y: 0, w, h }, th); const side = Math.cos(rad(th)) > 0.5 ? 'sideNear' : Math.cos(rad(th)) < -0.5 ? 'sideFar' : 'sideMid'; $('ro0').textContent = t('s0ro', { th, side: t(side) }); }
function render1() { const { ctx, w, h, wide } = setup($('cv1')), th = +$('th1').value; $('th1v').textContent = th; const A = wide ? { x: 0, y: 0, w: w * 0.55, h } : { x: 0, y: 0, w, h: h * 0.55 }, B = wide ? { x: w * 0.55, y: 0, w: w * 0.45, h } : { x: 0, y: h * 0.55, w, h: h * 0.45 };
  topDown(ctx, A, th); disc(ctx, B.x + B.w / 2, B.y + B.h / 2, Math.min(B.w, B.h) * 0.38, th); $('ro1').textContent = t('s1ro', { th, name: t('ph' + phaseIndex(th)), pct: pct(th) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), day = S.day, th = dayToAngle(day); $('day2v').textContent = day; $('day2').value = day; const top = { x: 0, y: 0, w, h: h * 0.66 }; topDown(ctx, top, th);
  const seenN = new Set(); for (let d = 0; d <= S.maxDay + 1e-9; d += 0.25) seenN.add(phaseIndex(dayToAngle(d))); const cw = w / 8, R = Math.min(cw * 0.36, h * 0.12);
  for (let k = 0; k < 8; k++) { const x = (k + 0.5) * cw, y = h * 0.86; ctx.globalAlpha = seenN.has(k) ? 1 : 0.28; disc(ctx, x, y, R, k * 45); ctx.globalAlpha = 1; if (k === phaseIndex(th)) { ctx.strokeStyle = COL.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R + 4, 0, 6.2832); ctx.stroke(); } }
  $('ro2').textContent = t('s2ro', { day, th: Math.round(th), name: t('ph' + phaseIndex(th)), pct: pct(th), seen: seenN.size }); $('play2').textContent = S.playing ? t('pause') : t('play'); }
function stop2() { S.playing = false; cancelAnimationFrame(S.raf); }
const onHide = () => { stop2(); render2(); };
function tick2(ts) { if (!S.playing) return; const dt = Math.min(0.1, (ts - S.last) / 1000); S.last = ts; S.day = Math.min(29.5, Math.round((S.day + dt * 3) * 100) / 100); S.maxDay = Math.max(S.maxDay, S.day); if (S.day >= 29.5) S.playing = false; render2(); if (S.playing) S.raf = requestAnimationFrame(tick2); }
function render3() { const { ctx, w, h } = setup($('cv3')), i = +$('inc3').value, nu = +$('nu3').value; $('inc3v').textContent = i; $('nu3v').textContent = nu; const sc = w * 0.7 / DEM, ex = w * 0.2, ey = h / 2, hh = moonHeight(i, nu), mx = ex + DEM * sc;
  line(ctx, 6, ey, w - 6, ey, COL.dim, 1.5, [6, 4]); ctx.fillStyle = 'rgba(246,164,91,0.18)'; ctx.fillRect(ex, ey - (RE + RM) * sc, DEM * sc * 1.15, 2 * (RE + RM) * sc); dot(ctx, ex, ey, RE * sc * 3, COL.cyan); dot(ctx, mx, ey - hh * sc, RM * sc * 3 + 1, '#f3ecd0');
  line(ctx, mx, ey, mx, ey - hh * sc, COL.violet, 2); text(ctx, 'h', mx + 8, ey - hh * sc / 2 + 4, { color: COL.violet, bold: true }); text(ctx, 'E', ex, ey + 22, { align: 'center', size: 12 }); const ok = eclipsePossible(i, nu);
  ctx.strokeStyle = ok ? COL.green : COL.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, ey - hh * sc, RM * sc * 3 + 6, 0, 6.2832); ctx.stroke();
  $('ro3').textContent = t('s3ro', { i, nu, h: Math.round(hh).toLocaleString('en-US'), lim: (RE + RM).toLocaleString('en-US'), res: t(ok ? 'resYes' : 'resNo') }); }
function render4() { const { ctx, w, h } = setup($('cv4')), th = +$('th4').value; $('th4v').textContent = th; ['s', 'n'].forEach(x => { const b = $('m4' + x), on = (x === 's') === S.spin; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  const markerDir = S.spin ? th + 180 : 180, g = topDown(ctx, { x: 0, y: 0, w, h }, th, { marker: markerDir }); line(ctx, g.mx, g.my, g.cx, g.cy, COL.muted, 1, [4, 4]);
  $('ro4').textContent = t('s4ro', { mode: t(S.spin ? 'spin' : 'nospin'), th, diff: Math.round(markerMismatch(S.spin, th)) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), tt = TARGETS[S.c5 % TARGETS.length], g = +$('g5').value; $('g5v').textContent = g; const R = Math.min(w / 4, h * 0.38);
  disc(ctx, w * 0.27, h / 2, R, tt); disc(ctx, w * 0.73, h / 2, R, g); text(ctx, '?', w * 0.27, h - 6, { align: 'center', size: 14 }); text(ctx, String(g) + '°', w * 0.73, h - 6, { align: 'center', size: 13 });
  if (!S.checked) { $('ro5').textContent = t('s5roAsk'); return; } const d = Math.abs(tt - g), dd = Math.min(d, 360 - d); $('ro5').textContent = dd <= 15 ? t('s5roOk', { tt, name: t('ph' + phaseIndex(tt)), g, d: dd }) : t('s5roNo', { d: dd }); }
function wire() {
  slider('th0', render0); slider('th1', render1); slider('inc3', render3); slider('nu3', render3); slider('th4', render4); slider('g5', () => { S.checked = false; render5(); });
  $('day2').addEventListener('input', e => { stop2(); S.day = +e.target.value; S.maxDay = Math.max(S.maxDay, S.day); render2(); });
  $('play2').addEventListener('click', () => { if (S.playing) { stop2(); render2(); return; } if (S.day >= 29.5) { S.day = 0; S.maxDay = 0; } if (reduceMotion()) { S.day = 29.5; S.maxDay = 29.5; render2(); return; } S.playing = true; S.last = performance.now(); S.raf = requestAnimationFrame(tick2); render2(); });
  $('reset2').addEventListener('click', () => { stop2(); S.day = 0; S.maxDay = 0; render2(); });
  $('m4s').addEventListener('click', () => { S.spin = true; render4(); }); $('m4n').addEventListener('click', () => { S.spin = false; render4(); });
  $('chk5').addEventListener('click', () => { S.checked = true; render5(); }); $('nx5').addEventListener('click', () => { S.c5++; S.checked = false; $('g5').value = 0; render5(); });
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
if (typeof module !== 'undefined') module.exports = { litFraction,phaseIndex,dayToAngle,moonHeight,eclipsePossible,markerMismatch,SYNODIC };
