/* How the OS talks to hardware: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js.
   The canvas, chart and SVG helpers follow how-a-computer-boots/app.js. */
(() => {
'use strict';
const M = window.OsHwModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
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
const us = (x, d) => t('u.us', { v: fmt(x, d == null ? (x < 10 ? 2 : x < 100 ? 1 : 0) : d) });
const ns = (x, d) => t('u.ns', { v: fmt(x, d == null ? 0 : d) });
// a duration given in µs, shown in the unit that keeps it short
const dur = x => x >= 1000 ? t('u.ms', { v: fmt(x / 1000, x >= 10000 ? 1 : 2) }) : x >= 1 ? us(x) : ns(x * 1000);
const cyc = x => t('u.cyc', { v: fmt(x, 0) });
const rateStr = r => r >= 1e6 ? t('u.mpps', { v: fmt(r / 1e6, 2) }) : r >= 1e3 ? t('u.kpps', { v: fmt(r / 1e3, 0) }) : t('u.pps', { v: fmt(r, 0) });
let PROSE = null, PV = {};
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : (M.fmtKind(v, d) || fmt(v, d)); return o; }
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
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; const yw = c.measureText(yLab).width, f0 = c.font; if (f.L + 6 + yw > f.R) c.font = FONT.replace('12px', (12 * Math.max(0.7, (f.R - f.L - 6) / yw)).toFixed(1) + 'px'); c.fillText(yLab, f.L + 6, f.T - 12); c.font = f0; }
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
// horizontal bars: rows of [label, value, colour, text]; `X` maps a value to a fraction of the bar width (linear or log)
function bars(c, w, h, rows, frac, hiIdx) {
  const labs = rows.map(r => r[0]), lf = labelFont(c, labs, Math.min(190, w * 0.4));
  const L = lf.w, R = w - 10, T = 10, B = h - 10, rh = (B - T) / rows.length, X = v => L + (R - L) * Math.max(0, Math.min(1, frac(v)));
  rows.forEach(([lab, v, col, txt], i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(22, rh * 0.5);
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
   renders at ≥ 11.7 px in either layout at its narrowest. A label with a width limit wraps onto more lines.
   Colours: applications cyan, the kernel gold, devices green, CPU hardware (MMU, APIC, IOMMU) violet, failure red. */
const NS = 'http://www.w3.org/2000/svg';
const FS = 14, LH = 18;
function S(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function mk(svg) {
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; S('rect', { x, y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: o.solid ? col : tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; S('circle', { cx, cy, r, fill: o.solid ? col : tint(col, 0.14), stroke: col, 'stroke-width': o.sw || 1.6 }, svg); },
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, Object.assign({}, PV, o.vars));
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
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:_&>=←→]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; let lines = [], cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim() && !/^[\uff0c\u3001\u3002\uff1a\uff1b\uff09\u300d,.)]/.test(tk)) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}
const DG = {};
function lbox(g, x, y, w, h, col, key, o) {
  o = o || {}; g.box(x, y, w, h, col, { a: o.a, dash: o.dash, rx: o.rx });
  g.text(x + w / 2, y + h / 2, key, { a: 'middle', c: o.c, vars: o.vars, w: w - 14, va: 'mid', mono: o.mono, fs: o.fs });
}
const cls = col => (col === C.gold ? 'g' : col === C.cyan ? 'c' : col === C.green ? 'n' : col === C.violet ? 'v' : col === C.red ? 'r' : 'm');
// a vertical chain of boxes [key, colour, height] with arrows between them
function chain(g, x, y, w, items, gap, o) {
  o = o || {}; let yy = y; const pos = [];
  items.forEach(([k, col, h], i) => { lbox(g, x, yy, w, h, col, k, { c: cls(col), dash: o.dash && o.dash.includes(i) ? '6 5' : null }); pos.push([yy, h]); if (i < items.length - 1) g.line(x + w / 2, yy + h + 2, x + w / 2, yy + h + gap - 3, C.mute, { arrow: 1 }); yy += h + gap; });
  return pos;
}

// ch1: x86 rings and Arm exception levels
DG.rings = (L) => {
  if (L === 'w') return { W: 720, H: 300, draw(g) {
    g.text(20, 18, 'dg.rings.x86', { c: 'm' }); g.text(420, 18, 'dg.rings.arm', { c: 'm' });
    lbox(g, 20, 36, 220, 50, C.cyan, 'dg.rings.r3', { c: 'c' });
    lbox(g, 20, 96, 220, 40, C.mute, 'dg.rings.r12', { c: 'm', dash: '6 5' });
    lbox(g, 20, 146, 220, 50, C.gold, 'dg.rings.r0', { c: 'g' });
    g.line(256, 62, 256, 168, C.gold, { arrow: 1 }); g.line(270, 168, 270, 62, C.cyan, { arrow: 1 });
    g.text(282, 92, 'dg.rings.down', { c: 'g', mono: true }); g.text(282, 140, 'dg.rings.up', { c: 'c', mono: true });
    lbox(g, 420, 36, 280, 46, C.cyan, 'dg.rings.el0', { c: 'c' });
    lbox(g, 420, 90, 280, 46, C.gold, 'dg.rings.el1', { c: 'g' });
    lbox(g, 420, 144, 280, 42, C.violet, 'dg.rings.el2', { c: 'v' });
    lbox(g, 420, 194, 280, 42, C.violet, 'dg.rings.el3', { c: 'v' });
    g.line(408, 60, 408, 110, C.gold, { arrow: 1 });
    g.text(20, 270, 'dg.rings.wall', { c: 'r', w: 680 });
  } };
  return { W: 340, H: 480, draw(g) {
    g.text(10, 14, 'dg.rings.x86', { c: 'm' });
    lbox(g, 10, 30, 250, 44, C.cyan, 'dg.rings.r3', { c: 'c' });
    lbox(g, 10, 82, 250, 36, C.mute, 'dg.rings.r12', { c: 'm', dash: '6 5' });
    lbox(g, 10, 126, 250, 44, C.gold, 'dg.rings.r0', { c: 'g' });
    g.line(282, 52, 282, 146, C.gold, { arrow: 1 }); g.line(300, 146, 300, 52, C.cyan, { arrow: 1 });
    g.text(10, 190, 'dg.rings.down', { c: 'g', mono: true }); g.text(330, 190, 'dg.rings.up', { c: 'c', mono: true, a: 'end' });
    g.text(10, 224, 'dg.rings.arm', { c: 'm' });
    lbox(g, 10, 240, 320, 40, C.cyan, 'dg.rings.el0', { c: 'c' });
    lbox(g, 10, 286, 320, 40, C.gold, 'dg.rings.el1', { c: 'g' });
    lbox(g, 10, 332, 320, 38, C.violet, 'dg.rings.el2', { c: 'v' });
    lbox(g, 10, 376, 320, 38, C.violet, 'dg.rings.el3', { c: 'v' });
    g.text(10, 432, 'dg.rings.wall', { c: 'r', w: 320 });
  } };
};

// ch2: one read() system call on x86-64
DG.sys = (L) => {
  if (L === 'w') return { W: 720, H: 320, draw(g) {
    g.text(20, 16, 'dg.sys.user', { c: 'c' }); g.text(420, 16, 'dg.sys.kern', { c: 'g' });
    g.line(360, 8, 360, 312, C.line, { dash: '4 5' });
    lbox(g, 40, 36, 270, 66, C.cyan, 'dg.sys.s1', { c: 'c', mono: true }); g.badge(30, 36, 1, C.cyan);
    lbox(g, 420, 36, 290, 66, C.violet, 'dg.sys.s2', { c: 'v', mono: true }); g.badge(410, 36, 2, C.violet);
    g.line(312, 69, 416, 69, C.cyan, { arrow: 1 });
    lbox(g, 420, 120, 290, 44, C.gold, 'dg.sys.s3', { c: 'g' }); g.badge(410, 120, 3, C.gold);
    lbox(g, 420, 180, 290, 44, C.gold, 'dg.sys.s4', { c: 'g', mono: true }); g.badge(410, 180, 4, C.gold);
    lbox(g, 420, 240, 290, 44, C.gold, 'dg.sys.s5', { c: 'g', mono: true }); g.badge(410, 240, 5, C.gold);
    [[102, 118], [164, 178], [224, 238]].forEach(([a, b]) => g.line(565, a + 1, 565, b - 1, C.mute, { arrow: 1 }));
    lbox(g, 40, 228, 270, 66, C.cyan, 'dg.sys.s6', { c: 'c', mono: true }); g.badge(30, 228, 6, C.cyan);
    g.line(416, 262, 314, 262, C.gold, { arrow: 1 });
  } };
  return { W: 340, H: 430, draw(g) {
    const items = [['dg.sys.s1', C.cyan, 58], ['dg.sys.s2', C.violet, 76], ['dg.sys.s3', C.gold, 44], ['dg.sys.s4', C.gold, 44], ['dg.sys.s5', C.gold, 40], ['dg.sys.s6', C.cyan, 58]];
    const pos = chain(g, 26, 8, 304, items, 20);
    pos.forEach(([y], i) => g.badge(18, y + 4, i + 1, items[i][1]));
  } };
};

// ch4: the physical address map and the separate port space (schematic)
DG.map = (L) => {
  const boxes = [['dg.map.high', C.cyan, 56, '6 5'], ['dg.map.flash', C.green, 36], ['dg.map.lapic', C.violet, 46], ['dg.map.ioapic', C.violet, 34], ['dg.map.bars', C.green, 60], ['dg.map.low', C.cyan, 70]];
  const col = (g, x, y, w) => { let yy = y; const ys = []; boxes.forEach(([k, c, h, d]) => { lbox(g, x, yy, w, h, c, k, { c: cls(c), dash: d }); ys.push(yy); yy += h; }); return { ys, end: yy }; };
  const ports = (g, x, y, w) => {
    g.box(x, y, w, 150, C.mute, { a: 0.08 }); g.text(x + 12, y + 18, 'dg.map.ports', { c: 'm', w: w - 24 });
    ['dg.map.p60', 'dg.map.p3f8', 'dg.map.pcf8', 'dg.map.p1f7'].forEach((k, i) => g.text(x + 12, y + 50 + i * 24, k, { mono: true, w: w - 24 }));
  };
  if (L === 'w') return { W: 720, H: 360, draw(g) {
    const { ys, end } = col(g, 150, 14, 260);
    g.text(140, ys[1], 'dg.map.g4', { a: 'end', c: 'm' }); g.text(140, end, 'dg.map.zero', { a: 'end', c: 'm' });
    g.line(424, ys[1] + 2, 424, ys[5] - 2, C.green, { sw: 1.4 }); g.line(418, ys[1] + 2, 424, ys[1] + 2, C.green, { sw: 1.4 }); g.line(418, ys[5] - 2, 424, ys[5] - 2, C.green, { sw: 1.4 });
    g.text(436, ys[1] + 18, 'dg.map.uc', { c: 'n', w: 270 });
    ports(g, 450, 190, 260);
  } };
  return { W: 340, H: 560, draw(g) {
    const { ys, end } = col(g, 64, 10, 266);
    g.text(56, ys[1], 'dg.map.g4', { a: 'end', c: 'm' }); g.text(56, end, 'dg.map.zero', { a: 'end', c: 'm' });
    g.text(10, end + 32, 'dg.map.uc', { c: 'n', w: 320 });
    ports(g, 10, end + 70, 320);
  } };
};

// ch5: the interrupt path
DG.irq = (L) => {
  const items = [['dg.irq.dev', C.green], ['dg.irq.msi', C.green], ['dg.irq.rc', C.violet], ['dg.irq.apic', C.violet], ['dg.irq.idt', C.gold], ['dg.irq.top', C.gold], ['dg.irq.eoi', C.gold], ['dg.irq.bottom', C.gold], ['dg.irq.wake', C.cyan]];
  if (L === 'w') return { W: 720, H: 300, draw(g) {
    const xs = [20, 255, 490], ys = [20, 120, 220], bw = 210, bh = 62;
    const cell = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1], [0, 2], [1, 2], [2, 2]];
    items.forEach(([k, col], i) => { const [cx, cy] = cell[i]; lbox(g, xs[cx], ys[cy], bw, bh, col, k, { c: cls(col) }); g.badge(xs[cx] + 4, ys[cy] + 4, i + 1, col); });
    for (let i = 0; i < 8; i++) {
      const [ax, ay] = cell[i], [bx, by] = cell[i + 1];
      if (ay === by) { const y = ys[ay] + bh / 2; if (bx > ax) g.line(xs[ax] + bw + 2, y, xs[bx] - 3, y, C.mute, { arrow: 1 }); else g.line(xs[ax] - 2, y, xs[bx] + bw + 3, y, C.mute, { arrow: 1 }); }
      else g.line(xs[ax] + bw / 2, ys[ay] + bh + 2, xs[ax] + bw / 2, ys[by] - 3, C.mute, { arrow: 1 });
    }
  } };
  return { W: 340, H: 530, draw(g) {
    const pos = chain(g, 26, 6, 304, items.map(([k, c]) => [k, c, 42]), 16);
    pos.forEach(([y], i) => g.badge(18, y + 4, i + 1, items[i][1]));
  } };
};

