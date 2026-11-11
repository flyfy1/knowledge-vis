/* Why the planet warms: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.ClimateModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const E = M.EARTH, SIG = M.SIGMA;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const effLang = () => (COPY[lang] ? lang : 'zh');
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
// numbers: grouping and decimals follow the language shown; a true minus sign; no "−0"
function fmt(x, d = 0) {
  if (!isFinite(x)) return t('common.none');
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
}
// two significant figures for large, loosely known quantities (optical depth)
const sig2 = x => { if (!(x > 0)) return fmt(0); const e = Math.floor(Math.log10(x)) - 1; const m = Math.pow(10, Math.max(0, e)); return fmt(Math.round(x / m) * m); };
const kc = T => t('common.kc', { k: fmt(T, 0), c: fmt(M.K2C(T), 0) });
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
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab, opt = {}) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  // keep the axis name inside the canvas: on narrow screens a long (English) label is shifted left of the axis
  if (yLab) { c.textAlign = 'left'; const cw = c.canvas.width / (c.getTransform().a || 1); c.fillText(yLab, Math.max(4, Math.min(f.L + 6, cw - c.measureText(yLab).width - 4)), f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + (opt.xLabDy || 25)); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4], lw = 1.3) { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { if (dash) c.setLineDash(dash); c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); if (dash) c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
// a vertical arrow of given width from (x, y0) to (x, y1); head at y1
function varrow(c, x, y0, y1, wid, col) {
  if (wid < 0.4 || Math.abs(y1 - y0) < 4) return;
  const dir = y1 > y0 ? 1 : -1, head = Math.min(10, Math.abs(y1 - y0) * 0.5), hw = Math.max(wid / 2 + 4, 6);
  c.fillStyle = col; c.fillRect(x - wid / 2, Math.min(y0, y1 - dir * head), wid, Math.abs(y1 - dir * head - y0));
  c.beginPath(); c.moveTo(x - hw, y1 - dir * head); c.lineTo(x + hw, y1 - dir * head); c.lineTo(x, y1); c.closePath(); c.fill();
}
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
const TE = M.balance.Te(E.S, E.albedo), A0 = M.balance.absorbed(E.S, E.albedo);

/* ───────── 01 bare planet ───────── */
(() => {
  const cv = $('#blCv'), B = M.balance, SPAN = 15, SPEED = 2;
  const sS = $('#blS'), sA = $('#blA');
  const p = () => ({ S: +sS.value, albedo: +sA.value });
  const s = B.create(288); let hist = [[0, 288]], last = 0;
  function run(span) {
    M.advance(s, span, B.H, (st, h) => B.step(st, h, p()));
    if (s.t - last >= 0.05 || span > 1) { hist.push([s.t, s.T]); last = s.t; }
    while (hist.length > 2 && hist[1][0] < s.t - SPAN) hist.shift();
  }
  const settle = () => { const P = p(); s.T = B.Te(P.S, P.albedo); hist.push([s.t, s.T]); };
  if (reduce) settle();
  const sim = reg(cv, {
    step(dt) { run(dt * SPEED); this.dirty = true; text(); },
    draw() {
      const { c, w, h } = fit(cv), P = p(), A = B.absorbed(P.S, P.albedo), Te = B.Te(P.S, P.albedo), out = B.emitted(s.T);
      // schematic: sunlight in (gold, from above), infrared out (red, upward); width ∝ flux
      const sw = Math.min(170, Math.max(96, w * 0.26)), cx = sw * 0.5, cy = h * 0.58, R = Math.min(sw * 0.3, h * 0.2);
      const grd = c.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R);
      grd.addColorStop(0, '#2f6f8f'); grd.addColorStop(1, '#173445');
      c.fillStyle = grd; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.fill();
      const k = 0.05;
      varrow(c, cx - R * 0.45, 12, cy - R - 2, A * k, C.gold);
      varrow(c, cx + R * 0.45, cy - R - 2, 12, out * k, C.red);
      // trace
      const f = frame(w, h, [30, 14, 38, sw + 46], Math.max(0, s.t - SPAN), Math.max(SPAN, s.t), 140, 330);
      if (f.R - f.L > 60) {
        yTicks(c, f, [150, 200, 250, 300], v => fmt(v));
        axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
        hline(c, f, 288, C.green, [2, 3]);
        hline(c, f, Math.max(140, Te), C.gold);
        path(c, hist.map(q => [q[0], Math.max(140, q[1])]), f.X, f.Y, C.cyan);
        dot(c, f.X(s.t), f.Y(Math.max(140, s.T)), C.cyan);
      }
    }
  });
  function text() {
    const P = p(), A = B.absorbed(P.S, P.albedo), Te = B.Te(P.S, P.albedo), out = B.emitted(s.T), gap = A - out;
    put('#blSo', t('common.w', { v: fmt(P.S) })); put('#blAo', fmt(P.albedo, 2));
    put('#blIn', t('common.w', { v: fmt(A) })); put('#blOut', t('common.w', { v: fmt(out) }));
    put('#blT', kc(s.T)); put('#blTe', kc(Te));
    let key;
    if (Math.abs(s.T - Te) < 0.3) key = Math.abs(Te - 288) < 1 ? 'ch1.say.flatMatch' : Te < 288 ? 'ch1.say.flatLow' : 'ch1.say.flatHigh';
    else key = gap > 0 ? 'ch1.say.warm' : 'ch1.say.cool';
    putHTML('#blSay', t(key, { gap: fmt(Math.abs(gap), 1), te: fmt(Te, 0), tec: fmt(M.K2C(Te), 0), a: fmt(A), d: fmt(Math.abs(288 - Te), 0) }));
  }
  sim.text = text;
  const changed = () => { if (reduce) settle(); sim.dirty = true; text(); };
  [sS, sA].forEach(e => e.addEventListener('input', changed));
  on('#blReset', 'click', () => { s.T = 288; hist = [[s.t, 288]]; changed(); if (reduce) settle(); });
  on('#blToday', 'click', () => { sS.value = E.S; sA.value = E.albedo; changed(); });
  text();
})();

