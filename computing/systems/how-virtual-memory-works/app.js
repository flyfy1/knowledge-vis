/* How virtual memory works: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.VMModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const { KiB, MiB, GiB, TiB, PiB } = M;

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
const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? (x < 0.1 && x > 0 ? 1 : 0) : d) });
const cyc = (x, d) => t('u.cyc', { v: fmt(x, d == null ? (x < 10 ? 1 : 0) : d) });
const dec = x => (Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 1);
function size(bytes) {
  const U = [[PiB, 'u.PiB'], [TiB, 'u.TiB'], [GiB, 'u.GiB'], [MiB, 'u.MiB'], [KiB, 'u.KiB']];
  for (const [u, k] of U) if (bytes >= u) return t(k, { v: fmt(bytes / u, dec(bytes / u)) });
  return t('u.B', { v: fmt(bytes, 0) });
}
const hexB = (n, pad) => '0x' + n.toString(16).toUpperCase().padStart(pad || 1, '0');
let PROSE = null;
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : fmt(v, d); return o; }
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = k => '10' + String(k).split('').map(ch => SUP[ch]).join('');
function applyLang() {
  const PV = proseVars();
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n, PV); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml, PV); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('[data-hk]').forEach(e => { e.dataset.h = t(e.dataset.hk); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  faultRows();
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
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:=]+|\s+|./g) : s.split(/(\s+)/);
    e.textContent = ''; let lines = [], cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : e.dataset.va === 'bot' ? -(lines.length - 1) * LH : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}
const DG = {};
// two processes, two page tables, one physical memory; libc shared (ch1). Schematic.
DG.map = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 350 : 390;
  return { W, H, draw(g) {
    const ax = wide ? [40, 160] : [10, 92], fx = wide ? [300, 420] : [135, 205], bx = wide ? [560, 680] : [248, 330], top = wide ? 74 : 92;
    const hy = wide ? 26 : 22, hw = wide ? 150 : 82;
    g.text((ax[0] + ax[1]) / 2, hy, 'dg.map.pa', { a: 'middle', c: 'c', w: hw, va: 'top' });
    g.text((fx[0] + fx[1]) / 2, hy, 'dg.map.phys', { a: 'middle', w: wide ? 160 : 92, va: 'top' });
    g.text((bx[0] + bx[1]) / 2, hy, 'dg.map.pb', { a: 'middle', c: 'v', w: hw, va: 'top' });
    if (wide) { g.text(230, 52, 'dg.map.ptA', { a: 'middle', c: 'm' }); g.text(490, 52, 'dg.map.ptB', { a: 'middle', c: 'm' }); }
    const regs = [['dg.map.code', 0], ['dg.map.heap', 1], ['dg.map.libc', 2], ['dg.map.stack', 3]], bh = 36;
    const ry = i => top + [0, 46, 128, 186][i];
    const nF = 9, fh = 22, fg = 6, fy = i => top + i * (fh + fg);
    const mapA = [6, 1, 3, 8], mapB = [0, 5, 3, 7];
    for (let i = 0; i < nF; i++) {
      const owner = mapA.indexOf(i) >= 0 ? (i === 3 ? 'S' : 'A') : mapB.indexOf(i) >= 0 ? 'B' : '';
      g.box(fx[0], fy(i), fx[1] - fx[0], fh, owner === 'S' ? C.gold : owner === 'A' ? C.cyan : owner === 'B' ? C.violet : C.dimfill, { rx: 4, a: owner ? 0.22 : 0.3 });
    }
    regs.forEach(([k, i]) => {
      const y = ry(i), shared = i === 2;
      g.box(ax[0], y, ax[1] - ax[0], bh, shared ? C.gold : C.cyan); g.text((ax[0] + ax[1]) / 2, y + bh / 2, k, { a: 'middle', c: shared ? 'g' : 'c' });
      g.box(bx[0], y, bx[1] - bx[0], bh, shared ? C.gold : C.violet); g.text((bx[0] + bx[1]) / 2, y + bh / 2, k, { a: 'middle', c: shared ? 'g' : 'v' });
      g.line(ax[1], y + bh / 2, fx[0] - 2, fy(mapA[i]) + fh / 2, shared ? C.gold : C.cyan, { arrow: 1 });
      g.line(bx[0], y + bh / 2, fx[1] + 2, fy(mapB[i]) + fh / 2, shared ? C.gold : C.violet, { arrow: 1 });
    });
    if (wide) { g.text(ax[0] - 6, top + 10, 'dg.map.zero', { a: 'end', c: 'm', mono: 1 }); g.text(bx[1] + 6, top + 10, 'dg.map.zero', { a: 'start', c: 'm', mono: 1 }); }
    const ly = top + 186 + bh + (wide ? 30 : 34);
    g.box(fx[0], ly - 7, 14, 14, C.gold, { solid: true, rx: 3 }); g.text(fx[0] + 22, ly, 'dg.map.shared', { c: 'g' });
  } };
};
// 48-bit address: VPN | offset → page table → PFN | offset (ch2)
DG.split = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = 250;
  return { W, H, draw(g) {
    const x0 = wide ? 20 : 10, x1 = wide ? 520 : 230, x2 = wide ? 700 : 330, y = 34, h = 40;
    g.text(x0, 16, 'dg.split.va', { c: 'm' });
    g.box(x0, y, x1 - x0, h, C.red); g.box(x1, y, x2 - x1, h, C.gold);
    g.text((x0 + x1) / 2, y + h / 2, wide ? 'dg.split.vpn' : 'dg.split.vpnS', { a: 'middle', c: 'r' });
    g.text((x1 + x2) / 2, y + h / 2, wide ? 'dg.split.off' : 'dg.split.offS', { a: 'middle', c: 'g' });
    const yb = y + h + 14;
    g.text(x0 + 2, yb, { raw: '47' }, { mono: 1, c: 'm' }); g.text(x1 - 4, yb, { raw: '12' }, { a: 'end', mono: 1, c: 'm' });
    g.text(x1 + 4, yb, { raw: '11' }, { mono: 1, c: 'm' }); g.text(x2 - 2, yb, { raw: '0' }, { a: 'end', mono: 1, c: 'm' });
    const cx = wide ? 270 : 120, tx = wide ? [170, 370] : [40, 200], ty = 118;
    g.line(cx, y + h, cx, ty - 2, C.red, { arrow: 1 });
    g.box(tx[0], ty, tx[1] - tx[0], 36, C.mute, { a: 0.1 }); g.text(cx, ty + 18, wide ? 'dg.split.table' : 'dg.split.tableS', { a: 'middle' });
    const py = 192;
    g.line(cx, ty + 36, cx, py - 2, C.cyan, { arrow: 1 });
    g.text(x0, py - 16, 'dg.split.pa', { c: 'm' });
    g.box(x0, py, x1 - x0, h, C.cyan); g.box(x1, py, x2 - x1, h, C.gold);
    g.text((x0 + x1) / 2, py + h / 2, wide ? 'dg.split.pfn' : 'dg.split.pfnS', { a: 'middle', c: 'c' });
    g.text((x1 + x2) / 2, py + h / 2, wide ? 'dg.split.off' : 'dg.split.offS', { a: 'middle', c: 'g' });
    const ox = wide ? 610 : 280;
    g.line(ox, y + h, ox, py - 2, C.gold, { arrow: 1, dash: '5 4' });
    g.text(ox + 10, 140, 'dg.split.copy', { c: 'g' });
  } };
};
// the 4-level walk with CR3 (ch3). Schematic positions; bit fields per SDM §5.5
DG.walk = (L) => {
  const wide = L === 'w', names = ['PML4', 'PDPT', 'PD', 'PT'], ranges = [[47, 39], [38, 30], [29, 21], [20, 12]];
  if (wide) return { W: 720, H: 300, draw(g) {
    const fx = i => 140 + i * 112, fy = 30, fh = 36;
    g.text(20, fy + fh / 2, 'dg.split.va', { c: 'm' });
    for (let i = 0; i < 5; i++) {
      const col = i < 4 ? C.cyan : C.gold;
      g.box(fx(i), fy, 112, fh, col, { rx: 0 });
      g.text(fx(i) + 56, fy + fh / 2, i < 4 ? 'dg.walk.idx' : 'dg.walk.off', { a: 'middle', c: i < 4 ? 'c' : 'g', vars: i < 4 ? { hi: ranges[i][0], lo: ranges[i][1] } : {} });
    }
    const ty = 120, th = 110, tw = 92, ey = [150, 196, 168, 206];
    g.box(20, ty + 16, 90, 36, C.gold); g.text(65, ty + 34, 'dg.walk.cr3', { a: 'middle', c: 'g', mono: 1 });
    g.line(110, ty + 34, 148, ty + 34, C.gold, { arrow: 1 });
    for (let i = 0; i < 4; i++) {
      const x = 150 + i * 112, cx = x + tw / 2;
      g.box(x, ty, tw, th, C.mute, { a: 0.08 });
      g.text(x + 8, ty + 14, { raw: names[i] }, { mono: 1 });
      g.box(x + 6, ey[i] - 8, tw - 12, 16, C.cyan, { rx: 3, a: 0.35 });
      g.line(fx(i) + 56, fy + fh, x + tw - 16, ey[i] - 10, C.cyan, { arrow: 1, sw: 1.2 });
      if (i < 3) g.line(x + tw - 6, ey[i], x + 112 + 4, ey[i + 1], C.mute, { arrow: 1 });
      g.text(cx, ty + th + 22, 'dg.walk.e', { a: 'middle', c: 'm', w: tw, va: 'top' });
    }
    const px = 598, pw = 102;
    g.box(px, ty, pw, th, C.gold, { a: 0.08 }); g.text(px + pw / 2, ty + 14, 'dg.walk.page', { a: 'middle', c: 'g' });
    g.box(px + 6, 186, pw - 12, 18, C.gold, { rx: 3, a: 0.35 }); g.text(px + pw / 2, 214, 'dg.walk.data', { a: 'middle', c: 'g', w: pw, va: 'top' });
    g.line(150 + 3 * 112 + tw - 6, ey[3], px + 4, 190, C.mute, { arrow: 1 });
    g.line(fx(4) + 56, fy + fh, px + pw / 2, 184, C.gold, { arrow: 1, sw: 1.2, dash: '5 4' });
  } };
  return { W: 340, H: 470, draw(g) {
    const bw = [56, 56, 56, 56, 96], bx = [10, 66, 122, 178, 234];
    g.text(10, 14, 'dg.split.va', { c: 'm' });
    for (let i = 0; i < 5; i++) { const col = i < 4 ? C.cyan : C.gold; g.box(bx[i], 28, bw[i], 32, col, { rx: 0 }); g.text(bx[i] + bw[i] / 2, 44, { raw: i < 4 ? ranges[i][0] + '–' + ranges[i][1] : '11–0' }, { a: 'middle', mono: 1, c: i < 4 ? 'c' : 'g' }); }
    g.box(250, 84, 80, 30, C.gold); g.text(290, 99, 'dg.walk.cr3', { a: 'middle', c: 'g', mono: 1 });
    const row = i => 132 + i * 72, tx = 110, tw = 120;
    for (let i = 0; i < 4; i++) {
      const y = row(i);
      g.box(10, y + 10, 70, 30, C.cyan, { rx: 4 }); g.text(45, y + 25, { raw: ranges[i][0] + '–' + ranges[i][1] }, { a: 'middle', mono: 1, c: 'c' });
      g.line(80, y + 25, tx - 2, y + 25, C.cyan, { arrow: 1, sw: 1.2 });
      g.box(tx, y, tw, 50, C.mute, { a: 0.08 }); g.text(tx + 10, y + 14, { raw: names[i] }, { mono: 1 });
      g.box(tx + 6, y + 26, tw - 12, 14, C.cyan, { rx: 3, a: 0.35 });
      if (i < 3) g.line(tx + tw - 20, y + 40, tx + tw - 20, row(i + 1) - 2, C.mute, { arrow: 1 });
    }
    g.line(290, 114, tx + tw + 2, row(0) + 12, C.gold, { arrow: 1 });
    g.text(250, row(1) + 25, 'dg.walk.e', { c: 'm', w: 84, va: 'mid' });
    const y = row(4);
    g.box(10, y + 10, 70, 30, C.gold, { rx: 4 }); g.text(45, y + 25, { raw: '11–0' }, { a: 'middle', mono: 1, c: 'g' });
    g.line(80, y + 25, tx - 2, y + 25, C.gold, { arrow: 1, sw: 1.2, dash: '5 4' });
    g.box(tx, y, tw, 50, C.gold, { a: 0.08 }); g.text(tx + 10, y + 14, 'dg.walk.page', { c: 'g' });
    g.box(tx + 6, y + 26, tw - 12, 14, C.gold, { rx: 3, a: 0.35 });
    g.line(tx + tw - 20, row(3) + 40, tx + tw - 20, y - 2, C.mute, { arrow: 1 });
    g.text(250, y + 25, 'dg.walk.data', { c: 'g', w: 84, va: 'mid' });
  } };
};
// PTE bit layout (ch3), Table 5-20
DG.pte = (L) => {
  const wide = L === 'w', low = [['—', 11], ['—', 10], ['—', 9], ['G', 8], ['PAT', 7], ['D', 6], ['A', 5], ['PCD', 4], ['PWT', 3], ['U/S', 2], ['R/W', 1], ['P', 0]];
  const legend = ['dg.pte.P', 'dg.pte.RW', 'dg.pte.US', 'dg.pte.PWT', 'dg.pte.PCD', 'dg.pte.A', 'dg.pte.D', 'dg.pte.PAT', 'dg.pte.G'];
  if (wide) return { W: 720, H: 280, draw(g) {
    const y = 40, h = 40, seg = [[20, 80, C.red, { raw: 'XD' }, 'r'], [80, 170, C.violet, 'dg.pte.pk', 'v'], [170, 240, C.mute, 'dg.pte.ign', 'm'], [240, 560, C.cyan, 'dg.pte.pfn', 'c'], [560, 700, C.gold, 'dg.pte.low', 'g']];
    seg.forEach(([a, b, col, k, c]) => { g.box(a, y, b - a, h, col, { rx: 0, a: 0.14 }); g.text((a + b) / 2, y + h / 2, k, { a: 'middle', c }); });
    [['63', 22, 'start'], ['62', 82, 'start'], ['58', 172, 'start'], ['M−1', 242, 'start'], ['12', 556, 'end'], ['11', 564, 'start'], ['0', 698, 'end']].forEach(([s, x, a]) => g.text(x, 24, { raw: s }, { a, mono: 1, c: 'm' }));
    const ry = 120, cw = 680 / 12;
    g.line(560, y + h, 20, ry, C.gold, { dash: '4 4', sw: 1 }); g.line(700, y + h, 700, ry, C.gold, { dash: '4 4', sw: 1 });
    low.forEach(([s, b], i) => { const x = 20 + i * cw; g.box(x, ry, cw, 36, b > 8 ? C.mute : C.gold, { rx: 0, a: b > 8 ? 0.06 : 0.14 }); g.text(x + cw / 2, ry + 18, { raw: s }, { a: 'middle', mono: 1, c: b > 8 ? 'm' : '' }); g.text(x + cw / 2, ry + 50, { raw: String(b) }, { a: 'middle', mono: 1, c: 'm' }); });
    legend.forEach((k, i) => g.text(20 + (i % 3) * 230, 206 + Math.floor(i / 3) * 26, k, {}));
  } };
  return { W: 340, H: 380, draw(g) {
    const y = 34, h = 40, seg = [[10, 40, C.red, { raw: 'XD' }, 'r'], [40, 92, C.violet, 'dg.pte.pk', 'v'], [92, 134, C.mute, 'dg.pte.ign', 'm'], [134, 250, C.cyan, 'dg.pte.pfnS', 'c'], [250, 330, C.gold, { raw: '11–0' }, 'g']];
    seg.forEach(([a, b, col, k, c]) => { g.box(a, y, b - a, h, col, { rx: 0, a: 0.14 }); g.text((a + b) / 2, y + h / 2, k, { a: 'middle', c, mono: typeof k === 'object' }); });
    [['63', 10, 'start'], ['62', 42, 'start'], ['58', 94, 'start'], ['M−1', 136, 'start'], ['12', 247, 'end'], ['11', 253, 'start'], ['0', 330, 'end']].forEach(([s, x, a]) => g.text(x, 18, { raw: s }, { a, mono: 1, c: 'm' }));
    const cw = 320 / 6;
    g.line(250, y + h, 10, 100, C.gold, { dash: '4 4', sw: 1 }); g.line(330, y + h, 330, 100, C.gold, { dash: '4 4', sw: 1 });
    low.forEach(([s, b], i) => { const r = Math.floor(i / 6), x = 10 + (i % 6) * cw, yy = 100 + r * 70; g.box(x, yy, cw, 34, b > 8 ? C.mute : C.gold, { rx: 0, a: b > 8 ? 0.06 : 0.14 }); g.text(x + cw / 2, yy + 17, { raw: s }, { a: 'middle', mono: 1, c: b > 8 ? 'm' : '' }); g.text(x + cw / 2, yy + 48, { raw: String(b) }, { a: 'middle', mono: 1, c: 'm' }); });
    legend.forEach((k, i) => g.text(10 + (i % 2) * 165, 254 + Math.floor(i / 2) * 26, k, {}));
  } };
};
// TLB in front of the walk (ch4). Schematic
DG.tlb = (L) => {
  if (L === 'w') return { W: 720, H: 240, draw(g) {
    g.box(20, 60, 90, 50, C.mute, { a: 0.1 }); g.text(65, 85, 'dg.tlb.core', { a: 'middle' });
    g.line(110, 85, 218, 85, C.cyan, { arrow: 1 }); g.text(164, 68, 'dg.tlb.va', { a: 'middle', c: 'c' });
    g.box(220, 55, 120, 60, C.gold); g.text(280, 85, 'dg.tlb.tlb', { a: 'middle', c: 'g', weight: 700 });
    g.line(340, 85, 558, 85, C.green, { arrow: 1 }); g.text(450, 68, 'dg.tlb.hit', { a: 'middle', c: 'n' });
    g.box(560, 50, 140, 70, C.green, { a: 0.1 }); g.text(630, 85, 'dg.tlb.pa', { a: 'middle', w: 124, va: 'mid' });
    g.line(300, 115, 300, 168, C.red, { arrow: 1 }); g.text(310, 142, 'dg.tlb.miss', { c: 'r' });
    g.box(220, 170, 120, 44, C.red, { a: 0.1 }); g.text(280, 192, 'dg.tlb.walker', { a: 'middle' });
    g.line(340, 192, 458, 192, C.red, { arrow: 1 }); g.box(460, 170, 150, 44, C.mute, { a: 0.1 }); g.text(535, 192, 'dg.tlb.pt', { a: 'middle' });
    g.line(240, 170, 240, 117, C.gold, { arrow: 1, dash: '5 4' }); g.text(230, 142, 'dg.tlb.fill', { a: 'end', c: 'g' });
  } };
  return { W: 340, H: 420, draw(g) {
    g.box(110, 16, 120, 44, C.mute, { a: 0.1 }); g.text(170, 38, 'dg.tlb.core', { a: 'middle' });
    g.line(170, 60, 170, 108, C.cyan, { arrow: 1 }); g.text(180, 84, 'dg.tlb.va', { c: 'c' });
    g.box(110, 110, 120, 50, C.gold); g.text(170, 135, 'dg.tlb.tlb', { a: 'middle', c: 'g', weight: 700 });
    g.line(130, 160, 80, 318, C.green, { arrow: 1 }); g.text(10, 236, 'dg.tlb.hit', { c: 'n', w: 78, va: 'mid' });
    g.box(10, 320, 150, 70, C.green, { a: 0.1 }); g.text(85, 355, 'dg.tlb.pa', { a: 'middle', w: 136, va: 'mid' });
    g.line(215, 160, 245, 206, C.red, { arrow: 1 }); g.text(196, 190, 'dg.tlb.miss', { a: 'end', c: 'r' });
    g.box(190, 208, 140, 40, C.red, { a: 0.1 }); g.text(260, 228, 'dg.tlb.walker', { a: 'middle' });
    g.line(260, 248, 260, 288, C.red, { arrow: 1 }); g.box(190, 290, 140, 40, C.mute, { a: 0.1 }); g.text(260, 310, 'dg.tlb.pt', { a: 'middle' });
    g.line(310, 208, 236, 150, C.gold, { arrow: 1, dash: '5 4' }); g.text(330, 172, 'dg.tlb.fill', { a: 'end', c: 'g' });
  } };
};
// page-walk cache skipping levels (ch5)
DG.pwc = (L) => {
  const wide = L === 'w', names = ['PML4', 'PDPT', 'PD', 'PT'];
  return { W: wide ? 720 : 340, H: 214, draw(g) {
    const bw = wide ? 160 : 74, step = wide ? 175 : 82, x0 = wide ? 20 : 10;
    [[0, 'dg.pwc.full', [1, 1, 1, 1]], [1, 'dg.pwc.hit', [0, 0, 0, 1]]].forEach(([r, k, reads]) => {
      const ly = 22 + r * 106, by = ly + 18;
      g.text(x0, ly, k, { c: r ? 'g' : 'r' });
      reads.forEach((rd, i) => {
        const x = x0 + i * step;
        g.box(x, by, bw, 50, rd ? C.red : C.mute, { a: rd ? 0.16 : 0.06, dash: rd ? 'none' : '4 3' });
        g.text(x + bw / 2, by + 16, { raw: names[i] }, { a: 'middle', mono: 1, c: rd ? '' : 'm' });
        g.text(x + bw / 2, by + 35, rd ? 'dg.pwc.read' : 'dg.pwc.skip', { a: 'middle', c: rd ? 'r' : 'm' });
        if (i < 3) g.line(x + bw, by + 25, x + step - 1, by + 25, C.mute, { arrow: 1, sw: 1.2 });
      });
    });
  } };
};
// page-fault sequence (ch7)
DG.fault = (L) => {
  const wide = L === 'w';
  const X = wide ? [130, 380, 630] : [56, 178, 296], H = wide ? 340 : 500, rows = wide ? [66, 112, 160, 208, 252, 300] : [70, 150, 228, 306, 382, 454];
  return { W: wide ? 720 : 340, H, draw(g) {
    ['dg.fault.cpu', 'dg.fault.os', 'dg.fault.disk'].forEach((k, i) => { g.box(X[i] - (wide ? 60 : 44), 8, wide ? 120 : 88, 30, [C.cyan, C.gold, C.violet][i], { a: 0.14 }); g.text(X[i], 23, k, { a: 'middle', c: ['c', 'g', 'v'][i] }); g.line(X[i], 38, X[i], H - 10, C.line, { dash: '4 4', sw: 1.2 }); });
    const arrow = (n, from, to, key, col) => {
      const y = rows[n - 1], a = X[from], b = X[to];
      g.badge(wide ? 30 : 14, y, n, col);
      g.line(a + (b > a ? 4 : -4), y, b + (b > a ? -4 : 4), y, col, { arrow: 1 });
      g.text((a + b) / 2, y - (wide ? 13 : 14), key, { a: 'middle', w: wide ? 230 : 104, va: wide ? 'top' : 'bot' });
    };
    const self = (n, at, key, col, side) => {
      const y = rows[n - 1]; g.badge(wide ? 30 : 14, y, n, col); g.circle(X[at], y, 5, col, { solid: true });
      if (wide) g.text(X[at] + 14, y, key, {});
      else g.text(X[at] + 10, y, key, { w: X[at + 1] - X[at] - 16, va: 'mid' });
    };
    self(1, 0, 'dg.fault.s1', C.cyan, 'r');
    arrow(2, 0, 1, 'dg.fault.s2', C.red);
    arrow(3, 1, 2, 'dg.fault.s3', C.gold);
    arrow(4, 2, 1, 'dg.fault.s4', C.violet);
    self(5, 1, 'dg.fault.s5', C.gold);
    arrow(6, 1, 0, 'dg.fault.s6', C.green);
  } };
};
// copy-on-write before/after fork (ch9)
DG.cow = (L) => {
  const wide = L === 'w';
  return { W: wide ? 720 : 340, H: wide ? 330 : 640, draw(g) {
    const panel = (ox, oy, after) => {
      const px = [ox + 10, ox + 80], fx = [ox + 128, ox + 196], cx = [ox + 250, ox + 320], y0 = oy + 70, gap = 44;
      g.text(ox + 10, oy + 16, after ? 'dg.cow.after' : 'dg.cow.before', { c: after ? 'g' : '' , weight: 600 });
      g.text((px[0] + px[1]) / 2, oy + 44, 'dg.cow.parent', { a: 'middle', c: 'c' });
      g.text((fx[0] + fx[1]) / 2, oy + 44, 'dg.cow.frames', { a: 'middle', c: 'm' });
      g.text((cx[0] + cx[1]) / 2, oy + 44, 'dg.cow.child', { a: 'middle', c: 'v' });
      for (let i = 0; i < 4; i++) {
        const y = y0 + i * gap;
        g.box(px[0], y, px[1] - px[0], 30, C.cyan); g.text((px[0] + px[1]) / 2, y + 15, 'dg.cow.pg', { a: 'middle', c: 'c', vars: { i } });
        g.box(cx[0], y, cx[1] - cx[0], 30, C.violet); g.text((cx[0] + cx[1]) / 2, y + 15, 'dg.cow.pg', { a: 'middle', c: 'v', vars: { i } });
        g.box(fx[0], y + 3, fx[1] - fx[0], 24, C.mute, { rx: 4, a: 0.16 });
        g.line(px[1], y + 15, fx[0] - 2, y + 15, C.cyan, { arrow: 1, sw: 1.3 });
        if (after && i === 2) continue;
        g.line(cx[0], y + 15, fx[1] + 2, y + 15, C.violet, { arrow: 1, sw: 1.3 });
      }
      if (after) {
        const y = y0 + 4 * gap; g.box(fx[0], y + 3, fx[1] - fx[0], 24, C.gold, { rx: 4, a: 0.3 });
        g.line(cx[0], y0 + 2 * gap + 15, fx[1] + 2, y + 15, C.gold, { arrow: 1, sw: 1.6 });
        g.text(ox + 10, y0 + 4 * gap + 58, 'dg.cow.copy', { c: 'g', w: 320 });
      } else g.text(ox + 10, y0 + 4 * gap + 58, 'dg.cow.ro', { c: 'm', w: 320 });
    };
    if (wide) { panel(10, 0, false); panel(370, 0, true); g.line(360, 20, 360, 310, C.line, { sw: 1 }); }
    else { panel(0, 0, false); panel(0, 320, true); }
  } };
};
// the 2D walk grid, 4-level guest in 4-level host (ch11)
DG.nested = (L) => {
  const wide = L === 'w', n = 4, m = 4;
  return { W: wide ? 720 : 340, H: wide ? 340 : 360, draw(g) {
    const lx = wide ? 20 : 8, cx0 = wide ? 130 : 84, cw = wide ? 108 : 46, step = wide ? 116 : 50, cy0 = wide ? 52 : 58, ch = wide ? 38 : 36, rstep = wide ? 46 : 44;
    for (let j = 0; j <= n; j++) g.text(cx0 + j * step + cw / 2, wide ? 26 : 14, j < n ? 'dg.nested.g' : 'dg.nested.data', { a: 'middle', c: j < n ? 'c' : 'g', vars: { i: j + 1 }, w: wide ? 0 : cw, va: 'top' });
    for (let i = 0; i <= m; i++) g.text(lx, cy0 + i * rstep + ch / 2, i < m ? 'dg.nested.h' : 'dg.nested.gl', { c: i < m ? 'r' : 'c', vars: { i: i + 1 } });
    let k = 0;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) {
      const x = cx0 + j * step, y = cy0 + i * rstep, guest = i === m, data = j === n && guest;
      g.box(x, y, cw, ch, data ? C.gold : guest ? C.cyan : C.red, { rx: 5, a: 0.18 });
      if (!data) k++;
      g.text(x + cw / 2, y + ch / 2, data ? 'dg.nested.data' : { raw: String(k) }, { a: 'middle', mono: !data, c: data ? 'g' : guest ? 'c' : 'r' });
    }
    g.text(lx, cy0 + (m + 1) * rstep + 20, 'dg.nested.total', { mono: 0 });
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

/* ───────── 01 contiguous vs paged ───────── */
(() => {
  const cv = $('#fgCv'), sM = $('#fgM'), mean = () => M.FRAG.means[+sM.value];
  const memo = new Map(), run = () => { const m = mean(); if (!memo.has(m)) memo.set(m, M.frag(m, { keep: true })); return memo.get(m); };
  let tpos = reduce ? M.FRAG.steps - 1 : 0, playing = !reduce, shown = -1;
  const PAL = [C.cyan, '#3f93ad'];
  const sim = reg(cv, {
    step(dt) {
      if (playing) { tpos = Math.min(M.FRAG.steps - 1, tpos + dt * 40); if (tpos >= M.FRAG.steps - 1) playing = false; }
      const k = Math.floor(tpos);
      if (k !== shown || this.dirty) { shown = k; this.dirty = false; this.draw(); text(); }
    },
    draw() {
      const { c, w, h } = fit(cv), r = run(), k = Math.floor(tpos), H = r.hist[k], N = M.FRAG.ram, L = 8, R = w - 8, cell = (R - L) / N;
      const sh = Math.min(54, h * 0.17), y1 = 30, y2 = y1 + sh + 70, fy1 = y1 + sh + 18, fy2 = y2 + sh + 18;
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch1.cv.bb'), L, y1 - 12); c.fillText(t('ch1.cv.pg'), L, y2 - 12);
      c.textAlign = 'right'; c.fillText(t('ch1.cv.step', { t: fmt(k + 1, 0), n: fmt(M.FRAG.steps, 0) }), R, y1 - 12);
      for (const [arr, y] of [[H.bb, y1], [H.pg, y2]]) for (let i = 0; i < N; i++) { const id = arr[i]; c.fillStyle = id < 0 ? C.dimfill : PAL[id % 2]; c.fillRect(L + i * cell, y, Math.max(1, cell + 0.3), sh); }
      // rejected processes along a time axis under each strip
      const X = s => L + (R - L) * s / (M.FRAG.steps - 1);
      for (const [key, y] of [['failB', fy1], ['failP', fy2]]) {
        c.strokeStyle = C.line; c.beginPath(); c.moveTo(L, y); c.lineTo(R, y); c.stroke();
        let prev = 0; for (let s = 0; s <= k; s++) { const v = r.hist[s][key]; if (v > prev) { c.fillStyle = C.red; c.beginPath(); c.arc(X(s), y, 3, 0, 6.283); c.fill(); } prev = v; }
        c.strokeStyle = C.gold; c.beginPath(); c.moveTo(X(k), y - 6); c.lineTo(X(k), y + 6); c.stroke();
      }
    }
  });
  function text() {
    const r = run(), k = Math.floor(tpos), H = r.hist[k], z = M.say.frag(mean(), k);
    put('#fgMo', size(mean() * MiB));
    put('#fgB', fmt(H.failB, 0)); put('#fgP', fmt(H.failP, 0)); put('#fgF', size(H.free * MiB)); put('#fgL', size(H.largest * MiB));
    putHTML('#fgSay', t(z.key, { mean: size(mean() * MiB), t: fmt(k + 1, 0), failB: fmt(H.failB, 0), failP: fmt(H.failP, 0), free: size(H.free * MiB), largest: size(H.largest * MiB) }));
  }
  sim.text = text;
  sM.addEventListener('input', () => { tpos = reduce ? M.FRAG.steps - 1 : 0; playing = !reduce; sim.dirty = true; text(); });
  $('#fgPlay').addEventListener('click', () => { tpos = reduce ? M.FRAG.steps - 1 : 0; playing = !reduce; sim.dirty = true; text(); });
  $('#fgEnd').addEventListener('click', () => { tpos = M.FRAG.steps - 1; playing = false; sim.dirty = true; text(); });
  text();
})();

