/* sound-waves: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const MEDIA = { air: 343, water: 1480, steel: 5000 };
const lambda = (v, f) => v / f, period = f => 1 / f;
const speedAir = T => 331.3 + 0.606 * T;
const beatFreq = (a, b) => Math.abs(a - b);
/* Waveform made of harmonics n = 1..N with amplitude n^(-b) (all) or only odd harmonics (odd), normalised to a peak of 1. */
function harmAmps(mode, b, N) { const a = []; for (let n = 1; n <= N; n++) a.push(mode === 'sine' ? (n === 1 ? 1 : 0) : mode === 'odd' ? (n % 2 ? Math.pow(n, -b) : 0) : Math.pow(n, -b)); return a; }
function wave(amps, f, t) { let s = 0; amps.forEach((a, i) => { s += a * Math.sin(2 * Math.PI * (i + 1) * f * t); }); return s; }
const peakOf = (amps, f) => { let m = 0; for (let i = 0; i < 400; i++) m = Math.max(m, Math.abs(wave(amps, f, i / 400 / f))); return m; };
const band = f => f < 20 ? 'infra' : f > 20000 ? 'ultra' : 'audible';
const QUIZ = [[7, 'infra'], [440, 'audible'], [50000, 'ultra'], [3000, 'audible'], [15, 'infra'], [25000, 'ultra']];
const MARKS = [['elephant', 10, 1000], ['voice', 85, 3000], ['piano', 27.5, 4186], ['dog', 67, 45000], ['bat', 9000, 120000]];
const f0 = v => String(Math.round(v)), f1 = v => String(Math.round(v * 10) / 10), f2 = v => String(Math.round(v * 100) / 100), f3 = v => String(Math.round(v * 1000) / 1000), fq = v => v >= 1000 ? f1(v / 1000) + ' kHz' : f1(v) + ' Hz';
const S = { f0: 400, amp0: 0.6, t: 0, paused: false, raf: 0, last: 0, f1: 400, med1: 'air', fa: 440, fb: 447, mode3: 'sine', b3: 1, T4: 15, dt4: 3, f5: 440, i5: 0, pick5: '', chk5: false, score5: 0, tot5: 0 };
const SLOW = 250, VIEW_L = 4;
function render0() { const { ctx, w, h } = setup($('cv0')), f = S.f0, lam = lambda(MEDIA.air, f), k = 2 * Math.PI / lam, om = 2 * Math.PI * f, n = 64, pad = 20, X = x => pad + x / VIEW_L * (w - 2 * pad), tt = S.t / SLOW, ds = (x) => 0.1 * S.amp0 * Math.sin(k * x - om * tt), y0 = h * 0.28, y1 = h * 0.72;
  line(ctx, pad, y0 + 30, w - pad, y0 + 30, COL.grid, 1); for (let i = 0; i < n; i++) { const x = (i + 0.5) / n * VIEW_L; for (let r = 0; r < 4; r++) { const xx = x + ds(x), y = y0 - 18 + r * 14, comp = -0.1 * S.amp0 * k * Math.cos(k * x - om * tt), a = 0.35 + 0.65 * Math.max(0, Math.min(1, 0.5 + comp / (0.1 * S.amp0 * k + 1e-9) * 0.5)); dot(ctx, X(xx), y, 3.5, 'rgba(103,215,249,' + a + ')'); } }
  text(ctx, t('particles'), pad, y0 - 28, { size: 11 }); const P = { x: pad, y: y1 - 38, w: w - 2 * pad, h: 78 }; ctx.strokeStyle = COL.grid; ctx.strokeRect(P.x, P.y, P.w, P.h); line(ctx, P.x, P.y + P.h / 2, P.x + P.w, P.y + P.h / 2, COL.grid, 1); ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = VIEW_L * i / 200, p = -Math.cos(k * x - om * tt) * S.amp0; i ? ctx.lineTo(X(x), P.y + P.h / 2 - p * P.h * 0.45) : ctx.moveTo(X(x), P.y + P.h / 2 - p * P.h * 0.45); } ctx.stroke(); text(ctx, t('pressure'), P.x + 4, P.y + 12, { size: 11, color: COL.orange });
  const xl = VIEW_L > lam ? Math.min(w - pad - 4, X(lam)) : w - pad; line(ctx, pad, P.y + P.h + 14, Math.min(w - pad, pad + lam / VIEW_L * (w - 2 * pad)), P.y + P.h + 14, COL.green, 3); text(ctx, 'λ = ' + f2(lam) + ' m', pad + 4, P.y + P.h + 30, { size: 12, color: COL.green }); text(ctx, t('slowNote', { s: SLOW }), w - pad, P.y + P.h + 30, { align: 'right', size: 10 });
  $('f0v').textContent = f; $('amp0v').textContent = S.amp0; $('pause0').textContent = t(S.paused ? 'resume' : 'pause'); $('ro0').textContent = t('s0ro', { f, lam: f2(lam), T: f2(1000 / f), v: MEDIA.air, cyc: f1(VIEW_L / lam) }); }
