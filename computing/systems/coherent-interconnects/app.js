/* How chips share memory across a wire: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.LinkModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const { KiB, MiB, GiB } = M;

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
function size(bytes) { return bytes >= GiB ? t('u.GiB', { v: fmt(bytes / GiB, bytes % GiB ? 1 : 0) }) : bytes >= MiB ? t('u.MiB', { v: fmt(bytes / MiB, bytes % MiB ? 1 : 0) }) : bytes >= KiB ? t('u.KiB', { v: fmt(bytes / KiB, bytes % KiB ? 1 : 0) }) : t('u.B', { v: fmt(bytes, 0) }); }
// a time in seconds, in the unit that reads best
function tm(s) { const d = v => (v < 10 ? 1 : 0); if (s < 1e-3) { const v = s * 1e6; return t('u.us', { v: fmt(v, v < 10 ? 2 : d(v)) }); } if (s < 1) { const v = s * 1e3; return t('u.ms', { v: fmt(v, d(v)) }); } return t('u.s', { v: fmt(s, s < 10 ? 2 : 1) }); }
const gbps = (x, dd) => t('u.GBps', { v: fmt(x, dd == null ? (x < 10 ? 1 : 0) : dd) });
const hex = n => '0x' + Math.round(n).toString(16).toUpperCase();
let PROSE = null;
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : fmt(v, d); return o; }
function applyLang() {
  const PV = proseVars();
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, PV); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('[data-hk]').forEach(e => { e.dataset.h = t(e.dataset.hk); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  nvRows();
  renderDiagrams(true);
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
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
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
  if (c.measureText(s).width + 14 <= cap || s.indexOf(' ') < 0) return [s];
  let best = [s], bw = Infinity;
  for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(c.measureText(a).width, c.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function labelFont(c, labels, cap) { c.font = FONT; const lines = new Map(); let lw = 0; for (const s of labels) { const ls = splitLabel(c, s, cap); lines.set(s, ls); for (const l of ls) lw = Math.max(lw, c.measureText(l).width); } const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap), lines, lh: 13 * k }; }
// horizontal bars: rows of [label, value, colour, text]; value text after the bar, or inside it when there is no room
function bars(c, w, h, rows, max, hiIdx) {
  const labs = rows.map(r => r[0]), lf = labelFont(c, labs, Math.min(170, w * 0.36));
  const L = lf.w, R = w - 10, T = 10, B = h - 10, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.min(v, max) / max;
  rows.forEach(([lab, v, col, txt], i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(22, rh * 0.56);
    c.font = lf.font; c.textAlign = 'right'; c.fillStyle = i === hiIdx ? C.gold : C.ink; const ls = lf.lines.get(lab) || [lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
    c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
    if (v > 0) { c.fillStyle = col; c.fillRect(L, y - bh / 2, Math.max(1.5, X(v) - L), bh); }
    if (i === hiIdx) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L - 0.5, y - bh / 2 - 0.5, R - L + 1, bh + 1); }
    if (txt) {
      let tw = c.measureText(txt).width; const xe = X(Math.max(v, 0));
      if (xe - L < tw + 10 && xe + 6 + tw > R) { const k = Math.max(0.6, (R - xe - 6) / tw); c.font = FONT.replace('12px', (12 * k).toFixed(1) + 'px'); tw = c.measureText(txt).width; }
      if (xe + 6 + tw <= R + 0.5) { c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xe + 6, y); }
      else { c.fillStyle = C.bg; c.textAlign = 'right'; c.fillText(txt, Math.max(L + tw + 4, xe - 6), y); }
      c.font = FONT;
    }
  });
}


/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, labels from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, prose column ≥ 600 px) and 'n' (viewBox 340 wide). Text is 14 units, so it
   renders at ≥ 11.7 px in either layout at its narrowest. A label with a width limit wraps onto more lines. */
