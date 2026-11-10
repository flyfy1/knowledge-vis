'use strict';
// Moon phases lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, shape and readout comes from window.MOON_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks, calendar day numbers and the E/W marks on the sky.
(function () {

const $ = id => document.getElementById(id);
const M = window.MOON_MODEL;
const t = (...a) => window.MOON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', yellow: '#ffe066', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', lit: '#d9e7f5', dark: '#1b2738', ghost: '#55657a', earth: '#2f6fa8', shadow: '#2a1c24' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const D2R = Math.PI / 180;
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const clock = h => { const m = Math.round(((h % 24) + 24) % 24 * 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const sideText = th => { const s = M.litSide(th); if (s === 'none') return t(M.wrap360(th) < 90 || M.wrap360(th) > 270 ? 'sideNone0' : 'sideNone180'); return t(s === 'right' ? 'sideRight' : 'sideLeft'); };

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
function ring(ctx, x, y, r, color, lw = 2.5, dash = null) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
function sunGlyph(ctx, x, y, r) { ctx.save(); const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.8); g.addColorStop(0, '#fff6c2'); g.addColorStop(0.45, C.yellow); g.addColorStop(1, 'rgba(255,224,102,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI); ctx.fill(); ctx.restore(); }
// A sphere lit from direction s = (right, up, towards the viewer): lit half-disc plus the terminator ellipse.
function litSphere(ctx, x, y, r, s, litCol = C.lit, darkCol = C.dark, edge = '#5a6b80') {
  const n = Math.hypot(s[0], s[1], s[2]) || 1, sx = s[0] / n, sy = s[1] / n, sz = s[2] / n, th = Math.atan2(-sy, sx);
  ctx.save();
  ctx.fillStyle = darkCol; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
  if (Math.hypot(sx, sy) > 1e-6 || sz > 0) {
    ctx.fillStyle = litCol; ctx.beginPath(); ctx.arc(x, y, r, th - Math.PI / 2, th + Math.PI / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = sz >= 0 ? litCol : darkCol; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, r * Math.abs(sz)), r, th, 0, 2 * Math.PI); ctx.fill();
  }
  ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke();
  ctx.restore();
}
// Parallel sunlight arriving from the right edge, stopping short of xStop.
function sunRays(ctx, W, y0, y1, xStop, n = 5) {
  ctx.save(); ctx.strokeStyle = 'rgba(255,224,102,0.55)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * (i + 0.5) / n; ctx.beginPath(); ctx.moveTo(W - 6, y); ctx.lineTo(xStop, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xStop, y); ctx.lineTo(xStop + 6, y - 3.5); ctx.moveTo(xStop, y); ctx.lineTo(xStop + 6, y + 3.5); ctx.stroke(); }
  ctx.restore();
}
// Top view frame shared by steps 0, 1, 3 and 5: Earth in the middle, Sun far to the right.
function topView(ctx, W, H, { earthScale = 0.2 } = {}) {
  const Ro = Math.max(60, Math.min((H - TOP) / 2 - 26, W / 2 - 70)), cx = W / 2 - 22, cy = TOP + (H - TOP) / 2;
  const rm = Math.max(9, Ro * 0.13), re = Math.max(16, Ro * earthScale);
  ctx.save(); ctx.strokeStyle = '#33445a'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, Ro, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
  sunRays(ctx, W, cy - Ro, cy + Ro, cx + Ro + rm + 12);
  litSphere(ctx, cx, cy, re, [1, 0, 0], '#6fa8dc', '#16304a', '#3d5671');
  const at = th => ({ x: cx + Ro * Math.cos(th * D2R), y: cy - Ro * Math.sin(th * D2R) });
  return { cx, cy, Ro, rm, re, at };
}
const topH = W => Math.min(440, Math.max(220, Math.round(W * 0.62)));
const discH = W => Math.min(354, Math.max(220, Math.round(W * 0.9)));

const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name].id = requestAnimationFrame(tick); else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick) };
}
function stopAnim(name) { const a = anims[name]; if (!a) return; cancelAnimationFrame(a.id); delete anims[name]; }

