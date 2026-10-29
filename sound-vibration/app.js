/* sound-vibration: pure model -> state -> render. Numbers shown are computed from the model at runtime. */
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

const SPEEDS = { air: 343, water: 1480, steel: 5100 }, SLOW = 40, F_SLOW = 5, TAU = 2;
/* Slow-motion head height (relative to amplitude A): decaying cosine, time in displayed seconds. */
const headDisplacement = (A, tDisp) => A * Math.exp(-tDisp / TAU) * Math.cos(2 * Math.PI * F_SLOW * tDisp);
const intensityRatio = A => A * A;
const levelDb = A => 20 * Math.log10(A);
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteOf(f) { const midi = 69 + 12 * Math.log2(f / 440), r = Math.round(midi); return { name: NAMES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1), cents: Math.round((midi - r) * 100) }; }
const audibleFraction = pct => pct / 100;
const travelTime = (d, v) => d / v;
const echoDistance = (t, v) => (v || SPEEDS.air) * t / 2;
const f1 = v => String(Math.round(v * 10) / 10), f3 = v => String(Math.round(v * 1000) / 1000);
const S = { t0: -1, run0: false, raf0: 0, last0: 0, t4: 0, run4: false, raf4: 0, last4: 0, audio: null, tone: false, timer: 0 };
function drum(ctx, cx, y0, wd, lift, grains) { ctx.fillStyle = '#3a4b58'; ctx.fillRect(cx - wd / 2, y0 + 6, wd, 46); ctx.strokeStyle = COL.muted; ctx.lineWidth = 2; ctx.strokeRect(cx - wd / 2, y0 + 6, wd, 46);
  ctx.strokeStyle = COL.cyan; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - wd / 2, y0 + 6); ctx.quadraticCurveTo(cx, y0 + 6 - lift * 1.6, cx + wd / 2, y0 + 6); ctx.stroke();
  grains.forEach(g => { const u = (g - 0.5) * 2, my = y0 + 6 - lift * 0.8 * (1 - u * u); dot(ctx, cx + u * wd * 0.45, my - 3 - Math.max(0, lift) * 0.5 * (0.6 + 0.8 * g), 2.8, '#f3ecd0'); }); }