// ch7: a receive descriptor ring of eight slots
DG.ring = (L) => {
  const full = [2, 3, 4, 5], cons = 2, prod = 6;
  const slots = (g, x0, y, sw, sh) => { for (let i = 0; i < 8; i++) { const on = full.includes(i); g.box(x0 + i * sw + 2, y, sw - 4, sh, on ? C.green : C.mute, { a: on ? 0.42 : 0.06, rx: 5 }); g.text(x0 + i * sw + sw / 2, y + sh / 2, { raw: String(i) }, { a: 'middle', mono: true, c: on ? '' : 'm' }); } };
  if (L === 'w') return { W: 720, H: 270, draw(g) {
    g.box(40, 12, 18, 14, C.green, { a: 0.42, rx: 3 }); g.text(66, 19, 'dg.ring.full'); g.box(200, 12, 18, 14, C.mute, { a: 0.06, rx: 3 }); g.text(226, 19, 'dg.ring.empty', { c: 'm' }); g.text(400, 19, 'dg.ring.buf', { c: 'm' });
    const x0 = 80, sw = 70, y = 116;
    g.text(x0 + cons * sw + sw / 2, 56, 'dg.ring.cons', { a: 'middle', c: 'g', w: 250, va: 'mid' });
    g.text(x0 + prod * sw + sw / 2, 56, 'dg.ring.prod', { a: 'middle', c: 'n', w: 250, va: 'mid' });
    g.line(x0 + cons * sw + sw / 2, 84, x0 + cons * sw + sw / 2, y - 4, C.gold, { arrow: 1 });
    g.line(x0 + prod * sw + sw / 2, 84, x0 + prod * sw + sw / 2, y - 4, C.green, { arrow: 1 });
    slots(g, x0, y, sw, 52);
    const yb = y + 52, xr = x0 + 8 * sw;
    g.line(xr, yb - 26, xr + 22, yb - 26, C.mute); g.line(xr + 22, yb - 26, xr + 22, yb + 22, C.mute); g.line(xr + 22, yb + 22, x0 - 22, yb + 22, C.mute); g.line(x0 - 22, yb + 22, x0 - 22, yb - 26, C.mute); g.line(x0 - 22, yb - 26, x0 - 2, yb - 26, C.mute, { arrow: 1 });
    g.text(360, 230, 'dg.ring.rule', { a: 'middle', c: 'm', w: 680, mono: true });
  } };
  return { W: 340, H: 330, draw(g) {
    g.box(10, 8, 16, 12, C.green, { a: 0.42, rx: 3 }); g.text(32, 14, 'dg.ring.full'); g.box(170, 8, 16, 12, C.mute, { a: 0.06, rx: 3 }); g.text(192, 14, 'dg.ring.empty', { c: 'm' });
    g.text(10, 38, 'dg.ring.buf', { c: 'm', w: 320 });
    const x0 = 18, sw = 38, y = 124;
    g.text(10, 74, 'dg.ring.cons', { c: 'g', w: 320, va: 'mid' });
    g.line(x0 + cons * sw + sw / 2, 96, x0 + cons * sw + sw / 2, y - 4, C.gold, { arrow: 1 });
    slots(g, x0, y, sw, 44);
    g.line(x0 + prod * sw + sw / 2, 196, x0 + prod * sw + sw / 2, y + 48, C.green, { arrow: 1 });
    g.text(10, 218, 'dg.ring.prod', { c: 'n', w: 320, va: 'mid' });
    g.text(10, 262, 'dg.ring.rule', { c: 'm', w: 320, mono: true });
  } };
};

