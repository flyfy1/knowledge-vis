'use strict';
// Frequency-response lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, dot and readout comes from window.FR_MODEL (model.js): formula curves from H(f),
// "measured" values from the RK4 bench. Canvas text is limited to panel titles and axis ticks.
(function () {

const $ = id => document.getElementById(id);
const M = window.FR_MODEL;
const t = (...a) => window.FR_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#6b7c92', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const logF = id => M.fFromLog(num(id));
// Trim trailing zeros only after a decimal point (so 90 stays 90); show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s).replace(/^-/, '−'); };
const fmtHz = f => (f >= 1000 ? fmt(f / 1000, f >= 10000 ? 1 : 2) + ' kHz' : fmt(f, f < 100 ? 1 : 0) + ' Hz');
const fmtT = s => (Math.abs(s) < 1e-3 ? fmt(s * 1e6, 1) + ' µs' : fmt(s * 1e3, 3) + ' ms');
const tickHz = f => (f >= 1000 ? fmt(f / 1000, 0) + 'k' : fmt(f, 0));

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
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Plot panel. With o.log the x axis is log10(f) between o.xMin and o.xMax (given in log10 units)
// and ticks sit on decades labelled 100, 1k, 10k.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const xr = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const x = o.log ? f => xr(Math.log10(f)) : xr;
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(fmt(v, o.yDigits || 2), P.l - 6, y(v) + 4);
  }
  ctx.textAlign = 'center';
  if (o.log) {
    for (let d = Math.ceil(o.xMin - 1e-9); d <= o.xMax + 1e-9; d++) {
      const X = xr(d); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b + 4); ctx.stroke();
      ctx.fillText(tickHz(Math.pow(10, d)), X, P.b + 15);
    }
  } else if (o.xTicks) {
    const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [0.25, 0.5, 1, 2, 5, 10]);
    const first = Math.ceil((o.xMin - 1e-9) / step) * step;
    for (let v = first; v <= o.xMax + 1e-9; v += step) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(xr(v), P.b); ctx.lineTo(xr(v), P.b + 4); ctx.stroke();
      ctx.fillText(fmt(v, 2), xr(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P, o };
}
function clipTo(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t - 1, m.P.r - m.P.l, m.P.b - m.P.t + 2); ctx.clip(); }
function curve(ctx, m, xs, ys, color, lw = 2, dash = null) {
  clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath();
  xs.forEach((v, i) => { const X = m.x(v), Y = m.y(ys[i]); if (!i) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, m, X, Y, color, r = 4.5) {
  const lo = m.o.yMin, hi = m.o.yMax, v = Math.max(lo, Math.min(hi, Y)), px = m.x(X), py = m.y(v);
  ctx.save(); ctx.fillStyle = color;
  if (v !== Y) { const s = Y > hi ? 1 : -1; ctx.beginPath(); ctx.moveTo(px - 5, py + s * 7); ctx.lineTo(px + 5, py + s * 7); ctx.lineTo(px, py); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
function vline(ctx, X, y0, y1, color = C.orange, alpha = 0.7) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}
const logGrid = (a, b, n = 240) => Array.from({ length: n + 1 }, (_, i) => Math.pow(10, a + (b - a) * i / n));

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

/* ---------- step 0: measure one frequency at a time ---------- */
const s0 = { hist: new Map() };
const cache0 = new Map();
const meas0 = f => { const k = f.toPrecision(8); if (!cache0.has(k)) cache0.set(k, M.measure(M.RC0, f)); return cache0.get(k); };
function draw0() {
  const f = logF('f0'), m = meas0(f);
  s0.hist.set(f.toPrecision(8), f);
  $('f0v').textContent = fmtHz(f);
  const { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 26, bottom: 170, xMin: 0, xMax: 2, yMin: -1.25, yMax: 1.25, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.25, 0.5], title: t('c0a') });
  const n = m.wave.x.length - 1, ts = m.wave.x.map((_, k) => 2 * k / n);
  curve(ctx, A, ts, m.wave.x, C.raw, 1.6); curve(ctx, A, ts, m.wave.y, C.cyan, 2.4);
  const pk = 0.25, pkOut = pk + m.lag * f; // input sin peaks at t/T = 0.25; output peak is later by lag·f periods
  vline(ctx, A.x(pk), A.P.t, A.P.b, C.orange); vline(ctx, A.x(pkOut), A.P.t, A.P.b, C.orange);
  const B = panel(ctx, W, { top: 212, bottom: H - 26, xMin: 0, xMax: 20.5, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: true, xSteps: [2, 5, 10], minPx: 30, title: t('c0b') });
  for (const fq of s0.hist.values()) if (fq !== f) dot(ctx, B, fq / 1000, meas0(fq).G, C.text, 3.2);
  dot(ctx, B, f / 1000, m.G, C.cyan, 5.5);
  $('r0').textContent = t('s0readout', { f: fmtHz(f), g: fmt(m.G, 3), pct: fmt(m.G * 100, 1), lag: fmtT(m.lag), deg: fmt(m.lag * f * 360, 1), n: s0.hist.size });
}

/* ---------- step 1: Bode plot of the RC low-pass ---------- */
function draw1() {
  const fc = logF('fc1'), f = logF('p1'), secs = [{ type: 'lp', fc }];
  $('fc1v').textContent = fmtHz(fc); $('p1v').textContent = fmtHz(f);
  const { ctx, W, H } = fitCanvas($('c1'));
  const lx = { log: true, xMin: 1.7, xMax: 4.3 };
  const A = panel(ctx, W, { ...lx, top: 26, bottom: 190, yMin: -50, yMax: 5, yTicks: [0, -20, -40], title: t('c1a') });
  const fs = logGrid(1.7, 4.3);
  // asymptotes: 0 dB up to fc, −20 dB/decade beyond
  curve(ctx, A, [fs[0], fc], [0, 0], C.ghost, 1.4, [6, 4]); curve(ctx, A, [fc, fs[fs.length - 1]], [0, -20 * Math.log10(fs[fs.length - 1] / fc)], C.ghost, 1.4, [6, 4]);
  curve(ctx, A, fs, fs.map(q => M.dB(M.gain(secs, q))), C.cyan, 2.4);
  const B = panel(ctx, W, { ...lx, top: 232, bottom: H - 26, yMin: -95, yMax: 5, yTicks: [0, -45, -90], title: t('c1b') });
  curve(ctx, B, fs, fs.map(q => M.phase(secs, q) * 180 / Math.PI), C.cyan, 2.4);
  vline(ctx, A.x(fc), A.P.t, B.P.b, C.orange, 0.55);
  const g = M.gain(secs, f), ph = M.phase(secs, f) * 180 / Math.PI;
  dot(ctx, A, f, M.dB(g), C.orange, 5.5); dot(ctx, B, f, ph, C.orange, 5.5);
  const slope = M.dB(M.gain(secs, 100 * fc)) - M.dB(M.gain(secs, 10 * fc));
  $('r1').textContent = t('s1readout', { fc: fmtHz(fc), f: fmtHz(f), ratio: fmt(f / fc, 3), g: fmt(g, 3), db: fmt(M.dB(g), 2), ph: fmt(ph, 1), dbc: fmt(M.dB(M.gain(secs, fc)), 2), phc: fmt(M.phase(secs, fc) * 180 / Math.PI, 1), slope: fmt(slope, 2) });
}

/* ---------- step 2: two tones, unequal lags ---------- */
function draw2() {
  const f1 = logF('f2'), r = M.twoTone(f1);
  $('f2v').textContent = fmtHz(f1);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: 190, xMin: 0, xMax: 2, yMin: -1.4, yMax: 1.4, yTicks: [-1, 0, 1], xTicks: true, xSteps: [0.25, 0.5], title: t('c2a') });
  const n = r.x.length - 1, ts = r.x.map((_, k) => 2 * k / n);
  curve(ctx, A, ts, r.x, C.raw, 1.5); curve(ctx, A, ts, r.ref, C.text, 1.6, [5, 4]); curve(ctx, A, ts, r.y, C.cyan, 2.4);
  const B = panel(ctx, W, { log: true, xMin: 1.7, xMax: 4.3, top: 232, bottom: H - 26, yMin: 0, yMax: 0.18, yTicks: [0, 0.05, 0.1, 0.15], title: t('c2b') });
  const fs = logGrid(1.7, 4.3);
  curve(ctx, B, fs, fs.map(q => M.lagOf(M.phase(M.RC0, q), q) * 1e3), C.ghost, 1.8);
  vline(ctx, B.x(f1), B.P.t, B.P.b, C.orange, 0.5); vline(ctx, B.x(3 * f1), B.P.t, B.P.b, C.pink, 0.5);
  dot(ctx, B, f1, r.d1 * 1e3, C.orange, 5.5); dot(ctx, B, 3 * f1, r.d3 * 1e3, C.pink, 5.5);
  $('r2').textContent = t('s2readout', { f: fmtHz(f1), d1: fmtT(r.d1), d3: fmtT(r.d3), dd: fmtT(r.d1 - r.d3), g1: fmt(r.g1, 3), g3: fmt(r.g3, 3), mis: fmt(r.mismatch * 100, 2) });
}

