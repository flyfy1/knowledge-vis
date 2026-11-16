/* What a drive is made of: wiring, drawing, i18n and on-screen gating. All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.DriveModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const fmt = M.fmt;

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
function sayText(o) {
  const v = {};
  for (const [k, x] of Object.entries(o.v)) v[k] = x && x.k ? t(x.k) : x;
  return t(o.key, v);
}
const effLang = () => (COPY[lang] ? lang : 'zh');
const sims = [];
const texts = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  renderDiagrams(true);
  sims.forEach(s => { s.dirty = true; });
  texts.forEach(f => f());
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
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { s.vis = s.cvs.some(cv => cv.__vis = (cv === e.target ? e.isIntersecting : cv.__vis)); s.dirty = true; } }), { rootMargin: '60px' });
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
// numbered list under a narrow drawing: items = [[n, key, cls]], one row every `dy`
const numList = (g, items, x, y, dy, w) => items.forEach(([n, k, c, vars], i) => { g.num(x + 10, y + i * dy, n); g.text(x + 28, y + i * dy, k, { c, w: w - 28, vars }); });

// 512e: a 4 KiB write at two partition starts, cells in proportion to bytes (ch1)
DG.lba = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, P = M.sector.PER, cw = wide ? 40 : 19, x0 = wide ? 40 : 18, H = wide ? 320 : 356;
  const n = Math.round(4 * 1024 / M.sector.LOG);  // a 4 KiB write in 512-byte logical sectors
  return { W, H, draw(g) {
    const X = i => x0 + i * cw;
    const panel = (y, start, k) => {
      const base = Math.floor(start / P) * P, w = M.sector.write(start, 4);
      g.text(x0, y, 'dg.lba.' + k, { c: 'm', weight: 600, vars: { a: String(start) } });
      for (let p = 0; p < 2; p++) g.text(X(p * P) + 2, y + 22, { raw: String(base + p * P) }, { mono: 1, c: base + p * P === start ? 'g' : 'c', fs: 13 });
      if (start % P) g.text(X(start - base) + cw / 2, y + 22, { raw: String(start) }, { a: 'middle', mono: 1, c: 'g', fs: 13 });
      for (let i = 0; i < 2 * P; i++) { const lba = base + i, inW = lba >= start && lba < start + n; g.box(X(i) + 1, y + 32, cw - 2, 30, inW ? C.gold : C.dimfill, { rx: 3, a: inW ? 0.4 : 0.35, sw: 1 }); }
      for (let p = 0; p < 2; p++) {
        const pi = Math.floor(base / P) + p, hit = pi >= w.p0 && pi <= w.p1, lo = (base + p * P), full = hit && lo >= start && lo + P - 1 <= start + n - 1;
        const col = !hit ? C.mute : full ? C.green : C.red, key = !hit ? 'idle' : full ? 'full' : 'rmw';
        g.box(X(p * P) + 1, y + 68, P * cw - 2, 28, col, { rx: 4, a: 0.12 });
        g.text(X(p * P) + P * cw / 2, y + 82, 'dg.lba.' + key, { a: 'middle', c: !hit ? 'm' : full ? 'n' : 'r' });
      }
      const s0 = start - base;
      if (s0) g.text(X(s0 + n), y + 114, 'dg.lba.wr', { a: 'end', c: 'g', vars: { a: String(start), b: String(start + n - 1) } });
      else g.text(X(0), y + 114, 'dg.lba.wr', { c: 'g', vars: { a: String(start), b: String(start + n - 1) } });
    };
    panel(20, 63, 't'); panel(162, 2048, 't');
    g.text(x0, wide ? 298 : 316, 'dg.lba.note', { c: 'm', w: W - 2 * x0, vars: { phys: String(M.sector.PHYS), per: String(P), log: String(M.sector.LOG) } });
  } };
};
// a platter from above: tracks, head, arm, actuator; seek and rotation (ch2); schematic
DG.hdd = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 576;
  const K = ['platter', 'spindle', 'head', 'arm', 'vcm', 'target', 'rot', 'seek'];
  return { W, H, draw(g) {
    const cx = wide ? 330 : 170, cy = wide ? 150 : 145, R = wide ? 125 : 116, s = R / 125;
    const P = (r, d) => pt(cx, cy, r * s, d);
    g.circle(cx, cy, R, C.violet, { a: 0.1 });
    for (const r of [60, 75, 105, 120]) g.circle(cx, cy, r * s, C.violet, { none: true, sw: 0.8 });
    g.circle(cx, cy, 90 * s, C.gold, { none: true, sw: 1.6 });
    g.path(arc(cx, cy, 90 * s, 200, 232), C.gold, { sw: 7 });
    g.circle(cx, cy, 26 * s, C.mute, { a: 0.5 });
    const [hx, hy] = P(90, 30), pv = wide ? [505, 235] : [298, 248];
    g.path(arc(cx, cy, 136 * s, 158, 112), C.ink, { arrow: 1, sw: 1.6 });
    const [a0x, a0y] = P(64, 40), [a1x, a1y] = P(116, 40);
    g.line(a0x, a0y, a1x, a1y, C.ink, { arrow: 1, both: 1, sw: 1.6 });
    g.box(pv[0] - 22, pv[1] - 22, 44, 44, C.cyan, { rx: 6 });
    g.line(pv[0], pv[1], hx, hy, C.cyan, { sw: 5 });
    g.box(hx - 6, hy - 6, 12, 12, C.cyan, { solid: true, rx: 2 });
    if (wide) {
      const lab = (k, x, y, a, c, lead) => { if (lead) g.line(lead[0], lead[1], lead[2], lead[3], C.mute, { sw: 1 }); g.text(x, y, 'dg.hdd.' + k, { a, c, w: a === 'end' ? 165 : 168, va: 'mid' }); };
      const [ex, ey] = P(125, 150), [tx, ty] = P(90, 216), [sx, sy] = P(26, 200);
      lab('rot', 190, 46, 'end', '', null);
      lab('platter', 190, 112, 'end', 'v', [ex - 2, ey, 196, 112]);
      lab('spindle', 190, 178, 'end', 'm', [sx, sy, 196, 178]);
      lab('target', 190, 246, 'end', 'g', [tx, ty, 196, 246]);
      lab('seek', 548, 52, 'start', '', [a1x + 3, a1y - 3, 542, 52]);
      lab('head', 548, 106, 'start', 'c', [hx + 8, hy, 542, 106]);
      const mx = (pv[0] + hx) / 2, my = (pv[1] + hy) / 2;
      lab('arm', 548, 162, 'start', 'c', [mx + 6, my, 542, 162]);
      lab('vcm', 548, 236, 'start', 'c', [pv[0] + 24, pv[1], 542, 236]);
    } else {
      const [ex, ey] = P(140, 168), [tx, ty] = P(104, 216), [rx, ry] = P(150, 135), [kx, ky] = P(132, 40);
      g.num(ex, ey, 1); g.num(cx, cy, 2); g.num(hx + 22, hy - 4, 3);
      g.num((pv[0] + hx) / 2 + 18, (pv[1] + hy) / 2, 4); g.num(pv[0], pv[1], 5); g.num(tx, ty, 6); g.num(rx, ry, 7); g.num(kx, ky, 8);
      numList(g, K.map((k, i) => [i + 1, 'dg.hdd.' + k, ['v', 'm', 'c', 'c', 'c', 'g', '', ''][i]]), 6, 296, 36, 328);
    }
  } };
};
// the stack seen from the side: platters on one spindle, a head on every surface, one comb (ch2); schematic
DG.stack = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 312 : 360;
  return { W, H, draw(g) {
    const px0 = wide ? 60 : 16, px1 = wide ? 330 : 180, sp = (px0 + px1) / 2, ys = [70, 130, 190], hx = wide ? 300 : 158, ax = wide ? 640 : 296;
    g.box(sp - 6, 40, 12, 180, C.mute, { rx: 2, a: 0.4 });
    ys.forEach(y => g.box(px0, y - 4, px1 - px0, 8, C.violet, { rx: 2, a: 0.55 }));
    g.box(ax, 44, 34, 172, C.cyan, { rx: 6 });
    const arms = [52, 100, 160, 208];
    arms.forEach((y, i) => {
      g.line(hx + 12, y, ax, y, C.cyan, { sw: 3 });
      if (i > 0) g.box(hx, ys[i - 1] + 5, 14, 6, C.cyan, { solid: true, rx: 1 });   // head under the platter above
      if (i < 3) g.box(hx, ys[i] - 11, 14, 6, C.cyan, { solid: true, rx: 1 });      // head on the platter below
      g.line(hx + 7, i > 0 ? ys[i - 1] + 11 : y, hx + 7, i < 3 ? ys[i] - 11 : y, C.cyan, { sw: 2 });
    });
    g.text(sp, 24, 'dg.stack.spindle', { a: 'middle', c: 'm' });
    if (wide) {
      g.text(ax + 34, 24, 'dg.stack.vcm', { a: 'end', c: 'c' });
      g.text(px0, 244, 'dg.stack.count', { c: 'v', vars: { p: 3, h: 6 } });
      g.text(px0, 270, 'dg.stack.comb', { c: 'c' });
      g.text(px0, 296, 'dg.stack.fly', {});
    } else {
      g.text(ax + 34, 24, 'dg.stack.vcm', { a: 'end', c: 'c' });
      g.text(10, 248, 'dg.stack.count', { c: 'v', w: 320, vars: { p: 3, h: 6 } });
      g.text(10, 290, 'dg.stack.comb', { c: 'c', w: 320 });
      g.text(10, 332, 'dg.stack.fly', { w: 320 });
    }
  } };
};
// conventional vs shingled tracks (ch3); schematic, pitch drawn at half a write width
DG.smr = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 560;
  return { W, H, draw(g) {
    const trk = (x, y, w, h, i, faded) => { g.box(x, y, w, h, C.bg, { solid: true, nostroke: true, rx: 2 }); g.box(x, y, w, h, C.violet, { rx: 2, a: faded ? 0.08 : (i % 2 ? 0.2 : 0.45), sw: 1 }); };
    const cmr = (ox, oy, tw, aw) => {
      g.text(ox, oy, 'dg.smr.cmr', { c: 'm', weight: 600, w: wide ? 330 : 320 });
      const x = ox + 6, tx = x + tw + 34;
      for (let i = 0; i < 5; i++) trk(x, oy + 26 + i * 38, tw, 28, i);
      const y2 = oy + 26 + 2 * 38, yg = oy + 26 + 3 * 38 + 33;
      g.box(x + tw + 8, y2, 14, 28, C.cyan, { solid: true, rx: 2 });
      g.text(tx, y2 + 14, 'dg.smr.whead', { c: 'c', w: aw, va: 'mid' });
      g.line(x + tw - 30, yg, tx - 6, yg, C.mute, { sw: 1 });
      g.text(tx, yg, 'dg.smr.gap1', { c: 'm', w: aw, va: 'mid' });
      g.text(ox, oy + 26 + 5 * 38 + 14, 'dg.smr.cmrfix', { c: 'n', w: wide ? 330 : 320 });
    };
    const smr = (ox, oy, tw, aw) => {
      g.text(ox, oy, 'dg.smr.smr', { c: 'm', weight: 600, w: wide ? 330 : 320 });
      const x = ox + 16, y0 = oy + 26, p = 15, th = 30;
      for (let i = 0; i < 6; i++) trk(x, y0 + i * p, tw, th, i);
      const y1 = y0 + 5 * p + th, y2 = y1 + 16;
      for (let i = 0; i < 3; i++) trk(x, y2 + i * p, tw, th, i, true);
      const bx = x + tw + 8, tx = bx + 14;
      g.box(x, y0 + p, tw, p, C.cyan, { a: 0, sw: 2, rx: 1 });
      g.line(x + tw + 1, y0 + p * 1.5, tx - 4, y0 + p * 1.5, C.cyan, { sw: 1 });
      g.text(tx, y0 + p * 1.5, 'dg.smr.rstrip', { c: 'c', w: aw, va: 'top' });
      g.line(bx, y0, bx, y1, C.violet, { sw: 1.2 }); g.line(bx - 4, y0, bx, y0, C.violet, { sw: 1.2 }); g.line(bx - 4, y1, bx, y1, C.violet, { sw: 1.2 });
      g.text(tx, y0 + 4.6 * p, 'dg.smr.band', { c: 'v', w: aw });
      g.text(tx, (y1 + y2) / 2 + 22, 'dg.smr.gap', { c: 'm', w: aw });
      g.line(x - 8, y0 + p * 1.5, x - 8, y0 + 5 * p + 15, C.red, { sw: 2, arrow: 1 });
      g.text(ox, y2 + 2 * p + th + 24, 'dg.smr.rewrite', { c: 'r', w: wide ? 330 : 320 });
    };
    if (wide) { cmr(10, 20, 170, 140); smr(370, 20, 140, 160); }
    else { cmr(4, 18, 150, 136); smr(4, 300, 130, 166); }
  } };
};
// one flash cell in cross-section (ch4); schematic
DG.cell = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 496;
  return { W, H, draw(g) {
    const gx = wide ? 170 : 70, gw = wide ? 190 : 170, sx0 = wide ? 70 : 10, sw = wide ? 390 : 290, y = wide ? 40 : 34;
    const gh = wide ? 38 : 48, bo = 12, st = 24, tu = 10, yb = y + gh, ys = yb + bo, yt = ys + st, yc = yt + tu;
    g.box(gx, y, gw, gh, C.cyan, { rx: 4 }); g.text(gx + gw / 2, y + gh / 2, 'dg.cell.gate', { a: 'middle', c: 'c', w: gw - 12, va: 'mid' });
    g.box(gx, yb, gw, bo, C.mute, { rx: 0, a: 0.3, sw: 1 });
    g.box(gx, ys, gw, st, C.violet, { rx: 0, a: 0.25, sw: 1 });
    for (let i = 0; i < 8; i++) g.circle(gx + 18 + i * (gw - 36) / 7, ys + st / 2, 3.4, C.gold, { solid: true, sw: 0.5 });
    g.box(gx, yt, gw, tu, C.mute, { rx: 0, a: 0.3, sw: 1 });
    g.box(sx0, yc, sw, wide ? 150 : 140, C.mute, { rx: 4, a: 0.07, sw: 1 });
    const dw = wide ? 92 : 62, dh = 40;
    g.box(sx0 + 8, yc, dw, dh, C.green, { rx: 4, a: 0.15 }); g.text(sx0 + 8 + dw / 2, yc + dh / 2, 'dg.cell.src', { a: 'middle', c: 'n' });
    g.box(sx0 + sw - 8 - dw, yc, dw, dh, C.green, { rx: 4, a: 0.15 }); g.text(sx0 + sw - 8 - dw / 2, yc + dh / 2, 'dg.cell.drn', { a: 'middle', c: 'n' });
    g.line(gx + 4, yc + 6, gx + gw - 4, yc + 6, C.green, { sw: 1.4, dash: '4 3' });
    g.text(gx + gw / 2, yc + 26, 'dg.cell.ch', { a: 'middle', c: 'n', w: gw - 10 });
    g.text(sx0 + sw / 2, yc + (wide ? 120 : 112), 'dg.cell.sub', { a: 'middle', c: 'm' });
    const ux = gx + 34;
    g.line(ux, yc + 2, ux, ys + st - 2, C.gold, { sw: 2, arrow: 1 });
    if (wide) {
      const lx = 492;
      g.line(gx + gw, yb + bo / 2, lx - 6, 50, C.mute, { sw: 1 }); g.text(lx, 50, 'dg.cell.block', { c: 'm', w: 225, va: 'mid' });
      g.line(gx + gw, ys + st / 2, lx - 6, 98, C.mute, { sw: 1 }); g.text(lx, 98, 'dg.cell.store', { c: 'v', w: 225, va: 'mid' });
      g.line(gx + gw, yt + tu / 2, lx - 6, 152, C.mute, { sw: 1 }); g.text(lx, 152, 'dg.cell.tunnel', { c: 'm', w: 225, va: 'mid' });
      g.text(150, 64, 'dg.cell.write', { a: 'end', c: 'g', w: 140, va: 'mid' });
      g.text(lx, 222, 'dg.cell.vth', { c: 'g', w: 225, va: 'mid' });
    } else {
      const r = gx + gw, nx = [r + 18, r + 46, r + 74];
      [[yb + bo / 2, 1], [ys + st / 2, 2], [yt + tu / 2, 3]].forEach(([yy, k], i) => { g.line(r, yy, nx[i] - 10, yy, C.mute, { sw: 1 }); g.num(nx[i], yy, k); });
      g.num(ux + 20, (yc + ys + st) / 2 + 2, 4);
      numList(g, [[1, 'dg.cell.block', 'm'], [2, 'dg.cell.store', 'v'], [3, 'dg.cell.tunnel', 'm'], [4, 'dg.cell.write', 'g']], 6, 296, 40, 328);
      g.text(6, 460, 'dg.cell.vth', { c: 'g', w: 328 });
    }
  } };
};
// one ECC codeword, bar lengths in proportion to bits (ch5); the error positions are illustrative
DG.cw = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 250 : 300;
  const E = M.ecc, K = E.K, T = E.T, len = E.len(T), par = E.M * T;
  return { W, H, draw(g) {
    const x0 = wide ? 20 : 10, bw = W - 2 * x0, dw = bw * K / len;
    g.text(x0, 22, 'dg.cw.len', { c: 'm', vars: { l: fmt(len), r: fmt(E.rate(T) * 100, 1) } });
    g.box(x0, 40, dw, 44, C.gold, { rx: 4, a: 0.25 }); g.text(x0 + dw / 2, 62, 'dg.cw.data', { a: 'middle', c: 'g', vars: { k: fmt(K) } });
    g.box(x0 + dw, 40, bw - dw, 44, C.violet, { rx: 4, a: 0.4 });
    g.line(x0 + dw + (bw - dw) / 2, 86, x0 + dw + (bw - dw) / 2, 98, C.violet, { sw: 1 });
    g.text(x0 + bw, 110, 'dg.cw.par', { a: 'end', c: 'v', vars: { m: E.M, t: T, p: fmt(par) } });
    const strip = (y, key, nErr, seed) => {
      g.text(x0, y, key, { c: nErr > T ? 'r' : 'n', vars: { t: T }, w: bw });
      const yy = y + (wide ? 18 : 34);
      g.box(x0, yy, bw, 18, C.dimfill, { rx: 3, a: 0.4, sw: 1 });
      let s = seed; for (let i = 0; i < nErr; i++) { s = (s * 1103515245 + 12345) % 2147483648; const x = x0 + 3 + (s / 2147483648) * (bw - 6); g.line(x, yy + 2, x, yy + 16, C.red, { sw: 1.6 }); }
    };
    strip(wide ? 146 : 150, 'dg.cw.ok', 6, 7);
    strip(wide ? 204 : 226, 'dg.cw.bad', 52, 3);
  } };
};
// out-of-place update: an overwrite before and after (ch6); 4 pages per block as in the model
DG.ftl = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 300 : 592, P = 4;
  return { W, H, draw(g) {
    const panel = (px, py, after) => {
      g.text(px, py, after ? 'dg.ftl.after' : 'dg.ftl.before', { c: 'm', weight: 600 });
      g.box(px, py + 18, 320, 32, C.cyan, { rx: 6 });
      g.text(px + 160, py + 34, 'dg.ftl.map', { a: 'middle', c: 'c', vars: { a: after ? '1.1' : '0.1' } });
      const bx = [px + 26, px + 180], bw = 136, top = py + 76;
      g.text(bx[0], top, 'dg.ftl.b0', { c: 'm' }); g.text(bx[1], top, 'dg.ftl.b1', { c: 'g' });
      const pages = [[4, 5, 6, 7], [8, after ? 5 : null, null, null]];
      for (let b = 0; b < 2; b++) for (let p = 0; p < P; p++) {
        const v = pages[b][p], y = top + 14 + p * 34, dead = after && b === 0 && p === 1, hot = (after && b === 1 && p === 1) || (!after && b === 0 && p === 1);
        if (v == null) { g.box(bx[b], y, bw, 28, C.mute, { rx: 4, a: 0, dash: '4 3', sw: 1 }); g.text(bx[b] + bw / 2, y + 14, 'dg.ftl.free', { a: 'middle', c: 'm' }); continue; }
        g.box(bx[b], y, bw, 28, dead ? C.red : C.gold, { rx: 4, a: 0.18, sw: hot ? 2.4 : 1 });
        if (hot) g.box(bx[b] - 2, y - 2, bw + 4, 32, C.cyan, { rx: 5, a: 0, sw: 2 });
        g.text(bx[b] + bw / 2, y + 14, dead ? 'dg.ftl.dead' : 'dg.ftl.lba', { a: 'middle', c: dead ? 'r' : 'g', vars: { n: v } });
      }
      const ty = top + 14 + 34 + 14;
      if (!after) g.path(`M${px + 10},${py + 50} V${ty} H${bx[0] - 4}`, C.cyan, { arrow: 1 });
      else g.path(`M${px + 170},${py + 50} V${ty} H${bx[1] - 4}`, C.cyan, { arrow: 1 });
      g.text(px, top + 14 + 4 * 34 + 18, after ? 'dg.ftl.nafter' : 'dg.ftl.nbefore', { c: after ? 'r' : 'm', w: 320 });
    };
    if (wide) { panel(20, 20, false); panel(380, 20, true); }
    else { panel(10, 20, false); panel(10, 318, true); }
  } };
};
// five layers of "interface" for three drives (ch7); values from the model's drive table
DG.layers = (L) => {
  const wide = L === 'w', W = wide ? 720 : 340, H = wide ? 344 : 560, D = ['ssd25', 'm2nvme', 'sas25'];
  return { W, H, draw(g) {
    const Ls = M.map.LAYERS;
    if (wide) {
      const cx = [170, 354, 538], cw = 172, y0 = 64, rh = 50;
      D.forEach((d, j) => g.text(cx[j] + cw / 2, 30, 'dg.layers.' + d, { a: 'middle', c: 'm', weight: 600, w: cw - 8, va: 'mid' }));
      Ls.forEach((k, i) => {
        const y = y0 + i * rh;
        g.text(20, y + 20, 'ch7.layer.' + k, { c: 'm', w: 140, va: 'mid' });
        D.forEach((d, j) => { const m2 = j === 1 && i < 2; g.box(cx[j], y, cw, 40, m2 ? C.gold : C.cyan, { rx: 6, a: 0.08, sw: m2 ? 2 : 1 }); g.text(cx[j] + cw / 2, y + 20, 'ch7.v.' + M.map.DRIVES[d][k], { a: 'middle', w: cw - 12, va: 'mid' }); });
      });
      g.text(20, y0 + 5 * rh + 18, 'dg.layers.note', { c: 'g', w: 680 });
    } else {
      const cx = [8, 118, 228], cw = 104, y0 = 96, rh = 80;
      D.forEach((d, j) => g.text(cx[j] + cw / 2, 18, 'dg.layers.' + d, { a: 'middle', c: 'm', weight: 600, w: cw - 4 }));
      Ls.forEach((k, i) => {
        const y = y0 + i * rh;
        g.text(8, y, 'ch7.layer.' + k, { c: 'm' });
        D.forEach((d, j) => { const m2 = j === 1 && i < 2; g.box(cx[j], y + 14, cw, 56, m2 ? C.gold : C.cyan, { rx: 6, a: 0.08, sw: m2 ? 2 : 1 }); g.text(cx[j] + cw / 2, y + 42, 'ch7.v.' + M.map.DRIVES[d][k], { a: 'middle', w: cw - 8, va: 'mid' }); });
      });
      g.text(8, y0 + 5 * rh + 6, 'dg.layers.note', { c: 'g', w: 324 });
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
const bind = (sim, text, inputs, radioNames) => {
  const go = () => { sim.dirty = true; text(); };
  inputs.forEach(e => e.addEventListener('input', go));
  (radioNames || []).forEach(n => radios(n).forEach(r => r.addEventListener('change', go)));
  texts.push(text); text();
};

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
// tick labels left to right, skipping any that would collide with the one before
function spaced(c, items, y) { let lastR = -Infinity; c.textAlign = 'center'; c.fillStyle = C.mute; for (const [x, s] of items) { const w = c.measureText(s).width; if (x - w / 2 < lastR + 6) continue; c.fillText(s, x, y); lastR = x + w / 2; } }
function yTicks(c, f, vals, fv, right, col) {
  c.fillStyle = col || C.mute; c.textAlign = right ? 'left' : 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fv(v), right ? f.R + 6 : f.L - 6, y); if (!right) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); } });
}
function path(c, pts, X, Y, col, lw = 2.2, dash) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; if (dash) c.setLineDash(dash); c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); c.setLineDash([]); }
function tag(c, s, x, y, col, align) { c.font = FONT; const w = c.measureText(s).width; const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; c.fillStyle = C.bg; c.fillRect(x0 - 3, y - 8, w + 6, 16); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, x0, y); }
function dot(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, 6.283); c.fill(); }
// a power-of-ten tick: 10^e seconds written with a whole number and its unit
const tickT = e => { const u = e < -3 ? ['us', 6] : e < 0 ? ['ms', 3] : ['s', 0]; return t('ch8.unit.t', { v: fmt(Math.pow(10, e + u[1])), u: t('unit.' + u[0]) }); };
const durT = s => { const [v, u] = M.dur(s); return t('ch8.unit.t', { v, u: t('unit.' + u) }); };

/* ───────── 01 sectors ───────── */
(() => {
  const cv = $('#secCv'), sO = $('#secO'), S = M.sector;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), off = +sO.value, wr = S.write(off, 4);
      // show 3 physical sectors around the write
      const p0 = Math.max(0, wr.p0 - (wr.p1 === wr.p0 ? 1 : 0)), nP = 3, n = nP * 8, first = p0 * 8;
      const L = 10, R = w - 10, cw = (R - L) / n, yl = 30, hl = Math.min(34, h * 0.24), yp = yl + hl + 14, hp = Math.min(34, h * 0.24);
      c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch1.cv.log'), L, 12); c.fillText(t('ch1.cv.phys'), L, yp + hp + 14);
      for (let i = 0; i < n; i++) {
        const lba = first + i, inW = lba >= off && lba < off + 8, x = L + i * cw;
        c.fillStyle = inW ? 'rgba(233,185,73,.55)' : '#1a1f2b'; c.fillRect(x + 1, yl, cw - 2, hl);
      }
      for (let p = 0; p < nP; p++) {
        const pp = p0 + p, hit = pp >= wr.p0 && pp <= wr.p1, x = L + p * 8 * cw;
        const lo = Math.max(off, pp * 8), hi = Math.min(off + 7, pp * 8 + 7), part = hit && hi - lo + 1 < 8;
        c.fillStyle = !hit ? '#1a1f2b' : part ? 'rgba(240,122,109,.45)' : 'rgba(122,214,160,.4)'; c.fillRect(x + 2, yp, 8 * cw - 4, hp);
        c.strokeStyle = C.line; c.strokeRect(x + 2, yp, 8 * cw - 4, hp);
      }
    }
  });
  function text() {
    const off = +sO.value, wr = S.write(off, 4);
    put('#secOo', fmt(off)); put('#secT', t('ch1.unit.n', { v: fmt(wr.touched) })); put('#secR', t('ch1.unit.kib', { v: fmt(wr.read / 1024) }));
    put('#secW', t('ch1.unit.kib', { v: fmt(wr.written / 1024) })); put('#secA', t(wr.rmw ? 'ch1.st.bad' : 'ch1.st.ok'));
    putHTML('#secSay', sayText(M.say.sector(off)));
  }
  bind(sim, text, [sO]);
})();

