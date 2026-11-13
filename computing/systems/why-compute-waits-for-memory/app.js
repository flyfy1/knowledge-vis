/* Why Compute Waits for Memory: wiring, drawing, i18n, and on-screen gating.
 * All visible text comes from copy.*.js.
 */
(() => {
'use strict';
const M = window.MemoryWallModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = {
  bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0',
  mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d',
  green: '#7ad6a0', violet: '#b39dfb', dim: '#3a4254'
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
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
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
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
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
const sims = [];
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

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return {
    L, R, T, B,
    X: x => L + (R - L) * (x - x0) / (x1 - x0),
    Y: y => B - (B - T) * (y - y0) / (y1 - y0),
  };
}
function axes(c, f, xLab, yLab, opt = {}) {
  c.strokeStyle = C.line; c.lineWidth = 1;
  c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT_SM;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 4, Math.max(10, f.T - 10)); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + (opt.xLabDy || 26)); }
}
function xTicks(c, f, vals, fmtv, skipLast) {
  c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'center';
  vals.forEach((v, i) => {
    if (skipLast && i === vals.length - 1) return;
    const x = f.X(v);
    c.fillText(fmtv(v), x, f.B + 11);
    c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke();
  });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'right';
  vals.forEach(v => {
    const y = f.Y(v);
    c.fillText(fmtv(v), f.L - 6, y);
    c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke();
  });
}
function hline(c, f, y, col, dash = [5, 4]) {
  c.strokeStyle = col; c.lineWidth = 1.3; c.setLineDash(dash);
  c.beginPath(); c.moveTo(f.L, f.Y(y)); c.lineTo(f.R, f.Y(y)); c.stroke();
  c.setLineDash([]);
}
function path(c, pts, X, Y, col, lw = 2.2) {
  c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round';
  c.beginPath();
  pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])));
  c.stroke();
}
function cursorDot(c, x, y, col) {
  c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, Math.PI * 2); c.fill();
}
// Non-overlapping label placer for dynamic chart annotations
function makePlacer(w, h, bounds) {
  const placed = [];
  return function place(c, text, x, y, align = 'left', pad = 4) {
    const minX = bounds && bounds.l != null ? bounds.l : pad;
    const maxX = bounds && bounds.r != null ? bounds.r : w - pad;
    const minY = bounds && bounds.t != null ? bounds.t : pad;
    const maxY = bounds && bounds.b != null ? bounds.b : h - pad;
    const m = c.measureText(text);
    const tw = m.width;
    const th = 14;
    const offsets = [[0, 0], [0, -16], [0, 16], [-tw - 8, 0], [8, 0], [0, -30], [0, 30]];
    for (const [dx, dy] of offsets) {
      let cx = x + dx, cy = y + dy;
      let x0 = align === 'center' ? cx - tw / 2 : align === 'right' ? cx - tw : cx;
      let x1 = x0 + tw;
      if (x0 < minX) { cx += (minX - x0); x0 = minX; x1 = x0 + tw; }
      if (x1 > maxX) { cx -= (x1 - maxX); x1 = maxX; x0 = x1 - tw; }
      const y0 = cy - th / 2, y1 = cy + th / 2;
      if (y0 < minY || y1 > maxY) continue;
      const hit = placed.some(b => !(x1 + 3 < b.x0 || x0 - 3 > b.x1 || y1 + 2 < b.y0 || y0 - 2 > b.y1));
      if (!hit) {
        placed.push({ x0, x1, y0, y1 });
        c.textAlign = align;
        c.fillText(text, cx, cy);
        return true;
      }
    }
    return false;
  };
}

