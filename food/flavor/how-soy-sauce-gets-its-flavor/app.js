/* How soy sauce gets its flavour: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.SoyModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = M.fmt, pct = M.pct;

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
function sayText(o) {
  const v = {};
  for (const [k, x] of Object.entries(o.v)) v[k] = x && x.k ? t(x.k) : x && x.list ? x.list.map(q => t(q)).join(t('list.sep')) : x;
  return t(o.key, v);
}
const effLang = () => (COPY[lang] ? lang : 'zh');
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('[data-hk]').forEach(e => { e.dataset.h = t(e.dataset.hk); });
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
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 24); }
}
function xTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach(v => { const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv, right) {
  c.fillStyle = C.mute; c.textAlign = right ? 'left' : 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), right ? f.R + 6 : f.L - 6, y); if (!right) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); } });
}
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash) { c.strokeStyle = col; c.lineWidth = 1.2; c.setLineDash(dash || [5, 4]); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
// a label on a patch of background so lines never run through it
function tag(c, s, x, y, col, align) { c.font = FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); }
function cursorDot(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, 6.283); c.fill(); }
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
// fit a label column into at most `cap` px by shrinking its font
// a standalone label: capitalise the first letter (grade names are lowercase inside English sentences)
const cap1 = x => x ? x.charAt(0).toUpperCase() + x.slice(1) : x;
// draw tick labels left to right, skipping any that would collide with the one before
function spacedTicks(c, items, y) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x, s] of items) { const w = c.measureText(s).width; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
// row labels for a horizontal bar chart: beside the bars if they fit (font may shrink to 70%), otherwise above each bar
function rowLabels(c, labels, w, cap) { const lf = labelFont(c, labels, cap); c.font = FONT; let lw = 0; for (const s of labels) lw = Math.max(lw, c.measureText(s).width); return lw * 0.7 + 14 > cap ? { above: true, w: 16, font: FONT } : Object.assign({ above: false }, lf); }
function labelFont(c, labels, cap) { c.font = FONT; let lw = 0; for (const s of labels) lw = Math.max(lw, c.measureText(s).width); const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap) }; }

/* ───────── shared runs ───────── */
const KOJI_TRAY = M.koji.run(4, 30, 0);
const RELAY_DEF = M.relay.run(17, 30, 1);

/* ───────── 01 timeline ───────── */
(() => {
  const cv = $('#tlCv'), HEAT = 30; // minutes
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const rows = [{ k: 'ch1.cv.koji', end: 60, col: C.gold }, { k: 'ch1.cv.moromi', end: 180 * 24, col: C.cyan }, { k: 'ch1.cv.heat', end: HEAT / 60, col: C.red }];
      const lf = labelFont(c, rows.map(r => t(r.k)), w * 0.25);
      const lo = -1, hi = 4, L = lf.w, R = w - 12, T = 22, B = h - 30, rh = (B - T) / rows.length;
      const X = hrs => L + (R - L) * (Math.log10(hrs) - lo) / (hi - lo);
      c.strokeStyle = C.grid; c.fillStyle = C.mute; c.textAlign = 'center';
      const ticks = [[1 / 6, 'ch1.tick.10min'], [1, 'ch1.tick.1h'], [24, 'ch1.tick.1d'], [240, 'ch1.tick.10d'], [2400, 'ch1.tick.100d']];
      ticks.forEach(([v]) => { const x = X(v); c.beginPath(); c.moveTo(x, T - 4); c.lineTo(x, B); c.stroke(); });
      spacedTicks(c, ticks.map(([v, k]) => [X(v), t(k)]), B + 11);
      rows.forEach((r, i) => {
        const y = T + i * rh + rh / 2; c.font = lf.font; c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(t(r.k), L - 8, y); c.font = FONT;
        c.fillStyle = r.col; c.globalAlpha = 0.35; c.fillRect(L, y - rh * 0.22, X(r.end) - L, rh * 0.44); c.globalAlpha = 1;
      });
      const mark = (row, hrs, k, col, above) => { const y = T + row * rh + rh / 2, x = X(hrs); c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, 6.283); c.fill(); if (k) tag(c, t(k), Math.min(Math.max(x, L + 30), R - 30), y + (above ? -rh * 0.38 : rh * 0.38), col, 'center'); };
      mark(0, KOJI_TRAY.t90, 'ch1.cv.k90', C.gold, true);
      mark(1, RELAY_DEF.d5 * 24, 'ch1.cv.ph5', C.cyan, true);
      mark(1, RELAY_DEF.dY * 24, 'ch1.cv.y', C.violet, false);
      mark(2, HEAT / 60, null, C.red);
    }
  });
  function text() {
    put('#tlKoji', t('ch1.unit.h', { v: fmt(KOJI_TRAY.t90) })); put('#tlPh', t('ch1.unit.d', { v: fmt(RELAY_DEF.d5) }));
    put('#tlY', t('ch1.unit.d', { v: fmt(RELAY_DEF.dY) })); put('#tlHeat', t('ch1.unit.min', { v: '30' }));
    putHTML('#tlSay', t('ch1.say', { heat: '30', dY: fmt(RELAY_DEF.dY) }));
  }
  sim.text = text; text();
})();

