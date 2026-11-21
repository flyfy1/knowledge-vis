/* How Chromium Renders a Web Page: i18n runtime, wiring, and 2D canvas models.
   All visible text comes from copy.*.js (generated from content.<lang>.md by scripts/build-pages.cjs);
   static diagrams are inline SVG partials (figures/dg-*.html). Nothing animates on an unrequested timer,
   so prefers-reduced-motion needs no special branch. */
(() => {
  'use strict';
  const M = window.ChromiumRenderModels;
  const COPY = window.ESSAY_COPY || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const C = {
    bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8',
    gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb',
    dimfill: '#3a4254', card2: '#1a1f2b'
  };
  const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';

  /* ───────── language ───────── */
  const LS = 'knowledge-lang';
  let memLang = null;
  function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
  function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
  let lang = readLang();
  if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  const enStub = !COPY.en || document.documentElement.dataset.langEn === 'stub';
  const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
  const effLang = () => (hasLang(lang) ? lang : 'zh');
  function t(key, vars) {
    const L = effLang();
    let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
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
  $$('#langToggle button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    writeLang(lang);
    applyLang();
  }));

  /* ───────── canvas + on-screen registry ───────── */
  function fit(cv) {
    const r = cv.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(r.width * d));
    const H = Math.max(1, Math.round(r.height * d));
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
    o.cvs = [].concat(cvs);
    o.vis = false;
    o.dirty = true;
    sims.push(o);
    o.cvs.forEach(cv => io.observe(cv));
    return o;
  }
  window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
  function loop() {
    for (const s of sims) if (s.vis && s.dirty) { s.dirty = false; s.draw(); }
    requestAnimationFrame(loop);
  }

  const radioVal = name => {
    const r = document.querySelector(`input[name=${name}]:checked`);
    return r ? r.value : null;
  };
  const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
  const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
  const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
  const sliderOut = (id, s) => put('#' + id + 'o', s);
  function rangeLab(sel, fn) {
    const e = $(sel);
    e.addEventListener('input', fn);
    e.addEventListener('change', fn);
    return e;
  }
  const chkLab = (sel, fn) => $(sel).addEventListener('change', fn);

  /* ───────── chart & label helpers ───────── */
  function frame(w, h, m, x0, x1, y0, y1) {
    const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
    return {
      L, R, T, B,
      X: x => L + (R - L) * (x - x0) / Math.max(1e-9, x1 - x0),
      Y: y => B - (B - T) * (y - y0) / Math.max(1e-9, y1 - y0)
    };
  }
  function clipText(c, str, maxW) {
    const s = String(str);
    if (maxW <= 12) return '';
    if (c.measureText(s).width <= maxW) return s;
    let lo = 0, hi = s.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (c.measureText(s.slice(0, mid) + '…').width <= maxW) lo = mid;
      else hi = mid - 1;
    }
    return lo <= 0 ? s.slice(0, 1) : s.slice(0, lo) + '…';
  }
  function fitText(c, s, maxW, base) {
    base = base || 12;
    let fs = base;
    c.font = FONT.replace('12px', fs + 'px');
    while (c.measureText(s).width > maxW && fs > 10) {
      fs -= 0.5;
      c.font = FONT.replace('12px', fs + 'px');
    }
  }
  function label(c, s, x, y, col, align, x0, x1) {
    c.font = FONT;
    c.fillStyle = col;
    const minX = x0 == null ? 4 : x0;
    const maxX = x1 == null ? (c.canvas.clientWidth || 300) - 4 : x1;
    const str = clipText(c, s, Math.max(16, maxX - minX));
    const w = c.measureText(str).width;
    let left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    left = Math.max(minX, Math.min(left, maxX - w));
    c.textAlign = 'left';
    c.fillText(str, left, y);
    return { l: left, r: left + w };
  }
  function axes(c, f, xLab, yLab) {
    c.strokeStyle = C.line;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(f.L, f.T);
    c.lineTo(f.L, f.B);
    c.lineTo(f.R, f.B);
    c.stroke();
    c.fillStyle = C.mute;
    c.font = FONT;
    if (yLab) {
      c.textAlign = 'left';
      const s = clipText(c, yLab, Math.max(24, f.R - f.L - 8));
      fitText(c, s, f.R - f.L - 8);
      c.fillText(s, f.L + 6, Math.max(10, f.T - 12));
      c.font = FONT;
    }
    if (xLab) {
      c.textAlign = 'right';
      const s = clipText(c, xLab, Math.max(24, f.R - f.L - 8));
      fitText(c, s, f.R - f.L - 8);
      c.fillText(s, f.R, f.B + 30);
      c.font = FONT;
    }
  }
  function xTicks(c, f, items) {
    c.fillStyle = C.mute;
    c.font = FONT;
    c.textAlign = 'center';
    let lastR = -Infinity;
    for (const [x, s] of items) {
      const px = f.X(x);
      if (px < f.L - 1 || px > f.R + 1) continue;
      const w = c.measureText(s).width;
      const cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2);
      if (cx - w / 2 < lastR + 8) continue;
      c.fillText(s, cx, f.B + 13);
      lastR = cx + w / 2;
      c.strokeStyle = C.line;
      c.beginPath();
      c.moveTo(px, f.B);
      c.lineTo(px, f.B + 4);
      c.stroke();
    }
  }
  function yTicks(c, f, items) {
    c.fillStyle = C.mute;
    c.font = FONT;
    c.textAlign = 'right';
    let lastY = Infinity;
    for (const [y, s] of items) {
      const py = f.Y(y);
      if (py > lastY - 15 || py < f.T - 2 || py > f.B + 2) continue;
      c.fillText(s, f.L - 6, py);
      lastY = py;
      c.strokeStyle = C.grid;
      c.beginPath();
      c.moveTo(f.L + 1, py);
      c.lineTo(f.R, py);
      c.stroke();
    }
  }
  function rrect(c, x, y, w, h, r, fill, stroke) {
    c.beginPath();
    c.roundRect(x, y, Math.max(0, w), Math.max(0, h), r || 4);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.2; c.stroke(); }
  }

  /* ═════════ ch2: HTML parser & PreloadScanner timeline ═════════ */
  (function ch2() {
    const cv = $('#c2Cv'), cssS = $('#c2Css'), jsS = $('#c2Js'), preChk = $('#c2Preload');
    let S = null;
    function update() {
      const mode = radioVal('c2Mode');
      const cssMs = +cssS.value, jsMs = +jsS.value, preload = preChk.checked;
      S = M.simulateParseTimeline({ mode, cssMs, jsMs, preload });
      sliderOut('c2Css', t('u.ms', { v: fmt(cssMs, 0) }));
      sliderOut('c2Js', t('u.ms', { v: fmt(jsMs, 0) }));
      put('#c2Fp', t('u.ms', { v: fmt(S.firstPaint, 0) }));
      put('#c2Dcl', t('u.ms', { v: fmt(S.domContentLoaded, 0) }));
      put('#c2Blk', t('u.ms', { v: fmt(S.parserBlockedMs, 0) }));
      put('#c2Pre', t('u.ms', { v: fmt(S.preloadSavedMs, 0) }));
      putHTML('#c2Say', t('ch2.say.' + S.sayKey, {
        jsf: fmt(S.jsFetchEnd, 0),
        cssEnd: fmt(S.cssEnd, 0),
        jsEnd: fmt(S.jsExecEnd, 0),
        blk: fmt(S.parserBlockedMs, 0),
        dcl: fmt(S.domContentLoaded, 0),
        fp: fmt(S.firstPaint, 0),
        pre: fmt(S.preloadSavedMs, 0),
        htmlEnd: fmt(S.htmlEnd, 0)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const leftW = w < 480 ? 84 : 114;
        const maxT = Math.max(120, Math.ceil(Math.max(S.firstPaint, S.domContentLoaded, S.jsExecEnd) / 20) * 20 + 10);
        const F = frame(w, h, [32, 16, 44, leftW], 0, maxT, 0, 3);
        const ticks = [];
        const step = maxT > 200 ? 50 : maxT > 120 ? 30 : 20;
        for (let x = 0; x <= maxT; x += step) ticks.push([x, String(x)]);
        xTicks(c, F, ticks);
        axes(c, F, t('ch2.cv.x'));

        const laneH = (F.B - F.T - 12) / 3;
        const barH = Math.min(26, laneH * 0.56);
        const drawLane = (idx, lblKey, bars) => {
          const cy = F.T + 6 + (idx + 0.5) * laneH;
          label(c, t(lblKey), 8, cy, C.mute, 'left', 6, leftW - 8);
          c.strokeStyle = C.grid;
          c.beginPath(); c.moveTo(F.L, cy); c.lineTo(F.R, cy); c.stroke();
          for (const b of bars) {
            const x0 = F.X(b.x0), x1 = F.X(b.x1);
            const col = b.kind === 'parse' ? C.cyan : b.kind === 'css' ? C.violet : b.kind === 'blocked' ? C.red : C.gold;
            const alpha = b.kind === 'preload' ? 0.55 : 0.85;
            c.globalAlpha = alpha;
            rrect(c, x0, cy - barH / 2, Math.max(2, x1 - x0), barH, 4, col);
            c.globalAlpha = 1;
          }
        };
        drawLane(0, 'ch2.cv.tHtml', S.tracks.html);
        drawLane(1, 'ch2.cv.tCss', S.tracks.css);
        drawLane(2, 'ch2.cv.tJs', S.tracks.jsFetch.concat(S.tracks.jsExec));

        const xFp = F.X(S.firstPaint), xDcl = F.X(S.domContentLoaded);
        c.setLineDash([4, 3]);
        c.strokeStyle = C.green; c.beginPath(); c.moveTo(xFp, F.T); c.lineTo(xFp, F.B); c.stroke();
        c.strokeStyle = C.cyan; c.beginPath(); c.moveTo(xDcl, F.T); c.lineTo(xDcl, F.B); c.stroke();
        c.setLineDash([]);
        // Place milestone labels cleanly so FP and DCL never collide at narrow widths
        if (Math.abs(xFp - xDcl) < 12) {
          label(c, t('ch2.cv.tFp') + ' / ' + t('ch2.cv.tDcl'), xFp, 14, C.green, 'center', F.L, F.R);
        } else if (Math.abs(xFp - xDcl) < 96) {
          label(c, t('ch2.cv.tFp'), xFp, 10, C.green, 'center', F.L, F.R);
          label(c, t('ch2.cv.tDcl'), xDcl, 23, C.cyan, 'center', F.L, F.R);
        } else {
          label(c, t('ch2.cv.tFp'), xFp, 14, C.green, 'center', F.L, F.R);
          label(c, t('ch2.cv.tDcl'), xDcl, 14, C.cyan, 'center', F.L, F.R);
        }
      }
    });
    onAll($$('input[name=c2Mode]'), 'change', update);
    rangeLab('#c2Css', update);
    rangeLab('#c2Js', update);
    chkLab('#c2Preload', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch3: Right-to-Left Style Calculation & Bloom/InvalidationSet ═════════ */
  (function ch3() {
    const cv = $('#c3Cv'), nodesS = $('#c3Nodes'), rulesS = $('#c3Rules'), smartChk = $('#c3Smart');
    let S = null;
    function update() {
      const selectorKind = radioVal('c3Sel');
      const domNodes = +nodesS.value, ruleCount = +rulesS.value, smartEngine = smartChk.checked;
      S = M.simulateStyleCalc({ selectorKind, domNodes, ruleCount, smartEngine });
      sliderOut('c3Nodes', fmt(domNodes, 0));
      sliderOut('c3Rules', fmt(ruleCount, 0));
      put('#c3Inv', t('u.nodes', { v: fmt(S.invalidatedNodes, 0) }));
      put('#c3Chk', fmt(S.keyChecks, 0));
      put('#c3Blm', fmt(S.bloomRejects, 0));
      put('#c3Ms', t('u.ms', { v: fmt(S.estMs, 2) }));
      putHTML('#c3Say', t('ch3.say.' + S.sayKey, {
        inv: fmt(S.invalidatedNodes, 0),
        chk: fmt(S.keyChecks, 0),
        blm: fmt(S.bloomRejects, 0),
        walk: fmt(S.ancestorWalks, 0),
        ms: fmt(S.estMs, 2)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const stacked = w < 520;
        const treeBox = stacked ? { x: 10, y: 8, w: w - 20, h: h * 0.38 } : { x: 12, y: 12, w: w * 0.38, h: h - 24 };
        const chartBox = stacked ? { x: 10, y: h * 0.42, w: w - 20, h: h * 0.56 } : { x: w * 0.42, y: 12, w: w * 0.56, h: h - 24 };

        // Left/Top: Synthetic DOM node grid
        label(c, t('ch3.cv.treeHdr'), treeBox.x, treeBox.y + 8, C.mute, 'left', treeBox.x, treeBox.x + treeBox.w);
        const cols = stacked ? 9 : 6;
        const gx0 = treeBox.x + 4, gy0 = treeBox.y + 24;
        const cw = Math.floor((treeBox.w - 8) / cols);
        const ch = Math.floor((treeBox.h - 28) / (stacked ? 2 : 3));
        const r = Math.max(4, Math.min(8, Math.min(cw, ch) * 0.3));
        S.sampleNodes.forEach((nd, idx) => {
          const col = idx % cols, row = Math.floor(idx / cols);
          const cx = gx0 + (col + 0.5) * cw, cy = gy0 + (row + 0.5) * ch;
          const fill = nd.matched ? C.cyan : nd.dirty ? C.gold : C.dimfill;
          c.fillStyle = fill;
          c.beginPath(); c.arc(cx, cy, r, 0, 6.283); c.fill();
        });

        // Right/Bottom: Horizontal 4-bar breakdown
        label(c, t('ch3.cv.costHdr'), chartBox.x, chartBox.y + 8, C.mute, 'left', chartBox.x, chartBox.x + chartBox.w);
        const items = [
          { key: 'ch3.cv.inv', val: S.invalidatedNodes, col: C.cyan },
          { key: 'ch3.cv.chk', val: S.keyChecks, col: C.gold },
          { key: 'ch3.cv.blm', val: S.bloomRejects, col: C.green },
          { key: 'ch3.cv.walk', val: S.ancestorWalks, col: C.red }
        ];
        const maxV = Math.max(50, ...items.map(it => it.val));
        const lblW = w < 440 ? 84 : 108;
        const valW = 54;
        const barAreaW = Math.max(40, chartBox.w - lblW - valW - 12);
        const rowH = (chartBox.h - 28) / items.length;
        items.forEach((it, idx) => {
          const cy = chartBox.y + 26 + (idx + 0.5) * rowH;
          label(c, t(it.key), chartBox.x, cy, C.mute, 'left', chartBox.x, chartBox.x + lblW - 6);
          const bx = chartBox.x + lblW;
          const bw = Math.max(2, (it.val / maxV) * barAreaW);
          rrect(c, bx, cy - 8, barAreaW, 16, 4, C.card2);
          rrect(c, bx, cy - 8, bw, 16, 4, it.col);
          label(c, fmt(it.val, 0), bx + barAreaW + 6, cy, it.col, 'left', bx + barAreaW + 4, chartBox.x + chartBox.w);
        });
      }
    });
    onAll($$('input[name=c3Sel]'), 'change', update);
    rangeLab('#c3Nodes', update);
    rangeLab('#c3Rules', update);
    chkLab('#c3Smart', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch4: LayoutNG & Forced Synchronous Layout Thrashing ═════════ */
  (function ch4() {
    const cv = $('#c4Cv'), itemsS = $('#c4Items'), treeS = $('#c4Tree');
    let S = null;
    function update() {
      const pattern = radioVal('c4Pat');
      const itemCount = +itemsS.value, treeNodes = +treeS.value;
      S = M.simulateLayoutThrashing({ pattern, itemCount, treeNodes });
      sliderOut('c4Items', fmt(itemCount, 0));
      sliderOut('c4Tree', fmt(treeNodes, 0));
      put('#c4Ref', fmt(S.forcedReflows, 0));
      put('#c4Ms', t('u.ms', { v: fmt(S.layoutWorkMs, 2) }));
      put('#c4B60', t('u.pct', { v: fmt(S.budget60Pct, 1) }));
      put('#c4B120', t('u.pct', { v: fmt(S.budget120Pct, 1) }));
      putHTML('#c4Say', t('ch4.say.' + S.sayKey, {
        ref: fmt(S.forcedReflows, 0),
        ms: fmt(S.layoutWorkMs, 2),
        b60: fmt(S.budget60Pct, 1),
        b120: fmt(S.budget120Pct, 1)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const totalMs = S.spans.length ? S.spans[S.spans.length - 1].t1 : 1;
        const maxX = Math.max(20, Math.ceil(Math.max(totalMs, 18) / 5) * 5);
        const F = frame(w, h, [46, 18, 44, 24], 0, maxX, 0, 2);
        const step = maxX > 60 ? 20 : maxX > 25 ? 10 : 5;
        const ticks = [];
        for (let x = 0; x <= maxX; x += step) ticks.push([x, String(x)]);
        xTicks(c, F, ticks);
        axes(c, F, t('ch4.cv.x'));

        // VSync deadline lines (120 Hz = 8.33 ms, 60 Hz = 16.67 ms)
        const x120 = F.X(M.DISPLAY_BUDGETS[120]), x60 = F.X(M.DISPLAY_BUDGETS[60]);
        c.setLineDash([4, 3]);
        c.strokeStyle = C.violet; c.beginPath(); c.moveTo(x120, F.T); c.lineTo(x120, F.B); c.stroke();
        c.strokeStyle = C.gold; c.beginPath(); c.moveTo(x60, F.T); c.lineTo(x60, F.B); c.stroke();
        c.setLineDash([]);

        // Stagger 120 Hz and 60 Hz labels vertically so they never touch at narrow widths
        label(c, t('ch4.cv.b120'), x120, 11, C.violet, 'left', F.L, F.R);
        label(c, t('ch4.cv.b60'), x60, 29, C.gold, 'left', F.L, F.R);

        const yTop = F.T + (F.B - F.T) * 0.28;
        const barH = Math.min(42, (F.B - F.T) * 0.44);
        for (const sp of S.spans) {
          const x0 = F.X(sp.t0), x1 = F.X(sp.t1);
          const col = sp.kind === 'js' ? C.cyan : sp.kind === 'reflow' ? C.red : sp.kind === 'contained' ? C.gold : C.green;
          rrect(c, x0, yTop, Math.max(1.2, x1 - x0), barH, 2, col);
        }
        const botY = yTop + barH + 16;
        const legendTxt = S.pattern === 'batched'
          ? t('ch4.cv.js') + ' + ' + t('ch4.cv.layout')
          : t('ch4.cv.js') + ' / ' + t('ch4.cv.reflow');
        label(c, legendTxt, F.L, botY, C.mute, 'left', F.L, F.R);
      }
    });
    onAll($$('input[name=c4Pat]'), 'change', update);
    rangeLab('#c4Items', update);
    rangeLab('#c4Tree', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch5: Pre-Paint & 4 Property Trees ═════════ */
  (function ch5() {
    const cv = $('#c5Cv'), txS = $('#c5Tx'), syS = $('#c5Sy'), opS = $('#c5Op'), clipChk = $('#c5Clip');
    let S = null;
    function update() {
      const changeType = radioVal('c5Prop');
      const tx = +txS.value, scrollY = +syS.value, opacity = +opS.value, clipOn = clipChk.checked;
      S = M.evaluatePropertyTrees({ changeType, tx, scrollY, opacity, clipOn });
      sliderOut('c5Tx', t('u.px', { v: fmt(tx, 0) }));
      sliderOut('c5Sy', t('u.px', { v: fmt(scrollY, 0) }));
      sliderOut('c5Op', fmt(opacity, 2));
      put('#c5Pos', `(${fmt(S.screenX, 0)}, ${fmt(S.screenY, 0)})`);
      put('#c5Alpha', fmt(S.effectiveAlpha, 2));
      put('#c5Vis', t('u.pct', { v: fmt(S.visibleAreaPct, 0) }));
      put('#c5Stg', t(S.blinkStagesRerun > 0 ? 'ch5.stg.blink' : 'ch5.stg.comp'));
      putHTML('#c5Say', t('ch5.say.' + S.sayKey, {
        x: fmt(S.screenX, 0),
        y: fmt(S.screenY, 0),
        sy: fmt(S.scrollY, 0),
        alpha: fmt(S.effectiveAlpha, 2),
        vis: fmt(S.visibleAreaPct, 0),
        stg: t('ch5.stg.blink')
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const stacked = w < 520;
        const treeBox = stacked ? { x: 10, y: 8, w: w - 20, h: h * 0.44 } : { x: 12, y: 14, w: w * 0.43, h: h - 28 };
        const viewBox = stacked ? { x: 10, y: h * 0.48, w: w - 20, h: h * 0.50 } : { x: w * 0.47, y: 14, w: w * 0.50, h: h - 28 };

        // Left/Top: 2x2 grid of Property Tree nodes
        const nodes = [
          { id: 'transform', key: 'ch5.cv.tTransform', col: C.gold },
          { id: 'clip', key: 'ch5.cv.tClip', col: C.cyan },
          { id: 'effect', key: 'ch5.cv.tEffect', col: C.violet },
          { id: 'scroll', key: 'ch5.cv.tScroll', col: C.green }
        ];
        const cw = (treeBox.w - 8) / 2, ch = (treeBox.h - 8) / 2;
        nodes.forEach((nd, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const x = treeBox.x + col * (cw + 8), y = treeBox.y + row * (ch + 8);
          const isDirty = S.dirtyTree === nd.id || (S.dirtyTree === 'layout' && (nd.id === 'transform' || nd.id === 'clip'));
          const stroke = isDirty ? (S.dirtyTree === 'layout' ? C.red : C.gold) : C.line;
          const bg = isDirty ? (S.dirtyTree === 'layout' ? 'rgba(240,122,109,.18)' : 'rgba(233,185,73,.16)') : C.card2;
          rrect(c, x, y, cw, ch, 6, bg, stroke);
          label(c, t(nd.key), x + 8, y + ch * 0.34, isDirty ? C.ink : C.mute, 'left', x + 6, x + cw - 6);
          label(c, t(isDirty ? 'ch5.cv.dirty' : 'ch5.cv.clean'), x + 8, y + ch * 0.72, isDirty ? (S.dirtyTree === 'layout' ? C.red : C.gold) : C.mute, 'left', x + 6, x + cw - 6);
        });

        // Right/Bottom: Viewport box & clip region
        rrect(c, viewBox.x, viewBox.y, viewBox.w, viewBox.h, 8, C.bg, C.line);
        const sx = viewBox.w / 320, sy = viewBox.h / 212;
        const sc = Math.min(sx, sy);
        const ox = viewBox.x + (viewBox.w - 320 * sc) / 2;
        const oy = viewBox.y + (viewBox.h - 212 * sc) / 2;
        const cr = S.clipRect;
        if (S.clipOn) {
          c.setLineDash([4, 3]);
          rrect(c, ox + cr.x * sc, oy + cr.y * sc, cr.w * sc, cr.h * sc, 4, 'rgba(99,199,230,.06)', C.cyan);
          c.setLineDash([]);
        }
        // Unclipped dashed outline
        const bx = S.boxRect;
        c.setLineDash([3, 3]);
        rrect(c, ox + bx.x * sc, oy + bx.y * sc, bx.w * sc, bx.h * sc, 4, null, 'rgba(163,170,184,.4)');
        c.setLineDash([]);
        // Visible clipped box
        const vr = S.clippedRect;
        if (vr.w > 0 && vr.h > 0) {
          c.globalAlpha = Math.max(0.12, S.effectiveAlpha);
          rrect(c, ox + vr.x * sc, oy + vr.y * sc, vr.w * sc, vr.h * sc, 4, S.changeType === 'left' ? C.red : C.gold);
          c.globalAlpha = 1;
        }
        label(c, t('ch5.cv.clipBox'), viewBox.x + 8, viewBox.y + 12, C.cyan, 'left', viewBox.x + 6, viewBox.x + viewBox.w - 6);
      }
    });
    onAll($$('input[name=c5Prop]'), 'change', update);
    rangeLab('#c5Tx', update);
    rangeLab('#c5Sy', update);
    rangeLab('#c5Op', update);
    chkLab('#c5Clip', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch6: PaintArtifactCompositor & Layer Explosion ═════════ */
  (function ch6() {
    const cv = $('#c6Cv'), cardsS = $('#c6Cards'), sizeS = $('#c6Size'), ovChk = $('#c6Overlap');
    let S = null;
    function update() {
      const badgeMode = radioVal('c6Badge');
      const cardCount = +cardsS.value, cardSizePx = +sizeS.value, overlap = ovChk.checked;
      S = M.simulateLayerization({ cardCount, badgeMode, overlap, cardSizePx });
      sliderOut('c6Cards', fmt(cardCount, 0));
      sliderOut('c6Size', t('u.px', { v: fmt(cardSizePx, 0) }));
      put('#c6Chk', fmt(S.paintChunks, 0));
      put('#c6Lay', t('u.layers', { v: fmt(S.compositedLayers, 0) }));
      put('#c6Vram', M.bytesStr(S.vramBytes));
      put('#c6Sav', t('u.layers', { v: fmt(S.savedLayers, 0) }));
      putHTML('#c6Say', t('ch6.say.' + S.sayKey, {
        cards: fmt(S.cardCount, 0),
        lay: fmt(S.compositedLayers, 0),
        vram: fmt(S.vramMiB, 2),
        sav: fmt(S.savedLayers, 0),
        chk: fmt(S.paintChunks, 0)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const stacked = w < 520;
        const leftBox = stacked ? { x: 10, y: 8, w: w - 20, h: h * 0.50 } : { x: 12, y: 12, w: w * 0.52, h: h - 24 };
        const rightBox = stacked ? { x: 10, y: h * 0.54, w: w - 20, h: h * 0.44 } : { x: w * 0.56, y: 12, w: w * 0.42, h: h - 24 };

        // Left/Top: Composited layer slabs
        rrect(c, leftBox.x, leftBox.y + 8, leftBox.w - 16, 28, 4, 'rgba(99,199,230,.15)', C.cyan);
        label(c, t('ch6.cv.root'), leftBox.x + 8, leftBox.y + 22, C.cyan, 'left', leftBox.x + 6, leftBox.x + leftBox.w - 22);

        if (S.badgeMode !== 'static') {
          const by = S.badgeMode === 'promotedBelow' ? leftBox.y + 44 : leftBox.y + leftBox.h - 32;
          rrect(c, leftBox.x + 12, by, leftBox.w - 40, 26, 4, 'rgba(233,185,73,.2)', C.gold);
          label(c, t('ch6.cv.badge'), leftBox.x + 20, by + 13, C.gold, 'left', leftBox.x + 16, leftBox.x + leftBox.w - 34);
        }

        if (S.explodedCards > 0) {
          const nDraw = Math.min(6, S.explodedCards);
          const sy = leftBox.y + 78;
          const availH = Math.max(24, leftBox.h - 92);
          const stepY = Math.min(12, availH / (nDraw + 1));
          for (let i = 0; i < nDraw; i++) {
            rrect(c, leftBox.x + 20 + i * 5, sy + i * stepY, leftBox.w - 56, 20, 3, 'rgba(240,122,109,.22)', C.red);
          }
          label(c, t('ch6.cv.cardEach', { n: fmt(S.explodedCards, 0) }), leftBox.x + 28, sy + (nDraw - 1) * stepY + 10, C.red, 'left', leftBox.x + 24, leftBox.x + leftBox.w - 36);
        } else if (S.badgeMode !== 'static') {
          const cy = S.badgeMode === 'promotedAbove' ? leftBox.y + 44 : leftBox.y + 78;
          rrect(c, leftBox.x + 12, cy, leftBox.w - 40, 28, 4, 'rgba(122,214,160,.18)', C.green);
          label(c, t('ch6.cv.cards'), leftBox.x + 20, cy + 14, C.green, 'left', leftBox.x + 16, leftBox.x + leftBox.w - 34);
        }

        // Right/Bottom: VRAM meter bar
        label(c, t('ch6.cv.vramHdr'), rightBox.x, rightBox.y + 12, C.mute, 'left', rightBox.x, rightBox.x + rightBox.w);
        const maxMiB = 40;
        const barW = rightBox.w - 16;
        const fillW = Math.min(barW, Math.max(4, (S.vramMiB / maxMiB) * barW));
        const by = rightBox.y + (stacked ? 38 : 54);
        rrect(c, rightBox.x, by, barW, 24, 5, C.card2);
        rrect(c, rightBox.x, by, fillW, 24, 5, S.explodedCards > 0 ? C.red : C.green);
        label(c, M.bytesStr(S.vramBytes), rightBox.x, by + 38, S.explodedCards > 0 ? C.red : C.green, 'left', rightBox.x, rightBox.x + rightBox.w);
        label(c, t('u.layers', { v: fmt(S.compositedLayers, 0) }), rightBox.x, by + 58, C.ink, 'left', rightBox.x, rightBox.x + rightBox.w);
      }
    });
    onAll($$('input[name=c6Badge]'), 'change', update);
    rangeLab('#c6Cards', update);
    rangeLab('#c6Size', update);
    chkLab('#c6Overlap', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch7: cc::TileManager Tiling & Checkerboarding ═════════ */
  (function ch7() {
    const cv = $('#c7Cv'), spdS = $('#c7Spd'), skewS = $('#c7Skew'), oopChk = $('#c7Oop');
    let S = null;
    function update() {
      const tileSize = Number(radioVal('c7Tile'));
      const scrollSpeed = +spdS.value, skewportRows = +skewS.value, oopRaster = oopChk.checked;
      S = M.simulateTileRaster({ scrollSpeed, tileSize, oopRaster, skewportRows });
      sliderOut('c7Spd', t('u.pxs', { v: fmt(scrollSpeed, 0) }));
      sliderOut('c7Skew', fmt(skewportRows, 0));
      put('#c7Vis', t('u.tiles', { v: fmt(S.visibleTiles, 0) }));
      put('#c7Cap', t('u.tiles', { v: fmt(S.tilesPerFrameCap, 0) }));
      put('#c7Cb', t('u.pct', { v: fmt(S.checkerboardPct, 1) }));
      put('#c7Pk', t('u.tiles', { v: fmt(S.pendingPrepaint, 0) }));
      putHTML('#c7Say', t('ch7.say.' + S.sayKey, {
        vis: fmt(S.visibleTiles, 0),
        spd: fmt(S.scrollSpeed, 0),
        cap: fmt(S.tilesPerFrameCap, 0),
        cb: fmt(S.checkerboardPct, 1)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const sideW = w < 440 ? 96 : 140;
        const gx = 16, gy = 14;
        const gw = Math.max(80, w - gx - sideW - 16);
        const gh = h - 28;
        const cw = gw / S.cols, ch = gh / S.rows;

        for (let r = 0; r < S.rows; r++) {
          for (let col = 0; col < S.cols; col++) {
            const st = S.grid[r][col];
            const x = gx + col * cw, y = gy + r * ch;
            const fill = st === 'ready' ? 'rgba(122,214,160,.28)' : st === 'pending' ? 'rgba(233,185,73,.28)' : st === 'checker' ? 'rgba(240,122,109,.38)' : 'rgba(58,66,84,.25)';
            const stroke = st === 'checker' ? C.red : C.line;
            rrect(c, x + 1, y + 1, cw - 2, ch - 2, 2, fill, stroke);
            if (st === 'checker') {
              c.strokeStyle = 'rgba(240,122,109,.7)';
              c.beginPath(); c.moveTo(x + 2, y + 2); c.lineTo(x + cw - 2, y + ch - 2); c.stroke();
            }
          }
        }
        // Viewport outline
        const vy0 = gy + (S.scrollY / 3072) * gh;
        const vy1 = gy + ((S.scrollY + 768) / 3072) * gh;
        c.strokeStyle = C.cyan; c.lineWidth = 2;
        c.strokeRect(gx, vy0, gw, vy1 - vy0);
        const lblX = gx + gw + 10;
        label(c, t('ch7.cv.view'), lblX, (vy0 + vy1) / 2, C.cyan, 'left', lblX, w - 6);

        if (S.skewportRows > 0 && S.skewR1 > S.visR1) {
          const sy1 = gy + ((S.skewR1 + 1) / S.rows) * gh;
          c.setLineDash([4, 3]); c.strokeStyle = C.gold; c.lineWidth = 1.5;
          c.strokeRect(gx, vy1, gw, sy1 - vy1);
          c.setLineDash([]);
          const syMid = Math.max((vy0 + vy1) / 2 + 22, (vy1 + sy1) / 2);
          if (syMid < h - 10) label(c, t('ch7.cv.skew'), lblX, syMid, C.gold, 'left', lblX, w - 6);
        }
      }
    });
    onAll($$('input[name=c7Tile]'), 'change', update);
    rangeLab('#c7Spd', update);
    rangeLab('#c7Skew', update);
    chkLab('#c7Oop', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch8: Viz SurfaceAggregator & VSync pacing ═════════ */
  (function ch8() {
    const cv = $('#c8Cv'), mainS = $('#c8Main'), rasS = $('#c8Ras'), oopS = $('#c8Oop');
    let S = null;
    function update() {
      const displayHz = Number(radioVal('c8Hz'));
      const mainThreadMs = +mainS.value, rasterMs = +rasS.value, oopifCount = +oopS.value;
      S = M.simulateVizFrame({ displayHz, mainThreadMs, rasterMs, oopifCount });
      sliderOut('c8Main', t('u.ms', { v: fmt(mainThreadMs, 0) }));
      sliderOut('c8Ras', t('u.ms', { v: fmt(rasterMs, 0) }));
      sliderOut('c8Oop', fmt(oopifCount, 0));
      put('#c8Bud', t('u.ms', { v: fmt(S.budgetMs, 2) }));
      put('#c8Impl', t('u.fps', { v: fmt(S.implFps, 0) }));
      put('#c8Mfps', t('u.fps', { v: fmt(S.mainFps, 1) }));
      put('#c8Quads', fmt(S.mergedQuads, 0));
      putHTML('#c8Say', t('ch8.say.' + S.sayKey, {
        mTot: fmt(S.mainPipelineMs, 0),
        agg: fmt(S.implAggMs, 2),
        bud: fmt(S.budgetMs, 2),
        impl: fmt(S.implFps, 0),
        main: fmt(S.mainFps, 1),
        quads: fmt(S.mergedQuads, 0)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const leftW = w < 480 ? 88 : 118;
        const winMs = 42;
        const F = frame(w, h, [28, 16, 44, leftW], 0, winMs, 0, 3);
        const ticks = [];
        for (let x = 0; x <= winMs; x += 10) ticks.push([x, String(x)]);
        xTicks(c, F, ticks);
        axes(c, F, t('ch8.cv.x'));

        // VSync beats
        c.setLineDash([3, 3]);
        c.strokeStyle = C.line;
        for (let t0 = 0; t0 <= winMs + 0.1; t0 += S.budgetMs) {
          const x = F.X(t0);
          if (x <= F.R) { c.beginPath(); c.moveTo(x, F.T); c.lineTo(x, F.B); c.stroke(); }
        }
        c.setLineDash([]);
        label(c, t('ch8.cv.vsync') + ' (' + fmt(S.budgetMs, 2) + ' ms)', F.L, 12, C.mute, 'left', F.L, F.R);

        const laneH = (F.B - F.T - 8) / 2;
        const bh = Math.min(28, laneH * 0.52);

        // Lane 0: Blink Main Thread
        const y0 = F.T + 4 + laneH * 0.5;
        label(c, t('ch8.cv.main'), 8, y0, C.mute, 'left', 6, leftW - 8);
        const mDur = S.mainPipelineMs;
        const mStep = S.mainVsyncSpan * S.budgetMs;
        for (let t0 = 0; t0 < winMs; t0 += mStep) {
          const x0 = F.X(t0), x1 = F.X(Math.min(winMs, t0 + mDur));
          rrect(c, x0, y0 - bh / 2, Math.max(2, x1 - x0), bh, 4, S.mainVsyncSpan > 1 ? C.red : C.cyan);
        }

        // Lane 1: cc Impl + Viz SurfaceAggregator
        const y1 = F.T + 4 + laneH * 1.5;
        label(c, t('ch8.cv.impl'), 8, y1, C.mute, 'left', 6, leftW - 8);
        const iStep = S.implVsyncSpan * S.budgetMs;
        for (let t0 = 0; t0 < winMs; t0 += iStep) {
          const x0 = F.X(t0), x1 = F.X(Math.min(winMs, t0 + S.implAggMs));
          rrect(c, x0, y1 - bh / 2, Math.max(2, x1 - x0), bh, 4, S.implVsyncSpan > 1 ? C.red : C.green);
        }
      }
    });
    onAll($$('input[name=c8Hz]'), 'change', update);
    rangeLab('#c8Main', update);
    rangeLab('#c8Ras', update);
    rangeLab('#c8Oop', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch9: Main-thread jank vs Compositor thread isolation ═════════ */
  (function ch9() {
    const cv = $('#c9Cv'), jsS = $('#c9Js'), domS = $('#c9Dom');
    let S = null;
    function update() {
      const propMode = radioVal('c9Prop');
      const displayHz = Number(radioVal('c9Hz'));
      const jsSpikeMs = +jsS.value, domBoxes = +domS.value;
      S = M.simulateAnimationIsolation({ propMode, jsSpikeMs, domBoxes, displayHz });
      sliderOut('c9Js', t('u.ms', { v: fmt(jsSpikeMs, 0) }));
      sliderOut('c9Dom', fmt(domBoxes, 0));
      put('#c9Cost', t('u.ms', { v: fmt(S.baseFrameMs, 2) }));
      put('#c9Drop', fmt(S.droppedFrames, 0));
      put('#c9Max', t('u.ms', { v: fmt(S.maxPauseMs, 1) }));
      put('#c9Fps', t('u.fps', { v: fmt(S.effectiveFps, 1) }));
      putHTML('#c9Say', t('ch9.say.' + S.sayKey, {
        cost: fmt(S.baseFrameMs, 2),
        js: fmt(S.jsSpikeMs, 0),
        drop: fmt(S.droppedFrames, 0),
        max: fmt(S.maxPauseMs, 1),
        fps: fmt(S.effectiveFps, 1),
        bud: fmt(S.budgetMs, 2)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const splitY = Math.round(h * 0.66);
        const maxMs = Math.max(25, Math.ceil(S.maxPauseMs / 20) * 20);
        const F = frame(w, splitY, [28, 16, 40, 44], 0, 1.6, 0, maxMs);
        yTicks(c, F, [[0, '0'], [Math.round(maxMs / 2), String(Math.round(maxMs / 2))], [maxMs, String(maxMs)]]);
        xTicks(c, F, [[0, '0'], [0.4, '0.4'], [0.8, '0.8'], [1.2, '1.2'], [1.6, '1.6']]);
        axes(c, F, t('ch9.cv.x'), t('ch9.cv.ms'));

        // Frame bars
        const bw = Math.max(1.2, (F.R - F.L) / S.frames.length - 0.5);
        for (const fr of S.frames) {
          if (fr.ms <= 0) continue;
          const x = F.X(fr.t / 1000);
          const y = F.Y(Math.min(maxMs, fr.ms));
          const col = fr.ms > S.budgetMs ? C.red : (S.propMode === 'transform' ? C.green : C.cyan);
          c.fillStyle = col;
          c.fillRect(x, y, bw, F.B - y);
        }

        // Budget threshold line
        const yBud = F.Y(Math.min(maxMs, S.budgetMs));
        c.setLineDash([4, 3]);
        c.strokeStyle = C.gold; c.beginPath(); c.moveTo(F.L, yBud); c.lineTo(F.R, yBud); c.stroke();
        c.setLineDash([]);
        label(c, t('ch9.cv.thresh', { v: fmt(S.budgetMs, 2) }), F.R, Math.max(F.T + 10, yBud - 10), C.gold, 'right', F.L + 50, F.R);

        // Bottom strip: Motion track (evenly spaced presented frames)
        const sy = splitY + 14;
        label(c, t('ch9.cv.box'), 16, sy, C.mute, 'left', 12, w - 12);
        const trackY = sy + 18, trackH = Math.max(14, h - trackY - 12);
        rrect(c, 16, trackY, w - 32, trackH, 6, C.card2);
        const tw = w - 44;
        for (let i = 0; i < S.frames.length; i += 2) {
          const fr = S.frames[i];
          const px = 22 + (fr.t / 1600) * tw;
          c.fillStyle = fr.dropped ? C.red : C.gold;
          c.fillRect(px, trackY + 3, 2.2, trackH - 6);
        }
      }
    });
    onAll($$('input[name=c9Prop]'), 'change', update);
    onAll($$('input[name=c9Hz]'), 'change', update);
    rangeLab('#c9Js', update);
    rangeLab('#c9Dom', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch10: Frontier (Skia Graphite + Speculation Rules) ═════════ */
  (function ch10() {
    const cv = $('#c10Cv'), cmdsS = $('#c10Cmds'), wrkS = $('#c10Wrk'), preChk = $('#c10Pre');
    let S = null;
    function update() {
      const backend = radioVal('c10Be');
      const drawCmds = +cmdsS.value, workers = +wrkS.value, prerender = preChk.checked;
      S = M.simulateFrontierPipeline({ backend, drawCmds, workers, prerender });
      sliderOut('c10Cmds', t('u.cmds', { v: fmt(drawCmds, 0) }));
      sliderOut('c10Wrk', fmt(workers, 0));
      put('#c10Rec', t('u.ms', { v: fmt(S.cpuRecordMs, 2) }));
      put('#c10Ovr', t('u.pct', { v: fmt(S.overdrawRejectedPct, 0) }));
      put('#c10Nav', t('u.ms', { v: fmt(S.navToPaintMs, 1) }));
      put('#c10Thr', fmt(S.threadsActive, 0));
      putHTML('#c10Say', t('ch10.say.' + S.sayKey, {
        thr: fmt(S.threadsActive, 0),
        rec: fmt(S.cpuRecordMs, 2),
        rej: fmt(S.overdrawRejectedPct, 0),
        ovr: fmt(S.overdrawPct, 0),
        nav: fmt(S.navToPaintMs, 1)
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const lblW = w < 480 ? 104 : 154;
        const valW = 68;
        const barW = Math.max(40, w - lblW - valW - 22);
        const rows = [
          { key: 'ch10.cv.cpu', val: S.cpuRecordMs, max: 18, str: t('u.ms', { v: fmt(S.cpuRecordMs, 2) }), col: S.backend === 'graphite' ? C.green : C.red },
          { key: 'ch10.cv.ovr', val: S.overdrawPct, max: 50, str: t('u.pct', { v: fmt(S.overdrawPct, 0) }), col: S.backend === 'graphite' ? C.cyan : C.gold },
          { key: 'ch10.cv.nav', val: S.navToPaintMs, max: 120, str: t('u.ms', { v: fmt(S.navToPaintMs, 1) }), col: S.prerender ? C.green : C.red }
        ];
        const rowH = (h - 20) / rows.length;
        rows.forEach((rw, i) => {
          const cy = 10 + (i + 0.5) * rowH;
          label(c, t(rw.key), 12, cy, C.mute, 'left', 10, lblW);
          const bx = lblW + 8;
          const bw = Math.min(barW, Math.max(4, (rw.val / rw.max) * barW));
          rrect(c, bx, cy - 9, barW, 18, 4, C.card2);
          rrect(c, bx, cy - 9, bw, 18, 4, rw.col);
          label(c, rw.str, bx + barW + 8, cy, rw.col, 'left', bx + barW + 6, w - 8);
        });
      }
    });
    onAll($$('input[name=c10Be]'), 'change', update);
    rangeLab('#c10Cmds', update);
    rangeLab('#c10Wrk', update);
    chkLab('#c10Pre', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ boot ═════════ */
  applyLang();
  requestAnimationFrame(loop);
  window.__essayReady = true;
})();
