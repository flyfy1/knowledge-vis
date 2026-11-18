/* Why notes sound good together: wiring, drawing, sound, i18n and on-screen gating.
 * All visible text comes from copy.*.js. Sound: Web Audio, synthesised sine partials only; the AudioContext is
 * created on the first press of a play button (a user gesture), never earlier, and never while muted.
 * Every sound has a visual twin that works with the sound off. */
(() => {
'use strict';
const M = window.MusicModels;
const COPY = window.ESSAY_COPY || {};
const $ = s => document.querySelector(s);
const C = { bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0', mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb', dimfill: '#3a4254' };
const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = M.clamp;

/* ───────── language ───────── */
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
function t(key, vars) {
  let s = (COPY[lang] && COPY[lang][key] != null) ? COPY[lang][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
const effLang = () => (COPY[lang] ? lang : 'zh');
function fmt(x, d = 0) {
  if (!isFinite(x)) return '—';
  const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
// signed, with a true minus sign; zero has no sign
function fmtS(x, d = 2) { const s = fmt(Math.abs(x), d); if (+s.replace(/,/g, '') === 0) return s; return (x > 0 ? '+' : '−') + s; }
const IVKEY = { 1: 'iv.m2', 2: 'iv.M2', 3: 'iv.m3', 4: 'iv.M3', 5: 'iv.p4', 6: 'iv.tt', 7: 'iv.p5', 8: 'iv.m6', 9: 'iv.M6', 10: 'iv.m7', 11: 'iv.M7', 12: 'iv.p8' };

const langHooks = [];
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  document.querySelectorAll('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langHooks.forEach(f => f());
  sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
}
document.querySelectorAll('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

/* ───────── canvas + sim registry ───────── */
function fit(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
  c.clearRect(0, 0, r.width, r.height);
  return { c, w: r.width, h: r.height };
}
const sims = [];
const io = new IntersectionObserver(es => es.forEach(e => { for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; } }), { rootMargin: '60px' });
function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
const radios = name => [...document.querySelectorAll(`input[name=${name}]`)];
const radioVal = name => radios(name).find(r => r.checked).value;
const put = (sel, s) => { const e = $(sel); if (e.textContent !== s) e.textContent = s; };
const putHTML = (sel, s) => { const e = $(sel); if (e.__h !== s) { e.innerHTML = s; e.__h = s; } };

function frame(w, h, m, x0, x1, y0, y1) {
  const L = m[3], R = w - m[1], T = m[0], B = h - m[2];
  return { L, R, T, B, X: x => L + (R - L) * (x - x0) / (x1 - x0), Y: y => B - (B - T) * (y - y0) / (y1 - y0) };
}
function axes(c, f, xLab, yLab) {
  c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.T); c.lineTo(f.L, f.B); c.lineTo(f.R, f.B); c.stroke();
  c.fillStyle = C.mute; c.font = FONT;
  if (yLab) { c.textAlign = 'left'; c.fillText(yLab, f.L + 6, f.T - 12); }
  if (xLab) { c.textAlign = 'right'; c.fillText(xLab, f.R, f.B + 26); }
}
function xTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'center';
  vals.forEach(v => { const x = f.X(v); c.fillText(fmtv(v), x, f.B + 11); c.strokeStyle = C.line; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.B + 3); c.stroke(); });
}
function yTicks(c, f, vals, fmtv) {
  c.fillStyle = C.mute; c.textAlign = 'right';
  vals.forEach(v => { const y = f.Y(v); c.fillText(fmtv(v), f.L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(f.L + 1, y); c.lineTo(f.R, y); c.stroke(); });
}
function path(c, pts, X, Y, col, lw = 2.2) { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1]))); c.stroke(); }
function dot(c, x, y, col, r = 4.5) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function vline(c, x, y0, y1, col, dash) { c.strokeStyle = col; c.lineWidth = 1.4; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); c.setLineDash([]); }