/* ───────── 01 · 5-Stage Pipeline ───────── */
(() => {
  const cv = $('#ppCv');
  const chkFwd = $('#ppFwd');
  const btnPlay = $('#ppPlay');
  let mem = 1, fwd = true;
  let simRes = M.pipeline.simulate(mem, fwd);
  let curCycle = reduce ? simRes.totalCycles : 4;
  let playing = false;
  let acc = 0;

  function recompute(jumpEnd) {
    mem = +radioVal('ppMem');
    fwd = chkFwd.checked;
    simRes = M.pipeline.simulate(mem, fwd);
    if (jumpEnd || reduce) {
      curCycle = simRes.totalCycles;
      playing = false;
      btnPlay.setAttribute('aria-pressed', 'false');
      btnPlay.textContent = t('ch1.btn.play');
    } else {
      curCycle = clamp(curCycle, 1, simRes.totalCycles);
    }
    sim.dirty = true;
    text();
  }

  const sim = reg(cv, {
    step(dt) {
      if (!playing || reduce) return;
      const speed = mem > 40 ? 28 : mem > 10 ? 6 : 2.2;
      acc += dt * speed;
      if (acc >= 1) {
        const adv = Math.floor(acc);
        acc -= adv;
        curCycle += adv;
        if (curCycle >= simRes.totalCycles) {
          curCycle = simRes.totalCycles;
          playing = false;
          btnPlay.setAttribute('aria-pressed', 'false');
          btnPlay.textContent = t('ch1.btn.play');
        }
        this.dirty = true;
        text();
      }
    },
    draw() {
      const { c, w, h } = fit(cv);
      const st = M.pipeline.stageAt(simRes, curCycle);
      const stages = ['IF', 'ID', 'EX', 'MEM', 'WB'];
      const pad = w < 420 ? 10 : 18;
      const gap = w < 420 ? 6 : 12;
      const boxW = (w - 2 * pad - 4 * gap) / 5;
      const boxY = 40;
      const boxH = w < 420 ? 66 : 74;

      // Top status line
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch1.cv.cycle', { c: fmt(curCycle), tot: fmt(simRes.totalCycles) }), pad, 18);

      // 5 Stage boxes
      stages.forEach((sg, idx) => {
        const x = pad + idx * (boxW + gap);
        const insIdx = st[sg];
        let bg = C.grid, bd = C.line, fg = C.mute, sub = '—';
        if (insIdx != null) {
          const isMemWait = (sg === 'MEM' && st.memWait) || (sg === 'ID' && st.memWait);
          const isAluWait = (sg === 'ID' && st.aluWait);
          if (isMemWait) {
            bg = 'rgba(240,122,109,.18)'; bd = C.red; fg = C.red;
            sub = sg === 'MEM' ? t('ch1.cv.memstall') : t('ch1.cv.stall');
          } else if (isAluWait) {
            bg = 'rgba(233,185,73,.18)'; bd = C.gold; fg = C.gold;
            sub = t('ch1.cv.stall');
          } else {
            bg = 'rgba(99,199,230,.15)'; bd = C.cyan; fg = C.ink;
            sub = 'I' + insIdx + ' ' + M.pipeline.INSTS[insIdx].op.split(' ')[0];
          }
        }
        c.fillStyle = bg; c.strokeStyle = bd; c.lineWidth = 1.5;
        c.beginPath(); c.roundRect(x, boxY, boxW, boxH, 8); c.fill(); c.stroke();

        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'center';
        c.fillText(sg, x + boxW / 2, boxY + 18);
        c.fillStyle = fg; c.font = w < 420 ? FONT_SM : FONT;
        c.fillText(sub, x + boxW / 2, boxY + boxH - 22, boxW - 6);
      });

      // Bottom Gantt timeline (6 instruction rows)
      const gTop = boxY + boxH + 26;
      const gBot = h - 22;
      const rowH = Math.max(12, Math.floor((gBot - gTop) / 6) - 4);
      const labelW = w < 420 ? 48 : 88;
      const gx0 = pad + labelW, gx1 = w - pad;
      const totalC = simRes.totalCycles;
      const scaleX = cyc => gx0 + ((cyc - 1) / totalC) * (gx1 - gx0);

      for (let i = 0; i < 6; i++) {
        const y = gTop + i * (rowH + 4);
        const s = simRes.sched[i];
        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'left';
        const opTxt = w < 420 ? ('I' + i + ' ' + M.pipeline.INSTS[i].op.split(' ')[0]) : ('I' + i + ' ' + M.pipeline.INSTS[i].op.split(',')[0].replace(/\s+/g, ' '));
        c.fillText(opTxt, pad, y + rowH / 2);

        // Background track
        c.fillStyle = C.grid;
        c.fillRect(gx0, y, gx1 - gx0, rowH);

        // Active working spans (IF, ID start, EX, MEM start, WB)
        const drawSeg = (c0, c1, col) => {
          const xA = scaleX(c0), xB = Math.max(xA + 2, scaleX(c1 + 1));
          c.fillStyle = col;
          c.fillRect(xA, y + 1, xB - xA, rowH - 2);
        };
        drawSeg(s.ifCycle, s.ifCycle, C.cyan);
        drawSeg(s.idStart, s.idStart, C.cyan);
        if (s.idEnd > s.idStart) drawSeg(s.idStart + 1, s.idEnd, s.hazard === 'mem' ? C.red : C.gold);
        drawSeg(s.ex, s.ex, C.cyan);
        drawSeg(s.memStart, s.memStart, C.cyan);
        if (s.memEnd > s.memStart) drawSeg(s.memStart + 1, s.memEnd, C.red);
        drawSeg(s.wb, s.wb, C.green);
      }

      // Cycle cursor line on timeline
      const cx = scaleX(curCycle);
      c.strokeStyle = C.ink; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(cx, gTop - 4); c.lineTo(cx, gBot + 2); c.stroke();
    }
  });

  function text() {
    put('#ppCyc', t('common.cyc', { v: fmt(simRes.totalCycles) }));
    put('#ppCpi', fmt(simRes.cpi, 2));
    put('#ppWait', fmt(simRes.waitPct, 1) + '%');
    put('#ppWork', fmt(simRes.computePct, 1) + '%');
    const key = mem > 1 ? 'ch1.say.miss' : (fwd ? 'ch1.say.l1f' : 'ch1.say.nofwd');
    putHTML('#ppSay', t(key, {
      m: fmt(mem), cyc: fmt(simRes.totalCycles),
      cpi: fmt(simRes.cpi, 2), wait: fmt(simRes.waitPct, 1)
    }));
    btnPlay.textContent = playing ? t('ch1.btn.pause') : t('ch1.btn.play');
  }
  sim.text = text;
  radios('ppMem').forEach(r => r.addEventListener('change', () => recompute(true)));
  chkFwd.addEventListener('change', () => recompute(true));
  on('#ppStep', 'click', () => {
    playing = false;
    btnPlay.setAttribute('aria-pressed', 'false');
    curCycle = curCycle >= simRes.totalCycles ? 1 : curCycle + 1;
    sim.dirty = true; text();
  });
  on('#ppPlay', 'click', () => {
    if (reduce) { curCycle = simRes.totalCycles; sim.dirty = true; text(); return; }
    if (curCycle >= simRes.totalCycles) curCycle = 1;
    playing = !playing;
    btnPlay.setAttribute('aria-pressed', String(playing));
    text();
  });
  on('#ppReset', 'click', () => {
    playing = false;
    btnPlay.setAttribute('aria-pressed', 'false');
    curCycle = 1;
    sim.dirty = true; text();
  });
  text();
})();

/* ───────── 02a · Memory Latency Pyramid ───────── */
(() => {
  const cv = $('#lvCv');
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const scale = radioVal('lvScale');
      const levs = M.hierarchy.LEVELS;
      const leftW = w < 420 ? 54 : 74;
      const rightW = w < 420 ? 74 : 92;
      const bx0 = leftW, bx1 = w - rightW;
      const top = 18, bot = h - 26;
      const rowH = (bot - top) / levs.length;
      const maxNs = 70000;
      const cols = [C.green, C.cyan, C.cyan, C.gold, C.red];

      levs.forEach((lv, i) => {
        const y = top + i * rowH + rowH * 0.22;
        const bh = Math.max(10, rowH * 0.56);
        const ratio = scale === 'log'
          ? Math.log10(lv.ns + 0.5) / Math.log10(maxNs + 0.5)
          : lv.ns / maxNs;
        const bw = Math.max(2, ratio * (bx1 - bx0));
        c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'right';
        c.fillText(lv.id.toUpperCase(), bx0 - 8, y + bh / 2);
        c.fillStyle = C.grid; c.fillRect(bx0, y, bx1 - bx0, bh);
        c.fillStyle = cols[i]; c.fillRect(bx0, y, bw, bh);
        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'left';
        const vTxt = lv.ns >= 1000 ? (fmt(lv.ns / 1000) + ' us') : (fmt(lv.ns) + ' ns');
        c.fillText(vTxt, bx1 + 8, y + bh / 2);
      });
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'right';
      c.fillText(t('ch2.lv.cvx'), bx1, h - 10);
    }
  });
  function text() {
    const scale = radioVal('lvScale');
    put('#lvL1', t('common.ns', { v: '1' }));
    put('#lvL2', t('common.ns', { v: '4' }));
    put('#lvDram', t('common.ns', { v: '80' }));
    put('#lvSsd', '70,000 ns');
    putHTML('#lvSay', t(scale === 'log' ? 'ch2.lv.say.log' : 'ch2.lv.say.lin'));
  }
  sim.text = text;
  radios('lvScale').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 02b · Set-Associative Cache Simulator + Browser Benchmark ───────── */
