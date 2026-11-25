/* What makes prices rise and fall: i18n runtime, wiring, drawing and on-screen gating.
   All visible text comes from copy.*.js (generated from content.<lang>.md by scripts/build-pages.cjs).
   Runtime head follows computing/systems/how-a-cpu-does-math/app.js and economics/markets/why-a-few-firms-win/app.js. */
(() => {
'use strict';
const M = window.PriceModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
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
const enStub = !COPY.en || document.documentElement.dataset.langEn === 'stub';
const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmt(x, d = 0) {
  if (x == null || !isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const sgn = (x, d = 1) => (x > 0.5 * Math.pow(10, -d) ? '+' : '') + fmt(x, d);
const P = (x, d = 1) => t('u.pct', { v: fmt(x, d) });          // x already in percent
const SP = (x, d = 1) => t('u.pct', { v: sgn(x, d) });
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radioVal = name => document.querySelector(`input[name=${name}]:checked`).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const say = (sel, key, vars) => { const e = $(sel); e.dataset.key = key; const h = t(key, vars); if (e.__h !== h) { e.innerHTML = h; e.__h = h; } };
const say2 = (sel, k1, v1, k2, v2) => { const e = $(sel); e.dataset.key = k1 + '|' + k2; const h = t(k1, v1) + ' ' + t(k2, v2); if (e.__h !== h) { e.innerHTML = h; e.__h = h; } };
const onInput = (ids, fn) => ids.forEach(id => { const e = $(id); e.addEventListener('input', fn); e.addEventListener('change', fn); });
const onRadio = (name, fn) => $$(`input[name=${name}]`).forEach(r => r.addEventListener('change', fn));

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (Math.max(y0, Math.min(y1, y)) - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 28); }
}
function xTicks(c, f, vals, fv) { c.fillStyle = C.mute; c.textAlign = 'center'; vals.forEach(v => { const x = f.X(v); c.fillText(fv(v), x, f.B + 12); }); }
function yTicks(c, f, vals, fv) { c.fillStyle = C.mute; c.textAlign = 'right'; vals.forEach(v => { const y = f.Y(v); c.fillText(fv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); }); }
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.2; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); let on = false; pts.forEach(p => { if (p[1] == null || !isFinite(p[1])) { on = false; return; } c[on ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])); on = true; }); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
const niceTicks = (lo, hi, n) => { const step = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 500].find(s => (hi - lo) / s <= n) || 1000; const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6)); return out; };
// replay clock in model years; jumps to the end under reduced motion
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
const upto = (arr, tt) => arr.filter(r => r.t <= tt + 1e-9);

