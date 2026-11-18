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
  renderDiagrams(true);
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
window.addEventListener('resize', () => { sims.forEach(s => { s.dirty = true; }); renderDiagrams(false); });
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

/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, labels from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, prose column ≥ 600 px) and 'n' (viewBox 340 wide). Text is 14 units, so it
   renders at ≥ 11.7 px in either layout at its narrowest. A label with a width limit wraps onto more lines.
   Colours follow the page: cyan = quantum state / data qubits / demonstrated, gold = the reader's target or choice,
   violet = measurement qubits / estimates, red = errors and limits. */
const NS = 'http://www.w3.org/2000/svg';
const FS = 14, LH = 18;
function E(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function mk(svg) {
  const mark = (col) => `url(#ar-${(col || C.mute).slice(1)})`;
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; E('rect', { x, y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: o.solid ? col : o.fill || tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; E('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? mark(col) : 'none', 'marker-start': o.both ? mark(col) : 'none' }, svg); },
    path(d, col, o) { o = o || {}; E('path', { d, fill: o.fill ? tint(o.fill, o.a == null ? 0.13 : o.a) : 'none', stroke: o.nostroke ? 'none' : col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? mark(col) : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; E('circle', { cx, cy, r, fill: o.solid ? col : o.none ? 'none' : tint(col, o.a == null ? 0.14 : o.a), stroke: col, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none' }, svg); },
    ellipse(cx, cy, rx, ry, col, o) { o = o || {}; E('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: col, 'stroke-width': o.sw || 1.2, 'stroke-dasharray': o.dash || 'none' }, svg); },
    // text: key (or {raw}), position, options: a = start|middle|end, c = colour class, w = wrap width, vars
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, o.vars);
      const e = E('text', { x, y, 'font-size': o.fs || FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: (o.c || '') + (o.mono ? ' mono' : '') }, svg);
      e.textContent = s; if (o.w) { e.dataset.w = o.w; e.dataset.va = o.va || 'top'; } if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    },
    // a gate box on a wire with a short raw label (H, X, …)
    gate(cx, cy, s, col, o) { o = o || {}; const w = o.w || 26, h = o.h || 26; g.box(cx - w / 2, cy - h / 2, w, h, col || C.ink, { rx: 5, fill: '#141821' }); if (s) g.text(cx, cy + 0.5, { raw: s }, { a: 'middle', c: o.c || '', fs: o.fs || FS }); },
    // a measurement: box with a dial
    meter(cx, cy, col) { col = col || C.gold; g.box(cx - 14, cy - 13, 28, 26, col, { rx: 5, fill: '#141821' }); g.path(`M${cx - 8},${cy + 6} A8,8 0 0,1 ${cx + 8},${cy + 6}`, col, { sw: 1.4 }); g.line(cx, cy + 6, cx + 6, cy - 6, col, { sw: 1.4 }); },
    num(x, y, n, col) { g.circle(x, y, 10, col || C.ink, { solid: true, sw: 1 }); g.text(x, y + 0.5, { raw: String(n) }, { a: 'middle', c: 'k', fs: 13.5, weight: 700 }); }
  };
  return g;
}
function arrowDefs(svg) {
  const d = E('defs', {}, svg);
  for (const col of [C.mute, C.gold, C.cyan, C.red, C.green, C.violet, C.ink]) {
    const m = E('marker', { id: 'ar-' + col.slice(1), viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
    E('path', { d: 'M0,0 L10,5 L0,10 z', fill: col }, m);
  }
}
// wrap text that has a width limit: split at spaces (or between CJK characters) into tspans
// wrapOne returns the number of lines and clears the limit, so a diagram can wrap a label while drawing and place
// the next thing under it
function wrapOne(e) {
    const maxw = +e.dataset.w; delete e.dataset.w; if (e.getComputedTextLength() <= maxw) return 1;
    const s = e.textContent, x = e.getAttribute('x'), y0 = +e.getAttribute('y'), cjk = /[\u3000-\u9fff\uff00-\uffef]/.test(s);
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:_=^±⟩|⁰¹²³⁴⁵⁶⁷⁸⁹⁻ⁿᵗˣ]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; const lines = []; let cur = '';
    const probe = E('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = E('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
    return lines.length;
}
function wrapTexts(svg) { for (const e of svg.querySelectorAll('text[data-w]')) wrapOne(e); }
const DG = {};
const P1 = v => v.toFixed(1);

// ch1 · the Bloch sphere with θ and φ marked (schematic; the arrow is drawn at θ = 60°, φ = 60°)
DG.bloch = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 290 : 424;
  return { W, H, draw(g) {
    const R = 104, cx = wide ? 170 : 170, cy = 146, az = deg(-35), el = deg(18);
    const pr = (x, y, z, k = 1) => { const x1 = x * Math.cos(az) - y * Math.sin(az), y1 = x * Math.sin(az) + y * Math.cos(az); return [cx + k * R * y1, cy - k * R * (z * Math.cos(el) - x1 * Math.sin(el))]; };
    g.circle(cx, cy, R, C.line, { none: true, sw: 1.4 });
    g.ellipse(cx, cy, R, R * Math.sin(el), C.line, { dash: '3 4' });
    const ax = (v, col) => { const a = pr(...v), b = pr(-v[0], -v[1], -v[2]); g.line(b[0], b[1], a[0], a[1], col, { sw: 1.1 }); return a; };
    ax([0, 0, 1], C.mute); const xa = ax([1, 0, 0], C.dim), ya = ax([0, 1, 0], C.dim);
    const th = deg(60), ph = deg(60), v = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
    const tip = pr(...v), foot = pr(v[0], v[1], 0);
    g.line(cx, cy, foot[0], foot[1], C.mute, { dash: '3 3', sw: 1.1 }); g.line(foot[0], foot[1], tip[0], tip[1], C.mute, { dash: '3 3', sw: 1.1 });
    const poly = (pts, col) => g.path('M' + pts.map(p => P1(p[0]) + ',' + P1(p[1])).join(' L'), col, { sw: 1.8 });
    const thArc = []; for (let i = 0; i <= 16; i++) { const a = th * i / 16; thArc.push(pr(Math.sin(a) * Math.cos(ph), Math.sin(a) * Math.sin(ph), Math.cos(a), 0.42)); } poly(thArc, C.gold);
    const phArc = []; for (let i = 0; i <= 16; i++) { const a = ph * i / 16; phArc.push(pr(Math.cos(a), Math.sin(a), 0, 0.5)); } poly(phArc, C.violet);
    g.line(cx, cy, tip[0], tip[1], C.cyan, { sw: 2.6, arrow: true });
    g.text(cx, cy - R - 14, { raw: '|0⟩' }, { a: 'middle' }); g.text(cx, cy + R + 15, { raw: '|1⟩' }, { a: 'middle' });
    g.text(xa[0] - 8, xa[1] + 13, { raw: 'x' }, { a: 'middle', c: 'm' }); g.text(ya[0] + 12, ya[1], { raw: 'y' }, { a: 'middle', c: 'm' });
    const tm = pr(Math.sin(th / 2) * Math.cos(ph), Math.sin(th / 2) * Math.sin(ph), Math.cos(th / 2), 0.58); g.text(tm[0], tm[1], { raw: 'θ' }, { a: 'middle', c: 'g' });
    const pm = pr(Math.cos(ph / 2), Math.sin(ph / 2), 0, 0.68); g.text(pm[0] - 2, pm[1] + 9, { raw: 'φ' }, { a: 'middle', c: 'v' });
    g.text(tip[0] + 10, tip[1] - 8, { raw: '|ψ⟩' }, { c: 'c' });
    const tx = wide ? 350 : 10, tw = wide ? 360 : 320, ty = wide ? 44 : 296;
    [['dg.bloch.pole', ''], ['dg.bloch.theta', 'g'], ['dg.bloch.phi', 'v']].forEach(([k, c], i) => g.text(tx, ty + i * (wide ? 76 : 46), k, { c, w: tw }));
  } };
};

// ch2 · the interferometer and the three-gate circuit it is (schematic)
DG.mz = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 236 : 420;
  return { W, H, draw(g) {
    const x0 = wide ? 20 : 12, yT = 66, yB = 156, bx1 = x0 + 52, bx2 = x0 + 232;
    const beam = (a, b, c2, d, col) => g.line(a, b, c2, d, col, { sw: 2.4 });
    beam(x0, yB, bx1, yB, C.gold);
    beam(bx1, yB, bx2, yB, C.violet); beam(bx2, yB, bx2, yT, C.violet);
    beam(bx1, yB, bx1, yT, C.cyan); beam(bx1, yT, bx2, yT, C.cyan);
    beam(bx2, yT, x0 + 276, yT, C.mute); beam(bx2, yT, bx2, yT - 28, C.mute);
    g.circle(x0 + 287, yT, 11, C.gold, { a: 0.3 }); g.circle(bx2, yT - 39, 11, C.gold, { a: 0.3 });
    const bs = (x, y) => g.line(x - 11, y + 11, x + 11, y - 11, C.ink, { sw: 3.2 });
    const mir = (x, y) => g.line(x - 10, y + 10, x + 10, y - 10, C.mute, { sw: 4.5 });
    bs(bx1, yB); bs(bx2, yT); mir(bx1, yT); mir(bx2, yB);
    const pmid = (bx1 + bx2) / 2; g.box(pmid - 17, yT - 10, 34, 20, C.cyan, { rx: 4, fill: '#141821' }); g.text(pmid, yT + 0.5, { raw: 'φ' }, { a: 'middle', c: 'c' });
    g.text(x0, yB + 20, 'dg.mz.src', { c: 'g' });
    g.text(bx1 + 16, yB + 20, 'dg.mz.bs', { c: '' });
    g.text(bx2 - 16, yT + 22, 'dg.mz.bs', { a: 'end' });
    g.text(pmid, yT - 24, 'dg.mz.phase', { a: 'middle', c: 'c' });
    g.text(bx1 - 16, (yT + yB) / 2, 'dg.mz.up', { a: 'end', c: 'c' });
    g.text(pmid + 10, yB - 16, 'dg.mz.low', { a: 'middle', c: 'v' });
    g.text(bx2 + 18, yT - 39, 'dg.mz.d1', { c: 'm' });
    g.text(x0 + 318, yT + 26, 'dg.mz.d0', { a: 'end', c: 'm' });
    // the circuit
    const cx0 = wide ? 390 : 16, cy = wide ? 96 : 268, xs = [cx0 + 74, cx0 + 142, cx0 + 210, cx0 + 278];
    g.text(wide ? cx0 : 10, cy - 52, 'dg.mz.same', { c: 'm', w: wide ? 320 : 320 });
    g.text(cx0 + 4, cy, { raw: '|0⟩' }, {}); g.line(cx0 + 34, cy, xs[3] - 14, cy, C.ink, { sw: 1.6 });
    g.gate(xs[0], cy, 'H'); g.gate(xs[1], cy, 'P(φ)', C.cyan, { w: 46, c: 'c' }); g.gate(xs[2], cy, 'H'); g.meter(xs[3], cy);
    ['dg.mz.g1', 'dg.mz.g2', 'dg.mz.g3', 'dg.mz.g4'].forEach((k, i) => { g.line(xs[i], cy + 14, xs[i], cy + 26, C.dim, { sw: 1 }); g.text(xs[i], cy + 38, k, { a: 'middle', c: 'm', w: 62 }); });
  } };
};

// ch3 · who sends what in the CHSH game (schematic)
DG.chsh = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = 262;
  return { W, H, draw(g) {
    const bw = wide ? 190 : 118, m = W / 2, ax = wide ? 70 : 6, bx = W - ax - bw, by = 118, bh = 56;
    g.box(m - (wide ? 110 : 96), 8, wide ? 220 : 192, 40, C.ink, { a: 0.06 }); g.text(m, 28.5, 'dg.chsh.ref', { a: 'middle' });
    g.box(ax, by, bw, bh, C.gold); g.box(bx, by, bw, bh, C.cyan);
    g.text(ax + bw / 2, by + 17, 'dg.chsh.alice', { a: 'middle', c: 'g', weight: 600 }); g.text(ax + bw / 2, by + 39, 'dg.chsh.aliceDo', { a: 'middle' });
    g.text(bx + bw / 2, by + 17, 'dg.chsh.bob', { a: 'middle', c: 'c', weight: 600 }); g.text(bx + bw / 2, by + 39, 'dg.chsh.bobDo', { a: 'middle' });
    const sx = wide ? 80 : 62, ac = ax + bw / 2, bc = bx + bw / 2;
    g.line(m - sx - 9, 50, ac - 9, by - 4, C.mute, { arrow: true }); g.line(ac + 9, by - 4, m - sx + 9, 50, C.gold, { arrow: true });
    g.line(m + sx + 9, 50, bc + 9, by - 4, C.mute, { arrow: true }); g.line(bc - 9, by - 4, m + sx - 9, 50, C.cyan, { arrow: true });
    const lx = (ac + m - sx) / 2, rx = (bc + m + sx) / 2, ly = 82;
    // narrow: a and b sit lower on their arrows, clear of the "no communication" label between them
    const ay = wide ? ly : 102, ao = wide ? 22 : 7;
    g.text(lx - 22, ly, { raw: 'x' }, { a: 'middle', c: 'm' }); g.text(lx + ao, ay, { raw: 'a' }, { a: 'middle', c: 'g' });
    g.text(rx + 22, ly, { raw: 'y' }, { a: 'middle', c: 'm' }); g.text(rx - ao, ay, { raw: 'b' }, { a: 'middle', c: 'c' });
    g.line(m, 96, m, by + bh - 20, C.red, { dash: '5 4', sw: 1.8 }); g.text(m, 80, 'dg.chsh.wall', { a: 'middle', c: 'r' });
    const py = by + bh + 16; g.path(`M${ac},${by + bh} C${ac},${py + 14} ${bc},${py + 14} ${bc},${by + bh}`, C.violet, { dash: '2 4', sw: 2 });
    g.circle(ac, by + bh, 5, C.violet, { solid: true }); g.circle(bc, by + bh, 5, C.violet, { solid: true });
    g.text(m, py + 26, 'dg.chsh.pair', { a: 'middle', c: 'v' });
    g.text(m, H - 16, 'dg.chsh.rule', { a: 'middle' });
  } };
};

// ch4 · three bits hold one of 8 combinations; three qubits hold 8 amplitudes (arrows are a real 3-qubit state from the simulator)
DG.amps = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = 214;
  return { W, H, draw(g) {
    const cw = wide ? 60 : 40, x0 = (W - 8 * cw) / 2, st = M.memory.randomState(3, 4);
    g.text(x0, 14, 'dg.amps.classical', {});
    for (let i = 0; i < 8; i++) { const on = i === 5; g.box(x0 + i * cw + 2, 28, cw - 4, 30, on ? C.gold : C.line, { rx: 5, a: on ? 0.3 : 0.08 }); g.text(x0 + i * cw + cw / 2, 43.5, { raw: bitstr(i, 3) }, { a: 'middle', mono: true, fs: 13, c: on ? 'g' : 'm' }); }
    g.text(x0, 86, 'dg.amps.quantum', {});
    let mx = 0; for (let i = 0; i < 8; i++) mx = Math.max(mx, Math.hypot(st.re[i], st.im[i]));
    for (let i = 0; i < 8; i++) {
      const cx = x0 + i * cw + cw / 2, cy = 124, k = 17 / mx; g.box(x0 + i * cw + 2, 100, cw - 4, 48, C.cyan, { rx: 5, a: 0.08 });
      g.line(cx, cy, cx + st.re[i] * k, cy - st.im[i] * k, C.cyan, { sw: 2, arrow: true });
      g.text(cx, 162, { raw: bitstr(i, 3) }, { a: 'middle', mono: true, fs: 13, c: 'm' });
    }
    g.path(`M${x0 + 2},176 v6 h${8 * cw - 4} v-6`, C.dim, { sw: 1.2 });
    g.text(W / 2, 198, 'dg.amps.count', { a: 'middle', c: 'c' });
  } };
};

// ch5 · the Deutsch–Jozsa circuit; the numbered lines are the slider's stages 0–3
DG.dj = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = 236;
  return { W, H, draw(g) {
    const k = wide ? 1.7 : 1, ox = wide ? 40 : 0, X = v => ox + v * k, ys = [40, 78, 116, 164];
    const xk = X(8), s0 = X(46), h1 = X(66), s1 = X(90), oa = X(106), ob = X(180), s2 = X(196), h2 = X(218), s3 = X(242), me = X(266), end = X(300);
    ys.forEach((y, i) => { g.text(xk, y, { raw: i < 3 ? '|0⟩' : '|1⟩' }, { c: i < 3 ? '' : 'v' }); g.line(xk + 30, y, i < 3 ? me : end, y, i < 3 ? C.ink : C.violet, { sw: 1.5 }); });
    [s0, s1, s2, s3].forEach((x, i) => { g.line(x, 20, x, 190, C.gold, { dash: '3 4', sw: 1.1 }); g.num(x, 206, i, C.gold); });
    ys.forEach((y, i) => g.gate(h1, y, 'H', i < 3 ? C.ink : C.violet));
    g.box(oa, 22, ob - oa, 160, C.cyan, { fill: '#141821' }); g.text((oa + ob) / 2, 100, 'dg.dj.oracle', { a: 'middle', c: 'c', w: ob - oa - 10, va: 'mid' });
    ys.slice(0, 3).forEach(y => { g.gate(h2, y, 'H'); g.meter(me, y); });
    if (wide) { g.text(end + 14, 78, 'dg.dj.in', { c: 'm', w: 110, va: 'mid' }); g.text(end + 14, 164, 'dg.dj.ans', { c: 'v', w: 110, va: 'mid' }); }
  } };
};

// ch6 · Grover as a rotation, drawn to scale for N = 64 (angles from the model)
DG.grover = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 270 : 384;
  return { W, H, draw(g) {
    const N = 64, th = M.grover.theta(N), ko = M.grover.kOpt(N), R = 160, ox = wide ? 80 : 62, oy = 214;
    g.line(ox, oy, ox + R + 26, oy, C.mute, { sw: 1.2, arrow: true }); g.line(ox, oy, ox, oy - R - 26, C.mute, { sw: 1.2, arrow: true });
    g.path(arc(ox, oy, R, 0, 96), C.line, { sw: 1, dash: '2 4' });
    for (let k = 0; k <= ko; k++) {
      const a = (2 * k + 1) * th, x = ox + R * Math.cos(a), y = oy - R * Math.sin(a), ends = k === 0 || k === ko;
      g.line(ox, oy, x, y, ends ? C.gold : C.cyan, { sw: ends ? 2.4 : 1.5, arrow: true });
      if (k > 0 && k < ko) g.text(ox + (R + 13) * Math.cos(a), oy - (R + 13) * Math.sin(a), { raw: String(k) }, { a: 'middle', c: 'c', fs: 13 });
    }
    g.text(ox + R * Math.cos(th) + 8, oy - R * Math.sin(th) - 2, { raw: 'k = 0' }, { c: 'g' });
    g.text(ox - 22, oy - R * Math.sin((2 * ko + 1) * th) + 22, { raw: 'k = ' + ko }, { a: 'end', c: 'g' });
    g.path(arc(ox, oy, 74, th * 180 / PI, 3 * th * 180 / PI), C.violet, { sw: 2 });
    g.text(ox + 92 * Math.cos(2 * th), oy - 92 * Math.sin(2 * th), { raw: '2θ' }, { a: 'middle', c: 'v' });
    g.text(ox + 8, oy - R - 34, 'dg.grover.yaxis', { c: 'g' });
    g.text(ox + R + 26, oy + 18, 'dg.grover.xaxis', { a: 'end', c: 'm', vars: { rest: fmt(N - 1) } });
    const tx = wide ? 350 : 10, tw = wide ? 360 : 320, ty = wide ? 60 : 262;
    g.text(tx, ty, 'dg.grover.scale', { w: tw, vars: { N: fmt(N), th: fmt(th * 180 / PI, 1), k: fmt(ko), end: fmt((2 * ko + 1) * th * 180 / PI, 1) } });
    g.text(tx, ty + (wide ? 86 : 78), 'dg.grover.rule', { c: 'm', w: tw });
  } };
};
function arc(cx, cy, r, d0, d1) { const p = (d) => [cx + r * Math.cos(d * PI / 180), cy - r * Math.sin(d * PI / 180)], a = p(d0), b = p(d1); return `M${P1(a[0])},${P1(a[1])} A${r},${r} 0 ${Math.abs(d1 - d0) > 180 ? 1 : 0},0 ${P1(b[0])},${P1(b[1])}`; }

// ch7 · Shor's algorithm: classical, quantum, classical (schematic)
DG.shor = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 236 : 462;
  return { W, H, draw(g) {
    const A = wide ? { x: 8, y: 20, w: 130, h: 196 } : { x: 8, y: 8, w: 324, h: 70 };
    const Q = wide ? { x: 160, y: 20, w: 342, h: 196 } : { x: 8, y: 104, w: 324, h: 212 };
    const B = wide ? { x: 524, y: 20, w: 188, h: 196 } : { x: 8, y: 342, w: 324, h: 112 };
    const card = (b, col, title, body) => { g.box(b.x, b.y, b.w, b.h, col, { a: 0.07 }); g.text(b.x + 12, b.y + 18, title, { c: col === C.cyan ? 'c' : 'm', weight: 600 }); return body ? wrapOne(g.text(b.x + 12, b.y + 42, body, { w: b.w - 24 })) : 0; };
    card(A, C.mute, 'dg.shor.s1t', 'dg.shor.s1'); card(Q, C.cyan, 'dg.shor.s2t'); const n3 = card(B, C.mute, 'dg.shor.s3t', 'dg.shor.s3'); g.text(B.x + 12, B.y + 42 + n3 * LH + 8, 'dg.shor.s3b', { w: B.w - 24 });
    if (wide) { g.line(A.x + A.w + 3, 118, Q.x - 3, 118, C.mute, { arrow: true }); g.line(Q.x + Q.w + 3, 118, B.x - 3, 118, C.gold, { arrow: true }); }
    else { g.line(170, A.y + A.h + 3, 170, Q.y - 3, C.mute, { arrow: true }); g.line(170, Q.y + Q.h + 3, 170, B.y - 3, C.gold, { arrow: true }); }
    const x0 = Q.x + 10, y1 = Q.y + 84, y2 = Q.y + 150, xH = x0 + 82, xC = x0 + 150, xF = x0 + 232, xM = x0 + 296;
    g.text(x0, y1, { raw: '|0…0⟩' }, {}); g.text(x0 + 16, y2, { raw: '|1⟩' }, {});
    g.line(x0 + 50, y1, xM - 14, y1, C.ink, { sw: 3 }); g.line(x0 + 50, y2, xM + 14, y2, C.violet, { sw: 3 });
    g.gate(xH, y1, 'H'); g.line(xC, y1, xC, y2 - 15, C.ink, { sw: 1.6 }); g.circle(xC, y1, 5, C.ink, { solid: true });
    g.gate(xC, y2, 'aˣ mod N', C.violet, { w: 84, h: 30, c: 'v' });
    g.gate(xF, y1, 'QFT⁻¹', C.cyan, { w: 62, h: 30, c: 'c' }); g.meter(xM, y1);
    g.text(xM, y1 - 26, { raw: 'y' }, { a: 'middle', c: 'g' });
    g.text(x0 + 50, y1 - 34, 'dg.shor.count', { c: 'm' }); g.text(x0 + 50, y2 + 32, 'dg.shor.work', { c: 'v' });
  } };
};

// ch9 · where errors can strike in one Grover round: every qubit after every layer (count from the model)
DG.noise = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = 250;
  return { W, H, draw(g) {
    const n = 3, LAY = M.grover.LAYERS, sp = wide ? 80 : 42, x0 = wide ? 90 : 36, ys = [56, 92, 128], cols = ['H', null, 'H', 'X', 'MCZ', 'X', 'H'];
    const cxs = cols.map((_, i) => x0 + sp * i + sp / 2 - 8), xe = x0 + sp * cols.length;
    ys.forEach(y => { g.text(x0 - 30, y, { raw: '|0⟩' }, {}); g.line(x0 - 2, y, xe, y, C.ink, { sw: 1.5 }); });
    cols.forEach((s, i) => {
      const cx = cxs[i], tall = i === 1 || s === 'MCZ';
      const gw = wide ? 26 : 20;
      if (tall) g.box(cx - gw / 2, ys[0] - 15, gw, ys[2] - ys[0] + 30, i === 1 ? C.cyan : C.ink, { rx: 5, fill: '#141821' }); else ys.forEach(y => g.gate(cx, y, '', C.ink, { w: gw, h: 24 }));
      if (i === 1) g.text(cx, wide ? 22 : 10, 'dg.noise.orc', { a: 'middle', c: 'c' }); else g.text(cx, wide ? 22 : 28, { raw: s }, { a: 'middle', mono: s.length > 1, fs: s.length > 1 ? 13 : 14 });
      ys.forEach(y => { const ex = cx + (wide ? 34 : 21), q = wide ? 4 : 3.2; g.line(ex - q, y - q, ex + q, y + q, C.red, { sw: 1.8 }); g.line(ex - q, y + q, ex + q, y - q, C.red, { sw: 1.8 }); });
    });
    const bx0 = x0 + sp - 4, by = 156; g.path(`M${bx0},${by} v6 H${xe} v-6`, C.gold, { sw: 1.3 });
    g.text((bx0 + xe) / 2, by + 22, 'dg.noise.round', { a: 'middle', c: 'g', vars: { L: fmt(LAY) } });
    const lines = wrapOne(g.text(wide ? 90 : 10, 204, 'dg.noise.count', { c: 'r', w: wide ? 560 : 320, vars: { n: fmt(n), L: fmt(LAY), per: fmt(1 + LAY), tot: fmt(M.grover.expectedErrors(n, 1, 1)) } }));
    return Math.max(H, 204 + (lines - 1) * LH + 16); // the count sentence is longer in English: the drawing grows with it
  } };
};

// ch10 · rotated surface codes of distance 3 and 5, to count (qubit counts from the model)
DG.surface = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 416;
  return { W, H, draw(g) {
    const c = wide ? 44 : 34, Sc = M.surface, fs = wide ? 14 : 15.5; // the figure sits inside the model card, narrower than the prose column
    const lattice = (d, ox, oy) => {
      const X = i => ox + i * c, Y = j => oy + j * c, type = (i, j) => (((i + j) % 2) + 2) % 2 ? 'x' : 'z', col = ty => ty === 'x' ? C.gold : C.green;
      for (let i = 0; i < d - 1; i++) for (let j = 0; j < d - 1; j++) { const ty = type(i, j); g.box(X(i), Y(j), c, c, col(ty), { rx: 0, a: 0.2, sw: 0.8 }); g.box(X(i + 0.5) - 3.5, Y(j + 0.5) - 3.5, 7, 7, C.violet, { solid: true, rx: 1 }); }
      const half = (i, j, hor) => { const ty = type(i, j), out = (hor ? j : i) < 0 ? -1 : 1, e = 0.42 * c;
        const a = hor ? [X(i), Y(j < 0 ? 0 : d - 1)] : [X(i < 0 ? 0 : d - 1), Y(j)], b = hor ? [a[0] + c, a[1]] : [a[0], a[1] + c], m = hor ? [a[0] + c / 2, a[1] + out * e] : [a[0] + out * e, a[1] + c / 2];
        g.path(`M${a[0]},${a[1]} Q${m[0] + (hor ? 0 : out * e * 0.9)},${m[1] + (hor ? out * e * 0.9 : 0)} ${b[0]},${b[1]} Z`, col(ty), { fill: col(ty), a: 0.2, sw: 0.8 });
        g.box(m[0] - 3.5 - (hor ? 0 : out * 2), m[1] - 3.5 - (hor ? out * 2 : 0), 7, 7, C.violet, { solid: true, rx: 1 }); };
      for (let i = 0; i < d - 1; i++) { if (type(i, -1) === 'x') half(i, -1, true); if (type(i, d - 1) === 'x') half(i, d - 1, true); }
      for (let j = 0; j < d - 1; j++) { if (type(-1, j) === 'z') half(-1, j, false); if (type(d - 1, j) === 'z') half(d - 1, j, false); }
      for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) g.circle(X(i), Y(j), 5.5, C.cyan, { solid: true, sw: 1 });
    };
    const m = c * 0.9, top = 14 + m; lattice(3, m + (wide ? 16 : 8), top + c); lattice(5, m + (wide ? 16 : 8) + 2 * c + 2 * m + (wide ? 14 : 4), top);
    const tx = wide ? 462 : 10, tw = wide ? 250 : 320; let ty = wide ? 40 : top + 4 * c + m + 14;
    for (const d of [3, 5]) { g.text(tx, ty, 'dg.surf.count', { fs, w: tw, vars: { d: fmt(d), data: fmt(d * d), meas: fmt(Sc.qubits(d) - d * d), tot: fmt(Sc.qubits(d)) } }); ty += wide ? 44 : 24; }
    ty += wide ? 10 : 8;
    g.circle(tx + 6, ty, 5.5, C.cyan, { solid: true, sw: 1 }); g.text(tx + 20, ty, 'dg.surf.data', { fs, c: 'c' }); ty += 24;
    g.box(tx + 2.5, ty - 3.5, 7, 7, C.violet, { solid: true, rx: 1 }); g.text(tx + 20, ty, 'dg.surf.meas', { fs, c: 'v', w: tw - 20 }); ty += wide ? 44 : 44;
    g.box(tx, ty - 7, 13, 14, C.gold, { rx: 0, a: 0.3, sw: 0.8 }); g.text(tx + 20, ty, 'dg.surf.x', { fs, c: 'g' }); ty += 24;
    g.box(tx, ty - 7, 13, 14, C.green, { rx: 0, a: 0.3, sw: 0.8 }); g.text(tx + 20, ty, 'dg.surf.z', { fs, c: 'n' });
  } };
};