/* ───────── 02 koji bed ───────── */
(() => {
  const cv = $('#kjCv'), sD = $('#kjD'), sA = $('#kjA'), K = M.koji;
  let run = null;
  const every = () => +radioVal('kjT');
  const redo = () => { run = K.run(+sD.value, +sA.value, every()); };
  redo();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 34, 38, 40], 0, K.H, 15, 50);
      yTicks(c, f, [20, 30, 40, 50], v => fmt(v)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.t'));
      xTicks(c, f, [0, 12, 24, 36, 48, 60], v => fmt(v));
      const g = y => f.B - (f.B - f.T) * y;
      c.fillStyle = C.green; c.textAlign = 'left'; c.fillText('1', f.R + 6, g(1)); c.fillText('0', f.R + 6, g(0));
      hline(c, f, 40, C.gold);
      c.strokeStyle = C.green; c.lineWidth = 1.8; c.beginPath(); run.pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](f.X(p.t), g(p.X))); c.stroke();
      path(c, run.pts.map(p => [p.t, p.T]), f.X, f.Y, C.red);
    }
  });
  function text() {
    const a = +sA.value, md = K.maxDepth(a, 40);
    put('#kjDo', t('ch2.unit.cm', { v: sD.value })); put('#kjAo', t('ch2.unit.c', { v: sA.value }));
    put('#kjPeak', t('ch2.unit.c', { v: fmt(run.peak, 1) })); put('#kjOver', t('ch2.unit.h', { v: fmt(run.over40, run.over40 < 10 ? 1 : 0) }));
    put('#kjT90', run.t90 == null ? t('ch2.unit.none') : t('ch2.unit.h', { v: fmt(run.t90) }));
    put('#kjMax', md <= 1.001 ? t('ch2.unit.never') : t('ch2.unit.cm', { v: fmt(md, 1) }));
    putHTML('#kjSay', sayText(M.say.koji(+sD.value, a, every())));
  }
  sim.text = text;
  const go = () => { redo(); sim.dirty = true; text(); };
  [sD, sA].forEach(e => e.addEventListener('input', go)); radios('kjT').forEach(r => r.addEventListener('change', go));
  text();
})();