(() => {
  const cv = $('#cwCv');
  let res = null;
  let benchRatio = null;

  function runSim() {
    res = M.cacheWalk.simulate({
      N: 16,
      order: radioVal('cwOrd'),
      cacheBytes: +radioVal('cwCap'),
      blockBytes: +radioVal('cwBlk'),
      ways: +radioVal('cwWay'),
    });
    sim.dirty = true;
    text();
  }

  function runBrowserBenchmark() {
    const N = 512;
    const arr = new Float64Array(N * N);
    for (let i = 0; i < arr.length; i++) arr[i] = (i % 97) * 0.01;
    const rowTimes = [], colTimes = [];
    let sink = 0;
    // Warm up
    for (let i = 0; i < arr.length; i++) sink += arr[i];
    for (let run = 0; run < 7; run++) {
      let t0 = performance.now(), s1 = 0;
      for (let r = 0; r < N; r++) {
        const base = r * N;
        for (let c = 0; c < N; c++) s1 += arr[base + c];
      }
      rowTimes.push(Math.max(0.005, performance.now() - t0));
      sink += s1;

      t0 = performance.now(); let s2 = 0;
      for (let c = 0; c < N; c++) {
        for (let r = 0; r < N; r++) s2 += arr[r * N + c];
      }
      colTimes.push(Math.max(0.005, performance.now() - t0));
      sink += s2;
    }
    void sink;
    rowTimes.sort((a, b) => a - b);
    colTimes.sort((a, b) => a - b);
    const medRow = rowTimes[3], medCol = colTimes[3];
    benchRatio = medCol / Math.max(0.005, medRow);
    text();
  }

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      if (!res) return;
      const N = res.N;
      const wideMode = w >= 540;
      const gridSize = wideMode ? Math.min(220, h - 56) : Math.min(168, w - 40);
      const gx = wideMode ? 24 : Math.round((w - gridSize) / 2);
      const gy = 34;
      const cell = gridSize / N;

      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch2.cv.mat'), gx, 16);

      for (let r = 0; r < N; r++) {
        for (let col = 0; col < N; col++) {
          const miss = res.missGrid[r * N + col];
          c.fillStyle = miss ? 'rgba(240,122,109,0.78)' : 'rgba(122,214,160,0.72)';
          c.fillRect(gx + col * cell + 0.5, gy + r * cell + 0.5, Math.max(1, cell - 1), Math.max(1, cell - 1));
        }
      }

      // Stats / Hit-Miss bar panel
      const sx = wideMode ? gx + gridSize + 34 : 18;
      const sw = wideMode ? Math.max(120, w - sx - 20) : (w - 36);
      const sy = wideMode ? 34 : (gy + gridSize + 24);
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch2.cv.stats'), sx, sy - 14);

      const barH = 26;
      const hitW = res.hitRate * sw;
      c.fillStyle = C.green; c.fillRect(sx, sy, hitW, barH);
      c.fillStyle = C.red; c.fillRect(sx + hitW, sy, sw - hitW, barH);
      c.strokeStyle = C.line; c.strokeRect(sx, sy, sw, barH);

      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch2.cv.missrate', { r: fmt(res.missRate * 100, 1) }), sx, sy + barH + 16);

      // Draw cache line slots preview (up to 32 lines)
      const lines = res.cache.totalLines;
      const cols = Math.min(16, lines);
      const rows = Math.ceil(lines / cols);
      const lw = Math.min(18, Math.floor((sw - (cols - 1) * 3) / cols));
      const slotTop = sy + barH + 34;
      if (slotTop + rows * (lw + 3) < h - 6) {
        let idx = 0;
        for (let sIdx = 0; sIdx < res.cache.numSets; sIdx++) {
          const setArr = res.cache.sets[sIdx];
          for (let wIdx = 0; wIdx < res.cache.ways; wIdx++) {
            const colI = idx % cols, rowI = Math.floor(idx / cols);
            const lx = sx + colI * (lw + 3), ly = slotTop + rowI * (lw + 3);
            const filled = wIdx < setArr.length;
            c.fillStyle = filled ? 'rgba(99,199,230,0.45)' : C.grid;
            c.fillRect(lx, ly, lw, lw);
            idx++;
          }
        }
      }
    }
  });

  function text() {
    if (!res) return;
    const cap = +radioVal('cwCap'), blk = +radioVal('cwBlk'), ord = radioVal('cwOrd');
    put('#cwHits', fmt(res.hits));
    put('#cwMiss', fmt(res.misses) + ' (' + fmt(res.missRate * 100, 1) + '%)');
    put('#cwBytes', t('common.bytes', { v: fmt(res.bytesTransferred) }));
    put('#cwRatio', benchRatio != null ? t('common.x', { v: fmt(benchRatio, 1) }) : t('ch2.read.waitbench'));
    const colFit = ord === 'col' && cap >= res.matrixBytes && res.misses <= Math.ceil(res.matrixBytes / blk);
    const sayKey = ord === 'row' ? 'ch2.say.row' : (colFit ? 'ch2.say.colfit' : 'ch2.say.col');
    putHTML('#cwSay', t(sayKey, {
      cap: fmt(cap), blk: fmt(blk), miss: fmt(res.misses),
      rate: fmt(res.missRate * 100, 1), bytes: fmt(res.bytesTransferred)
    }));
  }
  sim.text = text;
  ['cwOrd', 'cwCap', 'cwBlk', 'cwWay'].forEach(n => radios(n).forEach(r => r.addEventListener('change', runSim)));
  on('#cwBench', 'click', runBrowserBenchmark);
  runSim();
})();

