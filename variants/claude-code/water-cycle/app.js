'use strict';
// Water cycle lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout comes from window.WATER_MODEL (model.js). Canvas text is limited to panel
// titles, axis ticks and labels that are measured first and only drawn where they fit.
(function () {

const $ = id => document.getElementById(id);
const M = window.WATER_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const lang = () => window.LESSON_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', yellow: '#ffd166', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', brown: '#c79a6b', teal: '#3fa7a0', sea: '#2f7fd0' };
const STORE_COL = { ocean: '#2f7fd0', ice: '#cfe8ff', ground: '#c79a6b', lakes: '#67d7f9', soil: '#8fbf6a', perma: '#b79cff', air: '#ffffff', rivers: '#2fd0c0', life: '#ff7a93' };
const STORE_KEY = { ocean: 's0lgOcean', ice: 's0lgIce', ground: 's0lgGround', lakes: 's0lgLakes', soil: 's0lgSoil', perma: 's0lgPerma', air: 's0lgAir', rivers: 's0lgRivers', life: 's0lgLife' };
const SURF_COL = { forest: '#5ad16b', grass: '#c6e85a', farm: '#ffb454', city: '#b79cff' };
const BOX_KEY = { ocean: 'boxOcean', air: 'boxAir', land: 'boxLand', ground: 'boxGround', ice: 'boxIce' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const degC = () => (lang() === 'zh' ? ' ℃' : ' °C');
// Fixed decimals; trailing zeros are trimmed only when there is a decimal point (90 stays 90).
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
const group = s => { const [i, f] = s.split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : ''); };
// Two significant figures for tiny numbers, sensible decimals for bigger ones.
const sig = v => { if (v === 0) return '0'; const a = Math.abs(v); if (a >= 100) return group(fmt(v, 0)); if (a >= 10) return fmt(v, 1); if (a >= 1) return fmt(v, 2); const d = Math.min(8, 1 - Math.floor(Math.log10(a))); return fmt(v, d); };
// Round to two significant figures (7,943,282 → 7,900,000); small values keep their digits.
const round2 = v => { if (v < 100) return Math.round(v); const k = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(v / k) * k; };
const vol = ml => ml >= 1000 ? t('litre', { v: group(fmt(ml / 1000, 1)) }) : t('ml', { v: ml >= 10 ? group(fmt(ml, 0)) : sig(ml) });
const dur = years => { const d = years * 365.25; if (d < 1) return t('day', { v: fmt(d, 2) }); if (years < 1) return t('day', { v: d < 10 ? fmt(d, 1) : fmt(d, 0) }); return t('year', { v: years < 10 ? fmt(years, 1) : group(fmt(years, 0)) }); };
const hoursText = h => h < 48 ? t('hours', { v: fmt(h, h < 10 ? 1 : 0) }) : t('days', { v: fmt(h / 24, 1) });

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
// Draw `text` shrinking the font until it fits maxW; returns false (draws nothing) if it cannot fit at minSize.
function fitText(ctx, text, X, Y, maxW, { size = 12, min = 8, weight = '', color = C.text, align = 'left' } = {}) {
  ctx.save(); ctx.textAlign = align; ctx.fillStyle = color;
  let s = size;
  for (; s >= min; s -= 0.5) { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; }
  const ok = s >= min; if (ok) ctx.fillText(text, X, Y); ctx.restore(); return ok;
}
const title = (ctx, text, X, Y, maxW) => fitText(ctx, text, X, Y, maxW, { size: 12, min: 7, weight: '600' });
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Linear plot panel. Title sits in its own row above the plot; tick labels left of / below it.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) {
    ctx.strokeStyle = v === o.yMin ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(o.yFmt ? o.yFmt(v) : fmt(v, 2), P.l - 6, y(v) + 4);
  }
  const step = niceStep(o.xMax - o.xMin, P.r - P.l, o.minPx || 30, o.xSteps || [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);
  ctx.textAlign = 'center';
  if (!o.noX) for (let v = Math.ceil((o.xMin - 1e-9) / step) * step; v <= o.xMax + 1e-9; v += step) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b + 4); ctx.stroke();
    ctx.fillText(fmt(v, 2), x(v), P.b + 15);
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function polyline(ctx, pts, color, lw = 2, dash = null, alpha = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.stroke(); ctx.restore();
}
function dot(ctx, X, Y, r, color, ring = false) { ctx.save(); ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); if (ring) { ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); } ctx.restore(); }

