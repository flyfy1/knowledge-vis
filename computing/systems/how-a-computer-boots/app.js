/* How a computer boots: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js.
   The canvas, chart and SVG helpers follow how-cores-share-memory/app.js. */
(() => {
'use strict';
const M = window.BootModels;
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
const ms = (x, d) => t('u.ms', { v: fmt(x, d == null ? (x < 10 ? 1 : 0) : d) });
const sec = (x, d) => t('u.s', { v: fmt(x, d == null ? 1 : d) });
const us = (x, d) => t('u.us', { v: fmt(x, d == null ? 2 : d) });
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
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; let lines = [], cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}


/* ───────── static diagrams (STANDARD §4a). Two layouts: 'w' (viewBox 720 wide, column ≥ 600 px) and 'n' (340 wide).
   Text is 14 units, so it renders at ≥ 11.7 px at 320 px. A label with a width limit wraps. Colours: power and
   hardware green, firmware gold, the operating system cyan, keys and checks violet, failure red. ───────── */
const DG = {};
function lbox(g, x, y, w, h, col, key, o) {
  o = o || {}; g.box(x, y, w, h, col, { a: o.a, dash: o.dash, rx: o.rx });
  g.text(x + w / 2, y + h / 2, key, { a: 'middle', c: o.c, vars: o.vars, w: w - 12, va: 'mid', mono: o.mono, fs: o.fs });
}
const poly = (g, pts, col, o) => { o = o || {}; for (let i = 1; i < pts.length; i++) g.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], col, { sw: o.sw || 2, dash: o.dash, arrow: o.arrow && i === pts.length - 1 }); };
// a two-headed span marker: a line with ticks at both ends
function span(g, x1, x2, y, col) { g.line(x1, y, x2, y, col, { sw: 1.4 }); g.line(x1, y - 5, x1, y + 5, col, { sw: 1.4 }); g.line(x2, y - 5, x2, y + 5, col, { sw: 1.4 }); }

// ch1: the power-on timing
DG.power = (L) => {
  const wide = L === 'w';
  if (wide) return { W: 720, H: 318, draw(g) {
    const rows = [['dg.power.pson', 40, C.mute], ['dg.power.rails', 116, C.green], ['dg.power.pwrok', 192, C.green], ['dg.power.rst', 262, C.gold]];
    rows.forEach(([k, y, col]) => g.text(16, y, k, { w: 150, va: 'mid', c: col === C.gold ? 'g' : col === C.green ? 'n' : 'm' }));
    const hi = y => y - 12, lo = y => y + 12, xa = 180, xe = 706, tOn = 230, r0 = 258, r1 = 320, tOk = 480, tRst = 560;
    poly(g, [[xa, hi(40)], [tOn, hi(40)], [tOn, lo(40)], [xe, lo(40)]], C.mute);
    poly(g, [[xa, lo(116)], [r0, lo(116)], [r1, hi(116)], [xe, hi(116)]], C.green);
    poly(g, [[xa, lo(192)], [tOk, lo(192)], [tOk, hi(192)], [xe, hi(192)]], C.green);
    poly(g, [[xa, lo(262)], [tRst, lo(262)], [tRst, hi(262)], [xe, hi(262)]], C.gold);
    span(g, tOn, r1, 86, C.mute); g.text((tOn + r1) / 2, 72, 'dg.power.t1', { a: 'middle' });
    span(g, r0, r1, 142, C.mute); g.text((r0 + r1) / 2, 156, 'dg.power.t2', { a: 'middle' });
    span(g, r1, tOk, 142, C.mute); g.text((r1 + tOk) / 2, 156, 'dg.power.t3', { a: 'middle' });
    g.line(tOk + 4, 206, tRst - 4, 246, C.mute, { dash: '4 4', arrow: 1 });
    g.text(574, 222, 'dg.power.board', { c: 'm', w: 140, va: 'mid' });
    g.text(370, 262, 'dg.power.hold', { a: 'middle', c: 'g' });
    g.text(712, 290, 'dg.power.rel', { a: 'end', c: 'g' });
  } };
  return { W: 340, H: 380, draw(g) {
    const rows = [['dg.power.pson.n', 16, 46, C.mute], ['dg.power.rails.n', 106, 136, C.green], ['dg.power.pwrok', 196, 226, C.green], ['dg.power.rst', 282, 312, C.gold]];
    rows.forEach(([k, ly, , col]) => g.text(10, ly, k, { c: col === C.gold ? 'g' : col === C.green ? 'n' : 'm' }));
    const hi = y => y - 10, lo = y => y + 10, xa = 14, xe = 330, tOn = 60, r0 = 80, r1 = 120, tOk = 226, tRst = 270;
    poly(g, [[xa, hi(46)], [tOn, hi(46)], [tOn, lo(46)], [xe, lo(46)]], C.mute);
    poly(g, [[xa, lo(136)], [r0, lo(136)], [r1, hi(136)], [xe, hi(136)]], C.green);
    poly(g, [[xa, lo(226)], [tOk, lo(226)], [tOk, hi(226)], [xe, hi(226)]], C.green);
    poly(g, [[xa, lo(312)], [tRst, lo(312)], [tRst, hi(312)], [xe, hi(312)]], C.gold);
    span(g, tOn, r1, 90, C.mute); g.text(150, 76, 'dg.power.t1', { a: 'middle' });
    span(g, r0, r1, 158, C.mute); g.text(100, 172, 'dg.power.t2', { a: 'middle' });
    span(g, r1, tOk, 158, C.mute); g.text(212, 172, 'dg.power.t3', { a: 'middle' });
    g.text(330, 256, 'dg.power.board', { a: 'end', c: 'm' });
    g.text(130, 300, 'dg.power.hold', { a: 'middle', c: 'g' });
    g.text(330, 346, 'dg.power.rel', { a: 'end', c: 'g' });
  } };
};

// ch2: the physical address map at reset (Intel platform, schematic)
DG.map = (L) => {
  const wide = L === 'w';
  if (wide) return { W: 720, H: 396, draw(g) {
    const x = 170, w = 250;
    lbox(g, x, 14, w, 62, C.gold, 'dg.map.flash', { c: 'g' });
    lbox(g, x, 96, w, 80, C.violet, 'dg.map.mmio', { c: 'v' });
    lbox(g, x, 176, w, 154, C.cyan, 'dg.map.dram', { dash: '6 5', c: 'c' });
    lbox(g, x, 330, w, 52, C.mute, 'dg.map.low', { c: 'm' });
    g.text(160, 16, 'dg.map.top', { a: 'end' }); g.text(160, 330, 'dg.map.onemib', { a: 'end', c: 'm' }); g.text(160, 380, 'dg.map.zero', { a: 'end', c: 'm' });
    g.line(436, 22, 424, 22, C.gold, { arrow: 1 });
    g.text(442, 22, 'dg.map.rv', { c: 'g', mono: true });
    g.text(442, 48, 'dg.map.rv16', { c: 'm', w: 270 });
  } };
  return { W: 340, H: 400, draw(g) {
    const x = 92, w = 238;
    g.text(10, 14, 'dg.map.rv', { c: 'g', mono: true });
    g.text(10, 36, 'dg.map.rv16', { c: 'm', w: 320 });
    g.line(300, 46, 300, 58, C.gold, { arrow: 1 });
    lbox(g, x, 60, w, 54, C.gold, 'dg.map.flash', { c: 'g' });
    lbox(g, x, 128, w, 70, C.violet, 'dg.map.mmio', { c: 'v' });
    lbox(g, x, 198, w, 130, C.cyan, 'dg.map.dram', { dash: '6 5', c: 'c' });
    lbox(g, x, 328, w, 62, C.mute, 'dg.map.low', { c: 'm' });
    g.text(84, 64, 'dg.map.top', { a: 'end' }); g.text(84, 328, 'dg.map.onemib', { a: 'end', c: 'm' }); g.text(84, 384, 'dg.map.zero', { a: 'end', c: 'm' });
  } };
};

