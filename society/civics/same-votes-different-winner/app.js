/* Wiring, drawing and i18n for "Same ballots, different winner". All visible text comes from copy.*.js. */
(() => {
'use strict';
const M = window.VoteModels, COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = { bg: '#0f1219', grid: '#1b2130', line: '#2b3242', ink: '#ebe8e0', mute: '#a3aab8', dim: '#8f97a8', gold: '#e9b949', cyan: '#63c7e6', green: '#7ad6a0', violet: '#c4a8ff', red: '#ff8a7a' };
const CC = [C.gold, C.cyan, C.green, C.violet], LET = 'ABCD';
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const pct = (x, d = 0) => (x * 100).toFixed(d);

/* ───────── language ───────── */
let memLang = null;
function readLang() {
  try { const v = localStorage.getItem('knowledge-lang'); if (v === 'zh' || v === 'en') return v; } catch (e) { /* storage blocked */ }
  if (memLang) return memLang;
  return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
}
function writeLang(v) { memLang = v; try { localStorage.setItem('knowledge-lang', v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
function T(key, vars) {
  let s = COPY[lang] && COPY[lang][key] !== undefined ? COPY[lang][key] : (COPY.zh && COPY.zh[key] !== undefined ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}
const L = (i, cls) => `<b style="color:${CC[i]}"${cls ? ` class="${cls}"` : ''}>${LET[i]}</b>`;
const rankText = r => r.map(i => LET[i]).join(T('gt'));

function applyStatic() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = T('doc.title');
  const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', T('doc.desc'));
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = T(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => { const [a, k] = pair.split(':'); el.setAttribute(a.trim(), T(k.trim())); }));
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

/* ───────── canvas + visibility-gated loop ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { const s = sims.find(s => s.cv === e.target); if (s) { s.vis = e.isIntersecting; s.dirty = true; if (s.vis && s.onShow) s.onShow(); } }), { rootMargin: '120px' });
function reg(cv, o) { o.cv = cv; o.vis = false; o.dirty = true; sims.push(o); io.observe(cv); return o; }
const touch = o => { if (o) o.dirty = true; };
const updaters = [];

/* ───────── hero: 21 voters, three options ───────── */
function updateHero() {
  const P = M.OPENING, B = M.expand(P), A = [0, 1, 2], all = M.electAll(B, A);
  $('#heroTable tbody').innerHTML = P.map(g => `<tr><td>${T('hero.row', { n: g.count })}</td><td class="rk">${g.rank.map(i => L(i)).join('<span>&gt;</span>')}</td></tr>`).join('');
  const m = all.condorcet.matrix, rf = all.runoff.final;
  const det = {
    plurality: T('hero.detail.plurality'),
    runoff: T('hero.detail.runoff', { a: rf[0], b: rf[1] }),
    borda: T('hero.detail.borda', { c: all.borda.scores[2], a: all.borda.scores[0] }),
    condorcet: T('hero.detail.condorcet', { ca: m[2][0], ac: m[0][2], cb: m[2][1], bc: m[1][2] })
  };
  $('#heroWin').innerHTML = ['plurality', 'runoff', 'borda', 'condorcet'].map(k => `<div>${T('hero.rule.' + k)}<b>${T('hero.win', { c: L(all[k].winner) })}</b><small>${det[k]}</small></div>`).join('');
}
updaters.push(updateHero);

/* ───────── shared plane electorate (ch1, ch5, ch6) ───────── */
const PV = M.planeVoters(), ACT = [0, 1, 2, 3];
const S = { cands: M.PLANE.cands.map(p => p.slice()) };
let planeBallots = M.ballotsFrom(PV, S.cands);
const planes = [];
function planeGeom(w, h) { const pad = 26, side = Math.min(w - 2 * 14, h - 2 * pad); const x0 = (w - side) / 2, y0 = (h - side) / 2; return { x0, y0, side, X: x => x0 + x * side, Y: y => y0 + (1 - y) * side, inv: (px, py) => [(px - x0) / side, 1 - (py - y0) / side] }; }
function makePlane(cvSel, stageSel, overlay) {
  const cv = $(cvSel), stage = $(stageSel), handles = [];
  const P = { cv, overlay, sim: null, geom: null };
  P.sim = reg(cv, { draw() {
    const { c, w, h } = fit(cv), g = planeGeom(w, h); P.geom = g;
    c.clearRect(0, 0, w, h);
    // territory: nearest candidate, low resolution
    const n = 44, cs = g.side / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i + 0.5) / n, y = 1 - (j + 0.5) / n; let best = 0, bd = Infinity;
      S.cands.forEach((p, k) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; best = k; } });
      c.fillStyle = CC[best]; c.globalAlpha = 0.085; c.fillRect(g.x0 + i * cs, g.y0 + j * cs, cs + 0.5, cs + 0.5);
    }
    c.globalAlpha = 1; c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(g.x0, g.y0, g.side, g.side);
    const ov = overlay ? overlay.pre(c, g) : null;
    PV.forEach((v, i) => {
      const top = ov && ov.top ? ov.top(i) : planeBallots[i][0];
      c.fillStyle = CC[top]; c.beginPath(); c.arc(g.X(v[0]), g.Y(v[1]), 3.3, 0, 6.283); c.fill();
    });
    if (overlay && overlay.post) overlay.post(c, g);
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(T('plane.axisX'), g.x0 + g.side, g.y0 + g.side + 14);
    c.textAlign = 'left'; c.fillText(T('plane.axisY'), g.x0, g.y0 - 13);
    placeHandles();
  } });
  function placeHandles() {
    const g = P.geom; if (!g) return;
    handles.forEach((hd, k) => { hd.style.left = g.X(S.cands[k][0]) + 'px'; hd.style.top = g.Y(S.cands[k][1]) + 'px'; hd.setAttribute('aria-label', T('cand.handle', { c: LET[k], x: S.cands[k][0].toFixed(2), y: S.cands[k][1].toFixed(2) })); });
  }
  for (let k = 0; k < 4; k++) {
    const hd = document.createElement('button'); hd.type = 'button'; hd.className = 'handle'; hd.style.setProperty('--c', CC[k]); hd.innerHTML = `<span aria-hidden="true">${LET[k]}</span>`;
    const move = e => { const r = cv.getBoundingClientRect(), g = P.geom; if (!g) return; const [x, y] = g.inv(e.clientX - r.left, e.clientY - r.top); setCand(k, x, y, false); };
    hd.addEventListener('pointerdown', e => { e.preventDefault(); hd.setPointerCapture(e.pointerId); hd.focus(); hd.onpointermove = move; });
    hd.addEventListener('pointerup', () => { hd.onpointermove = null; setCand(k, S.cands[k][0], S.cands[k][1], true); });
    hd.addEventListener('pointercancel', () => { hd.onpointermove = null; });
    hd.addEventListener('keydown', e => {
      const st = e.shiftKey ? 0.05 : 0.01, d = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key];
      if (!d) return; e.preventDefault(); setCand(k, S.cands[k][0] + d[0], S.cands[k][1] + d[1], true);
    });
    stage.appendChild(hd); handles.push(hd);
  }
  P.placeHandles = placeHandles;
  planes.push(P);
  return P;
}
let candRaf = 0;
function setCand(k, x, y, final) {
  S.cands[k] = [M.clamp(x, 0.02, 0.98), M.clamp(y, 0.02, 0.98)];
  planeBallots = M.ballotsFrom(PV, S.cands);
  planes.forEach(p => { touch(p.sim); p.placeHandles(); });
  if (!candRaf) candRaf = requestAnimationFrame(() => { candRaf = 0; update1(); update6(); update5(); });
}

