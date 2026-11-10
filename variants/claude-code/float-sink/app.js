'use strict';
// Float & sink lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, bar and readout comes from window.FLOAT_MODEL (model.js). Canvas text is limited to
// panel titles, axis ticks and the two balance-pan captions in reserved slots; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.FLOAT_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', metal: '#8ea3b8', water: 'rgba(103,215,249,.22)', waterLine: '#67d7f9', ghost: '#8696aa' };
const OBJ_COL = { log: '#a8743f', apple: '#e0554f', ice: '#d6f1ff', nail: '#9aa3ad', eraser: '#f29bb6', stone: '#8c8173' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const pct = f => String(Math.round(f * 100));

function fitCanvas(canvas, height) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  canvas.style.height = height + 'px';
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
const widthOf = canvas => Math.max(240, canvas.clientWidth || 600);
function label(ctx, text, x, y, { align = 'left', maxW = 9999, size = 12, weight = 400, color = C.text, W = 9999 } = {}) {
  ctx.save(); ctx.fillStyle = color; let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 8);
  const w = ctx.measureText(text).width;
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  x0 = Math.max(4, Math.min(W - 4 - w, x0));
  ctx.textAlign = 'left'; ctx.fillText(text, x0, y); ctx.restore();
}
const title = (ctx, text, x, y, maxW, W) => label(ctx, text, x, y, { maxW, size: 12, weight: 600, W });
function arrow(ctx, x0, y0, x1, y1, color, lw = 3, head = 9) {
  const a = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0); if (len < 1) return;
  const hd = Math.min(head, len * 0.6);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hd * 0.7 * Math.cos(a), y1 - hd * 0.7 * Math.sin(a)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hd * Math.cos(a - 0.45), y1 - hd * Math.sin(a - 0.45)); ctx.lineTo(x1 - hd * Math.cos(a + 0.45), y1 - hd * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function frame(ctx, o) {
  const x = v => o.l + (v - o.xMin) / (o.xMax - o.xMin) * (o.r - o.l);
  const y = v => o.b - (v - o.yMin) / (o.yMax - o.yMin) * (o.b - o.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  for (const v of o.yTicks) { ctx.strokeStyle = v === 0 ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(o.l, y(v)); ctx.lineTo(o.r, y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(fmt(v), o.l - 5, y(v) + 4); }
  for (const v of o.xTicks) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x(v), o.b); ctx.lineTo(x(v), o.b + 4); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(fmt(v), x(v), o.b + 16); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(o.l, o.t); ctx.lineTo(o.l, o.b); ctx.stroke();
  ctx.restore();
  return { x, y };
}
// A tank: walls, water up to `level` (y px). Returns nothing; caller draws contents after.
function tank(ctx, x, top, w, bottom, level, tint = C.water) {
  ctx.fillStyle = tint; ctx.fillRect(x, level, w, bottom - level);
  ctx.strokeStyle = C.waterLine; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, level); ctx.lineTo(x + w, level); ctx.stroke();
  ctx.strokeStyle = C.metal; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.lineTo(x + w, bottom); ctx.lineTo(x + w, top); ctx.stroke();
}
// Water drawn over the submerged part of a shape, so it reads as "under the surface".
function veil(ctx, x, level, w, bottom) { ctx.fillStyle = 'rgba(103,215,249,.28)'; ctx.fillRect(x, level, w, bottom - level); }
// Same, for a round shape: tint only the part of the shape below the surface.
function veilShape(ctx, path, level, W, H) { ctx.save(); ctx.beginPath(); ctx.rect(0, level, W, H - level); ctx.clip(); path(); ctx.fillStyle = 'rgba(103,215,249,.28)'; ctx.fill(); ctx.restore(); }

/* ---------- animation runner ---------- */
const anims = {};
function animate(name, ms, frameFn, done) {
  stopAnim(name);
  if (reduceMotion()) { frameFn(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frameFn(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frameFn, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frameFn, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frameFn(1); if (a.done) a.done(); }); }
const ease = p => 1 - Math.pow(1 - p, 3);
function setPressed(ids, on) { ids.forEach(id => $(id).setAttribute('aria-pressed', id === on ? 'true' : 'false')); }

/* ---------- step 0: guess, compare, drop ---------- */
const s0 = { sel: 'log', guess: null, dropped: false, p: 0, log: new Map() };
function buildObjects() {
  M.OBJECTS.forEach(o => {
    const b = document.createElement('button'); b.className = 'btn toggle'; b.type = 'button'; b.id = 'obj_' + o.id; b.dataset.step = '0';
    b.addEventListener('click', () => { stopAnim('s0'); s0.sel = o.id; s0.guess = null; s0.dropped = false; s0.p = 0; draw0(); });
    $('objButtons').appendChild(b);
  });
}
function draw0() {
  const o = M.OBJECTS.find(q => q.id === s0.sel), res = M.settle(o.mass, o.vol);
  M.OBJECTS.forEach(q => { const b = $('obj_' + q.id); b.textContent = t('obj_' + q.id); b.setAttribute('aria-pressed', q.id === s0.sel ? 'true' : 'false'); });
  setPressed(['guessFloat', 'guessSink'], s0.guess === 'float' ? 'guessFloat' : s0.guess === 'sink' ? 'guessSink' : '');
  const canvas = $('c0'), wide = widthOf(canvas) >= 600;
  const { ctx, W, H } = fitCanvas(canvas, wide ? 300 : 540);
  const A = wide ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: 250 };
  const R = wide ? { x: W * 0.5, y: 0, w: W * 0.5, h: H } : { x: 0, y: 250, w: W, h: H - 250 };
  title(ctx, t('c0a'), A.x + 10, A.y + 18, A.w - 20, W);
  title(ctx, t('c0b'), R.x + 10, R.y + 18, R.w - 20, W);
  if (!wide) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(10, R.y + 2); ctx.lineTo(W - 10, R.y + 2); ctx.stroke(); }

  // balance: tilts toward the heavier pan (angle only shows which side is heavier)
  const px = A.x + A.w / 2, py = A.y + 70, L = Math.min(A.w * 0.36, 150), diff = o.mass - res.same;
  const ang = diff === 0 ? 0 : Math.sign(diff) * -0.16; // left heavier → left end goes down
  const lx = px - L * Math.cos(ang), ly = py - L * Math.sin(ang), rx = px + L * Math.cos(ang), ry = py + L * Math.sin(ang);
  ctx.fillStyle = C.metal; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 14, A.y + A.h - 54); ctx.lineTo(px + 14, A.y + A.h - 54); ctx.closePath(); ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = C.metal; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
  const pan = (x, y, draw) => { ctx.strokeStyle = C.metal; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 26, y + 46); ctx.moveTo(x, y); ctx.lineTo(x + 26, y + 46); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 32, y + 46); ctx.lineTo(x + 32, y + 46); ctx.stroke(); draw(x, y + 46); };
  pan(lx, ly, (x, y) => { ctx.fillStyle = OBJ_COL[o.id]; ctx.fillRect(x - 15, y - 26, 30, 24); });
  pan(rx, ry, (x, y) => { ctx.fillStyle = 'rgba(103,215,249,.45)'; ctx.fillRect(x - 15, y - 26, 30, 24); ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 3]); ctx.strokeRect(x - 15, y - 26, 30, 24); ctx.restore(); });
  const capY = A.y + A.h - 22;
  label(ctx, t('panLeft') + ' ' + fmt(o.mass, 1) + ' g', A.x + A.w * 0.25, capY, { align: 'center', maxW: A.w / 2 - 12, color: C.orange, weight: 600, W });
  label(ctx, t('panRight') + ' ' + fmt(res.same, 1) + ' g', A.x + A.w * 0.75, capY, { align: 'center', maxW: A.w / 2 - 12, color: C.cyan, weight: 600, W });

  // tank
  const tx = R.x + 24, tw = R.w - 48, tTop = R.y + 34, tBot = R.y + R.h - 16, level = tTop + (tBot - tTop) * 0.4;
  tank(ctx, tx, tTop, tw, tBot, level);
  const size = 22 + 9 * Math.log10(o.vol), ox = tx + tw / 2 - size / 2;
  const startY = tTop + 2, endY = res.state === 'sink' ? tBot - size - 1 : level - size * (1 - res.fraction);
  const y = s0.dropped ? startY + (endY - startY) * ease(s0.p) : startY;
  ctx.fillStyle = OBJ_COL[o.id]; ctx.fillRect(ox, y, size, size);
  if (y + size > level) veil(ctx, ox, Math.max(level, y), size, y + size);

  let resText = t('resWait');
  if (s0.dropped && s0.p >= 1) {
    resText = res.state === 'sink' ? t('resSink') : t('resFloat', { pct: pct(res.fraction) });
    if (s0.guess) resText += ' ' + t(s0.guess === res.state || (s0.guess === 'float' && res.state === 'hover') ? 'guessRight' : 'guessWrong');
  }
  $('r0').textContent = t('s0readout', { name: t('obj_' + o.id), m: fmt(o.mass, 1), v: fmt(o.vol, 0), w: fmt(res.same, 1), cmp: t(o.mass < res.same ? 'cmpLighter' : 'cmpHeavier'), res: resText });
  const rows = M.OBJECTS.filter(q => s0.log.has(q.id));
  $('t0').innerHTML = rows.length ? `<tr><th>${t('th0Obj')}</th><th>${t('th0M')}</th><th>${t('th0V')}</th><th>${t('th0W')}</th><th>${t('th0Guess')}</th><th>${t('th0Res')}</th></tr>` +
    rows.map(q => { const g = s0.log.get(q.id), rr = M.settle(q.mass, q.vol); return `<tr class="${q.id === s0.sel ? 'on' : ''}"><td>${t('obj_' + q.id)}</td><td>${fmt(q.mass, 1)}</td><td>${fmt(q.vol, 0)}</td><td>${fmt(rr.same, 1)}</td><td>${g ? t(g === 'float' ? 'guessFloat' : 'guessSink') : t('noGuess')}</td><td>${t(rr.state === 'sink' ? 'resSinkS' : 'resFloatS')}</td></tr>`; }).join('') : '';
}
function drop0() {
  s0.dropped = true; s0.log.set(s0.sel, s0.guess);
  animate('s0', 1000, p => { s0.p = p; draw0(); });
}

