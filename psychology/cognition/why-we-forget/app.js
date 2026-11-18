/* Why we forget: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js;
 * all numbers come from models.js. Every chart here is an exact computation (no running simulation), so a
 * chart redraws only when a control changes, the language changes or it scrolls into view. */
(() => {
'use strict';
const M = window.ForgetModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', faint: '#56607a' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const DAY = M.DAY;

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
// numbers follow the language actually shown (grouping and decimal marks)
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
// a proportion as a percentage with sensible precision
function pct(x) { const v = x * 100; return v >= 10 ? fmt(v, 0) : v >= 0.1 ? fmt(v, 1) : v > 0 ? '<' + fmt(0.1, 1) : '0'; }
// a duration in seconds, in the largest whole unit that reads well
function dur(sec) {
  if (sec < 60) return t('u.sec', { v: fmt(sec) });
  if (sec < 2 * 3600) return t('u.min', { v: fmt(sec / 60) });
  if (sec < 2 * DAY) return t('u.hours', { v: fmt(sec / 3600, sec < 10 * 3600 ? 1 : 0) });
  return t('u.days', { v: fmt(sec / DAY, sec < 10 * DAY ? 1 : 0) });
}
const days = v => t('u.days', { v: fmt(v, v < 10 && Math.abs(v - Math.round(v)) > 0.05 ? 1 : 0) });
const roundNice = x => (x >= 100 ? Math.round(x / 10) * 10 : Math.round(x));

function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  buildTable();
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + on-screen registry ───────── */
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
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

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
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
// x tick labels, dropping any that would collide with the previous one or the axis name
function xTicks(c, f, ticks) {
  c.fillStyle = C.mute; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, lab] of ticks) {
    const px = f.X(x), wd = c.measureText(lab).width;
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 3); c.stroke();
    if (px - wd / 2 < lastR + 6) continue;
    c.fillText(lab, px, f.B + 11); lastR = px + wd / 2;
  }
}
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function ring(c, x, y, col, r = 6) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke(); }
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, y); c.lineTo(f.R, y); c.stroke(); c.setLineDash([]); }