/* ───────── 02 seek + rotation + zoned rate ───────── */
(() => {
  const cv = $('#skCv'), cv2 = $('#sqCv'), sS = $('#skS'), D = M.disk;
  const curve = []; for (let i = 0; i <= 200; i++) { const x = i / 200; curve.push([x, D.seek(x)]); }
  const sim = reg([cv, cv2], {
    draw() {
      const rpm = +radioVal('skR'), span = +sS.value / 100;
      { const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 40, 40], 0, 1, 0, 20);
        c.fillStyle = 'rgba(99,199,230,.08)'; c.fillRect(f.L, f.T, f.X(span) - f.L, f.B - f.T);
        yTicks(c, f, [0, 5, 10, 15, 20], v => fmt(v)); axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        spaced(c, [0, 0.25, 0.5, 0.75, 1].map(v => [f.X(v), fmt(v * 100) + '%']), f.B + 11);
        path(c, curve, f.X, f.Y, C.gold);
        const a = D.avgSeek(span); c.strokeStyle = C.cyan; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(f.L, f.Y(a)); c.lineTo(f.R, f.Y(a)); c.stroke(); c.setLineDash([]);
        const lab = t('ch2.cv.span'), lw = c.measureText(lab).width, lx = Math.min(Math.max(f.L + 4, f.X(span) - lw - 8), f.R - lw - 4);
        tag(c, lab, lx, f.Y(a) - 12 < f.T + 8 ? f.Y(a) + 12 : f.Y(a) - 12, C.cyan, 'left'); }
      { const { c, w, h } = fit(cv2), max = Math.ceil(D.odRate(15000) / 100) * 100, f = frame(w, h, [26, 14, 36, 44], 0, 1, 0, max);
        const step = max > 400 ? 200 : 100, ys = []; for (let v = 0; v <= max; v += step) ys.push(v);
        yTicks(c, f, ys, v => fmt(v)); axes(c, f, t('ch2.cv2.x'), t('ch2.cv2.y'));
        spaced(c, [0, 0.25, 0.5, 0.75, 1].map(v => [f.X(v), fmt(v * 100) + '%']), f.B + 11);
        const pts = []; for (let i = 0; i <= 100; i++) pts.push([i / 100, D.rateAt(i / 100, rpm)]);
        path(c, pts, f.X, f.Y, C.green); }
    }
  });
  function text() {
    const rpm = +radioVal('skR'), span = +sS.value / 100, r = D.random(rpm, span);
    put('#skSo', fmt(span * 100) + '%'); put('#skSeek', t('ch2.unit.ms', { v: fmt(r.seek, 1) })); put('#skRot', t('ch2.unit.ms', { v: fmt(r.rot, 2) }));
    put('#skT', t('ch2.unit.ms', { v: fmt(r.t, 1) })); put('#skI', fmt(r.iops));
    put('#skOd', t('ch2.unit.mbs', { v: fmt(D.odRate(rpm)) })); put('#skId', t('ch2.unit.mbs', { v: fmt(D.idRate(rpm)) }));
    putHTML('#skSay', sayText(M.say.disk(rpm, span)));
  }
  bind(sim, text, [sS], ['skR']);
})();

