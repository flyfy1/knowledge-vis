/* Why NVMe Is So Fast: wiring, canvas drawing, i18n, and on-screen gating.
 * All visible text comes from copy.zh.js / copy.en.js.
 */
(() => {
'use strict';
const M = window.NvmeEssayModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = {
  bg: '#0f1219', card2: '#1a1f2b', line: '#2b3242', grid: '#1f2533',
  ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6',
  red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254'
};
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const FONT_SM = '11px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const MONO = '11px ui-monospace,Menlo,Consolas,monospace';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) {} }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const effLang = () => (COPY[lang] ? lang : 'zh');

function t(key, vars) {
  const dict = COPY[effLang()] || COPY.zh || {};
  let s = dict[key] != null ? dict[key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function fmt(x, d = 0) {
  if (x == null || !isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

const sims = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => {
  b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); });
});

/* ───────── canvas + sim registry ───────── */
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

const io = new IntersectionObserver(es => {
  es.forEach(e => {
    for (const s of sims) {
      if (s.cvs.includes(e.target)) {
        s.vis = s.cvs.some(cv => {
          if (cv === e.target) cv.__vis = e.isIntersecting;
          return cv.__vis;
        });
        s.dirty = true;
      }
    }
  });
}, { rootMargin: '60px' });

function reg(cvs, o) {
  o.cvs = [].concat(cvs);
  o.vis = false;
  o.dirty = true;
  sims.push(o);
  o.cvs.forEach(cv => io.observe(cv));
  return o;
}
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const on = (sel, ev, fn) => { const el = $(sel); el.addEventListener(ev, fn); return el; };
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

/* ═════════ LAB 1: Latency Breakdown ═════════ */
(() => {
  const cv = $('#cv1');
  const rng = $('#c1media'), out = $('#c1mediaOut');
  let preset = 'nvme', customMedia = 75, proto = 'nvme';

  function syncPreset(p) {
    preset = p;
    const def = M.latencyBreakdown.PRESETS[p];
    if (p === 'hdd') {
      proto = 'ahci';
      radios('c1proto').forEach(r => { r.checked = r.value === 'ahci'; });
      customMedia = 8500;
      rng.disabled = true;
      out.textContent = '8,500 us';
    } else {
      rng.disabled = false;
      customMedia = def.mediaUs;
      rng.value = String(customMedia);
      out.textContent = `${customMedia} us`;
      proto = (p === 'sata') ? 'ahci' : 'nvme';
      radios('c1proto').forEach(r => { r.checked = r.value === proto; });
    }
  }

  const s = reg(cv, {
    text() {
      const r = M.latencyBreakdown.compute(preset, customMedia, proto);
      put('#c1rTotal', `${fmt(r.totalUs)} us`);
      put('#c1rOver', `${fmt(r.overheadUs)} us`);
      put('#c1rShare', `${fmt(r.overheadPct, 1)}%`);
      put('#c1rIops', `${fmt(r.maxIopsQd1 / 1000, 1)}k`);
      putHTML('#c1say', t('ch1.say', {
        total: `${fmt(r.totalUs)} us`,
        overhead: `${fmt(r.overheadUs)} us`,
        share: `${fmt(r.overheadPct, 1)}%`,
        iops: fmt(r.maxIopsQd1, 0)
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const cur = M.latencyBreakdown.compute(preset, customMedia, proto);
      const ref = M.latencyBreakdown.compute('nvme', 75, 'nvme');
      const padL = w < 440 ? 14 : 20, padR = w < 440 ? 14 : 20;
      const barW = w - padL - padR;

      const drawRow = (y, label, d, maxScale) => {
        c.fillStyle = C.ink;
        c.font = FONT_SM;
        c.textAlign = 'left';
        c.fillText(`${label}  (${fmt(d.totalUs)} us)`, padL, y);
        const by = y + 14, bh = 28;
        c.fillStyle = C.card2;
        roundRect(c, padL, by, barW, bh, 6); c.fill();

        const tot = Math.max(d.totalUs, 1);
        const scaleW = d.totalUs > maxScale ? barW : (d.totalUs / maxScale) * barW;
        const wMedia = (d.mediaUs / tot) * scaleW;
        const wWire = (d.wireUs / tot) * scaleW;
        const wProto = (d.protoUs / tot) * scaleW;

        c.fillStyle = C.cyan;
        if (wMedia > 0.5) c.fillRect(padL, by, wMedia, bh);
        c.fillStyle = C.gold;
        if (wWire > 0.5) c.fillRect(padL + wMedia, by, wWire, bh);
        c.fillStyle = C.red;
        if (wProto > 0.5) c.fillRect(padL + wMedia + wWire, by, wProto, bh);

        if (d.totalUs > maxScale) {
          c.fillStyle = C.mute;
          c.font = FONT_SM;
          c.fillText(t('cv.ch1.hddNote'), padL, by + bh + 15);
        }
      };

      const maxScale = Math.max(225, cur.totalUs <= 250 ? cur.totalUs * 1.15 : 225);
      drawRow(32, t('cv.ch1.current'), cur, maxScale);
      drawRow(h * 0.56, t('cv.ch1.ref'), ref, maxScale);
    }
  });

  radios('c1preset').forEach(r => r.addEventListener('change', () => {
    syncPreset(r.value); s.dirty = true; s.text();
  }));
  radios('c1proto').forEach(r => r.addEventListener('change', () => {
    proto = r.value; s.dirty = true; s.text();
  }));
  on('#c1media', 'input', e => {
    if (preset === 'hdd') {
      preset = 'nvme';
      radios('c1preset').forEach(r => { r.checked = r.value === 'nvme'; });
    }
    customMedia = +e.target.value;
    out.textContent = `${customMedia} us`;
    s.dirty = true; s.text();
  });
  s.text();
})();

/* ═════════ LAB 2: Bus Bandwidth & Little's Law ═════════ */
(() => {
  const cv = $('#cv2');
  const qdEl = $('#c2qd'), latEl = $('#c2lat');

  const s = reg(cv, {
    text() {
      const bus = radioVal('c2bus');
      const qd = +qdEl.value, lat = +latEl.value;
      $('#c2qdOut').textContent = String(qd);
      $('#c2latOut').textContent = `${lat} us`;
      const r = M.busBandwidth.compute(bus, qd, lat);
      put('#c2rEff', `${fmt(r.effectiveMBs)} MB/s`);
      put('#c2rAct', `${fmt(r.actualMBs, 1)} MB/s`);
      put('#c2rUtil', `${fmt(r.busUtilPct, 1)}%`);
      put('#c2rNeed', String(r.qdToSaturate4k));
      putHTML('#c2say', t('ch2.say', {
        bus: t(`ch2.b.${bus}`),
        eff: `${fmt(r.effectiveMBs)} MB/s`,
        lat: String(lat),
        qd: String(qd),
        actual: `${fmt(r.actualMBs, 1)} MB/s`,
        util: `${fmt(r.busUtilPct, 1)}%`,
        need: String(r.qdToSaturate4k)
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const bus = radioVal('c2bus');
      const qd = +qdEl.value, lat = +latEl.value;
      const r = M.busBandwidth.compute(bus, qd, lat);

      const padL = w < 440 ? 14 : 22, padR = w < 440 ? 14 : 22;
      const barW = w - padL - padR;
      const maxMB = Math.max(r.rawMBs, 1000);

      const bar = (y, label, val, col) => {
        c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
        c.fillText(`${label}: ${fmt(val, val < 100 ? 1 : 0)} MB/s`, padL, y);
        c.fillStyle = C.card2;
        roundRect(c, padL, y + 12, barW, 24, 6); c.fill();
        c.fillStyle = col;
        const bw = clamp((val / maxMB) * barW, 2, barW);
        roundRect(c, padL, y + 12, bw, 24, 6); c.fill();
      };

      bar(28, t('cv.ch2.raw'), r.rawMBs, C.dim);
      bar(92, t('cv.ch2.eff'), r.effectiveMBs, C.cyan);
      bar(156, `${t('cv.ch2.cur')} (QD=${qd})`, r.actualMBs, C.gold);

      // Little's Law visual lanes at bottom
      const laneY = 228, lanes = r.busId === 'sata3' ? 1 : 4;
      c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'left';
      c.fillText(`${r.gtps} GT/s ×${lanes} | ${fmt(r.encEffPct, 1)}% | QD*=${r.qdToSaturate4k}`, padL, laneY);
      const lw = Math.min(barW, 420);
      for (let i = 0; i < lanes; i++) {
        const y = laneY + 14 + i * 10;
        c.fillStyle = C.grid; c.fillRect(padL, y, lw, 5);
        c.fillStyle = C.cyan; c.fillRect(padL, y, lw * (r.busUtilPct / 100), 5);
      }
    }
  });

  radios('c2bus').forEach(r => r.addEventListener('change', () => { s.dirty = true; s.text(); }));
  on('#c2qd', 'input', () => { s.dirty = true; s.text(); });
  on('#c2lat', 'input', () => { s.dirty = true; s.text(); });
  s.text();
})();

/* ═════════ LAB 3: Multi-core Queue Scaling ═════════ */
(() => {
  const cv = $('#cv3');
  const coresEl = $('#c3cores'), nandEl = $('#c3nand');

  const s = reg(cv, {
    text() {
      const cores = +coresEl.value, nand = +nandEl.value;
      $('#c3coresOut').textContent = String(cores);
      $('#c3nandOut').textContent = `${fmt(nand)}k`;
      const p = M.queueScaling.simulatePoint(cores, nand);
      put('#c3rNvme', `${fmt(p.nvmeKIops)}k`);
      put('#c3rAhci', `${fmt(p.ahciKIops)}k`);
      put('#c3rRatio', `${fmt(p.speedup, 1)}×`);
      put('#c3rLock', `${fmt(p.lockWaitPct, 1)}%`);
      putHTML('#c3say', t('ch3.say', {
        cores: String(cores),
        nvme: `${fmt(p.nvmeKIops)}k IOPS`,
        ahci: `${fmt(p.ahciKIops)}k IOPS`,
        ratio: `${fmt(p.speedup, 1)}×`,
        lock: `${fmt(p.lockWaitPct, 1)}%`
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const cores = +coresEl.value, nand = +nandEl.value, mode = radioVal('c3mode');
      const pts = M.queueScaling.curve(nand);
      const L = 52, R = w - 18, T = 20, B = h - 38;
      const maxY = Math.max(nand * 1.1, 1600);
      const X = x => L + ((x - 1) / 31) * (R - L);
      const Y = y => B - (y / maxY) * (B - T);

      c.strokeStyle = C.grid; c.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const yy = T + (g / 4) * (B - T);
        c.beginPath(); c.moveTo(L, yy); c.lineTo(R, yy); c.stroke();
        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'right';
        c.fillText(`${fmt(maxY * (1 - g / 4), 0)}k`, L - 6, yy);
      }
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'center';
      c.fillText(t('cv.ch3.xlab'), (L + R) / 2, h - 10);
      [1, 8, 16, 24, 32].forEach(k => c.fillText(String(k), X(k), B + 14));

      const drawLine = (key, col) => {
        c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath();
        pts.forEach((p, i) => {
          const px = X(p.cores), py = Y(p[key]);
          if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
        });
        c.stroke();
      };
      if (mode !== 'ahci') drawLine('nvmeKIops', C.cyan);
      if (mode !== 'nvme') drawLine('ahciKIops', C.red);

      const cur = pts[cores - 1];
      c.strokeStyle = C.gold; c.setLineDash([4, 4]); c.lineWidth = 1;
      c.beginPath(); c.moveTo(X(cores), T); c.lineTo(X(cores), B); c.stroke();
      c.setLineDash([]);
      if (mode !== 'ahci') {
        c.fillStyle = C.cyan; c.beginPath(); c.arc(X(cores), Y(cur.nvmeKIops), 5, 0, Math.PI * 2); c.fill();
      }
      if (mode !== 'nvme') {
        c.fillStyle = C.red; c.beginPath(); c.arc(X(cores), Y(cur.ahciKIops), 5, 0, Math.PI * 2); c.fill();
      }
    }
  });

  on('#c3cores', 'input', () => { s.dirty = true; s.text(); });
  on('#c3nand', 'input', () => { s.dirty = true; s.text(); });
  radios('c3mode').forEach(r => r.addEventListener('change', () => { s.dirty = true; }));
  s.text();
})();

/* ═════════ LAB 4: Ring Buffer & Doorbell State Machine ═════════ */
(() => {
  const cv = $('#cv4');
  let st = M.ringProtocol.create();
  let lastPhase = 'submit';
  let timer = null;

  const s = reg(cv, {
    text() {
      const ph = t(`ch4.ph.${lastPhase}`);
      put('#c4rPhase', ph);
      put('#c4rDone', String(st.completed));
      put('#c4rNvme', String(st.nvmeMmioOps));
      put('#c4rAhci', String(st.ahciMmioOps));
      putHTML('#c4say', t('ch4.say', {
        phase: ph,
        done: String(st.completed),
        nvme: String(st.nvmeMmioOps),
        ahci: String(st.ahciMmioOps)
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const compact = w < 560;
      const boxW = compact ? w - 24 : (w - 48) * 0.56;
      const hostX = 12, hostY = 14, hostH = compact ? h * 0.58 : h - 28;
      c.strokeStyle = C.line; c.fillStyle = C.card2; c.lineWidth = 1;
      roundRect(c, hostX, hostY, boxW, hostH, 10); c.fill(); c.stroke();
      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('cv.ch4.host'), hostX + 12, hostY + 18);

      const drawSlots = (y, label, slots, head, tail, col) => {
        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'left';
        c.fillText(`${label}  H=${head} T=${tail}`, hostX + 12, y);
        const sw = (boxW - 24 - 7 * 4) / 8;
        for (let i = 0; i < 8; i++) {
          const sx = hostX + 12 + i * (sw + 4);
          const occupied = slots[i] != null;
          c.fillStyle = occupied ? col : C.bg;
          c.strokeStyle = (i === tail || i === head) ? C.gold : C.line;
          c.lineWidth = (i === tail || i === head) ? 2 : 1;
          roundRect(c, sx, y + 12, sw, 28, 4); c.fill(); c.stroke();
          c.fillStyle = occupied ? C.bg : C.mute;
          c.font = MONO; c.textAlign = 'center';
          c.fillText(String(i), sx + sw / 2, y + 26);
        }
      };

      drawSlots(hostY + 42, 'SQ (64B)', st.sqSlots, st.sqHead, st.sqTail, C.cyan);
      drawSlots(hostY + (compact ? 98 : 122), 'CQ (16B)', st.cqSlots, st.cqHead, st.cqTail, C.green);

      // SSD controller box
      const ctrlX = compact ? 12 : hostX + boxW + 24;
      const ctrlY = compact ? hostY + hostH + 12 : hostY;
      const ctrlW = compact ? w - 24 : w - ctrlX - 12;
      const ctrlH = compact ? h - ctrlY - 12 : hostH;
      c.fillStyle = C.card2; c.strokeStyle = C.line; c.lineWidth = 1;
      roundRect(c, ctrlX, ctrlY, ctrlW, ctrlH, 10); c.fill(); c.stroke();
      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('cv.ch4.ctrl'), ctrlX + 12, ctrlY + 18);

      const dbY = ctrlY + 44;
      c.fillStyle = lastPhase === 'doorbell' ? C.gold : C.mute;
      c.font = MONO;
      c.fillText(`${t('cv.ch4.db')}: SQ_Tail=${st.dbSqTail} CQ_Head=${st.dbCqHead}`, ctrlX + 12, dbY);

      const dmaY = ctrlY + (compact ? 70 : 88);
      c.fillStyle = lastPhase === 'fetch_dma' ? C.cyan : C.mute;
      c.fillText(`${t('cv.ch4.dma')} (${lastPhase === 'fetch_dma' ? 'ACTIVE' : 'IDLE'})`, ctrlX + 12, dmaY);

      const msiY = ctrlY + (compact ? 96 : 132);
      c.fillStyle = lastPhase === 'complete' ? C.green : C.mute;
      c.fillText(`MSI-X IRQ (${lastPhase === 'complete' ? 'FIRED' : 'WAIT'})`, ctrlX + 12, msiY);
    }
  });

  const advance = () => {
    const res = M.ringProtocol.step(st);
    st = res.state;
    lastPhase = res.phase;
    s.dirty = true; s.text();
  };
  on('#c4step', 'click', advance);
  on('#c4batch', 'click', () => {
    for (let i = 0; i < 4; i++) st = M.ringProtocol.runOneCmd(st);
    lastPhase = 'ack';
    s.dirty = true; s.text();
  });
  on('#c4reset', 'click', () => {
    if (timer) { clearInterval(timer); timer = null; $('#c4play').setAttribute('aria-pressed', 'false'); $('#c4play').textContent = t('ch4.btn.play'); }
    st = M.ringProtocol.create();
    lastPhase = 'submit';
    s.dirty = true; s.text();
  });
  on('#c4play', 'click', () => {
    const btn = $('#c4play');
    if (timer) {
      clearInterval(timer); timer = null;
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = t('ch4.btn.play');
    } else {
      if (reduce) {
        for (let i = 0; i < 4; i++) st = M.ringProtocol.runOneCmd(st);
        lastPhase = 'ack'; s.dirty = true; s.text();
        return;
      }
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = t('ch4.btn.pause');
      timer = setInterval(advance, 550);
    }
  });
  s.text();
})();

/* ═════════ LAB 5: Multi-Channel NAND Die Parallelism ═════════ */
(() => {
  const cv = $('#cv5');
  const chEl = $('#c5ch'), dpcEl = $('#c5dpc'), qdEl = $('#c5qd');

  const s = reg(cv, {
    text() {
      const ch = +chEl.value, dpc = +dpcEl.value, qd = +qdEl.value;
      $('#c5chOut').textContent = String(ch);
      $('#c5dpcOut').textContent = String(dpc);
      $('#c5qdOut').textContent = String(qd);
      const r = M.nandParallel.simulate(ch, dpc, qd);
      put('#c5rDies', String(r.totalDies));
      put('#c5rAct', `${r.activeDies} / ${r.totalDies}`);
      put('#c5rIops', `${fmt(r.iops / 1000, 1)}k`);
      put('#c5rMbps', `${fmt(r.mbps)} MB/s`);
      putHTML('#c5say', t('ch5.say', {
        total: String(r.totalDies),
        qd: String(qd),
        active: String(r.activeDies),
        iops: `${fmt(r.iops / 1000, 1)}k IOPS`,
        mbps: `${fmt(r.mbps)} MB/s`,
        speedup: `${fmt(r.speedupVsQd1, 1)}×`
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const ch = +chEl.value, dpc = +dpcEl.value, qd = +qdEl.value;
      const r = M.nandParallel.simulate(ch, dpc, qd);

      const cols = 8, rows = 4;
      const padL = 20, padT = 20;
      const gridW = w - 40, gridH = h - 66;
      const cw = (gridW - (cols - 1) * 8) / cols;
      const rh = (gridH - (rows - 1) * 8) / rows;

      let idx = 0;
      for (let col = 0; col < ch; col++) {
        for (let row = 0; row < dpc; row++) {
          const busy = idx < r.activeDies;
          const x = padL + col * (cw + 8);
          const y = padT + row * (rh + 8);
          c.fillStyle = busy ? C.cyan : C.card2;
          c.strokeStyle = busy ? C.gold : C.line;
          c.lineWidth = busy ? 1.5 : 1;
          roundRect(c, x, y, cw, rh, 6); c.fill(); c.stroke();
          c.fillStyle = busy ? C.bg : C.mute;
          c.font = MONO; c.textAlign = 'center';
          c.fillText(`C${col}D${row}`, x + cw / 2, y + rh / 2);
          idx++;
        }
      }
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(`${r.activeDies} ${t('cv.ch5.busy')} · ${r.totalDies - r.activeDies} ${t('cv.ch5.die')}`, padL, h - 18);
    }
  });

  on('#c5ch', 'input', () => { s.dirty = true; s.text(); });
  on('#c5dpc', 'input', () => { s.dirty = true; s.text(); });
  on('#c5qd', 'input', () => { s.dirty = true; s.text(); });
  s.text();
})();

/* ═════════ LAB 6: Write Amplification & Trim ═════════ */
(() => {
  const cv = $('#cv6');
  const fillEl = $('#c6fill'), opEl = $('#c6op'), trimEl = $('#c6trim');

  const s = reg(cv, {
    text() {
      const fill = +fillEl.value, op = +opEl.value, trim = trimEl.checked;
      $('#c6fillOut').textContent = `${fill}%`;
      $('#c6opOut').textContent = `${op}%`;
      const r = M.writeAmp.compute(fill, op, trim);
      put('#c6rWaf', `${fmt(r.waf, 1)}×`);
      put('#c6rVic', `${fmt(r.victimValidPct, 1)}%`);
      put('#c6rHost', `${fmt(r.hostWriteMBs)} MB/s`);
      put('#c6rRaw', `${fmt(M.writeAmp.RAW_NAND_WRITE_MBS)} MB/s`);
      putHTML('#c6say', t('ch6.say', {
        victim: `${fmt(r.victimValidPct, 1)}%`,
        waf: `${fmt(r.waf, 1)}×`,
        raw: `${fmt(M.writeAmp.RAW_NAND_WRITE_MBS)} MB/s`,
        host: `${fmt(r.hostWriteMBs)} MB/s`
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const fill = +fillEl.value, op = +opEl.value, trim = trimEl.checked;
      const r = M.writeAmp.compute(fill, op, trim);

      // Left: 8x4 = 32-page victim block
      const split = w < 520 ? w : w * 0.44;
      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('cv.ch6.victim'), 16, 18);
      const validPages = Math.round((r.victimValidPct / 100) * 32);
      const pw = (split - 40) / 8, ph = 24;
      for (let i = 0; i < 32; i++) {
        const col = i % 8, row = Math.floor(i / 8);
        const x = 16 + col * (pw + 2), y = 34 + row * (ph + 4);
        c.fillStyle = i < validPages ? C.gold : C.green;
        roundRect(c, x, y, pw - 2, ph - 2, 3); c.fill();
      }

      if (w >= 520) {
        const L = split + 34, R = w - 20, T = 30, B = h - 36;
        const maxWaf = 15;
        const X = f => L + ((f - 20) / 78) * (R - L);
        const Y = wf => B - (Math.min(wf, maxWaf) / maxWaf) * (B - T);

        c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
        c.fillText(t('cv.ch6.curve'), L, 16);
        c.strokeStyle = C.grid; c.lineWidth = 1;
        [1, 5, 10, 15].forEach(v => {
          const yy = Y(v);
          c.beginPath(); c.moveTo(L, yy); c.lineTo(R, yy); c.stroke();
          c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'right';
          c.fillText(`${v}×`, L - 5, yy);
        });
        c.strokeStyle = C.red; c.lineWidth = 2.5; c.beginPath();
        for (let f = 20; f <= 98; f += 2) {
          const pt = M.writeAmp.compute(f, op, trim);
          const px = X(f), py = Y(pt.waf);
          if (f === 20) c.moveTo(px, py); else c.lineTo(px, py);
        }
        c.stroke();
        c.fillStyle = C.gold; c.beginPath(); c.arc(X(fill), Y(r.waf), 5.5, 0, Math.PI * 2); c.fill();
      }
    }
  });

  on('#c6fill', 'input', () => { s.dirty = true; s.text(); });
  on('#c6op', 'input', () => { s.dirty = true; s.text(); });
  on('#c6trim', 'change', () => { s.dirty = true; s.text(); });
  s.text();
})();

/* ═════════ LAB 7: Polling vs. Interrupts ═════════ */
(() => {
  const cv = $('#cv7');
  const medEl = $('#c7media'), iopsEl = $('#c7iops'), irqEl = $('#c7irq');

  const s = reg(cv, {
    text() {
      const med = +medEl.value, iops = +iopsEl.value, irq = +irqEl.value;
      $('#c7mediaOut').textContent = `${med} us`;
      $('#c7iopsOut').textContent = `${iops}k`;
      $('#c7irqOut').textContent = `${fmt(irq, 1)} us`;
      const r = M.pollingVsIrq.compute(med, irq, iops);
      put('#c7rIrqLat', `${fmt(r.irqLatencyUs, 1)} us`);
      put('#c7rPollLat', `${fmt(r.pollLatencyUs, 1)} us`);
      put('#c7rIrqCpu', fmt(r.irqCores, 2));
      put('#c7rCross', `${fmt(r.crossoverIopsK, 0)}k IOPS`);
      putHTML('#c7say', t('ch7.say', {
        irqLat: `${fmt(r.irqLatencyUs, 1)} us`,
        pollLat: `${fmt(r.pollLatencyUs, 1)} us`,
        irqCpu: fmt(r.irqCores, 2),
        cross: `${fmt(r.crossoverIopsK, 0)}k IOPS`
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const med = +medEl.value, iops = +iopsEl.value, irq = +irqEl.value;
      const r = M.pollingVsIrq.compute(med, irq, iops);
      const mid = w * 0.42;

      // Left: Latency bar comparison
      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('cv.ch7.latTitle'), 14, 18);
      const maxL = Math.max(r.irqLatencyUs, 20);
      const bw = mid - 32;
      c.fillStyle = C.red;
      roundRect(c, 14, 42, (r.irqLatencyUs / maxL) * bw, 28, 5); c.fill();
      c.fillStyle = C.ink; c.font = MONO;
      c.fillText(`IRQ: ${fmt(r.irqLatencyUs, 1)} us`, 14, 86);

      c.fillStyle = C.cyan;
      roundRect(c, 14, 112, (r.pollLatencyUs / maxL) * bw, 28, 5); c.fill();
      c.fillStyle = C.ink;
      c.fillText(`Poll: ${fmt(r.pollLatencyUs, 1)} us`, 14, 156);

      // Right: CPU cores vs IOPS
      const L = mid + 32, R = w - 18, T = 36, B = h - 36;
      const X = k => L + ((k - 10) / 790) * (R - L);
      const maxC = 3.0;
      const Y = cr => B - (Math.min(cr, maxC) / maxC) * (B - T);
      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('cv.ch7.cpuTitle'), L, 18);

      c.strokeStyle = C.grid; c.lineWidth = 1;
      [1, 2, 3].forEach(cr => {
        const yy = Y(cr);
        c.beginPath(); c.moveTo(L, yy); c.lineTo(R, yy); c.stroke();
        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'right';
        c.fillText(`${cr}`, L - 5, yy);
      });

      // Poll line (1.0 core)
      c.strokeStyle = C.cyan; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(L, Y(1)); c.lineTo(R, Y(1)); c.stroke();
      // IRQ line
      c.strokeStyle = C.red; c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(X(10), Y(M.pollingVsIrq.compute(med, irq, 10).irqCores));
      c.lineTo(X(800), Y(M.pollingVsIrq.compute(med, irq, 800).irqCores));
      c.stroke();

      c.fillStyle = C.gold;
      c.beginPath(); c.arc(X(r.crossoverIopsK), Y(1), 5.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(X(iops), Y(r.irqCores), 4.5, 0, Math.PI * 2); c.fill();
    }
  });

  on('#c7media', 'input', () => { s.dirty = true; s.text(); });
  on('#c7iops', 'input', () => { s.dirty = true; s.text(); });
  on('#c7irq', 'input', () => { s.dirty = true; s.text(); });
  s.text();
})();

/* ═════════ LAB 8: Frontier GPUDirect Storage ═════════ */
(() => {
  const cv = $('#cv8');
  const sizeEl = $('#c8size');

  const s = reg(cv, {
    text() {
      const pathId = radioVal('c8path');
      const genId = radioVal('c8gen');
      const size = +sizeEl.value;
      $('#c8sizeOut').textContent = `${size} GB`;
      const r = M.frontierPath.compute(pathId, size, genId);
      const pathKey = pathId === 'multi_gds' ? 'ch8.pa.multi' : (pathId === 'gds' ? 'ch8.pa.gds' : 'ch8.pa.posix');
      put('#c8rBw', `${fmt(r.effectiveGBs, 1)} GB/s`);
      put('#c8rTime', `${fmt(r.transferSec, 2)} s`);
      put('#c8rCopies', String(r.cpuCopies));
      put('#c8rCpu', `${r.cpuLoadPct}%`);
      putHTML('#c8say', t('ch8.say', {
        size: String(size),
        path: t(pathKey),
        bw: `${fmt(r.effectiveGBs, 1)} GB/s`,
        time: `${fmt(r.transferSec, 2)} s`,
        copies: String(r.cpuCopies)
      }));
    },
    draw() {
      const { c, w, h } = fit(cv);
      const pathId = radioVal('c8path'), genId = radioVal('c8gen'), size = +sizeEl.value;
      const r = M.frontierPath.compute(pathId, size, genId);
      const cy = h * 0.48;
      const nodes = pathId === 'posix'
        ? [`${r.driveCount}× NVMe`, t('cv.ch8.cpu'), t('cv.ch8.gpu')]
        : [`${r.driveCount}× NVMe`, 'PCIe DMA', t('cv.ch8.gpu')];
      const boxW = Math.min(140, (w - 80) / 3);
      const gap = (w - 32 - boxW * 3) / 2;

      nodes.forEach((lbl, i) => {
        const x = 16 + i * (boxW + gap);
        const isCpuBounce = pathId === 'posix' && i === 1;
        c.fillStyle = isCpuBounce ? 'rgba(240,122,109,.18)' : C.card2;
        c.strokeStyle = isCpuBounce ? C.red : (i === 2 ? C.cyan : C.gold);
        c.lineWidth = 1.5;
        roundRect(c, x, cy - 26, boxW, 52, 8); c.fill(); c.stroke();
        c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'center';
        c.fillText(lbl, x + boxW / 2, cy);
        if (i < 2) {
          c.strokeStyle = pathId === 'posix' ? C.red : C.cyan;
          c.beginPath(); c.moveTo(x + boxW + 4, cy); c.lineTo(x + boxW + gap - 4, cy); c.stroke();
        }
      });
      c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'center';
      c.fillText(`${fmt(r.effectiveGBs, 1)} GB/s  ·  ${fmt(r.transferSec, 2)} s  ·  ${r.cpuCopies} CPU copies`, w / 2, h - 22);
    }
  });

  radios('c8path').forEach(r => r.addEventListener('change', () => { s.dirty = true; s.text(); }));
  radios('c8gen').forEach(r => r.addEventListener('change', () => { s.dirty = true; s.text(); }));
  on('#c8size', 'input', () => { s.dirty = true; s.text(); });
  s.text();
})();

/* ───────── animation loop ───────── */
function tick() {
  for (const s of sims) {
    if (s.vis && s.dirty) {
      s.dirty = false;
      s.draw();
    }
  }
  requestAnimationFrame(tick);
}
applyLang();
requestAnimationFrame(tick);
window.__essayReady = true;
})();