/* ───────── ch1: five rules ───────── */
const P1 = makePlane('#cv1', '#st1', null);
function update1() {
  const all = M.electAll(planeBallots, ACT), f = all.plurality.counts;
  $('#r1first').innerHTML = T('ch1.firsts') + ACT.map(i => `${L(i)} ${f[i]}`).join(' · ');
  const tile = (k, w, detail) => `<div>${T('rule.' + k)}<b class="w" style="color:${w >= 0 ? CC[w] : C.mute}">${w >= 0 ? LET[w] : '—'}</b>${detail}</div>`;
  const ro = all.runoff, ir = all.irv, last = ir.rounds[ir.rounds.length - 1];
  const other = ro.outright ? -1 : ro.finalists.find(x => x !== ro.winner);
  $('#r1').innerHTML = [
    tile('plurality', all.plurality.winner, T('ch1.tile.plurality', { n: f[all.plurality.winner] })),
    tile('runoff', ro.winner, ro.outright ? T('ch1.tile.runoff.outright', { n: f[ro.winner] }) : T('ch1.tile.runoff', { a: ro.final[ro.winner], b: ro.final[other], o: LET[other] })),
    tile('irv', ir.winner, T('ch1.tile.irv', { r: ir.rounds.length, n: last.counts[ir.winner] })),
    tile('borda', all.borda.winner, T('ch1.tile.borda', { n: all.borda.scores[all.borda.winner] })),
    tile('condorcet', all.condorcet.winner, all.condorcet.winner >= 0 ? T('ch1.tile.condorcet') : T('ch1.tile.condorcet.none'))
  ].join('');
  const ws = M.RULE_KEYS.map(k => all[k].winner).filter(w => w >= 0), distinct = [...new Set(ws)];
  const list = M.RULE_KEYS.filter(k => all[k].winner >= 0).map(k => T('ch1.say.item', { r: T('rule.' + k), c: L(all[k].winner) })).join(T('sep'));
  $('#say1').innerHTML = distinct.length === 1 ? T('ch1.say.k1', { w: L(distinct[0]) }) : T(distinct.length === 2 ? 'ch1.say.k2' : 'ch1.say.k3', { k: distinct.length, list });
}
updaters.push(update1);

/* ───────── ch2: spoiler on a line ───────── */
const LV = M.lineVoters(), LL = M.LINE.L, LR = M.LINE.R;
const STRIP = M.spoilerStrip(LV, LL, LR, 200);
const H2H = M.plurality(M.ballotsFrom(LV, [[LL], [LR]]), [0, 1]);
const s2T = $('#s2T');
function lineState(t) { const b = M.ballotsFrom(LV, [[LL], [LR], [t]]), A3 = [0, 1, 2]; return { b, p: M.plurality(b, A3), i: M.irv(b, A3), c: M.condorcet(b, A3) }; }
function drawLineVoters(c, w, y0, X, colorOf) {
  const bins = {}; LV.forEach((v, i) => { const k = Math.min(49, Math.floor(v[0] * 50)); (bins[k] = bins[k] || []).push(i); });
  Object.keys(bins).forEach(k => bins[k].forEach((i, j) => { c.fillStyle = colorOf(i); c.beginPath(); c.arc(X((+k + 0.5) / 50), y0 - 7 - j * 7, 2.8, 0, 6.283); c.fill(); }));
}
function candDot(c, x, y, col, letter) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 9, 0, 6.283); c.fill(); c.fillStyle = '#0c0e13'; c.textAlign = 'center'; c.font = '700 12px ' + FONT.slice(5); c.fillText(letter, x, y + 0.5); c.font = FONT; }
const sim2 = reg($('#cv2'), { draw() {
  const { c, w, h } = fit(this.cv), Lm = 14, Rm = 14, X = x => Lm + x * (w - Lm - Rm), y0 = 112, t = +s2T.value, st = lineState(t);
  c.clearRect(0, 0, w, h);
  drawLineVoters(c, w, y0, X, i => CC[st.b[i][0]]);
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(Lm, y0); c.lineTo(w - Rm, y0); c.stroke();
  c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(T('ch2.axis'), w - Rm, 12);
  candDot(c, X(LL), y0, CC[0], 'A'); candDot(c, X(LR), y0, CC[1], 'B'); candDot(c, X(t), y0 + 22, CC[2], 'C');
  const rows = [['plurality', 'ch2.r.plurality'], ['irv', 'ch2.r.irv'], ['condorcet', 'ch2.r.pair']];
  rows.forEach(([k, lab], r) => {
    const yl = 160 + r * 56; c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(T(lab), Lm, yl);
    STRIP.forEach((s, i) => { const x0 = X(i / 200 - 0.0025), x1 = X(i / 200 + 0.0025); c.fillStyle = CC[s[k]]; c.globalAlpha = 0.85; c.fillRect(x0, yl + 10, x1 - x0 + 0.6, 16); });
    c.globalAlpha = 1;
  });
  c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(X(t), y0 + 34); c.lineTo(X(t), 160 + 2 * 56 + 30); c.stroke();
} });
function update2() {
  const t = +s2T.value, st = lineState(t), f = st.p.counts, hc = H2H.counts;
  $('#o2T').textContent = t.toFixed(2);
  $('#r2first').textContent = T('ch2.tile.first', { a: f[0], b: f[1], c: f[2] });
  $('#r2h2h').textContent = T('ch2.tile.h2h', { a: hc[0], b: hc[1] });
  const p = st.p.winner, i = st.i.winner, cw = st.c.winner;
  let say;
  if (p === 2) say = T('ch2.say.cwins');
  else if (cw === 2) say = f[2] < f[0] && f[2] < f[1] ? T('ch2.say.squeeze', { c: f[2] }) : T('ch2.say.cwnot', { p: L(p), i: L(i) });
  else if (p !== H2H.winner) say = T('ch2.say.spoil', { c: f[2], a: hc[0], b: hc[1] });
  else if (p === i && i === cw) say = T('ch2.say.calm', { w: L(p) });
  else say = T('ch2.say.other', { p: L(p), i: L(i), c: cw >= 0 ? L(cw) : '—' });
  $('#say2').innerHTML = say;
  touch(sim2);
}
s2T.addEventListener('input', () => { update2(); restart2b(); });
updaters.push(update2);