// ch8: two ways to memory: CPU → MMU, device → IOMMU
DG.iommu = (L) => {
  if (L === 'w') return { W: 720, H: 290, draw(g) {
    lbox(g, 20, 40, 190, 60, C.cyan, 'dg.iommu.cpu', { c: 'c' }); lbox(g, 260, 40, 210, 60, C.violet, 'dg.iommu.mmu', { c: 'v' });
    lbox(g, 20, 160, 190, 60, C.green, 'dg.iommu.dev', { c: 'n' }); lbox(g, 260, 160, 210, 60, C.violet, 'dg.iommu.iommu', { c: 'v' });
    g.box(530, 24, 170, 206, C.gold, { a: 0.08 }); g.text(615, 46, 'dg.iommu.ram', { a: 'middle', c: 'g' });
    lbox(g, 548, 150, 134, 56, C.green, 'dg.iommu.ok', { c: 'n' });
    g.line(212, 70, 256, 70, C.cyan, { arrow: 1 }); g.line(472, 70, 526, 70, C.cyan, { arrow: 1 });
    g.line(212, 190, 256, 190, C.green, { arrow: 1 }); g.line(472, 180, 544, 178, C.green, { arrow: 1 });
    g.line(365, 222, 365, 244, C.red, { arrow: 1, dash: '4 4' }); g.text(365, 262, 'dg.iommu.block', { a: 'middle', c: 'r' });
  } };
  return { W: 340, H: 400, draw(g) {
    lbox(g, 10, 8, 200, 44, C.cyan, 'dg.iommu.cpu', { c: 'c' }); lbox(g, 10, 70, 200, 50, C.violet, 'dg.iommu.mmu', { c: 'v' });
    g.line(110, 54, 110, 66, C.cyan, { arrow: 1 }); g.line(110, 122, 110, 140, C.cyan, { arrow: 1 });
    g.box(10, 144, 320, 92, C.gold, { a: 0.08 }); g.text(24, 162, 'dg.iommu.ram', { c: 'g' }); lbox(g, 120, 180, 200, 44, C.green, 'dg.iommu.ok', { c: 'n' });
    lbox(g, 10, 262, 200, 54, C.violet, 'dg.iommu.iommu', { c: 'v' }); lbox(g, 10, 340, 200, 44, C.green, 'dg.iommu.dev', { c: 'n' });
    g.line(110, 338, 110, 320, C.green, { arrow: 1 }); g.line(110, 260, 110, 240, C.green, { arrow: 1 });
    g.line(212, 289, 226, 289, C.red, { arrow: 1, dash: '3 3' }); g.text(232, 289, 'dg.iommu.block', { c: 'r', w: 100, va: 'mid' });
  } };
};

