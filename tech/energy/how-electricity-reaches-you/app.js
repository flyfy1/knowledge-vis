/* How electricity reaches you: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.GridModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', orange: '#f0a35e', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp, F0 = M.F0;

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
// plain grouped decimals in both languages (1,234.5); a true minus sign for negatives
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  const s = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  return v < 0 ? '−' + s : s;
}
const sfmt = (x, d) => (x > 0.5 * Math.pow(10, -d) ? '+' : '') + fmt(x, d); // signed
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fv) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach(v => { const x = f.X(v); c.fillText(fv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4], lw = 1.3) { if (y < f.y0 || y > f.y1) return; c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2, dash) { if (!pts.length) return; c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
// replay clock: advances model time on real dt, jumps to the end under reduced motion
function clock(until, speed) { return { t: reduce ? until : 0, until, speed, restart() { this.t = reduce ? this.until : 0; }, tick(dt) { const was = this.t; this.t = Math.min(this.until, this.t + dt * this.speed); return this.t !== was; } }; }
function rangeTicks(lo, hi, step) { const out = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6)); return out; }
const crossTime = (series, level) => { const p = series.find(q => q[1] < level); return p ? p[0] : null; };

/* ───────── 01 swing equation, no governor ───────── */
(() => {
  const cv = $('#s1Cv'), S = M.swing, UNTIL = 20, ck = clock(UNTIL, 2);
  const sP = $('#s1P'), sH = $('#s1H');
  let res = null;
  const p = () => ({ dP: +sP.value, H: +sH.value, governor: false });
  const model = () => { res = S.run(p(), UNTIL, 0.05); res.min = Math.min(...res.series.map(q => q[1])); res.cross = crossTime(res.series, 48.8); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), y0 = Math.max(44, Math.min(48.5, Math.floor(res.min * 2) / 2)), y1 = 50.25;
      const f = frame(w, h, [30, 16, 38, 46], 0, UNTIL, y0, y1);
      yTicks(c, f, rangeTicks(y0, 50, y1 - y0 > 3 ? 1 : 0.5), v => fmt(v, v % 1 ? 1 : 0));
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      xTicks(c, f, [0, 5, 10, 15], v => fmt(v));
      hline(c, f, 48.8, C.red);
      const shown = res.series.filter(q => q[0] <= ck.t + 1e-9);
      path(c, shown, f.X, f.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, f.X(q[0]), f.Y(q[1]), C.cyan); }
    }
  });
  function text() {
    const P = p(), rocof = -S.rocof(P), settle = S.settle(P);
    put('#s1Po', t('unit.mw', { v: fmt(P.dP) })); put('#s1Ho', t('unit.s', { v: fmt(P.H, 1) }));
    put('#s1Rocof', t('unit.hzs', { v: fmt(rocof, 2) })); put('#s1F1', t('unit.hz', { v: fmt(res.f1, 2) }));
    put('#s1Cross', res.cross == null ? t('unit.never') : t('unit.s', { v: fmt(res.cross, 1) }));
    put('#s1Drawn', t('unit.mj', { v: fmt(S.drawn(P, res.f1)) }));
    putHTML('#s1Say', t(res.cross == null ? 'ch1.say.safe' : 'ch1.say.cross', { rocof: fmt(rocof, 2), t: res.cross == null ? '' : fmt(res.cross, 1), settle: fmt(settle, 2), pct: fmt(100 * P.dP / S.defaults.S, 1) }));
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  [sP, sH].forEach(e => e.addEventListener('input', redo));
  on('#s1Go', 'click', () => { ck.restart(); sim.dirty = true; });
  text();
})();