// ch3: the segments of two SPI read commands (schematic)
DG.spi = (L) => {
  const wide = L === 'w', c03 = M.SPI.cmds['03'], cEB = M.SPI.cmds.EB;
  const r03 = [['dg.spi.ins', c03.ins, C.violet], ['dg.spi.addr', c03.addr, C.cyan], ['dg.spi.data', 8 / c03.dlanes, C.gold]];
  const rEB = [['dg.spi.ins', cEB.ins, C.violet], ['dg.spi.addr', cEB.addr, C.cyan], ['dg.spi.mode', cEB.mode, C.mute], ['dg.spi.dummy', cEB.dummy, C.mute], ['dg.spi.data', 8 / cEB.dlanes, C.gold]];
  const seg = (g, x, y, w, h, [k, n, col]) => lbox(g, x, y, w, h, col, k, { vars: { n: String(n) }, c: col === C.gold ? 'g' : col === C.cyan ? 'c' : col === C.violet ? 'v' : 'm' });
  if (wide) return { W: 720, H: 222, draw(g) {
    g.text(420, 18, 'dg.spi.cs', { a: 'middle', c: 'm' }); span(g, 140, 700, 36, C.mute);
    g.text(10, 82, 'dg.spi.r03', { w: 122, va: 'mid' }); g.text(10, 172, 'dg.spi.rEB', { w: 122, va: 'mid' });
    let x = 140; [[110], [250], [160]].forEach(([w], i) => { seg(g, x, 58, w - 6, 48, r03[i]); x += w; });
    x = 140; [[110], [100], [100], [100], [150]].forEach(([w], i) => { seg(g, x, 148, w - 6, 48, rEB[i]); x += w; });
  } };
  return { W: 340, H: 270, draw(g) {
    g.text(10, 14, 'dg.spi.cs', { c: 'm' });
    g.text(10, 46, 'dg.spi.r03'); let x = 10; [86, 110, 124].forEach((w, i) => { seg(g, x, 60, w - 6, 50, r03[i]); x += w; });
    g.text(10, 140, 'dg.spi.rEB'); x = 10; [107, 107, 106].forEach((w, i) => { seg(g, x, 154, w - 6, 44, rEB[i]); x += w; });
    x = 10; [107, 213].forEach((w, i) => { seg(g, x, 206, w - 6, 50, rEB[3 + i]); x += w; });
  } };
};

// ch4: what happens before the x86 core fetches its first instruction
DG.first = (L) => {
  const wide = L === 'w', I = ['i1', 'i2', 'i3', 'i4'], A = ['a1', 'a2', 'a3', 'a4'];
  const col = (g, x, y0, w, head, keys, step, bh) => {
    g.text(x, y0, head, { weight: 600 });
    keys.forEach((k, i) => { const y = y0 + 22 + i * step; lbox(g, x, y, w, bh, i === 0 ? C.violet : i === 3 ? C.gold : C.mute, 'dg.first.' + k, { c: i === 0 ? 'v' : i === 3 ? 'g' : '' });
      if (i < keys.length - 1) g.line(x + w / 2, y + bh + 1, x + w / 2, y + step - 2, C.mute, { arrow: 1 }); });
  };
  if (wide) return { W: 720, H: 352, draw(g) {
    col(g, 20, 18, 330, 'dg.first.intel', I, 70, 52); col(g, 370, 18, 330, 'dg.first.amd', A, 70, 52);
    g.text(360, 334, 'dg.first.root', { a: 'middle', c: 'v' });
  } };
  return { W: 340, H: 600, draw(g) {
    col(g, 10, 14, 320, 'dg.first.intel', I, 64, 50); col(g, 10, 294, 320, 'dg.first.amd', A, 64, 50);
    g.text(170, 584, 'dg.first.root', { a: 'middle', c: 'v' });
  } };
};

// ch5: cache as RAM
DG.car = (L) => {
  const wide = L === 'w';
  if (wide) return { W: 720, H: 322, draw(g) {
    lbox(g, 20, 100, 140, 60, C.gold, 'dg.car.core', { c: 'g' });
    g.box(200, 20, 280, 240, C.mute, { a: 0.06 }); g.text(340, 40, 'dg.car.cache', { a: 'middle', weight: 600 });
    lbox(g, 216, 60, 248, 90, C.gold, 'dg.car.locked', { c: 'g', a: 0.22 });
    lbox(g, 216, 162, 248, 84, C.mute, 'dg.car.free', { c: 'm', a: 0.08 });
    lbox(g, 520, 30, 180, 80, C.violet, 'dg.car.flash', { c: 'v' });
    lbox(g, 520, 160, 180, 80, C.red, 'dg.car.dram', { dash: '6 5', c: 'r' });
    g.line(162, 124, 214, 110, C.gold, { arrow: 1 }); g.line(214, 120, 162, 136, C.gold, { arrow: 1 });
    g.line(518, 70, 466, 90, C.violet, { arrow: 1 });
    g.text(360, 296, 'dg.car.after', { a: 'middle', c: 'c' });
  } };
  return { W: 340, H: 440, draw(g) {
    lbox(g, 10, 10, 320, 44, C.gold, 'dg.car.core', { c: 'g' });
    g.line(170, 56, 170, 70, C.gold, { arrow: 1 });
    g.box(10, 72, 320, 176, C.mute, { a: 0.06 }); g.text(170, 90, 'dg.car.cache', { a: 'middle', weight: 600 });
    lbox(g, 22, 106, 296, 70, C.gold, 'dg.car.locked', { c: 'g', a: 0.22 });
    lbox(g, 22, 186, 296, 50, C.mute, 'dg.car.free', { c: 'm', a: 0.08 });
    lbox(g, 10, 268, 320, 50, C.violet, 'dg.car.flash', { c: 'v' });
    lbox(g, 10, 330, 320, 50, C.red, 'dg.car.dram', { dash: '6 5', c: 'r' });
    g.text(170, 406, 'dg.car.after', { a: 'middle', c: 'c', w: 320 });
  } };
};

// ch6: the UEFI phases, with legacy BIOS for contrast
DG.flow = (L) => {
  const wide = L === 'w', P = [['sec', C.violet], ['pei', C.gold], ['dxe', C.gold], ['bds', C.gold], ['os', C.cyan]];
  if (wide) return { W: 720, H: 272, draw(g) {
    P.forEach(([k, col], i) => { const x = 10 + i * 142;
      lbox(g, x, 14, 128, 46, col, 'dg.flow.' + k, { c: col === C.cyan ? 'c' : col === C.violet ? 'v' : 'g' });
      g.text(x + 64, 76, 'dg.flow.' + k + '.d', { a: 'middle', w: 124, c: 'm' });
      if (i < 4) g.line(x + 130, 37, x + 140, 37, C.mute, { arrow: 1 }); });
    g.text(584, 160, 'dg.flow.rt', { c: 'c' }); g.text(358, 160, 'dg.flow.acpi', { a: 'middle', c: 'g' }); g.line(358, 132, 358, 148, C.gold, { arrow: 1 });
    g.line(642, 132, 642, 148, C.cyan, { arrow: 1 });
    g.text(10, 218, 'dg.flow.legacy', { w: 110, va: 'mid', weight: 600 });
    ['l1', 'l2', 'l3'].forEach((k, i) => { const x = 130 + i * 196; lbox(g, x, 192, 182, 52, C.mute, 'dg.flow.' + k, { c: '' }); if (i < 2) g.line(x + 184, 218, x + 194, 218, C.mute, { arrow: 1 }); });
  } };
  return { W: 340, H: 572, draw(g) {
    P.forEach(([k, col], i) => { const y = 10 + i * 62;
      lbox(g, 10, y, 90, 46, col, 'dg.flow.' + k, { c: col === C.cyan ? 'c' : col === C.violet ? 'v' : 'g' });
      g.text(112, y + 23, 'dg.flow.' + k + '.d', { w: 220, va: 'mid', c: 'm' });
      if (i < 4) g.line(55, y + 47, 55, y + 60, C.mute, { arrow: 1 }); });
    g.text(112, 334, 'dg.flow.acpi', { c: 'g' }); g.text(112, 358, 'dg.flow.rt', { c: 'c' });
    g.text(10, 398, 'dg.flow.legacy', { weight: 600 });
    ['l1', 'l2', 'l3'].forEach((k, i) => { const y = 416 + i * 52; lbox(g, 10, y, 320, 42, C.mute, 'dg.flow.' + k, { c: '' }); });
  } };
};

