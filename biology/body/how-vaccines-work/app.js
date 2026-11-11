/* How vaccines work: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.VaxModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', gray: '#5a6273' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const I = M.immune;

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
// numbers: digit grouping and decimals follow the language shown; no language-specific units are generated here
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, '−');
}
const pct = (x, d = 0) => t('fmt.pct', { v: fmt(x * 100, d) });
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(c => c === '-' ? '⁻' : SUP[+c]).join('');
// relative virus or antibody amounts: plain below 10 000, otherwise m × 10ⁿ
function big(x) {
  if (!(x >= 1)) return fmt(Math.max(0, x), 0);
  if (x < 1e4) return fmt(x, 0);
  let e = Math.floor(Math.log10(x)), m = +(x / Math.pow(10, e)).toFixed(1);
  if (m >= 10) { m = 1; e++; }
  return t('fmt.sci', { m: fmt(m, 1), e: sup(e) });
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
if (!document.querySelector('meta[name=description]')) { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }

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
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
// a live sentence: the copy key is kept on the element so tests can check which state the page reports
const say = (sel, key, v) => { putHTML(sel, t(key, v)); $(sel).dataset.key = key; };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
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
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
// replay clock for exact-solution charts: advances model time on real dt, jumps to the end under reduced motion
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, done() { return this.t >= this.until - 1e-9; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
const lg = x => Math.log10(Math.max(1, x));
const logTicks = (c, f, top) => yTicks(c, f, Array.from({ length: Math.floor(top / 2) + 1 }, (_, i) => 2 * i), v => '10' + sup(v));
// virus growth rates offered by the speed sliders (per day); shown as a doubling time in hours
const RATES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const dbl = r => 24 * Math.LN2 / r;
const days = (x, d = 1) => t('unit.days', { v: fmt(x, d) });
// a count of people or whole months: singular wording when the shown value is exactly 1
const people = x => fmt(x) === fmt(1) ? t('unit.person', { v: fmt(x) }) : t('unit.people', { v: fmt(x) });
const months = (x, d = 0) => fmt(x, d) === fmt(1, d) && d === 0 ? t('unit.month', { v: fmt(x, d) }) : t('unit.months', { v: fmt(x, d) });

/* ───────── 01 the race ───────── */
(() => {
  const cv = $('#raceCv'), UNTIL = 28, ck = clock(UNTIL, 4), sR = $('#raceR');
  let res = null;
  const model = () => { res = I.infection({ infectAt: 0, until: UNTIL, P: { r: RATES[+sR.value] } }); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [34, 14, 40, 44], 0, UNTIL, 0, 8.6);
      logTicks(c, f, 8); axes(c, f, t('cv.days'), t('cv.amount'));
      xTicks(c, f, [0, 7, 14, 21, 28], v => fmt(v), true);
      hline(c, f, lg(I.SYMPTOM), C.mute); hline(c, f, lg(I.SEVERE), C.red);
      const shown = res.series.filter(q => q.t <= ck.t);
      path(c, shown.filter(q => q.V >= 1).map(q => [q.t, lg(q.V)]), f.X, f.Y, C.red);
      path(c, shown.filter(q => q.E >= 1).map(q => [q.t, lg(q.E)]), f.X, f.Y, C.gold, 1.8);
      path(c, shown.filter(q => q.Ab >= 1).map(q => [q.t, lg(q.Ab)]), f.X, f.Y, C.cyan);
      const q = shown[shown.length - 1];
      if (q && !ck.done()) { c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.X(q.t), f.T); c.lineTo(f.X(q.t), f.B); c.stroke(); }
    }
  });
  function text() {
    const r = RATES[+sR.value];
    put('#raceRo', t('unit.double', { v: fmt(dbl(r), 1) }));
    put('#racePk', big(res.peak)); put('#raceTpk', t('unit.dayN', { v: fmt(res.tPeak, 1) }));
    put('#raceSick', days(res.sickDays)); put('#raceDet', res.detect == null ? t('unit.never') : t('unit.dayN', { v: fmt(res.detect, 1) }));
    const v = { td: fmt(dbl(r), 1), pk: big(res.peak), tpk: fmt(res.tPeak, 1), sick: fmt(res.sickDays, 1), sev: fmt(res.severeDays, 1), det: res.detect == null ? '—' : fmt(res.detect, 1), day: fmt(ck.t, 0) };
    const key = !ck.done() ? 'ch1.say.running' : res.severeDays > 0 ? 'ch1.say.severe' : res.sickDays > 0 ? 'ch1.say.sick' : 'ch1.say.mild';
    say('#raceSay', key, v);
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  sR.addEventListener('input', redo);
  on('#raceGo', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 02 one dose, two doses ───────── */
(() => {
  const cv = $("#doseCv"), sG = $("#doseGap"), TAIL = 150, ONE = 210;
  let res = null, ck = clock(1, 40);
  function model() {
    const two = radioVal('dosePlan') === '2', gap = +sG.value * 7, doses = two ? [0, gap] : [0];
    const until = two ? gap + TAIL : ONE, d = I.doses(doses, until);
    const reach = from => { const q = d.series.find(x => x.t >= from - 1e-9 && x.E >= 100); return q ? q.t - from : null; };
    res = { two, gap, until, series: d.series, r: d.res, start: doses.map(reach) };
    ck = clock(until, 40);
  }
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [34, 14, 40, 44], 0, res.until, 0, 5.2);
      logTicks(c, f, 4); axes(c, f, t('cv.days'), t('cv.amount'));
      const step = res.until > 250 ? 60 : 30, xs = []; for (let x = 0; x <= res.until; x += step) xs.push(x);
      xTicks(c, f, xs, v => fmt(v), xs[xs.length - 1] > res.until - step * 0.6);
      hline(c, f, lg(I.DETECT), C.mute);
      c.strokeStyle = C.gold; c.lineWidth = 3;
      for (const r of res.r) if (r.at <= ck.t) { const x = f.X(r.at); c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B - 16); c.stroke(); }
      const shown = res.series.filter(q => q.t <= ck.t);
      path(c, shown.filter(q => q.M >= 1).map(q => [q.t, lg(q.M)]), f.X, f.Y, C.violet, 1.8);
      path(c, shown.filter(q => q.Ab >= 1).map(q => [q.t, lg(q.Ab)]), f.X, f.Y, C.cyan);
    }
  });
  function text() {
    const r1 = res.r[0], r2 = res.r[1];
    put('#doseGapo', t('unit.weeks', { v: fmt(+sG.value), d: fmt(+sG.value * 7) }));
    put('#dosePk1', big(r1.peak)); put('#dosePk2', r2 ? big(r2.peak) : '—');
    put('#doseStart', r2 ? t('unit.daysArrow', { a: fmt(res.start[0], 1), b: fmt(res.start[1], 1) }) : days(res.start[0]));
    put('#doseMem', r2 ? t('unit.arrow', { a: fmt(r1.memAfter), b: fmt(r2.memAfter) }) : fmt(r1.memAfter));
    const lost = res.series.find(q => q.t > r1.at + r1.tPeak && q.Ab < I.DETECT && (!r2 || q.t < r2.at));
    const v = { pk1: big(r1.peak), tpk1: fmt(r1.tPeak, 1), det1: fmt(r1.detect, 1), s1: fmt(res.start[0], 1), m1: fmt(r1.memAfter),
      lost: lost ? fmt(lost.t / 30.4, 1) : '—', end: fmt(res.until) };
    let key;
    if (!ck.done()) key = 'ch2.say.running';
    else if (!r2) key = lost ? 'ch2.say.one' : 'ch2.say.onekept';
    else {
      Object.assign(v, { pk2: big(r2.peak), ratio: fmt(r2.peak / r1.peak, 1), s2: fmt(res.start[1], 1), m2: fmt(r2.memAfter), ab2: big(r2.abAtDose), gap: fmt(res.gap / 7) });
      key = r2.abAtDose < I.DETECT ? 'ch2.say.lost' : 'ch2.say.two';
    }
    say('#doseSay', key, v);
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  sG.addEventListener('input', redo); radios('dosePlan').forEach(r => r.addEventListener('change', redo));
  on('#doseGo', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 the race again, months after two doses (reuses the ch1 and ch2 models) ───────── */
(() => {
  const cv = $('#reCv'), SPAN = 28, ck = clock(SPAN, 4), sM = $('#reM'), sR = $('#reR'), DOSES = [0, 28], MONTH = 30.4;
  let vax = null, nai = null;
  function model() {
    const r = RATES[+sR.value], at = DOSES[1] + (+sM.value) * MONTH;
    vax = I.infection({ doses: DOSES, infectAt: at, until: at + SPAN, P: { r } });
    vax.rel = vax.series.filter(q => q.t >= at - 1e-9).map(q => Object.assign({}, q, { t: q.t - at }));
    nai = I.infection({ infectAt: 0, until: SPAN, P: { r } });
    ck.restart();
  }
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [34, 14, 40, 44], 0, SPAN, 0, 8.6);
      logTicks(c, f, 8); axes(c, f, t('cv.daysAfter'), t('cv.amount'));
      xTicks(c, f, [0, 7, 14, 21, 28], v => fmt(v), true);
      hline(c, f, lg(I.SYMPTOM), C.mute); hline(c, f, lg(I.SEVERE), C.red);
      const nS = nai.series.filter(q => q.t <= ck.t), vS = vax.rel.filter(q => q.t <= ck.t);
      path(c, nS.filter(q => q.V >= 1).map(q => [q.t, lg(q.V)]), f.X, f.Y, C.mute, 1.6);
      path(c, vS.filter(q => q.Ab >= 1).map(q => [q.t, lg(q.Ab)]), f.X, f.Y, C.cyan, 1.8);
      const vv = vS.filter(q => q.V >= 1).map(q => [q.t, lg(q.V)]);
      if (vv.length > 1) path(c, vv, f.X, f.Y, C.red); else if (vS.length) dot(c, f.X(0), f.Y(0), C.red, 3.5);
    }
  });
  function text() {
    const r = RATES[+sR.value], door = I.doorLevel(Object.assign({}, I.P, { r }));
    put('#reMo', months(+sM.value)); put('#reRo', t('unit.double', { v: fmt(dbl(r), 1) }));
    put('#reAb', t('ch3.unit.ab', { v: big(vax.abAtInfection), door: big(door) }));
    put('#rePk', t('unit.pair', { a: vax.peak <= 1.0001 ? '1' : big(vax.peak), b: big(nai.peak) }));
    put('#reSick', t('unit.daysPair', { a: fmt(vax.sickDays, 1), b: fmt(nai.sickDays, 1) }));
    put('#reSev', t('unit.daysPair', { a: fmt(vax.severeDays, 1), b: fmt(nai.severeDays, 1) }));
    const v = { m: fmt(+sM.value), ab: big(vax.abAtInfection), door: big(door), td: fmt(dbl(r), 1), ratio: fmt(nai.peak / Math.max(1, vax.peak)), pk: big(vax.peak),
      vs: fmt(vax.sickDays, 1), ns: fmt(nai.sickDays, 1), vv: fmt(vax.severeDays, 1), nv: fmt(nai.severeDays, 1) };
    let key;
    if (!ck.done()) key = 'ch3.say.running';
    else if (vax.peak <= 1.0001) key = 'ch3.say.door';
    else if (vax.sickDays === 0) key = 'ch3.say.silent';
    else if (vax.severeDays === 0) key = 'ch3.say.mild';
    else key = 'ch3.say.severe';
    say('#reSay', key, v);
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sM, sR].forEach(e => e.addEventListener('input', redo));
  on('#reGo', 'click', () => { ck.restart(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 a two-arm trial ───────── */
(() => {
  const cv = $('#trCv'), cv2 = $('#trCv2'), T = M.trial, SIZES = [500, 1000, 2000, 5000, 10000, 18000, 30000, 50000];
  const REAL = { nV: 18198, nP: 18325, cV: 8, cP: 162 };
  const sN = $('#trN'), sP = $('#trCP'), sV = $('#trCV');
  let st = Object.assign({ real: true }, REAL), res = null;
  // fixed scatter of 10 000 places, so the same people stay ill as the counts change
  const order = (() => { const R = M.rng(7), a = [...Array(10000).keys()]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
  const model = () => { res = T.analyze(st); };
  model();
  function grid(c, x0, y0, size, ill, col, label) {
    const cell = size / 100;
    c.fillStyle = '#1b2130'; c.fillRect(x0, y0, size, size);
    c.fillStyle = col; const r = Math.max(1.6, cell * 0.9);
    for (let k = 0; k < ill; k++) { const i = order[k]; c.fillRect(x0 + (i % 100) * cell - (r - cell) / 2, y0 + Math.floor(i / 100) * cell - (r - cell) / 2, r, r); }
    c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(label, x0, y0 - 12);
  }
  const sim = reg([cv, cv2], {
    draw() {
      { const { c, w, h } = fit(cv), size = Math.min(h - 40, (w - 30) / 2), gap = Math.max(16, (w - 2 * size) / 3);
        const per = x => Math.min(10000, Math.round(x * 10000));
        grid(c, gap, 30, size, per(res.riskV), C.red, t('ch4.cv.vax'));
        grid(c, 2 * gap + size, 30, size, per(res.riskP), C.red, t('ch4.cv.pla')); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [30, 18, 40, 18], -1, 1, 0, 1);
        c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
        xTicks(c, f, [-1, -0.5, 0, 0.5, 1], v => pct(v));
        vline(c, f, 0, C.mute);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch4.cv.axis'), f.L, f.T - 14);
        if (res.riskP > 0 && isFinite(res.lo)) {
          const y = (f.T + f.B) / 2 + 4, a = f.X(Math.max(-1, res.lo)), b = f.X(Math.min(1, res.hi));
          c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(a, y); c.lineTo(b, y); c.stroke();
          if (res.lo < -1) { c.beginPath(); c.moveTo(a + 7, y - 5); c.lineTo(a, y); c.lineTo(a + 7, y + 5); c.stroke(); }
          dot(c, f.X(Math.max(-1, Math.min(1, res.ve))), y, C.gold, 6);
        } }
    }
  });
  function text() {
    put('#trNo', st.real ? t('ch4.unit.real', { a: fmt(st.nV), b: fmt(st.nP) }) : t('ch4.unit.n', { v: fmt(st.nV) }));
    put('#trCPo', fmt(st.cP)); put('#trCVo', fmt(st.cV));
    $('#trReal').setAttribute('aria-pressed', String(st.real));
    const ok = res.riskP > 0;
    put('#trVe', ok ? pct(res.ve, 1) : '—');
    put('#trCi', ok ? t('unit.range', { a: pct(res.lo, 1), b: pct(res.hi, 1) }) : '—');
    put('#trRisk', t('ch4.unit.risk', { v: fmt(res.riskV * 1e4, 1), p: fmt(res.riskP * 1e4, 1) }));
    put('#trNnv', ok && res.arr > 0 ? people(res.nnv) : '—');
    const v = { ve: pct(res.ve, 1), lo: pct(res.lo, 1), hi: pct(res.hi, 1), rv: fmt(res.riskV * 1e4, 1), rp: fmt(res.riskP * 1e4, 1), rr: pct(res.rr, 1), vec: pct(res.veC, 1),
      sick: pct(res.riskV, 2), nnv: fmt(res.nnv), cv: fmt(st.cV), cp: fmt(st.cP) };
    let key;
    if (!ok) key = 'ch4.say.noplacebo';
    else if (res.ve < 0) key = 'ch4.say.worse';
    else if (res.lo <= 0) key = 'ch4.say.unsure';
    else key = st.cV === 0 ? 'ch4.say.zero' : 'ch4.say.ok';
    if (key === 'ch4.say.unsure' && st.cV === 0) key = 'ch4.say.zerounsure';
    say('#trSay', key, v);
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  const fromSliders = () => { const n = SIZES[+sN.value]; st = { real: false, nV: n, nP: n, cV: Math.min(+sV.value, n), cP: Math.min(+sP.value, n) }; redo(); };
  [sN, sP, sV].forEach(e => e.addEventListener('input', fromSliders));
  on('#trReal', 'click', () => { st = Object.assign({ real: true }, REAL); sN.value = SIZES.indexOf(18000); sP.value = REAL.cP; sV.value = REAL.cV; redo(); });
  text();
})();

/* ───────── 05 who the cases are ───────── */
(() => {
  const cv = $('#brCv'), cv2 = $('#brCv2'), B = M.base, sC = $('#brC'), sE = $('#brE'), A = 0.1, N = 100000;
  const p = () => ({ c: +sC.value / 100, e: +sE.value / 100 });
  const sim = reg([cv, cv2], {
    draw() {
      const P = p(), s = B.split({ c: P.c, e: P.e, a: A, N });
      { const { c, w, h } = fit(cv), labW = Math.min(Math.max(c.measureText(t('ch5.cv.pop')).width, c.measureText(t('ch5.cv.cases')).width) + 6, w * 0.4), x0 = labW + 8, bw = w - x0 - 12, bh = Math.min(26, (h - 30) / 2.4);
        const rows = [[t('ch5.cv.pop'), P.c], [t('ch5.cv.cases'), s.casesV + s.casesU > 0 ? s.shareV : 0]];
        rows.forEach(([lab, sh], i) => { const y = 14 + i * (bh + 22);
          c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(lab, labW, y + bh / 2);
          c.fillStyle = C.green; c.fillRect(x0, y, bw * sh, bh); c.fillStyle = C.gray; c.fillRect(x0 + bw * sh, y, bw * (1 - sh), bh); }); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [34, 16, 40, 48], 0, 1, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => pct(v)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
        xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v), true);
        hline(c, f, 0.5, C.mute);
        const pts = []; for (let x = 0; x <= 1.0001; x += 0.005) pts.push([Math.min(1, x), B.shareV(Math.min(1, x), P.e)]);
        path(c, pts, f.X, f.Y, C.green);
        if (P.e > 0) { const xc = B.crossing(P.e); vline(c, f, xc, C.gold); }
        dot(c, f.X(P.c), f.Y(B.shareV(P.c, P.e)), C.gold, 6); }
    }
  });
  function text() {
    const P = p(), s = B.split({ c: P.c, e: P.e, a: A, N });
    put('#brCo', pct(P.c)); put('#brEo', pct(P.e));
    put('#brNV', people(s.casesV)); put('#brCu', people(s.casesU));
    put('#brRate', t('unit.pair', { a: pct(s.rateV, 1), b: pct(s.rateU, 1) }));
    // a share that rounds to 50% is shown with one decimal, so "most" and "few" never both read 50%
    const shareTxt = pct(s.shareV) === pct(0.5) ? pct(s.shareV, 1) : pct(s.shareV);
    put('#brShare', shareTxt);
    const v = { c: pct(P.c), e: pct(P.e), share: shareTxt, nv: fmt(s.casesV), nu: fmt(s.casesU), rv: pct(s.rateV, 1), ru: pct(s.rateU, 1), cross: pct(B.crossing(P.e), 1), times: fmt(1 / (1 - P.e), 1 / (1 - P.e) < 9.95 ? 1 : 0) };
    const key = P.c === 0 ? 'ch5.say.none' : P.c === 1 ? 'ch5.say.all' : P.e === 0 ? 'ch5.say.useless' : s.shareV > 0.5 ? 'ch5.say.most' : 'ch5.say.few';
    say('#brSay', key, v);
  }
  sim.text = text;
  [sC, sE].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 06 herd protection ───────── */
(() => {
  const cv = $('#hdCv'), cv2 = $('#hdCv2'), Hd = M.herd, UNTIL = 365, SPEED = 40, sR = $('#hdR'), sE = $('#hdE'), sC = $('#hdC');
  const p = () => ({ R0: +sR.value, E: +sE.value / 100, c: +sC.value / 100 });
  let s = null, hist = [], yMax = 0.05;
  function fresh() {
    const P = p(); s = Hd.create(P.R0, P.c, P.E); hist = [[0, s.I]];
    const full = Hd.runTo(P.R0, P.c, P.E, UNTIL); yMax = Math.max(0.02, Math.ceil(full.peakI * 1.15 * 50) / 50);
    if (reduce) run(UNTIL);
  }
  function run(span) {
    const n = Math.round(Math.min(span, UNTIL - s.t) / Hd.H);
    for (let i = 0; i < n; i++) { Hd.step(s, Hd.H); if (Math.round(s.t / Hd.H) % 10 === 0) hist.push([s.t, s.I]); }
  }
  fresh();
  const sim = reg([cv, cv2], {
    step(dt) { if (s.t < UNTIL - 1e-9) { run(dt * SPEED); this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const P = p();
      { const { c, w, h } = fit(cv), f = frame(w, h, [34, 14, 40, 48], 0, UNTIL, 0, yMax);
        const ys = [0, yMax / 2, yMax]; yTicks(c, f, ys, v => pct(v, yMax < 0.05 ? 1 : 0)); axes(c, f, t('cv.days'), t('ch6.cv.y1'));
        xTicks(c, f, [0, 90, 180, 270, 365], v => fmt(v), true);
        path(c, hist.map(q => [q[0], Math.min(q[1], yMax)]), f.X, f.Y, C.red);
        if (hist.length) dot(c, f.X(s.t), f.Y(Math.min(s.I, yMax)), C.red, 3.5); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [34, 16, 40, 48], 0, 1, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => pct(v)); axes(c, f, t('ch6.cv.x2'), t('ch6.cv.y2'));
        xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v), true);
        const need = Hd.coverageNeeded(P.R0, P.E); if (need <= 1) vline(c, f, need, C.green);
        const pts = []; for (let x = 0; x <= 1.0001; x += 0.005) pts.push([Math.min(1, x), Hd.attack(P.R0, Math.min(1, x), P.E)]);
        path(c, pts, f.X, f.Y, C.violet);
        dot(c, f.X(P.c), f.Y(Hd.attack(P.R0, P.c, P.E)), C.gold, 6); }
    }
  });
  function text() {
    const P = p(), re = Hd.re(P.R0, P.c, P.E), need = Hd.coverageNeeded(P.R0, P.E), a = Hd.attack(P.R0, P.c, P.E);
    put('#hdRo', fmt(P.R0, 1)); put('#hdEo', pct(P.E)); put('#hdCo', pct(P.c));
    put('#hdRe', fmt(re, 2)); put('#hdNeed', need <= 1 ? pct(need, 1) : t('ch6.unit.unreach'));
    put('#hdRiskU', pct(a)); put('#hdRiskV', pct(a * (1 - P.E), 1));
    const v = { re: fmt(re, 2), need: pct(need, 1), ru: pct(a), rv: pct(a * (1 - P.E), 1), c: pct(P.c), e: pct(P.E), r0: fmt(P.R0, 1), full: fmt(P.R0 * (1 - P.E), 2), none: pct(Hd.attack(P.R0, 0, P.E)), max: fmt(Hd.maxR0(P.E), 1), pk: pct(s.peakI, 1), day: fmt(s.tPeak) };
    const key = P.R0 <= 1 + 1e-9 ? 'ch6.say.nospread' : re <= 1 + 1e-9 ? 'ch6.say.below' : need > 1 ? 'ch6.say.unreach' : 'ch6.say.above';
    say('#hdSay', key, v);
  }
  sim.text = text;
  const redo = () => { fresh(); sim.dirty = true; text(); };
  [sR, sE, sC].forEach(e => e.addEventListener('input', redo));
  on('#hdGo', 'click', redo);
  text();
})();

/* ───────── 07 waning and boosters (reuses the ch6 threshold) ───────── */
(() => {
  const cv = $('#wnCv'), W = M.wane, R0 = 3, E = 0.95, SPAN = 48, ck = clock(SPAN, 8), sH = $('#wnH'), sC = $('#wnC');
  const p = () => ({ H: +sH.value, c: +sC.value / 100, B: +radioVal('wnB') });
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const P = p(), { c, w, h } = fit(cv), f = frame(w, h, [34, 14, 40, 44], 0, SPAN, 0, R0);
      yTicks(c, f, [0, 1, 2, 3], v => fmt(v)); axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      xTicks(c, f, [0, 12, 24, 36, 48], v => fmt(v), true);
      const pts = []; for (let m = 0; m <= ck.t + 1e-9; m += 0.1) pts.push([m, W.re(m, R0, P.c, E, P.H, P.B)]);
      c.fillStyle = 'rgba(240,122,109,.22)';
      if (pts.length > 1) { // area between max(Re, 1) and the line Re = 1
        c.beginPath(); c.moveTo(f.X(pts[0][0]), f.Y(1));
        for (const q of pts) c.lineTo(f.X(q[0]), f.Y(Math.max(1, q[1])));
        c.lineTo(f.X(pts[pts.length - 1][0]), f.Y(1)); c.closePath(); c.fill();
      }
      hline(c, f, 1, C.green);
      path(c, pts, f.X, f.Y, C.gold);
    }
  });
  function text() {
    const P = p(), re0 = R0 * (1 - P.c * E), T = W.timeAbove(R0, P.c, E, P.H), share = W.shareAbove(R0, P.c, E, P.H, P.B, SPAN);
    put('#wnHo', months(P.H)); put('#wnCo', pct(P.c));
    put('#wnRe0', fmt(re0, 2)); put('#wnT', T === 0 ? t('ch7.unit.never') : months(T, 1));
    put('#wnShare', pct(share)); put('#wnNow', fmt(W.re(ck.t, R0, P.c, E, P.H, P.B), 2));
    const v = { re0: fmt(re0, 2), T: fmt(T, 1), B: fmt(P.B), share: pct(share), H: fmt(P.H), gap: fmt(P.B - T, 1) };
    let key;
    if (!ck.done()) key = 'ch7.say.running';
    else if (T === 0) key = 'ch7.say.never';
    else if (P.B === 0) key = 'ch7.say.lapse';
    else if (T >= P.B) key = 'ch7.say.kept';
    else key = 'ch7.say.gaps';
    say('#wnSay', key, v);
  }
  sim.text = text;
  const redo = () => { ck.restart(); sim.dirty = true; text(); };
  [sH, sC].forEach(e => e.addEventListener('input', redo)); radios('wnB').forEach(r => r.addEventListener('change', redo));
  on('#wnGo', 'click', redo);
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
