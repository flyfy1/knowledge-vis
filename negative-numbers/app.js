'use strict';
/* 负数 · 0 以下的世界 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 口径落点（对 BRIEF「数据与判定口径」）：
   1. 唯一事实源：各步状态（延伸格数 k、温度甲/乙、电梯当前层、走路起点/方向/步数）；
      所有读数、投影点、算式回显都由状态纯渲染，禁止第二套缓存口径。
   2. 比较判定 cmp(a,b) 纯数值实算（甲<乙 ⟺ 甲落点在乙左边），不按字符串/绝对值。
   3. 温度一律 roundTemp 取整到 1℃ 再渲染，杜绝 4.999 式浮点尾巴。
   4. 走路落点 = 起点 + 带符号步数（walk），整数运算；电梯层数同理累计。
   5. 第 3 步红线：只有「撤回向左走」的生活演示，页面不出现减负数的法则断言、不出这类题。
   6. 走路画布横轴固定覆盖 −13…+13（起点 ±5、步数 ≤8 的全部可达落点），不裁切、不动态扩围。
   7. 自测解析（s4q*ok，含答案）只在答对锁定后才写入 DOM；答错只有指向对应步的提示。
   对账入口：window.NEGNUM（cmp / walk / roundTemp / state / set）。 */
const $ = id => document.getElementById(id);
let NOW = 0;
const MINUS = '\u2212';

/* ---------- 纯函数（判定与实算的唯一出处） ---------- */
function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function walk(start, signedSteps) { return start + signedSteps; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function roundTemp(v) { return Math.round(clamp(v, -10, 10)); }
/* 显示格式：负号统一 U+2212 */
function fmt(v) { return v === 0 ? '0' : v < 0 ? MINUS + String(-v) : String(v); }
function fmtS(v) { return v > 0 ? '+' + v : fmt(v); }
function fmtT(v) { return fmt(v) + '℃'; }

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
function setRO(id, str) { const el = $(id); if (el && el._v !== str) { el._v = str; el.innerHTML = str; } }
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
  orange: '#ffb454', cyan: '#6ee7ff', green: '#7ee2a8', red: '#ff7a93',
  ink: '#e8edf4', mut: '#9aa7b8', grid: '#39465e', edge: '#8494ab', panel: '#1c2330'
};
/* 小人：站在 axisY 的地面线上 */
function drawWalker(ctx, x, axisY, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, axisY - 36, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, axisY - 29); ctx.lineTo(x, axisY - 15);
  ctx.moveTo(x, axisY - 25); ctx.lineTo(x - 6, axisY - 18);
  ctx.moveTo(x, axisY - 25); ctx.lineTo(x + 6, axisY - 18);
  ctx.moveTo(x, axisY - 15); ctx.lineTo(x - 5.5, axisY - 1);
  ctx.moveTo(x, axisY - 15); ctx.lineTo(x + 5.5, axisY - 1);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

/* ============================================================
   第 0 步：数轴向左长
   ============================================================ */
