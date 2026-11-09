'use strict';
// Vowel space lesson. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// All formant numbers, normalisation, nearest-template results and distances come from VOWEL (sim-core.js).
(function () {

const $ = id => document.getElementById(id);
const V = window.VOWEL, M = V.MEANS, IDS = V.IDS;
const BY = Object.fromEntries(V.VOWELS.map(v => [v.id, v]));
const t = (...a) => window.VOWEL_I18N.t(...a);
const C = { cyan: '#67d7f9', orange: '#ffb454', green: '#7ee2a8', pink: '#ff7a93', muted: '#9aaabd', grid: '#22303f', text: '#e8edf4', bg: '#0d1621' };
const GCOL = { m: C.cyan, w: C.orange, c: '#c9a7ff' };
const GKEY = { m: 'gm', w: 'gw', c: 'gc' };
const state = { v0: 'iy', g0: 'm', v1: 'iy', v2: 'iy', show: { m: true, w: true, c: true }, g3: 'c', g4: 'c' };

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
function label(ctx, text, X, Y, color = C.text, align = 'left', size = 12, weight = '') {
  ctx.save(); ctx.font = (weight ? weight + ' ' : '') + size + 'px system-ui,sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, X, Y); ctx.restore();
}
function arrow(ctx, x1, y1, x2, y2, color) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 6) return;
  const ex = x2 - Math.cos(a) * 6, ey = y2 - Math.sin(a) * 6;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(a - 0.45) * 8, ey - Math.sin(a - 0.45) * 8); ctx.lineTo(ex - Math.cos(a + 0.45) * 8, ey - Math.sin(a + 0.45) * 8); ctx.closePath(); ctx.fill();
}

// F1–F2 plane on log axes: F2 increases right→left, F1 increases top→bottom (this page's choice).
function plane(ctx, W, H) {
  const P = { l: 44, r: W - 12, t: 30, b: H - 30 };
  const F2 = [3500, 700], F1 = [230, 1150];
  const X = f2 => P.l + (Math.log(F2[0]) - Math.log(f2)) / (Math.log(F2[0]) - Math.log(F2[1])) * (P.r - P.l);
  const Y = f1 => P.t + (Math.log(f1) - Math.log(F1[0])) / (Math.log(F1[1]) - Math.log(F1[0])) * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (const f of [800, 1000, 1500, 2000, 3000]) { ctx.beginPath(); ctx.moveTo(X(f), P.t); ctx.lineTo(X(f), P.b); ctx.stroke(); label(ctx, String(f), X(f), P.t - 6, C.muted, 'center', 10); }
  for (const f of [300, 400, 500, 700, 1000]) { ctx.beginPath(); ctx.moveTo(P.l, Y(f)); ctx.lineTo(P.r, Y(f)); ctx.stroke(); label(ctx, String(f), P.l - 5, Y(f) + 4, C.muted, 'right', 10); }
  label(ctx, '← F2 (Hz)', P.l, 12, C.muted, 'left', 11); label(ctx, 'F1 (Hz) ↓', P.l - 40, H - 8, C.muted, 'left', 11);
  const at = p => { const h = V.hz(p); return [X(h[1]), Y(h[0])]; };
  return { P, X, Y, at };
}
// Outline drawn through the outer vowels (ah, uh and er sit inside, so they are not part of the outline).
const LOOP = ['iy', 'ih', 'eh', 'ae', 'aa', 'ao', 'uw'];
function loop(ctx, pl, g, lambda, color, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath();
  LOOP.forEach((v, i) => { const [x, y] = pl.at(V.point(g, v, lambda)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.closePath(); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, color, r = 4.5) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }

function wordButtons(id, key) {
  const box = $(id);
  if (!box.childElementCount) V.VOWELS.forEach(v => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.dataset.v = v.id; b.textContent = `${v.word} /${v.ipa}/`; b.addEventListener('click', () => { state[key] = v.id; refresh(); }); box.appendChild(b); });
  box.querySelectorAll('button').forEach(b => { const on = b.dataset.v === state[key]; b.classList.toggle('primary', on); b.setAttribute('aria-pressed', String(on)); });
}
function groupButtons(id, key, groups) {
  const box = $(id);
  if (!box.childElementCount) groups.forEach(g => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.g = g; b.addEventListener('click', () => { state[key] = g; refresh(); }); box.appendChild(b); });
  box.querySelectorAll('button').forEach(b => { const on = b.dataset.g === state[key]; b.textContent = t(GKEY[b.dataset.g]); b.classList.toggle('primary', on); b.setAttribute('aria-pressed', String(on)); });
}