/* ───────── 01 forgetting curve fits ───────── */
(() => {
  const cv = $('#fgCv'), F = M.forgetting, sK = $('#fgK');
  const X0 = Math.log10(10 * 60), X1 = Math.log10(60 * DAY);
  let pExact = null; // set by "best fit" or a dataset/family switch; cleared when the slider moves
  const key = () => radioVal('fgData'), fam = () => radioVal('fgFam');
  const toP = v => { const [lo, hi] = F.RANGE[fam()]; return Math.exp(Math.log(lo) + (Math.log(hi) - Math.log(lo)) * v / 1000); };
  const toV = p => { const [lo, hi] = F.RANGE[fam()]; return Math.round(1000 * (Math.log(p) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))); };
  const cur = () => F.evaluate(key(), fam(), pExact != null ? pExact : toP(+sK.value));
  function bestFit() { const b = F.fit(key(), fam()); pExact = b.p; sK.value = toV(b.p); }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], X0, X1, 0, 0.7), d = F.DATA[key()], e = cur();
      yTicks(c, f, [0, 0.2, 0.4, 0.6], v => fmt(v * 100) + '%');
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      xTicks(c, f, [[20 * 60, 't20m'], [3600, 't1h'], [9 * 3600, 't9h'], [DAY, 't1d'], [6 * DAY, 't6d'], [31 * DAY, 't31d']].map(([s, k]) => [Math.log10(s), t('ch1.cv.' + k)]));
      const pts = []; for (let i = 0; i <= 160; i++) { const lx = X0 + (X1 - X0) * i / 160; pts.push([lx, Math.min(0.72, e.at(Math.pow(10, lx)))]); }
      c.save(); c.beginPath(); c.rect(f.L, f.T - 4, f.R - f.L, f.B - f.T + 4); c.clip();
      // residuals
      c.strokeStyle = 'rgba(240,122,109,.75)'; c.lineWidth = 1.5;
      d.t.forEach((tt, i) => { const x = f.X(Math.log10(tt)); c.beginPath(); c.moveTo(x, f.Y(d.q[i])); c.lineTo(x, f.Y(Math.min(0.72, e.at(tt)))); c.stroke(); });
      path(c, pts, f.X, f.Y, C.gold);
      c.restore();
      d.t.forEach((tt, i) => dot(c, f.X(Math.log10(tt)), f.Y(d.q[i]), C.ink, 4.5));
    }
  });
  function text() {
    const e = cur(), b = F.fit(key(), fam()), bE = F.fit(key(), 'exp'), bP = F.fit(key(), 'pow'), d = F.DATA[key()];
    put('#fgKo', fam() === 'exp' ? t('ch1.unit.half', { v: dur(M.LN2 / e.p) }) : t('ch1.unit.a', { v: fmt(e.p, 3) }));
    put('#fgSsd', fmt(e.ssd, 4)); put('#fgBest', fmt(b.ssd, 4));
    put('#fgFirst', pct(e.at(d.t[0])) + '% / ' + pct(d.q[0]) + '%');
    put('#fgLast', pct(e.at(d.t[6])) + '% / ' + pct(d.q[6]) + '%');
    const ratio = bE.ssd / bP.ssd, atBest = Math.round(e.ssd / b.ssd * 10) <= 10; // "at best" exactly when the shown multiple would read 1.0
    let k;
    if (!atBest) k = 'ch1.say.off'; else if (fam() === 'pow') k = 'ch1.say.powbest'; else k = ratio < 2 ? 'ch1.say.expclose' : 'ch1.say.expbest';
    putHTML('#fgSay', t(k, { ssd: fmt(e.ssd, 4), best: fmt(b.ssd, 4), x: fmt(e.ssd / b.ssd, 1), pbest: fmt(bP.ssd, 4), ratio: fmt(ratio, ratio < 10 ? 1 : 0),
      f1: pct(e.at(d.t[0])) + '%', d1: pct(d.q[0]) + '%', dlast: pct(d.q[6]) + '%', mu: fmt(e.mu, 2), a: fmt(e.p, 3) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sK.addEventListener('input', () => { pExact = null; redo(); });
  radios('fgData').concat(radios('fgFam')).forEach(r => r.addEventListener('change', () => { bestFit(); redo(); }));
  $('#fgFit').addEventListener('click', () => { bestFit(); redo(); });
  bestFit(); text();
})();

/* ───────── 02 mixture of exponentials ───────── */
(() => {
  const cv = $('#mxCv'), X = M.mixture, sH = $('#mxH'), sV = $('#mxV'), N = 24, SPAN = 30;
  let seed = 3;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], 0, SPAN, 0, 1), hl = +sH.value, cvv = +sV.value;
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100) + '%');
      axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
      xTicks(c, f, [0, 5, 10, 15, 20, 25, 30].map(v => [v, fmt(v)]));
      const rates = X.sampleRates(N, hl, cvv, seed);
      for (const k of rates) { const pts = []; for (let i = 0; i <= 120; i++) { const x = SPAN * i / 120; pts.push([x, Math.exp(-k * x)]); } path(c, pts, f.X, f.Y, C.faint, 1); }
      const sp = [], mp = []; for (let i = 0; i <= 240; i++) { const x = SPAN * i / 240; sp.push([x, X.single(x, hl)]); mp.push([x, X.mean(x, hl, cvv)]); }
      path(c, sp, f.X, f.Y, C.cyan, 1.8, [6, 4]);
      path(c, mp, f.X, f.Y, C.gold, 3);
    }
  });
  function text() {
    const hl = +sH.value, cvv = +sV.value;
    put('#mxHo', t('ch2.unit.days', { v: fmt(hl, 2) })); put('#mxVo', fmt(cvv, 1));
    put('#mx1', pct(X.mean(1, hl, cvv)) + '%'); put('#mx7', pct(X.mean(7, hl, cvv)) + '%'); put('#mx30', pct(X.mean(30, hl, cvv)) + '%'); put('#mxS', pct(X.single(30, hl)) + '%');
    const key = cvv < 0.05 ? 'ch2.say.none' : cvv >= 2.5 ? 'ch2.say.wide' : 'ch2.say.some';
    putHTML('#mxSay', t(key, { h: fmt(hl, 2), m30: pct(X.mean(30, hl, cvv)) + '%', s30: pct(X.single(30, hl)) + '%', alpha: fmt(1 / (cvv * cvv || 1), 2) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sH, sV].forEach(e => e.addEventListener('input', redo));
  $('#mxSeed').addEventListener('click', () => { seed++; redo(); });
  text();
})();

/* ───────── 03 ACT-R spacing ───────── */
(() => {
  const cv = $('#arCv'), cv2 = $('#arCv2'), A = M.actr, sN = $('#arN'), sR = $('#arRi'), SPAN = 60, NOW = 300;
  const st = () => ({ n: +sN.value, gi: +radioVal('arGap'), ri: +sR.value });
  const r2 = x => Math.round(x * 100);
  const gapName = i => t('ch3.gap.' + ['30', '600', '1d', '2d', '4d', '7d', '14d', '30d'][i]);
  const sim = reg([cv, cv2], {
    draw() {
      const S = st(), yours = A.schedule(S.n, A.GAPS[S.gi]), massed = A.schedule(S.n, A.GAPS[0]);
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], -6, SPAN, 0, 1);
        yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2));
        axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
        xTicks(c, f, [[-3, t('ch3.cv.now')], [1, fmt(1)], [10, fmt(10)], [20, fmt(20)], [30, fmt(30)], [40, fmt(40)], [50, fmt(50)], [60, fmt(60)]]);
        c.strokeStyle = C.line; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(f.X(-0.5), f.T); c.lineTo(f.X(-0.5), f.B); c.stroke(); c.setLineDash([]);
        const curve = sch => { const p = []; for (let i = 0; i <= 200; i++) { const x = 1 + (SPAN - 1) * i / 200; p.push([x, sch.recallAfter(x * DAY)]); } return p; };
        vline(c, f, f.X(S.ri), C.mute, [3, 3]);
        path(c, curve(massed), f.X, f.Y, C.cyan);
        path(c, curve(yours), f.X, f.Y, C.gold);
        dot(c, f.X(-3) - 7, f.Y(massed.recallAfter(NOW)), C.cyan); dot(c, f.X(-3) + 7, f.Y(yours.recallAfter(NOW)), C.gold);
        dot(c, f.X(S.ri), f.Y(massed.recallAfter(S.ri * DAY)), C.cyan); dot(c, f.X(S.ri), f.Y(yours.recallAfter(S.ri * DAY)), C.gold); }
      { const r0 = cv2.getBoundingClientRect(), d0 = cv2.getContext('2d'); d0.font = FONT;
        const wid = Math.max(...A.GAPS.map((g, i) => d0.measureText(t('ch3.gapS.' + i)).width));
        // when the gap names do not fit side by side, stagger them over two lines
        const stagger = wid + 6 > (r0.width - 58) / A.GAPS.length;
        const { c, w, h } = fit(cv2), f = frame(w, h, [26, 14, stagger ? 40 : 28, 44], 0, A.GAPS.length, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, '', t('ch3.cv2.y'));
        const ps = A.GAPS.map(g => A.recall(S.n, g, S.ri * DAY)), best = ps.indexOf(Math.max(...ps)), slot = (f.R - f.L) / ps.length;
        c.textAlign = 'center';
        ps.forEach((p, i) => {
          const x0 = f.L + slot * i + slot * 0.18, bw = slot * 0.64;
          c.fillStyle = i === S.gi ? C.gold : i === 0 ? C.cyan : '#3a4254'; c.fillRect(x0, f.Y(p), bw, f.B - f.Y(p));
          if (i === best) ring(c, x0 + bw / 2, f.Y(p) - 9, C.green, 4);
          c.fillStyle = i === S.gi ? C.gold : C.mute; c.fillText(t('ch3.gapS.' + i), x0 + bw / 2, f.B + 12 + (stagger && i % 2 ? 13 : 0));
        }); }
    }
  });
  function text() {
    const S = st(), g = A.GAPS[S.gi], ri = S.ri * DAY;
    put('#arNo', t('ch3.unit.times', { v: fmt(S.n) })); put('#arRio', S.ri === 1 ? t('ch3.unit.day1') : t('ch3.unit.days', { v: fmt(S.ri) }));
    const p = A.recall(S.n, g, ri), m = A.recall(S.n, A.GAPS[0], ri), now = A.recall(S.n, g, NOW), mnow = A.recall(S.n, A.GAPS[0], NOW), b = A.bestGap(S.n, ri), bi = A.GAPS.indexOf(b.gap);
    put('#arP', fmt(p, 2)); put('#arM', fmt(m, 2)); put('#arNow', fmt(now, 2) + ' / ' + fmt(mnow, 2)); put('#arBest', gapName(bi));
    let key;
    if (S.gi === 0) key = 'ch3.say.massed';
    // compare the numbers as shown (two decimals), so a sentence never says "0.31 vs 0.31, better"
    else if (r2(p) === r2(m)) key = 'ch3.say.tie';
    else if (r2(p) < r2(m)) key = 'ch3.say.worse';
    else if (r2(now) < r2(mnow)) key = bi === S.gi ? 'ch3.say.crossbest' : 'ch3.say.cross';
    else if (r2(now) === r2(mnow)) key = 'ch3.say.same5';
    else key = 'ch3.say.both';
    putHTML('#arSay', t(key, { p: fmt(p, 2), m: fmt(m, 2), now: fmt(now, 2), mnow: fmt(mnow, 2), ri: fmt(S.ri), best: gapName(bi), bp: fmt(b.p, 2), gap: gapName(S.gi) }));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sN, sR].forEach(e => e.addEventListener('input', redo)); radios('arGap').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 04 Cepeda et al. 2008 ───────── */
