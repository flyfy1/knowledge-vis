/* Why a few firms win: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.FirmModels;
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
const effLang = () => (COPY[lang] ? lang : 'zh');
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmtThr(x) { return fmt(x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 1); }
function fmt(x, d = 0) {
  if (x == null || !isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(effLang() === 'zh' ? 'zh-CN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const pct = (x, d = 0) => fmt(x * 100, d);
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  buildTables();
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radioVal = name => document.querySelector(`input[name=${name}]:checked`).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
// live sentence: records which template is showing (data-key) so the browser test can check every branch
const say = (sel, key, vars, pending) => { $(sel).dataset.key = pending ? 'pending' : key; putHTML(sel, pending ? '…' : t(key, vars)); };
const onInput = (ids, fn) => ids.forEach(id => { const e = $(id); e.addEventListener('input', fn); e.addEventListener('change', fn); });
const onRadio = (name, fn) => document.querySelectorAll(`input[name=${name}]`).forEach(r => r.addEventListener('change', fn));

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function poly(c, pts, X, Y, fill) { c.fillStyle = fill; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.closePath(); c.fill(); }
// replay clock: model time on real dt; jumps to the end under reduced motion
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; }, done() { return this.t >= this.until - 1e-9; } }; }

/* ───────── 01 monopoly ───────── */
(() => {
  const cv = $('#moCv'), Mo = M.monopoly, sE = $('#moE');
  const st = () => ({ e: +sE.value, mode: radioVal('moMode') });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), { e, mode } = st(), r = Mo.solve(e, mode), PMAX = 60, QMAX = 140;
      const f = frame(w, h, [30, 14, 40, 40], 0, QMAX, 0, PMAX);
      const X = f.X, Y = q => f.Y(Math.min(PMAX, q));
      const qLo = Mo.Q(PMAX, e);
      const dem = []; for (let q = Math.max(0.2, qLo); q <= QMAX; q += 0.5) dem.push([q, Mo.P(q, e)]);
      // areas
      if (mode === 'pd') {
        const a = [[0, PMAX], ...dem.filter(p => p[0] <= Mo.Q0), [Mo.Q0, Mo.c], [0, Mo.c]];
        poly(c, a, X, Y, 'rgba(233,185,73,.4)');
      } else {
        const csPts = [[0, PMAX], ...dem.filter(p => p[0] <= r.q), [r.q, r.p], [0, r.p]];
        poly(c, csPts, X, Y, 'rgba(99,199,230,.3)');
        poly(c, [[0, r.p], [r.q, r.p], [r.q, Mo.c], [0, Mo.c]], X, Y, 'rgba(233,185,73,.4)');
        poly(c, [[r.q, r.p], ...dem.filter(p => p[0] > r.q && p[0] <= Mo.Q0), [Mo.Q0, Mo.c], [r.q, Mo.c]], X, Y, 'rgba(240,122,109,.45)');
      }
      yTicks(c, f, [0, 10, 20, 30, 40, 50, 60], v => fmt(v));
      xTicks(c, f, [0, 25, 50, 75, 100, 125], v => fmt(v));
      axes(c, f, t('ch1.cv.q'), t('ch1.cv.p'));
      hline(c, f, Mo.c, C.gold);
      if (mode !== 'pd') { const mr = dem.map(p => [p[0], Mo.MR(p[0], e)]); path(c, mr, X, Y, C.violet, 1.6, [6, 4]); }
      path(c, dem, X, Y, C.cyan);
      if (mode !== 'pd') { dot(c, X(r.q), Y(r.p), C.gold); }
      else dot(c, X(Mo.Q0), Y(Mo.c), C.gold);
    },
    text() {
      const { e, mode } = st(), r = Mo.solve(e, mode);
      put('#moEo', fmt(e, 2));
      if (mode === 'pd') {
        put('#moP', t('ch1.unit.none')); put('#moL', t('ch1.unit.none')); put('#moQ', fmt(Mo.Q0)); put('#moDwl', t('ch1.unit.pct', { v: '0' }));
        say('#ch1Say', 'ch1.say.pd');
      } else {
        put('#moP', fmt(r.p, 2)); put('#moL', fmt(r.lerner, 3)); put('#moQ', fmt(r.q, 1)); put('#moDwl', t('ch1.unit.pct', { v: pct(r.dwl / r.total, 1) }));
        say('#ch1Say', e < 1.5 ? 'ch1.say.steep' : 'ch1.say.one', { eps: fmt(e, 2), p: fmt(r.p, 2), x: fmt(r.p / Mo.c, 2), l: fmt(r.lerner, 3), q: fmt(r.q, 1), gap: fmt(Mo.Q0 - r.q, 1) });
      }
    }
  });
  const redo = () => { sim.dirty = true; sim.text(); };
  onInput(['#moE'], redo); onRadio('moMode', redo); sim.text();
})();

