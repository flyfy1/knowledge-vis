/* Why we get sleepy: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.SleepModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  if (x == null || !isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
// clock time hh:mm from hours (any day)
function hm(x) { x = M.mod24(x); let H = Math.floor(x), m = Math.round((x - H) * 60); if (m === 60) { H = (H + 1) % 24; m = 0; } return H + ':' + String(m).padStart(2, '0'); }
const hrs = (x, d = 1) => t('common.h', { v: fmt(x, d) });
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = e.isIntersecting; s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
// x tick labels, dropping any that would collide with the previous one or run off the plot
function xTicks(c, f, vals, lab) {
  c.fillStyle = C.mute; c.textAlign = 'center'; let lastR = -Infinity;
  for (const v of vals) {
    const x = f.X(v), s = lab(v), wd = c.measureText(s).width;
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke();
    if (x - wd / 2 < lastR + 6 || x + wd / 2 > f.R + 4 || x - wd / 2 < f.L - 30) continue;
    c.fillText(s, x, f.B + 11); lastR = x + wd / 2;
  }
}
function yTicks(c, f, vals, lab, grid = true) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(lab(v), f.L - 6, y); if (grid) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); } });
}
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { if (pts.length < 2) return; c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
// spans [t0, t1] where flag(q) holds, from samples sorted by q[0]
function spans(series, flag) { const out = []; let s = null; for (const q of series) { if (flag(q)) { if (s == null) s = q[0]; } else if (s != null) { out.push([s, q[0]]); s = null; } } if (s != null && series.length) out.push([s, series[series.length - 1][0]]); return out; }
function band(c, f, a, b, col) { const x0 = Math.max(f.L, f.X(a)), x1 = Math.min(f.R, f.X(b)); if (x1 > x0) { c.fillStyle = col; c.fillRect(x0, f.T, x1 - x0, f.B - f.T); } }
// replay clock: advances model time on real dt, jumps to the end under reduced motion
const clocks = []; window.__essayClocks = clocks; // inspected by tests/browser.cjs
function clock(until, speed) { const k = { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, done() { return this.t >= this.until - 1e-9; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; clocks.push(k); return k; }
const clockTicks = (x0, x1, every) => { const out = []; for (let v = Math.ceil(x0 / every) * every; v <= x1 + 1e-9; v += every) out.push(v); return out; };

/* raster: one row per day, x = hours from `x0` (e.g. 12 = noon) to x0 + 24 */
function raster(c, w, h, rows, x0, opt = {}) {
  const f = frame(w, h, [26, 12, 34, opt.left || 52], x0, x0 + 24, 0, rows);
  const rh = (f.B - f.T) / rows;
  const rowY = i => f.T + i * rh;
  const xs = clockTicks(x0, x0 + 24, opt.every || 6);
  c.strokeStyle = C.grid; for (const v of xs) { const x = f.X(v); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); }
  xTicks(c, f, xs, v => hm(v));
  c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  // draw a [a, b] interval (absolute hours) into the rows it touches
  f.span = (a, b, col, inset = 0.18) => {
    for (let i = 0; i < rows; i++) {
      const r0 = (opt.day0 + i) * 24 + x0, r1 = r0 + 24, p = Math.max(a, r0), q = Math.min(b, r1);
      if (q > p) { c.fillStyle = col; c.fillRect(f.X(p - r0 + x0), rowY(i) + rh * inset, f.X(q - r0 + x0) - f.X(p - r0 + x0), rh * (1 - 2 * inset)); }
    }
  };
  f.mark = (tAbs, col, r = 4) => { const i = Math.floor((tAbs - x0) / 24) - opt.day0; if (i < 0 || i >= rows) return; const x = (tAbs - x0) - (opt.day0 + i) * 24 + x0; dot(c, f.X(x), rowY(i) + rh / 2, col, Math.min(r, rh * 0.42)); };
  f.tick = (tAbs, col) => { const i = Math.floor((tAbs - x0) / 24) - opt.day0; if (i < 0 || i >= rows) return; const x = f.X((tAbs - x0) - (opt.day0 + i) * 24 + x0); c.fillStyle = col; c.fillRect(x - 1.5, rowY(i) + rh * 0.1, 3, rh * 0.8); };
  f.rowLabel = (i, s) => { c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(s, f.L - 6, rowY(i) + rh / 2); };
  f.rh = rh; f.rowY = rowY;
  return f;
}
const SLEEP = 'rgba(179,157,251,.55)', SLEEPBG = 'rgba(179,157,251,.22)';

