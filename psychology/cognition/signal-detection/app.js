'use strict';
// Signal detection lesson. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// All rates, areas and measures come from SDT (sim-core.js); trials use a fixed-seed generator.
(function () {

const $ = id => document.getElementById(id);
const S = window.SDT;
const t = (...a) => window.SDT_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', text: '#e8edf4', bg: '#0d1621' };
const num = id => Number($(id).value);
const f = (v, d = 2) => (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : Number(v)).toFixed(d);
const pct = v => Math.round(v * 100);
const D1 = 1.5; // separation used in steps 1, 2 and 5
const TABLES = { docs: { hit: 80, miss: 20, fa: 20, cr: 80 }, machine: { hit: 98, miss: 2, fa: 38, cr: 62 } };
const rateOf = tb => ({ H: tb.hit / (tb.hit + tb.miss), F: tb.fa / (tb.fa + tb.cr) });
const state = { pred: null, trials: [], seed: 1, ghosts2: [] };

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
  const height = Number(canvas.dataset.h);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, width, height);
  return { ctx, W: width, H: height };
}
function label(ctx, text, X, Y, color = C.text, align = 'left', size = 12) {
  ctx.save(); ctx.font = size + 'px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore();
}

// Two equal-variance normal curves on an evidence axis, criterion at k, shaded H and F areas.
function drawDists(ctx, W, Hh, { d, k, xMin = -3.5, xMax = 5, top = 16, bottom = 30, ghosts = [] }) {
  const P = { l: 16, r: W - 16, t: top, b: Hh - bottom };
  const x = v => P.l + (v - xMin) / (xMax - xMin) * (P.r - P.l), y = v => P.b - v / 0.42 * (P.b - P.t);
  ctx.strokeStyle = '#4a5f78'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
  for (let v = Math.ceil(xMin); v <= xMax; v++) label(ctx, String(v), x(v), P.b + 14, C.muted, 'center', 11);
  label(ctx, 'x', P.r, P.b + 26, C.muted, 'right', 11);
  const area = (mu, color) => {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x(Math.max(k, xMin)), P.b);
    for (let v = Math.max(k, xMin); v <= xMax; v += 0.02) ctx.lineTo(x(v), y(S.pdf(v, mu)));
    ctx.lineTo(x(xMax), P.b); ctx.closePath(); ctx.fill(); ctx.restore();
  };
  area(0, 'rgba(255,122,147,.35)'); area(d, 'rgba(103,215,249,.25)');
  const curve = (mu, color, w) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); for (let v = xMin; v <= xMax; v += 0.02) { const X = x(v), Y = y(S.pdf(v, mu)); v === xMin ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); } ctx.stroke(); ctx.restore(); };
  curve(0, C.muted, 2.2); curve(d, C.cyan, 2.6);
  ghosts.forEach(g => { ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = C.orange; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x(g), P.t); ctx.lineTo(x(g), P.b); ctx.stroke(); ctx.restore(); });
  ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x(k), P.t - 4); ctx.lineTo(x(k), P.b); ctx.stroke(); ctx.restore();
  const mid = x(d / 2);
  ctx.save(); ctx.strokeStyle = C.muted; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(mid, P.b); ctx.lineTo(mid, P.b - 10); ctx.stroke(); ctx.restore();
  label(ctx, t('fa') + ' F', Math.min(x(k) + 6, P.r - 70), y(0.05), C.pink, 'left', 11);
  label(ctx, t('hit') + ' H', Math.min(x(Math.max(k, d)) + 8, P.r - 50), y(0.3), C.cyan, 'left', 11);
  return { x, y, P };
}