/* ───────── 01 quantity equation on US data ───────── */
(() => {
  const cv = $('#qCv'), cv2 = $('#qCv2'), s0 = $('#qY0'), s1 = $('#qY1');
  const st = () => { let a = +s0.value, b = +s1.value; return { a, b, ok: b > a }; };
  const sim = reg([cv, cv2], {
    draw() {
      const { a, b, ok } = st();
      { // bars: average yearly change over the window
        const { c, w, h } = fit(cv);
        if (!ok) return;
        const q = M.qty(a, b), vals = [['m', q.g.M, C.gold], ['v', q.g.V, C.violet], ['y', q.g.Y, C.cyan], ['p', q.g.P, C.red], ['cf', q.cf.pi, C.red]].map(r => [r[0], r[1] * 100, r[2]]);
        const lo = Math.min(-2, ...vals.map(v => v[1])) - 1, hi = Math.max(4, ...vals.map(v => v[1])) + 1;
        const f = frame(w, h, [30, 12, 44, 44], 0, vals.length, lo, hi);
        yTicks(c, f, niceTicks(lo, hi, 6), v => fmt(v));
        hline(c, f, 0, C.mute, []);
        vals.forEach(([k, v, col], i) => {
          const x0 = f.X(i + 0.18), x1 = f.X(i + 0.82), y0 = f.Y(0), y1 = f.Y(v);
          if (k === 'cf') { c.strokeStyle = col; c.lineWidth = 1.6; c.setLineDash([5, 4]); c.strokeRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0)); c.setLineDash([]); }
          else { c.fillStyle = col; c.globalAlpha = 0.8; c.fillRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0)); c.globalAlpha = 1; }
          c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(sgn(v, 1), (x0 + x1) / 2, v >= 0 ? y1 - 9 : y1 + 9);
          c.fillStyle = C.mute; c.fillText(t('ch1.cv.' + k), (x0 + x1) / 2, f.B + 14);
        });
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch1.cv.ybar'), f.L + 6, f.T - 14);
      }
      { // velocity 1960–2025 with the window shaded
        const { c, w, h } = fit(cv2), D = M.data.us, pts = [];
        for (let y = 1960; y <= D.y1; y++) pts.push([y, M.usAt(y).V]);
        const f = frame(w, h, [22, 12, 28, 44], 1960, D.y1, 1, 2.3);
        if (ok) { c.fillStyle = 'rgba(233,185,73,.12)'; c.fillRect(f.X(a), f.T, f.X(b) - f.X(a), f.B - f.T); }
        yTicks(c, f, [1, 1.5, 2], v => fmt(v, 1));
        xTicks(c, f, [1960, 1980, 2000, 2020], v => String(v));
        path(c, pts, f.X, f.Y, C.violet, 2);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch1.cv.vline'), f.L + 6, f.T - 10);
      }
    },
    text() {
      const { a, b, ok } = st();
      put('#qY0o', String(a)); put('#qY1o', String(b));
      if (!ok) { ['#qM', '#qV', '#qY', '#qP', '#qCf'].forEach(s => put(s, t('u.none'))); say('#ch1Say', 'ch1.say.bad'); return; }
      const q = M.qty(a, b), g = q.g;
      put('#qM', SP(g.M * 100)); put('#qV', SP(g.V * 100)); put('#qY', SP(g.Y * 100)); put('#qP', SP(g.P * 100)); put('#qCf', SP(q.cf.pi * 100));
      const vars = { a, b, m: sgn(g.M * 100), v: sgn(g.V * 100), p: sgn(g.P * 100), cf: sgn(q.cf.pi * 100), v0: fmt(q.v0, 2), v1: fmt(q.v1, 2) };
      say('#ch1Say', g.V < -0.005 ? 'ch1.say.fall' : g.V > 0.005 ? 'ch1.say.rise' : 'ch1.say.flat', vars);
    }
  });
  const redo = () => { sim.dirty = true; sim.text(); };
  onInput(['#qY0', '#qY1'], () => { $$('input[name=qPre]').forEach(r => { r.checked = false; }); redo(); });
  onRadio('qPre', () => { const [a, b] = M.QTY_PRESETS[radioVal('qPre')]; s0.value = a; s1.value = b; redo(); });
  sim.text();
})();

/* ───────── 02 AD/AS ───────── */
(() => {
  const cv = $('#aCv'), sA = $('#aA'), sP = $('#aP'), T = 10, ck = clock(T, 2.5);
  const st = () => ({ k: radioVal('aK'), al: +sA.value, a: +sP.value });
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) this.dirty = true; },
    draw() {
      const { c, w, h } = fit(cv), { k, al, a } = st(), r = M.adas(k, al, a, T);
      const f = frame(w, h, [30, 14, 40, 40], 0, T, -6, 12);
      yTicks(c, f, [-6, -3, 0, 3, 6, 9, 12], v => fmt(v));
      xTicks(c, f, [0, 2, 4, 6, 8, 10], v => String(v));
      axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
      hline(c, f, 2, C.mute); hline(c, f, 0, C.line, []);
      const shown = upto(r.path, ck.t);
      path(c, shown.map(p => [p.t, p.pi]), f.X, f.Y, C.red);
      path(c, shown.map(p => [p.t, p.y]), f.X, f.Y, C.cyan);
      const last = shown[shown.length - 1]; dot(c, f.X(last.t), f.Y(last.pi), C.red); dot(c, f.X(last.t), f.Y(last.y), C.cyan);
    },
    text() {
      const { k, al, a } = st(), r = M.adas(k, al, a, T);
      put('#aAo', fmt(al, 1)); put('#aPo', P(a * 100, 0));
      put('#aPi1', P(r.pi1)); put('#aY1', SP(r.y1)); put('#aPT', SP(r.pT)); put('#aYS', t('u.ptyr', { v: sgn(r.ySum, 1) }));
      const vars = { pi1: fmt(r.pi1, 1), y1: sgn(r.y1, 1), pT: sgn(r.pT, 1), ys: sgn(r.ySum, 1), low: fmt(r.low.pi, 1), lowT: r.low.t };
      say2('#ch2Say', 'ch2.say.' + k, vars, a >= 0.995 ? 'ch2.pol.full' : a > 0.005 ? 'ch2.pol.part' : 'ch2.pol.none', vars);
    }
  });
  const redo = () => { ck.restart(); sim.dirty = true; sim.text(); };
  onInput(['#aA', '#aP'], redo); onRadio('aK', redo); $('#aRe').addEventListener('click', redo); sim.text();
})();

