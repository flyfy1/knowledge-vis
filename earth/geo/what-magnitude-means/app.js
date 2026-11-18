/* What "magnitude 7" means: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const Q = window.QuakeModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = Q.clamp;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const has = key => (COPY[lang] && COPY[lang][key] != null) || (COPY.zh && COPY.zh[key] != null);
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const effLang = () => (COPY[lang] ? lang : 'zh');
const locale = () => (effLang() === 'zh' ? 'zh-CN' : 'en-US');
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString(locale(), { minimumFractionDigits: d, maximumFractionDigits: d });
}
// 3 significant figures, without grouping surprises
const sig = (x, n = 2) => { if (!isFinite(x)) return '—'; if (x === 0) return '0'; const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(x)))); return fmt(x, Math.min(d, 6)); };
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function sci(x, d = 1) {
  if (!(x > 0)) return '—';
  let e = Math.floor(Math.log10(x)), m = +(x / Math.pow(10, e)).toFixed(d);
  if (m >= 10) { m = 1; e++; }
  const es = (e < 0 ? '⁻' : '') + String(Math.abs(e)).split('').map(c => SUP[+c]).join('');
  return fmt(m, d) + ' × 10' + es;
}
// large counts: 10^4 / 10^8 units in Chinese, million/billion in English (keys from copy; scientific notation if a key is missing)
function big(x) {
  if (!isFinite(x)) return '—';
  if (x < 1e4) return fmt(x, x < 10 ? 1 : 0);
  const zh = effLang() === 'zh';
  const steps = zh ? [[1e8, 'num.yi'], [1e4, 'num.wan']] : [[1e9, 'num.billion'], [1e6, 'num.million']];
  for (const [u, k] of steps) if (x >= u && has(k) && x / u < 1e4) return t(k, { v: fmt(x / u, x / u < 10 ? 1 : 0) });
  if (!zh && x < 1e6) return fmt(x, 0);
  return sci(x);
}
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === effLang())));
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; if (s.vis && s.onShow) s.onShow(); } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
// a slider's output text doubles as its accessible value
const out = (slider, sel, s) => { put(sel, s); slider.setAttribute('aria-valuetext', s); };

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
function xTicks(c, f, vals, fmtv, minGap = 34) {
  c.fillStyle = C.mute; c.textAlign = 'center'; let lastX = -1e9;
  vals.forEach(v => { const x = f.X(v); if (x - lastX < minGap) return; lastX = x; c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function label(c, s, x, y, col, align = 'left') { c.fillStyle = col; c.textAlign = align; c.fillText(s, x, y); }
const tw = (c, s) => c.measureText(s).width;

/* ───────── 01 one block ───────── */
(() => {
  const cv = $('#bkCv'), B = Q.block, SPAN = 300, FF = 20; // years per real second while sticking; the slip plays in real time
  const sV = $('#bkV'), sD = $('#bkD');
  const p = () => ({ v: +sV.value, drop: +sD.value / 2 });
  let s, hist;
  function fresh() {
    s = B.create(p()); hist = [[0, s.F]];
    if (reduce) { // jump: run the model through 300 years at once
      let guard = 0;
      while (s.t < SPAN * 0.97 && guard++ < 1000) { if (s.phase === 'stick') { const left = B.load(s, SPAN * 0.97 - s.t, p()); hist.push([s.t, s.F]); if (!left) break; } else { B.slide(s, B.DUR, p()); hist.push([s.t, s.F]); } }
    }
  }
  fresh();
  const sim = reg(cv, {
    step(dt) {
      if (reduce) { if (this.dirty) { this.draw(); this.dirty = false; } return; }
      if (s.phase === 'stick') { B.load(s, dt * FF, p()); hist.push([s.t, s.F]); }
      else { B.slide(s, dt, p()); hist.push([s.t, s.F]); }
      while (hist.length > 2 && hist[1][0] < s.t - SPAN) hist.shift();
      this.draw(); text();
    },
    draw() {
      const { c, w, h } = fit(cv), P = p(), top = Math.round(h * 0.36);
      // ── cartoon: ground scrolls with the block, so a slip makes the ground jump back
      const gy = top - 18, bw = 64, bh = 34, bx = Math.round(w * 0.32), pxPerM = 28;
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(0, gy); c.lineTo(w, gy); c.stroke();
      const off = ((s.x * pxPerM) % 40 + 40) % 40;
      c.strokeStyle = C.dim; for (let x = -off; x < w; x += 40) { c.beginPath(); c.moveTo(x, gy + 2); c.lineTo(x - 8, gy + 12); c.stroke(); }
      c.fillStyle = s.phase === 'slip' ? 'rgba(233,185,73,.85)' : '#3a4254'; c.fillRect(bx, gy - bh, bw, bh);
      label(c, t('ch1.cv.block'), bx + bw / 2, gy - bh / 2, s.phase === 'slip' ? '#14161c' : C.ink, 'center');
      // spring: stretch grows with force above the floor
      const floor = B.FS - 6, stretch = (s.F - floor) / (B.FS - floor), sx0 = bx + bw, sx1 = sx0 + 40 + stretch * Math.max(60, w * 0.3);
      c.strokeStyle = C.cyan; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx0, gy - bh / 2);
      const coils = 12; for (let i = 1; i <= coils; i++) c.lineTo(sx0 + (sx1 - sx0) * i / coils, gy - bh / 2 + (i % 2 ? -7 : 7) * (i < coils ? 1 : 0));
      c.stroke();
      c.fillStyle = C.mute; c.fillRect(sx1, gy - bh - 8, 6, bh + 8);
      const pl = t('ch1.cv.plate'), pw = tw(c, pl); label(c, pl, clamp(sx1 + 3 - pw / 2, 6, w - pw - 6), gy - bh - 16, C.mute);
      const mode = s.phase === 'slip' ? t('ch1.cv.slow') : t('ch1.cv.ff');
      if (!reduce) label(c, mode, 8, 14, s.phase === 'slip' ? C.gold : C.mute);
      // ── force trace
      const x0 = Math.max(0, s.t - SPAN), f = frame(w, h, [top + 22, 12, 34, 44], x0, x0 + SPAN, floor - 0.4, B.FS + 0.6);
      axes(c, f, t('ch1.cv.time'), t('ch1.cv.force'));
      const tk = []; for (let v = Math.ceil(x0 / 50) * 50; v <= x0 + SPAN; v += 50) tk.push(v);
      xTicks(c, f, tk, v => fmt(v));
      c.strokeStyle = C.red; c.lineWidth = 1.3; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.L, f.Y(B.FS)); c.lineTo(f.R, f.Y(B.FS)); c.stroke(); c.setLineDash([]);
      path(c, hist.filter(q => q[0] >= x0), f.X, f.Y, C.cyan);
      for (const e of s.events) if (e.t >= x0) dot(c, f.X(e.t), f.Y(B.FS), C.gold, 4);
      dot(c, f.X(s.t), f.Y(s.F), C.cyan, 4);
    }
  });
  function text() {
    const P = p(), T = B.recurrence(P), rate = P.v / 100, left = Math.max(0, (B.FS - s.F) / rate);
    const last = s.events.length ? s.events[s.events.length - 1].t : null, since = last == null ? s.t : s.t - last;
    out(sV, '#bkVo', t('ch1.unit.v', { v: fmt(P.v) })); out(sD, '#bkDo', t('ch1.unit.d', { v: fmt(2 * P.drop, 1) }));
    put('#bkSince', t('ch1.unit.yr', { v: fmt(since, 0) })); put('#bkPct', s.phase === 'slip' ? '—' : t('ch1.unit.yr', { v: fmt(left, 0) }));
    put('#bkT', t('ch1.unit.yr', { v: fmt(T, T < 100 ? 1 : 0) })); put('#bkRatio', t('ch1.unit.x', { v: big(B.ratio(P)) }));
    const key = s.phase === 'slip' ? 'ch1.say.slip' : (last == null ? 'ch1.say.first' : 'ch1.say.stick');
    putHTML('#bkSay', t(key, { since: fmt(since, 0), left: fmt(left, 0), T: fmt(T, T < 100 ? 1 : 0), d: fmt(2 * P.drop, 1) }));
  }
  sim.text = text;
  [sV, sD].forEach(e => e.addEventListener('input', () => { if (reduce) fresh(); sim.dirty = true; text(); }));
  text();
})();

