/* How pixels reach a screen: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js.
   The canvas, chart and SVG helpers follow how-a-computer-boots/app.js. */
(() => {
'use strict';
const M = window.PixelModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b', pink: '#e79fc6' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ─────────
   copy.en.js may be a same-keys stub copied from zh while the translation is pending; it then sets
   window.ESSAY_COPY.enStub = true and the page treats English as absent (falls back to zh). */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const hasLang = l => !!COPY[l] && !(l === 'en' && COPY.enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const fmt = (x, d) => M.fmt(x, d, effLang());
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
const ms = (x, d) => t('u.ms', { v: fmt(x, d == null ? 1 : d) });
const us = (x, d) => t('u.us', { v: fmt(x, d == null ? 2 : d) });
const mhz = (x, d) => t('u.mhz', { v: fmt(x, d == null ? 1 : d) });
const gbps = (x, d) => t('u.gbps', { v: fmt(x, d == null ? 2 : d) });
let PROSE = null, PV = {};
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : (M.fmtKind(v, kind) || fmt(v, d)); return o; }
const langHooks = [];
function applyLang() {
  PV = proseVars();
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, PV); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  renderDiagrams(true);
  langHooks.forEach(f => f());
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
window.addEventListener('resize', () => { sims.forEach(s => { s.dirty = true; }); renderDiagrams(false); });
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; const xw = c.measureText(xLab).width, f0 = c.font; if (xw > f.R - 4) c.font = FONT.replace('12px', (12 * Math.max(0.7, (f.R - 4) / xw)).toFixed(1) + 'px'); c.fillText(xLab, f.R, f.B + 26); c.font = f0; }
}
function spacedTicks(c, items, y, maxW) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x0, s] of items) { const w = c.measureText(s).width, x = maxW ? Math.min(Math.max(x0, w / 2 + 2), maxW - w / 2 - 2) : x0; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function splitLabel(c, s, cap) {
  if (c.measureText(s).width + 14 <= cap || !/[ \uFF08(]/.test(s.slice(1))) return [s];
  const paren = s.search(/[\uFF08(]/);
  if (paren > 0) return [s.slice(0, paren).trim(), s.slice(paren)];
  let best = [s], bw = Infinity;
  for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(c.measureText(a).width, c.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function labelFont(c, labels, cap) { c.font = FONT; const lines = new Map(); let lw = 0; for (const s of labels) { const ls = splitLabel(c, s, cap); lines.set(s, ls); for (const l of ls) lw = Math.max(lw, c.measureText(l).width); } const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap), lines, lh: 13 * k }; }
// horizontal bars: rows of {lab, a (start), v (end), col, txt, hi}; value text after the bar, or inside it when there is no room
function bars(c, w, h, rows, max, marks) {
  const lf = labelFont(c, rows.map(r => r.lab), Math.min(170, w * 0.38));
  const L = lf.w, R = w - 10, T = 10, B = h - 10, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.min(v, max) / max;
  const geo = rows.map((r, i) => ({ y: T + i * rh + rh / 2, bh: Math.min(20, rh * 0.56) }));
  rows.forEach((r, i) => {
    const { y, bh } = geo[i];
    c.font = lf.font; c.textAlign = 'right'; c.fillStyle = r.hi ? C.gold : C.ink; const ls = lf.lines.get(r.lab) || [r.lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
    c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
    const a = r.a || 0, v = r.v;
    if (v > a) { c.fillStyle = r.col; c.fillRect(X(a), y - bh / 2, Math.max(1.5, X(v) - X(a)), bh); }
  });
  // marks under the value text, so a dashed line never strikes through a number
  if (marks) for (const [v, col] of marks) { c.strokeStyle = col; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X(v), T - 4); c.lineTo(X(v), B + 4); c.stroke(); c.setLineDash([]); }
  rows.forEach((r, i) => {
    if (!r.txt) return;
    const { y, bh } = geo[i], xa = X(r.a || 0), xe = X(Math.max(r.v, 0));
    let tw = c.measureText(r.txt).width, x, al = 'left', col = C.ink;
    if (xe + 6 + tw <= R + 0.5) x = xe + 6;                                  // after the bar
    else if (xe - xa >= tw + 12) { x = xe - 6; al = 'right'; col = C.bg; }    // inside the bar
    else if (xa - L >= tw + 12) { x = xa - 6; al = 'right'; }                 // before the bar (waterfall offsets)
    else { const k = Math.max(0.6, (R - xe - 6) / tw); c.font = FONT.replace('12px', (12 * k).toFixed(1) + 'px'); tw = c.measureText(r.txt).width; x = xe + 6; }
    { const x0 = al === 'left' ? x - 2 : x - tw - 2; c.fillStyle = col === C.ink ? C.dimfill : r.col; c.fillRect(x0, y - bh / 2, tw + 4, bh); }
    c.fillStyle = col; c.textAlign = al; c.fillText(r.txt, x, y); c.font = FONT;
  });
}

/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, labels from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, prose column ≥ 600 px) and 'n' (viewBox 340 wide). Text is 14 units, so it
   renders at ≥ 11.7 px in either layout at its narrowest. A label with a width limit wraps onto more lines.
   Colours: memory and frames gold, the display engine and scan-out cyan, the link violet, the panel green,
   failures and tears red. */
const NS = 'http://www.w3.org/2000/svg';
const FS = 14, LH = 18;
function S(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function mk(svg) {
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; S('rect', { x, y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: o.solid ? col : o.fill || tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none', 'marker-start': o.both ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; S('circle', { cx, cy, r, fill: o.solid ? col : tint(col, 0.14), stroke: col, 'stroke-width': o.sw || 1.6 }, svg); },
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, Object.assign({}, PV, o.vars));
      const e = S('text', { x, y, 'font-size': o.fs || FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: (o.c || '') + (o.mono ? ' mono' : '') }, svg);
      e.textContent = s; if (o.w) { e.dataset.w = o.w; e.dataset.va = o.va || 'top'; } if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    },
    hatch(x, y, w, h, col) { g.box(x, y, w, h, col, { a: 0.1 }); for (let k = -h + 9; k < w; k += 9) { const s0 = Math.max(0, -k), s1 = Math.min(h, w - k); if (s1 <= s0) continue; S('line', { x1: x + k + s0, y1: y + h - s0, x2: x + k + s1, y2: y + h - s1, stroke: tint(col, 0.6), 'stroke-width': 1.2 }, svg); } }
  };
  return g;
}
function arrowDefs(svg) {
  const d = S('defs', {}, svg);
  for (const col of [C.mute, C.gold, C.cyan, C.red, C.green, C.violet]) {
    const m = S('marker', { id: 'ar-' + col.slice(1), viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
    S('path', { d: 'M0,0 L10,5 L0,10 z', fill: col }, m);
  }
}
function wrapTexts(svg) {
  for (const e of svg.querySelectorAll('text[data-w]')) {
    const maxw = +e.dataset.w; if (e.getComputedTextLength() <= maxw) continue;
    const s = e.textContent, x = e.getAttribute('x'), y0 = +e.getAttribute('y'), cjk = /[\u3000-\u9fff\uff00-\uffef]/.test(s);
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:_]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; let lines = [], cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}
const cls = col => (col === C.gold ? 'g' : col === C.cyan ? 'c' : col === C.red ? 'r' : col === C.green ? 'n' : col === C.violet ? 'v' : col === C.mute ? 'm' : '');
function lbox(g, x, y, w, h, col, key, o) {
  o = o || {}; g.box(x, y, w, h, col, { a: o.a, dash: o.dash, rx: o.rx });
  g.text(x + w / 2, y + h / 2, key, { a: 'middle', c: o.c != null ? o.c : '', vars: o.vars, w: w - 12, va: 'mid', mono: o.mono });
}
// a box with a title and a muted second line
function box2(g, x, y, w, h, col, k1, k2) { g.box(x, y, w, h, col, {}); g.text(x + w / 2, y + h / 2 - 10, k1, { a: 'middle', c: cls(col) }); g.text(x + w / 2, y + h / 2 + 11, k2, { a: 'middle', c: 'm' }); }
const poly = (g, pts, col, o) => { o = o || {}; for (let i = 1; i < pts.length; i++) g.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], col, { sw: o.sw || 2, dash: o.dash, arrow: o.arrow && i === pts.length - 1 }); };
function span(g, x1, x2, y, col) { g.line(x1, y, x2, y, col, { sw: 1.4 }); g.line(x1, y - 5, x1, y + 5, col, { sw: 1.4 }); g.line(x2, y - 5, x2, y + 5, col, { sw: 1.4 }); }
function vspan(g, x, y1, y2, col) { g.line(x, y1, x, y2, col, { sw: 1.4 }); g.line(x - 5, y1, x + 5, y1, col, { sw: 1.4 }); g.line(x - 5, y2, x + 5, y2, col, { sw: 1.4 }); }
function legendRow(g, x, y, col, key, o) { o = o || {}; if (o.dash) g.line(x, y, x + 14, y, col, { sw: 2, dash: '4 3' }); else if (o.hatch) g.hatch(x, y - 7, 14, 14, col); else g.box(x, y - 7, 14, 14, col, { a: 0.5, rx: 3 }); g.text(x + 22, y, key, { c: o.c, w: o.w }); }

const DG = {};

// ch1: the route of a pixel
DG.overview = (L) => {
  const k = 'dg.overview.';
  if (L === 'w') return { W: 720, H: 262, draw(g) {
    g.text(10, 14, k + 'card', { c: 'm' }); g.text(10, 248, k + 'mon', { c: 'm' });
    box2(g, 20, 30, 200, 66, C.gold, k + 'vram', k + 'fb');
    box2(g, 260, 30, 200, 66, C.cyan, k + 'de', k + 'de2');
    box2(g, 500, 30, 200, 66, C.violet, k + 'phy', k + 'phy2');
    g.line(222, 63, 256, 63, C.mute, { arrow: 1 }); g.line(462, 63, 496, 63, C.mute, { arrow: 1 });
    g.line(600, 98, 600, 154, C.violet, { arrow: 1, sw: 2.4 }); g.text(612, 126, k + 'cable', { c: 'v' });
    box2(g, 500, 158, 200, 66, C.green, k + 'tcon', { raw: 'TCON' });
    lbox(g, 260, 158, 200, 66, C.green, k + 'drv', { c: 'n' });
    lbox(g, 20, 158, 200, 66, C.green, k + 'panel', { c: 'n' });
    g.line(498, 191, 464, 191, C.mute, { arrow: 1 }); g.line(258, 191, 224, 191, C.mute, { arrow: 1 });
    g.line(32, 130, 32, 100, C.gold, { arrow: 1 }); g.text(44, 118, k + 'gpu', { c: 'm' });
  } };
  return { W: 340, H: 548, draw(g) {
    g.text(10, 12, k + 'card', { c: 'm' });
    const ys = [28, 106, 184], keys = [[C.gold, 'vram', 'fb'], [C.cyan, 'de', 'de2'], [C.violet, 'phy', 'phy2']];
    keys.forEach(([col, a, b], i) => { box2(g, 20, ys[i], 300, 60, col, k + a, k + b); if (i) g.line(170, ys[i] - 18, 170, ys[i] - 2, C.mute, { arrow: 1 }); });
    g.line(170, 246, 170, 296, C.violet, { arrow: 1, sw: 2.4 }); g.text(184, 266, k + 'cable', { c: 'v' }); g.text(10, 286, k + 'mon', { c: 'm' });
    box2(g, 20, 300, 300, 60, C.green, k + 'tcon', { raw: 'TCON' });
    lbox(g, 20, 378, 300, 60, C.green, k + 'drv', { c: 'n' }); g.line(170, 362, 170, 376, C.mute, { arrow: 1 });
    lbox(g, 20, 456, 300, 60, C.green, k + 'panel', { c: 'n' }); g.line(170, 440, 170, 454, C.mute, { arrow: 1 });
    g.text(320, 12, k + 'gpu', { a: 'end', c: 'm' });
  } };
};

// ch1: pixel formats, bit widths to scale
DG.fmt = (L) => {
  const k = 'dg.fmt.';
  const rows = [['rgba8', [['r8', 8, C.red], ['g8', 8, C.green], ['b8', 8, C.cyan], ['a8', 8, C.mute]]],
    ['rgb10', [['r10', 10, C.red], ['g10', 10, C.green], ['b10', 10, C.cyan], ['a2', 2, C.mute]]],
    ['fp16', [['r16', 16, C.red], ['g16', 16, C.green], ['b16', 16, C.cyan], ['a16', 16, C.mute]]]];
  const seg = (g, x, y, bw, h, segs) => { for (const [kk, b, col] of segs) { const w = b * bw; g.box(x, y, w, h, col, { rx: 3 }); if (w < 26) g.text(x + w / 2, y + h + 10, k + kk, { a: 'middle', c: cls(col), mono: true }); else g.text(x + w / 2, y + h / 2, k + kk, { a: 'middle', c: cls(col), mono: true }); x += w; } };
  if (L === 'w') return { W: 720, H: 186, draw(g) {
    rows.forEach(([lab, segs], i) => { const y = 14 + i * 56; g.text(10, y + 18, k + lab, {}); seg(g, 152, y, 8.6, 36, segs); });
  } };
  return { W: 340, H: 262, draw(g) {
    const bw = 9.8;
    g.text(10, 12, k + 'rgba8'); seg(g, 14, 26, bw, 34, rows[0][1]);
    g.text(10, 84, k + 'rgb10'); seg(g, 14, 98, bw, 34, rows[1][1]);
    g.text(10, 156, k + 'fp16'); seg(g, 14, 170, bw, 34, rows[2][1].slice(0, 2)); seg(g, 14, 212, bw, 34, rows[2][1].slice(2));
  } };
};

// ch2: the raster, both axes (regions schematic; numbers from the CTA timing)
DG.raster = (L) => {
  const k = 'dg.raster.';
  const draw = (g, x, y, aw, hfp, hs, hbp, ah, vfp, vs, vbp, inner) => {
    const W = aw + hfp + hs + hbp, H = ah + vfp + vs + vbp;
    g.box(x, y, W, H, C.mute, { a: 0.1, rx: 2 });
    g.box(x + aw + hfp, y, hs, H, C.red, { a: 0.22, rx: 0, nostroke: true }); g.box(x, y + ah + vfp, W, vs, C.red, { a: 0.22, rx: 0, nostroke: true });
    g.box(x + aw, y, hfp, H, C.violet, { a: 0.16, rx: 0, nostroke: true }); g.box(x, y + ah, W, vfp, C.violet, { a: 0.16, rx: 0, nostroke: true });
    g.box(x + aw + hfp + hs, y, hbp, H, C.cyan, { a: 0.16, rx: 0, nostroke: true }); g.box(x, y + ah + vfp + vs, W, vbp, C.cyan, { a: 0.16, rx: 0, nostroke: true });
    g.box(x, y, aw, ah, C.gold, { a: 0.18, rx: 2 });
    g.text(x + aw / 2, y + ah / 2 - 12, k + 'act', { a: 'middle', c: 'g' });
    // scan direction: two rows of arrows and a retrace
    const sy = y + ah / 2 + 4;
    g.line(x + 24, sy, x + aw - 24, sy, C.gold, { arrow: 1 }); g.line(x + aw - 24, sy + 4, x + 30, sy + 20, C.mute, { dash: '3 4' }); g.line(x + 24, sy + 24, x + aw - 24, sy + 24, C.gold, { arrow: 1 });
    g.text(x + aw / 2, sy + 42, k + 'scan', { a: 'middle', c: 'm' });
    return { W, H };
  };
  const legend = (g, x, y0, dy, w) => {
    g.text(x, y0, k + 'hb', {}); legendRow(g, x, y0 + dy, C.violet, k + 'hfp', { w }); legendRow(g, x, y0 + 2 * dy, C.red, k + 'hs', { w }); legendRow(g, x, y0 + 3 * dy, C.cyan, k + 'hbp', { w });
    g.text(x, y0 + 4 * dy + 4, k + 'vb', {}); legendRow(g, x, y0 + 5 * dy + 4, C.violet, k + 'vfp', { w }); legendRow(g, x, y0 + 6 * dy + 4, C.red, k + 'vs', { w }); legendRow(g, x, y0 + 7 * dy + 4, C.cyan, k + 'vbp', { w });
  };
  if (L === 'w') return { W: 720, H: 300, draw(g) {
    g.text(20, 18, k + 'htot', { c: 'm' }); span(g, 20, 450, 34, C.mute);
    draw(g, 20, 48, 320, 30, 30, 50, 168, 18, 18, 26);
    legend(g, 480, 54, 26, 230); g.text(480, 270, k + 'vtot', { c: 'm' });
  } };
  return { W: 340, H: 464, draw(g) {
    g.text(10, 14, k + 'htot', { c: 'm' }); span(g, 10, 330, 30, C.mute);
    draw(g, 10, 42, 240, 22, 22, 36, 132, 14, 14, 16);
    legend(g, 14, 240, 24, 290); g.text(14, 446, k + 'vtot', { c: 'm' });
  } };
};

// ch3: double buffering, a flip in the blanking vs a flip mid-scan
DG.flip = (L) => {
  const k = 'dg.flip.';
  if (L === 'w') return { W: 720, H: 292, draw(g) {
    lbox(g, 10, 30, 90, 50, C.gold, k + 'gpu', { c: 'g' }); lbox(g, 130, 20, 220, 60, C.gold, k + 'back', { c: 'g' });
    lbox(g, 380, 20, 220, 60, C.cyan, k + 'front', { c: 'c' }); lbox(g, 630, 30, 80, 50, C.cyan, k + 'de', { c: 'c' });
    g.line(102, 55, 126, 55, C.gold, { arrow: 1 }); g.line(602, 55, 626, 55, C.cyan, { arrow: 1 });
    g.line(250, 90, 480, 90, C.mute, { arrow: 1, both: 1 }); g.text(365, 108, k + 'swap', { a: 'middle', c: 'm' });
    g.text(190, 142, k + 'vs', { a: 'middle' }); g.box(80, 158, 220, 118, C.gold, { a: 0.2, rx: 4 }); g.text(190, 217, k + 'whole', { a: 'middle', c: 'g' });
    g.text(530, 142, k + 'now', { a: 'middle' }); g.box(420, 158, 220, 50, C.cyan, { a: 0.2, rx: 4 }); g.box(420, 208, 220, 68, C.gold, { a: 0.2, rx: 4 });
    g.text(530, 183, k + 'old', { a: 'middle', c: 'c' }); g.text(530, 242, k + 'new', { a: 'middle', c: 'g' });
    g.line(410, 208, 650, 208, C.red, { sw: 2.6 }); g.text(656, 208, k + 'tear', { c: 'r' });
  } };
  return { W: 340, H: 450, draw(g) {
    lbox(g, 10, 10, 70, 46, C.gold, k + 'gpu', { c: 'g' }); lbox(g, 100, 10, 230, 46, C.gold, k + 'back', { c: 'g' });
    g.line(82, 33, 96, 33, C.gold, { arrow: 1 });
    g.line(215, 60, 215, 96, C.mute, { arrow: 1, both: 1 }); g.text(225, 78, k + 'swap', { c: 'm' });
    lbox(g, 100, 100, 230, 46, C.cyan, k + 'front', { c: 'c' }); lbox(g, 10, 100, 70, 46, C.cyan, k + 'de', { c: 'c' });
    g.line(98, 123, 84, 123, C.cyan, { arrow: 1 });
    g.text(10, 172, k + 'vs'); g.box(10, 186, 320, 84, C.gold, { a: 0.2, rx: 4 }); g.text(170, 228, k + 'whole', { a: 'middle', c: 'g' });
    g.text(10, 296, k + 'now'); g.box(10, 310, 320, 50, C.cyan, { a: 0.2, rx: 4 }); g.box(10, 360, 320, 76, C.gold, { a: 0.2, rx: 4 });
    g.text(120, 335, k + 'old', { a: 'middle', c: 'c' }); g.text(170, 398, k + 'new', { a: 'middle', c: 'g' });
    g.line(4, 360, 336, 360, C.red, { sw: 2.6 }); g.text(320, 346, k + 'tear', { a: 'end', c: 'r' });
  } };
};

// ch4: fixed refresh vs variable refresh (time schematic)
DG.vrr = (L) => {
  const k = 'dg.vrr.', wide = L === 'w';
  const X = wide ? (tt => 100 + tt) : (tt => 14 + tt * 0.51), Y1 = wide ? 44 : 40, Y2 = wide ? 150 : 150, H = 40;
  const blk = (g, a, d, y, col, rep) => { if (rep) g.hatch(X(a), y, X(a + d) - X(a), H, C.violet); else g.box(X(a), y, X(a + d) - X(a), H, col, { a: 0.28, rx: 3 }); };
  const tick = (g, tt, y) => g.line(X(tt), y - 16, X(tt), y + H + 2, C.gold, { sw: 2.2 });
  const draw = g => {
    // fixed: scans every 120 units; frame B misses scan 1 (repeat) and shows at scan 2
    [0, 1, 2, 3, 4].forEach(i => blk(g, 10 + 120 * i, 92, Y1, C.cyan, i === 1));
    [0, 145, 350].forEach(tt => tick(g, tt, Y1));
    g.line(X(147), Y1 + H + 12, X(248), Y1 + H + 12, C.red, { arrow: 1, sw: 1.8 });
    // variable: scans start when a frame is ready (≥ Pmin after the last), a long gap ends in a forced repeat
    [[10, 0], [145, 0], [290, 0], [520, 1]].forEach(([a, r]) => blk(g, a, 92, Y2, C.cyan, r));
    [0, 145, 290].forEach(tt => tick(g, tt, Y2));
    [[102, 145], [237, 290], [382, 520]].forEach(([a, b]) => g.line(X(a), Y2 + H / 2, X(b), Y2 + H / 2, C.mute, { sw: 2, dash: '4 3' }));
    span(g, X(290), X(520), Y2 + H + 14, C.mute);
  };
  if (wide) return { W: 720, H: 330, draw(g) {
    g.text(10, Y1 + H / 2, k + 'fixed', {}); g.text(10, Y2 + H / 2, k + 'var', {});
    draw(g);
    legendRow(g, 100, 250, C.cyan, k + 'scan'); legendRow(g, 100, 278, C.violet, k + 'repeat', { hatch: 1 }); legendRow(g, 100, 306, C.mute, k + 'porch', { dash: 1 });
    g.line(400, 250, 414, 250, C.gold, { sw: 2.4 }); g.text(422, 250, k + 'ready'); g.line(400, 278, 414, 278, C.red, { sw: 1.8, arrow: 1 }); g.text(422, 278, k + 'wait');
    span(g, 400, 414, 306, C.mute); g.text(422, 306, k + 'limit');
  } };
  return { W: 340, H: 400, draw(g) {
    g.text(10, 12, k + 'fixed', {}); g.text(10, 122, k + 'var', {});
    draw(g);
    legendRow(g, 14, 240, C.cyan, k + 'scan'); legendRow(g, 14, 266, C.violet, k + 'repeat', { hatch: 1 }); legendRow(g, 14, 292, C.mute, k + 'porch', { dash: 1 });
    g.line(14, 318, 28, 318, C.gold, { sw: 2.4 }); g.text(36, 318, k + 'ready'); g.line(14, 344, 28, 344, C.red, { sw: 1.8, arrow: 1 }); g.text(36, 344, k + 'wait');
    span(g, 14, 28, 370, C.mute); g.text(36, 370, k + 'limit', { w: 290 });
  } };
};

// ch5: the display engine pipeline (after the Linux KMS properties)
DG.engine = (L) => {
  const k = 'dg.engine.';
  if (L === 'w') return { W: 720, H: 300, draw(g) {
    const ys = [20, 74, 128];
    ['p1', 'p2', 'p3'].forEach((p, i) => {
      lbox(g, 10, ys[i], 150, 38, C.gold, k + p, { c: 'g' }); lbox(g, 178, ys[i], 92, 38, C.cyan, k + 'cv', { c: '' }); lbox(g, 286, ys[i], 66, 38, C.cyan, k + 'sc', { c: '' });
      g.line(161, ys[i] + 19, 175, ys[i] + 19, C.mute, { arrow: 1 }); g.line(271, ys[i] + 19, 283, ys[i] + 19, C.mute, { arrow: 1 }); g.line(353, ys[i] + 19, 372, ys[i] + 19, C.mute, { arrow: 1 });
    });
    g.box(362, 8, 350, 196, C.cyan, { a: 0.04, dash: '6 5' });
    lbox(g, 376, 20, 70, 146, C.cyan, k + 'bl', { c: 'c' });
    const cy = [20, 66, 112, 158], ck = ['dg', 'ctm', 'gm', 'di'];
    ck.forEach((kk, i) => { lbox(g, 470, cy[i], 230, 34, C.cyan, k + kk, { c: '' }); if (i) g.line(585, cy[i] - 11, 585, cy[i] - 1, C.mute, { arrow: 1 }); });
    g.line(447, 37, 467, 37, C.mute, { arrow: 1 });
    g.text(372, 218, k + 'crtc', { c: 'c' });
    lbox(g, 470, 234, 230, 40, C.violet, k + 'out', { c: 'v' }); g.line(585, 193, 585, 231, C.violet, { arrow: 1 });
  } };
  return { W: 340, H: 560, draw(g) {
    ['p1', 'p2', 'p3'].forEach((p, i) => lbox(g, 10, 10 + i * 44, 320, 36, C.gold, k + p, { c: 'g' }));
    lbox(g, 10, 152, 155, 36, C.cyan, k + 'cv'); lbox(g, 175, 152, 155, 36, C.cyan, k + 'sc'); g.line(170, 140, 170, 150, C.mute, { arrow: 1 });
    g.box(4, 196, 332, 262, C.cyan, { a: 0.04, dash: '6 5' });
    const ys = [206, 256, 306, 356, 406], ks = ['bl', 'dg', 'ctm', 'gm', 'di'];
    ks.forEach((kk, i) => { lbox(g, 20, ys[i], 300, 36, C.cyan, k + kk, { c: kk === 'bl' ? 'c' : '' }); g.line(170, ys[i] - 12, 170, ys[i] - 2, C.mute, { arrow: 1 }); });
    g.text(14, 474, k + 'crtc', { c: 'c' });
    lbox(g, 20, 500, 300, 40, C.violet, k + 'out', { c: 'v' }); g.line(170, 444, 170, 497, C.violet, { arrow: 1 });
  } };
};

// ch6: a DisplayPort connection
DG.dp = (L) => {
  const k = 'dg.dp.';
  const chips = (g, x1, x2, y) => { for (let x = x1 + 10, i = 0; x < x2 - 18; x += 26, i++) g.box(x, y - 6, 16, 12, i % 2 ? C.gold : C.violet, { a: 0.45, rx: 2 }); };
  if (L === 'w') return { W: 720, H: 326, draw(g) {
    lbox(g, 10, 36, 130, 220, C.gold, k + 'src', { c: 'g' }); lbox(g, 580, 36, 130, 220, C.green, k + 'snk', { c: 'n' });
    g.text(360, 18, k + 'px', { a: 'middle', c: 'm' });
    [64, 104, 144, 184].forEach((y, i) => { g.line(142, y, 576, y, C.violet, { arrow: 1, sw: 2 }); chips(g, 230, 576, y); g.text(186, y - 14, k + 'l' + i, { a: 'middle', c: 'v' }); });
    g.line(146, 222, 574, 222, C.mute, { both: 1, arrow: 1, dash: '5 4' }); g.text(360, 208, k + 'aux', { a: 'middle', c: 'm' });
    g.line(574, 246, 146, 246, C.mute, { arrow: 1, sw: 1.2 }); g.text(360, 236, k + 'hpd', { a: 'middle', c: 'm' });
    g.text(10, 284, k + 'c8', { c: '' }); g.text(10, 310, k + 'c128', { c: '' });
  } };
  return { W: 340, H: 440, draw(g) {
    lbox(g, 10, 10, 320, 40, C.gold, k + 'src', { c: 'g' });
    g.text(170, 66, k + 'px', { a: 'middle', c: 'm', w: 320, va: 'mid' });
    [50, 110, 170, 230].forEach((x, i) => { g.line(x, 82, x, 236, C.violet, { arrow: 1, sw: 2 }); for (let y = 120; y < 220; y += 24) g.box(x - 6, y, 12, 14, (y / 24) % 2 ? C.gold : C.violet, { a: 0.45, rx: 2 }); g.text(x + 7, 100, k + 'l' + i, { c: 'v' }); });
    g.line(290, 86, 290, 234, C.mute, { both: 1, arrow: 1, dash: '5 4' });
    lbox(g, 10, 240, 320, 40, C.green, k + 'snk', { c: 'n' });
    legendRow(g, 14, 304, C.mute, k + 'aux', { dash: 1 }); g.line(14, 330, 28, 330, C.mute, { sw: 1.2, arrow: 1 }); g.text(36, 330, k + 'hpd', { c: 'm' });
    g.text(14, 362, k + 'c8', { w: 312 }); g.text(14, 394, k + 'c128', { w: 312 });
  } };
};

// ch6: link training (DPCD addresses from drm_dp.h)
DG.train = (L) => {
  const k = 'dg.train.', st = ['s1', 's2', 's3', 's4', 's5', 's6'];
  if (L === 'w') return { W: 720, H: 330, draw(g) {
    st.forEach((s, i) => { const y = 10 + i * 52; lbox(g, 100, y, 340, 36, i === 5 ? C.green : C.violet, k + s, { c: i === 5 ? 'n' : '', mono: i === 0 || i === 2 || i === 4 }); if (i) g.line(270, y - 15, 270, y - 2, C.mute, { arrow: 1 }); });
    lbox(g, 470, 106, 240, 50, C.gold, k + 'adj', { c: 'g' }); lbox(g, 470, 210, 240, 50, C.red, k + 'down', { c: 'r' });
    poly(g, [[441, 132], [468, 132]], C.gold, { arrow: 1 }); poly(g, [[590, 104], [590, 80], [442, 80]], C.gold, { arrow: 1 });
    poly(g, [[441, 236], [468, 236]], C.red, { arrow: 1 }); poly(g, [[710, 236], [714, 236], [714, 28], [442, 28]], C.red, { arrow: 1, sw: 1.6 });
  } };
  return { W: 340, H: 470, draw(g) {
    st.forEach((s, i) => { const y = 10 + i * 54; lbox(g, 10, y, 280, 40, i === 5 ? C.green : C.violet, k + s, { c: i === 5 ? 'n' : '', mono: i === 0 || i === 2 || i === 4 }); if (i) g.line(150, y - 13, 150, y - 2, C.mute, { arrow: 1 }); });
    poly(g, [[291, 138], [316, 138], [316, 84], [292, 84]], C.gold, { arrow: 1 }); poly(g, [[291, 246], [330, 246], [330, 30], [292, 30]], C.red, { arrow: 1, sw: 1.6 });
    lbox(g, 10, 344, 320, 50, C.gold, k + 'adj', { c: 'g' }); lbox(g, 10, 406, 320, 50, C.red, k + 'down', { c: 'r' });
  } };
};

// ch7: chroma subsampling grids
DG.chroma = (L) => {
  const k = 'dg.chroma.', cell = 34;
  const grid = (g, x, y, mode) => {
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) g.box(x + c * cell, y + r * cell, cell, cell, C.mute, { a: 0.08, rx: 0 });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const on = mode === '444' || (mode === '422' && c % 2 === 0) || (mode === '420' && c % 2 === 0 && r === 0);
      if (!on) continue;
      const cx = x + c * cell + (mode === '444' ? cell / 2 : cell), cy = y + r * cell + (mode === '420' ? cell : cell / 2);
      g.circle(cx, cy, 6, C.gold, { solid: true });
    }
  };
  if (L === 'w') return { W: 720, H: 214, draw(g) {
    ['444', '422', '420'].forEach((m, i) => { const x = 40 + i * 240; g.text(x + 68, 16, k + m, { a: 'middle', c: 'g', mono: true }); grid(g, x, 32, m); g.text(x + 68, 122, k + 'b' + m, { a: 'middle', c: 'm' }); });
    g.text(40, 166, k + 'y', {}); g.text(40, 192, k + 'c', { c: 'g' });
  } };
  return { W: 340, H: 340, draw(g) {
    ['444', '422', '420'].forEach((m, i) => { const y = 10 + i * 90; g.text(10, y + 20, k + m, { c: 'g', mono: true }); g.text(10, y + 46, k + 'b' + m, { c: 'm' }); grid(g, 186, y, m); });
    g.text(10, 296, k + 'y', {}); g.text(10, 322, k + 'c', { c: 'g' });
  } };
};