/* ───────── 03–04 Phillips curve with expectations ───────── */
(() => {
  const cv = $('#pCv'), sT = $('#pT'), sG = $('#pG'), cO = $('#pO'), T = 20, ck = clock(T, 4);
  const st = () => ({ mode: radioVal('pM'), theta: +sT.value, gap: +sG.value, oil: cO.checked });
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) this.dirty = true; },
    draw() {
      const { c, w, h } = fit(cv), o = st(), r = M.phillips(o);
      const hiP = o.mode === 'hot' ? 20 : 12;
      const f = frame(w, h, [30, 14, 40, 40], 0, T, -2, hiP);
      yTicks(c, f, niceTicks(-2, hiP, 7), v => fmt(v));
      xTicks(c, f, [0, 5, 10, 15, 20], v => String(v));
      axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      hline(c, f, M.PC.target, C.green);
      const shown = upto(r.path, ck.t);
      path(c, shown.map(p => [p.t, p.u]), f.X, f.Y, C.cyan, 1.6);
      path(c, shown.map(p => [p.t, p.pe]), f.X, f.Y, C.violet, 1.6, [5, 4]);
      path(c, shown.map(p => [p.t, p.pi]), f.X, f.Y, C.red);
      const last = shown[shown.length - 1]; if (last.pi <= hiP) dot(c, f.X(last.t), f.Y(last.pi), C.red);
    },
    text() {
      const o = st(), r = M.phillips(o), hot = o.mode === 'hot';
      put('#pTo', fmt(o.theta, 2)); put('#pGo', t('u.pp', { v: fmt(o.gap, 2) }));
      cO.disabled = !hot; cO.closest('label').classList.toggle('dis', !hot);
      ['1', '2', '3'].forEach(i => { const e = $('#pL' + i); e.dataset.i18n = `ch3.read.${hot ? 'hot' : 'cool'}${i}`; e.textContent = t(e.dataset.i18n); });
      if (hot) {
        put('#pR1', P(r.pi10)); put('#pR2', P(r.piT)); put('#pR3', isFinite(r.ss) && !o.oil ? P(r.ss, 2) : t('ch3.read.none'));
        const vars = { gap: fmt(o.gap, 2), p10: fmt(r.pi10, 1), pT: fmt(r.piT, 1), ss: fmt(r.ss, 2), th: fmt(o.theta, 2), step: fmt(M.PC.beta * o.gap, 2) };
        say('#ch3Say', o.theta < 0.005 ? (o.oil ? 'ch3.say.accelOil' : 'ch3.say.accel') : (o.oil ? 'ch3.say.settleOil' : 'ch3.say.settle'), vars);
      } else {
        put('#pR1', r.years == null ? t('ch3.read.none') : t('u.years', { v: r.years })); put('#pR2', t('u.ptyr', { v: fmt(r.pointYears, 1) })); put('#pR3', fmt(r.ratio, 2));
        const vars = { gap: fmt(o.gap, 2), n: r.years, py: fmt(r.pointYears, 1), ratio: fmt(r.ratio, 2), th: fmt(o.theta, 2) };
        say('#ch3Say', r.years == null ? 'ch3.say.never' : (o.theta < 0.005 ? 'ch3.say.coolAdaptive' : 'ch3.say.coolCredible'), vars);
      }
    }
  });
  const redo = () => { ck.restart(); sim.dirty = true; sim.text(); };
  onInput(['#pT', '#pG', '#pO'], redo); onRadio('pM', redo); $('#pRe').addEventListener('click', redo); sim.text();
})();

