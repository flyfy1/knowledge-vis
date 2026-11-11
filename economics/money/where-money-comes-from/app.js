/* Wiring, drawing and i18n for "Where money comes from". All visible text comes from copy.<lang>.js;
   all numbers come from models.js. */
(() => {
'use strict';
const M = window.MoneyModels, COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: 'rgba(43,50,66,.75)', ink: '#ebe8e0', mute: '#a7adbb', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;

/* ───────── language ───────── */
let lang = 'zh', memLang = null;
function storedLang() { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return memLang; } }
function storeLang(l) { memLang = l; try { localStorage.setItem('knowledge-lang', l); } catch (e) { /* private mode: keep it in memory */ } }
function t(k, vars) {
  let s = (COPY[lang] && COPY[lang][k] != null) ? COPY[lang][k] : (COPY.zh && COPY.zh[k] != null ? COPY.zh[k] : k);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, v) => (vars[v] != null ? vars[v] : m));
  return s;
}
const nf = (x, d = 0) => (Object.is(x, -0) ? 0 : x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sgn = (x, d = 1) => { const r = Math.round(x * 10 ** d) / 10 ** d; return (r > 0 ? '+' : r < 0 ? '−' : '') + nf(Math.abs(r), d); };
const updaters = [];
function applyLang(l) {
  lang = l;
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  $('#metaDesc').setAttribute('content', t('doc.desc'));
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  updaters.forEach(f => f());
  sims.forEach(s => { s.dirty = true; });
}

/* ───────── canvas + sims registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { sims.filter(s => s.cv === e.target).forEach(s => { s.vis = e.isIntersecting; s.dirty = true; }); }), { rootMargin: '60px' }) : null;
function reg(cv, o) { o.cv = cv; o.vis = !io; o.dirty = true; sims.push(o); if (io) io.observe(cv); return o; }
const touch = o => { o.dirty = true; };
window.addEventListener('resize', () => sims.forEach(touch));
function sayTo(el, html) { if (el.innerHTML !== html) el.innerHTML = html; }
function axes(c, L, T, R, B) { c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B); c.stroke(); }
function label(c, s, x, y, align = 'left', col = C.mute) { c.fillStyle = col; c.textAlign = align; c.fillText(s, x, y); }
function bindRange(id, fn) { const e = $(id); e.addEventListener('input', fn); return e; }

/* ───────── ch1 · barter versus IOUs ───────── */
const ch1 = (() => {
  const cv = $('#trCv'), sN = $('#trN'), sQ = $('#trQ'), RATE = 4; // rounds per second
  let s, acc = 0;
  const o = reg(cv, {
    step(dt) {
      if (s.round >= M.TRADE_ROUNDS) return;
      acc += dt * RATE;
      while (acc >= 1 && s.round < M.TRADE_ROUNDS) { acc -= 1; M.tradeRound(s, +sQ.value / 100); o.dirty = true; }
      if (o.dirty) readout();
    },
    draw() {
      const { c, w, h } = fit(cv), P = s.P, rows = [['barter', C.red], ['personal', C.violet], ['bank', C.gold]];
      const padL = 12, padR = 12, gap = (w - padL - padR) / P, r = clamp(gap * 0.36, 1.6, 4.2), top = 18, rowH = 20;
      const flash = new Set(s.last.map(x => x[0] + ':' + x[1]).concat(s.last.map(x => x[0] + ':' + x[2])));
      rows.forEach(([m, col], k) => {
        const y = top + k * rowH;
        for (let i = 0; i < P; i++) {
          const x = padL + gap * (i + 0.5), on = s.done[m][i];
          c.beginPath(); c.arc(x, y, r, 0, 6.283);
          if (on) { c.fillStyle = col; c.fill(); } else { c.strokeStyle = 'rgba(167,173,187,.45)'; c.lineWidth = 1; c.stroke(); }
          if (flash.has(m + ':' + i)) { c.strokeStyle = C.ink; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, r + 2.2, 0, 6.283); c.stroke(); }
        }
      });
      const L = 44, Rr = 14, T = top + 3 * rowH + 22, B = h - 40, X = n => L + (w - L - Rr) * n / M.TRADE_ROUNDS, Y = v => B - (B - T) * v;
      c.strokeStyle = C.grid; c.lineWidth = 1;
      [0.5, 1].forEach(v => { c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(w - Rr, Y(v)); c.stroke(); });
      axes(c, L, T - 6, w - Rr, B);
      ['0%', '50%', '100%'].forEach((s2, i) => label(c, s2, L - 6, Y(i / 2), 'right'));
      [0, 20, 40, 60].forEach(n => label(c, String(n), X(n), B + 13, 'center'));
      label(c, t('ch1.ax.x'), w - Rr, h - 9, 'right'); label(c, t('ch1.ax.y'), L + 6, T - 12, 'left');
      rows.forEach(([m, col]) => {
        const hs = s.hist[m]; c.beginPath(); hs.forEach((v, n) => c[n ? 'lineTo' : 'moveTo'](X(n), Y(v))); c.strokeStyle = col; c.lineWidth = 2.5; c.stroke();
      });
    }
  });
  function restart() { s = M.tradeInit(+sN.value); acc = 0; if (reduce) while (s.round < M.TRADE_ROUNDS) M.tradeRound(s, +sQ.value / 100); readout(); touch(o); }
  function readout() {
    const N = +sN.value, q = +sQ.value;
    $('#trNo').textContent = t('ch1.out.n', { n: N }); $('#trQo').textContent = t('ch1.out.q', { q });
    const pct = m => t('ch1.r.unit.pct', { v: nf(s.hist[m][s.round] * 100) });
    $('#trRound').textContent = t('ch1.r.unit.round', { v: s.round }); $('#trB').textContent = pct('barter'); $('#trP').textContent = pct('personal'); $('#trK').textContent = pct('bank');
    $('#trStep').disabled = s.round >= M.TRADE_ROUNDS;
    sayTo($('#trSay'), N === 2 ? t('ch1.say.n2') : t('ch1.say.main', { n: N, stuck: M.tradeStuck(N), eb: nf(M.tradeExpectedRounds(N, 1), 1), ep: nf(M.tradeExpectedRounds(N, q / 100), 1), q }));
  }
  sN.addEventListener('input', restart); sQ.addEventListener('input', restart);
  $('#trRestart').onclick = restart;
  $('#trStep').onclick = () => { for (let k = 0; k < 10 && s.round < M.TRADE_ROUNDS; k++) M.tradeRound(s, +sQ.value / 100); acc = 0; readout(); touch(o); };
  updaters.push(() => { if (s) readout(); });
  restart();
  return { state: () => s };
})();

