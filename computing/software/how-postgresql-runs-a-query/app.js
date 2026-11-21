/* How PostgreSQL Runs a Query: i18n runtime, wiring, and deterministic 2D canvas models.
   Every number displayed is computed by models.js against PostgreSQL 17.6 / 18.0 structures.
   Nothing animates on its own: every canvas redraws only when a control changes or on resize/language toggle,
   so prefers-reduced-motion needs no special timer shutdown. */
(() => {
  'use strict';
  const M = window.PostgresQueryModels;
  const COPY = window.ESSAY_COPY || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const C = {
    bg: '#0f1219',
    line: '#2b3242',
    grid: '#1f2533',
    ink: '#ebe8e0',
    mute: '#a3aab8',
    gold: '#e9b949',
    cyan: '#63c7e6',
    red: '#f07a6d',
    green: '#7ad6a0',
    violet: '#b39dfb',
    dimfill: '#3a4254',
    card2: '#1a1f2b'
  };
  const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';

  /* ───────── language runtime ───────── */
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
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
    return s;
  }
  const fmt = (x, d) => M.fmt(x, d, effLang());
  const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d == null ? 0 : d) });
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
    for (const s of sims) {
      if (s.cvs.includes(e.target)) {
        e.target.__vis = e.isIntersecting;
        s.vis = s.cvs.some(cv => cv.__vis);
        s.dirty = true;
      }
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
    for (const s of sims) {
      if (s.vis && s.dirty) { s.dirty = false; s.draw(); }
    }
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

  /* ───────── chart helpers ───────── */
  function frame(w, h, m, x0, x1, y0, y1) {
    const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
    return {
      L, R, T, B,
      X: x => L + (R - L) * (x - x0) / (x1 - x0),
      Y: y => B - (B - T) * (y - y0) / (y1 - y0)
    };
  }
  function fitText(c, s, maxW, base) {
    base = base || 12;
    let fs = base;
    c.font = FONT.replace('12px', fs + 'px');
    while (c.measureText(s).width > maxW && fs > 9.5) {
      fs -= 0.5;
      c.font = FONT.replace('12px', fs + 'px');
    }
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
      fitText(c, yLab, f.R - f.L - 20);
      c.fillText(yLab, f.L + 4, f.T - 12);
      c.font = FONT;
    }
    if (xLab) {
      c.textAlign = 'right';
      fitText(c, xLab, f.R - f.L - 8);
      c.fillText(xLab, f.R, f.B + 30);
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
      const w = c.measureText(s).width;
      const cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2);
      if (cx - w / 2 < lastR + 10) continue;
      c.fillText(s, cx, f.B + 14);
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
      if (py > lastY - 16 || py < f.T + 2) continue;
      c.fillText(s, f.L - 6, py);
      lastY = py;
      c.strokeStyle = C.grid;
      c.beginPath();
      c.moveTo(f.L + 1, py);
      c.lineTo(f.R, py);
      c.stroke();
    }
  }
  function poly(c, pts, col, lw, dash) {
    c.strokeStyle = col;
    c.lineWidth = lw || 2;
    c.lineJoin = 'round';
    c.setLineDash(dash || []);
    c.beginPath();
    let first = true;
    for (const [x, y] of pts) {
      if (!isFinite(x) || !isFinite(y)) { first = true; continue; }
      if (first) c.moveTo(x, y); else c.lineTo(x, y);
      first = false;
    }
    c.stroke();
    c.setLineDash([]);
  }
  function dot(c, x, y, col, r) {
    c.fillStyle = col;
    c.beginPath();
    c.arc(x, y, r || 4.5, 0, Math.PI * 2);
    c.fill();
  }
  function label(c, s, x, y, col, align, x0, x1) {
    c.font = FONT;
    c.fillStyle = col;
    const w = c.measureText(s).width;
    let left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    left = Math.max(x0 == null ? 4 : x0, Math.min(left, (x1 == null ? c.canvas.clientWidth - 4 : x1) - w));
    c.textAlign = 'left';
    c.fillText(s, left, y);
    return { l: left, r: left + w };
  }

  /* ═════════ ch2: Planner Cost Crossover ═════════ */
  (function ch2() {
    const cv = $('#c2Cv'), selEl = $('#c2Sel'), rpcEl = $('#c2Rpc'), visEl = $('#c2Vis');
    let S = null;
    function update() {
      const selPct = +selEl.value;
      const rpc = +rpcEl.value;
      const allVisible = visEl.checked;
      sliderOut('c2Sel', fmt(selPct, 1) + '%');
      sliderOut('c2Rpc', fmt(rpc, 1));
      S = M.plannerCosts({ selectivity: selPct / 100, randomPageCost: rpc, allVisible });

      put('#c2Win', t('ch2.win.' + S.winner));
      put('#c2Seq', fmt(S.seqCost, 0));
      put('#c2Bmp', fmt(S.bitmapCost, 0));
      put('#c2Idx', fmt(allVisible ? S.indexOnlyCost : S.indexCost, 0));

      const winCost = S.winner === 'seq' ? S.seqCost
        : S.winner === 'bitmap' ? S.bitmapCost
        : S.winner === 'indexonly' ? S.indexOnlyCost : S.indexCost;
      const crossStr = S.crossSeqVsBitmap != null ? pct(S.crossSeqVsBitmap, 1) : '> 35%';
      putHTML('#c2Say', t('ch2.say.' + S.winner, {
        sel: fmt(selPct, 1) + '%',
        rows: fmt(S.rows, 0),
        rpc: fmt(rpc, 1),
        cost: fmt(winCost, 0),
        dp: fmt(S.distinctHeapPages, 0),
        cross: crossStr
      }));
      sim.dirty = true;
    }
    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const yMax = Math.max(S.seqCost * 1.85, S.bitmapCost * 1.15);
        const f = frame(w, h, [28, 18, 44, 54], 0, 35, 0, yMax);
        axes(c, f, t('ch2.cv.x'), t('ch2.cv.y'));
        xTicks(c, f, [0, 5, 10, 15, 20, 25, 30, 35].map(v => [v, String(v)]));
        const stepY = Math.ceil(yMax / 4 / 2000) * 2000;
        const yt = [];
        for (let y = 0; y <= yMax; y += stepY) yt.push([y, y === 0 ? '0' : (y / 1000).toFixed(0) + 'k']);
        yTicks(c, f, yt);

        const ptsSeq = [], ptsIdx = [], ptsBmp = [], ptsIos = [];
        for (let p = 0.1; p <= 35.0; p += 0.35) {
          const r = M.plannerCosts({ selectivity: p / 100, randomPageCost: S.randomPageCost, allVisible: S.allVisible });
          ptsSeq.push([f.X(p), f.Y(Math.min(yMax, r.seqCost))]);
          ptsBmp.push([f.X(p), f.Y(Math.min(yMax, r.bitmapCost))]);
          if (r.indexCost <= yMax * 1.05) ptsIdx.push([f.X(p), f.Y(Math.min(yMax, r.indexCost))]);
          if (S.allVisible && r.indexOnlyCost <= yMax * 1.05) ptsIos.push([f.X(p), f.Y(Math.min(yMax, r.indexOnlyCost))]);
        }
        poly(c, ptsSeq, C.gold, 2);
        poly(c, ptsIdx, C.cyan, 2);
        poly(c, ptsBmp, C.green, 2.2);
        if (S.allVisible) poly(c, ptsIos, C.violet, 2.2, [5, 3]);

        // Crossover vertical marker if inside 0..35%
        if (S.crossSeqVsBitmap != null && S.crossSeqVsBitmap * 100 <= 35) {
          const cx = f.X(S.crossSeqVsBitmap * 100);
          c.strokeStyle = C.mute;
          c.lineWidth = 1;
          c.setLineDash([3, 3]);
          c.beginPath();
          c.moveTo(cx, f.T + 14);
          c.lineTo(cx, f.B);
          c.stroke();
          c.setLineDash([]);
          label(c, fmt(S.crossSeqVsBitmap * 100, 1) + '%', cx, f.T + 8, C.mute, 'center', f.L + 4, f.R - 4);
        }

        // Current selectivity indicator
        const px = f.X(S.selectivity * 100);
        c.strokeStyle = 'rgba(235,232,224,0.35)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(px, f.T + 16);
        c.lineTo(px, f.B);
        c.stroke();
        dot(c, px, f.Y(Math.min(yMax, S.seqCost)), C.gold, 4.5);
        dot(c, px, f.Y(Math.min(yMax, S.bitmapCost)), C.green, 4.5);
        if (S.indexCost <= yMax) dot(c, px, f.Y(Math.min(yMax, S.indexCost)), C.cyan, 4.5);
        if (S.allVisible && S.indexOnlyCost <= yMax) dot(c, px, f.Y(Math.min(yMax, S.indexOnlyCost)), C.violet, 4.5);
      }
    });
    rangeLab('#c2Sel', update);
    rangeLab('#c2Rpc', update);
    chkLab('#c2Vis', update);
    langHooks.push(update);
    update();
  })();

  /* ═════════ ch3: 8 KiB Slotted Page & HOT ═════════ */
  (function ch3() {
    const cv = $('#c3Cv'), ffEl = $('#c3Ff'), payEl = $('#c3Pay'), idxEl = $('#c3Idx');
    const DEFAULT_OPS = ['INSERT', 'INSERT', 'INSERT', 'UPDATE', 'UPDATE'];
    let ops = DEFAULT_OPS.slice();
    let S = null;
    function update() {
      const ff = +ffEl.value;
      const pay = +payEl.value;
      const idx = idxEl.checked;
      sliderOut('c3Ff', ff + '%');
      sliderOut('c3Pay', pay + ' B');
      S = M.simulatePageSequence({ payloadBytes: pay, fillfactor: ff, indexedChanged: idx, ops });

      put('#c3Ptr', S.lower + ' / ' + S.upper);
      put('#c3Free', t('u.b', { v: fmt(S.freeBytes, 0) }));
      put('#c3Hot', String(S.hotUpdates));
      put('#c3IdxW', String(S.indexWrites));

      const modeKey = { hot: 'hot', indexed_col: 'indexed', page_full: 'full' }[S.mode] || S.mode;
      putHTML('#c3Say', t('ch3.say.' + modeKey, {
        hot: S.hotUpdates,
        free: fmt(S.freeBytes, 0),
        idx: S.indexWrites,
        off: S.offPageCount
      }));
      sim.dirty = true;
    }
    $('#c3Ins').addEventListener('click', () => { ops.push('INSERT'); update(); });
    $('#c3Upd').addEventListener('click', () => { ops.push('UPDATE'); update(); });
    $('#c3Rst').addEventListener('click', () => { ops = DEFAULT_OPS.slice(); update(); });
    rangeLab('#c3Ff', update);
    rangeLab('#c3Pay', update);
    chkLab('#c3Idx', update);
    langHooks.push(update);

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const L = 18, R = w - 18, W = R - L;
        const barY = 44, barH = 44;
        const bx = byte => L + (byte / M.PG.BLCKSZ) * W;

        // Top boundary labels (0 and 8192) — strictly non-overlapping
        label(c, '0', L, 22, C.mute, 'left', L, R);
        label(c, '8192 B', R, 22, C.mute, 'right', L, R);

        // Background track
        c.fillStyle = C.card2;
        c.strokeStyle = C.line;
        c.lineWidth = 1.2;
        c.fillRect(L, barY, W, barH);
        c.strokeRect(L, barY, W, barH);

        // 24B header
        const hdrW = Math.max(4, bx(M.PG.PAGE_HEADER_SIZE) - L);
        c.fillStyle = C.gold;
        c.fillRect(L, barY + 1, hdrW, barH - 2);

        // ItemIdData downward array [24 .. lower]
        const lowX = bx(S.lower);
        c.fillStyle = 'rgba(233,185,73,0.45)';
        c.fillRect(L + hdrW, barY + 1, Math.max(2, lowX - (L + hdrW)), barH - 2);

        // Tuples upward [upper .. 8192]
        for (const sl of S.slots) {
          const x1 = bx(sl.off);
          const x2 = bx(sl.off + sl.len);
          c.fillStyle = sl.status === 'LIVE' ? C.cyan : C.red;
          c.fillRect(x1, barY + 1, Math.max(2, x2 - x1 - 0.5), barH - 2);
        }

        // Bottom pointers: pd_lower and pd_upper with safe collision gap guard
        const upX = bx(S.upper);
        const rLow = label(c, 'lower=' + S.lower, lowX, barY + barH + 18, C.gold, 'left', L, R - 80);
        const minUpLeft = rLow.r + 12;
        label(c, 'upper=' + S.upper, Math.max(upX, minUpLeft), barY + barH + 18, C.cyan, 'right', minUpLeft, R);

        // Lower section: grid of slot pills (max per row adapts to width so nothing overlaps!)
        const slots = S.slots.slice(-8);
        const cols = w < 420 ? 4 : 8;
        const cellW = Math.min(84, (W - (cols - 1) * 6) / cols);
        const startY = barY + barH + 46;
        const cellH = 34;
        slots.forEach((sl, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const cx = L + col * (cellW + 6);
          const cy = startY + row * (cellH + 8);
          if (cy + cellH > h - 6) return;
          c.fillStyle = sl.status === 'LIVE' ? 'rgba(99,199,230,0.16)' : 'rgba(240,122,109,0.16)';
          c.strokeStyle = sl.status === 'LIVE' ? C.cyan : C.red;
          c.lineWidth = 1.2;
          c.fillRect(cx, cy, cellW, cellH);
          c.strokeRect(cx, cy, cellW, cellH);
          c.fillStyle = C.ink;
          c.font = FONT.replace('12px', '11px');
          c.textAlign = 'center';
          const tag = sl.ctidNext ? 'lp' + sl.id + '→' + sl.ctidNext : 'lp' + sl.id;
          c.fillText(tag, cx + cellW / 2, cy + cellH / 2);
        });
      }
    });
    update();
  })();

  /* ═════════ ch4: MVCC Snapshot & Isolation Sandbox ═════════ */
  (function ch4() {
    const cv = $('#c4Cv'), stepEl = $('#c4Step'), tb = $('#c4Tbl tbody');
    let S = null;
    function update() {
      const iso = radioVal('c4Iso') || 'rc';
      const step = +stepEl.value;
      sliderOut('c4Step', 't = ' + step);
      S = M.mvccScenario({ isolation: iso, step });

      put('#c4Snap', '[' + S.snap.xmin + ', ' + S.snap.xmax + ')');
      put('#c4Xip', '[' + S.snap.xip.join(', ') + ']');
      put('#c4Val', S.visibleVal ? String(S.visibleVal) : '—');

      tb.innerHTML = '';
      for (const tp of S.tuples) {
        const tr = document.createElement('tr');
        tr.className = tp.visible ? 'vis' : 'hid';
        tr.innerHTML =
          `<td>${tp.id} (${tp.val})</td>` +
          `<td>${tp.xmin || '—'}</td>` +
          `<td>${tp.xmax || '0'}</td>` +
          `<td>${tp.visible ? t('ch4.st.yes') : t('ch4.st.no')}</td>` +
          `<td>${t('ch4.why.' + tp.reason)}</td>`;
        tb.appendChild(tr);
      }

      putHTML('#c4Say', t('ch4.say.' + iso, {
        step,
        xmin: S.snap.xmin,
        xmax: S.snap.xmax,
        val: S.visibleVal,
        ver: S.visibleId
      }));
      sim.dirty = true;
    }
    onAll($$('input[name=c4Iso]'), 'change', update);
    rangeLab('#c4Step', update);
    langHooks.push(update);

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const L = 74, R = w - 20;
        const mapT = x => L + (R - L) * (x / 3.5);

        // Snapshot highlight bracket (xmin to xmax window shown cleanly over timeline)
        const snapLeft = S.isolation === 'rr' ? mapT(0.8) : mapT(S.step - 0.2);
        const snapRight = Math.min(R, snapLeft + (R - L) * 0.34);
        c.fillStyle = 'rgba(233,185,73,0.12)';
        c.fillRect(snapLeft, 28, snapRight - snapLeft, h - 46);
        c.strokeStyle = C.gold;
        c.lineWidth = 1.2;
        c.setLineDash([4, 3]);
        c.strokeRect(snapLeft, 28, snapRight - snapLeft, h - 46);
        c.setLineDash([]);

        label(c, 'snap [' + S.snap.xmin + ',' + S.snap.xmax + ')', snapLeft, 15, C.gold, 'left', L, R);

        const rows = [
          { id: 'T100', x0: 0, x1: 0.7, col: C.green },
          { id: 'T101', x0: 0.8, x1: S.step, col: C.gold },
          { id: 'T102', x0: 0.9, x1: 1.9, col: S.step >= 2 ? C.green : C.cyan },
          { id: 'T103', x0: 1.0, x1: 2.8, col: S.step >= 3 ? C.red : C.cyan },
          { id: 'T104', x0: 1.9, x1: Math.max(2.0, S.step), col: C.violet }
        ];
        const rowGap = (h - 56) / 5;
        rows.forEach((rw, i) => {
          const y = 42 + i * rowGap;
          label(c, rw.id, 12, y, C.ink, 'left', 4, L - 6);
          if (S.step < rw.x0 && rw.id === 'T104') return;
          const xStart = mapT(rw.x0);
          const xEnd = mapT(Math.min(rw.x1, S.step + 0.1));
          c.strokeStyle = rw.col;
          c.lineWidth = 4;
          c.beginPath();
          c.moveTo(xStart, y);
          c.lineTo(Math.max(xStart + 6, xEnd), y);
          c.stroke();
          dot(c, Math.max(xStart + 6, xEnd), y, rw.col, 4.5);
        });
      }
    });
    update();
  })();

  /* ═════════ ch5: VACUUM, FREEZE & 32-bit XID Wraparound ═════════ */
  (function ch5() {
    const cv = $('#c5Cv'), epEl = $('#c5Ep');
    let S = null;
    function update() {
      const vac = radioVal('c5Vac') || 'off';
      const ageM = +epEl.value;
      sliderOut('c5Ep', fmt(ageM, 0) + 'M');
      S = M.vacuumWraparoundSim({ ageMillion: ageM, vacuumMode: vac });

      put('#c5Age', t('u.m', { v: fmt(S.ageMillion, 0) }));
      put('#c5Dead', fmt(S.deadPct, 1) + '%');
      put('#c5Vm', fmt(S.vmPct, 1) + '%');
      put('#c5St', t('ch5.st.' + S.status));
      const stEl = $('#c5St');
      if (stEl) {
        stEl.className = S.status === 'healthy' ? 'n'
          : S.status === 'antiwrap' ? 'g' : 'r';
      }

      putHTML('#c5Say', t('ch5.say.' + S.status, {
        age: fmt(S.ageMillion, 0),
        dead: fmt(S.deadPct, 1),
        vm: fmt(S.vmPct, 1)
      }));
      sim.dirty = true;
    }
    onAll($$('input[name=c5Vac]'), 'change', update);
    rangeLab('#c5Ep', update);
    langHooks.push(update);

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const L = 16, R = w - 16, W = R - L;

        // Top section: two clean horizontal meters (Dead Tuple % and VM All-Visible %)
        const drawMeter = (y, lblText, valPct, col) => {
          const rLbl = label(c, lblText, L, y, C.mute, 'left', L, R - 60);
          label(c, fmt(valPct, 0) + '%', R, y, col, 'right', rLbl.r + 8, R);
          c.fillStyle = C.card2;
          c.fillRect(L, y + 12, W, 12);
          c.fillStyle = col;
          c.fillRect(L, y + 12, Math.max(2, W * (valPct / 100)), 12);
        };
        drawMeter(22, t('ch5.read.dead'), S.deadPct, C.red);
        drawMeter(62, t('ch5.read.vm'), S.vmPct, C.cyan);

        // Bottom section: 32-bit XID modular circular clock
        const cy = Math.max(176, h * 0.66);
        const rad = Math.min(w * 0.17, (h - 115) * 0.42);
        const cx = w / 2;

        // Past semicircle (left: PI/2 to 3PI/2)
        c.lineWidth = 6;
        c.strokeStyle = C.green;
        c.beginPath();
        c.arc(cx, cy, rad, Math.PI / 2, Math.PI * 1.5, false);
        c.stroke();

        // Future semicircle (right: -PI/2 to PI/2)
        c.strokeStyle = C.red;
        c.beginPath();
        c.arc(cx, cy, rad, -Math.PI / 2, Math.PI / 2, false);
        c.stroke();

        // CurrentXID at top (12 o'clock)
        dot(c, cx, cy - rad, C.gold, 5.5);
        label(c, 'CurrentXID', cx, cy - rad - 14, C.gold, 'center', 8, w - 8);

        // 2^31 opposite limit at 6 o'clock
        dot(c, cx, cy + rad, C.red, 4.5);
        label(c, '±2³¹', cx, cy + rad + 15, C.red, 'center', 8, w - 8);

        // Oldest unfrozen XID moving counter-clockwise around the ring
        const angle = -Math.PI / 2 - (S.age / M.PG.XID_MOD) * Math.PI * 2;
        const ox = cx + Math.cos(angle) * rad;
        const oy = cy + Math.sin(angle) * rad;
        c.strokeStyle = S.precedesOk ? C.cyan : C.red;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(ox, oy);
        c.stroke();
        dot(c, ox, oy, S.precedesOk ? C.cyan : C.red, 5.5);

        // Past / Future side captions well clear of circle
        label(c, t('ch5.cv.past'), cx - rad - 14, cy, C.green, 'right', 6, cx - rad - 8);
        label(c, t('ch5.cv.future'), cx + rad + 14, cy, C.red, 'left', cx + rad + 8, w - 6);
      }
    });
    update();
  })();

  /* ═════════ ch6: Shared Buffers Clock Sweep ═════════ */
  (function ch6() {
    const cv = $('#c6Cv'), stepEl = $('#c6Step'), frEl = $('#c6Fr');
    let S = null;
    function update() {
      const wl = radioVal('c6Wl') || 'seq_unprotected';
      const step = +stepEl.value;
      const fr = +frEl.value;
      sliderOut('c6Step', step + ' / 40');
      sliderOut('c6Fr', String(fr));
      S = M.clockSweepSim({ workload: wl, step, frameCount: fr });

      put('#c6Hit', pct(S.hitRate, 1));
      put('#c6Post', S.postTotal > 0 ? `${S.postHits}/${S.postTotal}` : '0/0');
      put('#c6Evict', String(S.evictions));
      put('#c6Hand', '#' + S.hand);

      const sayKey = wl === 'oltp' ? 'oltp' : (wl === 'seq_ring' ? 'ring' : 'unprot');
      putHTML('#c6Say', t('ch6.say.' + sayKey, {
        hit: pct(S.hitRate, 1),
        post: S.postTotal > 0 ? `${S.postHits}/${S.postTotal}` : '0/0'
      }));
      sim.dirty = true;
    }
    onAll($$('input[name=c6Wl]'), 'change', update);
    rangeLab('#c6Step', update);
    rangeLab('#c6Fr', update);
    langHooks.push(update);

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const cx = w / 2, cy = h / 2 + 6;
        const R = Math.min(w * 0.30, h * 0.34);
        const n = S.frames.length;
        const rNode = w < 440 ? 15 : 19;

        // Top-left non-overlapping status tag
        const ev = S.lastEvent;
        const info = ev ? `t=${ev.step}: ${ev.page} (${ev.hit ? 'HIT' : 'MISS'})` : '';
        label(c, info, 14, 18, ev && ev.hit ? C.green : C.gold, 'left', 8, w - 8);

        // Clock hand arrow from center to current hand frame
        const aHand = -Math.PI / 2 + (S.hand / n) * Math.PI * 2;
        const hx = cx + Math.cos(aHand) * (R - rNode - 8);
        const hy = cy + Math.sin(aHand) * (R - rNode - 8);
        c.strokeStyle = C.gold;
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(hx, hy);
        c.stroke();
        dot(c, cx, cy, C.gold, 4);

        // Draw each buffer frame with usage_count visual ring segments (0..5) + centered page label
        S.frames.forEach((f, i) => {
          const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
          const fx = cx + Math.cos(a) * R;
          const fy = cy + Math.sin(a) * R;
          const isRing = f.bulkRing || (S.ringSize > 0 && i >= n - S.ringSize);
          const isHot = f.page && f.page.startsWith('H');
          const strokeCol = isRing ? C.violet : isHot ? C.cyan : (f.page ? C.mute : C.line);

          c.fillStyle = isRing ? 'rgba(179,157,251,0.16)' : isHot ? 'rgba(99,199,230,0.16)' : C.card2;
          c.strokeStyle = strokeCol;
          c.lineWidth = i === S.hand ? 2.4 : 1.3;
          c.beginPath();
          c.arc(fx, fy, rNode, 0, Math.PI * 2);
          c.fill();
          c.stroke();

          // Usage count segments around outer rim (0..5)
          for (let u = 0; u < f.usage; u++) {
            const ua0 = -Math.PI / 2 + (u / 5) * Math.PI * 2 + 0.08;
            const ua1 = -Math.PI / 2 + ((u + 1) / 5) * Math.PI * 2 - 0.08;
            c.strokeStyle = C.gold;
            c.lineWidth = 3;
            c.beginPath();
            c.arc(fx, fy, rNode + 4, ua0, ua1);
            c.stroke();
          }

          c.fillStyle = C.ink;
          c.font = FONT.replace('12px', w < 440 ? '10.5px' : '11.5px');
          c.textAlign = 'center';
          c.fillText(f.page || '—', fx, fy);
        });
      }
    });
    update();
  })();

  /* ═════════ ch7: nbtree Lehman & Yao Splits ═════════ */
  (function ch7() {
    const cv = $('#c7Cv'), cntEl = $('#c7Cnt'), spEl = $('#c7Split');
    let S = null;
    function update() {
      const ord = radioVal('c7Ord') || 'rand';
      const cnt = +cntEl.value;
      const splitSim = spEl.checked;
      sliderOut('c7Cnt', String(cnt));
      S = M.nbtreeSim({ orderMode: ord, insertCount: cnt, maxKeys: 4, searchKey: cnt * 10, concurrentSplit: splitSim });

      put('#c7Leaves', String(S.leafCount));
      put('#c7Splits', String(S.splits));
      put('#c7Fill', fmt(S.avgFillPct, 0) + '%');
      put('#c7Hops', String(S.rightHops));

      const sayKey = splitSim && S.rightHops > 0 ? 'hop' : ord;
      putHTML('#c7Say', t('ch7.say.' + sayKey, {
        cnt,
        leaves: S.leafCount,
        splits: S.splits,
        fill: fmt(S.avgFillPct, 0),
        hops: S.rightHops
      }));
      sim.dirty = true;
    }
    onAll($$('input[name=c7Ord]'), 'change', update);
    rangeLab('#c7Cnt', update);
    chkLab('#c7Split', update);
    langHooks.push(update);

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const L = 18, R = w - 18, W = R - L;
        const leaves = S.leaves;
        const m = leaves.length;

        // Root / internal node at top
        const rootW = Math.min(180, W * 0.45);
        const rootX = (w - rootW) / 2, rootY = 20, rootH = 34;
        c.fillStyle = C.card2;
        c.strokeStyle = C.mute;
        c.lineWidth = 1.4;
        c.fillRect(rootX, rootY, rootW, rootH);
        c.strokeRect(rootX, rootY, rootW, rootH);
        label(c, 'Root (h=' + S.height + ')', w / 2, rootY + rootH / 2, C.ink, 'center', rootX + 4, rootX + rootW - 4);

        // Leaf boxes evenly distributed along [L, R]
        const gap = Math.max(4, Math.min(10, W * 0.02));
        const bw = (W - (m - 1) * gap) / m;
        const by = 92, bh = Math.min(120, h - 146);
        let lastLeafLblR = -Infinity;

        leaves.forEach((lf, i) => {
          const x = L + i * (bw + gap);
          const isStale = S.concurrentSplit && lf.id === S.staleStartPageId;
          const isLanded = S.concurrentSplit && lf.id === S.landedPageId;
          const fillRatio = lf.keys.length / S.maxKeys;

          // Downlink line from root
          c.strokeStyle = isStale ? C.red : C.line;
          c.lineWidth = isStale ? 2 : 1;
          c.beginPath();
          c.moveTo(w / 2, rootY + rootH);
          c.lineTo(x + bw / 2, by);
          c.stroke();

          // Leaf outer frame
          c.fillStyle = C.card2;
          c.strokeStyle = isLanded ? C.green : isStale ? C.gold : C.cyan;
          c.lineWidth = (isLanded || isStale) ? 2 : 1.2;
          c.fillRect(x, by, bw, bh);
          c.strokeRect(x, by, bw, bh);

          // Inner fill level bar from bottom
          const fh = Math.max(4, (bh - 4) * fillRatio);
          c.fillStyle = isLanded ? 'rgba(122,214,160,0.45)' : 'rgba(99,199,230,0.35)';
          c.fillRect(x + 2, by + bh - 2 - fh, bw - 4, fh);

          // High key tick at top-right if lf.highKey != null
          if (lf.highKey != null) {
            c.fillStyle = C.gold;
            c.fillRect(x + bw - 5, by + 2, 3, 10);
          }

          // Right-link arrow to next sibling
          if (i < m - 1) {
            const hopActive = S.concurrentSplit && lf.id === S.staleStartPageId && S.rightHops > 0;
            c.strokeStyle = hopActive ? C.gold : C.mute;
            c.lineWidth = hopActive ? 2.5 : 1.2;
            c.beginPath();
            c.moveTo(x + bw, by + bh / 2);
            c.lineTo(x + bw + gap, by + bh / 2);
            c.stroke();
          }

          // Safe leaf label below box with horizontal collision guard
          if (bw >= 36 || i === 0 || i === m - 1 || isLanded) {
            const lx = x + bw / 2;
            const lw = c.measureText('P' + lf.id).width;
            if (lx - lw / 2 >= lastLeafLblR + 6) {
              const rBox = label(c, 'P' + lf.id, lx, by + bh + 16, isLanded ? C.green : C.mute, 'center', L, R);
              lastLeafLblR = rBox.r;
            }
          }
        });

        // Bottom caption showing fill summary without colliding
        label(c, t('ch7.cv.stat', { fill: fmt(S.avgFillPct, 0), splits: S.splits }), w / 2, h - 14, C.mute, 'center', L, R);
      }
    });
    update();
  })();

  /* ═════════ ch8: Join Strategies & work_mem Spill ═════════ */
  (function ch8() {
    const cv = $('#c8Cv'), wmEl = $('#c8Wm'), outEl = $('#c8Out'), idxEl = $('#c8Idx');
    let S = null;
    function update() {
      const wm = +wmEl.value;
      const outRows = +outEl.value;
      const hasIdx = idxEl.checked;
      sliderOut('c8Wm', wm + ' MiB');
      sliderOut('c8Out', fmt(outRows / 1000, 0) + 'k');
      S = M.joinCostSim({ outerRows: outRows, innerRows: 400000, workMemMB: wm, hasInnerIdx: hasIdx });

      put('#c8Win', t('ch8.join.' + S.winner));
      put('#c8Mem', fmt(S.hashSizeMiB, 1) + ' MiB');
      put('#c8Bat', String(S.nbatch));
      put('#c8Spill', fmt(S.spillMiB, 1) + ' MiB');

      const sayKey = S.winner === 'nest' ? 'nestwin' : (S.spilled ? 'spill' : 'inmem');
      putHTML('#c8Say', t('ch8.say.' + sayKey, {
        mem: fmt(S.hashSizeMiB, 1) + ' MiB',
        wm,
        bat: S.nbatch,
        spill: fmt(S.spillMiB, 1),
        rows: fmt(outRows, 0)
      }));
      sim.dirty = true;
    }
    rangeLab('#c8Wm', update);
    rangeLab('#c8Out', update);
    chkLab('#c8Idx', update);
    langHooks.push(update);

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        // Plot Hash Join vs Merge Join vs Nested Loop cost as work_mem varies 1..32 MiB
        const vals = [];
        for (let m = 1; m <= 32; m++) {
          vals.push(M.joinCostSim({ outerRows: S.outerRows, innerRows: S.innerRows, workMemMB: m, hasInnerIdx: S.hasInnerIdx }));
        }
        const maxShow = Math.max(...vals.map(v => Math.max(v.hashCost, v.mergeCost, S.hasInnerIdx ? v.nestCost : 0))) * 1.15;
        const f = frame(w, h, [28, 18, 44, 54], 1, 32, 0, maxShow);
        axes(c, f, 'work_mem (MiB)', 'costsize.c');
        xTicks(c, f, [1, 4, 8, 16, 24, 32].map(v => [v, String(v)]));
        const stepY = Math.ceil(maxShow / 4 / 1000) * 1000;
        const yt = [];
        for (let y = 0; y <= maxShow; y += stepY) yt.push([y, y === 0 ? '0' : (y / 1000).toFixed(0) + 'k']);
        yTicks(c, f, yt);

        poly(c, vals.map((v, i) => [f.X(i + 1), f.Y(Math.min(maxShow, v.hashCost))]), C.gold, 2.4);
        poly(c, vals.map((v, i) => [f.X(i + 1), f.Y(Math.min(maxShow, v.mergeCost))]), C.cyan, 2);
        if (S.hasInnerIdx) {
          poly(c, vals.map((v, i) => [f.X(i + 1), f.Y(Math.min(maxShow, v.nestCost))]), C.green, 2, [5, 3]);
        }

        const px = f.X(S.workMemMB);
        c.strokeStyle = 'rgba(235,232,224,0.35)';
        c.beginPath();
        c.moveTo(px, f.T + 14);
        c.lineTo(px, f.B);
        c.stroke();
        dot(c, px, f.Y(Math.min(maxShow, S.hashCost)), C.gold, 5);
        dot(c, px, f.Y(Math.min(maxShow, S.mergeCost)), C.cyan, 4);
        if (S.hasInnerIdx) dot(c, px, f.Y(Math.min(maxShow, S.nestCost)), C.green, 4);

        label(c, 'nbatch=' + S.nbatch, px, f.T + 8, S.spilled ? C.red : C.green, 'center', f.L + 4, f.R - 4);
      }
    });
    update();
  })();

  /* ═════════ ch9: WAL Full-Page Writes vs Recovery Trade-off ═════════ */
  (function ch9() {
    const cv = $('#c9Cv'), ckptEl = $('#c9Ckpt'), fpwEl = $('#c9Fpw');
    let S = null;
    function update() {
      const wl = radioVal('c9Wl') || 'rand';
      const ckpt = +ckptEl.value;
      const fpw = fpwEl.checked;
      sliderOut('c9Ckpt', t('u.min', { v: ckpt }));
      S = M.walRecoverySim({ checkpointMin: ckpt, workload: wl, fpw });

      put('#c9Wal', fmt(S.walRateMBs, 2) + ' MiB/s');
      put('#c9FpwP', fmt(S.fpwSharePct, 1) + '%');
      put('#c9Rec', t('u.s', { v: fmt(S.recoverySec, 2) }));
      put('#c9Torn', t('ch9.torn.' + (S.tornPageSafe ? 'ok' : 'bad')));
      const tornEl = $('#c9Torn');
      if (tornEl) tornEl.className = S.tornPageSafe ? 'n' : 'r';

      putHTML('#c9Say', t('ch9.say.' + (S.fpw ? 'safe' : 'unsafe'), {
        ckpt,
        wl: t('ch9.wl.' + wl),
        rate: fmt(S.walRateMBs, 2),
        fpw: fmt(S.fpwSharePct, 1),
        rec: fmt(S.recoverySec, 2),
        crc: S.expectedCrc,
        tornCrc: S.tornCrc
      }));
      sim.dirty = true;
    }
    onAll($$('input[name=c9Wl]'), 'change', update);
    rangeLab('#c9Ckpt', update);
    chkLab('#c9Fpw', update);
    langHooks.push(update);

    const sim = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const pts = [];
        for (let m = 1; m <= 30; m++) {
          pts.push(M.walRecoverySim({ checkpointMin: m, workload: S.workload, fpw: S.fpw }));
        }
        const maxWal = Math.max(0.2, ...pts.map(p => p.walRateMBs)) * 1.15;
        const maxRec = Math.max(1.0, ...pts.map(p => p.recoverySec)) * 1.15;
        const f = frame(w, h, [28, 46, 44, 50], 1, 30, 0, maxWal);
        axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
        xTicks(c, f, [1, 5, 10, 15, 20, 25, 30].map(v => [v, String(v)]));
        yTicks(c, f, [0, maxWal * 0.5, maxWal].map(v => [v, v.toFixed(2)]));

        // Right-axis recovery ticks cleanly aligned below yLab level
        c.fillStyle = C.violet;
        c.textAlign = 'left';
        c.fillText(maxRec.toFixed(1) + 's', f.R + 6, f.T + 14);
        c.fillText((maxRec * 0.5).toFixed(1) + 's', f.R + 6, (f.T + f.B) / 2);

        poly(c, pts.map(p => [f.X(p.checkpointMin), f.Y(p.walRateMBs)]), C.gold, 2.4);
        const mapRecY = s => f.B - (f.B - f.T) * (s / maxRec);
        poly(c, pts.map(p => [f.X(p.checkpointMin), mapRecY(p.recoverySec)]), C.violet, 2.2, [5, 3]);

        const px = f.X(S.checkpointMin);
        c.strokeStyle = 'rgba(235,232,224,0.35)';
        c.beginPath();
        c.moveTo(px, f.T + 14);
        c.lineTo(px, f.B);
        c.stroke();
        dot(c, px, f.Y(S.walRateMBs), C.gold, 5);
        dot(c, px, mapRecY(S.recoverySec), C.violet, 5);
      }
    });
    update();
  })();

  /* ───────── boot ───────── */
  applyLang();
  requestAnimationFrame(loop);
  window.__essayReady = true;
})();
