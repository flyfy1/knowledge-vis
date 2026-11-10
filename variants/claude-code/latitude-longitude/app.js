'use strict';
// Latitude & longitude lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every point, curve and readout comes from window.LATLON_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and grid numbers laid out in fixed rows; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.LATLON_MODEL;
const t = (...a) => window.LATLON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', blue: '#5b8def', yellow: '#ffe066', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ocean: '#13314b', ocean2: '#0c2236', land: '#3e5a43', gline: 'rgba(170,190,210,0.20)', ref: 'rgba(232,237,244,0.75)', night: 'rgba(3,6,10,0.62)' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const D2R = Math.PI / 180;
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const km = v => Math.round(v).toLocaleString('en-US');
const latText = v => (Math.abs(v) < 0.05 ? t('fEq') : t(v > 0 ? 'fN' : 'fS', { v: fmt(Math.abs(v)) }));
const lonText = v => { const a = Math.abs(v); if (a < 0.05) return t('fPM'); if (a > 179.95) return t('f180'); return t(v > 0 ? 'fE' : 'fW', { v: fmt(a) }); };
const latTick = v => (v === 0 ? '0°' : Math.abs(v) + (v > 0 ? '°N' : '°S'));
const lonTick = v => { const w = M.wrapLon(v); return w === 0 ? '0°' : Math.abs(w) === 180 ? '180°' : Math.abs(w) + (w > 0 ? '°E' : '°W'); };

// CSS height comes from hFn(width) every time; only the bitmap follows the DPR (idempotent under resize).
function fitCanvas(canvas, hFn) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(220, canvas.clientWidth || 600);
  const height = Math.round(hFn(width));
  if (canvas.style.height !== height + 'px') canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Panel title in its own row; shrinks until it fits.
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const TOP = 28; // title row height

/* ---------- globe (orthographic) ---------- */
const globeH = W => Math.min(W, 470) + TOP - 6;
function makeGlobe(ctx, W, H, lat0, lon0) {
  const r = Math.max(40, Math.min(W / 2 - 14, (H - TOP - 12) / 2));
  const G = { ctx, cx: W / 2, cy: TOP + (H - TOP) / 2, r, lat0, lon0 };
  G.p = (lat, lon) => { const q = M.ortho(lat, lon, lat0, lon0); return { x: G.cx + r * q.x, y: G.cy - r * q.y, z: q.z, ux: q.x, uy: q.y }; };
  G.pv = v => { const q = M.orthoVec(v, lat0, lon0); return { x: G.cx + r * q.x, y: G.cy - r * q.y, z: q.z }; };
  return G;
}
function globeLand(G) {
  const { ctx, cx, cy, r } = G;
  ctx.save(); ctx.fillStyle = C.land;
  for (const ring of M.LAND_DENSE) {
    const P = ring.map(([lon, lat]) => G.p(lat, lon));
    if (!P.some(q => q.z > 0)) continue;
    ctx.beginPath(); let prevA = null;
    P.forEach((q, i) => {
      if (q.z >= 0) { if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); prevA = null; return; }
      const a = Math.atan2(-q.uy, q.ux); // hidden point → its direction on the limb
      if (prevA === null) { const X = cx + r * Math.cos(a), Y = cy + r * Math.sin(a); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      else { let d = a - prevA; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; ctx.arc(cx, cy, r, prevA, prevA + d, d < 0); }
      prevA = a;
    });
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// Draw a lat/lon polyline on the globe: near side solid, far side optionally faint.
function globeLine(G, pts, { color = C.text, lw = 1.5, dash = null, back = 0 } = {}) {
  const { ctx } = G, P = pts.map(q => G.p(q.lat, q.lon));
  const pass = front => {
    ctx.beginPath(); let pen = false;
    for (let i = 0; i < P.length; i++) {
      const on = front ? P[i].z >= 0 : P[i].z < 0;
      if (!on) { pen = false; continue; }
      if (!pen) { ctx.moveTo(P[i].x, P[i].y); pen = true; } else ctx.lineTo(P[i].x, P[i].y);
    }
    ctx.stroke();
  };
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (back > 0) { ctx.globalAlpha = back; ctx.setLineDash([3, 4]); pass(false); ctx.globalAlpha = 1; }
  ctx.setLineDash(dash || []); pass(true); ctx.restore();
}
const parallelPts = (lat, a = -180, b = 180, step = 2) => { const out = []; const n = Math.max(1, Math.ceil(Math.abs(b - a) / step)); for (let i = 0; i <= n; i++) out.push({ lat, lon: a + (b - a) * i / n }); return out; };
const meridianPts = (lon, a = -90, b = 90, step = 2) => { const out = []; const n = Math.max(1, Math.ceil(Math.abs(b - a) / step)); for (let i = 0; i <= n; i++) out.push({ lat: a + (b - a) * i / n, lon }); return out; };
function globeBase(G, { grid = 15, refs = true } = {}) {
  const { ctx, cx, cy, r } = G;
  ctx.save();
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, C.ocean); g.addColorStop(1, C.ocean2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();
  ctx.restore();
  globeLand(G);
  for (let lat = -90 + grid; lat < 90; lat += grid) if (lat !== 0) globeLine(G, parallelPts(lat), { color: C.gline, lw: 1 });
  for (let lon = -180; lon < 180; lon += grid) if (lon !== 0) globeLine(G, meridianPts(lon), { color: C.gline, lw: 1 });
  if (refs) { globeLine(G, parallelPts(0), { color: C.ref, lw: 1.4 }); globeLine(G, meridianPts(0), { color: C.ref, lw: 1.4, dash: [6, 4] }); }
  ctx.save(); ctx.strokeStyle = '#3d5671'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, rad, fill, stroke) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, rad, 0, 2 * Math.PI); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore(); }