/* ───────── 03 · Tiled Matrix Multiply ───────── */
(() => {
  const cv = $('#tlCv');
  const B_LIST = [2, 4, 8, 12, 16, 24];
  const sB = $('#tlB');
  let curRes = null;
  const allBars = [];

  function buildAll() {
    allBars.length = 0;
    allBars.push({ key: 'ijk', label: 'i-j-k', res: M.matmulTile.simulate(24, 'ijk', 8) });
    allBars.push({ key: 'ikj', label: 'i-k-j', res: M.matmulTile.simulate(24, 'ikj', 8) });
    B_LIST.forEach(b => allBars.push({ key: 'b' + b, b, label: 'B=' + b, res: M.matmulTile.simulate(24, 'tiled', b) }));
  }
  buildAll();

  function update() {
    const mode = radioVal('tlMode');
    const b = B_LIST[+sB.value];
    sB.disabled = mode !== 'tiled';
    curRes = M.matmulTile.simulate(24, mode, b);
    sim.dirty = true;
    text();
  }

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const mode = radioVal('tlMode');
      const b = B_LIST[+sB.value];
      const activeKey = mode === 'tiled' ? ('b' + b) : mode;
      const f = frame(w, h, [32, 16, 44, w < 420 ? 48 : 58], 0, allBars.length, 0, 4500);
      yTicks(c, f, [0, 1000, 2000, 3000, 4000], v => fmt(v));
      axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'), { xLabDy: 30 });

      const slotW = (f.R - f.L) / allBars.length;
      const barW = Math.max(10, slotW * 0.64);
      allBars.forEach((item, idx) => {
        const cx = f.L + (idx + 0.5) * slotW;
        const x0 = cx - barW / 2;
        const yTop = f.Y(item.res.misses);
        const isCur = item.key === activeKey;
        const fill = item.res.fitsCache ? 'rgba(122,214,160,0.72)' : 'rgba(240,122,109,0.68)';
        c.fillStyle = fill;
        c.fillRect(x0, yTop, barW, f.B - yTop);
        if (isCur) {
          c.strokeStyle = C.gold; c.lineWidth = 2.4;
          c.strokeRect(x0 - 1, yTop - 1, barW + 2, f.B - yTop + 2);
          c.fillStyle = C.gold; c.font = MONO; c.textAlign = 'center';
          c.fillText(fmt(item.res.misses), cx, Math.max(f.T + 8, yTop - 10));
        }
        c.fillStyle = isCur ? C.gold : C.mute; c.font = FONT_SM; c.textAlign = 'center';
        const lbl = w < 420 ? item.label.replace('B=', '').replace('-', '') : item.label;
        c.fillText(lbl, cx, f.B + 12);
      });
    }
  });

  function text() {
    const mode = radioVal('tlMode');
    const b = B_LIST[+sB.value];
    put('#tlBo', 'B = ' + fmt(b));
    put('#tlFlops', fmt(curRes.flops));
    put('#tlMiss', fmt(curRes.misses));
    put('#tlBytes', t('common.bytes', { v: fmt(curRes.bytesTransferred) }));
    put('#tlAi', t('common.flopb', { v: fmt(curRes.effIntensity, 2) }));
    const vars = {
      flops: fmt(curRes.flops), miss: fmt(curRes.misses),
      bytes: fmt(curRes.bytesTransferred), ai: fmt(curRes.effIntensity, 2),
      b: fmt(b), ws: fmt(curRes.workingSetBytes)
    };
    const key = mode === 'ijk' ? 'ch3.say.ijk'
      : mode === 'ikj' ? 'ch3.say.ikj'
      : curRes.fitsCache ? 'ch3.say.fit' : 'ch3.say.spill';
    putHTML('#tlSay', t(key, vars));
  }
  sim.text = text;
  radios('tlMode').forEach(r => r.addEventListener('change', update));
  sB.addEventListener('input', update);
  update();
})();

/* ───────── 04 · Memory Wall & Little's Law ───────── */
(() => {
  const cv = $('#mwCv');
  const sMiss = $('#mwMiss'), sLat = $('#mwLat'), sReq = $('#mwReq');

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const m = +sMiss.value / 100;
      const lat = +sLat.value;
      const req = +sReq.value;
      const effCpi = M.memoryWall.effCPI(1, 0.3, m, 250);
      const ll = M.memoryWall.littlesLaw(3350, lat, req, 128);
      const wideMode = w >= 560;

      // Panel 1: CPI breakdown bar (left column on desktop, top band on mobile)
      const cpiMax = 9;
      if (wideMode) {
        const bx = 26, bw = 120, by = 38, bh = h - 76;
        const fCpi = frame(bx + bw + 30, h, [38, 12, 38, bx + 42], 0, 1, 0, cpiMax);
        yTicks(c, fCpi, [0, 3, 6, 9], v => fmt(v));
        c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
        c.fillText(t('ch4.cv.left'), fCpi.L, 18);
        const y0 = fCpi.Y(0), yBase = fCpi.Y(1), yTot = fCpi.Y(Math.min(cpiMax, effCpi));
        c.fillStyle = C.green; c.fillRect(fCpi.L + 16, yBase, 44, y0 - yBase);
        c.fillStyle = C.red; c.fillRect(fCpi.L + 16, yTot, 44, yBase - yTot);
        c.fillStyle = C.ink; c.font = MONO; c.textAlign = 'center';
        c.fillText(fmt(effCpi, 2), fCpi.L + 38, Math.max(fCpi.T + 10, yTot - 10));
      } else {
        const bx = 18, bw = w - 36, by = 30, bh = 22;
        c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
        c.fillText(t('ch4.cv.left') + ': CPI ' + fmt(effCpi, 2), bx, 14);
        c.fillStyle = C.grid; c.fillRect(bx, by, bw, bh);
        const wBase = Math.min(bw, (1 / cpiMax) * bw);
        const wStall = Math.min(bw - wBase, ((effCpi - 1) / cpiMax) * bw);
        c.fillStyle = C.green; c.fillRect(bx, by, wBase, bh);
        c.fillStyle = C.red; c.fillRect(bx + wBase, by, wStall, bh);
      }

      // Panel 2: Little's Law BW vs In-flight requests
      const leftPad = wideMode ? 245 : 54;
      const topPad = wideMode ? 36 : 86;
      const f = frame(w, h, [topPad, 18, 42, leftPad], 0, 3600, 0, 3600);
      yTicks(c, f, [0, 1000, 2000, 3350], v => fmt(v));
      xTicks(c, f, w < 420 ? [0, 1800, 3600] : [0, 900, 1800, 2700, 3600], v => fmt(v), true);
      axes(c, f, t('ch4.cv.right'), t('ch4.cv.bw'), { xLabDy: 28 });

      const pts = [];
      for (let r = 16; r <= 3600; r += 32) {
        pts.push([r, M.memoryWall.littlesLaw(3350, lat, r, 128).achievedBwGBs]);
      }
      pts.push([3600, M.memoryWall.littlesLaw(3350, lat, 3600, 128).achievedBwGBs]);
      path(c, pts, f.X, f.Y, C.cyan);

      const knee = clamp(ll.requiredReqs, 0, 3600);
      c.strokeStyle = C.gold; c.lineWidth = 1.3; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(f.X(knee), f.T); c.lineTo(f.X(knee), f.B); c.stroke();
      c.setLineDash([]);
      cursorDot(c, f.X(req), f.Y(ll.achievedBwGBs), C.gold);
    }
  });

  function text() {
    const m = +sMiss.value / 100;
    const lat = +sLat.value;
    const req = +sReq.value;
    const effCpi = M.memoryWall.effCPI(1, 0.3, m, 250);
    const util = M.memoryWall.computeUtilPct(1, effCpi);
    const ll = M.memoryWall.littlesLaw(3350, lat, req, 128);
    put('#mwMisso', fmt(+sMiss.value, 1) + '%');
    put('#mwLato', t('common.ns', { v: fmt(lat) }));
    put('#mwReqo', fmt(req));
    put('#mwCpi', fmt(effCpi, 2));
    put('#mwUtil', fmt(util, 1) + '%');
    put('#mwBw', t('common.gbs', { v: fmt(ll.achievedBwGBs, 1) }) + ' (' + fmt(ll.bwPct, 1) + '%)');
    put('#mwNeed', fmt(Math.round(ll.requiredReqs)));
    const key = m === 0 ? 'ch4.say.zero' : (req >= ll.requiredReqs ? 'ch4.say.full' : 'ch4.say.starved');
    putHTML('#mwSay', t(key, {
      m: fmt(+sMiss.value, 1), cpi: fmt(effCpi, 2), util: fmt(util, 1),
      req: fmt(req), lat: fmt(lat), bw: fmt(ll.achievedBwGBs, 1),
      bwp: fmt(ll.bwPct, 1), need: fmt(Math.round(ll.requiredReqs))
    }));
  }
  sim.text = text;
  [sMiss, sLat, sReq].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 05 · Multi-core Scaling ───────── */
