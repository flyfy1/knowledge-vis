'use strict';
// Intervals & fences lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every tree, post, cut and time on the canvases comes from window.IF_MODEL (model.js).
// Canvas text goes through a per-draw label layout (labels()) that keeps labels inside the canvas and
// drops optional labels (tree numbers, tick numbers) that would touch another label.
(function () {

const $ = id => document.getElementById(id);
const M = window.IF_MODEL;
const t = (...a) => window.IF_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', wood: '#b98a5a', woodDark: '#7d5a37', tree: '#5fcf8a', trunk: '#8a6a48', road: '#3a4656' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 240; canvas.style.height = canvas.dataset.h + 'px'; }
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

// Label layout for one draw: every label is measured, clamped inside the canvas and checked against the
// labels already placed. Optional labels are skipped on contact; required labels try nearby rows, then shrink.
function labels(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  function put(text, x, y, o = {}) {
    const align = o.align || 'center';
    let size = o.size || 12;
    for (; size >= 8; size -= 0.5) {
      ctx.font = `${o.weight || 400} ${size}px system-ui,sans-serif`;
      const m = ctx.measureText(text), w = m.width;
      if (w > W - 8 && size > 8) continue;
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      x0 = Math.max(4, Math.min(W - 4 - w, x0));
      const shifts = o.optional ? [0] : (o.shifts || [0, 1, -1, 2, -2]);
      for (const s of shifts) {
        const yy = y + s * (asc + desc + 4);
        const b = { x0: x0 - 2, x1: x0 + w + 2, y0: yy - asc - 2, y1: yy + desc + 2 };
        if (b.y0 < 0 || b.y1 > H) continue;
        if (!hit(b)) {
          boxes.push(b);
          ctx.save(); ctx.textAlign = 'left'; ctx.fillStyle = o.color || C.text; ctx.fillText(text, x0, yy); ctx.restore();
          return true;
        }
      }
      if (o.optional) return false;
    }
    return false;
  }
  return { put, block: b => boxes.push(b) };
}
const titleOf = (L, text, y = 17) => L.put(text, 8, y, { align: 'left', weight: 600, size: 13, shifts: [0] });

function niceStep(span, px, minPx, steps = [1, 2, 5, 10, 20, 50]) { for (const s of steps) if (s / span * px >= minPx) return s; return steps[steps.length - 1]; }
function axis(ctx, L, x, y0, max, x0px, x1px, unit) {
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0px, y0); ctx.lineTo(x1px, y0); ctx.stroke(); ctx.restore();
  const step = niceStep(max, x1px - x0px, 34);
  for (let v = 0; v <= max + 1e-9; v += step) {
    ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), y0); ctx.lineTo(x(v), y0 + 4); ctx.stroke(); ctx.restore();
    L.put(fmt(v, 1) + (v === 0 && unit ? ' ' + unit : ''), x(v), y0 + 16, { optional: true, color: C.muted, size: 11 });
  }
}

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[name]; if (done) done(); }
  };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- drawing pieces ---------- */