/* ───────── 03 data: US unemployment and CPI inflation, 1960–2025 ───────── */
(() => {
  const cv = $('#dCv'), pts = M.phillipsData(), slopes = M.eraSlopes(), col = { e60: C.gold, e70: C.red, e84: C.cyan, e20: C.violet };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), sel = radioVal('dE');
      const f = frame(w, h, [30, 14, 42, 40], 2, 11, -2, 14);
      yTicks(c, f, [-2, 0, 2, 4, 6, 8, 10, 12, 14], v => fmt(v));
      xTicks(c, f, [3, 5, 7, 9, 11], v => fmt(v));
      axes(c, f, t('ch3.d.cv.x'), t('ch3.d.cv.y'));
      for (const p of pts) { if (p.era === sel) continue; c.globalAlpha = 0.28; dot(c, f.X(p.u), f.Y(p.pi), col[p.era], 3.2); }
      c.globalAlpha = 1;
      const on = pts.filter(p => p.era === sel);
      path(c, on.map(p => [p.u, p.pi]), f.X, f.Y, col[sel], 1, [3, 3]);
      for (const p of on) dot(c, f.X(p.u), f.Y(p.pi), col[sel], 4.2);
      c.fillStyle = C.ink; c.textAlign = 'left';
      const first = on[0], last = on[on.length - 1];
      c.fillText(String(first.y), f.X(first.u) + 7, f.Y(first.pi) - 9); c.fillText(String(last.y), f.X(last.u) + 7, f.Y(last.pi) + 10);
    },
    text() {
      const sel = radioVal('dE'), n = pts.filter(p => p.era === sel).length;
      put('#dS', fmt(slopes[sel], 2)); put('#dN', t('u.years', { v: n }));
      say('#ch3dSay', 'ch3.d.say.' + sel, { s: fmt(slopes[sel], 2) });
    }
  });
  onRadio('dE', () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── 04 data: inflation and inflation expectations ───────── */
(() => {
  const cv = $('#eCv'), sY = $('#eY'), cpi = M.cpiInfl().filter(r => r[0] >= 1978), mich = M.usSeries('mich').filter(r => r[0] >= 1978), e10 = M.usSeries('exp10').filter(r => r[0] >= 1978);
  const at = (a, y) => { const r = a.find(r => r[0] === y); return r ? r[1] : null; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), y = +sY.value, f = frame(w, h, [30, 14, 40, 40], 1978, 2025, -1, 14);
      yTicks(c, f, [0, 2, 4, 6, 8, 10, 12, 14], v => fmt(v));
      xTicks(c, f, [1980, 1990, 2000, 2010, 2020], v => String(v));
      axes(c, f, t('ch4.d.cv.x'), t('ch4.d.cv.y'));
      c.strokeStyle = C.line; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(f.X(y), f.T); c.lineTo(f.X(y), f.B); c.stroke(); c.setLineDash([]);
      path(c, cpi, f.X, f.Y, C.red); path(c, mich, f.X, f.Y, C.gold, 1.8); path(c, e10, f.X, f.Y, C.cyan, 1.8);
    },
    text() {
      const y = +sY.value, cc = at(cpi, y), m = at(mich, y), e = at(e10, y);
      put('#eYo', String(y)); put('#eC', P(cc)); put('#eM', P(m)); put('#eT', e == null ? t('u.none') : P(e));
      say('#ch4dSay', e == null ? 'ch4.d.say.early' : 'ch4.d.say.all', { y, c: fmt(cc, 1), m: fmt(m, 1), e: fmt(e, 1) });
    }
  });
  onInput(['#eY'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── 05 wage–price spiral ───────── */
(() => {
  const cv = $('#wCv'), sA = $('#wA'), sT = $('#wT'), sR = $('#wR'), sS = $('#wS'), T = 15, X = 50;
  const st = () => ({ a: +sA.value, theta: +sT.value, rho: +sR.value, s: +sS.value, X });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.spiral(st());
      const hi = Math.max(12, Math.min(40, Math.ceil(r.peak.pi / 4) * 4 + 2));
      const f = frame(w, h, [30, 14, 40, 40], 0, T, -10, hi);
      yTicks(c, f, niceTicks(-10, hi, 7), v => fmt(v));
      xTicks(c, f, [0, 5, 10, 15], v => String(v));
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      hline(c, f, 0, C.line, []); hline(c, f, M.WP.target, C.green);
      path(c, r.path.map(p => [p.t, p.w]), f.X, f.Y, C.gold, 1.6, [5, 4]);
      path(c, r.path.map(p => [p.t, p.pi]), f.X, f.Y, C.red);
      path(c, r.path.map(p => [p.t, p.omega]), f.X, f.Y, C.cyan);
    },
    text() {
      const o = st(), r = M.spiral(o);
      put('#wAo', fmt(o.a, 1)); put('#wTo', fmt(o.theta, 2)); put('#wRo', fmt(o.rho, 2)); put('#wSo', P(o.s * 100, 0));
      put('#wP1', P(r.pi1)); put('#wP8', P(r.pi8)); put('#wO1', SP(r.omega1)); put('#wO8', SP(r.omega8));
      const key = r.pi8 > r.pi1 + 0.05 ? 'spiral' : (r.pi8 > M.WP.target + 0.5 ? 'stuck' : 'fade');
      say('#ch5Say', 'ch5.say.' + key, { p1: fmt(r.pi1, 1), p8: fmt(r.pi8, 1), o1: fmt(r.omega1, 1), o8: fmt(r.omega8, 1) });
    }
  });
  onInput(['#wA', '#wT', '#wR', '#wS'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── 06 & 09 printing money to pay a deficit ───────── */
(() => {
  const cv = $('#sCv'), cv2 = $('#sCv2'), sD = $('#sD'), sK = $('#sK'), sA = $('#sA'), ck = clock(M.SG.months, 30);
  const st = () => ({ d: +sD.value / 100, k: +sK.value / 100, alpha: +sA.value });
  const sim = reg([cv, cv2], {
    step(dt) { if (ck.tick(dt)) this.dirty = true; },
    draw() {
      const o = st(), r = M.seignorage(o);
      { // steady-state seigniorage against monthly inflation
        const { c, w, h } = fit(cv), x1 = 0.8, top = Math.max(0.16, r.max.d * 1.15);
        const f = frame(w, h, [30, 14, 40, 44], 0, x1 * 100, 0, top * 100);
        yTicks(c, f, niceTicks(0, top * 100, 5), v => fmt(v));
        xTicks(c, f, [0, 20, 40, 60, 80], v => fmt(v));
        axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
        const pts = []; for (let x = 0; x <= x1 + 1e-9; x += 0.005) pts.push([x * 100, M.seignSteady(x, o.k, o.alpha) * 100]);
        path(c, pts, f.X, f.Y, C.gold);
        hline(c, f, o.d * 100, C.red);
        dot(c, f.X(r.max.pi * 100), f.Y(r.max.d * 100), C.gold);
        if (r.roots) { dot(c, f.X(r.roots.low * 100), f.Y(o.d * 100), C.green, 5); if (r.roots.high <= x1) { c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath(); c.arc(f.X(r.roots.high * 100), f.Y(o.d * 100), 5, 0, 6.283); c.stroke(); } }
      }
      { // the simulated path: monthly inflation over ten years
        const { c, w, h } = fit(cv2), f = frame(w, h, [22, 14, 28, 44], 0, M.SG.months, 0, 60);
        yTicks(c, f, [0, 25, 50], v => fmt(v));
        xTicks(c, f, [0, 24, 48, 72, 96, 120], v => String(v));
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch6.cv2.y'), f.L + 6, f.T - 10);
        c.textAlign = 'right'; c.fillText(t('ch6.cv2.x'), f.R, f.B - 10);
        hline(c, f, 50, C.red);
        const shown = r.path.filter(p => p.t <= ck.t);
        path(c, shown.map(p => [p.t, Math.min(60, (Math.exp(p.pi) - 1) * 100)]), f.X, f.Y, C.violet);
      }
    },
    text() {
      const o = st(), r = M.seignorage(o);
      put('#sDo', P(o.d * 100, 1)); put('#sKo', P(o.k * 100, 0)); put('#sAo', fmt(o.alpha, 1));
      put('#sMax', P(r.max.d * 100, 1));
      const ann = r.roots ? M.annualOfMonthly(r.roots.low) * 100 : null;
      put('#sSS', r.roots ? P(ann, 0) : t('ch3.read.none'));
      put('#sH', r.hyperAt ? t('u.months', { v: r.hyperAt }) : t('u.none'));
      put('#sM', P(r.last.m * 100, 1));
      const vars = { d: fmt(o.d * 100, 1), max: fmt(r.max.d * 100, 1), ss: fmt(ann, 0), mo: r.roots ? fmt(r.roots.low * 100, 1) : '', n: r.hyperAt };
      const key = o.d <= 0 ? 'zero' : r.roots ? (o.d > 0.75 * r.max.d ? 'near' : 'low') : (r.hyperAt ? 'hyper' : 'slow');
      say('#ch6Say', 'ch6.say.' + key, vars);
    }
  });
  const redo = () => { ck.restart(); sim.dirty = true; sim.text(); };
  onInput(['#sD', '#sK', '#sA'], redo); $('#sRe').addEventListener('click', redo); sim.text();
})();

/* ───────── 07 debt deflation ───────── */
(() => {
  const cv = $('#fCv'), sP = $('#fP'), sI = $('#fI'), sB = $('#fB'), sS = $('#fS'), cF = $('#fF'), PHI = 0.1;
  const st = () => ({ pi: +sP.value / 100, i: +sI.value / 100, b0: +sB.value / 100, sigma: +sS.value / 100, g: 0, phi: cF.checked ? PHI : 0 });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), o = st(), r = M.debtDeflation(o), ref = M.debtDeflation(Object.assign({}, o, { pi: 0.02, phi: 0 }));
      const hi = Math.min(800, Math.max(150, ...r.path.map(p => p.b * 100), o.b0 * 100) * 1.1);
      const f = frame(w, h, [30, 14, 40, 44], 0, 10, 0, hi);
      yTicks(c, f, niceTicks(0, hi, 6), v => fmt(v));
      xTicks(c, f, [0, 2, 4, 6, 8, 10], v => String(v));
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      path(c, ref.path.map(p => [p.t, Math.max(0, p.b * 100)]), f.X, f.Y, C.mute, 1.6, [5, 4]);
      path(c, r.path.map(p => [p.t, Math.max(0, p.b * 100)]), f.X, f.Y, C.red);
    },
    text() {
      const o = st(), r = M.debtDeflation(o), ref = M.debtDeflation(Object.assign({}, o, { pi: 0.02, phi: 0 }));
      put('#fPo', SP(o.pi * 100)); put('#fIo', P(o.i * 100)); put('#fBo', P(o.b0 * 100, 0)); put('#fSo', P(o.sigma * 100, 0));
      const pb = x => x <= 0 ? t('ch7.read.paid') : P(x * 100, 0);
      put('#fB4', pb(r.b4)); put('#fBT', pb(r.bT)); put('#fRef', pb(ref.bT)); put('#fR', SP(r.realRate * 100));
      const vars = { b0: fmt(o.b0 * 100, 0), bT: fmt(r.bT * 100, 0), ref: fmt(ref.bT * 100, 0), rr: fmt(r.realRate * 100, 1), piT: fmt(r.piT * 100, 1) };
      const key = r.bT <= 0 ? 'paid' : (o.phi > 0 && r.piT < o.pi - 0.005) ? 'spiral' : r.bT > o.b0 + 1e-9 ? 'grow' : 'shrink';
      say('#ch7Say', 'ch7.say.' + key, vars);
    }
  });
  onInput(['#fP', '#fI', '#fB', '#fS', '#fF'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── 08 data: CPI inflation in the US, Japan and China ───────── */
(() => {
  const cv = $('#jCv'), sY = $('#jY'), W = M.data.wb, us = M.cpiInfl().filter(r => r[0] >= 1990);
  const ser = k => W[k].map((v, i) => [W.y0 + i, v]);
  const jp = ser('jpn'), cn = ser('chn');
  const at = (a, y) => { const r = a.find(r => r[0] === y); return r ? r[1] : null; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), y = +sY.value, f = frame(w, h, [30, 14, 40, 40], 1990, 2025, -3, 25);
      yTicks(c, f, [0, 5, 10, 15, 20, 25], v => fmt(v));
      xTicks(c, f, [1990, 2000, 2010, 2020], v => String(v));
      axes(c, f, t('ch8.d.cv.x'), t('ch8.d.cv.y'));
      hline(c, f, 0, C.mute, []);
      c.strokeStyle = C.line; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(f.X(y), f.T); c.lineTo(f.X(y), f.B); c.stroke(); c.setLineDash([]);
      path(c, us, f.X, f.Y, C.red, 1.8); path(c, jp, f.X, f.Y, C.cyan); path(c, cn, f.X, f.Y, C.gold);
    },
    text() {
      const y = +sY.value, u = at(us, y), j = at(jp, y), n = at(cn, y);
      put('#jYo', String(y)); put('#jU', P(u)); put('#jJ', P(j)); put('#jC', P(n));
      say('#ch8dSay', 'ch8.d.say', { y, u: fmt(u, 1), j: fmt(j, 1), c: fmt(n, 1) });
    }
  });
  onInput(['#jY'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
