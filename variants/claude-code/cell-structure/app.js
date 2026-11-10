'use strict';
// The Cell (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Geometry, sizes, the membrane simulation and every judgement come from window.CELL_MODEL (model.js).
// Canvas text is limited to panel titles, axis ticks, one scale-bar label and three column captions,
// each in its own reserved row; names, legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.CELL_MODEL;
const t = (...a) => window.CELL_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#5fd17a', pink: '#ff7a93', violet: '#b79cff', blue: '#4f8fd6', tan: '#c8a96a', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', cyto: '#1d3043', leaf: '#2e7442', leafDark: '#1f5530', yellow: '#e3c45a', red: '#e0566b', soil: '#6b4f33' };
const SCOL = { membrane: C.cyan, cytoplasm: '#5b7a99', nucleus: C.violet, mito: C.pink, chloro: C.green, vacuole: C.blue, wall: C.tan };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Trim trailing zeros only when there is a decimal point (so 90 stays 90).
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; let s = v.toFixed(d); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const sig2 = v => (v >= 100 ? fmt(v, 0) : v >= 10 ? fmt(v, 1) : fmt(v, 2));
const len = um => { const u = M.lengthUnit(um); return t('unit_' + u.unit, { v: sig2(u.v) }); };
const fmtMag = m => (m < 10 ? fmt(m, 1) : fmt(m, 0));

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
// One line of canvas text that shrinks until it fits maxW (never overflows).
function label(ctx, text, X, Y, maxW, { align = 'left', size = 12, weight = 600, color = C.text } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
const clamp01 = v => Math.max(0, Math.min(1, v));

/* ---------- shared animation runner (reduced motion → jump to end; hidden page → finish) ---------- */
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

/* ---------- cell diagram renderer (shared by steps 1 and 4) ---------- */
function shapePath(ctx, s, B) {
  ctx.beginPath();
  if (s.kind === 'ellipse') ctx.ellipse(B.x + s.cx * B.s, B.y + s.cy * B.s, s.rx * B.s, s.ry * B.s, s.a || 0, 0, Math.PI * 2);
  else ctx.roundRect(B.x + s.x * B.s, B.y + s.y * B.s, s.w * B.s, s.h * B.s, s.r * B.s);
}
function drawOrganelle(ctx, id, s, B) {
  shapePath(ctx, s, B);
  if (id === 'nucleus') {
    ctx.fillStyle = '#6f5aa8'; ctx.fill(); ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(B.x + (s.cx + s.rx * 0.25) * B.s, B.y + (s.cy - s.ry * 0.15) * B.s, Math.max(2, s.rx * B.s * 0.3), 0, 7); ctx.fillStyle = '#4b3a7d'; ctx.fill();
  } else if (id === 'mito') {
    ctx.fillStyle = '#a8445a'; ctx.fill(); ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5; ctx.stroke();
    const cx = B.x + s.cx * B.s, cy = B.y + s.cy * B.s, L = s.rx * B.s * 0.75, h = s.ry * B.s * 0.55;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.a || 0); ctx.beginPath();
    for (let i = 0; i <= 6; i++) { const x = -L + (2 * L * i) / 6; ctx[i ? 'lineTo' : 'moveTo'](x, i % 2 ? h : -h); }
    ctx.strokeStyle = '#ffc2cf'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  } else if (id === 'chloro') {
    ctx.fillStyle = '#2f8a48'; ctx.fill(); ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.stroke();
    const cx = B.x + s.cx * B.s, cy = B.y + s.cy * B.s, L = s.rx * B.s * 0.65;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.a || 0); ctx.strokeStyle = '#9ff0b5'; ctx.lineWidth = 1;
    for (const dy of [-0.35, 0, 0.35]) { ctx.beginPath(); ctx.moveTo(-L, dy * s.ry * B.s); ctx.lineTo(L, dy * s.ry * B.s); ctx.stroke(); }
    ctx.restore();
  } else if (id === 'vacuole') {
    ctx.fillStyle = 'rgba(79,143,214,0.45)'; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke();
  }
}
// opts: sel (id or null), found (Set), dim (bool → dim everything not selected/found)
function drawCell(ctx, cell, B, opts = {}) {
  const sel = opts.sel || null, found = opts.found || new Set();
  const alpha = id => (!sel && !opts.dimAll) || id === sel || found.has(id) ? 1 : 0.32;
  ctx.save();
  if (cell.wall) {
    ctx.globalAlpha = alpha('wall'); shapePath(ctx, cell.wall[0], B); ctx.fillStyle = '#8a7346'; ctx.fill(); ctx.strokeStyle = C.tan; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.globalAlpha = alpha('cytoplasm'); shapePath(ctx, cell.cytoplasm[0], B); ctx.fillStyle = C.cyto; ctx.fill();
  ctx.globalAlpha = alpha('membrane'); shapePath(ctx, cell.membrane[0], B); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5; ctx.stroke();
  for (const id of ['vacuole', 'nucleus', 'chloro', 'mito']) {
    if (!cell[id]) continue;
    ctx.globalAlpha = alpha(id); cell[id].forEach(s => drawOrganelle(ctx, id, s, B));
  }
  ctx.globalAlpha = 1;
  const ring = (id, color) => {
    if (!cell[id]) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.shadowColor = color; ctx.shadowBlur = 8;
    const list = id === 'cytoplasm' ? cell.membrane : cell[id];
    list.forEach(s => {
      if (id === 'membrane' || id === 'wall' || id === 'cytoplasm') { shapePath(ctx, s, B); ctx.stroke(); }
      else { const pad = 3 / B.s; shapePath(ctx, { ...s, rx: s.rx + pad, ry: s.ry + pad }, B); ctx.stroke(); }
    });
    if (id === 'cytoplasm') { ctx.setLineDash([5, 4]); shapePath(ctx, cell.membrane[0], B); ctx.stroke(); }
    ctx.restore();
  };
  if (sel) ring(sel, '#ffffff');
  found.forEach(id => ring(id, C.orange));
  ctx.restore();
}
function cellBox(W, H, top, pad = 10) {
  const s = Math.min(W - 2 * pad, (H - top - pad) / M.ASPECT);
  return { x: (W - s) / 2, y: top + (H - top - pad - s * M.ASPECT) / 2, s };
}
function canvasPoint(canvas, ev) { const r = canvas.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

/* ---------- step 0: zoom ---------- */
const LEAF = { cx: -6000, cy: 3000, rx: 25000, ry: 11000, a: -0.25 };
const fade = (mag, from) => clamp01(Math.log(mag / from) / Math.log(1.6));
function hash(i, j, k) { let h = (i * 73856093) ^ (j * 19349663) ^ (k * 83492791); h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function draw0() {
  const mag = M.magFromSlider(Number($('z0').value)), field = M.fieldUm(mag);
  $('z0v').textContent = fmtMag(mag) + '×';
  const { ctx, W, H } = fitCanvas($('c0'));
  const s = W / field, X = x => W / 2 + x * s, Y = y => H / 2 + y * s;
  // leaf blade with midrib and veins
  ctx.save();
  ctx.translate(X(LEAF.cx), Y(LEAF.cy)); ctx.rotate(LEAF.a);
  ctx.beginPath(); ctx.ellipse(0, 0, LEAF.rx * s, LEAF.ry * s, 0, 0, 7); ctx.fillStyle = C.leaf; ctx.fill();
  ctx.strokeStyle = '#7fc78f'; ctx.lineWidth = Math.max(1, 900 * s); ctx.beginPath(); ctx.moveTo(-LEAF.rx * s * 1.25, 0); ctx.lineTo(-LEAF.rx * s, 0); ctx.stroke(); // petiole
  ctx.beginPath(); ctx.ellipse(0, 0, LEAF.rx * s, LEAF.ry * s, 0, 0, 7); ctx.clip();
  // veins only matter at low power; they fade out before the cell grid takes over
  ctx.globalAlpha = clamp01(1 - Math.log(mag / 1.5) / Math.log(3)); ctx.strokeStyle = '#7fc78f'; ctx.lineWidth = Math.max(1, Math.min(14, 900 * s)); ctx.beginPath(); ctx.moveTo(-LEAF.rx * s, 0); ctx.lineTo(LEAF.rx * s, 0); ctx.stroke();
  ctx.lineWidth = Math.max(0.8, Math.min(6, 350 * s));
  for (let i = -3; i <= 3; i++) { if (!i) continue; const x0 = i * 0.24 * LEAF.rx * s; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.quadraticCurveTo(x0 + 0.12 * LEAF.rx * s, 0.5 * LEAF.ry * s, x0 + 0.2 * LEAF.rx * s, 0.92 * LEAF.ry * s); ctx.moveTo(x0, 0); ctx.quadraticCurveTo(x0 + 0.12 * LEAF.rx * s, -0.5 * LEAF.ry * s, x0 + 0.2 * LEAF.rx * s, -0.92 * LEAF.ry * s); ctx.stroke(); }
  ctx.restore();
  // clip to the leaf for everything cellular
  ctx.save();
  ctx.beginPath(); ctx.ellipse(X(LEAF.cx), Y(LEAF.cy), LEAF.rx * s, LEAF.ry * s, LEAF.a, 0, 7); ctx.clip();
  const tw = M.TILE.w * s, th = M.TILE.h * s;
  const aCell = fade(mag, M.minMagToSee(M.sizeOf('cell')));
  const aNuc = fade(mag, M.minMagToSee(M.sizeOf('nucleus'))), aChl = fade(mag, M.minMagToSee(M.sizeOf('chloro'))), aMit = fade(mag, M.minMagToSee(M.sizeOf('mito')));
  const halfW = field / 2, halfH = field * H / W / 2;
  const r0 = Math.floor(-halfH / M.TILE.h) - 1, r1 = Math.ceil(halfH / M.TILE.h) + 1;
  if (aCell > 0) {
    if (th < 2.5) { ctx.fillStyle = `rgba(20,60,32,${0.35 * aCell})`; ctx.fillRect(0, 0, W, H); }
    else {
      // cell interiors first (tint shows chloroplasts even when tiles are too small to draw grains)
      const detail = tw >= 14;
      for (let r = r0; r <= r1; r++) {
        const off = (r & 1) ? M.TILE.w / 2 : 0;
        const c0 = Math.floor((-halfW - off) / M.TILE.w) - 1, c1 = Math.ceil((halfW - off) / M.TILE.w) + 1;
        for (let c = c0; c <= c1; c++) {
          const x0 = X(c * M.TILE.w - M.TILE.w / 2 + off), y0 = Y(r * M.TILE.h - M.TILE.h / 2);
          if (!detail) { if (aChl > 0) { ctx.fillStyle = `rgba(95,209,122,${0.35 * aChl})`; ctx.fillRect(x0 + tw * 0.18, y0 + th * 0.2, tw * 0.64, th * 0.6); } continue; }
          drawTile(ctx, x0, y0, tw, th, s, r, c, aNuc, aChl, aMit);
        }
      }
      // walls
      ctx.beginPath();
      for (let r = r0; r <= r1; r++) {
        const yTop = Y(r * M.TILE.h - M.TILE.h / 2); ctx.moveTo(0, yTop); ctx.lineTo(W, yTop);
        const off = (r & 1) ? M.TILE.w / 2 : 0;
        const c0 = Math.floor((-halfW - off) / M.TILE.w) - 1, c1 = Math.ceil((halfW - off) / M.TILE.w) + 1;
        for (let c = c0; c <= c1; c++) { const x = X(c * M.TILE.w - M.TILE.w / 2 + off); ctx.moveTo(x, yTop); ctx.lineTo(x, yTop + th); }
      }
      ctx.strokeStyle = `rgba(200,169,106,${(0.25 + 0.6 * clamp01((th - 2.5) / 20)) * aCell})`; ctx.lineWidth = Math.max(0.6, Math.min(4, 1.2 * s)); ctx.stroke();
    }
  }
  ctx.restore();
  // field width (top) and scale bar (bottom) each own a row
  ctx.fillStyle = 'rgba(13,22,33,0.82)'; ctx.fillRect(0, 0, W, 24); ctx.fillRect(0, H - 30, W, 30);
  label(ctx, t('c0title', { field: len(field) }), 8, 17, W - 16);
  const bar = M.scaleBar(field), bpx = bar * s;
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, H - 12); ctx.lineTo(10 + bpx, H - 12); ctx.moveTo(10, H - 17); ctx.lineTo(10, H - 7); ctx.moveTo(10 + bpx, H - 17); ctx.lineTo(10 + bpx, H - 7); ctx.stroke();
  label(ctx, len(bar), 18 + bpx, H - 8, W - bpx - 26, { weight: 500, size: 11, color: C.muted });
  // readout + visibility list
  $('r0').textContent = t('s0readout', { mag: fmtMag(mag), field: len(field), app: len(M.apparentUm(M.sizeOf('cell'), mag)) });
  $('seen0').innerHTML = M.SIZES.map(z => {
    const on = M.visibleAt(z.um, mag);
    return `<li class="${on ? 'on' : ''}"><span class="tick" aria-hidden="true">${on ? '✓' : '·'}</span>${t('seenItem', { name: t('n_' + z.id), size: len(z.um), min: fmtMag(Math.max(1, M.minMagToSee(z.um))) })}</li>`;
  }).join('');
}
function drawTile(ctx, x0, y0, tw, th, s, r, c, aNuc, aChl, aMit) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, tw, th); ctx.clip();
  ctx.fillStyle = 'rgba(29,48,67,0.55)'; ctx.fillRect(x0, y0, tw, th);
  const cx = x0 + tw / 2, cy = y0 + th / 2;
  if (aNuc > 0) {
    ctx.globalAlpha = aNuc;
    ctx.beginPath(); ctx.ellipse(cx + tw * 0.08, cy + th * 0.04, tw * 0.3, th * 0.27, 0, 0, 7); ctx.fillStyle = 'rgba(79,143,214,0.35)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - tw * 0.3, cy - th * 0.22, 5 * s, 0, 7); ctx.fillStyle = '#7a63b8'; ctx.fill();
  }
  if (aChl > 0) {
    ctx.globalAlpha = aChl; ctx.fillStyle = '#4fcf74';
    for (let k = 0; k < 9; k++) {
      const ang = (k / 9) * Math.PI * 2 + hash(r, c, k) * 0.5;
      const px = cx + Math.cos(ang) * tw * 0.4, py = cy + Math.sin(ang) * th * 0.38;
      ctx.beginPath(); ctx.ellipse(px, py, Math.max(1, 2.5 * s), Math.max(0.8, 1.4 * s), ang + Math.PI / 2, 0, 7); ctx.fill();
    }
  }
  if (aMit > 0) {
    ctx.globalAlpha = aMit; ctx.fillStyle = C.pink;
    for (let k = 0; k < 4; k++) {
      const px = cx + (hash(c, r, k + 11) - 0.5) * tw * 0.55, py = cy + (hash(r, k, c + 5) - 0.5) * th * 0.5;
      ctx.beginPath(); ctx.ellipse(px, py, Math.max(1.5, 0.9 * s), Math.max(0.8, 0.4 * s), hash(k, r, c) * 3, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------- step 1: cell map ---------- */
const s1 = { sel: null, seen: new Set() };
const PLANT = M.plantCell(), ANIMAL = M.animalCell();
function buildChips(boxId, onPick) {
  const box = $(boxId); box.innerHTML = '';
  M.STRUCTS.forEach(id => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.s = id;
    b.innerHTML = `<span class="sw" style="background:${SCOL[id]}"></span><span class="chip-name"></span>`;
    b.addEventListener('click', () => onPick(id)); box.appendChild(b);
  });
}
function draw1() {
  const { ctx, W, H } = fitCanvas($('c1'));
  label(ctx, t('c1title'), 8, 17, W - 16);
  s1.B = cellBox(W, H, 26);
  drawCell(ctx, PLANT, s1.B, { sel: s1.sel });
  document.querySelectorAll('#chips1 .chip').forEach(b => {
    b.querySelector('.chip-name').textContent = t('s_' + b.dataset.s);
    b.setAttribute('aria-pressed', b.dataset.s === s1.sel ? 'true' : 'false');
    b.classList.toggle('seen', s1.seen.has(b.dataset.s));
  });
  $('card1').innerHTML = s1.sel
    ? `<p class="card-name" style="color:${SCOL[s1.sel]}">${t('s_' + s1.sel)}</p><p>${t('job_' + s1.sel)}</p><p class="card-look">${t('look_' + s1.sel)}</p>`
    : `<p class="card-look">${t('cardEmpty')}</p>`;
  $('r1').textContent = t('s1readout', { c: s1.seen.size, N: M.STRUCTS.length }) + (s1.seen.size === M.STRUCTS.length ? ' ' + t('s1done') : '');
}
function pick1(id) { if (!id) return; s1.sel = id; s1.seen.add(id); draw1(); }

/* ---------- step 2: membrane simulation ---------- */
const s2 = { seed: 1, sim: null, running: false, raf: 0 };
function reset2() { stop2(); s2.sim = M.createMembraneSim(s2.seed); s2.sim.torn = $('tear2').getAttribute('aria-pressed') === 'true'; draw2(); }
function stop2() { s2.running = false; cancelAnimationFrame(s2.raf); }
function loop2() {
  if (!s2.running) return;
  for (let i = 0; i < 2 && s2.sim.tick < M.MEM.ticks; i++) s2.sim.step();
  draw2();
  if (s2.sim.tick >= M.MEM.ticks) { stop2(); draw2(); return; }
  s2.raf = requestAnimationFrame(loop2);
}
function run2() {
  if (s2.running) { stop2(); draw2(); return; }
  if (s2.sim.tick >= M.MEM.ticks) { s2.sim = M.createMembraneSim(s2.seed); s2.sim.torn = $('tear2').getAttribute('aria-pressed') === 'true'; }
  if (reduceMotion()) { while (s2.sim.tick < M.MEM.ticks) s2.sim.step(); draw2(); return; }
  s2.running = true; s2.raf = requestAnimationFrame(loop2); draw2();
}
function draw2() {
  const sim = s2.sim, done = sim.tick >= M.MEM.ticks;
  $('run2').textContent = t(s2.running ? 'pause' : done ? 'again' : 'run');
  // left: the cell
  {
    const { ctx, W, H } = fitCanvas($('c2'));
    label(ctx, t('c2title'), 8, 17, W - 16);
    const side = Math.min(W - 16, H - 34), ox = (W - side) / 2, oy = 28, P = (x, y) => [ox + x * side, oy + y * side];
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(ox, oy, side, side);
    const [cx, cy] = P(M.MEM.cx, M.MEM.cy), R = M.MEM.R * side;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = C.cyto; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = C.orange;
    M.MEM.channels.forEach(a => { ctx.beginPath(); ctx.arc(cx, cy, R, a - M.MEM.channelHalf, a + M.MEM.channelHalf); ctx.stroke(); });
    if (sim.torn) {
      ctx.lineWidth = 7; ctx.strokeStyle = C.bg; ctx.beginPath(); ctx.arc(cx, cy, R, M.MEM.holeAt - M.MEM.holeHalf, M.MEM.holeAt + M.MEM.holeHalf); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.pink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx, cy, R, M.MEM.holeAt - M.MEM.holeHalf, M.MEM.holeAt + M.MEM.holeHalf); ctx.stroke(); ctx.setLineDash([]);
    }
    const sc = side / 300;
    sim.parts.forEach(p => {
      const [x, y] = P(p.x, p.y);
      ctx.beginPath();
      if (p.kind === 'small') { ctx.arc(x, y, 2.6 * Math.max(0.8, sc), 0, 7); ctx.fillStyle = '#bdeefe'; }
      else if (p.kind === 'sugar') { const r = 4 * Math.max(0.8, sc); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx[k ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); ctx.fillStyle = C.orange; }
      else { ctx.arc(x, y, 6 * Math.max(0.8, sc), 0, 7); ctx.fillStyle = C.violet; }
      ctx.fill();
    });
  }
  // right: history of the counts inside
  {
    const { ctx, W, H } = fitCanvas($('c2b'));
    const P = { l: 34, r: W - 12, t: 30, b: H - 28 }, T = M.MEM.ticks, yMax = 24;
    const x = v => P.l + v / T * (P.r - P.l), y = v => P.b - v / yMax * (P.b - P.t);
    label(ctx, t('c2btitle') + ' · ' + t('c2x'), 8, 17, W - 16);
    ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
    for (const v of [0, 8, 16, 24]) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(v), P.l - 6, y(v) + 4); }
    ctx.textAlign = 'center';
    const xs = W < 300 ? [0, 450, 900] : [0, 300, 600, 900];
    xs.forEach(v => ctx.fillText(String(v), Math.min(P.r - 8, Math.max(P.l + 4, x(v))), P.b + 16));
    const even = { small: M.insideArea * M.MEM.kinds.small.n, sugar: M.insideArea * M.MEM.kinds.sugar.n, protein: M.insideArea * M.MEM.kinds.protein.n };
    const col = { small: '#bdeefe', sugar: C.orange, protein: C.violet };
    for (const k of ['small', 'sugar', 'protein']) {
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = col[k]; ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.moveTo(P.l, y(even[k])); ctx.lineTo(P.r, y(even[k])); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = col[k]; ctx.lineWidth = 2; ctx.beginPath();
      sim.hist.forEach((c, i) => ctx[i ? 'lineTo' : 'moveTo'](x(i), y(c[k])));
      ctx.stroke();
    }
  }
  const c = sim.hist[sim.hist.length - 1], P0 = M.MEM.kinds.protein.n;
  const lost = P0 - c.protein;
  const note = sim.torn ? t('noteTorn', { lost }) : lost === 0 ? t('noteIntact') : t('noteTorn', { lost });
  $('r2').textContent = t('s2readout', { t: sim.tick, T: M.MEM.ticks, s: c.small, se: fmt(M.insideArea * M.MEM.kinds.small.n, 1), g: c.sugar, ge: fmt(M.insideArea * M.MEM.kinds.sugar.n, 1), p: c.protein, P: P0, note });
}