/* ───────── ch2b: repeated elections, strategic desertion ───────── */
const ROUNDS = 11, s2s = $('#s2s');
let run2 = [], k2 = 1, acc2 = 0;
function restart2b() { run2 = M.desertionRun(LV, [[LL], [LR], [+s2T.value]], +s2s.value, ROUNDS); k2 = reduce ? run2.length : 1; acc2 = 0; touch(sim2b); text2b(); }
function text2b() {
  $('#o2s').textContent = pct(+s2s.value) + '%';
  const e = run2[k2 - 1], sh = e.shares;
  $('#r2round').textContent = T('ch2.t.round', { k: k2, n: run2.length });
  $('#r2share').textContent = T('ch2.t.share', { a: pct(sh[0]), b: pct(sh[1]), c: pct(sh[2]) });
  $('#r2lead').innerHTML = T('ch2.t.lead', { w: L(e.order[0]) });
  if (k2 < run2.length) { $('#say2b').innerHTML = ''; return; }
  const first = run2[0].order[0], flip = run2.findIndex(r => r.order[0] !== first);
  const third0 = run2[0].order[2];
  $('#say2b').innerHTML = flip > 0 ? T('ch2.say2.flip', { w0: L(first), w1: L(run2[flip].order[0]), k: flip + 1, c: pct(run2[run2.length - 1].shares[third0]) }) : T('ch2.say2.same', { w: L(first), c0: pct(run2[0].shares[third0]), c: pct(run2[run2.length - 1].shares[third0]) });
}
const sim2b = reg($('#cv2b'), {
  step(dt) { if (k2 >= run2.length) return; acc2 += dt; if (acc2 >= 0.6) { acc2 = 0; k2++; text2b(); this.dirty = true; } },
  draw() {
    const { c, w, h } = fit(this.cv), Lm = 42, Rm = 16, Tm = 24, Bm = 36, n = run2.length;
    const X = i => Lm + (w - Lm - Rm) * i / (n - 1), Y = v => h - Bm - (h - Tm - Bm) * v / 0.6;
    c.clearRect(0, 0, w, h);
    c.strokeStyle = C.grid; c.lineWidth = 1; c.fillStyle = C.mute; c.textAlign = 'right';
    [0, 0.25, 0.5].forEach(v => { c.beginPath(); c.moveTo(Lm, Y(v)); c.lineTo(w - Rm, Y(v)); c.stroke(); c.fillText(pct(v) + '%', Lm - 6, Y(v)); });
    c.textAlign = 'center'; [0, 5, n - 1].forEach(i => c.fillText(String(i + 1), X(i), h - Bm + 13));
    c.textAlign = 'left'; c.fillText(T('ch2.axis2y'), Lm, 10); c.textAlign = 'right'; c.fillText(T('ch2.axis2x'), w - Rm, h - 7);
    for (let k = 0; k < 3; k++) {
      c.strokeStyle = CC[k]; c.lineWidth = 2.5; c.beginPath();
      for (let i = 0; i < k2; i++) c[i ? 'lineTo' : 'moveTo'](X(i), Y(run2[i].shares[k]));
      c.stroke(); c.fillStyle = CC[k];
      for (let i = 0; i < k2; i++) { c.beginPath(); c.arc(X(i), Y(run2[i].shares[k]), 3, 0, 6.283); c.fill(); }
    }
  }
});
s2s.addEventListener('input', restart2b);
updaters.push(() => { if (!run2.length) restart2b(); else text2b(); });
$('#b2r').addEventListener('click', restart2b);

