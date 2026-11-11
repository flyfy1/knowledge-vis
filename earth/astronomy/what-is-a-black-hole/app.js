/* What is a black hole, really? Wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.BHModels, K = M.K, OBJ = M.OBJ;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', fan: '#5b6478' };
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
const effLang = () => (COPY[lang] ? lang : 'zh');
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}

/* ───────── numbers: grouping follows the language; very large or small values as m × 10ⁿ ───────── */
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const locale = () => (effLang() === 'zh' ? 'zh-CN' : 'en-US');
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(locale(), { minimumFractionDigits: d, maximumFractionDigits: d });
}
// s significant figures; plain between 0.01 and 10⁶, otherwise m × 10ⁿ
function sig(x, s = 3) {
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -2 && e < 6) {
    const r = +x.toPrecision(s), e2 = Math.floor(Math.log10(Math.abs(r)));
    return fmt(r, Math.max(0, s - 1 - e2));
  }
  let m = +(x / Math.pow(10, e)).toFixed(s - 1);
  if (Math.abs(m) >= 10) { m /= 10; e++; }
  return fmt(m, s - 1) + ' × 10' + String(e).split('').map(ch => SUP[ch]).join('');
}
const pow10 = e => '10' + String(e).split('').map(ch => SUP[ch]).join('');
// a length in metres, in the unit a reader would use
function len(m, s = 3) {
  if (m < 1) return t('u.mm', { v: sig(m * 1000, s) });
  if (m < 1000) return t('u.m', { v: sig(m, s) });
  if (m < 1e10) return t('u.km', { v: sig(m / 1000, s) });
  return t('u.au', { v: sig(m / K.AU, s) });
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = e.isIntersecting; s.dirty = true; } }), { rootMargin: '60px' });
function reg(cv, o) { o.cvs = [cv]; o.vis = false; o.dirty = true; sims.push(o); io.observe(cv); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function frame(L, T, R, B, x0, x1, y0, y1) {
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, lab) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach(v => { const x = f.X(v); c.fillText(lab(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, lab) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(lab(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function circle(c, x, y, r, col, dash, lw = 1.3) { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke(); c.setLineDash([]); }
function hole(c, x, y, r) { c.fillStyle = '#000'; c.beginPath(); c.arc(x, y, Math.max(r, 2), 0, 6.283); c.fill(); circle(c, x, y, Math.max(r, 2), C.mute, null, 1); }
// a text label on a dark plate, kept inside [x0, x1]
function plate(c, s, x, y, align, col, x0 = 0, x1 = 1e9) {
  c.font = FONT; const w = c.measureText(s).width;
  let lx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  lx = clamp(lx, x0 + 2, x1 - w - 2);
  c.fillStyle = 'rgba(15,18,25,.85)'; c.fillRect(lx - 3, y - 8, w + 6, 16);
  c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, lx, y);
}
const logTicks = (a, b, step = 1) => { const o = []; for (let e = Math.ceil(a / step) * step; e <= b + 1e-9; e += step) o.push(Math.round(e)); return o; };

/* ───────── 01 escape speed ───────── */
(() => {
  const cv = $('#esCv'), sP = $('#esP');
  const s2peri = M.s2.aMeters(OBJ.s2.aMas, OBJ.s2.Dpc) * (1 - OBJ.s2.e);
  const objs = { earth: { GM: OBJ.earth.GM, R0: OBJ.earth.R }, sun: { GM: OBJ.sun.GM, R0: OBJ.sun.R }, sgra: { GM: OBJ.sgra.GM, R0: s2peri } };
  const st = () => { const o = objs[radioVal('esObj')], rs = M.escape.rs(o.GM), p = +sP.value / 100; const R = p >= 1 ? rs : o.R0 * Math.pow(rs / o.R0, p); return { o, rs, R, v: M.escape.vesc(o.GM, R), id: radioVal('esObj') }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), S = st(), lrs = Math.log10(S.rs), l0 = Math.log10(S.o.R0);
      const x0 = lrs - 0.12 * (l0 - lrs) - 0.3, x1 = l0 + 0.08 * (l0 - lrs) + 0.3;
      const yMin = Math.floor(Math.log10(Math.sqrt(S.rs / S.o.R0))) - 0.3, yMax = 0.6;
      const f = frame(52, 30, w - 14, h - 40, x0, x1, yMin, yMax);
      // inside r_s: the Newtonian formula would exceed c
      c.fillStyle = 'rgba(240,122,109,.10)'; c.fillRect(f.L + 1, f.T, f.X(lrs) - f.L - 1, f.B - f.T);
      // one gridline per factor of ten, as the "how" line says
      yTicks(c, f, logTicks(Math.ceil(yMin), 0, 1), e => e === 0 ? 'c' : pow10(e) + ' c');
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      hline(c, f, 0, C.gold); vline(c, f, lrs, C.red);
      const pts = []; for (let i = 0; i <= 60; i++) { const lr = lrs + (x1 - lrs) * i / 60; pts.push([lr, 0.5 * (lrs - lr)]); }
      path(c, pts, f.X, f.Y, C.cyan);
      // where the object really is (its surface, or for Sgr A* the closest approach of the star S2)
      const xs = f.X(l0); c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(xs, f.B); c.lineTo(xs, f.B - 6); c.stroke();
      plate(c, t(S.id === 'sgra' ? 'ch1.cv.s2' : 'ch1.cv.surface'), xs, f.B + 11, 'center', C.mute, f.L, f.R);
      plate(c, t('ch1.cv.rs'), f.X(lrs) + 6, f.B - 14, 'left', C.red, f.L, f.R);
      dot(c, f.X(Math.log10(S.R)), f.Y(Math.log10(S.v / K.c)), C.cyan, 5.5);
    }
  });
  function text() {
    const S = st(), frac = S.v / K.c, k = S.R / S.rs;
    put('#esPo', fmt(+sP.value) + '%');
    put('#esR', len(S.R)); put('#esV', t('u.kms', { v: sig(S.v / 1000) })); put('#esFrac', frac >= 0.9995 ? '1.00' : sig(frac));
    put('#esRs', len(S.rs));
    const v = { obj: t('obj.' + S.id), R: len(S.R), v: t('u.kms', { v: sig(S.v / 1000) }), pct: sig(frac * 100, 2), k: sig(k, 2), rs: len(S.rs) };
    const key = frac >= 0.9995 ? 'ch1.say.at' : (+sP.value === 0 ? (S.id === 'sgra' ? 'ch1.say.start.sgra' : 'ch1.say.start') : 'ch1.say.squeezed');
    putHTML('#esSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sP.addEventListener('input', redo); radios('esObj').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 02 size and "density" ───────── */
(() => {
  const cv = $('#scCv'), sM = $('#scM');
  const PRE = { earth: Math.log10(K.Mearth / K.Msun), sun: 0, gw: Math.log10(OBJ.gw150914.mf), sgra: Math.log10(OBJ.sgra.GM / K.GMsun), m87: Math.log10(OBJ.m87.GM / K.GMsun) };
  let lm = PRE.sgra;
  const REF = [['ch2.cv.earth', K.Rearth], ['ch2.cv.sun', K.Rsun], ['ch2.cv.au', K.AU]];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), x0 = -6, x1 = 10.5, split = Math.round(h * 0.52);
      const ms = Math.pow(10, lm), lrs = Math.log10(M.scale.rs(ms)), lrho = Math.log10(M.scale.density(ms));
      const xt = [-6, -3, 0, 3, 6, 9], xl = e => e === 0 ? '1' : pow10(e);
      // top: horizon radius
      const f1 = frame(52, 30, w - 14, split - 16, x0, x1, -3, 14.5);
      yTicks(c, f1, [-3, 0, 3, 6, 9, 12], e => e === 0 ? '1 m' : pow10(e) + ' m'); axes(c, f1, '', t('ch2.cv.y1'));
      for (const [k, r] of REF) { const y = Math.log10(r); hline(c, f1, y, C.fan, [3, 4]); }
      path(c, [[x0, Math.log10(M.scale.rs(Math.pow(10, x0)))], [x1, Math.log10(M.scale.rs(Math.pow(10, x1)))]], f1.X, f1.Y, C.red);
      // reference labels on the left half, the curve passes them on the right half
      for (const [k, r] of REF) plate(c, t(k), f1.L + 6, f1.Y(Math.log10(r)) - 9, 'left', C.mute, f1.L, f1.R);
      dot(c, f1.X(lm), f1.Y(lrs), C.red, 5.5);
      // bottom: mass ÷ volume
      const f2 = frame(52, split + 24, w - 14, h - 40, x0, x1, -3, 32);
      yTicks(c, f2, [0, 10, 20, 30], e => e === 0 ? '1' : pow10(e)); axes(c, f2, t('ch2.cv.x'), t('ch2.cv.y2'));
      xTicks(c, f2, xt, xl);
      hline(c, f2, 3, C.gold);
      plate(c, t('ch2.cv.water'), f2.R - 4, f2.Y(3) - 10, 'right', C.gold, f2.L, f2.R);
      path(c, [[x0, Math.log10(M.scale.density(Math.pow(10, x0)))], [x1, Math.log10(M.scale.density(Math.pow(10, x1)))]], f2.X, f2.Y, C.cyan);
      dot(c, f2.X(lm), f2.Y(lrho), C.cyan, 5.5);
    }
  });
  function text() {
    const ms = Math.pow(10, lm), rs = M.scale.rs(ms), rho = M.scale.density(ms), wr = rho / K.rhoWater;
    put('#scMo', t('u.msun', { v: sig(ms, 2) }));
    put('#scRs', len(rs)); put('#scRho', t('u.rho', { v: sig(rho, 2) })); put('#scW', t('u.times', { v: sig(wr, 2) }));
    const v = { m: t('u.msun', { v: sig(ms, 2) }), rs: len(rs), rho: t('u.rho', { v: sig(rho, 2) }), x: sig(wr, 2), inv: sig(1 / wr, 2) };
    putHTML('#scSay', t(wr >= 1 ? 'ch2.say.dense' : 'ch2.say.thin', v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  sM.addEventListener('input', () => { lm = +sM.value; redo(); });
  document.querySelectorAll('#ch2 [data-m]').forEach(b => b.addEventListener('click', () => { lm = PRE[b.dataset.m]; sM.value = lm; redo(); }));
  text();
})();

/* ───────── 03 the same pull at the same distance ───────── */
(() => {
  const cv = $('#obCv'), sF = $('#obF'), bSwap = $('#obSwap'), O = M.orbit, SPEED = 0.4; // years per real second
  let swapped = false, s = null, trail = [], done = false;
  const viewR = () => { const el = O.elements(+sF.value); return el.bound ? Math.max(1.15, Math.min(el.apo, 5) * 1.1) : 3.2; };
  function fresh() {
    s = O.create(+sF.value); trail = [[s.x, s.y]]; done = false;
    if (reduce) { const el = O.elements(s.f), until = el.bound ? Math.min(el.periodYr, 6) : 4; run(until); }
  }
  function run(span) {
    if (done) return;
    M.advance(s, span, O.H, (st, h) => { O.step(st, h); if (Math.round(st.t / O.H) % 8 === 0) trail.push([st.x, st.y]); if (O.r(st) > viewR() * 1.6) done = true; });
    if (trail.length > 4000) trail.splice(0, trail.length - 4000);
  }
  fresh();
  const sim = reg(cv, {
    step(dt) { if (!reduce && !done) { run(dt * SPEED); this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), R = viewR(), sc = Math.min(w, h) / 2 / R * 0.92, cx = w / 2, cy = h / 2;
      const X = x => cx + x * sc, Y = y => cy - y * sc;
      // the old circular orbit, 1 AU
      circle(c, cx, cy, sc, C.line, [4, 5]);
      plate(c, t('ch3.cv.orbit'), cx, cy - sc - 12, 'center', C.mute, 0, w);
      if (swapped) { hole(c, cx, cy, 6); circle(c, cx, cy, 10, 'rgba(179,157,251,.5)'); }
      else { const g = c.createRadialGradient(cx, cy, 2, cx, cy, 16); g.addColorStop(0, '#fff2c8'); g.addColorStop(0.5, C.gold); g.addColorStop(1, 'rgba(233,185,73,0)'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 16, 0, 6.283); c.fill(); }
      plate(c, t(swapped ? 'ch3.cv.bh' : 'ch3.cv.sun'), cx, cy + 26, 'center', swapped ? C.violet : C.gold, 0, w);
      path(c, trail, X, Y, C.cyan, 1.6);
      dot(c, X(s.x), Y(s.y), C.cyan, 5.5);
      plate(c, t('ch3.cv.scale'), 8, h - 12, 'left', C.mute, 0, w);
    }
  });
  function text() {
    const f = +sF.value, el = O.elements(f), r = O.r(s), v = Math.hypot(s.vx, s.vy) * K.AU / K.year;
    bSwap.setAttribute('aria-pressed', String(swapped));
    put('#obFo', t('u.msun', { v: fmt(f, 2) }));
    put('#obR', t('u.au', { v: sig(r) })); put('#obV', t('u.kms', { v: sig(v / 1000) }));
    put('#obT', el.bound ? t('u.days', { v: fmt(el.periodYr * K.year / K.day, 1) }) : t('ch3.unit.never'));
    put('#obPull', t('u.mms2', { v: sig(O.gAt(f * K.GMsun, r * K.AU) * 1000) }));
    const vv = { f: fmt(f, 2), T: el.bound ? fmt(el.periodYr * K.year / K.day, 1) : '—', peri: el.bound ? sig(el.peri, 2) : '—', apo: el.bound ? sig(el.apo, 2) : '—' };
    let key;
    if (Math.abs(f - 1) < 1e-9) key = swapped ? 'ch3.say.same.bh' : 'ch3.say.same.sun';
    else if (f > 1) key = 'ch3.say.heavier';
    else if (el.bound) key = 'ch3.say.lighter';
    else if (Math.abs(f - 0.5) < 1e-9) key = 'ch3.say.half';
    else key = 'ch3.say.escape';
    putHTML('#obSay', t(key, vv));
  }
  sim.text = text;
  sF.addEventListener('input', () => { fresh(); sim.dirty = true; text(); });
  bSwap.addEventListener('click', () => { swapped = !swapped; sim.dirty = true; text(); });
  $('#obReset').addEventListener('click', () => { fresh(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 04 close in: Schwarzschild orbits vs Newton ───────── */
(() => {
  const cv = $('#grCv'), sR = $('#grR'), sK = $('#grK'), G = M.gr, SPEED = 70; // τ (r_s/c) per real second
  let s = null, trail = [], info = null;
  const rel = () => radioVal('grTh') === 'gr';
  function analyse() {
    const r0 = +sR.value, k = +sK.value;
    const a = G.fate(r0, k, true), b = G.fate(r0, k, false);
    info = { r0, k, gr: a, nw: b, precGR: G.precession(r0, k, true), precN: G.precession(r0, k, false), h: k * G.hCircNewton(r0) };
  }
  function fresh() {
    analyse(); s = G.create(info.r0, info.k, rel()); trail = [[s.r, s.phi]];
    if (reduce) run(3000);
  }
  function run(span) {
    M.advance(s, span, G.H, (st, h) => { G.step(st, h); if (Math.round(st.t / h) % 3 === 0) trail.push([st.r, st.phi]); });
    if (trail.length > 7000) trail.splice(0, trail.length - 7000);
  }
  fresh();
  const sim = reg(cv, {
    step(dt) { if (!reduce && !s.inside && s.r < 1e3) { run(dt * SPEED); this.dirty = true; } },
    draw() {
      const { c, w, h } = fit(cv), wideL = w >= 640;
      const fa = rel() ? info.gr : info.nw, rView = Math.min(24, Math.max(info.r0, fa.kind === 'bound' ? fa.other : 0) * 1.08 + 0.6);
      // orbit view
      const ow = wideL ? Math.min(w * 0.5, h) : w, oh = wideL ? h : h * 0.56, sc = Math.min(ow, oh) / 2 / rView * 0.94, cx = ow / 2, cy = oh / 2;
      const X = (r, p) => cx + r * Math.cos(p) * sc, Y = (r, p) => cy - r * Math.sin(p) * sc;
      circle(c, cx, cy, 3 * sc, C.red, [5, 4]); circle(c, cx, cy, 1.5 * sc, C.violet, [3, 3]); hole(c, cx, cy, sc);
      c.strokeStyle = C.cyan; c.lineWidth = 1.5; c.beginPath(); trail.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](X(q[0], q[1]), Y(q[0], q[1]))); c.stroke();
      dot(c, X(s.r, s.phi), Y(s.r, s.phi), s.inside ? C.red : C.cyan, 5);
      plate(c, t(rel() ? 'ch4.cv.gr' : 'ch4.cv.newton'), 8, 14, 'left', rel() ? C.gold : C.mute, 0, ow);
      // effective potential
      const px0 = wideL ? ow + 52 : 52, py0 = wideL ? 30 : oh + 30, rel_ = rel();
      const f = frame(px0, py0, w - 14, h - 40, 1, rView, 0, 1);
      const V = r => G.V(r, info.h, rel_), E = V(info.r0);
      let lo = Infinity, hi = -Infinity; const pts = [];
      for (let i = 0; i <= 200; i++) { const r = 1 + (rView - 1) * i / 200, v = V(r); pts.push([r, v]); if (r > 1.05 || rel_) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
      hi = Math.min(hi, E + 4 * Math.abs(E - lo) + 0.02); const pad = (hi - lo) * 0.12 + 1e-3;
      f.Y = y => f.B - (f.B - f.T) * (clamp(y, lo - pad, hi + pad) - (lo - pad)) / (hi - lo + 2 * pad);
      axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      xTicks(c, f, [1, 3, 5, 10, 15, 20].filter(x => x <= rView), x => fmt(x));
      vline(c, f, 3, C.red); vline(c, f, 1.5, C.violet, [3, 3]);
      path(c, pts, f.X, f.Y, C.mute, 1.8);
      hline(c, f, E, C.gold);
      if (!s.inside) dot(c, f.X(clamp(s.r, 1, rView)), f.Y(E), C.cyan, 5);
    }
  });
  const rsU = v => t('u.rs', { v: sig(v, 3) });
  function text() {
    const R = rel(), fa = R ? info.gr : info.nw, fo = R ? info.nw : info.gr, prec = R ? info.precGR : info.precN;
    put('#grRo', rsU(info.r0)); put('#grKo', fmt(info.k, 2));
    const peri = fa.kind === 'bound' ? Math.min(info.r0, fa.other) : fa.kind === 'circle' ? info.r0 : fa.kind === 'escape' ? info.r0 : null;
    const apo = fa.kind === 'bound' ? Math.max(info.r0, fa.other) : fa.kind === 'circle' ? info.r0 : fa.kind === 'plunge' ? info.r0 : null;
    put('#grPeri', peri == null ? t('ch4.unit.plunge') : rsU(peri));
    put('#grApo', apo == null ? t('ch4.unit.escape') : rsU(apo));
    put('#grPrec', prec == null ? '—' : t('u.deg', { v: fmt(prec * 180 / Math.PI, 1) }));
    const otherPeri = fo.kind === 'bound' ? Math.min(info.r0, fo.other) : fo.kind === 'circle' || fo.kind === 'escape' ? info.r0 : null;
    put('#grOther', otherPeri == null ? t('ch4.unit.plunge') : rsU(otherPeri));
    const v = { rp: peri == null ? '—' : sig(peri, 3), ra: apo == null ? '—' : sig(apo, 3), prec: prec == null ? '—' : fmt(prec * 180 / Math.PI, 1), op: otherPeri == null ? '—' : sig(otherPeri, 3), oprec: (R ? info.precN : info.precGR) == null ? '—' : fmt((R ? info.precN : info.precGR) * 180 / Math.PI, 1) };
    let key;
    if (fa.kind === 'escape') key = 'ch4.say.escape';
    else if (R && fa.kind === 'circle') key = 'ch4.say.gr.circle';
    else if (R) key = fa.kind === 'plunge' ? 'ch4.say.gr.plunge' : (peri < 3 ? 'ch4.say.gr.deep' : 'ch4.say.gr.bound');
    else if (peri != null && peri < 1 && fo.kind === 'plunge') key = 'ch4.say.newton.inside';
    else if (fa.kind === 'circle') key = fo.kind === 'plunge' ? 'ch4.say.newton.circle.grplunge' : 'ch4.say.newton.circle';
    else key = fo.kind === 'plunge' ? 'ch4.say.newton.grplunge' : 'ch4.say.newton.grbound';
    putHTML('#grSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { fresh(); sim.dirty = true; text(); };
  [sR, sK].forEach(e => e.addEventListener('input', redo)); radios('grTh').forEach(r => r.addEventListener('change', redo));
  $('#grGo').addEventListener('click', redo);
  text();
})();

/* ───────── 05 tides ───────── */
(() => {
  const cv = $('#tdCv'), sM = $('#tdM'), sX = $('#tdX'), T = M.tide;
  const st = () => { const ms = Math.pow(10, +sM.value), GM = ms * K.GMsun, rs = M.escape.rs(GM), x = Math.pow(10, +sX.value), r = x * rs;
    return { ms, GM, rs, x, r, dg: T.dg(GM, r) / K.g0, dgH: T.atHorizon(GM) / K.g0, r1: T.radiusFor(GM, K.g0) }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), S = st(), f = frame(56, 30, w - 14, h - 40, 0, 3, -20, 10);
      yTicks(c, f, [-20, -15, -10, -5, 0, 5, 10], e => e === 0 ? '1 g' : pow10(e) + ' g');
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      xTicks(c, f, [0, 1, 2, 3], e => e === 0 ? '1' : pow10(e));
      hline(c, f, 0, C.gold); vline(c, f, 0, C.red);
      const lH = Math.log10(S.dgH);
      path(c, [[0, lH], [3, lH - 9]].map(q => [q[0], clamp(q[1], -20, 10)]), f.X, f.Y, C.cyan);
      if (S.r1 > S.rs) { const lx = Math.log10(S.r1 / S.rs); if (lx <= 3) { c.strokeStyle = C.gold; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(lx), f.Y(0)); c.lineTo(f.X(lx), f.B); c.stroke(); } }
      const ly = Math.log10(S.dg);
      if (ly >= -20 && ly <= 10) dot(c, f.X(+sX.value), f.Y(ly), C.cyan, 5.5);
    }
  });
  function text() {
    const S = st();
    put('#tdMo', t('u.msun', { v: sig(S.ms, 2) })); put('#tdXo', t('u.rs', { v: sig(S.x, 3) }));
    put('#tdDg', t('u.g', { v: sig(S.dg, 2) })); put('#tdR', len(S.r));
    putHTML('#tdR1', S.r1 > S.rs ? t('ch5.unit.r1', { d: len(S.r1), k: sig(S.r1 / S.rs, 3) }) : t('ch5.unit.inside'));
    put('#tdH', len(S.rs));
    const v = { dg: sig(S.dg, 2), dgH: sig(S.dgH, 2), r1: len(S.r1), k: sig(S.r1 / S.rs, 3), m: t('u.msun', { v: sig(S.ms, 2) }) };
    const far = S.r1 / S.rs >= 3;
    const key = S.dgH <= 1 ? 'ch5.say.gentle' : S.dg >= 1 ? (far ? 'ch5.say.over' : 'ch5.say.over.near') : (far ? 'ch5.say.before' : 'ch5.say.before.near');
    putHTML('#tdSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  [sM, sX].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* ───────── 06 a clock hovering near the horizon ───────── */
(() => {
  const cv = $('#ckCv'), sX = $('#ckX'), Ck = M.clock, FAST = 10; // far-away seconds per real second
  let far = reduce ? 45 : 0, near = reduce ? 45 * Ck.rate(1 + Math.pow(10, +sX.value)) : 0;
  const st = () => { const x = 1 + Math.pow(10, +sX.value), GM = radioVal('ckM') === 'sgra' ? OBJ.sgra.GM : 10 * K.GMsun; return { x, GM, f: Ck.rate(x), acc: Ck.hoverAcc(GM, x * M.escape.rs(GM)) / K.g0 }; };
  function dial(c, x, y, r, secs, col, lab) {
    circle(c, x, y, r, C.line, null, 2);
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(x + Math.sin(a) * r * 0.86, y - Math.cos(a) * r * 0.86); c.lineTo(x + Math.sin(a) * r * 0.96, y - Math.cos(a) * r * 0.96); c.stroke(); }
    const a = (secs % 60) / 60 * 6.283; c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82); c.stroke();
    dot(c, x, y, col, 3);
    plate(c, lab, x, y + r + 14, 'center', col, x - r - 40, x + r + 40);
  }
  const sim = reg(cv, {
    step(dt) { if (!reduce) { const S = st(); far += dt * FAST; near += dt * FAST * S.f; this.dirty = true; } },
    draw() {
      const { c, w, h } = fit(cv), S = st(), wideL = w >= 640;
      const dw = wideL ? w * 0.5 : w, dh = wideL ? h : h * 0.5, r = Math.min(dw / 4 - 14, dh / 2 - 26);
      dial(c, dw * 0.27, dh / 2 - 6, r, far, C.mute, t('ch6.cv.far'));
      dial(c, dw * 0.73, dh / 2 - 6, r, near, C.gold, t('ch6.cv.near'));
      const f = frame(wideL ? dw + 48 : 48, wideL ? 30 : dh + 26, w - 14, h - 38, -3, 3, 0, 1);
      yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [-3, -2, -1, 0, 1, 2, 3], e => e === 0 ? '1' : pow10(e));
      const pts = []; for (let i = 0; i <= 120; i++) { const e = -3 + 6 * i / 120; pts.push([e, Ck.rate(1 + Math.pow(10, e))]); }
      path(c, pts, f.X, f.Y, C.gold);
      dot(c, f.X(+sX.value), f.Y(S.f), C.gold, 5.5);
    }
  });
  function text() {
    const S = st(), pct = (1 - S.f) * 100;
    put('#ckXo', t('u.rs', { v: sig(S.x, 4) }));
    put('#ckRate', sig(S.f, 3)); put('#ckHour', t('u.hours', { v: sig(1 / S.f, 3) }));
    put('#ckAcc', t('u.g', { v: sig(S.acc, 2) })); put('#ckLight', '× ' + sig(1 / S.f, 3));
    const v = { x: sig(S.x, 4), f: sig(S.f, 3), pct: sig(pct, 2), hr: sig(1 / S.f, 3), acc: sig(S.acc, 2), gap: sig(S.x - 1, 2) };
    const key = S.f > 0.99 ? 'ch6.say.far' : S.f > 0.3 ? 'ch6.say.mid' : 'ch6.say.near';
    putHTML('#ckSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { if (reduce) { far = 45; near = 45 * st().f; } sim.dirty = true; text(); };
  sX.addEventListener('input', redo); radios('ckM').forEach(r => r.addEventListener('change', redo));
  $('#ckReset').addEventListener('click', () => { far = reduce ? 45 : 0; near = reduce ? 45 * st().f : 0; sim.dirty = true; });
  text();
})();

/* ───────── 07 light near a black hole, and the shadow ───────── */
(() => {
  const cv = $('#ltCv'), sB = $('#ltB'), L = M.light, BC = L.bCrit(), SPEED = 6; // r_s per real second along the ray
  const FAN = []; for (let b = 0.5; b <= 7.51; b += 0.5) FAN.push(L.trace(b, { keep: 10, dphi: 0.004 }));
  let ray = null, prog = 0, arc = [];
  // a ray's points in the plane: it comes in from the left at height b and the hole sits at the origin
  const toXY = (b, q) => { const u0 = Math.min(1e-4, 0.01 / b), th = Math.PI - (q[0] + Math.asin(Math.min(1, b * u0))); return [q[1] * Math.cos(th), q[1] * Math.sin(th)]; };
  function model() {
    const b = +sB.value;
    if (b < 1e-6) { ray = { b, captured: true, closest: null, deflection: null, xy: [[-60, 0], [-1, 0]] }; }
    else { const r = L.trace(b, { keep: 5 }); ray = { b, captured: r.captured, closest: r.closest, deflection: r.deflection, xy: r.pts.map(q => toXY(b, q)) }; }
    arc = [0]; for (let i = 1; i < ray.xy.length; i++) arc.push(arc[i - 1] + Math.hypot(ray.xy[i][0] - ray.xy[i - 1][0], ray.xy[i][1] - ray.xy[i - 1][1]));
    prog = 0;
  }
  model();
  const fanXY = FAN.map((r, i) => r.pts.map(q => toXY(0.5 + 0.5 * i, q)));
  const sim = reg(cv, {
    step(dt) { if (!reduce) { prog += dt * SPEED; this.dirty = true; } },
    draw() {
      const { c, w, h } = fit(cv), wideL = w >= 640;
      const pw = wideL ? w * 0.66 : w, ph = wideL ? h : h * 0.62, VR = Math.max(8.5, ray.b * 1.12), sc = Math.min(pw / 2 / VR, ph / 2 / VR * 1.15), cx = pw / 2, cy = ph / 2;
      const X = x => cx + x * sc, Y = y => cy - y * sc;
      c.save(); c.beginPath(); c.rect(0, 0, pw, ph); c.clip();
      for (const xy of fanXY) path(c, xy, X, Y, C.fan, 1);
      circle(c, cx, cy, 1.5 * sc, C.violet, [3, 3]); hole(c, cx, cy, sc);
      path(c, ray.xy, X, Y, C.gold, 2.2);
      if (!reduce && arc.length > 1) {
        const total = arc[arc.length - 1], d = Math.min(prog % (Math.min(total, 60) + 4), total);
        let i = arc.findIndex(a => a >= d); if (i < 0) i = arc.length - 1;
        dot(c, X(ray.xy[i][0]), Y(ray.xy[i][1]), '#fff6d8', 4);
      }
      c.restore();
      plate(c, t('ch7.cv.from'), 8, 14, 'left', C.mute, 0, pw);
      // what a distant camera sees: a dark disc of radius b_c around the horizon
      const vx = wideL ? pw + (w - pw) / 2 : w / 2, vy = wideL ? h / 2 : ph + (h - ph) / 2 + 6, vr = Math.min((wideL ? w - pw : w) / 2 - 16, (wideL ? h : h - ph) / 2 - 22);
      const s2 = vr / 4.2;
      const g = c.createRadialGradient(vx, vy, BC * s2, vx, vy, BC * s2 * 1.6); g.addColorStop(0, 'rgba(233,185,73,.55)'); g.addColorStop(1, 'rgba(233,185,73,0)');
      c.fillStyle = g; c.beginPath(); c.arc(vx, vy, BC * s2 * 1.6, 0, 6.283); c.fill();
      c.fillStyle = '#000'; c.beginPath(); c.arc(vx, vy, BC * s2, 0, 6.283); c.fill();
      circle(c, vx, vy, s2, C.mute, [3, 3]);
      if (ray.b > 0) circle(c, vx, vy, Math.min(ray.b, 4.2) * s2, C.gold, null, 1.2);
      plate(c, t('ch7.cv.view'), vx, vy - vr - 4, 'center', C.mute, wideL ? pw : 0, w);
    }
  });
  function text() {
    const b = ray.b;
    put('#ltBo', t('u.rs', { v: fmt(b, 2) }));
    put('#ltFate', t(ray.captured ? 'ch7.unit.captured' : 'ch7.unit.escaped'));
    put('#ltMin', ray.captured ? '—' : t('u.rs', { v: sig(ray.closest, 3) }));
    put('#ltDef', ray.captured ? '—' : t('u.deg', { v: sig(ray.deflection * 180 / Math.PI, 3) }));
    put('#ltBc', t('u.rs', { v: fmt(BC, 2) }));
    const v = { b: fmt(b, 2), bc: fmt(BC, 2), def: ray.captured ? '—' : sig(ray.deflection * 180 / Math.PI, 3), min: ray.captured ? '—' : sig(ray.closest, 3), weak: sig(L.weakDeflection(Math.max(b, 1e-9)) * 180 / Math.PI, 3) };
    let key;
    if (ray.captured) key = b <= 1 ? 'ch7.say.direct' : 'ch7.say.miss';
    else if (ray.deflection > Math.PI) key = 'ch7.say.loop';
    else if (ray.deflection > 15 * Math.PI / 180) key = 'ch7.say.bend';
    else key = 'ch7.say.weak';
    putHTML('#ltSay', t(key, v));
  }
  sim.text = text;
  sB.addEventListener('input', () => { model(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 08 the star S2 weighs Sgr A* ───────── */
(() => {
  const cv = $('#s2Cv'), sD = $('#s2D'), S = M.s2, P = OBJ.s2, SPEED = 1.6; // years per real second
  let tYr = reduce ? 0 : 0;
  const st = () => { const D = +sD.value, ms = S.mass(P.aMas, D, P.Pyr), aM = S.aMeters(P.aMas, D), GM = ms * K.GMsun; return { D, ms, aM, GM, rs: M.escape.rs(GM) }; };
  const sim = reg(cv, {
    step(dt) { if (!reduce) { tYr = (tYr + dt * SPEED) % P.Pyr; this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv), Z = st(), e = P.e, b = Math.sqrt(1 - e * e);
      // ellipse in units of a; focus at the origin. Wide canvas: pericentre to the right. Narrow (portrait) canvas:
      // the major axis is drawn vertically, pericentre at the top, so the orbit stays large at 320 px.
      const vert = w < h * 1.1;
      const sc = vert ? Math.min((h - 56) / 2, (w - 24) / (2 * b)) : Math.min((w - 40) / 2.0, (h - 60) / (2 * b));
      const ox = w / 2, oy = h / 2 - 8; // centre of the ellipse on screen
      const PX = (x, y) => vert ? ox - y * sc : ox + (x + e) * sc, PY = (x, y) => vert ? oy - (x + e) * sc : oy - y * sc;
      c.strokeStyle = C.line; c.lineWidth = 1.2; c.beginPath();
      for (let i = 0; i <= 200; i++) { const E = i / 200 * 6.283, x = Math.cos(E) - e, y = b * Math.sin(E); c[i ? 'lineTo' : 'moveTo'](PX(x, y), PY(x, y)); } c.stroke();
      // trail: the last 1.5 years
      const tr = []; for (let k = 0; k <= 60; k++) { const tt = tYr - 1.5 + 1.5 * k / 60; const q = S.at(tt, e, P.Pyr, Z.aM, Z.GM); tr.push([q.x, q.y]); }
      c.strokeStyle = C.cyan; c.lineWidth = 1.8; c.beginPath(); tr.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](PX(p[0], p[1]), PY(p[0], p[1]))); c.stroke();
      const q = S.at(tYr, e, P.Pyr, Z.aM, Z.GM);
      dot(c, PX(q.x, q.y), PY(q.x, q.y), C.cyan, 5.5);
      hole(c, PX(0, 0), PY(0, 0), 3);
      plate(c, t('ch8.cv.sgra'), PX(0, 0), PY(0, 0) + 16, 'center', C.violet, 0, w);
      // scale bar: 100 AU at this distance
      const bar = 100 * K.AU / Z.aM * sc;
      c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.moveTo(14, h - 16); c.lineTo(14 + bar, h - 16); c.stroke();
      plate(c, t('ch8.cv.bar'), 14 + bar + 8, h - 16, 'left', C.mute, 0, w);
    }
  });
  function text() {
    const Z = st(), q = S.at(tYr, P.e, P.Pyr, Z.aM, Z.GM), peri = Z.aM * (1 - P.e);
    put('#s2Do', t('u.pc', { v: fmt(Z.D, 1) }));
    put('#s2M', t('u.msun', { v: sig(Z.ms, 3) }));
    putHTML('#s2Peri', t('ch8.unit.peri', { au: fmt(peri / K.AU), k: fmt(peri / Z.rs) }));
    putHTML('#s2V', t('ch8.unit.v', { v: sig(q.v / 1000, 3), pct: sig(q.v / K.c * 100, 2) }));
    put('#s2Y', t('u.yr', { v: fmt(tYr, 1) }));
    const ref = S.mass(P.aMas, P.Dpc, P.Pyr);
    const v = { D: fmt(Z.D, 1), a: fmt(Z.aM / K.AU), m: sig(Z.ms, 3), dm: sig(Math.abs(Z.ms / ref - 1) * 100, 2), dd: sig(Math.abs(Z.D / P.Dpc - 1) * 100, 2) };
    const key = Math.abs(Z.D - P.Dpc) < 0.05 ? 'ch8.say.ref' : Z.D > P.Dpc ? 'ch8.say.far' : 'ch8.say.near';
    putHTML('#s2Say', t(key, v));
  }
  sim.text = text;
  sD.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 09 gravitational waves: the chirp ───────── */
(() => {
  const cv = $('#gwCv'), sA = $('#gwA'), sB = $('#gwB'), Ch = M.chirp, SLOW = 0.1; // signal seconds per real second
  let wave = null, span = 0, play = 0, info = null;
  function model() {
    const m1 = +sA.value, m2 = +sB.value, Mc = Ch.chirpMass(m1, m2), fi = Ch.fIsco(m1 + m2);
    const ok = fi >= 37, dur = ok ? Ch.tau(Mc, 35) - Ch.tau(Mc, fi) : null;
    info = { m1, m2, Mc, fi, ok, dur, n: ok ? Ch.cycles(Mc, 35, fi) : null, rs: M.escape.rs((m1 + m2) * K.GMsun) };
    span = ok ? Math.min(dur, 1.2) : 0.1;
    wave = Ch.wave(m1, m2, span, 3000);
    play = reduce ? span : 0;
  }
  model();
  const sim = reg(cv, {
    step(dt) { if (!reduce && play < span) { play = Math.min(span, play + dt * SLOW); this.dirty = true; } },
    draw() {
      const { c, w, h } = fit(cv), split = Math.round(h * 0.55);
      const f1 = frame(52, 26, w - 14, split - 10, -span, 0, -1.15, 1.15);
      axes(c, f1, '', t('ch9.cv.y1'));
      const shown = wave.filter(q => q[0] <= -span + play);
      path(c, shown, f1.X, f1.Y, C.cyan, 1.2);
      const fMax = info.fi * 1.05, f2 = frame(52, split + 22, w - 14, h - 40, -span, 0, 0, fMax);
      const yt = fMax > 200 ? [0, 100, 200, 300, 400, 500, 600].filter(v => v <= fMax) : fMax > 60 ? [0, 25, 50, 75, 100, 125, 150, 175].filter(v => v <= fMax) : [0, 10, 20, 30, 40, 50].filter(v => v <= fMax);
      yTicks(c, f2, yt, v => fmt(v)); axes(c, f2, t('ch9.cv.x'), t('ch9.cv.y2'));
      const xt = []; const stp = span > 0.6 ? 0.2 : span > 0.25 ? 0.1 : span > 0.12 ? 0.05 : 0.02; for (let x = 0; x >= -span + 1e-9; x -= stp) xt.push(+x.toFixed(3));
      xTicks(c, f2, xt, x => fmt(x, stp < 0.1 ? 2 : 1));
      if (info.ok) hline(c, f2, 35, C.fan, [3, 4]);
      path(c, shown.map(q => [q[0], q[2]]), f2.X, f2.Y, C.gold, 1.8);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, f2.X(q[0]), f2.Y(q[2]), C.gold, 4.5); }
    }
  });
  function text() {
    put('#gwAo', t('u.msun', { v: fmt(info.m1) })); put('#gwBo', t('u.msun', { v: fmt(info.m2) }));
    put('#gwMc', t('u.msun', { v: sig(info.Mc, 3) })); put('#gwF', t('u.hz', { v: fmt(info.fi) }));
    put('#gwT', info.ok ? t('u.s', { v: sig(info.dur, 2) }) : '—'); put('#gwN', info.ok ? fmt(info.n, 1) : '—');
    const v = { m1: fmt(info.m1), m2: fmt(info.m2), mc: sig(info.Mc, 3), f: fmt(info.fi), t: info.ok ? sig(info.dur, 2) : '—', n: info.ok ? fmt(info.n, 1) : '—', rs: len(info.rs) };
    putHTML('#gwSay', t(info.ok ? 'ch9.say.ok' : 'ch9.say.heavy', v));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); };
  [sA, sB].forEach(e => e.addEventListener('input', redo));
  $('#gwGo').addEventListener('click', () => { play = reduce ? span : 0; sim.dirty = true; });
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
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
