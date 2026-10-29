/* ohms-law: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const BULB = { R0: 4, gamma: 0.05 }, FIXR = 6;
const current = (V, R) => V / R;
/* Filament bulb: resistance grows with the electrical power heating it, R = R0(1 + gamma*P), P = V*I. Solving V = I*R0*(1 + gamma*V*I) for I. */
function bulbI(V) { if (V <= 0) return 0; const a = BULB.gamma * BULB.R0 * V; return (-BULB.R0 + Math.sqrt(BULB.R0 * BULB.R0 + 4 * a * V)) / (2 * a); }
const power = (V, I) => V * I;
/* Battery with internal resistance r driving a load R. */
function loadState(E, r, R) { const I = E / (R + r), V = I * R; return { I, V, P: V * I, Pin: E * I, eta: R / (R + r), Ploss: I * I * r }; }
const f2 = v => String(Math.round(v * 100) / 100), f3 = v => String(Math.round(v * 1000) / 1000);
const CAND = [3, 5, 8, 12, 20], HIDDEN = [8, 20, 5, 12, 3];
const S = { V0: 6, rec: [], V1: 6, R1: 10, V2: 6, mode3: 'V', R3: 10, r4: 1, R4: 3, V5: 6, rec5: [], idx5: 0, pick5: -1, checked5: false, ph: [0, 0], paused: false, raf: 0, last: 0 };
const IVR = { x: 0, y: 0, w: 0, h: 0 };
function axes(ctx, R, xm, ym, xl, yl, xt, yt) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); const X = v => R.x + v / xm * R.w, Y = v => R.y + R.h - v / ym * R.h;
  xt.forEach(v => { line(ctx, X(v), R.y, X(v), R.y + R.h, COL.grid, 1); text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 }); }); yt.forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, String(v), R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); });
  text(ctx, xl, R.x + R.w, R.y + R.h + 27, { align: 'right', size: 11 }); text(ctx, yl, R.x, R.y - 5, { size: 11 }); return { X, Y }; }
function curve(ctx, M, fn, x0, x1, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw || 2.5; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = x0 + (x1 - x0) * i / 120, y = fn(x); i ? ctx.lineTo(M.X(x), M.Y(y)) : ctx.moveTo(M.X(x), M.Y(y)); } ctx.stroke(); }
/* Circuit loop with battery (left), resistor (top), ammeter (right). Dots move at a speed proportional to I (teaching speed, not electron speed). */
function loop(ctx, B, o) { const L = B.x + 14, Rr = B.x + B.w - 14, T = B.y + 36, Bt = B.y + B.h - 22, col = o.I > 0 ? COL.cyan : COL.muted, mx = (L + Rr) / 2, my = (T + Bt) / 2;
  const pts = [[L, my + 22], [L, Bt], [Rr, Bt], [Rr, my + 18], [Rr, my - 18], [Rr, T], [L, T], [L, my - 22]]; for (let i = 0; i < pts.length - 1; i++) { if (i === 3) continue; line(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], col, 3); }
  line(ctx, L - 14, my - 22, L + 14, my - 22, COL.ink, 3); line(ctx, L - 8, my - 12, L + 8, my - 12, COL.ink, 5); line(ctx, L - 14, my - 1, L + 14, my - 1, COL.ink, 3); line(ctx, L - 8, my + 9, L + 8, my + 9, COL.ink, 5); text(ctx, o.vLabel, L + 18, my + 4, { size: 12, color: COL.orange, bold: true });
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); const zw = Math.min(110, (Rr - L) * 0.45), x0 = mx - zw / 2; ctx.moveTo(L, T); ctx.lineTo(x0, T); for (let k = 0; k < 6; k++) ctx.lineTo(x0 + zw * (k + 0.5) / 6, T + (k % 2 ? 9 : -9)); ctx.lineTo(x0 + zw, T); ctx.lineTo(Rr, T); ctx.stroke(); text(ctx, o.rLabel, mx, T - 16, { align: 'center', size: 12, color: COL.violet, bold: true });
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(Rr, my, 18, 0, 6.2832); ctx.stroke(); text(ctx, 'A', Rr, my + 5, { align: 'center', size: 14, color: COL.ink, bold: true }); text(ctx, o.iLabel, Rr - 24, my + 4, { align: 'right', size: 12, color: COL.green, bold: true });
  if (o.I > 0) { const path = [[L, my - 22], [L, T], [Rr, T], [Rr, my - 18], [Rr, my + 18], [Rr, Bt], [L, Bt], [L, my + 22]], seg = [], tot = path.slice(1).reduce((s, p, i) => { const l = Math.hypot(p[0] - path[i][0], p[1] - path[i][1]); seg.push(l); return s + l; }, 0), n = 26;
    for (let k = 0; k < n; k++) { let d = ((k / n + o.phase) % 1) * tot, i = 0; while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; } const a = path[i], b = path[i + 1], f = d / seg[i]; dot(ctx, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 3.4, COL.orange); } } }