const S0 = { k: 0, sel: null, playing: false, acc: 0 };
function s0SyncPlayBtn() {
  const b = $('s0-play'); if (b) b.textContent = t(S0.playing ? 's0pause' : 's0play');
}
function s0Draw() {
  const cv = $('s0-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const xL = 48, xR = W - 30, axisY = 178;
  const px = v => xL + (v + 10) / 20 * (xR - xL);
  /* 未长出的左段： faint 虚线（提示还有空间） */
  ctx.strokeStyle = 'rgba(132,148,171,.35)'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 6]);
  ctx.beginPath(); ctx.moveTo(px(-10), axisY); ctx.lineTo(px(-S0.k), axisY); ctx.stroke();
  ctx.setLineDash([]);
  /* 已长出的轴线 + 右箭头 */
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(px(-S0.k), axisY); ctx.lineTo(xR, axisY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xR, axisY); ctx.lineTo(xR - 9, axisY - 4.5); ctx.lineTo(xR - 9, axisY + 4.5); ctx.closePath();
  ctx.fillStyle = COL.edge; ctx.fill();
  /* 对称弧：每对 ±i 一条（椭圆弧，高度封顶不冲出画布），最新一对最亮；选中对橙色 */
  for (let i = 1; i <= S0.k; i++) {
    const selPair = S0.sel !== null && Math.abs(S0.sel) === i;
    const rx = px(i) - px(0);
    ctx.beginPath();
    ctx.ellipse(px(0), axisY, rx, Math.min(rx * 0.45, 104), 0, Math.PI, 0);
    ctx.strokeStyle = selPair ? COL.orange : i === S0.k ? 'rgba(110,231,255,.75)' : 'rgba(110,231,255,.25)';
    ctx.lineWidth = selPair ? 2.4 : 1.5;
    ctx.stroke();
  }
  /* 刻度与数字 */
  for (let v = -S0.k; v <= 10; v++) {
    const isNewPair = Math.abs(v) === S0.k && S0.k > 0;
    ctx.strokeStyle = v === 0 ? COL.ink : COL.edge; ctx.lineWidth = v === 0 ? 2 : 1.3;
    ctx.beginPath(); ctx.moveTo(px(v), axisY - (v === 0 ? 9 : 6)); ctx.lineTo(px(v), axisY + (v === 0 ? 9 : 6)); ctx.stroke();
    fitText(ctx, fmt(v), px(v), axisY + 26, 30,
      { size: v === 0 ? 14 : 12.5, weight: v === 0 ? '700' : '', color: v < 0 ? COL.cyan : v === 0 ? COL.ink : COL.mut, align: 'center' });
    if (isNewPair) {
      ctx.beginPath(); ctx.arc(px(v), axisY, 5, 0, Math.PI * 2);
      ctx.fillStyle = COL.orange; ctx.fill();
    }
    if (S0.sel === v) {
      ctx.beginPath(); ctx.arc(px(v), axisY, 10.5, 0, Math.PI * 2);
      ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.2; ctx.stroke();
    }
  }
  fitText(ctx, t('cOrigin'), px(0), axisY - 124, 60, { size: 12.5, color: COL.mut, align: 'center' });
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(px(0), axisY - 118); ctx.lineTo(px(0), axisY - 14); ctx.stroke();
  /* 读数（纯渲染自 k 与 sel） */
  let ro;
  if (S0.sel === null) ro = S0.k === 0 ? t('s0roIdle') : t('s0roGrown', { fk: fmt(-S0.k) });
  else if (S0.sel === 0) ro = t('s0roSelZero');
  else if (S0.sel < 0) {
    const d = -S0.sel;
    ro = t('s0roSelNeg', { fv: fmt(S0.sel), fp: fmt(d), d, opp: t('s0oppNote', { fa: fmt(S0.sel), fb: fmt(d) }) });
  } else if (S0.sel <= S0.k) {
    const d = S0.sel;
    ro = t('s0roSelPosPair', { fv: fmt(d), fm: fmt(-d), d, opp: t('s0oppNote', { fa: fmt(-d), fb: fmt(d) }) });
  } else {
    ro = t('s0roSelPosWait', { fv: fmt(S0.sel), fm: fmt(-S0.sel), d: S0.sel, need: S0.sel - S0.k });
  }
  setRO('s0-readout', ro);
  setRO('s0-prog', t('s0prog', { k: S0.k }));
  const pb = $('s0-play'); if (pb) pb.disabled = !S0.playing && S0.k >= 10;
}
function s0SetK(k) {
  S0.k = clamp(Math.round(k), 0, 10);
  if (S0.k >= 10) { S0.playing = false; s0SyncPlayBtn(); }
  if (S0.sel !== null && S0.sel < -S0.k) S0.sel = null;
  $('s0-ext').value = String(S0.k);
  $('s0-ext-val').textContent = String(S0.k);
  s0Draw();
}
function initS0() {
  const cv = regCanvas('s0-canvas');
  $('s0-ext').addEventListener('input', e => { S0.playing = false; s0SyncPlayBtn(); s0SetK(+e.target.value); });
  $('s0-play').addEventListener('click', () => {
    if (S0.k >= 10 && !S0.playing) return;
    S0.playing = !S0.playing; S0.acc = 0;
    s0SyncPlayBtn(); s0Draw();
  });
  $('s0-reset').addEventListener('click', () => {
    S0.playing = false; S0.sel = null; s0SyncPlayBtn(); s0SetK(0);
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const xL = 48, xR = cv._w - 30;
    const v = Math.round((e.clientX - r.left - xL) / (xR - xL) * 20 - 10);
    if (v >= -S0.k && v <= 10) { S0.sel = v; s0Draw(); }
  });
  animate($('step0'), dt => {
    if (S0.playing) {
      S0.acc += dt;
      if (S0.acc >= 0.45 && S0.k < 10) { S0.acc = 0; s0SetK(S0.k + 1); }
      if (S0.k >= 10) { S0.playing = false; s0SyncPlayBtn(); s0Draw(); }
    }
  });
  onLangRefresh(() => { s0SyncPlayBtn(); s0Draw(); });
  onRefit(s0Draw);
  s0SyncPlayBtn(); s0SetK(0);
}

/* ============================================================
   第 1 步：温度计比大小
   ============================================================ */