// ch6: the ACPI tables
DG.acpi = (L) => {
  const wide = L === 'w', K = [['fadt', C.gold], ['madt', C.cyan], ['mcfg', C.violet], ['more', C.mute]];
  if (wide) return { W: 720, H: 266, draw(g) {
    lbox(g, 16, 88, 160, 46, C.gold, 'dg.acpi.rsdp', { c: 'g' });
    lbox(g, 216, 88, 160, 46, C.gold, 'dg.acpi.xsdt', { c: 'g' });
    g.line(178, 111, 214, 111, C.mute, { arrow: 1 });
    K.forEach(([k, col], i) => { const y = 10 + i * 54; lbox(g, 420, y, 168, 46, col, 'dg.acpi.' + k, { c: col === C.cyan ? 'c' : col === C.violet ? 'v' : col === C.gold ? 'g' : 'm', dash: k === 'more' ? '5 4' : 'none' }); g.line(378, 111, 418, y + 23, C.mute, { arrow: 1 }); });
    lbox(g, 604, 10, 106, 46, C.gold, 'dg.acpi.dsdt', { c: 'g' }); g.line(590, 33, 602, 33, C.mute, { arrow: 1 });
    g.text(360, 246, 'dg.acpi.hdr', { a: 'middle', c: 'm' });
  } };
  return { W: 340, H: 440, draw(g) {
    lbox(g, 10, 10, 320, 40, C.gold, 'dg.acpi.rsdp', { c: 'g' });
    g.line(170, 51, 170, 64, C.mute, { arrow: 1 });
    lbox(g, 10, 66, 320, 40, C.gold, 'dg.acpi.xsdt', { c: 'g' });
    const rows = [['fadt', 40, C.gold], ['dsdt', 70, C.gold], ['madt', 40, C.cyan], ['mcfg', 40, C.violet], ['more', 40, C.mute]];
    g.line(24, 107, 24, 120 + 4 * 52 + 20, C.mute, { sw: 1.4 });
    rows.forEach(([k, x, col], i) => { const y = 120 + i * 52; lbox(g, x, y, 330 - x, 42, col, 'dg.acpi.' + k, { c: col === C.cyan ? 'c' : col === C.violet ? 'v' : col === C.gold ? 'g' : 'm', dash: k === 'more' ? '5 4' : 'none' });
      if (k === 'dsdt') g.line(54, y - 8, 54, y + 21, C.mute, { sw: 1.4 }), g.line(54, y + 21, x - 2, y + 21, C.mute, { arrow: 1 }); else g.line(24, y + 21, x - 2, y + 21, C.mute, { arrow: 1 }); });
    g.text(10, 412, 'dg.acpi.hdr', { c: 'm', w: 320 });
  } };
};

// ch7: the GPT layout on a 64 GiB disk (numbers from the model)
DG.gpt = (L) => {
  const wide = L === 'w', d = M.gptBuild(M.GPT.diskGiB[M.GPT.defDisk], M.GPT.espMiB[M.GPT.defEsp]);
  const v = { e: String(d.arrLba + 1), s: String(d.espStart), last: String(d.last) };
  const B = [['mbr', C.mute], ['hdr', C.gold], ['arr', C.gold], ['esp', C.cyan], ['root', C.cyan], ['barr', C.gold], ['bhdr', C.gold]];
  const cls = col => col === C.cyan ? 'c' : col === C.gold ? 'g' : 'm';
  if (wide) return { W: 720, H: 200, draw(g) {
    const xs = [10, 114, 182, 282, 398, 524, 606, 712];
    B.forEach(([k, col], i) => lbox(g, xs[i] + 1, 46, xs[i + 1] - xs[i] - 2, 78, col, 'dg.gpt.' + k, { c: cls(col), vars: v, a: k === 'esp' ? 0.24 : undefined }));
    g.text(340, 18, 'dg.gpt.efi', { a: 'middle', c: 'c' }); g.line(340, 28, 340, 44, C.cyan, { arrow: 1 });
    g.line(62, 126, 62, 146, C.mute); g.text(10, 158, 'dg.gpt.ee', { w: 200, c: 'm' });
    g.line(198, 126, 260, 146, C.gold); g.text(246, 158, 'dg.gpt.crc', { w: 300, c: 'g' });
  } };
  return { W: 340, H: 448, draw(g) {
    B.forEach(([k, col], i) => lbox(g, 10, 10 + i * 42, 320, 36, col, 'dg.gpt.' + k, { c: cls(col), vars: v, a: k === 'esp' ? 0.24 : undefined }));
    g.text(10, 316, 'dg.gpt.ee', { w: 320, c: 'm' }); g.text(10, 362, 'dg.gpt.crc', { w: 320, c: 'g' }); g.text(10, 408, 'dg.gpt.efi', { w: 320, c: 'c' });
  } };
};

// ch8: the keys and the chain of trust
DG.chain = (L) => {
  const wide = L === 'w';
  if (wide) return { W: 720, H: 336, draw(g) {
    g.box(8, 8, 704, 96, C.violet, { a: 0.05, dash: '5 4' }); g.text(22, 26, 'dg.chain.nv', { c: 'm' });
    g.line(560, 26, 600, 26, C.mute, { dash: '5 4' }); g.text(608, 26, 'dg.chain.upd', { c: 'm' });
    lbox(g, 22, 44, 136, 44, C.violet, 'dg.chain.pk', { c: 'v' });
    lbox(g, 186, 44, 128, 44, C.violet, 'dg.chain.kek', { c: 'v' });
    lbox(g, 342, 44, 156, 44, C.green, 'dg.chain.db', { c: 'n' });
    lbox(g, 526, 44, 176, 44, C.red, 'dg.chain.dbx', { c: 'r' });
    g.line(160, 66, 184, 66, C.mute, { dash: '5 4', arrow: 1 }); g.line(316, 66, 340, 66, C.mute, { dash: '5 4', arrow: 1 });
    g.line(250, 90, 250, 98, C.mute, { dash: '3 3' }); g.line(250, 98, 612, 98, C.mute, { dash: '3 3' }); g.line(612, 98, 612, 90, C.mute, { dash: '3 3', arrow: 1 });
    const lx = 30, lw = 300, rx = 400, rw = 290;
    lbox(g, lx, 132, lw, 46, C.gold, 'dg.chain.shim', { c: 'g' });
    lbox(g, lx, 204, lw, 46, C.gold, 'dg.chain.grub', { c: 'g' });
    lbox(g, lx, 276, lw, 46, C.cyan, 'dg.chain.kernel', { c: 'c' });
    lbox(g, rx, 132, rw, 46, C.gold, 'dg.chain.bootmgr', { c: 'g' });
    lbox(g, rx, 204, rw, 46, C.cyan, 'dg.chain.winkrnl', { c: 'c' });
    lbox(g, rx, 276, rw, 46, C.violet, 'dg.chain.mok', { c: 'v', dash: '5 4' });
    g.line(380, 106, 200, 130, C.green, { arrow: 1 }); g.line(460, 106, 540, 130, C.green, { arrow: 1 });
    g.line(180, 180, 180, 202, C.gold, { arrow: 1 }); g.line(180, 252, 180, 274, C.gold, { arrow: 1 }); g.line(545, 180, 545, 202, C.gold, { arrow: 1 });
    g.line(398, 299, 334, 299, C.violet, { dash: '5 4', arrow: 1 });
  } };
  return { W: 340, H: 540, draw(g) {
    g.box(4, 4, 332, 132, C.violet, { a: 0.05, dash: '5 4' }); g.text(12, 20, 'dg.chain.nv', { c: 'm' }); g.text(328, 20, 'dg.chain.upd', { a: 'end', c: 'm' });
    lbox(g, 12, 36, 150, 42, C.violet, 'dg.chain.pk', { c: 'v' }); lbox(g, 178, 36, 150, 42, C.violet, 'dg.chain.kek', { c: 'v' });
    lbox(g, 12, 86, 150, 42, C.green, 'dg.chain.db', { c: 'n' }); lbox(g, 178, 86, 150, 42, C.red, 'dg.chain.dbx', { c: 'r' });
    g.line(164, 57, 176, 57, C.mute, { dash: '4 3', arrow: 1 });
    const x = 28, w = 302;
    lbox(g, x, 158, w, 44, C.gold, 'dg.chain.shim', { c: 'g' });
    lbox(g, x, 218, w, 44, C.gold, 'dg.chain.grub', { c: 'g' });
    lbox(g, x, 278, w, 44, C.cyan, 'dg.chain.kernel', { c: 'c' });
    lbox(g, x, 338, w, 44, C.violet, 'dg.chain.mok', { c: 'v', dash: '5 4' });
    lbox(g, x, 412, w, 44, C.gold, 'dg.chain.bootmgr', { c: 'g' });
    lbox(g, x, 472, w, 44, C.cyan, 'dg.chain.winkrnl', { c: 'c' });
    g.line(87, 130, 87, 156, C.green, { arrow: 1 });
    poly(g, [[16, 130], [16, 434], [26, 434]], C.green, { sw: 1.6, arrow: 1 });
    g.line(179, 204, 179, 216, C.gold, { arrow: 1 }); g.line(179, 264, 179, 276, C.gold, { arrow: 1 }); g.line(179, 458, 179, 470, C.gold, { arrow: 1 });
    g.line(250, 336, 250, 324, C.violet, { dash: '4 3', arrow: 1 });
  } };
};

