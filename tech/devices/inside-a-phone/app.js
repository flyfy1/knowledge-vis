/* Wiring, drawing and i18n for "Ten ideas inside one phone". All visible text comes from window.ESSAY_COPY. */
(() => {
'use strict';
const M = window.PhoneModels;
const COPY = window.ESSAY_COPY || {};
const $ = id => document.getElementById(id);
const C = { bg: '#0f1219', line: '#2b3242', grid: 'rgba(43,50,66,.75)', ink: '#ebe8e0', mute: '#a7adbb', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const SANS = '-apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif';
const FONT = '12.5px ' + SANS;
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (x, d = 0) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 1) => fmt(x * 100, d) + '%';

/* ───────── language ───────── */
let memLang = null;
const readLang = () => { try { return localStorage.getItem('knowledge-lang') || memLang; } catch (e) { return memLang; } };
const writeLang = v => { memLang = v; try { localStorage.setItem('knowledge-lang', v); } catch (e) { /* storage blocked: keep in memory */ } };
let lang = readLang() || ((navigator.language || 'zh').toLowerCase().startsWith('zh') ? 'zh' : 'en');
if (lang !== 'zh' && lang !== 'en') lang = 'zh';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}
const updaters = [];
function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-content]').forEach(e => { e.setAttribute('content', t(e.dataset.i18nContent)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  updaters.forEach(f => f());
  sims.forEach(s => { s.dirty = true; drawNow(s); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + simulation registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle'; c.lineCap = 'round';
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { const s = sims.find(s => s.cv === e.target); if (s) { s.vis = e.isIntersecting; s.dirty = true; } }), { rootMargin: '120px' });
function reg(cv, o) { o.cv = cv; o.vis = false; o.dirty = true; sims.push(o); io.observe(cv); return o; }
// static redraws are cheap; drawing at once keeps canvases right even before they scroll into view
function drawNow(o) { if (o.cv.getBoundingClientRect().width > 0) { o.draw(); o.dirty = false; } }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const onInput = (el, fn) => { el.addEventListener('input', fn); el.addEventListener('change', fn); };
function axes(c, L, T, R, B) { c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B); c.stroke(); }
function label(c, s, x, y, align, col) { c.fillStyle = col || C.mute; c.textAlign = align || 'left'; c.fillText(s, x, y); }
function niceStep(span, n) { const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p; }

/* ───────── 01 GPS ───────── */
const gps = (() => {
  const cv = $('gpsCv'), sB = $('gpsBias'), sG = $('gpsGuess'), sN = $('gpsNoise'), sS = $('gpsSpread'), btn = $('gpsSolve');
  let g = +sG.value, solved = false, target = null, Wcur = null;
  const par = () => ({ spread: +sS.value, biasNs: +sB.value, noiseNs: +sN.value });
  function Wtarget() {
    const p = par();
    if (solved) { const fx = M.gpsFix(p); return Math.max(30, 3 * fx.posErr); }
    const ext = Math.max(M.gpsMismatch(p, p.biasNs - 600).spread, M.gpsMismatch(p, p.biasNs + 600).spread, M.gpsMismatch(p, g).spread);
    return Math.max(40, 0.62 * ext);
  }
  const o = reg(cv, {
    step(dt) {
      let moving = false;
      if (target != null) { g += (target - g) * Math.min(1, dt * 3.5); if (Math.abs(target - g) < 0.05) { g = target; target = null; } moving = true; upd(true); }
      const wt = Wtarget(); if (Wcur == null) Wcur = wt;
      if (Math.abs(wt - Wcur) > 0.01 * wt) { Wcur += (wt - Wcur) * Math.min(1, dt * 4); moving = true; } else Wcur = wt;
      return moving;
    },
    draw() {
      const { c, w, h } = fit(cv), p = par(), mm = M.gpsMismatch(p, g);
      if (Wcur == null) Wcur = Wtarget();
      const W = Wcur, cx = w / 2, cy = h / 2 + 8, k = Math.min(w, h) * 0.46 / W;
      const X = x => cx + x * k, Y = y => cy - y * k;
      c.clearRect(0, 0, w, h);
      c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip();
      // grid
      const gs = niceStep(W, 2); c.strokeStyle = 'rgba(43,50,66,.45)'; c.lineWidth = 1;
      for (let v = -Math.ceil(w / k / gs) * gs; v <= w / k; v += gs) { c.beginPath(); c.moveTo(X(v), 0); c.lineTo(X(v), h); c.stroke(); c.beginPath(); c.moveTo(0, Y(v)); c.lineTo(w, Y(v)); c.stroke(); }
      // miss triangle
      const pts = mm.pts;
      if (mm.spread > 0.5) { c.fillStyle = 'rgba(240,122,109,.28)'; c.strokeStyle = C.red; c.lineWidth = 1.5; c.beginPath(); pts.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](X(q[0]), Y(q[1]))); c.closePath(); c.fill(); c.stroke(); }
      // the three circles near the receiver (radius ~25 000 km, straight to well under a pixel here)
      const cols = [C.cyan, C.gold, C.violet], r0 = [0, M.R_E];
      mm.sats.forEach((s, i) => {
        const dx = r0[0] - s[0], dy = r0[1] - s[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, off = mm.radii[i] - d;
        const px = ux * off, py = uy * off, L = 4 * W;
        c.strokeStyle = cols[i]; c.lineWidth = 2.2; c.beginPath(); c.moveTo(X(px - uy * L), Y(py + ux * L)); c.lineTo(X(px + uy * L), Y(py - ux * L)); c.stroke();
      });
      // you, and the solved fix
      c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(X(0), Y(0), 7, 0, 6.283); c.stroke();
      if (solved && target == null) { const fx = M.gpsFix(p), ex = fx.x, ey = fx.y - M.R_E; c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.moveTo(X(ex) - 6, Y(ey) - 6); c.lineTo(X(ex) + 6, Y(ey) + 6); c.moveTo(X(ex) + 6, Y(ey) - 6); c.lineTo(X(ex) - 6, Y(ey) + 6); c.stroke(); }
      c.restore();
      // overview inset: Earth and the three satellites (to scale)
      const ir = Math.min(52, w * 0.13), ix = ir + 10, iy = ir + 10, ks = ir / (M.A_GPS * 1.05);
      c.fillStyle = 'rgba(15,18,25,.92)'; c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.rect(4, 4, 2 * ir + 12, 2 * ir + 12); c.fill(); c.stroke();
      c.fillStyle = '#1d2a3c'; c.beginPath(); c.arc(ix, iy, M.R_E * ks, 0, 6.283); c.fill();
      c.strokeStyle = 'rgba(167,173,187,.35)'; c.beginPath(); c.arc(ix, iy, M.A_GPS * ks, 0, 6.283); c.stroke();
      const rx = ix, ry = iy - M.R_E * ks;
      mm.sats.forEach((s, i) => { const sx = ix + s[0] * ks, sy = iy - s[1] * ks; c.strokeStyle = cols[i]; c.globalAlpha = .6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(rx, ry); c.stroke(); c.globalAlpha = 1; c.fillStyle = cols[i]; c.beginPath(); c.arc(sx, sy, 3.5, 0, 6.283); c.fill(); });
      c.fillStyle = C.ink; c.beginPath(); c.arc(rx, ry, 2.5, 0, 6.283); c.fill();
      // scale bar
      const sb = niceStep(W, 1.6), bx = w - 16, by = h - 18;
      c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(bx - sb * k, by); c.lineTo(bx, by); c.moveTo(bx - sb * k, by - 5); c.lineTo(bx - sb * k, by + 5); c.moveTo(bx, by - 5); c.lineTo(bx, by + 5); c.stroke();
      label(c, t('gps.cv.scale', { m: fmt(sb) }), bx - sb * k / 2, by - 14, 'center', C.ink);
    }
  });
  function upd(fromAnim) {
    const p = par();
    if (!fromAnim && solved && target == null) g = M.gpsFix(p).clockNs;
    sG.value = Math.round(g);
    $('gpsBiasO').textContent = t('gps.o.ns', { v: fmt(p.biasNs) });
    $('gpsGuessO').textContent = t('gps.o.ns', { v: fmt(g) });
    $('gpsNoiseO').textContent = t('gps.o.ns', { v: fmt(p.noiseNs) });
    $('gpsSpreadO').textContent = t('gps.o.deg', { v: p.spread });
    const mm = M.gpsMismatch(p, g), fx = M.gpsFix(p), show = solved && target == null;
    $('gpsMiss').textContent = fmt(mm.spread, 1);
    $('gpsClk').textContent = show ? t('gps.o.ns', { v: fmt(fx.clockNs, 1) }) : t('gps.r.none');
    $('gpsErr').textContent = show ? fmt(fx.posErr, 1) : t('gps.r.none');
    $('gpsScale').textContent = fmt(2 * (Wcur || Wtarget()));
    const say = $('gpsSay');
    if (mm.spread > 0.5 && p.noiseNs > 0 && Math.abs(p.biasNs - g) < 1) say.innerHTML = t('gps.say.missNoise', { miss: fmt(mm.spread, 1) });
    else if (mm.spread > 0.5) { const off = Math.abs(p.biasNs - g); say.innerHTML = t('gps.say.miss', { miss: fmt(mm.spread, 1), off: fmt(off), dist: fmt(off * 1e-9 * M.C, 1) }); }
    else if (p.noiseNs === 0) say.innerHTML = t('gps.say.meet', { clk: fmt(g, 1) });
    else say.innerHTML = t('gps.say.noise', { err: fmt(fx.posErr, 1), noise: p.noiseNs, nm: fmt(p.noiseNs * 1e-9 * M.C, 1), spread: p.spread });
    if (!fromAnim) drawNow(o);
  }
  sG.addEventListener('input', () => { solved = false; target = null; g = +sG.value; upd(); });
  [sB, sN, sS].forEach(e => onInput(e, () => upd()));
  btn.addEventListener('click', () => { solved = true; const v = M.gpsFix(par()).clockNs; if (reduce) { g = v; target = null; Wcur = Wtarget(); } else target = v; upd(); });
  updaters.push(() => upd());
  return o;
})();

