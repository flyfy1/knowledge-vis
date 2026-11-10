'use strict';
// Energy pyramid lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, square and readout comes from window.EP_MODEL (model.js). Canvas text is limited to panel titles,
// level names in their own left column, a scale-bar label and axis ticks, all on fixed rows.
(function () {

const $ = id => document.getElementById(id);
const M = window.EP_MODEL;
const t = (...a) => window.EP_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', red: '#ff6b6b', brown: '#b0814f', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', xs: '#9fb4cc', ghost: '#8696aa' };
const LV = ['#7ee2a8', '#ffb454', '#ff7a93', '#b79cff'];
const num = id => Number($(id).value);
// Trim trailing zeros only after a decimal point (90 stays 90).
const fmt = (v, d = 1) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; const s = v.toFixed(d); return s.indexOf('.') >= 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s; };
const big = v => Math.round(v).toLocaleString(window.EP_I18N.getLang() === 'zh' ? 'zh-CN' : 'en-US');
const smart = v => (v >= 100 ? big(v) : v >= 10 ? fmt(v, 1) : fmt(v, 2));

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
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 8);
  ctx.fillText(text, X, Y); ctx.restore();
}
function label(ctx, text, X, Y, align = 'left', color = C.muted, size = 11) {
  ctx.save(); ctx.font = `${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(text, X, Y); ctx.restore();
}
function textW(ctx, s, size = 11) { ctx.save(); ctx.font = `${size}px system-ui,sans-serif`; const w = ctx.measureText(s).width; ctx.restore(); return w; }
function xAxis(ctx, x0, x1, Y, vMax, ticks, fmtT = v => String(v)) {
  ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke(); ctx.restore();
  ticks.forEach(v => { const X = x0 + v / vMax * (x1 - x0); ctx.save(); ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, Y + 4); ctx.stroke(); ctx.restore(); label(ctx, fmtT(v), X, Y + 14, 'center'); });
}

/* ---------- step 0: one level's ledger ---------- */
function draw0() {
  const e = num('eat0'), a = num('abs0'), g = num('gro0'), b = M.budget(e / 100, a / 100, g / 100);
  $('eat0v').textContent = e + '%'; $('abs0v').textContent = a + '%'; $('gro0v').textContent = g + '%';
  const { ctx, W, H } = fitCanvas($('c0'));
  title(ctx, t('c0'), 8, 20, W - 16);
  const l = 14, r = W - 14, x = v => l + v / 1000 * (r - l), rh = 26, gap = 26, y0 = 50;
  const rows = [
    [[0, 1000, C.green]],
    [[0, b.eaten, C.green], [b.eaten, 1000, C.raw]],
    [[0, b.absorbed, C.green], [b.absorbed, b.eaten, C.brown]],
    [[0, b.growth, C.cyan], [b.growth, b.absorbed, C.red]]
  ];
  const rowNames = ['row0', 'row1', 'row2', 'row3'];
  rows.forEach((segs, i) => {
    const Y = y0 + i * (rh + gap);
    label(ctx, t(rowNames[i]), l, Y - 9, 'left', C.text);
    segs.forEach(([s0, s1, col]) => { if (s1 - s0 <= 0) return; ctx.fillStyle = col; ctx.fillRect(x(s0), Y, Math.max(1.5, x(s1) - x(s0)), rh); ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.strokeRect(x(s0), Y, x(s1) - x(s0), rh); });
    if (i > 0) { // funnel from the part that went on
      const keep = [1000, b.eaten, b.absorbed][i - 1], prevY = Y - gap + 2;
      ctx.save(); ctx.strokeStyle = C.green; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); [x(0), x(keep)].forEach(X => { ctx.beginPath(); ctx.moveTo(X, prevY); ctx.lineTo(X, Y); ctx.stroke(); }); ctx.restore();
    }
  });
  const aY = y0 + 4 * (rh + gap) - gap + 12;
  xAxis(ctx, l, r, aY, 1000, (r - l) >= 420 ? [0, 200, 400, 600, 800, 1000] : [0, 500, 1000]);
  $('r0').textContent = t('s0readout', { E: fmt(b.eaten, 1), A: fmt(b.absorbed, 1), G: fmt(b.growth, 1), pct: fmt(b.transfer * 100, 2), e, a, g, resp: fmt(b.respiration, 1), decomp: fmt(b.notEaten + b.feces, 1) });
}

/* ---------- step 1: level after level ---------- */
const s1 = { log: false };
function draw1() {
  const eff = num('eff1') / 100, L = M.levels(eff);
  $('eff1v').textContent = num('eff1') + '%';
  $('lin1').setAttribute('aria-pressed', s1.log ? 'false' : 'true'); $('log1').setAttribute('aria-pressed', s1.log ? 'true' : 'false');
  const { ctx, W, H } = fitCanvas($('c1'));
  title(ctx, t('c1'), 8, 20, W - 16);
  const names = ['lvl1', 'lvl2', 'lvl3', 'lvl4'].map(k => t(k)), lw = Math.max(...names.map(n => textW(ctx, n))) + 14;
  const l = 8 + lw, r = W - 10, cx = (l + r) / 2, maxW = r - l, rh = (H - 50) / 4 - 10;
  const width = E => s1.log ? Math.max(0, (Math.log10(E) + 1) / (Math.log10(M.PRODUCERS) + 1)) * maxW : Math.max(2, E / M.PRODUCERS * maxW);
  if (s1.log) { // decade guides: one notch per ×10
    ctx.save(); ctx.strokeStyle = C.grid; ctx.setLineDash([2, 4]);
    for (let d = -1; d <= 4; d++) { const w = (d + 1) / 5 * maxW; [cx - w / 2, cx + w / 2].forEach(X => { ctx.beginPath(); ctx.moveTo(X, 34); ctx.lineTo(X, H - 12); ctx.stroke(); }); }
    ctx.restore();
  }
  L.forEach((E, k) => {
    const Y = H - 14 - (k + 1) * (rh + 10) + 10, w = width(E);
    ctx.fillStyle = LV[k]; ctx.fillRect(cx - w / 2, Y, w, rh);
    label(ctx, names[k], 8, Y + rh / 2);
  });
  $('r1').textContent = t('s1readout', { eff: num('eff1'), L1: big(L[0]), L2: smart(L[1]), L3: smart(L[2]), L4: smart(L[3]), top: fmt(L[3] / L[0] * 100, 3) });
}

/* ---------- step 2: room at the top ---------- */
const s2 = { eats: 2 };
const EATS = ['eats1', 'eats2', 'eats3'];
function draw2() {
  const eff = num('eff2') / 100, T = [1, 2, 3].map(k => M.territory(k, eff)), cur = T[s2.eats - 1];
  $('eff2v').textContent = num('eff2') + '%';
  EATS.forEach((id, i) => $(id).setAttribute('aria-pressed', i + 1 === s2.eats ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c2'));
  title(ctx, t('c2'), 8, 20, W - 16);
  const l = 14, b = H - 40, availW = W - 28, availH = b - 38;
  const maxSideM = Math.max(Math.sqrt(T[2].area), 105), k = Math.min(availW / Math.max(maxSideM, 105), availH / Math.max(maxSideM, 68));
  // football pitch for scale
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.strokeRect(l, b - 68 * k, 105 * k, 68 * k); ctx.restore();
  for (let i = 2; i >= 0; i--) {
    const s = Math.sqrt(T[i].area) * k, on = i + 1 === s2.eats;
    ctx.save(); ctx.globalAlpha = on ? 0.55 : 0.12; ctx.fillStyle = on ? C.cyan : C.xs; ctx.fillRect(l, b - s, s, s); ctx.globalAlpha = 1;
    ctx.strokeStyle = on ? C.cyan : C.xs; ctx.lineWidth = on ? 2.2 : 1.2; ctx.strokeRect(l, b - s, s, s); ctx.restore();
  }
  // scale bar: 50 m or 100 m
  const bar = 100 * k > W * 0.45 ? 50 : 100, bx = W - 14 - bar * k, by = H - 18;
  ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + bar * k, by); ctx.lineTo(bx + bar * k, by - 4); ctx.stroke(); ctx.restore();
  label(ctx, bar + ' m', bx - 6, by - 2, 'right', C.text);
  $('r2').textContent = t('s2readout', { diet: t(EATS[s2.eats - 1]), food: smart(cur.food), area: big(cur.area), fields: fmt(cur.area / M.FIELD, 2), perKm2: big(cur.perKm2) });
}

/* ---------- step 3: upside-down pyramids ---------- */
function pyramid(canvas, ttl, vals) {
  const { ctx, W, H } = fitCanvas(canvas);
  title(ctx, ttl, 8, 20, W - 16);
  const names = [t('lvlP'), t('lvlZ')], lw = Math.max(...names.map(n => textW(ctx, n))) + 14;
  const l = 8 + lw, r = W - 10, cx = (l + r) / 2, maxW = r - l, mx = Math.max(...vals), rh = (H - 60) / 2;
  vals.forEach((v, i) => {
    const Y = H - 16 - (i + 1) * (rh + 8) + 8, w = Math.max(2, v / mx * maxW);
    ctx.fillStyle = i ? C.orange : C.green; ctx.fillRect(cx - w / 2, Y, w, rh);
    label(ctx, names[i], 8, Y + rh / 2);
  });
}
function draw3() {
  const n = num('turn3'), s = M.sea(n);
  $('turn3v').textContent = String(n);
  pyramid($('c3'), t('c3a'), [s.B1, s.B2]);
  pyramid($('c3b'), t('c3b'), [s.P1, s.P2]);
  $('r3').textContent = t('s3readout', { turn: n, B1: smart(s.B1), B2: smart(s.B2), bio: t(s.invertedBiomass ? 's3inv' : 's3up'), P1: big(s.P1), P2: big(s.P2) });
  $('h3').textContent = t('s3hint', { flip: fmt(M.flipTurnover(), 1) });
}

/* ---------- step 4: diet ---------- */
function draw4() {
  const m = num('meat4'), c = num('conv4'), d = M.diet(m / 100, c / 100), veg = M.diet(0, c / 100).perHa;
  $('meat4v').textContent = m + '%'; $('conv4v').textContent = c + '%';
  const { ctx, W, H } = fitCanvas($('c4'));
  title(ctx, t('c4'), 8, 20, W - 16);
  // one hectare drawn as a square; people as dots inside it
  const side = Math.min(150, H - 160, W * 0.42), sx = 14, sy = 34;
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.10)'; ctx.fillRect(sx, sy, side, side); ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.strokeRect(sx, sy, side, side); ctx.restore();
  const cols = 4, cell = side / cols, full = Math.floor(d.perHa + 1e-9), frac = d.perHa - full;
  for (let i = 0; i < Math.ceil(d.perHa - 1e-9); i++) {
    const X = sx + cell * (i % cols + 0.5), Y = sy + cell * (Math.floor(i / cols) + 0.5), r = cell * 0.3;
    ctx.save(); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.stroke();
    ctx.fillStyle = C.text; ctx.beginPath();
    if (i < full) ctx.arc(X, Y, r, 0, 7); else { ctx.moveTo(X, Y); ctx.arc(X, Y, r, -Math.PI / 2, -Math.PI / 2 + frac * 2 * Math.PI); ctx.closePath(); }
    ctx.fill(); ctx.restore();
  }
  // land per person: stacked bar, 0..3.2 ha
  const bT = sy + side + 44, l = 14, r = W - 14, x = v => l + v / 3.2 * (r - l);
  title(ctx, t('c4bar'), 8, bT - 12, W - 16);
  ctx.fillStyle = C.green; ctx.fillRect(x(0), bT, x(d.plantLand) - x(0), 26);
  ctx.fillStyle = C.orange; ctx.fillRect(x(d.plantLand), bT, x(d.land) - x(d.plantLand), 26);
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x(1), bT - 4); ctx.lineTo(x(1), bT + 30); ctx.stroke(); ctx.restore();
  xAxis(ctx, l, r, bT + 34, 3.2, [0, 1, 2, 3]);
  $('r4').textContent = t('s4readout', { m, c, land: fmt(d.land, 3), pl: fmt(d.plantLand, 3), al: fmt(d.animalLand, 3), ppl: fmt(d.perHa, 1), veg: fmt(veg, 1) });
  $('h4').textContent = t('s4hint', { veg: fmt(veg, 1), p30: fmt(M.diet(0.3, 0.1).perHa, 1), p30b: fmt(M.diet(0.3, 0.03).perHa, 1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }

function setup() {
  ['eat0', 'abs0', 'gro0'].forEach(id => $(id).addEventListener('input', draw0));
  $('lin1').addEventListener('click', () => { s1.log = false; draw1(); });
  $('log1').addEventListener('click', () => { s1.log = true; draw1(); });
  $('eff1').addEventListener('input', draw1);
  EATS.forEach((id, i) => $(id).addEventListener('click', () => { s2.eats = i + 1; draw2(); }));
  $('eff2').addEventListener('input', draw2);
  $('turn3').addEventListener('input', draw3);
  $('presetSea').addEventListener('click', () => { $('turn3').value = 150; draw3(); });
  $('presetGrass').addEventListener('click', () => { $('turn3').value = 1; draw3(); });
  ['meat4', 'conv4'].forEach(id => $(id).addEventListener('input', draw4));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'c';
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
  window.refreshPyramid = () => { refresh(); const fb = $('quizFeedback'); if (fb.dataset.state) fb.textContent = t(fb.dataset.state === 'correct' ? 'correct' : 'wrong'); };
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