/* ───────── 02 cost structure ───────── */
(() => {
  const cv = $('#coCv'), Co = M.cost, sF = $('#coF'), sS = $('#coS'), D = 1e-4;
  const st = () => ({ F: Math.pow(10, +sF.value), S: Math.pow(10, +sS.value), d: radioVal('coD') === '1' ? D : 0 });
  const big = v => v >= 1e4 ? fmt(Math.round(v / Math.pow(10, Math.floor(Math.log10(v)) - 1)) * Math.pow(10, Math.floor(Math.log10(v)) - 1)) : fmt(v);
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), { F, S, d } = st(), split = h * 0.55;
      // top: AC(q) on a log axis from 10² to 10⁸
      const lx0 = 2, lx1 = 8, ymax = 160;
      const f = frame(w, split, [26, 14, 34, 44], lx0, lx1, 0, ymax), Y = v => f.Y(Math.min(ymax * 3, v));
      yTicks(c, f, [0, 40, 80, 120, 160], v => fmt(v));
      xTicks(c, f, [2, 3, 4, 5, 6, 7, 8], v => '10' + '⁰¹²³⁴⁵⁶⁷⁸'[v], false);
      axes(c, f, '', t('ch2.cv.ac'));
      const pts = []; for (let lq = lx0; lq <= lx1 + 1e-9; lq += 0.02) pts.push([lq, Co.ac(Math.pow(10, lq), F, d)]);
      c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 2); c.clip(); path(c, pts, f.X, Y, C.cyan); c.restore();
      const mes = Co.mes(F, d);
      if (isFinite(mes) && Math.log10(mes) <= lx1) vline(c, f, Math.log10(mes), C.gold);
      vline(c, f, Math.log10(S), C.red);
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch2.cv.q'), f.R, split - 8);
      // bottom: unit cost with k equal firms
      const K = 12, kb = Co.bestK(S, F, d), vals = []; for (let k = 1; k <= K; k++) vals.push(Co.unitCostWithK(k, S, F, d));
      const vmax = Math.min(Math.max(...vals), 6 * Math.min(...vals));
      const g = frame(w, h, [split + 24, 14, 38, 44], 0.5, K + 0.5, 0, vmax * 1.08);
      const ticks = [0, vmax / 2, vmax].map(v => Math.round(v));
      yTicks(c, g, ticks, v => fmt(v)); axes(c, g, t('ch2.cv.k'), t('ch2.cv.u'));
      xTicks(c, g, [1, 2, 4, 6, 8, 10, 12], v => fmt(v), false);
      const bw = Math.max(4, (g.R - g.L) / K * 0.6);
      for (let k = 1; k <= K; k++) {
        const v = vals[k - 1], top = g.Y(Math.min(v, vmax * 1.08));
        c.fillStyle = k === kb ? C.gold : 'rgba(179,157,251,.55)'; c.fillRect(g.X(k) - bw / 2, top, bw, g.B - top);
      }
    },
    text() {
      const { F, S, d } = st(), mes = Co.mes(F, d), k = Co.bestK(S, F, d);
      put('#coFo', big(F)); put('#coSo', big(S));
      put('#coMes', isFinite(mes) ? big(mes) : t('ch2.unit.inf')); put('#coAc', fmt(Co.acMin(F, d), 1));
      put('#coK', t('ch2.unit.k', { v: fmt(k) })); put('#coPen', t('ch2.unit.pct', { v: fmt(100 * Co.penaltyOfOne(S, F, d)) }));
      const v = { mes: isFinite(mes) ? big(mes) : '', s: big(S), k: fmt(k), pen: fmt(100 * Co.penaltyOfOne(S, F, d)), pen2: fmt(100 * Co.penaltyOfTwo(S, F, d)) };
      const key = d === 0 ? 'ch2.say.nod' : k === 1 ? 'ch2.say.natural' : k <= 3 ? 'ch2.say.few' : 'ch2.say.many';
      say('#ch2Say', key, v);
    }
  });
  const redo = () => { sim.dirty = true; sim.text(); };
  onInput(['#coF', '#coS'], redo); onRadio('coD', redo); sim.text();
})();