// ch8: active matrix
DG.tft = (L) => {
  const k = 'dg.tft.';
  const cellAt = (g, x, y, on) => { const col = on ? C.gold : C.mute; g.box(x - 8, y - 8, 16, 16, col, { a: on ? 0.5 : 0.18, rx: 2 }); g.box(x + 10, y + 4, 12, 10, C.green, { a: 0.3, rx: 1 }); };
  const matrix = (g, x0, cols, rows, onRow) => {
    rows.forEach((y, r) => g.line(x0 - 20, y, cols[cols.length - 1] + 30, y, r === onRow ? C.gold : C.mute, { sw: r === onRow ? 2.6 : 1.2 }));
    cols.forEach(x => g.line(x, 52, x, rows[rows.length - 1] + 24, C.cyan, { sw: 1.4 }));
    rows.forEach((y, r) => cols.forEach(x => cellAt(g, x, y, r === onRow)));
  };
  if (L === 'w') return { W: 720, H: 336, draw(g) {
    lbox(g, 10, 6, 150, 40, C.violet, k + 'tcon', { c: 'v' }); lbox(g, 190, 6, 400, 40, C.cyan, k + 'src', { c: 'c' }); lbox(g, 10, 66, 150, 240, C.gold, k + 'gate', { c: 'g' });
    g.line(162, 26, 186, 26, C.violet, { arrow: 1 }); g.line(85, 48, 85, 63, C.violet, { arrow: 1 });
    matrix(g, 200, [230, 310, 390, 470, 550], [100, 160, 220, 280], 1);
    g.text(600, 100, k + 'row', { c: 'm' }); g.text(600, 160, k + 'on', { c: 'g' }); g.text(600, 220, k + 'off', { c: 'm' });
    g.text(236, 64, k + 'col', { c: 'c' }); g.text(200, 322, k + 'px', { c: 'n' });
  } };
  return { W: 340, H: 450, draw(g) {
    lbox(g, 10, 6, 130, 40, C.violet, k + 'tcon', { c: 'v' }); lbox(g, 150, 6, 180, 40, C.cyan, k + 'src', { c: 'c' }); lbox(g, 10, 60, 64, 250, C.gold, k + 'gate', { c: 'g' });
    matrix(g, 100, [120, 175, 230, 285], [96, 156, 216, 276], 1);
    legendRow(g, 14, 336, C.gold, k + 'on', { c: 'g' }); legendRow(g, 14, 362, C.mute, k + 'off', { c: 'm' });
    g.line(14, 388, 28, 388, C.mute, { sw: 1.4 }); g.text(36, 388, k + 'row', { c: 'm' }); g.line(14, 414, 28, 414, C.cyan, { sw: 1.4 }); g.text(36, 414, k + 'col', { c: 'c' });
    g.box(176, 432, 16, 16, C.mute, { a: 0.18, rx: 2 }); g.text(14, 440, k + 'px', { c: 'n' });
  } };
};

