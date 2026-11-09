'use strict';
// Equation balance lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pans, tilt, equation echo, readouts and verdicts all come from window.EQ_MODEL (model.js).
// Canvas text is limited to the "x" printed on each bag, the two pan names in the bottom corners,
// and the tick numbers of the step-0 strip; everything else lives in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.EQ_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', beam: '#c9d5e3', bag: '#7a5a3a', bagEdge: '#e0b07a', marble: '#67d7f9' };
const GROUP = ['#67d7f9', '#ffb454', '#b79cff', '#7ee2a8'];
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = p => 1 - Math.pow(1 - p, 3);
// English templates carry "(s)"; settle the plural from the count.
const pl = (s, n) => s.split('(s)').join(n === 1 ? '' : 's');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// heightFor(width) lets a canvas size its CSS height to the content it must hold at that width.
function fitCanvas(canvas, heightFor) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(240, canvas.clientWidth || 600);
  if (heightFor) { const h = Math.round(heightFor(width)); if (Number(canvas.dataset.h) !== h) { canvas.dataset.h = h; canvas.style.height = h + 'px'; } }
  else if (!canvas.dataset.h) { canvas.dataset.h = canvas.getAttribute('height') || 300; canvas.style.height = canvas.dataset.h + 'px'; }
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

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
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

/* ---------- the balance ---------- */
// Geometry depends only on the canvas width and the height of the balance region Hb.
function geom(W, Hb) {
  const Lb = Math.min(W * 0.29, 230), pw = Math.min(W * 0.34, 250);
  const sinMax = Math.sin(M.TILT_MAX * Math.PI / 180);
  const py = Hb - 40 - Lb * sinMax;
  const r = clamp(pw / 19, 4.5, 9), mStep = 2 * r + 1.6, mPer = Math.max(4, Math.floor(pw / mStep));
  const bw = clamp(pw / 4.3, 18, 44), bh = bw * 1.08, bPer = Math.max(2, Math.floor(pw / (bw + 5)));
  return { cx: W / 2, py, Lb, pw, r, mStep, mPer, bw, bh, bPer, post: 16 };
}
// Tallest the balance can get at this width: full tilt plus a full pan (6 bags over 24 marbles).
function balanceHeight(W) {
  const g = geom(W, 0), sinMax = Math.sin(M.TILT_MAX * Math.PI / 180);
  const stack = Math.ceil(M.LIMIT.marbles / g.mPer) * g.mStep + 2 + Math.ceil(M.LIMIT.bags / g.bPer) * (g.bh + 4);
  return 40 + 2 * g.Lb * sinMax + g.post + 6 + stack + 16;
}

