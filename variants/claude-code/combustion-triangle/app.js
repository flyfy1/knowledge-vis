'use strict';
// Fire-triangle lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every flame, curve, bar and readout comes from window.FIRE_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrunk to fit), axis ticks, one reference-line label per plot and short sample
// labels in reserved slots; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.FIRE_MODEL;
const I = window.FIRE_I18N;
const t = (...a) => I.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#6b7c92', ghost: '#8696aa', copper: '#c87f4a', water: '#18476b' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 1) => M.trim(M.fix(v, d));
const sig = (v, s = 2) => { if (v === 0) return '0'; const d = Math.max(0, s - 1 - Math.floor(Math.log10(Math.abs(v)))); return M.trim(v.toFixed(d)); };

Object.assign(I.STATIC_PARAMS, {
  steady: fmt(M.steadyT(M.PHI_AIR), 0),
  hold: fmt(M.minHold(), 1),
  at: String(M.ACT_AT),
  wk: String(M.WATER),
  pure: fmt(1 / M.PHI_AIR, 1)
});

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
const title = (ctx, text, X, Y, maxW) => fitText(ctx, text, X, Y, maxW);
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const q of o.yTicks || []) {
    const v = typeof q === 'number' ? q : q.v, s = typeof q === 'number' ? fmt(q, 2) : q.s;
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l + 1, y(v)); ctx.lineTo(P.r - 1, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(s, P.l - 6, y(v) + 4);
  }
  for (const q of o.xTicks || []) {
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(q.v), P.b); ctx.lineTo(x(q.v), P.b + 4); ctx.stroke();
    const w = ctx.measureText(q.s).width, X = Math.min(W - 3 - w / 2, Math.max(3 + w / 2, x(q.v)));
    ctx.textAlign = 'center'; ctx.fillText(q.s, X, P.b + 16);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function xticks(lo, hi, px, steps, minPx = 34, f = v => fmt(v, 2)) {
  let step = steps[steps.length - 1];
  for (const s of steps) if (s / (hi - lo) * px >= minPx) { step = s; break; }
  const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push({ v, s: f(v) });
  return out;
}
function line(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = color; ctx.fill(); ctx.restore(); }
// Reference line with a small label right-aligned above it, inside the plot.
function refLine(ctx, m, v, label, alignLeft = false) {
  line(ctx, [[m.P.l, m.y(v)], [m.P.r, m.y(v)]], C.ghost, 1.2, [5, 4]);
  fitText(ctx, label, alignLeft ? m.P.l + 5 : m.P.r - 5, m.y(v) - 5, (m.P.r - m.P.l) * 0.5, { size: 11, weight: 500, color: C.muted, align: alignLeft ? 'left' : 'right' });
}
// A flame: teardrop of height h standing on (x, yBase); phase makes it flicker.
function flame(ctx, x, yBase, h, phase = 0) {
  if (h < 1) return;
  const k = 1 + 0.06 * Math.sin(phase * 9) + 0.04 * Math.sin(phase * 23), hh = h * k, w = h * 0.36;
  ctx.save();
  const g = ctx.createLinearGradient(x, yBase, x, yBase - hh);
  g.addColorStop(0, 'rgba(255,122,60,0.95)'); g.addColorStop(0.55, 'rgba(255,180,84,0.95)'); g.addColorStop(1, 'rgba(255,236,170,0.85)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, yBase - hh);
  ctx.bezierCurveTo(x + w * 1.1, yBase - hh * 0.45, x + w, yBase, x, yBase);
  ctx.bezierCurveTo(x - w, yBase, x - w * 1.1, yBase - hh * 0.45, x, yBase - hh); ctx.fill();
  ctx.fillStyle = 'rgba(255,250,220,0.8)'; ctx.beginPath(); ctx.ellipse(x, yBase - hh * 0.28, w * 0.35, hh * 0.2, 0, 0, 7); ctx.fill();
  ctx.restore();
}
const phaseNow = () => (reduceMotion() ? 0 : performance.now() / 1000);

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: the copper-plate experiment ---------- */
const s0 = { o2: false };
function blob(ctx, x, y, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, 9, 5.5, 0, 0, 7); ctx.fill(); ctx.restore(); }
function draw0() {
  const Tw = num('tw0'); $('tw0v').textContent = String(Tw);
  $('o2btn').setAttribute('aria-pressed', String(s0.o2));
  const { ctx, W, H } = fitCanvas($('c0')), ph = phaseNow();
  title(ctx, t('c0'), 8, 17, W - 16);
  const bw = Math.min(W - 44, 460), x0 = (W - bw) / 2, plateY = 112, top = 120, bot = H - 18;
  // water: deeper tint when hotter
  const heat = (Tw - 20) / 70;
  ctx.fillStyle = `rgb(${24 + 50 * heat},${71 - 10 * heat},${107 - 25 * heat})`; ctx.fillRect(x0, top, bw, bot - top);
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, plateY - 6); ctx.lineTo(x0, bot); ctx.lineTo(x0 + bw, bot); ctx.lineTo(x0 + bw, plateY - 6); ctx.stroke();
  // copper plate resting on the rim
  ctx.fillStyle = C.copper; ctx.fillRect(x0 - 12, plateY, bw + 24, 8);
  const xw = x0 + 0.27 * bw, xr = x0 + 0.73 * bw, xu = x0 + 0.27 * bw, yu = bot - 30;
  const res = { w: M.plate('whiteP', Tw, s0.o2), r: M.plate('redP', Tw, s0.o2), u: M.plate('whitePWater', Tw, s0.o2), c: M.plate('copper', Tw, s0.o2) };
  blob(ctx, xw, plateY - 4, '#f2efe0'); blob(ctx, xr, plateY - 4, '#d9534f');
  if (res.w.burns) flame(ctx, xw, plateY - 6, 52, ph);
  if (res.r.burns) flame(ctx, xr, plateY - 6, 52, ph + 1.3);
  fitText(ctx, t('lblWhite'), xw, plateY + 26, 0.46 * bw, { size: 11, weight: 500, color: C.text, align: 'center' });
  fitText(ctx, t('lblRed'), xr, plateY + 26, 0.46 * bw, { size: 11, weight: 500, color: C.text, align: 'center' });
  // dish and white phosphorus under water
  ctx.fillStyle = '#9fb4cc'; ctx.fillRect(xu - 20, yu + 4, 40, 5);
  blob(ctx, xu, yu, '#f2efe0');
  if (res.u.burns) flame(ctx, xu, yu - 2, 34, ph + 2.1);
  fitText(ctx, t('lblUnder'), x0 + 0.45 * bw, yu + 5, 0.52 * bw, { size: 11, weight: 500, color: C.text, align: 'left' });
  // oxygen tube from the right wall to just beside the dish
  const tubeY = top + 46, tx = xu + 30;
  ctx.strokeStyle = '#cfd8e3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + bw + 14, tubeY); ctx.lineTo(tx, tubeY); ctx.lineTo(tx, yu - 6); ctx.stroke();
  if (s0.o2) {
    ctx.strokeStyle = 'rgba(232,237,244,0.85)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 9; i++) {
      const f = ((i / 9) + ph * 0.35) % 1, by = yu - 8 - f * (yu - 8 - top - 6), bx = tx - 10 + 5 * Math.sin(i * 1.7 + ph * 3);
      ctx.beginPath(); ctx.arc(bx, by, 2.5 + (i % 3), 0, 7); ctx.stroke();
    }
  }
  const lineFor = (r, nm) => (r.burns ? t('burnLine', { name: t(nm) }) : r.missing[0] === 'fuel' ? t('noFuel', { name: t(nm) }) : r.missing[0] === 'oxygen' ? t('noO2', { name: t(nm) }) : t('noHeat', { name: t(nm), T: r.T, ign: r.ign }));
  $('r0').textContent = [lineFor(res.w, 'nmWhite'), lineFor(res.r, 'nmRed'), lineFor(res.u, 'nmUnder'), lineFor(res.c, 'nmCopper')].join(' ');
}

