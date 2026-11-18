/* Why can't a battery just hold more? Wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.BatteryModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const FONTB = '600 12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const effLang = () => (COPY[lang] ? lang : 'zh');
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const langHooks = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langHooks.forEach(f => f());
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
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

/* ───────── static diagrams (STANDARD §4a): inline SVG built from small specs, labels from copy ─────────
   Two layouts: 'w' (viewBox 720 wide, when the figure is ≥ 600 px) and 'n' (viewBox 340 wide). Text is 14 units, so it
   renders at ≥ 11.7 px in either layout at its narrowest. A label with a width limit wraps onto more lines.
   Colours: anode cyan, cathode gold, lithium green, interphase violet, electrolyte grey. (Helper pattern shared with the
   site's other hand-written essays, e.g. computing/systems/what-a-drive-is-made-of.) */
const NS = 'http://www.w3.org/2000/svg';
const FS = 14, LH = 18;
function S(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
const tint = (col, a) => { const n = parseInt(col.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function mk(svg) {
  const g = {
    box(x, y, w, h, col, o) { o = o || {}; S('rect', { x, y, width: w, height: h, rx: o.rx == null ? 8 : o.rx, fill: o.solid ? col : tint(col, o.a == null ? 0.13 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || 'none' }, svg); },
    line(x1, y1, x2, y2, col, o) { o = o || {}; S('line', { x1, y1, x2, y2, stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    path(d, col, o) { o = o || {}; S('path', { d, fill: 'none', stroke: col || C.mute, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || 'none', 'marker-end': o.arrow ? `url(#ar-${(col || C.mute).slice(1)})` : 'none' }, svg); },
    circle(cx, cy, r, col, o) { o = o || {}; S('circle', { cx, cy, r, fill: o.solid ? col : o.none ? 'none' : tint(col, o.a == null ? 0.14 : o.a), stroke: o.nostroke ? 'none' : col, 'stroke-width': o.sw || 1.6 }, svg); },
    // text: key (or {raw}), position, options: a = start|middle|end, c = colour class, w = wrap width, va = top|mid, vars
    text(x, y, key, o) {
      o = o || {}; const s = typeof key === 'object' ? key.raw : t(key, o.vars);
      const e = S('text', { x, y, 'font-size': FS, 'text-anchor': o.a || 'start', 'dominant-baseline': 'central', class: o.c || '' }, svg);
      e.textContent = s; if (o.w) { e.dataset.w = o.w; e.dataset.va = o.va || 'top'; } if (o.weight) e.setAttribute('font-weight', o.weight);
      return e;
    },
    num(x, y, n) { g.circle(x, y, 10, C.ink, { solid: true, sw: 1 }); const e = g.text(x, y + 0.5, { raw: String(n) }, { a: 'middle', c: 'k', weight: 700 }); e.dataset.onmark = '1'; }
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
    const toks = cjk ? s.match(/[A-Za-z0-9.,%+×–\-/()\[\]:_⁺⁻²·°µ]+[\uff0c\u3002\uff1b\uff1a\u3001\uff09]*|\s+|.[\uff0c\u3002\uff1b\uff1a\u3001\uff09]*/g) : s.split(/(\s+)/);
    e.textContent = ''; const lines = []; let cur = '';
    const probe = S('tspan', {}, e);
    for (const tk of toks) { const nx = cur + tk; probe.textContent = nx; if (e.getComputedTextLength() > maxw && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; } else cur = nx; }
    if (cur.trim()) lines.push(cur.trim()); e.removeChild(probe);
    const off = e.dataset.va === 'mid' ? -(lines.length - 1) * LH / 2 : 0;
    lines.forEach((l, i) => { const ts = S('tspan', { x, y: y0 + off + i * LH }, e); ts.textContent = l; });
  }
}
const DG = {};
const numList = (g, items, x, y, dy, w) => items.forEach(([n, k, c, vars], i) => { g.num(x + 10, y + i * dy, n); g.text(x + 28, y + i * dy, k, { c, w: w - 28, vars, va: 'mid' }); });
const umM = m => { const v = Math.round(m * 1e7) / 10; return fmt(v, v % 1 ? 1 : 0); };

// ch1: the skeleton of a cell — two electrodes, electrolyte, separator, the wire outside
DG.cell = L => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 286 : 312;
  return { W, H, draw(g) {
    const ax = wide ? 190 : 12, cx = wide ? 450 : 262, ew = wide ? 80 : 66, top = 86, bot = wide ? 250 : 236, mid = (ax + ew + cx) / 2, wy = 46;
    g.box(ax + ew, top + 10, cx - ax - ew, bot - top - 10, C.mute, { rx: 0, a: 0.07, nostroke: true });
    g.box(ax, top, ew, bot - top, C.cyan); g.box(cx, top, ew, bot - top, C.gold);
    g.line(mid, top + 10, mid, bot, C.mute, { dash: '5 4' });
    g.path(`M${ax + ew / 2},${top} V${wy} H${mid - 40}`, C.ink, {}); g.path(`M${mid + 40},${wy} H${cx + ew / 2} V${top}`, C.ink, { arrow: true });
    g.box(mid - 40, wy - 16, 80, 32, C.ink, { a: 0.06 }); g.text(mid, wy, 'dg.cell.load', { a: 'middle' });
    g.text(ax + ew / 2, top + 22, 'dg.cell.anode', { a: 'middle', c: 'c', weight: 600 }); g.text(cx + ew / 2, top + 22, 'dg.cell.cathode', { a: 'middle', c: 'g', weight: 600 });
    if (wide) g.text((ax + ew / 2 + mid - 40) / 2, wy - 18, 'dg.cell.e', { a: 'middle', c: 'm' }); else g.text(mid - 46, wy - 20, 'dg.cell.e', { a: 'end', c: 'm' });
    const half = (mid - ax - ew), iy = top + (wide ? 62 : 56);
    g.line(ax + ew + 10, iy + 26, cx - 10, iy + 26, C.green, { arrow: true });
    g.text(ax + ew + half / 2, iy, 'dg.cell.ion', { a: 'middle', c: 'n', w: half - 12, va: 'mid' });
    g.text(mid + half / 2, iy, 'dg.cell.ely', { a: 'middle', c: 'm', w: half - 12, va: 'mid' });
    g.text(mid, bot + 16, 'dg.cell.sep', { a: 'middle', c: 'm' });
    if (wide) {
      g.text(ax - 12, (top + bot) / 2, 'dg.cell.ox', { a: 'end', c: 'c', w: 176, va: 'mid' });
      g.text(cx + ew + 12, (top + bot) / 2, 'dg.cell.red', { c: 'g', w: 176, va: 'mid' });
    } else {
      g.text(8, bot + 42, 'dg.cell.ox', { c: 'c', w: 324, va: 'mid' }); g.text(8, bot + 64, 'dg.cell.red', { c: 'g', w: 324, va: 'mid' });
    }
  } };
};

// ch2: one repeating unit of the electrode stack, thickness to scale (LG M50: Chen 2020, via models.js)
DG.stack = L => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 318;
  const layers = [['al', M.STACK.alFoil * 1e-2, C.mute], ['cathode', M.SPM.Lp, C.gold], ['sep', M.STACK.sep * 1e-2, C.violet], ['anode', M.SPM.Ln, C.cyan], ['cu', M.STACK.cuFoil * 1e-2, C.red]]; // metres
  const cls = { al: 'm', cathode: 'g', sep: 'v', anode: 'c', cu: 'r' };
  return { W, H, draw(g) {
    const x0 = wide ? 60 : 10, bw = W - 2 * x0, tot = layers.reduce((s, l) => s + l[1], 0), y = wide ? 70 : 40, bh = wide ? 96 : 84;
    let x = x0; const mids = {};
    for (const [k, th, col] of layers) { const w = th / tot * bw; g.box(x, y, w, bh, col, { rx: 0, a: k === 'al' || k === 'cu' ? 0.55 : 0.2 }); mids[k] = x + w / 2; x += w; }
    g.line(mids.cathode, y + bh / 2, mids.anode, y + bh / 2, C.green, { arrow: true });
    const v = k => ({ t: umM(layers.find(l => l[0] === k)[1]) });
    if (wide) {
      g.text(mids.cathode, y - 22, 'dg.stack.cathode', { a: 'middle', c: 'g', vars: v('cathode') }); g.text(mids.anode, y - 22, 'dg.stack.anode', { a: 'middle', c: 'c', vars: v('anode') });
      g.text(x0, y + bh + 22, 'dg.stack.al', { c: 'm', vars: v('al') }); g.text(mids.sep, y + bh + 22, 'dg.stack.sep', { a: 'middle', c: 'v', vars: v('sep') }); g.text(x0 + bw, y + bh + 22, 'dg.stack.cu', { a: 'end', c: 'r', vars: v('cu') });
      g.text(x0, y + bh + 56, 'dg.stack.note', { c: 'm', w: bw });
    } else {
      layers.forEach(([k], i) => g.num(mids[k], y - 20, i + 1));
      numList(g, layers.map(([k], i) => [i + 1, 'dg.stack.' + k, cls[k], v(k)]), 4, y + bh + 24, 24, 330);
      g.text(6, y + bh + 24 + 5 * 24 + 4, 'dg.stack.note', { c: 'm', w: 328 });
    }
  } };
};

// ch3: the same half-filled host as a solid solution and as two coexisting phases
DG.host = L => {
  const wide = L === 'w', W = wide ? 720 : 340, pw = 320, ph = 226, H = wide ? ph : 2 * ph + 8;
  const COLS = 12, ROWS = 5, sp = 26;
  // a fixed pattern with exactly half the sites filled, scattered (seeded shuffle, so it is the same on every load)
  const order = Array.from({ length: COLS * ROWS }, (_, i) => i); let seed = 11;
  for (let i = order.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) % 2147483648; const j = seed % (i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  const onSet = new Set(order.slice(0, COLS * ROWS / 2)), filled = (r, c) => onSet.has(r * COLS + c);
  return { W, H, draw(g) {
    const panel = (px, py, two) => {
      g.text(px, py + 14, two ? 'dg.host.two' : 'dg.host.solid', { c: two ? 'v' : 'g', weight: 600, w: pw, va: 'top' });
      const gx = px + (pw - (COLS - 1) * sp) / 2, gy = py + 70;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const on = two ? c < COLS / 2 : filled(r, c);
        g.circle(gx + c * sp, gy + r * sp, 9, on ? C.green : C.mute, on ? { solid: true, sw: 1 } : { none: true, sw: 1.2 });
      }
      const by = gy + (ROWS - 1) * sp + 30;
      if (two) {
        g.line(gx + (COLS / 2 - 0.5) * sp, gy - 16, gx + (COLS / 2 - 0.5) * sp, gy + (ROWS - 1) * sp + 16, C.violet, { dash: '5 4' });
        g.text(gx + (COLS / 4 - 0.5) * sp, by, 'dg.host.rich', { a: 'middle', c: 'n' }); g.text(gx + (3 * COLS / 4 - 0.5) * sp, by, 'dg.host.poor', { a: 'middle', c: 'm' });
      } else g.text(px + pw / 2, by, 'dg.host.one', { a: 'middle', c: 'm' });
    };
    if (wide) { panel(20, 0, false); panel(380, 0, true); } else { panel(10, 0, false); panel(10, ph + 8, true); }
  } };
};

// ch4: a particle cut open during a fast charge — full at the surface, empty at the core
DG.particle = L => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 444;
  return { W, H, draw(g) {
    const cx = 170, cy = 150, R = 104;
    // lithium content falls from the surface to the core: a bright disc, darkened step by step towards the centre
    g.circle(cx, cy, R, C.green, { a: 0.85, sw: 1.8 });
    [0.8, 0.6, 0.4, 0.2].forEach(f => g.circle(cx, cy, R * f, C.bg, { a: 0.42, nostroke: true }));
    for (const deg of [150, 210, 90, 270]) { const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180); g.line(cx + (R + 40) * c, cy - (R + 40) * s, cx + (R + 8) * c, cy - (R + 8) * s, C.green, { arrow: true }); }
    g.line(cx, cy, cx + R, cy, C.ink, { sw: 1.2, dash: '4 3' });
    const items = [['in', 'n'], ['surf', 'n'], ['core', 'm'], ['r', '']];
    const marks = [[cx - R - 30, cy - 34], [cx + R * 0.64, cy - R * 0.64], [cx, cy - 16], [cx + R * 0.5, cy + 14]];
    if (wide) {
      const lx = 400, ys = [60, 116, 172, 228];
      marks.forEach(([mx, my], i) => g.num(i === 0 ? cx - R - 30 : mx, i === 0 ? cy - 34 : my, i + 1));
      items.forEach(([k, c], i) => { g.num(lx, ys[i], i + 1); g.text(lx + 20, ys[i], 'dg.particle.' + k, { c, w: 290, va: 'mid' }); });
    } else {
      marks.forEach(([mx, my], i) => g.num(mx, my, i + 1));
      numList(g, items.map(([k, c], i) => [i + 1, 'dg.particle.' + k, c]), 4, 2 * cy + 20, 30, 330);
    }
  } };
};

// ch5: what the charger's voltage is made of
DG.volt = L => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 190 : 348;
  const parts = [['ocv', C.gold, 'g'], ['eta', C.cyan, 'c'], ['ir', C.violet, 'v'], ['v', C.red, 'r']];
  return { W, H, draw(g) {
    const vars = { v: fmt(M.SPM.Vmax, 1) };
    if (wide) {
      const bw = 150, gap = 36, x0 = 6, y = 20, bh = 54;
      parts.forEach(([k, col, c], i) => {
        const x = x0 + i * (bw + gap);
        g.box(x, y, bw, bh, col); g.text(x + bw / 2, y + bh / 2, 'dg.volt.' + k, { a: 'middle', c, weight: 600, w: bw - 10, va: 'mid' });
        g.text(x + bw / 2, y + bh + 20, 'dg.volt.' + k + 'Note', { a: 'middle', c: 'm', w: bw + 20, va: 'top', vars });
        if (i < 3) g.text(x + bw + gap / 2, y + bh / 2, { raw: i < 2 ? '+' : '=' }, { a: 'middle', c: 'm', weight: 700 });
      });
    } else {
      const bw = 128, x = 8, bh = 56, dy = 86;
      parts.forEach(([k, col, c], i) => {
        const y = 8 + i * dy;
        g.box(x, y, bw, bh, col); g.text(x + bw / 2, y + bh / 2, 'dg.volt.' + k, { a: 'middle', c, weight: 600, w: bw - 10, va: 'mid' });
        g.text(x + bw + 14, y + bh / 2, 'dg.volt.' + k + 'Note', { c: 'm', w: 184, va: 'mid', vars });
        if (i < 3) g.text(x + bw / 2, y + bh + (dy - bh) / 2, { raw: i < 2 ? '+' : '=' }, { a: 'middle', c: 'm', weight: 700 });
      });
    }
  } };
};

// ch6: three temperatures of fully charged NMC and LFP 21700 cells, on a temperature axis to scale (Ohneseit et al. 2023)
DG.temps = L => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 238 : 290;
  const E = M.FRONTIER.find(e => e.id === 'lfpSafety');
  const rows = [['nmc', [E.nmcOnset, E.nmcTR, E.nmcMax]], ['lfp', [E.lfpOnset, E.lfpTR, E.lfpMax]]], COLS = [C.gold, C.red, C.violet], CLS = ['g', 'r', 'v'], KEYS = ['onset', 'tr', 'max'];
  return { W, H, draw(g) {
    const xa = wide ? 40 : 22, xb = W - (wide ? 40 : 22), X = T => xa + (xb - xa) * T / 650;
    rows.forEach(([k, vals], i) => {
      const y0 = 16 + i * 76;
      g.text(xa, y0, 'dg.temps.' + k, { c: 'm', weight: 600 });
      g.line(X(0), y0 + 48, X(650), y0 + 48, C.line, { sw: 1 });
      g.line(X(vals[0]), y0 + 48, X(vals[1]), y0 + 48, C.gold, { sw: 4 });
      vals.forEach((T, j) => { g.circle(X(T), y0 + 48, 6, COLS[j], { solid: true, sw: 1 }); g.text(X(T), y0 + 28, { raw: fmt(T, 1) }, { a: 'middle', c: CLS[j] }); });
    });
    const ya = 16 + 2 * 76 + 6;
    g.line(X(0), ya, X(650), ya, C.mute, { sw: 1.2 });
    for (const T of wide ? [0, 100, 200, 300, 400, 500, 600] : [0, 200, 400, 600]) { g.line(X(T), ya, X(T), ya + 5, C.mute, { sw: 1.2 }); g.text(X(T), ya + 18, { raw: fmt(T) }, { a: 'middle', c: 'm' }); }
    g.text(X(650), ya - 14, 'dg.temps.unit', { a: 'end', c: 'm' });
    KEYS.forEach((k, j) => {
      const lx = wide ? xa + j * 220 : xa, ly = wide ? ya + 50 : ya + 46 + j * 24;
      g.circle(lx + 6, ly, 6, COLS[j], { solid: true, sw: 1 }); g.text(lx + 20, ly, 'dg.temps.' + k, { c: CLS[j] });
    });
  } };
};

// ch7: the interphase on graphite, new and after years
DG.sei = L => {
  const wide = L === 'w', W = wide ? 720 : 340, ph = 196, H = wide ? ph : 2 * ph + 10;
  return { W, H, draw(g) {
    const panel = (px, py, old) => {
      const pw = 320, gw = 112, d = old ? 56 : 16, top = py + 34, bh = 118, ex = px + gw + d, ew = pw - gw - d;
      g.text(px, py + 14, old ? 'dg.sei.old' : 'dg.sei.new', { c: 'm', weight: 600 });
      g.box(px, top, gw, bh, C.cyan, { rx: 0 }); g.box(px + gw, top, d, bh, C.violet, { rx: 0, a: 0.45 }); g.box(ex, top, ew, bh, C.mute, { rx: 0, a: 0.07 });
      g.text(px + gw / 2, top + 16, 'dg.sei.gr', { a: 'middle', c: 'c', weight: 600 }); g.text(ex + ew / 2, top + 16, 'dg.sei.ely', { a: 'middle', c: 'm', weight: 600 });
      g.text(ex + ew / 2, top + 40, 'dg.sei.li', { a: 'middle', c: 'n' });
      g.line(px + pw - 10, top + 56, px + 12, top + 56, C.green, { arrow: true });
      g.line(px + 12, top + 78, px + gw - 3, top + 78, C.red, { arrow: true }); g.line(px + gw + 2, top + 70, px + gw + 2, top + 86, C.red, { sw: 3 });
      g.text(px + gw / 2, top + 98, 'dg.sei.e', { a: 'middle', c: 'r' });
      g.line(px + pw - 10, top + 78, px + gw + d * (old ? 0.55 : 0.2), top + 78, C.mute, { arrow: true, dash: '4 3' });
      g.text(ex + ew / 2, top + 98, 'dg.sei.solv', { a: 'middle', c: 'm' });
      g.text(px + gw + d / 2, top + bh + 18, 'dg.sei.film', { a: 'middle', c: 'v' });
    };
    if (wide) { panel(20, 0, false); panel(380, 0, true); } else { panel(10, 0, false); panel(10, ph + 10, true); }
  } };
};

const dgLayout = new WeakMap();
function renderDiagrams(force) {
  for (const fig of document.querySelectorAll('figure.dia')) {
    const box = fig.querySelector('.svg'), L = fig.clientWidth >= 600 ? 'w' : 'n';
    if (!force && dgLayout.get(fig) === L + effLang()) continue;
    dgLayout.set(fig, L + effLang());
    const spec = DG[fig.dataset.dg](L);
    box.textContent = '';
    const svg = S('svg', { viewBox: `0 0 ${spec.W} ${spec.H}`, role: 'img', 'aria-label': t('dg.' + fig.dataset.dg + '.aria'), class: L }, box);
    arrowDefs(svg); spec.draw(mk(svg)); wrapTexts(svg);
    // a wrapped note at the bottom can need more lines in one language than the layout allowed for: grow the drawing to fit
    let bottom = 0; for (const e of svg.querySelectorAll('text')) { const b = e.getBBox(); bottom = Math.max(bottom, b.y + b.height); }
    if (bottom + 4 > spec.H) svg.setAttribute('viewBox', `0 0 ${spec.W} ${Math.ceil(bottom + 6)}`);
  }
}

/* plot helpers */
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 10); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fmtv, X) {
  X = X || f.X; c.fillStyle = C.mute; c.textAlign = 'center';
  const cw = c.canvas.clientWidth;
  vals.forEach(v => { const x = X(v), s = fmtv(v), hw = c.measureText(s).width / 2; c.fillText(s, clamp(x, hw + 1, cw - hw - 1), f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv, Y) {
  Y = Y || f.Y; c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function hline(c, x0, x1, y, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); c.setLineDash([]); }
function vline(c, x, y0, y1, col, dash = [5, 4]) { c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash); c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); c.setLineDash([]); }
function path(c, pts, col, lw = 2.2, dash) { if (pts.length < 2) return; c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); c.stroke(); c.setLineDash([]); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
// text with a background patch so it stays legible over lines
function label(c, s, x, y, col, align = 'left', font = FONT) {
  c.font = font; c.textAlign = align; const w = c.measureText(s).width;
  const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  c.fillStyle = C.bg; c.fillRect(x0 - 2, y - 8, w + 4, 16);
  c.fillStyle = col; c.fillText(s, x, y); return w;
}
// replay clock: advances on real time, jumps to the end under reduced motion
function clock(dur) { return { p: reduce ? 1 : 0, dur, step(dt) { if (this.p < 1) { this.p = Math.min(1, this.p + dt / this.dur); return true; } return false; }, reset() { this.p = reduce ? 1 : 0; }, get done() { return this.p >= 1; } }; }
const logTicks = (a, b) => { const out = []; for (let e = Math.ceil(Math.log10(a)); e <= Math.floor(Math.log10(b)); e++) out.push(Math.pow(10, e)); return out; };
const fmtLog = v => v >= 1 ? fmt(v) : String(+v.toPrecision(1));
const debounce = (fn, ms) => { let h; return () => { clearTimeout(h); h = setTimeout(fn, ms); }; };

/* ───────── 01 potential ladder ───────── */
(() => {
  const cv = $('#lzCv'), sA = $('#lzA'), sC = $('#lzC'), EL = M.electrodes;
  function fillSelects() {
    for (const [sel, def] of [[sA, 'graphite'], [sC, 'nmc']]) {
      const cur = sel.value || def;
      sel.innerHTML = EL.map(e => `<option value="${e.id}">${t('ch1.el.' + e.id)}</option>`).join('');
      sel.value = cur;
    }
  }
  fillSelects(); langHooks.push(fillSelects);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv);
    const f = frame(w, h, [26, 10, 14, 44], 0, 1, -3.3, 1.9);
    // water window band
    c.fillStyle = 'rgba(99,199,230,.13)'; c.fillRect(f.L + 1, f.Y(M.WATER.o2), f.R - f.L - 1, f.Y(M.WATER.h2) - f.Y(M.WATER.o2));
    yTicks(c, f, [-3, -2, -1, 0, 1], v => fmt(v));
    axes(c, f, '', t('ch1.cv.axis'));
    const a = sA.value, k = sC.value;
    // labels spread so they never overlap
    const narrow = w < 360, xs = f.L + (narrow ? 26 : 34), xl = f.L + (narrow ? 44 : 64);
    const items = EL.map(e => ({ e, y: f.Y(e.E) })).sort((p, q) => p.y - q.y);
    const gap = 15;
    for (let i = 1; i < items.length; i++) items[i].ly = Math.max(items[i].y, (items[i - 1].ly != null ? items[i - 1].ly : items[i - 1].y) + gap);
    items[0].ly = items[0].y;
    const over = items[items.length - 1].ly - (f.B - 4); if (over > 0) items.forEach(p => { p.ly -= over; });
    for (let i = items.length - 2; i >= 0; i--) items[i].ly = Math.min(items[i].ly, items[i + 1].ly - gap);
    for (const p of items) {
      const col = p.e.id === a ? C.cyan : p.e.id === k ? C.gold : C.mute;
      c.strokeStyle = col; c.lineWidth = (p.e.id === a || p.e.id === k) ? 2.5 : 1;
      c.beginPath(); c.moveTo(f.L + 1, p.y); c.lineTo(xs, p.y); c.lineTo(xl - 4, p.ly); c.stroke();
      const sign = p.e.E > 0 ? '+' : '';
      label(c, `${t('ch1.el.' + p.e.id)}  ${sign}${fmt(p.e.E, 2)}`, xl, p.ly, col, 'left', (p.e.id === a || p.e.id === k) ? FONTB : FONT);
    }
    // arrow between the chosen pair
    const ya = f.Y(EL.find(e => e.id === a).E), yc = f.Y(EL.find(e => e.id === k).E), xa = f.L + 16;
    if (a !== k) {
      c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xa, yc); c.stroke();
      const dir = yc < ya ? -1 : 1; c.fillStyle = C.ink; c.beginPath(); c.moveTo(xa, yc); c.lineTo(xa - 5, yc - dir * 8); c.lineTo(xa + 5, yc - dir * 8); c.fill();
    }
  } });
  function text() {
    const a = sA.value, k = sC.value, r = M.cell(a, k);
    put('#lzE', t('ch1.unit.V', { v: fmt(r.E, 2) })); put('#lzG', t('ch1.unit.kJ', { v: fmt(r.dG, 0) })); put('#lzEv', t('ch1.unit.eV', { v: fmt(Math.abs(r.E), 2) }));
    const wk = M.say.water(a, k);
    put('#lzW', t('ch1.water.' + wk));
    const v = { a: t('ch1.el.' + a), c: t('ch1.el.' + k), E: fmt(Math.abs(r.E), 2), G: fmt(-r.dG, 0) };
    putHTML('#lzSay', t(M.say.ch1(a, k), v));
  }
  sim.text = text;
  [sA, sC].forEach(s => s.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 02 waterfall ───────── */
const BANDS = M.BANDS; // Frith et al. 2023, Supplementary Note 1
(() => {
  const cv = $('#wfCv'), sQ = $('#wfQ');
  const cur = () => ({ c: radioVal('wfC'), a: radioVal('wfA'), q: +sQ.value });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), p = cur(), S = M.ladder(p.c, p.a, p.q);
    const f = frame(w, h, [8, 14, 30, 8], 0, 1000, 0, 1);
    const n = S.length, rowH = (f.B - f.T) / n;
    const band = BANDS[p.c];
    if (band) { c.fillStyle = 'rgba(122,214,160,.20)'; c.fillRect(f.X(band[0]), f.T, f.X(band[1]) - f.X(band[0]), f.B - f.T); }
    vline(c, f.X(M.FRONTIER.find(x => x.id === 'tesla4680').whkg), f.T, f.B, C.red);
    xTicks(c, f, [0, 200, 400, 600, 800, 1000], v => fmt(v));
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
    label(c, t('ch2.unit.whkg', { v: '' }).trim(), f.R, f.B + 24, C.mute, 'right');
    S.forEach((s, i) => {
      const y = f.T + i * rowH, by = y + rowH * 0.55, bh = Math.min(12, rowH * 0.32);
      if (i > 0) { c.fillStyle = C.dim; c.fillRect(f.X(s.whkg), by - bh / 2, f.X(S[i - 1].whkg) - f.X(s.whkg), bh); }
      c.fillStyle = i === n - 1 ? C.cyan : C.gold; c.fillRect(f.X(0), by - bh / 2, f.X(s.whkg) - f.X(0), bh);
      label(c, t('ch2.step.' + s.key), f.L, y + rowH * 0.2, C.mute);
      const vs = fmt(s.whkg), xe = f.X(i > 0 ? S[i - 1].whkg : s.whkg) + 6;
      c.font = FONTB; const tw = c.measureText(vs).width;
      if (xe + tw < f.R) label(c, vs, xe, by, C.ink, 'left', FONTB);
      else label(c, vs, f.X(s.whkg) - 4, by, C.bg === C.bg ? C.ink : C.ink, 'right', FONTB);
    });
  } });
  function text() {
    const p = cur(), S = M.ladder(p.c, p.a, p.q), th = S[0].whkg, cell = S[S.length - 1].whkg;
    put('#wfQo', t('ch2.unit.areal', { v: fmt(p.q, 1) }));
    put('#wfTh', t('ch2.unit.whkg', { v: fmt(th) })); put('#wfCell', t('ch2.unit.whkg', { v: fmt(cell) }));
    put('#wfShare', fmt(cell / th * 100) + '%'); put('#wfAct', fmt(S[1].m / S[S.length - 1].m * 100) + '%');
    const big = M.say.ch2big(S);
    const v = { c: t('mat.' + p.c), a: t('mat.' + p.a), th: fmt(th), cell: fmt(cell), pct: fmt(cell / th * 100), big: t('ch2.step.' + S[big].key), drop: fmt(S[big - 1].whkg - S[big].whkg), q: fmt(p.q, 1), gain: fmt(cell - M.finalWhkg(p.c, 'graphite', p.q)) };
    putHTML('#wfSay', t(M.say.ch2(p.c, p.a, p.q), v));
  }
  sim.text = text;
  const redo = () => { sim.dirty = true; text(); };
  radios('wfC').concat(radios('wfA')).forEach(r => r.addEventListener('change', redo)); sQ.addEventListener('input', redo);
  text();
})();