function tree(ctx, x, yGround, r, ghost = false) {
  ctx.save();
  if (ghost) {
    ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(x, yGround - 14 - r, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const q = r * 0.6; ctx.beginPath(); ctx.moveTo(x - q, yGround - 14 - r - q); ctx.lineTo(x + q, yGround - 14 - r + q); ctx.moveTo(x + q, yGround - 14 - r - q); ctx.lineTo(x - q, yGround - 14 - r + q); ctx.stroke();
  } else {
    ctx.strokeStyle = C.trunk; ctx.lineWidth = Math.max(1.5, r * 0.35); ctx.beginPath(); ctx.moveTo(x, yGround); ctx.lineTo(x, yGround - 14); ctx.stroke();
    ctx.fillStyle = C.tree; ctx.beginPath(); ctx.arc(x, yGround - 14 - r, r, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function gapBar(ctx, xa, xb, y, i, alpha = 0.9) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = i % 2 ? C.green : C.cyan;
  const pad = Math.min(2, (xb - xa) * 0.15); ctx.fillRect(xa + pad, y, Math.max(1, xb - xa - 2 * pad), 7); ctx.restore();
}

// A straight road with trees by mode (or the ring for 'loop'). Returns nothing; labels go through L.
function drawPlanting(ctx, L, W, H, top, road, mode, opts = {}) {
  const pl = M.plant(road.L, road.d, mode);
  if (mode === 'loop') return drawRing(ctx, L, W, H, top, road, pl, opts);
  const pad = 24, x = v => pad + v / (opts.scaleL || road.L) * (W - 2 * pad);
  const yRoad = top + 70, sp = x(road.d) - x(0), r = Math.max(2.5, Math.min(9, sp * 0.33));
  ctx.fillStyle = C.road; ctx.fillRect(x(0) - 6, yRoad, x(road.L) - x(0) + 12, 10);
  for (let i = 0; i < pl.gaps; i++) gapBar(ctx, x(i * road.d), x((i + 1) * road.d), yRoad + 18, i);
  pl.removed.forEach(v => tree(ctx, x(v), yRoad, r, true));
  pl.pos.forEach(v => tree(ctx, x(v), yRoad, r));
  // tree numbers above crowns, gap numbers under the bars (skipped when crowded)
  pl.pos.forEach((v, i) => L.put(String(i + 1), x(v), yRoad - 20 - 2 * r, { optional: true, size: 11, color: C.tree }));
  for (let i = 0; i < pl.gaps; i++) L.put(String(i + 1), (x(i * road.d) + x((i + 1) * road.d)) / 2, yRoad + 40, { optional: true, size: 11, color: i % 2 ? C.green : C.cyan });
  axis(ctx, L, x, yRoad + 52, road.L, x(0), x(road.L), t('unitM'));
}
function drawRing(ctx, L, W, H, top, road, pl, opts) {
  const cx = W / 2, cy = top + (H - top) / 2 + 2, R = Math.max(40, Math.min(90, (H - top) / 2 - 30, W / 2 - 46));
  const ang = v => -Math.PI / 2 + 2 * Math.PI * v / road.L, P = (v, rr) => [cx + rr * Math.cos(ang(v)), cy + rr * Math.sin(ang(v))];
  ctx.save(); ctx.strokeStyle = C.road; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
  for (let i = 0; i < pl.gaps; i++) {
    ctx.save(); ctx.strokeStyle = i % 2 ? C.green : C.cyan; ctx.lineWidth = 6; ctx.beginPath();
    const a0 = ang(i * road.d), a1 = ang((i + 1) * road.d), padA = Math.min(0.04, (a1 - a0) * 0.12);
    ctx.arc(cx, cy, R - 14, a0 + padA, a1 - padA); ctx.stroke(); ctx.restore();
  }
  const sp = R * 2 * Math.PI * road.d / road.L, r = Math.max(2.5, Math.min(8, sp * 0.3));
  pl.pos.forEach(v => { const [px, py] = P(v, R); ctx.save(); ctx.fillStyle = C.tree; ctx.beginPath(); ctx.arc(px, py, r + 1, 0, 7); ctx.fill(); ctx.restore(); });
  // start = end marker
  const [sx, sy] = P(0, R);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, r + 5, 0, 7); ctx.stroke(); ctx.restore();
  L.put(t('startEnd'), sx, sy - r - 12, { color: C.orange, size: 12 });
  pl.pos.forEach((v, i) => { if (i === 0) return; const [px, py] = P(v, R + 15 + r); L.put(String(i + 1), px, py + 4, { optional: true, size: 11, color: C.tree }); });
}

/* ---------- step 0: posts and panels ---------- */
const s0 = { paired: 5 };
function draw0() {
  const n = num('n0'), f = M.fence(n), k = Math.min(n, s0.paired);
  $('n0v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c0')), L = labels(ctx, W, H);
  titleOf(L, t('c0title'));
  const pad = 26, x = i => pad + i / n * (W - 2 * pad), sp = x(1) - x(0), pw = Math.max(4, Math.min(10, sp * 0.28));
  const yTop = 62, yBot = 142;
  f.panels.forEach((p, i) => {
    const claimed = i < k;
    ctx.save(); ctx.fillStyle = claimed ? '#2a5868' : C.wood; ctx.fillRect(x(p.left) + pw / 2, yTop + 16, sp - pw, 46);
    ctx.strokeStyle = claimed ? C.cyan : C.woodDark; ctx.lineWidth = 1.5; ctx.strokeRect(x(p.left) + pw / 2, yTop + 16, sp - pw, 46); ctx.restore();
    if (claimed) { // link: panel → its left post
      ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(x(p.left) + sp / 2, yBot - 12); ctx.quadraticCurveTo(x(p.left) + sp / 2, yBot + 8, x(p.left), yBot + 4); ctx.stroke(); ctx.restore();
    }
  });
  f.posts.forEach(i => {
    const claimed = i < k, spare = k === n && f.unclaimed.includes(i);
    ctx.save(); ctx.fillStyle = spare ? C.orange : claimed ? C.cyan : C.woodDark; ctx.fillRect(x(i) - pw / 2, yTop, pw, yBot - yTop); ctx.restore();
  });
  f.panels.forEach((p, i) => L.put(String(i + 1), x(p.left) + sp / 2, yTop + 44, { optional: true, size: 12, color: i < k ? C.text : '#2b1d10' }));
  f.posts.forEach(i => L.put(String(i + 1), x(i), yBot + 24, { optional: true, size: 11, color: C.muted }));
  if (k === n) L.put(t('spareTag'), x(n), yTop - 10, { color: C.orange, size: 12, align: 'right' });
  $('r0').textContent = k < n ? t('s0progress', { k, n }) : t('s0readout', { n, p: f.posts.length, last: f.unclaimed[0] + 1 });
}

/* ---------- step 1: road length ÷ spacing ---------- */
function draw1() {
  const Lm = num('L1'), d = num('d1'), r = M.road(Lm, d);
  $('L1v').textContent = t('meters', { v: Lm }); $('d1v').textContent = t('meters', { v: d });
  const { ctx, W, H } = fitCanvas($('c1')), L = labels(ctx, W, H);
  titleOf(L, t('c1title', { L: Lm, d }));
  const pad = 24, x = v => pad + v / Lm * (W - 2 * pad), yRoad = 100, sp = x(d) - x(0), rr = Math.max(2.5, Math.min(9, sp * 0.33));
  ctx.fillStyle = C.road; ctx.fillRect(x(0) - 6, yRoad, x(Lm) - x(0) + 12, 10);
  for (let i = 0; i < r.gaps; i++) gapBar(ctx, x(i * d), x((i + 1) * d), yRoad + 18, i);
  if (r.rest > 0) {
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(x(r.gaps * d) + 2, yRoad + 18, x(Lm) - x(r.gaps * d) - 4, 7); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x(Lm), yRoad - 30); ctx.lineTo(x(Lm), yRoad + 10); ctx.stroke(); ctx.restore();
    L.put(t('restTag', { r: r.rest }), x(Lm), yRoad - 40, { color: C.pink, size: 12, align: 'right' });
  }
  r.pos.forEach(v => tree(ctx, x(v), yRoad, rr));
  r.pos.forEach((v, i) => L.put(String(i + 1), x(v), yRoad - 20 - 2 * rr, { optional: true, size: 11, color: C.tree }));
  for (let i = 0; i < r.gaps; i++) L.put(String(i + 1), (x(i * d) + x((i + 1) * d)) / 2, yRoad + 40, { optional: true, size: 11, color: i % 2 ? C.green : C.cyan });
  axis(ctx, L, x, yRoad + 54, Lm, x(0), x(Lm), t('unitM'));
  $('r1').textContent = r.divisible ? t('s1readout', { L: Lm, d, g: r.gaps, n: r.trees }) : t('s1bad', { L: Lm, d, g: r.gaps, r: r.rest });
}

