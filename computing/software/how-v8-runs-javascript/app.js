/* How V8 Runs JavaScript: i18n runtime, 9 interactive labs, and responsive 2D canvas renderers.
   All visible text comes from copy.*.js (generated from content.<lang>.md); static diagrams live in figures/dg-*.html.
   Every model in models.js is pure and deterministic. Nothing animates on its own without user interaction,
   so prefers-reduced-motion requires no extra timer suppression. */
(() => {
'use strict';
const M = window.V8Models;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = {
  bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0',
  mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
  green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b',
};
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const MONO = '12px ui-monospace,Menlo,Consolas,monospace';

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) {} }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const enStub = !COPY.en || document.documentElement.dataset.langEn === 'stub';
const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}
const fmt = (x, d) => M.fmt(x, d);
const langHooks = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langHooks.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + IntersectionObserver gate ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d');
  c.setTransform(d, 0, 0, d, 0, 0);
  c.font = FONT;
  c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => {
  for (const s of sims) if (s.cvs.includes(e.target)) {
    e.target.__vis = e.isIntersecting;
    s.vis = s.cvs.some(cv => cv.__vis);
    s.dirty = true;
  }
}), { rootMargin: '60px' });
function reg(cvs, o) {
  o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o);
  o.cvs.forEach(cv => io.observe(cv));
  return o;
}
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
function loop() {
  for (const s of sims) if (s.vis && s.dirty) { s.dirty = false; s.draw(); }
  requestAnimationFrame(loop);
}
const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const sliderOut = (id, s) => put('#' + id + 'o', s);
function rangeLab(sel, fn) { const e = $(sel); e.addEventListener('input', fn); e.addEventListener('change', fn); return e; }
const chkLab = (sel, fn) => $(sel).addEventListener('change', fn);

