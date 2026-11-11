/* Body in balance: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.BodyModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const effLang = () => (COPY[lang] ? lang : 'zh');
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));
{ const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }

/* ───────── canvas + sim registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = s.cvs.some(cv => cv.__vis = (cv === e.target ? e.isIntersecting : cv.__vis)); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
// text in a DOM node only when it changed (keeps aria-live quiet)
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

/* plot helpers: a frame with margins and value→pixel maps */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab, opt = {}) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + (opt.xLabDy || 24)); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function cursorDot(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, 6.283); c.fill(); }
// replay clock for exact-solution charts: advances model time on real dt, jumps to the end under reduced motion
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }

/* ───────── 01 leaky bucket ───────── */
(() => {
  const cv = $('#bkCv'), B = M.bucket, CAP = 30, SPAN = 60, SPEED = 3; // model min per real s
  const sI = $('#bkI'), sK = $('#bkK');
  const p = () => ({ I: +sI.value, k: +sK.value });
  const s = B.create(0); let hist = [[0, 0]], lastSample = 0;
  function run(span) {
    M.advance(s, span, B.H, (st, h) => { B.step(st, h, p()); st.L = Math.min(st.L, CAP); });
    if (s.t - lastSample >= 0.2 || span > 1) { hist.push([s.t, s.L]); lastSample = s.t; }
    while (hist.length && hist[0][0] < s.t - SPAN) hist.shift();
  }
  if (reduce) run(SPAN);
  const sim = reg(cv, {
    step(dt) { run(dt * SPEED); this.dirty = true; },
    draw() {
      const { c, w, h } = fit(cv), P = p(), Ls = B.setpoint(P);
      const bw = Math.min(170, Math.max(92, w * 0.28)), bx = 14, by = 28, bh = h - 64;
      // bucket
      const lvl = y => by + bh - bh * y / CAP;
      c.fillStyle = 'rgba(99,199,230,.25)'; c.fillRect(bx, lvl(s.L), bw, by + bh - lvl(s.L));
      c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by + bh); c.lineTo(bx + bw, by + bh); c.lineTo(bx + bw, by); c.stroke();
      c.strokeStyle = C.gold; c.setLineDash([5, 4]); c.lineWidth = 1.3; c.beginPath(); c.moveTo(bx - 4, lvl(Math.min(Ls, CAP))); c.lineTo(bx + bw + 4, lvl(Math.min(Ls, CAP))); c.stroke(); c.setLineDash([]);
      // inflow stream (width ∝ I) and outflow jet (width ∝ k·L)
      c.fillStyle = C.cyan; const iw = 2 + P.I * 2.2; c.fillRect(bx + bw * 0.35 - iw / 2, 6, iw, Math.max(0, lvl(s.L) - 6));
      const out = B.outflow(s, P), ow = Math.min(10, 1 + out * 1.8), oy = by + bh - 8, reach = 8 + 6 * Math.sqrt(out);
      if (out > 0.02) { c.strokeStyle = C.gold; c.lineWidth = ow; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx + bw, oy); c.quadraticCurveTo(bx + bw + reach, oy, bx + bw + reach + 4, h - 6); c.stroke(); c.lineCap = 'butt'; }
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch1.cv.bucket'), bx, h - 12);
      // trace
      const gx = bx + bw + 46, f = frame(w, h, [28, 12, 34, gx + 26], Math.max(0, s.t - SPAN), Math.max(SPAN, s.t), 0, CAP);
      if (f.R - f.L > 60) {
        yTicks(c, f, [0, 10, 20, 30], v => fmt(v));
        axes(c, f, t('ch1.cv.time'), t('ch1.cv.level'));
        hline(c, f, Math.min(Ls, CAP), C.gold);
        path(c, hist, f.X, f.Y, C.cyan);
        if (hist.length) cursorDot(c, f.X(s.t), f.Y(s.L), C.cyan);
      }
    }
  });
  function text() {
    const P = p(), Ls = B.setpoint(P), out = B.outflow(s, P);
    put('#bkIo', t('ch1.unit.flow', { v: fmt(P.I, 1) })); put('#bkKo', t('ch1.unit.hole', { v: fmt(P.k * 100) }));
    put('#bkL', t('ch1.unit.l', { v: fmt(s.L, 1) })); put('#bkIn', t('ch1.unit.flow', { v: fmt(P.I, 1) })); put('#bkOut', t('ch1.unit.flow', { v: fmt(out, 2) }));
    put('#bkHalf', t('ch1.unit.min', { v: fmt(B.halfGap(P), 1) }));
    const gap = Ls - s.L, key = Ls > CAP ? 'ch1.say.over' : Math.abs(gap) < 0.15 ? 'ch1.say.flat' : gap > 0 ? 'ch1.say.up' : 'ch1.say.down';
    putHTML('#bkSay', t(key, { set: fmt(Math.min(Ls, 99), 1), I: fmt(P.I, 1), k: fmt(P.k, 2), gap: fmt(Math.abs(gap), 1), half: fmt(B.halfGap(P), 1) }));
  }
  sim.text = text;
  const step0 = sim.step; sim.step = dt => { step0.call(sim, dt); text(); };
  const nudge = () => { if (reduce) run(SPAN); sim.dirty = true; text(); };
  [sI, sK].forEach(e => e.addEventListener('input', nudge));
  on('#bkAdd', 'click', () => { s.L = Math.min(CAP, s.L + 5); hist.push([s.t, s.L]); nudge(); });
  on('#bkSub', 'click', () => { s.L = Math.max(0, s.L - 5); hist.push([s.t, s.L]); nudge(); });
  text();
})();