(() => {
  const cv = $('#mcCv');
  const sF = $('#mcF'), sP = $('#mcP'), chkBus = $('#mcBus');

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const fVal = +sF.value / 100;
      const pVal = +sP.value;
      const busOn = chkBus.checked;
      const maxY = 128;
      const f = frame(w, h, [28, 16, 42, 46], 1, 128, 0, maxY);
      yTicks(c, f, [0, 32, 64, 96, 128], v => fmt(v) + '×');
      xTicks(c, f, [1, 32, 64, 96, 128], v => fmt(v), true);
      axes(c, f, t('ch5.cv.x'), t('ch5.cv.y'), { xLabDy: 28 });

      const gusPts = [], amdPts = [], actPts = [];
      for (let p = 1; p <= 128; p += 2) {
        const r = M.multicore.bwCapped(fVal, p, 12, 192);
        gusPts.push([p, r.gustafson]);
        amdPts.push([p, r.amdahl]);
        actPts.push([p, busOn ? r.actual : r.amdahl]);
      }
      c.save(); c.setLineDash([5, 4]);
      path(c, gusPts, f.X, f.Y, C.violet, 1.8);
      c.restore();
      path(c, amdPts, f.X, f.Y, C.cyan, 2.0);
      if (busOn) path(c, actPts, f.X, f.Y, C.gold, 2.4);

      const cur = M.multicore.bwCapped(fVal, pVal, 12, 192);
      cursorDot(c, f.X(pVal), f.Y(busOn ? cur.actual : cur.amdahl), C.gold);
      cursorDot(c, f.X(pVal), f.Y(cur.amdahl), C.cyan);
    }
  });

  function text() {
    const fPct = +sF.value, fVal = fPct / 100, pVal = +sP.value, busOn = chkBus.checked;
    const r = M.multicore.bwCapped(fVal, pVal, 12, 192);
    const act = busOn ? r.actual : r.amdahl;
    put('#mcFo', fmt(fPct) + '%');
    put('#mcPo', fmt(pVal));
    put('#mcGus', t('common.x', { v: fmt(r.gustafson, 1) }));
    put('#mcAmd', t('common.x', { v: fmt(r.amdahl, 1) }));
    put('#mcAct', t('common.x', { v: fmt(act, 1) }));
    put('#mcCap', busOn ? t('common.x', { v: fmt(r.memCap, 0) }) : '—');
    const key = !busOn ? 'ch5.say.nobus' : (r.saturated ? 'ch5.say.sat' : 'ch5.say.ser');
    putHTML('#mcSay', t(key, {
      p: fmt(pVal), f: fmt(fPct), ser: fmt(100 - fPct),
      amd: fmt(r.amdahl, 1), gus: fmt(r.gustafson, 1),
      act: fmt(act, 1), cap: fmt(r.memCap, 0)
    }));
  }
  sim.text = text;
  [sF, sP].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  chkBus.addEventListener('change', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 06 · Systolic Array & Linear Layer ───────── */
(() => {
  const cv = $('#syCv');
  const sM = $('#syM');
  let phase = 0;

  const sim = reg(cv, {
    step(dt) {
      if (reduce) return;
      phase = (phase + dt * 2.4) % 16;
      this.dirty = true;
    },
    draw() {
      const { c, w, h } = fit(cv);
      const k = +radioVal('syK');
      const m = Math.pow(2, +sM.value);
      const b = +radioVal('syPrec');
      const lay = M.gemmLayer.eval(m, 4096, 4096, b);
      const wideMode = w >= 540;

      // Left / Top: k×k systolic grid
      c.font = FONT_SM;
      const actW = c.measureText(t('ch6.cv.act')).width;
      const minGx = Math.ceil(actW) + 12;
      const boxLim = wideMode ? Math.min(208, h - 74) : Math.min(164, w - minGx - 20);
      const cell = Math.floor(boxLim / k);
      const gridPx = cell * k;
      const gx = wideMode ? Math.max(minGx, 72) : Math.max(minGx, Math.round((w - gridPx) / 2) + 16);
      const gy = 38;

      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch6.cv.dim', { k: fmt(k), mac: fmt(k * k) }), Math.max(12, gx - 24), 16);
      c.fillStyle = C.cyan; c.textAlign = 'right';
      c.fillText(t('ch6.cv.act'), gx - 6, gy + gridPx / 2);
      c.fillStyle = C.gold; c.textAlign = 'center';
      c.fillText(t('ch6.cv.psum'), gx + gridPx / 2, gy + gridPx + 14);

      const wave = reduce ? k : phase;
      for (let r = 0; r < k; r++) {
        for (let col = 0; col < k; col++) {
          const x = gx + col * cell, y = gy + r * cell;
          const diag = r + col;
          const active = Math.abs((wave % (2 * k + 2)) - diag) < 1.2;
          c.fillStyle = active ? 'rgba(99,199,230,0.34)' : 'rgba(233,185,73,0.10)';
          c.strokeStyle = active ? C.cyan : C.line;
          c.lineWidth = 1.2;
          c.fillRect(x + 1, y + 1, cell - 2, cell - 2);
          c.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
          if (cell >= 24) {
            c.fillStyle = active ? C.ink : C.mute; c.font = MONO; c.textAlign = 'center';
            c.fillText('W', x + cell / 2, y + cell / 2);
          }
        }
      }

      // Right / Bottom: Layer arithmetic intensity vs H100 ridge (295.4 FLOP/B)
      const rx = wideMode ? gx + gridPx + 46 : 18;
      const rw = wideMode ? Math.max(120, w - rx - 24) : (w - 36);
      const ry = wideMode ? 68 : (gy + gridPx + 66);
      const barH = 24;
      const ridge = 295.4;
      const maxLog = Math.log10(2000);
      const pos = v => clamp(Math.log10(Math.max(0.5, v) + 0.5) / maxLog, 0, 1) * rw;

      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch6.cv.bar'), rx, ry - 32);
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText('I = ' + fmt(lay.intensity, 1) + ' FLOP/B', rx, ry - 14);
      c.fillStyle = C.grid; c.fillRect(rx, ry, rw, barH);
      c.fillStyle = lay.intensity >= ridge ? C.green : C.gold;
      c.fillRect(rx, ry, pos(lay.intensity), barH);

      const ridgeX = rx + pos(ridge);
      c.strokeStyle = C.cyan; c.lineWidth = 1.5; c.setLineDash([4, 3]);
      c.beginPath(); c.moveTo(ridgeX, ry - 6); c.lineTo(ridgeX, ry + barH + 6); c.stroke();
      c.setLineDash([]);
      c.fillStyle = C.cyan; c.font = FONT_SM; c.textAlign = 'right';
      c.fillText('H100 I* = 295', Math.min(w - 8, ridgeX + 42), ry + barH + 18);
    }
  });

  function text() {
    const k = +radioVal('syK');
    const m = Math.pow(2, +sM.value);
    const b = +radioVal('syPrec');
    const sy = M.systolic.stats(k, 64);
    const lay = M.gemmLayer.eval(m, 4096, 4096, b);
    const flopsStr = lay.flops >= 1e9 ? (fmt(lay.flops / 1e9, 2) + ' GFLOP') : (fmt(lay.flops / 1e6, 1) + ' MFLOP');
    put('#syMo', 'M = ' + fmt(m));
    put('#syMac', fmt(sy.macsPerCycle));
    put('#syReuse', t('common.flopelem', { v: fmt(sy.steadyFlopsPerElem) }));
    put('#syFlops', flopsStr);
    put('#syAi', t('common.flopb', { v: fmt(lay.intensity, 2) }));
    putHTML('#sySay', t(m === 1 ? 'ch6.say.one' : 'ch6.say.batch', {
      m: fmt(m), k: fmt(k), flops: flopsStr,
      ai: fmt(lay.intensity, 2), reuse: fmt(sy.steadyFlopsPerElem)
    }));
  }
  sim.text = text;
  radios('syK').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  radios('syPrec').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  sM.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 · Roofline Model ───────── */
(() => {
  const cv = $('#rfCv');
  const sAi = $('#rfAi');

  function getAi() {
    const wk = radioVal('rfWk');
    if (wk === 'custom') return Math.pow(2, +sAi.value);
    return M.WORKLOADS[wk].intensity;
  }

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const hwId = radioVal('rfHw');
      const wkId = radioVal('rfWk');
      const ai = getAi();
      const ev = M.roofline.eval(hwId, ai);
      const f = frame(w, h, [32, 18, 42, 48], Math.log10(0.25), Math.log10(1024), Math.log10(0.1), Math.log10(4000));
      const X = v => f.X(Math.log10(v));
      const Y = tf => f.Y(Math.log10(Math.max(0.1, tf)));

      yTicks(c, f, [Math.log10(0.1), Math.log10(1), Math.log10(10), Math.log10(100), Math.log10(1000)], v => {
        const val = Math.pow(10, v);
        return val < 1 ? fmt(val, 1) : fmt(val, 0);
      });
      xTicks(c, f, [Math.log10(0.25), Math.log10(1), Math.log10(8), Math.log10(64), Math.log10(512)], v => {
        const val = Math.pow(10, v);
        return val < 1 ? fmt(val, 2) : fmt(val, 0);
      }, true);
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'), { xLabDy: 28 });

      const drawCurve = (id, col, dashed) => {
        const hw = M.HW[id];
        const pts = [];
        for (let lx = Math.log10(0.25); lx <= Math.log10(1024) + 0.01; lx += 0.04) {
          const x = Math.pow(10, lx);
          const tf = Math.min(hw.peakFlops, hw.bwBps * x) / 1e12;
          pts.push([x, tf]);
        }
        c.save();
        if (dashed) c.setLineDash([5, 4]);
        path(c, pts, X, Y, col, dashed ? 1.5 : 2.5);
        c.restore();
      };

      if (hwId !== 'cpu') drawCurve('cpu', C.mute, true);
      drawCurve(hwId, C.cyan, false);

      // Ridge vertical line
      const rx = X(ev.ridge);
      c.strokeStyle = C.violet; c.lineWidth = 1.2; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(rx, f.T); c.lineTo(rx, f.B); c.stroke();
      c.setLineDash([]);

      // Plot standard workloads
      const place = makePlacer(w, h, { l: f.L + 6, r: f.R - 4, t: 4, b: f.B - 6 });
      Object.values(M.WORKLOADS).forEach(wk => {
        const r = M.roofline.eval(hwId, wk.intensity);
        const isSel = wk.id === wkId;
        cursorDot(c, X(wk.intensity), Y(r.perf / 1e12), isSel ? C.gold : 'rgba(235,232,224,0.45)');
      });
      // Active dot & non-overlapping labels
      const curTf = ev.perf / 1e12;
      cursorDot(c, X(ai), Y(curTf), C.gold);
      c.fillStyle = C.violet; c.font = FONT_SM;
      place(c, 'I*=' + fmt(ev.ridge, 1), rx, f.T + 12, 'center');
      c.fillStyle = C.gold; c.font = FONT_SM;
      if (ev.bound === 'memory') {
        place(c, fmt(curTf, 1) + ' TF', X(ai) + 10, clamp(Y(curTf) + 12, f.T + 14, f.B - 14), 'left');
      } else {
        place(c, fmt(curTf, 1) + ' TF', X(ai), Y(curTf) - 16, 'center');
      }
    }
  });

  function text() {
    const hwId = radioVal('rfHw');
    const wkId = radioVal('rfWk');
    const ai = getAi();
    sAi.disabled = wkId !== 'custom';
    const ev = M.roofline.eval(hwId, ai);
    const tf = ev.perf / 1e12;
    put('#rfAio', t('common.flopb', { v: fmt(ai, 2) }));
    put('#rfRidge', t('common.flopb', { v: fmt(ev.ridge, 1) }));
    put('#rfIntensity', t('common.flopb', { v: fmt(ai, 2) }));
    put('#rfPerf', t('common.tflops', { v: fmt(tf, 2) }));
    put('#rfBound', t(ev.bound === 'memory' ? 'ch7.bound.mem' : 'ch7.bound.comp', { u: fmt(ev.utilPct, 1) }));
    const rfHwLabel = { cpu: 'AMD EPYC 9654', h100: 'NVIDIA H100', b200: 'NVIDIA B200', ironwood: 'TPU v7 Ironwood' }[hwId] || hwId.toUpperCase();
    putHTML('#rfSay', t(ev.bound === 'memory' ? 'ch7.say.mem' : 'ch7.say.comp', {
      hw: rfHwLabel, ridge: fmt(ev.ridge, 1),
      ai: fmt(ai, 2), perf: fmt(tf, 2), u: fmt(ev.utilPct, 1)
    }));
  }
  sim.text = text;
  radios('rfHw').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  radios('rfWk').forEach(r => r.addEventListener('change', () => {
    if (r.value !== 'custom') sAi.value = fmt(Math.log2(M.WORKLOADS[r.value].intensity), 1);
    sim.dirty = true; text();
  }));
  sAi.addEventListener('input', () => {
    const cust = document.querySelector('input[name="rfWk"][value="custom"]');
    if (cust) cust.checked = true;
    sim.dirty = true; text();
  });
  text();
})();