function star(ctx, x, y, R, fill) {
  ctx.save(); ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.45 : R; ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#3a2c00'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
}

/* ---------- flat maps (plate carrée / Mercator) ---------- */
const MAP_L = 42, MAP_R = 10, MAP_B = 22;
function mapPlotW(W) { return W - MAP_L - MAP_R; }
const mapH = (kind, extraTop = 0) => W => TOP + extraTop + mapPlotW(W) * (2 * M.PROJ[kind].yMax) / (2 * Math.PI) + MAP_B;
function makeMap(ctx, W, H, kind, extraTop = 0) {
  const P = M.PROJ[kind], pw = mapPlotW(W), ph = pw * (2 * P.yMax) / (2 * Math.PI);
  const L = MAP_L, T = TOP + extraTop;
  const m = { ctx, kind, L, T, R: L + pw, B: T + ph, pw, ph };
  m.x = lon => L + (P.x(lon) + Math.PI) / (2 * Math.PI) * pw;
  m.y = lat => T + (P.yMax - P.y(lat)) / (2 * P.yMax) * ph;
  return m;
}
function mapBase(m, { latStep = 30 } = {}) {
  const { ctx } = m;
  ctx.save();
  ctx.fillStyle = C.ocean2; ctx.fillRect(m.L, m.T, m.pw, m.ph);
  ctx.fillStyle = C.land;
  for (const ring of M.LAND_DENSE) { ctx.beginPath(); ring.forEach(([lon, lat], i) => { const X = m.x(lon), Y = m.y(lat); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = C.gline; ctx.lineWidth = 1;
  const latMax = m.kind === 'mercator' ? M.MERC_MAX : 90;
  for (let lat = -90 + 15; lat < 90; lat += 15) { if (Math.abs(lat) > latMax || lat === 0) continue; ctx.beginPath(); ctx.moveTo(m.L, m.y(lat)); ctx.lineTo(m.R, m.y(lat)); ctx.stroke(); }
  for (let lon = -165; lon < 180; lon += 15) { if (lon === 0) continue; ctx.beginPath(); ctx.moveTo(m.x(lon), m.T); ctx.lineTo(m.x(lon), m.B); ctx.stroke(); }
  ctx.strokeStyle = C.ref; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(m.L, m.y(0)); ctx.lineTo(m.R, m.y(0)); ctx.stroke();
  ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(m.x(0), m.T); ctx.lineTo(m.x(0), m.B); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#3d5671'; ctx.strokeRect(m.L, m.T, m.pw, m.ph);
  // ticks
  ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let lat = -90 + latStep; lat < 90; lat += latStep) { if (Math.abs(lat) > latMax) continue; ctx.fillText(latTick(lat), m.L - 5, m.y(lat)); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const lonStep = m.pw >= 360 ? 60 : 90;
  for (let lon = -180; lon <= 180; lon += lonStep) {
    const X = m.x(lon); ctx.textAlign = lon === -180 ? 'left' : lon === 180 ? 'right' : 'center';
    ctx.fillText(lonTick(lon), lon === -180 ? m.L : lon === 180 ? m.R : X, m.B + 15);
  }
  ctx.restore();
}
function mapLine(m, pts, { color, lw = 2, dash = null } = {}) {
  const { ctx } = m; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.beginPath();
  let prev = null;
  pts.forEach(q => { const X = m.x(q.lon), Y = m.y(q.lat); if (prev && Math.abs(q.lon - prev.lon) > 180) ctx.moveTo(X, Y); else if (prev) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); prev = q; });
  ctx.stroke(); ctx.restore();
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name, finish = false) { const a = anims[name]; if (!a) return; cancelAnimationFrame(a.id); delete anims[name]; if (finish) { a.frame(1); if (a.done) a.done(); } }

/* ---------- step 0: two angles ---------- */
function draw0() {
  const lat = num('lat0'), lon = num('lon0'), view = num('view0');
  $('lat0v').textContent = latText(lat); $('lon0v').textContent = lonText(lon); $('view0v').textContent = lonTick(view);
  let { ctx, W, H } = fitCanvas($('c0'), globeH);
  const G = makeGlobe(ctx, W, H, 20, view);
  globeBase(G);
  // the point's parallel and meridian
  globeLine(G, parallelPts(lat), { color: C.orange, lw: 2.4, back: 0.35 });
  if (Math.abs(lat) < 89.95) globeLine(G, meridianPts(lon), { color: C.cyan, lw: 2.4, back: 0.35 });
  // angle wedges seen from the centre
  const O = G.pv([0, 0, 0]);
  const wedge = (pts, fill, stroke) => { ctx.save(); ctx.beginPath(); ctx.moveTo(O.x, O.y); pts.forEach(p => ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); };
  const sc = (v, k) => [v[0] * k, v[1] * k, v[2] * k];
  const lonPts = [], latPts = [];
  for (let i = 0; i <= 40; i++) lonPts.push(G.pv(sc(M.vec(0, lon * i / 40), 0.3)));
  for (let i = 0; i <= 40; i++) latPts.push(G.pv(sc(M.vec(lat * i / 40, lon), 0.45)));
  const spoke = (v, color) => { const p = G.pv(v); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.setLineDash(p.z < 0 ? [3, 3] : []); ctx.beginPath(); ctx.moveTo(O.x, O.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore(); };
  spoke(M.vec(0, 0), C.ref); spoke(M.vec(0, lon), C.cyan); spoke(M.vec(lat, lon), C.orange);
  if (Math.abs(lon) > 0.05) wedge(lonPts, 'rgba(103,215,249,0.35)', C.cyan);
  if (Math.abs(lat) > 0.05) wedge(latPts, 'rgba(255,180,84,0.42)', C.orange);
  dot(ctx, O.x, O.y, 2.5, C.text);
  const P = G.p(lat, lon), behind = P.z < 0;
  ctx.save(); ctx.globalAlpha = behind ? 0.4 : 1; dot(ctx, P.x, P.y, 6, C.text, C.orange); ctx.restore();
  title(ctx, t('c0a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c0b'), mapH('plate')));
  const m = makeMap(ctx, W, H, 'plate'); mapBase(m);
  ctx.save(); ctx.lineWidth = 2;
  ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(m.L, m.y(lat)); ctx.lineTo(m.R, m.y(lat)); ctx.stroke();
  ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(m.x(lon), m.T); ctx.lineTo(m.x(lon), m.B); ctx.stroke(); ctx.restore();
  dot(ctx, m.x(lon), m.y(lat), 5.5, C.text, C.orange);
  title(ctx, t('c0b'), 8, 18, W - 16);
  const pole = Math.abs(lat) > 89.95;
  const latMeaning = Math.abs(lat) < 0.05 ? t('s0lat0') : t(lat > 0 ? 's0latN' : 's0latS', { v: fmt(Math.abs(lat)) });
  const lonMeaning = pole ? t('s0pole') : Math.abs(lon) < 0.05 ? t('s0lon0') : Math.abs(lon) > 179.95 ? t('s0lon180') : t(lon > 0 ? 's0lonE' : 's0lonW', { v: fmt(Math.abs(lon)) });
  $('r0').textContent = t('s0readout', { lat: latText(lat), lon: pole ? '—' : lonText(lon), latMeaning, lonMeaning, back: behind ? t('s0back') : '' });
}

/* ---------- step 1: read a point ---------- */
const s1 = { idx: 0, round: 1, checked: false, hist: [] };
const target1 = () => { const key = M.QUIZ_ORDER[s1.idx]; return { key, ...M.CITIES[key] }; };
const view1 = tg => ({ lat: Math.max(-30, Math.min(30, Math.round(tg.lat / 2 / 5) * 5)), lon: M.wrapLon(Math.round(tg.lon / 30) * 30 - 20) });
const cityName = key => t('c' + key[0].toUpperCase() + key.slice(1));
function draw1() {
  const gl = num('g1lat'), gn = num('g1lon'), tg = target1(), v = view1(tg);
  $('g1latv').textContent = latText(gl); $('g1lonv').textContent = lonText(gn);
  const { ctx, W, H } = fitCanvas($('c1'), W => Math.min(W, 460) + TOP - 6);
  const G = makeGlobe(ctx, W, H, v.lat, v.lon);
  globeBase(G);
  // grid numbers: longitudes under the equator, latitudes beside the central meridian
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = '#c3d0de'; ctx.textBaseline = 'alphabetic';
  for (let lon = -180; lon < 180; lon += 30) {
    const d = M.wrapLon(lon - v.lon); if (Math.abs(d) > 62) continue;
    const p = G.p(0, lon); if (p.z < 0.2) continue;
    ctx.textAlign = 'center'; ctx.fillText(lonTick(lon), p.x, p.y + 14);
  }
  for (const lat of [-60, -30, 30, 60]) {
    const p = G.p(lat, v.lon); if (p.z < 0.2) continue;
    ctx.textAlign = 'left'; ctx.fillText(latTick(lat), p.x + 4, p.y - 4);
  }
  ctx.restore();
  const T = G.p(tg.lat, tg.lon), Q = G.p(gl, gn);
  if (s1.checked) globeLine(G, M.greatCirclePoints(gl, gn, tg.lat, tg.lon, 60), { color: C.pink, lw: 2, dash: [5, 4], back: 0.3 });
  star(ctx, T.x, T.y, 9, C.yellow);
  ctx.save(); ctx.globalAlpha = Q.z < 0 ? 0.35 : 1; ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(Q.x - 8, Q.y); ctx.lineTo(Q.x + 8, Q.y); ctx.moveTo(Q.x, Q.y - 8); ctx.lineTo(Q.x, Q.y + 8); ctx.stroke(); ctx.restore();
  title(ctx, t('c1'), 8, 18, W - 16);
  if (s1.checked) {
    const d = M.distance(gl, gn, tg.lat, tg.lon);
    $('r1').textContent = t('s1after', { round: s1.round, city: cityName(tg.key), lat: latText(tg.lat), lon: lonText(tg.lon), km: km(d), grade: t('grade' + { great: 'Great', close: 'Close', far: 'Far' }[M.quizGrade(d)]) });
  } else $('r1').textContent = t('s1before', { round: s1.round, lat: latText(gl), lon: lonText(gn) });
  const done = s1.hist.filter(x => x !== undefined);
  $('h1').textContent = done.length ? t('s1hist', { n: done.length, list: done.map(km).join(', ') }) : t('s1histNone');
}
function check1() { const tg = target1(); s1.checked = true; s1.hist[s1.round - 1] = M.distance(num('g1lat'), num('g1lon'), tg.lat, tg.lon); draw1(); }
function next1() { s1.idx = (s1.idx + 1) % M.QUIZ_ORDER.length; s1.round++; s1.checked = false; const v = view1(target1()); $('g1lat').value = v.lat; $('g1lon').value = v.lon; draw1(); }

/* ---------- step 2: how long is one degree ---------- */
const s2 = { seen: new Set([0, 46]) };
function draw2() {
  const lat = num('lat2'); s2.seen.add(lat);
  $('lat2v').textContent = lat + '°';
  let { ctx, W, H } = fitCanvas($('c2'), () => 330);
  const r = Math.max(50, Math.min(W / 2 - 34, (H - TOP - 52) / 2)), cx = W / 2, cy = TOP + 22 + r;
  ctx.save();
  ctx.fillStyle = C.ocean2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill(); ctx.strokeStyle = '#3d5671'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.setLineDash([5, 4]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy - r - 12); ctx.lineTo(cx, cy + r + 12); ctx.stroke();
  ctx.strokeStyle = C.ref; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke(); ctx.setLineDash([]);
  const c = Math.cos(lat * D2R), s = Math.sin(lat * D2R), Y = cy - r * s, rx = r * c;
  // the parallel, seen slightly from above as a flat ellipse
  if (rx > 0.5) { ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(cx, Y, rx, Math.max(1, rx * 0.16), 0, 0, 2 * Math.PI); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rx, Y); ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(cx, Y); ctx.lineTo(cx + rx, Y); ctx.stroke();
  // latitude angle at the centre
  if (lat > 0) { ctx.strokeStyle = C.text; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(cx, cy, Math.min(26, r * 0.3), -lat * D2R, 0); ctx.stroke(); }
  dot(ctx, cx + rx, Y, 4.5, C.orange);
  ctx.fillStyle = C.muted; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - r - 15); ctx.fillText('S', cx, cy + r + 24);
  ctx.restore();
  title(ctx, t('c2a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c2b'), () => 330));
  const P = { l: 40, r: W - 12, t: TOP + 14, b: H - 26 };
  const X = v => P.l + v / 90 * (P.r - P.l), Yk = v => P.b - v / 125 * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  for (const v of [0, 40, 80, 120]) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, Yk(v)); ctx.lineTo(P.r, Yk(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, Yk(v) + 4); }
  const xs = P.r - P.l >= 300 ? 15 : 30;
  ctx.textAlign = 'center'; for (let v = 0; v <= 90; v += xs) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(v), P.b); ctx.lineTo(X(v), P.b + 4); ctx.stroke(); ctx.fillText(v + '°', X(v), P.b + 16); }
  ctx.strokeStyle = C.green; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(P.l, Yk(M.kmPerDegLat())); ctx.lineTo(P.r, Yk(M.kmPerDegLat())); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let v = 0; v <= 90; v += 0.5) { const yy = Yk(M.kmPerDegLon(v)); if (v === 0) ctx.moveTo(X(v), yy); else ctx.lineTo(X(v), yy); }
  ctx.stroke(); ctx.restore();
  [...s2.seen].forEach(v => { if (v !== lat) dot(ctx, X(v), Yk(M.kmPerDegLon(v)), 3.2, C.text); });
  ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = C.orange; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(X(lat), P.b); ctx.lineTo(X(lat), Yk(M.kmPerDegLon(lat))); ctx.stroke(); ctx.restore();
  dot(ctx, X(lat), Yk(M.kmPerDegLon(lat)), 6, C.orange, C.text);
  title(ctx, t('c2b'), 8, 18, W - 16);
  const kl = fmt(M.kmPerDegLat(), 1);
  if (lat >= 90) { $('r2').textContent = t('s2pole', { kl }); return; }
  $('r2').textContent = t('s2readout', { lat, r: km(M.parallelRadius(lat)), L: km(M.parallelLength(lat)), k: fmt(M.kmPerDegLon(lat), 1), pct: fmt(100 * Math.cos(lat * D2R), 0), kl });
}

