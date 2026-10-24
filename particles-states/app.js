'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';

/* ================= PURE-BEGIN ================= */
/* 计算层（唯一真值源）：粒子模拟 + 全部读数与物态判定。
   模型口径（BRIEF 失配节）：二维圆盘、弹性碰撞简化、短程约束近似「挨着」；
   温度读数只能由粒子平均速率（RMS）经 tempOf 映射得到，禁止从滑杆位置抄数；
   物态名只能由 analyze() 从粒子位置/速度实算，禁止按滑杆区间写死。 */

/* ---- 定死常量（构建定版，见 build-report） ---- */
const N = 108;                       // 粒子总数：12×9 阵列，全程守恒
const RAD = 1.6, DIA = 3.2;          // 粒子半径 / 直径（模型单位）
const BOX = { x0: 2, x1: 98, y0: 2, y1: 62 };   // 容器内壁
const LID_Y = 38;                    // 盖子高度（第 3 步）
const LATT = 3.6, COLS = 12, ROWS = 9;          // 固体阵列间距与行列
const MELT_A = 0.30, MELT_B = 0.45;  // 熔化平台：滑杆区间（座位约束在此区间内退场）
const BOIL_A = 0.70, BOIL_B = 0.78;  // 沸腾平台：滑杆区间（黏着约束在此区间内退场）
const K_SEAT = 25;                   // 座位弹簧强度（固态队形约束）
const SEAT_DAMP = 0.9;               // 座位阻尼
const G_COH = 150;                   // 短程黏着强度（液体「挨着」近似）
const GRAV = 15;                     // 重力（让液体贴底）
const CUTOFF = 7;                    // 近邻作用截断距离
const FREEZE_S = 0.32;               // 降温越过此值且座位已失效时，重新排座（冻结事件）

/* 滑杆位置 s（热量输入，模型参数）→ 目标 RMS 速率：分段线性，平台段恒定。
   平台 = 模型按设定把加热分流到「拆队形」，温度（由 RMS 实算）随之停住。 */
const VTARGET_KNOTS = [[0, 6], [MELT_A, 16], [MELT_B, 16], [BOIL_A, 30], [BOIL_B, 30], [1, 46]];
function vTarget(s) {
  for (let i = 1; i < VTARGET_KNOTS.length; i++) {
    const [s1, v1] = VTARGET_KNOTS[i - 1], [s2, v2] = VTARGET_KNOTS[i];
    if (s <= s2) return v1 + (v2 - v1) * (s - s1) / (s2 - s1);
  }
  return 46;
}
/* 温度示意读数映射（定死）：T = clamp(round((vRMS − 4) × 120/44), 0, 120)。
   熔点（vRMS=16）→ 33，沸点（vRMS=30）→ 71，只保证单调、定性正确。 */
function tempOf(vrms) { return clamp(Math.round((vrms - 4) * 120 / 44), 0, 120); }
function kSeatOf(s) { return s <= MELT_A ? K_SEAT : s >= MELT_B ? 0 : K_SEAT * (1 - (s - MELT_A) / (MELT_B - MELT_A)); }
/* 黏着随滑杆的交接：固态区为 0（座位约束独管，不让黏着压碎阵列）；
   熔化平台内随座位退场而接管；沸腾平台内退场到 0。 */
function gCohOf(s) {
  if (s <= MELT_A) return 0;
  if (s < MELT_B) return G_COH * (s - MELT_A) / (MELT_B - MELT_A);
  if (s <= BOIL_A) return G_COH;
  if (s >= BOIL_B) return 0;
  return G_COH * (1 - (s - BOIL_A) / (BOIL_B - BOIL_A));
}
function inMeltPlateau(s) { return s > MELT_A && s < MELT_B; }

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
function latticeHomes() {
  const homes = [], x0 = 50 - (COLS - 1) * LATT / 2, y0 = BOX.y0 + RAD + 0.6;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) homes.push({ x: x0 + c * LATT, y: y0 + r * LATT });
  return homes;
}
function createSim(seed) {
  const rnd = mulberry32(seed || 1234567);
  const homes = latticeHomes();
  const v0 = vTarget(0.08);
  const particles = homes.map(h => {
    const ang = rnd() * 2 * Math.PI, sp = v0 * (0.4 + 0.6 * rnd());
    return { x: h.x, y: h.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp };
  });
  return { particles, homes, heat: 0.08, lid: false, seatsStale: false, tracked: -1, t: 0 };
}
/* 冻结事件：阵列在粒子群当前位置就地重建（以质心定中心），
   再按「全局距离最小优先」贪心配对座位——每粒子去最近的空座，避免穿群堵死。 */