// ch11 · physical-qubit counts on a log axis: machines demonstrated (cyan) against published estimates (violet); values from FRONTIER
DG.gap = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, F = M.FRONTIER, hw = Object.fromEntries(F.hardware.map(h => [h.id, h.v])), es = Object.fromEntries(F.estimates.map(e => [e.id, e.v]));
  const K = 68, top = 24, hi = 7.75, lo = 1.75, H = top + (hi - lo) * K + 12;
  return { W, H, draw(g) {
    const ax = wide ? 170 : 86, Y = v => top + (hi - Math.log10(v)) * K, num = v => v >= 1e5 ? sci(v) : fmt(v);
    g.line(ax, top - 8, ax, H - 8, C.mute, { sw: 1.4 });
    for (let e = 2; e <= 7; e++) g.line(ax - 5, Y(Math.pow(10, e)), ax + 5, Y(Math.pow(10, e)), C.mute, { sw: 1.2 });
    const row = (v, label, key, col, cls, vars) => { g.circle(ax, Y(v), 5.5, col, { solid: true, sw: 1 }); g.text(ax - 12, Y(v), { raw: label }, { a: 'end', mono: true, fs: 13, c: cls }); g.text(ax + 14, Y(v), key, { c: cls, w: W - ax - 20, va: 'mid', vars }); };
    row(Math.sqrt(hw.helios.q * hw.willow.q), fmt(hw.helios.q) + ' / ' + fmt(hw.willow.q), 'dg.gap.today', C.cyan, 'c');
    row(hw.harvard.atoms, num(hw.harvard.atoms), 'dg.gap.atoms', C.cyan, 'c');
    row(hw.caltech.atoms, num(hw.caltech.atoms), 'dg.gap.array', C.cyan, 'c');
    row(es.rsaCat.phys, num(es.rsaCat.phys), 'dg.gap.cat', C.violet, 'v');
    row(es.rsa2026.phys, num(es.rsa2026.phys), 'dg.gap.pin', C.violet, 'v');
    row(es.ecc2026.phys, num(es.ecc2026.phys), 'dg.gap.ecc', C.violet, 'v');
    row(es.rsa2025.phys, num(es.rsa2025.phys), 'dg.gap.g25', C.violet, 'v');
    row(es.femoco.phys, num(es.femoco.phys), 'dg.gap.fe', C.violet, 'v');
    row(es.rsa2019.phys, num(es.rsa2019.phys), 'dg.gap.g19', C.violet, 'v');
  } };
};

