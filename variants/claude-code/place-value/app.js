'use strict';
// Place value lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every stick, bead, block and digit drawn comes from window.PV_MODEL (model.js).
// Canvas text goes through a per-draw label layout (labels()) that keeps labels inside the canvas and
// drops optional labels that would touch another label.
(function () {

const $ = id => document.getElementById(id);
const M = window.PV_MODEL;
const t = (...a) => window.PV_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', stick: '#e6c86e', stickDark: '#9c8442', dim: '#3a4656', rod: '#55657a' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const PLACE_KEYS = ['pTh', 'pH', 'pT', 'pO'];

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 260; canvas.style.height = canvas.dataset.h + 'px'; }
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

// Label layout for one draw (same contract as the other Claude editions in this batch).
function labels(ctx, W, H) {
  const boxes = [];
  const hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  function put(text, x, y, o = {}) {
    const align = o.align || 'center', maxW = o.maxW || W - 8;
    for (let size = o.size || 12; size >= 8; size -= 0.5) {
      ctx.font = `${o.weight || 400} ${size}px system-ui,sans-serif`;
      const m = ctx.measureText(text), w = m.width;
      if (w > maxW && size > 8) continue;
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
  return { put };
}
const titleOf = (L, text, y = 17) => L.put(text, 8, y, { align: 'left', weight: 600, size: 13, shifts: [0] });

/* ---------- shared animation runner ---------- */
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
function stopAnim(name) { if (anims[name]) { const a = anims[name]; cancelAnimationFrame(a.id); delete anims[name]; return a; } return null; }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- drawing pieces ---------- */
function stick(ctx, x, y, h) { ctx.fillStyle = C.stick; ctx.fillRect(x, y, 3, h); }
function tenBundle(ctx, x, y, w, h) {
  ctx.save(); ctx.fillStyle = C.stick; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.stickDark; ctx.lineWidth = 0.6;
  for (let i = 1; i < 10; i++) { const xx = x + w * i / 10; ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); ctx.stroke(); }
  ctx.fillStyle = C.cyan; ctx.fillRect(x - 1, y + h * 0.45, w + 2, Math.max(3, h * 0.1)); ctx.restore();
}
function hundredBundle(ctx, x, y, w, h) {
  ctx.save(); ctx.fillStyle = C.stick; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.stickDark; ctx.lineWidth = 0.8;
  for (let i = 1; i < 10; i++) { const xx = x + w * i / 10; ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); ctx.stroke(); }
  ctx.fillStyle = C.orange; ctx.fillRect(x - 2, y + h * 0.28, w + 4, 4); ctx.fillRect(x - 2, y + h * 0.66, w + 4, 4); ctx.restore();
}
// Lay out `n` items of width iw in a box; returns positions (row-major, left to right).
function grid(n, x0, x1, y0, y1, iw, gap, ihMax) {
  if (n <= 0) return { pos: [], ih: ihMax };
  const cols = Math.max(1, Math.floor((x1 - x0 + gap) / (iw + gap))), rows = Math.ceil(n / cols);
  const ih = Math.max(8, Math.min(ihMax, (y1 - y0) / rows - 6));
  const pos = [];
  for (let i = 0; i < n; i++) pos.push([x0 + (i % cols) * (iw + gap), y0 + Math.floor(i / cols) * (ih + 6)]);
  return { pos, ih };
}

/* ---------- step 0: tie sticks into tens and hundreds ---------- */
const s0 = { stage: 2, anim: null }; // anim: {from, k}
function counts0() {
  const N = num('n0');
  if (s0.anim) return M.partial(N, s0.anim.from, s0.anim.k);
  return M.bundle(N, s0.stage);
}
function draw0() {
  const N = num('n0'), c = counts0();
  $('n0v').textContent = String(N);
  const { ctx, W, H } = fitCanvas($('c0')), L = labels(ctx, W, H);
  const three = c.hundreds > 0 || s0.stage === 2 || (s0.anim && s0.anim.from === 1);
  const two = !three && (c.tens > 0 || s0.stage >= 1);
  const fr = three ? [0.26, 0.44, 0.30] : two ? [0, 0.62, 0.38] : [0, 0, 1];
  const pad = 12, inner = W - 2 * pad, top = 40, bottom = H - 14;
  let x = pad;
  const zones = fr.map(f => { const z = [x, x + f * inner]; x += f * inner; return z; });
  const names = [t('zoneH', { n: c.hundreds }), t('zoneT', { n: c.tens }), t('zoneO', { n: c.ones })];
  zones.forEach(([a, b], i) => {
    if (b - a < 1) return;
    if (i > 0 && zones[i - 1][1] - zones[i - 1][0] > 1) { ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(a, 26); ctx.lineTo(a, H - 6); ctx.stroke(); ctx.restore(); }
    L.put(names[i], a + 6, 18, { align: 'left', size: 12, weight: 600, color: [C.orange, C.cyan, C.stick][i], maxW: b - a - 8, shifts: [0] });
  });
  // hundreds
  if (c.hundreds) { const g = grid(c.hundreds, zones[0][0] + 6, zones[0][1] - 6, top, bottom, 40, 10, 160); g.pos.forEach(([px, py]) => hundredBundle(ctx, px, py, 40, g.ih)); }
  if (c.tens) { const g = grid(c.tens, zones[1][0] + 6, zones[1][1] - 6, top, bottom, 14, 6, 130); g.pos.forEach(([px, py]) => tenBundle(ctx, px, py, 14, g.ih)); }
  if (c.ones) { const g = grid(c.ones, zones[2][0] + 6, zones[2][1] - 6, top, bottom, 3, c.ones > 60 ? 3 : 7, 110); g.pos.forEach(([px, py]) => stick(ctx, px, py, g.ih)); }
  let msg;
  if (s0.anim) msg = t(s0.anim.from === 0 ? 's0tying10' : 's0tying100', { k: s0.anim.k, total: s0.anim.total });
  else if (s0.stage === 0) msg = t('s0loose', { N });
  else if (s0.stage === 1) msg = t('s0tens', { N, t: c.tens, o: c.ones });
  else msg = t('s0all', { N, h: c.hundreds, t: c.tens, o: c.ones });
  $('r0').textContent = msg;
  $('tie10').disabled = !!s0.anim || s0.stage !== 0 || N < 10;
  $('tie100').disabled = !!s0.anim || s0.stage !== 1 || N < 100;
  $('untie').disabled = !!s0.anim || s0.stage === 0;
}

/* ---------- the counting frame (steps 1 and 2) ---------- */
function frame(ctx, L, W, H, d, o = {}) {
  const l = 10, r = W - 10, colW = (r - l) / 4, top = 52, base = H - 52;
  const bw = Math.min(40, colW * 0.62), bh = Math.min(14, (base - top - 8) / 10);
  ctx.save(); ctx.fillStyle = C.rod; ctx.fillRect(l, base, r - l, 5); ctx.restore();
  const leading = d.findIndex(v => v > 0);
  d.forEach((v, i) => {
    const cx = l + colW * (i + 0.5), carried = o.carried && o.carried.includes(i), gets = o.receiver === i;
    ctx.save(); ctx.strokeStyle = carried ? C.orange : C.rod; ctx.lineWidth = carried ? 4 : 3; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, base); ctx.stroke(); ctx.restore();
    for (let b = 0; b < v; b++) {
      const y = base - (b + 1) * (bh + 1) + 0.5;
      ctx.save(); ctx.fillStyle = gets && b === v - 1 ? C.orange : C.text; ctx.beginPath(); ctx.ellipse(cx, y + bh / 2, bw / 2, bh / 2, 0, 0, 7); ctx.fill(); ctx.restore();
    }
    const dim = leading === -1 ? i < 3 : i < leading;
    L.put(String(v), cx, 38, { size: 24, weight: 700, color: carried || gets ? C.orange : dim ? '#4f6074' : C.cyan, shifts: [0] });
    L.put(t(PLACE_KEYS[i]), cx, H - 30, { size: 12, color: C.text, maxW: colW - 4, shifts: [0] });
    L.put(t('each', { v: M.POW[i] }), cx, H - 12, { size: 11, color: C.muted, maxW: colW - 4, optional: true });
  });
}