function split(w, h, wide) { return wide ? { A: { x: 0, y: 0, w: w * 0.44, h }, B: { x: w * 0.46, y: 0, w: w * 0.54, h } } : { A: { x: 0, y: 0, w, h: h * 0.46 }, B: { x: 0, y: h * 0.48, w, h: h * 0.52 } }; }
const gr = B => ({ x: B.x + 38, y: B.y + 18, w: B.w - 54, h: B.h - 56 });
function render0() { const { ctx, w, h, wide } = setup($('cv0')), { A, B } = split(w, h, wide), V = S.V0, I = current(V, 10); loop(ctx, A, { I, phase: S.ph[0], vLabel: V + ' V', rLabel: '10 Ω', iLabel: f2(I) + ' A' });
  const M = axes(ctx, gr(B), 12, 1.2, t('voltAxis'), t('currAxis'), [0, 4, 8, 12], [0, 0.4, 0.8, 1.2]); if (S.rec.length > 1) { const rs = S.rec.slice().sort((a, b) => a[0] - b[0]); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath(); rs.forEach((p, k) => k ? ctx.lineTo(M.X(p[0]), M.Y(p[1])) : ctx.moveTo(M.X(p[0]), M.Y(p[1]))); ctx.stroke(); }
  S.rec.forEach(p => dot(ctx, M.X(p[0]), M.Y(p[1]), 4.5, COL.cyan)); dot(ctx, M.X(V), M.Y(I), 6, COL.orange); $('V0v').textContent = V; $('pause0').textContent = t(S.paused ? 'resume' : 'pause'); $('ro0').textContent = t('s0ro', { V, R: 10, I: f2(I), n: S.rec.length, ratio: I > 0 ? f2(V / I) : '—' }); }