/* ───────── 02 repeated dosing ───────── */
(() => {
  const cv = $('#dsCv'), D = M.dosing, UNTIL = 96, ck = clock(UNTIL, 8);
  const sH = $('#dsH'), sT = $('#dsT');
  let cache = null;
  function model() {
    const half = +sH.value, iv = +sT.value, plan = radioVal('dsPlan');
    const missIdx = Math.max(1, Math.round(48 / iv));
    const opts = plan === 'miss' ? { miss: missIdx } : plan === 'double' ? { miss: missIdx, double: missIdx + 1 } : {};
    const doses = D.schedule(iv, UNTIL, opts), pts = [];
    for (let x = 0; x <= UNTIL + 1e-9; x += 0.25) pts.push([x, D.conc(x, doses, half)]);
    // the instant of each dose: draw the vertical jump exactly
    const full = [];
    for (const q of pts) full.push(q);
    for (const d of doses) { full.push([d.t - 1e-6, D.conc(d.t - 1e-6, doses, half)]); full.push([d.t, D.conc(d.t, doses, half)]); }
    full.sort((a, b) => a[0] - b[0]);
    const maxC = Math.max(...full.map(q => q[1]));
    return { half, iv, plan, doses, pts: full, maxC, missIdx, peak: D.steadyPeak(iv, half), trough: D.steadyTrough(iv, half) };
  }
  cache = model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), m = cache, yMax = Math.max(2.5, Math.ceil(m.maxC * 1.15 * 2) / 2);
      const f = frame(w, h, [30, 14, 38, 40], 0, UNTIL, 0, yMax);
      const ys = []; for (let v = 0; v <= yMax + 1e-9; v += yMax > 4 ? 1 : 0.5) ys.push(v);
      yTicks(c, f, ys, v => fmt(v, yMax > 4 ? 0 : 1));
      axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
      xTicks(c, f, [0, 24, 48, 72, 96], v => fmt(v), true);
      hline(c, f, m.peak, C.gold); hline(c, f, m.trough, C.gold);
      c.strokeStyle = C.mute; c.lineWidth = 1.5;
      for (const d of m.doses) { if (d.t > ck.t) break; const x = f.X(d.t); c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B - (d.amt > 1 ? 14 : 7)); c.stroke(); }
      const shown = m.pts.filter(q => q[0] <= ck.t);
      path(c, shown, f.X, f.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; cursorDot(c, f.X(q[0]), f.Y(q[1]), C.cyan); }
    }
  });
  function text() {
    const m = cache, now = D.conc(ck.t, m.doses, m.half), halves = ck.t / m.half;
    put('#dsHo', t('common.hours', { v: fmt(m.half) })); put('#dsTo', t('common.hours', { v: fmt(m.iv) }));
    put('#dsNow', t('ch2.unit.dose', { v: fmt(now, 2) })); put('#dsHalves', fmt(halves, 1));
    put('#dsPeak', t('ch2.unit.dose', { v: fmt(m.peak, 2) })); put('#dsTrough', t('ch2.unit.dose', { v: fmt(m.trough, 2) }));
    let key, v = { pct: fmt(D.fractionOfPlateau(ck.t, m.half) * 100), h: fmt(5 * m.half), ratio: fmt(D.peakTroughRatio(m.iv, m.half), D.peakTroughRatio(m.iv, m.half) >= 10 ? 0 : 1), peak: fmt(m.peak, 2) };
    if (m.plan === 'double') { const tt = (m.missIdx + 1) * m.iv; const pk = D.conc(tt, m.doses, m.half); key = ck.t + 1e-9 >= tt ? (pk >= m.peak ? 'ch2.say.double' : 'ch2.say.doublelow') : 'ch2.say.waitmiss'; v.dp = fmt(pk, 2); v.over = fmt((pk / m.peak - 1) * 100); v.under = fmt((1 - pk / m.peak) * 100); }
    else if (m.plan === 'miss') { const tt = m.missIdx * m.iv; const low = D.conc(tt + m.iv - 1e-6, m.doses, m.half); key = ck.t + 1e-9 >= tt + m.iv ? 'ch2.say.miss' : 'ch2.say.waitmiss'; v.low = fmt(low, 2); v.tr = fmt(m.trough, 2); }
    else key = halves < 4.99 ? 'ch2.say.climb' : 'ch2.say.plateau';
    putHTML('#dsSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { cache = model(); sim.dirty = true; text(); };
  [sH, sT].forEach(e => e.addEventListener('input', redo));
  radios('dsPlan').forEach(r => r.addEventListener('change', redo));
  on('#dsReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 alcohol ───────── */
(() => {
  const cv = $('#alCv'), A = M.alcohol, UNTIL = 18, ck = clock(UNTIL, 2);
  const sN = $('#alN'), sG = $('#alG');
  let res = null;
  const model = () => { res = A.run({ n: +sN.value, spacing: +sG.value }, UNTIL); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), yMax = Math.max(40, Math.ceil(res.peak * 1.2 / 20) * 20);
      const f = frame(w, h, [30, 14, 38, 40], 0, UNTIL, 0, yMax);
      const ys = []; for (let v = 0; v <= yMax; v += yMax > 100 ? 40 : 20) ys.push(v);
      yTicks(c, f, ys, v => fmt(v)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      xTicks(c, f, [0, 3, 6, 9, 12, 15, 18], v => fmt(v), true);
      c.fillStyle = C.gold;
      for (let i = 0; i < +sN.value; i++) { const tt = i * +sG.value; if (tt > ck.t) break; c.beginPath(); c.arc(f.X(tt), f.B - 6, 3.5, 0, 6.283); c.fill(); }
      const shown = res.series.filter(q => q[0] <= ck.t);
      path(c, shown, f.X, f.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; cursorDot(c, f.X(q[0]), f.Y(q[1]), C.cyan); }
    }
  });
  function text() {
    const n = +sN.value, g = +sG.value, pace = 1 / g, mx = A.maxDrinksPerHour();
    put('#alNo', t(n === 1 ? 'ch3.unit.drink1' : 'ch3.unit.drinks', { v: fmt(n) })); put('#alGo', t('ch3.unit.gap', { v: fmt(g * 60) }));
    put('#alPeak', fmt(res.peak, 0)); put('#alClear', res.tClear == null ? t('ch3.unit.never', { v: UNTIL }) : t('common.hours', { v: fmt(res.tClear, 1) }));
    put('#alRate', fmt(A.rateAt(res.peak), 1)); put('#alPace', t('ch3.unit.pace', { v: fmt(pace, 2), m: fmt(mx, 2) }));
    const key = n === 1 ? 'ch3.say.one' : pace > mx ? 'ch3.say.fast' : 'ch3.say.slow';
    putHTML('#alSay', t(key, { peak: fmt(res.peak), clr: res.tClear == null ? '—' : fmt(res.tClear, 1), per: fmt(A.P.perDrink / A.P.vmax, 2), pace: fmt(pace, 2), m: fmt(mx, 2) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sN, sG].forEach(e => e.addEventListener('input', redo));
  on('#alReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 glucose ───────── */
(() => {
  const cv = $('#glCv'), G = M.glucose, UNTIL = 300, ck = clock(UNTIL, 40);
  const sGain = $('#glGain'), sDelay = $('#glDelay'), cGlu = $('#glGlu');
  let res = null;
  const params = () => ({ gain: G.P.gain * (+sGain.value) / 100, delay: +sDelay.value, glucagon: cGlu.checked, meal: +radioVal('glMeal') });
  const model = () => { res = G.run(params(), UNTIL); res.iMax = Math.max(0.02, ...res.series.map(q => q[2])); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 40], 0, UNTIL, 0, 12);
      c.fillStyle = 'rgba(122,214,160,.13)'; c.fillRect(f.L + 1, f.Y(5.5), f.R - f.L - 1, f.Y(3.9) - f.Y(5.5));
      yTicks(c, f, [0, 2, 4, 6, 8, 10, 12], v => fmt(v)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      xTicks(c, f, [0, 60, 120, 180, 240, 300], v => fmt(v), true);
      hline(c, f, 7.8, C.red);
      const shown = res.series.filter(q => q[0] <= ck.t);
      // insulin signal: relative scale on the lower third
      path(c, shown.map(q => [q[0], 4 * q[2] / res.iMax]), f.X, f.Y, C.violet, 1.6);
      path(c, shown, f.X, f.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; cursorDot(c, f.X(q[0]), f.Y(q[1]), C.cyan); }
    }
  });
  function text() {
    put('#glGaino', fmt(+sGain.value) + '%'); put('#glDelayo', t('common.min', { v: fmt(+sDelay.value) }));
    const now = res.series.filter(q => q[0] <= ck.t).pop() || [0, 5];
    const done = ck.t >= UNTIL - 1e-9;
    put('#glPeak', t('ch4.unit.mmol', { v: fmt(res.peak, 1) })); put('#gl120', t('ch4.unit.mmol', { v: fmt(res.at120, 1) }));
    put('#glLow', t('ch4.unit.mmol', { v: fmt(res.low, 1) })); put('#glAbove', t('common.min', { v: fmt(res.above) }));
    let key;
    if (!done) key = 'ch4.say.running';
    else if (res.low < 3.9) key = cGlu.checked ? 'ch4.say.dip' : 'ch4.say.dipnoglu';
    else if (res.at120 > 7.8 || res.above > 60) key = 'ch4.say.high';
    else if (res.peak > 7.8) key = 'ch4.say.brief';
    else if (res.at120 > 5.5) key = 'ch4.say.slow';
    else key = 'ch4.say.ok';
    putHTML('#glSay', t(key, { now: fmt(now[1], 1), t: fmt(now[0]), peak: fmt(res.peak, 1), tp: fmt(res.tPeak), low: fmt(res.low, 1), a: fmt(res.at120, 1), above: fmt(res.above) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sGain, sDelay].forEach(e => e.addEventListener('input', redo));
  cGlu.addEventListener('change', redo); radios('glMeal').forEach(r => r.addEventListener('change', redo));
  on('#glReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 05 temperature and fever ───────── */
(() => {
  const cv = $('#thCv'), T = M.thermo, SPAN = 300, SPEED = 15;
  const bF = $('#thFever'), bD = $('#thDrug'), bI = $('#thIce'), sL = $('#thLoad');
  const st = { infected: true, drug: false, ice: false };
  const s = T.create(); let hist = [], lastS = -1;
  const p = () => ({ load: +sL.value * 0.01, ice: st.ice });
  function target() { s.target = st.infected && !st.drug ? 39 : 37; }
  function run(span) {
    M.advance(s, span, T.H, (x, h) => { T.step(x, h, p()); if (x.t - lastS >= 1) { hist.push([x.t, x.T, x.set, x.u]); lastS = x.t; } });
    while (hist.length && hist[0][0] < s.t - SPAN) hist.shift();
  }
  target(); s.set = 37; hist.push([0, s.T, s.set, 0]);
  if (reduce) run(240);
  const sim = reg(cv, {
    step(dt) { run(dt * SPEED); this.dirty = true; text(); },
    draw() {
      const { c, w, h } = fit(cv), x0 = Math.max(0, s.t - SPAN), f = frame(w, h, [30, 14, 38, 40], x0, Math.max(SPAN, s.t), 35, 42);
      yTicks(c, f, [36, 37, 38, 39, 40, 41, 42], v => fmt(v));
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      // effector strip at the bottom: red = making heat, blue = shedding heat
      const sh = 26, P = T.P;
      for (const sign of [1, -1]) { // filled area: height = share of the maximum effort
        const col = sign > 0 ? 'rgba(240,122,109,.55)' : 'rgba(99,199,230,.55)', mx = sign > 0 ? P.heatMax : P.coolMax;
        c.fillStyle = col; c.beginPath(); c.moveTo(f.X(hist[0] ? hist[0][0] : 0), f.B);
        for (const q of hist) c.lineTo(f.X(q[0]), f.B - sh * Math.max(0, sign * q[3]) / mx);
        c.lineTo(f.X(hist.length ? hist[hist.length - 1][0] : 0), f.B); c.closePath(); c.fill();
      }
      path(c, hist.map(q => [q[0], q[2]]), f.X, f.Y, C.gold, 1.4);
      path(c, hist.map(q => [q[0], q[1]]), f.X, f.Y, C.cyan);
      if (hist.length) cursorDot(c, f.X(s.t), f.Y(clamp(s.T, 35, 42)), C.cyan);
    }
  });
  function text() {
    put('#thLoado', fmt(+sL.value));
    bF.setAttribute('aria-pressed', String(st.infected)); bD.setAttribute('aria-pressed', String(st.drug)); bI.setAttribute('aria-pressed', String(st.ice));
    put('#thT', t('ch5.unit.c', { v: fmt(s.T, 1) })); put('#thSet', t('ch5.unit.c', { v: fmt(s.set, 1) }));
    const P = T.P, u = s.u, doing = u > 0.002 ? t('ch5.doing.heat', { v: fmt(100 * u / P.heatMax) }) : u < -0.002 ? t('ch5.doing.cool', { v: fmt(-100 * u / P.coolMax) }) : t('ch5.doing.rest');
    put('#thDo', doing); put('#thFeel', t('ch5.feel.' + T.feel(s)));
    const err = s.set - s.T, maxed = u <= -P.coolMax + 1e-6 && s.T > s.set + 0.3, heatMax = u >= P.heatMax - 1e-6;
    let key;
    if (maxed) key = 'ch5.say.maxed';
    else if (st.ice && heatMax) key = 'ch5.say.icefight';
    else if (err > 0.2) key = s.set > 37.5 ? 'ch5.say.rising' : 'ch5.say.cold';
    else if (err < -0.2) key = 'ch5.say.falling';
    else if (s.set > 38) key = 'ch5.say.fever';
    else key = 'ch5.say.normal';
    putHTML('#thSay', t(key, { T: fmt(s.T, 1), set: fmt(s.set, 1) }));
  }
  sim.text = text;
  const changed = () => { target(); if (reduce) run(240); sim.dirty = true; text(); };
  bF.addEventListener('click', () => { st.infected = !st.infected; if (!st.infected) st.drug = false; changed(); });
  bD.addEventListener('click', () => { st.drug = !st.drug; changed(); });
  bI.addEventListener('click', () => { st.ice = !st.ice; changed(); });
  sL.addEventListener('input', changed);
  text();
})();

/* ───────── 06 therapeutic window (reuses the ch2 dosing model) ───────── */
(() => {
  const cv1 = $('#twCv1'), cv2 = $('#twCv2'), W = M.window, DAYS = 6, UNTIL = DAYS * 24, ck = clock(UNTIL, 24), YM = 6;
  const sS = $('#twSlow');
  let res = null;
  const model = () => { res = W.run(+radioVal('twN'), +sS.value, DAYS); };
  model();
  const lo = W.lower(), hi = W.upper();
  const sim = reg([cv1, cv2], {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      { // dose–response curves
        const { c, w, h } = fit(cv1), f = frame(w, h, [26, 14, 36, 40], 0, YM, 0, 1);
        c.fillStyle = 'rgba(122,214,160,.13)'; c.fillRect(f.X(lo), f.T, f.X(hi) - f.X(lo), f.B - f.T);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%'); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y1'), { xLabDy: 24 });
        xTicks(c, f, [0, 1, 2, 3, 4, 5], v => fmt(v));
        const e = [], hm = []; for (let x = 0; x <= YM; x += 0.04) { e.push([x, W.effect(x)]); hm.push([x, W.harm(x)]); }
        path(c, e, f.X, f.Y, C.cyan); path(c, hm, f.X, f.Y, C.red);
        // current level marker
        const now = res.series.filter(q => q[0] <= ck.t).pop();
        if (now) { const x = f.X(Math.min(YM, now[1])); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); }
      }
      { // level over six days
        const { c, w, h } = fit(cv2), f = frame(w, h, [30, 14, 38, 40], 0, UNTIL, 0, YM);
        c.fillStyle = 'rgba(122,214,160,.13)'; c.fillRect(f.L + 1, f.Y(hi), f.R - f.L - 1, f.Y(lo) - f.Y(hi));
        yTicks(c, f, [0, 1, 2, 3, 4, 5, 6], v => fmt(v)); axes(c, f, t('ch6.cv.x2'), t('ch6.cv.y2'));
        xTicks(c, f, [0, 24, 48, 72, 96, 120, 144], v => fmt(v / 24), true);
        const shown = res.series.filter(q => q[0] <= ck.t).map(q => [q[0], Math.min(q[1], YM)]);
        path(c, shown, f.X, f.Y, C.gold);
        if (shown.length) { const q = shown[shown.length - 1]; cursorDot(c, f.X(q[0]), f.Y(q[1]), C.gold); }
      }
    }
  });
  function text() {
    put('#twSlowo', '×' + fmt(+sS.value, 2) + ' · ' + t('common.hours', { v: fmt(res.half) }));
    const done = ck.t >= UNTIL - 1e-9, pct = x => fmt(x * 100) + '%';
    put('#twIn', done ? pct(res.inWin) : '…'); put('#twBelow', done ? pct(res.below) : '…'); put('#twOver', done ? pct(res.over) : '…');
    put('#twFirst', res.firstOver == null ? t('ch6.unit.never') : res.firstOver < 0.05 ? t('ch6.unit.first0') : t('ch6.unit.first', { v: fmt(res.firstOver) }));
    let key = !done ? 'ch6.say.running' : res.inWin > 0.999 ? 'ch6.say.inside' : res.inWin < 0.001 ? 'ch6.say.allover' : res.below > 0.001 && res.over > 0.001 ? 'ch6.say.both' : res.over > 0 ? 'ch6.say.over' : 'ch6.say.below';
    if (done && +sS.value > 1 && res.firstOver != null && res.firstOver >= 24 && res.inWin < 0.999) key = 'ch6.say.late';
    putHTML('#twSay', t(key, { pk: fmt(res.ssPeak, 2), tr: fmt(res.ssTrough, 2), lo: fmt(lo, 1), hi: fmt(hi, 1), first: res.firstOver == null ? '—' : fmt(res.firstOver), half: fmt(res.half) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  sS.addEventListener('input', redo); radios('twN').forEach(r => r.addEventListener('change', () => { redo(); }));
  on('#twReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 heart budget ───────── */
(() => {
  const cv = $('#htCv'), Hm = M.heart, SPAN = 180, SPEED = 3;
  const sL = $('#htL'), sA = $('#htA');
  const p = () => ({ level: +sL.value, age: +sA.value, fit: radioVal('htFit') });
  const s = Hm.create(0, 'untrained', 20); let hist = [], lastS = -1;
  function run(span) {
    M.advance(s, span, Hm.H, (x, h) => { Hm.step(x, h, p()); if (x.t - lastS >= 0.5) { const g = Hm.target(p().level, p().fit, p().age); hist.push([x.t, x.hr, x.hr * g.sv / 1000, g.need, g.hm]); lastS = x.t; } });
    while (hist.length && hist[0][0] < s.t - SPAN) hist.shift();
  }
  if (reduce) { s.hr = Hm.target(p().level, p().fit, p().age).hr; run(SPAN); }
  const sim = reg(cv, {
    step(dt) { run(dt * SPEED); this.dirty = true; text(); },
    draw() {
      const { c, w, h } = fit(cv), x0 = Math.max(0, s.t - SPAN), x1 = Math.max(SPAN, s.t), mid = h * 0.5;
      const f1 = frame(w, mid + 6, [30, 14, 18, 44], x0, x1, 40, 210);
      yTicks(c, f1, [60, 100, 140, 180], v => fmt(v)); axes(c, f1, '', t('ch7.cv.hr'));
      path(c, hist.map(q => [q[0], q[4]]), f1.X, f1.Y, C.red, 1.3);
      path(c, hist.map(q => [q[0], q[1]]), f1.X, f1.Y, C.gold);
      const f2 = frame(w, h, [mid + 30, 14, 38, 44], x0, x1, 0, 35);
      yTicks(c, f2, [0, 10, 20, 30], v => fmt(v)); axes(c, f2, t('ch7.cv.x'), t('ch7.cv.co'));
      c.setLineDash([5, 4]); path(c, hist.map(q => [q[0], q[3]]), f2.X, f2.Y, C.mute, 1.3); c.setLineDash([]);
      path(c, hist.map(q => [q[0], q[2]]), f2.X, f2.Y, C.cyan);
      if (hist.length) { const q = hist[hist.length - 1]; cursorDot(c, f1.X(q[0]), f1.Y(q[1]), C.gold); cursorDot(c, f2.X(q[0]), f2.Y(q[2]), C.cyan); }
    }
  });
  function text() {
    const P = p(), g = Hm.target(P.level, P.fit, P.age), co = s.hr * g.sv / 1000;
    put('#htLo', t('ch7.unit.level', { v: fmt(P.level), need: fmt(g.need) })); put('#htAo', t('ch7.unit.age', { v: fmt(P.age) }));
    put('#htHr', t('ch7.unit.bpm', { v: fmt(s.hr) })); put('#htSv', t('ch7.unit.ml', { v: fmt(g.sv) }));
    put('#htCo', t('ch7.unit.lmin', { v: fmt(co, 1), need: fmt(g.need) })); put('#htMax', t('ch7.unit.bpm', { v: fmt(g.hm) }));
    const lag = Math.abs(g.hr - s.hr) > 3;
    const key = g.short > 0.05 && !lag ? 'ch7.say.short' : lag ? (g.hr > s.hr ? 'ch7.say.lagup' : 'ch7.say.lagdown') : 'ch7.say.ok';
    putHTML('#htSay', t(key, { hr: fmt(s.hr), sv: fmt(g.sv), co: fmt(co, 1), need: fmt(g.need), short: fmt(g.short, 1), hm: fmt(g.hm), res: fmt(g.hm - g.hr), max: fmt(Hm.maxCO(P.fit, P.age), 1) }));
  }
  sim.text = text;
  const changed = () => { if (reduce) { s.hr = Hm.target(p().level, p().fit, p().age).hr; run(SPAN); } sim.dirty = true; text(); };
  [sL, sA].forEach(e => e.addEventListener('input', changed)); radios('htFit').forEach(r => r.addEventListener('change', changed));
  text();
})();

/* ───────── 08 antibiotic selection (reuses the ch2 dosing model) ───────── */
(() => {
  const cv = $('#abCv'), Bm = M.bact, DOSES = [0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48], UNTIL = 14 * 24, ck = clock(UNTIL, 36);
  const sD = $('#abD'), sDays = $('#abDays');
  let res = null;
  const dose = () => DOSES[+sD.value];
  function model() {
    res = Bm.run({ dose: dose(), days: +sDays.value }, 14);
    const stop = +sDays.value * 24; let inW = 0, n = 0;
    for (const q of res.series) if (q[0] < stop) { n++; if (q[3] > Bm.P.micS && q[3] < Bm.P.micR) inW++; }
    res.winShare = n ? inW / n : 0;
  }
  model();
  const lg = x => x <= 0 ? -1 : Math.log10(x);
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), split = h * 0.6;
      const f1 = frame(w, split, [30, 14, 14, 40], 0, UNTIL, 0, 9.5);
      yTicks(c, f1, [0, 3, 6, 9], v => fmt(v)); axes(c, f1, '', t('ch8.cv.y1'));
      const shown = res.series.filter(q => q[0] <= ck.t);
      // treatment period shading
      c.fillStyle = 'rgba(233,185,73,.07)'; c.fillRect(f1.L + 1, f1.T, f1.X(Math.min(+sDays.value * 24, UNTIL)) - f1.L - 1, f1.B - f1.T);
      const seg = (idx, col) => { // draw only while the strain exists
        let run = [];
        const flush = () => { if (run.length > 1) path(c, run, f1.X, f1.Y, col); run = []; };
        for (const q of shown) { if (q[idx] >= 1) run.push([q[0], lg(q[idx])]); else { if (run.length) { run.push([q[0], 0]); } flush(); } }
        flush();
      };
      seg(1, C.cyan); seg(2, C.red);
      const f2 = frame(w, h, [split + 26, 14, 38, 40], 0, UNTIL, Math.log2(0.25), Math.log2(64));
      const Y2 = v => f2.Y(Math.log2(Math.max(0.25, v)));
      c.fillStyle = 'rgba(179,157,251,.16)'; c.fillRect(f2.L + 1, Y2(Bm.P.micR), f2.R - f2.L - 1, Y2(Bm.P.micS) - Y2(Bm.P.micR));
      c.fillStyle = C.mute; c.textAlign = 'right';
      for (const v of [1, 8, 64]) { const y = Y2(v); c.fillText(fmt(v), f2.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f2.L + 1, y); c.lineTo(f2.R, y); c.stroke(); }
      axes(c, f2, t('ch8.cv.x'), t('ch8.cv.y2'));
      xTicks(c, f2, [0, 48, 96, 144, 192, 240, 288, 336], v => fmt(v / 24), true);
      if (dose() > 0) path(c, shown.filter(q => q[3] > 0.25).map(q => [q[0], q[3]]), f2.X, Y2, C.gold, 1.6);
      if (shown.length) { const q = shown[shown.length - 1]; c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f1.X(q[0]), f1.T); c.lineTo(f1.X(q[0]), f2.B); c.stroke(); }
    }
  });
  // bacteria counts: plain below 10 000; Chinese 万/亿 (from copy) or English m × 10ⁿ above
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const cnt = x => {
    if (x < 1) return '0';
    if (x < 1e4) return fmt(x);
    if (effLang() === 'zh') return x < 1e8 ? t('ch8.unit.wan', { v: fmt(x / 1e4, x < 1e5 ? 1 : 0) }) : t('ch8.unit.yi', { v: fmt(x / 1e8, x < 1e9 ? 1 : 0) });
    let e = Math.floor(Math.log10(x)), m = +(x / Math.pow(10, e)).toFixed(1);
    if (m >= 10) { m = 1; e++; }
    return t('ch8.unit.sci', { m: fmt(m, 1), e: String(e).split('').map(d => SUP[+d]).join('') });
  };
  function text() {
    put('#abDo', dose() === 0 ? t('ch8.unit.none') : t('ch8.unit.dose', { v: fmt(dose()) })); put('#abDayso', t(+sDays.value === 1 ? 'ch8.unit.day1' : 'ch8.unit.days', { v: fmt(+sDays.value) }));
    const now = res.series.filter(q => q[0] <= ck.t).pop() || res.series[0], done = ck.t >= UNTIL - 1e-9;
    put('#abS', cnt(now[1])); put('#abR', cnt(now[2]));
    put('#abWin', dose() === 0 ? '—' : fmt(res.winShare * 100) + '%');
    put('#abClr', res.cleared != null && res.cleared <= ck.t ? t('ch8.unit.clr', { v: fmt(res.cleared / 24, 1) }) : done ? t('ch8.unit.noclr') : '…');
    let key;
    if (!done) key = 'ch8.say.running';
    else if (dose() === 0) key = 'ch8.say.none';
    else if (res.cleared != null) key = 'ch8.say.cleared';
    else if (res.S === 0 && res.R > 1) key = 'ch8.say.resistant';
    else if (res.R === 0 && res.S > 1) key = 'ch8.say.relapseS';
    else key = 'ch8.say.mixed';
    putHTML('#abSay', t(key, { clr: res.cleared == null ? '—' : fmt(res.cleared / 24, 1), win: fmt(res.winShare * 100), days: fmt(+sDays.value) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sD, sDays].forEach(e => e.addEventListener('input', redo));
  on('#abReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 09 herd immunity ───────── */
(() => {
  const cv = $('#hdCv'), cv2 = $('#hd2Cv'), Hd = M.herd, N = 1200, SEEDS = 3, GEN = 0.6;
  const sR = $('#hdR'), sV = $('#hdV');
  let seed = 11, run = null, acc = 0;
  const fresh = () => { run = Hd.create(N, +sR.value, +sV.value / 100, seed, SEEDS); acc = 0; if (reduce) while (!run.done) Hd.generation(run); };
  fresh();
  const sim = reg([cv, cv2], {
    step(dt) { if (!run.done) { acc += dt; while (acc >= GEN && !run.done) { acc -= GEN; Hd.generation(run); this.dirty = true; text(); } } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      { const { c, w, h } = fit(cv), cols = w >= 480 ? 40 : 30, rows = N / cols, cell = Math.min((w - 8) / cols, (h - 8) / rows), ox = (w - cell * cols) / 2, oy = (h - cell * rows) / 2;
        const col = [C.dimfill, C.green, C.red, C.gold], r = Math.max(1.2, cell * 0.36);
        for (let i = 0; i < N; i++) { c.fillStyle = col[run.st[i]]; c.beginPath(); c.arc(ox + (i % cols + 0.5) * cell, oy + (Math.floor(i / cols) + 0.5) * cell, r, 0, 6.283); c.fill(); } }
      { const { c, w, h } = fit(cv2), R0 = +sR.value, f = frame(w, h, [24, 14, 36, 44], 0, 1, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%'); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
        xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100) + '%', true);
        const pts = []; for (let v = 0; v <= 1.0001; v += 0.005) pts.push([v, Hd.finalSize(R0, Math.min(v, 1))]);
        const th = Hd.threshold(R0); c.strokeStyle = C.green; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.X(th), f.T); c.lineTo(f.X(th), f.B); c.stroke(); c.setLineDash([]);
        path(c, pts, f.X, f.Y, C.violet);
        const v = +sV.value / 100; cursorDot(c, f.X(v), f.Y(run.infected / N), C.red); }
    }
  });
  function text() {
    const R0 = +sR.value, v = +sV.value / 100;
    put('#hdRo', fmt(R0, 1)); put('#hdVo', fmt(+sV.value) + '%');
    put('#hdRe', fmt(Hd.re(R0, v), 2)); put('#hdThr', fmt(Hd.threshold(R0) * 100) + '%');
    put('#hdInf', t('ch9.unit.people', { v: fmt(run.infected), n: fmt(N) })); put('#hdGen', fmt(run.gen));
    const re = Hd.re(R0, v), share = run.infected / N, fs = Hd.finalSize(R0, v);
    const key = !run.done ? 'ch9.say.running' : re < 1 - 1e-9 ? 'ch9.say.below' : re < 1 + 1e-9 ? 'ch9.say.critical' : share < 0.05 ? 'ch9.say.luck' : 'ch9.say.above';
    putHTML('#hdSay', t(key, { re: fmt(re, 2), inf: fmt(run.infected), pct: fmt(share * 100), fs: fmt(fs * 100), thr: fmt(Hd.threshold(R0) * 100) }));
  }
  sim.text = text;
  const redo = () => { fresh(); sim.dirty = true; text(); };
  [sR, sV].forEach(e => e.addEventListener('input', redo));
  on('#hdGo', 'click', () => { seed++; redo(); });
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt); else if (s.dirty) { s.draw(); s.dirty = false; }
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