/* ───────── 02 governors, reserve, AGC (the ch1 model with control) ───────── */
(() => {
  const cv = $('#s2Cv'), S = M.swing, UNTIL = 120, ck = clock(UNTIL, 12);
  const sP = $('#s2P'), sR = $('#s2R'), sRes = $('#s2Res'), cA = $('#s2Agc');
  let res = null, nogov = null;
  const p = () => ({ dP: +sP.value, R: +sR.value / 100, reserve: +sRes.value, governor: true, agc: cA.checked });
  const model = () => { res = S.run(p(), UNTIL, 0.1); nogov = S.run({ dP: +sP.value, governor: false }, UNTIL, 0.5); };
  model();
  const sim = reg(cv, {
    step(dt) { if (ck.tick(dt)) { this.dirty = true; } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv);
      const lo = Math.min(res.nadir, ...nogov.series.map(q => q[1]));
      const y0 = Math.max(44, Math.min(48.5, Math.floor(lo * 2) / 2)), y1 = 50.25;
      const f = frame(w, h, [30, 16, 38, 46], 0, UNTIL, y0, y1);
      yTicks(c, f, rangeTicks(y0, 50, y1 - y0 > 3 ? 1 : 0.5), v => fmt(v, v % 1 ? 1 : 0));
      axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
      xTicks(c, f, [0, 30, 60, 90], v => fmt(v));
      hline(c, f, 48.8, C.red);
      path(c, nogov.series.filter(q => q[0] <= ck.t + 1e-9).map(q => [q[0], Math.max(q[1], y0)]), f.X, f.Y, C.mute, 1.4, [5, 4]);
      const shown = res.series.filter(q => q[0] <= ck.t + 1e-9).map(q => [q[0], Math.max(q[1], y0)]);
      path(c, shown, f.X, f.Y, C.cyan);
      if (shown.length) { const q = shown[shown.length - 1]; dot(c, f.X(q[0]), f.Y(q[1]), C.cyan); }
    }
  });
  function text() {
    const P = p();
    put('#s2Po', t('unit.mw', { v: fmt(P.dP) })); put('#s2Ro', t('unit.pct', { v: fmt(P.R * 100) })); put('#s2Reso', t('unit.mw', { v: fmt(P.reserve) }));
    put('#s2Nadir', t('unit.at', { f: fmt(res.nadir, 2), t: fmt(res.tNadir, 1) })); put('#s2End', t('unit.hz', { v: fmt(res.fEnd, 2) }));
    put('#s2Gov', t('unit.mw', { v: fmt(res.pm) })); put('#s2Use', t('unit.pct', { v: fmt(Math.min(100, 100 * Math.abs(res.pm) / P.reserve)) }));
    const need = P.dP * (1 / P.R) / (S.defaults.D + 1 / P.R), short = need > P.reserve + 1e-9;
    let key;
    if (short) key = P.agc ? 'ch2.say.shortagc' : 'ch2.say.short';
    else key = P.agc ? 'ch2.say.agc' : 'ch2.say.ok';
    putHTML('#s2Say', t(key, { tn: fmt(res.tNadir, 1), nadir: fmt(res.nadir, 2), end: fmt(res.fEnd, 2), gov: fmt(res.pm), dp: fmt(P.dP), res: fmt(P.reserve), line: t(res.fEnd < 48.8 ? 'ch2.say.line.below' : 'ch2.say.line.above') }));
  }
  sim.text = text;
  const redo = () => { model(); ck.restart(); sim.dirty = true; text(); };
  [sP, sR, sRes].forEach(e => e.addEventListener('input', redo)); cA.addEventListener('change', redo);
  on('#s2Go', 'click', () => { ck.restart(); sim.dirty = true; });
  text();
})();

/* ───────── 03 one day as the operator ───────── */
(() => {
  const cv = $('#opCv'), O = M.operator, SPEED = 0.25; // model hours per real second (a day in 96 s)
  const sT = $('#opT'), sR = $('#opR'), cAuto = $('#opAuto'), bRun = $('#opRun');
  let s = null, hist = [], running = false, lastS = -1;
  const day = () => radioVal('opDay');
  const fNow = () => F0 + O.df(s.G - O.load(s.day, s.t));
  const span = d => { const v = []; for (let h = 0; h <= 24; h += 0.25) v.push(O.load(d, h)); return [Math.floor(Math.min(...v) / 5) * 5 - 5, Math.ceil(Math.max(...v) / 5) * 5 + 5]; };
  function fresh() {
    s = O.create(day()); running = false; hist = [[0, s.G, fNow()]]; lastS = 0;
    sT.value = s.target.toFixed(1);
  }
  function adv(hours) {
    const ramp = +sR.value, auto = cAuto.checked;
    if (!auto) s.target = +sT.value;
    M.advance(s, hours, O.H, (x, h) => { O.step(x, h, ramp, auto); if (x.t - lastS >= 1 / 30 - 1e-9 || x.done) { hist.push([x.t, x.G, fNow()]); lastS = x.t; } });
    if (auto) sT.value = s.target.toFixed(1);
    if (s.done) running = false;
  }
  fresh();
  const sim = reg(cv, {
    step(dt) { if (running && !s.done) { adv(dt * SPEED); this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), [g0, g1] = span(s.day), split = h * 0.62;
      const f1 = frame(w, split, [30, 16, 8, 46], 0, 24, g0, g1);
      yTicks(c, f1, rangeTicks(g0, g1, (g1 - g0) > 25 ? 10 : 5), v => fmt(v));
      axes(c, f1, '', t('ch3.cv.gw'));
      const lp = []; for (let x = 0; x <= 24 + 1e-9; x += 0.1) lp.push([x, O.load(s.day, x)]);
      path(c, lp, f1.X, f1.Y, C.mute, 1.5, [5, 4]);
      path(c, hist.map(q => [q[0], clamp(q[1], g0, g1)]), f1.X, f1.Y, C.gold);
      dot(c, f1.X(s.t), f1.Y(clamp(s.G, g0, g1)), C.gold);
      const f2 = frame(w, h, [split + 24, 16, 38, 46], 0, 24, 49, 51);
      c.fillStyle = 'rgba(122,214,160,.15)'; c.fillRect(f2.L + 1, f2.Y(50.2), f2.R - f2.L - 1, f2.Y(49.8) - f2.Y(50.2));
      yTicks(c, f2, [49, 50, 51], v => fmt(v));
      axes(c, f2, t('ch3.cv.x'), t('ch3.cv.hz'));
      xTicks(c, f2, [0, 6, 12, 18], v => t('unit.hour', { h: v }));
      path(c, hist.map(q => [q[0], clamp(q[2], 49, 51)]), f2.X, f2.Y, C.cyan, 1.8);
      dot(c, f2.X(s.t), f2.Y(clamp(fNow(), 49, 51)), C.cyan, 3.5);
    }
  });
  const clockStr = x => { const m = Math.min(1439, Math.round(x * 60)); return t('unit.clock', { h: String(Math.floor(m / 60)), m: String(m % 60).padStart(2, '0') }); };
  const fStr = f => f < 47.5 ? t('unit.low') : f > 52.5 ? t('unit.high') : fmt(f, 2);
  function text() {
    const d = O.load(s.day, s.t), gap = s.G - d, f = fNow(), c = clockStr(s.t);
    put('#opTo', t('unit.gw', { v: fmt(+sT.value, 1) })); put('#opRo', t('unit.gwh', { v: fmt(+sR.value, 1) }));
    put('#opNow', t('unit.now', { c, d: fmt(d, 1) })); put('#opGap', t('unit.gw', { v: sfmt(gap, 2) }));
    put('#opF', f < 47.5 || f > 52.5 ? fStr(f) : t('unit.hz', { v: fmt(f, 2) }));
    put('#opOut', t('unit.out', { m: fmt(s.out * 60), w: fStr(s.worst) }));
    bRun.textContent = t(reduce ? 'ch3.btn.run' : running ? 'ch3.btn.pause' : s.t > 0 && !s.done ? 'ch3.btn.resume' : 'ch3.btn.run');
    bRun.setAttribute('aria-pressed', String(running)); bRun.disabled = s.done; $('#opHour').disabled = s.done;
    const P = O.P, lim = P.reserve * (P.D + 1 / P.R) * P.R, dev = f - F0, more = gap >= 0, v = { c, gap: fmt(Math.abs(gap), 2), f: fmt(f, 2) };
    let key;
    if (s.done) {
      if (s.out < 1e-9) { key = 'ch3.say.donegood'; v.w = fmt(s.worst, 2); v.r = fmt(+sR.value, 1); }
      else {
        key = s.worst < 47.5 || s.worst > 52.5 ? 'ch3.say.donecrash' : 'ch3.say.donebad'; v.m = fmt(s.out * 60); v.w = fmt(s.worst, 2);
        const auto = O.runDay(s.day, +sR.value, true);
        v.why = auto.out > 1e-9 ? t('ch3.say.why.ramp', { need: fmt(O.maxRamp(s.day).rate, 1), r: fmt(+sR.value, 1) }) : t('ch3.say.why.manual', { auto: fmt(auto.out * 60) });
      }
    } else if (s.t < 1e-9) { key = 'ch3.say.ready'; v.d = fmt(d, 1); }
    else if (f < 47.5) key = 'ch3.say.crashlow';
    else if (f > 52.5) key = 'ch3.say.crashhigh';
    else if (Math.abs(dev) > P.band) key = more ? 'ch3.say.high' : 'ch3.say.low';
    else if (Math.abs(gap) > lim) key = more ? 'ch3.say.edge.more' : 'ch3.say.edge.less';
    else key = more ? 'ch3.say.inband.more' : 'ch3.say.inband.less';
    putHTML('#opSay', t(key, v));
  }
  sim.text = text;
  bRun.addEventListener('click', () => {
    if (s.done) return;
    if (reduce) { adv(24 - s.t); } else running = !running;
    sim.dirty = true; text();
  });
  on('#opHour', 'click', () => { if (s.done) return; running = false; adv(Math.min(1, 24 - s.t)); sim.dirty = true; text(); });
  on('#opReset', 'click', () => { fresh(); sim.dirty = true; text(); });
  sT.addEventListener('input', () => { if (cAuto.checked) cAuto.checked = false; s.target = +sT.value; text(); });
  sR.addEventListener('input', text);
  cAuto.addEventListener('change', () => { if (!cAuto.checked) s.target = +sT.value; text(); });
  radios('opDay').forEach(r => r.addEventListener('change', () => { fresh(); sim.dirty = true; text(); }));
  text();
})();

