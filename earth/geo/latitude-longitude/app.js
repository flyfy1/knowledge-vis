'use strict';
/* ---------- pure model ---------- */
const RE = 6371, RAD = Math.PI / 180, DEGKM = 2 * Math.PI * RE / 360;
const CITIES = [[1.35, 103.82], [51.51, -0.13], [40.71, -74.01], [-33.87, 151.21], [-22.91, -43.17], [-1.29, 36.82], [64.15, -21.94], [39.90, 116.40]];
function project(lat, lon, lat0, lon0) {
  const p = lat * RAD, l = (lon - lon0) * RAD, p0 = lat0 * RAD;
  return { x: Math.cos(p) * Math.sin(l), y: Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l), vis: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l) > 0 };
}
function wrap180(d) { d = ((d + 180) % 360 + 360) % 360 - 180; return d; }
function haversine(la1, lo1, la2, lo2) { const a = Math.sin((la2 - la1) * RAD / 2) ** 2 + Math.cos(la1 * RAD) * Math.cos(la2 * RAD) * Math.sin((lo2 - lo1) * RAD / 2) ** 2; return 2 * RE * Math.asin(Math.min(1, Math.sqrt(a))); }
function flatDist(la1, lo1, la2, lo2) { return Math.hypot(la2 - la1, wrap180(lo2 - lo1)) * DEGKM; }
const lonDegKm = lat => DEGKM * Math.cos(lat * RAD), parallelKm = lat => 2 * Math.PI * RE * Math.cos(lat * RAD);
const stretch = (lat, u) => (1 - u) + u / Math.max(Math.cos(lat * RAD), 1e-6);
const mapX = (lon, lat, u) => lon * ((1 - u) * Math.cos(lat * RAD) + u);
const noonLon = utc => wrap180((12 - utc) * 15);
const isDay = (lon, utc) => Math.cos((lon - noonLon(utc)) * RAD) > 0;
const localHour = (utc, lon) => ((utc + lon / 15) % 24 + 24) % 24;
function greatCircle(la1, lo1, la2, lo2, n) {
  const v = (la, lo) => [Math.cos(la * RAD) * Math.cos(lo * RAD), Math.cos(la * RAD) * Math.sin(lo * RAD), Math.sin(la * RAD)], a = v(la1, lo1), b = v(la2, lo2);
  const om = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))), out = [];
  for (let i = 0; i <= n; i++) { const f = i / n, s1 = om < 1e-9 ? 1 - f : Math.sin((1 - f) * om) / Math.sin(om), s2 = om < 1e-9 ? f : Math.sin(f * om) / Math.sin(om), x = s1 * a[0] + s2 * b[0], y = s1 * a[1] + s2 * b[1], z = s1 * a[2] + s2 * b[2]; out.push([Math.atan2(z, Math.hypot(x, y)) / RAD, Math.atan2(y, x) / RAD]); }
  return out;
}
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

