'use strict';
// Day-and-night lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Steps 1 and 2 share one state (time where Sam is, spin direction, the 24-hour strip); every position, colour
// and readout comes from window.DN_MODEL (model.js). Canvas text: panel titles, compass words in the sky picture
// and the bar labels in step 4, each in a fixed slot; everything else lives in DOM legends and readouts.
(function () {

const $ = id => document.getElementById(id);
const M = window.DN_MODEL;
const t = (...a) => window.DN_I18N.t(...a);
const gap = () => (window.DN_I18N.getLang() === 'zh' ? '' : ' ');
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa', sun: '#ffd23f', lit: '#3f8fd8', dark: '#132544', kid: '#ff9a3c', dayc: '#f2c84b', nightc: '#1f3566', ground: '#1d2a22', track: '#1b2836' };
const CITY_COL = { beijing: C.cyan, tokyo: C.green, london: C.violet, newyork: C.pink };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const rad = d => d * Math.PI / 180;
// Trim trailing zeros only when there is a decimal point (so toFixed(0) values such as 90 stay 90).
const fmt = (v, d = 1) => { let s = v.toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function arrowHead(ctx, x, y, ang, s, color) {
  ctx.save(); ctx.fillStyle = color; ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s, -s * 0.55); ctx.lineTo(-s, s * 0.55); ctx.closePath(); ctx.fill(); ctx.restore();
}
// A small person standing at (x, y), body pointing in direction ang (canvas radians, 0 = right).
function figure(ctx, x, y, ang, size = 14) {
  const ux = Math.cos(ang), uy = Math.sin(ang);
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ux * size * 0.7, y + uy * size * 0.7); ctx.stroke();
  ctx.fillStyle = C.kid; ctx.beginPath(); ctx.arc(x + ux * size, y + uy * size, size * 0.32, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.kid; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.restore();
}

/* ---------- shared state for steps 1–2 ---------- */
const S = { t: 9, dir: 1, playing: false, turned: 0, raf: 0, last: 0, visited: new Uint8Array(M.CELLS) };
S.visited[M.cellOf(S.t)] = 1;
function markRange(a, b) { // mark the cells passed going forward in time from a to b (b may exceed 24)
  const steps = Math.ceil(Math.abs(b - a) / M.CELL_H) + 1, s = Math.sign(b - a) || 1;
  for (let k = 0; k <= steps; k++) { const v = a + s * Math.min(Math.abs(b - a), k * M.CELL_H); S.visited[M.cellOf(v)] = 1; }
}

/* ---------- top view (looking down on the North Pole), shared by steps 1, 2 and 3 ---------- */
function drawTop(canvas, titleKey, { kid = true, cities = null } = {}) {
  const { ctx, W, H } = fitCanvas(canvas);
  fitText(ctx, t(titleKey), 8, 16, W - 16);
  const cy = 28 + (H - 28) / 2, R = Math.min((H - 28) / 2 - 26, W * 0.28), cx = Math.min(W / 2, W - R - 70);
  // sunlight from the right: parallel rays with arrowheads
  ctx.save(); ctx.strokeStyle = C.sun; ctx.globalAlpha = 0.75; ctx.lineWidth = 1.6;
  for (let k = -2; k <= 2; k++) {
    const y = cy + k * R * 0.42, xe = cx + Math.sqrt(Math.max(0, R * R - (k * R * 0.42) ** 2)) + 6;
    ctx.beginPath(); ctx.moveTo(W - 6, y); ctx.lineTo(xe, y); ctx.stroke(); arrowHead(ctx, xe, y, Math.PI, 7, C.sun);
  }
  ctx.restore();
  // night disc, then the lit (right) half
  ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
  ctx.fillStyle = C.lit; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
  // meridians every 30°, turning with the Earth
  const spin = M.spinAngle(S.t, S.dir);
  ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.18; ctx.lineWidth = 1;
  for (let k = 0; k < 12; k++) { const a = rad(spin + k * 30); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  // terminator
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy - R - 8); ctx.lineTo(cx, cy + R + 8); ctx.stroke(); ctx.restore();
  // North Pole
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 7); ctx.fill();
  // spin direction arrow (lower left, outside the rim)
  const dirSign = cities ? 1 : S.dir, ra = R + 12, a0 = rad(200), a1 = rad(250);
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.2; ctx.beginPath();
  // canvas angles are clockwise, so an anticlockwise (real) spin runs from a1 to a0 in canvas terms
  ctx.arc(cx, cy, ra, -a1, -a0, false); ctx.stroke();
  const tip = dirSign > 0 ? a1 : a0, tang = dirSign > 0 ? -tip - Math.PI / 2 : -tip + Math.PI / 2;
  arrowHead(ctx, cx + ra * Math.cos(tip), cy - ra * Math.sin(tip), tang, 9, C.green);
  ctx.restore();
  if (kid) { const a = rad(spin); figure(ctx, cx + R * Math.cos(a), cy - R * Math.sin(a), -a, 15); }
  if (cities) cities.forEach(cty => {
    const a = rad(M.spinAngle(cty.time)), r = R * 0.86;
    ctx.save(); ctx.fillStyle = CITY_COL[cty.id]; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy - r * Math.sin(a), 7, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  });
}

/* ---------- step 0: lamp and ball ---------- */
const s0 = { on: true };
function draw0() {
  const th = num('a0'); $('a0v').textContent = th + '°';
  $('lamp0').textContent = t(s0.on ? 'lampOff' : 'lampOn');
  const { ctx, W, H } = fitCanvas($('c0'));
  fitText(ctx, t('c0title'), 8, 16, W - 16);
  const cy = 30 + (H - 30) / 2, D = Math.min(W / 2 - 24, (H - 30) / 2 - 20), cx = W / 2, Rb = Math.min(72, D * 0.5);
  const ux = Math.cos(rad(th)), uy = -Math.sin(rad(th)), px = -uy, py = ux; // direction to the lamp (canvas) and its perpendicular
  const lx = cx + ux * D, ly = cy + uy * D;
  if (s0.on) {
    ctx.save(); ctx.strokeStyle = C.sun; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.5;
    for (const f of [-0.8, -0.4, 0, 0.4, 0.8]) {
      const off = f * Rb, hit = Math.sqrt(Rb * Rb - off * off) + 4;
      const sx = cx + ux * (D - 18) + px * off, sy = cy + uy * (D - 18) + py * off, ex = cx + ux * hit + px * off, ey = cy + uy * hit + py * off;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); arrowHead(ctx, ex, ey, Math.atan2(-uy, -ux), 7, C.sun);
    }
    ctx.restore();
  }
  ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(cx, cy, Rb, 0, 7); ctx.fill();
  if (s0.on) { const c = Math.atan2(uy, ux); ctx.fillStyle = C.lit; ctx.beginPath(); ctx.arc(cx, cy, Rb, c - Math.PI / 2, c + Math.PI / 2); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, Rb, 0, 7); ctx.stroke();
  if (s0.on) { ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - px * (Rb + 10), cy - py * (Rb + 10)); ctx.lineTo(cx + px * (Rb + 10), cy + py * (Rb + 10)); ctx.stroke(); ctx.restore(); }
  figure(ctx, cx, cy - Rb, -Math.PI / 2, 16);
  // the lamp
  ctx.save(); if (s0.on) { ctx.shadowColor = C.sun; ctx.shadowBlur = 18; } ctx.fillStyle = s0.on ? C.sun : '#4a5568';
  ctx.beginPath(); ctx.arc(lx, ly, 14, 0, 7); ctx.fill(); ctx.restore();
  if (!s0.on) { $('r0').textContent = t('s0off'); return; }
  const dot = Math.cos(rad(90 - th));
  const state = Math.abs(dot) < 1e-9 ? t('st_edge') : t(dot > 0 ? 'st_day' : 'st_night');
  $('r0').textContent = t('s0readout', { a: th, pct: fmt(M.litFraction(th) * 100, 1), state });
}