/* ───────── 04 line loss ───────── */
(() => {
  const cv = $('#lnCv'), Ln = M.line, LV = Ln.levels;
  const sV = $('#lnV'), sP = $('#lnP'), sL = $('#lnL');
  const p = () => ({ V: LV[+sV.value], P: +sP.value, L: +sL.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), P = p(), YM = 40;
      const lg = Math.log10, f = frame(w, h, [30, 18, 38, 46], lg(0.3), lg(1400), 0, YM);
      yTicks(c, f, [0, 10, 20, 30, 40], v => fmt(v) + '%');
      axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      const ticks = w < 460 ? [0.4, 10, 110, 1000] : LV;
      xTicks(c, f, ticks.map(lg), v => fmt(Math.pow(10, v), Math.pow(10, v) < 1 ? 1 : 0));
      const pts = []; for (let x = lg(0.3); x <= lg(1400) + 1e-9; x += 0.01) { const sh = 100 * Ln.share(P.P, Math.pow(10, x), P.L); if (sh <= YM) pts.push([x, sh]); }
      path(c, pts, f.X, f.Y, C.violet, 2);
      for (const V of LV) { const sh = 100 * Ln.share(P.P, V, P.L); if (sh <= YM) dot(c, f.X(lg(V)), f.Y(sh), C.mute, 3); }
      const cur = 100 * Ln.share(P.P, P.V, P.L);
      if (cur <= YM) dot(c, f.X(lg(P.V)), f.Y(cur), C.gold, 6);
      else { // off the top: an arrow at the top edge
        const x = f.X(lg(P.V)); c.fillStyle = C.gold; c.beginPath(); c.moveTo(x, f.T - 2); c.lineTo(x - 6, f.T + 9); c.lineTo(x + 6, f.T + 9); c.closePath(); c.fill();
      }
    }
  });
  function text() {
    const P = p(), I = Ln.current(P.P, P.V), loss = Ln.loss(P.P, P.V, P.L), sh = Ln.share(P.P, P.V, P.L);
    put('#lnVo', t('unit.kv', { v: fmt(P.V, P.V < 1 ? 1 : 0) })); put('#lnPo', t('unit.mw', { v: fmt(P.P) })); put('#lnLo', t('unit.km', { v: fmt(P.L) }));
    put('#lnI', t('unit.a', { v: fmt(I) })); put('#lnLoss', t('unit.mw', { v: fmt(loss, loss < 10 ? 1 : 0) }));
    put('#lnShare', sh > 1 ? t('unit.times', { v: fmt(sh, sh < 10 ? 1 : 0) }) : t('unit.pct', { v: fmt(100 * sh, sh < 0.1 ? 2 : 1) }));
    put('#lnR', t('unit.ohm', { v: fmt(Ln.r * P.L, 1) }));
    const key = sh > 1 ? 'ch4.say.absurd' : sh > 0.2 ? 'ch4.say.bad' : sh > 0.05 ? 'ch4.say.mid' : 'ch4.say.fine';
    putHTML('#lnSay', t(key, { v: fmt(P.V, P.V < 1 ? 1 : 0), i: fmt(I), loss: fmt(loss, loss < 10 ? 1 : 0), share: fmt(100 * sh, sh < 0.1 ? 2 : 1), round: fmt(100 * sh), times: fmt(sh, sh < 10 ? 1 : 0) }));
  }
  sim.text = text;
  [sV, sP, sL].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 05 ideal transformer ───────── */