/* ───────── ch2 · the banking system's balance sheet ───────── */
const ch2 = (() => {
  const cv = $('#bkCv'), cv2 = $('#bkCv2'), sK = $('#bkK'), sR = $('#bkRR');
  let s = M.bankInit(), mode = 'textbook', last = 'start', auto = false, autoAcc = 0, scale = 130;
  const disp = { R: s.R, L: s.L, D: s.D, B: s.B, E: s.E };
  const p = () => ({ k: +sK.value / 100, rr: +sR.value / 100, mode });
  const o = reg(cv, {
    step(dt) {
      if (auto) { autoAcc += dt; if (autoAcc >= 0.35) { autoAcc = 0; const r = M.bankLoan(s, p()); if (!r.ok) { auto = false; last = 'stop'; } else last = 'loan'; readout(); touch(o2); } }
      const k = reduce ? 1 : Math.min(1, dt * 7); let moving = false;
      for (const key in disp) { const d = s[key] - disp[key]; if (Math.abs(d) > 0.01) moving = true; disp[key] += d * k; }
      const tgt = Math.max(130, (s.R + s.L) * 1.12); scale += (tgt - scale) * k;
      if (moving || o.dirty) o.dirty = true;
    },
    draw() {
      const { c, w, h } = fit(cv), T = 30, B = h - 12, colW = Math.min(220, (w - 60) / 2), gapX = Math.min(70, w - 2 * colW - 20);
      const x0 = (w - 2 * colW - gapX) / 2, x1 = x0 + colW + gapX, H = v => (B - T) * v / scale;
      label(c, t('ch2.cv.assets'), x0 + colW / 2, 14, 'center', C.ink); label(c, t('ch2.cv.liab'), x1 + colW / 2, 14, 'center', C.ink);
      const stack = (x, segs) => {
        let y = B;
        for (const [key, v, col] of segs) {
          const hh = H(v); if (hh <= 0.2) continue; y -= hh;
          c.fillStyle = col; c.globalAlpha = 0.88; c.fillRect(x, y, colW, hh - 1); c.globalAlpha = 1;
          if (hh >= 20) { c.fillStyle = '#0c0e13'; c.textAlign = 'center'; c.font = '600 12px ' + FONT.slice(5); c.fillText(t('ch2.seg.' + key) + ' ' + nf(s[key]), x + colW / 2, y + hh / 2); c.font = FONT; }
        }
        return y;
      };
      stack(x0, [['R', disp.R, C.gold], ['L', disp.L, C.cyan]]);
      stack(x1, [['E', disp.E, C.green], ['B', disp.B, C.red], ['D', disp.D, C.violet]]);
      if (s.lastLoan) { // outline the newest loan and the deposit it created
        c.setLineDash([4, 3]); c.strokeStyle = C.ink; c.lineWidth = 1.5;
        const yl = B - H(disp.R + disp.L); c.strokeRect(x0 + 1, yl + 1, colW - 2, H(M.LOAN) - 2);
        const yd = B - H(disp.E + disp.B + disp.D); c.strokeRect(x1 + 1, yd + 1, colW - 2, H(M.LOAN) - 2); c.setLineDash([]);
      }
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(8, B + 0.5); c.lineTo(w - 8, B + 0.5); c.stroke();
    }
  });
  const o2 = reg(cv2, { draw() {
    const { c, w, h } = fit(cv2), L = 40, Rr = 14, T = 26, B = h - 26, hs = s.hist, n = Math.max(8, hs.length - 1);
    const tb = mode === 'textbook' ? M.textbookMaxDeposits(s, +sR.value / 100) : Infinity;
    const top = Math.max(...hs, 120) * 1.15, X = i => L + (w - L - Rr) * i / n, Y = v => B - (B - T) * v / top;
    axes(c, L, T - 4, w - Rr, B);
    [0, 100].forEach(v => { if (v <= top) label(c, String(v), L - 6, Y(v), 'right'); });
    label(c, t('ch2.cv2.y'), L + 6, 12, 'left'); label(c, t('ch2.cv2.x'), w - Rr, h - 9, 'right');
    if (tb < top) { c.setLineDash([5, 4]); c.strokeStyle = C.gold; c.beginPath(); c.moveTo(L, Y(tb)); c.lineTo(w - Rr, Y(tb)); c.stroke(); c.setLineDash([]); label(c, t('ch2.cv2.max', { v: nf(tb) }), w - Rr, Y(tb) - 9, 'right', C.gold); }
    c.beginPath(); hs.forEach((v, i) => { if (i) c.lineTo(X(i), Y(hs[i - 1])); c[i ? 'lineTo' : 'moveTo'](X(i), Y(v)); }); c.strokeStyle = C.violet; c.lineWidth = 2.5; c.stroke();
    c.fillStyle = C.violet; c.beginPath(); c.arc(X(hs.length - 1), Y(hs[hs.length - 1]), 4.5, 0, 6.283); c.fill();
  } });
  function readout() {
    const P = p();
    $('#bkKo').textContent = t('ch2.out.pct', { v: sK.value }); $('#bkRRo').textContent = t('ch2.out.pct', { v: sR.value });
    $('#bkModeT').setAttribute('aria-pressed', String(mode === 'textbook')); $('#bkModeC').setAttribute('aria-pressed', String(mode === 'today'));
    $('#bkD').textContent = nf(s.D); $('#bkCap').textContent = t('ch2.r.capv', { v: nf(s.E / s.L * 100, 1), k: sK.value });
    $('#bkRes').textContent = t('ch2.r.resv', { r: nf(s.R, 1), need: nf(P.rr * s.D, 1) }); $('#bkB').textContent = nf(s.B, 1);
    $('#bkRepay').disabled = s.L < 2 * M.LOAN; // keep at least one loan on the books
    let say;
    if (last === 'stop') {
      const why = M.bankCheck(s, P).reason || s.stop;
      say = why === 'reserves' ? t('ch2.say.stop.reserves', { mult: nf(1 / P.rr, 0), max: nf(M.textbookMaxDeposits(s, P.rr)) })
        : t('ch2.say.stop.capital', { k: sK.value, borrow: s.B > 0 ? t('ch2.say.borrowed', { b: nf(s.B, 1) }) : t('ch2.say.noborrow') });
    } else if (last === 'qe') say = t('ch2.say.qe', { max: P.rr > 0 ? nf(M.textbookMaxDeposits(s, P.rr)) : '∞' });
    else say = t('ch2.say.' + last);
    sayTo($('#bkSay'), say);
    touch(o); touch(o2);
  }
  const act = fn => () => { auto = false; fn(); readout(); };
  $('#bkLoan').onclick = act(() => { const r = M.bankLoan(s, p()); last = r.ok ? 'loan' : 'stop'; });
  $('#bkRepay').onclick = act(() => { if (s.L >= 2 * M.LOAN && M.bankRepay(s, p())) last = 'repay'; });
  $('#bkQE').onclick = act(() => { M.bankQE(s); last = 'qe'; });
  $('#bkLimit').onclick = () => { if (reduce) { M.bankLendToLimit(s, p()); last = 'stop'; readout(); } else { auto = true; autoAcc = 0.35; } };
  $('#bkReset').onclick = act(() => { s = M.bankInit(); last = 'start'; });
  $('#bkModeT').onclick = act(() => { mode = 'textbook'; if (last === 'stop') last = 'start'; });
  $('#bkModeC').onclick = act(() => { mode = 'today'; if (last === 'stop') last = 'start'; });
  [sK, sR].forEach(e => e.addEventListener('input', () => { if (last === 'stop') last = 'start'; readout(); }));
  updaters.push(readout); readout();
  return { state: () => s };
})();

