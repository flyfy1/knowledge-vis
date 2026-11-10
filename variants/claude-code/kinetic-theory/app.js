'use strict';
// Kinetic theory lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every particle, bar, curve and readout comes from window.KT_MODEL (model.js). Canvas text is limited to
// panel titles (own row, shrink-to-fit) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.KT_MODEL;
const t = (...a) => window.KT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa', wall: '#3b4f68' };
const GCOL = { He: C.cyan, Ne: C.pink, N2: C.green, CO2: C.orange, Xe: C.violet };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const sig = v => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(3));
const pct = v => (v * 100).toFixed(1) + '%';

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Panel title in its own row; the font shrinks until the text fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 9);
  ctx.fillText(text, X, Y, maxW); ctx.restore(); // last resort: a slight horizontal squeeze, never clipping
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Up to ~4 round tick values from 0 to max.
function niceTicks(max) {
  const raw = max / 3, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  const step = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, out = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toPrecision(10));
  return out;
}
// Plot panel. o: top, bottom, xMin, xMax, yMin, yMax, yTicks, yLabels?, xTicks (bool | array of values), xLabel?(v), xSteps, title, left, right
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  o.yTicks.forEach((v, i) => {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabels ? o.yLabels[i] : fmt(v, 3), P.l - 6, y(v) + 4);
  });
  if (o.xTicks) {
    let vals;
    if (Array.isArray(o.xTicks)) vals = o.xTicks;
    else { const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20, 50, 100, 200, 500]); vals = []; for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) vals.push(+v.toPrecision(10)); }
    ctx.textAlign = 'center';
    vals.forEach(v => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v, 2), x(v), P.b + 15); });
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 14, W - 16);
  return { x, y, P };
}
function polyline(ctx, pts, color, lw = 2, dash = null) {
  if (!pts.length) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
function clipPanel(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }

/* ---------- animation runner (reduced motion → jump to the end; hidden page → finish) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: one molecule, one wall ---------- */
const T0 = 12;
function draw0() {
  const v = num('v0'), L = num('L0'), tt = num('t0'), s = M.single(v, L, tt);
  $('v0v').textContent = fmt(v); $('L0v').textContent = fmt(L); $('t0v').textContent = tt.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c0'));
  // box, drawn to scale: L = 2 fills the width
  title(ctx, t('c0a'), 8, 16, W - 16);
  const bx0 = 40, unit = (W - 80) / 2, by0 = 30, by1 = 84, bx1 = bx0 + L * unit;
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.05)'; ctx.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
  ctx.strokeStyle = C.wall; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx0, by1); ctx.stroke();
  const recent = s.hits > 0 && tt - M.hitTimes(v, L, tt).pop() < 0.3;
  ctx.strokeStyle = recent ? C.orange : C.cyan; ctx.lineWidth = recent ? 5 : 3; ctx.beginPath(); ctx.moveTo(bx1, by0); ctx.lineTo(bx1, by1); ctx.stroke();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(bx0, (by0 + by1) / 2); ctx.lineTo(bx1, (by0 + by1) / 2); ctx.stroke(); ctx.restore();
  const px = bx0 + s.x * unit, py = (by0 + by1) / 2;
  // direction of travel: unfolded position modulo 2L
  const u = (v * tt) % (2 * L), dir = u < L ? 1 : -1, al = 12 + 8 * v / 3;
  ctx.save(); ctx.strokeStyle = C.text; ctx.fillStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py - 12); ctx.lineTo(px + dir * al, py - 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px + dir * (al + 5), py - 12); ctx.lineTo(px + dir * al, py - 16); ctx.lineTo(px + dir * al, py - 8); ctx.closePath(); ctx.fill(); ctx.restore();
  dot(ctx, px, py, 7, C.text);

  const B = panel(ctx, W, { top: 128, bottom: 206, xMin: 0, xMax: T0, yMin: 0, yMax: 6.6, yTicks: [0, 2, 4, 6], xTicks: true, title: t('c0b') });
  M.hitTimes(v, L, tt).forEach(h => { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(B.x(h), B.y(0)); ctx.lineTo(B.x(h), B.y(s.impulse)); ctx.stroke(); ctx.restore(); dot(ctx, B.x(h), B.y(s.impulse), 3.5, C.orange); });
  const yMax = 2.25 * s.theory, ticks = [0, s.theory, 2 * s.theory];
  const Cp = panel(ctx, W, { top: 256, bottom: H - 26, xMin: 0, xMax: T0, yMin: 0, yMax, yTicks: ticks, yLabels: ticks.map(q => (q ? sig(q) : '0')), xTicks: true, title: t('c0c') });
  polyline(ctx, [[Cp.x(0), Cp.y(s.theory)], [Cp.x(T0), Cp.y(s.theory)]], C.ghost, 1.5, [6, 5]);
  const pts = []; for (let q = 0.02; q <= tt + 1e-9; q += 0.02) pts.push([Cp.x(q), Cp.y(M.single(v, L, q).mean)]);
  if (tt > 0) pts.push([Cp.x(tt), Cp.y(s.mean)]);
  clipPanel(ctx, Cp); polyline(ctx, pts, C.cyan, 2.2); ctx.restore();
  if (tt > 0) dot(ctx, Cp.x(tt), Cp.y(Math.min(s.mean, yMax)), 5, C.cyan);
  $('r0').textContent = s.hits ? t('s0readout', { t: tt.toFixed(2), hits: s.hits, imp: fmt(s.impulse), gap: sig(s.gap), tot: fmt(s.total), mean: sig(s.mean), th: sig(s.theory) })
    : t('s0readoutNone', { t: tt.toFixed(2), first: sig(L / v), th: sig(s.theory) });
}

