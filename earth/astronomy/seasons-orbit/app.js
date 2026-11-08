'use strict';
/* ---------- pure model ---------- */
const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], EPS0 = 23.44, RAD = Math.PI / 180;
function dateOf(n) { n = Math.max(0, Math.min(364, Math.round(n))); let m = 11; while (CUM[m] > n) m--; return { m, d: n - CUM[m] + 1 }; }
function decl(n, eps) { return (eps === undefined ? EPS0 : eps) * Math.sin(2 * Math.PI * (n - 79.5) / 365.25); }
function dist(n) { return 1 - 0.0167 * Math.cos(2 * Math.PI * (n - 2) / 365.25); }
function noonAlt(lat, dec) { return 90 - Math.abs(lat - dec); }
function dayLength(lat, dec) {
  const la = Math.max(-89.9, Math.min(89.9, lat)) * RAD, x = -Math.tan(la) * Math.tan(dec * RAD);
  if (x >= 1) return 0; if (x <= -1) return 24; return 2 * Math.acos(x) / RAD / 15;
}
const insolation = h => Math.max(0, Math.sin(h * RAD));
function yearRange(f) { let lo = 1e9, hi = -1e9; for (let n = 0; n < 365; n++) { const v = f(n); lo = Math.min(lo, v); hi = Math.max(hi, v); } return [lo, hi]; }
/*KIT-BEGIN*/
const $ = id => document.getElementById(id);
const C = { cyan: '#6ee7ff', orange: '#ffb454', pink: '#ff7a93', green: '#7ee2a8', muted: '#9aa7b8', text: '#e8edf4', line: '#2b3547', panel: '#1c2330' };
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function fit(id) {
  const cv = $(id), dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.h === undefined) cv.dataset.h = cv.getAttribute('height') || '280';
  cv.style.height = cv.dataset.h + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.h);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.W = w; ctx.H = h; return ctx;
}
function ln(c, x1, y1, x2, y2, col, w, dash) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w || 2; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); }
function dt(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fillStyle = col; c.fill(); }
function tx(c, s, x, y, col, size, al) { c.font = (size || 13) + 'px system-ui,sans-serif'; c.fillStyle = col || C.muted; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function rect(c, x, y, w, h, fill, stroke) { c.beginPath(); c.rect(x, y, w, h); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); } }
function fmt(x, n) { return Number(x).toFixed(n === undefined ? 1 : n); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function arrow(c, x1, y1, x2, y2, col, w) { ln(c, x1, y1, x2, y2, col, w); const a = Math.atan2(y2 - y1, x2 - x1), s = 9; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)); c.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)); c.closePath(); c.fillStyle = col; c.fill(); }
function bindLang() {
  document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
}
function bindSpy() {
  const links = document.querySelectorAll('.nav-step');
  const mark = i => links.forEach(a => a.classList.toggle('active', a.dataset.nav === String(i)));
  mark(0);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) mark(e.target.dataset.step); }); }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('.step').forEach(s => io.observe(s));
}
/* eased values: name -> {cur, tgt}; a single rAF loop runs only while something is moving */
const Anim = { v: {}, on: false, redraw: null,
  get(n, d) { return this.v[n] ? this.v[n].cur : d; },
  set(n, tgt, snap) { const o = this.v[n] || (this.v[n] = { cur: tgt, tgt }); o.tgt = tgt; if (snap || reduced()) o.cur = tgt; this.kick(); },
  kick() { if (this.on) return; this.on = true; requestAnimationFrame(() => this.tick()); },
  tick() {
    let moving = false;
    for (const n in this.v) { const o = this.v[n], d = o.tgt - o.cur; if (Math.abs(d) > 0.004 * (1 + Math.abs(o.tgt))) { o.cur += d * 0.16; moving = true; } else o.cur = o.tgt; }
    if (this.redraw) this.redraw();
    if (moving && !document.hidden) requestAnimationFrame(() => this.tick()); else this.on = false;
  } };
/*KIT-END*/