/* ───────── ch3: win sets, 1D and 2D ───────── */
const G1 = M.grid1D(200), G2 = M.grid2D(41), MED = M.median1D(LV);
const s3x = $('#s3x'), s3y = $('#s3y');
const st3 = { mode: 1, inc: [0.15], trace: [], rounds: 0, playing: false, acc: 0, ws: null, minWs: null };
function voters3() { return st3.mode === 1 ? LV : PV; }
function grid3() { return st3.mode === 1 ? G1 : G2; }
function recompute3() { st3.ws = M.winSet(voters3(), st3.inc, grid3()); }
function setInc3(p, keepTrace) {
  st3.inc = p; if (!keepTrace) { st3.trace = []; st3.rounds = 0; }
  s3x.value = p[0].toFixed(2); if (p[1] !== undefined) s3y.value = p[1].toFixed(2);
  recompute3(); text3(); touch(sim3);
}
function step3() {
  const ch = M.bestChallenger(voters3(), st3.inc, grid3());
  if (!ch) { st3.playing = false; setPlay3(); return false; }
  st3.trace.push(st3.inc.slice()); if (st3.trace.length > 80) st3.trace.shift();
  st3.rounds++; setInc3(ch.point.slice(), true); return true;
}
function setPlay3() { $('#b3play').textContent = T(st3.playing ? 'ch3.pause' : 'ch3.play'); $('#b3play').setAttribute('aria-pressed', String(st3.playing)); }
function text3() {
  const n = st3.ws.filter(Boolean).length, share = n / st3.ws.length;
  $('#o3x').textContent = (+s3x.value).toFixed(2); $('#o3y').textContent = (+s3y.value).toFixed(2);
  $('#r3a').textContent = T('ch3.t.win', { p: pct(share, 1) });
  if (st3.mode === 1) $('#r3b').textContent = T('ch3.t.median', { m: MED.toFixed(2) });
  else { if (st3.minWs === null) st3.minWs = Math.min(...G2.map(p => M.winSet(PV, p, G2).filter(Boolean).length)) / G2.length; $('#r3b').textContent = T('ch3.t.center', { p: pct(st3.minWs, 1) }); }
  $('#r3c').textContent = T('ch3.t.rounds', { k: st3.rounds });
  if (st3.mode === 1) $('#say3').innerHTML = n === 0 ? T('ch3.say1.stop') : T('ch3.say1.move', { side: T(st3.inc[0] < MED ? 'ch3.left' : 'ch3.right') });
  else $('#say3').innerHTML = T('ch3.say2', { p: pct(share, 1) });
}
const sim3 = reg($('#cv3'), {
  step(dt) { if (!st3.playing) return; st3.acc += dt; const every = st3.mode === 1 ? 0.18 : 0.45; if (st3.acc >= every) { st3.acc = 0; step3(); } },
  draw() {
    const { c, w, h } = fit(this.cv); c.clearRect(0, 0, w, h);
    if (st3.mode === 1) {
      const Lm = 14, Rm = 14, X = x => Lm + x * (w - Lm - Rm), y0 = Math.round(h * 0.62);
      st3.ws.forEach((b, i) => { if (!b) return; const x = G1[i][0]; c.fillStyle = 'rgba(233,185,73,.22)'; c.fillRect(X(x - 0.0025), 26, X(x + 0.0025) - X(x - 0.0025) + 0.6, y0 - 26); });
      drawLineVoters(c, w, y0, X, () => C.dim);
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(Lm, y0); c.lineTo(w - Rm, y0); c.stroke();
      c.strokeStyle = C.ink; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(MED), y0); c.lineTo(X(MED), y0 + 40); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.mute; c.textAlign = 'center'; c.fillText(T('ch3.median'), X(MED), y0 + 52);
      c.textAlign = 'right'; c.fillText(T('ch3.axis'), w - Rm, 12);
      st3.trace.forEach((p, i) => { c.globalAlpha = 0.25 + 0.6 * (i + 1) / st3.trace.length; c.fillStyle = C.gold; c.fillRect(X(p[0]) - 1, y0 + 14, 2, 10); });
      c.globalAlpha = 1; c.fillStyle = C.gold; c.beginPath(); c.arc(X(st3.inc[0]), y0, 9, 0, 6.283); c.fill(); c.strokeStyle = '#0c0e13'; c.lineWidth = 2; c.stroke();
    } else {
      const g = planeGeom(w, h), cs = g.side / 41;
      st3.ws.forEach((b, i) => { if (!b) return; const p = G2[i]; c.fillStyle = 'rgba(233,185,73,.26)'; c.fillRect(g.X(p[0]) - cs / 2, g.Y(p[1]) - cs / 2, cs + 0.5, cs + 0.5); });
      c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(g.x0, g.y0, g.side, g.side);
      PV.forEach(v => { c.fillStyle = C.dim; c.beginPath(); c.arc(g.X(v[0]), g.Y(v[1]), 3, 0, 6.283); c.fill(); });
      if (st3.trace.length) { c.strokeStyle = 'rgba(233,185,73,.6)'; c.lineWidth = 1.5; c.beginPath(); st3.trace.concat([st3.inc]).forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](g.X(p[0]), g.Y(p[1]))); c.stroke(); }
      c.fillStyle = C.gold; c.beginPath(); c.arc(g.X(st3.inc[0]), g.Y(st3.inc[1]), 8, 0, 6.283); c.fill(); c.strokeStyle = '#0c0e13'; c.lineWidth = 2; c.stroke();
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(T('plane.axisX'), g.x0 + g.side, g.y0 + g.side + 14); c.textAlign = 'left'; c.fillText(T('plane.axisY'), g.x0, g.y0 - 13);
    }
  }
});
function setMode3(m) {
  st3.mode = m; st3.playing = false; setPlay3();
  $('#b3m1').setAttribute('aria-pressed', String(m === 1)); $('#b3m2').setAttribute('aria-pressed', String(m === 2));
  $('#l3y').style.display = m === 1 ? 'none' : '';
  $('#cv3').style.height = m === 1 ? '260px' : 'auto';
  $('#cv3').style.aspectRatio = m === 1 ? 'auto' : '1'; $('#cv3').style.maxWidth = m === 1 ? '' : '520px'; $('#cv3').style.margin = m === 1 ? '' : '0 auto';
  setInc3(m === 1 ? [0.15] : [0.2, 0.8]);
}
$('#b3m1').addEventListener('click', () => setMode3(1));
$('#b3m2').addEventListener('click', () => setMode3(2));
s3x.addEventListener('input', () => { st3.playing = false; setPlay3(); setInc3(st3.mode === 1 ? [+s3x.value] : [+s3x.value, +s3y.value]); });
s3y.addEventListener('input', () => { st3.playing = false; setPlay3(); setInc3([+s3x.value, +s3y.value]); });
$('#b3play').addEventListener('click', () => {
  if (reduce) { const max = st3.mode === 1 ? 200 : 40; for (let i = 0; i < max; i++) if (!step3()) break; return; }
  st3.playing = !st3.playing; st3.acc = 0; setPlay3();
});
$('#b3step').addEventListener('click', () => { st3.playing = false; setPlay3(); step3(); });
$('#b3reset').addEventListener('click', () => setMode3(st3.mode));
(() => {
  const cv = $('#cv3'); let drag = false;
  const at = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; st3.playing = false; setPlay3();
    if (st3.mode === 1) setInc3([M.clamp((x - 14) / (r.width - 28), 0.01, 0.99)]);
    else { const g = planeGeom(r.width, r.height), p = g.inv(x, y); setInc3([M.clamp(p[0], 0.01, 0.99), M.clamp(p[1], 0.01, 0.99)]); } };
  cv.addEventListener('pointerdown', e => { drag = true; cv.setPointerCapture(e.pointerId); at(e); });
  cv.addEventListener('pointermove', e => { if (drag) at(e); });
  cv.addEventListener('pointerup', () => { drag = false; }); cv.addEventListener('pointercancel', () => { drag = false; });
})();
updaters.push(() => { setPlay3(); text3(); });