/* ---------- animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: where the water is ---------- */
const s0 = { litres: 1 };
function draw0() {
  const rows = M.zoomRows();
  $('lg0').innerHTML = M.STOCKS.map(b => `<span class="lg"><span class="sw" style="background:${STORE_COL[b.id]}"></span><span>${t(STORE_KEY[b.id])} ${sig(b.v / M.TOTAL * 100)}%</span></span>`).join('');
  const { ctx, W } = fitCanvas($('c0'));
  const L = 12, R = W - 12, BH = 40, tops = [34, 144, 254];
  rows.forEach((row, i) => {
    const top = tops[i];
    const ttl = i === 0 ? t('c0row0') : t(i === 1 ? 'c0row1' : 'c0row2', { p: sig(rows[i - 1].restFrac * 100) });
    title(ctx, ttl, L, top - 9, R - L);
    let X = L;
    row.parts.forEach(p => {
      const w = p.frac * (R - L);
      ctx.fillStyle = STORE_COL[p.id]; ctx.fillRect(X, top, Math.max(1, w), BH);
      fitText(ctx, t(STORE_KEY[p.id]), X + w / 2, top + BH / 2 + 4, w - 8, { size: 12, min: 9, weight: '600', color: p.id === 'ocean' ? '#ffffff' : '#0a0e14', align: 'center' });
      X += w;
    });
    if (row.rest > 1e-9) {
      const w = Math.max(3, row.restFrac * (R - L));
      ctx.fillStyle = '#55657a'; ctx.fillRect(R - w, top, w, BH);
      const next = tops[i + 1];
      ctx.save(); ctx.fillStyle = 'rgba(232,237,244,.08)'; ctx.strokeStyle = 'rgba(232,237,244,.45)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(R - w, top + BH); ctx.lineTo(L, next - 22); ctx.lineTo(R, next - 22); ctx.lineTo(R, top + BH); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(R - w, top + BH); ctx.lineTo(L, next - 22); ctx.moveTo(R, top + BH); ctx.lineTo(R, next - 22); ctx.stroke(); ctx.restore();
    }
  });
  const sh = M.shares(s0.litres), by = id => sh.find(s => s.id === id).ml;
  const ckey = s0.litres === 1 ? 'bottle' : s0.litres === 10 ? 'bucket' : 'tub';
  [['cBottle', 1], ['cBucket', 10], ['cTub', 150]].forEach(([id, v]) => $(id).setAttribute('aria-pressed', String(s0.litres === v)));
  $('r0').textContent = t('s0readout', { c: t(ckey), ocean: vol(by('ocean')), ice: vol(by('ice')), ground: vol(by('ground')), lr: vol(by('lakes') + by('rivers')), air: vol(by('air')), drops: sig(by('air') / M.DROP_ML) });
}

/* ---------- step 1: a drying puddle ---------- */
const s1 = { hist: [], from: null, last: null, tNow: 0 };
const cfg1 = () => ({ T: num('T1'), rh: num('H1') / 100, u: num('U1') });
const sameCfg = (a, b) => a.T === b.T && a.rh === b.rh && a.u === b.u;
function depthAt(c, hours) { return Math.max(0, M.PUDDLE_MM - M.evapRate(c.T, c.rh, c.u) * hours / 24); }
function draw1() {
  const c = cfg1();
  $('T1v').textContent = c.T + degC(); $('H1v').textContent = Math.round(c.rh * 100) + '%'; $('U1v').textContent = fmt(c.u, 1) + (lang() === 'zh' ? ' 米/秒' : ' m/s');
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1top'), 8, 18, W - 16);
  // puddle scene
  const ground = 132, bx0 = W * 0.2, bx1 = W * 0.8, deep = 46, d = depthAt(c, s1.tNow);
  ctx.fillStyle = '#3a2f25'; ctx.fillRect(0, ground, W, 26);
  ctx.save(); ctx.beginPath(); ctx.ellipse((bx0 + bx1) / 2, ground, (bx1 - bx0) / 2, deep, 0, 0, Math.PI); ctx.fillStyle = '#2a2219'; ctx.fill();
  ctx.clip(); ctx.fillStyle = C.sea; const lvl = ground + deep * (1 - d / M.PUDDLE_MM); ctx.fillRect(bx0, lvl, bx1 - bx0, deep + 4); ctx.restore();
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(W - 34, 46, 15, 0, 7); ctx.fill();
  // vapour that has left: one dot per 0.2 mm evaporated, drifting up from the puddle
  const gone = M.PUDDLE_MM - d, n = Math.round(gone * 5), rnd = M.mulberry32(11);
  ctx.fillStyle = 'rgba(232,237,244,.75)';
  for (let i = 0; i < n; i++) { const X = bx0 + 10 + rnd() * (bx1 - bx0 - 20), Y = ground - 10 - rnd() * (ground - 44); ctx.beginPath(); ctx.arc(X, Y, 2, 0, 7); ctx.fill(); }
  // depth chart
  const P = panel(ctx, W, { top: 200, bottom: H - 26, xMin: 0, xMax: 72, yMin: 0, yMax: 10, yTicks: [0, 5, 10], xSteps: [6, 12, 24], title: t('c1bot'), left: 34 });
  const line = cc => { const pts = []; for (let h = 0; h <= 72; h += 0.5) pts.push([P.x(h), P.y(depthAt(cc, h))]); return pts; };
  s1.hist.forEach(h => polyline(ctx, line(h), C.raw, 1.6));
  polyline(ctx, line(c), C.cyan, 2.6);
  ctx.save(); ctx.strokeStyle = C.yellow; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(P.x(s1.tNow), P.P.t); ctx.lineTo(P.x(s1.tNow), P.P.b); ctx.stroke(); ctx.restore();
  dot(ctx, P.x(s1.tNow), P.y(d), 5, C.yellow);
  const rate = M.evapRate(c.T, c.rh, c.u); s1.last = c;
  $('r1').textContent = rate <= 0 ? t('s1never', { T: c.T }) : t('s1readout', { T: c.T, rh: Math.round(c.rh * 100), u: fmt(c.u, 1), rate: fmt(rate, 1), time: hoursText(M.dryHours(c.T, c.rh, c.u)) });
}
function start1() { if (!s1.from) s1.from = s1.last || cfg1(); } // the config drawn before this drag began
function commit1() { const c = cfg1(); if (s1.from && !sameCfg(s1.from, c) && !s1.hist.some(h => sameCfg(h, s1.from))) { s1.hist.push(s1.from); if (s1.hist.length > 5) s1.hist.shift(); } s1.from = null; draw1(); }