/* ───────── 02 one layer ───────── */
(() => {
  const cv = $('#olCv'), L = M.layers, SPAN = 15, SPEED = 2;
  const sE = $('#olE');
  const eps = () => +sE.value;
  const P = () => ({ S: E.S, albedo: E.albedo, eps: eps() });
  let s = L.create(1, TE, TE), hist = [[0, TE, TE]], last = 0;
  function run(span) {
    M.advance(s, span, L.H, (x, h) => L.step(x, h, P()));
    if (s.t - last >= 0.05) { hist.push([s.t, s.Ts, s.T[0]]); last = s.t; }
    while (hist.length > 2 && hist[1][0] < s.t - SPAN) hist.shift();
  }
  const settle = () => { const q = L.oneLayer(eps(), TE); s.Ts = q.Ts; if (eps() > 0) s.T[0] = q.Ta; hist.push([s.t, s.Ts, s.T[0]]); };
  if (reduce) settle();
  const sim = reg(cv, {
    step(dt) { run(dt * SPEED); this.dirty = true; text(); },
    draw() {
      const { c, w, h } = fit(cv), e = eps(), fl = L.fluxes(s, e), up0 = SIG * Math.pow(s.Ts, 4), la = e * SIG * Math.pow(s.T[0], 4);
      const sw = Math.min(210, Math.max(120, w * 0.3)), gY = h - 34, lY = h * 0.42, k = 0.035;
      // ground and layer
      c.fillStyle = '#3b3326'; c.fillRect(8, gY, sw - 16, 10);
      c.fillStyle = `rgba(179,157,251,${0.08 + 0.32 * e})`; c.fillRect(8, lY - 9, sw - 16, 18);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch2.cv.space'), 10, 12); c.fillText(t('ch2.cv.ground'), 10, gY + 22);
      const x1 = sw * 0.22, x2 = sw * 0.5, x3 = sw * 0.78;
      varrow(c, x1, 26, gY - 2, A0 * k, C.gold);
      varrow(c, x2, gY - 2, lY + 11, up0 * k, C.red);
      varrow(c, x2, lY - 11, 26, (1 - e) * up0 * k, C.red);
      varrow(c, x3, lY - 11, 26, la * k, C.violet);
      varrow(c, x3, lY + 11, gY - 2, la * k, C.violet);
      const f = frame(w, h, [30, 14, 38, sw + 46], Math.max(0, s.t - SPAN), Math.max(SPAN, s.t), 200, 320);
      if (f.R - f.L > 60) {
        yTicks(c, f, [220, 260, 300], v => fmt(v));
        axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        hline(c, f, 288, C.green, [2, 3]);
        if (e > 0) path(c, hist.map(q => [q[0], Math.max(200, q[2])]), f.X, f.Y, C.violet, 1.6);
        path(c, hist.map(q => [q[0], q[1]]), f.X, f.Y, C.cyan);
        dot(c, f.X(s.t), f.Y(s.Ts), C.cyan);
        void fl;
      }
    }
  });
  function text() {
    const e = eps(), fl = L.fluxes(s, e), eq = L.oneLayer(e, TE), sfc = SIG * Math.pow(s.Ts, 4), down = e * SIG * Math.pow(s.T[0], 4);
    put('#olEo', fmt(e, 2));
    put('#olTs', kc(s.Ts)); put('#olTa', e > 0 ? t('common.k', { v: fmt(s.T[0]) }) : t('common.none'));
    let key;
    if (Math.abs(s.Ts - eq.Ts) > 0.3) key = s.Ts < eq.Ts ? 'ch2.say.warming' : 'ch2.say.cooling';
    else if (e < 0.005) key = 'ch2.say.none';
    else key = Math.abs(s.Ts - 288) < 1 ? 'ch2.say.match' : 'ch2.say.settled';
    // once settled (within 0.3 K) show the steady-state outgoing flux, which equals the absorbed sunlight exactly;
    // the still-converging value would read 241 beside the 242 W/m² of sunlight the sentence says it equals
    const upShown = Math.abs(s.Ts - eq.Ts) > 0.3 ? fl.up : A0;
    put('#olDown', t('common.w', { v: fmt(down) })); put('#olUp', t('common.w', { v: fmt(upShown) }));
    // the surface balance sfc = sunlight + back radiation, stated with the same rounded numbers the tiles show
    const aR = Math.round(A0), dR = Math.round(down), dT = s.Ts - TE;
    putHTML('#olSay', t(key, { eq: fmt(eq.Ts), ts: fmt(s.Ts), tsc: fmt(M.K2C(s.Ts)), d: fmt(dT, dT < 10 ? 1 : 0), sfc: fmt(aR + dR), a: fmt(aR), down: fmt(dR), up: fmt(upShown) }));
    void sfc;
  }
  sim.text = text;
  const changed = () => { if (reduce) settle(); sim.dirty = true; text(); };
  sE.addEventListener('input', changed);
  on('#olReset', 'click', () => { s = L.create(1, TE, TE); s.t = hist.length ? hist[hist.length - 1][0] : 0; hist = [[s.t, TE, TE]]; last = s.t; if (reduce) settle(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 N layers ───────── */
(() => {
  const cv = $('#nlCv'), L = M.layers, SPEED = 6, NMAX = 8;
  const sN = $('#nlN');
  const P = { S: E.S, albedo: E.albedo, eps: 1 };
  let s = L.create(+sN.value, TE, TE);
  const settle = () => { const q = L.stack(s.T.length, TE); s.Ts = q.Ts; s.T = q.T.slice(); };
  if (reduce) settle();
  function resize() {
    const n = +sN.value;
    while (s.T.length < n) s.T.push(s.T.length ? s.T[s.T.length - 1] : s.Ts);
    while (s.T.length > n) s.T.pop();
  }
  const settled = () => { const q = L.stack(s.T.length, TE); return Math.abs(s.Ts - q.Ts) < 0.3 && s.T.every((x, j) => Math.abs(x - q.T[j]) < 0.3); };
  const sim = reg(cv, {
    step(dt) { if (!settled()) { M.advance(s, dt * SPEED, L.H, (x, h) => L.step(x, h, P)); this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), n = s.T.length, f = frame(w, h, [34, 16, 38, 50], 200, 460, 0, NMAX + 0.6);
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
      // grid rows: one per possible layer; drawn ones get a faint band
      for (let j = 1; j <= NMAX; j++) { const y = f.Y(j); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); if (j <= n) { c.fillStyle = 'rgba(179,157,251,.10)'; c.fillRect(f.L + 1, y - 7, f.R - f.L - 1, 14); } }
      c.fillStyle = C.mute; c.textAlign = 'right';
      for (let j = 2; j <= NMAX; j += 2) c.fillText(fmt(j), f.L - 6, f.Y(j));
      c.fillText(t('ch3.cv.ground'), f.L - 6, f.Y(0) - 8);
      c.textAlign = 'left'; c.fillText(t('ch3.cv.y'), f.L + 6, f.T - 16);
      c.textAlign = 'right'; c.fillText(t('ch3.cv.x'), f.R, f.B + 25);
      c.textAlign = 'center'; for (const v of [250, 300, 350, 400, 450]) c.fillText(fmt(v), f.X(v), f.B + 11);
      // 255 K
      c.strokeStyle = C.gold; c.setLineDash([5, 4]); c.lineWidth = 1.3; c.beginPath(); c.moveTo(f.X(TE), f.T); c.lineTo(f.X(TE), f.B); c.stroke(); c.setLineDash([]);
      // profile
      const pts = [[s.Ts, 0]].concat(s.T.map((x, j) => [x, j + 1]));
      path(c, pts.map(q => [Math.min(460, q[0]), q[1]]), f.X, f.Y, C.cyan);
      pts.forEach(q => dot(c, f.X(Math.min(460, q[0])), f.Y(q[1]), C.cyan, 4));
      // arrow to space from the top emitter
      const top = pts[pts.length - 1];
      varrow(c, f.X(Math.min(460, top[0])), f.Y(top[1]) - 8, f.T - 2, 4, C.red);
    }
  });
  function text() {
    const n = s.T.length, fl = L.fluxes(s, 1), q = L.stack(n, TE), topT = n ? s.T[n - 1] : s.Ts;
    put('#nlNo', t(n === 1 ? 'ch3.unit.n1' : 'ch3.unit.n', { v: fmt(n) }));
    const isSettled = settled(), out = isSettled ? A0 : fl.up; // settled: the exact steady-state value (see ch2)
    put('#nlTs', kc(s.Ts)); put('#nlTop', n ? t('common.k', { v: fmt(topT) }) : t('common.none'));
    put('#nlOut', t('common.w', { v: fmt(out) })); put('#nlEq', t('common.k', { v: fmt(q.Ts) }));
    const gap = A0 - fl.up;
    let key;
    if (isSettled) key = n === 0 ? 'ch3.say.zero' : n === 1 ? 'ch3.say.settled1' : 'ch3.say.settled';
    // at the start every layer is still at 255 K, so outgoing = absorbed although the ground is far from settled
    else if (Math.abs(gap) < 0.5) key = 'ch3.say.start';
    else key = gap > 0 ? 'ch3.say.warming' : 'ch3.say.cooling';
    putHTML('#nlSay', t(key, { n: fmt(n), te: fmt(TE), top: fmt(topT), ts: fmt(s.Ts), out: fmt(fl.up), a: fmt(A0), gap: fmt(Math.abs(gap)), eq: fmt(q.Ts) }));
  }
  sim.text = text;
  sN.addEventListener('input', () => { resize(); if (reduce) settle(); sim.dirty = true; text(); });
  on('#nlReset', 'click', () => { s = L.create(+sN.value, TE, TE); if (reduce) settle(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 the 15-micron band ───────── */
(() => {
  const cv = $('#spCv'), cv2 = $('#fcCv'), Bd = M.band;
  const PPM = [4, 6, 8, 10, 15, 20, 30, 40, 60, 80, 100, 140, 200, 280, 350, E.Cnow, 560, 800, 1120, 1600, 2240, 3200, 4096];
  const sC = $('#spC'), cLin = $('#spLin');
  const ppm = () => PPM[+sC.value], shape = () => radioVal('spShape');
  const curves = {};
  const curve = sh => curves[sh] || (curves[sh] = (() => { const out = []; for (let i = 0; i <= 60; i++) { const q = 4 * Math.pow(1024, i / 60); out.push([q, Bd.forcing(q, 280, sh)]); } return out; })());
  let spec = null, ref = null;
  const model = () => { spec = Bd.spectrum(ppm(), shape()); ref = Bd.spectrum(280, shape()); };
  model();
  const yMax = Math.ceil(Math.max(...Bd.Bsurf) * 1.12 * 20) / 20;
  const sim = reg([cv, cv2], {
    draw() {
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 48], Bd.nu1, Bd.nu2, 0, yMax);
        const ys = []; for (let v = 0; v <= yMax + 1e-9; v += 0.1) ys.push(v);
        yTicks(c, f, ys, v => fmt(v, 1)); axes(c, f, t('ch4.cv.x1'), t('ch4.cv.y1'));
        xTicks(c, f, [500, 600, 667, 750, 850], v => fmt(v));
        // outgoing spectrum
        c.fillStyle = 'rgba(99,199,230,.30)'; c.beginPath(); c.moveTo(f.X(Bd.NU[0]), f.B);
        Bd.NU.forEach((v, k) => c.lineTo(f.X(v), f.Y(spec[k]))); c.lineTo(f.X(Bd.NU[Bd.NU.length - 1]), f.B); c.closePath(); c.fill();
        path(c, Bd.NU.map((v, k) => [v, spec[k]]), f.X, f.Y, C.cyan, 1.6);
        path(c, Bd.NU.map((v, k) => [v, ref[k]]), f.X, f.Y, C.gold, 1.4);
        path(c, Bd.NU.map((v, k) => [v, Bd.Bsurf[k]]), f.X, f.Y, C.red, 1.3, [5, 4]);
        path(c, Bd.NU.map((v, k) => [v, Bd.Btop[k]]), f.X, f.Y, C.violet, 1.3, [5, 4]); }
      { const { c, w, h } = fit(cv2), lin = cLin.checked, X0 = lin ? 0 : Math.log10(4), X1 = lin ? 4096 : Math.log10(4096);
        const xv = q => lin ? q : Math.log10(q);
        const f = frame(w, h, [26, 26, 38, 48], X0, X1, -32, 22);
        yTicks(c, f, [-30, -15, 0, 15], v => fmt(v)); axes(c, f, t('ch4.cv.x2'), t('ch4.cv.y2'));
        hline(c, f, 0, C.line, [], 1);
        const ticks = lin ? [0, 1000, 2000, 3000, 4000] : [4, 16, 64, 280, 1024, 4096];
        c.fillStyle = C.mute; c.textAlign = 'center';
        ticks.forEach(q => { const x = f.X(xv(Math.max(q, lin ? 0 : 4))); c.fillText(fmt(q), x, f.B + 11); });
        const ex = curve('exp'), bx = curve('box');
        path(c, bx.map(q => [xv(q[0]), q[1]]), f.X, f.Y, C.violet, 1.5, [5, 4]);
        path(c, ex.map(q => [xv(q[0]), q[1]]), f.X, f.Y, C.cyan, 2);
        dot(c, f.X(xv(ppm())), f.Y(Bd.forcing(ppm(), 280, shape())), shape() === 'exp' ? C.cyan : C.violet, 5); }
    }
  });
  function text() {
    const q = ppm(), sh = shape(), F = Bd.forcing(q, 280, sh), F2 = Bd.forcing(2 * q, 280, sh) - F;
    const tau = Bd.tauSurf(Bd.nu0, q, sh), width = sh === 'exp' ? 2 * Bd.halfWidth(q) : (tau > 1 ? 100 : 0);
    put('#spCo', t('ch4.unit.ppm', { v: fmt(q) }));
    put('#spF', t('ch4.unit.w', { v: fmt(F, 2) })); put('#spF2', t('ch4.unit.w', { v: fmt(F2, 2) }));
    put('#spW', t('ch4.unit.cm', { v: fmt(width) })); put('#spTau', sig2(tau));
    const key = sh === 'exp' ? 'ch4.say.exp' : F2 < 0.0005 ? 'ch4.say.boxZero' : F2 < 0.1 ? 'ch4.say.boxSat' : 'ch4.say.boxNot';
    putHTML('#spSay', t(key, { c: fmt(q), tau: sig2(tau), f2: fmt(F2, sh === 'box' && F2 < 0.1 ? 3 : 2), dw: fmt(Bd.l * Math.LN2, 1) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  sC.addEventListener('input', redo); radios('spShape').forEach(r => r.addEventListener('change', redo));
  cLin.addEventListener('change', () => { sim.dirty = true; });
  text();
})();

/* ───────── 05 feedback rounds ───────── */
(() => {
  const cv = $('#fbCv'), F = M.feedback, ROUND = 0.6, XMAX = 24, YMAX = 7;
  const cW = $('#fbWv'), cA = $('#fbAl'), cCl = $('#fbCl'), sCv = $('#fbCv2');
  const on_ = () => ({ wvlr: cW.checked, albedo: cA.checked, cloud: cCl.checked, cloudVal: +sCv.value });
  let k = 0, acc = 0;
  // a negative f also takes rounds (each one overshoots back), so count them on |f|
  const maxK = () => { const a = Math.abs(F.f(on_())); return a > 0.005 ? Math.min(30, Math.max(1, F.roundsTo(a, 0.995))) : 0; };
  if (reduce) k = maxK();
  const sim = reg(cv, {
    step(dt) { if (k < maxK()) { acc += dt; while (acc >= ROUND && k < maxK()) { acc -= ROUND; k++; this.dirty = true; text(); } } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), o = on_(), f = F.f(o), d0 = F.dT0(), ecs = F.ecs(o);
      const fr = frame(w, h, [30, 14, 38, 40], -0.6, XMAX + 0.6, 0, YMAX);
      yTicks(c, fr, [0, 1, 2, 3, 4, 5, 6, 7], v => fmt(v)); axes(c, fr, t('ch5.cv.x'), t('ch5.cv.y'));
      xTicks(c, fr, [0, 5, 10, 15, 20], v => fmt(v));
      const bw = Math.max(3, (fr.R - fr.L) / (XMAX + 1.2) * 0.7);
      for (let j = 0; j <= Math.min(k, XMAX); j++) {
        const lo = j ? F.rounds(f, j - 1) : 0, hi = F.rounds(f, j), x = fr.X(j);
        c.fillStyle = j ? C.cyan : C.gold;
        const y0 = fr.Y(Math.min(lo, hi)), y1 = fr.Y(Math.max(lo, hi));
        c.fillRect(x - bw / 2, y1, bw, Math.max(1.5, y0 - y1));
      }
      if (isFinite(ecs)) hline(c, fr, Math.min(YMAX, ecs), C.red);
      void d0;
    }
  });
  function text() {
    const o = on_(), f = F.f(o), d0 = F.dT0(), ecs = F.ecs(o), cum = F.rounds(f, k);
    sCv.disabled = !cCl.checked;
    put('#fbCvo', t('ch5.unit.fb', { v: fmt(+sCv.value, 2) }));
    put('#fbT0', t('ch5.unit.k', { v: fmt(d0, 2) })); put('#fbF', fmt(f, 2));
    put('#fbNow', t('ch5.unit.k', { v: fmt(cum, 2) })); put('#fbEcs', t('ch5.unit.k', { v: fmt(ecs, 2) }));
    const any = o.wvlr || o.albedo || o.cloud;
    let key;
    if (k < maxK()) key = k === 0 ? 'ch5.say.start' : f < 0 ? 'ch5.say.runningNeg' : 'ch5.say.running';
    else if (!any) key = 'ch5.say.none';
    else if (f <= -0.005) key = 'ch5.say.negative';
    else if (f < 0.05) key = 'ch5.say.small';
    else key = 'ch5.say.done';
    putHTML('#fbSay', t(key, { k: fmt(k), add: fmt(Math.abs(F.rounds(f, k) - (k ? F.rounds(f, k - 1) : 0)), 2), now: fmt(cum, 2), t0: fmt(d0, 2), ecs: fmt(ecs, 2), f: fmt(f, 2), fpct: fmt(f * 100), mult: fmt(ecs / d0, 1), r95: fmt(F.roundsTo(f, 0.95)), extra: fmt(ecs - d0, 2) }));
  }
  sim.text = text;
  const redo = () => { k = reduce ? maxK() : 0; acc = 0; sim.dirty = true; text(); };
  [cW, cA, cCl].forEach(e => e.addEventListener('change', redo)); sCv.addEventListener('input', redo);
  on('#fbReplay', 'click', redo);
  text();
})();

/* ───────── 06 the spread of sensitivity ───────── */
(() => {
  const cv = $('#dsCv'), S = M.spread, TOTAL = 2000, RATE = 400, XM = 10, BW = 0.25, NB = Math.round(XM / BW);
  const sMu = $('#dsMu'), sSd = $('#dsSd');
  let seed = 7, rand = S.rng(seed), n = 0, bins = new Array(NB).fill(0), acc = 0;
  const fresh = () => { rand = S.rng(seed); n = 0; bins = new Array(NB).fill(0); acc = 0; if (reduce) drawN(TOTAL); };
  function drawN(m) {
    const mu = +sMu.value, sd = +sSd.value;
    for (let i = 0; i < m && n < TOTAL; i++, n++) { const f = S.draw(rand, mu, sd), T = S.ecsOf(f); if (isFinite(T) && T > 0 && T < XM) bins[Math.floor(T / BW)]++; }
  }
  fresh();
  const sim = reg(cv, {
    step(dt) { if (n < TOTAL) { acc += dt * RATE; const m = Math.floor(acc); if (m > 0) { acc -= m; drawN(m); this.dirty = true; text(); } } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), mu = +sMu.value, sd = +sSd.value;
      const pts = []; if (sd > 0.0005) for (let x = 0.05; x <= XM; x += 0.05) pts.push([x, S.pdf(x, mu, sd)]);
      const hd = bins.map(b => n ? b / (n * BW) : 0);
      const ym = Math.max(0.2, ...pts.map(q => q[1]), ...hd) * 1.12;
      const f = frame(w, h, [34, 14, 38, 20], 0, XM, 0, ym);
      // 5–95 % band
      if (sd > 0.0005) { const lo = S.quantile(0.05, mu, sd), hi = S.quantile(0.95, mu, sd); c.fillStyle = 'rgba(233,185,73,.10)'; c.fillRect(f.X(Math.min(lo, XM)), f.T, f.X(Math.min(isFinite(hi) ? hi : XM, XM)) - f.X(Math.min(lo, XM)), f.B - f.T); }
      axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [0, 2, 4, 6, 8, 10], v => fmt(v), true);
      c.fillStyle = 'rgba(99,199,230,.55)';
      hd.forEach((v, i) => { if (v > 0) { const x0 = f.X(i * BW) + 0.5, x1 = f.X((i + 1) * BW) - 0.5; c.fillRect(x0, f.Y(v), x1 - x0, f.B - f.Y(v)); } });
      if (pts.length) path(c, pts, f.X, f.Y, C.gold, 2);
      else { const x = f.X(Math.min(XM, S.ecsOf(mu))); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); }
      // AR6 likely range 2.5–4 °C (assessed, not a model output)
      c.fillStyle = C.green; c.fillRect(f.X(2.5), f.T - 6, f.X(4) - f.X(2.5), 5);
    }
  });
  function text() {
    const mu = +sMu.value, sd = +sSd.value, med = S.ecsOf(mu);
    put('#dsMuo', fmt(mu, 2)); put('#dsSdo', fmt(sd, 3));
    put('#dsMed', t('ch6.unit.k', { v: fmt(med, 2) })); put('#dsDrawn', t('ch6.unit.drawn', { n: fmt(n), total: fmt(TOTAL) }));
    let key, lo = med, hi = med;
    if (sd <= 0.0005) { key = 'ch6.say.zero'; put('#dsRange', t('ch6.unit.range', { lo: fmt(med, 2), hi: fmt(med, 2) })); put('#dsHigh', t('ch6.unit.pct', { v: fmt(med > 5 ? 100 : 0) })); }
    else {
      lo = S.quantile(0.05, mu, sd); hi = S.quantile(0.95, mu, sd);
      put('#dsRange', isFinite(hi) && hi <= 20 ? t('ch6.unit.range', { lo: fmt(lo, 2), hi: fmt(hi, 2) }) : t('ch6.unit.inf', { lo: fmt(lo, 2) }));
      const pH = S.probAbove(5, mu, sd) * 100; put('#dsHigh', t('ch6.unit.pct', { v: fmt(pH, pH < 1 && pH > 0.05 ? 1 : 0) }));
      key = !isFinite(hi) || hi > 20 ? 'ch6.say.runaway' : (hi - med) / Math.max(1e-9, med - lo) > 1.15 ? 'ch6.say.general' : 'ch6.say.nearsym';
    }
    putHTML('#dsSay', t(key, { mu: fmt(mu, 2), sd: fmt(sd, 3), med: fmt(med, 2), lo: fmt(lo, 2), hi: fmt(hi, 2), dlo: fmt(med - lo, 2), dhi: fmt(hi - med, 2) }));
  }
  sim.text = text;
  const redo = () => { fresh(); sim.dirty = true; text(); };
  [sMu, sSd].forEach(e => e.addEventListener('input', redo));
  on('#dsGo', 'click', () => { seed++; redo(); });
  on('#dsAr6', 'click', () => { const a = S.fromAR6(); sMu.value = a.mu.toFixed(2); sSd.value = a.sd.toFixed(3); redo(); });
  text();
})();

/* ───────── 07 one box of ocean ───────── */
(() => {
  const cv = $('#ocCv'), O = M.ocean, UNTIL = 300, ck = clock(UNTIL, 30), DEPTHS = [10, 25, 50, 100, 200, 500, 1000, 2000];
  const sH = $('#ocH'), sE = $('#ocE');
  const p = () => ({ h: DEPTHS[+sH.value], ecs: +sE.value, scen: radioVal('ocScen') });
  let res = null;
  const model = () => { res = O.run(p(), UNTIL); };
  model();
  const at = tt => { const s = res.series; let i = Math.min(s.length - 1, Math.max(0, Math.round(tt / (O.H * 10)))); return s[i][1]; };
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), P = p(), lam = O.lambda(P.ecs), split = h * 0.3;
      const f1 = frame(w, split, [26, 14, 10, 44], 0, UNTIL, 0, 4.5);
      yTicks(c, f1, [0, 2, 4], v => fmt(v)); axes(c, f1, '', t('ch7.cv.yf'));
      const Fs = []; for (let x = 0; x <= ck.t + 1e-9; x += 1) Fs.push([x, O.forcing(x, P.scen)]);
      path(c, Fs, f1.X, f1.Y, C.gold, 1.8);
      const yT = Math.max(4, Math.ceil(P.ecs + 0.5));
      const f2 = frame(w, h, [split + 30, 14, 38, 44], 0, UNTIL, 0, yT);
      const yt = []; for (let v = 0; v <= yT; v += yT > 5 ? 2 : 1) yt.push(v);
      yTicks(c, f2, yt, v => fmt(v)); axes(c, f2, t('ch7.cv.x'), t('ch7.cv.yt'));
      xTicks(c, f2, [0, 50, 100, 150, 200, 250, 300], v => fmt(v), true);
      if (P.scen === 'ramp') { c.strokeStyle = C.line; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(f2.X(70), f1.T); c.lineTo(f2.X(70), f2.B); c.stroke(); c.setLineDash([]); }
      path(c, Fs.map(q => [q[0], q[1] / lam]), f2.X, f2.Y, C.red, 1.3, [5, 4]);
      const shown = res.series.filter(q => q[0] <= ck.t + 1e-9);
      path(c, shown, f2.X, f2.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, f2.X(q[0]), f2.Y(q[1]), C.cyan); }
    }
  });
  function text() {
    const P = p(), lam = O.lambda(P.ecs), tau = O.tau(P.h, P.ecs), done = ck.t >= UNTIL - 1e-9;
    const Tn = at(ck.t), Fn = O.forcing(ck.t, P.scen), T70 = O.at(P, 70);
    put('#ocHo', t('ch7.unit.m', { v: fmt(P.h) })); put('#ocEo', t('ch7.unit.k', { v: fmt(P.ecs, 1) }));
    put('#ocTau', t('ch7.unit.yr', { v: fmt(tau, tau < 10 ? 1 : 0) })); put('#ocT', t('ch7.unit.k', { v: fmt(Tn, 2) }));
    put('#ocN', t('ch7.unit.w', { v: fmt(Fn - lam * Tn, 2) })); put('#ocT70', t('ch7.unit.k', { v: fmt(T70, 2) }));
    let key, v;
    if (!done) {
      const yr = Math.floor(ck.t / 10) * 10, Ty = at(yr), Fy = O.forcing(yr, P.scen);
      key = yr === 0 ? (P.scen === 'step' ? 'ch7.say.startStep' : 'ch7.say.startRamp') : Fy / lam - Ty < 0.02 ? 'ch7.say.caught' : 'ch7.say.running'; v = { yr: fmt(yr), f: fmt(Fy, 2), t: fmt(Ty, 2), eq: fmt(Fy / lam, 2), gap: fmt(Fy / lam - Ty, 2), n: fmt(Fy - lam * Ty, 2) };
    } else {
      const T300 = res.T;
      v = { t70: fmt(T70, 2), t300: fmt(T300, 2), ecs: fmt(P.ecs, 1), tau: fmt(tau, tau < 10 ? 1 : 0), gap: fmt(P.ecs - T300, 2), t10: fmt(O.at(P, 10), 2) };
      key = P.scen === 'step' ? 'ch7.say.stepDone' : T300 < 0.97 * P.ecs ? 'ch7.say.rampSlow' : T300 - T70 < 0.1 ? 'ch7.say.rampFast' : 'ch7.say.rampDone';
    }
    putHTML('#ocSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  [sH, sE].forEach(e => e.addEventListener('input', redo)); radios('ocScen').forEach(r => r.addEventListener('change', redo));
  on('#ocReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
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
