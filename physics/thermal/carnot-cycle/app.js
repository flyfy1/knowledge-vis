/* carnot-cycle: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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
function ticker(fn) { let id = 0, last = 0, on = false; const o = { get running() { return on; }, start() { if (on) return; on = true; last = 0; const loop = ts => { if (!on) return; const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; if (fn(dt) === false) { on = false; return; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); }, stop() { on = false; if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); } }; TICKERS.push(o); return o; }
function onHide() { TICKERS.forEach(x => x.stop()); }
function pointerXY(c, ev) { const r = c.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
function slider10(id, fn) { const e = $(id); e.addEventListener('input', () => { fn(+e.value / 10); const o = $(id + 'v'); if (o) o.textContent = (e.value / 10).toFixed(1); }); }

/* Model: ideal gas with nR = 1 J/K, V1 = 1 (volume units), adiabatic index gamma = 5/3 (monatomic). Pure functions throughout. */
const GAMMA = 5 / 3, EXPN = 1 / (GAMMA - 1);
function states(Th, Tc, r) { const V1 = 1, V2 = r, V3 = r * Math.pow(Th / Tc, EXPN), V4 = Math.pow(Th / Tc, EXPN); return [[V1, Th], [V2, Th], [V3, Tc], [V4, Tc]]; }
const Pof = (V, T) => T / V;
const heatHot = (Th, r) => Th * Math.log(r), heatCold = (Tc, r) => Tc * Math.log(r);
const netWork = (Th, Tc, r) => (Th - Tc) * Math.log(r);
const efficiency = (Th, Tc) => 1 - Tc / Th;
const cop = (Th, Tc) => Tc / (Th - Tc);
const workToCool = (Q, Th, Tc) => Q / cop(Th, Tc);
const isoWork = (T, V1, V2) => T * Math.log(V2 / V1);
function trapWork(T, V1, V2, n) { let s = 0; for (let i = 0; i < n; i++) { const a = V1 + (V2 - V1) * i / n, b = V1 + (V2 - V1) * (i + 1) / n; s += 0.5 * (Pof(a, T) + Pof(b, T)) * (b - a); } return s; }
/* position on the loop: s in [0,4): 0 hot isotherm expand, 1 adiabatic expand, 2 cold isotherm compress, 3 adiabatic compress */
function loopPoint(s, Th, Tc, r) { const st = states(Th, Tc, r), k = Math.floor(s) % 4, f = s - Math.floor(s); let V, T;
  if (k === 0) { T = Th; V = st[0][0] * Math.pow(r, f); } else if (k === 1) { T = Th - (Th - Tc) * f; V = st[1][0] * Math.pow(Th / T, EXPN); }
  else if (k === 2) { T = Tc; V = st[2][0] * Math.pow(st[3][0] / st[2][0], f); } else { T = Tc + (Th - Tc) * f; V = st[3][0] * Math.pow(Tc / T, EXPN); }
  return { V, T, P: Pof(V, T), k }; }
function loopWork(Th, Tc, r) { let W = 0, prev = loopPoint(0, Th, Tc, r); const N = 4000; for (let i = 1; i <= N; i++) { const q = loopPoint(i * 4 / N, Th, Tc, r); W += 0.5 * (prev.P + q.P) * (q.V - prev.V); prev = q; } return W; } // closed integral of P dV, trapezoid
const f0 = v => String(Math.round(v)), f1 = v => (Math.round(v * 10) / 10).toFixed(1), f2 = v => (Math.round(v * 100) / 100).toFixed(2);
const S = { T0: 400, V20: 3, Tc1: 300, Th2: 500, Tc2: 300, r2: 2.5, s2: 0, Th3: 500, Tc3: 300, Th4: 500, Tc4: 300, Th5: 300, Tc5: 270 };
const PCOL = [COL.red, COL.orange, COL.cyan, COL.violet];
const play2 = ticker(dt => { S.s2 = (S.s2 + dt * 0.5) % 4; render2(); });
function frame(ctx, w, h, vmax, pmax) { const L = { x: 40, y: 14, w: w - 54, h: h - 46 }; axes(ctx, L); const X = v => L.x + v / vmax * L.w, Y = p => L.y + L.h - p / pmax * L.h; text(ctx, 'V', L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, 'P', L.x + 4, L.y + 10, { size: 11 }); [0, 0.5, 1].forEach(q => { text(ctx, f0(vmax * q), X(vmax * q), L.y + L.h + 14, { align: 'center', size: 10 }); }); return { L, X, Y }; }
function pathPts(f, a, b, X, Y, n) { const p = []; for (let i = 0; i <= n; i++) { const q = f(a + (b - a) * i / n); p.push([X(q.V), Y(q.P)]); } return p; }
function drawLoop(ctx, F, Th, Tc, r, shade) { const seg = k => pathPts(s => loopPoint(s, Th, Tc, r), k, k + 1, F.X, F.Y, 60); const all = [].concat(seg(0), seg(1), seg(2), seg(3));
  if (shade) { ctx.fillStyle = shade; ctx.beginPath(); all.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); }
  [0, 1, 2, 3].forEach(k => curve(ctx, seg(k), PCOL[k], 3)); }
