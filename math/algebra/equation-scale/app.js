'use strict';
/* 方程天平 · 两边同做一件事 — 全部逻辑（无依赖，原生 Canvas 2D）
   依赖 i18n.js 先行加载：t() / getLang() / onLangRefresh()。

   ★ 口径落点（对 BRIEF「数据与判定口径」）：
   1. 唯一事实源：每步一个状态 {a,b,c,d,xv,revealed}（左盘 a 盒+b 单位，右盘 c 盒+d 单位）；
      两盘重量、平衡、倾斜、读数、算式回显全部由下方纯函数从状态算出，无第二套口径。
   2. 平衡判定 isBalanced 用严格相等（容差 0）；同除只允许 availableDivisors 的整除数。
   3. tiltDeg 仅供渲染横梁角度（示意量），不参与任何判定与读数。
   4. xv 揭晓前不进入任何 DOM 文本/属性：读数只走 compositionString（组成），
      揭晓区与自测解析门控渲染（达标/答对前 innerHTML 为空）。
   5. 操作动画只是渲染：状态在点击瞬间由 applyOp 落定，动画插值的是旧状态→新状态的
      呈现；动画中再操作立即以当前状态为起点重设，不排队、不残留旧判定。
   对账入口：window.EQ（纯函数 + 各步状态）。 */
const $ = id => document.getElementById(id);
let NOW = 0;