/* ───────── 08 · LLM Inference Roofline ───────── */
(() => {
  const cv = $('#lmCv');
  const sB = $('#lmB'), sCtx = $('#lmCtx');

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const modelId = radioVal('lmMod');
      const bits = +radioVal('lmBits');
      const hwId = radioVal('lmHw');
      const batch = +sB.value;
      const ctx = +sCtx.value;
      const cur = M.llmServe.eval({ modelId, hwId, bits, batch, ctx, numGpus: 1 });

      // Top bar: Memory footprint vs GPU VRAM capacity
      const pad = w < 340 ? 12 : 20, bw = w - 2 * pad, by = 28, bh = 18;
      const capGB = cur.hw.capGB;
      const maxGB = Math.max(capGB * 1.25, cur.totalMemBytes / 1e9);
      const wGB = cur.weightBytes / 1e9;
      const kvGB = cur.kvTotalBytes / 1e9;
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch8.cv.mem') + ' (' + fmt(wGB + kvGB, 1) + ' / ' + fmt(capGB) + ' GB)', pad, 14, w - 2 * pad);
      c.fillStyle = C.grid; c.fillRect(pad, by, bw, bh);
      c.fillStyle = C.cyan; c.fillRect(pad, by, (wGB / maxGB) * bw, bh);
      c.fillStyle = cur.fits ? C.violet : C.red;
      c.fillRect(pad + (wGB / maxGB) * bw, by, (kvGB / maxGB) * bw, bh);
      const capX = pad + (capGB / maxGB) * bw;
      c.strokeStyle = C.ink; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(capX, by - 4); c.lineTo(capX, by + bh + 4); c.stroke();
      c.fillStyle = C.ink; c.font = FONT_SM; c.textAlign = 'center';
      c.fillText(fmt(capGB) + ' GB', clamp(capX, pad + 22, w - pad - 22), by + bh + 12);

      // Bottom chart: Total & per-user tokens/s across batch 1..128
      const maxTot = M.llmServe.eval({ modelId, hwId, bits, batch: 128, ctx, numGpus: 1 }).tokPerSecTotal;
      const yTop = Math.max(100, Math.ceil(maxTot / 1000) * 1000 || Math.ceil(maxTot * 1.15));
      const f = frame(w, h, [88, 18, 42, 54], 1, 128, 0, yTop);
      yTicks(c, f, [0, yTop / 2, yTop], v => fmt(v));
      xTicks(c, f, [1, 32, 64, 96, 128], v => fmt(v), true);
      axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'), { xLabDy: 28 });

      const totPts = [], usrPts = [];
      let oomStart = null;
      for (let b = 1; b <= 128; b += 2) {
        const r = M.llmServe.eval({ modelId, hwId, bits, batch: b, ctx, numGpus: 1 });
        totPts.push([b, r.tokPerSecTotal]);
        usrPts.push([b, r.tokPerSecUser]);
        if (!r.fits && oomStart === null) oomStart = b;
      }
      if (oomStart !== null) {
        c.fillStyle = 'rgba(240,122,109,0.16)';
        c.fillRect(f.X(oomStart), f.T, f.R - f.X(oomStart), f.B - f.T);
      }
      path(c, totPts, f.X, f.Y, C.cyan, 2.2);
      path(c, usrPts, f.X, f.Y, C.gold, 2.0);
      cursorDot(c, f.X(batch), f.Y(cur.tokPerSecTotal), C.cyan);
      cursorDot(c, f.X(batch), f.Y(cur.tokPerSecUser), C.gold);
    }
  });

  function text() {
    const modelId = radioVal('lmMod');
    const bits = +radioVal('lmBits');
    const hwId = radioVal('lmHw');
    const batch = +sB.value;
    const ctx = +sCtx.value;
    const cur = M.llmServe.eval({ modelId, hwId, bits, batch, ctx, numGpus: 1 });
    const memGB = cur.totalMemBytes / 1e9;
    const stepGB = cur.bytesPerStep / 1e9;
    put('#lmBo', fmt(batch));
    put('#lmCtxo', fmt(ctx));
    put('#lmUsr', t('common.toks', { v: fmt(cur.tokPerSecUser, 1) }));
    put('#lmTot', t('common.toks', { v: fmt(cur.tokPerSecTotal, 0) }));
    put('#lmMem', t('common.gb', { v: fmt(memGB, 1) }) + ' / ' + t('common.gb', { v: fmt(cur.hw.capGB) }));
    put('#lmUtil', fmt(cur.computeUtilPct, 1) + '%');
    const key = !cur.fits ? 'ch8.say.oom' : (cur.bound === 'memory' ? 'ch8.say.mem' : 'ch8.say.comp');
    putHTML('#lmSay', t(key, {
      mem: fmt(memGB, 1), hw: hwId.toUpperCase(), cap: fmt(cur.hw.capGB),
      util: fmt(cur.computeUtilPct, 1), stepgb: fmt(stepGB, 2),
      kvpct: fmt(cur.kvSharePct, 1), usr: fmt(cur.tokPerSecUser, 1),
      tot: fmt(cur.tokPerSecTotal, 0), ai: fmt(cur.intensity, 1), b: fmt(batch)
    }));
  }
  sim.text = text;
  ['lmMod', 'lmBits', 'lmHw'].forEach(n => radios(n).forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); })));
  [sB, sCtx].forEach(e => e.addEventListener('input', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── 09 · Energy Budget & Interconnect Ladder ───────── */
(() => {
  const cv = $('#enCv');
  const sReuse = $('#enReuse');

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const src = radioVal('enSrc');
      const reuse = +sReuse.value;
      const b = M.energy.budget(reuse, src);

      // Top panel: Energy stacked bar
      const pad = w < 340 ? 12 : 20, bw = w - 2 * pad, by = 34, bh = 28;
      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch9.cv.top') + ': ' + fmt(b.totalPj, 2) + ' pJ', pad, 15, w - 2 * pad);
      const compW = Math.max(4, (b.macPj / b.totalPj) * bw);
      c.fillStyle = C.green; c.fillRect(pad, by, compW, bh);
      c.fillStyle = C.red; c.fillRect(pad + compW, by, bw - compW, bh);
      c.strokeStyle = C.line; c.strokeRect(pad, by, bw, bh);

      // Bottom panel: Interconnect bandwidth (log scale)
      const links = M.energy.INTERCONNECTS;
      const top = 96, bot = h - 22;
      const rowH = (bot - top) / links.length;
      const leftW = w < 420 ? 64 : 84;
      c.font = MONO;
      const valStrs = links.map(lk => fmt(lk.bwGBs) + ' GB/s');
      const maxValW = Math.max(...valStrs.map(s => c.measureText(s).width));
      const lx0 = leftW, lx1 = w - maxValW - 18;
      const maxLog = Math.log10(8000);

      c.fillStyle = C.mute; c.font = FONT_SM; c.textAlign = 'left';
      c.fillText(t('ch9.cv.bot'), pad, 80);

      links.forEach((lk, i) => {
        const y = top + i * rowH + rowH * 0.22;
        const barH = Math.max(10, rowH * 0.54);
        const bwLk = (Math.log10(lk.bwGBs) / maxLog) * Math.max(24, lx1 - lx0);
        c.fillStyle = C.ink; c.font = MONO; c.textAlign = 'right';
        c.fillText(lk.id.toUpperCase(), lx0 - 8, y + barH / 2);
        c.fillStyle = C.grid; c.fillRect(lx0, y, Math.max(24, lx1 - lx0), barH);
        c.fillStyle = C.cyan; c.fillRect(lx0, y, bwLk, barH);
        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'right';
        c.fillText(valStrs[i], w - 8, y + barH / 2);
      });
    }
  });

  function text() {
    const src = radioVal('enSrc');
    const reuse = +sReuse.value;
    const b = M.energy.budget(reuse, src);
    put('#enReuseo', reuse === 1 ? t('common.time1') : t('common.times', { v: fmt(reuse) }));
    put('#enComp', t('common.pj', { v: fmt(b.macPj, 1) }));
    put('#enMove', t('common.pj', { v: fmt(b.movePerMacPj, 2) }));
    put('#enShare', fmt(b.moveSharePct, 1) + '%');
    put('#enRatio', t('common.x', { v: fmt(b.ratioMoveToMac, 1) }));
    const srcName = t(src === 'dram' ? 'ch9.opt.dram' : src === 'sram1m' ? 'ch9.opt.sram1m' : 'ch9.opt.sram8');
    const key = src !== 'dram' ? 'ch9.say.sram' : (reuse <= 1 ? 'ch9.say.dram1' : 'ch9.say.reused');
    putHTML('#enSay', t(key, {
      src: srcName, reuse: fmt(reuse),
      move: fmt(b.movePerMacPj, 2), share: fmt(b.moveSharePct, 1),
      ratio: fmt(b.ratioMoveToMac, 1)
    }));
  }
  sim.text = text;
  radios('enSrc').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  sReuse.addEventListener('input', () => { sim.dirty = true; text(); });
  text();
})();