/* ---------- steps 0 and 1 share the Moon's position ---------- */
function setPos(v) { document.querySelectorAll('.pos-slider').forEach(el => { if (Number(el.value) !== v) el.value = v; }); draw0(); draw1(); }
function draw0() {
  const th = num('a0');
  $('a0v').textContent = th + '°';
  const { ctx, W, H } = fitCanvas($('c0'), topH);
  const V = topView(ctx, W, H);
  for (let k = 0; k < 8; k++) { const a = k * 45; if (Math.abs(M.wrap180(a - th)) < 12) continue; const p = V.at(a); ctx.save(); ctx.globalAlpha = 0.45; litSphere(ctx, p.x, p.y, V.rm * 0.85, [1, 0, 0]); ctx.restore(); }
  const p = V.at(th); litSphere(ctx, p.x, p.y, V.rm, [1, 0, 0]); ring(ctx, p.x, p.y, V.rm + 4, C.cyan, 2);
  title(ctx, t('c0'), 8, 18, W - 16);
  $('r0').textContent = t('s0readout', { a: th });
}
function draw1() {
  const th = num('a1');
  $('a1v').textContent = th + '°';
  let { ctx, W, H } = fitCanvas($('c1'), topH);
  const V = topView(ctx, W, H), p = V.at(th);
  ctx.save(); ctx.strokeStyle = 'rgba(103,215,249,0.45)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(V.cx, V.cy); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore();
  litSphere(ctx, p.x, p.y, V.rm * 1.25, [1, 0, 0]);
  const fe = Math.atan2(Math.sin(th * D2R), -Math.cos(th * D2R)), rr = V.rm * 1.25 + 5;
  ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(p.x, p.y, rr, fe - Math.PI / 2, fe + Math.PI / 2); ctx.closePath(); ctx.stroke(); ctx.restore();
  title(ctx, t('c1a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c1b'), () => topH($('c1').clientWidth || W)));
  const R = Math.max(40, Math.min(W / 2 - 24, (H - TOP) / 2 - 20));
  ctx.save(); ctx.fillStyle = '#070b12'; ctx.fillRect(8, TOP + 4, W - 16, H - TOP - 12); ctx.restore();
  litSphere(ctx, W / 2, TOP + (H - TOP) / 2, R, M.viewSun(th), C.lit, '#141c28', '#2c3b50');
  title(ctx, t('c1b'), 8, 18, W - 16);
  $('r1').textContent = t('s1readout', { a: th, name: t(M.phaseName(th)), side: sideText(th), pct: fmt(100 * M.litFraction(th), 0) });
}

/* ---------- step 2: one month ---------- */
const s2 = { days: new Set([0]), names: new Set(['new']), last: 0 };
function visitAge(a) { // mark days and phase names passed when the age moves continuously from s2.last to a
  const n = Math.max(1, Math.ceil(Math.abs(a - s2.last) / 0.05));
  for (let i = 0; i <= n; i++) { const q = s2.last + (a - s2.last) * i / n; s2.days.add(Math.min(29, Math.floor(q + 1e-9))); s2.names.add(M.phaseName(M.ageToTheta(q))); }
  s2.last = a;
}
function draw2() {
  const age = num('age2'), th = M.ageToTheta(age);
  $('age2v').textContent = fmt(age, 1);
  let { ctx, W, H } = fitCanvas($('c2'), discH);
  const R = Math.max(40, Math.min(W / 2 - 24, (H - TOP) / 2 - 20));
  ctx.save(); ctx.fillStyle = '#070b12'; ctx.fillRect(8, TOP + 4, W - 16, H - TOP - 12); ctx.restore();
  litSphere(ctx, W / 2, TOP + (H - TOP) / 2, R, M.viewSun(th), C.lit, '#141c28', '#2c3b50');
  title(ctx, t('c2a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c2b'), W => TOP + 6 + 5 * Math.min(64, (W - 16) / 6)));
  const cw = (W - 16) / 6, chh = Math.min(64, cw), today = Math.min(29, Math.floor(age + 1e-9));
  ctx.save(); ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (let d = 0; d < 30; d++) {
    const x = 8 + (d % 6) * cw, y = TOP + 4 + Math.floor(d / 6) * chh;
    ctx.strokeStyle = '#1e2a3a'; ctx.lineWidth = 1; ctx.strokeRect(x + 1, y + 1, cw - 2, chh - 2);
    ctx.fillStyle = C.muted; ctx.fillText(String(d), x + 4, y + 12);
    const r = Math.min(cw, chh) * 0.26, mx = x + cw / 2 + 3, my = y + chh / 2 + 5;
    if (s2.days.has(d)) litSphere(ctx, mx, my, r, M.viewSun(M.ageToTheta(d)), C.lit, '#141c28', '#2c3b50');
    if (d === today) ring(ctx, mx, my, r + 3, C.cyan, 2);
  }
  ctx.restore();
  title(ctx, t('c2b'), 8, 18, W - 16);
  $('r2').textContent = t('s2readout', { age: fmt(age, 1), a: Math.round(th), name: t(M.phaseName(th)), pct: fmt(100 * M.litFraction(th), 0) });
  $('seen2label').textContent = t('s2seen', { k: s2.names.size });
  $('seen2').innerHTML = M.PHASES.map(k => `<li class="${s2.names.has(k) ? 'seen' : ''}">${t(k)}</li>`).join('');
  $('play2').textContent = anims.s2 ? t('pause') : t('playMonth');
}
function play2() {
  if (anims.s2) { stopAnim('s2'); draw2(); return; }
  const max = Number($('age2').max);
  $('age2').value = 0; s2.last = 0; visitAge(0);
  animate('s2', 12000, p => { const a = Math.round(p * max * 10) / 10; visitAge(a); $('age2').value = a; draw2(); }, () => draw2());
  draw2();
}