/* ───────── 02 moment magnitude ───────── */
(() => {
  const cv = $('#mgCv'), G = Q.mag;
  const LV = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40, 50, 60, 70, 80, 100, 120, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1300];
  const WV = [1, 1.5, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 17, 20, 25, 30, 35, 40, 50, 60, 70, 80, 100, 120, 140, 160, 180, 200];
  const DV = [0.01, 0.02, 0.03, 0.05, 0.07, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30, 35, 40, 50];
  const sL = $('#mgL'), sW = $('#mgW'), sD = $('#mgD');
  const val = () => ({ L: LV[+sL.value], W: WV[+sW.value], D: DV[+sD.value] });
  const REF = G.mw(G.moment(40, 20, 1.5));
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), v = val(), M = G.mw(G.moment(v.L, v.W, v.D)), E = G.energy(M);
      // ── fault rectangle at a scale that fits both the fault and the 40 × 20 km reference
      const boxH = Math.round(h * 0.5), pad = 16, availW = w - 2 * pad, availH = boxH - 64;
      const span = Math.max(v.L / availW, v.W / availH, 40 / availW, 20 / availH);
      const k = 1 / span; // px per km
      label(c, t('ch2.cv.fault'), pad, 12, C.mute);
      const cx = pad, cy = 30;
      c.strokeStyle = C.mute; c.setLineDash([4, 4]); c.lineWidth = 1; c.strokeRect(cx, cy, 40 * k, 20 * k); c.setLineDash([]);
      const fw = Math.max(2, v.L * k), fh = Math.max(2, v.W * k);
      c.fillStyle = 'rgba(233,185,73,.28)'; c.fillRect(cx, cy, fw, fh); c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(cx, cy, fw, fh);
      // reference label only when it does not sit inside the coloured fault
      const rl = t('ch2.cv.ref');
      if (40 * k + 8 + tw(c, rl) < w - pad && (fw < 40 * k + 8 + tw(c, rl) || fh < 14)) { if (!(fw > 40 * k && fh > 20 * k)) label(c, rl, cx + 40 * k + 8, cy + 10, C.mute); }
      // scale bar
      const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      let bar = nice[0]; for (const n of nice) if (n * k <= availW * 0.35) bar = n;
      const by = boxH - 6, bx = w - pad - bar * k;
      c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + bar * k, by); c.stroke();
      const bl = t('ch2.cv.scale', { v: fmt(bar) }); label(c, bl, bx + bar * k, by - 10, C.ink, 'right');
      // ── energy ruler, log10 J from 8 to 21
      const f = frame(w, h, [boxH + 46, 16, 60, 16], 8, 21, 0, 1), ay = f.Y(0.5);
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, ay); c.lineTo(f.R, ay); c.stroke();
      for (let e = 8; e <= 21; e++) { const x = f.X(e); c.beginPath(); c.moveTo(x, ay - 3); c.lineTo(x, ay + 3); c.stroke(); }
      label(c, t('ch2.cv.energy'), f.R, f.B + 34, C.mute, 'right');
      // magnitude ticks above the axis
      label(c, t('ch2.cv.mag'), f.L, ay - 30, C.mute);
      const mlw = tw(c, t('ch2.cv.mag')) + f.L + 8; let lastX = -1e9;
      for (let m = 3; m <= 10; m++) { const x = f.X(Math.log10(G.energy(m))); if (x < mlw || x > f.R || x - lastX < 22) continue; lastX = x; c.strokeStyle = C.dim; c.beginPath(); c.moveTo(x, ay - 10); c.lineTo(x, ay); c.stroke(); label(c, fmt(m), x, ay - 18, C.mute, 'center'); }
      // references below the axis, staggered into rows so labels never collide
      const refs = [['ch2.cv.tnt', G.REF.tnt], ['ch2.cv.hiro', G.REF.hiroshima], ['ch2.cv.world', G.REF.world]];
      let rowEnd = [-1e9, -1e9];
      refs.forEach(([key, e]) => {
        const x = f.X(Math.log10(e)), s = t(key), wd = tw(c, s);
        let lx = clamp(x - wd / 2, 8, w - wd - 10), row = lx > rowEnd[0] + 8 ? 0 : 1;
        rowEnd[row] = lx + wd;
        c.strokeStyle = C.violet; c.beginPath(); c.moveTo(x, ay); c.lineTo(x, ay + 12 + row * 16); c.stroke();
        label(c, s, lx, ay + 20 + row * 16, C.violet);
      });
      const ex = f.X(clamp(Math.log10(E), 8, 21));
      c.fillStyle = C.gold; c.beginPath(); c.moveTo(ex, ay - 2); c.lineTo(ex - 7, ay - 14); c.lineTo(ex + 7, ay - 14); c.closePath(); c.fill();
      dot(c, ex, ay, C.gold, 5);
    }
  });
  function text() {
    const v = val(), M0 = G.moment(v.L, v.W, v.D), M = G.mw(M0), E = G.energy(M);
    out(sL, '#mgLo', t('ch2.unit.km', { v: fmt(v.L, v.L < 10 && v.L % 1 ? 1 : 0) }));
    out(sW, '#mgWo', t('ch2.unit.km', { v: fmt(v.W, v.W < 10 && v.W % 1 ? 1 : 0) }));
    out(sD, '#mgDo', t('ch2.unit.m', { v: fmt(v.D, v.D < 0.1 ? 2 : v.D < 1 ? 2 : v.D < 10 && v.D % 1 ? 1 : 0) }));
    put('#mgMw', fmt(M, 1)); put('#mgM0', sci(M0)); put('#mgE', sci(E));
    const nb = E / Q.mag.REF.hiroshima;
    if (nb >= 0.5) { put('#mgCmpL', t('ch2.read.hiro')); put('#mgCmp', t('ch2.unit.bomb', { v: big(nb) })); }
    else { put('#mgCmpL', t('ch2.read.tnt')); put('#mgCmp', t('ch2.unit.tnt', { v: big(E / Q.mag.REF.tnt) })); }
    const dM = Math.round(M * 10) / 10 - Math.round(REF * 10) / 10, ratio = Math.pow(10, 1.5 * Math.abs(M - REF));
    const key = Math.abs(dM) < 0.05 ? 'ch2.say.same' : dM > 0 ? 'ch2.say.bigger' : 'ch2.say.smaller';
    putHTML('#mgSay', t(key, { M: fmt(M, 1), dM: fmt(Math.abs(dM), 1), ratio: big(ratio) }));
  }
  sim.text = text;
  [sL, sW, sD].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 03 intensity ───────── */