/* ───────── 02a accelerometer ───────── */
(() => {
  const cv = $('accCv'), sT = $('accTilt'), bD = $('accDrop');
  let fall = null, staticFall = false; // fall: {t, y, v}
  const freeFalling = () => staticFall || (fall && fall.phase === 'fall');
  const o = reg(cv, {
    step(dt) {
      if (!fall) return false;
      fall.t += dt;
      if (fall.phase === 'fall') { fall.v += 900 * dt; fall.y += fall.v * dt; if (fall.t > 0.42) { fall.phase = 'held'; fall.t = 0; upd(); } }
      else if (fall.phase === 'held') { if (fall.t > 0.9) { fall.phase = 'back'; fall.t = 0; } }
      else { fall.y *= Math.max(0, 1 - dt * 5); if (fall.y < 0.5) { fall = null; upd(); } }
      return true;
    },
    draw() {
      const { c, w, h } = fit(cv), th = +sT.value * Math.PI / 180, ff = freeFalling();
      const yOff = fall ? Math.min(fall.y, h * 0.3) : 0, cx = w / 2, cy = h * 0.42 + yOff;
      const rd = M.accelReading(+sT.value, ff), ex = 2.4; // px per m/s² of mass offset (exaggerated)
      c.clearRect(0, 0, w, h);
      // floor shadow
      c.fillStyle = 'rgba(43,50,66,.6)'; c.fillRect(0, h - 14, w, 14);
      // gravity arrow (world down), drawn beside the phone
      const gx = Math.max(30, cx - Math.min(w * 0.32, 170));
      c.strokeStyle = C.mute; c.fillStyle = C.mute; c.lineWidth = 3; arrow(c, gx, h * 0.18, gx, h * 0.18 + 70);
      c.save(); c.translate(cx, cy); c.rotate(-th);
      const PW = Math.min(90, h * 0.3), PH = PW * 1.9;
      c.fillStyle = '#1a1f2b'; c.strokeStyle = C.ink; c.lineWidth = 2; roundRect(c, -PW / 2, -PH / 2, PW, PH, 12); c.fill(); c.stroke();
      c.fillStyle = C.ink; c.beginPath(); c.arc(0, -PH / 2 + 9, 2.5, 0, 6.283); c.fill(); // top marker (the phone's "up")
      // sensor frame and proof mass (mass sits opposite to the reading)
      const S = PW * 0.62, mx = -rd.x * ex, my = rd.y * ex; // phone frame: x right, y down on screen
      c.strokeStyle = C.line; c.lineWidth = 1.5; c.strokeRect(-S / 2, -S / 2, S, S);
      const m = S * 0.26;
      c.strokeStyle = 'rgba(99,199,230,.7)'; c.lineWidth = 1.5;
      spring(c, 0, -S / 2, mx, my - m / 2); spring(c, 0, S / 2, mx, my + m / 2); spring(c, -S / 2, 0, mx - m / 2, my); spring(c, S / 2, 0, mx + m / 2, my);
      c.fillStyle = C.cyan; c.fillRect(mx - m / 2, my - m / 2, m, m);
      c.restore();
      // reading arrow, in world frame (rotate phone-frame reading back)
      // phone-local (a, b) → screen under rotate(−θ): (a·cosθ + b·sinθ, −a·sinθ + b·cosθ); the reading is (x, −y) locally
      if (rd.mag > 0.01) {
        const a = rd.x, b = -rd.y, len = 6.5, vx = a * Math.cos(th) + b * Math.sin(th), vy = -a * Math.sin(th) + b * Math.cos(th);
        c.strokeStyle = C.gold; c.fillStyle = C.gold; c.lineWidth = 3.5; arrow(c, cx, cy, cx + vx * len, cy + vy * len);
      }
    }
  });
  function upd() {
    const ff = freeFalling(), rd = M.accelReading(+sT.value, ff);
    $('accTiltO').textContent = t('acc.o.deg', { v: sT.value });
    $('accX').textContent = fmt(rd.x, 2); $('accY').textContent = fmt(rd.y, 2); $('accM').textContent = fmt(rd.mag, 2);
    $('accD').textContent = fmt(M.proofDisplacement(rd.mag, 5000) * 1e9, 1);
    $('accSay').innerHTML = ff ? t('acc.say.fall') : t('acc.say.still', { tilt: sT.value, x: fmt(rd.x, 2), y: fmt(rd.y, 2) });
    bD.textContent = t(reduce && staticFall ? 'acc.c.dropOn' : 'acc.c.drop'); bD.setAttribute('aria-pressed', String(!!(staticFall || fall)));
    drawNow(o);
  }
  onInput(sT, upd);
  bD.addEventListener('click', () => { if (reduce) staticFall = !staticFall; else if (!fall) fall = { t: 0, y: 0, v: 0, phase: 'fall' }; upd(); });
  updaters.push(upd);
})();
function arrow(c, x0, y0, x1, y1) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), hs = Math.min(10, L * 0.4);
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * hs * 0.6, y1 - Math.sin(a) * hs * 0.6); c.stroke();
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * hs, y1 - Math.sin(a - 0.45) * hs); c.lineTo(x1 - Math.cos(a + 0.45) * hs, y1 - Math.sin(a + 0.45) * hs); c.closePath(); c.fill();
}
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function spring(c, x0, y0, x1, y1) {
  const n = 7, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, a = 4;
  c.beginPath(); c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) { const f = i / n, s = i % 2 ? a : -a; c.lineTo(x0 + dx * f + nx * s, y0 + dy * f + ny * s); }
  c.lineTo(x1, y1); c.stroke();
}