/* ---------- step 3: when it rises ---------- */
const s3 = { theta: 180, trail: [] };
function addTrail(tau) { const d = M.skyOffset(s3.theta, tau); if (Math.abs(d) <= 90) s3.trail.push(d); }
function draw3() {
  const tau = num('tau3'), th = s3.theta;
  $('tau3v').textContent = clock(tau);
  let { ctx, W, H } = fitCanvas($('c3'), topH);
  const V = topView(ctx, W, H, { earthScale: 0.34 });
  const mp = V.at(th); litSphere(ctx, mp.x, mp.y, V.rm, [1, 0, 0]);
  // the person on the equator: zenith direction ψ, horizon = tangent line
  const psi = M.zenithAngle(tau) * D2R, ux = Math.cos(psi), uy = -Math.sin(psi);
  const px = V.cx + V.re * ux, py = V.cy + V.re * uy, L = V.re * 1.15;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(px - uy * L, py + ux * L); ctx.lineTo(px + uy * L, py - ux * L); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + ux * 12, py + uy * 12); ctx.stroke(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(px + ux * 15, py + uy * 15, 3.5, 0, 2 * Math.PI); ctx.fill();
  // spin direction (anticlockwise seen from above the North Pole)
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(V.cx, V.cy, V.re * 0.55, 0.3 * Math.PI, 1.1 * Math.PI, false); ctx.stroke();
  const ea = 0.3 * Math.PI, ex = V.cx + V.re * 0.55 * Math.cos(ea), ey = V.cy + V.re * 0.55 * Math.sin(ea);
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 6, ey - 1); ctx.moveTo(ex, ey); ctx.lineTo(ex + 1, ey - 6); ctx.stroke();
  ctx.restore();
  title(ctx, t('c3a'), 8, 18, W - 16);
  // the sky
  ({ ctx, W, H } = fitCanvas($('c3b'), () => topH($('c3').clientWidth || W)));
  const gy = H - 40, cx = W / 2, Rd = Math.max(60, Math.min(W / 2 - 30, gy - TOP - 24));
  const sunAlt = M.altitude(0, tau), moonAlt = M.altitude(th, tau);
  ctx.save(); ctx.fillStyle = sunAlt > 0 ? '#183552' : '#070b12'; ctx.beginPath(); ctx.arc(cx, gy, Rd + 14, Math.PI, 2 * Math.PI); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1f2b1f'; ctx.fillRect(10, gy, W - 20, 10); ctx.strokeStyle = '#6b7f6c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(10, gy); ctx.lineTo(W - 10, gy); ctx.stroke();
  ctx.fillStyle = C.muted; ctx.font = '600 12px system-ui,sans-serif'; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText(t('east'), 12, gy + 26); ctx.textAlign = 'right'; ctx.fillText(t('west'), W - 12, gy + 26);
  ctx.restore();
  const sky = d => ({ x: cx - Rd * Math.sin(d * D2R), y: gy - Rd * Math.cos(d * D2R) });
  ctx.save(); ctx.fillStyle = 'rgba(232,237,244,0.55)'; s3.trail.forEach(d => { const q = sky(d); ctx.beginPath(); ctx.arc(q.x, q.y, 2, 0, 2 * Math.PI); ctx.fill(); }); ctx.restore();
  if (sunAlt > 0) { const q = sky(M.skyOffset(0, tau)); sunGlyph(ctx, q.x, q.y, 10); }
  if (moonAlt > 0) { const q = sky(M.skyOffset(th, tau)); litSphere(ctx, q.x, q.y, 11, M.viewSun(th), C.lit, '#2a3546', '#5a6b80'); }
  title(ctx, t('c3b'), 8, 18, W - 16);
  const nm = M.phaseName(th);
  $('r3').textContent = t('s3readout', { time: clock(tau), sun: t(sunAlt > 0 ? 'sunUp' : 'sunDown'), moon: t(moonAlt > 0 ? 'moonUp' : 'moonDown'), name: t(nm), rise: clock(M.moonRise(th)), set: clock(M.moonSet(th)) }) + (nm === 'new' ? ' ' + t('s3newNote') : '');
  $('h3').textContent = t('s3hint', { delay: fmt(M.riseDelayMin(), 0) });
  document.querySelectorAll('[data-phase]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.phase) === th ? 'true' : 'false'));
  $('play3').textContent = anims.s3 ? t('pause') : t('playDay');
}
function play3() {
  if (anims.s3) { stopAnim('s3'); draw3(); return; }
  const t0 = num('tau3'); s3.trail = []; let k0 = 0;
  animate('s3', 12000, p => {
    const K = Math.floor(p * 96); for (let k = k0; k <= K; k++) addTrail(t0 + k * 0.25); k0 = K + 1;
    $('tau3').value = String(((t0 + 24 * p) % 24 + 24) % 24); draw3();
  }, () => draw3());
  draw3();
}