(() => {
  const cv = $('#cpCv'), cv2 = $('#cpCv2'), Cp = M.cepeda, A = M.actr;
  // ridgelines are fixed: compute once
  const surf = [], actrR = [];
  for (let i = 0; i <= 48; i++) { const ri = 5 * Math.pow(100, i / 48); surf.push([ri, Cp.surfaceOptimum(ri)]); }
  for (let i = 0; i <= 16; i++) { const ri = 5 * Math.pow(100, i / 16); actrR.push([ri, A.cepedaOptimum(ri)]); }
  const actrAt = {}; Cp.RI.forEach(ri => { actrAt[ri] = A.cepedaOptimum(ri); });
  const L = Math.log10;
  const sim = reg([cv, cv2], {
    draw() {
      const sel = +radioVal('cpRi');
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], 0, 105, 0, 1);
        yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100) + '%');
        axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
        xTicks(c, f, [0, 20, 40, 60, 80, 100].map(v => [v, fmt(v)]));
        for (const ri of Cp.RI) if (ri !== sel) { const p = Cp.POINTS[ri]; path(c, p, f.X, f.Y, C.faint, 1.2); p.forEach(q => dot(c, f.X(q[0]), f.Y(q[1]), C.faint, 3)); }
        vline(c, f, f.X(Cp.SPLINE[sel]), C.gold);
        const p = Cp.POINTS[sel]; path(c, p, f.X, f.Y, C.gold, 1.8);
        p.forEach(q => dot(c, f.X(q[0]), f.Y(q[1]), C.gold, 4.5));
        const b = Cp.bestPoint(sel); ring(c, f.X(b[0]), f.Y(b[1]), C.ink, 8); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [30, 14, 40, 44], L(5), L(500), L(0.5), L(400));
        const yt = [1, 10, 100], xt = [7, 35, 70, 350];
        yTicks(c, f, yt.map(L), v => fmt(Math.pow(10, v)));
        axes(c, f, t('ch4.cv2.x'), t('ch4.cv2.y'));
        xTicks(c, f, xt.map(v => [L(v), fmt(v)]));
        c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
        // reference lines: gap = 50 % and 10 % of the retention interval
        for (const [r, k] of [[0.5, 'ch4.cv2.half'], [0.1, 'ch4.cv2.tenth']]) {
          path(c, [[L(5), L(5 * r)], [L(500), L(500 * r)]], f.X, f.Y, '#3a4254', 1, [2, 4]);
          // label sits just above its line, right-aligned at an anchor RI, but never past the plot's left edge
          const ra = r > 0.3 ? 30 : 400, lab = t(k), wd = c.measureText(lab).width;
          const px = Math.max(f.L + 4 + wd, f.X(L(ra)) - 4), y = f.Y(L(ra * r)) - 10;
          c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(lab, px, y);
        }
        path(c, surf.map(q => [L(q[0]), L(q[1])]), f.X, f.Y, C.cyan, 2);
        path(c, actrR.map(q => [L(q[0]), L(q[1])]), f.X, f.Y, C.violet, 2, [6, 4]);
        c.restore();
        for (const ri of Cp.RI) {
          const big = ri === sel;
          ring(c, f.X(L(ri)), f.Y(L(Cp.TESTED_BEST[ri])), C.ink, big ? 7 : 5);
          dot(c, f.X(L(ri)), f.Y(L(Cp.SPLINE[ri])), C.gold, big ? 6 : 4);
        } }
    }
  });
  function text() {
    const ri = +radioVal('cpRi'), a = actrAt[ri];
    put('#cpTested', t('ch4.unit.days', { v: fmt(Cp.TESTED_BEST[ri]) }));
    put('#cpSpline', t('ch4.unit.pct', { v: fmt(Cp.SPLINE[ri]), p: fmt(Cp.SPLINE_PCT[ri]) }));
    put('#cpGain', t('ch4.unit.gain', { v: fmt(Cp.GAIN[ri]) }));
    put('#cpActr', t('ch4.unit.pct', { v: fmt(a, a < 10 ? 1 : 0), p: fmt(a / ri * 100) }));
    putHTML('#cpSay', t('ch4.say.ri', { ri: fmt(ri), tested: fmt(Cp.TESTED_BEST[ri]), spline: fmt(Cp.SPLINE[ri]), pct: fmt(Cp.SPLINE_PCT[ri]), gain: fmt(Cp.GAIN[ri]), actr: fmt(a, a < 10 ? 1 : 0), apct: fmt(a / ri * 100) }));
  }
  sim.text = text;
  radios('cpRi').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 05 one card under FSRS-6 ───────── */
