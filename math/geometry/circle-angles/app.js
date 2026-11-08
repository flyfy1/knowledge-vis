'use strict';
const $ = id => document.getElementById(id);
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const fmt1 = v => { const r = Math.round(v*10)/10; return (Object.is(r,-0)?0:r).toFixed(1); };
const cyan='#6ee7ff', orange='#ffb454', pink='#ff7a93', green='#7ee2a8', violet='#c4a7fd', muted='#9aa7b8', ink='#e8edf4';

/* ---------- 纯几何：一切角度由坐标向量夹角实算 ---------- */
const O = [160,168], R = 118;
const norm360 = x => ((x % 360) + 360) % 360;
const circDist = (a,b) => { const d = Math.abs(norm360(a-b)); return Math.min(d, 360-d); };
function ptAt(deg, r) { const rr = r === undefined ? R : r; const a = deg*Math.PI/180; return [O[0] + rr*Math.cos(a), O[1] - rr*Math.sin(a)]; }
function posOf(P) { return norm360(Math.atan2(-(P[1]-O[1]), P[0]-O[0]) * 180/Math.PI); }
/* 顶点 V 处、由 X 与 Y 两点张成的角（度），向量点积实算，恒在 [0,180] */
function angAt(V, X, Y) {
  const ux = X[0]-V[0], uy = X[1]-V[1], vx = Y[0]-V[0], vy = Y[1]-V[1];
  const m = Math.hypot(ux,uy) * Math.hypot(vx,vy);
  if (!m) return NaN;
  return Math.acos(clamp((ux*vx + uy*vy)/m, -1, 1)) * 180/Math.PI;
}
/* 把位置角钳进弧内：弧按数学角逆时针从 start 到 end，离两端至少 m 度 */
function clampArcInterior(pos, start, end, m) {
  const len = norm360(end - start), rel = norm360(pos - start);
  if (rel >= m && rel <= len - m) return norm360(pos);
  const b1 = start + m, b2 = start + len - m;
  return norm360(circDist(pos, b1) <= circDist(pos, b2) ? b1 : b2);
}
/* 全圆钳制：离禁点（A、B 的位置角）至少 2° */
function clampOffPoints(pos, forb) {
  let p = norm360(pos);
  for (const f of forb) {
    if (circDist(p, f) < 2) {
      const c1 = f + 2, c2 = f - 2;
      p = norm360(circDist(p, c1) <= circDist(p, c2) ? c1 : c2);
    }
  }
  return p;
}

/* ---------- 状态 ---------- */
const S = {
  s0: { pos: 250 },
  s1: { central: 80, pos: 250, ledger: [] },
  s2: { central: 80, stage: 0, hl: null },
  s3: { d: 0, pos: 250, ledger: [] },
  s4: { pos: 250 },
  s5: { q: { q1: { pick: null, locked: false }, q2: { pick: null, locked: false }, q3: { pick: null, locked: false } }, q4pos: 90, q4done: false }
};
const ANSWERS = { q1: '40', q2: 'true', q3: '115' };
const AB1 = c => [90 + c/2, 90 - c/2]; // [φA, φB]，劣弧在顶部