/* ───────── chart helpers (overlap-safe) ───────── */
function frame(w, h, m, x0, x1, y0, y1, logx, logy) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  const fx = v => (logx ? Math.log10(Math.max(1e-9, v)) : v);
  const fy = v => (logy ? Math.log10(Math.max(1e-9, v)) : v);
  return {
    L, R, T, B,
    X: x => L + (R - L) * (fx(x) - fx(x0)) / (fx(x1) - fx(x0)),
    Y: y => B - (B - T) * (fy(y) - fy(y0)) / (fy(y1) - fy(y0)),
  };
}
function fitText(c, s, maxW, base, fontSpec) {
  base = base || 12;
  let fs = base;
  const tpl = fontSpec || FONT;
  c.font = tpl.replace(/\d+px/, fs + 'px');
  while (c.measureText(s).width > maxW && fs > 9.5) {
    fs -= 0.5;
    c.font = tpl.replace(/\d+px/, fs + 'px');
  }
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1;
  c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) {
    c.textAlign = 'left';
    fitText(c, yLab, f.R - f.L - 8, 12);
    c.fillText(yLab, f.L + 4, f.T - 12);
    c.font = FONT;
  }
  if (xLab) {
    c.textAlign = 'right';
    fitText(c, xLab, f.R - f.L - 8, 12);
    c.fillText(xLab, f.R, f.B + 31);
    c.font = FONT;
  }
}
function xTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center';
  let lastR = -Infinity;
  for (const [x, s] of items) {
    const px = f.X(x);
    const w = c.measureText(s).width;
    const cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2);
    if (cx - w / 2 < lastR + 8) continue;
    c.fillText(s, cx, f.B + 14);
    lastR = cx + w / 2;
    c.strokeStyle = C.line;
    c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke();
  }
}
function yTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right';
  let lastY = Infinity;
  for (const [y, s] of items) {
    const py = f.Y(y);
    if (py > lastY - 15 || py < f.T + 2) continue;
    c.fillText(s, f.L - 6, py);
    lastY = py;
    c.strokeStyle = C.grid;
    c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke();
  }
}
function poly(c, pts, col, lw, dash) {
  c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.setLineDash(dash || []);
  c.beginPath();
  let first = true;
  for (const [x, y] of pts) {
    if (!isFinite(x) || !isFinite(y)) { first = true; continue; }
    if (first) c.moveTo(x, y); else c.lineTo(x, y);
    first = false;
  }
  c.stroke(); c.setLineDash([]);
}
function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, 6.283); c.fill(); }
function boxRect(c, x, y, w, h, stroke, fill, rad) {
  c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 1.3;
  c.beginPath(); c.roundRect(x, y, w, h, rad || 6); c.fill(); c.stroke();
}
function clipStr(c, text, maxW) {
  let s = String(text);
  if (c.measureText(s).width <= maxW) return s;
  while (s.length > 1 && c.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}
function clampLabel(c, text, x, y, col, align, minX, maxX, fontSpec) {
  c.font = fontSpec || FONT;
  c.fillStyle = col;
  const lo = minX == null ? 4 : minX;
  const hi = maxX == null ? c.canvas.clientWidth - 4 : maxX;
  const avail = Math.max(20, hi - lo);
  fitText(c, text, avail, 12, fontSpec);
  const shown = clipStr(c, text, avail);
  const tw = c.measureText(shown).width;
  let left = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
  left = Math.max(lo, Math.min(left, hi - tw));
  c.textAlign = 'left';
  c.fillText(shown, left, y);
}

/* ═════════ ch1: 4-tier pipeline ═════════ */
(function ch1() {
  const cv = $('#c1Cv'), callsEl = $('#c1Calls'), sizeEl = $('#c1Size'), lazyEl = $('#c1Lazy');
  let S = null;
  function update() {
    const calls = +callsEl.value, sz = +sizeEl.value, lazy = lazyEl.checked;
    S = M.simPipeline({ calls, bytecodeBytes: sz, lazyPreparse: lazy });
    sliderOut('c1Calls', t('u.calls', { v: fmt(calls, 0) }));
    sliderOut('c1Size', fmt(sz, 0) + ' B');
    put('#c1Tier', t('ch1.tier.' + S.tier));
    put('#c1Tiered', t('u.ms', { v: fmt(S.tieredMs, 3) }));
    put('#c1Ign', t('u.ms', { v: fmt(S.ignitionOnlyMs, 3) }));
    put('#c1Always', t('u.ms', { v: fmt(S.alwaysTurboMs, 3) }));
    putHTML('#c1Say', t('ch1.say.' + S.mode, {
      n: fmt(calls, 0),
      t: fmt(S.tieredMs, 3),
      a: fmt(S.alwaysTurboMs, 2),
      i: fmt(S.ignitionOnlyMs, 3),
      p: fmt(S.parseSavedPct, 0),
      sp: fmt(S.speedupVsIgn, 1),
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!S) return;
      const xs = [1, 5, 12, 30, 100, 400, 1000, 3000, 5000];
      const ptsIgn = [], ptsTier = [], ptsTurbo = [];
      let minY = 0.004, maxY = 12;
      for (const n of xs) {
        const r = M.simPipeline({ calls: n, bytecodeBytes: S.bytecodeBytes, lazyPreparse: S.lazyPreparse });
        ptsIgn.push([n, r.ignitionOnlyMs]);
        ptsTier.push([n, r.tieredMs]);
        ptsTurbo.push([n, r.alwaysTurboMs]);
        maxY = Math.max(maxY, r.ignitionOnlyMs * 1.3, r.alwaysTurboMs * 1.3);
        minY = Math.min(minY, r.tieredMs * 0.7);
      }
      const f = frame(w, h, [32, 16, 44, 54], 1, 5000, minY, maxY, true, true);
      axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
      xTicks(c, f, [[1, '1'], [12, '12'], [100, '100'], [400, '400'], [3000, '3k'], [5000, '5k']]);
      yTicks(c, f, [[0.01, '0.01'], [0.1, '0.1'], [1, '1'], [10, '10']]);

      // Threshold markers inside top strip without crowding
      for (const [tx, lbl, col] of [[12, 'Sp@12', C.green], [400, 'Mag@400', C.gold], [3000, 'TF@3k', C.violet]]) {
        const px = f.X(tx);
        c.strokeStyle = col; c.globalAlpha = 0.45; c.setLineDash([3, 3]);
        c.beginPath(); c.moveTo(px, f.T + 14); c.lineTo(px, f.B); c.stroke();
        c.setLineDash([]); c.globalAlpha = 1;
        if (w >= 460 || tx === 12 || tx === 400) clampLabel(c, lbl, px, f.T + 6, col, 'center', f.L + 2, f.R - 2);
      }

      poly(c, ptsIgn.map(([x, y]) => [f.X(x), f.Y(y)]), C.red, 2, [5, 3]);
      poly(c, ptsTurbo.map(([x, y]) => [f.X(x), f.Y(y)]), C.violet, 2, [2, 3]);
      poly(c, ptsTier.map(([x, y]) => [f.X(x), f.Y(y)]), C.cyan, 2.8);

      dot(c, f.X(S.calls), f.Y(S.tieredMs), C.gold, 5.5);

      // Legend stacked cleanly inside top-left or top-right free space
      const legItems = [
        [C.cyan, t('ch1.leg.tier')],
        [C.red, t('ch1.leg.ign')],
        [C.violet, t('ch1.leg.turbo')],
      ];
      let lx = f.L + 10, ly = f.T + 26;
      for (const [col, name] of legItems) {
        c.fillStyle = col; c.fillRect(lx, ly - 2, 12, 3);
        clampLabel(c, name, lx + 16, ly, col, 'left', lx + 16, f.R - 8);
        ly += 16;
      }
    },
  });
  rangeLab('#c1Calls', update); rangeLab('#c1Size', update); chkLab('#c1Lazy', update);
  langHooks.push(update); update();
})();

/* ═════════ ch2: Pointer tagging & Smi ═════════ */
(function ch2() {
  const cv = $('#c2Cv');
  let S = null;
  function update() {
    const val = radioVal('c2Val') || '42';
    const mode = radioVal('c2Mode') || 'compressed';
    S = M.inspectValue(val, mode);
    put('#c2Kind', S.kind);
    put('#c2Word', S.hexWord);
    put('#c2Heap', S.heapBytes === 0 ? '0 B' : S.heapBytes + ' B');
    put('#c2Obj', S.obj2Bytes + ' B');
    putHTML('#c2Say', t('ch2.say.' + S.sayKey, {
      val: String(S.value),
      word: S.hexWord,
      obj: String(S.obj2Bytes),
      heap: String(S.heapBytes),
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!S) return;
      const pad = 16, bw = w - 2 * pad;
      const barY = h * 0.24, barH = 44;
      const tagW = Math.max(46, Math.min(68, bw * 0.14));
      const payW = bw - tagW - 6;

      // Payload cell
      const mainCol = S.isSmi ? C.green : C.red;
      boxRect(c, pad, barY, payW, barH, mainCol, 'rgba(20,24,33,0.9)', 8);
      clampLabel(c, S.isSmi ? t('ch2.cv.pay') : t('ch2.cv.ptr'), pad + payW / 2, barY + 14, mainCol, 'center', pad + 4, pad + payW - 4);
      clampLabel(c, S.hexWord, pad + payW / 2, barY + 32, C.ink, 'center', pad + 4, pad + payW - 4, MONO);

      // Tag bit cell
      const tagX = pad + payW + 6;
      boxRect(c, tagX, barY, tagW, barH, mainCol, S.isSmi ? 'rgba(122,214,160,0.2)' : 'rgba(240,122,109,0.2)', 8);
      clampLabel(c, t('ch2.cv.tag'), tagX + tagW / 2, barY + 14, C.mute, 'center', tagX + 2, tagX + tagW - 2);
      clampLabel(c, String(S.tagBit), tagX + tagW / 2, barY + 32, mainCol, 'center', tagX + 2, tagX + tagW - 2, MONO);

      // Lower heap box if HeapNumber
      const boxY = barY + barH + 26;
      if (!S.isSmi) {
        c.strokeStyle = C.red; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(pad + payW * 0.5, barY + barH); c.lineTo(pad + payW * 0.5, boxY); c.stroke();
        boxRect(c, pad, boxY, bw, 46, C.red, 'rgba(240,122,109,0.12)', 8);
        clampLabel(c, `${t('ch2.cv.box')} (${S.heapBytes} B): Map* + float64(${S.value})`, w / 2, boxY + 23, C.ink, 'center', pad + 6, w - pad - 6);
      } else {
        boxRect(c, pad, boxY, bw, 46, C.green, 'rgba(122,214,160,0.08)', 8);
        clampLabel(c, `Smi [${fmt(S.smiMin, 0)} .. ${fmt(S.smiMax, 0)}] -> 0 B Heap`, w / 2, boxY + 23, C.green, 'center', pad + 6, w - pad - 6);
      }
    },
  });
  onAll($$('input[name=c2Val]'), 'change', update);
  onAll($$('input[name=c2Mode]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch3: Hidden Classes (Map) & Slack Tracking ═════════ */
(function ch3() {
  const cv = $('#c3Cv');
  let S = null;
  function update() {
    const scen = radioVal('c3Scen') || 'same_order';
    S = M.simMapScenario(scen);
    put('#c3Map', S.activeMapId + (S.mode === 'dict' ? ' (Dict)' : ' (Fast)'));
    put('#c3Same', S.sameMap ? t('u.yes') : t('u.no'));
    put('#c3Size', `${S.instanceSize64} B / ${S.instanceSize32} B`);
    const used = S.mode === 'dict' ? 0 : S.objects[S.objects.length - 1].props.length;
    put('#c3Slack', S.mode === 'dict' ? t('u.none') : `${used} / ${S.inObjectSlots}`);
    putHTML('#c3Say', t('ch3.say.' + S.sayKey, {
      total: String(S.inObjectSlots),
      size64: String(S.instanceSize64),
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!S) return;
      const pad = 14;
      // Top section: Map transition nodes (3x2 grid for 5-node branched tree so 320px fits cleanly)
      const nodes = S.maps;
      const rowY = 44;
      const cols = nodes.length === 5 ? 3 : nodes.length;
      const nw = Math.min(112, Math.floor((w - 2 * pad - Math.max(0, cols - 1) * 8) / Math.max(1, cols)));
      const stepX = cols > 1 ? (w - 2 * pad - nw) / (cols - 1) : 0;
      const coords = {};
      nodes.forEach((m, i) => {
        let col = i, row = 0;
        if (nodes.length === 5) {
          if (m.id === 'M3') { col = 1; row = 1; }
          else if (m.id === 'M4') { col = 2; row = 1; }
          else { col = i; row = 0; }
        }
        const x = cols === 1 ? (w - nw) / 2 : pad + col * stepX;
        const y = row === 1 ? rowY + 52 : rowY;
        coords[m.id] = { x, y };
      });
      // Edges
      nodes.forEach(m => {
        if (!m.parent || !coords[m.parent]) return;
        const p = coords[m.parent], q = coords[m.id];
        c.strokeStyle = m.dict ? C.red : C.mute; c.lineWidth = 1.4;
        if (m.dict) c.setLineDash([4, 3]);
        c.beginPath(); c.moveTo(p.x + nw, p.y + 18); c.lineTo(q.x, q.y + 18); c.stroke();
        c.setLineDash([]);
      });
      // Boxes
      nodes.forEach(m => {
        const { x, y } = coords[m.id];
        const active = m.id === S.activeMapId;
        const col = m.dict ? C.red : active ? C.gold : C.cyan;
        boxRect(c, x, y, nw, 36, col, active ? 'rgba(233,185,73,0.16)' : C.card2, 6);
        clampLabel(c, m.id + ' ' + m.label, x + nw / 2, y + 18, col, 'center', x + 3, x + nw - 3, MONO);
      });

      // Bottom section: Instance slot layout bar
      const barY = h - 76, barH = 44;
      clampLabel(c, t('ch3.cv.slots'), pad, barY - 14, C.mute, 'left', pad, w - pad);
      if (S.mode === 'dict') {
        const hw = Math.min(180, (w - 2 * pad) * 0.44);
        boxRect(c, pad, barY, hw, barH, C.red, 'rgba(240,122,109,0.14)', 6);
        clampLabel(c, t('ch3.cv.hdr'), pad + hw / 2, barY + 22, C.ink, 'center', pad + 4, pad + hw - 4);
        const dw = w - 2 * pad - hw - 12;
        boxRect(c, pad + hw + 12, barY, dw, barH, C.red, 'rgba(240,122,109,0.22)', 6);
        clampLabel(c, t('ch3.cv.dict'), pad + hw + 12 + dw / 2, barY + 22, C.red, 'center', pad + hw + 16, w - pad - 4);
      } else {
        const hdrW = Math.min(132, (w - 2 * pad) * 0.34);
        boxRect(c, pad, barY, hdrW, barH, C.cyan, 'rgba(99,199,230,0.14)', 6);
        const hdrTxt = hdrW < 115 ? 'ObjHdr' : t('ch3.cv.hdr');
        clampLabel(c, hdrTxt, pad + hdrW / 2, barY + 22, C.cyan, 'center', pad + 3, pad + hdrW - 3);
        const slots = S.inObjectSlots;
        const usedProps = S.objects[S.objects.length - 1].props;
        const remW = w - 2 * pad - hdrW - 6;
        const slotW = remW / slots;
        for (let i = 0; i < slots; i++) {
          const sx = pad + hdrW + 6 + i * slotW;
          const isUsed = i < usedProps.length;
          boxRect(c, sx, barY, Math.max(8, slotW - 3), barH, isUsed ? C.green : C.dimfill, isUsed ? 'rgba(122,214,160,0.16)' : 'rgba(58,66,84,0.2)', 4);
          if (slotW >= 28) {
            const lbl = isUsed ? usedProps[i] : t('ch3.cv.slack');
            clampLabel(c, lbl, sx + (slotW - 3) / 2, barY + 22, isUsed ? C.ink : C.mute, 'center', sx + 2, sx + slotW - 5);
          }
        }
      }
    },
  });
  onAll($$('input[name=c3Scen]'), 'change', update);
  langHooks.push(update); update();
})();

/* ═════════ ch4: Inline Cache (LoadIC) ═════════ */
(function ch4() {
  const cv = $('#c4Cv'), shEl = $('#c4Shapes'), itEl = $('#c4Iters');
  let S = null;
  function update() {
    const shapes = +shEl.value, iters = +itEl.value;
    S = M.simIC(shapes, iters);
    sliderOut('c4Shapes', fmt(shapes, 0));
    sliderOut('c4Iters', fmt(iters, 0));
    put('#c4State', S.state);
    put('#c4Guards', fmt(S.avgGuards, 1));
    put('#c4Ns', t('u.ns', { v: fmt(S.nsPerAccess, 2) }));
    put('#c4Tot', t('u.ms', { v: fmt(S.totalMs, 2) }));
    putHTML('#c4Say', t('ch4.say.' + S.sayKey, {
      n: String(S.shapes),
      g: fmt(S.avgGuards, 1),
      ns: fmt(S.nsPerAccess, 2),
      slow: fmt(S.slowdown, 1),
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!S) return;
      const split = w >= 540;
      // Left: FeedbackVector slot visualization
      const lx = 14, lw = split ? w * 0.38 : w - 28;
      const slotY = 34, slotH = split ? h - 54 : 84;
      const slotCol = S.state === 'MONOMORPHIC' ? C.green : S.state === 'POLYMORPHIC' ? C.gold : C.red;
      boxRect(c, lx, slotY, lw, slotH, slotCol, 'rgba(20,24,33,0.9)', 8);
      clampLabel(c, `${t('ch4.cv.slot')}: ${S.state}`, lx + lw / 2, slotY + 16, slotCol, 'center', lx + 6, lx + lw - 6, MONO);
      if (S.megamorphicFallback) {
        clampLabel(c, t('ch4.cv.hash'), lx + lw / 2, slotY + 46, C.red, 'center', lx + 6, lx + lw - 6);
      } else {
        const ey = slotY + 34, eh = 18;
        S.slotEntries.forEach((e, i) => {
          if (ey + i * (eh + 4) + eh <= slotY + slotH - 4) {
            clampLabel(c, `${e.mapId} -> +${e.offsetBytes} B`, lx + 12, ey + i * (eh + 4) + 8, C.ink, 'left', lx + 8, lx + lw - 8, MONO);
          }
        });
      }

      // Right (or bottom on narrow): Bar chart across 1..8 shapes
      const cx0 = split ? lw + 26 : 10;
      const cy0 = split ? 10 : slotY + slotH + 14;
      const cw = w - cx0 - 6, ch = h - cy0 - 4;
      const f = frame(cx0 + cw, cy0 + ch, [28, 12, 42, 48], 0.5, 8.5, 0, 4.0);
      // Adjust frame left/top explicitly inside sub-region
      const subF = {
        L: cx0 + 46, R: cx0 + cw - 8, T: cy0 + 24, B: cy0 + ch - 42,
        X: x => (cx0 + 46) + ((cx0 + cw - 8) - (cx0 + 46)) * (x - 0.5) / 8,
        Y: y => (cy0 + ch - 42) - ((cy0 + ch - 42) - (cy0 + 24)) * (y / 4.0),
      };
      axes(c, subF, t('ch4.cv.x'), t('ch4.cv.y'));
      xTicks(c, subF, [1, 2, 3, 4, 5, 6, 7, 8].map(n => [n, String(n)]));
      yTicks(c, subF, [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4']]);
      const barW = Math.max(10, (subF.R - subF.L) / 11);
      for (let k = 1; k <= 8; k++) {
        const r = M.simIC(k, S.iterations);
        const bx = subF.X(k) - barW / 2;
        const by = subF.Y(r.nsPerAccess);
        const col = k === 1 ? C.green : k <= 4 ? C.gold : C.red;
        c.fillStyle = k === S.shapes ? col : 'rgba(163,170,184,0.28)';
        c.fillRect(bx, by, barW, subF.B - by);
        if (k === S.shapes) {
          c.strokeStyle = C.ink; c.lineWidth = 1.6;
          c.strokeRect(bx, by, barW, subF.B - by);
        }
      }
    },
  });
  rangeLab('#c4Shapes', update); rangeLab('#c4Iters', update);
  langHooks.push(update); update();
})();

/* ═════════ ch5: Ignition Bytecode Stepper ═════════ */
(function ch5() {
  const cv = $('#c5Cv');
  let S = M.createBytecodeState('smi');
  function sync() {
    const cur = S.code[S.pcIdx];
    put('#c5Pc', `@${cur.off} (${S.stepCount} / 5)`);
    put('#c5Acc', S.acc);
    put('#c5R0', S.r0);
    put('#c5Fbv', S.fbv[0]);
    putHTML('#c5Say', t('ch5.say.' + S.sayKey, {
      op: cur.op,
      len: '13',
      acc: S.acc,
      fbv: S.fbv[0],
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const split = w >= 560;
      const bw = split ? w * 0.54 : w - 24;
      const rowH = split ? 44 : 25;
      // Left/top: Bytecode instructions
      S.code.forEach((ins, idx) => {
        const y = 14 + idx * (rowH + 5);
        const active = idx === S.pcIdx && !S.done;
        const done = idx < S.pcIdx || S.done;
        const col = active ? C.gold : done ? C.green : C.line;
        boxRect(c, 12, y, bw, rowH, col, active ? 'rgba(233,185,73,0.16)' : C.card2, 6);
        clampLabel(c, `@${ins.off}  ${ins.op}`, 22, y + rowH / 2, active ? C.gold : done ? C.ink : C.mute, 'left', 18, bw + 6, MONO);
      });
      // Right/bottom: Registers & FeedbackVector
      const rx = split ? bw + 26 : 12;
      const ry = split ? 14 : 14 + 5 * (rowH + 5) + 6;
      const rw = w - rx - 12;
      const rh = h - ry - 10;
      boxRect(c, rx, ry, rw, rh, C.violet, 'rgba(179,157,251,0.08)', 8);
      clampLabel(c, t('ch5.cv.reg'), rx + rw / 2, ry + 15, C.violet, 'center', rx + 6, rx + rw - 6);
      const lines = [
        `a0: ${S.a0}`,
        `acc: ${S.acc}   |   r0: ${S.r0}`,
        `FBV[1] (.x): ${S.fbv[1]}`,
        `FBV[3] (.y): ${S.fbv[3]}`,
        `FBV[0] (+):  ${S.fbv[0]}`,
      ];
      const gap = Math.min(28, (rh - 32) / lines.length);
      lines.forEach((ln, i) => {
        clampLabel(c, ln, rx + 12, ry + 34 + i * gap, C.ink, 'left', rx + 8, rx + rw - 8, MONO);
      });
    },
  });
  $('#c5Step').addEventListener('click', () => { S = M.stepBytecodeState(S); sync(); });
  $('#c5Reset').addEventListener('click', () => { S = M.createBytecodeState(radioVal('c5In') || 'smi'); sync(); });
  onAll($$('input[name=c5In]'), 'change', () => { S = M.createBytecodeState(radioVal('c5In') || 'smi'); sync(); });
  langHooks.push(sync); sync();
})();

/* ═════════ ch6: Speculative Optimization & Deoptimization ═════════ */
(function ch6() {
  const cv = $('#c6Cv'), magEl = $('#c6Maglev');
  let S = null;
  function update() {
    const scen = radioVal('c6Scen') || 'late_map';
    S = M.simDeoptTrace(scen, magEl.checked);
    put('#c6Tier', t('ch6.tier.' + S.finalTier));
    put('#c6Deopts', fmt(S.deoptCount, 0));
    put('#c6Total', t('u.ms', { v: fmt(S.totalMs, 3) }));
    put('#c6Over', t('u.ms', { v: fmt(S.overheadMs, 3) }));
    putHTML('#c6Say', t('ch6.say.' + S.sayKey, {
      tot: fmt(S.totalMs, 3),
      reason: t('ch6.reason.' + S.bailoutReason),
      cnt: String(S.deoptCount),
      over: fmt(S.overheadMs, 3),
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!S) return;
      const f = frame(w, h, [32, 16, 44, 52], 1, 5000, 20, 900, false, true);
      axes(c, f, t('ch6.cv.x'), t('ch6.cv.y'));
      xTicks(c, f, [[1, '1'], [400, '400'], [1500, '1500'], [3000, '3000'], [5000, '5000']]);
      yTicks(c, f, [[35, '35'], [100, '100'], [300, '300'], [700, '700']]);

      poly(c, S.series.map(p => [f.X(p.call), f.Y(p.ns)]), C.cyan, 2.2);
      for (const p of S.series) {
        if (p.deopt) {
          const px = f.X(p.call), py = f.Y(p.ns);
          dot(c, px, py, C.red, 5);
        }
      }
    },
  });
  onAll($$('input[name=c6Scen]'), 'change', update);
  chkLab('#c6Maglev', update);
  langHooks.push(update); update();
})();

/* ═════════ ch7: ElementsKind One-Way Lattice ═════════ */
(function ch7() {
  const cv = $('#c7Cv');
  let S = M.createArrayState();
  function sync() {
    put('#c7Kind', S.kind);
    put('#c7Packed', S.packed ? t('u.yes') : t('u.no'));
    put('#c7Len', fmt(S.length, 0));
    put('#c7Cost', t('u.ns', { v: fmt(S.nsPerElem, 2) }));
    putHTML('#c7Say', t('ch7.say.' + S.sayKey, { kind: S.kind }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const cols = 3, pad = 12, gapX = 12, gapY = 18;
      const bw = (w - 2 * pad - 2 * gapX) / cols;
      const bh = 36;
      const nodes = [
        { k: 'PACKED_SMI_ELEMENTS', r: 0, c: 0, short: 'PACKED_SMI' },
        { k: 'PACKED_DOUBLE_ELEMENTS', r: 0, c: 1, short: 'PACKED_DBL' },
        { k: 'PACKED_ELEMENTS', r: 0, c: 2, short: 'PACKED' },
        { k: 'HOLEY_SMI_ELEMENTS', r: 1, c: 0, short: 'HOLEY_SMI' },
        { k: 'HOLEY_DOUBLE_ELEMENTS', r: 1, c: 1, short: 'HOLEY_DBL' },
        { k: 'HOLEY_ELEMENTS', r: 1, c: 2, short: 'HOLEY' },
      ];
      nodes.forEach(nd => {
        const x = pad + nd.c * (bw + gapX);
        const y = 18 + nd.r * (bh + gapY);
        const cur = S.kind === nd.k;
        const visited = S.path.includes(nd.k);
        const col = cur ? C.gold : visited ? C.cyan : C.line;
        boxRect(c, x, y, bw, bh, col, cur ? 'rgba(233,185,73,0.18)' : C.card2, 6);
        clampLabel(c, nd.short, x + bw / 2, y + bh / 2, cur ? C.gold : visited ? C.ink : C.mute, 'center', x + 3, x + bw - 3, MONO);
      });
      // Dictionary node
      const dy = 18 + 2 * (bh + gapY);
      const isDict = S.kind === 'DICTIONARY_ELEMENTS';
      boxRect(c, pad, dy, w - 2 * pad, bh, isDict ? C.red : C.line, isDict ? 'rgba(240,122,109,0.18)' : C.card2, 6);
      clampLabel(c, 'DICTIONARY_ELEMENTS', w / 2, dy + bh / 2, isDict ? C.red : C.mute, 'center', pad + 6, w - pad - 6, MONO);

      // Backing store strip at bottom
      const sy = h - 54;
      clampLabel(c, `${t('ch7.cv.back')} (${S.kind})`, pad, sy - 14, C.mute, 'left', pad, w - pad);
      const previewCount = S.dict ? 4 : Math.min(8, S.elements.length);
      const cellW = (w - 2 * pad) / Math.max(1, previewCount);
      for (let i = 0; i < previewCount; i++) {
        const cx = pad + i * cellW;
        const val = S.dict ? (i === 3 ? '[100000]:1' : `[${i}]:${i + 1}`) : (S.elements[i] === undefined ? 'the_hole' : String(S.elements[i]));
        const isHole = val === 'the_hole';
        boxRect(c, cx, sy, Math.max(10, cellW - 4), 34, isHole ? C.red : C.green, isHole ? 'rgba(240,122,109,0.15)' : 'rgba(122,214,160,0.1)', 4);
        clampLabel(c, val, cx + (cellW - 4) / 2, sy + 17, isHole ? C.red : C.ink, 'center', cx + 2, cx + cellW - 6, MONO);
      }
    },
  });
  $('#c7PushSmi').addEventListener('click', () => { S = M.applyArrayOp(S, 'push_smi'); sync(); });
  $('#c7PushDbl').addEventListener('click', () => { S = M.applyArrayOp(S, 'push_double'); sync(); });
  $('#c7Hole').addEventListener('click', () => { S = M.applyArrayOp(S, 'make_hole'); sync(); });
  $('#c7PushStr').addEventListener('click', () => { S = M.applyArrayOp(S, 'push_string'); sync(); });
  $('#c7Shrink').addEventListener('click', () => { S = M.applyArrayOp(S, 'shrink_len'); sync(); });
  $('#c7Sparse').addEventListener('click', () => { S = M.applyArrayOp(S, 'make_sparse'); sync(); });
  $('#c7Reset').addEventListener('click', () => { S = M.createArrayState(); sync(); });
  langHooks.push(sync); sync();
})();

/* ═════════ ch8: Orinoco Generational & Concurrent GC ═════════ */
(function ch8() {
  const cv = $('#c8Cv'), allocEl = $('#c8Alloc'), survEl = $('#c8Surv');
  let S = M.createGCState({ allocRateKiB: 96, survivalPct: 20, youngMode: 'scavenger' });
  function sync() {
    const alloc = +allocEl.value, surv = +survEl.value;
    sliderOut('c8Alloc', alloc + ' KiB');
    sliderOut('c8Surv', surv + '%');
    put('#c8New', `${fmt(S.newUsedKiB, 0)} / ${S.newCapKiB} KiB`);
    put('#c8Old', `${fmt(S.oldUsedKiB, 0)} / ${S.oldCapKiB} KiB`);
    put('#c8Pause', t('u.ms', { v: fmt(S.lastPauseMs, 2) }));
    put('#c8Max', t('u.ms', { v: fmt(S.maxPauseMs, 2) }));
    putHTML('#c8Say', t('ch8.say.' + S.sayKey, {
      p: fmt(S.lastPauseMs, 2),
      old: fmt(S.oldUsedKiB, 0),
      wb: fmt(S.rememberedRefs, 0),
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const pad = 16;
      // Top bars: NewSpace and OldSpace
      const barW = (w - 3 * pad) / 2;
      const drawBar = (x, labelTxt, used, cap, col) => {
        clampLabel(c, `${labelTxt}: ${fmt(used, 0)}/${cap} KiB`, x, 16, col, 'left', x, x + barW);
        boxRect(c, x, 28, barW, 20, C.line, C.card2, 4);
        const fillW = Math.min(barW - 2, ((used / cap) * (barW - 2)));
        c.fillStyle = col; c.fillRect(x + 1, 29, fillW, 18);
      };
      drawBar(pad, t('ch8.cv.newbar'), S.newUsedKiB, S.newCapKiB, C.cyan);
      drawBar(pad * 2 + barW, t('ch8.cv.oldbar'), S.oldUsedKiB, S.oldCapKiB, C.violet);

      // Pause history chart below
      const f = {
        L: 52, R: w - 14, T: 78, B: h - 42,
        X: i => 52 + (w - 66) * (i / Math.max(1, S.history.length - 1)),
        Y: ms => (h - 42) - ((h - 42) - 78) * (Math.min(28, ms) / 28),
      };
      axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
      yTicks(c, f, [[0, '0'], [5, '5'], [15, '15'], [25, '25']]);
      const bw = Math.max(6, (f.R - f.L) / 32);
      S.history.forEach((pt, idx) => {
        const px = f.X(idx) - bw / 2;
        const py = f.Y(pt.pauseMs);
        const col = pt.event === 'major' ? C.red : pt.event === 'minorms' ? C.green : C.gold;
        if (pt.pauseMs > 0) {
          c.fillStyle = col;
          c.fillRect(px, py, bw, Math.max(2, f.B - py));
        }
      });
    },
  });
  function stepN(n, forceMajor) {
    const allocRateKiB = +allocEl.value, survivalPct = +survEl.value, youngMode = radioVal('c8Mode') || 'scavenger';
    for (let i = 0; i < n; i++) S = M.stepGC(S, { allocRateKiB, survivalPct, youngMode, forceMajor: forceMajor && i === 0 });
    sync();
  }
  rangeLab('#c8Alloc', sync); rangeLab('#c8Surv', sync);
  onAll($$('input[name=c8Mode]'), 'change', () => { S = M.stepGC(S, { youngMode: radioVal('c8Mode') || 'scavenger', allocRateKiB: +allocEl.value, survivalPct: +survEl.value }); sync(); });
  $('#c8Step').addEventListener('click', () => stepN(10, false));
  $('#c8Major').addEventListener('click', () => stepN(1, true));
  $('#c8Reset').addEventListener('click', () => { S = M.createGCState({ allocRateKiB: +allocEl.value, survivalPct: +survEl.value, youngMode: radioVal('c8Mode') || 'scavenger' }); sync(); });
  langHooks.push(sync); sync();
})();

/* ═════════ ch9: Event Loop & Microtask Seam ═════════ */
(function ch9() {
  const cv = $('#c9Cv');
  let S = M.createLoopState('standard', 2);
  function sync() {
    const remMicro = S.nextTickQ.length + S.microQ.length;
    const remMacro = S.macroCheckQ.length + S.macroTimerQ.length;
    put('#c9Phase', t('ch9.phase.' + S.phase));
    put('#c9Micro', fmt(remMicro, 0));
    put('#c9Macro', fmt(remMacro, 0));
    put('#c9Done', fmt(S.executed.length, 0));
    putHTML('#c9Say', t('ch9.say.' + S.sayKey, {
      step: String(S.step),
      phase: t('ch9.phase.' + S.phase),
      order: S.executed.join(' -> '),
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const pad = 12, colGap = 10;
      const qTop = 14, qTotalH = h - 78;
      const cols = [
        { title: t('ch9.cv.stack'), items: S.callStack, col: C.green },
        { title: t('ch9.cv.next'), items: S.nextTickQ, col: C.gold },
        { title: t('ch9.cv.micro'), items: S.microQ, col: C.cyan },
        { title: t('ch9.cv.macro'), items: [...S.macroCheckQ, ...S.macroTimerQ], col: C.violet },
      ];
      if (w < 500) {
        const bw = (w - 2 * pad - colGap) / 2;
        const bh = Math.floor((qTotalH - 8) / 2);
        cols.forEach((col, i) => {
          const cx = i % 2, cy = Math.floor(i / 2);
          const x = pad + cx * (bw + colGap), y = qTop + cy * (bh + 8);
          boxRect(c, x, y, bw, bh, col.col, C.card2, 8);
          clampLabel(c, col.title, x + bw / 2, y + 13, col.col, 'center', x + 4, x + bw - 4);
          col.items.slice(0, 2).forEach((item, k) => {
            const iy = y + 26 + k * 21;
            if (iy + 18 <= y + bh - 3) {
              boxRect(c, x + 5, iy, bw - 10, 18, col.col, 'rgba(255,255,255,0.04)', 4);
              clampLabel(c, item, x + bw / 2, iy + 9, C.ink, 'center', x + 7, x + bw - 7, MONO);
            }
          });
        });
      } else {
        const bw = (w - 2 * pad - 3 * colGap) / 4;
        const qH = qTotalH;
        cols.forEach((col, i) => {
          const x = pad + i * (bw + colGap);
          boxRect(c, x, qTop, bw, qH, col.col, C.card2, 8);
          clampLabel(c, col.title, x + bw / 2, qTop + 16, col.col, 'center', x + 4, x + bw - 4);
          col.items.slice(0, 5).forEach((item, k) => {
            const iy = qTop + 34 + k * 24;
            if (iy + 20 <= qTop + qH - 4) {
              boxRect(c, x + 6, iy, bw - 12, 20, col.col, 'rgba(255,255,255,0.04)', 4);
              clampLabel(c, item, x + bw / 2, iy + 10, C.ink, 'center', x + 8, x + bw - 8, MONO);
            }
          });
        });
      }

      // Bottom execution trace ribbon
      const ty = h - 54;
      boxRect(c, pad, ty, w - 2 * pad, 42, S.starved ? C.red : C.line, C.card2, 8);
      const trace = S.executed.length ? S.executed.join(' -> ') : '...';
      clampLabel(c, `${t('ch9.cv.exec')}: ${trace}`, pad + 10, ty + 21, S.starved ? C.red : C.ink, 'left', pad + 8, w - pad - 8, MONO);
    },
  });
  $('#c9Step').addEventListener('click', () => { S = M.stepLoopState(S); sync(); });
  $('#c9Reset').addEventListener('click', () => { S = M.createLoopState(radioVal('c9Scen') || 'standard', 2); sync(); });
  onAll($$('input[name=c9Scen]'), 'change', () => { S = M.createLoopState(radioVal('c9Scen') || 'standard', 2); sync(); });
  langHooks.push(sync); sync();
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