/* ---------- step 1: read the frame ---------- */
function draw1() {
  const d = [0, 1, 2, 3].map(i => num('b1_' + i)), n = M.value(d);
  d.forEach((v, i) => { $('b1_' + i + 'v').textContent = String(v); });
  const { ctx, W, H } = fitCanvas($('c1')), L = labels(ctx, W, H);
  frame(ctx, L, W, H, d);
  const parts = d.map((v, i) => ({ v, i })).filter(p => p.v > 0).map(p => `${p.v} × ${M.POW[p.i]}`);
  const zeros = d.map((v, i) => ({ v, i })).filter((p, k) => p.v === 0 && d.slice(0, k).some(x => x > 0)).map(p => t(PLACE_KEYS[p.i]));
  $('r1').textContent = n === 0 ? t('s1empty') : t('s1readout', { sum: parts.join(' + '), n, zero: zeros.length ? t('s1zero', { p: zeros.join(t('listSep')) }) : '' });
}

/* ---------- step 2: count up, ten makes one ---------- */
const s2 = { d: M.digits(95), hist: [], carried: [], receiver: -1, carries: 0, over: false };
function step2once() {
  const r = M.addOne(s2.d);
  if (r.overflow) { s2.over = true; s2.hist.push({ n: M.value(s2.d), overflow: true }); return false; }
  s2.d = r.digits; s2.carried = r.carried; s2.receiver = r.carried.length ? Math.min(...r.carried) - 1 : -1;
  if (r.carried.length) s2.carries++;
  s2.hist.push({ n: M.value(s2.d), carried: r.carried.length > 0 });
  return true;
}
function reset2() { stopAnim('s2'); s2.d = M.digits(num('start2')); s2.hist = []; s2.carried = []; s2.receiver = -1; s2.carries = 0; s2.over = false; }
function draw2() {
  $('start2v').textContent = String(num('start2'));
  const { ctx, W, H } = fitCanvas($('c2')), L = labels(ctx, W, H);
  frame(ctx, L, W, H, s2.d, { carried: s2.carried, receiver: s2.receiver });
  const n = M.value(s2.d), names = s2.carried.map(i => t(PLACE_KEYS[i])).join(t('listSep'));
  let msg = s2.hist.length ? t('s2readout', { k: s2.hist.length, n, c: s2.carries }) : t('s2start', { n });
  if (s2.carried.length) msg += ' ' + t('s2carry', { p: names, q: t(PLACE_KEYS[s2.receiver]) });
  if (s2.over) msg += ' ' + t('s2over');
  $('r2').textContent = msg;
  const h = $('hist2'); h.innerHTML = '';
  s2.hist.slice(-30).forEach(e => { const s = document.createElement('span'); s.className = 'chip' + (e.overflow ? ' over' : e.carried ? ' carry' : ''); s.textContent = e.overflow ? '9999 + 1 ?' : String(e.n); h.appendChild(s); });
  $('plus2').disabled = s2.over; $('run2').disabled = s2.over;
}