/* ───────── sound ───────── */
// A tone is a list of partials [{f (Hz), a}]. Players own a schedule of segments [{at, dur, tones}].
const AU = (() => {
  let ctx = null, master = null, muted = false, vol = 0.6;
  const players = [];
  const level = () => (muted ? 0 : vol * vol * 0.9);
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = level(); master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function voice(tones, t0, t1) {
    const sum = tones.reduce((s, x) => s + Math.abs(x.a), 0) || 1;
    const env = ctx.createGain(), att = Math.min(0.04, (t1 - t0) / 4), rel = Math.min(0.15, (t1 - t0) / 3);
    env.gain.setValueAtTime(0, t0); env.gain.linearRampToValueAtTime(1, t0 + att);
    env.gain.setValueAtTime(1, t1 - rel); env.gain.linearRampToValueAtTime(0, t1);
    env.connect(master);
    const oscs = tones.filter(x => x.f < 18000).map(x => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = x.f; g.gain.value = 0.3 * Math.abs(x.a) / sum;
      o.connect(g); g.connect(env); o.start(t0); o.stop(t1 + 0.05); return { o, g };
    });
    return { env, oscs, sum, t1 };
  }
  function kill(v) {
    const now = ctx.currentTime;
    try { v.env.gain.cancelScheduledValues(now); v.env.gain.setValueAtTime(v.env.gain.value, now); v.env.gain.linearRampToValueAtTime(0, now + 0.04); } catch (e) { /* already stopped */ }
    v.oscs.forEach(x => { try { x.o.stop(now + 0.06); } catch (e) { /* already stopped */ } });
  }
  function player(id, btn, fig, o) {
    const p = { id, btn, fig, o, playing: false, t0: 0, voices: [], total: 0 };
    p.elapsed = () => (p.playing ? (performance.now() - p.t0) / 1000 : 0);
    p.schedule = () => {
      if (muted || !ensure()) return;
      const segs = o.segments(), off = p.elapsed(), base = ctx.currentTime + 0.03;
      for (const s of segs) {
        const a = s.at - off, b = s.at + s.dur - off;
        if (b <= 0.05) continue;
        p.voices.push(voice(s.tones, base + Math.max(0, a), base + b));
      }
    };
    p.start = () => {
      players.forEach(q => { if (q !== p && q.playing) q.stop(); });
      p.playing = true; p.t0 = performance.now(); p.voices = [];
      p.total = Math.max(...o.segments().map(s => s.at + s.dur));
      p.schedule(); p.ui(); if (o.onChange) o.onChange();
    };
    p.stop = () => {
      if (ctx) p.voices.forEach(kill);
      p.voices = []; p.playing = false; p.ui(); if (o.onChange) o.onChange();
    };
    // live retune: a single sustained segment follows the controls while it plays
    p.refresh = () => {
      if (!p.playing || !ctx || muted || !p.voices.length) return;
      const tones = o.segments()[0].tones, v = p.voices[0], now = ctx.currentTime;
      if (v.oscs.length === tones.filter(x => x.f < 18000).length) {
        const sum = tones.reduce((s, x) => s + Math.abs(x.a), 0) || 1;
        tones.filter(x => x.f < 18000).forEach((x, i) => { v.oscs[i].o.frequency.setTargetAtTime(x.f, now, 0.015); v.oscs[i].g.gain.setTargetAtTime(0.3 * Math.abs(x.a) / sum, now, 0.015); });
      } else { kill(v); p.voices = [voice(tones, now + 0.01, Math.max(now + 0.2, v.t1))]; }
    };
    p.ui = () => {
      btn.setAttribute('aria-pressed', String(p.playing));
      btn.textContent = p.playing ? t(muted ? 'audio.stopMuted' : 'audio.stop') : t(o.label);
      if (fig) fig.dataset.playing = p.playing ? '1' : '0';
    };
    p.tick = () => { if (p.playing && p.elapsed() >= p.total) p.stop(); if (o.onTick) o.onTick(); };
    btn.addEventListener('click', () => (p.playing ? p.stop() : p.start()));
    players.push(p); p.ui();
    return p;
  }
  function setMuted(m) {
    muted = m;
    if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(level(), ctx.currentTime, 0.02); }
    // unmuting during a silent (visual-only) playback: start its sound for the time that is left
    if (!muted) players.forEach(p => { if (p.playing && !p.voices.length) p.schedule(); });
    players.forEach(p => p.ui());
    syncUI();
  }
  function setVol(v) { vol = v; if (ctx) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.02); }
  function syncUI() { const b = $('#muteBtn'); b.setAttribute('aria-pressed', String(muted)); b.textContent = t(muted ? 'audio.muted' : 'audio.on'); }
  $('#muteBtn').addEventListener('click', () => setMuted(!muted));
  $('#vol').addEventListener('input', e => setVol(+e.target.value / 100));
  langHooks.push(() => { syncUI(); players.forEach(p => p.ui()); });
  // test hook: read-only view of the audio state
  window.__audioState = () => ({ ctx: !!ctx, state: ctx ? ctx.state : null, muted, gain: master ? master.gain.value : null, target: level(), playing: players.filter(p => p.playing).map(p => p.id), voices: players.reduce((s, p) => s + p.voices.length, 0) });
  return { player, players, tick: () => players.forEach(p => p.tick()) };
})();
const harmTone = (f0, n = 6, fall = 0.88) => { const out = []; for (let k = 1; k <= n; k++) out.push({ f: f0 * k, a: Math.pow(fall, k - 1) }); return out; };
const specTone = (spec, f0) => spec.map(p => ({ f: f0 * p.r, a: p.a }));