/* ───────── 03 oligopoly ───────── */
(() => {
  const cv = $('#olCv'), O = M.oligo, sN = $('#olN'), sS = $('#olS');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), N = +sN.value, sig = +sS.value, NM = 10;
      const f = frame(w, h, [30, 14, 40, 40], 0.6, NM + 0.4, 0, 40);
      yTicks(c, f, [0, 10, 20, 30, 40], v => fmt(v)); xTicks(c, f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], v => fmt(v));
      axes(c, f, t('ch3.cv.n'), t('ch3.cv.p'));
      hline(c, f, O.c, C.gold);
      c.fillStyle = 'rgba(233,185,73,.08)'; c.fillRect(f.X(N - 0.4), f.T, f.X(N + 0.4) - f.X(N - 0.4), f.B - f.T);
      const cs = [], bs = [], ls = [];
      for (let n = 1; n <= NM; n++) { cs.push([n, O.cournot(n).P]); bs.push([n, O.bertrand(n).P]); ls.push([n, O.logit(n, sig).P]); }
      path(c, bs, f.X, f.Y, C.red); path(c, ls, f.X, f.Y, C.violet); path(c, cs, f.X, f.Y, C.cyan);
      for (const [arr, col] of [[bs, C.red], [ls, C.violet], [cs, C.cyan]]) { const p = arr[N - 1]; dot(c, f.X(p[0]), f.Y(p[1]), col); }
    },
    text() {
      const N = +sN.value, sig = +sS.value, co = O.cournot(N), be = O.bertrand(N), lo = O.logit(N, sig);
      put('#olNo', fmt(N)); put('#olSo', fmt(sig));
      put('#olC', t('ch3.unit.pl', { p: fmt(co.P, 2), l: fmt(co.lerner, 3) })); put('#olB', fmt(be.P, 2));
      put('#olL', t('ch3.unit.pl', { p: fmt(lo.P, 2), l: fmt(lo.lerner, 3) })); put('#olH', fmt(co.hhi));
      say('#ch3Say', N === 1 ? 'ch3.say.one' : 'ch3.say.many', { n: fmt(N), c: fmt(co.P, 2), b: fmt(be.P, 2), l: fmt(lo.P, 2), h: fmt(co.hhi), floor: fmt(O.c + sig, 0) });
    }
  });
  onInput(['#olN', '#olS'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── 04 entry ───────── */
const ENTRY_S = [0.25, 0.5, 1, 2, 4, 8, 16, 32], ENTRY_F = [25, 50, 100, 200, 400], SIGMA = 8;
(() => {
  const cv = $('#enCv'), E = M.entry, sS = $('#enS'), sF = $('#enF');
  const st = () => ({ S: ENTRY_S[+sS.value], F: ENTRY_F[+sF.value] });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), { S, F } = st(), l0 = Math.log2(0.25), l1 = Math.log2(32), YM = 40;
      const f = frame(w, h, [30, 14, 40, 40], l0, l1, 0, YM), Y = v => f.Y(v);
      yTicks(c, f, [0, 10, 20, 30, 40], v => fmt(v)); xTicks(c, f, [-2, 0, 2, 4], v => fmt(Math.pow(2, v), v < 0 ? 2 : 0));
      axes(c, f, t('ch4.cv.s'), t('ch4.cv.n'));
      const step = (fn, col, dash) => { const pts = []; for (let l = l0; l <= l1 + 1e-9; l += 0.05) pts.push([l, fn(Math.pow(2, l))]); c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.R - f.L, f.B - f.T + 2); c.clip(); path(c, pts, f.X, Y, col, dash ? 1.5 : 2.2, dash); c.restore(); };
      step(s => E.socialN(s, F), C.mute, [5, 4]);
      step(s => E.nStar('bertrand', s, F, SIGMA), C.red);
      step(s => E.nStar('logit', s, F, SIGMA), C.violet);
      step(s => E.nStar('cournot', s, F, SIGMA), C.cyan);
      vline(c, f, Math.log2(S), C.gold);
      for (const [m, col] of [['bertrand', C.red], ['logit', C.violet], ['cournot', C.cyan]]) dot(c, f.X(Math.log2(S)), Y(E.nStar(m, S, F, SIGMA)), col);
    },
    text() {
      const { S, F } = st(), oc = E.outcome('cournot', S, F, SIGMA), ol = E.outcome('logit', S, F, SIGMA), ob = E.outcome('bertrand', S, F, SIGMA), ok = E.outcome('contestable', S, F, SIGMA), opt = E.socialN(S, F);
      put('#enSo', fmt(S, S < 1 ? 2 : 0)); put('#enFo', fmt(F));
      const nn = o => o.N ? t('ch4.unit.n', { v: fmt(o.N) }) : t('ch4.unit.none');
      put('#enNc', nn(oc)); put('#enNl', nn(ol)); put('#enNb', nn(ob)); put('#enOpt', t('ch4.unit.n', { v: fmt(opt) }));
      put('#enPc', oc.N ? fmt(oc.P, 2) : '—'); put('#enPk', ok.N ? fmt(ok.P, 2) : '—');
      const v = { s: fmt(S, S < 1 ? 2 : 0), f: fmt(F), nc: fmt(oc.N), pc: oc.N ? fmt(oc.P, 2) : '—', nl: fmt(ol.N), nb: fmt(ob.N), pb: ob.N ? fmt(ob.P, 2) : '—', opt: fmt(opt) };
      const key = !oc.N && !ob.N ? 'ch4.say.none' : !ol.N ? 'ch4.say.cournotonly' : 'ch4.say.normal';
      say('#ch4Say', key, v);
    }
  });
  onInput(['#enS', '#enF'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── 05 network hump ───────── */
(() => {
  const cv = $('#nwCv'), Nw = M.network, sP = $('#nwP'), sN = $('#nwN'), T = 20, H = 0.01;
  const ck = clock(T, 4);
  let run = null;
  const model = () => { run = Nw.run(+sN.value, +sP.value, T, H); };
  const at = tt => run[Math.min(run.length - 1, Math.round(tt / H))];
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; this.text(); } },
    draw() {
      const { c, w, h } = fit(cv), p = +sP.value, split = h * 0.5;
      const f = frame(w, split, [26, 14, 34, 44], 0, 1, 0, 0.32);
      yTicks(c, f, [0, 0.1, 0.2, 0.3], v => fmt(v, 1)); xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v) + '%');
      axes(c, f, '', t('ch5.cv.p'));
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch5.cv.n'), f.R, split - 8);
      const hump = []; for (let n = 0; n <= 1.0001; n += 0.01) hump.push([n, n * (1 - n)]);
      path(c, hump, f.X, f.Y, C.cyan); hline(c, f, p, C.gold);
      const cr = Nw.critical(p), hi = Nw.high(p);
      if (cr != null) { dot(c, f.X(cr), f.Y(p), C.red, 5); dot(c, f.X(hi), f.Y(p), C.gold, 5); }
      const now = at(ck.t); c.strokeStyle = C.violet; c.lineWidth = 2; c.beginPath(); c.moveTo(f.X(now[1]), f.B); c.lineTo(f.X(now[1]), f.B - 10); c.stroke();
      const g = frame(w, h, [split + 26, 14, 38, 44], 0, T, 0, 1);
      yTicks(c, g, [0, 0.5, 1], v => pct(v) + '%'); xTicks(c, g, [0, 5, 10, 15, 20], v => fmt(v), true);
      axes(c, g, t('ch5.cv.t'), t('ch5.cv.share'));
      if (cr != null) hline(c, g, cr, C.red, [3, 4]);
      const shown = run.filter(q => q[0] <= ck.t + 1e-9);
      path(c, shown, g.X, g.Y, C.violet);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, g.X(q[0]), g.Y(q[1]), C.violet); }
    },
    text() {
      const p = +sP.value, n0 = +sN.value, cr = Nw.critical(p), hi = Nw.high(p), now = at(ck.t);
      put('#nwPo', fmt(p, 2)); put('#nwNo', pct(n0) + '%');
      put('#nwC', cr == null ? t('ch5.unit.none') : t('ch5.unit.pct', { v: pct(cr, 1) })); put('#nwH', hi == null ? t('ch5.unit.none') : t('ch5.unit.pct', { v: pct(hi, 1) }));
      put('#nwNow', t('ch5.unit.pct', { v: pct(now[1], 1) })); put('#nwT', fmt(ck.t, 1));
      const v = { p: fmt(p, 2), n0: pct(n0) + '%', c: cr == null ? '' : pct(cr, 1) + '%', h: hi == null ? '' : pct(hi, 1) + '%' };
      let key;
      if (cr == null) key = 'ch5.say.none';
      else if (Math.abs(n0 - cr) < 0.005) key = 'ch5.say.edge';
      else if (ck.done()) key = n0 > cr ? 'ch5.say.doneup' : 'ch5.say.donedown';
      else key = n0 > cr ? 'ch5.say.up' : 'ch5.say.down';
      say('#ch5Say', key, v);
    }
  });
  const redo = () => { model(); ck.restart(); sim.dirty = true; sim.text(); };
  onInput(['#nwP', '#nwN'], redo); $('#nwGo').addEventListener('click', redo); sim.text();
})();

