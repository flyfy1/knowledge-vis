'use strict';
// Equation-balancing lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, verdict and hint comes from window.EB_MODEL (model.js). Canvas text is limited to the
// element symbol and the two counts under each scale, in one fixed row that shrinks to fit.
(function () {

const $ = id => document.getElementById(id);
const M = window.EB_MODEL;
const t = (...a) => window.EB_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621' };
const EL = { H: '#e8edf4', O: '#ff5c5c', C: '#7d8a9c', N: '#5b8cff', Fe: '#d08a4a', Mg: '#f0b8ff', K: '#b79cff', Cl: '#7ee2a8', Ca: '#ffd75e', Al: '#9fd8e8' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cf = v => (Number.isInteger(v) ? String(v) : v.toFixed(1));

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
function label(ctx, text, X, Y, maxW, { size = 12, color = C.text, align = 'center', weight = 400 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.textAlign = align;
  let s = size;
  do { ctx.font = `${weight} ${s}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; s -= 0.5; } while (s > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}

/* ---------- molecule clusters ---------- */
// Atom positions in units of the atom radius r, centred on (0, 0).
const clusterCache = {};
function cluster(formula) {
  if (clusterCache[formula]) return clusterCache[formula];
  const cnt = M.parse(formula), els = Object.keys(cnt), atoms = [];
  const total = els.reduce((s, e) => s + cnt[e], 0);
  if (els.length === 1) {
    for (let i = 0; i < total; i++) atoms.push({ el: els[0], x: (i - (total - 1) / 2) * 1.8, y: 0 });
  } else {
    const nonH = els.filter(e => e !== 'H');
    const centre = nonH.slice().sort((a, b) => cnt[a] - cnt[b] || els.indexOf(a) - els.indexOf(b))[0];
    const nc = cnt[centre];
    for (let i = 0; i < nc; i++) atoms.push({ el: centre, x: (i - (nc - 1) / 2) * 2.1, y: 0 });
    const ring = []; els.forEach(e => { if (e !== centre) for (let i = 0; i < cnt[e]; i++) ring.push(e); });
    const a = (nc - 1) * 1.05 + 2.15, b = n0 => (n0 > 4 ? 2.3 : 1.95), n = ring.length;
    ring.forEach((e, i) => {
      if (n <= 2) { atoms.push({ el: e, x: i === 0 && n === 2 ? -a : a, y: 0 }); return; }
      const th = -Math.PI / 2 + 2 * Math.PI * i / n; atoms.push({ el: e, x: a * Math.cos(th), y: b(n) * Math.sin(th) });
    });
  }
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  atoms.forEach(p => { x0 = Math.min(x0, p.x - 1); x1 = Math.max(x1, p.x + 1); y0 = Math.min(y0, p.y - 1); y1 = Math.max(y1, p.y + 1); });
  return (clusterCache[formula] = { atoms, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
}
function drawCluster(ctx, formula, X, Y, r, { half = false } = {}) {
  const cl = cluster(formula);
  ctx.save();
  if (half) {
    ctx.globalAlpha = 0.35;
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2;
    ctx.strokeRect(X - cl.w * r / 2 - 3, Y - cl.h * r / 2 - 3, cl.w * r + 6, cl.h * r + 6); ctx.setLineDash([]);
  }
  cl.atoms.forEach(p => { ctx.fillStyle = EL[p.el] || C.muted; ctx.beginPath(); ctx.arc(X + (p.x - cl.cx) * r, Y + (p.y - cl.cy) * r, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.stroke(); });
  ctx.restore();
}
// Lay out one side's molecules (species groups separated by a gap) inside a box; shrink r until it fits.
function layoutSide(list, coefs, box) {
  for (let r = 13; r >= 2.4; r -= 0.4) {
    const items = []; let x = 0, y = 0, rowH = 0, ok = true;
    list.forEach((f, si) => {
      const n = Math.ceil(coefs[si] - 1e-9), cl = cluster(f), w = cl.w * r + 6, h = cl.h * r + 8;
      for (let k = 0; k < n; k++) {
        if (x + w > box.w + 0.1 && x > 0) { x = 0; y += rowH; rowH = 0; }
        items.push({ f, x: x + w / 2, y: y + h / 2, half: k === n - 1 && !Number.isInteger(coefs[si]), rowY: y });
        x += w; rowH = Math.max(rowH, h);
      }
      x += 3.2 * r; // gap between substances
    });
    const height = y + rowH;
    if (height > box.h) ok = false;
    if (ok || r < 2.6) return { r, items, height };
  }
}

/* ---------- a whole reaction: molecules on top, one scale per element below ---------- */
function drawReaction(canvas, rx, coefs) {
  const { ctx, W, H } = fitCanvas(canvas);
  const R = M.REACTIONS[rx], nL = R.L.length;
  const molH = H - 150, gap = 30, sw = (W - gap - 16) / 2;
  [[R.L, coefs.slice(0, nL), 8], [R.R, coefs.slice(nL), 8 + sw + gap]].forEach(([list, cs, x0]) => {
    const L = layoutSide(list, cs, { w: sw, h: molH - 16 });
    const oy = 8 + (molH - 16 - L.height) / 2;
    // centre each row horizontally
    const rows = {}; L.items.forEach(it => { (rows[it.rowY] = rows[it.rowY] || []).push(it); });
    Object.values(rows).forEach(row => {
      const last = row[row.length - 1], cl = cluster(last.f), right = last.x + (cl.w * L.r + 6) / 2, shift = (sw - right) / 2;
      row.forEach(it => drawCluster(ctx, it.f, x0 + shift + it.x, oy + it.y, L.r, { half: it.half }));
    });
  });
  // arrow between the sides
  const ax = 8 + sw + gap / 2, ay = molH / 2;
  ctx.save(); ctx.strokeStyle = C.muted; ctx.fillStyle = C.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax - 10, ay); ctx.lineTo(ax + 6, ay); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ax + 11, ay); ctx.lineTo(ax + 4, ay - 5); ctx.lineTo(ax + 4, ay + 5); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(8, molH); ctx.lineTo(W - 8, molH); ctx.stroke();
  // scales
  const tl = M.tally(rx, coefs), k = tl.length, slot = (W - 16) / k;
  tl.forEach((q, i) => {
    const cx = 8 + slot * (i + 0.5), py = molH + 46, hl = Math.min(slot * 0.3, 72), col = q.ok ? C.green : C.orange;
    const diff = q.R - q.L, ang = Math.max(-0.32, Math.min(0.32, 0.32 * diff / Math.max(q.L, q.R, 1) * 2.2));
    const dx = Math.cos(ang) * hl, dy = Math.sin(ang) * hl;
    // pillar and base
    ctx.strokeStyle = C.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx, H - 34); ctx.moveTo(cx - 16, H - 34); ctx.lineTo(cx + 16, H - 34); ctx.stroke();
    // beam
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - dx, py - dy); ctx.lineTo(cx + dx, py + dy); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, py, 3.5, 0, 7); ctx.fill();
    // pans with atoms
    [[cx - dx, py - dy, q.L], [cx + dx, py + dy, q.R]].forEach(([X, Y, n]) => {
      const panY = Y + 34, pw = Math.min(hl * 0.9, 40);
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - pw / 2, panY); ctx.moveTo(X, Y); ctx.lineTo(X + pw / 2, panY); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - pw / 2, panY); ctx.lineTo(X + pw / 2, panY); ctx.stroke();
      const per = Math.max(1, Math.floor(pw / 7)), shown = Math.min(Math.round(n * 2) / 2, 12, per * 3), rr = 2.8;
      for (let a = 0; a < Math.ceil(shown); a++) {
        const row = Math.floor(a / per), colI = a % per, inRow = Math.min(per, Math.ceil(shown) - row * per);
        ctx.globalAlpha = a + 1 > shown ? 0.35 : 1;
        ctx.fillStyle = EL[q.el] || C.muted; ctx.beginPath(); ctx.arc(X + (colI - (inRow - 1) / 2) * 6.4, panY - 4 - row * 6.2, rr, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
    // one text row: left count · symbol · right count
    const y = H - 12, lim = slot / 3 - 4;
    label(ctx, cf(q.L), cx - hl * 0.8, y, lim, { color: col, weight: 600 });
    label(ctx, q.el, cx, y, lim, { color: C.text, weight: 700, size: 13 });
    label(ctx, cf(q.R), cx + hl * 0.8, y, lim, { color: col, weight: 600 });
  });
}

function legend(el, rx, extraHalf) {
  el.innerHTML = M.elements(rx).map(e => `<span class="lg"><span class="sw" style="background:${EL[e]};border-radius:50%;width:10px;height:10px"></span><span>${e}</span></span>`).join('') + (extraHalf ? `<span class="lg"><span class="sw sw-half"></span><span>${t('lgHalf')}</span></span>` : '');
}

/* ---------- equation with − / + steppers ---------- */
function buildEq(box, rx, st, opts, onChange) {
  box.innerHTML = '';
  const R = M.REACTIONS[rx], sp = M.species(rx);
  sp.forEach((f, i) => {
    if (i === R.L.length) box.insertAdjacentHTML('beforeend', '<span class="op">→</span>');
    else if (i > 0) box.insertAdjacentHTML('beforeend', '<span class="op">+</span>');
    const term = document.createElement('span'); term.className = 'term';
    term.innerHTML = `<button type="button" class="step-btn" data-step="${opts.step}" data-dir="-1">−</button><span class="coef"></span><button type="button" class="step-btn" data-step="${opts.step}" data-dir="1">+</button><span class="formula-txt">${M.pretty(f)}</span>`;
    term.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const v = Math.round((st.coefs[i] + Number(b.dataset.dir) * opts.inc) * 2) / 2;
      if (v < opts.min || v > opts.max) return;
      st.coefs[i] = v; onChange(i, v);
    }));
    box.appendChild(term);
  });
}
function syncEq(box, rx, st, opts) {
  const sp = M.species(rx);
  box.querySelectorAll('.term').forEach((term, i) => {
    term.querySelector('.coef').textContent = cf(st.coefs[i]);
    const [mi, pl] = term.querySelectorAll('button');
    mi.disabled = st.coefs[i] - opts.inc < opts.min - 1e-9; pl.disabled = st.coefs[i] + opts.inc > opts.max + 1e-9;
    mi.setAttribute('aria-label', t('minus', { f: M.pretty(sp[i]) })); pl.setAttribute('aria-label', t('plusA', { f: M.pretty(sp[i]) }));
  });
}
// Equation text in normal chemical notation (coefficient 1 omitted).
function eqText(rx, coefs) {
  const R = M.REACTIONS[rx], sp = M.species(rx), term = i => (coefs[i] === 1 ? '' : cf(coefs[i])) + M.pretty(sp[i]);
  return sp.map((_, i) => i).slice(0, R.L.length).map(term).join(' + ') + ' → ' + sp.map((_, i) => i).slice(R.L.length).map(term).join(' + ');
}
function status(rx, coefs) {
  const tl = M.tally(rx, coefs), bad = tl.filter(q => !q.ok);
  if (bad.length) return t('stBad', { n: bad.length, list: bad.map(q => t('cntItem', { el: q.el, L: cf(q.L), R: cf(q.R) })).join(SEP()) });
  if (M.hasHalf(coefs)) return t('stOkHalf');
  const g = M.gcdAll(coefs); return g > 1 ? t('stOkNotMin', { g }) : t('stOk');
}
function countsText(rx, coefs) { return M.tally(rx, coefs).map(q => t('cntItem', { el: q.el, L: cf(q.L), R: cf(q.R) })).join(SEP()); }
const INT = { inc: 1, min: 1, max: 12 };
function SEP() { return window.EB_I18N.getLang() === 'zh' ? '；' : '; '; }

/* ---------- step 0 ---------- */
const s0 = { coefs: [1, 1, 1] };
function draw0() {
  syncEq($('eq0'), 'water', s0, { ...INT, step: 0 });
  drawReaction($('c0'), 'water', s0.coefs); legend($('lg0'), 'water');
  $('r0').textContent = `${eqText('water', s0.coefs)}　｜　${countsText('water', s0.coefs)}　→ ${status('water', s0.coefs)}`;
}

/* ---------- step 1 ---------- */
const s1 = { mode: 'coef' };
function draw1() {
  $('fixCoef').setAttribute('aria-pressed', String(s1.mode === 'coef')); $('fixSub').setAttribute('aria-pressed', String(s1.mode === 'sub'));
  const rx = s1.mode === 'coef' ? 'water' : 'peroxide', coefs = s1.mode === 'coef' ? [1, 1, 2] : [1, 1, 1];
  drawReaction($('c1'), rx, coefs); legend($('lg1'), rx);
  $('eq1').textContent = eqText(rx, coefs);
  $('r1').textContent = t(s1.mode === 'coef' ? 'r1coef' : 'r1sub');
}

/* ---------- step 2 ---------- */
const s2 = { coefs: [1, 1, 1, 1], log: [], hint: '' };
function draw2() {
  syncEq($('eq2'), 'methane', s2, { ...INT, step: 2 });
  drawReaction($('c2'), 'methane', s2.coefs); legend($('lg2'), 'methane');
  $('r2').textContent = `${eqText('methane', s2.coefs)}　｜　${countsText('methane', s2.coefs)}　→ ${status('methane', s2.coefs)}${s2.hint ? '　' + s2.hint : ''}`;
  $('log2').textContent = s2.log.length ? t('log', { n: s2.log.length, list: s2.log.join(' · ') }) : t('logEmpty');
}
function hintText(rx, coefs) {
  const h = M.hint(rx, coefs), sp = M.species(rx);
  if (!h) return t('hintDone');
  if (h.idx >= 0) return t('hintFix', { el: h.el, L: cf(h.L), R: cf(h.R), f: M.pretty(sp[h.idx]), to: h.to });
  const per = [...new Set(sp.filter(f => M.parse(f)[h.el]).map(f => M.parse(f)[h.el]))].join(window.EB_I18N.getLang() === 'zh' ? '、' : ', ');
  return t('hintLcm', { el: h.el, L: cf(h.L), R: cf(h.R), per, lcm: h.lcm });
}

/* ---------- step 3 ---------- */
const s3 = { coefs: [1, 1, 1, 1] };
const HALF = { inc: 0.5, min: 0.5, max: 12 };
function draw3() {
  syncEq($('eq3'), 'ethane', s3, { ...HALF, step: 3 });
  $('double3').disabled = s3.coefs.some(v => v * 2 > 12);
  drawReaction($('c3'), 'ethane', s3.coefs); legend($('lg3'), 'ethane', M.hasHalf(s3.coefs));
  $('r3').textContent = `${eqText('ethane', s3.coefs)}　｜　${countsText('ethane', s3.coefs)}　→ ${status('ethane', s3.coefs)}`;
}

/* ---------- step 4 ---------- */
const s4 = { coefs: [1, 1, 1, 1], stage: 0 };
function draw4() {
  syncEq($('eq4'), 'propane', s4, { ...INT, step: 4 });
  $('times4').disabled = s4.coefs.some(v => v * 2 > 12);
  const g = M.gcdAll(s4.coefs); $('reduce4').disabled = g <= 1;
  drawReaction($('c4'), 'propane', s4.coefs); legend($('lg4'), 'propane');
  const [a, b, c, d] = s4.coefs, tl = M.tally('propane', s4.coefs);
  $('eqns4').innerHTML = M.equations('propane').map((e, i) => `<li class="${tl[i].ok ? 'ok' : 'bad'}">${t('eqLine', { el: e.el, text: e.text, lhs: cf(tl[i].L), rhs: cf(tl[i].R), mark: tl[i].ok ? '✓' : '✗' })}</li>`).join('');
  const stageTxt = s4.stage > 0 ? ' ' + t('solving', { k: s4.stage, what: t(['solveA', 'solveC', 'solveD', 'solveB'][s4.stage - 1]) }) : '';
  $('r4').textContent = t('r4', { a, b, c, d, g, status: status('propane', s4.coefs) }) + stageTxt;
}

/* ---------- step 5 ---------- */
const s5 = { rx: 'ammonia', coefs: [1, 1, 1], done: [], hint: '' };
function buildPick5() {
  const row = $('pick5');
  M.PRACTICE.forEach(rx => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn toggle'; b.id = 'rx_' + rx; b.dataset.step = '5';
    b.addEventListener('click', () => { if (s5.rx === rx) return; s5.rx = rx; s5.coefs = M.species(rx).map(() => 1); s5.hint = ''; buildEq($('eq5'), rx, s5, { ...INT, step: 5 }, change5); draw5(); });
    row.appendChild(b);
  });
}
function change5() { s5.hint = ''; if (M.balanced(s5.rx, s5.coefs) && M.simplest(s5.coefs) && !s5.done.includes(s5.rx)) s5.done.push(s5.rx); draw5(); }
function draw5() {
  M.PRACTICE.forEach(rx => { const b = $('rx_' + rx); b.textContent = (s5.done.includes(rx) ? '✓ ' : '') + t('rx_' + rx); b.setAttribute('aria-pressed', String(s5.rx === rx)); });
  syncEq($('eq5'), s5.rx, s5, { ...INT, step: 5 });
  drawReaction($('c5'), s5.rx, s5.coefs); legend($('lg5'), s5.rx);
  $('r5').textContent = `${eqText(s5.rx, s5.coefs)}　｜　${countsText(s5.rx, s5.coefs)}　→ ${status(s5.rx, s5.coefs)}${s5.hint ? '　' + s5.hint : ''}`;
  $('done5').textContent = s5.done.length ? t('done', { k: s5.done.length, list: s5.done.map(r => t('rx_' + r)).join(' · ') }) : t('doneNone');
}

/* ---------- animation (step 4 solve) ---------- */
let solveTimer = null;
function stopSolve() { if (solveTimer) { clearTimeout(solveTimer); solveTimer = null; } }
function solve4() {
  stopSolve();
  const seq = [[0, 1], [2, 3], [3, 4], [1, 5]]; // a, c, d, b
  let k = 0;
  const next = () => {
    const [i, v] = seq[k]; s4.coefs[i] = v; k++; s4.stage = k; draw4();
    if (k < seq.length) solveTimer = setTimeout(next, 900); else solveTimer = null;
  };
  if (reduceMotion()) { seq.forEach(([i, v]) => { s4.coefs[i] = v; }); s4.stage = 4; draw4(); return; }
  s4.coefs = [1, 1, 1, 1]; next();
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  buildEq($('eq0'), 'water', s0, { ...INT, step: 0 }, draw0);
  $('reset0').addEventListener('click', () => { s0.coefs = [1, 1, 1]; draw0(); });

  $('fixCoef').addEventListener('click', () => { s1.mode = 'coef'; draw1(); });
  $('fixSub').addEventListener('click', () => { s1.mode = 'sub'; draw1(); });
  $('check1').addEventListener('click', () => {
    const c = document.querySelector('input[name="q1"]:checked'), good = !!c && c.value === 'b';
    $('fb1').textContent = t(good ? 'fb1ok' : 'fb1no'); $('fb1').style.color = good ? C.green : C.orange; $('fb1').dataset.state = good ? 'correct' : 'wrong';
  });

  buildEq($('eq2'), 'methane', s2, { ...INT, step: 2 }, (i, v) => { s2.log.push(`${M.pretty(M.species('methane')[i])} → ${v}`); s2.hint = ''; draw2(); });
  $('hint2').addEventListener('click', () => { s2.hint = hintText('methane', s2.coefs); draw2(); });
  $('reset2').addEventListener('click', () => { s2.coefs = [1, 1, 1, 1]; s2.log = []; s2.hint = ''; draw2(); });

  buildEq($('eq3'), 'ethane', s3, { ...HALF, step: 3 }, draw3);
  $('double3').addEventListener('click', () => { if (s3.coefs.every(v => v * 2 <= 12)) { s3.coefs = s3.coefs.map(v => v * 2); draw3(); } });
  $('reset3').addEventListener('click', () => { s3.coefs = [1, 1, 1, 1]; draw3(); });

  buildEq($('eq4'), 'propane', s4, { ...INT, step: 4 }, () => { stopSolve(); s4.stage = 0; draw4(); });
  $('solve4').addEventListener('click', solve4);
  $('times4').addEventListener('click', () => { stopSolve(); if (s4.coefs.every(v => v * 2 <= 12)) { s4.coefs = s4.coefs.map(v => v * 2); s4.stage = 0; draw4(); } });
  $('reduce4').addEventListener('click', () => { stopSolve(); const g = M.gcdAll(s4.coefs); s4.coefs = s4.coefs.map(v => v / g); s4.stage = 0; draw4(); });
  $('reset4').addEventListener('click', () => { stopSolve(); s4.coefs = [1, 1, 1, 1]; s4.stage = 0; draw4(); });

  buildPick5(); buildEq($('eq5'), s5.rx, s5, { ...INT, step: 5 }, change5);
  $('hint5').addEventListener('click', () => { s5.hint = hintText(s5.rx, s5.coefs); draw5(); });
  $('reset5').addEventListener('click', () => { s5.coefs = M.species(s5.rx).map(() => 1); s5.hint = ''; draw5(); });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
    steps.forEach(s => io.observe(s));
  }
  let rz = null;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(refresh); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && solveTimer) { stopSolve(); [[0, 1], [2, 3], [3, 4], [1, 5]].forEach(([i, v]) => { s4.coefs[i] = v; }); s4.stage = 4; draw4(); }
  });
  window.refreshBalance = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
