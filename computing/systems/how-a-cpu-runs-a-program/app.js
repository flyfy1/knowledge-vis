/* How a CPU runs a program: wiring, drawing, diagrams, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.CpuModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', dim: '#9098a8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
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
const ps = x => t('u.ps', { v: fmt(x, 0) });
const ns = (x, d) => t('u.ns', { v: fmt(x, d == null ? 1 : d) });
const cyc = (x, d) => t('u.cyc', { v: fmt(x, d == null ? (Number.isInteger(x) ? 0 : 1) : d) });
const times = (x, d) => t('u.x', { v: fmt(x, d == null ? 1 : d) });
const hx = n => '0x' + (n >>> 0).toString(16);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
let PROSE = null, PV = {};
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : fmt(v, d); return o; }
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
  document.querySelectorAll('[data-legend=pipe]').forEach(e => {
    const items = [['IF', C.cyan], ['ID', C.violet], ['EX', C.gold], ['MEM', C.green], ['WB', C.mute], ['stall', C.red], ['flush', '#6b3a3a']];
    e.innerHTML = items.map(([k, col]) => `<span><i style="background:${col}"></i>${esc(t('ch6.leg.' + k))}</span>`).join('');
  });
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
const setRadio = (name, v) => { const r = radios(name).find(x => x.value === v); if (r) r.checked = true; };
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));

/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, labels from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, column ≥ 600 px) and 'n' (viewBox 340 wide). Text is 14 units, so it renders at
   ≥ 11.8 px in either layout at its narrowest. A label with a width limit wraps onto more lines. */