// ch9: discovery → match → probe → bind
DG.probe = (L) => {
  if (L === 'w') return { W: 720, H: 350, draw(g) {
    lbox(g, 20, 14, 300, 46, C.green, 'dg.probe.disc', { c: 'n' }); lbox(g, 20, 80, 300, 44, C.gold, 'dg.probe.reg', { c: 'g' });
    lbox(g, 400, 80, 300, 44, C.gold, 'dg.probe.drv', { c: 'g' });
    lbox(g, 210, 150, 300, 44, C.gold, 'dg.probe.match', { c: 'g', mono: true }); lbox(g, 210, 216, 300, 40, C.gold, 'dg.probe.probe', { c: 'g', mono: true });
    g.line(170, 62, 170, 76, C.mute, { arrow: 1 }); g.line(170, 126, 300, 147, C.mute, { arrow: 1 }); g.line(550, 126, 420, 147, C.mute, { arrow: 1 }); g.line(360, 196, 360, 212, C.mute, { arrow: 1 });
    lbox(g, 20, 286, 205, 48, C.green, 'dg.probe.ok', { c: 'n' }); lbox(g, 235, 286, 250, 48, C.violet, 'dg.probe.defer', { c: 'v' }); lbox(g, 495, 286, 205, 48, C.red, 'dg.probe.fail', { c: 'r' });
    g.line(300, 258, 122, 282, C.green, { arrow: 1 }); g.line(360, 258, 360, 282, C.violet, { arrow: 1 }); g.line(420, 258, 597, 282, C.red, { arrow: 1 });
    g.line(478, 284, 514, 238, C.violet, { dash: '4 4', arrow: 1 }); g.text(526, 222, 'dg.probe.retry', { c: 'v', w: 184, va: 'mid' });
  } };
  return { W: 340, H: 530, draw(g) {
    const pos = chain(g, 10, 8, 320, [['dg.probe.disc', C.green, 46], ['dg.probe.reg', C.gold, 40], ['dg.probe.drv', C.gold, 40], ['dg.probe.match', C.gold, 44], ['dg.probe.probe', C.gold, 40]], 18);
    const y0 = pos[4][0] + 40 + 20;
    lbox(g, 10, y0, 320, 44, C.green, 'dg.probe.ok', { c: 'n' }); lbox(g, 10, y0 + 56, 320, 44, C.violet, 'dg.probe.defer', { c: 'v' });
    g.text(20, y0 + 120, 'dg.probe.retry', { c: 'v', w: 310 }); lbox(g, 10, y0 + 146, 320, 44, C.red, 'dg.probe.fail', { c: 'r' });
  } };
};

// ch10: the Linux read path
DG.stack = (L) => {
  const items = [['dg.stack.app', C.cyan], ['dg.stack.vfs', C.gold], ['dg.stack.pc', C.violet], ['dg.stack.fs', C.gold], ['dg.stack.blk', C.gold], ['dg.stack.drv', C.gold], ['dg.stack.dev', C.green]];
  if (L === 'w') return { W: 720, H: 400, draw(g) {
    let y = 16; const ys = [];
    items.forEach(([k, col], i) => { lbox(g, 120, y, 430, 42, col, k, { c: cls(col), mono: i === 0 }); ys.push(y); y += 54; });
    for (let i = 0; i < items.length - 1; i++) g.line(300, ys[i] + 44, 300, ys[i + 1] - 3, C.mute, { arrow: 1 });
    g.line(16, ys[1] - 6, 556, ys[1] - 6, C.line, { dash: '4 5' });
    g.text(16, ys[0] + 21, 'dg.stack.user', { c: 'c' }); g.text(16, ys[1] + 21, 'dg.stack.kern', { c: 'g' });
    lbox(g, 600, ys[2] - 2, 110, 46, C.cyan, 'dg.stack.hit', { c: 'c' }); g.line(552, ys[2] + 21, 596, ys[2] + 21, C.cyan, { arrow: 1 }); g.line(655, ys[2] - 4, 655, ys[0] + 21, C.cyan); g.line(655, ys[0] + 21, 554, ys[0] + 21, C.cyan, { arrow: 1 });
    g.line(575, ys[6] + 21, 575, ys[1] + 30, C.red, { arrow: 1 }); g.line(552, ys[6] + 21, 575, ys[6] + 21, C.red);
    g.text(586, ys[5] - 6, 'dg.stack.back', { c: 'r', w: 128 });
  } };
  return { W: 340, H: 500, draw(g) {
    let y = 8; const ys = [];
    items.forEach(([k, col], i) => { lbox(g, 10, y, 320, 44, col, k, { c: cls(col), mono: i === 0 }); ys.push(y); y += i === 2 || i === 6 ? 80 : 58; });
    for (let i = 0; i < items.length - 1; i++) g.line(170, ys[i] + 46, 170, ys[i + 1] - 3, C.mute, { arrow: 1 });
    g.text(10, ys[2] + 60, 'dg.stack.hit', { c: 'c' });
    g.text(10, ys[6] + 64, 'dg.stack.back', { c: 'r', w: 320 });
  } };
};