const S = { day: 171, run: false, lat2: 40, lat3: 40, seen: [171, 171], eps4: 23.5 };
const visSet = new Set(); let loopOn = false, last = 0;
const dstr = n => { const o = dateOf(n); return t('dateFmt', { m: t('mon' + o.m), d: o.d }); };
function chartYear(c, W, y0, h, series, ymin, ymax, yticks, ylabel, fy) {
  const ml = 40, mr = 12, X = n => ml + (W - ml - mr) * n / 365, Y = v => y0 + h - h * (v - ymin) / (ymax - ymin);
  yticks.forEach(v => { ln(c, ml, Y(v), W - mr, Y(v), '#22304a', 1); tx(c, fmt(v, fy === undefined ? 0 : fy), ml - 5, Y(v), C.muted, 10, 'right'); });
  [0, 3, 6, 9].forEach(m => { ln(c, X(CUM[m]), y0, X(CUM[m]), y0 + h, '#1b2638', 1); tx(c, t('mon' + m), X(CUM[m]) + 2, y0 + h + 12, C.muted, 10, 'left'); });
  ln(c, ml, y0 + h, W - mr, y0 + h, C.muted, 1.5); ln(c, ml, y0, ml, y0 + h, C.muted, 1.5); tx(c, ylabel, ml + 4, y0 - 4, C.muted, 11, 'left');
  series.forEach(s => {
    const lo = s.lo === undefined ? 0 : s.lo, hi = s.hi === undefined ? 365 : s.hi; c.beginPath(); let started = false;
    for (let n = lo; n <= hi + 1e-9; n += 1) { const v = Math.max(ymin, Math.min(ymax, s.f(n))); started ? c.lineTo(X(n), Y(v)) : c.moveTo(X(n), Y(v)); started = true; }
    c.strokeStyle = s.col; c.lineWidth = s.w || 2.5; c.setLineDash(s.dash || []); c.stroke(); c.setLineDash([]);
  });
  return { X, Y, bottom: y0 + h };
}
function marker(c, g, n, v, col) { ln(c, g.X(n), g.Y(v), g.X(n), g.bottom, col || C.orange, 1, [3, 3]); dt(c, g.X(n), g.Y(v), 6, col || C.orange); }
/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, cx = W / 2, cy = 88, R = 70, th = 2 * Math.PI * (S.day - 2) / 365.25, r = dist(S.day);
  dt(c, cx, cy, 11, '#ffd97a'); c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.strokeStyle = '#33425c'; c.lineWidth = 1.5; c.stroke();
  const ex = cx + r * R * Math.cos(-th), ey = cy + r * R * Math.sin(-th); dt(c, ex, ey, 6, C.orange); ln(c, cx, cy, ex, ey, '#8a7a4a', 1, [3, 3]);
  tx(c, t('s0orbit'), cx, cy + R + 22, C.muted, 11);
  const g = chartYear(c, W, 196, 100, [{ f: dist, col: C.cyan }], 0.98, 1.02, [0.98, 1.0, 1.02], 'AU', 2); marker(c, g, S.day, dist(S.day));
}
function roS0() {
  const r = dist(S.day), dec = decl(S.day), note = r < 0.9835 ? t('s0near') : r > 1.0165 ? t('s0far') : t('s0mid');
  $('s0-day-o').textContent = dstr(S.day); $('s0-day').value = Math.round(S.day);
  $('s0-ro').textContent = t('s0ro', { date: dstr(S.day), au: fmt(r, 4), mkm: fmt(149.6 * r, 1), note: (r < 0.9835 && dec > 0) || (r > 1.0165 && dec < 0) ? '' : note });
  if (r < 0.9835 && dec > 0) $('s0-ro').textContent = t('s0ro', { date: dstr(S.day), au: fmt(r, 4), mkm: fmt(149.6 * r, 1), note: t('s0mid') });
  $('s0-play').textContent = t(S.run ? 'pause' : 'play');
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, cx = W / 2, cy = H / 2, rx = Math.min(W * 0.36, 190), ry = rx * 0.34;
  c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); c.strokeStyle = '#33425c'; c.lineWidth = 1.5; c.stroke();
  dt(c, cx, cy, 14, '#ffd97a');
  [[79.5, 'mon2', 20], [171, 'mon5', 21], [265, 'mon8', 23], [355, 'mon11', 21]].forEach(([n, m, d]) => { const a = 2 * Math.PI * (n - 355) / 365.25, x = cx + rx * Math.cos(a), y = cy - ry * Math.sin(a); dt(c, x, y, 2.5, '#5d6d8a'); });
  const a = 2 * Math.PI * (S.day - 355) / 365.25, ex = cx + rx * Math.cos(a), ey = cy - ry * Math.sin(a), R = 17, tilt = EPS0 * RAD;
  const toSun = Math.atan2(cy - ey, cx - ex);
  dt(c, ex, ey, R, '#17243a'); c.beginPath(); c.arc(ex, ey, R, toSun - Math.PI / 2, toSun + Math.PI / 2); c.closePath(); c.fillStyle = '#4f8fd0'; c.fill();
  ln(c, ex - Math.sin(tilt) * R * 1.7, ey + Math.cos(tilt) * R * 1.7, ex + Math.sin(tilt) * R * 1.7, ey - Math.cos(tilt) * R * 1.7, C.text, 2);
  tx(c, t('north'), ex + Math.sin(tilt) * R * 2.1, ey - Math.cos(tilt) * R * 2.1, C.pink, 12);
  [[79.5, 'mon2'], [171, 'mon5'], [265, 'mon8'], [355, 'mon11']].forEach(([n, m]) => { const aa = 2 * Math.PI * (n - 355) / 365.25, x = cx + (rx + 26) * Math.cos(aa), y = cy - (ry + 22) * Math.sin(aa); tx(c, t(m) + ' 21', x, y, C.muted, 10); });
  tx(c, 'δ = ' + fmt(Math.abs(decl(S.day)), 1) + '°' + t(decl(S.day) >= 0 ? 'north' : 'south'), W - 10, 16, C.orange, 13, 'right');
}
function roS1() {
  const dec = decl(S.day), tilt = dec > 0.6 ? t('s1toN') : dec < -0.6 ? t('s1toS') : t('s1eq');
  $('s1-day-o').textContent = dstr(S.day); $('s1-day').value = Math.round(S.day); $('s1-play').textContent = t(S.run ? 'pause' : 'play');
  $('s1-ro').textContent = t('s1ro', { date: dstr(S.day), dec: fmt(Math.abs(dec), 1), ns: t(dec >= 0 ? 'north' : 'south'), tilt });
}
/* ---- step 2 ---- */
function drawS2() {
  const c = fit('s2-cv'), W = c.W, H = c.H, dec = decl(S.day), h = noonAlt(S.lat2, dec), gy = 138, cx = W / 2, side = S.lat2 >= dec ? 1 : -1;
  ln(c, 12, gy, W - 12, gy, C.muted, 2); c.beginPath(); c.arc(cx, gy, 98, Math.PI, 0); c.strokeStyle = '#2a3a55'; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]);
  const sx = cx + side * 98 * Math.cos(h * RAD), sy = gy - 98 * Math.sin(h * RAD); dt(c, sx, sy, 10, '#ffd97a');
  const b = 30, foot = Math.min(W * 0.85, b / Math.max(Math.sin(h * RAD), 0.04));
  [-1, 0, 1].forEach(k => { const o = k * (b / 2); ln(c, sx - side * Math.sin(h * RAD) * o * 0 + o * Math.sin(h * RAD) * side, sy + o * Math.cos(h * RAD), cx + k * (foot / 2), gy, 'rgba(255,217,122,0.55)', 1.5); });
  rect(c, cx - foot / 2, gy - 4, foot, 6, '#ffb454'); dt(c, cx, gy - 10, 4, C.text);
  tx(c, fmt(h, 1) + '°', cx + side * 40, gy - 14, C.orange, 13); tx(c, t(S.lat2 >= dec ? 'south' : 'north'), sx, sy - 18, C.muted, 11);
  const g = chartYear(c, W, 180, H - 214, [{ f: n => noonAlt(S.lat2, decl(n)), col: C.cyan }], 0, 90, [0, 30, 60, 90], t('s2yl')); marker(c, g, S.day, h);
}
function roS2() {
  const dec = decl(S.day), h = noonAlt(S.lat2, dec); $('s2-lat-o').textContent = S.lat2 + '°'; $('s2-day-o').textContent = dstr(S.day); $('s2-day').value = Math.round(S.day);
  $('s2-ro').textContent = t('s2ro', { lat: S.lat2, date: dstr(S.day), dec: fmt(dec, 1), h: fmt(h, 1), dir: t(S.lat2 >= dec ? 'south' : 'north'), s: fmt(insolation(h), 2) });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, la = S.lat3, L = dayLength(la, decl(S.day));
  const g = chartYear(c, W, 22, 150, [{ f: () => 12, col: '#4a5d80', w: 1.2, dash: [4, 4] }, { f: n => dayLength(la, decl(n)), col: C.cyan, w: 1.5, dash: [4, 4] }, { f: n => dayLength(la, decl(n)), col: C.cyan, w: 3, lo: S.seen[0], hi: S.seen[1] }], 0, 24, [0, 6, 12, 18, 24], t('unitH'));
  marker(c, g, S.day, L);
  const cx = W / 2, cy = 250, R = 50; c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.strokeStyle = '#2a3a55'; c.lineWidth = 12; c.stroke();
  const half = L / 24 * Math.PI; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2 - half, -Math.PI / 2 + half); c.strokeStyle = '#ffd97a'; c.lineWidth = 12; c.stroke(); if (L >= 24) { c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.stroke(); }
  tx(c, fmt(L, 1) + ' ' + t('unitH'), cx, cy, C.text, 14); tx(c, '12', cx, cy - R - 14, C.muted, 10); tx(c, '0', cx, cy + R + 14, C.muted, 10);
}
function roS3() {
  const dec = decl(S.day), L = dayLength(S.lat3, dec); $('s3-lat-o').textContent = S.lat3 + '°'; $('s3-day-o').textContent = dstr(S.day); $('s3-day').value = Math.round(S.day); $('s3-play').textContent = t(S.run ? 'pause' : 'play');
  $('s3-ro').textContent = t('s3ro', { lat: S.lat3, date: dstr(S.day), len: fmt(L, 1), night: fmt(24 - L, 1), pol: L <= 0 ? t('s3polNight') : L >= 24 ? t('s3polDay') : t('s3polNone') });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, H = c.H, e = S.eps4, fN = n => noonAlt(40, decl(n, e)), fS = n => noonAlt(-40, decl(n, e));
  const g = chartYear(c, W, 20, H - 60, [{ f: fN, col: C.cyan }, { f: fS, col: C.orange }], 0, 90, [0, 30, 60, 90], t('s2yl')); ln(c, g.X(S.day), 20, g.X(S.day), g.bottom, '#8896ab', 1, [3, 3]); dt(c, g.X(S.day), g.Y(fN(S.day)), 5, C.cyan); dt(c, g.X(S.day), g.Y(fS(S.day)), 5, C.orange);
}
function roS4() {
  const e = S.eps4, fN = n => noonAlt(40, decl(n, e)), fS = n => noonAlt(-40, decl(n, e)), rn = yearRange(fN), rs = yearRange(fS), rl = yearRange(n => dayLength(40, decl(n, e)));
  $('s4-eps-o').textContent = fmt(e, 1) + '°'; $('s4-day-o').textContent = dstr(S.day); $('s4-day').value = Math.round(S.day);
  $('s4-ro').textContent = t('s4ro', { eps: fmt(e, 1), nmin: fmt(rn[0], 0), nmax: fmt(rn[1], 0), smin: fmt(rs[0], 0), smax: fmt(rs[1], 0), lmin: fmt(rl[0], 1), lmax: fmt(rl[1], 1), now: t('s4now', { date: dstr(S.day), nh: fmt(fN(S.day), 0), sh: fmt(fS(S.day), 0) }) });
}
function setDay(n) { S.day = ((n % 365) + 365) % 365; const r = Math.round(S.day); S.seen = [Math.min(S.seen[0], r), Math.max(S.seen[1], r)]; }
function frame(ts) { const d = Math.min(0.1, (ts - last) / 1000); last = ts; if (S.run) setDay(S.day + d * 30); redraw(); if (S.run && visSet.size && !document.hidden) requestAnimationFrame(frame); else loopOn = false; }
function kick() { if (!loopOn && S.run && visSet.size && !reduced()) { loopOn = true; last = performance.now(); requestAnimationFrame(frame); } }
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function boot() {
  Anim.redraw = redraw; window.onLang = redraw;
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  [0, 1, 2, 3, 4].forEach(i => on('s' + i + '-day', 'input', e => { S.run = false; setDay(Number(e.target.value)); redraw(); }));
  [0, 1, 3].forEach(i => on('s' + i + '-play', 'click', () => { if (reduced()) { setDay(S.day + 91); redraw(); return; } S.run = !S.run; kick(); redraw(); }));
  on('s2-lat', 'input', e => { S.lat2 = Number(e.target.value); redraw(); });
  on('s3-lat', 'input', e => { S.lat3 = Number(e.target.value); S.seen = [Math.round(S.day), Math.round(S.day)]; redraw(); });
  on('s4-eps', 'input', e => { S.eps4 = Number(e.target.value); redraw(); });
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) visSet.add(e.target.id); else visSet.delete(e.target.id); }); kick(); }, { threshold: 0.05 }); document.querySelectorAll('.step').forEach(s => io.observe(s)); }
  document.addEventListener('visibilitychange', kick);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { dateOf, decl, dist, noonAlt, dayLength, insolation, yearRange, CUM };
