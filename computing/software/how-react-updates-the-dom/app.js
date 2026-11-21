/* How React Updates the DOM: i18n runtime, wiring and 2D canvas models.
   All visible text lives in copy.*.js (generated from content.<lang>.md by scripts/build-pages.cjs);
   static diagrams are inline SVG partials (figures/dg-*.html). Every number comes from models.js,
   matching React 19.3.1 (react@19.3.1, react-dom@19.3.1, scheduler@0.28.0). Nothing animates automatically. */
(() => {
'use strict';
const M = window.ReactDomModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = {
  bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0',
  mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
  green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b'
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
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + on-screen registry ───────── */
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

function fitText(c, s, maxW, baseFont) {
  const f0 = baseFont || FONT;
  let fs = parseFloat(f0);
  c.font = f0;
  while (c.measureText(s).width > maxW && fs > 9.5) {
    fs -= 0.5;
    c.font = f0.replace(/^\d+(\.\d+)?px/, fs + 'px');
  }
}
function clipText(c, s, maxW, baseFont) {
  c.font = baseFont || FONT;
  if (c.measureText(s).width <= maxW) return s;
  let out = s;
  while (out.length > 1 && c.measureText(out + '…').width > maxW) out = out.slice(0, -1);
  return out + '…';
}
function label(c, s, x, y, col, align, x0, x1, baseFont) {
  c.font = baseFont || FONT;
  c.fillStyle = col;
  const w = c.measureText(s).width;
  let left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const minX = x0 == null ? 4 : x0;
  const maxX = x1 == null ? c.canvas.clientWidth - 4 : x1;
  left = Math.max(minX, Math.min(left, maxX - w));
  c.textAlign = 'left';
  c.fillText(s, left, y);
  return { l: left, r: left + w };
}
function rbox(c, x, y, w, h, stroke, fill, rx) {
  const r = rx == null ? 6 : rx;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.3; c.stroke(); }
}
function arrow(c, x1, y1, x2, y2, col, dash) {
  c.strokeStyle = col;
  c.lineWidth = 1.5;
  c.setLineDash(dash || []);
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  c.setLineDash([]);
  const ang = Math.atan2(y2 - y1, x2 - x1), al = 6;
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(x2, y2);
  c.lineTo(x2 - al * Math.cos(ang - 0.45), y2 - al * Math.sin(ang - 0.45));
  c.lineTo(x2 - al * Math.cos(ang + 0.45), y2 - al * Math.sin(ang + 0.45));
  c.closePath();
  c.fill();
}
function xTicks(c, f, items) {
  c.fillStyle = C.mute; c.font = FONT; c.textAlign = 'center'; let lastR = -Infinity;
  for (const [x, s] of items) {
    const px = f.X(x), w = c.measureText(s).width;
    const cx = Math.min(Math.max(px, f.L + w / 2), f.R - w / 2);
    if (cx - w / 2 < lastR + 8) continue;
    c.fillText(s, cx, f.B + 14);
    lastR = cx + w / 2;
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(px, f.B); c.lineTo(px, f.B + 4); c.stroke();
  }
}

/* ═════════ ch2: JSX Elements vs Fiber Nodes ═════════ */
(function ch2() {
  const cv = $('#c2Cv'), tbody = $('#c2Tbl tbody');
  const TAG_KEYS = { 0: 'ch2.tag.0', 3: 'ch2.tag.3', 5: 'ch2.tag.5', 6: 'ch2.tag.6' };
  let S = null;
  function update() {
    const pre = radioVal('c2Preset') || 'counter';
    const st = radioVal('c2Stage') || 'jsx';
    S = M.inspectElementAndFiber(pre, st);
    put('#c2El', String(S.stats.jsxObjectsAtCall));
    put('#c2Fib', String(S.stats.fiberCount));
    put('#c2Dom', String(S.stats.domNodesAllocated));
    put('#c2Fn', String(S.stats.fnCallsNow));
    putHTML('#c2Say', t('ch2.say.' + st, {
      el: String(S.stats.jsxObjectsAtCall),
      fib: String(S.stats.fiberCount),
      dom: String(S.stats.domNodesAllocated),
      fn: String(S.stats.fnCallsNow)
    }));
    tbody.replaceChildren();
    for (const n of S.nodes) {
      const tr = document.createElement('tr');
      const td0 = document.createElement('td'); td0.textContent = n.typeLabel;
      const td1 = document.createElement('td'); td1.textContent = st === 'jsx' ? 'Element' : t(TAG_KEYS[n.tag] || 'ch2.tag.5');
      const td2 = document.createElement('td'); td2.textContent = st === 'jsx' ? '—' : n.stateNodeKind;
      const td3 = document.createElement('td'); td3.textContent = n.propsSummary;
      tr.append(td0, td1, td2, td3);
      tbody.appendChild(tr);
    }
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const pad = 12, colW = Math.floor((w - pad * 4) / 3);
    const cols = [
      { x: pad, title: t('ch2.cv.colEl'), col: C.gold },
      { x: pad * 2 + colW, title: t('ch2.cv.colFib'), col: C.cyan },
      { x: pad * 3 + colW * 2, title: t('ch2.cv.colDom'), col: C.green }
    ];
    cols.forEach(col => {
      const txt = clipText(c, col.title, colW - 4, FONT);
      label(c, txt, col.x + colW / 2, 16, col.col, 'center', col.x, col.x + colW, FONT);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(col.x, 28); c.lineTo(col.x + colW, 28); c.stroke();
    });
    const rows = S.allNodes;
    const topY = 36, rowH = Math.min(28, Math.floor((h - topY - 10) / rows.length));
    rows.forEach((n, i) => {
      const y = topY + i * rowH;
      // Col 0: Element
      if (S.stage === 'jsx' ? n.fromJsx : true) {
        rbox(c, cols[0].x, y + 2, colW, rowH - 5, n.fromJsx ? C.gold : C.line, n.fromJsx ? 'rgba(233,185,73,.14)' : 'rgba(163,170,184,.06)', 4);
        const s0 = clipText(c, n.typeLabel, colW - 8, MONO);
        label(c, s0, cols[0].x + colW / 2, y + rowH / 2, n.fromJsx ? C.ink : C.mute, 'center', cols[0].x + 2, cols[0].x + colW - 2, MONO);
      }
      // Col 1: Fiber
      if (S.stage === 'reconciled') {
        rbox(c, cols[1].x, y + 2, colW, rowH - 5, C.cyan, 'rgba(99,199,230,.12)', 4);
        const s1 = clipText(c, n.tagName.replace('Component', ''), colW - 8, MONO);
        label(c, s1, cols[1].x + colW / 2, y + rowH / 2, C.ink, 'center', cols[1].x + 2, cols[1].x + colW - 2, MONO);
        arrow(c, cols[0].x + colW + 2, y + rowH / 2, cols[1].x - 2, y + rowH / 2, C.line);
      }
      // Col 2: DOM
      if (S.stage === 'reconciled') {
        const hasDom = n.tag === M.WORK_TAGS.HostComponent || n.tag === M.WORK_TAGS.HostText;
        if (hasDom) {
          rbox(c, cols[2].x, y + 2, colW, rowH - 5, C.green, 'rgba(122,214,160,.14)', 4);
          const s2 = clipText(c, n.stateNodeKind, colW - 8, MONO);
          label(c, s2, cols[2].x + colW / 2, y + rowH / 2, C.green, 'center', cols[2].x + 2, cols[2].x + colW - 2, MONO);
          arrow(c, cols[1].x + colW + 2, y + rowH / 2, cols[2].x - 2, y + rowH / 2, C.green);
        } else {
          const s2 = clipText(c, 'null', colW - 8, MONO);
          label(c, s2, cols[2].x + colW / 2, y + rowH / 2, C.mute, 'center', cols[2].x + 2, cols[2].x + colW - 2, MONO);
        }
      }
    });
    if (S.stage === 'jsx') {
      label(c, clipText(c, t('ch2.cv.nofib'), colW, FONT), cols[1].x + colW / 2, h * 0.52, C.mute, 'center', cols[1].x, cols[1].x + colW);
      label(c, clipText(c, t('ch2.cv.nodom'), colW, FONT), cols[2].x + colW / 2, h * 0.52, C.mute, 'center', cols[2].x, cols[2].x + colW);
    }
  } });
  onAll($$('input[name=c2Preset],input[name=c2Stage]'), 'change', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch3: Fiber linked list & double-buffered workLoop ═════════ */
(function ch3() {
  const cv = $('#c3Cv'), unitsS = $('#c3Units'), budS = $('#c3Budget'), preChk = $('#c3Preempt');
  let S = null;
  function update() {
    const u = +unitsS.value, b = +budS.value, pre = preChk.checked;
    S = M.simulateWorkLoop({ unitMs: 1.6, budgetMs: b, unitsDone: u, preempt: pre, hasAlternate: true });
    sliderOut('c3Units', `${S.beginCount} / ${S.totalNodes}`);
    sliderOut('c3Budget', t('u.ms', { v: fmt(b, 1) }));
    const curNode = S.cursorId >= 0 ? S.tree[S.cursorId].label : '—';
    put('#c3Cur', curNode);
    put('#c3Yld', String(S.yieldCount));
    put('#c3Alt', String(S.reused));
    put('#c3Dom', S.rootCurrentId);
    const kind = S.discarded ? 'preempt' : S.finished ? 'done' : S.beginCount === 0 ? 'start' : 'running';
    putHTML('#c3Say', t('ch3.say.' + kind, {
      total: String(S.totalNodes),
      slice: String(S.sliceIdx),
      cursor: curNode,
      phase: S.cursorPhase,
      yields: String(S.yieldCount),
      alt: String(S.reused)
    }));
    sim.dirty = true;
  }
  $('#c3StepBtn').addEventListener('click', () => {
    const v = Math.min(11, +unitsS.value + 1);
    unitsS.value = String(v);
    update();
  });
  $('#c3SliceBtn').addEventListener('click', () => {
    const b = +budS.value;
    const perSlice = Math.max(1, Math.floor(b / 1.6));
    const v = Math.min(11, +unitsS.value + perSlice);
    unitsS.value = String(v);
    update();
  });
  $('#c3ResetBtn').addEventListener('click', () => {
    unitsS.value = '0';
    preChk.checked = false;
    update();
  });
  function drawMiniTree(c, x0, y0, tw, th, isWip) {
    const nodes = S.tree;
    const shortLab = lbl => lbl === 'Header' ? 'Hdr' : lbl === 'Footer' ? 'Ftr' : lbl === 'Item0' ? 'I0' : lbl === 'Item1' ? 'I1' : lbl === 'Item2' ? 'I2' : lbl;
    const compact = tw < 340;
    const pos = n => [x0 + n.x * tw, y0 + 22 + n.y * (th - 30)];
    // links: child (cyan), sibling (gold)
    for (const n of nodes) {
      const [px, py] = pos(n);
      if (n.child !== -1) {
        const [cx, cy] = pos(nodes[n.child]);
        c.strokeStyle = isWip ? 'rgba(99,199,230,.55)' : 'rgba(122,214,160,.4)';
        c.lineWidth = 1.2; c.beginPath(); c.moveTo(px, py); c.lineTo(cx, cy); c.stroke();
      }
      if (n.sibling !== -1) {
        const [sx, sy] = pos(nodes[n.sibling]);
        c.strokeStyle = 'rgba(233,185,73,.45)';
        c.lineWidth = 1.1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(px, py); c.lineTo(sx, sy); c.stroke(); c.setLineDash([]);
      }
    }
    const r = compact ? 11 : 14;
    for (const n of nodes) {
      const [px, py] = pos(n);
      let stroke = C.green, fill = 'rgba(122,214,160,.16)', tc = C.ink;
      if (isWip) {
        const active = S.cursorId === n.id;
        const done = S.completed.includes(n.id);
        const vis = S.begun.includes(n.id);
        if (S.discarded && vis) { stroke = C.red; fill = 'rgba(240,122,109,.18)'; tc = C.red; }
        else if (active) { stroke = C.gold; fill = 'rgba(233,185,73,.28)'; tc = C.gold; }
        else if (done) { stroke = C.cyan; fill = 'rgba(99,199,230,.20)'; tc = C.ink; }
        else if (vis) { stroke = C.violet; fill = 'rgba(179,157,251,.18)'; tc = C.ink; }
        else { stroke = C.line; fill = C.card2; tc = C.mute; }
      } else if (S.finished) {
        stroke = C.cyan; fill = 'rgba(99,199,230,.20)';
      }
      c.beginPath(); c.arc(px, py, r, 0, 6.283); c.fillStyle = fill; c.fill();
      c.strokeStyle = stroke; c.lineWidth = activeCheck(isWip, n.id) ? 2.2 : 1.3; c.stroke();
      const txt = compact ? shortLab(n.label) : n.label.slice(0, 5);
      c.font = '10.5px ui-monospace,Menlo,monospace';
      c.fillStyle = tc; c.textAlign = 'center'; c.fillText(txt, px, py + 0.5);
    }
  }
  function activeCheck(isWip, id) { return isWip && S.cursorId === id; }
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const wide = w >= 600;
    const barH = 34, areaH = h - barH - 8;
    if (wide) {
      const hw = (w - 24) / 2;
      label(c, t('ch3.cv.left'), 12 + hw / 2, 14, S.finished ? C.cyan : C.green, 'center', 8, 12 + hw);
      label(c, t('ch3.cv.right'), 16 + hw + hw / 2, 14, S.discarded ? C.red : C.gold, 'center', 16 + hw, w - 8);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(w / 2, 8); c.lineTo(w / 2, areaH); c.stroke();
      drawMiniTree(c, 8, 10, hw, areaH - 12, false);
      drawMiniTree(c, 16 + hw, 10, hw, areaH - 12, true);
    } else {
      const hh = (areaH - 8) / 2;
      label(c, t('ch3.cv.left'), 12, 12, S.finished ? C.cyan : C.green, 'left', 8, w - 8);
      drawMiniTree(c, 8, 8, w - 16, hh - 8, false);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(12, hh + 6); c.lineTo(w - 12, hh + 6); c.stroke();
      label(c, t('ch3.cv.right'), 12, hh + 18, S.discarded ? C.red : C.gold, 'left', 8, w - 8);
      drawMiniTree(c, 8, hh + 14, w - 16, hh - 10, true);
    }
    // Bottom slice budget bar
    const by = h - barH + 6, bx = 14, bw = w - 28;
    rbox(c, bx, by, bw, 18, C.line, C.card2, 4);
    const fillFrac = S.beginCount === 0 ? 0 : Math.min(1, S.sliceMs / S.budgetMs);
    if (fillFrac > 0) rbox(c, bx + 1, by + 1, Math.max(4, (bw - 2) * fillFrac), 16, null, S.discarded ? C.red : C.gold, 3);
    const barTxt = `${t('ch3.cv.slice')} #${S.sliceIdx}: ${fmt(S.sliceMs, 1)} / ${fmt(S.budgetMs, 1)} ms`;
    label(c, barTxt, bx + bw / 2, by + 9, C.ink, 'center', bx + 4, bx + bw - 4, MONO);
  } });
  rangeLab('#c3Units', update);
  rangeLab('#c3Budget', update);
  chkLab('#c3Preempt', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch4: Two-pass O(n) reconciliation & key identity ═════════ */
(function ch4() {
  const cv = $('#c4Cv');
  let S = null;
  function update() {
    const sc = radioVal('c4Sc') || 'prepend';
    const km = radioVal('c4Key') || 'id';
    S = M.reconcileList(sc, km);
    put('#c4Reuse', String(S.stats.reusedCount));
    put('#c4Moves', String(S.stats.moveCount));
    put('#c4Mounts', String(S.stats.mountCount));
    put('#c4Bug', String(S.stats.stateMismatches));
    const mode = S.stats.stateMismatches > 0 ? 'mismatch' : S.stats.moveCount > 0 ? 'moves' : 'clean';
    putHTML('#c4Say', t('ch4.say.' + mode, {
      reused: String(S.stats.reusedCount),
      moves: String(S.stats.moveCount),
      mounts: String(S.stats.mountCount),
      bug: String(S.stats.stateMismatches)
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const pad = 12, boxW = Math.min(185, Math.floor((w - 86) / 2));
    const lx = pad, rx = w - pad - boxW;
    label(c, t('ch4.cv.old'), lx + boxW / 2, 16, C.mute, 'center', lx, lx + boxW);
    label(c, t('ch4.cv.new'), rx + boxW / 2, 16, C.cyan, 'center', rx, rx + boxW);

    const maxRows = Math.max(S.oldList.length, S.newList.length);
    const topY = 32, rowH = Math.min(48, Math.floor((h - topY - 8) / maxRows));

    const oldPos = {};
    S.oldList.forEach((o, i) => {
      const y = topY + i * rowH;
      const isDel = S.deletedIds.includes(o.id);
      rbox(c, lx, y + 3, boxW, rowH - 8, isDel ? C.red : C.line, isDel ? 'rgba(240,122,109,.15)' : C.card2, 6);
      const txt = `${o.id} (k=${o.key})${o.draft ? ' · ' + o.draft : ''}`;
      label(c, clipText(c, txt, boxW - 10, MONO), lx + 6, y + rowH / 2 - 1, isDel ? C.red : C.ink, 'left', lx + 4, lx + boxW - 4, MONO);
      oldPos[o.index] = [lx + boxW + 2, y + rowH / 2 - 1];
    });

    S.results.forEach((r, i) => {
      const y = topY + i * rowH;
      const col = r.stateMismatch ? C.red : r.action === 'mount' ? C.cyan : r.action === 'move' ? C.gold : C.green;
      const fill = r.stateMismatch ? 'rgba(240,122,109,.16)' : r.action === 'mount' ? 'rgba(99,199,230,.14)' : r.action === 'move' ? 'rgba(233,185,73,.14)' : 'rgba(122,214,160,.14)';
      rbox(c, rx, y + 3, boxW, rowH - 8, col, fill, 6);
      const tag = r.action === 'mount' ? '+' : r.action === 'move' ? '↕' : '✓';
      const draftNote = r.carriedDraft ? ' · ' + r.carriedDraft : '';
      const txt = `${tag} ${r.newId} (k=${r.newKey})${draftNote}`;
      label(c, clipText(c, txt, boxW - 10, MONO), rx + 6, y + rowH / 2 - 1, r.stateMismatch ? C.red : C.ink, 'left', rx + 4, rx + boxW - 4, MONO);
      if (r.matchedOldIdx >= 0 && oldPos[r.matchedOldIdx]) {
        const [ox, oy] = oldPos[r.matchedOldIdx];
        arrow(c, ox, oy, rx - 3, y + rowH / 2 - 1, col, r.stateMismatch ? [4, 3] : null);
      }
    });
  } });
  onAll($$('input[name=c4Sc],input[name=c4Key]'), 'change', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch5: Hooks singly-linked list + circular queue ═════════ */
(function ch5() {
  const cv = $('#c5Cv'), skipChk = $('#c5Skip'), lowChk = $('#c5Low');
  const QMAP = { incDouble: ['inc', 'double'], doubleInc: ['double', 'inc'], setInc: ['set', 'inc'] };
  let S = null;
  function update() {
    const qk = radioVal('c5Q') || 'incDouble';
    S = M.simulateHooks({
      actions: QMAP[qk] || ['inc', 'double'],
      conditionalSkip: skipChk.checked,
      skipLowPrio: lowChk.checked
    });
    put('#c5Prev', String(S.prevCount));
    put('#c5Next', String(S.memoizedState));
    put('#c5Base', String(S.baseQueueLen));
    put('#c5Err', S.hookError ? t('ch5.st.err') : t('ch5.st.ok'));
    const kind = S.hookError ? 'error' : S.baseQueueLen > 0 ? 'skipped' : 'normal';
    putHTML('#c5Say', t('ch5.say.' + kind, {
      prev: String(S.prevCount),
      next: String(S.memoizedState),
      base: String(S.baseQueueLen),
      bstate: String(S.baseState)
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const pad = 12, slotW = Math.min(140, Math.floor((w - pad * 2 - 36) / 3));
    const totalW = slotW * 3 + 36, startX = Math.max(pad, Math.floor((w - totalW) / 2));

    label(c, t('ch5.cv.list'), pad, 16, C.cyan, 'left', pad, w - pad);
    S.baseHooks.forEach((hk, i) => {
      const x = startX + i * (slotW + 18), y = 30;
      rbox(c, x, y, slotW, 44, C.cyan, 'rgba(99,199,230,.12)', 6);
      label(c, clipText(c, `#${i} ${hk.label}: ${hk.memoizedState}`, slotW - 10, MONO), x + slotW / 2, y + 22, C.ink, 'center', x + 4, x + slotW - 4, MONO);
      if (i < 2) arrow(c, x + slotW + 2, y + 22, x + slotW + 16, y + 22, C.mute);
    });

    // Render calls mapping into slots
    S.cursorMappings.forEach((cm, i) => {
      const x = startX + i * (slotW + 18), y = 102;
      const col = cm.ok ? C.green : C.red;
      rbox(c, x, y, slotW, 38, col, cm.ok ? 'rgba(122,214,160,.12)' : 'rgba(240,122,109,.16)', 6);
      label(c, clipText(c, cm.hookName, slotW - 8, MONO), x + slotW / 2, y + 13, col, 'center', x + 4, x + slotW - 4, MONO);
      label(c, clipText(c, cm.readVal, slotW - 8, MONO), x + slotW / 2, y + 28, C.ink, 'center', x + 4, x + slotW - 4, MONO);
      const targetX = startX + cm.readSlot * (slotW + 18) + slotW / 2;
      arrow(c, x + slotW / 2, y - 2, targetX, 76, col, cm.ok ? null : [4, 3]);
    });

    // Circular queue.pending at bottom
    const qy = h - 78;
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(pad, qy - 12); c.lineTo(w - pad, qy - 12); c.stroke();
    label(c, t('ch5.cv.ring'), pad, qy, C.gold, 'left', pad, w - pad);
    const qw = Math.min(140, Math.floor((w - pad * 2 - 48) / S.queueNodes.length));
    const qStart = Math.max(pad, Math.floor((w - (qw * S.queueNodes.length + 34)) / 2));
    S.queueNodes.forEach((u, i) => {
      const ux = qStart + i * (qw + 34), uy = qy + 18;
      const skipped = S.appliedTrace[i] && S.appliedTrace[i].status !== 'applied';
      const col = skipped ? C.violet : C.gold;
      rbox(c, ux, uy, qw, 32, col, skipped ? 'rgba(179,157,251,.16)' : 'rgba(233,185,73,.14)', 6);
      label(c, clipText(c, `u${i}: ${u.text}`, qw - 10, MONO), ux + qw / 2, uy + 16, C.ink, 'center', ux + 4, ux + qw - 4, MONO);
      if (i < S.queueNodes.length - 1) arrow(c, ux + qw + 2, uy + 16, ux + qw + 32, uy + 16, C.gold);
    });
    if (S.queueNodes.length >= 2) {
      const xFirst = qStart + qw / 2, xLast = qStart + (S.queueNodes.length - 1) * (qw + 34) + qw / 2;
      const uy = qy + 50;
      c.strokeStyle = C.gold; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(xLast, uy); c.lineTo(xLast, uy + 14); c.lineTo(xFirst, uy + 14); c.lineTo(xFirst, uy + 2); c.stroke();
      arrow(c, xFirst, uy + 8, xFirst, uy + 1, C.gold);
    }
  } });
  onAll($$('input[name=c5Q]'), 'change', update);
  chkLab('#c5Skip', update);
  chkLab('#c5Low', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch6: beginWork / completeWork & subtreeFlags bubbling ═════════ */
(function ch6() {
  const cv = $('#c6Cv');
  let customId = null;
  let S = null;
  let rowMetrics = { topY: 32, rowH: 20 };

  function update() {
    const pre = radioVal('c6Pre') || 'singleLeaf';
    S = M.traverseAndBubble(customId != null ? 'custom' : pre, customId);
    put('#c6Ren', `${S.stats.renderVisited} / ${S.stats.totalNodes}`);
    put('#c6Com', `${S.stats.commitVisited} / ${S.stats.totalNodes}`);
    put('#c6Skip', String(S.stats.commitSkipped));
    put('#c6Mask', S.stats.rootSubtreeHex);
    const pct = fmt((S.stats.commitSkipped / S.stats.totalNodes) * 100, 0) + '%';
    putHTML('#c6Say', t('ch6.say', {
      mask: S.stats.rootSubtreeHex,
      total: String(S.stats.totalNodes),
      render: String(S.stats.renderVisited),
      commit: String(S.stats.commitVisited),
      skip: String(S.stats.commitSkipped),
      pct
    }));
    sim.dirty = true;
  }

  // Indented DFS tree order for clean interactive layout at any width (320..1280)
  const DEPTHS = [];
  (function buildDepth(id, d) {
    DEPTHS.push({ id, depth: d });
    for (const ch of M.BUBBLE_TREE[id].children) buildDepth(ch, d + 1);
  })(0, 0);

  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const narrow = w < 440;
    const pad = 12, topY = narrow ? 38 : 28, rowH = Math.floor((h - topY - 8) / DEPTHS.length);
    rowMetrics = { topY, rowH };

    // Legend bar at top (2-row wrap on narrow screens so all three labels stay inside canvas)
    if (narrow) {
      const half = Math.floor((w - pad * 2) / 2);
      label(c, clipText(c, '■ ' + t('ch6.cv.legVis'), half - 4, FONT), pad, 11, C.cyan, 'left', pad, pad + half - 2);
      label(c, clipText(c, '■ ' + t('ch6.cv.legCom'), half - 4, FONT), pad + half, 11, C.gold, 'left', pad + half, w - pad);
      label(c, clipText(c, '■ ' + t('ch6.cv.legSkip'), w - pad * 2, FONT), pad, 25, C.mute, 'left', pad, w - pad);
    } else {
      const l1 = label(c, '■ ' + t('ch6.cv.legVis'), pad, 13, C.cyan, 'left', pad, w - pad);
      const l2 = label(c, '■ ' + t('ch6.cv.legCom'), l1.r + 12, 13, C.gold, 'left', l1.r + 8, w - pad);
      label(c, '■ ' + t('ch6.cv.legSkip'), l2.r + 12, 13, C.mute, 'left', l2.r + 8, w - pad);
    }

    const indentStep = w < 420 ? 12 : 18;
    const rightColW = w < 420 ? 104 : 168;

    DEPTHS.forEach(({ id, depth }, row) => {
      const n = S.nodes[id];
      const y = topY + row * rowH;
      const x = pad + depth * indentStep;
      const col = n.commitVisited ? C.gold : n.renderVisited ? C.cyan : C.mute;
      const bg = n.flags ? 'rgba(233,185,73,.18)' : n.commitVisited ? 'rgba(233,185,73,.07)' : 'transparent';
      if (bg !== 'transparent') rbox(c, pad, y + 1, w - pad * 2, rowH - 2, n.flags ? C.gold : 'rgba(233,185,73,.25)', bg, 4);

      if (depth > 0) {
        c.strokeStyle = C.line; c.lineWidth = 1;
        c.beginPath(); c.moveTo(x - indentStep * 0.6, y + rowH / 2); c.lineTo(x - 4, y + rowH / 2); c.stroke();
      }
      const nameMax = w - pad - rightColW - x - 4;
      label(c, clipText(c, n.label, Math.max(40, nameMax), MONO), x, y + rowH / 2, col, 'left', x, w - rightColW - pad, MONO);

      const badge = w < 420
        ? `f:${M.hexFlag(n.flags)} s:${M.hexFlag(n.subtreeFlags)}`
        : `flags:${M.hexFlag(n.flags)} sub:${M.hexFlag(n.subtreeFlags)}`;
      label(c, clipText(c, badge, rightColW, MONO), w - pad, y + rowH / 2, n.subtreeFlags || n.flags ? col : C.mute, 'right', w - pad - rightColW, w - pad, MONO);
    });
  } });

  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    const py = e.clientY - r.top;
    const row = Math.floor((py - rowMetrics.topY) / rowMetrics.rowH);
    if (row >= 0 && row < DEPTHS.length) {
      customId = DEPTHS[row].id;
      update();
    }
  });
  onAll($$('input[name=c6Pre]'), 'change', () => { customId = null; update(); });
  langHooks.push(update);
  update();
})();

/* ═════════ ch7: Commit phases & useLayoutEffect vs useEffect ═════════ */
(function ch7() {
  const cv = $('#c7Cv'), rS = $('#c7Ren'), lS = $('#c7Lay'), pS = $('#c7Pas');
  let S = null;
  function update() {
    const ren = +rS.value, lay = +lS.value, pas = +pS.value, hk = radioVal('c7Hook') || 'layout';
    S = M.simulateCommitTimeline({ renderMs: ren, mutationMs: 1.5, layoutEffectMs: lay, passiveEffectMs: pas, tooltipMode: hk });
    sliderOut('c7Ren', t('u.ms', { v: fmt(ren, 1) }));
    sliderOut('c7Lay', t('u.ms', { v: fmt(lay, 1) }));
    sliderOut('c7Pas', t('u.ms', { v: fmt(pas, 1) }));
    put('#c7Paint', t('u.ms', { v: fmt(S.timeToPaintMs, 1) }));
    put('#c7Tot', t('u.ms', { v: fmt(S.totalTaskMs, 1) }));
    put('#c7Drop', String(S.droppedFrames));
    put('#c7Flash', S.visualFlash ? t('ch7.val.yes') : t('ch7.val.no'));
    const kind = hk === 'passive' ? 'passiveFlash' : S.droppedFrames > 0 ? 'layoutSlow' : 'layoutOk';
    putHTML('#c7Say', t('ch7.say.' + kind, {
      paint: fmt(S.timeToPaintMs, 1),
      budget: fmt(S.frameBudgetMs, 2),
      drop: String(S.droppedFrames)
    }));
    sim.dirty = true;
  }
  const COL = {
    render: C.cyan, beforeMutation: C.mute, mutation: C.gold,
    layout: C.red, syncReCommit: C.red, paint: C.green, passive: C.violet
  };
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const maxT = Math.max(20, Math.ceil(S.totalTaskMs / 5) * 5 + 2);
    const padL = 16, padR = 16, barT = 56, barH = 38, B = h - 42;
    const F = { L: padL, R: w - padR, T: 20, B, X: x => padL + (w - padL - padR) * (x / maxT) };

    // Timeline track & segments
    rbox(c, F.L, barT, F.R - F.L, barH, C.line, C.card2, 6);
    S.segments.forEach(seg => {
      const x0 = F.X(seg.start), x1 = F.X(seg.end), sw = Math.max(2, x1 - x0);
      rbox(c, x0, barT + 2, sw, barH - 4, null, COL[seg.phase] || C.mute, 4);
      if (sw >= 36) {
        const shortN = seg.phase === 'beforeMutation' ? 'Pre' : seg.phase === 'layout' ? 'Layout' : seg.phase === 'syncReCommit' ? 'Re' : seg.phase === 'paint' ? 'Paint' : seg.phase === 'passive' ? 'Effect' : seg.name;
        label(c, clipText(c, shortN, sw - 4, MONO), x0 + sw / 2, barT + barH / 2, '#0c0e13', 'center', x0 + 2, x0 + sw - 2, MONO);
      }
    });

    // 16.67 ms budget line
    const bx = F.X(S.frameBudgetMs);
    c.strokeStyle = C.red; c.lineWidth = 1.6; c.setLineDash([4, 3]);
    c.beginPath(); c.moveTo(bx, 28); c.lineTo(bx, B); c.stroke(); c.setLineDash([]);
    label(c, t('ch7.cv.budget'), bx, 18, C.red, 'center', F.L, F.R);

    // Paint timestamp marker below bar
    const px = F.X(S.timeToPaintMs);
    c.strokeStyle = C.green; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(px, barT + barH); c.lineTo(px, barT + barH + 14); c.stroke();
    label(c, `${t('ch7.cv.paintAt')}: ${fmt(S.timeToPaintMs, 1)} ms`, px, barT + barH + 24, C.green, 'center', F.L, F.R);

    // X axis & ticks
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(F.L, B); c.lineTo(F.R, B); c.stroke();
    const ticks = [];
    for (let v = 0; v <= maxT; v += 5) ticks.push([v, String(v)]);
    xTicks(c, F, ticks);
    label(c, t('ch7.cv.x'), F.R, h - 10, C.mute, 'right', F.L, F.R);
  } });
  rangeLab('#c7Ren', update);
  rangeLab('#c7Lay', update);
  rangeLab('#c7Pas', update);
  onAll($$('input[name=c7Hook]'), 'change', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch8: Event delegation & Microtask batching ═════════ */
(function ch8() {
  const cv = $('#c8Cv'), callsS = $('#c8Calls'), stopChk = $('#c8Stop');
  let S = null;
  function update() {
    const trig = radioVal('c8Trig') || 'click';
    const calls = +callsS.value, stop = stopChk.checked;
    S = M.simulateEventsAndBatching({ triggerKind: trig, setStateCalls: calls, stopAtCard: stop });
    sliderOut('c8Calls', t('u.calls', { v: String(calls) }));
    put('#c8Nat', String(S.nativeListenersAttached));
    put('#c8Hnd', String(S.totalHandlersRun));
    put('#c8Lane', S.assignedLaneName);
    put('#c8Com', String(S.commitCount));
    const kind = trig === 'flushSync' ? 'flush' : 'batched';
    putHTML('#c8Say', t('ch8.say.' + kind, {
      native: String(S.nativeListenersAttached),
      handlers: String(S.totalHandlersRun),
      calls: String(S.setStateCalls),
      commits: String(S.commitCount),
      lane: S.assignedLaneName
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const narrow = w < 460;
    const pad = 12, leftW = narrow ? Math.floor(w * 0.36) : Math.min(185, Math.floor(w * 0.44));
    const rowH = narrow ? 35 : 44, gap = narrow ? 10 : 14, topY = narrow ? 48 : 32;
    const laneX0 = pad + leftW + (narrow ? 22 : 24), laneR = w - pad - (narrow ? 14 : 24);
    const lanes = [
      { x: laneX0, label: t('ch8.cv.nat'), col: C.gold, y: narrow ? 10 : 12, align: narrow ? 'left' : 'center', lo: narrow ? pad + leftW + 4 : pad + leftW + 6, hi: w - 4 },
      { x: Math.round((laneX0 + laneR) / 2), label: t('ch8.cv.cap'), col: C.cyan, y: narrow ? 23 : 12, align: 'center', lo: pad + leftW + 4, hi: w - 4 },
      { x: laneR, label: t('ch8.cv.bub'), col: C.violet, y: narrow ? 36 : 12, align: narrow ? 'right' : 'center', lo: pad + leftW + 4, hi: w - 4 }
    ];
    const maxLab = narrow ? Math.max(54, laneR - laneX0) : 84;
    lanes.forEach(ln => {
      label(c, clipText(c, ln.label, maxLab, FONT), ln.x, ln.y, ln.col, ln.align, ln.lo, ln.hi);
    });

    S.tree.forEach((node, i) => {
      const y = topY + i * (rowH + gap);
      const col = node.isContainer ? C.cyan : i === 3 ? C.gold : C.line;
      rbox(c, pad, y, leftW, rowH, col, node.isContainer ? 'rgba(99,199,230,.12)' : i === 3 ? 'rgba(233,185,73,.14)' : C.card2, 6);
      label(c, clipText(c, node.name, leftW - 12, MONO), pad + 8, y + rowH / 2, C.ink, 'left', pad + 4, pad + leftW - 4, MONO);
    });

    const yOf = idx => topY + idx * (rowH + gap) + rowH / 2;
    // Native bubble arrow (3 -> 0)
    arrow(c, lanes[0].x, yOf(3), lanes[0].x, yOf(0), C.gold);
    // Capture arrow (0 -> 3)
    arrow(c, lanes[1].x, yOf(0), lanes[1].x, yOf(3), C.cyan);
    // Bubble arrow (3 -> 0 or stopped at 2)
    const stopIdx = S.stopAtCard ? 2 : 0;
    arrow(c, lanes[2].x, yOf(3), lanes[2].x, yOf(stopIdx), S.stopAtCard ? C.red : C.violet);
    if (S.stopAtCard) {
      c.strokeStyle = C.red; c.lineWidth = 2;
      c.beginPath(); c.moveTo(lanes[2].x - 7, yOf(2) - 4); c.lineTo(lanes[2].x + 7, yOf(2) - 4); c.stroke();
    }
  } });
  onAll($$('input[name=c8Trig]'), 'change', update);
  rangeLab('#c8Calls', update);
  chkLab('#c8Stop', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch9: 31-bit Lanes & Concurrent Preemption Scheduler ═════════ */
(function ch9() {
  const cv = $('#c9Cv'), trChk = $('#c9Trans'), ndS = $('#c9Nodes'), keyS = $('#c9Key');
  let S = null;
  function update() {
    const tr = trChk.checked, nodes = +ndS.value, keyAt = +keyS.value;
    S = M.simulateLanesScheduler({ useTransition: tr, listNodes: nodes, nodeCostMs: 1.5, keystrokeAtMs: keyAt });
    sliderOut('c9Nodes', t('u.nodes', { v: String(nodes) }));
    sliderOut('c9Key', t('u.ms', { v: fmt(keyAt, 0) }));
    put('#c9Bits', S.pendingMaskBits);
    put('#c9Yld', String(S.yieldCount));
    put('#c9Lat', t('u.ms', { v: fmt(S.inputLatencyMs, 1) }));
    put('#c9List', t('u.ms', { v: fmt(S.listCommitMs, 1) }));
    const kind = S.useTransition ? 'concurrent' : 'blocked';
    putHTML('#c9Say', t('ch9.say.' + kind, {
      at: fmt(keyAt, 0),
      lat: fmt(S.inputLatencyMs, 1)
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const maxT = Math.max(24, Math.ceil(S.totalTimeMs / 5) * 5 + 2);
    const padL = 16, padR = 16, barT = 56, barH = 38, B = h - 42;
    const F = { L: padL, R: w - padR, T: 20, B, X: x => padL + (w - padL - padR) * (x / maxT) };

    rbox(c, F.L, barT, F.R - F.L, barH, C.line, C.card2, 6);
    S.timeline.forEach(seg => {
      const x0 = F.X(seg.start), x1 = F.X(seg.end), sw = Math.max(2, x1 - x0);
      const col = seg.kind === 'urgent' ? C.red : seg.kind === 'transition' ? C.violet : seg.kind === 'commit' ? C.green : C.gold;
      rbox(c, x0, barT + 2, sw, barH - 4, null, col, 4);
      if (sw >= 26 && seg.nodes) {
        label(c, `${seg.nodes}n`, x0 + sw / 2, barT + barH / 2, '#0c0e13', 'center', x0 + 2, x0 + sw - 2, MONO);
      }
    });

    // Keystroke arrival line (dashed) and commit marker
    const kx = F.X(S.keystrokeAtMs), cx = F.X(S.keyCommitMs);
    c.strokeStyle = C.red; c.lineWidth = 1.5; c.setLineDash([4, 3]);
    c.beginPath(); c.moveTo(kx, 26); c.lineTo(kx, barT + barH); c.stroke(); c.setLineDash([]);
    // Wait bracket below bar
    c.strokeStyle = C.gold; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(kx, barT + barH + 10); c.lineTo(cx, barT + barH + 10); c.stroke();
    label(c, `${t('ch9.cv.wait')}: ${fmt(S.inputLatencyMs, 1)} ms`, (kx + cx) / 2, barT + barH + 24, C.gold, 'center', F.L, F.R);

    // 16.67 ms budget line
    const fx = F.X(M.PINNED.frameBudgetMs);
    c.strokeStyle = C.mute; c.lineWidth = 1; c.setLineDash([2, 3]);
    c.beginPath(); c.moveTo(fx, 20); c.lineTo(fx, B); c.stroke(); c.setLineDash([]);
    label(c, '16.7 ms', fx, 16, C.mute, 'center', F.L, F.R, MONO);

    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(F.L, B); c.lineTo(F.R, B); c.stroke();
    const ticks = [];
    for (let v = 0; v <= maxT; v += 5) ticks.push([v, String(v)]);
    xTicks(c, F, ticks);
    label(c, t('ch9.cv.x'), F.R, h - 10, C.mute, 'right', F.L, F.R);
  } });
  chkLab('#c9Trans', update);
  rangeLab('#c9Nodes', update);
  rangeLab('#c9Key', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch10: React Compiler useMemoCache(4) ═════════ */
(function ch10() {
  const cv = $('#c10Cv'), compChk = $('#c10Comp'), renS = $('#c10Ren');
  const WHAT_KEYS = { parentOnly: 'ch10.w.parent', theme: 'ch10.w.theme', items: 'ch10.w.items' };
  let S = null;
  function update() {
    const comp = compChk.checked, what = radioVal('c10What') || 'parentOnly', ren = +renS.value;
    S = M.simulateCompilerCache({ compiled: comp, stepKind: what, renderCount: ren });
    sliderOut('c10Ren', String(ren));
    put('#c10Slots', String(S.cacheSize));
    put('#c10Hits', String(S.slotHits));
    put('#c10Calc', String(S.filterComputes));
    put('#c10Bail', String(S.childBailedOut));
    const kind = !comp ? 'uncompiled' : what === 'parentOnly' ? 'hit' : 'recompute';
    putHTML('#c10Say', t('ch10.say.' + kind, {
      slots: String(S.cacheSize),
      renders: String(S.renderCount),
      hits: String(S.slotHits),
      calc: String(S.filterComputes),
      bail: String(S.childBailedOut),
      what: t(WHAT_KEYS[what])
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, { draw() {
    if (!S) return;
    const { c, w, h } = fit(cv);
    const pad = 12;
    // Top row: 4 memoCache slots ($[0]..$[3])
    const slotLabels = ['$[0] items', '$[1] list', '$[2] theme', '$[3] <Hdr/>'];
    const sw = Math.floor((w - pad * 2 - 24) / 4);
    slotLabels.forEach((lbl, i) => {
      const sx = pad + i * (sw + 8), sy = 16;
      const col = S.compiled ? C.violet : C.line;
      rbox(c, sx, sy, sw, 38, col, S.compiled ? 'rgba(179,157,251,.14)' : C.card2, 6);
      label(c, clipText(c, S.compiled ? lbl : '—', sw - 8, MONO), sx + sw / 2, sy + 19, S.compiled ? C.ink : C.mute, 'center', sx + 4, sx + sw - 4, MONO);
    });

    // Bottom grid: renders R1..RN
    const n = S.trace.length, cols = n;
    const cw = Math.min(92, Math.floor((w - pad * 2 - (cols - 1) * 6) / cols));
    const startX = Math.max(pad, Math.floor((w - (cw * cols + (cols - 1) * 6)) / 2));
    const topY = 74, rowH = 34;
    S.trace.forEach((tr, i) => {
      const rx = startX + i * (cw + 6);
      label(c, 'R' + tr.render, rx + cw / 2, topY, C.mute, 'center', rx, rx + cw, MONO);
      // Scope 0 box
      const c0 = tr.scope0Hit ? C.green : C.gold;
      rbox(c, rx, topY + 14, cw, rowH, c0, tr.scope0Hit ? 'rgba(122,214,160,.16)' : 'rgba(233,185,73,.16)', 5);
      label(c, clipText(c, tr.scope0Hit ? 'S0:HIT' : 'S0:RUN', cw - 6, MONO), rx + cw / 2, topY + 14 + rowH / 2, c0, 'center', rx + 2, rx + cw - 2, MONO);
      // Scope 1 box
      const c1 = tr.scope1Hit ? C.green : C.gold;
      rbox(c, rx, topY + 54, cw, rowH, c1, tr.scope1Hit ? 'rgba(122,214,160,.16)' : 'rgba(233,185,73,.16)', 5);
      label(c, clipText(c, tr.scope1Hit ? 'S1:HIT' : 'S1:RUN', cw - 6, MONO), rx + cw / 2, topY + 54 + rowH / 2, c1, 'center', rx + 2, rx + cw - 2, MONO);
      // Bailout badge
      if (tr.childReused) {
        label(c, 'bail', rx + cw / 2, topY + 102, C.cyan, 'center', rx, rx + cw, MONO);
      }
    });
  } });
  chkLab('#c10Comp', update);
  onAll($$('input[name=c10What]'), 'change', update);
  rangeLab('#c10Ren', update);
  langHooks.push(update);
  update();
})();

applyLang();
requestAnimationFrame(loop);
window.__essayReady = true;
})();