/* ---------- step 2: four ways to handle the ends ---------- */
const D24 = [2, 3, 4, 6, 8, 12];
const s2 = { mode: 'both', seen: new Set(['both']) };
function draw2() {
  const d = D24[num('d2')], road = { L: 24, d };
  $('d2v').textContent = t('meters', { v: d });
  M.MODES.forEach(m => $('m2' + m).setAttribute('aria-pressed', String(m === s2.mode)));
  const { ctx, W, H } = fitCanvas($('c2')), L = labels(ctx, W, H);
  titleOf(L, t('c2title', { mode: t('mode_' + s2.mode), d }));
  drawPlanting(ctx, L, W, H, s2.mode === 'loop' ? 26 : 70, road, s2.mode);
  const pl = M.plant(24, d, s2.mode);
  $('r2').textContent = t('s2readout', { mode: t('mode_' + s2.mode), g: pl.gaps, n: pl.trees, diff: (pl.diff > 0 ? '+' : '') + pl.diff, why: t('why_' + s2.mode) });
  const body = $('tbl2').tBodies[0]; body.innerHTML = '';
  M.MODES.forEach(m => {
    const p = M.plant(24, d, m), seen = s2.seen.has(m), tr = document.createElement('tr');
    if (m === s2.mode) tr.className = 'cur';
    const cells = [t('mode_' + m), seen ? p.gaps : '?', seen ? p.trees : '?', seen ? (p.diff > 0 ? '+' : '') + p.diff : '?'];
    cells.forEach((c, i) => { const td = document.createElement('td'); td.textContent = String(c); if (!seen && i) td.className = 'unk'; tr.appendChild(td); });
    body.appendChild(tr);
  });
}

