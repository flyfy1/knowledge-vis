/* How USB drives talk: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.UsbModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
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
const mbps = (x, d) => t('u.MBps', { v: fmt(x, d == null ? (x < 100 ? 1 : 0) : d) });
const us = x => t('u.us', { v: fmt(x, x < 10 ? 1 : 0) });
function size(bytes) { return bytes >= 1048576 ? t('u.MiB', { v: fmt(bytes / 1048576, bytes % 1048576 ? 1 : 0) }) : t('u.KiB', { v: fmt(bytes / 1024, bytes % 1024 ? 1 : 0) }); }
const sec = s => s >= 60 ? t('u.min', { v: fmt(s / 60, 1) }) : t('u.s', { v: fmt(s, 0) });
// numbers quoted in the prose, computed from the models and formatted for the current language
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
function hline(c, f, y, col, dash) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash || [5, 4]); c.beginPath(); c.moveTo(f.L, y); c.lineTo(f.R, y); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
// bar labels: a label too wide for the label column is split at the space nearest its middle (review 2026-11-14:
// English stage names at 320 px ran off the canvas), then the whole column shrinks to at most 70 % if still needed
function splitLabel(c, s, cap) {
  if (c.measureText(s).width + 14 <= cap || s.indexOf(' ') < 0) return [s];
  let best = [s], bw = Infinity;
  for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(c.measureText(a).width, c.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function labelFont(c, labels, cap) { c.font = FONT; const lines = new Map(); let lw = 0; for (const s of labels) { const ls = splitLabel(c, s, cap); lines.set(s, ls); for (const l of ls) lw = Math.max(lw, c.measureText(l).width); } const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap), lines, lh: 13 * k }; }
// horizontal bars: rows of [label, value, colour]; value text sits after the bar, or inside it when there is no room
function bars(c, w, h, rows, max, hiIdx) {
  const labs = rows.map(r => r[0]), lf = labelFont(c, labs, Math.min(170, w * 0.36));
  const L = lf.w, R = w - 10, T = 10, B = h - 10, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.min(v, max) / max;
  rows.forEach(([lab, v, col, txt], i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(22, rh * 0.56);
    c.font = lf.font; c.textAlign = 'right'; c.fillStyle = i === hiIdx ? C.gold : C.ink; const ls = lf.lines.get(lab) || [lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
    c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
    if (v > 0) { c.fillStyle = col; c.fillRect(L, y - bh / 2, Math.max(1.5, X(v) - L), bh); }
    if (txt) {
      let tw = c.measureText(txt).width; const xe = X(Math.max(v, 0));
      if (xe - L < tw + 10 && xe + 6 + tw > R) { const k = Math.max(0.6, (R - xe - 6) / tw); c.font = FONT.replace('12px', (12 * k).toFixed(1) + 'px'); tw = c.measureText(txt).width; }
      if (xe + 6 + tw <= R + 0.5) { c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xe + 6, y); }
      else { c.fillStyle = C.bg; c.textAlign = 'right'; c.fillText(txt, Math.max(L + tw + 4, xe - 6), y); }
    }
  });
}
const LINKS = { hs: M.SPEC.usb2.maxBps / 1e6, g1x1: M.SPEC.usb3.g1Eff, g2x1: M.SPEC.usb3.g2Eff, g2x2: M.MODES.g2x2.eff };
const DRIVE = M.SPEC.nvmeSeq;

/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, labels from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, prose column ≥ 600 px) and 'n' (viewBox 340 wide). Text is 14 units, so it
   renders at ≥ 11.5 px in either layout at its narrowest. A label with a width limit wraps onto more lines.
   Palette, the same as the models: the computer grey, the bridge chip cyan, the drive violet, the USB link green,
   data gold, overhead (tokens, wrappers, encoding, waiting) red. Numbers drawn come from M.dgVals(). */
