/* What quantum computers can do: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.QCModels, S = M.sim, PI = Math.PI;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const FONTB = '600 13px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const deg = d => d * PI / 180;

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

/* ───────── number formatting (language-neutral) ───────── */
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '.': '·' };
const sup = n => String(n).split('').map(ch => SUP[ch] || ch).join('');
const pow10 = e => '10' + sup(e);
/* a×10ⁿ with `sig` significant digits; plain digits between 0.01 and 1e5 */
function sci(x, sig = 2) {
  if (!isFinite(x)) return '—';
  if (x === 0) return '0';
  const ax = Math.abs(x);
  if (ax >= 0.01 && ax < 1e5) return fmt(x, ax >= 100 ? 0 : ax >= 10 ? 1 : 2);
  let e = Math.floor(Math.log10(ax)), m = x / Math.pow(10, e);
  m = +m.toPrecision(sig); if (Math.abs(m) >= 10) { m /= 10; e += 1; }
  const ms = String(+m.toFixed(sig - 1));
  return (ms === '1' ? '' : ms + '×') + pow10(e);
}
const pct = (p, d = 1) => fmt(p * 100, d);
const pctAuto = p => (p * 100 < 1 && p > 0 ? fmt(p * 100, 2) : fmt(p * 100, 1));
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
function bytes(lg) { // lg = log10(bytes)
  const k = Math.floor(lg / 3);
  if (k >= UNITS.length) return sci(Math.pow(10, lg)) + ' B';
  const v = Math.pow(10, lg - 3 * Math.max(0, k));
  return fmt(v, v < 100 ? 1 : 0) + ' ' + UNITS[Math.max(0, k)];
}
function bigInt(x) { return x < 1e13 ? fmt(x) : sci(x, 3); }
function duration(s) {
  if (s < 60) return t('u.s', { v: s < 0.01 ? sci(s) : fmt(s, s < 10 ? 2 : 0) });
  if (s < 3600) return t('u.min', { v: fmt(s / 60, s < 600 ? 1 : 0) });
  if (s < 86400) return t('u.h', { v: fmt(s / 3600, s < 36000 ? 1 : 0) });
  if (s < 3.15576e7) return t('u.d', { v: fmt(s / 86400, s < 864000 ? 1 : 0) });
  const y = s / 3.15576e7; return t('u.y', { v: y < 1e5 ? fmt(y, y < 10 ? 1 : 0) : sci(y) });
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
  langHooks.forEach(f => f());
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
const langHooks = [];
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
  return { L, R, T, B, x0, x1, y0, y1, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fv, skipLast) {
  c.fillStyle = C.mute; c.textAlign = 'center'; c.font = FONT;
  vals.forEach((v, i) => { if (skipLast && i === vals.length - 1) return; const x = f.X(v); c.fillText(fv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fv) {
  c.fillStyle = C.mute; c.textAlign = 'right'; c.font = FONT;
  vals.forEach(v => { const y = f.Y(v); c.fillText(fv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, f, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke(); c.setLineDash([]); }
function vline(c, f, x, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.2; c.setLineDash(dash); c.beginPath(); c.moveTo(f.X(x), f.T); c.lineTo(f.X(x), f.B); c.stroke(); c.setLineDash([]); }
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function arrow(c, x0, y0, x1, y1, col, lw = 2.2) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), hd = Math.min(9, L * 0.4);
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * hd * 0.6, y1 - Math.sin(a) * hd * 0.6); c.stroke();
  if (L > 2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - hd * Math.cos(a - 0.4), y1 - hd * Math.sin(a - 0.4)); c.lineTo(x1 - hd * Math.cos(a + 0.4), y1 - hd * Math.sin(a + 0.4)); c.closePath(); c.fill(); }
}
const bitstr = (v, n) => v.toString(2).padStart(n, '0');

/* ───────── 01 one qubit ───────── */
(() => {
  const cv = $('#q1Cv'), Q = M.qubit, r = M.rng(101);
  const sT = $('#q1Th'), sP = $('#q1Ph');
  let cnt = { n: 0, k: 0 };
  const P = () => ({ th: deg(+sT.value), ph: deg(+sP.value), b: radioVal('q1B') });
  const outs = b => [t('ch1.out.' + b + '0'), t('ch1.out.' + b + '1')];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = P(), wideL = w >= 560;
      // sphere
      const sw = wideL ? w * 0.52 : w, sh = wideL ? h : h * 0.58;
      const R = Math.min(sw * 0.36, sh * 0.36), cx = sw / 2, cy = sh / 2 + 4;
      const az = deg(-30), el = deg(16);
      const proj = (x, y, z) => { const x1 = x * Math.cos(az) - y * Math.sin(az), y1 = x * Math.sin(az) + y * Math.cos(az); return [cx + R * y1, cy - R * (z * Math.cos(el) - x1 * Math.sin(el)), x1]; };
      c.strokeStyle = C.line; c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.stroke();
      // equator: front solid, back dashed
      for (const front of [false, true]) {
        c.setLineDash(front ? [] : [3, 4]); c.strokeStyle = front ? C.line : C.grid; c.beginPath(); let started = false;
        for (let k = 0; k <= 120; k++) { const a = k / 120 * 6.283, q = proj(Math.cos(a), Math.sin(a), 0); if ((q[2] >= 0) !== front) { started = false; continue; } if (!started) { c.moveTo(q[0], q[1]); started = true; } else c.lineTo(q[0], q[1]); }
        c.stroke();
      }
      c.setLineDash([]);
      const axesDef = { z: [0, 0, 1], x: [1, 0, 0], y: [0, 1, 0] };
      for (const k of ['z', 'x', 'y']) {
        const v = axesDef[k], a = proj(...v), b = proj(-v[0], -v[1], -v[2]);
        c.strokeStyle = k === p.b ? C.gold : C.dim; c.lineWidth = k === p.b ? 2 : 1; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(a[0], a[1]); c.stroke();
        const o = outs(k); c.fillStyle = k === p.b ? C.gold : C.mute; c.font = FONT; c.textAlign = 'center';
        const lab = (q, s, dx, dy) => c.fillText(s, q[0] + dx, q[1] + dy);
        if (k === 'z') { lab(a, '|0⟩', 0, -12); lab(b, '|1⟩', 0, 12); }
        else if (k === 'x') { lab(a, o[0], -10, 8); lab(b, o[1], 10, -8); }
        else { lab(a, o[0], 14, 2); lab(b, o[1], -14, -2); }
      }
      const bv = Q.bloch(p.th, p.ph), tip = proj(...bv), foot = proj(bv[0], bv[1], 0);
      c.strokeStyle = C.mute; c.setLineDash([3, 3]); c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(foot[0], foot[1]); c.lineTo(tip[0], tip[1]); c.stroke(); c.setLineDash([]);
      arrow(c, cx, cy, tip[0], tip[1], C.cyan, 2.6); dot(c, tip[0], tip[1], C.cyan, 4);
      // bars: predicted vs measured
      const bx = wideL ? sw : 0, by = wideL ? 0 : sh, bw = wideL ? w - sw : w, bh = wideL ? h : h - sh;
      const f = frame(bw, bh, [26, 14, 30, 44], 0, 2, 0, 1); const ox = bx, oy = by;
      c.save(); c.translate(ox, oy);
      yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%'); axes(c, f, '', '');
      const p0 = Q.p0(p.th, p.ph, p.b), pr = [p0, 1 - p0], o = outs(p.b), fr = cnt.n ? [cnt.k / cnt.n, 1 - cnt.k / cnt.n] : null;
      for (let i = 0; i < 2; i++) {
        const x0 = f.X(i + 0.18), x1 = f.X(i + 0.82), xm = (x0 + x1) / 2;
        if (fr) { c.fillStyle = 'rgba(99,199,230,.55)'; c.fillRect(x0 + 6, f.Y(fr[i]), x1 - x0 - 12, f.B - f.Y(fr[i])); }
        c.strokeStyle = C.mute; c.lineWidth = 2; c.strokeRect(x0, f.Y(pr[i]), x1 - x0, f.B - f.Y(pr[i]));
        c.fillStyle = C.ink; c.textAlign = 'center'; c.font = FONTB; c.fillText('“' + o[i] + '”', xm, f.B + 14); c.font = FONT;
      }
      c.restore();
    }
  });
  function text() {
    const p = P(), p0 = Q.p0(p.th, p.ph, p.b), o = outs(p.b), a = Q.amps(p.th, p.ph);
    put('#q1Tho', fmt(+sT.value) + '°'); put('#q1Pho', fmt(+sP.value) + '°');
    put('#q1A', fmt(Math.hypot(...a.a), 3));
    const bm = Math.hypot(...a.b); put('#q1Bt', bm < 5e-4 ? '0' : t('ch1.unit.polar', { m: fmt(bm, 3), d: fmt(+sP.value % 360) }));
    put('#q1P', t('ch1.unit.prob', { o: o[0], p: pct(p0, 1) }));
    put('#q1N', cnt.n ? t('ch1.unit.count', { o: o[0], k: fmt(cnt.k), n: fmt(cnt.n) }) : '—');
    const basis = t('ch1.bname.' + p.b), sure = p0 > 0.9995 || p0 < 0.0005;
    let key, v = { basis, o0: o[0], o1: o[1], p: pct(p0, 1), q: pct(1 - p0, 1), n: fmt(cnt.n), k: fmt(cnt.k), f: cnt.n ? pct(cnt.k / cnt.n, 1) : '' };
    if (!cnt.n) key = 'ch1.say.none';
    else if (sure) { key = 'ch1.say.sure'; v.o = p0 > 0.5 ? o[0] : o[1]; v.p = '100'; }
    else key = p.b === 'z' ? 'ch1.say.freqZ' : 'ch1.say.freq';
    putHTML('#q1Say', t(key, v));
  }
  sim.text = text;
  const shoot = n => { const p = P(); cnt.k += Q.shots(p.th, p.ph, p.b, n, r); cnt.n += n; sim.dirty = true; text(); };
  const reset = () => { cnt = { n: 0, k: 0 }; sim.dirty = true; text(); };
  [sT, sP].forEach(e => e.addEventListener('input', reset));
  radios('q1B').forEach(e => e.addEventListener('change', reset));
  on('#q1One', 'click', () => shoot(1)); on('#q1Hund', 'click', () => shoot(100)); on('#q1Reset', 'click', reset);
  shoot(100); // the page opens with 100 shots already taken
  text();
})();