/* ───────── 01 sleep pressure ───────── */
(() => {
  const cv = $('#sCv'), sZ = $('#sZ'), DAYS = 7, PRE = 2, ck = clock(DAYS * 24, 24);
  let res = null; const ref = M.S.periodic(16, 8);
  const model = () => { res = M.S.routine({ Z: +sZ.value, days: DAYS, pre: PRE }); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), x0 = 7, x1 = 7 + DAYS * 24, f = frame(w, h, [30, 14, 38, 40], x0, x1, 0, 1);
      const now = x0 + ck.t;
      for (const [a, b] of spans(res.series, q => q[2] === 1)) if (a <= now) band(c, f, a, Math.min(b, now), SLEEPBG);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2));
      axes(c, f, '', t('ch1.cv.y'));   // the ticks already name the days
      const days = []; for (let d = 0; d < DAYS; d++) days.push(x0 + d * 24 + 12);
      xTicks(c, f, days, v => t('common.dayn', { n: fmt(Math.floor((v - x0) / 24) + 1) }));
      // where the sleep length changes
      c.strokeStyle = C.mute; c.setLineDash([2, 3]); c.beginPath(); const xc = f.X(x0 + (PRE + 1) * 24 - +sZ.value); c.moveTo(xc, f.T); c.lineTo(xc, f.B); c.stroke(); c.setLineDash([]);
      hline(c, f, ref.bed, C.gold);
      const shown = res.series.filter(q => q[0] <= now);
      path(c, shown, f.X, f.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, f.X(q[0]), f.Y(q[1]), C.cyan); }
    }
  });
  function text() {
    const Z = +sZ.value, last = res.nights[res.nights.length - 1], p = M.S.periodic(24 - Z, Z);
    put('#sZo', hrs(Z, 1));
    put('#sBed', fmt(last.bed, 2)); put('#sWake', fmt(last.wake, 2));
    put('#sRise', hrs(M.S.halfRise(), 1)); put('#sFall', hrs(M.S.halfFall(), 1));
    // nights until the waking value is within 0.005 of where it settles
    let n = null; for (let i = PRE; i < res.nights.length; i++) if (Math.abs(res.nights[i].wake - p.wake) < 0.005) { n = i - PRE + 1; break; }
    const key = Math.abs(Z - 8) < 1e-9 ? 'ch1.say.same' : Z < 8 ? 'ch1.say.less' : 'ch1.say.more';
    putHTML('#sSay', t(key, { z: fmt(Z, 1), w0: fmt(ref.wake, 2), w: fmt(p.wake, 2), b0: fmt(ref.bed, 2), b: fmt(p.bed, 2), n: fmt(n || DAYS) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  sZ.addEventListener('input', redo);
  on('#sReplay', 'click', () => { ck.restart(); sim.dirty = true; });
  text();
})();

/* ───────── 02 two-process model ───────── */
(() => {
  const cv = $('#tpCv'), sA = $('#tpA'), sC = $('#tpC'), DAYS = 14, SHOW = 4;
  let res = null, cyc = 24;
  const model = () => { res = M.TP.run({ cbt: +sC.value, a: +sA.value, days: DAYS }); cyc = M.TP.cycle({ cbt: +sC.value, a: +sA.value }); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), x1 = DAYS * 24 + 7, x0 = x1 - SHOW * 24, f = frame(w, h, [30, 14, 38, 40], x0, x1, 0, 1);
      const ser = res.series.filter(q => q[0] >= x0 - 0.2);
      for (const [a, b] of spans(ser, q => q[4] === 1)) band(c, f, a, b, SLEEPBG);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2));
      axes(c, f, t('ch2.cv.x'), t('ch1.cv.y'));
      xTicks(c, f, clockTicks(x0, x1, 6), v => hm(v));
      path(c, ser.map(q => [q[0], q[2]]), f.X, f.Y, C.red, 1.4, [5, 4]);
      path(c, ser.map(q => [q[0], q[3]]), f.X, f.Y, C.green, 1.4, [5, 4]);
      path(c, ser.map(q => [q[0], q[1]]), f.X, f.Y, C.cyan);
    }
  });
  function text() {
    const a = +sA.value, cbt = +sC.value;
    put('#tpAo', fmt(a, 3)); put('#tpCo', hm(cbt));
    const locked = Math.abs(cyc - 24) < 0.05;
    const ev = res.events; let i = ev.length - 1; while (i > 0 && ev[i].type !== 'wake') i--;
    const sl = ev[i - 1], wk = ev[i];
    put('#tpOn', locked ? hm(sl.t) : t('ch2.unit.drift')); put('#tpWake', locked ? hm(wk.t) : t('ch2.unit.drift'));
    put('#tpDur', hrs(wk.t - sl.t, 1)); put('#tpCyc', hrs(cyc, 1));
    const key = a === 0 ? 'ch2.say.none' : !locked ? 'ch2.say.drift' : 'ch2.say.locked';
    putHTML('#tpSay', t(key, { on: hm(sl.t), wake: hm(wk.t), dur: fmt(wk.t - sl.t, 1), cyc: fmt(cyc, 1), cbt: hm(cbt) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sA, sC].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* ───────── 03 staying up, naps, all-nighters ───────── */
(() => {
  const cv = $('#sdCv'), sX = $('#sdX'), cN = $('#sdNap'), SPAN = 53, ck = clock(SPAN, 8);
  let res = null;
  const model = () => { res = M.TP.scenario({ extra: +sX.value, nap: cN.checked }); };
  model();
  const when = x => t('ch3.unit.when', { d: t('ch3.day.' + Math.min(2, Math.floor(x / 24))), t: hm(x) });
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), D = res.D, x0 = D + 7, x1 = x0 + SPAN, now = x0 + ck.t, split = Math.round(h * 0.6);
      const f = frame(w, split, [30, 14, 16, 44], x0, x1, 0, 1.1);
      const ser = res.run.series.filter(q => q[0] >= x0 - 0.1 && q[0] <= x1 + 0.1);
      const shown = ser.filter(q => q[0] <= now);
      const X = +sX.value;
      if (X > 0) band(c, f, D + 20, Math.min(now, D + res.natural.onset + X), 'rgba(240,122,109,.16)');
      if (cN.checked && now > D + 14) band(c, f, D + 14, Math.min(now, D + 15), SLEEPBG);
      for (const [a, b] of spans(shown, q => q[4] === 1)) band(c, f, a, b, SLEEPBG);
      yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1));
      axes(c, f, '', t('ch1.cv.y'));
      path(c, ser.map(q => [q[0], q[2]]), f.X, f.Y, C.red, 1.3, [5, 4]);
      path(c, shown, f.X, f.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, f.X(q[0]), f.Y(q[1]), C.cyan); }
      // lower panel: S − H⁺ while awake (above 0 = would fall asleep if allowed)
      const g = frame(w, h, [split + 26, 14, 38, 44], x0, x1, -0.6, 0.35);
      yTicks(c, g, [-0.5, 0, 0.3], v => fmt(v, 1));
      axes(c, g, t('ch2.cv.x'), t('ch3.cv.gap'));
      c.strokeStyle = C.mute; c.beginPath(); c.moveTo(g.L, g.Y(0)); c.lineTo(g.R, g.Y(0)); c.stroke();
      xTicks(c, g, clockTicks(x0, x1, 6), v => hm(v));
      let run = [];
      const flush = () => { if (run.length > 1) { c.fillStyle = 'rgba(240,122,109,.3)'; c.beginPath(); c.moveTo(g.X(run[0][0]), g.Y(0)); for (const p of run) c.lineTo(g.X(p[0]), g.Y(Math.min(0.35, Math.max(0, p[1])))); c.lineTo(g.X(run[run.length - 1][0]), g.Y(0)); c.fill(); path(c, run, g.X, v => g.Y(Math.max(-0.6, Math.min(0.35, v))), C.gold, 1.8); } run = []; };
      for (const q of shown) { if (q[4] === 0) run.push([q[0], q[1] - q[2]]); else flush(); }
      flush();
    }
  });
  function text() {
    const X = +sX.value, nap = cN.checked, r = res, nat = r.natural;
    put('#sdXo', X === 0 ? t('ch3.unit.none') : hrs(X, 0));
    put('#sdOn', when(r.rec.onset)); put('#sdWake', when(r.rec.wake)); put('#sdDur', hrs(r.rec.dur, 1));
    const sleepy = r.worst && r.worst.gap > 0;
    put('#sdWorst', X === 0 ? t('ch3.unit.noworst') : sleepy ? when(r.worst.t) : t('ch3.unit.notsleepy'));
    const v = { on: hm(r.rec.onset), wake: hm(r.rec.wake), dur: fmt(r.rec.dur, 1), nat: fmt(nat.dur, 1), non: hm(nat.onset), x: fmt(X),
      more: fmt(r.rec.dur - nat.dur, 1), less: fmt(nat.dur - r.rec.dur, 1), worst: sleepy ? hm(r.worst.t) : '' };
    let key;
    if (X === 0) key = nap ? 'ch3.say.nap' : 'ch3.say.base';
    else if (!sleepy) key = 'ch3.say.easy';
    else if (r.rec.dur > nat.dur) key = 'ch3.say.long';
    else key = 'ch3.say.short';
    putHTML('#sdSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  sX.addEventListener('input', redo); cN.addEventListener('change', redo);
  on('#sdReplay', 'click', () => { ck.restart(); sim.dirty = true; });
  text();
})();