/* ───────── 03a lattice gas ───────── */
(() => {
  const cv = $('#lgCv'), sW = $('#lgW');
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), W = +sW.value;
    const f = frame(w, h, [26, 12, 32, 46], 0, 1, -130, 130);
    yTicks(c, f, [-100, -50, 0, 50, 100], v => fmt(v)); xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2));
    axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
    c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
    const single = [], eq = [];
    for (let i = 1; i < 400; i++) { const x = i / 400; single.push([f.X(x), f.Y(1000 * M.latticeE(x, W))]); eq.push([f.X(x), f.Y(1000 * M.latticeEq(x, W))]); }
    path(c, single, C.mute, 1.4, [5, 4]); path(c, eq, C.gold, 2.6);
    c.restore();
    const b = M.binodal(W);
    if (b) { const y = f.Y(0); dot(c, f.X(b[0]), y, C.violet); dot(c, f.X(b[1]), y, C.violet); }
  } });
  function text() {
    const W = +sW.value, b = M.binodal(W);
    put('#lgWo', fmt(W, 1));
    put('#lgSlope', t('ch3.unit.mv10', { v: fmt(b ? 0 : Math.abs(M.latticeSlopeMid(W)) * 100, 1) }));
    put('#lgPlat', b ? t('ch3.unit.range', { a: fmt(b[0], 3), b: fmt(b[1], 3) }) : t('ch3.read.none'));
    const v = { w: fmt(W, 1), s: fmt(Math.abs(M.latticeSlopeMid(W)) * 100, 1) };
    if (b) { v.a = fmt(b[0], 3); v.b = fmt(b[1], 3); v.pct = fmt((b[1] - b[0]) * 100); }
    putHTML('#lgSay', t(M.say.ch3a(W), v));
  }
  sim.text = text;
  sW.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 03b real OCV curves ───────── */
