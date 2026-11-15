/* How CPU caches work: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.CacheModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const { KiB, MiB } = M;

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
const cyc = (x, d) => t('u.cyc', { v: fmt(x, d == null ? (x < 10 ? 1 : 0) : d) });
function size(bytes) { return bytes >= MiB ? t('u.MiB', { v: fmt(bytes / MiB, bytes % MiB ? 1 : 0) }) : bytes >= KiB ? t('u.KiB', { v: fmt(bytes / KiB, bytes % KiB ? 1 : 0) }) : t('u.B', { v: fmt(bytes, 0) }); }
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
  latRows();
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
// Zen 5 L1D split (ch2)
DG.split = (L) => {
  const g1 = M.geometry(M.ZEN.l1d.size, M.ZEN.l1d.ways), top = 47, v = { tb: top + 1 - g1.lowBits, ib: g1.idxBits, ob: g1.offBits, sets: g1.sets, ways: g1.ways };
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 250 : 330, items = [];
  return { W, H, draw(g) {
    const [x0, x1, x2, x3] = L === 'w' ? [20, 400, 570, 700] : [10, 160, 260, 330], y = L === 'w' ? 64 : 60, h = 46;
    g.box(x0, y, x1 - x0, h, C.violet); g.box(x1, y, x2 - x1, h, C.cyan); g.box(x2, y, x3 - x2, h, C.gold);
    const long = L === 'w';
    g.text((x0 + x1) / 2, y + h / 2, long ? 'dg.split.tag' : 'dg.split.tagS', { a: 'middle', vars: v, c: 'v' });
    g.text((x1 + x2) / 2, y + h / 2, long ? 'dg.split.idx' : 'dg.split.idxS', { a: 'middle', vars: v, c: 'c' });
    g.text((x2 + x3) / 2, y + h / 2, long ? 'dg.split.off' : 'dg.split.offS', { a: 'middle', vars: v, c: 'g' });
    const yb = y - 16, nb = { raw: '' };
    g.text(x0 + 3, yb, { raw: String(top) }, { mono: 1, c: 'm' }); g.text(x1 - 3, yb, { raw: String(g1.lowBits) }, { a: 'end', mono: 1, c: 'm' }); g.text(x1 + 3, yb, { raw: String(g1.lowBits - 1) }, { mono: 1, c: 'm' });
    g.text(x2 - 3, yb, { raw: String(g1.offBits) }, { a: 'end', mono: 1, c: 'm' }); g.text(x2 + 3, yb, { raw: String(g1.offBits - 1) }, { mono: 1, c: 'm' }); g.text(x3 - 3, yb, { raw: '0' }, { a: 'end', mono: 1, c: 'm' });
    const ys = L === 'w' ? [150, 182, 214] : [140, 202, 264], ww = L === 'w' ? 640 : 300, xs = L === 'w' ? 44 : 30;
    [['dg.split.e1', C.violet], ['dg.split.e2', C.cyan], ['dg.split.e3', C.gold]].forEach(([k, col], i) => { g.box(xs - 22, ys[i] - 6, 12, 12, col, { solid: true, rx: 3 }); g.text(xs, ys[i], k, { vars: v, w: ww }); });
  } };
};
// a 4-set, 4-way cache and one lookup (ch3); tags are schematic
DG.assoc = (L) => {
  const tags = ['0x3A1', '0x07F', '0x512', '0x12C'], hitWay = 2, sel = 2;
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 320 : 430;
  return { W, H, draw(g) {
    const wide = L === 'w';
    const ab = wide ? [20, 60, 140, 200, 250] : [10, 30, 160, 260, 330];          // address bar: x0, y, x1, x2, x3
    const ay = ab[1], ah = 36;
    if (wide) { g.box(20, ay, 120, ah, C.violet); g.box(140, ay, 80, ah, C.cyan); g.box(220, ay, 60, ah, C.gold);
      g.text(80, ay + ah / 2, 'dg.assoc.tag', { a: 'middle', c: 'v' }); g.text(180, ay + ah / 2, 'dg.assoc.idx', { a: 'middle', c: 'c', vars: { s: sel } }); g.text(250, ay + ah / 2, 'dg.assoc.off', { a: 'middle', c: 'g' });
      g.text(20, ay - 18, 'dg.assoc.addr', { c: 'm' }); g.text(20, ay + ah + 22, { raw: tags[hitWay] }, { mono: 1, c: 'v' });
    } else { g.box(10, ay, 150, ah, C.violet); g.box(160, ay, 100, ah, C.cyan); g.box(260, ay, 70, ah, C.gold);
      g.text(85, ay + ah / 2, { raw: t('dg.assoc.tag') + ' ' + tags[hitWay] }, { a: 'middle', c: 'v', mono: 0 }); g.text(210, ay + ah / 2, 'dg.assoc.idx', { a: 'middle', c: 'c', vars: { s: sel } }); g.text(295, ay + ah / 2, 'dg.assoc.off', { a: 'middle', c: 'g' });
    }
    const gx = wide ? 360 : 60, cw = wide ? 80 : 63, gap = 6, gy = wide ? 60 : 120, rh = 30, rg = 10;
    for (let w = 0; w < 4; w++) g.text(gx + w * (cw + gap) + cw / 2, gy - 16, wide ? 'dg.assoc.way' : 'dg.assoc.wayS', { a: 'middle', c: 'm', vars: { w } });
    for (let s = 0; s < 4; s++) {
      const y = gy + s * (rh + rg);
      g.text(gx - 10, y + rh / 2, 'dg.assoc.set', { a: 'end', c: s === sel ? 'c' : 'm', vars: { s } });
      for (let w = 0; w < 4; w++) {
        const x = gx + w * (cw + gap), on = s === sel;
        g.box(x, y, cw, rh, on ? (w === hitWay ? C.green : C.cyan) : C.dimfill, { a: on ? 0.16 : 0.5, rx: 5 });
        if (on) g.text(x + cw / 2, y + rh / 2, { raw: tags[w] }, { a: 'middle', mono: 1, c: w === hitWay ? 'n' : '' });
      }
    }
    const cy = gy + 4 * (rh + rg) + 34, ry = gy + sel * (rh + rg) + rh;
    for (let w = 0; w < 4; w++) { const x = gx + w * (cw + gap) + cw / 2; g.line(x, ry, x, cy - 14, w === hitWay ? C.green : C.mute, { arrow: 1 }); g.circle(x, cy, 14, w === hitWay ? C.green : C.mute); g.text(x, cy, { raw: '=' }, { a: 'middle', c: w === hitWay ? 'n' : 'm' }); }
    if (wide) { g.line(80, ay + ah, 80, cy, C.violet, { dash: '4 4' }); g.line(80, cy, gx - 20, cy, C.violet, { dash: '4 4', arrow: 1 }); g.line(180, ay + ah, 180, ay + ah + 40, C.cyan, {}); g.line(180, ay + ah + 40, gx - 46, gy + sel * (rh + rg) + rh / 2, C.cyan, { arrow: 1 }); }
    g.text(wide ? gx + (4 * cw + 3 * gap) / 2 : 170, cy + 40, 'dg.assoc.res', { a: 'middle', c: 'n', vars: { tag: tags[hitWay], w: hitWay } });
  } };
};
// tree pseudo-LRU for 8 ways (ch4): bits from the model after filling ways 0–7 and touching way 2
function plruState() {
  const c = M.makeCache({ size: 8 * 64, ways: 8, policy: 'plru' });
  for (let i = 0; i < 8; i++) c.fill(i, 0); const i2 = c.probe(2); c.touch(i2, 0);
  const bits = c.treeBits(0); let node = 1, lo = 0, hi = 8; const pathN = [1];
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (bits[node - 1] === 0) { node = 2 * node; hi = mid; } else { node = 2 * node + 1; lo = mid; } pathN.push(node); }
  return { bits, victim: lo, pathN, touched: 2 };
}
DG.plru = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 320 : 330, st = plruState();
  return { W, H, draw(g) {
    const wide = L === 'w', lvY = wide ? [44, 110, 176] : [40, 104, 168], leafY = wide ? 226 : 214, span = wide ? 720 : 340;
    const pos = n => { const lvl = Math.floor(Math.log2(n)), k = n - Math.pow(2, lvl), cnt = Math.pow(2, lvl); return [span * (k + 0.5) / cnt, lvY[lvl]]; };
    for (let n = 1; n < 8; n++) for (const ch of [2 * n, 2 * n + 1]) {
      const [x1, y1] = pos(n); let x2, y2; if (ch < 8) [x2, y2] = pos(ch); else { const leaf = ch - 8; x2 = span * (leaf + 0.5) / 8; y2 = leafY; }
      const onPath = st.pathN.includes(n) && (ch < 8 ? st.pathN.includes(ch) : ch - 8 === st.victim);
      g.line(x1, y1 + 16, x2, y2 - (ch < 8 ? 16 : 2), onPath ? C.gold : C.line, { sw: onPath ? 2.4 : 1.4 });
    }
    for (let n = 1; n < 8; n++) { const [x, y] = pos(n), on = st.pathN.includes(n); g.circle(x, y, 16, on ? C.gold : C.mute); g.text(x, y, { raw: String(st.bits[n - 1]) }, { a: 'middle', mono: 1, c: on ? 'g' : '' }); }
    const lw = wide ? 64 : 34;
    for (let i = 0; i < 8; i++) { const x = span * (i + 0.5) / 8, v = i === st.victim, tc = i === st.touched; g.box(x - lw / 2, leafY, lw, 28, v ? C.red : tc ? C.cyan : C.dimfill, { a: v || tc ? 0.18 : 0.5, rx: 5 }); g.text(x, leafY + 14, wide ? 'dg.plru.leaf' : { raw: String(i) }, { a: 'middle', c: v ? 'r' : tc ? 'c' : '', vars: { i } }); }
    g.text(wide ? 20 : 10, leafY + 56, 'dg.plru.note', { vars: { t: st.touched, v: st.victim }, w: wide ? 680 : 320, c: 'm' });
  } };
};
// write path (ch5): core → L1 (valid, dirty, tag, data) → write buffer → next level
DG.write = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 320 : 590;
  return { W, H, draw(g) {
    const wide = L === 'w';
    if (wide) {
      g.box(20, 80, 90, 56, C.gold); g.text(65, 108, 'dg.write.core', { a: 'middle', c: 'g' });
      g.box(160, 50, 250, 116, C.cyan); g.text(176, 72, 'dg.write.l1', { c: 'c' });
      const fx = [172, 222, 262, 330], fw = [46, 36, 64, 68], fk = ['dg.write.v', 'dg.write.d', 'dg.write.tag', 'dg.write.data'];
      fk.forEach((k, i) => { g.box(fx[i], 102, fw[i], 34, i === 1 ? C.red : C.mute, { a: i === 1 ? 0.2 : 0.1, rx: 4 }); g.text(fx[i] + fw[i] / 2, 119, k, { a: 'middle', c: i === 1 ? 'r' : '' }); });
      g.box(460, 80, 110, 56, C.red); g.text(515, 96, 'dg.write.buf', { a: 'middle', c: 'r' }); for (let s = 0; s < 4; s++) g.box(472 + s * 22, 110, 18, 16, C.red, { a: 0.3, rx: 3 });
      g.box(620, 70, 90, 76, C.green); g.text(665, 108, 'dg.write.next', { a: 'middle', c: 'n', w: 80, va: 'mid' });
      g.line(110, 108, 158, 108, C.gold, { arrow: 1 }); g.badge(134, 90, 1, C.gold);
      g.line(410, 96, 458, 96, C.red, { arrow: 1 }); g.badge(434, 78, 2, C.red);
      g.line(410, 124, 458, 124, C.cyan, { arrow: 1 }); g.badge(434, 146, 3, C.cyan);
      g.line(570, 108, 618, 108, C.green, { arrow: 1 }); g.badge(594, 90, 4, C.green);
      [1, 2, 3, 4].forEach((n, i) => { const y = 196 + i * 34; g.badge(30, y, n, [C.gold, C.red, C.cyan, C.green][i]); g.text(50, y, 'dg.write.e' + n, { w: 660 }); });
    } else {
      g.box(120, 10, 100, 44, C.gold); g.text(170, 32, 'dg.write.core', { a: 'middle', c: 'g' });
      g.box(20, 96, 300, 92, C.cyan); g.text(34, 116, 'dg.write.l1', { c: 'c' });
      const fx = [32, 82, 122, 194], fw = [46, 36, 68, 114], fk = ['dg.write.v', 'dg.write.d', 'dg.write.tag', 'dg.write.data'];
      fk.forEach((k, i) => { g.box(fx[i], 140, fw[i], 34, i === 1 ? C.red : C.mute, { a: i === 1 ? 0.2 : 0.1, rx: 4 }); g.text(fx[i] + fw[i] / 2, 157, k, { a: 'middle', c: i === 1 ? 'r' : '' }); });
      g.box(90, 236, 160, 58, C.red); g.text(170, 252, 'dg.write.buf', { a: 'middle', c: 'r' }); for (let s = 0; s < 4; s++) g.box(126 + s * 24, 268, 18, 16, C.red, { a: 0.3, rx: 3 });
      g.box(100, 338, 140, 50, C.green); g.text(170, 363, 'dg.write.next', { a: 'middle', c: 'n' });
      g.line(170, 54, 170, 94, C.gold, { arrow: 1 }); g.badge(196, 74, 1, C.gold);
      g.line(140, 188, 140, 234, C.red, { arrow: 1 }); g.badge(114, 211, 2, C.red);
      g.line(200, 188, 200, 234, C.cyan, { arrow: 1 }); g.badge(226, 211, 3, C.cyan);
      g.line(170, 294, 170, 336, C.green, { arrow: 1 }); g.badge(196, 315, 4, C.green);
      [1, 2, 3, 4].forEach((n, i) => { const y = 414 + i * 44; g.badge(20, y, n, [C.gold, C.red, C.cyan, C.green][i]); g.text(38, y, 'dg.write.e' + n, { w: 296 }); });
    }
  } };
};
// four cores, private L1i/L1d/L2, a shared L3 in slices on a ring (ch6); schematic
DG.ring = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 330 : 470;
  return { W, H, draw(g) {
    const tile = (x, y, w, h, i) => {
      g.box(x, y, w, h, C.gold, { a: 0.06 }); g.text(x + 10, y + 16, 'dg.ring.core', { c: 'g', vars: { i } });
      const iw = (w - 30) / 2; g.box(x + 10, y + 30, iw, 28, C.cyan, { rx: 4 }); g.text(x + 10 + iw / 2, y + 44, 'dg.ring.l1i', { a: 'middle', c: 'c' });
      g.box(x + 20 + iw, y + 30, iw, 28, C.cyan, { rx: 4 }); g.text(x + 20 + iw * 1.5, y + 44, 'dg.ring.l1d', { a: 'middle', c: 'c' });
      g.box(x + 10, y + 64, w - 20, 26, C.green, { rx: 4 }); g.text(x + w / 2, y + 77, 'dg.ring.l2', { a: 'middle', c: 'n' });
    };
    if (L === 'w') {
      for (let i = 0; i < 4; i++) tile(20 + i * 175, 14, 160, 100, i);
      g.box(20, 150, 680, 34, C.mute, { a: 0.06, rx: 17 }); g.text(360, 167, 'dg.ring.ring', { a: 'middle', c: 'm' });
      for (let i = 0; i < 4; i++) { const cx = 100 + i * 175; g.line(cx, 114, cx, 150, C.mute); g.line(cx, 184, cx, 214, C.mute); g.box(cx - 75, 214, 150, 40, C.violet, { rx: 6 }); g.text(cx, 234, 'dg.ring.slice', { a: 'middle', c: 'v', vars: { i } }); }
      g.text(360, 284, 'dg.ring.shared', { a: 'middle', c: 'v' }); g.text(360, 310, 'dg.ring.mem', { a: 'middle', c: 'm' });
    } else {
      for (let i = 0; i < 4; i++) { const y = 10 + i * 104; tile(10, y, 210, 96, i); g.line(220, y + 48, 248, y + 48, C.mute); g.box(268, y + 22, 64, 52, C.violet, { rx: 6 }); g.text(300, y + 36, 'dg.ring.sliceS', { a: 'middle', c: 'v' }); g.text(300, y + 60, { raw: String(i) }, { a: 'middle', c: 'v' }); g.line(256, y + 48, 268, y + 48, C.mute); }
      g.box(248, 10, 16, 408, C.mute, { a: 0.06, rx: 8 });
      g.text(170, 444, 'dg.ring.sharedS', { a: 'middle', c: 'v', w: 320, va: 'mid' });
    }
  } };
};
// inclusive / non-inclusive / exclusive: what is unique in L2 + L3 (ch6); sizes from the ch6 model (Zen 5c, 1 + 1 MiB per core)
DG.incl = (L) => {
  const l2 = M.HIER.l2 * M.HIER.scale, l3 = M.HIER.l3.dense * M.HIER.scale, v = { l2: size(l2), l3: size(l3), inc: size(M.capacityOf('incl', M.HIER.l3.dense) * M.HIER.scale), exc: size(M.capacityOf('excl', M.HIER.l3.dense) * M.HIER.scale), lo: size(l3), hi: size(l2 + l3) };
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 270 : 610;
  return { W, H, draw(g) {
    const kinds = [['incl', C.red], ['nincl', C.cyan], ['excl', C.gold]];
    kinds.forEach(([k, col], i) => {
      const x = L === 'w' ? 20 + i * 235 : 10, y = L === 'w' ? 10 : 10 + i * 200, w = L === 'w' ? 215 : 320, bw = w - 60, sc = bw / 2;
      g.text(x, y + 14, 'dg.incl.' + k, { c: k === 'excl' ? 'g' : k === 'incl' ? 'r' : 'c', weight: 600 });
      g.text(x, y + 48, { raw: 'L2' }, { c: 'n' }); g.box(x + 40, y + 36, sc * 1, 24, C.green, { rx: 4 });
      g.text(x, y + 88, { raw: 'L3' }, { c: 'v' }); g.box(x + 40, y + 76, sc * 1, 24, C.violet, { rx: 4 });
      if (k === 'incl') g.box(x + 40, y + 76, sc * 1, 24, C.green, { a: 0.35, rx: 4, dash: '4 3' });
      if (k === 'nincl') g.box(x + 40, y + 76, sc * 0.5, 24, C.green, { a: 0.35, rx: 4, dash: '4 3' });
      g.text(x, y + 124, 'dg.incl.u.' + k, { vars: v, w });
      g.text(x, y + (L === 'w' ? 166 : 148), 'dg.incl.n.' + k, { vars: v, w, c: 'm' });
    });
  } };
};
// Zen 5 core complex (ch6): numbers from the AMD optimization guide and Hot Chips 2024
DG.zen = (L) => {
  const z = M.ZEN, v = { l1i: size(z.l1i.size), l1d: size(z.l1d.size), l2: size(z.l2.size), l3: size(z.l3.size), w3: z.l3.ways, n: z.l3.perCcx, lat3: z.l3.lat };
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 330 : 520;
  return { W, H, draw(g) {
    const wide = L === 'w';
    const tile = (x, y, w, i) => { g.box(x, y, w, 64, C.gold, { a: 0.06 }); g.text(x + 8, y + 15, 'dg.zen.core', { c: 'g', vars: { i } }); g.box(x + 8, y + 30, w - 16, 26, C.green, { rx: 4 }); g.text(x + w / 2, y + 43, wide ? 'dg.zen.l2' : 'dg.zen.l2S', { a: 'middle', c: 'n', vars: v }); };
    if (wide) {
      for (let i = 0; i < 4; i++) tile(20 + i * 172, 10, 160, i);
      g.box(20, 92, 676, 80, C.violet); g.text(358, 118, 'dg.zen.l3', { a: 'middle', c: 'v', vars: v }); g.text(358, 146, 'dg.zen.l3b', { a: 'middle', vars: v });
      for (let i = 0; i < 4; i++) tile(20 + i * 172, 182, 160, i + 4);
      g.box(220, 270, 276, 34, C.mute, { a: 0.08 }); g.text(358, 287, 'dg.zen.io', { a: 'middle', c: 'm' }); g.line(358, 246, 358, 268, C.mute, { arrow: 1 });
      g.text(20, 320, 'dg.zen.l1', { vars: v, c: 'm' });
    } else {
      for (let i = 0; i < 4; i++) tile(10 + (i % 2) * 165, 10 + Math.floor(i / 2) * 72, 155, i);
      g.box(10, 158, 320, 112, C.violet); g.text(170, 184, 'dg.zen.l3', { a: 'middle', c: 'v', vars: v }); g.text(170, 214, 'dg.zen.l3b', { a: 'middle', vars: v, w: 300 });
      for (let i = 4; i < 8; i++) tile(10 + (i % 2) * 165, 280 + Math.floor((i - 4) / 2) * 72, 155, i);
      g.box(60, 438, 220, 34, C.mute, { a: 0.08 }); g.text(170, 455, 'dg.zen.io', { a: 'middle', c: 'm' });
      g.text(10, 496, 'dg.zen.l1', { vars: v, c: 'm', w: 320 });
    }
  } };
};
// VIPT (ch7): bits 19…0 of an address, the page offset, and two L1 layouts
DG.vipt = (L) => {
  const a = M.vipt(M.ZEN.l1d.size, M.ZEN.l1d.ways, 4 * KiB), b = M.vipt(M.CHIPS.neoV3.l1d.size, M.CHIPS.neoV3.l1d.ways, 4 * KiB), off = 6;
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 300 : 400;
  return { W, H, draw(g) {
    const wide = L === 'w', x0 = wide ? 140 : 20, bw = wide ? 28 : 15, X = bit => x0 + (19 - bit) * bw, rows = wide ? [50, 120, 190] : [48, 148, 248], rh = 34;
    const lab = (i, k, vars) => wide ? g.text(x0 - 10, rows[i] + rh / 2, k, { a: 'end', vars, c: 'm' }) : g.text(x0, rows[i] - 14, k, { vars, c: 'm' });
    lab(0, 'dg.vipt.addr'); lab(1, 'dg.vipt.rowA', { s: size(M.ZEN.l1d.size), w: M.ZEN.l1d.ways }); lab(2, 'dg.vipt.rowB', { s: size(M.CHIPS.neoV3.l1d.size), w: M.CHIPS.neoV3.l1d.ways });
    const pb = a.pageBits;
    g.box(X(19), rows[0], (20 - pb) * bw, rh, C.red); g.box(X(pb - 1), rows[0], pb * bw, rh, C.gold);
    g.text(X(19) + (20 - pb) * bw / 2, rows[0] + rh / 2, wide ? 'dg.vipt.vpn' : 'dg.vipt.vpnS', { a: 'middle', c: 'r' }); g.text(X(pb - 1) + pb * bw / 2, rows[0] + rh / 2, wide ? 'dg.vipt.po' : 'dg.vipt.poS', { a: 'middle', c: 'g', vars: { n: pb } });
    for (const [r, v] of [[1, a], [2, b]]) {
      const ib = v.lowBits - off;
      g.box(X(v.lowBits - 1), rows[r], ib * bw, rh, C.cyan); g.box(X(off - 1), rows[r], off * bw, rh, C.mute, { a: 0.1 });
      if (v.extra) g.box(X(v.lowBits - 1), rows[r], v.extra * bw, rh, C.red, { a: 0.3, sw: 2 });
      g.text(X(v.lowBits - 1) + ib * bw / 2 + (v.extra ? v.extra * bw / 2 : 0), rows[r] + rh / 2, 'dg.vipt.idx', { a: 'middle', c: 'c', vars: { n: ib } });
      g.text(X(off - 1) + off * bw / 2, rows[r] + rh / 2, wide ? 'dg.vipt.lo' : 'dg.vipt.loS', { a: 'middle', vars: { n: off } });
    }
    g.line(X(pb - 1), rows[0] - 8, X(pb - 1), rows[2] + rh + 8, C.gold, { dash: '5 4' });
    g.text(wide ? x0 : 20, rows[2] + rh + (wide ? 30 : 32), 'dg.vipt.note', { vars: { n: b.extra }, w: wide ? 560 : 310, c: 'm' });
  } };
};
// the stride prefetcher's reference prediction table (ch8); entries are schematic
DG.rpt = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 230 : 400;
  return { W, H, draw(g) {
    const wide = L === 'w';
    const cols = wide ? [[150, 110, 'dg.rpt.pc'], [260, 130, 'dg.rpt.last'], [390, 80, 'dg.rpt.stride'], [470, 80, 'dg.rpt.state']] : [[10, 80, 'dg.rpt.pc'], [90, 100, 'dg.rpt.last'], [190, 70, 'dg.rpt.stride'], [260, 70, 'dg.rpt.state']];
    const rows = [['0x4005D0', '0x1003F00', '+256', 'dg.rpt.steady'], ['0x400610', '0x3051C40', '−4160', 'dg.rpt.nopred']];
    const ty = wide ? 40 : 30;
    if (wide) { g.box(10, ty + 26, 110, 40, C.gold); g.text(65, ty + 46, 'dg.rpt.load', { a: 'middle', c: 'g' }); g.line(120, ty + 46, 148, ty + 46, C.gold, { arrow: 1 }); }
    cols.forEach(([x, w, k]) => g.text(x + w / 2, ty, k, { a: 'middle', c: 'm' }));
    rows.forEach((r, i) => cols.forEach(([x, w], j) => { const y = ty + 18 + i * 40; g.box(x, y, w - 4, 34, i === 0 ? C.cyan : C.dimfill, { a: i === 0 ? 0.14 : 0.5, rx: 4 }); g.text(x + (w - 4) / 2, y + 17, j === 3 ? r[3] : { raw: r[j] }, { a: 'middle', mono: j < 3 ? 1 : 0, c: i === 0 ? '' : 'm' }); }));
    if (wide) {
      g.line(550, ty + 35, 588, ty + 35, C.cyan, { arrow: 1 }); g.box(590, ty + 12, 120, 48, C.green); g.text(650, ty + 36, 'dg.rpt.issue', { a: 'middle', c: 'n', w: 108, va: 'mid' });
      g.text(10, 160, 'dg.rpt.e1', { w: 700 }); g.text(10, 192, 'dg.rpt.e2', { w: 700, c: 'm' });
    } else {
      g.line(170, 130, 170, 160, C.cyan, { arrow: 1 }); g.box(70, 162, 200, 44, C.green); g.text(170, 184, 'dg.rpt.issue', { a: 'middle', c: 'n' });
      g.text(10, 236, 'dg.rpt.e1', { w: 320 }); g.text(10, 320, 'dg.rpt.e2', { w: 320, c: 'm' });
    }
  } };
};
// MESI states for one line, eight numbered transitions (ch9)
DG.mesi = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 480 : 650;
  return { W, H, draw(g) {
    const wide = L === 'w', P = wide ? { E: [150, 70], M: [570, 70], I: [150, 250], S: [570, 250] } : { E: [70, 60], M: [270, 60], I: [70, 230], S: [270, 230] }, r = 32;
    const col = { M: C.red, E: C.gold, S: C.cyan, I: C.mute };
    const edge = (a, b, n, dx, dy, bpos) => {
      const [x1, y1] = P[a], [x2, y2] = P[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
      g.line(x1 + ux * (r + 2) + dx, y1 + uy * (r + 2) + dy, x2 - ux * (r + 4) + dx, y2 - uy * (r + 4) + dy, col[b], { arrow: 1 });
      const f = bpos == null ? 0.5 : bpos; g.badge(x1 + (x2 - x1) * f + dx * 2.2, y1 + (y2 - y1) * f + dy * 2.2, n, col[b]);
    };
    edge('I', 'E', 1, -8, 0); edge('I', 'S', 2, 0, -8); edge('E', 'M', 3, 0, -8); edge('S', 'M', 4, 8, 0); edge('M', 'S', 5, -8, 0, 0.5);
    edge('M', 'I', 6, 0, 0, 0.3); edge('E', 'S', 7, 0, 0, 0.7); edge('S', 'I', 8, 0, 8);
    for (const k of ['M', 'E', 'S', 'I']) { const [x, y] = P[k]; g.circle(x, y, r, col[k]); g.text(x, y - 7, { raw: k }, { a: 'middle', mono: 1, fs: 18, weight: 700, c: { M: 'r', E: 'g', S: 'c', I: 'm' }[k] }); g.text(x, y + 13, 'dg.mesi.' + k, { a: 'middle', fs: 13.5, c: 'm' }); }
    for (let n = 1; n <= 8; n++) {
      const x = wide ? 20 + ((n - 1) % 2) * 350 : 10, y = wide ? 322 + Math.floor((n - 1) / 2) * 40 : 300 + (n - 1) * 42;
      g.badge(x + 10, y, n, C.dimfill); g.text(x + 28, y, 'dg.mesi.e' + n, { w: wide ? 318 : 296 });
    }
  } };
};
// false sharing on one 64-byte line (ch9)
DG.false = (L) => {
  const W = L === 'w' ? 720 : 340, H = L === 'w' ? 260 : 340;
  return { W, H, draw(g) {
    const wide = L === 'w', x0 = wide ? 100 : 18, sw = wide ? 65 : 38, ly = 100;
    g.box(wide ? 40 : 10, 16, wide ? 150 : 140, 40, C.gold); g.text(wide ? 115 : 80, 36, 'dg.false.c0', { a: 'middle', c: 'g' });
    g.box(wide ? 530 : 190, 16, wide ? 150 : 140, 40, C.cyan); g.text(wide ? 605 : 260, 36, 'dg.false.c1', { a: 'middle', c: 'c' });
    g.text(x0, ly + 64, wide ? 'dg.false.line' : 'dg.false.lineS', { c: 'm' });
    for (let i = 0; i < 8; i++) { const col = i === 0 ? C.gold : i === 1 ? C.cyan : C.dimfill; g.box(x0 + i * sw, ly, sw - 4, 44, col, { a: i < 2 ? 0.2 : 0.5, rx: 4 }); g.text(x0 + i * sw + (sw - 4) / 2, ly + 22, i === 0 ? { raw: 'A' } : i === 1 ? { raw: 'B' } : { raw: String(i * 8) }, { a: 'middle', mono: 1, c: i === 0 ? 'g' : i === 1 ? 'c' : 'm', fs: i < 2 ? 15 : 13 }); }
    g.line(wide ? 115 : 70, 56, x0 + (sw - 4) / 2, ly - 2, C.gold, { arrow: 1 }); g.line(wide ? 605 : 260, 56, x0 + sw + (sw - 4) / 2, ly - 2, C.cyan, { arrow: 1 });
    g.text(x0, ly + 100, 'dg.false.e1', { w: wide ? 600 : 304 }); g.text(x0, ly + (wide ? 130 : 164), 'dg.false.e2', { w: wide ? 600 : 304, c: 'm' });
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

/* ───────── 01 levels and AMAT ───────── */
function latRows() {
  const z = M.ZEN, lc = M.CHIPS.lionCove, ll = M.CHIPS.lunarLake, nsZ = M.CHIPS.dramNs;
  const rows = [['ch1.chip.zen', 'L1D', z.l1d.size, cyc(z.l1d.lat, 0)], ['ch1.chip.zen', 'L2', z.l2.size, cyc(z.l2.lat, 0)], ['ch1.chip.zen', 'L3', z.l3.size, cyc(z.l3.lat, 0)], ['ch1.chip.zen', 'ch1.lv.mem', 0, t('ch1.lat.dram', { ns: fmt(nsZ, 0), c: fmt(M.dramCycles(), 0) })],
    ['ch1.chip.lc', 'L0', lc.l0.size, cyc(lc.l0.lat, 0)], ['ch1.chip.lc', 'L1', lc.l1.size, cyc(lc.l1.lat, 0)], ['ch1.chip.lc', 'L2', lc.l2.size, cyc(lc.l2.lat, 0)], ['ch1.chip.ll', 'L3', ll.l3, cyc(ll.l3lat, 0)]];
  const tb = $('#latRows'); tb.textContent = '';
  rows.forEach(([chip, lv, sz, lat], i) => {
    const tr = document.createElement('tr'); if (i < 4) tr.className = 'hi';
    const cells = [t(chip), lv.startsWith('ch1.') ? t(lv) : lv, sz ? size(sz) : t('ch1.lat.na'), lat], hk = ['ch1.th.chip', 'ch1.th.level', 'ch1.th.size', 'ch1.th.lat'];
    cells.forEach((s, j) => { const td = document.createElement('td'); td.textContent = s; if (j) td.dataset.h = t(hk[j]); tr.appendChild(td); });
    tb.appendChild(tr);
  });
}
(() => {
  const cv = $('#amCv'), sT = $('#amT'), boxes = { l1: $('#amL1'), l2: $('#amL2'), l3: $('#amL3') };
  const TABLES = [1, 2, 4, 8, 16, 32, 64];
  const on = () => ({ l1: boxes.l1.checked, l2: boxes.l2.checked, l3: boxes.l3.checked }), tab = () => TABLES[+sT.value];
  const CONF = [['ch1.cf.none', {}], ['ch1.cf.l1', { l1: 1 }], ['ch1.cf.l3', { l3: 1 }], ['ch1.cf.l13', { l1: 1, l3: 1 }], ['ch1.cf.l12', { l1: 1, l2: 1 }], ['ch1.cf.l123', { l1: 1, l2: 1, l3: 1 }]];
  const same = (a, b) => ['l1', 'l2', 'l3'].every(k => !!a[k] === !!b[k]);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = on(), T = tab();
    let hi = CONF.findIndex(([, x]) => same(x, o)); const rows = CONF.map(([k, x]) => { const a = M.amat(x, T).amat; return [t(k), a, a > 150 ? C.red : a > 40 ? C.violet : C.gold, cyc(a, 1)]; });
    if (hi < 0) { const a = M.amat(o, T).amat; rows.push([t('ch1.cf.yours'), a, C.cyan, cyc(a, 1)]); hi = rows.length - 1; }
    bars(c, w, h, rows, M.dramCycles() * 1.05, hi);
  } });
  function text() {
    const o = on(), T = tab(), a = M.amat(o, T), z = M.say.amat(o, T), best = M.amat({ l1: 1, l2: 1, l3: 1 }, T);
    put('#amTo', size(T * MiB));
    put('#amA', cyc(a.amat, 1)); put('#amN', t('u.ns', { v: fmt(a.amat / M.CHIPS.r9950x.ghz, 1) })); put('#amM', pct(a.served.mem, 0)); put('#amX', t('u.x', { v: fmt(a.amat / best.amat, 1) }));
    putHTML('#amSay', t(z.key, { amat: cyc(a.amat, 1), mem: pct(a.served.mem, 0), best: cyc(best.amat, 1), x: fmt(a.amat / best.amat, 1), table: size(T * MiB) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  Object.values(boxes).forEach(b => b.addEventListener('change', go)); sT.addEventListener('input', go);
  text();
})();

/* ───────── 02 the address split ───────── */
const CFG = { l1: () => M.geometry(M.ZEN.l1d.size, M.ZEN.l1d.ways), l2: () => M.geometry(M.ZEN.l2.size, M.ZEN.l2.ways), l3: () => M.geometry(M.ZEN.l3.size, M.ZEN.l3.ways), toy: () => M.geometry(M.TOY.size, 1, M.TOY.line) };
(() => {
  const inp = $('#spA');
  function text() {
    const a = M.parseHex(inp.value), g = CFG[radioVal('spC')]();
    if (a == null) { ['#spT', '#spI', '#spO'].forEach(s => put(s, t('u.none'))); put('#spS', fmt(g.sets, 0)); $('#spBits').textContent = ''; putHTML('#spSay', t('ch2.say.bad')); return; }
    const sp = M.split(a, g), bin = a.toString(2), lo = g.lowBits, o = g.offBits;
    const tagBits = bin.length > lo ? bin.slice(0, bin.length - lo) : '0', idx = (bin.padStart(lo, '0')).slice(-lo, -o || undefined), off = bin.padStart(o, '0').slice(-o);
    put('#spT', hex(sp.tag)); put('#spI', fmt(sp.index, 0)); put('#spO', fmt(sp.offset, 0)); put('#spS', fmt(g.sets, 0));
    putHTML('#spBits', `<span class="t"><i>${esc(t('ch2.bits.tag', { n: tagBits.length }))}</i><b>${tagBits}</b></span><span class="x"><i>${esc(t('ch2.bits.idx', { n: g.idxBits }))}</i><b>${idx || '—'}</b></span><span class="o"><i>${esc(t('ch2.bits.off', { n: o }))}</i><b>${off}</b></span>`);
    putHTML('#spSay', t('ch2.say.split', { set: fmt(sp.index, 0), sets: fmt(g.sets, 0), ways: fmt(g.ways, 0), off: fmt(sp.offset, 0), tag: hex(sp.tag), ib: fmt(g.idxBits, 0), ob: fmt(o, 0) }));
  }
  inp.addEventListener('input', text); onAll(radios('spC'), 'change', text);
  reg([], { draw() {}, text }); text();
})();
(() => {
  let k = 0, run = null;
  const bBase = () => M.TOY.bBases[+radioVal('tyB')], ways = () => +radioVal('tyW');
  const compute = () => { run = M.toyRun(bBase(), ways()); };
  function text() {
    if (!run) compute();
    const steps = run.steps, cur = k > 0 ? steps[k - 1] : null, sets = run.sets, w = ways();
    let html = '';
    for (let s = 0; s < sets; s++) {
      const here = cur ? cur.state.filter(x => x.set === s).sort((a, b) => a.way - b.way) : [];
      const cls = cur && cur.set === s ? (cur.hit ? 'hit' : 'miss') : '';
      const tags = here.length ? here.map(x => hex(Math.floor(x.line / sets))).join(' · ') : t('ch2.set.empty');
      html += `<div class="${cls}"><b>${esc(t('ch2.set.n', { s }))}</b>${esc(tags)}</div>`;
    }
    putHTML('#tySets', html);
    putHTML('#tyTrail', steps.map((s, i) => `<span role="listitem" class="${i < k ? (s.hit ? 'h' : 'm') : ''}${i === k - 1 ? ' now' : ''}">${s.arr}[${s.i}]</span>`).join(''));
    const done = steps.slice(0, k), h = done.filter(s => s.hit).length;
    put('#tyK', t('ch2.k', { k: fmt(k, 0), n: fmt(steps.length, 0) })); put('#tyH', fmt(h, 0)); put('#tyM', fmt(k - h, 0));
    if (!cur) { putHTML('#tySay', t(w === 1 ? 'ch2.say.start1' : 'ch2.say.start2', { sets: fmt(sets, 0) })); return; }
    if (k === steps.length) { putHTML('#tySay', t('ch2.say.done', { h: fmt(h, 0), m: fmt(k - h, 0), n: fmt(k, 0) })); return; }
    const z = M.say.toy(cur);
    putHTML('#tySay', t(z.key, { el: `${cur.arr}[${cur.i}]`, addr: hex(cur.addr), set: fmt(cur.set, 0), tag: hex(cur.tag), old: cur.evicted == null ? '' : hex(cur.evicted * M.TOY.line) }));
  }
  $('#tyStep').addEventListener('click', () => { if (!run) compute(); if (k < run.steps.length) k++; text(); });
  $('#tyAll').addEventListener('click', () => { if (!run) compute(); k = run.steps.length; text(); });
  $('#tyReset').addEventListener('click', () => { k = 0; text(); });
  const go = () => { compute(); k = 0; text(); };
  onAll(radios('tyB'), 'change', go); onAll(radios('tyW'), 'change', go);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 03 3C ───────── */
(() => {
  const cv = $('#c3Cv'), ways = () => radioVal('c3W'), sz = () => +radioVal('c3S');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), G = M.c3grid(), W = ways(), n = M.C3.sizes.length;
    let max = 0; for (const s of M.C3.sizes) { const r = G[W + ':' + s]; max = Math.max(max, r.misses); } for (const k in G) max = Math.max(max, G[k].misses);
    const f = frame(w, h, [28, 12, 40, 58], 0, n, 0, max * 1.08), step = max > 10000 ? 4000 : 2000, ys = []; for (let v = 0; v <= max * 1.08; v += step) ys.push(v);
    yTicks(c, f, ys, v => fmt(v, 0)); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    M.C3.sizes.forEach((s, i) => {
      const r = G[W + ':' + s], x0 = f.X(i + 0.18), x1 = f.X(i + 0.82); let y = 0;
      for (const [v, col] of [[r.comp, C.mute], [r.cap, C.cyan], [r.conf, C.red]]) { if (v > 0) { c.fillStyle = col; c.fillRect(x0, f.Y(y + v), x1 - x0, Math.max(1, f.Y(y) - f.Y(y + v))); } y += v; }
      if (s === sz()) { c.strokeStyle = C.gold; c.lineWidth = 2; c.strokeRect(x0 - 3, f.Y(y) - 3, x1 - x0 + 6, f.B - f.Y(y) + 3); }
    });
    c.fillStyle = C.mute; spacedTicks(c, M.C3.sizes.map((s, i) => [f.X(i + 0.5), size(s)]), f.B + 11, w);
  } });
  function text() {
    const W = ways(), s = sz(), z = M.say.threeC(W, s), r = z.v;
    put('#c3Co', fmt(r.comp, 0)); put('#c3Ca', fmt(r.cap, 0)); put('#c3Cf', fmt(r.conf, 0)); put('#c3R', pct(r.rate, 1));
    putHTML('#c3Say', t(z.key, { ways: W === 'fa' ? t('ch3.w.faName') : W === '1' ? t('ch3.w.1') : t('ch3.w.n', { n: W }), size: size(s), comp: fmt(r.comp, 0), cap: fmt(r.cap, 0), conf: fmt(r.conf, 0), rate: pct(r.rate, 1), n: fmt(r.n, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll(radios('c3W'), 'change', go); onAll(radios('c3S'), 'change', go);
  text();
})();

/* ───────── 04 replacement ───────── */
(() => {
  const cv = $('#rpCv'), sL = $('#rpL'), kind = () => radioVal('rpT');
  const memo = new Map(), res = () => { const k = kind() + ':' + (kind() === 'loop' ? sL.value : ''); if (!memo.has(k)) memo.set(k, M.say.repl(kind(), +sL.value)); return memo.get(k); };
  const COL = { lru: C.mute, plru: C.mute, random: C.cyan, srrip: C.violet, brrip: C.gold, opt: C.green };
  const sim = reg(cv, { draw() { const { c, w, h } = fit(cv), z = res(); bars(c, w, h, M.REPL.policies.map(p => [t('ch4.pol.' + p), z.v[p], COL[p], pct(z.v[p], 1)]), 1, -1); } });
  function text() {
    const z = res(), v = z.v, cap = M.REPL.size / M.LINE;
    put('#rpLo', t('ch4.loopfmt', { x: fmt(+sL.value, 2), lines: fmt(Math.round(cap * +sL.value), 0) }));
    put('#rpLru', pct(v.lru, 1)); put('#rpRnd', pct(v.random, 1)); put('#rpRr', pct(v.brrip, 1)); put('#rpOpt', pct(v.opt, 1));
    putHTML('#rpSay', t(z.key, { lru: pct(v.lru, 1), plru: pct(v.plru, 1), random: pct(v.random, 1), srrip: pct(v.srrip, 1), brrip: pct(v.brrip, 1), opt: pct(v.opt, 1), x: fmt(+sL.value, 2) }));
    sL.disabled = kind() !== 'loop';
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sL.addEventListener('input', go); onAll(radios('rpT'), 'change', go);
  text();
})();

/* ───────── 05 writes ───────── */
(() => {
  const cv = $('#wrCv'), pol = () => radioVal('wrP'), dep = () => +radioVal('wrD');
  const memo = new Map(), get = (p, d) => { const k = p + d; if (!memo.has(k)) memo.set(k, M.writes(p, d)); return memo.get(k); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), d = dep(), P = M.WRITE.policies, rows = [];
    let max = 0; P.forEach(p => { const r = get(p, d); max = Math.max(max, r.readBytes, r.writeBytes); });
    P.forEach(p => { const r = get(p, d); rows.push([t('ch5.bar.r', { p: t('ch5.pol.' + p) }), r.readBytes, C.cyan, size(r.readBytes)]); rows.push([t('ch5.bar.w', { p: t('ch5.pol.' + p) }), r.writeBytes, C.red, size(r.writeBytes)]); });
    bars(c, w, h, rows, max * 1.05, -1);
    const i = P.indexOf(pol()), rh = (h - 20) / rows.length; c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(2, 10 + i * 2 * rh + 2, w - 4, 2 * rh - 4);
  } });
  function text() {
    const p = pol(), d = dep(), r = get(p, d), z = M.say.writes(p, d);
    put('#wrR', size(r.readBytes)); put('#wrW', size(r.writeBytes)); put('#wrO', fmt(r.writeOps, 0)); put('#wrS', pct(r.waitShare, 1));
    putHTML('#wrSay', t(z.key, { pol: t('ch5.pol.' + p), d: fmt(d, 0), w: size(r.writeBytes), r: size(r.readBytes), ops: fmt(r.writeOps, 0), stores: fmt(r.stores, 0), wait: pct(r.waitShare, 1), tail: fmt(r.tailLines, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll(radios('wrP'), 'change', go); onAll(radios('wrD'), 'change', go);
  text();
})();

/* ───────── 06 inclusive / exclusive ───────── */
(() => {
  const cv = $('#hiCv'), sW = $('#hiW'), kind = () => radioVal('hiK'), l3k = () => radioVal('hiL');
  const memo = new Map(), get = (k, l, m) => { const key = k + l + m; if (!memo.has(key)) memo.set(key, M.hierarchy(k, M.HIER.l3[l], m * M.HIER.l2)); return memo.get(key); };
  const COL = { incl: C.red, nincl: C.cyan, excl: C.gold };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), l = l3k(), mul = M.HIER.wMul, f = frame(w, h, [28, 16, 40, 52], 0, mul.length - 1, 0, 1.05);
    yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, mul.map((m, i) => [f.X(i), size(m * M.HIER.l2 * M.HIER.scale)]), f.B + 11, w);
    for (const k of ['incl', 'nincl', 'excl']) path(c, mul.map((m, i) => [i, get(k, l, m).hit]), f.X, f.Y, COL[k], k === kind() ? 3 : 1.6);
    const i = +sW.value; dot(c, f.X(i), f.Y(get(kind(), l, mul[i]).hit), COL[kind()], 5.5);
  } });
  function text() {
    const k = kind(), l = l3k(), m = M.HIER.wMul[+sW.value], z = M.say.hier(k, l, m), v = z.v, sc = M.HIER.scale;
    put('#hiWo', size(m * M.HIER.l2 * sc));
    put('#hiH', pct(v.hit, 0)); put('#hiH2', pct(v.h2, 0)); put('#hiCap', v.cap ? size(v.cap * sc) : t('ch6.cap.between', { lo: size(M.HIER.l3[l] * sc), hi: size((M.HIER.l2 + M.HIER.l3[l]) * sc) })); put('#hiB', fmt(v.back * 1000, 0));
    putHTML('#hiSay', t(z.key, { W: size(v.W * sc), hit: pct(v.hit, 0), h2: pct(v.h2, 0), cap: v.cap ? size(v.cap * sc) : '', back: fmt(v.back * 1000, 0), mem: pct(v.mem, 0), uniq: size(v.unique * sc) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); onAll(radios('hiK'), 'change', go); onAll(radios('hiL'), 'change', go);
  text();
})();

/* ───────── 07 VIPT ───────── */
(() => {
  const sS = $('#vpS'), SIZES = [16, 32, 48, 64, 96, 128, 192, 256].map(k => k * KiB);
  function text() {
    const page = +radioVal('vpP'), ways = +radioVal('vpW'), s = SIZES[+sS.value], r = M.vipt(s, ways, page), z = M.say.vipt(s, ways, page);
    put('#vpSo', size(s));
    put('#vpLim', size(r.limit)); put('#vpLow', fmt(r.lowBits, 0)); put('#vpPg', fmt(r.pageBits, 0)); put('#vpAl', r.fits ? t('ch7.al.none') : t('ch7.al.n', { n: fmt(r.aliases, 0) }));
    const ib = r.lowBits - 6, inPage = Math.max(0, ib - r.extra);
    putHTML('#vpBits', `${r.extra ? `<span class="p"><i>${esc(t('ch7.bits.vpn', { n: r.extra }))}</i><b>${'x'.repeat(r.extra)}</b></span>` : ''}<span class="x"><i>${esc(t('ch7.bits.idx', { n: inPage }))}</i><b>${'i'.repeat(inPage) || '—'}</b></span><span class="o"><i>${esc(t('ch7.bits.off', { n: 6 }))}</i><b>oooooo</b></span><span><i>${esc(t('ch7.bits.page', { n: r.pageBits }))}</i><b>${r.pageBits}</b></span>`);
    putHTML('#vpSay', t(z.key, { size: size(s), ways: fmt(ways, 0), page: size(page), limit: size(r.limit), low: fmt(r.lowBits, 0), pb: fmt(r.pageBits, 0), extra: fmt(r.extra, 0), n: fmt(r.aliases, 0), sets: fmt(r.sets, 0) }));
  }
  sS.addEventListener('input', text); onAll(radios('vpP'), 'change', text); onAll(radios('vpW'), 'change', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 08 prefetch ───────── */
(() => {
  const cv = $('#pfCv'), sD = $('#pfD');
  const opts = () => [radioVal('pfT'), radioVal('pfM'), +sD.value, +radioVal('pfG')];
  const memo = new Map(), get = o => { const k = o.join(); if (!memo.has(k)) memo.set(k, M.prefetch(...o)); return memo.get(k); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = opts(), r = get(o);
    const rows = [[t('ch8.bar.base'), r.base, C.mute, fmt(r.base, 0)], [t('ch8.bar.miss'), r.misses, C.gold, fmt(r.misses, 0)], [t('ch8.bar.useful'), r.useful, C.green, fmt(r.useful, 0)], [t('ch8.bar.waste'), r.wasted, C.red, fmt(r.wasted, 0)]];
    bars(c, w, h, rows, Math.max(r.base, r.issued, 1) * 1.05, -1);
  } });
  function text() {
    const o = opts(), r = get(o), z = M.say.prefetch(...o);
    put('#pfDo', t('ch8.distfmt', { d: fmt(o[2], 0) }));
    put('#pfB', fmt(r.base, 0)); put('#pfMi', fmt(r.misses, 0)); put('#pfC', o[1] === 'none' ? t('u.none') : pct(r.coverage, 0)); put('#pfA', o[1] === 'none' || !r.issued ? t('u.none') : pct(r.accuracy, 0));
    putHTML('#pfSay', t(z.key, { base: fmt(r.base, 0), miss: fmt(r.misses, 0), cov: pct(r.coverage, 0), acc: pct(r.accuracy, 0), issued: fmt(r.issued, 0), waste: fmt(r.wasted, 0), mode: t('ch8.m.' + o[1]) }));
    sD.disabled = o[1] !== 'stride';
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sD.addEventListener('input', go); ['pfT', 'pfM', 'pfG'].forEach(n => onAll(radios(n), 'change', go));
  text();
})();

/* ───────── 09 MESI and false sharing ───────── */
(() => {
  let st = ['I', 'I'], log = [], last = null, mem = 'ok', stats = { tx: 0, inval: 0 };
  function text() {
    const cell = (k, s) => `<div><span>${esc(t(k))}</span><b class="${s}">${s}</b>${esc(t('ch9.st.' + s))}</div>`;
    putHTML('#meCores', cell('ch9.core0', st[0]) + cell('ch9.core1', st[1]) + `<div><span>${esc(t('ch9.stat'))}</span><b>${fmt(stats.tx, 0)} · ${fmt(stats.inval, 0)}</b>${esc(t('ch9.stat.k'))}</div>`);
    putHTML('#meLog', log.length ? log.map((x, i) => `<span role="listitem"${i === log.length - 1 ? ' class="now"' : ''}>${esc(x)}</span>`).join('') : `<span role="listitem">${esc(t('ch9.log.empty'))}</span>`);
    if (!last) { putHTML('#meSay', t('ch9.say.start')); return; }
    const z = M.say.mesi(last.r);
    putHTML('#meSay', t(z.key, { who: t('ch9.core' + last.core), op: t('ch9.op.' + last.op), bus: last.r.bus || '', from: last.r.from ? t('ch9.from.' + last.r.from) : '', s0: last.before[last.core], s1: last.r.st[last.core], o0: last.before[1 - last.core], o1: last.r.st[1 - last.core], wb: last.r.wb ? t('ch9.wb') : '' }));
  }
  const act = (core, op) => () => {
    const before = st.slice(), r = M.mesiStep(st, core, op); st = r.st; if (r.bus) stats.tx++; stats.inval += r.inval;
    log.push(t('ch9.log.item', { c: core, op: t('ch9.opS.' + op), a: before.join(''), b: st.join(''), bus: r.bus ? ' ' + r.bus : '' })); if (log.length > 12) log.shift();
    last = { core, op, before, r }; text();
  };
  $('#meR0').addEventListener('click', act(0, 'R')); $('#meW0').addEventListener('click', act(0, 'W')); $('#meE0').addEventListener('click', act(0, 'E'));
  $('#meR1').addEventListener('click', act(1, 'R')); $('#meW1').addEventListener('click', act(1, 'W')); $('#meE1').addEventListener('click', act(1, 'E'));
  $('#meReset').addEventListener('click', () => { st = ['I', 'I']; log = []; last = null; stats = { tx: 0, inval: 0 }; text(); });
  reg([], { draw() {}, text }); text();
})();
(() => {
  const cv = $('#fsCv'), sG = $('#fsG'), same = () => radioVal('fsL') === 'same', g = () => M.FS.gs[+sG.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), G = g(), a = M.falseSharing(true, G), b = M.falseSharing(false, G), max = Math.max(a.perAdd, b.perAdd) * 1.05;
    bars(c, w, h, [[t('ch9.lay.same'), a.perAdd, C.red, cyc(a.perAdd, 1)], [t('ch9.lay.pad'), b.perAdd, C.green, cyc(b.perAdd, 1)]], max, same() ? 0 : 1);
  } });
  function text() {
    const G = g(), z = M.say.fs(same(), G), r = z.v;
    put('#fsGo', fmt(G, 0)); put('#fsTx', fmt(r.tx, 0)); put('#fsIv', fmt(r.inval, 0)); put('#fsPer', cyc(r.perAdd, 1));
    putHTML('#fsSay', t(z.key, { g: fmt(G, 0), tx: fmt(r.tx, 0), inval: fmt(r.inval, 0), per: cyc(r.perAdd, 1), N: fmt(M.FS.N, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sG.addEventListener('input', go); onAll(radios('fsL'), 'change', go);
  text();
})();

/* ───────── 10 the staircase ───────── */
(() => {
  const cv = $('#stCv'), sW = $('#stW'), page = () => +radioVal('stP');
  const W = () => Math.round(Math.pow(2, +sW.value) / M.LINE) * M.LINE;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), pts = M.staircaseCurve(page()), ymax = 450, f = frame(w, h, [28, 16, 40, 52], M.STAIR.minLog, M.STAIR.maxLog, 0, ymax);
    // a log scale for latency would hide the steps' heights; a linear scale with the doc latencies drawn in
    yTicks(c, f, [0, 100, 200, 300, 400], v => fmt(v, 0)); axes(c, f, t('ch10.cv.x'), t('ch10.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [12, 15, 18, 20, 22, 25, 27].map(e => [f.X(e), size(Math.pow(2, e))]), f.B + 11, w);
    const z = M.ZEN;
    for (const [s, lat] of [[z.l1d.size, z.l1d.lat], [z.l2.size, z.l2.lat], [z.l3.size, z.l3.lat]]) { c.strokeStyle = C.cyan; c.lineWidth = 1.2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(f.X(Math.log2(s)), f.T); c.lineTo(f.X(Math.log2(s)), f.B); c.stroke(); c.setLineDash([]); }
    path(c, pts.map(p => [Math.log2(p.W), p.cycles]), f.X, f.Y, C.gold, 2.6);
    const r = M.staircase(W(), page()); dot(c, f.X(Math.log2(r.W)), f.Y(r.cycles), C.gold, 5.5);
  } });
  function text() {
    const z = M.say.stair(W(), page()), r = z.v, names = ['L1', 'L2', 'L3', t('ch1.lv.mem')];
    put('#stWo', size(r.W)); put('#stC', cyc(r.cycles, r.cycles < 20 ? 1 : 0)); put('#stN', t('u.ns', { v: fmt(r.ns, 1) }));
    put('#stS', r.served.map((s, i) => s > 0.005 ? names[i] + ' ' + pct(s, 0) : '').filter(Boolean).join(' · '));
    putHTML('#stSay', t(z.key, { W: size(r.W), c: cyc(r.cycles, 0), ns: t('u.ns', { v: fmt(r.ns, 1) }), lv: names[r.top], share: pct(r.served[r.top], 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); onAll(radios('stP'), 'change', go);
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