/* ───────── 02 Mach–Zehnder ───────── */
(() => {
  const cv = $('#mzCv'), Z = M.mz, sP = $('#mzPh'), sK = $('#mzPk');
  const P = () => ({ phi: deg(+sP.value), peek: +sK.value / 100 });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = P(), res = Z.run(p.phi, p.peek), pa = Z.paths(p.phi);
      // diagram (top ~52%)
      const dh = h * 0.46, DW = Math.min(w - 20, 600), L = (w - DW) / 2 + 10, Rr = L + DW - 20, T = 50, B = dh - 18, bx1 = L + 30, bx2 = Rr - 92;
      const beam = (x0, y0, x1, y1, col) => { c.strokeStyle = col; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
      beam(L - 22, B, bx1, B, C.gold);
      beam(bx1, B, bx2, B, C.violet); beam(bx2, B, bx2, T, C.violet);           // lower path
      beam(bx1, B, bx1, T, C.cyan); beam(bx1, T, bx2, T, C.cyan);               // upper path (phase)
      const det = (x, y, pr) => { c.fillStyle = `rgba(233,185,73,${0.15 + 0.85 * pr})`; c.beginPath(); c.arc(x, y, 11, 0, 6.283); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 1.5; c.stroke(); };
      beam(bx2, T, Rr - 22, T, C.mute); beam(bx2, T, bx2, T - 26, C.mute);
      det(Rr - 12, T, res.p0); det(bx2, T - 34, res.p1);
      const bs = (x, y) => { c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 10, y + 10); c.lineTo(x + 10, y - 10); c.stroke(); };
      bs(bx1, B); bs(bx2, T);
      const mir = (x, y) => { c.strokeStyle = C.mute; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 9, y + 9); c.lineTo(x + 9, y - 9); c.stroke(); };
      mir(bx1, T); mir(bx2, B);
      const pm = (bx1 + bx2) / 2; c.fillStyle = C.card2 || '#1a1f2b'; c.strokeStyle = C.cyan; c.lineWidth = 1.5; c.fillRect(pm - 16, T - 9, 32, 18); c.strokeRect(pm - 16, T - 9, 32, 18);
      c.font = FONT; c.fillStyle = C.mute;
      c.textAlign = 'left'; c.fillText(t('ch2.cv.bs'), bx1 + 16, B - 14);
      c.textAlign = 'center'; c.fillText(t('ch2.cv.phase'), pm, T + 22);
      c.textAlign = 'right'; c.fillText(t('ch2.cv.d0'), Rr - 2, T + 26);
      c.textAlign = 'left'; c.fillText(t('ch2.cv.d1'), bx2 + 18, T - 34);
      // phasors (bottom)
      const top = dh + 10, ph = h - top - 8, pw = w / 2;
      [[pa.d0, 'ch2.cv.to0', res.p0], [pa.d1, 'ch2.cv.to1', res.p1]].forEach(([arr, key], i) => {
        const ox = pw * i, R = Math.min(pw * 0.38, (ph - 34) * 0.5), cx = ox + pw / 2, cy = top + 26 + (ph - 26) / 2;
        c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.stroke();
        c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke();
        c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t(key), cx, top + 10);
        const k = R; // amplitude 1 ↔ R
        const a = arr[0], b = arr[1];
        const x1 = cx + a[0] * k, y1 = cy - a[1] * k, x2 = x1 + b[0] * k, y2 = y1 - b[1] * k;
        arrow(c, cx, cy, x1, y1, C.violet); arrow(c, x1, y1, x2, y2, C.cyan);
        if (Math.hypot(x2 - cx, y2 - cy) > 3) arrow(c, cx, cy, x2, y2, `rgba(233,185,73,${Math.max(0.25, 1 - p.peek)})`, 3);
        else dot(c, cx, cy, C.gold, 3.5);
      });
    }
  });
  function text() {
    const p = P(), res = Z.run(p.phi, p.peek);
    put('#mzPho', fmt(+sP.value) + '°'); put('#mzPko', fmt(+sK.value) + '%');
    put('#mzP0', pct(res.p0, 1) + '%'); put('#mzP1', pct(res.p1, 1) + '%'); put('#mzVis', pct(Z.visibility(p.peek), 0) + '%'); put('#mzCoin', pct(Z.classical(), 0) + '% / ' + pct(Z.classical(), 0) + '%');
    const key = p.peek >= 0.995 ? 'ch2.say.watched' : res.p1 < 0.005 ? 'ch2.say.dark1' : res.p0 < 0.005 ? 'ch2.say.dark0' : 'ch2.say.mid';
    putHTML('#mzSay', t(key, { phi: fmt(+sP.value), p0: pct(res.p0, 1), vis: pct(Z.visibility(p.peek), 0) }));
  }
  sim.text = text;
  [sP, sK].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 03 CHSH ───────── */