const GR = [0.08, 0.17, 0.26, 0.35, 0.44, 0.5, 0.56, 0.65, 0.74, 0.83, 0.92];
function trace(ctx, box, fn, tMax, ymax, col, upto) { line(ctx, box.x, box.y + box.h / 2, box.x + box.w, box.y + box.h / 2, COL.grid, 1); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); const n = 240; for (let i = 0; i <= n; i++) { const tt = tMax * i / n; if (upto !== undefined && tt > upto) break; const x = box.x + box.w * i / n, y = box.y + box.h / 2 - fn(tt) / ymax * box.h / 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
function render0() { const { ctx, w, h } = setup($('cv0')), t0 = S.t0, y = t0 < 0 ? 0 : headDisplacement(10, t0), lift = Math.max(-18, Math.min(18, y * 1.8)); drum(ctx, w / 2, h * 0.14, Math.min(w * 0.6, 260), lift, GR);
  const box = { x: 30, y: h * 0.52, w: w - 44, h: h * 0.42 }; trace(ctx, box, tt => headDisplacement(10, tt), 4, 10, COL.dim); if (t0 >= 0) trace(ctx, box, tt => headDisplacement(10, tt), 4, 10, COL.orange, t0); text(ctx, 't', box.x + box.w, box.y + box.h / 2 - 5, { align: 'right', size: 11 });
  $('ro0').textContent = t0 < 0 ? t('s0roIdle') : t('s0ro', { t: f1(t0), real: Math.round(t0 / SLOW * 1000), y: f1(y), g: f1(Math.max(0, y) * 0.55) }); }
const stop0 = () => { S.run0 = false; cancelAnimationFrame(S.raf0); };
function tick0(ts) { if (!S.run0) return; S.t0 += Math.min(0.1, (ts - S.last0) / 1000); S.last0 = ts; if (S.t0 >= 4) { S.t0 = 4; S.run0 = false; } render0(); if (S.run0) S.raf0 = requestAnimationFrame(tick0); }
function render1() { const { ctx, w, h } = setup($('cv1')), A = +$('a1').value; $('a1v').textContent = A; drum(ctx, w * 0.5, h * 0.06, Math.min(w * 0.5, 220), A * 1.8, GR);
  const box = { x: 30, y: h * 0.48, w: w - 44, h: h * 0.46 }, wv = tt => Math.cos(2 * Math.PI * tt * 3); trace(ctx, box, tt => 1 * wv(tt), 1, 10, COL.dim); trace(ctx, box, tt => A * wv(tt), 1, 10, COL.orange); text(ctx, String(A), box.x - 4, box.y + box.h / 2 - A / 10 * box.h / 2 + 4, { align: 'right', size: 11, color: COL.orange });
  $('ro1').textContent = t('s1ro', { a: A, i: f1(intensityRatio(A)), db: f1(levelDb(A)) }); }
function render2() { const { ctx, w, h } = setup($('cv2')), f = +$('f2').value; $('f2v').textContent = f; const box = { x: 12, y: 10, w: w - 24, h: h - 30 }; trace(ctx, box, tt => Math.sin(2 * Math.PI * f * tt), 0.02, 1.15, COL.cyan);
  for (let k = 0; k <= 4; k++) { const x = box.x + box.w * k / 4; line(ctx, x, box.y + box.h - 2, x, box.y + box.h + 4, COL.muted, 1); text(ctx, String(k * 5), x, h - 2, { align: 'center', size: 10 }); } text(ctx, 'ms', box.x + box.w, h - 12, { align: 'right', size: 10 });
  const nt = noteOf(f); $('ro2').textContent = t('s2ro', { f, n: f1(f * 0.02), note: nt.name, cents: (nt.cents >= 0 ? '+' : '') + nt.cents }); $('tone2').textContent = t(S.tone ? 'stopTone' : 'listen'); $('tone2').setAttribute('aria-pressed', S.tone ? 'true' : 'false'); $('noaud2').textContent = (window.AudioContext || window.webkitAudioContext) ? '' : t('noAudio'); }
function stopTone() { if (S.audio) { try { S.audio.g.gain.cancelScheduledValues(0); S.audio.g.gain.setValueAtTime(0, S.audio.c.currentTime); S.audio.o.stop(); S.audio.c.close(); } catch (e) { /* already stopped */ } S.audio = null; } clearTimeout(S.timer); S.tone = false; }
function startTone() { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; stopTone(); try { const c = new AC(), o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = +$('f2').value; g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.05); g.gain.setValueAtTime(0.05, c.currentTime + 1.1); g.gain.linearRampToValueAtTime(0, c.currentTime + 1.2); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 1.25); S.audio = { c, o, g }; S.tone = true; S.timer = setTimeout(() => { stopTone(); render2(); }, 1300); } catch (e) { S.tone = false; } }
function render3() { const { ctx, w, h } = setup($('cv3')), p = +$('p3').value; $('p3v').textContent = p; const cx = w * 0.3, jw = Math.min(w * 0.36, 170), jy = h * 0.12, jh = h * 0.74; ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - jw / 2, jy + jh); ctx.lineTo(cx - jw / 2, jy + jw / 2); ctx.arc(cx, jy + jw / 2, jw / 2, Math.PI, 0); ctx.lineTo(cx + jw / 2, jy + jh); ctx.stroke(); line(ctx, cx - jw / 2 - 8, jy + jh, cx + jw / 2 + 8, jy + jh, COL.muted, 3);
  const n = Math.round(p * 0.6); for (let k = 0; k < 60; k++) { if (k >= n) break; const a = ((k * 7919) % 1000) / 1000, b = ((k * 104729) % 1000) / 1000; dot(ctx, cx - jw / 2 + 8 + a * (jw - 16), jy + jw * 0.4 + b * (jh - jw * 0.5), 2.4, 'rgba(116,223,170,0.85)'); }
  dot(ctx, cx, jy + jh - 16, 9, COL.orange); text(ctx, '🔔', cx, jy + jh - 8, { align: 'center', size: 16 }); const s = audibleFraction(p), bx = cx + jw / 2 + 10;
  for (let k = 1; k <= 4; k++) { ctx.strokeStyle = 'rgba(246,164,91,' + (s * (1 - k * 0.18)) + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, jy + jh - 16, jw / 2 + 14 * k + 8, -0.6, 0.6); ctx.stroke(); }
  const ex = w * 0.78, ey = h * 0.5; ctx.fillStyle = '#d9a77a'; ctx.beginPath(); ctx.arc(ex, ey, 18, 0, 6.2832); ctx.fill(); text(ctx, p >= 5 ? '♪' : '–', ex + 34, ey + 6, { size: 22, color: p >= 5 ? COL.orange : COL.muted, bold: true });
  $('ro3').textContent = t('s3ro', { p, s: f1(s), res: t(p >= 5 ? 'heard' : 'silent') }); }