/* ---------- step 3: flatten the sphere ---------- */
const s3 = { kind: 'plate' };
const CIRC_R = M.CIRCLE_KM, MOVE_LON = 20, REF_LON = -40, REF_LATS = [0, 30, 60];
function draw3() {
  const lat = num('lat3'), kind = s3.kind;
  $('lat3v').textContent = lat + '°';
  $('projPlate').setAttribute('aria-pressed', kind === 'plate'); $('projMerc').setAttribute('aria-pressed', kind === 'mercator');
  let { ctx, W, H } = fitCanvas($('c3'), globeH);
  const G = makeGlobe(ctx, W, H, 25, -10);
  globeBase(G);
  REF_LATS.forEach(a => globeLine(G, M.groundCircle(a, REF_LON, CIRC_R), { color: C.muted, lw: 2 }));
  globeLine(G, M.groundCircle(lat, MOVE_LON, CIRC_R), { color: C.orange, lw: 2.6 });
  title(ctx, t('c3a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c3b'), mapH(kind)));
  const m = makeMap(ctx, W, H, kind); mapBase(m);
  const ring = (pts, color, lw) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach((q, i) => { const X = m.x(q.lon), Y = m.y(q.lat); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.closePath(); ctx.stroke(); ctx.restore(); };
  REF_LATS.forEach(a => ring(M.groundCircle(a, REF_LON, CIRC_R), C.muted, 1.8));
  ring(M.groundCircle(lat, MOVE_LON, CIRC_R), C.orange, 2.4);
  title(ctx, t('c3b'), 8, 18, W - 16);
  const ms = M.measuredStretch(kind, lat, CIRC_R), f = M.stretchFormula(kind, lat);
  const note = lat === 0 ? t('s3note0') : t(kind === 'plate' ? 's3notePlate' : 's3noteMerc');
  $('r3').textContent = t('s3readout', { proj: t(kind === 'plate' ? 'projPlate' : 'projMerc'), lat, ew: ms.ew.toFixed(2), few: f.ew.toFixed(2), ns: ms.ns.toFixed(2), fns: f.ns.toFixed(2), area: ms.area.toFixed(2), farea: f.area.toFixed(2), note });
  $('h3').textContent = t('s3hint', { g: fmt(M.stretchFormula('mercator', 72).area, 1) });
}

