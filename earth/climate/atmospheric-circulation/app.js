/* atmospheric-circulation: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
function arrow(ctx, x1, y1, x2, y2, col, lw) { line(ctx, x1, y1, x2, y2, col, lw || 2); const a = Math.atan2(y2 - y1, x2 - x1), s = 6 + (lw || 2) * 1.6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill(); }
function curve(ctx, pts, col, lw) { if (!pts.length) return; ctx.strokeStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); pts.forEach((p, i) => { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
function axes(ctx, L, col) { line(ctx, L.x, L.y, L.x, L.y + L.h, col || COL.grid, 1); line(ctx, L.x, L.y + L.h, L.x + L.w, L.y + L.h, col || COL.grid, 1); }
/* deterministic RNG so every run of a demo is repeatable */
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const TICKERS = [];
/* ticker(fn): fn(dtSeconds) returns false to stop. Stops when the tab is hidden. */
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
function pointerXY(c, ev) { const r = c.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }

/* Model: schematic idealised Earth (no continents). Each function is pure. */
const OMEGA = 7.292e-5;
const insolation = lat => Math.max(0, Math.cos(lat * Math.PI / 180));          // annual-mean-like heating relative to the equator
const footprint = lat => 1 / Math.max(0.05, Math.cos(lat * Math.PI / 180));    // ground area covered by a unit-width beam
const coriolis = lat => 2 * OMEGA * Math.sin(lat * Math.PI / 180);             // f, in 1/s
/* Cell structure: surface meridional flow direction (+1 poleward, -1 equatorward) in the northern hemisphere. */
function cellOf(lat) { const a = Math.abs(lat); return a < 30 ? 0 : a < 60 ? 1 : 2; }
function surfaceMeridional(lat) { const c = cellOf(lat), s = lat >= 0 ? 1 : -1; return [-1, 1, -1][c] * s; } // +1 north, -1 south (compass)
/* Coriolis turns motion to the right in the north, left in the south: u acceleration has the sign of f*v. */
function zonalSign(lat) { return Math.sign(coriolis(lat) * surfaceMeridional(lat)); } // +1 toward east (westerly wind), -1 toward west (easterly wind)
function beltName(lat) { const c = cellOf(lat); return ['trade', 'westerlies', 'polar'][c]; }
function verticalAt(lat) { const a = Math.abs(lat); return a < 12 ? 'rise' : (a >= 24 && a <= 36) ? 'sink' : (a >= 54 && a <= 66) ? 'rise' : a > 80 ? 'sink' : 'none'; }
function loopSpeed(dT) { return dT <= 0 ? 0 : 0.35 * Math.sqrt(dT / 30); }       // toy: speed grows with the temperature contrast, arbitrary units
function landSeaDelta(month) { const ph = (month - 7) / 12 * 2 * Math.PI; return 10 * Math.cos(ph) ; } // land minus sea temperature anomaly (K, toy) peaking in July
function monsoonWind(month) { const d = landSeaDelta(month); return Math.abs(d) < 0.5 ? 'calm' : d > 0 ? 'onshore' : 'offshore'; }
function wetIndex(lat, shift) { return 0.5 + 0.5 * Math.cos(6 * (lat - shift) * Math.PI / 180); }
const fmt1 = v => (Math.round(v * 10) / 10).toFixed(1), fmt2 = v => (Math.round(v * 100) / 100).toFixed(2);
const S = { lat0: 60, dT: 30, parcel: 0, lat2: 30, lat3: 15, month: 7, lat5: 30, shift: 0 };
const loop1 = ticker(dt => { S.parcel = (S.parcel + dt * loopSpeed(S.dT) * 0.6) % 1; render1(); });

