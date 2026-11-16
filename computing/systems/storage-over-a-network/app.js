/* Storage over a network: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.NetStoreModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = M.DEFAULTS;

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
const auto = v => (Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2);
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? (x === 0 ? 0 : x < 0.01 ? 2 : x < 0.1 || (x > 0.99 && x < 1) ? 1 : 0) : d) });
function dur(sec, d) { if (sec === 0) return t('u.us', { v: fmt(0, 0) }); const u = M.tunit(sec); return t('u.' + u.u, { v: fmt(u.v, d == null ? auto(u.v) : d) }); }
function bytes(b) { const u = M.bunit(b); return t('u.' + u.u, { v: fmt(u.v, u.u === 'B' || Number.isInteger(u.v) ? 0 : auto(u.v)) }); }
const times = x => t('u.x', { v: fmt(x, x >= 10 ? 0 : 1) });
const mbs = x => t('u.MBps', { v: fmt(x, x >= 100 ? 0 : x >= 1 ? 1 : x >= 0.01 ? 2 : 3) });
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
function wire(sim, text, ranges, radioNames, checks) {
  sim.text = text;
  const go = () => { sim.dirty = true; if (sim.reset) sim.reset(); text(); };
  (ranges || []).forEach(r => $(r).addEventListener('input', go));
  (radioNames || []).forEach(n => onAll(radios(n), 'change', go));
  (checks || []).forEach(c => $(c).addEventListener('change', go));
  text();
}

function axes(c, L, R, T, B, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, L + 6, T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, R, B + 28); }
}
function spacedTicks(c, items, y) { let lastR = -Infinity; const cw = c.canvas.clientWidth; c.textAlign = 'center'; c.fillStyle = C.mute; for (const [x0, s] of items) { const w = c.measureText(s).width, x = Math.max(w / 2 + 2, Math.min(cw - w / 2 - 2, x0)); if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, L, R, Y, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  let lastY = Infinity;
  vals.forEach(v => { const y = Y(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L + 1, y); c.lineTo(R, y); c.stroke(); if (Math.abs(lastY - y) >= 14) { c.fillText(fmtv(v), L - 6, y); lastY = y; } });
}
function path(c, pts, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); let on = false; for (const p of pts) { if (p == null) { on = false; continue; } c[on ? 'lineTo' : 'moveTo'](p[0], p[1]); on = true; } c.stroke(); c.setLineDash([]); }
function tag(c, s, x, y, col, align) { c.font = FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); return [x0 - 3, x0 + w + 3]; }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function labelFont(c, labels, cap) { c.font = FONT; let lw = 0; for (const s of labels) lw = Math.max(lw, c.measureText(s).width); const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap) }; }
const log10 = Math.log10;
// sliders that step through a fixed list of values (so the page's defaults are exact)
const LIST = {
  nsR: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5, 10, 20, 30, 50, 100],            // ms
  isR: [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50],                    // ms
  fcD: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 150, 200],                  // km
  fcC: [2, 4, 8, 16, 24, 40, 64, 100, 160, 250, 400, 640, 1000, 1600, 2000], // credits
  lsR: [2, 5, 10, 20, 50, 100, 200, 500],                                   // µs
  ecM: [1, 2, 4, 8, 12, 24, 48, 72, 168, 336]                               // hours
};
const lv = id => LIST[id][+$('#' + id).value];
// integer powers of ten for axis ticks (10⁻⁷ … 10⁻¹); never a fractional exponent
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = e => '10' + String(e).split('').map(ch => SUP[ch]).join('');
// a small probability as a percentage with enough decimals to show two significant digits
const lossPct = q => pct(q, Math.max(0, Math.min(6, 1 - Math.floor(log10(q * 100)))));

/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, labels from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, prose column ≥ 600 px) and 'n' (viewBox 340 wide). Text is 14 units, so it
   renders at ≥ 11.5 px in either layout at its narrowest. A label with a width limit wraps onto more lines.
   Palette, the same as the models: data gold; waiting, round trips, R2T and losses red; commands and control
   messages cyan (ch5 alone uses cyan for switches, as its model does); the network and the fibre violet; the target
   side (server, array, controller) green; the host side grey. Numbers drawn come from M.dgVals(). */
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
// a message between two lifelines with its label above the arrow
function msg(g, xa, xb, y, dir, col, key, vars, o) {
  o = o || {}; const a = dir > 0 ? xa : xb, b = dir > 0 ? xb : xa;
  g.text((xa + xb) / 2, y, key, { a: 'middle', c: cls(col), vars: Object.assign({}, DV, vars || {}), w: o.w || Math.abs(xb - xa) - 20 });
  g.line(a, y + (o.dy || 12), b + (dir > 0 ? -3 : 3), y + (o.dy || 12) + 10, col, { arrow: 1, sw: o.sw || 2 });
}
// ch1: what the client asks for at each level, and which side keeps the file system; schematic
DG.level = (L) => {
  const lv = [['block', C.cyan], ['file', C.green], ['obj', C.gold]], wide = L === 'w';
  if (wide) return { W: 720, H: 372, draw(g) {
    lv.forEach(([c, col], i) => {
      const x = 10 + i * 240, w = 220;
      g.text(x, 14, 'dg.level.' + c, { c: cls(col), weight: 600, w });
      g.box(x, 42, w, 132, C.mute, { a: 0.04, sw: 1 });
      lbox(g, x + 10, 48, w - 20, 28, C.mute, 'dg.level.app');
      if (c === 'block') lbox(g, x + 10, 82, w - 20, 86, C.cyan, 'dg.level.fsC', { a: 0.3 }); else lbox(g, x + 10, 82, w - 20, 86, C.mute, c === 'file' ? 'dg.level.nfsc' : 'dg.level.http');
      g.line(x + 30, 176, x + 30, 232, col, { arrow: 1, sw: 2.4 }); g.text(x + 44, 204, 'dg.level.q' + c, { c: cls(col), w: w - 50, va: 'mid' });
      g.box(x, 236, w, 92, C.green, { a: 0.04, sw: 1 });
      if (c === 'file') { lbox(g, x + 10, 242, w - 20, 46, C.green, 'dg.level.fsS', { a: 0.3 }); lbox(g, x + 10, 294, w - 20, 28, C.green, 'dg.level.disk'); }
      else lbox(g, x + 10, 244, w - 20, 74, C.green, c === 'block' ? 'dg.level.lun' : 'dg.level.store');
      g.text(x, 348, 'dg.level.see' + c, { c: 'm', w });
    });
  } };
  return { W: 340, H: 666, draw(g) {
    lv.forEach(([c, col], i) => {
      const y = i * 222;
      g.text(10, y + 14, 'dg.level.' + c, { c: cls(col), weight: 600 });
      if (c === 'block') lbox(g, 10, y + 28, 320, 48, C.cyan, 'dg.level.fsC', { a: 0.3 }); else lbox(g, 10, y + 28, 320, 48, C.mute, c === 'file' ? 'dg.level.nfsc' : 'dg.level.http');
      g.line(40, y + 78, 40, y + 124, col, { arrow: 1, sw: 2.4 }); g.text(54, y + 101, 'dg.level.q' + c, { c: cls(col), w: 270, va: 'mid' });
      lbox(g, 10, y + 128, 320, 46, C.green, c === 'block' ? 'dg.level.lun' : c === 'file' ? 'dg.level.fsS' : 'dg.level.store', { a: c === 'file' ? 0.3 : undefined });
      g.text(10, y + 186, 'dg.level.see' + c, { c: 'm', w: 320 });
    });
  } };
};
// ch2: three small files one after another vs the same bytes as one file, to scale in time (chapter defaults)
DG.nas = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 200 : 236;
  return { W, H, draw(g) {
    const bx = 10, bw = W - 20, X = t => bx + bw * t / DVn.tA, bh = 28, rtt = DVn.rtt, dat = DVn.dat;
    const seg = (t0, dt, col, y) => g.box(X(t0) + 0.5, y, Math.max(1, X(t0 + dt) - X(t0) - 1), bh, col, { solid: true, rx: 2, nostroke: true });
    g.text(10, 16, 'dg.nas.a', { c: 'm' });
    let t0 = 0;
    for (let f = 0; f < DVn.files; f++) { for (let j = 0; j < DVn.k; j++) { seg(t0, rtt, C.red, 30); t0 += rtt; } seg(t0, dat, C.gold, 30); t0 += dat; }
    g.text(W - 10, 76, 'dg.nas.ta', { a: 'end' });
    g.text(10, 104, 'dg.nas.b', { c: 'm' });
    t0 = 0; for (let j = 0; j < DVn.k; j++) { seg(t0, rtt, C.red, 118); t0 += rtt; } seg(t0, DVn.files * dat, C.gold, 118);
    g.text(X(DVn.tB) + 8, 132, 'dg.nas.tb');
    const ly = 178;
    g.swatch(10, ly, C.red); g.text(28, ly, 'dg.nas.lr', { c: 'r' });
    if (wide) { g.swatch(300, ly, C.gold); g.text(318, ly, 'dg.nas.ld', { c: 'g' }); } else { g.swatch(10, ly + 26, C.gold); g.text(28, ly + 26, 'dg.nas.ld', { c: 'g' }); }
  } };
};
// ch3: the default 1 MiB write, PDU by PDU; schematic
DG.iscsi = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, step = wide ? 36 : 52, y0 = wide ? 52 : 50, H = y0 + 10 * step + (wide ? 14 : 4);
  return { W, H, draw(g) {
    const xa = wide ? 120 : 20, xb = wide ? 560 : 320, dy = wide ? 12 : 30;
    g.text(xa, 16, 'dg.iscsi.ini', { a: wide ? 'middle' : 'start', weight: 600 }); g.text(xb, 16, 'dg.iscsi.tgt', { a: wide ? 'middle' : 'end', c: 'n', weight: 600 });
    g.line(xa, 30, xa, H - 6, C.mute, { sw: 1.2 }); g.line(xb, 30, xb, H - 6, C.green, { sw: 1.2 });
    const rows = [[1, C.cyan, 'dg.iscsi.cmd', {}]];
    for (let i = 1; i <= DVn.r2t; i++) { rows.push([-1, C.red, 'dg.iscsi.r2t', { i: fmt(i, 0), b: DV['b' + i] }]); rows.push([1, C.gold, 'dg.iscsi.dout', { c: DV['c' + i] }]); }
    rows.push([-1, C.cyan, 'dg.iscsi.rsp', {}]);
    rows.forEach(([d, col, k, v], r) => msg(g, xa, xb, y0 + r * step, d, col, k, v, { dy, sw: col === C.gold ? 3 : 2, w: wide ? 420 : 280 }));
    if (wide) for (let r = 1; r <= DVn.rounds; r++) {
      const top = y0 + (2 * r - 2) * step + dy - 2, bot = y0 + (2 * r - 1) * step + dy + 12;
      g.line(588, top, 594, top, C.red, { sw: 1.2 }); g.line(594, top, 594, bot, C.red, { sw: 1.2 }); g.line(588, bot, 594, bot, C.red, { sw: 1.2 });
      g.text(604, (top + bot) / 2, 'dg.iscsi.rt', { c: 'r', vars: { i: fmt(r, 0) } });
    }
  } };
};
// ch4: buffer-to-buffer credits on a long fibre, and one frame's fields; schematic
DG.fc = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340;
  const F = [['sof', C.mute, 'dg.fc.sof', 'dg.fc.b'], ['fhdr', C.mute, 'dg.fc.hdr', 'dg.fc.b'], ['fpay', C.gold, 'dg.fc.pay', 'dg.fc.bmax'], ['fcrc', C.mute, 'dg.fc.crc', 'dg.fc.b'], ['feof', C.mute, 'dg.fc.eof', 'dg.fc.b']];
  const slots = g => (x, y, w) => { for (let i = 0; i < 5; i++) g.box(x + i * (w + 6), y, w, 26, C.gold, { a: i < 2 ? 0.8 : 0.06, rx: 3, sw: 1 }); };
  if (wide) return { W, H: 308, draw(g) {
    lbox(g, 10, 40, 140, 90, C.mute, 'dg.fc.tx');
    g.box(570, 40, 140, 90, C.green, { a: 0.1 }); g.text(640, 58, 'dg.fc.rx', { a: 'middle', c: 'n', w: 126 }); slots(g)(582, 88, 20);
    g.line(150, 64, 567, 64, C.violet, { arrow: 1, sw: 2 }); g.line(570, 108, 153, 108, C.violet, { arrow: 1, sw: 2 });
    [200, 290, 380, 470].forEach(x => g.box(x, 54, 44, 20, C.gold, { solid: true, rx: 3 }));
    [250, 370, 490].forEach(x => g.box(x, 100, 10, 16, C.green, { solid: true, rx: 2 }));
    g.text(360, 38, 'dg.fc.fwd', { a: 'middle', c: 'g' }); g.text(360, 86, 'dg.fc.fibre', { a: 'middle', c: 'v' }); g.text(360, 132, 'dg.fc.back', { a: 'middle', c: 'n' });
    g.text(10, 156, 'dg.fc.credit', { c: 'c', w: 700 });
    g.text(10, 202, 'dg.fc.ft', { c: 'm', weight: 600 });
    const ws = [56, 96, 300, 60, 60]; let x = 15;
    F.forEach(([f, col, k, kb], i) => { g.box(x, 218, ws[i], 36, col, { rx: 3, a: col === C.gold ? 0.2 : 0.1 }); g.text(x + ws[i] / 2, 236, k, { a: 'middle', c: cls(col) }); g.text(x + ws[i] / 2, 272, kb, { a: 'middle', c: 'm', vars: { n: DV[f] } }); x += ws[i]; });
    g.box(x + 6, 218, 100, 36, C.mute, { a: 0.03, dash: '4 4', sw: 1 }); g.text(x + 56, 236, 'dg.fc.idle', { a: 'middle', c: 'm' }); g.text(x + 56, 272, 'dg.fc.b', { a: 'middle', c: 'm', vars: { n: DV.idle } });
  } };
  return { W, H: 650, draw(g) {
    lbox(g, 10, 10, 320, 40, C.mute, 'dg.fc.tx');
    g.line(60, 52, 60, 302, C.violet, { arrow: 1, sw: 2 }); g.line(280, 304, 280, 54, C.violet, { arrow: 1, sw: 2 });
    [80, 150, 220].forEach(y => g.box(50, y, 20, 30, C.gold, { solid: true, rx: 3 }));
    [120, 230].forEach(y => g.box(275, y, 10, 16, C.green, { solid: true, rx: 2 }));
    g.text(80, 90, 'dg.fc.fwd', { c: 'g', w: 180 }); g.text(170, 180, 'dg.fc.fibre', { a: 'middle', c: 'v', w: 180 }); g.text(260, 260, 'dg.fc.back', { a: 'end', c: 'n', w: 180 });
    g.box(10, 306, 320, 74, C.green, { a: 0.1 }); g.text(20, 324, 'dg.fc.rx', { c: 'n', w: 300 }); slots(g)(20, 344, 26);
    g.text(10, 400, 'dg.fc.credit', { c: 'c', w: 320 });
    g.text(10, 490, 'dg.fc.ft', { c: 'm', weight: 600, w: 320 });
    let y = 506; const hs = [20, 22, 34, 20, 20];
    F.forEach(([f, col, k, kb], i) => { g.box(10, y, 320, hs[i], col, { rx: 3, a: col === C.gold ? 0.2 : 0.1 }); g.text(20, y + hs[i] / 2, k, { c: cls(col) }); g.text(320, y + hs[i] / 2, kb, { a: 'end', c: 'm', vars: { n: DV[f] } }); y += hs[i]; });
    y += 4; g.box(10, y, 320, 22, C.mute, { a: 0.03, dash: '4 4', sw: 1, rx: 3 }); g.text(20, y + 11, 'dg.fc.idle', { c: 'm' }); g.text(320, y + 11, 'dg.fc.b', { a: 'end', c: 'm', vars: { n: DV.idle } });
  } };
};
// ch5: where the microseconds of one remote read go; colours as in the model's bar; schematic
DG.path = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340;
  const legend = (g, x, ys, w) => [[C.gold, 'dg.path.lm', 'g'], [C.red, 'dg.path.lf', 'r'], [C.violet, 'dg.path.lp', 'v'], [C.cyan, 'dg.path.ls', 'c']]
    .forEach(([col, k, c], i) => { g.swatch(x, ys[i], col); g.text(x + 18, ys[i], k, { c, w }); });
  if (wide) return { W, H: 352, draw(g) {
    g.text(10, 14, 'dg.path.host', { c: 'm', weight: 600 }); g.text(710, 14, 'dg.path.tgt', { a: 'end', c: 'n', weight: 600 });
    g.box(10, 28, 170, 150, C.mute, { a: 0.04, sw: 1 }); g.box(540, 28, 170, 150, C.green, { a: 0.04, sw: 1 });
    lbox(g, 16, 36, 158, 30, C.mute, 'dg.path.app'); lbox(g, 16, 71, 158, 63, C.red, 'dg.path.stack'); lbox(g, 16, 138, 158, 30, C.red, 'dg.path.nic');
    lbox(g, 546, 36, 158, 30, C.gold, 'dg.path.disk'); lbox(g, 546, 71, 158, 63, C.red, 'dg.path.stack'); lbox(g, 546, 138, 158, 30, C.red, 'dg.path.nic');
    [[180, 230], [310, 410], [490, 540]].forEach(([a, b]) => g.line(a, 151, b, 151, C.violet, { sw: 2.4 }));
    lbox(g, 230, 136, 80, 30, C.cyan, 'dg.path.sw'); lbox(g, 410, 136, 80, 30, C.cyan, 'dg.path.sw');
    g.text(360, 124, 'dg.path.fibre', { a: 'middle', c: 'v' });
    g.text(360, 192, 'dg.path.twice', { a: 'middle', c: 'm', w: 340 });
    legend(g, 10, [238, 264, 308, 334], 680);
  } };
  return { W, H: 660, draw(g) {
    g.text(10, 14, 'dg.path.host', { c: 'm', weight: 600 });
    g.box(10, 26, 320, 118, C.mute, { a: 0.04, sw: 1 });
    lbox(g, 20, 34, 300, 30, C.mute, 'dg.path.app'); lbox(g, 20, 70, 300, 34, C.red, 'dg.path.stack'); lbox(g, 20, 110, 300, 28, C.red, 'dg.path.nic');
    [[144, 164], [192, 256], [284, 304]].forEach(([a, b]) => g.line(60, a, 60, b, C.violet, { sw: 2.4 }));
    lbox(g, 20, 164, 80, 28, C.cyan, 'dg.path.sw'); lbox(g, 20, 256, 80, 28, C.cyan, 'dg.path.sw');
    g.text(76, 238, 'dg.path.fibre', { c: 'v' }); g.text(120, 158, 'dg.path.twice', { c: 'm', w: 200 });
    g.box(10, 304, 320, 118, C.green, { a: 0.04, sw: 1 });
    lbox(g, 20, 312, 300, 28, C.red, 'dg.path.nic'); lbox(g, 20, 346, 300, 34, C.red, 'dg.path.stack'); lbox(g, 20, 386, 300, 30, C.gold, 'dg.path.disk');
    g.text(10, 440, 'dg.path.tgt', { c: 'n', weight: 600 });
    legend(g, 10, [472, 522, 590, 620], 300);
  } };
};
// ch6: TCP vs RDMA, the path of the bytes through each host; schematic
DG.rdma = (L) => {
  const wide = L === 'w';
  if (wide) return { W: 720, H: 310, draw(g) {
    g.text(10, 14, 'dg.rdma.tcp', { c: 'm', weight: 600 });
    lbox(g, 10, 32, 130, 80, C.gold, 'dg.rdma.buf');
    g.line(140, 72, 177, 72, C.red, { arrow: 1, sw: 2.2 }); g.text(158, 92, 'dg.rdma.copy', { a: 'middle', c: 'r' });
    lbox(g, 180, 32, 250, 80, C.red, 'dg.rdma.kern');
    g.line(430, 72, 457, 72, C.mute, { arrow: 1 });
    lbox(g, 460, 32, 120, 80, C.mute, 'dg.rdma.nic');
    g.line(580, 72, 602, 72, C.violet, { sw: 3 }); g.text(608, 72, 'dg.rdma.peer', { c: 'm', w: 108, va: 'mid' });
    g.text(10, 146, 'dg.rdma.rd', { c: 'm', weight: 600 });
    lbox(g, 10, 164, 130, 80, C.gold, 'dg.rdma.reg');
    g.line(140, 182, 457, 182, C.gold, { arrow: 1, sw: 2.2 }); g.text(298, 202, 'dg.rdma.dma', { a: 'middle', c: 'g', w: 290 });
    lbox(g, 460, 164, 120, 80, C.mute, 'dg.rdma.rnic');
    g.line(580, 204, 602, 204, C.violet, { sw: 3 }); g.text(608, 204, 'dg.rdma.peer2', { c: 'm', w: 108, va: 'mid' });
    g.text(10, 276, 'dg.rdma.note', { c: 'r', w: 700 });
  } };
  return { W: 340, H: 572, draw(g) {
    g.text(10, 14, 'dg.rdma.tcp', { c: 'm', weight: 600, w: 150 }); g.text(176, 14, 'dg.rdma.rd', { c: 'm', weight: 600, w: 154 });
    const y0 = 104;
    lbox(g, 10, y0, 155, 52, C.gold, 'dg.rdma.buf');
    g.line(40, y0 + 52, 40, y0 + 86, C.red, { arrow: 1, sw: 2.2 }); g.text(52, y0 + 69, 'dg.rdma.copy', { c: 'r' });
    lbox(g, 10, y0 + 88, 155, 120, C.red, 'dg.rdma.kern');
    g.line(40, y0 + 208, 40, y0 + 230, C.mute, { arrow: 1 });
    lbox(g, 10, y0 + 232, 155, 64, C.mute, 'dg.rdma.nic');
    g.line(40, y0 + 296, 40, y0 + 326, C.violet, { sw: 3 }); g.text(10, y0 + 346, 'dg.rdma.peer', { c: 'm', w: 155 });
    lbox(g, 176, y0, 154, 52, C.gold, 'dg.rdma.reg');
    g.line(200, y0 + 52, 200, y0 + 230, C.gold, { arrow: 1, sw: 2.2 }); g.text(212, y0 + 100, 'dg.rdma.dma', { c: 'g', w: 118 });
    lbox(g, 176, y0 + 232, 154, 64, C.mute, 'dg.rdma.rnic');
    g.line(200, y0 + 296, 200, y0 + 326, C.violet, { sw: 3 }); g.text(176, y0 + 346, 'dg.rdma.peer2', { c: 'm', w: 154 });
    g.text(10, y0 + 404, 'dg.rdma.note', { c: 'r', w: 320 });
  } };
};
// ch6: one lost packet under go-back-N and under selective repeat; schematic, eight packets
DG.gbn = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 262 : 336;
  return { W, H, draw(g) {
    const bw = wide ? 60 : 34, gap = wide ? 8 : 5, x0 = wide ? 170 : 10, bh = wide ? 34 : 30;
    const rows = [['sent', 'sent'], ['gbn', 'gbn'], ['sr', 'sr']];
    rows.forEach(([k, mode], r) => {
      const y = wide ? 26 + r * 70 : 52 + r * 96;
      if (wide) g.text(10, y + bh / 2, 'dg.gbn.' + k, { c: 'm', w: 150, va: 'mid' }); else g.text(10, y - 34, 'dg.gbn.' + k, { c: 'm', w: 320 });
      for (let i = 0; i < 8; i++) {
        const x = x0 + i * (bw + gap), lost = i === 2;
        let col = C.gold, solid = true, tc = 'k';
        if (mode === 'sent') { if (lost) { col = C.red; solid = false; tc = 'r'; } }
        else if (mode === 'gbn') { if (i >= 2) col = C.red; else { col = C.dimfill; } }
        else { if (lost) col = C.red; else col = C.dimfill; }
        g.box(x, y, bw, bh, col, { solid, rx: 3, dash: mode === 'sent' && lost ? '4 3' : 'none' });
        g.text(x + bw / 2, y + bh / 2, { raw: String(i + 1) }, { a: 'middle', c: col === C.dimfill ? 'm' : tc, mono: 1 });
        if (mode === 'sent' && lost) { g.line(x + 6, y + 4, x + bw - 6, y + bh - 4, C.red, { sw: 2 }); g.line(x + bw - 6, y + 4, x + 6, y + bh - 4, C.red, { sw: 2 }); }
      }
    });
    const ly = wide ? 240 : 316;
    g.swatch(10, ly, C.red); g.text(28, ly, 'dg.gbn.lr', { c: 'r' }); g.swatch(wide ? 300 : 150, ly, C.dimfill); g.text(wide ? 318 : 168, ly, 'dg.gbn.lk', { c: 'm' });
  } };
};
// ch7: what wraps one command on each transport, top to bottom; schematic
DG.caps = (L) => {
  const wide = L === 'w';
  const cols = [['i', ['cdb', C.cyan], ['bhs', C.mute], ['tcp', C.violet], ['ip', C.violet], ['eth', C.violet]],
    ['t', ['sqe', C.cyan], ['pdu', C.mute], ['tcp', C.violet], ['ip', C.violet], ['eth', C.violet]],
    ['r', ['send', C.cyan], ['bth', C.mute], ['udp', C.violet], ['ip', C.violet], ['eth', C.violet]]];
  // the transport-header row is taller: the NVMe/TCP PDU label needs three lines in a column, two on a phone
  const rowY = (y0, hs, gap) => hs.map((h, r) => [y0 + hs.slice(0, r).reduce((a, b) => a + b + gap, 0), h]);
  if (wide) return { W: 720, H: 416, draw(g) {
    cols.forEach(([c, ...rows], i) => {
      const x = 10 + i * 240, w = 220, ys = rowY(30, [54, 76, 54, 54, 54], 6);
      g.text(x, 14, 'dg.caps.t' + c, { weight: 600, w });
      rows.forEach(([k, col], r) => lbox(g, x, ys[r][0], w, ys[r][1], col, 'dg.caps.' + k, { a: col === C.cyan ? 0.25 : undefined }));
      g.text(x, 364, 'dg.caps.n' + c, { c: c === 'i' ? 'm' : 'n', w });
    });
  } };
  return { W: 340, H: 900, draw(g) {
    cols.forEach(([c, ...rows], i) => {
      const y = i * 300, ys = rowY(y + 28, [40, 50, 40, 40, 40], 4);
      g.text(10, y + 14, 'dg.caps.t' + c, { weight: 600 });
      rows.forEach(([k, col], r) => lbox(g, 10, ys[r][0], 320, ys[r][1], col, 'dg.caps.' + k, { a: col === C.cyan ? 0.25 : undefined }));
      g.text(10, y + 266, 'dg.caps.n' + c, { c: c === 'i' ? 'm' : 'n', w: 320 });
    });
  } };
};
// ch8: two paths from a host to a volume, one through the controller that owns it; schematic
DG.mp = (L) => {
  const wide = L === 'w';
  if (wide) return { W: 720, H: 310, draw(g) {
    g.text(10, 16, 'dg.mp.opt', { c: 'n', w: 700 });
    lbox(g, 10, 100, 120, 100, C.mute, 'dg.mp.host');
    lbox(g, 220, 50, 110, 44, C.mute, 'dg.mp.sw1'); lbox(g, 220, 206, 110, 44, C.mute, 'dg.mp.sw2');
    g.box(420, 30, 290, 240, C.mute, { a: 0.03, sw: 1, dash: '3 4' });
    lbox(g, 440, 50, 110, 44, C.green, 'dg.mp.ca'); lbox(g, 440, 206, 110, 44, C.green, 'dg.mp.cb');
    lbox(g, 590, 100, 110, 100, C.gold, 'dg.mp.vol');
    g.poly([[130, 125], [175, 125], [175, 72], [217, 72]], C.green, { sw: 3, arrow: 1 }); g.line(330, 72, 437, 72, C.green, { sw: 3, arrow: 1 }); g.poly([[550, 72], [570, 72], [570, 130], [587, 130]], C.green, { sw: 3, arrow: 1 });
    g.poly([[130, 175], [175, 175], [175, 228], [217, 228]], C.red, { sw: 2, dash: '6 4', arrow: 1 }); g.line(330, 228, 437, 228, C.red, { sw: 2, dash: '6 4', arrow: 1 });
    g.line(495, 204, 495, 97, C.red, { sw: 2, dash: '6 4', arrow: 1 }); g.text(505, 150, 'dg.mp.ic', { c: 'r', w: 78, va: 'mid' });
    g.text(10, 292, 'dg.mp.non', { c: 'r', w: 700 });
  } };
  return { W: 340, H: 440, draw(g) {
    lbox(g, 10, 10, 320, 44, C.mute, 'dg.mp.host');
    lbox(g, 10, 96, 150, 40, C.mute, 'dg.mp.sw1'); lbox(g, 180, 96, 150, 40, C.mute, 'dg.mp.sw2');
    lbox(g, 10, 180, 150, 44, C.green, 'dg.mp.ca'); lbox(g, 180, 180, 150, 44, C.green, 'dg.mp.cb');
    lbox(g, 10, 262, 150, 60, C.gold, 'dg.mp.vol');
    g.line(85, 54, 85, 93, C.green, { sw: 3, arrow: 1 }); g.line(85, 136, 85, 177, C.green, { sw: 3, arrow: 1 }); g.line(85, 224, 85, 259, C.green, { sw: 3, arrow: 1 });
    g.line(255, 54, 255, 93, C.red, { sw: 2, dash: '6 4', arrow: 1 }); g.line(255, 136, 255, 177, C.red, { sw: 2, dash: '6 4', arrow: 1 });
    g.line(180, 210, 163, 210, C.red, { sw: 2, dash: '4 3', arrow: 1 }); g.text(180, 248, 'dg.mp.ic', { c: 'r', w: 150 });
    g.text(10, 344, 'dg.mp.opt', { c: 'n', w: 320 }); g.text(10, 392, 'dg.mp.non', { c: 'r', w: 320 });
  } };
};
// ch9: three replicas vs RS(10,4), fragments on separate machines; counts exact, sizes schematic
DG.ec = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 330;
  return { W, H, draw(g) {
    g.text(10, 14, 'dg.ec.rt', { c: 'm', weight: 600 });
    const rw = wide ? 80 : 90;
    for (let i = 0; i < DVn.rep; i++) lbox(g, 10 + i * (rw + 10), 30, rw, 34, C.gold, 'dg.ec.copy');
    g.text(wide ? 300 : 10, wide ? 47 : 86, 'dg.ec.rn', { c: 'm', w: wide ? 410 : 320, va: wide ? 'mid' : 'top' });
    const ty = wide ? 104 : 140;
    g.text(10, ty, 'dg.ec.et', { c: 'm', weight: 600, w: W - 20 });
    const n = DVn.en, k = DVn.ek, bw = wide ? 44 : 19, gap = wide ? 6 : 3, by = wide ? 120 : 176, bh = wide ? 36 : 30;
    for (let i = 0; i < n; i++) {
      const x = 10 + i * (bw + gap), lost = i === 3;
      g.box(x, by, bw, bh, i < k ? C.gold : C.mute, { solid: i < k && !lost, a: i < k ? 0.25 : 0.25, rx: 3, dash: lost ? '4 3' : 'none' });
      if (lost) { g.line(x + 4, by + 4, x + bw - 4, by + bh - 4, C.red, { sw: 2 }); g.line(x + bw - 4, by + 4, x + 4, by + bh - 4, C.red, { sw: 2 }); }
    }
    const xd = 10 + k * (bw + gap) - gap, xe = 10 + n * (bw + gap) - gap, yb = by + bh + 8;
    g.line(10, yb, xd, yb, C.gold, { sw: 1.4 }); g.line(10 + k * (bw + gap), yb, xe, yb, C.mute, { sw: 1.4 });
    g.text((10 + xd) / 2, yb + 14, 'dg.ec.dk', { a: 'middle', c: 'g' }); g.text((10 + k * (bw + gap) + xe) / 2, yb + 14, 'dg.ec.pm', { a: 'middle', c: 'm' });
    g.text(10, yb + 46, 'dg.ec.en', { c: 'm', w: W - 20 });
  } };
};
let dgLayout = new WeakMap(), DVn = {};
function renderDiagrams(force) {
  const raw = M.dgVals(); DVn = {}; DV = {};
  for (const [k, [v, d]] of Object.entries(raw)) { DVn[k] = v; DV[k] = fmt(v, d); }
  DV.port = String(raw.port[0]);   // a port number, not a quantity: no thousands separator
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

/* ───────── 01 block / file / object ───────── */
(() => {
  const cv = $('#lvCv'), sK = $('#lvK'), cb = $('#lvC');
  const k = () => Math.pow(2, +sK.value), S = () => +radioVal('lvS'), cached = () => cb.checked;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.LEVEL.cost(Math.min(k(), S()), S(), cached());
      const labs = ['ch1.lv.block', 'ch1.lv.file', 'ch1.lv.object'].map(x => t(x)), lf = labelFont(c, labs, Math.min(110, w * 0.28));
      const L = lf.w, R = w - 14, T = 10, B = h - 34, X = b => L + (R - L) * Math.log2(Math.max(1, b)) / 31, rh = (B - T) / 3;
      const ticks = [[1, '1 B'], [1024, '1 KiB'], [1048576, '1 MiB'], [1073741824, '1 GiB']].map(([b, s]) => [X(b), s]);
      c.strokeStyle = C.grid; ticks.forEach(([x]) => { c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); });
      spacedTicks(c, ticks, B + 11); c.textAlign = 'right'; c.fillStyle = C.mute; c.fillText(t('ch1.cv.x'), R, B + 26);
      [[r.block, C.cyan], [r.file, C.green], [r.object, C.gold]].forEach(([o, col], i) => {
        const y = T + i * rh + rh * 0.2, bh = rh * 0.6;
        c.font = lf.font; c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(labs[i], L - 8, y + bh / 2); c.font = FONT;
        c.fillStyle = col; c.fillRect(L, y, Math.max(2, X(o.bytes) - L), bh);
      });
      const xk = X(Math.min(k(), S())); c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(xk, T); c.lineTo(xk, B); c.stroke(); c.setLineDash([]);
    }
  });
  function text() {
    const kk = Math.min(k(), S()), z = M.say.level(kk, S(), cached()), v = z.v;
    put('#lvKo', bytes(kk));
    put('#lvB', bytes(v.b)); put('#lvF', bytes(v.f)); put('#lvO', bytes(v.o));
    putHTML('#lvSay', t(z.key, { k: bytes(v.k), b: bytes(v.b), f: bytes(v.f), o: bytes(v.o), ab: times(v.ab), ao: times(v.ao) }));
  }
  wire(sim, text, ['#lvK'], ['lvS'], ['#lvC']);
})();