/* ───────── 02b drift from double integration ───────── */
(() => {
  const cv = $('driftCv'), sB = $('driftBias'), sN = $('driftNoise'), cG = $('driftGps'), TMAX = 60, SPEED = 4;
  let S = M.driftInit();
  const opts = () => ({ bias: +sB.value, noise: +sN.value, gps: cG.checked, tMax: TMAX });
  const reset = () => { S = M.driftInit(); if (reduce) M.driftStep(S, TMAX, opts()); upd(); };
  const o = reg(cv, {
    step(dt) { if (S.t >= TMAX - 1e-9) return false; M.driftStep(S, dt * SPEED, opts()); upd(true); return true; },
    draw() {
      const { c, w, h } = fit(cv), b = +sB.value, L = 54, R = w - 14, T = 16, B = h - 42;
      let hi = Math.max(3, 1.12 * M.driftBias(b, TMAX)), lo = 0;
      for (const [, x] of S.trace) { hi = Math.max(hi, 1.12 * x); lo = Math.min(lo, 1.12 * x); }
      lo = Math.min(lo, -0.12 * hi);
      const X = tt => L + (R - L) * tt / TMAX, Y = v => B - (B - T) * (v - lo) / (hi - lo);
      c.clearRect(0, 0, w, h); axes(c, L, T, R, B);
      const st = niceStep(hi - lo, 3);
      for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(R, Y(v)); c.stroke(); label(c, t('drift.cv.m', { v: fmt(v, st < 1 ? 1 : 0) }), L - 6, Y(v), 'right'); }
      [0, 20, 40, 60].forEach(tt => label(c, String(tt), X(tt), B + 13, 'center'));
      label(c, t('drift.cv.t'), R, B + 30, 'right');
      // theory ½bt²
      c.setLineDash([5, 5]); c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath();
      for (let tt = 0; tt <= TMAX; tt += 0.5) c[tt ? 'lineTo' : 'moveTo'](X(tt), Y(M.driftBias(b, tt))); c.stroke(); c.setLineDash([]);
      c.strokeStyle = cG.checked ? C.cyan : C.gold; c.lineWidth = 2.5; c.beginPath();
      S.trace.forEach(([tt, x], i) => c[i ? 'lineTo' : 'moveTo'](X(tt), Y(x))); c.stroke();
    }
  });
  function upd(fromSim) {
    $('driftBiasO').textContent = t('drift.o.acc', { v: fmt(+sB.value, 3) });
    $('driftNoiseO').textContent = t('drift.o.acc', { v: fmt(+sN.value, 2) });
    $('driftT').textContent = fmt(S.t, 1); $('driftX').textContent = fmt(S.x, 2); $('driftTh').textContent = fmt(M.driftBias(+sB.value, S.t), 2);
    const say = cG.checked ? t('drift.say.gps', { x: fmt(Math.abs(S.x), 1) }) : t('drift.say', { x: fmt(S.x, 1) });
    if (!fromSim || Math.round(S.t * 10) % 10 === 0 || S.t >= TMAX - 1e-9) $('driftSay').innerHTML = say;
    if (!fromSim) drawNow(o);
  }
  [sB, sN].forEach(e => onInput(e, reset)); cG.addEventListener('change', reset); $('driftReset').addEventListener('click', reset);
  if (reduce) M.driftStep(S, TMAX, opts());
  updaters.push(() => upd());
})();

/* ───────── 03 touch ───────── */
(() => {
  const cv = $('touchCv'), sX = $('touchX'), sW = $('touchW'), sN = $('touchN'), R = M.rng(3), P = M.TOUCH.pitch, N = M.TOUCH.n;
  let sig = null, acc = 0; const worstCache = new Map();
  const worst = w => { const k = w.toFixed(1); if (!worstCache.has(k)) worstCache.set(k, M.touchWorstError(w)); return worstCache.get(k); };
  const sample = () => { sig = M.touchSignals(+sX.value, +sW.value, +sN.value, R); };
  const o = reg(cv, {
    step(dt) { if (reduce || +sN.value === 0) return false; acc += dt; if (acc < 1 / 30) return false; acc = 0; sample(); upd(true); return true; },
    draw() {
      const { c, w, h } = fit(cv), L = 64, Rr = w - 14, x0 = +sX.value, wd = +sW.value;
      const X = mm => L + (Rr - L) * mm / (N * P);
      const split = h * 0.56, base = split - 30, top = 34;
      c.clearRect(0, 0, w, h);
      // finger
      c.fillStyle = 'rgba(235,232,224,.16)'; c.strokeStyle = 'rgba(235,232,224,.5)'; c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(X(x0), top - 6, Math.max(6, (X(wd * 1.6) - X(0))), 16, 0, 0, 6.283); c.fill(); c.stroke();
      // glass and electrodes
      c.fillStyle = 'rgba(99,199,230,.08)'; c.fillRect(L, base, Rr - L, 6);
      for (let k = 0; k < N; k++) { c.fillStyle = C.line; c.fillRect(X((k + 0.5) * P) - (X(P) - X(0)) * 0.35, base + 8, (X(P) - X(0)) * 0.7, 6); }
      const s = sig || M.touchSignals(x0, wd, 0), e = M.touchEstimate(s), bh = base - top - 16;
      for (let k = 0; k < N; k++) { const v = Math.max(0, s[k]); c.fillStyle = C.cyan; c.globalAlpha = .85; c.fillRect(X((k + 0.5) * P) - 7, base - bh * Math.min(v, 1.1), 14, bh * Math.min(v, 1.1)); }
      c.globalAlpha = 1;
      c.strokeStyle = C.ink; c.lineWidth = 1.5; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(X(x0), top + 8); c.lineTo(X(x0), base + 20); c.stroke(); c.setLineDash([]);
      tri(c, X(e.peak), base + 22, C.red); tri(c, X(e.centroid), base + 22, C.gold);
      // error curves across the panel
      const eT = split + 8, eB = h - 40, mid = (eT + eB) / 2, lim = 3, Ye = v => mid - (eB - eT) / 2 * Math.max(-1, Math.min(1, v / lim));
      c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(L, eT, Rr - L, eB - eT);
      c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, mid); c.lineTo(Rr, mid); c.stroke();
      const curve = (fn, col) => { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); let first = true; for (let x = 0.5; x <= N * P - 0.5; x += 0.1) { const v = fn(M.touchEstimate(M.touchSignals(x, wd, 0))) - x; c[first ? 'moveTo' : 'lineTo'](X(x), Ye(v)); first = false; } c.stroke(); };
      curve(q => q.peak, 'rgba(240,122,109,.9)'); curve(q => q.centroid, C.gold);
      c.strokeStyle = C.ink; c.beginPath(); c.moveTo(X(x0), eT); c.lineTo(X(x0), eB); c.stroke();
      label(c, t('touch.cv.pm', { v: '+' + lim }), L - 6, eT + 8, 'right'); label(c, '0', L - 6, mid, 'right'); label(c, t('touch.cv.pm', { v: '−' + lim }), L - 6, eB - 8, 'right');
      [0, 10, 20, 30, 40].forEach(v => label(c, String(v), X(v), eB + 12, 'center'));
      label(c, t('touch.cv.x'), Rr, h - 9, 'right');
    }
  });
  function tri(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x - 7, y + 5); c.lineTo(x + 7, y + 5); c.closePath(); c.fill(); }
  function upd(fromSim) {
    if (!fromSim) sample();
    const x0 = +sX.value, e = M.touchEstimate(sig), wd = +sW.value, wo = worst(wd);
    $('touchXO').textContent = t('touch.o.mm', { v: fmt(x0, 1) }); $('touchWO').textContent = t('touch.o.mm', { v: fmt(wd, 1) }); $('touchNO').textContent = t('touch.o.noise', { v: fmt(+sN.value, 3) });
    $('touchPk').textContent = fmt(Math.abs(e.peak - x0), 2); $('touchCe').textContent = fmt(Math.abs(e.centroid - x0), 2); $('touchWorst').textContent = fmt(wo.centroid, 2);
    const lost = Math.max(...sig) < 3 * +sN.value;
    // The sentence quotes the noise-free errors at this position, so it never disagrees with the jittering tiles.
    const e0 = M.touchEstimate(M.touchSignals(x0, wd, 0)), noisy = +sN.value > 0;
    if (!fromSim) $('touchSay').innerHTML = lost ? t('touch.say.lost') : wd < 1.2 ? t('touch.say.narrow', { worst: fmt(wo.centroid, 1) }) : t(noisy ? 'touch.say.noisy' : 'touch.say', { pe: fmt(Math.abs(e0.peak - x0), 2), ce: fmt(Math.abs(e0.centroid - x0), 2) });
    drawNow(o);
  }
  [sX, sW, sN].forEach(e => onInput(e, () => upd()));
  // drag directly on the panel
  const at = ev => { const r = cv.getBoundingClientRect(), L = 64, Rr = r.width - 14, mm = (ev.clientX - r.left - L) / (Rr - L) * N * P; sX.value = Math.max(+sX.min, Math.min(+sX.max, mm)).toFixed(1); upd(); };
  cv.addEventListener('pointerdown', ev => { if (ev.clientY - cv.getBoundingClientRect().top > cv.clientHeight * 0.56) return; cv.setPointerCapture(ev.pointerId); at(ev); cv.onpointermove = at; });
  const stop = () => { cv.onpointermove = null; }; cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
  updaters.push(() => upd());
})();

