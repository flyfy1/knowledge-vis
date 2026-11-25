/* When buyers can't see quality: i18n runtime, wiring and drawing. All visible text comes from copy.*.js (generated
   from content.<lang>.md by scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html).
   The runtime head follows computing/systems/how-a-cpu-does-math/app.js. */
(() => {
'use strict';
const M = window.LemonsModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
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
const fmt = (x, d) => M.fmt(x, d);
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
// amounts kept in 10,000 yuan (万元); English shows thousands of yuan (¥…k)
const wan = (x, d) => { d = d == null ? 2 : d; return effLang() === 'en' ? t('u.wan', { v: fmt(x * 10, Math.max(0, d - 1)) }) : t('u.wan', { v: fmt(x, d) }); };
const yuan = x => t('u.yuan', { v: fmt(x, 0) });
const langHooks = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langHooks.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

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
let lastT = 0;
function loop(ts) {
  const dt = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0; lastT = ts;
  for (const s of sims) { if (s.vis && s.tick) s.tick(dt); if (s.vis && s.dirty) { s.dirty = false; s.draw(); } }
  requestAnimationFrame(loop);
}
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const num = id => Number(document.getElementById(id).value);
const onIn = (ids, fn) => ids.forEach(id => document.getElementById(id).addEventListener('input', fn));

/* chart helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 30); }
}
function xTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) { const px = f.X(x), w = c.measureText(s).width, cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2); if (cx - w / 2 < lastR + 8) continue; c.fillText(s, cx, f.B + 13); lastR = cx + w / 2; c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke(); }
}
function yTicks(c, f, items, right) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = right ? 'left' : 'right'; let lastY = Infinity;
  for (const [y, s] of items) { const py = f.Y(y); if (py > lastY - 14 || py < f.T - 2) continue; c.fillText(s, right ? f.R + 6 : f.L - 6, py); lastY = py; if (!right) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke(); } }
}
function line(c, pts, color, w, dash) { c.strokeStyle = color; c.lineWidth = w || 2; c.setLineDash(dash || []); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, r, color) { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
// a label kept inside the plot and away from a list of already placed boxes
function label(c, s, x, y, color, placed, f, align) {
  c.font = FONT; const w = c.measureText(s).width, h = 14;
  let lx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  lx = Math.max(f.L + 2, Math.min(f.R - w - 2, lx));
  let ly = Math.max(f.T + h / 2, Math.min(f.B - h / 2, y));
  for (let k = 0; k < 12; k++) {
    const hit = placed.find(b => lx < b.x + b.w + 4 && lx + w + 4 > b.x && ly - h / 2 < b.y + b.h / 2 && ly + h / 2 > b.y - b.h / 2);
    if (!hit) break; ly = hit.y + (k % 2 ? -1 : 1) * (h + 2) * Math.ceil((k + 1) / 2); ly = Math.max(f.T + h / 2, Math.min(f.B - h / 2, ly));
  }
  placed.push({ x: lx, y: ly, w, h }); c.fillStyle = color; c.textAlign = 'left'; c.fillText(s, lx, ly);
}

/* ───────── ch1: why buy insurance that loses money on average ───────── */
{
  const cv = $('#c1Cv');
  const st = () => ({ W: M.CH1.W, L: num('c1L'), p: num('c1P') / 100, g: num('c1G') });
  const sim = reg(cv, {
    draw() {
      const P = st(), r = M.insure(P);
      const { c, w, h } = fit(cv);
      const lo = Math.max(0.5, P.W - P.L - 1), hi = P.W + 1;
      const U = x => M.u(x, P.g);
      const y0 = U(lo), y1 = U(hi);
      const f = frame(w, h, [30, 14, 40, 16], lo, hi, y0, y1 + (y1 - y0) * 0.05);
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      const ticks = []; for (let x = Math.ceil(lo); x <= hi; x += P.L > 8 ? 2 : 1) ticks.push([x, fmt(x, 0)]);
      xTicks(c, f, ticks);
      const pts = []; for (let i = 0; i <= 120; i++) { const x = lo + (hi - lo) * i / 120; pts.push([f.X(x), f.Y(U(x))]); }
      line(c, pts, C.cyan, 2);
      const a = [P.W - P.L, U(P.W - P.L)], b = [P.W, U(P.W)];
      line(c, [[f.X(a[0]), f.Y(a[1])], [f.X(b[0]), f.Y(b[1])]], C.mute, 1, [4, 4]);
      const ew = P.W - r.ev, eu = (1 - P.p) * b[1] + P.p * a[1];
      // the EU level: on the chord at the expected wealth, and on the curve at the certainty equivalent
      line(c, [[f.X(r.ce), f.Y(eu)], [f.X(ew), f.Y(eu)]], C.gold, 2);
      line(c, [[f.X(r.ce), f.Y(eu)], [f.X(r.ce), f.B]], C.gold, 1, [3, 3]);
      line(c, [[f.X(ew), f.Y(eu)], [f.X(ew), f.B]], C.mute, 1, [3, 3]);
      dot(c, f.X(a[0]), f.Y(a[1]), 4, C.red); dot(c, f.X(b[0]), f.Y(b[1]), 4, C.cyan); dot(c, f.X(ew), f.Y(eu), 4, C.ink); dot(c, f.X(r.ce), f.Y(eu), 5, C.gold);
      const placed = [];
      label(c, t('ch1.cv.loss'), f.X(a[0]) + 8, f.Y(a[1]) - 4, C.red, placed, f);
      label(c, t('ch1.cv.ce'), f.X(r.ce) - 8, f.Y(eu) - 16, C.gold, placed, f, 'right');
      label(c, t('ch1.cv.ev'), f.X(ew) + 8, f.Y(eu) + 16, C.ink, placed, f);
      label(c, t('ch1.cv.no'), f.X(b[0]) - 8, f.Y(b[1]) + 16, C.cyan, placed, f, 'right');
    },
    text() {
      const P = st(), r = M.insure(P);
      put('#c1Po', pct(P.p, 1)); put('#c1Lo', wan(P.L, 0)); put('#c1Go', fmt(P.g, 1));
      put('#c1Ev', yuan(r.ev * 1e4)); put('#c1Max', yuan(r.maxPrem * 1e4)); put('#c1Rp', yuan(r.riskPrem * 1e4)); put('#c1Ratio', t('u.x', { v: fmt(r.ratio, 2) }));
      const key = P.g < 1e-9 ? 'neutral' : 'averse';
      putHTML('#c1Say', t('ch1.say.' + key, { ev: yuan(r.ev * 1e4), max: yuan(r.maxPrem * 1e4), rp: yuan(r.riskPrem * 1e4) }));
    }
  });
  onIn(['c1P', 'c1L', 'c1G'], () => { sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

/* ───────── ch3: lemons ───────── */
{
  const cv = $('#c3Cv');
  let run = null, t3 = 0, playing = false;
  const st = () => ({ b: num('c3B'), lo: num('c3Lo') });
  function recompute(keep) { const P = st(); const r = M.lemons(P); run = { P, r, step: keep ? Math.min(run ? run.step : 0, r.hist.length - 1) : 0 }; if (reduce) run.step = r.hist.length - 1; }
  const sim = reg(cv, {
    tick(dt) { if (!playing || reduce) return; t3 += dt; if (t3 > 0.7) { t3 = 0; if (run.step < run.r.hist.length - 1) { run.step++; sim.text(); sim.dirty = true; } else { setPlay(false); } } },
    draw() {
      const { c, w, h } = fit(cv);
      const { r, step } = run, H = r.hist[step], hi = M.CH3.hi;
      const split = Math.round(h * 0.55);
      const f = frame(w, split, [24, 14, 30, 16], 0, hi * 1.25, 0, 1);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch3.cv.cars'), f.L, 12);
      const xt = []; for (let x = 0; x <= hi * 1.2; x += 2) xt.push([x, fmt(x, 0)]);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
      xTicks(c, f, xt);
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch3.cv.x'), f.R, f.B + 26);
      r.cars.forEach((q, i) => { const on = q <= H.p + 1e-12; const row = i % 8; dot(c, f.X(q), f.T + 6 + row * ((f.B - f.T - 12) / 7), 3, on ? C.cyan : C.dimfill); });
      const px = f.X(H.p); line(c, [[px, f.T - 4], [px, f.B]], C.gold, 2);
      const placed = []; label(c, t('ch3.cv.offer', { p: fmt(H.p, 2) }), px + 6, f.T + 4, C.gold, placed, f);
      // price by round
      const g = frame(w, h, [split + 26, 14, 30, 44], 0, Math.max(6, r.hist.length - 1), 0, hi * 1.25);
      axes(c, g, t('ch3.cv.round'), t('ch3.cv.price'));
      const rt = []; for (let k = 0; k <= g.x1; k += g.x1 > 20 ? 5 : 2) rt.push([k, String(k)]); xTicks(c, g, rt);
      yTicks(c, g, [[0, '0'], [5, '5'], [10, '10']]);
      const pts = r.hist.slice(0, step + 1).map(e => [g.X(e.t), g.Y(e.p)]);
      line(c, pts, C.gold, 2); pts.forEach(([x, y]) => dot(c, x, y, 2.5, C.gold));
      const fx = M.lemonsFixed(run.P.b, run.P.lo, hi);
      line(c, [[g.L, g.Y(fx.p)], [g.R, g.Y(fx.p)]], C.mute, 1, [4, 4]);
    },
    text() {
      const { P, r, step } = run, H = r.hist[step], done = step === r.hist.length - 1;
      put('#c3Bo', t('u.x', { v: fmt(P.b, 2) })); put('#c3Loo', wan(P.lo, 1));
      put('#c3Rd', String(H.t)); put('#c3Pr', wan(H.p)); put('#c3On', t('ch3.read.onv', { k: H.k, n: M.CH3.n })); put('#c3Gain', pct(H.gainShare));
      let key = 'run';
      if (done) key = H.k === 0 || H.share < 0.05 ? 'dead' : H.k === M.CH3.n ? 'full' : 'part';
      putHTML('#c3Say', t('ch3.say.' + key, { p: wan(H.p), k: H.k, avg: wan(H.avg), g: pct(H.gainShare), n: M.CH3.n }));
      const cars = r.cars.filter(q => q <= H.p + 1e-12).length; void cars;
    }
  });
  function setPlay(v) { playing = v; $('#c3Run').setAttribute('aria-pressed', String(v)); }
  recompute();
  onIn(['c3B', 'c3Lo'], () => { recompute(); setPlay(false); sim.text(); sim.dirty = true; });
  $('#c3Step').addEventListener('click', () => { if (run.step < run.r.hist.length - 1) run.step++; sim.text(); sim.dirty = true; });
  $('#c3Run').addEventListener('click', () => { if (reduce) { run.step = run.r.hist.length - 1; sim.text(); sim.dirty = true; return; } if (run.step >= run.r.hist.length - 1) run.step = 0; setPlay(!playing); sim.text(); sim.dirty = true; });
  $('#c3Reset').addEventListener('click', () => { setPlay(false); recompute(); run.step = reduce ? run.r.hist.length - 1 : 0; sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

/* ───────── ch4: the insurance pool ───────── */
{
  const cv = $('#c4Cv');
  let run = null, t4 = 0, playing = false;
  const st = () => ({ g: num('c4G'), sig: num('c4S'), inc: num('c4I'), K: num('c4K') });
  function recompute() { const P = st(); const r = M.pool(P); run = { P, r, step: reduce ? r.hist.length - 1 : 0 }; }
  const sim = reg(cv, {
    tick(dt) { if (!playing || reduce) return; t4 += dt; if (t4 > 0.6) { t4 = 0; if (run.step < run.r.hist.length - 1) { run.step++; sim.text(); sim.dirty = true; } else setPlay(false); } },
    draw() {
      const { c, w, h } = fit(cv);
      const { r, step, P } = run, H = r.hist[step], n = r.ps.length;
      const lg = x => Math.log10(Math.max(1, x));
      const f = frame(w, h, [30, 14, 42, 52], 0, 1, 0, 5.3);
      axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      xTicks(c, f, [[0, '0'], [0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, '100%']]);
      yTicks(c, f, [[1, '10'], [2, '100'], [3, '1,000'], [4, '10,000'], [5, '100,000']]);
      // enrolled people: a strip along the bottom, and the area between cost and WTP
      const per = Math.floor(n / P.K);
      const klass = i => Math.min(P.K - 1, Math.floor(i / per));
      for (let i = 0; i < n; i += 2) {
        const k = klass(i), on = r.wtp[i] >= H.prem[k] - 1e-9;
        c.fillStyle = on ? 'rgba(99,199,230,.55)' : 'rgba(58,66,84,.9)';
        const x = f.X(i / n); c.fillRect(x, f.B - 8, Math.max(1, (f.R - f.L) * 2 / n), 7);
      }
      const ptsW = [], ptsC = [];
      for (let i = 0; i < n; i += 4) { ptsW.push([f.X(i / n), f.Y(lg(r.wtp[i]))]); ptsC.push([f.X(i / n), f.Y(lg(r.cost[i]))]); }
      line(c, ptsC, C.cyan, 2); line(c, ptsW, C.gold, 2);
      for (let k = 0; k < P.K; k++) {
        const a = k * per / n, b = k === P.K - 1 ? 1 : (k + 1) * per / n;
        line(c, [[f.X(a), f.Y(lg(H.prem[k]))], [f.X(b), f.Y(lg(H.prem[k]))]], C.red, 2.5);
      }
      const placed = [];
      label(c, t('ch4.cv.in', { s: pct(H.share) }), f.L + 6, f.B - 20, C.cyan, placed, f);
    },
    text() {
      const { P, r, step } = run, H = r.hist[step], done = step === r.hist.length - 1;
      put('#c4Go', fmt(P.g, 1)); put('#c4So', fmt(P.sig, 1)); put('#c4Io', yuan(P.inc)); put('#c4Ko', String(P.K));
      const live = H.prem.filter((p, k) => H.inClass[k] > 0);
      const pr = P.K === 1 ? yuan(H.prem[0]) : (live.length ? t('ch4.read.range', { a: fmt(Math.min(...live), 0), b: fmt(Math.max(...live), 0) }) : '—');
      put('#c4Rd', String(H.t)); put('#c4Pr', pr); put('#c4Sh', pct(H.share));
      // average expected loss of those still in
      let s = 0, k = 0; const per = Math.floor(r.ps.length / P.K);
      r.ps.forEach((p, i) => { const kk = Math.min(P.K - 1, Math.floor(i / per)); if (r.wtp[i] >= H.prem[kk] - 1e-9) { s += r.cost[i]; k++; } });
      put('#c4Avg', k ? yuan(s / k) : '—');
      let key = 'run';
      if (done) key = H.share < 0.1 ? 'spiral' : H.share > 0.95 ? 'full' : 'part';
      putHTML('#c4Say', t('ch4.say.' + key, { s: pct(H.share), p0: yuan(r.hist[0].prem[0]), p: yuan(Math.max(...H.prem)), r: r.rounds, mean: yuan(r.meanCost) }));
    }
  });
  function setPlay(v) { playing = v; $('#c4Run').setAttribute('aria-pressed', String(v)); }
  recompute();
  onIn(['c4G', 'c4S', 'c4I', 'c4K'], () => { recompute(); setPlay(false); sim.text(); sim.dirty = true; });
  $('#c4Step').addEventListener('click', () => { if (run.step < run.r.hist.length - 1) run.step++; sim.text(); sim.dirty = true; });
  $('#c4Run').addEventListener('click', () => { if (reduce) { run.step = run.r.hist.length - 1; sim.text(); sim.dirty = true; return; } if (run.step >= run.r.hist.length - 1) run.step = 0; setPlay(!playing); sim.text(); sim.dirty = true; });
  $('#c4Reset').addEventListener('click', () => { setPlay(false); recompute(); sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

/* ───────── ch5: a deductible menu ───────── */
{
  const cv = $('#c5Cv');
  const st = () => Object.assign({}, M.CH5, { D: num('c5D'), lam: num('c5Lam') });
  const sim = reg(cv, {
    draw() {
      const P = st(), s = M.screen(P);
      const { c, w, h } = fit(cv);
      const ceHA = M.planCE(P.pH, P.L, P.pH, P), pooled = s.pooled.ce;
      const ys = []; for (let i = 0; i <= 100; i++) { const D = P.L * i / 100; ys.push([D, M.planCE(P.pH, P.L - D, P.pL, P), M.planCE(P.pL, P.L - D, P.pL, P)]); }
      const all = ys.flatMap(v => [v[1], v[2]]).concat([ceHA, pooled]);
      const y0 = Math.floor(Math.min(...all) * 2) / 2, y1 = Math.ceil(Math.max(...all) * 2) / 2;
      const f = frame(w, h, [30, 14, 40, 44], 0, P.L, y0, y1);
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      const xt = []; for (let x = 0; x <= P.L; x += 2) xt.push([x, fmt(x, 0)]); xTicks(c, f, xt);
      const yt = []; for (let y = y0; y <= y1 + 1e-9; y += 0.5) yt.push([y, fmt(y, 1)]); yTicks(c, f, yt);
      line(c, ys.map(v => [f.X(v[0]), f.Y(v[1])]), C.red, 2);
      line(c, [[f.L, f.Y(ceHA)], [f.R, f.Y(ceHA)]], C.red, 1.5, [5, 4]);
      line(c, ys.map(v => [f.X(v[0]), f.Y(v[2])]), C.cyan, 2);
      line(c, [[f.L, f.Y(pooled)], [f.R, f.Y(pooled)]], C.violet, 1.5, [5, 4]);
      line(c, [[f.X(s.Dstar), f.T], [f.X(s.Dstar), f.B]], C.gold, 1, [3, 3]);
      line(c, [[f.X(P.D), f.T], [f.X(P.D), f.B]], C.ink, 1.5);
      dot(c, f.X(P.D), f.Y(M.planCE(P.pH, P.L - P.D, P.pL, P)), 4, C.red); dot(c, f.X(P.D), f.Y(M.planCE(P.pL, P.L - P.D, P.pL, P)), 4, C.cyan);
      const placed = [];
      label(c, t('ch5.cv.ha'), f.R - 4, f.Y(ceHA) - 10, C.red, placed, f, 'right');
      label(c, t('ch5.cv.ds'), f.X(s.Dstar) + 5, f.B - 12, C.gold, placed, f);
    },
    text() {
      const P = st(), s = M.screen(P);
      put('#c5Do', wan(P.D, 1)); put('#c5Lamo', pct(P.lam));
      const nm = k => t('ch5.plan.' + k);
      put('#c5H', nm(s.cH)); put('#c5L', nm(s.cL)); put('#c5Pf', yuan(s.profit * 1e4)); put('#c5Ds', wan(s.Dstar, 2));
      let key = s.separated ? 'sep' : (s.cH === 'B' ? 'leak' : 'other');
      if (s.separated && s.breaks) key = 'breaks';
      putHTML('#c5Say', t('ch5.say.' + key, { d: wan(P.D, 1), ds: wan(s.Dstar, 2), pf: yuan(-s.profit * 1e4), lam: pct(P.lam), lb: pct(M.lamBreak(P)) }));
    }
  });
  onIn(['c5D', 'c5Lam'], () => { sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

/* ───────── ch6: signalling ───────── */
{
  const cv = $('#c6Cv');
  const st = () => Object.assign({}, M.CH6, { eStar: num('c6E'), cL: num('c6C') });
  const sim = reg(cv, {
    draw() {
      const P = st(), s = M.spence(P);
      const { c, w, h } = fit(cv);
      const f = frame(w, h, [30, 14, 40, 44], 0, 5, -8, 16);
      axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [0, 1, 2, 3, 4, 5].map(x => [x, String(x)]));
      yTicks(c, f, [[-8, '−8'], [-4, '−4'], [0, '0'], [4, '4'], [8, '8'], [12, '12'], [16, '16']]);
      line(c, [[f.L, f.Y(0)], [f.R, f.Y(0)]], C.line, 1);
      // net income: wL with no schooling (below e*), wH − c·e from e* on
      const net = (cost) => [[f.X(0), f.Y(P.wL)], [f.X(P.eStar), f.Y(P.wL - cost * P.eStar)], [f.X(P.eStar), f.Y(P.wH - cost * P.eStar)], [f.X(5), f.Y(P.wH - cost * 5)]];
      line(c, net(P.cH), C.cyan, 2); line(c, net(P.cL), C.red, 2);
      line(c, [[f.X(P.eStar), f.T], [f.X(P.eStar), f.B]], C.gold, 1.5, [4, 3]);
      c.fillStyle = 'rgba(233,185,73,.10)'; c.fillRect(f.X(s.range[0]), f.T, f.X(Math.min(5, s.range[1])) - f.X(s.range[0]), f.B - f.T);
      line(c, [[f.L, f.Y(P.wL)], [f.R, f.Y(P.wL)]], C.mute, 1, [2, 4]);
      dot(c, f.X(P.eStar), f.Y(P.wH - P.cH * P.eStar), 4, C.cyan); dot(c, f.X(P.eStar), f.Y(P.wH - P.cL * P.eStar), 4, C.red);
      const placed = [];
      label(c, t('ch6.cv.wl'), f.R - 4, f.Y(P.wL) - 10, C.mute, placed, f, 'right');
      label(c, t('ch6.cv.band'), f.X(s.range[0]) + 4, f.T + 8, C.gold, placed, f);
    },
    text() {
      const P = st(), s = M.spence(P);
      put('#c6Eo', t('u.yr', { v: fmt(P.eStar, 1) })); put('#c6Co', wan(P.cL, 1));
      put('#c6St', t('ch6.state.' + s.state)); put('#c6Hi', wan(s.highNet, 1)); put('#c6Lo', wan(s.lowNet, 1));
      put('#c6Rg', t('ch6.read.rangev', { a: fmt(s.range[0], 2), b: fmt(s.range[1], 2) }));
      putHTML('#c6Say', t('ch6.say.' + s.state, { e: fmt(P.eStar, 1), a: fmt(s.range[0], 2), b: fmt(s.range[1], 2), hi: wan(s.highNet, 1), lo: wan(s.lowNet, 1), avg: wan(s.avg, 1) }));
    }
  });
  onIn(['c6E', 'c6C'], () => { sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

/* ───────── ch7: moral hazard and the co-pay ───────── */
{
  const cv = $('#c7Cv');
  const curve = []; for (let i = 0; i <= 100; i++) curve.push(M.hazard(i / 100));
  const best = M.hazardBest(), fb = M.firstBest();
  const sim = reg(cv, {
    draw() {
      const s = num('c7S') / 100, H = M.hazard(s);
      const { c, w, h } = fit(cv);
      const mid = Math.round(h * 0.55);
      const ces = curve.map(v => v.ce), y0 = Math.floor(Math.min(...ces) * 5) / 5, y1 = Math.ceil(Math.max(fb.ce, ...ces) * 5) / 5;
      const f = frame(w, mid, [28, 14, 22, 52], 0, 1, y0, y1);
      axes(c, f, '', t('ch7.cv.ce'));
      const yt = []; for (let y = y0; y <= y1 + 1e-9; y += 0.2) yt.push([y, fmt(y, 1)]); yTicks(c, f, yt);
      line(c, curve.map(v => [f.X(v.s), f.Y(v.ce)]), C.gold, 2);
      line(c, [[f.L, f.Y(fb.ce)], [f.R, f.Y(fb.ce)]], C.green, 1.5, [5, 4]);
      line(c, [[f.X(best.s), f.T], [f.X(best.s), f.B]], C.gold, 1, [3, 3]);
      line(c, [[f.X(s), f.T], [f.X(s), h - 40]], C.ink, 1.5);
      dot(c, f.X(s), f.Y(H.ce), 4.5, C.gold);
      const placed = [];
      label(c, t('ch7.cv.fb'), f.R - 4, f.Y(fb.ce) - 10, C.green, placed, f, 'right');
      const g = frame(w, h, [mid + 22, 14, 40, 52], 0, 1, 0, 0.11);
      axes(c, g, t('ch7.cv.x'), t('ch7.cv.p'));
      xTicks(c, g, [[0, '0%'], [0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, '100%']]);
      yTicks(c, g, [[0, '0%'], [0.05, '5%'], [0.1, '10%']]);
      line(c, curve.map(v => [g.X(v.s), g.Y(v.p)]), C.red, 2);
      dot(c, g.X(s), g.Y(H.p), 4.5, C.red);
    },
    text() {
      const s = num('c7S') / 100, H = M.hazard(s);
      put('#c7So', pct(s)); put('#c7E', pct(H.e)); put('#c7P', pct(H.p, 1)); put('#c7Pr', yuan(H.prem * 1e4)); put('#c7Ce', wan(H.ce, 2));
      const key = s < 0.005 ? 'zero' : Math.abs(s - best.s) <= 0.02 ? 'best' : s < best.s ? 'low' : 'high';
      putHTML('#c7Say', t('ch7.say.' + key, { s: pct(s), e: pct(H.e), p: pct(H.p, 1), bs: pct(best.s), pr: yuan(H.prem * 1e4) }));
    }
  });
  onIn(['c7S'], () => { sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

/* ───────── ch8: Stiglitz–Weiss ───────── */
{
  const cv = $('#c8Cv');
  const st = () => Object.assign({}, M.CH8, { gap: num('c8Gap') / 100, F: num('c8F') / 100, info: $('#c8Info').checked });
  const sim = reg(cv, {
    draw() {
      const P = st(), s = M.sw(P);
      const { c, w, h } = fit(cv);
      const mid = Math.round(h * 0.6);
      const f = frame(w, mid, [28, 14, 22, 52], 0, 1, 0.8, 1.3);
      axes(c, f, '', t('ch8.cv.ret'));
      yTicks(c, f, [[0.8, '−20%'], [0.9, '−10%'], [1, '0%'], [1.1, '10%'], [1.2, '20%'], [1.3, '30%']]);
      line(c, [[f.L, f.Y(P.cf)], [f.R, f.Y(P.cf)]], C.mute, 1, [4, 4]);
      const pts = []; let prev = null;
      for (const v of s.curve) { if (v.demand === 0) { if (prev) { line(c, pts.splice(0), C.gold, 2); } prev = null; continue; } pts.push([f.X(v.r), f.Y(Math.max(0.8, v.ret))]); prev = v; }
      line(c, pts, C.gold, 2);
      if (!P.info) { dot(c, f.X(s.best.r), f.Y(s.best.ret), 5, C.gold); line(c, [[f.X(s.best.r), f.T], [f.X(s.best.r), h - 40]], C.gold, 1, [3, 3]); }
      const placed = [];
      label(c, t('ch8.cv.cf'), f.R - 4, f.Y(P.cf) + 10, C.mute, placed, f, 'right');
      if (P.info) s.priced.forEach((p, i) => { if (p.served) { line(c, [[f.X(p.r), f.T], [f.X(p.r), h - 40]], C.green, 1, [2, 3]); } });
      const g = frame(w, h, [mid + 22, 14, 40, 52], 0, 1, 0, 1.2);
      axes(c, g, t('ch8.cv.x'), t('ch8.cv.dem'));
      xTicks(c, g, [[0, '0%'], [0.2, '20%'], [0.4, '40%'], [0.6, '60%'], [0.8, '80%'], [1, '100%']]);
      yTicks(c, g, [[0, '0'], [0.5, '50%'], [1, '100%']]);
      const dp = []; s.curve.forEach((v, i) => { if (i) dp.push([g.X(v.r), g.Y(s.curve[i - 1].demand)]); dp.push([g.X(v.r), g.Y(v.demand)]); });
      line(c, dp, C.cyan, 2);
      line(c, [[g.L, g.Y(P.F)], [g.R, g.Y(P.F)]], C.violet, 1.5, [5, 4]);
      label(c, t('ch8.cv.F'), g.R - 4, g.Y(P.F) - 10, C.violet, [], g, 'right');
    },
    text() {
      const P = st(), s = M.sw(P);
      put('#c8Gapo', t('u.pp', { v: fmt(P.gap * 100, 0) })); put('#c8Fo', pct(P.F));
      put('#c8R', pct(s.best.r, 1)); put('#c8Ret', pct(s.best.ret - 1, 1)); put('#c8Dem', pct(s.best.demand)); put('#c8Rat', pct(s.rationed));
      $('#c8Grp').hidden = !P.info;
      s.priced.forEach((p, i) => { const e = $('#c8G' + i); e.textContent = p.served ? pct(p.r, 1) : t('ch8.notserved'); e.className = p.served ? '' : 'x'; });
      let key;
      if (P.info) key = 'info';
      else if (s.interior) key = s.rationed > 0 ? 'ration' : 'enough';
      else key = 'top';
      putHTML('#c8Say', t('ch8.say.' + key, { r: pct(s.best.r, 1), ret: pct(s.best.ret - 1, 1), d: pct(s.best.demand), q: pct(s.rationed), top: pct(s.best.r, 0) }));
    }
  });
  onIn(['c8Gap', 'c8F'], () => { sim.text(); sim.dirty = true; });
  $('#c8Info').addEventListener('change', () => { sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

/* ───────── ch9: a toy scorecard ───────── */
{
  const cv = $('#c9Cv');
  const B = M.BORROWERS, lo = 460, hi = 720, bins = 52;
  const hg = new Array(bins).fill(0), hb = new Array(bins).fill(0);
  for (const x of B) { const k = Math.max(0, Math.min(bins - 1, Math.floor((x.s - lo) / (hi - lo) * bins))); (x.bad ? hb : hg)[k]++; }
  const sim = reg(cv, {
    draw() {
      const cut = num('c9Cut'), you = M.score(M.pd(num('c9Late'), num('c9Dti') / 100, num('c9Yr')));
      const { c, w, h } = fit(cv);
      const top = Math.max(...hg) * 1.1;
      const f = frame(w, h, [30, 14, 40, 44], lo, hi, 0, top);
      axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
      const xt = []; for (let x = 480; x <= 700; x += 40) xt.push([x, String(x)]); xTicks(c, f, xt);
      const bw = (f.R - f.L) / bins;
      for (let k = 0; k < bins; k++) {
        const x = f.L + k * bw, s0 = lo + (hi - lo) * k / bins;
        c.globalAlpha = s0 + 1e-9 >= cut ? 0.9 : 0.4;
        c.fillStyle = C.cyan; c.fillRect(x + 1, f.Y(hg[k]), bw - 2, f.B - f.Y(hg[k]));
        c.fillStyle = C.red; c.fillRect(x + 1, f.Y(hb[k] * 5), bw - 2, f.B - f.Y(hb[k] * 5));
      }
      c.globalAlpha = 1;
      line(c, [[f.X(cut), f.T], [f.X(cut), f.B]], C.ink, 1.5, [4, 3]);
      const yx = f.X(Math.max(lo, Math.min(hi, you)));
      c.fillStyle = C.gold; c.beginPath(); c.moveTo(yx, f.B - 2); c.lineTo(yx - 7, f.B - 16); c.lineTo(yx + 7, f.B - 16); c.fill();
      const placed = [];
      label(c, t('ch9.cv.cut'), f.X(cut) + 5, f.T + 6, C.ink, placed, f);
      label(c, t('ch9.cv.bad5'), f.L + 6, f.T + 24, C.red, placed, f);
    },
    text() {
      const late = num('c9Late'), dti = num('c9Dti') / 100, yr = num('c9Yr'), cut = num('c9Cut');
      const q = M.pd(late, dti, yr), s = M.score(q), r = M.cutoff(cut);
      put('#c9Lateo', String(late)); put('#c9Dtio', pct(dti)); put('#c9Yro', t('u.yr', { v: yr })); put('#c9Cuto', String(cut));
      put('#c9Pd', pct(q, 1)); put('#c9Sc', fmt(s, 0)); put('#c9Ap', pct(r.approve)); put('#c9Bad', pct(r.badApproved, 1));
      putHTML('#c9Say', t('ch9.say.' + (s >= cut ? 'yes' : 'no'), { s: fmt(s, 0), q: pct(q, 1), ap: pct(r.approve), bad: pct(r.badApproved, 1), all: pct(r.badRate, 1), caught: pct(r.caught) }));
    }
  });
  onIn(['c9Late', 'c9Dti', 'c9Yr', 'c9Cut'], () => { sim.text(); sim.dirty = true; });
  langHooks.push(() => sim.text());
}

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