/* ───────── 06 standards race ───────── */
const RUNS = 200;
function histogram(c, f, leads, tipCol) {
  const bins = new Array(10).fill(0); for (const x of leads) bins[Math.min(9, Math.floor((x - 0.5) / 0.05))]++;
  const bw = (f.R - f.L) / 10;
  bins.forEach((n, i) => { const x0 = f.L + i * bw + 2, top = f.Y(n); c.fillStyle = i >= 8 ? tipCol : 'rgba(179,157,251,.7)'; c.fillRect(x0, top, bw - 4, f.B - top); });
}
(() => {
  const cv = $('#stCv'), cv2 = $('#stCv2'), S = M.standards, sR = $('#stR');
  let seed = 1, run = null, batch = null; const ck = clock(1000, 250);
  const model = () => { run = S.run({ r: +sR.value }, seed); };
  const doBatch = () => { batch = S.batch({ r: +sR.value }, RUNS, 1); };
  model(); doBatch();
  const sim = reg([cv, cv2], {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; this.text(); } },
    draw() {
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], 0, 1000, 0, 1);
        const thr = S.threshold(+sR.value, 1, 0);
        yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v) + '%'); xTicks(c, f, [0, 250, 500, 750, 1000], v => fmt(v), true);
        axes(c, f, t('ch6.cv.users'), t('ch6.cv.share'));
        // unlocked band: |a − b| < thr  ⇔  share within ½ ± thr/(2n)
        if (isFinite(thr)) { const band = []; for (let n = 5; n <= 1000; n += 5) band.push([n, Math.min(1, 0.5 + thr / (2 * n))]); for (let n = 1000; n >= 5; n -= 5) band.push([n, Math.max(0, 0.5 - thr / (2 * n))]); poly(c, band, f.X, f.Y, 'rgba(240,122,109,.18)'); }
        else { c.fillStyle = 'rgba(240,122,109,.18)'; c.fillRect(f.L + 1, f.T, f.R - f.L - 1, f.B - f.T); }
        const shown = run.path.filter(q => q[0] <= ck.t);
        path(c, shown, f.X, f.Y, C.cyan);
        if (shown.length) { const q = shown[shown.length - 1]; dot(c, f.X(q[0]), f.Y(q[1]), C.cyan); } }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [24, 14, 36, 44], 0.5, 1, 0, RUNS);
        yTicks(c, f, [0, RUNS / 2, RUNS], v => fmt(v)); xTicks(c, f, [0.5, 0.6, 0.7, 0.8, 0.9, 1], v => pct(v) + '%', true);
        axes(c, f, t('ch6.cv.lead'), t('ch6.cv.runs')); histogram(c, f, batch.leads, 'rgba(240,122,109,.85)'); }
    },
    text() {
      const r = +sR.value, thr = S.threshold(r, 1, 0), done = ck.done();
      put('#stRo', fmt(r, 2));
      put('#stThr', isFinite(thr) ? t('ch6.unit.people', { v: fmtThr(thr) }) : t('ch6.unit.inf'));
      put('#stAt', run.lockedAt != null && run.lockedAt <= ck.t ? fmt(run.lockedAt) : done ? t('ch6.unit.never') : '…');
      put('#stLead', done ? t('ch6.unit.who', { w: run.winner, v: pct(run.lead, 1) }) : '…');
      put('#stTip', t('ch6.unit.runs', { v: fmt(batch.tipped), p: pct(batch.tippedShare, 1) }));
      const v = { w: run.winner, at: fmt(run.lockedAt), thr: fmtThr(thr), lead: pct(run.lead, 1), tip: fmt(batch.tipped), aw: fmt(batch.aWins) };
      const key = r === 0 ? 'ch6.say.none' : run.lockedAt != null ? 'ch6.say.locked' : 'ch6.say.open';
      say('#ch6Say', key, v, !done && r > 0);
    }
  });
  sR.addEventListener('input', () => { model(); doBatch(); ck.restart(); sim.dirty = true; sim.text(); });
  sR.addEventListener('change', () => { sim.dirty = true; sim.text(); });
  $('#stGo').addEventListener('click', () => { seed++; model(); ck.restart(); sim.dirty = true; sim.text(); });
  sim.text();
})();

