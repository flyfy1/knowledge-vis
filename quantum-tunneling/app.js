/* quantum-tunneling: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const K0 = 5.1232;           /* sqrt(2 m_e * 1 eV)/hbar in 1/nm */
const MP = 1836.15, KDL = Math.SQRT2; /* KDL: wave-number scale in dimensionless units hbar = m = 1 */          /* proton/electron mass ratio */
/* tiny complex helpers: [re, im] */
const cm = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], ca = (a, b) => [a[0] + b[0], a[1] + b[1]], cs = (a, b) => [a[0] - b[0], a[1] - b[1]], cx = (p, q) => { const e = Math.exp(p); return [e * Math.cos(q), e * Math.sin(q)]; };
const cd = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }, c2 = a => a[0] * a[0] + a[1] * a[1];
/* Stationary scattering from a rectangular barrier (height v0 eV, width a nm) of an electron-mass wave of energy e eV, incident amplitude 1. Returns the transmission amplitude t, reflection r and inside amplitudes A,B. */
function scatter(e, v0, a, mr) { const m = mr || 1, E = Math.abs(e - v0) < 1e-6 ? v0 - 1e-6 : e, k = K0 * Math.sqrt(m * E), p = E < v0 ? [0, K0 * Math.sqrt(m * (v0 - E))] : [K0 * Math.sqrt(m * (E - v0)), 0];
  const pk = cd([k, 0], p), kp = cd(p, [k, 0]), one = [1, 0], eMinus = cx(p[1] * a, -p[0] * a), ePlus = cx(-p[1] * a, p[0] * a), eik = cx(0, k * a);
  const term1 = cm(eMinus, cm(ca(one, pk), ca(one, kp))), term2 = cm(ePlus, cm(cs(one, pk), cs(one, kp))), den = cm(eik, [(term1[0] + term2[0]) / 2, (term1[1] + term2[1]) / 2]), t = cd([2, 0], den);
  const Ac = cm(cm(t, eik), cm(eMinus, [ (1 + pk[0]) / 2, pk[1] / 2 ])), Bc = cm(cm(t, eik), cm(ePlus, [(1 - pk[0]) / 2, -pk[1] / 2])); const r = cs(ca(Ac, Bc), one);
  return { t, r, A: Ac, B: Bc, k, p, T: c2(t), R: c2(r) }; }
/* Closed-form transmission for comparison (no complex numbers). mr = mass in electron masses. */
function transT(e, v0, a, mr, kk) { const m = mr || 1, K = kk || K0; if (e < v0) { const kap = K * Math.sqrt(m * (v0 - e)), s = Math.sinh(kap * a); return 1 / (1 + v0 * v0 * s * s / (4 * e * (v0 - e))); } if (e === v0) return 1 / (1 + m * K * K * v0 * a * a / 4); const q = K * Math.sqrt(m * (e - v0)), s = Math.sin(q * a); return 1 / (1 + v0 * v0 * s * s / (4 * e * (e - v0))); }
/* log10 of transmission without overflow, for any mass ratio (tall, thick barrier uses the asymptotic form). */
function log10T(e, v0, a, mr) { const kap = K0 * Math.sqrt(mr * (v0 - e)), x = kap * a; if (x < 20) return Math.log10(transT(e, v0, a, mr)); return (-2 * x - Math.log(v0 * v0 / (16 * e * (v0 - e)))) / Math.LN10; }
const psiAt = (s, x, a) => { if (x < 0) return ca(cx(0, s.k * x), cm(s.r, cx(0, -s.k * x))); if (x <= a) return ca(cm(s.A, cx(-s.p[1] * x, s.p[0] * x)), cm(s.B, cx(s.p[1] * x, -s.p[0] * x))); return cm(s.t, cx(0, s.k * x)); };
/* Time-dependent 1D Schrodinger equation, hbar = m = 1, leapfrog scheme on a grid. */
const NG = 360, DX = 0.2, XL = -36, DT = 0.02;
function makeSim(k0, w, v0) { const V = new Float64Array(NG); for (let i = 0; i < NG; i++) { const x = XL + i * DX; V[i] = x >= 0 && x <= w ? v0 : 0; } const R = new Float64Array(NG), I = new Float64Array(NG), sig = 3, x0 = -12; let nrm = 0; for (let i = 0; i < NG; i++) { const x = XL + i * DX, g = Math.exp(-(x - x0) * (x - x0) / (4 * sig * sig)); R[i] = g * Math.cos(k0 * x); I[i] = g * Math.sin(k0 * x); nrm += g * g * DX; } const sc = 1 / Math.sqrt(nrm); for (let i = 0; i < NG; i++) { R[i] *= sc; I[i] *= sc; }
  const H = (f, o, i) => -0.5 * (f[i + 1] - 2 * f[i] + f[i - 1]) / (DX * DX) + V[i] * f[i];
  /* shift I by half a step: I(dt/2) = I(0) - dt/2 H R(0) */ const tmp = new Float64Array(NG); for (let i = 1; i < NG - 1; i++) tmp[i] = H(R, 0, i); for (let i = 1; i < NG - 1; i++) I[i] -= DT / 2 * tmp[i];
  return { R, I, V, t: 0, w, v0, k0, step(n) { for (let s = 0; s < n; s++) { for (let i = 1; i < NG - 1; i++) tmp[i] = H(I, 0, i); for (let i = 1; i < NG - 1; i++) R[i] += DT * tmp[i]; for (let i = 1; i < NG - 1; i++) tmp[i] = H(R, 0, i); for (let i = 1; i < NG - 1; i++) I[i] -= DT * tmp[i]; this.t += DT; } },
    dens(i) { return R[i] * R[i] + I[i] * I[i]; },
    parts() { let L = 0, B = 0, Rr = 0; for (let i = 0; i < NG; i++) { const x = XL + i * DX, d = (R[i] * R[i] + I[i] * I[i]) * DX; if (x < 0) L += d; else if (x <= w) B += d; else Rr += d; } return { L, B, R: Rr, tot: L + B + Rr }; } }; }