/* ───────── 03 soybean : wheat ───────── */
(() => {
  const cv = $('#mxCv'), sS = $('#mxS'), X = M.mix;
  const curve = k => { const o = []; for (let i = 0; i <= 100; i++) o.push([i / 100, X.at(i / 100)[k]]); return o; };
  const P = curve('prot'), Cb = curve('carb');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [56, 14, 38, 40], 0, 1, 0, 65);
      yTicks(c, f, [0, 20, 40, 60], v => fmt(v)); axes(c, f, t('ch3.cv.x'), '');
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch3.cv.y'), f.L + 6, 12);
      xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v));
      const placed = [];
      X.STYLES.slice().sort((a, b) => a.s - b.s).forEach(s => {
        const x = f.X(s.s), lab = t('ch3.style.' + s.id); c.strokeStyle = C.line; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); c.setLineDash([]);
        c.font = FONT; const lw = c.measureText(lab).width, x0 = Math.min(x - lw / 2, f.R + 10 - lw), x1 = x0 + lw;
        let row = 0; while (placed.some(p => p.row === row && x0 < p.x1 + 8 && x1 > p.x0 - 8)) row++;
        placed.push({ row, x0, x1 }); tag(c, lab, x0, f.T - 4 - row * 16, C.mute, 'left');
      });
      path(c, P, f.X, f.Y, C.cyan); path(c, Cb, f.X, f.Y, C.gold);
      const s = +sS.value / 100, m = X.at(s); cursorDot(c, f.X(s), f.Y(m.prot), C.cyan); cursorDot(c, f.X(s), f.Y(m.carb), C.gold);
    }
  });
  function text() {
    const s = +sS.value / 100, m = X.at(s);
    put('#mxSo', pct(s)); put('#mxP', fmt(m.prot, 1)); put('#mxC', fmt(m.carb, 1)); put('#mxR', fmt(m.ratio, 2)); put('#mxSu', fmt(X.sugar(s), 2));
    putHTML('#mxSay', sayText(M.say.mix(s)));
  }
  sim.text = text;
  sS.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 relay ───────── */