const S = { city0: 0, lat0: 1.35, lon0: 104, view0: 100, lat1: 40, u2: 0, lat2: 60, a3: 1, b3: 2, utc4: 12, city4: 1 };
const fmtLat = v => (Math.abs(v) < 0.5 ? '0°' : t('latFmt', { v: Math.abs(Math.round(v)), dir: t(v > 0 ? 'dirN' : 'dirS') }));
const fmtLon = v => (Math.abs(v) < 0.5 ? '0°' : t('lonFmt', { v: Math.abs(Math.round(v)), dir: t(v > 0 ? 'dirE' : 'dirW') }));
const hhmm = h => { let m = Math.round(h * 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
function fillCity(id, cur, withNone) { const el = $(id); el.innerHTML = ''; if (withNone) { const o = document.createElement('option'); o.value = -1; o.textContent = t('ctNone'); if (cur === -1) o.selected = true; el.appendChild(o); } CITIES.forEach((_, i) => { const o = document.createElement('option'); o.value = i; o.textContent = t('ct' + i); if (i === cur) o.selected = true; el.appendChild(o); }); }
function globe(c, cx, cy, R, lat0, lon0, opt) {
  const P = (la, lo) => { const q = project(la, lo, lat0, lon0); return { x: cx + R * q.x, y: cy - R * q.y, vis: q.vis }; };
  dt(c, cx, cy, R, '#102033'); c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.strokeStyle = '#33506b'; c.lineWidth = 1.5; c.stroke();
  const path = (pts, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); let on = false; pts.forEach(([la, lo]) => { const p = P(la, lo); if (p.vis) { on ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); on = true; } else on = false; }); c.stroke(); };
  for (let la = -60; la <= 60; la += 30) path(Array.from({ length: 121 }, (_, i) => [la, -180 + 3 * i]), la === 0 ? '#5d7fa6' : '#27415c', la === 0 ? 1.6 : 1);
  for (let lo = -180; lo < 180; lo += 30) path(Array.from({ length: 61 }, (_, i) => [-90 + 3 * i, lo]), lo === 0 ? '#5d7fa6' : '#27415c', lo === 0 ? 1.6 : 1);
  return { P, path };
}
/* ---- step 0 ---- */
function drawS0() {
  const c = fit('s0-cv'), W = c.W, H = c.H, R = Math.min(W * 0.34, 125), cx = W / 2, cy = H / 2, g = globe(c, cx, cy, R, 20, S.view0);
  g.path(Array.from({ length: 121 }, (_, i) => [S.lat0, -180 + 3 * i]), C.orange, 2.5); g.path(Array.from({ length: 61 }, (_, i) => [-90 + 3 * i, S.lon0]), C.orange, 2.5);
  CITIES.forEach((q, i) => { const p = g.P(q[0], q[1]); if (p.vis) { dt(c, p.x, p.y, 3, C.cyan); tx(c, t('ct' + i), p.x + 5, p.y - 7, C.muted, 10, 'left'); } });
  const p = g.P(S.lat0, S.lon0); if (p.vis) { dt(c, p.x, p.y, 7, '#0a0e14'); dt(c, p.x, p.y, 5.5, C.orange); }
}
function roS0() {
  $('s0-lat-o').textContent = fmtLat(S.lat0); $('s0-lon-o').textContent = fmtLon(S.lon0); $('s0-view-o').textContent = fmtLon(S.view0);
  const hid = !project(S.lat0, S.lon0, 20, S.view0).vis;
  $('s0-ro').textContent = t('s0ro', { name: S.city0 >= 0 ? t('ct' + S.city0) : t('ctNone'), lat: fmtLat(S.lat0), lon: fmtLon(S.lon0), la: Math.abs(Math.round(S.lat0)), lo: Math.abs(Math.round(S.lon0)) }) + (hid ? ' ' + t('s0hid') : '');
}
/* ---- step 1 ---- */
function drawS1() {
  const c = fit('s1-cv'), W = c.W, H = c.H, R = Math.min(W * 0.27, 110), cx = W * 0.3, cy = H / 2, g = globe(c, cx, cy, R, 15, 0);
  g.path(Array.from({ length: 121 }, (_, i) => [S.lat1, -180 + 3 * i]), C.orange, 3.5);
  const x0 = W * 0.58, w = W - x0 - 14, y0 = 40, h = H - 90, X = la => x0 + w * (la + 90) / 180, Y = v => y0 + h - h * v;
  ln(c, x0, y0 + h, x0 + w, y0 + h, C.muted, 1.5); ln(c, x0, y0, x0, y0 + h, C.muted, 1.5); [0, 0.5, 1].forEach(v => tx(c, String(v), x0 - 5, Y(v), C.muted, 10, 'right'));
  [-90, 0, 90].forEach(la => tx(c, String(la), X(la), y0 + h + 12, C.muted, 10)); tx(c, 'cos φ', x0 + 4, y0 - 12, C.muted, 11, 'left'); tx(c, t('s1lat'), x0 + w, y0 + h + 28, C.muted, 10, 'right');
  c.beginPath(); for (let la = -90; la <= 90; la += 2) { la > -90 ? c.lineTo(X(la), Y(Math.cos(la * RAD))) : c.moveTo(X(la), Y(0)); } c.strokeStyle = C.cyan; c.lineWidth = 2.5; c.stroke(); dt(c, X(S.lat1), Y(Math.cos(S.lat1 * RAD)), 6, C.orange);
}
function roS1() {
  const L = parallelKm(S.lat1); $('s1-lat-o').textContent = fmtLat(S.lat1);
  $('s1-ro').textContent = t('s1ro', { lat: S.lat1, len: fmt(L, 0), pct: fmt(100 * L / parallelKm(0), 0), dlon: fmt(lonDegKm(S.lat1), 1), dlat: fmt(DEGKM, 1) });
}
/* ---- step 2 ---- */
function mapBox(W, y0) { const w = W - 24; return { x: 12, y: y0, w, h: w / 2 }; }
function drawS2() {
  const c = fit('s2-cv'), W = c.W, b = mapBox(W, 22), u = Anim.get('u2', S.u2 / 100), X = (lo, la) => b.x + b.w / 2 + mapX(lo, la, u) / 180 * b.w / 2, Y = la => b.y + b.h / 2 - la / 90 * b.h / 2;
  c.beginPath(); for (let la = -90; la <= 90; la += 2) { la > -90 ? c.lineTo(X(-180, la), Y(la)) : c.moveTo(X(-180, la), Y(la)); } for (let la = 90; la >= -90; la -= 2) c.lineTo(X(180, la), Y(la)); c.closePath(); c.fillStyle = '#10243a'; c.fill(); c.strokeStyle = '#3a587a'; c.lineWidth = 1.5; c.stroke();
  for (let la = -60; la <= 60; la += 30) { c.beginPath(); c.moveTo(X(-180, la), Y(la)); c.lineTo(X(180, la), Y(la)); c.strokeStyle = la === 0 ? '#5d7fa6' : '#27415c'; c.lineWidth = 1; c.stroke(); }
  for (let lo = -150; lo <= 150; lo += 30) { c.beginPath(); for (let la = -90; la <= 90; la += 3) { la > -90 ? c.lineTo(X(lo, la), Y(la)) : c.moveTo(X(lo, la), Y(la)); } c.strokeStyle = lo === 0 ? '#5d7fa6' : '#27415c'; c.lineWidth = 1; c.stroke(); }
  const rho = 12, ell = (la, col, w) => { const k = stretch(la, u); c.beginPath(); c.ellipse(X(0, la), Y(la), rho * k / 180 * b.w / 2, rho / 90 * b.h / 2, 0, 0, 6.2832); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
  for (let la = -60; la <= 60; la += 30) ell(la, 'rgba(255,180,84,0.35)', 1.2); ell(S.lat2, C.orange, 3);
  tx(c, t('mapLbl'), W / 2, b.y + b.h + 16, C.muted, 11);
}
function roS2() {
  const u = S.u2 / 100, k = stretch(S.lat2, u); $('s2-u-o').textContent = S.u2 + '%'; $('s2-lat-o').textContent = fmtLat(S.lat2);
  $('s2-ro').textContent = S.u2 === 0 ? t('s2none') : t('s2ro', { u: S.u2, lat: S.lat2, k: fmt(k, 2) });
}
/* ---- step 3 ---- */
function drawS3() {
  const c = fit('s3-cv'), W = c.W, H = c.H, A = CITIES[S.a3], B = CITIES[S.b3], gcp = greatCircle(A[0], A[1], B[0], B[1], 80);
  const mid = gcp[40], R = 74, g = globe(c, W / 2, 86, R, mid[0], mid[1]); g.path(gcp, C.orange, 3);
  [[A, S.a3], [B, S.b3]].forEach(([q, i]) => { const p = g.P(q[0], q[1]); if (p.vis) { dt(c, p.x, p.y, 5, C.cyan); tx(c, t('ct' + i), p.x + 7, p.y - 8, C.text, 11, 'left'); } });
  const b = mapBox(W, 176), X = lo => b.x + (lo + 180) / 360 * b.w, Y = la => b.y + (90 - la) / 180 * b.h;
  rect(c, b.x, b.y, b.w, b.h, '#10243a', '#3a587a'); for (let la = -60; la <= 60; la += 30) ln(c, b.x, Y(la), b.x + b.w, Y(la), '#27415c', 1); for (let lo = -150; lo <= 150; lo += 30) ln(c, X(lo), b.y, X(lo), b.y + b.h, '#27415c', 1);
  ln(c, X(A[1]), Y(A[0]), X(B[1]), Y(B[0]), '#8896ab', 1.5, [5, 4]);
  c.beginPath(); let on = false; gcp.forEach((q, i) => { if (i && Math.abs(q[1] - gcp[i - 1][1]) > 180) on = false; on ? c.lineTo(X(q[1]), Y(q[0])) : c.moveTo(X(q[1]), Y(q[0])); on = true; }); c.strokeStyle = C.orange; c.lineWidth = 3; c.stroke();
  [[A, S.a3], [B, S.b3]].forEach(([q, i]) => { dt(c, X(q[1]), Y(q[0]), 5, C.cyan); tx(c, t('ct' + i), X(q[1]), Y(q[0]) - 10, C.text, 11); });
}
function roS3() {
  const A = CITIES[S.a3], B = CITIES[S.b3]; if (S.a3 === S.b3) { $('s3-ro').textContent = t('s3same'); return; }
  const gc = haversine(A[0], A[1], B[0], B[1]), fl = flatDist(A[0], A[1], B[0], B[1]);
  $('s3-ro').textContent = t('s3ro', { a: t('ct' + S.a3), b: t('ct' + S.b3), gc: fmt(gc, 0), flat: fmt(fl, 0), diff: fmt(100 * Math.abs(fl - gc) / gc, 0) });
}
/* ---- step 4 ---- */
function drawS4() {
  const c = fit('s4-cv'), W = c.W, b = mapBox(W, 28), utc = Anim.get('utc4', S.utc4), X = lo => b.x + (lo + 180) / 360 * b.w, Y = la => b.y + (90 - la) / 180 * b.h;
  for (let px = 0; px < b.w; px += 2) { const lo = -180 + 360 * (px + 1) / b.w; c.fillStyle = isDay(lo, utc) ? '#2b4a6a' : '#0b1320'; c.fillRect(b.x + px, b.y, 2.5, b.h); }
  for (let lo = -150; lo <= 150; lo += 30) { ln(c, X(lo), b.y, X(lo), b.y + b.h, 'rgba(120,150,190,0.25)', 1); if (lo % 60 === 0) tx(c, String(lo), X(lo), b.y - 8, C.muted, 10); }
  for (let la = -60; la <= 60; la += 30) ln(c, b.x, Y(la), b.x + b.w, Y(la), 'rgba(120,150,190,0.25)', 1);
  rect(c, b.x, b.y, b.w, b.h, null, '#3a587a'); ln(c, X(noonLon(utc)), b.y, X(noonLon(utc)), b.y + b.h, C.orange, 2.5);
  CITIES.forEach((q, i) => { dt(c, X(q[1]), Y(q[0]), i === S.city4 ? 5.5 : 3, i === S.city4 ? C.orange : C.cyan); });
  const q = CITIES[S.city4], lh = localHour(utc, q[1]); tx(c, t('ct' + S.city4) + ' ' + hhmm(lh), clamp(X(q[1]), 70, W - 70), Y(q[0]) + 16, C.text, 12);
}
function roS4() {
  const q = CITIES[S.city4], lh = localHour(S.utc4, q[1]); $('s4-utc-o').textContent = hhmm(S.utc4);
  $('s4-ro').textContent = t('s4ro', { utc: hhmm(S.utc4), noon: fmtLon(noonLon(S.utc4)), city: t('ct' + S.city4), lon: fmtLon(q[1]), local: hhmm(lh), dn: t(isDay(q[1], S.utc4) ? 's4day' : 's4night') });
}
function redraw() { drawS0(); drawS1(); drawS2(); drawS3(); drawS4(); roS0(); roS1(); roS2(); roS3(); roS4(); }
function fillAll() { fillCity('s0-city', S.city0, true); fillCity('s3-a', S.a3); fillCity('s3-b', S.b3); fillCity('s4-city', S.city4); }
function boot() {
  Anim.redraw = redraw; window.onLang = () => { fillAll(); redraw(); };
  bindLang(); bindSpy();
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
  on('s0-city', 'change', e => { const i = Number(e.target.value); S.city0 = i; if (i >= 0) { S.lat0 = CITIES[i][0]; S.lon0 = CITIES[i][1]; S.view0 = Math.round(CITIES[i][1] / 5) * 5; $('s0-lat').value = Math.round(S.lat0); $('s0-lon').value = Math.round(S.lon0); $('s0-view').value = S.view0; } redraw(); });
  on('s0-lat', 'input', e => { S.lat0 = Number(e.target.value); S.city0 = -1; fillCity('s0-city', -1, true); redraw(); }); on('s0-lon', 'input', e => { S.lon0 = Number(e.target.value); S.city0 = -1; fillCity('s0-city', -1, true); redraw(); }); on('s0-view', 'input', e => { S.view0 = Number(e.target.value); redraw(); });
  on('s1-lat', 'input', e => { S.lat1 = Number(e.target.value); redraw(); });
  on('s2-u', 'input', e => { S.u2 = Number(e.target.value); Anim.set('u2', S.u2 / 100); redraw(); }); on('s2-lat', 'input', e => { S.lat2 = Number(e.target.value); redraw(); });
  on('s3-a', 'change', e => { S.a3 = Number(e.target.value); redraw(); }); on('s3-b', 'change', e => { S.b3 = Number(e.target.value); redraw(); });
  on('s4-utc', 'input', e => { S.utc4 = Number(e.target.value); Anim.set('utc4', S.utc4); redraw(); }); on('s4-city', 'change', e => { S.city4 = Number(e.target.value); redraw(); });
  Anim.set('u2', 0, true); Anim.set('utc4', S.utc4, true);
  let rt = 0; window.addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(redraw); });
  applyLang(getLang());
}
if (typeof document !== 'undefined' && document.getElementById('langToggle')) boot();
if (typeof module !== 'undefined') module.exports = { project, haversine, flatDist, lonDegKm, parallelKm, stretch, mapX, noonLon, isDay, localHour, greatCircle, wrap180, CITIES, DEGKM, RE };
