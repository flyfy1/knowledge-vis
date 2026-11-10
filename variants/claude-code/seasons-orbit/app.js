'use strict';
// Earth's orbit & the seasons (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, curve and readout comes from window.SEASONS_MODEL (model.js). One date is shared by the
// whole page. Canvas text is limited to panel titles, axis ticks, month names and dial hours.
(function () {

const $ = id => document.getElementById(id);
const M = window.SEASONS_MODEL;
const t = (...a) => window.SEASONS_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#ffe066', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', faint: '#3a4a5e', night: '#1b2738', lit: '#d9e7f5', ground: '#2b3a2c' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const D2R = Math.PI / 180;
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const dateText = n => { const { m, d } = M.monthDay(n); return t('dateFmt', { m: m + 1, d, mon: t('m' + m) }); };
const latText = v => (v === 0 ? t('fEq') : t(v > 0 ? 'fN' : 'fS', { v: fmt(Math.abs(v), 2) }));
const hm = hours => { let h = Math.floor(hours), m = Math.round((hours - h) * 60); if (m === 60) { h++; m = 0; } return t('hm', { h, m }); };
const clock = hours => { const mins = Math.round(((hours % 24) + 24) % 24 * 60) % 1440; return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0'); };

function fitCanvas(canvas, hFn) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(220, canvas.clientWidth || 600);
  const height = Math.round(hFn(width));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const TOP = 28;
function dot(ctx, x, y, r, fill, stroke) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore(); }
function sunGlyph(ctx, x, y, r) { ctx.save(); const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.8); g.addColorStop(0, '#fff6c2'); g.addColorStop(0.45, C.yellow); g.addColorStop(1, 'rgba(255,224,102,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI); ctx.fill(); ctx.restore(); }
// A sphere lit from direction s = (right, up, towards viewer): lit half-disc plus the terminator ellipse.
function litSphere(ctx, x, y, r, s, litCol = C.lit, darkCol = C.night) {
  const n = Math.hypot(s[0], s[1], s[2]) || 1, sx = s[0] / n, sy = s[1] / n, sz = s[2] / n, th = Math.atan2(-sy, sx);
  ctx.save();
  ctx.fillStyle = darkCol; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = litCol; ctx.beginPath(); ctx.arc(x, y, r, th - Math.PI / 2, th + Math.PI / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = sz >= 0 ? litCol : darkCol; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, r * Math.abs(sz)), r, th, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = '#5a6b80'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke();
  ctx.restore();
}
// Date chart: x = day of year (1…365), month ticks thinned to fit; y ticks given.
function dateChart(ctx, W, H, o) {
  const P = { l: o.left || 38, r: W - 12, t: o.top || TOP + 12, b: H - 24 };
  const x = n => P.l + (n - 1) / (M.YEAR_DAYS - 1) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = v === (o.yZero ?? 0) ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText((o.yFmt || String)(v), P.l - 6, y(v)); }
  ctx.textBaseline = 'alphabetic';
  const labels = M.MONTH_START.map((_, m) => t('m' + m)), wMax = Math.max(...labels.map(s => ctx.measureText(s).width));
  const per = (P.r - P.l) / 12; let k = [1, 2, 3, 6].find(q => q * per >= wMax + 8) || 6;
  M.MONTH_START.forEach((n, m) => {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(n), P.b); ctx.lineTo(x(n), P.b + 4); ctx.stroke();
    if (m % k === 0) { ctx.textAlign = 'left'; ctx.fillText(labels[m], Math.min(x(n) + 2, P.r - ctx.measureText(labels[m]).width), P.b + 16); }
  });
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, 18, W - 16);
  return { x, y, P };
}
function curve(ctx, ch, fn, { color, lw = 2, dash = null, days = null } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.beginPath();
  let pen = false;
  for (let n = 1; n <= M.YEAR_DAYS; n++) {
    if (days && !days.has(n)) { pen = false; continue; }
    const X = ch.x(n), Y = ch.y(fn(n));
    if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y);
  }
  if (days && days.size === 1) { const n = [...days][0]; ctx.moveTo(ch.x(n) - 1, ch.y(fn(n))); ctx.lineTo(ch.x(n) + 1, ch.y(fn(n))); }
  ctx.stroke(); ctx.restore();
}
function nowLine(ctx, ch, n) { ctx.save(); ctx.strokeStyle = C.yellow; ctx.globalAlpha = 0.45; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(ch.x(n), ch.P.t); ctx.lineTo(ch.x(n), ch.P.b); ctx.stroke(); ctx.restore(); }