/* ---------- 画布脚手架（与 pythagoras 同构） ---------- */
function ro(id, text) { $(id).textContent = text; }
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) cv.dataset.cssH = cv.getAttribute('height') || '360';
  cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.cssH);
  const bw = Math.max(2, Math.round(w*dpr)), bh = Math.max(2, Math.round(h*dpr));
  if (cv.width !== bw) cv.width = bw; if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); cv._w = w; cv._h = h; return ctx;
}
function scene(id, w = 320, h = 340) {
  const cv = $(id), ctx = fitCanvas(cv); ctx.clearRect(0,0,cv._w,cv._h);
  const scale = Math.min(cv._w/w, cv._h/h);
  const ox = (cv._w - w*scale)/2, oy = (cv._h - h*scale)/2;
  ctx.save(); ctx.translate(ox,oy); ctx.scale(scale,scale); cv._view = { w, h, scale, ox, oy }; return ctx;
}
function poly(ctx, pts, fill, stroke = cyan) {
  ctx.beginPath(); pts.forEach((p,i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}
function line(ctx, a, b, color = muted, width = 1.5, dash = null) {
  ctx.beginPath(); if (dash) ctx.setLineDash(dash); ctx.moveTo(...a); ctx.lineTo(...b);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([]);
}
function text(ctx, str, x, y, color = muted, size = 13) {
  ctx.font = `${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function dot(ctx, p, color = orange, r = 6) { ctx.beginPath(); ctx.arc(...p, r, 0, 2*Math.PI); ctx.fillStyle = color; ctx.fill(); }
function ring(ctx, p, color = orange, r = 6) { ctx.beginPath(); ctx.arc(...p, r, 0, 2*Math.PI); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
/* 沿数学角逆时针（画面上即圆弧本身）从 from 到 to 画弧 */
function arcStroke(ctx, from, to, color, width = 3) {
  const len = norm360(to - from), steps = Math.max(2, Math.ceil(len/2));
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) { const p = ptAt(from + len*i/steps); i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function circleBase(ctx) {
  ctx.beginPath(); ctx.arc(O[0], O[1], R, 0, 2*Math.PI); ctx.strokeStyle = '#455568'; ctx.lineWidth = 1.5; ctx.stroke();
  dot(ctx, O, ink, 3.5); text(ctx, 'O', O[0] + 13, O[1] + 15, ink, 13);
}
/* 顶点 V 处 X、Y 之间的角弧（就近一侧）+ 可选数值标签 */
function angArcC(ctx, V, X, Y, r, color, width = 2) {
  const a1 = Math.atan2(X[1]-V[1], X[0]-V[0]);
  let d = Math.atan2(Y[1]-V[1], Y[0]-V[0]) - a1;
  while (d > Math.PI) d -= 2*Math.PI; while (d < -Math.PI) d += 2*Math.PI;
  ctx.beginPath();
  const steps = Math.max(2, Math.ceil(Math.abs(d)/0.05));
  for (let i = 0; i <= steps; i++) { const a = a1 + d*i/steps, px = V[0] + r*Math.cos(a), py = V[1] + r*Math.sin(a); i ? ctx.lineTo(px,py) : ctx.moveTo(px,py); }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function angLabel(ctx, V, X, Y, r, str, color, size = 12) {
  const ux = X[0]-V[0], uy = X[1]-V[1], vx = Y[0]-V[0], vy = Y[1]-V[1];
  let bx = ux/Math.hypot(ux,uy) + vx/Math.hypot(vx,vy), by = uy/Math.hypot(ux,uy) + vy/Math.hypot(vx,vy);
  const bl = Math.hypot(bx,by) || 1;
  text(ctx, str, V[0] + bx/bl*r, V[1] + by/bl*r, color, size);
}
function ptLetter(ctx, P, letter, color, inward = 16) {
  const a = posOf(P) * Math.PI/180;
  text(ctx, letter, P[0] + Math.cos(a)*inward, P[1] - Math.sin(a)*inward, color, 14);
}
function tick(ctx, P, Q) { // 线段 PQ 中点处的等长刻痕
  const mx = (P[0]+Q[0])/2, my = (P[1]+Q[1])/2;
  let dx = Q[0]-P[0], dy = Q[1]-P[1]; const l = Math.hypot(dx,dy) || 1; dx/=l; dy/=l;
  line(ctx, [mx - dy*5, my + dx*5], [mx + dy*5, my - dx*5], ink, 1.6);
}

/* ---------- 第 0 步 ---------- */
function geom0() {
  const [fa, fb] = [140, 40], P = ptAt(S.s0.pos), A = ptAt(fa), B = ptAt(fb);
  return { fa, fb, A, B, P, aob: angAt(O, A, B), apb: angAt(P, A, B) };
}
function render0() {
  const g = geom0(), ctx = scene('s0-canvas');
  circleBase(ctx);
  arcStroke(ctx, g.fb, g.fa, cyan, 3.5);                       // 劣弧高亮
  line(ctx, O, g.A, muted); line(ctx, O, g.B, muted);          // 半径
  line(ctx, g.A, g.B, green, 2);                               // 弦 AB
  line(ctx, g.P, g.A, orange, 1.6); line(ctx, g.P, g.B, orange, 1.6);
  angArcC(ctx, O, g.A, g.B, 30, cyan, 2.2);
  angLabel(ctx, O, g.A, g.B, 52, '∠AOB · ' + t('lbCentral'), cyan, 12);
  angArcC(ctx, g.P, g.A, g.B, 24, orange, 2.2);
  const lp = ptAt(S.s0.pos, R + 20);
  text(ctx, '∠APB · ' + t('lbInscribed'), lp[0], lp[1], orange, 12);
  text(ctx, t('lbMinor'), ...ptAt(90, R + 17), cyan, 12);
  const midOA = [(O[0]+g.A[0])/2, (O[1]+g.A[1])/2];
  text(ctx, t('lbRadius'), midOA[0] - 20, midOA[1] - 6, muted, 12);
  const midAB = [(g.A[0]+g.B[0])/2, (g.A[1]+g.B[1])/2];
  text(ctx, t('lbChord') + ' AB', midAB[0], midAB[1] - 14, green, 12);
  dot(ctx, g.A, cyan); dot(ctx, g.B, pink); dot(ctx, g.P, orange);
  ptLetter(ctx, g.A, 'A', cyan); ptLetter(ctx, g.B, 'B', pink);
  ctx.restore();
  ro('s0-ro', t('s0ro', { aob: fmt1(g.aob), apb: fmt1(g.apb) }));
  $('s0-pos').value = S.s0.pos;
}
function set0(pos) { S.s0.pos = clampOffPoints(pos, [140, 40]); render0(); }

/* ---------- 第 1 步 ---------- */
function geom1() {
  const [fa, fb] = AB1(S.s1.central), A = ptAt(fa), B = ptAt(fb), P = ptAt(S.s1.pos);
  return { fa, fb, A, B, P, aob: angAt(O, A, B), apb: angAt(P, A, B) };
}
function set1Pos(pos) { const [fa, fb] = AB1(S.s1.central); S.s1.pos = clampArcInterior(pos, fa, fb + 360, 2); render1(); }
function render1() {
  const g = geom1(), ctx = scene('s1-canvas');
  circleBase(ctx);
  arcStroke(ctx, g.fb, g.fa, cyan, 3.5);
  line(ctx, O, g.A, muted); line(ctx, O, g.B, muted);
  line(ctx, g.A, g.B, green, 2);
  line(ctx, g.P, g.A, orange, 1.6); line(ctx, g.P, g.B, orange, 1.6);
  angArcC(ctx, O, g.A, g.B, 30, cyan, 2.2);
  angLabel(ctx, O, g.A, g.B, 50, '∠AOB', cyan, 12);
  angArcC(ctx, g.P, g.A, g.B, 24, orange, 2.2);
  const lp = ptAt(S.s1.pos, R + 20);
  text(ctx, '∠APB ' + fmt1(g.apb) + '°', lp[0], lp[1], orange, 12.5);
  dot(ctx, g.A, cyan); dot(ctx, g.B, pink); dot(ctx, g.P, orange);
  ptLetter(ctx, g.A, 'A', cyan); ptLetter(ctx, g.B, 'B', pink);
  ctx.restore();
  ro('s1-ro', t('s1ro', { aob: fmt1(g.aob), apb: fmt1(g.apb), half: fmt1(g.aob/2), diff: fmt1(Math.abs(g.apb - g.aob/2)) }));
  $('s1-pos').value = S.s1.pos; $('s1-central').value = S.s1.central;
  const led = $('s1-ledger');
  if (!S.s1.ledger.length) { led.replaceChildren(Object.assign(document.createElement('p'), { className: 'readout', textContent: t('s1ledgerIdle') })); }
  else led.replaceChildren(...S.s1.ledger.map((e, i) => {
    const p = document.createElement('p'); p.className = 'value-card';
    p.textContent = t('s1entry', { i: i + 1, pos: fmt1(e.pos), aob: fmt1(e.aob), apb: fmt1(e.apb), diff: fmt1(Math.abs(e.apb - e.aob/2)) });
    return p;
  }));
}

/* ---------- 第 2 步（证明） ---------- */
function geom2() {
  const [fa, fb] = AB1(S.s2.central), A = ptAt(fa), B = ptAt(fb), P = ptAt(250), D = ptAt(70);
  return { fa, fb, A, B, P, D,
    aob: angAt(O, A, B), apb: angAt(P, A, B),
    opa: angAt(P, O, A), opb: angAt(P, O, B),
    oap: angAt(A, O, P), obp: angAt(B, O, P),
    aod: angAt(O, A, D), bod: angAt(O, B, D) };
}
function render2() {
  const s = S.s2, g = geom2(), ctx = scene('s2-canvas');
  circleBase(ctx);
  arcStroke(ctx, g.fb, g.fa, cyan, 3);
  line(ctx, O, g.A, muted); line(ctx, O, g.B, muted);
  line(ctx, g.A, g.B, green, 2);
  line(ctx, g.P, g.A, muted, 1.4); line(ctx, g.P, g.B, muted, 1.4);
  if (s.stage >= 2) {
    poly(ctx, [O, g.A, g.P], 'rgba(110,231,255,0.10)', null);
    poly(ctx, [O, g.B, g.P], 'rgba(255,122,147,0.10)', null);
    line(ctx, O, g.A, cyan, 2.4); line(ctx, O, g.B, pink, 2.4);
  }
  if (s.stage >= 1) {
    line(ctx, g.P, g.D, orange, 2);                       // 直径 PD
    tick(ctx, O, g.A); tick(ctx, O, g.B); tick(ctx, O, g.P);
    dot(ctx, g.D, violet); ptLetter(ctx, g.D, 'D', violet);
  }
  if (s.stage >= 2) {
    angArcC(ctx, g.A, O, g.P, 19, cyan, 2); angLabel(ctx, g.A, O, g.P, 33, fmt1(g.oap) + '°', cyan, 11.5);
    angArcC(ctx, g.P, O, g.A, 16, cyan, 2); angLabel(ctx, g.P, O, g.A, 30, fmt1(g.opa) + '°', cyan, 11.5);
    angArcC(ctx, g.B, O, g.P, 19, pink, 2); angLabel(ctx, g.B, O, g.P, 33, fmt1(g.obp) + '°', pink, 11.5);
    angArcC(ctx, g.P, O, g.B, 23, pink, 2); angLabel(ctx, g.P, O, g.B, 40, fmt1(g.opb) + '°', pink, 11.5);
  }
  if (s.stage >= 3) {
    angArcC(ctx, O, g.A, g.D, 36, cyan, 2.2); angLabel(ctx, O, g.A, g.D, 56, '∠AOD ' + fmt1(g.aod) + '°', cyan, 11.5);
    angArcC(ctx, O, g.B, g.D, 46, pink, 2.2); angLabel(ctx, O, g.B, g.D, 66, '∠BOD ' + fmt1(g.bod) + '°', pink, 11.5);
  }
  angArcC(ctx, g.P, g.A, g.B, 30, orange, 1.6);
  if (s.hl) { // 等式项高亮联动
    const H = {
      aob: () => angArcC(ctx, O, g.A, g.B, 30, orange, 4.5),
      aod: () => angArcC(ctx, O, g.A, g.D, 36, orange, 4.5),
      bod: () => angArcC(ctx, O, g.B, g.D, 46, orange, 4.5),
      opa: () => angArcC(ctx, g.P, O, g.A, 16, orange, 4.5),
      opb: () => angArcC(ctx, g.P, O, g.B, 23, orange, 4.5),
      apb: () => angArcC(ctx, g.P, g.A, g.B, 30, orange, 4.5)
    };
    if (H[s.hl]) H[s.hl]();
  }
  dot(ctx, g.A, cyan); dot(ctx, g.B, pink); dot(ctx, g.P, orange);
  ptLetter(ctx, g.A, 'A', cyan); ptLetter(ctx, g.B, 'B', pink); ptLetter(ctx, g.P, 'P', orange);
  ctx.restore();
  const stageText = [t('s2stage0'), t('s2stage1'),
    t('s2stage2', { opa: fmt1(g.opa), opb: fmt1(g.opb) }),
    t('s2stage3', { opa: fmt1(g.opa), opb: fmt1(g.opb), aod: fmt1(g.aod), bod: fmt1(g.bod) }),
    t('s2stage4')][s.stage];
  ro('s2-ro', stageText);
  const eq = $('s2-eq');
  if (s.stage >= 4) {
    const term = (id, label, v) => `<span data-hl="${id}" class="${s.hl === id ? 'hl' : ''}">${label} ${fmt1(v)}°</span>`;
    eq.innerHTML = term('aob', '∠AOB', g.aob) + ' = ' + term('aod', '∠AOD', g.aod) + ' + ' + term('bod', '∠BOD', g.bod) +
      ' = 2 × (' + term('opa', '∠OPA', g.opa) + ' + ' + term('opb', '∠OPB', g.opb) + ') = 2 × ' + term('apb', '∠APB', g.apb);
  } else eq.innerHTML = '';
  $('s2-next').disabled = s.stage >= 4;
  $('s2-central').value = S.s2.central;
}

/* ---------- 第 3 步（直径 / 泰勒斯） ---------- */
function geom3() {
  const d = S.s3.d, hx = Math.sqrt(Math.max(0, R*R - d*d));
  const A = [O[0] - hx, O[1] - d], B = [O[0] + hx, O[1] - d], P = ptAt(S.s3.pos);
  return { A, B, P, fa: posOf(A), fb: posOf(B), apb: angAt(P, A, B) };
}
function set3Pos(pos) { const g = geom3(); S.s3.pos = clampOffPoints(pos, [g.fa, g.fb]); render3(); }
function render3() {
  const g = geom3(), ctx = scene('s3-canvas'), d = S.s3.d;
  circleBase(ctx);
  line(ctx, g.A, g.B, green, 2.2);
  const midAB = [(g.A[0]+g.B[0])/2, (g.A[1]+g.B[1])/2];
  text(ctx, (d === 0 ? t('lbDiameter') : t('lbChord')) + ' AB', midAB[0], midAB[1] - 16, green, 12);
  if (d > 0) line(ctx, O, [O[0], g.A[1]], muted, 1.2);   // 弦离圆心的距离示意
  line(ctx, g.P, g.A, orange, 1.6); line(ctx, g.P, g.B, orange, 1.6);
  angArcC(ctx, g.P, g.A, g.B, 24, orange, 2.2);
  if (d === 0) { // 直角小方框（按 PA、PB 单位向量实画）
    const u = [g.A[0]-g.P[0], g.A[1]-g.P[1]], v = [g.B[0]-g.P[0], g.B[1]-g.P[1]];
    const lu = Math.hypot(...u), lv = Math.hypot(...v), s = 13;
    const U = [u[0]/lu*s, u[1]/lu*s], V = [v[0]/lv*s, v[1]/lv*s];
    poly(ctx, [[g.P[0]+U[0], g.P[1]+U[1]], [g.P[0]+U[0]+V[0], g.P[1]+U[1]+V[1]], [g.P[0]+V[0], g.P[1]+V[1]]], null, orange);
  }
  const lp = ptAt(S.s3.pos, R + 20);
  text(ctx, '∠APB ' + fmt1(g.apb) + '°', lp[0], lp[1], orange, 12.5);
  dot(ctx, g.A, cyan); dot(ctx, g.B, pink); dot(ctx, g.P, orange);
  ptLetter(ctx, g.A, 'A', cyan); ptLetter(ctx, g.B, 'B', pink);
  ctx.restore();
  ro('s3-ro', t('s3ro', { apb: fmt1(g.apb), d }));
  const vd = $('s3-verdict');
  vd.textContent = t(d === 0 ? 's3right' : 's3not');
  vd.style.color = d === 0 ? 'var(--good)' : 'var(--accent3)';
  $('s3-pos').value = S.s3.pos; $('s3-d').value = S.s3.d;
  /* 账本只收直径情形（d=0）的 90° 条目：d>0 时禁用记一笔，与账本标题口径一致 */
  $('s3-record').disabled = d !== 0;
  const led = $('s3-ledger');
  if (!S.s3.ledger.length) { led.replaceChildren(Object.assign(document.createElement('p'), { className: 'readout', textContent: t('s3ledgerIdle') })); }
  else led.replaceChildren(...S.s3.ledger.map(e => {
    const p = document.createElement('p'); p.className = 'value-card';
    p.textContent = t('s3entry', { pos: fmt1(e.pos), apb: fmt1(e.apb) });
    return p;
  }));
}

/* ---------- 第 4 步（换弧互补） ---------- */
function geom4() {
  const [fa, fb] = [130, 50], A = ptAt(fa), B = ptAt(fb), P = ptAt(S.s4.pos);
  const onMinor = norm360(S.s4.pos - fb) <= fa - fb;
  const Pp = ptAt(onMinor ? 250 : 90);
  const minor = angAt(O, A, B), apb = angAt(P, A, B), apb2 = angAt(Pp, A, B);
  return { fa, fb, A, B, P, Pp, onMinor, minor, reflex: 360 - minor, apb, apb2 };
}
function render4() {
  const g = geom4(), ctx = scene('s4-canvas');
  circleBase(ctx);
  if (g.onMinor) arcStroke(ctx, g.fa, g.fb + 360, orange, 4); else arcStroke(ctx, g.fb, g.fa, cyan, 4);
  text(ctx, t('lbMinor'), ...ptAt(90, R + 17), g.onMinor ? muted : cyan, 12);
  text(ctx, t('lbMajor'), ...ptAt(285, R + 17), g.onMinor ? orange : muted, 12);
  line(ctx, O, g.A, muted); line(ctx, O, g.B, muted);
  line(ctx, g.A, g.B, green, 2);
  line(ctx, g.Pp, g.A, muted, 1.3, [4, 4]); line(ctx, g.Pp, g.B, muted, 1.3, [4, 4]);
  line(ctx, g.P, g.A, orange, 1.8); line(ctx, g.P, g.B, orange, 1.8);
  angArcC(ctx, g.P, g.A, g.B, 24, orange, 2.2);
  angArcC(ctx, g.Pp, g.A, g.B, 20, muted, 1.6);
  const lp = ptAt(S.s4.pos, R + 20);
  text(ctx, '∠APB ' + fmt1(g.apb) + '°', lp[0], lp[1], orange, 12.5);
  dot(ctx, g.A, cyan); dot(ctx, g.B, pink); dot(ctx, g.P, orange); ring(ctx, g.Pp, muted, 6);
  ptLetter(ctx, g.A, 'A', cyan); ptLetter(ctx, g.B, 'B', pink);
  const pa = (g.onMinor ? 250 : 90) * Math.PI/180;
  text(ctx, "P′", g.Pp[0] + Math.sin(pa)*30 + Math.cos(pa)*8, g.Pp[1] + Math.cos(pa)*30 - Math.sin(pa)*8, muted, 13);
  ctx.restore();
  ro('s4-ro1', t('s4ro1', { arc: t(g.onMinor ? 'arcNameMinor' : 'arcNameMajor'), apb: fmt1(g.apb), apb2: fmt1(g.apb2), sum: fmt1(g.apb + g.apb2) }));
  ro('s4-ro2', t('s4ro2', { minor: fmt1(g.minor), reflex: fmt1(g.reflex), onMinor: fmt1(g.onMinor ? g.apb : g.apb2), halfReflex: fmt1(g.reflex/2) }));
  $('s4-pos').value = S.s4.pos;
}
function set4Pos(pos) { S.s4.pos = clampOffPoints(pos, [130, 50]); render4(); }

/* ---------- 第 5 步（自测） ---------- */
function geom5() {
  const [fa, fb] = [135, 45], A = ptAt(fa), B = ptAt(fb), P = ptAt(S.s5.q4pos);
  const onMinor = norm360(S.s5.q4pos - fb) <= fa - fb;
  return { fa, fb, A, B, P, onMinor, aob: angAt(O, A, B), apb: angAt(P, A, B) };
}
function render5() {
  const s = S.s5, g = geom5(), ctx = scene('s5-canvas');
  circleBase(ctx);
  arcStroke(ctx, g.fb, g.fa, cyan, 3);
  line(ctx, O, g.A, muted); line(ctx, O, g.B, muted);
  line(ctx, g.A, g.B, green, 2);
  line(ctx, g.P, g.A, orange, 1.6); line(ctx, g.P, g.B, orange, 1.6);
  angArcC(ctx, g.P, g.A, g.B, 24, orange, 2.2);
  angLabel(ctx, O, g.A, g.B, 50, '∠AOB ' + fmt1(g.aob) + '°', cyan, 12);
  const lp = ptAt(s.q4pos, R + 20);
  text(ctx, '∠APB ' + fmt1(g.apb) + '°', lp[0], lp[1], orange, 12.5);
  dot(ctx, g.A, cyan); dot(ctx, g.B, pink); dot(ctx, g.P, orange);
  ptLetter(ctx, g.A, 'A', cyan); ptLetter(ctx, g.B, 'B', pink);
  ctx.restore();
  if (!g.onMinor && Math.abs(g.apb - 45) <= 1) s.q4done = true;   // 达标即锁定
  for (const q of ['q1', 'q2', 'q3']) {
    const st = s.q[q];
    document.querySelectorAll(`[data-q="${q}"]`).forEach(b => {
      b.disabled = st.locked;
      b.setAttribute('aria-pressed', String(st.pick === b.dataset.val));
      b.classList.toggle('locked', st.locked && st.pick === b.dataset.val);
    });
    const fb = $(q + '-fb');
    fb.textContent = st.pick === null ? '' : t(st.locked ? 'correct' : 'incorrect');
    fb.style.color = st.pick === null ? '' : (st.locked ? 'var(--good)' : 'var(--accent3)');
  }
  ro('s5-q4ro', t('q4ro', { apb: fmt1(g.apb), arc: t(g.onMinor ? 'arcNameMinor' : 'arcNameMajor'), state: t(s.q4done ? 'q4done' : 'q4todo') }));
  const k = ['q1', 'q2', 'q3'].filter(q => s.q[q].locked).length + (s.q4done ? 1 : 0);
  ro('s5-score', t('scoreQ', { k }));
  /* 门控：四题全对前，通关文案不写入 DOM */
  $('s5-hint').textContent = k === 4 ? t('s5hint') : '';
  $('s5-pos').value = s.q4pos;
  /* q4 达标锁定后禁用其滑杆（画布拖拽经 set5Pos 守卫），与 q1–q3 锁定一致，
     避免当前读数与「已达标」同行矛盾；重置本步可重新启用 */
  $('s5-pos').disabled = s.q4done;
}
function set5Pos(pos) { if (S.s5.q4done) return; S.s5.q4pos = clampOffPoints(pos, [135, 45]); render5(); }

/* ---------- 装配 ---------- */
function badges() {
  for (const [el, arr, id] of [['categoryBadge', window.KNOWLEDGE_CATEGORIES, 'math'], ['stageBadge', window.KNOWLEDGE_STAGES, 'junior']]) {
    const item = arr.find(x => x.id === id); $(el).textContent = item.name[getLang()];
  }
}
function renderAll() { badges(); render0(); render1(); render2(); render3(); render4(); render5(); }
function drag(id, fn) {
  const cv = $(id); cv.classList.add('dragc'); let pointer = null;
  function move(e) { if (e.pointerId !== pointer) return; const r = cv.getBoundingClientRect(), v = cv._view; fn((e.clientX - r.left - v.ox)/v.scale, (e.clientY - r.top - v.oy)/v.scale); }
  cv.addEventListener('pointerdown', e => { pointer = e.pointerId; cv.setPointerCapture(pointer); move(e); });
  cv.addEventListener('pointermove', move);
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(type, () => pointer = null);
}
function bind() {
  $('s0-pos').oninput = e => set0(Number(e.target.value));
  $('s0-reset').onclick = () => set0(250);
  drag('s0-canvas', (x, y) => set0(posOf([x, y])));

  $('s1-pos').oninput = e => set1Pos(Number(e.target.value));
  $('s1-central').oninput = e => { S.s1.central = Number(e.target.value); set1Pos(S.s1.pos); };
  $('s1-record').onclick = () => { const g = geom1(); S.s1.ledger.push({ pos: S.s1.pos, aob: g.aob, apb: g.apb }); render1(); };
  $('s1-reset').onclick = () => { S.s1 = { central: 80, pos: 250, ledger: [] }; render1(); };
  drag('s1-canvas', (x, y) => set1Pos(posOf([x, y])));

  $('s2-central').oninput = e => { S.s2.central = clamp(Number(e.target.value), 60, 160); render2(); };
  $('s2-next').onclick = () => { S.s2.stage = Math.min(4, S.s2.stage + 1); render2(); };
  $('s2-reset').onclick = () => { S.s2 = { central: 80, stage: 0, hl: null }; render2(); };
  $('s2-eq').addEventListener('click', e => {
    const sp = e.target.closest('[data-hl]'); if (!sp) return;
    S.s2.hl = S.s2.hl === sp.dataset.hl ? null : sp.dataset.hl; render2();
  });

  $('s3-pos').oninput = e => set3Pos(Number(e.target.value));
  $('s3-d').oninput = e => { S.s3.d = Number(e.target.value); set3Pos(S.s3.pos); };
  $('s3-record').onclick = () => { if (S.s3.d !== 0) return; const g = geom3(); S.s3.ledger.push({ pos: S.s3.pos, apb: g.apb }); render3(); };
  $('s3-reset').onclick = () => { S.s3 = { d: 0, pos: 250, ledger: [] }; render3(); };
  drag('s3-canvas', (x, y) => set3Pos(posOf([x, y])));

  $('s4-pos').oninput = e => set4Pos(Number(e.target.value));
  $('s4-reset').onclick = () => set4Pos(250);
  drag('s4-canvas', (x, y) => set4Pos(posOf([x, y])));

  document.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
    const st = S.s5.q[b.dataset.q]; if (st.locked) return;
    st.pick = b.dataset.val; if (st.pick === ANSWERS[b.dataset.q]) st.locked = true;
    render5();
  });
  $('s5-pos').oninput = e => set5Pos(Number(e.target.value));
  $('s5-reset').onclick = () => {
    S.s5 = { q: { q1: { pick: null, locked: false }, q2: { pick: null, locked: false }, q3: { pick: null, locked: false } }, q4pos: 90, q4done: false };
    render5();
  };
  drag('s5-canvas', (x, y) => set5Pos(posOf([x, y])));

  const observer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('.nav-step').forEach(a => {
      const active = a.dataset.nav === e.target.dataset.step;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(el => observer.observe(el));
  let queued = false;
  window.addEventListener('resize', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; renderAll(); }); } });
}
onLangRefresh(renderAll); bind(); applyLang(getLang());
// Read-only inspection surface for numerical review; UI remains the mutation path.
window.CIRCLE = { get state() { return JSON.parse(JSON.stringify(S)); }, angAt, ptAt, posOf, norm360, circDist, clampArcInterior, clampOffPoints, geom0, geom1, geom2, geom3, geom4, geom5 };