// items: { bags: [{ alpha, tint }], marbles: [{ alpha, tint }] } laid out by index only, so a copy that
// fades in or a group that fades out never moves the items that stay.
function plainItems(n, m) {
  return { bags: Array.from({ length: n }, () => ({ alpha: 1, tint: null })), marbles: Array.from({ length: m }, () => ({ alpha: 1, tint: null })) };
}
function drawBag(ctx, x, yb, g, it, solved) {
  const w = g.bw, h = g.bh, body = h * 0.8;
  ctx.save(); ctx.globalAlpha = it.alpha;
  ctx.fillStyle = C.bag; ctx.strokeStyle = it.tint || (solved ? C.green : C.bagEdge); ctx.lineWidth = it.tint || solved ? 2.4 : 1.6;
  ctx.beginPath();
  const top = yb - body, rr = Math.min(8, w * 0.22);
  ctx.moveTo(x - w * 0.36, top);
  ctx.quadraticCurveTo(x - w * 0.52, top + body * 0.15, x - w / 2, yb - rr);
  ctx.quadraticCurveTo(x - w / 2, yb, x - w / 2 + rr, yb);
  ctx.lineTo(x + w / 2 - rr, yb);
  ctx.quadraticCurveTo(x + w / 2, yb, x + w / 2, yb - rr);
  ctx.quadraticCurveTo(x + w * 0.52, top + body * 0.15, x + w * 0.36, top);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // neck and tie
  ctx.beginPath(); ctx.moveTo(x - w * 0.16, top); ctx.lineTo(x - w * 0.24, yb - h); ctx.lineTo(x + w * 0.24, yb - h); ctx.lineTo(x + w * 0.16, top); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - w * 0.2, top - 1); ctx.lineTo(x + w * 0.2, top - 1); ctx.stroke();
  ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 italic ${Math.round(body * 0.5)}px Georgia,serif`;
  ctx.fillText('x', x, yb - body * 0.46);
  ctx.restore();
}
function drawMarble(ctx, x, y, r, it) {
  ctx.save(); ctx.globalAlpha = it.alpha;
  ctx.fillStyle = it.tint || C.marble; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.32, 0, 7); ctx.fill();
  ctx.restore();
}
function drawPanItems(ctx, g, xc, y0, items, solved) {
  const m = items.marbles.length, mRows = Math.ceil(m / g.mPer);
  items.marbles.forEach((it, i) => {
    const row = Math.floor(i / g.mPer), inRow = Math.min(g.mPer, m - row * g.mPer), col = i - row * g.mPer;
    const x = xc + (col - (inRow - 1) / 2) * g.mStep, y = y0 - g.r - row * g.mStep;
    drawMarble(ctx, x, y, g.r, it);
  });
  const n = items.bags.length, base = y0 - mRows * g.mStep - 2;
  items.bags.forEach((it, j) => {
    const row = Math.floor(j / g.bPer), inRow = Math.min(g.bPer, n - row * g.bPer), col = j - row * g.bPer;
    drawBag(ctx, xc + (col - (inRow - 1) / 2) * (g.bw + 5), base - row * (g.bh + 4), g, it, solved);
  });
}
// opts: { angle (deg, + = left lower), left, right (item sets), solved: 'L'|'R'|null }
function drawBalance(ctx, W, Hb, o) {
  const g = geom(W, Hb), th = o.angle * Math.PI / 180;
  const ends = [{ x: g.cx - g.Lb * Math.cos(th), y: g.py + g.Lb * Math.sin(th) }, { x: g.cx + g.Lb * Math.cos(th), y: g.py - g.Lb * Math.sin(th) }];
  ctx.save();
  // stand
  ctx.fillStyle = '#2a3a4f'; ctx.beginPath(); ctx.moveTo(g.cx - 46, Hb - 14); ctx.lineTo(g.cx + 46, Hb - 14); ctx.lineTo(g.cx + 30, Hb - 26); ctx.lineTo(g.cx - 30, Hb - 26); ctx.closePath(); ctx.fill();
  ctx.fillRect(g.cx - 5, g.py, 10, Hb - 26 - g.py);
  // scale arc and centre mark for the needle
  ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g.cx, g.py, 44, -Math.PI / 2 - 0.42, -Math.PI / 2 + 0.42); ctx.stroke();
  ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(g.cx, g.py - 40); ctx.lineTo(g.cx, g.py - 50); ctx.stroke();
  // beam
  ctx.strokeStyle = C.beam; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ends[0].x, ends[0].y); ctx.lineTo(ends[1].x, ends[1].y); ctx.stroke();
  // needle
  const level = Math.abs(o.angle) < 0.05;
  ctx.strokeStyle = level ? C.green : C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(g.cx, g.py); ctx.lineTo(g.cx - 40 * Math.sin(th), g.py - 40 * Math.cos(th)); ctx.stroke();
  ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(g.cx, g.py, 6, 0, 7); ctx.fill();
  // pans (they stay horizontal, like a kitchen balance) and their loads
  [o.left, o.right].forEach((items, s) => {
    const e = ends[s], top = e.y - g.post;
    ctx.strokeStyle = C.beam; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x, top); ctx.stroke();
    ctx.fillStyle = '#3a4c63'; ctx.strokeStyle = '#7f93ab'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(e.x - g.pw / 2, top - 4); ctx.lineTo(e.x + g.pw / 2, top - 4); ctx.quadraticCurveTo(e.x + g.pw / 2 - 6, top + 5, e.x + g.pw / 2 - 16, top + 5); ctx.lineTo(e.x - g.pw / 2 + 16, top + 5); ctx.quadraticCurveTo(e.x - g.pw / 2 + 6, top + 5, e.x - g.pw / 2, top - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    drawPanItems(ctx, g, e.x, top - 5, items, o.solved === (s ? 'R' : 'L'));
  });
  // pan names in the bottom corners (fixed spots, never under the loads)
  ctx.fillStyle = C.muted; ctx.font = '13px system-ui,sans-serif'; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText(t('leftPan'), 10, Hb - 8);
  ctx.textAlign = 'right'; ctx.fillText(t('rightPan'), W - 10, Hb - 8);
  ctx.restore();
}

// Item sets for a pan while a transition plays. trans: { kind: 'mul'|'div', k, prev (state), sides: 'LR'|'L', p }
function itemsFor(state, side, trans) {
  const n = side === 'L' ? state.a : state.c, m = side === 'L' ? state.b : state.d;
  if (!trans || !trans.sides.includes(side)) return plainItems(n, m);
  const pn = side === 'L' ? trans.prev.a : trans.prev.c, pm = side === 'L' ? trans.prev.b : trans.prev.d, p = trans.p;
  if (trans.kind === 'mul') {
    const mk = (count, prevCount) => Array.from({ length: count }, (_, i) => {
      const copy = prevCount ? Math.floor(i / prevCount) : 0;
      return copy === 0 ? { alpha: 1, tint: null } : { alpha: clamp(p / 0.7, 0, 1), tint: p < 1 ? GROUP[copy % GROUP.length] : null };
    });
    return { bags: mk(n, pn), marbles: mk(m, pm) };
  }
  // div: draw the old load, colour it into k groups, then fade every group but the first
  const mk = count => Array.from({ length: count }, (_, i) => {
    const group = Math.floor(i / (count / trans.k));
    const alpha = group === 0 ? 1 : p < 0.45 ? 1 : 1 - (p - 0.45) / 0.55;
    return { alpha: Math.max(0, alpha), tint: p > 0.08 && p < 1 ? GROUP[group % GROUP.length] : null };
  });
  return { bags: mk(pn), marbles: mk(pm) };
}

// A scene = one balance canvas with its own animated angle.
function makeScene(name, canvasId, getState, getX, extra) {
  const sc = { name, angle: 0, trans: null };
  sc.angle = M.tiltDeg(getState(), getX());
  sc.draw = () => {
    const { ctx, W, H } = fitCanvas($(canvasId), w => balanceHeight(w) + (extra ? extra.below : 0));
    const s = getState(), tr = sc.trans;
    const Hb = H - (extra ? extra.below : 0);
    drawBalance(ctx, W, Hb, { angle: sc.angle, left: itemsFor(s, 'L', tr), right: itemsFor(s, 'R', tr), solved: M.isolated(s) && M.isBalanced(s, getX()) ? M.isolated(s) : null });
    if (extra) extra.draw(ctx, W, H, Hb);
  };
  // Move to the angle of the current state; optional item transition.
  sc.go = trans => {
    const from = sc.angle, to = M.tiltDeg(getState(), getX());
    sc.trans = trans ? { ...trans, p: 0 } : null;
    animate(name, trans ? 900 : 450, p => {
      if (sc.trans) sc.trans.p = p;
      const q = trans ? clamp((p - (trans.kind === 'div' ? 0.6 : 0.3)) / 0.4, 0, 1) : p;
      sc.angle = from + (to - from) * ease(q); sc.draw();
    }, () => { sc.trans = null; sc.angle = to; sc.draw(); });
  };
  sc.snap = () => { stopAnim(name); sc.trans = null; sc.angle = M.tiltDeg(getState(), getX()); sc.draw(); };
  return sc;
}

function sideComp(n, m) {
  const parts = [];
  if (n) parts.push(pl(t('cB', { n }), n));
  if (m || !n) parts.push(pl(t('cM', { m }), m));
  return parts.join(' + ');
}
const compOf = s => t('comp', { L: sideComp(s.a, s.b), R: sideComp(s.c, s.d) });
function opText(op) {
  const map = { add: op.what === 'bag' ? 'opAddB' : 'opAddM', sub: op.what === 'bag' ? 'opSubB' : 'opSubM', mul: 'opMul', div: 'opDiv', oneAdd: 'opOneAddL', oneMul: 'opOneMulL' };
  return pl(t(map[op.kind], { n: op.n, k: op.k }), op.n || op.k);
}
const fmtDiv = list => list.join(window.LESSON_I18N.getLang() === 'en' ? ', ' : '、');

/* ---------- step 0: weigh a sealed bag ---------- */
const s0 = { bag: 0, right: 0, tries: new Map(), found: new Set() };
const x0 = () => M.STEP0_BAGS[s0.bag];
const st0 = () => ({ a: 1, b: 0, c: 0, d: s0.right });
let sc0;
function drawStrip(ctx, W, H, Hb) {
  const L = 22, R = W - 22, y = H - 32;
  const X = n => L + n / M.STEP0_MAX * (R - L);
  ctx.save();
  ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(0, Hb + 2); ctx.lineTo(W, Hb + 2); ctx.stroke();
  ctx.fillStyle = C.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(t('stripTitle'), 10, Hb + 20);
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
  ctx.textAlign = 'center'; ctx.font = '11px system-ui,sans-serif';
  for (let n = 0; n <= M.STEP0_MAX; n++) {
    ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(X(n), y - (n % 5 ? 3 : 6)); ctx.lineTo(X(n), y + (n % 5 ? 3 : 6)); ctx.stroke();
    if (n % 5 === 0) { ctx.fillStyle = C.muted; ctx.fillText(String(n), X(n), y + 20); }
  }
  s0.tries.forEach((res, n) => {
    ctx.fillStyle = res === 'L' ? C.orange : res === 'R' ? C.pink : C.green;
    ctx.beginPath(); ctx.arc(X(n), y, res === '=' ? 7 : 5.5, 0, 7); ctx.fill();
  });
  // the current count: hollow ring
  ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(s0.right), y, 9, 0, 7); ctx.stroke();
  ctx.restore();
}
function render0() {
  const s = st0(), x = x0(), hv = M.heavier(s, x);
  s0.tries.set(s0.right, hv === '=' ? '=' : hv);
  if (hv === '=') s0.found.add(s0.bag);
  const msg = hv === 'L' ? t('s0heavyL', { n: s0.right }) : hv === 'R' ? t('s0heavyR', { n: s0.right }) : t('s0even', { n: s0.right });
  $('r0').textContent = t('s0more', { i: s0.bag + 1, N: M.STEP0_BAGS.length }) + ' ' + msg + ' ' + t('s0count', { k: s0.found.size, N: M.STEP0_BAGS.length });
  $('add0').disabled = s0.right >= M.STEP0_MAX; $('sub0').disabled = s0.right <= 0;
}

/* ---------- steps 1 and 2: which moves keep it level ---------- */
function makeLab(step, cfg) {
  const lab = { state: M.clone(cfg.start), x: cfg.x, hist: [], checks: new Set(), msg: '' };
  lab.scene = makeScene('s' + step, 'c' + step, () => lab.state, () => lab.x);
  lab.apply = (op, check) => {
    const r = M.applyOp(lab.state, op);
    if (!r.ok) { lab.msg = r.reason; render(); return; }
    const prev = lab.state; lab.state = r.state; lab.msg = '';
    lab.hist.push({ op, state: r.state });
    if (check) lab.checks.add(check);
    render();
    const trans = op.kind === 'mul' || op.kind === 'div' ? { kind: op.kind, k: op.k, prev, sides: 'LR' } : op.kind === 'oneMul' ? { kind: 'mul', k: op.k, prev, sides: 'L' } : null;
    lab.scene.go(trans);
  };
  lab.reset = () => { lab.state = M.clone(cfg.start); lab.hist = []; lab.msg = ''; render(); lab.scene.snap(); };
  function render() {
    const s = lab.state, bal = M.isBalanced(s, lab.x);
    $('eq' + step).textContent = M.exprString(s);
    let text = t('s1status', { comp: compOf(s), bal: t(bal ? 'balancedYes' : 'balancedNo') });
    if (step === 2) { const dv = M.divisors(s); text += ' ' + (dv.length ? t('divSome', { list: fmtDiv(dv) }) : t('divNone')); }
    if (lab.msg) text = t(lab.msg) + ' ' + text;
    $('r' + step).textContent = text;
    $('cl' + step).innerHTML = cfg.checks.map(k => `<li class="${lab.checks.has(k) ? 'done' : ''}">${t(k)}</li>`).join('');
    renderHist($('h' + step), cfg.start, lab.hist, lab.x, true);
    if (step === 2) { const dv = M.divisors(s); $('div2').disabled = !dv.includes(2); $('div3').disabled = !dv.includes(3); }
  }
  lab.render = render;
  return lab;
}
function renderHist(ol, start, hist, x, tag) {
  const items = [`<li>${t('histStart', { eq: M.exprString(start) })}</li>`];
  hist.forEach((h, i) => {
    const ok = M.isBalanced(h.state, x);
    items.push(`<li class="${ok ? '' : 'bad'}">${t('histItem', { k: i + 1, op: opText(h.op), eq: M.exprString(h.state) })}${tag ? ' ' + t(ok ? 'tagOk' : 'tagBad') : ''}</li>`);
  });
  ol.innerHTML = items.join('');
  ol.scrollTop = ol.scrollHeight;
}

/* ---------- steps 3–5: solve by doing the same to both pans ---------- */
function makeSolver(step, problems) {
  const S = { idx: 0, hist: [], solved: new Set(), msg: '' };
  const prob = () => problems[S.idx];
  S.state = M.clone(prob().start);
  const box = $('sv' + step), multi = problems.length > 1;
  box.innerHTML = `
    <p class="problem" id="pr${step}"></p>
    <p class="eq" id="eq${step}" aria-live="polite"></p>
    <p class="goal" data-i18n="goal">${t('goal')}</p>
    <div class="controls"><label><span data-i18n="nSlider">${t('nSlider')}</span><output id="n${step}v"></output><input id="n${step}" data-step="${step}" type="range" min="1" max="9" step="1" value="1"></label></div>
    <div class="btn-row">
      <button class="btn primary" id="subm${step}" type="button" data-step="${step}"></button>
      <button class="btn" id="addm${step}" type="button" data-step="${step}"></button>
      <button class="btn" id="subb${step}" type="button" data-step="${step}"></button>
      <button class="btn" id="mul${step}x2" type="button" data-step="${step}" data-i18n="opMul2">${t('opMul2')}</button>
      <button class="btn" id="div${step}x2" type="button" data-step="${step}" data-i18n="opDiv2">${t('opDiv2')}</button>
      <button class="btn" id="div${step}x3" type="button" data-step="${step}" data-i18n="opDiv3">${t('opDiv3')}</button>
      <button class="btn" id="div${step}x4" type="button" data-step="${step}" data-i18n="opDiv4">${t('opDiv4')}</button>
      <button class="btn" id="undo${step}" type="button" data-step="${step}" data-i18n="undo">${t('undo')}</button>
      <button class="btn" id="reset${step}" type="button" data-step="${step}" data-i18n="resetP">${t('resetP')}</button>
      ${multi ? `<button class="btn" id="next${step}" type="button" data-step="${step}" data-i18n="nextP">${t('nextP')}</button>` : ''}
    </div>
    <p class="status" id="st${step}" aria-live="polite"></p>
    <div id="ok${step}"></div>
    <div class="hist"><p class="hist-title" data-i18n="histTitle">${t('histTitle')}</p><ol id="h${step}"></ol></div>`;
  S.scene = makeScene('s' + step, 'c' + step, () => S.state, () => prob().x);
  const n = () => Number($('n' + step).value);
  function apply(op) {
    const r = M.applyOp(S.state, op);
    if (!r.ok) { S.msg = r.reason; render(); return; }
    const prev = S.state; S.state = r.state; S.msg = '';
    S.hist.push({ op, state: r.state, prev });
    render();
    S.scene.go(op.kind === 'mul' || op.kind === 'div' ? { kind: op.kind, k: op.k, prev, sides: 'LR' } : null);
  }
  function render() {
    const s = S.state, x = prob().x;
    $('n' + step + 'v').textContent = String(n());
    $('subm' + step).textContent = cap(pl(t('opSubM', { n: n() }), n()));
    $('addm' + step).textContent = cap(pl(t('opAddM', { n: n() }), n()));
    $('subb' + step).textContent = cap(pl(t('opSubB', { n: 1 }), 1));
    $('pr' + step).textContent = multi ? t('problemOf', { i: S.idx + 1, N: problems.length, eq: M.exprString(prob().start) }) : '';
    $('pr' + step).hidden = !multi;
    $('eq' + step).textContent = M.exprString(s);
    const dv = M.divisors(s);
    [2, 3, 4].forEach(k => { $(`div${step}x${k}`).disabled = !dv.includes(k); });
    $('undo' + step).disabled = !S.hist.length;
    const side = M.isolated(s);
    const solved = side && M.isBalanced(s, x);
    if (solved) S.solved.add(S.idx);
    let st = (S.msg ? t(S.msg) + ' ' : '') + (dv.length ? t('divSome', { list: fmtDiv(dv) }) : t('divNone'));
    if (multi) st += ' ' + t('solvedCount', { k: S.solved.size, N: problems.length });
    $('st' + step).textContent = st;
    // The value of x is rendered only once the bag stands alone (gated: the node does not exist before).
    const ok = $('ok' + step);
    if (solved) {
      const v = M.isolatedValue(s), sub = M.substitute(prob().start, v);
      ok.innerHTML = `<p class="solved">${t('solvedLine', { side: t(side === 'L' ? 'sideL' : 'sideR'), other: t(side === 'L' ? 'sideR' : 'sideL'), v, eq: M.exprString(prob().start), left: sub.left, right: sub.right, L: sub.L, R: sub.R, k: S.hist.length })}</p>`;
    } else ok.innerHTML = `<p class="status">${t('notYet', { comp: compOf(s), bal: t('balancedYes') })}</p>`;
    renderHist($('h' + step), prob().start, S.hist, x, false);
  }
  function load(i) { S.idx = i; S.state = M.clone(prob().start); S.hist = []; S.msg = ''; render(); S.scene.snap(); }
  $('n' + step).addEventListener('input', render);
  $('subm' + step).addEventListener('click', () => apply({ kind: 'sub', what: 'm', n: n() }));
  $('addm' + step).addEventListener('click', () => apply({ kind: 'add', what: 'm', n: n() }));
  $('subb' + step).addEventListener('click', () => apply({ kind: 'sub', what: 'bag', n: 1 }));
  $(`mul${step}x2`).addEventListener('click', () => apply({ kind: 'mul', k: 2 }));
  [2, 3, 4].forEach(k => $(`div${step}x${k}`).addEventListener('click', () => apply({ kind: 'div', k })));
  $('undo' + step).addEventListener('click', () => { if (!S.hist.length) return; const h = S.hist.pop(); S.state = h.prev; S.msg = ''; render(); S.scene.go(null); });
  $('reset' + step).addEventListener('click', () => load(S.idx));
  if (multi) $('next' + step).addEventListener('click', () => load((S.idx + 1) % problems.length));
  S.render = render;
  return S;
}

/* ---------- step 6: quiz (explanations rendered only after a correct answer) ---------- */
const QUIZ = [
  { id: 'q1', start: M.QUIZ[0].start, options: M.QUIZ[0].options.map(String), answer: String(M.QUIZ[0].answer), why: 'why1', back: 3 },
  { id: 'q2', start: M.QUIZ[1].start, options: M.QUIZ[1].options.map(String), answer: String(M.QUIZ[1].answer), why: 'why2', back: 4 },
  { id: 'q3', options: ['q3a', 'q3b', 'q3c', 'q3d'], answer: 'q3a', why: 'why3', wrong: { q3b: 'qWrong3b', q3c: 'qWrong3c', q3d: 'qWrong3d' } }
];
const quizState = {};
function buildQuiz() {
  $('quizBox').innerHTML = QUIZ.map(q => `
    <div class="quiz-q" id="${q.id}box"><p class="qtext" id="${q.id}text"></p>
      <div class="quiz-options">${q.options.map(o => `<label><input type="radio" name="${q.id}" value="${o}"><span data-opt="${o}"></span></label>`).join('')}</div>
      <button class="btn" id="${q.id}check" type="button" data-step="6" data-i18n="check">${t('check')}</button>
      <p class="feedback" id="${q.id}fb" aria-live="polite"></p></div>`).join('');
  QUIZ.forEach(q => $(q.id + 'check').addEventListener('click', () => {
    const pick = document.querySelector(`input[name="${q.id}"]:checked`);
    if (quizState[q.id] && quizState[q.id].ok) return; // a correct answer stays locked
    quizState[q.id] = pick ? { pick: pick.value, ok: pick.value === q.answer } : { pick: null, ok: false };
    renderQuiz();
  }));
}
function renderQuiz() {
  QUIZ.forEach(q => {
    $(q.id + 'text').textContent = q.start ? t(q.id, { eq: M.exprString(q.start) }) : t(q.id);
    document.querySelectorAll(`#${q.id}box [data-opt]`).forEach(sp => { const o = sp.dataset.opt; sp.textContent = q.start ? 'x = ' + o : t(o); });
    const st = quizState[q.id], fb = $(q.id + 'fb');
    fb.className = 'feedback';
    if (!st) { fb.textContent = ''; return; }
    if (!st.pick) { fb.textContent = t('qNoPick'); fb.classList.add('bad'); return; }
    if (st.ok) { fb.textContent = t('qRight', { why: t(q.why) }); fb.classList.add('ok'); return; }
    fb.classList.add('bad');
    if (q.start) { const v = Number(st.pick), sub = M.substitute(q.start, v); fb.textContent = t('qWrongNum', { v, left: sub.left, L: sub.L, R: sub.R, s: q.back }); }
    else fb.textContent = t(q.wrong[st.pick]);
  });
}