/* ───────── 07 two-sided ───────── */
(() => {
  const cv = $('#tsCv'), P = M.platform, s1 = $('#tsA1'), s2 = $('#tsA2');
  const st = () => { const a1 = +s1.value, a2 = +s2.value, mode = radioVal('tsMode'); return { a1, a2, mode, r: mode === 'duo' ? P.duopoly(a1, a2) : P.monopoly(a1, a2) }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), { r } = st(), lo = -1, hi = 2.2;
      const f = frame(w, h, [30, 14, 34, 44], 0, 4, lo, hi);
      yTicks(c, f, [-1, 0, 1, 2], v => fmt(v)); axes(c, f, '', t('ch7.cv.price'));
      c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      const bw = (f.R - f.L) / 4 * 0.42;
      const bar = (x, v, col) => { const y0 = f.Y(0), y1 = f.Y(Math.max(lo, Math.min(hi, v))); c.fillStyle = col; c.fillRect(f.X(x) - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0)); };
      bar(0.8, r.p1, 'rgba(99,199,230,.8)'); bar(1.6, r.n1, 'rgba(179,157,251,.7)');
      bar(2.4, r.p2, 'rgba(99,199,230,.8)'); bar(3.2, r.n2, 'rgba(179,157,251,.7)');
      c.strokeStyle = C.gold; c.setLineDash([5, 4]); c.lineWidth = 1.5;
      for (const x of [0.8, 2.4]) { c.beginPath(); c.moveTo(f.X(x) - bw * 0.8, f.Y(r.f1)); c.lineTo(f.X(x) + bw * 0.8, f.Y(r.f1)); c.stroke(); }
      c.setLineDash([]);
      c.fillStyle = C.mute; c.textAlign = 'center';
      c.fillText(t('ch7.cv.side1'), f.X(1.2), f.B + 14); c.fillText(t('ch7.cv.side2'), f.X(2.8), f.B + 14);
    },
    text() {
      const { a1, a2, mode, r } = st();
      put('#tsA1o', fmt(a1, 2)); put('#tsA2o', fmt(a2, 2));
      put('#tsP1', fmt(r.p1, 2)); put('#tsP2', fmt(r.p2, 2));
      put('#tsN', mode === 'duo' ? t('ch7.unit.half') : t('ch7.unit.pair', { a: fmt(r.n1, 2), b: fmt(r.n2, 2) }));
      put('#tsPr', mode === 'duo' ? '—' : t('ch7.unit.prof', { a: fmt(r.profit, 2), b: fmt(P.oneSided().profit, 2) }));
      const v = { p1: fmt(r.p1, 2), p2: fmt(r.p2, 2), f: fmt(r.f1, 1), a1: fmt(a1, 2), a2: fmt(a2, 2) };
      let key;
      if (mode === 'duo') { v.note = t('ch7.note.none', { t: fmt(P.t) }); key = 'ch7.say.duo'; }
      else key = r.p1 < r.f1 - 1e-9 ? 'ch7.say.below' : 'ch7.say.cheaper';
      say('#ch7Say', key, v);
    }
  });
  const redo = () => { sim.dirty = true; sim.text(); };
  onInput(['#tsA1', '#tsA2'], redo); onRadio('tsMode', redo); sim.text();
})();