// ch9: LCD and OLED cross-sections
DG.stack = (L) => {
  const k = 'dg.stack.';
  const lcd = [['pol2', C.mute], ['cf', C.gold], ['lc', C.cyan], ['tft', C.green], ['pol1', C.mute], ['bl', C.gold]];
  const oled = [['cp', C.mute], ['enc', C.mute], ['ca', C.cyan], ['em', C.gold], ['an', C.cyan], ['bp', C.green]];
  const col = (g, x, y, w, h, layers) => layers.forEach(([kk, c], i) => lbox(g, x, y + i * h, w, h - 2, c, k + kk, { c: cls(c), a: kk === 'em' || kk === 'bl' ? 0.3 : 0.12, rx: 3 }));
  if (L === 'w') return { W: 720, H: 330, draw(g) {
    g.text(180, 16, k + 'lcd', { a: 'middle' }); g.text(540, 16, k + 'oled', { a: 'middle' });
    g.line(180, 82, 180, 40, C.gold, { arrow: 1, sw: 2 }); g.text(194, 56, k + 'light', { c: 'g' }); g.line(540, 82, 540, 40, C.gold, { arrow: 1, sw: 2 }); g.text(554, 56, k + 'light', { c: 'g' });
    col(g, 20, 86, 320, 38, lcd); col(g, 380, 86, 320, 38, oled);
  } };
  return { W: 340, H: 640, draw(g) {
    g.text(10, 14, k + 'lcd'); g.line(170, 72, 170, 34, C.gold, { arrow: 1, sw: 2 }); g.text(184, 50, k + 'light', { c: 'g' }); col(g, 10, 76, 320, 36, lcd);
    g.text(10, 318, k + 'oled'); g.line(170, 376, 170, 338, C.gold, { arrow: 1, sw: 2 }); g.text(184, 354, k + 'light', { c: 'g' }); col(g, 10, 380, 320, 36, oled);
  } };
};