/* ---------- step 0: two tables ---------- */
function draw0() {
  const { ctx, W, H } = fitCanvas($('c0'));
  const narrow = W < 520;
  const groups = [['docs', TABLES.docs], ['machine', TABLES.machine]];
  const colW = narrow ? (W - 24) : (W - 36) / 2;
  groups.forEach(([name, tb], gi) => {
    const ox = narrow ? 12 : 12 + gi * (colW + 12), oy = narrow ? gi * (H / 2) : 0, h = narrow ? H / 2 : H;
    label(ctx, t(name) + ' · ' + (tb.hit + tb.cr) / 2 + '%', ox, oy + 20, C.text, 'left', 14);
    const bars = [[t('present'), [[tb.hit, C.green, t('hit')], [tb.miss, C.pink, t('miss')]]], [t('absent'), [[tb.fa, C.orange, t('fa')], [tb.cr, '#4a5f78', t('cr')]]]];
    const bh = Math.min(30, (h - 70) / 2 - 18);
    bars.forEach(([title, parts], bi) => {
      const by = oy + 40 + bi * (bh + 34);
      label(ctx, title, ox, by, C.muted, 'left', 11);
      let cx = ox;
      parts.forEach(([n, color, nm]) => {
        const w = n / 100 * colW;
        ctx.fillStyle = color; ctx.fillRect(cx, by + 6, Math.max(w, 1), bh);
        if (w > 34) label(ctx, n + ' ' + (w > 110 ? nm : ''), cx + 6, by + 6 + bh / 2 + 4, '#061118', 'left', 12);
        else label(ctx, String(n), cx + w + 3, by + 6 + bh / 2 + 4, color, 'left', 12);
        cx += w;
      });
    });
  });
}

/* ---------- step 1: trials accumulate ---------- */
function draw1() {
  const k = S.kFromC(D1, 0);
  const { ctx, W, H } = fitCanvas($('c1'));
  const m = drawDists(ctx, W, H, { d: D1, k, top: 120 });
  // dot strip: top row signal trials, lower row noise trials
  const rowY = sig => sig ? 34 : 82;
  label(ctx, '+', 4, rowY(true) + 4, C.cyan, 'left', 13); label(ctx, '−', 4, rowY(false) + 4, C.muted, 'left', 13);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.x(k), 14); ctx.lineTo(m.x(k), 104); ctx.stroke(); ctx.restore();
  const n = state.trials.length;
  state.trials.forEach((s, i) => {
    const X = m.x(Math.max(-3.4, Math.min(4.9, s.x))), jitter = ((i * 37) % 23 - 11) * 0.9, Y = rowY(s.signal) + jitter;
    const fresh = i >= n - 20;
    ctx.beginPath(); ctx.arc(X, Y, fresh ? 4.2 : 3, 0, 7);
    const col = s.signal ? C.cyan : (s.yes ? C.pink : C.muted);
    if (s.yes) { ctx.fillStyle = col; ctx.globalAlpha = fresh ? 1 : 0.6; ctx.fill(); }
    else { ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.globalAlpha = fresh ? 1 : 0.6; ctx.stroke(); }
    ctx.globalAlpha = 1;
  });
  const tl = S.tally(state.trials), model = S.rates(D1, k);
  const half = n / 2;
  $('r1').textContent = n ? t('s1readout', { n, hit: tl.hit, miss: tl.miss, fa: tl.fa, cr: tl.cr, H: f(tl.hit / half), Hm: f(model.H), F: f(tl.fa / half), Fm: f(model.F) }) : t('s1empty');
}
function run1() {
  const k = S.kFromC(D1, 0);
  state.trials = state.trials.concat(S.trials(D1, k, 20, state.seed++));
  if (state.trials.length > 400) state.trials = state.trials.slice(-400);
  draw1();
}

/* ---------- step 2: criterion ---------- */
function draw2() {
  const c = num('c2s'), k = S.kFromC(D1, c);
  $('c2v').textContent = f(c);
  const { ctx, W, H } = fitCanvas($('c2'));
  drawDists(ctx, W, H, { d: D1, k, ghosts: state.ghosts2.filter(g => Math.abs(g - k) > 1e-9) });
  const r = S.rates(D1, k), back = S.measures(r.H, r.F);
  $('r2').textContent = t('s2readout', { c: f(c), H: f(r.H), F: f(r.F), miss: pct(1 - r.H), fa: pct(r.F), cBack: f(back.c) });
}
function keep2() { const k = S.kFromC(D1, num('c2s')); if (!state.ghosts2.some(g => Math.abs(g - k) < 1e-9)) { state.ghosts2.push(k); if (state.ghosts2.length > 5) state.ghosts2.shift(); } }