/* ---------- 纯函数（判定与实算的唯一出处，实现与自查共用） ---------- */
function gcd2(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { const r = x % y; x = y; y = r; } return x; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
const MAXBOX = 6, MAXUNIT = 24;

function weigh(state, xv) { return { L: state.a * xv + state.b, R: state.c * xv + state.d }; }
function isBalanced(state, xv) { const w = weigh(state, xv); return w.L === w.R; }
function tiltDeg(state, xv) { const w = weigh(state, xv); return clamp((w.L - w.R) * 2, -14, 14); }

function sideComp(a, b) {
  const parts = [];
  if (a > 0) parts.push(t('compBoxes', { n: a }));
  if (b > 0) parts.push(t('compUnits', { n: b }));
  return parts.length ? parts.join(' + ') : t('compEmpty');
}
function compositionString(state) {
  return t('compFull', { L: sideComp(state.a, state.b), R: sideComp(state.c, state.d) });
}
function sideExpr(a, b) {
  const parts = [];
  if (a > 0) parts.push(a === 1 ? 'x' : a + 'x');
  if (b > 0) parts.push(String(b));
  return parts.length ? parts.join(' + ') : '0';
}
function exprString(state) { return sideExpr(state.a, state.b) + ' = ' + sideExpr(state.c, state.d); }

function availableDivisors(state) {
  const counts = [state.a, state.b, state.c, state.d].filter(v => v > 0);
  if (!counts.length) return [];
  const g = counts.reduce(gcd2);
  const out = [];
  for (let k = 2; k <= g; k++) if (g % k === 0) out.push(k);
  return out;
}
function applyOp(state, op) {
  const s = { a: state.a, b: state.b, c: state.c, d: state.d, xv: state.xv, revealed: state.revealed };
  const n = op.n || 1, k = op.k || op.n || 1;
  switch (op.type) {
    case 'addUnits': s.b += n; s.d += n; if (s.b > MAXUNIT || s.d > MAXUNIT) return null; break;
    case 'subUnits': if (state.b < n || state.d < n) return null; s.b -= n; s.d -= n; break;
    case 'addBoxes': s.a += n; s.c += n; if (s.a > MAXBOX || s.c > MAXBOX) return null; break;
    case 'subBoxes': if (state.a < n || state.c < n) return null; s.a -= n; s.c -= n; break;
    case 'mul':
      s.a *= k; s.b *= k; s.c *= k; s.d *= k;
      if (s.a > MAXBOX || s.c > MAXBOX || s.b > MAXUNIT || s.d > MAXUNIT) return null;
      break;
    case 'div':
      if (!availableDivisors(state).includes(k)) return null;
      s.a /= k; s.b /= k; s.c /= k; s.d /= k;
      break;
    default: return null;
  }
  return s;
}
/* 只动一边的操作（反例钮专用；自查用它证明平衡必翻转） */
function applyOneSide(state, side, op) {
  const s = { a: state.a, b: state.b, c: state.c, d: state.d, xv: state.xv, revealed: state.revealed };
  const n = op.n || 1, k = op.k || op.n || 1;
  const A = side === 'L' ? 'a' : 'c', B = side === 'L' ? 'b' : 'd';
  switch (op.type) {
    case 'addUnits': s[B] += n; break;
    case 'subUnits': s[B] -= n; break;
    case 'addBoxes': s[A] += n; break;
    case 'subBoxes': s[A] -= n; break;
    case 'mul': s[A] *= k; s[B] *= k; break;
    case 'div': s[A] /= k; s[B] /= k; break;
    default: return null;
  }
  return s;
}
function isIsolated(state) { return state.a === 1 && state.b === 0 && state.c === 0; }
function evalSide(aCoef, constant, xv) { return aCoef * xv + constant; }
function solveLinear(a, b, c, d) { return (d - b) / (a - c); }
/* 验算左边的「代入式」文本，如 2×4 + 3 / 4 + 3 / 4 */
function valueExpr(st, xv) {
  const parts = [];
  if (st.a > 0) parts.push(st.a === 1 ? String(xv) : st.a + '×' + xv);
  if (st.b > 0) parts.push(String(st.b));
  return parts.length ? parts.join(' + ') : '0';
}

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
function regCanvas(id) { const cv = $(id); if (cv && !allCanvases.includes(cv)) allCanvases.push(cv); return cv; }
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
function cloneSt(st) { return { a: st.a, b: st.b, c: st.c, d: st.d, xv: st.xv, revealed: !!st.revealed }; }
function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

/* ============================================================
   天平渲染：一架天平画在 (rx, rw) 区域内。
   view = { tilt: 当前显示角度(度), anim: null | {type:'grow'|'shrink'|'div', k, from, start, dur} }
   倾斜角与动画都只是渲染，判定永远走纯函数。
   ============================================================ */
function itemsOf(st, side) {
  const nb = side === 'L' ? st.a : st.c, nu = side === 'L' ? st.b : st.d;
  const arr = [];
  for (let i = 0; i < nb; i++) arr.push('B');
  for (let i = 0; i < nu; i++) arr.push('U');
  return arr;
}
/* 盘内布局：单位在下（每行 ≤6），盒子在上（每行 ≤3）；返回 [{kind,x,y,w,h}]（x,y 为左上角） */
function layoutItems(items, cx, trayY, s) {
  const bw = 46 * s, bh = 31 * s, uw = 21 * s, uh = 13 * s, gx = 4 * s, gy = 3 * s;
  const out = [];
  const units = items.filter(k => k === 'U'), boxes = items.filter(k => k === 'B');
  const rowsU = Math.ceil(units.length / 6);
  units.forEach((k, j) => {
    const row = Math.floor(j / 6), col = j % 6;
    const inRow = Math.min(6, units.length - row * 6);
    const rowW = inRow * uw + (inRow - 1) * gx;
    out.push({ kind: 'U', x: cx - rowW / 2 + col * (uw + gx), y: trayY - (rowsU - row) * (uh + gy) + gy, w: uw, h: uh });
  });
  const baseY = trayY - rowsU * (uh + gy);
  const rowsB = Math.ceil(boxes.length / 3);
  boxes.forEach((k, j) => {
    const row = Math.floor(j / 3), col = j % 3;
    const inRow = Math.min(3, boxes.length - row * 3);
    const rowW = inRow * bw + (inRow - 1) * gx;
    out.push({ kind: 'B', x: cx - rowW / 2 + col * (bw + gx), y: baseY - (rowsB - row) * (bh + gy) + gy, w: bw, h: bh });
  });
  return out;
}
function drawOneItem(ctx, it, alpha, st) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (it.kind === 'B') {
    ctx.fillStyle = '#2a3648';
    ctx.strokeStyle = COL.orange; ctx.lineWidth = 1.6;
    rrect(ctx, it.x, it.y, it.w, it.h, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(it.x, it.y + it.h * 0.32); ctx.lineTo(it.x + it.w, it.y + it.h * 0.32); ctx.stroke();
    fitText(ctx, st.revealed ? String(st.xv) : '?', it.x + it.w / 2, it.y + it.h * 0.78, it.w - 4,
      { size: 15, weight: '700', color: COL.orange, align: 'center' });
  } else {
    ctx.fillStyle = '#3d5a78';
    ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1.2;
    rrect(ctx, it.x, it.y, it.w, it.h, 3); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
/* 一个盘的内容（含动画插值）。animP 为 0..1 的已缓动进度 */
function drawPanItems(ctx, st, side, cx, trayY, s, view) {
  const toItems = itemsOf(st, side);
  const toPos = layoutItems(toItems, cx, trayY, s);
  const anim = view.anim;
  if (!anim || !anim.from) { toPos.forEach(it => drawOneItem(ctx, it, 1, st)); return; }
  const p = ease(clamp((NOW - anim.start) / anim.dur, 0, 1));
  const fromSt = anim.from;
  const fromItems = itemsOf(fromSt, side);
  const fromPos = layoutItems(fromItems, cx, trayY, s);
  const kinds = ['B', 'U'];
  if (anim.type === 'div') {
    /* 分组呈现：from 的每类物品按 k 份轮分， pile 0 留下、其余 pile 淡出并靠拢 */
    const k = anim.k;
    kinds.forEach(kind => {
      const fIdx = fromItems.map((kk, j) => kk === kind ? j : -1).filter(j => j >= 0);
      const tIdx = toItems.map((kk, j) => kk === kind ? j : -1).filter(j => j >= 0);
      fIdx.forEach((fj, m) => {
        const pile = m % k, slot = Math.floor(m / k);
        const fp = fromPos[fj];
        if (pile === 0 && slot < tIdx.length) {
          const tp = toPos[tIdx[slot]];
          drawOneItem(ctx, { kind, x: fp.x + (tp.x - fp.x) * p, y: fp.y + (tp.y - fp.y) * p, w: fp.w, h: fp.h }, 1, st);
        } else {
          const spread = (pile - (k - 1) / 2) * 30 * s * (1 - p * 0.55);
          drawOneItem(ctx, { kind, x: fp.x + spread, y: fp.y, w: fp.w, h: fp.h }, 1 - p, st);
        }
      });
    });
    return;
  }
  /* grow / shrink：同类按序号对位插值，多出的淡入 / 淡出 */
  kinds.forEach(kind => {
    const fIdx = fromItems.map((kk, j) => kk === kind ? j : -1).filter(j => j >= 0);
    const tIdx = toItems.map((kk, j) => kk === kind ? j : -1).filter(j => j >= 0);
    const common = Math.min(fIdx.length, tIdx.length);
    for (let m = 0; m < common; m++) {
      const fp = fromPos[fIdx[m]], tp = toPos[tIdx[m]];
      drawOneItem(ctx, { kind, x: fp.x + (tp.x - fp.x) * p, y: fp.y + (tp.y - fp.y) * p, w: fp.w, h: fp.h }, 1, st);
    }
    for (let m = common; m < tIdx.length; m++) {
      const tp = toPos[tIdx[m]];
      drawOneItem(ctx, { kind, x: tp.x, y: tp.y + (1 - p) * 12, w: tp.w, h: tp.h }, p, st);
    }
    for (let m = common; m < fIdx.length; m++) {
      const fp = fromPos[fIdx[m]];
      drawOneItem(ctx, { kind, x: fp.x, y: fp.y - (p) * 8, w: fp.w, h: fp.h }, 1 - p, st);
    }
  });
}
function drawBalance(ctx, rx, rw, H, st, view, opts) {
  opts = opts || {};
  const cx = rx + rw / 2;
  const pivotY = H * (opts.mini ? 0.36 : 0.30);
  const baseY = H - 24;
  let halfLen = rw * 0.40;
  let s = clamp(halfLen / 290, 0.5, 1);
  if (opts.mini) {
    /* 终章小天平按区域宽反算（M1 修复）：盘宽 172s 以 ex=cx±halfLen 为中心，
       须满足 halfLen + 86s ≤ rw/2 − 6（盘完整落在区域内、相邻帧不重叠，路径留 6px、
       含 1.6px 描边与抗锯齿仍有 ≥5px 净空）且 2(halfLen − 86s) ≥ 12（同一天平两盘
       不相碰）。halfLen 取可行区间中点 rw/4，s 取上限 (rw/2 − 12)/172（封顶 0.95）。 */
    s = Math.min(0.95, (rw / 2 - 12) / 172);
    halfLen = rw / 4;
  }
  const tilt = (view ? view.tilt : tiltDeg(st, st.xv)) * Math.PI / 180;
  const lx = cx - Math.cos(tilt) * halfLen, ly = pivotY + Math.sin(tilt) * halfLen;
  const rxp = cx + Math.cos(tilt) * halfLen, ryp = pivotY - Math.sin(tilt) * halfLen;
  const drop = 40 * s + 8;
  const trayW = 172 * s;
  /* 支柱与底座 */
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, pivotY); ctx.lineTo(cx, baseY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 44 * s, baseY); ctx.lineTo(cx + 44 * s, baseY); ctx.stroke();
  ctx.fillStyle = COL.panel;
  ctx.beginPath(); ctx.moveTo(cx, pivotY + 2); ctx.lineTo(cx - 13 * s, pivotY + 26 * s); ctx.lineTo(cx + 13 * s, pivotY + 26 * s); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.4; ctx.stroke();
  /* 横梁 */
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rxp, ryp); ctx.stroke();
  ctx.lineCap = 'butt';
  /* 指针：与横梁同角，平衡时竖直指中 */
  const nLen = 30 * s;
  const nx = cx + Math.sin(tilt) * nLen, ny = pivotY - Math.cos(tilt) * nLen;
  ctx.strokeStyle = COL.grid; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, pivotY, nLen + 7 * s, Math.PI * 1.22, Math.PI * 1.78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, pivotY - nLen - 11 * s); ctx.lineTo(cx, pivotY - nLen - 3 * s); ctx.stroke();
  ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(cx, pivotY); ctx.lineTo(nx, ny); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, pivotY, 4, 0, Math.PI * 2); ctx.fillStyle = COL.orange; ctx.fill();
  /* 吊盘：绳 + 盘 + 内容 */
  [[lx, ly, 'L'], [rxp, ryp, 'R']].forEach(([ex, ey, side]) => {
    const trayY = ey + drop;
    ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ex, ey); ctx.lineTo(ex - trayW * 0.36, trayY); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex, ey); ctx.lineTo(ex + trayW * 0.36, trayY); ctx.stroke();
    drawPanItems(ctx, st, side, ex, trayY, s, view || { anim: null });
    ctx.fillStyle = '#232f42';
    ctx.strokeStyle = COL.edge; ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round'; /* 盘尖默认 miter 斜接会向外扎出约 2px 尖刺（M1 修复附带项），改圆接 */
    ctx.beginPath();
    ctx.moveTo(ex - trayW / 2, trayY);
    ctx.quadraticCurveTo(ex, trayY + 15 * s, ex + trayW / 2, trayY);
    ctx.lineTo(ex + trayW / 2 - 5 * s, trayY + 4 * s);
    ctx.quadraticCurveTo(ex, trayY + 17 * s, ex - trayW / 2 + 5 * s, trayY + 4 * s);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineJoin = 'miter';
    fitText(ctx, t(side === 'L' ? 'cLeft' : 'cRight'), ex, trayY + 32 * s, trayW,
      { size: 12.5, color: COL.mut, align: 'center' });
  });
  if (opts.partLabels) {
    fitText(ctx, t('cBeam'), lx + halfLen * 0.42, Math.min(ly, pivotY) - 14, 90, { size: 12.5, color: COL.mut, align: 'center' });
    fitText(ctx, t('cPointer'), cx + 40 * s, pivotY - nLen - 16 * s, 110, { size: 12.5, color: COL.mut, align: 'left' });
  }
}
/* 视图：倾斜角缓动 + 动画进度管理 */
function makeView(st) { return { tilt: tiltDeg(st, st.xv), anim: null }; }
function viewTick(view, st, dt) {
  const target = tiltDeg(st, st.xv);
  const diff = target - view.tilt;
  if (Math.abs(diff) < 0.02) view.tilt = target;
  else view.tilt += diff * Math.min(1, dt * 7);
  if (view.anim && NOW - view.anim.start > view.anim.dur + 40) view.anim = null;
}
function startAnim(view, from, op) {
  const type = op.type === 'div' ? 'div' : 'grow';
  view.anim = { type, k: op.k || op.n || 1, from: cloneSt(from), start: performance.now(), dur: 520 };
}
function snapView(view, st) { view.anim = null; view.tilt = tiltDeg(st, st.xv); }
/* 读数模板：组成 + 式子 + 平衡结论（同屏互洽的唯一出口） */
function balanceReadout(st) {
  const key = isBalanced(st, st.xv) ? 'roBalanced' : (weigh(st, st.xv).L > weigh(st, st.xv).R ? 'roLeftHeavy' : 'roRightHeavy');
  return t(key, { comp: compositionString(st), expr: exprString(st) });
}
function checklistHTML(titleKey, items) {
  const done = items.filter(i => i.done).length;
  let h = '<div class="ck-head">' + t(titleKey) + ' · ' + done + '/' + items.length + '</div>';
  items.forEach(i => { h += '<div class="ck-item' + (i.done ? ' done' : '') + '">' + (i.done ? '✓ ' : '○ ') + t(i.key) + '</div>'; });
  return h;
}