/* ───────── 02 many small files ───────── */
(() => {
  const cv = $('#nsCv'), N = D.nas.N;
  const s = () => Math.pow(2, +$('#nsS').value), rtt = () => lv('nsR'), k = () => +radioVal('nsK'), P = () => +radioVal('nsP'), g = () => +radioVal('nsG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = 58, R = w - 14, T = 26, B = h - 40;
      const xs = []; for (let e = 2; e <= 14.0001; e += 0.1) xs.push(Math.pow(2, e));
      const many = xs.map(x => M.NAS.run(N, x, rtt(), k(), P(), g()).T), big = xs.map(x => M.NAS.run(N, x, rtt(), k(), P(), g()).big);
      const lo = Math.floor(log10(Math.min(...big))), hi = Math.ceil(log10(Math.max(...many)));
      const X = x => L + (R - L) * (Math.log2(x) - 2) / 12, Y = y => B - (B - T) * (log10(y) - lo) / Math.max(1, hi - lo);
      const yv = []; for (let e = lo; e <= hi; e++) yv.push(Math.pow(10, e));
      yTicks(c, L, R, Y, yv, v => dur(v, 0));
      axes(c, L, R, T, B, t('ch2.cv.x'), t('ch2.cv.y'));
      spacedTicks(c, [4, 64, 1024, 16384].map(v => [X(v), bytes(v * 1024)]), B + 12);
      path(c, xs.map((x, i) => [X(x), Y(big[i])]), C.cyan, 2);
      path(c, xs.map((x, i) => [X(x), Y(many[i])]), C.gold, 2.4);
      const r = M.NAS.run(N, s(), rtt(), k(), P(), g());
      dot(c, X(s()), Y(r.T), C.gold); dot(c, X(s()), Y(r.big), C.cyan);
    }
  });
  function text() {
    const r = M.NAS.run(N, s(), rtt(), k(), P(), g()), z = M.say.nas(N, s(), rtt(), k(), P(), g()), v = z.v;
    put('#nsSo', bytes(s() * 1024)); put('#nsRo', dur(rtt() / 1000));
    put('#nsT', dur(r.T)); put('#nsB', dur(r.big)); put('#nsX', times(r.ratio)); put('#nsU', pct(r.util));
    putHTML('#nsSay', t(z.key, { k: k(), T: dur(v.T), big: dur(v.big), ratio: times(v.ratio), util: pct(v.util), sStar: bytes(v.sStar * 1024) }));
  }
  wire(sim, text, ['#nsS', '#nsR'], ['nsK', 'nsP', 'nsG']);
})();