(() => {
  const cv = $('#txCv'), X = M.xfmr, V1 = 10000;
  const PAIRS = [[50, 1], [40, 1], [26, 1], [20, 1], [10, 1], [5, 1], [2, 1], [1, 1], [1, 2], [1, 5], [1, 10], [1, 20], [1, 50]];
  const sN = $('#txN'), sP = $('#txP');
  const p = () => { const pr = PAIRS[+sN.value]; return { a: pr[0], b: pr[1], ratio: pr[1] / pr[0], P: +sP.value, dc: radioVal('txSrc') === 'dc' }; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), P = p(), T = 0.04, ON = 0.004, mid = h / 2;
      const f1 = frame(w, mid, [26, 16, 10, 46], 0, T, -1.25, 1.25), f2 = frame(w, h, [mid + 20, 16, 38, 46], 0, T, -1.25, 1.25);
      for (const [f, lab] of [[f1, t('ch5.cv.y1')], [f2, t('ch5.cv.y2')]]) { yTicks(c, f, [-1, 0, 1], v => fmt(v)); axes(c, f, f === f2 ? t('ch5.cv.x') : '', lab); }
      const v1 = [], v2 = [];
      for (let i = 0; i <= 400; i++) {
        const tt = T * i / 400;
        if (P.dc) { v1.push([tt, tt < ON ? 0 : 1]); v2.push([tt, 0]); }
        else { v1.push([tt, X.v1(1, tt, false) / Math.SQRT2]); v2.push([tt, X.v2(1, 1, tt, false) / Math.SQRT2]); }
      }
      if (P.dc) { // the switching instant: a brief pulse on the secondary
        const k = Math.round(ON / T * 400); v1.splice(k, 0, [ON, 0]);
        v2.splice(k, 1, [ON, 0], [ON, 1], [ON + 0.0006, 0]);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch5.cv.switch'), f1.X(ON) + 6, f1.Y(0.55));
      }
      path(c, v1, f1.X, f1.Y, C.gold); path(c, v2, f2.X, f2.Y, C.cyan);
    }
  });
  function text() {
    const P = p(), r = X.out(V1, P.ratio, P.P), n = P.ratio < 1 ? P.a / P.b : P.b / P.a;
    put('#txNo', t('unit.ratio', { a: fmt(P.a), b: fmt(P.b) })); put('#txPo', t('unit.kw', { v: fmt(P.P) }));
    put('#txV1', t('unit.v', { v: fmt(V1) }));
    if (P.dc) { put('#txV2', t('unit.v', { v: '0' })); put('#txI', t('unit.ii', { a: '—', b: '0' })); put('#txPw', '—'); }
    else {
      put('#txV2', t('unit.v', { v: fmt(r.V2, r.V2 < 1000 ? 1 : 0) }));
      put('#txI', t('unit.ii', { a: fmt(r.I1, r.I1 < 100 ? 1 : 0), b: fmt(r.I2, r.I2 < 100 ? 1 : 0) }));
      put('#txPw', t('unit.kw', { v: fmt(r.P2) }));
    }
    const key = P.dc ? 'ch5.say.dc' : P.ratio < 1 ? 'ch5.say.down' : P.ratio > 1 ? 'ch5.say.up' : 'ch5.say.same';
    putHTML('#txSay', t(key, { ratio: t('unit.ratio', { a: fmt(P.a), b: fmt(P.b) }), n: fmt(n), v2: fmt(r.V2, r.V2 < 1000 ? 1 : 0), i1: fmt(r.I1, r.I1 < 100 ? 1 : 0), i2: fmt(r.I2, r.I2 < 100 ? 1 : 0) }));
  }
  sim.text = text;
  [sN, sP].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  radios('txSrc').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 06 three phases ───────── */
