/* How memory talks: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.MemModels;
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
// the fewest decimals (up to 3) that show x exactly
const nice = x => { for (let d = 0; d < 3; d++) if (Math.abs(Math.round(x * Math.pow(10, d)) - x * Math.pow(10, d)) < 1e-6) return fmt(x, d); return fmt(x, 3); };
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
const U = (k, x, d) => t('u.' + k, { v: d === 'nice' ? nice(x) : fmt(x, d) });
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
  clRows();
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
const fontPx = px => FONT.replace('12px', px.toFixed(1) + 'px');

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
// axis titles: y above the plot at the left, x under the tick labels at the right (shrunk if it would not fit)
function axes(c, f, xLab, yLab, w) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; const yw = c.measureText(yLab).width, room = (w || f.R) - 8; if (yw > room) c.font = fontPx(12 * Math.max(0.7, room / yw)); c.fillText(yLab, 4, f.T - 14); c.font = FONT; }
  if (xLab) { c.textAlign = 'right'; const xw = c.measureText(xLab).width; if (xw > f.R - 4) c.font = fontPx(12 * Math.max(0.7, (f.R - 4) / xw)); c.fillText(xLab, f.R, f.B + 28); c.font = FONT; }
}
function spacedTicks(c, items, y, maxW) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x0, s] of items) { const w = c.measureText(s).width, x = maxW ? Math.min(Math.max(x0, w / 2 + 2), maxW - w / 2 - 2) : x0; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right'; c.font = FONT;
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
// 1-2-5 ticks from 0 to at least max
function niceTicks(max, n) {
  const raw = max / (n || 4), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p, out = [];
  for (let v = 0; v <= max + step * 1e-9; v += step) out.push(v);
  if (out[out.length - 1] < max - 1e-9) out.push(out[out.length - 1] + step);
  return out;
}
// left margin wide enough for the y tick labels
function leftFor(c, labels) { c.font = FONT; return Math.ceil(Math.max(...labels.map(s => c.measureText(s).width))) + 12; }
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
// labels that must not overlap: each tries a few positions around its anchor and is dropped if none is free
function placer(w, h) {
  const boxes = [];
  const free = b => b.x0 >= 2 && b.x1 <= w - 2 && b.y0 >= 2 && b.y1 <= h - 2 && !boxes.some(o => b.x0 < o.x1 + 3 && b.x1 > o.x0 - 3 && b.y0 < o.y1 + 1 && b.y1 > o.y0 - 1);
  return {
    block(x0, y0, x1, y1) { boxes.push({ x0, y0, x1, y1 }); },
    label(c, s, x, y, col, tries) {
      const tw = c.measureText(s).width, hh = 8;
      for (const [dx, dy, al] of tries || [[8, 0, 'left'], [-8, 0, 'right'], [0, -14, 'center'], [0, 14, 'center']]) {
        const x0 = al === 'left' ? x + dx : al === 'right' ? x + dx - tw : x + dx - tw / 2, b = { x0, x1: x0 + tw, y0: y + dy - hh, y1: y + dy + hh };
        if (free(b)) { boxes.push(b); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y + dy); return true; }
      }
      return false;
    }
  };
}
function splitLabel(c, s, cap) {
  if (c.measureText(s).width + 14 <= cap || s.indexOf(' ') < 0) return [s];
  let best = [s], bw = Infinity;
  for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(c.measureText(a).width, c.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function labelFont(c, labels, cap) { c.font = FONT; const lines = new Map(); let lw = 0; for (const s of labels) { const ls = splitLabel(c, s, cap); lines.set(s, ls); for (const l of ls) lw = Math.max(lw, c.measureText(l).width); } const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: fontPx(12 * k), w: Math.min(lw * k + 14, cap), lines, lh: 13 * k }; }
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
      if (xe - L < tw + 10 && xe + 6 + tw > R) { const k = Math.max(0.6, (R - xe - 6) / tw); c.font = fontPx(12 * k); tw = c.measureText(txt).width; }
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
    swatch(x, y, col) { g.box(x, y - 6, 12, 12, col, { solid: true, rx: 3 }); }
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
// one 1T1C cell and its sense amplifier (ch1); schematic
DG.cell = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 410;
  return { W, H, draw(g) {
    const P = wide ? { wl: [40, 400, 50], bl: 110, tx: 160, ty: 75, cx: 200, ref: 390, sa: [90, 230, 320, 44], cap: 228 } : { wl: [20, 320, 40], bl: 60, tx: 100, ty: 60, cx: 140, ref: 300, sa: [40, 220, 280, 40], cap: 168 };
    g.line(P.wl[0], P.wl[2], P.wl[1], P.wl[2], C.gold, { sw: 2.4 }); g.text(P.wl[0], P.wl[2] - 18, 'dg.cell.wl', { c: 'g' });
    g.line(P.bl, P.wl[2] + 20, P.bl, P.sa[1], C.cyan, { sw: 2.2 }); g.text(P.bl - 10, wide ? 160 : 150, 'dg.cell.bl', { a: 'end', c: 'c' });
    g.box(P.tx, P.ty, 80, 40, C.cyan, { rx: 6 }); g.text(P.tx + 40, P.ty + 20, 'dg.cell.t', { a: 'middle' });
    g.line(P.cx, P.wl[2], P.cx, P.ty, C.gold); g.line(P.tx, P.ty + 20, P.bl, P.ty + 20, C.cyan, { sw: 2.2 });
    const cy = P.ty + 65;
    g.line(P.cx, P.ty + 40, P.cx, cy, C.violet); g.line(P.cx - 20, cy, P.cx + 20, cy, C.violet, { sw: 3 }); g.line(P.cx - 20, cy + 10, P.cx + 20, cy + 10, C.violet, { sw: 3 }); g.line(P.cx, cy + 10, P.cx, cy + 23, C.violet);
    g.text(P.cap, cy + 5, 'dg.cell.c', { c: 'v' });
    g.line(P.cx, cy + 23, P.cx, cy + 45, C.red, { dash: '3 3', arrow: 1 }); g.text(P.cx + 12, cy + 40, 'dg.cell.leak', { c: 'r' });
    g.line(P.ref, wide ? 150 : 175, P.ref, P.sa[1], C.mute, { dash: '5 4' }); g.text(P.ref - 12, wide ? 190 : 200, 'dg.cell.ref', { a: 'end', c: 'm' });
    g.box(P.sa[0], P.sa[1], P.sa[2], P.sa[3], C.green); g.text(P.sa[0] + P.sa[2] / 2, P.sa[1] + P.sa[3] / 2, 'dg.cell.sa', { a: 'middle', c: 'n' });
    const steps = wide ? { x: 440, ys: [80, 150, 220], w: 270 } : { x: 10, ys: [290, 330, 370], w: 320 };
    steps.ys.forEach((y, i) => g.text(steps.x, y, 'dg.cell.e' + (i + 1), { w: steps.w }));
  } };
};
// one bank: row decoder, array, row buffer, column select (ch2); rows and page size from the Micron die
DG.bank = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 290 : 340, v = { rows: fmt(Math.pow(2, M.SPEC.ddr5.rowBits), 0), page: fmt(M.SPEC.ddr5.pageX8, 0) };
  return { W, H, draw(g) {
    const ax = wide ? 160 : 90, aw = wide ? 400 : 240, cx = ax + aw / 2;
    g.text(cx, 16, 'dg.bank.array', { a: 'middle', vars: v, c: 'v' });
    g.box(ax, 30, aw, 150, C.violet, { a: 0.07, rx: 4 });
    for (let y = 45; y < 180; y += 15) if (y < 88 || y > 108) g.line(ax + 1, y, ax + aw - 1, y, C.line, { sw: 1 });
    g.box(ax, 88, aw, 20, C.gold, { a: 0.3, rx: 3 });
    if (wide) { g.box(70, 30, 80, 150, C.cyan, { rx: 4 }); g.text(110, 105, 'dg.bank.rowdec', { a: 'middle', c: 'c', w: 70, va: 'mid' }); g.text(12, 105, 'dg.bank.ra', { c: 'c' }); g.line(56, 105, 68, 105, C.cyan, { arrow: 1 }); g.text(ax + aw + 10, 98, 'dg.bank.open', { c: 'g' }); }
    else { g.box(10, 30, 70, 150, C.cyan, { rx: 4 }); g.text(45, 105, 'dg.bank.rowdec', { a: 'middle', c: 'c', w: 60, va: 'mid' }); g.text(45, 16, 'dg.bank.ra', { a: 'middle', c: 'c' }); g.text(cx, 98, 'dg.bank.open', { a: 'middle' }); }
    g.line(cx, 110, cx, 193, C.gold, { arrow: 1 });
    g.box(ax, 195, aw, 30, C.gold); g.text(cx, 210, 'dg.bank.rb', { a: 'middle', c: 'g' });
    g.box(cx - 60, 240, 120, 28, C.cyan, { rx: 5 }); g.text(cx, 254, 'dg.bank.coldec', { a: 'middle', c: 'c' });
    g.line(cx, 225, cx, 238, C.gold);
    if (wide) { g.text(230, 254, 'dg.bank.ca', { a: 'end', c: 'c' }); g.line(234, 254, cx - 62, 254, C.cyan, { arrow: 1 }); g.line(cx + 60, 254, cx + 110, 254, C.green, { arrow: 1 }); g.text(cx + 116, 254, 'dg.bank.dq', { c: 'n' }); }
    else { g.text(10, 254, 'dg.bank.ca', { c: 'c' }); g.line(56, 254, cx - 62, 254, C.cyan, { arrow: 1 }); g.line(cx, 268, cx, 296, C.green, { arrow: 1 }); g.text(cx, 314, 'dg.bank.dq', { a: 'middle', c: 'n' }); }
  } };
};
// the address split (ch2), field widths in bits from the model's geometry
DG.addr = (L) => {
  const m = M.mapAddr(M.parseHex(M.ADDR.def), 'rowfirst', M.ADDR.ch, M.ADDR.ranks), fs = m.fields.filter(f => f.n > 0).reverse();
  const col = { row: C.violet, ba: C.gold, bg: C.gold, col: C.green, sub: C.cyan, ch: C.cyan, off: C.mute }, cls = { row: 'v', ba: 'g', bg: 'g', col: 'n', sub: 'c', ch: 'c', off: 'm' };
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 260 : 360;
  return { W, H, draw(g) {
    const field = (f, x, y, w, h) => { g.box(x, y, w, h, col[f.f], { rx: 4 }); g.text(x + w / 2, y + h / 2, 'dg.addr.' + f.f, { a: 'middle', c: cls[f.f], vars: { n: f.n } }); };
    if (wide) {
      const ws = { row: 240, ba: 80, bg: 70, col: 100, sub: 50, ch: 60, off: 80 }; let x = 20;
      g.text(20, 34, { raw: String(m.bits - 1) }, { mono: 1, c: 'm' });
      for (const f of fs) { field(f, x, 50, ws[f.f], 46); x += ws[f.f]; g.text(x - 3, 34, { raw: String(f.lo) }, { a: 'end', mono: 1, c: 'm' }); }
      g.text(20, 114, 'dg.addr.hi', { c: 'm' }); g.text(700, 114, 'dg.addr.lo', { a: 'end', c: 'm' });
      [['e1', C.mute], ['e2', C.cyan], ['e3', C.green]].forEach(([k, cc], i) => { g.swatch(20, 150 + i * 36, cc); g.text(40, 150 + i * 36, 'dg.addr.' + k, { w: 660 }); });
    } else {
      field(fs[0], 10, 40, 320, 40); g.text(10, 22, 'dg.addr.hi', { c: 'm' });
      const ws = { ba: 60, bg: 45, col: 50, sub: 45, ch: 60, off: 60 }; let x = 10;
      for (const f of fs.slice(1)) { field(f, x, 96, ws[f.f], 40); x += ws[f.f]; }
      g.text(330, 154, 'dg.addr.lo', { a: 'end', c: 'm' });
      [['e1', C.mute], ['e2', C.cyan], ['e3', C.green]].forEach(([k, cc], i) => { g.swatch(10, 190 + i * 58, cc); g.text(28, 190 + i * 58, 'dg.addr.' + k, { w: 300 }); });
    }
  } };
};
// a row conflict on DDR5-6400B, cycles to scale (ch3)
DG.timing = (L) => {
  const T = M.timing('ddr5-6400b'), I = M.idle(T), tot = I.conflict;
  const wide = L === 'w', W = wide ? 720 : 340, H = 330;
  return { W, H, draw(g) {
    const x0 = wide ? 90 : 52, x1 = wide ? 700 : 330, X = n => x0 + (x1 - x0) * n / tot, yc = 50, yd = 150;
    g.text(wide ? 20 : 8, yc, 'dg.timing.cmd', { c: 'm' }); g.text(wide ? 20 : 8, yd, 'dg.timing.data', { c: 'm' });
    g.line(x0, yc + 18, x1, yc + 18, C.line, { sw: 1 }); g.line(x0, yd + 18, x1, yd + 18, C.line, { sw: 1 });
    const cmds = [[0, 'pre', C.violet], [T.RP, 'act', C.cyan], [T.RP + T.RCD, 'rd', C.gold]];
    for (const [n, k, cc] of cmds) { g.box(X(n), yc - 16, 40, 32, cc, { rx: 5 }); g.text(X(n) + 20, yc, 'dg.timing.' + k, { a: 'middle', mono: 1 }); }
    const spans = [[0, T.RP, 'trp', C.violet, 'v'], [T.RP, T.RP + T.RCD, 'trcd', C.cyan, 'c'], [T.RP + T.RCD, T.RP + T.RCD + T.CL, 'cl', C.gold, 'g']];
    for (const [a, b, k, cc, cl] of spans) { g.line(X(a) + 2, 96, X(b) - 2, 96, cc, { arrow: 1 }); g.line(X(a), 90, X(a), 102, cc); g.text((X(a) + X(b)) / 2, 116, 'dg.timing.' + k, { a: 'middle', c: cl, vars: { n: k === 'trp' ? T.RP : k === 'trcd' ? T.RCD : T.CL } }); }
    g.box(X(tot - T.BL2), yd - 14, X(tot) - X(tot - T.BL2), 28, C.green, { rx: 3, a: 0.35 });
    g.text(x1, yd + 34, 'dg.timing.bl', { a: 'end', c: 'n', vars: { n: T.BL2 } });
    const rows = [['conf', I.conflict, C.red, 'r'], ['miss', I.miss, C.cyan, 'c'], ['hit', I.hit, C.gold, 'g']];
    rows.forEach(([k, n, cc], i) => { const y = 206 + i * 12; g.line(X(tot - n), y, X(tot), y, cc, { sw: 5 }); });
    rows.forEach(([k, n, cc, cl], i) => { const y = 260 + i * 26; g.swatch(wide ? 20 : 8, y, cc); g.text(wide ? 40 : 26, y, 'dg.timing.' + k, { c: cl, vars: { n, ns: fmt(n * T.tck, 2) } }); });
  } };
};
// a DDR5 module: two 32-bit subchannels, PMIC, SPD hub (ch5)
DG.dimm = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 270 : 420;
  return { W, H, draw(g) {
    const chip = (x, y, w, h, ecc) => { g.box(x, y, w, h, ecc ? C.gold : C.violet, { rx: 4, dash: ecc ? '5 3' : 'none' }); g.text(x + w / 2, y + h / 2, ecc ? 'dg.dimm.ecc' : 'dg.dimm.chip', { a: 'middle', c: ecc ? 'g' : 'v', fs: ecc ? 13.5 : 14 }); };
    if (wide) {
      g.box(20, 30, 680, 160, C.mute, { a: 0.05 });
      for (let i = 0; i < 40; i++) g.box(40 + i * 16, 192, 10, 14, C.gold, { a: 0.5, rx: 1, sw: 0.8 });
      g.text(36, 54, 'dg.dimm.subA', { c: 'c' }); g.text(684, 54, 'dg.dimm.subB', { a: 'end', c: 'c' });
      for (let i = 0; i < 5; i++) { chip(36 + i * 46, 72, 40, 58, i === 4); chip(454 + i * 46, 72, 40, 58, i === 0); }
      g.text(151, 160, 'dg.dimm.caA', { a: 'middle', c: 'm' }); g.text(569, 160, 'dg.dimm.caB', { a: 'middle', c: 'm' });
      g.box(280, 62, 160, 44, C.red, { rx: 6 }); g.text(360, 84, 'dg.dimm.pmic', { a: 'middle', c: 'r' });
      g.box(300, 120, 120, 36, C.green, { rx: 6 }); g.text(360, 138, 'dg.dimm.spd', { a: 'middle', c: 'n' });
      g.text(360, 240, 'dg.dimm.note', { a: 'middle' });
    } else {
      g.box(10, 10, 320, 336, C.mute, { a: 0.05 });
      for (let i = 0; i < 19; i++) g.box(20 + i * 16, 348, 10, 14, C.gold, { a: 0.5, rx: 1, sw: 0.8 });
      g.text(20, 32, 'dg.dimm.subA', { c: 'c' }); for (let i = 0; i < 5; i++) chip(20 + i * 60, 46, 52, 48, i === 4); g.text(20, 112, 'dg.dimm.caA', { c: 'm' });
      g.text(20, 148, 'dg.dimm.subB', { c: 'c' }); for (let i = 0; i < 5; i++) chip(20 + i * 60, 162, 52, 48, i === 4); g.text(20, 228, 'dg.dimm.caB', { c: 'm' });
      g.box(20, 250, 300, 36, C.red, { rx: 6 }); g.text(170, 268, 'dg.dimm.pmic', { a: 'middle', c: 'r' });
      g.box(20, 298, 160, 34, C.green, { rx: 6 }); g.text(100, 315, 'dg.dimm.spd', { a: 'middle', c: 'n' });
      g.text(170, 392, 'dg.dimm.note', { a: 'middle', w: 320, va: 'mid' });
    }
  } };
};
// eight bank groups of four banks (ch6); timings from the model at 6400 MT/s
DG.bg = (L) => {
  const T = M.genericTiming(6400), wide = L === 'w', W = wide ? 720 : 340, H = wide ? 340 : 470;
  return { W, H, draw(g) {
    const grp = (x, y, w, i) => {
      g.box(x, y, w, 70, C.violet, { a: 0.07 }); g.text(x + 8, y + 16, 'dg.bg.grp', { c: 'v', vars: { n: i } });
      const sw = wide ? 24 : 28, gap = wide ? 4 : 6;
      for (let j = 0; j < 4; j++) { const hot = (i === 0 && j < 2) ? C.red : (i === 1 && j === 0) ? C.green : C.dimfill; g.box(x + 8 + j * (sw + gap), y + 32, sw, 28, hot, { a: hot === C.dimfill ? 0.5 : 0.3, rx: 3 }); }
    };
    if (wide) {
      for (let i = 0; i < 8; i++) { const x = 20 + (i % 4) * 130, y = i < 4 ? 10 : 170; grp(x, y, 120, i); g.line(x + 60, i < 4 ? 80 : 170, x + 60, 130, C.mute); }
      g.line(80, 130, 548, 130, C.mute, { sw: 2.4 }); g.box(550, 112, 150, 36, C.cyan, { rx: 6 }); g.text(625, 130, 'dg.bg.io', { a: 'middle', c: 'c' });
      g.swatch(20, 280, C.red); g.text(40, 280, 'dg.bg.same', { vars: { n: T.CCDL } });
      g.swatch(20, 310, C.green); g.text(40, 310, 'dg.bg.diff', { vars: { n: T.CCDS } });
    } else {
      for (let i = 0; i < 8; i++) { const x = i % 2 ? 180 : 10, y = 10 + Math.floor(i / 2) * 80; grp(x, y, 150, i); g.line(i % 2 ? 180 : 160, y + 35, 170, y + 35, C.mute); }
      g.line(170, 45, 170, 340, C.mute, { sw: 2.4 }); g.box(95, 340, 150, 34, C.cyan, { rx: 6 }); g.text(170, 357, 'dg.bg.io', { a: 'middle', c: 'c' });
      g.swatch(10, 404, C.red); g.text(28, 404, 'dg.bg.same', { vars: { n: T.CCDL } });
      g.swatch(10, 434, C.green); g.text(28, 434, 'dg.bg.diff', { vars: { n: T.CCDS } });
    }
  } };
};
// one and two modules per channel; fly-by clock and command (ch7)
DG.dpc = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 410 : 470;
  return { W, H, draw(g) {
    const dimm = (x, y, w, h, n, cw) => { g.box(x, y, w, h, C.violet, { a: 0.07 }); const step = (w - 20) / n; for (let i = 0; i < n; i++) g.box(x + 10 + i * step + (step - cw) / 2, y + 8, cw, h - 22, C.violet, { rx: 3, a: 0.2 }); g.line(x + 6, y + h - 7, x + w - 6, y + h - 7, C.gold, { dash: '5 3' }); for (let i = 0; i < n; i++) g.circle(x + 10 + i * step + step / 2, y + h - 7, 2.5, C.gold, { solid: true }); };
    if (wide) {
      g.box(20, 40, 110, 270, C.cyan); g.text(75, 175, 'dg.dpc.mc', { a: 'middle', c: 'c', w: 90, va: 'mid' });
      g.text(160, 30, 'dg.dpc.one', { c: 'c' }); g.text(700, 30, 'dg.dpc.d1', { a: 'end', c: 'm' });
      dimm(300, 44, 400, 62, 5, 50); g.line(130, 70, 298, 70, C.cyan, { sw: 2.4, arrow: 1 }); g.line(130, 99, 306, 99, C.gold, { dash: '5 3' });
      g.text(160, 166, 'dg.dpc.two', { c: 'c' }); g.text(700, 172, 'dg.dpc.d1', { a: 'end', c: 'm' }); g.text(700, 246, 'dg.dpc.d2', { a: 'end', c: 'm' });
      dimm(300, 180, 400, 54, 5, 50); dimm(300, 256, 400, 54, 5, 50);
      g.line(130, 200, 298, 200, C.cyan, { sw: 2.4, arrow: 1 }); g.line(270, 200, 270, 276, C.red, { sw: 2.4 }); g.line(270, 276, 298, 276, C.red, { sw: 2.4, arrow: 1 });
      [['dq', C.cyan, 0], ['fly', C.gold, '5 3'], ['stub', C.red, 0]].forEach(([k, cc, dash], i) => { const y = 340 + i * 26; g.line(20, y, 44, y, cc, { sw: 2.4, dash: dash || 'none' }); g.text(54, y, 'dg.dpc.' + k, { w: 640 }); });
    } else {
      g.box(10, 10, 320, 40, C.cyan); g.text(170, 30, 'dg.dpc.mc', { a: 'middle', c: 'c' });
      g.text(30, 72, 'dg.dpc.one', { c: 'c' }); dimm(10, 86, 296, 52, 5, 40); g.line(18, 50, 18, 84, C.cyan, { sw: 2.4, arrow: 1 });
      g.text(30, 166, 'dg.dpc.two', { c: 'c' }); dimm(10, 180, 296, 52, 5, 40); dimm(10, 250, 296, 52, 5, 40);
      g.line(324, 50, 324, 206, C.cyan, { sw: 2.4 }); g.line(324, 206, 308, 206, C.cyan, { sw: 2.4, arrow: 1 }); g.line(324, 206, 324, 276, C.red, { sw: 2.4 }); g.line(324, 276, 308, 276, C.red, { sw: 2.4, arrow: 1 });
      [['dq', C.cyan, 0], ['fly', C.gold, '5 3'], ['stub', C.red, 0]].forEach(([k, cc, dash], i) => { const y = 336 + i * 44; g.line(10, y, 30, y, cc, { sw: 2.4, dash: dash || 'none' }); g.text(38, y, 'dg.dpc.' + k, { w: 296 }); });
    }
  } };
};
// what on-die and side-band ECC cover (ch8)
DG.ecc = (L) => {
  const v = { d: M.SPEC.ddr5.odEcc.data, c: M.SPEC.ddr5.odEcc.check }, wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 390;
  return { W, H, draw(g) {
    if (wide) {
      g.box(20, 60, 180, 90, C.gold); g.text(110, 88, 'dg.ecc.mc', { a: 'middle', c: 'g' }); g.text(110, 122, 'dg.ecc.sb', { a: 'middle' });
      for (const y of [95, 105, 115]) g.line(200, y, 470, y, C.mute);
      g.text(335, 76, 'dg.ecc.wire', { a: 'middle', c: 'm' });
      g.box(470, 30, 230, 150, C.violet, { a: 0.07 }); g.text(585, 50, 'dg.ecc.chip', { a: 'middle', c: 'v' });
      g.box(490, 70, 190, 90, C.green, { a: 0.1 }); g.text(585, 96, 'dg.ecc.array', { a: 'middle' }); g.text(585, 130, 'dg.ecc.od', { a: 'middle', c: 'n', vars: v });
      g.line(480, 198, 690, 198, C.green, { sw: 3 }); g.line(480, 190, 480, 206, C.green); g.line(690, 190, 690, 206, C.green); g.text(585, 222, 'dg.ecc.odr', { a: 'middle', c: 'n' });
      g.line(20, 248, 700, 248, C.gold, { sw: 3 }); g.line(20, 240, 20, 256, C.gold); g.line(700, 240, 700, 256, C.gold); g.text(360, 274, 'dg.ecc.sbr', { a: 'middle', c: 'g' });
    } else {
      g.box(10, 10, 300, 70, C.gold); g.text(160, 32, 'dg.ecc.mc', { a: 'middle', c: 'g' }); g.text(160, 58, 'dg.ecc.sb', { a: 'middle' });
      for (const x of [150, 160, 170]) g.line(x, 80, x, 150, C.mute);
      g.text(184, 115, 'dg.ecc.wire', { c: 'm' });
      g.box(10, 150, 300, 130, C.violet, { a: 0.07 }); g.text(160, 168, 'dg.ecc.chip', { a: 'middle', c: 'v' });
      g.box(30, 188, 260, 76, C.green, { a: 0.1 }); g.text(160, 208, 'dg.ecc.array', { a: 'middle' }); g.text(160, 240, 'dg.ecc.od', { a: 'middle', c: 'n', vars: v });
      g.line(320, 150, 320, 280, C.green, { sw: 3 }); g.line(330, 10, 330, 280, C.gold, { sw: 3 });
      g.swatch(10, 316, C.green); g.text(28, 316, 'dg.ecc.odr', { c: 'n', w: 300 });
      g.swatch(10, 350, C.gold); g.text(28, 350, 'dg.ecc.sbr', { c: 'g', w: 300 });
    }
  } };
};
// a socketed module against package-on-package LPDDR (ch9)
DG.pop = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 350;
  return { W, H, draw(g) {
    const stack = (x, y, w) => {
      g.text(x + w / 2, y, 'dg.pop.short', { a: 'middle', c: 'n' });
      g.box(x + 20, y + 20, w - 40, 40, C.violet); g.text(x + w / 2, y + 40, 'dg.pop.lp', { a: 'middle', c: 'v' });
      for (let i = 0; i < 9; i++) g.circle(x + 34 + i * (w - 68) / 8, y + 66, 3, C.mute, { solid: true });
      g.box(x, y + 72, w, 40, C.cyan); g.text(x + w / 2, y + 92, 'dg.pop.cpu', { a: 'middle', c: 'c' });
      g.box(x - 20, y + 112, w + 40, 12, C.mute, { a: 0.2, rx: 2 }); g.text(x + w / 2, y + 146, 'dg.pop.pkg', { a: 'middle', c: 'm' });
    };
    if (wide) {
      g.box(20, 60, 100, 60, C.cyan); g.text(70, 90, 'dg.pop.cpu', { a: 'middle', c: 'c' });
      g.line(120, 90, 258, 90, C.gold, { sw: 2.4 }); g.text(190, 72, 'dg.pop.board', { a: 'middle', c: 'g' });
      g.box(260, 70, 40, 40, C.mute, { a: 0.25, rx: 3 }); g.text(290, 132, 'dg.pop.slot', { a: 'end', c: 'm' });
      g.box(300, 30, 60, 110, C.violet, { a: 0.1 }); for (let i = 0; i < 4; i++) g.box(310, 38 + i * 25, 40, 18, C.violet, { rx: 3, a: 0.25 });
      g.text(330, 160, 'dg.pop.dimm', { a: 'middle', c: 'v' });
      g.line(400, 20, 400, 230, C.line, { sw: 1 });
      stack(470, 50, 200);
    } else {
      g.box(10, 20, 96, 50, C.cyan); g.text(58, 45, 'dg.pop.cpu', { a: 'middle', c: 'c' });
      g.line(106, 45, 218, 45, C.gold, { sw: 2.4 }); g.text(162, 70, 'dg.pop.board', { a: 'middle', c: 'g' });
      g.box(220, 30, 24, 30, C.mute, { a: 0.25, rx: 3 }); g.box(244, 10, 80, 70, C.violet, { a: 0.1 }); for (let i = 0; i < 3; i++) g.box(252, 18 + i * 19, 64, 13, C.violet, { rx: 3, a: 0.25 });
      g.text(232, 100, 'dg.pop.slot', { a: 'middle', c: 'm' }); g.text(284, 124, 'dg.pop.dimm', { a: 'middle', c: 'v' });
      g.line(10, 150, 330, 150, C.line, { sw: 1 });
      stack(70, 176, 200);
    }
  } };
};
// two PAM3 symbols: 9 pairs, 8 used for 3 bits (ch9); the code assignment is illustrative
DG.pam3 = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 260 : 280, lv = ['−1', '0', '+1'];
  return { W, H, draw(g) {
    const P = wide ? { x: 200, y: 50, cw: 80, ch: 60 } : { x: 90, y: 66, cw: 70, ch: 50 };
    let code = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = P.x + c * P.cw, y = P.y + r * P.ch, unused = r === 1 && c === 1;
      g.box(x + 2, y + 2, P.cw - 4, P.ch - 4, unused ? C.dimfill : C.gold, { a: unused ? 0.4 : 0.12, rx: 5 });
      g.text(x + P.cw / 2, y + P.ch / 2, unused ? 'dg.pam3.unused' : { raw: (code++).toString(2).padStart(3, '0') }, { a: 'middle', mono: !unused, c: unused ? 'm' : '' });
    }
    for (let i = 0; i < 3; i++) { g.text(P.x - 10, P.y + i * P.ch + P.ch / 2, { raw: lv[i] }, { a: 'end', mono: 1, c: 'g' }); g.text(P.x + i * P.cw + P.cw / 2, P.y - 14, { raw: lv[i] }, { a: 'middle', mono: 1, c: 'c' }); }
    if (wide) { g.text(130, P.y + 1.5 * P.ch, 'dg.pam3.s1', { a: 'end', c: 'g' }); g.text(P.x + 1.5 * P.cw, 14, 'dg.pam3.s2', { a: 'middle', c: 'c' }); g.text(470, 140, 'dg.pam3.note', { w: 230, va: 'mid' }); }
    else { g.text(10, 20, 'dg.pam3.s1', { c: 'g' }); g.text(330, 20, 'dg.pam3.s2', { a: 'end', c: 'c' }); g.text(170, 250, 'dg.pam3.note', { a: 'middle', w: 320, va: 'mid' }); }
  } };
};
// single- and double-sided hammering (ch10); schematic
DG.hammer = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 560;
  return { W, H, draw(g) {
    const kinds = { o: [C.dimfill, 0.5], v: [C.gold, 0.25], a: [C.red, 0.35], V: [C.gold, 0.5] };
    const panel = (x, y, w, key, rows) => {
      g.text(x, y, 'dg.hammer.' + key, { c: 'm', weight: 600 });
      rows.split('').forEach((k, i) => { const [cc, a] = kinds[k]; g.box(x, y + 18 + i * 26, w, 20, cc, { a, rx: 3, sw: k === 'V' ? 2.6 : 1.2 }); });
    };
    if (wide) { panel(20, 30, 320, 'single', 'oovavoo'); panel(380, 30, 320, 'double', 'ovaVavo');
      [['agg', C.red, 'r'], ['vic', C.gold, 'g'], ['ok', C.dimfill, 'm']].forEach(([k, cc, cl], i) => { const x = [20, 275, 525][i]; g.swatch(x, 262, cc); g.text(x + 20, 262, 'dg.hammer.' + k, { c: cl }); });
    } else { panel(10, 20, 320, 'single', 'oovavoo'); panel(10, 236, 320, 'double', 'ovaVavo');
      [['agg', C.red, 'r'], ['vic', C.gold, 'g'], ['ok', C.dimfill, 'm']].forEach(([k, cc, cl], i) => { const y = 470 + i * 28; g.swatch(10, y, cc); g.text(30, y, 'dg.hammer.' + k, { c: cl }); });
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

/* ───────── 01 refresh ───────── */
(() => {
  const cv = $('#rfCv'), hot = $('#rfHot');
  const CHIPS = ['d4_2', 'd4_4', 'd4_8', 'd4_16', 'd5_8', 'd5_16'];
  const parse = id => { const [g, d] = id.split('_'); return { gen: g === 'd4' ? 'ddr4' : 'ddr5', density: +d }; };
  const cur = () => Object.assign(parse(radioVal('rfC')), { mode: radioVal('rfM'), hot: hot.checked });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = cur();
    const rows = CHIPS.map(id => { const p = parse(id), r = M.refresh(p.gen, p.density, o.hot, o.mode); return [t('ch1.chip.' + id), r.busy, p.gen === 'ddr5' ? C.violet : C.cyan, pct(r.busy, 1)]; });
    bars(c, w, h, rows, 0.18, CHIPS.indexOf(radioVal('rfC')));
  } });
  function text() {
    const o = cur(), z = M.say.refresh(o.gen, o.density, o.hot, o.mode), r = z.v;
    radios('rfM').forEach(e => { e.disabled = o.gen === 'ddr4'; });
    const v = { refi: U('us', r.tREFI / 1000, 'nice'), rfc: U('ns', r.tRFC, 0), busy: pct(r.busy, 1), extra: U('ns', r.extra, 1) };
    put('#rfI', v.refi); put('#rfR', v.rfc); put('#rfB', v.busy); put('#rfE', v.extra);
    putHTML('#rfSay', t(z.key, v));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll(radios('rfC'), 'change', go); onAll(radios('rfM'), 'change', go); hot.addEventListener('change', go);
  text();
})();