/* ---------- step 2: lifting air until it clouds ---------- */
function draw2() {
  const T0 = num('T2'), rh = num('H2') / 100, z = num('Z2');
  $('T2v').textContent = T0 + degC(); $('H2v').textContent = Math.round(rh * 100) + '%'; $('Z2v').textContent = z + (lang() === 'zh' ? ' 米' : ' m');
  const path = M.parcel(T0, rh, 4000, 10), at = path.pts[Math.round(z / 10)];
  // mountain scene
  let { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax: 1, yMin: 0, yMax: 4.4, yTicks: [0, 1, 2, 3, 4], noX: true, title: t('c2a'), left: 44, yFmt: v => v + ' km' });
  const slopeX = zz => 0.1 + 0.8 * zz / 4000;
  ctx.fillStyle = '#2b3a2c'; ctx.beginPath(); ctx.moveTo(A.x(0), A.y(0)); ctx.lineTo(A.x(0.1), A.y(0)); ctx.lineTo(A.x(0.9), A.y(4)); ctx.lineTo(A.x(1), A.y(3.6)); ctx.lineTo(A.x(1), A.y(0)); ctx.closePath(); ctx.fill();
  if (path.base !== null) {
    ctx.save(); ctx.strokeStyle = 'rgba(232,237,244,.55)'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(A.P.l, A.y(path.base / 1000)); ctx.lineTo(A.P.r, A.y(path.base / 1000)); ctx.stroke(); ctx.restore();
  }
  // trail of the parcel so far, then the parcel itself (cloud puffs grow with the condensed water)
  const trail = path.pts.filter(p => p.z <= z).map(p => [A.x(slopeX(p.z)) - 14, A.y(p.z / 1000) - 12]);
  polyline(ctx, trail, C.orange, 1.6, [3, 4], 0.7);
  const PX = A.x(slopeX(z)) - 14, PY = A.y(z / 1000) - 12;
  if (at.cloud > 0) { const r = 10 + at.cloud * 4; ctx.fillStyle = 'rgba(232,237,244,.85)'; [[-r * 0.6, 2], [0, -r * 0.35], [r * 0.6, 2], [0, 4]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(PX + dx, PY + dy, r * 0.62, 0, 7); ctx.fill(); }); }
  dot(ctx, PX, PY, 7, C.orange);
  // vapour profile chart
  ({ ctx, W, H } = fitCanvas($('c2b')));
  const xMax = Math.ceil(path.pts[0].ws / 5) * 5;
  const B = panel(ctx, W, { top: 26, bottom: H - 26, xMin: 0, xMax, yMin: 0, yMax: 4.4, yTicks: [0, 1, 2, 3, 4], xSteps: [2, 5, 10], title: t('c2b'), left: 30, yFmt: v => String(v) });
  const above = path.pts.filter(p => p.cloud > 0);
  if (above.length) {
    ctx.save(); ctx.fillStyle = 'rgba(232,237,244,.28)'; ctx.beginPath();
    above.forEach((p, i) => (i ? ctx.lineTo(B.x(p.ws), B.y(p.z / 1000)) : ctx.moveTo(B.x(p.ws), B.y(p.z / 1000))));
    for (let i = above.length - 1; i >= 0; i--) ctx.lineTo(B.x(path.w0), B.y(above[i].z / 1000));
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // above the cloud base the vapour carried equals the limit, so the orange line runs under the cyan one
  polyline(ctx, path.pts.map(p => [B.x(p.vap), B.y(p.z / 1000)]), C.orange, 6, null, 0.8);
  polyline(ctx, path.pts.map(p => [B.x(p.ws), B.y(p.z / 1000)]), C.cyan, 2.2);
  if (path.base !== null) polyline(ctx, [[B.P.l, B.y(path.base / 1000)], [B.P.r, B.y(path.base / 1000)]], 'rgba(232,237,244,.55)', 1, [5, 5]);
  ctx.save(); ctx.strokeStyle = C.yellow; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(B.P.l, B.y(z / 1000)); ctx.lineTo(B.P.r, B.y(z / 1000)); ctx.stroke(); ctx.restore();
  dot(ctx, B.x(at.ws), B.y(z / 1000), 4.5, C.cyan); dot(ctx, B.x(at.vap), B.y(z / 1000), 4.5, C.orange);
  const td = fmt(M.dewPoint(T0, rh), 1);
  const base = path.base !== null ? t('s2base', { b: group(fmt(Math.round(path.base / 10) * 10, 0)), td }) : t('s2nobase', { td });
  $('r2').textContent = t('s2readout', { z: group(String(z)), T: fmt(at.T, 1), ws: fmt(at.ws, 1), vap: fmt(at.vap, 1), cloud: fmt(at.cloud, 1), base });
}