/* ---------- step 3: Acetabularia graft ---------- */
const SPLIT = { A: 0, B: 1 };                         // cap shape: 0 = umbrella disc, 1 = separate lobes
const SPCOL = { A: C.green, B: C.yellow };
const s3 = { round: 0, grow: 0 };
const radio = name => { const r = document.querySelector(`input[name="${name}"]:checked`); return r ? r.value : null; };
function mixColor(a, b, w) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v * w + B[i] * (1 - w))).join(',')})`; }
function drawAlga(ctx, cx, baseY, topY, base, stalk, cap, R, joint) {
  // rhizoid with nucleus
  ctx.strokeStyle = SPCOL[base]; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (const [dx, dy] of [[-16, 12], [-8, 16], [6, 15], [15, 10]]) { ctx.beginPath(); ctx.moveTo(cx, baseY - 4); ctx.quadraticCurveTo(cx + dx * 0.4, baseY + dy * 0.4, cx + dx, baseY + dy); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(cx, baseY - 8, 9, 12, 0, 0, 7); ctx.fillStyle = SPCOL[base]; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, baseY - 8, 4.5, 0, 7); ctx.fillStyle = '#6f5aa8'; ctx.fill(); ctx.strokeStyle = C.violet; ctx.lineWidth = 1.5; ctx.stroke();
  // stalk
  ctx.strokeStyle = SPCOL[stalk]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, baseY - 20); ctx.lineTo(cx, topY); ctx.stroke();
  if (joint) { ctx.strokeStyle = C.text; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx - 10, baseY - 21); ctx.lineTo(cx + 10, baseY - 21); ctx.stroke(); ctx.setLineDash([]); }
  if (cap && cap.size > 0.01) drawCap(ctx, cx, topY, R * cap.size, cap.split, cap.color);
}
function drawCap(ctx, cx, cy, R, split, color) {
  const n = 10, ry = 0.38;
  ctx.save(); ctx.translate(cx, cy);
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, g = split * 0.42 * (a1 - a0);
    ctx.beginPath(); ctx.moveTo(0, 0);
    const steps = 8;
    for (let k = 0; k <= steps; k++) {
      const a = a0 + g / 2 + (a1 - a0 - g) * k / steps;
      const rr = R * (1 - split * 0.18 * Math.pow(2 * k / steps - 1, 2));  // lobes get rounded tips
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * ry);
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'rgba(13,22,33,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
}
function capNow() {
  const base = radio('base3'), stalk = radio('stalk3');
  if (!s3.round) return null;
  const r = M.capAfterGraft(base, stalk, s3.round);
  const split = r.mix * SPLIT[r.type] + (1 - r.mix) * SPLIT[stalk];
  return { ...r, split, color: mixColor(SPCOL[r.type], SPCOL[stalk], r.mix) };
}
function draw3() {
  const { ctx, W, H } = fitCanvas($('c3'));
  const base = radio('base3'), stalk = radio('stalk3'), colW = W / 3;
  const baseY = H - 52, topY = 70, R = Math.min(colW * 0.42, 70);
  const cols = [['A', 'A', { size: 1, split: SPLIT.A, color: SPCOL.A }], null, ['B', 'B', { size: 1, split: SPLIT.B, color: SPCOL.B }]];
  cols.forEach((c, i) => { if (c) { ctx.globalAlpha = 0.85; drawAlga(ctx, colW * (i + 0.5), baseY, topY, c[0], c[1], c[2], R, false); ctx.globalAlpha = 1; } });
  const cap = capNow();
  ctx.fillStyle = 'rgba(103,215,249,0.06)'; ctx.fillRect(colW + 4, 4, colW - 8, H - 8);
  drawAlga(ctx, colW * 1.5, baseY, topY, base, stalk, cap ? { ...cap, size: s3.grow } : null, R, true);
  [t('colA'), t('colG'), t('colB')].forEach((s, i) => label(ctx, s, colW * (i + 0.5), H - 12, colW - 10, { align: 'center', size: 12, weight: i === 1 ? 700 : 500, color: i === 1 ? C.cyan : C.muted }));
  if (!s3.round) { $('r3').textContent = t('s3idle'); $('recut3').disabled = true; return; }
  $('recut3').disabled = false;
  const sp = k => t(k === 'A' ? 'spA' : 'spB');
  const desc = cap.mix === 1 ? t(cap.type === 'A' ? 'descA' : 'descB') : t(cap.type === 'A' ? 'descMixA' : 'descMixB');
  const g = radio('guess3');
  const guess = !g ? t('guessNone') : (g === 'base' || base === stalk) ? t('guessRight') : t('guessWrong');
  $('r3').textContent = t('s3readout', { round: s3.round, base: sp(base), stalk: sp(stalk), desc, guess }) + (cap.mix < 1 ? ' ' + t('mixNote') : '');
}
function grow3() { s3.grow = 0; animate('s3', 2200, p => { s3.grow = p; draw3(); }); }

/* ---------- step 4: animal vs plant ---------- */
const s4 = { found: new Set(), msg: 'f_start', name: '' };
function claim4(id) {
  if (!id) { s4.msg = 'f_none'; s4.name = ''; }
  else if (s4.found.has(id)) { s4.msg = 'f_again'; s4.name = id; }
  else if (M.isDifference(id)) { s4.found.add(id); s4.msg = s4.found.size === 3 ? 'f_done' : 'f_right'; s4.name = id; }
  else { s4.msg = 'f_both'; s4.name = id; }
  draw4();
}
function draw4() {
  for (const [cid, cell, key] of [['c4a', ANIMAL, 'c4atitle'], ['c4b', PLANT, 'c4btitle']]) {
    const { ctx, W, H } = fitCanvas($(cid));
    label(ctx, t(key), 8, 17, W - 16);
    const B = cellBox(W, H, 26); $(cid)._box = B;
    drawCell(ctx, cell, B, { found: new Set([...s4.found].filter(id => cell[id])) });
  }
  document.querySelectorAll('#chips4 .chip').forEach(b => {
    b.querySelector('.chip-name').textContent = t('s_' + b.dataset.s);
    b.classList.toggle('found', s4.found.has(b.dataset.s));
    b.setAttribute('aria-pressed', s4.found.has(b.dataset.s) ? 'true' : 'false');
  });
  $('r4').textContent = t('s4readout', { c: s4.found.size, msg: t(s4.msg, { name: s4.name ? t('s_' + s4.name) : '' }) });
}

/* ---------- step 5: structure follows function ---------- */
const s5 = { cur: 'heart', solved: new Set(), fb: '', fbState: '' };
const SC_ID = { heart: 'muscle', leaf: 'leaf', root: 'root', rbc: 'rbc' };
const TABS = ['heart', 'leaf', 'root', 'rbc'];
const BPM = 70;
function scen() { return M.SCENARIOS.find(q => q.id === SC_ID[s5.cur]); }
function build5() {
  const box = $('tabs5'); box.innerHTML = '';
  TABS.forEach(id => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.tab = id; b.addEventListener('click', () => { s5.cur = id; s5.fb = ''; s5.fbState = ''; render5Options(); draw5(); }); box.appendChild(b); });
  render5Options();
}
function render5Options() {
  const sc = scen();
  $('opts5').innerHTML = sc.options.map(o => `<label><input type="radio" name="opt5" value="${o}" data-step="5"><span data-s="${o}"></span></label>`).join('');
}
function draw5() {
  const sc = scen(), solved = s5.solved.has(s5.cur);
  document.querySelectorAll('#tabs5 .chip').forEach(b => { b.textContent = t('tab_' + b.dataset.tab) + (s5.solved.has(b.dataset.tab) ? ' ✓' : ''); b.setAttribute('aria-pressed', b.dataset.tab === s5.cur ? 'true' : 'false'); });
  document.querySelectorAll('#opts5 [data-s]').forEach(n => { n.textContent = t('s_' + n.dataset.s); });
  $('q5').textContent = t('q_' + s5.cur, { bpm: BPM, perDay: (BPM * 60 * 24).toLocaleString('en-US') });
  $('fb5').textContent = s5.fb; $('fb5').dataset.state = s5.fbState; $('fb5').style.color = s5.fbState === 'correct' ? C.green : C.orange;
  if (solved && !s5.fb) { $('fb5').textContent = t('why_' + s5.cur); $('fb5').style.color = C.green; }
  const { ctx, W, H } = fitCanvas($('c5'));
  label(ctx, t('tab_' + s5.cur) + (solved ? '' : ' · ' + t('outlineOnly')), 8, 17, W - 16);
  drawSpecial(ctx, s5.cur, W, H, solved, sc.answer);
  $('r5').textContent = t('s5readout', { c: s5.solved.size, N: TABS.length, done: s5.solved.size === TABS.length ? t('s5done') : '' });
}
function glow(ctx, color) { ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.shadowColor = color; ctx.shadowBlur = 8; }
function drawSpecial(ctx, id, W, H, full, answer) {
  const top = 28, cx = W / 2, cy = (H + top) / 2, avail = Math.min(W - 24, 560), hh = H - top - 14;
  ctx.save(); ctx.lineJoin = 'round';
  const outline = full ? null : '#6b7d93';
  if (id === 'heart') {
    const w = avail * 0.9, h = Math.min(hh * 0.55, 90), x0 = cx - w / 2, y0 = cy - h / 2;
    ctx.beginPath(); ctx.moveTo(x0, y0 + h * 0.2); ctx.lineTo(x0 - 10, y0 - 6); ctx.lineTo(x0 + 22, y0); ctx.lineTo(x0 + w - 24, y0); ctx.lineTo(x0 + w + 10, y0 - 10); ctx.lineTo(x0 + w, y0 + h * 0.4); ctx.lineTo(x0 + w + 8, y0 + h + 8); ctx.lineTo(x0 + w - 26, y0 + h); ctx.lineTo(x0 + 20, y0 + h); ctx.lineTo(x0 - 8, y0 + h + 10); ctx.closePath();
    ctx.fillStyle = full ? '#3a2430' : C.bg; ctx.fill(); ctx.strokeStyle = outline || C.cyan; ctx.lineWidth = 2; ctx.stroke();
    if (full) {
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(255,122,147,0.25)'; ctx.lineWidth = 3;
      for (let x = x0 + 14; x < x0 + w - 6; x += 16) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h); ctx.stroke(); }
      const mitoL = Math.max(5, Math.min(9, w / 70));
      for (let x = x0 + 22; x < x0 + w - 12; x += 16) for (let r = 0; r < 3; r++) {
        const y = y0 + h * (0.22 + r * 0.28);
        if (Math.abs(x - cx) < 26 && r === 1) continue;
        ctx.beginPath(); ctx.ellipse(x, y, mitoL, 3, 0, 0, 7); ctx.fillStyle = '#c0506a'; ctx.fill();
        if (answer === 'mito') { ctx.strokeStyle = '#ffd1db'; ctx.lineWidth = 1.2; ctx.stroke(); }
      }
      ctx.beginPath(); ctx.ellipse(cx, cy, 18, 9, 0, 0, 7); ctx.fillStyle = '#6f5aa8'; ctx.fill();
      ctx.restore();
    }
  } else if (id === 'leaf') {
    const h = hh * 0.92, w = Math.min(h * 0.42, avail * 0.3), x0 = cx - w / 2, y0 = cy - h / 2;
    ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 12); ctx.fillStyle = full ? '#8a7346' : C.bg; ctx.fill(); ctx.strokeStyle = outline || C.tan; ctx.lineWidth = 2; ctx.stroke();
    // sun rays above-left, a cue for "faces the light"
    ctx.save(); ctx.strokeStyle = 'rgba(255,214,102,0.7)'; ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const sx = x0 - 40 + k * 26, sy = y0 + 4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 22, sy + 26); ctx.stroke(); }
    ctx.restore();
    if (full) {
      ctx.beginPath(); ctx.roundRect(x0 + 6, y0 + 6, w - 12, h - 12, 8); ctx.fillStyle = C.cyto; ctx.fill(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy + h * 0.05, w * 0.22, h * 0.3, 0, 0, 7); ctx.fillStyle = 'rgba(79,143,214,0.45)'; ctx.fill();
      for (let k = 0; k < 14; k++) {
        const side = k % 2 ? 1 : -1, y = y0 + 18 + (k >> 1) * (h - 36) / 6.5;
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx + side * (w / 2 - 15), y, 5, 9, 0, 0, 7); ctx.fillStyle = '#2f8a48'; ctx.fill();
        if (answer === 'chloro') glow(ctx, C.green); else { ctx.strokeStyle = C.green; ctx.lineWidth = 1; } ctx.stroke(); ctx.restore();
      }
      ctx.beginPath(); ctx.ellipse(cx, y0 + 24, 9, 7, 0, 0, 7); ctx.fillStyle = '#6f5aa8'; ctx.fill();
    }
  } else if (id === 'root') {
    const w = Math.min(avail * 0.32, 150), h = Math.min(hh * 0.5, 90), x0 = cx - w * 1.35, y0 = cy - h / 2, hairL = Math.min(avail * 0.75, W - (x0 + w) - 14);
    ctx.fillStyle = 'rgba(107,79,51,0.6)';
    for (let k = 0; k < 40; k++) { const px = 12 + hash(k, 1, 2) * (W - 24), py = top + 6 + hash(2, k, 9) * (H - top - 14); ctx.beginPath(); ctx.arc(px, py, 2 + hash(k, k, 3) * 3, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + w, y0); ctx.lineTo(x0 + w, y0 + h * 0.3); ctx.lineTo(x0 + w + hairL, y0 + h * 0.36); ctx.arc(x0 + w + hairL, y0 + h * 0.43, h * 0.07, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x0 + w, y0 + h * 0.5); ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0, y0 + h); ctx.closePath();
    ctx.fillStyle = full ? '#8a7346' : C.bg; ctx.fill(); ctx.strokeStyle = outline || C.tan; ctx.lineWidth = 2; ctx.stroke();
    if (full) {
      // the hair is the same cell stretched out: cytoplasm continues inside it
      ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 + w - 8, y0 + h * 0.4); ctx.lineTo(x0 + w + hairL - 3, y0 + h * 0.43);
      ctx.strokeStyle = C.cyan; ctx.lineWidth = h * 0.11; ctx.stroke(); ctx.strokeStyle = C.cyto; ctx.lineWidth = h * 0.11 - 3; ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.roundRect(x0 + 5, y0 + 5, w - 10, h - 10, 6); ctx.fillStyle = C.cyto; ctx.fill(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x0 + w * 0.45, y0 + h * 0.55, w * 0.32, h * 0.3, 0, 0, 7); ctx.fillStyle = 'rgba(79,143,214,0.5)'; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x0 + w * 0.82, y0 + h * 0.3, 8, 7, 0, 0, 7); ctx.fillStyle = '#6f5aa8'; ctx.fill();
      for (const [fx, fy] of [[0.15, 0.2], [0.2, 0.85], [0.75, 0.8]]) { ctx.beginPath(); ctx.ellipse(x0 + w * fx, y0 + h * fy, 6, 2.6, 0.4, 0, 7); ctx.fillStyle = '#c0506a'; ctx.fill(); }
    }
  } else if (id === 'rbc') {
    const r = Math.min(hh * 0.38, avail * 0.2);
    const tx = cx - r * 1.25, sx = cx + r * 1.35;
    ctx.beginPath(); ctx.arc(tx, cy, r, 0, 7); ctx.fillStyle = full ? C.red : C.bg; ctx.fill(); ctx.strokeStyle = outline || '#ff9aa9'; ctx.lineWidth = 2; ctx.stroke();
    if (full) { const g = ctx.createRadialGradient(tx, cy, 0, tx, cy, r); g.addColorStop(0, 'rgba(255,220,225,0.55)'); g.addColorStop(0.45, 'rgba(255,220,225,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tx, cy, r, 0, 7); ctx.fill(); }
    // side view: a disc thinner in the middle
    const L = r, th = r * 0.32;
    ctx.beginPath(); ctx.moveTo(sx - L, cy);
    ctx.bezierCurveTo(sx - L, cy - th * 1.2, sx - L * 0.4, cy - th * 1.1, sx, cy - th * 0.45);
    ctx.bezierCurveTo(sx + L * 0.4, cy - th * 1.1, sx + L, cy - th * 1.2, sx + L, cy);
    ctx.bezierCurveTo(sx + L, cy + th * 1.2, sx + L * 0.4, cy + th * 1.1, sx, cy + th * 0.45);
    ctx.bezierCurveTo(sx - L * 0.4, cy + th * 1.1, sx - L, cy + th * 1.2, sx - L, cy);
    ctx.fillStyle = full ? C.red : C.bg; ctx.fill(); ctx.strokeStyle = outline || '#ff9aa9'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  window.CELL_I18N_PARAMS = { perMm: M.cellsPerMm() };
  // step 0
  $('z0').addEventListener('input', () => { stopAnim('s0'); draw0(); });
  $('play0').addEventListener('click', () => { $('z0').value = 0; animate('s0', 9000, p => { $('z0').value = Math.round(300 * p); draw0(); }); });
  $('reset0').addEventListener('click', () => { stopAnim('s0'); $('z0').value = 0; draw0(); });
  // step 1
  buildChips('chips1', pick1);
  $('c1').addEventListener('click', ev => { const p = canvasPoint($('c1'), ev), B = s1.B; pick1(M.hitTest(PLANT, (p.x - B.x) / B.s, (p.y - B.y) / B.s, 20 / B.s)); });
  // step 2
  s2.sim = M.createMembraneSim(s2.seed);
  $('run2').addEventListener('click', run2);
  $('tear2').addEventListener('click', () => { const on = $('tear2').getAttribute('aria-pressed') !== 'true'; $('tear2').setAttribute('aria-pressed', on ? 'true' : 'false'); s2.sim.torn = on; draw2(); });
  $('reset2').addEventListener('click', () => { s2.seed = s2.seed % 9 + 1; reset2(); });
  // step 3
  document.querySelectorAll('input[name="base3"],input[name="stalk3"]').forEach(r => r.addEventListener('change', () => { stopAnim('s3'); s3.round = 0; s3.grow = 0; draw3(); }));
  document.querySelectorAll('input[name="guess3"]').forEach(r => r.addEventListener('change', draw3));
  $('graft3').addEventListener('click', () => { s3.round = 1; grow3(); });
  $('recut3').addEventListener('click', () => { if (!s3.round) return; s3.round++; grow3(); });
  // step 4
  buildChips('chips4', claim4);
  for (const [cid, cell] of [['c4a', ANIMAL], ['c4b', PLANT]]) {
    $(cid).addEventListener('click', ev => { const p = canvasPoint($(cid), ev), B = $(cid)._box; claim4(M.hitTest(cell, (p.x - B.x) / B.s, (p.y - B.y) / B.s, 20 / B.s)); });
  }
  $('reveal4').addEventListener('click', () => { M.PLANT_ONLY.forEach(id => s4.found.add(id)); s4.msg = 'f_done'; s4.name = ''; draw4(); });
  $('reset4').addEventListener('click', () => { s4.found.clear(); s4.msg = 'f_start'; s4.name = ''; draw4(); });
  // step 5
  build5();
  $('check5').addEventListener('click', () => {
    const r = document.querySelector('input[name="opt5"]:checked'), sc = scen();
    if (!r) { s5.fb = t('pickFirst'); s5.fbState = 'wrong'; }
    else if (M.judge(sc.id, r.value)) { s5.solved.add(s5.cur); s5.fb = t('why_' + s5.cur); s5.fbState = 'correct'; }
    else { s5.fb = t(sc.ask === 'none' ? 'tryAgainNone' : 'tryAgain'); s5.fbState = 'wrong'; }
    draw5();
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishAll(); if (s2.running) { stop2(); draw2(); } } });
  window.refreshCell = () => {
    document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml, window.CELL_I18N_PARAMS); });
    if (s5.fbState === 'wrong' && s5.fb) s5.fb = '';
    if (s5.fbState === 'correct') s5.fb = t('why_' + s5.cur);
    refresh();
  };
  window.refreshCell();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