(() => {
  const cv = $('#tpCv'), cv2 = $('#tp2Cv'), T3 = M.three, D2R = Math.PI / 180;
  const sPhi = $('#tpPhi'), sT = $('#tpT');
  const sim = reg([cv, cv2], {
    draw() {
      const phi = +sPhi.value * D2R, th = +sT.value * D2R, st = T3.stats(phi), ym = Math.max(1.25, st.neutral * 1.12);
      { const { c, w, h } = fit(cv), f = frame(w, h, [28, 16, 38, 46], 0, 360, -ym, ym);
        yTicks(c, f, ym > 2 ? [-3, -2, -1, 0, 1, 2, 3].filter(v => Math.abs(v) <= ym) : [-1, 0, 1], v => fmt(v));
        axes(c, f, t('ch6.cv.x'), t('ch6.cv.y')); xTicks(c, f, [0, 90, 180, 270], v => fmt(v) + '°');
        const cols = [C.gold, C.cyan, C.violet];
        for (let k = 0; k < 3; k++) { const pts = []; for (let d = 0; d <= 360; d += 2) pts.push([d, T3.v(d * D2R, k, phi)]); path(c, pts, f.X, f.Y, cols[k], 1.8); }
        const sp = []; for (let d = 0; d <= 360; d += 2) sp.push([d, T3.sum(d * D2R, phi)]); path(c, sp, f.X, f.Y, C.ink, 1.6, [6, 4]);
        const x = f.X(+sT.value); c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke();
        for (let k = 0; k < 3; k++) dot(c, x, f.Y(T3.v(th, k, phi)), cols[k], 4);
        dot(c, x, f.Y(T3.sum(th, phi)), C.ink, 4); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [26, 16, 30, 46], 0, 360, 0, 3.2);
        yTicks(c, f, [0, 1.5, 3], v => fmt(v, v % 1 ? 1 : 0)); axes(c, f, '', t('ch6.cv.p'));
        const pp = []; for (let d = 0; d <= 360; d += 2) pp.push([d, T3.power(d * D2R, phi)]); path(c, pp, f.X, f.Y, C.green);
        const x = f.X(+sT.value); c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke();
        dot(c, x, f.Y(T3.power(th, phi)), C.green, 4); }
    }
  });
  function text() {
    const phiDeg = +sPhi.value, phi = phiDeg * D2R, th = +sT.value * D2R, st = T3.stats(phi);
    const v = [0, 1, 2].map(k => T3.v(th, k, phi)), s = T3.sum(th, phi), rip = 100 * st.ripple;
    put('#tpPhio', t('unit.deg', { v: fmt(phiDeg) })); put('#tpTo', t('unit.deg', { v: fmt(+sT.value) }));
    put('#tpVals', t('unit.vals', { a: fmt(v[0], 2), b: fmt(v[1], 2), c: fmt(v[2], 2) })); put('#tpSum', fmt(s, 2));
    put('#tpRip', t('unit.pct', { v: fmt(rip) })); put('#tpLine', fmt(T3.lineRatio(phi), 3));
    const key = phiDeg === 120 ? 'ch6.say.120' : phiDeg === 60 ? 'ch6.say.60' : phiDeg === 0 ? 'ch6.say.zero' : 'ch6.say.other';
    putHTML('#tpSay', t(key, { a: fmt(v[0], 2), b: fmt(v[1], 2), c: fmt(v[2], 2), s: fmt(s, 2), rip: fmt(rip), nmax: fmt(st.neutral, 2), phi: fmt(phiDeg) }));
  }
  sim.text = text;
  [sPhi, sT].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 07 merit order ───────── */
const PLANT_COL = { ren: C.green, nuc: C.violet, coal: '#8b93a6', ccgt: C.cyan, peak: C.orange, oil: C.red };
(() => {
  const cv = $('#moCv'), cv2 = $('#mo2Cv'), G = M.merit, D = M.caiso;
  const sH = $('#moH'), sG = $('#moG'), YM = 140, XM = 62;
  const ren = h => D.julySolar[h] + D.julyWind[h];
  const sim = reg([cv, cv2], {
    draw() {
      const h = +sH.value, g = +sG.value, r = G.dispatch(D.julyDemand[h], ren(h), g);
      { const { c, w, h: hh } = fit(cv), f = frame(w, hh, [30, 16, 38, 46], 0, XM, 0, YM);
        yTicks(c, f, [0, 40, 80, 120], v => fmt(v)); axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
        xTicks(c, f, [0, 20, 40, 60], v => fmt(v));
        let x = 0;
        const order = r.stack.slice().sort((a, b) => (a.id === 'nuc' ? -1 : b.id === 'nuc' ? 1 : 0) || 0); // must-run first, as dispatched
        for (const u of order) {
          if (u.cap <= 0) continue;
          const x0 = f.X(x), x1 = f.X(Math.min(XM, x + u.cap)), y = f.Y(Math.min(YM, u.cost)), used = r.run[u.id] || 0;
          c.globalAlpha = 0.28; c.fillStyle = PLANT_COL[u.id]; c.fillRect(x0, Math.min(y, f.B - 3), Math.max(1, x1 - x0 - 1), Math.max(3, f.B - y));
          c.globalAlpha = 0.9; const xu = f.X(Math.min(XM, x + used)); c.fillRect(x0, Math.min(y, f.B - 3), Math.max(0, xu - x0 - (used >= u.cap ? 1 : 0)), Math.max(3, f.B - y));
          c.globalAlpha = 1;
          if (u.cost > YM) { c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(fmt(u.cost), (x0 + x1) / 2, f.T + 24); } // clipped bar: its cost sits inside it, a row below the demand label
          if (u.id === r.marginal) { c.strokeStyle = C.ink; c.lineWidth = 1.5; c.strokeRect(x0 + 0.5, Math.min(y, f.B - 3) + 0.5, Math.max(1, x1 - x0 - 2), Math.max(3, f.B - y) - 1); }
          x += u.cap;
        }
        const xd = f.X(D.julyDemand[h]); c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(xd, f.T + 14); c.lineTo(xd, f.B); c.stroke();
        c.fillStyle = C.ink; c.textAlign = xd > f.R - 40 ? 'right' : 'center'; c.fillText(t('ch7.cv.demand'), xd, f.T + 6);
        hline(c, f, r.price, C.gold, [3, 3], 1); }
      { const { c, w, h: hh } = fit(cv2), day = G.day(g), f = frame(w, hh, [26, 16, 30, 46], -0.5, 23.5, 0, YM);
        yTicks(c, f, [0, 70, 140], v => fmt(v)); axes(c, f, '', t('ch7.cv.day'));
        xTicks(c, f, [0, 6, 12, 18], v => t('unit.hour', { h: v }));
        const bw = (f.X(1) - f.X(0)) * 0.7;
        day.forEach((d, i) => { const y = f.Y(Math.min(YM, d.price)); c.fillStyle = PLANT_COL[d.marginal] || C.mute; c.globalAlpha = i === h ? 1 : 0.45; c.fillRect(f.X(i) - bw / 2, y, bw, f.B - y); });
        c.globalAlpha = 1; }
    }
  });
  function text() {
    const h = +sH.value, g = +sG.value, d = D.julyDemand[h], rn = ren(h), r = G.dispatch(d, rn, g);
    put('#moHo', t('unit.hour', { h })); put('#moGo', t('unit.gas', { v: fmt(g, 1) }));
    put('#moD', t('unit.gw', { v: fmt(d, 1) })); put('#moRen', t('unit.gw', { v: fmt(rn, 1) }));
    put('#moPrice', t('unit.price', { v: fmt(r.price, r.price % 1 ? 1 : 0) })); put('#moMarg', t('plant.' + r.marginal));
    const key = r.unserved > 1e-6 ? 'ch7.say.short' : r.marginal === 'ren' ? 'ch7.say.ren' : 'ch7.say.marg';
    putHTML('#moSay', t(key, { h, d: fmt(d, 1), ren: fmt(rn, 1), res: fmt(Math.max(0, d - rn), 1), plant: t('plant.' + r.marginal), p: fmt(r.price, r.price % 1 ? 1 : 0), c: fmt(r.curtailed, 1), u: fmt(r.unserved, 1) }));
  }
  sim.text = () => {
    text();
    $('#moLegend').innerHTML = M.merit.plants.map(p => `<span><i class="band" style="background:${PLANT_COL[p.id]}"></i>${t('plant.' + p.id)}</span>`).join('');
  };
  [sH, sG].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  sim.text();
})();

/* ───────── 08 net load (duck) ───────── */
(() => {
  const cv = $('#dkCv'), Dk = M.duck, D = M.caiso, G = M.merit;
  const sK = $('#dkK'), cW = $('#dkW');
  const sim = reg(cv, {
    draw() {
      const k = +sK.value, wind = cW.checked, net = Dk.net(k, wind), st = Dk.stats(net);
      const { c, w, h } = fit(cv), y0 = Math.min(0, Math.floor(st.min / 5) * 5), y1 = 25;
      const f = frame(w, h, [30, 16, 38, 46], 0, 24, y0, y1);
      yTicks(c, f, rangeTicks(y0, y1, 5), v => fmt(v)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
      xTicks(c, f, [0, 6, 12, 18], v => t('unit.hour', { h: v }));
      hline(c, f, 0, C.line, [], 1);
      const X = hh => hh + 0.5, base = D.aprDemand.map((d, i) => d - (wind ? D.aprWind[i] : 0));
      c.fillStyle = 'rgba(233,185,73,.30)'; c.beginPath();
      base.forEach((v, i) => c[i ? 'lineTo' : 'moveTo'](f.X(X(i)), f.Y(v)));
      for (let i = 23; i >= 0; i--) c.lineTo(f.X(X(i)), f.Y(Math.max(y0, net[i])));
      c.closePath(); c.fill();
      path(c, D.aprDemand.map((d, i) => [X(i), d]), f.X, f.Y, C.mute, 1.5, [5, 4]);
      hline(c, f, Dk.floor, C.red);
      path(c, net.map((v, i) => [X(i), Math.max(y0, v)]), f.X, f.Y, C.cyan);
      dot(c, f.X(X(st.tMin)), f.Y(Math.max(y0, st.min)), C.cyan); dot(c, f.X(X(st.tMax)), f.Y(st.max), C.cyan);
    }
  });
  function text() {
    const k = +sK.value, wind = cW.checked, net = Dk.net(k, wind), st = Dk.stats(net);
    const pr = G.dispatch(D.aprDemand[st.tMin], D.aprSolar[st.tMin] * k + (wind ? D.aprWind[st.tMin] : 0), 3);
    put('#dkKo', t('unit.times', { v: fmt(k, 1) }));
    put('#dkMin', t('unit.gwat', { v: fmt(st.min, 1), h: st.tMin })); put('#dkMax', t('unit.gwat', { v: fmt(st.max, 1), h: st.tMax }));
    put('#dkRamp', t('unit.gw', { v: fmt(st.ramp3, 1) })); put('#dkCurt', t('unit.gwh2', { v: fmt(st.curtail, 1) }));
    const key = k === 0 ? 'ch8.say.none' : st.curtail > 1e-9 ? 'ch8.say.curt' : 'ch8.say.dip';
    putHTML('#dkSay', t(key, { k: fmt(k, 1), min: fmt(st.min, 1), max: fmt(st.max, 1), th: st.tMax, tr: st.tRamp, ramp: fmt(st.ramp3, 1), curt: fmt(st.curtail, 1), tm: st.tMin, price: t('unit.price', { v: fmt(pr.price, pr.price % 1 ? 1 : 0) }) }));
  }
  sim.text = text;
  sK.addEventListener('input', () => { sim.dirty = true; text(); }); cW.addEventListener('change', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 09 storage (on the ch8 day) ───────── */
(() => {
  const cv = $('#stCv'), Sg = M.storage, Dk = M.duck;
  const sP = $('#stP'), sE = $('#stE'), sEta = $('#stEta'), net = Dk.net(1, true), before = Dk.stats(net);
  let r = null;
  const model = () => { r = Sg.plan(net, +sP.value, +sE.value, +sEta.value / 100); r.st = Dk.stats(r.after); };
  model();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 16, 38, 46], 0, 24, 0, 25);
      yTicks(c, f, [0, 5, 10, 15, 20, 25], v => fmt(v)); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
      xTicks(c, f, [0, 6, 12, 18], v => t('unit.hour', { h: v }));
      const bw = (f.X(1) - f.X(0)) * 0.7;
      for (let i = 0; i < 24; i++) {
        const x = f.X(i + 0.5) - bw / 2;
        if (r.inn[i] > 1e-6) { c.fillStyle = 'rgba(122,214,160,.55)'; c.fillRect(x, f.Y(r.inn[i]), bw, f.B - f.Y(r.inn[i])); }
        if (r.out[i] > 1e-6) { c.fillStyle = 'rgba(240,163,94,.6)'; c.fillRect(x, f.Y(r.out[i]), bw, f.B - f.Y(r.out[i])); }
      }
      hline(c, f, Dk.floor, C.red, [2, 4], 1);
      path(c, net.map((v, i) => [i + 0.5, Math.max(0, v)]), f.X, f.Y, C.mute, 1.5, [5, 4]);
      path(c, r.after.map((v, i) => [i + 0.5, Math.max(0, v)]), f.X, f.Y, C.cyan);
    }
  });
  function text() {
    put('#stPo', t('unit.gw', { v: fmt(+sP.value, 1) })); put('#stEo', t('unit.gwh2', { v: fmt(+sE.value) })); put('#stEtao', t('unit.pct', { v: fmt(+sEta.value) }));
    put('#stPeak', t('unit.arrow', { a: fmt(before.max, 1), b: fmt(r.st.max, 1) })); put('#stRamp', t('unit.arrow', { a: fmt(before.ramp3, 1), b: fmt(r.st.ramp3, 1) }));
    put('#stIn', t('unit.inout', { a: fmt(r.Ein, 1), b: fmt(r.Eout, 1) })); put('#stLost', t('unit.gwh2', { v: fmt(r.lost, 1) }));
    const P = +sP.value, E = +sE.value;
    let key;
    if (P <= 0 || E <= 0) key = 'ch9.say.none';
    else if (r.V >= r.T - 0.05) key = 'ch9.say.flat';
    else if (r.Eout >= E - 1e-3) key = 'ch9.say.energy';
    else key = 'ch9.say.power';
    putHTML('#stSay', t(key, { peak: fmt(before.max, 1), after: fmt(r.st.max, 1), curt: fmt(r.curtBefore, 1), out: fmt(r.Eout, 1), inn: fmt(r.Ein, 1), lost: fmt(r.lost, 1), p: fmt(P, 1) }));
  }
  sim.text = text;
  [sP, sE, sEta].forEach(e => e.addEventListener('input', () => { model(); sim.dirty = true; text(); }));
  text();
})();