/* ---------- shared date state ---------- */
const S = { n: 3, seen: new Set([3]) };
const KEY = M.keyDates();
function setDay(n) {
  S.n = n; S.seen.add(n);
  document.querySelectorAll('.date-slider').forEach(el => { if (Number(el.value) !== n) el.value = n; });
  drawAll();
}
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick) };
}
function stopAnim(name) { const a = anims[name]; if (!a) return; cancelAnimationFrame(a.id); delete anims[name]; }
function playLabels() { document.querySelectorAll('.play-year').forEach(b => { b.textContent = anims.year ? t('pause') : t('playYear'); }); }
function playYear() {
  if (anims.year) { stopAnim('year'); playLabels(); return; }
  const n0 = S.n; let k0 = 0;
  animate('year', 14000, p => {
    const K = Math.min(M.YEAR_DAYS, Math.floor(p * M.YEAR_DAYS));
    for (let k = k0; k <= K; k++) S.seen.add(((n0 - 1 + k) % M.YEAR_DAYS) + 1);
    k0 = K; setDay(((n0 - 1 + K) % M.YEAR_DAYS) + 1);
  }, () => { playLabels(); });
  playLabels();
}

/* ---------- step 0: distance ---------- */
function draw0() {
  const n = S.n;
  $('d0v').textContent = dateText(n);
  let { ctx, W, H } = fitCanvas($('c0'), W => Math.min(W, 430));
  const cx = W / 2, cy = TOP + (H - TOP) / 2, Ro = Math.max(60, Math.min(W, H - TOP) / 2 - 30), s = Ro / 1.02;
  const P = q => ({ x: cx + s * q.y, y: cy + s * q.x }); // top view: ecliptic +y → right, +x → down
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, s, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath();
  for (let d = 1; d <= M.YEAR_DAYS + 1; d++) { const p = P(M.earthPos(((d - 1) % M.YEAR_DAYS) + 1)); if (d === 1) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
  ctx.stroke();
  ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); let pen = false;
  for (let d = 1; d <= M.YEAR_DAYS + 1; d++) { const dd = ((d - 1) % M.YEAR_DAYS) + 1; if (!S.seen.has(dd)) { pen = false; continue; } const p = P(M.earthPos(dd)); if (!pen) { ctx.moveTo(p.x, p.y); pen = true; } else ctx.lineTo(p.x, p.y); }
  ctx.stroke();
  // month names just outside the orbit, at mid-month
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  M.MONTH_START.forEach((st, m) => { const q = M.earthPos(st + 14), a = Math.atan2(q.x, q.y); ctx.fillText(t('m' + m), cx + (s + 18) * Math.cos(a), cy + (s + 18) * Math.sin(a)); });
  ctx.restore();
  dot(ctx, P(M.earthPos(KEY.perihelion)).x, P(M.earthPos(KEY.perihelion)).y, 4.5, C.pink);
  dot(ctx, P(M.earthPos(KEY.aphelion)).x, P(M.earthPos(KEY.aphelion)).y, 4.5, C.violet);
  sunGlyph(ctx, cx, cy, 11);
  const E = P(M.earthPos(n));
  ctx.save(); ctx.strokeStyle = 'rgba(255,224,102,0.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(E.x, E.y); ctx.stroke(); ctx.restore();
  dot(ctx, E.x, E.y, 7, C.cyan, C.bg);
  title(ctx, t('c0a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c0b'), W => Math.min(W, 430) * 0.75 + 20));
  const ch = dateChart(ctx, W, H, { yMin: 146.6, yMax: 152.6, yTicks: [147, 148, 149, 150, 151, 152], left: 40, title: t('c0b') });
  nowLine(ctx, ch, n);
  curve(ctx, ch, M.distanceMkm, { color: C.faint, lw: 1.6, dash: [4, 4] });
  curve(ctx, ch, M.distanceMkm, { color: C.text, lw: 2.6, days: S.seen });
  dot(ctx, ch.x(KEY.perihelion), ch.y(M.distanceMkm(KEY.perihelion)), 4.5, C.pink);
  dot(ctx, ch.x(KEY.aphelion), ch.y(M.distanceMkm(KEY.aphelion)), 4.5, C.violet);
  dot(ctx, ch.x(n), ch.y(M.distanceMkm(n)), 6, C.cyan, C.bg);
  const sn = M.seasonNorth(n);
  $('r0').textContent = (S.seen.size < M.YEAR_DAYS ? t('s0prog', { k: S.seen.size }) : '') + t('s0readout', { date: dateText(n), dist: M.distanceMkm(n).toFixed(2), pct: (100 * M.relIntensity(n)).toFixed(1), sn: t(sn), ss: t(M.opposite[sn]), qn: Math.round(M.dailyInsolation(40, n)), qs: Math.round(M.dailyInsolation(-40, n)) });
  const dMin = M.distanceMkm(KEY.perihelion), dMax = M.distanceMkm(KEY.aphelion);
  $('h0').textContent = t('s0hint', { span: fmt(dMax - dMin, 1), spanPct: fmt(100 * (dMax - dMin) / M.AU_MKM, 1), lo: fmt(100 * M.relIntensity(KEY.aphelion), 1), hi: fmt(100 * M.relIntensity(KEY.perihelion), 1) });
}

