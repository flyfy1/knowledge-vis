'use strict';
// Blood circulation lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every time, volume, speed and colour comes from window.BLOOD_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and short region / chamber labels laid out in fixed slots; numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.BLOOD_MODEL;
const t = (...a) => window.BLOOD_I18N.t(...a);
const lang = () => window.BLOOD_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', red: '#ff5468', blue: '#7b7cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only when there is a decimal point; show −0 as 0.
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };

// Oxygen saturation → colour: blue-violet (30 %) … red (98 %).
function satColor(sat) {
  const x = Math.max(0, Math.min(1, (sat - 0.3) / (M.SAT_ART - 0.3)));
  const a = [0x7b, 0x7c, 0xff], b = [0xff, 0x54, 0x68];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * x)).join(',')})`;
}

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12.5;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
// A short label that shrinks to fit maxW and is clamped inside the canvas.
function label(ctx, text, X, Y, { align = 'center', maxW = 120, color = C.text, size = 12, weight = 600, W = Infinity, pill = null } = {}) {
  ctx.save(); ctx.fillStyle = color;
  let s = size; do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  const w = ctx.measureText(text).width;
  let left = align === 'center' ? X - w / 2 : align === 'right' ? X - w : X;
  left = Math.max(3, Math.min(W - 3 - w, left));
  if (pill) { ctx.save(); ctx.fillStyle = pill; ctx.fillRect(left - 3, Y - s + 1, w + 6, s + 4); ctx.restore(); }
  ctx.textAlign = 'left'; ctx.fillText(text, left, Y); ctx.restore();
}
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const [v, lab] of o.yTicks) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(lab, P.l - 6, y(v) + 4);
  }
  let lastRight = -Infinity; ctx.textAlign = 'center';
  for (const [v, lab] of (o.xTicks || [])) {
    const X = x(v), w = ctx.measureText(lab).width;
    if (o.xGrid !== false) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X, P.t); ctx.lineTo(X, P.b); ctx.stroke(); }
    const cx = Math.min(Math.max(X, P.l + w / 2), W - 2 - w / 2);
    if (cx - w / 2 < lastRight + 5) continue;
    ctx.fillText(lab, cx, P.b + 15); lastRight = cx + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
const linTicks = (a, b, s, d = 0) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push([v, fmt(v, d)]); return out; };
function arrow(ctx, x0, y0, x1, y1, color, lw = 3) {
  const a = Math.atan2(y1 - y0, x1 - x0), h = 8;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * h * 0.6, y1 - Math.sin(a) * h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - h * Math.cos(a - 0.45), y1 - h * Math.sin(a - 0.45)); ctx.lineTo(x1 - h * Math.cos(a + 0.45), y1 - h * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- loops: a small manager for continuous animations (stop when hidden or off-screen) ---------- */
const loops = {};
function startLoop(name, step) {
  stopLoop(name);
  let last = performance.now();
  const tick = now => { const dt = Math.min(0.1, (now - last) / 1000); last = now; if (step(dt) === false) { delete loops[name]; return; } loops[name] = requestAnimationFrame(tick); };
  loops[name] = requestAnimationFrame(tick);
}
function stopLoop(name) { if (loops[name]) { cancelAnimationFrame(loops[name]); delete loops[name]; } }
const isLooping = name => !!loops[name];

/* ---------- step 0: the route ---------- */
const s0 = { seg: 0, frac: 0, loops: 0, real: false, visited: new Set([0]) };
function routeGeometry(W, H) {
  const hw = Math.min(220, W * 0.42), cx = W / 2, hl = cx - hw / 2, hr = cx + hw / 2;
  const yTop = 136, yMid = 214, yBot = 292, yT = yTop + 52, yB = yMid + 52; // route runs through the lower part of each chamber, below its name
  const xL = (hl + cx) / 2, xR = (cx + hr) / 2;
  const lungY = 76, bodyY = H - 46, out = 16, paX = hl - 20, aoX = hr + 20;
  const RA = [xL, yT], RV = [xL, yB], LA = [xR, yT], LV = [xR, yB];
  const paths = {
    LV: [LV, [aoX, yB]],
    artery: [[aoX, yB], [W - out, yB], [W - out, bodyY]],
    bodyCap: [[W - out, bodyY], [out, bodyY]],
    vein: [[out, bodyY], [out, yT], RA],
    RA: [RA, RV],
    RV: [RV, [paX, yB]],
    lungArt: [[paX, yB], [paX, lungY]],
    lungCap: [[paX, lungY], [W - out, lungY]],
    lungVein: [[W - out, lungY], [W - out, yT], LA],
    LA: [LA, LV],
  };
  return { hl, hr, cx, yTop, yMid, yBot, xL, xR, lungY, bodyY, out, paX, aoX, RA, RV, LA, LV, paths };
}
function polyPoint(pts, f) {
  const lens = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
  let d = f * total;
  for (let i = 0; i < lens.length; i++) { if (d <= lens[i] || i === lens.length - 1) { const u = lens[i] ? Math.min(1, d / lens[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]; } d -= lens[i]; }
  return pts[pts.length - 1];
}
function strokePath(ctx, pts, color, lw, alpha = 1, wavy = false) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath();
  if (wavy) {
    const [a, b] = pts, n = Math.max(8, Math.round(Math.abs(b[0] - a[0]) / 14));
    for (let i = 0; i <= n * 6; i++) { const u = i / (n * 6), X = a[0] + (b[0] - a[0]) * u, Y = a[1] + Math.sin(u * n * Math.PI * 2) * 6; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  } else { pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); }
  ctx.stroke(); ctx.restore();
}
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  const G = routeGeometry(W, H);
  title(ctx, t('c0'), 8, 17, W - 16);
  // regions
  ctx.save();
  ctx.fillStyle = 'rgba(103,215,249,0.07)'; ctx.fillRect(G.paX - 6, G.lungY - 34, W - 10 - G.paX, 62);
  ctx.fillStyle = 'rgba(255,180,84,0.06)'; ctx.fillRect(8, G.bodyY - 30, W - 16, 56);
  ctx.restore();
  label(ctx, t('lungs'), G.paX, G.lungY - 18, { align: 'left', maxW: 80, color: C.cyan, W });
  label(ctx, t('body'), 22, G.bodyY - 14, { align: 'left', maxW: 80, color: C.orange, W });
  // vessels: base colour by the blood they carry; capillary beds drawn wavy with a gradient look
  const ids = M.SEGMENTS.map(s => s.id);
  ids.forEach((id, i) => {
    const seg = M.SEGMENTS[i], pts = G.paths[id];
    if (seg.loop === 'heart') return;
    const wavy = !!seg.exchange;
    const col = wavy ? null : satColor(M.saturationAt(i, 0.5));
    if (wavy) {
      const grad = ctx.createLinearGradient(pts[0][0], 0, pts[1][0], 0);
      grad.addColorStop(0, satColor(M.saturationAt(i, 0))); grad.addColorStop(1, satColor(M.saturationAt(i, 1)));
      ctx.save(); ctx.globalAlpha = 0.55; strokePath(ctx, pts, grad, 3, 1, true); ctx.restore();
    } else strokePath(ctx, pts, col, 6, 0.45);
    if (s0.visited.has(i)) strokePath(ctx, pts, C.text, 2, 0.4, wavy);
  });
  // heart chambers
  const cw = (G.hr - G.hl) / 2, chambers = [['ra', G.hl, G.yTop, 4], ['la', G.cx, G.yTop, 9], ['rv', G.hl, G.yMid, 5], ['lv', G.cx, G.yMid, 0]];
  for (const [key, x0, y0, segIdx] of chambers) {
    const sat = M.saturationAt(segIdx, 0.5);
    ctx.save(); ctx.fillStyle = satColor(sat); ctx.globalAlpha = 0.28; ctx.fillRect(x0 + 2, y0 + 2, cw - 4, G.yMid - G.yTop - 4); ctx.restore();
    ctx.save(); ctx.strokeStyle = satColor(sat); ctx.lineWidth = 1.5; ctx.strokeRect(x0 + 2, y0 + 2, cw - 4, G.yMid - G.yTop - 4); ctx.restore();
    label(ctx, t(key), x0 + cw / 2, y0 + 22, { maxW: cw - 12, size: 12, W, pill: 'rgba(14,20,28,0.78)' });
  }
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(G.cx, G.yTop); ctx.lineTo(G.cx, G.yBot); ctx.stroke(); ctx.restore();
  // the drop
  const id = ids[s0.seg], p = polyPoint(G.paths[id], s0.frac), sat = M.saturationAt(s0.seg, s0.frac);
  ctx.save(); ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, 7); ctx.fillStyle = satColor(sat); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.text; ctx.stroke(); ctx.restore();
  const seg = M.SEGMENTS[s0.seg];
  $('r0').textContent = t('s0readout', { n: s0.seg + 1, name: t('seg_' + id), desc: t('segd_' + id), sat: fmt(sat * 100, 0), sec: fmt(M.segmentSeconds(seg), 1), loops: s0.loops }) + ' ' + t('s0mode', { mode: t(s0.real ? 'modeReal' : 'modeEqual') });
  $('play0').textContent = t(isLooping('s0') ? 'pause' : 'play');
  $('real0').setAttribute('aria-pressed', s0.real ? 'true' : 'false');
}
function advance0(dt) {
  let left = dt;
  while (left > 0) {
    const dur = s0.real ? M.segmentSeconds(M.SEGMENTS[s0.seg]) / 10 : 0.9;
    const need = (1 - s0.frac) * dur;
    if (left < need) { s0.frac += left / dur; left = 0; }
    else { left -= need; nextSeg0(); }
  }
}
function nextSeg0() {
  s0.seg = (s0.seg + 1) % M.SEGMENTS.length; s0.frac = 0;
  if (s0.seg === 0) { s0.loops++; s0.visited = new Set(); }
  s0.visited.add(s0.seg);
}

/* ---------- step 1: one heartbeat ---------- */
const s1 = { leak: false, p: 0.3 };
const BEAT_MS = 60000 / M.REST.HR;
function draw1() {
  const p = s1.p, ph = M.phaseAt(p), sq = M.squeeze(p), vol = M.lvVolume(p);
  $('p1v').textContent = Math.round(p * 100) + '%';
  $('leak1').setAttribute('aria-pressed', s1.leak ? 'true' : 'false');
  $('play1').textContent = t(isLooping('s1') ? 'pause' : 'play');
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1top'), 8, 17, W - 16);
  // geometry
  const cw = Math.min(150, (W - 90) / 2), cx = W / 2, hl = cx - cw, hr = cx + cw;
  const aTop = 70, aH = 64 * (1 - 0.28 * sq.atria), aBot = aTop + 64;
  const vMax = 120, vH = vMax * (0.6 + 0.4 * (vol - M.ESV) / (M.EDV - M.ESV)), vTop = aBot + 14;
  const satR = M.SAT_VEN, satL = M.SAT_ART;
  const room = (x0, y0, w, h, sat) => { ctx.save(); ctx.fillStyle = satColor(sat); ctx.globalAlpha = 0.3; ctx.fillRect(x0, y0, w, h); ctx.globalAlpha = 1; ctx.strokeStyle = satColor(sat); ctx.lineWidth = 1.6; ctx.strokeRect(x0, y0, w, h); ctx.restore(); };
  const inset = 6;
  room(hl + inset, aBot - aH, cw - 2 * inset, aH, satR); room(cx + inset, aBot - aH, cw - 2 * inset, aH, satL);
  room(hl + inset, vTop, cw - 2 * inset, vH, satR); room(cx + inset, vTop, cw - 2 * inset, vH, satL);
  label(ctx, t('ra'), hl + cw / 2, aBot - aH / 2 + 4, { maxW: cw - 16, W }); label(ctx, t('la'), cx + cw / 2, aBot - aH / 2 + 4, { maxW: cw - 16, W });
  label(ctx, t('rv'), hl + cw / 2, vTop + vH / 2 + 4, { maxW: cw - 16, W }); label(ctx, t('lv'), cx + cw / 2, vTop + vH / 2 + 4, { maxW: cw - 16, W });
  // outflow tubes: pulmonary artery on the far left, aorta on the far right
  const tubeL = hl - 22, tubeR = hr + 22, tubeTop = 40, outY = vTop + 18;
  ctx.save(); ctx.strokeStyle = satColor(satR); ctx.globalAlpha = 0.6; ctx.lineWidth = 10; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(hl + inset, outY); ctx.lineTo(tubeL, outY); ctx.lineTo(tubeL, tubeTop); ctx.stroke();
  ctx.strokeStyle = satColor(satL); ctx.beginPath(); ctx.moveTo(hr - inset, outY); ctx.lineTo(tubeR, outY); ctx.lineTo(tubeR, tubeTop); ctx.stroke(); ctx.restore();
  label(ctx, t('pa'), tubeL - 4, tubeTop - 6, { align: 'left', maxW: 70, size: 11, color: C.muted, W });
  label(ctx, t('ao'), tubeR + 4, tubeTop - 6, { align: 'right', maxW: 70, size: 11, color: C.muted, W });
  // valves
  const gate = (x0, x1, y, open, vertical = false) => {
    ctx.save(); ctx.strokeStyle = open ? C.green : C.pink; ctx.lineWidth = 4; ctx.lineCap = 'round';
    if (!vertical) {
      const m = (x0 + x1) / 2;
      ctx.beginPath();
      if (open) { ctx.moveTo(x0, y); ctx.lineTo(x0 + 6, y + 14); ctx.moveTo(x1, y); ctx.lineTo(x1 - 6, y + 14); }
      else { ctx.moveTo(x0, y); ctx.lineTo(m - 2, y); ctx.moveTo(m + 2, y); ctx.lineTo(x1, y); }
      ctx.stroke();
    } else {
      ctx.beginPath();
      if (open) { ctx.moveTo(x0, y - 9); ctx.lineTo(x0 - 12, y - 14); ctx.moveTo(x0, y + 9); ctx.lineTo(x0 - 12, y + 14); }
      else { ctx.moveTo(x0, y - 9); ctx.lineTo(x0, y + 9); }
      ctx.stroke();
    }
    ctx.restore();
  };
  const gy = aBot + 7, gw = (cw - 2 * inset) * 0.5;
  gate(hl + cw / 2 - gw / 2, hl + cw / 2 + gw / 2, gy, ph.av); gate(cx + cw / 2 - gw / 2, cx + cw / 2 + gw / 2, gy, ph.av);
  // semilunar valves sit in the tubes just outside the ventricles (drawn as vertical gates)
  ctx.save(); ctx.translate(0, 0); ctx.restore();
  const semi = (X, dir) => { ctx.save(); ctx.strokeStyle = ph.semi ? C.green : C.pink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
    if (ph.semi) { ctx.moveTo(X, outY - 8); ctx.lineTo(X + 10 * dir, outY - 12); ctx.moveTo(X, outY + 8); ctx.lineTo(X + 10 * dir, outY + 12); } else { ctx.moveTo(X, outY - 8); ctx.lineTo(X, outY + 8); }
    ctx.stroke(); ctx.restore(); };
  semi(hl - 6, -1); semi(hr + 6, 1);
  // flow arrows
  if (ph.id === 'eject') { arrow(ctx, tubeL, outY - 30, tubeL, tubeTop + 8, C.orange); arrow(ctx, tubeR, outY - 30, tubeR, tubeTop + 8, C.orange); }
  if (ph.av) { arrow(ctx, hl + cw / 2, aBot - 30, hl + cw / 2, vTop + 22, C.orange); arrow(ctx, cx + cw / 2, aBot - 30, cx + cw / 2, vTop + 22, C.orange); }
  if (s1.leak && ph.id === 'eject') arrow(ctx, cx + cw / 2 + 18, vTop + 26, cx + cw / 2 + 18, aBot - 26, C.violet);
  // volume chart
  const m = panel(ctx, W, { top: 300, bottom: H - 26, xMin: 0, xMax: BEAT_MS / 1000, yMin: 40, yMax: 130, yTicks: [[50, '50'], [70, '70'], [90, '90'], [120, '120']], xTicks: linTicks(0, 0.8, 0.2, 1), left: 40, title: t('c1bot') });
  for (const P of M.PHASES) {
    ctx.save(); ctx.fillStyle = P.av || P.semi ? 'rgba(126,226,168,0.05)' : 'rgba(255,122,147,0.16)';
    ctx.fillRect(m.x(P.from * BEAT_MS / 1000), m.P.t, m.x(P.to * BEAT_MS / 1000) - m.x(P.from * BEAT_MS / 1000), m.P.b - m.P.t); ctx.restore();
  }
  ctx.save(); ctx.beginPath(); ctx.strokeStyle = C.red; ctx.lineWidth = 2.4;
  for (let i = 0; i <= 200; i++) { const q = i / 200, X = m.x(q * BEAT_MS / 1000), Y = m.y(M.lvVolume(Math.min(q, 0.9999))); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(m.x(p * BEAT_MS / 1000), m.P.t); ctx.lineTo(m.x(p * BEAT_MS / 1000), m.P.b); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(m.x(p * BEAT_MS / 1000), m.y(vol), 5, 0, 7); ctx.fill(); ctx.restore();
  const tail = s1.leak ? t('s1leak') : t('s1normal');
  $('r1').textContent = t('s1readout', { pct: Math.round(p * 100), ms: Math.round(p * BEAT_MS), name: t('ph_' + ph.id), desc: t('phd_' + ph.id), av: t(ph.av ? 'open' : 'shut'), semi: t(ph.semi ? 'open' : 'shut'), vol: Math.round(vol) }) + ' ' + tail;
}

/* ---------- step 2: litres per minute ---------- */
const s2 = { tried: [], reveal: 60 };
function draw2(progress = null) {
  const HR = num('h2'), SV = num('v2'), CO = HR * SV, hit = M.fullVolumeBeat(HR, SV);
  $('h2v').textContent = String(HR); $('v2v').textContent = SV + ' mL';
  const key = HR + '/' + SV; if (!s2.tried.some(q => q.key === key)) { s2.tried.push({ key, HR, SV }); if (s2.tried.length > 8) s2.tried.shift(); }
  const yMax = Math.max(6, Math.ceil(CO / 1000 * 1.08));
  const { ctx, W, H } = fitCanvas($('c2'));
  const step = yMax <= 8 ? 1 : yMax <= 16 ? 2 : yMax <= 30 ? 5 : 10;
  const m = panel(ctx, W, { top: 30, bottom: H - 26, xMin: 0, xMax: 60, yMin: 0, yMax, yTicks: linTicks(0, yMax, step), xTicks: linTicks(0, 60, 10), left: 40, title: t('c2') });
  const stairs = (hr, sv, until, color, lw, alpha) => {
    ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip();
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(m.x(0), m.y(0));
    const beats = Math.floor(until * hr / 60 + 1e-9);
    for (let k = 0; k <= beats; k++) { const tk = k * 60 / hr; ctx.lineTo(m.x(tk), m.y(k * sv / 1000)); ctx.lineTo(m.x(tk), m.y((k + 1) * sv / 1000)); }
    ctx.lineTo(m.x(until), m.y((beats + 1) * sv / 1000)); ctx.stroke(); ctx.restore();
  };
  for (const q of s2.tried) if (q.key !== key) stairs(q.HR, q.SV, 60, C.red, 1.4, 0.3);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.P.l, m.y(5)); ctx.lineTo(m.P.r, m.y(5)); ctx.stroke(); ctx.restore();
  const until = Math.min(60, s2.reveal);
  stairs(HR, SV, until, C.red, 2.4, 1);
  if (hit.seconds <= until) { ctx.save(); ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(m.x(hit.seconds), m.y(5), 5.5, 0, 7); ctx.fill(); ctx.restore(); }
  const co = CO / 1000;
  $('r2').textContent = (progress !== null ? t('s2progress', { s: Math.round(until) }) + ' ' : '') + t('s2readout', { hr: HR, sv: SV, co: fmt(co, 2), beat: hit.beat, sec: fmt(hit.seconds, 1), trip: fmt(M.roundTripSeconds(CO), 1), day: Math.round(co * 1440) }) + (hit.seconds > 60 ? ' ' + t('s2late') : '');
}

/* ---------- step 3: width and speed ---------- */
const s3 = { pick: 'capillaries' };
const LOG_AREA = [[0, '1'], [1, '10'], [2, '100'], [3, '1000'], [4, '10⁴']];
const LOG_V = [[-2, '0.01'], [-1, '0.1'], [0, '1'], [1, '10'], [2, '100'], [3, '1000']];
function draw3() {
  const q = num('q3');
  $('q3v').textContent = fmt(q, 1) + (lang() === 'zh' ? ' 升/分' : ' L/min');
  M.STATIONS.forEach(s => $('st_' + s.id).setAttribute('aria-pressed', s.id === s3.pick ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c3'));
  const n = M.STATIONS.length;
  const top = panel(ctx, W, { top: 30, bottom: 190, xMin: -0.5, xMax: n - 0.5, yMin: 0, yMax: 4.2, yTicks: LOG_AREA, xGrid: false, left: 44, title: t('c3top') });
  const bot = panel(ctx, W, { top: 236, bottom: H - 26, xMin: -0.5, xMax: n - 0.5, yMin: -2, yMax: 3, yTicks: LOG_V, xTicks: M.STATIONS.map((s, i) => [i, t('sh_' + s.id)]), xGrid: false, left: 44, title: t('c3bot') });
  const bw = Math.min(46, (top.x(1) - top.x(0)) * 0.6);
  M.STATIONS.forEach((s, i) => {
    const on = s.id === s3.pick, X = top.x(i) - bw / 2;
    const ya = top.y(Math.log10(s.area)); ctx.fillStyle = on ? C.orange : C.cyan; ctx.globalAlpha = on ? 1 : 0.75; ctx.fillRect(X, ya, bw, top.P.b - ya); ctx.globalAlpha = 1;
    const v = M.speed(s, q), yv = bot.y(Math.log10(v)); ctx.fillStyle = on ? C.orange : C.red; ctx.globalAlpha = on ? 1 : 0.75; ctx.fillRect(X, yv, bw, bot.P.b - yv); ctx.globalAlpha = 1;
    const yr = bot.y(Math.log10(M.speed(s, 5))); ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(X - 3, yr, bw + 6, bot.P.b - yr); ctx.restore();
  });
  const st = M.STATIONS.find(s => s.id === s3.pick), v = M.speed(st, q), flow = M.flowCm3s(q);
  const name = lang() === 'en' ? t(st.id).toLowerCase() : t(st.id);
  let txt = t('s3readout', { q: fmt(q, 1), flow: fmt(flow, 1), name, area: st.area, v: fmt(v, v < 0.1 ? 3 : 1), mm: fmt(v * 10, v < 0.1 ? 2 : 0) });
  if (st.id === 'capillaries') txt += ' ' + t('s3cap', { tt: fmt(M.capillaryTransit(q), 2) });
  $('r3').textContent = txt;
}

/* ---------- step 4: enough oxygen? ---------- */
const PRE4 = { pre4a: [250, 5.04], pre4b: [1000, 10], pre4c: [2500, 20] };
function draw4() {
  const use = num('u4'), co = num('q4'), o = M.oxygen(use, co);
  $('u4v').textContent = use + ' mL'; $('q4v').textContent = fmt(co, 2) + (lang() === 'zh' ? ' 升/分' : ' L/min');
  for (const [id, [u, c]] of Object.entries(PRE4)) $(id).setAttribute('aria-pressed', u === use && Math.abs(c - co) < 1e-9 ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4top'), 8, 17, W - 16);
  const x0 = 34, x1 = W - 34, ty = 58, th = 34;
  const grad = ctx.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, satColor(M.SAT_ART)); grad.addColorStop(1, satColor(o.venousSat));
  ctx.save(); ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, ty, x1 - x0, th, 16) : ctx.rect(x0, ty, x1 - x0, th); ctx.fill(); ctx.restore();
  label(ctx, t('inLabel'), x0, ty - 6, { align: 'left', size: 11, color: C.muted, maxW: 60, W });
  label(ctx, t('outLabel'), x1, ty - 6, { align: 'right', size: 11, color: C.muted, maxW: 60, W });
  arrow(ctx, 8, ty + th / 2, x0 - 2, ty + th / 2, C.text, 2); arrow(ctx, x1 + 2, ty + th / 2, W - 6, ty + th / 2, C.text, 2);
  // tissue with oxygen handed over (dot count ∝ oxygen actually taken per minute)
  const tTop = ty + th + 18, tBot = tTop + 60;
  ctx.save(); ctx.fillStyle = 'rgba(255,180,84,0.08)'; ctx.fillRect(x0, tTop, x1 - x0, tBot - tTop); ctx.restore();
  label(ctx, t('tissue'), x0 + 6, tBot - 8, { align: 'left', size: 11, color: C.orange, maxW: 120, W });
  const taken = o.extraction * o.delivered, dots = Math.round(Math.min(60, taken / 50));
  ctx.save(); ctx.fillStyle = C.cyan;
  for (let k = 0; k < dots; k++) { const u = (k + 0.5) / dots, X = x0 + 20 + u * (x1 - x0 - 40), Y = tTop + 10 + ((k * 37) % 30); ctx.beginPath(); ctx.arc(X, Y, 3, 0, 7); ctx.fill(); }
  ctx.restore();
  // bars: delivered vs needed (mL per minute)
  const xMax = Math.max(5000, o.delivered, use) * 1.05, nice = xMax <= 6000 ? 1000 : 2000;
  const top = tBot + 44, rowH = 34, gap = 18, L = 52, R = W - 14;
  title(ctx, t('c4bot'), 8, top - 12, W - 16);
  const X = v => L + v / xMax * (R - L);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  let lastRight = -Infinity;
  for (let v = 0; v <= xMax; v += nice) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(v), top); ctx.lineTo(X(v), top + 2 * rowH + gap); ctx.stroke(); const lab = String(v), w = ctx.measureText(lab).width, cxl = Math.min(X(v), W - 2 - w / 2); if (cxl - w / 2 > lastRight + 5) { ctx.fillText(lab, cxl, top + 2 * rowH + gap + 15); lastRight = cxl + w / 2; } }
  ctx.restore();
  label(ctx, t('rowSent'), L - 6, top + rowH / 2 + 4, { align: 'right', size: 11, color: C.muted, maxW: L - 8, weight: 400, W });
  label(ctx, t('rowUse'), L - 6, top + rowH + gap + rowH / 2 + 4, { align: 'right', size: 11, color: C.muted, maxW: L - 8, weight: 400, W });
  ctx.fillStyle = C.red; ctx.fillRect(L, top + 4, X(o.delivered) - L, rowH - 8);
  ctx.fillStyle = C.orange; ctx.fillRect(L, top + rowH + gap + 4, X(use) - L, rowH - 8);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.8; const xm = X(M.MAX_EXTRACTION * o.delivered); ctx.beginPath(); ctx.moveTo(xm, top); ctx.lineTo(xm, top + 2 * rowH + gap); ctx.stroke(); ctx.restore();
  let txt = t('s4readout', { co: fmt(co, 2), sent: Math.round(o.delivered), use, ext: fmt(o.need * 100, 1) }) + ' ';
  txt += o.enough ? t('s4ok', { ven: fmt(o.venousSat * 100, 1) }) : t('s4short', { gap: Math.round(o.shortfall), ven: fmt(o.venousSat * 100, 1), min: fmt(o.minCO, 2) });
  $('r4').textContent = txt;
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  // step 0
  $('play0').addEventListener('click', () => {
    if (isLooping('s0')) { stopLoop('s0'); draw0(); return; }
    if (reduceMotion()) { nextSeg0(); draw0(); return; }
    startLoop('s0', dt => { advance0(dt); draw0(); });
    draw0();
  });
  $('next0').addEventListener('click', () => { stopLoop('s0'); nextSeg0(); draw0(); });
  $('reset0').addEventListener('click', () => { stopLoop('s0'); s0.seg = 0; s0.frac = 0; s0.loops = 0; s0.visited = new Set([0]); draw0(); });
  $('real0').addEventListener('click', () => { s0.real = !s0.real; draw0(); });
  // step 1
  $('p1').addEventListener('input', () => { stopLoop('s1'); s1.p = num('p1'); draw1(); });
  $('play1').addEventListener('click', () => {
    if (isLooping('s1')) { stopLoop('s1'); draw1(); return; }
    if (reduceMotion()) { const ph = M.phaseAt(s1.p), i = M.PHASES.indexOf(ph); s1.p = M.PHASES[(i + 1) % M.PHASES.length].from; $('p1').value = s1.p; draw1(); return; }
    startLoop('s1', dt => { s1.p += dt / (BEAT_MS / 1000 * 4); if (s1.p >= 1) s1.p -= 1; $('p1').value = s1.p; draw1(); });
    draw1();
  });
  $('leak1').addEventListener('click', () => { s1.leak = !s1.leak; draw1(); });
  // step 2
  ['h2', 'v2'].forEach(id => $(id).addEventListener('input', () => { stopLoop('s2'); s2.reveal = 60; draw2(); }));
  $('rest2').addEventListener('click', () => { stopLoop('s2'); $('h2').value = M.REST.HR; $('v2').value = M.REST.SV; s2.reveal = 60; draw2(); });
  $('run2').addEventListener('click', () => {
    if (reduceMotion()) { s2.reveal = 60; draw2(); return; }
    s2.reveal = 0;
    startLoop('s2', dt => { s2.reveal = Math.min(60, s2.reveal + dt * 6); draw2(s2.reveal < 60 ? s2.reveal : null); return s2.reveal < 60; });
  });
  // step 3
  M.STATIONS.forEach(s => $('st_' + s.id).addEventListener('click', () => { s3.pick = s.id; draw3(); }));
  $('q3').addEventListener('input', draw3);
  // step 4
  ['u4', 'q4'].forEach(id => $(id).addEventListener('input', draw4));
  Object.entries(PRE4).forEach(([id, [u, c]]) => $(id).addEventListener('click', () => { $('u4').value = u; $('q4').value = c; draw4(); }));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
    $('quizFeedback').dataset.state = ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    // continuous loops stop when their step scrolls out of view
    const off = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) return;
      const id = e.target.id;
      if (id === 'step0' && isLooping('s0')) { stopLoop('s0'); draw0(); }
      if (id === 'step1' && isLooping('s1')) { stopLoop('s1'); draw1(); }
    }));
    ['step0', 'step1'].forEach(id => off.observe($(id)));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    stopLoop('s0'); stopLoop('s1'); if (isLooping('s2')) { stopLoop('s2'); s2.reveal = 60; }
    refresh();
  });
  window.refreshBlood = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