/* ---------- step 1: many molecules, one wall ---------- */
const T1 = 40, GRID1 = 200;
// prev: the curve for the N that was in place before the latest slider change (committed on 'change',
// so dragging 20 → 300 keeps the N = 20 curve as the grey reference instead of N = 295).
const s1 = { N: 0, gas: null, prev: null, baseN: 0, baseGas: null };
function series1(gas, upTo) { const out = []; for (let i = 1; i <= GRID1; i++) { const q = T1 * i / GRID1; if (q > upTo + 1e-9) break; out.push([q, M.wallLedger(gas, 1, q).P / M.pressureTheory(gas, 1).exact]); } return out; }
function ensure1() {
  const N = num('N1');
  if (N !== s1.N) {
    s1.N = N; s1.gas = M.gas(N, 1);
    if (!s1.baseGas) { s1.baseN = N; s1.baseGas = s1.gas; }
  }
}
function commit1() {
  ensure1();
  if (s1.baseN !== s1.N) { s1.prev = { N: s1.baseN, pts: series1(s1.baseGas, T1) }; s1.baseN = s1.N; s1.baseGas = s1.gas; }
}
function draw1() {
  ensure1();
  const tt = num('t1'), gas = s1.gas, led = M.wallLedger(gas, 1, tt), th = M.pressureTheory(gas, 1).exact;
  $('N1v').textContent = String(s1.N); $('t1v').textContent = tt.toFixed(1);
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1a'), 8, 16, W - 16);
  const S = Math.min(176, W - 80), bx = (W - S) / 2, by = 28;
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.05)'; ctx.fillRect(bx, by, S, S);
  ctx.strokeStyle = C.wall; ctx.lineWidth = 2; ctx.strokeRect(bx, by, S, S);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx + S, by); ctx.lineTo(bx + S, by + S); ctx.stroke(); ctx.restore();
  const r = s1.N > 100 ? 2.2 : 3.2;
  gas.forEach(p => {
    const X = bx + M.bounce(p.x, p.vx, 1, tt) * S, Y = by + M.bounce(p.y, p.vy, 1, tt) * S;
    const hit = M.hitsBy(p.x, p.vx, 1, tt) > M.hitsBy(p.x, p.vx, 1, Math.max(0, tt - 0.35));
    if (hit) dot(ctx, bx + S - 1, Y, 4.5, C.orange); else dot(ctx, X, Y, r, C.text);
  });
  // Plotted as measured ÷ formula so runs with different N share one scale and the settling can be compared.
  const B = panel(ctx, W, { top: by + S + 46, bottom: H - 26, xMin: 0, xMax: T1, yMin: 0, yMax: 2, yTicks: [0, 0.5, 1, 1.5, 2], xTicks: true, xSteps: [5, 10, 20], title: t('c1b') });
  clipPanel(ctx, B);
  if (s1.prev) polyline(ctx, s1.prev.pts.map(([q, R]) => [B.x(q), B.y(R)]), C.raw, 1.6);
  polyline(ctx, [[B.x(0), B.y(1)], [B.x(T1), B.y(1)]], C.ghost, 1.5, [6, 5]);
  const pts = series1(gas, tt); if (tt > 0) pts.push([tt, led.P / th]);
  polyline(ctx, pts.map(([q, R]) => [B.x(q), B.y(R)]), C.cyan, 2.2);
  ctx.restore();
  if (tt > 0) dot(ctx, B.x(tt), B.y(Math.min(led.P / th, 2)), 5, C.cyan);
  const dev = th > 0 ? (led.P / th - 1) * 100 : 0;
  $('r1').textContent = t('s1readout', { N: s1.N, t: tt.toFixed(1), hits: led.hits, imp: fmt(led.impulse, 1), P: sig(led.P), th: sig(th), dev: Math.abs(dev) < 0.05 ? '0.0' : (dev > 0 ? '+' : '') + dev.toFixed(1) });
}

