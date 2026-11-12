/* Why one rate moves everything: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.RateModels, D = window.RateData;
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
const MINUS = '−';
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: true }).replace('-', MINUS);
}
// signed: "+1.25", "−0.40", "0.00"
function sgn(x, d = 0) { const s = fmt(x, d); return (Math.abs(x) >= 0.5 * Math.pow(10, -d) && x > 0) ? '+' + s : s; }
const ym = s => ({ y: +s.slice(0, 4), m: +s.slice(5, 7) });
function dateText(s) { // 'YYYY-MM-DD' | 'YYYY-MM' | 'YYYYQn'
  if (/Q/.test(s)) return t('ch12.date.q', { y: s.slice(0, 4), q: s.slice(5) });
  if (s.length === 7) return t('ch12.date.ym', ym(s));
  return t('ch12.date.ymd', { y: +s.slice(0, 4), m: +s.slice(5, 7), d: +s.slice(8, 10) });
}

const texts = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; });
  texts.forEach(f => f());
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const setRadio = (name, v) => radios(name).forEach(r => { r.checked = r.value === v; });
// text in a DOM node only when it changed (keeps aria-live quiet)
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
// one model = one canvas group + one text function; any control change redraws and rewrites
function model(cvs, draw, text, inputs) {
  const sim = reg(cvs, { draw });
  const go = () => { sim.dirty = true; text(); };
  texts.push(text);
  inputs.forEach(el => el.addEventListener(el.type === 'range' ? 'input' : 'change', go));
  return go;
}

/* plot helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function nice(lo, hi, n = 5) {
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const raw = (hi - lo) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(k => k * mag).find(s => s >= raw * 0.999);
  const a = Math.floor(lo / step + 1e-9) * step, b = Math.ceil(hi / step - 1e-9) * step, ticks = [];
  for (let v = a; v <= b + step * 1e-6; v += step) ticks.push(Math.abs(v) < step * 1e-6 ? 0 : v);
  const isInt = v => Math.abs(v - Math.round(v)) < 1e-9, dec = isInt(step) ? 0 : isInt(step * 10) ? 1 : 2;
  return { lo: a, hi: b, ticks, dec };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 29); }
}
function xTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach(v => { const x = f.X(v); c.fillText(fmtv(v), x, f.B + 12); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv, right) {
  c.fillStyle = C.mute; c.textAlign = right ? 'left' : 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), right ? f.R + 6 : f.L - 6, y); if (!right) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); } });
}
function hline(c, f, y, col, dash = [5, 4], lw = 1.3) { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function vline(c, f, x, col, dash = [4, 4]) { c.strokeStyle = col; c.lineWidth = 1.2; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function clipTo(c, f) { c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 4); c.clip(); }
const pctT = (key, x, d) => t(key, { v: fmt(x, d) });

/* ───────── 01 present value ───────── */
(() => {
  const cv = $('#pvCv'), sR = $('#pvR');
  const P = () => ({ r: +sR.value, kind: radioVal('pvKind') });
  function draw() {
    const { c, w, h } = fit(cv), p = P(), cfs = M.pv.stream(p.kind);
    const now = M.pv.each(cfs, p.r), up = M.pv.each(cfs, p.r + 1), top = Math.max(...cfs);
    const yr = nice(0, top, 4), f = frame(w, h, [30, 12, 40, 44], 0.3, 30.7, 0, yr.hi);
    yTicks(c, f, yr.ticks, v => fmt(v, yr.dec)); axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
    const bw = Math.max(2, (f.R - f.L) / 31 * 0.72);
    cfs.forEach((v, i) => {
      const x = f.X(i + 1) - bw / 2;
      c.fillStyle = C.dimfill; c.fillRect(x, f.Y(v), bw, f.B - f.Y(v));
      c.fillStyle = C.gold; c.fillRect(x, f.Y(now[i]), bw, f.B - f.Y(now[i]));
      c.strokeStyle = C.cyan; c.lineWidth = 1.2; c.strokeRect(x + 0.6, f.Y(up[i]), bw - 1.2, f.B - f.Y(up[i]));
    });
    xTicks(c, f, [1, 10, 20, 30], v => fmt(v));
  }
  function text() {
    const p = P(), cfs = M.pv.stream(p.kind), tot = M.pv.total(cfs, p.r);
    put('#pvRo', pctT('ch1.unit.pct', p.r, 2));
    put('#pvTot', fmt(tot, 1)); put('#pvUp', t('ch1.unit.pct', { v: sgn(M.pv.pctChange(cfs, p.r, p.r + 1), 1) }));
    put('#pvLate', pctT('ch1.unit.pct', 100 * M.pv.lateShare(cfs, p.r, 20), 1)); put('#pvAvg', t('ch1.unit.years', { v: fmt(M.pv.avgTime(cfs, p.r), 1) }));
    const loss = (tt, a, b) => 100 * (1 - M.pv.df(b, tt) / M.pv.df(a, tt));
    if (p.r === 0) putHTML('#pvSay', t('ch1.say.zero', { tot: fmt(tot, 0), d30: fmt(loss(30, 0, 1), 1), d1: fmt(loss(1, 0, 1), 2) }));
    else putHTML('#pvSay', t('ch1.say.normal', { r: fmt(p.r, 2), tot: fmt(tot, 1), d1: fmt(loss(1, p.r, p.r + 1), 2), d30: fmt(loss(30, p.r, p.r + 1), 1), up: fmt(-M.pv.pctChange(cfs, p.r, p.r + 1), 1) }));
  }
  model(cv, draw, text, [sR, ...radios('pvKind')]);
})();