/* ---------- step 1: the tilted axis ---------- */
const VIEW_ALT = 22 * D2R;
const proj3 = v => ({ x: v[1], y: -v[0] * Math.sin(VIEW_ALT) + v[2] * Math.cos(VIEW_ALT), z: v[0] * Math.cos(VIEW_ALT) + v[2] * Math.sin(VIEW_ALT) });
const h1 = W => { const Rx = Math.max(80, W / 2 - 40); return TOP + 2 * (Rx * Math.sin(VIEW_ALT) + 40); };
function draw1() {
  const n = S.n, dec = M.declination(n);
  $('d1v').textContent = dateText(n);
  let { ctx, W, H } = fitCanvas($('c1'), h1);
  const Rx = Math.max(80, W / 2 - 40), cx = W / 2, cy = TOP + (H - TOP) / 2 + 4, re = Math.max(9, Math.min(15, W / 40));
  const scr = q => { const p = proj3([q.x, q.y, 0]); return { x: cx + Rx * p.x, y: cy - Rx * p.y, z: p.z }; };
  const orbit = []; for (let d = 1; d <= M.YEAR_DAYS + 1; d++) orbit.push(scr(M.earthPos(((d - 1) % M.YEAR_DAYS) + 1)));
  const half = back => { ctx.save(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.6; ctx.beginPath(); let pen = false; orbit.forEach(p => { if ((p.z < 0) !== back) { pen = false; return; } if (!pen) { ctx.moveTo(p.x, p.y); pen = true; } else ctx.lineTo(p.x, p.y); }); ctx.stroke(); ctx.restore(); };
  const ax = [0, Math.sin(M.TILT * D2R), Math.cos(M.TILT * D2R)], A = proj3(ax);
  const earth = (d, alpha, r) => {
    const q = M.earthPos(d), p = scr(q), sd = proj3([-q.x / q.r, -q.y / q.r, 0]);
    ctx.save(); ctx.globalAlpha = alpha;
    litSphere(ctx, p.x, p.y, r, [sd.x, sd.y, sd.z]);
    const L = r * 1.7;
    ctx.lineWidth = 2; ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - A.x * L, p.y + A.y * L); ctx.stroke();
    ctx.strokeStyle = C.pink; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + A.x * L, p.y - A.y * L); ctx.stroke();
    ctx.restore(); return p;
  };
  const ghosts = [KEY.marchEquinox, KEY.juneSolstice, KEY.septEquinox, KEY.decSolstice].filter(d => Math.min(Math.abs(d - n), M.YEAR_DAYS - Math.abs(d - n)) > 8);
  half(true);
  ghosts.filter(d => scr(M.earthPos(d)).z < 0).forEach(d => earth(d, 0.4, re * 0.8));
  if (scr(M.earthPos(n)).z < 0) earth(n, 1, re);
  sunGlyph(ctx, cx, cy, 13);
  half(false);
  ghosts.filter(d => scr(M.earthPos(d)).z >= 0).forEach(d => earth(d, 0.4, re * 0.8));
  if (scr(M.earthPos(n)).z >= 0) earth(n, 1, re);
  title(ctx, t('c1a'), 8, 18, W - 16);
  // side view: sunlight from the right, axis leaning towards the Sun by δ
  ({ ctx, W, H } = fitCanvas($('c1b'), () => h1($('c1').clientWidth || W)));
  const r = Math.max(40, Math.min((H - TOP) / 2 - 22, W / 2 - 46)), X0 = W / 2 - 8, Y0 = TOP + (H - TOP) / 2 + 2;
  ctx.save(); ctx.strokeStyle = 'rgba(255,224,102,0.55)'; ctx.lineWidth = 1.4;
  for (let i = -2; i <= 2; i++) { const yy = Y0 + i * r * 0.42, xe = X0 + Math.sqrt(Math.max(0, r * r - (i * r * 0.42) ** 2)) + 6; ctx.beginPath(); ctx.moveTo(W - 6, yy); ctx.lineTo(xe, yy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xe, yy); ctx.lineTo(xe + 6, yy - 3.5); ctx.moveTo(xe, yy); ctx.lineTo(xe + 6, yy + 3.5); ctx.stroke(); }
  ctx.restore();
  litSphere(ctx, X0, Y0, r, [1, 0, 0]);
  const d = dec * D2R, a = [Math.sin(d), -Math.cos(d)], pp = [Math.cos(d), Math.sin(d)];
  const chord = (lat, color, dash, lw = 1.6) => { const s = Math.sin(lat * D2R), c = Math.cos(lat * D2R); const mx = X0 + a[0] * r * s, my = Y0 + a[1] * r * s; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(mx - pp[0] * r * c, my - pp[1] * r * c); ctx.lineTo(mx + pp[0] * r * c, my + pp[1] * r * c); ctx.stroke(); ctx.restore(); };
  chord(0, '#55657a', null, 2); chord(M.TILT, C.orange, [5, 4]); chord(-M.TILT, C.orange, [5, 4]); chord(90 - M.TILT, C.cyan, [4, 4]); chord(-(90 - M.TILT), C.cyan, [4, 4]);
  ctx.save(); ctx.lineWidth = 2.4; ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0 - a[0] * r * 1.25, Y0 - a[1] * r * 1.25); ctx.stroke();
  ctx.strokeStyle = C.pink; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0 + a[0] * r * 1.25, Y0 + a[1] * r * 1.25); ctx.stroke(); ctx.restore();
  dot(ctx, X0 + r, Y0, 5.5, C.yellow, C.bg);
  title(ctx, t('c1b'), 8, 18, W - 16);
  const v = fmt(Math.abs(dec), 2), sub = Math.abs(dec) < 0.005 ? t('sub0') : t(dec > 0 ? 'subN' : 'subS', { v });
  $('r1').textContent = t('s1readout', { date: dateText(n), sub, lean: Math.abs(dec) < 0.5 ? t('lean0') : t(dec > 0 ? 'leanN' : 'leanS') });
}