/* ───────── 01 a note is a stack of harmonics ───────── */
(() => {
  const cvS = $('#hsSpec'), cvW = $('#hsWave'), P = M.pluck, F0 = M.C3, NMAX = 16;
  const sN = $('#hsN'), sP = $('#hsP'), cD = $('#hsDrop');
  const st = () => { const N = +sN.value, beta = +sP.value / 24, drop = cD.checked; const amps = P.amps(N, beta, drop), act = P.active(N, beta, drop); return { N, beta, drop, amps, act, rate: P.repeatRate(F0, act), gone: P.silenced(N, beta) }; };
  const frac = p => { const g = M.gcd(p, 24); return (p / g) + '/' + (24 / g); };
  let S = st();
  const pl = AU.player('ch1', $('#hsPlay'), $('#fig1'), { label: 'ch1.btn.play', segments: () => [{ at: 0, dur: 6, tones: S.act.map(n => ({ f: n * F0, a: S.amps[n - 1] })) }], onChange: () => { sim.dirty = true; } });
  const sim = reg([cvS, cvW], {
    step() { if (pl.playing && !reduce) this.dirty = true; },
    draw() {
      { // spectrum
        const { c, w, h } = fit(cvS), f = frame(w, h, [28, 12, 38, 40], 0.4, NMAX + 0.6, 0, 1.05);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v, 1)); axes(c, f, t('ch1.cv.x'), t('ch1.cv.y'));
        const narrow = w < 460, bw = Math.max(3, (f.R - f.L) / NMAX * 0.55);
        xTicks(c, f, Array.from({ length: NMAX }, (_, i) => i + 1).filter(n => !narrow || n % 2 === 1 || n === NMAX), v => fmt(v));
        for (let n = 1; n <= NMAX; n++) {
          const x = f.X(n);
          if (n > S.N) { c.strokeStyle = C.grid; c.strokeRect(x - bw / 2, f.Y(0.12), bw, f.Y(0) - f.Y(0.12)); continue; }
          const a = Math.abs(S.amps[n - 1]);
          if (a < 1e-6) { // silenced: a red cross on the axis
            c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 4, f.B - 10); c.lineTo(x + 4, f.B - 2); c.moveTo(x + 4, f.B - 10); c.lineTo(x - 4, f.B - 2); c.stroke(); continue;
          }
          c.fillStyle = n === 1 ? C.gold : C.cyan; c.fillRect(x - bw / 2, f.Y(a), bw, f.Y(0) - f.Y(a));
        }
      }
      { // waveform: three periods of the fundamental, dashed lines where it repeats
        const { c, w, h } = fit(cvW), span = 3 / F0, f = frame(w, h, [14, 12, 30, 40], 0, span * 1000, -1.1, 1.1);
        axes(c, f, t('ch1.cv.t'), '');
        xTicks(c, f, [0, 10, 20], v => fmt(v));
        if (S.rate > 0) for (let k = 0; k * 1000 / S.rate <= span * 1000 + 1e-9; k++) vline(c, f.X(k * 1000 / S.rate), f.T, f.B, C.gold, [3, 4]);
        const pts = []; let mx = 1e-9; const n = Math.max(200, Math.round((f.R - f.L) * 1.5));
        for (let i = 0; i <= n; i++) { const tt = span * i / n, y = P.wave(S.amps, F0, tt); pts.push([tt * 1000, y]); mx = Math.max(mx, Math.abs(y)); }
        if (S.act.length) path(c, pts.map(q => [q[0], q[1] / mx]), f.X, f.Y, C.cyan, 1.8);
        if (pl.playing && !reduce) vline(c, f.X((pl.elapsed() * 1000 * 0.004) % (span * 1000)), f.T, f.B, C.ink);
      }
    }
  });
  function text() {
    put('#hsNo', fmt(S.N)); put('#hsPo', t('ch1.unit.pos', { frac: frac(+sP.value), pct: fmt(S.beta * 100) }));
    put('#hsRate', S.rate ? t('u.hz', { v: fmt(S.rate, 2) }) : '—'); put('#hsPer', S.rate ? t('u.ms', { v: fmt(1000 / S.rate, 2) }) : '—');
    put('#hsCount', fmt(S.act.length)); put('#hsGone', S.gone.length ? S.gone.join(t('list.sep')) : '—');
    const g = S.act.length ? S.act.reduce(M.gcd) : 0;
    const key = M.say.ch1(S.act, S.drop, S.gone);
    putHTML('#hsSay', t(key, { g: fmt(g), rate: fmt(S.rate, 2), per: S.rate ? fmt(1000 / S.rate, 2) : '—', f0: fmt(F0, 2), frac: frac(+sP.value), list: S.gone.join(t('list.sep')), n: fmt(S.act.length) }));
  }
  sim.text = text;
  const redo = () => { S = st(); sim.dirty = true; text(); pl.refresh(); };
  [sN, sP].forEach(e => e.addEventListener('input', redo)); cD.addEventListener('change', redo);
  text();
})();

/* ───────── 02 simple ratios share harmonics ───────── */
(() => {
  const cv = $('#cbCv'), F1 = M.C4, H = 10, sD = $('#cbD');
  const st = () => {
    const [p, q] = radioVal('cbIv').split('/').map(Number), det = +sD.value, r = p / q * M.fromCents(det);
    const pairs = M.combs.pairs(F1, r, H, 200), pk = M.rough.peakValue();
    const hits = pairs.filter(x => x.beat < 0.05), clashes = pairs.filter(x => x.beat >= 0.05 && M.rough.pair(x.n * F1, x.m * F1 * r) / pk > 0.25);
    const near = pairs.filter(x => x.beat >= 0.05 && x.beat <= 30)[0];
    const closest = M.combs.pairs(F1, r, H, Infinity).filter(x => x.beat >= 0.05).sort((a, b) => a.beat - b.beat)[0];
    return { p, q, det, r, pairs, hits, clashes, near, closest, exact: M.combs.sharedExact(p, q, H) };
  };
  let S = st();
  const pl = AU.player('ch2', $('#cbPlay'), $('#fig2'), { label: 'ch2.btn.play', segments: () => [{ at: 0, dur: 5, tones: harmTone(F1, 8).concat(harmTone(F1 * S.r, 8)) }] });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), fMax = 10.6 * F1, f = frame(w, h, [26, 14, 38, 64], 0, fMax, 0, 1);
      axes(c, f, t('ch2.cv.x'), '');
      xTicks(c, f, [0, 1000, 2000].filter(v => v < fMax), v => fmt(v));
      const mid = (f.T + f.B) / 2, len = (f.B - f.T) / 2 - 8;
      c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(t('ch2.cv.upper'), f.L - 6, f.T + len / 2); c.fillText(t('ch2.cv.lower'), f.L - 6, f.B - len / 2);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(f.L, mid); c.lineTo(f.R, mid); c.stroke();
      // connections first, under the spikes
      for (const x of S.clashes) { const xa = f.X(x.n * F1), xb = f.X(x.m * F1 * S.r); if (xb > f.R) continue; c.strokeStyle = 'rgba(240,122,109,.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, mid + 3); c.lineTo(xb, mid - 3); c.stroke(); }
      for (const x of S.hits) { const xa = f.X(x.n * F1); c.fillStyle = 'rgba(233,185,73,.22)'; c.fillRect(xa - 5, f.T + 4, 10, f.B - f.T - 8); }
      for (let n = 1; n <= H; n++) { const x = f.X(n * F1), a = Math.pow(0.88, n - 1); c.strokeStyle = C.cyan; c.lineWidth = 3; c.beginPath(); c.moveTo(x, mid + 4); c.lineTo(x, mid + 4 + len * a); c.stroke(); }
      for (let m = 1; m <= H; m++) { const fr = m * F1 * S.r; if (fr > fMax) break; const x = f.X(fr), a = Math.pow(0.88, m - 1); c.strokeStyle = C.violet; c.lineWidth = 3; c.beginPath(); c.moveTo(x, mid - 4); c.lineTo(x, mid - 4 - len * a); c.stroke(); }
    }
  });
  function text() {
    put('#cbDo', t('u.cents', { v: fmtS(S.det, 0) }));
    put('#cbRatio', t('ch2.unit.ratio', { p: S.p, q: S.q, c: fmt(M.cents(S.r), 0) }));
    put('#cbShared', fmt(S.hits.length)); put('#cbClash', fmt(S.clashes.length));
    put('#cbBeat', S.near ? t('u.perSec', { v: fmt(S.near.beat, 1) }) : '—');
    const key = M.say.ch2(S.exact, S.det);
    const v = { p: S.p, q: S.q, n: fmt(S.exact), H: fmt(H), k: fmt(S.clashes.length), d: fmt(S.closest.beat, 1), a: S.closest.n, b: S.closest.m, beat: fmt(M.edo.beat(F1, S.r, S.p, S.q), 1) };
    putHTML('#cbSay', t(key, v));
  }
  sim.text = text;
  const redo = () => { S = st(); sim.dirty = true; text(); pl.refresh(); };
  sD.addEventListener('input', redo); radios('cbIv').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 03 beats and roughness ───────── */
