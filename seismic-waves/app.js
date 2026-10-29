/* seismic-waves: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const VP = 6.5, VS = 3.7, RE = 6371, RCMB = 3480, RIC = 1221.5;
const lagPerKm = 1 / VS - 1 / VP;
const distFromLag = dt => dt / lagPerKm, lagFromDist = d => d * lagPerKm;
const energyJ = M => Math.pow(10, 1.5 * M + 4.8), tntTons = M => energyJ(M) / 4.184e9;
/* Simplified radial velocity layers [rTop, vTop, rBottom, vBottom] in km and km/s (P and S); S has no outer core. */
const mk = pts => { const out = []; for (let i = 0; i + 1 < pts.length; i++) out.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]]); return out; };
const LAY = { P: [].concat(mk([[6371, 5.8], [6346.6, 6.8]]), mk([[6346.6, 8.11], [6291, 8.08], [6151, 8.56], [5971, 8.91]]), mk([[5971, 9.13], [5701, 10.27]]), mk([[5701, 10.75], [5371, 11.42], [4871, 12.02], [4371, 12.62], [3871, 13.24], [3480, 13.72]]), mk([[3480, 8.06], [3000, 8.55], [2500, 9.06], [2000, 9.5], [1500, 10.0], [1221.5, 10.36]]), mk([[1221.5, 11.03], [0, 11.26]])),
  S: [].concat(mk([[6371, 3.2], [6346.6, 3.9]]), mk([[6346.6, 4.49], [6291, 4.48], [6151, 4.7], [5971, 4.77]]), mk([[5971, 5.07], [5701, 5.57]]), mk([[5701, 5.95], [5371, 6.28], [4871, 6.62], [4371, 6.9], [3871, 7.15], [3480, 7.26]]), mk([[3480, 0], [0, 0]])) };
function vAt(layers, r) { for (const [rt, vt, rb, vb] of layers) if (r <= rt && r >= rb) return rb === rt ? vt : vt + (vb - vt) * (rt - r) / (rt - rb); return 0; }
/* Trace the down-going half of a ray with ray parameter p (Snell's law conserved: p = r sin(theta)/v), 2 km shells. */
function trace(wave, i0deg) { const L = LAY[wave], v0 = vAt(L, RE - 1e-6), p = RE * Math.sin(i0deg * Math.PI / 180) / v0, path = [[RE, 0]]; let phi = 0, T = 0, r = RE, rt = RE, state = 'turn';
  while (r > 1) { const dr = 2, rm = r - dr / 2, v = vAt(L, rm); if (v <= 0) { state = 'blocked'; rt = r; break; } const s = p * v / rm; if (s >= 0.99999) { rt = rm; break; } const c = Math.sqrt(1 - s * s); phi += (s / c) * dr / rm; T += dr / (c * v); r -= dr; rt = r; path.push([r, phi]); }
  if (state === 'blocked') return { state, delta: null, time: null, rt, path, p, i0: i0deg }; return { state: 'ok', delta: 2 * phi * 180 / Math.PI, time: 2 * T, rt, path, p, i0: i0deg, core: rt < RCMB }; }