/* ---------- blocks (steps 3 and 4) ---------- */
function blocks(ctx, x0, x1, y0, y1, kind, n, color) {
  const w = x1 - x0, s = Math.max(20, Math.min(70, w * 0.5, (y1 - y0) - 40));
  ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.7;
  if (kind === 'flat') {
    const off = Math.min(6, (w - s - 8) / Math.max(1, n - 1));
    for (let i = 0; i < n; i++) {
      const x = x0 + (w - s - off * (n - 1)) / 2 + off * i, y = y0 + 4 + (n - 1 - i) * Math.min(4, off);
      ctx.fillStyle = color; ctx.fillRect(x, y, s, s);
      for (let g = 1; g < 10; g++) { ctx.beginPath(); ctx.moveTo(x + s * g / 10, y); ctx.lineTo(x + s * g / 10, y + s); ctx.moveTo(x, y + s * g / 10); ctx.lineTo(x + s, y + s * g / 10); ctx.stroke(); }
      ctx.strokeStyle = C.bg; ctx.strokeRect(x, y, s, s); ctx.strokeStyle = 'rgba(0,0,0,.35)';
    }
  } else if (kind === 'rod') {
    const rw = Math.max(3, s / 10), gap = Math.min(5, Math.max(2, (w - n * rw) / (n + 1))), tot = n * rw + (n - 1) * gap;
    for (let i = 0; i < n; i++) {
      const x = x0 + (w - tot) / 2 + i * (rw + gap), y = y0 + 4;
      ctx.fillStyle = color; ctx.fillRect(x, y, rw, s);
      for (let g = 1; g < 10; g++) { ctx.beginPath(); ctx.moveTo(x, y + s * g / 10); ctx.lineTo(x + rw, y + s * g / 10); ctx.stroke(); }
    }
  } else {
    const cw = Math.max(3, s / 10), gap = 3, cols = 3, tot = cols * cw + (cols - 1) * gap;
    for (let i = 0; i < n; i++) {
      const x = x0 + (w - tot) / 2 + (i % cols) * (cw + gap), y = y0 + 4 + s - cw - Math.floor(i / cols) * (cw + gap);
      ctx.fillStyle = color; ctx.fillRect(x, y, cw, cw);
    }
  }
  ctx.restore();
  return s;
}