const STM = { atoms: 10, dx: 0.4, amp: 0.1, adatom: 2.0, ah: 0.14 };
const surf = x => { let h = 0; for (let i = 0; i < STM.atoms; i++) { const c = 0.2 + i * STM.dx; h = Math.max(h, STM.amp * Math.exp(-Math.pow((x - c) / 0.11, 2))); } return Math.max(h, STM.ah * Math.exp(-Math.pow((x - STM.adatom) / 0.11, 2)) + STM.amp * 0.0); };
const stmI = (x, gap, phi) => Math.exp(-2 * K0 * Math.sqrt(phi) * (gap - surf(x)));
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100), f3 = v => String(Math.round(v * 1000) / 1000), sci = v => v === 0 ? '0' : v < 1e-3 ? v.toExponential(1).replace('e-', '×10⁻').replace('+', '') : f3(v);
const S = { e0: 0.5, a0: 0.8, e1: 0.5, a1: 0.8, e2: 0.5, a2: 0.6, k3: 1.4, w3: 1.5, sim: null, run3: false, raf3: 0, gap4: 0.6, phi4: 4.5, scan4: 1, raf4: 0, a5: 1, de5: 1 };
const V0 = 1;
function axes(ctx, R, xt, yt, xl, yl, X, Y) { ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h); xt.forEach(v => { text(ctx, String(v), X(v), R.y + R.h + 13, { align: 'center', size: 10 }); }); yt.forEach(([v, lab]) => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, lab, R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); }); if (xl) text(ctx, xl, R.x + R.w, R.y + R.h + 27, { align: 'right', size: 11 }); if (yl) text(ctx, yl, R.x, R.y - 5, { size: 11 }); }
function render0() { const { ctx, w, h } = setup($('cv0')), e = S.e0, a = S.a0, s = scatter(e, V0, a), R = { x: 40, y: 22, w: w - 56, h: h - 62 }, xmin = -4, xmax = a + 4, X = x => R.x + (x - xmin) / (xmax - xmin) * R.w, Y = v => R.y + R.h - v / 4 * R.h;
  axes(ctx, R, [-4, -2, 0, 2, 4, 6].filter(v => v <= xmax), [[0, '0'], [1, '1'], [2, '2'], [4, '4']], t('xAxisNm'), t('densLab'), X, Y); ctx.fillStyle = 'rgba(246,164,91,0.18)'; ctx.fillRect(X(0), R.y, X(a) - X(0), R.h); ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.5; ctx.strokeRect(X(0), R.y, X(a) - X(0), R.h); text(ctx, t('barrierLab', { v: V0, a }), X(a / 2), R.y + 14, { align: 'center', size: 11, color: COL.orange });
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 400; i++) { const x = xmin + (xmax - xmin) * i / 400, p = psiAt(s, x, a), d = Math.min(4, c2(p)); i ? ctx.lineTo(X(x), Y(d)) : ctx.moveTo(X(x), Y(d)); } ctx.stroke(); line(ctx, X(xmax) - 100, Y(s.T), X(xmax), Y(s.T), COL.green, 1, [4, 3]);
  text(ctx, t('legRight', { T: sci(s.T) }), R.x + R.w - 6, R.y + 14, { align: 'right', size: 11, color: COL.green }); text(ctx, t('classical'), R.x + 6, R.y + 14, { size: 11, color: COL.red }); $('e0v').textContent = e; $('a0v').textContent = a;
  $('ro0').textContent = t('s0ro', { e, v: V0, a, T: sci(s.T), R: f3(s.R), sum: f3(s.T + s.R), kap: f2(K0 * Math.sqrt(V0 - e)) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), e = S.e1, R = { x: 52, y: 20, w: w - 70, h: h - 60 }, amax = 2, lmin = -10, X = a => R.x + a / amax * R.w, Y = lg => R.y + R.h - (lg - lmin) / (0 - lmin) * R.h; axes(ctx, R, [0, 0.5, 1, 1.5, 2], [[0, '1'], [-2, '10⁻²'], [-4, '10⁻⁴'], [-6, '10⁻⁶'], [-8, '10⁻⁸'], [-10, '10⁻¹⁰']], t('widthAxis'), t('TAxis'), X, Y);
  ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 160; i++) { const a = amax * i / 160, lg = Math.log10(transT(e, V0, a)); i ? ctx.lineTo(X(a), Y(lg)) : ctx.moveTo(X(a), Y(lg)); } ctx.stroke(); ctx.restore();
  const a = S.a1, T = transT(e, V0, a), kap = K0 * Math.sqrt(V0 - e); line(ctx, X(a), R.y, X(a), R.y + R.h, COL.orange, 1.5, [4, 3]); dot(ctx, X(a), Y(Math.max(lmin, Math.log10(T))), 6, COL.orange); $('e1v').textContent = e; $('a1v').textContent = a;
  $('ro1').textContent = t('s1ro', { e, a, T: sci(T), kap: f2(kap), f: f2(Math.exp(2 * kap * 0.1)), tenth: f1(Math.exp(2 * kap * 0.1)) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), a = S.a2, R = { x: 40, y: 20, w: w - 56, h: h - 60 }, emax = 3, X = e => R.x + e / emax * R.w, Y = T => R.y + R.h - T * R.h; axes(ctx, R, [0, 0.5, 1, 1.5, 2, 2.5, 3], [[0, '0'], [0.5, '0.5'], [1, '1']], t('energyAxis'), t('TAxis2'), X, Y);
  ctx.fillStyle = 'rgba(246,164,91,0.15)'; ctx.fillRect(R.x, R.y, X(V0) - R.x, R.h); text(ctx, t('belowTop'), R.x + 6, R.y + 14, { size: 11, color: COL.orange }); text(ctx, t('aboveTop'), X(V0) + 6, R.y + 14, { size: 11, color: COL.green }); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 1; i <= 300; i++) { const e = emax * i / 300 + 1e-4, T = transT(e === V0 ? e + 1e-6 : e, V0, a); i > 1 ? ctx.lineTo(X(e), Y(T)) : ctx.moveTo(X(e), Y(T)); } ctx.stroke();
  const e = S.e2, T = transT(e === V0 ? e + 1e-6 : e, V0, a); line(ctx, X(e), R.y, X(e), R.y + R.h, COL.orange, 1.5, [4, 3]); dot(ctx, X(e), Y(T), 6, COL.orange); text(ctx, t('classicalStep'), X(V0) + 6, Y(1) + 28, { size: 10, color: COL.muted }); line(ctx, R.x, Y(0), X(V0), Y(0), COL.red, 2, [3, 3]); line(ctx, X(V0), Y(1), R.x + R.w, Y(1), COL.red, 2, [3, 3]);
  $('e2v').textContent = e; $('a2v').textContent = a; $('ro2').textContent = t('s2ro', { e, a, T: sci(T), cl: t(e < V0 ? 'clBlocked' : 'clPasses') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), sim = S.sim, R = { x: 14, y: 20, w: w - 28, h: h * 0.58 }, X = x => R.x + (x - XL) / (NG * DX) * R.w, vm = 2.4, Y = v => R.y + R.h - v / vm * R.h; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h);
  ctx.fillStyle = 'rgba(246,164,91,0.2)'; ctx.fillRect(X(0), R.y, X(S.w3) - X(0), R.h); text(ctx, t('barrierShort'), X(S.w3 / 2), R.y + 14, { align: 'center', size: 11, color: COL.orange }); const E = S.k3 * S.k3 / 2; line(ctx, R.x, Y(E), R.x + R.w, Y(E), COL.green, 1, [4, 3]); text(ctx, t('eLine', { e: f2(E) }), R.x + 4, Y(E) - 4, { size: 10, color: COL.green }); line(ctx, X(0), Y(2), X(S.w3), Y(2), COL.orange, 3);
  ctx.fillStyle = 'rgba(103,215,249,0.5)'; ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(XL), Y(0)); for (let i = 0; i < NG; i++) ctx.lineTo(X(XL + i * DX), Y(Math.min(vm * 0.98, sim.dens(i) * 10))); ctx.lineTo(X(XL + (NG - 1) * DX), Y(0)); ctx.closePath(); ctx.fill(); ctx.stroke();
  const pt = sim.parts(), by = R.y + R.h + 26, bw = R.w; [[pt.L, COL.violet, 'partL'], [pt.B, COL.orange, 'partB'], [pt.R, COL.green, 'partR']].forEach(([v, col, k], i) => { const y = by + i * 22; ctx.fillStyle = COL.dim; ctx.fillRect(R.x + 150, y, bw - 220, 12); ctx.fillStyle = col; ctx.fillRect(R.x + 150, y, (bw - 220) * Math.min(1, v), 12); text(ctx, t(k), R.x, y + 11, { size: 12, color: col }); text(ctx, Math.round(v * 100) + '%', R.x + bw - 60, y + 11, { size: 12 }); });
  text(ctx, t('clock3', { t: f1(sim.t) }), R.x + R.w - 4, R.y + 12, { align: 'right', size: 11 }); $('k3v').textContent = S.k3; $('w3v').textContent = S.w3; $('run3').textContent = t(S.run3 ? 'pause' : 'run'); const T = transT(E, 2, S.w3, 1, Math.SQRT2);
  $('ro3').textContent = t('s3ro', { E: f2(E), v: 2, w: S.w3, L: Math.round(pt.L * 100), B: Math.round(pt.B * 100), R: Math.round(pt.R * 100), T: Math.round(T * 100), sum: f2(pt.tot) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), gap = S.gap4, phi = S.phi4, R = { x: 14, y: 14, w: w - 28, h: h * 0.4 }, L = 4, X = x => R.x + x / L * R.w, hs = 0.35, Yh = hh => R.y + R.h - 10 - hh / hs * (R.h - 30); ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h);
  ctx.fillStyle = '#16384f'; ctx.beginPath(); ctx.moveTo(X(0), R.y + R.h); for (let i = 0; i <= 200; i++) { const x = L * i / 200; ctx.lineTo(X(x), Yh(surf(x))); } ctx.lineTo(X(L), R.y + R.h); ctx.closePath(); ctx.fill(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.stroke();
  const sx = S.scan4 * L, tipY = Yh(0.3) - 8; ctx.fillStyle = COL.orange; ctx.beginPath(); ctx.moveTo(X(sx), tipY + 18); ctx.lineTo(X(sx) - 7, tipY - 14); ctx.lineTo(X(sx) + 7, tipY - 14); ctx.closePath(); ctx.fill(); text(ctx, t('tip'), X(sx) + 10, tipY - 8, { size: 11, color: COL.orange }); text(ctx, t('surface'), R.x + 6, R.y + R.h - 14, { size: 11, color: COL.cyan });
  const P = { x: 48, y: R.y + R.h + 30, w: w - 64, h: h - R.h - 80 }, ref = stmI(STM.adatom, gap, phi), lmin = -4, lmax = 1, Y2 = lg => P.y + P.h - (lg - lmin) / (lmax - lmin) * P.h; ctx.strokeStyle = COL.grid; ctx.strokeRect(P.x, P.y, P.w, P.h); [[1, '10'], [0, '1'], [-1, '0.1'], [-2, '0.01'], [-3, '10⁻³']].forEach(([v, lab]) => { line(ctx, P.x, Y2(v), P.x + P.w, Y2(v), COL.grid, 1); text(ctx, lab, P.x - 4, Y2(v) + 4, { align: 'right', size: 10 }); }); text(ctx, t('currentRel'), P.x, P.y - 6, { size: 11 }); text(ctx, t('xAxisNm'), P.x + P.w, P.y + P.h + 14, { align: 'right', size: 11 });
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); const n = 160; for (let i = 0; i <= Math.round(n * S.scan4); i++) { const x = L * i / n, lg = Math.max(lmin, Math.min(lmax, Math.log10(stmI(x, gap, phi) / ref))); i ? ctx.lineTo(P.x + x / L * P.w, Y2(lg)) : ctx.moveTo(P.x + x / L * P.w, Y2(lg)); } ctx.stroke();
  const imax = stmI(STM.adatom, gap, phi), imin = stmI(0.4, gap, phi), kap = K0 * Math.sqrt(phi); $('gap4v').textContent = gap; $('phi4v').textContent = phi; $('ro4').textContent = t('s4ro', { gap, phi, kap: f2(kap), per: f1(Math.exp(2 * kap * 0.1)), contrast: f1(imax / stmI(0.6, gap, phi)), adatom: f1(STM.ah * 10) }); }