(() => {
  const cv = $('#fsCv'), S = M.fsrs, sR = $('#fsR'), SPAN = 365;
  const sim = reg(cv, {
    draw() {
      const r = +sR.value, p = S.path(r, SPAN), { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], 0, SPAN, 0.6, 1);
      yTicks(c, f, [0.6, 0.7, 0.8, 0.9, 1], v => fmt(v * 100) + '%');
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      xTicks(c, f, [0, 60, 120, 180, 240, 300, 365].map(v => [v, fmt(v)]));
      hline(c, f, f.Y(r), C.gold);
      const pts = [];
      for (let i = 0; i < p.length; i++) {
        const t0 = p[i].t, t1 = i + 1 < p.length ? p[i + 1].t : SPAN;
        for (let k = 0; k <= 40; k++) { const x = t0 + (t1 - t0) * k / 40; pts.push([x, S.R(x - t0, p[i].S)]); }
      }
      path(c, pts, f.X, f.Y, C.cyan);
      for (let i = 1; i < p.length; i++) dot(c, f.X(p[i].t), f.Y(S.R(p[i].ivl, p[i - 1].S)), C.gold);
    }
  });
  function text() {
    const r = +sR.value, p = S.path(r, SPAN), n = p.length - 1;
    put('#fsRo', fmt(r * 100) + '%');
    put('#fsN', t('ch5.unit.times', { v: fmt(n) }));
    put('#fsFirst', n ? t('ch5.unit.days', { v: fmt(p[1].ivl) }) : '—');
    put('#fsLast', n ? t('ch5.unit.days', { v: fmt(p[n].ivl) }) : '—');
    put('#fsS', t('ch5.unit.days', { v: fmt(p[n].S, p[n].S < 10 ? 1 : 0) }));
    const list = p.slice(1).map(q => fmt(q.t)).join(t('common.listsep'));
    // across the whole slider range (70–99 %) a year holds at least two reviews and the gaps only grow (pinned in tests/models.cjs)
    putHTML('#fsSay', t('ch5.say.some', { r: fmt(r * 100), days: list, n: fmt(n), first: n ? fmt(p[1].ivl) : '—', last: n ? fmt(p[n].ivl) : '—' }));
  }
  sim.text = text;
  sR.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 06 workload under FSRS-6 ───────── */
(() => {
  const cv = $('#wkCv'), S = M.fsrs, sN = $('#wkN'), sR = $('#wkR'), DAYS = 1095;
  const cache = new Map();
  function run(n, r) {
    const k = n + '|' + r.toFixed(2);
    if (!cache.has(k)) {
      const s = S.simulate({ perDay: n, r, days: DAYS });
      const avg = (a, end, wnd) => { let x = 0; for (let i = end - wnd; i < end; i++) x += a[i]; return x / wnd; };
      const smooth = []; for (let d = 7; d <= DAYS; d += 3) smooth.push([d / 365, avg(s.reviews, d, 7)]);
      let tot1 = 0; for (let i = 0; i < 365; i++) tot1 += s.reviews[i];
      cache.set(k, { y1: avg(s.reviews, 365, 30), y3: avg(s.reviews, DAYS, 30), tot1, known: s.known / s.cards, smooth });
      if (cache.size > 40) cache.delete(cache.keys().next().value);
    }
    return cache.get(k);
  }
  const P = () => ({ n: +sN.value, r: Math.round(+sR.value * 100) / 100 });
  const sim = reg(cv, {
    draw() {
      const { n, r } = P(), now = run(n, r), base = run(n, 0.9), { c, w, h } = fit(cv);
      const top = Math.max(...now.smooth.map(q => q[1]), ...base.smooth.map(q => q[1])), step = top > 1500 ? 500 : top > 600 ? 200 : top > 250 ? 100 : top > 100 ? 50 : 20;
      const yMax = Math.ceil(top * 1.08 / step) * step, f = frame(w, h, [30, 14, 40, 48], 0, 3, 0, yMax);
      const ys = []; for (let v = 0; v <= yMax + 1e-9; v += step) ys.push(v);
      yTicks(c, f, ys, v => fmt(v)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [0, 1, 2, 3].map(v => [v, fmt(v)]));
      if (r !== 0.9) path(c, base.smooth, f.X, f.Y, C.mute, 1.4, [5, 4]);
      path(c, now.smooth, f.X, f.Y, C.gold, 2);
    }
  });
  function text() {
    const { n, r } = P(), now = run(n, r), base = run(n, 0.9);
    put('#wkNo', t('ch6.unit.cards', { v: fmt(n) })); put('#wkRo', fmt(r * 100) + '%');
    put('#wkY1', t('ch6.unit.per', { v: fmt(roundNice(now.y1)) })); put('#wkY3', t('ch6.unit.per', { v: fmt(roundNice(now.y3)) }));
    put('#wkTot', t('ch6.unit.total', { v: fmt(now.tot1) })); put('#wkKnown', t('ch6.unit.pct', { v: fmt(now.known * 100) }));
    const x1 = Math.round(now.y1 / base.y1 * 10) / 10;
    const key = r === 0.9 ? 'ch6.say.base' : (x1 >= 0.9 && x1 <= 1.1) ? 'ch6.say.near' : r > 0.9 ? 'ch6.say.up' : 'ch6.say.down';
    putHTML('#wkSay', t(key, { n: fmt(n), r: fmt(r * 100), y1: fmt(roundNice(now.y1)), y3: fmt(roundNice(now.y3)), x: fmt(x1, 1), yb: fmt(roundNice(base.y1)), known: fmt(now.known * 100), kb: fmt(base.known * 100) }));
  }
  sim.text = text;
  [sN, sR].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 07 Roediger & Karpicke 2006 (data) ───────── */
(() => {
  const cv = $('#rkCv'), R = M.rk, d2 = $('#rkD2');
  const COLS = [C.cyan, C.gold, C.violet];
  function series() {
    if (radioVal('rkExp') === '1') return [{ k: 'SS', v: R.exp1.SS, x: [0, 1, 2] }, { k: 'ST', v: R.exp1.ST, x: [0, 1, 2] }];
    return R.exp2.conds.map((k, i) => ({ k, v: [R.exp2.m5[i], R.exp2.w1[i]], x: [0, 2] }));
  }
  function syncDelay() {
    const e2 = radioVal('rkExp') === '2';
    d2.hidden = e2;
    if (e2 && radioVal('rkDelay') === '1') radios('rkDelay').find(r => r.value === '2').checked = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 20, 40, 44], -0.3, 2.3, 0.3, 0.9), sel = +radioVal('rkDelay');
      c.fillStyle = 'rgba(233,185,73,.08)'; c.fillRect(f.X(sel - 0.28), f.T, f.X(sel + 0.28) - f.X(sel - 0.28), f.B - f.T);
      yTicks(c, f, [0.3, 0.5, 0.7, 0.9], v => fmt(v * 100) + '%'); axes(c, f, '', t('ch7.cv.y'));
      xTicks(c, f, [[0, t('ch7.delay.5min')], [1, t('ch7.delay.2d')], [2, t('ch7.delay.1w')]]);
      series().forEach((s, i) => { const pts = s.x.map((x, j) => [x, s.v[j]]); path(c, pts, f.X, f.Y, COLS[i], 2.2); pts.forEach(q => dot(c, f.X(q[0]), f.Y(q[1]), COLS[i], 4.5)); });
    }
  });
  function text() {
    syncDelay();
    const e1 = radioVal('rkExp') === '1', sel = +radioVal('rkDelay'), ss = series();
    $('#rkLeg').innerHTML = ss.map((s, i) => `<span><i style="background:${COLS[i]}"></i>${t('ch7.cond.' + s.k)}</span>`).join('');
    const at = s => s.v[s.x.indexOf(sel)];
    ['A', 'B', 'C'].forEach((id, i) => { const s = ss[i]; $('#rkCbox').hidden = ss.length < 3; if (!s) return; put('#rk' + id, t('ch7.unit.pct', { v: fmt(at(s) * 100) })); put('#rk' + id + 'l', t('ch7.cond.' + s.k)); });
    const diff = (at(ss[ss.length - 1]) - at(ss[0])) * 100;
    put('#rkDiff', t('ch7.unit.pp', { v: (diff > 0 ? '+' : diff < 0 ? '−' : '') + fmt(Math.abs(diff)) }));
    let key, v;
    if (e1) { key = ['ch7.say.e1.5min', 'ch7.say.e1.2d', 'ch7.say.e1.1w'][sel]; v = { ss: fmt(R.exp1.SS[sel] * 100), st: fmt(R.exp1.ST[sel] * 100), diff: fmt(Math.abs(diff)), ss2: fmt(R.exp1.SS[1] * 100) }; }
    else { const arr = sel === 0 ? R.exp2.m5 : R.exp2.w1; key = sel === 0 ? 'ch7.say.e2.5min' : 'ch7.say.e2.1w'; v = { a: fmt(arr[0] * 100), b: fmt(arr[1] * 100), c: fmt(arr[2] * 100), ra: fmt(R.exp2.reads[0], 1), rc: fmt(R.exp2.reads[2], 1) }; }
    putHTML('#rkSay', t(key, v));
  }
  sim.text = text;
  radios('rkExp').concat(radios('rkDelay')).forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 08 judgments vs outcomes (data) ───────── */
(() => {
  const cv = $('#jlCv'), R = M.rk, K = M.kb, COLS = [C.cyan, C.gold, C.violet];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (radioVal('jlStudy') === 'rk') {
        // slope chart: predicted (1–7) on the left, one-week recall on the right
        const T = 44, B = h - 26, xl = Math.max(70, w * 0.22), xr = w - Math.max(70, w * 0.22);
        const yl = v => B - (B - T) * (v - 3.6) / (5.0 - 3.6), yr = v => B - (B - T) * (v - 0.30) / (0.70 - 0.30);
        c.strokeStyle = C.line; c.lineWidth = 1; [xl, xr].forEach(x => { c.beginPath(); c.moveTo(x, T - 6); c.lineTo(x, B + 6); c.stroke(); });
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch8.cv.pred'), 8, 16); c.textAlign = 'right'; c.fillText(t('ch8.cv.act'), w - 8, 16);
        R.exp2.conds.forEach((k, i) => {
          const a = yl(R.exp2.jol[i]), b = yr(R.exp2.w1[i]);
          c.strokeStyle = COLS[i]; c.lineWidth = 2.2; c.beginPath(); c.moveTo(xl, a); c.lineTo(xr, b); c.stroke();
          dot(c, xl, a, COLS[i]); dot(c, xr, b, COLS[i]);
          c.fillStyle = COLS[i]; c.textAlign = 'right'; c.fillText(fmt(R.exp2.jol[i], 1), xl - 10, a);
          c.textAlign = 'left'; c.fillText(fmt(R.exp2.w1[i] * 100) + '%', xr + 10, b);
        });
        // condition names under the chart, one per column
        c.textAlign = 'center'; const third = w / 3;
        R.exp2.conds.forEach((k, i) => { c.fillStyle = COLS[i]; c.fillText(t('ch7.cond.' + k), third * (i + 0.5), h - 10); });
      } else {
        // four horizontal bars, each with its own label line
        const rows = [[t('ch8.cv.spaced'), K.exp1a.spaced, C.gold], [t('ch8.cv.massed'), K.exp1a.massed, C.cyan], [t('ch8.cv.betterSpaced'), K.exp1a.betterSpaced / 100, C.gold], [t('ch8.cv.judgedMassed'), K.exp1a.judgedMassedOK / 100, C.cyan]];
        const L = 12, Rr = w - 56, rowH = (h - 16) / 4;
        rows.forEach(([lab, v, col], i) => {
          const y0 = 10 + rowH * i;
          c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(lab, L, y0 + 10);
          c.fillStyle = '#232a38'; c.fillRect(L, y0 + 22, Rr - L, 16);
          c.fillStyle = col; c.fillRect(L, y0 + 22, (Rr - L) * v, 16);
          c.fillStyle = C.ink; c.fillText(i < 2 ? fmt(v, 2) : fmt(v * 100) + '%', Rr + 8, y0 + 30);
        });
      }
    }
  });
  function text() {
    if (radioVal('jlStudy') === 'rk') putHTML('#jlSay', t('ch8.say.rk', { j1: fmt(R.exp2.jol[0], 1), j3: fmt(R.exp2.jol[2], 1), a1: fmt(R.exp2.w1[0] * 100), a3: fmt(R.exp2.w1[2] * 100) }));
    else putHTML('#jlSay', t('ch8.say.kb', { s: fmt(K.exp1a.spaced, 2), m: fmt(K.exp1a.massed, 2), bs: fmt(K.exp1a.betterSpaced), jm: fmt(K.exp1a.judgedMassedOK) }));
  }
  sim.text = text;
  radios('jlStudy').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 09 robustness table ───────── */
function buildTable() {
  const tb = $('#robRows'); if (!tb) return;
  const hd = ['finding', 'evidence', 'size', 'conf'].map(k => t('ch9.t.' + k) + t('common.colon'));
  let html = '';
  for (let i = 1; i <= 8; i++) html += '<tr>' + ['f', 'e', 's', 'c'].map((k, j) => `<td data-h="${hd[j]}">${t('ch9.r' + i + '.' + k)}</td>`).join('') + '</tr>';
  tb.innerHTML = html;
}

/* ───────── loop: draw only what is on screen and has changed ───────── */
applyLang();
function tick() {
  for (const s of sims) if (s.vis && s.dirty) { s.draw(); s.dirty = false; }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