/* ---------- step 3: sawing ---------- */
const s3 = { cuts: 0 };
function draw3() {
  const k = num('k3'), per = num('per3'), c = Math.min(s3.cuts, k - 1), sw = M.saw(c, per), target = M.saw(k - 1, per);
  $('k3v').textContent = t('pieces', { v: k }); $('per3v').textContent = t('minutes', { v: per });
  $('cut3').disabled = c >= k - 1; $('all3').disabled = c >= k - 1;
  const { ctx, W, H } = fitCanvas($('c3')), L = labels(ctx, W, H);
  titleOf(L, t('c3title', { k }));
  // the log: k equal pieces planned; the first c cut lines are done
  const pad = 24, gap = 6, y0 = 44, h = 40, unit = (W - 2 * pad - gap * c) / k;
  let xx = pad;
  // c pieces already sawn off (one unit each), then the uncut rest (k − c units) with dashed planned marks
  for (let i = 0; i <= c; i++) {
    const pieceW = unit * (i === c ? k - c : 1);
    ctx.save(); ctx.fillStyle = C.wood; ctx.fillRect(xx, y0, pieceW, h); ctx.strokeStyle = C.woodDark; ctx.lineWidth = 1.5; ctx.strokeRect(xx, y0, pieceW, h); ctx.restore();
    if (i === c) for (let j = 1; j < k - c; j++) { const mx = xx + unit * j; ctx.save(); ctx.strokeStyle = '#4b3520'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mx, y0 + 3); ctx.lineTo(mx, y0 + h - 3); ctx.stroke(); ctx.restore(); }
    L.put(String(i + 1), xx + pieceW / 2, y0 + h / 2 + 4, { optional: true, size: 12, color: '#2b1d10', weight: 700 });
    xx += pieceW;
    if (i < c) { ctx.save(); ctx.fillStyle = C.orange; ctx.fillRect(xx + gap / 2 - 1, y0 - 8, 2, h + 16); ctx.restore(); xx += gap; }
  }
  // timeline: actual (one bar per cut) vs the wrong count (one bar per piece)
  const tl = 24, tr = W - 24, maxT = k * per, X = v => tl + v / maxT * (tr - tl);
  const yA = 132, yB = 196;
  L.put(t('c3rowA', { c, m: sw.minutes }), tl, yA - 10, { align: 'left', size: 12, color: C.orange, shifts: [0] });
  for (let i = 0; i < c; i++) { ctx.save(); ctx.fillStyle = C.orange; ctx.globalAlpha = 0.85; ctx.fillRect(X(i * per) + 1, yA, X(per) - X(0) - 2, 18); ctx.restore(); L.put(String(i + 1), X((i + 0.5) * per), yA + 13, { optional: true, size: 11, color: '#2b1d10', weight: 700 }); }
  L.put(t('c3rowB', { k, m: target.wrongMinutes }), tl, yB - 10, { align: 'left', size: 12, color: C.pink, shifts: [0] });
  for (let i = 0; i < k; i++) { ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(X(i * per) + 1.5, yB, X(per) - X(0) - 3, 18); ctx.restore(); }
  axis(ctx, L, X, 238, maxT, tl, tr, t('unitMin'));
  $('r3').textContent = c < k - 1 ? t('s3progress', { c, p: c + 1, k, m: sw.minutes }) : t('s3readout', { k, c, per, m: sw.minutes, w: target.wrongMinutes });
}