(() => {
  const cvW = $('#btWave'), cvC = $('#btCurve'), R = M.rough, sF = $('#btF'), sD = $('#btD'), DMAX = 100;
  const st = () => { const f = 110 * Math.pow(2, +sF.value / 12), d = +sD.value; const pk = R.peakValue(); return { f, d, rough: R.pair(f, f + d) / pk, dStar: R.peakDelta(f) }; };
  let S = st();
  const pl = AU.player('ch3', $('#btPlay'), $('#fig3'), { label: 'ch3.btn.play', segments: () => [{ at: 0, dur: 6, tones: [{ f: S.f, a: 1 }, { f: S.f + S.d, a: 1 }] }], onChange: () => { sim.dirty = true; } });
  const sim = reg([cvW, cvC], {
    step() { if (pl.playing && !reduce) this.dirty = true; },
    draw() {
      { // the sum of the two tones: its envelope |2cos(πΔt)| swells Δ times a second
        const { c, w, h } = fit(cvW), span = S.d > 0 ? clamp(3 / S.d, 0.03, 1) : 0.25, f = frame(w, h, [12, 12, 30, 40], 0, span * 1000, -2.2, 2.2);
        axes(c, f, t('ch3.cv.t'), '');
        const tk = span >= 0.5 ? 250 : span >= 0.2 ? 100 : span >= 0.08 ? 20 : 10, ticks = []; for (let v = 0; v <= span * 1000 * 0.9; v += tk) ticks.push(v);
        xTicks(c, f, ticks, v => fmt(v));
        const n = Math.round(f.R - f.L), up = [], dn = [];
        for (let i = 0; i <= n; i++) { const tt = span * i / n, e = Math.abs(2 * Math.cos(Math.PI * S.d * tt)); up.push([tt * 1000, e]); dn.push([tt * 1000, -e]); }
        c.fillStyle = 'rgba(99,199,230,.28)'; c.beginPath(); up.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](f.X(q[0]), f.Y(q[1]))); for (let i = dn.length - 1; i >= 0; i--) c.lineTo(f.X(dn[i][0]), f.Y(dn[i][1])); c.closePath(); c.fill();
        path(c, up, f.X, f.Y, C.cyan, 1.6); path(c, dn, f.X, f.Y, C.cyan, 1.6);
        if (pl.playing && !reduce) vline(c, f.X((pl.elapsed() % span) * 1000), f.T, f.B, C.ink);
      }
      { // roughness of two pure tones against their difference
        const { c, w, h } = fit(cvC), f = frame(w, h, [28, 14, 38, 44], 0, DMAX, 0, 1.08);
        yTicks(c, f, [0, 0.5, 1], v => fmt(v * 100) + '%'); axes(c, f, t('ch3.cv.x'), t('ch3.cv.y'));
        xTicks(c, f, [0, 20, 40, 60, 80], v => fmt(v));
        const pk = R.peakValue(), pts = []; for (let d = 0; d <= DMAX; d += 0.5) pts.push([d, R.pair(S.f, S.f + d) / pk]);
        vline(c, f.X(S.dStar), f.T, f.B, C.gold, [4, 4]);
        path(c, pts, f.X, f.Y, C.red);
        vline(c, f.X(S.d), f.T, f.B, C.cyan);
        dot(c, f.X(S.d), f.Y(S.rough), C.cyan);
      }
    }
  });
  function text() {
    put('#btFo', t('u.hz', { v: fmt(S.f, 0) })); put('#btDo', t('u.hz', { v: fmt(S.d, 1) }));
    put('#btBeat', t('u.perSec', { v: fmt(S.d, 1) })); put('#btCents', t('u.cents', { v: fmt(M.cents((S.f + S.d) / S.f), 0) }));
    put('#btRough', fmt(S.rough * 100) + '%'); put('#btPeak', t('ch3.unit.peak', { d: fmt(S.dStar, 1), c: fmt(M.cents((S.f + S.dStar) / S.f), 0) }));
    const key = M.say.ch3(S.d, S.dStar, S.rough);
    putHTML('#btSay', t(key, { d: fmt(S.d, 1), f: fmt(S.f, 0), r: fmt(S.rough * 100), ds: fmt(S.dStar, 1), dc: fmt(M.cents((S.f + S.dStar) / S.f), 0) }));
  }
  sim.text = text;
  const redo = () => { S = st(); sim.dirty = true; text(); pl.refresh(); };
  [sF, sD].forEach(e => e.addEventListener('input', redo));
  text();
})();