/* ---------- step 3: the same digit, three places ---------- */
function draw3() {
  const d = num('d3');
  $('d3v').textContent = String(d);
  const { ctx, W, H } = fitCanvas($('c3')), L = labels(ctx, W, H);
  titleOf(L, t('c3title', { n: `${d}${d}${d}` }));
  const l = 10, colW = (W - 20) / 3, kinds = ['flat', 'rod', 'cube'], cols = [C.orange, C.cyan, C.green], keys = ['pH', 'pT', 'pO'];
  kinds.forEach((k, i) => {
    const a = l + colW * i, b = a + colW;
    L.put(t(keys[i]), (a + b) / 2, 42, { size: 12, color: C.muted, maxW: colW - 4, shifts: [0] });
    L.put(String(d), (a + b) / 2, 70, { size: 24, weight: 700, color: cols[i], shifts: [0] });
    blocks(ctx, a + 6, b - 6, 84, H - 50, k, d, cols[i]);
    L.put('= ' + M.placeValue(d, 2 - i), (a + b) / 2, H - 16, { size: 14, weight: 700, color: cols[i], shifts: [0] });
  });
  $('r3').textContent = t('s3readout', { d, h: M.placeValue(d, 2), t: M.placeValue(d, 1), o: d, n: `${d}${d}${d}`, v: M.placeValue(d, 2) + M.placeValue(d, 1) + d });
}

/* ---------- step 4: zero holds a place ---------- */
const s4 = { drop: false };
function draw4() {
  const h = num('h4'), tt = num('t4'), o = num('o4'), z = M.dropZero(h, tt, o);
  $('h4v').textContent = String(h); $('t4v').textContent = String(tt); $('o4v').textContent = String(o);
  if (!z.allowed) s4.drop = false;
  $('drop4').disabled = !z.allowed; $('drop4').setAttribute('aria-pressed', String(s4.drop));
  const { ctx, W, H } = fitCanvas($('c4')), L = labels(ctx, W, H);
  const lw = 54, colW = (W - lw - 10) / 3, X = i => lw + colW * (i + 0.5), keys = ['pH', 'pT', 'pO'], cols = [C.orange, C.cyan, C.green];
  [h, tt, o].forEach((v, i) => {
    L.put(t(keys[i]), X(i), 18, { size: 12, color: C.muted, maxW: colW - 4, shifts: [0] });
    if (v) blocks(ctx, X(i) - colW / 2 + 4, X(i) + colW / 2 - 4, 26, 150, ['flat', 'rod', 'cube'][i], v, cols[i]);
    else L.put(t('none'), X(i), 74, { size: 12, color: C.muted, maxW: colW - 4 });
  });
  const card = (i, y, txt, color, dashed) => {
    const w = Math.min(46, colW - 10), hh = 38;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; if (dashed) ctx.setLineDash([4, 3]); ctx.strokeRect(X(i) - w / 2, y - hh / 2, w, hh); ctx.restore();
    if (txt !== '') L.put(txt, X(i), y + 8, { size: 22, weight: 700, color, shifts: [0] });
  };
  L.put(t('rowWrite'), 6, 202, { align: 'left', size: 12, color: C.text, maxW: lw - 8, shifts: [0] });
  [h, tt, o].forEach((v, i) => card(i, 196, String(v), i === 1 && v === 0 ? C.orange : C.text, false));
  if (s4.drop) {
    L.put(t('rowDrop'), 6, 256, { align: 'left', size: 12, color: C.pink, maxW: lw - 8, shifts: [0] });
    card(0, 250, '', C.dim, true); card(1, 250, String(h), C.pink, false); card(2, 250, String(o), C.pink, false);
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), 218); ctx.quadraticCurveTo((X(0) + X(1)) / 2, 222, X(1) - 6, 230); ctx.stroke(); ctx.restore();
  }
  $('r4').textContent = !z.allowed ? t('s4noZero', { n: z.right, t: tt }) : s4.drop ? t('s4drop', { n: z.right, w: z.wrong, h, o, d: z.diff }) : t('s4keep', { n: z.right, h, o });
}

