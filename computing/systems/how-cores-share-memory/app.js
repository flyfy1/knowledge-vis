/* How cores share memory: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js.
   The canvas, chart and SVG helpers follow how-cpu-caches-work/app.js. */
(() => {
'use strict';
const M = window.CoherenceModels;
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
const ns = (x, d) => t('u.ns', { v: fmt(x, d == null ? (x < 10 ? 1 : 0) : d) });
const mps = (x, d) => t('u.mps', { v: fmt(x, d == null ? (x < 10 ? 1 : 0) : d) });
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
const ST_COL = { M: C.red, O: C.violet, E: C.gold, S: C.cyan, I: C.mute };
const DG = {};
// a labelled box: key text centred, wrapping inside the box
function lbox(g, x, y, w, h, col, key, o) {
  o = o || {}; g.box(x, y, w, h, col, { a: o.a, dash: o.dash, rx: o.rx });
  const lines = o.lines || 1;
  g.text(x + w / 2, y + h / 2, key, { a: 'middle', c: o.c, vars: o.vars, w: w - 12, va: 'mid', mono: o.mono, fs: o.fs });
  void lines;
}
// ch1: two caches with a stale copy
DG.stale = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 290 : 330;
  return { W, H, draw(g) {
    const cw = wide ? 280 : 150, x0 = wide ? 40 : 10, x1 = wide ? 400 : 180;
    const yc = 14, ych = 36, yk = 96, ykh = 60, ym = wide ? 222 : 262;
    lbox(g, x0, yc, cw, ych, C.gold, 'dg.stale.c0', { c: 'g' }); lbox(g, x1, yc, cw, ych, C.cyan, 'dg.stale.c1', { c: 'c' });
    g.box(x0, yk, cw, ykh, C.gold, {}); g.box(x1, yk, cw, ykh, C.red, {});
    g.text(x0 + cw / 2, yk + 20, 'dg.stale.k0', { a: 'middle', va: 'mid' }); g.text(x0 + cw / 2, yk + 42, 'dg.stale.k0n', { a: 'middle', va: 'mid', c: 'm', fs: 13 });
    g.text(x1 + cw / 2, yk + 20, 'dg.stale.k1', { a: 'middle', va: 'mid', c: 'r' }); g.text(x1 + cw / 2, yk + 42, 'dg.stale.k1n', { a: 'middle', va: 'mid', c: 'm', fs: 13 });
    lbox(g, wide ? 160 : 10, ym, wide ? 400 : 320, 46, C.mute, 'dg.stale.mem', { c: 'm' });
    const ax0 = x0 + 34, ax1 = x1 + 34;
    g.line(ax0, yc + ych + 2, ax0, yk - 4, C.gold, { arrow: 1 }); g.text(ax0 + 10, (yc + ych + yk) / 2, 'dg.stale.w', { c: 'g' });
    g.line(ax1, yk - 4, ax1, yc + ych + 4, C.red, { arrow: 1 }); g.text(ax1 + 10, (yc + ych + yk) / 2, 'dg.stale.r', { c: 'r' });
    const busY = (yk + ykh + ym) / 2;
    g.line(x0 + cw / 2, yk + ykh, x0 + cw / 2, ym, C.line, { sw: 2 }); g.line(x1 + cw / 2, yk + ykh, x1 + cw / 2, ym, C.line, { sw: 2 });
    g.text(wide ? 360 : 170, busY, 'dg.stale.none', { a: 'middle', c: 'm', w: wide ? 240 : 100, va: 'mid' });
  } };
};
// ch2: epochs of one address
DG.epochs = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 200 : 360;
  const seg = [['rw', [0], 1], ['ro', [0, 1, 2], 1], ['rw', [1], 2], ['ro', [1, 2], 2]].map(([k, w, v]) => [k, w.join(t('dg.epochs.sep')), v]);
  return { W, H, draw(g) {
    if (wide) {
      const x0 = 20, sw = 170, y = 30, h = 64;
      seg.forEach(([k, who, v], i) => {
        const x = x0 + i * sw, col = k === 'rw' ? C.gold : C.cyan;
        g.box(x + 2, y, sw - 4, h, col, { a: k === 'rw' ? 0.22 : 0.12 });
        g.text(x + sw / 2, y + 22, k === 'rw' ? 'dg.epochs.rw' : 'dg.epochs.ro', { a: 'middle', vars: k === 'rw' ? { c: who } : { list: who }, c: k === 'rw' ? 'g' : 'c', w: sw - 14, va: 'mid' });
        g.text(x + sw / 2, y + 46, 'dg.epochs.v', { a: 'middle', vars: { v }, mono: 1 });
      });
      g.line(20, 116, 700, 116, C.mute, { arrow: 1 }); g.text(700, 136, 'dg.epochs.time', { a: 'end', c: 'm' });
      g.text(20, 170, 'dg.epochs.note', { c: 'm', w: 680 });
    } else {
      const x = 40, w = 290, h = 54, y0 = 14;
      seg.forEach(([k, who, v], i) => {
        const y = y0 + i * (h + 8), col = k === 'rw' ? C.gold : C.cyan;
        g.box(x, y, w, h, col, { a: k === 'rw' ? 0.22 : 0.12 });
        g.text(x + 12, y + h / 2, k === 'rw' ? 'dg.epochs.rw' : 'dg.epochs.ro', { vars: k === 'rw' ? { c: who } : { list: who }, c: k === 'rw' ? 'g' : 'c', w: 190, va: 'mid' });
        g.text(x + w - 12, y + h / 2, 'dg.epochs.v', { a: 'end', vars: { v }, mono: 1 });
      });
      g.line(20, 14, 20, 14 + 4 * 62 - 8, C.mute, { arrow: 1 }); g.text(10, 4 * 62 + 24, 'dg.epochs.timeV', { c: 'm' });
      g.text(10, 4 * 62 + 56, 'dg.epochs.note', { c: 'm', w: 320 });
    }
  } };
};
// ch3: snooping bus
DG.snoop = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 312;
  return { W, H, draw(g) {
    const pos = [0, 1, 2, 3].map(i => wide ? [20 + i * 175, 14] : [8 + i * 82, 14]), cw = wide ? 155 : 76, busY = wide ? 160 : 156;
    pos.forEach(([x, y], i) => {
      const me = i === 2, col = me ? C.gold : C.cyan;
      lbox(g, x, y, cw, 32, col, 'dg.snoop.core', { vars: { c: i }, c: me ? 'g' : 'c' });
      lbox(g, x, y + 40, cw, 36, me ? C.gold : C.red, 'dg.snoop.cache', { c: me ? 'g' : 'r', a: 0.1 });
      const cx = x + cw / 2;
      g.line(cx, y + 76, cx, busY - 2, me ? C.gold : C.mute, me ? { arrow: 1, sw: 2 } : { dash: '4 4' });
    });
    g.line(10, busY, W - 10, busY, C.violet, { sw: 4 });
    g.text(W / 2, busY + 18, 'dg.snoop.bus', { a: 'middle', c: 'v', w: W - 30, va: 'top' });
    const reqX = pos[2][0] + cw / 2;
    g.text(reqX + 8, wide ? 120 : 118, 'dg.snoop.req', { c: 'g', mono: 1, fs: 13 });
    g.text(10, wide ? 206 : 202, 'dg.snoop.listen', { c: 'r', w: wide ? 420 : 250 }); g.text(10, wide ? 228 : 224, 'dg.snoop.listen2', { c: 'r', w: wide ? 420 : 250 });
    const mx = wide ? 480 : 10, my = wide ? 236 : 260;
    lbox(g, mx, my, wide ? 220 : 320, 40, C.mute, 'dg.snoop.mem', { c: 'm' });
    g.line(wide ? 590 : 316, my - 2, wide ? 590 : 316, busY + 4, C.green, { arrow: 1 }); g.text(wide ? 600 : 306, my - 16, 'dg.snoop.data', { c: 'n', a: wide ? 'start' : 'end' });
  } };
};
// ch3: the full MESI state machine. Solid: own reads/writes; dashed: snooped bus requests; thin grey: evictions.
DG.mesi = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 622 : 880;
  return { W, H, draw(g) {
    const P = wide ? { E: [150, 80], M: [570, 80], I: [150, 320], S: [570, 320] } : { E: [70, 70], M: [270, 70], I: [70, 300], S: [270, 300] }, r = wide ? 40 : 38;
    const style = { p: {}, s: { dash: '6 5' }, e: { sw: 1.2 } };
    // [from, to, badge, kind, perpendicular offset, badge position along the line]
    const E = [['E', 'M', 4, 'p', 0, 0.5], ['I', 'E', 1, 'p', -14, 0.3], ['E', 'I', 9, 's', 0, 0.5], ['E', 'I', 12, 'e', -14, 0.24],
      ['I', 'S', 2, 'p', -14, 0.3], ['S', 'I', 10, 's', 0, 0.5], ['S', 'I', 12, 'e', -14, 0.72], ['S', 'M', 5, 'p', 10, 0.35], ['M', 'S', 6, 's', 10, 0.35],
      ['I', 'M', 3, 'p', -12, 0.22], ['M', 'I', 7, 's', 0, 0.2], ['M', 'I', 11, 'e', -12, 0.36], ['E', 'S', 8, 's', 0, 0.78]];
    const badges = [];
    for (const [a, b, n, kind, off, f] of E) {
      const [x1, y1] = P[a], [x2, y2] = P[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d, px = -uy * off, py = ux * off;
      const col = kind === 'e' ? C.mute : ST_COL[b];
      g.line(x1 + ux * (r + 3) + px, y1 + uy * (r + 3) + py, x2 - ux * (r + 6) + px, y2 - uy * (r + 6) + py, col, Object.assign({ arrow: 1 }, style[kind]));
      badges.push([x1 + (x2 - x1) * f + px * 1.9, y1 + (y2 - y1) * f + py * 1.9, n, col]);
    }
    badges.forEach(([x, y, n, col]) => g.badge(x, y, n, col));
    for (const k of ['M', 'E', 'S', 'I']) { const [x, y] = P[k]; g.circle(x, y, r, ST_COL[k]); g.text(x, y - 8, { raw: k }, { a: 'middle', mono: 1, fs: 18, weight: 700, c: { M: 'r', E: 'g', S: 'c', I: 'm' }[k] }); g.text(x, y + 13, 'dg.mesi.' + k, { a: 'middle', fs: 13.5, c: 'm' }); }
    const ly = wide ? 392 : 372, leg = [['dg.mesi.legP', {}, C.ink], ['dg.mesi.legS', { dash: '6 5' }, C.ink], ['dg.mesi.legE', { sw: 1.2 }, C.mute]];
    leg.forEach(([k, o, col], i) => { const x = wide ? 20 + (i % 2) * 350 : 10, y = wide ? ly + Math.floor(i / 2) * 24 : ly + i * 26; g.line(x, y, x + 36, y, col, o); g.text(x + 44, y, k, { c: 'm', fs: 13 }); });
    for (let n = 1; n <= 12; n++) {
      const x = wide ? 20 + ((n - 1) % 2) * 350 : 10, y = wide ? 452 + Math.floor((n - 1) / 2) * 30 : 462 + (n - 1) * 34;
      g.badge(x + 10, y, n, C.dimfill); g.text(x + 28, y, 'dg.mesi.e' + n, { w: wide ? 318 : 296 });
    }
  } };
};
// ch4: snooping vs directory, one panel each
function dirPanel(g, ox, oy, kind) {
  const xs = [20, 100, 180, 260].map(x => ox + x), y = oy + 48, cw = 62;
  g.text(ox + 10, oy + 16, kind === 'snoop' ? 'dg.dir.snoop' : 'dg.dir.dir', { c: kind === 'snoop' ? 'v' : 'c', weight: 600 });
  xs.forEach((x, i) => lbox(g, x, y, cw, 32, i === 0 ? C.gold : i === 3 ? C.red : C.mute, 'dg.dir.core', { vars: { c: i }, c: i === 0 ? 'g' : i === 3 ? 'r' : 'm' }));
  if (kind === 'snoop') {
    const by = y + 92; g.line(ox + 14, by, ox + 330, by, C.violet, { sw: 3 });
    xs.forEach((x, i) => g.line(x + cw / 2, i === 0 ? y + 34 : by - 3, x + cw / 2, i === 0 ? by - 3 : y + 36, i === 0 ? C.gold : C.violet, { arrow: 1, dash: i === 0 ? 'none' : '4 4' }));
    g.text(ox + 10, by + 30, 'dg.dir.all', { c: 'v', w: 310 });
    g.line(xs[3] + cw - 8, y + 34, xs[3] + cw - 8, y + 60, C.green, {}); g.line(xs[3] + cw - 8, y + 60, xs[0] + cw - 8, y + 60, C.green, {}); g.line(xs[0] + cw - 8, y + 60, xs[0] + cw - 8, y + 36, C.green, { arrow: 1 });
  } else {
    const hx = ox + 120, hy = y + 82;
    lbox(g, hx, hy, 160, 50, C.cyan, 'dg.dir.home', { c: 'c' });
    g.text(hx + 80, hy + 66, 'dg.dir.entry', { a: 'middle', mono: 1, fs: 13, c: 'm' });
    g.line(xs[0] + cw / 2, y + 34, hx + 20, hy - 2, C.gold, { arrow: 1 });
    g.line(hx + 140, hy - 2, xs[3] + cw / 2, y + 36, C.cyan, { arrow: 1 });
    g.line(xs[3] + cw - 8, y + 34, xs[3] + cw - 8, y + 60, C.green, {}); g.line(xs[3] + cw - 8, y + 60, xs[0] + cw - 8, y + 60, C.green, {}); g.line(xs[0] + cw - 8, y + 60, xs[0] + cw - 8, y + 36, C.green, { arrow: 1 });
    g.text(ox + 10, hy + 96, 'dg.dir.only', { c: 'c', w: 310 });
  }
}
DG.dir = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 270 : 450;
  return { W, H, draw(g) { if (wide) { dirPanel(g, 0, 0, 'snoop'); dirPanel(g, 370, 0, 'dir'); g.line(360, 20, 360, 250, C.line, {}); } else { dirPanel(g, 0, 0, 'snoop'); dirPanel(g, 0, 205, 'dir'); } } };
};
// ch4: a 3-hop read and an invalidating write, as message sequences between lifelines
DG.hops = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340;
  const X = wide ? [80, 260, 440, 620] : [42, 128, 214, 300], hw = wide ? 150 : 76, row = 32;
  const top = [['dg.hops.r1', 0, 1], ['dg.hops.r2', 1, 2], ['dg.hops.r3', 2, 0], ['dg.hops.r4', 2, 1]];
  const bot = [['dg.hops.w1', 0, 1], ['dg.hops.w2', 1, 0], ['dg.hops.w3', 1, 2], ['dg.hops.w3', 1, 3], ['dg.hops.w4', 2, 0], ['dg.hops.w4', 3, 0]];
  const hTop = 24 + 44 + top.length * row + 24, H = hTop + 24 + 44 + bot.length * row + 30;
  return { W, H, draw(g) {
    const part = (y0, title, heads, msgs, cols) => {
      g.text(10, y0 + 10, title, { c: 'g', weight: 600 });
      heads.forEach(([k, core], i) => {
        const col = i === 1 ? C.cyan : i === 0 ? C.gold : C.mute, cc = i === 1 ? 'c' : i === 0 ? 'g' : 'm', bx = X[i] - hw / 2;
        g.box(bx, y0 + 24, hw, 40, col, {});
        g.text(X[i], y0 + 34, k, { a: 'middle', c: cc, fs: 13, w: hw - 8, va: 'mid' });
        g.text(X[i], y0 + 55, core == null ? 'dg.hops.homeSub' : 'dg.hops.core', { a: 'middle', c: cc, fs: 13, vars: { c: core }, va: 'mid' });
      });
      const yl = y0 + 64, yEnd = yl + msgs.length * row + 10;
      heads.forEach((k, i) => g.line(X[i], yl, X[i], yEnd, C.line, { dash: '3 4' }));
      msgs.forEach(([k, a, b], j) => {
        const y = yl + 22 + j * row, col = b === 0 ? C.green : C.cyan, xa = X[a], xb = X[b], dir = Math.sign(xb - xa);
        g.line(xa + dir * 3, y, xb - dir * 6, y, col, { arrow: 1 });
        const mid = (xa + xb) / 2; g.text(mid, y - 11, k, { a: 'middle', fs: 13, c: b === 0 ? 'n' : 'c' });
      });
      void cols;
    };
    part(0, 'dg.hops.top', [['dg.hops.req', 0], ['dg.hops.home', null], ['dg.hops.own', 3]], top);
    part(hTop, 'dg.hops.bot', [['dg.hops.req', 0], ['dg.hops.home', null], ['dg.hops.sh', 1], ['dg.hops.sh', 2]], bot);
  } };
};
// ch5: a lost update
DG.race = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 260 : 330;
  return { W, H, draw(g) {
    const steps = [['a', 'dg.race.ld', '5'], ['b', 'dg.race.ld', '5'], ['a', 'dg.race.st', '6'], ['b', 'dg.race.st', '6']];
    if (wide) {
      const x0 = 150, sw = 140, ys = { a: 40, b: 100 }, ym = 164;
      g.text(10, ys.a, 'dg.race.a', { c: 'g' }); g.text(10, ys.b, 'dg.race.b', { c: 'c' }); g.text(10, ym, 'dg.race.mem', { c: 'm', w: 130, va: 'mid' });
      steps.forEach(([who, k, v], i) => {
        const x = x0 + i * sw, col = who === 'a' ? C.gold : C.cyan;
        lbox(g, x + 4, ys[who] - 18, sw - 8, 36, col, k, { c: who === 'a' ? 'g' : 'c' });
        g.text(x + sw / 2, ym, { raw: v }, { a: 'middle', mono: 1, fs: 16, c: i === 3 ? 'r' : '' });
      });
      g.line(x0, 196, 700, 196, C.mute, { arrow: 1 }); g.text(700, 214, 'dg.race.time', { a: 'end', c: 'm' });
      g.text(x0, 242, 'dg.race.lost', { c: 'r' });
    } else {
      const xs = { a: 10, b: 125 }, xm = 290, y0 = 50, rh = 54;
      g.text(xs.a + 55, 20, 'dg.race.a', { a: 'middle', c: 'g' }); g.text(xs.b + 55, 20, 'dg.race.b', { a: 'middle', c: 'c' }); g.text(xm, 20, 'dg.race.mem', { a: 'middle', c: 'm', w: 90, va: 'mid' });
      steps.forEach(([who, k, v], i) => {
        const y = y0 + i * rh, col = who === 'a' ? C.gold : C.cyan;
        lbox(g, xs[who], y, 110, 42, col, k, { c: who === 'a' ? 'g' : 'c' });
        g.text(xm, y + 21, { raw: v }, { a: 'middle', mono: 1, fs: 16, c: i === 3 ? 'r' : '' });
      });
      g.text(10, y0 + 4 * rh + 20, 'dg.race.lost', { c: 'r', w: 320 });
    }
  } };
};
// ch6: an atomic held in M, and LL/SC
DG.atomic = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 330 : 600;
  return { W, H, draw(g) {
    if (wide) {
      g.text(10, 16, 'dg.atomic.top', { c: 'g', weight: 600 });
      g.text(10, 60, 'dg.atomic.c0', { c: 'g' }); g.text(10, 116, 'dg.atomic.c1', { c: 'c' });
      lbox(g, 90, 42, 170, 36, C.cyan, 'dg.atomic.get', { c: 'c' }); lbox(g, 266, 42, 230, 36, C.gold, 'dg.atomic.hold', { c: 'g', a: 0.25 }); lbox(g, 502, 42, 200, 36, C.green, 'dg.atomic.give', { c: 'n' });
      lbox(g, 266, 98, 300, 36, C.mute, 'dg.atomic.wait', { c: 'm', dash: '4 4' });
      g.line(600, 80, 600, 96, C.green, { arrow: 1 });
      g.text(10, 182, 'dg.atomic.bot', { c: 'c', weight: 600 });
      lbox(g, 10, 204, 190, 40, C.cyan, 'dg.atomic.ll', { c: 'c' }); lbox(g, 230, 204, 170, 40, C.red, 'dg.atomic.other', { c: 'r', dash: '4 4' }); lbox(g, 430, 204, 160, 40, C.red, 'dg.atomic.sc', { c: 'r' });
      g.line(200, 224, 228, 224, C.mute, { arrow: 1 }); g.line(400, 224, 428, 224, C.mute, { arrow: 1 });
      g.line(510, 246, 510, 290, C.mute, {}); g.line(510, 290, 105, 290, C.mute, {}); g.line(105, 290, 105, 248, C.mute, { arrow: 1 });
      g.text(310, 306, 'dg.atomic.retry', { a: 'middle', c: 'm' });
    } else {
      g.text(10, 16, 'dg.atomic.top', { c: 'g', weight: 600, w: 320 });
      const bx = 60, bw = 270;
      g.text(10, 60, 'dg.atomic.c0', { c: 'g', w: 46, va: 'mid' });
      lbox(g, bx, 42, bw, 36, C.cyan, 'dg.atomic.get', { c: 'c' }); lbox(g, bx, 86, bw, 36, C.gold, 'dg.atomic.hold', { c: 'g', a: 0.25 }); lbox(g, bx, 130, bw, 36, C.green, 'dg.atomic.give', { c: 'n' });
      g.text(10, 196, 'dg.atomic.c1', { c: 'c', w: 46, va: 'mid' });
      lbox(g, bx, 178, bw, 36, C.mute, 'dg.atomic.wait', { c: 'm', dash: '4 4' });
      g.text(10, 262, 'dg.atomic.bot', { c: 'c', weight: 600, w: 320 });
      lbox(g, bx, 300, bw, 40, C.cyan, 'dg.atomic.ll', { c: 'c' }); lbox(g, bx, 366, bw, 40, C.red, 'dg.atomic.other', { c: 'r', dash: '4 4' }); lbox(g, bx, 432, bw, 40, C.red, 'dg.atomic.sc', { c: 'r' });
      g.line(bx + bw / 2, 340, bx + bw / 2, 364, C.mute, { arrow: 1 }); g.line(bx + bw / 2, 406, bx + bw / 2, 430, C.mute, { arrow: 1 });
      g.line(bx + 20, 474, bx + 20, 540, C.mute, {}); g.line(bx + 20, 540, 30, 540, C.mute, {}); g.line(30, 540, 30, 320, C.mute, {}); g.line(30, 320, bx - 2, 320, C.mute, { arrow: 1 });
      g.text(bx + 40, 540, 'dg.atomic.retry', { c: 'm' });
    }
  } };
};
// ch7: a line bouncing between two cores
DG.ping = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 170 : 190;
  return { W, H, draw(g) {
    const x0 = wide ? 90 : 70, x1 = W - 14, ys = [40, 100], T = wide ? 120 : 92, a = 14, cyc = wide ? 4 : 2;
    g.text(10, ys[0], 'dg.ping.c0', { c: 'g', w: x0 - 14, va: 'mid' }); g.text(10, ys[1], 'dg.ping.c1', { c: 'c', w: x0 - 14, va: 'mid' });
    let x = x0;
    for (let i = 0; i < cyc && x + T + a <= x1; i++) {
      const lane = i % 2, y = ys[lane];
      g.box(x, y - 14, T - 2, 28, C.mute, { a: 0.18, rx: 4 }); g.text(x + (T - 2) / 2, y, 'dg.ping.move', { a: 'middle', c: 'm' });
      g.box(x + T, y - 14, a, 28, C.gold, { solid: true, rx: 3 });
      if (i === 0) g.text(x + T + a / 2, y + 30, 'dg.ping.add', { a: 'middle', c: 'g' });
      x += T + a + 4;
    }
    g.line(x0, H - 32, x1, H - 32, C.mute, { arrow: 1 }); g.text(x1, H - 12, 'dg.ping.time', { a: 'end', c: 'm' });
  } };
};
// ch8: the store buffer
DG.sbuf = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 380;
  return { W, H, draw(g) {
    const cw = wide ? 300 : 155, xs = wide ? [30, 390] : [10, 175];
    const yc = 12, yb = 70, bh = wide ? 70 : 96, ym = wide ? 240 : 316;
    [0, 1].forEach(i => {
      const x = xs[i], col = i ? C.cyan : C.gold;
      lbox(g, x, yc, cw, 34, col, i ? 'dg.sbuf.c2' : 'dg.sbuf.c1', { c: i ? 'c' : 'g' });
      g.box(x, yb, cw, bh, C.violet, { a: 0.1 }); g.text(x + 10, yb + 16, 'dg.sbuf.buf', { c: 'v', fs: 13, w: cw - 20 });
      lbox(g, x + 10, yb + bh - 36, cw - 20, 28, C.gold, i ? 'dg.sbuf.w2' : 'dg.sbuf.w1', { c: 'g', a: 0.15, rx: 4 });
      g.line(x + 24, yc + 34, x + 24, yb - 2, col, { arrow: 1 });
      g.line(x + 30, yb + bh, x + 30, ym - 2, C.gold, { arrow: 1, dash: '4 4' });
      g.line(x + cw - 14, yc + 34, x + cw - 14, ym - 2, C.green, { arrow: 1 });
      g.text(x + cw - 22, (yb + bh + ym) / 2 + (wide ? 0 : 12), i ? 'dg.sbuf.r2' : 'dg.sbuf.r1', { a: 'end', c: 'n', fs: 13 });
    });
    g.text(xs[0] + 40, (yb + bh + ym) / 2 - (wide ? 0 : 12), 'dg.sbuf.late', { c: 'g', fs: 13, w: wide ? 160 : 110, va: 'mid' });
    lbox(g, 10, ym, W - 20, 44, C.mute, 'dg.sbuf.mem', { c: 'm' });
  } };
};
// ch8: litmus outcome table, verdicts computed by the litmus model
const code = ins => ins.map(i => i.op === 'W' ? (i.rel ? 'store-release ' : '') + `${i.a} = ${i.v}` : i.op === 'R' ? `${i.r} = ${i.acq ? 'load-acquire ' : ''}${i.a}` : i.op === 'F' ? 'fence' : `${i.r} = xchg(${i.a}, ${i.v})`);
DG.litmus = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 210 : 470;
  return { W, H, draw(g) {
    const tests = ['SB', 'MP'];
    const verdict = (tst, m) => M.litmus(tst, 'none', m).oddAllowed;
    if (wide) {
      const cx = [10, 70, 210, 350, 470, 545, 640];
      ['', 'dg.litmus.t1', 'dg.litmus.t2', 'dg.litmus.odd', 'dg.litmus.sc', 'dg.litmus.tso', 'dg.litmus.weak'].forEach((k, i) => { if (k) g.text(cx[i], 18, k, { c: 'm', fs: 13 }); });
      g.line(10, 34, 710, 34, C.line, {});
      tests.forEach((tst, j) => {
        const y = 62 + j * 76, T = M.LITMUS[tst], pr = T.fences.none;
        g.text(cx[0], y + 8, { raw: tst }, { mono: 1, weight: 700, c: 'g' });
        code(pr[0]).forEach((s, i) => g.text(cx[1], y + i * 22, { raw: s }, { mono: 1, fs: 13 }));
        code(pr[1]).forEach((s, i) => g.text(cx[2], y + i * 22, { raw: s }, { mono: 1, fs: 13 }));
        g.text(cx[3], y + 8, { raw: `(${T.odd.replace(',', ', ')})` }, { mono: 1, fs: 13, c: 'r' });
        ['sc', 'tso', 'weak'].forEach((m, i) => { const ok = verdict(tst, m); g.text(cx[4 + i], y + 8, ok ? 'dg.litmus.yes' : 'dg.litmus.no', { c: ok ? 'n' : 'm', weight: ok ? 700 : 400 }); });
        g.line(10, y + 44, 710, y + 44, C.line, {});
      });
    } else {
      tests.forEach((tst, j) => {
        const y0 = 10 + j * 230, T = M.LITMUS[tst], pr = T.fences.none;
        g.text(10, y0 + 12, { raw: tst }, { mono: 1, weight: 700, c: 'g' });
        g.text(60, y0 + 12, 'dg.litmus.t1', { c: 'm', fs: 13 }); g.text(200, y0 + 12, 'dg.litmus.t2', { c: 'm', fs: 13 });
        code(pr[0]).forEach((s, i) => g.text(60, y0 + 40 + i * 22, { raw: s }, { mono: 1, fs: 13 }));
        code(pr[1]).forEach((s, i) => g.text(200, y0 + 40 + i * 22, { raw: s }, { mono: 1, fs: 13 }));
        g.text(10, y0 + 100, 'dg.litmus.odd', { c: 'm', fs: 13 }); g.text(170, y0 + 100, { raw: `(${T.odd.replace(',', ', ')})` }, { mono: 1, fs: 13, c: 'r' });
        ['sc', 'tso', 'weak'].forEach((m, i) => { const ok = verdict(tst, m), x = 10 + i * 110; g.text(x, y0 + 134, 'dg.litmus.' + m, { c: 'm', fs: 13 }); g.text(x, y0 + 160, ok ? 'dg.litmus.yes' : 'dg.litmus.no', { c: ok ? 'n' : 'm', weight: ok ? 700 : 400 }); });
        if (!j) g.line(10, y0 + 200, 330, y0 + 200, C.line, {});
      });
    }
  } };
};
// ch10: the MCS queue
DG.mcs = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 510;
  return { W, H, draw(g) {
    const nodes = [[1, 0, 'dg.mcs.hold', C.gold], [3, 1, 'dg.mcs.spin', C.cyan], [0, 1, 'dg.mcs.spin', C.cyan]];
    const pos = wide ? nodes.map((n, i) => [20 + i * 240, 120]) : nodes.map((n, i) => [60, 60 + i * 140]), nw = wide ? 200 : 270, nh = 96;
    nodes.forEach(([c, v, k, col], i) => {
      const [x, y] = pos[i];
      g.box(x, y, nw, nh, col, { a: 0.12 });
      g.text(x + 10, y + 16, 'dg.mcs.node', { vars: { c }, c: i ? 'c' : 'g', weight: 600 });
      g.text(x + 10, y + 42, 'dg.mcs.flag', { vars: { v }, mono: 1, fs: 13 });
      g.text(x + 10, y + 70, k, { c: 'm', fs: 13, w: nw - 20 });
      if (i < nodes.length - 1) {
        const [x2, y2] = pos[i + 1];
        if (wide) { g.line(x + nw, y + 30, x2 - 4, y2 + 30, C.mute, { arrow: 1 }); g.text((x + nw + x2) / 2, y + 18, 'dg.mcs.next', { a: 'middle', c: 'm', fs: 13, mono: 1 }); }
        else { g.line(x + 30, y + nh, x2 + 30, y2 - 4, C.mute, { arrow: 1 }); g.text(x + 40, (y + nh + y2) / 2, 'dg.mcs.next', { c: 'm', fs: 13, mono: 1 }); }
      }
    });
    const [lx, ly] = wide ? [500, 14] : [60, 4];
    lbox(g, lx, ly, wide ? 200 : 140, 34, C.violet, 'dg.mcs.lock', { c: 'v' });
    const [tx, ty] = pos[2];
    if (wide) g.line(lx + 100, ly + 34, tx + nw / 2, ty - 4, C.violet, { arrow: 1 }); else { g.line(lx, ly + 17, 30, ly + 17, C.violet, {}); g.line(30, ly + 17, 30, ty + 48, C.violet, {}); g.line(30, ty + 48, tx - 4, ty + 48, C.violet, { arrow: 1 }); }
    // release arrow from the holder to the next node's flag
    const [hx, hy] = pos[0], [nx, ny] = pos[1];
    if (wide) { g.line(hx + nw / 2, hy + nh, hx + nw / 2, hy + nh + 40, C.green, {}); g.line(hx + nw / 2, hy + nh + 40, nx + 60, hy + nh + 40, C.green, {}); g.line(nx + 60, hy + nh + 40, nx + 60, ny + nh + 2, C.green, { arrow: 1 }); g.text(hx + nw / 2 + 8, hy + nh + 58, 'dg.mcs.rel', { c: 'n', fs: 13 }); }
    else { g.line(hx + nw - 20, hy + nh, nx + nw - 20, ny + 34, C.green, { arrow: 1 }); g.text(hx + nw - 30, hy + nh + 22, 'dg.mcs.rel', { a: 'end', c: 'n', fs: 13 }); }
    if (wide) { lbox(g, 20, 14, 440, 34, C.violet, 'dg.mcs.swap', { c: 'v', dash: '4 4', fs: 13 }); g.line(462, 31, lx - 4, 31, C.violet, { arrow: 1, dash: '4 4' }); }
    else { lbox(g, 10, H - 50, 320, 40, C.violet, 'dg.mcs.swap', { c: 'v', dash: '4 4', fs: 13 }); }
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

/* ───────── shared chart helpers ───────── */
function lineChart(c, f, series, opts) {
  for (const s of series) { path(c, s.pts, f.X, f.Y, s.col, s.hi ? 2.8 : 1.8, s.dash); if (s.dot) dot(c, f.X(s.dot[0]), f.Y(s.dot[1]), s.col, 5); }
  void opts;
}
const lg = x => Math.log10(x);

/* ───────── 01 the stale copy ───────── */
(() => {
  let steps = 0;
  const proto = () => radioVal('s1P');
  function text() {
    const r = M.stale(proto(), steps), sys = r.sys, last = r.recs[r.recs.length - 1];
    const cell = (k, c) => { const s = sys.st[c][0]; return `<div><span>${esc(t(k))}</span><b>${esc(s === 'I' ? t('ch1.cell.empty') : t('ch1.cell', { s, v: fmt(sys.val[c][0], 0) }))}</b></div>`; };
    putHTML('#s1Cells', cell('ch1.core0', 0) + cell('ch1.core1', 1) + `<div><span>${esc(t('ch1.mem'))}</span><b>x = ${fmt(sys.mem[0], 0)}</b></div>`);
    putHTML('#s1Steps', [0, 1, 2, 3].map(i => `<li class="${i < steps ? 'done' : ''}${i === steps ? ' now' : ''}">${i + 1}. ${esc(t('ch1.step.' + i))}</li>`).join(''));
    const inv = M.invariants(sys), lastRead = r.recs.filter(x => x.core === 1 && x.op === 'R').pop();
    put('#s1Last', steps >= 4 ? 'x = ' + fmt(last.value, 0) : t('u.none'));
    put('#s1Sw', inv.swmr ? t('u.ok') : t('u.bad')); put('#s1Dv', inv.value && !(lastRead && lastRead.stale) ? t('u.ok') : t('u.bad'));
    $('#s1Sw').className = inv.swmr ? 'n' : 'r'; $('#s1Dv').className = inv.value && !(lastRead && lastRead.stale) ? 'n' : 'r';
    const z = M.say.stale(proto(), steps);
    putHTML('#s1Say', t(z.key, { v: last ? fmt(last.value, 0) : '', latest: fmt(sys.latest[0], 0) }));
    $('#s1Step').disabled = steps >= 4;
  }
  $('#s1Step').addEventListener('click', () => { if (steps < 4) steps++; text(); });
  $('#s1Reset').addEventListener('click', () => { steps = 0; text(); });
  onAll(radios('s1P'), 'change', () => { steps = 0; text(); });
  reg([], { draw() {}, text }); text();
})();

/* ───────── 03 the protocol simulator ───────── */
(() => {
  const cv = $('#smCv'); let trace = [], last = null, presetName = null;
  const proto = () => radioVal('smProto'), lineSel = () => +radioVal('smLine');
  const LN = ['A', 'B', 'C', 'D'];
  const run = p => M.runTrace(p, M.SIM.cores, M.SIM.lines, trace);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rows = [];
    for (const p of ['msi', 'mesi', 'moesi']) { const l = run(p).led, nm = t('ch3.p.' + p); rows.push([t('ch3.bar.tx', { p: nm }), l.tx, p === proto() ? C.gold : C.violet, fmt(l.tx, 0)]); }
    const max = Math.max(4, ...rows.map(r => r[1])) * 1.1;
    bars(c, w, h, rows, max, ['msi', 'mesi', 'moesi'].indexOf(proto()));
  } });
  function text() {
    const r = run(proto()), sys = r.sys, L = r.led;
    let g = `<thead><tr><th></th>${LN.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>`;
    for (let c = 0; c < M.SIM.cores; c++) g += `<tr><td>${esc(t('ch3.grid.core', { c }))}</td>${LN.map((x, l) => { const s = sys.st[c][l]; return `<td class="${s}${last && last.core === c && last.line === l ? ' now' : ''}"><b>${s}</b></td>`; }).join('')}</tr>`;
    g += `<tr><td>${esc(t('ch3.grid.mem'))}</td>${LN.map((x, l) => `<td>${esc(sys.mem[l] === sys.latest[l] ? t('ch3.grid.memok') : t('ch3.grid.memold'))}</td>`).join('')}</tr></tbody>`;
    putHTML('#smGrid', g);
    const recs = r.recs.slice(-12);
    putHTML('#smLog', recs.length ? recs.map((x, i) => `<span role="listitem"${i === recs.length - 1 ? ' class="now"' : ''}>${esc(t('ch3.log.item', { c: x.core, op: t('ch3.op.' + x.op), l: LN[x.line], a: x.before, b: x.after, bus: x.bus ? ' ' + x.bus : (x.wb ? ' WB' : '') }))}</span>`).join('') : `<span role="listitem">${esc(t('ch3.log.empty'))}</span>`);
    put('#smTx', fmt(L.tx, 0)); put('#smMem', fmt(L.memRd, 0)); put('#smC2c', fmt(L.c2c, 0)); put('#smWb', fmt(L.wb, 0)); put('#smInv', fmt(L.inval, 0));
    const inv = M.invariants(sys); put('#smInvar', inv.swmr && inv.value ? t('u.ok') : t('u.bad'));
    const rec = r.recs[r.recs.length - 1];
    if (presetName && trace.length === M.preset(presetName).length) {
      const z = M.say.preset(presetName, proto());
      putHTML('#smSay', t(z.key, { p: t('ch3.p.' + proto()), r: fmt(M.SIM.rounds, 0), tx: fmt(z.v.tx, 0), up: fmt(z.v.upgr, 0), wb: fmt(z.v.wb, 0), mem: fmt(z.v.memRd, 0) }));
    } else {
      const z = M.say.sim(rec);
      putHTML('#smSay', t(z.key, rec ? { c: rec.core, l: LN[rec.line], s0: rec.before, s1: rec.after, n: fmt(rec.inval.length, 0) } : {}));
    }
    for (let c = 0; c < 4; c++) for (const op of ['R', 'W', 'E']) put('#sm' + op + c, t('ch3.btn.' + op, { c }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  for (let c = 0; c < 4; c++) for (const op of ['R', 'W', 'E']) $('#sm' + op + c).addEventListener('click', () => { presetName = null; trace.push([c, op, lineSel()]); if (trace.length > 400) trace.shift(); last = { core: c, line: lineSel() }; go(); });
  for (const p of M.PRESETS) $('#smP' + p).addEventListener('click', () => { presetName = p; trace = M.preset(p).slice(); const e = trace[trace.length - 1]; last = { core: e[0], line: e[2] }; go(); });
  $('#smReset').addEventListener('click', () => { presetName = null; trace = []; last = null; go(); });
  onAll(radios('smProto'), 'change', go);
  text();
})();

/* ───────── 04 directories ───────── */
(() => {
  const cv1 = $('#drCv1'), cv2 = $('#drCv2'), sN = $('#drN'), Ns = M.DIR.coresList, N = () => Ns[+sN.value];
  const memo = new Map(), cmp = n => { if (!memo.has(n)) memo.set(n, M.dirCompare(n)); return memo.get(n); };
  const sim = reg([cv1, cv2], { draw() {
    { const { c, w, h } = fit(cv1), f = frame(w, h, [30, 16, 40, 54], lg(4), lg(1024), 0, 2.1);
      yTicks(c, f, [0, 0.5, 1, 1.5, 2], v => pct(v, 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.ov'));
      c.fillStyle = C.mute; spacedTicks(c, Ns.map(n => [f.X(lg(n)), fmt(n, 0)]), f.B + 12, w);
      const ser = [['full', C.red], ['coarse', C.gold], ['ptr', C.green]].map(([s, col]) => ({ pts: Ns.map(n => [lg(n), M.dirOverhead(n, s)]), col, hi: s === 'full', dot: [lg(N()), M.dirOverhead(N(), s)] }));
      lineChart(c, f, ser);
    }
    { const { c, w, h } = fit(cv2), f = frame(w, h, [30, 16, 40, 54], lg(4), lg(1024), 0, lg(1100));
      const yt = [1, 10, 100, 1000]; yTicks(c, f, yt.map(lg), v => fmt(Math.pow(10, v), 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.msg'));
      c.fillStyle = C.mute; spacedTicks(c, Ns.map(n => [f.X(lg(n)), fmt(n, 0)]), f.B + 12, w);
      const vis = Ns;
      lineChart(c, f, [{ pts: vis.map(n => [lg(n), lg(cmp(n).perMissSnoop)]), col: C.violet, dot: [lg(N()), lg(cmp(N()).perMissSnoop)] }, { pts: vis.map(n => [lg(n), lg(cmp(n).perMissDir)]), col: C.cyan, hi: true, dot: [lg(N()), lg(cmp(N()).perMissDir)] }]);
    }
  } });
  function text() {
    const n = N(), r = cmp(n), z = M.say.dir(n);
    put('#drNo', fmt(n, 0)); put('#drOv', pct(M.dirOverhead(n, 'full'), 1)); put('#drS', fmt(r.perMissSnoop, 1)); put('#drD', fmt(r.perMissDir, 1)); put('#drH', pct(r.threeHopShare, 0));
    putHTML('#drSay', t(z.key, { n: fmt(n, 0), s: fmt(r.perMissSnoop, 1), d: fmt(r.perMissDir, 1), hop: pct(r.threeHopShare, 0), ov: pct(M.dirOverhead(n, 'full'), 1) }));
  }
  sim.text = text;
  sN.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 05 the lost update ───────── */
(() => {
  const cv = $('#luCv'), sK = $('#luK'), cA = $('#luA');
  const sim = reg(cv, { draw() {
    const k = +sK.value, r = M.lostUpdate(k, cA.checked), { c, w, h } = fit(cv);
    const xs = []; for (let v = 1; v <= 2 * k; v++) xs.push(v);
    const ymax = Math.max(...xs.map(v => (r.dist[v] || 0) / r.total)) * 1.15;
    const f = frame(w, h, [30, 16, 40, 54], 0.4, 2 * k + 0.6, 0, ymax);
    const step = ymax > 0.5 ? 0.25 : ymax > 0.2 ? 0.1 : 0.05; const yt = []; for (let v = 0; v <= ymax; v += step) yt.push(v);
    yTicks(c, f, yt, v => pct(v, 0)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
    const bw = Math.min(40, (f.R - f.L) / (2 * k) * 0.7);
    c.fillStyle = C.mute; spacedTicks(c, xs.map(v => [f.X(v), fmt(v, 0)]), f.B + 12, w);
    for (const v of xs) { const p = (r.dist[v] || 0) / r.total; if (!p) continue; c.fillStyle = v === 2 * k ? C.green : C.red; c.fillRect(f.X(v) - bw / 2, f.Y(p), bw, f.B - f.Y(p)); }
  } });
  function text() {
    const k = +sK.value, r = M.lostUpdate(k, cA.checked), z = M.say.lost(k, cA.checked);
    put('#luKo', fmt(k, 0)); put('#luN', fmt(r.total, 0)); put('#luOk', pct(r.pCorrect, 1)); put('#luMin', fmt(r.min, 0));
    putHTML('#luSay', t(z.key, { k: fmt(k, 0), k2: fmt(2 * k, 0), n: fmt(r.total, 0), ok: pct(r.pCorrect, 1), min: fmt(r.min, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sK.addEventListener('input', go); cA.addEventListener('change', go);
  text();
})();
(() => {
  const sB = $('#rcB'), B = () => M.RACE.bursts[+sB.value], memo = new Map(), get = b => { if (!memo.has(b)) memo.set(b, M.raceSim(b)); return memo.get(b); };
  function text() {
    const b = B(), r = get(b), z = M.say.race(b);
    put('#rcBo', fmt(b, 0)); put('#rcF', fmt(r.final, 0)); put('#rcL', fmt(r.lost, 0));
    putHTML('#rcSay', t(z.key, { b: fmt(b, 0), final: fmt(r.final, 0), lost: fmt(r.lost, 0), share: pct(r.share, 0) }));
  }
  sB.addEventListener('input', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 06 CAS vs fetch-and-add ───────── */
(() => {
  const cv = $('#caCv'), sN = $('#caN'), Ns = M.CAS.threads, n = () => Ns[+sN.value];
  const memo = new Map(), get = k => { if (!memo.has(k)) memo.set(k, M.casLoop(k)); return memo.get(k); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [30, 16, 40, 44], 0, Ns.length - 1, 0, 12);
    yTicks(c, f, [0, 2, 4, 6, 8, 10, 12], v => fmt(v, 0)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, Ns.map((k, i) => [f.X(i), fmt(k, 0)]), f.B + 12, w);
    const i = +sN.value;
    lineChart(c, f, [{ pts: Ns.map((k, j) => [j, get(k).stepsPerInc]), col: C.red, hi: true, dot: [i, get(n()).stepsPerInc] }, { pts: Ns.map((k, j) => [j, 1]), col: C.green, dot: [i, 1] }]);
  } });
  function text() {
    const k = n(), r = get(k), z = M.say.cas(k);
    put('#caNo', fmt(k, 0)); put('#caS', fmt(r.stepsPerInc, 2)); put('#caF', pct(r.failShare, 0)); put('#caA', fmt(1, 0));
    putHTML('#caSay', t(z.key, { n: fmt(k, 0), s: fmt(r.stepsPerInc, k === 1 ? 0 : 2), f: pct(r.failShare, 0) }));
  }
  sim.text = text;
  sN.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 the contended line ───────── */
(() => {
  const cv = $('#ppCv'), sN = $('#ppN');
  const opts = () => [+sN.value, radioVal('ppP'), radioVal('ppM')];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), [n, place] = opts(), a = M.pingPong(n, place, 'shared', 0), b = M.pingPong(n, place, 'private', 0);
    const ra = a.totalRate * 1000, rb = b.totalRate * 1000;
    bars(c, w, h, [[t('ch7.bar.shared'), ra, C.red, mps(ra)], [t('ch7.bar.private'), rb, C.green, mps(rb)]], Math.max(ra, rb) * 1.05, radioVal('ppM') === 'shared' ? 0 : 1);
  } });
  function text() {
    const [n, place, mode] = opts(), r = M.pingPong(n, place, mode, 0), z = M.say.ping(n, place, mode);
    const total = r.totalRate * 1000, per = r.perThread * 1000, time = mode === 'private' ? r.timeFor(2e6 / n) : r.timeFor(2e6);   // two million additions in total, split over n threads
    put('#ppNo', fmt(n, 0)); put('#ppPer', ns(r.perInc, r.perInc < 10 ? 1 : 0)); put('#ppTot', mps(total)); put('#ppTh', mps(per));
    put('#ppTime', n >= 2 ? t('u.ms', { v: fmt(time / 1e6, time < 1e7 ? 1 : 0) }) : t('u.none'));
    putHTML('#ppSay', t(z.key, { n: fmt(n, 0), place: t('ch7.pl.' + place), per: ns(r.perInc, 1), total: mps(total), thread: mps(per) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); onAll(radios('ppP'), 'change', go); onAll(radios('ppM'), 'change', go);
  text();
})();

/* ───────── 08 / 09 litmus widgets ───────── */
function litmusWidget(px, fixedTest) {
  const test = () => fixedTest || radioVal(px + 'T'), sync = () => radioVal(px + 'S');
  function text() {
    const T = test(), avail = Object.keys(M.LITMUS[T].fences);
    radios(px + 'S').forEach(r => { const ok = avail.includes(r.value); r.disabled = !ok; r.closest('label').style.display = ok ? '' : 'none'; });
    if (!avail.includes(sync())) radios(px + 'S').find(r => r.value === 'none').checked = true;
    const S_ = sync(), tbl = M.litmusTable(T, S_), pr = M.LITMUS[T].fences[S_];
    putHTML('#' + px + 'Code', pr.map((th, i) => `<pre><b>${esc(t('dg.litmus.t' + (i + 1)))}</b>${code(th).map(esc).join('\n')}</pre>`).join(''));
    const all = ['0,0', '0,1', '1,0', '1,1'], odd = M.LITMUS[T].odd;
    let h = `<thead><tr><th>${esc(t('ch8.tbl.out'))}</th><th>${esc(t('ch8.tbl.sc'))}</th><th>${esc(t('ch8.tbl.tso'))}</th><th>${esc(t('ch8.tbl.weak'))}</th></tr></thead><tbody>`;
    for (const o of all) h += `<tr class="${o === odd ? 'odd' : ''}"><td>(${o.replace(',', ', ')})${o === odd ? '<small class="om">' + esc(t('ch8.tbl.oddmark')) + '</small>' : ''}</td>${M.MODELS.map(m => { const y = tbl[m].allowed.includes(o); return `<td class="${y ? 'y' : 'n'}">${esc(y ? t('u.yes') : t('ch8.tbl.no'))}</td>`; }).join('')}</tr>`;
    putHTML('#' + px + 'Tbl', h + '</tbody>');
    const v = m => tbl[m].oddAllowed ? t('u.yes') : t('u.no');
    put('#' + px + 'Sc', v('sc')); put('#' + px + 'Tso', v('tso')); put('#' + px + 'Wk', v('weak'));
    const any = M.MODELS.some(m => tbl[m].oddAllowed);
    putHTML('#' + px + 'Say', t(any ? 'ch8.say.allowed' : 'ch8.say.forbidden', { test: T, sync: t('ch8.sync.' + S_), odd: odd.replace(',', ', '), sc: v('sc'), tso: v('tso'), weak: v('weak') }));
  }
  if (!fixedTest) onAll(radios(px + 'T'), 'change', text);
  onAll(radios(px + 'S'), 'change', text);
  reg([], { draw() {}, text }); text();
}
litmusWidget('lt'); litmusWidget('mp', 'MP');

/* ───────── 10 locks ───────── */
(() => {
  const cv = $('#lkCv'), sN = $('#lkN'), Ns = M.LOCK.cores, kinds = M.LOCK.kinds, kind = () => radioVal('lkK'), n = () => Ns[+sN.value];
  const COL = { tas: C.red, ttas: C.violet, ticket: C.cyan, mcs: C.green };
  const memo = new Map(), get = (k, m) => { const key = k + m; if (!memo.has(key)) memo.set(key, M.lockSim(k, m)); return memo.get(key); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [30, 16, 40, 54], 0, Ns.length - 1, 0, lg(3000));
    yTicks(c, f, [1, 10, 100, 1000].map(lg), v => fmt(Math.pow(10, v), 0)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, Ns.map((k, i) => [f.X(i), fmt(k, 0)]), f.B + 12, w);
    const i = +sN.value;
    lineChart(c, f, kinds.map(k => ({ pts: Ns.map((m, j) => [j, lg(get(k, m).perHandoff)]), col: COL[k], hi: k === kind(), dot: k === kind() ? [i, lg(get(k, n()).perHandoff)] : null })));
  } });
  function text() {
    const k = kind(), m = n(), r = get(k, m), z = M.say.lock(k, m), mc = get('mcs', m);
    put('#lkNo', fmt(m, 0)); put('#lkP', fmt(r.perHandoff, r.perHandoff < 100 ? 1 : 0)); put('#lkV', t('u.x', { v: fmt(r.perHandoff / mc.perHandoff, 1) })); put('#lkH', fmt(r.handoffs, 0));
    putHTML('#lkSay', t(z.key, { n: fmt(m, 0), per: fmt(r.perHandoff, r.perHandoff < 100 ? 1 : 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); onAll(radios('lkK'), 'change', go);
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
void reduce;
window.__essayReady = true;
})();
