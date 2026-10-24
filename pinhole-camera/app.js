'use strict';
const $ = id => document.getElementById(id);
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';

/* PURE-BEGIN */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, p) { return a + (b - a) * p; }
// 两点式直线在 x = xAt 处的 y（所有光线落点都由它实算）
function lineYatX(x1, y1, x2, y2, xAt) {
  if (Math.abs(x2 - x1) < 1e-12) return y2;
  return y1 + (y2 - y1) * (xAt - x1) / (x2 - x1);
}
// 像高公式：h = H × v / u
function imgH(H, u, v) { return H * v / u; }
// 像端点连线实算：物端点 A（顶）、B（底）各与孔心 O 连成直线、延长到屏平面 x = screenX
// fromA 是焰顶的光的落点（应在下方）、fromB 是焰底的落点（应在上方）；h 为两落点距离
function imageEnds(A, B, O, screenX) {
  const fromA = lineYatX(A[0], A[1], O[0], O[1], screenX);
  const fromB = lineYatX(B[0], B[1], O[0], O[1], screenX);
  return { fromA: fromA, fromB: fromB, top: Math.min(fromA, fromB), bot: Math.max(fromA, fromB), h: Math.abs(fromA - fromB) };
}
// 光斑宽（相似关系实算）：斑宽 = 孔径 d × (u + v) / u
function spotWidth(d, u, v) { return d * (u + v) / u; }
// 一个物点 P 经孔的上缘 / 中心 / 下缘三点到屏平面的落点（逐条两点式实算）
function spotLandings(P, holeX, holeY, d, screenX) {
  return [-d / 2, 0, d / 2].map(function (off) {
    return lineYatX(P[0], P[1], holeX, holeY + off, screenX);
  });
}
// 第 0 步影子：灯泡点 S 经挡板上、下缘连成直线、延长到屏平面
function shadowEdges(S, discX, discTop, discBot, screenX) {
  return {
    top: lineYatX(S[0], S[1], discX, discTop, screenX),
    bot: lineYatX(S[0], S[1], discX, discBot, screenX)
  };
}
// 第 0 步一条射线：以屏上目标点定义，查它是否被挡板截断，返回终点与是否被挡
function rayEnd(S, target, discX, discTop, discBot) {
  const yAt = lineYatX(S[0], S[1], target[0], target[1], discX);
  if (yAt >= discTop && yAt <= discBot) return { end: [discX, yAt], blocked: true };
  return { end: target, blocked: false };
}
function fmt0(v) { return String(Math.round(v)); }
function fmt1(v) { return (Math.round(v * 10) / 10).toFixed(1); }
function fmt2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
/* PURE-END */

const S = {
  s0: { discX: 250, fly: 1, flying: false, flown: false },
  s1: { lit: 0, animRay: -1, animP: 1 },
  s2: { H: 60, u: 120, v: 120 },
  s3: { d: 10 },
  quiz: {
    q1: { picked: null, tries: 0, done: false },
    q2: { picked: null, tries: 0, done: false },
    q3: { picked: null, tries: 0, done: false },
    q4: { picked: null, tries: 0, done: false }
  }
};
const QANS = { q1: 0, q2: 1, q3: 2, q4: 2 };
const QWRONG = {
  q1: { 1: 'q1w1', 2: 'q1w2' },
  q2: { 0: 'q2w0', 2: 'q2w2' },
  q3: { 0: 'q3w0', 1: 'q3w1' },
  q4: { 0: 'q4w0', 1: 'q4w1' }
};
function ro(id, text) { $(id).textContent = text; }
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) cv.dataset.cssH = cv.getAttribute('height') || '330';
  cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.cssH);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw;
  if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cv._w = w; cv._h = h; return ctx;
}
function scene(id, w, h) {
  const cv = $(id), ctx = fitCanvas(cv);
  ctx.clearRect(0, 0, cv._w, cv._h);
  const scale = Math.min(cv._w / w, cv._h / h);
  const ox = (cv._w - w * scale) / 2, oy = (cv._h - h * scale) / 2;
  ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale);
  cv._view = { w: w, h: h, scale: scale, ox: ox, oy: oy };
  return ctx;
}
function line(ctx, a, b, color, width, dash) {
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
  ctx.strokeStyle = color; ctx.lineWidth = width || 2;
  if (dash) ctx.setLineDash(dash);
  ctx.stroke(); ctx.setLineDash([]);
}
function ray(ctx, a, b, color, width) {
  line(ctx, a, b, color, width || 2.5);
  const mx = a[0] + (b[0] - a[0]) * 0.58, my = a[1] + (b[1] - a[1]) * 0.58;
  const d = vUnit(b[0] - a[0], b[1] - a[1]);
  const p = [-d[1], d[0]];
  const s = 9;
  line(ctx, [mx, my], [mx - s * d[0] + s * 0.45 * p[0], my - s * d[1] + s * 0.45 * p[1]], color, width || 2.5);
  line(ctx, [mx, my], [mx - s * d[0] - s * 0.45 * p[0], my - s * d[1] - s * 0.45 * p[1]], color, width || 2.5);
}
function vUnit(x, y) { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; }
function text(ctx, str, x, y, color, size, align) {
  ctx.font = (size || 13) + 'px system-ui,sans-serif';
  ctx.fillStyle = color || muted; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}