/* ---------- step 2: sharing v² among three directions ---------- */
const NS2 = [10, 30, 100, 300, 1000, 3000];
const s2 = { k: 0, sample: null, dots: [], beam: false };
function newSample2() { s2.k++; const N = NS2[num('N2')]; const g = M.gas(N, 1000 + s2.k); s2.sample = g; const sh = M.shares(g); if (!s2.beam) s2.dots.push({ N, x: sh.x, j: ((s2.k * 0.618) % 1) - 0.5 }); }
function draw2() {
  const N = NS2[num('N2')]; $('N2v').textContent = String(N);
  if (!s2.sample || s2.sample.length !== N) newSample2();
  const g = s2.beam ? M.beam(s2.sample) : s2.sample, sh = M.shares(g), th = M.pressureTheory(g, 1);
  $('beam2').setAttribute('aria-pressed', String(s2.beam));
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 30, bottom: 150, xMin: 0, xMax: 3, yMin: 0, yMax: 1, yTicks: [0, 1 / 3, 2 / 3, 1], yLabels: ['0', '1/3', '2/3', '1'], xTicks: false, title: t('c2a') });
  const labels = ['vₓ²', 'v_y²', 'v_z²'], cols = [C.cyan, C.orange, C.green], bw = Math.min(70, (A.P.r - A.P.l) / 3 * 0.55);
  [sh.x, sh.y, sh.z].forEach((v, i) => {
    const X = A.x(i + 0.5); ctx.fillStyle = cols[i]; ctx.globalAlpha = 0.85; ctx.fillRect(X - bw / 2, A.y(v), bw, A.y(0) - A.y(v)); ctx.globalAlpha = 1;
    ctx.save(); ctx.fillStyle = C.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(labels[i], X, A.P.b + 16); ctx.restore();
  });
  polyline(ctx, [[A.P.l, A.y(1 / 3)], [A.P.r, A.y(1 / 3)]], C.ghost, 1.5, [6, 5]);
  const lx = v => Math.log10(v);
  const B = panel(ctx, W, { top: 206, bottom: H - 26, xMin: 0.85, xMax: 3.65, yMin: 0, yMax: 0.8, yTicks: [0, 0.2, 0.4, 0.6, 0.8], xTicks: NS2.map(lx), xLabel: v => String(Math.round(Math.pow(10, v))), title: t('c2b') });
  // ±2σ band of the Beta(N/2, N) share
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.13)'; ctx.beginPath();
  const up = [], dn = [];
  for (let q = 0.85; q <= 3.65 + 1e-9; q += 0.02) { const n = Math.pow(10, q), sd = M.shareSD(n); up.push([B.x(q), B.y(Math.min(0.8, 1 / 3 + 2 * sd))]); dn.push([B.x(q), B.y(Math.max(0, 1 / 3 - 2 * sd))]); }
  up.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); dn.reverse().forEach(([X, Y]) => ctx.lineTo(X, Y)); ctx.closePath(); ctx.fill(); ctx.restore();
  polyline(ctx, [[B.P.l, B.y(1 / 3)], [B.P.r, B.y(1 / 3)]], C.ghost, 1.5, [6, 5]);
  const last = s2.dots[s2.dots.length - 1];
  s2.dots.forEach(d => { const X = B.x(lx(d.N)) + d.j * 14; dot(ctx, X, B.y(Math.min(0.8, d.x)), d === last && !s2.beam ? 5 : 3, d === last && !s2.beam ? C.cyan : 'rgba(232,237,244,0.75)'); });
  let inside = 0; s2.dots.forEach(d => { if (Math.abs(d.x - 1 / 3) <= 2 * M.shareSD(d.N)) inside++; });
  $('r2').textContent = s2.beam ? t('s2beam') : t('s2readout', { N, k: s2.k, sx: sh.x.toFixed(3), sy: sh.y.toFixed(3), sz: sh.z.toFixed(3), ratio: (th.exact / th.iso).toFixed(3), n: s2.dots.length, inside });
}