let lab1, lab2, sv3, sv4, sv5;
function refresh() {
  render0(); sc0.draw();
  lab1.render(); lab1.scene.draw(); lab2.render(); lab2.scene.draw();
  [sv3, sv4, sv5].forEach(S => { S.render(); S.scene.draw(); });
  renderQuiz();
}

function setup() {
  sc0 = makeScene('s0', 'c0', st0, x0, { below: 70, draw: drawStrip });
  $('add0').addEventListener('click', () => { if (s0.right < M.STEP0_MAX) { s0.right++; render0(); sc0.go(null); } });
  $('sub0').addEventListener('click', () => { if (s0.right > 0) { s0.right--; render0(); sc0.go(null); } });
  $('next0').addEventListener('click', () => { s0.bag = (s0.bag + 1) % M.STEP0_BAGS.length; s0.right = 0; s0.tries.clear(); render0(); sc0.snap(); });

  lab1 = makeLab(1, { start: M.STEP1.start, x: M.STEP1.x, checks: ['check1a', 'check1b', 'check1c'] });
  $('add1m').addEventListener('click', () => lab1.apply({ kind: 'add', what: 'm', n: 1 }, 'check1a'));
  $('sub1m').addEventListener('click', () => lab1.apply({ kind: 'sub', what: 'm', n: 1 }, 'check1b'));
  $('add1b').addEventListener('click', () => lab1.apply({ kind: 'add', what: 'bag', n: 1 }, 'check1a'));
  $('sub1b').addEventListener('click', () => lab1.apply({ kind: 'sub', what: 'bag', n: 1 }, 'check1b'));
  $('one1').addEventListener('click', () => lab1.apply({ kind: 'oneAdd', side: 'L', what: 'm', n: 1 }, 'check1c'));
  $('reset1').addEventListener('click', () => lab1.reset());

  lab2 = makeLab(2, { start: M.STEP2.start, x: M.STEP2.x, checks: ['check2a', 'check2b', 'check2c'] });
  $('mul2').addEventListener('click', () => lab2.apply({ kind: 'mul', k: 2 }, 'check2a'));
  $('mul3').addEventListener('click', () => lab2.apply({ kind: 'mul', k: 3 }, 'check2a'));
  $('div2').addEventListener('click', () => lab2.apply({ kind: 'div', k: 2 }, 'check2b'));
  $('div3').addEventListener('click', () => lab2.apply({ kind: 'div', k: 3 }, 'check2b'));
  $('one2').addEventListener('click', () => lab2.apply({ kind: 'oneMul', side: 'L', k: 2 }, 'check2c'));
  $('reset2').addEventListener('click', () => lab2.reset());

  sv3 = makeSolver(3, [M.STEP3]);
  sv4 = makeSolver(4, M.STEP4);
  sv5 = makeSolver(5, M.STEP5);
  buildQuiz();

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
  window.refreshLesson = refresh;
  refresh();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