/* ───────── 02 flat table vs tree ───────── */
(() => {
  const sV = $('#tbV'), sH = $('#tbH'), page = () => +radioVal('tbP'), heap = () => M.LAYOUT.heaps[+sH.value];
  function text() {
    const va = +sV.value, p = page(), r = M.treeTables(va, p, heap()), z = M.say.table(va, p, heap()), o = Math.round(Math.log2(p));
    put('#tbVo', t('ch2.vafmt', { v: va })); put('#tbHo', size(heap()));
    // level widths, top level gets the remainder
    const rest = va - o, b = o - 3, widths = []; let left = rest; for (let i = 0; i < r.levels; i++) { const wv = i === 0 ? rest - b * (r.levels - 1) : b; widths.push(wv); left -= wv; }
    putHTML('#tbBits', widths.map((wv, i) => `<span class="x"><i>${esc(t('ch2.bits.lv', { i: i + 1, n: wv }))}</i><b>${'·'.repeat(Math.min(wv, 13))}</b></span>`).join('') + `<span class="o"><i>${esc(t('ch2.bits.off', { n: o }))}</i><b>${'·'.repeat(Math.min(o, 13))}</b></span>`);
    put('#tbF', size(r.flat)); put('#tbL', t('u.levels', { v: fmt(r.levels, 0) })); put('#tbN', t('u.tables', { v: fmt(r.tables, 0) })); put('#tbB', size(r.bytes));
    putHTML('#tbSay', t(z.key, { va: t('ch2.vafmt', { v: va }), page: size(p), flat: size(r.flat), levels: t('u.levels', { v: fmt(r.levels, 0) }), tables: t('u.tables', { v: fmt(r.tables, 0) }), bytes: size(r.bytes), mapped: size(r.mapped) }));
  }
  sV.addEventListener('input', text); sH.addEventListener('input', text); onAll(radios('tbP'), 'change', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 03 the walk ───────── */
(() => {
  const inp = $('#wkA'), lv5 = () => radioVal('wkL') === '5', acc = () => radioVal('wkX');
  const span = (cls, label, body) => `<span class="${cls}"><i>${esc(label)}</i><b>${body}</b></span>`;
  function bitsOf(va, hi, lo) { let s = ''; for (let b = hi; b >= lo; b--) s += (va >> BigInt(b)) & 1n ? '1' : '0'; return s; }
  function text() {
    const va = M.parseVA(inp.value);
    if (va == null) { $('#wkBits').textContent = ''; $('#wkSteps').textContent = ''; ['#wkPA', '#wkRefs', '#wkPg', '#wkF'].forEach(s => put(s, t('u.none'))); putHTML('#wkSay', t('ch3.say.bad')); return; }
    const five = lv5(), w = M.walk(va, five, acc()), names = M.LEVEL_NAMES[five ? 5 : 4], top = five ? 57 : 48;
    let chips = span('p', t('ch3.bits.sign'), bitsOf(va, 63, top));
    names.forEach((n, i) => { const lo = (names.length - 1 - i) * 9 + 12; chips += span('x', t('ch3.bits.f', { name: n, n: Number((va >> BigInt(lo)) & 511n) }), bitsOf(va, lo + 8, lo)); });
    chips += span('o', t('ch3.bits.off', { n: Number(va & 4095n) }), bitsOf(va, 11, 0));
    putHTML('#wkBits', chips);
    const lines = [];
    if (w.canonical) lines.push(`<span class="g">${esc(t('ch3.step.cr3', { base: hexB(M.toy(five).root << 12n) }))}</span>`);
    w.steps.forEach((s, i) => {
      lines.push(`<span class="st">${esc(t('ch3.step.row', { name: s.level, idx: s.idx, addr: hexB(s.addr), entry: hexB(s.entry, 16) }))}</span>`);
      const f = s.flags;
      if (!f.P) { lines.push(`<span class="r">${esc(t('ch3.step.np'))}</span>`); return; }
      const fl = ['P', 'RW', 'US', 'A', 'D', 'PS', 'XD'].filter(k => k !== 'PS' || s.ps || s.level === 'PD').map(k => `${k === 'RW' ? 'R/W' : k === 'US' ? 'U/S' : k}=${f[k]}`).join(' ');
      lines.push(`<span class="m">${esc(t('ch3.step.flags', { flags: fl }))}</span>`);
      if (s.ps) lines.push(`<span class="c">${esc(t('ch3.step.leaf2m', { pfn: hexB(f.pfn << 12n) }))}</span>`);
      else if (s.leaf) lines.push(`<span class="c">${esc(t('ch3.step.leaf4k', { pfn: hexB(f.pfn) }))}</span>`);
      else lines.push(`<span class="m">${esc(t('ch3.step.next', { next: hexB(f.pfn << 12n) }))}</span>`);
    });
    if (w.pa != null && !w.fault) lines.push(`<span class="g">${esc(t('ch3.step.pa', { pa: hexB(w.pa) }))}</span>`);
    putHTML('#wkSteps', lines.join('\n'));
    put('#wkPA', w.pa != null && !w.fault ? hexB(w.pa) : t('u.none'));
    put('#wkRefs', t('u.refs', { v: fmt(w.steps.length, 0) }));
    put('#wkPg', w.pageBytes ? size(w.pageBytes) : t('u.none'));
    put('#wkF', !w.fault ? t('ch3.f.none') : w.fault === 'noncanon' ? t('ch3.f.noncanon') : t('ch3.f.pf'));
    const z = M.say.walk(w), lastLevel = w.steps.length ? w.steps[w.steps.length - 1].level : '';
    putHTML('#wkSay', t(z.key, { pa: w.pa != null ? hexB(w.pa) : '', refs: fmt(w.steps.length, 0), level: lastLevel, bits: top }));
  }
  inp.addEventListener('input', text);
  onAll(radios('wkPre'), 'change', () => { inp.value = M.TOY.presets[radioVal('wkPre')]; text(); });
  onAll(radios('wkL'), 'change', text); onAll(radios('wkX'), 'change', text);
  reg([], { draw() {}, text }); text();
})();

/* ───────── 04 TLB ───────── */
const PCOL = { 4096: C.red, 16384: C.violet, 2097152: C.cyan };
(() => {
  const cv = $('#tlCv'), sW = $('#tlW'), sE = $('#tlE'), tr = () => radioVal('tlT'), pg = () => +radioVal('tlP');
  const W = () => M.TLB.sizes[+sW.value], E = () => M.TLB.entries[+sE.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), n = M.TLB.entries.length, f = frame(w, h, [30, 16, 42, 52], 0, n - 1, 0, 1);
    yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => pct(v, 0)); axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, M.TLB.entries.map((e, i) => [f.X(i), fmt(e, 0)]), f.B + 12, w);
    for (const p of M.TLB.pages) path(c, M.TLB.entries.map((e, i) => [i, M.tlb(tr(), W(), e, p).missRate]), f.X, f.Y, PCOL[p], p === pg() ? 2.8 : 1.6);
    dot(c, f.X(+sE.value), f.Y(M.tlb(tr(), W(), E(), pg()).missRate), C.gold, 5.5);
  } });
  function text() {
    const r = M.tlb(tr(), W(), E(), pg()), z = M.say.tlb(tr(), W(), E(), pg());
    put('#tlWo', size(W())); put('#tlEo', t('u.entries', { v: fmt(E(), 0) }));
    put('#tlM', pct(r.missRate, r.missRate < 0.01 ? 2 : 1)); put('#tlR', size(r.reach)); put('#tlN', t('u.pages', { v: fmt(r.Np, 0) })); put('#tlK', fmt(r.missRate * 1000, r.missRate < 0.01 ? 1 : 0));
    putHTML('#tlSay', t(z.key, { W: size(W()), pages: t('u.pages', { v: fmt(r.Np, 0) }), entries: t('u.entries', { v: fmt(E(), 0) }), reach: size(r.reach), miss: pct(r.missRate, r.missRate < 0.01 ? 2 : 1), page: size(pg()), per: fmt(r.perPage || 0, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); sE.addEventListener('input', go); onAll(radios('tlT'), 'change', go); onAll(radios('tlP'), 'change', go);
  text();
})();

/* ───────── 05 walk cost ───────── */
(() => {
  const cv = $('#wcCv'), sW = $('#wcW'), cb = $('#wcC'), five = () => radioVal('wcL') === '5', W = () => M.WALK.sizes[+sW.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), a = M.walkC(W(), 4096, false, five()), b = M.walkC(W(), 4096, true, five());
    const rows = [[t('ch5.bar.nopwc'), a.worst, C.red, cyc(a.worst)], ['', a.best, C.gold, cyc(a.best)], [t('ch5.bar.pwc'), b.worst, C.red, cyc(b.worst)], ['', b.best, C.gold, cyc(b.best)]];
    bars(c, w, h, rows, Math.max(a.worst, 20) * 1.05, cb.checked ? 2 : 0);
  } });
  function text() {
    const r = M.walkC(W(), 4096, cb.checked, five()), z = M.say.walkCost(W(), 4096, cb.checked, five());
    put('#wcWo', size(W()));
    put('#wcM', pct(r.missRate, r.missRate < 0.01 ? 2 : 0)); put('#wcR', t('u.refs', { v: fmt(r.perWalk, 2) })); put('#wcB', cyc(r.best)); put('#wcX', cyc(r.worst));
    putHTML('#wcSay', t(z.key, { W: size(W()), miss: pct(r.missRate, r.missRate < 0.01 ? 2 : 0), refs: t('u.refs', { v: fmt(r.perWalk, 2) }), best: cyc(r.best), worst: cyc(r.worst), levels: t('u.levels', { v: r.levels }), reach: size(r.reach) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); cb.addEventListener('change', go); onAll(radios('wcL'), 'change', go);
  text();
})();

/* ───────── 06 huge pages ───────── */
(() => {
  const cv = $('#hgCv'), sW = $('#hgW'), pg = () => +radioVal('hgP'), sp = () => radioVal('hgS') === '1', W = () => M.HUGE.sizes[+sW.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), rs = M.HUGE.pages.map(p => [p, M.huge(W(), p, sp())]);
    const max = Math.max(...rs.map(([, r]) => r.worst)) * 1.05;
    bars(c, w, h, rs.map(([p, r]) => [t('ch6.bar', { page: size(p) }), r.worst, p === 4096 ? C.red : p === 2097152 ? C.cyan : C.green, cyc(r.worst)]), max, M.HUGE.pages.indexOf(pg()));
  } });
  function text() {
    const r = M.huge(W(), pg(), sp()), z = M.say.huge(W(), pg(), sp());
    put('#hgWo', size(W()));
    put('#hgM', pct(r.missRate, r.missRate < 0.01 ? 2 : 0)); put('#hgR', size(r.reach)); put('#hgC', cyc(r.worst)); put('#hgA', t('ch6.allocfmt', { a: size(r.alloc), t: size(r.touched) }));
    putHTML('#hgSay', t(z.key, { page: size(pg()), W: size(W()), reach: size(r.reach), miss: pct(r.missRate, r.missRate < 0.01 ? 2 : 0), worst: cyc(r.worst), alloc: size(r.alloc), touched: size(r.touched), bloat: t('u.x', { v: fmt(r.bloat, 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sW.addEventListener('input', go); onAll(radios('hgP'), 'change', go); onAll(radios('hgS'), 'change', go);
  text();
})();

/* ───────── 07 page faults ───────── */
function us(x) { return x >= 1000 ? t('u.ms', { v: fmt(x / 1000, 1) }) : x >= 1 ? t('u.us', { v: fmt(x, x >= 10 ? 0 : 2) }) : t('u.ns', { v: fmt(x * 1000, 0) }); }
function faultRows() {
  const tb = $('#ftRows'); tb.textContent = '';
  const tm = M.FACTS.dramNs / 1000;
  [['ch7.r.dram', tm, 'ch7.src.dram'], ['ch7.r.minor', M.faultUs('minor'), 'ch7.src.minor'], ['ch7.r.nvme', M.faultUs('nvme'), 'ch7.src.nvme'], ['ch7.r.hdd', M.faultUs('hdd'), 'ch7.src.hdd']].forEach(([k, v, s], i) => {
    const tr = document.createElement('tr'); if (i === 1) tr.className = 'hi';
    const cells = [t(k), us(v), t('u.x', { v: fmt(v / tm, 0) }), t(s)], hk = ['ch7.th.kind', 'ch7.th.time', 'ch7.th.x', 'ch7.th.src'];
    cells.forEach((x, j) => { const td = document.createElement('td'); td.textContent = x; if (j) td.dataset.h = t(hk[j]); tr.appendChild(td); });
    tb.appendChild(tr);
  });
}
(() => {
  const cv = $('#efCv'), sP = $('#efP'), kind = () => radioVal('efK'), p = () => Math.pow(10, +sP.value);
  const KC = { minor: C.green, nvme: C.cyan, hdd: C.red };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), f = frame(w, h, [30, 16, 42, 58], -8, -2, 0, 4);
    yTicks(c, f, [0, 1, 2, 3, 4], v => t('u.x', { v: fmt(Math.pow(10, v), 0) })); axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, [-8, -7, -6, -5, -4, -3, -2].map(k => [f.X(k), pow10(k)]), f.B + 12, w);
    for (const k of M.FAULT.kinds) { const pts = []; for (let e = -8; e <= -2.0001 + 0.05; e += 0.05) pts.push([e, Math.min(4, Math.log10(M.eat(Math.pow(10, e), k).slow))]); path(c, pts, f.X, f.Y, KC[k], k === kind() ? 2.8 : 1.6); }
    dot(c, f.X(+sP.value), f.Y(Math.min(4, Math.log10(M.eat(p(), kind()).slow))), C.gold, 5.5);
  } });
  function text() {
    const r = M.eat(p(), kind()), z = M.say.eat(p(), kind()), one = fmt(Math.round(1 / p()), 0);
    put('#efPo', t('ch7.pfmt', { v: one }));
    put('#efT', us(r.tf)); put('#efE', us(r.eat)); put('#efS', t('u.x', { v: fmt(r.slow, r.slow < 10 ? 2 : 0) })); put('#ef10', t('u.oneIn', { v: fmt(Math.round(1 / r.p10), 0) }));
    putHTML('#efSay', t(z.key, { one, kind: t('ch7.kind.' + kind()), eat: us(r.eat), slow: t('u.x', { v: fmt(r.slow, r.slow < 10 ? 2 : 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sP.addEventListener('input', go); onAll(radios('efK'), 'change', go);
  text();
})();

/* ───────── 08 replacement ───────── */
(() => {
  const cv = $('#rpCv'), sF = $('#rpF'), str = () => radioVal('rpS'), pol = () => radioVal('rpPo');
  const PC = { fifo: C.red, clock: C.violet, lru: C.cyan, opt: C.green };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), cu = M.curve(str()), max = Math.max(...cu.fifo, ...cu.lru, ...cu.clock) + 1, f = frame(w, h, [30, 16, 42, 46], 1, M.REF.maxFrames, 0, max);
    const step = max > 24 ? 10 : 5, ys = []; for (let v = 0; v <= max; v += step) ys.push(v);
    yTicks(c, f, ys, v => fmt(v, 0)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
    c.fillStyle = C.mute; spacedTicks(c, Array.from({ length: M.REF.maxFrames }, (_, i) => [f.X(i + 1), String(i + 1)]), f.B + 12, w);
    // draw OPT and LRU first so FIFO stays visible where they coincide
    for (const p of ['opt', 'lru', 'clock', 'fifo']) path(c, cu[p].map((v, i) => [i + 1, v]), f.X, f.Y, PC[p], p === pol() ? 2.8 : 1.6, p === 'clock' ? [6, 4] : null);
    dot(c, f.X(+sF.value), f.Y(cu[pol()][+sF.value - 1]), C.gold, 5.5);
  } });
  function text() {
    const F = +sF.value, s = str(), z = M.say.repl(s, F, pol()), r = z.v;
    put('#rpFo', fmt(F, 0));
    put('#rpFifo', fmt(M.run(s, F, 'fifo').faults, 0)); put('#rpClock', fmt(M.run(s, F, 'clock').faults, 0)); put('#rpLru', fmt(M.run(s, F, 'lru').faults, 0)); put('#rpOpt', fmt(M.run(s, F, 'opt').faults, 0));
    putHTML('#rpTrail', r.trail.map(x => `<span role="listitem" class="${x.hit ? 'h' : 'm'}">${x.p}</span>`).join(''));
    putHTML('#rpSay', t(z.key, { pol: t('ch8.name.' + pol()), f: fmt(F, 0), f1: fmt(F - 1, 0), faults: fmt(r.faults, 0), prev: r.prev == null ? '' : fmt(r.prev, 0), n: fmt(r.n, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sF.addEventListener('input', go); onAll(radios('rpS'), 'change', go); onAll(radios('rpPo'), 'change', go);
  text();
})();

/* ───────── 09 copy-on-write ───────── */
(() => {
  const cv = $('#cwCv'), sC = $('#cwC'), sG = $('#cwG'), c_ = () => +sC.value / 100, g_ = () => +sG.value / 100;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), r = M.cow(c_(), g_());
    bars(c, w, h, [[t('ch9.bar.eager'), r.eagerCopies, C.red, t('u.pages', { v: fmt(r.eagerCopies, 0) })], [t('ch9.bar.cow'), r.copies, C.gold, t('u.pages', { v: fmt(r.copies, 0) })]], r.N * 1.02, 1);
  } });
  function text() {
    const r = M.cow(c_(), g_()), z = M.say.cow(c_(), g_());
    put('#cwCo', pct(c_(), 0)); put('#cwGo', pct(g_(), 0));
    put('#cwE', fmt(r.eagerCopies, 0)); put('#cwK', fmt(r.copies, 0)); put('#cwF', fmt(r.faults, 0)); put('#cwM', size(r.memCow * M.COW.page));
    putHTML('#cwSay', t(z.key, { c: pct(c_(), 0), g: pct(g_(), 0), copies: fmt(r.copies, 0), faults: fmt(r.faults, 0), eager: fmt(r.eagerCopies, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sC.addEventListener('input', go); sG.addEventListener('input', go);
  text();
})();

/* ───────── 10 context switches, PCID, KPTI ───────── */
(() => {
  const cv = $('#cxCv'), sK = $('#cxK'), sS = $('#cxS'), cb = $('#cxT'), mode = () => radioVal('cxM'), S = () => M.CTX.S[+sS.value];
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), K = +sK.value, cfg = [['ch10.bar.tag', 'tagged', false], ['ch10.bar.flush', 'flush', false], ['ch10.bar.tagK', 'tagged', true], ['ch10.bar.flushK', 'flush', true]];
    const rs = cfg.map(([k, m, kp]) => [k, M.ctxM(K, m, kp, S()), m, kp]);
    const max = Math.max(60, ...rs.map(r => r[1].missPer1k)) * 1.05, hi = rs.findIndex(r => r[2] === mode() && r[3] === cb.checked);
    bars(c, w, h, rs.map(([k, r, m]) => [t(k), r.missPer1k, m === 'tagged' ? C.cyan : C.red, fmt(r.missPer1k, r.missPer1k < 10 ? 1 : 0)]), max, hi);
  } });
  function text() {
    const K = +sK.value, r = M.ctxM(K, mode(), cb.checked, S()), z = M.say.ctx(K, mode(), cb.checked, S());
    put('#cxKo', t('u.procs', { v: fmt(K, 0) })); put('#cxSo', t('ch10.sfmt', { v: fmt(S(), 0) }));
    put('#cxMi', fmt(r.missPer1k, r.missPer1k < 10 ? 1 : 0)); put('#cxC', fmt(r.cr3Per1k, 2)); put('#cxY', cyc(r.cr3Cycles, 0));
    putHTML('#cxSay', t(z.key, { K: fmt(K, 0), miss: fmt(r.missPer1k, r.missPer1k < 10 ? 1 : 0), cr3: fmt(r.cr3Per1k, 1), cyc: cyc(r.cr3Cycles, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sK.addEventListener('input', go); sS.addEventListener('input', go); cb.addEventListener('change', go); onAll(radios('cxM'), 'change', go);
  text();
})();

/* ───────── 11 nested walk ───────── */
(() => {
  function text() {
    const n = +radioVal('nsG'), mh = +radioVal('nsH'), r = M.nested(n, mh), z = M.say.nested(mh === 0 ? 0 : n, mh);
    const grid = $('#nsGrid'); grid.style.gridTemplateColumns = `minmax(0,1.3fr) repeat(${n + 1}, minmax(0,1fr))`;
    let html = '<span class="x"></span>';
    for (let j = 0; j <= n; j++) html += `<span class="x">${esc(j < n ? t('ch11.grid.g', { i: j + 1 }) : t('ch11.grid.data'))}</span>`;
    let k = 0; const cells = [];
    for (let j = 0; j <= n; j++) { cells[j] = []; for (let i = 0; i <= mh; i++) { const guest = i === mh, data = j === n && guest; if (!data) k++; cells[j][i] = data ? t('ch11.grid.data') : String(k); } }
    for (let i = 0; i <= mh; i++) {
      html += `<span class="x">${esc(i < mh ? t('ch11.grid.h', { i: i + 1 }) : t('ch11.grid.gl'))}</span>`;
      for (let j = 0; j <= n; j++) { const guest = i === mh, data = j === n && guest; html += `<span class="${data ? 'd' : guest ? 'g' : 'h'}">${esc(cells[j][i])}</span>`; }
    }
    putHTML('#nsGrid', html);
    const refs = mh === 0 ? n : r.refs;
    put('#nsR', t('u.refs', { v: fmt(refs, 0) })); put('#nsN', t('u.refs', { v: fmt(n, 0) })); put('#nsX', t('u.x', { v: fmt(refs / n, 2) }));
    putHTML('#nsSay', t(z.key, { n, m: mh, refs: fmt(refs, 0), x: t('u.x', { v: fmt(refs / n, 2) }) }));
  }
  onAll(radios('nsG'), 'change', text); onAll(radios('nsH'), 'change', text);
  reg([], { draw() {}, text }); text();
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