/* ---------- step 3: temperature and real molecular speeds ---------- */
const s3 = { gas: 'N2' };
function buildGasButtons() {
  const box = $('gasBtns');
  M.GASES.forEach(g => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.id = 'gas' + g.id; b.dataset.step = '3';
    b.addEventListener('click', () => { s3.gas = g.id; draw3(); }); box.appendChild(b);
  });
}
function draw3() {
  const T = num('T3'); $('T3v').textContent = String(T);
  M.GASES.forEach(g => { const b = $('gas' + g.id); b.textContent = t('gas' + g.id); b.setAttribute('aria-pressed', String(g.id === s3.gas)); });
  $('lg3').innerHTML = M.GASES.map(g => `<span class="lg"><span class="sw" style="background:${GCOL[g.id]}"></span><span>${t('gas' + g.id)}</span></span>`).join('');
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 30, bottom: 214, left: 46, xMin: 0, xMax: 1550, yMin: 0, yMax: 3300, yTicks: [0, 1000, 2000, 3000], xTicks: [0, 500, 1000, 1500], title: t('c3a') });
  M.GASES.forEach(g => {
    const pts = []; for (let q = 0; q <= 1550; q += 10) pts.push([A.x(q), A.y(M.realGas(g.id, Math.max(q, 1e-9)).vrms)]);
    polyline(ctx, pts, GCOL[g.id], g.id === s3.gas ? 3 : 1.4);
  });
  ctx.save(); ctx.strokeStyle = C.text; ctx.globalAlpha = 0.4; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(A.x(T), A.P.t); ctx.lineTo(A.x(T), A.P.b); ctx.stroke(); ctx.restore();
  M.GASES.forEach(g => { if (g.id !== s3.gas) dot(ctx, A.x(T), A.y(M.realGas(g.id, T).vrms), 3, GCOL[g.id]); });
  const sel = M.realGas(s3.gas, T); dot(ctx, A.x(T), A.y(sel.vrms), 6.5, GCOL[s3.gas], C.text);
  const B = panel(ctx, W, { top: 258, bottom: H - 26, left: 46, xMin: 0, xMax: 5, yMin: 0, yMax: 210, yTicks: [0, 100, 200], xTicks: false, title: t('c3b') });
  const bw = Math.min(46, (B.P.r - B.P.l) / 5 * 0.6), sym = { He: 'He', Ne: 'Ne', N2: 'N₂', CO2: 'CO₂', Xe: 'Xe' };
  M.GASES.forEach((g, i) => {
    const r = M.realGas(g.id, T), X = B.x(i + 0.5);
    ctx.fillStyle = GCOL[g.id]; ctx.globalAlpha = g.id === s3.gas ? 1 : 0.55; ctx.fillRect(X - bw / 2, B.y(r.keMeV), bw, B.y(0) - B.y(r.keMeV)); ctx.globalAlpha = 1;
    ctx.save(); ctx.fillStyle = C.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(sym[g.id], X, B.P.b + 16); ctx.restore();
  });
  $('r3').textContent = t('s3readout', { gas: t('gas' + s3.gas), u: sel.u, T, vrms: sel.vrms.toFixed(0), ke: (sel.ke * 1e21).toFixed(2), mev: sel.keMeV.toFixed(1) });
}