/* ============================================================
   第 0 步：认识天平（称密封盒）
   ============================================================ */
const S0 = {
  seq: [6, 4, 9], idx: 0, d: 0,
  weighed: new Set(), msg: 'idle',
  view: null
};
function s0State() { return { a: 1, b: 0, c: 0, d: S0.d, xv: S0.seq[S0.idx], revealed: false }; }
S0.view = makeView(s0State());
function s0Draw() {
  const cv = $('s0-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  const st = s0State();
  viewTick(S0.view, st, 0.016);
  ctx.clearRect(0, 0, W, H);
  drawBalance(ctx, 0, W, H, st, S0.view, { partLabels: true });
}
function renderS0() {
  const st = s0State();
  const w = weigh(st, st.xv);
  let ro;
  if (S0.msg === 'swapped') ro = t('s0roSwapped');
  else if (w.L === w.R) ro = t('s0roBalanced', { n: S0.d });
  else if (S0.msg === 'idle' && S0.d === 0) ro = t('s0roIdle');
  else ro = t(w.L > w.R ? 's0roLeft' : 's0roRight');
  setRO('s0-readout', ro);
  setRO('s0-check', checklistHTML('ckTitle', [{ key: 's0ckItem', done: S0.weighed.size >= 1 }]));
  $('s0-remove').disabled = S0.d <= 0;
  $('s0-add').disabled = S0.d >= 12;
}
function initS0() {
  regCanvas('s0-canvas');
  animate($('step0'), () => s0Draw());
  $('s0-add').addEventListener('click', () => {
    if (S0.d >= 12) return;
    const from = s0State();
    S0.d += 1; S0.msg = 'weigh';
    startAnim(S0.view, from, { type: 'addUnits', n: 1 });
    if (isBalanced(s0State(), S0.seq[S0.idx])) S0.weighed.add(S0.idx);
    renderS0();
  });
  $('s0-remove').addEventListener('click', () => {
    if (S0.d <= 0) return;
    const from = s0State();
    S0.d -= 1; S0.msg = 'weigh';
    startAnim(S0.view, from, { type: 'subUnits', n: 1 });
    renderS0();
  });
  $('s0-swap').addEventListener('click', () => {
    S0.idx = (S0.idx + 1) % S0.seq.length;
    S0.d = 0; S0.msg = 'swapped';
    snapView(S0.view, s0State());
    renderS0();
  });
  $('s0-start').addEventListener('click', () => {
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
  });
  renderS0();
}

/* ============================================================
   第 1 步：两边同加同减
   ============================================================ */
const INIT1 = { a: 1, b: 2, c: 0, d: 8, xv: 6, revealed: false };
const S1 = { st: cloneSt(INIT1), flags: { add: false, sub: false, one: false }, last: '', view: null };
S1.view = makeView(S1.st);
function s1Draw() {
  const cv = $('s1-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  viewTick(S1.view, S1.st, 0.016);
  ctx.clearRect(0, 0, W, H);
  drawBalance(ctx, 0, W, H, S1.st, S1.view, {});
}
function renderS1() {
  let ro = balanceReadout(S1.st);
  if (S1.last) ro += '<br>' + t(S1.last);
  setRO('s1-readout', ro);
  const canSub = S1.st.b >= 1 && S1.st.d >= 1;
  $('s1-subU').disabled = !canSub;
  $('s1-addB').disabled = !applyOp(S1.st, { type: 'addBoxes', n: 1 });
  $('s1-addU').disabled = !applyOp(S1.st, { type: 'addUnits', n: 1 });
  setRO('s1-why', canSub ? '' : t('s1whySub', { lb: S1.st.b, rb: S1.st.d }));
  setRO('s1-check', checklistHTML('ckTitle', [
    { key: 's1ckAdd', done: S1.flags.add },
    { key: 's1ckSub', done: S1.flags.sub },
    { key: 's1ckOne', done: S1.flags.one }
  ]));
}
function s1Do(op, lastKey, flag) {
  const ns = applyOp(S1.st, op);
  if (!ns) return;
  startAnim(S1.view, S1.st, op);
  S1.st = ns;
  if (flag) S1.flags[flag] = true;
  S1.last = lastKey || '';
  renderS1();
}
function initS1() {
  regCanvas('s1-canvas');
  animate($('step1'), () => s1Draw());
  $('s1-addU').addEventListener('click', () => s1Do({ type: 'addUnits', n: 1 }, 's1lastAddU', 'add'));
  $('s1-addB').addEventListener('click', () => s1Do({ type: 'addBoxes', n: 1 }, 's1lastAddB', 'add'));
  $('s1-subU').addEventListener('click', () => s1Do({ type: 'subUnits', n: 1 }, 's1lastSubU', 'sub'));
  $('s1-one').addEventListener('click', () => {
    const ns = applyOneSide(S1.st, 'L', { type: 'addUnits', n: 1 });
    if (!ns) return;
    startAnim(S1.view, S1.st, { type: 'addUnits', n: 1 });
    S1.st = ns;
    S1.flags.one = true;
    S1.last = 's1lastOne';
    renderS1();
  });
  $('s1-reset').addEventListener('click', () => {
    S1.st = cloneSt(INIT1);
    S1.last = '';
    snapView(S1.view, S1.st);
    renderS1();
  });
  renderS1();
}

/* ============================================================
   第 2 步：两边同乘同除
   ============================================================ */
const INIT2 = { a: 1, b: 1, c: 0, d: 4, xv: 3, revealed: false };
const S2 = { st: cloneSt(INIT2), flags: { mul: false, div: false, one: false }, last: '', lastK: 1, view: null };
S2.view = makeView(S2.st);
function s2Draw() {
  const cv = $('s2-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  viewTick(S2.view, S2.st, 0.016);
  ctx.clearRect(0, 0, W, H);
  drawBalance(ctx, 0, W, H, S2.st, S2.view, {});
}
function renderS2() {
  let ro = balanceReadout(S2.st);
  if (S2.last) ro += '<br>' + t(S2.last, { k: S2.lastK });
  setRO('s2-readout', ro);
  const divs = availableDivisors(S2.st);
  const box = $('s2-divs');
  const sig = divs.join(',');
  if (box._sig !== sig) {
    box._sig = sig;
    box.innerHTML = '';
    divs.forEach(k => {
      const b = document.createElement('button');
      b.className = 'btn big';
      b.textContent = '÷' + k;
      b.addEventListener('click', () => s2Do({ type: 'div', k }, 's2lastDiv', 'div', k));
      box.appendChild(b);
    });
  }
  const mul2ok = !!applyOp(S2.st, { type: 'mul', k: 2 });
  const mul3ok = !!applyOp(S2.st, { type: 'mul', k: 3 });
  $('s2-mul2').disabled = !mul2ok;
  $('s2-mul3').disabled = !mul3ok;
  let why = '';
  if (!divs.length) why = t('s2noDiv');
  else if (!mul2ok && !mul3ok) why = t('s2cap');
  setRO('s2-why', why);
  setRO('s2-check', checklistHTML('ckTitle', [
    { key: 's2ckMul', done: S2.flags.mul },
    { key: 's2ckDiv', done: S2.flags.div },
    { key: 's2ckOne', done: S2.flags.one }
  ]));
}
function s2Do(op, lastKey, flag, k) {
  const ns = applyOp(S2.st, op);
  if (!ns) return;
  startAnim(S2.view, S2.st, op);
  S2.st = ns;
  if (flag) S2.flags[flag] = true;
  S2.last = lastKey || '';
  S2.lastK = k || 1;
  renderS2();
}
function initS2() {
  regCanvas('s2-canvas');
  animate($('step2'), () => s2Draw());
  $('s2-mul2').addEventListener('click', () => s2Do({ type: 'mul', k: 2 }, 's2lastMul', 'mul', 2));
  $('s2-mul3').addEventListener('click', () => s2Do({ type: 'mul', k: 3 }, 's2lastMul', 'mul', 3));
  $('s2-one').addEventListener('click', () => {
    const ns = applyOneSide(S2.st, 'L', { type: 'mul', k: 2 });
    if (!ns) return;
    startAnim(S2.view, S2.st, { type: 'mul', k: 2 });
    S2.st = ns;
    S2.flags.one = true;
    S2.last = 's2lastOne';
    renderS2();
  });
  $('s2-reset').addEventListener('click', () => {
    S2.st = cloneSt(INIT2);
    S2.last = '';
    snapView(S2.view, S2.st);
    renderS2();
  });
  renderS2();
}

/* ============================================================
   第 3、4 步共用：操作面板 + 轨迹 + 揭晓（解方程台）
   ============================================================ */
function histText(op, idx) {
  const k = idx + 1;
  switch (op.type) {
    case 'addUnits': return t('histAddU', { k, n: op.n });
    case 'subUnits': return t('histSubU', { k, n: op.n });
    case 'mul': return t('histMul', { k, n: op.k });
    case 'div': return t('histDiv', { k, n: op.k });
    default: return '';
  }
}
function buildPanel(panelEl, S, rerender) {
  panelEl.innerHTML =
    '<span class="frac-ctl"><span class="frac-name" data-l="amt"></span>' +
    '<button class="btn sm" data-act="amt-">−</button>' +
    '<span class="frac-val" data-l="amtv">1</span>' +
    '<button class="btn sm" data-act="amt+">＋</button></span>' +
    '<button class="btn big primary" data-act="add"></button>' +
    '<button class="btn big" data-act="sub"></button>' +
    '<button class="btn big" data-act="mul2"></button>' +
    '<button class="btn big" data-act="mul3"></button>' +
    '<span class="row-label" data-l="divlab"></span>' +
    '<span class="btn-group" data-l="divs"></span>' +
    '<button class="btn big" data-act="reset"></button>';
  const q = sel => panelEl.querySelector(sel);
  q('[data-act="amt-"]').addEventListener('click', () => { S.amt = clamp(S.amt - 1, 1, 9); rerender(); });
  q('[data-act="amt+"]').addEventListener('click', () => { S.amt = clamp(S.amt + 1, 1, 9); rerender(); });
  q('[data-act="add"]').addEventListener('click', () => { solveDo(S, { type: 'addUnits', n: S.amt }); rerender(); });
  q('[data-act="sub"]').addEventListener('click', () => { solveDo(S, { type: 'subUnits', n: S.amt }); rerender(); });
  q('[data-act="mul2"]').addEventListener('click', () => { solveDo(S, { type: 'mul', k: 2 }); rerender(); });
  q('[data-act="mul3"]').addEventListener('click', () => { solveDo(S, { type: 'mul', k: 3 }); rerender(); });
  q('[data-act="reset"]').addEventListener('click', () => { solveReset(S); rerender(); });
  panelEl._divs = q('[data-l="divs"]');
  panelEl._q = q;
}
function solveDo(S, op) {
  const ns = applyOp(S.st, op);
  if (!ns) return false;
  startAnim(S.view, S.st, op);
  S.st = ns;
  S.hist.push(op);
  return true;
}
function solveReset(S) {
  S.st = cloneSt(S.initial);
  S.hist = [];
  S.revealed = false;
  S.st.revealed = false;
  S.amt = 1;
  snapView(S.view, S.st);
}
function renderPanel(panelEl, S) {
  const q = panelEl._q;
  q('[data-l="amt"]').textContent = t('opAmtLab');
  q('[data-l="amtv"]').textContent = String(S.amt);
  q('[data-l="divlab"]').textContent = t('opDivLab');
  const add = q('[data-act="add"]'), sub = q('[data-act="sub"]');
  add.textContent = t('opAddU', { n: S.amt });
  sub.textContent = t('opSubU', { n: S.amt });
  q('[data-act="mul2"]').textContent = t('opMul2');
  q('[data-act="mul3"]').textContent = t('opMul3');
  q('[data-act="reset"]').textContent = t('opReset');
  add.disabled = !applyOp(S.st, { type: 'addUnits', n: S.amt });
  sub.disabled = !applyOp(S.st, { type: 'subUnits', n: S.amt });
  q('[data-act="mul2"]').disabled = !applyOp(S.st, { type: 'mul', k: 2 });
  q('[data-act="mul3"]').disabled = !applyOp(S.st, { type: 'mul', k: 3 });
  q('[data-act="amt-"]').disabled = S.amt <= 1;
  q('[data-act="amt+"]').disabled = S.amt >= 9;
  const divs = availableDivisors(S.st);
  const box = panelEl._divs;
  const sig = divs.join(',');
  if (box._sig !== sig) {
    box._sig = sig;
    box.innerHTML = '';
    divs.forEach(k => {
      const b = document.createElement('button');
      b.className = 'btn big';
      b.textContent = '÷' + k;
      b.addEventListener('click', () => { solveDo(S, { type: 'div', k }); renderSolve(S); });
      box.appendChild(b);
    });
  }
}
function solveWhy(S) {
  if (!applyOp(S.st, { type: 'subUnits', n: S.amt }))
    return t('whySubU', { lb: S.st.b, rb: S.st.d, n: S.amt });
  if (!applyOp(S.st, { type: 'mul', k: 2 }) && !applyOp(S.st, { type: 'mul', k: 3 }))
    return t('whyMulCap');
  if (!availableDivisors(S.st).length) return t('whyDivNone');
  return '';
}
function renderSolve(S) {
  renderPanel(S.panelEl, S);
  setRO(S.roId, balanceReadout(S.st));
  setRO(S.whyId, solveWhy(S));
  const hist = S.hist.length
    ? S.hist.map((op, i) => '<div class="hist-item">' + histText(op, i) + '</div>').join('')
    : '<div class="hist-item">' + t('histNone') + '</div>';
  setRO(S.histId, hist);
  renderReveal(S);
}
function renderReveal(S) {
  const el = $(S.revealId);
  if (S.revealed) {
    const orig = S.initial, xv = S.st.xv;
    const html =
      '<p>' + t('rReveal', { xv }) + '</p>' +
      '<p>' + t('rVerify', {
        xv, orig: exprString(orig), ls: valueExpr(orig, xv),
        lv: evalSide(orig.a, orig.b, xv), rv: evalSide(orig.c, orig.d, xv)
      }) + '</p>';
    if (el._v !== html) { el._v = html; el.innerHTML = html; }
  } else if (isIsolated(S.st)) {
    const sig = 'ready';
    if (el._v !== sig) {
      el._v = sig;
      el.innerHTML = '<p class="rv-ready">' + t('rReady') + '</p>' +
        '<div class="btn-row"><button class="btn big primary" data-act="reveal">' + t('rBtn') + '</button></div>';
      el.querySelector('[data-act="reveal"]').addEventListener('click', () => {
        S.revealed = true;
        S.st.revealed = true;
        if (S.onReveal) S.onReveal();
        renderReveal(S);
      });
    }
  } else if (el._v !== 'empty') {
    el._v = 'empty';
    el.innerHTML = '';
  }
}

/* ---------- 第 3 步：一步方程 ---------- */
const INIT3 = { a: 1, b: 3, c: 0, d: 7, xv: 4, revealed: false };
const S3 = {
  initial: cloneSt(INIT3), st: cloneSt(INIT3), hist: [], revealed: false, amt: 1,
  view: null, panelEl: null, roId: 's3-readout', whyId: 's3-why', histId: 's3-hist', revealId: 's3-reveal'
};
S3.view = makeView(S3.st);
function s3Draw() {
  const cv = $('s3-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  viewTick(S3.view, S3.st, 0.016);
  ctx.clearRect(0, 0, W, H);
  drawBalance(ctx, 0, W, H, S3.st, S3.view, {});
}
function initS3() {
  regCanvas('s3-canvas');
  animate($('step3'), () => s3Draw());
  S3.panelEl = $('s3-panel');
  buildPanel(S3.panelEl, S3, () => renderSolve(S3));
  renderSolve(S3);
}

/* ---------- 第 4 步：两步方程（题库三题） ---------- */
const BANK4 = [
  { a: 2, b: 3, c: 0, d: 11, xv: 4, revealed: false },
  { a: 3, b: 6, c: 0, d: 15, xv: 3, revealed: false },
  { a: 4, b: 1, c: 0, d: 9, xv: 2, revealed: false }
];
const S4 = {
  idx: 0, initial: cloneSt(BANK4[0]), st: cloneSt(BANK4[0]), hist: [], revealed: false, amt: 1,
  solved: [false, false, false],
  view: null, panelEl: null, roId: 's4-readout', whyId: 's4-why', histId: 's4-hist', revealId: 's4-reveal',
  onReveal: null
};
S4.view = makeView(S4.st);
S4.onReveal = () => { S4.solved[S4.idx] = true; renderS4Head(); };
function s4Load(idx) {
  S4.idx = idx;
  S4.initial = cloneSt(BANK4[idx]);
  S4.st = cloneSt(BANK4[idx]);
  S4.hist = [];
  S4.revealed = false;
  S4.amt = 1;
  snapView(S4.view, S4.st);
}
function s4Draw() {
  const cv = $('s4-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  viewTick(S4.view, S4.st, 0.016);
  ctx.clearRect(0, 0, W, H);
  drawBalance(ctx, 0, W, H, S4.st, S4.view, {});
}
function renderS4Head() {
  setRO('s4-qlab', t('s4qLab', { i: S4.idx + 1 }));
  const k = S4.solved.filter(Boolean).length;
  setRO('s4-prog', t('s4prog', { k }));
}
function initS4() {
  regCanvas('s4-canvas');
  animate($('step4'), () => s4Draw());
  S4.panelEl = $('s4-panel');
  buildPanel(S4.panelEl, S4, () => renderSolve(S4));
  $('s4-next').addEventListener('click', () => {
    s4Load((S4.idx + 1) % BANK4.length);
    renderS4Head();
    renderSolve(S4);
  });
  renderS4Head();
  renderSolve(S4);
}

/* ============================================================
   第 5 步：自测（答案由 solveLinear 实算，解析门控渲染）
   ============================================================ */
const Q1ST = { a: 1, b: 5, c: 0, d: 12, xv: 7, revealed: false };
const Q2ST = { a: 2, b: 4, c: 0, d: 14, xv: 5, revealed: false };
const QUIZ = {
  q1: { st: Q1ST, opts: [7, 17, 5, 12], picked: null, solved: false },
  q2: { st: Q2ST, opts: [5, 9, 7, 3], picked: null, solved: false },
  q3: { opts: ['a', 'b', 'c', 'd'], picked: null, solved: false }
};
function q1Analysis() {
  const st = QUIZ.q1.st, xv = solveLinear(st.a, st.b, st.c, st.d);
  const s1 = applyOp(st, { type: 'subUnits', n: 5 });
  return t('q1ok', {
    n: 5, e0: exprString(st), e1: exprString(s1),
    chk: valueExpr(st, xv) + ' = ' + evalSide(st.a, st.b, xv)
  });
}
function q2Analysis() {
  const st = QUIZ.q2.st, xv = solveLinear(st.a, st.b, st.c, st.d);
  const s1 = applyOp(st, { type: 'subUnits', n: 4 });
  const s2 = applyOp(s1, { type: 'div', k: 2 });
  return t('q2ok', {
    n1: 4, n2: 2, e0: exprString(st), e1: exprString(s1), e2: exprString(s2),
    chk: valueExpr(st, xv) + ' = ' + evalSide(st.a, st.b, xv)
  });
}
function renderQuiz() {
  ['q1', 'q2', 'q3'].forEach(qid => {
    const Q = QUIZ[qid];
    const box = $(qid + '-opts');
    box.innerHTML = '';
    Q.opts.forEach(v => {
      const b = document.createElement('button');
      b.className = 'btn big';
      b.textContent = qid === 'q3' ? t('s5q3' + v) : String(v);
      if (Q.picked === v && !Q.solved) b.classList.add('wrong');
      if (Q.solved) {
        b.disabled = true;
        const correct = qid === 'q3' ? v === 'a' : v === solveLinear(Q.st.a, Q.st.b, Q.st.c, Q.st.d);
        if (correct) b.classList.add('correct');
      }
      b.addEventListener('click', () => quizPick(qid, v));
      box.appendChild(b);
    });
    /* 反馈与解析：答对才渲染解析；答错只有提示；语言切换时按状态重渲染 */
    let fb = '', an = '';
    if (Q.solved) {
      an = qid === 'q1' ? q1Analysis() : qid === 'q2' ? q2Analysis() : t('q3ok');
    } else if (Q.picked !== null) {
      fb = qid === 'q1' ? t('q1bad') : qid === 'q2' ? t('q2bad')
        : (Q.picked === 'd' ? t('q3badAdd') : t('q3badSide'));
    }
    setRO(qid + '-fb', fb);
    setRO(qid + '-an', an);
  });
  const all = QUIZ.q1.solved && QUIZ.q2.solved && QUIZ.q3.solved;
  setRO('s5-done', all ? t('s5done') : '');
}
function quizPick(qid, v) {
  const Q = QUIZ[qid];
  if (Q.solved) return;
  const correct = qid === 'q3' ? v === 'a' : v === solveLinear(Q.st.a, Q.st.b, Q.st.c, Q.st.d);
  Q.picked = v;
  if (correct) Q.solved = true;
  renderQuiz();
}
function s5Draw() {
  const cv = $('s5-canvas'); if (!cv) return;
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  drawBalance(ctx, 0, W, H, QUIZ.q1.st, { tilt: 0, anim: null }, {});
}
function initS5() {
  regCanvas('s5-canvas');
  onRefit(s5Draw);
  renderQuiz();
  s5Draw();
}

/* ============================================================
   第 6 步：终章回放（三帧静态）
   ============================================================ */
const FRAMES6 = [
  { a: 2, b: 3, c: 0, d: 11, xv: 4, revealed: false },
  { a: 2, b: 0, c: 0, d: 8, xv: 4, revealed: false },
  { a: 1, b: 0, c: 0, d: 4, xv: 4, revealed: false }
];
function s6Draw() {
  const cv = $('s6-canvas'); if (!cv) return;
  const rawW = cv.clientWidth;
  if (rawW < 10) return;
  /* 响应式布局（M1 修复）：宽画布三帧横排；窄画布（<600）三帧纵向堆叠、每帧占全宽，
     帧间留一条带放操作标签与向下箭头。画布高随模式经 cssH 调整（fitCanvas 沿用之）。 */
  const stacked = rawW < 600;
  const RFH = 210, BAND = 38;
  const totalH = stacked ? RFH * 3 + BAND * 2 : 250;
  if (cv.dataset.cssH !== String(totalH)) {
    cv.dataset.cssH = String(totalH);
    cv.style.height = totalH + 'px';
  }
  const ctx = fitCanvas(cv);
  const W = cv._w, H = cv._h;
  if (W < 10) return;
  ctx.clearRect(0, 0, W, H);
  if (!stacked) {
    const fw = W / 3;
    FRAMES6.forEach((st, i) => {
      drawBalance(ctx, i * fw, fw, H - 30, st, { tilt: 0, anim: null }, { mini: true });
      fitText(ctx, exprString(st), i * fw + fw / 2, H - 8, fw - 8,
        { size: 14, weight: '700', color: COL.ink, align: 'center' });
      if (i < 2) {
        const ax = (i + 1) * fw;
        ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(ax - 11, H * 0.42); ctx.lineTo(ax + 11, H * 0.42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + 11, H * 0.42); ctx.lineTo(ax + 3, H * 0.42 - 5); ctx.lineTo(ax + 3, H * 0.42 + 5); ctx.closePath();
        ctx.fillStyle = COL.orange; ctx.fill();
        fitText(ctx, t(i === 0 ? 's6op1' : 's6op2'), ax, H * 0.42 - 14, 120,
          { size: 11.5, color: COL.orange, align: 'center' });
      }
    });
    return;
  }
  FRAMES6.forEach((st, i) => {
    const y0 = i * (RFH + BAND);
    ctx.save();
    ctx.translate(0, y0);
    drawBalance(ctx, 0, W, RFH - 14, st, { tilt: 0, anim: null }, { mini: true });
    fitText(ctx, exprString(st), W / 2, RFH - 4, W - 8,
      { size: 14, weight: '700', color: COL.ink, align: 'center' });
    ctx.restore();
    if (i < 2) {
      const bandTop = y0 + RFH;
      fitText(ctx, t(i === 0 ? 's6op1' : 's6op2'), W / 2, bandTop + 14, W - 16,
        { size: 11.5, color: COL.orange, align: 'center' });
      ctx.strokeStyle = COL.orange; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(W / 2, bandTop + 21); ctx.lineTo(W / 2, bandTop + 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 - 4, bandTop + 27); ctx.lineTo(W / 2 + 4, bandTop + 27); ctx.lineTo(W / 2, bandTop + 35); ctx.closePath();
      ctx.fillStyle = COL.orange; ctx.fill();
    }
  });
}
function initS6() {
  regCanvas('s6-canvas');
  onRefit(s6Draw);
  s6Draw();
}

/* ---------- 启动 ---------- */
function renderAll() {
  renderS0(); renderS1(); renderS2();
  renderSolve(S3);
  renderS4Head(); renderSolve(S4);
  renderQuiz();
  s5Draw(); s6Draw();
  [s0Draw, s1Draw, s2Draw, s3Draw, s4Draw].forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
}
initS0(); initS1(); initS2(); initS3(); initS4(); initS5(); initS6();
onLangRefresh(renderAll);

/* 自查对账入口 */
window.EQ = {
  weigh, isBalanced, tiltDeg, compositionString, exprString, applyOp, applyOneSide,
  availableDivisors, isIsolated, evalSide, solveLinear,
  S0, S1, S2, S3, S4, QUIZ, BANK4
};