(() => {
  const cv = $('#rlCv'), cv2 = $('#rl2Cv'), R = M.relay, sW = $('#rlW'), sT = $('#rlT'), sS = $('#rlS'), DAYS = R.DAYS, ck = clock(DAYS, 18);
  let run = null;
  const s0 = () => M.mix.sugar(+sS.value / 100);
  const redo = () => { run = R.run(+sW.value, +sT.value, s0()); };
  redo();
  const at = d => run.pts[Math.min(run.pts.length - 1, Math.floor(d + 1e-9))];
  const sim = reg([cv, cv2], {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const shown = run.pts.filter(p => p.t <= ck.t + 1e-9);
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 40], 0, DAYS, 4.3, 6.3);
        yTicks(c, f, [4.5, 5, 5.5, 6], v => fmt(v, 1)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.ph'));
        xTicks(c, f, [0, 30, 60, 90, 120, 150, 180], v => fmt(v));
        hline(c, f, 5.5, C.violet); hline(c, f, 5.0, C.cyan);
        // measured points only where they apply: default salt and grain, and the 30 °C series at 30 °C, the 15 °C series (first month) at 15 °C
        const Tn = +sT.value, dflt = +sW.value === 17 && +sS.value === 50, all = !dflt ? [] : Tn === 30 ? R.ZHOU30_ALL : Tn === 15 ? R.ZHOU15_ALL : [];
        const used = Tn === 30 ? R.ZHOU30 : R.ZHOU15;
        for (const [d, p] of all) { const inFit = used.some(u => u[0] === d); c.beginPath(); c.arc(f.X(d), f.Y(p), 3.5, 0, 6.283); if (inFit) { c.fillStyle = C.ink; c.fill(); } else { c.strokeStyle = C.ink; c.lineWidth = 1.5; c.stroke(); } }
        path(c, shown.map(p => [p.t, p.pH]), f.X, f.Y, C.gold);
        // the threshold labels go on top of the curve, on a patch of background
        const lx = f.R - 4, room = (f.R - f.L) * 0.62; c.font = FONT;
        const pickLab = (k) => c.measureText(t(k)).width <= room ? t(k) : t(k + 's');
        tag(c, pickLab('ch4.cv.y55'), lx, f.Y(5.5) - 10, C.violet, 'right'); tag(c, pickLab('ch4.cv.y50'), lx, f.Y(5.0) + 10, C.cyan, 'right');
        if (shown.length) { const p = shown[shown.length - 1]; cursorDot(c, f.X(p.t), f.Y(p.pH), C.gold); } }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [22, 34, 34, 40], 0, DAYS, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.pop'));
        xTicks(c, f, [0, 30, 60, 90, 120, 150, 180], v => fmt(v));
        c.fillStyle = C.green; c.textAlign = 'left'; const eY = e => f.Y(e / 4); c.fillText('4%', f.R + 4, eY(4)); c.fillText('0', f.R + 4, eY(0));
        path(c, shown.map(p => [p.t, p.L]), f.X, f.Y, C.cyan); path(c, shown.map(p => [p.t, p.Y]), f.X, f.Y, C.violet);
        path(c, shown.map(p => [p.t, p.E / 4]), f.X, f.Y, C.green, 2, [6, 4]); }
    }
  });
  function text() {
    const p = at(ck.t), sv = M.say.relay(+sW.value, +sT.value, s0(), Math.floor(ck.t + 1e-9));
    put('#rlWo', fmt(+sW.value, 1) + '%'); put('#rlTo', fmt(+sT.value) + ' °C'); put('#rlSo', pct(+sS.value / 100));
    put('#rlDay', fmt(p.t)); put('#rlPh', fmt(p.pH, 2)); put('#rlE', fmt(p.E, 1) + '%');
    put('#rlD5', run.d5 == null ? t('ch4.unit.never') : t('ch4.unit.day', { v: fmt(run.d5) }));
    put('#rlDY', run.dY == null ? t('ch4.unit.never') : t('ch4.unit.day', { v: fmt(run.dY) }));
    put('#rlAw', fmt(run.aw, 3));
    putHTML('#rlSay', sayText(sv));
  }
  sim.text = text;
  const go = () => { redo(); ck.restart(); sim.dirty = true; text(); };
  [sW, sT, sS].forEach(e => e.addEventListener('input', go));
  on('#rlReplay', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 05 browning ───────── */
(() => {
  const cv = $('#brCv'), sE = $('#brEa'), B = M.brown;
  const COL = { brew: C.gold, heat: C.red, shelf: C.cyan, warm: C.violet, fridge: C.green };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), Ea = +sE.value, lf = rowLabels(c, B.CASES.map(k => t('ch5.case.' + k.id)), w, w * 0.42);
      const lo = -2, hi = 3, L = lf.w, R = w - 22, T = 12, Bt = h - 34, rh = (Bt - T) / B.CASES.length;
      const X = v => L + (R - L) * (Math.log10(Math.max(v, Math.pow(10, lo))) - lo) / (hi - lo);
      c.strokeStyle = C.grid; c.fillStyle = C.mute; c.textAlign = 'center';
      const tk = []; for (let e = lo; e <= hi; e++) { const x = X(Math.pow(10, e)); c.beginPath(); c.moveTo(x, T); c.lineTo(x, Bt); c.stroke(); tk.push([x, fmt(Math.pow(10, e), e < 0 ? -e : 0)]); }
      spacedTicks(c, tk, Bt + 11);
      c.textAlign = 'right'; c.fillText(t('ch5.cv.x'), R, Bt + 26);
      B.CASES.forEach((k, i) => {
        const y = T + i * rh; c.font = lf.font; c.fillStyle = C.ink;
        if (lf.above) { c.textAlign = 'left'; c.fillText(t('ch5.case.' + k.id), L, y + rh * 0.22); } else { c.textAlign = 'right'; c.fillText(t('ch5.case.' + k.id), L - 8, y + rh / 2); }
        c.font = FONT; c.fillStyle = COL[k.id];
        if (lf.above) c.fillRect(L, y + rh * 0.45, Math.max(2, X(B.eqDays(k.T, k.d, Ea)) - L), rh * 0.42);
        else c.fillRect(L, y + rh * 0.22, Math.max(2, X(B.eqDays(k.T, k.d, Ea)) - L), rh * 0.56);
      });
    }
  });
  function text() {
    const Ea = +sE.value, heat = B.eqDays(80, 30 / 1440, Ea);
    put('#brEao', fmt(Ea) + ' kJ/mol');
    put('#brHeat', t('ch5.unit.eq', { v: M.days(heat), u: t('unit.' + M.dayUnit(heat)) }));
    put('#brFr', t('ch5.unit.x', { v: fmt(B.ratio(25, Ea, 5), 1) }));
    const br = B.eqDays(30, 180, Ea); put('#brBrew', t('ch5.unit.eq', { v: M.days(br), u: t('unit.' + M.dayUnit(br)) }));
    putHTML('#brSay', sayText(M.say.brown(Ea)));
  }
  sim.text = text;
  sE.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 label arithmetic ───────── */