(() => {
  const cv = $('#chCv'), H = M.chsh, r = M.rng(303);
  const sl = ['#chA0', '#chA1', '#chB0', '#chB1'].map(s => $(s));
  let tally = null;
  const A = () => ({ a0: deg(+sl[0].value), a1: deg(+sl[1].value), b0: deg(+sl[2].value), b1: deg(+sl[3].value) });
  const mode = () => radioVal('chWho');
  const exactCell = (x, y) => mode() === 'c' ? ((x & y) ? 0 : 1) : H.winGiven(x ? A().a1 : A().a0, y ? A().b1 : A().b0, x, y);
  const exactWin = () => mode() === 'c' ? H.classicalBest() : H.winProb(A());
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), wideL = w >= 560, ang = A();
      const cw = wideL ? w * 0.42 : w, chh = wideL ? h : h * 0.46;
      const R = Math.min(cw * 0.34, chh * 0.34), cx = cw / 2, cy = chh / 2 - 6;
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.stroke();
      if (mode() === 'q') {
        const ln = (th, col, dash) => { c.strokeStyle = col; c.lineWidth = 2.4; c.setLineDash(dash); c.beginPath(); c.moveTo(cx - R * Math.cos(th), cy + R * Math.sin(th)); c.lineTo(cx + R * Math.cos(th), cy - R * Math.sin(th)); c.stroke(); c.setLineDash([]); dot(c, cx + R * Math.cos(th), cy - R * Math.sin(th), col, 3.5); };
        ln(ang.a0, C.gold, []); ln(ang.a1, C.gold, [6, 4]); ln(ang.b0, C.cyan, []); ln(ang.b1, C.cyan, [6, 4]);
      }
      c.font = FONT; c.textAlign = 'center';
      c.fillStyle = C.gold; c.fillText(t('ch3.cv.alice'), cx - Math.min(70, R * 0.7), cy + R + 18);
      c.fillStyle = C.cyan; c.fillText(t('ch3.cv.bob'), cx + Math.min(70, R * 0.7), cy + R + 18);
      // bars
      const ox = wideL ? cw : 0, oy = wideL ? 0 : chh, bw = wideL ? w - cw : w, bh = wideL ? h : h - chh;
      c.save(); c.translate(ox, oy);
      const f = frame(bw, bh, [26, 16, 40, 44], 0, 4, 0, 1);
      yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%'); axes(c, f, '', t('ch3.cv.win'));
      hline(c, f, 0.75, C.red); hline(c, f, Math.cos(PI / 8) ** 2, C.green);
      for (let i = 0; i < 4; i++) {
        const x = i & 1, y = i >> 1, x0 = f.X(i + 0.2), x1 = f.X(i + 0.8), xm = (x0 + x1) / 2;
        const ex = exactCell(x, y);
        if (tally && tally.cell[i]) { const fr = tally.cellWins[i] / tally.cell[i]; c.fillStyle = 'rgba(233,185,73,.55)'; c.fillRect(x0 + 5, f.Y(fr), x1 - x0 - 10, f.B - f.Y(fr)); }
        c.strokeStyle = C.mute; c.lineWidth = 2; c.strokeRect(x0, f.Y(ex), x1 - x0, f.B - f.Y(ex));
        const lab = t('ch3.cv.cell', { x, y }).split(' ');
        c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(lab[0], xm, f.B + 12); if (lab[1]) c.fillText(lab[1], xm, f.B + 27);
      }
      c.restore();
    }
  });
  function text() {
    sl.forEach(s => put('#' + s.id + 'o', t('ch3.unit.deg', { v: fmt(+s.value, 1) })));
    const n = tally ? tally.rounds : 0, w = exactWin(), f = n ? tally.wins / n : 0;
    put('#chRounds', fmt(n)); put('#chRate', n ? pct(f, 1) + '%' : '—'); put('#chExact', pct(w, 1) + '%');
    put('#chBob', tally && tally.bobN[0] && tally.bobN[1] ? t('ch3.unit.bob', { a: pct(tally.bobOne[0] / tally.bobN[0], 1), b: pct(tally.bobOne[1] / tally.bobN[1], 1) }) : '—');
    const se = n ? 100 * Math.sqrt(w * (1 - w) / n) : 0;
    let key;
    if (mode() === 'c') key = n ? 'ch3.say.classical' : 'ch3.say.classicalNone';
    else if (!n) key = 'ch3.say.none';
    else if (w <= 0.75 + 1e-9 && n >= 200) key = 'ch3.say.below';
    else if (n < 200) key = 'ch3.say.few';
    else if (f > 0.75) key = 'ch3.say.beat';
    else key = 'ch3.say.close';
    putHTML('#chSay', t(key, { n: fmt(n), k: fmt(n ? tally.wins : 0), f: pct(f, 1), w: pct(w, 1), se: fmt(se, 1) }));
  }
  sim.text = text;
  const reset = () => { tally = null; sim.dirty = true; text(); };
  const play = k => { tally = mode() === 'c' ? H.playClassical(k, r, tally) : H.play(A(), k, r, tally); sim.dirty = true; text(); };
  sl.forEach(s => s.addEventListener('input', reset)); radios('chWho').forEach(e => e.addEventListener('change', reset));
  on('#chOne', 'click', () => play(1)); on('#chMany', 'click', () => play(1000)); on('#chReset', 'click', reset);
  play(1000); // the page opens with 1000 rounds already played at the best angles
  on('#chBest', 'click', () => { const b = H.best; [b.a0, b.a1, b.b0, b.b1].forEach((v, i) => { sl[i].value = String(v * 180 / PI); }); radios('chWho')[0].checked = true; reset(); });
  text();
})();