/* ---------- step 1: the Earth turns; the 24-hour strip ---------- */
function phaseKey(tt) {
  const h = M.wrap24(tt);
  if (Math.abs(h - 12) < 0.25) return 'ph_noon';
  if (h < 0.25 || h > 23.75) return 'ph_midnight';
  return 'ph_' + M.phase(h);
}
function drawBand() {
  const { ctx, W, H } = fitCanvas($('c1b'));
  fitText(ctx, t('c1band'), 8, 14, W - 16);
  const L = 14, Rr = W - 14, y0 = 24, h = 26, cw = (Rr - L) / M.CELLS;
  ctx.fillStyle = C.track; ctx.fillRect(L, y0, Rr - L, h);
  for (let i = 0; i < M.CELLS; i++) if (S.visited[i]) { ctx.fillStyle = M.cellIsDay(i) ? C.dayc : C.nightc; ctx.fillRect(L + i * cw, y0, cw + 0.6, h); }
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(L, y0, Rr - L, h);
  const X = L + M.wrap24(S.t) / 24 * (Rr - L);
  ctx.fillStyle = C.kid; ctx.beginPath(); ctx.moveTo(X, y0 + h + 1); ctx.lineTo(X - 6, y0 + h + 9); ctx.lineTo(X + 6, y0 + h + 9); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.kid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, y0 - 2); ctx.lineTo(X, y0 + h); ctx.stroke();
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [0, 6, 12, 18, 24].forEach((v, i) => { const x = L + v / 24 * (Rr - L); ctx.textAlign = i === 0 ? 'left' : i === 4 ? 'right' : 'center'; ctx.fillText(v + ':00', x, H - 4); });
  ctx.restore();
}
function playLabel() { return S.playing ? t('pause') : (S.turned > 0 && S.turned < 24 ? t('resume') : t('playTurn')); }
function draw1() {
  $('t1').value = M.wrap24(S.t); $('t1v').textContent = M.clock(S.t);
  $('play1').textContent = playLabel();
  drawTop($('c1'), 'c1title');
  drawBand();
  const prog = S.turned > 0 ? gap() + t('s1progress', { h: fmt(Math.min(24, S.turned), 1) }) : '';
  $('r1').textContent = t('s1readout', { clock: M.clock(S.t), ph: t(phaseKey(S.t)) }) + prog;
}