const FAN = {}; function fan(wave) { if (FAN[wave]) return FAN[wave]; const out = []; for (let a = 1; a <= 89.95; a += 0.1) out.push(trace(wave, Math.round(a * 10) / 10)); return (FAN[wave] = out); }
/* Which rays emerge near epicentral distance D (degrees)? */
const effD = r => r.delta > 180 ? 360 - r.delta : r.delta;
function arrivals(wave, D, tol) { return fan(wave).filter(r => r.state === 'ok' && Math.abs(effD(r) - D) <= (tol || 1.2)); }
const f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100), f0 = v => String(Math.round(v));
const sci = v => v >= 1e6 ? v.toExponential(1).replace('e+', '×10^') : String(Math.round(v));
const STA = [[-150, 0], [150, 0], [0, 220]], HID = [38, 130, 275, 410, 700];
const S = { d0: 120, tau0: 1, raf0: 0, ex1: 40, ey1: 120, err1: 0, i0: 20, wave3: 'P', D3: 60, M4: 6, i5: 0, g5: 200, chk5: false };
function seis(ctx, R, d, tmax, tau, hl) { ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); const tp = d / VP, ts = d / VS, X = tt => R.x + tt / tmax * R.w, cy = R.y + R.h / 2; for (let k = 0; k <= tmax; k += 10) { line(ctx, X(k), R.y, X(k), R.y + R.h, COL.grid, 1); text(ctx, k + ' s', X(k), R.y + R.h + 13, { align: 'center', size: 10 }); }
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 600; i++) { const tt = tmax * i / 600; if (tt > tau) break; const nz = 0.04 * Math.sin(tt * 91.7) * Math.sin(tt * 13.1 + 1); const pw = tt >= tp ? 0.35 * Math.exp(-(tt - tp) / 6) * Math.sin(2 * Math.PI * 1.4 * (tt - tp)) : 0, sw = tt >= ts ? 0.9 * Math.exp(-(tt - ts) / 9) * Math.sin(2 * Math.PI * 0.8 * (tt - ts)) : 0; const y = cy - (nz + pw + sw) * R.h * 0.45; i ? ctx.lineTo(R.x + R.w * tt / tmax, y) : ctx.moveTo(R.x + R.w * tt / tmax, y); } ctx.stroke();
  if (tau >= tp) { line(ctx, X(tp), R.y, X(tp), R.y + R.h, COL.cyan, 1.5, [4, 3]); text(ctx, 'P', X(tp) + 4, R.y + 12, { size: 12, color: COL.cyan, bold: true }); } if (tau >= ts) { line(ctx, X(ts), R.y, X(ts), R.y + R.h, COL.orange, 1.5, [4, 3]); text(ctx, 'S', X(ts) + 4, R.y + 12, { size: 12, color: COL.orange, bold: true }); if (hl) { line(ctx, X(tp), R.y + R.h - 8, X(ts), R.y + R.h - 8, COL.green, 3); text(ctx, t('lagLab', { v: f1(ts - tp) }), (X(tp) + X(ts)) / 2, R.y + R.h - 14, { align: 'center', size: 11, color: COL.green }); } } }
function render0() { const { ctx, w, h } = setup($('cv0')), d = S.d0, tmax = Math.max(60, Math.ceil(d / VS * 1.35 / 10) * 10), R = { x: 14, y: 16, w: w - 28, h: h - 46 }; seis(ctx, R, d, tmax, S.tau0 * tmax, true); text(ctx, t('seisTitle'), R.x + 4, R.y + 12, { size: 11, color: COL.muted, base: 'alphabetic' }); $('d0v').textContent = d; const lag = lagFromDist(d);
  $('ro0').textContent = t('s0ro', { d, tp: f1(d / VP), ts: f1(d / VS), lag: f1(lag), back: f0(distFromLag(lag)), k: f1(1 / lagPerKm) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), R = { x: 10, y: 10, w: w - 20, h: h - 20 }, sc = Math.min(R.w / 560, R.h / 360), cx = R.x + R.w / 2, cy = R.y + R.h * 0.78, X = x => cx + x * sc, Y = y => cy - y * sc * 1.0, offs = [1, -1, 0.5]; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h);
  const res = STA.map(([sx, sy], i) => { const d = Math.hypot(S.ex1 - sx, S.ey1 - sy), lag = lagFromDist(d) + offs[i] * S.err1, dm = distFromLag(Math.max(0, lag)); return { sx, sy, d, lag, dm }; });
  res.forEach((r, i) => { ctx.strokeStyle = [COL.cyan, COL.violet, COL.green][i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(r.sx), Y(r.sy), r.dm * sc, 0, 6.2832); ctx.stroke(); ctx.fillStyle = [COL.cyan, COL.violet, COL.green][i]; ctx.fillRect(X(r.sx) - 6, Y(r.sy) - 6, 12, 12); text(ctx, t('station', { n: 'ABC'[i] }) + ' ' + f1(r.lag) + ' s', X(r.sx), Y(r.sy) + 22, { align: 'center', size: 11, color: [COL.cyan, COL.violet, COL.green][i] }); }); dot(ctx, X(S.ex1), Y(S.ey1), 7, COL.red); text(ctx, t('epic'), X(S.ex1) + 10, Y(S.ey1) - 6, { size: 12, color: COL.red });
  $('ex1v').textContent = S.ex1; $('ey1v').textContent = S.ey1; $('err1v').textContent = S.err1; $('ro1').textContent = t('s1ro', { ex: S.ex1, ey: S.ey1, a: f1(res[0].lag), b: f1(res[1].lag), c: f1(res[2].lag), da: f0(res[0].dm), db: f0(res[1].dm), dc: f0(res[2].dm), err: S.err1 }); }
function earth(ctx, w, h) { const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46, k = R / RE; ctx.fillStyle = '#16384f'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#4e3a1c'; ctx.beginPath(); ctx.arc(cx, cy, RCMB * k, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#6b4a22'; ctx.beginPath(); ctx.arc(cx, cy, RIC * k, 0, 6.2832); ctx.fill(); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke(); ctx.strokeStyle = COL.grid; ctx.beginPath(); ctx.arc(cx, cy, RCMB * k, 0, 6.2832); ctx.stroke();
  return { cx, cy, R, k, pt: (r, phi) => [cx + r * k * Math.sin(phi), cy - r * k * Math.cos(phi)] }; }