/* ---------- step 1: lighting — the heat budget ---------- */
const s1 = { hold: 2, now: 1.5, hist: [], prog: '' };
const cache1 = {};
const run1 = h => (cache1[h] = cache1[h] || M.ignite(h));
function draw1() {
  const hold = s1.hold, r = run1(hold);
  $('hold1v').textContent = fmt(hold, 1); $('tc1v').textContent = fmt(s1.now, 1);
  const { ctx, W, H } = fitCanvas($('c1')), ph = phaseNow();
  title(ctx, t('c1top'), 8, 17, W - 16);
  const i = Math.min(r.pts.length - 1, Math.round(s1.now / 0.05)), p = r.pts[i];
  const vals = [[t('barMatch'), p.t < hold ? M.MATCH : 0, C.pink], [t('barBurn'), p.burning ? M.G : 0, C.orange], [t('barLoss'), (p.T - M.ROOM) / M.TAU, C.cyan]];
  const full = 220, bmax = W - 16 - 84;
  vals.forEach(([lab, v, col], k) => {
    const Y = 40 + k * 36;
    fitText(ctx, lab, 8, Y, W - 16, { size: 12, weight: 500, color: C.muted });
    const L = Math.max(1.5, bmax * v / full); ctx.fillStyle = col; ctx.fillRect(8, Y + 6, L, 11);
    ctx.save(); ctx.fillStyle = C.text; ctx.font = '11px system-ui,sans-serif'; ctx.fillText(fmt(v, 0) + ' °C/s', 8 + L + 6, Y + 15); ctx.restore();
  });
  const m = panel(ctx, W, { top: 176, bottom: H - 28, xMin: 0, xMax: 20, yMin: 0, yMax: 650, yTicks: [0, 200, 400, 600].map(v => ({ v, s: String(v) })), xTicks: xticks(0, 20, W - 52, [2, 4, 5, 10], 30, v => fmt(v, 0)), title: t('c1bot') });
  ctx.fillStyle = 'rgba(255,122,147,0.16)'; ctx.fillRect(m.x(0), m.P.t, m.x(hold) - m.x(0), m.P.b - m.P.t);
  refLine(ctx, m, M.TIGN, t('ignLabel', { T: M.TIGN }));
  s1.hist.forEach(h => { if (h !== hold) line(ctx, run1(h).pts.map(q => [m.x(q.t), m.y(q.T)]), C.raw, 1.4, null, 0.8); });
  if (!anims.s1) line(ctx, r.pts.map(q => [m.x(q.t), m.y(q.T)]), C.cyan, 2, null, 0.35);
  line(ctx, r.pts.slice(0, i + 1).map(q => [m.x(q.t), m.y(q.T)]), C.cyan, 2.6);
  line(ctx, [[m.x(p.t), m.P.t], [m.x(p.t), m.P.b]], C.text, 1, [3, 3], 0.5);
  dot(ctx, m.x(p.t), m.y(p.T), 5.5, C.text);
  if (p.burning) flame(ctx, m.x(p.t), m.y(p.T) - 7, 20, ph);
  const msg = r.tIgn !== null ? t('s1yes', { prog: s1.prog, h: fmt(hold, 1), ti: fmt(r.tIgn, 1), Ts: fmt(M.steadyT(M.PHI_AIR), 0) }) : t('s1no', { prog: s1.prog, h: fmt(hold, 1), Tm: fmt(r.Tmax, 0), Ti: M.TIGN });
  $('r1').textContent = msg;
}