const NS = 'http://www.w3.org/2000/svg';
const FS = 14, LH = 18;
function S(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
let DV = {};
function mk(svg) {
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; S('rect', { x, y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: o.solid ? col : tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    poly(pts, col, o) { o = o || {}; S('polyline', { points: pts.map(p => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${col.slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; S('circle', { cx, cy, r, fill: o.solid ? col : tint(col, 0.14), stroke: col, 'stroke-width': o.sw || 1.6 }, svg); },
    // text: key (or {raw}), position, options: a = start|middle|end, c = colour class, w = wrap width, vars (default: the diagram numbers)
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, o.vars || DV);
      const e = S('text', { x, y, 'font-size': o.fs || FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: (o.c || '') + (o.mono ? ' mono' : '') }, svg);
      e.textContent = s; if (o.w) { e.dataset.w = o.w; e.dataset.va = o.va || 'top'; } if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    },
    swatch(x, y, col) { g.box(x, y - 6, 12, 12, col, { solid: true, rx: 3 }); }
  };
  return g;
}
const cls = col => (col === C.gold ? 'g' : col === C.cyan ? 'c' : col === C.green ? 'n' : col === C.violet ? 'v' : col === C.red ? 'r' : 'm');
// a box with a centred, wrapped label in the box's colour
function lbox(g, x, y, w, h, col, key, o) {
  o = o || {}; g.box(x, y, w, h, col, { a: o.a, dash: o.dash, rx: o.rx, solid: o.solid });
  const e = g.text(x + w / 2, y + h / 2, key, { a: 'middle', c: o.c || (o.solid ? 'k' : cls(col)), w: w - 14, va: 'mid', mono: o.mono });
  e.dataset.in = [x, y, w, h].join(',');   // tests/browser.cjs: the wrapped label must stay inside its box
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
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:_]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; let lines = [], cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}
const DG = {};
// ch1: two storage devices back to back; schematic
DG.stack = (L) => {
  if (L === 'w') return { W: 720, H: 320, draw(g) {
    g.text(110, 16, 'dg.stack.pc', { a: 'middle', c: 'm', weight: 600 }); g.text(370, 16, 'dg.stack.br', { a: 'middle', c: 'c', weight: 600 }); g.text(620, 16, 'dg.stack.dr', { a: 'middle', c: 'v', weight: 600 });
    g.box(10, 30, 200, 220, C.mute, { a: 0.04, sw: 1 }); g.box(280, 30, 180, 220, C.cyan, { a: 0.05, sw: 1 }); g.box(530, 30, 180, 220, C.violet, { a: 0.05, sw: 1 });
    lbox(g, 20, 42, 180, 36, C.mute, 'dg.stack.app'); lbox(g, 20, 88, 180, 36, C.mute, 'dg.stack.sd'); lbox(g, 20, 134, 180, 62, C.mute, 'dg.stack.ms'); lbox(g, 20, 202, 180, 36, C.mute, 'dg.stack.hc');
    lbox(g, 286, 174, 168, 70, C.cyan, 'dg.stack.dev'); lbox(g, 286, 114, 168, 50, C.cyan, 'dg.stack.xl'); lbox(g, 286, 36, 168, 70, C.cyan, 'dg.stack.host');
    lbox(g, 536, 36, 168, 70, C.violet, 'dg.stack.ctl'); lbox(g, 536, 114, 168, 50, C.violet, 'dg.stack.nand');
    g.line(200, 220, 286, 220, C.green, { sw: 3 }); g.text(243, 236, 'dg.stack.usb', { a: 'middle', c: 'n' });
    g.line(370, 173, 370, 165, C.cyan, { arrow: 1 }); g.line(370, 113, 370, 107, C.cyan, { arrow: 1 });
    g.line(454, 70, 536, 70, C.cyan, { sw: 3 }); g.text(495, 86, 'dg.stack.link', { a: 'middle', c: 'c', w: 66 });
    g.text(10, 272, 'dg.stack.sees1', { c: 'm', w: 200 }); g.text(280, 272, 'dg.stack.both', { c: 'c', w: 180 }); g.text(530, 272, 'dg.stack.sees2', { c: 'm', w: 180 });
  } };
  return { W: 340, H: 740, draw(g) {
    g.text(10, 14, 'dg.stack.pc', { c: 'm', weight: 600 });
    g.box(10, 26, 320, 182, C.mute, { a: 0.04, sw: 1 });
    lbox(g, 20, 36, 300, 34, C.mute, 'dg.stack.app'); lbox(g, 20, 76, 300, 34, C.mute, 'dg.stack.sd'); lbox(g, 20, 116, 300, 46, C.mute, 'dg.stack.ms'); lbox(g, 20, 168, 300, 32, C.mute, 'dg.stack.hc');
    g.line(170, 208, 170, 262, C.green, { sw: 3 }); g.text(182, 235, 'dg.stack.usb', { c: 'n' });
    g.text(10, 276, 'dg.stack.br', { c: 'c', weight: 600 });
    g.box(10, 288, 320, 170, C.cyan, { a: 0.05, sw: 1 });
    lbox(g, 20, 298, 300, 44, C.cyan, 'dg.stack.dev'); lbox(g, 20, 352, 300, 44, C.cyan, 'dg.stack.xl'); lbox(g, 20, 406, 300, 44, C.cyan, 'dg.stack.host');
    g.line(170, 458, 170, 512, C.cyan, { sw: 3 }); g.text(182, 485, 'dg.stack.link', { c: 'c' });
    g.text(10, 526, 'dg.stack.dr', { c: 'v', weight: 600 });
    g.box(10, 538, 320, 108, C.violet, { a: 0.05, sw: 1 });
    lbox(g, 20, 548, 300, 44, C.violet, 'dg.stack.ctl'); lbox(g, 20, 598, 300, 40, C.violet, 'dg.stack.nand');
    g.text(10, 664, 'dg.stack.sees1', { c: 'm', w: 320 }); g.text(10, 712, 'dg.stack.sees2', { c: 'm', w: 320 });
  } };
};
// ch2: one bulk IN transaction (schematic) and one microframe packed with 512-byte transactions (to scale)
DG.mframe = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 290 : 410;
  return { W, H, draw(g) {
    const x0 = wide ? 70 : 60, yh = 44, yd = 110;
    g.text(10, yh, 'dg.mframe.host', { c: 'm' }); g.text(10, yd, 'dg.mframe.dev', { c: 'm' });
    g.line(x0, yh, W - 10, yh, C.line, { sw: 1 }); g.line(x0, yd, W - 10, yd, C.line, { sw: 1 });
    const T = wide ? [90, 150, 170, 330, 350, 410] : [70, 110, 120, 220, 230, 270];
    g.line(T[0], yh, T[1], yd - 2, C.red, { arrow: 1, sw: 2 }); g.text(T[0], yh - 20, 'dg.mframe.tok', { c: 'r' });
    g.line(T[2], yd, T[3], yh + 2, C.gold, { arrow: 1, sw: 3 }); g.text(T[2], yd + 20, 'dg.mframe.data', { c: 'g' });
    g.line(T[4], yh, T[5], yd - 2, C.red, { arrow: 1, sw: 2 }); g.text(T[4], yh - 20, 'dg.mframe.ack', { c: 'r' });
    if (wide) {
      g.line(500, yh, 560, yd - 2, C.red, { arrow: 1, sw: 2, dash: '5 4' }); g.text(500, yh - 20, 'dg.mframe.tok', { c: 'r' });
      g.line(580, yd, 640, yh + 2, C.red, { arrow: 1, sw: 2, dash: '5 4' }); g.text(580, yd + 20, 'dg.mframe.nak', { c: 'r' });
    } else g.text(10, 158, 'dg.mframe.nakn', { c: 'r', w: 320 });
    const by = wide ? 190 : 232, bh = 28, bx = 10, bw = W - 20, B = M.USB2.perMicroframe(), p = M.SPEC.usb2.maxPacket, oh = M.SPEC.usb2.overhead, r = M.USB2.pack(p), X = v => bx + bw * v / B;
    let x = 0;
    for (let i = 0; i < r.n; i++) { g.box(X(x), by, X(x + p) - X(x), bh, C.gold, { solid: true, rx: 0, nostroke: true }); x += p; g.box(X(x), by, X(x + oh) - X(x), bh, C.red, { solid: true, rx: 0, nostroke: true }); x += oh; }
    g.box(X(x), by, X(B) - X(x), bh, C.dimfill, { solid: true, rx: 0, nostroke: true });
    g.box(bx, by, bw, bh, C.mute, { a: 0, rx: 0, sw: 1 });
    g.text(bx, by - 16, 'dg.mframe.mf', { c: 'm' });
    if (wide) g.text(W - 10, by - 16, 'dg.mframe.fill', { a: 'end' }); else g.text(bx, by + bh + 18, 'dg.mframe.fill');
    const ly = wide ? by + bh + 24 : by + bh + 46;
    const leg = [[C.gold, 'dg.mframe.lgd', 'g'], [C.red, 'dg.mframe.lgo', 'r'], [C.dimfill, 'dg.mframe.lgl', 'm']];
    leg.forEach(([col, k, c], i) => { const lx = wide ? (i === 1 ? 110 : 10) : 10, yy = wide ? ly + (i === 2 ? 24 : 0) : ly + [0, 24, 66][i]; g.swatch(lx, yy, col); g.text(lx + 18, yy, k, { c, w: wide ? 560 : 300 }); });
  } };
};
// ch3: a full SuperSpeed Gen 1 data packet (schematic widths) and the two encodings (to scale)
DG.pkt = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 296 : 436;
  const F = [['hdr', C.red, 'dg.pkt.hdr'], ['dpps', C.red, 'dg.pkt.start'], ['max', C.gold, 'dg.pkt.data'], ['crc', C.red, 'dg.pkt.crc'], ['dppe', C.red, 'dg.pkt.end']];
  return { W, H, draw(g) {
    g.text(10, 14, 'dg.pkt.title', { c: 'm', weight: 600 });
    let ey;
    if (wide) {
      const ws = [120, 66, 330, 80, 66]; let x = 25;
      F.forEach(([f, col, k], i) => { g.box(x, 34, ws[i], 44, col, { rx: 3 }); g.text(x + ws[i] / 2, 56, k, { a: 'middle', c: cls(col) }); g.text(x + ws[i] / 2, 94, 'dg.pkt.bytes', { a: 'middle', c: 'm', vars: { n: fmt(DVn[f], 0) } }); x += ws[i]; });
      g.line(147, 110, 687, 110, C.mute, { sw: 1 }); g.line(147, 104, 147, 110, C.mute, { sw: 1 }); g.line(687, 104, 687, 110, C.mute, { sw: 1 }); g.text(417, 126, 'dg.pkt.dpp', { a: 'middle', c: 'm' });
      ey = 160;
    } else {
      const hs = [30, 24, 56, 24, 24]; let y = 28;
      F.forEach(([f, col, k], i) => { g.box(10, y, 320, hs[i], col, { rx: 3 }); g.text(20, y + hs[i] / 2, k, { c: cls(col) }); g.text(320, y + hs[i] / 2, 'dg.pkt.bytes', { a: 'end', c: 'm', vars: { n: fmt(DVn[f], 0) } }); y += hs[i] + (i === 0 ? 10 : 0); });
      g.text(10, y + 16, 'dg.pkt.note', { c: 'm', w: 320 });
      ey = y + 74;
    }
    g.text(10, ey - 4, 'dg.pkt.enc', { c: 'm', weight: 600 });
    const rows = [['g1x1', 'dg.pkt.enc8'], ['g2x1', 'dg.pkt.enc128']];
    rows.forEach(([m, k], i) => {
      const [a, b] = M.MODES[m].enc, bx = wide ? 220 : 10, bw = wide ? 490 : 320, y = wide ? ey + 22 + i * 40 : ey + 46 + i * 64;
      if (wide) g.text(10, y + 10, k, { w: 200 }); else g.text(10, y - 14, k);
      if (b <= 10) { for (let j = 0; j < b; j++) g.box(bx + j * bw / b + 1, y, bw / b - 2, 20, j < a ? C.gold : C.red, { solid: true, rx: 2 }); }
      else { g.box(bx, y, bw * a / b, 20, C.gold, { solid: true, rx: 2 }); g.box(bx + bw * a / b + 1, y, bw * (b - a) / b - 1, 20, C.red, { solid: true, rx: 2 }); }
    });
    const ly = wide ? ey + 112 : ey + 154;
    g.swatch(10, ly, C.gold); g.text(28, ly, 'dg.pkt.lgd', { c: 'g' }); g.swatch(wide ? 220 : 150, ly, C.red); g.text(wide ? 238 : 168, ly, 'dg.pkt.lgo', { c: 'r' });
  } };
};
// ch4: Bulk-Only, one command at a time; schematic timeline
DG.bot = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 290 : 300;
  return { W, H, draw(g) {
    const yo = 60, yi = wide ? 180 : 140, x0 = wide ? 130 : 50, bh = 26;
    if (wide) { g.text(10, yo, 'dg.bot.out', { c: 'm', w: 112, va: 'mid' }); g.text(10, yi, 'dg.bot.in', { c: 'm', w: 112, va: 'mid' }); }
    else { g.text(10, yo, 'dg.bot.o', { c: 'm', mono: 1 }); g.text(10, yi, 'dg.bot.i', { c: 'm', mono: 1 }); }
    g.line(x0, yo, W - 10, yo, C.line, { sw: 1 }); g.line(x0, yi, W - 10, yi, C.line, { sw: 1 });
    const P = wide ? { cbw: [140, 40], wait: [180, 340], data: [340, 130], csw: [470, 30], cbw2: [520, 40], wait2: [560, 640], data2: [640, 70] }
      : { cbw: [54, 30], wait: [84, 130], data: [130, 90], csw: [220, 24], cbw2: [258, 30], wait2: [288, 318], data2: [318, 12] };
    const blk = (x, w, y, col) => g.box(x, y - bh / 2, w, bh, col, { solid: true, rx: 3 });
    blk(P.cbw[0], P.cbw[1], yo, C.red); blk(P.data[0], P.data[1], yi, C.gold); blk(P.csw[0], P.csw[1], yi, C.red); blk(P.cbw2[0], P.cbw2[1], yo, C.red); blk(P.data2[0], P.data2[1], yi, C.gold);
    g.text(P.data[0] + P.data[1] / 2, yi, 'dg.bot.data', { a: 'middle', c: 'k' });
    for (const [a, b] of [P.wait, P.wait2]) { g.box(a, yo + bh / 2 + 6, b - a, yi - yo - bh - 12, C.red, { a: 0.08, dash: '4 4', sw: 1 }); }
    g.text((P.wait[0] + P.wait[1]) / 2, (yo + yi) / 2, wide ? 'dg.bot.wait' : 'dg.bot.waitS', { a: 'middle', c: 'r', w: wide ? 146 : 60, va: 'mid' });
    g.text(P.cbw[0], yo - 28, 'dg.bot.cbw', { c: 'r' }); g.text(P.csw[0] + P.csw[1] / 2, yi + 28, 'dg.bot.csw', { a: 'middle', c: 'r' });
    g.text(P.cbw2[0], yo - 28, 'dg.bot.next', { c: 'r' });
    g.line(P.csw[0] + P.csw[1], yi - bh / 2, P.cbw2[0] + 4, yo + bh / 2 + 2, C.mute, { arrow: 1, dash: '3 3' });
    g.text(10, wide ? 236 : 196, 'dg.bot.one', { c: 'm', w: W - 20 });
  } };
};
// ch5: UASP, four pipes and tagged commands in flight (a read over USB 3); schematic
DG.uas = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 372;
  return { W, H, draw(g) {
    const lanes = ['cmd', 'st', 'din', 'dout'], x0 = wide ? 180 : 10, bh = 26;
    const ly = i => wide ? 84 + i * 56 : 46 + i * 60;
    lanes.forEach((k, i) => {
      if (wide) g.text(10, ly(i), 'dg.uas.' + k, { c: 'm', w: 160, va: 'mid' }); else g.text(10, ly(i) - 26, 'dg.uas.' + k, { c: 'm' });
      if (k !== 'dout') g.line(x0, ly(i), W - 10, ly(i), C.line, { sw: 1 });
      else { const ix = wide ? 445 : 170, iw = 75; g.line(x0, ly(i), ix - iw, ly(i), C.line, { sw: 1 }); g.line(ix + iw, ly(i), W - 10, ly(i), C.line, { sw: 1 }); }   // a gap for the idle label
    });
    const tags = ['1', '2', '3', '4'], order = ['2', '1', '3', '4'];
    const cw = wide ? 34 : 28, cg = wide ? 6 : 4, dx = wide ? 300 : 100, dw = wide ? 74 : 44, sw = wide ? 30 : 26;
    tags.forEach((tg, i) => { const x = x0 + 4 + i * (cw + cg); g.box(x, ly(0) - bh / 2, cw, bh, C.red, { solid: true, rx: 3 }); g.text(x + cw / 2, ly(0), { raw: tg }, { a: 'middle', c: 'k', mono: 1 }); });
    order.forEach((tg, i) => {
      const x = dx + i * dw; g.box(x, ly(2) - bh / 2, dw - 2, bh, C.gold, { solid: true, rx: 3 }); g.text(x + (dw - 2) / 2, ly(2), { raw: tg }, { a: 'middle', c: 'k', mono: 1 });
      g.box(x + dw - 2, ly(1) - bh / 2, sw, bh, C.red, { solid: true, rx: 3 }); g.text(x + dw - 2 + sw / 2, ly(1), { raw: tg }, { a: 'middle', c: 'k', mono: 1 });
    });
    g.text(wide ? 445 : 170, ly(3), 'dg.uas.idle', { a: 'middle', c: 'm' });
    if (wide) g.text(10, 16, 'dg.uas.tag', { c: 'm', w: 700 }); else g.text(10, 278, 'dg.uas.tag', { c: 'm', w: 320 });
  } };
};
// ch6: the copy as a chain of pipes, each as thick as its MB/s (a 20 Gb/s box with PCIe 3.0 ×2 downstream; to scale)
DG.chain = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 440;
  return { W, H, draw(g) {
    const K = 80 / DVn.drive, h = v => v * K;
    if (wide) {
      const yc = 110;
      lbox(g, 10, yc - 50, 110, 100, C.violet, 'dg.chain.drv');
      g.box(120, yc - h(DVn.drive) / 2, 50, h(DVn.drive), C.violet, { solid: true, rx: 0, nostroke: true });
      g.box(170, yc - h(DVn.bridge) / 2, 130, h(DVn.bridge), C.cyan, { solid: true, rx: 0, nostroke: true });
      lbox(g, 300, yc - 40, 130, 80, C.cyan, 'dg.chain.br');
      g.box(430, yc - h(DVn.usb) / 2, 170, h(DVn.usb), C.green, { solid: true, rx: 0, nostroke: true });
      lbox(g, 600, yc - 40, 110, 80, C.mute, 'dg.chain.pc');
      g.text(145, 34, 'dg.chain.vd', { a: 'middle', c: 'v' }); g.text(235, 150, 'dg.chain.vb', { a: 'middle', c: 'c', w: 128 }); g.text(515, 150, 'dg.chain.vu', { a: 'middle', c: 'n', w: 168 });
      g.text(10, 212, 'dg.chain.x', { c: 'g', w: 700 });
    } else {
      const xc = 110;
      lbox(g, xc - 90, 10, 180, 50, C.violet, 'dg.chain.drv');
      g.box(xc - h(DVn.drive) / 2, 60, h(DVn.drive), 40, C.violet, { solid: true, rx: 0, nostroke: true });
      g.box(xc - h(DVn.bridge) / 2, 100, h(DVn.bridge), 80, C.cyan, { solid: true, rx: 0, nostroke: true });
      lbox(g, xc - 90, 180, 180, 60, C.cyan, 'dg.chain.br');
      g.box(xc - h(DVn.usb) / 2, 240, h(DVn.usb), 80, C.green, { solid: true, rx: 0, nostroke: true });
      lbox(g, xc - 90, 320, 180, 44, C.mute, 'dg.chain.pc');
      g.text(xc + 48, 80, 'dg.chain.vd', { c: 'v', w: 330 - xc - 48, va: 'mid' }); g.text(xc + 20, 140, 'dg.chain.vb', { c: 'c', w: 330 - xc - 20, va: 'mid' }); g.text(xc + 22, 280, 'dg.chain.vu', { c: 'n', w: 330 - xc - 22, va: 'mid' });
      g.text(10, 390, 'dg.chain.x', { c: 'g', w: 320 });
    }
  } };
};
// ch7: where the heat goes (a cross-section) and the lumped model it becomes; schematic
DG.heat = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 540;
  return { W, H, draw(g) {
    // cross-section
    const cw = wide ? 340 : 300;
    g.text(20, 20, 'dg.heat.air', { c: 'm' });
    g.box(20, 76, cw, 110, C.mute, { a: 0.05, sw: 3, rx: 14 });
    lbox(g, 36, 116, wide ? 200 : 170, 44, C.violet, 'dg.heat.drv');
    lbox(g, wide ? 256 : 220, 116, wide ? 88 : 86, 44, C.cyan, 'dg.heat.chip');
    const ax = wide ? [90, 326] : [48, 298];
    ax.forEach(x => g.line(x, 112, x, 40, C.red, { arrow: 1, sw: 2.2 }));
    g.text(ax[0] + 12, 56, 'dg.heat.p', { c: 'r', w: ax[1] - ax[0] - 22, va: 'mid' });   // wraps rather than running into the chip's arrow
    g.text(20, 206, 'dg.heat.case', { c: 'm', w: cw });
    // lumped circuit
    const ox = wide ? 400 : 0, oy = wide ? 0 : 236, nx = ox + 110, ny = oy + 120, rx = ox + 250;
    g.line(ox + 20, ny, nx - 10, ny, C.red, { arrow: 1, sw: 2.2 }); g.text(ox + 20, ny + 20, 'dg.heat.src', { c: 'r' });
    g.circle(nx, ny, 8, C.ink, { solid: true }); g.text(nx, ny - 26, 'dg.heat.t', { a: 'middle' });
    g.line(nx, ny + 8, nx, ny + 40, C.ink); g.line(nx - 18, ny + 40, nx + 18, ny + 40, C.violet, { sw: 3 }); g.line(nx - 18, ny + 49, nx + 18, ny + 49, C.violet, { sw: 3 }); g.line(nx, ny + 49, nx, ny + 64, C.ink);
    g.line(nx - 14, ny + 64, nx + 14, ny + 64, C.mute); g.line(nx - 9, ny + 69, nx + 9, ny + 69, C.mute); g.line(nx - 4, ny + 74, nx + 4, ny + 74, C.mute);
    g.text(nx + 26, ny + 45, 'dg.heat.c', { c: 'v' });
    const zz = [[nx + 8, ny]]; for (let i = 0; i < 8; i++) zz.push([nx + 30 + i * 12, ny + (i % 2 ? 9 : -9)]); zz.push([rx - 8, ny]);
    g.line(nx + 8, ny, nx + 24, ny, C.ink); g.poly(zz.slice(1), C.gold, { sw: 2 }); g.line(nx + 30 + 7 * 12, ny, rx - 8, ny, C.ink);
    g.circle(rx, ny, 8, C.mute); g.text(rx, ny - 26, 'dg.heat.ta', { a: 'middle', c: 'm' });
    g.text((nx + rx) / 2, ny - 50, 'dg.heat.r', { a: 'middle', c: 'g' });
    g.text(ox + 10, oy + 214, 'dg.heat.rv', { c: 'g', w: wide ? 300 : 320 });
    g.text(ox + 10, oy + 262, 'dg.heat.eq', { c: 'm', w: wide ? 300 : 320 });
  } };
};
// ch8: a USB bridge enclosure next to a PCIe-tunnel enclosure; schematic
DG.tunnel = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, cw = wide ? 340 : 160, H = wide ? 380 : 536;
  return { W, H, draw(g) {
    const cols = [['a', 10], ['b', wide ? 370 : 175]];
    const bh = wide ? 44 : 62, ty = 14;
    for (const [c, x] of cols) {
      g.text(x, ty, 'dg.tunnel.' + c + 't', { c: 'm', weight: 600, w: cw });
      const bx = x + (wide ? 10 : 0), bw = cw - (wide ? 20 : 4);
      let y = wide ? 36 : 56;
      lbox(g, bx, y, bw, bh, C.mute, 'dg.tunnel.' + c + '1'); y += bh + 10;
      lbox(g, bx, y, bw, bh, C.mute, 'dg.tunnel.' + c + '2'); y += bh;
      const lk = wide ? 56 : 74;
      g.line(bx + 18, y, bx + 18, y + lk, C.green, { sw: 3 }); g.text(bx + 30, y + lk / 2, 'dg.tunnel.' + c + 'l', { c: 'n', w: bw - 30, va: 'mid' }); y += lk;
      lbox(g, bx, y, bw, bh, C.cyan, 'dg.tunnel.' + c + '3'); y += bh;
      g.line(bx + 18, y, bx + 18, y + 36, C.cyan, { sw: 3 }); g.text(bx + 30, y + 18, 'dg.tunnel.pcie', { c: 'c' }); y += 36;
      lbox(g, bx, y, bw, wide ? 40 : 44, C.violet, 'dg.tunnel.drv'); y += (wide ? 40 : 44) + 22;
      g.text(bx, y, 'dg.tunnel.' + c + 'n', { c: c === 'a' ? 'm' : 'n', w: bw });
    }
  } };
};
// ch9: a flash drive (one controller, one or two dies) next to an NVMe SSD (many dies on several channels); schematic
DG.stick = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 500;
  return { W, H, draw(g) {
    const ax = 0, ay = 0, bx = wide ? 380 : 0, by = wide ? 0 : 254;
    g.text(ax + 10, ay + 14, 'dg.stick.at', { c: 'm', weight: 600, w: 320 });
    lbox(g, ax + 10, ay + 62, 52, 36, C.green, 'dg.stick.usb');
    g.line(ax + 62, ay + 80, ax + 84, ay + 80, C.green, { sw: 3 });
    lbox(g, ax + 84, ay + 52, 100, 56, C.cyan, 'dg.stick.ctl');
    g.line(ax + 184, ay + 66, ax + 214, ay + 60, C.violet, { sw: 2 }); g.line(ax + 184, ay + 94, ax + 214, ay + 100, C.violet, { sw: 2, dash: '4 3' });
    lbox(g, ax + 214, ay + 44, 110, 32, C.violet, 'dg.stick.die'); lbox(g, ax + 214, ay + 84, 110, 32, C.violet, 'dg.stick.die2', { dash: '5 4' });
    g.text(ax + 214, ay + 136, 'dg.stick.per', { c: 'v', w: 116 });
    g.text(ax + 10, ay + 200, 'dg.stick.bus', { c: 'n', w: 320 });
    g.text(bx + 10, by + 14, 'dg.stick.bt', { c: 'm', weight: 600, w: 320 });
    lbox(g, bx + 10, by + 50, 80, 126, C.cyan, 'dg.stick.ctl2');
    for (let r = 0; r < 4; r++) { const y = by + 58 + r * 30; g.line(bx + 90, y + 9, bx + 110, y + 9, C.violet, { sw: 2 }); for (let i = 0; i < 8; i++) g.box(bx + 112 + i * 27, y, 22, 18, C.violet, { a: 0.3, rx: 2, sw: 1 }); }
    g.text(bx + 10, by + 200, 'dg.stick.many', { c: 'v', w: 320 });
  } };
};
let dgLayout = new WeakMap(), DVn = {};
function renderDiagrams(force) {
  const raw = M.dgVals(); DVn = {}; DV = {};
  for (const [k, [v, d]] of Object.entries(raw)) { DVn[k] = v; DV[k] = fmt(v, d); }
  DV.bot = M.SPEC.msco.bbb.toString(16).toUpperCase() + 'h'; DV.uas = M.SPEC.msco.uas.toString(16).toUpperCase() + 'h';
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

/* ───────── 02 USB 2.0 microframe ───────── */
(() => {
  const cv = $('#mfCv'), sP = $('#mfP');
  const pay = () => Math.pow(2, +sP.value);
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), p = pay(), r = M.USB2.pack(p), B = M.USB2.perMicroframe(), L = 10, R = w - 10, y0 = h * 0.38, bh = 30, X = v => L + (R - L) * v / B;
      let x = 0;
      for (let i = 0; i < r.n; i++) { c.fillStyle = C.gold; c.fillRect(X(x), y0, Math.max(0.6, X(x + p) - X(x)), bh); x += p; c.fillStyle = C.red; c.fillRect(X(x), y0, Math.max(0.6, X(x + 55) - X(x)), bh); x += 55; }
      c.fillStyle = C.dimfill; c.fillRect(X(x), y0, X(B) - X(x), bh);
      c.strokeStyle = C.line; c.strokeRect(L, y0, R - L, bh);
      c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(t('ch2.cv.n', { n: fmt(r.n, 0) }), L, y0 - 14);
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch2.cv.x'), R, y0 + bh + 18);
    }
  });
  function text() {
    const p = pay(), z = M.say.usb2(p), v = z.v;
    put('#mfPo', t('u.B', { v: fmt(p, 0) }));
    put('#mfN', fmt(v.n, 0)); put('#mfU', t('u.B', { v: fmt(v.useful, 0) })); put('#mfB', mbps(v.bps / 1e6, 1)); put('#mfE', pct(v.eff, 1));
    putHTML('#mfSay', t(z.key, { p: fmt(p, 0), n: fmt(v.n, 0), useful: fmt(v.useful, 0), left: fmt(v.remaining, 0), bw: mbps(v.bps / 1e6, 1), eff: pct(v.eff, 1) }));
  }
  sim.text = text;
  sP.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 03 label → wire ───────── */