/* ───────── 03 shingles ───────── */
(() => {
  const cv = $('#smCv'), sB = $('#smB'), sQ = $('#smQ'), S = M.smr;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), B = +sB.value, q = +sQ.value, f = frame(w, h, [30, 46, 40, 44], 1, 100, 0, 1);
      const gMax = 100, cMax = 60;
      const Yg = g => f.B - (f.B - f.T) * g / gMax, Yc = v => f.B - (f.B - f.T) * v / cMax;
      [0, 25, 50, 75, 100].forEach(v => { const y = Yg(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); c.fillStyle = C.gold; c.textAlign = 'right'; c.fillText(fmt(v) + '%', f.L - 6, y); });
      [0, 20, 40, 60].forEach(v => { c.fillStyle = C.red; c.textAlign = 'left'; c.fillText(fmt(v), f.R + 6, Yc(v)); });
      axes(c, f, t('ch3.cv.x'), '');
      spaced(c, [1, 25, 50, 75, 100].map(v => [f.X(v), fmt(v)]), f.B + 11);
      const g = [], k = []; for (let b = 1; b <= 100; b++) { g.push([b, (S.gain(b, q) - 1) * 100]); k.push([b, S.meanRewrite(b)]); }
      path(c, g, f.X, Yg, C.gold); path(c, k, f.X, Yc, C.red);
      c.strokeStyle = C.gold; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(f.L, Yg((S.maxGain(q) - 1) * 100)); c.lineTo(f.R, Yg((S.maxGain(q) - 1) * 100)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.X(B), f.T); c.lineTo(f.X(B), f.B); c.stroke();
      dot(c, f.X(B), Yg((S.gain(B, q) - 1) * 100), C.gold); dot(c, f.X(B), Yc(S.meanRewrite(B)), C.red);
    }
  });
  function text() {
    const B = +sB.value, q = +sQ.value, u = S.update(B, q, 7200);
    put('#smBo', fmt(B)); put('#smQo', fmt(q, 2)); put('#smG', t('ch3.unit.pct', { v: fmt((u.gain - 1) * 100) }));
    put('#smTr', t('ch3.unit.tr', { v: fmt(u.tracks, 1) })); put('#smMs', t('ch3.unit.ms', { v: fmt(u.ms) })); put('#smX', t('ch3.unit.x', { v: fmt(u.slow) }));
    putHTML('#smSay', sayText(M.say.smr(B, q)));
  }
  bind(sim, text, [sB, sQ]);
})();