/* ---------- step 3: droplets and drops ---------- */
const s3 = { trail: [] };
const radius = () => Math.pow(10, num('R3'));
const rText = r => r < 0.1 ? (lang() === 'zh' ? fmt(r * 1000, 0) + ' 微米' : fmt(r * 1000, 0) + ' µm') : (lang() === 'zh' ? fmt(r, 2) + ' 毫米' : fmt(r, 2) + ' mm');
function draw3() {
  const r = radius(), w = num('W3'), v = M.fallSpeed(r);
  $('R3v').textContent = rText(r); $('W3v').textContent = fmt(w, 1) + (lang() === 'zh' ? ' 米/秒' : ' m/s');
  // sizes on one scale
  let { ctx, W, H } = fitCanvas($('c3'));
  const box = Math.min(W - 48, H - 60), scale = box * 0.22 / Math.max(r, M.CLOUD_R); // px per mm
  const g = [0.001, 0.01, 0.1, 1].find(s => s * scale >= 12) || 1;
  title(ctx, t('c3a', { g: g < 0.1 ? (lang() === 'zh' ? fmt(g * 1000, 0) + ' 微米' : fmt(g * 1000, 0) + ' µm') : (lang() === 'zh' ? fmt(g, 1) + ' 毫米' : fmt(g, 1) + ' mm') }), 8, 18, W - 16);
  const gx0 = Math.max(8, (W - 30 - box) / 2), gy0 = 30 + (H - 30 - box) / 2, cy = gy0 + box * 0.45;
  ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let k = 0; k * g * scale <= box + 0.5; k++) { const o = k * g * scale; ctx.beginPath(); ctx.moveTo(gx0 + o, gy0); ctx.lineTo(gx0 + o, gy0 + box); ctx.moveTo(gx0, gy0 + o); ctx.lineTo(gx0 + box, gy0 + o); ctx.stroke(); }
  ctx.restore();
  // this drop (left) and a 10 µm cloud droplet (right), both at the same scale
  const dX = gx0 + box * 0.26, cX = gx0 + box * 0.76, labY = gy0 + box * 0.45 + box * 0.22 + 18;
  ctx.fillStyle = 'rgba(103,215,249,.8)'; ctx.beginPath(); ctx.arc(dX, cy, Math.max(1, r * scale), 0, 7); ctx.fill();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(cX, cy, Math.max(1, M.CLOUD_R * scale), 0, 7); ctx.fill();
  fitText(ctx, t('s3drop'), dX, labY, box * 0.44, { size: 11.5, min: 8, color: C.cyan, align: 'center' });
  fitText(ctx, t('s3cloud'), cX, labY, box * 0.4, { size: 11.5, min: 8, color: C.muted, align: 'center' });
  // speed arrows at the right edge: down = fall speed, up = updraught (same scale)
  const ax = W - 14, vmax = Math.max(v, w, 0.5), L = (H - 70) / 2;
  const arrow = (len, dir, col) => { if (len < 1) return; ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(ax, cy + dir * len); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax, cy + dir * (len + 7)); ctx.lineTo(ax - 5, cy + dir * len); ctx.lineTo(ax + 5, cy + dir * len); ctx.fill(); ctx.restore(); };
  arrow(v / vmax * L, 1, C.cyan); arrow(w / vmax * L, -1, C.yellow);
  // fall speed chart (log–log)
  ({ ctx, W, H } = fitCanvas($('c3b')));
  const P = { l: 46, r: W - 12, t: 26, b: H - 26 }, lx0 = Math.log10(0.005), lx1 = Math.log10(2), ly0 = -3, ly1 = 1.3;
  const X = rr => P.l + (Math.log10(rr) - lx0) / (lx1 - lx0) * (P.r - P.l), Y = vv => P.b - (Math.log10(Math.max(vv, 1e-3)) - ly0) / (ly1 - ly0) * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  [0.001, 0.01, 0.1, 1, 10].forEach(vv => { ctx.strokeStyle = vv === 0.001 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y(vv)); ctx.lineTo(P.r, Y(vv)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(vv), P.l - 6, Y(vv) + 4); });
  [0.01, 0.1, 1].forEach(rr => { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(rr), P.t); ctx.lineTo(X(rr), P.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(String(rr), X(rr), P.b + 15); });
  ctx.restore();
  title(ctx, t('c3b'), 8, P.t - 9, W - 16);
  const curve = []; for (let i = 0; i <= 200; i++) { const rr = Math.pow(10, lx0 + (lx1 - lx0) * i / 200); curve.push([X(rr), Y(M.fallSpeed(rr))]); }
  polyline(ctx, curve, C.cyan, 2.4);
  if (w > 0) polyline(ctx, [[P.l, Y(w)], [P.r, Y(w)]], C.yellow, 1.8, [6, 5]);
  s3.trail.forEach(rr => dot(ctx, X(rr), Y(M.fallSpeed(rr)), 2.6, C.muted));
  dot(ctx, X(r), Y(v), 6, v > w ? C.cyan : C.yellow); dot(ctx, X(r), Y(v), 2.5, C.bg);
  const d = v - w, verdict = Math.abs(d) < 0.005 ? t('s3hover') : d > 0 ? t('s3down', { d: fmt(d, d < 0.1 ? 3 : 2) }) : t('s3up', { d: fmt(-d, 2) });
  const mins = 1000 / v / 60;
  $('r3').textContent = t('s3readout', { r: rText(r), v: fmt(v, v < 0.1 ? 3 : 2), w: fmt(w, 1), verdict, time: mins < 120 ? t('minutes', { v: fmt(mins, mins < 10 ? 1 : 0) }) : hoursText(mins / 60), n: M.dropletsPerDrop(r) < 1 ? '< 1' : group(String(round2(M.dropletsPerDrop(r)))) });
}