/* ---------- step 4: eclipses ---------- */
const s4 = { year: 0 };
function draw4() {
  const list = M.fullMoonsOfYear(s4.year), N = list.length;
  $('k4').max = N; if (num('k4') > N) $('k4').value = N;
  const k = num('k4'), sel = list[k - 1];
  $('k4v').textContent = String(k); $('prev4').disabled = s4.year === 0;
  $('e4').innerHTML = t('s4e', { umbra: Math.round(M.umbraRadius()).toLocaleString('en-US') });
  const { ctx, W, H } = fitCanvas($('c4'), W => Math.min(360, Math.max(260, W * 0.42)));
  const P = { l: 54, r: W - 14, t: TOP + 12, b: H - 28 }, Hmax = 38000;
  const y = v => (P.t + P.b) / 2 - v / Hmax * (P.b - P.t) / 2, x = i => P.l + (i + 0.5) / 13 * (P.r - P.l), sc = (P.b - P.t) / 2 / Hmax;
  const U = M.umbraRadius();
  ctx.save();
  ctx.fillStyle = C.shadow; ctx.fillRect(P.l, y(U), P.r - P.l, y(-U) - y(U)); ctx.strokeStyle = '#6b3a4a'; ctx.strokeRect(P.l, y(U), P.r - P.l, y(-U) - y(U));
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const v of [-30000, 0, 30000]) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.fillText((v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US'), P.l - 6, y(v)); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const every = (P.r - P.l) / 13 >= 20 ? 1 : 2;
  list.forEach((q, i) => { if ((i + 1) % every === 0 || i === 0) ctx.fillText(String(i + 1), x(i), P.b + 17); });
  ctx.restore();
  list.forEach((q, i) => {
    const r = Math.max(3.5, M.R_MOON * sc), X = x(i), Y = y(q.h);
    ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 2 * Math.PI); ctx.fillStyle = q.kind === 'none' ? C.lit : C.pink; ctx.fill(); ctx.restore();
    if (i === k - 1) ring(ctx, X, Y, r + 5, C.cyan, 2.2);
  });
  title(ctx, t('c4'), 8, 18, W - 16);
  const kinds = { total: 'kindTotal', partial: 'kindPartial', none: 'kindNone' };
  $('r4').textContent = t('s4readout', { y: s4.year + 1, i: k, dir: t(sel.h >= 0 ? 's4above' : 's4below'), h: Math.round(Math.abs(sel.h)).toLocaleString('en-US'), kind: t(kinds[sel.kind]) });
  const tot = list.filter(q => q.kind === 'total').length, par = list.filter(q => q.kind === 'partial').length;
  $('y4').textContent = t('s4year', { n: N, k: tot + par, t: tot, p: par });
}