/* ───────── 08 data loops ───────── */
(() => {
  const cv = $('#daCv'), Dm = M.data, sB = $('#daB'), sD = $('#daD'), T = 300, ck = clock(T, 30);
  let run = null; const model = () => { run = Dm.run(+sB.value, +sD.value, T); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; this.text(); } },
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], 0, T, 0, 1);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2)); xTicks(c, f, [0, 100, 200, 300], v => fmt(v), true);
      axes(c, f, t('ch8.cv.t'), t('ch8.cv.y'));
      hline(c, f, 0.5, C.line, [2, 4]);
      const shown = run.filter(q => q[0] <= ck.t + 1e-9);
      path(c, shown.map(q => [q[0], Math.min(1, q[2])]), f.X, f.Y, C.cyan, 1.6);
      path(c, shown.map(q => [q[0], Math.min(1, q[3])]), f.X, f.Y, C.violet, 1.6);
      path(c, shown.map(q => [q[0], q[1]]), f.X, f.Y, C.gold);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, f.X(q[0]), f.Y(q[1]), C.gold); }
    },
    text() {
      const b = +sB.value, d = +sD.value, dc = Dm.tipDelta(b), now = run[Math.min(run.length - 1, Math.floor(ck.t))], end = run[run.length - 1];
      put('#daBo', fmt(b, 2)); put('#daDo', fmt(d, 2));
      put('#daS0', t('ch8.unit.pct', { v: pct(run[0][1]) })); put('#daS', t('ch8.unit.pct', { v: pct(now[1]) }));
      put('#daDc', dc > 1 ? t('ch8.unit.inf') : fmt(dc, 3)); put('#daT', t('ch8.unit.t', { v: fmt(now[0]) }));
      const v = { t: fmt(now[0]), s: pct(ck.done() ? end[1] : now[1]) + '%', s0: pct(run[0][1]) + '%', d: fmt(d, 2), dc: fmt(dc, 3) };
      const key = !ck.done() ? 'ch8.say.running' : end[1] > 0.95 ? (d > dc ? 'ch8.say.tip' : 'ch8.say.tipstart') : end[1] < 0.535 ? 'ch8.say.fade' : 'ch8.say.hold';
      say('#ch8Say', key, v);
    }
  });
  const redo = () => { model(); ck.restart(); sim.dirty = true; sim.text(); };
  onInput(['#daB', '#daD'], redo); $('#daGo').addEventListener('click', redo); sim.text();
})();

/* ───────── 09 tying ───────── */
(() => {
  const cv = $('#tyCv'), Ty = M.tying, sM = $('#tyM'), sD = $('#tyD'), sK = $('#tyK');
  const st = () => ({ m: +sM.value, d: +sD.value, k: +sK.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), { m, d, k } = st(), r = Ty.solve(m, d, k), top = 18;
      const f = frame(w, h, [30, 14, 34, 44], 0, 2, -3, top);
      yTicks(c, f, [-3, 0, 6, 12, 18], v => fmt(v)); axes(c, f, '', '');
      c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      const gw = (f.R - f.L) / 2, bw = gw * 0.22;
      const bar = (g, i, v, col) => { const x = f.L + gw * g + gw * (0.2 + i * 0.25), y0 = f.Y(0), y1 = f.Y(Math.max(-3, Math.min(top, v))); c.fillStyle = col; c.fillRect(x, Math.min(y0, y1), bw, Math.abs(y1 - y0)); };
      const rivOpen = r.rivalInOpen ? r.rivalOpen : 0, rivTie = r.rivalInTie ? r.rivalTie : (r.rivalInOpen ? r.rivalTie : 0);
      bar(0, 0, r.mOpen, 'rgba(233,185,73,.85)'); bar(0, 1, rivOpen, 'rgba(240,122,109,.85)'); bar(0, 2, r.totalOpen, 'rgba(99,199,230,.8)');
      bar(1, 0, r.mTie, 'rgba(233,185,73,.85)'); bar(1, 1, rivTie, 'rgba(240,122,109,.85)'); bar(1, 2, r.totalTie, 'rgba(99,199,230,.8)');
      c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('ch9.cv.open'), f.L + gw * 0.5, f.B + 14); c.fillText(t('ch9.cv.tie'), f.L + gw * 1.5, f.B + 14);
    },
    text() {
      const { m, d, k } = st(), r = Ty.solve(m, d, k);
      put('#tyMo', fmt(m, 2)); put('#tyDo', fmt(d, 1)); put('#tyKo', fmt(k, 1));
      put('#tyGain', fmt(r.gain, 2)); put('#tyRiv', !r.rivalInOpen ? t('ch9.unit.deadopen') : r.rivalInTie ? t('ch9.unit.alive') : t('ch9.unit.dead')); put('#tyLoss', fmt(r.loss, 2));
      const v = { k: fmt(k, 1), rt: fmt(r.rivalTie, 2), gain: fmt(r.gain, 2), loss: fmt(r.loss, 2), m: fmt(m, 2) };
      const key = !r.rivalInOpen ? 'ch9.say.deadopen' : r.rivalInTie ? 'ch9.say.survive' : r.gain > 1e-9 ? 'ch9.say.profit' : 'ch9.say.nogain';
      say('#ch9Say', key, v);
    }
  });
  onInput(['#tyM', '#tyD', '#tyK'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── 10 not inevitable (reuses the ch6 model) ───────── */
(() => {
  const cv = $('#wtCv'), S = M.standards, sP = $('#wtPhi'), sH = $('#wtH'), sG = $('#wtG'), R = 0.1;
  let batch = null; const st = () => ({ r: R, phi: +sP.value, h: +sH.value, g: +sG.value });
  const model = () => { batch = S.batch(st(), RUNS, 1); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], 0.5, 1, 0, RUNS);
      yTicks(c, f, [0, RUNS / 2, RUNS], v => fmt(v)); xTicks(c, f, [0.5, 0.6, 0.7, 0.8, 0.9, 1], v => pct(v) + '%', true);
      axes(c, f, t('ch10.cv.lead'), t('ch10.cv.runs')); histogram(c, f, batch.leads, 'rgba(240,122,109,.85)');
    },
    text() {
      const o = st(), thr = S.threshold(o.r, o.g, o.phi), mean = batch.leads.reduce((a, x) => a + x, 0) / RUNS;
      put('#wtPhio', fmt(o.phi, 2)); put('#wtHo', pct(o.h) + '%'); put('#wtGo', fmt(o.g, 2));
      put('#wtTip', t('ch10.unit.pct', { v: pct(batch.tippedShare, 1) })); put('#wtMean', t('ch10.unit.pct', { v: pct(mean, 1) }));
      put('#wtThr', isFinite(thr) ? t('ch10.unit.people', { v: fmtThr(thr) }) : t('ch10.unit.inf'));
      const v = { tip: pct(batch.tippedShare, 1), mean: pct(mean, 1), thr: isFinite(thr) ? fmtThr(thr) : '∞', why: t(o.phi >= 0.5 ? 'ch10.why.phi' : 'ch10.why.other', { thr: isFinite(thr) ? fmtThr(thr) : '∞' }) };
      const key = batch.tippedShare >= 0.75 ? 'ch10.say.high' : batch.tipped === 0 ? 'ch10.say.none' : 'ch10.say.mid';
      say('#ch10Say', key, v);
    }
  });
  const redo = () => { model(); sim.dirty = true; sim.text(); };
  [sP, sH, sG].forEach(e => e.addEventListener('change', redo));
  [sP, sH, sG].forEach(e => e.addEventListener('input', redo));
  sim.text();
})();