/* ---------- step 4: rain on the ground ---------- */
const s4 = { surf: 'forest', seen: new Set(['forest']) };
const SURF_BTN = { forest: 'sForest', grass: 'sGrass', farm: 'sFarm', city: 'sCity' };
function draw4() {
  const I = num('I4'); $('I4v').textContent = I + (lang() === 'zh' ? ' 毫米' : ' mm');
  Object.keys(SURF_BTN).forEach(k => $(SURF_BTN[k]).setAttribute('aria-pressed', String(k === s4.surf)));
  const o = M.storm(s4.surf, I);
  const { ctx, W, H } = fitCanvas($('c4'));
  // where the rain went
  const L = 12, R = W - 12, top = 34, bh = 38, sc = (R - L) / o.total;
  title(ctx, t('c4a', { total: fmt(o.total, 0) }), L, top - 9, R - L);
  let X = L;
  [[o.runoff, C.pink], [o.soil, C.teal], [o.ground, C.brown]].forEach(([v, col]) => {
    const w = v * sc; if (w <= 0) return;
    ctx.fillStyle = col; ctx.fillRect(X, top, w, bh);
    fitText(ctx, t('mm', { v: fmt(v, 1) }), X + w / 2, top + bh / 2 + 4, w - 6, { size: 12, min: 9, weight: '600', color: '#0a0e14', align: 'center' });
    X += w;
  });
  // river flow, one line per ground type tried, on a scale fixed by the heaviest possible response at this rain
  const yTop = Math.max(1, M.storm('city', I).peak * 1.05);
  const step = niceStep(yTop, H - 26 - 130, 26, [0.5, 1, 2, 5, 10, 20]);
  const ticks = []; for (let v = 0; v < yTop + step - 1e-9; v += step) ticks.push(v); // last tick ≥ the highest peak
  const P = panel(ctx, W, { top: 130, bottom: H - 26, xMin: 0, xMax: 48, yMin: 0, yMax: ticks[ticks.length - 1], yTicks: ticks, xSteps: [6, 12, 24], title: t('c4b'), left: 34 });
  const lineFor = k => M.storm(k, I).flow.map((q, i) => [P.x(i * M.FLOW_STEP), P.y(q)]);
  [...s4.seen].filter(k => k !== s4.surf).forEach(k => polyline(ctx, lineFor(k), SURF_COL[k], 1.6, null, 0.75));
  polyline(ctx, lineFor(s4.surf), SURF_COL[s4.surf], 3.2);
  ctx.save(); ctx.fillStyle = 'rgba(103,215,249,.12)'; ctx.fillRect(P.x(0), P.P.t, P.x(M.STORM_H) - P.x(0), P.P.b - P.P.t); ctx.restore();
  if (o.peak > 0) dot(ctx, P.x(o.peakT), P.y(o.peak), 4.5, SURF_COL[s4.surf]);
  if (o.peak === 0) { $('r4').textContent = t('s4readout0', { surf: t(s4.surf), I, total: fmt(o.total, 0) }); return; }
  $('r4').textContent = t('s4readout', { surf: t(s4.surf), I, total: fmt(o.total, 0), run: t('mm', { v: fmt(o.runoff, 1) }), soil: t('mm', { v: fmt(o.soil, 1) }), gw: t('mm', { v: fmt(o.ground, 1) }), peak: fmt(o.peak, 1), pt: fmt(o.peakT, 1), river: fmt(o.toRiver, 1), left: fmt(o.stillGround + o.stillQuick, 1) });
}