/* ───────── 04 memory and 2^n ───────── */
(() => {
  const cv = $('#mmCv'), cv2 = $('#mmCv2'), Me = M.memory, F = M.FRONTIER, sN = $('#mmN'), sS = $('#mmS');
  let seed = 4, st = null, pr = null, last = null; const r = M.rng(404);
  const LAP = 16e9;
  const build = () => { st = Me.randomState(+sS.value, seed); pr = S.probs(st); last = null; };
  build();
  const sim = reg([cv, cv2], {
    draw() {
      { const { c, w, h } = fit(cv), n = +sN.value, f = frame(w, h, [28, 16, 38, 58], 0, 60, 0, 21);
        yTicks(c, f, [0, 3, 6, 9, 12, 15, 18, 21], v => '1 ' + UNITS[v / 3]); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
        xTicks(c, f, [0, 10, 20, 30, 40, 50, 60], v => fmt(v), true);
        const lapY = Math.log10(LAP), recY = Math.log10(F.sim45.bytesPB * 1e15);
        hline(c, f, lapY, C.green); hline(c, f, recY, C.violet);
        c.textAlign = 'left'; c.fillStyle = C.green; c.fillText(t('ch4.cv.laptop'), f.L + 8, f.Y(lapY) - 10);
        c.fillStyle = C.violet; c.fillText(t('ch4.cv.record', { n: F.sim45.n, pb: fmt(F.sim45.bytesPB, 1) }), f.L + 8, f.Y(recY) - 10);
        const pts = []; for (let k = 1; k <= 60; k++) pts.push([k, Me.log10Bytes(k)]);
        path(c, pts.filter(p => p[1] <= 21), f.X, f.Y, C.cyan);
        if (Me.log10Bytes(n) <= 21) dot(c, f.X(n), f.Y(Me.log10Bytes(n)), C.gold, 5.5); else dot(c, f.X(n), f.T, C.gold, 5.5); }
      { const { c, w, h } = fit(cv2), N = pr.length, f = frame(w, h, [24, 12, 30, 44], 0, N, 0, Math.max(...pr) * 1.1);
        yTicks(c, f, [0, Math.max(...pr) * 1.1 / 2], v => fmt(v, 2)); axes(c, f, t('ch4.cv.combos'), t('ch4.cv.prob'));
        const bw = (f.R - f.L) / N;
        for (let i = 0; i < N; i++) { c.fillStyle = i === last ? C.gold : 'rgba(99,199,230,.75)'; const x = f.X(i), y = f.Y(pr[i]); c.fillRect(x + (bw > 3 ? 0.5 : 0), y, Math.max(1, bw - (bw > 3 ? 1 : 0)), f.B - y); }
        if (last != null) { const x = f.X(last + 0.5); c.strokeStyle = C.gold; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); } }
    }
  });
  function text() {
    const n = +sN.value, ns = +sS.value, lg = Me.log10Bytes(n);
    put('#mmNo', fmt(n)); put('#mmSo', fmt(ns));
    put('#mmAmps', bigInt(Math.pow(2, n))); put('#mmMem', bytes(lg));
    const key = n <= Me.maxQubits(LAP) ? 'ch4.say.laptop' : n <= F.sim45.n ? 'ch4.say.cluster' : 'ch4.say.beyond';
    putHTML('#mmSay', t(key, { n: fmt(n), amps: bigInt(Math.pow(2, n)), mem: bytes(lg), lap: fmt(Me.maxQubits(LAP)), rn: fmt(F.sim45.n), pb: fmt(F.sim45.bytesPB, 1) }));
    put('#mmOut', last == null ? '—' : bitstr(last, ns)); put('#mmBits', last == null ? '—' : t('ch4.unit.bits', { n: fmt(ns) }));
    putHTML('#mmSay2', last == null ? t('ch4.say2.none', { amps: fmt(Math.pow(2, ns)) }) : t('ch4.say2.shot', { amps: fmt(Math.pow(2, ns)), n: fmt(ns), bits: bitstr(last, ns) }));
  }
  sim.text = text;
  sN.addEventListener('input', () => { sim.dirty = true; text(); });
  sS.addEventListener('input', () => { build(); sim.dirty = true; text(); });
  on('#mmShot', 'click', () => { last = S.sampleFrom(pr, r); sim.dirty = true; text(); });
  on('#mmNew', 'click', () => { seed++; build(); sim.dirty = true; text(); });
  last = S.sampleFrom(pr, r); // the page opens with one measurement already made
  text();
})();

/* ───────── 05 Deutsch–Jozsa ───────── */
(() => {
  const cv = $('#djCv'), D = M.dj, sK = $('#djK'), qbox = $('#djQs');
  let asked = new Map();
  const btns = [];
  for (let v = 0; v < 8; v++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'b q'; b.dataset.v = v; qbox.appendChild(b); btns.push(b); b.addEventListener('click', () => { if (!asked.has(v)) asked.set(v, D.F[radioVal('djF')](v)); render(); }); }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), k = +sK.value, st = D.stage(radioVal('djF'), k);
      const f = frame(w, h, [26, 14, 30, 46], 0, 8, -1.05, 1.05);
      yTicks(c, f, [-1, 0, 1], v => fmt(v)); axes(c, f, '', t('ch5.cv.amp'));
      c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      for (let v = 0; v < 8; v++) {
        const a = st.amps[v], x0 = f.X(v + 0.2), x1 = f.X(v + 0.8), y0 = f.Y(0), y1 = f.Y(a);
        c.fillStyle = a >= 0 ? C.cyan : C.red; c.fillRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0));
        c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(bitstr(v, 3), (x0 + x1) / 2, f.B + 12);
      }
    }
  });
  function render() {
    const id = radioVal('djF'), k = +sK.value, f = D.F[id];
    btns.forEach(b => { const v = +b.dataset.v, s = bitstr(v, 3); b.classList.remove('r0', 'r1'); if (asked.has(v)) { b.textContent = s + ' → ' + asked.get(v); b.classList.add('r' + asked.get(v)); } else b.textContent = s; b.setAttribute('aria-label', b.textContent); });
    put('#djKo', t('ch5.k.' + k));
    const p0 = D.pAllZero(id), cons = D.isConstant(id);
    put('#djP0', k === 3 ? pct(p0, 0) + '%' : '—');
    put('#djV', k === 3 ? t(p0 > 0.5 ? 'ch5.verdict.const' : 'ch5.verdict.bal') : t('ch5.verdict.none'));
    put('#djAsked', t('ch5.unit.times', { v: fmt(asked.size) })); put('#djWorst', t('ch5.unit.times', { v: fmt(D.classicalWorst(3)) }));
    let key; const v = { a: fmt(1 / Math.sqrt(8), 3), p: pct(p0, 0), k: fmt([0, 1, 2, 3, 4, 5, 6, 7].filter(x => f(x)).length) };
    if (k === 0) key = 'ch5.say.s0'; else if (k === 1) key = 'ch5.say.s1'; else if (k === 2) key = cons ? 'ch5.say.s2c' : 'ch5.say.s2b'; else key = cons ? 'ch5.say.s3c' : 'ch5.say.s3b';
    putHTML('#djSay', t(key, v));
    const vals = [...asked.values()], ones = vals.filter(x => x).length, zeros = vals.length - ones;
    const ck = !vals.length ? 'ch5.csay.none' : (ones && zeros) ? 'ch5.csay.bal' : vals.length > 4 ? 'ch5.csay.const' : 'ch5.csay.open';
    putHTML('#djCSay', t(ck, { q: fmt(vals.length) }));
    sim.dirty = true;
  }
  sim.text = render;
  radios('djF').forEach(e => e.addEventListener('change', () => { asked = new Map(); render(); }));
  sK.addEventListener('input', render);
  on('#djClear', 'click', () => { asked = new Map(); render(); });
  render();
})();

