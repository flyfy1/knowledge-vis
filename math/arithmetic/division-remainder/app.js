'use strict';
/* 除法与余数 · 分公平，剩下的叫余数 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 红线落点：
   1. 全页唯一事实源：divmod(n, d) 整数运算给出商与余数；
      所有读数、画布、账本都由它与各步状态纯渲染，不各算一套。
   2. 验算式 被除数 = 除数 × 商 + 余数、余数 < 除数 在每步读数里同屏出现。
   3. 第 0 步与第 2 步共用 PARAMS（同一组被除数/除数）：任一处改滑杆，
      两步同时重置并同步——两边永远在算同一道题。
   4. 改参数必重置该步过程状态（发糖进度、跳格进度、答题判定），
      不留旧判定残留；切语言只重渲染文本，不动状态。
   对账入口：window.DIVREM（divmod / weekday / params / state / set）。 */
const $ = id => document.getElementById(id);
let NOW = 0;

/* ---------- 唯一事实源：整数除法 ---------- */
function divmod(n, d) {
  const q = Math.floor(n / d);
  return { q, r: n - d * q };
}
/* 今天星期二（周日=0 时周二=2），往后 days 天的星期序号 */
function weekdayIdx(days) { return (2 + (days % 7)) % 7; }

/* ---------- 画布适配（DPR）：沿用站内 fitCanvas 方案 ---------- */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) {
    const hAttr = parseInt(cv.getAttribute('height'), 10);
    cv.dataset.cssH = hAttr ? String(hAttr) : '';
  }
  if (cv.dataset.cssH) cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth;
  const h = cv.clientHeight || parseInt(cv.dataset.cssH || '0', 10);
  const bw = Math.max(2, Math.round(w * dpr));
  const bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv._w = w; cv._h = h;
  return ctx;
}
const allCanvases = [];
function regCanvas(id) { const cv = $(id); if (!allCanvases.includes(cv)) allCanvases.push(cv); return cv; }
const refitHooks = [];
function onRefit(fn) { refitHooks.push(fn); }
let refitQueued = false;
window.addEventListener('resize', () => {
  if (refitQueued) return;
  refitQueued = true;
  requestAnimationFrame(() => {
    refitQueued = false;
    allCanvases.forEach(fitCanvas);
    refitHooks.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  });
});

/* ---------- 动画调度：只跑视口内的步骤 ---------- */
const animators = [];
const visibleSet = new Set();
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) visibleSet.add(e.target); else visibleSet.delete(e.target); });
}, { threshold: 0.05 });
function animate(el, fn) { animators.push({ el, fn }); io.observe(el); }
let lastTs = 0;
function loop(ts) {
  NOW = ts;
  const dt = Math.min(0.05, lastTs ? (ts - lastTs) / 1000 : 0.016);
  lastTs = ts;
  for (const a of animators) if (visibleSet.has(a.el)) { try { a.fn(dt); } catch (err) { console.error(err); } }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- 导航高亮 ---------- */
(function nav() {
  const links = document.querySelectorAll('.nav-step');
  const nio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.dataset.nav === e.target.dataset.step));
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(s => nio.observe(s));
})();