/* ---------- step 5: one drop's journey ---------- */
const s5 = { seed: 1, legs: [], shown: 0, leg: -1, frac: 0, stays: {}, drops: 0 };
M.BOXES.forEach(b => { s5.stays[b] = { n: 0, sum: 0 }; });
const POS = { air: [0.47, 0.02], ice: [0.86, 0.02], ocean: [0.86, 0.66], land: [0.15, 0.66], ground: [0.15, 1] };
function boxGeom(W, top, h) {
  const bw = Math.min(118, (W - 24) * 0.27), bh = 40, g = {};
  M.BOXES.forEach(b => { const [fx, fy] = POS[b]; g[b] = { x: Math.min(W - 12 - bw / 2, Math.max(12 + bw / 2, fx * W)), y: top + bh / 2 + fy * (h - bh), w: bw, h: bh }; });
  return g;
}
// Where the straight line from a box centre towards (tx, ty) leaves the box's edge.
function edge(b, tx, ty) { const dx = tx - b.x, dy = ty - b.y, sx = Math.abs(dx) / (b.w / 2 + 3), sy = Math.abs(dy) / (b.h / 2 + 3), s = Math.max(sx, sy, 1e-9); return [b.x + dx / s, b.y + dy / s]; }
function flowPath(g, from, to) {
  const A = g[from], B = g[to], twin = M.FLOWS.some(f => f[0] === to && f[1] === from);
  const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, off = twin ? 9 : 0;
  const a = edge(A, B.x + nx * off, B.y + ny * off), b = edge(B, A.x + nx * off, A.y + ny * off);
  return { a: [a[0] + nx * off, a[1] + ny * off], b: [b[0] + nx * off, b[1] + ny * off], nx, ny };
}
function draw5() {
  const { ctx, W, H } = fitCanvas($('c5'));
  const netTop = 34, netH = 290;
  title(ctx, t('c5a'), 8, 18, W - 16);
  const g = boxGeom(W, netTop, netH);
  // arrows with widths growing with the flow; labels sit beside the arrow, on its own side
  const placed = [];
  M.FLOWS.forEach(([from, to, q]) => {
    const p = flowPath(g, from, to), lw = 1 + 1.9 * Math.log10(1 + q);
    ctx.save(); ctx.strokeStyle = 'rgba(103,215,249,.55)'; ctx.fillStyle = 'rgba(103,215,249,.85)'; ctx.lineWidth = lw;
    const [x0, y0] = p.a, [x1, y1] = p.b, ang = Math.atan2(y1 - y0, x1 - x0), hl = 6 + lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(ang) * hl * 0.8, y1 - Math.sin(ang) * hl * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(ang - 0.45) * hl, y1 - Math.sin(ang - 0.45) * hl); ctx.lineTo(x1 - Math.cos(ang + 0.45) * hl, y1 - Math.sin(ang + 0.45) * hl); ctx.closePath(); ctx.fill(); ctx.restore();
    const label = fmt(q, 1); ctx.font = '600 11px system-ui,sans-serif'; const tw = ctx.measureText(label).width;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    // try a few spots along the normal (own side first) and keep the first that hits no box or earlier label
    for (const d of [12 + lw / 2, 22 + lw / 2, -(12 + lw / 2), 34]) {
      const lx = mx + p.nx * d, ly = my + p.ny * d, rect = [lx - tw / 2 - 2, ly - 8, tw + 4, 14];
      const hit = r2 => !(rect[0] > r2[0] + r2[2] || rect[0] + rect[2] < r2[0] || rect[1] > r2[1] + r2[3] || rect[1] + rect[3] < r2[1]);
      const boxes = M.BOXES.map(b => [g[b].x - g[b].w / 2, g[b].y - g[b].h / 2, g[b].w, g[b].h]);
      if (rect[0] < 2 || rect[0] + rect[2] > W - 2 || boxes.some(hit) || placed.some(hit)) continue;
      placed.push(rect); ctx.fillStyle = C.bg; ctx.fillRect(...rect); ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.fillText(label, lx, ly + 4); break;
    }
  });
  M.BOXES.forEach(b => {
    const q = g[b]; ctx.fillStyle = '#182433'; ctx.strokeStyle = s5.leg >= 0 && s5.legs[s5.leg] && s5.legs[s5.leg].box === b && s5.frac < 0.5 ? C.yellow : '#2c3b50';
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(q.x - q.w / 2, q.y - q.h / 2, q.w, q.h, 8) : ctx.rect(q.x - q.w / 2, q.y - q.h / 2, q.w, q.h); ctx.fill(); ctx.stroke();
    fitText(ctx, t(BOX_KEY[b]), q.x, q.y - 3, q.w - 10, { size: 12.5, min: 8, weight: '700', align: 'center' });
    fitText(ctx, group(fmt(M.BOX_STOCK[b], M.BOX_STOCK[b] < 100 ? 1 : 0)), q.x, q.y + 13, q.w - 10, { size: 10.5, min: 8, color: C.muted, align: 'center' });
  });
  // the travelling drop: waits in its box for the first half of a leg, then slides along the arrow
  if (s5.leg >= 0 && s5.legs[s5.leg]) {
    const L = s5.legs[s5.leg]; let X, Y;
    if (s5.frac < 0.5) { X = g[L.box].x + g[L.box].w / 2 - 9; Y = g[L.box].y - g[L.box].h / 2 + 9; }
    else { const p = flowPath(g, L.box, L.next), u = (s5.frac - 0.5) * 2; X = p.a[0] + (p.b[0] - p.a[0]) * u; Y = p.a[1] + (p.b[1] - p.a[1]) * u; }
    dot(ctx, X, Y, 7, C.cyan); dot(ctx, X, Y, 4.5, '#ffffff');
  }
  // residence-time chart: log time axis from 1 day to 100,000 years
  const top = netTop + netH + 46, bot = H - 26;
  title(ctx, t('c5b'), 8, top - 14, W - 16);
  ctx.font = '600 12px system-ui,sans-serif';
  const lw = Math.max(...M.BOXES.map(b => ctx.measureText(t(BOX_KEY[b])).width)) + 14;
  const P = { l: Math.min(lw, W * 0.34), r: W - 16 }, lx0 = Math.log10(1 / 365.25), lx1 = 5;
  const X = yrs => P.l + (Math.log10(yrs) - lx0) / (lx1 - lx0) * (P.r - P.l);
  const rowH = (bot - top) / M.BOXES.length;
  ctx.save(); ctx.font = '10.5px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
  const TICKS = [[1 / 365.25, 'day', 1], [10 / 365.25, 'day', 10], [100 / 365.25, 'day', 100], [1, 'year', 1], [10, 'year', 10], [100, 'year', 100], [1000, 'year', 1000], [1e4, 'year', 10000], [1e5, 'year', 100000]];
  let lastR = -Infinity;
  TICKS.forEach(([yrs, unit, v]) => {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(yrs), top); ctx.lineTo(X(yrs), bot + 3); ctx.stroke();
    const s = t(unit, { v: group(String(v)) }), w = ctx.measureText(s).width;
    if (X(yrs) - w / 2 > lastR + 6 && X(yrs) + w / 2 <= W - 2) { ctx.fillText(s, X(yrs), bot + 15); lastR = X(yrs) + w / 2; }
  });
  ctx.restore();
  M.BOXES.forEach((b, i) => {
    const Y = top + rowH * (i + 0.5);
    fitText(ctx, t(BOX_KEY[b]), P.l - 10, Y + 4, P.l - 14, { size: 12, min: 8, weight: '600', align: 'right' });
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y); ctx.lineTo(P.r, Y); ctx.stroke();
    dot(ctx, X(M.residenceYears(b)), Y, 7, C.orange, true);
    const st = s5.stays[b]; if (st.n) dot(ctx, X(Math.min(1e5, Math.max(1 / 365.25, st.sum / st.n))), Y, 4.5, C.cyan);
  });
  // text readouts
  if (!s5.legs.length) $('j5').textContent = t('s5empty');
  else {
    const legs = s5.legs.slice(0, s5.shown).map(l => `${t(BOX_KEY[l.box])} ${dur(l.years)}`);
    const tot = s5.legs.slice(0, s5.shown).reduce((s, l) => s + l.years, 0);
    $('j5').textContent = s5.shown < s5.legs.length ? t('s5progress', { k: s5.shown + 1 }) + (legs.length ? ' ' + legs.join(' → ') : '') : t('s5journey', { legs: legs.join(' → '), total: dur(tot) });
  }
  const k = M.BOXES.reduce((s, b) => s + s5.stays[b].n, 0), a = s5.stays.air;
  $('r5').textContent = t('s5stats', { n: s5.drops, k, air: dur(M.residenceYears('air')), airSim: a.n ? dur(a.sum / a.n) : '—', airN: a.n });
}
function tally(legs) { legs.forEach(l => { s5.stays[l.box].n++; s5.stays[l.box].sum += l.years; }); s5.drops++; }
function releaseOne() {
  stopAnim('s5'); if (s5.legs.length && s5.shown < s5.legs.length) { s5.shown = s5.legs.length; tally(s5.legs); }
  s5.legs = M.journey(s5.seed++, 10); s5.shown = 0; s5.leg = 0; s5.frac = 0;
  const legs = s5.legs;
  animate('s5', 10 * 900, p => {
    const pos = Math.min(9.999, p * 10); s5.leg = Math.floor(pos); s5.frac = pos - s5.leg; s5.shown = s5.leg;
    if (p >= 1) { s5.shown = 10; s5.leg = -1; }
    draw5();
  }, () => { if (s5.legs === legs) { s5.shown = 10; s5.leg = -1; tally(legs); draw5(); } });
}