/* ───────── 04 threshold voltage ───────── */
(() => {
  const cv = $('#vtCv'), sW = $('#vtW'), Cl = M.cell;
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), n = +radioVal('vtN'), N = +sW.value, s = Cl.sigma(N, M.W0), L = Cl.levels(n), d = Cl.delta(n);
      const v0 = -0.5, v1 = Cl.WIN + 0.5, f = frame(w, h, [16, 14, 40, 14], v0, v1, 0, 1);
      // scale each peak to the same height
      const peak = 1 / (s * Math.sqrt(2 * Math.PI)), one = (v, i) => Math.exp(-Math.pow((v - i * d) / s, 2) / 2);
      const nx = Math.max(200, Math.round(f.R - f.L));
      // misread area: for state i, the parts beyond its two reference voltages
      for (let i = 0; i < L; i++) {
        const lo = i ? (i - 0.5) * d : -Infinity, hi = i < L - 1 ? (i + 0.5) * d : Infinity;
        c.fillStyle = 'rgba(240,122,109,.55)'; c.beginPath(); c.moveTo(f.X(v0), f.B);
        for (let k = 0; k <= nx; k++) { const v = v0 + (v1 - v0) * k / nx, out = v < lo || v > hi; c.lineTo(f.X(v), out ? f.Y(one(v, i) * 0.92) : f.B); }
        c.lineTo(f.X(v1), f.B); c.closePath(); c.fill();
      }
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
      for (let i = 0; i < L; i++) { const pts = []; for (let k = 0; k <= nx; k++) { const v = v0 + (v1 - v0) * k / nx; pts.push([v, one(v, i) * 0.92]); } path(c, pts, f.X, f.Y, i ? C.gold : C.cyan, L > 16 ? 1.2 : 1.8); }
      c.strokeStyle = 'rgba(235,232,224,.45)'; c.lineWidth = 1;
      for (let i = 0; i < L - 1; i++) { const x = f.X((i + 0.5) * d); c.beginPath(); c.moveTo(x, f.T); c.lineTo(x, f.B); c.stroke(); }
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch4.cv.x'), f.R, f.B + 14);
      void peak;
    }
  });
  function text() {
    const n = +radioVal('vtN'), N = +sW.value, s = Cl.sigma(N, M.W0), r = Cl.rber(n, s);
    put('#vtWo', fmt(N)); put('#vtL', t('ch4.unit.n', { v: fmt(Cl.levels(n)) })); put('#vtD', t('ch4.unit.mv', { v: fmt(Cl.delta(n) * 1000) }));
    put('#vtS', t('ch4.unit.mv', { v: fmt(s * 1000) })); put('#vtR', M.sci(r));
    putHTML('#vtSay', sayText(M.say.cell(n, N)));
  }
  bind(sim, text, [sW], ['vtN']);
})();