// ch11: the latency chain
DG.lat = (L) => {
  const k = 'dg.lat.', st = [['poll', C.mute], ['tick', C.mute], ['render', C.gold], ['comp', C.cyan], ['scan', C.cyan], ['panel', C.green]];
  if (L === 'w') return { W: 720, H: 150, draw(g) {
    st.forEach(([kk, c], i) => { const x = 10 + i * 117; lbox(g, x, 64, 104, 60, c, k + kk, { c: cls(c) }); if (i) g.line(x - 12, 94, x - 2, 94, C.mute, { arrow: 1 }); });
    span(g, 10, 465, 44, C.mute); g.text(237, 26, k + 'pc', { a: 'middle', c: 'm' }); span(g, 478, 699, 44, C.mute); g.text(588, 26, k + 'disp', { a: 'middle', c: 'm' });
  } };
  return { W: 340, H: 380, draw(g) {
    st.forEach(([kk, c], i) => { const y = 10 + i * 60; lbox(g, 110, y, 220, 46, c, k + kk, { c: cls(c) }); if (i) g.line(220, y - 13, 220, y - 2, C.mute, { arrow: 1 }); });
    vspan(g, 96, 10, 236, C.mute); g.text(10, 123, k + 'pc', { c: 'm', w: 80, va: 'mid' }); vspan(g, 96, 250, 356, C.mute); g.text(10, 303, k + 'disp', { c: 'm', w: 80, va: 'mid' });
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
    const svg = S('svg', { viewBox: `0 0 ${spec.W} ${spec.H}`, role: 'img', 'aria-label': t('dg.' + fig.dataset.dg + '.aria'), class: L }, box);
    arrowDefs(svg); spec.draw(mk(svg)); wrapTexts(svg);
  }
}

/* ───────── 01 the framebuffer ───────── */
(() => {
  function text() {
    const r = M.framebuffer(radioVal('fbR'), radioVal('fbF'), +radioVal('fbH'), +radioVal('fbB'));
    const mib = x => t('u.mib', { v: fmt(x, 1) }), bw = t('u.gbs', { v: fmt(r.readGBps, 2) });
    put('#fbFrame', mib(r.frameMiB)); put('#fbTotal', mib(r.totalMiB)); put('#fbPx', t('u.pxs', { v: fmt(r.pxPerS, 0) })); put('#fbBw', bw);
    putHTML('#fbSay', t(M.say.fb(r).key, { frame: mib(r.frameMiB), hz: fmt(+radioVal('fbH'), 0), bw }));
  }
  ['fbR', 'fbF', 'fbH', 'fbB'].forEach(n => radios(n).forEach(e => e.addEventListener('change', text)));
  reg([], { draw() {}, text }); text();
})();

/* ───────── 02 raster timing ───────── */
(() => {
  const cv = $('#tmCv'), sH = $('#tmHfp'), sB = $('#tmHbp'), sV = $('#tmVfp');
  const base = () => M.TIM.presets[radioVal('tmP')];
  const cur = () => M.timing(base(), { hfp: +sH.value, hbp: +sB.value, vfp: +sV.value });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = cur();
    const k = Math.min((w - 20) / r.hTot, (h - 16) / r.vTot), W = r.hTot * k, H = r.vTot * k, x = (w - W) / 2, y = (h - H) / 2;
    c.fillStyle = C.dimfill; c.fillRect(x, y, W, H);
    c.fillStyle = 'rgba(240,122,109,.45)'; c.fillRect(x + (r.h[0] + r.h[1]) * k, y, r.h[2] * k, H); c.fillRect(x, y + (r.v[0] + r.v[1]) * k, W, r.v[2] * k);
    c.fillStyle = 'rgba(233,185,73,.55)'; c.fillRect(x, y, r.h[0] * k, r.v[0] * k);
    c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(x + 0.5, y + 0.5, r.h[0] * k - 1, r.v[0] * k - 1);
  } });
  function text() {
    const r = cur();
    put('#tmHfpo', fmt(r.h[1], 0)); put('#tmHbpo', fmt(r.h[3], 0)); put('#tmVfpo', fmt(r.v[1], 0));
    const tot = fmt(r.hTot, 0) + ' × ' + fmt(r.vTot, 0), pc = mhz(r.pclkMHz, r.pclkMHz % 1 ? 3 : 0), ln = us(r.lineUs, 2), vb = us(r.vblankUs, 0);
    put('#tmTot', tot); put('#tmPclk', pc); put('#tmLine', ln); put('#tmVbl', vb); put('#tmBlank', pct(r.blankShare, 1));
    putHTML('#tmSay', t(M.say.timing(r).key, { tot, pclk: pc, line: ln, vbl: vb }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  radios('tmP').forEach(e => e.addEventListener('change', () => { const b = base(); sH.value = b.h[1]; sB.value = b.h[3]; sV.value = b.v[1]; go(); }));
  [sH, sB, sV].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 03/04 the present-queue timeline (shared drawing) ───────── */
const PAL = [C.gold, C.cyan, C.violet, C.green, C.pink];
function drawTimeline(cv, r) {
  const { c, w, h } = fit(cv), p = r.p, t0 = p.warm, span = w < 500 ? 100 : 150, t1 = t0 + span;
  c.font = FONT; const lw = Math.max(c.measureText(t('ch3.cv.gpu')).width, c.measureText(t('ch3.cv.scr')).width) + 14;
  const f = frame(w, h, [14, 12, 46, lw + 6], t0, t1, 0, 1), X = f.X, colOf = id => (id < 0 ? C.dimfill : PAL[id % PAL.length]);
  const yG = 22, hG = 34, yS = 92, hS = 52;
  c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch3.cv.gpu'), f.L - 8, yG + hG / 2); c.fillText(t('ch3.cv.scr'), f.L - 8, yS + hS / 2);
  c.save(); c.beginPath(); c.rect(f.L, 0, f.R - f.L, h); c.clip();
  for (const fr of r.frames) { if (fr.end < t0 || fr.start > t1) continue; c.fillStyle = colOf(fr.id); c.globalAlpha = fr.first == null ? 0.35 : 0.85; c.fillRect(X(fr.start) + 1, yG, Math.max(1, X(fr.end) - X(fr.start) - 2), hG); c.globalAlpha = 1;
    if (fr.first != null && fr.first >= t0 - 40 && fr.first <= t1) { c.strokeStyle = colOf(fr.id); c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(X(fr.end), yG + hG); c.lineTo(X(fr.first), yS); c.stroke(); c.setLineDash([]); } }
  for (const s of r.scans) {
    if (s.t > t1 || s.t + r.Sc < t0) continue;
    const x0 = X(s.t), x1 = X(s.t + r.Sc);
    for (const [id, a, b] of s.segs) { const ya = yS + hS * a, yb = yS + hS * b; c.fillStyle = colOf(id); c.globalAlpha = 0.8; c.fillRect(x0, ya, x1 - x0, yb - ya); c.globalAlpha = 1; }
    if (s.repeat) { c.strokeStyle = 'rgba(15,18,25,.75)'; c.lineWidth = 1.5; c.save(); c.beginPath(); c.rect(x0, yS, x1 - x0, hS); c.clip(); for (let x = x0 - hS; x < x1; x += 7) { c.beginPath(); c.moveTo(x, yS + hS); c.lineTo(x + hS, yS); c.stroke(); } c.restore(); }
    for (const tr of s.tears) { c.strokeStyle = C.red; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x0 - 2, yS + hS * tr); c.lineTo(x1 + 2, yS + hS * tr); c.stroke(); }
  }
  c.restore();
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  const step = span <= 100 ? 20 : 25, ticks = [];
  for (let v = 0; v <= span; v += step) ticks.push([X(t0 + v), fmt(v, 0)]);
  c.fillStyle = C.mute; spacedTicks(c, ticks, f.B + 12, w); axes(c, { L: f.L, R: f.R, T: f.B, B: f.B }, t('ch3.cv.t'), '');
}
function presentText(r, ids, say) {
  put(ids[0], t('u.fps', { v: fmt(r.shownFps, 0) }));
  if (ids[1]) put(ids[1], ids[1] === '#vrRep' ? t('u.perS', { v: fmt(r.repeatsPerS, 0) }) : t('u.perS', { v: fmt(r.tearsPerS, 0) }));
  put(ids[2], ms(r.pacing, 1)); put(ids[3], ms(r.latency, 1));
  const z = M.say.present(r);
  putHTML(say, t(z.key, { tears: fmt(r.tearsPerS, 0), lat: ms(r.latency, 1), shown: t('u.fps', { v: fmt(r.shownFps, 0) }), hmin: ms(r.holdMin, 1), hmax: ms(r.holdMax, 1), pace: ms(r.pacing, 1), n: fmt(r.latency / r.P, 1), drop: fmt(r.dropped, 0), rep: fmt(r.repeatsPerS, 0) }));
}
(() => {
  const cv = $('#psCv'), sF = $('#psF'), sJ = $('#psJ');
  const run = () => M.present({ mode: radioVal('psM'), hz: +radioVal('psH'), ms: 1000 / +sF.value, jitter: +sJ.value / 100 });
  let r = run();
  const sim = reg(cv, { draw() { drawTimeline(cv, r); } });
  function text() { put('#psFo', t('u.fps', { v: fmt(+sF.value, 0) })); put('#psJo', pct(+sJ.value / 100, 0)); presentText(r, ['#psShown', '#psTears', '#psPace', '#psLat'], '#psSay'); }
  sim.text = text;
  const go = () => { r = run(); sim.dirty = true; text(); };
  [...radios('psM'), ...radios('psH')].forEach(e => e.addEventListener('change', go)); [sF, sJ].forEach(s => s.addEventListener('input', go));
  text();
})();
(() => {
  const cv = $('#vrCv'), sF = $('#vrF'), sJ = $('#vrJ'), cL = $('#vrL');
  const run = () => { const [a, b] = radioVal('vrR').split('_').map(Number); return M.present({ mode: 'vrr', vmin: a, vmax: b, lfc: cL.checked, ms: 1000 / +sF.value, jitter: +sJ.value / 100 }); };
  let r = run();
  const sim = reg(cv, { draw() { drawTimeline(cv, r); } });
  function text() { put('#vrFo', t('u.fps', { v: fmt(+sF.value, 0) })); put('#vrJo', pct(+sJ.value / 100, 0)); presentText(r, ['#vrShown', '#vrRep', '#vrPace', '#vrLat'], '#vrSay'); }
  sim.text = text;
  const go = () => { r = run(); sim.dirty = true; text(); };
  radios('vrR').forEach(e => e.addEventListener('change', go)); cL.addEventListener('change', go); [sF, sJ].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 05 the colour pipeline ───────── */
(() => {
  function text() {
    const tg = radioVal('coT'), bits = +radioVal('coB'), n = +radioVal('coL'), r = M.colour(M.COL.colours[radioVal('coC')], tg, bits, n);
    const tri = a => a.map(x => fmt(x, 0)).join(', '), trf = a => a.map(x => fmt(x, 4)).join(', ');
    const rows = [['ch5.st.in', tri(r.enc.map(x => x * 255)), C.gold], ['ch5.st.lin', trf(r.lin), C.cyan], ['ch5.st.ctm', trf(r.lin2), C.cyan], ['ch5.st.out', tri(r.out) + ' / ' + fmt(r.max, 0), C.violet]];
    if (r.nits) rows.push(['ch5.st.nits', r.nits.map(x => fmt(x, 1)).join(', '), C.gold]);
    putHTML('#coSt', rows.map(([k, v, col]) => `<li><span><i style="background:${col}"></i>${esc(t(k))}</span><b>${esc(v)}</b></li>`).join(''));
    put('#coOut', tri(r.out)); put('#coLv', fmt(r.levels, 0)); put('#coErr', t('u.codes', { v: fmt(r.worst, 1) }));
    const z = M.say.colour(r, tg);
    putHTML('#coSay', t(z.key, { out: tri(r.out), sdr: fmt(M.COL.sdrNits, 0), n: fmt(n, 0), err: t('u.codes', { v: fmt(r.worst, 1) }), lv: fmt(r.levels, 0) }));
  }
  ['coC', 'coT', 'coB', 'coL'].forEach(nm => radios(nm).forEach(e => e.addEventListener('change', text)));
  reg([], { draw() {}, text }); text();
})();

/* ───────── 06 what fits on which link ───────── */
(() => {
  const cv = $('#lkCv');
  const run = () => { const d = +radioVal('lkD'); return M.linkFit(radioVal('lkM'), +radioVal('lkB'), radioVal('lkC'), d); };
  let r = run();
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), max = Math.max(r.need.gbps, ...r.rows.map(x => x.cap)) * 1.12;
    const rows = r.rows.map(x => ({ lab: t('ch6.lk.' + x.k), v: x.cap, col: x.na ? '#59607a' : x.fits ? C.green : C.red, txt: x.na ? t('ch6.cv.na') : gbps(x.cap, x.cap >= 100 ? 0 : 2), hi: x.k === r.first }));
    bars(c, w, h, rows, max, [[r.need.gbps, C.gold]]);
  } });
  function text() {
    const n = r.need, need = gbps(n.gbps, 2), pc = mhz(n.tm.pclkMHz, n.tm.pclkMHz % 1 ? 3 : 0), first = r.first ? t('ch6.lk.' + r.first) : t('u.none');
    put('#lkPclk', pc); put('#lkNeed', need); put('#lkFirst', first);
    putHTML('#lkSay', t(M.say.link(r).key, { need, pclk: pc, bpp: t('u.bpp', { v: fmt(n.bpp, n.bpp % 1 ? 1 : 0) }), first }));
  }
  sim.text = text;
  const go = () => { r = run(); sim.dirty = true; text(); };
  ['lkM', 'lkB', 'lkC', 'lkD'].forEach(nm => radios(nm).forEach(e => e.addEventListener('change', go)));
  text();
})();

