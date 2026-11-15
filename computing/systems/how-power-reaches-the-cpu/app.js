/* How power reaches the CPU: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js.
   The canvas, chart and SVG helpers follow how-the-os-talks-to-hardware/app.js. */
(() => {
'use strict';
const M = window.PowerCpuModels;
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
const U = (k, d) => (x, dd) => t('u.' + k, { v: fmt(x, dd == null ? d : dd) });
const W = U('W', 0), A = U('A', 0), V = U('V', 2), mV = U('mV', 0), GHz = U('GHz', 1), kHz = U('kHz', 0), MHz = U('MHz', 0), nH = U('nH', 0), mohm = U('mohm', 2), usec = U('us', 0), sec = U('s', 0), degC = U('C', 0), J = U('J', 2), KW = U('KW', 2);
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



function poly(g, pts, col, sw, dash) { S('polyline', { points: pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), fill: 'none', stroke: col, 'stroke-width': sw || 1.6, 'stroke-dasharray': dash || 'none', 'stroke-linejoin': 'round' }, g.svg); }
const raw = s => ({ raw: s });
// a box with a name and a second line under it
function lbox2(g, x, y, w, h, col, k1, k2, o) {
  o = o || {}; g.box(x, y, w, h, col, { dash: o.dash });
  g.text(x + w / 2, y + h / 2 - 10, k1, { a: 'middle', c: cls(col), w: w - 12, va: 'mid', weight: 600 });
  g.text(x + w / 2, y + h / 2 + 12, k2, { a: 'middle', c: 'm', w: w - 12, va: 'mid' });
}

/* ───────── diagrams ─────────
   Colours: mains and the PSU violet, 12 V cyan, the VRM and power gold, the chip green, heat and loss red. */
// ch1: the chain
DG.chain = (L) => {
  const items = [['dg.chain.wall', 'dg.chain.wallv', C.violet], ['dg.chain.psu', 'dg.chain.psuv', C.violet], ['dg.chain.vrm', 'dg.chain.vrmv', C.gold], ['dg.chain.cpu', 'dg.chain.cpuv', C.green]];
  const amps = ['dg.chain.a1', 'dg.chain.a2', 'dg.chain.a3'];
  if (L === 'w') return { W: 720, H: 210, draw(g) {
    items.forEach(([k1, k2, col], i) => { const x = 10 + i * 180; lbox2(g, x, 30, 150, 76, col, k1, k2); if (i < 3) g.line(x + 152, 68, x + 178, 68, C.mute, { arrow: 1 }); });
    amps.forEach((k, i) => g.text(10 + i * 180 + 165, 128, k, { a: 'middle', c: 'c', mono: true }));
    g.text(10, 178, 'dg.chain.heat', { c: 'r' });
  } };
  return { W: 340, H: 420, draw(g) {
    items.forEach(([k1, k2, col], i) => { const y = 10 + i * 104; lbox2(g, 10, y, 220, 70, col, k1, k2); if (i < 3) { g.line(120, y + 72, 120, y + 102, C.mute, { arrow: 1 }); g.text(136, y + 87, amps[i], { c: 'c', mono: true }); } });
    g.text(10, 404, 'dg.chain.heat', { c: 'r', w: 320 });
  } };
};

// ch2: the V/f curve with P-states (numbers from the model)
DG.vf = (L) => {
  const Wd = L === 'w' ? 720 : 340, H = L === 'w' ? 300 : 300, m = L === 'w' ? [24, 20, 50, 60] : [24, 14, 50, 50];
  return { W: Wd, H, draw(g) {
    const x0 = 0.4, x1 = 6.2, y0 = 0.6, y1 = 1.5, Lx = m[3], R = Wd - m[1], T = m[0], B = H - m[2];
    const X = f => Lx + (R - Lx) * (f - x0) / (x1 - x0), Y = v => B - (B - T) * (v - y0) / (y1 - y0);
    g.line(Lx, T, Lx, B, C.line); g.line(Lx, B, R, B, C.line);
    [0.7, 1.0, 1.3].forEach(v => { g.line(Lx, Y(v), R, Y(v), C.grid); g.text(Lx - 6, Y(v), raw(fmt(v, 1)), { a: 'end', c: 'm', mono: true }); });
    [1, 2, 3, 4, 5, 6].forEach(f => g.text(X(f), B + 16, raw(fmt(f, 0)), { a: 'middle', c: 'm', mono: true }));
    g.text(R, B + 38, 'dg.vf.x', { a: 'end', c: 'm' }); g.text(Lx + 4, T - 10, 'dg.vf.y', { c: 'm' });
    const pts = []; for (let f = x0; f <= M.CHIP.fTop + 1e-9; f += 0.05) pts.push([X(f), Y(M.vFor(f))]);
    poly(g, pts, C.cyan, 2.4);
    M.PSTATES.forEach(f => g.circle(X(f), Y(M.vFor(f)), 5, C.gold, { solid: true }));
    g.text(X(0.5), Y(M.CHIP.vmin) - 36, 'dg.vf.floor', { c: 'c' });
    g.text(X(5.0) - 14, Y(M.vFor(5.6)) - 6, 'dg.vf.steep', { a: 'end', c: 'c' });
    g.text(X(4.0) + 10, Y(M.vFor(4.0)) + 18, 'dg.vf.ps', { c: 'g' });
  } };
};

// ch3: inside an ATX power supply
DG.psu = (L) => {
  if (L === 'w') return { W: 720, H: 300, draw(g) {
    const xs = [15, 195, 375, 555], w = 150, h = 50;
    const top = ['dg.psu.ac', 'dg.psu.emi', 'dg.psu.rect', 'dg.psu.pfc'];
    top.forEach((k, i) => { lbox(g, xs[i], 20, w, h, C.violet, k, { c: 'v' }); if (i < 3) g.line(xs[i] + w + 2, 45, xs[i + 1] - 3, 45, C.mute, { arrow: 1 }); });
    g.line(630, 72, 630, 128, C.mute, { arrow: 1 }); g.text(620, 100, 'dg.psu.bus', { a: 'end', c: 'v' });
    const bot = [['dg.psu.sw', C.violet], ['dg.psu.xf', C.mute], ['dg.psu.sr', C.cyan], ['dg.psu.out', C.cyan]];
    bot.forEach(([k, col], i) => { const x = xs[3 - i]; lbox(g, x, 130, w, h, col, k, { c: cls(col) }); if (i < 3) g.line(x - 2, 155, xs[3 - i - 1] + w + 3, 155, C.mute, { arrow: 1 }); });
    g.line(90, 182, 90, 228, C.mute, { arrow: 1 }); lbox(g, 15, 230, 150, 46, C.cyan, 'dg.psu.dc', { c: 'c' });
    g.line(450, 186, 450, 290, C.red, { dash: '6 5', sw: 1.8 }); g.text(460, 200, 'dg.psu.iso', { c: 'r' });
    g.text(440, 250, 'dg.psu.sec', { a: 'end', c: 'c' }); g.text(705, 250, 'dg.psu.pri', { a: 'end', c: 'v' });
  } };
  return { W: 340, H: 560, draw(g) {
    const items = [['dg.psu.ac', C.violet], ['dg.psu.emi', C.violet], ['dg.psu.rect', C.violet], ['dg.psu.pfc', C.violet], ['dg.psu.sw', C.violet], ['dg.psu.xf', C.mute], ['dg.psu.sr', C.cyan], ['dg.psu.out', C.cyan], ['dg.psu.dc', C.cyan]];
    let y = 8; items.forEach(([k, col], i) => { lbox(g, 10, y, 220, 40, col, k, { c: cls(col) }); if (i < items.length - 1) g.line(120, y + 42, 120, y + 58, C.mute, { arrow: 1 }); y += 60; });
    g.text(240, 3 * 60 + 8 + 50, 'dg.psu.bus', { c: 'v', w: 96 });
    const yi = 5 * 60 + 8 + 50; g.line(0, yi, 340, yi, C.red, { dash: '6 5', sw: 1.8 }); g.text(240, yi - 12, 'dg.psu.iso', { c: 'r' });
    g.text(240, 60 + 28, 'dg.psu.pri', { c: 'v', w: 96 }); g.text(240, 7 * 60 + 28, 'dg.psu.sec', { c: 'c', w: 96 });
  } };
};

// ch4: four-phase buck with the phase currents (waveform from the model)
function inductor(g, x, y, len, col) { const n = 4, r = len / n / 2; let d = `M${x},${y}`; for (let i = 0; i < n; i++) d += ` a${r},${r} 0 0 1 ${2 * r},0`; S('path', { d, fill: 'none', stroke: col, 'stroke-width': 1.8 }, g.svg); }
function waves(g, x, y, w, h, wv) {
  const n = wv.phases.length, I = wv.sum.reduce((a, b) => a + b, 0) / wv.sum.length, half = wv.dI * 0.75;
  const tMax = wv.ts[wv.ts.length - 1], X = tt => x + w * tt / tMax;
  const top = y + 18, mid = top + h * 0.22, bot = y + h - 24;
  const cols = [C.cyan, C.violet, C.green, C.red];
  wv.phases.forEach((ph, k) => poly(g, ph.map((v, i) => [X(wv.ts[i]), mid - (v - I / n) / half * h * 0.18]), cols[k % 4], 1.4));
  poly(g, wv.sum.map((v, i) => [X(wv.ts[i]), bot - (v - I) / half * h * 0.18]), C.gold, 2.6);
  g.text(x, y, 'dg.vrm.each', { c: 'm' }); g.text(x, bot - h * 0.24, 'dg.vrm.sum', { c: 'g' });
  g.text(x + w, y, 'dg.vrm.shift', { a: 'end', c: 'm' });
}
DG.vrm = (L) => {
  const wv = M.vrmWave(4, 1.2, 220, 500, 200, { steps: 240, periods: 2 });
  const circuit = (g, x0, y0) => {
    g.line(x0 + 14, y0 + 20, x0 + 14, y0 + 250, C.cyan, { sw: 2.2 }); g.text(x0 + 4, y0 + 10, 'dg.vrm.vin', { c: 'c' });
    lbox(g, x0 + 34, y0 + 262, 120, 34, C.violet, 'dg.vrm.ctl', { c: 'v' });
    for (let k = 0; k < 4; k++) {
      const y = y0 + 40 + k * 56; g.line(x0 + 14, y, x0 + 40, y, C.cyan); g.box(x0 + 40, y - 16, 74, 32, C.gold);
      g.text(x0 + 77, y, { raw: t('dg.vrm.ph') + ' ' + (k + 1) }, { a: 'middle', c: 'g' });
      g.line(x0 + 114, y, x0 + 132, y, C.gold); inductor(g, x0 + 132, y, 56, C.gold); g.line(x0 + 188, y, x0 + 214, y, C.gold);
      g.line(x0 + 28, y + 10, x0 + 40, y + 10, C.violet, { dash: '3 3', sw: 1.2 });
    }
    g.line(x0 + 28, y0 + 50, x0 + 28, y0 + 279, C.violet, { dash: '3 3', sw: 1.2 }); g.line(x0 + 28, y0 + 279, x0 + 34, y0 + 279, C.violet, { dash: '3 3', sw: 1.2 });
    g.line(x0 + 214, y0 + 40, x0 + 214, y0 + 208, C.gold, { sw: 2.4 }); g.line(x0 + 214, y0 + 124, x0 + 238, y0 + 124, C.gold, { arrow: 1 });
    lbox(g, x0 + 240, y0 + 30, 78, 50, C.gold, 'dg.vrm.cout', { c: 'g' }); g.line(x0 + 214, y0 + 55, x0 + 238, y0 + 55, C.gold);
    lbox(g, x0 + 240, y0 + 104, 78, 40, C.green, 'dg.vrm.cpu', { c: 'n' });
  };
  if (L === 'w') return { W: 720, H: 310, draw(g) { circuit(g, 0, 0); waves(g, 360, 10, 350, 290, wv); } };
  return { W: 340, H: 560, draw(g) { circuit(g, 0, 0); waves(g, 10, 320, 320, 230, wv); } };
};

// ch5: the PDN ladder
function rlbox(g, x, y, w, h) { S('rect', { x, y, width: w, height: h, rx: 4, fill: C.bg }, g.svg); g.box(x, y, w, h, C.mute, { rx: 4 }); }
DG.pdn = (L) => {
  const caps = [['dg.pdn.bulk', 'dg.pdn.f2'], ['dg.pdn.mlcc', 'dg.pdn.f3'], ['dg.pdn.pkg', 'dg.pdn.f4'], ['dg.pdn.die', 'dg.pdn.f5']];
  if (L === 'w') return { W: 720, H: 250, draw(g) {
    lbox(g, 6, 20, 84, 50, C.gold, 'dg.pdn.vrm', { c: 'g' }); g.text(48, 92, 'dg.pdn.f1', { a: 'middle', c: 'm', w: 90 });
    g.line(90, 45, 640, 45, C.gold, { sw: 2.2 }); lbox(g, 640, 20, 74, 50, C.green, 'dg.pdn.load', { c: 'n' });
    const xs = [150, 270, 450, 580];
    caps.forEach(([k, f], i) => { const x = xs[i]; g.line(x, 45, x, 110, C.gold); lbox(g, x - 50, 110, 100, 40, C.cyan, k, { c: 'c' }); g.text(x, 176, f, { a: 'middle', c: 'm', w: 108 }); });
    rlbox(g, 330, 33, 70, 24); g.text(365, 45, 'dg.pdn.rl', { a: 'middle', c: 'm' }); g.text(365, 76, 'dg.pdn.sock', { a: 'middle', c: 'm' });
    rlbox(g, 489, 33, 60, 24); g.text(519, 45, 'dg.pdn.rl', { a: 'middle', c: 'm' }); g.text(519, 76, 'dg.pdn.bump', { a: 'middle', c: 'm' });
  } };
  return { W: 340, H: 560, draw(g) {
    lbox(g, 10, 6, 140, 44, C.gold, 'dg.pdn.vrm', { c: 'g' }); g.text(170, 28, 'dg.pdn.f1', { c: 'm', w: 160, va: 'mid' });
    g.line(40, 50, 40, 500, C.gold, { sw: 2.2 }); lbox(g, 10, 502, 140, 44, C.green, 'dg.pdn.load', { c: 'n' });
    const ys = [70, 150, 300, 410];
    caps.forEach(([k, f], i) => { const y = ys[i]; g.line(40, y + 20, 70, y + 20, C.gold); lbox(g, 70, y, 120, 40, C.cyan, k, { c: 'c' }); g.text(200, y + 20, f, { c: 'm', w: 134, va: 'mid' }); });
    rlbox(g, 10, 220, 60, 26); g.text(40, 233, 'dg.pdn.rl', { a: 'middle', c: 'm' }); g.text(80, 233, 'dg.pdn.sock', { c: 'm' });
    rlbox(g, 10, 360, 60, 26); g.text(40, 373, 'dg.pdn.rl', { a: 'middle', c: 'm' }); g.text(80, 373, 'dg.pdn.bump', { c: 'm' });
  } };
};

// ch6: cross-section from board to transistors
DG.die = (L) => {
  const Wd = L === 'w' ? 720 : 340, n = L === 'w' ? 18 : 8;
  return { W: Wd, H: L === 'w' ? 330 : 400, draw(g) {
    const w = Wd - 20, H = L === 'w' ? 330 : 400, lab = L === 'w' ? 260 : w - 16;
    // die (top)
    g.box(10, 10, w, L === 'w' ? 90 : 130, C.green, { a: 0.08 }); g.text(20, 26, 'dg.die.die', { c: 'n', weight: 600 });
    const cw = L === 'w' ? 110 : 70, cy = L === 'w' ? 52 : 50;
    for (let i = 0; i < 3; i++) { const x = (L === 'w' ? 290 : 20) + i * (cw + 14); g.box(x, cy, cw, 36, i === 2 ? C.mute : C.green, { dash: i === 2 ? '5 4' : null }); g.text(x + cw / 2, cy + 18, i === 2 ? 'dg.die.off' : 'dg.die.core', { a: 'middle', c: i === 2 ? 'm' : 'n', w: cw - 6, va: 'mid' }); g.box(x + cw / 2 - 18, cy + 40, 36, 8, C.gold, { solid: true, rx: 2 }); }
    if (L === 'w') { g.text(20, 54, 'dg.die.fivr', { c: 'g' }); g.text(20, 80, 'dg.die.gate', { c: 'g' }); }
    else { g.text(20, 104, 'dg.die.gate', { c: 'g' }); g.text(20, 124, 'dg.die.fivr', { c: 'g' }); }
    const yb = L === 'w' ? 112 : 150;
    for (let i = 0; i < n; i++) g.circle(30 + i * (w - 40) / (n - 1), yb, 6, C.gold);
    g.text(L === 'w' ? 20 : 20, yb + 22, 'dg.die.bump', { c: 'g' });
    const ys = yb + 40; g.box(10, ys, w, 50, C.cyan, { a: 0.08 }); g.text(20, ys + 25, 'dg.die.sub', { c: 'c', w: lab, va: 'mid' });
    const yp = ys + 64; for (let i = 0; i < n; i++) g.box(26 + i * (w - 40) / (n - 1), yp, 8, 24, C.mute, { rx: 2 });
    g.text(20, yp + 42, 'dg.die.sock', { c: 'm', w: lab });
    const yo = H - 50; g.box(10, yo, w, 40, C.violet, { a: 0.10 }); g.text(20, yo + 20, 'dg.die.board', { c: 'v', w: lab, va: 'mid' });
    const xa = Wd - 40; g.line(xa, yo - 2, xa, yb + 10, C.red, { arrow: 1, sw: 2.2 }); g.text(xa - 10, yp + 42, 'dg.die.up', { a: 'end', c: 'r' });
  } };
};

// ch8: the C-state ladder (Skylake numbers from intel_idle)
DG.cst = (L) => {
  const rows = [['dg.cst.c0', null], ['dg.cst.c1', 'dg.cst.n1'], ['dg.cst.c1e', 'dg.cst.n1e'], ['dg.cst.c3', 'dg.cst.n3'], ['dg.cst.c6', 'dg.cst.n6'], ['dg.cst.c8', 'dg.cst.n8'], ['dg.cst.c10', 'dg.cst.n10']];
  const Wd = L === 'w' ? 720 : 340, step = L === 'w' ? 30 : 8, bw = L === 'w' ? 380 : 170, nx = Wd - 10, rh = L === 'w' ? 34 : 44;
  return { W: Wd, H: 40 + rows.length * (rh + 6) + 34, draw(g) {
    g.text(nx, 14, 'dg.cst.col1', { a: 'end', c: 'm' });
    rows.forEach(([k, nk], i) => { const y = 30 + i * (rh + 6), x = 10 + i * step; const col = i === 0 ? C.green : C.cyan;
      g.box(x, y, bw, rh, col, { a: 0.06 + i * 0.03 }); g.text(x + 10, y + rh / 2, k, { c: i === 0 ? 'n' : 'c', w: bw - 16, va: 'mid' });
      if (nk) g.text(nx, y + rh / 2, nk, { a: 'end', c: 'g', mono: true }); });
    g.text(10, 30 + rows.length * (rh + 6) + 16, 'dg.cst.deeper', { c: 'm', w: Wd - 20 });
  } };
};

// ch9: the thermal chain at 253 W
DG.therm = (L) => {
  const items = [['dg.therm.die', C.green], ['dg.therm.ihs', C.gold], ['dg.therm.hs', C.cyan], ['dg.therm.air', C.mute]];
  const rs = ['dg.therm.r1', 'dg.therm.r2', 'dg.therm.r3'], mids = ['dg.therm.tim', 'dg.therm.paste', null];
  if (L === 'w') return { W: 720, H: 200, draw(g) {
    g.text(20, 20, 'dg.therm.q', { c: 'r' }); g.line(70, 20, 96, 56, C.red, { arrow: 1 });
    items.forEach(([k, col], i) => { const x = 100 + i * 155; lbox(g, x, 60, 120, 54, col, k, { c: cls(col) }); if (i < 3) { g.line(x + 122, 87, x + 153, 87, C.red, { arrow: 1 }); g.text(x + 137, 136 + (i % 2) * 26, rs[i], { a: 'middle', c: 'r', mono: true }); if (mids[i]) g.text(x + 137, 42, mids[i], { a: 'middle', c: 'm' }); } });
  } };
  return { W: 340, H: 400, draw(g) {
    g.text(10, 14, 'dg.therm.q', { c: 'r' });
    items.forEach(([k, col], i) => { const y = 30 + i * 96; lbox(g, 10, y, 150, 50, col, k, { c: cls(col) }); if (i < 3) { g.line(85, y + 52, 85, y + 94, C.red, { arrow: 1 }); g.text(100, y + 66, rs[i], { c: 'r', mono: true }); if (mids[i]) g.text(100, y + 86, mids[i], { c: 'm' }); } });
  } };
};

// ch9: PL1 / PL2 / Tau over time (closed form)
DG.pl = (L) => {
  const Wd = L === 'w' ? 720 : 340, H = 260;
  return { W: Wd, H, draw(g) {
    const pl1 = 125, pl2 = 253, idle = M.TH.idle, tau = 56, t0 = 10, tb = t0 + M.boostTime(pl1, pl2, tau, idle), tEnd = 120;
    const Lx = 20, R = Wd - 14, T = 30, B = H - 44, X = s => Lx + (R - Lx) * s / tEnd, Y = p => B - (B - T) * p / 280;
    g.line(Lx, B, R, B, C.line);
    g.line(Lx, Y(pl2), R, Y(pl2), C.gold, { dash: '5 5', sw: 1 }); g.line(Lx, Y(pl1), R, Y(pl1), C.gold, { dash: '5 5', sw: 1 });
    poly(g, [[X(0), Y(idle)], [X(t0), Y(idle)], [X(t0), Y(pl2)], [X(tb), Y(pl2)], [X(tb), Y(pl1)], [X(tEnd), Y(pl1)]], C.gold, 2.6);
    const ew = []; let e = idle; for (let s = 0; s <= tEnd; s += 0.5) { const p = s < t0 ? idle : s < tb ? pl2 : pl1; e += (p - e) * 0.5 / tau; ew.push([X(s), Y(Math.min(e, pl1 + 0.5))]); }
    poly(g, ew, C.cyan, 1.8, '4 4');
    g.text(X(tb) + 8, Y(pl2) - 14, 'dg.pl.pl2', { c: 'g' }); g.text(R, Y(pl1) - 14, 'dg.pl.pl1', { a: 'end', c: 'g' });
    g.text(X(tb) + 8, Y(70), 'dg.pl.avg', { c: 'c' });
    g.line(X(tb), B, X(tb), Y(pl1), C.mute, { dash: '2 4', sw: 1 }); g.text(X(tb), B + 16, 'dg.pl.t', { a: 'middle', c: 'm' });
    g.text(X(t0) + 8, Y(170), 'dg.pl.start', { c: 'm' });
    g.text(R, B + 34, 'dg.pl.x', { a: 'end', c: 'm' });
  } };
};

// ch11: frontside vs backside power delivery
DG.bspd = (L) => {
  const panel = (g, x, y, w, back) => {
    g.text(x, y, back ? 'dg.bspd.back' : 'dg.bspd.front', { c: back ? 'g' : 'm', weight: 600, w });
    const yy = y + 22;
    if (!back) {
      for (let i = 0; i < 7; i++) g.circle(x + 18 + i * (w - 36) / 6, yy + 10, 7, C.gold);
      g.text(x, yy + 32, 'dg.bspd.bumps', { c: 'g', w });
      g.box(x, yy + 46, w, 96, C.violet, { a: 0.10 }); g.text(x + 10, yy + 94, 'dg.bspd.mix', { c: 'v', w: w - 20, va: 'mid' });
      g.box(x, yy + 146, w, 26, C.green, { a: 0.2 }); g.text(x + 10, yy + 159, 'dg.bspd.tr', { c: 'n' });
      g.line(x + w - 16, yy + 18, x + w - 16, yy + 144, C.red, { arrow: 1, sw: 2 });
      g.text(x, yy + 196, 'dg.bspd.drop', { c: 'r', w });
    } else {
      g.box(x, yy, w, 26, C.mute, { a: 0.1 }); g.text(x + 10, yy + 13, 'dg.bspd.carrier', { c: 'm' });
      g.box(x, yy + 30, w, 56, C.violet, { a: 0.10 }); g.text(x + 10, yy + 58, 'dg.bspd.sig', { c: 'v', w: w - 20, va: 'mid' });
      g.box(x, yy + 90, w, 26, C.green, { a: 0.2 }); g.text(x + 10, yy + 103, 'dg.bspd.tr', { c: 'n' });
      g.box(x, yy + 120, w, 40, C.gold, { a: 0.14 }); g.text(x + 10, yy + 140, 'dg.bspd.pwr', { c: 'g', w: w - 20, va: 'mid' });
      for (let i = 0; i < 7; i++) g.circle(x + 18 + i * (w - 36) / 6, yy + 172, 7, C.gold);
      g.text(x, yy + 194, 'dg.bspd.pbumps', { c: 'g', w });
      g.line(x + w - 16, yy + 166, x + w - 16, yy + 118, C.red, { arrow: 1, sw: 2 });
      g.text(x, yy + 218, 'dg.bspd.short', { c: 'g', w });
    }
  };
  if (L === 'w') return { W: 720, H: 290, draw(g) { panel(g, 10, 16, 330, false); panel(g, 380, 16, 330, true); } };
  return { W: 340, H: 560, draw(g) { panel(g, 10, 14, 320, false); panel(g, 10, 290, 320, true); } };
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
    arrowDefs(svg); const g = mk(svg); g.svg = svg; spec.draw(g); wrapTexts(svg);
  }
}