(() => {
  const cv = $('#inCv'), I = Q.ipe, XMAX = 300;
  const sM = $('#inM'), sH = $('#inH'), sR = $('#inR'), cCmp = $('#inCmp');
  const P = () => ({ M: +sM.value, h: +sH.value, r: +sR.value, F: +radioVal('inG'), cmp: cCmp.checked });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = P(), f = frame(w, h, [30, 14, 40, 46], 0, XMAX, 1, 11);
      // intensity bands as horizontal guides with roman labels
      c.fillStyle = C.mute; c.textAlign = 'right';
      for (let k = 1; k <= 11; k++) { const y = f.Y(k); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); if (k <= 10) c.fillText(ROMAN[k], f.L - 6, f.Y(k + 0.5)); }
      axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
      xTicks(c, f, [0, 50, 100, 150, 200, 250, 300], v => fmt(v));
      const pts = [], up = [], dn = [];
      for (let r = 0; r <= XMAX; r += 2) { const m = I.mmi(p.M, r, p.h, p.F), sd = I.sigma(I.hypo(r, p.h)); pts.push([r, m]); up.push([r, m + sd]); dn.push([r, m - sd]); }
      const cy = v => f.Y(clamp(v, 1, 11));
      c.fillStyle = 'rgba(99,199,230,.14)'; c.beginPath(); up.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](f.X(q[0]), cy(q[1]))); for (let i = dn.length - 1; i >= 0; i--) c.lineTo(f.X(dn[i][0]), cy(dn[i][1])); c.closePath(); c.fill();
      c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
      if (p.cmp) { c.setLineDash([6, 4]); path(c, pts.map(q => [q[0], I.mmi(5.5, q[0], 5, p.F)]), f.X, cy, C.violet, 1.8); c.setLineDash([]); }
      path(c, pts, f.X, cy, C.cyan);
      c.restore();
      const ti = I.mmi(p.M, p.r, p.h, p.F);
      c.strokeStyle = 'rgba(233,185,73,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(p.r), f.B); c.lineTo(f.X(p.r), cy(ti)); c.stroke();
      dot(c, f.X(p.r), cy(ti), C.gold, 6);
    }
  });
  function text() {
    const p = P(), R = I.hypo(p.r, p.h), v = I.mmi(p.M, p.r, p.h, p.F), lv = I.level(v), reach = I.reach(p.M, p.h, p.F, 5.5);
    out(sM, '#inMo', t('ch3.unit.m', { v: fmt(p.M, 1) })); out(sH, '#inHo', t('ch3.unit.km', { v: fmt(p.h) })); out(sR, '#inRo', t('ch3.unit.km', { v: fmt(p.r) }));
    put('#inRh', t('ch3.unit.km', { v: fmt(R, 0) })); put('#inI', t('ch3.unit.i', { roman: ROMAN[lv], v: fmt(v, 1) }));
    put('#inReach', reach <= 0 ? t('ch3.unit.none') : reach >= 2000 ? '> ' + t('ch3.unit.km', { v: fmt(2000) }) : t('ch3.unit.km', { v: fmt(reach, 0) }));
    const cv5 = I.mmi(5.5, p.r, 5, p.F);
    put('#inCmpI', p.cmp ? t('ch3.unit.i', { roman: ROMAN[I.level(cv5)], v: fmt(cv5, 1) }) : '—');
    let s = t(p.r === 0 ? 'ch3.say0' : 'ch3.say', { r: fmt(p.r), rh: fmt(R, 0), roman: ROMAN[lv], desc: t('ch3.mmi.' + lv) });
    const lc = I.level(cv5);
    if (p.cmp) s += ' ' + t(lc > lv ? 'ch3.say.cmpwins' : lc === lv ? 'ch3.say.cmpsame' : 'ch3.say.cmploses', { croman: ROMAN[lc] });
    putHTML('#inSay', s);
  }
  sim.text = text;
  [sM, sH, sR].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  cCmp.addEventListener('change', () => { sim.dirty = true; text(); });
  radios('inG').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 04a locating ───────── */