/* ───────── 03 iSCSI write ───────── */
(() => {
  const cv = $('#isCv');
  const W = () => Math.pow(2, +$('#isW').value), rtt = () => lv('isR'), prof = () => radioVal('isP'), g = () => +radioVal('isG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.ISCSI.write(W(), rtt(), g(), prof());
      const L = 14, R = w - 14, y = h * 0.42, bh = 34, rt = rtt() / 1000, X = s => L + (R - L) * s / r.T;
      let x = 0; const marks = [];
      r.bursts.forEach((b, i) => {
        const dw = r.tWire * b / W();
        if (b > 0) { c.fillStyle = C.gold; c.fillRect(X(x), y - bh / 2, Math.max(1, X(x + dw) - X(x)), bh); x += dw; }
        c.fillStyle = C.red; c.fillRect(X(x), y - bh / 2, Math.max(1, X(x + rt) - X(x) - 1), bh); marks.push([X(x + rt / 2), i + 1]); x += rt;
      });
      c.strokeStyle = C.line; c.strokeRect(L, y - bh / 2, R - L, bh);
      const items = marks.map(([mx, i]) => [mx, t('ch3.cv.rt', { n: i })]);
      c.font = FONT; spacedTicks(c, items, y + bh / 2 + 16);
      c.textAlign = 'left'; c.fillStyle = C.mute; c.fillText('0', L, y - bh / 2 - 12); c.textAlign = 'right'; c.fillText(dur(r.T), R, y - bh / 2 - 12);
    }
  });
  function text() {
    const r = M.ISCSI.write(W(), rtt(), g(), prof()), z = M.say.iscsi(W(), rtt(), g(), prof()), v = z.v;
    put('#isWo', bytes(W())); put('#isRo', dur(rtt() / 1000));
    put('#isRt', fmt(r.rounds, 0)); put('#isPdu', fmt(r.pdus, 0)); put('#isT', dur(r.T)); put('#isMB', mbs(r.MBps));
    putHTML('#isSay', t(z.key, { rt: fmt(v.rt, 0), r2t: fmt(v.r2t, 0), wait: pct(v.wait), T: dur(v.T), MBps: mbs(v.MBps) }));
  }
  wire(sim, text, ['#isW', '#isR'], ['isP', 'isG']);
})();