/* ---------- step 2: candle under a jar ---------- */
const S2 = { tMax: 32 };
const s2 = { V: 1000, now: null, hist: [], prog: '' };
const margin = phi => Math.max(0, Math.min(1, (M.steadyT(phi) - M.TIGN) / (M.steadyT(M.PHI_AIR) - M.TIGN)));
function draw2() {
  const V = s2.V; $('vol2v').textContent = String(V);
  const { ctx, W, H } = fitCanvas($('c2')), ph = phaseNow();
  title(ctx, t('c2top'), 8, 17, W - 16);
  const tout = M.jarOut(V), now = s2.now, on = now !== null;
  const phi = on ? M.jarPhi(V, now) : M.PHI_AIR, lit = !on || now < tout;
  // scene: table, candle, jar
  const cx = W / 2, table = 190, s = Math.cbrt(V / 1000), jw = 104 * s, jh = 120 * s;
  ctx.fillStyle = '#2a3646'; ctx.fillRect(16, table, W - 32, 4);
  ctx.fillStyle = '#e9e4d4'; ctx.fillRect(cx - 9, table - 42, 18, 42);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, table - 42); ctx.lineTo(cx, table - 48); ctx.stroke();
  if (lit) flame(ctx, cx, table - 46, 10 + 26 * margin(phi), ph);
  ctx.save(); ctx.strokeStyle = on ? '#cfe6f5' : C.ghost; ctx.lineWidth = on ? 2 : 1.4; if (!on) ctx.setLineDash([5, 4]);
  const jy = on ? table : table - 18, r = 16 * s;
  ctx.beginPath(); ctx.moveTo(cx - jw / 2, jy); ctx.lineTo(cx - jw / 2, jy - jh + r); ctx.quadraticCurveTo(cx - jw / 2, jy - jh, cx - jw / 2 + r, jy - jh);
  ctx.lineTo(cx + jw / 2 - r, jy - jh); ctx.quadraticCurveTo(cx + jw / 2, jy - jh, cx + jw / 2, jy - jh + r); ctx.lineTo(cx + jw / 2, jy); ctx.stroke();
  if (on) { ctx.fillStyle = 'rgba(103,215,249,0.06)'; ctx.fillRect(cx - jw / 2, jy - jh, jw, jh); }
  ctx.restore();
  // plot: oxygen share over time
  const m = panel(ctx, W, { top: 240, bottom: H - 28, xMin: 0, xMax: S2.tMax, yMin: 12, yMax: 22.5, yTicks: [12, 14, 16, 18, 20, 22].map(v => ({ v, s: v + '%' })), xTicks: xticks(0, S2.tMax, W - 52, [4, 8, 16], 30, v => fmt(v, 0)), title: t('c2bot') });
  refLine(ctx, m, M.PHI_MIN * 100, t('minLabel', { p: fmt(M.PHI_MIN * 100, 0) }));
  const curve = (VV, upto) => { const pts = []; for (let q = 0; q <= 200; q++) { const tt = upto * q / 200; pts.push([m.x(tt), m.y(M.jarPhi(VV, tt) * 100)]); } return pts; };
  s2.hist.forEach(v => { if (v !== V) line(ctx, curve(v, S2.tMax), C.raw, 1.4, null, 0.8); });
  if (on) {
    line(ctx, curve(V, Math.min(now, S2.tMax)), C.cyan, 2.6);
    dot(ctx, m.x(Math.min(now, S2.tMax)), m.y(phi * 100), 5.5, C.text);
    if (now >= tout) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; const X = m.x(tout), Y = m.y(M.PHI_MIN * 100); ctx.beginPath(); ctx.moveTo(X - 6, Y - 6); ctx.lineTo(X + 6, Y + 6); ctx.moveTo(X + 6, Y - 6); ctx.lineTo(X - 6, Y + 6); ctx.stroke(); ctx.restore(); }
  }
  if (!on) { $('r2').textContent = t('s2idle', { V, tout: fmt(tout, 1) }); return; }
  $('r2').textContent = t('s2readout', { prog: s2.prog, V, tout: fmt(tout, 1), pmin: fmt(M.PHI_MIN * 100, 0), left: fmt(M.PHI_MIN / M.PHI_AIR * 100, 0), used: fmt(M.jarUsed(V), 0) });
}

