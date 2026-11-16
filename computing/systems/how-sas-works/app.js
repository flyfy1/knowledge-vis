/* How SAS works: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.SasModels;
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
let PROSE = null; // computed once (the CRC and FEC enumerations take a few tens of milliseconds)
function proseVars() { PROSE = PROSE || M.prose(); const o = {}; for (const [k, [v, d, kind]] of Object.entries(PROSE)) o[k] = kind === 'pct' ? pct(v, d) : kind === 'sci' ? M.sciText(v, effLang()) : fmt(v, d); return o; }
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
const hexh = v => v.toString(16).toUpperCase().padStart(2, '0') + 'h';
const PALD = [C.cyan, C.gold, C.green, C.violet, C.red];   // one colour per drive, as in the ch6 model

// the SAS stack: three transport protocols side by side over one link, port and phy layer (ch1); schematic
DG.stack = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 384 : 516;
  const P = ['ssp', 'stp', 'smp'];
  return { W, H, draw(g) {
    const x0 = wide ? 150 : 6, w = wide ? 560 : 328, cw = w / 3, lw = wide ? 130 : 0;
    const rows = wide ? [24, 92, 180, 240, 300] : [40, 140, 272, 336, 400], rh = wide ? 56 : 84, rh1 = wide ? 72 : 96, RH = [rh, rh1];
    if (wide) ['carry', 'tr'].forEach((k, i) => g.text(10, rows[i] + RH[i] / 2, 'dg.stack.l' + k, { c: 'm', w: lw, va: 'mid' }));
    P.forEach((k, j) => {
      const x = x0 + j * cw;
      g.box(x + 3, rows[0], cw - 6, rh, C.violet, { rx: 6, a: 0.1 }); g.text(x + cw / 2, rows[0] + rh / 2, 'dg.stack.c' + k, { a: 'middle', w: cw - 16, va: 'mid' });
      g.line(x + cw / 2, rows[0] + rh + 2, x + cw / 2, rows[1] - 2, C.mute, { arrow: 1, sw: 1.2 });
      g.box(x + 3, rows[1], cw - 6, rh1, C.cyan, { rx: 6, a: 0.12 }); g.text(x + cw / 2, rows[1] + 20, { raw: k.toUpperCase() }, { a: 'middle', mono: 1, c: 'c', weight: 700 });
      g.text(x + cw / 2, rows[1] + 42, 'dg.stack.' + k, { a: 'middle', c: 'm', w: cw - 12 });
    });
    if (!wide) { g.text(x0, 20, 'dg.stack.lcarry', { c: 'm' }); g.text(x0, rows[1] + rh1 + 18, 'dg.stack.ltr', { c: 'm' }); }
    ['link', 'port', 'phy'].forEach((k, i) => { const y = rows[2 + i]; g.box(x0 + 3, y, w - 6, wide ? 44 : 56, C.mute, { rx: 6, a: 0.1, sw: 1 }); g.text(x0 + w / 2, y + (wide ? 22 : 28), 'dg.stack.' + k, { a: 'middle', w: w - 24, va: 'mid' }); });
    g.text(wide ? 10 : x0, wide ? 366 : 478, 'dg.stack.note', { c: 'g', w: wide ? 700 : 328 });
  } };
};
// READ(6), READ(10), READ(16) byte by byte, from the model's CDB builder (ch2)
DG.cdb = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 330 : 390;
  return { W, H, draw(g) {
    const x0 = wide ? 40 : 10, cw = wide ? 40 : 20, ops = ['r6', 'r10', 'r16'];
    ops.forEach((op, r) => {
      const c = M.SPEC.cdb[op], b = M.CDB.build(op, 0, 1), y = 22 + r * (wide ? 82 : 92);
      g.text(x0, y, 'dg.cdb.row', { w: W - 2 * x0, vars: { n: c.len, op: hexh(c.op), a: c.lbaBits, l: c.lenBits } });
      for (let i = 0; i < c.len; i++) {
        const isL = i >= b.lbaField[0] && i <= b.lbaField[1], isN = i >= b.lenField[0] && i <= b.lenField[1];
        const col = i === 0 ? C.gold : isL ? C.cyan : isN ? C.green : C.mute, yy = y + (wide ? 18 : 34);
        g.box(x0 + i * cw + 1, yy, cw - 2, 30, col, { rx: 3, a: i === 0 ? 0.35 : 0.22, sw: 1, dash: op === 'r6' && i === 1 ? '3 2' : 'none' });
        if (wide) g.text(x0 + i * cw + cw / 2, yy + 15, { raw: i === 0 ? hexh(c.op) : String(i) }, { a: 'middle', mono: 1, fs: 13, c: i === 0 ? 'g' : 'm' });
      }
    });
    const ly = wide ? 278 : 300;
    [['op', C.gold, 'g'], ['lba', C.cyan, 'c'], ['len', C.green, 'n'], ['other', C.mute, 'm']].forEach(([k, col, cl], i) => {
      const x = wide ? x0 + i * 170 : x0 + (i % 2) * 160, y = wide ? ly : ly + Math.floor(i / 2) * 26;
      g.swatch(x, y, col); g.text(x + 18, y, 'dg.cdb.' + k, { c: cl });
    });
    g.text(x0, wide ? 306 : 352, 'dg.cdb.r6', { c: 'm', w: W - 2 * x0 });
  } };
};
// one SSP data frame, bytes to scale (ch3)
DG.ssp = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 170 : 244, s = M.SPEC.ssp;
  return { W, H, draw(g) {
    const x0 = wide ? 20 : 10, bw = W - 2 * x0, tot = s.hdr + s.dataMax + s.crc, k = bw / tot, y = 40;
    g.text(x0, 16, 'dg.ssp.total', { c: 'm', w: bw, vars: { n: fmt(tot, 0) } });
    const parts = [[s.hdr, C.violet, 'hdr'], [s.dataMax, C.cyan, 'iu'], [s.crc, C.gold, 'crc']]; let x = x0;
    parts.forEach(([n, col], i) => { g.box(x, y, n * k, 40, col, { rx: 2, a: 0.3, sw: 1 }); x += n * k; });
    g.text(x0 + (s.hdr + s.dataMax / 2) * k, y + 20, 'dg.ssp.iu', { a: 'middle', c: 'c', vars: { n: fmt(s.dataMax, 0) } });
    g.line(x0 + s.hdr * k / 2, y + 42, x0 + s.hdr * k / 2, y + 62, C.violet, { sw: 1 }); g.text(x0, y + 74, 'dg.ssp.hdr', { c: 'v', vars: { n: s.hdr } });
    g.line(x0 + bw - 1, y + 42, x0 + bw - 1, y + (wide ? 62 : 94), C.gold, { sw: 1 }); g.text(x0 + bw, y + (wide ? 74 : 106), 'dg.ssp.crc', { a: 'end', c: 'g', vars: { n: s.crc } });
    g.text(x0, wide ? 148 : 186, 'dg.ssp.note', { c: 'm', w: bw, vars: { c: s.cmdIU, r: s.respIU } });
  } };
};
// one 4 KiB read: open a connection, send the command, close; the drive reconnects with data and status (ch3); time not to scale
DG.conn = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 520 : 690, nData = M.SSP.frames(4096).nData;
  return { W, H, draw(g) {
    const xi = wide ? 90 : 40, xe = wide ? 360 : 170, xt = wide ? 630 : 300, top = 50, st = wide ? 44 : 64;
    const head = (x, k, col, cl) => { g.box(x - (wide ? 70 : 38), 10, wide ? 140 : 76, 28, col, { rx: 6 }); g.text(x, 24, 'dg.conn.' + k, { a: 'middle', c: cl, fs: wide ? 14 : 13 }); };
    head(xi, 'ini', C.cyan, 'c'); head(xe, 'exp', C.mute, 'm'); head(xt, 'tgt', C.violet, 'v');
    for (const [x, col] of [[xi, C.cyan], [xe, C.mute], [xt, C.violet]]) g.line(x, 40, x, H - 10, col, { sw: 1, dash: '2 4' });
    const rows = [['open', 1, C.gold, 'g'], ['acc', 0, C.gold, 'g'], ['cmd', 1, C.cyan, 'c'], ['close', 2, C.gold, 'g'], ['wait'], ['open2', 0, C.gold, 'g'], ['acc2', 1, C.gold, 'g'], ['data', 0, C.violet, 'v'], ['resp', 0, C.violet, 'v'], ['close', 2, C.gold, 'g']];
    rows.forEach(([k, dir, col, cl], i) => {
      const y = top + 40 + i * st;
      if (k === 'wait') { g.box(xi + 8, y - (wide ? 24 : 40), xt - xi - 16, wide ? 34 : 52, C.mute, { a: 0.06, dash: '4 4', sw: 1, rx: 6 }); g.text((xi + xt) / 2, y - (wide ? 7 : 14), 'dg.conn.wait', { a: 'middle', c: 'm', w: xt - xi - 30, va: 'mid' }); return; }
      if (dir === 2) { g.line(xi + 2, y, xt - 2, y, col, { sw: 1.6, dash: '5 3', arrow: 1, both: 1 }); }
      else g.line(dir ? xi + 2 : xt - 2, y, dir ? xt - 2 : xi + 2, y, col, { sw: k === 'data' ? 4 : 2, arrow: 1 });
      if (k === 'open' || k === 'open2') g.circle(xe, y, 4, C.mute, { solid: true });
      g.text(wide ? (xi + xe) / 2 + 40 : (xi + xt) / 2, y - (wide ? 21 : 32), 'dg.conn.' + k, { a: 'middle', c: cl + ' h', w: wide ? 420 : 280, va: wide ? 'mid' : 'top', vars: { n: nData } });
    });
  } };
};
// two controllers, two paths, one dual-port SAS drive; a SATA drive reaches only one path (ch4); schematic
DG.dual = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 330 : 560;
  return { W, H, draw(g) {
    const PA = C.cyan, PB = C.gold;
    const box = (x, y, w, h, col, k, cl, a) => { g.box(x, y, w, h, col, { rx: 6, a: a == null ? 0.12 : a }); g.text(x + w / 2, y + h / 2, 'dg.dual.' + k, { a: 'middle', c: cl, w: w - 10, va: 'mid' }); };
    if (wide) {
      box(20, 40, 130, 46, PA, 'ca', 'c'); box(20, 200, 130, 46, PB, 'cb', 'g');
      box(200, 40, 130, 46, PA, 'ea', 'c'); box(200, 200, 130, 46, PB, 'eb', 'g');
      g.line(150, 63, 200, 63, PA, { sw: 2.4 }); g.line(150, 223, 200, 223, PB, { sw: 2.4 });
      g.box(390, 24, 26, 250, C.mute, { rx: 4, a: 0.25, sw: 1 }); g.text(403, 292, 'dg.dual.bp', { a: 'middle', c: 'm' });
      box(480, 40, 220, 94, C.violet, 'sas', 'v', 0.1); box(480, 180, 220, 70, C.violet, 'sata', 'v', 0.05);
      // SAS drive: port 1 on path A, port 2 on path B
      g.path('M330,63 H390 M416,63 H478', PA, { sw: 2.4 }); g.path('M330,223 H382 M382,230 V112 H390 M416,112 H478', PB, { sw: 2.4 });
      // SATA drive: path A only; path B's contacts meet nothing
      g.path('M372,63 V200 H390 M416,200 H478', PA, { sw: 2.4 }); g.path('M382,230 H390 M416,230 H450', PB, { sw: 2.4, dash: '4 4' });
      g.text(458, 230, { raw: '×' }, { a: 'middle', c: 'r', fs: 18, weight: 700 });
      g.text(20, 130, 'dg.dual.mp', { c: 'm', w: 330 });
    } else {
      box(10, 10, 150, 44, PA, 'ca', 'c'); box(180, 10, 150, 44, PB, 'cb', 'g');
      box(10, 88, 150, 44, PA, 'ea', 'c'); box(180, 88, 150, 44, PB, 'eb', 'g');
      g.line(85, 54, 85, 88, PA, { sw: 2.4 }); g.line(255, 54, 255, 88, PB, { sw: 2.4 });
      g.box(10, 176, 320, 22, C.mute, { rx: 4, a: 0.25, sw: 1 }); g.text(170, 187, 'dg.dual.bp', { a: 'middle', c: 'm', fs: 13.5 });
      box(10, 250, 150, 96, C.violet, 'sas', 'v', 0.1); box(180, 250, 150, 96, C.violet, 'sata', 'v', 0.05);
      g.path('M70,132 V176 M70,198 V248', PA, { sw: 2.4 }); g.path('M255,132 V150 H120 V176 M120,198 V248', PB, { sw: 2.4 });
      g.path('M40,132 V160 H220 V176 M220,198 V248', PA, { sw: 2.4 }); g.path('M300,132 V176 M300,198 V224', PB, { sw: 2.4, dash: '4 4' });
      g.text(300, 236, { raw: '×' }, { a: 'middle', c: 'r', fs: 18, weight: 700 });
      g.text(10, 380, 'dg.dual.mp', { c: 'm', w: 320 });
    }
    g.swatch(wide ? 20 : 10, wide ? 290 : 450, PA); g.text(wide ? 38 : 28, wide ? 290 : 450, 'dg.dual.pa', { c: 'c' });
    g.swatch(wide ? 200 : 10, wide ? 290 : 478, PB); g.text(wide ? 218 : 28, wide ? 290 : 478, 'dg.dual.pb', { c: 'g' });
    g.text(wide ? 20 : 10, wide ? 316 : 512, 'dg.dual.note', { c: 'm', w: wide ? 680 : 320 });
  } };
};
// one controller, a wide uplink, an expander fanning out to many drives, a second expander cascaded (ch5); schematic
DG.exp = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 320 : 520;
  return { W, H, draw(g) {
    const drives = (x0, y0, n, w, h, gap) => { for (let i = 0; i < n; i++) g.box(x0 + i * (w + gap), y0, w, h, C.violet, { rx: 3, a: 0.25, sw: 1 }); };
    if (wide) {
      g.box(20, 120, 130, 50, C.cyan, { rx: 6 }); g.text(85, 145, 'dg.exp.ctrl', { a: 'middle', c: 'c', w: 120, va: 'mid' });
      for (let i = 0; i < 4; i++) g.line(150, 136 + i * 6, 230, 136 + i * 6, C.cyan, { sw: 1.6 });
      g.text(190, 98, 'dg.exp.up', { a: 'middle', c: 'c' });
      g.box(230, 110, 120, 70, C.gold, { rx: 6, a: 0.14 }); g.text(290, 145, 'dg.exp.e1', { a: 'middle', c: 'g', w: 110, va: 'mid' });
      for (let i = 0; i < 8; i++) { const y = 30 + i * 22; g.line(350, 145, 430, y + 8, C.violet, { sw: 0.8 }); }
      drives(432, 26, 1, 0, 0, 0);
      for (let i = 0; i < 8; i++) g.box(432, 26 + i * 22, 60, 16, C.violet, { rx: 3, a: 0.25, sw: 1 });
      g.text(504, 30, 'dg.exp.narrow', { c: 'v', w: 210 });
      g.text(504, 114, 'dg.exp.more', { c: 'm', w: 210 });
      g.line(290, 180, 290, 236, C.gold, { sw: 2.4 }); g.text(300, 208, 'dg.exp.cascade', { c: 'g' });
      g.box(230, 236, 120, 50, C.gold, { rx: 6, a: 0.14 }); g.text(290, 261, 'dg.exp.e2', { a: 'middle', c: 'g' });
      for (let i = 0; i < 6; i++) { g.line(350, 261, 430, 230 + i * 12, C.violet, { sw: 0.8 }); g.box(432, 224 + i * 12, 60, 9, C.violet, { rx: 2, a: 0.25, sw: 0.8 }); }
      g.text(504, 248, 'dg.exp.share', { c: 'r', w: 210 });
      g.text(20, 216, 'dg.exp.disc', { c: 'm', w: 200 });
    } else {
      g.box(95, 10, 150, 44, C.cyan, { rx: 6 }); g.text(170, 32, 'dg.exp.ctrl', { a: 'middle', c: 'c', w: 140, va: 'mid' });
      for (let i = 0; i < 4; i++) g.line(161 + i * 6, 54, 161 + i * 6, 100, C.cyan, { sw: 1.6 });
      g.text(196, 77, 'dg.exp.up', { c: 'c' });
      g.box(95, 100, 150, 50, C.gold, { rx: 6, a: 0.14 }); g.text(170, 125, 'dg.exp.e1', { a: 'middle', c: 'g', w: 140, va: 'mid' });
      for (let i = 0; i < 10; i++) { const x = 10 + i * 32; g.line(170, 150, x + 13, 196, C.violet, { sw: 0.8 }); g.box(x, 196, 26, 40, C.violet, { rx: 3, a: 0.25, sw: 1 }); }
      g.text(10, 256, 'dg.exp.narrow', { c: 'v', w: 320 });
      g.line(245, 125, 290, 125, C.gold, { sw: 2.4 }); g.line(290, 125, 290, 300, C.gold, { sw: 2.4 });
      g.box(200, 300, 130, 44, C.gold, { rx: 6, a: 0.14 }); g.text(265, 322, 'dg.exp.e2', { a: 'middle', c: 'g' });
      g.text(10, 322, 'dg.exp.cascade', { c: 'g', w: 180 });
      g.text(10, 372, 'dg.exp.more', { c: 'm', w: 320 });
      g.text(10, 412, 'dg.exp.share', { c: 'r', w: 320 });
      g.text(10, 462, 'dg.exp.disc', { c: 'm', w: 320 });
    }
  } };
};
// a ×4 wide port: four lanes, one connection per lane; a fifth drive waits (ch6); schematic
DG.wide = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 470, lanes = 4;
  return { W, H, draw(g) {
    if (wide) {
      g.box(20, 60, 130, 150, C.cyan, { rx: 6, a: 0.1 }); g.text(85, 135, 'dg.wide.ctrl', { a: 'middle', c: 'c', w: 110, va: 'mid' });
      g.box(300, 60, 110, 150, C.mute, { rx: 6, a: 0.1, sw: 1 }); g.text(355, 135, 'dg.wide.exp', { a: 'middle', c: 'm', w: 100, va: 'mid' });
      g.box(150, 54, 150, 156, C.cyan, { rx: 10, a: 0.04, dash: '5 4', sw: 1 });
      for (let i = 0; i < lanes; i++) { const y = 84 + i * 34; g.line(150, y, 300, y, PALD[i], { sw: 3 }); g.text(225, y - 10, 'dg.wide.lane', { a: 'middle', c: 'm', fs: 13.5, vars: { n: i } }); g.line(410, y, 520, 30 + i * 52 + 14, PALD[i], { sw: 2 }); g.box(522, 30 + i * 52, 90, 28, PALD[i], { rx: 4, a: 0.2 }); g.text(567, 44 + i * 52, 'dg.wide.drive', { a: 'middle', vars: { k: 'ABCD'[i] } }); }
      g.box(522, 238, 90, 28, PALD[4], { rx: 4, a: 0.1, dash: '4 3' }); g.text(567, 252, 'dg.wide.drive', { a: 'middle', vars: { k: 'E' } }); g.text(620, 252, 'dg.wide.wait', { c: 'r', w: 96, va: 'mid' });
      g.text(150, 36, 'dg.wide.port', { c: 'c', w: 360 });
      g.text(20, 252, 'dg.wide.one', { w: 480, c: 'm' });
      g.text(20, 282, 'dg.wide.note', { w: 480, c: 'm' });
    } else {
      g.box(10, 10, 320, 40, C.cyan, { rx: 6, a: 0.1 }); g.text(170, 30, 'dg.wide.ctrl', { a: 'middle', c: 'c' });
      g.box(10, 160, 320, 40, C.mute, { rx: 6, a: 0.1, sw: 1 }); g.text(170, 180, 'dg.wide.exp', { a: 'middle', c: 'm' });
      for (let i = 0; i < lanes; i++) { const x = 40 + i * 80; g.line(x, 50, x, 160, PALD[i], { sw: 3 }); g.text(x + 6, 105, 'dg.wide.lane', { c: 'm', fs: 13.5, vars: { n: i } }); g.line(x, 200, x, 236, PALD[i], { sw: 2 }); g.box(x - 30, 236, 60, 28, PALD[i], { rx: 4, a: 0.2 }); g.text(x, 250, 'dg.wide.drive', { a: 'middle', vars: { k: 'ABCD'[i] } }); }
      g.box(10, 280, 60, 28, PALD[4], { rx: 4, a: 0.1, dash: '4 3' }); g.text(40, 294, 'dg.wide.drive', { a: 'middle', vars: { k: 'E' } }); g.text(80, 294, 'dg.wide.wait', { c: 'r', w: 250, va: 'mid' });
      g.text(10, 330, 'dg.wide.port', { c: 'c', w: 320 });
      g.text(10, 372, 'dg.wide.one', { w: 320, c: 'm' });
      g.text(10, 420, 'dg.wide.note', { w: 320, c: 'm' });
    }
  } };
};
// the drive plugs: SATA's two segments with a gap; SAS fills the gap with the second port's contacts (ch7); schematic
DG.plug = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 270 : 430;
  return { W, H, draw(g) {
    const plug = (x, y, w, sas, key) => {
      g.text(x, y, 'dg.plug.' + key, { c: 'v', weight: 600 });
      const sw = w * 7 / 24, gw = w * 2 / 24, pw = w * 15 / 24, yy = y + 18;
      g.box(x, yy, sw, 44, C.cyan, { rx: 3, a: 0.18 }); g.text(x + sw / 2, yy + 22, 'dg.plug.sig', { a: 'middle', c: 'c', fs: 13.5, w: sw - 8, va: 'mid' });
      if (sas) { g.box(x + sw, yy + 6, gw, 32, C.gold, { rx: 2, a: 0.45 }); }
      g.box(x + sw + gw, yy, pw, 44, C.mute, { rx: 3, a: 0.18 }); g.text(x + sw + gw + pw / 2, yy + 22, 'dg.plug.pwr', { a: 'middle', c: 'm', fs: 13.5, w: pw - 8, va: 'mid' });
      if (!sas) g.text(x + sw + gw / 2, yy + 62, 'dg.plug.gap', { a: 'middle', c: 'm', fs: 13.5 });
      else g.text(x + sw + gw / 2, yy + 62, 'dg.plug.s8', { a: 'middle', c: 'g', fs: 13.5 });
    };
    const verdict = (x, y, ok, key, w) => { g.text(x, y, { raw: ok ? '✓' : '✗' }, { c: ok ? 'n' : 'r', weight: 700 }); g.text(x + 22, y, 'dg.plug.' + key, { c: ok ? 'n' : 'r', w: w - 22, va: 'top' }); };
    if (wide) {
      plug(20, 24, 300, false, 'sata'); plug(390, 24, 300, true, 'sas');
      verdict(20, 146, true, 'ok', 680); verdict(20, 182, false, 'no', 680);
      g.text(20, 226, 'dg.plug.stp', { c: 'm', w: 680 });
    } else {
      plug(10, 20, 320, false, 'sata'); plug(10, 130, 320, true, 'sas');
      verdict(10, 250, true, 'ok', 320); verdict(10, 306, false, 'no', 320);
      g.text(10, 370, 'dg.plug.stp', { c: 'm', w: 320 });
    }
  } };
};
// one 520-byte block: 512 data bytes and the 8-byte protection tuple (ch8); bar to scale, tuple enlarged
DG.pi = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 270 : 380, P = M.SPEC.pi;
  const blk = P.sectors512[1], data = blk - P.bytes;
  return { W, H, draw(g) {
    const x0 = wide ? 20 : 10, bw = W - 2 * x0, k = bw / blk, y = wide ? 40 : 58;
    g.text(x0, 16, 'dg.pi.blk', { c: 'm', w: bw, vars: { n: blk, d: data, t: P.bytes } });
    g.box(x0, y, data * k, 40, C.violet, { rx: 3, a: 0.2 }); g.text(x0 + data * k / 2, y + 20, 'dg.pi.data', { a: 'middle', c: 'v', vars: { d: data } });
    g.box(x0 + data * k, y, P.bytes * k, 40, C.ink, { rx: 1, a: 0.4, sw: 1 });
    const zx = wide ? 240 : x0, zw = wide ? 460 : bw, zy = wide ? 120 : 148, c = zw / P.bytes;
    g.path(`M${x0 + data * k},${y + 40} L${zx},${zy} M${x0 + bw},${y + 40} L${zx + zw},${zy}`, C.mute, { sw: 1, dash: '3 3' });
    const F = [['guard', 2, C.gold, 'g'], ['app', 2, C.green, 'n'], ['ref', 4, C.cyan, 'c']]; let off = 0;
    F.forEach(([f, n, col, cl]) => {
      g.box(zx + off * c + 1, zy, n * c - 2, 40, col, { rx: 4, a: 0.25 }); g.text(zx + (off + n / 2) * c, zy + 20, 'dg.pi.' + f, { a: 'middle', c: cl, vars: { n } });
      off += n;
    });
    const ty = zy + 66;
    F.forEach(([f, n, col, cl], i) => { g.swatch(x0, ty + i * (wide ? 26 : 56), col); g.text(x0 + 18, ty + i * (wide ? 26 : 56), 'dg.pi.' + f + 'd', { c: cl, w: bw - 18, vars: { p: P.poly.toString(16).toUpperCase() } }); });
  } };
};
// the 24G packet: 2 header + 128 payload bits = 26 five-bit symbols; RS(30,26) adds 4 (ch9); bits to scale, layout schematic
DG.spl = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 350, F = M.SPEC.fec, G = M.SPEC.gens[3];
  const pay = G.num, tot = G.den, par = (F.n - F.k) * F.symBits, hdr = F.k * F.symBits - pay;
  return { W, H, draw(g) {
    const x0 = wide ? 20 : 10, bw = W - 2 * x0, k = bw / tot, y = 40;
    g.text(x0, 16, 'dg.spl.tot', { c: 'm', w: bw, vars: { t: tot, s: F.n, b: F.symBits } });
    g.box(x0, y, hdr * k, 34, C.gold, { rx: 1, a: 0.5, sw: 1 });
    g.box(x0 + hdr * k, y, pay * k, 34, C.cyan, { rx: 2, a: 0.2 }); g.text(x0 + (hdr + pay / 2) * k, y + 17, 'dg.spl.pay', { a: 'middle', c: 'c', vars: { n: pay } });
    g.box(x0 + (hdr + pay) * k, y, par * k, 34, C.violet, { rx: 2, a: 0.35 });
    g.text(x0, y + 52, 'dg.spl.hdr', { c: 'g', vars: { n: hdr } });
    g.text(x0 + bw, y + (wide ? 52 : 76), 'dg.spl.par', { a: 'end', c: 'v', vars: { n: par, p: F.n - F.k } });
    // symbols
    const sy = wide ? 132 : 166, sw = bw / F.n;
    g.text(x0, sy - 14, 'dg.spl.sym', { c: 'm', w: bw, vars: { n: F.n, k: F.k, t: F.t } });
    for (let i = 0; i < F.n; i++) g.box(x0 + i * sw + 0.5, sy, sw - 1, 26, i < F.k ? C.cyan : C.violet, { rx: 2, a: i < F.k ? 0.18 : 0.4, sw: 0.8 });
    // a 7-bit burst starting on the last bit of symbol 9 touches symbols 9, 10 and 11
    const b0 = 9 * F.symBits + F.symBits - 1, bx = x0 + b0 * (sw / F.symBits), bwid = 7 * (sw / F.symBits);
    g.box(bx, sy - 4, bwid, 34, C.red, { rx: 2, a: 0.25, sw: 1.6 });
    g.text(x0, sy + 50, 'dg.spl.burst', { c: 'r', w: bw });
    g.text(x0, sy + (wide ? 92 : 112), 'dg.spl.eff', { c: 'm', w: bw, vars: { e: fmt(pay / tot * 100, 1), g: fmt(G.gbaud * pay / tot, 1) } });
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
const clamp = M.clamp;
function spacedTicks(c, items, y) { let lastR = -Infinity; c.textAlign = 'center'; for (const [x, s] of items) { const w = c.measureText(s).width; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw, dash) { c.strokeStyle = col; c.lineWidth = lw || 2.2; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function tag(c, s, x, y, col, align, font) { c.font = font || FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); c.font = FONT; return [x0 - 3, x0 + w + 3]; }
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function labelFont(c, labels, cap) { c.font = FONT; let lw = 0; for (const s of labels) lw = Math.max(lw, c.measureText(s).width); const k = lw + 14 > cap ? Math.max(0.7, (cap - 14) / lw) : 1; return { font: FONT.replace('12px', (12 * k).toFixed(1) + 'px'), w: Math.min(lw * k + 14, cap) }; }
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const pow10 = e => '10' + String(e).split('').map(ch => SUP[ch]).join('');
const sci = x => M.sciText(x, effLang());
// bytes in decimal units; the unit names come from copy
function bytesText(x) { const u = t('u.bytesUnits').split('|'); let i = 0; while (x >= 1000 && i < u.length - 1) { x /= 1000; i++; } return fmt(x, x >= 100 ? 0 : x >= 10 ? 1 : 2) + ' ' + u[i]; }
const hex2 = v => v.toString(16).toUpperCase().padStart(2, '0');
const hex4 = v => '0x' + v.toString(16).toUpperCase().padStart(4, '0');
const hex8 = v => '0x' + v.toString(16).toUpperCase().padStart(8, '0');
const waitText = us => us < 0.005 ? t('u.us', { v: fmt(0, 0) }) : dur(us * 1e-6);
const enable = (els, on) => els.forEach(e => { e.disabled = !on; const l = e.closest('label'); if (l) l.style.opacity = on ? '' : '0.45'; });

/* ───────── 02 the CDB ───────── */
(() => {
  const cv = $('#cdCv'), sX = $('#cdX'), D = M.CDB;
  const OPS = ['r6', 'r10', 'r16'];
  const off = () => Math.pow(10, 6 + +sX.value / 10);
  const op = () => radioVal('cdOp'), bs = () => +radioVal('cdBs'), attr = () => radioVal('cdA');
  const LO = 6, HI = 22;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), labs = OPS.map(o => t('ch2.op.' + o));
      const lf = labelFont(c, labs, Math.min(110, w * 0.3));
      const L = lf.w, R = w - 14, T = 10, B = h - 36, rh = (B - T) / 3;
      const X = b => L + (R - L) * (Math.log10(b) - LO) / (HI - LO);
      const ticks = t('ch2.ticks').split('|'), items = [];
      ticks.forEach((s, i) => { const x = X(Math.pow(10, 6 + 3 * i)); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); items.push([x, s]); });
      c.fillStyle = C.mute; spacedTicks(c, items, B + 11);
      c.textAlign = 'right'; c.fillText(t('ch2.cv.x'), R, B + 27);
      OPS.forEach((o, i) => {
        const y = T + i * rh, bh = rh * 0.5, sel = o === op();
        c.font = lf.font; c.textAlign = 'right'; c.fillStyle = sel ? C.gold : C.ink; c.fillText(labs[i], L - 8, y + rh / 2); c.font = FONT;
        c.fillStyle = sel ? C.cyan : C.dimfill; c.fillRect(L, y + (rh - bh) / 2, Math.max(1, Math.min(R, X(D.reach(o, bs()))) - L), bh);
      });
      const x = X(off()); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(x, T - 2); c.lineTo(x, B); c.stroke(); c.lineWidth = 1;
    }
  });
  function bytesRow(arr, mark) { return arr.map((v, i) => { const k = mark(i); const s = hex2(v); return k ? `<span class="${k}">${s}</span>` : s; }).reduce((a, s, i) => a + (i && i % 16 === 0 ? '\n' : i && i % 4 === 0 ? '  ' : i ? ' ' : '') + s, ''); }
  function text() {
    const o = op(), b = bs(), x = off(), lba = Math.floor(x / b), n = b === 512 ? 8 : 1, a = attr();
    const r = D.build(o, lba, n), need = D.smallest(x, b);
    put('#cdXo', bytesText(x));
    put('#cdLba', fmt(lba, 0)); put('#cdReach', bytesText(D.reach(o, b))); put('#cdNeed', need ? t('ch2.op.' + need) : t('ch2.none'));
    put('#cdLen', t('u.bytes', { v: fmt(SPEC().cdb[o].len, 0) }));
    const inR = (i, f) => i >= f[0] && i <= f[1];
    const mk = (base) => i => { const j = i - base; if (j < 0 || j >= r.bytes.length) return ''; if (j === 0) return 'm'; if (inR(j, r.lbaField)) return 'g'; if (inR(j, r.lenField)) return 'c'; return ''; };
    let html;
    if (!r.fits) html = t('ch2.hex.bad', { op: t('ch2.op.' + o) });
    else {
      const ssp = D.sspIU(r.bytes, a), isc = D.iscsi(r.bytes, a, n * b);
      const sspMark = i => i === 9 ? 'r' : mk(12)(i), iscMark = i => i === 1 ? 'r' : mk(32)(i);
      html = `<span class="hexlab">${t('ch2.hex.cdb')}</span>${bytesRow(r.bytes, mk(0))}\n<span class="hexlab">${t('ch2.hex.ssp')}</span>${bytesRow(ssp, sspMark)}\n<span class="hexlab">${t('ch2.hex.iscsi')}</span>${bytesRow(isc, iscMark)}`;
    }
    putHTML('#cdHex', html);
    const s = M.say.cdb(o, x, b);
    putHTML('#cdSay', t(s.key, { op: t('ch2.op.' + o), need: s.v.need ? t('ch2.op.' + s.v.need) : t('ch2.none'), reach: bytesText(s.v.reach), bs: fmt(b, 0), lba: fmt(lba, 0), len: fmt(SPEC().cdb[o].len, 0) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sX.addEventListener('input', go); ['cdOp', 'cdBs', 'cdA'].forEach(n => onAll(radios(n), 'change', go));
  text();
})();
function SPEC() { return M.SPEC; }

/* ───────── 03 one SSP read ───────── */
(() => {
  const cv = $('#spCv'), chk = $('#spP');
  const n = () => +radioVal('spN'), g = () => radioVal('spG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = M.SSP.read(n(), g(), null, chk.checked), lane = r.lane, f = r.f, oc = chk.checked ? 0 : M.SSP.ocUs;
      const L = 12, R = w - 12, gapW = (R - L) * 0.12, bh = Math.min(40, h - 80), T = Math.max(30, (h - bh) / 2 - 8);
      const segs = [['oc', oc], ['cmd', f.cmd / lane], ['oc', oc], ['gap', null], ['oc', oc], ['data', f.data / lane], ['resp', f.resp / lane], ['oc', oc]].filter(s => s[1] !== 0);
      const tot = segs.reduce((a, s) => a + (s[1] || 0), 0), k = (R - L - gapW) / tot;
      let x = L; const placed = [];
      const col = { oc: C.gold, cmd: C.cyan, data: C.cyan, resp: C.cyan };
      for (const [id, v] of segs) {
        const sw = id === 'gap' ? gapW : Math.max(1.5, v * k);
        if (id === 'gap') { c.strokeStyle = C.line; c.setLineDash([4, 4]); c.strokeRect(x + 2, T, sw - 4, bh); c.setLineDash([]); }
        else { c.fillStyle = col[id]; c.globalAlpha = id === 'data' ? 0.85 : 1; c.fillRect(x, T, sw - (id === 'oc' ? 0 : 1), bh); c.globalAlpha = 1; }
        if (id !== 'oc') placed.push([x + sw / 2, t('ch3.cv.' + id), sw]);
        x += sw;
      }
      // labels under the bar, skipping any that would collide
      c.font = FONT; let lastR = -Infinity; const y = T + bh + 16;
      for (const [cx, s] of placed) { const tw = c.measureText(s).width; let x0 = Math.min(Math.max(cx - tw / 2, L), R - tw); if (x0 < lastR + 6) continue; c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(s, x0, y); lastR = x0 + tw; }
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText('0', L, T - 12); c.textAlign = 'right'; c.fillText(dur(r.us * 1e-6), R, T - 12);
    }
  });
  function text() {
    const r = M.SSP.read(n(), g(), null, chk.checked);
    put('#spUs', dur(r.us * 1e-6)); put('#spEff', pct(r.eff)); put('#spIops', t('u.iops', { v: fmt(Math.round(r.iops / 100) * 100, 0) })); put('#spWire', t('u.bytes', { v: fmt(r.f.total, 0) }));
    const s = M.say.ssp(n(), g(), chk.checked), v = s.v;
    putHTML('#spSay', t(s.key, { eff: pct(v.eff), us: dur(v.us * 1e-6), ov: dur(v.ov * 1e-6), iops: fmt(Math.round(v.iops / 100) * 100, 0), MBps: t('u.MBps', { v: fmt(v.MBps, 0) }) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  onAll(radios('spN'), 'change', go); onAll(radios('spG'), 'change', go); chk.addEventListener('change', go);
  text();
})();

/* ───────── 04 availability ───────── */
(() => {
  const cv = $('#avCv'), sM = $('#avM'), sR = $('#avR'), sF = $('#avF'), A = M.AVAIL;
  const PARTS = ['paths', 'drive', 'inter', 'failover'];
  const P = () => ({ ctrlMtbf: Math.pow(10, +sM.value / 10), mttr: +sR.value, failoverS: +sF.value });
  const d = () => radioVal('avD'), p = () => +radioVal('avP');
  const LO = -4, HI = 3;   // log10 minutes per year
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), r = A.run(d(), p(), P()), labs = PARTS.map(k => t('ch4.part.' + k));
      const lf = labelFont(c, labs, Math.min(120, w * 0.3));
      const L = lf.w, R = w - 16, T = 12, B = h - 38, rh = (B - T) / PARTS.length;
      const X = v => L + (R - L) * (clamp(Math.log10(v), LO, HI) - LO) / (HI - LO);
      const items = [];
      for (let e = LO; e <= HI; e++) { const x = X(Math.pow(10, e)); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); items.push([x, pow10(e)]); }
      c.fillStyle = C.mute; spacedTicks(c, items, B + 11); c.textAlign = 'right'; c.fillText(t('ch4.cv.x'), R, B + 27);
      PARTS.forEach((k, i) => {
        const y = T + i * rh, bh = rh * 0.5, v = r.parts[k], top = k === r.top;
        c.font = lf.font; c.textAlign = 'right'; c.fillStyle = top ? C.gold : C.ink; c.fillText(labs[i], L - 8, y + rh / 2); c.font = FONT;
        if (v > 0) { c.fillStyle = top ? C.red : C.dimfill; c.fillRect(L, y + (rh - bh) / 2, Math.max(2, X(v) - L), bh); }
        const s = v > 0 ? dur(v * 60) : t('ch4.cv.zero'); c.font = FONT; const tw = c.measureText(s).width;
        const xe = v > 0 ? X(v) : L; let x0 = xe + 6; if (x0 + tw > R) x0 = xe - tw - 6;
        if (x0 < L + 2) x0 = L + 2;
        tag(c, s, x0, y + rh / 2, x0 < xe ? C.ink : C.mute, 'left');
      });
    }
  });
  function text() {
    const pp = P(), r = A.run(d(), p(), pp);
    put('#avMo', t('u.hours', { v: fmt(pp.ctrlMtbf, 0) })); put('#avRo', t('u.hours', { v: fmt(pp.mttr, 0) })); put('#avFo', t('u.sec', { v: fmt(pp.failoverS, 0) }));
    put('#avTot', t('u.minyr', { v: fmt(r.total, r.total >= 10 ? 0 : 1) })); put('#avNines', t('ch4.unit.n', { v: fmt(r.nines, 1) }));
    put('#avTop', t('ch4.part.' + r.top)); put('#avUse', t(r.usable === 1 ? 'ch4.unit.p1' : 'ch4.unit.p', { v: r.usable }));
    const s = M.say.avail(d(), p(), pp), v = s.v;
    putHTML('#avSay', t(s.key, { total: dur(v.total * 60), nines: fmt(v.nines, 1), top: t('ch4.part.' + v.top) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  [sM, sR, sF].forEach(e => e.addEventListener('input', go)); onAll(radios('avD'), 'change', go); onAll(radios('avP'), 'change', go);
  text();
})();

/* ───────── 05 fan-out ───────── */
(() => {
  const cv = $('#fnCv'), sN = $('#fnN'), F = M.FAN;
  const k = () => radioVal('fnK'), wk = () => radioVal('fnW'), l = () => +radioVal('fnL'), g = () => radioVal('fnG');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), pts = [];
      let top = 0, cap = 0;
      for (let N = 1; N <= 120; N++) { const r = F.run(N, k(), wk(), l(), g()); pts.push([N, r.doneMB]); top = Math.max(top, r.demandMB); cap = r.capMB; }
      const ymax = Math.max(cap * 1.25, Math.min(top, cap * 1.6)) || 1;
      const nice = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; };
      const Y1 = nice(ymax), step = Y1 / 4;
      const f = frame(w, h, [30, 16, 38, 58], 0, 120, 0, Y1);
      yTicks(c, f, [0, step, 2 * step, 3 * step, 4 * step], v => fmt(v, 0)); axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'));
      c.fillStyle = C.mute; spacedTicks(c, [0, 24, 48, 72, 96, 120].map(v => [f.X(v), fmt(v, 0)]), f.B + 11);
      c.strokeStyle = C.gold; c.setLineDash([5, 4]); c.lineWidth = 1.4; c.beginPath(); c.moveTo(f.L, f.Y(cap)); c.lineTo(f.R, f.Y(cap)); c.stroke(); c.setLineDash([]);
      path(c, pts, f.X, f.Y, C.cyan);
      const N = +sN.value, r = F.run(N, k(), wk(), l(), g());
      dot(c, f.X(N), f.Y(r.doneMB), C.gold, 5);
      const lab = t('ch5.cv.cap'); c.font = FONT; const tw = c.measureText(lab).width;
      const capY = f.Y(cap), yl = capY - 12 < f.T + 4 ? capY + 12 : capY - 12;
      tag(c, lab, f.R - tw, yl, C.gold, 'left');
    }
  });
  function text() {
    const N = +sN.value, r = F.run(N, k(), wk(), l(), g());
    put('#fnNo', t(N === 1 ? 'ch5.unit.n1' : 'ch5.unit.n', { v: N }));
    put('#fnDone', t('u.MBps', { v: fmt(r.doneMB, 0) })); put('#fnCap', t('u.MBps', { v: fmt(r.capMB, 0) }));
    put('#fnRho', r.saturated ? pct(1) : pct(r.rho, r.rho < 0.1 ? 1 : 0)); put('#fnWait', isFinite(r.waitUs) ? dur(r.waitUs * 1e-6) : '∞');
    const s = M.say.fan(N, k(), wk(), l(), g()), v = s.v;
    putHTML('#fnSay', t(s.key, { done: t('u.MBps', { v: fmt(v.done, 0) }), demand: t('u.MBps', { v: fmt(v.demand, 0) }), cap: t('u.MBps', { v: fmt(v.cap, 0) }), rho: pct(v.rho, v.rho < 0.1 ? 1 : 0), wait: isFinite(v.wait) ? dur(v.wait * 1e-6) : '∞', satN: fmt(Math.floor(v.satN), 0), over: fmt(v.over, 1) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sN.addEventListener('input', go); ['fnK', 'fnW', 'fnL', 'fnG'].forEach(nm => onAll(radios(nm), 'change', go));
  text();
})();

/* ───────── 06 wide port ───────── */
(() => {
  const cv = $('#wdCv'), sK = $('#wdK'), btn = $('#wdPlay'), W = M.WIDE, LANES = 4;
  const PAL = [C.cyan, C.gold, C.green, C.violet, C.red, '#e98fd0', '#9fd36b', '#f0a35e'];
  const K = () => +sK.value, ty = () => radioVal('wdT'), sz = () => +radioVal('wdS'), g = () => radioVal('wdG');
  let S = null, meas = null, playing = !reduce, span = 0;
  function reset() {
    S = W.make(K(), ty(), sz(), LANES, g(), false);
    W.step(S, 3000);
    span = Math.max(40, Math.min(4000, S.hold * 24));
    if (reduce) W.step(S, span);
    meas = W.measure(K(), ty(), sz(), LANES, g(), false);
  }
  function draw() {
    const { c, w, h } = fit(cv), labs = []; for (let i = 0; i < LANES; i++) labs.push(t('ch6.cv.lane', { n: i + 1 }));
    const lf = labelFont(c, labs, Math.min(70, w * 0.2));
    const L = lf.w, R = w - 10, T = 8, B = h - 26, rh = (B - T) / LANES, t1 = S.t, t0 = t1 - span;
    const X = tt => L + (R - L) * (tt - t0) / span;
    S.lanes.forEach((ln, i) => {
      const y = T + i * rh;
      c.font = lf.font; c.textAlign = 'right'; c.fillStyle = C.ink; c.fillText(labs[i], L - 8, y + rh / 2); c.font = FONT;
      c.fillStyle = '#151a24'; c.fillRect(L, y + 3, R - L, rh - 6);
      const blocks = ln.log.slice(); if (ln.who >= 0) blocks.push([ln.from, Math.min(ln.until, t1), ln.who]);
      for (const [a, b, who] of blocks) { if (b < t0) continue; const xa = Math.max(L, X(a)), xb = Math.min(R, X(b)); if (xb <= xa) continue; c.fillStyle = PAL[who % PAL.length]; c.fillRect(xa, y + 5, Math.max(1, xb - xa - 1), rh - 10); }
    });
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch6.cv.t'), R, B + 14);
  }
  const sim = reg(cv, {
    draw,
    step(dt) { if (playing && !reduce) { W.step(S, dt * span / 4); draw(); } else if (this.dirty) { draw(); this.dirty = false; } }
  });
  function text() {
    put('#wdKo', t(K() === 1 ? 'ch5.unit.n1' : 'ch5.unit.n', { v: K() }));
    put('#wdMB', t('u.MBps', { v: fmt(meas.MBps, 0) })); put('#wdPer', t('u.MBps', { v: fmt(meas.perDrive, 0) }));
    put('#wdUtil', pct(meas.util)); put('#wdWait', waitText(meas.waitUs));
    const s = M.say.wide(meas, K(), LANES), v = s.v;
    putHTML('#wdSay', t(s.key, { k: v.k, MBps: t('u.MBps', { v: fmt(v.MBps, 0) }), per: t('u.MBps', { v: fmt(v.per, 0) }), util: pct(v.util), wait: waitText(v.wait) }));
    btn.textContent = t(playing ? 'ch6.btn.pause' : 'ch6.btn.play'); btn.setAttribute('aria-pressed', String(!playing));
  }
  sim.text = text;
  const go = () => { reset(); sim.dirty = true; text(); };
  sK.addEventListener('input', go); ['wdT', 'wdS', 'wdG'].forEach(nm => onAll(radios(nm), 'change', go));
  btn.addEventListener('click', () => { playing = !playing; sim.dirty = true; text(); });
  if (reduce) { btn.disabled = true; btn.hidden = true; }
  reset(); text();
})();

/* ───────── 08 T10 PI ───────── */
(() => {
  const cv = $('#piCv'), chk = $('#piOn'), sB = $('#piB'), P = M.PI, LBA = 123456;
  const TRI = P.firstMissedTriple(4096);
  const data = P.block(LBA);
  const fault = () => radioVal('piF');
  const bits = () => { const m = radioVal('piN'), b = +sB.value; if (m === 'tri') return TRI; const o = [b]; if (m !== '1') o.push((b + 1000) % 4096); if (m === '3') o.push((b + 2001) % 4096); return o; };
  const flips = () => (fault() === 'link' || fault() === 'mem') ? bits() : [];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = 64, cell = Math.floor(Math.min(w - 8, h - 8) / n), x0 = Math.floor((w - cell * n) / 2), y0 = Math.floor((h - cell * n) / 2);
      const bad = new Set(flips());
      for (let i = 0; i < 4096; i++) {
        const on = (data[i >> 3] >> (7 - (i & 7))) & 1, x = x0 + (i % n) * cell, y = y0 + Math.floor(i / n) * cell;
        if (bad.has(i)) { c.fillStyle = C.red; c.fillRect(x - 1, y - 1, cell + 1, cell + 1); c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.arc(x + cell / 2, y + cell / 2, cell * 2.2, 0, 6.283); c.stroke(); c.lineWidth = 1; }
        else if (on) { c.fillStyle = '#3d4a63'; c.fillRect(x, y, cell - 1, cell - 1); }
      }
      c.strokeStyle = C.line; c.strokeRect(x0 - 0.5, y0 - 0.5, cell * n + 1, cell * n + 1);
    }
  });
  function text() {
    const f = fault(), on = chk.checked, r = P.run(f, flips(), LBA, on);
    enable([sB, ...radios('piN')], f === 'link' || f === 'mem');
    if (radioVal('piN') === 'tri') sB.disabled = true;
    put('#piBo', t('u.bit', { v: sB.value }));
    putHTML('#piChips', ['link', 'ecc', 'guard', 'ref'].map(k => `<div class="${r.ck[k]}"><b>${t('ch8.st.' + r.ck[k])}</b>${t('ch8.ck.' + k)}</div>`).join(''));
    put('#piGuard', on ? hex4(r.want.guard) : t('ch8.st.off')); put('#piSeen', hex4(r.guardSeen)); put('#piRef', on ? hex8(r.want.ref) : t('ch8.st.off'));
    put('#piOut', t('ch8.out.' + r.outcome));
    const s = M.say.pi(r, f, on);
    putHTML('#piSay', t(s.key, { guard: hex4(s.v.guard), seen: hex4(s.v.seen) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sB.addEventListener('input', go); chk.addEventListener('change', go); onAll(radios('piF'), 'change', go); onAll(radios('piN'), 'change', go);
  let gb = null;
  const gbText = () => { if (gb) put('#piGbOut', t('ch8.garbage', { n: fmt(gb.trials, 0), miss: fmt(gb.miss, 0) })); };
  $('#piGb').addEventListener('click', () => { gb = P.garbage(65536); gbText(); });
  const old = sim.text; sim.text = () => { old(); gbText(); };
  text();
})();

/* ───────── 09 FEC ───────── */
(() => {
  const cv = $('#fcCv'), sE = $('#fcE'), sB = $('#fcB'), F = M.FEC;
  const ber = () => Math.pow(10, +sE.value), b = () => +sB.value, k = () => +radioVal('fcI');
  const XL = -9, XH = -4, YL = -24, YH = 0;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [24, 16, 38, 48], XL, XH, YL, YH);
      const ly = v => clamp(Math.log10(Math.max(v, 1e-300)), YL, YH);
      yTicks(c, f, [-24, -18, -12, -6, 0], v => pow10(v)); axes(c, f, t('ch9.cv.x'), '');
      c.fillStyle = C.mute; spacedTicks(c, [-9, -8, -7, -6, -5, -4].map(v => [f.X(v), pow10(v)]), f.B + 11);
      const pts = [], np = [];
      for (let e = XL; e <= XH + 1e-9; e += 0.1) { const r = F.run(Math.pow(10, e), b(), k()); pts.push([e, ly(r.pCw)]); np.push([e, ly(r.noFec)]); }
      path(c, np, f.X, f.Y, C.mute, 1.5, [5, 4]);
      path(c, pts, f.X, f.Y, C.cyan);
      const r = F.run(ber(), b(), k()); dot(c, f.X(+sE.value), f.Y(ly(r.pCw)), C.gold, 5);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch9.cv.y'), f.L + 6, f.T - 12);
    }
  });
  function text() {
    const r = F.run(ber(), b(), k());
    put('#fcEo', sci(ber())); put('#fcBo', t(b() === 1 ? 'ch9.unit.b1' : 'ch9.unit.b', { v: b() }));
    put('#fcP', sci(r.pCw)); put('#fcEvery', dur(r.everyS)); put('#fcOk', pct(r.singleOk)); put('#fcNo', dur(r.noFecEveryS));
    const s = M.say.fec(ber(), b(), k()), v = s.v;
    putHTML('#fcSay', t(s.key, { every: dur(v.every), ok: pct(v.ok), nofec: dur(v.nofec), p: sci(v.p) }));
  }
  sim.text = text;
  const go = () => { sim.dirty = true; text(); };
  sE.addEventListener('input', go); sB.addEventListener('input', go); onAll(radios('fcI'), 'change', go);
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