/* ---------- step 2: noon Sun height ---------- */
function draw2() {
  const n = S.n, lat = num('lat2'), dec = M.declination(n), h = M.noonAltitude(lat, dec);
  $('d2v').textContent = dateText(n); $('lat2v').textContent = latText(lat);
  let { ctx, W, H } = fitCanvas($('c2'), W => Math.min(300, Math.round(W / 2 + 100)));
  const gy = H - 42, X0 = W / 2, Rs = Math.max(60, Math.min(W / 2 - 34, gy - TOP - 30));
  // sky arc and ground
  ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.arc(X0, gy, Rs, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = C.ground; ctx.fillRect(10, gy, W - 20, 6);
  ctx.strokeStyle = '#6b7f6c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(10, gy); ctx.lineTo(W - 10, gy); ctx.stroke();
  ctx.fillStyle = C.muted; ctx.font = '600 12px system-ui,sans-serif'; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText(t('north1'), 12, gy + 24); ctx.textAlign = 'right'; ctx.fillText(t('south1'), W - 12, gy + 24);
  ctx.restore();
  const side = lat > dec + 1e-9 ? 1 : lat < dec - 1e-9 ? -1 : 1; // Sun due south → right, due north → left
  const w = 30;
  if (h > 0) {
    const hr = h * D2R, u = [side * Math.cos(hr), -Math.sin(hr)], q = [-u[1], u[0]];
    const Lf = w / Math.sin(hr), Lc = Math.min(Lf, W - 30);
    const xa = X0 - Lf / 2, xb = X0 + Lf / 2, far = Rs + 10;
    ctx.save(); ctx.beginPath(); ctx.rect(10, TOP + 4, W - 20, gy - TOP - 4); ctx.clip();
    ctx.fillStyle = 'rgba(255,224,102,0.22)'; ctx.strokeStyle = 'rgba(255,224,102,0.8)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(xa, gy); ctx.lineTo(xa + u[0] * far, gy + u[1] * far); ctx.lineTo(xb + u[0] * far, gy + u[1] * far); ctx.lineTo(xb, gy); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    // beam width marker (perpendicular to the beam) — same w as the overhead patch
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; const mx = X0 + u[0] * Rs * 0.55, my = gy + u[1] * Rs * 0.55;
    if (my > TOP + 8) { ctx.beginPath(); ctx.moveTo(mx - q[0] * w / 2, my - q[1] * w / 2); ctx.lineTo(mx + q[0] * w / 2, my + q[1] * w / 2); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(Math.max(12, X0 - Lc / 2), gy); ctx.lineTo(Math.min(W - 12, X0 + Lc / 2), gy); ctx.stroke(); ctx.restore();
    // angle arc at the patch centre
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.2; ctx.beginPath(); if (side > 0) ctx.arc(X0, gy, 26, -hr, 0); else ctx.arc(X0, gy, 26, Math.PI, Math.PI + hr); ctx.stroke(); ctx.restore();
    sunGlyph(ctx, X0 + side * Rs * Math.cos(hr), gy - Rs * Math.sin(hr), 11);
  } else {
    ctx.save(); ctx.globalAlpha = 0.35; sunGlyph(ctx, X0 + side * Rs * 0.92, gy + 6, 9); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X0 - w / 2, gy + 14); ctx.lineTo(X0 + w / 2, gy + 14); ctx.stroke(); ctx.restore();
  title(ctx, t('c2a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c2b'), () => 300));
  const ch = dateChart(ctx, W, H, { yMin: -30, yMax: 95, yTicks: [-30, 0, 30, 60, 90], yFmt: v => v + '°', title: t('c2b') });
  nowLine(ctx, ch, n);
  curve(ctx, ch, d => M.noonAltitude(lat, M.declination(d)), { color: C.cyan, lw: 2.2 });
  dot(ctx, ch.x(n), ch.y(h), 6, C.yellow, C.bg);
  const args = { date: dateText(n), lat: latText(lat), phi: lat, dec: fmt(dec, 2), h: fmt(h, 2) };
  if (h <= 0) { $('r2').textContent = t('s2below', args); return; }
  const dir = Math.abs(lat - dec) < 0.005 ? t('dirZ') : t(lat > dec ? 'dirS' : 'dirN');
  $('r2').textContent = t('s2readout', { ...args, dir, stretch: fmt(1 / Math.sin(h * D2R), 2), pct: fmt(100 * Math.sin(h * D2R), 0) });
}

/* ---------- step 3: day length ---------- */
function draw3() {
  const n = S.n, lat = num('lat3'), dec = M.declination(n), dl = M.dayLength(lat, dec);
  $('d3v').textContent = dateText(n); $('lat3v').textContent = latText(lat);
  let { ctx, W, H } = fitCanvas($('c3'), () => 300);
  const cx = W / 2, cy = TOP + (H - TOP) / 2 + 2, R = Math.max(50, Math.min(W / 2 - 28, (H - TOP) / 2 - 24));
  const ang = hr => Math.PI / 2 + hr / 24 * 2 * Math.PI;
  ctx.save(); ctx.lineCap = 'butt';
  ctx.strokeStyle = C.night; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
  if (dl.hours > 0) { ctx.strokeStyle = C.yellow; ctx.beginPath(); if (dl.hours >= 24) ctx.arc(cx, cy, R, 0, 2 * Math.PI); else ctx.arc(cx, cy, R, ang(12 - dl.hours / 2), ang(12 + dl.hours / 2)); ctx.stroke(); }
  ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2;
  for (let k = 0; k < 24; k++) { const a = ang(k); ctx.beginPath(); ctx.moveTo(cx + (R - 8) * Math.cos(a), cy + (R - 8) * Math.sin(a)); ctx.lineTo(cx + (R + 8) * Math.cos(a), cy + (R + 8) * Math.sin(a)); ctx.stroke(); }
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [0, 6, 12, 18].forEach(k => { const a = ang(k); ctx.fillText(String(k), cx + (R + 18) * Math.cos(a), cy + (R + 18) * Math.sin(a)); });
  // hand pointing at noon, Earth's spin direction is irrelevant here: the dial is local solar time
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - R + 14); ctx.stroke();
  ctx.restore();
  sunGlyph(ctx, cx, cy - R + 26, 6);
  title(ctx, t('c3a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c3b'), () => 300));
  const ch = dateChart(ctx, W, H, { yMin: 0, yMax: 24.5, yTicks: [0, 6, 12, 18, 24], title: t('c3b') });
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(ch.P.l, ch.y(12)); ctx.lineTo(ch.P.r, ch.y(12)); ctx.stroke(); ctx.restore();
  nowLine(ctx, ch, n);
  const f = d => M.dayLength(lat, M.declination(d)).hours;
  curve(ctx, ch, f, { color: C.faint, lw: 2 });
  curve(ctx, ch, f, { color: C.cyan, lw: 2.6, days: S.seen });
  dot(ctx, ch.x(n), ch.y(dl.hours), 6, C.yellow, C.bg);
  let lo = 24, hi = 0; for (let d = 1; d <= M.YEAR_DAYS; d++) { const v = f(d); lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const a = { date: dateText(n), lat: latText(lat) };
  const main = dl.kind === 'polarDay' ? t('s3polarDay', a) : dl.kind === 'polarNight' ? t('s3polarNight', a) : t('s3readout', { ...a, len: hm(dl.hours), rise: clock(12 - dl.hours / 2), set: clock(12 + dl.hours / 2) });
  $('r3').textContent = main + ' ' + t('s3range', { min: hm(lo), max: hm(hi) });
}