/* ───────── ch3 · a bank run ───────── */
const ch3 = (() => {
  const cv = $('#runCv'), cv2 = $('#runCv2'), sRho = $('#runRho'), sLam = $('#runLam'), sS = $('#runS'), bIns = $('#runIns');
  let insured = false, sim, shown = 0, clock = 0; const STEP = 0.7;
  const p = () => ({ lam: +sLam.value / 100, s: +sS.value / 10, rho: +sRho.value / 100, insured });
  const o = reg(cv, {
    step(dt) {
      const total = sim.rounds.length; if (shown >= total) return;
      clock += dt; if (clock >= STEP) { clock = 0; shown++; o.dirty = true; touch(o2); readout(); }
    },
    draw() {
      const { c, w, h } = fit(cv), N = M.RUN.N, cols = w >= 560 ? 20 : 10, rowsN = N / cols;
      const cell = Math.min((w - 24) / cols, (h - 20) / rowsN), x0 = (w - cell * cols) / 2, y0 = (h - cell * rowsN) / 2, r = cell * 0.36;
      const done = shown >= sim.rounds.length;
      queue().forEach((d, k) => {
        const x = x0 + cell * (k % cols + 0.5), y = y0 + cell * (Math.floor(k / cols) + 0.5);
        const out = d.kind !== 'stay' && d.round < shown; // has reached the counter by now
        c.beginPath(); c.arc(x, y, r, 0, 6.283);
        if (out && done && k >= sim.paid) { c.strokeStyle = C.mute; c.lineWidth = 2; c.stroke(); return; } // came too late: nothing left
        c.fillStyle = !out ? C.gold : d.kind === 'need' ? C.cyan : d.kind === 'rumour' ? C.violet : C.red;
        c.globalAlpha = out ? 1 : 0.75; c.fill(); c.globalAlpha = 1;
      });
    }
  });
  const o2 = reg(cv2, { draw() {
    const { c, w, h } = fit(cv2), P = p(), L = 44, Rr = 14, T = 24, B = h - 30, ym = 1.6, X = f => L + (w - L - Rr) * f, Y = v => B - (B - T) * v / ym;
    axes(c, L, T - 6, w - Rr, B);
    label(c, '0', L - 6, Y(0), 'right'); label(c, t('ch3.cv.one'), L - 6, Y(1), 'right');
    c.setLineDash([4, 4]); c.strokeStyle = 'rgba(167,173,187,.55)'; c.beginPath(); c.moveTo(L, Y(1)); c.lineTo(w - Rr, Y(1)); c.stroke(); c.setLineDash([]);
    c.beginPath(); for (let i = 0; i <= 200; i++) { const f = i / 200 * 0.999, v = M.runV(f, P); c[i ? 'lineTo' : 'moveTo'](X(f), Y(Math.min(v, ym))); } c.strokeStyle = C.gold; c.lineWidth = 2.2; c.stroke();
    const thr = sim.threshold;
    if (thr < 0.999) { c.strokeStyle = C.red; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(thr), T - 4); c.lineTo(X(thr), B); c.stroke(); c.setLineDash([]); { const left = X(thr) > L + 70; label(c, t('ch3.cv.thr'), X(thr) + (left ? -6 : 6), B - 10, left ? 'right' : 'left', C.red); } }
    const f = sim.rounds[Math.max(0, shown - 1)], v = Math.min(M.runV(f, P), ym);
    c.fillStyle = C.ink; c.beginPath(); c.arc(X(f), Y(v), 5, 0, 6.283); c.fill();
    label(c, t('ch3.cv.x'), w - Rr, h - 9, 'right'); label(c, t('ch3.cv.y'), L + 6, 10, 'left');
  } });
  // arrival order: impatient, rumour, each cascade round, then those who stayed
  function queue() {
    const q = [];
    for (let i = 0; i < sim.impatient; i++) q.push({ kind: 'need', round: 0 });
    for (let i = 0; i < sim.rumour; i++) q.push({ kind: 'rumour', round: 0 });
    // cascade members joined in rounds 1.. in order; reconstruct counts per round from sim.rounds
    for (let r = 1; r < sim.rounds.length; r++) { const n = Math.round((sim.rounds[r] - sim.rounds[r - 1]) * M.RUN.N); for (let i = 0; i < n; i++) q.push({ kind: 'follow', round: r }); }
    while (q.length < M.RUN.N) q.push({ kind: 'stay', round: 0 });
    return q;
  }
  function recompute() { sim = M.runSim(p()); shown = reduce ? sim.rounds.length : 1; clock = 0; readout(); touch(o); touch(o2); }
  function readout() {
    const P = p(), nPat = M.RUN.N - Math.round(M.RUN.pi * M.RUN.N), done = shown >= sim.rounds.length;
    $('#runRhoO').textContent = t('ch3.out.rho', { p: nf(P.rho * 100, P.rho * 100 % 1 ? 2 : 0), n: Math.round(P.rho * nPat) });
    $('#runLamO').textContent = t('ch3.out.pct', { v: sLam.value }); $('#runSO').textContent = t('ch3.out.s', { v: sS.value, pct: +sS.value * 10 });
    bIns.setAttribute('aria-pressed', String(insured));
    const w = Math.round(sim.rounds[Math.max(0, shown - 1)] * M.RUN.N);
    $('#runW').textContent = t('ch3.r.people', { v: w });
    $('#runThr').textContent = sim.threshold >= 0.999 ? t('ch3.r.none') : t('ch3.r.pct', { v: nf(sim.threshold * 100, 1) });
    $('#runV').textContent = done ? t('ch3.r.yuan', { v: nf(sim.V, 2) }) : '…';
    $('#runU').textContent = done ? t('ch3.r.people', { v: sim.unpaid }) : '…';
    $('#runC').textContent = insured ? t('ch3.r.yuan', { v: nf(sim.insurerCost, 1) }) : t('ch3.r.none');
    $('#runSay').setAttribute('aria-busy', String(!done));
    if (!done) return;
    let say;
    if (insured) say = sim.failed ? t('ch3.say.insuredFail', { w: sim.withdrawn, cost: nf(sim.insurerCost, 1) }) : sim.insurerCost > 0.05 ? t('ch3.say.insuredPay', { w: sim.withdrawn, V: nf(sim.V, 2), cost: nf(sim.insurerCost, 1) }) : t('ch3.say.insured', { w: sim.withdrawn });
    else if (sim.cascade > 0 && sim.failed) say = t((sim.impatient + sim.rumour) / M.RUN.N >= sim.threshold ? 'ch3.say.runOver' : 'ch3.say.run', { r: sim.rumour, w0: sim.impatient + sim.rumour, thr: nf(sim.threshold * 100, 1), c: sim.cascade, paid: sim.paid, u: sim.unpaid });
    else if (sim.threshold >= 0.999) say = t('ch3.say.never');
    else say = t('ch3.say.calm', { w: sim.withdrawn, thr: nf(sim.threshold * 100, 1), V: nf(sim.V, 2) });
    sayTo($('#runSay'), say);
  }
  [sRho, sLam, sS].forEach(e => e.addEventListener('input', recompute));
  bIns.onclick = () => { insured = !insured; recompute(); };
  $('#runReplay').onclick = recompute;
  updaters.push(readout); recompute();
  return { sim: () => sim };
})();