/* ───────── 04 a clock that runs a little long ───────── */
(() => {
  const cv = $('#frCv'), sT = $('#frT'), DAYS = 20, ck = clock(DAYS, 3);
  let cbt = [];
  const model = () => { cbt = M.coupled.isolation({ tau: +sT.value, dark: radioVal('frRoom') === 'dark', days: DAYS }); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), dark = radioVal('frRoom') === 'dark';
      const day0 = Math.floor((cbt[0] + 6) / 24);
      const f = raster(c, w, h, DAYS, -6, { day0, every: 6 });
      const shownRows = Math.ceil(ck.t);
      if (!dark) for (let i = 0; i < Math.min(DAYS, shownRows); i++) { const base = (day0 + i) * 24; f.span(base + 7, base + 23, 'rgba(99,199,230,.18)', 0.1); f.span(base - 24 + 7, base - 24 + 23, 'rgba(99,199,230,.18)', 0.1); }
      for (let i = 0; i < DAYS; i += 4) f.rowLabel(i, t('common.dayn', { n: fmt(i + 1) }));
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch4.cv.x'), f.R, f.B + 26);
      cbt.forEach((v, i) => { if (i < shownRows) f.mark(v, C.gold, 5); });
    }
  });
  function text() {
    const tau = +sT.value, dark = radioVal('frRoom') === 'dark';
    put('#frTo', hrs(tau, 2));
    const n = cbt.length, per = n > 1 ? (cbt[n - 1] - cbt[0]) / (n - 1) - 24 : 0, tot = n > 1 ? cbt[n - 1] - cbt[0] - 24 * (n - 1) : 0;
    put('#frFirst', hm(cbt[0])); put('#frLast', hm(cbt[n - 1]));
    put('#frDay', t('common.hsigned', { v: (per >= 0 ? '+' : '−') + fmt(Math.abs(per), 2) }));
    put('#frTot', t('common.hsigned', { v: (tot >= 0 ? '+' : '−') + fmt(Math.abs(tot), 1) }));
    const key = !dark ? 'ch4.say.day' : Math.abs(per) < 0.02 ? 'ch4.say.flat' : per > 0 ? 'ch4.say.later' : 'ch4.say.earlier';
    putHTML('#frSay', t(key, { per: fmt(Math.abs(per), 2), tot: fmt(Math.abs(tot), 1), n: fmt(n), tau: fmt(tau, 2), first: hm(cbt[0]), last: hm(cbt[n - 1]) }));
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  sT.addEventListener('input', redo); radios('frRoom').forEach(r => r.addEventListener('change', redo));
  on('#frReplay', 'click', () => { ck.restart(); sim.dirty = true; });
  text();
})();