/* ───────── 04 Fibre Channel credits (animated link + utilisation curve) ───────── */
(() => {
  const cv = $('#fcCv'), cv2 = $('#fc2Cv');
  const g = () => +radioVal('fcG'), km = () => lv('fcD'), cr = () => lv('fcC'), pl = () => +radioVal('fcF');
  let S = null;
  function reset() {
    const r = M.FC.run(g(), km(), cr(), pl());
    S = { r, t: 0, next: 0, credits: cr(), frames: [], back: [] };
    if (reduce) advance(5 * (r.rtt + r.tf) + 0.5 * r.tp); // still frame: the burst halfway down the fibre
  }
  function advance(to) {
    const { r } = S;
    for (let guard = 0; guard < 200000; guard++) {
      const tb = S.back.length ? S.back[0] : Infinity, tl = S.credits > 0 ? S.next : Infinity, te = Math.min(tb, tl);
      if (te > to) break;
      if (tb <= tl) { S.back.shift(); S.credits++; if (S.next < tb) S.next = tb; }
      else { S.frames.push(S.next); S.back.push(S.next + r.tf + r.rtt); S.credits--; S.next += r.tf; }
    }
    S.t = to;
    const tp = r.tp; while (S.frames.length && S.frames[0] + r.tf + tp < S.t) S.frames.shift();
  }
  const sim = reg([cv, cv2], {
    step(dt) {
      if (!S) reset();
      if (reduce) { if (this.dirty) { this.draw(); this.dirty = false; } return; }
      advance(S.t + dt * Math.max(S.r.rtt, 3 * S.r.tf) / 3);
      this.draw();
    },
    draw() {
      if (!S) reset();
      { const { c, w, h } = fit(cv), r = S.r, L = 70, R = w - 70, y = h * 0.5;
        c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('ch4.cv.tx'), 34, y); c.fillText(t('ch4.cv.rx'), w - 34, y);
        c.strokeStyle = C.line; c.lineWidth = 2; c.beginPath(); c.moveTo(L, y - 8); c.lineTo(R, y - 8); c.moveTo(L, y + 10); c.lineTo(R, y + 10); c.stroke();
        const len = R - L, fw = Math.max(1.5, len * r.tf / Math.max(r.tp, 1e-9));
        c.fillStyle = C.gold;
        for (const f of S.frames) { const head = (S.t - f) / r.tp; if (head < 0) continue; const x1 = L + len * Math.min(1, head), x0 = Math.max(L, x1 - fw); if (x1 > x0) c.fillRect(x0, y - 14, x1 - x0, 12); }
        c.fillStyle = C.cyan;
        for (const b of S.back) { const start = b - r.tp; if (S.t < start) continue; const x = R - len * (S.t - start) / r.tp; dot(c, x, y + 10, C.cyan, 3); }
        c.textAlign = 'center'; c.fillStyle = C.ink; c.fillText(t('ch4.cv.credit', { n: fmt(S.credits, 0) }), (L + R) / 2, h - 14);
      }
      { const { c, w, h } = fit(cv2), L = 50, R = w - 14, T = 26, B = h - 40;
        const X = k => L + (R - L) * (log10(k) + 1) / 3.3, Y = u => B - (B - T) * u;
        yTicks(c, L, R, Y, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0));
        axes(c, L, R, T, B, t('ch4.cv.x'), t('ch4.cv.y'));
        spacedTicks(c, [0.1, 1, 10, 100].map(v => [X(v), fmt(v, v < 1 ? 1 : 0)]), B + 12);
        const pts = []; for (let e = -1; e <= 2.3001; e += 0.02) { const kk = Math.pow(10, e); pts.push([X(kk), Y(M.FC.run(g(), kk, cr(), pl()).util)]); }
        path(c, pts, C.gold, 2.4);
        dot(c, X(km()), Y(S.r.util), C.gold, 5);
      }
    }
  });
  function text() {
    const r = M.FC.run(g(), km(), cr(), pl()), z = M.say.fc(g(), km(), cr(), pl()), v = z.v;
    put('#fcDo', t('u.km', { v: fmt(km(), km() < 1 ? 2 : km() < 10 ? 1 : 0) })); put('#fcCo', fmt(cr(), 0));
    put('#fcN', fmt(r.need, 0)); put('#fcU', pct(r.util)); put('#fcGd', mbs(r.goodMBps)); put('#fcRc', t('u.km', { v: fmt(r.reachKm, r.reachKm < 10 ? 1 : 0) }));
    putHTML('#fcSay', t(z.key, { need: fmt(v.need, 0), util: pct(v.util), good: mbs(v.good), reach: t('u.km', { v: fmt(v.reach, v.reach < 10 ? 1 : 0) }), cr: fmt(v.cr, 0) }));
  }
  sim.reset = reset;
  wire(sim, text, ['#fcD', '#fcC'], ['fcG', 'fcF']);
})();