/* dissonance-curve helpers shared by ch4 and ch5 */
function dipLabel(d) {
  const ns = M.rough.nearestSimple(d.ratio);
  return Math.abs(ns.d) < 1 ? t('dip.ratio', { p: ns.p, q: ns.q, c: fmt(d.cents, 0) }) : t('dip.raw', { c: fmt(d.cents, 0) });
}
function drawCurve(c, f, pts, col, lw) { path(c, pts, f.X, f.Y, col, lw); }

/* ───────── 04 the dissonance curve ───────── */
(() => {
  const cv = $('#dcCv'), R = M.rough, F0 = M.C4, CMAX = 1250, sN = $('#dcN'), sC = $('#dcC');
  let spec, curve, dips, ymax;
  function model() {
    spec = R.spectrum('harmonic', +sN.value);
    curve = R.curve(spec, F0, 0, CMAX, 2);
    dips = R.dips(spec, F0, 0, CMAX);
    ymax = Math.max(...curve.map(q => q[1])) * 1.06;
  }
  model();
  const nearestDip = c => dips.reduce((b, d) => (!b || Math.abs(d.cents - c) < Math.abs(b.cents - c) ? d : b), null);
  const pl = AU.player('ch4', $('#dcPlay'), $('#fig4'), { label: 'ch4.btn.play', segments: () => [{ at: 0, dur: 5, tones: specTone(spec, F0).concat(specTone(spec, F0 * M.fromCents(+sC.value))) }] });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 44], 0, CMAX, 0, ymax);
      axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
      xTicks(c, f, w < 460 ? [0, 400, 800, 1200] : [0, 200, 400, 600, 800, 1000, 1200], v => fmt(v));
      drawCurve(c, f, curve, C.red, 2.2);
      for (const d of dips) { const x = f.X(d.cents); c.fillStyle = C.gold; c.beginPath(); c.moveTo(x, f.B - 1); c.lineTo(x - 5, f.B - 10); c.lineTo(x + 5, f.B - 10); c.closePath(); c.fill(); }
      const cc = +sC.value; vline(c, f.X(cc), f.T, f.B, C.cyan); dot(c, f.X(cc), f.Y(R.dissonance(spec, F0, M.fromCents(cc))), C.cyan);
    }
  });
  function text() {
    const cc = +sC.value, v = R.dissonance(spec, F0, M.fromCents(cc)), nd = nearestDip(cc);
    put('#dcNo', fmt(+sN.value)); put('#dcCo', t('u.cents', { v: fmt(cc) }));
    put('#dcRatio', t('ch4.unit.ratio', { r: fmt(M.fromCents(cc), 3), c: fmt(cc) }));
    put('#dcVal', fmt(v, 2)); put('#dcNear', nd ? dipLabel(nd) : '—'); put('#dcCount', fmt(dips.filter(d => d.cents > 0).length));
    putHTML('#dcDips', t('ch4.dips') + ' ' + dips.map(d => `<span class="k${nd === d && Math.abs(d.cents - cc) < 3 ? ' on' : ''}">${dipLabel(d)}</span>`).join(''));
    const [key] = M.say.ch4(+sN.value, cc, dips), ns = R.nearestSimple(nd.ratio);
    const vars = { n: fmt(+sN.value), v: fmt(v, 2), p: ns.p, q: ns.q, c: fmt(nd.cents, 0), dip: dipLabel(nd), x: fmt(v / nd.value, 1) };
    putHTML('#dcSay', t(key, vars));
  }
  sim.text = text;
  const redoN = () => { model(); sim.dirty = true; text(); pl.refresh(); };
  const redoC = () => { sim.dirty = true; text(); pl.refresh(); };
  sN.addEventListener('input', redoN); sC.addEventListener('input', redoC);
  const jump = dir => { const cc = +sC.value, ds = dips.map(d => Math.round(d.cents)); const tgt = dir > 0 ? ds.find(x => x > cc) : ds.slice().reverse().find(x => x < cc); if (tgt != null) { sC.value = Math.min(CMAX, tgt); redoC(); } };
  $('#dcPrev').addEventListener('click', () => jump(-1)); $('#dcNext').addEventListener('click', () => jump(1));
  text();
})();