/* ───────── ch4: build a cycle ───────── */
const prof4 = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
function build4() {
  $('#v4').innerHTML = prof4.map((r, k) => `<label><span>${T('ch4.voter', { k: k + 1 })}</span><select data-k="${k}">${M.PERMS3.map((p, i) => `<option value="${i}"${p.join() === r.join() ? ' selected' : ''}>${T('ch4.opt', { a: LET[p[0]], b: LET[p[1]], c: LET[p[2]] })}</option>`).join('')}</select></label>`).join('');
  $('#v4').querySelectorAll('select').forEach(s => s.addEventListener('change', () => { prof4[+s.dataset.k] = M.PERMS3[+s.value].slice(); update4(); }));
}
let maj4 = M.majority3(prof4);
const sim4 = reg($('#cv4'), { draw() {
  const { c, w, h } = fit(this.cv), cx = w / 2, R = Math.min(w * 0.3, h * 0.36), cy = h / 2 + R * 0.18;
  const P = [[cx, cy - R], [cx - R * 0.95, cy + R * 0.55], [cx + R * 0.95, cy + R * 0.55]], m = maj4.matrix;
  c.clearRect(0, 0, w, h);
  [[0, 1], [1, 2], [2, 0]].forEach(([a, b]) => {
    const win = m[a][b] > m[b][a] ? a : b, lose = win === a ? b : a, A = P[win], B = P[lose];
    const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, sx = A[0] + ux * 22, sy = A[1] + uy * 22, ex = B[0] - ux * 24, ey = B[1] - uy * 24;
    c.strokeStyle = maj4.cycle ? C.red : C.mute; c.lineWidth = 2.5; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
    c.fillStyle = c.strokeStyle; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - ux * 12 - uy * 7, ey - uy * 12 + ux * 7); c.lineTo(ex - ux * 12 + uy * 7, ey - uy * 12 - ux * 7); c.closePath(); c.fill();
    const mx = (P[a][0] + P[b][0]) / 2, my = (P[a][1] + P[b][1]) / 2, ox = mx - cx, oy = my - (cy - R * 0.1), od = Math.hypot(ox, oy) || 1;
    c.fillStyle = C.ink; c.textAlign = 'center'; c.font = '600 13px ' + FONT.slice(5); c.fillText(`${LET[win]} ${m[win][lose]} : ${m[lose][win]}`, mx + ox / od * 26, my + oy / od * 20); c.font = FONT;
  });
  P.forEach((p, i) => { c.fillStyle = CC[i]; c.beginPath(); c.arc(p[0], p[1], 18, 0, 6.283); c.fill(); c.fillStyle = '#0c0e13'; c.textAlign = 'center'; c.font = '700 16px ' + FONT.slice(5); c.fillText(LET[i], p[0], p[1] + 1); c.font = FONT; });
} });
function update4() {
  maj4 = M.majority3(prof4); const m = maj4.matrix;
  $('#r4').innerHTML = [[0, 1], [1, 2], [2, 0]].map(([a, b]) => `<div><b>${T('ch4.t.pair', { a: LET[a], b: LET[b], x: m[a][b], y: m[b][a] })}</b></div>`).join('');
  const chain = () => { const out = []; let a = 0; for (let i = 0; i < 3; i++) { const b = [0, 1, 2].find(x => x !== a && m[a][x] > m[x][a]); out.push(T('ch4.beats', { a: LET[a], b: LET[b] })); a = b; } return out.join(T('sep')); };
  $('#say4').innerHTML = maj4.cycle ? T('ch4.say.cycle', { chain: chain() }) : T('ch4.say.winner', { w: L(maj4.winner) });
  touch(sim4);
}
const NS4 = []; for (let n = 3; n <= 31; n += 2) NS4.push(n);
const PROB4 = NS4.map(n => M.cycleProbIC(n));
const s4n = $('#s4n');
const sim4b = reg($('#cv4b'), { draw() {
  const { c, w, h } = fit(this.cv), Lm = 42, Rm = 16, Tm = 24, Bm = 36, X = n => Lm + (w - Lm - Rm) * (n - 3) / 28, Y = v => h - Bm - (h - Tm - Bm) * v / 0.1;
  c.clearRect(0, 0, w, h); c.strokeStyle = C.grid; c.lineWidth = 1; c.fillStyle = C.mute; c.textAlign = 'right';
  [0, 0.05, 0.1].forEach(v => { c.beginPath(); c.moveTo(Lm, Y(v)); c.lineTo(w - Rm, Y(v)); c.stroke(); c.fillText(pct(v) + '%', Lm - 6, Y(v)); });
  c.textAlign = 'center'; [3, 11, 21, 31].forEach(n => c.fillText(String(n), X(n), h - Bm + 13));
  c.textAlign = 'left'; c.fillText(T('ch4.axisy'), Lm, 10); c.textAlign = 'right'; c.fillText(T('ch4.axisx'), w - Rm, h - 7);
  c.strokeStyle = C.violet; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(Lm, Y(M.GUILBAUD)); c.lineTo(w - Rm, Y(M.GUILBAUD)); c.stroke(); c.setLineDash([]);
  const sel = +s4n.value;
  NS4.forEach((n, i) => { c.fillStyle = n === sel ? C.gold : C.cyan; c.beginPath(); c.arc(X(n), Y(PROB4[i]), n === sel ? 7 : 4, 0, 6.283); c.fill(); });
} });
function update4b() {
  const n = +s4n.value, p = PROB4[NS4.indexOf(n)];
  $('#o4n').textContent = n; $('#r4p').textContent = T('ch4.t.prob', { n, p: pct(p, 1) }); $('#r4l').textContent = T('ch4.t.limit', { p: pct(M.GUILBAUD, 1) });
  touch(sim4b);
}
s4n.addEventListener('input', update4b);
updaters.push(() => { build4(); update4(); update4b(); });