let dgLayout = new WeakMap();
function renderDiagrams(force) {
  for (const fig of document.querySelectorAll('figure.dia')) {
    const box = fig.querySelector('.svg'), L = fig.clientWidth >= 600 ? 'w' : 'n';
    if (!force && dgLayout.get(fig) === L + effLang()) continue;
    dgLayout.set(fig, L + effLang());
    const spec = DG[fig.dataset.dg](L);
    box.textContent = '';
    const svg = E('svg', { viewBox: `0 0 ${spec.W} ${spec.H}`, role: 'img', 'aria-label': t('dg.' + fig.dataset.dg + '.aria'), class: L }, box);
    arrowDefs(svg); const h = spec.draw(mk(svg)); if (h) svg.setAttribute('viewBox', `0 0 ${spec.W} ${h}`); wrapTexts(svg);
  }
}

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
    const basis = t('ch1.bname.' + p.b), sure = p0 > 1 - 1e-9 || p0 < 1e-9;
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
      // the label sits above the lower path; where the path is too short for it (phones, English) it goes underneath
      if (c.measureText(t('ch2.cv.bs')).width <= bx2 - bx1 - 30) { c.textAlign = 'left'; c.fillText(t('ch2.cv.bs'), bx1 + 16, B - 14); } else { c.textAlign = 'right'; c.fillText(t('ch2.cv.bs'), bx2 - 16, B + 15); }
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
    const key = p.peek >= 0.995 ? 'ch2.say.watched' : res.p1 < 1e-9 ? 'ch2.say.dark1' : res.p0 < 1e-9 ? 'ch2.say.dark0' : 'ch2.say.mid';
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
    putHTML('#mmAmps', bigInt(Math.pow(2, n)).replace(/,/g, ',<wbr>')); /* a long count breaks after a comma, not mid-group */ put('#mmMem', bytes(lg));
    const key = n <= Me.maxQubits(LAP) ? 'ch4.say.laptop' : n <= F.sim50.n ? 'ch4.say.cluster' : 'ch4.say.beyond';
    putHTML('#mmSay', t(key, { n: fmt(n), amps: bigInt(Math.pow(2, n)), mem: bytes(lg), lap: fmt(Me.maxQubits(LAP)), rn: fmt(F.sim45.n), pb: fmt(F.sim45.bytesPB, 1), n50: fmt(F.sim50.n), y50: F.sim50.asOf.slice(0, 4), b50: fmt(F.sim50.bytesPerAmp), pb50: fmt(Me.bytes(F.sim50.n) * F.sim50.bytesPerAmp / Me.BYTES_PER_AMP / 1e15, 0) }));
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
    const key = Ns < 2 ? 'ch8.say.always' : ts < 3600 ? 'ch8.say.fast' : ts < 3.15576e7 ? 'ch8.say.mid' : 'ch8.say.long';
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
    const key = p.p === 0 ? 'ch9.say.clean' : (best < 3 / N && best < 0.1) ? 'ch9.say.dead' : e < 0.3 ? 'ch9.say.ok' : kb < ko ? 'ch9.say.hurtEarly' : 'ch9.say.hurt';
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
        if (res.fix === q) { c.strokeStyle = C.gold; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.arc(x, yD, R + 6, 0, 6.283); c.stroke(); c.setLineDash([]); if (roomy) { c.fillStyle = C.gold; if (w >= 520) { c.textAlign = 'left'; c.fillText(t('ch10.cv.fix'), x + R + 10, yD); c.textAlign = 'center'; } else c.fillText(t('ch10.cv.fix'), x, yD - R - 32); /* narrow: no room beside the circle, so the word goes above the qubit's name */ } }
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
      c.textAlign = 'left'; c.fillStyle = C.red; { const s = t('ch10.cv.raw'), pe = 0.05 + c.measureText(s).width / (f.X(1) - f.X(0)); c.fillText(s, f.X(0.05), f.Y(Math.max(0.3, pe + 0.08))); } // kept above the dashed line p it names, however wide the label
      c.fillStyle = C.cyan; c.fillText(t('ch10.cv.code'), f.X(0.32), f.Y(0.08));
    }
  });
  function text() {
    const p = +sP.value / 100, pl = Rp.logical(p);
    put('#rbPo', fmt(+sP.value) + '%'); put('#rbRaw', pct(p, 1) + '%'); put('#rbPL', pctAuto(pl) + '%'); put('#rbMC', pctAuto(mc) + '%');
    put('#rbGain', p === 0 ? '—' : t('ch10.unit.gain', { v: fmt(p / pl, p / pl >= 10 ? 0 : 1) }));
    const key = p === 0 ? 'ch10.say.B.zero' : Math.abs(p - 0.5) < 0.005 ? 'ch10.say.B.even' : p < 0.5 && p / pl < 1.1 ? 'ch10.say.B.near' : p < 0.5 ? 'ch10.say.B.better' : 'ch10.say.B.worse';
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