/* ---------- step 4: the piston (isothermal compression) ---------- */
const T4 = 40, N4 = 120;
const base4 = M.gas(N4, 2);
const gas4 = { 1: base4, 2: base4.map(p => ({ ...p, vx: p.vx * Math.SQRT2, vy: p.vy * Math.SQRT2, vz: p.vz * Math.SQRT2 })) };
const s4 = { tf: 1, pts: [], run: null, done: null };
function draw4() {
  const L = num('L4'), tf = s4.tf, gas = gas4[tf], th = M.pressureTheory(gas, L).exact;
  $('L4v').textContent = L.toFixed(1);
  $('tf1').setAttribute('aria-pressed', String(tf === 1)); $('tf2').setAttribute('aria-pressed', String(tf === 2));
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4a'), 8, 16, W - 16);
  const unit = Math.min(110, (W - 76) / 2), bx = 40, by = 28, tt = s4.run ? s4.run.t : 0;
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,0.05)'; ctx.fillRect(bx, by, L * unit, unit);
  ctx.strokeStyle = C.wall; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + L * unit, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + unit); ctx.lineTo(bx + L * unit, by + unit); ctx.stroke();
  ctx.fillStyle = tf === 1 ? C.cyan : C.orange; ctx.fillRect(bx + L * unit, by - 4, 6, unit + 8);
  ctx.fillRect(bx + L * unit + 6, by + unit / 2 - 2, 34, 4); ctx.restore();
  gas.forEach(p => dot(ctx, bx + M.bounce(p.x * L, p.vx, L, tt) * unit, by + M.bounce(p.y, p.vy, 1, tt) * unit, 2.2, C.text));
  const B = panel(ctx, W, { top: by + unit + 50, bottom: H - 26, left: 46, xMin: 0, xMax: 2.1, yMin: 0, yMax: 650, yTicks: [0, 200, 400, 600], xTicks: [0, 0.5, 1, 1.5, 2], title: t('c4b') });
  clipPanel(ctx, B);
  [1, 2].forEach(f => {
    const S = M.sums(gas4[f]).sx, pts = []; for (let V = 0.3; V <= 2.1 + 1e-9; V += 0.01) pts.push([B.x(V), B.y(S / V)]);
    polyline(ctx, pts, f === 1 ? C.cyan : C.orange, f === tf ? 2.4 : 1.2);
  });
  ctx.restore();
  s4.pts.forEach(q => dot(ctx, B.x(q.V), B.y(q.P), 5, q.tf === 1 ? C.cyan : C.orange, C.bg));
  if (s4.run && s4.run.t > 0) dot(ctx, B.x(L), B.y(Math.min(650, M.wallLedger(gas, L, s4.run.t).P)), 5.5, C.text);
  let status;
  if (s4.run) status = t('s4running', { t: s4.run.t.toFixed(1), P: sig(M.wallLedger(gas, L, Math.max(s4.run.t, 1e-9)).P) });
  else if (s4.done && s4.done.V === L && s4.done.tf === tf) status = t('s4status', { P: sig(s4.done.P), PVm: sig(s4.done.P * L) });
  else status = t('s4idle');
  $('r4').textContent = t('s4readout', { V: L.toFixed(1), tf, status, th: sig(th), pv: sig(th * L), n: s4.pts.length });
}
function measure4() {
  const L = num('L4'), tf = s4.tf, gas = gas4[tf];
  s4.run = { t: 0 }; s4.done = null; $('measure4').disabled = true;
  animate('s4', 2600, p => { s4.run.t = p * T4; draw4(); }, () => {
    const P = M.wallLedger(gas, L, T4).P; s4.pts.push({ V: L, P, tf }); s4.done = { V: L, tf, P }; s4.run = null; $('measure4').disabled = false; draw4();
  });
}

