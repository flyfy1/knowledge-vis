/* How Containers Isolate a Process: i18n runtime, model wiring and 2D canvas drawing.
   All visible text comes from copy.*.js (generated from content.<lang>.md by scripts/build-pages.cjs);
   static diagrams are inline SVG partials (figures/dg-*.html). Nothing animates automatically on a timer,
   so prefers-reduced-motion requires no extra branch. Every label is clamped/ellipsized to avoid collisions
   at 1280/390/320 widths across both languages. */
(() => {
'use strict';
const M = window.ContainerModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254', card2: '#1a1f2b' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const MONO = '12px ui-monospace,Menlo,Consolas,monospace';

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
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + IntersectionObserver gating ───────── */
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
    s.dirty = true;
  }
}), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
function loop() { for (const s of sims) if (s.vis && s.dirty) { s.dirty = false; s.draw(); } requestAnimationFrame(loop); }

const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
const onAll = (els, ev, fn) => els.forEach(e => e.addEventListener(ev, fn));
const sliderOut = (id, s) => put('#' + id + 'o', s);
function rangeLab(sel, fn) { const e = $(sel); e.addEventListener('input', fn); e.addEventListener('change', fn); return e; }
const chkLab = (sel, fn) => $(sel).addEventListener('change', fn);

/* ───────── chart & label helpers ───────── */
function ellipsize(c, s, maxW, font) {
  c.font = font || FONT;
  const str = String(s);
  if (maxW <= 8) return '';
  if (c.measureText(str).width <= maxW) return str;
  let lo = 0, hi = str.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (c.measureText(str.slice(0, mid) + '…').width <= maxW) lo = mid;
    else hi = mid - 1;
  }
  return lo > 0 ? str.slice(0, lo) + '…' : '…';
}
function drawClipped(c, s, x, y, maxW, col, align, font) {
  c.font = font || FONT;
  c.fillStyle = col || C.ink;
  c.textAlign = align === 'middle' ? 'center' : (align || 'left');
  c.fillText(ellipsize(c, s, maxW, font || FONT), x, y);
}
function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return {
    L, R, T, B,
    X: x => L + (R - L) * (x - x0) / ((x1 - x0) || 1),
    Y: y => B - (B - T) * (y - y0) / ((y1 - y0) || 1)
  };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1;
  c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { drawClipped(c, yLab, f.L + 4, f.T - 12, Math.max(40, f.R - f.L - 8), C.mute, 'left', FONT); }
  if (xLab) { drawClipped(c, xLab, f.R, f.B + 30, Math.max(40, f.R - f.L - 8), C.mute, 'right', FONT); }
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
    if (py > lastY - 14 || py < f.T + 2) continue;
    drawClipped(c, s, f.L - 6, py, f.L - 8, C.mute, 'right', FONT);
    lastY = py;
    c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, py); c.lineTo(f.R, py); c.stroke();
  }
}
function rr(c, x, y, w, h, r, fill, stroke, lw) {
  c.beginPath();
  c.roundRect(x, y, Math.max(1, w), Math.max(1, h), r || 4);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.2; c.stroke(); }
}