/* ───────── ch4 · the quantity machine ───────── */
const ch4 = (() => {
  const cv = $('#qtCv'), sM = $('#qtM'), sV = $('#qtV'), YEARS = 30, PER = 0.5;
  let st, rows, acc = 0, shockNext = false, lastCat = '';
  const u = () => ({ gM: +sM.value / 100, gV: +sV.value / 100 });
  function reset() { st = M.qtmInit(); rows = st.rows; acc = 0; shockNext = false; if (reduce) finish(); readout(true); touch(o); }
  function stepYear() { const r = M.qtmStep(st, { ...u(), shock: shockNext }); shockNext = false; return r; }
  function finish() { while (st.t < YEARS) stepYear(); }
  const o = reg(cv, {
    step(dt) { if (st.t >= YEARS) return; acc += dt; if (acc >= PER) { acc = 0; stepYear(); o.dirty = true; readout(false); } },
    draw() {
      const { c, w, h } = fit(cv), L = 40, Rr = 14, T = 26, B = h - 36, x0 = -M.QTM.hist + 1, X = y => L + (w - L - Rr) * (y - x0) / (YEARS - x0);
      const vals = rows.flatMap(r => [r.gM, r.infl, r.gap].map(v => v * 100));
      const lo = Math.min(-4, Math.floor(Math.min(...vals) / 2) * 2), hi = Math.max(10, Math.ceil(Math.max(...vals) / 2) * 2), Y = v => B - (B - T) * (v - lo) / (hi - lo);
      const stp = hi - lo > 24 ? 8 : 4;
      for (let v = Math.ceil(lo / stp) * stp; v <= hi; v += stp) { c.strokeStyle = v === 0 ? 'rgba(167,173,187,.5)' : C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(w - Rr, Y(v)); c.stroke(); label(c, String(v), L - 6, Y(v), 'right'); }
      axes(c, L, T - 6, w - Rr, B);
      [0, 10, 20, 30].forEach(y => label(c, String(y), X(y), B + 13, 'center'));
      label(c, t('ch4.ax.x'), w - Rr, h - 9, 'right'); label(c, t('ch4.ax.y'), L + 6, 11, 'left');
      const line = (key, col, lw, stepped) => { c.beginPath(); rows.forEach((r, i) => { const x = X(r.t), y = Y(r[key] * 100); if (!i) c.moveTo(x, y); else { if (stepped) c.lineTo(x - (X(1) - X(0)) / 2, Y(rows[i - 1][key] * 100)), c.lineTo(x - (X(1) - X(0)) / 2, y); c.lineTo(x, y); } }); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); };
      line('gM', C.gold, 2, true); line('gap', C.cyan, 2.2); line('infl', C.red, 2.8);
      const sh = rows.filter(r => r.shock);
      sh.forEach(r => { c.fillStyle = C.red; c.beginPath(); c.moveTo(X(r.t), T + 6); c.lineTo(X(r.t) - 5, T - 2); c.lineTo(X(r.t) + 5, T - 2); c.fill(); });
      if (sh.length) { const r = sh[sh.length - 1], x = X(r.t); label(c, t('ch4.cv.shock'), x + (x > w - 70 ? -9 : 9), T + 2, x > w - 70 ? 'right' : 'left', C.red); }
      const cur = rows[rows.length - 1]; c.strokeStyle = 'rgba(235,232,224,.35)'; c.beginPath(); c.moveTo(X(cur.t), T); c.lineTo(X(cur.t), B); c.stroke();
    }
  });
  // Which sentence describes year r. Every branch's wording is true of the numbers it receives:
  // a sentence that says inflation is above the long-run level only fires when it is.
  function category(r, long) {
    const prev = rows[rows.length - 2];
    if (r.shock || (prev && prev.shock && r.t >= 1)) return 'shock';
    const lp = long * 100, ip = r.infl * 100, gp = r.gap * 100, calm = Math.abs(ip - lp) <= 0.4 && Math.abs(gp) <= 0.6;
    const shockAt = rows.filter(x => x.shock && x.t < r.t).map(x => x.t).pop();
    if (shockAt != null && !rows.some(x => x.t > shockAt + 1 && x.t <= r.t && Math.abs(x.infl * 100 - lp) <= 0.4 && Math.abs(x.gap * 100) <= 0.6))
    { const swung = rows.some(x => x.t > shockAt && x.t < r.t && x.gap * 100 > 0.6); // the first slump is the one that pushes prices back
      return gp < -0.6 && !swung ? 'after' : gp > 0.6 && !rows.some(x => x.t > shockAt && x.t < r.t && x.gap * 100 > 0.6 && rows.some(y => y.t > x.t && y.t < r.t && y.gap * 100 < -0.6)) ? 'afterHigh' : 'afterSmall'; } // until the economy has first settled after the shock
    if (r.t < 1) return 'flat';
    if (Math.abs(lp) < 0.3 && Math.abs(ip) < 0.4 && Math.abs(gp) < 0.4) return 'flat';
    if (calm) return lp > 0.4 ? 'settle' : 'settlePlain';
    if (gp > 0.6 && ip < lp - 0.3) return 'boom';
    const boomSeen = rows.some(x => x.t >= 1 && x.t < r.t && x.gap * 100 > 0.6);
    if (ip > lp + 0.4) return boomSeen ? 'over' : 'slow';
    if (ip < lp - 0.4 && gp < 0) return 'below';
    return gp > 0 ? 'catch' : 'wobble';
  }
  function readout(force) {
    const r = rows[rows.length - 1], P0 = rows.find(x => x.t === 0).P, long = M.qtmLongRun(u().gM, u().gV);
    $('#qtMo').textContent = t('ch4.out.pct', { v: nf(+sM.value, 1) }); $('#qtVo').textContent = t('ch4.out.pct', { v: sgn(+sV.value, 1) });
    $('#qtT').textContent = t('ch4.r.yearv', { v: r.t }); $('#qtI').textContent = t('ch4.r.pct', { v: nf(r.infl * 100, 1) });
    $('#qtG').textContent = t('ch4.r.pct', { v: sgn(r.gap * 100, 1) }); $('#qtBuy').textContent = t('ch4.r.buyv', { v: nf(100 * P0 / r.P, 1) });
    $('#qtL').textContent = t('ch4.r.pct', { v: nf(long * 100, 1) });
    const cat0 = category(r, long), say = $('#qtSay');
    const prev = rows[rows.length - 2], sr = r.shock ? r : (cat0 === 'shock' && prev && prev.shock ? prev : r); // the shock row, if the shock sentence is showing
    const cat = cat0;
    say.setAttribute('aria-busy', String(r.t < YEARS && !reduce)); // announce once the run has finished
    const q = cat === 'shock' ? sr : r;
    sayTo(say, t('ch4.say.' + cat, { t: q.t, gap: nf(Math.abs(q.gap * 100), 1), gapAbs: nf(Math.abs(q.gap * 100), 1), infl: nf(q.infl * 100, 1), long: nf(long * 100, 1) }));
    void force; lastCat = cat;
  }
  function onSlide() { if (st.t >= YEARS || reduce) { st = M.qtmInit(); rows = st.rows; acc = 0; if (reduce) finish(); } readout(true); touch(o); }
  sM.addEventListener('input', onSlide); sV.addEventListener('input', onSlide);
  $('#qtShock').onclick = () => {
    if (reduce || st.t >= YEARS) { // replay with a shock in year 10
      st = M.qtmInit(); rows = st.rows; while (st.t < YEARS) { shockNext = st.t + 1 === 10; stepYear(); } readout(true); touch(o); return;
    }
    shockNext = true;
  };
  $('#qtReset').onclick = reset;
  $('#qtFinish').onclick = () => { finish(); readout(true); touch(o); };
  updaters.push(() => readout(true));
  reset();
  return { longRun: () => M.qtmLongRun(u().gM, u().gV) };
})();