/* ───────── 10 · Frontier 2026-11 ───────── */
(() => {
  const cv = $('#frCv');

  function getVal(chip, met) {
    if (met === 'bw') return chip.bwTB;
    if (met === 'cap') return chip.capGB;
    if (met === 'ridge') return chip.bf16Tflops != null ? (chip.bf16Tflops / chip.bwTB) : null;
    return null;
  }

  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv);
      const met = radioVal('frMet');
      const chips = M.FRONTIER.chips.filter(ch => getVal(ch, met) != null);
      const maxV = Math.max(...chips.map(ch => getVal(ch, met)));
      const unit = t(met === 'bw' ? 'ch10.cv.bw' : met === 'cap' ? 'ch10.cv.cap' : 'ch10.cv.ridge');
      c.font = MONO;
      const valStrs = chips.map(ch => fmt(getVal(ch, met), met === 'cap' ? 0 : 1) + ' ' + unit);
      const maxValW = Math.max(...valStrs.map(s => c.measureText(s).width));
      const leftW = w < 420 ? 94 : 156;
      const bx0 = leftW, bx1 = w - maxValW - 18;
      const top = 22, bot = h - 18;
      const rowH = (bot - top) / chips.length;

      chips.forEach((ch, i) => {
        const val = getVal(ch, met);
        const y = top + i * rowH + rowH * 0.2;
        const bh = Math.max(11, rowH * 0.6);
        const barArea = Math.max(24, bx1 - bx0);
        const bw = (val / maxV) * barArea;
        c.fillStyle = C.ink; c.font = w < 420 ? FONT_SM : FONT; c.textAlign = 'right';
        const lbl = w < 420 ? ch.label.replace('NVIDIA ', '').replace('AMD Instinct ', '').replace('Google ', '').replace(' (CPU)', '') : ch.label;
        c.fillText(lbl, bx0 - 8, y + bh / 2, bx0 - 12);
        c.fillStyle = C.grid; c.fillRect(bx0, y, barArea, bh);
        c.fillStyle = ch.status === 'vendor-spec' ? C.gold : C.cyan;
        c.fillRect(bx0, y, bw, bh);
        c.fillStyle = C.mute; c.font = MONO; c.textAlign = 'right';
        c.fillText(valStrs[i], w - 8, y + bh / 2);
      });
    }
  });

  function text() {
    const met = radioVal('frMet');
    const chips = M.FRONTIER.chips.filter(ch => getVal(ch, met) != null);
    let best = chips[0];
    chips.forEach(ch => { if (getVal(ch, met) > getVal(best, met)) best = ch; });
    const bestVal = getVal(best, met);
    const unit = t(met === 'bw' ? 'ch10.cv.bw' : met === 'cap' ? 'ch10.cv.cap' : 'ch10.cv.ridge');
    put('#frTop', best.label + ' · ' + fmt(bestVal, met === 'cap' ? 0 : 1) + ' ' + unit);
    put('#frBus', fmt(M.FRONTIER.hbm4Jedec.busWidthBits) + '-bit');
    put('#frStack', fmt(M.FRONTIER.hbm4Jedec.baselineStackTB, 1) + ' / ' + fmt(M.FRONTIER.hbm4Jedec.vendorSampleStackTBMin, 1) + '–' + fmt(M.FRONTIER.hbm4Jedec.vendorSampleStackTBMax, 1) + ' TB/s');
    put('#frDate', M.FRONTIER.asOf);
    putHTML('#frSay', t('ch10.say.' + met));
  }
  sim.text = text;
  radios('frMet').forEach(r => r.addEventListener('change', () => { sim.dirty = true; text(); }));
  text();
})();

/* ───────── main render loop (on-screen gated) ───────── */
applyLang();
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step(dt);
    if (s.dirty && s.draw) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