/* ───────── ch5: strategic voting on the ch1 electorate ───────── */
const st5 = { rule: 'plurality', apply: false, m: null };
const P5 = makePlane('#cv5', '#st5', {
  pre() { return { top: i => (st5.apply && st5.m && st5.m.members.includes(i)) ? st5.m.ballot[0] : planeBallots[i][0] }; },
  post(c, g) {
    const m = st5.m; if (!m) return;
    const grp = new Set(M.groupBallots(planeBallots).find(x => x.rank.join() === m.group.join()).members);
    PV.forEach((v, i) => { if (!grp.has(i)) return; c.strokeStyle = C.ink; c.lineWidth = 1.2; c.beginPath(); c.arc(g.X(v[0]), g.Y(v[1]), 6.5, 0, 6.283); c.stroke(); });
    m.members.forEach(i => { const v = PV[i]; c.strokeStyle = C.ink; c.lineWidth = 2.5; c.beginPath(); c.arc(g.X(v[0]), g.Y(v[1]), 6.5, 0, 6.283); c.stroke(); });
  }
});
function build5() {
  $('#seg5').innerHTML = M.RULE_KEYS.map(k => `<button class="b" type="button" data-rule="${k}" aria-pressed="${k === st5.rule}">${T('rule.' + k)}</button>`).join('');
  $('#seg5').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { st5.rule = b.dataset.rule; st5.apply = false; build5(); update5(); }));
}
function update5() {
  const rule = st5.rule, sincere = M.RULES[rule](planeBallots, ACT).winner;
  st5.m = sincere >= 0 ? M.findManipulation(planeBallots, ACT, rule) : null;
  const m = st5.m, bA = $('#b5apply'); bA.disabled = !m; bA.setAttribute('aria-pressed', String(!!(m && st5.apply)));
  if (!m) st5.apply = false;
  const name = T('rule.' + rule);
  if (m) {
    $('#r5a').innerHTML = T('ch5.t.group', { r: rankText(m.group), n: m.groupSize });
    $('#r5b').innerHTML = T('ch5.t.need', { k: m.k, b: rankText(m.ballot) });
    $('#r5c').innerHTML = T('ch5.t.result', { a: L(m.before), b: L(m.after) });
    $('#say5').innerHTML = T('ch5.say.found', { rule: name, a: L(m.before), k: m.k, b: rankText(m.ballot), c: L(m.after), betray: T(m.betrayal ? 'ch5.say.betray' : 'ch5.say.bury') });
  } else {
    ['#r5a', '#r5b'].forEach(s => { $(s).textContent = T('ch5.t.none'); });
    $('#r5c').innerHTML = T('ch5.t.result', { a: sincere >= 0 ? L(sincere) : '—', b: sincere >= 0 ? L(sincere) : '—' });
    $('#say5').innerHTML = rule === 'condorcet' ? (sincere >= 0 ? T('ch5.say.condorcet', { w: L(sincere) }) : T('ch5.say.cycle')) : T('ch5.say.none', { rule: name });
  }
  touch(P5.sim);
}
$('#b5apply').addEventListener('click', () => { if (!st5.m) return; st5.apply = !st5.apply; update5(); });
updaters.push(() => { build5(); update5(); });

/* ───────── ch6: approval voting ───────── */
const s6r = $('#s6r');
const P6 = makePlane('#cv6', '#st6', {
  pre(c, g) { const r = +s6r.value; S.cands.forEach((p, k) => { c.strokeStyle = CC[k]; c.globalAlpha = 0.7; c.lineWidth = 1.5; c.beginPath(); c.arc(g.X(p[0]), g.Y(p[1]), r * g.side, 0, 6.283); c.stroke(); c.globalAlpha = 0.05; c.fillStyle = CC[k]; c.fill(); c.globalAlpha = 1; }); return null; }
});
function update6() {
  const r = +s6r.value, a = M.approval(PV, S.cands, ACT, r), w = M.winners(planeBallots, ACT);
  $('#o6r').textContent = r.toFixed(2);
  $('#r6').innerHTML = ACT.map(k => `<div><b style="color:${CC[k]}">${T('ch6.t.count', { c: LET[k], n: a.scores[k] })}</b></div>`).join('');
  $('#say6').innerHTML = T('ch6.say', { w: L(a.winner), n: a.scores[a.winner], p: L(w.plurality), b: L(w.borda), c: w.condorcet >= 0 ? L(w.condorcet) : T('rule.none') });
  touch(P6.sim);
}
s6r.addEventListener('input', update6);
updaters.push(update6);

/* ───────── ch7: apportionment, 1880 ───────── */
const POPS = M.POP1880.map(x => x[1]), CODES = M.POP1880.map(x => x[0]);
const st7 = { method: 'ham' }, s7h = $('#s7h');
const METHODS = { ham: M.hamilton, hh: M.huntingtonHill };
const PAR = { ham: M.paradoxes(POPS, M.hamilton, 275, 350), hh: M.paradoxes(POPS, M.huntingtonHill, 275, 350) };
const stateName = code => { const k = 'ch7.state.' + code; const s = T(k); return s === k ? code : s; };
let res7 = null;
const sim7 = reg($('#cv7'), { draw() {
  const { c, w, h } = fit(this.cv), Lm = 34, Rm = 10, Tm = 26, Bm = 30, hcur = +s7h.value;
  const ham = M.hamilton(POPS, hcur), seats = res7.cur, prev = res7.prev, q = ham.quotas;
  const elig = q.map((x, i) => i).filter(i => q[i] >= 1).sort((a, b) => ham.remainders[b] - ham.remainders[a] || a - b);
  const bw = (w - Lm - Rm) / elig.length, Y = v => h - Bm - (h - Tm - Bm) * v;
  c.clearRect(0, 0, w, h);
  c.strokeStyle = C.grid; c.lineWidth = 1; c.fillStyle = C.mute; c.textAlign = 'right';
  [0, 0.5, 1].forEach(v => { c.beginPath(); c.moveTo(Lm, Y(v)); c.lineTo(w - Rm, Y(v)); c.stroke(); c.fillText(String(v), Lm - 6, Y(v)); });
  elig.forEach((i, j) => {
    const up = seats[i] > Math.floor(q[i]), x = Lm + j * bw, top = Y(ham.remainders[i]);
    c.fillStyle = up ? C.gold : 'rgba(99,199,230,.55)'; c.fillRect(x + 1, top, Math.max(1, bw - 2), Y(0) - top);
    const d = seats[i] - prev[i];
    if (d !== 0) { c.strokeStyle = d < 0 ? C.red : C.green; c.lineWidth = 2.5; c.strokeRect(x, top - 2, bw, Y(0) - top + 2); }
  });
  c.textAlign = 'left'; c.fillStyle = C.mute; c.fillText(T('ch7.axis'), Lm, 11);
  if (st7.method === 'ham') {
    const xc = Lm + ham.cut * bw; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(xc, Tm); c.lineTo(xc, Y(0) + 6); c.stroke();
    c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText('← ' + T('ch7.cut'), Math.max(xc, 90), h - 10);
  }
} });
function update7() {
  const hcur = +s7h.value, f = METHODS[st7.method], cur = f(POPS, hcur).seats, prev = f(POPS, hcur - 1).seats, q = M.quotas(POPS, hcur), q0 = M.quotas(POPS, hcur - 1);
  res7 = { cur, prev };
  $('#o7h').textContent = hcur;
  $('#b7ham').setAttribute('aria-pressed', String(st7.method === 'ham')); $('#b7hh').setAttribute('aria-pressed', String(st7.method === 'hh'));
  $('#r7').innerHTML = ['AL', 'TX', 'IL', 'FL'].map(s => { const i = CODES.indexOf(s), d = cur[i] - prev[i]; return `<div><b${d < 0 ? ' class="warn"' : ''}>${T('ch7.t.state', { s: stateName(s), q: q[i].toFixed(3), n: cur[i] })}</b></div>`; }).join('');
  const lost = cur.map((s, i) => (s < prev[i] ? i : -1)).filter(i => i >= 0);
  $('#r7lost').textContent = lost.length ? T('ch7.t.lost', { h: hcur - 1, list: lost.map(i => stateName(CODES[i])).join(T('sep')) }) : T('ch7.t.nolost', { h: hcur - 1 });
  const pl = PAR[st7.method];
  $('#r7list').textContent = pl.length ? T('ch7.t.list', { list: pl.map(p => T('ch7.t.item', { a: p.from, b: p.to, s: stateName(CODES[p.state]) })).join(T('sep')) }) : T('ch7.t.listnone');
  let say = lost.length ? T('ch7.say.lost', { h0: hcur - 1, h1: hcur, s: stateName(CODES[lost[0]]), q0: q0[lost[0]].toFixed(3), q1: q[lost[0]].toFixed(3) }) : T('ch7.say.ok', { h0: hcur - 1, h1: hcur });
  if (st7.method === 'hh') say += ' ' + T('ch7.say.hh');
  $('#say7').innerHTML = say;
  touch(sim7);
}
s7h.addEventListener('input', update7);
$('#b7ham').addEventListener('click', () => { st7.method = 'ham'; update7(); });
$('#b7hh').addEventListener('click', () => { st7.method = 'hh'; update7(); });
updaters.push(update7);