function render1() { const { ctx, w, h } = setup($('cv1')), f = S.f1, v = MEDIA[S.med1], lam = lambda(v, f), T = period(f), A = { x: 36, y: 18, w: w - 52, h: (h - 90) / 2 }, B = { x: 36, y: 18 + A.h + 50, w: w - 52, h: A.h };
  [[A, 'time', 3 * T, COL.cyan, (x) => Math.sin(2 * Math.PI * x / T), T, 's'], [B, 'space', 3 * lam, COL.orange, (x) => Math.sin(2 * Math.PI * x / lam), lam, 'm']].forEach(([R, kind, span, col, fn, per, unit]) => { ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); line(ctx, R.x, R.y + R.h / 2, R.x + R.w, R.y + R.h / 2, COL.grid, 1); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = span * i / 300, y = fn(x); i ? ctx.lineTo(R.x + R.w * i / 300, R.y + R.h / 2 - y * R.h * 0.4) : ctx.moveTo(R.x, R.y + R.h / 2 - y * R.h * 0.4); } ctx.stroke(); line(ctx, R.x, R.y + R.h + 12, R.x + R.w / 3, R.y + R.h + 12, COL.green, 3); text(ctx, kind === 'time' ? 'T = ' + f2(T * 1000) + ' ms' : 'λ = ' + f2(lam) + ' m', R.x + R.w / 6, R.y + R.h + 28, { align: 'center', size: 12, color: COL.green }); text(ctx, t(kind === 'time' ? 'timeTrace' : 'spaceSnap'), R.x + 6, R.y + 12, { size: 11, color: col }); });
  ['air', 'water', 'steel'].forEach(m => $('m1_' + m).classList.toggle('active', S.med1 === m)); $('f1v').textContent = f; $('ro1').textContent = t('s1ro', { f, med: t('med_' + S.med1), v, lam: f2(lam), T: f2(T * 1000), chk: f2(f * lam) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), a = S.fa, b = S.fb, win = 0.3, R = { x: 14, y: 16, w: w - 28, h: h - 56 }, Y = v => R.y + R.h / 2 - v / 2.2 * R.h * 0.5; ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); line(ctx, R.x, Y(0), R.x + R.w, Y(0), COL.grid, 1); const df = beatFreq(a, b);
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i <= 1800; i++) { const tt = win * i / 1800, y = Math.sin(2 * Math.PI * a * tt) + Math.sin(2 * Math.PI * b * tt); i ? ctx.lineTo(R.x + R.w * i / 1800, Y(y)) : ctx.moveTo(R.x, Y(y)); } ctx.stroke(); ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.5; [1, -1].forEach(sg => { ctx.beginPath(); for (let i = 0; i <= 300; i++) { const tt = win * i / 300, env = Math.abs(2 * Math.cos(Math.PI * (b - a) * tt)); i ? ctx.lineTo(R.x + R.w * i / 300, Y(sg * env)) : ctx.moveTo(R.x, Y(sg * env)); } ctx.stroke(); });
  text(ctx, t('legSum'), R.x + 6, R.y + 14, { size: 11, color: COL.cyan }); text(ctx, t('legEnv'), R.x + 6, R.y + 30, { size: 11, color: COL.orange }); text(ctx, '0 s', R.x, R.y + R.h + 14, { size: 10 }); text(ctx, win + ' s', R.x + R.w, R.y + R.h + 14, { align: 'right', size: 10 }); if (df > 0) { const pw = R.w / (win * df); line(ctx, R.x, R.y + R.h + 22, R.x + Math.min(R.w, pw), R.y + R.h + 22, COL.green, 3); text(ctx, t('beatPeriod', { p: f0(1000 / df) }), R.x + Math.min(R.w, pw) + 6, R.y + R.h + 26, { size: 11, color: COL.green }); }
  $('fa2v').textContent = a; $('fb2v').textContent = b; $('ro2').textContent = t('s2ro', { a, b, df, avg: f1((a + b) / 2), kind: t(df === 0 ? 'steady' : df <= 15 ? 'slowBeats' : 'rough') }); }