/* ---------- step 3: cutoff and order ---------- */
function draw3() {
  const fc = logF('fc3'), n = num('n3'), r = M.cleanup(fc, n);
  $('fc3v').textContent = fmtHz(fc); $('n3v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c3'));
  const span = W < 520 ? 5 : 10; // ms shown: one 200 Hz period on phones so the 5 kHz ripple stays readable
  const A = panel(ctx, W, { top: 26, bottom: 190, xMin: 0, xMax: span, yMin: -1.7, yMax: 1.7, yTicks: [-1, 0, 1], xTicks: true, xSteps: [1, 2, 5], title: t('c3a') });
  const N = r.x.length - 1, keep = Math.round(N * span / 10) + 1, ts = r.x.slice(0, keep).map((_, k) => 10 * k / N); // data = two 200 Hz periods = 10 ms
  curve(ctx, A, ts, r.x.slice(0, keep), C.raw, 1.1); curve(ctx, A, ts, ts.map(q => Math.sin(2 * Math.PI * M.MIX.want * q / 1000)), C.text, 1.4, [5, 4]); curve(ctx, A, ts, r.y.slice(0, keep), C.cyan, 2.2);
  const B = panel(ctx, W, { log: true, xMin: 1.7, xMax: 4.3, top: 232, bottom: H - 26, yMin: -100, yMax: 5, yTicks: [0, -40, -80], title: t('c3b') });
  const fs = logGrid(1.7, 4.3);
  curve(ctx, B, fs, fs.map(q => M.dB(M.gain(r.secs, q))), C.cyan, 2.4);
  vline(ctx, B.x(fc), B.P.t, B.P.b, C.ghost, 0.6);
  dot(ctx, B, M.MIX.want, M.dB(r.gw), C.orange, 5.5); dot(ctx, B, M.MIX.hiss, M.dB(r.gh), C.pink, 5.5);
  $('r3').textContent = t('s3readout', { n, fc: fmtHz(fc), gw: fmt(M.dB(r.gw), 2), gh: fmt(M.dB(r.gh), 1), sel: fmt(r.sel, 1), slope: fmt(r.slope, 1) });
}