/* ───────── 04 camera ───────── */
(() => {
  const cv = $('camCv'), sL = $('camLight'), sP = $('camPix'), sF = $('camFrames'), grey = M.camGreyPixels(), W = M.CAM.W, H = M.CAM.H;
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  let R = M.rng(1), st = M.camStackInit(), hist = [], acc = 0;
  const light = () => { const v = Math.pow(10, +sL.value); return v < 10 ? Math.round(v * 10) / 10 : Math.round(v); };
  const ppp = () => M.photonsPerPixel(light(), +sP.value);
  function addFrame() { M.camAddFrame(st, ppp(), R); hist.push([st.n, M.camMeasuredNoise(st, grey)]); }
  function reset() { R = M.rng(1); st = M.camStackInit(); hist = []; addFrame(); if (reduce) while (st.n < +sF.value) addFrame(); upd(); }
  const o = reg(cv, {
    step(dt) { if (st.n >= +sF.value) return false; acc += dt; if (acc < 1 / 8) return false; acc = 0; addFrame(); upd(true); return true; },
    draw() {
      const { c, w, h } = fit(cv), stacked = w < 560;
      c.clearRect(0, 0, w, h);
      // image
      const img = off.getContext('2d').createImageData(W, H), q = ppp();
      for (let k = 0; k < W * H; k++) { const v = st.n ? st.sum[k] / st.n / q : 0, g = Math.round(255 * Math.pow(Math.max(0, Math.min(1, v)), 1 / 2.2)); img.data[4 * k] = img.data[4 * k + 1] = img.data[4 * k + 2] = g; img.data[4 * k + 3] = 255; }
      off.getContext('2d').putImageData(img, 0, 0);
      let iw, ih, ix, iy, pL, pT, pR, pB;
      if (stacked) { ih = Math.min(h * 0.46, (w - 20) * H / W); iw = ih * W / H; ix = (w - iw) / 2; iy = 8; pL = 50; pT = iy + ih + 18; pR = w - 14; pB = h - 40; }
      else { ih = h - 24; iw = Math.min(w * 0.56, ih * W / H); ih = iw * H / W; ix = 10; iy = (h - ih) / 2; pL = ix + iw + 64; pT = 18; pR = w - 14; pB = h - 42; }
      c.imageSmoothingEnabled = false; c.drawImage(off, ix, iy, iw, ih);
      c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(ix + iw * 0.06, iy + ih * 0.58, iw * 0.24, ih * 0.34);
      // noise vs frames
      const th1 = M.camTheoryNoise(q, 1), top = Math.max(0.05, Math.min(1.2, th1 * 1.25, Math.max(...hist.map(p => p[1])) * 1.1));
      const X = n => pL + (pR - pL) * Math.log2(n) / 6, Y = v => pB - (pB - pT) * Math.min(v, top) / top;
      axes(c, pL, pT, pR, pB);
      c.setLineDash([5, 5]); c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath();
      for (let n = 1; n <= 64; n *= 1.1) c[n === 1 ? 'moveTo' : 'lineTo'](X(n), Y(M.camTheoryNoise(q, n))); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.gold; hist.forEach(([n, v]) => { c.beginPath(); c.arc(X(n), Y(v), 3, 0, 6.283); c.fill(); });
      [1, 4, 16, 64].forEach(n => label(c, String(n), X(n), pB + 12, 'center'));
      label(c, t('cam.cv.frames'), pR, pB + 29, 'right');
      label(c, pct(top, 0), pL - 6, pT + 4, 'right'); label(c, '0', pL - 6, pB, 'right');
      if (pB - pT > 70) label(c, t('cam.cv.noise'), pL - 6, (pT + pB) / 2, 'right');
    }
  });
  function upd(fromSim) {
    const q = ppp(), meas = hist.length ? hist[hist.length - 1][1] : NaN;
    $('camLightO').textContent = t('cam.o.light', { v: fmt(light(), light() < 10 ? 1 : 0) }); $('camPixO').textContent = t('cam.o.um', { v: fmt(+sP.value, 1) }); $('camFramesO').textContent = t('cam.o.frames', { v: sF.value });
    $('camPh').textContent = fmt(0.5 * q, 1); $('camN').textContent = st.n + ' / ' + sF.value; $('camMeas').textContent = pct(meas); $('camTh').textContent = pct(M.camTheoryNoise(q, st.n));
    $('camSay').innerHTML = t('cam.say', { ph: fmt(0.5 * q, 1), n: st.n, tot: fmt(0.5 * q * st.n), meas: pct(meas), th: pct(M.camTheoryNoise(q, st.n)) });
    if (!fromSim) drawNow(o);
  }
  [sL, sP].forEach(e => onInput(e, reset));
  onInput(sF, () => { if (st.n > +sF.value) reset(); else { if (reduce) while (st.n < +sF.value) addFrame(); upd(); } });
  $('camReset').addEventListener('click', reset);
  reset();
  updaters.push(() => upd());
})();