/* ───────── 11 measuring ───────── */
(() => {
  const cv = $('#mkCv'), Mk = M.markups, sC = $('#mkC'), cS = $('#mkSga');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 44], Mk.y0, Mk.y1, 1, 1.8);
      yTicks(c, f, [1, 1.2, 1.4, 1.6, 1.8], v => fmt(v, 1)); xTicks(c, f, [1980, 1990, 2000, 2010], v => String(v));
      axes(c, f, t('ch11.cv.y'), t('ch11.cv.mu'));
      hline(c, f, Mk.mu, C.cyan);
      path(c, Mk.series(+sC.value, cS.checked), f.X, f.Y, C.gold);
    },
    text() {
      const s = Mk.series(+sC.value, cS.checked), est = s[s.length - 1][1];
      put('#mkCo', fmt(+sC.value, 2)); put('#mkEst', fmt(est, 2)); put('#mkTrue', fmt(Mk.mu, 2));
      const key = cS.checked ? 'ch11.say.sga' : Math.abs(est - Mk.mu) < 0.005 ? 'ch11.say.flat' : 'ch11.say.cogs';
      say('#ch11Say', key, { est: fmt(est, 2), mu: fmt(Mk.mu, 2), pct: fmt(100 * (est / Mk.mu - 1)) });
    }
  });
  onInput(['#mkC'], () => { sim.dirty = true; sim.text(); }); cS.addEventListener('change', () => { sim.dirty = true; sim.text(); }); sim.text();
})();
(() => {
  const cv = $('#dmCv'), A = M.asym, sC = $('#dmC');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = A.solve([+sC.value, 10, 10]), f = frame(w, h, [30, 14, 34, 44], 0, 3, 0, 0.6);
      yTicks(c, f, [0, 0.2, 0.4, 0.6], v => pct(v) + '%'); axes(c, f, '', t('ch11.cv.share'));
      const bw = (f.R - f.L) / 3 * 0.5;
      r.shares.forEach((s, i) => { const x = f.X(i + 0.5), top = f.Y(s); c.fillStyle = i === 0 ? 'rgba(233,185,73,.85)' : 'rgba(99,199,230,.75)'; c.fillRect(x - bw / 2, top, bw, f.B - top); });
      c.fillStyle = C.mute; c.textAlign = 'center'; ['ch11.cv.f1', 'ch11.cv.f2', 'ch11.cv.f3'].forEach((k, i) => c.fillText(t(k), f.X(i + 0.5), f.B + 14));
    },
    text() {
      const c1 = +sC.value, r = A.solve([c1, 10, 10]);
      put('#dmCo', fmt(c1, 1)); put('#dmP', fmt(r.P, 2)); put('#dmH', fmt(r.hhi)); put('#dmCs', fmt(r.cs, 1)); put('#dmL', fmt(r.lerner1, 3));
      say('#ch11Say2', c1 >= 10 ? 'ch11.say2.same' : 'ch11.say2.better', { c: fmt(c1, 1), s1: pct(r.shares[0], 1), h: fmt(r.hhi), p: fmt(r.P, 2), cs: fmt(r.cs, 1) });
    }
  });
  onInput(['#dmC'], () => { sim.dirty = true; sim.text(); }); sim.text();
})();