/* ---------- step 4: clock strikes and stairs ---------- */
const s4 = { sc: 'clock' };
function draw4() {
  const a = num('a4'), T = num('T4'), b = num('b4'), e = M.events(a, T, b), stairs = s4.sc === 'stairs';
  ['clock', 'stairs'].forEach(s => $('sc4' + s).setAttribute('aria-pressed', String(s === s4.sc)));
  $('a4lab').textContent = t(stairs ? 'a4stairs' : 'a4clock'); $('b4lab').textContent = t(stairs ? 'b4stairs' : 'b4clock');
  $('lg4ev').textContent = t(stairs ? 'lg4floor' : 'lg4strike');
  $('a4v').textContent = String(a); $('T4v').textContent = t('seconds', { v: T }); $('b4v').textContent = String(b);
  const { ctx, W, H } = fitCanvas($('c4')), L = labels(ctx, W, H);
  const maxT = Math.max(T, e.timeB, e.wrong) * 1.04, tl = 24, tr = W - 24, X = v => tl + v / maxT * (tr - tl);
  const row = (times, yTop, hgt, col) => {
    const n = times.length, yb = yTop + hgt, Y = i => stairs ? yb - i / Math.max(1, n - 1) * (hgt - 8) : yb - hgt / 2;
    for (let i = 0; i + 1 < n; i++) {
      ctx.save(); ctx.strokeStyle = i % 2 ? C.green : C.cyan; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
      if (stairs) { ctx.moveTo(X(times[i]), Y(i)); ctx.lineTo(X(times[i + 1]), Y(i + 1)); } else { ctx.moveTo(X(times[i]) + 5, Y(i)); ctx.lineTo(X(times[i + 1]) - 5, Y(i)); }
      ctx.stroke(); ctx.restore();
    }
    times.forEach((tt, i) => { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(tt), Y(i), 4.5, 0, 7); ctx.fill(); ctx.restore(); });
    return Y;
  };
  titleOf(L, t(stairs ? 'c4knownStairs' : 'c4knownClock', { a, T, g: e.gapsA, p: fmt(e.per) }));
  row(e.timesA, 30, 70, C.text);
  L.put(t(stairs ? 'c4askStairs' : 'c4askClock', { b, g: e.gapsB, s: fmt(e.timeB) }), 8, 128, { align: 'left', weight: 600, size: 13, shifts: [0] });
  row(e.timesB, 140, 70, C.text);
  // the wrong proportional answer as a dashed bar under the asked row
  const yW = 236;
  ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), yW); ctx.lineTo(X(e.wrong), yW); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(X(e.wrong), yW - 6); ctx.lineTo(X(e.wrong), yW + 6); ctx.stroke(); ctx.restore();
  // right answer marker on the same line
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(e.timeB), 140); ctx.lineTo(X(e.timeB), yW + 6); ctx.stroke(); ctx.restore();
  L.put(t('c4wrong', { w: fmt(e.wrong) }), tl, yW + 20, { align: 'left', size: 12, color: C.pink, shifts: [0, 1] });
  axis(ctx, L, X, 284, maxT / 1.04, tl, X(maxT / 1.04), t('unitS'));
  $('r4').textContent = t(stairs ? 's4readoutStairs' : 's4readoutClock', { a, T, ga: e.gapsA, p: fmt(e.per), b, gb: e.gapsB, s: fmt(e.timeB), w: fmt(e.wrong), cmp: t(b > a ? 'cmpLess' : b < a ? 'cmpMore' : 'cmpSame', { a }) });
}