/* ---------- step 4: low-pass, high-pass, band-pass ---------- */
const s4 = { kind: 'bp' };
function draw4() {
  const Q = num('Q4'), secs = M.shapeSecs(s4.kind, Q);
  $('Q4v').textContent = fmt(Q, 1); $('Q4').disabled = s4.kind !== 'bp';
  [['kindLP', 'lp'], ['kindHP', 'hp'], ['kindBP', 'bp']].forEach(([id, k]) => $(id).setAttribute('aria-pressed', String(s4.kind === k)));
  const { ctx, W, H } = fitCanvas($('c4'));
  const lx = { log: true, xMin: 1.7, xMax: 4.3 };
  const A = panel(ctx, W, { ...lx, top: 26, bottom: 180, yMin: -40, yMax: 5, yTicks: [0, -20, -40], title: t('c4a') });
  const B = panel(ctx, W, { ...lx, top: 222, bottom: H - 26, yMin: -100, yMax: 100, yTicks: [-90, 0, 90], title: t('c4b') });
  let bp = null;
  if (s4.kind === 'bp') {
    bp = M.bandpass(Q);
    ctx.fillStyle = 'rgba(103,215,249,0.13)';
    for (const m of [A, B]) ctx.fillRect(m.x(bp.lo), m.P.t, m.x(bp.hi) - m.x(bp.lo), m.P.b - m.P.t);
    curve(ctx, A, [50, 20000], [-3.0103, -3.0103], C.ghost, 1, [3, 4]);
  }
  const fs = logGrid(1.7, 4.3, 400);
  curve(ctx, A, fs, fs.map(q => M.dB(M.gain(secs, q))), C.cyan, 2.4);
  curve(ctx, B, fs, fs.map(q => M.phase(secs, q) * 180 / Math.PI), C.cyan, 2.4);
  vline(ctx, A.x(M.FC0), A.P.t, B.P.b, C.orange, 0.55);
  const at = f => ({ db: fmt(M.dB(M.gain(secs, f)), 2), ph: fmt(M.phase(secs, f) * 180 / Math.PI, 1) });
  if (s4.kind === 'lp') $('r4').textContent = t('s4lp', { ...at(1000), db10: at(10000).db });
  else if (s4.kind === 'hp') $('r4').textContent = t('s4hp', { ...at(1000), db01: at(100).db });
  else $('r4').textContent = t('s4bp', { Q: fmt(Q, 1), peak: fmt(M.dB(bp.peak), 2), lo: fmtHz(bp.lo), hi: fmtHz(bp.hi), bw: fmtHz(bp.bw), Qm: fmt(bp.Qm, 3) });
}