/* ───────── 05 phase response curve ───────── */
const PULSES = { long: { dur: 6.7, lux: 9500, meas: 5.02 }, short: { dur: 1, lux: 8000, meas: 2.20 }, room: { dur: 6.7, lux: 300, meas: null } };
const CBT_HOME = 3.5; // where ch6's default clock puts the temperature minimum
(() => {
  const cv = $('#prCv'), sO = $('#prO'), cache = {};
  const curve = k => cache[k] || (cache[k] = M.jfk.prcCurve({ dur: PULSES[k].dur, lux: PULSES[k].lux, step: 0.5 }));
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), k = radioVal('prP'), cu = curve(k), f = frame(w, h, [30, 14, 38, 44], -12, 12, -3, 3);
      c.fillStyle = 'rgba(99,199,230,.07)'; c.fillRect(f.X(-12), f.T, f.X(0) - f.X(-12), f.B - f.T);
      c.fillStyle = 'rgba(233,185,73,.07)'; c.fillRect(f.X(0), f.T, f.X(12) - f.X(0), f.B - f.T);
      yTicks(c, f, [-3, -2, -1, 0, 1, 2, 3], v => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)));
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      xTicks(c, f, [-12, -9, -6, -3, 0, 3, 6, 9, 12], v => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)));
      c.strokeStyle = C.mute; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      c.setLineDash([3, 3]); c.beginPath(); c.moveTo(f.X(0), f.T); c.lineTo(f.X(0), f.B); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch5.cv.delay'), f.L + 8, f.T + 12);   // empty corners of the plot
      c.textAlign = 'right'; c.fillText(t('ch5.cv.advance'), f.R - 8, f.B - 12);
      path(c, cu, f.X, f.Y, C.violet);
      const o = +sO.value, v = cu.find(q => Math.abs(q[0] - o) < 1e-9)[1];
      c.strokeStyle = C.gold; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(o), f.Y(0)); c.lineTo(f.X(o), f.Y(v)); c.stroke();
      dot(c, f.X(o), f.Y(v), C.gold, 6);
    }
  });
  function text() {
    const k = radioVal('prP'), cu = curve(k), o = +sO.value, v = cu.find(q => Math.abs(q[0] - o) < 1e-9)[1];
    const pt = Math.max(...cu.map(q => q[1])) - Math.min(...cu.map(q => q[1]));
    put('#prOo', t('ch5.unit.offset', { v: (o > 0 ? '+' : o < 0 ? '−' : '±') + fmt(Math.abs(o), 1) }));
    put('#prShift', Math.abs(v) < 0.05 ? t('ch5.unit.none') : t(v > 0 ? 'ch5.unit.adv' : 'ch5.unit.del', { v: fmt(Math.abs(v), 1) }));
    put('#prClock', hm(CBT_HOME + o)); put('#prPT', hrs(pt, 1)); put('#prMeas', PULSES[k].meas ? hrs(PULSES[k].meas, 2) : t('ch5.unit.nomeas'));
    const key = Math.abs(v) < 0.05 ? 'ch5.say.none' : v > 0 ? 'ch5.say.adv' : 'ch5.say.del';
    putHTML('#prSay', t(key, { v: fmt(Math.abs(v), 1), clock: hm(CBT_HOME + o), o: fmt(Math.abs(o), 1), cbt: hm(CBT_HOME), pulse: t('ch5.pulse.' + k) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sO.addEventListener('input', redo); radios('prP').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 06 entrainment and chronotype ───────── */
const DAYLUX = [100, 300, 1000, 3000, 10000], EVELUX = [10, 50, 150, 300, 500];
(() => {
  const cv = $('#chCv'), sT = $('#chT'), sD = $('#chD'), sE = $('#chE'), ROWS = 10;
  let res = null;
  const model = () => { res = M.coupled.chronotype({ tau: +sT.value, day: DAYLUX[+sD.value], eve: EVELUX[+sE.value] }); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), ev = res.run.events, last = ev[ev.length - 1].loc;
      const day0 = Math.floor((last - 12) / 24) - ROWS + 1;
      const f = raster(c, w, h, ROWS, 12, { day0, every: 6 });
      for (let i = 0; i < ROWS + 1; i++) { const b = (day0 + i) * 24; f.span(b + 7, b + 19, 'rgba(233,185,73,.16)', 0.08); }
      for (const [a, b] of M.coupled.episodes(ev)) f.span(a, b, SLEEP);
      for (const v of res.run.cbt) f.mark(v, C.gold, 5);
      for (let i = 0; i < ROWS; i += 3) f.rowLabel(i, t('common.dayn', { n: fmt(i + 1) }));
    }
  });
  function text() {
    const r = res;
    put('#chTo', hrs(+sT.value, 2)); put('#chDo', t('common.lux', { v: fmt(DAYLUX[+sD.value]) })); put('#chEo', t('common.lux', { v: fmt(EVELUX[+sE.value]) }));
    put('#chOn', r.held ? hm(r.onset) : t('ch2.unit.drift')); put('#chWake', r.held ? hm(r.wake) : t('ch2.unit.drift'));
    put('#chCbt', r.held ? hm(r.cbt) : t('ch2.unit.drift'));
    put('#chHeld', r.held ? t('ch6.unit.held') : t('ch6.unit.drift', { v: fmt(r.drift * 60) }));
    const flipped = r.held && r.onset > 6 && r.onset < 18;   // held, but asleep through the day
    const key = !r.held ? 'ch6.say.drift' : flipped ? 'ch6.say.flipped' : 'ch6.say.held';
    putHTML('#chSay', t(key, { on: hm(r.onset), wake: hm(r.wake), cbt: hm(r.cbt), min: fmt(r.drift * 60) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sT, sD, sE].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* ───────── 07 jet lag ───────── */
(() => {
  const cv = $('#jlCv'), sN = $('#jlN'), sT = $('#jlT'), DAYS = 14, ck = clock(DAYS, 2.5);
  let E = null, Wd = null;
  const model = () => {
    const tau = +sT.value, lux = M.light.simple(+radioVal('jlL'), 150), N = +sN.value;
    E = M.coupled.jet({ N, tau, lux }); Wd = M.coupled.jet({ N: -N, tau, lux });
  };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), N = +sN.value, ym = Math.max(4, Math.ceil(N + 1)), f = frame(w, h, [30, 14, 38, 44], 0, DAYS, -ym, ym);
      c.fillStyle = 'rgba(122,214,160,.14)'; c.fillRect(f.L + 1, f.Y(1), f.R - f.L - 1, f.Y(-1) - f.Y(1));
      const ys = []; const st = ym > 8 ? 4 : 2; for (let v = -ym + (ym % st); v <= ym; v += st) ys.push(v);
      yTicks(c, f, ys, v => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)));
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      xTicks(c, f, [0, 2, 4, 6, 8, 10, 12, 14], v => fmt(v));
      c.strokeStyle = C.mute; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      const draw = (r, N0, col) => {
        // start point at landing (misalignment = N0), then each CBTmin after landing; break the line where it wraps
        const pts = [[0, N0]].concat(r.mis.map(m => [m.day, m.d])).filter(p => p[0] <= ck.t + 1e-9 && p[0] <= DAYS);
        let seg = [];
        for (const p of pts) { if (seg.length && Math.abs(p[1] - seg[seg.length - 1][1]) > 8) { path(c, seg, f.X, f.Y, col); seg = []; } seg.push(p); }
        path(c, seg, f.X, f.Y, col); if (pts.length) { const p = pts[pts.length - 1]; dot(c, f.X(p[0]), f.Y(p[1]), col); }
      };
      draw(E, N, C.gold); draw(Wd, -N, C.cyan);
    }
  });
  const days = r => r.settle == null ? t('ch7.unit.never', { v: fmt(DAYS) }) : t('ch7.unit.days', { v: fmt(r.settle, 1) });
  // average daily movement over the first three days after landing (h/day)
  const rate = r => r.mis.length > 3 ? Math.abs(r.mis[0].d - r.mis[3].d) / (r.mis[3].day - r.mis[0].day) : 0;
  function text() {
    const N = +sN.value;
    put('#jlNo', t(N === 1 ? 'ch7.unit.zone1' : 'ch7.unit.zones', { v: fmt(N) })); put('#jlTo', hrs(+sT.value, 2));
    put('#jlE', days(E)); put('#jlW', days(Wd));
    put('#jlNight', hrs(E.nights[0], 1)); put('#jlDoze', hrs(Wd.doze[0], 1));
    const es = E.settle == null ? 99 : E.settle, ws = Wd.settle == null ? 99 : Wd.settle;
    const key = N === 12 ? 'ch7.say.twelve' : (E.settle == null || Wd.settle == null) ? 'ch7.say.unsettled' : E.antidromic ? 'ch7.say.anti' : es > ws + 0.9 ? 'ch7.say.eastslow' : ws > es + 0.9 ? 'ch7.say.westslow' : 'ch7.say.same';
    putHTML('#jlSay', t(key, { n: fmt(N), e: E.settle == null ? '—' : fmt(E.settle, 1), w: Wd.settle == null ? '—' : fmt(Wd.settle, 1), days: fmt(DAYS), eS: days(E), wS: days(Wd), re: fmt(rate(E), 1), rw: fmt(rate(Wd), 1), tau: fmt(+sT.value, 2) }));
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  [sN, sT].forEach(e => e.addEventListener('input', redo)); radios('jlL').forEach(r => r.addEventListener('change', redo));
  on('#jlReplay', 'click', () => { ck.restart(); sim.dirty = true; });
  text();
})();

/* ───────── 08 weekends and night shifts ───────── */
const WORKLUX = [30, 100, 300, 1000], COMMUTE = [100, 1000, 10000];
const OFFICE_DAY = 300, NIGHT_DAY = 1000; // an office worker indoors by day; a night worker out in the afternoon
(() => {
  const cv = $('#wkCv'), sE = $('#wkE'), sW = $('#wkW'), sC = $('#wkC'), ROWS = 14;
  let res = null;
  const kind = () => radioVal('wkK');
  const model = () => {
    res = kind() === 'office'
      ? M.coupled.week({ kind: 'office', day: OFFICE_DAY, eve: EVELUX[+sE.value] })
      : M.coupled.week({ kind: 'night', day: NIGHT_DAY, work: WORKLUX[+sW.value], commute: COMMUTE[+sC.value] });
  };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), day0 = res.from / 24 - 1;
      const f = raster(c, w, h, ROWS, 12, { day0, every: 6, left: 44 });
      const night = kind() === 'night';
      for (let i = 0; i < ROWS + 1; i++) {
        const d = day0 + i, b = d * 24, dw = ((d % 7) + 7) % 7;
        if (night && dw < 5) f.span(b + 23, b + 31, 'rgba(240,122,109,.3)', 0.06);
      }
      for (const e of res.episodes) f.span(e.a, e.b, SLEEP);
      if (!night) for (let i = 0; i < ROWS + 1; i++) { const d = day0 + i + 1, dw = ((d % 7) + 7) % 7; if (dw < 5) f.tick(d * 24 + 7, C.red); }
      for (const v of res.cbt) f.mark(v, C.gold, 5);
      // row labels: the weekday whose evening starts the row
      for (let i = 0; i < ROWS; i++) f.rowLabel(i, t('ch8.dow.' + (((day0 + i) % 7) + 7) % 7));
    }
  });
  function text() {
    const r = res, night = kind() === 'night';
    $('#wkEL').hidden = night; $('#wkWL').hidden = !night; $('#wkCL').hidden = !night;
    put('#wkEo', t('common.lux', { v: fmt(EVELUX[+sE.value]) }));
    put('#wkWo', t('common.lux', { v: fmt(WORKLUX[+sW.value]) })); put('#wkCo', t('common.lux', { v: fmt(COMMUTE[+sC.value]) }));
    if (!night) {
      put('#wkAl', t('ch8.read.sjl')); put('#wkBl', t('ch8.read.work')); put('#wkCl2', t('ch8.read.free')); put('#wkDl', t('ch8.read.sun'));
      const sjl = Math.max(0, r.sjl);
      put('#wkA', hrs(sjl, 1)); put('#wkB', hrs(r.durWork, 1)); put('#wkC2', hrs(r.durFree, 1)); put('#wkD', r.sundayOnset == null ? '—' : hm(r.sundayOnset));
      const key = sjl < 0.1 ? 'ch8.say.none' : 'ch8.say.sjl';
      putHTML('#wkSay', t(key, { sjl: fmt(sjl, 1), min: fmt(sjl * 60), w: fmt(r.durWork, 1), f: fmt(r.durFree, 1), sun: r.sundayOnset == null ? '—' : hm(r.sundayOnset), mon: fmt(r.mondayDur, 1), eve: fmt(EVELUX[+sE.value]) }));
    } else {
      put('#wkAl', t('ch8.read.cbtmon')); put('#wkBl', t('ch8.read.cbtsat')); put('#wkCl2', t('ch8.read.day')); put('#wkDl', t('ch8.read.week'));
      const slide = Math.abs(r.weekShift) > 0.5, pos = r.cbtSat;
      put('#wkA', hm(r.cbtMon)); put('#wkB', hm(r.cbtSat)); put('#wkC2', hrs(r.daySleep, 1));
      put('#wkD', t('common.hsigned', { v: (r.weekShift >= 0 ? '+' : '−') + fmt(Math.abs(r.weekShift), 1) }));
      const key = slide ? 'ch8.say.torn' : (pos >= 9 && pos < 21) ? 'ch8.say.flipped' : 'ch8.say.daylocked';
      putHTML('#wkSay', t(key, { mon: hm(r.cbtMon), sat: hm(r.cbtSat), day: fmt(r.daySleep, 1), work: fmt(WORKLUX[+sW.value]), lux: fmt(COMMUTE[+sC.value]), wk: fmt(Math.abs(r.weekShift), 1) }));
    }
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sE, sW, sC].forEach(e => e.addEventListener('input', redo)); radios('wkK').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 09 caffeine ───────── */
(() => {
  const cv = $('#cfCv'), sT = $('#cfT'), sH = $('#cfH');
  const nat = M.TP.settled({ cbt: 3.5 });
  const bed = M.mod24(nat.onset) < 12 ? 24 + M.mod24(nat.onset) : M.mod24(nat.onset);
  // S over the same day from the settled two-process run (07:00 to the next morning)
  const tp = nat.run.series, dayStart = tp.filter(q => M.mod24(q[0]) < 7.05 && M.mod24(q[0]) > 6.95 && q[0] > 72).pop()[0];
  const sDay = tp.filter(q => q[0] >= dayStart && q[0] <= dayStart + 27).map(q => [q[0] - dayStart + 7, q[1]]);
  const calc = () => { const T = +sT.value, H = +sH.value, D = +radioVal('cfD'), doses = [{ t: T, mg: D }];
    const pts = []; for (let x = 6; x <= 34 + 1e-9; x += 0.1) pts.push([x, M.caffeine.amount(x, doses, H)]);
    const pk = pts.reduce((a, b) => b[1] > a[1] ? b : a);
    return { T, H, D, doses, pts, pk, atBed: M.caffeine.amount(bed, doses, H) }; };
  let res = calc();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 44, 38, 44], 6, 34, 0, 220), r = res;
      yTicks(c, f, [0, 50, 100, 150, 200], v => fmt(v));
      axes(c, f, t('ch2.cv.x'), t('ch9.cv.y'));
      xTicks(c, f, clockTicks(6, 34, 4), v => hm(v));
      // right axis for S (0–1)
      const Ys = v => f.B - (f.B - f.T) * v;
      c.fillStyle = C.mute; c.textAlign = 'left'; [0, 0.5, 1].forEach(v => c.fillText(fmt(v, 1), f.R + 6, Ys(v)));
      c.textAlign = 'right'; c.fillText(t('ch9.cv.s'), f.R + 40, f.T - 12);
      c.strokeStyle = C.violet; c.setLineDash([5, 4]); c.lineWidth = 1.3; c.beginPath(); c.moveTo(f.X(bed), f.T); c.lineTo(f.X(bed), f.B); c.stroke(); c.setLineDash([]);
      path(c, sDay.filter(q => q[0] <= bed), f.X, Ys, C.cyan, 1.6);
      path(c, r.pts, f.X, f.Y, C.gold);
      dot(c, f.X(bed), f.Y(r.atBed), C.gold);
    }
  });
  function text() {
    const r = res, share = r.atBed / r.D, gap = bed - r.T;
    put('#cfTo', hm(r.T)); put('#cfHo', hrs(r.H, 1));
    put('#cfPeak', t('ch9.unit.mgat', { v: fmt(r.pk[1]), t: hm(r.pk[0]) }));
    put('#cfBed', t('ch9.unit.mg', { v: fmt(r.atBed) })); put('#cfShare', fmt(share * 100) + '%');
    const sBed = sDay.filter(q => q[0] <= bed).pop()[1];
    put('#cfS', fmt(sBed, 2));
    const key = share >= 0.5 ? 'ch9.say.most' : share >= 0.25 ? 'ch9.say.half' : 'ch9.say.little';
    putHTML('#cfSay', t(key, { mg: fmt(r.atBed), pct: fmt(share * 100), h: fmt(gap, 1), half: fmt(r.H, 1), bed: hm(bed), dose: fmt(r.D) }));
  }
  sim.text = text;
  const redo = () => { res = calc(); sim.dirty = true; text(); };
  [sT, sH].forEach(e => e.addEventListener('input', redo)); radios('cfD').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