/* ---------- step 1: push the block down ---------- */
const s1 = { d: 1 };
function draw1() {
  const d = s1.d, P = M.push(d);
  $('d1v').textContent = fmt(d) + ' cm';
  const canvas = $('c1'), wide = widthOf(canvas) >= 600;
  const { ctx, W, H } = fitCanvas(canvas, wide ? 330 : 600);
  const A = wide ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: 300 };
  const R = wide ? { x: W * 0.5, y: 0, w: W * 0.5, h: H } : { x: 0, y: 300, w: W, h: H - 300 };
  title(ctx, t('c1a'), A.x + 10, A.y + 18, A.w - 20, W);
  title(ctx, t('c1b'), R.x + 10, R.y + 18, R.w - 20, W);
  // tank 20 cm wide, 20 cm tall, 9 cm of water before the block (to scale); the empty top leaves room for the arrows
  const s = Math.min((A.w - 40) / 20, (A.h - 56) / 20), tx = A.x + (A.w - 20 * s) / 2, tBot = A.y + A.h - 16, tTop = tBot - 20 * s;
  const level0 = tBot - 9 * s, level = level0 - P.rise * s;
  tank(ctx, tx, tTop, 20 * s, tBot, level);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(tx, level0); ctx.lineTo(tx + 20 * s, level0); ctx.stroke(); ctx.restore();
  const bw = 10 * s, bh = M.BLOCK.height * s, bx = tx + 5 * s, bBot = level + d * s, bTop = bBot - bh;
  ctx.fillStyle = OBJ_COL.log; ctx.fillRect(bx, bTop, bw, bh); veil(ctx, bx, level, bw, bBot);
  const k = Math.max(0.08, Math.min(6 * s - 14, 5.25 * s - 6) / 300); // px per gram: 300 g fits above the block at 0 cm and below it at 5 cm
  arrow(ctx, bx + bw * 0.3, bBot - 4, bx + bw * 0.3, bBot - 4 + M.BLOCK.mass * k, C.orange);
  arrow(ctx, bx + bw * 0.7, bBot, bx + bw * 0.7, bBot - P.up * k, C.green);
  if (Math.abs(P.hand) > 1e-9) {
    const hx = bx + bw / 2;
    if (P.hand > 0) arrow(ctx, hx, bTop - 6 - P.hand * k, hx, bTop - 2, C.pink);
    else { ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx, bTop); ctx.lineTo(hx, bTop - 8); ctx.stroke(); arrow(ctx, hx, bTop - 8, hx, bTop - 8 + P.hand * k, C.pink); }
  }
  // chart: upward push vs volume under water
  const f = frame(ctx, { l: R.x + 46, r: R.x + R.w - 14, t: R.y + 34, b: R.y + R.h - 28, xMin: 0, xMax: 500, yMin: 0, yMax: 500, xTicks: [0, 100, 200, 300, 400, 500].filter((v, i) => R.w >= 300 || i % 2 === 0 || v === 500), yTicks: [0, 100, 200, 300, 400, 500] });
  ctx.strokeStyle = C.green; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(f.x(0), f.y(0)); ctx.lineTo(f.x(500), f.y(500)); ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.x(0), f.y(M.BLOCK.mass)); ctx.lineTo(f.x(500), f.y(M.BLOCK.mass)); ctx.stroke();
  const fv = M.floatDepth() * M.BLOCK.base;
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(f.x(fv), f.y(0)); ctx.lineTo(f.x(fv), f.y(M.BLOCK.mass)); ctx.stroke(); ctx.restore();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(f.x(fv), f.y(M.BLOCK.mass), 4, 0, 7); ctx.fill();
  if (Math.abs(P.hand) > 1e-9) { ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(f.x(P.vol), f.y(P.up)); ctx.lineTo(f.x(P.vol), f.y(M.BLOCK.mass)); ctx.stroke(); }
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(f.x(P.vol), f.y(P.up), 6, 0, 7); ctx.fill();
  const key = Math.abs(P.hand) < 1e-9 ? 's1readFree' : P.hand > 0 ? 's1readDown' : 's1readUp';
  $('r1').textContent = t(key, { d: fmt(d), v: fmt(P.vol, 0), rise: fmt(P.rise, 2), h: fmt(Math.abs(P.hand), 0) });
}