const PARTS = [['elec', 1], ['prot', MP], ['dust', 1.099e21], ['person', 7.69e31]];
function render5() { const { ctx, w, h } = setup($('cv5')), a = S.a5, de = S.de5, v0 = 2, e = v0 - de, rowH = (h - 20) / 4; PARTS.forEach(([id, m], i) => { const lg = log10T(e, v0, a, m), y = 10 + i * rowH; text(ctx, t('p_' + id), 10, y + rowH * 0.42, { size: 13, color: COL.ink, bold: true }); const digits = Math.max(0, -lg), bar = Math.min(1, Math.log10(1 + digits) / 17); ctx.fillStyle = COL.dim; ctx.fillRect(10, y + rowH * 0.55, w - 20, 12); ctx.fillStyle = i === 0 ? COL.green : i === 1 ? COL.cyan : COL.red; ctx.fillRect(10, y + rowH * 0.55, (w - 20) * bar, 12); text(ctx, t('tVal', { x: fmtExp(lg) }), w - 10, y + rowH * 0.42, { align: 'right', size: 12, color: COL.orange }); }); text(ctx, t('barNote'), 10, h - 4, { size: 10 }); $('a5v').textContent = a; $('de5v').textContent = de;
  $('ro5').textContent = t('s5ro', { a, de, e1: fmtExp(log10T(e, v0, a, 1)), e2: fmtExp(log10T(e, v0, a, MP)), ratio: f1(Math.sqrt(MP)) }); }