/* ───────── 05 screen ───────── */
(() => {
  const cv = $('scrCv'), sL = $('scrLam'), sl = [$('scrR'), $('scrG'), $('scrB')];
  const w3 = () => sl.map(s => +s.value);
  const o = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), lam = +sL.value, m = M.colourMatch(lam), wv = w3(), L = 40, Rr = w - 14;
      c.clearRect(0, 0, w, h);
      const sT = 14, sB = h * 0.52, X = l => L + (Rr - L) * (l - 400) / 300, Y = v => sB - (sB - sT) * v;
      axes(c, L, sT, Rr, sB);
      // cone sensitivities
      const coneCol = ['rgba(240,122,109,.75)', 'rgba(122,214,160,.75)', 'rgba(99,199,230,.75)'];
      for (let k = 0; k < 3; k++) { c.strokeStyle = coneCol[k]; c.lineWidth = 1.2; c.setLineDash([4, 4]); c.beginPath(); for (let l = 400; l <= 700; l += 2) c[l === 400 ? 'moveTo' : 'lineTo'](X(l), Y(M.cones(l)[k])); c.stroke(); }
      c.setLineDash([]);
      // mix spectrum
      c.fillStyle = 'rgba(233,185,73,.28)'; c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(X(400), Y(0));
      for (let l = 400; l <= 700; l++) c.lineTo(X(l), Y(Math.min(1, M.mixPowerAt(wv, l)))); c.lineTo(X(700), Y(0)); c.closePath(); c.fill(); c.stroke();
      // target line
      c.strokeStyle = C.ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(X(lam), Y(0)); c.lineTo(X(lam), Y(0.95)); c.stroke();
      [450, 550, 650].forEach(l => label(c, String(l), X(l), sB + 11, 'center'));
      label(c, t('scr.cv.nm'), Rr, sB + 25, 'right');
      // cone letters at their peaks, placed above the curves
      [['L', 562.8, coneCol[0]], ['M', 533.8, coneCol[1]], ['S', 420.3, coneCol[2]]].forEach(([s, l, col]) => label(c, s, X(l), sT + 2, 'center', col));
      // bars: target vs mix
      const mix = M.mixLMS(wv), tg = m.target, top = Math.max(...tg) * 1.15, bT = sB + 38, bB = h - 24, gw = (Rr - L) / 3;
      axes(c, L, bT, Rr, bB);
      for (let k = 0; k < 3; k++) {
        const gx = L + gw * k + gw / 2, bw = Math.min(34, gw * 0.3), H1 = (bB - bT) * Math.min(1.05, tg[k] / top), H2 = (bB - bT) * Math.min(1.05, mix[k] / top);
        c.fillStyle = C.ink; c.globalAlpha = .85; c.fillRect(gx - bw - 3, bB - H1, bw, H1); c.globalAlpha = 1;
        c.fillStyle = C.gold; c.fillRect(gx + 3, bB - H2, bw, H2);
        label(c, ['L', 'M', 'S'][k], gx, bB + 13, 'center', C.ink);
      }
    }
  });
  function upd() {
    const lam = +sL.value, m = M.colourMatch(lam), wv = w3(), mis = M.colourMismatch(wv, m.target), at = M.mixPowerAt(wv, lam);
    $('scrLamO').textContent = t('scr.o.nm', { v: lam });
    sl.forEach((s, i) => { $(['scrRO', 'scrGO', 'scrBO'][i]).textContent = t('scr.o.w', { v: fmt(+s.value, 2) }); });
    $('scrMis').textContent = pct(mis); $('scrNeed').textContent = m.w.map(v => fmt(v, 2)).join(' · '); $('scrAt').textContent = pct(at);
    const g = v => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v)), 1 / 2.2));
    const sw = M.swatchRGB(wv), bright = Math.min(1, Math.max(0, ...wv) / 0.9);   // white-balanced; the brightest weight sets brightness
    $('scrSw').style.background = `rgb(${g(sw[0] * bright)},${g(sw[1] * bright)},${g(sw[2] * bright)})`;
    const neg = Math.min(...m.w), say = $('scrSay');
    if (mis < 0.02) say.innerHTML = t('scr.say.match', { lam, at: pct(at) });
    else if (neg < -0.02 && solvedAt === lam) say.innerHTML = t('scr.say.out', { lam, neg: fmt(neg, 2) });
    else say.innerHTML = t('scr.say.adjust', { mis: pct(mis) });
    drawNow(o);
  }
  let solvedAt = null;
  onInput(sL, () => { solvedAt = null; upd(); }); sl.forEach(s => onInput(s, upd));
  $('scrSolve').addEventListener('click', () => { const m = M.colourMatch(+sL.value); sl.forEach((s, i) => { s.value = Math.max(0, Math.min(1, m.w[i])).toFixed(2); }); solvedAt = +sL.value; upd(); });
  updaters.push(upd);
})();

/* ───────── 06 compression ───────── */
(() => {
  const cv = $('cmpCv'), bS = $('cmpSky'), bG = $('cmpGrass'), sN = $('cmpNoise'), W = M.IMG.W, H = M.IMG.H;
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  let scene = 'sky', stats = null;
  const o = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), stacked = w < 560;
      c.clearRect(0, 0, w, h);
      const img = off.getContext('2d').createImageData(W, H);
      for (let k = 0; k < W * H; k++) { const v = stats.px[k]; img.data[4 * k] = img.data[4 * k + 1] = img.data[4 * k + 2] = v; img.data[4 * k + 3] = 255; }
      off.getContext('2d').putImageData(img, 0, 0);
      let iw, ih, ix, iy, pL, pT, pR, pB;
      if (stacked) { ih = Math.min(h * 0.48, (w - 20) * H / W); iw = ih * W / H; ix = (w - iw) / 2; iy = 8; pL = 20; pT = iy + ih + 16; pR = w - 20; pB = h - 26; }
      else { iw = Math.min(w * 0.5, (h - 20) * W / H); ih = iw * H / W; ix = 10; iy = (h - ih) / 2; pL = ix + iw + 30; pT = 16; pR = w - 16; pB = h - 30; }
      c.imageSmoothingEnabled = false; c.drawImage(off, ix, iy, iw, ih);
      // histogram of residuals in −32…32
      const cnt = new Array(65).fill(0); for (const r of stats.res) if (r >= -32 && r <= 32) cnt[r + 32]++;
      const mx = Math.max(...cnt), bw = (pR - pL) / 65;
      axes(c, pL, pT, pR, pB);
      c.fillStyle = C.gold; cnt.forEach((v, i) => { const bh = (pB - pT) * v / mx; c.fillRect(pL + i * bw + 0.5, pB - bh, Math.max(1, bw - 1), bh); });
      label(c, '−32', pL, pB + 12, 'left'); label(c, '0', pL + bw * 32.5, pB + 12, 'center'); label(c, '+32', pR, pB + 12, 'right');
      label(c, t('cmp.cv.res'), pR, pT + 6, 'right');
    }
  });
  function upd() {
    stats = M.compressStats(scene, +sN.value);
    bS.setAttribute('aria-pressed', String(scene === 'sky')); bG.setAttribute('aria-pressed', String(scene === 'grass'));
    $('cmpNoiseO').textContent = t('cmp.o.noise', { v: fmt(+sN.value, 1) });
    const b = stats.bits, ratio = 8 / b;
    $('cmpBits').textContent = fmt(b, 2); $('cmpMB').textContent = fmt(M.MP12_MB(b), 1); $('cmpRatio').textContent = fmt(ratio, 1) + '×';
    $('cmpSay').innerHTML = scene === 'grass' ? t('cmp.say.grass', { bits: fmt(b, 1) })
      : +sN.value >= 1 ? t('cmp.say.noisy', { bits: fmt(b, 2), th: fmt(M.noiseBitsTheory(+sN.value), 2) })
      : t('cmp.say.sky', { bits: fmt(b, 2), ratio: fmt(ratio, 0) });
    drawNow(o);
  }
  bS.addEventListener('click', () => { scene = 'sky'; upd(); }); bG.addEventListener('click', () => { scene = 'grass'; upd(); });
  onInput(sN, upd); upd();
  updaters.push(upd);
})();