/* ---------- step 2: ball or boat ---------- */
function draw2() {
  const v = num('v2'), B = M.boat(v), ball = v === M.CLAY.vol;
  $('v2v').textContent = ball ? `${v} cm³ · ${t('ballTag')}` : `${v} cm³`;
  const canvas = $('c2'), wide = widthOf(canvas) >= 600;
  const { ctx, W, H } = fitCanvas(canvas, wide ? 320 : 520);
  const A = wide ? { x: 0, y: 0, w: W * 0.62, h: H } : { x: 0, y: 0, w: W, h: 290 };
  const R = wide ? { x: W * 0.62, y: 0, w: W * 0.38, h: H } : { x: 0, y: 290, w: W, h: H - 290 };
  title(ctx, t('c2a'), A.x + 10, A.y + 18, A.w - 20, W);
  title(ctx, t('c2b'), R.x + 10, R.y + 18, R.w - 20, W);
  const tx = A.x + 20, tw = A.w - 40, tTop = A.y + 34, tBot = A.y + A.h - 14, level = tTop + (tBot - tTop) * 0.35;
  tank(ctx, tx, tTop, tw, tBot, level);
  const cx = tx + tw / 2, clay = '#d9a25a';
  if (ball) {
    const r = 22, ball = () => { ctx.beginPath(); ctx.arc(cx, tBot - r - 1, r, 0, 7); }; ctx.fillStyle = clay; ball(); ctx.fill(); veilShape(ctx, ball, level, W, H);
  } else {
    // open box drawn with height 46 px; width grows with the outside size (sketch)
    const bh = 46, bw = Math.min(tw - 20, 0.9 * v + 8), x0 = cx - bw / 2;
    const bottomY = B.state === 'sink' ? tBot - 1 : level + bh * B.fraction, topY = bottomY - bh;
    ctx.fillStyle = clay; ctx.fillRect(x0, topY, 4, bh); ctx.fillRect(x0 + bw - 4, topY, 4, bh); ctx.fillRect(x0, bottomY - 4, bw, 4);
    if (B.state === 'sink') { ctx.fillStyle = 'rgba(103,215,249,.35)'; ctx.fillRect(x0 + 4, topY, bw - 8, bh - 4); }
    else { ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(x0 + 4, topY, bw - 8, bh - 4); veil(ctx, x0, Math.max(level, topY), bw, bottomY); }
  }
  // bars: most it can hold up vs the clay's weight
  const f = frame(ctx, { l: R.x + 44, r: R.x + R.w - 14, t: R.y + 34, b: R.y + R.h - 20, xMin: 0, xMax: 1, yMin: 0, yMax: 200, xTicks: [], yTicks: [0, 50, 100, 150, 200] });
  const bw = Math.min(46, (f.x(1) - f.x(0)) * 0.28), c1 = f.x(0.3), c2 = f.x(0.7);
  ctx.fillStyle = C.green; ctx.fillRect(c1 - bw / 2, f.y(B.maxUp), bw, f.y(0) - f.y(B.maxUp));
  ctx.fillStyle = C.orange; ctx.fillRect(c2 - bw / 2, f.y(M.CLAY.mass), bw, f.y(0) - f.y(M.CLAY.mass));
  const key = ball ? 's2readBall' : B.state === 'sink' ? 's2readSink' : B.state === 'hover' ? 's2readEdge' : 's2readFloat';
  $('r2').textContent = t(key, { v, pct: pct(B.fraction) });
}