function render1() { const { ctx, w, h, wide } = setup($('cv1')), { A, B } = split(w, h, wide), V = 6, R = S.R1, I = current(V, R); loop(ctx, A, { I, phase: S.ph[1], vLabel: V + ' V', rLabel: R + ' Ω', iLabel: f2(I) + ' A' });
  const M = axes(ctx, gr(B), 30, 3, t('resAxis'), t('currAxis'), [0, 10, 20, 30], [0, 1, 2, 3]); curve(ctx, M, r => V / r, 2, 30, COL.cyan); dot(ctx, M.X(R), M.Y(I), 6, COL.orange); $('R1v').textContent = R; $('pause1').textContent = t(S.paused ? 'resume' : 'pause');
  $('ro1').textContent = t('s1ro', { V, R, I: f2(I), half: f2(V / (2 * R)), prod: f2(I * R) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), V = S.V2, Ib = bulbI(V), Ir = current(V, FIXR), R = { x: 40, y: 20, w: w - 56, h: h - 60 }, M = axes(ctx, R, 12, 3, t('voltAxis'), t('currAxis'), [0, 4, 8, 12], [0, 1, 2, 3]);
  curve(ctx, M, v => current(v, FIXR), 0, 12, COL.cyan); curve(ctx, M, bulbI, 0, 12, COL.orange); dot(ctx, M.X(V), M.Y(Ir), 6, COL.cyan); dot(ctx, M.X(V), M.Y(Ib), 6, COL.orange); text(ctx, t('legRes', { R: FIXR }), R.x + 8, R.y + 14, { size: 12, color: COL.cyan }); text(ctx, t('legBulb'), R.x + 8, R.y + 30, { size: 12, color: COL.orange }); $('V2v').textContent = V;
  $('ro2').textContent = t('s2ro', { V, Ir: f2(Ir), Rr: FIXR, Ib: f2(Ib), Rb: Ib > 0 ? f2(V / Ib) : f2(BULB.R0), R0: BULB.R0 }); }
function render3() { const { ctx, w, h } = setup($('cv3')), R = S.R3, byV = S.mode3 === 'V', V = byV ? 6 : 0.6 * R, I = byV ? 6 / R : 0.6, P = power(V, I), rect = { x: 44, y: 22, w: w - 60, h: h - 62 }, M = axes(ctx, rect, 30, 20, t('resAxis'), t('powAxis'), [0, 10, 20, 30], [0, 5, 10, 15, 20]);
  curve(ctx, M, r => byV ? 36 / r : 0.36 * r, byV ? 1.8 : 0, 30, byV ? COL.cyan : COL.violet); dot(ctx, M.X(R), M.Y(P), 6, COL.orange); ctx.fillStyle = 'rgba(246,164,91,0.25)'; ctx.fillRect(M.X(R) - 10, M.Y(P), 20, M.Y(0) - M.Y(P));
  $('m3V').classList.toggle('active', byV); $('m3I').classList.toggle('active', !byV); $('R3v').textContent = R; $('ro3').textContent = t('s3ro', { mode: t(byV ? 'holdV' : 'holdI'), R, V: f2(V), I: f2(I), P: f2(P), P2: f2(I * I * R), P3: f2(V * V / R) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), E = 6, r = S.r4, R = S.R4, s = loadState(E, r, R), rect = { x: 44, y: 22, w: w - 60, h: h - 62 }, pm = E * E / (4 * 0.5), M = axes(ctx, rect, 10, 18, t('loadAxis'), t('powAxis'), [0, 2, 4, 6, 8, 10], [0, 6, 12, 18]);
  curve(ctx, M, x => loadState(E, r, x).P, 0.05, 10, COL.cyan); const peak = E * E / (4 * r); line(ctx, M.X(r), M.Y(0), M.X(r), M.Y(peak), COL.green, 1.5, [4, 3]); dot(ctx, M.X(r), M.Y(peak), 5, COL.green); text(ctx, t('peakLabel', { r, p: f2(peak) }), M.X(r) + 8, M.Y(peak) - 6, { size: 11, color: COL.green }); dot(ctx, M.X(R), M.Y(s.P), 6, COL.orange);
  [0.5, 1, 2].forEach(v => $('r4_' + String(v).replace('.', '')).classList.toggle('active', v === r)); $('R4v').textContent = R;
  $('ro4').textContent = t('s4ro', { r, R, I: f2(s.I), V: f2(s.V), P: f2(s.P), loss: f2(s.Ploss), eta: Math.round(s.eta * 100) }); }
function render5() { const { ctx, w, h, wide } = setup($('cv5')), { A, B } = split(w, h, wide), V = S.V5, Rh = HIDDEN[S.idx5 % HIDDEN.length], I = current(V, Rh); loop(ctx, A, { I, phase: 0, vLabel: V + ' V', rLabel: '? Ω', iLabel: f3(I) + ' A' });
  const M = axes(ctx, gr(B), 12, 4, t('voltAxis'), t('currAxis'), [0, 4, 8, 12], [0, 1, 2, 3, 4]); S.rec5.forEach(p => dot(ctx, M.X(p[0]), M.Y(p[1]), 4.5, COL.cyan)); dot(ctx, M.X(V), M.Y(I), 6, COL.orange); $('V5v').textContent = V;
  CAND.forEach((c, i) => { const b = $('c5_' + i); b.textContent = c + ' Ω'; b.classList.toggle('active', S.pick5 === i); }); const ok = S.pick5 >= 0 && CAND[S.pick5] === Rh;
  $('ro5').textContent = !S.checked5 || S.pick5 < 0 ? t('s5ro', { V, I: f3(I), n: S.rec5.length }) : ok ? t('s5roOk', { V, I: f3(I), R: Rh }) : t('s5roNo', { V, I: f3(I), R: Rh, guess: CAND[S.pick5] }); }
function stopAnim() { cancelAnimationFrame(S.raf); S.raf = 0; }
function onHide() { stopAnim(); }
function wire() {
  slider('V0', v => { S.V0 = v; render0(); }); slider('R1', v => { S.R1 = v; render1(); }); slider('V2', v => { S.V2 = v; render2(); }); slider('R3', v => { S.R3 = v; render3(); }); slider('R4', v => { S.R4 = v; render4(); }); slider('V5', v => { S.V5 = v; render5(); });
  $('rec0').addEventListener('click', () => { if (!S.rec.some(p => p[0] === S.V0)) S.rec.push([S.V0, current(S.V0, 10)]); render0(); }); $('clr0').addEventListener('click', () => { S.rec = []; render0(); });
  $('pause0').addEventListener('click', () => { S.paused = !S.paused; renderAll(); }); $('pause1').addEventListener('click', () => { S.paused = !S.paused; renderAll(); });
  $('m3V').addEventListener('click', () => { S.mode3 = 'V'; render3(); }); $('m3I').addEventListener('click', () => { S.mode3 = 'I'; render3(); });
  [0.5, 1, 2].forEach(v => $('r4_' + String(v).replace('.', '')).addEventListener('click', () => { S.r4 = v; render4(); }));
  $('rec5').addEventListener('click', () => { const Rh = HIDDEN[S.idx5 % HIDDEN.length]; if (!S.rec5.some(p => p[0] === S.V5)) S.rec5.push([S.V5, current(S.V5, Rh)]); render5(); }); $('clr5').addEventListener('click', () => { S.rec5 = []; S.pick5 = -1; S.checked5 = false; render5(); });
  CAND.forEach((c, i) => $('c5_' + i).addEventListener('click', () => { S.pick5 = i; S.checked5 = false; render5(); })); $('chk5').addEventListener('click', () => { S.checked5 = true; render5(); }); $('nx5').addEventListener('click', () => { S.idx5++; S.rec5 = []; S.pick5 = -1; S.checked5 = false; render5(); });
  startFlow();
}
/* Flow animation: redraw only the two flow canvases, at most 30 fps, and not while paused, hidden or reduced motion. */
function startFlow() { if (reduceMotion()) return; let last = 0; const tick = now => { S.raf = requestAnimationFrame(tick); if (S.paused || document.hidden || now - last < 33) return; const dt = (now - last) / 1000; last = now; const d = Math.min(dt, 0.1) * 0.25; S.ph[0] = (S.ph[0] + d * current(S.V0, 10)) % 1; S.ph[1] = (S.ph[1] + d * current(6, S.R1)) % 1; render0(); render1(); }; S.raf = requestAnimationFrame(tick); }
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!document.hidden && !S.raf && typeof startFlow === 'function' && typeof $ === 'function' && document.getElementById('ro0')) startFlow(); });

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
if (typeof module !== 'undefined') module.exports = { current, bulbI, power, loadState, BULB, FIXR, CAND, HIDDEN };