/* ───────── 06 Grover ───────── */
(() => {
  const cv = $('#grCv'), cv2 = $('#grCv2'), Gr = M.grover, sN = $('#grN'), sM = $('#grM'), bRun = $('#grRun');
  let s, k, hist, running = false, acc = 0;
  const N = () => 1 << +sN.value;
  const fresh = (toOpt) => { s = Gr.start(+sN.value); k = 0; hist = [pm()]; if (toOpt) { const ko = Gr.kOpt(N()); while (k < ko) stepOnce(); } };
  function pm() { const m = +sM.value; return s.re[m] ** 2 + s.im[m] ** 2; }
  function stepOnce() { if (k >= Gr.kmaxFor(N())) return false; Gr.iterate(s, +sM.value); k++; hist.push(pm()); return true; }
  const setRun = v => { running = v; bRun.setAttribute('aria-pressed', String(v)); };
  fresh(true);
  const sim = reg([cv, cv2], {
    step(dt) {
      if (running) { acc += dt; while (acc >= 0.45 && running) { acc -= 0.45; if (!stepOnce()) setRun(false); this.dirty = true; text(); } }
      if (this.dirty) { this.draw(); this.dirty = false; }
    },
    draw() {
      const n = N(), m = +sM.value;
      { const { c, w, h } = fit(cv); let A = 0; for (let i = 0; i < n; i++) A = Math.max(A, Math.abs(s.re[i])); A *= 1.12;
        const f = frame(w, h, [26, 14, 26, 46], 0, n, -A, A);
        yTicks(c, f, [-A / 1.12, 0, A / 1.12], v => fmt(v, 2)); axes(c, f, '', t('ch6.cv.amp'));
        let mean = 0; for (let i = 0; i < n; i++) mean += s.re[i]; mean /= n;
        const bw = (f.R - f.L) / n;
        for (let i = 0; i < n; i++) { if (i === m) continue; const y0 = f.Y(0), y1 = f.Y(s.re[i]); c.fillStyle = s.re[i] >= 0 ? 'rgba(99,199,230,.8)' : 'rgba(240,122,109,.8)'; c.fillRect(f.X(i) + (bw > 3 ? 0.5 : 0), Math.min(y0, y1), Math.max(1, bw - (bw > 3 ? 1 : 0)), Math.max(1, Math.abs(y1 - y0))); }
        { const y0 = f.Y(0), y1 = f.Y(s.re[m]), xw = Math.max(3, bw); c.fillStyle = C.gold; c.fillRect(f.X(m + 0.5) - xw / 2, Math.min(y0, y1), xw, Math.max(1, Math.abs(y1 - y0))); }
        hline(c, f, mean, C.mute, [3, 4]);
        c.fillStyle = C.gold; c.textAlign = 'center'; c.font = FONT;
        const tx = clampX(f.X(m + 0.5), f.L + 20, f.R - 20), ty = s.re[m] >= 0 ? f.Y(s.re[m]) - 10 : f.Y(s.re[m]) + 12;
        c.fillText(t('ch6.cv.target'), tx, Math.max(f.T + 4, Math.min(f.B - 6, ty))); }
      { const { c, w, h } = fit(cv2), km = Gr.kmaxFor(n), f = frame(w, h, [24, 14, 32, 46], 0, km, 0, 1);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%'); axes(c, f, t('ch6.cv.k'), t('ch6.cv.prob'));
        const step = km > 20 ? 5 : km > 10 ? 2 : 1, xs = []; for (let x = 0; x <= km; x += step) xs.push(x); xTicks(c, f, xs, v => fmt(v), true);
        const pts = []; for (let x = 0; x <= km; x += km / 300) pts.push([x, Gr.exact(n, x)]); path(c, pts, f.X, f.Y, C.mute, 1.6);
        vline(c, f, Gr.kOpt(n), C.dim);
        hist.forEach((p, i) => dot(c, f.X(i), f.Y(p), i === k ? C.gold : C.cyan, i === k ? 5 : 3.2)); }
    }
  });
  function clampX(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function text() {
    const n = N(), ko = Gr.kOpt(n), p = pm(), best = Gr.exact(n, ko), cl = Math.ceil(p * n - 1e-9);
    put('#grNo', t('ch6.unit.n', { n: sN.value, N: fmt(n) })); put('#grMo', fmt(+sM.value));
    put('#grK', fmt(k)); put('#grP', pctAuto(p) + '%'); put('#grOpt', t('ch6.unit.opt', { k: fmt(ko), p: pct(best, 1) })); put('#grCl', fmt(cl));
    const key = k === 0 ? 'ch6.say.start' : k < ko ? 'ch6.say.rise' : k === ko ? 'ch6.say.peak' : 'ch6.say.over';
    putHTML('#grSay', t(key, { N: fmt(n), k: fmt(k), p: pctAuto(p), opt: fmt(ko), left: fmt(ko - k), cl: fmt(cl), pct: fmt(cl / n * 100, 0), best: pct(best, 1) }));
  }
  sim.text = text;
  sN.addEventListener('input', () => { sM.max = String(N() - 1); if (+sM.value > N() - 1) sM.value = String(N() - 1); setRun(false); fresh(false); sim.dirty = true; text(); });
  sM.addEventListener('input', () => { setRun(false); fresh(false); sim.dirty = true; text(); });
  on('#grStep', 'click', () => { setRun(false); stepOnce(); sim.dirty = true; text(); });
  on('#grRun', 'click', () => {
    if (running) { setRun(false); return; }
    if (k >= Gr.kmaxFor(N())) fresh(false);
    if (reduce) { const ko = Gr.kOpt(N()); const target = k < ko ? ko : Gr.kmaxFor(N()); while (k < target) stepOnce(); sim.dirty = true; text(); return; }
    acc = 0; setRun(true);
  });
  on('#grReset', 'click', () => { setRun(false); fresh(false); sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 Shor ───────── */
(() => {
  const cv1 = $('#shCv1'), cv2 = $('#shCv2'), Sh = M.shor, sA = $('#shA'), sT = $('#shT');
  let seed = 702, res = null, att = null; // seed 702 makes the opening run a successful one (y = 4)
  const NN = () => +radioVal('shN');
  const aList = () => Sh.coprimes(NN());
  const aa = () => aList()[Math.min(+sA.value, aList().length - 1)];
  const recompute = () => { res = Sh.run(NN(), aa(), +sT.value); res.succ = Sh.successProb(NN(), aa(), +sT.value); att = null; };
  const syncRanges = () => { const N = NN(), m = Sh.workBits(N); sA.max = String(aList().length - 1); if (+sA.value > aList().length - 1) sA.value = String(aList().length - 1); sT.max = String(10 - m); if (+sT.value > 10 - m) sT.value = String(10 - m); };
  syncRanges(); sA.value = String(aList().indexOf(7)); recompute();
  const sim = reg([cv1, cv2], {
    draw() {
      const N = NN(), a = aa(), t_ = +sT.value, Q = 1 << t_;
      { const { c, w, h } = fit(cv1), f = frame(w, h, [22, 14, 36, 44], 0, Q - 1, 0, N);
        yTicks(c, f, [0, N], v => fmt(v)); axes(c, f, t('ch7.cv.x'), t('ch7.cv.ax'));
        const pw = Sh.powers(a, N, Q), pts = pw.map((v, x) => [x, v]);
        path(c, pts, f.X, f.Y, C.dim, 1.2); pts.forEach(p => dot(c, f.X(p[0]), f.Y(p[1]), p[1] === 1 ? C.gold : C.cyan, Q > 40 ? 2.4 : 3.4));
        const xs = []; for (let x = 0; x < Q; x += Q / 4) xs.push(x); xs.push(Q - 1); xTicks(c, f, xs, v => fmt(v)); }
      { const { c, w, h } = fit(cv2), mx = Math.max(...res.p), f = frame(w, h, [24, 14, 32, 46], -0.5, Q - 0.5, 0, mx * 1.12);
        yTicks(c, f, [0, mx], v => pct(v, 0) + '%'); axes(c, f, t('ch7.cv.y'), t('ch7.cv.p'));
        const bw = (f.R - f.L) / Q;
        for (let y = 0; y < Q; y++) { c.fillStyle = att && att.y === y ? C.gold : 'rgba(99,199,230,.8)'; const yy = f.Y(res.p[y]); c.fillRect(f.X(y - 0.5) + 1, yy, Math.max(1, bw - 2), f.B - yy); }
        const xs = []; for (let y = 0; y < Q; y += Q / 4) xs.push(y); xTicks(c, f, xs, v => fmt(v)); }
    }
  });
  function text() {
    const N = NN(), a = aa(), t_ = +sT.value, Q = 1 << t_, m = Sh.workBits(N);
    put('#shAo', fmt(a)); put('#shTo', fmt(t_));
    put('#shR', fmt(Sh.order(a, N))); put('#shS', pct(res.succ, 1) + '%');
    put('#shY', att ? t('ch7.unit.y', { y: fmt(att.y), Q: fmt(Q) }) : '—');
    put('#shCF', att && att.y ? att.conv.filter(cv => cv.q < N || cv === att.conv[0]).map(cv => cv.p + '/' + cv.q).join(', ') : '—');
    let key, v = { t: fmt(t_), m: fmt(m), n: fmt(t_ + m), s: pct(res.succ, 1), N: fmt(N), a: fmt(a), Q: fmt(Q) };
    if (!att) key = 'ch7.say.none';
    else {
      key = 'ch7.say.' + att.reason; v.y = fmt(att.y); v.r = att.r == null ? '' : fmt(att.r);
      if (att.r != null && att.r % 2 === 0) { const half = Sh.modpow(a, att.r / 2, N); v.h = fmt(att.r / 2); v.half = fmt(half); v.hm = fmt(half - 1); v.hp = fmt(half + 1); v.g1 = fmt(Sh.gcd(half - 1, N)); v.g2 = fmt(Sh.gcd(half + 1, N)); }
      if (att.ok) { v.f1 = fmt(Math.min(att.f1, att.f2)); v.f2 = fmt(Math.max(att.f1, att.f2)); }
    }
    putHTML('#shSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { syncRanges(); recompute(); sim.dirty = true; text(); };
  radios('shN').forEach(e => e.addEventListener('change', () => { sA.value = '0'; if (NN() === 15) { sA.value = String(aList().indexOf(7)); } redo(); }));
  [sA, sT].forEach(e => e.addEventListener('input', redo));
  const runOnce = () => { const r = M.rng(seed++); const y = S.sampleFrom(res.p, r); att = Sh.attempt(y, +sT.value, NN(), aa()); sim.dirty = true; text(); };
  on('#shRun', 'click', runOnce);
  runOnce(); // the page opens with one run already made
  text();
})();

/* ───────── 08 crossover ───────── */
(() => {
  const cv = $('#coCv'), X = M.crossover, sC = $('#coRc'), sQ = $('#coRq');
  const P = () => ({ Rc: Math.pow(10, +sC.value), Rq: Math.pow(10, +sQ.value) });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = P(), f = frame(w, h, [26, 16, 40, 52], 0, 30, -8, 14);
      axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
      xTicks(c, f, [0, 10, 20, 30], v => pow10(v));
      [[0, 'ch8.cv.sec'], [Math.log10(86400), 'ch8.cv.day'], [Math.log10(3.15576e7), 'ch8.cv.year']].forEach(([y, k]) => { hline(c, f, y, C.grid, [2, 4]); c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t(k), f.L - 6, f.Y(y)); });
      const cl = [], gr = []; for (let x = 0; x <= 30; x += 0.25) { cl.push([x, x - Math.log10(p.Rc)]); gr.push([x, Math.log10(PI / 4) + x / 2 - Math.log10(p.Rq)]); }
      const clip = pts => pts.filter(q => q[1] >= -8 && q[1] <= 14);
      c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
      path(c, clip(cl), f.X, f.Y, C.cyan); path(c, clip(gr), f.X, f.Y, C.gold);
      const ln = Math.log10(X.nStar(p.Rc, p.Rq)), lt = Math.log10(X.tStar(p.Rc, p.Rq));
      if (ln >= 0 && ln <= 30 && lt >= -8 && lt <= 14) { dot(c, f.X(ln), f.Y(lt), C.ink, 5.5); }
      c.restore();
      if (ln >= 0 && ln <= 30 && lt >= -8 && lt <= 14) { c.fillStyle = C.ink; c.textAlign = ln > 22 ? 'right' : 'left'; c.fillText(t('ch8.cv.cross'), f.X(ln) + (ln > 22 ? -10 : 10), f.Y(lt) + 14); }
    }
  });
  function text() {
    const p = P(), Ns = X.nStar(p.Rc, p.Rq), ts = X.tStar(p.Rc, p.Rq);
    put('#coRco', t('ch8.unit.rate', { v: pow10(fmt(+sC.value, +sC.value % 1 ? 1 : 0)) })); put('#coRqo', t('ch8.unit.rate', { v: pow10(fmt(+sQ.value, +sQ.value % 1 ? 1 : 0)) }));
    put('#coN', sci(Ns)); put('#coT', duration(ts)); put('#coGap', sci(p.Rc / p.Rq));
    const key = ts < 3600 ? 'ch8.say.fast' : ts < 3.15576e7 ? 'ch8.say.mid' : 'ch8.say.long';
    putHTML('#coSay', t(key, { N: sci(Ns), t: duration(ts) }));
  }
  sim.text = text;
  [sC, sQ].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 09 noise ───────── */
(() => {
  const cv = $('#nzCv'), Gr = M.grover, sN = $('#nzN'), sP = $('#nzP');
  let curve = null, need = true;
  const P = () => ({ n: +sN.value, p: +sP.value / 100, kind: radioVal('nzKind') });
  const compute = () => { const p = P(), N = 1 << p.n; curve = Gr.noisyCurve(p.n, 5 % N, Gr.kmaxFor(N), p.p, p.kind, Gr.TRAJ, Gr.SEED); need = false; };
  compute();
  const sim = reg(cv, {
    step() { if (need) { compute(); this.dirty = true; text(); } if (this.dirty) { this.draw(); this.dirty = false; } },
    draw() {
      const { c, w, h } = fit(cv), p = P(), N = 1 << p.n, km = Gr.kmaxFor(N), f = frame(w, h, [26, 14, 34, 46], 0, km, 0, 1);
      yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%'); axes(c, f, t('ch9.cv.k'), t('ch9.cv.prob'));
      const step = km > 20 ? 5 : km > 10 ? 2 : 1, xs = []; for (let x = 0; x <= km; x += step) xs.push(x); xTicks(c, f, xs, v => fmt(v), true);
      const pts = []; for (let x = 0; x <= km; x += km / 300) pts.push([x, Gr.exact(N, x)]); path(c, pts, f.X, f.Y, C.mute, 1.6);
      hline(c, f, 1 / N, C.red);
      path(c, curve.map((v, i) => [i, v]), f.X, f.Y, C.cyan, 2); curve.forEach((v, i) => dot(c, f.X(i), f.Y(v), C.cyan, 3));
    }
  });
  function text() {
    const p = P(), N = 1 << p.n, ko = Gr.kOpt(N), ideal = Gr.exact(N, ko);
    let best = 0, kb = 0; curve.forEach((v, i) => { if (v > best) { best = v; kb = i; } });
    const e = Gr.expectedErrors(p.n, ko, p.p);
    put('#nzNo', fmt(p.n)); put('#nzPo', fmt(+sP.value, 1) + '%');
    put('#nzIdeal', t('ch9.unit.ideal', { p: pct(ideal, 1), k: fmt(ko) })); put('#nzBest', t('ch9.unit.best', { p: pct(best, 1), k: fmt(kb) }));
    put('#nzErr', fmt(e, 2)); put('#nzGuess', pctAuto(1 / N) + '%');
    const key = p.p === 0 ? 'ch9.say.clean' : best < 4 / N ? 'ch9.say.dead' : e < 0.3 ? 'ch9.say.ok' : kb < ko ? 'ch9.say.hurtEarly' : 'ch9.say.hurt';
    putHTML('#nzSay', t(key, { k: fmt(ko), p: pct(ideal, 1), e: fmt(e, 2), ideal: pct(ideal, 1), best: pct(best, 1), kb: fmt(kb), guess: pctAuto(1 / N) }));
  }
  sim.text = text;
  const redo = () => { need = true; sim.dirty = true; if (!sim.vis) { compute(); text(); } };
  [sN, sP].forEach(e => e.addEventListener('input', () => { put('#nzNo', fmt(+sN.value)); put('#nzPo', fmt(+sP.value, 1) + '%'); redo(); }));
  radios('nzKind').forEach(e => e.addEventListener('change', redo));
  text();
})();

/* ───────── 10 error correction ───────── */
(() => {
  const cv = $('#rcCv'), Rp = M.rep, r = M.rng(5);
  let errs = [0, 'X', 0], res = null;
  const bs = [0, 1, 2].map(i => $('#rcE' + i));
  const recompute = () => { res = Rp.round(errs, r); };
  recompute();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), gap = Math.min(150, (w - 40) / 3), x0 = w / 2 - gap, yD = h * 0.38, yA = h * 0.74, R = Math.min(20, gap * 0.3), roomy = gap >= 90;
      const xs = [x0, x0 + gap, x0 + 2 * gap], xa = [x0 + gap / 2, x0 + 1.5 * gap];
      c.strokeStyle = C.dim; c.lineWidth = 2;
      [[0, 0], [1, 0], [1, 1], [2, 1]].forEach(([d, a]) => { c.beginPath(); c.moveTo(xs[d], yD + R); c.lineTo(xa[a], yA - R + 4); c.stroke(); });
      c.font = FONT; c.textAlign = 'center';
      xs.forEach((x, q) => {
        const e = errs[q]; c.fillStyle = '#1a1f2b'; c.beginPath(); c.arc(x, yD, R, 0, 6.283); c.fill();
        c.strokeStyle = e ? C.red : C.cyan; c.lineWidth = 2; c.stroke();
        if (e) { c.fillStyle = C.red; c.font = FONTB; c.fillText(e, x, yD); c.font = FONT; }
        if (res.fix === q) { c.strokeStyle = C.gold; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.arc(x, yD, R + 6, 0, 6.283); c.stroke(); c.setLineDash([]); if (roomy) { c.fillStyle = C.gold; c.textAlign = 'left'; c.fillText(t('ch10.cv.fix'), x + R + 10, yD); c.textAlign = 'center'; } }
        c.fillStyle = C.mute; c.fillText(roomy ? t('ch10.cv.q', { q: q + 1 }) : String(q + 1), x, yD - R - 14);
      });
      xa.forEach((x, a) => { const sb = res.syndrome[a]; c.fillStyle = sb ? 'rgba(179,157,251,.35)' : '#1a1f2b'; c.fillRect(x - 16, yA - 16, 32, 32); c.strokeStyle = C.violet; c.lineWidth = 1.5; c.strokeRect(x - 16, yA - 16, 32, 32); c.fillStyle = C.ink; c.font = FONTB; c.fillText(String(sb), x, yA); c.font = FONT; });
      c.fillStyle = C.mute; c.textAlign = 'left';
      if (w >= 520) { c.fillText(t('ch10.cv.data'), 10, yD); c.fillText(t('ch10.cv.anc'), 10, yA); }
      else { c.textAlign = 'center'; c.fillText(t('ch10.cv.anc'), w / 2, yA + 34); c.fillText(t('ch10.cv.data'), w / 2, 14); }
    }
  });
  function text() {
    bs.forEach((b, i) => { b.textContent = t('ch10.ctl.e', { q: i + 1 }) + (errs[i] ? ' · ' + errs[i] : ''); b.setAttribute('aria-pressed', String(!!errs[i])); });
    put('#rcSyn', res.syndrome[0] + ' / ' + res.syndrome[1]);
    put('#rcFix', res.fix < 0 ? t('ch10.fix.none') : t('ch10.fix.q', { q: res.fix + 1 }));
    put('#rcFid', fmt(res.fidelity, 3)); put('#rcRes', t(res.ok ? 'ch10.res.ok' : 'ch10.res.bad'));
    const nx = errs.filter(e => e === 'X').length, nz = errs.filter(e => e === 'Z').length;
    let key;
    if (!nx && !nz) key = 'ch10.say.none';
    else if (nx && nz) key = 'ch10.say.mixed';
    else if (nz) key = res.ok ? 'ch10.say.zcancel' : 'ch10.say.z';
    else key = nx === 1 ? 'ch10.say.fixed' : nx === 2 ? 'ch10.say.two' : 'ch10.say.three';
    putHTML('#rcSay', t(key, { q: errs.findIndex(e => e === 'X') + 1, s1: res.syndrome[0], s2: res.syndrome[1], f: fmt(res.fidelity, 3), fix: res.fix < 0 ? t('ch10.fix.none') : t('ch10.fix.q', { q: res.fix + 1 }) }));
  }
  sim.text = text;
  bs.forEach((b, i) => b.addEventListener('click', () => { const k = radioVal('rcKind'); errs[i] = errs[i] === k ? 0 : k; recompute(); sim.dirty = true; text(); }));
  on('#rcClear', 'click', () => { errs = [0, 0, 0]; recompute(); sim.dirty = true; text(); });
  text();
})();

(() => {
  const cv = $('#rbCv'), Rp = M.rep, sP = $('#rbP');
  const grid = []; for (let k = 1; k <= 12; k++) { const p = k * 0.05; grid.push([p, Rp.monteCarlo(p, Rp.TRIALS, Rp.SEED + k)]); }
  let mc = 0;
  const recompute = () => { mc = Rp.monteCarlo(+sP.value / 100, Rp.TRIALS, Rp.SEED); };
  recompute();
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = +sP.value / 100, f = frame(w, h, [26, 16, 36, 50], 0, 0.6, 0, 0.7);
      yTicks(c, f, [0, 0.2, 0.4, 0.6], v => fmt(v * 100) + '%'); axes(c, f, t('ch10.cv.p'), t('ch10.cv.pl'));
      xTicks(c, f, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], v => fmt(v * 100) + '%', true);
      c.strokeStyle = C.red; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.X(0), f.Y(0)); c.lineTo(f.X(0.6), f.Y(0.6)); c.stroke(); c.setLineDash([]);
      const pts = []; for (let x = 0; x <= 0.6; x += 0.005) pts.push([x, Rp.logical(x)]); path(c, pts, f.X, f.Y, C.cyan);
      grid.forEach(([x, y]) => dot(c, f.X(x), f.Y(y), 'rgba(233,185,73,.6)', 3));
      dot(c, f.X(p), f.Y(mc), C.gold, 5.5);
      c.textAlign = 'left'; c.fillStyle = C.red; c.fillText(t('ch10.cv.raw'), f.X(0.3) + 8, f.Y(0.3) - 12);
      c.fillStyle = C.cyan; c.fillText(t('ch10.cv.code'), f.X(0.2) + 4, f.Y(Rp.logical(0.2)) + 14);
    }
  });
  function text() {
    const p = +sP.value / 100, pl = Rp.logical(p);
    put('#rbPo', fmt(+sP.value) + '%'); put('#rbRaw', pct(p, 1) + '%'); put('#rbPL', pctAuto(pl) + '%'); put('#rbMC', pctAuto(mc) + '%');
    put('#rbGain', p === 0 ? '—' : t('ch10.unit.gain', { v: fmt(p / pl, p / pl >= 10 ? 0 : 1) }));
    const key = p === 0 ? 'ch10.say.B.zero' : Math.abs(p - 0.5) < 0.005 ? 'ch10.say.B.even' : p < 0.5 ? 'ch10.say.B.better' : 'ch10.say.B.worse';
    putHTML('#rbSay', t(key, { p: fmt(p * 100), pl: pctAuto(pl), x: fmt(p / pl, p / pl >= 10 ? 0 : 1) }));
  }
  sim.text = text;
  sP.addEventListener('input', () => { recompute(); sim.dirty = true; text(); });
  text();
})();