/* ───────── ch5 · winners and losers ───────── */
const ch5 = (() => {
  const cv = $('#wnCv'), sA = $('#wnA'), sE = $('#wnE'), sL = $('#wnL');
  let res;
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = 44, Rr = 16, T = 28, B = h - 36, X = y => L + (w - L - Rr) * y / M.WIN.years;
    const vs = res.rows.flatMap(r => [r.saver, r.plan, r.wage * 100]), lo = Math.min(80, Math.floor(Math.min(...vs) / 10) * 10), hi = Math.max(130, Math.ceil(Math.max(...vs) / 10) * 10);
    const Y = v => B - (B - T) * (v - lo) / (hi - lo);
    c.fillStyle = 'rgba(240,122,109,.08)'; c.fillRect(X(0), T, X(M.WIN.burst) - X(0), B - T);
    label(c, t('ch5.cv.burst'), X(M.WIN.burst / 2), T + 10, 'center', C.red);
    for (let v = lo; v <= hi; v += 10) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(w - Rr, Y(v)); c.stroke(); if ((v - lo) % 20 === 0) label(c, String(v), L - 6, Y(v), 'right'); }
    axes(c, L, T - 6, w - Rr, B);
    [0, 2, 4, 6, 8, 10].forEach(y => label(c, String(y), X(y), B + 13, 'center'));
    label(c, t('ch5.ax.x'), w - Rr, h - 9, 'right'); label(c, t('ch5.ax.y'), L - 30, 11, 'left');
    const line = (fn, col, lw, dash, Yf = Y) => { c.setLineDash(dash || []); c.beginPath(); res.rows.forEach((r, i) => c[i ? 'lineTo' : 'moveTo'](X(r.t), Yf(fn(r)))); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); c.setLineDash([]); };
    line(r => r.plan, C.mute, 1.6, [5, 4]); line(r => r.wage * 100, C.violet, 2.2); line(r => r.saver, C.gold, 2.8);
  } });
  function upd() {
    const a = +sA.value / 100, e = +sE.value / 100, lag = +sL.value; res = M.winPath({ a, e, lag });
    $('#wnAo').textContent = t('ch5.out.pct', { v: nf(+sA.value, 1) }); $('#wnEo').textContent = t('ch5.out.pct', { v: nf(+sE.value, 1) }); $('#wnLo').textContent = t('ch5.out.lag', { v: lag });
    $('#wnRate').textContent = t('ch5.r.pct', { v: nf(res.i * 100, 2) }); $('#wnSaver').textContent = t('ch5.r.yuan', { v: nf(res.saverEnd, 1) });
    $('#wnTr').textContent = t('ch5.r.yuan', { v: (res.transfer < -0.05 ? '−' : '') + nf(Math.abs(res.transfer), 1) });
    const months = res.wageLost * 12; $('#wnWage').textContent = t('ch5.r.wagev', { v: (months < -0.05 ? '−' : '') + nf(Math.abs(months), 1) });
    const wage = lag === 0 || Math.abs(months) < 0.05 ? t('ch5.say.wageNone') : months > 0 ? t('ch5.say.wageLag', { lag, m: nf(months, 1) }) : t('ch5.say.wageGain', { lag, m: nf(-months, 1) });
    sayTo($('#wnSay'), Math.abs(res.transfer) < 0.05 ? t('ch5.say.none', { plan: nf(res.planEnd, 1) })
      : res.transfer > 0 ? t('ch5.say.surprise', { saver: nf(res.saverEnd, 1), transfer: nf(res.transfer, 1), wage }) : t('ch5.say.deflation', { gain: nf(-res.transfer, 1), wage }));
    touch(o);
  }
  [sA, sE, sL].forEach(e => e.addEventListener('input', upd));
  $('#wnCh4').onclick = () => { sA.value = String(clamp(Math.round(ch4.longRun() * 200) / 2, 0, 20)); upd(); };
  updaters.push(upd); upd();
  return { expected: () => +sE.value };
})();