/* ---------- step 3: sensitivity ---------- */
function draw3() {
  const d = num('d3s'), c = num('c3s'), k = S.kFromC(d, c);
  $('d3v').textContent = f(d); $('c3v').textContent = f(c);
  const { ctx, W, H } = fitCanvas($('c3'));
  const m = drawDists(ctx, W, H, { d, k, xMax: 7, top: 34 });
  // d' bracket between the means
  const yb = 22;
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x(0), yb); ctx.lineTo(m.x(d), yb); ctx.moveTo(m.x(0), yb - 5); ctx.lineTo(m.x(0), yb + 5); ctx.moveTo(m.x(d), yb - 5); ctx.lineTo(m.x(d), yb + 5); ctx.stroke(); ctx.restore();
  label(ctx, "d' = " + f(d), m.x(d) + 8, yb + 4, C.green);
  const r = S.rates(d, k), back = S.measures(r.H, r.F);
  $('r3').textContent = t('s3readout', { d: f(d), c: f(c), H: f(r.H), F: f(r.F), dBack: f(back.dprime), pc: Math.round(back.pc * 1000) / 10 });
}

/* ---------- step 4: ROC ---------- */
function rocPoints(d) { const pts = []; for (let k = -5; k <= d + 5; k += 0.05) pts.push(S.rates(d, k)); return pts; }
function draw4() {
  const d = num('d4s'), c = num('c4s'), k = S.kFromC(d, c);
  $('d4v').textContent = f(d); $('c4v').textContent = f(c);
  const cv = $('c4'), want = Math.round(Math.min(420, (cv.clientWidth || 420) - 10));
  cv.dataset.h = want; cv.style.height = want + 'px';
  const { ctx, W, H } = fitCanvas(cv);
  const side = Math.min(W - 60, H - 50), P = { l: (W - side) / 2 + 14, t: 12 };
  const x = v => P.l + v * side, y = v => P.t + (1 - v) * side;
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = 0; v <= 1.001; v += 0.25) { ctx.beginPath(); ctx.moveTo(x(v), y(0)); ctx.lineTo(x(v), y(1)); ctx.moveTo(x(0), y(v)); ctx.lineTo(x(1), y(v)); ctx.stroke(); label(ctx, v.toFixed(2), x(v), y(0) + 14, C.muted, 'center', 10); label(ctx, v.toFixed(2), x(0) - 4, y(v) + 4, C.muted, 'right', 10); }
  label(ctx, t('rocF'), x(1), y(0) + 28, C.muted, 'right', 11);
  ctx.save(); ctx.translate(x(0) - 34, y(0.5)); ctx.rotate(-Math.PI / 2); label(ctx, t('rocH'), 0, 0, C.muted, 'center', 11); ctx.restore();
  const line = (pts, color, w, alpha = 1) => { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(x(p.F), y(p.H)) : ctx.moveTo(x(p.F), y(p.H))); ctx.stroke(); ctx.restore(); };
  [0, 0.5, 1, 1.5, 2, 2.5, 3].forEach(dd => { line(rocPoints(dd), C.muted, 1, 0.45); if (dd % 1) return; const p = S.rates(dd, dd / 2 + 0.5); label(ctx, "d'=" + dd, x(p.F) + 5, y(p.H) + 12, C.muted, 'left', 10); });
  line(rocPoints(d), C.cyan, 2.6);
  const dot = (F, Hr, color, r, text) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x(F), y(Hr), r, 0, 7); ctx.fill(); if (text) label(ctx, text, x(F) + 8, y(Hr) + 4, color, 'left', 12); };
  const doc = rateOf(TABLES.docs), mac = rateOf(TABLES.machine);
  dot(doc.F, doc.H, C.orange, 6); label(ctx, t('docs'), x(doc.F) + 8, y(doc.H) + 18, C.orange, 'left', 12); dot(mac.F, mac.H, C.green, 6, t('machine'));
  const r = S.rates(d, k); dot(r.F, r.H, C.text, 5.5);
  const md = S.measures(doc.H, doc.F), mm = S.measures(mac.H, mac.F);
  $('r4').textContent = t('s4readout', { F: f(r.F), H: f(r.H), d: f(d), c: f(c), dDoc: f(md.dprime), cDoc: f(md.c), dMac: f(mm.dprime), cMac: f(mm.c) });
  const predName = state.pred ? t('pred' + state.pred.toUpperCase()) : '';
  const you = !state.pred ? '' : state.pred === 'b' ? t('youRight') : t('youWrong', { p: predName });
  $('reveal4').innerHTML = t('reveal', { you });
}