(() => {
  const cv = $('#lcCv'), Lc = Q.loc, H = 10, MW = 240, MH = 160, SPEED = 8;
  const sX = $('#lcX'), sY = $('#lcY'), bGo = $('#lcGo');
  const ST = Lc.STATIONS, NAMES = ['A', 'B', 'C'];
  let clock = null; // seconds after rupture start, or null when idle
  const ep = () => ({ x: +sX.value, y: +sY.value });
  const tEnd = () => { const e = ep(); return Math.max(...ST.map(s => Math.hypot(Lc.dist(s, e), H) / Lc.VS)) + 2; };
  let geo = null;
  const sim = reg(cv, {
    step(dt) {
      if (clock != null && !reduce) { clock += dt * SPEED; if (clock >= tEnd()) { clock = null; bGo.textContent = t('ch4.btn.go'); } this.dirty = true; text(); }
      if (this.dirty) { this.draw(); this.dirty = false; }
    },
    draw() {
      const { c, w, h } = fit(cv), k = Math.min((w - 16) / MW, (h - 16) / MH), ox = (w - MW * k) / 2, oy = (h - MH * k) / 2;
      geo = { k, ox, oy };
      const X = x => ox + x * k, Y = y => oy + y * k;
      c.fillStyle = '#11151d'; c.fillRect(ox, oy, MW * k, MH * k);
      c.strokeStyle = C.grid; c.lineWidth = 1;
      for (let x = 0; x <= MW; x += 40) { c.beginPath(); c.moveTo(X(x), oy); c.lineTo(X(x), oy + MH * k); c.stroke(); }
      for (let y = 0; y <= MH; y += 40) { c.beginPath(); c.moveTo(ox, Y(y)); c.lineTo(ox + MW * k, Y(y)); c.stroke(); }
      const e = ep();
      c.save(); c.beginPath(); c.rect(ox, oy, MW * k, MH * k); c.clip();
      // distance circles from S−P (depth known: epicentral distance)
      c.setLineDash([5, 4]); c.strokeStyle = C.mute; c.lineWidth = 1.2;
      ST.forEach(s => { const d = Lc.dist(s, e); c.beginPath(); c.arc(X(s.x), Y(s.y), d * k, 0, 6.283); c.stroke(); });
      c.setLineDash([]);
      // wavefronts
      const tt = reduce && clock != null ? clock : clock;
      if (tt != null) {
        for (const [v, col] of [[Lc.VP, C.cyan], [Lc.VS, C.gold]]) { const R = v * tt; if (R > H) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(X(e.x), Y(e.y), Math.sqrt(R * R - H * H) * k, 0, 6.283); c.stroke(); } }
      }
      c.restore();
      // stations
      ST.forEach((s, i) => {
        const R = Math.hypot(Lc.dist(s, e), H), pA = tt != null && tt >= R / Lc.VP, sA = tt != null && tt >= R / Lc.VS;
        c.fillStyle = sA ? C.gold : pA ? C.cyan : C.green; c.beginPath(); c.moveTo(X(s.x), Y(s.y) - 8); c.lineTo(X(s.x) - 7, Y(s.y) + 5); c.lineTo(X(s.x) + 7, Y(s.y) + 5); c.closePath(); c.fill();
        label(c, NAMES[i], X(s.x) + 10, Y(s.y) - 6, C.ink);
      });
      // epicentre
      c.strokeStyle = C.red; c.lineWidth = 2.5; const ex = X(e.x), ey = Y(e.y);
      c.beginPath(); c.moveTo(ex - 7, ey - 7); c.lineTo(ex + 7, ey + 7); c.moveTo(ex + 7, ey - 7); c.lineTo(ex - 7, ey + 7); c.stroke();
      // scale bar
      const sb = t('ch4.cv.scale'); c.strokeStyle = C.ink; c.lineWidth = 2; const sx = ox + MW * k - 10 - 50 * k, sy = oy + MH * k - 10;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 50 * k, sy); c.stroke(); label(c, sb, sx + 50 * k, sy - 10, C.ink, 'right');
    }
  });
  function text() {
    const e = ep(), sp = ST.map(s => Lc.sp(Math.hypot(Lc.dist(s, e), H))), d = ST.map(s => Lc.dist(s, e));
    out(sX, '#lcXo', t('ch4.unit.km', { v: fmt(e.x) })); out(sY, '#lcYo', t('ch4.unit.km', { v: fmt(e.y) }));
    ['#lcA', '#lcB', '#lcC'].forEach((id, i) => put(id, t('ch4.unit.sp', { sp: fmt(sp[i], 1), d: fmt(Math.sqrt(Math.pow(Lc.distFromSp(sp[i]), 2) - H * H), 0) })));
    put('#lcClock', clock == null ? '—' : t('ch4.unit.s', { v: fmt(clock, 1) }));
    if (clock != null) {
      const Rs = ST.map(s => Math.hypot(Lc.dist(s, e), H));
      putHTML('#lcSay', t('ch4.say.run', { t: fmt(clock, 0), np: fmt(Rs.filter(R => clock >= R / Lc.VP).length), ns: fmt(Rs.filter(R => clock >= R / Lc.VS).length) }));
    } else putHTML('#lcSay', t('ch4.say.loc', { a: fmt(sp[0], 1), b: fmt(sp[1], 1), c: fmt(sp[2], 1), da: fmt(d[0], 0), db: fmt(d[1], 0), dc: fmt(d[2], 0) }));
  }
  sim.text = text;
  const moved = () => { if (clock != null && !reduce) { clock = null; bGo.textContent = t('ch4.btn.go'); } if (reduce && clock != null) clock = tEnd() - 2; sim.dirty = true; text(); };
  [sX, sY].forEach(s => s.addEventListener('input', moved));
  bGo.addEventListener('click', () => {
    if (reduce) { clock = clock == null ? tEnd() - 2 : null; }
    else if (clock != null) { clock = null; bGo.textContent = t('ch4.btn.go'); }
    else { clock = 0; bGo.textContent = t('ch4.btn.stop'); }
    sim.dirty = true; text();
  });
  // drag the epicentre on the map; arrow keys move it by 5 km
  const setFrom = ev => { if (!geo) return; const r = cv.getBoundingClientRect(); sX.value = clamp(Math.round((ev.clientX - r.left - geo.ox) / geo.k), +sX.min, +sX.max); sY.value = clamp(Math.round((ev.clientY - r.top - geo.oy) / geo.k), +sY.min, +sY.max); moved(); };
  let dragging = false;
  cv.addEventListener('pointerdown', ev => { dragging = true; cv.setPointerCapture(ev.pointerId); setFrom(ev); });
  cv.addEventListener('pointermove', ev => { if (dragging) setFrom(ev); });
  cv.addEventListener('pointerup', () => { dragging = false; });
  cv.addEventListener('keydown', ev => {
    const d = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[ev.key]; if (!d) return;
    ev.preventDefault(); sX.value = clamp(+sX.value + d[0], +sX.min, +sX.max); sY.value = clamp(+sY.value + d[1], +sY.min, +sY.max); moved();
  });
  text();
})();