/* ───────── 07 chroma subsampling ───────── */
(() => {
  const cv = $('#sbCv');
  const run = () => M.subsample(radioVal('sbP'), radioVal('sbM'));
  let r = run();
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), W = M.SUB.W, H = M.SUB.H, gap = 18, cs = Math.floor(Math.min((w - gap - 8) / (2 * W), (h - 30) / H));
    const tw = cs * W, x0 = (w - 2 * tw - gap) / 2, y0 = 26;
    [[r.src, x0, 'ch7.cv.src'], [r.out, x0 + tw + gap, 'ch7.cv.out']].forEach(([px, x, k]) => {
      px.forEach((col, i) => { c.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; c.fillRect(x + (i % W) * cs, y0 + Math.floor(i / W) * cs, cs, cs); });
      c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t(k), x + tw / 2, 12);
    });
  } });
  function text() {
    const m = radioVal('sbM');
    put('#sbBits', t('u.bpp', { v: fmt(r.bitsPerPx, 0) })); put('#sbMean', fmt(r.mean, 1)); put('#sbWorst', fmt(r.worst, 0)); put('#sbBad', pct(r.share, 0));
    putHTML('#sbSay', t(M.say.sub(r, m).key, { bad: pct(r.share, 0), worst: fmt(r.worst, 0), mean: fmt(r.mean, 1) }));
  }
  sim.text = text;
  const go = () => { r = run(); sim.dirty = true; text(); };
  [...radios('sbP'), ...radios('sbM')].forEach(e => e.addEventListener('change', go));
  text();
})();