(() => {
  const cv = $('#scCv'), Sc = M.surface, sP = $('#scP'), sT = $('#scT');
  const P = () => ({ p: Math.pow(10, +sP.value), target: Math.pow(10, +sT.value) });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), q = P(), d = Sc.distanceFor(q.p, q.target), f = frame(w, h, [26, 16, 36, 52], 3, 61, -16, 0);
      yTicks(c, f, [0, -4, -8, -12, -16], v => pow10(v)); axes(c, f, t('ch10.cv.d'), t('ch10.cv.pL'));
      xTicks(c, f, [3, 11, 21, 31, 41, 51, 61], v => fmt(v), true);
      hline(c, f, Math.log10(q.target), C.green);
      c.fillStyle = C.green; c.textAlign = 'right'; c.fillText(t('ch10.cv.target'), f.R, f.Y(Math.log10(q.target)) - 10);
      const pts = []; for (let dd = 3; dd <= 61; dd += 2) { const y = Math.log10(Sc.pL(q.p, dd)); if (y >= -16 && y <= 0) pts.push([dd, y]); }
      if (pts.length) { path(c, pts, f.X, f.Y, C.cyan); pts.forEach(p => dot(c, f.X(p[0]), f.Y(p[1]), C.cyan, 2.6)); }
      if (d && d <= 61) dot(c, f.X(d), f.Y(Math.log10(Sc.pL(q.p, d))), C.gold, 6);
    }
  });
  function text() {
    const q = P(), d = Sc.distanceFor(q.p, q.target), tg = pow10(+sT.value);
    put('#scPo', fmt(q.p * 100, q.p < 0.001 ? 3 : 2) + '%'); put('#scTo', tg);
    put('#scD', d ? fmt(d) : '—'); put('#scQ', d ? fmt(Sc.qubits(d)) : '—'); put('#scGot', d ? sci(Sc.pL(q.p, d)) : '—'); put('#scLam', fmt(Sc.PTH / q.p, Sc.PTH / q.p >= 10 ? 0 : 2));
    const key = q.p >= Sc.PTH ? 'ch10.say.C.above' : d == null ? 'ch10.say.C.far' : 'ch10.say.C.below';
    putHTML('#scSay', t(key, { p: fmt(q.p * 100, q.p < 0.001 ? 3 : 2), r: t('u.ofTh', { v: fmt(q.p / Sc.PTH, 2) }), lam: fmt(Sc.PTH / q.p, Sc.PTH / q.p >= 10 ? 0 : 2), target: tg, d: d ? fmt(d) : '', q: d ? fmt(Sc.qubits(d)) : '' }));
  }
  sim.text = text;
  [sP, sT].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 11 frontier: Λ extrapolation and the data cards ───────── */