/* ───────── 07 radio ───────── */
(() => {
  const cv = $('radCv'), sD = $('radD'), sN = $('radN'), sB = $('radBw'), REF = 5e6;
  const o = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = +sN.value, B = +sB.value * 1e6, ld = +sD.value, L = 60, Rr = w - 14, T = 16, Bt = h - 42;
      const X = l => L + (Rr - L) * (l - 2) / 2.5, Y = lc => Bt - (Bt - T) * (Math.max(-1, Math.min(4, lc)) + 1) / 5;
      c.clearRect(0, 0, w, h);
      // where the signal is weaker than the noise in the chosen band
      let x0 = null; for (let l = 2; l <= 4.5; l += 0.005) if (M.radioLink(Math.pow(10, l), n, B).snrDb < 0) { x0 = l; break; }
      if (x0 != null) { c.fillStyle = 'rgba(240,122,109,.10)'; c.fillRect(X(x0), T, Rr - X(x0), Bt - T); if (Rr - X(x0) > 120) label(c, t('rad.cv.low'), Rr - 6, T + 10, 'right', C.red); }
      for (let e = 0; e <= 3; e++) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(e)); c.lineTo(Rr, Y(e)); c.stroke(); label(c, fmt(Math.pow(10, e)), L - 6, Y(e), 'right'); }
      axes(c, L, T, Rr, Bt);
      [[2, '100 m'], [3, '1 km'], [4, '10 km']].forEach(([l, s]) => label(c, s, X(l), Bt + 13, 'center'));
      label(c, t('rad.cv.cap'), L - 6, T + 2, 'right');
      const curve = (bw, col, lw, dash) => { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.beginPath(); for (let l = 2; l <= 4.5; l += 0.01) c[l === 2 ? 'moveTo' : 'lineTo'](X(l), Y(Math.log10(M.radioLink(Math.pow(10, l), n, bw).cap / 1e6))); c.stroke(); c.setLineDash([]); };
      curve(REF, C.cyan, 1.8, [5, 4]); curve(B, C.gold, 3);
      const cap = M.radioLink(Math.pow(10, ld), n, B).cap / 1e6;
      c.fillStyle = C.ink; c.beginPath(); c.arc(X(ld), Y(Math.log10(cap)), 6, 0, 6.283); c.fill();
      label(c, t('rad.cv.d'), Rr, Bt + 30, 'right');
    }
  });
  function upd() {
    const d = Math.pow(10, +sD.value), n = +sN.value, B = +sB.value * 1e6, l = M.radioLink(d, n, B), r = M.radioLink(d, n, REF);
    $('radDO').textContent = d < 1000 ? t('rad.o.m', { v: fmt(d) }) : t('rad.o.km', { v: fmt(d / 1000, d < 10000 ? 2 : 1) });
    $('radNO').textContent = t('rad.o.n', { v: fmt(n, 1) }); $('radBwO').textContent = t('rad.o.mhz', { v: sB.value });
    $('radPr').textContent = fmt(l.pr, 1); $('radNoise').textContent = fmt(l.noise, 1); $('radSnr').textContent = fmt(l.snrDb, 1);
    $('radCap').textContent = fmt(l.cap / 1e6, l.cap < 1e7 ? 1 : 0);
    const bwx = B / REF, capx = l.cap / r.cap, eff = bwx > 1 ? Math.log(capx) / Math.log(bwx) : null;
    const tail = eff == null ? '' : eff > 0.8 ? t('rad.say.near') : eff < 0.3 ? t('rad.say.far') : t('rad.say.mid');
    $('radSay').innerHTML = t('rad.say', { bwx: fmt(bwx, 0), capx: fmt(capx, 2), tail });
    drawNow(o);
  }
  [sD, sN, sB].forEach(e => onInput(e, upd));
  updaters.push(upd);
})();