function render3() { const { ctx, w, h } = setup($('cv3')), f = 220, amps = harmAmps(S.mode3, S.b3, 12), pk = peakOf(amps, f) || 1, R = { x: 14, y: 16, w: w * 0.62, h: h - 44 }, Sp = { x: R.x + R.w + 24, y: 16, w: w - R.x - R.w - 40, h: h - 44 };
  ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h); line(ctx, R.x, R.y + R.h / 2, R.x + R.w, R.y + R.h / 2, COL.grid, 1); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); const win = 3 / f; for (let i = 0; i <= 400; i++) { const tt = win * i / 400, y = wave(amps, f, tt) / pk; i ? ctx.lineTo(R.x + R.w * i / 400, R.y + R.h / 2 - y * R.h * 0.42) : ctx.moveTo(R.x, R.y + R.h / 2 - y * R.h * 0.42); } ctx.stroke(); line(ctx, R.x, R.y + R.h + 12, R.x + R.w / 3, R.y + R.h + 12, COL.green, 3); text(ctx, t('samePeriod', { T: f2(1000 / f) }), R.x + R.w / 6, R.y + R.h + 28, { align: 'center', size: 11, color: COL.green });
  ctx.strokeStyle = COL.grid; ctx.strokeRect(Sp.x, Sp.y, Sp.w, Sp.h); const bw = Sp.w / 12; amps.forEach((a, i) => { ctx.fillStyle = COL.orange; const bh = a * Sp.h * 0.9; ctx.fillRect(Sp.x + i * bw + 1, Sp.y + Sp.h - bh, bw - 2, bh); if (i < 6 || i % 2 === 0) text(ctx, String(i + 1), Sp.x + i * bw + bw / 2, Sp.y + Sp.h + 12, { align: 'center', size: 9 }); }); text(ctx, t('spectrum'), Sp.x, Sp.y - 4, { size: 11, color: COL.orange });
  ['sine', 'odd', 'all'].forEach(m => $('m3_' + m).classList.toggle('active', S.mode3 === m)); $('b3v').textContent = S.b3; const strong = amps.filter(a => a > 0.1).length; $('ro3').textContent = t('s3ro', { mode: t('mode_' + S.mode3), b: S.b3, f, n: strong, a2: f2(amps[1]), a3: f2(amps[2]), pk: f2(pk) }); }
function render4() { const { ctx, w, h } = setup($('cv4')), T = S.T4, v = speedAir(T), dt = S.dt4, d = v * dt, R = { x: 24, y: 28, w: w - 48, h: 22 }, dmax = 15 * 360, X = x => R.x + x / dmax * R.w; ctx.fillStyle = COL.dim; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.fillStyle = COL.cyan; ctx.fillRect(R.x, R.y, X(d) - R.x, R.h); dot(ctx, R.x, R.y + R.h / 2, 7, COL.orange); text(ctx, t('lightning'), R.x, R.y - 8, { size: 12, color: COL.orange }); dot(ctx, X(d), R.y + R.h / 2, 7, COL.green); text(ctx, t('you'), X(d), R.y - 8, { align: 'center', size: 12, color: COL.green }); text(ctx, f0(d) + ' m', (R.x + X(d)) / 2, R.y + R.h + 16, { align: 'center', size: 13, color: COL.cyan, bold: true });
  const Pp = { x: 44, y: R.y + 62, w: w - 70, h: h - R.y - 120 }; ctx.strokeStyle = COL.grid; ctx.strokeRect(Pp.x, Pp.y, Pp.w, Pp.h); const Xt = tc => Pp.x + (tc + 10) / 50 * Pp.w, Yv = vv => Pp.y + Pp.h - (vv - 320) / 40 * Pp.h; line(ctx, Xt(-10), Yv(speedAir(-10)), Xt(40), Yv(speedAir(40)), COL.orange, 2.5); dot(ctx, Xt(T), Yv(v), 6, COL.orange); text(ctx, t('tempAxis'), Pp.x + Pp.w, Pp.y + Pp.h + 14, { align: 'right', size: 11 }); text(ctx, t('speedAxis'), Pp.x, Pp.y - 5, { size: 11 }); [320, 340, 360].forEach(vv => text(ctx, String(vv), Pp.x - 4, Yv(vv) + 4, { align: 'right', size: 10 }));
  $('T4v').textContent = T; $('dt4v').textContent = dt; $('ro4').textContent = t('s4ro', { T, v: f1(v), dt, d: f0(d), km: f2(d / 1000), perKm: f2(1000 / v), light: f2(d / 3e8 * 1e6) }); }