/* ───────── 05 latency budget ───────── */
(() => {
  const cv = $('#bdCv');
  const med = () => M.BUDGET.media[radioVal('bdM')], tr = () => radioVal('bdT'), km = () => +$('#bdD').value, hops = () => +$('#bdH').value;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.BUDGET.run(med(), tr(), km(), hops());
      const L = 14, R = w - 14, y = h * 0.4, bh = 30, X = v => L + (R - L) * v / r.total;
      let x = 0;
      [[r.media, C.gold], [r.fabric, C.red], [r.prop, C.violet], [r.sw, C.cyan]].forEach(([v, col]) => { if (v <= 0) return; c.fillStyle = col; c.fillRect(X(x), y - bh / 2, Math.max(1.5, X(x + v) - X(x)), bh); x += v; });
      c.strokeStyle = C.line; c.strokeRect(L, y - bh / 2, R - L, bh);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText('0', L, y + bh / 2 + 14); c.textAlign = 'right'; c.fillText(dur(r.total / 1e6), R, y + bh / 2 + 14);
      c.textAlign = 'left'; c.fillText(t('ch5.cv.x'), L, y - bh / 2 - 12);
      if (r.net > 0) tag(c, t('ch5.cv.net', { v: pct(r.share) }), R, y + bh / 2 + 34, C.red, 'right');
    }
  });
  function text() {
    const r = M.BUDGET.run(med(), tr(), km(), hops()), z = M.say.budget(med(), tr(), km(), hops()), v = z.v;
    put('#bdDo', t('u.km', { v: fmt(km(), 0) })); put('#bdHo', fmt(hops(), 0));
    put('#bdTot', dur(r.total / 1e6)); put('#bdNet', dur(r.net / 1e6)); put('#bdSh', pct(r.share)); put('#bdIo', t('u.iops', { v: fmt(r.iops, 0) }));
    putHTML('#bdSay', t(z.key, { share: pct(v.share), net: dur(v.net / 1e6), total: dur(v.total / 1e6), iops: t('u.iops', { v: fmt(v.iops, 0) }) }));
  }
  wire(sim, text, ['#bdD', '#bdH'], ['bdM', 'bdT']);
})();