/* ───────── 05 ECC → endurance; lifetime ───────── */
(() => {
  const cv = $('#ecCv'), sT = $('#ecT'), E = M.ecc, names = ['slc', 'mlc', 'tlc', 'qlc', 'plc'], cols = [C.cyan, C.green, C.gold, C.violet, C.red];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), tb = E.table(+sT.value, E.UBER[radioVal('ecC')]);
      const f = frame(w, h, [30, 14, 34, 52], 0, 5, 1, 5);
      const Y = v => f.Y(Math.log10(Math.max(v, 10)));
      [1, 2, 3, 4, 5].forEach(e => { const y = f.Y(e); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(fmt(Math.pow(10, e)), f.L - 6, y); });
      axes(c, f, '', t('ch5.cv.y'));
      const bw = Math.min(70, (f.R - f.L) / 5 * 0.6);
      tb.forEach((r, i) => {
        const x = f.X(i + 0.5), top = Y(r.pe);
        c.textAlign = 'center'; c.fillStyle = C.ink; c.fillText(t('cell.short.' + names[i]), x, f.B + 12);
        if (r.pe < 10) { const z = t('ch5.cv.zero'), room = (f.R - f.L) / 5 - 6; c.fillStyle = C.red; if (c.measureText(z).width <= room) c.fillText(z, x, f.B - 12); else c.fillText('0', x, f.B - 12); return; }
        c.fillStyle = cols[i]; c.globalAlpha = 0.75; c.fillRect(x - bw / 2, top, bw, f.B - top); c.globalAlpha = 1;
      });
    }
  });
  function text() {
    const tt = +sT.value, cls = radioVal('ecC'), target = E.UBER[cls], tb = E.table(tt, target);
    put('#ecTo', fmt(tt)); put('#ecL', M.sci(E.limit(tt, target))); put('#ecR', t('ch5.unit.pct', { v: fmt(E.rate(tt) * 100, 1) }));
    put('#ecTl', t('ch5.unit.pe', { v: fmt(tb[2].pe) })); put('#ecQl', t('ch5.unit.pe', { v: fmt(tb[3].pe) }));
    putHTML('#ecSay', sayText(M.say.ecc(tt, cls)));
  }
  bind(sim, text, [sT], ['ecC']);
})();
(() => {
  const sD = $('#lfD'), sW = $('#lfW'), sE = $('#lfE'), E = M.ecc;
  function text() {
    const n = +radioVal('lfN'), d = +sD.value, wa = +sW.value, ea = +sE.value, pe = M.cell.endurance(n, E.P0, M.W0), y = E.years(pe, E.OP, d, wa);
    put('#lfDo', fmt(d, 2)); put('#lfWo', fmt(wa, 1)); put('#lfEo', fmt(ea, 2));
    put('#lfPe', t('ch5.unit.pe', { v: fmt(pe) })); put('#lfY', t('ch5.unit.y', { v: y >= 10 ? fmt(y) : fmt(y, 1) }));
    put('#lfA40', t('ch5.unit.x', { v: fmt(E.af(ea, 30, 40), 1) })); put('#lfA55', t('ch5.unit.x', { v: fmt(E.af(ea, 30, 55), 1) }));
    putHTML('#lfSay', sayText(M.say.life(n, d, wa)));
  }
  [sD, sW, sE].forEach(e => e.addEventListener('input', text)); radios('lfN').forEach(r => r.addEventListener('change', text));
  texts.push(text); text();
})();