/* ───────── ch8: districts ───────── */
const st8 = { map: M.MAPS.blocks.slice(), preset: 'blocks', brush: 0, cursor: 40, focus: false };
const DCOL = ['#e9b949', '#63c7e6'];
const sim8 = reg($('#cv8'), { draw() {
  const { c, w, h } = fit(this.cv), N = M.GRID, side = Math.min(w, h) - 8, cs = side / N, x0 = (w - side) / 2, y0 = (h - side) / 2;
  const r = M.districtResult(M.PARTY, st8.map), ok = r.valid.equal && r.valid.contiguous;
  c.clearRect(0, 0, w, h);
  for (let i = 0; i < N * N; i++) {
    const x = x0 + (i % N) * cs, y = y0 + ((i / N) | 0) * cs, d = st8.map[i], win = r.rows[d].win;
    c.fillStyle = ok && win >= 0 ? (win === 1 ? 'rgba(233,185,73,.20)' : 'rgba(99,199,230,.17)') : 'rgba(255,255,255,.03)'; c.fillRect(x, y, cs, cs);
    c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
    c.fillStyle = M.PARTY[i] ? DCOL[0] : DCOL[1]; c.beginPath(); c.arc(x + cs / 2 + cs * 0.06, y + cs / 2 + cs * 0.06, cs * 0.21, 0, 6.283); c.fill();
  }
  c.strokeStyle = C.ink; c.lineWidth = 3; c.lineCap = 'round';
  for (let i = 0; i < N * N; i++) {
    const gx = i % N, gy = (i / N) | 0, x = x0 + gx * cs, y = y0 + gy * cs;
    if (gx < N - 1 && st8.map[i] !== st8.map[i + 1]) { c.beginPath(); c.moveTo(x + cs, y); c.lineTo(x + cs, y + cs); c.stroke(); }
    if (gy < N - 1 && st8.map[i] !== st8.map[i + N]) { c.beginPath(); c.moveTo(x, y + cs); c.lineTo(x + cs, y + cs); c.stroke(); }
  }
  c.strokeRect(x0, y0, side, side);
  c.font = '600 11px ' + FONT.slice(5); c.textAlign = 'left'; c.textBaseline = 'top';
  for (let d = 0; d < 9; d++) { const i = st8.map.indexOf(d); if (i < 0) continue; const x = x0 + (i % N) * cs, y = y0 + ((i / N) | 0) * cs; c.fillStyle = '#0c0e13'; c.fillRect(x + 2, y + 2, 12, 13); c.fillStyle = C.ink; c.fillText(String(d + 1), x + 4, y + 3); }
  c.textBaseline = 'middle'; c.font = FONT;
  if (st8.focus) { const i = st8.cursor, x = x0 + (i % N) * cs, y = y0 + ((i / N) | 0) * cs; c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(x + 2, y + 2, cs - 4, cs - 4); }
  this.geom = { x0, y0, cs, N };
} });
function build8() {
  $('#seg8').innerHTML = M.MAP_KEYS.map(k => `<button class="b" type="button" data-map="${k}" aria-pressed="${st8.preset === k}">${T('ch8.p.' + k)}</button>`).join('');
  $('#seg8').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { st8.preset = b.dataset.map; st8.map = M.MAPS[st8.preset].slice(); build8(); update8(); }));
  $('#pal8').innerHTML = Array.from({ length: 9 }, (_, d) => `<button class="b" type="button" data-d="${d}" aria-pressed="${st8.brush === d}" aria-label="${T('ch8.paint.k', { k: d + 1 })}">${d + 1}</button>`).join('');
  $('#pal8').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { st8.brush = +b.dataset.d; build8(); }));
}
function paint8(i) {
  if (i < 0 || i >= 81 || st8.map[i] === st8.brush) return;
  st8.map[i] = st8.brush; if (st8.preset) { st8.preset = null; build8(); } update8();
}
function update8() {
  const r = M.districtResult(M.PARTY, st8.map), v = r.valid, ok = v.equal && v.contiguous, gold = M.PARTY.reduce((a, b) => a + b, 0);
  $('#r8b').textContent = T('ch8.t.votes', { g: pct(gold / 81, 1) });
  if (ok) {
    const e = r.efficiencyGap, es = e > 0.0005 ? T('ch8.t.eg.gold', { e: pct(e, 1) }) : e < -0.0005 ? T('ch8.t.eg.cyan', { e: pct(-e, 1) }) : T('ch8.t.eg.zero');
    $('#r8a').textContent = T('ch8.t.seats', { g: r.seatsGold, c: r.seatsCyan });
    $('#r8c').textContent = T('ch8.t.eg', { e: es });
    const maxG = Math.max(...r.rows.map(x => x.gold));
    $('#say8').innerHTML = T('ch8.say', { pct: pct(gold / 81, 0), g: r.seatsGold, extra: maxG >= 8 ? T('ch8.say.packed', { n: maxG }) : T('ch8.say.even') });
  } else {
    const why = [!v.equal ? T('ch8.why.size') : '', !v.contiguous ? T('ch8.why.cont', { list: v.broken.map(d => d + 1).join(T('sep')) }) : ''].filter(Boolean).join(T('sep'));
    $('#r8a').textContent = '—'; $('#r8c').innerHTML = `<span class="warn">${T('ch8.t.invalid', { why })}</span>`;
    $('#say8').innerHTML = T('ch8.t.invalid', { why });
  }
  $('#r8cmp').textContent = T('ch8.compare') + M.MAP_KEYS.map(k => T('ch8.compare.item', { name: T('ch8.p.' + k), n: M.districtResult(M.PARTY, M.MAPS[k]).seatsGold })).join(' · ');
  touch(sim8);
}
(() => {
  const cv = $('#cv8'); let down = false;
  const cell = e => { const r = cv.getBoundingClientRect(), g = sim8.geom; if (!g) return -1; const gx = Math.floor((e.clientX - r.left - g.x0) / g.cs), gy = Math.floor((e.clientY - r.top - g.y0) / g.cs); return gx >= 0 && gx < g.N && gy >= 0 && gy < g.N ? gy * g.N + gx : -1; };
  cv.addEventListener('pointerdown', e => { down = true; cv.setPointerCapture(e.pointerId); const i = cell(e); if (i >= 0) { st8.cursor = i; paint8(i); } });
  cv.addEventListener('pointermove', e => { if (!down) return; const i = cell(e); if (i >= 0) { st8.cursor = i; paint8(i); } });
  cv.addEventListener('pointerup', () => { down = false; }); cv.addEventListener('pointercancel', () => { down = false; });
  cv.addEventListener('focus', () => { st8.focus = true; touch(sim8); }); cv.addEventListener('blur', () => { st8.focus = false; touch(sim8); });
  cv.addEventListener('keydown', e => {
    const N = M.GRID, i = st8.cursor, x = i % N, y = (i / N) | 0;
    const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (mv) { e.preventDefault(); st8.cursor = M.clamp(y + mv[1], 0, N - 1) * N + M.clamp(x + mv[0], 0, N - 1); touch(sim8); return; }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); paint8(st8.cursor); }
  });
})();
updaters.push(() => { build8(); update8(); });