/* ---------- step 4: turn the tilt ---------- */
function tiltStats(eps) {
  let hmin = 90, hmax = -90, dmin = 24, dmax = 0;
  for (let d = 1; d <= M.YEAR_DAYS; d++) { const dec = M.declination(d, eps), h = M.noonAltitude(40, dec), L = M.dayLength(40, dec).hours; hmin = Math.min(hmin, h); hmax = Math.max(hmax, h); dmin = Math.min(dmin, L); dmax = Math.max(dmax, L); }
  return { hmin, hmax, dmin, dmax };
}
function draw4() {
  const n = S.n, eps = num('tilt4');
  $('tilt4v').textContent = fmt(eps, 2) + '°';
  let { ctx, W, H } = fitCanvas($('c4'), () => 290);
  let ch = dateChart(ctx, W, H, { yMin: 0, yMax: 95, yTicks: [0, 30, 60, 90], yFmt: v => v + '°', title: t('c4a') });
  nowLine(ctx, ch, n);
  curve(ctx, ch, d => M.noonAltitude(-40, M.declination(d, eps)), { color: C.cyan, lw: 2.4 });
  curve(ctx, ch, d => M.noonAltitude(40, M.declination(d, eps)), { color: C.orange, lw: 2.4, dash: eps < 0.05 ? [6, 6] : null });
  ({ ctx, W, H } = fitCanvas($('c4b'), () => 290));
  ch = dateChart(ctx, W, H, { yMin: -90, yMax: 90, yTicks: [-90, -45, 0, 45, 90], yFmt: v => (v === 0 ? '0°' : Math.abs(v) + (v > 0 ? '°N' : '°S')), left: 44, title: t('c4b') });
  ctx.save();
  if (eps > 0) {
    ctx.fillStyle = 'rgba(255,180,84,0.18)'; ctx.fillRect(ch.P.l, ch.y(eps), ch.P.r - ch.P.l, ch.y(-eps) - ch.y(eps));
    ctx.fillStyle = 'rgba(103,215,249,0.16)'; ctx.fillRect(ch.P.l, ch.y(90), ch.P.r - ch.P.l, ch.y(90 - eps) - ch.y(90)); ctx.fillRect(ch.P.l, ch.y(-(90 - eps)), ch.P.r - ch.P.l, ch.y(-90) - ch.y(-(90 - eps)));
  }
  ctx.restore();
  nowLine(ctx, ch, n);
  curve(ctx, ch, d => M.declination(d, eps), { color: C.yellow, lw: 2.6 });
  dot(ctx, ch.x(n), ch.y(M.declination(n, eps)), 5.5, C.yellow, C.bg);
  if (eps < 0.05) { $('r4').textContent = t('s4zero', { h: fmt(M.noonAltitude(40, 0), 0) }); return; }
  const st = tiltStats(eps);
  $('r4').textContent = t('s4readout', { eps: fmt(eps, 2), hmin: fmt(st.hmin, 1), hmax: fmt(st.hmax, 1), swing: fmt(st.hmax - st.hmin, 1), dmin: hm(st.dmin), dmax: hm(st.dmax), polar: fmt(90 - eps, 2) });
}