/* ---------- step 6: summary numbers from the model ---------- */
function draw6() {
  $('fin6').innerHTML = t('s6fin', { airDays: fmt(M.residenceYears('air') * 365.25, 1), oceanYears: group(fmt(Math.round(M.residenceYears('ocean') / 100) * 100, 0)) });
  const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state, { d: fmt(M.residenceYears('air') * 365.25, 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  [['cBottle', 1], ['cBucket', 10], ['cTub', 150]].forEach(([id, v]) => $(id).addEventListener('click', () => { s0.litres = v; draw0(); }));

  ['T1', 'H1', 'U1'].forEach(id => { $(id).addEventListener('input', () => { start1(); draw1(); }); $(id).addEventListener('change', commit1); });
  $('sun1').addEventListener('click', () => animate('s1', 4500, p => { s1.tNow = 72 * p; draw1(); }));
  $('clear1').addEventListener('click', () => { s1.hist = []; draw1(); });

  ['T2', 'H2'].forEach(id => $(id).addEventListener('input', draw2));
  $('Z2').addEventListener('input', () => { stopAnim('s2'); draw2(); });
  $('climb2').addEventListener('click', () => animate('s2', 4000, p => { $('Z2').value = Math.round(4000 * p / 50) * 50; draw2(); }));

  $('R3').addEventListener('input', () => { stopAnim('s3'); draw3(); });
  $('W3').addEventListener('input', draw3);
  $('grow3').addEventListener('click', () => {
    s3.trail = [];
    animate('s3', 5000, p => {
      const lr = -2 + p * 2.3; $('R3').value = lr.toFixed(2);
      for (let k = -2; k <= lr + 1e-9; k += 0.05) if (!s3.trail.some(v => Math.abs(Math.log10(v) - k) < 1e-6)) s3.trail.push(Math.pow(10, k));
      draw3();
    });
  });

  Object.keys(SURF_BTN).forEach(k => $(SURF_BTN[k]).addEventListener('click', () => { s4.surf = k; s4.seen.add(k); draw4(); }));
  $('I4').addEventListener('input', draw4);

  $('drop5').addEventListener('click', releaseOne);
  $('many5').addEventListener('click', () => {
    stopAnim('s5'); if (s5.legs.length && s5.shown < s5.legs.length) tally(s5.legs);
    for (let i = 0; i < 100; i++) tally(M.journey(s5.seed++, 10));
    s5.leg = -1; s5.shown = s5.legs.length; draw5();
  });
  $('clear5').addEventListener('click', () => { stopAnim('s5'); M.BOXES.forEach(b => { s5.stays[b] = { n: 0, sum: 0 }; }); s5.drops = 0; s5.legs = []; s5.shown = 0; s5.leg = -1; draw5(); });

  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'a', fb = $('quizFeedback');
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.style.color = ok ? C.green : C.orange; draw6();
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