/* ───────── 02 the address split ───────── */
(() => {
  const inp = $('#adA'), A = M.ADDR, cls = { row: 't', ba: 'o', bg: 'o', ch: 'x', sub: 'x', col: '', off: '', rank: '' };
  function text() {
    const a = M.parseHex(inp.value), scheme = radioVal('adS');
    if (a == null) { ['#adC', '#adB', '#adR', '#adL'].forEach(s => put(s, t('u.none'))); $('#adBits').textContent = ''; $('#adBits').__h = ''; putHTML('#adSay', t('ch2.say.bad')); return; }
    const m = M.mapAddr(a, scheme, A.ch, A.ranks), z = M.say.addr(m);
    putHTML('#adBits', m.fields.filter(f => f.n > 0).slice().reverse().map(f => `<span class="${cls[f.f]}"><i>${esc(t('ch2.bits.f.' + f.f, { n: f.n }))}</i><b>${f.v.toString(2).padStart(f.n, '0')}</b></span>`).join(''));
    put('#adC', t('ch2.chsub', { ch: m.ch, sub: m.sub })); put('#adB', t('ch2.bgba', { bg: m.bg, ba: m.ba })); put('#adR', fmt(m.row, 0)); put('#adL', fmt(m.col, 0));
    const step = M.LINE * A.ch * M.SPEC.ddr5.subs, n2 = M.mapAddr(a + step, scheme, A.ch, A.ranks);
    const next = n2.bank === m.bank && n2.row === m.row ? 'ch2.next.col' : n2.row === m.row && n2.ba === m.ba ? 'ch2.next.bg' : 'ch2.next.row';
    putHTML('#adSay', t(z.key, { ch: m.ch, sub: m.sub, bg: m.bg, ba: m.ba, bank: m.bank, row: fmt(m.row, 0), col: fmt(m.col, 0), next: t(next), step: fmt(step, 0), abits: fmt(m.bits, 0) }));
  }
  inp.addEventListener('input', text); onAll(radios('adS'), 'change', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 03 the command simulator ───────── */
(() => {
  const cv = $('#c3Cv'), K = 6;
  const opts = () => [radioVal('c3T'), radioVal('c3P'), radioVal('c3B')];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = M.ch3M(...opts()), T = s.T, R = s.chain.reqs.slice(0, K), tEnd = R[R.length - 1].end, nsEnd = tEnd * T.tck;
    const lab = [t('ch3.cv.cmd'), t('ch3.cv.data')], Lm = leftFor(c, lab) + 4;
    const ticks = niceTicks(nsEnd, w < 400 ? 3 : 6), f = frame(w, h, [24, 14, 44, Lm], 0, ticks[ticks.length - 1], 0, 1);
    const yc = f.T + (f.B - f.T) * 0.3, yd = f.T + (f.B - f.T) * 0.72, X = cyc => f.X(cyc * T.tck);
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(lab[0], f.L - 8, yc); c.fillText(lab[1], f.L - 8, yd);
    c.strokeStyle = C.grid; [yc, yd].forEach(y => { c.beginPath(); c.moveTo(f.L, y); c.lineTo(f.R, y); c.stroke(); });
    // each request: a faint band from when it was asked for to when its data finished
    R.forEach((r, i) => { c.fillStyle = i % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.06)'; c.fillRect(X(r.arr), f.T, Math.max(1, X(r.end) - X(r.arr)), f.B - f.T); });
    const colOf = { PRE: C.violet, ACT: C.cyan, RD: C.gold };
    for (const e of s.chain.log) { if (e.t > tEnd) break; const x = X(e.t); c.fillStyle = colOf[e.c]; c.fillRect(x - 2, yc - 13, Math.max(4, X(e.t + 1) - x), 26); }
    R.forEach(r => { c.fillStyle = C.green; const x0 = X(r.end - T.BL2); c.fillRect(x0, yd - 11, Math.max(3, X(r.end) - x0), 22); });
    c.fillStyle = C.mute; spacedTicks(c, ticks.map(v => [f.X(v), fmt(v, 0)]), f.B + 12, w);
    c.textAlign = 'right'; const xl = t('ch3.cv.t'); const xw = c.measureText(xl).width; if (xw > f.R - 4) c.font = fontPx(12 * Math.max(0.7, (f.R - 4) / xw)); c.fillText(xl, f.R, f.B + 30); c.font = FONT;
  } });
  function text() {
    const o = opts(), z = M.say.ch3(...o), s = z.v, T = s.T, k = s.chain.counts, I = s.idle;
    const v = { h: fmt(k.hit, 0), m: fmt(k.miss, 0), c: fmt(k.conflict, 0), lat: U('ns', s.chain.avgLat * T.tck, 1), hit: U('ns', I.hit * T.tck, 1) };
    put('#c3H', t('ch3.hmc', v)); put('#c3L', v.lat); put('#c3G', U('gbs', s.flood.gbps, 1));
    put('#c3I', t('ch3.idle', { h: fmt(I.hit * T.tck, 2), m: fmt(I.miss * T.tck, 2), c: U('ns', I.conflict * T.tck, 2) }));
    putHTML('#c3Say', t(z.key, v));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  ['c3T', 'c3P', 'c3B'].forEach(n => onAll(radios(n), 'change', go));
  text();
})();

/* ───────── 04 the CL paradox ───────── */
function clRows() {
  const tb = $('#clRows'); tb.textContent = '';
  const hk = ['ch4.th.bin', 'ch4.th.kind', 'ch4.th.t', 'ch4.th.cl', 'ch4.th.miss', 'ch4.th.peak'];
  for (const id of M.BIN_ORDER) {
    const b = M.BINS[id], l = M.latency(b), tr = document.createElement('tr');
    if (id === 'ddr4-3200x' || id === 'ddr5-6400x') tr.className = 'hi';
    const kind = b.kind === 'jedec' ? t('ch4.kind.jedec') : b.volt ? t('ch4.kind.xmpv', { v: fmt(b.volt, 2) }) : t('ch4.kind.xmp');
    const cells = [t('ch4.bin.' + id), kind, `${b.cl}-${b.rcd}-${b.rp}`, U('ns', l.cl, 2), U('ns', l.miss, 2), U('gbs', l.peak, 1)];
    cells.forEach((s, j) => { const td = document.createElement('td'); td.textContent = s; if (j) td.dataset.h = t(hk[j]); tr.appendChild(td); });
    tb.appendChild(tr);
  }
}
(() => {
  const cv = $('#clCv'), sM = $('#clM'), sC = $('#clC');
  const ISO = [16, 32, 52];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), mts = +sM.value, cl = +sC.value, ns = cl * 2000 / mts;
    const ymax = Math.max(20, ns * 1.15), yt = niceTicks(ymax, 4), top = yt[yt.length - 1];
    const Lm = leftFor(c, yt.map(v => fmt(v, 0))), f = frame(w, h, [30, 14, 44, Lm], 1600, 9600, 0, top);
    yTicks(c, f, yt, v => fmt(v, 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'), w);
    c.fillStyle = C.mute; spacedTicks(c, (w < 480 ? [1600, 4800, 8000] : [1600, 3200, 4800, 6400, 8000, 9600]).map(x => [f.X(x), fmt(x, 0)]), f.B + 12, w);
    const pl = placer(w, h); pl.block(0, 0, w, f.T - 4); pl.block(0, f.B, w, h); pl.block(0, 0, f.L, h);
    const curve = n => { const pts = []; for (let x = 1600; x <= 9600; x += 100) { const y = n * 2000 / x; if (y <= top) pts.push([x, y]); } return pts; };
    ISO.forEach(n => { const pts = curve(n); if (pts.length < 2) return; path(c, pts, f.X, f.Y, C.line, 1.4, [4, 4]); const p = pts[pts.length - 1]; c.font = FONT; pl.label(c, t('ch4.cv.iso', { n }), f.X(p[0]), f.Y(p[1]), C.mute, [[-4, -10, 'right'], [-4, 10, 'right']]); });
    const pts = curve(cl); if (pts.length > 1) path(c, pts, f.X, f.Y, C.gold, 1.6, [6, 4]);
    for (const id of M.BIN_ORDER) { const b = M.BINS[id], y = b.cl * 2000 / b.mts; dot(c, f.X(b.mts), f.Y(y), b.gen === 'ddr4' ? C.cyan : b.kind === 'xmp' ? C.green : C.violet, 4.5); pl.block(f.X(b.mts) - 5, f.Y(y) - 5, f.X(b.mts) + 5, f.Y(y) + 5); }
    dot(c, f.X(mts), f.Y(ns), C.gold, 6.5); pl.block(f.X(mts) - 7, f.Y(ns) - 7, f.X(mts) + 7, f.Y(ns) + 7);
    c.font = FONT; for (const id of M.BIN_ORDER) { const b = M.BINS[id]; pl.label(c, t('ch4.bin.' + id).replace(/（.*）|\s*\(.*\)/, ''), f.X(b.mts), f.Y(b.cl * 2000 / b.mts), C.mute); }
  } });
  function text() {
    const mts = +sM.value, cl = +sC.value, z = M.say.cl(mts, cl), r = z.v, tck = 2000 / mts;
    put('#clMo', U('mts', mts, 0)); put('#clCo', fmt(cl, 0));
    put('#clT', U('ps', tck * 1000, 1)); put('#clN', U('ns', r.ns, 2)); put('#clB', U('ns', M.SPEC.ddr5.bl / 2 * tck, 2)); put('#clP', U('gbs', mts * 8 / 1000, 1));
    putHTML('#clSay', t(z.key, { cl: fmt(cl, 0), mts: U('mts', mts, 0), ns: U('ns', r.ns, 2), ref: U('ns', r.ref, 1), x: nice(mts / M.BINS['ddr4-3200x'].mts) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sM.addEventListener('input', go); sC.addEventListener('input', go);
  text();
})();

/* ───────── 05 bandwidth ───────── */
(() => {
  const cv = $('#bwCv'), sH = $('#bwH');
  const P = () => Math.round(+sH.value * 10) / 10;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), nb = +radioVal('bwB'), p = P(), peak = M.bandwidthM(1, 0).peak;
    const yt = niceTicks(peak * 1.05, 4), top = yt[yt.length - 1], Lm = leftFor(c, yt.map(v => fmt(v, 0)));
    const f = frame(w, h, [30, 14, 44, Lm], 0, 1, 0, top);
    yTicks(c, f, yt, v => fmt(v, 0)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'), w);
    c.fillStyle = C.mute; spacedTicks(c, [0, 0.2, 0.4, 0.6, 0.8, 1].map(x => [f.X(x), pct(x, 0)]), f.B + 12, w);
    c.strokeStyle = C.red; c.setLineDash([5, 4]); c.lineWidth = 1.4; c.beginPath(); c.moveTo(f.L, f.Y(peak)); c.lineTo(f.R, f.Y(peak)); c.stroke(); c.setLineDash([]);
    const pl = placer(w, h); pl.block(0, 0, w, f.T - 4); pl.block(0, 0, f.L, h);
    const curve = n => { const pts = []; for (let i = 0; i <= 10; i++) pts.push([i / 10, M.bandwidthM(n, i / 10).gbps]); return pts; };
    M.BW.banks.forEach(n => { if (n !== nb) path(c, curve(n), f.X, f.Y, C.dimfill, 1.2); });
    const cur = curve(nb); path(c, cur, f.X, f.Y, C.cyan, 2.4);
    const r = M.bandwidthM(nb, p); dot(c, f.X(p), f.Y(r.gbps), C.gold, 6); pl.block(f.X(p) - 7, f.Y(r.gbps) - 7, f.X(p) + 7, f.Y(r.gbps) + 7);
    c.font = FONT; pl.label(c, t('ch5.cv.peak', { v: U('gbs', peak, 1) }), f.R, f.Y(peak), C.red, [[-2, -10, 'right'], [-2, 10, 'right']]);
  } });
  function text() {
    const nb = +radioVal('bwB'), p = P(), z = M.say.bw(nb, p), r = z.v;
    put('#bwHo', pct(p, 0));
    put('#bwG', U('gbs', r.gbps, 1)); put('#bwF', pct(r.frac, 0)); put('#bwD', U('gbs', r.dimm, 1)); put('#bwR', pct(r.hitRate, 0));
    putHTML('#bwSay', t(z.key, { nb: fmt(nb, 0), p: pct(p, 0), frac: pct(r.frac, 0), gb: U('gbs', r.gbps, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sH.addEventListener('input', go); onAll(radios('bwB'), 'change', go);
  text();
})();

/* ───────── 06 bank groups ───────── */
(() => {
  const cv = $('#bgCv'), sM = $('#bgM'), nR = $('#bgN'), x16 = $('#bgX');
  const opts = () => [+radioVal('bgG'), M.BG.rates[+sM.value], nR.checked, nR.checked && x16.checked];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = opts(), rates = M.BG.rates, hi = +sM.value;
    const yt = [0, 0.25, 0.5, 0.75, 1], Lm = leftFor(c, yt.map(v => pct(v, 0)));
    const f = frame(w, h, [30, 10, 30, Lm], 0, rates.length, 0, 1.12);
    yTicks(c, f, yt, v => pct(v, 0)); axes(c, f, null, t('ch6.cv.y'), w);
    const bw = (f.R - f.L) / rates.length;
    rates.forEach((mts, i) => {
      const r = M.bankGroupsM(o[0], mts, o[2], o[3]), x = f.L + i * bw + bw * 0.18, ww = bw * 0.64, y = f.Y(r.frac);
      c.fillStyle = i === hi ? C.gold : r.frac < 0.9 ? C.red : C.cyan; c.globalAlpha = i === hi ? 1 : 0.75; c.fillRect(x, y, ww, f.B - y); c.globalAlpha = 1;
      const s = pct(r.frac, 0); let fs = 12; c.font = FONT; const tw = c.measureText(s).width; if (tw > bw - 2) { fs = 12 * Math.max(0.7, (bw - 2) / tw); c.font = fontPx(fs); }
      c.fillStyle = i === hi ? C.gold : C.ink; c.textAlign = 'center'; c.fillText(s, x + ww / 2, y - 9); c.font = FONT;
    });
    c.fillStyle = C.mute; c.font = FONT; const lab = rates.map(String), maxw = Math.max(...lab.map(s => c.measureText(fmt(+s, 0)).width));
    if (maxw > bw - 2) c.font = fontPx(12 * Math.max(0.7, (bw - 2) / maxw));
    rates.forEach((mts, i) => { c.fillStyle = i === hi ? C.gold : C.mute; c.textAlign = 'center'; c.fillText(fmt(mts, 0), f.L + i * bw + bw / 2, f.B + 13); });
    c.font = FONT;
  } });
  function text() {
    const o = opts(), z = M.say.bg(...o), r = z.v;
    x16.disabled = !nR.checked;
    put('#bgMo', U('mts', o[1], 0)); put('#bgL', U('ck', r.ccdl, 0)); put('#bgF', pct(r.frac, 0)); put('#bgGb', U('gbs', r.gbps, 1));
    putHTML('#bgSay', t(z.key, { mts: U('mts', o[1], 0), ccdl: fmt(r.ccdl, 0), frac: pct(r.frac, 0), g: fmt(o[0], 0), faw: fmt(r.T.FAW, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sM.addEventListener('input', go); onAll(radios('bgG'), 'change', go); nR.addEventListener('change', go); x16.addEventListener('change', go);
  text();
})();

/* ───────── 07 fly-by skew ───────── */
(() => {
  const cv = $('#fyCv'), sM = $('#fyM'), sP = $('#fyP');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.flyby(+sM.value, +sP.value), n = r.arr.length;
    const lab = r.arr.map((_, i) => t('ch7.cv.chip', { n: i + 1 })), Lm = leftFor(c, lab) + 2;
    const xmax = Math.max(r.span * 1.15, r.ui * 2.2), f = frame(w, h, [12, 16, 44, Lm + 8], -xmax * 0.02, xmax, 0, n);
    // unit intervals as alternating bands, the half-interval line dashed
    for (let k = 0; k * r.ui < xmax; k++) { c.fillStyle = k % 2 ? 'rgba(99,199,230,0.05)' : 'rgba(99,199,230,0.12)'; const x0 = Math.max(f.L, f.X(k * r.ui)), x1 = Math.min(f.R, f.X((k + 1) * r.ui)); c.fillRect(x0, f.T, x1 - x0, f.B - f.T); }
    c.strokeStyle = C.red; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(f.X(r.ui / 2), f.T); c.lineTo(f.X(r.ui / 2), f.B); c.stroke(); c.setLineDash([]);
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
    const rh = (f.B - f.T) / n;
    r.arr.forEach((ps, i) => { const y = f.T + rh * (i + 0.5); c.fillStyle = C.mute; c.textAlign = 'right'; c.font = FONT; c.fillText(lab[i], f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L, y); c.lineTo(f.X(ps), y); c.stroke(); dot(c, f.X(ps), y, ps > r.ui / 2 ? C.red : C.gold, 5); });
    const tk = niceTicks(xmax, w < 400 ? 3 : 6).filter(v => v <= xmax);
    c.fillStyle = C.mute; spacedTicks(c, tk.map(v => [f.X(v), fmt(v, 0)]), f.B + 12, w);
    c.textAlign = 'right'; c.fillText(t('ch7.cv.t'), f.R, f.B + 30);
  } });
  function text() {
    const mts = +sM.value, pitch = +sP.value, z = M.say.fly(mts, pitch), r = z.v;
    const v = { mts: U('mts', mts, 0), ui: U('ps', r.ui, 1), span: U('ps', r.span, 0), x: U('ui', r.spanUi, 2) };
    put('#fyMo', v.mts); put('#fyPo', U('mm', pitch, 0));
    put('#fyU', v.ui); put('#fyS', U('ps', r.step, 1)); put('#fyA', v.span); put('#fyX', v.x);
    putHTML('#fySay', t(z.key, v));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sM.addEventListener('input', go); sP.addEventListener('input', go);
  text();
})();

/* ───────── 08 ECC ───────── */
(() => {
  const cv = $('#ecCv'), ex = $('#ecEx'); let seed = 1;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), code = radioVal('ecC'), kk = +radioVal('ecK');
    const labs = [1, 2, 3].map(k => t('ch8.cv.k', { k })), Lm = leftFor(c, labs) + 4, R = w - 10, rh = (h - 16) / 3;
    [1, 2, 3].forEach((k, i) => {
      const s = M.eccStats(code, k), y = 8 + rh * i + rh / 2, bh = Math.min(26, rh * 0.62);
      c.font = FONT; c.textAlign = 'right'; c.fillStyle = k === kk ? C.gold : C.ink; c.fillText(labs[i], Lm - 10, y);
      let x = Lm;
      [['fixed', C.green], ['due', C.gold], ['silent', C.red]].forEach(([key, col]) => {
        const ww = (R - Lm) * s[key]; if (ww <= 0) return;
        c.fillStyle = col; c.globalAlpha = k === kk ? 1 : 0.55; c.fillRect(x, y - bh / 2, ww, bh); c.globalAlpha = 1;
        const txt = pct(s[key], 0); if (c.measureText(txt).width + 8 < ww) { c.fillStyle = C.bg; c.textAlign = 'center'; c.fillText(txt, x + ww / 2, y); }
        x += ww;
      });
      if (k === kk) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(Lm - 0.5, y - bh / 2 - 0.5, R - Lm + 1, bh + 1); }
    });
  } });
  function example() {
    const code = radioVal('ecC'), k = +radioVal('ecK'), e = M.eccExample(code, k, seed), pos = e.pos.map(p => fmt(p, 0)).join(', ');
    put('#ecExT', code === 'none' ? t('ch8.ex.none', { pos }) : t('ch8.ex', { pos, s: fmt(e.syndrome, 0), out: t('ch8.out.' + e.out) }));
  }
  function text() {
    const code = radioVal('ecC'), k = +radioVal('ecK'), z = M.say.ecc(code, k), r = z.v;
    put('#ecF', pct(r.fixed, 0)); put('#ecD', pct(r.due, 0)); put('#ecS', pct(r.silent, 0)); put('#ecN', fmt(r.total, 0));
    putHTML('#ecSay', t(z.key, { fixed: pct(r.fixed, 0), due: pct(r.due, 0), silent: pct(r.silent, 0), k: fmt(k, 0) }));
    example();
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  ['ecC', 'ecK'].forEach(n => onAll(radios(n), 'change', go));
  ex.addEventListener('click', () => { seed++; example(); });
  text();
})();

/* ───────── 09 PAM3 ───────── */
(() => {
  const cv = $('#sgCv'), sG = $('#sgG'), sK = $('#sgK');
  const K = () => Math.round(+sK.value * 10) / 10;
  const COL = { nrz: C.cyan, pam3: C.gold, pam4: C.violet };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), g = +sG.value, k = K(), lo = 8, hiG = 48;
    let ymax = 0; for (const s of ['nrz', 'pam3', 'pam4']) ymax = Math.max(ymax, M.signal(lo, k)[s].eye);
    const yt = niceTicks(ymax * 1.05, 4), top = yt[yt.length - 1], Lm = leftFor(c, yt.map(v => pct(v, 0)));
    const f = frame(w, h, [30, 14, 44, Lm], lo, hiG, 0, top);
    yTicks(c, f, yt, v => pct(v, 0)); axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'), w);
    c.fillStyle = C.mute; spacedTicks(c, [8, 16, 24, 32, 40, 48].map(x => [f.X(x), fmt(x, 0)]), f.B + 12, w);
    for (const s of ['nrz', 'pam3', 'pam4']) { const pts = []; for (let x = lo; x <= hiG; x += 0.5) pts.push([x, M.signal(x, k)[s].eye]); path(c, pts, f.X, f.Y, COL[s], 2.2); }
    c.strokeStyle = C.mute; c.setLineDash([3, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(f.X(g), f.T); c.lineTo(f.X(g), f.B); c.stroke(); c.setLineDash([]);
    const r = M.signal(g, k); for (const s of ['nrz', 'pam3', 'pam4']) dot(c, f.X(g), f.Y(r[s].eye), COL[s], s === r.best ? 6.5 : 4);
  } });
  function text() {
    const g = +sG.value, k = K(), z = M.say.sig(g, k), r = z.v;
    put('#sgGo', U('gbps', g, 0)); put('#sgKo', t('ch9.kfmt', { v: fmt(k, 1) }));
    put('#sgN', U('ghz', r.nrz.nyq, 1)); put('#sg3', U('ghz', r.pam3.nyq, 1)); put('#sg4', U('ghz', r.pam4.nyq, 1)); put('#sgB', t('ch9.s.' + r.best));
    putHTML('#sgSay', t(z.key, { g: U('gbps', g, 0), e: pct(r[r.best].eye, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sG.addEventListener('input', go); sK.addEventListener('input', go);
  text();
})();

/* ───────── 10 row hammer ───────── */
(() => {
  const cv = $('#rhCv'), sN = $('#rhN');
  const opts = () => [+sN.value, radioVal('rhM'), +radioVal('rhH')];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = opts(), r = M.hammerM(...o), hc = o[2];
    const yt = niceTicks(Math.max(r.worst, hc) * 1.12, 4), top = yt[yt.length - 1], Lm = leftFor(c, yt.map(v => fmt(v, 0)));
    const f = frame(w, h, [30, 12, 16, Lm], 0, r.rows.length, 0, top);
    const hl = t('ch10.cv.hc', { v: fmt(hc, 0) }); c.font = FONT; const hw = c.measureText(hl).width;
    yTicks(c, f, yt, v => fmt(v, 0)); axes(c, f, null, t('ch10.cv.y'), w - hw - 52);
    const bw = (f.R - f.L) / r.rows.length;
    r.rows.forEach((v, i) => { const y = f.Y(v); c.fillStyle = v >= hc ? C.red : C.cyan; c.fillRect(f.L + i * bw + bw * 0.15, y, Math.max(1, bw * 0.7), f.B - y); });
    const yh = f.Y(hc); c.strokeStyle = C.gold; c.setLineDash([6, 4]); c.lineWidth = 1.6; c.beginPath(); c.moveTo(f.L, yh); c.lineTo(f.R, yh); c.stroke(); c.setLineDash([]);
    // the threshold is named in the header row, right-aligned, with a dashed swatch
    c.font = FONT; c.fillStyle = C.gold; c.textAlign = 'right'; c.fillText(hl, w - 8, f.T - 14);
    c.strokeStyle = C.gold; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(w - 14 - hw - 18, f.T - 14); c.lineTo(w - 14 - hw, f.T - 14); c.stroke(); c.setLineDash([]);
  } });
  function text() {
    const o = opts(), z = M.say.rh(...o), r = z.v;
    put('#rhNo', fmt(o[0], 0));
    put('#rhW', fmt(r.worst, 0)); put('#rhF', fmt(r.flips, 0)); put('#rhP', fmt(r.perAgg, 0));
    put('#rhX', o[1] === 'none' ? t('u.none') : fmt(o[1] === 'prac' ? r.alerts : r.trrRef, 0));
    putHTML('#rhSay', t(z.key, { worst: fmt(r.worst, 0), hc: fmt(o[2], 0), flips: fmt(r.flips, 0), n: fmt(o[0], 0), nbo: fmt(r.nbo, 0), alerts: fmt(r.alerts, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); ['rhM', 'rhH'].forEach(n => onAll(radios(n), 'change', go));
  text();
})();

/* ───────── loop ───────── */
applyLang();
function tick() {
  for (const s of sims) if (s.vis && s.dirty) { s.draw(); s.dirty = false; }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