/* ═════════ ch1: Isolation boundary & memory footprint ═════════ */
(function ch1() {
  const cv = $('#c1Cv'), rep = $('#c1Rep');
  let S = null;
  function update() {
    const mode = radioVal('c1Mode') || 'container', n = +rep.value;
    S = M.isolationProfile(mode, n);
    sliderOut('c1Rep', t('u.count', { v: n }));
    put('#c1Mem', t('u.mib', { v: fmt(S.totalMb, 1) }));
    put('#c1Boot', t('u.ms', { v: fmt(S.bootMs, 0) }));
    put('#c1Kern', S.sharedKernel ? t('ch1.kern.shared') : t('ch1.kern.iso'));
    put('#c1Sub', `${S.sharedSubsystems} / 10`);
    putHTML('#c1Say', t(S.sayKey, {
      n: S.replicas,
      mem: fmt(S.totalMb, 1),
      boot: fmt(S.bootMs, 0),
      ns: S.nsCount,
      over: fmt(S.perReplicaOverheadMb, 1),
      sub: S.sharedSubsystems
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const modes = ['process', 'container', 'microvm', 'vm'];
      const list = modes.map(m => M.isolationProfile(m, S.replicas));
      const maxMem = Math.max(...list.map(x => x.totalMb), 200);
      // Legend on top (2 rows when w < 440 so labels never crowd)
      const compact = w < 440;
      const legItems = [
        [C.cyan, t('ch1.leg.host')],
        [C.red, t('ch1.leg.guest')],
        [C.gold, t('ch1.leg.app')]
      ];
      if (compact) {
        legItems.slice(0, 2).forEach(([col, txt], i) => {
          const lx = 14 + i * (w / 2 - 10);
          c.fillStyle = col; c.fillRect(lx, 9, 10, 6);
          drawClipped(c, txt, lx + 14, 12, w / 2 - 28, C.mute, 'left', FONT);
        });
        c.fillStyle = legItems[2][0]; c.fillRect(14, 25, 10, 6);
        drawClipped(c, legItems[2][1], 28, 28, w - 42, C.mute, 'left', FONT);
      } else {
        let lx = 14;
        for (const [col, txt] of legItems) {
          c.fillStyle = col; c.fillRect(lx, 10, 10, 6);
          const tw = Math.min(130, c.measureText(txt).width);
          drawClipped(c, txt, lx + 14, 13, 130, C.mute, 'left', FONT);
          lx += 18 + tw + 14;
        }
      }
      const topY = compact ? 44 : 32, rowH = (h - topY - 10) / 4;
      const barL = 14, barR = w - 14, maxW = barR - barL;
      list.forEach((item, i) => {
        const y0 = topY + i * rowH;
        const active = item.mode === S.mode;
        const mLabel = t('ch1.mode.' + item.mode);
        const vLabel = t('u.mib', { v: fmt(item.totalMb, 1) });
        const vW = c.measureText(vLabel).width + 8;
        drawClipped(c, mLabel, barL, y0 + 10, maxW - vW - 6, active ? C.gold : C.ink, 'left', FONT);
        drawClipped(c, vLabel, barR, y0 + 10, vW, active ? C.gold : C.mute, 'right', MONO);
        const by = y0 + 21, bh = Math.max(12, Math.min(20, rowH - 28));
        rr(c, barL, by, maxW, bh, 4, C.card2, active ? C.gold : C.line, active ? 1.8 : 1);
        const hostW = (160 / maxMem) * maxW;
        const guestW = ((item.kernelMbTotal - 160) / maxMem) * maxW;
        const appW = (item.appMbTotal / maxMem) * maxW;
        let cx = barL;
        if (hostW > 1) { c.fillStyle = 'rgba(99,199,230,0.45)'; c.fillRect(cx + 1, by + 1, Math.max(0, hostW - 1), bh - 2); cx += hostW; }
        if (guestW > 1) { c.fillStyle = 'rgba(240,122,109,0.55)'; c.fillRect(cx, by + 1, guestW, bh - 2); cx += guestW; }
        if (appW > 1) { c.fillStyle = 'rgba(233,185,73,0.6)'; c.fillRect(cx, by + 1, Math.min(appW, barR - cx - 1), bh - 2); }
      });
    }
  });
  onAll($$('input[name=c1Mode]'), 'change', update);
  rangeLab('#c1Rep', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch2: OCI Image Layers & Content-Addressable ChainID ═════════ */
(function ch2() {
  const cv = $('#c2Cv'), rep = $('#c2Rep'), tbody = $('#c2Tbl tbody');
  let S = null;
  function update() {
    const mut = radioVal('c2Mut') || 'none', n = +rep.value;
    S = M.ociLayersModel({ mutate: mut, replicas: n });
    sliderOut('c2Rep', t('u.count', { v: n }));
    put('#c2Shared', t('u.mib', { v: fmt(S.sharedMiB, 0) }));
    put('#c2Stored', t('u.mib', { v: fmt(S.storedMiB, 0) }));
    put('#c2Naive', t('u.mib', { v: fmt(S.naiveMiB, 0) }));
    put('#c2Hits', `${S.cacheHits} / ${S.rows.length}`);
    tbody.innerHTML = S.rows.map(r => {
      const cls = r.shared ? 'hit' : 'miss';
      const st = r.shared ? t('ch2.st.shared') : t('ch2.st.rebuilt');
      return `<tr class="${cls}"><td>${r.id} (${r.sizeMiB} MiB)</td><td>${st}</td><td>${r.chainB.slice(0, 22)}…</td></tr>`;
    }).join('');
    putHTML('#c2Say', t(S.sayKey, {
      n: S.replicas,
      img: fmt(S.singleImageMiB, 0),
      shared: fmt(S.sharedMiB, 0),
      stored: fmt(S.storedMiB, 0),
      naive: fmt(S.naiveMiB, 0),
      saved: fmt(S.savedMiB, 0)
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const padL = 14, padR = w - 14, maxW = padR - padL;
      const maxMiB = Math.max(S.naiveMiB, 400);
      // Two comparison bars
      const bars = [
        { label: t('ch2.bar.naive', { n: S.replicas }), val: S.naiveMiB, col: C.red, y: 18 },
        { label: t('ch2.bar.stored'), val: S.storedMiB, col: C.green, y: 68 }
      ];
      bars.forEach(b => {
        const vTxt = t('u.mib', { v: fmt(b.val, 0) });
        const vW = c.measureText(vTxt).width + 8;
        drawClipped(c, b.label, padL, b.y, maxW - vW - 6, C.ink, 'left', FONT);
        drawClipped(c, vTxt, padR, b.y, vW, b.col, 'right', MONO);
        rr(c, padL, b.y + 11, maxW, 18, 4, C.card2, C.line, 1);
        const fw = Math.max(4, (b.val / maxMiB) * maxW);
        rr(c, padL + 1, b.y + 12, Math.max(2, fw - 2), 16, 3, b.col === C.red ? 'rgba(240,122,109,0.45)' : 'rgba(122,214,160,0.5)', null, 0);
      });

      // Layer strip showing L0..L3 proportional share vs rebuilt
      const ly = h - 46;
      drawClipped(c, t('ch2.bar.layers'), padL, ly - 12, maxW, C.mute, 'left', FONT);
      const minW = 28;
      const remW = maxW - minW * S.rows.length;
      const sumSz = S.rows.reduce((a, r) => a + r.sizeMiB, 0);
      let cx = padL;
      S.rows.forEach((r, idx) => {
        const lw = minW + (r.sizeMiB / sumSz) * remW;
        const fill = r.shared ? 'rgba(122,214,160,0.28)' : 'rgba(240,122,109,0.28)';
        const stroke = r.shared ? C.green : C.red;
        rr(c, cx, ly, lw - 3, 26, 4, fill, stroke, 1.2);
        const txt = lw > 64 ? `${r.id} ${r.sizeMiB}M` : r.id;
        drawClipped(c, txt, cx + (lw - 3) / 2, ly + 13, lw - 8, r.shared ? C.green : C.red, 'middle', MONO);
        cx += lw;
        void idx;
      });
    }
  });
  onAll($$('input[name=c2Mut]'), 'change', update);
  rangeLab('#c2Rep', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch3: OverlayFS Copy-Up & Whiteouts ═════════ */
(function ch3() {
  const cv = $('#c3Cv');
  let S = null;
  function update() {
    const op = radioVal('c3Op') || 'read';
    S = M.overlayfsModel(op);
    put('#c3Copy', t('u.mib', { v: fmt(S.copyUpMiB, 1) }));
    put('#c3Up', t('u.mib', { v: fmt(S.upperMiB, 1) }));
    put('#c3Tot', t('u.mib', { v: fmt(S.totalStoredMiB, 1) }));
    put('#c3Waste', t('u.mib', { v: fmt(S.wastedMiB, 1) }));
    putHTML('#c3Say', t(S.sayKey, {
      copy: fmt(S.copyUpMiB, 1),
      upper: fmt(S.upperMiB, 1),
      total: fmt(S.totalStoredMiB, 1),
      vis: fmt(S.visibleMiB, 1),
      waste: fmt(S.wastedMiB, 1)
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const padL = 14, padR = w - 14, bw = padR - padL;
      const tiers = [
        { title: t('ch3.tier.lower'), col: C.cyan, items: [...S.l0, ...S.l1] },
        { title: t('ch3.tier.upper'), col: C.gold, items: S.upper.length ? S.upper : [{ path: t('ch3.empty'), sizeMiB: null }] },
        { title: t('ch3.tier.merged'), col: C.green, items: S.merged }
      ];
      const gap = 10, tierH = (h - 24 - gap * 2) / 3;
      tiers.forEach((tr, ti) => {
        const y0 = 12 + ti * (tierH + gap);
        rr(c, padL, y0, bw, tierH, 6, C.card2, tr.col, 1.3);
        drawClipped(c, tr.title, padL + 10, y0 + 13, bw - 20, tr.col, 'left', FONT);
        const lineStr = tr.items.map(it => {
          if (it.sizeMiB == null) return it.path;
          const shortP = it.path.split('/').pop();
          return it.sizeMiB === 0 ? `${shortP}(0B)` : `${shortP}(${it.sizeMiB >= 1 ? it.sizeMiB.toFixed(0) + 'M' : '<1M'})`;
        }).join(' · ');
        drawClipped(c, lineStr, padL + 10, y0 + tierH * 0.62, bw - 20, C.body, 'left', MONO);
      });
    }
  });
  onAll($$('input[name=c3Op]'), 'change', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch4: Linux Namespaces & Rootless UserNS ═════════ */
(function ch4() {
  const cv = $('#c4Cv');
  let S = null;
  function update() {
    S = M.namespaceModel({
      pidNs: $('#c4Pid').checked,
      procRemount: $('#c4Proc').checked,
      mntNs: $('#c4Mnt').checked,
      netNs: $('#c4Net').checked,
      userNs: $('#c4User').checked
    });
    put('#c4PidOut', `${S.insidePid} / ${S.hostPid}`);
    put('#c4UidOut', `${S.uidInside} → ${S.uidOutside}`);
    put('#c4Procs', String(S.visibleProcs));
    put('#c4Ns', `${S.isolatedCount} / ${S.totalNs}`);
    putHTML('#c4Say', t(S.sayKey, {
      inPid: S.insidePid,
      hostPid: S.hostPid,
      uidOut: S.uidOutside,
      procs: S.visibleProcs
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const padL = 14, padR = w - 14, bw = padR - padL;
      // Top 4x2 grid of 8 namespaces
      const cols = 4, cellGap = 6, cw = (bw - cellGap * (cols - 1)) / cols, ch = 26;
      M.NS_ALL.forEach((ns, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = padL + col * (cw + cellGap), y = 12 + row * (ch + 6);
        const on = S.isolated[ns];
        const stroke = on ? (ns === 'USER' ? C.gold : C.cyan) : C.red;
        const fill = on ? (ns === 'USER' ? 'rgba(233,185,73,0.18)' : 'rgba(99,199,230,0.14)') : 'rgba(240,122,109,0.1)';
        rr(c, x, y, cw, ch, 5, fill, stroke, 1.2);
        drawClipped(c, `${ns} ${on ? '✓' : '×'}`, x + cw / 2, y + ch / 2, cw - 6, stroke, 'middle', MONO);
      });

      // Two full-width cards below so labels never clip at 320px
      const topCard = 84, cardGap = 10, cardH = (h - topCard - 12 - cardGap) / 2;
      rr(c, padL, topCard, bw, cardH, 6, C.card2, C.gold, 1.3);
      drawClipped(c, t('ch4.cv.inside'), padL + 10, topCard + 15, bw - 20, C.gold, 'left', FONT);
      drawClipped(c, `PID ${S.insidePid} · UID ${S.uidInside} · ps=${S.visibleProcs}`, padL + 10, topCard + cardH * 0.64, bw - 20, C.ink, 'left', MONO);

      const y2 = topCard + cardH + cardGap;
      rr(c, padL, y2, bw, cardH, 6, C.card2, S.uidOutside === 0 ? C.red : C.green, 1.3);
      drawClipped(c, t('ch4.cv.outside'), padL + 10, y2 + 15, bw - 20, S.uidOutside === 0 ? C.red : C.green, 'left', FONT);
      drawClipped(c, `PID ${S.hostPid} · uid_map ${S.uidMapLine}`, padL + 10, y2 + cardH * 0.64, bw - 20, C.body, 'left', MONO);
    }
  });
  ['#c4Pid', '#c4Proc', '#c4Mnt', '#c4Net', '#c4User'].forEach(s => chkLab(s, update));
  langHooks.push(update);
  update();
})();

/* ═════════ ch5: Container Networking (veth, bridge, NAT, VXLAN) ═════════ */
(function ch5() {
  const cv = $('#c5Cv'), pkt = $('#c5Pkt'), kpps = $('#c5Kpps'), vx = $('#c5Vx');
  let S = null;
  function update() {
    const mode = radioVal('c5Mode') || 'bridge-nat';
    S = M.networkModel({ mode, payloadBytes: +pkt.value, kpps: +kpps.value, vxlan: vx.checked });
    sliderOut('c5Pkt', t('u.bytes', { v: S.payloadBytes }));
    sliderOut('c5Kpps', t('u.kpps', { v: S.kpps }));
    put('#c5Hops', String(S.stages.length));
    put('#c5Cpu', t('u.pct', { v: fmt(S.cpuCoresPct, 1) }));
    put('#c5Mtu', `${S.ipPayload} / ${S.mtuLimit} B`);
    put('#c5Frag', S.fragmented ? t('ch5.frag.yes') : t('ch5.frag.no'));
    putHTML('#c5Say', t(S.sayKey, {
      ns: S.netnsCross,
      hooks: S.conntrackHooks,
      cpu: fmt(S.cpuCoresPct, 1),
      ip: S.ipPayload,
      mtu: S.mtuLimit
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const padL = 14, padR = w - 14, bw = padR - padL;
      drawClipped(c, t('ch5.cv.path'), padL, 16, bw, C.mute, 'left', FONT);

      // Stages: single row on wide (>=440), 2 rows on narrow (<440)
      const st = S.stages;
      const twoRows = w < 440 && st.length > 3;
      const rows = twoRows ? [st.slice(0, 3), st.slice(3)] : [st];
      rows.forEach((row, ri) => {
        const y = twoRows ? (34 + ri * 46) : 44;
        const n = row.length, gap = 12, boxW = Math.min(130, (bw - gap * (n - 1)) / n);
        row.forEach((name, ci) => {
          const x = padL + ci * (boxW + gap);
          const col = name === 'nftables' ? C.violet : name.includes('veth') ? C.cyan : name === 'nic' || name === 'peer' ? C.green : C.gold;
          rr(c, x, y, boxW, 34, 5, C.card2, col, 1.3);
          drawClipped(c, name, x + boxW / 2, y + 17, boxW - 8, col, 'middle', MONO);
          if (ci < n - 1) {
            c.strokeStyle = C.mute; c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(x + boxW + 2, y + 17); c.lineTo(x + boxW + gap - 2, y + 17); c.stroke();
          }
        });
      });

      // Bottom MTU bar (placed cleanly below stage boxes)
      const barY = h - 76;
      const mtuLabel = t('ch5.cv.mtu');
      const mtuStat = `${S.ipPayload} / ${S.mtuLimit} B`;
      const statW = c.measureText(mtuStat).width + 8;
      drawClipped(c, mtuLabel, padL, barY, bw - statW - 6, C.ink, 'left', FONT);
      drawClipped(c, mtuStat, padR, barY, statW, S.fragmented ? C.red : C.green, 'right', MONO);

      const totalW = Math.max(1500, S.ipPayload + S.vxlanOverhead);
      rr(c, padL, barY + 14, bw, 22, 4, C.card2, S.fragmented ? C.red : C.line, 1.2);
      const payW = (S.ipPayload / totalW) * bw;
      const vxW = (S.vxlanOverhead / totalW) * bw;
      c.fillStyle = S.fragmented ? 'rgba(240,122,109,0.5)' : 'rgba(99,199,230,0.45)';
      c.fillRect(padL + 1, barY + 15, Math.max(2, payW - 1), 20);
      if (vxW > 1) {
        c.fillStyle = 'rgba(179,157,251,0.55)';
        c.fillRect(padL + payW, barY + 15, vxW, 20);
      }
      const mtuX = padL + (1500 / totalW) * bw;
      c.strokeStyle = C.gold; c.lineWidth = 2; c.setLineDash([4, 3]);
      c.beginPath(); c.moveTo(mtuX, barY + 10); c.lineTo(mtuX, barY + 42); c.stroke();
      c.setLineDash([]);
      drawClipped(c, '1500 B MTU', Math.min(padR, Math.max(padL + 60, mtuX)), barY + 52, 90, C.gold, 'right', MONO);
    }
  });
  onAll($$('input[name=c5Mode]'), 'change', update);
  rangeLab('#c5Pkt', update);
  rangeLab('#c5Kpps', update);
  chkLab('#c5Vx', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch6: cgroups v2 CPU Bandwidth Throttling ═════════ */
(function ch6() {
  const cv = $('#c6Cv'), cpus = $('#c6Cpus'), thr = $('#c6Thr');
  let S = null;
  function update() {
    const per = +(radioVal('c6Per') || 100);
    S = M.cfsThrottleModel({ cpus: +cpus.value, threads: +thr.value, periodMs: per });
    sliderOut('c6Cpus', t('u.cpus', { v: fmt(S.cpus, 2) }));
    sliderOut('c6Thr', t('u.thr', { v: S.threads }));
    put('#c6Burn', t('u.ms', { v: fmt(S.burnMs, 2) }));
    put('#c6Freeze', t('u.ms', { v: fmt(S.freezeMs, 2) }));
    put('#c6Rpc', t('u.ms', { v: fmt(S.singleBurstRpcMs, 1) }));
    put('#c6Stat', `${S.nrThrottled} / ${S.nrPeriods}`);
    putHTML('#c6Say', t(S.sayKey, {
      cpus: fmt(S.cpus, 2),
      quota: fmt(S.quotaMs, 1),
      period: S.periodMs,
      thr: S.threads,
      burn: fmt(S.burnMs, 2),
      freeze: fmt(S.freezeMs, 2),
      rpc: fmt(S.singleBurstRpcMs, 1)
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const f = frame(w, h, [32, 16, 44, 42], 0, S.windowMs, 0, S.threads);
      axes(c, f, t('ch6.cv.x'), `cpu.max = ${S.quotaUs} ${S.periodUs}`);
      xTicks(c, f, [[0, '0'], [50, '50'], [100, '100'], [150, '150'], [200, '200 ms']]);

      const laneH = (f.B - f.T) / S.threads;
      for (let i = 0; i < S.threads; i++) {
        const ly = f.T + i * laneH;
        drawClipped(c, `T${i + 1}`, f.L - 6, ly + laneH / 2, f.L - 8, C.mute, 'right', MONO);
      }
      for (const seg of S.segments) {
        const x0 = f.X(seg.t0), xAct = f.X(seg.activeEnd), xEnd = f.X(seg.periodEnd);
        c.strokeStyle = C.grid; c.lineWidth = 1;
        c.beginPath(); c.moveTo(xEnd, f.T); c.lineTo(xEnd, f.B); c.stroke();
        for (let i = 0; i < S.threads; i++) {
          const ly = f.T + i * laneH + 3, bh = Math.max(4, laneH - 6);
          c.fillStyle = seg.throttled ? 'rgba(233,185,73,0.75)' : 'rgba(99,199,230,0.65)';
          c.fillRect(x0 + 1, ly, Math.max(1, xAct - x0 - 1), bh);
          if (seg.throttled && xEnd > xAct + 1) {
            c.fillStyle = 'rgba(240,122,109,0.22)';
            c.fillRect(xAct, ly, xEnd - xAct - 1, bh);
          }
        }
      }
    }
  });
  rangeLab('#c6Cpus', update);
  rangeLab('#c6Thr', update);
  onAll($$('input[name=c6Per]'), 'change', update);
  langHooks.push(update);
  update();
})();

/* ═════════ ch7: cgroups v2 Memory, Page Cache & OOM ═════════ */
(function ch7() {
  const cv = $('#c7Cv'), anon = $('#c7Anon'), cache = $('#c7Cache'), tmp = $('#c7Tmp'), mx = $('#c7Max');
  let S = null;
  function update() {
    S = M.cgroupMemoryModel({
      anonMiB: +anon.value,
      pageCacheMiB: +cache.value,
      tmpfsMiB: +tmp.value,
      memMaxMiB: +mx.value,
      highPct: 80
    });
    sliderOut('c7Anon', t('u.mib', { v: S.anonMiB }));
    sliderOut('c7Cache', t('u.mib', { v: S.requestedCacheMiB }));
    sliderOut('c7Tmp', t('u.mib', { v: S.tmpfsMiB }));
    sliderOut('c7Max', t('u.mib', { v: S.memMaxMiB }));
    put('#c7Cur', t('u.mib', { v: S.currentMiB }));
    put('#c7Rec', t('u.mib', { v: S.reclaimedCacheMiB }));
    put('#c7Psi', t('u.pct', { v: fmt(S.psiPct, 1) }));
    put('#c7State', t('ch7.st.' + S.status));
    putHTML('#c7Say', t(S.sayKey, {
      cur: S.currentMiB,
      high: S.memHighMiB,
      max: S.memMaxMiB,
      rec: S.reclaimedCacheMiB,
      psi: fmt(S.psiPct, 1),
      unrec: S.unreclaimableMiB
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      // Two-row legend on narrow screens, single row on wide
      const items = [
        [C.gold, t('ch7.leg.anon')],
        [C.violet, 'tmpfs'],
        [C.cyan, t('ch7.leg.cache')],
        [C.red, t('ch7.leg.rec')]
      ];
      if (w < 440) {
        items.slice(0, 2).forEach(([col, txt], i) => {
          const lx = 14 + i * (w / 2 - 14);
          c.fillStyle = col; c.fillRect(lx, 10, 10, 6);
          drawClipped(c, txt, lx + 14, 13, w / 2 - 34, C.mute, 'left', FONT);
        });
        items.slice(2).forEach(([col, txt], i) => {
          const lx = 14 + i * (w / 2 - 14);
          c.fillStyle = col; c.fillRect(lx, 26, 10, 6);
          drawClipped(c, txt, lx + 14, 29, w / 2 - 34, C.mute, 'left', FONT);
        });
      } else {
        let lx = 14;
        for (const [col, txt] of items) {
          c.fillStyle = col; c.fillRect(lx, 11, 10, 6);
          const tw = Math.min(110, c.measureText(txt).width);
          drawClipped(c, txt, lx + 14, 14, 110, C.mute, 'left', FONT);
          lx += 18 + tw + 14;
        }
      }

      const maxScale = Math.max(S.memMaxMiB, S.demandTotalMiB, 512);
      const f = frame(w, h, [w < 440 ? 58 : 44, 16, 46, 16], 0, maxScale, 0, 2);
      const barH = 24;
      const yReq = f.T + (f.B - f.T) * 0.30, yCur = f.T + (f.B - f.T) * 0.74;

      // Bar 1: Requested working set
      drawClipped(c, t('ch7.bar.req'), f.L, yReq - 17, f.R - f.L, C.ink, 'left', FONT);
      rr(c, f.L, yReq - barH / 2 + 4, f.R - f.L, barH, 4, C.card2, C.line, 1);
      let x = f.L;
      const seg = (val, col) => {
        if (val <= 0) return;
        const sw = f.X(val) - f.L;
        c.fillStyle = col; c.fillRect(x, yReq - barH / 2 + 5, sw, barH - 2); x += sw;
      };
      seg(S.anonMiB, 'rgba(233,185,73,0.65)');
      seg(S.tmpfsMiB, 'rgba(179,157,251,0.65)');
      seg(S.requestedCacheMiB, 'rgba(99,199,230,0.55)');

      // Bar 2: cgroups v2 enforced memory.current
      drawClipped(c, t('ch7.bar.cur'), f.L, yCur - 17, f.R - f.L, S.oomKilled ? C.red : C.ink, 'left', FONT);
      rr(c, f.L, yCur - barH / 2 + 4, f.R - f.L, barH, 4, C.card2, S.oomKilled ? C.red : C.line, S.oomKilled ? 1.8 : 1);
      x = f.L;
      const seg2 = (val, col) => {
        if (val <= 0) return;
        const sw = f.X(val) - f.L;
        c.fillStyle = col; c.fillRect(x, yCur - barH / 2 + 5, sw, barH - 2); x += sw;
      };
      seg2(Math.min(S.anonMiB, S.memMaxMiB), 'rgba(233,185,73,0.65)');
      seg2(Math.max(0, Math.min(S.tmpfsMiB, S.memMaxMiB - S.anonMiB)), 'rgba(179,157,251,0.65)');
      seg2(S.keptCacheMiB, 'rgba(99,199,230,0.55)');
      if (S.reclaimedCacheMiB > 0) seg2(S.reclaimedCacheMiB, 'rgba(240,122,109,0.22)');

      // Threshold lines: high label above plot, xTicks at f.B+13, max label below xTicks at f.B+32 -> zero overlap!
      const xHi = f.X(S.memHighMiB), xMax = f.X(S.memMaxMiB);
      c.strokeStyle = C.gold; c.lineWidth = 2; c.setLineDash([4, 3]);
      c.beginPath(); c.moveTo(xHi, f.T); c.lineTo(xHi, f.B); c.stroke();
      c.strokeStyle = C.red;
      c.beginPath(); c.moveTo(xMax, f.T); c.lineTo(xMax, f.B); c.stroke();
      c.setLineDash([]);
      drawClipped(c, `high ${S.memHighMiB}`, Math.min(f.R, Math.max(f.L + 64, xHi)), f.T - 10, 86, C.gold, 'right', MONO);
      xTicks(c, f, [[0, '0'], [Math.round(maxScale / 2), String(Math.round(maxScale / 2))], [maxScale, `${maxScale} MiB`]]);
      drawClipped(c, `max ${S.memMaxMiB}`, Math.min(f.R, Math.max(f.L + 64, xMax)), f.B + 32, 86, C.red, 'right', MONO);
    }
  });
  ['#c7Anon', '#c7Cache', '#c7Tmp', '#c7Max'].forEach(s => rangeLab(s, update));
  langHooks.push(update);
  update();
})();

/* ═════════ ch8: Security Perimeter (NoNewPrivs -> seccomp -> Caps -> LSM) ═════════ */
(function ch8() {
  const cv = $('#c8Cv');
  let S = null;
  function update() {
    S = M.seccompCapModel({
      probe: radioVal('c8Probe') || 'mount_fs',
      seccomp: $('#c8Sec').checked,
      capNetRaw: $('#c8NetRaw').checked,
      capSysAdmin: $('#c8SysAdm').checked,
      lsm: $('#c8Lsm').checked
    });
    put('#c8Verd', S.verdict);
    put('#c8Gate', S.blockedAt === 'none' ? t('ch8.gate.none') : t('ch8.gate.' + S.blockedAt));
    put('#c8Allow', `${S.allowedSyscalls} / ${M.SECCOMP_COUNTS.total}`);
    put('#c8Req', S.reqCap);
    putHTML('#c8Say', t(S.sayKey, {
      probe: t('ch8.pr.' + S.probe),
      verdict: S.verdict,
      cap: S.reqCap,
      allowed: S.allowedSyscalls,
      blocked: S.blockedSyscalls
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const padL = 14, padR = w - 14, bw = padR - padL;
      const twoByTwo = w < 520;
      if (twoByTwo) {
        const gw = (bw - 10) / 2, gh = (h - 28) / 2;
        S.gates.forEach((gt, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const x = padL + col * (gw + 10), y = 10 + row * (gh + 8);
          const clr = gt.pass ? C.green : C.red;
          rr(c, x, y, gw, gh, 6, C.card2, clr, 1.4);
          drawClipped(c, t('ch8.gate.' + gt.id), x + gw / 2, y + gh * 0.34, gw - 12, C.ink, 'middle', FONT);
          drawClipped(c, gt.note, x + gw / 2, y + gh * 0.68, gw - 12, clr, 'middle', MONO);
        });
      } else {
        const gap = 12, gw = (bw - gap * 3) / 4, gh = h - 44;
        S.gates.forEach((gt, i) => {
          const x = padL + i * (gw + gap), y = 22;
          const clr = gt.pass ? C.green : C.red;
          rr(c, x, y, gw, gh, 6, C.card2, clr, 1.5);
          drawClipped(c, t('ch8.gate.' + gt.id), x + gw / 2, y + gh * 0.36, gw - 12, C.ink, 'middle', FONT);
          drawClipped(c, gt.note, x + gw / 2, y + gh * 0.66, gw - 12, clr, 'middle', MONO);
          if (i < 3) {
            c.strokeStyle = C.mute; c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(x + gw + 2, y + gh / 2); c.lineTo(x + gw + gap - 2, y + gh / 2); c.stroke();
          }
        });
      }
    }
  });
  onAll($$('input[name=c8Probe]'), 'change', update);
  ['#c8Sec', '#c8NetRaw', '#c8SysAdm', '#c8Lsm'].forEach(s => chkLab(s, update));
  langHooks.push(update);
  update();
})();

/* ═════════ ch9: PID 1 Signals & Zombie Reaping ═════════ */
(function ch9() {
  const cv = $('#c9Cv'), tSlider = $('#c9T'), rSlider = $('#c9Rate'), stopChk = $('#c9Stop');
  let S = null;
  function update() {
    const mode = radioVal('c9Mode') || 'shell';
    S = M.pid1SignalModel({ mode, timeSec: +tSlider.value, spawnRate: +rSlider.value, sendStop: stopChk.checked, graceSec: 10 });
    sliderOut('c9T', t('u.s', { v: S.timeSec }));
    sliderOut('c9Rate', `${S.spawnRate}/s`);
    put('#c9State', t('ch9.st.' + S.state));
    put('#c9Zomb', String(S.peakZombies));
    put('#c9Wait', t('u.s', { v: S.sigtermWaitSec }));
    put('#c9Exit', S.exitCode == null ? '—' : String(S.exitCode));
    putHTML('#c9Say', t(S.sayKey, {
      t: S.timeSec,
      z: S.peakZombies,
      wait: S.sigtermWaitSec,
      grace: S.graceSec,
      code: S.exitCode == null ? '—' : S.exitCode
    }));
    sim.dirty = true;
  }
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const maxY = Math.max(12, S.spawnRate * 16);
      const f = frame(w, h, [32, 18, 44, 46], 0, 20, 0, maxY);
      axes(c, f, t('ch9.cv.x'), t('ch9.cv.y'));
      xTicks(c, f, [[0, '0'], [5, '5'], [10, '10'], [15, '15'], [20, '20 s']]);
      yTicks(c, f, [[0, '0'], [Math.round(maxY / 2), String(Math.round(maxY / 2))], [maxY, String(maxY)]]);

      // Plot zombie accumulation from 0 to S.timeSec
      c.strokeStyle = S.mode === 'init' ? C.green : C.gold;
      c.lineWidth = 2.4;
      c.beginPath();
      for (let t0 = 0; t0 <= S.timeSec; t0++) {
        const pt = M.pid1SignalModel({ mode: S.mode, timeSec: t0, spawnRate: S.spawnRate, sendStop: S.sendStop, graceSec: S.graceSec });
        const px = f.X(t0), py = f.Y(pt.peakZombies);
        if (t0 === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();

      if (S.sendStop) {
        const xTerm = f.X(S.stopAtSec);
        c.strokeStyle = C.cyan; c.lineWidth = 1.6; c.setLineDash([4, 3]);
        c.beginPath(); c.moveTo(xTerm, f.T); c.lineTo(xTerm, f.B); c.stroke();
        c.setLineDash([]);
        drawClipped(c, 'SIGTERM @5s', Math.max(f.L + 4, Math.min(f.R - 86, xTerm + 4)), f.T + 12, 86, C.cyan, 'left', MONO);

        const endT = S.mode === 'shell' ? S.stopAtSec + S.graceSec : S.stopAtSec + 1;
        const xEnd = f.X(endT);
        const endCol = S.mode === 'shell' ? C.red : C.green;
        c.strokeStyle = endCol; c.lineWidth = 1.6; c.setLineDash([4, 3]);
        c.beginPath(); c.moveTo(xEnd, f.T); c.lineTo(xEnd, f.B); c.stroke();
        c.setLineDash([]);
        const endTxt = S.mode === 'shell' ? 'SIGKILL @15s' : 'Exit 0 @6s';
        if (S.mode === 'shell') {
          drawClipped(c, endTxt, Math.min(f.R - 4, Math.max(f.L + 92, xEnd - 4)), f.B - 14, 92, endCol, 'right', MONO);
        } else {
          drawClipped(c, endTxt, Math.max(f.L + 4, Math.min(f.R - 86, xEnd + 4)), f.B - 14, 86, endCol, 'left', MONO);
        }
      }
    }
  });
  onAll($$('input[name=c9Mode]'), 'change', update);
  rangeLab('#c9T', update);
  rangeLab('#c9Rate', update);
  chkLab('#c9Stop', update);
  langHooks.push(update);
  update();
})();

applyLang();
loop();
window.__essayReady = true;
})();