function drawAll() { draw0(); draw1(); draw2(); draw3(); draw4(); }
function refresh() {
  drawAll(); playLabels();
  $('boundary').textContent = t('boundary', { extra: fmt(100 * (M.relIntensity(KEY.perihelion) / M.relIntensity(KEY.aphelion) - 1), 0) });
}
function setup() {
  document.querySelectorAll('.date-slider').forEach(el => el.addEventListener('input', () => { stopAnim('year'); playLabels(); setDay(Number(el.value)); }));
  document.querySelectorAll('.play-year').forEach(b => b.addEventListener('click', playYear));
  $('lat2').addEventListener('input', draw2);
  document.querySelectorAll('[data-lat2]').forEach(b => b.addEventListener('click', () => { $('lat2').value = b.dataset.lat2; draw2(); }));
  $('lat3').addEventListener('input', draw3);
  document.querySelectorAll('[data-lat3]').forEach(b => b.addEventListener('click', () => { $('lat3').value = b.dataset.lat3; draw3(); }));
  $('tilt4').addEventListener('input', draw4);
  $('real4').addEventListener('click', () => { $('tilt4').value = String(M.TILT); draw4(); });
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && anims.year) { stopAnim('year'); playLabels(); } });
  window.refreshSeasons = refresh;
  S.n = num('d0'); S.seen = new Set([S.n]);
  refresh();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