/* ───────── ch7 · amortisation ───────── */
(() => {
  const cv = $('#amCv'), sR = $('#amR'), sY = $('#amY'), sX = $('#amX'), sI = $('#amI'), P = 1e6;
  let a, base;
  // money amounts: zh counts in 万 (10,000 yuan); en in plain yuan rounded to the thousand / axes in thousands
  const big = x => lang === 'en' ? nf(Math.round(x / 1000) * 1000) : nf(x / 1e4, 1), AX = () => (lang === 'en' ? 10 : 1);
  const o = reg(cv, { draw() {
    const { c, w, h } = fit(cv), L = 40, Rr = 44, T = 28, B = h - 36, n = +sY.value, X = y => L + (w - L - Rr) * y / n;
    const maxPay = Math.max(...base.years.map(r => r.interest + r.principal), ...a.years.map(r => r.interest + r.principal)) / 1e4;
    const top = Math.ceil(maxPay * 1.25 / 2) * 2, Y = v => B - (B - T) * v / top, Y2 = v => B - (B - T) * v / 100;
    for (let v = 0; v <= top; v += Math.max(2, Math.round(top / 4 / 2) * 2)) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(w - Rr, Y(v)); c.stroke(); label(c, nf(v * AX()), L - 6, Y(v), 'right'); }
    [0, 50, 100].forEach(v => label(c, nf(v * AX()), w - Rr + 6, Y2(v), 'left'));
    axes(c, L, T - 6, w - Rr, B);
    const bw = (w - L - Rr) / n;
    a.years.forEach((r, i) => {
      const x = L + bw * i + bw * 0.12, ww = bw * 0.76, yi = Y(r.interest / 1e4), yp = Y((r.interest + r.principal) / 1e4);
      c.fillStyle = C.red; c.fillRect(x, yi, ww, B - yi); c.fillStyle = C.cyan; c.fillRect(x, yp, ww, yi - yp);
    });
    const bal = (yrs, col, lw, dash) => { c.setLineDash(dash || []); c.beginPath(); c.moveTo(X(0), Y2(100)); yrs.forEach(r => c.lineTo(X(r.year), Y2(r.balance / 1e4))); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); c.setLineDash([]); };
    if (+sX.value > 0) bal(base.years, 'rgba(235,232,224,.45)', 1.5, [4, 4]);
    bal(a.years, C.ink, 2.2);
    const ticks = n <= 10 ? [0, 5, 10] : n <= 20 ? [0, 5, 10, 15, 20] : [0, 10, 20, 30].filter(v => v <= n);
    ticks.forEach(y => label(c, String(y), X(y), B + 13, 'center'));
    label(c, t('ch7.ax.x'), w - Rr, h - 9, 'right'); label(c, t('ch7.ax.y'), L - 30, 11, 'left'); label(c, t('ch7.ax.y2'), w - 4, T - 14, 'right');
  } });
  function upd() {
    const p = { P, rate: +sR.value / 100, years: +sY.value, extra: +sX.value, infl: +sI.value / 100 };
    a = M.amortise(p); base = M.amortise({ ...p, extra: 0 });
    $('#amRo').textContent = t('ch7.out.pct', { v: nf(+sR.value, 2) }); $('#amYo').textContent = t('ch7.out.years', { v: sY.value });
    $('#amXo').textContent = t('ch7.out.yuan', { v: nf(+sX.value) }); $('#amIo').textContent = t('ch7.out.pct', { v: nf(+sI.value, 1) });
    $('#amM').textContent = t('ch7.r.yuan', { v: nf(a.M) }); $('#amFirst').textContent = t('ch7.r.pct', { v: nf(a.firstInterestShare * 100, 1) });
    $('#amTot').textContent = t('ch7.r.wan', { v: big(a.totInt) });
    const yrs = (base.months - a.months) / 12;
    $('#amSaved').textContent = +sX.value > 0 ? t('ch7.r.savedv', { y: nf(yrs, 1), s: big(base.totInt - a.totInt) }) : t('ch7.r.savednone');
    $('#amReal').textContent = t('ch7.r.yuan', { v: nf(a.lastReal) });
    const early = M.amortiseEarlyInterestShare(p, Math.min(60, p.years * 12));
    sayTo($('#amSay'), t('ch7.say', { early: nf(early * 100, 1), extra: +sX.value > 0 ? t('ch7.say.extra', { x: nf(+sX.value), y: nf(yrs, 1) }) : t('ch7.say.noextra') }));
    touch(o);
  }
  [sR, sY, sX, sI].forEach(e => e.addEventListener('input', upd));
  $('#amCh5').onclick = () => { sI.value = String(ch5.expected()); upd(); };
  updaters.push(upd); upd();
})();