/* ───────── 04b early warning ───────── */
(() => {
  const cv = $('#wnCv'), Lc = Q.loc, XMAX = 300;
  const sN = $('#wnN'), sP = $('#wnP'), sH = $('#wnH'), sD = $('#wnD');
  const P = () => ({ near: +sN.value, proc: +sP.value, h: +sH.value, d: +sD.value });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = P(), ta = Lc.alertTime(p.near, p.h, p.proc), br = Lc.blindRadius(p.h, ta);
      const f = frame(w, h, [30, 14, 40, 46], 0, XMAX, -20, 90);
      c.fillStyle = 'rgba(240,122,109,.18)'; c.fillRect(f.L + 1, f.T, f.X(Math.min(br, XMAX)) - f.L - 1, f.B - f.T);
      yTicks(c, f, [-20, 0, 20, 40, 60, 80], v => fmt(v));
      axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      xTicks(c, f, [0, 50, 100, 150, 200, 250, 300], v => fmt(v));
      c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      const pts = []; for (let d = 0; d <= XMAX; d += 2) pts.push([d, clamp(Lc.warning(d, p.h, ta), -20, 90)]);
      path(c, pts, f.X, f.Y, C.green);
      const wv = clamp(Lc.warning(p.d, p.h, ta), -20, 90);
      c.strokeStyle = 'rgba(233,185,73,.5)'; c.beginPath(); c.moveTo(f.X(p.d), f.Y(0)); c.lineTo(f.X(p.d), f.Y(wv)); c.stroke();
      dot(c, f.X(p.d), f.Y(wv), C.gold, 6);
    }
  });
  function text() {
    const p = P(), ta = Lc.alertTime(p.near, p.h, p.proc), br = Lc.blindRadius(p.h, ta), sArr = Math.hypot(p.d, p.h) / Lc.VS, wv = sArr - ta;
    out(sN, '#wnNo', t('ch4.unit.km', { v: fmt(p.near) })); out(sP, '#wnPo', t('ch4.unit.s', { v: fmt(p.proc, 1) }));
    out(sH, '#wnHo', t('ch4.unit.km', { v: fmt(p.h) })); out(sD, '#wnDo', t('ch4.unit.km', { v: fmt(p.d) }));
    put('#wnAlert', t('ch4.unit.s', { v: fmt(ta, 1) })); put('#wnBlind', t('ch4.unit.km', { v: fmt(br, 0) }));
    put('#wnS', t('ch4.unit.s', { v: fmt(sArr, 1) })); put('#wnW', wv >= 0 ? t('ch4.unit.s', { v: fmt(wv, 1) }) : t('ch4.unit.late', { v: fmt(-wv, 1) }));
    const key = Math.abs(wv) < 0.5 ? 'ch4.say.edge' : wv > 0 ? (br > 0 ? 'ch4.say.ok' : 'ch4.say.noblind') : 'ch4.say.late';
    putHTML('#wnSay', t(key, { d: fmt(p.d), w: fmt(wv, 0), late: fmt(-wv, 0), blind: fmt(br, 0) }));
  }
  sim.text = text;
  [sN, sP, sH, sD].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 05 a sheet of blocks ───────── */
const SHEET_SEED = 7;
(() => {
  const cv = $('#shCv'), S = Q.sheet, SPEED = 20, KEEP = 500;
  const sA = $('#shA'), bPlay = $('#shPlay'), bFast = $('#shFast');
  let s, evs, n, n6, n7, maxM, playing = !reduce, fast = false, flash = new Map(), clockReal = 0;
  function fresh() {
    s = S.create(SHEET_SEED, S.BURN, +sA.value); evs = []; n = 0; n6 = 0; n7 = 0; maxM = 0; flash.clear();
    if (reduce) advance(500);
  }
  function record(ev) { n++; if (ev.M >= 6) n6++; if (ev.M >= 7) n7++; if (ev.M > maxM) maxM = ev.M; if (ev.M >= 5) evs.push(ev); if (!reduce) flash.set(ev.id, clockReal + (ev.area > 3 ? 0.9 : 0.35)); }
  function advance(years) {
    let left = years, guard = 0;
    while (left > 0 && guard++ < 200000) { const w = S.wait(s); if (w > left) { S.load(s, left); left = 0; } else { left -= w; record(S.next(s)); } }
    while (evs.length && evs[0].t < s.t - KEEP) evs.shift();
  }
  fresh();
  const sim = reg(cv, {
    step(dt) {
      clockReal += dt;
      if (playing && !reduce) { advance(dt * SPEED * (fast ? 10 : 1)); text(); this.dirty = true; }
      for (const [id, until] of flash) if (until < clockReal) { flash.delete(id); this.dirty = true; }
      if (this.dirty) { this.draw(); this.dirty = false; }
    },
    draw() {
      const { c, w, h } = fit(cv), L = S.L, narrow = w < 560;
      const side = narrow ? Math.min(w - 16, h * 0.55) : Math.min(h - 16, w * 0.42), cell = side / L;
      const gx = narrow ? (w - side) / 2 : 8, gy = 8;
      for (let i = 0; i < s.N; i++) {
        const x = i % L, y = (i / L) | 0, id = s.mark[i];
        const hot = flash.has(id) || (reduce && s.last && id === s.last.id);
        if (hot) c.fillStyle = C.gold;
        else { const v = s.f[i], a = Math.pow(v, 3); c.fillStyle = `rgb(${Math.round(29 + a * 70)},${Math.round(36 + a * 163)},${Math.round(51 + a * 179)})`; }
        c.fillRect(gx + x * cell, gy + y * cell, Math.ceil(cell) - (cell > 6 ? 1 : 0), Math.ceil(cell) - (cell > 6 ? 1 : 0));
      }
      const x0 = Math.max(0, s.t - KEEP), x1 = x0 + KEEP;
      const f = narrow ? frame(w, h, [gy + side + 30, 12, 34, 40], x0, x1, 4.5, 7.6) : frame(w, h, [30, 12, 34, gx + side + 48], x0, x1, 4.5, 7.6);
      yTicks(c, f, [5, 6, 7], v => fmt(v));
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      const tk = []; for (let v = Math.ceil(x0 / 100) * 100; v <= x1; v += 100) tk.push(v);
      xTicks(c, f, tk, v => fmt(v), 40);
      c.strokeStyle = 'rgba(240,122,109,.45)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(f.L, f.Y(7)); c.lineTo(f.R, f.Y(7)); c.stroke(); c.setLineDash([]);
      for (const e of evs) { if (e.t < s.t - KEEP) continue; const x = f.X(e.t); c.strokeStyle = e.M >= 7 ? C.red : e.M >= 6 ? C.cyan : C.dim; c.lineWidth = e.M >= 7 ? 2.2 : 1.2; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.Y(Math.min(e.M, 7.6))); c.stroke(); }
    }
  });
  function text() {
    const a = +sA.value;
    out(sA, '#shAo', fmt(a, 2));
    put('#shYears', t('ch5.unit.yr', { v: fmt(s.t, 0) })); put('#shN', fmt(n));
    put('#shLast', s.last ? (s.last.area === 1 ? t('ch5.unit.m1', { m: fmt(s.last.M, 1) }) : t('ch5.unit.m', { m: fmt(s.last.M, 1), n: fmt(s.last.area) })) : '—');
    put('#shMax', maxM ? fmt(maxM, 1) : '—');
    const key = a <= 0.12 ? 'ch5.say.loose' : a >= 0.24 ? 'ch5.say.tight' : 'ch5.say.mid';
    putHTML('#shSay', t(key, { y: fmt(s.t, 0), n: fmt(n), n6: fmt(n6), n7: fmt(n7) }));
    bPlay.textContent = reduce ? t('ch5.btn.step') : t(playing ? 'ch5.btn.pause' : 'ch5.btn.play');
    bPlay.setAttribute('aria-pressed', String(!reduce && playing));
    bFast.setAttribute('aria-pressed', String(fast)); bFast.disabled = reduce;
  }
  sim.text = text;
  sA.addEventListener('input', () => { fresh(); sim.dirty = true; text(); });
  bPlay.addEventListener('click', () => { if (reduce) advance(100); else playing = !playing; sim.dirty = true; text(); });
  bFast.addEventListener('click', () => { fast = !fast; text(); });
  text();
})();