function render5() { const { ctx, w, h } = setup($('cv5')), f = S.f5, R = { x: 40, y: 30, w: w - 60, h: h - 100 }, X = ff => R.x + (Math.log10(ff) - 0) / 6 * R.w; ctx.fillStyle = 'rgba(176,156,255,0.12)'; ctx.fillRect(R.x, R.y, X(20) - R.x, R.h); ctx.fillStyle = 'rgba(116,223,170,0.12)'; ctx.fillRect(X(20), R.y, X(20000) - X(20), R.h); ctx.fillStyle = 'rgba(246,164,91,0.12)'; ctx.fillRect(X(20000), R.y, R.x + R.w - X(20000), R.h); ctx.strokeStyle = COL.grid; ctx.strokeRect(R.x, R.y, R.w, R.h);
  [0, 1, 2, 3, 4, 5, 6].forEach(k => { text(ctx, k === 0 ? '1' : k < 3 ? String(Math.pow(10, k)) : k === 3 ? '1k' : k === 4 ? '10k' : k === 5 ? '100k' : '1M', X(Math.pow(10, k)), R.y + R.h + 13, { align: 'center', size: 10 }); }); text(ctx, t('infra'), (R.x + X(20)) / 2, R.y + 14, { align: 'center', size: 11, color: COL.violet }); text(ctx, t('audible'), (X(20) + X(20000)) / 2, R.y + 14, { align: 'center', size: 12, color: COL.green }); text(ctx, t('ultra'), (X(20000) + R.x + R.w) / 2, R.y + 14, { align: 'center', size: 11, color: COL.orange });
  MARKS.forEach(([id, lo, hi], i) => { const y = R.y + 32 + i * 18; ctx.fillStyle = 'rgba(103,215,249,0.6)'; ctx.fillRect(X(lo), y, X(hi) - X(lo), 10); text(ctx, t('mk_' + id), X(lo), y - 2, { size: 10, color: COL.cyan }); }); line(ctx, X(f), R.y, X(f), R.y + R.h, COL.ink, 2); dot(ctx, X(f), R.y + R.h - 6, 5, COL.ink);
  const q = QUIZ[S.i5 % QUIZ.length]; ['infra', 'audible', 'ultra'].forEach(k => $('q5_' + k).classList.toggle('active', S.pick5 === k)); const ok = S.pick5 === q[1]; $('lf5v').textContent = f0(f); $('ro5').textContent = t('s5ro', { f: fq(f), lam: lam5(f), kind: t(band(f)) }) + ' ' + (!S.chk5 || !S.pick5 ? t('quizAsk', { q: fq(q[0]), n: S.i5 % QUIZ.length + 1, score: S.score5, tot: S.tot5 }) : t(ok ? 'quizOk' : 'quizNo', { q: fq(q[0]), kind: t(q[1]), score: S.score5, tot: S.tot5 })); }
function lam5(f) { const l = 343 / f; return l >= 1 ? f2(l) + ' m' : f1(l * 100) + ' cm'; }
function tick(now) { S.raf = requestAnimationFrame(tick); if (S.paused || document.hidden) { S.last = now; return; } const dt = Math.min(0.1, (now - (S.last || now)) / 1000); S.last = now; S.t += dt; render0(); }
function onHide() { cancelAnimationFrame(S.raf); S.raf = 0; }
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!document.hidden && !S.raf && document.getElementById('ro0') && !reduceMotion()) S.raf = requestAnimationFrame(tick); });
function wire() {
  slider('f0', v => { S.f0 = v; render0(); }); slider('amp0', v => { S.amp0 = v; render0(); }); $('pause0').addEventListener('click', () => { S.paused = !S.paused; render0(); }); slider('f1', v => { S.f1 = v; render1(); }); ['air', 'water', 'steel'].forEach(m => $('m1_' + m).addEventListener('click', () => { S.med1 = m; render1(); }));
  slider('fa2', v => { S.fa = v; render2(); }); slider('fb2', v => { S.fb = v; render2(); }); ['sine', 'odd', 'all'].forEach(m => $('m3_' + m).addEventListener('click', () => { S.mode3 = m; render3(); })); slider('b3', v => { S.b3 = v; render3(); }); slider('T4', v => { S.T4 = v; render4(); }); slider('dt4', v => { S.dt4 = v; render4(); });
  $('f5').addEventListener('input', e => { S.f5 = Math.round(Math.pow(10, +e.target.value / 10) * 10) / 10; S.chk5 = false; render5(); }); ['infra', 'audible', 'ultra'].forEach(k => $('q5_' + k).addEventListener('click', () => { S.pick5 = k; S.chk5 = false; render5(); })); $('chk5').addEventListener('click', () => { if (!S.pick5) return; S.chk5 = true; S.tot5++; if (S.pick5 === QUIZ[S.i5 % QUIZ.length][1]) S.score5++; render5(); }); $('nx5').addEventListener('click', () => { S.i5++; S.pick5 = ''; S.chk5 = false; render5(); }); $('rs5').addEventListener('click', () => { S.i5 = 0; S.pick5 = ''; S.chk5 = false; S.score5 = 0; S.tot5 = 0; render5(); });
  if (!reduceMotion()) S.raf = requestAnimationFrame(tick);
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
if (typeof module !== 'undefined') module.exports = { MEDIA, lambda, period, speedAir, beatFreq, harmAmps, wave, peakOf, band, QUIZ, SLOW };
