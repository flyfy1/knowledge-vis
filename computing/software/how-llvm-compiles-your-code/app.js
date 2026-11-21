/* How LLVM compiles your code: i18n runtime, IntersectionObserver-gated models, and responsive 2D canvas drawing.
   All visible strings come from copy.*.js (generated from content.<lang>.md); static diagrams live in figures/dg-*.html;
   all compiler models run directly from models.js without external libraries. Nothing animates on a timer. */
(() => {
  'use strict';
  const M = window.LlvmModels;
  const COPY = window.ESSAY_COPY || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const C = {
    bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0',
    mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
    green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b',
  };
  const REG_COLS = [C.gold, C.cyan, C.green, C.violet, '#f5a673', '#9be2f5'];
  const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const MONO = '12px ui-monospace,Menlo,Consolas,monospace';

  /* ───────── language ───────── */
  const LS = 'knowledge-lang';
  let memLang = null;
  function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
  function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* memory fallback */ } }
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
  const fmt = (x, d) => M.fmt(x, d, effLang());
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

  /* ───────── canvas + on-screen registry ───────── */
  function fit(cv) {
    const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
    c.clearRect(0, 0, r.width, r.height);
    return { c, w: r.width, h: r.height };
  }
  const sims = [];
  const io = new IntersectionObserver(es => es.forEach(e => {
    for (const s of sims) if (s.cvs.includes(e.target)) {
      e.target.__vis = e.isIntersecting;
      s.vis = s.cvs.some(cv => cv.__vis);
      if (s.vis) s.dirty = true;
    }
  }), { rootMargin: '60px' });
  function reg(cvs, o) {
    o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o);
    o.cvs.forEach(cv => io.observe(cv)); return o;
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

  /* chart & text clamping helpers */
  function frame(w, h, m, x0, x1, y0, y1) {
    const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
    return {
      L, R, T, B,
      X: x => L + (R - L) * (x - x0) / ((x1 - x0) || 1),
      Y: y => B - (B - T) * (y - y0) / ((y1 - y0) || 1),
    };
  }
  function fitText(c, s, maxW, base, family) {
    base = base || 12;
    let fs = base;
    const f0 = family || FONT;
    c.font = f0.replace(/^\d+(\.\d+)?px/, fs + 'px');
    while (c.measureText(s).width > maxW && fs > 9.5) {
      fs -= 0.5;
      c.font = f0.replace(/^\d+(\.\d+)?px/, fs + 'px');
    }
    return fs;
  }
  function clipText(c, s, maxW) {
    if (c.measureText(s).width <= maxW) return s;
    let out = s;
    while (out.length > 2 && c.measureText(out + '…').width > maxW) out = out.slice(0, -1);
    return out + '…';
  }
  function label(c, s, x, y, col, align, x0, x1, font) {
    c.font = font || FONT;
    c.fillStyle = col;
    const w = c.measureText(s).width;
    const minX = x0 == null ? 4 : x0, maxX = x1 == null ? c.canvas.clientWidth - 4 : x1;
    const str = w > (maxX - minX) ? clipText(c, s, maxX - minX) : s;
    const sw = c.measureText(str).width;
    let left = align === 'center' ? x - sw / 2 : align === 'right' ? x - sw : x;
    left = Math.max(minX, Math.min(left, maxX - sw));
    c.textAlign = 'left';
    c.fillText(str, left, y);
    return { l: left, r: left + sw };
  }
  function axes(c, f, xLab, yLab) {
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
    c.fillStyle = C.mute; c.font = FONT;
    if (yLab) { c.textAlign = 'left'; fitText(c, yLab, f.R - f.L - 8); c.fillText(yLab, f.L + 6, Math.max(10, f.T - 10)); c.font = FONT; }
    if (xLab) { c.textAlign = 'right'; fitText(c, xLab, f.R - f.L - 8); c.fillText(xLab, f.R, f.B + 28); c.font = FONT; }
  }
  function xTicks(c, f, items) {
    c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
    for (const [x, s] of items) {
      const px = f.X(x), w = c.measureText(s).width;
      const cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2);
      if (cx - w / 2 < lastR + 8) continue;
      c.fillText(s, cx, f.B + 13); lastR = cx + w / 2;
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke();
    }
  }
  function yTicks(c, f, items) {
    c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'right'; let lastY = Infinity;
    for (const [y, s] of items) {
      const py = f.Y(y);
      if (py > lastY - 14 || py < f.T + 4) continue;
      c.fillText(s, f.L - 6, py); lastY = py;
      c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke();
    }
  }
  function box(c, x, y, w, h, stroke, fill, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, r == null ? 6 : r);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.4; c.stroke(); }
  }
  function arrow(c, x1, y1, x2, y2, col, lw) {
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw || 1.5;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1), a = 6.5;
    c.beginPath(); c.moveTo(x2, y2);
    c.lineTo(x2 - a * Math.cos(ang - 0.45), y2 - a * Math.sin(ang - 0.45));
    c.lineTo(x2 - a * Math.cos(ang + 0.45), y2 - a * Math.sin(ang + 0.45));
    c.closePath(); c.fill();
  }
  function dot(c, x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 4.5, 0, Math.PI * 2); c.fill(); }

  /* ═════════ ch1: 3-phase decoupled matrix ═════════ */
  (function ch1() {
    const fe = $('#c1Fe'), be = $('#c1Be'), ps = $('#c1Pass'), mo = $('#c1Mono'), cv = $('#c1Cv');
    let S = null;
    function update() {
      S = M.archScale({ frontends: +fe.value, backends: +be.value, passes: +ps.value, monolithic: mo.checked });
      sliderOut('c1Fe', String(S.frontends));
      sliderOut('c1Be', String(S.backends));
      sliderOut('c1Pass', String(S.passes));
      put('#c1RM', fmt(S.monoComponents));
      put('#c1RL', fmt(S.llvmComponents));
      put('#c1RP', fmt(S.activePasses));
      put('#c1RR', t('u.x', { v: fmt(S.ratio, 1) }));
      const key = S.monolithic ? 'ch1.say.mono' : 'ch1.say.llvm';
      putHTML('#c1Say', t(key, {
        n: S.frontends, m: S.backends, p: S.passes,
        pairs: fmt(S.monoPairs), edges: fmt(S.llvmEdges),
        mp: fmt(S.monoPassImpls), lp: fmt(S.llvmPassImpls),
        mc: fmt(S.monoComponents), lc: fmt(S.llvmComponents),
        ratio: fmt(S.ratio, 1),
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const pad = 16;
        const leftW = w >= 480 ? w * 0.56 : w - pad * 2;
        const n = S.frontends, m = S.backends;

        // Top-left graph: frontends -> (hub or all-to-all) -> backends
        const gH = w >= 480 ? h - 28 : h * 0.54;
        label(c, S.monolithic ? t('ch1.cv.mono') : t('ch1.cv.llvm'), pad, 14, S.monolithic ? C.red : C.cyan, 'left', pad, pad + leftW);

        const xFe = pad + 18, xBe = pad + leftW - 34, xHub = (xFe + xBe) / 2;
        const y0 = 32, y1 = gH - 12;
        const feY = i => n === 1 ? (y0 + y1) / 2 : y0 + i * (y1 - y0) / (n - 1);
        const beY = j => m === 1 ? (y0 + y1) / 2 : y0 + j * (y1 - y0) / (m - 1);

        if (S.monolithic) {
          c.strokeStyle = 'rgba(240,122,109,0.42)'; c.lineWidth = 1.2;
          for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
            c.beginPath(); c.moveTo(xFe + 14, feY(i)); c.lineTo(xBe - 14, beY(j)); c.stroke();
          }
        } else {
          c.strokeStyle = 'rgba(99,199,230,0.65)'; c.lineWidth = 1.5;
          for (let i = 0; i < n; i++) {
            c.beginPath(); c.moveTo(xFe + 14, feY(i)); c.lineTo(xHub - 26, (y0 + y1) / 2); c.stroke();
          }
          c.strokeStyle = 'rgba(122,214,160,0.65)';
          for (let j = 0; j < m; j++) {
            c.beginPath(); c.moveTo(xHub + 26, (y0 + y1) / 2); c.lineTo(xBe - 14, beY(j)); c.stroke();
          }
          box(c, xHub - 26, (y0 + y1) / 2 - 20, 52, 40, C.cyan, 'rgba(99,199,230,0.18)', 6);
          label(c, 'LLVM IR', xHub, (y0 + y1) / 2, C.cyan, 'center', xHub - 25, xHub + 25, MONO);
        }
        for (let i = 0; i < n; i++) {
          dot(c, xFe + 8, feY(i), C.gold, 6);
          label(c, 'F' + (i + 1), xFe - 12, feY(i), C.gold, 'left', 4, xFe + 4, MONO);
        }
        for (let j = 0; j < m; j++) {
          dot(c, xBe - 8, beY(j), C.green, 6);
          label(c, 'B' + (j + 1), xBe + 4, beY(j), C.green, 'left', xBe, w - 4, MONO);
        }

        // Right / bottom bar comparison: components needed
        const bx = w >= 480 ? pad + leftW + 18 : pad;
        const bw = w >= 480 ? w - bx - pad : w - pad * 2;
        const by = w >= 480 ? 28 : gH + 14;
        const bh = w >= 480 ? h - 48 : h - by - 14;
        const maxV = Math.max(S.monoComponents, 10);
        label(c, t('ch1.cv.bars'), bx, by, C.mute, 'left', bx, bx + bw);
        const barH = Math.min(24, (bh - 34) / 2);
        const yB1 = by + 22, yB2 = yB1 + barH + 16;
        const w1 = Math.max(6, (bw - 46) * (S.monoComponents / maxV));
        const w2 = Math.max(6, (bw - 46) * (S.llvmComponents / maxV));
        box(c, bx, yB1, w1, barH, C.red, 'rgba(240,122,109,0.22)', 4);
        label(c, String(S.monoComponents), bx + w1 + 6, yB1 + barH / 2, C.red, 'left', bx, bx + bw, MONO);
        box(c, bx, yB2, w2, barH, C.cyan, 'rgba(99,199,230,0.22)', 4);
        label(c, String(S.llvmComponents), bx + w2 + 6, yB2 + barH / 2, C.cyan, 'left', bx, bx + bw, MONO);
      },
    });
    [fe, be, ps].forEach(el => rangeLab('#' + el.id, update));
    chkLab('#c1Mono', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch2: -O0 alloca vs -O2 register promotion ═════════ */
  (function ch2() {
    const iter = $('#c2Iter'), promo = $('#c2Promo'), cv = $('#c2Cv');
    let S = null;
    function update() {
      const sn = radioVal('c2Snip') || 'sum_array';
      const it = +iter.value;
      iter.disabled = sn === 'pick_phi';
      S = M.simAlloca({ snippet: sn, iters: it, promoted: promo.checked });
      sliderOut('c2Iter', String(S.iters));
      put('#c2IrO0', S.o0Snippet);
      put('#c2IrO2', S.o2Snippet);
      put('#c2Al', String(S.allocas));
      put('#c2St', String(S.stackMemOps));
      put('#c2Mem', String(S.totalMemOps));
      put('#c2In', String(S.irInsns));
      putHTML('#c2Say', t(S.promoted ? 'ch2.say.o2' : 'ch2.say.o0', {
        allocas: S.allocas, bytes: S.stackBytes, stack: S.stackMemOps,
        arr: S.arrayLoads, total: S.totalMemOps, saved: S.savedMemOps,
        o0: S.o0MemOps, o2: S.o2MemOps, it: S.iters,
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const maxIt = S.snippet === 'pick_phi' ? 1 : 32;
        const maxY = Math.max(20, M.simAlloca({ snippet: S.snippet, iters: maxIt, promoted: false }).o0MemOps);
        const f = frame(w, h, [28, 18, 42, 48], 1, Math.max(2, maxIt), 0, maxY);
        axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        const ticks = maxIt === 1 ? [[1, '1']] : [[1, '1'], [8, '8'], [16, '16'], [24, '24'], [32, '32']];
        xTicks(c, f, ticks);
        const step = maxY > 150 ? 100 : maxY > 60 ? 50 : 10;
        const yt = [];
        for (let y = 0; y <= maxY; y += step) yt.push([y, String(y)]);
        yTicks(c, f, yt);

        if (maxIt === 1) {
          const bw = Math.min(90, (f.R - f.L) * 0.28);
          const cx = (f.L + f.R) / 2;
          const y0 = f.Y(S.o0MemOps), y2 = f.Y(S.o2MemOps);
          box(c, cx - bw - 12, y0, bw, f.B - y0, C.red, 'rgba(240,122,109,0.28)', 4);
          box(c, cx + 12, Math.min(y2, f.B - 4), bw, Math.max(4, f.B - y2), C.green, 'rgba(122,214,160,0.28)', 4);
          label(c, '-O0: ' + S.o0MemOps, cx - bw / 2 - 12, Math.max(f.T + 10, y0 - 12), C.red, 'center', f.L, f.R, MONO);
          label(c, '-O2: ' + S.o2MemOps, cx + bw / 2 + 12, Math.max(f.T + 10, y2 - 12), C.green, 'center', f.L, f.R, MONO);
        } else {
          const pts0 = [], pts2 = [];
          for (let k = 1; k <= 32; k++) {
            const p = M.simAlloca({ snippet: S.snippet, iters: k, promoted: false });
            pts0.push([f.X(k), f.Y(p.o0MemOps)]);
            pts2.push([f.X(k), f.Y(p.o2MemOps)]);
          }
          c.strokeStyle = C.red; c.lineWidth = 2.2;
          c.beginPath(); pts0.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
          c.strokeStyle = C.green; c.lineWidth = 2.2;
          c.beginPath(); pts2.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
          const px = f.X(S.iters), py = f.Y(S.totalMemOps);
          c.strokeStyle = C.line; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(px, f.T); c.lineTo(px, f.B); c.stroke(); c.setLineDash([]);
          dot(c, px, py, S.promoted ? C.green : C.red, 5.5);
          label(c, t('ch2.cv.o0'), f.X(24), f.Y(M.simAlloca({ snippet: S.snippet, iters: 24, promoted: false }).o0MemOps) - 12, C.red, 'right', f.L + 4, f.R - 4);
          label(c, t('ch2.cv.o2'), f.X(28), f.Y(M.simAlloca({ snippet: S.snippet, iters: 28, promoted: true }).o2MemOps) - 12, C.green, 'right', f.L + 4, f.R - 4);
        }
      },
    });
    onAll($$('input[name=c2Snip]'), 'change', update);
    rangeLab('#c2Iter', update);
    chkLab('#c2Promo', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch3: SSA & mem2reg Dominance Frontier ═════════ */
  (function ch3() {
    const pass = $('#c3Pass'), cv = $('#c3Cv');
    let S = null;
    function update() {
      const cfg = radioVal('c3Cfg') || 'diamond';
      S = M.runMem2Reg({ preset: cfg, runPass: pass.checked });
      put('#c3Phi', String(S.phiCount));
      put('#c3Ver', String(S.versionsCreated));
      put('#c3Mem', String(S.afterMemOps));
      put('#c3Df', S.phiBlocks.length ? S.phiBlocks.join(', ') : t('u.none'));
      putHTML('#c3Say', t(S.runPass ? 'ch3.say.ssa' : 'ch3.say.alloca', {
        phis: S.phiCount, vers: S.versionsCreated,
        df: S.phiBlocks.join(', '), bmem: S.beforeMemOps, amem: S.afterMemOps,
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const bw = Math.min(184, Math.max(114, (w - 36) / 2));
        const bh = 46;
        const pos = Object.fromEntries(S.blocks.map(b => [
          b.id,
          { x: Math.max(bw / 2 + 12, Math.min(w - bw / 2 - 12, b.x * w)), y: Math.max(bh / 2 + 10, Math.min(h - bh / 2 - 10, b.y * h)) },
        ]));

        // Draw edges first
        for (const [u, v] of S.edges) {
          const pu = pos[u], pv = pos[v];
          if (pv.y < pu.y) {
            // Loop back-edge curves smoothly left
            c.strokeStyle = C.gold; c.lineWidth = 1.6;
            const cx = Math.max(10, Math.min(pu.x, pv.x) - bw * 0.72);
            c.beginPath(); c.moveTo(pu.x - bw / 2, pu.y); c.quadraticCurveTo(cx, (pu.y + pv.y) / 2, pv.x - bw / 2, pv.y); c.stroke();
            arrow(c, pv.x - bw / 2 - 10, pv.y + 4, pv.x - bw / 2, pv.y, C.gold, 1.6);
          } else {
            arrow(c, pu.x, pu.y + bh / 2, pv.x, pv.y - bh / 2, C.mute, 1.5);
          }
        }

        for (const b of S.blocks) {
          const p = pos[b.id];
          const col = b.hasPhi ? C.green : b.defVer ? C.cyan : C.mute;
          box(c, p.x - bw / 2, p.y - bh / 2, bw, bh, col, b.hasPhi ? 'rgba(122,214,160,0.16)' : 'rgba(26,31,43,0.94)', 8);
          const head = `${b.id}: ${b.label}${b.hasPhi ? ' [DF]' : ''}`;
          label(c, head, p.x, p.y - 10, col, 'center', p.x - bw / 2 + 6, p.x + bw / 2 - 6, MONO);
          const sub = S.runPass
            ? (b.phiText ? b.phiText : b.defVer ? `${b.defVer} = ...` : b.useVers.length ? `use ${b.useVers[0]}` : b.ops[0])
            : b.ops[b.ops.length - 1];
          label(c, sub, p.x, p.y + 10, C.ink, 'center', p.x - bw / 2 + 6, p.x + bw / 2 - 6, MONO);
        }
      },
    });
    onAll($$('input[name=c3Cfg]'), 'change', update);
    chkLab('#c3Pass', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch4: Fixed-point pass pipeline stepper ═════════ */
  (function ch4() {
    const cv = $('#c4Cv');
    let round = 0, S = null;
    function update() {
      const pre = radioVal('c4Pre') || 'dead_branch';
      const maxR = M.PIPELINE_PRESETS[pre].rounds.length - 1;
      round = Math.max(0, Math.min(maxR, round));
      S = M.stepPipeline({ preset: pre, round });
      put('#c4Rnd', `${S.round} / ${S.maxRounds}`);
      put('#c4Ops', String(S.currentOps));
      put('#c4Mem', String(S.memOps));
      put('#c4St', S.fixedPoint ? t('ch4.state.fixed') : t('ch4.state.active'));
      putHTML('#c4Say', t(S.fixedPoint ? 'ch4.say.fixed' : 'ch4.say.step', {
        pass: S.passName, ops: S.currentOps, start: S.startOps,
        removed: S.removedOps, detail: t('ch4.detail.' + S.detailKey),
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const rounds = M.PIPELINE_PRESETS[S.preset].rounds;
        // Top strip: pass boxes
        const pad = 14, gap = 8;
        const n = rounds.length;
        const pw = (w - pad * 2 - gap * (n - 1)) / n;
        for (let i = 0; i < n; i++) {
          const active = i === S.round, done = i < S.round;
          const col = active ? C.gold : done ? C.green : C.line;
          box(c, pad + i * (pw + gap), 12, pw, 30, col, active ? 'rgba(233,185,73,0.16)' : 'rgba(26,31,43,0.8)', 6);
          label(c, rounds[i].pass, pad + i * (pw + gap) + pw / 2, 27, active ? C.gold : done ? C.green : C.mute, 'center', pad + i * (pw + gap) + 4, pad + i * (pw + gap) + pw - 4, MONO);
        }

        // IR instruction rows below
        const startY = 56;
        const rowH = Math.min(24, Math.max(18, (h - startY - 12) / Math.max(1, S.lines.length) - 3));
        S.lines.forEach((ln, idx) => {
          const y = startY + idx * (rowH + 3);
          const col = ln.tag === 'mem' ? C.red : ln.tag === 'dead' ? C.red : ln.tag === 'opt' ? C.green : C.line;
          const fill = ln.tag === 'mem' ? 'rgba(240,122,109,0.12)' : ln.tag === 'opt' ? 'rgba(122,214,160,0.12)' : 'rgba(26,31,43,0.75)';
          box(c, pad, y, w - pad * 2, rowH, col, fill, 4);
          label(c, ln.text, pad + 10, y + rowH / 2, ln.live ? (ln.tag === 'opt' ? C.green : ln.tag === 'mem' ? C.red : C.ink) : C.mute, 'left', pad + 8, w - pad - 8, MONO);
        });
      },
    });
    onAll($$('input[name=c4Pre]'), 'change', () => { round = 0; update(); });
    $('#c4Step').addEventListener('click', () => {
      const pre = radioVal('c4Pre') || 'dead_branch';
      const maxR = M.PIPELINE_PRESETS[pre].rounds.length - 1;
      if (round < maxR) round++;
      update();
    });
    $('#c4Fix').addEventListener('click', () => {
      const pre = radioVal('c4Pre') || 'dead_branch';
      round = M.PIPELINE_PRESETS[pre].rounds.length - 1;
      update();
    });
    $('#c4Reset').addEventListener('click', () => { round = 0; update(); });
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch5: LICM + Aliasing + SIMD LoopVectorize ═════════ */
  (function ch5() {
    const nEl = $('#c5N'), licmEl = $('#c5Licm'), ovEl = $('#c5Ov'), cv = $('#c5Cv');
    let S = null;
    function update() {
      const alias = radioVal('c5Alias') || 'unknown';
      const vf = +(radioVal('c5Vf') || 4);
      ovEl.disabled = alias !== 'unknown';
      S = M.loopOptSim({ n: +nEl.value, aliasMode: alias, vf, licm: licmEl.checked, aliasOverlap: alias === 'unknown' && ovEl.checked });
      sliderOut('c5N', String(S.n));
      put('#c5Rel', String(S.invariantReloadsInLoop));
      put('#c5Vec', String(S.vecIters));
      put('#c5Tail', String(S.tailIters));
      put('#c5Ops', String(S.totalOps));
      const whyKey = S.runtimeFallsBack ? 'fallback' : !S.licm && S.vf === 1 ? 'unopt' : S.needsRuntimeCheck ? 'guarded' : 'static';
      putHTML('#c5Say', t('ch5.say', {
        n: S.n, vf: S.effVf, vec: S.vecIters, tail: S.tailIters,
        rel: S.invariantReloadsInLoop, ops: S.totalOps, base: S.scalarUnoptOps,
        speed: fmt(S.speedupRatio, 1),
        why: t('ch5.why.' + whyKey),
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const pad = 16;
        // Track 1: Preheader & Alias Check
        label(c, t('ch5.cv.pre'), pad, 16, C.mute, 'left', pad, w - pad);
        const preCol = S.hoisted ? C.gold : C.red;
        const preW = Math.min(200, (w - pad * 2) * 0.48);
        box(c, pad, 28, preW, 34, preCol, S.hoisted ? 'rgba(233,185,73,0.16)' : 'rgba(240,122,109,0.14)', 6);
        label(c, S.hoisted ? t('ch5.cv.hoist_ok') : t('ch5.cv.hoist_no'), pad + preW / 2, 45, preCol, 'center', pad + 4, pad + preW - 4);

        if (S.needsRuntimeCheck) {
          const gx = pad + preW + 10, gw = w - gx - pad;
          const gCol = S.runtimeFallsBack ? C.red : C.cyan;
          box(c, gx, 28, gw, 34, gCol, S.runtimeFallsBack ? 'rgba(240,122,109,0.16)' : 'rgba(99,199,230,0.14)', 6);
          label(c, S.runtimeFallsBack ? t('ch5.cv.ov_hit') : t('ch5.cv.ov_ok'), gx + gw / 2, 45, gCol, 'center', gx + 4, gx + gw - 4);
        }

        // Track 2: Loop Execution Grid (first 24 elements visualized cleanly)
        const shown = Math.min(S.n, 24);
        const gy = 84;
        label(c, t('ch5.cv.lanes', { k: shown, n: S.n }), pad, gy, C.mute, 'left', pad, w - pad);
        const cellGap = 3;
        const cellW = Math.max(6, (w - pad * 2 - cellGap * (shown - 1)) / shown);
        const vecCover = S.vectorized ? Math.min(shown, S.vecIters * S.effVf) : 0;

        // Group vector chunks visually
        let idx = 0;
        const rowY = gy + 18, rowH = 38;
        while (idx < shown) {
          if (S.vectorized && idx + S.effVf <= vecCover) {
            const x = pad + idx * (cellW + cellGap);
            const bw = S.effVf * cellW + (S.effVf - 1) * cellGap;
            box(c, x, rowY, bw, rowH, C.cyan, 'rgba(99,199,230,0.22)', 5);
            label(c, `<${S.effVf}×i32>`, x + bw / 2, rowY + rowH / 2, C.cyan, 'center', x + 2, x + bw - 2, MONO);
            idx += S.effVf;
          } else {
            const x = pad + idx * (cellW + cellGap);
            const isReload = !S.hoisted;
            const col = isReload ? C.red : C.violet;
            box(c, x, rowY, cellW, rowH, col, isReload ? 'rgba(240,122,109,0.2)' : 'rgba(179,157,251,0.2)', 3);
            if (cellW >= 18) label(c, String(idx), x + cellW / 2, rowY + rowH / 2, col, 'center', x + 1, x + cellW - 1, MONO);
            idx++;
          }
        }

        // Bottom summary bar: unoptimized ops vs current ops
        const by = rowY + rowH + 26;
        label(c, t('ch5.cv.cost'), pad, by, C.mute, 'left', pad, w - pad);
        const maxOps = Math.max(1, S.scalarUnoptOps);
        const barMaxW = w - pad * 2 - 58;
        const b1Y = by + 16, b2Y = by + 40;
        box(c, pad, b1Y, Math.max(6, barMaxW), 16, C.red, 'rgba(240,122,109,0.22)', 3);
        label(c, String(S.scalarUnoptOps), pad + barMaxW + 6, b1Y + 8, C.red, 'left', pad, w - pad, MONO);
        const w2 = Math.max(6, barMaxW * (S.totalOps / maxOps));
        box(c, pad, b2Y, w2, 16, C.green, 'rgba(122,214,160,0.26)', 3);
        label(c, String(S.totalOps), pad + w2 + 6, b2Y + 8, C.green, 'left', pad, w - pad, MONO);
      },
    });
    rangeLab('#c5N', update);
    onAll($$('input[name=c5Alias]'), 'change', update);
    onAll($$('input[name=c5Vf]'), 'change', update);
    chkLab('#c5Licm', update);
    chkLab('#c5Ov', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch6: UB nsw poison vs hardware wrap ═════════ */
  (function ch6() {
    const xEl = $('#c6X'), nullEl = $('#c6Null'), cv = $('#c6Cv');
    let S = null;
    function update() {
      const scen = radioVal('c6Scen') || 'overflow';
      const mode = radioVal('c6Mode') || 'nsw';
      const opt = radioVal('c6Opt') || 'O2';
      xEl.disabled = scen !== 'overflow';
      nullEl.disabled = scen !== 'null';
      S = M.ubSim({ scenario: scen, mode, opt, x: +xEl.value, pIsNull: nullEl.checked });
      sliderOut('c6X', fmt(S.x));
      put('#c6Ir', S.o2Ir);
      put('#c6Hw', scen === 'overflow' ? `${S.hwResult} (x+1=${fmt(S.hwWrapped)})` : (S.pIsNull ? '0 / safe' : '42'));
      put('#c6Res', scen === 'overflow' ? String(S.compiledResult) : (S.compiledResult < 0 ? 'SIGSEGV' : String(S.compiledResult)));
      put('#c6Poi', S.poison ? t('ch6.yes') : t('ch6.no'));
      put('#c6Div', S.mismatch ? t('ch6.div.yes') : t('ch6.div.no'));
      let sayKey = 'ch6.say.ov_ok';
      if (scen === 'overflow' && S.mismatch) sayKey = 'ch6.say.ov_bug';
      else if (scen === 'null' && S.mismatch) sayKey = 'ch6.say.null_bug';
      else if (scen === 'null') sayKey = 'ch6.say.null_ok';
      putHTML('#c6Say', t(sayKey, {
        x: fmt(S.x), w: fmt(S.hwWrapped), hw: S.hwResult, optv: S.compiledResult,
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const pad = 20;
        if (S.scenario === 'overflow') {
          // Number line near INT_MAX wrapping around to INT_MIN
          const yL = h * 0.45;
          c.strokeStyle = C.line; c.lineWidth = 2; c.beginPath(); c.moveTo(pad, yL); c.lineTo(w - pad, yL); c.stroke();
          const xMin = 2147483640, xMax = 2147483647;
          const xWrap = w - pad - 18;
          const scaleW = Math.max(80, xWrap - pad - 54);
          const X = v => pad + 18 + scaleW * (v - xMin) / (xMax - xMin);
          for (let v = xMin; v <= xMax; v++) {
            const px = X(v);
            dot(c, px, yL, v === S.x ? C.gold : C.mute, v === S.x ? 6 : 3);
            if (v === xMin || v === xMax) label(c, v === xMax ? 'INT_MAX' : 'MAX-7', px, yL + 18, v === xMax ? C.gold : C.mute, 'center', 4, w - 4, MONO);
          }
          // Show x+1 landing
          const cCol = S.mismatch ? C.red : C.cyan;
          label(c, S.mismatch ? t('ch6.cv.fold') : t('ch6.cv.keep'), pad, 18, cCol, 'left', pad, w - pad);
          if (S.x === M.INT32_MAX) {
            c.strokeStyle = C.cyan; c.setLineDash([4, 3]);
            c.beginPath(); c.moveTo(X(S.x), yL); c.quadraticCurveTo(w / 2, 36, pad + 18, yL - 10); c.stroke();
            c.setLineDash([]);
            label(c, 'HW: INT_MIN', pad + 18, yL + 34, C.cyan, 'left', 4, w - 4, MONO);
          }
        } else {
          const bw = Math.min(130, (w - 48) / 2);
          const yB = h * 0.36;
          box(c, pad, yB, bw, 52, C.gold, 'rgba(233,185,73,0.14)', 6);
          label(c, 'val = *p', pad + bw / 2, yB + 26, C.gold, 'center', pad + 4, pad + bw - 4, MONO);
          const x2 = w - pad - bw;
          const del = S.branchEliminated;
          box(c, x2, yB, bw, 52, del ? C.red : C.green, del ? 'rgba(240,122,109,0.12)' : 'rgba(122,214,160,0.16)', 6);
          label(c, del ? t('ch6.cv.del') : 'if (!p) ret 0', x2 + bw / 2, yB + 26, del ? C.red : C.green, 'center', x2 + 4, x2 + bw - 4, MONO);
          arrow(c, pad + bw, yB + 26, x2, yB + 26, del ? C.red : C.mute, 1.5);
        }
      },
    });
    onAll($$('input[name=c6Scen]'), 'change', update);
    onAll($$('input[name=c6Mode]'), 'change', update);
    onAll($$('input[name=c6Opt]'), 'change', update);
    rangeLab('#c6X', update);
    chkLab('#c6Null', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch7: SelectionDAG Instruction Selection matcher ═════════ */
  (function ch7() {
    const fuseEl = $('#c7Fuse'), cv = $('#c7Cv');
    let S = null;
    function update() {
      const pre = radioVal('c7Pre') || 'fma';
      const arch = radioVal('c7Arch') || 'arm64';
      S = M.iselSim({ preset: pre, arch, fuse: fuseEl.checked });
      put('#c7Asm', S.asm.join('\n'));
      put('#c7Ir', String(S.irOps));
      put('#c7Ma', String(S.insnCount));
      put('#c7Sv', String(S.savedInsns));
      putHTML('#c7Say', t(S.fuse ? 'ch7.say.fused' : 'ch7.say.unfused', {
        expr: S.expr, ir: S.irOps, mach: S.insnCount,
        arch: t('ch7.arch.' + S.arch), saved: S.savedInsns,
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const n = S.nodes.length;
        const pad = 16;
        const bw = Math.min(156, Math.max(90, (w - pad * 2 - 20 * (n - 1)) / n));
        const bh = 44;
        const stepX = n === 1 ? 0 : (w - pad * 2 - bw) / (n - 1);
        const pts = S.nodes.map((nd, i) => ({
          x: pad + i * stepX + bw / 2,
          y: n <= 2 ? h * 0.45 : (i % 2 === 0 ? h * 0.34 : h * 0.64),
          op: nd.op,
        }));

        // Dashed tiling region when fused
        if (S.fuse && S.savedInsns > 0) {
          const minX = pts[0].x - bw / 2 - 8, maxX = pts[n - 1].x + bw / 2 + 8;
          const minY = Math.min(...pts.map(p => p.y)) - bh / 2 - 10;
          const maxY = Math.max(...pts.map(p => p.y)) + bh / 2 + 10;
          c.save(); c.setLineDash([5, 4]);
          box(c, minX, minY, maxX - minX, maxY - minY, C.gold, 'rgba(233,185,73,0.07)', 10);
          c.restore();
          label(c, t('ch7.cv.tile', { k: S.insnCount }), (minX + maxX) / 2, Math.max(12, minY - 10), C.gold, 'center', 4, w - 4);
        } else {
          label(c, t('ch7.cv.sep', { k: S.insnCount }), w / 2, 16, C.red, 'center', 4, w - 4);
        }

        for (let i = 0; i < n - 1; i++) {
          arrow(c, pts[i].x + bw / 2, pts[i].y, pts[i + 1].x - bw / 2, pts[i + 1].y, C.mute, 1.5);
        }
        pts.forEach(p => {
          const col = S.fuse ? C.green : C.cyan;
          box(c, p.x - bw / 2, p.y - bh / 2, bw, bh, col, 'rgba(26,31,43,0.95)', 6);
          label(c, p.op, p.x, p.y, col, 'center', p.x - bw / 2 + 4, p.x + bw / 2 - 4, MONO);
        });
      },
    });
    onAll($$('input[name=c7Pre]'), 'change', update);
    onAll($$('input[name=c7Arch]'), 'change', update);
    chkLab('#c7Fuse', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch8: Liveness & Interference Graph Register Allocation ═════════ */
  (function ch8() {
    const kEl = $('#c8K'), cv = $('#c8Cv');
    let S = null;
    function update() {
      const algo = radioVal('c8Algo') || 'graph';
      const scen = radioVal('c8Scen') || 'chain';
      S = M.regAllocSim({ scenario: scen, K: +kEl.value, algo });
      sliderOut('c8K', String(S.K));
      put('#c8Live', String(S.maxLive));
      put('#c8Used', `${S.regsUsed} / ${S.K}`);
      put('#c8Sp', String(S.spillCount));
      put('#c8Mem', String(S.spillInsns));
      const key = S.spillCount > 0 ? 'ch8.say.spill' : 'ch8.say.fit';
      putHTML('#c8Say', t(key, {
        algo: t('ch8.algo.' + S.algo), k: S.K, live: S.maxLive,
        sp: S.spillCount, mem: S.spillInsns, spilled: S.spilled.join(', '),
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const wide = w >= 540;
        const pad = 14;
        const lW = wide ? w * 0.56 - pad : w - pad * 2;
        const lH = wide ? h - 24 : h * 0.50 - 12;

        // Left / top: Live intervals
        label(c, t('ch8.cv.iv'), pad, 14, C.cyan, 'left', pad, pad + lW);
        const ivs = S.intervals;
        const x0 = pad + 32, x1 = pad + lW - 8;
        const rowStep = Math.min(26, (lH - 22) / ivs.length);
        ivs.forEach((iv, i) => {
          const y = 30 + i * rowStep;
          const colIdx = S.color[iv.id];
          const isSpill = colIdx == null;
          const col = isSpill ? C.red : REG_COLS[colIdx % REG_COLS.length];
          label(c, '%' + iv.id, pad, y + 7, isSpill ? C.red : C.ink, 'left', pad, x0, MONO);
          const bx = x0 + (x1 - x0) * (iv.start / S.len);
          const bw = Math.max(10, (x1 - x0) * ((iv.end - iv.start) / S.len));
          box(c, bx, y, bw, 15, col, isSpill ? 'rgba(240,122,109,0.22)' : col + '33', 3);
          const tag = isSpill ? 'SPILL' : 'r' + colIdx;
          if (bw >= 26) label(c, tag, bx + bw / 2, y + 7.5, col, 'center', bx + 2, bx + bw - 2, MONO);
        });

        // Right / bottom: Interference Graph
        const gx0 = wide ? w * 0.56 + 10 : pad;
        const gy0 = wide ? 14 : h * 0.56;
        const gw = wide ? w - gx0 - pad : w - pad * 2;
        const gh = wide ? h - 24 : h - gy0 - 10;
        label(c, t('ch8.cv.graph'), gx0, gy0, C.gold, 'left', gx0, gx0 + gw);

        const cx = gx0 + gw / 2, cy = gy0 + gh / 2 + 8;
        const rad = Math.max(36, Math.min(gw, gh - 24) * 0.36);
        const n = ivs.length;
        const pts = Object.fromEntries(ivs.map((iv, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
          return [iv.id, [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]];
        }));
        c.strokeStyle = C.line; c.lineWidth = 1.2;
        for (const [u, v] of S.edges) {
          c.beginPath(); c.moveTo(pts[u][0], pts[u][1]); c.lineTo(pts[v][0], pts[v][1]); c.stroke();
        }
        const nr = Math.min(15, Math.max(11, rad * 0.24));
        for (const iv of ivs) {
          const [px, py] = pts[iv.id];
          const colIdx = S.color[iv.id];
          const isSpill = colIdx == null;
          const col = isSpill ? C.red : REG_COLS[colIdx % REG_COLS.length];
          box(c, px - nr, py - nr, nr * 2, nr * 2, col, '#141821', nr);
          label(c, iv.id, px, py, col, 'center', px - nr, px + nr, MONO);
        }
      },
    });
    rangeLab('#c8K', update);
    onAll($$('input[name=c8Algo]'), 'change', update);
    onAll($$('input[name=c8Scen]'), 'change', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch9: ThinLTO vs Full LTO vs Separate -O2 ═════════ */
  (function ch9() {
    const thEl = $('#c9Th'), tuEl = $('#c9Tu'), pgoEl = $('#c9Pgo'), cv = $('#c9Cv');
    let S = null;
    function update() {
      const mode = radioVal('c9Mode') || 'thin';
      S = M.ltoSim({ mode, threshold: +thEl.value, tus: +tuEl.value, pgo: pgoEl.checked });
      sliderOut('c9Th', String(S.threshold));
      sliderOut('c9Tu', String(S.tus));
      put('#c9In', `${S.inlinedSites} / ${S.totalCallSites}`);
      put('#c9Ca', String(S.remainingCalls));
      put('#c9Me', fmt(S.peakMemPerWorkerMB, 1) + ' MB');
      put('#c9Wk', String(S.workers));
      putHTML('#c9Say', t('ch9.say.' + S.mode, {
        tus: S.tus, inl: S.inlinedSites, rem: S.remainingCalls,
        mem: fmt(S.peakMemPerWorkerMB, 1), wk: S.workers,
        fold: S.foldedConst42 ? t('ch9.fold_yes') : t('ch9.fold_no'),
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const pad = 16;
        // Top half: 4 representative cross-TU calls vs inline threshold
        label(c, t('ch9.cv.edges'), pad, 14, C.mute, 'left', pad, w - pad);
        const barX = pad + 118, barMaxW = Math.max(60, w - barX - 54);
        const maxIR = 80;
        S.edges.forEach((e, i) => {
          const y = 32 + i * 28;
          label(c, e.name, pad, y + 8, e.hot ? C.gold : C.mute, 'left', pad, barX - 6, MONO);
          const bw = Math.max(8, barMaxW * (e.irSize / maxIR));
          const col = e.inlined ? C.green : C.red;
          box(c, barX, y, bw, 16, col, e.inlined ? 'rgba(122,214,160,0.24)' : 'rgba(240,122,109,0.2)', 3);
          label(c, String(e.irSize) + ' IR', barX + bw + 6, y + 8, col, 'left', barX, w - 4, MONO);
        });
        if (S.mode !== 'none') {
          const tx = barX + barMaxW * (Math.min(maxIR, S.threshold) / maxIR);
          c.strokeStyle = C.cyan; c.setLineDash([4, 3]);
          c.beginPath(); c.moveTo(tx, 26); c.lineTo(tx, 146); c.stroke();
          c.setLineDash([]);
        }

        // Bottom half: Peak link-time IR memory per worker
        const by = 166;
        label(c, t('ch9.cv.mem'), pad, by, C.mute, 'left', pad, w - pad);
        const maxM = Math.max(10, 32 * 1.8);
        const mw = Math.max(8, (w - pad * 2 - 74) * (S.peakMemPerWorkerMB / maxM));
        const mCol = S.mode === 'full' ? C.red : S.mode === 'thin' ? C.cyan : C.mute;
        box(c, pad, by + 16, mw, 22, mCol, mCol + '33', 4);
        label(c, fmt(S.peakMemPerWorkerMB, 1) + ' MB', pad + mw + 8, by + 27, mCol, 'left', pad, w - pad, MONO);
      },
    });
    onAll($$('input[name=c9Mode]'), 'change', update);
    rangeLab('#c9Th', update);
    rangeLab('#c9Tu', update);
    chkLab('#c9Pgo', update);
    langHooks.push(update);
    update();
  })();

  applyLang();
  loop();
  window.__essayReady = true;
})();
