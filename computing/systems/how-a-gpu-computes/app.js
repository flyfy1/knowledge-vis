/* How a GPU computes: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js.
   The canvas, chart and SVG helpers follow how-cpu-caches-work/app.js. */
(() => {
'use strict';
const M = window.GpuModels;
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
let PROSE = null;
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : fmt(v, d); return o; }
const langHooks = [];
function applyLang() {
  const PV = proseVars();
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


/* ───────── static diagrams (STANDARD §4a). Two layouts: 'w' (viewBox 720 wide, column ≥ 600 px) and 'n' (340 wide).
   Text is 14 units, so it renders at ≥ 11.7 px at 320 px. A label with a width limit wraps. ───────── */
const DG = {};
const WC = [C.gold, C.cyan, C.green, C.violet];
function lbox(g, x, y, w, h, col, key, o) {
  o = o || {}; g.box(x, y, w, h, col, { a: o.a, dash: o.dash, rx: o.rx });
  g.text(x + w / 2, y + h / 2, key, { a: 'middle', c: o.c, vars: o.vars, w: w - 12, va: 'mid', mono: o.mono, fs: o.fs });
}
// ch1: where the area goes
DG.die = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 576;
  return { W, H, draw(g) {
    const cx = wide ? 20 : 10, cw = wide ? 320 : 320, cy = wide ? 34 : 30;
    g.text(cx, cy - 18, 'dg.die.cpu', { c: 'g', weight: 600 });
    lbox(g, cx, cy, cw, wide ? 96 : 70, C.mute, 'dg.die.cache', { c: 'm' });
    const r2 = cy + (wide ? 104 : 78), r3 = r2 + 52;
    lbox(g, cx, r2, cw * 0.64, 44, C.violet, 'dg.die.ooo', { c: 'v' });
    lbox(g, cx + cw * 0.66, r2, cw * 0.34, 44, C.violet, 'dg.die.bp', { c: 'v' });
    lbox(g, cx, r3, cw * 0.44, 44, C.violet, 'dg.die.fe', { c: 'v' });
    lbox(g, cx + cw * 0.46, r3, cw * 0.16, 44, C.mute, 'dg.die.l1', { c: 'm' });
    lbox(g, cx + cw * 0.64, r3, cw * 0.36, 44, C.gold, 'dg.die.alu', { c: 'g' });
    g.text(cx + cw / 2, r3 + 68, 'dg.die.note1', { a: 'middle', c: 'm' });
    const gx = wide ? 380 : 10, gy = wide ? 34 : 300, pw = 155, ph = 94;
    g.text(gx, gy - 18, 'dg.die.gpu', { c: 'c', weight: 600 });
    for (let i = 0; i < 4; i++) {
      const x = gx + (i % 2) * (pw + 10), y = gy + Math.floor(i / 2) * (ph + 8);
      g.box(x, y, pw, ph, C.line, { a: 0.0 });
      lbox(g, x + 6, y + 5, pw - 12, 22, C.violet, 'dg.die.sch', { c: 'v', fs: 13 });
      lbox(g, x + 6, y + 31, pw - 12, 24, C.cyan, 'dg.die.rf', { c: 'c', fs: 13 });
      for (let j = 0; j < 8; j++) g.box(x + 8 + j * 17.5, y + 60, 13, 8, C.gold, { a: 0.5, rx: 2 });
      g.text(x + pw / 2, y + 81, 'dg.die.lanes', { a: 'middle', c: 'g', fs: 13 });
    }
    const sy = gy + 2 * (ph + 8);
    lbox(g, gx, sy, 2 * pw + 10, 26, C.mute, 'dg.die.smem', { c: 'm', fs: 13 });
    g.text(gx + pw + 5, sy + 48, 'dg.die.note2', { a: 'middle', c: 'm' });
  } };
};
// ch2: grid → block → warp → thread
DG.hier = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 500;
  return { W, H, draw(g) {
    const gx = wide ? 20 : 10, gy = 42, cs = wide ? 34 : 24, cols = 6, rows = 4;
    g.text(gx, 16, 'dg.hier.grid', { c: 'm' });
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) g.box(gx + i * cs, gy + j * cs, cs - 4, cs - 4, i === 1 && j === 1 ? C.gold : C.line, { a: i === 1 && j === 1 ? 0.35 : 0.08, rx: 3 });
    g.text(gx, gy + rows * cs + 18, 'dg.hier.sm', { c: 'm', w: wide ? 220 : 150 });
    const bx = wide ? 290 : 10, by = wide ? 42 : 220, bw = wide ? 176 : 176, sh = wide ? 22 : 22;
    g.text(bx, (wide ? 16 : by - 22), 'dg.hier.block', { c: 'g' });
    if (wide) g.line(gx + 2 * cs - 2, gy + cs + 14, bx - 6, by + 40, C.gold, { arrow: 1, dash: '4 4' });
    for (let k = 0; k < 8; k++) {
      const col = WC[k % 4];
      g.box(bx, by + k * sh, bw, sh - 3, col, { a: k < 2 ? 0.32 : 0.12, rx: 3 });
      for (let x = 1; x < 16; x++) g.line(bx + x * bw / 16, by + k * sh + 2, bx + x * bw / 16, by + k * sh + sh - 5, C.bg, { sw: 1 });
    }
    // one thread highlighted in warp 1
    g.box(bx + 3 * bw / 16, by + sh, bw / 16, sh - 3, C.red, { solid: true, rx: 1 });
    const lx = bx + bw + 14, lw = W - lx - 6;
    g.text(lx, by + sh / 2 - 2, 'dg.hier.warp0', { c: 'g', w: lw });
    g.text(lx, by + sh * 1.5 + 14, 'dg.hier.warp1', { c: 'c', w: lw });
    g.text(lx, by + sh * 3.5 + 14, 'dg.hier.warps', { c: 'm', w: lw });
    g.text(lx, by + sh * 5.5 + 14, 'dg.hier.thread', { c: 'r', w: lw });
    g.line(lx - 4, by + sh * 5.5 + 14, bx + 3.5 * bw / 16, by + sh * 1.5, C.red, { arrow: 1 });
    g.text(bx, by + 8 * sh + 14, 'dg.hier.id', { c: 'm', mono: true });
  } };
};
// ch3: one SM
DG.sm = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 330 : 500;
  return { W, H, draw(g) {
    g.text(wide ? 20 : 10, 14, 'dg.sm.title', { c: 'c', weight: 600 });
    const pw = wide ? 164 : 155, ph = wide ? 220 : 182, gap = wide ? 8 : 10;
    for (let i = 0; i < 4; i++) {
      const x = wide ? 20 + i * (pw + gap) : 10 + (i % 2) * (pw + gap), y = wide ? 32 : 32 + Math.floor(i / 2) * (ph + 10);
      g.box(x, y, pw, ph, C.line, { a: 0 });
      g.text(x + 8, y + 14, 'dg.sm.part', { c: 'm', fs: 13, vars: { n: i } });
      const rows = [['dg.sm.sch', C.violet, 'v'], ['dg.sm.rf', C.cyan, 'c'], ['dg.sm.fp32', C.gold, 'g'], ['dg.sm.tc', C.green, 'n'], ['dg.sm.ldst', C.mute, 'm']];
      const rh = wide ? 34 : 28, y0 = y + 30;
      rows.forEach(([k, col, cl], j) => lbox(g, x + 6, y0 + j * (rh + (wide ? 2 : 1)), pw - 12, rh - 4, col, k, { c: cl, fs: 13 }));
    }
    const ly = wide ? 262 : 32 + 2 * (ph + 10);
    lbox(g, wide ? 20 : 10, ly, wide ? 680 : 320, 30, C.cyan, 'dg.sm.l1', { c: 'c', fs: 13 });
    g.line(W / 2, ly + 30, W / 2, ly + 50, C.mute, { arrow: 1 });
    g.text(W / 2 + 10, ly + 46, 'dg.sm.out', { c: 'm', fs: 13, w: W / 2 - 20 });
  } };
};
// ch3: timeline of four warps hiding a load
DG.tl = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 270;
  return { W, H, draw(g) {
    const x0 = wide ? 110 : 84, x1 = W - 10, rh = 30, y0 = 50, k = 3, Lw = 9, n = 4, cyc = 24, cw = (x1 - x0) / cyc;
    // legend
    g.box(x0, 12, 14, 10, C.gold, { solid: true, rx: 2 }); g.text(x0 + 20, 17, 'dg.tl.issue', { c: 'm', fs: 13 });
    g.box(x0 + (wide ? 120 : 92), 12, 22, 10, C.dimfill, { solid: true, rx: 2 }); g.text(x0 + (wide ? 148 : 120), 17, 'dg.tl.wait', { c: 'm', fs: 13 });
    // simulate greedy issue: warp w issues k instructions then waits Lw
    const ready = new Array(n).fill(0), pos = new Array(n).fill(0), who = []; let last = 0;
    for (let t = 0; t < cyc; t++) { let w = ready[last] <= t ? last : -1; if (w < 0) for (let c = 0; c < n; c++) if (ready[c] <= t) { w = c; break; } who.push(w); if (w >= 0) { pos[w]++; if (pos[w] === k) { pos[w] = 0; ready[w] = t + 1 + Lw; g.box(x0 + (t + 1) * cw, y0 + w * rh + 6, Math.min(Lw, cyc - t - 1) * cw, rh - 14, C.dimfill, { solid: true, rx: 2 }); } else ready[w] = t + 1; last = w; } }
    for (let w = 0; w < n; w++) g.text(wide ? 20 : 10, y0 + w * rh + rh / 2 - 2, 'dg.tl.w', { vars: { n: w }, c: 'm', fs: 13 });
    who.forEach((w, t) => { if (w >= 0) g.box(x0 + t * cw + 1, y0 + w * rh + 4, cw - 2, rh - 10, WC[w], { solid: true, rx: 2 }); });
    const ys = y0 + n * rh + 36;
    g.text(wide ? 20 : 10, ys - 14, 'dg.tl.sched', { c: 'm', fs: 13 });
    who.forEach((w, t) => g.box(x0 + t * cw + 1, ys, cw - 2, 14, w >= 0 ? WC[w] : C.red, { solid: w >= 0, a: 0.2, rx: 2 }));
    g.text(x1, ys + 34, 'dg.tl.time', { a: 'end', c: 'm', fs: 13 });
  } };
};
// ch4: active mask
DG.mask = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 230 : 250;
  const on = i => ((i * 7) % 5) < 2;
  return { W, H, draw(g) {
    const x0 = wide ? 130 : 86, x1 = W - 8, cw = (x1 - x0) / 32, y0 = 40, rh = 36;
    g.text(x0, 18, 'dg.mask.lanes', { c: 'm', fs: 13 });
    const rows = [['dg.mask.cond', () => true], ['dg.mask.if', on], ['dg.mask.else', i => !on(i)], ['dg.mask.join', () => true]];
    rows.forEach(([k, f], r) => {
      g.text(wide ? 20 : 10, y0 + r * rh + rh / 2 - 3, k, { c: r === 1 ? 'g' : r === 2 ? 'c' : '', fs: 13 });
      for (let i = 0; i < 32; i++) g.box(x0 + i * cw + 0.6, y0 + r * rh, cw - 1.2, rh - 10, f(i) ? (r === 2 ? C.cyan : C.gold) : C.dimfill, { solid: true, rx: 1.5, nostroke: true });
    });
    const ly = y0 + 4 * rh + 14;
    g.box(x0, ly - 6, 14, 12, C.gold, { solid: true, rx: 2 }); g.text(x0 + 20, ly, 'dg.mask.on', { c: 'm', fs: 13 });
    g.box(x0 + (wide ? 110 : 80), ly - 6, 14, 12, C.dimfill, { solid: true, rx: 2 }); g.text(x0 + (wide ? 130 : 100), ly, 'dg.mask.off', { c: 'm', fs: 13 });
  } };
};
// ch5: coalesced vs strided
DG.coal = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 320;
  return { W, H, draw(g) {
    const x0 = wide ? 76 : 10, x1 = W - 10, ww = (x1 - x0) / 16;
    [['dg.coal.a', 1], ['dg.coal.b', 2]].forEach(([k, s], p) => {
      const y = 14 + p * (wide ? 140 : 150);
      g.text(x0, y + 4, k, { c: p ? 'r' : 'g', fs: 13, w: x1 - x0 });
      const ty = y + 26, my = y + 74;
      if (wide) g.text(x0 - 8, ty + 9, 'dg.coal.t', { a: 'end', c: 'm', fs: 13 });
      for (let i = 0; i < 8; i++) {
        const wi = i * s, cx = x0 + (wi + 0.5) * ww;
        g.text(cx, ty + 9, { raw: String(i) }, { a: 'middle', fs: 13, mono: true });
        g.line(cx, ty + 20, cx, my - 3, C.mute, { arrow: 1, sw: 1.2 });
      }
      const used = new Set(); for (let i = 0; i < 8; i++) used.add(i * s);
      for (let wI = 0; wI < 16; wI++) { const seg = Math.floor(wI / 8), fetched = s === 2 || seg === 0; g.box(x0 + wI * ww + 1, my, ww - 2, 18, used.has(wI) ? C.gold : fetched ? C.red : C.line, { a: used.has(wI) ? 0.6 : fetched ? 0.3 : 0.05, rx: 2 }); }
      for (let sg = 0; sg < 2; sg++) { const fetched = s === 2 || sg === 0; g.box(x0 + sg * 8 * ww, my - 4, 8 * ww, 26, fetched ? C.cyan : C.line, { a: 0, dash: fetched ? 'none' : '3 3', rx: 4 }); }
      g.text(x0 + 4 * ww, my + 40, 'dg.coal.seg', { a: 'middle', c: 'c', fs: 13 });
      if (s === 2) g.text(x0 + 12 * ww, my + 40, 'dg.coal.seg', { a: 'middle', c: 'c', fs: 13 });
    });
    const ly = H - 12;
    g.box(x0, ly - 6, 14, 12, C.gold, { a: 0.6, rx: 2 }); g.text(x0 + 20, ly, 'dg.coal.use', { c: 'm', fs: 13 });
    g.box(x0 + (wide ? 150 : 140), ly - 6, 14, 12, C.red, { a: 0.3, rx: 2 }); g.text(x0 + (wide ? 170 : 160), ly, 'dg.coal.waste', { c: 'm', fs: 13 });
  } };
};
// ch6: banks with a conflict
DG.banks = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 320 : 340;
  return { W, H, draw(g) {
    const x0 = wide ? 80 : 56, x1 = W - 10, bw = (x1 - x0) / 8;
    [['dg.banks.s1', 1], ['dg.banks.s2', 2]].forEach(([k, s], p) => {
      const y = 14 + p * (wide ? 150 : 162);
      g.text(wide ? 20 : 10, y + 4, k, { c: p ? 'r' : 'g', fs: 13 });
      const ty = y + 24, by = y + 88;
      g.text(wide ? 20 : 10, ty + 10, 'dg.banks.t', { c: 'm', fs: 13 });
      g.text(wide ? 20 : 10, by + 14, 'dg.banks.bank', { c: 'm', fs: 13 });
      const count = new Array(8).fill(0);
      for (let i = 0; i < 8; i++) {
        const b = (i * s) % 8, tx = x0 + (i + 0.5) * bw, bx = x0 + (b + 0.5) * bw;
        g.box(tx - 13, ty, 26, 20, WC[i % 4], { a: 0.25, rx: 4 });
        g.text(tx, ty + 10, { raw: String(i) }, { a: 'middle', fs: 13, mono: true });
        g.line(tx, ty + 22, bx + (count[b] ? 6 : -6) * (s > 1 ? 1 : 0), by - 3, s > 1 && count[b] ? C.red : C.mute, { arrow: 1, sw: 1.2 });
        count[b]++;
      }
      for (let b = 0; b < 8; b++) {
        const bx = x0 + b * bw + 3;
        g.box(bx, by, bw - 6, 28, count[b] > 1 ? C.red : count[b] ? C.cyan : C.line, { a: count[b] ? 0.22 : 0.05, rx: 4 });
        g.text(bx + (bw - 6) / 2, by + 14, { raw: String(b) }, { a: 'middle', fs: 13, mono: true });
        if (!count[b] && b === 1) g.text(bx + (bw - 6) / 2, by + 44, 'dg.banks.idle', { a: 'middle', c: 'm', fs: 13 });
      }
    });
  } };
};
// ch7: the tiled multiply
DG.tile = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 330 : 480;
  return { W, H, draw(g) {
    const s = wide ? 1 : 0.62, ox = wide ? 30 : 6, oy = wide ? 10 : 6;
    const A = [ox, oy + 120 * s, 180 * s, 180 * s], B = [ox + 200 * s, oy, 180 * s, 100 * s], Cm = [ox + 200 * s, oy + 120 * s, 180 * s, 180 * s];
    for (const [r, k] of [[A, 'dg.tile.a'], [B, 'dg.tile.b'], [Cm, 'dg.tile.c']]) { g.box(r[0], r[1], r[2], r[3], C.mute, { a: 0.06, rx: 2 }); g.text(r[0] + 8, r[1] + 14, k, { c: 'm', weight: 600 }); }
    const ty = Cm[1] + 70 * s, tx = Cm[0] + 70 * s, T = 46 * s;
    g.box(A[0], ty, A[2], T, C.cyan, { a: 0.16, rx: 0 }); g.box(A[0] + 50 * s, ty, 30 * s, T, C.cyan, { a: 0.45, rx: 0 });
    g.box(tx, B[1], T, B[3], C.cyan, { a: 0.16, rx: 0 }); g.box(tx, B[1] + 34 * s, T, 30 * s, C.cyan, { a: 0.45, rx: 0 });
    g.box(tx, ty, T, T, C.gold, { a: 0.5, rx: 0 });
    if (wide) {
      g.text(tx + T / 2, ty + T + 16, 'dg.tile.cblk', { a: 'middle', c: 'g', fs: 13 });
      g.text(A[0] + 4, ty + T + 16, 'dg.tile.astrip', { c: 'c', fs: 13 });
      g.text(tx + T + 8, B[1] + B[3] - 12, 'dg.tile.bstrip', { c: 'c', fs: 13 });
    } else {
      g.text(A[0] + A[2] / 2, A[1] + A[3] + 14, 'dg.tile.astrip', { a: 'middle', c: 'c', fs: 13 });
      g.text(Cm[0] + Cm[2] / 2, Cm[1] + Cm[3] + 14, 'dg.tile.cblk', { a: 'middle', c: 'g', fs: 13 });
      g.text(B[0] + B[2] + 8, B[1] + B[3] / 2, 'dg.tile.bstrip', { c: 'c', fs: 13 });
    }
    const px = wide ? 450 : 10, pw = wide ? 250 : 320, py0 = wide ? 30 : 226;
    lbox(g, px, py0, pw, 40, C.mute, 'dg.tile.hbm', { c: 'm' });
    lbox(g, px, py0 + 90, pw, 54, C.cyan, 'dg.tile.smem', { c: 'c' });
    lbox(g, px, py0 + 194, pw, 44, C.gold, 'dg.tile.reg', { c: 'g' });
    g.line(px + pw / 2, py0 + 42, px + pw / 2, py0 + 86, C.cyan, { arrow: 1 });
    g.line(px + pw / 2, py0 + 146, px + pw / 2, py0 + 190, C.gold, { arrow: 1 });
  } };
};
// ch8: one warp-wide matrix multiply-accumulate
DG.mma = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 200 : 310;
  return { W, H, draw(g) {
    const u = wide ? 7 : 6.2, x0 = wide ? 20 : 12, y0 = 40;
    const grid = (x, y, r, c, col) => { g.box(x, y, c * u, r * u, col, { a: 0.18, rx: 2 }); for (let i = 1; i < c; i++) if (i % 4 === 0) g.line(x + i * u, y, x + i * u, y + r * u, C.line, { sw: 1 }); for (let j = 1; j < r; j++) if (j % 4 === 0) g.line(x, y + j * u, x + c * u, y + j * u, C.line, { sw: 1 }); };
    grid(x0, y0, 16, 16, C.cyan); g.text(x0 + 8 * u, y0 + 16 * u + 16, 'dg.mma.a', { a: 'middle', c: 'c', fs: 13 });
    const bx = x0 + 16 * u + 30; g.text(bx - 15, y0 + 8 * u, { raw: '×' }, { a: 'middle', fs: 18 });
    grid(bx, y0, 16, 8, C.violet); g.text(bx + 4 * u, y0 + 16 * u + 16, 'dg.mma.b', { a: 'middle', c: 'v', fs: 13 });
    const cx = bx + 8 * u + 30; g.text(cx - 15, y0 + 8 * u, { raw: '→' }, { a: 'middle', fs: 18 });
    grid(cx, y0, 16, 8, C.gold); g.text(cx - 4, y0 + 16 * u + 16, 'dg.mma.c', { c: 'g', fs: 13 });
    const tx = wide ? cx + 8 * u + 40 : 12, ty = wide ? 60 : y0 + 16 * u + 70, tw = W - tx - 10;
    g.text(tx, ty, 'dg.mma.warp', { w: tw });
    g.text(tx, ty + (wide ? 56 : 48), 'dg.mma.macs', { c: 'g', w: tw, weight: 600 });
    g.text(tx, ty + (wide ? 92 : 80), 'dg.mma.fma', { c: 'm', w: tw });
    for (let i = 0; i < 32; i++) g.box(tx + i * Math.min(8, tw / 32), ty + (wide ? 22 : 18), Math.min(8, tw / 32) - 2, 10, C.gold, { a: 0.5, rx: 1, nostroke: true });
  } };
};
// ch9: the graphics pipeline
DG.pipe = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 240 : 400;
  const st = [['dg.pipe.v', C.mute, 'm'], ['dg.pipe.vs', C.cyan, 'c'], ['dg.pipe.ras', C.mute, 'm'], ['dg.pipe.fs', C.cyan, 'c'], ['dg.pipe.rop', C.mute, 'm'], ['dg.pipe.fb', C.mute, 'm']];
  return { W, H, draw(g) {
    if (wide) {
      const bw = 100, gap = 18, y = 30;
      st.forEach(([k, col, cl], i) => { const x = 10 + i * (bw + gap); lbox(g, x, y, bw, 52, col, k, { c: cl, fs: 13, dash: col === C.mute && (i === 0 || i === 5) ? '4 3' : 'none' }); if (i) g.line(x - gap + 2, y + 26, x - 3, y + 26, C.mute, { arrow: 1 }); });
      const x1 = 10 + (bw + gap), x3 = 10 + 3 * (bw + gap);
      g.line(x1, 96, x3 + bw, 96, C.cyan, {}); g.line(x1, 90, x1, 96, C.cyan, {}); g.line(x3 + bw, 90, x3 + bw, 96, C.cyan, {});
      g.text((x1 + x3 + bw) / 2, 116, 'dg.pipe.sm', { a: 'middle', c: 'c', fs: 13, w: 330 });
      const xr = 10 + 2 * (bw + gap);
      g.text(xr + bw / 2, 22 - 8, 'dg.pipe.fixed', { a: 'middle', c: 'm', fs: 13 });
      // quads
      const qy = 158, qx = xr - 40;
      for (let q = 0; q < 8; q++) { const x = qx + q * 24; g.box(x, qy, 20, 20, C.gold, { a: 0.2, rx: 2 }); g.line(x + 10, qy, x + 10, qy + 20, C.line, { sw: 1 }); g.line(x, qy + 10, x + 20, qy + 10, C.line, { sw: 1 }); }
      g.text(qx + 96, qy + 42, 'dg.pipe.quad', { a: 'middle', c: 'g', fs: 13 });
    } else {
      const bw = 170, bh = 38, gap = 18, x = 10;
      st.forEach(([k, col, cl], i) => { const y = 10 + i * (bh + gap); lbox(g, x, y, bw, bh, col, k, { c: cl, fs: 13, dash: col === C.mute && (i === 0 || i === 5) ? '4 3' : 'none' }); if (i) g.line(x + bw / 2, y - gap + 2, x + bw / 2, y - 3, C.mute, { arrow: 1 }); });
      const y1 = 10 + (bh + gap), y3 = 10 + 3 * (bh + gap) + bh;
      g.line(x + bw + 8, y1, x + bw + 8, y3, C.cyan, {});
      g.text(x + bw + 16, (y1 + y3) / 2 - 40, 'dg.pipe.sm', { c: 'c', fs: 13, w: W - x - bw - 22 });
      g.text(x + bw + 16, 10 + 2 * (bh + gap) + bh / 2 + 30, 'dg.pipe.fixed', { c: 'm', fs: 13 });
      const qy = 10 + 6 * (bh + gap) - 4;
      for (let q = 0; q < 8; q++) { const xx = x + q * 24; g.box(xx, qy, 20, 20, C.gold, { a: 0.2, rx: 2 }); }
      g.text(x + 200, qy + 10, 'dg.pipe.quad', { c: 'g', fs: 13, w: 130, va: 'mid' });
    }
  } };
};
// ch10: the memory hierarchy
DG.mem = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 340 : 400;
  return { W, H, draw(g) {
    const n = wide ? 4 : 2, sw = wide ? 150 : 140, gap = wide ? 26 : 20, x0 = 10, y0 = 14, sh = 104;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (sw + gap);
      g.box(x, y0, sw, sh, C.cyan, { a: 0.05 });
      g.text(x + 8, y0 + 14, 'dg.mem.sm', { vars: { n: i === n - 1 ? 'N' : i }, c: 'c', fs: 13 });
      lbox(g, x + 8, y0 + 28, sw - 16, 28, C.gold, 'dg.mem.rf', { c: 'g', fs: 13 });
      lbox(g, x + 8, y0 + 64, sw - 16, 30, C.cyan, 'dg.mem.l1', { c: 'c', fs: 13 });
      if (i) g.line(x - gap + 3, y0 + 79, x - 3, y0 + 79, C.red, { dash: '3 3' });
    }
    if (!wide) g.text(x0 + 2 * sw + gap + 6, y0 + sh / 2, { raw: '…' }, { c: 'm' });
    const ny = y0 + sh + 10;
    g.text(x0 + sw / 2 + 8, ny + 6, 'dg.mem.nocoh', { c: 'r', fs: 13 });
    const xy = ny + 26, fullW = W - 20;
    for (let i = 0; i < n; i++) g.line(x0 + i * (sw + gap) + sw / 2, y0 + sh, x0 + i * (sw + gap) + sw / 2, xy - 2, C.mute, { sw: 1.2 });
    lbox(g, x0, xy, fullW, 28, C.mute, 'dg.mem.xbar', { c: 'm', fs: 13 });
    const ly = xy + 52, hw = (fullW - 12) / 2;
    lbox(g, x0, ly, hw, 36, C.violet, 'dg.mem.l2a', { c: 'v', fs: 13 }); lbox(g, x0 + hw + 12, ly, hw, 36, C.violet, 'dg.mem.l2b', { c: 'v', fs: 13 });
    g.line(x0 + hw / 2, xy + 28, x0 + hw / 2, ly - 2, C.mute, { sw: 1.2 }); g.line(x0 + 1.5 * hw + 12, xy + 28, x0 + 1.5 * hw + 12, ly - 2, C.mute, { sw: 1.2 });
    g.text(x0, ly + 54, 'dg.mem.point', { c: 'v', fs: 13 });
    const dy = ly + 76;
    g.line(W / 2, ly + 36, W / 2, dy - 2, C.mute, { sw: 1.2 });
    lbox(g, x0, dy, fullW, 34, C.gold, 'dg.mem.dram', { c: 'g', fs: 13 });
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

/* ───────── shared helpers ───────── */
const tf = x => t('u.tf', { v: fmt(x, x < 1 ? 2 : x < 100 ? 1 : 0) });
const tbs = x => t('u.tbs', { v: fmt(x, x < 1 ? 2 : x < 10 ? 2 : 1) });
const cyc = (x, d) => t('u.cyc', { v: fmt(x, d == null ? 0 : d) });
const lg2 = x => Math.log2(x);
function legendRow(c, items, x, y) { c.font = FONT; c.textAlign = 'left'; let cx = x; for (const [s, col] of items) { c.fillStyle = col; c.fillRect(cx, y - 4, 12, 8); c.fillStyle = C.mute; c.fillText(s, cx + 16, y); cx += 16 + c.measureText(s).width + 14; } }

/* ───────── 01 caches or threads ───────── */
(() => {
  const cv = $('#hCv'), sC = $('#hC'), sH = $('#hH'), sN = $('#hN'), Cs = [2, 5, 10, 20, 40];
  const c = () => Cs[+sC.value], h = () => M.HIDE.hs[+sH.value], n = () => M.HIDE.Ns[+sN.value];
  const sim = reg(cv, { draw() {
    const { c: g, w, h: hh } = fit(cv), f = frame(w, hh, [30, 16, 40, 54], 0, 6, 0, 1.05);
    yTicks(g, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0)); axes(g, f, t('ch1.cv.x'), t('ch1.cv.y'));
    g.fillStyle = C.mute; spacedTicks(g, [1, 2, 4, 8, 16, 32, 64].map(k => [f.X(lg2(k)), fmt(k, 0)]), f.B + 12, w);
    const pts = []; for (let k = 1; k <= 64; k += 0.25) pts.push([lg2(k), M.hide(c(), 0, k).uGpu]);
    path(g, pts, f.X, f.Y, C.cyan, 2.6);
    const r = M.hide(c(), h(), n()); path(g, [[0, r.uCpu], [6, r.uCpu]], f.X, f.Y, C.gold, 2, [6, 5]);
    dot(g, f.X(lg2(n())), f.Y(r.uGpu), C.cyan, 5.5);
  } });
  function text() {
    const r = M.hide(c(), h(), n()), z = M.say.hide(c(), h(), n());
    put('#hCo', cyc(c())); put('#hHo', pct(h(), 0)); put('#hNo', fmt(n(), 0));
    put('#hAmat', cyc(r.amat, 1)); put('#hCpu', pct(r.uCpu, 1)); put('#hGpu', pct(r.uGpu, 1)); put('#hNeed', fmt(r.nFull, 0));
    putHTML('#hSay', t(z.key, { h: pct(h(), 0), cpu: pct(r.uCpu, 1), gpu: pct(r.uGpu, 1), n: fmt(n(), 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sC, sH, sN].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 02 image → grid ───────── */
(() => {
  const cv = $('#mCv'), sX = $('#mPx'), sY = $('#mPy');
  const img = () => M.IMAGES[radioVal('mImg')], blk = () => radioVal('mBlk').split('x').map(Number);
  function clamp() { const [W, H] = img(); sX.max = W - 1; sY.max = H - 1; if (+sX.value > W - 1) sX.value = W - 1; if (+sY.value > H - 1) sY.value = H - 1; }
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), [W, H] = img(), [bx, by] = blk(), px = +sX.value, py = +sY.value, r = M.mapImage(W, H, bx, by, px, py);
    const stack = w < 520, aw = stack ? w - 20 : w * 0.56, ah = stack ? h * 0.46 : h - 40;
    const k = Math.min(aw / (r.gx * bx), ah / (r.gy * by)), ox = 10, oy = 26;
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(`${fmt(W, 0)} × ${fmt(H, 0)}`, ox, 12);
    c.fillStyle = 'rgba(99,199,230,.10)'; c.fillRect(ox, oy, W * k, H * k);
    c.strokeStyle = 'rgba(240,122,109,.55)'; c.setLineDash([3, 3]); c.strokeRect(ox + 0.5, oy + 0.5, r.gx * bx * k, r.gy * by * k); c.setLineDash([]);
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath();
    const stepX = Math.max(1, Math.ceil(3 / (bx * k))), stepY = Math.max(1, Math.ceil(3 / (by * k)));
    for (let i = 0; i <= r.gx; i += stepX) { c.moveTo(ox + i * bx * k, oy); c.lineTo(ox + i * bx * k, oy + r.gy * by * k); }
    for (let j = 0; j <= r.gy; j += stepY) { c.moveTo(ox, oy + j * by * k); c.lineTo(ox + r.gx * bx * k, oy + j * by * k); }
    c.stroke();
    const hx = ox + r.bix * bx * k, hy = oy + r.biy * by * k, hw = Math.max(6, bx * k), hh = Math.max(6, by * k);
    c.strokeStyle = 'rgba(233,185,73,.45)'; c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(hx + hw / 2, oy); c.lineTo(hx + hw / 2, oy + H * k); c.moveTo(ox, hy + hh / 2); c.lineTo(ox + W * k, hy + hh / 2); c.stroke(); c.setLineDash([]);
    c.fillStyle = C.gold; c.globalAlpha = 0.6; c.fillRect(hx, hy, hw, hh); c.globalAlpha = 1; c.strokeStyle = C.gold; c.lineWidth = 2; c.strokeRect(hx, hy, hw, hh);
    dot(c, ox + (px + 0.5) * k, oy + (py + 0.5) * k, C.red, 3);
    
    // zoom of the block
    const zx = stack ? 10 : w * 0.56 + 30, zy = stack ? oy + ah + 30 : oy, zw = stack ? w - 20 : w - zx - 10, zh = stack ? h - zy - 8 : h - oy - 10;
    const cs = Math.min(zw / bx, zh / by);
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch2.cv.zoom') + ` (${r.bix}, ${r.biy})`, zx, zy - 12);
    for (let ty = 0; ty < by; ty++) for (let tx = 0; tx < bx; tx++) {
      const id = tx + ty * bx, wv = Math.floor(id / 32), gxp = r.bix * bx + tx, gyp = r.biy * by + ty, out = gxp >= W || gyp >= H;
      c.fillStyle = out ? 'rgba(240,122,109,.25)' : WC[wv % 4]; c.globalAlpha = out ? 1 : (wv === r.warp ? 0.85 : 0.32);
      c.fillRect(zx + tx * cs + 0.5, zy + ty * cs + 0.5, Math.max(1, cs - 1), Math.max(1, cs - 1));
    }
    c.globalAlpha = 1; c.strokeStyle = C.red; c.lineWidth = 2; c.strokeRect(zx + r.tx * cs, zy + r.ty * cs, Math.max(2, cs), Math.max(2, cs));
  } });
  function text() {
    clamp();
    const [W, H] = img(), [bx, by] = blk(), px = +sX.value, py = +sY.value, r = M.mapImage(W, H, bx, by, px, py), z = M.say.map(W, H, bx, by), z2 = M.say.pixel(W, H, bx, by, px, py);
    put('#mPxo', fmt(px, 0)); put('#mPyo', fmt(py, 0));
    put('#mGrid', t('ch2.v.grid', { gx: fmt(r.gx, 0), gy: fmt(r.gy, 0), b: fmt(r.blocks, 0) })); put('#mThr', fmt(r.threads, 0));
    put('#mIdle', t('ch2.v.idle', { n: fmt(r.idle, 0), p: pct(r.idleShare, 2) })); put('#mBlock', t('ch2.v.block', { x: r.bix, y: r.biy }));
    put('#mTid', t('ch2.v.thread', { x: r.tx, y: r.ty, id: r.tid })); put('#mWarp', t('ch2.v.warp', { w: r.warp, l: r.lane }));
    putHTML('#mSay', t(z.key, { w: fmt(W, 0), h: fmt(H, 0), bx, by, b: fmt(r.blocks, 0), gx: fmt(r.gx, 0), gy: fmt(r.gy, 0), n: fmt(r.idle, 0), p: pct(r.idleShare, 2) }));
    putHTML('#mSay2', t(z2.key, { px: fmt(px, 0), py: fmt(py, 0), bx: r.bix, by: r.biy, id: r.tid, w: r.warp, l: r.lane, bw: bx, rows: r.rowsPerWarp, ww: r.warpW }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sX, sY].forEach(s => s.addEventListener('input', go)); onAll(radios('mImg'), 'change', go); onAll(radios('mBlk'), 'change', go);
  text();
})();

/* ───────── 03 the scheduler, then occupancy ───────── */
const schedUI = (() => {
  const cv = $('#sCv'), sN = $('#sN'), sK = $('#sK');
  const N = () => +sN.value, k = () => M.SCHED.ks[+sK.value], L = () => M.SCHED.Ls[radioVal('sL')], pol = () => radioVal('sPol');
  const memo = new Map(), run = () => { const key = [N(), k(), L(), pol()].join(); if (!memo.has(key)) memo.set(key, M.warpSim(N(), k(), L(), pol())); return memo.get(key); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), n = N(), kk = k(), LL = L(), Tw = Math.min(1500, Math.max(160, 2 * (kk + LL) + kk * n));
    const tr = M.warpSim(n, kk, LL, pol(), Tw, 0, Tw).trace;
    const L0 = 64, R = w - 10, T0 = 8, B = h - 44, rh = (B - T0) / n, X = tt => L0 + (R - L0) * tt / Tw;
    c.font = FONT; c.textAlign = 'right'; c.fillStyle = C.mute;
    const lab = n <= 8 ? 1 : 2;
    for (let i = 0; i < n; i++) if (i % lab === 0) c.fillText(String(i), L0 - 8, T0 + i * rh + rh / 2);
    tr.forEach(([wv, ld], tt) => {
      if (wv < 0) return;
      if (ld) { c.fillStyle = C.dimfill; c.fillRect(X(tt + 1), T0 + wv * rh + rh * 0.3, X(Math.min(Tw, tt + 1 + LL)) - X(tt + 1), rh * 0.4); }
    });
    tr.forEach(([wv], tt) => { if (wv < 0) return; c.fillStyle = WC[wv % 4]; c.fillRect(X(tt), T0 + wv * rh + rh * 0.15, Math.max(1, X(tt + 1) - X(tt)), rh * 0.7); });
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(L0, B + 2); c.lineTo(R, B + 2); c.stroke();
    c.fillStyle = C.mute; const step = Tw > 1000 ? 500 : Tw > 400 ? 200 : 50; const ticks = []; for (let tt = 0; tt <= Tw; tt += step) ticks.push([X(tt), fmt(tt, 0)]);
    spacedTicks(c, ticks, B + 14, w); c.textAlign = 'right'; c.fillText(t('ch3.cv.x'), R, B + 32);
  } });
  function text() {
    const r = run(), z = M.say.sched(N(), k(), L(), pol());
    put('#sNo', fmt(N(), 0)); put('#sKo', fmt(k(), 0));
    put('#sBusy', pct(r.busy, 1)); put('#sClosed', pct(r.closed, 1)); put('#sNeed', fmt(r.nFull, 0)); put('#sLat', cyc(L()));
    putHTML('#sSay', t(z.key, { n: fmt(N(), 0), k: fmt(k(), 0), l: fmt(L(), 0), busy: pct(r.busy, 1), closed: pct(r.closed, 1), need: fmt(r.nFull, 0), max: fmt(M.SCHED.maxPerSched, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sN, sK].forEach(s => s.addEventListener('input', go)); onAll(radios('sL'), 'change', go); onAll(radios('sPol'), 'change', go);
  text();
  return { setN(v) { sN.value = Math.max(1, Math.min(16, Math.round(v))); go(); } };
})();
(() => {
  const cv = $('#oCv'), sR = $('#oR'), sS = $('#oS');
  const tpb = () => +radioVal('oT'), regs = () => M.OCC.regs[+sR.value], smem = () => M.OCC.smem[+sS.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.occupancy(tpb(), regs(), smem());
    if (r.bad) { c.fillStyle = C.red; c.textAlign = 'center'; c.fillText(t('ch3.say.occ.bad.' + r.bad).replace(/<[^>]+>/g, ''), w / 2, h / 2); return; }
    const keys = ['warps', 'regs', 'smem', 'blocks'], max = 34;
    const rows = keys.map(k => [t('ch3.bar.' + k), Math.min(r.lim[k], max), k === r.limit ? C.gold : C.violet, t('ch3.bar.v', { v: fmt(r.lim[k], 0) })]);
    bars(c, w, h, rows, max, keys.indexOf(r.limit));
  } });
  function text() {
    const r = M.occupancy(tpb(), regs(), smem()), z = M.say.occ(tpb(), regs(), smem());
    put('#oRo', fmt(regs(), 0)); put('#oSo', t('u.kb', { v: fmt(smem(), 0) }));
    put('#oBlk', fmt(r.blocks, 0)); put('#oW', fmt(r.warps, 0)); put('#oOcc', pct(r.occ, 0)); put('#oPs', fmt(r.perSched, r.perSched % 1 ? 1 : 0));
    put('#oLim', r.bad ? t('u.none') : t('ch3.lim.' + r.limit));
    $('#oSend').disabled = !!r.bad || r.perSched < 1;
    putHTML('#oSay', t(z.key, { tpb: fmt(tpb(), 0), wpb: fmt(r.wpb, 0), blocks: fmt(r.blocks, 0), warps: fmt(r.warps, 0), occ: pct(r.occ, 0), regs: fmt(regs(), 0), rb: fmt(regs() * tpb(), 0), smem: fmt(smem(), 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sR, sS].forEach(s => s.addEventListener('input', go)); onAll(radios('oT'), 'change', go);
  $('#oSend').addEventListener('click', () => { const r = M.occupancy(tpb(), regs(), smem()); if (!r.bad) { schedUI.setN(r.perSched); const t0 = $('#sCv'); t0.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } });
  text();
})();

/* ───────── 04 divergence ───────── */
(() => {
  const cv = $('#dCv'), sP = $('#dP'), sA = $('#dA'); let seed = 7;
  const p = () => M.DIV.ps[+sP.value], a = () => M.DIV.as[+sA.value], mode = () => radioVal('dM');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [30, 16, 40, 54], 0, 1, 0, 1.05);
    yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [0, 0.25, 0.5, 0.75, 1].map(v => [f.X(v), pct(v, 0)]), f.B + 12, w);
    const pts = []; for (let q = 0; q <= 1.0001; q += 0.005) pts.push([q, M.diverge(Math.min(1, q), a(), M.DIV.b, mode()).eff]);
    path(c, pts, f.X, f.Y, C.gold, 2.6);
    dot(c, f.X(p()), f.Y(M.diverge(p(), a(), M.DIV.b, mode()).eff), C.gold, 5.5);
  } });
  function text() {
    const r = M.diverge(p(), a(), M.DIV.b, mode()), mask = M.sampleMask(p(), seed, mode()), mc = M.maskCycles(mask, a(), M.DIV.b), z = M.say.div(p(), a(), mode());
    put('#dPo', pct(p(), 0)); put('#dAo', t('u.cyc', { v: fmt(a(), 0) }));
    putHTML('#dLanes', mask.map(x => `<span class="${x ? 'a' : 'b'}"></span>`).join(''));
    put('#dCyc', cyc(r.cycles, 1)); put('#dEff', pct(r.eff, 1)); put('#dNA', t('ch4.v.nA', { n: mc.nA })); put('#dThis', cyc(mc.cycles));
    putHTML('#dSay', t(z.key, { p: pct(p(), 0), cyc: fmt(r.cycles, 1), eff: pct(r.eff, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sP, sA].forEach(s => s.addEventListener('input', go)); onAll(radios('dM'), 'change', go);
  $('#dRe').addEventListener('click', () => { seed++; text(); });
  text();
})();

/* ───────── 05 coalescing ───────── */
(() => {
  const cv = $('#cCv'), sX = $('#cX');
  const pat = () => radioVal('cP');
  const param = () => { const i = +sX.value, P = pat(); return P === 'stride' ? M.COAL.strides[i] : P === 'offset' ? M.COAL.offsets[Math.min(i, M.COAL.offsets.length - 1)] : P === 'random' ? i : 0; };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.coalesce(pat(), param());
    const lo = Math.min(...r.sectorList) * 32, hi = (Math.max(...r.sectorList) + 1) * 32, Lx = 10, Rx = w - 10, X = a => Lx + (Rx - Lx) * (a - lo) / (hi - lo);
    const y0 = 34, bh = h - 80;
    for (const s of r.sectorList) { const x = X(s * 32), x2 = X(s * 32 + 32); c.fillStyle = 'rgba(240,122,109,.30)'; c.fillRect(x, y0, Math.max(1.5, x2 - x - 1), bh); }
    for (const a of r.addrs) { const x = X(a), x2 = X(a + 4); c.fillStyle = C.gold; c.fillRect(x, y0, Math.max(1, x2 - x), bh); }
    c.strokeStyle = C.mute; c.lineWidth = 1;
    r.addrs.forEach((a) => { const x = X(a + 2); c.beginPath(); c.moveTo(x, 8); c.lineTo(x, y0 - 3); c.stroke(); });
    c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'left'; c.fillText(fmt(lo, 0), Lx, y0 + bh + 14); c.textAlign = 'right'; c.fillText(fmt(hi, 0), Rx, y0 + bh + 14);
    c.textAlign = 'center'; c.fillText(t('ch5.cv.addr'), w / 2, y0 + bh + 30);
  } });
  function text() {
    const P = pat(), v = param(), r = M.coalesce(P, v), z = M.say.coal(P, v);
    sX.disabled = P === 'seq' || P === 'rows';
    put('#cXo', P === 'stride' ? t('ch5.param.stride', { v }) : P === 'offset' ? t('ch5.param.offset', { v }) : P === 'random' ? t('ch5.param.seed', { v: v + 1 }) : t('ch5.param.none'));
    put('#cSec', fmt(r.sectors, 0)); put('#cLin', fmt(r.lines, 0)); put('#cEff', pct(r.eff, 1)); put('#cBw', tbs(r.bw));
    putHTML('#cSay', t(z.key, { s: fmt(r.sectors, 0), moved: fmt(r.moved, 0), eff: pct(r.eff, 1), bw: tbs(r.bw) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sX.addEventListener('input', go); onAll(radios('cP'), 'change', go);
  text();
})();

/* ───────── 06 banks ───────── */
(() => {
  const cv = $('#bCv'), sS = $('#bS'), cP = $('#bPad');
  const mode = () => radioVal('bM'), s = () => M.BANK.strides[+sS.value];
  const cur = () => mode() === 'tile' ? M.tileColumn(cP.checked ? 1 : 0) : M.banks(s());
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = cur(), ymax = Math.max(4, r.deg);
    const f = frame(w, h, [24, 10, 40, 40], -0.5, 31.5, 0, ymax * 1.08);
    const yt = ymax <= 4 ? [0, 1, 2, 3, 4] : ymax <= 8 ? [0, 2, 4, 6, 8] : [0, 8, 16, 24, 32];
    yTicks(c, f, yt, v => fmt(v, 0)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
    const bw = (f.R - f.L) / 32;
    r.perBank.forEach((v, b) => { if (!v) return; c.fillStyle = v === r.deg && v > 1 ? C.red : C.cyan; c.fillRect(f.X(b) - bw * 0.38, f.Y(v), bw * 0.76, f.B - f.Y(v)); });
    c.fillStyle = C.mute; spacedTicks(c, [0, 8, 16, 24, 31].map(b => [f.X(b), String(b)]), f.B + 12, w);
  } });
  function text() {
    const r = cur(), tile = mode() === 'tile', z = tile ? M.say.tile(cP.checked ? 1 : 0) : M.say.bank(s());
    sS.disabled = tile; cP.disabled = !tile;
    put('#bSo', fmt(s(), 0));
    put('#bDeg', t('ch6.v.deg', { v: fmt(r.deg, 0) })); put('#bCyc', cyc(r.deg)); put('#bBw', t('ch6.v.bw', { v: fmt(128 / r.deg, 0) }));
    putHTML('#bSay', t(z.key, { s: fmt(s(), 0), d: fmt(r.deg, 0), used: fmt(r.perBank.filter(Boolean).length, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sS.addEventListener('input', go); cP.addEventListener('change', go); onAll(radios('bM'), 'change', go);
  text();
})();

/* ───────── 07 tiled matmul ───────── */
(() => {
  const cv = $('#tCv');
  const T = () => +radioVal('tT'), R = () => +radioVal('tR');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), m = M.tiledMM(T(), R());
    const vals = [m.roofs.peak, m.roofs.hbm, isFinite(m.roofs.smem) ? m.roofs.smem : 0, m.att], max = Math.max(...vals.filter(isFinite)) * 1.05;
    const rows = [[t('ch7.bar.peak'), m.roofs.peak, C.mute, tf(m.roofs.peak)], [t('ch7.bar.hbm'), m.roofs.hbm, C.cyan, tf(m.roofs.hbm)],
      [t('ch7.bar.smem'), isFinite(m.roofs.smem) ? m.roofs.smem : 0, C.violet, isFinite(m.roofs.smem) ? tf(m.roofs.smem) : t('u.none')], [t('ch7.bar.att'), m.bad ? 0 : m.att, C.gold, m.bad ? t('u.none') : tf(m.att)]];
    bars(c, w, h, rows, max, 3);
  } });
  function text() {
    const m = M.tiledMM(T(), R()), z = M.say.mm(T(), R());
    radios('tR').forEach(r => { r.disabled = T() === 1 && r.value !== '1'; });
    if (T() === 1 && radioVal('tR') !== '1') radios('tR').find(r => r.value === '1').checked = true;
    put('#tAtt', m.bad ? t('u.none') : tf(m.att)); put('#tIg', fmt(m.Ig, 2)); put('#tIs', isFinite(m.Is) ? fmt(m.Is, 2) : t('ch7.v.inf'));
    put('#tBlk', t('ch7.v.blk', { t: fmt(m.threads, 0), kb: fmt(m.smemKB, 0) }));
    putHTML('#tSay', t(z.key, { t: fmt(T(), 0), r: fmt(R(), 0), att: tf(m.att), share: pct(m.att / m.roofs.peak, 1), ig: fmt(m.Ig, 2), hbm: tf(m.roofs.hbm), x: fmt(m.att / M.tiledMM(1, 1).att, 0), th: fmt(m.threads, 0) }));
  }
  sim.text = text;
  const go = () => { text(); sim.dirty = true; };
  onAll(radios('tT'), 'change', go); onAll(radios('tR'), 'change', go);
  text();
})();

/* ───────── 08 tensor-core formats ───────── */
(() => {
  const cv = $('#gCv'), sN = $('#gN'), FM = ['fp32', 'tf32', 'fp16', 'fp8', 'fp4'];
  const gpu = () => radioVal('gG'), fmtv = () => radioVal('gF'), N = () => M.MMA.Ns[+sN.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), g = M.GPUS[gpu()];
    const peaks = FM.map(f => g.peak[f] || 0), max = Math.max(...peaks) * 1.05;
    // wide: labels in a left column; narrow: each label sits above its bar, so the bars keep the full width
    const narrow = w < 520, lf = narrow ? null : labelFont(c, FM.map(f => t('ch8.fmt.' + f)), Math.min(150, w * 0.34));
    const L0 = narrow ? 10 : lf.w, R = w - 10, rh = (h - 20) / FM.length, X = v => L0 + (R - L0) * v / max;
    FM.forEach((f, i) => {
      const bh = Math.min(22, rh * (narrow ? 0.42 : 0.56)), y = 10 + i * rh + (narrow ? rh * 0.62 : rh / 2), r = M.gemm(N(), f, gpu()), hi = f === fmtv();
      if (narrow) { c.font = FONT; c.textAlign = 'left'; c.fillStyle = hi ? C.gold : C.ink; c.fillText(t('ch8.fmt.' + f), L0, y - bh / 2 - 10); }
      else { c.font = lf.font; c.textAlign = 'right'; c.fillStyle = hi ? C.gold : C.ink; const ls = lf.lines.get(t('ch8.fmt.' + f)); ls.forEach((l, j) => c.fillText(l, L0 - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT; }
      c.fillStyle = C.card2; c.fillRect(L0, y - bh / 2, R - L0, bh);
      if (r.none) { c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch8.bar.na'), L0 + 6, y); return; }
      c.fillStyle = C.dimfill; c.fillRect(L0, y - bh / 2, X(r.peak) - L0, bh);
      const xa = Math.max(1.5, X(r.att) - L0) + L0;
      c.fillStyle = hi ? C.gold : C.cyan; c.fillRect(L0, y - bh / 2, xa - L0, bh);
      if (hi) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L0 - 0.5, y - bh / 2 - 0.5, R - L0 + 1, bh + 1); }
      // the label goes right of the peak bar if it fits, else inside it; if neither, the "/ peak" part is dropped
      const xe = X(r.peak), full = tf(r.att) + (r.att < r.peak ? ' / ' + fmt(r.peak, r.peak % 1 ? 1 : 0) : '');
      const place = txt => { const tw = c.measureText(txt).width; if (xe + 6 + tw <= R) return [txt, xe + 6, 'left', C.ink]; if (tw + 12 <= xe - L0) return [txt, xe - 6, 'right', xe - 6 - tw < xa ? C.bg : C.ink]; return null; };
      const pl = place(full) || place(tf(r.att)) || [tf(r.att), R - 6, 'right', C.ink];
      c.fillStyle = pl[3]; c.textAlign = pl[2]; c.fillText(pl[0], pl[1], y);
    });
  } });
  function text() {
    const g = M.gemm(N(), fmtv(), gpu()), z = M.say.gemm(N(), fmtv(), gpu());
    put('#gNo', fmt(N(), 0));
    put('#gI', g.none ? t('u.none') : t('u.flopb', { v: fmt(g.I, 0) })); put('#gAtt', g.none ? t('u.none') : tf(g.att)); put('#gShare', g.none ? t('u.none') : pct(g.share, 0)); put('#gNf', g.none ? t('u.none') : fmt(g.nFull, 0));
    putHTML('#gSay', t(z.key, g.none ? {} : { n: fmt(N(), 0), f: t('ch8.fmt.' + fmtv()), i: fmt(g.I, 0), att: tf(g.att), share: pct(g.share, 0), nf: fmt(g.nFull, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); onAll(radios('gG'), 'change', go); onAll(radios('gF'), 'change', go);
  text();
})();

/* ───────── 09 rasterising ───────── */
(() => {
  const cv = $('#rCv'), sS = $('#rS');
  const s = () => M.RAS.sizes[+sS.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.raster(s()), n = Math.max(8, Math.ceil(M.RAS.off[0] + s() * 1.05) + 2);
    const cs = Math.min((w - 20) / n, (h - 20) / n), ox = (w - cs * n) / 2, oy = 10;
    c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i <= n; i++) { c.moveTo(ox + i * cs, oy); c.lineTo(ox + i * cs, oy + n * cs); c.moveTo(ox, oy + i * cs); c.lineTo(ox + n * cs, oy + i * cs); }
    c.stroke();
    c.fillStyle = 'rgba(99,199,230,.12)'; for (const [qx, qy] of r.quadList) c.fillRect(ox + qx * 2 * cs, oy + qy * 2 * cs, 2 * cs, 2 * cs);
    c.fillStyle = C.gold; for (const [x, y] of r.pix) c.fillRect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2);
    c.strokeStyle = C.cyan; c.lineWidth = 1.5; for (const [qx, qy] of r.quadList) c.strokeRect(ox + qx * 2 * cs + 0.75, oy + qy * 2 * cs + 0.75, 2 * cs - 1.5, 2 * cs - 1.5);
    c.strokeStyle = C.ink; c.lineWidth = 1.6; c.beginPath(); r.verts.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](ox + x * cs, oy + y * cs)); c.closePath(); c.stroke();
  } });
  function text() {
    const r = M.raster(s()), z = M.say.ras(s());
    put('#rSo', t('ch9.v.s', { v: fmt(s(), 0) }));
    put('#rCov', fmt(r.covered, 0)); put('#rQ', t('ch9.v.quads', { q: fmt(r.quads, 0), l: fmt(r.lanes, 0) })); put('#rEff', r.quadEff == null ? t('u.none') : pct(r.quadEff, 0)); put('#rW', fmt(r.warps, 0));
    putHTML('#rSay', t(z.key, { c: fmt(r.covered, 0), l: fmt(r.lanes, 0), e: r.quadEff == null ? '' : pct(r.quadEff, 0) }));
  }
  sim.text = text;
  sS.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── loop ───────── */
applyLang();
let lastT = performance.now();
function tick(now) {
  const dt = Math.min((now - lastT) / 1000, 0.1); lastT = now;
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