/* ---------- step 5: design to spec ---------- */
const s5 = { bench: null };
function draw5() {
  const fL = logF('fL5'), fH = logF('fH5'), n = num('n5'), v = M.verdict(fL, fH, n), S = M.SPEC;
  $('fL5v').textContent = fmtHz(fL); $('fH5v').textContent = fmtHz(fH); $('n5v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { log: true, xMin: 1.3, xMax: 4.6, top: 26, bottom: H - 26, yMin: -60, yMax: 5, yTicks: [0, -20, -40, -60], title: t('c5a') });
  const bar = (f, y0, y1) => { const X = A.x(f); ctx.fillStyle = 'rgba(255,122,147,0.30)'; ctx.fillRect(X - 6, A.y(y1), 12, A.y(y0) - A.y(y1)); };
  bar(S.hum, S.humMax, 5); bar(S.top, S.topMax, 5); bar(S.pass, -60, S.passMin);
  const fs = logGrid(1.3, 4.6, 400);
  curve(ctx, A, fs, fs.map(q => M.dB(M.gain(v.secs, q))), C.cyan, 2.4);
  [[S.hum, v.h, v.okH], [S.pass, v.p, v.okP], [S.top, v.t, v.okT]].forEach(([f, d, ok]) => dot(ctx, A, f, d, ok ? C.text : C.pink, 5));
  const item = (key, val, ok) => `<li class="${ok ? 'ok' : 'bad'}">${t(key, { v: fmt(val, 2), ok: t(ok ? 'pass' : 'fail') })}</li>`;
  $('spec5').innerHTML = item('spec1', v.p, v.okP) + item('spec2', v.h, v.okH) + item('spec3', v.t, v.okT);
  const missed = [v.okP, v.okH, v.okT].filter(x => !x).length;
  $('verdict5').textContent = missed ? t('s5notyet', { k: missed }) : t('s5all');
  $('verdict5').className = 'verdict ' + (missed ? 'bad' : 'ok');
  if (s5.bench && s5.bench.key === `${fL}|${fH}|${n}`) {
    const [a, b, c] = s5.bench.vals, e = Math.max(Math.abs(a - v.h), Math.abs(b - v.p), Math.abs(c - v.t));
    $('r5').textContent = t('s5bench', { a: fmt(a, 2), b: fmt(b, 2), c: fmt(c, 2), e: fmt(Math.max(0.001, Math.ceil(e * 1000) / 1000), 3) });
  } else { s5.bench = null; $('r5').textContent = t('s5benchWait'); }
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('f0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('sweep0').addEventListener('click', () => {
    s0.hist.clear();
    const L = M.LOGF, count = Math.round((L.max - L.min) / L.step) + 1;
    animate('s0', count * 110, p => {
      const idx = Math.min(count - 1, Math.floor(p * count));
      for (let i = 0; i <= idx; i++) { const f = M.fFromLog(L.min + i * L.step); s0.hist.set(f.toPrecision(8), f); }
      $('f0').value = (L.min + idx * L.step).toFixed(2); draw0();
    });
  });
  $('clear0').addEventListener('click', () => { stopAnim('s0'); s0.hist.clear(); draw0(); });
  ['fc1', 'p1'].forEach(id => $(id).addEventListener('input', draw1));
  $('f2').addEventListener('input', draw2);
  ['fc3', 'n3'].forEach(id => $(id).addEventListener('input', draw3));
  [['kindLP', 'lp'], ['kindHP', 'hp'], ['kindBP', 'bp']].forEach(([id, k]) => $(id).addEventListener('click', () => { s4.kind = k; draw4(); }));
  $('Q4').addEventListener('input', draw4);
  ['fL5', 'fH5', 'n5'].forEach(id => $(id).addEventListener('input', () => { s5.bench = null; draw5(); }));
  $('bench5').addEventListener('click', () => {
    const fL = logF('fL5'), fH = logF('fH5'), n = num('n5');
    s5.bench = { key: `${fL}|${fH}|${n}`, vals: M.benchDesign(fL, fH, n) }; draw5();
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshFR = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