const NS = 'http://www.w3.org/2000/svg';
const FS = 14, LH = 18;
function S(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function mk(svg) {
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; S('rect', { x, y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: o.solid ? col : tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; S('circle', { cx, cy, r, fill: o.solid ? col : tint(col, 0.14), stroke: col, 'stroke-width': o.sw || 1.6 }, svg); },
    // text: key (or {raw}), position, options: a = start|middle|end, c = colour class, w = wrap width, vars
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, o.vars);
      const e = S('text', { x, y, 'font-size': o.fs || FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: (o.c || '') + (o.mono ? ' mono' : '') }, svg);
      e.textContent = s; if (o.w) { e.dataset.w = o.w; e.dataset.va = o.va || 'top'; } if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    },
    badge(cx, cy, n, col) { g.circle(cx, cy, 11, col, { solid: true }); g.text(cx, cy, { raw: String(n) }, { a: 'middle', c: 'k', weight: 700, fs: 13.5 }); }
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
// wrap text that has a width limit: split at spaces (or between CJK characters) into tspans
function wrapTexts(svg) {
  for (const e of svg.querySelectorAll('text[data-w]')) {
    const maxw = +e.dataset.w; if (e.getComputedTextLength() <= maxw) continue;
    const s = e.textContent, x = e.getAttribute('x'), y0 = +e.getAttribute('y'), cjk = /[\u3000-\u9fff\uff00-\uffef]/.test(s);
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; let lines = [], cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}
const DG = {};
const LW = L => L === 'w';
// one panel of the copy-vs-share diagram (330 × 270)
function copyPanel(g, x0, y0, share) {
  g.text(x0, y0 + 14, share ? 'dg.copy.titleR' : 'dg.copy.titleL', { c: share ? 'g' : 'c', weight: 600 });
  g.box(x0, y0 + 34, 150, 180, C.cyan, { a: 0.06 }); g.text(x0 + 75, y0 + 52, 'dg.copy.host', { a: 'middle' });
  g.box(x0 + 12, y0 + 68, 126, 134, C.mute, { a: 0.08 }); g.text(x0 + 75, y0 + 84, 'dg.copy.hmem', { a: 'middle', c: 'm' });
  const used = [2, 5];
  for (let i = 0; i < 8; i++) g.box(x0 + 26, y0 + 100 + i * 10, 98, 7, share ? (used.includes(i) ? C.gold : C.dimfill) : C.cyan, { solid: true, rx: 2, nostroke: true });
  g.text(x0 + 75, y0 + 190, 'dg.copy.buf', { a: 'middle', c: 'm' });
  g.box(x0 + 180, y0 + 34, 150, 180, C.gold, { a: 0.06 }); g.text(x0 + 255, y0 + 52, 'dg.copy.dev', { a: 'middle' });
  g.box(x0 + 192, y0 + 68, 126, 134, C.mute, { a: 0.08 }); g.text(x0 + 255, y0 + 84, share ? 'dg.copy.cache' : 'dg.copy.dmem', { a: 'middle', c: 'm' });
  if (share) {
    used.forEach((i, j) => g.box(x0 + 206, y0 + 110 + j * 14, 98, 7, C.gold, { solid: true, rx: 2, nostroke: true }));
    used.forEach((i, j) => g.line(x0 + 124, y0 + 103 + i * 10, x0 + 204, y0 + 113 + j * 14, C.gold, { arrow: 1, sw: 1.4 }));
    g.text(x0, y0 + 238, 'dg.copy.lines', { c: 'g', w: 330 }); g.text(x0, y0 + 260, 'dg.copy.coh', { c: 'm', w: 330 });
  } else {
    for (let i = 0; i < 8; i++) g.box(x0 + 206, y0 + 100 + i * 10, 98, 7, C.cyan, { solid: true, rx: 2, nostroke: true, a: 0.6 });
    g.line(x0 + 150, y0 + 124, x0 + 178, y0 + 124, C.cyan, { arrow: 1, sw: 2.4 }); g.line(x0 + 180, y0 + 160, x0 + 152, y0 + 160, C.mute, { arrow: 1, dash: '4 3' });
    g.text(x0 + 255, y0 + 190, 'dg.copy.copy', { a: 'middle', c: 'm' });
    g.text(x0, y0 + 238, 'dg.copy.dma', { c: 'c', w: 330 }); g.text(x0, y0 + 260, 'dg.copy.back', { c: 'm', w: 330 });
  }
}
DG.copy = (L) => LW(L) ? { W: 720, H: 280, draw(g) { copyPanel(g, 15, 4, false); copyPanel(g, 375, 4, true); } }
  : { W: 340, H: 560, draw(g) { copyPanel(g, 5, 4, false); copyPanel(g, 5, 284, true); } };

DG.ha = (L) => {
  const w = LW(L);
  return w ? { W: 720, H: 320, draw(g) {
    g.box(20, 14, 380, 280, C.cyan, { a: 0.05 }); g.text(36, 34, 'dg.ha.host', { weight: 600 });
    g.box(40, 50, 340, 38, C.mute, { a: 0.1 }); g.text(210, 69, 'dg.ha.cores', { a: 'middle' });
    g.box(40, 98, 340, 34, C.mute, { a: 0.1 }); g.text(210, 115, 'dg.ha.llc', { a: 'middle' });
    g.box(230, 142, 150, 70, C.cyan, { a: 0.16 }); g.text(305, 177, 'dg.ha.home', { a: 'middle', c: 'c', weight: 600 });
    g.box(40, 142, 180, 70, C.violet, { a: 0.14 }); g.text(130, 177, 'dg.ha.sf', { a: 'middle', c: 'v', w: 164, va: 'mid' });
    g.box(40, 226, 340, 50, C.mute, { a: 0.1 }); g.text(210, 251, 'dg.ha.mem', { a: 'middle' });
    g.line(305, 212, 305, 226, C.mute); g.line(220, 177, 230, 177, C.mute);
    g.box(480, 14, 220, 200, C.gold, { a: 0.05 }); g.text(496, 34, 'dg.ha.dev', { weight: 600 });
    g.box(496, 50, 188, 40, C.gold, { a: 0.14 }); g.text(590, 70, 'dg.ha.dcache', { a: 'middle', c: 'g' });
    g.box(496, 102, 188, 40, C.mute, { a: 0.1 }); g.text(590, 122, 'dg.ha.acc', { a: 'middle' });
    g.box(496, 154, 188, 40, C.mute, { a: 0.1 }); g.text(590, 174, 'dg.ha.dmem', { a: 'middle' });
    g.line(496, 74, 382, 160, C.gold, { arrow: 1 }); g.line(380, 196, 494, 112, C.cyan, { arrow: 1, dash: '5 4' });
    g.text(440, 238, 'dg.ha.link', { a: 'middle', c: 'm' });
    g.line(480, 258, 520, 258, C.gold); g.text(530, 258, 'dg.ha.req', { c: 'g' });
    g.line(480, 284, 520, 284, C.cyan, { dash: '5 4' }); g.text(530, 284, 'dg.ha.snp', { c: 'c' });
  } } : { W: 340, H: 640, draw(g) {
    g.box(10, 10, 320, 276, C.cyan, { a: 0.05 }); g.text(24, 30, 'dg.ha.host', { weight: 600 });
    g.box(24, 46, 292, 36, C.mute, { a: 0.1 }); g.text(170, 64, 'dg.ha.cores', { a: 'middle' });
    g.box(24, 90, 292, 32, C.mute, { a: 0.1 }); g.text(170, 106, 'dg.ha.llc', { a: 'middle' });
    g.box(24, 130, 120, 76, C.cyan, { a: 0.16 }); g.text(84, 168, 'dg.ha.home', { a: 'middle', c: 'c', weight: 600 });
    g.box(152, 130, 164, 76, C.violet, { a: 0.14 }); g.text(234, 168, 'dg.ha.sf', { a: 'middle', c: 'v', w: 150, va: 'mid' });
    g.box(24, 220, 292, 52, C.mute, { a: 0.1 }); g.text(210, 246, 'dg.ha.mem', { a: 'middle' });
    g.line(80, 344, 80, 208, C.gold, { arrow: 1 }); g.line(50, 208, 50, 342, C.cyan, { arrow: 1, dash: '5 4' });
    g.text(96, 316, 'dg.ha.link', { c: 'm' });
    g.box(10, 346, 320, 196, C.gold, { a: 0.05 }); g.text(24, 366, 'dg.ha.dev', { weight: 600 });
    g.box(24, 380, 292, 38, C.gold, { a: 0.14 }); g.text(170, 399, 'dg.ha.dcache', { a: 'middle', c: 'g' });
    g.box(24, 428, 292, 38, C.mute, { a: 0.1 }); g.text(170, 447, 'dg.ha.acc', { a: 'middle' });
    g.box(24, 476, 292, 38, C.mute, { a: 0.1 }); g.text(170, 495, 'dg.ha.dmem', { a: 'middle' });
    g.line(14, 576, 54, 576, C.gold); g.text(64, 576, 'dg.ha.req', { c: 'g' });
    g.line(14, 606, 54, 606, C.cyan, { dash: '5 4' }); g.text(64, 606, 'dg.ha.snp', { c: 'c' });
  } };
};

DG.stack = (L) => {
  const F = M.SRC.cxl.flit68, v = { pid: F.pid, crc: F.crc };
  if (LW(L)) return { W: 720, H: 300, draw(g) {
    g.box(20, 14, 220, 84, C.green, { a: 0.12 }); g.text(130, 32, 'dg.stack.io', { a: 'middle', c: 'n', weight: 600 }); g.text(130, 58, 'dg.stack.ioSub', { a: 'middle', w: 200, va: 'top' });
    g.box(254, 8, 446, 96, C.mute, { a: 0.04, dash: '4 4' });
    g.box(266, 16, 206, 42, C.cyan, { a: 0.14 }); g.text(369, 37, 'dg.stack.cache', { a: 'middle', c: 'c', weight: 600 });
    g.box(482, 16, 206, 42, C.gold, { a: 0.14 }); g.text(585, 37, 'dg.stack.mem', { a: 'middle', c: 'g', weight: 600 });
    g.text(477, 82, 'dg.stack.cmSub', { a: 'middle', c: 'm', w: 420 });
    for (const x of [130, 369, 585]) g.line(x, x === 130 ? 98 : 104, x, 120, C.mute, { arrow: 1 });
    g.box(20, 122, 680, 34, C.violet, { a: 0.12 }); g.text(360, 139, 'dg.stack.arb', { a: 'middle', c: 'v' });
    g.line(360, 156, 360, 168, C.mute, { arrow: 1 });
    g.box(20, 170, 680, 34, C.mute, { a: 0.12 }); g.text(360, 187, 'dg.stack.phy', { a: 'middle', w: 660, va: 'mid' });
    g.text(20, 226, 'dg.stack.flit', { c: 'm' });
    g.box(20, 244, 110, 36, C.mute, { a: 0.25 }); g.text(75, 262, 'dg.stack.pid', { a: 'middle', vars: v });
    for (let i = 0; i < 4; i++) { g.box(130 + i * 116, 244, 116, 36, C.gold, { a: 0.14 }); g.text(188 + i * 116, 262, 'dg.stack.slot', { a: 'middle', vars: { i: i + 1 } }); }
    g.box(594, 244, 106, 36, C.mute, { a: 0.25 }); g.text(647, 262, 'dg.stack.crc', { a: 'middle', vars: v });
  } };
  return { W: 340, H: 600, draw(g) {
    g.box(10, 10, 320, 74, C.green, { a: 0.12 }); g.text(170, 28, 'dg.stack.io', { a: 'middle', c: 'n', weight: 600 }); g.text(170, 52, 'dg.stack.ioSub', { a: 'middle', w: 300 });
    g.box(10, 94, 320, 116, C.mute, { a: 0.04, dash: '4 4' });
    g.box(20, 104, 145, 40, C.cyan, { a: 0.14 }); g.text(92, 124, 'dg.stack.cache', { a: 'middle', c: 'c', weight: 600 });
    g.box(175, 104, 145, 40, C.gold, { a: 0.14 }); g.text(247, 124, 'dg.stack.mem', { a: 'middle', c: 'g', weight: 600 });
    g.text(170, 166, 'dg.stack.cmSub', { a: 'middle', c: 'm', w: 296 });
    g.box(10, 224, 320, 36, C.violet, { a: 0.12 }); g.text(170, 242, 'dg.stack.arb', { a: 'middle', c: 'v' });
    g.box(10, 272, 320, 56, C.mute, { a: 0.12 }); g.text(170, 300, 'dg.stack.phy', { a: 'middle', w: 296, va: 'mid' });
    g.text(10, 350, 'dg.stack.flit', { c: 'm' });
    const rows = [['dg.stack.pid', C.mute, 0.25, {}], [1, C.gold], [2, C.gold], [3, C.gold], [4, C.gold], ['dg.stack.crc', C.mute, 0.25, {}]];
    rows.forEach((r, i) => { const y = 366 + i * 36; g.box(10, y, 320, 30, r[1], { a: r[2] || 0.14 }); g.text(170, y + 15, typeof r[0] === 'string' ? r[0] : 'dg.stack.slot', { a: 'middle', vars: typeof r[0] === 'string' ? v : { i: r[0] } }); });
  } };
};

DG.types = (L) => {
  const pills = (g, x, y, list) => { let xx = x; for (const p of ['io', 'cache', 'mem']) { const on = list.includes(p), col = p === 'io' ? C.green : p === 'cache' ? C.cyan : C.gold, w = p === 'io' ? 40 : 62; g.box(xx, y, w, 26, on ? col : C.dimfill, { a: on ? 0.2 : 0.3, rx: 13, dash: on ? 'none' : '3 3' }); g.text(xx + w / 2, y + 13, { raw: p }, { a: 'middle', c: on ? (p === 'io' ? 'n' : p === 'cache' ? 'c' : 'g') : 'm', mono: 1 }); xx += w + 8; } };
  const parts = { 1: [['dg.types.cache', C.cyan]], 2: [['dg.types.cache', C.cyan], ['dg.types.mem', C.gold]], 3: [['dg.types.ctrl', C.mute], ['dg.types.mem', C.gold]] };
  if (LW(L)) return { W: 720, H: 330, draw(g) {
    g.box(20, 12, 680, 40, C.violet, { a: 0.12 }); g.text(360, 32, 'dg.types.host', { a: 'middle', c: 'v', weight: 600 });
    [1, 2, 3].forEach((k, i) => {
      const x = 20 + i * 240;
      g.line(x + 100, 52, x + 100, 90, C.mute);
      g.box(x, 90, 200, 226, C.gold, { a: 0.05 });
      g.text(x + 100, 110, 'dg.types.t' + k, { a: 'middle', weight: 600 }); g.text(x + 100, 134, 'dg.types.e' + k, { a: 'middle', c: 'm' });
      parts[k].forEach(([key, col], j) => { g.box(x + 16, 154 + j * 48, 168, 38, col, { a: 0.14 }); g.text(x + 100, 173 + j * 48, key, { a: 'middle' }); });
      pills(g, x + 16, 272, M.TYPES[k]);
    });
  } };
  return { W: 340, H: 640, draw(g) {
    g.box(10, 10, 320, 36, C.violet, { a: 0.12 }); g.text(170, 28, 'dg.types.host', { a: 'middle', c: 'v', weight: 600 });
    g.line(6, 46, 6, 600, C.mute, { sw: 1.2 });
    [1, 2, 3].forEach((k, i) => {
      const y = 60 + i * 192;
      g.line(6, y + 20, 14, y + 20, C.mute, { sw: 1.2 });
      g.box(14, y, 316, 178, C.gold, { a: 0.05 });
      g.text(28, y + 20, 'dg.types.t' + k, { weight: 600 }); g.text(316, y + 20, 'dg.types.e' + k, { a: 'end', c: 'm' });
      parts[k].forEach(([key, col], j) => { g.box(28, y + 40 + j * 44, 288, 36, col, { a: 0.14 }); g.text(172, y + 58 + j * 44, key, { a: 'middle' }); });
      pills(g, 28, y + 138, M.TYPES[k]);
    });
  } };
};

DG.exp = (L) => {
  const loc = M.SRC.liu.local, d = M.SRC.liu.devs.d;
  if (LW(L)) return { W: 720, H: 290, draw(g) {
    g.box(20, 16, 220, 60, C.cyan, { a: 0.12 }); g.text(130, 35, 'dg.exp.ddr', { a: 'middle', c: 'c' }); g.text(130, 58, 'dg.exp.ddrLat', { a: 'middle', c: 'm', vars: { lat: fmt(loc.lat, 0), bw: fmt(loc.bw, 0) } });
    g.line(130, 76, 130, 108, C.cyan, { sw: 2 });
    g.box(20, 108, 220, 60, C.violet, { a: 0.14 }); g.text(130, 138, 'dg.exp.cpu', { a: 'middle', c: 'v', weight: 600 });
    g.line(240, 150, 324, 150, C.gold, { sw: 3 }); g.text(282, 132, 'dg.exp.link', { a: 'middle', c: 'g' });
    g.box(324, 90, 196, 180, C.gold, { a: 0.06 }); g.text(422, 110, 'dg.exp.card', { a: 'middle', w: 184 });
    g.box(338, 134, 168, 32, C.gold, { a: 0.16 }); g.text(422, 150, 'dg.exp.ctrl', { a: 'middle', c: 'g' });
    for (let i = 0; i < 4; i++) { g.box(338 + i * 43, 178, 38, 34, C.mute, { a: 0.14, rx: 4 }); }
    g.text(422, 228, 'dg.exp.dimm', { a: 'middle', c: 'm' });
    g.text(422, 252, 'dg.exp.cardLat', { a: 'middle', c: 'm', vars: { lat: fmt(d.lat, 0), bw: fmt(d.bw, 0) } });
    g.text(706, 24, 'dg.exp.pages', { a: 'end' });
    for (let i = 0; i < 17; i++) { const hot = i < 5; g.box(536 + i * 10, 48, 8, 24, hot ? C.gold : C.cyan, { solid: true, rx: 2, nostroke: true, a: hot ? 1 : 0.6 }); }
    g.text(706, 196, 'dg.exp.hot', { a: 'end', c: 'g' }); g.text(706, 224, 'dg.exp.cold', { a: 'end', c: 'c' });
    g.line(534, 56, 242, 40, C.gold, { dash: '4 4', arrow: 1 }); g.line(620, 74, 524, 170, C.cyan, { dash: '4 4', arrow: 1 });
  } };
  return { W: 340, H: 540, draw(g) {
    g.box(10, 10, 320, 58, C.cyan, { a: 0.12 }); g.text(170, 28, 'dg.exp.ddr', { a: 'middle', c: 'c' }); g.text(170, 50, 'dg.exp.ddrLat', { a: 'middle', c: 'm', vars: { lat: fmt(loc.lat, 0), bw: fmt(loc.bw, 0) } });
    g.line(170, 68, 170, 90, C.cyan, { sw: 2 });
    g.box(10, 90, 320, 50, C.violet, { a: 0.14 }); g.text(170, 115, 'dg.exp.cpu', { a: 'middle', c: 'v', weight: 600 });
    g.line(170, 140, 170, 200, C.gold, { sw: 3 }); g.text(184, 170, 'dg.exp.link', { c: 'g' });
    g.box(10, 200, 320, 158, C.gold, { a: 0.06 }); g.text(170, 220, 'dg.exp.card', { a: 'middle', w: 300 });
    g.box(26, 240, 288, 30, C.gold, { a: 0.16 }); g.text(170, 255, 'dg.exp.ctrl', { a: 'middle', c: 'g' });
    for (let i = 0; i < 4; i++) g.box(26 + i * 73, 280, 67, 30, C.mute, { a: 0.14, rx: 4 });
    g.text(170, 324, 'dg.exp.dimm', { a: 'middle', c: 'm' });
    g.text(170, 344, 'dg.exp.cardLat', { a: 'middle', c: 'm', vars: { lat: fmt(d.lat, 0), bw: fmt(d.bw, 0) } });
    g.text(10, 386, 'dg.exp.pages', { w: 320 });
    g.text(10, 416, 'dg.exp.hot', { c: 'g', w: 320 }); g.text(10, 446, 'dg.exp.cold', { c: 'c', w: 320 });
    for (let i = 0; i < 32; i++) { const hot = i < 10; g.box(10 + i * 10, 476, 8, 24, hot ? C.gold : C.cyan, { solid: true, rx: 2, nostroke: true, a: hot ? 1 : 0.6 }); }
  } };
};

DG.pool = (L) => {
  const v = { lo: fmt(M.SRC.cxl.switchAdderLo, 0), hi: fmt(M.SRC.cxl.switchAdderHi, 0) };
  const segs = [[1, C.cyan], [2, C.violet], [3, C.green], [0, C.dimfill]];
  if (LW(L)) return { W: 720, H: 320, draw(g) {
    for (let i = 0; i < 4; i++) { const x = 20 + i * 175; g.box(x, 14, 150, 44, segs[i < 3 ? i : 0][1], { a: 0.14 }); g.text(x + 75, 36, 'dg.pool.host', { a: 'middle', vars: { i: i + 1 } }); g.line(x + 75, 58, 360, 110, C.mute); }
    g.box(210, 110, 300, 48, C.gold, { a: 0.16 }); g.text(360, 134, 'dg.pool.sw', { a: 'middle', c: 'g', weight: 600 });
    g.text(522, 134, 'dg.pool.swLat', { c: 'm', vars: v, w: 190, va: 'mid' });
    g.line(360, 158, 360, 196, C.mute);
    g.box(110, 196, 500, 108, C.mute, { a: 0.06 }); g.text(360, 214, 'dg.pool.dev', { a: 'middle' });
    segs.forEach(([k, col], i) => { const x = 124 + i * 120; g.box(x, 236, 112, 52, col, { a: k ? 0.18 : 0.4, dash: k ? 'none' : '4 3' }); g.text(x + 56, 262, k ? 'dg.pool.ld' : 'dg.pool.free', { a: 'middle', vars: { i: k }, w: 104, va: 'mid' }); });
  } };
  return { W: 340, H: 520, draw(g) {
    for (let i = 0; i < 4; i++) { const x = 10 + (i % 2) * 165, y = 10 + Math.floor(i / 2) * 52; g.box(x, y, 155, 40, segs[i < 3 ? i : 0][1], { a: 0.14 }); g.text(x + 77, y + 20, 'dg.pool.host', { a: 'middle', vars: { i: i + 1 } }); }
    g.line(170, 102, 170, 140, C.mute);
    g.box(10, 140, 320, 44, C.gold, { a: 0.16 }); g.text(170, 162, 'dg.pool.sw', { a: 'middle', c: 'g', weight: 600 });
    g.text(170, 206, 'dg.pool.swLat', { a: 'middle', c: 'm', vars: v, w: 320 });
    g.line(170, 222, 170, 240, C.mute);
    g.box(10, 240, 320, 262, C.mute, { a: 0.06 }); g.text(170, 260, 'dg.pool.dev', { a: 'middle' });
    segs.forEach(([k, col], i) => { const y = 280 + i * 54; g.box(26, y, 288, 44, col, { a: k ? 0.18 : 0.4, dash: k ? 'none' : '4 3' }); g.text(170, y + 22, k ? 'dg.pool.ld' : 'dg.pool.free', { a: 'middle', vars: { i: k } }); });
  } };
};

DG.bi = (L) => {
  const w = LW(L), xs = w ? [90, 250, 450, 630] : [46, 128, 212, 296], bw = w ? 140 : 78, keys = ['dg.bi.h1', 'dg.bi.h3', 'dg.bi.dev', 'dg.bi.h4'];
  const H = w ? 330 : 450, top = w ? 16 : 10, bh = w ? 38 : 58, y0 = top + bh;
  return { W: w ? 720 : 340, H, draw(g) {
    keys.forEach((k, i) => { g.box(xs[i] - bw / 2, top, bw, bh, i === 2 ? C.gold : C.cyan, { a: 0.14 }); g.text(xs[i], top + bh / 2, k, { a: 'middle', w: bw - 8, va: 'mid', c: i === 2 ? 'g' : '' }); g.line(xs[i], y0, xs[i], H - (w ? 20 : 70), C.line, { dash: '3 4' }); });
    const [h1, h3, dv, h4] = xs, Y = w ? [92, 140, 162, 204, 222, 284] : [110, 170, 192, 250, 272, 340];
    g.line(h4, Y[0], dv + 3, Y[0], C.violet, { arrow: 1 }); g.text((h4 + dv) / 2, Y[0] - 13, 'dg.bi.req', { a: 'middle', c: 'v' });
    g.line(dv, Y[1], h3 + 3, Y[1], C.red, { arrow: 1 }); g.line(dv, Y[2], h1 + 3, Y[2], C.red, { arrow: 1 }); g.text((h1 + dv) / 2, Y[1] - 13, 'dg.bi.snp', { a: 'middle', c: 'r' });
    g.line(h1, Y[3], dv - 3, Y[3], C.green, { arrow: 1 }); g.line(h3, Y[4], dv - 3, Y[4], C.green, { arrow: 1 }); g.text((h1 + dv) / 2, Y[4] + 18, 'dg.bi.rsp', { a: 'middle', c: 'n' });
    g.line(dv, Y[5], h4 - 3, Y[5], C.gold, { arrow: 1 }); g.text((h4 + dv) / 2, Y[5] - 13, 'dg.bi.data', { a: 'middle', c: 'g' });
    if (w) { g.text(dv + 10, 124, 'dg.bi.dirA', { c: 'm' }); g.text(dv + 10, Y[5] - 40, 'dg.bi.dirB', { c: 'm' }); }
    else { g.text(10, 398, 'dg.bi.dirA', { c: 'm' }); g.text(10, 426, 'dg.bi.dirB', { c: 'm' }); }
  } };
};

DG.nvl = (L) => {
  const up = { bw: fmt(M.nvPerDir(5), 0) }, out = { lo: fmt(M.nicGBps(M.SRC.nic.cx7Gbps), 0), hi: fmt(M.nicGBps(M.SRC.nic.cx8Gbps), 0) };
  const rack = (g, x, y, wd) => {
    g.box(x, y, wd, 290, C.gold, { a: 0.04 }); g.text(x + wd / 2, y + 20, 'dg.nvl.rack', { a: 'middle', weight: 600, w: wd - 16 });
    const tray = (ty) => { g.box(x + 12, ty, wd - 24, 28, C.mute, { a: 0.1 }); g.text(x + 20, ty + 14, 'dg.nvl.tray', { c: 'm' }); const n = 4, sx = x + wd - 24 - n * 30; for (let i = 0; i < n; i++) g.box(sx + i * 30, ty + 6, 22, 16, C.gold, { solid: true, rx: 3, nostroke: true }); };
    tray(y + 44); tray(y + 78);
    g.box(x + 12, y + 116, wd - 24, 40, C.cyan, { a: 0.16 }); g.text(x + wd / 2, y + 136, 'dg.nvl.sw', { a: 'middle', c: 'c' });
    tray(y + 166); tray(y + 200);
    for (const ty of [y + 106, y + 166]) for (let i = 0; i < 4; i++) { const lx = x + wd - 24 - 4 * 30 + i * 30 + 11; g.line(lx, ty === y + 106 ? y + 100 : y + 156, lx, ty === y + 106 ? y + 116 : y + 166, C.cyan, { sw: 1.2 }); }
    g.text(x + wd / 2, y + 252, 'dg.nvl.up', { a: 'middle', c: 'g', vars: up, w: wd - 16 });
  };
  if (LW(L)) return { W: 720, H: 330, draw(g) {
    rack(g, 20, 14, 340);
    g.box(400, 120, 300, 44, C.red, { a: 0.14 }); g.text(550, 142, 'dg.nvl.net', { a: 'middle', c: 'r', w: 284, va: 'mid' });
    g.line(360, 142, 398, 142, C.red, { sw: 2 }); g.text(380, 104, 'dg.nvl.nic', { a: 'middle', c: 'm' });
    g.box(400, 230, 140, 56, C.gold, { a: 0.06 }); g.text(470, 258, 'dg.nvl.more', { a: 'middle', c: 'm' }); g.box(560, 230, 140, 56, C.gold, { a: 0.06 }); g.text(630, 258, 'dg.nvl.more', { a: 'middle', c: 'm' });
    g.line(470, 164, 470, 230, C.red, { sw: 2 }); g.line(630, 164, 630, 230, C.red, { sw: 2 });
    g.text(550, 50, 'dg.nvl.out', { a: 'middle', c: 'r', vars: out, w: 290 });
    g.box(400, 300, 16, 12, C.gold, { solid: true, rx: 2, nostroke: true }); g.text(424, 306, 'dg.nvl.gpu', { c: 'm' });
  } };
  return { W: 340, H: 590, draw(g) {
    rack(g, 10, 10, 320);
    g.line(170, 300, 170, 360, C.red, { sw: 2 }); g.text(184, 330, 'dg.nvl.nic', { c: 'm' });
    g.box(10, 360, 320, 48, C.red, { a: 0.14 }); g.text(170, 384, 'dg.nvl.net', { a: 'middle', c: 'r', w: 300, va: 'mid' });
    g.line(85, 408, 85, 440, C.red, { sw: 2 }); g.line(255, 408, 255, 440, C.red, { sw: 2 });
    g.box(10, 440, 150, 50, C.gold, { a: 0.06 }); g.text(85, 465, 'dg.nvl.more', { a: 'middle', c: 'm' }); g.box(180, 440, 150, 50, C.gold, { a: 0.06 }); g.text(255, 465, 'dg.nvl.more', { a: 'middle', c: 'm' });
    g.text(10, 522, 'dg.nvl.out', { c: 'r', vars: out, w: 320 });
    g.box(10, 558, 16, 12, C.gold, { solid: true, rx: 2, nostroke: true }); g.text(34, 564, 'dg.nvl.gpu', { c: 'm' });
  } };
};

DG.ring = (L) => {
  const R = M.ringSteps(4), w = LW(L);
  const ringAt = (g, cx, cy, rx, ry, phase) => {
    const st = phase === 'rs' ? R.sends[0] : R.sends[R.N - 1], pos = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
    const full = phase === 'ag' ? R.states[R.N - 1] : null;
    for (let gI = 0; gI < 4; gI++) {
      const [x, y] = pos[gI], [x2, y2] = pos[(gI + 1) % 4], dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      g.line(x + ux * 52, y + uy * 34, x2 - ux * 52, y2 - uy * 34, phase === 'rs' ? C.gold : C.cyan, { arrow: 1, sw: 2 });
    }
    for (let gI = 0; gI < 4; gI++) {
      const [x, y] = pos[gI], send = st.sends.find(s => s.from === gI).chunk;
      g.box(x - 42, y - 26, 84, 52, C.mute, { a: 0.1 }); g.text(x, y - 11, 'dg.ring.gpu', { a: 'middle', vars: { g: gI } });
      for (let c = 0; c < 4; c++) {
        const isFull = phase === 'ag' && ((gI + 1) % 4 === c), isSend = c === send;
        g.box(x - 34 + c * 18, y + 4, 14, 12, isSend ? (phase === 'rs' ? C.gold : C.cyan) : isFull ? C.cyan : C.dimfill, { solid: isSend || isFull, rx: 2, nostroke: !isSend, sw: 1 });
      }
    }
    g.text(cx, cy + ry + 50, phase === 'rs' ? 'dg.ring.rs' : 'dg.ring.ag', { a: 'middle', c: phase === 'rs' ? 'g' : 'c', w: w ? 330 : 320 });
  };
  return w ? { W: 720, H: 300, draw(g) { ringAt(g, 180, 132, 118, 96, 'rs'); ringAt(g, 540, 132, 118, 96, 'ag'); } }
    : { W: 340, H: 620, draw(g) { ringAt(g, 170, 132, 112, 96, 'rs'); ringAt(g, 170, 438, 112, 96, 'ag'); } };
};

DG.pkg = (L) => {
  const gh = M.SRC.gh, mi = M.SRC.mi300a;
  const ghPanel = (g, x, y, wd) => {
    g.box(x, y, wd, 290, C.gold, { a: 0.04 }); g.text(x + wd / 2, y + 20, 'dg.pkg.gh', { a: 'middle', weight: 600 });
    const bw = (wd - 60) / 2, xl = x + 14, xr = x + wd - 14 - bw;
    g.box(xl, y + 50, bw, 70, C.violet, { a: 0.14 }); g.text(xl + bw / 2, y + 85, 'dg.pkg.grace', { a: 'middle', c: 'v' });
    g.box(xr, y + 50, bw, 70, C.gold, { a: 0.14 }); g.text(xr + bw / 2, y + 85, 'dg.pkg.hopper', { a: 'middle', c: 'g' });
    g.line(xl + bw, y + 85, xr, y + 85, C.cyan, { sw: 4 });
    g.text(x + wd / 2, y + 146, 'dg.pkg.c2c', { a: 'middle', c: 'c', vars: { bw: fmt(gh.c2cBidir, 0) }, w: wd - 20 });
    g.line(xl + bw / 2, y + 120, xl + bw / 2, y + 196, C.mute, { sw: 2 }); g.line(xr + bw / 2, y + 120, xr + bw / 2, y + 196, C.mute, { sw: 2 });
    g.box(xl, y + 196, bw, 54, C.mute, { a: 0.12 }); g.text(xl + bw / 2, y + 223, 'dg.pkg.lp', { a: 'middle', vars: { gb: fmt(gh.lpddrGB, 0) }, w: bw - 8, va: 'mid' });
    g.box(xr, y + 196, bw, 54, C.mute, { a: 0.12 }); g.text(xr + bw / 2, y + 223, 'dg.pkg.hbm', { a: 'middle', vars: { gb: fmt(gh.hbmGB, 0) }, w: bw - 8, va: 'mid' });
  };
  const miPanel = (g, x, y, wd) => {
    g.box(x, y, wd, 300, C.cyan, { a: 0.04 }); g.text(x + wd / 2, y + 20, 'dg.pkg.mi', { a: 'middle', weight: 600 });
    const cw = (wd - 36) / 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const bx = x + 12 + c * (cw + 6), by = y + 42 + r * 42; g.box(bx, by, cw, 36, r === 0 ? C.violet : C.gold, { a: 0.16 }); g.text(bx + cw / 2, by + 18, r === 0 ? 'dg.pkg.ccd' : 'dg.pkg.xcd', { a: 'middle', c: r === 0 ? 'v' : 'g' }); }
    g.box(x + 12, y + 174, wd - 24, 42, C.mute, { a: 0.14 }); g.text(x + wd / 2, y + 195, 'dg.pkg.base', { a: 'middle', vars: { mb: fmt(mi.icMB, 0) }, w: wd - 36, va: 'mid' });
    g.box(x + 12, y + 228, wd - 24, 56, C.cyan, { a: 0.12 }); g.text(x + wd / 2, y + 256, 'dg.pkg.shared', { a: 'middle', c: 'c', vars: { gb: fmt(mi.hbmGB, 0), tb: fmt(mi.hbmTB, 1) }, w: wd - 36, va: 'mid' });
  };
  return LW(L) ? { W: 720, H: 320, draw(g) { ghPanel(g, 14, 10, 336); miPanel(g, 370, 10, 336); } }
    : { W: 340, H: 640, draw(g) { ghPanel(g, 8, 8, 324); miPanel(g, 8, 320, 324); } };
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

/* ───────── 08 NVLink table ───────── */
function nvRows() {
  const tb = $('#nvRows'); if (!tb) return; tb.textContent = '';
  const hk = ['ch8.th.gen', 'ch8.th.arch', 'ch8.th.bidir', 'ch8.th.links', 'ch8.th.perLink', 'ch8.th.domain'];
  for (const gN of [4, 5, 6]) {
    const o = M.SRC.nvlink[gN], tr = document.createElement('tr'); if (gN === 5) tr.className = 'hi';
    [t('ch8.gen', { g: gN }), o.arch, gbps(o.gpuBidir, 0), fmt(o.links, 0), gbps(M.nvLinkPerDir(gN), 0), t('ch8.domain', { n: fmt(o.domain, 0) })].forEach((s, i) => { const td = document.createElement('td'); td.textContent = s; td.dataset.h = t(hk[i]); tr.appendChild(td); });
    tb.appendChild(tr);
  }
}

/* ───────── 01 copy or share ───────── */
(() => {
  const cv = $('#shCv'), sS = $('#shS'), S = () => Math.pow(2, +sS.value), f = () => +radioVal('shF'), Mi = () => +radioVal('shM');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), F = f(), MM = Mi(), fr = frame(w, h, [30, 16, 44, 56], M.SHARE.sizesLog[0], M.SHARE.sizesLog[1], -1, 5);
    const ly = v => Math.log10(v);
    yTicks(c, fr, [-1, 0, 1, 2, 3, 4, 5], v => fmt(Math.pow(10, v), v < 0 ? 1 : 0)); axes(c, fr, t('ch1.cv.x'), t('ch1.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [12, 16, 20, 24, 28, 30].map(e => [fr.X(e), size(Math.pow(2, e))]), fr.B + 12, w);
    const pc = [], ps = [];
    for (let e = 12; e <= 30.001; e += 0.25) { const r = M.copyShare(Math.pow(2, e), F, MM); pc.push([e, ly(r.tCopy * 1e6)]); ps.push([e, ly(r.tShare * 1e6)]); }
    const clipY = p => [p[0], Math.max(-1, Math.min(5, p[1]))];
    path(c, pc.map(clipY), fr.X, fr.Y, C.cyan, 2.4); path(c, ps.map(clipY), fr.X, fr.Y, C.gold, 2.4);
    const x = M.crossover(F, MM);
    if (x && x >= Math.pow(2, 12) && x <= Math.pow(2, 30)) { const xx = fr.X(Math.log2(x)); c.strokeStyle = C.violet; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(xx, fr.T); c.lineTo(xx, fr.B); c.stroke(); c.setLineDash([]); }
    const r = M.copyShare(S(), F, MM), e0 = Math.log2(S());
    dot(c, fr.X(e0), fr.Y(Math.min(5, ly(r.tCopy * 1e6))), C.cyan, 5); dot(c, fr.X(e0), fr.Y(Math.min(5, ly(r.tShare * 1e6))), C.gold, 5);
  } });
  function text() {
    const z = M.say.share(S(), f(), Mi()), r = z.v, xs = r.x == null ? t('u.none') : r.x >= MiB ? t('u.MiB', { v: fmt(r.x / MiB, 1) }) : t('u.KiB', { v: fmt(r.x / KiB, 0) });
    put('#shSo', size(S())); put('#shCopy', tm(r.tCopy)); put('#shShare', tm(r.tShare)); put('#shBw', gbps(r.Bshare)); put('#shX', xs);
    putHTML('#shSay', t(z.key, { S: size(S()), f: pct(f(), f() < 0.05 ? 0 : 0), tShare: tm(r.tShare), tCopy: tm(r.tCopy), M: fmt(r.M, 0), bw: gbps(r.Bshare), bdma: gbps(r.Bdma), x: xs, bound: t(r.littleBound ? 'ch1.bound.little' : 'ch1.bound.link') }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sS.addEventListener('input', go); onAll(radios('shF'), 'change', go); onAll(radios('shM'), 'change', go);
  text();
})();

/* ───────── 03 flits ───────── */
(() => {
  const cv = $('#flCv'), kind = () => radioVal('flK'), mode = () => radioVal('flM'), wid = () => +radioVal('flW');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), md = mode(), k = M.FLITBW[md][kind()], pad = 8;
    const flits = md === '68' ? (w < 500 ? 2 : 4) : 1, gap = 10, fw = (w - 2 * pad - gap * (flits - 1)) / flits, y = 24, fh = Math.min(64, h - 60);
    let n = 0;
    for (let fI = 0; fI < flits; fI++) {
      const x0 = pad + fI * (fw + gap);
      if (md === '68') {
        const F = M.SRC.cxl.flit68, u = fw / F.bytes;
        c.fillStyle = '#5a6274'; c.fillRect(x0, y, F.pid * u, fh); c.fillRect(x0 + (F.bytes - F.crc) * u, y, F.crc * u, fh);
        for (let s = 0; s < 4; s++) { const isD = Math.floor((n + 1) * k.data / k.slots) > Math.floor(n * k.data / k.slots); n++; c.fillStyle = isD ? C.gold : C.cyan; c.fillRect(x0 + (F.pid + s * 16) * u + 1, y, 16 * u - 2, fh); }
      } else {
        const u = fw / 16, usable = k.eff < 1 ? 15 : 16;
        for (let s = 0; s < 16; s++) {
          let col = '#5a6274';
          if (s < usable) { const isD = Math.floor((n + 1) * k.data / k.slots) > Math.floor(n * k.data / k.slots); n++; col = isD ? C.gold : C.cyan; }
          c.fillStyle = col; c.fillRect(x0 + s * u + 1, y, u - 2, fh);
        }
      }
      c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(x0 + 0.5, y - 0.5, fw - 1, fh + 1);
    }
    const r = M.flitBW(kind(), md, wid()), bx = pad, by = y + fh + 18, bwid = w - 2 * pad;
    c.fillStyle = C.dimfill; c.fillRect(bx, by, bwid, 10); c.fillStyle = C.gold; c.fillRect(bx, by, bwid * r.eff, 10);
  } });
  function text() {
    const z = M.say.flit(kind(), mode(), wid()), r = z.v;
    put('#flRaw', gbps(r.raw, 0)); put('#flReal', gbps(r.real, 1)); put('#flEff', pct(r.eff, 1)); put('#flDdr', fmt(r.ddr5, 1));
    putHTML('#flSay', t(z.key, { slots: fmt(r.slots, r.slots % 1 ? 1 : 0), data: fmt(r.data, 0), le: pct(r.linkEff, 1), eff: pct(r.eff, 1), real: gbps(r.real, 1), ddr: fmt(r.ddr5, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll([...radios('flK'), ...radios('flM'), ...radios('flW')], 'change', go);
  text();
})();

/* ───────── 04 protocol stepper ───────── */
(() => {
  const type = () => +radioVal('prT'), btns = [...document.querySelectorAll('.acts [data-act]')];
  let st = M.freshLines(), log = [], last = null;
  const pname = p => 'CXL.' + p;
  function text() {
    const T = type();
    put('#prSpeaks', t('ch4.speaks', { list: M.TYPES[T].map(pname).join(' · ') }));
    btns.forEach(b => { b.disabled = !M.allowed(T, b.dataset.act); });
    const cells = [['ch4.st.hX', st.hX], ['ch4.st.dX', st.dX], ['ch4.st.hY', st.hY]];
    putHTML('#prSt', cells.map(([k, s]) => `<div><b class="${s}x">${s}</b>${esc(t(k))}</div>`).join(''));
    const lg = $('#prLog');
    if (!log.length) putHTML('#prLog', `<li><i>${esc(t('ch4.log.empty'))}</i></li>`);
    else putHTML('#prLog', log.slice(-12).map(e => e.act ? `<li class="act">${esc(t('ch4.act.' + e.act))}</li>` : `<li><i>${esc(t('ch4.dir.' + e.d))}</i><b class="${e.p}">${esc(pname(e.p))}</b><span>${esc(e.name)}</span></li>`).join(''));
    if (!last) { putHTML('#prSay', t('ch4.say.start')); return; }
    const z = M.say.proto(last), need = M.NEEDS[last.act].filter(p => !M.TYPES[T].includes(p)).map(pname).join(' / ');
    putHTML('#prSay', t(z.key, { act: t('ch4.act.' + last.act), n: fmt(last.msgs.length, 0), need, gone: t(last.st.dX === 'I' ? 'ch4.gone.inval' : 'ch4.gone.shared') }));
  }
  btns.forEach(b => b.addEventListener('click', () => { const r = M.protoStep(type(), st, b.dataset.act); last = r; if (r.ok) { st = r.st; log.push({ act: r.act }); r.msgs.forEach(m => log.push(m)); } text(); }));
  $('#prReset').addEventListener('click', () => { st = M.freshLines(); log = []; last = null; text(); });
  onAll(radios('prT'), 'change', () => { st = M.freshLines(); log = []; last = null; text(); });
  reg([], { draw() {}, text }); text();
})();

/* ───────── 05 tiering ───────── */
(() => {
  const cv = $('#tiCv'), sP = $('#tiP'), p = () => +sP.value / 100, s = () => +radioVal('tiS'), dev = () => radioVal('tiD'), pl = () => radioVal('tiPl');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), S0 = s(), D = dev(), split = Math.round(h * 0.6);
    const dv = M.tierDev(D), loc = M.SRC.liu.local, yMax = Math.ceil((Math.max(dv.lat, loc.lat) + 20) / 50) * 50;
    const f1 = frame(w, split, [28, 16, 14, 56], 0, 1, 100, yMax);
    yTicks(c, f1, [100, 200, 300, 400].filter(v => v <= yMax), v => fmt(v, 0)); axes(c, f1, '', t('ch5.cv.y'));
    const hot = [], rnd = [], bw = [];
    for (let k = 0; k <= 100; k++) { const a = M.tier(k / 100, S0, D, 'hot'), b = M.tier(k / 100, S0, D, 'random'); hot.push([k / 100, a.lat]); rnd.push([k / 100, b.lat]); bw.push([k / 100, (pl() === 'hot' ? a : b).bw]); }
    path(c, rnd, f1.X, f1.Y, C.mute, 1.8, [5, 4]); path(c, hot, f1.X, f1.Y, C.gold, 2.6);
    const r = M.tier(p(), S0, D, pl()); dot(c, f1.X(r.p), f1.Y(r.lat), pl() === 'hot' ? C.gold : C.mute, 5.5);
    const bMax = Math.ceil((loc.bw + dv.bw) / 100) * 100, f2 = frame(w, h, [split + 26, 16, 40, 56], 0, 1, 0, bMax);
    yTicks(c, f2, [0, bMax / 2, bMax], v => fmt(v, 0)); axes(c, f2, t('ch5.cv.x'), t('ch5.cv.bw'));
    c.fillStyle = C.mute; spacedTicks(c, [0, 0.25, 0.5, 0.75, 1].map(v => [f2.X(v), pct(v)]), f2.B + 12, w);
    path(c, bw, f2.X, f2.Y, C.green, 2.2); dot(c, f2.X(r.p), f2.Y(r.bw), C.green, 5);
  } });
  function text() {
    const z = M.say.tier(p(), s(), dev(), pl()), r = z.v;
    put('#tiPo', pct(r.p)); put('#tiQ', pct(r.q, r.q < 0.1 ? 1 : 0)); put('#tiLat', t('u.ns', { v: fmt(r.lat, 0) })); put('#tiSlow', pct(r.slow, 0)); put('#tiBw', gbps(r.bw, 0));
    putHTML('#tiSay', t(z.key, { p: pct(r.p), q: pct(r.q, r.q < 0.1 ? 1 : 0), lat: t('u.ns', { v: fmt(r.lat, 0) }), slow: pct(r.slow, 0), bw: gbps(r.bw, 0), why: t(pl() === 'hot' ? 'ch5.why.hot' : 'ch5.why.random') }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sP.addEventListener('input', go); onAll([...radios('tiS'), ...radios('tiD'), ...radios('tiPl')], 'change', go);
  text();
})();

/* ───────── 06 pooling ───────── */
(() => {
  const cv = $('#poCv'), sN = $('#poN'), sR = $('#poR'), N = () => M.POOL.ns[+sN.value], rho = () => M.POOL.rhos[+sR.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.pool(N(), rho()), max = r.without * 1.05;
    bars(c, w, h, [[t('ch6.cv.without'), r.without, C.cyan, t('u.x', { v: fmt(r.without, 1) })], [t('ch6.cv.with'), r.withPool, C.gold, t('u.x', { v: fmt(r.withPool, 1) })]], max, 1);
  } });
  function text() {
    const z = M.say.pool(N(), rho()), r = z.v;
    put('#poNo', fmt(N(), 0)); put('#poRo', fmt(rho(), 2)); put('#poSaved', pct(r.saved, 0)); put('#poPool', fmt(r.poolSize, 1)); put('#poOwn', t('u.x', { v: fmt(r.own, 2) }));
    put('#poAdd', r.tierKey === 'none' ? t('ch6.add.none') : t(r.tierKey === 'mld' ? 'ch6.add.mld' : 'ch6.add.switch', { v: fmt(r.add, 0) }));
    putHTML('#poSay', t(z.key, { N: fmt(N(), 0), saved: pct(r.saved, 0), pool: fmt(r.poolSize, 1), add: fmt(r.add, 0), own: fmt(r.own, 2), max: fmt(M.SRC.cxl.mldMax, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); sR.addEventListener('input', go);
  text();
})();

/* ───────── 07 directory and back-invalidate ───────── */
(() => {
  const cv = $('#diCv'), H = () => +radioVal('diH'), wf = () => +radioVal('diW'), cap = () => +radioVal('diC');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rows = M.DIR.hosts.map(hh => M.fabricDir(hh, wf(), cap()));
    const max = Math.max(50, ...rows.map(r => r.bi)) * 1.08, L = 44, R = w - 70, T = 8, rh = (h - 16) / rows.length, X = v => L + (R - L) * v / max;
    rows.forEach((r, i) => {
      const y = T + i * rh + rh / 2, bh = Math.min(18, rh * 0.6), on = r.H === H();
      c.font = FONT; c.textAlign = 'right'; c.fillStyle = on ? C.gold : C.ink; c.fillText(fmt(r.H, 0), L - 10, y);
      c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
      let x = L; for (const [v, col] of [[r.biWrite, C.red], [r.biRead, C.violet], [r.biCap, C.cyan]]) { if (v > 0) { c.fillStyle = col; c.fillRect(x, y - bh / 2, X(v) - L, bh); x += X(v) - L; } }
      if (on) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L - 0.5, y - bh / 2 - 0.5, R - L + 1, bh + 1); }
      c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(fmt(r.bi, 0), R + 8, y);
    });
  } });
  function text() {
    const z = M.say.dir(H(), wf(), cap()), r = z.v;
    put('#diBi', fmt(r.bi, r.bi < 10 ? 1 : 0)); put('#diFan', fmt(r.fanout, 1)); put('#diWait', pct(r.writeBIshare, 0)); put('#diCap', fmt(r.biCap, 0));
    putHTML('#diSay', t(z.key, { H: fmt(r.H, 0), w: pct(wf(), wf() < 0.05 ? 0 : 0), bi: fmt(r.bi, 0), wait: pct(r.writeBIshare, 0), fan: fmt(r.fanout, 1), capbi: fmt(r.biCap, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll([...radios('diH'), ...radios('diW'), ...radios('diC')], 'change', go);
  text();
})();

/* ───────── 09 ring all-reduce stepper ───────── */
(() => {
  const N = () => +radioVal('rgN');
  let k = 0;
  function text() {
    const n = N(), R = M.ringSteps(n), cur = R.states[k], prev = k ? R.states[k - 1] : null, sends = k ? R.sends[k - 1].sends : [];
    const fullC = gI => { if (k < n - 1) return -1; return (gI + 1) % n; };
    let html = '<thead><tr><th></th>' + Array.from({ length: n }, (_, c) => `<th>${esc(t('ch9.chunk', { c: c + 1 }))}</th>`).join('') + '</tr></thead><tbody>';
    for (let gI = 0; gI < n; gI++) {
      html += `<tr><th>${esc(t('ch9.gpu', { g: gI }))}</th>`;
      for (let c = 0; c < n; c++) {
        const got = sends.some(s => s.to === gI && s.chunk === c), full = cur[gI][c] === R.total[c] && (k >= n - 1);
        html += `<td class="${got ? 'new' : full ? 'full' : ''}">${fmt(cur[gI][c], 0)}</td>`;
      }
      html += '</tr>';
    }
    putHTML('#rgTab', html + '</tbody>');
    const sentFrac = k / n, phase = k === 0 ? 'start' : k < n - 1 ? 'rs' : k === n - 1 ? 'rs' : k < 2 * (n - 1) ? 'ag' : 'done';
    put('#rgK', fmt(k, 0) + ' / ' + fmt(2 * (n - 1), 0)); put('#rgSent', pct(sentFrac, 0)); put('#rgPh', t('ch9.phase.' + (k === 2 * (n - 1) ? 'done' : phase)));
    const z = M.say.ring(n, k);
    putHTML('#rgSay', t(z.key, { N: fmt(n, 0), k: fmt(k < n ? k : k - (n - 1), 0), sent: pct(sentFrac, 0), total: R.total.map(v => fmt(v, 0)).join(' / '), steps: fmt(2 * (n - 1), 0) }));
    $('#rgStep').disabled = $('#rgAll').disabled = k >= 2 * (n - 1);
  }
  $('#rgStep').addEventListener('click', () => { if (k < 2 * (N() - 1)) k++; text(); });
  $('#rgAll').addEventListener('click', () => { k = 2 * (N() - 1); text(); });
  $('#rgReset').addEventListener('click', () => { k = 0; text(); });
  onAll(radios('rgN'), 'change', () => { k = 0; text(); });
  reg([], { draw() {}, text }); text();
})();

/* ───────── 09 all-reduce time ───────── */
(() => {
  const cv = $('#arCv'), P = () => +radioVal('arP'), N = () => +radioVal('arN');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rows = M.FABRIC_KEYS.map(k => M.allreduce(P(), N(), k)), max = Math.max(...rows.map(r => r.t)) * 1.02;
    const col = k => k.startsWith('nv') ? C.gold : k === 'pcie5' ? C.cyan : C.red;
    bars(c, w, h, rows.map(r => [t('ch9.fab.' + r.fab), r.t, col(r.fab), tm(r.t)]), max, 2);
  } });
  function text() {
    const z = M.say.ar(P(), N(), 'nv5'), r = z.v, net = M.allreduce(P(), N(), 'ib400');
    put('#arS', t('u.GB', { v: fmt(r.S / 1e9, 0) })); put('#arPer', t('u.GB', { v: fmt(r.perGpu / 1e9, 1) })); put('#arNv', tm(r.t)); put('#arNet', tm(net.t));
    putHTML('#arSay', t(z.key, { params: t('ch9.p.' + radioVal('arP')), N: fmt(N(), 0), per: t('u.GB', { v: fmt(r.perGpu / 1e9, 1) }), nv5: tm(r.t), net: tm(net.t), ratio: fmt(net.t / r.t, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll([...radios('arP'), ...radios('arN')], 'change', go);
  text();
})();

/* ───────── 10 hierarchical ───────── */
(() => {
  const cv = $('#hiCv'), T = () => +radioVal('hiT'), G = () => +radioVal('hiG'), nic = () => +radioVal('hiNic'), P = () => +radioVal('hiP');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rs = M.HIER.domains.map(g => M.hier(P(), T(), g, nic())), flat = rs[0].flat, max = Math.max(flat, ...rs.map(r => r.t)) * 1.02;
    const labs = [...rs.map(r => t('ch10.cv.hierG', { g: fmt(r.G, 0) })), t('ch10.cv.flat')];
    const lf = labelFont(c, labs, Math.min(170, w * 0.36)), L = lf.w, R = w - 10, rh = (h - 20) / 3, X = v => L + (R - L) * v / max;
    labs.forEach((lab, i) => {
      const y = 10 + i * rh + rh / 2, bh = Math.min(22, rh * 0.5), on = i < 2 && rs[i].G === G();
      c.font = lf.font; c.textAlign = 'right'; c.fillStyle = on ? C.gold : C.ink; const ls = lf.lines.get(lab) || [lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
      c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
      let txt;
      if (i < 2) { const r = rs[i]; c.fillStyle = C.gold; c.fillRect(L, y - bh / 2, X(r.tUp) - L, bh); c.fillStyle = C.red; c.fillRect(X(r.tUp), y - bh / 2, X(r.t) - X(r.tUp), bh); txt = tm(r.t); if (on) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L - 0.5, y - bh / 2 - 0.5, R - L + 1, bh + 1); } }
      else { c.fillStyle = C.red; c.fillRect(L, y - bh / 2, X(flat) - L, bh); txt = tm(flat); }
      const xe = X(i < 2 ? rs[i].t : flat), tw = c.measureText(txt).width;
      if (xe + 6 + tw <= R) { c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xe + 6, y); } else { c.fillStyle = C.bg; c.textAlign = 'right'; c.fillText(txt, xe - 6, y); }
    });
  } });
  function text() {
    const z = M.say.hier(P(), T(), G(), nic()), r = z.v;
    put('#hiTot', tm(r.t)); put('#hiUp', tm(r.tUp)); put('#hiOut', tm(r.tOut)); put('#hiFlat', tm(r.flat));
    putHTML('#hiSay', t(z.key, { N: fmt(r.Ntot, 0), R: fmt(r.R, 0), G: fmt(r.G, 0), t: tm(r.t), up: tm(r.tUp), out: tm(r.tOut), flat: tm(r.flat), x: fmt(r.speedup, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll([...radios('hiT'), ...radios('hiG'), ...radios('hiNic'), ...radios('hiP')], 'change', go);
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
