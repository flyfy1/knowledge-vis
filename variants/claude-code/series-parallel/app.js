'use strict';
// Series & parallel lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every current, voltage and glow comes from window.SP_MODEL (model.js). Dot speed is proportional to the
// current in that wire (a schematic, not electron speed). Canvas text: panel titles, ticks and component names.
(function () {

const $ = id => document.getElementById(id);
const M = window.SP_MODEL;
const t = (...a) => window.SP_I18N.t(...a);
const lang = () => window.SP_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', yellow: '#ffe27a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', wire: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);

/* ---------- number formatting ---------- */
// Trim trailing zeros only when there is a decimal point (toFixed(0) of 90 stays 90).
const trim = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return trim(v.toFixed(d)); };

/* ---------- canvas helpers ---------- */
function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7.5);
  ctx.fillText(text, X, Y); ctx.restore();
}
function label(ctx, text, X, Y, color = C.text, align = 'center', size = 12) { ctx.save(); ctx.font = `600 ${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore(); }
function niceStep(span, px, minPx, steps) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
// Horizontal axis along the bottom of a box; returns x mapping.
function xAxis(ctx, l, r, y, min, max, steps, fmtFn = v => fmt(v, 1)) {
  const x = v => l + (v - min) / (max - min) * (r - l);
  const step = niceStep(max - min, r - l, 40, steps);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.strokeStyle = C.axis;
  ctx.beginPath(); ctx.moveTo(l, y); ctx.lineTo(r, y); ctx.stroke();
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) { ctx.beginPath(); ctx.moveTo(x(v), y); ctx.lineTo(x(v), y + 4); ctx.stroke(); ctx.fillText(fmtFn(v), x(v), y + 15); }
  ctx.restore();
  return x;
}
function line(ctx, pts, color = C.wire, lw = 2, dash = null) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.restore(); }
function dot(ctx, X, Y, r, color) { ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.restore(); }

/* ---------- circuit parts ---------- */
// battery on a vertical wire at (x, y): long plate (+) on top
function battery(ctx, x, y) {
  ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(x - 14, y - 9, 28, 18);
  ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 13, y - 6); ctx.lineTo(x + 13, y - 6); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 7, y + 6); ctx.lineTo(x + 7, y + 6); ctx.stroke(); ctx.restore();
}
// resistor box centred at (x, y); horizontal or vertical
function resistor(ctx, x, y, name, vertical = false, color = C.orange) {
  const w = vertical ? 16 : 44, h = vertical ? 40 : 16;
  ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(x - w / 2, y - h / 2, w, h); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, y - h / 2, w, h); ctx.restore();
  if (vertical) label(ctx, name, x + 14, y + 4, color, 'left'); else label(ctx, name, x, y - 14, color);
}
function bulb(ctx, x, y, rel, state = 'on') {    // rel: power relative to one bulb alone (0..1); state: on | off | gone
  ctx.save();
  if (state === 'gone') { ctx.strokeStyle = C.raw; ctx.setLineDash([3, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke(); ctx.restore(); return; }
  if (state === 'on' && rel > 0) {
    const k = Math.sqrt(Math.min(1, rel)), R = 11 + 15 * k, g = ctx.createRadialGradient(x, y, 4, x, y, R);
    g.addColorStop(0, `rgba(255,226,122,${0.45 + 0.55 * k})`); g.addColorStop(1, 'rgba(255,226,122,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
  }
  ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill();
  if (state === 'on' && rel > 0) { ctx.fillStyle = `rgba(255,226,122,${0.15 + 0.75 * Math.sqrt(Math.min(1, rel))})`; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); }
  ctx.strokeStyle = state === 'on' && rel > 0 ? C.yellow : C.raw; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke();
  ctx.restore();
}
// moving dots along a polyline, spaced `gap` px, shifted by `offset` px (offset grows as speed × time)
function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function pointAt(pts, s) {
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (s <= d) { const f = d ? s / d : 0; return [pts[i - 1][0] + f * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + f * (pts[i][1] - pts[i - 1][1])]; } s -= d; }
  return pts[pts.length - 1];
}
function dots(ctx, pts, offset, gap = 18, color = C.cyan) {
  const L = polyLen(pts); if (L <= 0) return;
  const o = ((offset % gap) + gap) % gap;
  for (let s = o; s < L; s += gap) { const [x, y] = pointAt(pts, s); dot(ctx, x, y, 2.6, color); }
}

/* ---------- flow animation (one loop, only visible canvases redraw) ---------- */
const flow = { on: !reduceMotion(), time: 0, raf: 0 };
const SPEED = 30;   // px per second per ampere
const visible = new Set();
function flowLabel() { ['flow0', 'flow1', 'flow4'].forEach(id => { $(id).textContent = t(flow.on ? 'flowOn' : 'flowOff'); }); }
function startFlow() {
  cancelAnimationFrame(flow.raf);
  if (!flow.on || document.hidden || reduceMotion()) return;
  let last = performance.now();
  const tick = now => { flow.time += Math.min(0.1, (now - last) / 1000); last = now; if (visible.has(0)) draw0(); if (visible.has(1)) draw1(); if (visible.has(4)) draw4(); flow.raf = requestAnimationFrame(tick); };
  flow.raf = requestAnimationFrame(tick);
}
function toggleFlow() { flow.on = !flow.on; flowLabel(); if (flow.on) startFlow(); else cancelAnimationFrame(flow.raf); }

/* ---------- step 0: series ---------- */
function draw0() {
  const r1 = num('r10'), r2 = num('r20'), q = M.series([r1, r2]);
  $('r10v').textContent = r1 + ' Ω'; $('r20v').textContent = r2 + ' Ω';
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0top'), 8, 20, W - 16);
  const L = 44, R = W - 28, T = 62, B = 178, by = (T + B) / 2;
  const x1 = L + (R - L) * 0.33, x2 = L + (R - L) * 0.7;
  // flow path from the + plate: up, right along the top, down, left along the bottom, up into the − plate
  const path = [[L, by - 6], [L, T], [R, T], [R, B], [L, B], [L, by + 6]];
  line(ctx, path, C.wire, 2);
  dots(ctx, path, flow.time * SPEED * q.I);
  battery(ctx, L, by); label(ctx, '12 V', L + 18, by + 4, C.text, 'left');
  resistor(ctx, x1, T, 'R₁ = ' + r1 + ' Ω'); resistor(ctx, x2, T, 'R₂ = ' + r2 + ' Ω');
  // potential around the loop, by path length
  const segs = [], add = (len, v0, v1, name) => segs.push({ len, v0, v1, name });
  add(12, 0, 12, t('batShort')); add(by - 6 - T, 12, 12); add(x1 - 22 - L, 12, 12); add(44, 12, q.steps[2], 'R₁'); add(x2 - 22 - (x1 + 22), q.steps[2], q.steps[2]); add(44, q.steps[2], 0, 'R₂'); add(R - (x2 + 22) + (B - T) + (R - L) + (B - by - 6), 0, 0);
  const total = segs.reduce((s, g) => s + g.len, 0);
  const pl = 40, pr = W - 14, pt = 236, pb = H - 34;
  title(ctx, t('c0bot'), 8, pt - 12, W - 16);
  const py = v => pb - v / 13 * (pb - pt);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [0, 6, 12].forEach(v => { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(pl, py(v)); ctx.lineTo(pr, py(v)); ctx.stroke(); ctx.fillText(String(v), pl - 6, py(v) + 4); });
  ctx.restore();
  let acc = 0; const pts = [];
  segs.forEach(g => { const xa = pl + acc / total * (pr - pl), xb = pl + (acc + g.len) / total * (pr - pl); pts.push([xa, py(g.v0)], [xb, py(g.v1)]); if (g.name) label(ctx, g.name, (xa + xb) / 2, pb + 16, g.name === 'R₁' || g.name === 'R₂' ? C.orange : C.muted, 'center', 11); acc += g.len; });
  line(ctx, pts, C.orange, 2.4);
  $('r0').textContent = t('s0readout', { r1, r2, R: q.R, I: fmt(q.I, 3), v1: fmt(q.V[0], 2), v2: fmt(q.V[1], 2), sum: fmt(q.V[0] + q.V[1], 2) });
}

/* ---------- parallel circuit drawing shared by steps 1 and 4 ---------- */
// main: [{name, current}] resistor on the left part of the top wire (optional); branches: [name1, name2]; I, I1, I2 currents
function ladder(ctx, W, o) {
  const L = 44, R = W - 28, T = 66, B = 214, by = (T + B) / 2;
  const a = o.r1 ? L + (R - L) * 0.42 : L + (R - L) * 0.3, b = R - (R - L) * 0.12, mid = T + 72;
  const main = [[b, T], [R, T], [R, B], [L, B], [L, by + 6], [L, by - 6], [L, T], [a, T]];
  const br1 = [[a, T], [b, T]], br2 = [[a, T], [a, mid], [b, mid], [b, T]];
  line(ctx, [[L, by - 6], [L, T], [R, T], [R, B], [L, B], [L, by + 6]]); line(ctx, br2);
  dots(ctx, main, flow.time * SPEED * o.I);
  dots(ctx, br1, flow.time * SPEED * o.I1); dots(ctx, br2, flow.time * SPEED * o.I2);
  battery(ctx, L, by); label(ctx, '12 V', L + 18, by + 4, C.text, 'left');
  if (o.r1) resistor(ctx, L + (a - L) * 0.5, T, o.r1);
  resistor(ctx, (a + b) / 2, T, o.n1, false, o.c1 || C.orange); resistor(ctx, (a + b) / 2, mid, o.n2, false, o.c2 || C.orange);
  [[a, T], [b, T]].forEach(([x, y]) => dot(ctx, x, y, 4, C.text));
}

/* ---------- step 1: parallel ---------- */
function draw1() {
  const r1 = num('r11'), r2 = num('r21'), q = M.parallel([r1, r2]);
  $('r11v').textContent = r1 + ' Ω'; $('r21v').textContent = r2 + ' Ω';
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1top'), 8, 20, W - 16);
  ladder(ctx, W, { n1: 'R₁ = ' + r1 + ' Ω', n2: 'R₂ = ' + r2 + ' Ω', I: q.I, I1: q.Ib[0], I2: q.Ib[1] });
  // current bars
  const pt = 270, l = 64, r = W - 16, rowH = 26;
  title(ctx, t('c1bot'), 8, pt - 12, W - 16);
  const x = v => l + v / 12 * (r - l);
  [[t('bI1'), [[q.Ib[0], C.cyan]]], [t('bI2'), [[q.Ib[1], C.green]]], [t('bI'), [[q.Ib[0], C.cyan], [q.Ib[1], C.green]]]].forEach(([name, parts], i) => {
    const y = pt + i * rowH; label(ctx, name, l - 8, y + 13, C.muted, 'right', 11);
    let acc = 0; parts.forEach(([v, col]) => { ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x(acc), y + 2, x(acc + v) - x(acc), 16); ctx.restore(); acc += v; });
  });
  xAxis(ctx, l, r, pt + 3 * rowH + 4, 0, 12, [1, 2, 3, 4, 6], v => fmt(v, 0));
  $('r1').textContent = t('s1readout', { r1, r2, i1: fmt(q.Ib[0], 2), i2: fmt(q.Ib[1], 2), I: fmt(q.I, 2), R: fmt(q.R, 2) });
}

/* ---------- step 2: one more bulb ---------- */
const s2 = { seen: new Set() };
function draw2() {
  const n = num('n2'), S = M.bulbs(n, 'series'), P = M.bulbs(n, 'parallel');
  s2.seen.add(n);
  $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  const L = 44, R = W - 24, gap = (R - L - 30) / n;
  // series row
  title(ctx, t('c2ser'), 8, 20, W - 16);
  const T1 = 52, B1 = 108;
  line(ctx, [[L, (T1 + B1) / 2 - 6], [L, T1], [R, T1], [R, B1], [L, B1], [L, (T1 + B1) / 2 + 6]]);
  battery(ctx, L, (T1 + B1) / 2);
  for (let k = 0; k < n; k++) bulb(ctx, L + 30 + gap * (k + 0.5), T1, S.rel);
  // parallel row
  title(ctx, t('c2par'), 8, 150, W - 16);
  const T2 = 172, B2 = 246;
  line(ctx, [[L, (T2 + B2) / 2 - 6], [L, T2], [R, T2]]); line(ctx, [[R, B2], [L, B2], [L, (T2 + B2) / 2 + 6]]);
  battery(ctx, L, (T2 + B2) / 2);
  for (let k = 0; k < n; k++) { const x = L + 30 + gap * (k + 0.5); line(ctx, [[x, T2], [x, B2]]); dot(ctx, x, T2, 3, C.wire); dot(ctx, x, B2, 3, C.wire); bulb(ctx, x, (T2 + B2) / 2, P.rel); }
  // total resistance against n
  const pt = 300, pb = H - 34, pl = 40, pr = W - 16;
  title(ctx, t('c2bot'), 8, pt - 12, W - 16);
  const py = v => pb - v / 38 * (pb - pt);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right';
  [0, 12, 24, 36].forEach(v => { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(pl, py(v)); ctx.lineTo(pr, py(v)); ctx.stroke(); ctx.fillText(String(v), pl - 6, py(v) + 4); });
  ctx.restore();
  const xn = xAxis(ctx, pl, pr, pb, 0.5, 6.5, [1], v => fmt(v, 0));
  const ns = [1, 2, 3, 4, 5, 6];
  line(ctx, ns.map(k => [xn(k), py(M.bulbs(k, 'series').R)]), C.orange, 1.2, [4, 4]);
  line(ctx, ns.map(k => [xn(k), py(M.bulbs(k, 'parallel').R)]), C.cyan, 1.2, [4, 4]);
  s2.seen.forEach(k => { dot(ctx, xn(k), py(M.bulbs(k, 'series').R), k === n ? 6 : 4, C.orange); dot(ctx, xn(k), py(M.bulbs(k, 'parallel').R), k === n ? 6 : 4, C.cyan); });
  $('r2').textContent = t('s2readout', { n, rs: fmt(S.R, 1), is: fmt(S.I, 2), ps: fmt(S.each, 2), pcts: fmt(S.rel * 100, 1), rp: fmt(P.R, 2), ip: fmt(P.I, 1), pp: fmt(P.each, 1) });
}

/* ---------- step 3: unscrew a bulb ---------- */
const s3 = { mode: 'series', present: [true, true, true] };
function draw3() {
  const q = M.removeBulbs(s3.mode, s3.present), modeName = t(s3.mode === 'series' ? 'modeSer' : 'modePar');
  $('modeSer').setAttribute('aria-pressed', s3.mode === 'series' ? 'true' : 'false'); $('modePar').setAttribute('aria-pressed', s3.mode === 'parallel' ? 'true' : 'false');
  [1, 2, 3].forEach(k => { $('bulb' + k).textContent = t('bulbBtn', { k }); $('bulb' + k).setAttribute('aria-pressed', s3.present[k - 1] ? 'false' : 'true'); });
  const { ctx, W } = fitCanvas($('c3'));
  title(ctx, t('c3', { mode: modeName }), 8, 20, W - 16);
  const L = 44, R = W - 24, T = 60, B = 160, gap = (R - L - 30) / 3;
  const state = k => (!s3.present[k] ? 'gone' : q.lit[k] ? 'on' : 'off');
  if (s3.mode === 'series') {
    const yb = (T + B) / 2;
    line(ctx, [[L, yb - 6], [L, T], [R, T], [R, B], [L, B], [L, yb + 6]]);
    battery(ctx, L, yb);
    for (let k = 0; k < 3; k++) { const x = L + 30 + gap * (k + 0.5); if (!s3.present[k]) { ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(x - 12, T - 4, 24, 8); ctx.restore(); } bulb(ctx, x, T, q.each[k] / 24, state(k)); label(ctx, String(k + 1), x, T + 28, C.muted); }
  } else {
    const yb = (T + B) / 2;
    line(ctx, [[L, yb - 6], [L, T], [R, T]]); line(ctx, [[R, B], [L, B], [L, yb + 6]]);
    battery(ctx, L, yb);
    for (let k = 0; k < 3; k++) {
      const x = L + 30 + gap * (k + 0.5);
      line(ctx, [[x, T], [x, yb - 9]]); line(ctx, [[x, yb + 9], [x, B]]);
      if (!s3.present[k]) { ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(x - 4, yb - 12, 8, 24); ctx.restore(); }
      bulb(ctx, x, yb, q.each[k] / 24, state(k)); label(ctx, String(k + 1), x + 22, yb + 4, C.muted, 'left');
    }
  }
  const k = s3.present.filter(Boolean).length, lit = q.lit.filter(Boolean).length;
  const note = s3.mode === 'series' ? (k === 0 ? t('note3None') : q.closed ? t('note3SerAll') : t('note3SerOpen')) : (k === 0 ? t('note3None') : t('note3Par'));
  $('r3').textContent = t('s3readout', { mode: modeName, k, lit, I: fmt(q.I, 2), note });
}

/* ---------- step 4: mixed ---------- */
function draw4() {
  const r1 = num('r14'), r2 = num('r24'), r3 = num('r34'), q = M.mixed(r1, r2, r3);
  $('r14v').textContent = r1 + ' Ω'; $('r24v').textContent = r2 + ' Ω'; $('r34v').textContent = r3 + ' Ω';
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4top'), 8, 20, W - 16);
  ladder(ctx, W, { r1: 'R₁', n1: 'R₂', n2: 'R₃', c1: C.orange, c2: C.cyan, I: q.I, I1: q.I2, I2: q.I3 });
  const l = 40, r = W - 16;
  const bars = (top, ttl, parts, max, steps) => {
    title(ctx, ttl, 8, top - 10, W - 16);
    const x = v => l + v / max * (r - l); let acc = 0;
    parts.forEach(([v, col]) => { ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x(acc), top, x(acc + v) - x(acc), 18); ctx.restore(); acc += v; });
    xAxis(ctx, l, r, top + 22, 0, max, steps, v => fmt(v, 1));
  };
  bars(272, t('c4v'), [[q.V1, C.orange], [q.V23, C.cyan]], 12, [1, 2, 3, 4, 6]);
  bars(H - 70, t('c4i'), [[q.I2, C.orange], [q.I3, C.cyan]], 4, [0.5, 1, 2]);
  $('r4').textContent = t('s4readout', { r23: fmt(q.R23, 2), R: fmt(q.R, 2), I: fmt(q.I, 3), v1: fmt(q.V1, 2), v23: fmt(q.V23, 2), vs: fmt(q.V1 + q.V23, 2), i2: fmt(q.I2, 3), i3: fmt(q.I3, 3), is: fmt(q.I2 + q.I3, 3) });
}

/* ---------- step 5: at home ---------- */
const s5 = { on: [false, false, false, false], tripped: false, msg: '' };
const AP_KEYS = ['ap_kettle', 'ap_heater', 'ap_cooker', 'ap_lamp'];
function draw5() {
  const q = M.household(s5.on), live = !s5.tripped;
  M.APPLIANCES.forEach((_, k) => $('ap' + k).setAttribute('aria-pressed', s5.on[k] ? 'true' : 'false'));
  $('reset5').disabled = !s5.tripped;
  const { ctx, W, H } = fitCanvas($('c5'));
  title(ctx, t('c5top'), 8, 20, W - 16);
  const L = 30, R = W - 20, T = 62, B = 160, x0 = L + 76, gap = (R - x0) / 4;
  // source and breaker on the main line
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(L, (T + B) / 2, 13, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L - 7, (T + B) / 2); ctx.bezierCurveTo(L - 3, (T + B) / 2 - 8, L + 3, (T + B) / 2 + 8, L + 7, (T + B) / 2); ctx.stroke(); ctx.restore();
  line(ctx, [[L, (T + B) / 2 - 13], [L, T], [L + 26, T]]); line(ctx, [[L + 56, T], [R, T]], live ? C.wire : C.raw);
  line(ctx, [[L, (T + B) / 2 + 13], [L, B], [R, B]], live ? C.wire : C.raw);
  // breaker: a switch that opens when tripped
  ctx.save(); ctx.strokeStyle = s5.tripped ? C.pink : C.green; ctx.lineWidth = 2.5; ctx.strokeRect(L + 24, T - 12, 34, 24);
  ctx.beginPath(); ctx.moveTo(L + 30, T); ctx.lineTo(L + 52, s5.tripped ? T - 9 : T); ctx.stroke(); ctx.restore();
  M.APPLIANCES.forEach((a, k) => {
    const x = x0 + gap * (k + 0.5), run = live && s5.on[k];
    line(ctx, [[x, T], [x, B]], live ? C.wire : C.raw); dot(ctx, x, T, 3, C.wire); dot(ctx, x, B, 3, C.wire);
    bulb(ctx, x, (T + B) / 2, run ? Math.min(1, 0.35 + a.P / 2000 * 0.65) : 0, run ? 'on' : 'off');
    label(ctx, '①②③④'[k], x, B + 26, s5.on[k] ? C.yellow : C.muted, 'center', 17);
  });
  // main-line current bar
  const top = 238, l = 40, r = W - 16, max = 24, x = v => l + v / max * (r - l);
  title(ctx, t('c5bot'), 8, top - 12, W - 16);
  let acc = 0; const cols = [C.cyan, C.green, C.orange, C.yellow];
  q.I.forEach((v, k) => { if (!v) return; ctx.save(); if (live) { ctx.fillStyle = cols[k]; ctx.globalAlpha = 0.85; ctx.fillRect(x(acc), top, x(acc + v) - x(acc), 20); } else { ctx.strokeStyle = cols[k]; ctx.setLineDash([3, 3]); ctx.strokeRect(x(acc) + 0.5, top + 0.5, x(acc + v) - x(acc) - 1, 19); } ctx.restore(); acc += v; });
  ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x(M.BREAKER), top - 6); ctx.lineTo(x(M.BREAKER), top + 26); ctx.stroke(); ctx.restore();
  xAxis(ctx, l, r, top + 30, 0, max, [2, 4, 6, 8, 12], v => fmt(v, 0));
  const names = M.APPLIANCES.map((a, k) => (s5.on[k] ? t(AP_KEYS[k]) : null)).filter(Boolean);
  const state = s5.tripped ? s5.msg : t('st5Ok');
  $('r5').textContent = t('s5readout', { list: names.length ? names.join(lang() === 'zh' ? '、' : ', ') : t('noneOn'), I: fmt(live ? q.total : 0, 2), breaker: M.BREAKER, state });
}
function toggleAp(k) {
  s5.on[k] = !s5.on[k];
  if (!s5.tripped && M.household(s5.on).over) { s5.tripped = true; s5.msg = t('st5Trip'); }
  draw5();
}
function resetBreaker() {
  if (!s5.tripped) return;
  if (M.household(s5.on).over) s5.msg = t('st5Retrip'); else { s5.tripped = false; s5.msg = ''; }
  draw5();
}

/* ---------- text with model-computed numbers ---------- */
function fillText() {
  const A = M.APPLIANCES.map(a => a.P / M.MAINS);
  const P = { s5e: { mains: M.MAINS, breaker: M.BREAKER } };
  document.querySelectorAll('[data-i18n-html]').forEach(node => { const k = node.dataset.i18nHtml; node.innerHTML = t(k, P[k] || {}); });
  $('h5').textContent = t('s5hint', { ik: fmt(A[0], 2), ih: fmt(A[1], 2), both: fmt(A[0] + A[1], 2), breaker: M.BREAKER, ic: fmt(A[2], 2), il: fmt(A[3], 2) });
  if (s5.tripped) s5.msg = t(M.household(s5.on).over && s5.msg === t('st5Retrip') ? 'st5Retrip' : 'st5Trip');
  flowLabel();
}

function refresh() { fillText(); draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['r10', 'r20'].forEach(id => $(id).addEventListener('input', draw0));
  ['r11', 'r21'].forEach(id => $(id).addEventListener('input', draw1));
  $('n2').addEventListener('input', draw2);
  $('modeSer').addEventListener('click', () => { s3.mode = 'series'; draw3(); });
  $('modePar').addEventListener('click', () => { s3.mode = 'parallel'; draw3(); });
  [1, 2, 3].forEach(k => $('bulb' + k).addEventListener('click', () => { s3.present[k - 1] = !s3.present[k - 1]; draw3(); }));
  ['r14', 'r24', 'r34'].forEach(id => $(id).addEventListener('input', draw4));
  M.APPLIANCES.forEach((_, k) => $('ap' + k).addEventListener('click', () => toggleAp(k)));
  $('reset5').addEventListener('click', resetBreaker);
  ['flow0', 'flow1', 'flow4'].forEach(id => $(id).addEventListener('click', toggleFlow));
  if (reduceMotion()) ['flow0', 'flow1', 'flow4'].forEach(id => { $(id).disabled = true; });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
    const vis = new IntersectionObserver(es => es.forEach(e => { const i = steps.indexOf(e.target); if (e.isIntersecting) visible.add(i); else visible.delete(i); }));
    steps.forEach(s => vis.observe(s));
  } else [0, 1, 4].forEach(i => visible.add(i));
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(flow.raf); else startFlow(); });
  window.refreshSeriesParallel = refresh;
  refresh();
  startFlow();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