/* ───────── tables and frontier cards (DOM, rebuilt on language switch) ───────── */
function table(id, prefix, cols, rows) {
  const el = document.getElementById(id); if (!el) return;
  const head = '<thead><tr>' + cols.map(i => `<th scope="col">${t(`${prefix}.h${i}`)}</th>`).join('') + '</tr></thead>';
  const body = '<tbody>' + rows.map(r => '<tr>' + cols.map(i => `<td>${t(`${prefix}.r${r}.${i}`)}</td>`).join('') + '</tr>').join('') + '</tbody>';
  el.innerHTML = head + body;
}
function buildTables() {
  table('schools', 'ch11.schools', [1, 2, 3, 4], [1, 2, 3]);
  table('merit', 'ch13.merit', [1, 2, 3], [1, 2, 3, 4, 5, 6]);
  const cases = ['us1', 'us2', 'us3', 'us4', 'us5', 'eu1', 'eu2', 'cn1', 'cn2', 'cn3'];
  const ce = document.getElementById('cases');
  if (ce) ce.innerHTML = '<thead><tr>' + [1, 2, 3].map(i => `<th scope="col">${t('ch12.cases.h' + i)}</th>`).join('') + '</tr></thead><tbody>' +
    cases.map(k => `<tr><td>${t(`ch12.case.${k}.a`)}</td><td>${t(`ch12.case.${k}.b`)}</td><td>${t(`ch12.case.${k}.c`)}</td></tr>`).join('') + '</tbody>';
  const Fr = M.FRONTIER, hb = s => M.hhiBounds(s), cards = [];
  // money in US$ billions; the copy decides the unit and the scale (ch12.unit.usd, ch12.unit.bnScale)
  const usd = bn => t('ch12.unit.usd', { v: fmt(bn * +t('ch12.unit.bnScale'), +t('ch12.unit.bnScale') === 1 ? 1 : 0) });
  const fq = (q) => q.replace(/^(\d{4})-Q(\d)$/, (m, y, n) => t('ch12.unit.quarter', { y, q: n }));
  { const b = hb(Fr.foundry.shares); cards.push(['chips', [t('ch12.card.chips.f1', { asOf: fq(Fr.foundry.asOf), s1: fmt(Fr.foundry.shares[0], 1), s2: fmt(Fr.foundry.shares[1], 1), s3: fmt(Fr.foundry.shares[2], 1), src: 'TrendForce', lo: fmt(b.lo), hi: fmt(b.hi) }),
    t('ch12.card.chips.f2', { lo: usd(Fr.tsmcCapexBn.lo), hi: usd(Fr.tsmcCapexBn.hi) }),
    t('ch12.card.chips.f3', { rev: usd(Fr.nvidia.revenueBn), dc: usd(Fr.nvidia.dataCenterBn), gm: fmt(Fr.nvidia.grossMarginPct, 1) }), t('ch12.card.chips.mech')]]); }
  { const b = hb(Fr.cloud.shares); cards.push(['cloud', [t('ch12.card.cloud.f1', { asOf: fq(Fr.cloud.asOf), size: usd(Fr.cloud.marketBn), g: fmt(Fr.cloud.growthPct), s1: fmt(Fr.cloud.shares[0]), s2: fmt(Fr.cloud.shares[1]), s3: fmt(Fr.cloud.shares[2]), src: 'Synergy Research', lo: fmt(b.lo), hi: fmt(b.hi), rest: fmt(b.rest) }), t('ch12.card.cloud.f2'), t('ch12.card.cloud.mech')]]); }
  { const b = hb(Fr.enterpriseApi.shares); cards.push(['models', [t('ch12.card.models.f1', { g: fmt(Fr.trainingCostGrowth.perYear, 1), lo: fmt(Fr.trainingCostGrowth.lo, 1), hi: fmt(Fr.trainingCostGrowth.hi, 1) }),
    t('ch12.card.models.f2', { lo: fmt(Fr.inferencePriceFall.lo), hi: fmt(Fr.inferencePriceFall.hi) }), t('ch12.card.models.f3', { m: fmt(Fr.openGapMonths.months) }),
    t('ch12.card.models.f4', { s1: fmt(Fr.enterpriseApi.shares[0]), s2: fmt(Fr.enterpriseApi.shares[1]), s3: fmt(Fr.enterpriseApi.shares[2]), lo: fmt(b.lo), hi: fmt(b.hi), os: fmt(Fr.enterpriseApi.openSpendPct), ot: fmt(Fr.enterpriseApi.openTokenPct) }), t('ch12.card.models.mech')]]); }
  cards.push(['apps', [t('ch12.card.apps.f1'), t('ch12.card.apps.f2'), t('ch12.card.apps.mech')]]);
  const se = document.getElementById('stack');
  if (se) se.innerHTML = cards.map(([k, ps]) => `<div class="card"><h4>${t(`ch12.card.${k}.title`)}</h4>${ps.map(p => `<p>${p}</p>`).join('')}</div>`).join('');
}

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