(() => {
  const cv = $('#lbCv');
  const id = () => radioVal('lbL'), mode = () => M.LABELS.find(x => x[0] === id())[1];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), m = mode(), L = M.LINE, line = L.lineGbps(m) * 1000 / 8, raw = L.rawMBps(m), fr = L.framedMBps(m), sp = L.specMBps(m);
      const na = t('ch3.bar.na');
      const rows = [[t('ch3.bar.line'), line, C.mute, mbps(line, 0)], [t('ch3.bar.enc'), raw, C.cyan, mbps(raw, 0)],
        [t('ch3.bar.pkt'), fr || 0, C.violet, fr ? mbps(fr, 0) : na], [t('ch3.bar.spec'), sp || 0, C.green, sp ? mbps(sp, 0) : na]];
      bars(c, w, h, rows, line * 1.02, -1);
    }
  });
  function text() {
    const z = M.say.label(id()), v = z.v;
    put('#lbMode', t('ch3.mode.' + v.mode)); put('#lbLine', t('u.Gbps', { v: fmt(v.line, v.line < 1 || v.line % 1 ? 2 : 0) }));
    put('#lbRaw', mbps(v.raw, 0)); put('#lbSpec', v.spec ? mbps(v.spec, v.spec < 100 ? 1 : 0) : t('u.none'));
    putHTML('#lbSay', t(z.key, { mode: t('ch3.modefmt', { name: t('ch3.mode.' + v.mode), enc: t('ch3.enc.' + v.mode) }), line: t('u.Gbps', { v: fmt(v.line, v.line % 1 ? 2 : 0) }), raw: mbps(v.raw, 0), framed: v.framed ? mbps(v.framed, 0) : '', spec: v.spec ? mbps(v.spec, v.spec < 100 ? 1 : 0) : '', market: v.market == null ? '' : fmt(v.market, 0) }));
  }
  sim.text = text;
  onAll(radios('lbL'), 'change', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 04a CBW / CSW bytes ───────── */
(() => {
  const sL = $('#cwL'), W = M.WRAP, TAG = 0x2A;
  function text() {
    let op = radioVal('cwOp'); const blocks = +radioVal('cwN'), lba = Math.round(Math.pow(2, +sL.value)) - 1;
    const over = op === 'read10' && lba > W.maxLba('read10');
    if (over) op = 'read16';
    const cb = W.cbw(TAG, lba, blocks, op), hx = W.hex(cb.bytes), cs = W.hex(W.csw(TAG, 0, 0));
    put('#cwLo', fmt(lba, 0));
    const n = '\n', seg = (a, b, cls, k) => `<span class="${cls}">${hx.slice(a, b).join(' ')}</span>  <span class="m">${t(k)}</span>` + n;
    let s = `<span class="m">${t('ch4.hex.cbw')}</span>` + n;
    s += seg(0, 4, 'g', 'ch4.hex.sig') + seg(4, 8, 'c', 'ch4.hex.tag') + seg(8, 12, 'v', 'ch4.hex.len') + seg(12, 13, '', 'ch4.hex.flags') + seg(13, 14, '', 'ch4.hex.lun') + seg(14, 15, '', 'ch4.hex.cblen') + seg(15, 31, 'r', 'ch4.hex.cdb');
    s += n + `<span class="m">${t('ch4.hex.data', { len: fmt(cb.len, 0) })}</span>` + n + n;
    s += `<span class="m">${t('ch4.hex.csw')}</span>` + n;
    s += `<span class="g">${cs.slice(0, 4).join(' ')}</span>  <span class="m">${t('ch4.hex.sig2')}</span>` + n + `<span class="c">${cs.slice(4, 8).join(' ')}</span>  <span class="m">${t('ch4.hex.tag')}</span>` + n +
      `<span class="v">${cs.slice(8, 12).join(' ')}</span>  <span class="m">${t('ch4.hex.res')}</span>` + n + `<span class="n">${cs[12]}</span>  <span class="m">${t('ch4.hex.st')}</span>`;
    putHTML('#cwHex', s);
    putHTML('#cwSay', over ? t('ch4.say.over') : t('ch4.say.fit', { op: t('ch4.op.' + op), lba: fmt(lba, 0), blocks: fmt(blocks, 0), len: fmt(cb.len, 0) }));
  }
  const s = reg([], { draw() {}, text });
  sL.addEventListener('input', text); onAll(radios('cwOp'), 'change', text); onAll(radios('cwN'), 'change', text);
  text();
})();

/* ───────── 04b and 05: throughput against block size ───────── */
function curvePlot(c, w, h, link, series, Smark) {
  const max = link * 1.12, f = frame(w, h, [26, 14, 36, 56], 12, 22, 0, max);
  const step = max > 1500 ? 500 : max > 600 ? 250 : max > 200 ? 100 : 10, ys = []; for (let v = 0; v <= max; v += step) ys.push(v);
  yTicks(c, f, ys, v => fmt(v, 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
  c.fillStyle = C.mute; spacedTicks(c, [12, 14, 16, 18, 20, 22].map(e => [f.X(e), size(Math.pow(2, e))]), f.B + 11, w);
  hline(c, f, f.Y(link), C.red);
  for (const s of series) { const pts = []; for (let e = 12; e <= 22.001; e += 0.1) pts.push([e, s.fn(Math.pow(2, e))]); path(c, pts, f.X, f.Y, s.col, s.lw); dot(c, f.X(Smark), f.Y(s.fn(Math.pow(2, Smark))), s.col, 5); }
}
(() => {
  const cv = $('#boCv'), sS = $('#boS'), sT = $('#boT');
  const link = () => LINKS[radioVal('boK')];
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), L = link(), tc = +sT.value; curvePlot(c, w, h, L, [{ fn: S => M.Q.bot(S, L, DRIVE, { tCmd: tc }).X, col: C.gold, lw: 2.6 }], +sS.value); } });
  function text() {
    const S = Math.round(Math.pow(2, +sS.value)), L = link(), tc = +sT.value, z = M.say.bot(S, L, DRIVE, tc), v = z.v;
    put('#boSo', size(S)); put('#boTo', us(tc));
    put('#boX', mbps(v.X)); put('#boI', t('u.iops', { v: fmt(v.iops, 0) })); put('#boU', pct(v.share)); put('#boW', us(v.wait));
    putHTML('#boSay', t(z.key, { size: size(S), tData: us(v.tData), wait: us(v.wait), X: mbps(v.X), share: pct(v.share) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sS.addEventListener('input', go); sT.addEventListener('input', go); onAll(radios('boK'), 'change', go);
  text();
})();
(() => {
  const cv = $('#uaCv'), sS = $('#uaS');
  const link = () => LINKS[radioVal('uaK')], N = () => +radioVal('uaN');
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), L = link(), n = N(); curvePlot(c, w, h, L, [{ fn: S => M.Q.bot(S, L, DRIVE).X, col: C.mute, lw: 1.8 }, { fn: S => M.Q.uas(S, L, DRIVE, n).X, col: C.gold, lw: 2.8 }], +sS.value); } });
  function text() {
    const S = Math.round(Math.pow(2, +sS.value)), L = link(), n = N(), z = M.say.uas(S, L, DRIVE, n), v = z.v;
    put('#uaSo', size(S));
    put('#uaB', mbps(v.bot)); put('#uaU', mbps(v.X)); put('#uaG', t('u.x', { v: fmt(v.gain, 2) })); put('#uaKn', fmt(Math.ceil(v.knee - 1e-9), 0));
    putHTML('#uaSay', t(z.key, { n: fmt(n, 0), X: mbps(v.X), gain: fmt(v.gain, 1), knee: fmt(Math.ceil(v.knee - 1e-9), 0), iops: fmt(v.iops, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sS.addEventListener('input', go); onAll(radios('uaK'), 'change', go); onAll(radios('uaN'), 'change', go);
  text();
})();

/* ───────── 06 the chain ───────── */
const STAGE_COL = { drive: C.violet, bridge: C.cyan, usb: C.green, tunnel: C.green };
function chainBars(c, w, h, stages, X, neck, fits) {
  const rows = stages.map(([k, v]) => [t('ch6.st.' + k), v, STAGE_COL[k], mbps(v, 0)]);
  rows.push([t('ch6.st.final'), fits ? X : 0, C.gold, fits ? mbps(X, 0) : t('ch6.cv.nofit')]);
  bars(c, w, h, rows, 7600, stages.findIndex(s => s[0] === neck));
}
(() => {
  const cv = $('#chCv');
  const opts = () => ({ drive: radioVal('chD'), bridge: radioVal('chB'), box: radioVal('chX'), host: radioVal('chH'), proto: radioVal('chP') });
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), r = M.CHAIN.usb(opts()); chainBars(c, w, h, r.stages, r.X, r.neck, r.fits); } });
  function text() {
    const o = opts(), r = M.CHAIN.usb(o), z = M.say.chain(o), v = z.v;
    put('#chR', r.fits ? mbps(r.X, 0) : t('u.none')); put('#chN', r.fits ? t('ch6.st.' + r.neck) : t('u.none')); put('#chM', t('ch3.mode.' + r.mode)); put('#chS', r.fits ? pct(r.X / M.CHAIN.drive(o.drive)) : t('u.none'));
    putHTML('#chSay', t(z.key, { X: mbps(v.X, 0), cap: mbps(v.cap, 0), mode: t('ch3.mode.' + v.mode), share: pct(r.X / M.CHAIN.drive(o.drive)) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  ['chD', 'chB', 'chX', 'chH', 'chP'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── 07 heat ───────── */
(() => {
  const cv = $('#htCv'), sA = $('#htA'), bPlay = $('#htPlay'), bReset = $('#htReset'), H = M.HEAT;
  let run = null, prog = 1, playing = false;
  const key = () => radioVal('htX') + radioVal('htS') + sA.value;
  function compute() { const k = key(); if (!run || run.k !== k) { const rate = H.rate(radioVal('htX')); run = Object.assign(H.sim(rate, H.Rbox[radioVal('htS')], +sA.value), { k, rate }); } return run; }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = compute(), D = H.dur, mid = h * 0.54;
      const fT = frame(w, mid, [24, 14, 22, 50], 0, D, 0, 130), fR = frame(w, h, [mid + 26, 14, 34, 50], 0, D, 0, 7500);
      yTicks(c, fT, [0, 40, 80, 120], v => fmt(v, 0)); axes(c, fT, '', t('ch7.cv.t'));
      hline(c, fT, fT.Y(H.thr), C.red, [4, 4]);
      c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(t('ch7.cv.thr', { v: fmt(H.thr, 0) }), fT.R, fT.Y(H.thr) - 9);
      yTicks(c, fR, [0, 2500, 5000, 7500], v => fmt(v, 0)); axes(c, fR, t('ch7.cv.x'), t('ch7.cv.r'));
      c.fillStyle = C.mute; spacedTicks(c, [0, 3, 6, 9, 12, 15].map(m => [fR.X(m * 60), fmt(m, 0)]), fR.B + 11, w);
      const upto = prog * D, pts = r.tr.filter(p => p[0] <= upto + 1e-9);
      if (pts.length > 1) { path(c, pts.map(p => [p[0], p[1]]), fT.X, fT.Y, C.red, 2.2); path(c, pts.map(p => [p[0], p[2]]), fR.X, fR.Y, C.gold, 2); const l = pts[pts.length - 1]; dot(c, fT.X(l[0]), fT.Y(l[1]), C.red); dot(c, fR.X(l[0]), fR.Y(l[2]), C.gold); }
    },
    step(dt) { if (playing) { prog = Math.min(1, prog + dt / 30); if (prog >= 1) setPlay(false); this.draw(); } else if (this.dirty) { this.draw(); this.dirty = false; } }
  });
  function setPlay(p) { playing = p && !reduce; bPlay.setAttribute('aria-pressed', String(playing)); bPlay.textContent = t(playing ? 'ch7.btn.pause' : 'ch7.btn.play'); }
  function text() {
    const r = compute(), z = M.say.heat(radioVal('htX'), radioVal('htS'), +sA.value), v = z.v;
    put('#htAo', t('u.C', { v: fmt(+sA.value, 0) }));
    put('#htT', t('u.C', { v: fmt(v.Tinf, 0) })); put('#htF', v.tFirst == null ? t('ch7.never') : sec(v.tFirst)); put('#htV', mbps(v.avg, 0)); put('#htL', pct(v.slow));
    putHTML('#htSay', t(z.key, { Tinf: t('u.C', { v: fmt(v.Tinf, 0) }), thr: t('u.C', { v: fmt(v.thr, 0) }), rate: mbps(v.rate, 0), tFirst: v.tFirst == null ? '' : sec(v.tFirst), avg: mbps(v.avg, 0), slow: pct(v.slow) }));
    bPlay.textContent = t(playing ? 'ch7.btn.pause' : 'ch7.btn.play');
  }
  sim.text = text;
  const go = () => { prog = 1; setPlay(false); sim.dirty = true; text(); };
  onAll(radios('htX'), 'change', go); onAll(radios('htS'), 'change', go); sA.addEventListener('input', go);
  bPlay.addEventListener('click', () => { if (reduce) { prog = 1; sim.dirty = true; return; } if (!playing && prog >= 1) prog = 0; setPlay(!playing); sim.dirty = true; });
  bReset.addEventListener('click', () => { prog = reduce ? 1 : 0; setPlay(false); sim.dirty = true; });
  if (reduce) bPlay.disabled = true;
  text();
})();

/* ───────── 08 PCIe tunnel ───────── */
(() => {
  const cv = $('#tnCv'), sE = $('#tnE');
  const host = () => radioVal('tnH');
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), r = M.CHAIN.tunnel({ host: host(), eta: +sE.value }); chainBars(c, w, h, r.stages, r.X, r.neck, true); } });
  function text() {
    const hh = host(), eta = +sE.value, r = M.CHAIN.tunnel({ host: hh, eta }), z = M.say.tunnel(hh), F = M.FRONTIER;
    put('#tnEo', fmt(eta, 2));
    put('#tnX', mbps(r.X, 0)); put('#tnN', t('ch6.st.' + r.neck));
    put('#tnR', hh === 'tb5' ? t('u.MBps', { v: fmt(F.tb5Reported[0], 0) + '–' + fmt(F.tb5Reported[1], 0) }) : hh === 'tb4' ? t('u.MBps', { v: fmt(F.tb34Reported, 0) }) : t('ch8.rep.none'));
    putHTML('#tnSay', t(z.key, { X: mbps(r.X, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sE.addEventListener('input', go); onAll(radios('tnH'), 'change', go);
  text();
})();

/* ───────── 09 flash drive / card ───────── */
(() => {
  const cv = $('#skCv'), sW = $('#skW');
  const st = () => M.STICK.write(+radioVal('skD'), +sW.value, radioVal('skB'));
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), r = st(); bars(c, w, h, [[t('ch9.st.flash'), r.flash, C.violet, mbps(r.flash, 0)], [t('ch9.st.bus'), r.bus, C.cyan, mbps(r.bus, 0)]], 1000, r.neck === 'flash' ? 0 : 1); } });
  function text() {
    const r = st(), z = M.say.stick(+radioVal('skD'), +sW.value, radioVal('skB')), v = z.v;
    put('#skWo', mbps(+sW.value, 0));
    put('#skX', mbps(r.X, 0)); put('#skF', mbps(r.flash, 0)); put('#skU', mbps(r.bus, 0)); put('#skN', fmt(r.diesToFill, 1));
    putHTML('#skSay', t(z.key, { X: mbps(v.X, 0), flash: mbps(v.flash, 0), bus: mbps(v.bus, 0), need: fmt(v.need, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); onAll(radios('skD'), 'change', go); onAll(radios('skB'), 'change', go);
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