/* ---------- step 5: compare from the highest place ---------- */
function draw5() {
  const a = num('a5'), b = num('b5'), c = M.compare(a, b);
  $('a5v').textContent = String(a); $('b5v').textContent = String(b);
  const { ctx, W, H } = fitCanvas($('c5')), L = labels(ctx, W, H);
  const lw = 40, colW = (W - lw - 10) / 3, X = i => lw + colW * (i + 0.5), keys = ['pH', 'pT', 'pO'];
  keys.forEach((k, i) => L.put(t(k), X(i), 20, { size: 12, color: C.muted, maxW: colW - 4, shifts: [0] }));
  const row = (digs, n, y, name) => {
    L.put(name, 14, y + 8, { size: 16, weight: 700, color: C.text, shifts: [0] });
    const lead = String(n).length; // digits actually written
    digs.forEach((v, i) => {
      const w = Math.min(52, colW - 10), hh = 44, unwritten = i < 3 - lead;
      const state = c.place === -1 ? 'same' : i < c.place ? 'same' : i === c.place ? 'first' : 'skip';
      const color = state === 'first' ? C.orange : state === 'same' ? '#7a8ba0' : '#4f6074';
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = state === 'first' ? 3 : 1.5; if (state === 'skip' || unwritten) ctx.setLineDash([4, 3]);
      if (state === 'same') { ctx.fillStyle = '#1b2633'; ctx.fillRect(X(i) - w / 2, y - hh / 2, w, hh); }
      ctx.strokeRect(X(i) - w / 2, y - hh / 2, w, hh); ctx.restore();
      L.put(String(v), X(i), y + 9, { size: 24, weight: 700, color: unwritten ? '#4f6074' : color, shifts: [0] });
    });
  };
  row(c.da, a, 70, 'A'); row(c.db, b, 134, 'B');
  const sym = c.sign > 0 ? '>' : c.sign < 0 ? '<' : '=';
  L.put(`A ${sym} B`, W / 2, H - 22, { size: 18, weight: 700, color: c.sign ? C.orange : C.green, shifts: [0] });
  let msg;
  if (c.place === -1) msg = t('s5equal', { a });
  else {
    const p = t(keys[c.place]), big = c.sign > 0 ? 'A' : 'B', small = c.sign > 0 ? 'B' : 'A';
    msg = t('s5readout', { a, b, sym, p, x: c.da[c.place], y: c.db[c.place], big, small, m: M.maxBelow(c.place), u: Math.pow(10, 2 - c.place) });
    if (c.place === 2) msg = t('s5ones', { a, b, sym, x: c.da[2], y: c.db[2] });
  }
  $('r5').textContent = msg;
}