function drawRay(ctx, E, rr, col, lw) { if (rr.state !== 'ok') { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); rr.path.forEach(([r, ph], i) => { const p = E.pt(r, ph); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); return; } const D = rr.delta * Math.PI / 180; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); rr.path.forEach(([r, ph], i) => { const p = E.pt(r, ph); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); for (let i = rr.path.length - 1; i >= 0; i--) { const p = E.pt(rr.path[i][0], D - rr.path[i][1]); ctx.lineTo(p[0], p[1]); } ctx.stroke(); }
function render2() { const { ctx, w, h } = setup($('cv2')), E = earth(ctx, w, h), F = fan('P'), cur = trace('P', S.i0); F.forEach((r, i) => { if (i % 6 === 0) drawRay(ctx, E, r, r.core ? 'rgba(246,164,91,0.35)' : 'rgba(103,215,249,0.3)', 1); }); F.forEach(r => { if (r.state === 'ok') { const p = E.pt(RE, effD(r) * Math.PI / 180); dot(ctx, p[0], p[1], 1.8, r.core ? COL.orange : COL.cyan); } }); drawRay(ctx, E, cur, COL.ink, 3); const s0 = E.pt(RE, 0); dot(ctx, s0[0], s0[1], 5, COL.red);
  text(ctx, t('legMantle'), 8, 16, { size: 11, color: COL.cyan }); text(ctx, t('legCore'), 8, 32, { size: 11, color: COL.orange }); text(ctx, t('src'), s0[0] + 8, s0[1] - 6, { size: 11, color: COL.red }); $('i0v').textContent = S.i0; const emerge = F.filter(r => r.state === 'ok').map(effD).sort((a, b) => a - b); let gap = [0, 0]; for (let i = 1; i < emerge.length; i++) if (emerge[i] - emerge[i - 1] > gap[1] - gap[0]) gap = [emerge[i - 1], emerge[i]];
  $('ro2').textContent = t('s2ro', { i0: S.i0, delta: cur.delta === null ? '—' : f1(cur.delta), time: cur.time === null ? '—' : f1(cur.time / 60), depth: f0(RE - cur.rt), core: t(cur.core ? 'inCore' : 'inMantle'), g0: f0(gap[0]), g1: f0(gap[1]) }); }
function render3() { const { ctx, w, h } = setup($('cv3')), E = earth(ctx, w, h), D = S.D3, a = fan(S.wave3).filter(r => r.state === 'ok'), tol = 1.2; fan(S.wave3).forEach((r, i) => { if (i % 6 === 0) drawRay(ctx, E, r, S.wave3 === 'P' ? 'rgba(103,215,249,0.3)' : 'rgba(246,164,91,0.3)', 1); }); const sp = E.pt(RE, D * Math.PI / 180); ctx.fillStyle = COL.green; ctx.fillRect(sp[0] - 6, sp[1] - 6, 12, 12); text(ctx, t('station3'), sp[0] + 10, sp[1] + 4, { size: 11, color: COL.green }); const s0 = E.pt(RE, 0); dot(ctx, s0[0], s0[1], 5, COL.red);
  const P = arrivals('P', D, tol), Sx = arrivals('S', D, tol); ['P', 'S'].forEach((k, i) => $('w3' + k).classList.toggle('active', S.wave3 === k)); $('D3v').textContent = D; const best = arr => arr.length ? arr.reduce((m, r) => (Math.abs(effD(r) - D) < Math.abs(effD(m) - D) ? r : m)) : null, bp = best(P), bs = best(Sx);
  text(ctx, bp ? t('gotP', { t: f1(bp.time / 60) }) : t('noP'), 8, h - 24, { size: 12, color: bp ? COL.cyan : COL.red }); text(ctx, bs ? t('gotS', { t: f1(bs.time / 60) }) : t('noS'), 8, h - 8, { size: 12, color: bs ? COL.orange : COL.red });
  $('ro3').textContent = t('s3ro', { D, p: bp ? t(bp.core ? 'pkp' : 'pdirect', { t: f1(bp.time / 60) }) : t('noP'), s: bs ? t('sdirect', { t: f1(bs.time / 60) }) : t('noS'), why: D >= 104 && D <= 140 ? t('whyShadow') : D > 140 ? t('whyCoreP') : t('whyAll') }); }