/* ---------- step 2: Sam's sky ---------- */
function drawSky() {
  const { ctx, W, H } = fitCanvas($('c2'));
  fitText(ctx, t('c2sky'), 8, 16, W - 16);
  const gy = 160, Ra = Math.min(104, W / 2 - 50, H - gy - 14), cx = W / 2;
  // ground and horizon
  ctx.fillStyle = C.ground; ctx.fillRect(0, gy, W, H - gy);
  ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(8, gy); ctx.lineTo(W - 8, gy); ctx.stroke();
  // the Sun's daily path: dashed arch above, faint dashed arc below
  ctx.save(); ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
  ctx.strokeStyle = C.ghost; ctx.beginPath(); ctx.arc(cx, gy, Ra, Math.PI, 2 * Math.PI); ctx.stroke();
  ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(cx, gy, Ra, 0, Math.PI); ctx.stroke(); ctx.restore();
  const pos = tt => { const s = M.skySun(tt, S.dir); return { x: cx + Ra * s.x, y: gy - Ra * s.y, up: s.y > 1e-9, s }; };
  // trail: where the Sun was at the visited times
  for (let i = 0; i < M.CELLS; i++) if (S.visited[i]) { const p = pos((i + 0.5) * M.CELL_H); ctx.fillStyle = C.sun; ctx.globalAlpha = p.up ? 0.55 : 0.18; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  figure(ctx, cx, gy, -Math.PI / 2, 16);
  // compass words in fixed slots outside the arch
  fitText(ctx, t('east'), cx - Ra - 18, gy + 5, 40, { size: 14, weight: 700, color: C.text, align: 'right' });
  fitText(ctx, t('west'), cx + Ra + 18, gy + 5, 40, { size: 14, weight: 700, color: C.text, align: 'left' });
  fitText(ctx, t('overhead'), cx, gy - Ra - 22, W / 2, { size: 12, weight: 500, color: C.muted, align: 'center' });
  const p = pos(S.t);
  ctx.save(); ctx.globalAlpha = p.up ? 1 : 0.35; if (p.up) { ctx.shadowColor = C.sun; ctx.shadowBlur = 16; }
  ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, 7); ctx.fill(); ctx.restore();
  return p.s;
}
function skyWhere(s) {
  const b = s.beta;
  if (Math.abs(b - 90) < 1e-6) return 'sky_overhead';
  if (Math.abs(b) < 1e-6 || Math.abs(b - 360) < 1e-6) return 'sky_eastRim';
  if (Math.abs(b - 180) < 1e-6) return 'sky_westRim';
  if (b > 0 && b < 90) return 'sky_eastHigh';
  if (b > 90 && b < 180) return 'sky_westHigh';
  return 'sky_below';
}
function draw2() {
  $('t2').value = M.wrap24(S.t); $('t2v').textContent = M.clock(S.t);
  $('play2').textContent = playLabel();
  $('rev2').textContent = t(S.dir > 0 ? 'reverse' : 'reverseOff'); $('rev2').setAttribute('aria-pressed', S.dir < 0);
  const s = drawSky();
  drawTop($('c2b'), 'c2top');
  const alt = Math.round(s.altitude);
  const altText = alt > 0 ? t('altUp', { a: alt }) : alt < 0 ? t('altDown', { a: -alt }) : t('altZero');
  $('r2').textContent = t('s2readout', { clock: M.clock(S.t), where: t(skyWhere(s)), alt: altText }) + (S.dir < 0 ? gap() + t('s2rev') : '');
}