(() => {
  const cv = $('#lbCv'), sB = $('#lbB'), sM = $('#lbM'), sN = $('#lbN'), Lb = M.label;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 12, 20, 40], 0, 1, 0, 1.8), r = Lb.read(+sB.value, +sM.value, +sN.value);
      yTicks(c, f, [0, 0.4, 0.8, 1.2, 1.6], v => fmt(v, 1)); axes(c, f, '', t('ch7.cv.y'));
      const x0 = f.L + 18, bw = Math.min(90, (f.R - f.L) * 0.28);
      const seg = (a, b, col) => { c.fillStyle = col; c.fillRect(x0, f.Y(b), bw, f.Y(a) - f.Y(b)); };
      const b = +sB.value; seg(0, b, C.cyan); seg(b, b + r.fromMsg, C.gold); seg(b + r.fromMsg, r.aan, C.red);
      const lx = x0 + bw + 10, names = ['ch7.grade.0', 'ch7.grade.1', 'ch7.grade.2', 'ch7.grade.3'];
      Lb.GRADES.hs.forEach((g, i) => {
        c.strokeStyle = r.grade <= i ? C.green : C.dimfill; c.lineWidth = 1.2; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.L, f.Y(g)); c.lineTo(f.R, f.Y(g)); c.stroke(); c.setLineDash([]);
        tag(c, fmt(g, 2) + ' ' + cap1(t(names[i])), lx, f.Y(g), r.grade <= i ? C.green : C.mute, 'left');
      });
    }
  });
  function text() {
    const r = Lb.read(+sB.value, +sM.value, +sN.value);
    put('#lbBo', fmt(+sB.value, 2)); put('#lbMo', t('ch7.unit.gm', { v: fmt(+sM.value, 1) })); put('#lbNo', fmt(+sN.value, 2));
    put('#lbA', fmt(r.aan, 2)); put('#lbG', cap1(t('ch7.grade.' + r.grade))); put('#lbMs', fmt(r.fromMsg, 2)); put('#lbNs', pct(r.nh4Share));
    putHTML('#lbSay', sayText(M.say.label(+sB.value, +sM.value, +sN.value)));
  }
  sim.text = text;
  [sB, sM, sN].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 08 cut the relay short ───────── */