/* ---------- step 5: backwards — trees given, find the road ---------- */
const s5 = { mode: 'none' };
function draw5() {
  const T = num('T5'), d = num('d5'), rr = M.roadFromTrees(T, d, s5.mode);
  $('T5v').textContent = t('treesN', { v: T }); $('d5v').textContent = t('meters', { v: d });
  M.MODES.forEach(m => $('m5' + m).setAttribute('aria-pressed', String(m === s5.mode)));
  const { ctx, W, H } = fitCanvas($('c5')), L = labels(ctx, W, H);
  titleOf(L, t('c5title', { mode: t('mode_' + s5.mode), T, d }));
  drawPlanting(ctx, L, W, H, s5.mode === 'loop' ? 26 : 58, { L: rr.L, d }, s5.mode, { scaleL: (T + 1) * d });
  $('r5').textContent = t('s5readout', { T, mode: t('mode_' + s5.mode), g: rr.gaps, rel: t('rel_' + s5.mode, { T }), d, L: rr.L });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  $('n0').addEventListener('input', () => { stopAnim('s0'); s0.paired = num('n0'); draw0(); });
  $('pair0').addEventListener('click', () => {
    const n = num('n0'); s0.paired = 0; draw0();
    animate('s0', (n + 1) * 450, p => { s0.paired = Math.min(n, Math.floor(p * (n + 1))); draw0(); });
  });
  ['L1', 'd1'].forEach(id => $(id).addEventListener('input', draw1));
  M.MODES.forEach(m => $('m2' + m).addEventListener('click', () => { s2.mode = m; s2.seen.add(m); draw2(); }));
  $('d2').addEventListener('input', draw2);
  $('k3').addEventListener('input', () => { stopAnim('s3'); s3.cuts = 0; draw3(); });
  $('per3').addEventListener('input', draw3);
  $('cut3').addEventListener('click', () => { stopAnim('s3'); s3.cuts = Math.min(num('k3') - 1, s3.cuts + 1); draw3(); });
  $('all3').addEventListener('click', () => {
    const from = s3.cuts, to = num('k3') - 1;
    animate('s3', (to - from) * 600, p => { s3.cuts = from + Math.floor(p * (to - from)); draw3(); });
  });
  $('reset3').addEventListener('click', () => { stopAnim('s3'); s3.cuts = 0; draw3(); });
  ['clock', 'stairs'].forEach(s => $('sc4' + s).addEventListener('click', () => { s4.sc = s; draw4(); }));
  ['a4', 'T4', 'b4'].forEach(id => $(id).addEventListener('input', draw4));
  M.MODES.forEach(m => $('m5' + m).addEventListener('click', () => { s5.mode = m; draw5(); }));
  ['T5', 'd5'].forEach(id => $(id).addEventListener('input', draw5));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), Q = M.QUIZ, ans = M.roadFromTrees(Q.T, Q.d, Q.mode).L;
    const ok = !!choice && Q.options[choice.value] === ans;
    const fb = $('quizFeedback');
    fb.textContent = !choice ? t('pickOne') : ok ? t('correct', { L: ans }) : t('wrong', { L: Q.options[choice.value] });
    fb.style.color = ok ? C.green : C.orange; fb.dataset.state = !choice ? 'none' : ok ? 'correct' : 'wrong';
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target)));
    }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshFences = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) $('checkQuiz').click(); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