function render0() {
  $('V20v').textContent = S.V20.toFixed(1);
  const { ctx, w, h } = setup($('cv0')), T = S.T0, V2 = S.V20, vmax = 5.2, pmax = 500 / 1 * 1.05 * 1.2, F = frame(ctx, w, h, vmax, 600 * 1.05);
  const n = 80, pts = []; for (let i = 0; i <= n; i++) { const v = 1 + (vmax - 1) * i / n; pts.push([F.X(v), F.Y(Pof(v, T))]); }
  ctx.fillStyle = 'rgba(246,164,91,.3)'; ctx.beginPath(); ctx.moveTo(F.X(1), F.Y(0)); for (let i = 0; i <= 60; i++) { const v = 1 + (V2 - 1) * i / 60; ctx.lineTo(F.X(v), F.Y(Pof(v, T))); } ctx.lineTo(F.X(V2), F.Y(0)); ctx.closePath(); ctx.fill();
  curve(ctx, pts, COL.orange, 3); line(ctx, F.X(V2), F.Y(0), F.X(V2), F.Y(Pof(V2, T)), COL.cyan, 1.5, [4, 3]); text(ctx, t('lblArea'), F.X((1 + V2) / 2), F.Y(Pof(V2, T) * 0.4), { align: 'center', size: 12, color: COL.ink, bold: true });
  $('ro0').textContent = t('s0ro', { T: T, V2: f2(V2), w: f1(isoWork(T, 1, V2)), n: f1(trapWork(T, 1, V2, 400)) });
}
function render1() {
  const { ctx, w, h } = setup($('cv1')), Th = 500, Tc = S.Tc1, r = 3, F = frame(ctx, w, h, 3.4, 600 * 1.05);
  const hot = [], cold = []; for (let i = 0; i <= 60; i++) { const v = 1 + (r - 1) * i / 60; hot.push([F.X(v), F.Y(Pof(v, Th))]); cold.push([F.X(v), F.Y(Pof(v, Tc))]); }
  ctx.fillStyle = 'rgba(116,223,170,.3)'; ctx.beginPath(); hot.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); cold.slice().reverse().forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); ctx.fill();
  curve(ctx, hot, COL.red, 3); curve(ctx, cold, COL.cyan, 3); text(ctx, t('lblHotCurve', { T: Th }), F.X(1.05), F.Y(Th) - 8, { size: 11, color: COL.red }); text(ctx, t('lblColdCurve', { T: Tc }), F.X(2.2), F.Y(Pof(2.2, Tc)) + 18, { size: 11, color: COL.cyan });
  text(ctx, t('lblNet'), F.X(1.9), F.Y(Pof(1.9, (Th + Tc) / 2)), { align: 'center', size: 12, color: COL.ink, bold: true });
  const wo = isoWork(Th, 1, r), wi = isoWork(Tc, 1, r); $('ro1').textContent = t('s1ro', { Tc: Tc, wo: f0(wo), wi: f0(wi), net: f0(wo - wi), frac: f0((wo - wi) / wo * 100) });
}
function render2() {
  $('r2v').textContent = S.r2.toFixed(1);
  const { ctx, w, h } = setup($('cv2')), Th = S.Th2, Tc = S.Tc2, r = S.r2, st = states(Th, Tc, r), vmax = st[2][0] * 1.08, F = frame(ctx, w, h, vmax, Th * 1.08);
  drawLoop(ctx, F, Th, Tc, r, 'rgba(116,223,170,.16)'); st.forEach((q, i) => { dot(ctx, F.X(q[0]), F.Y(Pof(q[0], q[1])), 4, COL.ink); text(ctx, String(i + 1), F.X(q[0]) + 6, F.Y(Pof(q[0], q[1])) - 6, { size: 11, color: COL.ink, bold: true }); });
  const c = loopPoint(S.s2, Th, Tc, r); dot(ctx, F.X(c.V), F.Y(c.P), 7, COL.ink); $('play2').textContent = play2.running ? t('pause') : t('play');
  const lab = ['procIso1', 'procAd1', 'procIso2', 'procAd2'][c.k]; $('ro2').textContent = t('s2ro', { proc: t(lab), T: f0(c.T), V: f2(c.V), P: f0(c.P), qh: f0(heatHot(Th, r)), qc: f0(heatCold(Tc, r)), w: f0(netWork(Th, Tc, r)) });
}
function render3() {
  const { ctx, w, h } = setup($('cv3')), Th = S.Th3, Tc = S.Tc3, r = 2.5, qh = heatHot(Th, r), qc = heatCold(Tc, r), W = netWork(Th, Tc, r), L = { x: 20, y: 22, w: w - 40, h: h - 60 }, sc = L.w / 1500;
  text(ctx, t('lblQh', { v: f0(qh) }), L.x, L.y - 6, { size: 12, color: COL.red, bold: true }); ctx.fillStyle = COL.red; ctx.fillRect(L.x, L.y, qh * sc, 26);
  const y2 = L.y + 70; ctx.fillStyle = COL.green; ctx.fillRect(L.x, y2, W * sc, 26); ctx.fillStyle = COL.cyan; ctx.fillRect(L.x + W * sc, y2, qc * sc, 26);
  text(ctx, t('lblW', { v: f0(W) }), L.x, y2 - 6, { size: 12, color: COL.green, bold: true }); text(ctx, t('lblQc', { v: f0(qc) }), Math.min(L.x + W * sc, w - 150), y2 + 44, { size: 12, color: COL.cyan, bold: true });
  line(ctx, L.x + qh * sc, L.y + 30, L.x + qh * sc, y2 + 30, COL.muted, 1, [3, 3]); text(ctx, t('lblEff', { e: f1(efficiency(Th, Tc) * 100) }), L.x, y2 + 66, { size: 13, color: COL.ink, bold: true });
  $('ro3').textContent = t('s3ro', { Th: Th, Tc: Tc, qh: f0(qh), w: f0(W), qc: f0(qc), sum: f0(W + qc), eta: f1(W / qh * 100), eta2: f1((1 - Tc / Th) * 100) });
}
function render4() {
  const { ctx, w, h } = setup($('cv4')), Th = S.Th4, Tc = S.Tc4, L = { x: 44, y: 14, w: w - 60, h: h - 46 }, X = q => L.x + q * L.w, Y = e => L.y + L.h - e * L.h; axes(ctx, L);
  const p = []; for (let q = 0; q <= 1.0001; q += 0.02) p.push([X(q), Y(1 - q)]); curve(ctx, p, COL.orange, 3); const q0 = Tc / Th; line(ctx, X(q0), L.y, X(q0), L.y + L.h, COL.cyan, 1.5, [4, 3]); dot(ctx, X(q0), Y(efficiency(Th, Tc)), 6, COL.cyan);
  text(ctx, t('axRatio'), L.x + L.w, L.y + L.h + 28, { align: 'right', size: 11 }); text(ctx, t('axEta'), L.x + 4, L.y + 10, { size: 11 }); [0, 0.5, 1].forEach(q => text(ctx, f1(q), X(q), L.y + L.h + 14, { align: 'center', size: 10 })); [0, 0.5, 1].forEach(e => text(ctx, f0(e * 100) + '%', L.x - 4, Y(e) + 3, { align: 'right', size: 10 }));
  $('ro4').textContent = t('s4ro', { Th: Th, Tc: Tc, q: f2(q0), eta: f1(efficiency(Th, Tc) * 100), need: f0(Th) });
}
function render5() {
  const { ctx, w, h } = setup($('cv5')), Th = S.Th5, Tc = S.Tc5, r = 2.5, st = states(Th, Tc, r), vmax = st[2][0] * 1.08, F = frame(ctx, w, h, vmax, Th * 1.08);
  drawLoop(ctx, F, Th, Tc, r, 'rgba(224,100,78,.18)'); const mid = loopPoint(0.5, Th, Tc, r); text(ctx, t('lblReverse'), F.X(vmax * 0.5), F.L.y + 20, { align: 'center', size: 12, color: COL.ink, bold: true });
  const mk = (s, dx, dy) => { const a = loopPoint(s, Th, Tc, r), b = loopPoint(s + 0.06, Th, Tc, r); arrow(ctx, F.X(b.V), F.Y(b.P), F.X(a.V), F.Y(a.P), COL.ink, 2); }; [0.5, 1.5, 2.5, 3.5].forEach(s => mk(s));
  const c = cop(Th, Tc), Wn = workToCool(1000, Th, Tc);
  $('ro5').textContent = t('s5ro', { Th: Th, Tc: Tc, cop: f2(c), w: f0(Wn), qh: f0(1000 + Wn) });
}
function wire() {
  slider('T0', v => { S.T0 = v; render0(); }); slider10('V20', v => { S.V20 = v; render0(); }); slider('Tc1', v => { S.Tc1 = v; render1(); });
  const clampPair = (hi, lo, key, min) => () => { S['Tc' + key] = Math.min(S['Tc' + key], S['Th' + key] - min); $('Tc' + key).value = S['Tc' + key]; $('Tc' + key + 'v').textContent = S['Tc' + key]; };
  const c2 = clampPair('Th', 'Tc', '2', 10), c3 = clampPair('Th', 'Tc', '3', 10), c4 = clampPair('Th', 'Tc', '4', 10), c5 = clampPair('Th', 'Tc', '5', 5);
  slider('Th2', v => { S.Th2 = v; c2(); render2(); }); slider('Tc2', v => { S.Tc2 = Math.min(v, S.Th2 - 10); c2(); render2(); }); slider10('r2', v => { S.r2 = v; render2(); });
  $('play2').addEventListener('click', () => { if (play2.running) play2.stop(); else if (reduceMotion()) S.s2 = (Math.floor(S.s2) + 1) % 4; else play2.start(); render2(); });
  $('reset2').addEventListener('click', () => { play2.stop(); S.s2 = 0; render2(); });
  slider('Th3', v => { S.Th3 = v; c3(); render3(); }); slider('Tc3', v => { S.Tc3 = Math.min(v, S.Th3 - 10); c3(); render3(); });
  slider('Th4', v => { S.Th4 = v; c4(); render4(); }); slider('Tc4', v => { S.Tc4 = Math.min(v, S.Th4 - 10); c4(); render4(); });
  [['pre1', 800, 300], ['pre2', 900, 300], ['pre3', 300, 277]].forEach(([id, a, b]) => $(id).addEventListener('click', () => { S.Th4 = a; S.Tc4 = b; $('Th4').value = a; $('Th4v').textContent = a; $('Tc4').value = b; $('Tc4v').textContent = b; render4(); }));
  slider('Th5', v => { S.Th5 = v; c5(); render5(); }); slider('Tc5', v => { S.Tc5 = Math.min(v, S.Th5 - 5); c5(); render5(); });
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

if (typeof module !== 'undefined') module.exports = { GAMMA, states, Pof, heatHot, heatCold, netWork, efficiency, cop, workToCool, isoWork, trapWork, loopPoint, loopWork };