/* shared long catalogue of the sheet (default α) for chapters 6 and 8, computed on first need */
let CAT = null;
const catalogue = () => (CAT || (CAT = Q.sheet.catalogue(SHEET_SEED, 20000)));

/* ───────── 06 Gutenberg–Richter ───────── */
(() => {
  const cv = $('#grCv'), G = Q.gr, sM = $('#grM');
  const MS = [5, 5.5, 6, 6.5, 7];
  let model = null;
  const getModel = () => {
    if (model) return model;
    const cat = catalogue(), rates = Q.sheet.rates(cat, MS), b = G.slope([5, 5.5, 6], rates.slice(0, 3));
    const ys = [5, 5.5, 6].map(m => Math.log10(rates[MS.indexOf(m)])), a = ys.reduce((x, y) => x + y) / 3 + b * 5.5;
    // per-millennium min–max of counts ≥ M over 1000-year blocks
    const span = cat[cat.length - 1].t, blocks = Math.floor(span / 1000);
    const range = m => { const cnt = new Array(blocks).fill(0); for (const e of cat) { const k = Math.floor(e.t / 1000); if (k < blocks && e.M >= m - 1e-9) cnt[k]++; } return [Math.min(...cnt), Math.max(...cnt)]; };
    return (model = { rates, b, a, range, maxM: cat.reduce((x, e) => Math.max(x, e.M), 0), cat });
  };
  const set = () => radioVal('grSet');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), world = set() === 'world';
      const f = world ? frame(w, h, [30, 14, 40, 54], 4.5, 9.5, -1.5, 3.7) : frame(w, h, [30, 14, 40, 54], 4.5, 9.5, -0.5, 3.7);
      const yt = []; for (let e = Math.ceil(f.y0); e <= 3; e++) yt.push(e);
      yTicks(c, f, yt, e => e >= 0 ? fmt(Math.pow(10, e)) : fmt(Math.pow(10, e), -e));
      axes(c, f, t('ch6.cv.x'), t(world ? 'ch6.cv.yworld' : 'ch6.cv.ymodel'));
      xTicks(c, f, [5, 6, 7, 8, 9], v => fmt(v));
      const Mx = +sM.value;
      c.strokeStyle = 'rgba(233,185,73,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(Mx), f.T); c.lineTo(f.X(Mx), f.B); c.stroke();
      c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
      if (world) {
        const fit0 = G.fit();
        c.setLineDash([6, 4]); path(c, [[4.5, fit0.a - fit0.b * 4.5], [9.5, fit0.a - fit0.b * 9.5]], f.X, f.Y, C.gold, 1.6); c.setLineDash([]);
        for (const m of [5, 6, 7, 8]) {
          const ys = G.COUNTS[m].map((_, i) => G.cumYear(m, i)), lo = Math.min(...ys), hi = Math.max(...ys), x = f.X(m);
          c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.moveTo(x, f.Y(Math.log10(Math.max(lo, 0.05)))); c.lineTo(x, f.Y(Math.log10(hi))); c.stroke();
          dot(c, x, f.Y(Math.log10(G.cumMean(m))), C.cyan, 5);
        }
      } else {
        const md = getModel();
        c.setLineDash([6, 4]); path(c, [[4.5, md.a - md.b * 4.5], [7.5, md.a - md.b * 7.5]], f.X, f.Y, C.gold, 1.6); c.setLineDash([]);
        MS.forEach((m, i) => { const [lo, hi] = md.range(m), x = f.X(m); if (hi > 0) { c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.moveTo(x, f.Y(Math.log10(Math.max(lo, 0.5)))); c.lineTo(x, f.Y(Math.log10(hi))); c.stroke(); } dot(c, x, f.Y(Math.log10(md.rates[i])), C.cyan, 5); });
      }
      c.restore();
    }
  });
  function text() {
    const M = +sM.value, world = set() === 'world';
    out(sM, '#grMo', t('ch6.unit.m', { v: fmt(M, 1) }));
    put('#grLegPts', t(world ? 'ch6.leg.world' : 'ch6.leg.model'));
    put('#grNL', t(world ? 'ch6.read.nworld' : 'ch6.read.nmodel'));
    if (world) {
      const fit0 = G.fit(), n = G.perYear(M, fit0), k = Math.floor(M + 1e-9);
      put('#grN', sig(n, n >= 10 ? 3 : 2));
      const days = 365.25 / n;
      put('#grGap', days < 730 ? t('ch6.unit.days', { v: fmt(days, days < 10 ? 1 : 0) }) : t('ch6.unit.years', { v: fmt(days / 365.25, days / 365.25 < 10 ? 1 : 0) }));
      if (k >= 5 && k <= 8 && Math.abs(M - k) < 1e-9) { const ys = G.COUNTS[k].map((_, i) => G.cumYear(k, i)); put('#grRange', t('ch6.unit.range', { lo: fmt(Math.min(...ys)), hi: fmt(Math.max(...ys)) })); put('#grRangeL', t('ch6.read.rangeworld', { M: fmt(k) })); }
      else { put('#grRange', '—'); put('#grRangeL', t('ch6.read.rangenone')); }
      put('#grB', fmt(fit0.b, 2));
      let s = t(days < 730 ? 'ch6.say.world.days' : 'ch6.say.world.years', { M: fmt(M, 1), n: sig(n, n >= 10 ? 3 : 2), gap: days < 730 ? fmt(days, days < 10 ? 1 : 0) : fmt(days / 365.25, days / 365.25 < 10 ? 1 : 0) });
      if (M > 8.0 + 1e-9) s += ' ' + t('ch6.say.extrap');
      putHTML('#grSay', s);
    } else {
      const md = getModel(), cat = md.cat, span = cat[cat.length - 1].t - cat[0].t;
      const cnt = cat.filter(e => e.M >= M - 1e-9).length, n = cnt / span * 1000;
      put('#grN', cnt ? sig(n, n >= 10 ? 3 : 2) : '0');
      put('#grGap', cnt ? t('ch6.unit.years', { v: fmt(1000 / n, 1000 / n < 10 ? 1 : 0) }) : '—');
      const [lo, hi] = md.range(M); put('#grRange', t('ch6.unit.range', { lo: fmt(lo), hi: fmt(hi) })); put('#grRangeL', t('ch6.read.rangemodel', { M: fmt(M, 1) }));
      put('#grB', fmt(md.b, 2));
      putHTML('#grSay', cnt ? t('ch6.say.model', { M: fmt(M, 1), n: sig(n, n >= 10 ? 3 : 2), gap: fmt(1000 / n, 1000 / n < 10 ? 1 : 0), b: fmt(md.b, 1) }) : t('ch6.say.model.none', { M: fmt(M, 1) }));
    }
  }
  sim.text = () => { if (set() === 'world' || model) text(); };
  sim.onShow = () => { text(); };
  sM.addEventListener('input', () => { sim.dirty = true; text(); });
  radios('grSet').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 07 aftershocks ───────── */