function reassignHomes(sim) {
  const P = sim.particles;
  let cx = 0;
  for (const p of P) cx += p.x;
  cx /= P.length;
  const homes = latticeHomes().map(h => ({ x: h.x - 50 + cx, y: h.y }));
  for (const h of homes) { h.x = clamp(h.x, BOX.x0 + RAD + 0.4, BOX.x1 - RAD - 0.4); }
  const pairs = [];
  for (let i = 0; i < P.length; i++) for (let k = 0; k < homes.length; k++) {
    const dx = P[i].x - homes[k].x, dy = P[i].y - homes[k].y;
    pairs.push([dx * dx + dy * dy, i, k]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  const usedP = new Set(), usedH = new Set(), remap = new Array(P.length);
  for (const [, i, k] of pairs) {
    if (usedP.has(i) || usedH.has(k)) continue;
    usedP.add(i); usedH.add(k); remap[i] = homes[k];
    if (usedP.size === P.length) break;
  }
  sim.homes = remap;
}

function stepSim(sim, dt) {
  /* 内部两个半子步：黏着力程较硬，减小单步积分误差（数值口径，见报告） */
  stepOnce(sim, dt / 2);
  stepOnce(sim, dt / 2);
}
function stepOnce(sim, dt) {
  const P = sim.particles, s = sim.heat;
  if (s > MELT_B) sim.seatsStale = true;
  if (s < FREEZE_S && sim.seatsStale) { reassignHomes(sim); sim.seatsStale = false; }
  const kSeat = kSeatOf(s), gCoh = gCohOf(s);
  const ax = new Float64Array(P.length), ay = new Float64Array(P.length);
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    ay[i] = -GRAV;
    if (kSeat > 0) {
      const h = sim.homes[i];
      ax[i] += -kSeat * (p.x - h.x) - SEAT_DAMP * p.vx;
      ay[i] += -kSeat * (p.y - h.y) - SEAT_DAMP * p.vy;
    }
  }
  /* 近邻对：网格分桶（格宽 = CUTOFF），O(N) 量级 */
  const cell = CUTOFF, gw = Math.ceil((BOX.x1 - BOX.x0) / cell) + 2;
  const grid = new Map();
  for (let i = 0; i < P.length; i++) {
    const cx = Math.floor((P[i].x - BOX.x0) / cell), cy = Math.floor((P[i].y - BOX.y0) / cell);
    const key = cx + cy * gw;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(i);
  }
  const pairs = [];
  for (let i = 0; i < P.length; i++) {
    const cx = Math.floor((P[i].x - BOX.x0) / cell), cy = Math.floor((P[i].y - BOX.y0) / cell);
    for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
      const bucket = grid.get(gx + gy * gw); if (!bucket) continue;
      for (const j of bucket) if (j > i) pairs.push([i, j]);
    }
  }
  for (const [i, j] of pairs) {
    const a = P[i], b = P[j];
    let dx = b.x - a.x, dy = b.y - a.y;
    let d2 = dx * dx + dy * dy;
    if (d2 >= CUTOFF * CUTOFF || d2 < 1e-12) continue;
    const d = Math.sqrt(d2), ux = dx / d, uy = dy / d;
    if (d < DIA) {
      /* 重叠：位置各推开一半重叠的 0.5 倍（松弛式，避免约束求解向弹簧注入能量）；
         法向相对速度仍在接近时交换法向分量（等质量弹性碰撞简化） */
      const push = (DIA - d) * 0.175;
      a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
      const vin = a.vx * ux + a.vy * uy, vjn = b.vx * ux + b.vy * uy;
      if (vin - vjn > 0) {
        const dvn = vjn - vin;
        a.vx += dvn * ux; a.vy += dvn * uy; b.vx -= dvn * ux; b.vy -= dvn * uy;
      }
    } else if (gCoh > 0) {
      /* 短程黏着：线性衰减力程，截断处归零、近接触最强
         （固态区黏着关闭，阵列不会被它压碎——见 gCohOf 的交接口径） */
      const f = gCoh * (CUTOFF - d) / (CUTOFF - DIA);
      ax[i] += f * ux; ay[i] += f * uy; ax[j] -= f * ux; ay[j] -= f * uy;
    }
  }
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    p.vx += ax[i] * dt; p.vy += ay[i] * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    /* 器壁弹性反射 */
    if (p.x < BOX.x0 + RAD) { p.x = BOX.x0 + RAD; p.vx = Math.abs(p.vx); }
    if (p.x > BOX.x1 - RAD) { p.x = BOX.x1 - RAD; p.vx = -Math.abs(p.vx); }
    if (p.y < BOX.y0 + RAD) { p.y = BOX.y0 + RAD; p.vy = Math.abs(p.vy); }
    if (p.y > BOX.y1 - RAD) { p.y = BOX.y1 - RAD; p.vy = -Math.abs(p.vy); }
    /* 盖子：水平线段，两侧都弹回 */
    if (sim.lid) {
      const top = LID_Y;
      if (p.vy > 0 && p.y + RAD > top && p.y < top) { p.y = top - RAD; p.vy = -Math.abs(p.vy); }
      else if (p.vy < 0 && p.y - RAD < top && p.y > top) { p.y = top + RAD; p.vy = Math.abs(p.vy); }
    }
  }
  /* 恒温器（模型参数层）：把全体速度温和地推向目标 RMS —— 滑杆改的是这里，
     读数则永远由 analyze() 从粒子速度实算，两条路分开。 */
  let sum2 = 0;
  for (const p of P) sum2 += p.vx * p.vx + p.vy * p.vy;
  const vrms = Math.sqrt(sum2 / P.length), vt = vTarget(s);
  if (vrms > 1e-9) {
    const f = clamp(1 + 0.25 * (vt / vrms - 1), 0.8, 1.22);
    if (f !== 1) for (const p of P) { p.vx *= f; p.vy *= f; }
  }
  sim.t += dt;
}