// ch9: revoking by hash list vs by generation number
DG.revoke = (L) => {
  const wide = L === 'w', n = String(M.SRC.sigOwner + M.SRC.sha256);
  const hashes = ['IMG.grubOld', 'IMG.bootmgrOld', 'IMG.shimOld'].map((k, i) => M.hex(M.sha256('dbx-example-' + i), 6) + '…');
  if (wide) return { W: 720, H: 214, draw(g) {
    g.text(14, 18, 'dg.revoke.dbx', { weight: 600, c: 'r' });
    lbox(g, 14, 34, 330, 34, C.red, 'dg.revoke.entry', { vars: { n }, c: '' });
    hashes.forEach((h, i) => lbox(g, 14, 74 + i * 34, 330, 28, C.red, { raw: h }, { mono: true, c: 'm' }));
    g.text(14, 192, 'dg.revoke.full', { c: 'm' });
    g.text(380, 18, 'dg.revoke.sbat', { weight: 600, c: 'v' });
    lbox(g, 380, 34, 150, 40, C.violet, 'dg.revoke.level', { mono: true, c: 'v' });
    lbox(g, 380, 100, 326, 40, C.red, 'dg.revoke.img1', { c: 'r' });
    lbox(g, 380, 152, 326, 40, C.green, 'dg.revoke.img2', { c: 'n' });
  } };
  return { W: 340, H: 420, draw(g) {
    g.text(10, 14, 'dg.revoke.dbx', { weight: 600, c: 'r' });
    lbox(g, 10, 30, 320, 46, C.red, 'dg.revoke.entry', { vars: { n }, c: '' });
    hashes.forEach((h, i) => lbox(g, 10, 82 + i * 32, 320, 26, C.red, { raw: h }, { mono: true, c: 'm' }));
    g.text(10, 194, 'dg.revoke.full', { c: 'm' });
    g.text(10, 236, 'dg.revoke.sbat', { weight: 600, c: 'v' });
    lbox(g, 10, 252, 150, 40, C.violet, 'dg.revoke.level', { mono: true, c: 'v' });
    lbox(g, 10, 306, 320, 44, C.red, 'dg.revoke.img1', { c: 'r' });
    lbox(g, 10, 360, 320, 44, C.green, 'dg.revoke.img2', { c: 'n' });
  } };
};

// ch10: one PCR extended step by step (the hex values are real SHA-256 extends of the labels)
DG.pcr = (L) => {
  const wide = L === 'w', ms_ = ['m1', 'm2', 'm3'];
  let v = new Uint8Array(32); const vals = ms_.map(k => { v = M.sha256(cat(v, M.sha256(t('dg.pcr.' + k)))); return M.hex(v, 3) + '…'; });
  if (wide) return { W: 720, H: 250, draw(g) {
    lbox(g, 10, 112, 150, 50, C.mute, 'dg.pcr.zero', { c: 'm' });
    ms_.forEach((k, i) => { const x = 196 + i * 180;
      lbox(g, x, 14, 150, 48, C.violet, 'dg.pcr.' + k, { c: 'v' });
      g.line(x + 75, 64, x + 75, 118, C.violet, { arrow: 1 });
      g.circle(x + 75, 137, 16, C.gold); g.text(x + 75, 137, { raw: 'H' }, { a: 'middle', c: 'g', weight: 700 });
      g.text(x + 120, 160, { raw: vals[i] }, { a: 'middle', mono: true, c: 'm', fs: 13 });
      g.line(i ? x - 89 : 162, 137, x + 57, 137, C.gold, { arrow: 1 }); });
    g.line(647, 137, 706, 137, C.gold, { arrow: 1 });
    g.text(10, 200, 'dg.pcr.op', { c: 'g', mono: true });
    g.text(710, 200, 'dg.pcr.final', { a: 'end', c: 'g' });
    g.text(10, 230, 'dg.pcr.oneway', { c: 'm' });
  } };
  return { W: 340, H: 440, draw(g) {
    lbox(g, 10, 10, 320, 40, C.mute, 'dg.pcr.zero', { c: 'm' });
    g.line(50, 52, 50, 330, C.gold, { arrow: 1 });
    ms_.forEach((k, i) => { const y = 96 + i * 82;
      lbox(g, 140, y - 22, 190, 44, C.violet, 'dg.pcr.' + k, { c: 'v' });
      g.line(138, y, 70, y, C.violet, { arrow: 1 });
      g.circle(50, y, 16, C.gold); g.text(50, y, { raw: 'H' }, { a: 'middle', c: 'g', weight: 700 });
      g.text(74, y + 32, { raw: vals[i] }, { mono: true, c: 'm', fs: 13 }); });
    g.text(10, 352, 'dg.pcr.op', { c: 'g', mono: true, w: 320 });
    g.text(10, 386, 'dg.pcr.final', { c: 'g' });
    g.text(10, 414, 'dg.pcr.oneway', { c: 'm' });
  } };
};
const cat = (a, b) => { const o = new Uint8Array(a.length + b.length); o.set(a); o.set(b, a.length); return o; };