/* ---- Step 0: heating vs latitude ---- */
function render0() {
  const { ctx, w, h } = setup($('cv0')), lat = S.lat0, L = { x: 36, y: 16, w: w - 52, h: h * 0.52 };
  axes(ctx, L);
  const X = a => L.x + (a + 90) / 180 * L.w, Y = v => L.y + L.h - v * L.h;
  const pts = []; for (let a = -90; a <= 90; a += 3) pts.push([X(a), Y(insolation(a))]);
  curve(ctx, pts, COL.orange, 2.5);
  text(ctx, t('axLat'), L.x + L.w, L.y + L.h + 16, { align: 'right', size: 11 }); text(ctx, t('axHeat'), L.x + 4, L.y + 10, { size: 11 });
  [-90, -60, -30, 0, 30, 60, 90].forEach(a => text(ctx, a + '°', X(a), L.y + L.h + 28, { align: 'center', size: 10 }));
  line(ctx, X(lat), L.y, X(lat), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(lat), Y(insolation(lat)), 6, COL.cyan);
  /* beam footprint: a fixed-width beam lands on a tilted surface and spreads over 1/cos(lat) */
  const by = L.y + L.h + 44, bw = Math.min(70, w * 0.2), fp = footprint(lat), fw = Math.min(L.w * 0.9, bw * fp);
  const cx = w / 2; ctx.fillStyle = 'rgba(246,164,91,.25)'; ctx.fillRect(cx - bw / 2, by - 4, bw, 3);
  for (let i = 0; i < 5; i++) arrow(ctx, cx - bw / 2 + bw * i / 4, by - 4 - 0, cx - fw / 2 + fw * i / 4, by + 22, COL.orange, 1.5);
  ctx.fillStyle = COL.cyan; ctx.fillRect(cx - fw / 2, by + 22, fw, 4);
  text(ctx, t('beamNote', { f: fmt2(fp) }), cx, by + 44, { align: 'center', size: 11 });
  $('ro0').textContent = t('s0ro', { lat: lat, i: fmt2(insolation(lat)), f: fmt2(fp), pct: Math.round(insolation(lat) * 100) });
}
/* ---- Step 1: single cell ---- */
function render1() {
  const { ctx, w, h } = setup($('cv1')), dT = S.dT, v = loopSpeed(dT), cx = w / 2, cy = h * 0.5, rx = w * 0.4, ry = h * 0.32;
  text(ctx, t('eqLabel'), cx, h - 6, { align: 'center', size: 11 }); text(ctx, t('polN'), 8, 14, { size: 11 }); text(ctx, t('polS'), w - 8, 14, { align: 'right', size: 11 });
  ctx.fillStyle = '#15303f'; ctx.fillRect(10, cy + ry + 6, w - 20, 8); // ground
  const th = Math.min(7, 0.8 + dT / 6);
  /* loop: surface equatorward (toward the middle), rise at the equator, poleward aloft, sink at the poles */
  const lowY = cy + ry, hiY = cy - ry;
  // four legs: bottom (poles -> equator), up at the equator, top (equator -> poles) and down at the poles
  if (v > 0) {
    arrow(ctx, 14 + 4, lowY, cx - 6, lowY, COL.cyan, th); arrow(ctx, w - 18, lowY, cx + 6, lowY, COL.cyan, th);
    arrow(ctx, cx, lowY - 4, cx, hiY + 8, COL.red, th);
    arrow(ctx, cx - 6, hiY, 18, hiY, COL.orange, th); arrow(ctx, cx + 6, hiY, w - 18, hiY, COL.orange, th);
    arrow(ctx, 18, hiY + 6, 18, lowY - 6, COL.cyan, th); arrow(ctx, w - 18, hiY + 6, w - 18, lowY - 6, COL.cyan, th);
    /* moving parcels: positions along the right-hand half loop */
    for (let k = 0; k < 4; k++) { const u = (S.parcel + k / 4) % 1, p = rightLoop(u, cx, lowY, hiY, w - 18); dot(ctx, p[0], p[1], 5, COL.green); const q = rightLoop(u, cx, lowY, hiY, 18, true); dot(ctx, q[0], q[1], 5, COL.green); }
  } else text(ctx, t('noFlow'), cx, cy, { align: 'center', size: 15, color: COL.muted });
  $('ro1').textContent = t('s1ro', { dT: dT, v: fmt2(v), state: v > 0 ? t('flowOn') : t('flowOff') });
  $('play1').textContent = loop1.running ? t('pause') : t('play');
}
function rightLoop(u, cx, lowY, hiY, edgeX, mirror) { // u in [0,1): edge bottom -> center bottom -> up -> top out -> edge down
  const segs = [Math.abs(edgeX - cx), lowY - hiY, Math.abs(edgeX - cx), lowY - hiY], tot = segs.reduce((a, b) => a + b, 0);
  let d = u * tot, x, y;
  if (d < segs[0]) { x = edgeX + (cx - edgeX) * d / segs[0]; y = lowY; }
  else if ((d -= segs[0]) < segs[1]) { x = cx; y = lowY - d; }
  else if ((d -= segs[1]) < segs[2]) { x = cx + (edgeX - cx) * d / segs[2]; y = hiY; }
  else { d -= segs[2]; x = edgeX; y = hiY + d; }
  return [x, y];
}
/* ---- Step 2: Coriolis ---- */
function render2() {
  const { ctx, w, h } = setup($('cv2')), lat = S.lat2, f = coriolis(lat), cx = w / 2, cy = h / 2;
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { line(ctx, 0, h * i / 6, w, h * i / 6, '#16283a', 1); }
  text(ctx, t('north'), cx, 14, { align: 'center', size: 11 }); text(ctx, t('south'), cx, h - 6, { align: 'center', size: 11 });
  text(ctx, t('west'), 8, cy, { size: 11 }); text(ctx, t('east'), w - 8, cy, { align: 'right', size: 11 });
  const mv = surfaceMeridional(lat), zs = zonalSign(lat), len = Math.min(w, h) * 0.3;
  // raw push (toward the equator) in cyan, deflected resultant in orange
  const dy = -mv * len * 0.9, dx = zs * len * Math.min(1, Math.abs(f) / (2 * OMEGA) * 1.4);
  arrow(ctx, cx, cy, cx, cy + dy, COL.cyan, 3); arrow(ctx, cx, cy, cx + dx, cy + dy, COL.orange, 3.5);
  dot(ctx, cx, cy, 5, COL.ink);
  text(ctx, t('pushLbl'), cx + 8, cy + dy * 0.5, { size: 11, color: COL.cyan }); text(ctx, t('windLbl'), cx + dx + (dx >= 0 ? 8 : -8), cy + dy + (dy < 0 ? -6 : 14), { size: 11, color: COL.orange, align: dx >= 0 ? 'left' : 'right' });
  $('ro2').textContent = t('s2ro', { lat: lat, f: f.toExponential(2), dir: lat === 0 ? t('noDeflect') : (f > 0 ? t('deflR') : t('deflL')), res: lat === 0 ? t('noDeflect') : (zs < 0 ? t('easterly') : t('westerly')) });
}
/* ---- Step 3: three cells ---- */
function render3() {
  const { ctx, w, h } = setup($('cv3')), lat = S.lat3, L = { x: 14, y: 12, w: w - 28, h: h - 62 }, X = a => L.x + (a + 90) / 180 * L.w;
  const bands = [[-90, -60, 2], [-60, -30, 1], [-30, 0, 0], [0, 30, 0], [30, 60, 1], [60, 90, 2]], cols = ['#1b3a55', '#2a3d2f', '#4a3a28'];
  bands.forEach(b => { ctx.fillStyle = cols[b[2]]; ctx.fillRect(X(b[0]), L.y, X(b[1]) - X(b[0]), L.h); });
  [-60, -30, 0, 30, 60].forEach(a => line(ctx, X(a), L.y, X(a), L.y + L.h, COL.grid, 1));
  bands.forEach(b => { const a = (b[0] + b[1]) / 2, mv = surfaceMeridional(a), zs = zonalSign(a); const x = X(a), y = L.y + L.h * 0.55, wl = (X(b[1]) - X(b[0])) * 0.3; arrow(ctx, x, y, x, y - mv * 26, COL.cyan, 2); arrow(ctx, x - zs * wl * 0.5, y + 22, x + zs * wl * 0.5, y + 22, COL.orange, 2.5); });
  [['rise', 0], ['sink', 30], ['rise', 60], ['sink', 90], ['sink', -30], ['rise', -60], ['sink', -90]].forEach(([k, a]) => text(ctx, k === 'rise' ? '↑' : '↓', X(a), L.y + 14, { align: 'center', size: 16, color: k === 'rise' ? COL.red : COL.green, bold: true }));
  [-90, -60, -30, 0, 30, 60, 90].forEach(a => text(ctx, a + '°', X(a), L.y + L.h + 16, { align: 'center', size: 10 }));
  line(ctx, X(lat), L.y, X(lat), L.y + L.h, COL.ink, 2, [5, 3]);
  text(ctx, t('legend3a'), w / 2, h - 18, { align: 'center', size: 10 }); text(ctx, t('legend3b'), w / 2, h - 5, { align: 'center', size: 10 });
  const mv = surfaceMeridional(lat), zs = zonalSign(lat), v = verticalAt(lat);
  $('ro3').textContent = t('s3ro', { lat: lat, belt: t('belt_' + beltName(lat)), mer: mv > 0 ? t('toNorth') : t('toSouth'), zon: zs < 0 ? t('easterly') : t('westerly'), vert: t('vert_' + v) });
}
/* ---- Step 4: monsoon ---- */
function render4() {
  const { ctx, w, h } = setup($('cv4')), m = S.month, d = landSeaDelta(m), wind = monsoonWind(m);
  const sh = h * 0.58, shore = w * 0.5;
  ctx.fillStyle = '#4a3a28'; ctx.fillRect(shore, h * 0.3, w - shore, sh * 0.5); ctx.fillStyle = '#17405c'; ctx.fillRect(0, h * 0.3, shore, sh * 0.5);
  text(ctx, t('sea'), shore * 0.5, h * 0.3 + sh * 0.25, { align: 'center', size: 13, color: COL.ink }); text(ctx, t('land'), shore + (w - shore) * 0.5, h * 0.3 + sh * 0.25, { align: 'center', size: 13, color: COL.ink });
  const len = Math.min(shore * 0.8, Math.abs(d) / 10 * shore * 0.8);
  const y = h * 0.2;
  if (wind !== 'calm') { const dir = wind === 'onshore' ? 1 : -1; arrow(ctx, shore - dir * len / 2, h * 0.9 - 4, shore + dir * len / 2, h * 0.9 - 4, COL.cyan, 3.5); arrow(ctx, shore + dir * len / 2, y, shore - dir * len / 2, y, COL.orange, 2.5);
    text(ctx, t('aloft'), shore, y - 6, { align: 'center', size: 10, color: COL.orange }); text(ctx, t('surf'), shore, h * 0.9 - 10, { align: 'center', size: 10, color: COL.cyan }); }
  if (d > 0.5) arrow(ctx, shore + (w - shore) * 0.5, h * 0.3 + sh * 0.5 + 4, shore + (w - shore) * 0.5, h * 0.3 - 4, COL.red, 3);
  // small plot of the annual difference along the bottom strip
  const P = { x: 10, y: h * 0.86 + 8, w: w - 20, h: h * 0.12 };
  const pts = []; for (let mm = 1; mm <= 12.01; mm += 0.25) pts.push([P.x + (mm - 1) / 11 * P.w, P.y + P.h / 2 - landSeaDelta(mm) / 10 * P.h / 2]);
  curve(ctx, pts, COL.muted, 1.5); dot(ctx, P.x + (m - 1) / 11 * P.w, P.y + P.h / 2 - d / 10 * P.h / 2, 5, COL.cyan);
  $('ro4').textContent = t('s4ro', { m: m, d: fmt1(d), wind: t('w_' + wind), mon: t(d > 0.5 ? 'summerMon' : d < -0.5 ? 'winterMon' : 'calmMon') });
}
/* ---- Step 5: where is it wet? ---- */
function render5() {
  const { ctx, w, h } = setup($('cv5')), lat = S.lat5, sft = S.shift, L = { x: 30, y: 12, w: w - 44, h: h - 46 }, X = a => L.x + (a + 90) / 180 * L.w, Y = v => L.y + L.h - v * L.h;
  axes(ctx, L);
  const pts = []; for (let a = -90; a <= 90; a += 2) pts.push([X(a), Y(wetIndex(a, sft))]);
  curve(ctx, pts, COL.cyan, 2.5);
  const pts0 = []; for (let a = -90; a <= 90; a += 2) pts0.push([X(a), Y(wetIndex(a, 0))]); if (sft !== 0) curve(ctx, pts0, '#2b4a5c', 1.5);
  [-90, -60, -30, 0, 30, 60, 90].forEach(a => text(ctx, a + '°', X(a), L.y + L.h + 16, { align: 'center', size: 10 }));
  text(ctx, t('wet'), L.x + 4, L.y + 10, { size: 11 }); text(ctx, t('dry'), L.x + 4, L.y + L.h - 4, { size: 11 });
  line(ctx, X(lat), L.y, X(lat), L.y + L.h, COL.ink, 1.5, [4, 3]); dot(ctx, X(lat), Y(wetIndex(lat, sft)), 6, COL.orange);
  const wi = wetIndex(lat, sft); $('ro5').textContent = t('s5ro', { lat: lat, s: sft, wi: fmt2(wi), kind: t(wi > 0.75 ? 'k_wet' : wi < 0.25 ? 'k_dry' : 'k_mid') });
}
function wire() {
  slider('lat0', v => { S.lat0 = v; render0(); }); slider('dt1', v => { S.dT = v; render1(); });
  $('play1').addEventListener('click', () => { if (loop1.running) loop1.stop(); else if (!reduceMotion()) loop1.start(); else { S.parcel = (S.parcel + 0.1) % 1; } render1(); });
  $('reset1').addEventListener('click', () => { loop1.stop(); S.parcel = 0; S.dT = 30; $('dt1').value = 30; $('dt1v').textContent = 30; render1(); });
  slider('lat2', v => { S.lat2 = v; render2(); }); slider('lat3', v => { S.lat3 = v; render3(); });
  slider('mon4', v => { S.month = v; render4(); }); slider('lat5', v => { S.lat5 = v; render5(); }); slider('sh5', v => { S.shift = v; render5(); });
}

/* boot */
const RENDERS = [render0, render1, render2, render3, render4, render5];
function renderAll() { RENDERS.forEach(f => f()); }
function boot() {
  initLang();
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  wire();
  window.addEventListener('langchange', renderAll);
  let raf = 0; window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderAll); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) onHide(); });
  const links = [...document.querySelectorAll('.step-nav a')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60%' }); steps.forEach(s => io.observe(s)); }
  renderAll();
}
if (typeof document !== 'undefined' && document.getElementById('ro0')) boot();

if (typeof module !== 'undefined') module.exports = { insolation, footprint, coriolis, cellOf, surfaceMeridional, zonalSign, beltName, verticalAt, loopSpeed, landSeaDelta, monsoonWind, wetIndex };