const NS = 'http://www.w3.org/2000/svg';
const FS = 14, LH = 18;
function S(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function mk(svg) {
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; S('rect', { x, y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: o.solid ? col : tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    poly(pts, col, o) { o = o || {}; S('polyline', { points: pts.map(p => p.join(',')).join(' '), fill: 'none', stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'stroke-linejoin': 'round', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    mux(x, y, w, h, col) { S('path', { d: `M${x},${y} L${x + w},${y + Math.min(8, h / 5)} L${x + w},${y + h - Math.min(8, h / 5)} L${x},${y + h} Z`, fill: tint(col, 0.13), stroke: col, 'stroke-width': 1.4 }, svg); },
    hatch(x, y, w, h, col) { S('rect', { x, y, width: w, height: h, rx: 3, fill: 'url(#hatch)', stroke: col, 'stroke-width': 1.2 }, svg); },
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, Object.assign({}, PV, o.vars || {}));
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
  const p = S('pattern', { id: 'hatch', width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
  S('rect', { width: 7, height: 7, fill: tint(C.red, 0.12) }, p); S('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: tint(C.red, 0.55), 'stroke-width': 2 }, p);
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

// 01 the ISA as a contract between layers
DG.layers = (L) => {
  if (L === 'w') return { W: 720, H: 372, draw(g) {
    g.box(200, 14, 320, 38, C.cyan); g.text(360, 33, 'dg.layers.c', { a: 'middle', mono: 1 });
    g.line(360, 52, 360, 86, C.mute, { arrow: 1 }); g.text(372, 69, 'dg.layers.comp', { c: 'm' });
    g.box(120, 90, 230, 38, C.cyan); g.text(235, 109, 'dg.layers.asm', { a: 'middle', mono: 1 });
    g.box(370, 90, 230, 38, C.cyan); g.text(485, 109, 'dg.layers.mc', { a: 'middle', mono: 1 });
    g.line(10, 176, 710, 176, C.gold, { dash: '7 5', sw: 2 });
    g.text(20, 160, 'dg.layers.sw', { c: 'm' }); g.text(360, 160, 'dg.layers.isa', { a: 'middle', c: 'g', weight: 600 }); g.text(700, 160, 'dg.layers.isaEx', { a: 'end', c: 'g' });
    g.text(20, 194, 'dg.layers.hw', { c: 'm' }); g.text(360, 216, 'dg.layers.micro', { a: 'middle' });
    [['u1', 'u1s'], ['u2', 'u2s'], ['u3', 'u3s']].forEach(([a, b], i) => { const x = 40 + i * 220; g.box(x, 236, 200, 58, C.violet); g.text(x + 100, 256, 'dg.layers.' + a, { a: 'middle', c: 'v' }); g.text(x + 100, 278, 'dg.layers.' + b, { a: 'middle', c: 'm' }); g.line(x + 100, 294, x + 100, 318, C.mute, { arrow: 1 }); });
    g.box(200, 322, 320, 38, C.green); g.text(360, 341, 'dg.layers.gates', { a: 'middle', c: 'n' });
  } };
  return { W: 340, H: 486, draw(g) {
    g.box(10, 10, 320, 38, C.cyan); g.text(170, 29, 'dg.layers.c', { a: 'middle', mono: 1 });
    g.line(170, 48, 170, 76, C.mute, { arrow: 1 }); g.text(182, 62, 'dg.layers.comp', { c: 'm' });
    g.box(10, 80, 320, 36, C.cyan); g.text(170, 98, 'dg.layers.asm', { a: 'middle', mono: 1 });
    g.box(10, 124, 320, 36, C.cyan); g.text(170, 142, 'dg.layers.mc', { a: 'middle', mono: 1 });
    g.text(170, 184, 'dg.layers.isaS', { a: 'middle', c: 'g', weight: 600 });
    g.line(10, 200, 330, 200, C.gold, { dash: '7 5', sw: 2 });
    g.text(170, 216, 'dg.layers.isaEx', { a: 'middle', c: 'g' });
    g.text(170, 246, 'dg.layers.micro', { a: 'middle', w: 320, va: 'mid' });
    [['u1', 'u1s'], ['u2', 'u2s'], ['u3', 'u3s']].forEach(([a, b], i) => { const y = 266 + i * 56; g.box(10, y, 320, 46, C.violet); g.text(24, y + 23, 'dg.layers.' + a, { c: 'v' }); g.text(316, y + 23, 'dg.layers.' + b, { a: 'end', c: 'm' }); });
    g.line(170, 434, 170, 444, C.mute, { arrow: 1 });
    g.box(10, 446, 320, 34, C.green); g.text(170, 463, 'dg.layers.gates', { a: 'middle', c: 'n' });
  } };
};

// 02 the six formats, drawn to bit width
const FIELD_COL = n => /^imm/.test(n) ? C.gold : n === 'rs1' ? C.cyan : n === 'rs2' ? C.violet : n === 'rd' ? C.green : C.mute;
const FIELD_CLS = n => /^imm/.test(n) ? 'g' : n === 'rs1' ? 'c' : n === 'rs2' ? 'v' : n === 'rd' ? 'n' : 'm';
const SHORT = { funct7: 'f7', funct3: 'f3', opcode: 'op' };
DG.fmt = (L) => {
  const wide = L === 'w', x0 = wide ? 60 : 34, x1 = wide ? 704 : 334, bw = (x1 - x0) / 32, top = wide ? 30 : 22, rh = wide ? 34 : 30, gap = wide ? 12 : 10;
  const H = top + 6 * (rh + gap) + (wide ? 0 : 44);
  const X = bit => x0 + (31 - bit) * bw;
  return { W: wide ? 720 : 340, H, draw(g) {
    const marks = wide ? [31, 25, 24, 20, 19, 15, 14, 12, 11, 7, 6, 0] : [31, 0];
    for (const m of marks) g.text(X(m) + bw / 2, top - 14, { raw: String(m) }, { a: 'middle', c: 'm', mono: 1 });
    M.FORMAT_ORDER.forEach((f, i) => {
      const y = top + i * (rh + gap);
      g.text(wide ? 30 : 14, y + rh / 2, { raw: f }, { a: 'middle', weight: 700 });
      for (const [name, hi, lo] of M.FORMATS[f]) {
        const col = FIELD_COL(name), x = X(hi), w = (hi - lo + 1) * bw;
        g.box(x + 1, y, w - 2, rh, col, { rx: 4, a: 0.14 });
        const lab = wide ? name : (SHORT[name] || (/^imm/.test(name) ? 'imm' : name));
        g.text(x + w / 2, y + rh / 2, { raw: lab }, { a: 'middle', c: FIELD_CLS(name), mono: 1 });
      }
    });
    if (!wide) g.text(10, top + 6 * (rh + gap) + 14, 'dg.fmt.legend', { c: 'm', w: 320 });
  } };
};

// 04 the single-cycle datapath
DG.single = (L) => {
  if (L === 'w') return { W: 720, H: 404, draw(g) {
    const ctrlDash = '5 4';
    // wires first, boxes on top
    g.poly([[70, 200], [100, 200]], C.mute, { arrow: 1 });
    g.poly([[45, 180], [45, 75], [100, 75]], C.mute, { arrow: 1 });
    g.poly([[45, 122], [430, 122], [430, 92], [445, 92]], C.mute, { arrow: 1 });
    g.poly([[210, 200], [260, 200]], C.cyan, { arrow: 1 });
    g.poly([[232, 200], [232, 300], [260, 300]], C.cyan, { arrow: 1 });
    g.poly([[155, 240], [155, 290]], C.cyan, { arrow: 1 });
    g.poly([[370, 300], [392, 300], [392, 228], [400, 228]], C.gold, { arrow: 1 });
    g.poly([[392, 300], [392, 70], [445, 70]], C.gold, { arrow: 1 });
    g.poly([[370, 182], [445, 182]], C.cyan, { arrow: 1 });
    g.poly([[370, 208], [400, 208]], C.cyan, { arrow: 1 });
    g.poly([[420, 215], [445, 215]], C.cyan, { arrow: 1 });
    g.poly([[382, 208], [382, 256], [532, 256], [532, 224], [545, 224]], C.violet, { arrow: 1 });
    g.poly([[515, 198], [545, 198]], C.cyan, { arrow: 1 });
    g.poly([[525, 198], [525, 148], [660, 148], [660, 190], [670, 190]], C.cyan, { arrow: 1 });
    g.poly([[645, 212], [670, 212]], C.green, { arrow: 1 });
    g.poly([[690, 205], [706, 205], [706, 346], [242, 346], [242, 236], [260, 236]], C.green, { arrow: 1 });
    g.poly([[150, 75], [548, 75], [548, 64], [560, 64]], C.mute, { arrow: 1 });
    g.poly([[515, 82], [540, 82], [540, 96], [560, 96]], C.gold, { arrow: 1 });
    g.poly([[480, 160], [480, 134], [570, 134], [570, 110]], C.red, { arrow: 1 });
    g.poly([[580, 80], [598, 80], [598, 30], [12, 30], [12, 200], [20, 200]], C.mute, { arrow: 1 });
    g.poly([[155, 330], [155, 366]], C.red, { dash: ctrlDash });
    // boxes
    g.box(20, 180, 50, 40, C.mute); g.text(45, 200, 'dg.sc.pc', { a: 'middle', weight: 600 });
    g.box(100, 58, 50, 34, C.mute, { rx: 6 }); g.text(125, 75, 'dg.sc.add4', { a: 'middle' });
    g.box(445, 56, 70, 46, C.gold, { rx: 6 }); g.text(480, 79, 'dg.sc.addB', { a: 'middle', c: 'g' });
    g.mux(560, 50, 20, 60, C.mute); g.text(570, 80, 'dg.sc.mux', { a: 'middle', c: 'm' });
    g.text(584, 124, 'dg.sc.pcsrc', { c: 'r' });
    g.box(100, 160, 110, 80, C.cyan); g.text(155, 200, 'dg.sc.imem', { a: 'middle', c: 'c' });
    g.box(260, 150, 110, 100, C.violet); g.text(315, 200, 'dg.sc.regs', { a: 'middle', c: 'v' });
    g.text(272, 268, 'dg.sc.rs', { c: 'm', mono: 1 });
    g.box(260, 282, 110, 38, C.gold); g.text(315, 301, 'dg.sc.imm', { a: 'middle', c: 'g' });
    g.mux(400, 186, 20, 58, C.mute); g.text(410, 215, 'dg.sc.mux', { a: 'middle', c: 'm' });
    g.box(445, 160, 70, 80, C.gold); g.text(480, 200, 'dg.sc.alu', { a: 'middle', c: 'g', weight: 600 });
    g.box(545, 160, 100, 80, C.green); g.text(595, 200, 'dg.sc.dmem', { a: 'middle', c: 'n' });
    g.mux(670, 176, 20, 58, C.mute); g.text(680, 205, 'dg.sc.mux', { a: 'middle', c: 'm' });
    g.text(474, 362, 'dg.sc.wb', { a: 'middle', c: 'n' });
    g.box(100, 290, 110, 40, C.red, { dash: ctrlDash }); g.text(155, 310, 'dg.sc.ctrl', { a: 'middle', c: 'r' });
    g.text(20, 388, 'dg.sc.sig', { c: 'r', mono: 1, fs: 13.5 });
  } };
  return { W: 340, H: 590, draw(g) {
    g.poly([[55, 46], [55, 78]], C.mute, { arrow: 1 });
    g.poly([[90, 28], [138, 28]], C.mute, { arrow: 1 });
    g.poly([[200, 28], [248, 28]], C.mute, { arrow: 1 });
    g.poly([[150, 100], [188, 100]], C.cyan, { arrow: 1 });
    g.poly([[85, 122], [85, 158]], C.cyan, { arrow: 1 });
    g.poly([[150, 112], [176, 112], [176, 140], [258, 140], [258, 158]], C.cyan, { arrow: 1 });
    g.poly([[258, 206], [258, 236], [152, 236]], C.gold, { arrow: 1 });
    g.poly([[300, 206], [300, 288]], C.gold, { arrow: 1 });
    g.poly([[60, 206], [60, 288]], C.cyan, { arrow: 1 });
    g.poly([[118, 206], [118, 226]], C.cyan, { arrow: 1 });
    g.poly([[118, 262], [118, 288]], C.cyan, { arrow: 1 });
    g.poly([[85, 330], [85, 358]], C.cyan, { arrow: 1 });
    g.poly([[85, 400], [85, 428]], C.green, { arrow: 1 });
    g.poly([[150, 443], [172, 443], [172, 183], [152, 183]], C.green, { arrow: 1 });
    g.poly([[330, 310], [336, 310], [336, 28], [282, 28]], C.gold, { arrow: 1 });
    // boxes
    g.box(20, 10, 70, 36, C.mute); g.text(55, 28, 'dg.sc.pc', { a: 'middle', weight: 600 });
    g.box(140, 10, 60, 36, C.mute, { rx: 6 }); g.text(170, 28, 'dg.sc.add4', { a: 'middle' });
    g.mux(250, 8, 30, 40, C.mute); g.text(265, 28, 'dg.sc.mux', { a: 'middle', c: 'm' });
    g.box(20, 80, 130, 42, C.cyan); g.text(85, 101, 'dg.sc.imem', { a: 'middle', c: 'c' });
    g.box(190, 80, 140, 42, C.red, { dash: '5 4' }); g.text(260, 101, 'dg.sc.ctrl', { a: 'middle', c: 'r' });
    g.box(20, 160, 130, 46, C.violet); g.text(85, 183, 'dg.sc.regs', { a: 'middle', c: 'v' });
    g.box(190, 160, 140, 46, C.gold); g.text(260, 183, 'dg.sc.imm', { a: 'middle', c: 'g' });
    g.mux(90, 228, 60, 34, C.mute); g.text(120, 245, 'dg.sc.mux', { a: 'middle', c: 'm' });
    g.box(20, 290, 130, 40, C.gold); g.text(85, 310, 'dg.sc.alu', { a: 'middle', c: 'g', weight: 600 });
    g.box(190, 290, 140, 40, C.gold, { rx: 6 }); g.text(260, 310, 'dg.sc.addB', { a: 'middle', c: 'g' });
    g.box(20, 360, 130, 40, C.green); g.text(85, 380, 'dg.sc.dmem', { a: 'middle', c: 'n' });
    g.mux(20, 430, 130, 28, C.mute); g.text(85, 444, 'dg.sc.mux', { a: 'middle', c: 'm' });
    g.text(182, 420, 'dg.sc.wb', { c: 'n' });
    g.text(265, 63, 'dg.sc.pcsrc', { a: 'middle', c: 'r' });
    g.text(10, 490, 'dg.sc.sigN', { c: 'r', weight: 600 });
    g.text(10, 514, 'dg.sc.sig', { c: 'r', mono: 1, w: 320 });
  } };
};

// 06 the pipelined datapath
DG.pipe = (L) => {
  const stages = ['IF', 'ID', 'EX', 'MEM', 'WB'], regs = ['r1', 'r2', 'r3', 'r4'];
  if (L === 'w') return { W: 720, H: 290, draw(g) {
    const cols = [[20, 132], [162, 294], [324, 444], [476, 598], [628, 700]], bars = [140, 302, 454, 606];
    // wires
    g.poly([[44, 140], [52, 140]], C.mute, { arrow: 1 });
    g.poly([[136, 140], [168, 140]], C.cyan, { arrow: 1 });
    g.poly([[284, 120], [348, 120]], C.cyan, { arrow: 1 });
    g.poly([[284, 160], [348, 160]], C.cyan, { arrow: 1 });
    g.poly([[420, 140], [488, 140]], C.cyan, { arrow: 1 });
    g.poly([[436, 140], [436, 204], [640, 204], [640, 160], [648, 160]], C.cyan, { arrow: 1 });
    g.poly([[584, 130], [648, 130]], C.green, { arrow: 1 });
    g.poly([[680, 140], [706, 140], [706, 236], [226, 236], [226, 187]], C.green, { arrow: 1 });
    stages.forEach((s, i) => g.text((cols[i][0] + cols[i][1]) / 2, 22, 'dg.pp.' + s, { a: 'middle', c: 'g', weight: 600 }));
    bars.forEach((x, i) => { g.box(x, 46, 12, 204, C.violet, { rx: 3, a: 0.3 }); g.text(x + 6, 270, 'dg.pp.' + regs[i], { a: 'middle', c: 'v', mono: 1 }); });
    g.box(14, 122, 30, 36, C.mute, { rx: 5 }); g.text(29, 140, { raw: 'PC' }, { a: 'middle', fs: 12.5 });
    g.box(52, 104, 84, 72, C.cyan); g.text(94, 140, 'dg.pp.imem', { a: 'middle', c: 'c', w: 80, va: 'mid' });
    g.box(170, 94, 114, 92, C.violet); g.text(227, 140, 'dg.pp.regs', { a: 'middle', c: 'v' });
    g.box(350, 100, 70, 80, C.gold); g.text(385, 140, 'dg.pp.alu', { a: 'middle', c: 'g', weight: 600 });
    g.box(490, 100, 94, 80, C.green); g.text(537, 140, 'dg.pp.dmem', { a: 'middle', c: 'n' });
    g.mux(650, 110, 30, 60, C.mute); g.text(665, 140, 'dg.pp.mux', { a: 'middle', c: 'm' });
    g.text(466, 222, 'dg.pp.back', { a: 'middle', c: 'n' });
  } };
  return { W: 340, H: 470, draw(g) {
    const top = i => 10 + i * 94;
    stages.forEach((s, i) => {
      const y = top(i);
      g.text(12, y + 26, 'dg.pp.' + s, { c: 'g', weight: 600 });
      if (i < 4) { g.box(10, y + 62, 320, 10, C.violet, { rx: 3, a: 0.3 }); g.text(12, y + 84, 'dg.pp.' + regs[i], { c: 'v', mono: 1 }); g.line(220, y + 52, 220, y + 100, C.cyan, { arrow: 1 }); }
    });
    g.box(110, top(0) + 8, 40, 36, C.mute, { rx: 5 }); g.text(130, top(0) + 26, { raw: 'PC' }, { a: 'middle' });
    g.box(160, top(0) + 4, 170, 44, C.cyan); g.text(245, top(0) + 26, 'dg.pp.imem', { a: 'middle', c: 'c' });
    g.box(110, top(1) + 4, 220, 44, C.violet); g.text(220, top(1) + 26, 'dg.pp.regs', { a: 'middle', c: 'v' });
    g.box(110, top(2) + 4, 220, 44, C.gold); g.text(220, top(2) + 26, 'dg.pp.alu', { a: 'middle', c: 'g', weight: 600 });
    g.box(110, top(3) + 4, 220, 44, C.green); g.text(220, top(3) + 26, 'dg.pp.dmem', { a: 'middle', c: 'n' });
    g.mux(110, top(4) + 4, 40, 44, C.mute); g.text(130, top(4) + 26, 'dg.pp.mux', { a: 'middle', c: 'm' });
    g.text(160, top(4) + 18, 'dg.pp.backS', { c: 'n' });
    g.poly([[150, top(4) + 40], [336, top(4) + 40], [336, top(1) + 26], [332, top(1) + 26]], C.green, { arrow: 1 });
  } };
};

// pipeline-diagram snippets from the model (07, 08)
function gridSnippet(L, rows, c0, c1, o) {
  const wide = L === 'w', lw = wide ? 190 : 46, x0 = lw + 6, W = wide ? 720 : 340, cw = (W - 6 - x0) / (c1 - c0 + 1), top = 34, rh = 34, gap = 10;
  const X = c => x0 + (c - c0) * cw, Y = i => top + i * (rh + gap);
  const H = top + rows.length * (rh + gap) + (o.extraH || 0);
  return { W, H, X, Y, cw, rh, draw(g) {
    for (let c = c0; c <= c1; c++) g.text(X(c) + cw / 2, 14, wide ? 'dg.fwd.cyc' : { raw: String(c) }, { a: 'middle', c: 'm', vars: { c } });
    rows.forEach((r, i) => {
      const y = Y(i), ins = M.PROG[o.v][r.k];
      g.text(8, y + rh / 2, { raw: wide ? ins.src.replace(/,\s*/g, ', ') : r.op }, { mono: 1, c: r.flushed ? 'r' : '' });
      const cells = [];
      for (let c = r.F; c <= (r.flushed ? r.end : r.W); c++) {
        let st;
        if (c === r.F) st = 'IF'; else if (c < r.ID0) st = 'IFs'; else if (c <= r.D) st = c < r.D ? 'IDs' : 'ID';
        else if (c === r.E) st = 'EX'; else if (c === r.M) st = 'MEM'; else if (c === r.W) st = 'WB';
        if (st) cells.push([c, st]);
      }
      for (const [c, st] of cells) {
        const col = { IF: C.cyan, IFs: C.red, ID: C.violet, IDs: C.red, EX: C.gold, MEM: C.green, WB: C.mute }[st];
        if (st.endsWith('s')) g.hatch(X(c) + 2, y, cw - 4, rh, C.red); else g.box(X(c) + 2, y, cw - 4, rh, r.flushed ? C.red : col, { rx: 4, a: r.flushed ? 0.08 : 0.16 });
        g.text(X(c) + cw / 2, y + rh / 2, st.endsWith('s') ? 'dg.fwd.stall' : { raw: st }, { a: 'middle', c: st.endsWith('s') ? 'r' : r.flushed ? 'm' : { IF: 'c', ID: 'v', EX: 'g', MEM: 'n', WB: 'm' }[st], mono: !st.endsWith('s') });
      }
      if (r.flushed) g.line(X(r.F) + 2, y + rh / 2, X(r.end) + cw - 2, y + rh / 2, C.red, { sw: 2 });
    });
    if (o.after) o.after(g, X, Y, cw, rh);
  } };
}
DG.fwd = (L) => {
  const P = M.pipeline('v1', 2), rows = P.rows.slice(2, 6), c0 = rows[0].F, c1 = rows[3].W, wide = L === 'w';
  const s = gridSnippet(L, rows, c0, c1, { v: 'v1', extraH: wide ? 0 : 60, after(g, X, Y, cw, rh) {
    const [sl, ad, lw, a0] = rows;
    g.line(X(sl.E) + cw - 6, Y(0) + rh, X(ad.E) + 8, Y(1) - 1, C.gold, { arrow: 1, sw: 2.2 });
    g.line(X(lw.M) + cw - 6, Y(2) + rh, X(a0.E) + 8, Y(3) - 1, C.green, { arrow: 1, sw: 2.2 });
    if (wide) { g.text(X(sl.W + 1) + 6, Y(0) + rh / 2, 'dg.fwd.exmem', { c: 'g' }); g.text(X(lw.W + 1) + 6, Y(2) + rh / 2, 'dg.fwd.memwb', { c: 'n' }); }
    else { const yb = Y(4) + 6; g.line(10, yb, 34, yb, C.gold, { arrow: 1, sw: 2.2 }); g.text(42, yb, 'dg.fwd.exmem', { c: 'g' }); g.line(10, yb + 26, 34, yb + 26, C.green, { arrow: 1, sw: 2.2 }); g.text(42, yb + 26, 'dg.fwd.memwb', { c: 'n' }); }
  } });
  return s;
};
DG.flush = (L) => {
  const P = M.pipeline('v1', 2), bi = P.rows.findIndex(r => r.op === 'blt'), rows = P.rows.slice(bi, bi + 4), c0 = rows[0].F, c1 = rows[3].W, wide = L === 'w';
  return gridSnippet(L, rows, c0, c1, { v: 'v1', extraH: wide ? 0 : 34, after(g, X, Y, cw, rh) {
    const b = rows[0], tgt = rows[3];
    const xr = X(b.E) + cw; g.poly([[xr - 6, Y(0) + rh / 2], [xr, Y(0) + rh / 2], [xr, Y(3) - 5], [X(tgt.F) + 10, Y(3) - 5], [X(tgt.F) + 10, Y(3) - 1]], C.gold, { arrow: 1, sw: 2 });
    if (wide) { g.text(X(rows[1].end + 1) + 6, Y(1) + rh / 2, 'dg.flush.x', { c: 'r' }); g.text(X(rows[2].end + 1) + 6, Y(2) + rh / 2, 'dg.flush.x', { c: 'r' }); g.text(X(b.W + 1) + 6, Y(0) + rh / 2, 'dg.flush.redirect', { c: 'g' }); }
    else { const yb = Y(4) + 6; g.line(10, yb, 34, yb, C.red, { sw: 2 }); g.text(42, yb, 'dg.flush.x', { c: 'r' }); g.text(140, yb, 'dg.flush.redirect', { c: 'g' }); }
  } });
};

// 09 the iron law
DG.iron = (L) => {
  const parts = [['ic', C.cyan, 'c'], ['cpi', C.violet, 'v'], ['t', C.green, 'n']];
  if (L === 'w') return { W: 720, H: 236, draw(g) {
    g.box(14, 40, 118, 50, C.gold); g.text(73, 65, 'dg.iron.time', { a: 'middle', c: 'g', weight: 600 });
    g.text(150, 65, { raw: '=' }, { a: 'middle', fs: 20 });
    parts.forEach(([k, col, cls], i) => {
      const x = 170 + i * 186;
      g.box(x, 40, 160, 50, col); g.text(x + 80, 65, 'dg.iron.' + k, { a: 'middle', c: cls, weight: 600 });
      if (i < 2) g.text(x + 173, 65, { raw: '×' }, { a: 'middle', fs: 20 });
      g.line(x + 80, 90, x + 80, 116, col, { arrow: 1 });
      g.text(x + 4, 134, 'dg.iron.' + k + 'By', { w: 156 });
      g.text(x + 4, 186, 'dg.iron.' + k + 'Ex', { c: 'm', w: 156 });
    });
  } };
  return { W: 340, H: 506, draw(g) {
    g.box(10, 10, 320, 42, C.gold); g.text(170, 31, 'dg.iron.time', { a: 'middle', c: 'g', weight: 600 });
    g.text(170, 70, { raw: '=' }, { a: 'middle', fs: 20 });
    parts.forEach(([k, col, cls], i) => {
      const y = 88 + i * 140;
      g.box(10, y, 320, 40, col); g.text(170, y + 20, 'dg.iron.' + k, { a: 'middle', c: cls, weight: 600 });
      g.text(14, y + 58, 'dg.iron.' + k + 'By', { w: 312 });
      g.text(14, y + 82, 'dg.iron.' + k + 'Ex', { c: 'm', w: 312 });
      if (i < 2) g.text(170, y + 118, { raw: '×' }, { a: 'middle', fs: 20 });
    });
  } };
};

// 10 one x86 instruction becomes four RISC-like steps
DG.uops = (L) => {
  const us = ['u1', 'u2', 'u3', 'u4'], cols = [C.violet, C.cyan, C.gold, C.green], cls = ['v', 'c', 'g', 'n'];
  if (L === 'w') return { W: 720, H: 290, draw(g) {
    g.box(14, 50, 316, 84, C.red); g.text(172, 76, 'dg.uops.asm', { a: 'middle', mono: 1 }); g.text(172, 108, 'dg.uops.bytes', { a: 'middle', mono: 1, c: 'r' });
    g.line(330, 92, 354, 92, C.mute, { arrow: 1 });
    g.box(356, 70, 84, 44, C.mute); g.text(398, 92, 'dg.uops.dec', { a: 'middle' });
    us.forEach((u, i) => { const y = 14 + i * 46; g.line(440, 92, 462, y + 18, C.mute, { arrow: 1 }); g.box(464, y, 242, 36, cols[i], { rx: 6 }); g.text(476, y + 18, 'dg.uops.' + u, { c: cls[i] }); });
    g.line(585, 196, 585, 222, C.mute, { arrow: 1 });
    g.box(464, 226, 242, 44, C.gold, { a: 0.07 }); g.text(585, 248, 'dg.uops.back', { a: 'middle', w: 230, va: 'mid' });
  } };
  return { W: 340, H: 452, draw(g) {
    g.box(10, 10, 320, 76, C.red); g.text(170, 34, 'dg.uops.asm', { a: 'middle', mono: 1, fs: 13.5 }); g.text(170, 62, 'dg.uops.bytes', { a: 'middle', mono: 1, c: 'r' });
    g.line(170, 86, 170, 104, C.mute, { arrow: 1 });
    g.box(110, 106, 120, 40, C.mute); g.text(170, 126, 'dg.uops.dec', { a: 'middle' });
    g.line(170, 146, 170, 164, C.mute, { arrow: 1 });
    us.forEach((u, i) => { const y = 168 + i * 46; g.box(10, y, 320, 36, cols[i], { rx: 6 }); g.text(22, y + 18, 'dg.uops.' + u, { c: cls[i] }); });
    g.line(170, 350, 170, 370, C.mute, { arrow: 1 });
    g.box(10, 374, 320, 44, C.gold, { a: 0.07 }); g.text(170, 396, 'dg.uops.back', { a: 'middle', w: 300, va: 'mid' });
  } };
};

const dgLayout = new Map();
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
  // captions that quote cycle numbers from the model
  const P = M.pipeline('v1', 2), rows = P.rows.slice(2, 6), bi = P.rows.findIndex(r => r.op === 'blt');
  const fc = document.querySelector('[data-i18n-html="dg.fwd.cap"]'); if (fc) fc.innerHTML = t('dg.fwd.cap', Object.assign({}, PV, { c1: rows[0].E, c2: rows[2].M }));
  const lc = document.querySelector('[data-i18n-html="dg.flush.cap"]'); if (lc) lc.innerHTML = t('dg.flush.cap', Object.assign({}, PV, { c: P.rows[bi].E }));
}

/* ───────── 02 assembler / disassembler ───────── */
(() => {
  const inp = $('#asIn');
  const EX = { R: 'add a0, a0, t2', I: 'lw t2, 0(t1)', S: 'sw a0, 0(a3)', B: 'blt t0, a2, -20', U: 'lui a0, 0x12345', J: 'jal ra, 2048' };
  function read() {
    const s = inp.value.trim();
    if (!s) return null;
    if (/^0x[0-9a-f]{1,8}$/i.test(s)) { const w = parseInt(s, 16) >>> 0, o = M.decode(w); return o ? { ok: true, o, w } : { ok: false, err: 'hex' }; }
    return M.parse(s, null, 0);
  }
  function text() {
    const r = read(), z = M.say.asm(r);
    if (r && r.ok) {
      const f = r.o.f, fs = M.fields(r.w, f);
      setRadio('asF', f);
      const cls = n => /^imm/.test(n) ? 'o' : n === 'rs1' ? 'x' : n === 'rs2' ? 't' : n === 'rd' ? 'n' : '';
      const val = (fd) => (fd.name === 'rs1' || fd.name === 'rs2' || fd.name === 'rd') ? 'x' + fd.value + ' · ' + M.ABI[fd.value] : fd.name === 'opcode' || /^funct/.test(fd.name) ? '' : '';
      putHTML('#asBits', fs.map(fd => `<span class="${cls(fd.name)}"><i>${esc(fd.name)} · ${fd.hi}:${fd.lo}</i><b>${M.bin(fd.value, fd.width)}</b><i>${esc(val(fd))}</i></span>`).join(''));
      put('#asHex', M.hex8(r.w)); put('#asFmt', t('ch2.fmt.' + f)); put('#asAsm', M.disasm(r.o));
      const colr = n => ({ o: 'g', x: 'c', t: 'v', n: 'n', '': 'm' })[cls(n)];
      putHTML('#asBin', fs.map(fd => `<span class="${colr(fd.name)}">${M.bin(fd.value, fd.width)}</span>`).join(' '));
      const d = M.OPS[r.o.op];
      putHTML('#asSay', t(z.key, { op: M.bin(d.op, 7), f3: M.bin(d.f3 | 0, 3), f7: M.bin(d.f7 | 0, 7), name: r.o.op, rs1: M.ABI[r.o.rs1 | 0], rs2: M.ABI[r.o.rs2 | 0], rd: M.ABI[r.o.rd | 0], imm: r.o.f === 'U' ? hx(r.o.imm) : String(r.o.imm), brKiB: PV.brKiB, jalMiB: PV.jalMiB }));
    } else {
      putHTML('#asBits', ''); put('#asHex', t('u.none')); put('#asFmt', t('u.none')); put('#asAsm', t('u.none')); putHTML('#asBin', '');
      putHTML('#asSay', t(z.key, { brKiB: PV.brKiB, jalMiB: PV.jalMiB }));
    }
  }
  const sim = reg([], { draw() {}, text });
  inp.addEventListener('input', text);
  onAll(radios('asF'), 'change', () => { inp.value = EX[radioVal('asF')]; text(); });
  text();
})();

/* ───────── 03 the interpreter ───────── */
(() => {
  const sN = $('#inN'), ver = () => radioVal('inV'), n = () => +sN.value;
  let i = -1;
  const trace = () => M.run(ver(), n()).trace;
  function text() {
    const v = ver(), tr = trace(), prog = M.PROG[v];
    i = Math.min(i, tr.length - 1);
    const counts = new Array(prog.length).fill(0); for (let j = 0; j <= i; j++) counts[tr[j].k]++;
    const cur = i >= 0 ? tr[i].k : -1;
    putHTML('#inList', prog.map((ins, k) => `<tr class="${k === cur ? 'now' : ''}"><td>0x${ins.pc.toString(16).padStart(3, '0')}</td><td>${M.hex8(ins.w)}</td><td class="asm">${ins.label ? `<span class="lb">${esc(ins.label)}:</span> ` : ''}${esc(ins.src)}</td><td class="n">${counts[k]}</td></tr>`).join(''));
    const st = M.run(v, n(), i + 1), rd = i >= 0 ? tr[i].rd : -1;
    const show = v === 'v3' ? [5, 6, 7, 28, 10, 11, 12] : [5, 6, 7, 10, 11, 12];
    putHTML('#inRegs', show.map(r => `<div role="listitem" class="${r === rd ? 'ch' : ''}">${M.ABI[r]}<b>${st.x[r] > 255 ? hx(st.x[r]) : st.x[r]}</b></div>`).join(''));
    put('#inNo', fmt(n(), 0)); put('#inDone', t('u.ins', { v: fmt(i + 1, 0) })); put('#inTotal', t('u.ins', { v: fmt(tr.length, 0) }));
    put('#inPer', t('u.ins', { v: fmt(M.loopBody(v), 0) })); put('#inSum', fmt(st.x[10], 0));
    const e = i >= 0 ? tr[i] : null, z = M.say.interp(e);
    putHTML('#inSay', t(z.key, e ? { asm: esc(prog[e.k].src), rd: M.ABI[e.rd], val: e.res, addr: e.addr != null ? hx(e.addr) : '', to: hx(e.next), total: fmt(tr.length, 0), sum: fmt(st.x[10], 0) } : {}));
    if (e && e.op === 'sw') putHTML('#inSay', t(z.key, { asm: esc(prog[e.k].src), val: e.wr, addr: hx(e.addr) }));
  }
  const sim = reg([], { draw() {}, text });
  $('#inStep').addEventListener('click', () => { const tr = trace(); if (i < tr.length - 1) i++; text(); });
  $('#inAll').addEventListener('click', () => { i = trace().length - 1; text(); });
  $('#inReset').addEventListener('click', () => { i = -1; text(); });
  sN.addEventListener('input', () => { i = -1; text(); });
  onAll(radios('inV'), 'change', () => { i = -1; text(); });
  text();
})();

/* ───────── 04 the single-cycle stepper ───────── */
(() => {
  let i = 0; const V = 'v1', N = 2;
  function text() {
    const st = M.singleStep(V, N, i), e = st.e; i = st.i;
    putHTML('#scUnits', M.UNITS.map(u => `<span role="listitem" class="${st.units[u] ? 'on' : ''}">${esc(t('ch4.u.' + u))}</span>`).join(''));
    putHTML('#scSigs', M.SIGNALS.map(s => {
      const v = st.c[s]; let txt, cl;
      if (s === 'ALUOp') { txt = t('ch4.op.' + v); cl = 'one'; } else if (v == null) { txt = t('ch4.sig.x'); cl = 'x'; } else { txt = String(v); cl = v ? 'one' : ''; }
      return `<div role="listitem">${s}<b class="${cl}">${esc(txt)}</b></div>`;
    }).join(''));
    putHTML('#scIns', esc(st.ins.src) + ' <span class="nw">' + M.hex8(st.ins.w) + '</span>'); put('#scPc', hx(e.pc));
    put('#scAlu', `${st.aluA}, ${st.aluB} → ${st.row === 'load' || st.row === 'store' ? hx(st.aluOut) : st.aluOut}`); put('#scNextPc', hx(e.next));
    const z = M.say.single(st);
    putHTML('#scSay', t(z.key, { asm: esc(st.ins.src), val: e.res, rd: M.ABI[e.rd], imm: st.ins.o.imm, addr: e.addr != null ? hx(e.addr) : '', to: hx(e.next) }) + (z.key === 'ch4.say.store' ? '' : ''));
    if (z.key === 'ch4.say.store') putHTML('#scSay', t(z.key, { asm: esc(st.ins.src), val: e.wr, addr: hx(e.addr) }));
    $('#scPrev').disabled = i <= 0; $('#scNext').disabled = i >= st.total - 1;
  }
  const sim = reg([], { draw() {}, text });
  $('#scNext').addEventListener('click', () => { i++; text(); });
  $('#scPrev').addEventListener('click', () => { i = Math.max(0, i - 1); text(); });
  $('#scReset').addEventListener('click', () => { i = 0; text(); });
  text();
})();

/* ───────── 05 the critical path ───────── */
(() => {
  const cv = $('#cpCv'), sM = $('#cpM'), sA = $('#cpA'), sR = $('#cpR');
  const lat = () => ({ mem: +sM.value, alu: +sA.value, reg: +sR.value });
  const UCOL = { imem: C.cyan, regR: C.violet, regW: C.violet, alu: C.gold, dmem: C.green };
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = lat(), r = M.critical(L, 'v1', 1000), xmax = Math.max(r.period * 1.1, 900);
    c.font = FONT; const labs = M.CLASSES.map(k => t('ch5.cls.' + k)); const lw = Math.min(Math.max(...labs.map(s => c.measureText(s).width)) + 14, w * 0.3);
    const f = { L: lw, R: w - 12, T: 40, B: h - 34 }, X = v => f.L + (f.R - f.L) * v / xmax, rh = (f.B - f.T) / M.CLASSES.length;
    // grid and ticks
    c.strokeStyle = C.grid; c.fillStyle = C.mute; c.textAlign = 'center';
    const step = xmax > 1600 ? 500 : xmax > 800 ? 200 : 100; let lastR = -1e9;
    for (let v = 0; v <= xmax; v += step) { const x = X(v); c.beginPath(); c.moveTo(x, f.T - 4); c.lineTo(x, f.B); c.stroke(); const s = fmt(v, 0), tw = c.measureText(s).width; if (x - tw / 2 > lastR + 6 && x + tw / 2 < w - 2) { c.fillText(s, x, f.B + 12); lastR = x + tw / 2; } }
    c.textAlign = 'right'; c.fillText(t('ch5.cv.x'), f.R, f.B + 27);
    M.CLASSES.forEach((k, i) => {
      const y = f.T + i * rh + rh / 2, bh = Math.min(22, rh * 0.55);
      c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(labs[i], f.L - 8, y);
      let x = 0; for (const u of M.PATHS[k]) { const d = u === 'imem' || u === 'dmem' ? L.mem : u === 'alu' ? L.alu : L.reg; c.fillStyle = UCOL[u]; c.globalAlpha = 0.85; c.fillRect(X(x) + 0.5, y - bh / 2, X(x + d) - X(x) - 1, bh); c.globalAlpha = 1; x += d; }
      const s = ps(r.t[k]), tw = c.measureText(s).width; c.fillStyle = C.ink; c.textAlign = 'left';
      if (X(x) + 6 + tw <= w - 2) c.fillText(s, X(x) + 6, y); else { c.textAlign = 'right'; c.fillStyle = C.bg; c.fillText(s, X(x) - 6, y); }
    });
    const vline = (v, col, lab, ly) => { const x = X(v); c.strokeStyle = col; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(x, f.T - 6); c.lineTo(x, f.B); c.stroke(); c.setLineDash([]); c.lineWidth = 1;
      c.fillStyle = col; const s = lab + ' ' + ps(v), tw = c.measureText(s).width; c.textAlign = 'left'; c.fillText(s, Math.max(4, Math.min(x - tw / 2, w - tw - 4)), ly); };
    vline(r.period, C.gold, t('ch5.cv.clk'), 10); vline(r.stage, C.cyan, t('ch5.cv.stage'), 26);
  } });
  function text() {
    const L = lat(), r = M.critical(L, 'v1', 1000), z = M.say.crit(L);
    put('#cpMo', ps(L.mem)); put('#cpAo', ps(L.alu)); put('#cpRo', ps(L.reg));
    put('#cpP', ps(r.period)); put('#cpAvg', ps(r.avg)); put('#cpW', pct(r.waste, 0)); put('#cpS', ps(r.stage)); put('#cpI', times(r.ideal, 1));
    putHTML('#cpSay', t(z.key, { period: ps(r.period), avg: ps(r.avg), waste: pct(r.waste, 0), stage: ps(r.stage), ideal: times(r.ideal, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sM, sA, sR].forEach(s => s.addEventListener('input', go));
  text();
})();

/* ───────── 06–08 the pipeline simulator, three views ───────── */
const STCOL = { IF: C.cyan, ID: C.violet, EX: C.gold, MEM: C.green, WB: C.mute };
const ONE = { IF: 'F', ID: 'D', EX: 'X', MEM: 'M', WB: 'W' };
function cellsOf(r) {
  const out = [], end = r.flushed ? r.end : r.W;
  for (let c = r.F; c <= end; c++) {
    let st, held = false;
    if (c === r.F) st = 'IF'; else if (c < r.ID0) { st = 'IF'; held = true; } else if (c <= r.D) { st = 'ID'; held = c < r.D; }
    else if (!r.flushed && c === r.E) st = 'EX'; else if (!r.flushed && c === r.M) st = 'MEM'; else if (!r.flushed && c === r.W) st = 'WB';
    if (st) out.push({ c, st, held });
  }
  return out;
}
function drawPipe(cv, P, upto, arrows) {
  const rows = P.rows, wideL = cv.getBoundingClientRect().width >= 600, rh = wideL ? 20 : 17, top = 26;
  const want = top + rows.length * rh + 10 + 'px'; if (cv.style.height !== want) cv.style.height = want;
  const { c, w, h } = fit(cv);
  const prog = M.PROG[P.v], labOf = r => r.k >= 0 ? (wideL ? prog[r.k].src : prog[r.k].o.op) : '—';
  c.font = MONO; const lw = Math.min(Math.max(...rows.map(r => c.measureText(labOf(r)).width)) + 12, w * 0.34);
  const x0 = lw, cw = (w - x0 - 4) / P.cycles, X = cc => x0 + (cc - 1) * cw, Y = i => top + i * rh;
  // header ticks
  c.font = FONT; c.fillStyle = C.mute; c.textAlign = 'center';
  const every = cw >= 22 ? 1 : cw >= 11 ? 5 : 10;
  for (let cc = 1; cc <= P.cycles; cc++) if (cc === 1 || cc % every === 0) c.fillText(String(cc), X(cc) + cw / 2, 12);
  c.textAlign = 'right'; if (x0 > c.measureText(t('ch6.cv.cyc')).width + 10) c.fillText(t('ch6.cv.cyc'), x0 - 6, 12);
  rows.forEach((r, i) => {
    const y = Y(i);
    c.font = MONO; c.textAlign = 'left'; c.fillStyle = r.flushed ? C.red : C.ink;
    let lab = labOf(r); while (lab.length > 2 && c.measureText(lab).width > lw - 10) lab = lab.slice(0, -1);
    c.fillText(lab, 4, y + rh / 2);
    for (const q of cellsOf(r)) {
      if (q.c > upto) continue;
      const x = X(q.c) + 0.5, cwi = Math.max(1, cw - 1);
      if (r.flushed) { c.fillStyle = 'rgba(240,122,109,.18)'; c.fillRect(x, y + 2, cwi, rh - 4); }
      else if (q.held) { c.fillStyle = 'rgba(240,122,109,.25)'; c.fillRect(x, y + 2, cwi, rh - 4); c.strokeStyle = 'rgba(240,122,109,.7)'; c.beginPath(); for (let k = -rh; k < cwi; k += 5) { c.moveTo(x + Math.max(0, k), y + rh - 2 - Math.max(0, -k)); c.lineTo(x + Math.min(cwi, k + rh - 4), y + 2 + Math.max(0, k + rh - 4 - cwi)); } c.stroke(); }
      else { c.fillStyle = STCOL[q.st]; c.globalAlpha = 0.8; c.fillRect(x, y + 2, cwi, rh - 4); c.globalAlpha = 1; }
      const s = cw >= 30 ? q.st : cw >= 12 ? ONE[q.st] : '';
      if (s) { c.font = (cw >= 30 ? '11px' : '10.5px') + ' ui-monospace,Menlo,monospace'; c.textAlign = 'center'; c.fillStyle = r.flushed || q.held ? C.ink : C.bg; c.fillText(s, x + cwi / 2, y + rh / 2 + 0.5); }
    }
    if (r.flushed && Math.min(r.end, upto) >= r.F) { c.strokeStyle = C.red; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(r.F) + 1, y + rh / 2); c.lineTo(X(Math.min(r.end, upto)) + cw - 1, y + rh / 2); c.stroke(); c.lineWidth = 1; }
  });
  if (arrows && cw >= 8) {
    rows.forEach((r, i) => { if (r.flushed || r.E > upto) return; for (const s of r.src) {
      if (s.from === 'RF' || s.p < 0) continue;
      const p = rows[s.p], pc = s.from === 'EXMEM' ? p.E : p.M, col = s.from === 'EXMEM' ? C.gold : C.green;
      const xa = X(pc) + cw - 2, ya = Y(s.p) + rh - 2, xb = X(r.E) + Math.min(6, cw / 2), yb = Y(i) + 2;
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke(); c.lineWidth = 1;
      const a = Math.atan2(yb - ya, xb - xa); c.beginPath(); c.moveTo(xb, yb); c.lineTo(xb - 6 * Math.cos(a - 0.5), yb - 6 * Math.sin(a - 0.5)); c.lineTo(xb - 6 * Math.cos(a + 0.5), yb - 6 * Math.sin(a + 0.5)); c.fill();
    } });
  }
}
function pipeView(o) {
  const cv = $(o.cv);
  let cur = Infinity, playing = false, acc = 0;
  const P = () => M.pipeline(radioVal(o.ver), o.n(), o.cfg());
  const sim = reg(cv, {
    draw() { const p = P(); drawPipe(cv, p, Math.min(cur, p.cycles), o.arrows); },
    step(dt) {
      if (playing) { acc += dt; const p = P(); while (acc >= 0.25) { acc -= 0.25; cur = Math.min(cur + 1, p.cycles); } if (cur >= p.cycles) { playing = false; o.onStop && o.onStop(); } sim.dirty = true; text(); }
      if (sim.dirty) { sim.draw(); sim.dirty = false; }
    }
  });
  function text() { const p = P(); o.text(p, Math.min(cur, p.cycles)); }
  sim.text = text;
  const reset = (to) => { cur = to; sim.dirty = true; text(); };
  return { sim, text, P, set cur(v) { cur = v; }, get cur() { return cur; }, play(v) { playing = v; acc = 0; }, get playing() { return playing; }, reset };
}
// 06
(() => {
  const btn = $('#p6Play');
  const v6 = pipeView({ cv: '#p6Cv', ver: 'p6V', n: () => +radioVal('p6N'), cfg: () => M.DEFAULT_CFG, arrows: false,
    onStop: () => { btn.setAttribute('aria-pressed', 'false'); btn.textContent = t('ch6.btn.play'); },
    text(p, c) {
      const C5 = M.critical(M.LAT, p.v, 1000);
      put('#p6C', cyc(p.cycles, 0)); put('#p6I', t('u.ins', { v: fmt(p.ic, 0) }));
      put('#p6S', ns(p.ic * C5.period / 1000, 1)); put('#p6P', ns(p.cycles * C5.stage / 1000, 1));
      const z = M.say.pipe(p, 6); putHTML('#p6Say', t(z.key, { c: fmt(c, 0), ic: fmt(p.ic, 0), cyc: fmt(p.cycles, 0) }));
    } });
  const stop = () => { v6.play(false); btn.setAttribute('aria-pressed', 'false'); btn.textContent = t('ch6.btn.play'); };
  $('#p6Step').addEventListener('click', () => { stop(); const p = v6.P(); v6.reset(v6.cur >= p.cycles ? 1 : v6.cur + 1); });
  $('#p6All').addEventListener('click', () => { stop(); v6.reset(Infinity); });
  $('#p6Reset').addEventListener('click', () => { stop(); v6.reset(0); });
  btn.addEventListener('click', () => {
    if (v6.playing) { stop(); return; }
    if (reduce) { v6.reset(Infinity); return; }
    if (v6.cur >= v6.P().cycles) v6.reset(0);
    v6.play(true); btn.setAttribute('aria-pressed', 'true'); btn.textContent = t('ch6.btn.pause');
  });
  onAll([...radios('p6V'), ...radios('p6N')], 'change', () => { stop(); v6.reset(Infinity); });
  v6.text();
})();
// 07
(() => {
  const v7 = pipeView({ cv: '#p7Cv', ver: 'p7V', n: () => 2, cfg: () => ({ fwd: radioVal('p7F') === '1', resolve: 'EX', policy: 'nt' }), arrows: true,
    text(p) {
      const per = M.perElem(p.v, p.cfg), cpi = M.cpiLong(p.v, p.cfg);
      put('#p7C', cyc(p.cycles, 0)); put('#p7S', cyc(p.dataStalls, 0)); put('#p7E', cyc(per)); put('#p7Cpi', fmt(cpi, 2));
      const z = M.say.pipe(p, 7); putHTML('#p7Say', t(z.key, { stalls: fmt(p.dataStalls, 0), per: fmt(per, per % 1 ? 1 : 0) }));
    } });
  onAll([...radios('p7V'), ...radios('p7F')], 'change', () => v7.reset(Infinity));
  v7.text();
})();
// 08
(() => {
  const v8 = pipeView({ cv: '#p8Cv', ver: 'p8V', n: () => 2, cfg: () => ({ fwd: true, resolve: radioVal('p8R'), policy: radioVal('p8P') }), arrows: false,
    text(p) {
      const per = M.perElem(p.v, p.cfg);
      put('#p8C', cyc(p.cycles, 0)); put('#p8F', t('u.ins', { v: fmt(p.flushed, 0) })); put('#p8B', cyc(p.ctrlBubbles, 0)); put('#p8E', cyc(per));
      const z = M.say.pipe(p, 8), br = p.rows.filter(r => !r.flushed && r.e.f === 'B').length;
      putHTML('#p8Say', t(z.key, { bub: fmt(p.ctrlBubbles, 0), bub2: fmt(br ? p.ctrlBubbles / br : 0, 0), flush: fmt(p.flushed, 0), per: fmt(per, per % 1 ? 1 : 0), gain: fmt(z.v.gain || 0, (z.v.gain || 0) % 1 ? 1 : 0) }));
    } });
  onAll([...radios('p8V'), ...radios('p8P'), ...radios('p8R')], 'change', () => v8.reset(Infinity));
  v8.text();
})();

/* ───────── 09 the iron law ───────── */
(() => {
  const cv = $('#irCv'), ver = () => radioVal('irV'), mach = () => radioVal('irM');
  function bars(c, w, h, rows, max, hi) {
    c.font = FONT; const lw = Math.min(Math.max(...rows.map(r => c.measureText(r[0]).width)) + 14, w * 0.5);
    const L = lw, R = w - 10, T = 8, B = h - 8, rh = (B - T) / rows.length, X = v => L + (R - L) * v / max;
    rows.forEach(([lab, v, col, txt], i) => {
      const y = T + i * rh + rh / 2, bh = Math.min(20, rh * 0.6);
      c.textAlign = 'right'; c.fillStyle = i === hi ? C.gold : C.ink; let s = lab; while (s.length > 3 && c.measureText(s).width > lw - 10) s = s.slice(0, -1); c.fillText(s, L - 8, y);
      c.fillStyle = C.dimfill; c.fillRect(L, y - bh / 2, R - L, bh); c.fillStyle = col; c.fillRect(L, y - bh / 2, Math.max(1.5, X(v) - L), bh);
      if (i === hi) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(L - 0.5, y - bh / 2 - 0.5, R - L + 1, bh + 1); c.lineWidth = 1; }
      const tw = c.measureText(txt).width, xe = X(v);
      if (xe + 6 + tw <= R) { c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText(txt, xe + 6, y); } else { c.fillStyle = C.bg; c.textAlign = 'right'; c.fillText(txt, xe - 6, y); }
    });
  }
  const combos = []; for (const v of M.VERSIONS) for (const m of M.MACHINES) combos.push([v, m]);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), vals = combos.map(([v, m]) => M.iron(v, m)), max = Math.max(...vals.map(x => x.perElem)) * 1.04;
    const col = m => m === 'single' ? C.red : m === 'pipeNoFwd' ? C.violet : m === 'pipe' ? C.cyan : C.green;
    bars(c, w, h, combos.map(([v, m], i) => [t('ch9.bar', { v: t('ch9.vs.' + v), m: t('ch9.ms.' + m) }), vals[i].perElem, col(m), ns(vals[i].perElem, 2)]), max, combos.findIndex(([v, m]) => v === ver() && m === mach()));
  } });
  function text() {
    const a = M.iron(ver(), mach()), base = M.iron('v1', 'single'), z = M.say.iron(ver(), mach());
    put('#irIc', fmt(a.ic, 0)); put('#irCpi', fmt(a.cpi, 2)); putHTML('#irT', t('ch9.t', { ps: '<span class="nw">' + ps(a.T) + '</span>', ghz: '<span class="nw">' + t('u.ghz', { v: fmt(a.ghz, 2) }) + '</span>' }));
    put('#irTime', ns(a.perElem, 2)); put('#irX', times(base.ns / a.ns, 1));
    putHTML('#irSay', t(z.key, { per: ns(a.perElem, 2), x: times(z.v.x, 1), cpi: fmt(a.cpi, 2), ps: ps(a.T) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll([...radios('irV'), ...radios('irM')], 'change', go);
  text();
})();

/* ───────── 10 x86 vs RV32I ───────── */
(() => {
  const OPC = { agu: 'v', load: 'c', alu: 'o', store: 'n' };
  function text() {
    const x = M.X86.find(e => e.id === radioVal('xI')), roles = x.roles.split(' ');
    put('#xAsm', x.asm);
    putHTML('#xBytes', x.bytes.split(' ').map((b, i) => `<span class="${roles[i]}" title="${esc(t('ch10.role.' + roles[i]))}">${b}</span>`).join('') + '<span class="br"></span>' + [...new Set(roles)].map(r => `<span class="${r}" style="border-style:dashed">${esc(t('ch10.role.' + r))}</span>`).join(''));
    putHTML('#xOps', x.ops.map(o => `<span role="listitem" class="${OPC[o]}">${esc(t('ch10.op.' + o))}</span>`).join(''));
    putHTML('#xRv', x.rvProg.map((r, i) => `<span class="g">${M.hex8(r.w)}</span>  ${esc(x.rv[i])}`).join('\n'));
    const rvlen = x.rv.length * 4;
    put('#xLen', t('u.B', { v: fmt(x.len, 0) })); put('#xRvLen', t('u.B', { v: fmt(rvlen, 0) })); put('#xOpsN', fmt(x.ops.length, 0)); put('#xRvN', t('u.ins', { v: fmt(x.rv.length, 0) }));
    const z = M.say.x86(x.id);
    putHTML('#xSay', t(z.key, { asm: esc(x.asm), len: fmt(x.len, 0), rvn: fmt(x.rv.length, 0), rvlen: fmt(rvlen, 0), ops: fmt(x.ops.length, 0) }));
  }
  reg([], { draw() {}, text });
  onAll(radios('xI'), 'change', text);
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