/* ---------- step 5: expected cost ---------- */
function draw5() {
  const p = num('p5s'), ratio = Math.pow(10, num('m5s')), c = num('c5s');
  $('p5v').textContent = f(p); $('m5v').textContent = f(ratio, ratio < 1 ? 2 : 1); $('c5v').textContent = f(c);
  const cost = cc => S.expectedCost(D1, S.kFromC(D1, cc), p, ratio, 1);
  const best = S.bestK(D1, p, ratio, 1), bestC = S.cFromK(D1, best.k);
  const { ctx, W, H } = fitCanvas($('c5'));
  const P = { l: 46, r: W - 14, t: 16, b: H - 34 };
  const cMin = -2.5, cMax = 2.5;
  let yMax = 0; for (let cc = cMin; cc <= cMax; cc += 0.05) yMax = Math.max(yMax, cost(cc));
  yMax = Math.max(0.1, yMax * 1.08);
  const x = v => P.l + (v - cMin) / (cMax - cMin) * (P.r - P.l), y = v => P.b - v / yMax * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let v = cMin; v <= cMax + 1e-9; v += 0.5) { ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke(); label(ctx, v.toFixed(1), x(v), P.b + 14, C.muted, 'center', 10); }
  for (let i = 0; i <= 4; i++) { const v = yMax * i / 4; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke(); label(ctx, v.toFixed(2), P.l - 5, y(v) + 4, C.muted, 'right', 10); }
  label(ctx, t('cAxis'), P.r, P.b + 28, C.muted, 'right', 11); label(ctx, t('costAxis'), P.l + 4, P.t + 10, C.muted, 'left', 11);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4; ctx.beginPath();
  for (let cc = cMin; cc <= cMax + 1e-9; cc += 0.02) { const X = x(cc), Y = y(cost(cc)); cc === cMin ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); }
  ctx.stroke();
  // An optimum outside the plotted range is pinned to the edge (with an arrow) rather than drawn off-canvas.
  const inRange = bestC >= cMin && bestC <= cMax, shownC = Math.max(cMin, Math.min(cMax, bestC));
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x(shownC), y(inRange ? best.cost : cost(shownC)), 6.5, 0, 7); ctx.fill();
  label(ctx, (bestC < cMin ? '← ' : '') + 'c* = ' + f(bestC) + (bestC > cMax ? ' →' : ''), Math.max(P.l + 40, Math.min(P.r - 40, x(shownC))), y(inRange ? best.cost : cost(shownC)) + (inRange ? 22 : -14), C.green, 'center');
  const yc = cost(c);
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x(c), P.t); ctx.lineTo(x(c), P.b); ctx.stroke(); ctx.restore();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(x(c), y(yc), 5.5, 0, 7); ctx.fill();
  $('r5').textContent = t('s5readout', { best: f(bestC) + (inRange ? '' : t('offChart')), bestCost: f(best.cost, 3), c: f(c), cost: f(yc, 3), verdict: yc - best.cost < 0.005 ? t('near') : t('far') });
}

function refresh() {
  draw0(); draw1(); draw2(); draw3(); draw4(); draw5();
  if (state.pred) $('predFeedback').textContent = t('predSaved', { p: t('pred' + state.pred.toUpperCase()) });
}
window.refreshSDT = refresh;

function setup() {
  document.querySelectorAll('input[name="pred"]').forEach(r => r.addEventListener('change', () => {
    state.pred = r.value; $('predFeedback').textContent = t('predSaved', { p: t('pred' + r.value.toUpperCase()) }); draw4();
  }));
  $('run1').addEventListener('click', run1);
  $('reset1').addEventListener('click', () => { state.trials = []; state.seed = 1; draw1(); });
  $('c2s').addEventListener('input', draw2); $('c2s').addEventListener('change', () => { keep2(); draw2(); });
  ['d3s', 'c3s'].forEach(id => $(id).addEventListener('input', draw3));
  ['d4s', 'c4s'].forEach(id => $(id).addEventListener('input', draw4));
  ['p5s', 'm5s', 'c5s'].forEach(id => $(id).addEventListener('input', draw5));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked'), ok = choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong'); $('quizFeedback').style.color = ok ? C.green : C.orange;
  });
  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
  steps.forEach(s => io.observe(s));
  window.addEventListener('resize', refresh);
  refresh();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
