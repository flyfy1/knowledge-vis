'use strict';
// Taylor series lesson (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout comes from window.TAYLOR_MODEL (model.js). Canvas text is limited to
// panel titles (own row above each plot) and axis ticks; legends and numbers live in the DOM.
(function () {

const $ = id => document.getElementById(id);
const M = window.TAYLOR_MODEL;
const t = (...a) => window.LESSON_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', violet: '#b79cff', muted: '#9aaabd', grid: '#22303f', axis: '#4a5f78', text: '#e8edf4', bg: '#0d1621', raw: '#55657a', ghost: '#8696aa' };
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = id => Number($(id).value);
const fmt = (v, d = 2) => { if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0; return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') || '0'; };
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(ch => SUP[ch]).join('');
// numbers in readouts: plain for moderate magnitudes, m×10ⁿ otherwise
function sci(v, p = 3) {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e-3 && a < 1e5) return String(Number(v.toPrecision(p)));
  const e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
  return `${Number(m.toPrecision(p))}×10${sup(e)}`;
}
const tick10 = e => (e === 0 ? '1' : e === 1 ? '10' : '10' + sup(e));

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
// Panel title in its own row; the font shrinks until it fits the width.
function title(ctx, text, X, Y, maxW) {
  let size = 12;
  ctx.save(); ctx.fillStyle = C.text; ctx.textAlign = 'left';
  do { ctx.font = `600 ${size}px system-ui,sans-serif`; if (ctx.measureText(text).width <= maxW) break; size -= 0.5; } while (size > 7);
  ctx.fillText(text, X, Y); ctx.restore();
}
// A plot panel. yTicks / xTicks: arrays of values; yLab / xLab: label formatters. Tick labels are thinned
// so neighbouring x labels never touch.
function panel(ctx, W, o) {
  const P = { l: o.left || 40, r: W - (o.right || 12), t: o.top, b: o.bottom };
  const x = v => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (P.r - P.l);
  const y = v => P.b - (v - o.yMin) / (o.yMax - o.yMin) * (P.b - P.t);
  ctx.save(); ctx.lineWidth = 1; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted;
  ctx.strokeStyle = C.axis; ctx.strokeRect(P.l, P.t, P.r - P.l, P.b - P.t);
  for (const v of o.yTicks || []) {
    ctx.strokeStyle = v === 0 && o.zeroAxis !== false ? C.axis : C.grid; ctx.beginPath(); ctx.moveTo(P.l, y(v)); ctx.lineTo(P.r, y(v)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText((o.yLab || fmt)(v), P.l - 5, y(v) + 4);
  }
  let lastR = -Infinity;
  ctx.textAlign = 'center';
  for (const v of o.xTicks || []) {
    const s = (o.xLab || fmt)(v), w = ctx.measureText(s).width, X = Math.min(Math.max(x(v), P.l + w / 2), W - w / 2 - 1);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(x(v), P.t); ctx.lineTo(x(v), P.b); ctx.stroke();
    if (!s || X - w / 2 < lastR + 6) continue;
    ctx.fillText(s, X, P.b + 15); lastR = X + w / 2;
  }
  ctx.restore();
  if (o.title) title(ctx, o.title, 8, P.t - 9, W - 16);
  return { x, y, P };
}
function clip(ctx, m) { ctx.save(); ctx.beginPath(); ctx.rect(m.P.l, m.P.t, m.P.r - m.P.l, m.P.b - m.P.t); ctx.clip(); }
// Plot y = f(x) over the panel, breaking the line where f is not finite or far off-panel.
function curve(ctx, m, f, x0, x1, color, lw = 2, opts = {}) {
  const N = opts.samples || 400, lim = (m.P.b - m.P.t) * 4;
  clip(ctx, m); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = opts.alpha || 1; if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.beginPath(); let pen = false;
  for (let i = 0; i <= N; i++) {
    const X = x0 + (x1 - x0) * i / N, v = f(X);
    if (!isFinite(v)) { pen = false; continue; }
    const Y = Math.max(m.P.t - lim, Math.min(m.P.b + lim, m.y(v)));
    if (!pen) { ctx.moveTo(m.x(X), Y); pen = true; } else ctx.lineTo(m.x(X), Y);
  }
  ctx.stroke(); ctx.restore();
}
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6); return out; };

/* ---------- animation runner (reduced motion → final frame; hidden page → finish) ---------- */
const anims = {};
function animate(name, ms, frame, done) {
  stopAnim(name);
  if (reduceMotion()) { frame(1); if (done) done(); return; }
  const start = performance.now();
  const tick = now => { const p = Math.min(1, (now - start) / ms); frame(p); if (p < 1) anims[name] = { id: requestAnimationFrame(tick), frame, done }; else { delete anims[name]; if (done) done(); } };
  anims[name] = { id: requestAnimationFrame(tick), frame, done };
}
function stopAnim(name) { if (anims[name]) { cancelAnimationFrame(anims[name].id); delete anims[name]; } }
function finishAll() { Object.keys(anims).forEach(k => { const a = anims[k]; cancelAnimationFrame(a.id); delete anims[k]; a.frame(1); if (a.done) a.done(); }); }

/* ---------- step 0: order of contact ---------- */
function draw0() {
  const c0 = num('q0'), c1 = num('q1'), c2 = num('q2');
  $('q0v').textContent = fmt(c0); $('q1v').textContent = fmt(c1); $('q2v').textContent = fmt(c2);
  const k = M.contact(c0, c1, c2), P = x => c0 + c1 * x + c2 * x * x;
  let { ctx, W, H } = fitCanvas($('c0'));
  const A = panel(ctx, W, { top: 26, bottom: H - 24, xMin: -1.5, xMax: 1.5, yMin: -0.5, yMax: 4.5, yTicks: [0, 1, 2, 3, 4], xTicks: range(-1.5, 1.5, 0.5), title: t('c0a') });
  curve(ctx, A, Math.exp, -1.5, 1.5, C.text, 2.2);
  curve(ctx, A, P, -1.5, 1.5, C.cyan, 2.2);
  ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(A.x(0), A.y(1), 4, 0, 7); ctx.fill(); ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c0b')));
  const B = panel(ctx, W, { top: 26, bottom: H - 24, xMin: -2, xMax: 0, yMin: -8, yMax: 1, yTicks: [-8, -6, -4, -2, 0], yLab: tick10, zeroAxis: false, xTicks: [-2, -1, 0], xLab: e => ['0.01', '0.1', '1'][e + 2], left: 44, title: t('c0b') });
  for (const p of [1, 2, 3]) curve(ctx, B, u => p * u, -2, 0, C.ghost, 1.2, { dash: [4, 4], samples: 2 });
  curve(ctx, B, u => { const e = k.err(Math.pow(10, u)); return e > 0 ? Math.max(-9, Math.log10(e)) : -9; }, -2, 0, C.cyan, 2.4, { samples: 200 });
  $('r0').textContent = t('s0readout', { d0: fmt(k.d[0]), d1: fmt(k.d[1]), d2: fmt(k.d[2]), e1: sci(k.e1), e2: sci(k.e2), ratio: fmt(k.ratio, 2), slope: fmt(k.slope, 2), order: k.order });
}

/* ---------- step 1: coefficients from derivatives ---------- */
const s1 = { fn: 'exp' };
function draw1() {
  const k = num('k1'), c = M.coefs(s1.fn, 8);
  $('k1v').textContent = String(k);
  document.querySelectorAll('#fnPick [data-fn]').forEach(b => b.setAttribute('aria-pressed', b.dataset.fn === s1.fn ? 'true' : 'false'));
  const { ctx, W, H } = fitCanvas($('c1'));
  const A = panel(ctx, W, { top: 26, bottom: H - 24, xMin: -0.6, xMax: 8.6, yMin: -1.15, yMax: 1.15, yTicks: [-1, -0.5, 0, 0.5, 1], xTicks: range(0, 8, 1), title: t('c1a') });
  const bw = Math.min(34, (A.x(1) - A.x(0)) * 0.6);
  c.forEach((v, j) => {
    ctx.fillStyle = j === k ? C.orange : C.cyan; ctx.globalAlpha = j === k ? 1 : 0.8;
    const Y0 = A.y(0), Y1 = A.y(v);
    ctx.fillRect(A.x(j) - bw / 2, Math.min(Y0, Y1), bw, Math.max(2, Math.abs(Y1 - Y0)));
  });
  ctx.globalAlpha = 1;
  $('strip1').innerHTML = c.map((_, j) => `<span class="${j === k ? 'hit' : ''}">${t(j === k ? 'stripHit' : 'stripZero', { j })}</span>`).join('');
  const d = M.deriv0(s1.fn, k), kf = M.fact(k);
  $('r1').textContent = t('s1readout', { fn: t('fn_' + s1.fn), k, d: String(d), kf: String(kf), c: fmt(c[k], 4) });
}

/* ---------- step 2: term by term for sin x ---------- */
const s2 = { seen: new Set([1]) };
function draw2(prog = '') {
  const n = num('n2'), r = M.goodWindow(n), cs = M.coefs('sin', n);
  $('n2v').textContent = String(n);
  const { ctx, W, H } = fitCanvas($('c2'));
  const A = panel(ctx, W, { top: 26, bottom: H - 24, xMin: -8, xMax: 8, yMin: -2.5, yMax: 2.5, yTicks: [-2, -1, 0, 1, 2], xTicks: range(-8, 8, 2), title: t('c2a') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.16)'; ctx.fillRect(A.x(-r), A.P.t, A.x(r) - A.x(-r), A.P.b - A.P.t);
  ctx.strokeStyle = C.green; ctx.globalAlpha = 0.7; ctx.lineWidth = 1; [-r, r].forEach(v => { ctx.beginPath(); ctx.moveTo(A.x(v), A.P.t); ctx.lineTo(A.x(v), A.P.b); ctx.stroke(); }); ctx.restore();
  [...s2.seen].filter(m => m !== n).forEach(m => { const cm = M.coefs('sin', m); curve(ctx, A, x => M.poly(cm, x), -8, 8, C.raw, 1.3); });
  curve(ctx, A, Math.sin, -8, 8, C.text, 2.2);
  curve(ctx, A, x => M.poly(cs, x), -8, 8, C.cyan, 2.4);
  const same = n > 0 && n % 2 === 0 ? t('s2same', { n, m: n - 1 }) : '';
  $('r2').textContent = t('s2readout', { prog, n, r: fmt(r, 2), same });
}

/* ---------- step 3: Lagrange bound vs actual error ---------- */
const N3 = 32, Y3 = { min: -17, max: 3 };
function draw3() {
  const x = num('x3');
  $('x3v').textContent = fmt(x, 1);
  const { ctx, W, H } = fitCanvas($('c3'));
  const A = panel(ctx, W, { top: 26, bottom: H - 24, xMin: -0.6, xMax: N3 + 0.6, yMin: Y3.min, yMax: Y3.max, yTicks: [-15, -10, -5, 0], yLab: tick10, zeroAxis: false, xTicks: range(0, N3, 2), left: 46, title: t('c3a') });
  const L = v => Math.max(Y3.min, Math.min(Y3.max + 2, Math.log10(Math.max(v, 1e-30))));
  ctx.save(); ctx.strokeStyle = C.ghost; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(A.P.l, A.y(-6)); ctx.lineTo(A.P.r, A.y(-6)); ctx.stroke(); ctx.restore();
  clip(ctx, A); ctx.strokeStyle = C.orange; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let n = 0; n <= N3; n++) { const X = A.x(n), Y = A.y(L(M.sinBound(n, x))); if (!n) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = C.text;
  for (let n = 0; n <= N3; n++) { ctx.beginPath(); ctx.arc(A.x(n), A.y(L(Math.max(M.sinError(n, x), Math.pow(10, Y3.min)))), 3.8, 0, 7); ctx.fill(); }
  ctx.restore();
  const nb = M.firstBelow(n => M.sinBound(n, x), 1e-6), na = M.firstBelow(n => M.sinError(n, x), 1e-6);
  $('r3').textContent = t('s3readout', { x: fmt(x, 1), nb, na });
}

/* ---------- step 4: radius of convergence from the complex plane ---------- */
function draw4() {
  const a = num('a4'), n = num('n4'), R = M.lorRadius(a), cs = M.lorCoefs(a, n);
  $('a4v').textContent = fmt(a); $('n4v').textContent = String(n);
  let { ctx, W, H } = fitCanvas($('c4'));
  const A = panel(ctx, W, { top: 26, bottom: H - 24, xMin: -4.8, xMax: 4.8, yMin: -0.6, yMax: 1.6, yTicks: [-0.5, 0, 0.5, 1, 1.5], xTicks: range(-4, 4, 1), title: t('c4a') });
  ctx.save(); ctx.fillStyle = 'rgba(126,226,168,0.16)'; ctx.fillRect(A.x(a - R), A.P.t, A.x(a + R) - A.x(a - R), A.P.b - A.P.t); ctx.restore();
  curve(ctx, A, M.lor, -4.8, 4.8, C.text, 2.2);
  curve(ctx, A, x => M.poly(cs, x, a), -4.8, 4.8, C.cyan, 2.2, { samples: 600 });
  const xin = a + 0.8 * R, xout = a + 1.2 * R;
  ctx.save(); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(A.x(a), A.y(M.lor(a)), 4.5, 0, 7); ctx.fill();
  [[xin, C.green], [xout, C.pink]].forEach(([v, col]) => { if (v > -4.8 && v < 4.8) { ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(A.x(v), A.P.t); ctx.lineTo(A.x(v), A.P.b); ctx.stroke(); } });
  ctx.restore();

  ({ ctx, W, H } = fitCanvas($('c4b')));
  const top = 26, bot = H - 24, left = 34, right = W - 10;
  const span = { re: [-4.5, 4.5], im: [-2.6, 2.6] };
  const s = Math.min((right - left) / (span.re[1] - span.re[0]), (bot - top) / (span.im[1] - span.im[0]));
  const cx = (left + right) / 2, cy = (top + bot) / 2, X = re => cx + re * s, Y = im => cy - im * s;
  title(ctx, t('c4b'), 8, top - 9, W - 16);
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.strokeRect(X(span.re[0]), Y(span.im[1]), (span.re[1] - span.re[0]) * s, (span.im[1] - span.im[0]) * s);
  ctx.beginPath(); ctx.moveTo(X(span.re[0]), Y(0)); ctx.lineTo(X(span.re[1]), Y(0)); ctx.moveTo(X(0), Y(span.im[0])); ctx.lineTo(X(0), Y(span.im[1])); ctx.stroke();
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
  [-4, -2, 2, 4].forEach(v => ctx.fillText(String(v), X(v), Y(span.im[0]) + 14));
  ctx.textAlign = 'right'; [-2, 2].forEach(v => ctx.fillText(v + 'i', X(span.re[0]) - 4, Y(v) + 4));
  ctx.beginPath(); ctx.rect(X(span.re[0]), Y(span.im[1]), (span.re[1] - span.re[0]) * s, (span.im[1] - span.im[0]) * s); ctx.clip();
  ctx.fillStyle = 'rgba(126,226,168,0.18)'; ctx.strokeStyle = C.green; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(X(a), Y(0), R * s, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(a), Y(0)); ctx.lineTo(X(0), Y(1)); ctx.stroke(); ctx.setLineDash([]);
  // the slice of the disc on the real axis = the band on the left
  ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(a - R), Y(0)); ctx.lineTo(X(a + R), Y(0)); ctx.stroke();
  ctx.strokeStyle = C.pink; ctx.lineWidth = 2.4; [1, -1].forEach(im => { ctx.beginPath(); ctx.arc(X(0), Y(im), 6, 0, 7); ctx.stroke(); });
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(X(a), Y(0), 4.5, 0, 7); ctx.fill();
  ctx.restore();

  const fx = v => fmt(v, 2);
  $('r4').textContent = t('s4readout', { a: fmt(a), R: fx(R), lo: fx(a - R), hi: fx(a + R), n, xin: fx(xin), xout: fx(xout), ein: sci(M.lorError(a, n, xin)), eout: sci(M.lorError(a, n, xout)) });
}

/* ---------- step 5: computing e^x ---------- */
const s5 = { hist: new Map() };
const X5 = range(-5, 5, 0.5);
function draw5(prog = '') {
  const x = num('x5'), K = 30, terms = M.expTermList(x, K), r = M.expTerms(x);
  $('x5v').textContent = fmt(x, 1);
  s5.hist.set(x.toFixed(1), r.N);
  const { ctx, W, H } = fitCanvas($('c5'));
  const big = Math.max(...terms.map(Math.abs));
  const top = Math.max(1, Math.ceil(big * 1.1 / Math.pow(10, Math.floor(Math.log10(big * 1.1)))) * Math.pow(10, Math.floor(Math.log10(big * 1.1))));
  const A = panel(ctx, W, { top: 26, bottom: 186, xMin: -0.7, xMax: K - 0.3, yMin: x < 0 ? -top : 0, yMax: top, yTicks: x < 0 ? [-top, 0, top] : [0, top / 2, top], xTicks: range(0, K - 1, 1), xLab: v => (v % 5 === 0 ? String(v) : ''), title: t('c5a') });
  const bw = Math.max(2, (A.x(1) - A.x(0)) * 0.66);
  terms.forEach((v, k) => {
    ctx.fillStyle = v < 0 ? C.pink : C.cyan; ctx.globalAlpha = k < r.N ? 1 : 0.3;
    const Y0 = A.y(0), Y1 = A.y(v); ctx.fillRect(A.x(k) - bw / 2, Math.min(Y0, Y1), bw, Math.max(1, Math.abs(Y1 - Y0)));
  });
  ctx.globalAlpha = 1;
  ctx.save(); ctx.strokeStyle = C.orange; ctx.setLineDash([4, 4]); const cut = A.x(r.N - 0.5); ctx.beginPath(); ctx.moveTo(cut, A.P.t); ctx.lineTo(cut, A.P.b); ctx.stroke(); ctx.restore();
  const B = panel(ctx, W, { top: 228, bottom: H - 24, xMin: -5.5, xMax: 5.5, yMin: 0, yMax: 30, yTicks: [0, 10, 20, 30], xTicks: range(-5, 5, 1), title: t('c5b') });
  ctx.save();
  s5.hist.forEach((N, key) => { const v = Number(key); if (Math.abs(v - x) < 1e-9) return; ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(B.x(v), B.y(N), 3.5, 0, 7); ctx.fill(); });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(B.x(x), B.y(r.N), 6, 0, 7); ctx.fill(); ctx.restore();
  let neg = '';
  if (x < 0) neg = t('s5neg', { ratio: fmt(r.maxTerm / r.exact, 0), ax: fmt(-x, 1), Npos: M.expTerms(-x).N });
  $('r5').textContent = t('s5readout', { prog, x: fmt(x, 1), N: r.N, rel: sci(r.relErr, 2), ex: sci(r.exact, 6), S: sci(r.sum, 6), maxT: sci(r.maxTerm, 4), neg });
  const maxN = sgn => Math.max(...X5.filter(v => (sgn > 0 ? v >= 0 : v <= 0)).map(v => M.expTerms(v).N));
  $('h5').textContent = t('s5hint', { nPos5: maxN(1), nNeg5: maxN(-1) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); draw5(); }

function setup() {
  ['q0', 'q1', 'q2'].forEach(id => $(id).addEventListener('input', draw0));
  $('match0').addEventListener('click', () => { $('q0').value = 1; $('q1').value = 1; $('q2').value = 0.5; draw0(); });

  document.querySelectorAll('#fnPick [data-fn]').forEach(b => b.addEventListener('click', () => { s1.fn = b.dataset.fn; draw1(); }));
  $('k1').addEventListener('input', draw1);

  $('n2').addEventListener('input', () => { stopAnim('s2'); s2.seen.add(num('n2')); draw2(); });
  $('play2').addEventListener('click', () => {
    s2.seen.clear(); const total = 16;
    animate('s2', total * 550, p => {
      const n = Math.min(total - 1, Math.floor(p * total));
      for (let m = 0; m <= n; m++) s2.seen.add(m);
      $('n2').value = n; draw2(n < total - 1 ? t('s2progress', { c: n, N: total - 1 }) : '');
    });
  });
  $('clear2').addEventListener('click', () => { stopAnim('s2'); s2.seen = new Set([num('n2')]); draw2(); });

  $('x3').addEventListener('input', draw3);
  $('a4').addEventListener('input', draw4); $('n4').addEventListener('input', draw4);
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    const ok = !!choice && choice.value === 'b';
    $('quizFeedback').textContent = t(ok ? 'correct' : 'wrong');
    $('quizFeedback').style.color = ok ? C.green : C.orange;
  });

  $('x5').addEventListener('input', () => { stopAnim('s5'); draw5(); });
  $('sweep5').addEventListener('click', () => {
    s5.hist.clear(); const total = X5.length;
    animate('s5', total * 380, p => {
      const i = Math.min(total - 1, Math.floor(p * total));
      for (let j = 0; j <= i; j++) s5.hist.set(X5[j].toFixed(1), M.expTerms(X5[j]).N);
      $('x5').value = X5[i]; draw5(i < total - 1 ? t('s5progress', { c: i + 1, N: total }) : '');
    });
  });

  const links = [...document.querySelectorAll('.nav-step')], steps = [...document.querySelectorAll('.step')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((l, i) => l.classList.toggle('active', i === steps.indexOf(e.target))); }), { rootMargin: '-25% 0px -60% 0px' });
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