/* ───────── 06 loss ───────── */
(() => {
  const cv = $('#lsCv');
  const p = () => Math.pow(10, +$('#lsP').value), rtt = () => lv('lsR'), g = () => +radioVal('lsG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = 50, R = w - 14, T = 26, B = h - 40;
      const X = q => L + (R - L) * (log10(q) + 7) / 6, Y = u => B - (B - T) * u;
      yTicks(c, L, R, Y, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0));
      axes(c, L, R, T, B, t('ch6.cv.x'), t('ch6.cv.y'));
      spacedTicks(c, [-7, -5, -3, -1].map(e => [X(Math.pow(10, e)), sup(e)]), B + 12);
      const a = [], b = [], d = [];
      for (let e = -7; e <= -0.999; e += 0.03) { const q = Math.pow(10, e), r = M.LOSS.run(q, g(), rtt()); a.push([X(q), Y(r.gbn)]); b.push([X(q), Y(r.sr)]); d.push([X(q), Y(r.tcp)]); }
      path(c, b, C.cyan, 2); path(c, d, C.violet, 2); path(c, a, C.red, 2.4);
      const x = X(p()); c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); c.setLineDash([]);
      const r = M.LOSS.run(p(), g(), rtt()); dot(c, x, Y(r.gbn), C.red); dot(c, x, Y(r.tcp), C.violet);
    }
  });
  function text() {
    const r = M.LOSS.run(p(), g(), rtt()), z = M.say.loss(p(), g(), rtt()), v = z.v;
    put('#lsPo', lossPct(p())); put('#lsRo', dur(rtt() / 1e6));
    put('#lsW', fmt(r.W, 0)); put('#lsGbn', pct(r.gbn)); put('#lsSr', pct(r.sr)); put('#lsTcp', pct(r.tcp));
    putHTML('#lsSay', t(z.key, { W: fmt(v.W, 0), gbn: pct(v.gbn), sr: pct(v.sr), tcp: pct(v.tcp) }));
  }
  wire(sim, text, ['#lsP', '#lsR'], ['lsG']);
})();