(() => {
  const cv = $('#ocCv'), sS = $('#ocS'), sE = $('#ocE');
  const errPct = (cell, s, e) => M.socError(cell, s, e / 1000) * 100;
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), s = +sS.value / 100, e = +sE.value;
    const f = frame(w, h, [26, 12, 32, 40], 0, 1, 2.0, 4.4);
    yTicks(c, f, [2.0, 2.5, 3.0, 3.5, 4.0], v => fmt(v, 1)); xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v * 100) + '%');
    axes(c, f, t('ch3.cv2.x'), t('ch3.cv2.y'));
    for (const [cell, col] of [['nmcCell', C.cyan], ['lfpCell', C.violet]]) {
      const pts = []; for (let i = 0; i <= 300; i++) { const x = i / 300; pts.push([f.X(x), f.Y(M.ocv[cell](x))]); }
      path(c, pts, col, 2.2);
      const y = f.Y(M.ocv[cell](s)), d = Math.min(errPct(cell, s, e), 100) / 100;
      c.strokeStyle = col; c.lineWidth = 6; c.globalAlpha = 0.35; c.beginPath(); c.moveTo(f.X(clamp(s - d, 0, 1)), y); c.lineTo(f.X(clamp(s + d, 0, 1)), y); c.stroke(); c.globalAlpha = 1;
      dot(c, f.X(s), y, col);
    }
    vline(c, f.X(s), f.T, f.B, C.dim, [3, 4]);
  } });
  function text() {
    const s = +sS.value / 100, e = +sE.value;
    put('#ocSo', fmt(s * 100) + '%'); put('#ocEo', t('ch3.unit.mv', { v: fmt(e) }));
    const kn = M.ocv.slope('nmcCell', s) * 10, kl = M.ocv.slope('lfpCell', s) * 10, en = errPct('nmcCell', s, e), el = errPct('lfpCell', s, e);
    const pm = x => x > 50 ? t('ch3.unit.pmOver', { v: '50' }) : t('ch3.unit.pm', { v: fmt(x, 1) });
    put('#ocNk', t('ch3.unit.mvpct', { v: fmt(kn, 2) })); put('#ocLk', t('ch3.unit.mvpct', { v: fmt(kl, 2) }));
    put('#ocNe', pm(en)); put('#ocLe', pm(el));
    const ratio = el / en;
    putHTML('#ocSay', t(M.say.ch3b(s, e), { s: fmt(s * 100), e: fmt(e), en: pm(en), el: pm(el), ratio: fmt(ratio) }));
  }
  sim.text = text;
  [sS, sE].forEach(x => x.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 04 diffusion in one particle ───────── */
const CRATES = [0.5, 1, 2, 3, 4, 6, 10, 20];
function fmtDur(s) {
  if (s < 120) return t('ch4.unit.s', { v: fmt(s) });
  if (s < 7200) return t('ch4.unit.min', { v: fmt(s / 60, s < 600 ? 1 : 0) });
  return t('ch4.unit.h', { v: fmt(s / 3600, 1) });
}
(() => {
  const cv = $('#dfCv'), sR = $('#dfR'), sC = $('#dfC'), SPAN = 6; // real seconds for one full-charge window
  let st, P, Rp, Cr;
  function fresh() {
    P = M.PARTICLES[radioVal('dfM')]; Rp = P.R * Math.pow(2, +sR.value); Cr = CRATES[+sC.value];
    st = M.particleSim(P, Rp, Cr);
    if (reduce) st.advance(Infinity);
  }
  fresh();
  const sim = reg(cv, {
    step(dt) { if (!st.done) { st.advance(st.t + dt * st.tFull / SPAN); this.dirty = true; text(); } },
    draw() {
      const { c, w, h } = fit(cv);
      const f = frame(w, h, [26, 12, 32, 40], 0, 1, 0, 1.05);
      yTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2)); xTicks(c, f, [0, 0.25, 0.5, 0.75, 1], v => fmt(v, 2));
      axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      hline(c, f.L, f.R, f.Y(1), C.red);
      const sp = st.sp, pts = [[f.X(0), f.Y(st.c[0])]];
      for (let i = 0; i < sp.N; i++) pts.push([f.X((i + 0.5) * sp.dr), f.Y(st.c[i])]);
      pts.push([f.X(1), f.Y(Math.min(1, st.surf()))]);
      c.fillStyle = 'rgba(233,185,73,.14)'; c.beginPath(); c.moveTo(f.X(0), f.Y(0)); pts.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(f.X(1), f.Y(0)); c.fill();
      hline(c, f.L, f.R, f.Y(P.x0), C.dim, [2, 4]);
      path(c, pts, C.gold, 2.6);
      dot(c, f.X(1), f.Y(Math.min(1, st.surf())), st.full ? C.gold : C.red);
    }
  });
  function text() {
    put('#dfRo', t('ch4.unit.size', { v: fmt(Math.pow(2, +sR.value), 2) })); put('#dfCo', t('ch4.unit.c', { v: fmt(Cr, Cr < 1 ? 1 : 0) }));
    put('#dfTau', fmtDur(st.tau)); put('#dfT', fmtDur(st.t));
    const fill = clamp(st.filled() * 100, 0, 100); put('#dfFill', fmt(fill) + '%');
    put('#dfRad', Rp < 1e-6 ? t('ch4.unit.nm', { v: fmt(Rp * 1e9) }) : t('ch4.unit.um', { v: fmt(Rp * 1e6, 1) }));
    const v = { c: t('ch4.unit.c', { v: fmt(Cr, Cr < 1 ? 1 : 0) }), tau: fmtDur(st.tau), tf: fmtDur(st.tFull), t: fmtDur(st.t), fill: fmt(fill) };
    putHTML('#dfSay', t(M.say.ch4(st), v));
  }
  sim.text = text;
  const redo = () => { fresh(); sim.dirty = true; text(); };
  radios('dfM').forEach(r => r.addEventListener('change', redo)); [sR, sC].forEach(x => x.addEventListener('input', redo));
  on('#dfGo', 'click', redo);
  text();
})();