/* ---------- step 4: the shortest route ---------- */
const MID4 = 56.3;
function draw4() {
  const lat = num('lat4'), dl = num('dl4');
  $('lat4v').textContent = lat + '°'; $('dl4v').textContent = dl + '°';
  const A = { lat, lon: MID4 - dl / 2 }, B = { lat, lon: MID4 + dl / 2 };
  const along = parallelPts(lat, A.lon, B.lon, 1), great = M.greatCirclePoints(A.lat, A.lon, B.lat, B.lon, 90);
  let { ctx, W, H } = fitCanvas($('c4'), globeH);
  const G = makeGlobe(ctx, W, H, 35, MID4);
  globeBase(G);
  globeLine(G, along, { color: C.orange, lw: 3, back: 0.4 });
  globeLine(G, great, { color: C.blue, lw: 3, back: 0.4 });
  [A, B].forEach(q => { const p = G.p(q.lat, q.lon); ctx.save(); ctx.globalAlpha = p.z < 0 ? 0.4 : 1; dot(ctx, p.x, p.y, 5.5, C.text, '#0d1621'); ctx.restore(); });
  title(ctx, t('c4a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c4b'), mapH('plate')));
  const m = makeMap(ctx, W, H, 'plate'); mapBase(m);
  mapLine(m, along, { color: C.orange, lw: 2.6 }); mapLine(m, great, { color: C.blue, lw: 2.6 });
  [A, B].forEach(q => dot(ctx, m.x(q.lon), m.y(q.lat), 4.5, C.text, '#0d1621'));
  title(ctx, t('c4b'), 8, 18, W - 16);
  const r = M.routes(lat, dl);
  if (dl === 0) { $('r4').textContent = t('s4zero'); return; }
  if (lat === 0) { $('r4').textContent = t('s4eq'); return; }
  $('r4').textContent = t('s4readout', { lat, dl, along: km(r.along), great: km(r.great), saved: fmt(100 * r.saved, 1), top: fmt(r.top, 1) });
}