const S1 = { a: 5, b: -1, tune: 'a', compared: false, geom: null };
function s1SyncControls() {
  $('s1-a').value = String(S1.a);
  $('s1-b').value = String(S1.b);
  $('s1-a-val').textContent = fmt(S1.a);
  $('s1-b-val').textContent = fmt(S1.b);
  $('s1-tune-a').classList.toggle('active', S1.tune === 'a');
  $('s1-tune-b').classList.toggle('active', S1.tune === 'b');
}
function s1Draw() {
  const cv = $('s1-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const yTop = 46, yBot = H - 122;
  S1.geom = { yTop, yBot };
  const yPix = v => yBot - (v + 10) / 20 * (yBot - yTop);
  const tubes = [
    { key: 'a', val: S1.a, cx: W * 0.30, color: COL.orange, name: t('cA') },
    { key: 'b', val: S1.b, cx: W * 0.70, color: COL.cyan, name: t('cB') }
  ];
  tubes.forEach(tb => {
    /* 名牌 + 当前读数 */
    fitText(ctx, tb.name, tb.cx, 24, 90, { size: 15, weight: '700', color: tb.color, align: 'center' });
    fitText(ctx, fmtT(tb.val), tb.cx, 44, 90, { size: 14, weight: '700', color: COL.ink, align: 'center' });
    /* 管身 */
    rrect(ctx, tb.cx - 17, yTop, 34, yBot - yTop, 15);
    ctx.fillStyle = COL.panel; ctx.fill();
    ctx.strokeStyle = S1.tune === tb.key ? tb.color : COL.grid; ctx.lineWidth = S1.tune === tb.key ? 2.2 : 1.4; ctx.stroke();
    /* 液柱：自底部升到当前温度（实算映射） */
    const colTop = yPix(tb.val);
    ctx.save();
    rrect(ctx, tb.cx - 17, yTop, 34, yBot - yTop, 15); ctx.clip();
    ctx.fillStyle = tb.val < 0 ? COL.cyan : COL.orange;
    ctx.fillRect(tb.cx - 12, colTop, 24, yBot - colTop + 4);
    ctx.restore();
    /* 球泡 */
    ctx.beginPath(); ctx.arc(tb.cx, yBot + 17, 15, 0, Math.PI * 2);
    ctx.fillStyle = tb.val < 0 ? COL.cyan : COL.orange; ctx.fill();
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.2; ctx.stroke();
    /* 刻度：每 1℃ 一格、每 2℃ 一个数字（读数取整，不存在半格读数） */
    for (let v = -10; v <= 10; v++) {
      const big = v % 2 === 0;
      ctx.strokeStyle = v === 0 ? COL.ink : COL.grid; ctx.lineWidth = v === 0 ? 1.8 : 1;
      ctx.beginPath(); ctx.moveTo(tb.cx + 19, yPix(v)); ctx.lineTo(tb.cx + (big ? 27 : 23), yPix(v)); ctx.stroke();
      if (big) fitText(ctx, fmt(v), tb.cx + 31, yPix(v) + 4, 30, { size: 11.5, color: v === 0 ? COL.ink : COL.mut });
    }
  });
  /* 0℃ 界线（画在管身之上，横贯两支温度计） */
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6; ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(18, yPix(0)); ctx.lineTo(W - 18, yPix(0)); ctx.stroke();
  ctx.setLineDash([]);
  fitText(ctx, t('cZero'), 20, yPix(0) - 8, 120, { size: 12.5, weight: '700', color: COL.ink });
  /* 投影回横数轴 */
  const axY = H - 44, axL = 40, axR = W - 40;
  const projX = v => axL + (v + 10) / 20 * (axR - axL);
  fitText(ctx, t('cProj'), axL, axY - 34, axR - axL, { size: 12.5, color: COL.mut });
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(axL - 6, axY); ctx.lineTo(axR + 6, axY); ctx.stroke();
  for (let v = -10; v <= 10; v += 2) {
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(projX(v), axY - 4); ctx.lineTo(projX(v), axY + 4); ctx.stroke();
    fitText(ctx, fmt(v), projX(v), axY + 20, 26, { size: 11, color: COL.mut, align: 'center' });
  }
  tubes.forEach(tb => {
    ctx.strokeStyle = 'rgba(132,148,171,.5)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(tb.cx, yBot + 34); ctx.lineTo(projX(tb.val), axY - 8); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(projX(tb.val), axY, 7, 0, Math.PI * 2);
    ctx.fillStyle = tb.color; ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2; ctx.stroke();
    fitText(ctx, tb.name, projX(tb.val), axY - 14, 24, { size: 13, weight: '700', color: tb.color, align: 'center' });
  });
  /* 比一比后：给更小（更左）那个加圈注 */
  if (S1.compared && S1.a !== S1.b) {
    const smaller = cmp(S1.a, S1.b) < 0 ? S1.a : S1.b;
    ctx.beginPath(); ctx.arc(projX(smaller), axY, 13, 0, Math.PI * 2);
    ctx.strokeStyle = COL.green; ctx.lineWidth = 2.2; ctx.stroke();
    fitText(ctx, t('cSmaller'), clamp(projX(smaller), 52, W - 52), axY + 36, 110,
      { size: 12.5, weight: '700', color: COL.green, align: 'center' });
  }
  /* 读数（纯渲染：比较判定走 cmp 数值实算） */
  let ro = t('s1ro', { fa: fmtT(S1.a), fb: fmtT(S1.b) });
  if (!S1.compared) ro += ' ' + t('s1roAsk');
  else {
    const c = cmp(S1.a, S1.b);
    const d = Math.abs(S1.a - S1.b);
    if (c < 0) ro += ' ' + t('s1vAltB', { fa: fmtT(S1.a), fb: fmtT(S1.b), d });
    else if (c > 0) ro += ' ' + t('s1vAgtB', { fa: fmtT(S1.a), fb: fmtT(S1.b), d });
    else ro += ' ' + t('s1vEq');
  }
  setRO('s1-readout', ro);
}
function s1Set(key, v) {
  S1[key] = roundTemp(v);
  s1SyncControls();
  s1Draw();
}
function initS1() {
  const cv = regCanvas('s1-canvas');
  $('s1-a').addEventListener('input', e => s1Set('a', +e.target.value));
  $('s1-b').addEventListener('input', e => s1Set('b', +e.target.value));
  $('s1-tune-a').addEventListener('click', () => { S1.tune = 'a'; s1SyncControls(); s1Draw(); });
  $('s1-tune-b').addEventListener('click', () => { S1.tune = 'b'; s1SyncControls(); s1Draw(); });
  document.querySelectorAll('[data-temp]').forEach(b => {
    b.addEventListener('click', () => s1Set(S1.tune, +b.dataset.temp));
  });
  $('s1-cmp').addEventListener('click', () => { S1.compared = true; s1Draw(); });
  /* 拖液柱：按下位置决定改哪支，纵坐标经同一映射取整 */
  let dragging = false;
  let docDrag = false; /* 指针捕获失败时走 document 级监听降级路径 */
  const dragTo = e => {
    if (!S1.geom) return;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const key = x < cv._w / 2 ? 'a' : 'b';
    S1.tune = key;
    const v = (S1.geom.yBot - y) / (S1.geom.yBot - S1.geom.yTop) * 20 - 10;
    s1Set(key, v);
  };
  cv.addEventListener('pointerdown', e => {
    dragging = true;
    docDrag = false;
    /* 非激活指针（合成事件、个别 WebView 注入的指针）下 setPointerCapture 会抛
       NotFoundError 并中断处理器使拖拽静默失效；捕获失败则降级，不中断拖拽 */
    try { cv.setPointerCapture(e.pointerId); } catch (err) { docDrag = true; }
    dragTo(e);
  });
  cv.addEventListener('pointermove', e => { if (dragging) dragTo(e); });
  cv.addEventListener('pointerup', () => { dragging = false; });
  cv.addEventListener('pointercancel', () => { dragging = false; });
  /* 降级路径：未捕获时指针移出画布仍跟手、抬手在画布外也能收尾 */
  document.addEventListener('pointermove', e => { if (dragging && docDrag) dragTo(e); });
  document.addEventListener('pointerup', () => { if (docDrag) { dragging = false; docDrag = false; } });
  document.addEventListener('pointercancel', () => { if (docDrag) { dragging = false; docDrag = false; } });
  onLangRefresh(() => { s1SyncControls(); s1Draw(); });
  onRefit(s1Draw);
  s1SyncControls(); s1Draw();
}

/* ============================================================
   第 2 步：电梯与楼层
   ============================================================ */
const FLOORS = [3, 2, 1, 0, -1, -2];
const S2 = { floor: 0, n: 2, visited: new Set([0]), anim: null, msg: null, geom: null };
function s2Desc(f) {
  if (f === 0) return t('s2descGround');
  if (f > 0) return t('s2descUp', { d: f });
  return t('s2descDown', { d: -f, b: 'B' + (-f) });
}
function s2Draw() {
  const cv = $('s2-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const bx = 46, bw = W - 46 - 118, y0 = 22, rowH = (H - 44) / 6;
  S2.geom = { bx, bw, y0, rowH };
  const centerY = v => y0 + (3 - v + 0.5) * rowH;
  /* 当前显示位置（动画中为插值） */
  let posF = S2.floor;
  if (S2.anim) {
    const tt = clamp((NOW - S2.anim.t0) / S2.anim.dur, 0, 1);
    posF = S2.anim.from + (S2.anim.to - S2.anim.from) * tt;
  }
  const litNow = new Set(S2.visited);
  if (S2.anim) {
    const lo = Math.min(S2.anim.from, Math.round(posF)), hi = Math.max(S2.anim.from, Math.round(posF));
    for (let f = lo; f <= hi; f++) litNow.add(f);
  }
  FLOORS.forEach(f => {
    const y = y0 + (3 - f) * rowH;
    rrect(ctx, bx, y + 2, bw, rowH - 4, 6);
    ctx.fillStyle = litNow.has(f) ? 'rgba(110,231,255,.10)' : COL.panel;
    ctx.fill();
    ctx.strokeStyle = f === 0 ? COL.green : COL.grid; ctx.lineWidth = f === 0 ? 2 : 1.2; ctx.stroke();
    if (f === 0) fitText(ctx, t('cGround'), bx + bw - 10, y + rowH / 2 + 5, 90, { size: 13, weight: '700', color: COL.green, align: 'right' });
    fitText(ctx, fmtS(f) + (f < 0 ? ' (B' + (-f) + ')' : ''), bx + bw + 12, y + rowH / 2 + 6, 100,
      { size: 15, weight: '700', color: f === 0 ? COL.green : COL.ink });
  });
  /* 电梯轿厢（井道在楼体左侧） */
  const cabW = 74, cabX = bx + 16, cabH = rowH - 14;
  const cabY = centerY(posF) - cabH / 2;
  rrect(ctx, cabX, cabY, cabW, cabH, 7);
  ctx.fillStyle = COL.orange; ctx.fill();
  ctx.strokeStyle = '#b57a1e'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = 'rgba(8,19,26,.55)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(cabX + cabW / 2, cabY + 5); ctx.lineTo(cabX + cabW / 2, cabY + cabH - 5); ctx.stroke();
  fitText(ctx, fmtS(Math.round(posF)), cabX + cabW / 2, cabY - 7, cabW + 16,
    { size: 13.5, weight: '700', color: COL.orange, align: 'center' });
  /* 读数 */
  if (S2.anim) setRO('s2-readout', t('s2roMoving', { ff: fmtS(S2.anim.from), ft: fmtS(S2.anim.to) }));
  else if (S2.msg) setRO('s2-readout', t(S2.msg));
  else setRO('s2-readout', t('s2ro', { f: fmtS(S2.floor), desc: s2Desc(S2.floor) }));
  const up = $('s2-up'), dn = $('s2-down');
  if (up) up.disabled = !!S2.anim;
  if (dn) dn.disabled = !!S2.anim;
}
function s2RideTo(target) {
  target = clamp(target, -2, 3);
  if (S2.anim || target === S2.floor) return;
  S2.msg = null;
  S2.anim = { from: S2.floor, to: target, t0: NOW, dur: Math.max(300, Math.abs(target - S2.floor) * 480) };
  s2Draw();
}
function s2Move(sign) {
  if (S2.anim) return;
  const target = clamp(S2.floor + sign * S2.n, -2, 3);
  if (target === S2.floor) {
    S2.msg = sign > 0 ? 's2roTop' : 's2roBottom';
    s2Draw();
    return;
  }
  s2RideTo(target);
}
function initS2() {
  const cv = regCanvas('s2-canvas');
  $('s2-n').addEventListener('input', e => {
    S2.n = clamp(+e.target.value, 1, 5);
    $('s2-n-val').textContent = String(S2.n);
  });
  $('s2-up').addEventListener('click', () => s2Move(1));
  $('s2-down').addEventListener('click', () => s2Move(-1));
  $('s2-reset').addEventListener('click', () => {
    S2.floor = 0; S2.visited = new Set([0]); S2.anim = null; S2.msg = null; s2Draw();
  });
  cv.addEventListener('click', e => {
    if (!S2.geom || S2.anim) return;
    const r = cv.getBoundingClientRect();
    const y = e.clientY - r.top;
    const idx = Math.floor((y - S2.geom.y0) / S2.geom.rowH);
    if (idx >= 0 && idx < FLOORS.length) s2RideTo(FLOORS[idx]);
  });
  animate($('step2'), () => {
    if (S2.anim) {
      if (NOW - S2.anim.t0 >= S2.anim.dur) {
        const from = S2.anim.from, to = S2.anim.to;
        const lo = Math.min(from, to), hi = Math.max(from, to);
        for (let f = lo; f <= hi; f++) S2.visited.add(f);
        S2.floor = to; S2.anim = null;
      }
      s2Draw();
    }
  });
  onLangRefresh(s2Draw);
  onRefit(s2Draw);
  s2Draw();
}

/* ============================================================
   第 3 步：沿数轴走（画布固定覆盖 −13…+13，含全部可达落点）
   ============================================================ */
const S3 = { start: 3, dir: -1, steps: 5, walking: false, t0: 0, done: false };
function s3Land() { return walk(S3.start, S3.dir * S3.steps); }
function s3Eq() { return fmt(S3.start) + (S3.dir > 0 ? ' + ' : ' ' + MINUS + ' ') + S3.steps; }
function s3Pos() {
  if (!S3.walking) return S3.done ? s3Land() : S3.start;
  const tt = clamp((NOW - S3.t0) / (S3.steps * 480), 0, 1);
  return S3.start + (s3Land() - S3.start) * tt;
}
function s3Draw() {
  const cv = $('s3-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const xL = 36, xR = W - 36, axisY = 186;
  const px = v => xL + (v + 13) / 26 * (xR - xL);
  /* 轴与刻度：每 1 格一刻度，偶数与 0 标数字 */
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(xL - 8, axisY); ctx.lineTo(xR + 8, axisY); ctx.stroke();
  for (let v = -13; v <= 13; v++) {
    const big = v % 2 === 0 || v === 0;
    ctx.strokeStyle = v === 0 ? COL.ink : COL.grid; ctx.lineWidth = v === 0 ? 1.8 : 1;
    ctx.beginPath(); ctx.moveTo(px(v), axisY - (big ? 7 : 4)); ctx.lineTo(px(v), axisY + (big ? 7 : 4)); ctx.stroke();
    if (big) fitText(ctx, fmt(v), px(v), axisY + 24, 28, { size: 11.5, weight: v === 0 ? '700' : '', color: v === 0 ? COL.ink : COL.mut, align: 'center' });
  }
  fitText(ctx, t('cOrigin'), px(0), axisY - 108, 70, { size: 12, color: COL.mut, align: 'center' });
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(px(0), axisY - 100); ctx.lineTo(px(0), axisY - 14); ctx.stroke();
  /* 轨迹带：从起点到当前位置（走过的整条路线） */
  const pos = s3Pos();
  if (S3.walking || S3.done) {
    ctx.strokeStyle = 'rgba(255,180,84,.4)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px(S3.start), axisY); ctx.lineTo(px(pos), axisY); ctx.stroke();
    ctx.lineCap = 'butt';
    const lo = Math.min(S3.start, Math.floor(pos)), hi = Math.max(S3.start, Math.ceil(pos));
    for (let v = lo; v <= hi; v++) {
      ctx.beginPath(); ctx.arc(px(v), axisY, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = COL.orange; ctx.fill();
    }
    /* 起点标记 */
    fitText(ctx, t('cStart'), px(S3.start), axisY + 44, 60, { size: 12, color: COL.mut, align: 'center' });
    ctx.beginPath(); ctx.arc(px(S3.start), axisY, 5.5, 0, Math.PI * 2);
    ctx.strokeStyle = COL.mut; ctx.lineWidth = 1.8; ctx.stroke();
  }
  /* 落点旗标（走完才立） */
  if (S3.done) {
    const lx = px(s3Land());
    ctx.strokeStyle = COL.green; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(lx, axisY); ctx.lineTo(lx, axisY - 62); ctx.stroke();
    ctx.fillStyle = COL.green;
    ctx.beginPath(); ctx.moveTo(lx, axisY - 62); ctx.lineTo(lx + 14, axisY - 55); ctx.lineTo(lx, axisY - 48); ctx.closePath(); ctx.fill();
    fitText(ctx, t('cLand') + ' ' + fmt(s3Land()), clamp(lx, 46, W - 46), axisY - 72, 100,
      { size: 13.5, weight: '700', color: COL.green, align: 'center' });
  }
  drawWalker(ctx, px(pos), axisY, COL.orange);
  /* 读数 */
  if (S3.done) {
    setRO('s3-readout', t(S3.dir > 0 ? 's3roDoneR' : 's3roDoneL',
      { eq: s3Eq(), fr: fmt(s3Land()), fs: fmt(S3.start), n: S3.steps }));
  } else if (S3.walking) {
    setRO('s3-readout', t('s3roQ', { eq: s3Eq() }));
  } else {
    setRO('s3-readout', t('s3roIdle'));
  }
}
function s3Invalidate() {
  S3.walking = false; S3.done = false;
  s3Draw();
}
function s3SyncControls() {
  $('s3-start').value = String(S3.start);
  $('s3-steps').value = String(S3.steps);
  $('s3-start-val').textContent = fmt(S3.start);
  $('s3-steps-val').textContent = String(S3.steps);
  $('s3-dir-l').classList.toggle('active', S3.dir < 0);
  $('s3-dir-r').classList.toggle('active', S3.dir > 0);
}
function initS3() {
  regCanvas('s3-canvas');
  $('s3-start').addEventListener('input', e => { S3.start = clamp(+e.target.value, -5, 5); s3SyncControls(); s3Invalidate(); });
  $('s3-steps').addEventListener('input', e => { S3.steps = clamp(+e.target.value, 1, 8); s3SyncControls(); s3Invalidate(); });
  $('s3-dir-l').addEventListener('click', () => { S3.dir = -1; s3SyncControls(); s3Invalidate(); });
  $('s3-dir-r').addEventListener('click', () => { S3.dir = 1; s3SyncControls(); s3Invalidate(); });
  $('s3-walk').addEventListener('click', () => {
    if (S3.walking) return;
    S3.done = false; S3.walking = true; S3.t0 = NOW;
    s3Draw();
  });
  $('s3-reset').addEventListener('click', s3Invalidate);
  document.querySelectorAll('[data-walk]').forEach(b => {
    b.addEventListener('click', () => {
      const [st, dir, n] = b.dataset.walk.split(',').map(Number);
      S3.start = st; S3.dir = dir; S3.steps = n;
      s3SyncControls();
      S3.done = false; S3.walking = true; S3.t0 = NOW;
      s3Draw();
    });
  });
  animate($('step3'), () => {
    if (S3.walking) {
      if (NOW - S3.t0 >= S3.steps * 480) { S3.walking = false; S3.done = true; }
      s3Draw();
    }
    if (U.anim) {
      if (NOW - U.anim.t0 >= U.anim.dur) {
        U.pos = U.anim.to; U.phase = U.anim.to === 2 ? 2 : 1; U.anim = null;
      }
      uDraw();
    }
  });
  onLangRefresh(() => { s3SyncControls(); s3Draw(); uSyncBtns(); uDraw(); });
  onRefit(() => { s3Draw(); uDraw(); });
  s3SyncControls(); s3Draw();
}

/* ---------- 第 3 步小演示：撤回向左走（独立小状态机） ---------- */
const U = { phase: 0, pos: 2, anim: null };
function uPos() {
  if (!U.anim) return U.pos;
  const tt = clamp((NOW - U.anim.t0) / U.anim.dur, 0, 1);
  return U.anim.from + (U.anim.to - U.anim.from) * tt;
}
function uDraw() {
  const cv = $('s3u-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const xL = 44, xR = W - 44, axisY = 128;
  const px = v => xL + (v + 4) / 10 * (xR - xL);
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(xL - 8, axisY); ctx.lineTo(xR + 8, axisY); ctx.stroke();
  for (let v = -4; v <= 6; v++) {
    ctx.strokeStyle = v === 0 ? COL.ink : COL.grid; ctx.lineWidth = v === 0 ? 1.8 : 1;
    ctx.beginPath(); ctx.moveTo(px(v), axisY - 6); ctx.lineTo(px(v), axisY + 6); ctx.stroke();
    fitText(ctx, fmt(v), px(v), axisY + 24, 26, { size: 11.5, weight: v === 0 ? '700' : '', color: v === 0 ? COL.ink : COL.mut, align: 'center' });
  }
  const pos = uPos();
  /* 轨迹：2 与当前位置之间 */
  if (Math.abs(pos - 2) > 0.01 || U.phase > 0) {
    ctx.strokeStyle = U.phase === 2 && !U.anim ? 'rgba(126,226,168,.45)' : 'rgba(255,180,84,.4)';
    ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px(2), axisY); ctx.lineTo(px(pos), axisY); ctx.stroke();
    ctx.lineCap = 'butt';
  }
  drawWalker(ctx, px(pos), axisY, COL.cyan);
  const uroKey = U.anim ? (U.anim.to === 2 ? 's3uroBack' : 's3uroWalk')
    : U.phase === 2 ? 's3uro2' : U.phase === 1 ? 's3uro1' : 's3uro0';
  setRO('s3u-readout', t(uroKey));
  uSyncBtns();
}
function uSyncBtns() {
  const s = $('s3u-start'), u = $('s3u-undo'), r = $('s3u-redo');
  if (!s || !u || !r) return;
  s.disabled = !(U.phase === 0 && !U.anim);
  u.disabled = !(U.phase === 1 && !U.anim);
  r.disabled = !(U.phase === 2 && !U.anim);
}
function initU() {
  regCanvas('s3u-canvas');
  $('s3u-start').addEventListener('click', () => {
    if (U.phase !== 0 || U.anim) return;
    U.anim = { from: 2, to: -1, t0: NOW, dur: 3 * 480 };
    uDraw();
  });
  $('s3u-undo').addEventListener('click', () => {
    if (U.phase !== 1 || U.anim) return;
    U.anim = { from: -1, to: 2, t0: NOW, dur: 3 * 480 };
    uDraw();
  });
  $('s3u-redo').addEventListener('click', () => {
    if (U.phase !== 2 || U.anim) return;
    U.phase = 0; U.pos = 2; U.anim = null;
    uDraw();
  });
  uSyncBtns(); uDraw();
}

/* ============================================================
   第 4 步：自测（答案实算判定；解析答对才写入 DOM）
   ============================================================ */
const Q1_TEMP = -4; /* 题①温度计停住的值：画布与判定共用这一个真源 */
const Q = {
  q1: { picked: null, solved: false, correctVal: Q1_TEMP },
  q2: { picked: null, solved: false, correctVal: Math.min(-7, -3) },
  q3: { picked: null, solved: false, correctVal: walk(-2, 5) }
};
function s4Draw() {
  const cv = $('s4-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  /* 左：题①温度计（只画液柱与刻度，绝不标注答案值） */
  const cx = W * 0.22, yTop = 44, yBot = H - 58;
  const yPix = v => yBot - (v + 10) / 20 * (yBot - yTop);
  fitText(ctx, t('cQ1'), cx, 24, 170, { size: 13.5, weight: '700', color: COL.mut, align: 'center' });
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6; ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(cx - 52, yPix(0)); ctx.lineTo(cx + 62, yPix(0)); ctx.stroke();
  ctx.setLineDash([]);
  rrect(ctx, cx - 15, yTop, 30, yBot - yTop, 13);
  ctx.fillStyle = COL.panel; ctx.fill();
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.save();
  rrect(ctx, cx - 15, yTop, 30, yBot - yTop, 13); ctx.clip();
  ctx.fillStyle = COL.cyan;
  ctx.fillRect(cx - 10, yPix(Q1_TEMP), 20, yBot - yPix(Q1_TEMP) + 4);
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, yBot + 14, 13, 0, Math.PI * 2);
  ctx.fillStyle = COL.cyan; ctx.fill();
  for (let v = -10; v <= 10; v++) {
    const major = v % 5 === 0;
    ctx.strokeStyle = v === 0 ? COL.ink : COL.grid; ctx.lineWidth = v === 0 ? 1.8 : 1;
    ctx.beginPath(); ctx.moveTo(cx + 17, yPix(v)); ctx.lineTo(cx + (major ? 26 : 21), yPix(v)); ctx.stroke();
    if (major) fitText(ctx, fmt(v), cx + 30, yPix(v) + 4, 30, { size: 11.5, color: v === 0 ? COL.ink : COL.mut });
  }
  /* 右：题③轨迹（答对才画出） */
  const axL = W * 0.48, axR = W - 28, axY = H - 74;
  const px = v => axL + (v + 4) / 9 * (axR - axL);
  if (Q.q3.solved) {
    fitText(ctx, t('cQ3'), (axL + axR) / 2, 40, axR - axL, { size: 13.5, weight: '700', color: COL.mut, align: 'center' });
    ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(axL - 6, axY); ctx.lineTo(axR + 6, axY); ctx.stroke();
    for (let v = -4; v <= 5; v++) {
      ctx.strokeStyle = v === 0 ? COL.ink : COL.grid; ctx.lineWidth = v === 0 ? 1.8 : 1;
      ctx.beginPath(); ctx.moveTo(px(v), axY - 6); ctx.lineTo(px(v), axY + 6); ctx.stroke();
      fitText(ctx, fmt(v), px(v), axY + 24, 26, { size: 11.5, weight: v === 0 ? '700' : '', color: v === 0 ? COL.ink : COL.mut, align: 'center' });
    }
    ctx.strokeStyle = 'rgba(255,180,84,.4)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px(-2), axY); ctx.lineTo(px(3), axY); ctx.stroke();
    ctx.lineCap = 'butt';
    for (let v = -2; v <= 3; v++) {
      ctx.beginPath(); ctx.arc(px(v), axY, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = COL.orange; ctx.fill();
    }
    ctx.strokeStyle = COL.green; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(px(3), axY); ctx.lineTo(px(3), axY - 56); ctx.stroke();
    ctx.fillStyle = COL.green;
    ctx.beginPath(); ctx.moveTo(px(3), axY - 56); ctx.lineTo(px(3) + 13, axY - 49); ctx.lineTo(px(3), axY - 42); ctx.closePath(); ctx.fill();
    drawWalker(ctx, px(3), axY, COL.orange);
  } else {
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
    rrect(ctx, axL, 60, axR - axL, H - 150, 10); ctx.stroke();
    ctx.setLineDash([]);
    fitText(ctx, t('cQ3wait'), (axL + axR) / 2, H / 2 + 4, axR - axL - 30,
      { size: 13.5, color: COL.mut, align: 'center' });
  }
}
function s4Feedback() {
  ['q1', 'q2', 'q3'].forEach(qid => {
    const q = Q[qid];
    const fb = q.picked === null ? '' : q.solved ? t('s4' + qid + 'ok') : t('s4' + qid + 'bad');
    setRO('s4-' + qid + '-fb', fb);
    document.querySelectorAll('[id^="s4-' + qid + '-"]').forEach(b => {
      if (!b.dataset || b.dataset.val === undefined) return;
      const v = +b.dataset.val;
      b.classList.toggle('correct', q.solved && v === q.correctVal);
      b.classList.toggle('wrong', !q.solved && q.picked === v);
      b.disabled = q.solved;
    });
  });
  setRO('s4-done', Q.q1.solved && Q.q2.solved && Q.q3.solved ? t('s4allDone') : '');
}
function s4Pick(qid, val) {
  const q = Q[qid];
  if (!q || q.solved) return;
  q.picked = val;
  if (val === q.correctVal) q.solved = true;
  s4Feedback();
  s4Draw();
}
function initS4() {
  regCanvas('s4-canvas');
  ['q1', 'q2', 'q3'].forEach(qid => {
    document.querySelectorAll('[id^="s4-' + qid + '-"]').forEach(b => {
      if (b.dataset && b.dataset.val !== undefined) {
        b.addEventListener('click', () => s4Pick(qid, +b.dataset.val));
      }
    });
  });
  onLangRefresh(() => { s4Feedback(); s4Draw(); });
  onRefit(s4Draw);
  s4Feedback(); s4Draw();
}

/* ============================================================
   第 5 步：终章三联图
   ============================================================ */
function s5Draw() {
  const cv = $('s5-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  const pw = W / 3;
  const label = (i, key) => fitText(ctx, t(key), pw * (i + 0.5), H - 14, pw - 16,
    { size: 14, weight: '700', color: COL.mut, align: 'center' });
  /* 面板 1：数轴 −5…5，−3 与 3 一对 */
  {
    const xL = 18, xR = pw - 18, y = 128;
    const px = v => xL + (v + 5) / 10 * (xR - xL);
    ctx.beginPath(); ctx.arc(px(0), y, px(3) - px(0), Math.PI, 0);
    ctx.strokeStyle = 'rgba(110,231,255,.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(xL - 4, y); ctx.lineTo(xR + 4, y); ctx.stroke();
    for (let v = -5; v <= 5; v++) {
      ctx.strokeStyle = v === 0 ? COL.ink : COL.grid; ctx.lineWidth = v === 0 ? 1.8 : 1;
      ctx.beginPath(); ctx.moveTo(px(v), y - 6); ctx.lineTo(px(v), y + 6); ctx.stroke();
      fitText(ctx, fmt(v), px(v), y + 24, 24, { size: 11, weight: v === 0 ? '700' : '', color: v === 0 ? COL.ink : COL.mut, align: 'center' });
    }
    [[-3, COL.cyan], [3, COL.orange]].forEach(([v, c]) => {
      ctx.beginPath(); ctx.arc(px(v), y, 6, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill();
    });
    label(0, 'cAxis');
  }
  /* 面板 2：温度计，液柱停在 −2 */
  {
    const cx = pw + pw / 2, yTop = 42, yBot = 196;
    const yPix = v => yBot - (v + 10) / 20 * (yBot - yTop);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(cx - 40, yPix(0)); ctx.lineTo(cx + 40, yPix(0)); ctx.stroke();
    ctx.setLineDash([]);
    rrect(ctx, cx - 13, yTop, 26, yBot - yTop, 11);
    ctx.fillStyle = COL.panel; ctx.fill();
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.save();
    rrect(ctx, cx - 13, yTop, 26, yBot - yTop, 11); ctx.clip();
    ctx.fillStyle = COL.cyan; ctx.fillRect(cx - 8, yPix(-2), 16, yBot - yPix(-2) + 3);
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, yBot + 11, 11, 0, Math.PI * 2);
    ctx.fillStyle = COL.cyan; ctx.fill();
    fitText(ctx, fmt(0), cx + 34, yPix(0) + 4, 24, { size: 11.5, color: COL.ink });
    fitText(ctx, fmt(-2), cx + 34, yPix(-2) + 4, 24, { size: 11.5, weight: '700', color: COL.cyan });
    label(1, 'cTherm2');
  }
  /* 面板 3：电梯剖面（+1 / 0 / −1 / −2），轿厢在 −1 */
  {
    const bx = pw * 2 + 26, bw = pw - 52, y0 = 44, rowH = 38;
    [1, 0, -1, -2].forEach((f, i) => {
      const y = y0 + i * rowH;
      rrect(ctx, bx, y + 2, bw, rowH - 4, 5);
      ctx.fillStyle = f === -1 ? 'rgba(255,180,84,.16)' : COL.panel; ctx.fill();
      ctx.strokeStyle = f === 0 ? COL.green : COL.grid; ctx.lineWidth = f === 0 ? 1.8 : 1.1; ctx.stroke();
      fitText(ctx, fmtS(f), bx + bw - 8, y + rowH / 2 + 4, 44, { size: 12.5, weight: '700', color: f === 0 ? COL.green : COL.mut, align: 'right' });
    });
    const cabY = y0 + 2 * rowH + 5;
    rrect(ctx, bx + 12, cabY, 44, rowH - 10, 4);
    ctx.fillStyle = COL.orange; ctx.fill();
    label(2, 'cLift');
  }
}
function initS5() {
  regCanvas('s5-canvas');
  onLangRefresh(s5Draw);
  onRefit(s5Draw);
  s5Draw();
}

/* ---------- 对账入口（供评审/自测程序化核对） ---------- */
const NEGNUM = {
  cmp, walk, roundTemp,
  state: { s0: S0, s1: S1, s2: S2, s3: S3, s4: Q, u: U },
  set: {
    s0k: k => { S0.playing = false; s0SyncPlayBtn(); s0SetK(k); },
    s0sel: v => { S0.sel = v; s0Draw(); },
    s1: (a, b) => { S1.a = roundTemp(a); S1.b = roundTemp(b); s1SyncControls(); s1Draw(); },
    s1compare: () => { S1.compared = true; s1Draw(); },
    s2floor: f => {
      S2.anim = null; S2.msg = null; S2.floor = clamp(f, -2, 3);
      for (let x = Math.min(0, S2.floor); x <= Math.max(0, S2.floor); x++) S2.visited.add(x);
      s2Draw();
    },
    s2ride: f => s2RideTo(f),
    s3: (start, dir, steps) => {
      S3.start = clamp(start, -5, 5); S3.dir = dir < 0 ? -1 : 1; S3.steps = clamp(steps, 1, 8);
      s3SyncControls(); s3Invalidate();
    },
    s3instant: () => { S3.walking = false; S3.done = true; s3Draw(); },
    pick: (qid, val) => s4Pick(qid, val)
  }
};
window.NEGNUM = NEGNUM;

/* ---------- 启动（i18n 的 applyLang 已先行运行） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initS0(); initS1(); initS2(); initS3(); initU(); initS4(); initS5();
});