(() => {
  const cv = $('#ctCv'), sD = $('#ctD'), R = M.relay, run = RELAY_DEF;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 34, 38, 40], 0, R.DAYS, 4.3, 6.3), d = +sD.value;
      yTicks(c, f, [4.5, 5, 5.5, 6], v => fmt(v, 1)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.ph'));
      xTicks(c, f, [0, 30, 60, 90, 120, 150, 180], v => fmt(v));
      const eY = e => f.Y(4.3 + 2 * e / 4); c.fillStyle = C.green; c.textAlign = 'left'; c.fillText('4%', f.R + 4, eY(4)); c.fillText('0', f.R + 4, eY(0));
      const before = run.pts.filter(p => p.t <= d), after = run.pts.filter(p => p.t >= d);
      path(c, after.map(p => [p.t, p.pH]), f.X, f.Y, C.dimfill, 1.6); path(c, after.map(p => [p.t, 4.3 + 2 * p.E / 4]), f.X, f.Y, C.dimfill, 1.6, [6, 4]);
      path(c, before.map(p => [p.t, p.pH]), f.X, f.Y, C.gold); path(c, before.map(p => [p.t, 4.3 + 2 * p.E / 4]), f.X, f.Y, C.green, 2, [6, 4]);
      c.strokeStyle = C.red; c.lineWidth = 1.5; c.beginPath(); c.moveTo(f.X(d), f.T); c.lineTo(f.X(d), f.B); c.stroke();
    }
  });
  function text() {
    const d = +sD.value, p = run.pts[d], st = d < run.d5 ? 'early' : d < run.dY ? 'mid' : 'late';
    put('#ctDo', t('ch4.unit.day', { v: fmt(d) })); put('#ctPh', fmt(p.pH, 2)); put('#ctE', fmt(p.E, 1) + '%');
    put('#ctB', t('ch8.unit.d', { v: fmt(M.brown.eqDays(30, d)) })); put('#ctSt', t('ch8.st.' + st));
    putHTML('#ctSay', sayText(M.say.cut(d)));
  }
  sim.text = text;
  sD.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 09 sodium per serving ───────── */
(() => {
  const cv = $('#naCv'), sG = $('#naG'), S = M.salt;
  const style = () => radioVal('naS');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), g = +sG.value, lf = rowLabels(c, S.MEXT.map(r => t('ch9.style.' + r.id)), w, w * 0.3);
      const L = lf.w, R = w - 24, T = 8, B = h - 32, rh = (B - T) / S.MEXT.length, max = 2000, X = v => L + (R - L) * v / max;
      c.strokeStyle = C.grid; c.fillStyle = C.mute; c.textAlign = 'center';
      for (let v = 0; v <= max; v += 500) { const x = X(v); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); if (w >= 480 || v % 1000 === 0) c.fillText(fmt(v), x, B + 11); }
      c.textAlign = 'right'; c.fillText(t('ch9.cv.x'), R, B + 25);
      S.MEXT.forEach((r, i) => {
        const y = T + i * rh, sel = r.id === style(); c.font = lf.font; c.fillStyle = sel ? C.gold : C.ink;
        if (lf.above) { c.textAlign = 'left'; c.fillText(t('ch9.style.' + r.id), L, y + rh * 0.2); } else { c.textAlign = 'right'; c.fillText(t('ch9.style.' + r.id), L - 8, y + rh / 2); }
        c.font = FONT; c.fillStyle = sel ? C.gold : C.dimfill;
        if (lf.above) c.fillRect(L, y + rh * 0.45, X(S.per(r.id, g).na) - L, rh * 0.42); else c.fillRect(L, y + rh * 0.2, X(S.per(r.id, g).na) - L, rh * 0.6);
      });
    }
  });
  function text() {
    const g = +sG.value, id = style(), p = S.per(id, g), r = S.MEXT.find(x => x.id === id);
    put('#naGo', t('ch9.unit.g', { v: fmt(g) })); put('#naNa', t('ch9.unit.mg', { v: fmt(p.na) })); put('#naSalt', t('ch9.unit.g', { v: fmt(p.salt, 1) })); put('#naPer', t('ch9.unit.mg', { v: fmt(r.na) }));
    putHTML('#naSay', sayText(M.say.salt(id, g)));
  }
  sim.text = text;
  sG.addEventListener('input', () => { sim.dirty = true; text(); });
  radios('naS').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
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
