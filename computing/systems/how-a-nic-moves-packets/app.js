/* How a network card moves packets: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from
   copy.*.js. The canvas, chart and SVG helpers follow how-the-os-talks-to-hardware/app.js. */
(() => {
'use strict';
const M = window.NicModels;
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
   Colours: the host (memory, applications) cyan, the kernel and driver gold, the NIC green, links (wire, PCIe) violet,
   failure red. */
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

// a numbered step box: badge at the top-left corner, text centred in the rest
function sbox(g, x, y, w, h, col, key, n, o) {
  o = o || {}; g.box(x, y, w, h, col, { a: o.a, dash: o.dash });
  g.text(x + w / 2 + 8, y + h / 2, key, { a: 'middle', c: cls(col), w: w - 36, va: 'mid', mono: o.mono });
  if (n) g.badge(x + 2, y + 2, n, col);
}
// steps in swimlanes: lanes [[key, colour]], steps [[key, lane]]; an elbow arrow joins each step to the next
function laneDg(L, lanes, steps) {
  if (L === 'w') {
    const n = lanes.length, gap = 20, x0 = 24, lw = (720 - x0 - 10 - gap * (n - 1)) / n, lx = i => x0 + i * (lw + gap);
    const y0 = 40, pitch = 62, bh = 44, H = y0 + steps.length * pitch;
    return { W: 720, H, draw(g) {
      lanes.forEach(([k, col], i) => { g.text(lx(i) + lw / 2, 16, k, { a: 'middle', c: cls(col), weight: 600 }); g.line(lx(i) + lw / 2, 28, lx(i) + lw / 2, H - 4, C.line, { dash: '3 6', sw: 1 }); });
      steps.forEach(([k, ln], i) => {
        const y = y0 + i * pitch; sbox(g, lx(ln), y, lw, bh, lanes[ln][1], k, i + 1);
        if (i === steps.length - 1) return;
        const nl = steps[i + 1][1], ny = y + pitch, cx = lx(nl) + lw / 2;
        if (nl === ln) g.line(cx, y + bh + 2, cx, ny - 3, C.mute, { arrow: 1 });
        else { const sx = nl > ln ? lx(ln) + lw + 1 : lx(ln) - 1, my = y + bh / 2; g.line(sx, my, cx, my, C.mute); g.line(cx, my, cx, ny - 3, C.mute, { arrow: 1 }); }
      });
    } };
  }
  const pitch = 60, bh = 46, y0 = 44;
  return { W: 340, H: y0 + steps.length * pitch, draw(g) {
    lanes.forEach(([k, col], i) => g.text(10 + i * 110, 16, k, { c: cls(col), weight: 600, w: 104 }));
    steps.forEach(([k, ln], i) => { const y = y0 + i * pitch; sbox(g, 14, y, 316, bh, lanes[ln][1], k, i + 1); if (i < steps.length - 1) g.line(172, y + bh + 2, 172, y + pitch - 3, C.mute, { arrow: 1 }); });
  } };
}

// ch1: the parts of a NIC, wire to host
DG.nic = (L) => {
  const items = [['dg.nic.wire', C.violet], ['dg.nic.phy', C.green], ['dg.nic.mac', C.green], ['dg.nic.parse', C.green], ['dg.nic.queues', C.green], ['dg.nic.dma', C.green], ['dg.nic.pcie', C.violet], ['dg.nic.host', C.cyan]];
  if (L === 'w') return { W: 720, H: 290, draw(g) {
    g.text(10, 16, 'dg.nic.line', { c: 'm' });
    const xs = [10, 190, 370, 550], bw = 160, bh = 66, y1 = 36, y2 = 176;
    g.box(176, 26, 538, 226, C.green, { a: 0.04, dash: '6 5', sw: 1 });
    items.forEach(([k, col], i) => {
      const row = i < 4 ? 0 : 1, x = row ? xs[7 - i] : xs[i], y = row ? y2 : y1;
      lbox(g, x, y, bw, bh, col, k, { c: cls(col) });
    });
    for (let i = 0; i < 3; i++) g.line(xs[i] + bw + 2, y1 + bh / 2, xs[i + 1] - 3, y1 + bh / 2, C.mute, { arrow: 1 });
    g.line(xs[3] + bw / 2, y1 + bh + 2, xs[3] + bw / 2, y2 - 3, C.mute, { arrow: 1 });
    for (let i = 3; i > 0; i--) g.line(xs[i] - 2, y2 + bh / 2, xs[i - 1] + bw + 3, y2 + bh / 2, C.mute, { arrow: 1 });
    g.text(10, 274, 'dg.nic.hostside', { c: 'm' });
  } };
  return { W: 340, H: 548, draw(g) {
    g.text(10, 14, 'dg.nic.line', { c: 'm' });
    g.box(4, 86, 332, 370, C.green, { a: 0.04, dash: '6 5', sw: 1 });
    chain(g, 14, 32, 312, items.map(([k, c]) => [k, c, 44]), 18);
    g.text(10, 532, 'dg.nic.hostside', { c: 'm' });
  } };
};

// ch2: the fields of one Ethernet frame
DG.frame = (L) => {
  const F = [['pre', 'pre', C.mute, 1], ['sfd', 'sfd', C.mute, 1], ['dst', 'mac', C.cyan], ['src', 'mac', C.violet], ['type', 'type', C.green], ['data', 'data', C.mute], ['fcs', 'fcs', C.red], ['ifg', 'ifg', C.mute, 1]];
  if (L === 'w') return { W: 720, H: 214, draw(g) {
    const ws = [70, 50, 84, 84, 60, 160, 60, 76]; let x = 56; const xs = [];
    ws.forEach(w => { xs.push(x); x += w; });
    const y = 62, h = 50;
    F.forEach(([n, b, col, ov], i) => { lbox(g, xs[i], y, ws[i], h, col, 'dg.frame.' + n, { c: cls(col), dash: ov ? '5 4' : null, a: ov ? 0.05 : 0.16, rx: 3 }); g.text(xs[i] + ws[i] / 2, y + h + 18, 'dg.frame.b.' + b, { a: 'middle', mono: true, c: ov ? 'm' : '' }); });
    g.text(48, y + h + 18, 'dg.frame.bytes', { a: 'end', c: 'm' });
    const sx = xs[2], ex = xs[6] + ws[6];
    g.line(sx, 46, ex, 46, C.gold, { sw: 1.4 }); g.line(sx, 46, sx, 56, C.gold, { sw: 1.4 }); g.line(ex, 46, ex, 56, C.gold, { sw: 1.4 });
    g.text((sx + ex) / 2, 28, 'dg.frame.span', { a: 'middle', c: 'g' });
    const cx = xs[5] + ws[5], by = y + h + 40;
    g.line(sx, by, cx, by, C.red, { sw: 1.4 }); g.line(sx, by - 10, sx, by, C.red, { sw: 1.4 }); g.line(cx, by - 10, cx, by, C.red, { sw: 1.4 });
    g.text((sx + cx) / 2, by + 20, 'dg.frame.crc', { a: 'middle', c: 'r' });
  } };
  return { W: 340, H: 452, draw(g) {
    g.text(330, 14, 'dg.frame.bytes', { a: 'end', c: 'm' });
    const y0 = 30, rh = 34, gap = 6, x = 34, w = 296;
    F.forEach(([n, b, col, ov], i) => {
      const y = y0 + i * (rh + gap); g.box(x, y, w, rh, col, { dash: ov ? '5 4' : null, a: ov ? 0.05 : 0.16, rx: 3 });
      g.text(x + 12, y + rh / 2, 'dg.frame.' + n, { c: cls(col) }); g.text(x + w - 12, y + rh / 2, 'dg.frame.b.' + b, { a: 'end', mono: true, c: ov ? 'm' : '' });
    });
    const top = y0 + 2 * (rh + gap), fcsEnd = y0 + 6 * (rh + gap) + rh, dataEnd = y0 + 5 * (rh + gap) + rh;
    g.line(10, top, 10, fcsEnd, C.gold, { sw: 1.6 }); g.line(10, top, 16, top, C.gold, { sw: 1.6 }); g.line(10, fcsEnd, 16, fcsEnd, C.gold, { sw: 1.6 });
    g.line(22, top, 22, dataEnd, C.red, { sw: 1.6 }); g.line(22, top, 28, top, C.red, { sw: 1.6 }); g.line(22, dataEnd, 28, dataEnd, C.red, { sw: 1.6 });
    const yt = y0 + 8 * (rh + gap) + 14;
    g.text(10, yt, 'dg.frame.span', { c: 'g', w: 320 });
    g.text(10, yt + 46, 'dg.frame.crc', { c: 'r', w: 320 });
  } };
};

// ch3: the receive path in seven steps
DG.rx = (L) => laneDg(L, [['dg.rx.l.nic', C.green], ['dg.rx.l.mem', C.cyan], ['dg.rx.l.cpu', C.gold]],
  [['dg.rx.s1', 0], ['dg.rx.s2', 0], ['dg.rx.s3', 0], ['dg.rx.s4', 1], ['dg.rx.s5', 1], ['dg.rx.s6', 2], ['dg.rx.s7', 2]]);

// ch5: RSS: hash, indirection table, queue, core
DG.rss = (L) => {
  const hot = L === 'w' ? 6 : 14, cells = 16, nq = 4;
  const table = (g, x0, y, cw, ch, perRow) => {
    for (let i = 0; i < cells; i++) {
      const r = Math.floor(i / perRow), cx = x0 + (i % perRow) * cw, cy = y + r * (ch + 6), on = i === hot;
      g.box(cx + 1, cy, cw - 2, ch, on ? C.gold : C.mute, { a: on ? 0.3 : 0.06, rx: 3 });
      g.text(cx + cw / 2, cy + ch / 2, { raw: String(i % nq) }, { a: 'middle', mono: true, c: on ? 'g' : '' });
    }
  };
  if (L === 'w') return { W: 720, H: 348, draw(g) {
    lbox(g, 10, 20, 230, 58, C.cyan, 'dg.rss.tuple', { c: 'c' });
    lbox(g, 276, 20, 200, 58, C.gold, 'dg.rss.hash', { c: 'g' });
    lbox(g, 512, 20, 198, 58, C.gold, 'dg.rss.h32', { c: 'g' });
    g.line(242, 49, 272, 49, C.mute, { arrow: 1 }); g.line(478, 49, 508, 49, C.mute, { arrow: 1 });
    const x0 = 96, cw = 38, ty = 140, hx = x0 + hot * cw + cw / 2;
    g.line(611, 80, 611, 108, C.gold); g.line(611, 108, hx, 108, C.gold); g.line(hx, 108, hx, ty - 3, C.gold, { arrow: 1 });
    g.text(440, 96, 'dg.rss.low', { a: 'middle', c: 'g' });
    g.text(10, ty + 18, 'dg.rss.table', { c: 'm', w: 80, va: 'mid' });
    table(g, x0, ty, cw, 36, 16);
    const qx = i => 10 + i * 178, qw = 160, qy = 222;
    for (let i = 0; i < nq; i++) {
      lbox(g, qx(i), qy, qw, 40, C.green, 'dg.rss.q', { c: 'n', vars: { n: i } });
      lbox(g, qx(i), qy + 74, qw, 36, C.violet, 'dg.rss.core', { c: 'v', vars: { n: i } });
      g.line(qx(i) + qw / 2, qy + 42, qx(i) + qw / 2, qy + 71, C.mute, { arrow: 1 });
    }
    g.line(hx, ty + 38, qx(2) + qw / 2, qy - 3, C.gold, { arrow: 1 });
  } };
  return { W: 340, H: 538, draw(g) {
    const pos = chain(g, 10, 8, 320, [['dg.rss.tuple', C.cyan, 54], ['dg.rss.hash', C.gold, 44], ['dg.rss.h32', C.gold, 40]], 20);
    const y = pos[2][0] + 40;
    g.text(180, y + 18, 'dg.rss.low', { c: 'g' }); g.line(170, y + 2, 170, y + 33, C.gold, { arrow: 1 });
    g.text(10, y + 52, 'dg.rss.table', { c: 'm', w: 320 });
    const ty = y + 68, cw = 40; table(g, 10, ty, cw, 34, 8);
    const qy = ty + 2 * 40 + 30, qx = i => 10 + i * 82, qw = 74;
    for (let i = 0; i < nq; i++) {
      lbox(g, qx(i), qy, qw, 56, C.green, 'dg.rss.q', { c: 'n', vars: { n: i } });
      lbox(g, qx(i), qy + 86, qw, 56, C.violet, 'dg.rss.core', { c: 'v', vars: { n: i } });
      g.line(qx(i) + qw / 2, qy + 58, qx(i) + qw / 2, qy + 83, C.mute, { arrow: 1 });
    }
    const hx = 10 + (hot % 8) * cw + cw / 2; g.line(hx, ty + 40 + 34 + 2, qx(2) + qw / 2, qy - 3, C.gold, { arrow: 1 });
  } };
};

// ch7: TSO cuts one large send into segments
DG.tso = (L) => {
  const seg = (g, x, y, w, h, dw) => { g.box(x, y, 22, h, C.gold, { a: 0.35, rx: 3 }); g.box(x + 24, y, dw == null ? w - 24 : dw, h, C.cyan, { a: 0.25, rx: 3 }); };
  if (L === 'w') return { W: 720, H: 304, draw(g) {
    g.text(20, 16, 'dg.tso.skb', { c: 'c' });
    g.box(20, 32, 30, 34, C.gold, { a: 0.35, rx: 3 }); g.box(54, 32, 646, 34, C.cyan, { a: 0.25, rx: 3 });
    g.line(360, 70, 360, 96, C.mute, { arrow: 1 });
    lbox(g, 150, 100, 420, 46, C.green, 'dg.tso.nic', { c: 'n' });
    const xs = [20, 152, 284, 470], sw = 116, sy = 186;
    g.line(360, 148, 360, 168, C.mute); g.line(xs[0] + sw / 2, 168, xs[3] + 40, 168, C.mute);
    xs.forEach((x, i) => g.line(i === 3 ? x + 40 : x + sw / 2, 168, i === 3 ? x + 40 : x + sw / 2, sy - 3, C.mute, { arrow: 1 }));
    xs.slice(0, 3).forEach(x => { seg(g, x, sy, sw, 34); g.text(x + sw / 2, sy + 56, 'dg.tso.seg', { a: 'middle', mono: true }); });
    g.text(436, sy + 17, 'dg.tso.dots', { a: 'middle', c: 'm', fs: 20 });
    seg(g, xs[3], sy, 0, 34, 32); g.text(xs[3], sy + 56, 'dg.tso.last', { c: 'g', w: 150 });
    g.text(700, sy + 17, 'dg.tso.count', { a: 'end', c: 'n', weight: 600 });
  } };
  return { W: 340, H: 430, draw(g) {
    g.text(10, 14, 'dg.tso.skb', { c: 'c', w: 320 });
    g.box(10, 52, 26, 30, C.gold, { a: 0.35, rx: 3 }); g.box(40, 52, 290, 30, C.cyan, { a: 0.25, rx: 3 });
    g.line(170, 86, 170, 106, C.mute, { arrow: 1 });
    lbox(g, 10, 110, 320, 56, C.green, 'dg.tso.nic', { c: 'n' });
    g.line(170, 168, 170, 190, C.mute, { arrow: 1 });
    const y0 = 196, ph = 46;
    for (let i = 0; i < 3; i++) { seg(g, 10, y0 + i * ph, 200, 30); g.text(222, y0 + i * ph + 15, 'dg.tso.seg', { mono: true }); }
    g.text(110, y0 + 3 * ph + 6, 'dg.tso.dots', { a: 'middle', c: 'm', fs: 20 });
    seg(g, 10, y0 + 3 * ph + 26, 0, 30, 46); g.text(90, y0 + 3 * ph + 41, 'dg.tso.last', { c: 'g', w: 240, va: 'mid' });
    g.text(10, y0 + 4 * ph + 30, 'dg.tso.count', { c: 'n', weight: 600 });
  } };
};

// ch9: the transmit path in six steps
DG.tx = (L) => laneDg(L, [['dg.tx.l.cpu', C.gold], ['dg.tx.l.mem', C.cyan], ['dg.tx.l.nic', C.green]],
  [['dg.tx.s1', 0], ['dg.tx.s2', 0], ['dg.tx.s3', 2], ['dg.tx.s4', 2], ['dg.tx.s5', 2], ['dg.tx.s6', 0]]);

// ch10: three receive paths and where the XDP hook sits
DG.xdp = (L) => {
  const W = L === 'w', cw = W ? 210 : 104, gx = W ? 35 : 8, x = i => (W ? 10 : 6) + i * (cw + gx), bh = W ? 42 : 54, gp = W ? 18 : 16;
  const down = (g, i, y1, y2, arrow) => g.line(x(i) + cw / 2, y1 + 2, x(i) + cw / 2, y2 - 3, C.mute, { arrow });
  return { W: W ? 720 : 340, H: W ? 420 : 560, draw(g) {
    ['dg.xdp.a', 'dg.xdp.b', 'dg.xdp.c'].forEach((k, i) => g.text(x(i) + cw / 2, 16, k, { a: 'middle', c: i === 1 ? 'g' : 'm', weight: 600, w: cw }));
    const y0 = 36;
    // a plain chain of boxes; returns the bottom of the last one
    const run = (i, items, y) => { items.forEach(([k, c, h], j) => { lbox(g, x(i), y, cw, h, c, k, { c: cls(c) }); if (j < items.length - 1) down(g, i, y + h, y + h + gp, 1); y += h + gp; }); return y - gp; };
    run(0, [['dg.xdp.nic', C.green, bh], ['dg.xdp.drv', C.gold, bh], ['dg.xdp.skb', C.gold, bh], ['dg.xdp.stack', C.gold, bh], ['dg.xdp.sock', C.gold, bh], ['dg.xdp.app', C.cyan, bh]], y0);
    let y = run(1, [['dg.xdp.nic', C.green, bh], ['dg.xdp.drv', C.gold, bh]], y0);
    const hy = y + (W ? 26 : 40); down(g, 1, y, hy - 10, 0);
    g.text(x(1) + cw / 2, hy, 'dg.xdp.hook', { a: 'middle', c: 'g', weight: 600, w: cw, va: 'mid' });
    const py = hy + (W ? 22 : 34), ph = W ? 86 : 134; down(g, 1, hy + (W ? 8 : 20), py, 1);
    g.box(x(1), py, cw, ph, C.gold, { a: 0.34 });
    g.text(x(1) + cw / 2, py + 18, 'dg.xdp.prog', { a: 'middle', c: 'g', w: cw - 12 });
    g.text(x(1) + cw / 2, py + (W ? 48 : 64), 'dg.xdp.acts', { a: 'middle', mono: true, w: cw - 10, fs: W ? 13 : 14 });
    down(g, 1, py + ph, py + ph + gp, 1);
    run(1, [['dg.xdp.afxdp', C.cyan, W ? 50 : 74], ['dg.xdp.app', C.cyan, bh]], py + ph + gp);
    run(2, [['dg.xdp.nic', C.green, bh], ['dg.xdp.pmd', C.cyan, W ? 100 : 150]], y0);
  } };
};

// ch11: an RDMA one-sided write
DG.qp = (L) => {
  const steps = ['dg.qp.s1', 'dg.qp.s2', 'dg.qp.s3', 'dg.qp.s4', 'dg.qp.s5', 'dg.qp.s6'];
  if (L === 'w') return { W: 720, H: 440, draw(g) {
    g.text(20, 16, 'dg.qp.a', { c: 'm', weight: 600 }); g.text(430, 16, 'dg.qp.b', { c: 'm', weight: 600 });
    g.box(10, 30, 290, 270, C.mute, { a: 0.04, sw: 1 }); g.box(420, 30, 290, 270, C.mute, { a: 0.04, sw: 1 });
    lbox(g, 24, 46, 262, 44, C.cyan, 'dg.qp.appA', { c: 'c' });
    lbox(g, 100, 130, 186, 44, C.gold, 'dg.qp.sq', { c: 'g' });
    lbox(g, 24, 226, 262, 54, C.green, 'dg.qp.nicA', { c: 'n' });
    lbox(g, 434, 46, 262, 44, C.mute, 'dg.qp.cpuB', { c: 'm', dash: '6 5' });
    lbox(g, 434, 130, 262, 44, C.cyan, 'dg.qp.memB', { c: 'c' });
    lbox(g, 434, 226, 262, 54, C.green, 'dg.qp.nicB', { c: 'n' });
    g.line(193, 92, 193, 127, C.gold, { arrow: 1 }); g.badge(207, 108, 1, C.gold);
    g.line(193, 176, 193, 223, C.mute, { dash: '4 4' });
    g.line(50, 92, 50, 223, C.cyan, { arrow: 1 }); g.badge(64, 160, 2, C.cyan);
    g.line(288, 244, 431, 244, C.violet, { arrow: 1, sw: 2 }); g.badge(360, 230, 3, C.violet);
    g.line(565, 223, 565, 177, C.green, { arrow: 1 }); g.badge(579, 200, 4, C.green);
    g.line(431, 266, 288, 266, C.violet, { arrow: 1 }); g.badge(360, 282, 5, C.violet);
    g.line(260, 223, 260, 177, C.green, { arrow: 1 }); g.badge(246, 200, 6, C.green);
    steps.forEach((k, i) => { const cx = i < 3 ? 10 : 370, cy = 330 + (i % 3) * 36; g.badge(cx + 11, cy, i + 1, [C.gold, C.cyan, C.violet, C.green, C.violet, C.green][i]); g.text(cx + 30, cy, k, { w: 310 }); });
  } };
  return { W: 340, H: 600, draw(g) {
    g.text(10, 14, 'dg.qp.a', { c: 'm', weight: 600 });
    lbox(g, 10, 30, 150, 52, C.cyan, 'dg.qp.appA', { c: 'c' });
    lbox(g, 180, 30, 150, 52, C.gold, 'dg.qp.sq', { c: 'g' });
    lbox(g, 10, 120, 320, 40, C.green, 'dg.qp.nicA', { c: 'n' });
    g.line(162, 56, 177, 56, C.gold, { arrow: 1 }); g.badge(170, 16, 1, C.gold);
    g.line(85, 84, 85, 117, C.cyan, { arrow: 1 }); g.badge(100, 100, 2, C.cyan);
    g.line(120, 162, 120, 213, C.violet, { arrow: 1, sw: 2 }); g.badge(104, 188, 3, C.violet);
    g.line(220, 213, 220, 162, C.violet, { arrow: 1 }); g.badge(236, 188, 5, C.violet);
    g.line(300, 117, 300, 84, C.green, { arrow: 1 }); g.badge(316, 100, 6, C.green);
    lbox(g, 10, 216, 320, 40, C.green, 'dg.qp.nicB', { c: 'n' });
    g.line(85, 258, 85, 291, C.green, { arrow: 1 }); g.badge(100, 274, 4, C.green);
    lbox(g, 10, 294, 150, 52, C.cyan, 'dg.qp.memB', { c: 'c' });
    lbox(g, 180, 294, 150, 52, C.mute, 'dg.qp.cpuB', { c: 'm', dash: '6 5' });
    g.text(330, 204, 'dg.qp.b', { a: 'end', c: 'm', weight: 600 });
    steps.forEach((k, i) => { const cy = 376 + i * 38; g.badge(21, cy, i + 1, [C.gold, C.cyan, C.violet, C.green, C.violet, C.green][i]); g.text(40, cy, k, { w: 296, va: 'mid' }); });
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


/* ───────── shared formatting ───────── */
const mpps = x => t('u.mpps', { v: fmt(x / 1e6, x >= 1e8 ? 0 : x >= 1e7 ? 1 : 2) });
const nsAuto = x => x >= 1000 ? dur(x / 1000) : ns(x, x < 10 ? 2 : x < 100 ? 1 : 0);
const gbps = (x, d) => t('u.gbps', { v: fmt(x, d == null ? (x < 100 ? 1 : 0) : d) });
const speed = v => t('u.gbpsSpeed', { v: fmt(v, 0) });
const bytesStr = b => b >= 1e6 ? t('u.mb', { v: fmt(b / 1e6, 1) }) : b >= 1024 ? t('u.kb', { v: fmt(b / 1024, b >= 10240 ? 0 : 1) }) : t('u.bytes', { v: fmt(b, 0) });
const mib = b => t('u.mib', { v: fmt(b / 1048576, 1) });
const cores = x => t('u.cores', { v: fmt(x, x < 10 ? 1 : 0) });
const times = x => t('u.x', { v: fmt(x, 2) });
const smallPct = x => pct(x, x > 0 ? 1 : 0);
const outR = (s, f) => { const o = $('#' + s.id + 'o'); const v = f(); if (o.textContent !== v) o.textContent = v; };
const setSpan = (name, i, s) => { const sp = radios(name)[i].parentElement.querySelector('span'); if (sp.textContent !== s) sp.textContent = s; };

// vertical bars for per-queue / per-path loads, in units of the mean (no canvas text but the axis ticks)
function loadBars(cv, load, mean, parts) {
  const { c, w, h } = fit(cv), n = load.length, top = Math.max(2, Math.ceil(Math.max(...load, mean) / Math.max(mean, 1e-9) * 1.1 * 2) / 2);
  const f = frame(w, h, [16, 12, 30, 40], 0, n, 0, top);
  const step = top > 6 ? 2 : top > 3 ? 1 : 0.5, vals = []; for (let v = 0; v <= top + 1e-9; v += step) vals.push(v);
  yTicks(c, f, vals, v => fmt(v, v % 1 ? 1 : 0) + '×');
  c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  const bw = (f.R - f.L) / n;
  for (let i = 0; i < n; i++) {
    const x = f.L + i * bw + Math.min(2, bw * 0.15), ww = Math.max(1, bw - 2 * Math.min(2, bw * 0.15));
    let y = f.B; (parts ? parts(i) : [[load[i], C.cyan]]).forEach(([v, col]) => { const hh = f.B - f.Y(v / Math.max(mean, 1e-9)); if (hh <= 0) return; c.fillStyle = col; c.fillRect(x, y - hh, ww, hh); y -= hh; });
  }
  const every = n <= 16 ? 1 : n <= 32 ? 4 : 8; c.fillStyle = C.mute;
  spacedTicks(c, Array.from({ length: n }, (_, i) => i).filter(i => i % every === 0).map(i => [f.L + (i + 0.5) * bw, fmt(i, 0)]), f.B + 12, w);
  if (mean > 0) { c.strokeStyle = C.ink; c.lineWidth = 1.4; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(f.L, f.Y(1)); c.lineTo(f.R, f.Y(1)); c.stroke(); c.setLineDash([]); }
}

/* ───────── 02 the frame and the packet-rate budget ───────── */
(() => {
  const vl = $('#frVlan'), fl = $('#frFlip'), sS = $('#frSp'), sZ = $('#frSz');
  const sp = () => M.FRAME.speeds[+sS.value], sz = () => M.FRAME.sizes[+sZ.value];
  function hexHtml(f, vlan) {
    const b = f.rx, h = f.head, run = (cls, a, b0) => `<span class="${cls}">${a.map((x, i) => (b0 != null && i === b0 ? `<span class="h">${M.hb(x)}</span>` : M.hb(x))).join(' ')}</span>`;
    const out = [run('c', b.slice(0, 6)), run('v', b.slice(6, 12))];
    if (vlan) out.push(run('g', b.slice(12, 16)));
    out.push(run('n', b.slice(h - 2, h)));
    const pay = b.slice(h, b.length - 4), flipAt = fl.checked ? 5 : null;
    if (pay.length > 40) { out.push(run('m', pay.slice(0, 24), flipAt)); out.push(`<span class="m">${esc(t('ch2.hex.more', { n: fmt(pay.length - 32, 0) }))}</span>`); out.push(run('m', pay.slice(-8))); }
    else out.push(run('m', pay, flipAt));
    out.push(run('r', b.slice(-4)));
    return out.join(' ');
  }
  function text() {
    const vlan = vl.checked, f = M.frame(sz(), vlan, fl.checked), bd = M.budget(sp(), sz());
    outR(sS, () => speed(sp())); outR(sZ, () => t('u.bytes', { v: fmt(sz(), 0) }));
    $('#frLtag').hidden = !vlan;
    putHTML('#frHex', hexHtml(f, vlan));
    put('#frFcs', M.hex(f.fcs)); put('#frRx', M.hex(f.rxFcs) + ' · ' + t(f.ok ? 'ch2.res.ok' : 'ch2.res.bad')); $('#frRx').className = f.ok ? 'n' : 'r';
    putHTML('#frSayF', t(M.say.fcs(f).key));
    put('#frPps', mpps(bd.pps)); put('#frNs', nsAuto(bd.ns)); put('#frCyc', t('u.cyc', { v: fmt(bd.cyc, bd.cyc < 10 ? 1 : 0) })); put('#frEff', pct(bd.eff, 1));
    putHTML('#frSay', t(M.say.frame(bd).key, { speed: speed(sp()), size: fmt(sz(), 0), ns: nsAuto(bd.ns), cyc: t('u.cyc', { v: fmt(bd.cyc, bd.cyc < 10 ? 1 : 0) }), dram: fmt(M.SRC.dram.lo, 0) }));
  }
  [sS, sZ].forEach(s => s.addEventListener('input', text)); [vl, fl].forEach(e => e.addEventListener('change', text));
  langHooks.push(text); text();
})();

/* ───────── 03 descriptor prefetch ───────── */
(() => {
  const sS = $('#pfSp'), sZ = $('#pfSz'), sB = $('#pfB'), sK = $('#pfK');
  const v = () => ({ sp: M.FRAME.speeds[+sS.value], sz: M.FRAME.sizes[+sZ.value], B: M.PREF.batches[+sB.value], K: M.PREF.outs[+sK.value], L: M.PREF.lats[+radioVal('pfL')] });
  function text() {
    const o = v(), r = M.prefetch(o.sp, o.sz, o.B, o.K, o.L);
    outR(sS, () => speed(o.sp)); outR(sZ, () => t('u.bytes', { v: fmt(o.sz, 0) })); outR(sB, () => fmt(o.B, 0)); outR(sK, () => fmt(o.K, 0));
    ['min', 'med', 'max'].forEach((k, i) => setSpan('pfL', i, t('ch3.lat.' + k, { v: fmt(M.PREF.lats[i], 0) })));
    put('#pfNeed', fmt(r.need, r.need < 10 ? 1 : 0)); put('#pfReads', fmt(r.reads, r.reads < 10 ? 1 : 0)); put('#pfMax', mpps(r.max)); put('#pfFrac', pct(r.frac)); $('#pfFrac').className = r.ok ? 'n' : 'r';
    putHTML('#pfSay', t(M.say.pref(r).key, { need: fmt(r.need, r.need < 10 ? 1 : 0), reads: fmt(r.reads, r.reads < 10 ? 1 : 0), out: fmt(o.K, 0), max: mpps(r.max), pps: mpps(r.pps), frac: pct(r.frac) }));
  }
  [sS, sZ, sB, sK].forEach(s => s.addEventListener('input', text)); onAll(radios('pfL'), 'change', text);
  langHooks.push(text); text();
})();

/* ───────── 04 PCIe bytes per received packet ───────── */
(() => {
  const sZ = $('#pcSz');
  const rows = [['data', 'data', null], ['wb', 'wb', null], ['fetch', 'fetch', 'fetch'], ['irq', 'irq', null], ['head', 'head', 'head'], ['tail', null, 'tail']];
  const bv = x => x ? fmt(x, Math.abs(x - Math.round(x)) > 1e-9 ? 1 : 0) : t('u.none');
  function text() {
    const gen = +radioVal('pcG'), o = { gen, lanes: +radioVal('pcW'), size: M.FRAME.sizes[+sZ.value], mps: +radioVal('pcM'), design: radioVal('pcD'), gbps: +radioVal('pcSp'), dll: radioVal('pcL') === 'b' ? M.SRC.b1.dll : undefined };
    const r = M.pcieRx(o);
    outR(sZ, () => t('u.bytes', { v: fmt(o.size, 0) }));
    setSpan('pcL', 0, t('ch4.dll.n', { v: pct(M.PCIE.dllN) })); setSpan('pcL', 1, t('ch4.dll.b', { v: pct(M.SRC.b1.dll) }));
    radios('pcL').forEach(e => { e.disabled = gen === 6; });
    let h = rows.map(([k, u, d]) => `<tr><td>${esc(t('ch4.it.' + k))}</td><td>${bv(u ? r.up[u] : 0)}</td><td>${bv(d ? r.down[d] : 0)}</td></tr>`).join('');
    h += `<tr><td><b>${esc(t('ch4.it.sum'))}</b></td><td><b>${bv(r.upB)}</b></td><td><b>${bv(r.downB)}</b></td></tr>`;
    putHTML('#pcTbl tbody', h);
    put('#pcNeed', gbps(r.needUp)); put('#pcAvail', gbps(r.avail)); put('#pcFrac', pct(r.frac)); $('#pcFrac').className = r.ok ? 'n' : 'r'; put('#pcOh', pct(r.ohUp, r.ohUp < 0.1 ? 1 : 0));
    putHTML('#pcSay', t(M.say.pcie(r).key, { need: gbps(r.needUp), avail: gbps(r.avail), frac: pct(r.frac), up: fmt(r.upB, 0) }));
  }
  sZ.addEventListener('input', text); onAll(['pcG', 'pcW', 'pcSp', 'pcM', 'pcD', 'pcL'].flatMap(radios), 'change', text);
  langHooks.push(text); text();
})();

/* ───────── 05a the Toeplitz hash ───────── */
(() => {
  const iS = $('#rsSrc'), iSp = $('#rsSp'), iD = $('#rsDst'), iDp = $('#rsDp'), cP = $('#rsPorts'), sQ = $('#rsQ');
  const vec = (src, sp, dst, dp) => { for (const v of [...M.SRC.ms.v4, ...M.SRC.ms.v6]) if (v[0] === dst && v[1] === dp && v[2] === src && v[3] === sp) return v; return null; };
  function text() {
    const nq = M.RSS.queues[+sQ.value], sp = parseInt(iSp.value, 10), dp = parseInt(iDp.value, 10), ports = cP.checked;
    outR(sQ, () => fmt(nq, 0));
    const okPort = x => Number.isInteger(x) && x >= 0 && x <= 65535;
    const r = okPort(sp) && okPort(dp) ? M.rss(iS.value.trim(), iD.value.trim(), sp, dp, ports, nq) : null;
    if (!r) { ['#rsHash', '#rsIdx', '#rsQn', '#rsRq', '#rsMs'].forEach(s => put(s, t('u.none'))); putHTML('#rsSay', t('ch5.bad')); return; }
    put('#rsHash', M.hex(r.h)); put('#rsIdx', fmt(r.idx, 0)); put('#rsQn', fmt(r.q, 0)); put('#rsRq', fmt(r.rq, 0));
    const v = vec(iS.value.trim(), sp, iD.value.trim(), dp), want = v ? (ports ? v[5] : v[4]) : null;
    put('#rsMs', v ? M.hex(want) + (want === r.h ? ' ✓' : ' ✗') : t('ch5.ms.na')); $('#rsMs').className = v ? (want === r.h ? 'n' : 'r') : '';
    putHTML('#rsSay', t(M.say.hash(r).key));
  }
  [iS, iSp, iD, iDp].forEach(e => e.addEventListener('input', text)); cP.addEventListener('change', text); sQ.addEventListener('input', text);
  document.querySelectorAll('[data-vec]').forEach(b => b.addEventListener('click', () => {
    const [fam, i] = b.dataset.vec.split('.'), v = M.SRC.ms[fam][+i];
    iD.value = v[0]; iDp.value = v[1]; iS.value = v[2]; iSp.value = v[3]; text();
  }));
  langHooks.push(text); text();
})();

/* ───────── 05b flows onto queues ───────── */
(() => {
  const cv = $('#ldCv'), sQ = $('#ldQ'), sM = $('#ldM'), sE = $('#ldE'); let seed = 7, memo = null;
  const v = () => ({ q: M.RSS.queues[+sQ.value], m: M.RSS.mice[+sM.value], e: M.RSS.elephants[+sE.value] });
  const run = () => { const o = v(), k = [o.q, o.m, o.e, seed].join('/'); if (!memo || memo.k !== k) memo = { k, o, r: M.rssLoad(o.q, o.m, o.e, seed) }; return memo; };
  const sim = reg(cv, { draw() {
    const { r } = run();
    loadBars(cv, r.load, r.mean, i => [[r.load[i] - r.eq[i] * M.RSS.weight, C.cyan], [r.eq[i] * M.RSS.weight, C.gold]]);
  } });
  function text() {
    const { o, r } = run();
    outR(sQ, () => fmt(o.q, 0)); outR(sM, () => fmt(o.m, 0)); outR(sE, () => fmt(o.e, 0));
    put('#ldRatio', r.tot ? times(r.ratio) : t('u.none')); put('#ldShare', r.tot ? pct(r.share, 1) : t('u.none')); put('#ldEmpty', fmt(r.empty, 0)); put('#ldPno', pct(r.pNo));
    putHTML('#ldSay', t(M.say.load(r, o.e).key, { n: fmt(o.m, 0), q: fmt(o.q, 0), over: pct(Math.max(0, r.ratio - 1)), ratio: times(r.ratio), pno: pct(r.pNo) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sQ, sM, sE].forEach(s => s.addEventListener('input', go)); $('#ldRe').addEventListener('click', () => { seed++; go(); });
  text();
})();

/* ───────── 07 offloads and TSO ───────── */
(() => {
  const cv = $('#ofCv'), sF = $('#ofF');
  const v = () => ({ mtu: +radioVal('ofM'), agg: radioVal('ofA'), flows: M.OFF.flows[+sF.value] });
  const cols = [C.cyan, C.gold, C.violet];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), o = v(), rs = M.OFF.aggs.map(a => [a, M.offload(o.mtu, a, o.flows)]);
    const labs = rs.map(([a]) => t('ch7.a.' + a)), lf = labelFont(c, labs, Math.min(170, w * 0.36)), L = lf.w, R = w - 10, max = Math.max(...rs.map(([, r]) => r.cpb)), rh = (h - 16) / 3;
    c.font = FONT; const room = Math.max(...rs.map(([, r]) => c.measureText(t('u.cpb', { v: fmt(r.cpb, 2) })).width)) + 12;
    rs.forEach(([a, r], i) => {
      const y = 8 + i * rh + rh / 2, bh = Math.min(22, rh * 0.55), on = a === o.agg, X = x => Math.max(20, R - L - room) * x / max;
      c.font = lf.font; c.textAlign = 'right'; c.fillStyle = on ? C.gold : C.ink; const ls = lf.lines.get(labs[i]); ls.forEach((l, j) => c.fillText(l, L - 8, y + (j - (ls.length - 1) / 2) * lf.lh)); c.font = FONT;
      let x = L; [r.parts.byte, r.parts.frame, r.parts.skb].forEach((p, j) => { c.fillStyle = cols[j]; c.fillRect(x, y - bh / 2, Math.max(0.5, X(p)), bh); x += X(p); });
      if (on) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L - 0.5, y - bh / 2 - 2, x - L + 1, bh + 4); }
      const s = t('u.cpb', { v: fmt(r.cpb, 2) }); let tw = c.measureText(s).width;
      if (x + 8 + tw > R) { c.font = FONT.replace('12px', (12 * Math.max(0.7, (R - x - 8) / tw)).toFixed(1) + 'px'); }
      c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(s, x + 8, y); c.font = FONT;
    });
  } });
  function text() {
    const o = v(), r = M.offload(o.mtu, o.agg, o.flows), len = +radioVal('tsL'), ts = M.tso(len, M.OFF.mss[o.mtu]);
    outR(sF, () => fmt(o.flows, 0));
    put('#ofCpb', t('u.cpb', { v: fmt(r.cpb, 2) })); put('#ofGbps', gbps(r.gbps)); put('#ofCores', cores(r.cores)); put('#ofS', bytesStr(r.S)); put('#ofCopy', pct(r.copy));
    putHTML('#ofSay', t(M.say.off(r, o.agg, o.flows).key, { mss: fmt(r.mss, 0), gbps: gbps(r.gbps), flows: fmt(o.flows, 0), s: bytesStr(r.S) }));
    const row = s => `<tr><td>${s.i + 1}</td><td>${s.seq}</td><td>${fmt(s.len, 0)}</td><td>0x${s.id.toString(16).padStart(4, '0')}</td><td>${s.psh ? 'PSH' : esc(t('u.none'))}</td></tr>`;
    const segs = ts.segs, show = segs.length > 6 ? [...segs.slice(0, 3).map(row), `<tr><td colspan="5">${esc(t('ch7.tso.more', { n: fmt(segs.length - 5, 0) }))}</td></tr>`, ...segs.slice(-2).map(row)] : segs.map(row);
    putHTML('#tsTbl tbody', show.join(''));
    putHTML('#tsSum', t('ch7.tso.sum', { len: fmt(len, 0), n: fmt(ts.n, 0), hdr: fmt(ts.hdrBytes, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sF.addEventListener('input', go); onAll(['ofM', 'ofA', 'tsL'].flatMap(radios), 'change', go);
  text();
})();

/* ───────── 08 DDIO ───────── */
(() => {
  const cv = $('#ddCv'), sR = $('#ddR'), sW = $('#ddW'), sT = $('#ddT'), memo = new Map();
  const v = () => ({ R: M.DDIO.rings[+sR.value], W: M.DDIO.ways[+sW.value], size: +radioVal('ddS'), stall: M.DDIO.stalls[+sT.value] });
  const run = () => { const o = v(), k = [o.R, o.W, o.size, o.stall].join('/'); if (!memo.has(k)) memo.set(k, M.ddioSim(o.R, o.W, o.size, o.stall)); return memo.get(k); };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = run(), max = Math.max(r.foot, r.capBytes);
    bars(c, w, h, [[t('ch8.cv.foot'), r.foot, r.fits ? C.cyan : C.red, mib(r.foot)], [t('ch8.cv.cap'), r.capBytes, C.gold, mib(r.capBytes)]], x => x / max * 0.82);
  } });
  function text() {
    const o = v(), r = run();
    outR(sR, () => t('u.slots', { v: fmt(o.R, 0) })); outR(sW, () => fmt(o.W, 0) + ' / ' + fmt(M.SRC.farshin.ways, 0)); outR(sT, () => us(o.stall, 0));
    put('#ddRhit', pct(r.rHit)); $('#ddRhit').className = r.rHit < 0.9 ? 'r' : 'g'; put('#ddWhit', pct(r.wHit)); put('#ddDram', t('u.bytes', { v: fmt(r.dram, 0) })); put('#ddDrop', smallPct(r.dropPct)); $('#ddDrop').className = r.drops ? 'r' : '';
    put('#ddFoot', fmt(r.foot / 1048576, 1) + ' / ' + mib(r.capBytes));
    putHTML('#ddSay', t(M.say.ddio(r).key, { foot: mib(r.foot), cap: mib(r.capBytes), drop: smallPct(r.dropPct), dram: t('u.bytes', { v: fmt(r.dram, 0) }), rhit: pct(r.rHit) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sR, sW, sT].forEach(s => s.addEventListener('input', go)); onAll(radios('ddS'), 'change', go);
  text();
})();

/* ───────── 09 byte queue limits ───────── */
(() => {
  const cv = $('#bqCv'), sR = $('#bqR'), sT = $('#bqT'), cB = $('#bqOn');
  const v = () => ({ sp: +radioVal('bqSp'), ring: M.BQL.rings[+sR.value], pkt: +radioVal('bqP'), tc: M.BQL.tcs[+sT.value], on: cB.checked });
  let memo = null;
  const run = () => { const o = v(), k = JSON.stringify(o); if (!memo || memo.k !== k) memo = { k, r: M.bql(o.sp, o.ring, o.pkt, o.tc, o.on) }; return memo.r; };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = run(), top = Math.max(...r.trace.map(x => Math.max(x[1], x[2]))) * 1.12;
    const f = frame(w, h, [30, 16, 40, 58], 0, M.BQL.steps, 0, top);
    const nice = x => { const p = Math.pow(10, Math.floor(Math.log10(x))); return [1, 2, 5, 10].map(k => k * p).find(k => k >= x); }, step = nice(top / 4), vals = [];
    for (let y = 0; y <= top; y += step) vals.push(y);
    yTicks(c, f, vals, y => y >= 1e6 ? fmt(y / 1e6, y % 1e6 ? 1 : 0) + 'M' : y >= 1000 ? fmt(y / 1000, 0) + 'k' : fmt(y, 0));
    c.fillStyle = C.mute; spacedTicks(c, [0, 100, 200, 300, 400].map(x => [f.X(x), fmt(x, 0)]), f.B + 12, w);
    axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
    path(c, r.trace.map(([i, , q]) => [i, q]), f.X, f.Y, C.cyan, 1.6);
    path(c, r.trace.map(([i, l]) => [i, l]), f.X, f.Y, C.gold, 2.2);
  } });
  function text() {
    const o = v(), r = run();
    outR(sR, () => t('u.slots', { v: fmt(o.ring, 0) })); outR(sT, () => us(o.tc, 0));
    put('#bqQ', bytesStr(r.queued)); put('#bqD', dur(r.delay)); $('#bqD').className = r.delay > 1000 ? 'r' : 'c'; put('#bqRing', bytesStr(r.ringBytes)); put('#bqIdle', pct(r.idleShare, 1));
    putHTML('#bqSay', t(M.say.bql(r, o.on).key, { queued: bytesStr(r.queued), delay: dur(r.delay), limit: bytesStr(r.limit), idle: pct(r.idleShare, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sR, sT].forEach(s => s.addEventListener('input', go)); cB.addEventListener('change', go); onAll(['bqSp', 'bqP'].flatMap(radios), 'change', go);
  text();
})();

/* ───────── 10 kernel stack, XDP, DPDK ───────── */
(() => {
  const cv = $('#xdCv'), sZ = $('#xdSz'), cols = { ct: C.red, raw: C.red, xdp: C.gold, dpdk: C.cyan };
  const run = () => M.xdpCores(+radioVal('xdSp'), M.FRAME.sizes[+sZ.value]);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = run(), max = Math.max(...r.rows.map(x => x.cores));
    bars(c, w, h, r.rows.map(x => [t('ch10.cv.' + x.p), x.cores, cols[x.p], cores(x.cores)]), v => v / max * 0.8);
  } });
  function text() {
    const r = run(), R = Object.fromEntries(r.rows.map(x => [x.p, x]));
    outR(sZ, () => t('u.bytes', { v: fmt(M.FRAME.sizes[+sZ.value], 0) }));
    putHTML('#xdTbl tbody', r.rows.map(x => `<tr><td>${esc(t('ch10.p.' + x.p))}</td><td>${fmt(x.mpps, 1)}</td><td>${esc(ns(x.ns, 0))}<br>${esc(t('u.cyc', { v: fmt(x.cyc, 0) }))}</td><td>${esc(cores(x.cores))}</td></tr>`).join(''));
    put('#xdPps', mpps(r.pps)); put('#xdX', cores(R.xdp.cores)); put('#xdD', cores(R.dpdk.cores));
    putHTML('#xdSay', t(M.say.xdp(r).key, { pps: mpps(r.pps), raw: cores(R.raw.cores), xdp: cores(R.xdp.cores), dpdk: cores(R.dpdk.cores), pci: fmt(M.SRC.xdp.pci, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sZ.addEventListener('input', go); onAll(radios('xdSp'), 'change', go);
  text();
})();

/* ───────── 12 ECMP and packet spraying ───────── */
(() => {
  const cv = $('#aiCv'), sF = $('#aiF'), sP = $('#aiP'); let seed = 11;
  const v = () => ({ F: M.AI.flows[+sF.value], P: M.AI.paths[+sP.value], mode: radioVal('aiM') });
  const run = () => { const o = v(); return { o, r: M.ecmp(o.F, o.P, o.mode, seed) }; };
  const sim = reg(cv, { draw() { const { r } = run(); loadBars(cv, r.load, r.mean, null); } });
  function text() {
    const { o, r } = run();
    outR(sF, () => fmt(o.F, 0)); outR(sP, () => fmt(o.P, 0));
    put('#aiEff', pct(r.eff)); $('#aiEff').className = r.eff < 0.8 ? 'r' : 'n'; put('#aiSlow', times(r.slow)); put('#aiIdle', fmt(r.idle, 0));
    putHTML('#aiSay', t(M.say.ai(r, o.mode).key, { eff: pct(r.eff), flows: fmt(o.F, 0), paths: fmt(o.P, 0), idle: fmt(r.idle, 0), slow: times(r.slow) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sF, sP].forEach(s => s.addEventListener('input', go)); onAll(radios('aiM'), 'change', go); $('#aiRe').addEventListener('click', () => { seed++; go(); });
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