/* ───────── 05 timbre moves the dips ───────── */
(() => {
  const cvS = $('#tmSpec'), cv = $('#tmCv'), R = M.rough, F0 = M.C4, CMAX = 1400, N = 6, sS = $('#tmS');
  const harm = R.spectrum('harmonic', N), harmCurve = R.curve(harm, F0, 0, CMAX, 2);
  let S;
  function model() {
    const kind = radioVal('tmK'), A = +sS.value, spec = R.spectrum(kind, N, 0.88, A);
    const curve = R.curve(spec, F0, 0, CMAX, 2), dips = R.dips(spec, F0, 0, CMAX).filter(d => d.cents > 0);
    const oct = M.rough.octaveDip(dips, kind === 'stretched' ? M.cents(A) : 1200);
    S = { kind, A, spec, curve, dips, oct, at8: R.dissonance(spec, F0, 2), atDip: oct ? oct.value : NaN, ymax: Math.max(...curve.map(q => q[1]), ...harmCurve.map(q => q[1])) * 1.06 };
    sS.disabled = kind !== 'stretched';
  }
  model();
  const pl8 = AU.player('ch5-octave', $('#tmPlay8'), $('#fig5'), { label: 'ch5.btn.oct', segments: () => [{ at: 0, dur: 4, tones: specTone(S.spec, F0).concat(specTone(S.spec, F0 * 2)) }] });
  const plD = AU.player('ch5-dip', $('#tmPlayDip'), $('#fig5'), { label: 'ch5.btn.dip', segments: () => [{ at: 0, dur: 4, tones: specTone(S.spec, F0).concat(specTone(S.spec, F0 * S.oct.ratio)) }] });
  const sim = reg([cvS, cv], {
    draw() {
      { // where the partials sit
        const { c, w, h } = fit(cvS), f = frame(w, h, [14, 14, 32, 44], 0, 20, 0, 1.1);
        axes(c, f, t('ch5.cv.xs'), '');
        xTicks(c, f, [1, 5, 10, 15, 20], v => fmt(v));
        for (let n = 1; n <= 20; n++) vline(c, f.X(n), f.Y(1.05), f.B, C.grid);
        for (const p of S.spec) { const x = f.X(p.r); c.strokeStyle = C.violet; c.lineWidth = 3; c.beginPath(); c.moveTo(x, f.B); c.lineTo(x, f.Y(p.a)); c.stroke(); }
      }
      { // its dissonance curve against the harmonic one
        const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 44], 0, CMAX, 0, S.ymax);
        axes(c, f, t('ch4.cv.x'), t('ch4.cv.y'));
        xTicks(c, f, w < 460 ? [0, 400, 800, 1200] : [0, 200, 400, 600, 800, 1000, 1200, 1400], v => fmt(v));
        vline(c, f.X(1200), f.T, f.B, C.gold, [3, 4]);
        c.setLineDash([5, 4]); drawCurve(c, f, harmCurve, C.mute, 1.3); c.setLineDash([]);
        drawCurve(c, f, S.curve, C.violet, 2.2);
        for (const d of S.dips) { const x = f.X(d.cents); c.fillStyle = C.gold; c.beginPath(); c.moveTo(x, f.B - 1); c.lineTo(x - 5, f.B - 10); c.lineTo(x + 5, f.B - 10); c.closePath(); c.fill(); }
        if (S.oct) dot(c, f.X(S.oct.cents), f.Y(S.oct.value), C.violet, 5);
        dot(c, f.X(1200), f.Y(S.at8), C.red, 5);
      }
    }
  });
  function text() {
    put('#tmSo', S.kind === 'stretched' ? '×' + fmt(S.A, 2) : '—');
    put('#tmDip', S.oct ? t('u.cents', { v: fmt(S.oct.cents, 0) }) : '—');
    put('#tmAt8', fmt(S.at8, 2)); put('#tmAtDip', fmt(S.atDip, 2));
    put('#tmParts', S.spec.slice(0, 4).map(p => fmt(p.r, 2)).join(' · '));
    putHTML('#tmDips', t('ch4.dips') + ' ' + S.dips.map(d => `<span class="k${d === S.oct ? ' on' : ''}">${dipLabel(d)}</span>`).join(''));
    const key = M.say.ch5(S.kind, S.A);
    putHTML('#tmSay', t(key, { c: S.oct ? fmt(S.oct.cents, 0) : '—', A: fmt(S.A, 2), r8: fmt(S.at8, 2), rd: fmt(S.atDip, 2), x: fmt(S.at8 / S.atDip, 1) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); pl8.refresh(); plD.refresh(); };
  sS.addEventListener('input', redo); radios('tmK').forEach(r => r.addEventListener('change', redo));
  text();
})();

/* ───────── 06 stacking fifths ───────── */
(() => {
  const cv = $('#pyCv'), Y = M.pyth, sK = $('#pyK'), fig = $('#fig6'), NOTE = 0.34;
  const NAMES = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'];
  let S;
  function model() {
    const k = +sK.value, pos = Y.positions(k);
    const order = pos.map((c, i) => ({ c, i })).sort((a, b) => a.c - b.c);
    S = { k, pos, order, sizes: Y.sizes(k) };
  }
  model();
  let nowIdx = -1;
  const pl = AU.player('ch6', $('#pyPlay'), fig, {
    label: 'ch6.btn.play',
    segments: () => S.order.map((o, j) => ({ at: j * NOTE, dur: NOTE * 0.92, tones: harmTone(M.C4 * M.fromCents(o.c), 6) })).concat([{ at: S.order.length * NOTE, dur: NOTE * 1.6, tones: harmTone(M.C4 * 2, 6) }]),
    onChange: () => { sim.dirty = true; },
    // the sounding note, tracked even while the circle is off screen
    onTick: () => {
      const j = pl.playing ? Math.floor(pl.elapsed() / NOTE) : -1, idx = j >= 0 && j < S.order.length ? S.order[j].i : j === S.order.length ? 0 : -1;
      if (idx !== nowIdx) { nowIdx = idx; fig.dataset.now = String(idx); sim.dirty = true; }
    }
  });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), cx = w / 2, cy = h / 2 + 4, Rr = Math.min(w, h) / 2 - 40;
      const P = cents => [cx + Rr * Math.sin(cents / 1200 * 2 * Math.PI), cy - Rr * Math.cos(cents / 1200 * 2 * Math.PI)];
      c.strokeStyle = C.line; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, Rr, 0, 6.283); c.stroke();
      // the chain of fifths as a faint star
      c.strokeStyle = 'rgba(179,157,251,.35)'; c.lineWidth = 1.2; c.beginPath(); S.pos.forEach((p, i) => { const [x, y] = P(p); c[i ? 'lineTo' : 'moveTo'](x, y); }); c.stroke();
      if (S.k === 12) { c.strokeStyle = C.red; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, Rr, -Math.PI / 2, -Math.PI / 2 + Y.comma() / 1200 * 2 * Math.PI); c.stroke(); }
      c.textAlign = 'center';
      S.pos.forEach((p, i) => {
        const [x, y] = P(p), on = i === nowIdx;
        dot(c, x, y, i === 12 ? C.red : on ? C.ink : i === 0 ? C.gold : C.cyan, on ? 7 : 5);
        const rr = i === 12 ? Rr - 22 : Rr + 18, a = p / 1200 * 2 * Math.PI;
        c.fillStyle = on ? C.ink : C.mute; c.fillText(NAMES[i], cx + rr * Math.sin(a), cy - rr * Math.cos(a));
      });
    }
  });
  function text() {
    put('#pyKo', fmt(S.k)); put('#pyNotes', fmt(S.k + 1));
    put('#pySizes', S.sizes.map(x => fmt(x, 2)).join(' · '));
    put('#pyOct', t('ch6.unit.oct', { k: fmt(S.k), o: fmt(S.k * M.FIFTH, 2) }));
    put('#pyGap', S.k === 12 ? t('u.cents', { v: fmt(Y.comma(), 2) }) : '—');
    const n = S.k + 1, key = M.say.ch6(S.k, S.sizes.length);
    putHTML('#pySay', t(key, { n: fmt(n), a: fmt(S.sizes[0], 2), b: fmt(S.sizes[1], 2), c: S.sizes[2] != null ? fmt(S.sizes[2], 2) : '', comma: fmt(Y.comma(), 2) }));
  }
  sim.text = text;
  sK.addEventListener('input', () => { if (pl.playing) pl.stop(); model(); sim.dirty = true; text(); });
  text();
})();