/* ───────── 08 Hamming ───────── */
(() => {
  const cv = $('eccCv'), cv2 = $('eccCv2'), sP = $('eccP'), roles = ['p1', 'p2', 'd1', 'p3', 'd2', 'd3', 'd4'];
  let data = [1, 0, 1, 1], flips = new Set(), tally = { sent: 0, badRaw: 0, badCoded: 0 }, R = M.rng(2), acc = 0;
  const dataBox = $('eccData'), wireBox = $('eccWire'), dBtns = [], wBtns = [];
  for (let i = 0; i < 4; i++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'bit data'; b.addEventListener('click', () => { data[i] ^= 1; upd(); }); dataBox.appendChild(b); dBtns.push(b); }
  for (let i = 0; i < 7; i++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'bit' + (roles[i][0] === 'd' ? ' data' : ''); b.addEventListener('click', () => { flips.has(i) ? flips.delete(i) : flips.add(i); upd(); }); wireBox.appendChild(b); wBtns.push(b); }
  const state = () => { const sent = M.hammingEncode(data), recv = sent.map((v, i) => flips.has(i) ? v ^ 1 : v); return { sent, recv, dec: M.hammingDecode(recv) }; };
  // which circles (check 1, 2, 3) contain position i (1-based): bit k of i
  const o = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), { recv, dec } = state(), r = Math.min(w * 0.2, h * 0.3), cx = w / 2, cy = h / 2 + 4;
      const ctr = [[cx - r * 0.55, cy - r * 0.35], [cx + r * 0.55, cy - r * 0.35], [cx, cy + r * 0.55]];
      c.clearRect(0, 0, w, h);
      ctr.forEach(([x, y], k) => { const bad = dec.checks[k]; c.fillStyle = bad ? 'rgba(240,122,109,.12)' : 'rgba(167,173,187,.05)'; c.strokeStyle = bad ? C.red : C.mute; c.lineWidth = bad ? 3 : 1.5; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.stroke(); });
      // region centres: only1, only2, 1&2, only3, 1&3, 2&3, all
      const pos = [[cx - r * 1.0, cy - r * 0.6], [cx + r * 1.0, cy - r * 0.6], [cx, cy - r * 0.62], [cx, cy + r * 1.05], [cx - r * 0.52, cy + r * 0.32], [cx + r * 0.52, cy + r * 0.32], [cx, cy + r * 0.02]];
      c.font = '600 19px ui-monospace,Menlo,monospace';
      pos.forEach(([x, y], i) => {
        if (flips.has(i)) { c.fillStyle = 'rgba(240,122,109,.35)'; c.beginPath(); c.arc(x, y, 15, 0, 6.283); c.fill(); }
        label(c, String(recv[i]), x, y, 'center', roles[i][0] === 'd' ? C.cyan : C.ink);
      });
      c.font = FONT;
      label(c, t('ecc.cv.c1'), ctr[0][0] - r * 0.95, ctr[0][1] - r * 0.98, 'center', dec.checks[0] ? C.red : C.mute);
      label(c, t('ecc.cv.c2'), ctr[1][0] + r * 0.95, ctr[1][1] - r * 0.98, 'center', dec.checks[1] ? C.red : C.mute);
      label(c, t('ecc.cv.c3'), ctr[2][0] + r * 1.25, ctr[2][1] + r * 0.9, 'center', dec.checks[2] ? C.red : C.mute);
    }
  });
  const o2 = reg(cv2, {
    step(dt) {
      if (reduce) return false;
      acc += dt; const n = Math.floor(acc * 300); if (n < 1) return false; acc -= n / 300;
      M.hammingTally(tally, n, Math.pow(10, +sP.value), R); updTally(); return false;
    },
    draw() {
      const { c, w, h } = fit(cv2), L = 62, Rr = w - 14, T = 12, B = h - 40, lp = +sP.value;
      const X = l => L + (Rr - L) * (l + 3) / 2.4, Y = v => B - (B - T) * (Math.log10(Math.max(v, 1e-7)) + 6) / 6;
      c.clearRect(0, 0, w, h);
      [[0, '100%'], [-2, '1%'], [-4, '0.01%']].forEach(([e, s]) => { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(Math.pow(10, e))); c.lineTo(Rr, Y(Math.pow(10, e))); c.stroke(); label(c, s, L - 6, Y(Math.pow(10, e)), 'right'); });
      axes(c, L, T, Rr, B);
      const curve = (fn, col) => { c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); for (let l = -3; l <= -0.6; l += 0.02) c[l === -3 ? 'moveTo' : 'lineTo'](X(l), Y(fn(Math.pow(10, l)))); c.stroke(); };
      curve(M.blockErrUncoded, C.red); curve(M.blockErrHamming, C.gold);
      const p = Math.pow(10, lp); c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.moveTo(X(lp), T); c.lineTo(X(lp), B); c.stroke();
      [[-3, '0.001'], [-2, '0.01'], [-1, '0.1']].forEach(([l, s]) => label(c, s, X(l), B + 13, 'center'));
      label(c, t('ecc.cv.p'), Rr, B + 29, 'right');
      [[M.blockErrUncoded(p), C.red], [M.blockErrHamming(p), C.gold]].forEach(([v, col]) => { c.fillStyle = col; c.beginPath(); c.arc(X(lp), Y(v), 5, 0, 6.283); c.fill(); });
    }
  });
  function updTally() { $('eccSim').textContent = t('ecc.sim', { n: fmt(tally.sent), a: fmt(tally.badRaw), b: fmt(tally.badCoded) }); }
  function upd() {
    const { sent, dec } = state();
    dBtns.forEach((b, i) => { b.innerHTML = `${data[i]}<small>d${i + 1}</small>`; b.setAttribute('aria-pressed', String(!!data[i])); b.setAttribute('aria-label', t('ecc.aria.data', { i: i + 1, v: data[i] })); });
    wBtns.forEach((b, i) => {
      const v = flips.has(i) ? sent[i] ^ 1 : sent[i];
      b.innerHTML = `${v}<small>${roles[i]}</small>`; b.classList.toggle('flip', flips.has(i)); b.classList.toggle('fixed', dec.pos === i + 1);
      b.setAttribute('aria-pressed', String(flips.has(i)));
      b.setAttribute('aria-label', t('ecc.aria.wire', { pos: i + 1, role: roles[i], v, state: flips.has(i) ? t('ecc.aria.flipped') : '' }));
    });
    const ok = dec.data.every((v, i) => v === data[i]);
    $('eccSyn').textContent = dec.pos ? String(dec.pos) : t('ecc.r.none'); $('eccSyn').className = dec.pos ? 'r' : ''; $('eccOut').textContent = dec.data.join(''); $('eccOk').textContent = t(ok ? 'ecc.r.yes' : 'ecc.r.no');
    $('eccOk').className = ok ? 'n' : 'r';
    const n = flips.size, say = $('eccSay');
    say.innerHTML = n === 0 ? t('ecc.say.clean') : ok ? t('ecc.say.fixed', { pos: dec.pos }) : dec.pos ? t('ecc.say.wrong', { n, pos: dec.pos }) : t('ecc.say.wrong0', { n });
    drawNow(o);
  }
  function updP() {
    const p = Math.pow(10, +sP.value);
    $('eccPO').textContent = t('ecc.o.p', { v: p < 0.01 ? fmt(p, 4) : fmt(p, 3) });
    $('eccRaw').textContent = pct(M.blockErrUncoded(p), 2); $('eccCoded').textContent = pct(M.blockErrHamming(p), 2);
    tally = { sent: 0, badRaw: 0, badCoded: 0 }; R = M.rng(2); acc = 0;
    if (reduce) M.hammingTally(tally, 20000, p, R);
    updTally(); drawNow(o2);
  }
  $('eccClear').addEventListener('click', () => { flips = new Set(); upd(); });
  onInput(sP, updP); $('eccReset').addEventListener('click', updP);
  upd(); updP();
  updaters.push(() => { upd(); updP(); });
})();

/* ───────── 09 handover ───────── */
(() => {
  const cv = $('hoCv'), sH = $('hoH'), HO = M.HO, SPEED = 5; // ×5: the 100 s drive takes 20 s
  let seed = 17, road = M.handoverRoad(seed), trip = M.handoverTrip(road, +sH.value), xp = reduce ? HO.len : 0;
  const o = reg(cv, {
    step(dt) { if (xp >= HO.len) return false; xp = Math.min(HO.len, xp + HO.speed * SPEED * dt); upd(true); return true; },
    draw() {
      const { c, w, h } = fit(cv), L = 62, Rr = w - 14, T = 12, Bp = h - 76, band = h - 62;
      const X = x => L + (Rr - L) * x / HO.len, lo = -100, hi = -10, Y = v => Bp - (Bp - T) * (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo);
      c.clearRect(0, 0, w, h);
      [-20, -40, -60, -80].forEach(v => { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(Rr, Y(v)); c.stroke(); label(c, t('ho.cv.dbm', { v }), L - 6, Y(v), 'right'); });
      axes(c, L, T, Rr, Bp);
      const k1 = Math.floor(xp / HO.step);
      const trace = (arr, col) => {
        c.strokeStyle = col; c.globalAlpha = .3; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k < road.N; k++) c[k ? 'lineTo' : 'moveTo'](X(k * HO.step), Y(arr[k])); c.stroke();
        c.globalAlpha = 1; c.lineWidth = 2.2; c.beginPath(); for (let k = 0; k <= k1 && k < road.N; k++) c[k ? 'lineTo' : 'moveTo'](X(k * HO.step), Y(arr[k])); c.stroke();
      };
      trace(road.a, C.cyan); trace(road.b, C.violet);
      // serving band
      for (let k = 0; k < Math.min(k1, road.N - 1); k++) { c.fillStyle = trip.serve[k] ? C.violet : C.cyan; c.fillRect(X(k * HO.step), band, X((k + 1) * HO.step) - X(k * HO.step) + 0.6, 10); }
      c.strokeStyle = C.line; c.strokeRect(L, band, Rr - L, 10);
      c.strokeStyle = C.gold; c.lineWidth = 2; trip.events.forEach(e => { if (e <= xp) { c.beginPath(); c.moveTo(X(e), band - 6); c.lineTo(X(e), band + 16); c.stroke(); } });
      // the car
      const kk = Math.min(road.N - 1, k1), sv = trip.serve[kk] ? road.b[kk] : road.a[kk];
      c.fillStyle = C.gold; c.beginPath(); c.arc(X(xp), Y(sv), 6, 0, 6.283); c.fill();
      label(c, t('ho.cv.a'), L, h - 38, 'left', C.cyan); label(c, t('ho.cv.b'), Rr, h - 38, 'right', C.violet);
      { // the mid-road mark only when it clears both end labels (English labels are long on narrow screens)
        const wa = c.measureText(t('ho.cv.a')).width, wb = c.measureText(t('ho.cv.b')).width, wm = c.measureText('1000').width / 2 + 8, xm = X(1000);
        if (xm - wm > L + wa && xm + wm < Rr - wb) label(c, '1000', xm, h - 38, 'center');
      }
      label(c, t('ho.cv.x'), Rr, h - 16, 'right');
    }
  });
  function upd(fromSim) {
    const k = Math.min(road.N - 1, Math.floor(xp / HO.step)), n = trip.events.filter(e => e <= xp).length, worse = trip.worseCum[k];
    $('hoHO').textContent = t('ho.o.db', { v: fmt(+sH.value, 1) });
    $('hoPos').textContent = fmt(xp); $('hoN').textContent = String(n); $('hoWorse').textContent = fmt(worse);
    const H = +sH.value, tail = trip.count > 3 ? t('ho.say.ping') : trip.worseM > 100 ? t('ho.say.late') : t('ho.say.ok');
    if (xp >= HO.len) $('hoSay').innerHTML = t('ho.say.done', { n, worse: fmt(worse), h: H, tail });
    else if (!fromSim || k % 25 === 0) $('hoSay').innerHTML = t('ho.say.run', { pos: fmt(xp), n });
    if (!fromSim) drawNow(o);
  }
  onInput(sH, () => { trip = M.handoverTrip(road, +sH.value); upd(); });
  $('hoReplay').addEventListener('click', () => { xp = reduce ? HO.len : 0; upd(); });
  $('hoRoad').addEventListener('click', () => { seed += 1; road = M.handoverRoad(seed); trip = M.handoverTrip(road, +sH.value); xp = reduce ? HO.len : 0; upd(); });
  updaters.push(() => upd());
})();