/* ---------- step 5: guess the place ---------- */
const s5 = { idx: 0, round: 1, checked: false, results: [] };
function draw5() {
  const truth = M.QUIZ[s5.idx], g = num('g5');
  $('g5v').textContent = g + '°';
  let { ctx, W, H } = fitCanvas($('c5'), discH);
  const R = Math.max(40, Math.min(W / 2 - 24, (H - TOP) / 2 - 20));
  ctx.save(); ctx.fillStyle = '#070b12'; ctx.fillRect(8, TOP + 4, W - 16, H - TOP - 12); ctx.restore();
  litSphere(ctx, W / 2, TOP + (H - TOP) / 2, R, M.viewSun(truth), C.lit, '#141c28', '#2c3b50');
  title(ctx, t('c5a'), 8, 18, W - 16);
  ({ ctx, W, H } = fitCanvas($('c5b'), () => discH($('c5').clientWidth || 300)));
  const V = topView(ctx, W, H);
  if (s5.checked) { const q = V.at(truth); litSphere(ctx, q.x, q.y, V.rm, [1, 0, 0]); ring(ctx, q.x, q.y, V.rm + 5, C.orange, 2.4); }
  const p = V.at(g); litSphere(ctx, p.x, p.y, V.rm, [1, 0, 0]); ring(ctx, p.x, p.y, V.rm + 4, C.cyan, 2);
  title(ctx, t('c5b'), 8, 18, W - 16);
  const name = t(M.phaseName(truth));
  if (!s5.checked) $('r5').textContent = t('s5before', { round: s5.round });
  else if (M.quizCorrect(g, truth)) $('r5').textContent = t('s5right', { round: s5.round, name, a: truth });
  else { const sd = M.litSide(truth); const tip = sd === 'right' ? t('tipRight') : sd === 'left' ? t('tipLeft') : truth === 0 ? t('tipNew') : t('tipFull'); $('r5').textContent = t('s5wrong', { round: s5.round, name, a: truth, tip }); }
  const done = s5.results.filter(v => v !== undefined);
  $('h5').textContent = done.length ? t('s5score', { c: done.filter(Boolean).length, n: done.length }) : t('s5none');
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }
function setup() {
  document.querySelectorAll('.pos-slider').forEach(el => el.addEventListener('input', () => setPos(Number(el.value))));
  $('age2').addEventListener('input', () => { stopAnim('s2'); visitAge(num('age2')); draw2(); });
  $('play2').addEventListener('click', play2);
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.days = new Set(); s2.names = new Set(); s2.last = num('age2'); visitAge(num('age2')); draw2(); });
  $('tau3').addEventListener('input', () => { stopAnim('s3'); addTrail(num('tau3')); draw3(); });
  $('play3').addEventListener('click', play3);
  document.querySelectorAll('[data-phase]').forEach(b => b.addEventListener('click', () => { stopAnim('s3'); s3.theta = Number(b.dataset.phase); s3.trail = []; addTrail(num('tau3')); draw3(); }));
  $('k4').addEventListener('input', draw4);
  $('prev4').addEventListener('click', () => { if (s4.year > 0) { s4.year--; draw4(); } });
  $('next4').addEventListener('click', () => { s4.year++; draw4(); });
  $('g5').addEventListener('input', () => { s5.checked = false; draw5(); });
  $('check5').addEventListener('click', () => { s5.checked = true; s5.results[s5.round - 1] = M.quizCorrect(num('g5'), M.QUIZ[s5.idx]); draw5(); });
  $('next5').addEventListener('click', () => { s5.idx = (s5.idx + 1) % M.QUIZ.length; s5.round++; s5.checked = false; draw5(); });
  addTrail(num('tau3'));
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (anims.s2) { stopAnim('s2'); draw2(); } if (anims.s3) { stopAnim('s3'); draw3(); } } });
  window.refreshMoon = refresh;
  refresh();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