function fmtExp(lg) { const n = -lg; return n < 1e4 ? '10⁻' + f1(n) : '10⁻(' + n.toExponential(1).replace('e+', '×10^') + ')'; }
function tick3(now) { S.raf3 = requestAnimationFrame(tick3); if (!S.run3 || document.hidden) return; const bb = $('cv3').getBoundingClientRect(); if (bb.bottom < 0 || bb.top > window.innerHeight) return; S.sim.step(reduceMotion() ? 60 : 4); if (S.sim.t > 40) S.run3 = false; render3(); }
function resetSim() { S.run3 = false; S.sim = makeSim(S.k3, S.w3, 2); render3(); }
function scan4(on) { cancelAnimationFrame(S.raf4); if (!on || reduceMotion()) { S.scan4 = 1; render4(); return; } S.scan4 = 0; const t0 = performance.now(); const tk = now => { S.scan4 = Math.max(0, Math.min(1, (now - t0) / 4000)); render4(); if (S.scan4 < 1) S.raf4 = requestAnimationFrame(tk); }; S.raf4 = requestAnimationFrame(tk); }
function onHide() { S.run3 = false; cancelAnimationFrame(S.raf4); S.scan4 = 1; render3(); render4(); }
function wire() {
  S.sim = makeSim(S.k3, S.w3, 2); slider('e0', v => { S.e0 = v; render0(); }); slider('a0', v => { S.a0 = v; render0(); }); slider('e1', v => { S.e1 = v; render1(); }); slider('a1', v => { S.a1 = v; render1(); }); slider('e2', v => { S.e2 = v; render2(); }); slider('a2', v => { S.a2 = v; render2(); });
  slider('k3', v => { S.k3 = v; resetSim(); }); slider('w3', v => { S.w3 = v; resetSim(); }); $('run3').addEventListener('click', () => { S.run3 = !S.run3; render3(); }); $('rs3').addEventListener('click', resetSim);
  slider('gap4', v => { cancelAnimationFrame(S.raf4); S.scan4 = 1; S.gap4 = v; render4(); }); slider('phi4', v => { cancelAnimationFrame(S.raf4); S.scan4 = 1; S.phi4 = v; render4(); }); $('sc4').addEventListener('click', () => scan4(true));
  slider('a5', v => { S.a5 = v; render5(); }); slider('de5', v => { S.de5 = v; render5(); });
  S.raf3 = requestAnimationFrame(tick3);
}

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
if (typeof module !== 'undefined') module.exports = { K0, MP, scatter, transT, log10T, makeSim, surf, stmI, psiAt, NG, DX };