/* ───────── 05 CC-CV single particle model ───────── */
(() => {
  const cv = $('#ccCv'), sC = $('#ccC'), sT = $('#ccT'), sR = $('#ccR');
  let r, ck = clock(5), p;
  function fresh() { p = { c: +sC.value, T: +sT.value, rs: +sR.value }; r = M.ccCv(p.c, p.T, { rScale: p.rs }); ck.reset(); }
  fresh();
  const sim = reg(cv, {
    step(dt) { if (ck.step(dt)) { this.dirty = true; if (ck.done) text(); } },
    draw() {
      const { c, w, h } = fit(cv);
      const tMax = Math.max(60, Math.ceil(r.tEnd / 60 / 30) * 30);
      const split = Math.round(h * 0.58);
      const f1 = frame(w, split, [26, 40, 12, 40], 0, tMax, 0, 100);
      const f2 = frame(w, h, [split + 26, 40, 32, 40], 0, tMax, 2.4, 4.4);
      const iMax = Math.max(1, Math.ceil(p.c));
      yTicks(c, f1, [0, 50, 100], v => fmt(v));
      axes(c, f1, '', t('ch5.cv.soc'));
      c.fillStyle = C.cyan; c.textAlign = 'left';
      [0, iMax / 2, iMax].forEach(v => { c.fillText(fmt(v, iMax < 2 ? 1 : 0), f1.R + 6, f1.Y(v / iMax * 100)); });
      c.textAlign = 'right'; label(c, t('ch5.cv.i'), f1.R, f1.T - 10, C.cyan, 'right');
      yTicks(c, f2, [2.5, 3.0, 3.5, 4.0], v => fmt(v, 1));
      xTicks(c, f2, [0, tMax / 4, tMax / 2, 3 * tMax / 4, tMax], v => fmt(v));
      axes(c, f2, t('ch5.cv.t'), t('ch5.cv.v'));
      hline(c, f2.L, f2.R, f2.Y(4.2), C.mute, [2, 3]);
      const tNow = ck.p * r.tEnd, n = r.t.length;
      const soc = [], cur = [], vol = [];
      for (let i = 0; i < n && r.t[i] <= tNow + 1e-9; i++) {
        const x = f1.X(r.t[i] / 60);
        soc.push([x, f1.Y(r.soc[i] * 100)]); cur.push([x, f1.Y(r.I[i] / M.SPM.Q / iMax * 100)]);
        vol.push([x, f2.Y(clamp(r.V[i], 2.4, 4.4))]);
      }
      if (r.tSwitch != null && r.tSwitch <= tNow) { vline(c, f1.X(r.tSwitch / 60), f1.T, f1.B, C.red); vline(c, f2.X(r.tSwitch / 60), f2.T, f2.B, C.red); }
      path(c, cur, C.cyan, 2); path(c, soc, C.gold, 2.6); path(c, vol, C.violet, 2.2);
    }
  });
  function text() {
    put('#ccCo', t('ch5.unit.c', { v: fmt(p.c, 1) })); put('#ccTo', t('ch5.unit.t', { v: fmt(p.T) })); put('#ccRo', t('ch5.unit.r', { v: fmt(p.rs, 2) }));
    put('#ccSw', t('ch5.unit.pct', { v: fmt((r.socSwitch || 0) * 100) }));
    put('#cc80', r.t80 != null ? t('ch5.unit.min', { v: fmt(r.t80 / 60) }) : '—');
    put('#ccEnd', t('ch5.unit.min', { v: fmt(r.tEnd / 60) }));
    put('#ccPhi', t('ch5.unit.mv', { v: fmt(r.minPhi * 1000, 1) })); put('#ccHeat', t('ch5.unit.w', { v: fmt(r.peakHeat, 1) }));
    const v = { c: t('ch5.unit.c', { v: fmt(p.c, 1) }), T: fmt(p.T), sw: fmt((r.socSwitch || 0) * 100), t80: r.t80 != null ? fmt(r.t80 / 60) : '—', end: fmt(r.tEnd / 60), phi: fmt(r.minPhi * 1000, 1), soc: fmt(r.socEnd * 100),
      last: r.t80 != null ? fmt((r.tEnd - r.t80) / 60) : '—', lastPct: r.t80 != null ? fmt((r.tEnd - r.t80) / r.tEnd * 100) : '—' };
    putHTML('#ccSay', t(M.say.ch5(r, ck.done), v));
  }
  sim.text = text;
  const later = debounce(() => { fresh(); sim.dirty = true; text(); }, 120);
  [sC, sT, sR].forEach(x => x.addEventListener('input', () => { put('#ccCo', t('ch5.unit.c', { v: fmt(+sC.value, 1) })); put('#ccTo', t('ch5.unit.t', { v: fmt(+sT.value) })); put('#ccRo', t('ch5.unit.r', { v: fmt(+sR.value, 2) })); later(); }));
  on('#ccGo', 'click', () => { ck.reset(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 06 thermal runaway ───────── */
(() => {
  const cvS = $('#smCv'), cvT = $('#trCv'), sA = $('#trA'), sK = $('#trK'), sP = $('#trP');
  let r, crit, p, ck = clock(5);
  function fresh() { p = { amb: +sA.value, cool: +sK.value, P: +sP.value }; r = M.trRun(p.amb, { cool: p.cool, Pext: p.P }); crit = M.trCritical({ cool: p.cool, Pext: p.P }); ck.reset(); }
  fresh();
  const sim = reg([cvS, cvT], {
    step(dt) { if (ck.step(dt)) { this.dirty = true; if (ck.done) text(); } },
    draw() {
      { // Semenov diagram
        const { c, w, h } = fit(cvS);
        const lo = 1e-3, hi = 1e3, Lg = Math.log10;
        const f = frame(w, h, [26, 12, 32, 46], 80, 320, Lg(lo), Lg(hi));
        const Y = v => f.Y(Lg(clamp(v, lo, hi)));
        yTicks(c, f, logTicks(lo, hi).filter((v, i) => i % 2 === 0), fmtLog, Y); xTicks(c, f, [100, 150, 200, 250, 300], v => fmt(v));
        axes(c, f, t('ch6.cv.T'), t('ch6.cv.P'));
        // the state shown is the run's state at the clock: remaining stage-I reactant c and stage-II conversion α
        const S = r.series, tNow = ck.p * S[S.length - 1][0];
        let k = 0; while (k < S.length - 1 && S[k + 1][0] <= tNow) k++;
        const [, Tc, cc, al] = S[k];
        const gen = [], loss = [];
        for (let T = 80; T <= 320; T += 1) {
          const g = M.trGen(T + 273.15, cc, al), l = M.trLoss(T + 273.15, p.amb + 273.15, p.cool) - p.P;
          gen.push([f.X(T), Y(g.q1 + g.q2)]); if (l > lo) loss.push([f.X(T), Y(l)]);
        }
        c.save(); c.beginPath(); c.rect(f.L, f.T, f.R - f.L, f.B - f.T); c.clip();
        path(c, loss, C.cyan, 2.2); path(c, gen, C.red, 2.4);
        if (Tc >= 80 && Tc <= 320) { const g = M.trGen(Tc + 273.15, cc, al); c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(f.X(Tc), Y(g.q1 + g.q2), 6, 0, 6.283); c.stroke(); }
        c.restore();
        vline(c, f.X(p.amb), f.T, f.B, C.dim, [2, 4]);
      }
      { // temperature vs time
        const { c, w, h } = fit(cvT), S = r.series, tEnd = S[S.length - 1][0] / 60;
        const tMax = Math.max(10, Math.ceil(tEnd / 30) * 30), yMax = r.runaway ? 800 : Math.max(200, Math.ceil(r.Tpeak / 50) * 50 + 50);
        const f = frame(w, h, [24, 12, 32, 46], 0, tMax, 0, yMax);
        yTicks(c, f, yMax > 400 ? [0, 200, 400, 600, 800] : [0, 50, 100, 150, 200, 250].filter(v => v <= yMax), v => fmt(v));
        xTicks(c, f, [0, tMax / 3, 2 * tMax / 3, tMax], v => fmt(v)); axes(c, f, t('ch6.cv.t'), t('ch6.cv.T'));
        hline(c, f.L, f.R, f.Y(p.amb), C.dim, [2, 4]);
        const tNow = ck.p * S[S.length - 1][0], pts = [];
        for (const s of S) { if (s[0] > tNow + 1e-9) break; pts.push([f.X(s[0] / 60), f.Y(Math.min(s[1], yMax))]); }
        path(c, pts, r.runaway ? C.red : C.gold, 2.4);
      }
    }
  });
  function text() {
    put('#trAo', t('ch6.unit.c', { v: fmt(p.amb) })); put('#trKo', t('ch6.unit.x', { v: fmt(p.cool, 2) })); put('#trPo', t('ch6.unit.w', { v: fmt(p.P, 1) }));
    put('#trCrit', crit == null ? '>200 °C' : crit <= 80 ? '≤ 80 °C' : t('ch6.unit.c', { v: fmt(crit, 1) }));
    put('#trPeak', t('ch6.unit.c', { v: fmt(r.Tpeak) }));
    put('#trTime', r.runaway ? t('ch6.unit.min', { v: fmt(r.tRun / 60, 1) }) : t('ch6.read.none'));
    const gap = crit != null ? crit - p.amb : Infinity;
    const v = { amb: fmt(p.amb), crit: crit == null ? '>200' : crit <= 80 ? '≤ 80' : fmt(crit, 1), gap: fmt(gap, 1), Tpk: fmt(r.Tpeak), tRun: r.tRun != null ? fmt(r.tRun / 60, 1) : '—' };
    putHTML('#trSay', t(M.say.ch6(r, crit, p.amb, ck.done), v));
  }
  sim.text = text;
  const later = debounce(() => { fresh(); sim.dirty = true; text(); }, 120);
  [sA, sK, sP].forEach(x => x.addEventListener('input', () => { put('#trAo', t('ch6.unit.c', { v: fmt(+sA.value) })); put('#trKo', t('ch6.unit.x', { v: fmt(+sK.value, 2) })); put('#trPo', t('ch6.unit.w', { v: fmt(+sP.value, 1) })); later(); }));
  on('#trGo', 'click', () => { ck.reset(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 ageing ───────── */
(() => {
  const cv = $('#agCv'), sT = $('#agT'), sS = $('#agS'), sD = $('#agD'), sN = $('#agN'), YEARS = 15;
  const par = () => ({ Tc: +sT.value, meanSoc: +sS.value / 100, dod: Math.min(+sD.value / 100, 2 * Math.min(+sS.value / 100, 1 - +sS.value / 100)), cyclesPerDay: +sN.value });
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), P = par();
    const f = frame(w, h, [26, 12, 32, 40], 0, YEARS, 0, 100);
    yTicks(c, f, [0, 20, 40, 60, 80, 100], v => fmt(v)); xTicks(c, f, [0, 5, 10, 15], v => fmt(v));
    axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
    hline(c, f.L, f.R, f.Y(80), C.red);
    const tot = [], ext = [], cal = [], cyc = [];
    for (let i = 0; i <= 150; i++) {
      const y = i / 10, a = M.ageCapacity(y * 365, P), pt = [f.X(y), f.Y(a.q * 100)];
      (a.raw >= M.AGE.fitFloor ? tot : ext).push(pt);
      cal.push([f.X(y), f.Y(Math.max(0, 1 - a.cal) * 100)]); cyc.push([f.X(y), f.Y(Math.max(0, 1 - a.cyc) * 100)]);
    }
    if (tot.length && ext.length) ext.unshift(tot[tot.length - 1]);
    path(c, cal, C.cyan, 1.5, [5, 4]); path(c, cyc, C.violet, 1.5, [5, 4]);
    path(c, tot, C.gold, 2.6); path(c, ext, C.gold, 2.2, [3, 5]);
  } });
  function text() {
    const P = par(), a = M.ageCapacity(3650, P), d80 = M.ageDaysTo(0.8, P);
    put('#agTo', t('ch7.unit.c', { v: fmt(P.Tc) })); put('#agSo', t('ch7.unit.pct', { v: fmt(P.meanSoc * 100) }));
    put('#agDo', t('ch7.unit.pct', { v: fmt(P.dod * 100) })); put('#agNo', t('ch7.unit.n', { v: fmt(P.cyclesPerDay, P.cyclesPerDay % 1 ? 2 : 0) }));
    put('#agQ10', t('ch7.unit.pct', { v: fmt(a.q * 100) })); put('#ag80', d80 == null ? t('ch7.read.never') : t('ch7.unit.y', { v: fmt(d80 / 365, 1) }));
    const lossPct = x => fmt(Math.min(x, 1) * 100, 1); // the fit can exceed 100 % far outside its range; a loss cannot
    put('#agCal', t('ch7.unit.pct', { v: lossPct(a.cal) })); put('#agCyc', t('ch7.unit.pct', { v: lossPct(a.cyc) }));
    const v = { T: fmt(P.Tc), s: fmt(P.meanSoc * 100), n: fmt(P.cyclesPerDay, P.cyclesPerDay % 1 ? 2 : 0), d: fmt(P.dod * 100), q: fmt(a.q * 100), cal: lossPct(a.cal), cyc: lossPct(a.cyc), y80: d80 == null ? '—' : t('ch7.unit.y', { v: fmt(d80 / 365, 1) }) };
    putHTML('#agSay', M.say.ch7(P).map(k => t(k, v)).join(effLang() === 'zh' ? '' : ' '));
  }
  sim.text = text;
  [sT, sS, sD, sN].forEach(x => x.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 08 Wright's law ───────── */
(() => {
  const cv = $('#lcCv'), sF = $('#lcF'), sX = $('#lcX'), Lg = Math.log10;
  const years = Object.keys(M.CUM).map(Number);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), from = +sF.value, ex = +sX.value, W = M.wright(from, 2023);
    const f = frame(w, h, [26, 12, 32, 52], Lg(1e-4), Lg(4e4), Lg(30), Lg(2e4));
    const X = v => f.X(Lg(v)), Y = v => f.Y(Lg(v));
    yTicks(c, f, [100, 1000, 10000], v => fmt(v), Y); xTicks(c, f, [1e-3, 1e-1, 10, 1e3], fmtLog, X);
    axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
    for (const y of years) dot(c, X(M.CUM[y]), Y(M.PRICE[y]), y >= from ? C.cyan : C.dim, 3.5);
    const q0 = M.CUM[from], q1 = M.CUM[2023];
    path(c, [[X(q0), Y(W.price(q0))], [X(q1), Y(W.price(q1))]], C.gold, 2.4);
    if (ex > 0) { const q2 = q1 * Math.pow(2, ex); path(c, [[X(q1), Y(W.price(q1))], [X(q2), Y(W.price(q2))]], C.gold, 2, [6, 5]); dot(c, X(q2), Y(W.price(q2)), C.gold); }
  } });
  function text() {
    const from = +sF.value, ex = +sX.value, W = M.wright(from, 2023), q2 = M.CUM[2023] * Math.pow(2, ex);
    put('#lcFo', t('ch8.unit.year', { v: String(from) })); put('#lcXo', t('ch8.unit.ext', { v: fmt(Math.pow(2, ex), ex % 1 ? 1 : 0) }));
    put('#lcLR', t('ch8.unit.pct', { v: fmt(W.lr * 100, 1) })); put('#lcR2', fmt(W.r2, 2));
    put('#lcFit', t('ch8.unit.usd', { v: fmt(W.price(M.CUM[2023])) })); put('#lcExt', ex > 0 ? t('ch8.unit.usd', { v: fmt(W.price(q2)) }) : t('ch8.read.noext'));
    const v = { from: String(from), lr: fmt(W.lr * 100, 1), r2: fmt(W.r2, 2) };
    const keys = M.say.ch8(from, ex);
    let s = t(keys[0], v);
    if (keys[1]) s = t(keys[1], { base: s, x: fmt(Math.pow(2, ex), ex % 1 ? 1 : 0), q: fmt(q2), p: fmt(W.price(q2)) });
    putHTML('#lcSay', s);
  }
  sim.text = text;
  [sF, sX].forEach(x => x.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 09 frontier ───────── */
function asOfText(a) {
  if (a === 'spec') return t('ch9.spec');
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(a); if (!m) return a;
  return m[2] ? t('ch9.month', { y: m[1], m: String(+m[2]), mn: new Date(Date.UTC(+m[1], +m[2] - 1, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }) }) : t('ch9.yearonly', { y: m[1] });
}
function ftVars(e) {
  const v = Object.assign({}, e);
  if (e.liProd) { v.liProdT = fmt(e.liProd); v.liProdWan = fmt(e.liProd / 1e4); } if (e.liReserves) { v.liReservesMt = fmt(e.liReserves / 1e6); v.liReservesWan = fmt(e.liReserves / 1e4); }
  if (e.minutes) { const m = Math.floor(e.minutes), s = Math.round((e.minutes - m) * 60); v.minStr = t('ft.minsec', { m: String(m), s: String(s) }); }
  for (const k of ['whkg', 'whl']) if (e[k] != null) v[k] = fmt(e[k], e[k] % 1 ? 1 : 0);
  for (const k of ['lfpTR', 'nmcTR', 'lfpOnset', 'nmcOnset']) if (e[k] != null) v[k] = fmt(e[k], 1);
  for (const k of ['carsLo', 'carsHi']) if (e[k] != null) v[k] = fmt(e[k]);
  if (e.coldC != null) v.coldC = fmt(e.coldC).replace('-', '\u2212');
  return v;
}
const asOfLabel = a => a === 'spec' ? t('ch9.spec') : t('ch9.asof', { d: asOfText(a) });
const ftText = e => t('ft.' + e.id, ftVars(e));
(() => {
  const cv = $('#ftCv'), sel = $('#ftPick');
  const MODEL = [['nmc', 'graphite'], ['lfp', 'graphite'], ['nmc', 'silicon'], ['nmc', 'li']].map(([c, a]) => ({ id: 'model:' + c + ':' + a, c, a, whkg: M.finalWhkg(c, a, 5) }));
  const ROWS = ['est', 'demo', 'claim', 'model'], COL = { est: C.green, demo: C.cyan, claim: C.red, model: C.gold };
  function lists() {
    for (const [st, id] of [['est', '#ftEst'], ['demo', '#ftDemo'], ['claim', '#ftClaim']]) {
      $(id).innerHTML = M.FRONTIER.filter(e => e.status === st).map(e => `<li><span class="tag ${st}">${t('ch9.row.' + st)}</span>${ftText(e)}<span class="when">${asOfLabel(e.asOf)}</span></li>`).join('');
    }
    const cur = sel.value || 'prologium';
    sel.innerHTML = M.FRONTIER.map(e => `<option value="${e.id}">${t('ft.name.' + e.id)}</option>`).join('');
    sel.value = cur;
  }
  lists(); langHooks.push(lists);
  const sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv);
    c.font = FONT; const lw = Math.max(...ROWS.map(r => c.measureText(t('ch9.row.' + r)).width)) + 14;
    const f = frame(w, h, [16, 16, 32, lw], 100, 750, 0, ROWS.length);
    xTicks(c, f, f.R - f.L < 260 ? [100, 300, 500, 700] : [100, 200, 300, 400, 500, 600, 700], v => fmt(v)); axes(c, f, t('ch9.cv.x'), '');
    const pick = sel.value;
    ROWS.forEach((r, i) => {
      const y = f.T + (i + 0.5) * (f.B - f.T) / ROWS.length;
      hline(c, f.L, f.R, y, C.grid, []);
      label(c, t('ch9.row.' + r), f.L - 8, y, COL[r], 'right');
      const pts = r === 'model' ? MODEL : M.FRONTIER.filter(e => e.status === r && e.whkg);
      for (const e of pts) {
        const on = e.id === pick, x = f.X(e.whkg);
        dot(c, x, y, COL[r], on ? 7 : 5);
        if (on) { c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 10, 0, 6.283); c.stroke(); }
      }
      const e = pts.find(e => e.id === pick);
      if (e) { const x = f.X(e.whkg), s = fmt(e.whkg, e.whkg % 1 ? 1 : 0); c.font = FONTB; const tw = c.measureText(s).width; label(c, s, clamp(x, f.L + tw / 2 + 2, f.R - tw / 2 - 2), y - 20, C.ink, 'center', FONTB); }
    });
  } });
  function text() {
    const e = M.FRONTIER.find(x => x.id === sel.value);
    putHTML('#ftSay', t('ch9.say.pick', { name: t('ft.name.' + e.id), text: ftText(e), asof: asOfLabel(e.asOf) }));
  }
  sim.text = text;
  sel.addEventListener('change', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 09b lithium floor ───────── */
(() => {
  const sV = $('#liV'), U = M.FRONTIER.find(e => e.id === 'usgs2026'), IEA = M.FRONTIER.find(e => e.id === 'iea2026');
  function text() {
    const V = +sV.value, kg = M.liPerKwh(V), twh = M.liBoundTWh(U.liProd, U.batteryShare / 100, V), res = M.liBoundTWh(U.liReserves, 1, V);
    put('#liVo', t('ch9.unit.v', { v: fmt(V, 2) })); put('#liKg', t('ch9.unit.kg', { v: fmt(kg, 3) }));
    put('#liTwh', t('ch9.unit.twh', { v: fmt(twh, 1) })); put('#liRes', t('ch9.unit.twh', { v: fmt(res) }));
    putHTML('#liSay', t('ch9.say.li', { V: fmt(V, 2), kg: fmt(kg, 3), twh: fmt(twh, 1), ev: fmt(IEA.evTWh, 1), ratio: fmt(twh / IEA.evTWh, 1) }));
  }
  langHooks.push(text);
  sV.addEventListener('input', text);
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
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