(() => {
  const cv = $('#fxCv'), Lm = M.lambdaModel, Sc = M.surface, F = M.FRONTIER, W = F.hardware[0].v, sL = $('#fxLam'), sT = $('#fxT');
  const eps7 = W.eps7 / 100;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), lam = +sL.value, tg = Math.pow(10, +sT.value), d = Lm.distanceFor(tg, eps7, lam), f = frame(w, h, [26, 16, 36, 52], 3, 81, -16, 0);
      yTicks(c, f, [0, -4, -8, -12, -16], v => pow10(v)); axes(c, f, t('ch11.cv.d'), t('ch11.cv.eps'));
      xTicks(c, f, [3, 21, 41, 61, 81], v => fmt(v), true);
      hline(c, f, Math.log10(tg), C.green); c.fillStyle = C.green; c.textAlign = 'right'; c.fillText(t('ch11.cv.target'), f.R, f.Y(Math.log10(tg)) - 10);
      const line = l => { const pts = []; for (let dd = 3; dd <= 81; dd += 2) { const y = Math.log10(Lm.eps(dd, eps7, l)); if (y >= -16 && y <= 0) pts.push([dd, y]); } return pts; };
      if (Math.abs(lam - W.lam) > 0.01) { c.setLineDash([4, 4]); path(c, line(W.lam), f.X, f.Y, C.dim, 1.5); c.setLineDash([]); }
      path(c, line(lam), f.X, f.Y, C.cyan);
      dot(c, f.X(7), f.Y(Math.log10(eps7)), C.violet, 6); c.fillStyle = C.violet; c.textAlign = 'left'; c.fillText(t('ch11.cv.meas'), f.X(7) + 10, f.Y(Math.log10(eps7)) - 12);
      if (d && d <= 81) dot(c, f.X(d), f.Y(Math.log10(Lm.eps(d, eps7, lam))), C.gold, 6);
    }
  });
  function text() {
    const lam = +sL.value, tg = Math.pow(10, +sT.value), d = Lm.distanceFor(tg, eps7, lam), tgs = pow10(+sT.value);
    put('#fxLamo', fmt(lam, 2)); put('#fxTo', tgs);
    put('#fxD', d ? fmt(d) : '—'); put('#fxQ', d ? fmt(Sc.qubits(d)) : '—'); put('#fxEps', d ? sci(Lm.eps(d, eps7, lam)) : '—');
    put('#fxMeas', t('ch11.unit.meas', { e: fmt(W.eps7, 3), l: fmt(W.lam, 2) }));
    const key = d == null ? 'ch11.say.far' : lam >= 3 ? 'ch11.say.good' : 'ch11.say.base';
    putHTML('#fxSay', t(key, { lam: fmt(lam, 2), target: tgs, d: d ? fmt(d) : '', q: d ? fmt(Sc.qubits(d)) : '', chip: fmt(W.q) }));
  }
  sim.text = text;
  [sL, sT].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();

  // cards
  const KIND = { demo: 'd', claim: 'c', contested: 'x', estimate: 's', standard: 'e' };
  const val = v => typeof v !== 'number' ? String(v) : (Math.abs(v) >= 1e5 || (v !== 0 && Math.abs(v) < 0.01)) ? sci(v) : v.toLocaleString('en-US', { maximumFractionDigits: 4 });
  function card(item) {
    const [y, m] = item.asOf.split('-').map(Number), vars = {};
    for (const k in item.v) vars[k] = val(item.v[k]);
    return `<div class="card"><div class="meta"><span class="tag ${KIND[item.kind]}">${t('fr.kind.' + item.kind)}</span><span>${t('fr.asOf', { y, m, mon: t('mon.' + m) })}</span></div>${t('fr.' + item.id, vars)}</div>`;
  }
  const fill = () => { $('#frHw').innerHTML = F.hardware.map(card).join(''); $('#frAdv').innerHTML = F.advantage.map(card).join(''); $('#frEst').innerHTML = F.estimates.map(card).join(''); $('#frPqc').innerHTML = F.crypto.map(card).join(''); };
  langHooks.push(fill); fill();
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