/* 全部读数与物态判定：只吃粒子位置/速度/座位，不看滑杆。 */
function analyze(sim) {
  const P = sim.particles, n = P.length;
  let sv = 0, sv2 = 0, cx = 0, cy = 0;
  for (const p of P) { const sp = Math.hypot(p.vx, p.vy); sv += sp; sv2 += sp * sp; cx += p.x; cy += p.y; }
  cx /= n; cy /= n;
  const vmean = sv / n, vrms = Math.sqrt(sv2 / n);
  const nn = new Float64Array(n).fill(Infinity);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
    if (d < nn[i]) nn[i] = d;
    if (d < nn[j]) nn[j] = d;
  }
  let rho = 0, meanNN = 0, contact = 0;
  for (let i = 0; i < n; i++) {
    rho += Math.hypot(P[i].x - cx, P[i].y - cy);
    meanNN += nn[i];
    if (nn[i] < 3.9) contact++;
  }
  rho /= n; meanNN /= n;
  const contactFrac = contact / n;
  /* 液池 = 密度网格（格宽 8）里与底部连通的稠密格集合：格内 ≥ 3 个粒子算稠密，
     从贴底的稠密格起四连通扩展。空中粒子 = 不在液池格里的粒子
     （守恒：液里 + 空中 = 总数，恒等成立）。气体时稠密格稀少且不成片 → 无池、全体计空中；
     热运动下瞬时接触链会碎裂，密度口径比接触连通更稳。 */
  const CS = 8, GW = Math.ceil((BOX.x1 - BOX.x0) / CS), GH = Math.ceil((BOX.y1 - BOX.y0) / CS);
  const cellOf = p => [Math.min(GW - 1, Math.floor((p.x - BOX.x0) / CS)), Math.min(GH - 1, Math.floor((p.y - BOX.y0) / CS))];
  const counts = new Map(), members = new Map();
  P.forEach((p, i) => {
    const [gx, gy] = cellOf(p), key = gx + gy * GW;
    counts.set(key, (counts.get(key) || 0) + 1);
    if (!members.has(key)) members.set(key, []);
    members.get(key).push(i);
  });
  const dense = new Set();
  for (const [key, c] of counts) if (c >= 3) dense.add(key);
  const poolCells = new Set(), stack = [];
  for (const key of dense) if (Math.floor(key / GW) <= 2) { poolCells.add(key); stack.push(key); }
  while (stack.length) {
    const key = stack.pop(), gx = key % GW, gy = Math.floor(key / GW);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = gx + dx, ny = gy + dy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const nk = nx + ny * GW;
      if (dense.has(nk) && !poolCells.has(nk)) { poolCells.add(nk); stack.push(nk); }
    }
  }
  let poolSize = 0;
  for (const key of poolCells) poolSize += members.get(key).length;
  const hasPool = poolSize >= 25;
  if (!hasPool) poolSize = 0;
  /* 空中判定（复合口径）：不在液池格里、且（最近邻已脱开 或 已高于液面 3 以上）。
     液面 = 液池格内粒子的最高 y。无池（气体）时全体计空中。
     守恒：液里 + 空中 = 总数，恒等成立。 */
  let poolTopY = -Infinity;
  if (hasPool) {
    for (const key of poolCells) for (const i of members.get(key)) poolTopY = Math.max(poolTopY, P[i].y);
  }
  const inPoolCell = new Set();
  if (hasPool) for (const key of poolCells) for (const i of members.get(key)) inPoolCell.add(i);
  let air = 0;
  for (let i = 0; i < n; i++) {
    if (!hasPool) { air++; continue; }
    if (inPoolCell.has(i)) continue;
    if (nn[i] > CUTOFF || P[i].y > poolTopY + 3) air++;
  }
  /* 座位贴合：离各自座位 ≤ 2.2 的比例 */
  let seated = 0;
  for (let i = 0; i < n; i++) if (Math.hypot(P[i].x - sim.homes[i].x, P[i].y - sim.homes[i].y) <= 2.2) seated++;
  const seatedFrac = seated / n, airFrac = air / n;
  let state;
  if (airFrac >= 0.55 || (rho >= 29.5 && contactFrac < 0.70)) state = 'gas';
  else if (seatedFrac >= 0.25 && airFrac <= 0.12) state = 'solid';
  else state = 'liquid';
  return {
    n, vmean, vrms, temp: tempOf(vrms), air, liq: n - air, airFrac,
    rho, meanNN, contactFrac, seatedFrac, state, poolTop: 0
  };
}
function fmtNum(v) {
  if (!isFinite(v)) return '∞';
  const r = Math.round(v * 100) / 100;
  const s = Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : r.toFixed(2);
  return s.replace('-', '−');
}
function fmt1(v) { return (Math.round(v * 10) / 10).toFixed(1).replace('-', '−'); }
/* ================= PURE-END ================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    N, DIA, BOX, LID_Y, MELT_A, MELT_B, BOIL_A, BOIL_B,
    vTarget, tempOf, kSeatOf, gCohOf, inMeltPlateau, createSim, stepSim, analyze, reassignHomes
  };
} else {

  /* ================= UI 层 ================= */
  const sim = createSim((Date.now() % 2000000000) + 7);
  let playing = true;
  const trail = [];
  const QUIZ = { q1: 1, q2: 1, q3: 1, q4: 1 };
  const quiz = { picked: { q1: null, q2: null, q3: null, q4: null }, locked: { q1: false, q2: false, q3: false, q4: false } };
  const VIS = { s0: false, s1: false, s2: false, s3: false, s4: false };
  function ro(id, text) { $(id).textContent = text; }
  function stateName(st) { return t(st === 'solid' ? 'stateSolid' : st === 'liquid' ? 'stateLiquid' : 'stateGas'); }

  function fitWorld(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = cv.clientWidth;
    const h = Math.max(280, Math.min(430, Math.round(w * 0.64)));
    cv.style.height = h + 'px';
    const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
    if (cv.width !== bw) cv.width = bw; if (cv.height !== bh) cv.height = bh;
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.min(w / 100, h / 64);
    cv._view = { w, h, scale, ox: (w - 100 * scale) / 2, oy: (h - 64 * scale) / 2 };
    return ctx;
  }
  function speedColor(sp) {
    const u = clamp(sp / 48, 0, 1);
    const c1 = [87, 167, 255], c2 = [255, 180, 84], c3 = [255, 107, 74];
    const a = u < 0.5 ? c1 : c2, b = u < 0.5 ? c2 : c3, f = u < 0.5 ? u * 2 : (u - 0.5) * 2;
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
  }
  function drawSim(cv) {
    const ctx = fitWorld(cv), v = cv._view;
    ctx.clearRect(0, 0, v.w, v.h);
    const X = x => v.ox + x * v.scale, Y = y => v.oy + (64 - y) * v.scale;
    const a = analyze(sim);
    /* 容器 */
    ctx.save();
    ctx.strokeStyle = '#3d4c68'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.rect(X(BOX.x0), Y(BOX.y1), (BOX.x1 - BOX.x0) * v.scale, (BOX.y1 - BOX.y0) * v.scale); ctx.stroke();
    ctx.fillStyle = 'rgba(110,231,255,0.05)';
    ctx.fillRect(X(BOX.x0), Y(BOX.y1), (BOX.x1 - BOX.x0) * v.scale, (BOX.y1 - BOX.y0) * v.scale);
    /* 座位（队形可见时淡显，帮眼睛确认「座位」概念） */
    if (kSeatOf(sim.heat) > 1) {
      ctx.fillStyle = 'rgba(154,167,184,0.35)';
      for (const h of sim.homes) { ctx.beginPath(); ctx.arc(X(h.x), Y(h.y), 1.6, 0, 2 * Math.PI); ctx.fill(); }
    }
    /* 盖子 */
    if (sim.lid) {
      ctx.strokeStyle = orange; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(X(BOX.x0), Y(LID_Y)); ctx.lineTo(X(BOX.x1), Y(LID_Y)); ctx.stroke();
    }
    /* 跟踪粒子的轨迹 */
    if (sim.tracked >= 0 && trail.length > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      trail.forEach(([x, y], i) => { const px = X(x), py = Y(y); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
      ctx.stroke();
    }
    /* 粒子：颜色由各自速度实算（视觉层读数，判定不依赖颜色） */
    for (let i = 0; i < sim.particles.length; i++) {
      const p = sim.particles[i];
      ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), RAD * v.scale, 0, 2 * Math.PI);
      ctx.fillStyle = speedColor(Math.hypot(p.vx, p.vy)); ctx.fill();
      if (i === sim.tracked) {
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), (RAD + 0.9) * v.scale, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.stroke();
      }
    }
    ctx.restore();
    return a;
  }
  function renderAll() {
    for (const k of ['s0', 's1', 's2', 's3', 's4']) if (VIS[k]) drawSim($(k + '-canvas'));
  }
  /* 显示平滑：analyze 是逐帧纯测量，剧烈翻腾时液池口径偶有单帧抖动；
     读数显示仍全部来自模拟测量，只是抗抖：物态取最近 5 次采样的多数票；
     空中数取最近 31 次采样（约 6.8 秒）的中位数——盖盖平衡后液面附近粒子
     成簇溅起、反复跨越判定界，瞬时空中数跳动可达均值 ±40%，短窗口压不住。
     显示口径下液里 = 总数 − 显示空中，故同屏两数恒和为总数。
     roHist 是本页唯一的平滑历史，重置时必须清空（见 resetSim）。 */
  const roHist = [];
  function smoothed(a) {
    roHist.push({ state: a.state, air: a.air });
    if (roHist.length > 31) roHist.shift();
    const votes = { solid: 0, liquid: 0, gas: 0 };
    for (const h of roHist.slice(-5)) votes[h.state]++;
    let st = a.state, best = -1;
    for (const k of ['solid', 'liquid', 'gas']) if (votes[k] > best) { best = votes[k]; st = k; }
    const airs = roHist.map(h => h.air).sort((x, y) => x - y);
    const med = airs[Math.floor(airs.length / 2)];
    return { state: st, air: med, liq: a.n - med };
  }
  function readoutAll() {
    const raw = analyze(sim);
    const a = Object.assign({}, raw, smoothed(raw));
    if (sim.tracked >= 0) {
      const p = sim.particles[sim.tracked], h = sim.homes[sim.tracked];
      ro('s0-readout', t('s0ro', { state: stateName(a.state), n: a.n, d: fmt1(Math.hypot(p.x - h.x, p.y - h.y)) }));
    } else {
      ro('s0-readout', t('s0roPlain', { state: stateName(a.state), n: a.n }));
    }
    ro('s1-readout', t('s1ro', { t: a.temp, v: fmt1(a.vmean), state: stateName(a.state) }));
    ro('s2-readout', t('s2ro', {
      pct: Math.round(sim.heat * 100), t: a.temp,
      plateau: inMeltPlateau(sim.heat) ? t('s2plateau') : '',
      state: stateName(a.state), n: a.n
    }));
    ro('s3-readout', t('s3ro', { liq: a.liq, air: a.air, n: a.n, t: a.temp, state: stateName(a.state) }));
    ro('s4-readout', t('s4ro', { liq: a.liq, air: a.air, n: a.n, state: stateName(a.state), t: a.temp }));
  }
  function readout5() {
    for (const q of ['q1', 'q2', 'q3', 'q4']) {
      const picked = quiz.picked[q], locked = quiz.locked[q];
      document.querySelectorAll(`[data-q="${q}"]`).forEach(b => {
        b.disabled = locked;
        b.setAttribute('aria-pressed', String(picked === Number(b.dataset.opt)));
      });
      ro('s5-' + q + '-ro', picked === null ? '' : t(picked === QUIZ[q] ? q + 'ok' : q + 'no'));
      $('s5-' + q + '-ro').style.color = picked === null ? muted : picked === QUIZ[q] ? green : pink;
    }
    const k = ['q1', 'q2', 'q3', 'q4'].filter(q => quiz.locked[q]).length;
    ro('s5-score', t('score', { k }));
    /* 自测提示门控：四题全对前，提示内容不渲染进 DOM（不是 CSS 隐藏） */
    const box = $('s5-hint');
    if (k === 4) {
      if (!box.dataset.done) {
        box.innerHTML = '';
        const d = document.createElement('div');
        d.className = 'finale';
        const strong = document.createElement('strong');
        strong.textContent = t('hintHead');
        const p = document.createElement('p');
        p.textContent = t('hintBody');
        d.appendChild(strong); d.appendChild(p);
        box.appendChild(d);
        box.dataset.done = '1';
      }
    } else {
      box.innerHTML = '';
      delete box.dataset.done;
    }
  }
  /* 选项洗牌（Fisher–Yates）：按钮节点整体重排，data-opt 的值与文案随按钮走；
     判定与诊断都按值走（quiz.picked 存值、QUIZ 存正确值），位置不参与判定，
     故洗牌不会让诊断与选项错位。页面加载与自测重置时各洗一次，
     避免正确项长期固定在同一位置（评审 S2）。 */
  function shuffleQuiz() {
    for (const q of ['q1', 'q2', 'q3', 'q4']) {
      const btns = Array.from(document.querySelectorAll(`[data-q="${q}"]`));
      if (btns.length < 2) continue;
      const row = btns[0].parentNode;
      for (let i = btns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = btns[i]; btns[i] = btns[j]; btns[j] = tmp;
      }
      for (const b of btns) row.appendChild(b);
    }
  }
  function badges() {
    for (const [el, arr, id] of [['categoryBadge', window.KNOWLEDGE_CATEGORIES, 'chemistry'], ['stageBadge', window.KNOWLEDGE_STAGES, 'junior']]) {
      const item = (arr || []).find(x => x.id === id);
      if (item) $(el).textContent = item.name[getLang()];
    }
  }
  function playLabels() {
    for (const k of ['s0', 's1', 's2', 's3', 's4']) $(k + '-play').textContent = t(playing ? 'pause' : 'play');
  }
  function syncHeat(v) {
    sim.heat = clamp(v, 0, 1);
    for (const id of ['s1-heat', 's2-heat', 's3-heat', 's4-heat']) $(id).value = Math.round(sim.heat * 100);
    readoutAll();
  }
  function resetSim() {
    const fresh = createSim((Date.now() % 2000000000) + 11);
    sim.particles = fresh.particles; sim.homes = fresh.homes;
    sim.seatsStale = false; sim.tracked = -1; sim.t = 0; trail.length = 0;
    /* 平滑历史一并清空：否则旧物态样本会在多数票/中位数里再活几个读数周期，
       重置后短暂打印与新画面矛盾的旧物态与旧空中数（评审 M1）。 */
    roHist.length = 0;
    sim.lid = false; $('s3-lid').checked = false;
    syncHeat(0.08);
    renderAll();
  }
  function refresh() { badges(); playLabels(); renderAll(); readoutAll(); readout5(); }
  function bind() {
    for (const id of ['s1-heat', 's2-heat', 's3-heat', 's4-heat']) {
      $(id).addEventListener('input', e => syncHeat(Number(e.target.value) / 100));
    }
    for (const k of ['s0', 's1', 's2', 's3', 's4']) {
      $(k + '-play').onclick = () => { playing = !playing; playLabels(); };
    }
    $('s0-reset').onclick = resetSim;
    $('s4-reset').onclick = resetSim;
    $('s3-lid').onchange = e => { sim.lid = e.target.checked; renderAll(); };
    for (const k of ['s0', 's1', 's2', 's3', 's4']) {
      const cv = $(k + '-canvas');
      cv.addEventListener('pointerdown', e => {
        const r = cv.getBoundingClientRect(), v = cv._view;
        if (!v) return;
        const wx = (e.clientX - r.left - v.ox) / v.scale, wy = 64 - (e.clientY - r.top - v.oy) / v.scale;
        let best = -1, bd = 3.4;
        sim.particles.forEach((p, i) => {
          const d = Math.hypot(p.x - wx, p.y - wy);
          if (d < bd) { bd = d; best = i; }
        });
        sim.tracked = best; trail.length = 0;
        readoutAll();
      });
    }
    document.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
      const q = b.dataset.q;
      if (quiz.locked[q]) return;
      quiz.picked[q] = Number(b.dataset.opt);
      if (quiz.picked[q] === QUIZ[q]) quiz.locked[q] = true;
      readout5();
    });
    $('s5-reset').onclick = () => {
      for (const q of ['q1', 'q2', 'q3', 'q4']) { quiz.picked[q] = null; quiz.locked[q] = false; }
      shuffleQuiz();
      readout5();
    };
    const observer = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) document.querySelectorAll('.nav-step').forEach(aEl => {
        const active = aEl.dataset.nav === e.target.dataset.step;
        aEl.classList.toggle('active', active);
        if (active) aEl.setAttribute('aria-current', 'step'); else aEl.removeAttribute('aria-current');
      });
      const key = 's' + e.target.dataset.step;
      if (key in VIS) VIS[key] = e.isIntersecting;
    }), { rootMargin: '-25% 0px -50% 0px' });
    document.querySelectorAll('.step').forEach(el => observer.observe(el));
    let queued = false;
    window.addEventListener('resize', () => {
      if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; renderAll(); }); }
    });
    shuffleQuiz();
  }
  let lastTs = 0, acc = 0, lastRO = 0;
  function tick(ts) {
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0; lastTs = ts;
    if (playing && dt > 0) {
      acc += dt;
      const step = 1 / 120;
      let guard = 0;
      while (acc >= step && guard < 12) { stepSim(sim, step); acc -= step; guard++; }
      if (guard >= 12) acc = 0;
      if (sim.tracked >= 0) {
        const p = sim.particles[sim.tracked];
        trail.push([p.x, p.y]);
        while (trail.length > 42) trail.shift();
      }
    }
    renderAll();
    if (ts - lastRO > 220) { lastRO = ts; readoutAll(); }
    requestAnimationFrame(tick);
  }
  onLangRefresh(refresh);
  bind();
  applyLang(getLang());
  requestAnimationFrame(tick);
  // Read-only inspection surface for numerical review; UI remains the mutation path.
  window.PARTICLES = {
    get sim() { return sim; },
    analyze: () => analyze(sim),
    setHeat: v => syncHeat(v),
    setLid: v => { sim.lid = !!v; $('s3-lid').checked = !!v; },
    reset: resetSim,
    vTarget, tempOf
  };
}