/* ---------- step 3: bottle submarine ---------- */
const s3 = { y: null };
function sub3Geom(W) {
  const wide = W >= 600, A = wide ? { x: 0, y: 0, w: W * 0.62, h: 320 } : { x: 0, y: 0, w: W, h: 290 };
  const tx = A.x + 20, tw = A.w - 40, tTop = A.y + 34, tBot = A.y + A.h - 14, level = tTop + (tBot - tTop) * 0.3, sh = 40;
  return { wide, A, tx, tw, tTop, tBot, level, sh };
}
function target3(S, g) {
  if (S.state === 'float') return g.level + g.sh * S.fraction - g.sh; // top of hull
  if (S.state === 'sink') return g.tBot - 1 - g.sh;
  const cur = s3.y === null ? g.level : s3.y; return Math.min(g.tBot - 1 - g.sh, Math.max(g.level + 6, cur)); // hover: stays where it is, just under the surface
}
function draw3() {
  const w = num('w3'), S = M.sub(w);
  $('w3v').textContent = w + ' g';
  const canvas = $('c3'), g = sub3Geom(widthOf(canvas)), { ctx, W, H } = fitCanvas(canvas, g.wide ? 320 : 520);
  const R = g.wide ? { x: W * 0.62, y: 0, w: W * 0.38, h: H } : { x: 0, y: 290, w: W, h: H - 290 };
  title(ctx, t('c3a'), g.A.x + 10, g.A.y + 18, g.A.w - 20, W);
  title(ctx, t('c3b'), R.x + 10, R.y + 18, R.w - 20, W);
  tank(ctx, g.tx, g.tTop, g.tw, g.tBot, g.level);
  if (s3.y === null) s3.y = target3(S, g);
  const sw = Math.min(150, g.tw - 30), x0 = g.tx + (g.tw - sw) / 2, y0 = s3.y;
  ctx.fillStyle = '#3d5a78'; ctx.strokeStyle = C.metal; ctx.lineWidth = 2;
  const hull = () => { ctx.beginPath(); ctx.moveTo(x0 + g.sh / 2, y0); ctx.lineTo(x0 + sw - g.sh / 2, y0); ctx.arc(x0 + sw - g.sh / 2, y0 + g.sh / 2, g.sh / 2, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x0 + g.sh / 2, y0 + g.sh); ctx.arc(x0 + g.sh / 2, y0 + g.sh / 2, g.sh / 2, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); };
  hull(); ctx.fill(); ctx.stroke();
  // ballast tank inside
  const kx = x0 + sw * 0.3, kw = sw * 0.4, ky = y0 + 8, kh = g.sh - 16, fill = w / M.SUB.tankMax;
  ctx.strokeStyle = C.text; ctx.lineWidth = 1; ctx.strokeRect(kx, ky, kw, kh);
  ctx.fillStyle = C.cyan; ctx.fillRect(kx + 1, ky + kh * (1 - fill), kw - 2, kh * fill);
  veilShape(ctx, hull, g.level, W, H);
  const f = frame(ctx, { l: R.x + 44, r: R.x + R.w - 14, t: R.y + 34, b: R.y + R.h - 20, xMin: 0, xMax: 1, yMin: 0, yMax: 140, xTicks: [], yTicks: [0, 20, 40, 60, 80, 100, 120, 140] });
  const bw = Math.min(46, (f.x(1) - f.x(0)) * 0.28), c1 = f.x(0.3), c2 = f.x(0.7);
  ctx.fillStyle = C.green; ctx.fillRect(c1 - bw / 2, f.y(S.maxUp), bw, f.y(0) - f.y(S.maxUp));
  ctx.fillStyle = C.orange; ctx.fillRect(c2 - bw / 2, f.y(M.SUB.empty), bw, f.y(0) - f.y(M.SUB.empty));
  ctx.fillStyle = C.cyan; ctx.fillRect(c2 - bw / 2, f.y(S.total), bw, f.y(M.SUB.empty) - f.y(S.total));
  const key = S.state === 'float' ? 's3readFloat' : S.state === 'hover' ? 's3readHover' : 's3readSink';
  $('r3').textContent = t(key, { w, tot: S.total, pct: pct(S.fraction) });
}
function move3() {
  const g = sub3Geom(widthOf($('c3'))), S = M.sub(num('w3')), from = s3.y === null ? target3(S, g) : s3.y, to = target3(S, g);
  animate('s3', 700, p => { s3.y = from + (to - from) * ease(p); draw3(); });
}