/* ---------- 小工具 ---------- */
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function setRO(id, str) { const el = $(id); if (el && el._v !== str) { el._v = str; el.innerHTML = str; } }
function ease(t) { return 1 - Math.pow(1 - t, 3); }
function fitText(ctx, text, x, y, maxW, o) {
  o = o || {};
  let size = o.size || 13;
  const weight = o.weight || '';
  ctx.font = (weight ? weight + ' ' : '') + size + 'px system-ui, sans-serif';
  while (size > 9 && ctx.measureText(text).width > maxW) {
    size -= 0.5;
    ctx.font = (weight ? weight + ' ' : '') + size + 'px system-ui, sans-serif';
  }
  ctx.fillStyle = o.color || '#9aa7b8';
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.baseline || 'alphabetic';
  ctx.fillText(text, x, y);
  return ctx.measureText(text).width;
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
const COL = {
  orange: '#ffb454', candy: '#eda93f', cyan: '#6ee7ff', green: '#7ee2a8', red: '#ff7a93',
  ink: '#e8edf4', mut: '#9aa7b8', grid: '#39465e', rest: '#1e2735', edge: '#8494ab', panel: '#1c2330'
};
/* 一颗糖：圆身 + 高光点；pop>0 时放大 */
function drawCandy(ctx, x, y, r, pop) {
  const rr = r * (1 + (pop || 0));
  ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.fillStyle = COL.candy; ctx.fill();
  ctx.strokeStyle = '#b57a1e'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.beginPath(); ctx.arc(x - rr * 0.3, y - rr * 0.3, rr * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff3d6'; ctx.fill();
}
/* 在矩形区域里按 cols 列网格画 count 颗糖，返回每颗的中心坐标 */
function candyCenters(x, y, w, h, count, cols) {
  const rows = Math.max(1, Math.ceil(count / cols));
  const pts = [];
  for (let i = 0; i < count; i++) {
    const cxi = i % cols, cyi = Math.floor(i / cols);
    pts.push([x + w * (cxi + 0.5) / cols, y + h * (cyi + 0.5) / rows]);
  }
  return pts;
}

/* ============================================================
   共享参数：第 0 步（分糖果）与第 2 步（数轴跳格）同一组数
   ============================================================ */
const PARAMS = { total: 17, people: 4 };

/* ============================================================
   第 0 步：分糖果
   ============================================================ */
const S0 = { dealt: 0, playing: false, acc: 0, lastDealAt: -1e9 };
function s0MaxDealt() { return PARAMS.total - (PARAMS.total % PARAMS.people); }
function s0Done() { return S0.dealt >= s0MaxDealt(); }
function s0PerPlate(i) {
  const p = PARAMS.people;
  return Math.floor(S0.dealt / p) + (i < S0.dealt % p ? 1 : 0);
}
function s0SyncPlayBtn() {
  const b = $('s0-play'); if (b) b.textContent = t(S0.playing ? 's0pause' : 's0play');
}
function s0Draw() {
  const cv = $('s0-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const n = PARAMS.total, p = PARAMS.people;
  const { q, r } = divmod(n, p);
  /* 托盘（未发的糖，含最终余数） */
  const tx = 24, tw = W - 48, ty = 24, th = 82;
  fitText(ctx, t('cTray'), tx, ty - 8, tw, { size: 13.5, color: COL.mut });
  rrect(ctx, tx, ty, tw, th, 12);
  ctx.fillStyle = COL.panel; ctx.fill();
  ctx.strokeStyle = s0Done() && r > 0 ? COL.orange : COL.grid; ctx.lineWidth = s0Done() && r > 0 ? 2 : 1.4; ctx.stroke();
  const undealt = n - S0.dealt;
  if (undealt > 0) {
    const cr = clamp(Math.min(tw / 24, th / 7.4), 4.5, 10);
    candyCenters(tx + 8, ty + 6, tw - 16, th - 12, undealt, 10)
      .forEach(pt => drawCandy(ctx, pt[0], pt[1], cr, 0));
  }
  if (s0Done()) {
    fitText(ctx, r > 0 ? t('cRemain', { r }) : t('cExact'), tx + tw, ty + th + 22, tw,
      { size: 14.5, weight: '700', color: r > 0 ? COL.orange : COL.green, align: 'right' });
  }
  /* 盘子 */
  const py = 152, ph = 108, gap = 10;
  const pw = (W - 48 - (p - 1) * gap) / p;
  const lastPlate = S0.dealt > 0 ? (S0.dealt - 1) % p : -1;
  for (let i = 0; i < p; i++) {
    const px = 24 + i * (pw + gap);
    fitText(ctx, t('cKid', { i: i + 1 }), px + pw / 2, py - 10, pw, { size: 13.5, color: COL.mut, align: 'center' });
    rrect(ctx, px, py, pw, ph, 12);
    ctx.fillStyle = COL.rest; ctx.fill();
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.4; ctx.stroke();
    const cnt = s0PerPlate(i);
    if (cnt > 0) {
      const cols = pw > 108 ? 4 : 3;
      const cr = clamp(Math.min((pw - 10) / (cols * 2.15), ph / 11.5), 4, 9.5);
      const pts = candyCenters(px + 5, py + 5, pw - 10, ph - 10, cnt, cols);
      pts.forEach((pt, idx) => {
        const isNewest = i === lastPlate && idx === cnt - 1;
        const pop = isNewest ? 0.55 * Math.max(0, 1 - (NOW - S0.lastDealAt) / 320) : 0;
        drawCandy(ctx, pt[0], pt[1], cr, pop);
      });
    }
    fitText(ctx, t('cEach', { k: cnt }), px + pw / 2, py + ph + 24, pw,
      { size: 14, weight: '700', color: COL.cyan, align: 'center' });
  }
  /* 读数（纯渲染） */
  if (s0Done()) {
    setRO('s0-readout', r > 0
      ? t('s0roDone', { n, p, q, r })
      : t('s0roExact', { n, p, q }));
  } else if (S0.dealt > 0) {
    setRO('s0-readout', t('s0roMid', { k: S0.dealt, left: n - S0.dealt }));
  } else {
    setRO('s0-readout', t('s0roIdle', { n, p }));
  }
  setRO('s0-prog', t('s0prog', { k: S0.dealt, n }));
  const db = $('s0-deal1'); if (db) db.disabled = s0Done();
}
function s0DealOne() {
  if (s0Done()) return;
  S0.dealt++;
  S0.lastDealAt = NOW;
  if (s0Done()) { S0.playing = false; s0SyncPlayBtn(); }
  s0Draw();
}
function s0Reset() {
  S0.dealt = 0; S0.playing = false; S0.acc = 0; S0.lastDealAt = -1e9;
  s0SyncPlayBtn(); s0Draw();
}
function setParams(total, people) {
  PARAMS.total = clamp(total, 10, 30);
  PARAMS.people = clamp(people, 2, 6);
  $('s0-total').value = String(PARAMS.total);
  $('s0-people').value = String(PARAMS.people);
  $('s0-total-val').textContent = String(PARAMS.total);
  $('s0-people-val').textContent = String(PARAMS.people);
  $('s2-total').value = String(PARAMS.total);
  $('s2-div').value = String(PARAMS.people);
  $('s2-total-val').textContent = String(PARAMS.total);
  $('s2-div-val').textContent = String(PARAMS.people);
  s0Reset();
  s2Reset();
}
function initS0() {
  regCanvas('s0-canvas');
  $('s0-total').addEventListener('input', e => setParams(+e.target.value, PARAMS.people));
  $('s0-people').addEventListener('input', e => setParams(PARAMS.total, +e.target.value));
  $('s0-deal1').addEventListener('click', () => { S0.playing = false; s0SyncPlayBtn(); s0DealOne(); });
  $('s0-play').addEventListener('click', () => {
    if (s0Done()) return;
    S0.playing = !S0.playing;
    s0SyncPlayBtn();
  });
  $('s0-reset').addEventListener('click', s0Reset);
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  animate($('step0'), dt => {
    if (S0.playing) {
      S0.acc += dt;
      let guard = 0;
      while (S0.acc >= 0.42 && !s0Done() && guard++ < 40) { S0.acc -= 0.42; S0.dealt++; S0.lastDealAt = NOW; }
      if (s0Done()) { S0.playing = false; s0SyncPlayBtn(); }
      s0Draw();
    } else if (NOW - S0.lastDealAt < 340) {
      s0Draw(); /* 最新一颗的弹出动画收尾 */
    }
  });
  onLangRefresh(() => { s0SyncPlayBtn(); s0Draw(); });
  onRefit(s0Draw);
  s0SyncPlayBtn(); s0Draw();
}

/* ============================================================
   第 1 步：余数为什么必须比除数小
   ============================================================ */
const S1 = { total: 17, div: 3, per: 4 };
function s1Rem() { return S1.total - S1.div * S1.per; }
function s1Draw() {
  const cv = $('s1-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const { q, r } = divmod(S1.total, S1.div);
  const rem = s1Rem();
  const tooMuch = rem >= S1.div;
  /* 托盘（剩下的 = 当前余数） */
  const tx = 24, tw = W - 48, ty = 24, th = 82;
  fitText(ctx, t('cTrayR', { r: rem }), tx, ty - 8, tw, { size: 13.5, color: tooMuch ? COL.red : COL.mut });
  rrect(ctx, tx, ty, tw, th, 12);
  ctx.fillStyle = COL.panel; ctx.fill();
  if (tooMuch) {
    const a = 0.6 + 0.4 * Math.sin(NOW / 280);
    ctx.strokeStyle = 'rgba(255,122,147,' + a.toFixed(3) + ')'; ctx.lineWidth = 2.4;
  } else {
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.4;
  }
  ctx.stroke();
  if (rem > 0) {
    const cr = clamp(Math.min(tw / 24, th / 7.4), 4.5, 10);
    candyCenters(tx + 8, ty + 6, tw - 16, th - 12, rem, 10)
      .forEach(pt => drawCandy(ctx, pt[0], pt[1], cr, 0));
  }
  fitText(ctx, tooMuch ? t('cGhost') : t('cDone'), tx + tw, ty + th + 22, tw,
    { size: 14.5, weight: '700', color: tooMuch ? COL.red : COL.green, align: 'right' });
  /* 盘子（每人 per 颗） */
  const py = 152, ph = 100, gap = 10, p = S1.div;
  const pw = (W - 48 - (p - 1) * gap) / p;
  for (let i = 0; i < p; i++) {
    const px = 24 + i * (pw + gap);
    fitText(ctx, t('cKid', { i: i + 1 }), px + pw / 2, py - 10, pw, { size: 13.5, color: COL.mut, align: 'center' });
    rrect(ctx, px, py, pw, ph, 12);
    ctx.fillStyle = COL.rest; ctx.fill();
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.4; ctx.stroke();
    const cols = pw > 108 ? 4 : 3;
    const cr = clamp(Math.min((pw - 10) / (cols * 2.15), ph / 11), 4, 9.5);
    if (S1.per > 0) {
      candyCenters(px + 5, py + 5, pw - 10, ph - 10, S1.per, cols)
        .forEach(pt => drawCandy(ctx, pt[0], pt[1], cr, 0));
    }
    if (tooMuch) {
      /* 虚线幽灵糖：下一轮每人还能再拿 1 颗的位置 */
      const ghost = candyCenters(px + 5, py + 5, pw - 10, ph - 10, S1.per + 1, cols)[S1.per];
      ctx.beginPath(); ctx.arc(ghost[0], ghost[1], cr, 0, Math.PI * 2);
      ctx.strokeStyle = COL.red; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
    }
    fitText(ctx, t('cEach', { k: S1.per }), px + pw / 2, py + ph + 24, pw,
      { size: 14, weight: '700', color: COL.cyan, align: 'center' });
  }
  /* 读数（纯渲染） */
  if (tooMuch) {
    setRO('s1-readout', t(rem === S1.div ? 's1roEqual' : 's1roMore', { n: S1.total, d: S1.div, per: S1.per, r: rem }));
  } else if (rem === 0) {
    setRO('s1-readout', t('s1roExact', { n: S1.total, d: S1.div, q }));
  } else {
    setRO('s1-readout', t('s1roDone', { n: S1.total, d: S1.div, q, r }));
  }
  const fb = $('s1-fix'); if (fb) fb.disabled = !tooMuch;
}
function s1SyncControls(resetPer) {
  const { q } = divmod(S1.total, S1.div);
  if (resetPer) S1.per = Math.max(0, q - 1); /* 换题时先摆出「偷懒分法」的反例 */
  S1.per = clamp(S1.per, 0, q);
  $('s1-total').value = String(S1.total);
  $('s1-div').value = String(S1.div);
  $('s1-total-val').textContent = String(S1.total);
  $('s1-div-val').textContent = String(S1.div);
  const per = $('s1-per');
  per.max = String(q);
  per.value = String(S1.per);
  $('s1-per-val').textContent = String(S1.per);
}
function initS1() {
  regCanvas('s1-canvas');
  $('s1-total').addEventListener('input', e => { S1.total = +e.target.value; s1SyncControls(true); s1Draw(); });
  $('s1-div').addEventListener('input', e => { S1.div = +e.target.value; s1SyncControls(true); s1Draw(); });
  $('s1-per').addEventListener('input', e => { S1.per = +e.target.value; s1SyncControls(false); s1Draw(); });
  $('s1-fix').addEventListener('click', () => {
    S1.per = divmod(S1.total, S1.div).q;
    s1SyncControls(false); s1Draw();
  });
  animate($('step1'), () => { if (s1Rem() >= S1.div) s1Draw(); /* 警告脉冲 */ });
  onLangRefresh(s1Draw);
  onRefit(s1Draw);
  s1SyncControls(false); s1Draw();
}

/* ============================================================
   第 2 步：数轴跳格（与第 0 步同一组数）
   ============================================================ */
const S2 = { jumps: 0, playing: false, animStart: 0 };
function s2Q() { return divmod(PARAMS.total, PARAMS.people).q; }
function s2SyncPlayBtn() {
  const b = $('s2-play'); if (b) b.textContent = t(S2.playing ? 's2pause' : 's2play');
}
function s2Draw() {
  const cv = $('s2-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const n = PARAMS.total, d = PARAMS.people;
  const { q, r } = divmod(n, d);
  const x0 = 40, x1 = W - 24, lineY = 188;
  const px = v => x0 + (x1 - x0) * v / 30;
  /* 目标旗 */
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px(n), lineY - 84); ctx.lineTo(px(n), lineY); ctx.stroke();
  ctx.fillStyle = COL.orange;
  ctx.beginPath();
  ctx.moveTo(px(n), lineY - 84); ctx.lineTo(px(n) + 13, lineY - 77); ctx.lineTo(px(n), lineY - 70);
  ctx.closePath(); ctx.fill();
  fitText(ctx, t('cTarget', { n }), clamp(px(n), 52, W - 52), lineY - 92, 90, { size: 13.5, weight: '700', color: COL.orange, align: 'center' });
  /* 数轴与刻度 */
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x0 - 10, lineY); ctx.lineTo(x1 + 8, lineY); ctx.stroke();
  for (let v = 0; v <= 30; v++) {
    const big = v % 5 === 0;
    ctx.strokeStyle = big ? COL.edge : COL.grid; ctx.lineWidth = big ? 1.6 : 1;
    ctx.beginPath(); ctx.moveTo(px(v), lineY - (big ? 7 : 4)); ctx.lineTo(px(v), lineY + (big ? 7 : 4)); ctx.stroke();
    if (big) {
      ctx.fillStyle = COL.mut; ctx.font = '12.5px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(v), px(v), lineY + 24);
    }
  }
  /* 已完成的跳格弧 */
  const arc = (k, prog) => {
    const a = px(k * d), b = px((k + 1) * d);
    ctx.beginPath();
    const steps = Math.max(2, Math.round(24 * prog));
    for (let i = 0; i <= steps; i++) {
      const tt = prog * i / steps;
      const X = a + (b - a) * tt;
      const Y = lineY - 54 * Math.sin(Math.PI * tt);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
  };
  for (let k = 0; k < S2.jumps; k++) {
    ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.2; ctx.setLineDash([]);
    arc(k, 1);
    ctx.beginPath(); ctx.arc(px((k + 1) * d), lineY, 4, 0, Math.PI * 2);
    ctx.fillStyle = COL.cyan; ctx.fill();
    fitText(ctx, String((k + 1) * d), (px(k * d) + px((k + 1) * d)) / 2, lineY - 66, 40,
      { size: 13, weight: '700', color: COL.cyan, align: 'center' });
  }
  /* 进行中的一跳 / 下一跳预览 */
  const animating = S2.animStart > 0;
  if (animating) {
    const prog = clamp((NOW - S2.animStart) / 450, 0, 1);
    ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2.2; ctx.setLineDash([]);
    arc(S2.jumps, Math.max(prog, 0.02));
  } else if (S2.jumps < q) {
    ctx.strokeStyle = 'rgba(110,231,255,.35)'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]);
    arc(S2.jumps, 1);
    ctx.setLineDash([]);
  }
  /* 余数段 */
  if (r > 0) {
    ctx.strokeStyle = COL.red; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(px(q * d), lineY); ctx.lineTo(px(n), lineY); ctx.stroke();
    fitText(ctx, t('cRemain2', { r }), clamp((px(q * d) + px(n)) / 2, 64, W - 64), lineY + 46, Math.max(70, px(n) - px(q * d) + 46),
      { size: 13.5, weight: '700', color: COL.red, align: 'center' });
  }
  /* 位置标记 */
  let frogX = px(S2.jumps * d);
  if (animating) {
    const prog = clamp((NOW - S2.animStart) / 450, 0, 1);
    frogX = px(S2.jumps * d + d * prog);
  }
  const frogY = lineY - (animating ? 54 * Math.sin(Math.PI * clamp((NOW - S2.animStart) / 450, 0, 1)) : 0);
  ctx.beginPath(); ctx.arc(frogX, frogY - 9, 8.5, 0, Math.PI * 2);
  ctx.fillStyle = COL.orange; ctx.fill();
  ctx.strokeStyle = '#b57a1e'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); ctx.arc(frogX - 2.6, frogY - 11.5, 1.7, 0, Math.PI * 2);
  ctx.fillStyle = '#fff3d6'; ctx.fill();
  /* 读数（纯渲染） */
  const done = S2.jumps >= q;
  if (done) {
    setRO('s2-readout', r > 0
      ? t('s2roDone', { n, d, q, r, qd: q * d, need: d - r })
      : t('s2roExact', { n, d, q }));
  } else if (S2.jumps > 0) {
    setRO('s2-readout', t('s2roMid', { k: S2.jumps, pos: S2.jumps * d, n }));
  } else {
    setRO('s2-readout', t('s2roIdle', { d, n }));
  }
  setRO('s2-hint', t('s2hint', { q, d, qd: q * d }));
  const jb = $('s2-jump'); if (jb) jb.disabled = done || animating;
  const pb = $('s2-play'); if (pb) pb.disabled = done;
}
function s2Reset() {
  S2.jumps = 0; S2.playing = false; S2.animStart = 0;
  s2SyncPlayBtn(); s2Draw();
}
function s2JumpOnce() {
  if (S2.jumps >= s2Q() || S2.animStart > 0) return;
  S2.animStart = NOW;
  s2Draw();
}
function initS2() {
  regCanvas('s2-canvas');
  $('s2-total').addEventListener('input', e => setParams(+e.target.value, PARAMS.people));
  $('s2-div').addEventListener('input', e => setParams(PARAMS.total, +e.target.value));
  $('s2-jump').addEventListener('click', () => { S2.playing = false; s2SyncPlayBtn(); s2JumpOnce(); });
  $('s2-play').addEventListener('click', () => {
    if (S2.jumps >= s2Q()) return;
    S2.playing = !S2.playing;
    if (S2.playing && S2.animStart === 0) S2.animStart = NOW;
    s2SyncPlayBtn(); s2Draw();
  });
  $('s2-reset').addEventListener('click', s2Reset);
  animate($('step2'), () => {
    if (S2.animStart > 0) {
      if (NOW - S2.animStart >= 450) {
        S2.jumps++;
        S2.animStart = 0;
        if (S2.playing && S2.jumps < s2Q()) S2.animStart = NOW;
        else { S2.playing = false; s2SyncPlayBtn(); }
      }
      s2Draw();
    }
  });
  onLangRefresh(() => { s2SyncPlayBtn(); s2Draw(); });
  onRefit(s2Draw);
  s2SyncPlayBtn(); s2Draw();
}

/* ============================================================
   第 3 步：星期推算
   ============================================================ */
const S3 = { days: 100 };
const TODAY_IDX = 2; /* 星期二（周日=0） */
function s3Draw() {
  const cv = $('s3-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const days = S3.days;
  const { q: weeks, r: rem } = divmod(days, 7);
  const ansIdx = weekdayIdx(days);
  const shorts = t('wShort').split(',');
  const fulls = t('wFull').split(',');
  const gx = 26, gw = W - 52, colW = gw / 7;
  const rowH = Math.min(colW, 42);
  /* 表头：星期 */
  for (let c = 0; c < 7; c++) {
    fitText(ctx, shorts[c], gx + colW * (c + 0.5), 30, colW - 6,
      { size: 15, weight: c === TODAY_IDX ? '700' : '', color: c === TODAY_IDX ? COL.cyan : COL.mut, align: 'center' });
  }
  const totalRows = Math.floor((TODAY_IDX + days) / 7) + 1;
  const compressed = totalRows > 4;
  const slotOf = row => !compressed ? row : row === 0 ? 0 : row === totalRows - 1 ? 2 : -1;
  const slotY = s => 48 + s * (rowH + 10);
  const cell = (k, hl) => {
    const col = (TODAY_IDX + k) % 7;
    const row = Math.floor((TODAY_IDX + k) / 7);
    const s = slotOf(row);
    if (s < 0) return;
    const x = gx + col * colW + 3, y = slotY(s), w = colW - 6, h = rowH;
    rrect(ctx, x, y, w, h, 7);
    if (hl === 'land') { ctx.fillStyle = COL.orange; ctx.fill(); }
    else if (hl === 'tail') { ctx.fillStyle = 'rgba(255,180,84,.22)'; ctx.fill(); }
    else { ctx.fillStyle = COL.panel; ctx.fill(); }
    ctx.strokeStyle = hl === 'today' ? COL.cyan : COL.grid;
    ctx.lineWidth = hl === 'today' ? 2.2 : 1.2;
    ctx.stroke();
    if (hl === 'today') {
      fitText(ctx, t('cToday'), x + w / 2, y - 5, w + 16, { size: 11.5, weight: '700', color: COL.cyan, align: 'center' });
    }
    if (hl === 'land') {
      fitText(ctx, shorts[ansIdx], x + w / 2, y + h / 2 + 6, w - 4,
        { size: 16, weight: '700', color: '#08131a', align: 'center' });
    }
  };
  for (let k = 0; k <= days; k++) {
    let hl = '';
    if (k === 0) hl = 'today';
    else if (k === days) hl = 'land';
    else if (k > days - rem && rem > 0) hl = 'tail';
    cell(k, hl);
  }
  if (compressed) {
    const y = slotY(1);
    rrect(ctx, gx + 3, y, gw - 6, rowH, 7);
    ctx.fillStyle = 'rgba(28,35,48,.6)'; ctx.fill();
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    fitText(ctx, t('cMidWeeks', { m: totalRows - 2 }), gx + gw / 2, y + rowH / 2 + 5, gw - 24,
      { size: 13, color: COL.mut, align: 'center' });
  }
  /* 读数（纯渲染） */
  if (rem > 0) {
    setRO('s3-readout', t('s3ro', { n: days, w: weeks, r: rem, ans: fulls[ansIdx] }));
  } else {
    setRO('s3-readout', t('s3ro0', { n: days, w: weeks }));
  }
}
function s3SetDays(days) {
  S3.days = clamp(days, 1, 365);
  $('s3-days').value = String(S3.days);
  $('s3-days-val').textContent = String(S3.days);
  document.querySelectorAll('[data-days]').forEach(b => {
    b.classList.toggle('active', +b.dataset.days === S3.days);
  });
  s3Draw();
}
function initS3() {
  regCanvas('s3-canvas');
  $('s3-days').addEventListener('input', e => s3SetDays(+e.target.value));
  document.querySelectorAll('[data-days]').forEach(b => {
    b.addEventListener('click', () => s3SetDays(+b.dataset.days));
  });
  onLangRefresh(s3Draw);
  onRefit(s3Draw);
  s3SetDays(100);
}

/* ============================================================
   第 4 步：自测 + 验算账本
   ============================================================ */
const S4 = {
  q1: { picked: null, solved: false, correct: 'a' },
  q2: { picked: null, solved: false, correct: 'b' }
};
function s4Box(ctx, x, y, w, h, val, known, solved) {
  rrect(ctx, x, y, w, h, 10);
  ctx.fillStyle = COL.panel; ctx.fill();
  ctx.strokeStyle = solved ? COL.green : known ? COL.grid : COL.orange;
  ctx.lineWidth = solved || !known ? 2 : 1.3;
  ctx.stroke();
  fitText(ctx, String(val), x + w / 2, y + h / 2 + 8, w - 6,
    { size: 21, weight: '700', color: known || solved ? COL.ink : COL.orange, align: 'center' });
}
function s4Draw() {
  const cv = $('s4-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const labels = [t('cDividend'), t('cDivisor'), t('cQuotient'), t('cRemainder')];
  const signs = ['=', '×', '+'];
  const row = (y, title, vals) => {
    fitText(ctx, title, 16, y - 12, W - 32, { size: 13.5, color: COL.mut });
    const signW = 24;
    const bw = Math.min(66, (W - 32 - signW * 3) / 4);
    const totalW = bw * 4 + signW * 3;
    let x = Math.max(16, (W - totalW) / 2);
    vals.forEach((v, i) => {
      s4Box(ctx, x, y, bw, 46, v.text, v.known, v.solved);
      fitText(ctx, labels[i], x + bw / 2, y + 46 + 17, bw + 8, { size: 11.5, color: COL.mut, align: 'center' });
      x += bw;
      if (i < 3) {
        fitText(ctx, signs[i], x + signW / 2, y + 31, signW, { size: 19, weight: '700', color: COL.ink, align: 'center' });
        x += signW;
      }
    });
  };
  row(52, t('cLedger1'), [
    { text: '23', known: true }, { text: '5', known: true },
    { text: S4.q1.solved ? '4' : '?', known: S4.q1.solved, solved: S4.q1.solved },
    { text: S4.q1.solved ? '3' : '?', known: S4.q1.solved, solved: S4.q1.solved }
  ]);
  row(158, t('cLedger2'), [
    { text: S4.q2.solved ? '46' : '☆', known: S4.q2.solved, solved: S4.q2.solved },
    { text: '6', known: true }, { text: '7', known: true }, { text: '4', known: true }
  ]);
}
function s4Feedback() {
  const fb1 = S4.q1.picked === null ? ''
    : S4.q1.solved ? t('s4q1ok')
    : S4.q1.picked === 'b' ? t('s4q1fbB') : t('s4q1fbC');
  setRO('s4-q1-fb', fb1);
  const fb2 = S4.q2.picked === null ? ''
    : S4.q2.solved ? t('s4q2ok')
    : S4.q2.picked === 'a' ? t('s4q2fbA') : t('s4q2fbC');
  setRO('s4-q2-fb', fb2);
  setRO('s4-done', S4.q1.solved && S4.q2.solved ? t('s4allDone') : '');
}
function s4Pick(qKey, opt) {
  const q = S4[qKey];
  if (q.solved) return;
  q.picked = opt;
  if (opt === q.correct) q.solved = true;
  ['a', 'b', 'c'].forEach(o => {
    const b = $('s4-' + qKey + '-' + o);
    if (!b) return;
    b.classList.toggle('correct', q.solved && o === q.correct);
    b.classList.toggle('wrong', !q.solved && q.picked === o);
    b.classList.toggle('active', !q.solved && q.picked === o);
  });
  s4Feedback();
  s4Draw();
}
function initS4() {
  regCanvas('s4-canvas');
  ['q1', 'q2'].forEach(qKey => {
    ['a', 'b', 'c'].forEach(o => {
      const b = $('s4-' + qKey + '-' + o);
      if (b) b.addEventListener('click', () => s4Pick(qKey, o));
    });
  });
  onLangRefresh(() => { s4Feedback(); s4Draw(); });
  onRefit(s4Draw);
  s4Feedback(); s4Draw();
}

/* ---------- 对账入口（供评审/自测程序化设置状态） ---------- */
const DIVREM = {
  divmod, weekday: weekdayIdx,
  params: PARAMS,
  state: { s0: S0, s1: S1, s2: S2, s3: S3, s4: S4 },
  set: {
    params: (n, p) => setParams(n, p),
    s1: (n, d, per) => { S1.total = n; S1.div = d; S1.per = per; s1SyncControls(false); s1Draw(); },
    days: d => s3SetDays(d),
    dealAll: () => { S0.dealt = s0MaxDealt(); s0Draw(); },
    jumpsAll: () => { S2.jumps = s2Q(); s2Draw(); }
  }
};
window.DIVREM = DIVREM;

/* ---------- 启动（i18n 的 applyLang 已先行运行） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initS0(); initS1(); initS2(); initS3(); initS4();
});