/* ---------- play loop shared by steps 1 and 2 ---------- */
function stopPlay() { S.playing = false; cancelAnimationFrame(S.raf); }
function startPlay() {
  if (S.turned >= 24 || S.turned === 0) { S.visited.fill(0); S.turned = 0; S.visited[M.cellOf(S.t)] = 1; }
  if (reduceMotion()) { markRange(S.t, S.t + (24 - S.turned)); S.turned = 24; S.playing = false; draw12(); return; }
  S.playing = true; S.last = performance.now();
  const tick = now => {
    if (!S.playing) return;
    const dh = Math.min(0.5, (now - S.last) / 1000 * 2); S.last = now; // 2 hours of Earth time per second of animation
    const step = Math.min(dh, 24 - S.turned), from = S.t;
    S.t = from + step; S.turned += step; markRange(from, S.t); S.t = M.wrap24(S.t);
    if (S.turned >= 24 - 1e-9) { S.turned = 24; S.playing = false; }
    draw12();
    if (S.playing) S.raf = requestAnimationFrame(tick);
  };
  S.raf = requestAnimationFrame(tick);
  draw12();
}
function togglePlay() { if (S.playing) { stopPlay(); draw12(); } else startPlay(); }
function setTime(v) { stopPlay(); markRange(S.t, v); S.t = v; draw12(); }
function draw12() { draw1(); draw2(); }

/* ---------- step 3: four cities ---------- */
function draw3() {
  const tb = num('b3'); $('b3v').textContent = M.clock(tb);
  const bj = M.CITIES[0];
  const cities = M.CITIES.map(c => ({ id: c.id, time: M.localTime(tb, bj.lon, c.lon) }));
  $('lg3').innerHTML = cities.map(c => `<span class="lg"><span class="sw" style="background:${CITY_COL[c.id]};border-radius:50%;width:11px;height:11px;border:1.5px solid #fff"></span><span>${t('city_' + c.id)}</span></span>`).join('');
  const save = { t: S.t, dir: S.dir }; S.dir = 1; S.t = tb; // meridians turn with Beijing's time
  drawTop($('c3'), 'c3title', { kid: false, cities });
  S.t = save.t; S.dir = save.dir;
  const st = tt => { const p = M.phase(tt); return t(p === 'day' ? 'st_day' : p === 'night' ? 'st_night' : 'st_' + p); };
  const rows = cities.map(c => t('s3row', { city: t('city_' + c.id), clock: M.clock(c.time), st: st(c.time) })).join(window.DN_I18N.getLang() === 'zh' ? '；' : '; ');
  $('r3').textContent = t('s3readout', { rows });
}

