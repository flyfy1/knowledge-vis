'use strict';
// Sound-waves lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, marker and readout comes from window.SOUND_MODEL (model.js). Canvas text is limited to
// panel titles and axis ticks laid out in fixed rows (plus one bracket label in its own row in step 1);
// legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.SOUND_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', red: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', dot: '#8ea3bb', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Fixed decimals, then trailing zeros dropped only after a decimal point (90 stays 90); −0 shows as 0.
const fmt = (v, d = 2) => {
  if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
  let s = v.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('-', '−');
};
// Two significant figures, plain decimal notation (no exponent) for the pressure ticks.
const sig = (v, n = 2) => { if (!v) return '0'; const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v)))); return fmt(v, d); };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  // CSS height is fixed once from the authored attribute; only the bitmap follows the DPR.
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

// Text that shrinks until it fits maxW (never overflows, never squeezes glyphs).
function fitText(ctx, text, X, Y, maxW, { size = 12, weight = 600, color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  do { ctx.font = `${weight} ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}

// A plot panel. The title sits in its own row above the plot; tick labels sit left of / below it.
// o: top, bottom, xMin, xMax, yMin, yMax, yTicks [values], yLabel(v), xTicks [values] | null, xLabel(v), title, left, right
function panel(ctx, W, o) {
  const P = { l: o.left || 46, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.grid; ctx.strokeRect(P.l + 0.5, P.t + 0.5, P.r - P.l - 1, P.b - P.t - 1);
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 && o.yMin < 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yLabel ? o.yLabel(v) : fmt(v), P.l - 6, y(v) + 4);
  }
  if (o.xTicks) {
    ctx.textAlign = 'center';
    for (const v of o.xTicks) {
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
      ctx.fillText(o.xLabel ? o.xLabel(v) : fmt(v), x(v), P.b + 15);
    }
  }
  ctx.restore();
  if (o.title) fitText(ctx, o.title, 8, o.titleY || P.t - 9, W - 16);
  return { x, y, P };
}
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6); return out; };
// Tick spacing that keeps labels at least minPx apart.
function ticks(a, b, px, minPx, steps) { for (const s of steps) if (s / (b - a) * px >= minPx) return range(Math.ceil(a / s) * s, b, s); return [a, b]; }
function clipTo(ctx, m) { ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
function curve(ctx, m, f, x0, x1, n, color, lw = 2, dash = null) {
  ctx.save(); clipTo(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const v = x0 + (x1 - x0) * i / n, X = m.x(v), Y = m.y(f(v)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function vline(ctx, X, y0, y1, color, lw = 1.2, dash = [4, 4], alpha = 0.7) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke(); ctx.restore();
}

/* ---------- shared one-shot animation runner (reduced motion → final frame; hidden page → final frame) ---------- */
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

/* ---------- step 0: the parcel stays, the pattern travels ---------- */
const X0 = { min: 0, max: 4, parcel: 2, span: 0.02, amp: M.DRAW_AMP }; // m, m, m, s of film, drawn amplitude in λ
const s0 = { t: 0, t0: 0, want: false, inView: false, raf: null, last: 0, lastText: 0 };
// Fixed pseudo-random vertical spots for the dots (seeded, identical on every load).
const DOTS = (() => { let q = 12345; const r = () => { q = (q * 16807) % 2147483647; return q / 2147483647; }; const out = []; for (let i = 0; i < 64; i++) for (let j = 0; j < 6; j++) out.push({ x: (i + 0.2 + 0.6 * r()) * (X0.max / 64), y: (j + 0.15 + 0.7 * r()) / 6 }); return out; })();
function draw0(updateText = true) {
  const f = num('f0'), v = M.MEDIA[0].v, lam = v / f, A = X0.amp * lam, now = s0.t;
  $('f0v').textContent = f + ' Hz';
  const { ctx, W, H } = fitCanvas($('c0'));
  const xt = ticks(0, 4, W - 58, 34, [0.5, 1, 2]);
  const top = panel(ctx, W, { top: 26, bottom: 124, xMin: X0.min, xMax: X0.max, yMin: 0, yMax: 1, title: t('c0a'), left: 58 });
  const comps = M.compressions(now, f, v, X0.min - lam, X0.max + lam);
  ctx.save(); clipTo(ctx, top);
  comps.forEach(xc => vline(ctx, top.x(xc), top.P.t, top.P.b, C.orange, 2, null, 0.45));
  ctx.fillStyle = C.dot;
  DOTS.forEach(d => { const X = top.x(d.x + M.displacement(d.x, now, f, v, A)); ctx.beginPath(); ctx.arc(X, top.P.t + 6 + d.y * (top.P.b - top.P.t - 12), 2.1, 0, 7); ctx.fill(); });
  const px = X0.parcel + M.displacement(X0.parcel, now, f, v, A), pY = (top.P.t + top.P.b) / 2;
  ctx.strokeStyle = C.red; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(top.x(X0.parcel), top.P.t); ctx.lineTo(top.x(X0.parcel), top.P.b); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(top.x(px), pY, 6, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();

  const mid = panel(ctx, W, { top: 162, bottom: 222, xMin: X0.min, xMax: X0.max, yMin: -1.25, yMax: 1.25, yTicks: [0], xTicks: xt, xLabel: v => fmt(v, 1), title: t('c0b'), left: 58 });
  curve(ctx, mid, x => M.pressure(x, now, f, v), X0.min, X0.max, 400, C.cyan, 2);
  comps.forEach(xc => { if (xc >= X0.min && xc <= X0.max) { ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(mid.x(xc), mid.y(1), 3.5, 0, 7); ctx.fill(); } });

  // Film: now at the top, older moments further down; only the time since the last clear is drawn.
  const span = X0.span, tA = Math.max(s0.t0, now - span);
  const film = panel(ctx, W, { top: 278, bottom: H - 26, xMin: X0.min, xMax: X0.max, yMin: -span * 1000, yMax: 0, yTicks: [0, -10, -20], yLabel: q => (q === 0 ? t('now') : fmt(q) + ' ms'), xTicks: xt, xLabel: v => fmt(v, 1), title: t('c0c'), left: 58 });
  // all three panels share a 58 px left margin so their position axes line up
  const fy = tt => film.y((tt - now) * 1000);
  ctx.save(); clipTo(ctx, film);
  if (now > tA) {
    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.85;
    M.compressions(tA, f, v, X0.min - lam - v * (now - tA), X0.max + lam).forEach(xa => {
      const xb = xa + v * (now - tA);
      ctx.beginPath(); ctx.moveTo(film.x(xa), fy(tA)); ctx.lineTo(film.x(xb), fy(now)); ctx.stroke();
    });
    ctx.globalAlpha = 1; ctx.strokeStyle = C.red; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const tt = tA + (now - tA) * i / 300, X = film.x(X0.parcel + M.displacement(X0.parcel, tt, f, v, A)); if (i) ctx.lineTo(X, fy(tt)); else ctx.moveTo(X, fy(tt)); }
    ctx.stroke();
  }
  ctx.restore();
  if (updateText) {
    const rec = now - s0.t0;
    $('r0').textContent = t('s0readout', { t: fmt(rec * 1000, 1), d: fmt(v * rec, 2), v: fmt(v, 0), a: fmt(A, 2), f, nm: fmt(M.realDisplacement(60, f) * 1e9, 0) });
  }
}
function running0() { return s0.want && s0.inView && !document.hidden; }
function loop0(nowMs) {
  const dt = Math.min(0.05, (nowMs - s0.last) / 1000); s0.last = nowMs;
  s0.t += dt / M.SLOW;
  const text = nowMs - s0.lastText > 250; if (text) s0.lastText = nowMs;
  draw0(text);
  s0.raf = running0() ? requestAnimationFrame(loop0) : null;
}
function sync0() {
  $('play0').textContent = t(s0.want ? 'pause' : 'play');
  $('play0').setAttribute('aria-pressed', s0.want ? 'true' : 'false');
  if (running0() && !s0.raf) { s0.last = performance.now(); s0.raf = requestAnimationFrame(loop0); }
  if (!running0() && s0.raf) { cancelAnimationFrame(s0.raf); s0.raf = null; draw0(); }
}

/* ---------- step 1: one microphone, frequency and period ---------- */
const s1 = { committed: 250, prev: null };
function draw1() {
  const f = num('f1'), T = 1 / f, win = 0.02;
  $('f1v').textContent = f + ' Hz';
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = panel(ctx, W, { top: 64, titleY: 17, bottom: H - 26, xMin: 0, xMax: win * 1000, yMin: -1.25, yMax: 1.25, yTicks: [-1, 0, 1], xTicks: ticks(0, 20, W - 58, 30, [2, 5, 10]), title: t('c1a') });
  if (s1.prev !== null && s1.prev !== f) curve(ctx, m, ms => M.micPressure(ms / 1000, s1.prev), 0, 20, 1200, C.ghost, 1.4, [5, 4]);
  curve(ctx, m, ms => M.micPressure(ms / 1000, f), 0, 20, 1600, C.cyan, 2.2);
  const cr = M.crestTimes(f, win), a = m.x(cr[0] * 1000), b = m.x(cr[1] * 1000), yb = m.P.t - 6;
  vline(ctx, a, yb, m.y(1), C.orange, 1.2, [3, 3], 0.8); vline(ctx, b, yb, m.y(1), C.orange, 1.2, [3, 3], 0.8);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a, yb + 4); ctx.lineTo(a, yb); ctx.lineTo(b, yb); ctx.lineTo(b, yb + 4); ctx.stroke(); ctx.restore();
  // bracket label: its own row between the title row and the plot, kept inside the canvas
  const label = 'T = ' + fmt(T * 1000, 2) + ' ms';
  ctx.save(); ctx.font = '600 12px system-ui,sans-serif'; const lw = ctx.measureText(label).width; ctx.restore();
  const cx = Math.max(m.P.l + lw / 2, Math.min(W - 8 - lw / 2, (a + b) / 2));
  fitText(ctx, label, cx, yb - 6, W - 16, { color: C.orange, align: 'center' });
  const note = M.nearestNote(f);
  $('r1').textContent = t('s1readout', { f, T: fmt(T * 1000, 2), n: fmt(f * win, 1), note: note.name, nf: fmt(note.f, 1) });
}

/* ---------- step 2: one period moves every compression one wavelength ---------- */
const X2 = { min: 0, max: 10, start: 1 };
const s2 = { p: 0 };
function draw2() {
  const f = num('f2'), T = 1 / f, tt = s2.p * T;
  $('f2v').textContent = f + ' Hz';
  const { ctx, W } = fitCanvas($('c2'));
  const names = [t('mAir'), t('mWater'), t('mSteel')];
  const moved = [];
  M.MEDIA.forEach((med, i) => {
    const lam = med.v / f, top = 26 + i * 102, last = i === M.MEDIA.length - 1;
    const m = panel(ctx, W, { top, bottom: top + 62, xMin: X2.min, xMax: X2.max, yMin: -1.3, yMax: 1.3, yTicks: [0], xTicks: last ? ticks(0, 10, W - 58, 30, [1, 2, 5]) : null, title: t('stripTitle', { name: names[i], v: fmt(med.v, 0), lam: fmt(lam, 2) }) });
    curve(ctx, m, x => M.pressureFrom(x, tt, f, med.v, X2.start), X2.min, X2.max, 700, C.cyan, 2);
    vline(ctx, m.x(X2.start), m.P.t, m.P.b, C.ghost, 1.4, [4, 4], 0.9);
    const xc = X2.start + lam * s2.p; moved.push(lam * s2.p);
    ctx.save(); clipTo(ctx, m);
    if (s2.p > 0) {
      const xe = Math.min(xc, X2.max), Y = m.y(1.12);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.x(X2.start), Y); ctx.lineTo(m.x(xe), Y); ctx.stroke();
      if (xc > X2.max) { ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(m.P.r, Y); ctx.lineTo(m.P.r - 8, Y - 5); ctx.lineTo(m.P.r - 8, Y + 5); ctx.closePath(); ctx.fill(); }
    }
    if (xc <= X2.max) { ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(m.x(xc), m.y(1), 5.5, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.restore();
  });
  const lines = M.MEDIA.map((med, i) => t('s2line', { name: names[i], lam: fmt(med.v / f, 2) })).join(' · ');
  const waterOut = M.MEDIA[1].v / f > X2.max - X2.start;
  $('r2').textContent = t('s2readout', { f, T: fmt(T * 1000, 2), lines, p: fmt(s2.p, 2), da: fmt(moved[0], 2), dw: fmt(moved[1], 2), ds: fmt(moved[2], 2), out: t(waterOut ? 's2out' : 's2outSteel') });
  $('r2b').textContent = t('s2range', { l1: fmt(M.MEDIA[0].v / 20, 1), l2: fmt(M.MEDIA[0].v / 20000 * 100, 1) });
}

/* ---------- step 3: loudness falls 6 dB per doubling of distance ---------- */
const s3 = { dots: new Set() };
const F3 = 250;
function draw3() {
  const r = num('r3s'), L1 = num('L3'), L = M.levelAt(L1, r), pk1 = Math.SQRT2 * M.prms(L1), pk = Math.SQRT2 * M.prms(L);
  $('r3v').textContent = fmt(r, 1) + ' m'; $('L3v').textContent = L1 + ' dB';
  s3.dots.add(r);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: 146, xMin: 0, xMax: 12, yMin: -pk1 * 1.2, yMax: pk1 * 1.2, yTicks: [-pk1, 0, pk1], yLabel: v => (v === 0 ? '0' : (v < 0 ? '−' : '') + sig(Math.abs(v))), xTicks: ticks(0, 12, W - 58, 30, [2, 4, 6]), title: t('c3a'), left: 54 });
  curve(ctx, A, ms => pk1 * Math.sin(2 * Math.PI * F3 * ms / 1000), 0, 12, 600, C.ghost, 1.4, [5, 4]);
  curve(ctx, A, ms => pk * Math.sin(2 * Math.PI * F3 * ms / 1000), 0, 12, 600, C.cyan, 2.2);
  const B = panel(ctx, W, { top: 194, bottom: H - 26, xMin: 0, xMax: 32, yMin: 20, yMax: 110, yTicks: [20, 40, 60, 80, 100], xTicks: ticks(0, 32, W - 66, 28, [4, 8, 16]), title: t('c3b'), left: 54 });
  ctx.save(); clipTo(ctx, B); ctx.strokeStyle = C.red; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(B.P.l, B.y(85)); ctx.lineTo(B.P.r, B.y(85)); ctx.stroke(); ctx.restore();
  curve(ctx, B, rr => M.levelAt(L1, Math.max(1, rr)), 1, 32, 400, C.orange, 2);
  ctx.save();
  [...s3.dots].forEach(q => { if (q === r) return; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(B.x(q), B.y(M.levelAt(L1, q)), 3.4, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(B.x(r), B.y(L), 6, 0, 7); ctx.fill(); ctx.restore();
  vline(ctx, B.x(r), B.P.t, B.P.b, C.cyan, 1.2, [4, 4], 0.6);
  $('r3').textContent = t('s3readout', { L1, r: fmt(r, 1), L: fmt(L, 1), pk: sig(pk, 2), risk: L >= 85 ? t('s3risk') : '' });
}

/* ---------- step 4: timbre is the mix of harmonics ---------- */
const F0 = 220, NH = 6;
const s4 = { a: M.PRESETS.pure.slice() };
function buildHarmControls() {
  const box = $('hControls');
  for (let n = 1; n <= NH; n++) {
    const lab = document.createElement('label');
    lab.innerHTML = `<span class="h-name"></span><output id="h${n}v"></output><input id="h${n}" data-step="4" type="range" min="0" max="1" step="0.05" value="${s4.a[n - 1]}">`;
    box.appendChild(lab);
    lab.querySelector('input').addEventListener('input', e => { s4.a[n - 1] = Number(e.target.value); draw4(); });
  }
}
function setPreset(name) { s4.a = M.PRESETS[name].slice(); s4.a.forEach((v, i) => { $('h' + (i + 1)).value = v; }); draw4(); }
function draw4() {
  const a = s4.a, Tr = M.repeatPeriod(a, F0), peak = M.peakOf(a, F0);
  for (let n = 1; n <= NH; n++) { $('h' + n + 'v').textContent = fmt(a[n - 1], 2); $('h' + n).closest('label').querySelector('.h-name').textContent = t('harm', { n, f: n * F0 }); }
  const same = (p) => M.PRESETS[p].every((v, i) => Math.abs(v - a[i]) < 1e-9);
  [['pPure', 'pure'], ['pOdd', 'odd'], ['pAll', 'all'], ['pBright', 'bright']].forEach(([id, p]) => $(id).setAttribute('aria-pressed', same(p) ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c4'));
  const span = 3000 / F0, yM = Math.max(1.25, Math.ceil(peak * 1.15 * 2) / 2);
  const A = panel(ctx, W, { top: 26, bottom: 176, xMin: 0, xMax: span, yMin: -yM, yMax: yM, yTicks: [-yM, 0, yM], xTicks: ticks(0, span, W - 58, 30, [2, 4, 5]), title: t('c4a') });
  curve(ctx, A, ms => Math.sin(2 * Math.PI * F0 * ms / 1000), 0, span, 600, C.ghost, 1.4, [5, 4]);
  curve(ctx, A, ms => M.harmonicWave(a, F0, ms / 1000), 0, span, 1200, C.cyan, 2.2);
  if (isFinite(Tr)) for (let q = 0; q * Tr * 1000 <= span + 1e-9; q++) {
    const X = A.x(q * Tr * 1000);
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(X, A.P.t); ctx.lineTo(X, A.P.t + 10); ctx.moveTo(X, A.P.b); ctx.lineTo(X, A.P.b - 10); ctx.stroke(); ctx.restore();
  }
  const fx = range(F0, NH * F0, F0);
  const B = panel(ctx, W, { top: 222, bottom: H - 26, xMin: 0, xMax: (NH + 0.6) * F0, yMin: 0, yMax: 1.1, yTicks: [0, 0.5, 1], xTicks: W < 420 ? fx.filter((_, i) => i % 2 === 0) : fx, xLabel: v => String(v), title: t('c4b') });
  const bw = Math.min(26, (B.x(F0) - B.x(0)) * 0.5);
  a.forEach((v, i) => { const X = B.x((i + 1) * F0); ctx.fillStyle = C.green; ctx.globalAlpha = v > 0 ? 0.9 : 0.25; ctx.fillRect(X - bw / 2, B.y(v), bw, B.y(0) - B.y(v)); if (v === 0) ctx.fillRect(X - bw / 2, B.y(0) - 1.5, bw, 1.5); });
  ctx.globalAlpha = 1;
  const k = a.filter(v => v > 0).length;
  if (!k) { $('r4').textContent = t('s4silent'); return; }
  const g = Math.round(1 / (Tr * F0));
  $('r4').textContent = t('s4readout', { k, T: fmt(Tr * 1000, 2), fr: fmt(1 / Tr, 0), missing: a[0] === 0 ? t('s4missing', { g }) : '' });
}

/* ---------- step 5: echo ---------- */
const s5 = { p: 1 };
function draw5() {
  const d = num('d5'), Tc = num('T5'), v = M.vAir(Tc), dt = M.echoDelay(d, Tc), tNow = s5.p * dt;
  $('d5v').textContent = d + ' m'; $('T5v').textContent = fmt(Tc, 0) + ' ℃';
  const { ctx, W, H } = fitCanvas($('c5'));
  const A = panel(ctx, W, { top: 26, bottom: 100, xMin: -6, xMax: 212, yMin: 0, yMax: 1, xTicks: ticks(0, 200, W - 58, 34, [25, 50, 100]), xLabel: q => String(q), title: t('c5a') });
  ctx.save(); clipTo(ctx, A);
  ctx.fillStyle = C.raw; ctx.fillRect(A.x(d), A.P.t + 4, Math.max(6, A.x(d + 5) - A.x(d)), A.P.b - A.P.t - 8);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(A.x(0), A.P.t + 8); ctx.lineTo(A.x(0), A.P.b - 8); ctx.stroke();
  if (s5.p < 1) { const xp = M.pulseDistance(tNow, d, Tc); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(A.x(xp), A.P.t + 6); ctx.lineTo(A.x(xp), A.P.b - 6); ctx.stroke(); }
  ctx.restore();
  const B = panel(ctx, W, { top: 146, bottom: H - 26, xMin: 0, xMax: 1.3, yMin: 0, yMax: 210, yTicks: [0, 100, 200], xTicks: ticks(0, 1.3, W - 58, 30, [0.1, 0.2, 0.5]), xLabel: q => fmt(q, 1), title: t('c5b') });
  ctx.save(); clipTo(ctx, B);
  ctx.fillStyle = 'rgba(154,170,189,0.16)'; ctx.fillRect(B.x(0), B.P.t, B.x(M.ECHO_GAP) - B.x(0), B.P.b - B.P.t);
  ctx.strokeStyle = C.raw; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(B.P.l, B.y(d)); ctx.lineTo(B.P.r, B.y(d)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath();
  for (let i = 0; i <= 200; i++) { const q = tNow * i / 200, X = B.x(q), Y = B.y(M.pulseDistance(q, d, Tc)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke();
  if (s5.p >= 1) { vline(ctx, B.x(dt), B.P.t, B.P.b, C.orange, 1.4, [4, 3], 0.9); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(B.x(dt), B.y(0), 5, 0, 7); ctx.fill(); }
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(B.x(0), B.y(0), 5, 0, 7); ctx.fill();
  ctx.restore();
  const sep = dt >= M.ECHO_GAP ? t('s5sep') : t('s5merge', { dmin: fmt(M.minEchoDistance(Tc), 1) });
  $('r5').textContent = t('s5readout', { T: fmt(Tc, 0), v: fmt(v, 1), d, dt: fmt(dt, 3), sep });
  const qd = M.distanceFromDelay(M.QUIZ.dt, M.QUIZ.Tc);
  $('qa').textContent = t('quizA', { a: fmt(2 * qd, 0) }); $('qb').textContent = t('quizB', { b: fmt(qd / 2, 0) }); $('qc').textContent = t('quizC', { c: fmt(qd, 0) });
  if ($('quizFeedback').dataset.state) showQuiz();
}
function showQuiz() {
  const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'c';
  const v = M.vAir(M.QUIZ.Tc), qd = M.distanceFromDelay(M.QUIZ.dt, M.QUIZ.Tc);
  $('quizFeedback').textContent = ok ? t('correct', { v: fmt(v, 1), tot: fmt(v * M.QUIZ.dt, 0), d: fmt(qd, 0) }) : t('wrong');
  $('quizFeedback').style.color = ok ? C.green : C.orange;
  $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
}

function refresh() { draw0(); sync0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildHarmControls();
  // step 0
  s0.want = !reduceMotion();
  if (!s0.want) s0.t = X0.span; // reduced motion: a still frame with a full film strip
  // a new frequency starts a new film; while paused the film is filled at once (it is computed, not recorded)
  $('f0').addEventListener('input', () => { s0.t0 = s0.want ? s0.t : s0.t - X0.span; draw0(); });
  $('play0').addEventListener('click', () => { s0.want = !s0.want; sync0(); });
  $('quarter0').addEventListener('click', () => { s0.want = false; sync0(); s0.t += 0.25 / num('f0'); draw0(); });
  $('clear0').addEventListener('click', () => { s0.t0 = s0.t; draw0(); });
  // step 1
  $('f1').addEventListener('input', draw1);
  $('f1').addEventListener('change', () => { const f = num('f1'); if (f !== s1.committed) { s1.prev = s1.committed; s1.committed = f; } draw1(); });
  // step 2
  $('f2').addEventListener('input', () => { stopAnim('s2'); s2.p = 0; draw2(); });
  $('run2').addEventListener('click', () => { s2.p = 0; animate('s2', 3200, p => { s2.p = p; draw2(); }); });
  // step 3
  $('r3s').addEventListener('input', draw3);
  $('L3').addEventListener('input', () => { s3.dots.clear(); draw3(); });
  $('clear3').addEventListener('click', () => { s3.dots.clear(); draw3(); });
  // step 4
  $('pPure').addEventListener('click', () => setPreset('pure'));
  $('pOdd').addEventListener('click', () => setPreset('odd'));
  $('pAll').addEventListener('click', () => setPreset('all'));
  $('pBright').addEventListener('click', () => setPreset('bright'));
  // step 5
  ['d5', 'T5'].forEach(id => $(id).addEventListener('input', () => { stopAnim('s5'); s5.p = 1; draw5(); }));
  $('clap5').addEventListener('click', () => { const dt = M.echoDelay(num('d5'), num('T5')); s5.p = 0; animate('s5', Math.max(600, dt * 2000), p => { s5.p = p; draw5(); }); });
  $('checkQuiz').addEventListener('click', showQuiz);

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    // the step-0 loop only runs while its section is on screen
    new IntersectionObserver(es => es.forEach(e => { s0.inView = e.isIntersecting; sync0(); }), { threshold: 0.05 }).observe($('step0'));
  } else s0.inView = true;
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); sync0(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