/* ---------- step 4: fresh water, sea water, very salty water ---------- */
const LQ = { fresh: 'lqFresh', sea: 'lqSea', brine: 'lqBrine' };
const TINT = { fresh: 'rgba(103,215,249,.20)', sea: 'rgba(80,190,200,.30)', brine: 'rgba(110,215,235,.34)' };
const s4 = { liquid: 'fresh', tried: new Set(['fresh']) };
function draw4() {
  const rho = M.LIQUIDS[s4.liquid], draft = M.shipDraft(rho), egg = M.settle(M.EGG.mass, M.EGG.vol, rho);
  setPressed(Object.values(LQ), LQ[s4.liquid]);
  const canvas = $('c4'), wide = widthOf(canvas) >= 600;
  const { ctx, W, H } = fitCanvas(canvas, wide ? 320 : 540);
  const A = wide ? { x: 0, y: 0, w: W * 0.64, h: H } : { x: 0, y: 0, w: W, h: 300 };
  const R = wide ? { x: W * 0.64, y: 0, w: W * 0.36, h: H } : { x: 0, y: 300, w: W, h: H - 300 };
  title(ctx, t('c4'), A.x + 10, A.y + 18, A.w - 20, W);
  title(ctx, t('c4b'), R.x + 10, R.y + 18, R.w - 20, W);
  if (!wide) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(10, R.y + 2); ctx.lineTo(W - 10, R.y + 2); ctx.stroke(); }
  // tank 30 cm wide × 20 cm, 14 cm of liquid; the ship is drawn to the same scale
  const s = Math.min((A.w - 40) / 30, (A.h - 56) / 20), tw = 30 * s, tx = A.x + (A.w - tw) / 2, tBot = A.y + A.h - 14, tTop = tBot - 20 * s, level = tBot - 14 * s;
  tank(ctx, tx, tTop, tw, tBot, level, TINT[s4.liquid]);
  const hx = tx + 4 * s, hw = 10 * s, hh = M.SHIP.height * s, hBot = level + draft * s, hTop = hBot - hh;
  ctx.fillStyle = '#c9714f'; ctx.fillRect(hx, hTop, hw, hh); ctx.fillStyle = '#e8edf4'; ctx.fillRect(hx, hTop, hw, 3);
  // waterline marks for every liquid tried, measured from the hull bottom
  const marks = (yOf, x0, x1) => [...s4.tried].forEach(k => {
    const yk = yOf(M.shipDraft(M.LIQUIDS[k])), on = k === s4.liquid;
    ctx.save(); ctx.strokeStyle = on ? C.orange : C.ghost; ctx.lineWidth = on ? 2.5 : 1.5; if (!on) ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(x0, yk); ctx.lineTo(x1, yk); ctx.stroke(); ctx.restore();
  });
  marks(dd => hBot - dd * s, hx + hw * 0.15, hx + hw * 0.85);
  veil(ctx, hx, level, hw, hBot);
  // close-up of the hull side: height above the hull bottom, 4.5–6.5 cm, so 0.15 cm differences are visible
  const z = frame(ctx, { l: R.x + 50, r: R.x + R.w - 16, t: R.y + 36, b: R.y + R.h - 16, xMin: 0, xMax: 1, yMin: 4.5, yMax: 6.5, xTicks: [], yTicks: [4.5, 5, 5.5, 6, 6.5] });
  const zx0 = z.x(0.1), zx1 = z.x(0.9);
  ctx.fillStyle = '#c9714f'; ctx.fillRect(zx0, z.y(6.5), zx1 - zx0, z.y(4.5) - z.y(6.5));
  ctx.fillStyle = TINT[s4.liquid]; ctx.fillRect(zx0, z.y(draft), zx1 - zx0, z.y(4.5) - z.y(draft));
  ctx.fillStyle = 'rgba(103,215,249,.28)'; ctx.fillRect(zx0, z.y(draft), zx1 - zx0, z.y(4.5) - z.y(draft));
  marks(dd => z.y(dd), zx0 - 6, zx1 + 6);
  // egg (sketch size)
  const er = Math.max(9, 2.2 * s), ex = tx + 22 * s, eh = er * 1.3;
  const eyC = egg.state === 'sink' ? tBot - eh - 1 : level + eh * (2 * egg.fraction - 1);
  const eggPath = () => { ctx.beginPath(); ctx.ellipse(ex, eyC, er, eh, 0, 0, 7); };
  ctx.fillStyle = '#f3e3c8'; eggPath(); ctx.fill(); veilShape(ctx, eggPath, level, W, H);
  $('r4').textContent = t('s4readout', { liquid: t(LQ[s4.liquid]), cup: fmt(M.cupWeight(rho), 1), draft: fmt(draft, 2), egg: fmt(egg.same, 1), eggRes: t(egg.state === 'float' ? 'eggFloat' : 'eggSink') });
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4();
  const fb = $('fbQuiz'); if (fb.dataset.state) fb.textContent = quizText(fb.dataset.state === 'correct');
}
function quizText(ok) { const q = M.settle(M.QUIZ.mass, M.QUIZ.vol); return t(ok ? 'correct' : 'wrong', { d: fmt(q.displaced, 0), pct: pct(q.fraction) }); }

function setup() {
  buildObjects();
  $('guessFloat').addEventListener('click', () => { s0.guess = 'float'; draw0(); });
  $('guessSink').addEventListener('click', () => { s0.guess = 'sink'; draw0(); });
  $('drop0').addEventListener('click', drop0);
  $('d1').addEventListener('input', () => { stopAnim('s1'); s1.d = num('d1'); draw1(); });
  $('let1').addEventListener('click', () => {
    const from = s1.d, to = M.floatDepth();
    animate('s1', 900, p => { s1.d = from + (to - from) * ease(p); $('d1').value = String(Math.round(s1.d * 4) / 4); draw1(); }, () => { s1.d = to; $('d1').value = String(to); draw1(); });
  });
  $('v2').addEventListener('input', draw2);
  $('w3').addEventListener('input', move3);
  Object.entries(LQ).forEach(([k, id]) => $(id).addEventListener('click', () => { s4.liquid = k; s4.tried.add(k); draw4(); }));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = !!choice && choice.value === 'c', fb = $('fbQuiz');
    fb.dataset.state = ok ? 'correct' : 'wrong'; fb.textContent = quizText(ok); fb.style.color = ok ? C.green : C.orange;
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { s3.y = null; refresh(); }); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