/* ───────── 08 row time and settling ───────── */
(() => {
  const cv = $('#rwCv'), sH = $('#rwH'), HZ = [30, 60, 90, 120, 144, 240, 360, 480];
  const run = () => M.rowTime(+radioVal('rwR'), HZ[+sH.value], radioVal('rwT'));
  let r = run();
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), tmax = Math.max(r.lineUs * 1.25, r.needUs * 1.1);
    const f = frame(w, h, [28, 16, 44, 46], 0, tmax, 0, 1);
    yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100, 0) + '%'); axes(c, f, t('ch8.cv.t'), t('ch8.cv.v'));
    const ticks = []; const st = tmax > 20 ? 5 : tmax > 8 ? 2 : tmax > 3 ? 1 : 0.5; for (let v = 0; v <= tmax; v += st) ticks.push([f.X(v), fmt(v, st < 1 ? 1 : 0)]);
    c.fillStyle = C.mute; spacedTicks(c, ticks, f.B + 12, w);
    const pts = []; for (let i = 0; i <= 120; i++) { const x = tmax * i / 120; pts.push([x, 1 - Math.exp(-x / r.tau)]); }
    c.save(); c.beginPath(); c.rect(f.L, f.T - 2, f.X(r.lineUs) - f.L, f.B - f.T + 4); c.clip(); path(c, pts, f.X, f.Y, C.gold, 2.6); c.restore();
    c.save(); c.beginPath(); c.rect(f.X(r.lineUs), f.T - 2, f.R - f.X(r.lineUs), f.B - f.T + 4); c.clip(); path(c, pts, f.X, f.Y, C.mute, 1.6, [4, 4]); c.restore();
    c.strokeStyle = r.ok ? C.green : C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(f.X(r.lineUs), f.T); c.lineTo(f.X(r.lineUs), f.B); c.stroke();
    dot(c, f.X(r.lineUs), f.Y(1 - r.err), r.ok ? C.green : C.red, 5);
    c.fillStyle = r.ok ? C.green : C.red; const lab = t('ch8.cv.line'), lw = c.measureText(lab).width, xl = f.X(r.lineUs);
    c.textAlign = xl + 6 + lw < f.R ? 'left' : 'right'; c.fillText(lab, xl + (c.textAlign === 'left' ? 6 : -6), f.Y(0.25));
  } });
  function text() {
    put('#rwHo', t('u.hz', { v: fmt(HZ[+sH.value], 0) }));
    put('#rwLine', us(r.lineUs, 2)); put('#rwTau', us(r.tau, 2)); put('#rwErr', t('u.codes', { v: fmt(r.errCodes, r.errCodes < 1 ? 2 : 1) })); put('#rwMax', t('u.hz', { v: fmt(r.hzMax, 0) }));
    putHTML('#rwSay', t(M.say.row(r).key, { line: us(r.lineUs, 2), k: fmt(r.lineUs / r.tau, 1), err: t('u.codes', { v: fmt(r.errCodes, 1) }), max: t('u.hz', { v: fmt(r.hzMax, 0) }) }));
  }
  sim.text = text;
  const go = () => { r = run(); sim.dirty = true; text(); };
  [...radios('rwR'), ...radios('rwT')].forEach(e => e.addEventListener('change', go)); sH.addEventListener('input', go);
  text();
})();