/* ---------- step 3: putting it out ---------- */
const s3 = { act: 'water', now: 20, prog: '' };
const base3 = M.extinguish('none'), WMIN = M.minWater(), cache3 = {};
const run3 = (a, w) => { const k = a + (a === 'water' ? w : ''); return (cache3[k] = cache3[k] || M.extinguish(a, w)); };
function draw3() {
  const w = num('w3'); $('w3v').textContent = fmt(w, 1);
  ['Fuel', 'Lid', 'Water'].forEach(k => $('act' + k).setAttribute('aria-pressed', String(s3.act === k.toLowerCase())));
  const r = run3(s3.act, w), i = Math.min(r.pts.length - 1, Math.round(s3.now / 0.05)), p = r.pts[i];
  const { ctx, W, H } = fitCanvas($('c3')), ph = phaseNow();
  title(ctx, t('c3top'), 8, 17, W - 16);
  // triangle: base = fuel, left = oxygen, right = heat
  const L = Math.min(150, W * 0.42), cx = W / 2, ty = 42, by = ty + L * 0.866, A = [cx, ty], B = [cx - L / 2, by], Cc = [cx + L / 2, by];
  const fuelOn = s3.act !== 'fuel' || p.t < M.ACT_AT, o2On = p.phi >= M.PHI_MIN, heatOn = p.T >= M.TIGN;
  const side = (P1, P2, on, alpha) => line(ctx, [P1, P2], on ? C.green : C.ghost, on ? 5 : 2, on ? null : [6, 5], on ? alpha : 0.9);
  side(B, Cc, fuelOn, 1); side(A, B, o2On, Math.max(0.35, p.phi / M.PHI_AIR)); side(A, Cc, heatOn, 1);
  if (p.burning) flame(ctx, cx, by - 10, 34 + 12 * Math.min(1, (p.T - M.TIGN) / 90), ph);
  fitText(ctx, t('sideFuel'), cx, by + 18, L, { size: 12, weight: 600, color: fuelOn ? C.green : C.muted, align: 'center' });
  fitText(ctx, t('sideO2'), cx - L / 4 - 12, ty + L * 0.433 + 4, cx - L / 4 - 20, { size: 12, weight: 600, color: o2On ? C.green : C.muted, align: 'right' });
  fitText(ctx, t('sideHeat'), cx + L / 4 + 12, ty + L * 0.433 + 4, W - (cx + L / 4 + 20), { size: 12, weight: 600, color: heatOn ? C.green : C.muted, align: 'left' });
  const m = panel(ctx, W, { top: 236, bottom: H - 28, xMin: 0, xMax: 20, yMin: 0, yMax: 450, yTicks: [0, 100, 200, 300, 400].map(v => ({ v, s: String(v) })), xTicks: xticks(0, 20, W - 52, [2, 4, 5, 10], 30, v => fmt(v, 0)), title: t('c3bot') });
  refLine(ctx, m, M.TIGN, t('ignLabel', { T: M.TIGN }));
  line(ctx, base3.pts.map(q => [m.x(q.t), m.y(q.T)]), C.raw, 1.6, [6, 4]);
  line(ctx, [[m.x(M.ACT_AT), m.P.t], [m.x(M.ACT_AT), m.P.b]], C.pink, 1.2, [3, 3], 0.8);
  if (s3.act === 'water') { ctx.fillStyle = 'rgba(103,215,249,0.12)'; ctx.fillRect(m.x(M.ACT_AT), m.P.t, m.x(M.ACT_AT + 1) - m.x(M.ACT_AT), m.P.b - m.P.t); }
  line(ctx, r.pts.slice(0, i + 1).map(q => [m.x(q.t), m.y(q.T)]), C.cyan, 2.6);
  dot(ctx, m.x(p.t), m.y(p.T), 5.5, C.text);
  const Tm = Math.min(...r.pts.filter(q => q.t >= M.ACT_AT && q.t <= M.ACT_AT + 3).map(q => q.T));
  const key = s3.act === 'fuel' ? 's3fuel' : s3.act === 'lid' ? 's3lid' : r.burningAtEnd ? 's3waterNo' : 's3waterOut';
  $('r3').textContent = t(key, { prog: s3.prog, at: M.ACT_AT, to: r.tOut === null ? '—' : fmt(r.tOut, 1), w: fmt(w, 1), Tm: fmt(Tm, 0), Ti: M.TIGN, wmin: fmt(Math.ceil(WMIN * 10) / 10, 1) });
}