/* ───────── 02 bonds ───────── */
(() => {
  const cv = $('#bdCv'), sDy = $('#bdDy'), sY0 = $('#bdY0'), sC = $('#bdC'), b22 = $('#bd2022');
  const Y21 = { 2: [0.73, 4.41], 10: [1.52, 3.88], 30: [1.90, 3.97] }; // 2021-12-31 and 2022-12-30 Treasury par yields (data.js / FRED DGS)
  let y2022 = false;
  const P = () => ({ dy: +sDy.value, y0: +sY0.value, c: +sC.value, T: +radioVal('bdSel') });
  const cols = { 2: C.green, 10: C.cyan, 30: C.red };
  // bond T under the current mode: [coupon, start yield, yield change]
  const setup = (p, T) => y2022 ? [Y21[T][0], Y21[T][0], Y21[T][1] - Y21[T][0]] : [p.c, p.y0, p.dy];
  function draw() {
    const { c, w, h } = fit(cv), p = P();
    const x0 = y2022 ? -0.5 : -3, x1 = y2022 ? 4 : 3, curves = {};
    let lo = 0, hi = 0;
    [2, 10, 30].forEach(T => { const [cp, y0] = setup(p, T), pts = []; for (let x = x0; x <= x1 + 1e-9; x += 0.05) { const v = M.bond.exactPct(cp, T, y0, x); pts.push([x, v]); lo = Math.min(lo, v); hi = Math.max(hi, v); } curves[T] = pts; });
    const [cs, ys] = setup(p, p.T), tan = [[x0, M.bond.durPct(cs, p.T, ys, x0)], [x1, M.bond.durPct(cs, p.T, ys, x1)]];
    if (!y2022) tan.forEach(q => { lo = Math.min(lo, q[1]); hi = Math.max(hi, q[1]); });
    const yr = nice(lo, hi, 6), f = frame(w, h, [30, 14, 40, 46], x0, x1, yr.lo, yr.hi);
    yTicks(c, f, yr.ticks, v => fmt(v, yr.dec)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    xTicks(c, f, y2022 ? [0, 1, 2, 3, 4] : [-3, -2, -1, 0, 1, 2, 3], v => sgn(v));
    hline(c, f, 0, C.line, []); vline(c, f, 0, C.line, []);
    clipTo(c, f);
    if (!y2022) path(c, tan, f.X, f.Y, C.gold, 1.6, [6, 4]);
    [2, 10, 30].forEach(T => path(c, curves[T], f.X, f.Y, cols[T], T === p.T ? 2.6 : 1.8));
    [2, 10, 30].forEach(T => { const [cp, y0, dy] = setup(p, T); dot(c, f.X(dy), f.Y(M.bond.exactPct(cp, T, y0, dy)), cols[T]); });
    c.restore();
    if (y2022) { c.fillStyle = C.gold; c.textAlign = 'right'; c.fillText(t('ch2.cv.2022'), f.R - 4, f.T + 10); }
  }
  function text() {
    const p = P(), ex = {};
    [2, 10, 30].forEach(T => { const [cp, y0, dy] = setup(p, T); ex[T] = M.bond.exactPct(cp, T, y0, dy); });
    put('#bdDyo', t('ch2.unit.pp', { v: sgn(p.dy, 2) })); put('#bdY0o', pctT('ch2.unit.pct', p.y0, 2)); put('#bdCo', pctT('ch2.unit.pct', p.c, 2));
    put('#bdP2', t('ch2.unit.pct', { v: sgn(ex[2], 2) })); put('#bdP10', t('ch2.unit.pct', { v: sgn(ex[10], 2) })); put('#bdP30', t('ch2.unit.pct', { v: sgn(ex[30], 2) }));
    const [cs, ys, dys] = setup(p, p.T), dur = M.bond.durPct(cs, p.T, ys, dys), dc = M.bond.durConvPct(cs, p.T, ys, dys);
    put('#bdDur', t('ch2.unit.durpair', { a: sgn(dur, 2), b: sgn(dc, 2) })); put('#bdDurL', t('ch2.read.durL', { T: p.T }));
    b22.setAttribute('aria-pressed', String(y2022));
    let s;
    if (y2022) s = t('ch2.say.y2022', { p2: fmt(-ex[2], 2), p10: fmt(-ex[10], 2), p30: fmt(-ex[30], 2) });
    else if (p.dy > 0) s = t('ch2.say.up', { dy: fmt(p.dy, 2), p2: fmt(-ex[2], 2), p30: fmt(-ex[30], 2), ratio: fmt(ex[30] / ex[2], 1), T: p.T, dur: fmt(dur, 2), dc: fmt(dc, 2), ex: fmt(ex[p.T], 2) });
    else if (p.dy < 0) s = t('ch2.say.down', { dy: fmt(-p.dy, 2), p2: fmt(ex[2], 2), p30: fmt(ex[30], 2), T: p.T, dur: fmt(dur, 2), ex: fmt(ex[p.T], 2) });
    else s = t('ch2.say.zero');
    putHTML('#bdSay', s);
  }
  const go = model(cv, draw, text, [...radios('bdSel')]);
  [sDy, sY0, sC].forEach(e => e.addEventListener('input', () => { y2022 = false; go(); }));
  b22.addEventListener('click', () => { y2022 = !y2022; go(); });
})();

/* ───────── 03 bootstrapping ───────── */
(() => {
  const cv = $('#cvCv'), sN = $('#cvN');
  const boot = () => M.curve.bootstrap(D.curveMat, D.curves[radioVal('cvDate')]);
  function draw() {
    const { c, w, h } = fit(cv), b = boot(), n = +sN.value, ys = D.curves[radioVal('cvDate')];
    const all = b.par.concat(b.spot, b.fwd), yr = nice(Math.min(0, ...all), Math.max(...all), 5);
    const f = frame(w, h, [30, 14, 40, 40], 0, 30, yr.lo, yr.hi);
    yTicks(c, f, yr.ticks, v => fmt(v, yr.dec)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    xTicks(c, f, [1, 5, 10, 20, 30], v => fmt(v));
    vline(c, f, n - 0.5, C.line);
    // forward rates as one-year steps
    c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath();
    b.fwd.forEach((v, i) => { c[i ? 'lineTo' : 'moveTo'](f.X(i), f.Y(v)); c.lineTo(f.X(i + 1), f.Y(v)); }); c.stroke();
    path(c, b.spot.map((v, i) => [i + 1, v]), f.X, f.Y, C.cyan, 2.2);
    D.curveMat.forEach((m, i) => { dot(c, f.X(m), f.Y(ys[i]), C.ink, 4); });
    dot(c, f.X(n), f.Y(b.spot[n - 1]), C.cyan, 5); dot(c, f.X(n - 0.5), f.Y(b.fwd[n - 1]), C.gold, 5);
  }
  function text() {
    const b = boot(), n = +sN.value;
    put('#cvNo', t('ch3.unit.years', { v: n }));
    put('#cvPar', pctT('ch3.unit.pct', b.par[n - 1], 2)); put('#cvSpot', pctT('ch3.unit.pct', b.spot[n - 1], 2));
    put('#cvFwd', pctT('ch3.unit.pct', b.fwd[n - 1], 2)); put('#cvDf', fmt(b.df[n - 1], 4));
    const v = { n, n1: n - 1, z: fmt(b.spot[n - 1], 2), z1: fmt(b.spot[0], 2), f: fmt(b.fwd[n - 1], 2) };
    putHTML('#cvSay', t(n === 1 ? 'ch3.say.one' : b.spot[n - 1] < b.spot[0] ? 'ch3.say.inverted' : 'ch3.say.normal', v));
  }
  model(cv, draw, text, [sN, ...radios('cvDate')]);
})();

/* ───────── 04a expectations + term premium ───────── */
(() => {
  const cv = $('#ehCv'), sI0 = $('#ehI0'), sIL = $('#ehIL'), sH = $('#ehH'), sTP = $('#ehTP');
  const P = () => ({ i0: +sI0.value, iL: +sIL.value, h: +sH.value, tp10: +sTP.value });
  function draw() {
    const { c, w, h } = fit(cv), p = P(), N = 10, pts = { path: [], exp: [], yld: [] };
    for (let x = 0; x <= N + 1e-9; x += 0.1) { pts.path.push([x, M.eh.expShort(p, x)]); pts.exp.push([x, M.eh.avgExp(p, x)]); pts.yld.push([x, M.eh.yield(p, x)]); }
    const all = [].concat(...Object.values(pts).map(a => a.map(q => q[1]))), yr = nice(Math.min(0, ...all), Math.max(...all), 5);
    const f = frame(w, h, [30, 14, 40, 40], 0, N, yr.lo, yr.hi);
    yTicks(c, f, yr.ticks, v => fmt(v, yr.dec)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
    xTicks(c, f, [0, 2, 4, 6, 8, 10], v => fmt(v));
    path(c, pts.path, f.X, f.Y, C.mute, 1.6, [5, 4]); path(c, pts.exp, f.X, f.Y, C.cyan, 2); path(c, pts.yld, f.X, f.Y, C.gold, 2.4);
    dot(c, f.X(0.25), f.Y(M.eh.yield(p, 0.25)), C.gold); dot(c, f.X(10), f.Y(M.eh.yield(p, 10)), C.gold);
  }
  function text() {
    const p = P(), y3 = M.eh.yield(p, 0.25), y10 = M.eh.yield(p, 10), sp = y10 - y3;
    put('#ehI0o', pctT('ch4.unit.pct', p.i0, 2)); put('#ehILo', pctT('ch4.unit.pct', p.iL, 2)); put('#ehHo', t('ch4.unit.years', { v: fmt(p.h, 2) })); put('#ehTPo', t('ch4.unit.pp', { v: sgn(p.tp10, 1) }));
    put('#ehY3m', pctT('ch4.unit.pct', y3, 2)); put('#ehY10', pctT('ch4.unit.pct', y10, 2)); put('#ehSp', t('ch4.unit.pp', { v: sgn(sp, 2) })); put('#ehTPr', t('ch4.unit.pp', { v: sgn(p.tp10, 1) }));
    const v = { sp: sgn(sp, 2), i0: fmt(p.i0, 2), iL: fmt(p.iL, 2), tp: sgn(p.tp10, 1), e: fmt(M.eh.avgExp(p, 10), 2) };
    const key = sp < -0.1 ? (p.i0 > p.iL ? 'ch4.say.inverted' : 'ch4.say.invtp') : sp <= 0.1 ? 'ch4.say.flat' : 'ch4.say.normal';
    putHTML('#ehSay', t(key, v));
  }
  model(cv, draw, text, [sI0, sIL, sH, sTP]);
})();

/* ───────── 04b inversion record ───────── */
(() => {
  const cv = $('#hsCv'), sL = $('#hsLead'), S = D.spread, y0 = +S.start.slice(0, 4), m0 = +S.start.slice(5, 7) - 1;
  const tpStart = (+D.tp.start.slice(0, 4) - y0) * 12 + (+D.tp.start.slice(5, 7) - 1) - m0;
  const yearOf = i => y0 + (m0 + i) / 12;
  const monthText = i => t('ch4.unit.ym', { y: y0 + Math.floor((m0 + i) / 12), m: (m0 + i) % 12 + 1 });
  function draw() {
    const { c, w, h } = fit(cv), n = S.s.length, lead = +sL.value, rec = M.inversionRecord(S.s, S.rec, lead);
    const f = frame(w, h, [30, 12, 40, 34], yearOf(0), yearOf(n), -3, 5);
    // recessions
    c.fillStyle = 'rgba(240,122,109,.28)';
    for (let i = 0; i < n; i++) if (S.rec[i]) c.fillRect(f.X(yearOf(i)), f.T, Math.max(1, f.X(yearOf(i + 1)) - f.X(yearOf(i))), f.B - f.T);
    yTicks(c, f, [-2, 0, 2, 4], v => fmt(v)); axes(c, f, null, t('ch4.cv.y'));
    const step = w < 480 ? 20 : 10, yrs = []; for (let y = Math.ceil(yearOf(0) / step) * step; y <= yearOf(n); y += step) yrs.push(y);
    xTicks(c, f, yrs, v => String(v));
    hline(c, f, 0, C.mute, [3, 3], 1);
    path(c, D.tp.v.map((v, k) => [yearOf(tpStart + k), v]), f.X, f.Y, C.violet, 1.4);
    path(c, S.s.map((v, i) => [yearOf(i), v]), f.X, f.Y, C.cyan, 1.4);
    // scored recessions: green = inversion came first, red ring = missed; false alarms marked in gold
    rec.called.forEach(r => { const x = f.X(yearOf(r.start)); if (r.called) dot(c, x, f.T + 8, C.green, 4.5); else { c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.arc(x, f.T + 8, 5, 0, 6.283); c.stroke(); } });
    rec.episodes.filter(e => !e.followed && !e.open).forEach(e => { const x = f.X(yearOf(e.start)); c.fillStyle = C.gold; c.beginPath(); c.moveTo(x, f.B - 12); c.lineTo(x - 5, f.B - 3); c.lineTo(x + 5, f.B - 3); c.closePath(); c.fill(); });
  }
  function text() {
    const lead = +sL.value, rec = M.inversionRecord(S.s, S.rec, lead), n = S.s.length;
    const hits = rec.called.filter(r => r.called).length, miss = rec.called.filter(r => !r.called), fa = rec.episodes.filter(e => !e.followed && !e.open);
    const sep = t('ch4.unit.sep'), missT = miss.length ? miss.map(r => monthText(r.start)).join(sep) : t('ch4.unit.none');
    put('#hsLeado', t('ch4.unit.months', { v: lead }));
    put('#hsCalled', t('ch4.unit.frac', { a: hits, b: rec.called.length })); put('#hsMiss', missT); put('#hsFalse', t('ch4.unit.count', { v: fa.length }));
    put('#hsNow', t('ch4.unit.pp', { v: sgn(S.s[n - 1], 2) })); put('#hsNowL', t('ch4.read.now', { m: monthText(n - 1) }));
    putHTML('#hsSay', t('ch4.say.hist', { lead, n: rec.called.length, c: hits, miss: missT, fa: fa.length, falist: fa.map(e => monthText(e.start)).join(sep) }));
  }
  model(cv, draw, text, [sL]);
})();

/* ───────── 05 reserves: Poole ───────── */
(() => {
  const cv = $('#plCv'), sR = $('#plR'), sD = $('#plD'), sS = $('#plS'), WIDTH = 2, NDAYS = 60, SEED = 7;
  const P = () => { const iD = +sD.value; return { iD, iL: iD + WIDTH, K: 0, sigma: 1 }; };
  const days = () => M.poole.days(P(), +sR.value, NDAYS, SEED, +sS.value);
  function draw() {
    const { c, w, h } = fit(cv), p = P(), R = +sR.value, ds = days(), wide = w >= 560;
    const y0 = p.iD - 0.6, y1 = p.iL + 0.6;
    const main = wide ? frame(w * 0.68, h, [30, 10, 40, 40], -2, 8, y0, y1) : frame(w, h * 0.62, [30, 12, 40, 40], -2, 8, y0, y1);
    const strip = wide ? frame(w, h, [30, 14, 40, w * 0.68 + 34], 0, NDAYS, y0, y1) : frame(w, h, [h * 0.62 + 28, 12, 26, 40], 0, NDAYS, y0, y1);
    const yt = nice(y0, y1, 4).ticks.filter(v => v >= y0 && v <= y1);
    yTicks(c, main, yt, v => fmt(v, 1)); axes(c, main, t('ch5.cv.x'), t('ch5.cv.y'));
    xTicks(c, main, [-2, 0, 2, 4, 6, 8], v => fmt(v));
    [p.iD, p.iL].forEach(v => hline(c, main, v, C.mute));
    const pts = []; for (let x = -2; x <= 8.001; x += 0.05) pts.push([x, M.poole.rate(p, x)]);
    path(c, pts, main.X, main.Y, C.cyan, 2.4);
    c.strokeStyle = C.gold; c.lineWidth = 2.4; c.beginPath(); c.moveTo(main.X(R), main.T); c.lineTo(main.X(R), main.B); c.stroke();
    dot(c, main.X(R), main.Y(M.poole.rate(p, R)), C.gold, 5);
    // the 60 days
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(strip.L, strip.T); c.lineTo(strip.L, strip.B); c.lineTo(strip.R, strip.B); c.stroke();
    [p.iD, p.iL].forEach(v => hline(c, strip, v, C.mute));
    if (!wide) yTicks(c, strip, yt, v => fmt(v, 1));
    ds.forEach((v, i) => dot(c, strip.X(i + 0.5), strip.Y(v), C.violet, 2.6));
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch5.cv.days'), strip.L + 4, wide ? strip.T - 12 : strip.B + 13);
  }
  function text() {
    const p = P(), R = +sR.value, ds = days(), mean = ds.reduce((a, b) => a + b, 0) / ds.length, sd = M.poole.sd(ds), pr = M.Phi((p.K - R) / p.sigma);
    put('#plRo', t('ch5.unit.R', { v: fmt(R, 2) })); put('#plDo', pctT('ch5.unit.pct', p.iD, 2)); put('#plSo', fmt(+sS.value, 1));
    put('#plRate', pctT('ch5.unit.pct', mean, 2)); put('#plSd', t('ch5.unit.pp', { v: fmt(sd, 3) })); put('#plPr', pctT('ch5.unit.pct', 100 * pr, 1)); put('#plGap', t('ch5.unit.pp', { v: fmt(mean - p.iD, 2) }));
    const q = (mean - p.iD) / WIDTH, key = q > 0.9 ? 'ch5.say.scarce' : q > 0.1 ? 'ch5.say.corridor' : q > 0.005 ? 'ch5.say.near' : 'ch5.say.floor';
    putHTML('#plSay', t(key, { R: fmt(R, 2), rate: fmt(mean, 2), sd: fmt(sd, 3), lo: fmt(p.iD, 2), hi: fmt(p.iL, 2) }));
  }
  const go = model(cv, draw, text, [sR, sD, sS]);
  $('#plCorr').addEventListener('click', () => { sR.value = 0; go(); });
  $('#plFloor').addEventListener('click', () => { sR.value = 4; go(); });
})();

/* ───────── 06 Taylor rule ───────── */
(() => {
  const cv = $('#tyCv'), sR = $('#tyR'), sA = $('#tyA'), sG = $('#tyG'), T = D.taylor, n = T.ff.length;
  const P = () => ({ rstar: +sR.value, target: 2, api: +sA.value, agap: +sG.value });
  const yq = i => +T.start.slice(0, 4) + (+T.start.slice(5) - 1 + i) / 4;
  const qShort = lab => t('ch6.unit.qshort', { y: lab.slice(0, 4), q: lab.slice(5) });
  const qLong = lab => t('ch6.unit.q', { y: lab.slice(0, 4), q: lab.slice(5) });
  function draw() {
    const { c, w, h } = fit(cv), p = P(), rule = M.taylor.series(p, T);
    const x0 = yq(0), x1 = yq(n), split = h * 0.58;
    const ry = nice(Math.min(-2, ...rule), Math.max(9, ...rule), 5);
    const f1 = frame(w, split, [30, 12, 22, 38], x0, x1, ry.lo, ry.hi);
    yTicks(c, f1, ry.ticks, v => fmt(v, ry.dec)); axes(c, f1, null, t('ch6.cv.y1'));
    hline(c, f1, 0, C.mute, [3, 3], 1);
    path(c, T.ff.map((v, i) => [yq(i + 0.5), v]), f1.X, f1.Y, C.cyan, 2);
    path(c, rule.map((v, i) => [yq(i + 0.5), v]), f1.X, f1.Y, C.gold, 2);
    const iy = nice(Math.min(...T.infl, ...T.gap), Math.max(...T.infl, ...T.gap), 4);
    const f2 = frame(w, h, [split + 26, 12, 32, 38], x0, x1, iy.lo, iy.hi);
    yTicks(c, f2, iy.ticks, v => fmt(v, iy.dec)); axes(c, f2, null, t('ch6.cv.y2'));
    hline(c, f2, 0, C.mute, [3, 3], 1); hline(c, f2, 2, C.red, [2, 4], 1);
    path(c, T.gap.map((v, i) => [yq(i + 0.5), v]), f2.X, f2.Y, C.violet, 1.6);
    path(c, T.infl.map((v, i) => [yq(i + 0.5), v]), f2.X, f2.Y, C.red, 1.8);
    const step = w < 480 ? 10 : 5, yrs = []; for (let y = 1990; y <= x1; y += step) yrs.push(y);
    xTicks(c, f2, yrs, v => String(v));
  }
  function text() {
    const p = P(), rule = M.taylor.series(p, T), last = M.taylor.qLabel(T.start, n - 1);
    const s1 = M.taylor.stats(p, T, '1990Q1', '2007Q4'), s2 = M.taylor.stats(p, T, T.start, last);
    let mi = 0; rule.forEach((v, i) => { if (v < rule[mi]) mi = i; });
    const minQ = M.taylor.qLabel(T.start, mi);
    put('#tyRo', pctT('ch6.unit.pct', p.rstar, 2)); put('#tyAo', fmt(p.api, 2)); put('#tyGo', fmt(p.agap, 2));
    put('#tyNow', t('ch6.unit.pair', { a: fmt(rule[n - 1], 2), b: fmt(T.ff[n - 1], 2) })); put('#tyNowL', t('ch6.read.now', { q: qShort(last) }));
    put('#tyMae', t('ch6.unit.pp', { v: fmt(s1.mae, 2) }));
    put('#tyBig', t('ch6.unit.pp', { v: sgn(s2.big, 2) })); put('#tyBigL', t('ch6.read.big', { q: qShort(s2.at) }));
    put('#tyMin', pctT('ch6.unit.pct', rule[mi], 2)); put('#tyMinL', t('ch6.read.min', { q: qShort(minQ) }));
    const a = t('ch6.say.main', { q: qLong(last), rule: fmt(rule[n - 1], 2), ff: fmt(T.ff[n - 1], 2), mae: fmt(s1.mae, 2), bigq: qLong(s2.at), dir: t(s2.big > 0 ? 'ch6.say.dir.hi' : 'ch6.say.dir.lo'), big: fmt(Math.abs(s2.big), 2) });
    const b = rule[mi] < 0 ? t('ch6.say.neg', { min: fmt(rule[mi], 2), minq: qLong(minQ) }) : t('ch6.say.pos');
    putHTML('#tySay', a + b);
  }
  model(cv, draw, text, [sR, sA, sG]);
})();

/* ───────── 07 New Keynesian model ───────── */
(() => {
  const cv = $('#nkCv'), cv2 = $('#nk2Cv'), sPhi = $('#nkPhi'), sK = $('#nkK'), chk = $('#nkTrack'), SHOCK = 0.25, NQ = 16, PHIX = 0.125;
  const P = () => Object.assign({}, M.nk.P, { phiPi: +sPhi.value, phiX: PHIX, kappa: +sK.value, track: chk.checked });
  const kind = () => radioVal('nkShock');
  function draw() {
    let g = fit(cv); const p = P(), k = kind();
    if (!M.nk.determinate(p)) {
      const f = frame(g.w, g.h, [30, 14, 40, 40], 0, NQ - 1, -1, 1); axes(g.c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      g.c.fillStyle = C.red; g.c.textAlign = 'center'; g.c.fillText(t('ch7.cv.indet'), (f.L + f.R) / 2, (f.T + f.B) / 2);
    } else {
      const r = M.nk.irf(p, k, SHOCK, NQ), sx = r.map(q => [q.t, q.x]), sp = r.map(q => [q.t, 4 * q.pi]), si = r.map(q => [q.t, 4 * q.i]);
      const all = [].concat(sx, sp, si).map(q => q[1]), yr = nice(Math.min(0, ...all), Math.max(0, ...all), 5);
      const f = frame(g.w, g.h, [30, 14, 40, 40], 0, NQ - 1, yr.lo, yr.hi);
      yTicks(g.c, f, yr.ticks, v => fmt(v, yr.dec)); axes(g.c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      xTicks(g.c, f, [0, 4, 8, 12], v => fmt(v)); hline(g.c, f, 0, C.mute, [3, 3], 1);
      path(g.c, si, f.X, f.Y, C.gold, 2); path(g.c, sp, f.X, f.Y, C.red, 2.2); path(g.c, sx, f.X, f.Y, C.violet, 2.2);
    }
    // supply-shock trade-off across φπ
    g = fit(cv2);
    const phis = []; for (let v = 1.05; v <= 5.0001; v += 0.05) phis.push(v);
    const fr = M.nk.frontier(Object.assign({}, p, { track: false }), SHOCK, phis).filter(q => M.nk.determinate(Object.assign({}, p, { phiPi: q.phi })));
    if (fr.length) {
      const xr = nice(0, Math.max(...fr.map(q => q.pi)), 4), yr = nice(0, Math.max(...fr.map(q => q.x)), 3);
      const f = frame(g.w, g.h, [28, 14, 38, 40], 0, xr.hi, 0, yr.hi);
      yTicks(g.c, f, yr.ticks, v => fmt(v, yr.dec)); axes(g.c, f, t('ch7.cv2.x'), t('ch7.cv2.y')); xTicks(g.c, f, xr.ticks, v => fmt(v, xr.dec));
      path(g.c, fr.map(q => [q.pi, q.x]), f.X, f.Y, C.mute, 1.6);
      if (M.nk.determinate(p)) { const c0 = M.nk.coeffs(p, 'supply'); dot(g.c, f.X(4 * Math.abs(c0.pi * SHOCK)), f.Y(Math.abs(c0.x * SHOCK)), k === 'supply' ? C.gold : C.mute, 5.5); }
    }
  }
  function text() {
    const p = P(), k = kind();
    put('#nkPhio', fmt(p.phiPi, 1)); put('#nkKo', fmt(p.kappa, 2));
    if (!M.nk.determinate(p)) {
      ['#nkX', '#nkPi', '#nkI', '#nkReal'].forEach(s => put(s, t('ch7.unit.none')));
      putHTML('#nkSay', t('ch7.say.indet', { phi: fmt(p.phiPi, 1) })); return;
    }
    const r = M.nk.irf(p, k, SHOCK, 2)[0], x = r.x, pi = 4 * r.pi, i = 4 * r.i, real = 4 * (r.i - p.rho * r.pi);
    put('#nkX', t('ch7.unit.pct', { v: sgn(x, 2) })); put('#nkPi', t('ch7.unit.pp', { v: sgn(pi, 2) })); put('#nkI', t('ch7.unit.pp', { v: sgn(i, 2) })); put('#nkReal', t('ch7.unit.pp', { v: sgn(real, 2) }));
    const v = { x: fmt(x, 2), pi: fmt(pi, 2), i: fmt(i, 2), cost: fmt(M.nk.costPerPoint(p, 1.5, 3), 2) };
    const key = k === 'supply' ? 'ch7.say.supply' : p.track ? 'ch7.say.tracked' : 'ch7.say.demand';
    putHTML('#nkSay', t(key, v));
  }
  model([cv, cv2], draw, text, [sPhi, sK, chk, ...radios('nkShock')]);
})();

/* ───────── 08a equity duration ───────── */
(() => {
  const cv = $('#eqCv'), sRf = $('#eqRf'), ERP = 4, BASE = 3, F = M.equity.firms;
  const idx = (fm, rf) => 100 * M.equity.price(fm, rf + ERP) / M.equity.price(fm, BASE + ERP);
  function draw() {
    const { c, w, h } = fit(cv), rf = +sRf.value, pv = [], pg = [];
    for (let x = 0; x <= 8.0001; x += 0.1) { pv.push([x, idx(F.value, x)]); pg.push([x, idx(F.growth, x)]); }
    const yr = nice(0, Math.max(...pg.map(q => q[1]), ...pv.map(q => q[1])), 5), f = frame(w, h, [30, 14, 40, 44], 0, 8, 0, yr.hi);
    yTicks(c, f, yr.ticks, v => fmt(v, yr.dec)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y')); xTicks(c, f, [0, 2, 4, 6, 8], v => fmt(v));
    hline(c, f, 100, C.mute, [3, 3], 1);
    path(c, pv, f.X, f.Y, C.cyan); path(c, pg, f.X, f.Y, C.gold);
    dot(c, f.X(rf), f.Y(idx(F.value, rf)), C.cyan); dot(c, f.X(rf), f.Y(idx(F.growth, rf)), C.gold);
  }
  function text() {
    const rf = +sRf.value, r = rf + ERP, a = M.equity.parts(F.value, r), b = M.equity.parts(F.growth, r);
    put('#eqRfo', pctT('ch8.unit.pct', rf, 2));
    put('#eqV', fmt(idx(F.value, rf), 1)); put('#eqG', fmt(idx(F.growth, rf), 1));
    put('#eqDv', t('ch8.unit.years', { v: fmt(a.duration, 1) })); put('#eqDg', t('ch8.unit.years', { v: fmt(b.duration, 1) }));
    putHTML('#eqSay', t('ch8.say.main', { rf: fmt(rf, 2), r: fmt(r, 2), dv: fmt(a.duration, 1), dg: fmt(b.duration, 1), pv: fmt(-M.equity.pct(F.value, r, r + 1), 1), pg: fmt(-M.equity.pct(F.growth, r, r + 1), 1) }));
  }
  model(cv, draw, text, [sRf]);
})();

/* ───────── 08b house: loan a fixed payment supports ───────── */
(() => {
  const cv = $('#hgCv'), sA = $('#hgA'), sB = $('#hgB'), PAY = 1000;
  function draw() {
    const { c, w, h } = fit(cv), a = +sA.value, b = +sB.value, pts = [];
    for (let r = 1; r <= 10.0001; r += 0.1) pts.push([r, M.house.loan(PAY, r) / 1000]);
    const yr = nice(0, Math.max(...pts.map(q => q[1])), 3), f = frame(w, h, [28, 14, 38, 44], 1, 10, 0, yr.hi);
    yTicks(c, f, yr.ticks, v => fmt(v, yr.dec) + 'k'); axes(c, f, t('ch8.cv2.x'), t('ch8.cv2.y')); xTicks(c, f, [2, 4, 6, 8, 10], v => fmt(v));
    path(c, pts, f.X, f.Y, C.mute, 1.8);
    dot(c, f.X(a), f.Y(M.house.loan(PAY, a) / 1000), C.cyan, 5.5); dot(c, f.X(b), f.Y(M.house.loan(PAY, b) / 1000), C.gold, 5.5);
  }
  function text() {
    const a = +sA.value, b = +sB.value, la = M.house.loan(PAY, a), lb = M.house.loan(PAY, b), pct = M.house.pct(a, b);
    put('#hgAo', pctT('ch8.unit.pct', a, 2)); put('#hgBo', pctT('ch8.unit.pct', b, 2));
    put('#hgLa', t('ch8.unit.money', { v: fmt(la) })); put('#hgLb', t('ch8.unit.money', { v: fmt(lb) })); put('#hgPct', t('ch8.unit.pct', { v: sgn(pct, 1) }));
    const v = { a: fmt(a, 2), b: fmt(b, 2), la: fmt(la), lb: fmt(lb), pct: fmt(Math.abs(pct), 1) };
    putHTML('#hgSay', t(b > a ? 'ch8.say.down' : b < a ? 'ch8.say.up' : 'ch8.say.same', v));
  }
  model(cv, draw, text, [sA, sB]);
})();

/* ───────── 09 carry trade ───────── */
(() => {
  const cv = $('#fxCv'), sHi = $('#fxHi'), sLo = $('#fxLo'), NAVG = 200;
  let seed = 3; const cache = {};
  const P = () => ({ iHi: +sHi.value, iLo: +sLo.value, vol: 10, years: 10, world: radioVal('fxWorld'), crashProb: 0.1, crashSize: 20 });
  const avg = p => { const k = JSON.stringify(p); if (!(k in cache)) cache[k] = M.fx.average(p, NAVG); return cache[k]; };
  function draw() {
    const { c, w, h } = fit(cv), r = M.fx.carry(P(), seed);
    const all = r.path.map(q => q[1]).concat(r.path.map(q => q[2])), yr = nice(Math.min(...all), Math.max(...all), 5);
    const f = frame(w, h, [30, 14, 40, 40], 0, 10, yr.lo, yr.hi);
    yTicks(c, f, yr.ticks, v => fmt(v, yr.dec)); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y')); xTicks(c, f, [0, 2, 4, 6, 8, 10], v => fmt(v));
    hline(c, f, 1, C.mute, [3, 3], 1);
    path(c, r.path.map(q => [q[0], q[1]]), f.X, f.Y, C.cyan, 1.6); path(c, r.path.map(q => [q[0], q[2]]), f.X, f.Y, C.gold, 2.2);
  }
  function text() {
    const p = P(), r = M.fx.carry(p, seed), a = avg(p), d = p.iHi - p.iLo;
    put('#fxHio', pctT('ch9.unit.pct', p.iHi, 2)); put('#fxLoo', pctT('ch9.unit.pct', p.iLo, 2));
    put('#fxF', t('ch9.unit.pct', { v: sgn(M.fx.forwardPremiumPct(p.iLo, p.iHi), 2) })); put('#fxAnn', t('ch9.unit.pct', { v: sgn(r.annual, 2) }));
    put('#fxDd', t('ch9.unit.pct', { v: fmt(r.maxDrawdown, 1) })); put('#fxAvg', t('ch9.unit.pct', { v: sgn(a, 2) }));
    const v = { d: fmt(Math.abs(d), 2), fp: fmt(Math.abs(M.fx.forwardPremiumPct(p.iLo, p.iHi)), 2), avg: sgn(a, 2), dd: fmt(r.maxDrawdown, 1) };
    const key = Math.abs(d) < 1e-9 ? 'ch9.say.zero' : d < 0 ? 'ch9.say.neg' : 'ch9.say.' + p.world;
    putHTML('#fxSay', t(key, v));
  }
  const go = model(cv, draw, text, [sHi, sLo, ...radios('fxWorld')]);
  $('#fxNew').addEventListener('click', () => { seed++; go(); });
})();

/* ───────── 10 lower bound ───────── */
(() => {
  const cv = $('#lbCv'), sL = $('#lbL'), sQ = $('#lbQ'), BASE = { iL: 3, h: 1.5, tp10: 1.0 };
  const P = () => Object.assign({}, BASE, { L: +sL.value, qe: +sQ.value, bp: M.lb.perGDP[radioVal('lbEst')] });
  function parts() {
    const p = P(), base = M.lb.yield10(Object.assign({}, p, { L: 0, qe: 0 })), fgOnly = M.lb.yield10(Object.assign({}, p, { qe: 0 })), y = M.lb.yield10(p);
    return { p, base, y, fg: base - fgOnly, qe: fgOnly - y, e: base - p.tp10 };
  }
  function draw() {
    const { c, w, h } = fit(cv), q = parts();
    const xr = nice(Math.min(0, q.y), Math.max(q.base, 4), 5), lab = Math.max(c.measureText(t('ch10.cv.base')).width, c.measureText(t('ch10.cv.now')).width);
    const f = frame(w, h, [30, 14, 40, lab + 18], xr.lo, xr.hi, 0, 2);
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
    xTicks(c, f, xr.ticks, v => fmt(v, xr.dec));
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch10.cv.y'), f.R, f.B + 29);
    xr.ticks.forEach(v => { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.X(v), f.T); c.lineTo(f.X(v), f.B - 1); c.stroke(); });
    const bh = Math.min(54, (f.B - f.T) / 3.2), rowY = [f.T + (f.B - f.T) * 0.28, f.T + (f.B - f.T) * 0.72];
    const seg = (row, a, b, col, outline) => { const x = Math.min(f.X(a), f.X(b)), ww = Math.abs(f.X(b) - f.X(a)), y = rowY[row] - bh / 2; if (ww < 0.5) return; if (outline) { c.strokeStyle = col; c.lineWidth = 1.6; c.setLineDash([4, 3]); c.strokeRect(x + 0.8, y + 0.8, ww - 1.6, bh - 1.6); c.setLineDash([]); } else { c.fillStyle = col; c.fillRect(x, y, ww, bh); } };
    seg(0, 0, q.e, C.cyan); seg(0, q.e, q.base, C.violet);
    seg(1, 0, q.y, C.gold); seg(1, q.y, q.y + q.qe, C.green, true); seg(1, q.y + q.qe, q.base, C.red, true);
    c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(t('ch10.cv.base'), f.L - 8, rowY[0]); c.fillText(t('ch10.cv.now'), f.L - 8, rowY[1]);
    vline(c, f, 0, C.mute, []);
  }
  function text() {
    const q = parts(), p = q.p;
    put('#lbLo', t('ch10.unit.years', { v: fmt(p.L, 2) })); put('#lbQo', t('ch10.unit.gdp', { v: fmt(p.qe) }));
    put('#lbY', pctT('ch10.unit.pct', q.y, 2)); put('#lbFG', t('ch10.unit.pp', { v: fmt(q.fg, 2) })); put('#lbQE', t('ch10.unit.pp', { v: fmt(q.qe, 2) }));
    const b30 = M.bond.exactPct(2, 30, q.base, q.y - q.base);
    put('#lbB30', t('ch10.unit.chg', { v: sgn(b30, 1) }));
    const v = { base: fmt(q.base, 2), e: fmt(q.e, 2), tp: fmt(p.tp10, 1), L: fmt(p.L, 2), q: fmt(p.qe), y: fmt(q.y, 2), fg: fmt(q.fg, 2), qe: fmt(q.qe, 2), b30: fmt(b30, 1) };
    const key = p.L === 0 && p.qe === 0 ? 'ch10.say.none' : q.y < 0 ? 'ch10.say.neg' : p.qe === 0 ? 'ch10.say.fg' : p.L === 0 ? 'ch10.say.qe' : 'ch10.say.main';
    putHTML('#lbSay', t(key, v));
  }
  model(cv, draw, text, [sL, sQ, ...radios('lbEst')]);
})();

/* balance sheets (data only) */
(() => {
  const cv = $('#bsCv'), y0 = +D.fedBS.start.slice(0, 4), m0 = +D.fedBS.start.slice(5, 7) - 1;
  const ser = S => S.v.map((v, i) => [+S.start.slice(0, 4) + (+S.start.slice(5, 7) - 1 + i) / 12, v]);
  reg(cv, { draw() {
    const { c, w, h } = fit(cv), a = ser(D.fedBS), b = ser(D.ecbBS), x1 = Math.max(a[a.length - 1][0], b[b.length - 1][0]);
    const f = frame(w, h, [28, 14, 30, 34], y0 + m0 / 12, x1, 0, 10);
    yTicks(c, f, [0, 5, 10], v => fmt(v)); axes(c, f, null, t('ch10.bs.y'));
    const step = w < 480 ? 10 : 5, yrs = []; for (let y = 2010; y <= x1; y += step) yrs.push(y);
    xTicks(c, f, yrs, v => String(v));
    path(c, a, f.X, f.Y, C.cyan, 2); path(c, b, f.X, f.Y, C.gold, 2);
  } });
})();

/* ───────── 11 debt dynamics ───────── */
(() => {
  const cv = $('#dbCv'), sR = $('#dbR'), sG = $('#dbG'), sPb = $('#dbPb'), sM = $('#dbM'), YEARS = 30;
  const P = () => ({ b0: 100, r0: 4, rMkt: +sR.value, g: +sG.value, pb: +sPb.value, m: +sM.value });
  function draw() {
    const { c, w, h } = fit(cv), p = P(), path30 = M.debt.path(p, YEARS);
    const by = nice(Math.min(0, ...path30.map(q => q[1])), Math.max(200, ...path30.map(q => q[1])), 5);
    const f = frame(w, h, [30, 40, 40, 44], 0, YEARS, by.lo, by.hi);
    yTicks(c, f, by.ticks, v => fmt(v, by.dec)); axes(c, f, t('ch11.cv.x'), t('ch11.cv.y')); xTicks(c, f, [0, 10, 20, 30], v => fmt(v));
    hline(c, f, 100, C.mute, [3, 3], 1);
    // rates on a right-hand axis 0–10 %
    const f2 = frame(w, h, [30, 40, 40, 44], 0, YEARS, 0, 10);
    yTicks(c, f2, [0, 5, 10], v => fmt(v), true);
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch11.cv.y2'), f2.R + 34, f2.T - 12);
    path(c, path30.map(q => [q[0], q[2]]), f2.X, f2.Y, C.cyan, 1.8);
    path(c, [[0, p.g], [YEARS, p.g]], f2.X, f2.Y, C.green, 1.8, [5, 5]);
    clipTo(c, f); path(c, path30.map(q => [q[0], q[1]]), f.X, f.Y, C.gold, 2.6); c.restore();
  }
  function text() {
    const p = P(), pt = M.debt.path(p, YEARS), b10 = pt[10][1], b30 = pt[YEARS][1], r30 = pt[YEARS][2], rg = r30 - p.g, stab = M.debt.stabilising(100, r30, p.g);
    put('#dbRo', pctT('ch11.unit.pct', p.rMkt, 2)); put('#dbGo', pctT('ch11.unit.pct', p.g, 2)); put('#dbPbo', t('ch11.unit.pct', { v: sgn(p.pb, 2) })); put('#dbMo', t('ch11.unit.years', { v: p.m }));
    put('#db10', pctT('ch11.unit.pct', b10, 1)); put('#db30', pctT('ch11.unit.pct', b30, 1)); put('#dbRg', t('ch11.unit.pp', { v: sgn(rg, 2) })); put('#dbStab', t('ch11.unit.pct', { v: sgn(stab, 2) }));
    const v = { rg: sgn(rg, 2), pb: sgn(p.pb, 2), b30: fmt(b30, 1), stab: fmt(stab, 2), stabAbs: fmt(Math.abs(stab), 2), pbAbs: fmt(Math.abs(p.pb), 2) };
    const key = b30 > 105 ? (stab > 0.005 ? 'ch11.say.up' : stab < -0.005 ? 'ch11.say.upg' : 'ch11.say.up0') : b30 < 95 ? 'ch11.say.down' : 'ch11.say.flat';
    putHTML('#dbSay', t(key, v));
  }
  model(cv, draw, text, [sR, sG, sPb, sM]);
})();

/* ───────── 12 frontier tables (rendered from the dated block in models.js) ───────── */
(() => {
  const F = M.frontier, U = F.us;
  function text() {
    putHTML('#frP1', t('ch12.p1', { checked: dateText(F.checked) }));
    const rows = F.banks.map(b => {
      const rate = t('ch12.rate.' + b.id, { rate: b.rate, date: dateText(b.rateDate), held: b.held ? dateText(b.held) : '', lpr1: b.lpr1, lpr5: b.lpr5, lprDate: b.lprDate ? dateText(b.lprDate) : '' });
      const infl = b.infl == null ? t('ch12.infl.none') : t('ch12.infl.' + b.id, { v: fmt(b.infl, 1), m: dateText(b.inflMonth) });
      const bs = b.bs == null ? t('ch12.bs.none') : t('ch12.bs.' + b.bsUnit, { v: fmt(b.bs, 2), date: dateText(b.bsDate) });
      return `<tr><td>${t('ch12.bank.' + b.id)}</td><td>${rate}</td><td>${infl}</td><td>${bs}</td></tr>`;
    }).join('');
    putHTML('#frTable', `<table><thead><tr><th>${t('ch12.th.bank')}</th><th>${t('ch12.th.rate')}</th><th>${t('ch12.th.infl')}</th><th>${t('ch12.th.bs')}</th></tr></thead><tbody>${rows}</tbody></table>`);
    const m = [
      ['real', { effr: fmt(U.effr, 2), em: dateText(U.effrMonth), pce: fmt(U.corePce, 1) }, { v: fmt(U.realRate, 1) }],
      ['rstar', { q: dateText(U.rstarQuarter) }, { a: fmt(U.rstarHLW, 1), b: fmt(U.rstarLW, 2), c: fmt(U.sepLongRun - 2, 1) }],
      ['tp', { d: dateText(U.tpDate) }, { v: fmt(U.tpKW, 2) }],
      ['spread', { d: dateText(U.spreadDate) }, { v: sgn(U.spread, 2) }],
      ['gaps', { q: dateText(U.outputGapQuarter) }, { a: fmt(U.corePce - 2, 1), b: fmt(U.outputGap, 1) }],
      ['rg', { q: dateText(U.debtQuarter) }, { r: fmt(U.rEff, 2), g: fmt(U.gNom, 2), v: sgn(U.rEff - U.gNom, 2) }]
    ].map(([k, a, b]) => `<tr><td>${t('ch12.m.' + k, a)}</td><td>${t('ch12.v.' + k, b)}</td><td>${t('ch12.c.' + k)}</td></tr>`).join('');
    putHTML('#frMerit', `<table><thead><tr><th>${t('ch12.th.what')}</th><th>${t('ch12.th.value')}</th><th>${t('ch12.th.ch')}</th></tr></thead><tbody>${m}</tbody></table>`);
  }
  texts.push(text);
})();

/* ───────── loop ───────── */
applyLang();
function tick() {
  for (const s of sims) if (s.vis && s.dirty) { s.draw(); s.dirty = false; }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