/* ---------- step 0: harmonics and formant peaks ---------- */
function draw0() {
  wordButtons('w0', 'v0'); groupButtons('g0', 'g0', V.GROUPS);
  const d = M[state.g0][state.v0], f0 = d[0], fm = d.slice(1), fmax = 4000;
  const { ctx, W, H } = fitCanvas($('c0'));
  const P = { l: 16, r: W - 12, t: 24, b: H - 34 }, x = f => P.l + f / fmax * (P.r - P.l);
  const peak = Math.max(...Array.from({ length: 400 }, (_, i) => V.envelope(i * 10, fm)));
  const y = a => P.b - a / peak * (P.b - P.t);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let f = 0; f <= fmax; f += 500) { ctx.beginPath(); ctx.moveTo(x(f), P.t); ctx.lineTo(x(f), P.b); ctx.stroke(); label(ctx, String(f), x(f), P.b + 14, C.muted, 'center', 10); }
  label(ctx, t('freqAxis'), P.r, P.b + 28, C.muted, 'right', 11); label(ctx, t('ampAxis'), P.l + 2, 14, C.muted, 'left', 11);
  const col = GCOL[state.g0];
  V.harmonics(f0, fmax).forEach(h => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(h), P.b); ctx.lineTo(x(h), y(V.envelope(h, fm))); ctx.stroke(); });
  ctx.save(); ctx.strokeStyle = C.text; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
  for (let f = 0; f <= fmax; f += 10) { const Y = y(V.envelope(f, fm)); f ? ctx.lineTo(x(f), Y) : ctx.moveTo(x(f), Y); }
  ctx.stroke(); ctx.restore();
  fm.forEach((f, i) => { const Y = y(V.envelope(f, fm)); label(ctx, 'F' + (i + 1), x(f), Math.max(P.t + 10, Y - 6), C.text, 'center', 12, '700'); });
  // The F0 note sits among the harmonic lines; a background plate keeps it legible at 320 px.
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; const tw = ctx.measureText('F0 = ' + f0).width; ctx.fillStyle = C.bg; ctx.globalAlpha = 0.85; ctx.fillRect(x(f0) + 2, P.b - 18, tw + 4, 15); ctx.restore();
  label(ctx, 'F0 = ' + f0, x(f0) + 4, P.b - 6, col, 'left', 11);
  const v = BY[state.v0];
  $('r0').textContent = t('s0readout', { word: v.word, ipa: v.ipa, group: t(GKEY[state.g0]), f0, f1: fm[0], f2: fm[1], f3: fm[2], n: V.TOKENS[state.g0] });
}

/* ---------- step 1: the men's ten vowels ---------- */
function draw1() {
  wordButtons('w1', 'v1');
  const { ctx, W, H } = fitCanvas($('c1')); const pl = plane(ctx, W, H);
  loop(ctx, pl, 'm', 0, C.cyan, 0.35);
  IDS.forEach(id => {
    const [x, y] = pl.at(V.point('m', id, 0)), on = id === state.v1;
    dot(ctx, x, y, on ? C.orange : C.cyan, on ? 7 : 4.5);
    label(ctx, BY[id].ipa + (W > 460 || on ? ' ' + BY[id].word : ''), x + 8, y + 4, on ? C.orange : C.text, 'left', on ? 13 : 11, on ? '700' : '');
  });
  const d = M.m[state.v1], v = BY[state.v1];
  let txt = t('s1readout', { word: v.word, ipa: v.ipa, f1: d[1], f2: d[2], f3: d[3] });
  if (state.v1 === 'er') txt += ' ' + t('s1er', { f3: d[3], min: Math.min(...IDS.filter(i => i !== 'er').map(i => M.m[i][3])) });
  $('r1').textContent = txt;
}

/* ---------- step 2: three speaker groups ---------- */
function draw2() {
  wordButtons('w2', 'v2');
  const { ctx, W, H } = fitCanvas($('c2')); const pl = plane(ctx, W, H);
  V.GROUPS.forEach(g => {
    if (!state.show[g]) return;
    loop(ctx, pl, g, 0, GCOL[g], 0.8);
    IDS.forEach(id => { const [x, y] = pl.at(V.point(g, id, 0)), on = id === state.v2; dot(ctx, x, y, GCOL[g], on ? 7 : 3.5); if (on) { ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke(); } });
  });
  let ly = 46; V.GROUPS.forEach(g => { if (state.show[g]) { dot(ctx, pl.P.r - 70, ly - 4, GCOL[g], 4); label(ctx, t(GKEY[g]), pl.P.r - 60, ly, GCOL[g], 'left', 11); ly += 16; } });
  const v = BY[state.v2], m = M.m[state.v2], w = M.w[state.v2], c = M.c[state.v2];
  $('r2').textContent = t('s2readout', { word: v.word, ipa: v.ipa, m1: m[1], m2: m[2], w1: w[1], w2: w[2], c1: c[1], c2: c[2], r1: (c[1] / m[1]).toFixed(2), r2: (c[2] / m[2]).toFixed(2) });
}