/* ───────── 10 cascade on a six-bus grid (ch2's swing equation per island) ───────── */
(() => {
  const cv = $('#boCv'), cv2 = $('#bo2Cv'), N = M.net6, UNTIL = 40, SPEED = 4;
  const sL = $('#boL'), cU = $('#boU');
  const POS = [[0.1, 0.78], [0.5, 0.13], [0.9, 0.78], [0.3, 0.5], [0.7, 0.5], [0.5, 0.9]];
  let st = null, started = false, hist = [], maxRatio = 0, lastS = -1;
  const ev = () => radioVal('boEv');
  function fresh() { st = N.create(+sL.value, cU.checked); started = false; hist = []; maxRatio = 0; lastS = -1; }
  function record() { hist.push([st.t, ...[3, 4, 5].map(i => st.dead[i] ? null : N.freq(st, i))]); }
  function adv(span) {
    M.advance(st, span, N.P.H, x => { if (x.t >= UNTIL - 1e-9) return; N.step(x, N.P.H); N.lines.forEach((l, i) => { if (x.lineOn[i]) maxRatio = Math.max(maxRatio, Math.abs(x.flow[i]) / l.lim); }); if (x.t - lastS >= 0.1 - 1e-9) { record(); lastS = x.t; } });
  }
  function go() {
    fresh(); started = true; record(); lastS = 0;
    const a = ev(); if (a === 'genA') N.tripGen(st, 0); else N.tripLine(st, +a);
    N.solve(st);
    if (reduce) adv(UNTIL);
  }
  fresh();
  const done = () => started && st.t >= UNTIL - 1e-6;
  const sim = reg([cv, cv2], {
    // a cascade the reader started keeps running if they scroll down to read the sentence; it only draws on screen
    busy: () => started && !done(),
    step(dt) { if (started && !done()) { adv(dt * SPEED); this.dirty = true; text(); } if (this.dirty && this.vis) { this.draw(); this.dirty = false; } },
    draw() {
      { const { c, w, h } = fit(cv), pad = 30, P = i => [pad + (w - 2 * pad) * POS[i][0], pad + (h - 2 * pad) * POS[i][1]];
        N.lines.forEach((l, i) => {
          const [x1, y1] = P(l.a), [x2, y2] = P(l.b), ratio = Math.abs(st.flow[i]) / l.lim;
          c.lineWidth = st.lineOn[i] ? 3 + 4 * Math.min(1, ratio) : 2;
          c.strokeStyle = !st.lineOn[i] ? C.mute : ratio > 1 ? C.red : ratio > 0.85 ? C.gold : C.green;
          c.setLineDash(st.lineOn[i] ? [] : [6, 5]); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
        });
        N.buses.forEach((b, i) => {
          const [x, y] = P(i), r = 15;
          if (b.gen) { const g = st.gen[i]; c.fillStyle = g.on ? C.gold : C.dimfill; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
          else { c.fillStyle = st.dead[i] ? C.dimfill : C.cyan; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
          c.fillStyle = '#0c0e13'; c.textAlign = 'center'; c.font = '600 13px -apple-system,system-ui,sans-serif'; c.fillText(t('bus.' + b.id), x, y + 1); c.font = FONT;
        }); }
      { const { c, w, h } = fit(cv2), f = frame(w, h, [26, 16, 30, 46], 0, UNTIL, 47, 50.5);
        yTicks(c, f, [47, 48, 49, 50], v => fmt(v)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
        xTicks(c, f, [0, 10, 20, 30], v => fmt(v));
        hline(c, f, 48.8, C.red);
        const cols = [C.cyan, C.violet, C.orange];
        for (let k = 0; k < 3; k++) {
          let run = [];
          const flush = () => { path(c, run, f.X, f.Y, cols[k], 1.8); run = []; };
          for (const q of hist) { if (q[k + 1] == null) { flush(); continue; } run.push([q[0], clamp(q[k + 1], 47, 50.5)]); }
          flush();
        } }
    }
  });
  function text() {
    const total = st.load0.reduce((a, b) => a + b, 0), served = N.served(st);
    put('#boLo', t('unit.load', { v: fmt(+sL.value, 2), mw: fmt(total) }));
    const alive = [3, 4, 5].filter(i => !st.dead[i]);
    const minF = hist.length ? Math.min(...hist.flatMap(q => q.slice(1).filter(x => x != null))) : F0;
    put('#boF', t('unit.hz', { v: fmt(minF, 2) })); put('#boShed', t('unit.mw', { v: fmt(st.shed) }));
    put('#boDark', t('unit.mw', { v: fmt(st.lost) })); put('#boLines', t('unit.lines', { v: fmt(st.lineOn.filter(x => !x).length) }));
    let key, v = { mw: fmt(total), f: fmt(minF, 2), shed: fmt(st.shed), pct: fmt(100 * st.shed / total), dark: fmt(st.lost), served: fmt(100 * served / total), n: fmt(st.lineOn.filter(x => !x).length), t: fmt(st.t) };
    if (!started) key = 'ch10.say.ready';
    else if (!done()) key = 'ch10.say.running';
    else if (!alive.length || served < 1e-6) {
      key = st.shed > 1e-6 ? 'ch10.say.black' : 'ch10.say.black0';
      const linesOut = st.lineOn.filter(x => !x).length, a = ev();
      v.why = t(linesOut >= 2 ? 'ch10.say.why.cascade' : !st.ufls ? 'ch10.say.why.noufls' : 'ch10.say.why.deficit');
      if (a !== 'genA' && linesOut < 2 && !st.ufls) v.why = t('ch10.say.why.noufls');
    }
    else if (st.lost > 1e-6) key = 'ch10.say.partial';
    else if (st.shed > 1e-6) key = 'ch10.say.shed';
    else { key = maxRatio > 1 ? 'ch10.say.calmhot' : 'ch10.say.calm'; v.note = t(ev() === 'genA' ? 'ch10.say.calmgen' : 'ch10.say.calmline'); }
    putHTML('#boSay', t(key, v));
  }
  sim.text = text;
  on('#boGo', 'click', () => { go(); sim.dirty = true; text(); });
  on('#boReset', 'click', () => { fresh(); sim.dirty = true; text(); });
  sL.addEventListener('input', () => { fresh(); sim.dirty = true; text(); });
  cU.addEventListener('change', () => { fresh(); sim.dirty = true; text(); });
  radios('boEv').forEach(r => r.addEventListener('change', () => { fresh(); sim.dirty = true; text(); }));
  text();
})();

/* ───────── loop ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  for (const s of sims) {
    if (!s.vis && !(s.busy && s.busy())) continue;
    if (s.step) s.step(dt);
    if (s.vis && s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