/* ---------- step 4: chopping ---------- */
const s4 = { pure: false, hist: { air: new Set([2]), pure: new Set() } };
function sizeText(cm) { if (cm >= 1) return sig(cm, 2) + ' cm'; if (cm >= 0.01) return sig(cm * 10, 2) + ' mm'; return sig(cm * 1e4, 2) + ' μm'; }
function timeText(s) { return s >= 60 ? sig(s / 60, 2) + ' ' + t('uMin') : sig(s, 2) + ' ' + t('uSec'); }
function draw4() {
  const k = num('k4'), n = Math.pow(2, k), phi = s4.pure ? 1 : M.PHI_AIR, c = M.chop(n, phi);
  $('k4v').textContent = 'n = ' + n;
  $('gasAir').setAttribute('aria-pressed', String(!s4.pure)); $('gasPure').setAttribute('aria-pressed', String(s4.pure));
  s4.hist[s4.pure ? 'pure' : 'air'].add(k);
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4top', { n, s: sizeText(c.sizeCm) }), 8, 17, W - 16);
  // one face of the cube, cut into an n × n grid (beyond 32 cuts the lines merge into a dust texture)
  const S = 128, X0 = (W - S) / 2, Y0 = 32;
  ctx.fillStyle = '#8a5a34'; ctx.fillRect(X0, Y0, S, S);
  if (n <= 32) {
    ctx.strokeStyle = '#3a2614'; ctx.lineWidth = n <= 8 ? 2 : 1;
    for (let q = 1; q < n; q++) { const d = S * q / n; ctx.beginPath(); ctx.moveTo(X0 + d, Y0); ctx.lineTo(X0 + d, Y0 + S); ctx.moveTo(X0, Y0 + d); ctx.lineTo(X0 + S, Y0 + d); ctx.stroke(); }
  } else {
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    ctx.fillStyle = '#c99a6b'; const count = Math.min(2600, 300 * (k - 4));
    for (let q = 0; q < count; q++) ctx.fillRect(X0 + rnd() * S, Y0 + rnd() * S, 1.2, 1.2);
  }
  ctx.strokeStyle = C.ghost; ctx.lineWidth = 1; ctx.strokeRect(X0, Y0, S, S);
  // burn-out time vs n (log–log)
  const yt = [-2, -1, 0, 1, 2, 3].map(e => ({ v: e, s: String(Math.pow(10, e)) }));
  const m = panel(ctx, W, { top: 196, bottom: H - 28, left: 44, xMin: 0, xMax: 12, yMin: -2, yMax: 3.2, yTicks: yt, xTicks: xticks(0, 12, W - 56, [3, 6], 34, v => String(Math.pow(2, v))), title: t('c4bot') });
  refLine(ctx, m, 0, t('ref1s'), true);
  const lineFor = (ph2, col) => { const pts = []; for (let q = 0; q <= 120; q++) { const kk = 12 * q / 120; pts.push([m.x(kk), m.y(Math.log10(M.chop(Math.pow(2, kk), ph2).time))]); } line(ctx, pts, col, s4.pure === (ph2 === 1) ? 2.6 : 1.6, null, s4.pure === (ph2 === 1) ? 1 : 0.55); };
  lineFor(M.PHI_AIR, C.cyan); lineFor(1, C.orange);
  [...s4.hist[s4.pure ? 'pure' : 'air']].forEach(kk => { if (kk !== k) dot(ctx, m.x(kk), m.y(Math.log10(M.chop(Math.pow(2, kk), phi).time)), 3.5, C.text); });
  dot(ctx, m.x(k), m.y(Math.log10(c.time)), 6.5, s4.pure ? C.orange : C.cyan);
  $('r4').textContent = t('s4readout', { n, pieces: c.pieces.toLocaleString('en-US'), size: sizeText(c.sizeCm), gas: t(s4.pure ? 'gasPure' : 'gasAir'), time: timeText(c.time), pw: sig(c.powerRatio, 3), note: c.time < 1 ? t('noteDust') : '' });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

/* ---------- gentle flicker for visible flames (off with reduced motion, paused when hidden) ---------- */
const visible = new Set();
let flick = null, lastFlick = 0;
function flickLoop(now) {
  flick = null;
  if (document.hidden || reduceMotion() || !visible.size) return;
  if (now - lastFlick > 60) {
    lastFlick = now;
    if (visible.has('c0')) draw0();
    if (visible.has('c2') && !anims.s2) draw2();
    if (visible.has('c3') && !anims.s3) draw3();
    if (visible.has('c1') && !anims.s1) draw1();
  }
  flick = requestAnimationFrame(flickLoop);
}
const startFlicker = () => { if (!flick && !reduceMotion() && !document.hidden) flick = requestAnimationFrame(flickLoop); };

function setup() {
  $('tw0').addEventListener('input', draw0);
  $('o2btn').addEventListener('click', () => { s0.o2 = !s0.o2; draw0(); });

  $('hold1').addEventListener('input', () => {
    stopAnim('s1'); s1.prog = '';
    if (!s1.hist.includes(s1.hold)) s1.hist.push(s1.hold);
    s1.hold = num('hold1'); draw1();
  });
  $('tc1').addEventListener('input', () => { stopAnim('s1'); s1.prog = ''; s1.now = num('tc1'); draw1(); });
  $('light1').addEventListener('click', () => {
    animate('s1', 6000, p => { s1.now = Math.round(200 * p) / 10; $('tc1').value = s1.now; s1.prog = p < 1 ? t('s1progress', { t: fmt(s1.now, 1) }) : ''; draw1(); }, () => { s1.prog = ''; draw1(); });
  });
  $('clear1').addEventListener('click', () => { s1.hist = []; draw1(); });

  $('vol2').addEventListener('input', () => {
    stopAnim('s2'); s2.prog = '';
    if (!s2.hist.includes(s2.V)) s2.hist.push(s2.V);
    s2.V = num('vol2'); s2.now = null; draw2();
  });
  $('cover2').addEventListener('click', () => {
    const end = Math.min(S2.tMax, M.jarOut(s2.V) + 2);
    animate('s2', end / 2 * 1000, p => { s2.now = end * p; s2.prog = p < 1 ? t('s2progress', { t: fmt(s2.now, 1), phi: fmt(M.jarPhi(s2.V, s2.now) * 100, 1) }) : ''; draw2(); }, () => { s2.prog = ''; draw2(); });
  });
  $('clear2').addEventListener('click', () => { s2.hist = []; draw2(); });
  s2.now = Math.min(S2.tMax, M.jarOut(s2.V) + 2); // arrive showing one finished run

  const act = a => { s3.act = a; animate('s3', 6000, p => { s3.now = 20 * p; s3.prog = p < 1 ? t('s3progress', { t: fmt(s3.now, 1) }) : ''; draw3(); }, () => { s3.prog = ''; draw3(); }); };
  $('actFuel').addEventListener('click', () => act('fuel'));
  $('actLid').addEventListener('click', () => act('lid'));
  $('actWater').addEventListener('click', () => act('water'));
  $('w3').addEventListener('input', () => { stopAnim('s3'); s3.prog = ''; s3.act = 'water'; s3.now = 20; draw3(); });
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  $('k4').addEventListener('input', draw4);
  $('gasAir').addEventListener('click', () => { s4.pure = false; draw4(); });
  $('gasPure').addEventListener('click', () => { s4.pure = true; draw4(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const vis = new IntersectionObserver(es => { es.forEach(e => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id))); startFlicker(); });
    ['c0', 'c1', 'c2', 'c3'].forEach(id => vis.observe($(id)));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); if (flick) { cancelAnimationFrame(flick); flick = null; } } else startFlicker(); });
  window.refreshFire = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