/* ───────── 06 FTL ───────── */
(() => {
  const grid = $('#ftlGrid'), mapEl = $('#ftlMap'), sL = $('#ftlL');
  let f = M.ftl.start(), rnd = M.ftl.rng(11);
  function render() {
    const hot = f.last, out = [];
    for (let b = 0; b < f.B; b++) {
      const open = b === f.open, cells = f.pg[b].map((x, p) => {
        const isHot = x.s === 'valid' && x.lba === hot && f.map[hot] && f.map[hot].b === b && f.map[hot].p === p;
        return `<div class="pg ${x.s}${isHot ? ' hot' : ''}">${x.lba >= 0 ? x.lba : ''}</div>`;
      }).join('');
      out.push(`<div class="blk${open ? ' open' : ''}"><h4>${t(open ? 'ch6.blk.open' : 'ch6.blk', { b })}</h4><div class="pgs">${cells}</div><div class="er">${t('ch6.erases', { v: fmt(f.erases[b]) })}</div></div>`);
    }
    grid.innerHTML = out.join('');
    mapEl.innerHTML = f.map.map((m, i) => `<div class="${i === hot ? 'hot' : ''}"><b>${i}</b> → ${m ? m.b + '.' + m.p : '—'}</div>`).join('');
  }
  function text() {
    const dh = f.host - f.host0, dn = f.nand - f.nand0;
    put('#ftlLo', fmt(+sL.value)); put('#ftlH', fmt(dh)); put('#ftlN', fmt(dn)); put('#ftlRa', dh ? fmt(dn / dh, 2) : '—'); put('#ftlG', fmt(f.gcRuns));
    putHTML('#ftlSay', sayText(M.say.ftl(f)));
    render();
  }
  const w = lba => f.write(lba);
  sL.addEventListener('input', text);
  $('#ftlW').addEventListener('click', () => { w(+sL.value); text(); });
  $('#ftlR1').addEventListener('click', () => { w(Math.floor(rnd() * f.N)); text(); });
  $('#ftlR20').addEventListener('click', () => { for (let i = 0; i < 20; i++) w(Math.floor(rnd() * f.N)); text(); });
  $('#ftlSeq').addEventListener('click', () => { for (let i = 0; i < f.N; i++) w(i); text(); });
  $('#ftlX').addEventListener('click', () => { f = M.ftl.start(); rnd = M.ftl.rng(11); text(); });
  texts.push(text); text();
})();