/* ───────── 07 one I/O across three transports ───────── */
(() => {
  const cv = $('#cpCv'), cb = $('#cpI');
  const tr = () => radioVal('cpT'), op = () => radioVal('cpO'), sz = () => +radioVal('cpS');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.CAPS.run(tr(), op(), sz(), { icd: cb.checked });
      const L = 40, R = w - 40, T = 40, B = h - 20, max = 10, show = r.m.length > max ? r.m.slice(0, max - 1) : r.m;
      c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(t('ch7.cv.host'), L, 16); c.fillText(t('ch7.cv.target'), R, 16);
      c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath(); c.moveTo(L, T - 10); c.lineTo(L, B); c.moveTo(R, T - 10); c.lineTo(R, B); c.stroke();
      const rows = r.m.length > max ? max : r.m.length, rh = (B - T) / rows;
      show.forEach((m, i) => {
        const y0 = T + i * rh + rh * 0.15, y1 = y0 + rh * 0.55, a = m.dir > 0 ? L : R, b = m.dir > 0 ? R : L;
        const col = m.data > 64 ? C.gold : m.key.includes('r2t') || m.key.includes('readreq') ? C.red : C.cyan;
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(a, y0); c.lineTo(b, y1); c.stroke();
        const ang = Math.atan2(y1 - y0, b - a); c.fillStyle = col; c.beginPath(); c.moveTo(b, y1); c.lineTo(b - 9 * Math.cos(ang - 0.4), y1 - 9 * Math.sin(ang - 0.4)); c.lineTo(b - 9 * Math.cos(ang + 0.4), y1 - 9 * Math.sin(ang + 0.4)); c.fill();
        const s = t('ch7.cv.lab', { m: t('ch7.m.' + m.key), b: bytes(m.hdr + m.data) }), cap = R - L - 16;
        c.font = FONT; let f = FONT; const tw = c.measureText(s).width; if (tw > cap) f = FONT.replace('12px', Math.max(8.5, 12 * cap / tw).toFixed(1) + 'px');
        c.font = f; const ww = c.measureText(s).width, ym = (y0 + y1) / 2 - 9; c.fillStyle = C.bg; c.fillRect((L + R) / 2 - ww / 2 - 3, ym - 8, ww + 6, 16); c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText(s, (L + R) / 2, ym); c.font = FONT;
      });
      if (r.m.length > max) { c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(t('ch7.cv.more', { n: r.m.length - (max - 1) }), (L + R) / 2, T + (max - 1) * rh + rh * 0.45); }
    }
  });
  function text() {
    const r = M.CAPS.run(tr(), op(), sz(), { icd: cb.checked }), z = M.say.caps(tr(), op(), cb.checked, sz()), v = z.v;
    put('#cpM', fmt(r.msgs, 0)); put('#cpRt', fmt(r.rt, 0)); put('#cpH', bytes(r.hdr)); put('#cpE', pct(r.eff, 1));
    putHTML('#cpSay', t(z.key, { rt: fmt(v.rt, 0), msgs: fmt(v.msgs, 0), eff: pct(v.eff, 1) }));
  }
  wire(sim, text, [], ['cpT', 'cpO', 'cpS'], ['#cpI']);
})();