// ch11: INIT-SIPI-SIPI (SDM Vol. 3A §11.4, Table 11-1), not to scale
DG.sipi = (L) => {
  const wide = L === 'w';
  if (wide) return { W: 720, H: 300, draw(g) {
    const B = 210, A = 510;
    lbox(g, B - 90, 8, 180, 36, C.gold, 'dg.sipi.bsp', { c: 'g' }); lbox(g, A - 90, 8, 180, 36, C.cyan, 'dg.sipi.ap', { c: 'c' });
    g.line(B, 46, B, 290, C.line, { sw: 2 }); g.line(A, 46, A, 290, C.line, { sw: 2 });
    g.text(A + 12, 64, 'dg.sipi.wait', { c: 'c' });
    const msg = (y, k, col, back) => { g.line(back ? A - 2 : B + 2, y, back ? B + 2 : A - 2, y, col, { arrow: 1 }); g.text((A + B) / 2, y - 12, k, { a: 'middle', c: col === C.green ? 'n' : 'g' }); };
    msg(92, 'dg.sipi.init', C.gold); g.text(B - 12, 120, 'dg.sipi.w1', { a: 'end', c: 'm' });
    msg(150, 'dg.sipi.sipi', C.gold); g.text(B - 12, 176, 'dg.sipi.w2', { a: 'end', c: 'm' });
    msg(204, 'dg.sipi.sipi2', C.gold);
    g.text(A + 12, 150, 'dg.sipi.start', { c: 'c', w: 196, va: 'mid' });
    g.text(A + 12, 210, 'dg.sipi.modes', { c: 'c', w: 196, va: 'mid' });
    msg(268, 'dg.sipi.alive', C.green, true);
  } };
  return { W: 340, H: 400, draw(g) {
    const B = 70, A = 270, mid = 170;
    lbox(g, 6, 8, 128, 40, C.gold, 'dg.sipi.bsp', { c: 'g' }); lbox(g, 206, 8, 128, 40, C.cyan, 'dg.sipi.ap', { c: 'c' });
    g.line(B, 50, B, 390, C.line, { sw: 2 }); g.line(A, 50, A, 390, C.line, { sw: 2 });
    const msg = (y, k, col, back) => { g.line(back ? A - 2 : B + 2, y, back ? B + 2 : A - 2, y, col, { arrow: 1 }); g.text(mid, y - 12, k, { a: 'middle', c: col === C.green ? 'n' : 'g' }); };
    g.text(mid, 70, 'dg.sipi.wait', { a: 'middle', c: 'c' });
    msg(108, 'dg.sipi.init', C.gold); g.text(mid, 130, 'dg.sipi.w1', { a: 'middle', c: 'm' });
    msg(170, 'dg.sipi.sipi', C.gold); g.text(mid, 192, 'dg.sipi.w2', { a: 'middle', c: 'm' });
    msg(232, 'dg.sipi.sipi2', C.gold);
    g.text(mid, 262, 'dg.sipi.start', { a: 'middle', c: 'c', w: 186, va: 'top' });
    g.text(mid, 306, 'dg.sipi.modes', { a: 'middle', c: 'c', w: 186, va: 'top' });
    msg(372, 'dg.sipi.alive', C.green, true);
  } };
};