(() => {
  const cv = $('#afCv'), A = Q.after;
  const sMm = $('#afMm'), sM = $('#afM'), sS = $('#afS'), sT = $('#afT');
  let seed = 3, seq = [];
  const P = () => ({ Mm: +sMm.value, M: +sM.value, S: +sS.value, T: +sT.value });
  const xmax = p => Math.max(30, Math.ceil((p.S + p.T) / 10) * 10);
  const resim = () => { const p = P(); seq = A.simulate(p.Mm, p.M, xmax(p), seed); };
  resim();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = P(), X1 = xmax(p), strip = 56;
      const r0 = Math.log10(A.rate(X1, p.Mm, p.M)), r1 = Math.log10(A.rate(0, p.Mm, p.M));
      const y0 = Math.floor(r0) - 0.2, y1 = Math.ceil(Math.min(r1, r0 + 7)) + 0.2;
      const f = frame(w, h, [30, 14, strip + 40, 54], 0, X1, y0, y1);
      c.fillStyle = 'rgba(233,185,73,.16)'; c.fillRect(f.X(p.S), f.T, f.X(Math.min(p.S + p.T, X1)) - f.X(p.S), h - 34 - f.T);
      const yt = []; for (let e = Math.ceil(y0); e <= Math.floor(y1); e++) yt.push(e);
      const step = Math.max(1, Math.ceil(yt.length / 5));
      yTicks(c, f, yt.filter((e, i) => i % step === 0), e => e >= 0 ? fmt(Math.pow(10, e)) : fmt(Math.pow(10, e), Math.min(4, -e)));
      axes(c, f, '', t('ch7.cv.y'));
      const pts = []; for (let i = 0; i <= 300; i++) { const x = X1 * Math.pow(i / 300, 2); pts.push([x, Math.log10(A.rate(x, p.Mm, p.M))]); }
      c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip(); path(c, pts, f.X, f.Y, C.cyan); c.restore();
      // event strip: magnitude between M and Mm
      const g = frame(w, h, [h - strip - 34, 14, 34, 54], 0, X1, p.M, Math.max(p.Mm, p.M + 0.5));
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(g.L, g.T); c.lineTo(g.L, g.B); c.lineTo(g.R, g.B); c.stroke();
      label(c, t('ch7.cv.mag'), g.L - 6, g.T + 6, C.mute, 'right');
      label(c, fmt(p.M, 1), g.L - 6, g.B - 4, C.mute, 'right');
      const tk = []; for (let v = 0; v <= X1; v += X1 > 30 ? 10 : 5) tk.push(v);
      xTicks(c, g, tk, v => fmt(v));
      label(c, t('ch7.cv.x'), g.R, g.B + 26, C.mute, 'right');
      for (const e of seq) { const inW = e.t >= p.S && e.t <= p.S + p.T; dot(c, g.X(e.t), g.Y(e.M), inW ? C.red : 'rgba(240,122,109,.45)', inW ? 4 : 3); }
    }
  });
  const pct = x => x >= 0.995 ? t('ch7.unit.over99') : x < 0.001 ? t('ch7.unit.under01') : t('ch7.unit.pct', { v: fmt(x * 100, x < 0.1 ? 1 : 0) });
  function text() {
    const p = P(), N = A.expected(p.Mm, p.M, p.S, p.T), pr = A.prob(p.Mm, p.M, p.S, p.T), k = seq.filter(e => e.t >= p.S && e.t <= p.S + p.T).length;
    out(sMm, '#afMmo', t('ch7.unit.m', { v: fmt(p.Mm, 1) })); out(sM, '#afMo', t('ch7.unit.m', { v: fmt(p.M, 1) }));
    out(sS, '#afSo', t('ch7.unit.day', { v: fmt(p.S) })); out(sT, '#afTo', t('ch7.unit.day', { v: fmt(p.T) }));
    put('#afN', sig(N, 2)); put('#afP', pct(pr)); put('#afSim', t('ch7.unit.n', { v: fmt(k) }));
    put('#afRate', t('ch7.unit.rate', { v: sig(A.rate(p.S, p.Mm, p.M), 2) }));
    const v = { t: fmt(p.T), s1: fmt(p.S), s2: fmt(p.S + p.T), M: fmt(p.M, 1), n: sig(N, 2), p: pct(pr), k: fmt(k) };
    putHTML('#afSay', p.M > p.Mm ? t('ch7.say.bigger', v) : t(p.S === 0 ? 'ch7.say.start0' : 'ch7.say.later', v));
  }
  sim.text = text;
  [sMm, sM, sS, sT].forEach(e => e.addEventListener('input', () => { resim(); sim.dirty = true; text(); }));
  on('#afRoll', 'click', () => { seed++; resim(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 08 calling the next big one ───────── */
(() => {
  const cv = $('#clCv'), S = Q.sheet, BIG = 7, PAST = 400, FUT = 250, GAME_SEED = 25, GAME_START = 700;
  const sS = $('#clS'), sW = $('#clW'), bGo = $('#clGo'), bPer = $('#clPer'), bReset = $('#clReset');
  let s = null, evs = [], hits = 0, tries = 0, run = null, result = null, stats = null, statW = null;
  function init() {
    s = S.create(GAME_SEED); evs = [];
    let guard = 0; while (s.t < GAME_START && guard++ < 1e6) { const e = S.next(s); if (e.M >= 6) evs.push(e); }
  }
  const lastBig = () => { for (let i = evs.length - 1; i >= 0; i--) if (evs[i].M >= BIG && evs[i].t <= s.t) return evs[i]; return null; };
  const longRun = () => {
    const W = +sW.value;
    if (stats && statW === W) return stats;
    const cat = catalogue(), iv = S.intervals(cat, BIG);
    stats = { ...Q.call.hitRates(cat, BIG, W, 2), cv: S.cv(iv), meanI: S.mean(iv) }; statW = W;
    return stats;
  };
  const sim = reg(cv, {
    onShow() { if (!s) { init(); text(); } },
    step(dt) {
      if (!s) return;
      if (run && !reduce) {
        const target = Math.min(run.end, s.t + dt * run.speed);
        let guard = 0;
        while (guard++ < 100000) { const w = S.wait(s); if (s.t + w > target) { S.load(s, target - s.t); break; } const e = S.next(s); if (e.M >= 6) evs.push(e); }
        if (s.t >= run.end - 1e-9) finish();
        this.dirty = true; text();
      }
      if (this.dirty) { this.draw(); this.dirty = false; }
    },
    draw() {
      if (!s) return;
      const { c, w, h } = fit(cv), now = run ? run.now : s.t, f = frame(w, h, [24, 12, 40, 36], now - PAST, now + FUT, 5.8, 7.6);
      // the unknown future
      c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(f.X(Math.max(now, run ? s.t : now)), f.T, f.R - f.X(Math.max(now, run ? s.t : now)), f.B - f.T);
      const a = now + +sS.value, b = a + +sW.value;
      c.fillStyle = 'rgba(233,185,73,.22)'; c.fillRect(f.X(a), f.T, Math.max(2, f.X(Math.min(b, now + FUT)) - f.X(a)), f.B - f.T);
      yTicks(c, f, [6, 7], v => fmt(v));
      axes(c, f, '', '');
      label(c, t('ch8.cv.past'), f.L + 4, f.B + 24, C.mute);
      const fl = t('ch8.cv.future'); label(c, fl, f.R, f.B + 24, C.mute, 'right');
      const tk = []; for (let v = -400; v <= 250; v += 100) tk.push(v);
      xTicks(c, f, tk.map(v => now + v), v => fmt(v - now), 40);
      for (const e of evs) { if (e.t < now - PAST || e.t > s.t) continue; const x = f.X(e.t), big = e.M >= BIG; c.strokeStyle = big ? C.red : C.mute; c.lineWidth = big ? 2.6 : 1.2; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.Y(Math.min(e.M, 7.6))); c.stroke(); }
      c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(f.X(now), f.T - 4); c.lineTo(f.X(now), f.B); c.stroke();
      const nl = t('ch8.cv.now'); label(c, nl, clamp(f.X(now) - tw(c, nl) / 2, f.L, f.R - tw(c, nl)), f.T - 12, C.ink);
      if (run) { c.strokeStyle = C.gold; c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(s.t), f.T); c.lineTo(f.X(s.t), f.B); c.stroke(); }
    }
  });
  function start() {
    if (!s || run) return;
    const now = s.t, a = now + +sS.value, b = a + +sW.value;
    run = { now, a, b, end: b, speed: Math.max(60, (b - now) / 1.6) };
    result = null;
    if (reduce) { let guard = 0; while (guard++ < 1e6) { const w = S.wait(s); if (s.t + w > b) { S.load(s, b - s.t); break; } const e = S.next(s); if (e.M >= 6) evs.push(e); } finish(); }
    sim.dirty = true; text();
  }
  function finish() {
    const r = run, inW = evs.filter(e => e.M >= BIG && e.t >= r.a && e.t <= r.b), before = evs.filter(e => e.M >= BIG && e.t > r.now && e.t < r.a);
    tries++; if (inW.length) hits++;
    result = inW.length ? { key: 'ch8.say.hit', e: inW[0], now: r.now } : before.length ? { key: 'ch8.say.missbefore', e: before[0], now: r.now } : { key: 'ch8.say.missnone', now: r.now };
    run = null;
  }
  function text() {
    out(sS, '#clSo', t('ch8.unit.yr', { v: fmt(+sS.value) })); out(sW, '#clWo', t('ch8.unit.yr', { v: fmt(+sW.value) }));
    put('#clScore', t('ch8.unit.score', { h: fmt(hits), n: fmt(tries) }));
    bGo.disabled = !!run; bPer.disabled = !!run;
    if (!s) { put('#clNow', '…'); put('#clPerR', '…'); put('#clSince', '…'); return; }
    const st = longRun(), lb = lastBig(), since = lb ? s.t - lb.t : null;
    put('#clNow', fmt(st.now * 100) + '%'); put('#clPerR', fmt(st.periodic * 100) + '%');
    put('#clSince', since == null ? '—' : t('ch8.unit.yr', { v: fmt(since, 0) }));
    if (run) putHTML('#clSay', t('ch8.say.running'));
    else if (result) putHTML('#clSay', t(result.key, { when: result.e ? fmt(result.e.t - result.now, 0) : '', M: result.e ? fmt(result.e.M, 1) : '', p: fmt(st.now * 100) }));
    else putHTML('#clSay', t(since == null ? 'ch8.say.readynone' : 'ch8.say.ready', { since: since == null ? '' : fmt(since, 0), mean: fmt(st.meanI, 0), a: fmt(+sS.value), b: fmt(+sS.value + +sW.value) }));
  }
  sim.text = text;
  [sS, sW].forEach(e => e.addEventListener('input', () => { if (!run) result = null; sim.dirty = true; text(); }));
  bGo.addEventListener('click', start);
  bPer.addEventListener('click', () => {
    if (!s || run) return;
    const lb = lastBig(), st = longRun(), W = +sW.value;
    const centre = (lb ? lb.t : s.t) + st.meanI, off = clamp(Math.round((centre - W / 2 - s.t) / 5) * 5, +sS.min, +sS.max);
    sS.value = off; start();
  });
  bReset.addEventListener('click', () => { hits = 0; tries = 0; result = null; text(); });
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
    else if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
