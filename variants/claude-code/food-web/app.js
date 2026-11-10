'use strict';
// Food-web lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every chain, level, energy, concentration, curve and count comes from window.FOODWEB_MODEL (model.js).
// Canvas text is limited to node names, column heads, axis ticks and bar values laid out in fixed slots.
(function () {

const $ = id => document.getElementById(id);
const M = window.FOODWEB_MODEL;
const t = (...a) => window.FOODWEB_I18N.t(...a);
const lang = () => window.FOODWEB_I18N.getLang();
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', edge: '#3d5068', ghost: '#8696aa', prodFill: '#1d3a2b', consFill: '#1b2838', consLine: '#9fb4cc' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (so 90 stays 90).
const trim = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
const group = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Two significant figures below 100, whole numbers (grouped) above.
function fmtSig(v) {
  if (v === 0) return '0';
  if (v >= 100) return group(String(Math.round(v)));
  const d = Math.max(0, 1 - Math.floor(Math.log10(v)));
  return trim(v.toFixed(d));
}
const name = id => t('sp_' + id);
const listName = id => (lang() === 'en' ? name(id).toLowerCase() : name(id));
const list = ids => (ids.length ? ids.map(listName).join(t('listSep')) : t('none'));

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
// Text shrunk until it fits maxW (never squeezed); returns the size used.
function fitText(ctx, text, x, y, maxW, { size = 12, min = 8, weight = '', color = C.text, align = 'left' } = {}) {
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > min);
  ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, x, y);
  return s;
}
function title(ctx, text, X, Y, maxW) { ctx.save(); fitText(ctx, text, X, Y, maxW, { weight: '600' }); ctx.restore(); }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* ---------- shared animation runner (respects reduced motion and hidden pages) ---------- */
const anims = {};
function animate(key, ms, frame, done) {
  stopAnim(key);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / ms);
    frame(p);
    if (p < 1) anims[key] = { id: requestAnimationFrame(tick), frame, done };
    else { delete anims[key]; if (done) done(); }
  };
  anims[key] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(key) { if (anims[key]) { cancelAnimationFrame(anims[key].id); delete anims[key]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- the web picture (steps 0 and 5) ---------- */
// Lays out the pills so no two in a row touch and none leaves the canvas; returns node boxes for hit tests.
function layoutWeb(ctx, W, H) {
  for (let fs = 13; fs >= 9; fs -= 0.5) {
    ctx.font = `600 ${fs}px system-ui,sans-serif`;
    const ph = Math.round(fs * 2.1), padX = Math.round(fs * 0.8);
    const wOf = s => ctx.measureText(name(s.id)).width + 2 * padX;
    const L = Math.max(...M.SPECIES.filter(s => s.x < 0.5).map(wOf)) / 2 + 6;
    const R = Math.max(...M.SPECIES.filter(s => s.x > 0.5).map(wOf)) / 2 + 6;
    const T = ph / 2 + 8, B = ph / 2 + 8;
    const boxes = M.SPECIES.map(s => {
      const w = wOf(s), cx = L + s.x * (W - L - R), cy = T + s.y * (H - T - B);
      return { id: s.id, s, x: cx - w / 2, y: cy - ph / 2, w, h: ph, cx, cy, fs };
    });
    const clash = boxes.some((a, i) => boxes.some((b, j) => j > i && Math.abs(a.cy - b.cy) < ph + 4 && a.x < b.x + b.w + 8 && b.x < a.x + a.w + 8));
    const out = boxes.some(b => b.x < 2 || b.x + b.w > W - 2);
    if ((!clash && !out) || fs <= 9) return boxes;
  }
  return [];
}
// Point where the segment from the box centre towards (tx, ty) leaves the box.
function boxExit(b, tx, ty) {
  const dx = tx - b.cx, dy = ty - b.cy, sx = dx ? (b.w / 2 + 3) / Math.abs(dx) : Infinity, sy = dy ? (b.h / 2 + 3) / Math.abs(dy) : Infinity, k = Math.min(sx, sy);
  return [b.cx + dx * k, b.cy + dy * k];
}
function arrow(ctx, from, to, color, lw, dash) {
  const [x0, y0] = boxExit(from, to.cx, to.cy), [x1, y1] = boxExit(to, from.cx, from.cy);
  const ang = Math.atan2(y1 - y0, x1 - x0), hl = 6 + lw * 1.5;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(ang) * hl * 0.8, y1 - Math.sin(ang) * hl * 0.8); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hl * Math.cos(ang - 0.42), y1 - hl * Math.sin(ang - 0.42)); ctx.lineTo(x1 - hl * Math.cos(ang + 0.42), y1 - hl * Math.sin(ang + 0.42)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// opts: selected, chain (array of ids), visited (Set of "a>b"), removed (Set), starved (Set), web ('full' | 'one')
function drawWeb(canvas, o) {
  const { ctx, W, H } = fitCanvas(canvas);
  const boxes = layoutWeb(ctx, W, H), B = Object.fromEntries(boxes.map(b => [b.id, b]));
  const web = o.web || 'full', live = new Set(M.edges(web).map(e => e.join('>')));
  const chainEdges = new Set((o.chain || []).slice(1).map((id, i) => o.chain[i] + '>' + id));
  const gone = id => (o.removed && o.removed.has(id)) || (o.starved && o.starved.has(id));
  // Draw order: faint first, highlighted last.
  const all = M.edges('full').map(([a, b]) => {
    const key = a + '>' + b;
    let color = C.edge, lw = 1.6, dash = null, z = 0;
    if (!live.has(key)) { color = '#2a3646'; lw = 1.2; dash = [3, 4]; z = -1; }
    else if (gone(a) || gone(b)) { color = '#33404f'; lw = 1.2; dash = [2, 4]; z = -1; }
    if (o.visited && o.visited.has(key)) { color = 'rgba(126,226,168,0.45)'; lw = 2; z = 1; }
    if (o.selected && b === o.selected) { color = C.cyan; lw = 2.6; z = 2; }
    if (o.selected && a === o.selected) { color = C.orange; lw = 2.6; z = 2; }
    if (chainEdges.has(key)) { color = C.green; lw = 3.2; z = 3; }
    return { a, b, color, lw, dash, z };
  }).sort((p, q) => p.z - q.z);
  all.forEach(e => arrow(ctx, B[e.a], B[e.b], e.color, e.lw, e.dash));
  boxes.forEach(b => {
    const removed = o.removed && o.removed.has(b.id), starved = o.starved && o.starved.has(b.id);
    const sel = o.selected === b.id, inChain = o.chain && o.chain.includes(b.id);
    ctx.save();
    roundRect(ctx, b.x, b.y, b.w, b.h, b.h / 2);
    ctx.fillStyle = starved ? C.bg : removed ? '#3a1d27' : b.s.producer ? C.prodFill : C.consFill; ctx.fill();
    ctx.lineWidth = sel || inChain ? 3 : 1.5;
    ctx.strokeStyle = removed ? C.pink : starved ? '#6b7a8c' : sel ? C.cyan : inChain ? C.green : b.s.producer ? C.green : C.consLine;
    if (starved) ctx.setLineDash([4, 3]);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `600 ${b.fs}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = starved || removed ? C.muted : C.text; ctx.fillText(name(b.id), b.cx, b.cy + 0.5);
    if (removed) {
      ctx.strokeStyle = C.pink; ctx.lineWidth = 2.5; ctx.beginPath();
      ctx.moveTo(b.x + 6, b.y + 3); ctx.lineTo(b.x + b.w - 6, b.y + b.h - 3); ctx.moveTo(b.x + b.w - 6, b.y + 3); ctx.lineTo(b.x + 6, b.y + b.h - 3); ctx.stroke();
    }
    ctx.restore();
  });
  canvas._boxes = boxes;
}
function hit(canvas, ev) {
  const r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
  const b = (canvas._boxes || []).find(q => x >= q.x - 4 && x <= q.x + q.w + 4 && y >= q.y - 4 && y <= q.y + q.h + 4);
  return b ? b.id : null;
}
function buildChips(box, onPick) {
  box.innerHTML = '';
  M.IDS.forEach(id => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.id = id; b.dataset.step = box.dataset.step;
    b.addEventListener('click', () => onPick(id));
    box.appendChild(b);
  });
}
function labelChips(box, pressed, extra) {
  box.querySelectorAll('.chip').forEach(b => {
    b.textContent = name(b.dataset.id);
    b.setAttribute('aria-pressed', pressed(b.dataset.id) ? 'true' : 'false');
    if (extra) extra(b);
  });
}

/* ---------- step 0: read the arrows, walk the chains ---------- */
const ALL_CHAINS = M.chains();
const s0 = { sel: 'algae', walk: -1, visited: new Set(), done: false };
function draw0() {
  labelChips($('chips0'), id => id === s0.sel);
  const chain = s0.walk >= 0 ? ALL_CHAINS[s0.walk] : null;
  drawWeb($('c0'), { selected: chain ? null : s0.sel, chain, visited: s0.visited });
  const sp = M.byId(s0.sel), n = ALL_CHAINS.filter(c => c.includes(s0.sel)).length, total = ALL_CHAINS.length;
  const eaters = M.eatersOf(s0.sel), foods = M.foodsOf(s0.sel);
  $('r0').textContent = sp.producer
    ? t('s0readoutProd', { name: name(s0.sel), eaters: list(eaters), n, total })
    : t('s0readout', { name: name(s0.sel), foods: list(foods), eaters: list(eaters), n, total });
  const lens = ALL_CHAINS.map(c => c.length);
  if (chain) $('r0b').textContent = t('s0walk', { i: s0.walk + 1, total, chain: chain.map(name).join(t('arrow')), len: chain.length });
  else if (s0.done) $('r0b').textContent = t('s0walkDone', { total, edges: s0.visited.size, minLen: Math.min(...lens), maxLen: Math.max(...lens) });
  else $('r0b').textContent = t('s0walkIdle', { total });
  $('h0').textContent = t('s0hint', { total });
}
function walk0() {
  s0.visited.clear(); s0.done = false;
  const N = ALL_CHAINS.length;
  animate('walk0', N * 1300, p => {
    const i = Math.min(N - 1, Math.floor(p * N));
    for (let k = 0; k < i; k++) ALL_CHAINS[k].slice(1).forEach((id, j) => s0.visited.add(ALL_CHAINS[k][j] + '>' + id));
    s0.walk = p >= 1 ? -1 : i;
    if (p >= 1) { ALL_CHAINS.forEach(c => c.slice(1).forEach((id, j) => s0.visited.add(c[j] + '>' + id))); s0.done = true; }
    draw0();
  });
}

/* ---------- step 1: rows of chains, columns of levels ---------- */
const s1 = { sel: 'heron' };
function draw1() {
  labelChips($('chips1'), id => id === s1.sel);
  const { ctx, W, H } = fitCanvas($('c1'));
  const lv = M.levels(s1.sel), rows = lv.chains, ncol = Math.max(...ALL_CHAINS.map(c => c.length));
  const L = 8, R = 8, top = 34, colW = (W - L - R) / ncol, rowH = Math.min(28, (H - top - 6) / Math.max(1, rows.length));
  ctx.save();
  for (let k = 0; k < ncol; k++) {
    if (lv.distinct.includes(k + 1)) { ctx.fillStyle = 'rgba(255,180,84,0.08)'; ctx.fillRect(L + k * colW + 1, top - 6, colW - 2, rows.length * rowH + 6); }
    fitText(ctx, t('s1colHead', { k: k + 1 }), L + k * colW + colW / 2, 18, colW - 6, { size: 12, weight: '600', color: lv.distinct.includes(k + 1) ? C.orange : C.muted, align: 'center' });
  }
  rows.forEach((c, r) => {
    const y = top + r * rowH, h = rowH - 6;
    c.forEach((id, k) => {
      const x = L + k * colW + 2, w = colW - 4, sel = id === s1.sel, prod = M.byId(id).producer;
      if (k > 0) { ctx.strokeStyle = C.edge; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 6, y + h / 2); ctx.lineTo(x, y + h / 2); ctx.stroke(); }
      roundRect(ctx, x, y, w, h, 6); ctx.fillStyle = sel ? 'rgba(255,180,84,0.22)' : prod ? C.prodFill : C.consFill; ctx.fill();
      ctx.lineWidth = sel ? 2.4 : 1; ctx.strokeStyle = sel ? C.orange : prod ? C.green : '#3d5068'; ctx.stroke();
      ctx.textBaseline = 'middle';
      let label = name(id); ctx.font = `${sel ? 600 : 400} 9px system-ui,sans-serif`;
      if (ctx.measureText(label).width > w - 3) label = t('ss_' + id);
      fitText(ctx, label, x + w / 2, y + h / 2 + 0.5, w - 3, { size: Math.min(12, h * 0.55), min: 7, weight: sel ? '600' : '', color: sel ? C.text : '#c9d5e3', align: 'center' });
      ctx.textBaseline = 'alphabetic';
    });
  });
  ctx.restore();
  const levels = lv.distinct.join(t('listSep'));
  let txt = lv.distinct.length === 1 ? t('s1readoutOne', { name: name(s1.sel), n: rows.length, levels }) : t('s1readout', { name: name(s1.sel), n: rows.length, levels, foods: list(M.foodsOf(s1.sel)) });
  if (lv.distinct.length > 1) txt += t('s1readoutMany');
  $('r1').textContent = txt;
}

/* ---------- step 2: energy up the longest chain ---------- */
const s2 = { log: false };
const LONG = M.longestChain();
function barAxes(ctx, W, H, o) {
  // o: n columns, top, bottom, left, log, lo/hi (log decades) or max (linear), ticks
  const P = { l: o.left, r: W - 10, t: o.top, b: o.bottom };
  const y = o.log ? v => P.b - (Math.log10(Math.max(v, Math.pow(10, o.lo))) - o.lo) / (o.hi - o.lo) * (P.b - P.t) : v => P.b - v / o.max * (P.b - P.t);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.lineWidth = 1;
  let lastY = Infinity;
  o.ticks.forEach(v => {
    const Y = y(v); ctx.strokeStyle = v === o.ticks[0] ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, Y); ctx.lineTo(P.r, Y); ctx.stroke();
    if (lastY - Y >= 14) { ctx.fillStyle = C.muted; ctx.fillText(fmtSig(v), P.l - 6, Y + 4); lastY = Y; }
  });
  ctx.restore();
  return { P, y, colW: (P.r - P.l) / o.n, x: i => P.l + (i + 0.5) * (P.r - P.l) / o.n };
}
function colLabels(ctx, A, H, ids) {
  ids.forEach((id, i) => {
    ctx.font = '8px system-ui,sans-serif';
    const label = ctx.measureText(name(id)).width > A.colW - 4 ? t('ss_' + id) : name(id);
    fitText(ctx, label, A.x(i), H - 24, A.colW - 4, { size: 12, color: C.text, align: 'center' });
    fitText(ctx, t('lvl', { k: i + 1 }), A.x(i), H - 8, A.colW - 4, { size: 11, color: C.muted, align: 'center' });
  });
}
function draw2() {
  const eff = num('eff2') / 100, n = LONG.length;
  $('eff2v').textContent = num('eff2') + '%';
  $('scaleLin').setAttribute('aria-pressed', !s2.log); $('scaleLog').setAttribute('aria-pressed', s2.log);
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t(s2.log ? 'c2titleLog' : 'c2title'), 8, 18, W - 16);
  const E = LONG.map((_, i) => M.energyAt(eff, i + 1));
  const o = s2.log ? { lo: Math.floor(Math.log10(E[n - 1])), hi: 4.3 } : { max: M.E1 * 1.18 };
  o.ticks = s2.log ? Array.from({ length: Math.floor(o.hi) - o.lo + 1 }, (_, k) => Math.pow(10, o.lo + k)) : [0, 2500, 5000, 7500, 10000];
  const A = barAxes(ctx, W, H, { ...o, n, top: 34, bottom: H - 42, left: 50, log: s2.log });
  const bw = Math.min(56, A.colW * 0.6), base = A.P.b;
  E.forEach((v, i) => {
    const X = A.x(i) - bw / 2;
    if (i > 0) { ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.3; ctx.strokeRect(X, A.y(E[i - 1]), bw, base - A.y(E[i - 1])); ctx.restore(); }
    const Y = A.y(v); ctx.fillStyle = i === 0 ? C.green : C.cyan; ctx.globalAlpha = 0.9; ctx.fillRect(X, Y, bw, Math.max(1.5, base - Y)); ctx.globalAlpha = 1;
    ctx.save(); fitText(ctx, fmtSig(v), A.x(i), Math.min(Y, base - 1.5) - 5, A.colW - 2, { size: 11, color: C.text, align: 'center' }); ctx.restore();
  });
  colLabels(ctx, A, H, LONG);
  const top = n, eTop = E[n - 1];
  $('r2').textContent = t('s2readout', { eff: num('eff2'), lost: 100 - num('eff2'), top, eTop: fmtSig(eTop), pct: fmtSig(100 * eTop / M.E1), need: fmtSig(M.algaePerTop(eff, top)) });
}

/* ---------- step 3: poison concentration up a chain ---------- */
function draw3() {
  const keep = num('keep3') / 100, eff = num('eff3') / 100, ch = M.TOX_CHAIN, n = ch.length;
  $('keep3v').textContent = num('keep3') + '%'; $('eff3v').textContent = num('eff3') + '%';
  const c = ch.map((_, i) => M.toxAt(keep, eff, i + 1));
  const { ctx, W, H } = fitCanvas($('c3'));
  title(ctx, t('c3title'), 8, 18, W - 16);
  const lo = Math.floor(Math.log10(Math.min(...c, M.LIMIT))) , hi = Math.max(lo + 4, Math.ceil(Math.log10(Math.max(...c, M.LIMIT)) + 0.35));
  const ticks = Array.from({ length: hi - lo + 1 }, (_, k) => Math.pow(10, lo + k));
  const A = barAxes(ctx, W, H, { n, top: 40, bottom: H - 42, left: 58, log: true, lo, hi, ticks });
  const bw = Math.min(56, A.colW * 0.6);
  c.forEach((v, i) => {
    const Y = A.y(v), over = v > M.LIMIT;
    ctx.fillStyle = over ? C.pink : C.violet; ctx.globalAlpha = 0.9; ctx.fillRect(A.x(i) - bw / 2, Y, bw, Math.max(1.5, A.P.b - Y)); ctx.globalAlpha = 1;
    ctx.save(); fitText(ctx, fmtSig(v), A.x(i), Y - 5, A.colW - 2, { size: 11, color: C.text, align: 'center' }); ctx.restore();
  });
  ctx.save(); ctx.strokeStyle = C.pink; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(M.LIMIT)); ctx.lineTo(A.P.r, A.y(M.LIMIT)); ctx.stroke(); ctx.restore();
  colLabels(ctx, A, H, ch);
  const f = M.toxFactor(keep, eff), overList = ch.filter((_, i) => c[i] > M.LIMIT);
  let over = overList.length ? t('s3over', { list: list(overList) }) : t('s3overNone');
  if (f < 1) over += ' ' + t('s3down');
  $('r3').textContent = t('s3readout', { keep: num('keep3'), eff: num('eff3'), f: fmtSig(f), c1: fmtSig(c[0]), cTop: fmtSig(c[n - 1]), ratio: fmtSig(c[n - 1] / c[0]), over });
}

/* ---------- step 4: fishing one species out of a four-level chain ---------- */
const LCOL = [C.green, C.cyan, C.orange, C.violet];
const CUTS = { cutNone: -1, cutPike: 3, cutFish: 2, cutZoo: 1 };
const SCENE = { '-1': 's4sceneNone', 3: 's4scenePike', 2: 's4sceneFish', 1: 's4sceneZoo' };
const s4 = { cut: 3, sim: null, shown: 0, running: false };
function waterColour(A) {
  const k = Math.max(0, Math.min(1, A / M.LV.K)), c0 = [42, 93, 122], c1 = [86, 150, 52];
  return `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * k)).join(',')})`;
}
function draw4() {
  Object.keys(CUTS).forEach(id => $(id).setAttribute('aria-pressed', CUTS[id] === s4.cut));
  if (!s4.sim) { s4.sim = M.simulate(s4.cut); s4.shown = s4.sim.samples.length; }
  $('lg4').innerHTML = M.LV.names.map((id, i) => `<span class="lg"><span class="sw" style="background:${LCOL[i]}"></span><span>${name(id)}</span></span>`).join('') +
    `<span class="lg"><span class="sw sw-ghost"></span><span>${t('s4lgCut')}</span></span><span class="lg"><span class="sw sw-water"></span><span>${t('s4lgWater')}</span></span>`;
  const S = s4.sim.samples, shown = S.slice(0, Math.max(1, s4.shown));
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4title'), 8, 18, W - 16);
  const peak = Math.max(...S.flatMap(q => q.pct)), ymax = Math.max(200, Math.ceil(peak / 100 + 0.25) * 100);
  const P = { l: 50, r: W - 12, t: 32, b: H - 72 };
  const x = v => P.l + v / M.SIM.T * (P.r - P.l), y = v => P.b - v / ymax * (P.b - P.t);
  const stepY = (P.b - P.t) / (ymax / 100) >= 22 ? 100 : 200;
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.lineWidth = 1;
  for (let v = 0; v <= ymax + 1e-9; v += stepY) {
    ctx.strokeStyle = v === 100 ? '#3d5068' : v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(v + '%', P.l - 6, y(v) + 4);
  }
  const xs = (P.r - P.l) / (M.SIM.T / 20) >= 34 ? 20 : 40;
  ctx.textAlign = 'center';
  for (let v = 0; v <= M.SIM.T + 1e-9; v += xs) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.b); ctx.lineTo(x(v), P.b + 4); ctx.stroke(); ctx.fillStyle = C.muted; ctx.fillText(String(v), x(v), P.b + 16); }
  fitText(ctx, t('c4x'), (P.l + P.r) / 2, H - 6, P.r - P.l, { size: 11, color: C.muted, align: 'center' });
  if (s4.cut >= 0) { ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x(M.SIM.T_CUT), P.t); ctx.lineTo(x(M.SIM.T_CUT), P.b); ctx.stroke(); ctx.setLineDash([]); }
  // water strip: one slice per sample shown
  const sy = P.b + 24, sh = 14;
  ctx.fillStyle = '#16212d'; ctx.fillRect(P.l, sy, P.r - P.l, sh);
  shown.forEach((q, i) => { const x0 = x(q.t), x1 = i + 1 < S.length ? x(S[i + 1].t) : P.r; ctx.fillStyle = waterColour(q.raw[0]); ctx.fillRect(x0, sy, Math.max(1, x1 - x0 + 0.5), sh); });
  M.LV.names.forEach((_, k) => {
    ctx.strokeStyle = LCOL[k]; ctx.lineWidth = 2.2; ctx.beginPath();
    shown.forEach((q, i) => { const Y = y(q.pct[k]); if (!i) ctx.moveTo(x(q.t), Y); else ctx.lineTo(x(q.t), Y); });
    ctx.stroke();
    const last = shown[shown.length - 1]; ctx.fillStyle = LCOL[k]; ctx.beginPath(); ctx.arc(x(last.t), y(last.pct[k]), 3.5, 0, 7); ctx.fill();
  });
  ctx.restore();
  const last = shown[shown.length - 1], finished = s4.shown >= S.length;
  const dir = v => (v < 0.5 ? t('gone') : v > 102 ? t('up') : v < 98 ? t('down') : t('same'));
  const rows = M.LV.names.map((id, k) => t('s4row', { name: name(id), pct: Math.round(last.pct[k]), dir: dir(last.pct[k]) })).join(t('listSep'));
  if (!finished) { $('r4').textContent = t('s4progress', { t: Math.round(last.t), T: M.SIM.T }) + rows; return; }
  let txt = t('s4readout', { scene: t(SCENE[s4.cut]), rows });
  if (s4.cut < 0) txt += ' ' + t('s4tailNone');
  else { const a = last.pct[0]; txt += ' ' + t('s4tail', { algae: Math.round(a), water: t(a > 110 ? 'waterGreener' : a < 90 ? 'waterClearer' : 'waterSame') }); }
  $('r4').textContent = txt;
}
function run4(cut) {
  s4.cut = cut; s4.sim = M.simulate(cut); const N = s4.sim.samples.length;
  s4.shown = 1;
  animate('run4', 6500, p => { s4.shown = Math.max(1, Math.round(p * N)); draw4(); });
}

/* ---------- step 5: who starves ---------- */
const s5 = { web: 'full', removed: new Set() };
const TABLE = { full: M.singleRemovalTable('full'), one: M.singleRemovalTable('one') };
function draw5() {
  $('webFull').setAttribute('aria-pressed', s5.web === 'full'); $('webOne').setAttribute('aria-pressed', s5.web === 'one');
  const starved = new Set(M.starved([...s5.removed], s5.web));
  labelChips($('chips5'), id => s5.removed.has(id), b => { b.classList.add('removed'); b.classList.toggle('starved', starved.has(b.dataset.id)); });
  drawWeb($('c5'), { web: s5.web, removed: s5.removed, starved });
  // bars
  const { ctx, W, H } = fitCanvas($('c5b'));
  title(ctx, t('c5btitle'), 8, 18, W - 16);
  const maxV = Math.max(...TABLE.one.map(r => r.lost.length), 1), lab = Math.min(118, W * 0.34);
  const P = { l: lab + 10, r: W - 26, t: 34, b: H - 26 }, rowH = (P.b - P.t) / M.IDS.length, x = v => P.l + v / maxV * (P.r - P.l);
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
  for (let v = 0; v <= maxV; v++) { ctx.strokeStyle = v ? C.grid : C.axis; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); ctx.fillStyle = C.muted; ctx.fillText(String(v), x(v), P.b + 15); }
  M.IDS.forEach((id, i) => {
    const y0 = P.t + i * rowH, bh = Math.min(11, (rowH - 8) / 2);
    ctx.textBaseline = 'middle';
    fitText(ctx, name(id), lab, y0 + rowH / 2, lab - 4, { size: 12, color: s5.removed.has(id) ? C.pink : C.text, align: 'right' });
    [['full', C.cyan], ['one', C.orange]].forEach(([k, col], j) => {
      const v = TABLE[k][i].lost.length, by = y0 + rowH / 2 - bh - 1 + j * (bh + 2);
      ctx.fillStyle = col; ctx.globalAlpha = s5.web === k ? 0.95 : 0.45; ctx.fillRect(P.l, by, Math.max(2, x(v) - P.l), bh); ctx.globalAlpha = 1;
      ctx.font = '10px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.fillText(String(v), Math.max(P.l + 2, x(v)) + 4, by + bh / 2);
    });
    ctx.textBaseline = 'alphabetic';
  });
  ctx.restore();
  const webName = t(s5.web === 'full' ? 'webFull' : 'webOne');
  $('r5').textContent = s5.removed.size ? t('s5readout', { web: webName, removed: list([...s5.removed]), starved: list([...starved]), n: starved.size }) : t('s5readoutNone', { web: webName });
  const tot = k => TABLE[k].reduce((s, r) => s + r.lost.length, 0);
  $('r5sum').textContent = t('s5sum', { full: tot('full'), one: tot('one') });
}
function toggle5(id) {
  if (s5.removed.has(id)) s5.removed.delete(id); else s5.removed.add(id);
  draw5();
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildChips($('chips0'), id => { stopAnim('walk0'); s0.walk = -1; s0.sel = id; draw0(); });
  buildChips($('chips1'), id => { s1.sel = id; draw1(); });
  buildChips($('chips5'), toggle5);
  $('c0').addEventListener('click', ev => { const id = hit($('c0'), ev); if (id) { stopAnim('walk0'); s0.walk = -1; s0.sel = id; draw0(); } });
  $('c5').addEventListener('click', ev => { const id = hit($('c5'), ev); if (id) toggle5(id); });
  $('walk0').addEventListener('click', walk0);
  $('stop0').addEventListener('click', () => { stopAnim('walk0'); s0.walk = -1; draw0(); });

  $('eff2').addEventListener('input', draw2);
  $('scaleLin').addEventListener('click', () => { s2.log = false; draw2(); });
  $('scaleLog').addEventListener('click', () => { s2.log = true; draw2(); });
  ['keep3', 'eff3'].forEach(id => $(id).addEventListener('input', draw3));

  Object.keys(CUTS).forEach(id => $(id).addEventListener('click', () => run4(CUTS[id])));
  $('replay4').addEventListener('click', () => run4(s4.cut));

  $('webFull').addEventListener('click', () => { s5.web = 'full'; draw5(); });
  $('webOne').addEventListener('click', () => { s5.web = 'one'; draw5(); });
  $('restore5').addEventListener('click', () => { s5.removed.clear(); draw5(); });

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
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshFoodWeb = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