// ch12: Arm Trusted Firmware stages and Apple's boot chain
DG.arm = (L) => {
  const wide = L === 'w', T = [['bl1', C.violet], ['bl2', C.gold], ['bl31', C.gold], ['bl33', C.gold], ['os', C.cyan]], AP = [['rom', C.violet], ['llb', C.gold], ['iboot', C.gold], ['krnl', C.cyan]];
  const cls = col => col === C.cyan ? 'c' : col === C.violet ? 'v' : 'g';
  if (wide) return { W: 720, H: 282, draw(g) {
    g.text(10, 16, 'dg.arm.tfa', { weight: 600 });
    T.forEach(([k, col], i) => { const x = 10 + i * 142; lbox(g, x, 34, 128, 54, col, 'dg.arm.' + k, { c: cls(col) });
      if (k !== 'os') g.text(x + 64, 104, 'dg.arm.' + k + 'e', { a: 'middle', c: 'm', w: 128 });
      if (i < 4) g.line(x + 130, 61, x + 140, 61, C.mute, { arrow: 1 }); });
    g.text(10, 158, 'dg.arm.apple', { weight: 600 });
    const xs = [[10, 222], [256, 124], [414, 124], [572, 138]];
    AP.forEach(([k, col], i) => { const [x, w] = xs[i]; lbox(g, x, 176, w, 50, col, 'dg.arm.' + k, { c: cls(col) }); if (i < 3) g.line(x + w + 2, 201, xs[i + 1][0] - 2, 201, C.mute, { arrow: 1 }); });
    g.text(360, 256, 'dg.arm.verify', { a: 'middle', c: 'v' });
  } };
  return { W: 340, H: 560, draw(g) {
    g.text(10, 14, 'dg.arm.tfa', { weight: 600 });
    T.forEach(([k, col], i) => { const y = 30 + i * 52; lbox(g, 10, y, 190, 42, col, 'dg.arm.' + k, { c: cls(col) });
      if (k !== 'os') g.text(212, y + 21, 'dg.arm.' + k + 'e', { c: 'm', w: 122, va: 'mid' });
      if (i < 4) g.line(105, y + 43, 105, y + 50, C.mute); });
    g.text(10, 312, 'dg.arm.apple', { weight: 600 });
    AP.forEach(([k, col], i) => { const y = 328 + i * 52; lbox(g, 10, y, 320, 42, col, 'dg.arm.' + k, { c: cls(col) }); if (i < 3) g.line(170, y + 43, 170, y + 50, C.mute); });
    g.text(170, 544, 'dg.arm.verify', { a: 'middle', c: 'v' });
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

// hex dumps: 16 bytes a row on wide screens, 8 on narrow ones
const narrowMQ = matchMedia('(max-width:640px)'), perRow = () => (narrowMQ.matches ? 8 : 16);
const hexHooks = [];
narrowMQ.addEventListener('change', () => hexHooks.forEach(f => f()));

/* ───────── 01 power-on sequencing ───────── */
(() => {
  const cv = $('#pwCv'), sR = $('#pwRamp'), sV = $('#pwSet'), sT = $('#pwT3');
  const opts = () => ({ ramp: +sR.value, set33: 3 + 0.02 * +sV.value, t3: 10 * +sT.value });
  // piecewise time axis: 0–40 ms takes 45 % of the width so the ramps are visible next to T3
  const XB = 40, XM = 400, KB = 0.45;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = opts(), r = M.powerOn(o);
    const f = frame(w, h, [26, 14, 40, 46], 0, 1, -0.3, 1.15);
    const X = tm => f.L + (f.R - f.L) * (tm <= XB ? KB * tm / XB : KB + (1 - KB) * (Math.min(tm, XM) - XB) / (XM - XB));
    // the narrowest window across the three rails, as a fraction of nominal
    const lo = Math.max(...r.rails.map(q => q.vmin / q.vnom)), hi = Math.min(...r.rails.map(q => q.vmax / q.vnom));
    c.fillStyle = 'rgba(163,170,184,.14)'; c.fillRect(f.L, f.Y(hi), f.R - f.L, f.Y(lo) - f.Y(hi));
    yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100, 0) + '%');
    c.fillStyle = C.mute; spacedTicks(c, [0, 10, 20, 30, 40, 100, 200, 300, 400].map(v => [X(v), fmt(v, 0)]), f.B + 12, w);
    c.strokeStyle = C.line; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(XB), f.T); c.lineTo(X(XB), f.B); c.stroke(); c.setLineDash([]);
    axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch1.cv.band'), f.R - 4, f.Y(hi) - 9);
    const cols = [C.gold, C.cyan, C.violet];
    r.rails.forEach((q, i) => { const pts = [], ts = []; for (let k = 0; k <= 80; k++) ts.push(XB * k / 80); for (let k = 1; k <= 40; k++) ts.push(XB + (XM - XB) * k / 40);
      ts.forEach(tm => pts.push([tm, q.v(tm) / q.vnom])); path(c, pts, X, f.Y, cols[i], 2); });
    // PWR_OK as a logic trace in the bottom strip
    const yl = f.Y(-0.22), yh = f.Y(-0.08), tOk = r.pwrOk;
    c.strokeStyle = C.green; c.lineWidth = 2.4; c.beginPath(); c.moveTo(X(0), yl);
    if (tOk != null && tOk <= XM) { c.lineTo(X(tOk), yl); c.lineTo(X(tOk), yh); c.lineTo(X(XM), yh); } else c.lineTo(X(XM), yl);
    c.stroke();
    c.fillStyle = C.green; c.textAlign = 'left';
    const lab = t('ch1.cv.ok'), lw = c.measureText(lab).width;
    if (tOk != null && tOk <= XM) { const lx = X(tOk) + 6; c.fillText(lab, lx + lw > f.R ? X(tOk) - lw - 6 : lx, yh - 10); }
    else c.fillText(lab, f.L + 6, yl - 10);
  } });
  function text() {
    const o = opts(), r = M.powerOn(o), A = M.SRC.atx;
    put('#pwRampo', ms(o.ramp, 0)); put('#pwSeto', t('u.v', { v: fmt(o.set33, 2) })); put('#pwT3o', ms(o.t3, 0));
    put('#pwT1', r.allOk ? ms(r.T1, 1) : t('u.never')); put('#pwT2', r.allOk ? ms(r.T2max, 1) : t('u.none'));
    put('#pwOk', r.allOk ? ms(r.pwrOk, 1) : t('u.never')); put('#pwV', r.ok ? t('u.ok') : t('u.bad'));
    $('#pwV').className = r.ok ? 'n' : 'r'; $('#pwOk').className = r.allOk ? 'n' : 'r';
    const z = M.say.power(r);
    putHTML('#pwSay', t(z.key, { t1: ms(r.T1 || 0, 1), t3: ms(o.t3, 0), ok: ms(r.pwrOk || 0, 1), v: t('u.v', { v: fmt(o.set33, 2) }), vmin: fmt(A.rails[2][2], 2), t2: ms(r.T2max || 0, 1), t2max: fmt(A.t2[1], 0), t3min: fmt(A.t3Req[0], 0), t3max: fmt(A.t3Req[1], 0), t1max: fmt(A.t1Req, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sR, sV, sT].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 02 the reset vector ───────── */
(() => {
  const ip = $('#rvIp');
  function text() {
    const mib = +radioVal('rvF'), mode = radioVal('rvM'), v = M.parseIp(ip.value), rv = M.resetVector(mib), S = M.SRC.sdm;
    const top = 0x100000000, size = mib * 1048576;
    if (v == null) {
      ['#rvLin', '#rvWin', '#rvOff', '#rvOne'].forEach(s => put(s, t('u.none'))); put('#rvCalc', '');
      putHTML('#rvSay', t(M.say.reset(mode, false).key)); return;
    }
    const lin = M.fetchAddr(mode, v), hx = (x, n) => '0x' + x.toString(16).toUpperCase().padStart(n || 8, '0');
    const inFlash = lin >= top - size;
    put('#rvCalc', t(mode === 'reset' ? 'ch2.calc.reset' : 'ch2.calc.far', { sel: hx(S.csSel, 4), base: hx(mode === 'reset' ? S.csBase : S.csSel * 16, mode === 'reset' ? 8 : 5), ip: hx(v, 4), lin: hx(lin, mode === 'reset' ? 8 : 5) }));
    put('#rvLin', hx(lin, mode === 'reset' ? 8 : 5));
    put('#rvWin', mode === 'reset' ? t('u.bytes', { v: fmt(top - lin, 0) }) : t('u.none'));
    put('#rvOff', mode === 'reset' && inFlash ? hx(size - (top - lin)) : t('u.none'));
    put('#rvOne', lin < rv.oneMiB ? t('ch2.one.yes') : t('ch2.one.no'));
    const z = M.say.reset(mode, true);
    putHTML('#rvSay', t(z.key, { lin: hx(lin, mode === 'reset' ? 8 : 5), mib: fmt(mib, 0), off: hx(size - (top - lin)), left: fmt(top - lin, 0), sel: hx(S.csSel, 4) }));
  }
  onAll(radios('rvF'), 'change', text); onAll(radios('rvM'), 'change', text); ip.addEventListener('input', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 03 SPI flash reads ───────── */
(() => {
  const cv = $('#spCv'), sF = $('#spF');
  const cmd = () => radioVal('spC'), mhz = () => M.SPI.clocks[+sF.value], size = () => +radioVal('spS');
  const sizeLab = b => t(b === 64 ? 'ch3.s.64' : b === 4096 ? 'ch3.s.4096' : 'ch3.s.img');
  const tStr = s => s >= 0.1 ? sec(s, 2) : s >= 1e-4 ? ms(s * 1e3, 2) : us(s * 1e6, 2);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), b = size();
    const rows = M.SPI.order.map(k => ({ k, r: M.spiRead(k, mhz(), b), c: M.SPI.cmds[k] }));
    const max = Math.max(...rows.map(x => x.r.clk));
    const labs = rows.map(x => x.k + 'h'), lf = labelFont(c, labs, 60);
    const Lx = lf.w, R = w - 10, T = 8, B = h - 6, rh = (B - T) / rows.length;
    const tws = Math.max(...rows.map(x => c.measureText(tStr(x.r.s)).width)), k = (R - Lx - tws - 10) / max;
    rows.forEach((x, i) => {
      const y = T + i * rh + rh / 2, bh = Math.min(18, rh * 0.56), hi = x.k === cmd();
      c.font = lf.font; c.textAlign = 'right'; c.fillStyle = hi ? C.gold : C.ink; c.fillText(labs[i], Lx - 8, y); c.font = FONT;
      // bar length is the clock count; the time label after it
      const txt = tStr(x.r.s);
      let xx = Lx;
      [[x.c.ins, C.violet], [x.c.addr, C.cyan], [x.c.mode + x.c.dummy, C.dimfill], [x.r.data, C.gold]].forEach(([n, col]) => { if (!n) return; const ww = Math.max(1.5, n * k); c.fillStyle = col === C.dimfill ? '#56607a' : col; c.fillRect(xx, y - bh / 2, ww, bh); xx += ww; });
      if (hi) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(Lx - 2, y - bh / 2 - 2, xx - Lx + 4, bh + 4); }
      c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xx + 6, y);
    });
  } });
  function text() {
    const r = M.spiRead(cmd(), mhz(), size()), img = M.spiRead(cmd(), mhz(), 16777216);
    put('#spFo', t('u.mhz', { v: fmt(mhz(), 0) }));
    put('#spClk', t('u.clk', { v: fmt(r.clk, 0) })); put('#spT', tStr(r.s)); put('#spBw', t('u.mbps', { v: fmt(r.MBps, r.MBps < 10 ? 2 : 1) })); put('#spImg', sec(img.s, 2));
    const z = M.say.spi(r);
    putHTML('#spSay', t(z.key, { fmax: fmt(M.SPI.cmds[cmd()].fmax, 0), f: t('u.mhz', { v: fmt(mhz(), 0) }), clk: t('u.clk', { v: fmt(r.clk, 0) }), share: pct(r.overShare, 0), lanes: fmt(M.SPI.cmds[cmd()].dlanes, 0), over: t('u.clk', { v: fmt(r.over, 0) }), t: tStr(r.s), size: sizeLab(size()) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sF.addEventListener('input', go); onAll(radios('spC'), 'change', go); onAll(radios('spS'), 'change', go);
  text();
})();

/* ───────── 05 the boot timeline ───────── */
(() => {
  const cv = $('#tlCv'), sT = $('#tlTr'), GC = { hw: C.green, fw: C.gold, mem: C.red, os: C.cyan };
  const sc = () => radioVal('tlS'), tr = () => +sT.value;
  const colOf = s => (s.key === 'mem' || s.key === 'img') ? GC.mem : GC[s.group];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), all = M.TL.scenarios.map(k => M.timeline(k, tr()));
    const labs = M.TL.scenarios.map(k => t('ch5.sc.' + k)), lf = labelFont(c, labs, Math.min(150, w * 0.34));
    const max = Math.max(...all.map(r => r.total)), Lx = lf.w, R = w - 10, T = 8, B = h - 40, rh = (B - T) / all.length;
    const X = v => Lx + (R - Lx - 52) * v / max;
    const step = max > 40 ? 10 : max > 16 ? 5 : 2;
    c.fillStyle = C.mute; const ticks = []; for (let v = 0; v <= max; v += step) ticks.push([X(v), fmt(v, 0)]);
    ticks.forEach(([x]) => { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); });
    spacedTicks(c, ticks, B + 12, w);
    c.textAlign = 'right'; c.fillText(t('ch5.cv.x'), R, B + 30);
    all.forEach((r, i) => {
      const y = T + i * rh + rh / 2, bh = Math.min(24, rh * 0.62), hi = r.sc === sc();
      c.font = lf.font; c.textAlign = 'right'; c.fillStyle = hi ? C.gold : C.ink; const ls = lf.lines.get(labs[i]) || [labs[i]]; ls.forEach((l, j) => c.fillText(l, Lx - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
      for (const s of r.segs) {
        const x0 = X(s.start), x1 = X(s.start + s.dur); c.fillStyle = colOf(s); c.globalAlpha = hi ? 1 : 0.55; c.fillRect(x0, y - bh / 2, Math.max(1, x1 - x0 - 1), bh); c.globalAlpha = 1;
        if (hi) { const lab = t('ch5.st.' + s.key), lw = c.measureText(lab).width; if (lw + 6 < x1 - x0) { c.fillStyle = C.bg; c.textAlign = 'center'; c.fillText(lab, (x0 + x1) / 2, y); } }
      }
      if (hi) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(Lx - 2, y - bh / 2 - 2, X(r.total) - Lx + 4, bh + 4); }
      c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(fmt(r.total, 1), X(r.total) + 6, y);
    });
  } });
  function text() {
    const r = M.timeline(sc(), tr());
    put('#tlTro', sec(tr(), 0)); put('#tlTot', sec(r.total, 1)); put('#tlFw', sec(r.fw, 1) + ' · ' + pct(r.fwShare, 0));
    put('#tlBig', t('ch5.st.' + r.biggest) + ' · ' + sec(r.biggestDur, 1));
    const z = M.say.timeline(sc());
    putHTML('#tlSay', t(z.key, { train: sec(tr(), 0), share: pct(r.trainShare, 0), total: sec(r.total, 1), fw: pct(r.fwShare, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sT.addEventListener('input', go); onAll(radios('tlS'), 'change', go);
  text();
})();

/* ───────── 06 the MADT and its checksum ───────── */
(() => {
  const sN = $('#acN'), cb = $('#acBad');
  function text() {
    const n = M.MADT.cores[+sN.value], r = M.madt(n, cb.checked), b = r.bytes, SHOW = 80;
    put('#acNo', fmt(n, 0));
    let s = '';
    for (let i = 0; i < Math.min(SHOW, b.length); i++) {
      const hx = b[i].toString(16).toUpperCase().padStart(2, '0'), cls = i === 9 ? 'h' : i < 36 ? 'm' : (cb.checked && i === 47) ? 'r' : '';
      s += (cls ? `<span class="${cls}">${hx}</span>` : hx) + (i % perRow() === perRow() - 1 ? '\n' : ' ');
    }
    if (b.length > SHOW) s += '\n' + esc(t('ch6.hex.more', { n: fmt(b.length - SHOW, 0) }));
    putHTML('#acHex', s);
    put('#acLen', t('u.bytes', { v: fmt(r.len, 0) })); put('#acSum', '0x' + r.checksum.toString(16).toUpperCase().padStart(2, '0'));
    put('#acOk', fmt(r.sum, 0) + ' · ' + (r.ok ? t('u.ok') : t('u.bad'))); $('#acOk').className = r.ok ? 'n' : 'r';
    put('#acCores', t('ch6.cores', { n: fmt(r.cores.length, 0) }));
    const z = M.say.madt(r);
    putHTML('#acSay', t(z.key, { n: fmt(n, 0), len: fmt(r.len, 0), sum: '0x' + r.checksum.toString(16).toUpperCase().padStart(2, '0'), rem: fmt(r.sum, 0) }));
  }
  sN.addEventListener('input', text); cb.addEventListener('change', text); hexHooks.push(text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 07 the GPT parser ───────── */
(() => {
  const fx = $('#gpFix'), bo = $('#gpBoth');
  const FIELD = { sig: [0, 1], guid: [56, 57], mylba: [24, 25] };
  function text() {
    const di = +radioVal('gpD'), edit = radioVal('gpE');
    const d0 = M.gptBuild(M.GPT.diskGiB[di], M.GPT.espMiB[M.GPT.defEsp]), d = M.gptEdit(d0, edit, fx.checked, bo.checked), r = M.gptParse(d), h = d.primary;
    let s = '';
    for (let i = 0; i < h.length; i++) {
      const hx = h[i].toString(16).toUpperCase().padStart(2, '0'), f = FIELD[edit];
      const cls = f && i >= f[0] && i < f[1] ? 'h' : (i >= 16 && i < 20) ? 'g' : (i >= 88 && i < 92) ? 'c' : i < 8 ? 'm' : '';
      s += (cls ? `<span class="${cls}">${hx}</span>` : hx) + (i % perRow() === perRow() - 1 ? '\n' : ' ');
    }
    putHTML('#gpHex', s);
    put('#gpCrc', M.h8(r.P.calc)); $('#gpCrc').className = r.P.stored === r.P.calc ? 'n' : 'r';
    put('#gpArr', M.h8(r.P.arrCalc)); $('#gpArr').className = r.P.arrStored === r.P.arrCalc ? 'n' : 'r';
    put('#gpUse', t(r.use ? 'ch7.use.' + r.use : 'ch7.use.none')); $('#gpUse').className = r.use === 'primary' ? 'n' : r.use ? 'g' : 'r';
    put('#gpEsp', r.esp ? t('ch7.esp', { s: fmt(r.esp.start, 0), e: fmt(r.esp.end, 0) }) : t('ch7.esp.none'));
    const why = r.P.why.map(k => t('ch7.why.' + k)).join(t('ch7.why.sep'));
    const z = M.say.gpt(r, edit, fx.checked);
    putHTML('#gpSay', t(z.key, { n: fmt(r.parts.length, 0), s: r.esp ? fmt(r.esp.start, 0) : '', last: fmt(d.last, 0), why }));
  }
  onAll(radios('gpD'), 'change', text); onAll(radios('gpE'), 'change', text); fx.addEventListener('change', text); bo.addEventListener('change', text); hexHooks.push(text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 08 the Secure Boot chain ───────── */
(() => {
  const on = $('#sbOn'), dbx = $('#sbDbx'), mok = $('#sbMok');
  const opts = () => ({ shim: radioVal('sbH'), grub: radioVal('sbG'), kernel: radioVal('sbK'), sbat: +radioVal('sbP'), sb: on.checked, dbx: dbx.checked, mok: mok.checked });
  const label = { shim: 'ch8.i.shim', shimOld: 'ch8.i.shimOld' };
  function text() {
    const o = opts(), r = M.chain(o), names = [label[o.shim], 'ch8.i.' + o.grub, 'ch8.i.' + o.kernel].map(k => t(k));
    const imgs = [M.IMG[o.shim], o.grub === 'grubTampered' ? M.tamper(M.IMG.grub) : M.IMG[o.grub], M.IMG[o.kernel]];
    let html = '';
    for (let i = 0; i < 3; i++) {
      const st = r.steps[i], who = t('ch8.who.' + ['fw', 'shim', 'grub'][i], { img: names[i] });
      const hh = M.hex(M.sha256(imgs[i].bytes), 8);
      if (!st) { html += `<li class="skip"><b>${esc(who)}</b><small>${esc(t('ch8.step.skip'))}</small></li>`; continue; }
      const sub = imgs[i].by ? t('ch8.step.hash', { h: hh, signer: t('ch8.signer.' + imgs[i].by) }) : t('ch8.step.nosig', { h: hh });
      html += `<li class="${st.ok ? 'ok' : 'bad'}">${esc(t('ch8.step.res', { who, why: t('ch8.why.' + st.why) }))}<small>${esc(sub)}</small></li>`;
    }
    putHTML('#sbSteps', html);
    put('#sbStop', t(r.stopAt == null ? 'ch8.stop.none' : 'ch8.stop.' + r.stopAt)); $('#sbStop').className = r.booted ? 'n' : 'r';
    put('#sbHash', M.hex(M.sha256(imgs[1].bytes), 4));
    const z = M.say.chain(r), st = r.stopAt != null ? r.steps[r.stopAt] : null;
    putHTML('#sbSay', t(z.key, { who: st ? t('ch8.who.' + st.who, { img: names[r.stopAt] }) : '', gen: st && st.gen != null ? fmt(st.gen, 0) : '', min: fmt(o.sbat, 0) }));
  }
  [...radios('sbH'), ...radios('sbG'), ...radios('sbK'), ...radios('sbP')].forEach(e => e.addEventListener('change', text));
  [on, dbx, mok].forEach(e => e.addEventListener('change', text));
  reg([], { draw() {}, text }); text();
})();

/* ───────── 09 revocation ───────── */
(() => {
  const sN = $('#rkN'), db23 = $('#rk23');
  function text() {
    const sc = radioVal('rkS'), meth = M.REV.methods[sc];
    // the method buttons follow the scenario: SBAT is a shim mechanism, a certificate revocation is Microsoft's route
    radios('rkM').forEach(e => { const show = meth.includes(e.value); e.closest('label').hidden = !show; e.disabled = !show; });
    if (!meth.includes(radioVal('rkM'))) radios('rkM').find(e => e.value === 'none').checked = true;
    db23.closest('label').hidden = sc !== 'windows'; db23.disabled = sc !== 'windows';
    const m = radioVal('rkM'), n = M.REV.builds[+sN.value], r = M.revoke(sc, m, n, db23.checked);
    put('#rkNo', fmt(n, 0));
    const row = (k, x) => `<tr><td>${esc(t('ch9.row.' + k))}</td><td class="${x.ok ? 'y' : 'n'}">${esc(x.ok ? t('u.yes') : t('u.no'))}${x.ok ? '' : `<small class="om">${esc(t('ch8.why.' + x.why))}</small>`}</td></tr>`;
    putHTML('#rkTbl', `<thead><tr><th>${esc(t('ch9.tbl.file'))}</th><th>${esc(t('ch9.tbl.res'))}</th></tr></thead><tbody>${row('old', r.old)}${row('sibling', r.sibling)}${row('cur', r.cur)}${row('media', r.media)}</tbody>`);
    put('#rkAdd', r.added ? fmt(r.added, 0) : (r.extra ? r.extra : t('u.none')));
    put('#rkBytes', r.bytes ? t('u.bytes', { v: fmt(r.bytes, 0) }) : t('u.none')); put('#rkShare', r.bytes ? pct(r.share, 0) : t('u.none'));
    const z = M.say.revoke(r);
    putHTML('#rkSay', t(z.key, { n: fmt(n, 0), bytes: t('u.bytes', { v: fmt(r.bytes, 0) }) }));
  }
  [...radios('rkS'), ...radios('rkM')].forEach(e => e.addEventListener('change', text)); sN.addEventListener('input', text); db23.addEventListener('change', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 10 PCR extend ───────── */
(() => {
  function text() {
    const tp = radioVal('pcT'), pol = radioVal('pcP'), ref = M.pcrRun('none').pcr, now = M.pcrRun(tp).pcr, u = M.unseal(pol, tp);
    let g = `<thead><tr><th>${esc(t('ch10.tbl.pcr'))}</th><th>${esc(t('ch10.tbl.what'))}</th><th>${esc(t('ch10.tbl.ref'))}</th><th>${esc(t('ch10.tbl.now'))}</th></tr></thead><tbody>`;
    for (const b of M.PCR.banks) { const ch = ref[b] !== now[b], used = u.use.includes(b);
      g += `<tr${ch ? ' class="odd"' : ''}><td class="${used ? 'y' : ''}">${b}</td><td>${esc(t('ch10.w.' + b))}</td><td class="mono">${ref[b].slice(0, 8)}</td><td class="mono ${ch ? 'n' : ''}">${now[b].slice(0, 8)}</td></tr>`; }
    putHTML('#pcTbl', g + '</tbody>');
    const chg = u.changed.length ? u.changed.join(t('ch7.why.sep')) : t('ch10.chg.none');
    put('#pcChg', chg); put('#pcDiff', fmt(M.diffDigits(ref[0], now[0]), 0) + ' / 64');
    put('#pcUn', t(u.ok ? 'ch10.un.yes' : 'ch10.un.no')); $('#pcUn').className = u.ok ? 'n' : 'r';
    const z = M.say.pcr(pol, tp);
    putHTML('#pcSay', t(z.key, { chg, use: u.use.join(t('ch7.why.sep')) }));
  }
  [...radios('pcT'), ...radios('pcP')].forEach(e => e.addEventListener('change', text));
  reg([], { draw() {}, text }); text();
})();

/* ───────── 11 waking the other cores ───────── */
(() => {
  const cv = $('#mpCv'), sN = $('#mpN'), Ns = M.SMP.threads;
  const lg = x => Math.log10(Math.max(x, 0.1));
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [28, 16, 42, 52], 0, Ns.length - 1, lg(1), lg(10000));
    yTicks(c, f, [1, 10, 100, 1000, 10000].map(lg), v => fmt(Math.pow(10, v), 0)); axes(c, f, t('ch11.cv.x'), t('ch11.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, Ns.map((k, i) => [f.X(i), fmt(k, 0)]), f.B + 12, w);
    const i = +sN.value;
    lineChart(c, f, [
      { pts: Ns.map((n, j) => [j, lg(M.bringup(n).serial)]), col: C.red, hi: true, dot: [i, lg(M.bringup(Ns[i]).serial)] },
      { pts: Ns.map((n, j) => [j, lg(M.bringup(n).parallel)]), col: C.green, hi: true, dot: [i, lg(M.bringup(Ns[i]).parallel)] }]);
    const m = Ns.indexOf(M.SRC.smp.threads); c.strokeStyle = C.mute; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(f.X(m), f.T); c.lineTo(f.X(m), f.B); c.stroke(); c.setLineDash([]);
  } });
  function text() {
    const n = Ns[+sN.value], r = M.bringup(n);
    put('#mpNo', fmt(n, 0)); put('#mpSer', ms(r.serial, r.serial < 10 ? 1 : 0)); put('#mpPar', ms(r.parallel, r.parallel < 10 ? 1 : 0)); put('#mpX', t('u.x', { v: fmt(r.ratio, 1) }));
    const z = M.say.smp(n);
    putHTML('#mpSay', t(z.key, { n: fmt(n, 0), ser: ms(r.serial, r.serial < 10 ? 1 : 0), par: ms(r.parallel, r.parallel < 10 ? 1 : 0), x: t('u.x', { v: fmt(r.ratio, 1) }), ap: fmt(r.ap, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go);
  text();
})();

/* ───────── loop ───────── */
function lineChart(c, f, series) { for (const s of series) { path(c, s.pts, f.X, f.Y, s.col, s.hi ? 2.6 : 1.8, s.dash); if (s.dot) dot(c, f.X(s.dot[0]), f.Y(s.dot[1]), s.col, 5); } }
applyLang();
function tick() {
  for (const s of sims) { if (!s.vis) continue; if (s.dirty) { s.draw(); s.dirty = false; } }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
void reduce;
window.__essayReady = true;
})();