/* ───────── ch8 · transmission ───────── */
(() => {
  const cv = $('#tmCv'), sD = $('#tmD'), sV = $('#tmV'), sF = $('#tmF'), RATE = 4;
  let res, cur = 0;
  const o = reg(cv, {
    step(dt) { if (cur >= M.TR.months) return; cur = Math.min(M.TR.months, cur + dt * RATE); o.dirty = true; readout(false); },
    draw() {
      const { c, w, h } = fit(cv), L = 14, Rr = 14, T = 8, B = h - 34, gap = 10, laneH = (B - T - gap * 3) / 4, X = m => L + (w - L - Rr) * m / M.TR.months;
      const rows = res.rows, d = +sD.value;
      const lanes = [
        { key: 'ch8.lane.rate', series: [['policy', C.gold, true], ['market', C.cyan]], lo: 0, hi: d * 1.15 },
        { key: 'ch8.lane.mort', series: [['newRate', C.cyan], ['paid', C.gold]], lo: 0, hi: d * 1.15 },
        { key: 'ch8.lane.spend', series: [['spend', C.violet]], lo: Math.min(...rows.map(r => r.spend)) * 1.2, hi: 0 },
        { key: 'ch8.lane.infl', series: [['infl', C.red]], lo: Math.min(...rows.map(r => r.infl)) * 1.2, hi: 0 }];
      lanes.forEach((ln, k) => {
        const y0 = T + k * (laneH + gap), y1 = y0 + laneH, lo = Math.min(ln.lo, -1e-6), hi = Math.max(ln.hi, 1e-6), Y = v => y1 - 4 - (y1 - y0 - 24) * (v - lo) / (hi - lo);
        c.fillStyle = 'rgba(26,31,43,.7)'; c.fillRect(L, y0, w - L - Rr, laneH);
        c.strokeStyle = 'rgba(167,173,187,.35)'; c.beginPath(); c.moveTo(L, Y(0)); c.lineTo(w - Rr, Y(0)); c.stroke();
        label(c, t(ln.key), L + 6, y0 + 9, 'left', C.mute);
        ln.series.forEach(([key, col, stepped]) => {
          const path = upto => { c.beginPath(); rows.forEach((r, i) => { if (r.t > upto) return; const x = X(r.t), y = Y(r[key]); if (!i) c.moveTo(x, y); else { if (stepped) c.lineTo(x, Y(rows[i - 1][key])); c.lineTo(x, y); } }); };
          path(M.TR.months); c.strokeStyle = col; c.globalAlpha = 0.25; c.lineWidth = 1.5; c.stroke(); c.globalAlpha = 1;
          path(cur); c.lineWidth = 2.4; c.stroke();
        });
      });
      c.strokeStyle = 'rgba(235,232,224,.5)'; c.beginPath(); c.moveTo(X(cur), T); c.lineTo(X(cur), B); c.stroke();
      [0, 12, 24, 36, 48].forEach(m => label(c, String(m), clamp(X(m), L + 6, w - Rr - 8), B + 12, 'center'));
      label(c, t('ch8.ax.x'), w - Rr, h - 8, 'right');
    }
  });
  function readout(force) {
    const r = res.at(Math.floor(cur)), d = +sD.value;
    $('#tmDo').textContent = t('ch8.out.pp', { v: nf(d, 2) }); $('#tmVo').textContent = t('ch8.out.pct', { v: sV.value }); $('#tmFo').textContent = t('ch8.out.years', { v: sF.value });
    $('#tmT').textContent = t('ch8.r.monthv', { v: r.t }); $('#tmPaid').textContent = t('ch8.r.pp', { v: sgn(r.paid, 2) });
    $('#tmSpend').textContent = t('ch8.r.pct', { v: sgn(r.spend, 2) }); $('#tmInfl').textContent = t('ch8.r.pp', { v: sgn(r.infl, 2) });
    $('#tmPeak').textContent = t('ch8.r.peakv', { m: res.peakInflMonth, v: sgn(res.peakInfl, 2) });
    $('#tmSay').setAttribute('aria-busy', String(cur < M.TR.months));
    if (force || cur >= M.TR.months) sayTo($('#tmSay'), t('ch8.say', { t: 12, paid: nf(res.at(12).paid, 2), d: nf(d, 2), sm: res.peakSpendMonth, im: res.peakInflMonth }));
  }
  function upd() { res = M.transmit({ d: +sD.value, v: +sV.value / 100, F: +sF.value }); cur = reduce ? M.TR.months : 0; readout(true); touch(o); }
  [sD, sV, sF].forEach(e => e.addEventListener('input', upd));
  $('#tmReplay').onclick = upd;
  updaters.push(() => readout(true)); upd();
})();