/* ───────── 07 layer map ───────── */
(() => {
  const P = M.map, dBox = $('#mpD'), sBox = $('#mpS');
  const mk = (box, name, ids, def, pre) => { ids.forEach(id => { const l = document.createElement('label'); l.innerHTML = `<input type="radio" name="${name}" value="${id}"${id === def ? ' checked' : ''}><span data-i18n="${pre}${id}"></span>`; box.appendChild(l); }); };
  mk(dBox, 'mpD', Object.keys(P.DRIVES), 'm2sata', 'ch7.d.');
  mk(sBox, 'mpS', Object.keys(P.SLOTS), 'm2pcie', 'ch7.s.');
  function text() {
    const d = radioVal('mpD'), s = radioVal('mpS'), r = P.check(d, s);
    $('#mpT').innerHTML = r.rows.map(row => {
      const cls = row.ok === null ? 's' : row.ok ? 'y' : 'n', okT = row.ok === null ? t('ch7.ok.skip') : row.ok ? t('ch7.ok.y') : t('ch7.ok.n');
      return `<tr class="${row.ok === false ? 'bad' : ''}"><td>${t('ch7.layer.' + row.k)}</td><td>${t('ch7.v.' + row.v)}</td><td class="${cls}">${okT}</td></tr>`;
    }).join('');
    putHTML('#mpSay', sayText(M.say.map(d, s)));
  }
  radios('mpD').concat(radios('mpS')).forEach(r => r.addEventListener('change', text));
  texts.push(text);
})();

