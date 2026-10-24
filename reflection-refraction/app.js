'use strict';
const $ = id => document.getElementById(id);
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';

/* PURE-BEGIN */
const N_AIR = 1, N_WATER = 1.33;
const RAD = Math.PI / 180, DEG = 180 / Math.PI;
function vLen(x, y) { return Math.hypot(x, y); }
function vUnit(x, y) { const l = vLen(x, y) || 1; return [x / l, y / l]; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
// 反射：d 为入射方向（单位向量），n 为指向入射侧的表面法线（单位向量）
function reflectVec(dx, dy, nx, ny) {
  const d = dx * nx + dy * ny;
  return vUnit(dx - 2 * d * nx, dy - 2 * d * ny);
}
// 折射（向量式斯涅尔）：n 指向入射侧；返回折射方向单位向量，全反射返回 null
function refractVec(dx, dy, nx, ny, n1, n2) {
  const u = vUnit(dx, dy);
  const cos1 = -(u[0] * nx + u[1] * ny);
  const eta = n1 / n2;
  const sin2sq = eta * eta * (1 - cos1 * cos1);
  if (sin2sq > 1) return null;
  const cos2 = Math.sqrt(1 - sin2sq);
  const k = eta * cos1 - cos2;
  return vUnit(eta * u[0] + k * nx, eta * u[1] + k * ny);
}
// 标量斯涅尔：thetaDeg 为入射角（从法线量），返回 {tir, theta}
function snellDeg(n1, n2, thetaDeg) {
  const s = n1 * Math.sin(thetaDeg * RAD) / n2;
  if (s > 1) return { tir: true, theta: null };
  return { tir: false, theta: Math.asin(s) * DEG };
}
function criticalDeg(nFrom, nTo) { return Math.asin(nTo / nFrom) * DEG; }
const CRIT = criticalDeg(N_WATER, N_AIR);
// 一位小数口径全页统一
function fmtDeg(v) { return (Math.round(v * 10) / 10).toFixed(1) + '°'; }
function fmtNum(v) { return (Math.round(v * 10) / 10).toFixed(1); }
// 线段方向与法线的夹角（度）：seg 为从交点出发的向量，n 为该侧法线
function segAngle(sx, sy, nx, ny) {
  const u = vUnit(sx, sy);
  return Math.acos(clamp(u[0] * nx + u[1] * ny, -1, 1)) * DEG;
}
// ---- 第 0 步（反射）：镜面 y=255，交点 O0 ----
const O0 = [240, 255], R0 = 190;
function trace0(thetaDeg) {
  const th = thetaDeg * RAD;
  const S = [O0[0] + R0 * Math.sin(th), O0[1] - R0 * Math.cos(th)];
  const d = vUnit(O0[0] - S[0], O0[1] - S[1]);
  const r = reflectVec(d[0], d[1], 0, -1);
  return {
    S: S, O: O0, incDir: d, reflDir: r,
    reflEnd: [O0[0] + R0 * r[0], O0[1] + R0 * r[1]],
    thetaI: segAngle(S[0] - O0[0], S[1] - O0[1], 0, -1),
    thetaR: segAngle(r[0], r[1], 0, -1)
  };
}
// ---- 第 1 步（漫反射）：平行光束 + 小斜面 ----
const BEAM_DIR = [Math.sin(30 * RAD), Math.cos(30 * RAD)];
const BEAM_STARTS = [[90, 55], [150, 55], [210, 55]];
const FLAT_Y = 240;
const FACETS = [[60, 248], [120, 228], [180, 250], [240, 226], [300, 252], [360, 230], [420, 246]];
function raySegT(px, py, dx, dy, ax, ay, bx, by) {
  const ex = bx - ax, ey = by - ay;
  const den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((ax - px) * ey - (ay - py) * ex) / den;
  const u = ((ax - px) * dy - (ay - py) * dx) / den;
  return (t > 1e-6 && u >= 0 && u <= 1) ? t : null;
}
function facetNormal(ax, ay, bx, by) {
  let n = vUnit(-(by - ay), bx - ax);
  if (n[1] > 0) n = [-n[0], -n[1]];
  return n;
}
function traceBeam(surface) {
  return BEAM_STARTS.map(function (st) {
    let hit = null, n = null;
    if (surface === 'flat') {
      const t = (FLAT_Y - st[1]) / BEAM_DIR[1];
      hit = [st[0] + t * BEAM_DIR[0], FLAT_Y];
      n = [0, -1];
    } else {
      let best = Infinity;
      for (let i = 0; i < FACETS.length - 1; i++) {
        const a = FACETS[i], b = FACETS[i + 1];
        const t = raySegT(st[0], st[1], BEAM_DIR[0], BEAM_DIR[1], a[0], a[1], b[0], b[1]);
        if (t !== null && t < best) { best = t; n = facetNormal(a[0], a[1], b[0], b[1]); }
      }
      if (!isFinite(best)) return null;
      hit = [st[0] + best * BEAM_DIR[0], st[1] + best * BEAM_DIR[1]];
    }
    const r = reflectVec(BEAM_DIR[0], BEAM_DIR[1], n[0], n[1]);
    return { start: st, hit: hit, n: n, reflDir: r, reflEnd: [hit[0] + 185 * r[0], hit[1] + 185 * r[1]] };
  }).filter(Boolean);
}
// ---- 第 2 步（空气→水）：界面 y=165 ----
const O2 = [240, 165], R2 = 140;
function trace2(thetaDeg) {
  const th = thetaDeg * RAD;
  const S = [O2[0] + R2 * Math.sin(th), O2[1] - R2 * Math.cos(th)];
  const d = vUnit(O2[0] - S[0], O2[1] - S[1]);
  const tv = refractVec(d[0], d[1], 0, -1, N_AIR, N_WATER);
  return {
    S: S, O: O2, incDir: d, refrDir: tv,
    refrEnd: [O2[0] + 155 * tv[0], O2[1] + 155 * tv[1]],
    thetaI: segAngle(S[0] - O2[0], S[1] - O2[1], 0, -1),
    thetaR: segAngle(tv[0], tv[1], 0, 1)
  };
}
// ---- 第 3 步（水→空气）：界面 y=150 ----
const O3 = [240, 150], R3 = 140;
function trace3(thetaDeg) {
  const th = thetaDeg * RAD;
  const S = [O3[0] + R3 * Math.sin(th), O3[1] + R3 * Math.cos(th)];
  const d = vUnit(O3[0] - S[0], O3[1] - S[1]);
  const mag = Math.abs(thetaDeg);
  let mode, tv = null, thetaR = null, refrEnd = null, reflEnd = null, rDir = null;
  if (Math.abs(mag - CRIT) <= 1e-9) {
    mode = 'critical';
    thetaR = 90;
    const side = thetaDeg < 0 ? 1 : -1;
    refrEnd = [O3[0] + side * 175, O3[1]];
  } else {
    tv = refractVec(d[0], d[1], 0, 1, N_WATER, N_AIR);
    if (tv === null) {
      mode = 'tir';
      rDir = reflectVec(d[0], d[1], 0, 1);
      reflEnd = [O3[0] + 150 * rDir[0], O3[1] + 150 * rDir[1]];
    } else {
      mode = 'refract';
      thetaR = segAngle(tv[0], tv[1], 0, -1);
      refrEnd = [O3[0] + 155 * tv[0], O3[1] + 155 * tv[1]];
    }
  }
  return {
    S: S, O: O3, incDir: d, mode: mode, refrDir: tv, thetaR: thetaR,
    refrEnd: refrEnd, reflDir: rDir, reflEnd: reflEnd,
    thetaI: segAngle(S[0] - O3[0], S[1] - O3[1], 0, 1)
  };
}
// ---- 第 4 步（鱼与虚像）：界面 y=125，真鱼 F4，1 格 = 40 单位 ----
const IFACE4 = 125, F4 = [170, 265], EYE_Y = 58, UNIT4 = 40;
function trace4(eyeX) {
  const E = [eyeX, EYE_Y], F = F4;
  function crossAt(px) {
    const P = [px, IFACE4];
    const d1 = vUnit(P[0] - F[0], P[1] - F[1]);
    const tv = refractVec(d1[0], d1[1], 0, 1, N_WATER, N_AIR);
    if (tv === null) return null;
    return { P: P, tv: tv, g: tv[0] * (E[1] - P[1]) - tv[1] * (E[0] - P[0]) };
  }
  let lo = null, hi = null, prev = null;
  for (let px = 60; px <= 420; px += 2) {
    const c = crossAt(px);
    if (!c) { prev = null; continue; }
    if (prev && ((prev.g < 0 && c.g >= 0) || (prev.g > 0 && c.g <= 0))) { lo = prev.px; hi = px; break; }
    prev = { px: px, g: c.g };
  }
  let sol = null;
  if (lo !== null) {
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const cm = crossAt(mid), cl = crossAt(lo);
      if (!cm || !cl) break;
      if ((cl.g < 0 && cm.g >= 0) || (cl.g > 0 && cm.g <= 0)) hi = mid; else lo = mid;
    }
    sol = crossAt((lo + hi) / 2);
  }
  if (!sol) sol = crossAt(F[0]);
  const P = sol.P, tv = sol.tv;
  let A;
  if (Math.abs(tv[0]) < 1e-9) A = [F[0], IFACE4 + (F[1] - IFACE4) * N_AIR / N_WATER]; // 正上方看：近轴深度 = 真实深度 / n，与邻近眼位的极限连续
  else {
    const s = (F[0] - P[0]) / (-tv[0]);
    A = [F[0], P[1] - s * tv[1]];
  }
  const d1 = vUnit(P[0] - F[0], P[1] - F[1]);
  return {
    F: F, E: E, P: P, refrDir: tv,
    theta1: segAngle(d1[0], d1[1], 0, -1),
    theta2: segAngle(tv[0], tv[1], 0, -1),
    A: A,
    realDepth: (F[1] - IFACE4) / UNIT4,
    appDepth: (A[1] - IFACE4) / UNIT4,
    residual: Math.abs(sol.g)
  };
}
/* PURE-END */