/* ---------- step 5: longitude and time ---------- */
const s5 = { swept: new Uint8Array(360), last: null };
function sweepTo(u) { // mark the longitudes the noon line passes when the time moves continuously from s5.last to u
  if (s5.last === null) { s5.last = u; s5.swept[Math.floor(((M.noonLon(u) + 180) % 360 + 360) % 360)] = 1; return; }
  const a = s5.last, n = Math.max(1, Math.ceil(Math.abs(u - a) * 15 / 0.5));
  for (let i = 0; i <= n; i++) { const L = M.noonLon(a + (u - a) * i / n); s5.swept[Math.min(359, Math.floor(((L + 180) % 360 + 360) % 360))] = 1; }
  s5.last = u;
}
function draw5() {
  const u = num('utc5');
  $('utc5v').textContent = M.hhmm(u);
  const STRIP = 16;
  const { ctx, W, H } = fitCanvas($('c5'), mapH('plate', STRIP));
  const m = makeMap(ctx, W, H, 'plate', STRIP); mapBase(m);
  const noon = M.noonLon(u), mid = M.wrapLon(noon + 180);
  // night: within 90° of the midnight meridian (equinox model)
  ctx.save(); ctx.fillStyle = C.night;
  const band = (a, b) => ctx.fillRect(m.x(a), m.T, m.x(b) - m.x(a), m.ph);
  let a = mid - 90, b = mid + 90;
  if (a < -180) { band(-180, b); band(a + 360, 180); } else if (b > 180) { band(a, 180); band(-180, b - 360); } else band(a, b);
  ctx.restore();
  // swept strip
  ctx.save(); ctx.fillStyle = '#121a24'; ctx.fillRect(m.L, TOP, m.pw, STRIP - 5); ctx.fillStyle = 'rgba(255,180,84,0.75)';
  for (let i = 0; i < 360; i++) if (s5.swept[i]) ctx.fillRect(m.x(i - 180), TOP, m.pw / 360 + 0.6, STRIP - 5);
  ctx.strokeStyle = '#2c3b50'; ctx.strokeRect(m.L, TOP, m.pw, STRIP - 5); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(m.x(noon), TOP); ctx.lineTo(m.x(noon), m.B); ctx.stroke(); ctx.restore();
  dot(ctx, m.x(noon), m.y(0), 7, C.yellow, '#3a2c00');
  ctx.save(); ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  M.TIME_CITIES.forEach((k, i) => { const c = M.CITIES[k], X = m.x(c.lon), Y = m.y(c.lat); dot(ctx, X, Y, 4, M.isDay(u, c.lat, c.lon) ? C.text : C.muted, '#0d1621'); ctx.fillStyle = C.text; ctx.strokeStyle = '#0d1621'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeText(String(i + 1), X + 6, Y - 6); ctx.fillText(String(i + 1), X + 6, Y - 6); });
  ctx.restore();
  title(ctx, t('c5'), 8, 18, W - 16);
  const deg = s5.swept.reduce((s, v) => s + v, 0);
  $('r5').textContent = t('s5readout', { utc: M.hhmm(u), noon: lonText(noon), prog: deg > 1 ? t('s5prog', { h: fmt(deg / 15, 1), deg }) : t('s5progNone') });
  $('t5').innerHTML = '';
  M.TIME_CITIES.forEach((k, i) => {
    const c = M.CITIES[k], day = M.isDay(u, c.lat, c.lon), li = document.createElement('li');
    li.className = day ? 'day' : 'night';
    li.textContent = t('s5row', { n: i + 1, city: cityName(k), lon: lonText(c.lon), time: M.hhmm(M.solarTime(u, c.lon)), dn: t(day ? 'day' : 'night') });
    $('t5').appendChild(li);
  });
  $('play5').textContent = anims.s5 ? t('pause5') : t('play5');
  $('h5').textContent = t('s5hint', { lag: fmt(M.beijingLagMinutes(), 0) });
}
function play5() {
  if (anims.s5) { stopAnim('s5'); draw5(); return; }
  const u0 = num('utc5');
  s5.last = u0;
  animate('s5', 12000, p => { const u = u0 + 24 * p; sweepTo(u); $('utc5').value = String(((u % 24) + 24) % 24); draw5(); }, () => { s5.last = num('utc5'); draw5(); });
  draw5();
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }
function setup() {
  ['lat0', 'lon0', 'view0'].forEach(id => $(id).addEventListener('input', draw0));
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const c = M.CITIES[b.dataset.preset]; $('lat0').value = c.lat; $('lon0').value = c.lon;
    $('view0').value = Math.round(c.lon / 5) * 5; draw0();
  }));
  ['g1lat', 'g1lon'].forEach(id => $(id).addEventListener('input', () => { s1.checked = false; draw1(); }));
  $('check1').addEventListener('click', check1); $('next1').addEventListener('click', next1);
  const v1 = view1(target1()); $('g1lat').value = v1.lat; $('g1lon').value = v1.lon;
  $('lat2').addEventListener('input', draw2);
  $('lat3').addEventListener('input', draw3);
  $('projPlate').addEventListener('click', () => { s3.kind = 'plate'; draw3(); });
  $('projMerc').addEventListener('click', () => { s3.kind = 'mercator'; draw3(); });
  ['lat4', 'dl4'].forEach(id => $(id).addEventListener('input', draw4));
  $('noon5').addEventListener('click', () => { stopAnim('s5'); $('utc5').value = String(12 - M.CITIES.beijing.lon / 15); sweepTo(num('utc5')); draw5(); });
  $('preset4').addEventListener('click', () => { $('lat4').value = 40; $('dl4').value = 120; draw4(); });
  $('utc5').addEventListener('input', () => { stopAnim('s5'); sweepTo(num('utc5')); draw5(); });
  $('play5').addEventListener('click', play5);
  $('clear5').addEventListener('click', () => { stopAnim('s5'); s5.swept.fill(0); s5.last = null; sweepTo(num('utc5')); draw5(); });
  sweepTo(num('utc5'));
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && anims.s5) { stopAnim('s5'); draw5(); } });
  window.refreshLatLon = refresh;
  refresh();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