/* ───────── 08 two paths ───────── */
(() => {
  const cv = $('#mpCv'), mu1 = D.mp.mu1;
  const lam = () => +$('#mpL').value, q = () => +$('#mpQ').value;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), L = 50, R = w - 14, T = 26, B = h - 40, ymax = 200, xmax = 150;
      const X = l => L + (R - L) * l / xmax, Y = u => B - (B - T) * Math.min(u, ymax) / ymax;
      yTicks(c, L, R, Y, [0, 50, 100, 150, 200], v => fmt(v, 0));
      axes(c, L, R, T, B, t('ch8.cv.x'), t('ch8.cv.y'));
      spacedTicks(c, [0, 50, 100, 150].map(v => [X(v), fmt(v, 0)]), B + 12);
      const curves = { opt: [], rr: [], prop: [], best: [], fail: [] };
      for (let l = 0.5; l <= xmax; l += 0.5) {
        const r = M.MP.run(l, mu1, q());
        for (const k of ['opt', 'rr', 'prop', 'best']) curves[k].push(isFinite(r.T[k]) && r.T[k] * 1000 <= ymax ? [X(l), Y(r.T[k] * 1000)] : null);
        curves.fail.push(isFinite(r.fail1) && r.fail1 * 1000 <= ymax ? [X(l), Y(r.fail1 * 1000)] : null);
      }
      path(c, curves.fail, C.red, 2, [6, 4]); path(c, curves.rr, C.violet, 2); path(c, curves.prop, C.cyan, 2); path(c, curves.opt, C.gold, 2.2); path(c, curves.best, C.green, 2.6);
      const x = X(lam()); c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); c.setLineDash([]);
    }
  });
  function text() {
    const r = M.MP.run(lam(), mu1, q()), z = M.say.mp(lam(), mu1, q()), v = z.v, us = x => isFinite(x) ? dur(x / 1000, x >= 0.01 ? 0 : 1) : '∞';
    put('#mpLo', t('u.iops', { v: fmt(lam() * 1000, 0) })); put('#mpQo', t('ch8.unit.q', { v: pct(q(), 0) }));
    put('#mpO', us(r.T.opt)); put('#mpB', us(r.T.best)); put('#mpS', isFinite(r.T.best) ? pct(r.pol.best, 0) : '—'); put('#mpF', us(r.fail1));
    putHTML('#mpSay', t(z.key, { opt: us(v.opt), best: us(v.best), pb: pct(v.pb, 0), fail1: us(v.fail1), rr: us(v.rr) }));
  }
  wire(sim, text, ['#mpL', '#mpQ'], []);
})();

/* ───────── 09 replication vs erasure coding ───────── */
(() => {
  const cv = $('#ecCv'), SCH = M.EC.SCHEMES, keys = ['mirror', 'rep3', 'rs63', 'rs104'];
  const afr = () => +$('#ecA').value / 100, mttr = () => lv('ecM'), sel = () => radioVal('ecS');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), labs = keys.map(k => t('ch9.s.' + k)), lf = labelFont(c, labs, Math.min(100, w * 0.24));
      const L = lf.w, mid = L + (w - L) * 0.42, R = w - 12, T = 34, B = h - 30, rh = (B - T) / keys.length;
      const X1 = v => L + 4 + (mid - L - 14) * v / 3.5, X2 = v => mid + 6 + (R - mid - 6) * Math.min(v, 20) / 20;
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch9.cv.o'), L + 4, 14); c.fillText(t('ch9.cv.n'), mid + 6, 14);
      spacedTicks(c, [1, 2, 3].map(v => [X1(v), fmt(v, 0) + '×']), B + 14); spacedTicks(c, [0, 5, 10, 15, 20].map(v => [X2(v), fmt(v, 0)]), B + 14);
      c.strokeStyle = C.grid; [1, 2, 3].forEach(v => { c.beginPath(); c.moveTo(X1(v), T - 6); c.lineTo(X1(v), B); c.stroke(); }); [5, 10, 15, 20].forEach(v => { c.beginPath(); c.moveTo(X2(v), T - 6); c.lineTo(X2(v), B); c.stroke(); });
      keys.forEach((k, i) => {
        const s = SCH[k], r = M.EC.run(s.n, s.k, afr(), mttr()), y = T + i * rh + rh * 0.22, bh = rh * 0.56, on = k === sel();
        c.font = lf.font; c.fillStyle = on ? C.gold : C.ink; c.textAlign = 'right'; c.fillText(labs[i], L - 8, y + bh / 2); c.font = FONT;
        c.globalAlpha = on ? 1 : 0.5;
        c.fillStyle = C.gold; c.fillRect(X1(0), y, X1(r.overhead) - X1(0), bh);
        c.fillStyle = C.green; c.fillRect(X2(0), y, Math.max(2, X2(r.nines) - X2(0)), bh);
        c.globalAlpha = 1;
      });
    }
  });
  function text() {
    const s = SCH[sel()], r = M.EC.run(s.n, s.k, afr(), mttr()), z = M.say.ec(s.n, s.k, afr(), mttr()), v = z.v;
    put('#ecAo', pct(afr(), 2)); put('#ecMo', t('u.h', { v: fmt(mttr(), mttr() < 10 ? 1 : 0) }));
    put('#ecO', times(r.overhead)); put('#ecT', fmt(r.m, 0)); put('#ecN', t('u.nines', { v: fmt(r.nines, 1) })); put('#ecR', fmt(r.repairReads, 0));
    putHTML('#ecSay', t(z.key, { o: times(v.o), nines: t('u.nines', { v: fmt(v.nines, 1) }), m: fmt(v.m, 0), reads: fmt(v.reads, 0) }));
  }
  wire(sim, text, ['#ecA', '#ecM'], ['ecS']);
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