/* ---------- step 6: × 10 shifts every digit one place left ---------- */
const s6 = { p: 1 };
function draw6() {
  const n = num('n6');
  $('n6v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c6')), L = labels(ctx, W, H);
  const lw = 52, colW = (W - lw - 8) / 5, X = i => lw + colW * (i + 0.5), keys = ['pTTh', 'pTh', 'pH', 'pT', 'pO'];
  keys.forEach((k, i) => L.put(t(k), X(i), 18, { size: 11, color: C.muted, maxW: colW - 2, shifts: [0] }));
  const rows = [0, 1, 2].map(k => ({ k, v: M.times(n, k), y: 62 + k * 66 }));
  const len = String(n).length;
  rows.forEach(({ k, v, y }) => {
    const prog = k === 0 ? 1 : Math.max(0, Math.min(1, s6.p * 2 - (k - 1))); // row 1 in the first half, row 2 in the second
    L.put(k === 0 ? 'N' : '× ' + Math.pow(10, k), 8, y + 6, { align: 'left', size: 14, weight: 700, color: k ? C.text : C.cyan, shifts: [0] });
    if (k > 0 && prog <= 0) return;
    const s = String(n);
    for (let j = 0; j < len; j++) {
      const from = 5 - len + j - (k - 1 < 0 ? 0 : k - 1), to = 5 - len + j - k, col = k === 0 ? 5 - len + j : from + (to - from) * prog;
      L.put(s[j], lw + colW * (col + 0.5), y + 9, { size: 24, weight: 700, color: C.cyan, shifts: [0] });
    }
    if (k > 0 && prog >= 1) for (let z = 0; z < k; z++) L.put('0', X(4 - z), y + 9, { size: 24, weight: 700, color: C.orange, shifts: [0] });
    if (k > 0 && prog >= 1) L.put('= ' + v, W - 6, y + 30, { align: 'right', size: 11, color: C.muted, optional: true });
  });
  $('r6').textContent = t('s6readout', { n, a: M.times(n, 1), b: M.times(n, 2) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); draw6(); }

function setup() {
  $('n0').addEventListener('input', () => { const a = stopAnim('s0'); if (a) { s0.anim = null; s0.stage = a.target; } draw0(); });
  const tie = (from) => {
    const N = num('n0'), total = from === 0 ? Math.floor(N / 10) : Math.floor(N / 100);
    s0.anim = { from, k: 0, total };
    const per = from === 0 ? 260 : 700;
    animate('s0', Math.max(1, total) * per, p => { s0.anim.k = Math.min(total, Math.floor(p * (total + 0.999))); draw0(); }, () => { s0.anim = null; s0.stage = from + 1; draw0(); });
    if (anims.s0) anims.s0.target = from + 1;
  };
  $('tie10').addEventListener('click', () => tie(0));
  $('tie100').addEventListener('click', () => tie(1));
  $('untie').addEventListener('click', () => { stopAnim('s0'); s0.anim = null; s0.stage = 0; draw0(); });
  [0, 1, 2, 3].forEach(i => $('b1_' + i).addEventListener('input', draw1));
  $('start2').addEventListener('input', () => { reset2(); draw2(); });
  $('plus2').addEventListener('click', () => { stopAnim('s2'); step2once(); draw2(); });
  $('run2').addEventListener('click', () => {
    let done = 0;
    animate('s2', 10 * 480, p => { const want = Math.min(10, Math.floor(p * 10.999)); while (done < want) { done++; if (!step2once()) { done = 10; break; } } draw2(); });
  });
  $('reset2').addEventListener('click', () => { reset2(); draw2(); });
  $('d3').addEventListener('input', draw3);
  ['h4', 't4', 'o4'].forEach(id => $(id).addEventListener('input', draw4));
  $('drop4').addEventListener('click', () => { s4.drop = !s4.drop; draw4(); });
  ['a5', 'b5'].forEach(id => $(id).addEventListener('input', draw5));
  $('n6').addEventListener('input', () => { stopAnim('s6'); s6.p = 1; draw6(); });
  $('shift6').addEventListener('click', () => { s6.p = 0; draw6(); animate('s6', 2400, p => { s6.p = p; draw6(); }); });

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
  window.refreshPlaceValue = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