const S = {
  s0: { theta: -35, side: -1 },
  s1: { mode: 'mirror' },
  s2: { theta: -40, side: -1 },
  s3: { theta: -30, side: -1 },
  s4: { eyeX: 300 },
  quiz: {
    q1: { picked: null, tries: 0, done: false },
    q2: { picked: null, tries: 0, done: false },
    q3: { picked: null, tries: 0, done: false }
  }
};
const QUIZ_ANSWER = { q1: 0, q2: 0, q3: 2 };
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
function arcLabel(ctx, O, u, v, r, label, color) {
  const a1 = Math.atan2(u[1], u[0]);
  let d = Math.atan2(v[1], v[0]) - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  ctx.beginPath(); ctx.arc(O[0], O[1], r, a1, a1 + d, d < 0);
  ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.stroke();
  const m = a1 + d / 2;
  tag(ctx, label, O[0] + (r + 17) * Math.cos(m), O[1] + (r + 17) * Math.sin(m), color, 12.5);
}
function waterFill(ctx, y0, w, h) {
  ctx.fillStyle = 'rgba(103,215,249,.09)';
  ctx.fillRect(0, y0, w, h - y0);
  ctx.beginPath();
  for (let x = 0; x <= w; x += 8) {
    const y = y0 + Math.sin(x / 26) * 1.6;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(103,215,249,.55)'; ctx.lineWidth = 1.6; ctx.stroke();
}
function srcDot(ctx, p) {
  dot(ctx, p, '#fff2cc', 7);
  ctx.beginPath(); ctx.arc(p[0], p[1], 11, 0, 2 * Math.PI); ctx.strokeStyle = orange; ctx.lineWidth = 1.6; ctx.stroke();
}

/* ---------- 第 0 步：镜面反射 ---------- */
function render0() {
  const tr = trace0(S.s0.theta), ctx = scene('s0-canvas', 480, 330);
  // 镜面与镜下斜线
  line(ctx, [30, 255], [450, 255], '#c9d4e2', 3);
  for (let x = 40; x < 450; x += 18) line(ctx, [x, 255], [x - 8, 268], '#455568', 1.4);
  text(ctx, t('cMirror'), 428, 282, muted, 13);
  // 法线
  line(ctx, [240, 46], [240, 255], muted, 1.4, [6, 5]);
  text(ctx, t('cNormal'), 240, 32, muted, 13);
  // 光线：反射线先画（0° 时与入射线重合，入射线盖在上面、箭头方向相反仍可见）
  ray(ctx, tr.O, tr.reflEnd, orange, 2.5);
  ray(ctx, tr.S, tr.O, cyan, 2.5);
  arcLabel(ctx, tr.O, [0, -1], vUnit(tr.S[0] - tr.O[0], tr.S[1] - tr.O[1]), 44, fmtDeg(tr.thetaI), cyan);
  arcLabel(ctx, tr.O, [0, -1], tr.reflDir, 44, fmtDeg(tr.thetaR), orange);
  srcDot(ctx, tr.S);
  ctx.restore();
  ro('s0-ro', t('s0ro', { i: fmtDeg(tr.thetaI), r: fmtDeg(tr.thetaR) }) + (tr.thetaI < 0.05 ? ' ' + t('s0zero') : ''));
}
function setTheta0(deg) {
  S.s0.theta = clamp(deg, -80, 80);
  if (deg !== 0) S.s0.side = deg < 0 ? -1 : 1;
  $('s0-ang').value = Math.abs(Math.round(S.s0.theta));
  render0();
}
/* ---------- 第 1 步：漫反射 ---------- */
function drawBeam(ctx, surface, withLabel, annotate) {
  const traces = traceBeam(surface);
  if (surface === 'flat') line(ctx, [30, 240], [450, 240], '#c9d4e2', 3);
  else {
    ctx.beginPath();
    FACETS.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.strokeStyle = '#c9d4e2'; ctx.lineWidth = 3; ctx.stroke();
  }
  if (withLabel) text(ctx, t('cBeam'), 96, 30, cyan, 13);
  traces.forEach(tr => {
    // 落点小法线：加长（46）加亮，让学生在图上就能对着它量角（评审 S2）
    line(ctx, [tr.hit[0], tr.hit[1]], [tr.hit[0] + 46 * tr.n[0], tr.hit[1] + 46 * tr.n[1]], 'rgba(205,216,232,.92)', 1.7, [7, 4]);
    ray(ctx, tr.start, tr.hit, cyan, 2.2);
  });
  if (annotate && surface === 'rough' && traces[1]) {
    // 中间一条光线补入射/反射角弧：两角都对落点法线由 PURE 的 segAngle 实算，
    // 读数相等——「每条小光线仍守定律」直接在图上对一次账（评审 S2）
    const tr = traces[1];
    const angI = segAngle(-BEAM_DIR[0], -BEAM_DIR[1], tr.n[0], tr.n[1]);
    const angR = segAngle(tr.reflDir[0], tr.reflDir[1], tr.n[0], tr.n[1]);
    arcLabel(ctx, tr.hit, tr.n, [-BEAM_DIR[0], -BEAM_DIR[1]], 34, fmtDeg(angI), cyan);
    arcLabel(ctx, tr.hit, tr.n, tr.reflDir, 34, fmtDeg(angR), orange);
  }
  traces.forEach(tr => { ray(ctx, tr.hit, tr.reflEnd, orange, 2.2); dot(ctx, tr.hit, '#e8edf4', 3); });
}
function render1() {
  const mode = S.s1.mode, ctx = scene('s1-canvas', 480, 330);
  if (mode === 'both') {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 238, 330); ctx.clip(); ctx.translate(4, 82); ctx.scale(0.485, 0.485); drawBeam(ctx, 'flat', false); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(242, 0, 238, 330); ctx.clip(); ctx.translate(242, 82); ctx.scale(0.485, 0.485); drawBeam(ctx, 'rough', false); ctx.restore();
    line(ctx, [240, 14], [240, 316], '#2b3547', 1.4);
    text(ctx, t('s1bMirror'), 120, 24, muted, 14);
    text(ctx, t('s1bRough'), 360, 24, muted, 14);
  } else {
    drawBeam(ctx, mode === 'mirror' ? 'flat' : 'rough', true, mode === 'rough');
  }
  ctx.restore();
  ['mirror', 'rough', 'both'].forEach(m => {
    const b = $('s1-' + m);
    b.classList.toggle('active', mode === m);
    b.setAttribute('aria-pressed', String(mode === m));
  });
  ro('s1-ro', t(mode === 'mirror' ? 's1roMirror' : mode === 'rough' ? 's1roRough' : 's1roBoth'));
}
/* ---------- 第 2 步：空气→水折射 ---------- */
function render2() {
  const tr = trace2(S.s2.theta), ctx = scene('s2-canvas', 480, 330);
  waterFill(ctx, 165, 480, 330);
  text(ctx, t('cAir'), 34, 26, muted, 13.5);
  text(ctx, t('cWater'), 34, 196, cyan, 13.5);
  line(ctx, [240, 26], [240, 306], muted, 1.4, [6, 5]);
  text(ctx, t('cNormal'), 240, 14, muted, 12.5);
  ray(ctx, tr.S, tr.O, cyan, 2.5);
  ray(ctx, tr.O, tr.refrEnd, green, 2.5);
  arcLabel(ctx, tr.O, [0, -1], vUnit(tr.S[0] - tr.O[0], tr.S[1] - tr.O[1]), 42, fmtDeg(tr.thetaI), cyan);
  arcLabel(ctx, tr.O, [0, 1], tr.refrDir, 42, '≈' + fmtDeg(tr.thetaR), green);
  srcDot(ctx, tr.S);
  dot(ctx, tr.O, '#e8edf4', 3.5);
  ctx.restore();
  const bend = tr.thetaI - tr.thetaR;
  ro('s2-ro', t('s2ro', { i: fmtDeg(tr.thetaI), r: fmtDeg(tr.thetaR), d: fmtDeg(bend) }));
  ro('s2-ro2', tr.thetaI < 0.05 ? t('s2zero') : t('s2ro2'));
}
function setTheta2(deg) {
  S.s2.theta = clamp(deg, -80, 80);
  if (deg !== 0) S.s2.side = deg < 0 ? -1 : 1;
  $('s2-ang').value = Math.abs(Math.round(S.s2.theta));
  render2();
}
/* ---------- 第 3 步：水→空气与全反射 ---------- */
function render3() {
  const tr = trace3(S.s3.theta), ctx = scene('s3-canvas', 480, 330);
  waterFill(ctx, 150, 480, 330);
  text(ctx, t('cAir'), 34, 26, muted, 13.5);
  text(ctx, t('cWater'), 34, 182, cyan, 13.5);
  line(ctx, [240, 22], [240, 300], muted, 1.4, [6, 5]);
  text(ctx, t('cNormal'), 240, 12, muted, 12.5);
  ray(ctx, tr.S, tr.O, cyan, 2.5);
  if (tr.mode !== 'tir') {
    // 部分反射：光到界面总有一部分按反射定律弹回水里（淡橙线常在，方向由 PURE 的 reflectVec 对入射方向实算）；
    // 进入全反射时折射部分消失，这条线在下方 TIR 分支转为加粗点亮——过渡连续（评审 S3）
    const rd = reflectVec(tr.incDir[0], tr.incDir[1], 0, 1);
    ray(ctx, tr.O, [tr.O[0] + 150 * rd[0], tr.O[1] + 150 * rd[1]], 'rgba(255,180,84,.35)', 2);
  }
  if (tr.mode === 'refract') {
    ray(ctx, tr.O, tr.refrEnd, green, 2.5);
    arcLabel(ctx, tr.O, [0, -1], tr.refrDir, 42, '≈' + fmtDeg(tr.thetaR), green);
  } else if (tr.mode === 'critical') {
    ray(ctx, tr.O, tr.refrEnd, green, 3);
    tag(ctx, '≈90.0°', (tr.O[0] + tr.refrEnd[0]) / 2, tr.O[1] - 16, green, 12.5);
  } else {
    // 全反射：折射线缺席（本帧根本不画），反射线加粗点亮
    ctx.save();
    ctx.shadowColor = orange; ctx.shadowBlur = 14;
    ray(ctx, tr.O, tr.reflEnd, orange, 4);
    ctx.restore();
    tag(ctx, t('cTIR'), (tr.O[0] + tr.reflEnd[0]) / 2, (tr.O[1] + tr.reflEnd[1]) / 2 - 14, orange, 14);
  }
  arcLabel(ctx, tr.O, [0, 1], vUnit(tr.S[0] - tr.O[0], tr.S[1] - tr.O[1]), 42, fmtDeg(tr.thetaI), cyan);
  srcDot(ctx, tr.S);
  dot(ctx, tr.O, '#e8edf4', 3.5);
  ctx.restore();
  $('s3-pcrit').textContent = t('s3pCrit', { crit: fmtDeg(CRIT) });
  const roEl = $('s3-ro');
  if (tr.mode === 'refract') {
    roEl.classList.remove('alert');
    ro('s3-ro', t('s3roRefr', { i: fmtDeg(tr.thetaI), r: fmtDeg(tr.thetaR) }));
    ro('s3-ro2', t('s3ro2', { crit: fmtDeg(CRIT) }));
  } else if (tr.mode === 'critical') {
    roEl.classList.remove('alert');
    ro('s3-ro', t('s3roCrit', { i: fmtDeg(tr.thetaI), crit: fmtDeg(CRIT) }));
    ro('s3-ro2', '');
  } else {
    roEl.classList.add('alert');
    ro('s3-ro', t('s3roTIR', { i: fmtDeg(tr.thetaI), crit: fmtDeg(CRIT) }));
    ro('s3-ro2', '');
  }
}
function setTheta3(deg) {
  S.s3.theta = clamp(deg, -80, 80);
  if (deg !== 0) S.s3.side = deg < 0 ? -1 : 1;
  $('s3-ang').value = Math.abs(S.s3.theta);
  render3();
}
/* ---------- 第 4 步：鱼、虚像与自测 ---------- */
function drawFish(ctx, F, color, dash) {
  ctx.save();
  if (dash) ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.ellipse(F[0], F[1], 27, 11.5, 0, 0, 2 * Math.PI);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(F[0] - 25, F[1]); ctx.lineTo(F[0] - 40, F[1] - 10); ctx.lineTo(F[0] - 40, F[1] + 10); ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  if (!dash) dot(ctx, [F[0] + 16, F[1] - 3], color, 2.6);
  ctx.restore();
}
function render4() {
  const tr = trace4(S.s4.eyeX), ctx = scene('s4-canvas', 480, 330);
  waterFill(ctx, IFACE4, 480, 330);
  text(ctx, t('cAir'), 34, 26, muted, 13.5);
  text(ctx, t('cWater'), 34, 156, cyan, 13.5);
  // 同一竖直参考线：虚像落在这条线上
  line(ctx, [tr.F[0], IFACE4], [tr.F[0], tr.F[1]], '#455568', 1.2, [4, 5]);
  // 虚像的反向延长线（虚线）先画，光路盖在上面
  line(ctx, tr.P, tr.A, pink, 2, [7, 6]);
  ray(ctx, tr.F, tr.P, cyan, 2.5);
  ray(ctx, tr.P, tr.E, green, 2.5);
  drawFish(ctx, tr.A, pink, true);
  drawFish(ctx, tr.F, cyan, false);
  tag(ctx, t('cFishV'), tr.A[0] + 4, tr.A[1] - 22, pink, 12.5);
  tag(ctx, t('cFish'), tr.F[0] + 4, tr.F[1] + 24, cyan, 12.5);
  dot(ctx, tr.P, '#e8edf4', 3.5);
  // 眼睛
  ctx.beginPath(); ctx.ellipse(tr.E[0], tr.E[1], 13, 8.5, 0, 0, 2 * Math.PI);
  ctx.strokeStyle = '#e8edf4'; ctx.lineWidth = 2; ctx.stroke();
  dot(ctx, tr.E, orange, 4);
  text(ctx, t('cEye'), tr.E[0], tr.E[1] - 20, '#e8edf4', 13);
  ctx.restore();
  ro('s4-ro', t('s4ro', {
    real: fmtNum(tr.realDepth), app: fmtNum(tr.appDepth), diff: fmtNum(tr.realDepth - tr.appDepth)
  }));
}
/* ---------- 自测 ---------- */
function renderQuiz() {
  ['q1', 'q2', 'q3'].forEach(q => {
    const st = S.quiz[q];
    for (let i = 0; i < 3; i++) {
      const b = $(q + '-o' + i);
      b.disabled = st.done;
      b.classList.toggle('active', st.done && i === QUIZ_ANSWER[q]);
      b.setAttribute('aria-pressed', String(st.picked === i));
    }
    let msg = '';
    if (st.done) msg = t('fbRight') + ' ' + t(q + 'why', { crit: fmtDeg(CRIT) });
    else if (st.picked !== null) msg = t('fbWrong');
    ro(q + '-ro', msg);
  });
  $('q3-title').textContent = t('q3t', { crit: fmtDeg(CRIT) });
  const done = ['q1', 'q2', 'q3'].filter(q => S.quiz[q].done).length;
  const first = ['q1', 'q2', 'q3'].filter(q => S.quiz[q].done && S.quiz[q].tries === 1).length;
  const anyTry = ['q1', 'q2', 'q3'].some(q => S.quiz[q].tries > 0);
  ro('q-score', anyTry ? t('score', { k: done, f: first }) : t('scoreIdle'));
}
function renderAll() {
  const sb = $('stageBadge');
  if (sb && window.KNOWLEDGE_STAGES) {
    const item = window.KNOWLEDGE_STAGES.find(x => x.id === 'junior');
    if (item) sb.textContent = item.name[getLang()];
  }
  render0(); render1(); render2(); render3(); render4(); renderQuiz();
}
/* ---------- 拖拽（画布坐标 → 逻辑坐标 → 角度/位置） ----------
   S1 硬化（无行为变更）：结束事件（pointerup/pointercancel/lostpointercapture）按 pointerId
   匹配才复位；pointermove 时若按钮已松开（e.buttons 为 0，说明 pointerup 丢失）立即清状态且
   绝不改值，作为三个结束事件全丢时的兜底；切语言/切步/窗口失焦统一清全部拖拽残留。
   S4 抓取容差：opts.grab 给出「按压点是否落在手柄附近」，不在手柄附近按下不起拖、不改值。 */
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
function bind() {
  $('s0-ang').addEventListener('input', e => setTheta0(S.s0.side * Number(e.target.value)));
  $('s0-p0').onclick = () => setTheta0(0);
  $('s0-p60').onclick = () => setTheta0(S.s0.side * 60);
  $('s0-reset').onclick = () => { S.s0.side = -1; setTheta0(-35); };
  drag('s0-canvas', (x, y) => {
    const dx = x - O0[0], dy = y - O0[1];
    if (dy < -18) setTheta0(clamp(Math.atan2(dx, -dy) * DEG, -80, 80));
  }, { grab: (x, y) => { const s = trace0(S.s0.theta).S; return Math.hypot(x - s[0], y - s[1]) <= 42; } });
  ['mirror', 'rough', 'both'].forEach(m => {
    $('s1-' + m).onclick = () => { S.s1.mode = m; render1(); };
  });
  $('s2-ang').addEventListener('input', e => setTheta2(S.s2.side * Number(e.target.value)));
  $('s2-p0').onclick = () => setTheta2(0);
  $('s2-reset').onclick = () => { S.s2.side = -1; setTheta2(-40); };
  drag('s2-canvas', (x, y) => {
    const dx = x - O2[0], dy = y - O2[1];
    if (dy < -15) setTheta2(clamp(Math.atan2(dx, -dy) * DEG, -80, 80));
  }, { grab: (x, y) => { const s = trace2(S.s2.theta).S; return Math.hypot(x - s[0], y - s[1]) <= 42; } });
  $('s3-ang').addEventListener('input', e => setTheta3(S.s3.side * Number(e.target.value)));
  $('s3-p30').onclick = () => setTheta3(S.s3.side * 30);
  $('s3-pcrit').onclick = () => setTheta3(S.s3.side * CRIT);
  $('s3-p60').onclick = () => setTheta3(S.s3.side * 60);
  $('s3-reset').onclick = () => { S.s3.side = -1; setTheta3(-30); };
  drag('s3-canvas', (x, y) => {
    const dx = x - O3[0], dy = y - O3[1];
    if (dy > 15) setTheta3(clamp(Math.atan2(dx, dy) * DEG, -80, 80));
  }, { grab: (x, y) => { const s = trace3(S.s3.theta).S; return Math.hypot(x - s[0], y - s[1]) <= 42; } });
  $('s4-eye').addEventListener('input', e => { S.s4.eyeX = Number(e.target.value); render4(); });
  drag('s4-canvas', x => {
    S.s4.eyeX = clamp(Math.round(x), 80, 400);
    $('s4-eye').value = S.s4.eyeX;
    render4();
  }, { grab: (x, y) => Math.hypot(x - S.s4.eyeX, y - EYE_Y) <= 42 });
  ['q1', 'q2', 'q3'].forEach(q => {
    for (let i = 0; i < 3; i++) {
      $(q + '-o' + i).onclick = () => {
        const st = S.quiz[q];
        if (st.done) return;
        st.tries++;
        st.picked = i;
        if (i === QUIZ_ANSWER[q]) st.done = true;
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
window.REFRACTION = {
  get state() { return JSON.parse(JSON.stringify(S)); },
  snellDeg: snellDeg, criticalDeg: criticalDeg, fmtDeg: fmtDeg,
  trace0: trace0, trace1: traceBeam, trace2: trace2, trace3: trace3, trace4: trace4,
  CRIT: CRIT
};