/* ───────── 07 why twelve ───────── */
(() => {
  const cv = $('#edCv'), E = M.edo, sN = $('#edN'), fig = $('#fig7'), N0 = 5, N1 = 60, SEG = 2.2, GAP = 0.4, YL = 60;
  const recs = E.records(1.5, N1);
  const errs = []; for (let N = N0; N <= N1; N++) errs.push({ N, f: E.best(N, 1.5).err, t: E.best(N, 1.25).err });
  const which = () => radioVal('edW');
  const just = () => (which() === 'fifth' ? 1.5 : 1.25);
  let part = -1;
  const pl = AU.player('ch7', $('#edPlay'), fig, {
    label: 'ch7.btn.play',
    segments: () => { const N = +sN.value, b = E.best(N, just()), r = M.fromCents(b.cents); return [{ at: 0, dur: SEG, tones: harmTone(M.C4, 6).concat(harmTone(M.C4 * r, 6)) }, { at: SEG + GAP, dur: SEG, tones: harmTone(M.C4, 6).concat(harmTone(M.C4 * just(), 6)) }]; },
    onChange: () => { sim.dirty = true; text(); },
    onTick: () => {
      const e = pl.elapsed(), p = !pl.playing ? -1 : e < SEG ? 0 : e < SEG + GAP ? -1 : 1;
      if (p !== part) { part = p; fig.dataset.now = String(p); text(); }
    }
  });
  const sim = reg(cv, {
    draw() {
      const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 44], N0 - 1, N1 + 1, -YL, YL);
      yTicks(c, f, [-50, -25, 0, 25, 50], v => fmtS(v, 0));
      axes(c, f, t('ch7.cv.x'), t('ch7.cv.y'));
      xTicks(c, f, [12, 24, 36, 48, 60], v => fmt(v));
      const N = +sN.value; c.fillStyle = 'rgba(179,157,251,.16)'; const bw = Math.max(6, (f.R - f.L) / (N1 - N0 + 2)); c.fillRect(f.X(N) - bw / 2, f.T, bw, f.B - f.T);
      const yc = v => f.Y(clamp(v, -YL, YL));
      for (const e of errs) { dot(c, f.X(e.N), yc(e.t), C.cyan, 2.6); }
      for (const e of errs) { dot(c, f.X(e.N), yc(e.f), C.gold, 3); if (recs.includes(e.N)) { c.strokeStyle = C.ink; c.lineWidth = 1.5; c.beginPath(); c.arc(f.X(e.N), yc(e.f), 6.5, 0, 6.283); c.stroke(); } }
    }
  });
  function text() {
    const N = +sN.value, a = E.best(N, 1.5), b = E.best(N, 1.25);
    put('#edNo', fmt(N));
    put('#edFifth', t('ch7.unit.iv', { k: fmt(a.k), e: fmtS(a.err, 2) })); put('#edThird', t('ch7.unit.iv', { k: fmt(b.k), e: fmtS(b.err, 2) }));
    const bb = which() === 'fifth' ? E.beat(M.C4, M.fromCents(a.cents), 3, 2) : E.beat(M.C4, M.fromCents(b.cents), 5, 4);
    put('#edBeat', t('u.perSec', { v: fmt(bb, 2) }));
    put('#edNow', part === 0 ? t('ch7.now.edo', { n: fmt(N) }) : part === 1 ? t('ch7.now.just') : '—');
    const prev = recs.filter(x => x < N).pop(), key = M.say.ch7(N, recs);
    putHTML('#edSay', t(key, { n: fmt(N), k: fmt(a.k), fe: fmtS(a.err, 2), j: fmt(b.k), te: fmtS(b.err, 2), prev: fmt(prev), pe: fmtS(E.best(prev, 1.5).err, 2) }));
  }
  sim.text = text;
  sN.addEventListener('input', () => { if (pl.playing) pl.stop(); sim.dirty = true; text(); });
  radios('edW').forEach(r => r.addEventListener('change', () => { if (pl.playing) pl.stop(); text(); }));
  text();
})();