function tag(ctx, str, x, y, color, size) {
  const s = size || 13;
  ctx.font = s + 'px system-ui,sans-serif';
  const w = ctx.measureText(str).width;
  ctx.fillStyle = 'rgba(13,17,23,.8)';
  ctx.fillRect(x - w / 2 - 4, y - s / 2 - 3, w + 8, s + 6);
  text(ctx, str, x, y, color, s);
}
function dot(ctx, p, color, r) {
  ctx.beginPath(); ctx.arc(p[0], p[1], r || 6, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
}
function animate(dur, fn, done) {
  const t0 = performance.now();
  function fr(now) {
    const p = Math.min(1, (now - t0) / dur);
    fn(p);
    if (p < 1) requestAnimationFrame(fr); else if (done) done();
  }
  requestAnimationFrame(fr);
}
// 蜡烛火焰：tip 为焰尖、base 为焰根（正立时 tip 在上，倒像里 tip 在下，两向通用）
function flame(ctx, x, tipY, baseY, scale) {
  const w = 10 * (scale || 1);
  ctx.beginPath();
  ctx.moveTo(x, tipY);
  ctx.bezierCurveTo(x + w, tipY + (baseY - tipY) * 0.45, x + w * 0.7, baseY, x, baseY);
  ctx.bezierCurveTo(x - w * 0.7, baseY, x - w, tipY + (baseY - tipY) * 0.45, x, tipY);
  ctx.fillStyle = orange; ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, tipY + (baseY - tipY) * 0.68, w * 0.38, Math.abs(baseY - tipY) * 0.22, 0, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffe9a8'; ctx.fill();
}
function candleBody(ctx, x, topY, baseY, w) {
  ctx.fillStyle = '#dfe7f2';
  ctx.fillRect(x - w / 2, topY, w, baseY - topY);
  ctx.fillStyle = '#aebdd2';
  ctx.fillRect(x - w / 2, topY, w, 3);
}

/* ---------- 第 0 步：光走直线，影子作证 ---------- */
const S0PT = [64, 165], SCR0 = 436, DISC_R = 58, SCR_TOP = 24, SCR_BOT = 306;
function s0Targets() {
  const out = [];
  for (let i = 0; i <= 12; i++) out.push([SCR0, 28 + i * (302 - 28) / 12]);
  return out;
}
function render0() {
  const st = S.s0, ctx = scene('s0-canvas', 480, 330);
  const discTop = S0PT[1] - DISC_R, discBot = S0PT[1] + DISC_R;
  const sh = shadowEdges(S0PT, st.discX, discTop, discBot, SCR0);
  const p = st.fly;
  // 屏
  line(ctx, [SCR0, SCR_TOP], [SCR0, SCR_BOT], '#c9d4e2', 3);
  text(ctx, t('cScreen'), SCR0 - 4, 14, muted, 13);
  // 影子（光到达屏后才成形：alpha 随飞行进度长出）
  const shTop = clamp(sh.top, SCR_TOP, SCR_BOT), shBot = clamp(sh.bot, SCR_TOP, SCR_BOT);
  if (shBot > shTop) {
    ctx.save();
    ctx.globalAlpha = clamp((p - 0.75) / 0.25, 0, 1);
    ctx.fillStyle = 'rgba(2,6,12,.88)';
    ctx.fillRect(SCR0 - 5, shTop, 10, shBot - shTop);
    ctx.restore();
    if (p >= 1) tag(ctx, t('cShadow'), SCR0 - 26, (shTop + shBot) / 2, '#e8edf4', 12.5);
  }
  // 两条边缘线（延长线，虚线，画在扇形光线下面）
  line(ctx, S0PT, [SCR0, sh.top], 'rgba(255,180,84,.55)', 1.6, [7, 6]);
  line(ctx, S0PT, [SCR0, sh.bot], 'rgba(255,180,84,.55)', 1.6, [7, 6]);
  // 扇形光线：终点全部由 rayEnd 实算（被挡的停在挡板上）
  s0Targets().forEach(tg => {
    const r = rayEnd(S0PT, tg, st.discX, discTop, discBot);
    const cur = [lerp(S0PT[0], r.end[0], p), lerp(S0PT[1], r.end[1], p)];
    line(ctx, S0PT, cur, 'rgba(110,231,255,.5)', 1.8);
    if (p < 1) dot(ctx, cur, cyan, 3);
    else if (r.blocked) dot(ctx, r.end, cyan, 2.6);
  });
  // 挡板（圆片侧面：竖直圆角条）
  ctx.fillStyle = '#8fa3bd';
  ctx.beginPath();
  ctx.roundRect(st.discX - 6, discTop, 12, DISC_R * 2, 6);
  ctx.fill();
  text(ctx, t('cBlock'), st.discX, discBot + 18, muted, 13);
  // 灯泡
  dot(ctx, S0PT, '#fff2cc', 7);
  ctx.beginPath(); ctx.arc(S0PT[0], S0PT[1], 12, 0, 2 * Math.PI); ctx.strokeStyle = orange; ctx.lineWidth = 1.6; ctx.stroke();
  text(ctx, t('cLamp'), S0PT[0], S0PT[1] - 24, '#e8edf4', 13);
  ctx.restore();
  $('s0-disc-val').textContent = st.discX;
  $('s0-play').disabled = st.flying;
  // 读数口径：不用画布内部坐标，改报影子在屏上的相对位置——屏顶为 0、屏底为 100
  // （屏高均分 100 份），取屏上实际成形的影子带上下沿（已钳制的 shTop/shBot，与画面同源）
  const pct = y => fmt0((y - SCR_TOP) / (SCR_BOT - SCR_TOP) * 100);
  ro('s0-ro', t('s0ro', { topPct: pct(shTop), botPct: pct(shBot) }));
  ro('s0-ro2', st.flying ? t('s0roFly', { pct: Math.round(p * 100) }) : (st.flown ? t('s0roDone') : ''));
}
function setDisc(x) {
  S.s0.discX = clamp(Math.round(x), 180, 330);
  $('s0-disc').value = S.s0.discX;
  if (S.s0.flying) { S.s0.flying = false; S.s0.fly = 1; S.s0.flown = true; }
  render0();
}
function playFly() {
  if (S.s0.flying) return;
  S.s0.flying = true; S.s0.flown = false; S.s0.fly = 0;
  animate(1500, p => { S.s0.fly = p; render0(); }, () => {
    S.s0.flying = false; S.s0.flown = true; S.s0.fly = 1; render0();
  });
}

/* ---------- 第 1 步：小孔倒像 ---------- */
const A1 = [84, 105], B1 = [84, 225], O1 = [240, 165], SCR1 = 396;
const ENDS1 = imageEnds(A1, B1, O1, SCR1);
function drawCandle1(ctx) {
  candleBody(ctx, 84, 168, 225, 15);
  flame(ctx, 84, 105, 168, 1.15);
  line(ctx, [84, 168], [84, 162], '#455568', 2);
  dot(ctx, A1, orange, 4.5); text(ctx, 'A', 66, 100, orange, 14);
  dot(ctx, B1, cyan, 4.5); text(ctx, 'B', 66, 228, cyan, 14);
  text(ctx, t('cCandle'), 84, 244, muted, 13);
}
function drawBoard(ctx, x, yTop, yBot, holeY, gapHalf, w) {
  ctx.fillStyle = '#455568';
  ctx.fillRect(x - w / 2, yTop, w, (holeY - gapHalf) - yTop);
  ctx.fillRect(x - w / 2, holeY + gapHalf, w, yBot - (holeY + gapHalf));
  ctx.fillStyle = '#6b7f9e';
  ctx.fillRect(x - w / 2, yTop, w, 2.5);
  ctx.fillRect(x - w / 2, yBot - 2.5, w, 2.5);
}
function drawImageGlyph(ctx, x, top, bot, alpha) {
  const h = bot - top;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(255,180,84,.16)';
  ctx.fillRect(x - 7, top, 14, h);
  line(ctx, [x, top], [x, bot], orange, 3);
  // 倒像：焰尖在下端、朝下
  const fl = clamp(h * 0.32, 8, 30);
  flame(ctx, x, bot, bot - fl, 0.8);
  ctx.restore();
}
function rayPath(ctx, P, O, E, p, color) {
  // P→O→E 两段直线，按弧长比例画到 p；返回当前头部位置
  const L1 = Math.hypot(O[0] - P[0], O[1] - P[1]), L2 = Math.hypot(E[0] - O[0], E[1] - O[1]);
  const total = L1 + L2, d = clamp(p, 0, 1) * total;
  if (d <= L1) {
    const q = L1 ? d / L1 : 1;
    const cur = [lerp(P[0], O[0], q), lerp(P[1], O[1], q)];
    line(ctx, P, cur, color, 2.5);
    return cur;
  }
  line(ctx, P, O, color, 2.5);
  const q = L2 ? (d - L1) / L2 : 1;
  const cur = [lerp(O[0], E[0], q), lerp(O[1], E[1], q)];
  line(ctx, O, cur, color, 2.5);
  return cur;
}
function drawTopView(ctx) {
  const x0 = 292, y0 = 254, w = 172, h = 86;
  ctx.fillStyle = '#1c2330';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#2b3547'; ctx.lineWidth = 1.2; ctx.strokeRect(x0, y0, w, h);
  text(ctx, t('cTopView'), x0 + 8, y0 + 11, muted, 11, 'left');
  const objX = x0 + 18, holeX = x0 + 84, scrX = x0 + 154, midY = y0 + 50;
  const L = [objX, midY - 18], R = [objX, midY + 18], Hc = [holeX, midY];
  const landL = lineYatX(L[0], L[1], Hc[0], Hc[1], scrX);
  const landR = lineYatX(R[0], R[1], Hc[0], Hc[1], scrX);
  // 挡板与屏
  ctx.fillStyle = '#455568';
  ctx.fillRect(holeX - 2, y0 + 24, 4, (midY - 4) - (y0 + 24));
  ctx.fillRect(holeX - 2, midY + 4, 4, (y0 + h - 6) - (midY + 4));
  line(ctx, [scrX, y0 + 24], [scrX, y0 + h - 6], '#c9d4e2', 2.5);
  // 两条边光线：左→右下、右→左上（俯视实算）
  line(ctx, L, [scrX, landL], 'rgba(110,231,255,.75)', 1.8);
  line(ctx, R, [scrX, landR], 'rgba(255,180,84,.75)', 1.8);
  dot(ctx, L, cyan, 3.4); dot(ctx, R, orange, 3.4);
  dot(ctx, [scrX, landL], cyan, 3.4); dot(ctx, [scrX, landR], orange, 3.4);
  text(ctx, t('cLeft'), objX, L[1] - 10, cyan, 11);
  text(ctx, t('cRight'), objX, R[1] + 10, orange, 11);
  text(ctx, t('cLeft'), scrX, landL + 11, cyan, 11);
  text(ctx, t('cRight'), scrX, landR - 11, orange, 11);
  dot(ctx, Hc, '#e8edf4', 2.6);
}
function render1() {
  const st = S.s1, ctx = scene('s1-canvas', 480, 350);
  // 屏
  line(ctx, [SCR1, 20], [SCR1, 240], '#c9d4e2', 3);
  text(ctx, t('cScreen'), SCR1 + 2, 12, muted, 12.5);
  drawBoard(ctx, O1[0], 20, 240, O1[1], 5, 9);
  text(ctx, t('cHole'), O1[0], 258, muted, 13);
  drawCandle1(ctx);
  const E_A = [SCR1, ENDS1.fromA], E_B = [SCR1, ENDS1.fromB];
  // 像：两条都点亮后落定（长出来）；只亮一条时先落一个端点
  if (st.lit >= 2) drawImageGlyph(ctx, SCR1, ENDS1.top, ENDS1.bot, 0.95);
  // 光线（A 橙、B 青，与端点标记同色）
  const rays = [
    { P: A1, E: E_A, color: orange },
    { P: B1, E: E_B, color: cyan }
  ];
  rays.forEach((r, i) => {
    if (i < st.lit) { rayPath(ctx, r.P, O1, r.E, 1, r.color); dot(ctx, r.E, r.color, 4.5); }
    else if (i === st.animRay) {
      const head = rayPath(ctx, r.P, O1, r.E, st.animP, r.color);
      dot(ctx, head, r.color, 4);
    }
  });
  if (st.lit >= 1) {
    ctx.beginPath(); ctx.arc(O1[0], O1[1], 9, 0, 2 * Math.PI); ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 1.6; ctx.stroke();
    dot(ctx, O1, '#e8edf4', 3);
    text(ctx, t('cImage'), SCR1 + 26, 165, orange, 13);
  }
  drawTopView(ctx);
  ctx.restore();
  const btn = $('s1-light');
  btn.disabled = st.lit >= 2 || st.animRay >= 0;
  btn.textContent = st.lit === 0 ? t('s1light') : st.lit === 1 ? t('s1light2') : t('s1litDone');
  ro('s1-ro', st.lit === 0 ? t('s1ro0')
    : st.lit === 1 ? t('s1ro1', { y: fmt0(ENDS1.fromA) })
    : t('s1ro2', { y: fmt0(ENDS1.fromB) }));
}
function lightNext() {
  const st = S.s1;
  if (st.lit >= 2 || st.animRay >= 0) return;
  st.animRay = st.lit; st.animP = 0;
  animate(600, p => { st.animP = p; render1(); }, () => {
    st.lit++; st.animRay = -1; st.animP = 1; render1();
  });
}

/* ---------- 第 2 步：像的大小 ---------- */
const CX2 = 56, GROUND2 = 252;
function s2geo() {
  const st = S.s2;
  const A = [CX2, GROUND2 - st.H], B = [CX2, GROUND2];
  const O = [CX2 + st.u, GROUND2 - st.H / 2];
  const scrX = CX2 + st.u + st.v;
  return { A: A, B: B, O: O, scrX: scrX, ends: imageEnds(A, B, O, scrX) };
}
function render2() {
  const st = S.s2, g = s2geo(), ctx = scene('s2-canvas', 480, 330);
  // 地面
  line(ctx, [16, GROUND2], [464, GROUND2], '#2b3547', 2);
  // 屏
  line(ctx, [g.scrX, 36], [g.scrX, GROUND2], '#c9d4e2', 3);
  text(ctx, t('cScreen'), g.scrX, 24, muted, 12.5);
  // 挡板与孔
  drawBoard(ctx, g.O[0], 36, GROUND2, g.O[1], 5, 9);
  text(ctx, t('cHole'), g.O[0], GROUND2 + 16, muted, 12);
  dot(ctx, g.O, '#e8edf4', 3);
  // 蜡烛
  const flLen = clamp(st.H * 0.34, 10, 26);
  candleBody(ctx, CX2, GROUND2 - st.H + flLen, GROUND2, 15);
  flame(ctx, CX2, GROUND2 - st.H, GROUND2 - st.H + flLen, clamp(st.H / 55, 0.7, 1.2));
  text(ctx, t('cCandle'), CX2, GROUND2 + 16, muted, 12);
  // 两条关键光线（连线实算）
  ray(ctx, g.A, g.O, orange, 2.4);
  line(ctx, g.O, [g.scrX, g.ends.fromA], orange, 2.4);
  ray(ctx, g.B, g.O, cyan, 2.4);
  line(ctx, g.O, [g.scrX, g.ends.fromB], cyan, 2.4);
  dot(ctx, g.A, orange, 4); dot(ctx, g.B, cyan, 4);
  // 像
  drawImageGlyph(ctx, g.scrX, g.ends.top, g.ends.bot, 0.95);
  dot(ctx, [g.scrX, g.ends.fromA], orange, 4);
  dot(ctx, [g.scrX, g.ends.fromB], cyan, 4);
  // 尺寸标注：H（左）、u / v（下，两行错开防撞）
  line(ctx, [30, GROUND2 - st.H], [30, GROUND2], muted, 1.3);
  line(ctx, [26, GROUND2 - st.H], [34, GROUND2 - st.H], muted, 1.3);
  line(ctx, [26, GROUND2], [34, GROUND2], muted, 1.3);
  text(ctx, 'H', 18, GROUND2 - st.H / 2, muted, 12.5);
  line(ctx, [CX2, 282], [g.O[0], 282], muted, 1.3);
  line(ctx, [CX2, 278], [CX2, 286], muted, 1.3);
  line(ctx, [g.O[0], 278], [g.O[0], 286], muted, 1.3);
  text(ctx, 'u = ' + st.u, (CX2 + g.O[0]) / 2, 282, muted, 12.5);
  line(ctx, [g.O[0], 304], [g.scrX, 304], muted, 1.3);
  line(ctx, [g.O[0], 300], [g.O[0], 308], muted, 1.3);
  line(ctx, [g.scrX, 300], [g.scrX, 308], muted, 1.3);
  text(ctx, 'v = ' + st.v, (g.O[0] + g.scrX) / 2, 304, muted, 12.5);
  ctx.restore();
  $('s2-h-val').textContent = st.H + ' cm';
  $('s2-u-val').textContent = st.u + ' cm';
  $('s2-v-val').textContent = st.v + ' cm';
  const h = imgH(st.H, st.u, st.v);
  const eq = Math.abs(st.H * (Math.round(st.v / st.u * 100) / 100) - h) < 0.051 ? '=' : '≈';
  ro('s2-ro', t('s2ro', { h: fmt1(h), H: st.H, ratio: fmt2(st.v / st.u), eq: eq }));
}
function set2(patch) {
  const st = S.s2;
  if (patch.H !== undefined) st.H = clamp(Math.round(patch.H), 30, 90);
  if (patch.u !== undefined) st.u = clamp(Math.round(patch.u), 60, 180);
  if (patch.v !== undefined) st.v = clamp(Math.round(patch.v), 60, 180);
  $('s2-h').value = st.H; $('s2-u').value = st.u; $('s2-v').value = st.v;
  render2();
}

/* ---------- 第 3 步：孔变大会怎样 ---------- */
const A3 = [64, 180], B3 = [64, 252], U3 = 140, V3 = 170;
const HOLE3X = A3[0] + U3, HOLEY3 = 216, SCR3 = HOLE3X + V3;
const ENDS3 = imageEnds(A3, B3, [HOLE3X, HOLEY3], SCR3);
function render3() {
  const st = S.s3, d = st.d, ctx = scene('s3-canvas', 480, 330);
  // 屏
  line(ctx, [SCR3, 36], [SCR3, GROUND2], '#c9d4e2', 3);
  text(ctx, t('cScreen'), SCR3, 24, muted, 12.5);
  // 小孔时的像（虚线轮廓，作参照）
  ctx.strokeStyle = muted; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
  ctx.strokeRect(SCR3 - 7, ENDS3.top, 14, ENDS3.h);
  ctx.setLineDash([]);
  tag(ctx, t('cIdeal'), SCR3 + 34, ENDS3.top + 8, muted, 11.5);
  // 挡板（孔随 d 开合）
  drawBoard(ctx, HOLE3X, 36, GROUND2, HOLEY3, d / 2, 9);
  text(ctx, t('cHole'), HOLE3X, GROUND2 + 16, muted, 12);
  // 地面与蜡烛
  line(ctx, [16, GROUND2], [464, GROUND2], '#2b3547', 2);
  candleBody(ctx, A3[0], 214, 252, 15);
  flame(ctx, A3[0], 180, 214, 1.1);
  text(ctx, t('cCandle'), A3[0], GROUND2 + 16, muted, 12);
  dot(ctx, A3, orange, 4); dot(ctx, B3, cyan, 4);
  // 本步场景距离标注：u / v 从场景常数实读，与读数行同源（标注样式同第 2 步）
  line(ctx, [A3[0], 288], [HOLE3X, 288], muted, 1.3);
  line(ctx, [A3[0], 284], [A3[0], 292], muted, 1.3);
  line(ctx, [HOLE3X, 284], [HOLE3X, 292], muted, 1.3);
  text(ctx, 'u = ' + U3, (A3[0] + HOLE3X) / 2, 288, muted, 12.5);
  line(ctx, [HOLE3X, 306], [SCR3, 306], muted, 1.3);
  line(ctx, [HOLE3X, 302], [HOLE3X, 310], muted, 1.3);
  line(ctx, [SCR3, 302], [SCR3, 310], muted, 1.3);
  text(ctx, 'v = ' + V3, (HOLE3X + SCR3) / 2, 306, muted, 12.5);
  // 两点各 3 条代表光线 + 光斑（落点逐条实算）
  const pts = [
    { P: A3, color: orange, rgb: '255,180,84' },
    { P: B3, color: cyan, rgb: '110,231,255' }
  ];
  let spots = [];
  pts.forEach(({ P, color, rgb }) => {
    const lands = spotLandings(P, HOLE3X, HOLEY3, d, SCR3);
    const lo = Math.min.apply(null, lands), hi = Math.max.apply(null, lands);
    spots.push({ lo: lo, hi: hi, mid: lands[1] });
    [-d / 2, 0, d / 2].forEach((off, i) => {
      const E = [HOLE3X, HOLEY3 + off];
      ctx.save();
      ctx.globalAlpha = i === 1 ? 0.95 : 0.55;
      line(ctx, P, E, color, i === 1 ? 2.1 : 1.6);
      line(ctx, E, [SCR3, lands[i]], color, i === 1 ? 2.1 : 1.6);
      ctx.restore();
    });
    ctx.save();
    ctx.fillStyle = 'rgba(' + rgb + ',.30)';
    ctx.fillRect(SCR3 - 6, lo, 12, Math.max(hi - lo, 2));
    ctx.restore();
    line(ctx, [SCR3 - 7, lands[1]], [SCR3 + 7, lands[1]], color, 2.6);
  });
  tag(ctx, t('cSpot'), SCR3 + 26, spots[0].mid, orange, 11.5);
  ctx.restore();
  $('s3-d-val').textContent = d;
  const w = spotWidth(d, U3, V3);
  const sep = Math.abs(spots[0].mid - spots[1].mid);
  const overlap = !(spots[0].hi < spots[1].lo || spots[1].hi < spots[0].lo);
  ro('s3-ro', t('s3ro', { w: fmt1(w), sep: fmt1(sep), u: fmt0(U3), v: fmt0(V3), d: d, overlap: t(overlap ? 's3roOverlap' : 's3roNoOverlap') }));
  ro('s3-ro2', t('s3ro2', { k: fmt1((d / 4) * (d / 4)) }));
}
function set3(d) {
  S.s3.d = clamp(Math.round(d / 2) * 2, 4, 64);
  $('s3-d').value = S.s3.d;
  render3();
}

/* ---------- 第 4 步：自测 ---------- */
function renderQuiz() {
  ['q1', 'q2', 'q3', 'q4'].forEach(q => {
    const st = S.quiz[q];
    for (let i = 0; i < 3; i++) {
      const b = $(q + '-o' + i);
      b.disabled = st.done;
      b.classList.toggle('active', st.done && i === QANS[q]);
      b.setAttribute('aria-pressed', String(st.picked === i));
    }
    let msg = '';
    if (st.done) msg = t('fbRight') + ' ' + t(q + 'why');
    else if (st.picked !== null) msg = t(QWRONG[q][st.picked]);
    ro(q + '-ro', msg);
  });
  const qs = ['q1', 'q2', 'q3', 'q4'];
  const done = qs.filter(q => S.quiz[q].done).length;
  const first = qs.filter(q => S.quiz[q].done && S.quiz[q].tries === 1).length;
  const anyTry = qs.some(q => S.quiz[q].tries > 0);
  ro('q-score', anyTry ? t('score', { k: done, f: first }) : t('scoreIdle'));
  // 终章提示门控：四题全对才渲染进 DOM，此前保持为空
  const gate = $('quiz-gate');
  const want = done === 4 ? t('gateDone') : '';
  if (gate.textContent !== want) gate.textContent = want;
}
function renderAll() {
  const sb = $('stageBadge');
  if (sb && window.KNOWLEDGE_STAGES) {
    const item = window.KNOWLEDGE_STAGES.find(x => x.id === 'primary');
    if (item) sb.textContent = item.name[getLang()];
  }
  render0(); render1(); render2(); render3(); renderQuiz();
}

/* ---------- 拖拽 ---------- */
const dragResets = [];
function clearAllDrags() { dragResets.forEach(f => f()); }
function drag(id, fn, opts) {
  const cv = $(id);
  cv.classList.add('dragc');
  let pointer = null;
  dragResets.push(() => { pointer = null; });
  function toLogical(e) {
    const r = cv.getBoundingClientRect(), v = cv._view;
    if (!v) return null;
    return [(e.clientX - r.left - v.ox) / v.scale, (e.clientY - r.top - v.oy) / v.scale];
  }
  function apply(e) {
    const p = toLogical(e);
    if (p) fn(p[0], p[1]);
  }
  function release(e) {
    if (e && e.pointerId !== undefined && pointer !== null && e.pointerId !== pointer) return;
    pointer = null;
  }
  function move(e) {
    if (pointer === null || e.pointerId !== pointer) return;
    if (!e.buttons) { pointer = null; return; }
    apply(e);
  }
  cv.addEventListener('pointerdown', e => {
    if (pointer !== null) return;
    if (opts && opts.grab) {
      const p = toLogical(e);
      if (!p || !opts.grab(p[0], p[1])) return;
    }
    pointer = e.pointerId;
    try { cv.setPointerCapture(pointer); } catch (err) { /* 合成事件无活动指针时忽略 */ }
    apply(e);
  });
  cv.addEventListener('pointermove', move);
  cv.addEventListener('pointerup', release);
  cv.addEventListener('pointercancel', release);
  cv.addEventListener('lostpointercapture', release);
}
// 第 2 步多手柄拖拽：按下点离哪个手柄近就拖哪个（焰尖 H / 挡板 u / 屏 v）
function dragS2() {
  const cv = $('s2-canvas');
  cv.classList.add('dragc');
  let pointer = null, mode = null;
  dragResets.push(() => { pointer = null; mode = null; });
  function toLogical(e) {
    const r = cv.getBoundingClientRect(), v = cv._view;
    if (!v) return null;
    return [(e.clientX - r.left - v.ox) / v.scale, (e.clientY - r.top - v.oy) / v.scale];
  }
  cv.addEventListener('pointerdown', e => {
    if (pointer !== null) return;
    const p = toLogical(e);
    if (!p) return;
    const g = s2geo();
    const cands = [
      { m: 'H', d: Math.hypot(p[0] - g.A[0], p[1] - g.A[1]) },
      { m: 'u', d: Math.abs(p[0] - g.O[0]) },
      { m: 'v', d: Math.abs(p[0] - g.scrX) }
    ].sort((a, b) => a.d - b.d);
    if (cands[0].d > 34) return;
    mode = cands[0].m;
    pointer = e.pointerId;
    try { cv.setPointerCapture(pointer); } catch (err) { /* 忽略 */ }
    apply(p);
  });
  function apply(p) {
    if (mode === 'H') set2({ H: GROUND2 - p[1] });
    else if (mode === 'u') set2({ u: p[0] - CX2 });
    else if (mode === 'v') set2({ v: p[0] - CX2 - S.s2.u });
  }
  cv.addEventListener('pointermove', e => {
    if (pointer === null || e.pointerId !== pointer) return;
    if (!e.buttons) { pointer = null; mode = null; return; }
    const p = toLogical(e);
    if (p) apply(p);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => {
    cv.addEventListener(ev, e => {
      if (e.pointerId !== undefined && pointer !== null && e.pointerId !== pointer) return;
      pointer = null; mode = null;
    });
  });
}
function bind() {
  $('s0-disc').addEventListener('input', e => setDisc(Number(e.target.value)));
  $('s0-play').onclick = playFly;
  $('s0-reset').onclick = () => { S.s0.flying = false; S.s0.fly = 1; S.s0.flown = false; setDisc(250); };
  drag('s0-canvas', x => setDisc(x), {
    grab: (x, y) => Math.abs(x - S.s0.discX) <= 30 && y >= S0PT[1] - DISC_R - 16 && y <= S0PT[1] + DISC_R + 16
  });
  $('s1-light').onclick = lightNext;
  $('s1-reset').onclick = () => { S.s1.lit = 0; S.s1.animRay = -1; S.s1.animP = 1; render1(); };
  $('s2-h').addEventListener('input', e => set2({ H: Number(e.target.value) }));
  $('s2-u').addEventListener('input', e => set2({ u: Number(e.target.value) }));
  $('s2-v').addEventListener('input', e => set2({ v: Number(e.target.value) }));
  $('s2-peq').onclick = () => set2({ u: 120, v: 120 });
  $('s2-pu2').onclick = () => set2({ u: 160, v: 80 });
  $('s2-pv2').onclick = () => set2({ u: 80, v: 160 });
  $('s2-reset').onclick = () => set2({ H: 60, u: 120, v: 120 });
  dragS2();
  $('s3-d').addEventListener('input', e => set3(Number(e.target.value)));
  ['q1', 'q2', 'q3', 'q4'].forEach(q => {
    for (let i = 0; i < 3; i++) {
      $(q + '-o' + i).onclick = () => {
        const st = S.quiz[q];
        if (st.done) return;
        st.tries++;
        st.picked = i;
        if (i === QANS[q]) st.done = true;
        renderQuiz();
      };
    }
  });
  const observer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('.nav-step').forEach(a => {
      const active = a.dataset.nav === e.target.dataset.step;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(el => observer.observe(el));
  let queued = false;
  window.addEventListener('resize', () => {
    if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; renderAll(); }); }
  });
}
onLangRefresh(renderAll);
onLangRefresh(clearAllDrags);
window.addEventListener('blur', clearAllDrags);
document.querySelectorAll('.nav-step').forEach(a => a.addEventListener('click', clearAllDrags));
bind();
applyLang(getLang());
// 只读检查面：供数值自查/评审复算，界面仍是唯一改状态路径。
window.PINHOLE = {
  get state() { return JSON.parse(JSON.stringify(S)); },
  imgH: imgH, imageEnds: imageEnds, spotWidth: spotWidth, spotLandings: spotLandings,
  shadowEdges: shadowEdges, rayEnd: rayEnd, lineYatX: lineYatX,
  s2geo: s2geo, ENDS1: ENDS1, ENDS3: ENDS3, QANS: QANS,
  set2: set2, set3: set3, setDisc: setDisc
};