/* ---------- steps 3–4: nearest men's template ---------- */
// 11px label box for collision checks: [x0, y0, x1, y1] around text drawn at (X, Y) with the given alignment.
function labelBox(ctx, text, X, Y, align) {
  ctx.save(); ctx.font = '11px system-ui,sans-serif'; const w = ctx.measureText(text).width; ctx.restore();
  const x0 = align === 'right' ? X - w : X; return [x0, Y - 10, x0 + w, Y + 3];
}
const hits = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
function templates(ctx, pl) {
  const taken = [];
  IDS.forEach(id => { const [x, y] = pl.at(V.point('m', id, 0)); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.stroke(); label(ctx, BY[id].ipa, x - 9, y - 7, C.cyan, 'right', 11); taken.push(labelBox(ctx, BY[id].ipa, x - 9, y - 7, 'right')); });
  return taken;
}
function arrows(ctx, pl, g, lambda, taken = []) {
  const res = V.classify(g, lambda);
  res.forEach(r => {
    const [x1, y1] = pl.at(V.point(g, r.v, lambda)), [x2, y2] = pl.at(V.point('m', r.as, 0)), ok = r.as === r.v;
    arrow(ctx, x1, y1, x2, y2, ok ? C.green : C.pink); dot(ctx, x1, y1, GCOL[g], 4.5);
    // Sample labels go lower-right of the dot unless that would sit on another label (e.g. ʊ on the ʌ template at 320 px).
    const spots = [[x1 + 7, y1 + 12, 'left'], [x1 + 7, y1 - 6, 'left'], [x1 - 7, y1 + 12, 'right'], [x1 - 7, y1 - 6, 'right']];
    const [X, Y, al] = spots.find(([X, Y, al]) => !taken.some(b => hits(b, labelBox(ctx, BY[r.v].ipa, X, Y, al)))) || spots[0];
    label(ctx, BY[r.v].ipa, X, Y, GCOL[g], al, 11); taken.push(labelBox(ctx, BY[r.v].ipa, X, Y, al));
  });
  return res;
}
function draw3() {
  groupButtons('g3', 'g3', ['w', 'c']);
  const { ctx, W, H } = fitCanvas($('c3')); const pl = plane(ctx, W, H);
  loop(ctx, pl, 'm', 0, C.cyan, 0.25); const taken = templates(ctx, pl);
  const res = arrows(ctx, pl, state.g3, 0, taken), bad = res.filter(r => r.as !== r.v);
  const list = bad.length ? '：' + bad.map(r => `${BY[r.v].word} → ${BY[r.as].word}`).join('，') : '';
  $('r3').textContent = t('s3readout', { group: t(GKEY[state.g3]), ok: res.length - bad.length, bad: bad.length, list: window.VOWEL_I18N.getLang() === 'en' ? list.replace('：', ': ').replaceAll('，', ', ') : list });
}
function draw4() {
  groupButtons('g4', 'g4', ['w', 'c']);
  const lambda = Number($('l4').value); $('l4v').textContent = lambda.toFixed(2);
  const { ctx, W, H } = fitCanvas($('c4')); const pl = plane(ctx, W, H);
  loop(ctx, pl, 'm', 0, C.cyan, 0.5); const taken = templates(ctx, pl);
  ['w', 'c'].forEach(g => loop(ctx, pl, g, lambda, GCOL[g], g === state.g4 ? 0.9 : 0.3));
  arrows(ctx, pl, state.g4, lambda, taken);
  $('r4').textContent = t('s4readout', { l: lambda.toFixed(2), dw: V.spread('w', lambda).toFixed(3), okw: V.correct('w', lambda), dc: V.spread('c', lambda).toFixed(3), okc: V.correct('c', lambda) });
}

function refresh() { draw0(); draw1(); draw2(); draw3(); draw4(); }
window.refreshVowel = refresh;

function setup() {
  document.querySelectorAll('[data-show]').forEach(cb => cb.addEventListener('change', () => { state.show[cb.dataset.show] = cb.checked; draw2(); }));
  $('l4').addEventListener('input', draw4);
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