/* ───────── 08 equal temperament ───────── */
(() => {
  const cv = $('#etCv'), cvB = $('#etBeat'), T = M.tune, sK = $('#etKey'), YL = 45, SPAN = 2;
  let S;
  function model() {
    const sys = radioVal('etSys'), root = +sK.value, reg8 = +radioVal('etReg'), fC = reg8 === 3 ? M.C3 : M.C4;
    const rows = []; for (let k = 0; k < 12; k++) rows.push(T.triad(sys, k));
    S = { sys, root, fC, rows, tri: rows[root], beats: T.beats(sys, root, fC) };
  }
  model();
  const pl = AU.player('ch8', $('#etPlay'), $('#fig8'), {
    label: 'ch8.btn.play',
    segments: () => { const f1 = S.beats.f1; return [{ at: 0, dur: 5, tones: harmTone(f1, 6).concat(harmTone(f1 * S.tri.third, 6), harmTone(f1 * S.tri.fifth, 6)) }]; },
    onChange: () => { sim.dirty = true; }
  });
  const sim = reg([cv, cvB], {
    step() { if (pl.playing && !reduce) this.dirty = true; },
    draw() {
      { // third and fifth error in every key
        const { c, w, h } = fit(cv), f = frame(w, h, [30, 14, 38, 44], -0.5, 11.5, -YL, YL);
        yTicks(c, f, [-40, -20, 0, 20, 40], v => fmtS(v, 0)); axes(c, f, t('ch8.cv.x'), t('ch8.cv.y'));
        xTicks(c, f, Array.from({ length: 12 }, (_, i) => i).filter(i => w >= 460 || T.NAMES[i].length === 1), i => T.NAMES[i]);
        const cw = (f.R - f.L) / 12, bw = Math.max(3, cw * 0.3);
        c.fillStyle = 'rgba(233,185,73,.12)'; c.fillRect(f.X(S.root) - cw / 2, f.T, cw, f.B - f.T);
        S.rows.forEach((r, k) => {
          const x = f.X(k), y0 = f.Y(0);
          const bar = (v, dx, col) => { const y = f.Y(clamp(v, -YL, YL)); c.fillStyle = col; c.fillRect(x + dx - bw / 2, Math.min(y, y0), bw, Math.max(1.5, Math.abs(y - y0))); };
          bar(r.thirdErr, -bw * 0.6, C.cyan); bar(r.fifthErr, bw * 0.6, C.gold);
        });
        c.strokeStyle = C.mute; c.lineWidth = 1; c.beginPath(); c.moveTo(f.L, f.Y(0)); c.lineTo(f.R, f.Y(0)); c.stroke();
      }
      { // the colliding partials' loudness swells: third (cyan) and fifth (gold), two seconds
        const { c, w, h } = fit(cvB), f = frame(w, h, [12, 14, 30, 44], 0, SPAN, 0, 2.15);
        axes(c, f, t('ch8.cv.t'), ''); xTicks(c, f, [0, 0.5, 1, 1.5, 2], v => fmt(v, 1));
        const env = b => { const out = []; for (let i = 0; i <= 400; i++) { const tt = SPAN * i / 400; out.push([tt, Math.abs(2 * Math.cos(Math.PI * b * tt))]); } return out; };
        path(c, env(S.beats.fifth), f.X, f.Y, C.gold, 1.6);
        path(c, env(S.beats.third), f.X, f.Y, C.cyan, 2);
        if (pl.playing && !reduce) vline(c, f.X(pl.elapsed() % SPAN), f.T, f.B, C.ink);
      }
    }
  });
  function text() {
    const tr = S.tri, b = S.beats;
    put('#etKeyo', T.NAMES[S.root]);
    put('#etTe', t('u.cents', { v: fmtS(tr.thirdErr, 2) })); put('#etFe', t('u.cents', { v: fmtS(tr.fifthErr, 2) }));
    put('#etTb', t('u.perSec', { v: fmt(b.third, 1) })); put('#etFb', t('u.perSec', { v: fmt(b.fifth, 2) }));
    const key = M.say.ch8(S.sys, tr.thirdErr, tr.fifthErr);
    putHTML('#etSay', t(key, { key: T.NAMES[S.root], te: fmtS(tr.thirdErr, 2), fe: fmtS(tr.fifthErr, 2), tb: fmt(b.third, 1), fb: fmt(b.fifth, 2), f: fmt(b.f1, 1) }));
  }
  sim.text = text;
  const redo = () => { model(); sim.dirty = true; text(); pl.refresh(); };
  sK.addEventListener('input', redo); ['etSys', 'etReg'].forEach(n => radios(n).forEach(r => r.addEventListener('change', redo)));
  text();
  // the interval table: equal temperament against just intonation, every number from the model
  function table() {
    const rows = T.etVsJust().map(r => `<tr><td>${t(IVKEY[r.semis])}</td><td>${r.p}:${r.q}</td><td>${fmt(r.just, 2)}</td><td>${fmt(r.et, 0)}</td><td class="${r.err > 0.005 ? 'pos' : r.err < -0.005 ? 'neg' : ''}">${fmtS(r.err, 2)}</td></tr>`).join('');
    $('#ivTable').setAttribute('aria-label', t('ch8.table.cap'));
    $('#ivTable').innerHTML = `<thead><tr><th>${t('ch8.table.iv')}</th><th>${t('ch8.table.ratio')}</th><th>${t('ch8.table.just')}</th><th>${t('ch8.table.et')}</th><th>${t('ch8.table.diff')}</th></tr></thead><tbody>${rows}</tbody>`;
  }
  langHooks.push(table);
})();

/* ───────── loop ───────── */
applyLang();
function tick() {
  AU.tick();
  for (const s of sims) {
    if (!s.vis) continue;
    if (s.step) s.step();
    if (s.dirty) { s.draw(); s.dirty = false; }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__essayReady = true;
})();