/* ───────── 09 motion blur ───────── */
(() => {
  const cv = $('#blCv');
  const args = () => [+radioVal('blV'), +radioVal('blH'), +radioVal('blD'), M.BLUR.taus[radioVal('blT')]];
  let r = M.blur(...args());
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), u0 = r.us[0], u1 = r.us[r.us.length - 1], f = frame(w, h, [28, 16, 44, 46], u0, u1, 0, 1.05);
    const lo = r.prof[r.prof.length - 1], hi = r.prof[0];
    let a = NaN, b = NaN; for (let i = 1; i < r.us.length; i++) { const p0 = (r.prof[i - 1] - lo) / (hi - lo), p1 = (r.prof[i] - lo) / (hi - lo); if (isNaN(a) && p1 <= 0.9 && p0 >= 0.9) a = r.us[i]; if (isNaN(b) && p1 <= 0.1 && p0 >= 0.1) b = r.us[i]; }
    if (!isNaN(a) && !isNaN(b)) { c.fillStyle = 'rgba(233,185,73,.16)'; c.fillRect(f.X(a), f.T, Math.max(2, f.X(b) - f.X(a)), f.B - f.T); }
    yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100, 0) + '%'); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
    const span = u1 - u0, st = span > 200 ? 50 : span > 80 ? 20 : span > 30 ? 10 : 5, ticks = [];
    for (let v = Math.ceil(u0 / st) * st; v <= u1; v += st) ticks.push([f.X(v), fmt(v, 0)]);
    c.fillStyle = C.mute; spacedTicks(c, ticks, f.B + 12, w);
    path(c, r.us.map((u, i) => [u, (r.prof[i] - lo) / (hi - lo)]), f.X, f.Y, C.cyan, 2.6);
  } });
  function text() {
    const [v, , duty] = args(), wpx = t('u.px', { v: fmt(r.width, 1) });
    put('#blW', wpx); put('#blMs', ms(r.ms, 1)); put('#blHold', t('u.px', { v: fmt(r.holdPx, 1) }));
    const z = M.say.blur(r, duty, args()[3]);
    putHTML('#blSay', t(z.key, { jump: t('u.px', { v: fmt(v * r.T / 1000, 1) }), w: wpx, duty: pct(duty, 0) }));
  }
  sim.text = text;
  const go = () => { r = M.blur(...args()); sim.dirty = true; text(); };
  ['blV', 'blH', 'blD', 'blT'].forEach(nm => radios(nm).forEach(e => e.addEventListener('change', go)));
  text();
})();