/* ---------- step 4: ground speed ---------- */
const s4 = { tried: new Set([40]) };
function draw4() {
  const lat = num('l4'); $('l4v').textContent = lat + '°';
  let { ctx, W, H } = fitCanvas($('c4'));
  fitText(ctx, t('c4side'), 8, 16, W - 16);
  const cx = W / 2, cy = 30 + (H - 30) / 2, R = Math.min((H - 30) / 2 - 22, W * 0.3), k = 0.2;
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R);
  g.addColorStop(0, '#4f9be0'); g.addColorStop(1, '#1b3d6e');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy - R - 16); ctx.lineTo(cx, cy + R + 16); ctx.stroke();
  const ring = (L, color, lw, alpha) => {
    const y = cy - R * Math.sin(rad(L)), rx = R * Math.cos(rad(L)), ry = Math.max(0.5, rx * k);
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.ellipse(cx, y, rx, ry, 0, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.setLineDash([]); ctx.beginPath(); ctx.ellipse(cx, y, rx, ry, 0, 0, Math.PI); ctx.stroke(); ctx.restore();
    return { y, rx, ry };
  };
  ring(0, C.text, 1, 0.35);
  s4.tried.forEach(L => { if (L !== lat) ring(L, C.ghost, 1.2, 0.6); });
  const r = ring(lat, C.orange, 3, 1);
  figure(ctx, cx + r.rx * Math.cos(rad(60)), r.y + r.ry * Math.sin(rad(60)), -Math.PI / 2 + rad(lat) * 0.0, 12);
  // bars
  ({ ctx, W, H } = fitCanvas($('c4b')));
  fitText(ctx, t('c4bar'), 8, 16, W - 16);
  const sp = M.groundSpeed(lat), lw = Math.min(110, W * 0.3), x0 = 8 + lw + 8, x1 = W - 14, max = 1700;
  const rows = [{ key: 'bar_here', v: sp.kmh, col: C.orange }, { key: 'bar_train', v: M.COMPARE[0].kmh, col: C.ghost }, { key: 'bar_plane', v: M.COMPARE[1].kmh, col: C.ghost }];
  rows.forEach((row, i) => {
    const y = 30 + i * 34;
    fitText(ctx, t(row.key), 8, y + 15, lw, { size: 12, weight: i ? 500 : 700, color: i ? C.muted : C.orange });
    ctx.fillStyle = C.track; ctx.fillRect(x0, y, x1 - x0, 20);
    ctx.fillStyle = row.col; ctx.fillRect(x0, y, (x1 - x0) * Math.min(1, row.v / max), 20);
  });
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  [0, 500, 1000, 1500].forEach((v, i) => { const x = x0 + (x1 - x0) * v / max; ctx.textAlign = i === 0 ? 'left' : 'center'; ctx.fillText(String(v), x, H - 6); });
  ctx.restore();
  if (lat >= 90) { $('r4').textContent = t('s4pole'); return; }
  $('r4').textContent = t('s4readout', { lat, circ: group(Math.round(sp.circ / 10) * 10), kmh: group(sp.kmh), ms: group(sp.ms), r1: fmt(sp.kmh / 350, 1), r2: fmt(sp.kmh / 900, 2), g: fmt(M.turnAccel(lat) / 9.8 * 100, 2) });
}

/* ---------- step 5: quiz ---------- */
function quizNumbers() {
  const bj = M.CITIES[0], ny = M.CITIES[3], d = bj.lon - ny.lon, h = d / 15;
  const round10 = v => Math.round(M.wrap24(v) * 6) / 6;
  return { ny: M.clock(round10(12 - h)), wrong: M.clock(round10(12 + h)), d: Math.round(d), h: fmt(h, 1) };
}
function drawQuiz() {
  const q = quizNumbers();
  $('q3bText').textContent = t('q3b', q); $('q3cText').textContent = t('q3c', q);
}
const ANSWERS = { q1: 'b', q2: 'a', q3: 'b' };
const FEED = { q1: { a: 'f1a', b: 'f1ok', c: 'f1c' }, q2: { a: 'f2ok', b: 'f2b', c: 'f2c' }, q3: { a: 'f3a', b: 'f3ok', c: 'f3c' } };
function checkQuiz() {
  const q = quizNumbers();
  ['q1', 'q2', 'q3'].forEach((name, i) => {
    const fb = $('fb' + (i + 1)), ch = document.querySelector(`input[name="${name}"]:checked`);
    if (!ch) { fb.textContent = t('unanswered'); fb.style.color = C.muted; fb.dataset.key = 'unanswered'; return; }
    const key = FEED[name][ch.value]; fb.textContent = t(key, q); fb.style.color = ch.value === ANSWERS[name] ? C.green : C.orange; fb.dataset.key = key;
  });
}

function refresh() { draw0(); draw12(); draw3(); draw4(); drawQuiz(); const q = quizNumbers(); [1, 2, 3].forEach(i => { const fb = $('fb' + i); if (fb.dataset.key) fb.textContent = t(fb.dataset.key, q); }); }

function setup() {
  $('a0').addEventListener('input', draw0);
  $('lamp0').addEventListener('click', () => { s0.on = !s0.on; draw0(); });
  $('play1').addEventListener('click', togglePlay); $('play2').addEventListener('click', togglePlay);
  $('t1').addEventListener('input', () => setTime(num('t1'))); $('t2').addEventListener('input', () => setTime(num('t2')));
  $('clear1').addEventListener('click', () => { stopPlay(); S.visited.fill(0); S.turned = 0; S.visited[M.cellOf(S.t)] = 1; draw12(); });
  $('rev2').addEventListener('click', () => { stopPlay(); S.dir = -S.dir; S.visited.fill(0); S.turned = 0; S.visited[M.cellOf(S.t)] = 1; draw12(); });
  $('b3').addEventListener('input', draw3);
  $('l4').addEventListener('input', () => { s4.tried.add(num('l4')); draw4(); });
  $('checkQuiz').addEventListener('click', checkQuiz);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.playing) { stopPlay(); draw12(); } });
  window.refreshDayNight = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
