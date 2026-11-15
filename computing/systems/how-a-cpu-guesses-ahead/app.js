/* How a CPU guesses ahead: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.GuessModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';

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
const cyc = (x, d) => t('u.cyc', { v: fmt(x, d == null ? (x < 10 && x % 1 ? 1 : 0) : d) });
const PROSE = M.prose();
function proseVars() { const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : fmt(v, d); return o; }
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
function bars(c, w, h, rows, max, hiIdx, min) {
  min = min || 0;
  const labs = rows.map(r => r[0]).filter(Boolean), lf = labelFont(c, labs.length ? labs : [''], Math.min(170, w * 0.36));
  const L = lf.w, R = w - 10, T = 10, B = h - 10, rh = (B - T) / rows.length, X = v => L + (R - L) * (Math.min(v, max) - min) / (max - min);
  rows.forEach(([lab, v, col, txt], i) => {
    const y = T + i * rh + rh / 2, bh = Math.min(22, rh * 0.62);
    if (lab) { c.font = lf.font; c.textAlign = 'right'; c.fillStyle = i === hiIdx ? C.gold : C.ink; const ls = lf.lines.get(lab) || [lab]; ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT; }
    c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
    if (v > min) { c.fillStyle = col; c.fillRect(L, y - bh / 2, Math.max(1.5, X(v) - L), bh); }
    if (i === hiIdx) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L - 0.5, y - bh / 2 - 0.5, R - L + 1, bh + 1); }
    if (txt) {
      let tw = c.measureText(txt).width; const xe = X(Math.max(v, min));
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
    path(d, col, o) { o = o || {}; S('path', { d, fill: 'none', stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; S('circle', { cx, cy, r, fill: o.solid ? col : tint(col, 0.14), stroke: col, 'stroke-width': o.sw || 1.6 }, svg); },
    // text: key (or {raw}), position, options: a = start|middle|end, c = colour class, w = wrap width, vars
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, o.vars);
      const e = S('text', { x, y, 'font-size': o.fs || FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: (o.c || '') + (o.mono ? ' mono' : '') }, svg);
      e.textContent = s; if (o.w) { e.dataset.w = o.w; e.dataset.va = o.va || 'top'; } if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    }
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
    const toks = cjk ? s.match(/[A-Za-z0-9_.,%+×–\-/()\[\]:]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; let lines = [], cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}
const DG = {};
// two-bit saturating counter (ch2)
DG.fsm = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 240 : 430;
  return { W, H, draw(g) {
    const cols = [C.red, C.red, C.green, C.green], names = ['dg.fsm.s0', 'dg.fsm.s1', 'dg.fsm.s2', 'dg.fsm.s3'], cls = ['r', 'r', 'n', 'n'];
    if (L === 'w') {
      const X = i => 50 + i * 170, y = 90, bw = 110, bh = 60;
      for (let i = 0; i < 4; i++) { g.box(X(i), y, bw, bh, cols[i]); g.text(X(i) + bw / 2, y + 20, { raw: String(i) }, { a: 'middle', mono: 1, fs: 17, weight: 700, c: cls[i] }); g.text(X(i) + bw / 2, y + 42, names[i], { a: 'middle', fs: 13.5 }); }
      for (let i = 0; i < 3; i++) { const x1 = X(i) + bw, x2 = X(i + 1); g.line(x1 + 2, y + 18, x2 - 3, y + 18, C.green, { arrow: 1 }); g.line(x2 - 2, y + 44, x1 + 3, y + 44, C.red, { arrow: 1 }); g.text((x1 + x2) / 2, y - 6, 'dg.fsm.t', { a: 'middle', c: 'n' }); g.text((x1 + x2) / 2, y + bh + 14, 'dg.fsm.n', { a: 'middle', c: 'r' }); }
      g.path(`M ${X(3) + bw} ${y + 14} C ${X(3) + bw + 42} ${y - 4}, ${X(3) + bw + 42} ${y + 46}, ${X(3) + bw + 3} ${y + 40}`, C.green, { arrow: 1 }); g.text(X(3) + bw + 22, y - 24, 'dg.fsm.t', { a: 'middle', c: 'n' });
      g.path(`M ${X(0)} ${y + 46} C ${X(0) - 42} ${y + 64}, ${X(0) - 42} ${y + 14}, ${X(0) - 3} ${y + 20}`, C.red, { arrow: 1 }); g.text(X(0) - 22, y + bh + 26, 'dg.fsm.n', { a: 'middle', c: 'r' });
      g.line(X(0), 196, X(1) + bw, 196, C.red); g.line(X(2), 196, X(3) + bw, 196, C.green);
      g.text((X(0) + X(1) + bw) / 2, 216, 'dg.fsm.pn', { a: 'middle', c: 'r' }); g.text((X(2) + X(3) + bw) / 2, 216, 'dg.fsm.pt', { a: 'middle', c: 'n' });
    } else {
      const Y = i => 24 + i * 96, x = 92, bw = 150, bh = 56;
      for (let i = 0; i < 4; i++) { g.box(x, Y(i), bw, bh, cols[i]); g.text(x + 24, Y(i) + bh / 2, { raw: String(i) }, { a: 'middle', mono: 1, fs: 17, weight: 700, c: cls[i] }); g.text(x + 44, Y(i) + bh / 2, names[i], { fs: 13.5, w: 100, va: 'mid' }); }
      for (let i = 0; i < 3; i++) { const y1 = Y(i) + bh, y2 = Y(i + 1); g.line(x + bw - 30, y1 + 2, x + bw - 30, y2 - 3, C.green, { arrow: 1 }); g.line(x + 30, y2 - 2, x + 30, y1 + 3, C.red, { arrow: 1 }); g.text(x + bw - 20, (y1 + y2) / 2, 'dg.fsm.t', { c: 'n' }); g.text(x + 20, (y1 + y2) / 2, 'dg.fsm.n', { a: 'end', c: 'r' }); }
      g.path(`M ${x + bw} ${Y(3) + 12} C ${x + bw + 40} ${Y(3) - 4}, ${x + bw + 40} ${Y(3) + 60}, ${x + bw + 3} ${Y(3) + 44}`, C.green, { arrow: 1 }); g.text(x + bw + 44, Y(3) + 28, 'dg.fsm.t', { c: 'n' });
      g.path(`M ${x} ${Y(0) + 44} C ${x - 40} ${Y(0) + 60}, ${x - 40} ${Y(0) - 4}, ${x - 3} ${Y(0) + 12}`, C.red, { arrow: 1 }); g.text(x - 44, Y(0) + 28, 'dg.fsm.n', { a: 'end', c: 'r' });
      g.line(x + bw + 22, Y(0) + 70, x + bw + 22, Y(1) + bh, C.red); g.line(x + bw + 22, Y(2), x + bw + 22, Y(3) - 10, C.green);
      g.text(x + bw + 30, Y(1) - 8, 'dg.fsm.pn', { c: 'r', w: 70, va: 'mid' }); g.text(x + bw + 30, Y(2) + 22, 'dg.fsm.pt', { c: 'n', w: 70, va: 'mid' });
    }
  } };
};
// gshare (ch3): the bits are an example, the XOR is computed
DG.gs = (L) => {
  const pc = 0x2D3, gh = 0x1BB, ix = pc ^ gh, bits = v => v.toString(2).padStart(10, '0');
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 300 : 470;
  return { W, H, draw(g) {
    const rows = ['01', '11', '10', '00', '11', '01', '10', '11'], hi = 2;
    if (L === 'w') {
      g.text(20, 28, 'dg.gs.pc', { c: 'c' }); g.box(20, 42, 270, 38, C.cyan); g.text(155, 61, { raw: bits(pc).split('').join(' ') }, { a: 'middle', mono: 1 });
      g.text(20, 108, 'dg.gs.ghr', { c: 'v' }); g.box(20, 122, 270, 38, C.violet); g.text(155, 141, { raw: bits(gh).split('').join(' ') }, { a: 'middle', mono: 1 });
      g.line(290, 61, 340, 92, C.cyan, { arrow: 1 }); g.line(290, 141, 340, 110, C.violet, { arrow: 1 });
      g.circle(360, 101, 18, C.mute); g.text(360, 101, { raw: '⊕' }, { a: 'middle', fs: 18 }); g.text(360, 136, 'dg.gs.xor', { a: 'middle', c: 'm' });
      g.line(378, 101, 408, 101, C.mute, { arrow: 1 });
      g.text(410, 68, 'dg.gs.idx', { c: 'g' }); g.box(410, 82, 130, 38, C.gold); g.text(475, 101, { raw: bits(ix) }, { a: 'middle', mono: 1 });
      g.line(540, 101, 588, 20 + hi * 26 + 13, C.gold, { arrow: 1 });
      g.text(645, 12, 'dg.gs.table', { a: 'middle', c: 'm' });
      rows.forEach((r, i) => { g.box(600, 26 + i * 26, 90, 22, i === hi ? C.gold : C.dimfill, { a: i === hi ? 0.2 : 0.5, rx: 4 }); g.text(645, 37 + i * 26, { raw: r }, { a: 'middle', mono: 1, c: i === hi ? 'g' : 'm' }); });
      g.text(645, 250, 'dg.gs.pred', { a: 'middle', c: 'g' });
      g.text(20, 210, 'dg.gs.upd', { w: 540, c: 'm' });
    } else {
      g.text(10, 14, 'dg.gs.pc', { c: 'c' }); g.box(10, 26, 320, 36, C.cyan); g.text(170, 44, { raw: bits(pc).split('').join(' ') }, { a: 'middle', mono: 1 });
      g.text(10, 84, 'dg.gs.ghr', { c: 'v' }); g.box(10, 96, 320, 36, C.violet); g.text(170, 114, { raw: bits(gh).split('').join(' ') }, { a: 'middle', mono: 1 });
      g.line(170, 132, 170, 144, C.mute); g.circle(170, 162, 18, C.mute); g.text(170, 162, { raw: '⊕' }, { a: 'middle', fs: 18 }); g.text(196, 162, 'dg.gs.xor', { c: 'm' });
      g.line(170, 180, 170, 206, C.mute, { arrow: 1 });
      g.text(10, 222, 'dg.gs.idx', { c: 'g' }); g.box(90, 210, 160, 36, C.gold); g.text(170, 228, { raw: bits(ix) }, { a: 'middle', mono: 1 });
      g.line(170, 246, 170, 268, C.gold, { arrow: 1 });
      g.text(10, 290, 'dg.gs.table', { c: 'm', w: 100 });
      rows.slice(0, 5).forEach((r, i) => { g.box(125, 272 + i * 26, 90, 22, i === hi ? C.gold : C.dimfill, { a: i === hi ? 0.2 : 0.5, rx: 4 }); g.text(170, 283 + i * 26, { raw: r }, { a: 'middle', mono: 1, c: i === hi ? 'g' : 'm' }); });
      g.text(230, 283 + hi * 26, 'dg.gs.pred', { c: 'g' });
      g.text(10, 420, 'dg.gs.upd', { w: 320, c: 'm' });
    }
  } };
};
// TAGE (ch4): history lengths from the model
DG.tage = (L) => {
  const lens = M.tageLengths(M.TAGE.M, M.TAGE.Lmin, M.TAGE.Lmax), hit = [true, false, true, false], prov = 2;
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 310 : 420;
  return { W, H, draw(g) {
    if (L === 'w') {
      g.box(20, 120, 110, 44, C.violet); g.text(75, 142, 'dg.tage.pc', { a: 'middle', c: 'v', w: 96, va: 'mid' });
      const tx = 170, tw = 250, ys = [20, 70, 120, 170, 220], th = 38;
      g.box(tx, ys[0], tw, th, C.mute, { a: 0.08 }); g.text(tx + 10, ys[0] + th / 2, 'dg.tage.t0', { w: tw - 16, va: 'mid' });
      for (let i = 0; i < 4; i++) {
        const y = ys[i + 1], on = hit[i], isP = i === prov;
        g.box(tx, y, tw, th, isP ? C.gold : on ? C.cyan : C.dimfill, { a: isP ? 0.2 : on ? 0.14 : 0.45 });
        g.text(tx + 10, y + th / 2, 'dg.tage.ti', { vars: { i: i + 1, L: lens[i] }, c: isP ? 'g' : '' });
        g.text(tx + tw + 12, y + th / 2, on ? 'dg.tage.hit' : 'dg.tage.miss', { c: on ? (isP ? 'g' : 'c') : 'm' });
      }
      for (const y of ys) g.line(130, 142, tx - 2, y + th / 2, C.line, { sw: 1.2 });
      g.box(560, 140, 150, 60, C.gold); g.text(635, 170, 'dg.tage.pick', { a: 'middle', c: 'g', w: 136, va: 'mid' });
      g.line(tx + tw + 92, ys[prov + 1] + th / 2, 558, 166, C.gold, { arrow: 1 }); g.line(tx + tw + 92, ys[1] + th / 2, 558, 152, C.cyan, { dash: '4 4' });
      g.text(20, 285, 'dg.tage.entry', { c: 'm' });
    } else {
      g.box(10, 10, 320, 34, C.violet); g.text(170, 27, 'dg.tage.pc', { a: 'middle', c: 'v' });
      const tx = 10, tw = 236, th = 40, ys = [60, 110, 160, 210, 260];
      g.box(tx, ys[0], tw, th, C.mute, { a: 0.08 }); g.text(tx + 8, ys[0] + th / 2, 'dg.tage.t0', { w: tw - 14, va: 'mid' });
      for (let i = 0; i < 4; i++) {
        const y = ys[i + 1], on = hit[i], isP = i === prov;
        g.box(tx, y, tw, th, isP ? C.gold : on ? C.cyan : C.dimfill, { a: isP ? 0.2 : on ? 0.14 : 0.45 });
        g.text(tx + 8, y + th / 2, 'dg.tage.ti', { vars: { i: i + 1, L: lens[i] }, c: isP ? 'g' : '' });
        g.text(tx + tw + 8, y + th / 2, on ? 'dg.tage.hit' : 'dg.tage.miss', { c: on ? (isP ? 'g' : 'c') : 'm', w: 80, va: 'mid' });
      }
      g.line(170, ys[4] + th + 2, 170, 326, C.gold, { arrow: 1 });
      g.box(40, 330, 260, 46, C.gold); g.text(170, 353, 'dg.tage.pick', { a: 'middle', c: 'g', w: 240, va: 'mid' });
      g.text(10, 400, 'dg.tage.entry', { c: 'm', w: 320 });
    }
  } };
};
// the front end in one cycle (ch5)
DG.btb = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 320 : 470;
  return { W, H, draw(g) {
    if (L === 'w') {
      g.box(20, 116, 110, 48, C.gold); g.text(75, 140, 'dg.btb.pc', { a: 'middle', c: 'g', w: 96, va: 'mid' });
      const bx = 180, bw = 280, rows = [[40, 'dg.btb.btb', C.cyan, 'c'], [116, 'dg.btb.dir', C.violet, 'v'], [192, 'dg.btb.ras', C.green, 'n']];
      rows.forEach(([y, k, col, c]) => { g.box(bx, y, bw, 48, col); g.text(bx + 12, y + 24, k, { c, w: bw - 24, va: 'mid' }); g.line(130, 140, bx - 2, y + 24, C.mute, { arrow: 1 }); });
      g.text(bx, 258, 'dg.btb.push', { c: 'm' }); g.text(bx, 280, 'dg.btb.pop', { c: 'm' });
      g.box(510, 100, 100, 80, C.gold); g.text(560, 140, 'dg.btb.mux', { a: 'middle', c: 'g', w: 88, va: 'mid' });
      g.line(bx + bw, 64, 508, 116, C.cyan, { arrow: 1 }); g.line(bx + bw, 140, 508, 140, C.violet, { arrow: 1 }); g.line(bx + bw, 216, 508, 164, C.green, { arrow: 1 });
      g.text(560, 30, 'dg.btb.seq', { a: 'middle', c: 'm' }); g.line(560, 42, 560, 98, C.mute, { arrow: 1 });
      g.box(630, 110, 84, 60, C.gold, { a: 0.24 }); g.text(672, 140, 'dg.btb.next', { a: 'middle', c: 'g', w: 76, va: 'mid' });
      g.line(610, 140, 628, 140, C.gold, { arrow: 1 });
      g.path('M 672 170 L 672 304 L 75 304 L 75 166', C.gold, { arrow: 1, dash: '5 4' });
    } else {
      g.box(100, 8, 140, 40, C.gold); g.text(170, 28, 'dg.btb.pc', { a: 'middle', c: 'g' });
      const rows = [[70, 'dg.btb.btb', C.cyan, 'c'], [130, 'dg.btb.dir', C.violet, 'v'], [190, 'dg.btb.ras', C.green, 'n']];
      g.line(14, 28, 98, 28, C.mute); g.line(14, 28, 14, 214, C.mute);
      rows.forEach(([y, k, col, c]) => { g.box(28, y, 290, 48, col); g.text(40, y + 24, k, { c, w: 270, va: 'mid' }); g.line(14, y + 24, 26, y + 24, C.mute, { arrow: 1 }); });
      g.text(28, 256, 'dg.btb.push', { c: 'm' }); g.text(28, 278, 'dg.btb.pop', { c: 'm' });
      g.line(318, 94, 330, 94, C.mute); g.line(318, 154, 330, 154, C.mute); g.line(318, 214, 330, 214, C.mute); g.line(330, 94, 330, 330, C.mute); g.line(330, 330, 282, 330, C.mute, { arrow: 1 });
      g.text(170, 304, 'dg.btb.seq', { a: 'middle', c: 'm' }); g.line(170, 314, 170, 326, C.mute, { arrow: 1 });
      g.box(60, 328, 220, 44, C.gold); g.text(170, 350, 'dg.btb.mux', { a: 'middle', c: 'g' });
      g.line(170, 372, 170, 392, C.gold, { arrow: 1 });
      g.box(90, 394, 160, 40, C.gold, { a: 0.24 }); g.text(170, 414, 'dg.btb.next', { a: 'middle', c: 'g' });
      g.path('M 90 414 L 4 414 L 4 4 L 166 4', C.gold, { dash: '5 4' });
    }
  } };
};
// renaming removes WAR and WAW (ch7)
DG.ren = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 330 : 570;
  const before = ['lw   t0, 0(a0)', 'mul  t2, t0, t1', 'lw   t0, 0(a0)', 'mul  t2, t0, t1'], after = ['lw   p40, (p31)', 'mul  p42, p40, p41', 'lw   p48, (p47)', 'mul  p50, p48, p49'];
  return { W, H, draw(g) {
    const panel = (x0, y0, w, title, ins, showFalse, labels) => {
      g.box(x0, y0, w, 226, C.mute, { a: 0.04 }); g.text(x0 + 12, y0 + 18, title, { c: 'm', weight: 600 });
      const ry = [y0 + 58, y0 + 96, y0 + 156, y0 + 194], tx = x0 + (labels ? 86 : 16);
      if (labels) { g.text(x0 + 12, ry[0], 'dg.ren.it1', { c: 'm' }); g.text(x0 + 12, ry[2], 'dg.ren.it2', { c: 'm' }); }
      ins.forEach((s, i) => g.text(tx, ry[i], { raw: s }, { mono: 1, c: i % 2 ? '' : 'c' }));
      const ax = x0 + w - 74;
      g.line(ax, ry[0] + 9, ax, ry[1] - 9, C.green, { arrow: 1 }); g.line(ax, ry[2] + 9, ax, ry[3] - 9, C.green, { arrow: 1 });
      if (showFalse) { g.line(ax + 26, ry[1] + 9, ax + 26, ry[2] - 9, C.red, { arrow: 1, dash: '5 4' }); g.line(ax + 52, ry[0] + 9, ax + 52, ry[2] - 9, C.violet, { arrow: 1, dash: '5 4' }); }
    };
    const legend = (x, y, dy, vertical) => {
      [['dg.ren.raw', C.green, ''], ['dg.ren.war', C.red, '5 4'], ['dg.ren.waw', C.violet, '5 4']].forEach(([k, col, dash], i) => {
        const xx = vertical ? x : x + i * 230, yy = vertical ? y + i * dy : y;
        g.line(xx, yy, xx + 30, yy, col, { dash: dash || 'none' }); g.text(xx + 38, yy, k, { c: 'm' });
      });
    };
    if (L === 'w') { panel(20, 20, 330, 'dg.ren.before', before, true, true); panel(370, 20, 330, 'dg.ren.after', after, false, false); legend(20, 286, 0, false); }
    else { panel(10, 10, 320, 'dg.ren.before', before, true, true); panel(10, 252, 320, 'dg.ren.after', after, false, true); legend(10, 498, 24, true); }
  } };
};
// an out-of-order core (ch7)
DG.ooo = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 410 : 448;
  return { W, H, draw(g) {
    const G = (x, y, w, h, k, col, c) => { g.box(x, y, w, h, col); g.text(x + w / 2, y + h / 2, k, { a: 'middle', c, w: w - 12, va: 'mid' }); };
    if (L === 'w') {
      g.box(20, 8, 14, 12, C.gold, { rx: 3 }); g.text(40, 14, 'dg.ooo.inord', { c: 'm' }); g.box(170, 8, 14, 12, C.cyan, { rx: 3 }); g.text(190, 14, 'dg.ooo.ooo', { c: 'm' });
      G(20, 36, 130, 54, 'dg.ooo.fe', C.gold, 'g'); G(176, 36, 80, 54, 'dg.ooo.dec', C.gold, 'g'); G(282, 36, 170, 54, 'dg.ooo.ren', C.gold, 'g'); G(478, 36, 222, 54, 'dg.ooo.rob', C.gold, 'g');
      g.line(150, 63, 174, 63, C.gold, { arrow: 1 }); g.line(256, 63, 280, 63, C.gold, { arrow: 1 }); g.line(452, 63, 476, 63, C.gold, { arrow: 1 });
      G(282, 130, 170, 46, 'dg.ooo.iq', C.cyan, 'c'); g.line(367, 90, 367, 128, C.cyan, { arrow: 1 });
      const ux = [140, 236, 332, 448], uw = [86, 86, 106, 86], uk = ['dg.ooo.alu', 'dg.ooo.mul', 'dg.ooo.ld', 'dg.ooo.br'];
      ux.forEach((x, i) => { G(x, 226, uw[i], 44, uk[i], C.cyan, 'c'); g.line(367, 176, x + uw[i] / 2, 224, C.cyan, { arrow: 1 }); });
      G(332, 296, 106, 40, 'dg.ooo.lsq', C.cyan, 'c'); g.line(385, 270, 385, 294, C.cyan);
      G(560, 222, 140, 48, 'dg.ooo.prf', C.violet, 'v'); g.line(534, 248, 558, 248, C.violet, { arrow: 1 });
      G(560, 120, 140, 46, 'dg.ooo.com', C.gold, 'g'); g.line(630, 90, 630, 118, C.gold, { arrow: 1 });
      g.path('M 491 270 L 491 360 L 85 360 L 85 92', C.red, { arrow: 1, dash: '5 4' }); g.text(110, 384, 'dg.ooo.redirect', { c: 'r' });
    } else {
      g.box(10, 8, 14, 12, C.gold, { rx: 3 }); g.text(30, 14, 'dg.ooo.inord', { c: 'm' }); g.box(170, 8, 14, 12, C.cyan, { rx: 3 }); g.text(190, 14, 'dg.ooo.ooo', { c: 'm' });
      G(10, 32, 150, 46, 'dg.ooo.fe', C.gold, 'g'); G(180, 32, 150, 46, 'dg.ooo.dec', C.gold, 'g'); g.line(160, 55, 178, 55, C.gold, { arrow: 1 });
      G(10, 96, 320, 46, 'dg.ooo.ren', C.gold, 'g'); g.line(255, 78, 255, 94, C.gold, { arrow: 1 });
      G(10, 162, 150, 46, 'dg.ooo.iq', C.cyan, 'c'); G(180, 162, 150, 46, 'dg.ooo.rob', C.gold, 'g'); g.line(85, 142, 85, 160, C.cyan, { arrow: 1 }); g.line(255, 142, 255, 160, C.gold, { arrow: 1 });
      // the four units side by side in hardware, stacked here: the queue feeds them through one bus on the left
      const uy = [226, 270, 314, 358];
      ['dg.ooo.alu', 'dg.ooo.mul', 'dg.ooo.ld', 'dg.ooo.br'].forEach((k, i) => { G(34, uy[i], 126, 36, k, C.cyan, 'c'); g.line(20, uy[i] + 18, 32, uy[i] + 18, C.cyan, { arrow: 1 }); g.line(160, uy[i] + 18, 170, uy[i] + 18, C.violet); });
      g.line(20, 208, 20, uy[3] + 18, C.cyan); g.line(170, uy[0] + 18, 170, uy[3] + 18, C.violet);
      G(180, 226, 150, 36, 'dg.ooo.com', C.gold, 'g'); g.line(255, 208, 255, 224, C.gold, { arrow: 1 });
      G(180, 270, 150, 36, 'dg.ooo.prf', C.violet, 'v'); g.line(170, 288, 178, 288, C.violet, { arrow: 1 });
      G(180, 314, 150, 36, 'dg.ooo.lsq', C.cyan, 'c'); g.line(170, 332, 178, 332, C.violet);
      g.line(97, 394, 97, 408, C.red, { arrow: 1, dash: '3 3' });
      g.text(34, 424, 'dg.ooo.redirect', { c: 'r', w: 296 });
    }
  } };
};
// the reorder buffer as a ring (ch8): head at 3, tail at 10
DG.rob = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 290 : 400;
  const kind = i => (i === 3 ? 'miss' : i === 4 || i === 5 ? 'done' : i === 6 ? 'br' : i >= 7 && i <= 9 ? 'sq' : i === 10 || i < 3 || i > 10 ? 'free' : 'wait');
  const sty = { miss: [C.red, 0.2], done: [C.green, 0.2], br: [C.violet, 0.22], sq: [C.red, 0.06], wait: [C.cyan, 0.14], free: [C.dimfill, 0.35] };
  return { W, H, draw(g) {
    const slot = (x, y, w, i) => { const k = kind(i), [col, a] = sty[k]; g.box(x, y, w, 44, col, { a, rx: 6, dash: k === 'sq' ? '4 3' : 'none', sw: k === 'br' ? 2.4 : 1.4 }); g.text(x + w / 2, y + 22, { raw: String(i) }, { a: 'middle', mono: 1, c: k === 'free' ? 'm' : '' }); };
    const legend = (x, y, dx, dy, cols) => [['done', 'dg.rob.done'], ['wait', 'dg.rob.wait'], ['miss', 'dg.rob.miss'], ['br', 'dg.rob.br'], ['sq', 'dg.rob.squash']].forEach(([k, key], i) => {
      const xx = x + (i % cols) * dx, yy = y + Math.floor(i / cols) * dy, [col, a] = sty[k]; g.box(xx, yy - 8, 16, 16, col, { a: a + 0.1, rx: 3, dash: k === 'sq' ? '3 2' : 'none' }); g.text(xx + 24, yy, key, { c: 'm' }); });
    if (L === 'w') {
      const X = i => 40 + i * 54, y = 100;
      for (let i = 0; i < 12; i++) slot(X(i), y, 48, i);
      g.text(X(3) + 24, 56, 'dg.rob.head', { a: 'middle', c: 'c' }); g.line(X(3) + 24, 68, X(3) + 24, 96, C.cyan, { arrow: 1 });
      g.text(X(10) + 24, 196, 'dg.rob.tail', { a: 'middle', c: 'g' }); g.line(X(10) + 24, 184, X(10) + 24, 148, C.gold, { arrow: 1 });
      g.line(X(7), 88, X(9) + 48, 88, C.red); g.text(X(8) + 24, 74, 'dg.rob.squash', { a: 'middle', c: 'r' });
      g.path(`M ${X(11) + 48} 122 C ${X(11) + 76} 122, ${X(11) + 76} 168, ${X(11) + 30} 168 L ${X(0) + 18} 168 C ${X(0) - 26} 168, ${X(0) - 26} 122, ${X(0) - 3} 122`, C.mute, { arrow: 1, dash: '3 4' });
      legend(40, 246, 136, 0, 5);
    } else {
      const X = i => 18 + (i % 6) * 52, Y = i => (i < 6 ? 80 : 170);
      for (let i = 0; i < 12; i++) slot(X(i), Y(i), 46, i);
      g.text(X(3) + 23, 40, 'dg.rob.head', { a: 'middle', c: 'c' }); g.line(X(3) + 23, 52, X(3) + 23, 76, C.cyan, { arrow: 1 });
      g.text(X(10) + 23, 252, 'dg.rob.tail', { a: 'end', c: 'g' }); g.line(X(10) + 23, 240, X(10) + 23, 218, C.gold, { arrow: 1 });
      g.text(X(8) + 23, 146, 'dg.rob.squash', { a: 'middle', c: 'r' });
      g.path(`M ${X(5) + 46} 102 C ${X(5) + 62} 102, ${X(5) + 62} 140, 170 140`, C.mute, { dash: '3 4' }); g.path(`M 120 140 C 4 140, 4 192, ${X(6) - 3} 192`, C.mute, { arrow: 1, dash: '3 4' });
      legend(18, 284, 0, 24, 1);
    }
  } };
};
// Spectre v1 in four steps (ch10)
DG.sp = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 330 : 500;
  return { W, H, draw(g) {
    const step = (x, y, w, h, k, col) => { g.box(x, y, w, h, col); g.text(x + 12, y + h / 2, k, { w: w - 24, va: 'mid' }); };
    const cells = (x, y, cw, hiCell) => { for (let i = 0; i < 16; i++) g.box(x + i * cw, y, cw - 3, 26, i === hiCell ? C.green : C.dimfill, { a: i === hiCell ? 0.35 : 0.45, rx: 3 }); };
    if (L === 'w') {
      step(20, 20, 410, 56, 'dg.sp.s1', C.violet); step(20, 90, 410, 56, 'dg.sp.s2', C.mute); step(20, 160, 410, 70, 'dg.sp.s3', C.gold); step(20, 248, 410, 56, 'dg.sp.s4', C.green);
      g.text(706, 120, 'dg.sp.t', { a: 'end', c: 'm' });
      g.text(450, 146, 'dg.sp.win', { c: 'g' }); g.box(450, 160, 250, 20, C.gold, { a: 0.18, rx: 4 });
      g.box(470, 188, 70, 12, C.cyan, { solid: true, rx: 3 }); g.box(550, 188, 90, 12, C.cyan, { solid: true, rx: 3 });
      g.line(700, 154, 700, 210, C.red, { sw: 2.4 }); g.text(700, 224, 'dg.sp.squash', { a: 'end', c: 'r' });
      g.text(706, 248, 'dg.sp.cache', { a: 'end', c: 'n' }); cells(450, 262, 16, 9); g.text(450, 306, 'dg.sp.fast', { c: 'n' });
      g.line(430, 195, 466, 195, C.gold, { dash: '3 3' });
    } else {
      step(10, 10, 320, 56, 'dg.sp.s1', C.violet); step(10, 76, 320, 52, 'dg.sp.s2', C.mute); step(10, 138, 320, 86, 'dg.sp.s3', C.gold);
      g.text(10, 244, 'dg.sp.win', { c: 'g', w: 240 }); g.text(330, 244, 'dg.sp.t', { a: 'end', c: 'm' });
      g.box(10, 262, 300, 20, C.gold, { a: 0.18, rx: 4 }); g.box(26, 290, 80, 12, C.cyan, { solid: true, rx: 3 }); g.box(116, 290, 100, 12, C.cyan, { solid: true, rx: 3 });
      g.line(310, 256, 310, 308, C.red, { sw: 2.4 }); g.text(330, 324, 'dg.sp.squash', { a: 'end', c: 'r' });
      step(10, 342, 320, 52, 'dg.sp.s4', C.green); cells(10, 406, 20, 9);
      g.text(10, 452, 'dg.sp.fast', { c: 'n' }); g.text(330, 476, 'dg.sp.cache', { a: 'end', c: 'n' });
    }
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

/* ───────── 01 the cost of a wrong guess ───────── */
const ACCS = [0.8, 0.85, 0.9, 0.92, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 0.995, 0.999];
(() => {
  const cv = $('#cpCv'), sW = $('#cpW'), sP = $('#cpP'), sA = $('#cpA');
  const cur = () => ({ width: +sW.value, penalty: +sP.value, acc: ACCS[+sA.value] });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = cur(), f = frame(w, h, [28, 16, 40, 50], 0.8, 1, 0, 1);
    yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0)); axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [0.8, 0.85, 0.9, 0.95, 1].map(a => [f.X(a), pct(a, 0)]), f.B + 11, w);
    const pts = (W, P) => { const a = []; for (let x = 0.8; x <= 1.00001; x += 0.0025) a.push([x, M.cpi({ width: W, penalty: P, acc: Math.min(x, 1) }).lost]); return a; };
    path(c, pts(1, M.COST.a1Pen), f.X, f.Y, C.mute, 1.8, [5, 4]); path(c, pts(o.width, o.penalty), f.X, f.Y, C.gold, 2.6);
    dot(c, f.X(o.acc), f.Y(M.cpi(o).lost), C.gold, 5.5);
  } });
  function text() {
    const o = cur(), z = M.say.cost(o.width, o.penalty, o.acc), v = z.v;
    put('#cpWo', fmt(o.width, 0)); put('#cpPo', cyc(o.penalty, 0)); put('#cpAo', pct(o.acc, o.acc >= 0.995 ? 1 : 0));
    put('#cpCpi', fmt(v.cpi, 2)); put('#cpIpc', fmt(v.ipc, 1)); put('#cpLost', pct(v.lost, 0)); put('#cpSlots', fmt(v.slots, 0));
    putHTML('#cpSay', t(z.key, { acc: pct(o.acc, o.acc >= 0.995 ? 1 : 0), lost: pct(v.lost, 0), ipc: fmt(v.ipc, 1), w: fmt(o.width, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sW, sP, sA].forEach(s => s.addEventListener('input', go));
  $('#cpA1').addEventListener('click', () => { sW.value = 1; sP.value = M.COST.a1Pen; go(); });
  $('#cpZen').addEventListener('click', () => { sW.value = M.ZEN.width; sP.value = M.ZEN.pen; go(); });
  text();
})();

/* ───────── 02 simple predictors on a loop ───────── */
(() => {
  const sK = $('#k2K'), sP = $('#k2P'), K = () => M.LOOPIF.Ks[+sK.value], P = () => M.LOOPIF.ps[+sP.value];
  const memo = new Map(), get = (k, p, kind, keep) => { const key = [k, p, kind, keep || 0].join(); if (!memo.has(key)) memo.set(key, M.simple(k, p, kind, keep)); return memo.get(key); };
  const STRIP = PROSE.strip[0];
  function text() {
    const k = K(), p = P(), kind = radioVal('k2Kind'), r = get(k, p, kind, STRIP), z = M.say.simple(k, p, kind);
    put('#k2Ko', fmt(k, 0)); put('#k2Po', fmt(p, 2));
    put('#k2nt', pct(get(k, p, 'nt').acc, 1)); put('#k2bt', pct(get(k, p, 'btfn').acc, 1)); put('#k2b1', pct(get(k, p, '1bit').acc, 1)); put('#k2b2', pct(get(k, p, '2bit').acc, 1));
    const typ = pc => (pc === 0x1040 ? 'f' : pc === 0x1080 ? 'n' : 'o');
    putHTML('#k2Strip', r.steps.map(s => `<span class="${s.ok ? 'ok' : 'no'}">${s.st == null ? (s.p ? 'T' : 'N') : s.st}<i class="${typ(s.pc)}"></i></span>`).join(''));
    putHTML('#k2Say', t(z.key, { acc: pct(z.v.acc, 1), inner: pct(z.v.inner, 0), fwd: pct(z.v.fwd, 1), p: fmt(p, 2) }));
  }
  [sK, sP].forEach(s => s.addEventListener('input', text)); onAll(radios('k2Kind'), 'change', text);
  reg([], { draw() {}, text }); text();
})();
(() => {
  const cv = $('#soCv'), sD = $('#soD'), bl = $('#soBl'), D = () => M.DISORDER[+sD.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), n = M.DISORDER.length, f = frame(w, h, [28, 16, 40, 50], 0, n - 1, 0, 0.6);
    yTicks(c, f, [0, 0.2, 0.4, 0.6], v => pct(v, 0)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, M.DISORDER.map((d, i) => [f.X(i), pct(d, 0)]), f.B + 11, w);
    path(c, M.DISORDER.map((d, i) => [i, M.sortRun(d).missRate]), f.X, f.Y, C.red, 2.4);
    if (bl.checked) path(c, [[0, 0], [n - 1, 0]], f.X, f.Y, C.green, 2.4, [6, 4]);
    else dot(c, f.X(+sD.value), f.Y(M.sortRun(D()).missRate), C.gold, 5.5);
  } });
  function text() {
    const d = D(), b = bl.checked, z = M.say.sort(d, b), r = z.v, base = M.sortRun(0).cyc, cy = b ? M.branchlessCyc() : r.cyc;
    put('#soDo', pct(d, 0));
    put('#soMiss', b ? t('u.none') : pct(r.missRate, 1)); put('#soCyc', cyc(cy, 2)); put('#soVs', t('u.x', { v: fmt(cy / base, 1) }));
    putHTML('#soSay', t(z.key, { miss: fmt(r.misses, 0), dis: pct(d, 0), rate: pct(r.missRate, 1), cyc: cyc(cy, 2) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sD.addEventListener('input', go); bl.addEventListener('change', go);
  text();
})();

/* ───────── 03 gshare ───────── */
(() => {
  const cv = $('#gsCv'), sH = $('#gsH'), tk = () => radioVal('gsT'), nb = () => +radioVal('gsN');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), T = tk(), n = nb(), hs = []; for (let i = 0; i <= Math.min(10, n); i++) hs.push(i);
    const vals = hs.map(x => M.gshareAcc(T, n, x)), b = M.gshareAcc(T, n, -1), lo = Math.max(0, Math.floor((Math.min(b, ...vals) - 0.05) * 10) / 10);
    const f = frame(w, h, [28, 16, 40, 54], 0, 10, lo, 1);
    const ys = []; for (let v = lo; v <= 1.0001; v += 0.1) ys.push(Math.round(v * 10) / 10);
    yTicks(c, f, ys, v => pct(v, 0)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, hs.map(x => [f.X(x), String(x)]), f.B + 11, w);
    path(c, [[0, b], [10, b]], f.X, f.Y, C.mute, 1.8, [5, 4]); path(c, hs.map((x, i) => [x, vals[i]]), f.X, f.Y, C.gold, 2.6);
    const H = Math.min(+sH.value, n); dot(c, f.X(H), f.Y(M.gshareAcc(T, n, H)), C.gold, 5.5);
  } });
  function text() {
    const T = tk(), n = nb(), H = Math.min(+sH.value, n), z = M.say.gshare(T, n, H), v = z.v;
    put('#gsHo', fmt(H, 0)); put('#gsG', pct(v.g, 1)); put('#gsB', pct(v.b, 1)); put('#gsD', (v.g >= v.b ? '+' : '−') + pct(Math.abs(v.g - v.b), 1));
    putHTML('#gsSay', t(z.key, { h: fmt(H, 0), g: pct(v.g, 1), b: pct(v.b, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sH.addEventListener('input', go); onAll(radios('gsT'), 'change', go); onAll(radios('gsN'), 'change', go);
  text();
})();

/* ───────── 04 TAGE vs the others ───────── */
(() => {
  const cv = $('#cmCv'), B = () => +radioVal('cmB');
  const kb = b => t('u.kbit', { v: fmt(b / 1024, b % 1024 ? 1 : 0) });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), b = B(), rows = [];
    for (const tk of M.CMP_TRACES) { const r = M.compare(tk, b); rows.push(['', r.bimodal, C.mute, pct(r.bimodal, 1)]); rows.push([t('ch4.tr.' + tk), r.gshare, C.cyan, pct(r.gshare, 1)]); rows.push(['', r.tage, C.gold, pct(r.tage, 1)]); }
    bars(c, w, h, rows, 1, -1);
  } });
  function text() {
    const b = B(), z = M.say.compare('mix', b), v = z.v;
    put('#cmRb', pct(v.bimodal, 1)); put('#cmRg', pct(v.gshare, 1)); put('#cmRt', pct(v.tage, 1)); put('#cmBits', kb(v.bits.tage));
    putHTML('#cmSay', t(z.key, { b: kb(b), tr: t('ch4.tr.mix'), t: pct(v.tage, 1), g: pct(v.gshare, 1), bi: pct(v.bimodal, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll(radios('cmB'), 'change', go);
  text();
})();

/* ───────── 05 the return address stack ───────── */
(() => {
  const cv = $('#rsCv'), sD = $('#rsD'), D = () => M.RAS.depths[+sD.value], S0 = () => +radioVal('rsS');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), d = D(), rows = M.RAS.sizes.map(s => { const r = M.rasRun(d, s); return [t('ch5.bar.ras', { n: s }), r.rate, C.gold, pct(r.rate, 1)]; });
    const b = M.rasRun(d, 8).btbRate; rows.push([t('ch5.bar.btb'), b, C.red, pct(b, 0)]);
    bars(c, w, h, rows, Math.max(0.6, b * 1.05), M.RAS.sizes.indexOf(S0()));
  } });
  function text() {
    const d = D(), s = S0(), z = M.say.ras(d, s), v = z.v;
    put('#rsDo', fmt(d, 0)); put('#rsR', pct(v.rate, 1)); put('#rsB', pct(v.btbRate, 0)); put('#rsN', fmt(v.rets, 0));
    putHTML('#rsSay', t(z.key, { d: fmt(d, 0), s: fmt(s, 0), rate: pct(v.rate, 1), btb: pct(v.btbRate, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sD.addEventListener('input', go); onAll(radios('rsS'), 'change', go);
  text();
})();

/* ───────── 06 superscalar ───────── */
(() => {
  const cv = $('#ilCv'), sW = $('#ilW'), W = () => M.WIDTHS[+sW.value], mode = () => radioVal('ilM'), ROWS = PROSE.rows[0];
  const KC = { load: C.cyan, mul: C.red, alu: C.gold, br: C.violet };
  const memo = new Map(), tl = (w, m) => { const k = w + m; if (!memo.has(k)) memo.set(k, M.slotTimeline(w, m, ROWS)); return memo.get(k); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), Wd = W(), rows = tl(Wd, mode()), maxW = 8;
    const L = 46, T = 28, B = h - 34, R = w - 10, rh = (B - T) / ROWS, cw = Math.min(56, (R - L) / maxW);
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch6.cv.y'), 6, 12);
    c.textAlign = 'right'; c.fillText(t('ch6.cv.x'), R, h - 12);
    for (let i = 0; i < ROWS; i++) {
      const y = T + i * rh; c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(String(i + 1), L - 8, y + rh / 2);
      for (let s = 0; s < Wd; s++) { const k = rows[i] ? rows[i].slots[s] : null; c.fillStyle = k ? KC[k] : C.card2; c.fillRect(L + s * cw + 1, y + 1, cw - 3, rh - 3); if (!k) { c.strokeStyle = C.line; c.strokeRect(L + s * cw + 1.5, y + 1.5, cw - 4, rh - 4); } }
    }
  } });
  function text() {
    const Wd = W(), z = M.say.ilp(Wd), v = z.v;
    put('#ilWo', fmt(Wd, 0)); put('#ilIn', fmt(v.inorder, 2)); put('#ilOo', fmt(v.ooo, 2)); put('#ilCap', fmt(Wd, 0));
    putHTML('#ilSay', t(z.key, { w: fmt(Wd, 0), in: fmt(v.inorder, 2), oo: fmt(v.ooo, 2), lat: fmt(M.ZEN.l1, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); onAll(radios('ilM'), 'change', go);
  text();
})();

/* ───────── 07 / 08 the stepped core ───────── */
function stepper(o) {
  const P = o.prefix; let core = null, lastSq = 0, event = null;
  const totals = new Map();
  function reset() { core = o.make(); lastSq = 0; event = null; render(); }
  function chip(x) {
    const e = x.e, c = core.cycle, st = x.ghost ? 'ghost' : x.doneAt <= c ? 'done' : x.issued ? (e.miss ? 'miss' : 'run') : 'wait';
    const dst = x.dst ? '→' + x.dst : '', it = e.it >= 0 ? e.it + 1 : '?';
    const word = st === 'miss' ? t('ch7.st.miss') : t('ch7.st.' + st);
    return `<div role="listitem" class="${st}${x === core.rob[0] ? ' head' : ''}"><b>${it}·${esc(e.op)}${e.rd ? ' ' + e.rd : ''}${dst}</b><i>${esc(word)}</i></div>`;
  }
  function render() {
    const rob = core.rob, c = core.cycle;
    putHTML(P + 'Rob', rob.length ? rob.map(chip).join('') : `<p>${esc(t('ch7.rob.empty'))}</p>`);
    putHTML(P + 'Rat', core.mode === 'ooo' ? `<span class="lbl">${esc(t('ch7.rat.title'))}</span>` + M.REGS.map(r => `<span role="listitem">${r} → <b>${core.rat[r]}</b></span>`).join('') : `<span class="lbl">${esc(t('ch7.rat.none'))}</span>`);
    put(P + 'C', fmt(c, 0)); put(P + 'Com', fmt(core.committed, 0)); put(P + 'Fly', fmt(rob.length, 0));
    if (o.extra) o.extra(core);
    const head = rob[0], PV = { c: fmt(c, 0), com: fmt(core.committed, 0), n: fmt(rob.length, 0), head: head ? esc(head.e.txt) : '', run: fmt(rob.filter(x => x.issued && x.doneAt > c).length, 0), fe: fmt(M.CORE.FE, 0) };
    let key = 'ch7.say.flow';
    if (c === 0) key = 'ch7.say.start';
    else if (core.fault) { key = 'ch7.say.fault'; PV.it = fmt(core.fault.it + 1, 0); PV.com = fmt(core.fault.committed, 0); }
    else if (core.done) { key = 'ch7.say.done'; PV.ipc = fmt(core.committed / Math.max(1, c), 2); }
    else if (event) { key = 'ch8.say.squash'; PV.n = fmt(event, 0); }
    else if (head && head.doneAt > c && rob.length >= core.R) key = 'ch7.say.full';
    else if (head && head.doneAt > c) key = 'ch7.say.stall';
    putHTML(P + 'Say', t(key, PV));
  }
  function adv(n) { for (let i = 0; i < n && !core.done; i++) { core.step(); const sq = core.squashed - lastSq; lastSq = core.squashed; event = sq > 0 && !core.fault ? sq : (i === n - 1 ? null : event); if (sq > 0 && !core.fault) { event = sq; break; } } render(); }
  $(P + 'Step').addEventListener('click', () => adv(1));
  $(P + 'Ten').addEventListener('click', () => adv(10));
  $(P + 'Run').addEventListener('click', () => { let g = 0; while (!core.done && g++ < 100000) core.step(); lastSq = core.squashed; event = null; render(); });
  $(P + 'Reset').addEventListener('click', reset);
  o.inputs.forEach(n => onAll(radios(n), 'change', reset));
  reset();
  return { render, reset, totals, get core() { return core; } };
}
(() => {
  const opts = m => ({ width: 4, rob: +radioVal('c7R'), mode: m, iters: M.STEP.iters, miss: M.STEP.miss[radioVal('c7L')], missEvery: M.STEP.missEvery });
  const total = m => M.coreCached(opts(m)).cycles;
  const st = stepper({ prefix: '#c7', inputs: ['c7M', 'c7R', 'c7L'], make: () => M.makeCore(opts(radioVal('c7M'))),
    extra() { put('#c7Tot', cyc(total(radioVal('c7M')), 0)); putHTML('#c7Totals', t('ch7.totals', { a: fmt(total('inorder'), 0), b: fmt(total('scoreboard'), 0), c: fmt(total('ooo'), 0) })); } });
  reg([], { draw() {}, text: st.render });
})();
(() => {
  const ev = () => radioVal('c8E');
  const opts = () => { const e = ev(); return { width: 4, rob: 16, mode: 'ooo', iters: M.STEP.iters, mispredAt: e === 'mp' ? 2 : undefined, faultAt: e === 'fault' ? 3 : undefined }; };
  const st = stepper({ prefix: '#c8', inputs: ['c8E'], make: () => M.makeCore(opts()), extra(core) { put('#c8Sq', fmt(core.squashed, 0)); } });
  reg([], { draw() {}, text: st.render });
})();

/* ───────── 09 window size ───────── */
(() => {
  const cv = $('#wnCv'), sR = $('#wnR'), R = () => M.WIN.robs[+sR.value], A = () => +radioVal('wnA'), Lk = () => radioVal('wnL');
  const COL = { 1: C.gold, 0.99: C.green, 0.95: C.cyan, 0.9: C.red };
  const run = (r, a) => M.coreCached({ width: M.WIN.width, rob: r, mode: 'ooo', iters: M.WIN.iters, miss: M.STEP.miss[Lk()], acc: a, seed: 77 });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), robs = M.WIN.robs, f = frame(w, h, [28, 16, 40, 44], Math.log2(robs[0]), Math.log2(robs[robs.length - 1]), 0, M.WIN.width);
    yTicks(c, f, [0, 2, 4, 6, 8], v => fmt(v, 0)); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, robs.map(r => [f.X(Math.log2(r)), String(r)]), f.B + 11, w);
    for (const a of M.WIN.accs) path(c, robs.map(r => [Math.log2(r), run(r, a).ipc]), f.X, f.Y, COL[a], a === A() ? 3 : 1.6);
    dot(c, f.X(Math.log2(R())), f.Y(run(R(), A()).ipc), C.gold, 5.5);
  } });
  function text() {
    const r = R(), a = A(), v = run(r, a), btw = M.between(1 / M.BODY.length, a), key = a === 1 ? 'ch9.say.perfect' : 'ch9.say.guess';
    put('#wnRo', fmt(r, 0)); put('#wnI', fmt(v.ipc, 2)); put('#wnM', fmt(v.mlp, 1)); put('#wnB', a === 1 ? t('u.none') : fmt(btw, 0));
    putHTML('#wnSay', t(key, { r: fmt(r, 0), ipc: fmt(v.ipc, 2), mlp: fmt(v.mlp, 1), acc: pct(a, 0), btw: fmt(btw, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sR.addEventListener('input', go); onAll(radios('wnA'), 'change', go); onAll(radios('wnL'), 'change', go);
  text();
})();

/* ───────── 10 the toy Spectre machine ───────── */
(() => {
  const cv = $('#spCv'), sT = $('#spT'), sN = $('#spN'), mit = () => radioVal('spM'), noise = () => M.SPEC.noises[+sN.value];
  let toy = null, k = 0, last = null, got = [];
  function reset() { toy = M.makeToy({ mit: mit(), noise: noise() }); k = 0; got = []; last = null; one(); }
  function one() { if (k >= M.SPEC.secret.length) { k = 0; got = []; } last = toy.readByte(k, +sT.value); got.push(last.guess == null ? null : last.guess); k++; sim.dirty = true; text(); }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), ymax = M.SPEC.miss + 3 * 160, f = frame(w, h, [28, 12, 40, 50], 0, 256, 0, ymax);
    yTicks(c, f, [0, 200, 400, 600, 800], v => fmt(v, 0)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [0, 64, 128, 192, 255].map(v => [f.X(v + 0.5), String(v)]), f.B + 11, w);
    if (last) {
      const bw = Math.max(1, (f.R - f.L) / 256 - 0.3);
      // a fast line is short; a translucent band and its number mark where it is
      if (last.hits.length <= 3) for (const v of last.hits) { c.fillStyle = 'rgba(122,214,160,0.18)'; c.fillRect(f.X(v) - 2, f.T, bw + 4, f.B - f.T); c.fillStyle = C.green; c.textAlign = 'center'; c.fillText(String(v), Math.min(Math.max(f.X(v) + bw / 2, f.L + 12), f.R - 12), f.T + 10); }
      last.times.forEach((tm, v) => { const y = Math.max(f.T, f.Y(Math.max(0, tm))); c.fillStyle = last.hits.includes(v) ? C.green : C.dimfill; c.fillRect(f.X(v), y, bw, f.B - y); });
    }
    c.strokeStyle = C.red; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.L, f.Y(M.SPEC.thr)); c.lineTo(f.R, f.Y(M.SPEC.thr)); c.stroke(); c.setLineDash([]);
    c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(t('ch10.cv.thr'), f.R, f.Y(M.SPEC.thr) - 10);
  } });
  const chr = v => (v >= 32 && v < 127 ? String.fromCharCode(v) : '?');
  function text() {
    put('#spTo', fmt(+sT.value, 0)); put('#spNo', cyc(noise(), 0));
    const cost = M.callCost(mit());
    put('#spCost', cyc(cost, 0));
    if (!last) { put('#spGot', t('u.none')); put('#spStr', t('u.none')); put('#spWin', t('u.none')); putHTML('#spSay', t('ch10.say.start', { train: fmt(+sT.value, 0) })); return; }
    put('#spGot', last.guess == null ? t('u.none') : `${chr(last.guess)} (0x${last.guess.toString(16).toUpperCase()})`);
    put('#spStr', got.map(v => (v == null ? '?' : chr(v))).join('')); put('#spWin', last.window ? cyc(last.window, 0) : t('u.none'));
    const z = M.say.spectre(last, mit(), +sT.value);
    putHTML('#spSay', t(z.key, { k: fmt(k, 0), v: last.guess == null ? (last.hits[0] == null ? '—' : fmt(last.hits[0], 0)) : fmt(last.guess, 0), t: cyc(last.times[last.guess == null ? 0 : last.guess], 0), ch: last.guess == null ? '?' : esc(chr(last.guess)), win: cyc(last.window, 0), h: fmt(last.hits.length, 0), cost: cyc(cost, 0), mask: fmt(M.SPEC.size - 1, 0) }));
  }
  sim.text = text;
  $('#spOne').addEventListener('click', one);
  $('#spAll').addEventListener('click', () => { if (k >= M.SPEC.secret.length) { k = 0; got = []; } while (k < M.SPEC.secret.length) { last = toy.readByte(k, +sT.value); got.push(last.guess); k++; } sim.dirty = true; text(); });
  $('#spReset').addEventListener('click', reset);
  onAll(radios('spM'), 'change', reset); sT.addEventListener('input', reset); sN.addEventListener('input', reset);
  reset();
})();

/* ───────── loop ───────── */
applyLang();
function tick() {
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