/* ───────── 10 PQ ───────── */
(() => {
  const cv = $('#pqCv'), sN = $('#pqN');
  const nits = () => Math.pow(10, -2 + 6 * +sN.value / 60), peak = () => +radioVal('pqK');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [28, 16, 44, 52], -2, 4, 0, 1023);
    yTicks(c, f, [0, 256, 512, 768, 1023], v => fmt(v, 0)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [-2, -1, 0, 1, 2, 3, 4].map(e => [f.X(e), fmt(Math.pow(10, e), e < 0 ? Math.abs(e) : 0)]), f.B + 12, w);
    const pk = peak(), pq = [], gm = [];
    for (let i = 0; i <= 160; i++) { const e = -2 + 6 * i / 160, L = Math.pow(10, e); pq.push([e, M.pqEncode(L) * 1023]); gm.push([e, Math.pow(Math.min(L / pk, 1), 1 / 2.4) * 1023]); }
    path(c, gm, f.X, f.Y, C.cyan, 2.2); path(c, pq, f.X, f.Y, C.gold, 2.6);
    const L = nits(), s = M.steps(L, pk);
    dot(c, f.X(Math.log10(L)), f.Y(s.gamma.code), C.cyan, 5); dot(c, f.X(Math.log10(L)), f.Y(s.pq.code), C.gold, 5);
  } });
  function text() {
    const L = nits(), pk = peak(), s = M.steps(L, pk), nv = t('u.nits', { v: fmt(L, L < 1 ? 2 : L < 10 ? 1 : 0) });
    put('#pqNo', nv); put('#pqC', fmt(s.pq.code, 0)); put('#pqS', pct(s.pq.step, 2)); put('#pqG', fmt(s.gamma.code, 0)); put('#pqGs', s.gamma.clipped ? t('u.none') : pct(s.gamma.step, 2));
    putHTML('#pqSay', t(M.say.pq(s).key, { nits: nv, pqs: pct(s.pq.step, 2), gs: pct(s.gamma.step, 2), peak: t('u.nits', { v: fmt(pk, 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); radios('pqK').forEach(e => e.addEventListener('change', go));
  text();
})();

/* ───────── 11 the latency waterfall ───────── */
(() => {
  const cv = $('#ltCv'), sF = $('#ltF'), cC = $('#ltC');
  const run = () => M.latency({ fps: +sF.value, hz: +radioVal('ltH'), mode: radioVal('ltM'), composed: cC.checked, panel: radioVal('ltP'), poll: +radioVal('ltQ') });
  let r = run();
  const COLS = { poll: C.mute, tick: C.mute, render: C.gold, compose: C.cyan, scan: C.cyan, panel: C.green };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv); let acc = 0; const rows = r.stages.map(([k, v]) => { const a = acc; acc += v; return { lab: t('ch11.st.' + k), a, v: acc, col: COLS[k], txt: ms(v, 1) }; });
    rows.push({ lab: t('ch11.read.tot'), a: 0, v: acc, col: C.red, txt: ms(acc, 1), hi: true });
    bars(c, w, h, rows, acc * 1.25 + 1);
  } });
  function text() {
    put('#ltFo', t('u.fps', { v: fmt(+sF.value, 0) }));
    const big = r.stages.reduce((a, b) => (b[1] > a[1] ? b : a));
    put('#ltTot', ms(r.total, 1)); put('#ltBig', t('ch11.st.' + big[0]));
    putHTML('#ltSay', t(M.say.lat(r).key, { v: ms(big[1], 1) }));
  }
  sim.text = text;
  const go = () => { r = run(); sim.dirty = true; text(); };
  ['ltH', 'ltM', 'ltP', 'ltQ'].forEach(nm => radios(nm).forEach(e => e.addEventListener('change', go))); cC.addEventListener('change', go); sF.addEventListener('input', go);
  text();
})();

/* ───────── loop ───────── */
applyLang();
function tick() {
  for (const s of sims) { if (!s.vis) continue; if (s.dirty) { s.draw(); s.dirty = false; } }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
void reduce;
window.__essayReady = true;
})();