// ch11: io_uring's two shared rings
DG.uring = (L) => {
  if (L === 'w') return { W: 720, H: 330, draw(g) {
    g.box(20, 24, 150, 230, C.cyan, { a: 0.08 }); g.text(95, 44, 'dg.uring.app', { a: 'middle', c: 'c' });
    g.box(550, 24, 150, 230, C.gold, { a: 0.08 }); g.text(625, 44, 'dg.uring.kern', { a: 'middle', c: 'g' });
    g.box(190, 24, 340, 230, C.violet, { a: 0.04, dash: '6 5' }); g.text(360, 42, 'dg.uring.shared', { a: 'middle', c: 'v' });
    lbox(g, 205, 62, 310, 50, C.cyan, 'dg.uring.sq', { c: 'c' });
    g.text(207, 128, 'dg.uring.sqtail', { c: 'c' }); g.text(513, 128, 'dg.uring.sqhead', { c: 'g', a: 'end' });
    lbox(g, 205, 152, 310, 50, C.gold, 'dg.uring.cq', { c: 'g' });
    g.text(207, 218, 'dg.uring.cqhead', { c: 'c' }); g.text(513, 218, 'dg.uring.cqtail', { c: 'g', a: 'end' });
    g.line(170, 87, 201, 87, C.cyan, { arrow: 1 }); g.line(517, 87, 546, 87, C.gold, { arrow: 1 });
    g.line(548, 177, 519, 177, C.gold, { arrow: 1 }); g.line(201, 177, 172, 177, C.cyan, { arrow: 1 });
    g.text(360, 280, 'dg.uring.enter', { a: 'middle', mono: false, w: 680 }); g.text(360, 308, 'dg.uring.sqpoll', { a: 'middle', c: 'm', w: 680 });
  } };
  return { W: 340, H: 420, draw(g) {
    lbox(g, 10, 6, 320, 36, C.cyan, 'dg.uring.app', { c: 'c' });
    g.box(10, 54, 320, 214, C.violet, { a: 0.04, dash: '6 5' }); g.text(170, 70, 'dg.uring.shared', { a: 'middle', c: 'v' });
    lbox(g, 20, 86, 300, 50, C.cyan, 'dg.uring.sq', { c: 'c' });
    g.text(20, 150, 'dg.uring.sqtail', { c: 'c' }); g.text(320, 150, 'dg.uring.sqhead', { c: 'g', a: 'end' });
    lbox(g, 20, 172, 300, 50, C.gold, 'dg.uring.cq', { c: 'g' });
    g.text(20, 238, 'dg.uring.cqhead', { c: 'c' }); g.text(320, 238, 'dg.uring.cqtail', { c: 'g', a: 'end' });
    lbox(g, 10, 280, 320, 36, C.gold, 'dg.uring.kern', { c: 'g' });
    g.text(10, 340, 'dg.uring.enter', { w: 320 }); g.text(10, 384, 'dg.uring.sqpoll', { c: 'm', w: 320 });
  } };
};