/* ───────── ch9 · exchange rates ───────── */
(() => {
  const cv = $('#fxCv'), sPi = $('#fxPi'), sH = $('#fxH'), RATE = 1.5;
  let cur = 0, shocks = [];
  const p = () => ({ piH: +sPi.value / 100, H: +sH.value, shocks });
  const o = reg(cv, {
    step(dt) { if (cur >= M.FX.years) return; cur = Math.min(M.FX.years, cur + dt * RATE); o.dirty = true; readout(false); },
    draw() {
      const { c, w, h } = fit(cv), L = 40, Rr = 14, T = 26, B = h - 36, Yr = M.FX.years, X = y => L + (w - L - Rr) * y / Yr, P = p();
      const pts = []; for (let i = 0; i <= 240; i++) pts.push(M.fxAt(i / 12, P));
      const vs = pts.flatMap(q => [q.E, q.ppp]), lo = Math.max(0, Math.floor(Math.min(...vs) - 0.5)), hi = Math.ceil(Math.max(...vs) + 0.5), Y = v => B - (B - T) * (v - lo) / (hi - lo);
      const stp = hi - lo > 12 ? 4 : hi - lo > 6 ? 2 : 1;
      for (let v = Math.ceil(lo / stp) * stp; v <= hi; v += stp) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(w - Rr, Y(v)); c.stroke(); label(c, String(v), L - 6, Y(v), 'right'); }
      axes(c, L, T - 6, w - Rr, B);
      [0, 5, 10, 15, 20].forEach(y => label(c, String(y), X(y), B + 13, 'center'));
      label(c, t('ch9.ax.x'), w - Rr, h - 9, 'right'); label(c, t('ch9.ax.y'), L + 6, 11, 'left');
      c.setLineDash([6, 5]); c.beginPath(); pts.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](X(q.t), Y(q.ppp))); c.strokeStyle = C.cyan; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
      c.beginPath(); pts.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](X(q.t), Y(q.E))); c.strokeStyle = C.gold; c.globalAlpha = 0.25; c.lineWidth = 1.5; c.stroke(); c.globalAlpha = 1;
      c.beginPath(); pts.filter(q => q.t <= cur + 1e-9).forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](X(q.t), Y(q.E))); c.lineWidth = 2.8; c.stroke();
      const q = M.fxAt(cur, P); c.fillStyle = C.gold; c.beginPath(); c.arc(X(cur), Y(q.E), 5, 0, 6.283); c.fill();
    }
  });
  function readout(force) {
    const q = M.fxAt(cur, p()), yr = Math.floor(cur + 1e-9);
    $('#fxPio').textContent = t('ch9.out.pct', { v: nf(+sPi.value, 1) }); $('#fxHo').textContent = t('ch9.out.years', { v: nf(+sH.value, 1) });
    $('#fxT').textContent = t('ch9.r.yearv', { v: nf(cur, 1) }); $('#fxE').textContent = t('ch9.r.yuan', { v: nf(q.E, 2) }); $('#fxP').textContent = t('ch9.r.yuan', { v: nf(q.ppp, 2) });
    $('#fxHome').textContent = t('ch9.r.yuan', { v: nf(q.home, 1) }); $('#fxAbroad').textContent = t('ch9.r.yuan', { v: nf(q.abroadInYuan, 1) });
    const pc = q.dear * 100, cat = Math.abs(pc) < 3 ? 'par' : pc > 0 ? 'dear' : 'cheap', say = $('#fxSay');
    say.setAttribute('aria-busy', String(cur < M.FX.years)); void force;
    sayTo(say, t('ch9.say.' + cat, { t: yr, p: nf(Math.abs(pc), 0) }));
  }
  function replay() { shocks = []; cur = reduce ? M.FX.years : 0; readout(true); touch(o); }
  const shock = dq => { const at = reduce || cur >= M.FX.years ? 8 : cur; if (reduce || cur >= M.FX.years) cur = reduce ? M.FX.years : at; shocks.push({ t: at, dq }); readout(true); touch(o); };
  $('#fxUp').onclick = () => shock(Math.log(1.2)); $('#fxDown').onclick = () => shock(-Math.log(1.2));
  $('#fxReplay').onclick = replay;
  $('#fxCh4').onclick = () => { sPi.value = String(clamp(Math.round(ch4.longRun() * 200) / 2, 0, 12)); readout(true); touch(o); };
  [sPi, sH].forEach(e => e.addEventListener('input', () => { readout(true); touch(o); }));
  updaters.push(() => readout(true)); replay();
})();

/* ───────── language toggle, progress bar, loop ───────── */
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { storeLang(b.dataset.lang); applyLang(b.dataset.lang); }));
const first = storedLang() || ((navigator.language || 'zh').toLowerCase().startsWith('zh') ? 'zh' : 'en');
applyLang(first === 'en' ? 'en' : 'zh');
const bar = $('#bar');
window.addEventListener('scroll', () => { const d = document.documentElement; bar.style.width = (d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight) * 100) + '%'; }, { passive: true });
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  for (const s of sims) { if (!s.vis) continue; if (s.step) s.step(dt); if (s.dirty) { s.dirty = false; s.draw(); } }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essay = { ch1, ch2, ch3, ch4, ch5, lang: () => lang };
window.__ready = true;
})();