/* ───────── 08 end to end ───────── */
(() => {
  const cv = $('#eeCv'), sS = $('#eeS'), E = M.e2e, ids = ['hdd', 'sata', 'nvme'];
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), bytes = Math.pow(2, +sS.value);
      const labs = ids.map(i => t('ch8.dev.' + i)); c.font = FONT; let lw = 0; for (const s of labs) lw = Math.max(lw, c.measureText(s).width);
      const above = lw + 14 > w * 0.36, L = above ? 10 : lw + 16, R = w - 14, T = 8, B = h - 34, rh = (B - T) / 3;
      const lo = -5, hi = 1, X = s => L + (R - L) * (Math.log10(Math.max(s, 1e-5)) - lo) / (hi - lo);
      c.strokeStyle = C.grid; const tk = [];
      for (let e = lo; e <= hi; e++) { const x = X(Math.pow(10, e)); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); tk.push([x, tickT(e)]); }
      spaced(c, tk.map(([x, s]) => { const hw = c.measureText(s).width / 2; return [Math.min(Math.max(x, hw + 2), w - hw - 2), s]; }), B + 11); c.textAlign = 'right'; c.fillStyle = C.mute; c.fillText(t('ch8.cv.x'), R, B + 26);
      ids.forEach((id, i) => {
        const r = E.time(id, bytes), y = T + i * rh;
        c.fillStyle = C.ink;
        if (above) { c.textAlign = 'left'; c.fillText(labs[i], L, y + rh * 0.2); } else { c.textAlign = 'right'; c.fillText(labs[i], L - 8, y + rh / 2); }
        const y0 = above ? y + rh * 0.42 : y + rh * 0.22, bh = above ? rh * 0.44 : rh * 0.56, xl = X(r.lat), xt = X(r.t);
        c.fillStyle = C.gold; c.fillRect(L, y0, Math.max(2, xl - L), bh);
        c.fillStyle = C.cyan; c.fillRect(xl, y0, Math.max(0, xt - xl), bh);
      });
    }
  });
  function text() {
    const bytes = Math.pow(2, +sS.value), [v, u] = M.size(bytes);
    put('#eeSo', t('ch8.unit.size', { v, u: t('unit.' + u) }));
    put('#eeH', durT(E.time('hdd', bytes).t)); put('#eeA', durT(E.time('sata', bytes).t)); put('#eeN', durT(E.time('nvme', bytes).t));
    putHTML('#eeSay', sayText(M.say.e2e(bytes)));
  }
  bind(sim, text, [sS]);
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