/* ───────── ch9: the jury theorem ───────── */
const s9p = $('#s9p'), s9c = $('#s9c'), s9n = $('#s9n');
const NS9 = []; for (let n = 1; n <= 301; n += 2) NS9.push(n);
const sim9 = reg($('#cv9'), { draw() {
  const { c, w, h } = fit(this.cv), Lm = 46, Rm = 16, Tm = 24, Bm = 36, p = +s9p.value, cp = +s9c.value, n = +s9n.value;
  const X = k => Lm + (w - Lm - Rm) * (k - 1) / 300, Y = v => h - Bm - (h - Tm - Bm) * v;
  c.clearRect(0, 0, w, h); c.strokeStyle = C.grid; c.lineWidth = 1; c.fillStyle = C.mute; c.textAlign = 'right';
  [0, 0.5, 1].forEach(v => { c.beginPath(); c.moveTo(Lm, Y(v)); c.lineTo(w - Rm, Y(v)); c.stroke(); c.fillText(pct(v) + '%', Lm - 6, Y(v)); });
  c.textAlign = 'center'; [1, 101, 201, 301].forEach(k => c.fillText(String(k), X(k), h - Bm + 13));
  c.textAlign = 'left'; c.fillText(T('ch9.axisy'), Lm, 10); c.textAlign = 'right'; c.fillText(T('ch9.axisx'), w - Rm, h - 7);
  const curve = (cc, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); NS9.forEach((k, i) => c[i ? 'lineTo' : 'moveTo'](X(k), Y(M.jury(k, p, cc)))); c.stroke(); };
  if (cp > 0) curve(0, C.dim, 1.5);
  c.strokeStyle = C.violet; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(Lm, Y(M.juryLimit(p, cp))); c.lineTo(w - Rm, Y(M.juryLimit(p, cp))); c.stroke(); c.setLineDash([]);
  curve(cp, C.gold, 3);
  c.fillStyle = C.ink; c.beginPath(); c.arc(X(n), Y(M.jury(n, p, cp)), 6, 0, 6.283); c.fill();
} });
function update9() {
  const p = +s9p.value, cp = +s9c.value, n = +s9n.value, v = M.jury(n, p, cp), lim = M.juryLimit(p, cp);
  $('#o9p').textContent = pct(p) + '%'; $('#o9c').textContent = pct(cp) + '%'; $('#o9n').textContent = n;
  $('#r9a').textContent = T('ch9.t.now', { n, v: pct(v, 1) }); $('#r9b').textContent = T('ch9.t.one', { p: pct(p) }); $('#r9c').textContent = T('ch9.t.lim', { v: pct(lim) });
  let say;
  if (Math.abs(p - 0.5) < 1e-9) say = T('ch9.say.coin');
  else if (cp > 0 && Math.abs(lim - p) < 1e-9) say = T('ch9.say.copy', { c: pct(cp), lim: pct(lim) });
  else if (p > 0.5) say = T('ch9.say.up', { p: pct(p), n, v: pct(v, 1) });
  else say = T('ch9.say.down', { p: pct(p), n, v: pct(v, 1) });
  $('#say9').innerHTML = say; touch(sim9);
}
[s9p, s9c, s9n].forEach(s => s.addEventListener('input', update9));
updaters.push(update9);

/* ───────── boot ───────── */
function refreshAll() { applyStatic(); updaters.forEach(f => f()); sims.forEach(touch); planes.forEach(p => p.placeHandles()); }
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang === lang) return; lang = b.dataset.lang; writeLang(lang); refreshAll(); }));
window.addEventListener('resize', () => { sims.forEach(touch); });
setMode3(1);
refreshAll();
let last = performance.now();
function tick(t) {
  const dt = Math.min((t - last) / 1000, 0.1); last = t;
  for (const s of sims) { if (!s.vis) continue; if (s.step) s.step(dt); if (s.dirty) { s.dirty = false; s.draw(); } }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essay = { M, S, st3, st5, st8, setLang: v => { lang = v; refreshAll(); }, T };
window.__ready = true;
})();