function render4() { const { ctx, w, h } = setup($('cv4')), M = S.M4, R = { x: 52, y: 22, w: w - 68, h: h - 62 }, Y = lg => R.y + R.h - (lg - 5) / 25 * R.h, X = m => R.x + (m - 2) / 7.5 * R.w; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); [10, 15, 20, 25, 30].forEach(v => { line(ctx, R.x, Y(v), R.x + R.w, Y(v), COL.grid, 1); text(ctx, '10^' + v, R.x - 4, Y(v) + 4, { align: 'right', size: 10 }); }); [2, 4, 6, 8, 9.5].forEach(m => text(ctx, String(m), X(m), R.y + R.h + 13, { align: 'center', size: 10 }));
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const m = 2 + 7.5 * i / 60; i ? ctx.lineTo(X(m), Y(Math.log10(energyJ(m)))) : ctx.moveTo(X(m), Y(Math.log10(energyJ(m)))); } ctx.stroke(); ctx.strokeStyle = COL.cyan; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const m = 2 + 7.5 * i / 60; i ? ctx.lineTo(X(m), Y(5 + m * 1.0 * 1)) : ctx.moveTo(X(m), Y(5 + m * 1)); } ctx.stroke();
  text(ctx, t('legEnergy'), R.x + 8, R.y + 14, { size: 12, color: COL.orange }); text(ctx, t('legAmp'), R.x + 8, R.y + 30, { size: 12, color: COL.cyan }); text(ctx, t('magAxis'), R.x + R.w, R.y + R.h + 28, { align: 'right', size: 11 }); dot(ctx, X(M), Y(Math.log10(energyJ(M))), 6, COL.orange); dot(ctx, X(M), Y(5 + M), 5, COL.cyan);
  $('M4v').textContent = M; const tn = tntTons(M); $('ro4').textContent = t('s4ro', { M, E: sci(energyJ(M)), tnt: tn < 1000 ? sci(tn) + ' t' : sci(tn / 1000) + ' kt', amp: sci(Math.pow(10, M - 2)), f: f1(Math.pow(10, 1.5)) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), d = HID[S.i5 % HID.length], tmax = Math.ceil(d / VS * 1.35 / 10) * 10, R = { x: 14, y: 16, w: w - 28, h: h - 46 }; seis(ctx, R, d, tmax, tmax, false); const ok = Math.abs(S.g5 - d) <= 0.08 * d; $('g5v').textContent = S.g5; $('chk5b').classList.toggle('active', S.chk5);
  $('ro5').textContent = !S.chk5 ? t('s5ro', { g: S.g5, lag: f1(lagFromDist(S.g5)) }) : ok ? t('s5roOk', { d, lag: f1(lagFromDist(d)), g: S.g5 }) : t('s5roNo', { d, lag: f1(lagFromDist(d)), g: S.g5 }); }
function replay0() { cancelAnimationFrame(S.raf0); if (reduceMotion()) { S.tau0 = 1; render0(); return; } S.tau0 = 0; const t0 = performance.now(); const tk = now => { S.tau0 = Math.max(0, Math.min(1, (now - t0) / 6000)); render0(); if (S.tau0 < 1) S.raf0 = requestAnimationFrame(tk); }; S.raf0 = requestAnimationFrame(tk); }
function onHide() { cancelAnimationFrame(S.raf0); S.tau0 = 1; render0(); }
function wire() {
  slider('d0', v => { cancelAnimationFrame(S.raf0); S.tau0 = 1; S.d0 = v; render0(); }); $('rp0').addEventListener('click', replay0); slider('ex1', v => { S.ex1 = v; render1(); }); slider('ey1', v => { S.ey1 = v; render1(); }); slider('err1', v => { S.err1 = v; render1(); }); slider('i0', v => { S.i0 = v; render2(); });
  $('w3P').addEventListener('click', () => { S.wave3 = 'P'; render3(); }); $('w3S').addEventListener('click', () => { S.wave3 = 'S'; render3(); }); slider('D3', v => { S.D3 = v; render3(); }); slider('M4', v => { S.M4 = v; render4(); });
  slider('g5', v => { S.g5 = v; S.chk5 = false; render5(); }); $('chk5b').addEventListener('click', () => { S.chk5 = true; render5(); }); $('nx5').addEventListener('click', () => { S.i5++; S.chk5 = false; render5(); });
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
if (typeof module !== 'undefined') module.exports = { VP, VS, lagPerKm, distFromLag, lagFromDist, energyJ, tntTons, vAt, LAY, trace, fan, arrivals, effD, RE, RCMB };