function render4() { const { ctx, w, h } = setup($('cv4')), d = +$('d4').value; $('d4v').textContent = d; const keys = ['air', 'water', 'steel'], cols = [COL.cyan, COL.green, COL.orange], x0 = 70, x1 = w - 16, ly = i => 18 + i * (h - 30) / 3;
  keys.forEach((k, i) => { const v = SPEEDS[k], pr = Math.min(1, v * S.t4 / d); line(ctx, x0, ly(i) + 14, x1, ly(i) + 14, COL.grid, 3); line(ctx, x0, ly(i) + 14, x0 + (x1 - x0) * pr, ly(i) + 14, cols[i], 3); dot(ctx, x0 + (x1 - x0) * pr, ly(i) + 14, 7, cols[i]); text(ctx, v + '', 6, ly(i) + 18, { size: 11, color: cols[i], bold: true }); text(ctx, f3(travelTime(d, v)), x1, ly(i) + 5, { align: 'right', size: 11, color: pr >= 1 ? cols[i] : COL.muted }); });
  $('ro4').textContent = t('s4ro', { d, ta: f3(travelTime(d, SPEEDS.air)), tw: f3(travelTime(d, SPEEDS.water)), ts: f3(travelTime(d, SPEEDS.steel)), t: f3(S.t4) }); }
const stop4 = () => { S.run4 = false; cancelAnimationFrame(S.raf4); };
function tick4(ts) { if (!S.run4) return; S.t4 += Math.min(0.1, (ts - S.last4) / 1000); S.last4 = ts; const tmax = travelTime(+$('d4').value, SPEEDS.air); if (S.t4 >= tmax) { S.t4 = tmax; S.run4 = false; } render4(); if (S.run4) S.raf4 = requestAnimationFrame(tick4); }
function render5() { const { ctx, w, h } = setup($('cv5')), dl = +$('e5').value; $('e5v').textContent = dl; const d = echoDistance(dl), x0 = 40; const cliffX = x0 + (w - 90) * Math.min(1, d / 700); ctx.fillStyle = '#4a4f57'; ctx.fillRect(cliffX + 20, h * 0.2, 28, h * 0.65); dot(ctx, x0, h * 0.7, 9, '#d9a77a'); line(ctx, x0, h * 0.85, cliffX + 20, h * 0.85, COL.muted, 1.5);
  line(ctx, x0 + 12, h * 0.55, cliffX + 16, h * 0.55, COL.orange, 3); line(ctx, cliffX + 16, h * 0.62, x0 + 12, h * 0.62, COL.green, 3); text(ctx, f1(d) + '', (x0 + cliffX) / 2 + 10, h * 0.83 - 6, { align: 'center', size: 12, color: COL.ink, bold: true });
  $('ro5').textContent = t('s5ro', { t: f1(dl), tot: f1(SPEEDS.air * dl), d: f1(d) }); }
const onHide = () => { stop0(); stop4(); stopTone(); render0(); render2(); render4(); };
function wire() {
  $('strike0').addEventListener('click', () => { stop0(); S.t0 = 0; if (reduceMotion()) { S.t0 = 0.2; render0(); return; } S.run0 = true; S.last0 = performance.now(); S.raf0 = requestAnimationFrame(tick0); render0(); }); $('reset0').addEventListener('click', () => { stop0(); S.t0 = -1; render0(); });
  slider('a1', render1); slider('f2', () => { if (S.audio) S.audio.o.frequency.value = +$('f2').value; render2(); }); $('tone2').addEventListener('click', () => { if (S.tone) stopTone(); else startTone(); render2(); }); slider('p3', render3);
  slider('d4', () => { stop4(); S.t4 = 0; render4(); }); $('go4').addEventListener('click', () => { stop4(); S.t4 = 0; if (reduceMotion()) { S.t4 = travelTime(+$('d4').value, SPEEDS.air); render4(); return; } S.run4 = true; S.last4 = performance.now(); S.raf4 = requestAnimationFrame(tick4); }); $('reset4').addEventListener('click', () => { stop4(); S.t4 = 0; render4(); });
  slider('e5', render5);
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
if (typeof module !== 'undefined') module.exports = { headDisplacement,intensityRatio,levelDb,noteOf,audibleFraction,travelTime,echoDistance,SPEEDS };