/* ───────── 10 battery ───────── */
(() => {
  const cv = $('batCv'), cv2 = $('batCv2'), sI = $('batI'), sT = $('batT'), bP = $('batPlay'), HOURS_PER_S = 0.05; // 1 s on screen = 3 phone minutes
  let q = 0.5, tMin = 0, playing = false, hist = [];
  const rec = () => { const b = M.battery(q, +sI.value, +sT.value); hist.push([tMin, q, b.off ? 0 : b.shown]); if (hist.length > 1500) hist.shift(); };
  const o = reg(cv, {
    step(dt) {
      if (!playing) return false;
      const b0 = M.battery(q, +sI.value, +sT.value); if (b0.off || q <= 0) { playing = false; upd(); return false; }
      q = M.batteryStep(q, +sI.value, dt * HOURS_PER_S); tMin += dt * HOURS_PER_S * 60; rec();
      if (M.battery(q, +sI.value, +sT.value).off) playing = false;
      upd(true); return true;
    },
    draw() {
      const { c, w, h } = fit(cv), I = +sI.value, tc = +sT.value, b = M.battery(q, I, tc), L = 46, Rr = w - 14, T = 14, B = h - 42;
      const X = x => L + (Rr - L) * x, Y = v => B - (B - T) * (v - 2.8) / 1.5;
      c.clearRect(0, 0, w, h);
      if (b.qc > 0) { c.fillStyle = 'rgba(240,122,109,.14)'; c.fillRect(X(0), T, X(b.qc) - X(0), B - T); }
      [3.0, 3.5, 4.0].forEach(v => { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(Rr, Y(v)); c.stroke(); label(c, v.toFixed(1), L - 6, Y(v), 'right'); });
      axes(c, L, T, Rr, B);
      c.setLineDash([6, 5]); c.strokeStyle = C.red; c.lineWidth = 1.5; c.beginPath(); c.moveTo(L, Y(M.BAT.vcut)); c.lineTo(Rr, Y(M.BAT.vcut)); c.stroke(); c.setLineDash([]);
      label(c, t('bat.cv.cut', { v: M.BAT.vcut.toFixed(1) }), Rr - 4, Y(M.BAT.vcut) + 12, 'right', C.red);
      const curve = (fn, col, lw, dash) => { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.beginPath(); for (let x = 0; x <= 1.0001; x += 0.005) c[x ? 'lineTo' : 'moveTo'](X(x), Y(Math.max(2.8, fn(x)))); c.stroke(); c.setLineDash([]); };
      curve(M.ocv, C.cyan, 2.5); curve(x => M.ocv(x) - I * b.R, C.gold, 1.5, [4, 4]);
      c.strokeStyle = C.red; c.lineWidth = 3; c.beginPath(); c.moveTo(X(q), Y(b.ocv)); c.lineTo(X(q), Y(Math.max(2.8, b.v))); c.stroke();
      c.fillStyle = C.cyan; c.beginPath(); c.arc(X(q), Y(b.ocv), 5.5, 0, 6.283); c.fill();
      c.fillStyle = C.gold; c.beginPath(); c.arc(X(q), Y(Math.max(2.8, b.v)), 5.5, 0, 6.283); c.fill();
      [[0, '0'], [0.5, '50%'], [1, '100%']].forEach(([x, s]) => label(c, s, X(x), B + 13, x === 0 ? 'left' : x === 1 ? 'right' : 'center'));
      label(c, t('bat.cv.q'), Rr, B + 29, 'right');
      label(c, t('bat.cv.v'), L + 6, T + 4, 'left');
    }
  });
  const o2 = reg(cv2, {
    draw() {
      const { c, w, h } = fit(cv2), L = 46, Rr = w - 14, T = 10, B = h - 38, tmax = Math.max(30, ...hist.map(p => p[0]));
      const X = x => L + (Rr - L) * x / tmax, Y = v => B - (B - T) * v;
      c.clearRect(0, 0, w, h);
      [0.5, 1].forEach(v => { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(Rr, Y(v)); c.stroke(); label(c, pct(v, 0), L - 6, Y(v), 'right'); });
      axes(c, L, T, Rr, B);
      const line = (i, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); hist.forEach((p, k) => c[k ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[i]))); c.stroke(); };
      line(1, C.mute, 1.8); line(2, C.gold, 2.5);
      label(c, '0', L, B + 12, 'left'); label(c, fmt(tmax), Rr, B + 12, 'right'); label(c, t('bat.cv.min'), Rr, B + 27, 'right');
    }
  });
  function upd(fromSim) {
    const I = +sI.value, tc = +sT.value, b = M.battery(q, I, tc);
    $('batIO').textContent = t('bat.o.a', { v: fmt(I, 1) }); $('batTO').textContent = t('bat.o.c', { v: tc });
    $('batQ').textContent = pct(q); $('batShown').textContent = b.off ? t('bat.r.off') : pct(b.shown, 0);
    $('batOcv').textContent = fmt(b.ocv, 2); $('batDrop').textContent = fmt(b.drop, 2); $('batV').textContent = fmt(b.v, 2); $('batHeat').textContent = fmt(b.heat, 2);
    if (!fromSim || Math.round(tMin) % 2 === 0) $('batSay').innerHTML = b.off ? t('bat.say.off', { v: fmt(b.v, 2), q: pct(q, 0) }) : t('bat.say.on', { q: pct(q, 0), r: fmt(b.R, 2), i: fmt(I, 1), drop: fmt(b.drop, 2), shown: pct(b.shown, 0) });
    bP.textContent = t(reduce ? 'bat.c.step' : playing ? 'bat.c.pause' : 'bat.c.play'); bP.setAttribute('aria-pressed', String(playing));
    drawNow(o); drawNow(o2);
  }
  [sI, sT].forEach(e => onInput(e, () => { rec(); upd(); }));
  bP.addEventListener('click', () => {
    if (reduce) { for (let i = 0; i < 100; i++) { if (M.battery(q, +sI.value, +sT.value).off) break; q = M.batteryStep(q, +sI.value, 10 / 60 / 100); tMin += 0.1; rec(); } }
    else playing = !playing && !M.battery(q, +sI.value, +sT.value).off;
    upd();
  });
  $('batReset').addEventListener('click', () => { q = 0.5; tMin = 0; playing = false; hist = []; rec(); upd(); });
  rec();
  updaters.push(() => upd());
})();

/* ───────── loop ───────── */
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    const moved = s.step ? s.step(dt) : false;
    if (moved || s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
applyLang();
requestAnimationFrame(tick);
window.__ready = true;
window.__sims = sims;
})();