/* ───────── 01 the chain ───────── */
(() => {
  const cv = $('#chCv'), sR = $('#chR');
  const P = () => +radioVal('chP'), tier = () => radioVal('chT'), rated = () => M.CHAIN.rated[+sR.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.chain(P(), tier(), rated());
    const rows = [[t('ch1.st.psu'), r.psuLoss, C.violet], [t('ch1.st.cable'), r.cable, C.cyan], [t('ch1.st.vrm'), r.vrmLoss, C.gold], [t('ch1.st.pkg'), r.pkg, C.red]];
    const mx = Math.max(...rows.map(x => x[1])) * 1.15;
    bars(c, w, h, rows.map(([l, v, col]) => [l, v, col, W(v, 1)]), v => v / mx, -1);
  } });
  function text() {
    const r = M.chain(P(), tier(), rated());
    put('#chRo', W(rated()));
    put('#chWall', W(r.wall)); put('#chIw', A(r.iWall, 2)); put('#chI12', A(r.i12, 1)); put('#chVc', V(r.V)); put('#chIc', A(r.I)); put('#chShare', pct(r.cpuShare)); put('#chHeat', W(r.heatPath));
    const top = [['ch1.st.psu', r.psuLoss], ['ch1.st.cable', r.cable], ['ch1.st.vrm', r.vrmLoss], ['ch1.st.pkg', r.pkg]].sort((a, b) => b[1] - a[1])[0][0];
    putHTML('#chSay', t(M.say.chain(r).key, { p: W(r.P), ic: A(r.I), vc: V(r.V), wall: W(r.wall), share: pct(r.cpuShare), heat: W(r.heatPath), top: t(top), x: pct(r.x), eta: pct(r.eta, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sR.addEventListener('input', go); onAll([...radios('chP'), ...radios('chT')], 'change', go);
  text();
})();

/* ───────── 02 power vs frequency ───────── */
(() => {
  const cv = $('#pwCv'), sF = $('#pwF'), sN = $('#pwN'), sT = $('#pwT');
  const f = () => Math.round((0.8 + 0.1 * +sF.value) * 10) / 10, n = () => +sN.value + 1, T = () => 40 + 10 * +sT.value;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), ymax = Math.ceil(M.power(6.0, 100, 8).P / 50) * 50;
    const fr = frame(w, h, [28, 16, 40, 48], 0.8, 6.0, 0, ymax);
    const step = ymax > 400 ? 100 : 50, vals = []; for (let v = 0; v <= ymax; v += step) vals.push(v);
    yTicks(c, fr, vals, v => fmt(v, 0));
    c.fillStyle = C.mute; spacedTicks(c, [1, 2, 3, 4, 5, 6].map(x => [fr.X(x), fmt(x, 0)]), fr.B + 12, w);
    axes(c, fr, t('ch2.cv.x'), t('ch2.cv.y'));
    const pts = []; for (let x = 0.8; x <= 6.0001; x += 0.05) pts.push(M.power(x, T(), n()));
    c.fillStyle = 'rgba(240,122,109,.55)'; c.beginPath(); c.moveTo(fr.X(0.8), fr.B); pts.forEach(p => c.lineTo(fr.X(p.f), fr.Y(p.leak))); c.lineTo(fr.X(6.0), fr.B); c.fill();
    c.fillStyle = 'rgba(233,185,73,.45)'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](fr.X(p.f), fr.Y(p.P))); for (let i = pts.length - 1; i >= 0; i--) c.lineTo(fr.X(pts[i].f), fr.Y(pts[i].leak)); c.fill();
    path(c, pts.map(p => [p.f, p.P]), fr.X, fr.Y, C.gold, 2.4);
    c.strokeStyle = C.cyan; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(fr.X(M.fKnee), fr.T); c.lineTo(fr.X(M.fKnee), fr.B); c.stroke(); c.setLineDash([]);
    const p = M.power(f(), T(), n()); dot(c, fr.X(p.f), fr.Y(p.P), C.gold, 6);
  } });
  function text() {
    const p = M.power(f(), T(), n());
    put('#pwFo', GHz(f())); put('#pwNo', t('u.cores', { v: fmt(n(), 0) })); put('#pwTo', degC(T()));
    put('#pwV', V(p.V)); put('#pwP', W(p.P)); put('#pwL', W(p.leak)); put('#pwI', A(p.I)); put('#pwPf', W(p.P / p.f));
    putHTML('#pwSay', t(M.say.power(f()).key, { f: GHz(f()), v: V(p.V), p: W(p.P), leak: W(p.leak), pf: W(p.P / p.f), n: t('u.cores', { v: fmt(n(), 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sF, sN, sT].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 03 PSU efficiency ───────── */
const LOADS = [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.05, 1.1];
(() => {
  const cv = $('#psCv'), sX = $('#psX');
  const tier = () => radioVal('psT'), x = () => LOADS[+sX.value];
  const cols = { bronze: '#c98a5a', silver: '#c7ccd6', gold: C.gold, platinum: C.cyan, titanium: C.violet, ruby: C.red };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), fr = frame(w, h, [28, 16, 40, 48], 0, 1.1, 0.6, 1.0);
    yTicks(c, fr, [0.6, 0.7, 0.8, 0.9, 1.0], v => fmt(v * 100, 0) + '%');
    c.fillStyle = C.mute; spacedTicks(c, [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => [fr.X(v), fmt(v * 100, 0) + '%']), fr.B + 12, w);
    axes(c, fr, t('ch3.cv.x'), t('ch3.cv.y'));
    for (const k of M.TIERS) { const pts = []; for (let v = 0.02; v <= 1.1001; v += 0.01) pts.push([v, Math.max(0.6, M.psuEff(k, v))]); path(c, pts, fr.X, fr.Y, cols[k], k === tier() ? 2.8 : 1.2, k === tier() ? null : [4, 4]); }
    const pt = M.SRC.plus80[tier()]; for (const q of [5, 10, 20, 50, 100]) if (pt[q]) { c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.arc(fr.X(q / 100), fr.Y(pt[q] / 100), 5, 0, 6.283); c.stroke(); }
    dot(c, fr.X(x()), fr.Y(Math.max(0.6, M.psuEff(tier(), x()))), cols[tier()], 6);
  } });
  function text() {
    const e = M.psuEff(tier(), x()), out = 850 * x(), wall = out / e;
    put('#psXo', pct(x())); put('#psEff', pct(e, 1)); put('#psOut', W(out)); put('#psLoss', W(wall - out, 1)); put('#psWall', W(wall));
    putHTML('#psSay', t(M.say.psu(x()).key, { x: pct(x()), eff: pct(e, 1), out: W(out), loss: W(wall - out, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sX.addEventListener('input', go); onAll(radios('psT'), 'change', go);
  text();
})();

/* ───────── 04 multiphase buck ───────── */
const IS = [10, 30, 60, 100, 150, 200, 300];
(() => {
  const cv = $('#vrCv'), sF = $('#vrF'), sL = $('#vrL'), sI = $('#vrI');
  const n = () => +radioVal('vrN'), fs = () => M.VRM.fs[+sF.value], L = () => M.VRM.ls[+sL.value], I = () => IS[+sI.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), wv = M.vrmWave(n(), 1.2, L(), fs(), I(), { steps: 480, periods: 2 }), N = n();
    const span = Math.max(wv.dI * 1.4, 2), mid = h * 0.5;
    const f1 = frame(w, mid, [26, 52, 18, 46], 0, wv.ts[wv.ts.length - 1], I() / N - span / 2, I() / N + span / 2);
    const f2 = frame(w, h, [mid + 26, 52, 40, 46], 0, wv.ts[wv.ts.length - 1], I() - span / 2, I() + span / 2);
    const tk = (fr, lo, hi, right) => { c.fillStyle = C.mute; c.textAlign = right ? 'left' : 'right'; [lo, (lo + hi) / 2, hi].forEach(v => { c.fillText(fmt(v, span < 6 ? 1 : 0), right ? fr.R + 6 : fr.L - 6, fr.Y(v)); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(fr.L, fr.Y(v)); c.lineTo(fr.R, fr.Y(v)); c.stroke(); }); };
    tk(f1, I() / N - span / 2, I() / N + span / 2, false); tk(f2, I() - span / 2, I() + span / 2, true);
    const cols = [C.cyan, C.violet, C.green, C.red];
    wv.phases.forEach((ph, k) => path(c, ph.map((v, i) => [wv.ts[i], v]), f1.X, f1.Y, cols[k % 4], 1.3));
    path(c, wv.sum.map((v, i) => [wv.ts[i], v]), f2.X, f2.Y, C.gold, 2.6);
    c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch4.cv.y'), f1.L + 4, f1.T - 13);
    c.textAlign = 'right'; c.fillText(t('ch4.cv.y2'), f2.R, f2.T - 13);
    spacedTicks(c, [0, 0.5, 1, 1.5, 2].map(k => [f2.X(k * wv.ts[wv.ts.length - 1] / 2), fmt(k * wv.ts[wv.ts.length - 1] / 2, 1)]), f2.B + 12, w);
    c.textAlign = 'right'; c.fillText(t('ch4.cv.x'), f2.R, f2.B + 28);
  } });
  function text() {
    const r = M.vrm(n(), fs(), L(), I());
    put('#vrFo', kHz(fs())); put('#vrLo', nH(L())); put('#vrIo', A(I()));
    put('#vrPh', A(r.perPhase, 1)); put('#vrDI', A(r.dI, 1)); put('#vrSum', A(r.sumRipple, 2)); put('#vrK', pct(r.k)); put('#vrEff', pct(r.eff, 1)); put('#vrLoss', W(r.loss, 1));
    putHTML('#vrSay', t(M.say.vrm(r).key, { n: t('u.ph', { v: fmt(n(), 0) }), nn: fmt(n(), 0), dI: A(r.dI, 1), sum: A(r.sumRipple, 2), k: pct(r.k), ph: A(r.perPhase, 1), eff: pct(r.eff, 1), i: A(I()), loss: W(r.loss, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sF, sL, sI].forEach(s => s.addEventListener('input', go)); onAll(radios('vrN'), 'change', go);
  text();
})();

/* ───────── 05 droop and the PDN ───────── */
const LLS = [0, 0.5e-3, 1.0e-3, 1.5e-3], DIS = [50, 100, 150, 200];
(() => {
  const cv = $('#pdCv'), zc = $('#pzCv'), cM = $('#pdM'), cP = $('#pdP'), cD = $('#pdD');
  const opts = () => ({ ll: LLS[+radioVal('pdL')], dI: DIS[+radioVal('pdI')], mlcc: cM.checked, pkgc: cP.checked, dieScale: cD.checked ? 0.25 : 1 });
  const memo = new Map();
  const run = () => { const o = opts(), k = JSON.stringify(o); if (!memo.has(k)) memo.set(k, { s: M.pdnStep(o), z: M.pdnSweep(o) }); return memo.get(k); };
  const sim = reg([cv, zc], { draw() {
    const o = opts(), { s, z } = run();
    { const { c, w, h } = fit(cv);
      const lo = Math.min(s.vmin, s.vFinal) - 0.02, hi = s.v0 + 0.02, lx0 = -3, lx1 = Math.log10(58);
      const fr = frame(w, h, [28, 16, 40, 56], lx0, lx1, lo, hi);
      const st = hi - lo > 0.8 ? 0.25 : hi - lo > 0.4 ? 0.1 : 0.05, vals = []; for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) vals.push(v);
      yTicks(c, fr, vals, v => fmt(v, 2));
      c.fillStyle = C.mute; spacedTicks(c, [[-3, t('u.ns', { v: '1' })], [-2, t('u.ns', { v: '10' })], [-1, t('u.ns', { v: '100' })], [0, t('u.us', { v: '1' })], [1, t('u.us', { v: '10' })]].map(([e, sx]) => [fr.X(e), sx]), fr.B + 12, w);
      axes(c, fr, t('ch5.cv.x'), t('ch5.cv.y'));
      c.strokeStyle = C.cyan; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(fr.L, fr.Y(s.vFinal)); c.lineTo(fr.R, fr.Y(s.vFinal)); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.cyan; c.textAlign = 'right'; { const yf = fr.Y(s.vFinal), below = s.vmin >= s.vFinal - 0.03 && yf + 12 <= fr.B - 4; c.fillText(t('ch5.cv.final'), fr.R - 4, yf + (below ? 12 : -10)); } // below the line only if it clears the time axis
      path(c, s.log.map(([tt, v]) => [Math.log10(tt), v]), fr.X, fr.Y, C.gold, 2.2);
      dot(c, fr.X(Math.log10(Math.max(1e-3, s.tmin - 2))), fr.Y(s.vmin), C.red, 5); }
    { const { c, w, h } = fit(zc), goal = M.zGoal(o.ll, o.dI);
      const ly0 = Math.log10(0.1e-3), ly1 = Math.log10(Math.max(z.peak * 1.6, goal * 3, 3e-3));
      const fr = frame(w, h, [26, 16, 40, 56], 3, 9, ly0, ly1);
      const dec = []; for (let e = -4; e <= 0; e++) if (e >= ly0 - 1e-9 && e <= ly1) dec.push(e);
      yTicks(c, fr, dec, e => fmt(Math.pow(10, e) * 1000, e <= -4 ? 1 : 0));
      c.fillStyle = C.mute; spacedTicks(c, [[3, '1k'], [4, '10k'], [5, '100k'], [6, '1M'], [7, '10M'], [8, '100M'], [9, '1G']].map(([e, sx]) => [fr.X(e), sx]), fr.B + 12, w);
      axes(c, fr, t('ch5.cv.zx'), t('ch5.cv.zy'));
      c.strokeStyle = C.cyan; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(fr.L, fr.Y(Math.log10(goal))); c.lineTo(fr.R, fr.Y(Math.log10(goal))); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.cyan; c.textAlign = 'left'; c.fillText(t('ch5.cv.goal'), fr.L + 6, fr.Y(Math.log10(goal)) + 12);
      path(c, z.pts.map(([e, v]) => [e, Math.log10(v)]), fr.X, fr.Y, C.gold, 2.2);
      dot(c, fr.X(Math.log10(z.fPeak)), fr.Y(Math.log10(z.peak)), C.red, 5); }
  } });
  function text() {
    const o = opts(), { s, z } = run();
    put('#pdV0', V(s.v0, 3)); put('#pdMin', V(s.vmin, 3)); put('#pdDroop', mV(s.droop * 1000)); put('#pdSt', mV(s.static * 1000)); put('#pdOver', mV(Math.max(0, s.over) * 1000)); put('#pdZ', mohm(z.peak * 1000));
    const fpk = z.fPeak >= 1e6 ? MHz(z.fPeak / 1e6) : kHz(z.fPeak / 1e3);
    putHTML('#pdSay', t(M.say.pdn(s, o).key, { di: A(o.dI), droop: mV(s.droop * 1000), st: mV(s.static * 1000), over: mV(Math.max(0, s.over) * 1000), min: V(s.vmin, 3), zpk: mohm(z.peak * 1000), fpk }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll([...radios('pdL'), ...radios('pdI'), cM, cP, cD], 'change', go);
  text();
})();

/* ───────── 07 race to idle ───────── */
(() => {
  const cv = $('#rcCv'), sW = $('#rcW'), sP = $('#rcP');
  const kind = () => radioVal('rcI'), work = () => M.RACE.works[+sW.value], plat = () => M.RACE.plats[+sP.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = M.raceSweep(work(), kind(), plat());
    const ymax = Math.max(...s.pts.map(p => p.E)) * 1.1;
    const fr = frame(w, h, [28, 16, 40, 48], 0.4, 6.0, 0, ymax);
    const st = ymax > 20 ? 5 : ymax > 8 ? 2 : 1, vals = []; for (let v = 0; v <= ymax; v += st) vals.push(v);
    yTicks(c, fr, vals, v => fmt(v, 0));
    c.fillStyle = C.mute; spacedTicks(c, [1, 2, 3, 4, 5, 6].map(x => [fr.X(x), fmt(x, 0)]), fr.B + 12, w);
    axes(c, fr, t('ch7.cv.x'), t('ch7.cv.y'));
    const bw = Math.max(2, (fr.X(0.5) - fr.X(0.4)) * 0.8);
    s.pts.forEach(p => { const x = fr.X(p.f); c.fillStyle = 'rgba(233,185,73,.75)'; c.fillRect(x - bw / 2, fr.Y(p.run), bw, fr.B - fr.Y(p.run)); c.fillStyle = 'rgba(99,199,230,.75)'; c.fillRect(x - bw / 2, fr.Y(p.E), bw, fr.Y(p.run) - fr.Y(p.E)); });
    c.strokeStyle = C.green; c.lineWidth = 2; c.strokeRect(fr.X(s.best.f) - bw / 2 - 2, fr.Y(s.best.E) - 2, bw + 4, fr.B - fr.Y(s.best.E) + 2);
  } });
  function text() {
    const s = M.raceSweep(work(), kind(), plat()), knee = M.raceEnergy(Math.max(s.slow.f, Math.round(M.fKnee * 10) / 10), work(), kind(), plat());
    put('#rcWo', t('u.gcyc', { v: fmt(work(), 1) })); put('#rcPo', W(plat()));
    put('#rcBest', GHz(s.best.f)); put('#rcEb', J(s.best.E)); put('#rcEs', J(s.slow.E)); put('#rcEf', J(s.fast.E));
    putHTML('#rcSay', t(M.say.race(s, kind()).key, { best: GHz(s.best.f), ef: J(s.fast.E), es: J(s.slow.E), eknee: J(knee.E), more: pct(s.fast.E / s.best.E - 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sW, sP].forEach(s => s.addEventListener('input', go)); onAll(radios('rcI'), 'change', go);
  text();
})();

/* ───────── 08 C-states ───────── */
(() => {
  const cv = $('#csCv'), sM = $('#csM');
  const mean = () => M.CST.means[+sM.value], pol = () => radioVal('csP'), lat = () => +radioVal('csL');
  const memo = new Map(), run = () => { const k = mean() + pol() + lat(); if (!memo.has(k)) memo.set(k, M.cstate(mean(), pol(), lat())); return memo.get(k); };
  const tm = x => x >= 1000 ? t('u.ms', { v: fmt(x / 1000, x >= 10000 ? 0 : 1) }) : usec(x);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = run();
    const rows = M.SRC.skl.filter(s => r.hist[s[0]] != null).map(s => [s[0], r.hist[s[0]], s[0] === 'C1' || s[0] === 'C1E' ? C.gold : C.cyan, fmt(r.hist[s[0]], 0)]);
    bars(c, w, h, rows, v => v / r.n, -1);
  } });
  function text() {
    const r = run();
    put('#csMo', tm(mean()));
    put('#csPw', W(r.pAvg, 2)); put('#csSave', pct(r.saved)); put('#csLat', usec(r.lat)); put('#csMiss', pct(r.miss));
    putHTML('#csSay', t(M.say.cstate(r).key, { pw: W(r.pAvg, 2), save: pct(Math.abs(r.saved)), saveword: t(r.saved < 0 ? 'ch8.saveword.more' : 'ch8.saveword.less'), lat: usec(r.lat), miss: pct(r.miss), mean: tm(mean()) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sM.addEventListener('input', go); onAll([...radios('csP'), ...radios('csL')], 'change', go);
  text();
})();

/* ───────── 09 heat, PL1 / PL2 / Tau (animated on dt; reduced motion shows the whole run) ───────── */
(() => {
  const cv = $('#thCv'), sR = $('#thR'), go2 = $('#thGo');
  const opts = () => { const [pl1, pl2, tau] = M.TH.presets[radioVal('thS')]; return { pl1, pl2, tau, ra: M.TH.ras[+sR.value] }; };
  let memo = null, shown = reduce ? Infinity : 0, last = null;
  const run = () => { const o = opts(), k = JSON.stringify(o); if (!memo || memo.k !== k) memo = { k, r: M.thermal(o) }; return memo.r; };
  const SPEED = 12; // simulated seconds per real second
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = run(), tEnd = M.TH.tEnd, upto = Math.min(shown, tEnd);
    const top = frame(w, h * 0.56, [28, 50, 26, 48], 0, tEnd, 0, 300);
    const bot = frame(w, h, [h * 0.56 + 24, 50, 40, 48], 0, tEnd, 20, 110);
    yTicks(c, top, [0, 100, 200, 300], v => fmt(v, 0));
    c.fillStyle = C.cyan; c.textAlign = 'left'; [0, 2, 4, 6].forEach(v => c.fillText(fmt(v, 0), top.R + 6, top.Y(v * 50)));
    c.fillStyle = C.gold; c.textAlign = 'left'; c.fillText(t('ch9.cv.p'), top.L + 4, top.T - 13);
    c.fillStyle = C.cyan; c.textAlign = 'right'; c.fillText(t('ch9.cv.f'), top.R, top.T - 13);
    yTicks(c, bot, [20, 60, 100], v => fmt(v, 0));
    c.fillStyle = C.red; c.textAlign = 'left'; c.fillText(t('ch9.cv.tj'), bot.L + 4, bot.T - 13);
    c.strokeStyle = C.red; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(bot.L, bot.Y(M.TH.tj)); c.lineTo(bot.R, bot.Y(M.TH.tj)); c.stroke(); c.setLineDash([]);
    c.fillStyle = C.red; c.textAlign = 'right'; c.fillText(t('ch9.cv.tjmax'), bot.R - 4, bot.Y(M.TH.tj) + 12);
    c.fillStyle = C.mute; spacedTicks(c, [0, 50, 100, 150, 200].map(v => [bot.X(v), fmt(v, 0)]), bot.B + 12, w);
    axes(c, bot, t('ch9.cv.x'), '');
    const k = r.t.findIndex(x => x > upto), n = k < 0 ? r.t.length : k;
    const sl = a => a.slice(0, n).map((v, i) => [r.t[i], v]);
    path(c, sl(r.P), top.X, top.Y, C.gold, 2.2); path(c, sl(r.f.map(v => v * 50)), top.X, top.Y, C.cyan, 2.0); path(c, sl(r.tj), bot.X, bot.Y, C.red, 2.2);
  }, step(dt) { if (shown < M.TH.tEnd) { shown += dt * SPEED; this.dirty = true; } } });
  function text() {
    const o = opts(), r = run();
    put('#thRo', KW(o.ra));
    put('#thPk', GHz(r.fPeak)); put('#thPl2', r.pl2End == null ? t('u.none') : sec(r.pl2End)); put('#thFend', GHz(r.fEnd)); put('#thPend', W(r.pEnd)); put('#thTj', degC(r.tjMax)); put('#thHot', r.firstHot == null ? t('u.none') : sec(r.firstHot));
    putHTML('#thSay', t(M.say.thermal(r, o).key, { pl2: r.pl2End == null ? '' : sec(r.pl2End), pk: GHz(r.fPeak), fend: GHz(r.fEnd), pend: W(r.pEnd), tj: degC(r.tjMax), tjmax: degC(M.TH.tj), hot: r.firstHot == null ? '' : sec(r.firstHot) }));
  }
  sim.text = text;
  const restart = () => { shown = reduce ? Infinity : 0; sim.dirty = true; text(); };
  sR.addEventListener('input', restart); onAll(radios('thS'), 'change', restart); go2.addEventListener('click', restart);
  text();
})();

/* ───────── loop ───────── */
applyLang();
let tPrev = null;
function tick(now) {
  const dt = tPrev == null ? 0 : Math.min(0.1, (now - tPrev) / 1000); tPrev = now;
  for (const s of sims) { if (!s.vis) continue; if (s.step) s.step(dt); if (s.dirty) { s.draw(); s.dirty = false; } }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