// ch12: three data paths
DG.bypass = (L) => {
  const A = [['dg.bypass.app', C.cyan, 40], ['dg.bypass.sys', C.red, 34], ['dg.bypass.stack', C.gold, 44], ['dg.bypass.kdrv', C.gold, 40], ['dg.bypass.dev', C.green, 40]];
  if (L === 'w') return { W: 720, H: 330, draw(g) {
    g.text(20, 16, 'dg.bypass.a', { c: 'm' }); g.text(250, 16, 'dg.bypass.b', { c: 'm' }); g.text(480, 16, 'dg.bypass.c', { c: 'm' });
    chain(g, 20, 34, 220, A, 22);
    lbox(g, 250, 34, 220, 84, C.cyan, 'dg.bypass.pmd', { c: 'c' }); lbox(g, 300, 150, 170, 52, C.gold, 'dg.bypass.vfio', { c: 'g', dash: '6 5' }); lbox(g, 250, 270, 220, 40, C.green, 'dg.bypass.dev', { c: 'n' });
    g.line(272, 120, 272, 266, C.cyan, { arrow: 1 }); g.line(385, 204, 385, 266, C.gold, { dash: '4 4' });
    lbox(g, 480, 34, 220, 44, C.cyan, 'dg.bypass.vm', { c: 'c' }); g.text(590, 122, 'dg.bypass.iommu', { a: 'middle', c: 'v', w: 210 }); lbox(g, 480, 186, 220, 44, C.green, 'dg.bypass.vf', { c: 'n' }); lbox(g, 480, 270, 220, 40, C.green, 'dg.bypass.dev', { c: 'n' });
    g.line(590, 80, 590, 108, C.cyan); g.line(590, 152, 590, 182, C.cyan, { arrow: 1 }); g.line(590, 232, 590, 266, C.green, { arrow: 1 });
  } };
  return { W: 340, H: 680, draw(g) {
    g.text(10, 12, 'dg.bypass.a', { c: 'm' });
    const pa = chain(g, 10, 26, 320, A.map(([k, c]) => [k, c, 34]), 14);
    let y = pa[4][0] + 34 + 30;
    g.text(10, y, 'dg.bypass.b', { c: 'm' });
    chain(g, 10, y + 14, 320, [['dg.bypass.pmd', C.cyan, 44], ['dg.bypass.dev', C.green, 34]], 18);
    lbox(g, 120, y + 14 + 44 + 18 + 34 + 12, 210, 44, C.gold, 'dg.bypass.vfio', { c: 'g', dash: '6 5' });
    y = y + 14 + 44 + 18 + 34 + 12 + 44 + 30;
    g.text(10, y, 'dg.bypass.c', { c: 'm' });
    const pc = chain(g, 10, y + 14, 320, [['dg.bypass.vm', C.cyan, 34], ['dg.bypass.vf', C.green, 34], ['dg.bypass.dev', C.green, 34]], 16);
    g.text(10, pc[2][0] + 34 + 22, 'dg.bypass.iommu', { c: 'v', w: 320 });
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

/* ───────── 01 the wall ───────── */
(() => {
  const ALL = ['load', 'kload', 'in', 'mmio', 'hlt', 'cr3', 'msr', 'sys'];
  const tbl = $('#pvTbl'), grant = $('#pvGrant');
  function sync() {
    const arch = radioVal('pvA');
    radios('pvO').forEach(r => { r.closest('label').hidden = !M.PRIV.ops[arch].includes(r.value); });
    if (!M.PRIV.ops[arch].includes(radioVal('pvO'))) radios('pvO').find(r => r.value === 'load').checked = true;
    radios('pvL').forEach(r => { r.closest('label').hidden = !M.PRIV.levels[arch].includes(r.value); });
    if (!M.PRIV.levels[arch].includes(radioVal('pvL'))) radios('pvL').find(r => r.value === M.PRIV.levels[arch][0]).checked = true;
  }
  function text() {
    sync();
    const arch = radioVal('pvA'), op = radioVal('pvO'), lv = radioVal('pvL'), g = grant.checked, [u, k] = M.PRIV.levels[arch];
    const cell = (l, o) => { const r = M.priv(arch, l, o, g); const okc = r.res === 'ok' || r.res === 'enter' ? 'y' : r.res === 'kernel' || r.res === 'na' ? '' : 'r'; return `<td class="${okc}${l === lv && o === op ? ' now' : ''}">${esc(t('ch1.res.' + r.res))}</td>`; };
    putHTML('#pvTbl', `<thead><tr><th>${esc(t('ch1.th.op'))}</th><th>${esc(t('ch1.th.user'))}</th><th>${esc(t('ch1.th.kern'))}</th></tr></thead><tbody>` +
      M.PRIV.ops[arch].map(o => `<tr${o === op ? ' class="odd"' : ''}><td>${esc(t('ch1.op.' + o))}</td>${cell(u, o)}${cell(k, o)}</tr>`).join('') + '</tbody>');
    const r = M.priv(arch, lv, op, g);
    put('#pvRes', t('ch1.res.' + r.res)); put('#pvSig', r.sig || t('ch1.sig.none'));
    $('#pvRes').className = r.res === 'ok' || r.res === 'enter' ? 'n' : r.res === 'kernel' ? '' : 'r';
    putHTML('#pvSay', t(M.say.priv(arch, lv, op, g).key));
  }
  void ALL; void tbl;
  onAll([...radios('pvA'), ...radios('pvO'), ...radios('pvL')], 'change', text); grant.addEventListener('change', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 02 the system-call ABI ───────── */
(() => {
  function text() {
    const arch = radioVal('abA'), call = radioVal('abC'), r = M.abi(arch, call);
    const w = Math.max(...r.regs.map(x => x[0].length));
    putHTML('#abRegs', r.regs.map(([reg, v, n]) => `<span class="g">${esc(reg.padEnd(w))}</span> = ${esc(v)}   <span class="m">// ${esc(n === 'nr' ? t('ch2.reg.nr') + ' (' + call + ')' : n)}</span>`).join('\n') + `\n<span class="c">${esc(r.insn)}</span>`);
    putHTML('#abSteps', [1, 2, 3, 4, 5, 6].map(i => `<li>${esc(t('ch2.step.' + arch + '.' + i))}</li>`).join(''));
    put('#abNr', String(r.nr)); put('#abInsn', r.insn); put('#abRet', r.ret); put('#abN', String(r.nargs));
    putHTML('#abSay', t(M.say.abi(arch).key, { call: esc(call), nr: String(r.nr), n: String(r.nargs) }));
  }
  onAll([...radios('abA'), ...radios('abC')], 'change', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 03 the cost of a crossing ───────── */
(() => {
  const cv = $('#scCv'), sW = $('#scW'), sB = $('#scB');
  const work = () => M.COST.works[+sW.value], batch = () => M.COST.batches[+sB.value], prof = () => radioVal('scP');
  const cols = { none: C.green, pcid: C.gold, nopcid: C.red };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), wk = work();
    const ymax = Math.max(...M.COST.profiles.map(p => M.sysCost(p, wk, 1).ns)) * 1.12;
    const f = frame(w, h, [28, 16, 40, 52], 0, 6, 0, ymax);
    const step = ymax > 2000 ? 1000 : ymax > 800 ? 200 : ymax > 300 ? 100 : 50;
    const vals = []; for (let v = 0; v <= ymax; v += step) vals.push(v);
    yTicks(c, f, vals, v => fmt(v, 0));
    c.fillStyle = C.mute; spacedTicks(c, M.COST.batches.map((b, i) => [f.X(i), fmt(b, 0)]), f.B + 12, w);
    axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    for (const p of M.COST.profiles) path(c, M.COST.batches.map((b, i) => [i, M.sysCost(p, wk, b).ns]), f.X, f.Y, cols[p], p === prof() ? 2.8 : 1.6, p === prof() ? null : [5, 4]);
    // the work alone, as a floor
    path(c, [[0, wk / M.COST.ghz], [6, wk / M.COST.ghz]], f.X, f.Y, C.mute, 1, [2, 4]);
    const r = M.sysCost(prof(), wk, batch()); dot(c, f.X(+sB.value), f.Y(r.ns), cols[prof()], 5.5);
  } });
  function text() {
    const r = M.sysCost(prof(), work(), batch());
    put('#scWo', cyc(work())); put('#scBo', fmt(batch(), 0));
    put('#scC', cyc(r.c)); put('#scNs', ns(r.ns)); put('#scShare', pct(r.share)); put('#scFn', t('u.x', { v: fmt(r.vsFn, 1) }));
    putHTML('#scSay', t(M.say.cost(r, batch()).key, { work: cyc(work()), c: cyc(r.c), share: pct(r.share), fn: t('u.x', { v: fmt(r.vsFn, 1) }), batch: fmt(batch(), 0), ns: ns(r.ns) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sW, sB].forEach(s => s.addEventListener('input', go)); onAll(radios('scP'), 'change', go);
  text();
})();

/* ───────── 04 register accesses ───────── */
(() => {
  const cv = $('#mmCv'), sK = $('#mmK'), sB = $('#mmB');
  const k = () => M.MMIO.polls[+sK.value], b = () => M.MMIO.batches[+sB.value];
  const lo = 1, hi = 1e5, lf = v => Math.log10(Math.max(v, lo) / lo) / Math.log10(hi / lo);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.mmio(k(), b());
    bars(c, w, h, [[t('ch4.bar.poll'), r.perCmd.poll, C.red, dur(r.perCmd.poll / 1000)], [t('ch4.bar.irq'), r.perCmd.irq, C.gold, dur(r.perCmd.irq / 1000)], [t('ch4.bar.ring'), r.perCmd.ring, C.green, dur(r.perCmd.ring / 1000)]], lf, -1);
  } });
  function text() {
    const r = M.mmio(k(), b());
    put('#mmKo', fmt(k(), 0)); put('#mmBo', fmt(b(), 0));
    put('#mmPoll', dur(r.perCmd.poll / 1000)); put('#mmIrq', dur(r.perCmd.irq / 1000)); put('#mmRing', dur(r.perCmd.ring / 1000));
    put('#mmReads', [r.poll.reads, r.irq.reads, r.ring.reads].map(x => fmt(x, 0)).join(' / '));
    putHTML('#mmSay', t(M.say.mmio(k(), b()).key, { k: fmt(k(), 0), poll: dur(r.perCmd.poll / 1000), irq: dur(r.perCmd.irq / 1000), ring: dur(r.perCmd.ring / 1000), b: fmt(b(), 0), r: ns(M.MMIO.R) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sK, sB].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 06 interrupts, polling, NAPI ───────── */
(() => {
  const cv = $('#plCv'), sR = $('#plR'), sC = $('#plC');
  const rate = () => M.POLL.rates[+sR.value], coal = () => M.POLL.coal[+sC.value], mode = () => radioVal('plM');
  const cache = new Map();
  const curve = (m, u) => { const key = m + u; if (!cache.has(key)) cache.set(key, M.POLL.rates.map(r => [r, M.pollSim(m, r, u, { events: 6000 }).cpu])); return cache.get(key); };
  const cols = { irq: C.red, poll: C.cyan, napi: C.gold };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), u = coal();
    const lx = r => Math.log10(r), x0 = lx(M.POLL.rates[0]), x1 = lx(M.POLL.rates[M.POLL.rates.length - 1]);
    const f = frame(w, h, [28, 16, 40, 48], x0, x1, 0, 1.08);
    yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100, 0) + '%');
    c.fillStyle = C.mute; spacedTicks(c, [1e3, 1e4, 1e5, 5e5].map(r => [f.X(lx(r)), r >= 1e5 ? fmt(r / 1e3, 0) + 'k' : fmt(r / 1e3, 0) + 'k']), f.B + 12, w);
    axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
    const xl = f.X(lx(M.livelockRate()));
    c.strokeStyle = C.red; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(xl, f.T); c.lineTo(xl, f.B); c.stroke(); c.setLineDash([]);
    c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(t('ch6.cv.live'), xl - 6, f.Y(0.12));
    for (const m of M.POLL.modes) path(c, curve(m, m === 'poll' ? 0 : u).map(([r, v]) => [lx(r), v]), f.X, f.Y, cols[m], m === mode() ? 2.8 : 1.6, m === mode() ? null : [5, 4]);
    const r = M.pollSim(mode(), rate(), mode() === 'poll' ? 0 : u); dot(c, f.X(lx(rate())), f.Y(r.cpu), cols[mode()], 5.5);
  } });
  function text() {
    const m = mode(), u = m === 'poll' ? 0 : coal(), r = M.pollSim(m, rate(), u), ri = M.pollSim('irq', rate(), 0);
    put('#plRo', rateStr(rate())); put('#plCo', u ? us(coal(), 0) : (m === 'poll' ? t('u.none') : us(0, 0)));
    sC.disabled = m === 'poll';
    put('#plCpu', pct(r.cpu)); put('#plIrq', m === 'poll' ? t('u.none') : t('u.persec', { v: fmt(r.irqsPerSec, 0) })); put('#plPer', m === 'poll' ? t('u.none') : fmt(r.perIrq, 1));
    put('#plMean', dur(r.mean)); put('#plLive', t('u.kpps', { v: fmt(M.livelockRate() / 1000, 0) })); put('#plP99', dur(r.p99));
    $('#plMean').className = r.backlog ? 'r' : 'g';
    putHTML('#plSay', t(M.say.poll(r).key, { cpu: pct(r.cpu), mean: dur(r.mean), p99: dur(r.p99), h: us(M.POLL.h, 1), p: us(M.POLL.p), rate: rateStr(rate()), coal: us(coal(), 0), irqs: t('u.persec', { v: fmt(r.irqsPerSec, 0) }), per: fmt(r.perIrq, 1), irqcpu: pct(ri.cpu) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sR, sC].forEach(s => s.addEventListener('input', go)); onAll(radios('plM'), 'change', go);
  text();
})();

/* ───────── 07 the descriptor ring ───────── */
(() => {
  const cv = $('#rgCv'), sN = $('#rgN'), sR = $('#rgR'), sS = $('#rgS');
  const N = () => M.RING.sizes[+sN.value], rate = () => M.RING.rates[+sR.value], stall = () => M.RING.stalls[+sS.value];
  let memo = null;
  const run = () => { const k = N() + '/' + rate() + '/' + stall(); if (!memo || memo.k !== k) memo = { k, r: M.ringSim(N(), rate(), stall()) }; return memo.r; };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = run(), n = N();
    const ymax = Math.max(n, r.maxOcc) * 1.15;
    const f = frame(w, h, [28, 16, 40, 52], 0, M.RING.ms, 0, ymax);
    // the stall windows
    c.fillStyle = 'rgba(240,122,109,.10)';
    if (stall()) for (let t0 = 0; t0 < M.RING.ms * 1000; t0 += M.RING.period) c.fillRect(f.X(t0 / 1000), f.T, f.X((t0 + stall()) / 1000) - f.X(t0 / 1000), f.B - f.T);
    const step = ymax > 2000 ? 1000 : ymax > 800 ? 256 : ymax > 300 ? 128 : ymax > 100 ? 64 : 16;
    const vals = []; for (let v = 0; v <= ymax; v += step) vals.push(v);
    yTicks(c, f, vals, v => fmt(v, 0));
    c.fillStyle = C.mute; spacedTicks(c, [0, 4, 8, 12, 16, 20].map(v => [f.X(v), fmt(v, 0)]), f.B + 12, w);
    axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
    c.strokeStyle = C.red; c.lineWidth = 1.4; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(f.L, f.Y(n)); c.lineTo(f.R, f.Y(n)); c.stroke(); c.setLineDash([]);
    const capLab = t('ch7.cv.cap', { n: fmt(n, 0) }); c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(capLab, f.R - 4, f.Y(n) - 10);
    path(c, r.trace.map(([tm, o]) => [tm / 1000, o]), f.X, f.Y, C.green, 1.6);
  } });
  function text() {
    const r = run();
    put('#rgNo', t('u.slots', { v: fmt(N(), 0) })); put('#rgRo', t('u.mpps', { v: fmt(rate(), 1) })); put('#rgSo', us(stall(), 0));
    put('#rgDrop', pct(r.dropPct, r.dropPct && r.dropPct < 0.1 ? 1 : 0)); $('#rgDrop').className = r.drops ? 'r' : 'n';
    put('#rgMax', fmt(r.maxOcc, 0)); put('#rgMean', dur(r.mean));
    putHTML('#rgCtr', M.hex(r.prod, 8) + '<br>' + M.hex(r.cons, 8)); put('#rgIdx', fmt(r.iProd, 0) + ' / ' + fmt(r.iCons, 0));
    put('#rgNeed', t('u.slots', { v: fmt(r.need, 0) })); put('#rgBell', fmt(r.doorbells / Math.max(1, r.done), 3));
    putHTML('#rgSay', t(M.say.ring(r).key, { max: fmt(r.maxOcc, 0), n: fmt(N(), 0), stall: us(stall(), 0), rate: t('u.mpps', { v: fmt(rate(), 1) }), need: fmt(r.need, 0), drop: pct(r.dropPct, r.dropPct < 0.1 ? 1 : 0), period: fmt(M.RING.period / 1000, 0), cap: t('u.mpps', { v: fmt(r.cap, 2) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sN, sR, sS].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 09 match, probe, bind ───────── */
(() => {
  const ids = ['igb', 'nvme', 'dwmmc', 'regfixed'];
  const devName = d => t('ch9.dev.' + d), drvName = d => t('ch9.drv.' + d).split(/[\uff08(]/)[0].trim();
  function text() {
    const loaded = {}; ids.forEach(k => { loaded[k] = $('#bd_' + k).checked; });
    const b = M.bind(radioVal('bdO'), loaded);
    putHTML('#bdLog', b.log.map(e => {
      const cl = e.ev === 'bound' ? 'ok' : e.ev === 'defer' ? 'bad' : e.ev === 'nodrv' ? 'skip' : '';
      let why = '';
      if (e.ev === 'match' && e.dev === 'nvme') why = `<small>${esc(t('ch9.why.nvme'))}</small>`;
      if (e.ev === 'match' && e.dev === 'mmc') why = `<small>${esc(t('ch9.why.mmc', { i: String(M.ofScore(M.BIND.drvs.find(x => x.id === e.drv), M.BIND.devs.find(x => x.id === 'mmc')) + 1) }))}</small>`;
      return `<li class="${cl}">${esc(t('ch9.ev.' + e.ev, { drv: e.drv ? drvName(e.drv) : '', dev: e.dev ? t('ch9.dev.' + e.dev).split(/ PCI | \(|\uff08/)[0].trim() : '' }))}${why}</li>`;
    }).join(''));
    putHTML('#bdDev', '<tbody>' + M.BIND.devs.map(d => { const s = b.state[d.id]; const cl = s.st === 'bound' ? 'y' : s.st === 'deferred' ? 'n' : ''; return `<tr><td class="l">${esc(devName(d.id))}</td><td class="${cl}">${esc(t('ch9.st.' + s.st, { drv: s.drv ? drvName(s.drv) : '' }))}</td></tr>`; }).join('') + '</tbody>');
    const retries = b.log.filter(x => x.ev === 'retry').length;
    put('#bdBound', fmt(b.bound, 0) + ' / ' + fmt(M.BIND.devs.length, 0)); put('#bdDef', fmt(b.deferredLeft.length, 0)); put('#bdRetry', fmt(retries, 0));
    putHTML('#bdSay', t(M.say.bind(b).key, { bound: fmt(b.bound, 0), retries: fmt(retries, 0), n: fmt(b.unbound.length, 0) }));
  }
  onAll(radios('bdO'), 'change', text); ids.forEach(k => $('#bd_' + k).addEventListener('change', text));
  reg([], { draw() {}, text }); text();
})();

/* ───────── 10 one read() through the stack ───────── */
(() => {
  const cv = $('#rdCv'), sH = $('#rdH');
  const mode = () => radioVal('rdM'), dev = () => radioVal('rdD'), hit = () => M.READ.hits[+sH.value];
  const kcol = { vfs: C.cyan, pc: C.violet, fs: C.mute, blk: C.gold, drv: '#c9a24a', dev: C.green, irq: C.red, sched: C.red };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.readTrace(mode(), dev(), hit());
    const L = 12, R = w - 12, rows = [[t('ch10.cv.all'), r.steps, r.total], [t('ch10.cv.soft'), r.steps.filter(s => s[0] !== 'device'), r.soft]];
    rows.forEach(([lab, steps, tot], i) => {
      const y0 = 26 + i * (h / 2), bh = Math.min(34, h / 2 - 54);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(lab + ' · ' + dur(tot), L, y0 - 10);
      let x = L;
      for (const [k, v, kind, cat] of steps) {
        const ww = (R - L) * v / tot;
        c.fillStyle = kind === 'spin' ? 'rgba(99,199,230,.35)' : kcol[cat]; c.fillRect(x, y0, Math.max(0.8, ww - (ww > 3 ? 1 : 0)), bh);
        x += ww;
      }
      c.strokeStyle = C.line; c.strokeRect(L - 0.5, y0 - 0.5, R - L + 1, bh + 1);
    });
  } });
  function text() {
    const r = M.readTrace(mode(), dev(), hit());
    put('#rdHo', pct(hit() / 100));
    putHTML('#rdSteps', r.steps.map(([k, v, kind, cat]) => `<span style="border-left:3px solid ${kind === 'spin' ? C.cyan : kcol[cat]}">${esc(t('ch10.st.' + k))} <b>${esc(dur(v))}</b></span>`).join(''));
    put('#rdTot', dur(r.total)); put('#rdSoft', pct(r.softShare)); put('#rdCpu', dur(r.cpu)); put('#rdAvg', dur(r.avg));
    putHTML('#rdSay', t(M.say.read(mode()).key, { total: dur(r.total), device: dur(r.device), soft: dur(r.soft), cpu: dur(r.cpu) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sH.addEventListener('input', go); onAll([...radios('rdM'), ...radios('rdD')], 'change', go);
  text();
})();

/* ───────── 11 syscalls per I/O ───────── */
(() => {
  const cv = $('#asCv'), sK = $('#asK');
  const k = () => M.ASYNC.ks[+sK.value], api = () => radioVal('asA'), prof = () => radioVal('asP');
  const cols = { block: C.red, epoll: C.violet, uring: C.gold, sqpoll: C.cyan };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rs = M.ASYNC.apis.map(a => M.asyncIo(a, k(), prof())), max = Math.max(...rs.map(r => r.perCore)) * 1.08;
    bars(c, w, h, rs.map(r => [t('ch11.a.' + r.api), r.perCore, cols[r.api], t('u.kiops', { v: fmt(r.perCore / 1000, 0) })]), v => v / max, M.ASYNC.apis.indexOf(api()));
  } });
  function text() {
    const r = M.asyncIo(api(), k(), prof());
    put('#asKo', fmt(k(), 0));
    put('#asSys', fmt(r.sys, r.sys && r.sys < 0.1 ? 3 : 2)); put('#asIops', t('u.kiops', { v: fmt(r.perCore / 1000, 0) })); put('#asOver', pct(r.overShare)); put('#asCores', fmt(r.cores, 0));
    putHTML('#asSay', t(M.say.async(api()).key, { over: pct(r.overShare), iops: t('u.kiops', { v: fmt(r.iops / 1000, 0) }), k: fmt(k(), 0), sys: fmt(r.sys, r.sys < 0.1 ? 3 : 2), percore: t('u.kiops', { v: fmt(r.perCore / 1000, 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sK.addEventListener('input', go); onAll([...radios('asA'), ...radios('asP')], 'change', go);
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