/* ---------- step 5: collisions grow the Maxwell distribution ---------- */
const R5 = M.RELAX;
const floor5 = (() => { const g = M.gas(R5.N, 11); return M.tvDistance(M.histogram(g.map(p => Math.hypot(p.vx, p.vy, p.vz)))); })();
const s5 = { st: null, tv: [] };
function reset5() { s5.st = M.relaxStart(R5.N, R5.seed); s5.tv = [M.tvDistance(M.histogram(M.speedsOf(s5.st)))]; }
function step5() { M.relaxRound(s5.st); s5.tv.push(M.tvDistance(M.histogram(M.speedsOf(s5.st)))); }
function draw5() {
  const sp = M.speedsOf(s5.st), hist = M.histogram(sp), k = s5.st.rounds;
  $('one5').disabled = k >= R5.rounds;
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 30, bottom: 236, xMin: 0, xMax: 4.5, yMin: 0, yMax: 0.8, yTicks: [0, 0.2, 0.4, 0.6, 0.8], xTicks: [0, 1, 2, 3, 4], title: t('c5a') });
  const w = M.HIST.vMax / M.HIST.bins;
  hist.forEach((d, i) => {
    if (!d) return; const X0 = A.x(i * w) + 0.5, X1 = A.x((i + 1) * w) - 0.5, top = Math.min(d, 0.8);
    ctx.fillStyle = 'rgba(103,215,249,0.55)'; ctx.fillRect(X0, A.y(top), X1 - X0, A.y(0) - A.y(top));
    if (d > 0.8) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo((X0 + X1) / 2, A.P.t - 2); ctx.lineTo(X0 - 3, A.P.t + 8); ctx.lineTo(X1 + 3, A.P.t + 8); ctx.closePath(); ctx.fill(); }
  });
  const mp = []; for (let v = 0; v <= 4.5; v += 0.02) mp.push([A.x(v), A.y(M.maxwell(v))]); polyline(ctx, mp, C.orange, 2.4);
  const B = panel(ctx, W, { top: 282, bottom: H - 26, xMin: -0.4, xMax: 12.4, yMin: 0, yMax: 1, yTicks: [0, 0.5, 1], xTicks: [0, 2, 4, 6, 8, 10, 12], title: t('c5b') });
  polyline(ctx, [[B.x(-0.4), B.y(floor5)], [B.x(12.4), B.y(floor5)]], C.ghost, 1.5, [6, 5]);
  polyline(ctx, s5.tv.map((v, i) => [B.x(i), B.y(v)]), C.text, 1.6);
  s5.tv.forEach((v, i) => dot(ctx, B.x(i), B.y(v), i === k ? 5.5 : 3.5, i === k ? C.cyan : C.text));
  const frac = sp.filter(s => s > 2 * Math.SQRT2).length / sp.length, n2 = M.realGas('N2', 300);
  $('r5').textContent = t('s5readout', { k, tv: s5.tv[k].toFixed(3), floor: floor5.toFixed(3), e: M.energyOf(s5.st).toFixed(3), frac: pct(frac), th: pct(M.tail(2 * Math.SQRT2)), sig: n2.sigma.toFixed(0), vmp: n2.vmp.toFixed(0), vbar: n2.vmean.toFixed(0), vrms: n2.vrms.toFixed(0) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['v0', 'L0'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s0'); draw0(); }));
  $('t0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('play0').addEventListener('click', () => animate('s0', 6000, p => { $('t0').value = (p * T0).toFixed(2); draw0(); }));

  $('N1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('N1').addEventListener('change', () => { commit1(); draw1(); });
  $('t1').addEventListener('input', () => { stopAnim('s1'); draw1(); });
  $('play1').addEventListener('click', () => { commit1(); animate('s1', 8000, p => { $('t1').value = (p * T1).toFixed(1); draw1(); }); });

  $('N2').addEventListener('input', () => { newSample2(); draw2(); });
  $('resample2').addEventListener('click', () => { newSample2(); draw2(); });
  $('burst2').addEventListener('click', () => { for (let i = 0; i < 20; i++) newSample2(); draw2(); });
  $('beam2').addEventListener('click', () => { s2.beam = !s2.beam; draw2(); });
  $('clear2').addEventListener('click', () => { s2.dots = []; draw2(); });

  buildGasButtons();
  $('T3').addEventListener('input', draw3);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'b';
    const fb = $('quizFeedback'); fb.textContent = t(ok ? 'correct' : 'wrong'); fb.style.color = ok ? C.green : C.orange; fb.dataset.state = ok ? 'correct' : 'wrong';
  });

  $('L4').addEventListener('input', () => { if (s4.run) { stopAnim('s4'); s4.run = null; $('measure4').disabled = false; } draw4(); });
  $('tf1').addEventListener('click', () => { if (s4.run) return; s4.tf = 1; draw4(); });
  $('tf2').addEventListener('click', () => { if (s4.run) return; s4.tf = 2; draw4(); });
  $('measure4').addEventListener('click', measure4);
  $('clear4').addEventListener('click', () => { stopAnim('s4'); s4.run = null; s4.pts = []; s4.done = null; $('measure4').disabled = false; draw4(); });

  reset5();
  $('play5').addEventListener('click', () => {
    if (s5.st.rounds >= R5.rounds) reset5();
    const start = s5.st.rounds, todo = R5.rounds - start;
    animate('s5', todo * 450, p => { const target = start + Math.min(todo, Math.floor(p * todo + 1e-9)); while (s5.st.rounds < target) step5(); draw5(); });
  });
  $('one5').addEventListener('click', () => { stopAnim('s5'); if (s5.st.rounds < R5.rounds) step5(); draw5(); });
  $('reset5').addEventListener('click', () => { stopAnim('s5'); reset5(); draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshKinetic = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
