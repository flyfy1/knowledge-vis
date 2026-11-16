/* How SATA works: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.SataModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const MONO = '12px ui-monospace,Menlo,Consolas,monospace';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── language ─────────
   copy.en.js may be a same-keys stub copied from zh while the translation is pending; it then sets
   window.ESSAY_COPY.enStub = true and the page treats English as absent (falls back to zh). */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
const SEP = () => (effLang() === 'zh' ? '' : ' ');
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
// a duration in seconds as text with its unit
function dur(sec, d) { const u = M.tunit(sec); return t('u.' + u.u, { v: fmt(u.v, d == null ? (Math.abs(u.v) >= 100 ? 0 : Math.abs(u.v) >= 10 ? 1 : 2) : d) }); }
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
    line(x1, y1, x2, y2, col, o) { o = o || {}; S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none', 'marker-start': o.both ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    path(d, col, o) { o = o || {}; S('path', { d, fill: o.fill ? tint(o.fill, o.a == null ? 0.13 : o.a) : 'none', stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; S('circle', { cx, cy, r, fill: o.solid ? col : o.none ? 'none' : tint(col, o.a == null ? 0.14 : o.a), stroke: col, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none' }, svg); },
    // text: key (or {raw}), position, options: a = start|middle|end, c = colour class, w = wrap width, vars
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, o.vars);
      const e = S('text', { x, y, 'font-size': o.fs || FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: (o.c || '') + (o.mono ? ' mono' : '') }, svg);
      e.textContent = s; if (o.w) { e.dataset.w = o.w; e.dataset.va = o.va || 'top'; } if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    },
    swatch(x, y, col) { g.box(x, y - 6, 12, 12, col, { solid: true, rx: 3 }); },
    // a numbered marker (narrow layouts list what each number is underneath)
    num(x, y, n, col) { g.circle(x, y, 10, col || C.ink, { solid: true, sw: 1 }); g.text(x, y + 0.5, { raw: String(n) }, { a: 'middle', c: 'k', fs: 13.5, weight: 700 }); }
  };
  return g;
}
function arrowDefs(svg) {
  const d = S('defs', {}, svg);
  for (const col of [C.mute, C.gold, C.cyan, C.red, C.green, C.violet, C.ink]) {
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
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
const arc = (cx, cy, r, d0, d1) => { const [x0, y0] = pt(cx, cy, r, d0), [x1, y1] = pt(cx, cy, r, d1); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${Math.abs(d1 - d0) > 180 ? 1 : 0},${d1 > d0 ? 0 : 1} ${x1.toFixed(1)},${y1.toFixed(1)}`; };
const hex2 = v => v.toString(16).toUpperCase().padStart(2, '0') + 'h';

// the layers on each side of the cable; host cyan, drive violet (ch1); schematic
DG.stack = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 410 : 516;
  const rows = ['cmd', 'hci', 'tr', 'link', 'phy'];
  return { W, H, draw(g) {
    if (wide) {
      const hx = 10, dx = 460, cw = 250, y0 = 44, rh = 62, bh = 52;
      g.text(hx + cw / 2, 20, 'dg.stack.host', { a: 'middle', c: 'c', weight: 600 });
      g.text(dx + cw / 2, 20, 'dg.stack.dev', { a: 'middle', c: 'v', weight: 600 });
      g.box(hx - 4, y0 + 2 * rh - 6, dx + cw - hx + 8, 3 * rh + 2, C.gold, { a: 0.05, dash: '5 4', rx: 10 });
      rows.forEach((k, i) => {
        const y = y0 + i * rh;
        g.box(hx, y, cw, bh, C.cyan, { rx: 6, a: 0.1 }); g.text(hx + cw / 2, y + bh / 2, 'dg.stack.' + k, { a: 'middle', w: cw - 14, va: 'mid' });
        if (k === 'hci') { g.box(dx, y, cw, bh, C.mute, { rx: 6, a: 0, dash: '4 3', sw: 1 }); g.text(dx + cw / 2, y + bh / 2, 'dg.stack.nohci', { a: 'middle', c: 'm', w: cw - 14, va: 'mid' }); }
        else { g.box(dx, y, cw, bh, C.violet, { rx: 6, a: 0.1 }); g.text(dx + cw / 2, y + bh / 2, 'dg.stack.' + k, { a: 'middle', w: cw - 14, va: 'mid' }); }
        if (k !== 'hci' && k !== 'phy') g.line(hx + cw + 6, y + bh / 2, dx - 6, y + bh / 2, C.mute, { dash: '4 4', sw: 1.2, arrow: 1, both: 1 });
      });
      g.text(360, y0 + rh + bh / 2, 'dg.stack.peer', { a: 'middle', c: 'm', w: 180, va: 'mid' });
      const yp = y0 + 4 * rh + bh / 2;
      g.line(hx + cw + 4, yp - 5, dx - 4, yp - 5, C.ink, { sw: 2.2, arrow: 1 });
      g.line(dx - 4, yp + 5, hx + cw + 4, yp + 5, C.ink, { sw: 2.2, arrow: 1 });
      g.text(360, y0 + 5 * rh + 14, 'dg.stack.wire', { a: 'middle' });
      g.text(hx, y0 + 5 * rh + 44, 'dg.stack.band', { c: 'g' });
    } else {
      // one column: a cyan bar on the left = present at the host, a violet bar on the right = present at the drive
      const x = 6, w = 328, y0 = 52, rh = 70, bh = 60;
      g.text(x, 20, 'dg.stack.host', { c: 'c', weight: 600 }); g.text(x + w, 20, 'dg.stack.dev', { a: 'end', c: 'v', weight: 600 });
      g.box(x - 3, y0 + 2 * rh - 5, w + 6, 3 * rh, C.gold, { a: 0.05, dash: '5 4', rx: 10 });
      rows.forEach((k, i) => {
        const y = y0 + i * rh;
        g.box(x + 10, y, w - 20, bh, C.mute, { rx: 6, a: 0.08, sw: 1 });
        g.box(x, y, 8, bh, C.cyan, { solid: true, rx: 3 });
        if (k === 'hci') g.box(x + w - 8, y, 8, bh, C.mute, { rx: 3, a: 0, dash: '3 3', sw: 1 }); else g.box(x + w - 8, y, 8, bh, C.violet, { solid: true, rx: 3 });
        g.text(x + w / 2, y + bh / 2, 'dg.stack.' + k, { a: 'middle', w: w - 40, va: 'mid' });
      });
      g.text(x, y0 + 5 * rh + 6, 'dg.stack.band', { c: 'g', w });
      g.text(x, y0 + 5 * rh + 44, 'dg.stack.nbars', { c: 'm', w });
    }
  } };
};
// parallel ATA's 16 data lines and a strobe vs SATA's two pairs (ch2); schematic
DG.wires = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 330 : 540;
  const U = M.UDMA, S = M.SPEC;
  return { W, H, draw(g) {
    const pata = (ox, oy) => {
      g.text(ox, oy, 'dg.wires.pata', { c: 'm', weight: 600, w: 320, vars: { n: U.dataLines } });
      const x0 = ox + 46, x1 = ox + 276, y0 = oy + 30, dy = 9;
      g.box(ox, y0 - 6, 40, U.dataLines * dy + 30, C.mute, { rx: 4, a: 0.12 }); g.box(x1 + 6, y0 - 6, 40, U.dataLines * dy + 30, C.mute, { rx: 4, a: 0.12 });
      let s = 5; const tx = []; for (let i = 0; i < U.dataLines; i++) { s = (s * 69069 + 1) % 4294967296; tx.push(Math.round((s / 4294967296 - 0.5) * 34)); }
      const xm = (x0 + x1) / 2 - 10;
      g.box(xm - 19, y0 - 6, 38, U.dataLines * dy + 4, C.red, { a: 0.12, rx: 2, sw: 0.8 });
      for (let i = 0; i < U.dataLines; i++) { const y = y0 + i * dy, xt = xm + tx[i]; g.path(`M${x0},${y + 3} H${xt} L${xt + 3},${y - 2} H${x1}`, C.cyan, { sw: 1.1 }); }
      const ys = y0 + U.dataLines * dy + 12; g.path(`M${x0},${ys + 3} H${xm + 26} L${xm + 29},${ys - 3} H${x1}`, C.gold, { sw: 2 });
      g.text(ox + 20, ys + 34, 'dg.wires.snd', { a: 'middle', c: 'm' }); g.text(x1 + 26, ys + 34, 'dg.wires.rcv', { a: 'middle', c: 'm' });
      g.text(xm, ys + 34, 'dg.wires.skew', { a: 'middle', c: 'r' });
      g.text(x0 + 8, ys + 14, 'dg.wires.strobe', { c: 'g', fs: 13.5 });
    };
    const sata = (ox, oy) => {
      g.text(ox, oy, 'dg.wires.sata', { c: 'm', weight: 600, w: 320 });
      const x0 = ox + 62, x1 = ox + 260, y0 = oy + 46;
      g.box(ox, y0 - 18, 56, 84, C.cyan, { rx: 4, a: 0.12 }); g.box(x1 + 6, y0 - 18, 56, 84, C.violet, { rx: 4, a: 0.12 });
      g.text(ox + 28, y0 + 24, 'dg.wires.host', { a: 'middle', c: 'c' }); g.text(x1 + 34, y0 + 24, 'dg.wires.dev', { a: 'middle', c: 'v' });
      for (const [y, back] of [[y0, 0], [y0 + 48, 1]]) {
        g.line(back ? x1 : x0, y - 3, back ? x0 : x1, y - 3, C.ink, { sw: 1.4, arrow: 1 }); g.line(back ? x1 : x0, y + 3, back ? x0 : x1, y + 3, C.ink, { sw: 1.4, arrow: 1 });
        g.text((x0 + x1) / 2, y - 16, back ? 'dg.wires.pairB' : 'dg.wires.pairA', { a: 'middle' });
      }
      // the 7-pin data connector, pin order from the standard's pin table
      const pins = ['G', 'A+', 'A−', 'G', 'B−', 'B+', 'G'], pw = 40, px = ox + 20, py = y0 + 118;
      g.text(px, py - 12, 'dg.wires.pins', { c: 'm', vars: { n: S.signalPins, g: S.gndPins } });
      pins.forEach((p, i) => { const gnd = p === 'G'; g.box(px + i * pw, py, pw - 4, 28, gnd ? C.mute : C.ink, { rx: 3, a: gnd ? 0.15 : 0.08 }); g.text(px + i * pw + (pw - 4) / 2, py + 14, { raw: p }, { a: 'middle', mono: 1, c: gnd ? 'm' : '' }); });
      g.text(ox, py + 52, 'dg.wires.cdr', { c: 'n', w: 320 });
    };
    if (wide) { pata(16, 22); sata(384, 22); } else { pata(6, 20); sata(6, 272); }
  } };
};
// 8b/10b: the byte 00h through the two sub-block tables, from either running disparity; K28.5's comma (ch3)
DG.enc = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 330 : 470;
  const lo = M.B8.encode(0, -1).code, hi = M.B8.encode(0, 1).code, k = M.B8.encodeK(5, -1).code;
  return { W, H, draw(g) {
    const cw = wide ? 28 : 22, a6 = wide ? 120 : 44, a4 = a6 + 6 * cw + (wide ? 60 : 30), lx = wide ? 20 : 4;
    const cells = (x, y, bits, col, hl) => bits.split('').forEach((b, i) => { const on = hl && hl(i); g.box(x + i * cw + 1, y, cw - 2, 26, on ? C.violet : col, { rx: 3, a: on ? 0.35 : 0.18, sw: 1 }); g.text(x + i * cw + cw / 2, y + 13, { raw: b }, { a: 'middle', mono: 1 }); });
    const i5 = a6 + cw / 2, i3 = a4 + cw / 2;
    g.text(i5, 20, 'dg.enc.lo5', { c: 'm', w: 5 * cw + 40 }); g.text(i3, 20, 'dg.enc.hi3', { c: 'm', w: 3 * cw + 60 });
    cells(i5, 34, '00000', C.mute); cells(i3, 34, '000', C.mute);
    g.line(a6 + 3 * cw, 62, a6 + 3 * cw, 78, C.mute, { arrow: 1 }); g.line(a4 + 2 * cw, 62, a4 + 2 * cw, 78, C.mute, { arrow: 1 });
    g.box(a6, 80, 6 * cw, 26, C.mute, { rx: 5, a: 0.1, sw: 1 }); g.text(a6 + 3 * cw, 93, 'dg.enc.t6', { a: 'middle', c: 'm' });
    g.box(a4, 80, 4 * cw, 26, C.mute, { rx: 5, a: 0.1, sw: 1 }); g.text(a4 + 2 * cw, 93, 'dg.enc.t4', { a: 'middle', c: 'm' });
    'abcdei'.split('').forEach((c, i) => g.text(a6 + i * cw + cw / 2, 122, { raw: c }, { a: 'middle', mono: 1, c: 'm', fs: 13 }));
    'fghj'.split('').forEach((c, i) => g.text(a4 + i * cw + cw / 2, 122, { raw: c }, { a: 'middle', mono: 1, c: 'm', fs: 13 }));
    const rows = [[138, lo, 'dg.enc.rdm'], [172, hi, 'dg.enc.rdp']];
    for (const [y, code, key] of rows) { cells(a6, y, code.slice(0, 6), C.gold); cells(a4, y, code.slice(6), C.gold); g.text(lx, y + 13, { raw: key === 'dg.enc.rdm' ? 'RD−' : 'RD+' }, { mono: 1, c: 'g' }); }
    if (wide) {
      g.text(a4 + 4 * cw + 20, 172, 'dg.enc.pick', { w: 720 - (a4 + 4 * cw + 26), va: 'mid' });
      g.text(lx, 236, 'dg.enc.k', { c: 'v' }); cells(a6, 252, k, C.mute, i => i < 7);
      g.text(a6 + 10 * cw + 16, 265, 'dg.enc.comma', { c: 'v', w: 720 - (a6 + 10 * cw + 22), va: 'mid' });
      g.text(lx, 310, 'dg.enc.order', { c: 'm', w: 680 });
    } else {
      g.text(lx, 222, 'dg.enc.pick', { w: 330 });
      g.text(lx, 292, 'dg.enc.k', { c: 'v' }); cells(a6, 306, k, C.mute, i => i < 7);
      g.text(lx, 356, 'dg.enc.comma', { c: 'v', w: 330 });
      g.text(lx, 418, 'dg.enc.order', { c: 'm', w: 330 });
    }
  } };
};
// one frame on the wire, a Register Host-to-Device FIS with its first Dword opened up (ch4); Dwords to scale
DG.fis = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 290 : 468;
  const fr = M.LINK.readFrames(8).frames, h2d = fr[0].len, d0 = M.LINK.h2dRead(0, 8, 0)[0];
  const bytes = [0, 1, 2, 3].map(i => (d0 >>> (8 * i)) & 255);
  return { W, H, draw(g) {
    const n = h2d + 3, x0 = wide ? 40 : 10, dw = wide ? 80 : 40, y = wide ? 44 : 60;
    g.text(x0, 18, 'dg.fis.frame', { c: 'm', w: W - 2 * x0, vars: { n: h2d } });
    const lab = i => i === 0 ? 'SOF' : i === n - 2 ? 'CRC' : i === n - 1 ? 'EOF' : (wide ? 'DW' : '') + (i - 1);
    for (let i = 0; i < n; i++) {
      const prim = i === 0 || i === n - 1, crc = i === n - 2, col = prim ? C.mute : crc ? C.violet : C.cyan;
      g.box(x0 + i * dw + 1, y, dw - 2, 34, col, { rx: 4, a: i === 1 ? 0.35 : 0.15, sw: i === 1 ? 2 : 1 });
      g.text(x0 + i * dw + dw / 2, y + 17, { raw: lab(i) }, { a: 'middle', mono: 1, fs: 13, c: prim ? 'm' : crc ? 'v' : '' });
    }
    g.line(x0 + dw + 4, y + 44, x0 + (n - 2) * dw - 4, y + 44, C.cyan, { sw: 1.2, both: 1, arrow: 1 });
    g.text(x0 + (n / 2) * dw - dw / 2, y + 60, 'dg.fis.fis', { a: 'middle', c: 'c', vars: { n: h2d } });
    const keys = ['b0', 'b1', 'b2', 'b3'];
    if (wide) {
      const by = 150, bw = 160;
      g.text(x0, by - 22, 'dg.fis.dw0', { c: 'm' });
      bytes.forEach((v, i) => { g.box(x0 + i * bw + 1, by, bw - 2, 86, C.cyan, { rx: 5, a: 0.1, sw: 1 }); g.text(x0 + i * bw + bw / 2, by + 16, { raw: hex2(v) }, { a: 'middle', mono: 1, c: 'c' }); g.text(x0 + i * bw + bw / 2, by + 54, 'dg.fis.' + keys[i], { a: 'middle', w: bw - 14, va: 'mid' }); });
      g.text(x0, by + 110, 'dg.fis.note', { c: 'm', w: 640 });
    } else {
      const by = 188;
      g.text(x0, by - 28, 'dg.fis.dw0', { c: 'm', w: 320, va: 'mid' });
      bytes.forEach((v, i) => { const yy = by + i * 48; g.box(x0, yy, 320, 42, C.cyan, { rx: 5, a: 0.1, sw: 1 }); g.text(x0 + 10, yy + 21, { raw: hex2(v) }, { mono: 1, c: 'c' }); g.text(x0 + 56, yy + 21, 'dg.fis.' + keys[i], { w: 256, va: 'mid' }); });
      g.text(x0, by + 4 * 48 + 16, 'dg.fis.note', { c: 'm', w: 320 });
    }
  } };
};
// the five frames of one READ FPDMA QUEUED of 4 KiB; host cyan, drive violet (ch4); time not to scale
DG.seq = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 420 : 560;
  const fr = M.LINK.readFrames(8).frames, len = id => fr.find(f => f.id === id).len;
  const steps = [['h2d', 0x27, 1], ['d2h', 0x34, 0], ['wait'], ['dmas', 0x41, 0], ['data', 0x46, 0], ['sdb', 0xA1, 0]];
  return { W, H, draw(g) {
    const hx = wide ? 120 : 26, dx = wide ? 600 : 314, top = 56, step = wide ? 62 : 84;
    g.box(hx - 50 < 2 ? 2 : hx - 50, 14, wide ? 100 : 48, 30, C.cyan, { rx: 6 }); g.text(hx - 50 < 2 ? 26 : hx, 29, 'dg.seq.host', { a: 'middle', c: 'c' });
    g.box(wide ? dx - 50 : dx - 24, 14, wide ? 100 : 48, 30, C.violet, { rx: 6 }); g.text(dx, 29, 'dg.seq.dev', { a: 'middle', c: 'v' });
    g.line(hx, 46, hx, H - 14, C.cyan, { sw: 1, dash: '2 4' }); g.line(dx, 46, dx, H - 14, C.violet, { sw: 1, dash: '2 4' });
    steps.forEach(([id, ty, toDev], i) => {
      const y = top + 34 + i * step + (wide ? 0 : 20);
      if (id === 'wait') { g.box(hx + 10, y - 26, dx - hx - 20, 40, C.mute, { a: 0.06, dash: '4 4', sw: 1, rx: 6 }); g.text((hx + dx) / 2, y - 6, 'dg.seq.wait', { a: 'middle', c: 'm', w: dx - hx - 40, va: 'mid' }); return; }
      const col = toDev ? C.cyan : C.violet;
      g.line(toDev ? hx + 2 : dx - 2, y, toDev ? dx - 2 : hx + 2, y, col, { sw: 2, arrow: 1 });
      g.text((hx + dx) / 2, y - (wide ? 14 : 32), 'dg.seq.' + id, { a: 'middle', c: toDev ? 'c' : 'v', w: dx - hx - 24, vars: { t: hex2(ty), n: fmt(len(id), 0), d: fmt(len(id) - 1, 0) } });
    });
  } };
};
// NCQ: the same three requests in arrival order and nearest-first, rotation only; the 32-bit SActive (ch5); schematic
DG.ncq = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 380 : 610;
  // angle each request must turn before it reaches the head, in degrees, and its track radius
  const Q = { A: [150, 0.72], B: [260, 0.5], C: [40, 0.88] }, fifo = ['A', 'B', 'C'];
  const turn = order => { let pos = 0, tot = 0; for (const k of order) { const d = ((Q[k][0] - pos) % 360 + 360) % 360; tot += d; pos = Q[k][0]; } return tot; };
  const satf = (() => { let pos = 0, left = fifo.slice(), out = []; while (left.length) { left.sort((a, b) => ((Q[a][0] - pos) % 360 + 360) % 360 - ((Q[b][0] - pos) % 360 + 360) % 360); const k = left.shift(); out.push(k); pos = Q[k][0]; } return out; })();
  return { W, H, draw(g) {
    const disk = (cx, cy, R, order, col, key) => {
      g.circle(cx, cy, R, C.mute, { a: 0.06, sw: 1 }); g.circle(cx, cy, R * 0.22, C.mute, { a: 0.3, sw: 1 });
      g.path(arc(cx, cy, R + 10, 200, 250), C.mute, { arrow: 1, sw: 1.4 });
      g.box(cx - 6, cy - R - 6, 12, 12, C.gold, { solid: true, rx: 2 });
      for (const k of fifo) { const [d, r] = Q[k], [x, y] = pt(cx, cy, R * r, 90 - d); g.circle(x, y, 5, C.cyan, { solid: true }); g.text(x + 9, y - 1, { raw: k }, { mono: 1, c: 'c', fs: 13.5 }); g.num(x - 16, y - 2, order.indexOf(k) + 1, col); }
      g.text(cx, cy + R + 28, key, { a: 'middle', c: col === C.gold ? 'g' : 'm', w: wide ? 340 : 320, vars: { o: order.join(' → '), d: Math.round(turn(order)), r: fmt(turn(order) / 360, 1) } });
    };
    const sa = (x0, y0, w) => {
      const n = M.SPEC.tags, cw = w / n, on = [3, 7, 12];
      g.text(x0, y0, 'dg.ncq.sact', { c: 'm', w, vars: { n } });
      for (let i = 0; i < n; i++) { const set = on.includes(i); g.box(x0 + i * cw + 0.5, y0 + 16, cw - 1, 20, set ? C.gold : C.mute, { rx: 2, a: set ? 0.6 : 0.12, sw: 0.8 }); }
      g.text(x0 + w, y0 + 50, { raw: '0' }, { a: 'end', mono: 1, c: 'm', fs: 13 }); g.text(x0, y0 + 50, { raw: String(n - 1) }, { mono: 1, c: 'm', fs: 13 });
      g.text(x0 + w / 2, y0 + 50, 'dg.ncq.bit', { a: 'middle', c: 'g' });
    };
    if (wide) { disk(180, 140, 92, fifo, C.mute, 'dg.ncq.fifo'); disk(540, 140, 92, satf, C.gold, 'dg.ncq.satf'); sa(20, 312, 680); }
    else { disk(170, 120, 84, fifo, C.mute, 'dg.ncq.fifo'); disk(170, 360, 84, satf, C.gold, 'dg.ncq.satf'); sa(10, 530, 320); }
  } };
};
// the link's sleep states, deeper to the right; exit latencies are the standard's maxima (ch6); power not to scale
DG.pwr = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 440, S = M.SPEC;
  const st = [['on', C.mute, 'm', null], ['partial', C.cyan, 'c', S.exit.partial], ['slumber', C.gold, 'g', S.exit.slumber], ['devslp', C.green, 'n', S.exit.devslp]];
  return { W, H, draw(g) {
    st.forEach(([k, col, cl, ex], i) => {
      const x = wide ? 20 + i * 172 : 10 + i * 34, y = wide ? 20 + i * 40 : 20 + i * 92, bw = wide ? 160 : 200;
      g.box(x, y, bw, 38, col, { rx: 6, a: 0.16 }); g.text(x + bw / 2, y + 19, 'dg.pwr.' + k, { a: 'middle', c: cl });
      g.text(x + (wide ? 4 : 2), y + 54, ex == null ? 'dg.pwr.awake' : 'dg.pwr.exit', { c: 'm', w: wide ? 164 : W - x - 26, vars: { t: dur(ex || 0, 0) } });
      if (k === 'devslp') g.text(x + (wide ? 4 : 2), y + (wide ? 80 : 74), 'dg.pwr.pin', { c: 'n', w: wide ? 164 : W - x - 26, vars: { t: dur(S.mdat, 0) } });
    });
    if (wide) { g.line(20, 262, 700, 262, C.ink, { arrow: 1, sw: 1.4 }); g.text(20, 284, 'dg.pwr.axis', { c: 'm' }); }
    else { g.line(326, 30, 326, 400, C.ink, { arrow: 1, sw: 1.4 }); g.text(10, 422, 'dg.pwr.axis', { c: 'm', w: 320 }); }
  } };
};
// a port multiplier: one host port, up to 15 drives; command- vs FIS-based switching on the shared link (ch7); schematic
DG.pm = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 380 : 520, S = M.SPEC, D = ['A', 'B', 'C', 'D'];
  return { W, H, draw(g) {
    const drive = (x, y, w, h, k) => { g.box(x, y, w, h, C.violet, { rx: 5, a: 0.14 }); g.text(x + w / 2, y + h / 2, 'dg.pm.drive', { a: 'middle', c: 'v', vars: { k } }); };
    const tl = (x0, y0, w, key, seq) => {
      g.text(x0, y0, key, { c: 'm', w });
      const n = seq.length, bw = w / n;
      const by = y0 + (wide ? 14 : 44); seq.forEach((k, i) => { if (!k) return; g.box(x0 + i * bw + 1, by, bw - 2, 24, C.violet, { rx: 3, a: 0.3, sw: 0.8 }); g.text(x0 + i * bw + bw / 2, by + 12, { raw: k }, { a: 'middle', mono: 1, fs: 13 }); });
    };
    const cbs = ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C'], fbs = ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'];
    if (wide) {
      g.box(20, 70, 120, 50, C.cyan, { rx: 6 }); g.text(80, 95, 'dg.pm.host', { a: 'middle', c: 'c', w: 110, va: 'mid' });
      g.line(140, 95, 228, 95, C.ink, { sw: 2.4 }); g.text(184, 80, 'dg.pm.one', { a: 'middle', c: 'm' });
      g.box(230, 60, 140, 70, C.gold, { rx: 6, a: 0.12 }); g.text(300, 95, 'dg.pm.pm', { a: 'middle', c: 'g', w: 130, va: 'mid' });
      D.forEach((k, i) => { const y = 22 + i * 44; drive(470, y, 110, 34, k); g.line(370, 95, 468, y + 17, C.mute, { sw: 1.2 }); });
      g.text(590, 160, 'dg.pm.max', { c: 'v', w: 125, vars: { n: S.pmPorts } });
      g.text(230, 150, 'dg.pm.field', { c: 'm', w: 230 });
      tl(20, 242, 680, 'dg.pm.cbs', cbs); tl(20, 304, 680, 'dg.pm.fbs', fbs);
    } else {
      g.box(10, 10, 150, 44, C.cyan, { rx: 6 }); g.text(85, 32, 'dg.pm.host', { a: 'middle', c: 'c', w: 140, va: 'mid' });
      g.line(85, 54, 85, 94, C.ink, { sw: 2.4 }); g.text(95, 74, 'dg.pm.one', { c: 'm' });
      g.box(10, 96, 150, 56, C.gold, { rx: 6, a: 0.12 }); g.text(85, 124, 'dg.pm.pm', { a: 'middle', c: 'g', w: 140, va: 'mid' });
      D.forEach((k, i) => { const y = 10 + i * 42; drive(218, y, 112, 32, k); g.line(160, 124, 216, y + 16, C.mute, { sw: 1.2 }); });
      g.text(218, 192, 'dg.pm.max', { c: 'v', w: 118, vars: { n: S.pmPorts } });
      g.text(10, 250, 'dg.pm.field', { c: 'm', w: 320 });
      tl(10, 316, 320, 'dg.pm.cbs', cbs); tl(10, 410, 320, 'dg.pm.fbs', fbs);
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
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function spacedTicks(c, items, y) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x, s] of items) { const w = c.measureText(s).width; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function tag(c, s, x, y, col, align, font) { c.font = font || FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); c.font = FONT; return [x0 - 3, x0 + w + 3]; }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
// a font scaled down (never below 75%) so one line of text fits in cap pixels
function fitFont(c, s, cap, base) { c.font = base || FONT; const tw = c.measureText(s).width; const k = tw > cap ? Math.max(0.75, cap / tw) : 1; return (base || FONT).replace('12px', (12 * k).toFixed(1) + 'px'); }
function labelFont(c, labels, cap) { c.font = FONT; let lw = 0; for (const s of labels) lw = Math.max(lw, c.measureText(s).width); const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap) }; }

/* ───────── 02 Ultra DMA budget ───────── */
(() => {
  const cv = $('#udCv'), sK = $('#udK'), U = M.UDMA;
  const mode = () => +radioVal('udM'), cable = () => +radioVal('udC'), k = () => +sK.value;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), cb = cable(), kk = k(), sel = mode();
      const labs = []; for (let m = 0; m < 7; m++) labs.push(t('ch2.cv.row', { m, r: fmt(U.mbps(m), 0) }));
      const lf = labelFont(c, labs, Math.min(150, w * 0.34));
      const L = lf.w, R = w - 14, T = 14, B = h - 34, rh = (B - T) / 7, max = 1.3, X = v => L + (R - L) * v / max;
      c.strokeStyle = C.grid; c.fillStyle = C.mute;
      const ticks = []; for (const v of [0, 0.25, 0.5, 0.75, 1, 1.25]) { const x = X(v); c.strokeStyle = v === 1 ? C.mute : C.grid; c.beginPath(); c.moveTo(x, T - 4); c.lineTo(x, B); c.stroke(); ticks.push([x, pct(v)]); }
      c.fillStyle = C.mute; spacedTicks(c, ticks, B + 11);
      c.textAlign = 'right'; c.fillText(t('ch2.cv.x'), R, B + 26);
      for (let m = 0; m < 7; m++) {
        const b = U.budget(m, cb, kk), y = T + m * rh, bh = rh * 0.56, y0 = y + (rh - bh) / 2;
        c.font = lf.font; c.textAlign = 'right'; c.fillStyle = m === sel ? C.gold : C.ink; c.fillText(labs[m], L - 8, y + rh / 2); c.font = FONT;
        if (!b.allowed) { const fs = t('ch2.cv.forbid'); c.font = fitFont(c, fs, R - L - 8); c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(fs, L + 6, y + rh / 2); c.font = FONT; continue; }
        let x = 0; const seg = (v, col) => { const a = X(x / b.cyc), z = X(Math.min(max, (x + v) / b.cyc)); c.fillStyle = col; c.fillRect(a, y0, Math.max(0, z - a), bh); x += v; };
        c.globalAlpha = m === sel ? 1 : 0.55;
        seg(b.ds + b.dh, C.cyan); seg(b.skew, C.red); if (b.settle) seg(b.settle, C.violet);
        if (b.margin > 0) seg(b.margin, C.green);
        c.globalAlpha = 1;
        if (m === sel) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L - 2, y + 1, R - L + 4, rh - 2); }
      }
    }
  });
  function text() {
    const m = mode(), cb = cable(), kk = k(), b = U.budget(m, cb, kk);
    put('#udKo', t('ch2.unit.k', { v: fmt(kk, 2) }));
    put('#udCyc', t('u.ns', { v: fmt(b.cyc, 1) }));
    put('#udUsed', b.allowed ? t('u.ns', { v: fmt(b.used, 2) }) : '—');
    put('#udMar', b.allowed ? t('u.ns', { v: fmt(b.margin, 2) }) : '—');
    put('#udRate', t('u.MBps', { v: fmt(b.mbps, 1) }));
    const s = M.say.udma(m, cb, kk), v = s.v;
    putHTML('#udSay', t(s.key, { mode: v.mode, used: fmt(v.used, 2), cyc: fmt(v.cyc, 1), margin: fmt(Math.abs(v.margin || 0), 2), pct: v.pct == null ? '' : pct(v.pct), fastest: v.fastest }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sK.addEventListener('input', go); onAll(radios('udM'), 'change', go); onAll(radios('udC'), 'change', go);
  text();
})();

/* ───────── 03 8b/10b ───────── */
(() => {
  const cv = $('#enCv'), inp = $('#enIn'), chk = $('#enScr'), B = M.B8;
  const ALIGN = [{ v: 5, k: true }, { v: 0x4A }, { v: 0x4A }, { v: 0x7B }];
  inp.value = 'SATA';
  let cur = null;
  function bytesOfText(s) { const u = Array.from(new TextEncoder().encode(s)); return u.slice(0, 12); }
  function compute() {
    const p = radioVal('enP');
    let items;
    if (p === 'align') items = ALIGN.concat(ALIGN);
    else {
      let bytes = p === 'zero' ? Array(8).fill(0) : p === 'ff' ? Array(8).fill(0xFF) : bytesOfText(inp.value);
      if (!bytes.length) bytes = [0];
      if (chk.checked) { const s = M.LINK.scrambler(Math.ceil(bytes.length / 4)); bytes = bytes.map((b, i) => b ^ ((s[i >> 2] >>> (8 * (i & 3))) & 0xFF)); }
      items = bytes.map(v => ({ v }));
    }
    const sy = B.stream(items, -1), coded = sy.map(s => s.code).join('');
    const raw = B.rawBits(items.map(i => i.k ? 0xBC : i.v));
    cur = { p, items, sy, coded, raw, rs: B.stats(raw), cs: B.stats(coded), commas: B.commas(coded), nK: items.filter(i => i.k).length, per: B.period(coded) };
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const L = 8, R = w - 8, maxBits = Math.max(20, Math.min(cur.coded.length, Math.floor((R - L) / 4)));
      const bw = (R - L) / maxBits, rows = [[cur.raw, C.mute, t('ch3.cv.raw')], [cur.coded, C.gold, t('ch3.cv.coded')]];
      const rowH = (h - 40) * 0.26;
      rows.forEach(([bits, col, lab], ri) => {
        const y0 = 18 + ri * (rowH + 22), hi = y0 + 4, lo = y0 + rowH;
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(lab, L, y0 - 8);
        c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, lo); c.lineTo(R, lo); c.stroke();
        if (ri === 1) { c.fillStyle = 'rgba(240,122,109,.25)'; for (const p of cur.commas) if (p < maxBits) c.fillRect(L + p * bw, hi - 2, 7 * bw, lo - hi + 4); }
        c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath();
        const n = Math.min(bits.length, maxBits);
        for (let i = 0; i < n; i++) { const y = bits[i] === '1' ? hi : lo, x = L + i * bw; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); c.lineTo(x + bw, y); }
        c.stroke();
        if (ri === 1) { c.strokeStyle = C.line; for (let i = 10; i < n; i += 10) { const x = L + i * bw; c.beginPath(); c.moveTo(x, lo + 2); c.lineTo(x, lo + 6); c.stroke(); } }
      });
      // running digital sum of both streams
      const y0 = 18 + 2 * (rowH + 22), yb = h - 14, mid = (y0 + yb) / 2;
      const all = [cur.raw, cur.coded].map(bits => { const o = []; let s = 0; for (let i = 0; i < Math.min(bits.length, maxBits); i++) { s += bits[i] === '1' ? 1 : -1; o.push([i + 1, s]); } return o; });
      let A = 4; for (const a of all) for (const p of a) A = Math.max(A, Math.abs(p[1]));
      const Y = v => mid - (yb - y0 - 10) / 2 * v / A, X = i => L + i * bw;
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch3.cv.rds'), L, y0 - 8);
      c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, mid); c.lineTo(R, mid); c.stroke();
      path(c, [[0, 0]].concat(all[0]), X, Y, C.mute, 1.4);
      path(c, [[0, 0]].concat(all[1]), X, Y, C.cyan, 2);
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText('+' + fmt(A, 0), R, y0 + 2); c.fillText('−' + fmt(A, 0), R, yb - 2);
    }
  });
  function text() {
    compute();
    const html = cur.sy.map(s => `<span class="${s.k ? 'k' : ''}"><b>${s.name}</b> ${s.code.slice(0, 6)}&thinsp;${s.code.slice(6)} <i>→${s.rd > 0 ? 'RD+' : 'RD−'}</i></span>`).join('');
    putHTML('#enSyms', html);
    put('#enRawRun', t('ch3.unit.bits', { v: fmt(cur.rs.maxRun, 0) }));
    put('#enRun', t('ch3.unit.bits', { v: fmt(cur.cs.maxRun, 0) }));
    put('#enSwing', fmt(cur.cs.swing, 0));
    put('#enComma', fmt(cur.commas.length, 0));
    const s = M.say.enc(cur.rs, cur.cs, cur.commas.length, cur.nK), v = s.v;
    putHTML('#enSay', t(s.key, { rawRun: fmt(v.rawRun, 0), run: fmt(v.run, 0), swing: fmt(v.swing, 0), rawSwing: fmt(v.rawSwing, 0), commas: fmt(v.commas, 0), k: fmt(v.k, 0) }) + SEP() + t(cur.nK ? 'ch3.say.commaK' : (cur.commas.length ? 'ch3.say.commaOdd' : 'ch3.say.commaNone')) + SEP() + (cur.per ? t('ch3.say.period', { p: fmt(cur.per, 0) }) : t('ch3.say.noPeriod')));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  inp.addEventListener('input', () => { radios('enP').find(r => r.value === 'text').checked = true; go(); });
  onAll(radios('enP'), 'change', go); chk.addEventListener('change', go);
  text();
})();

/* ───────── 04 one READ FPDMA QUEUED ───────── */
(() => {
  const cv = $('#fsCv'), sT = $('#fsT'), sL = $('#fsL'), L = M.LINK;
  let step = 0, showAll = false, POS = null;
  const STEPS = ['h2d', 'd2h', 'seek', 'dmas', 'data', 'sdb'];
  const sectors = () => +radioVal('fsN');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), wire = L.wire(sectors(), 3), rf = L.readFrames(sectors());
      const xh = Math.max(56, w * 0.16), xd = w - xh, T = 34, B = h - 12, rows = STEPS.length, rh = (B - T) / rows;
      c.textAlign = 'center'; c.fillStyle = C.ink; c.font = '600 13px -apple-system,system-ui,sans-serif';
      c.fillText(t('ch4.cv.host'), xh, 14); c.fillText(t('ch4.cv.dev'), xd, 14); c.font = FONT;
      c.strokeStyle = C.line; c.lineWidth = 2; [xh, xd].forEach(x => { c.beginPath(); c.moveTo(x, 24); c.lineTo(x, B); c.stroke(); });
      const nData = rf.frames.filter(f => f.id === 'data').length;
      STEPS.forEach((id, i) => {
        const y = T + i * rh + rh * 0.42, on = showAll || i === step, col = on ? (i === step && !showAll ? C.gold : C.cyan) : C.dimfill;
        if (id === 'seek') {
          c.strokeStyle = col; c.setLineDash([3, 4]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(xd, y - rh * 0.3); c.lineTo(xd, y + rh * 0.3); c.stroke(); c.setLineDash([]);
          tag(c, t('ch4.cv.seek'), xd - 10, y, on ? C.ink : C.mute, 'right');
          return;
        }
        const fromH = id === 'h2d', x0 = fromH ? xh : xd, x1 = fromH ? xd : xh;
        c.strokeStyle = col; c.lineWidth = on ? 2.4 : 1.4; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
        const dir = x1 > x0 ? 1 : -1; c.fillStyle = col; c.beginPath(); c.moveTo(x1, y); c.lineTo(x1 - dir * 9, y - 5); c.lineTo(x1 - dir * 9, y + 5); c.fill();
        const name = id === 'data' && nData > 1 ? t('ch4.cv.dataN', { n: nData }) : t('ch4.cv.' + id);
        tag(c, name, (xh + xd) / 2, y - 13, on ? C.ink : C.mute, 'center', fitFont(c, name, w - 16));
        const f = rf.frames.find(q => q.id === id), dws = id === 'data' ? rf.frames.filter(q => q.id === 'data').reduce((a, q) => a + q.len, 0) : f.len;
        tag(c, t('ch4.cv.dw', { n: fmt(dws, 0) }), (xh + xd) / 2, y + 12, C.mute, 'center', MONO);
      });
      const tot = t('ch4.cv.total', { n: fmt(wire.total, 0) }); c.font = fitFont(c, tot, w - 12);
      c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(tot, w / 2, B - 2); c.font = FONT;
    }
  });
  function hexView() {
    const tg = +sT.value, lba = +sL.value, n = sectors(), d = L.h2dRead(lba, n, tg), crc = L.crc(d).crc, sc = L.scrambler(6);
    const lines = d.map((x, i) => `<span class="m">${t('ch4.hex.dw', { i })}</span> <span class="c">${L.hex(x)}</span>  <span class="m">${t('ch4.hex.f' + i)}</span>`);
    lines.push(`<span class="m">CRC</span> <span class="g">${L.hex(crc)}</span>`);
    lines.push(`<span class="m">${t('ch4.hex.scr')}</span> ${d.concat([crc]).map((x, i) => L.hex((x ^ sc[i]) >>> 0)).join(' ')}`);
    lines.push(`<span class="m">${t('ch4.hex.sact')}</span> <span class="g">${L.hex((1 << tg) >>> 0)}</span>`);
    return lines.join('\n');
  }
  function text() {
    const n = sectors(), wire = L.wire(n, 3), tg = +sT.value;
    put('#fsTo', fmt(tg, 0)); put('#fsLo', String(+sL.value));
    put('#fsFr', fmt(wire.frames, 0)); put('#fsDw', fmt(wire.total, 0)); put('#fsUs', t('u.us', { v: fmt(wire.us, 2) })); put('#fsEff', pct(wire.eff));
    putHTML('#fsHex', hexView());
    const id = STEPS[step];
    putHTML('#fsStep', showAll ? t('ch4.step.all') : t('ch4.step.' + id, { tag: tg, bit: L.hex((1 << tg) >>> 0) }));
    const pos = POS || (POS = M.DISK.simulate(1, 'fifo', 3000, 7));
    putHTML('#fsSay', t(n >= 64 ? 'ch4.say.big' : 'ch4.say.small', { kb: fmt(n * 0.5, n === 1 ? 1 : 0), dw: fmt(wire.total, 0), us: fmt(wire.us, 2), eff: pct(wire.eff), ms: fmt(1000 / pos.iops, 1), ratio: fmt(1000 / pos.iops * 1000 / wire.us, 0), mbps: fmt(wire.mbps, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  $('#fsPrev').addEventListener('click', () => { showAll = false; step = (step + STEPS.length - 1) % STEPS.length; go(); });
  $('#fsNext').addEventListener('click', () => { showAll = false; step = (step + 1) % STEPS.length; go(); });
  $('#fsAll').addEventListener('click', () => { showAll = true; go(); });
  [sT, sL].forEach(e => e.addEventListener('input', go)); onAll(radios('fsN'), 'change', go);
  text();
})();

/* ───────── 05 NCQ on a spinning disk ───────── */
(() => {
  const cv = $('#ncCv'), cv2 = $('#nc2Cv'), D = M.DISK, K = D.coef(), btn = $('#ncPlay');
  const SLOW = 1 / 60;               // 1 s on screen = 1/60 s of disk time
  const pol = () => radioVal('ncP'), Q = () => +radioVal('ncQ');
  let curves = null, stats = {};
  const getCurves = () => curves || (curves = { fifo: D.curve('fifo', 1200, 7), sstf: D.curve('sstf', 1200, 7), satf: D.curve('satf', 1200, 7) });
  const stat = (p, q) => stats[p + q] || (stats[p + q] = D.simulate(q, p, 3000, 7));
  // live state for the animation
  let R = M.rng(3), tms = 0, queue = [], head = { x: 0.5 }, job = null, done = 0, playing = !reduce;
  function refill() { while (queue.length < Q()) queue.push(D.req(R, K)); while (queue.length > Q()) queue.pop(); }
  function startJob() {
    refill(); const ph = (tms / K.rev) % 1, h = { x: head.x, ph };
    const j = D.pick(pol(), h, queue, K), q = queue[j], [s, w0] = D.cost(h, q, K), x = D.xferMs(q.x, K);
    job = { q, x0: head.x, s, w: w0, xf: x, t0: tms };
  }
  const sim = reg([cv, cv2], {
    step(dt) {
      if (!(playing && !reduce)) { if (this.dirty) { this.draw(); this.dirty = false; } return; }
      {
        let left = dt * 1000 * SLOW;
        while (left > 0) {
          if (!job) startJob();
          const end = job.t0 + job.s + job.w + job.xf, take = Math.min(left, end - tms);
          tms += take; left -= take;
          if (tms >= end - 1e-9) { head.x = job.q.x; queue.splice(queue.indexOf(job.q), 1); job = null; done++; }
        }
      }
      this.draw();
    },
    draw() {
      { // platter
        const { c, w, h } = fit(cv), cx = w / 2, cy = h / 2, ro = Math.min(w, h) / 2 - 18, ri = ro * K.ri;
        c.fillStyle = '#151a24'; c.beginPath(); c.arc(cx, cy, ro, 0, 6.283); c.fill();
        c.fillStyle = C.bg; c.beginPath(); c.arc(cx, cy, ri * 0.8, 0, 6.283); c.fill();
        c.strokeStyle = C.grid; for (let k = 0; k <= 4; k++) { c.beginPath(); c.arc(cx, cy, ri + (ro - ri) * k / 4, 0, 6.283); c.stroke(); }
        const ang = (tms / K.rev) % 1, rad = x => ro - (ro - ri) * x;
        // a mark on the platter so rotation is visible
        const a0 = -ang * 6.283; c.strokeStyle = C.line; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri); c.lineTo(cx + Math.cos(a0) * ro, cy + Math.sin(a0) * ro); c.stroke();
        if (!job && !reduce) refill(); if (reduce) refill();
        for (const q of queue) { const a = (q.th - ang) * 6.283, r = rad(q.x); dot(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, job && q === job.q ? C.gold : C.cyan, job && q === job.q ? 6 : 4.5); }
        // head position: moves radially during the seek
        let hx = head.x; if (job) { const f = M.clamp((tms - job.t0) / Math.max(job.s, 1e-6), 0, 1); hx = job.x0 + (job.q.x - job.x0) * f; }
        const hr = rad(hx);
        c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(w - 6, cy); c.lineTo(cx + hr, cy); c.stroke();
        c.fillStyle = C.gold; c.fillRect(cx + hr - 5, cy - 5, 10, 10);
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch5.cv.done', { n: fmt(done, 0) }), 8, 12);
        c.textAlign = 'right'; c.fillText(t('ch5.cv.slow'), w - 8, 12);
      }
      { // IOPS against depth
        const { c, w, h } = fit(cv2), cu = getCurves(), f = frame(w, h, [26, 16, 36, 46], 0, 5, 0, 220);
        yTicks(c, f, [0, 50, 100, 150, 200], v => fmt(v, 0)); axes(c, f, t('ch5.cv2.x'), t('ch5.cv2.y'));
        c.fillStyle = C.mute; spacedTicks(c, [1, 2, 4, 8, 16, 32].map(q => [f.X(Math.log2(q)), String(q)]), f.B + 11);
        const lx = q => Math.log2(q);
        path(c, cu.fifo.map(p => [lx(p[0]), p[1]]), f.X, f.Y, C.mute, 1.8);
        path(c, cu.sstf.map(p => [lx(p[0]), p[1]]), f.X, f.Y, C.cyan, 2);
        path(c, cu.satf.map(p => [lx(p[0]), p[1]]), f.X, f.Y, C.gold, 2.4);
        const s = stat(pol(), Q()); dot(c, f.X(lx(Q())), f.Y(s.iops), { fifo: C.mute, sstf: C.cyan, satf: C.gold }[pol()], 5.5);
      }
    }
  });
  function text() {
    const p = pol(), q = Q(), s = stat(p, q);
    put('#ncIops', fmt(s.iops, 0)); put('#ncSeek', t('u.ms', { v: fmt(s.seek, 2) })); put('#ncWait', t('u.ms', { v: fmt(s.wait, 2) })); put('#ncP95', t('u.ms', { v: fmt(s.p95, 0) }));
    btn.textContent = t(playing ? 'ch5.btn.pause' : 'ch5.btn.play'); btn.setAttribute('aria-pressed', String(playing));
    const z = M.say.ncq(q, stat('fifo', q), stat('sstf', q), stat('satf', q)), v = z.v;
    putHTML('#ncSay', t(z.key, { q, fifo: fmt(v.fifo, 0), sstf: fmt(v.sstf, 0), satf: fmt(v.satf, 0), gain: fmt(v.gain, 2), p95: fmt(v.p95, 0), p95f: fmt(v.p95f, 0) }));
  }
  sim.text = text;
  const go = () => { job = null; sim.dirty = true; text(); };
  onAll(radios('ncP'), 'change', go); onAll(radios('ncQ'), 'change', go);
  btn.addEventListener('click', () => { playing = !playing && !reduce; text(); sim.dirty = true; });
  if (reduce) btn.disabled = false;
  text();
})();

/* ───────── 06 link power ───────── */
(() => {
  const cv = $('#pwCv'), sM = $('#pwM'), sT = $('#pwT'), P = M.POWER;
  const st = () => radioVal('pwS'), gap = () => Math.pow(10, +sM.value), tau = () => +sT.value / 1000;
  const COL = { on: C.mute, partial: C.cyan, slumber: C.gold, devslp: C.green };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), YM = 300, f = frame(w, h, [26, 14, 36, 46], -4, 1, 0, YM), ta = tau();
      yTicks(c, f, [0, 100, 200, 300], v => fmt(v, 0)); axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      c.fillStyle = C.mute; spacedTicks(c, [-4, -3, -2, -1, 0, 1].map(e => [f.X(e), dur(Math.pow(10, e), 0)]), f.B + 11);
      for (const s of ['on', 'partial', 'slumber', 'devslp']) {
        const pts = []; for (let e = -4; e <= 1.0001; e += 0.05) pts.push([e, Math.min(YM, P.run(s, Math.pow(10, e), ta).W * 1000)]);
        path(c, pts, f.X, f.Y, COL[s], s === st() ? 2.8 : 1.5);
      }
      const r = P.run(st(), gap(), ta); dot(c, f.X(+sM.value), f.Y(Math.min(YM, r.W * 1000)), COL[st()], 5.5);
    }
  });
  function text() {
    const s = st(), m = gap(), ta = tau(), r = P.run(s, m, ta), b = P.best(m, ta);
    put('#pwMo', dur(m)); put('#pwTo', ta === 0 ? t('ch6.unit.now') : dur(ta, 0));
    put('#pwW', t('u.mW', { v: fmt(r.W * 1000, 1) })); put('#pwSave', pct(r.save)); put('#pwLat', r.lat ? dur(r.lat) : t('u.ms', { v: '0' })); put('#pwBest', t('ch6.st.' + b));
    const z = M.say.power(s, m, ta), v = z.v;
    putHTML('#pwSay', t(z.key, { st: t('ch6.st.' + s), best: t('ch6.st.' + v.best), W: fmt(v.W * 1000, 1), save: pct(Math.abs(v.save)), lat: dur(v.lat), gap: dur(m), ps: pct(v.pSleep) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sM, sT].forEach(e => e.addEventListener('input', go)); onAll(radios('pwS'), 'change', go);
  text();
})();

/* ───────── 07 port multiplier ───────── */
(() => {
  const cv = $('#pmCv'), sN = $('#pmN'), PM = M.PM, Q = 8;
  const mode = () => radioVal('pmM'), work = () => radioVal('pmW'), gen = () => +radioVal('pmL');
  let randOne = null, randDrain = null;
  const rnd = () => { if (randOne == null) { randOne = PM.random(1, Q, 'fbs').one; randDrain = PM.random(1, Q, 'cbs').iops; } };
  const agg = (n, md) => { if (work() === 'seq') return PM.seq(n, md, gen()).mbps; rnd(); return md === 'fbs' ? n * randOne : randDrain; };
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), seq = work() === 'seq', ymax = seq ? 800 : 2200, f = frame(w, h, [26, 14, 36, 52], 1, 15, 0, ymax);
      const ys = seq ? [0, 200, 400, 600, 800] : [0, 500, 1000, 1500, 2000];
      yTicks(c, f, ys, v => fmt(v, 0)); axes(c, f, t('ch7.cv.x'), t(seq ? 'ch7.cv.yseq' : 'ch7.cv.yrand'));
      c.fillStyle = C.mute; spacedTicks(c, [1, 3, 5, 7, 9, 11, 13, 15].map(n => [f.X(n), String(n)]), f.B + 11);
      if (seq) { const cap = PM.seq(1, 'fbs', gen()).cap; c.strokeStyle = C.red; c.setLineDash([5, 4]); c.lineWidth = 1.3; c.beginPath(); c.moveTo(f.L, f.Y(cap)); c.lineTo(f.R, f.Y(cap)); c.stroke(); c.setLineDash([]); }
      for (const md of ['cbs', 'fbs']) { const pts = []; for (let n = 1; n <= 15; n++) pts.push([n, Math.min(agg(n, md), ymax)]); path(c, pts, f.X, f.Y, md === 'fbs' ? C.gold : C.cyan, md === mode() ? 2.8 : 1.5); }
      const n = +sN.value; dot(c, f.X(n), f.Y(Math.min(agg(n, mode()), ymax)), mode() === 'fbs' ? C.gold : C.cyan, 5.5);
    }
  });
  function text() {
    const n = +sN.value, md = mode(), wk = work(), g = gen();
    put('#pmNo', fmt(n, 0));
    if (wk === 'seq') { const r = PM.seq(n, md, g); put('#pmAgg', t('u.MBps', { v: fmt(r.mbps, 0) })); put('#pmOne', t('u.MBps', { v: fmt(PM.exosMBps, 0) })); put('#pmCap', t('u.MBps', { v: fmt(r.cap, 0) })); }
    else { rnd(); put('#pmAgg', t('ch7.unit.iops', { v: fmt(agg(n, md), 0) })); put('#pmOne', t('ch7.unit.iops', { v: fmt(randOne, 0) })); put('#pmCap', '—'); }
    const z = M.say.pm(n, md, wk, g, Q), v = z.v;
    putHTML('#pmSay', t(z.key, { n, mbps: fmt(v.mbps, 0), cap: fmt(v.cap, 0), demand: fmt(v.demand, 0), iops: fmt(v.iops, 0), one: fmt(v.one, 0), link: t('ch7.link.' + g) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); ['pmM', 'pmW', 'pmL'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── 08 hard-disk outer-edge rate against the link ───────── */
(() => {
  const cv = $('#hdCv'), sD = $('#hdD'), H = M.HDD;
  const rpm = () => +radioVal('hdR'), hbd = () => +radioVal('hdH');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), od = H.od(rpm(), +sD.value, hbd()), max = 2400, L = 12, R = w - 12, X = v => L + (R - L) * Math.min(v, max) / max, y = h * 0.42, bh = 22;
      c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh);
      c.fillStyle = od >= H.ssdSeq ? C.red : C.gold; c.fillRect(L, y - bh / 2, X(od) - L, bh);
      const marks = [[M.LINK.wire(256, 2).mbps, 'ch8.cv.gen2'], [H.ssdSeq, 'ch8.cv.ssd']];
      const taken = [];
      marks.forEach(([v, k], i) => { const x = X(v); c.strokeStyle = C.ink; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y - bh / 2 - 6); c.lineTo(x, y + bh / 2 + 6); c.stroke();
        c.font = FONT; const s = t(k), tw = c.measureText(s).width; let x0 = M.clamp(x - tw / 2, L, R - tw); let row = 0; while (taken.some(p => p.row === row && x0 < p.x1 + 6 && x0 + tw > p.x0 - 6)) row++; taken.push({ row, x0, x1: x0 + tw });
        tag(c, s, x0, y + bh / 2 + 16 + row * 16, C.mute, 'left'); });
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch8.cv.x'), L, 12);
      spacedTicks(c, [0, 600, 1200, 1800, 2400].map(v => [M.clamp(X(v), L + 10, R - 18), fmt(v, 0)]), y - bh / 2 - 14);
    }
  });
  function text() {
    const r = rpm(), d = +sD.value, hb = hbd(), z = M.say.hdd(r, d, hb), v = z.v;
    put('#hdDo', t('ch8.unit.x', { v: fmt(d, 1) }));
    put('#hdOd', t('u.MBps', { v: fmt(v.od, 0) })); put('#hdShare', pct(v.share)); put('#hdNeed', t('ch8.unit.x', { v: fmt(v.need, 1) }));
    putHTML('#hdSay', t(z.key, { od: fmt(v.od, 0), ssd: fmt(v.ssd, 0), share: pct(v.share), need: fmt(v.need, 1), rpm: r }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sD.addEventListener('input', go); onAll(radios('hdR'), 'change', go); onAll(radios('hdH'), 'change', go);
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
