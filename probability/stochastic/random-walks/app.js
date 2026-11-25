/* Interactive runtime for "Random Walks and Brownian Motion".
   All visible strings come from copy.zh.js / copy.en.js via window.ESSAY_COPY. */
(() => {
  'use strict';
  const M = window.RWModels;
  const D = window.RandomWalkData;
  const COPY = window.ESSAY_COPY || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const C = {
    bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0',
    mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0', violet: '#b39dfb',
  };
  const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LS = 'knowledge-lang';
  let memLang = null;
  function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
  function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) {} }
  let lang = readLang();
  if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  const enStub = document.documentElement.dataset.langEn === 'stub';
  const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
  const effLang = () => (hasLang(lang) ? lang : 'zh');
  function t(key, vars) {
    const L = effLang();
    let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }
  const fmt = (x, d) => M.fmt(x, d, effLang());
  const pct = (x, d) => t('u.pct', { v: fmt(x * 100, d) });
  const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
  const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
  const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };
  const on = (sel, ev, f) => { const e = $(sel); if (e) e.addEventListener(ev, f); };
  const onRadio = (name, f) => $$(`input[name=${name}]`).forEach(r => r.addEventListener('change', f));

  // Durations in natural units.
  function dur(s) {
    if (s < 1) return t('u.s', { v: fmt(s, s < 0.1 ? 3 : 2) });
    if (s < 120) return t('u.s', { v: fmt(s, s < 10 ? 1 : 0) });
    if (s < 7200) return t('u.min', { v: fmt(s / 60, 0) });
    if (s < 3 * 86400) return t('u.h', { v: fmt(s / 3600, 1) });
    if (s < 730 * 86400) return t('u.d', { v: fmt(s / 86400, s < 30 * 86400 ? 1 : 0) });
    return t('u.y', { v: fmt(s / (365.25 * 86400), 1) });
  }

  const hooks = [];
  const sims = [];
  const io = new IntersectionObserver(es => es.forEach(e => {
    for (const s of sims) if (s.cvs.includes(e.target)) { e.target.__vis = e.isIntersecting; s.vis = s.cvs.some(cv => cv.__vis); s.dirty = true; }
  }), { rootMargin: '60px' });
  function reg(cvs, o) { o.cvs = [].concat(cvs); o.vis = false; o.dirty = true; sims.push(o); o.cvs.forEach(cv => io.observe(cv)); return o; }
  window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    for (const s of sims) {
      if (!s.vis) continue;
      if (s.tick && s.tick(dt)) s.dirty = true;
      if (s.dirty) { s.dirty = false; s.draw(); }
    }
    requestAnimationFrame(loop);
  }
  function fit(cv) {
    const r = cv.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0); c.font = FONT; c.textBaseline = 'middle';
    c.clearRect(0, 0, r.width, r.height);
    c.fillStyle = C.bg; c.fillRect(0, 0, r.width, r.height);
    return { c, w: r.width, h: r.height };
  }
  // A plot frame with axis names; returns mapping helpers.
  function frame(c, w, h, xr, yr, xName, yName, opt) {
    opt = opt || {};
    const L = 44, R = 16, T = 22, B = 40;
    const X = x => L + (opt.logx ? (Math.log(x) - Math.log(xr[0])) / (Math.log(xr[1]) - Math.log(xr[0])) : (x - xr[0]) / (xr[1] - xr[0])) * (w - L - R);
    const Y = y => h - B - (opt.logy ? (Math.log(y) - Math.log(yr[0])) / (Math.log(yr[1]) - Math.log(yr[0])) : (y - yr[0]) / (yr[1] - yr[0])) * (h - T - B);
    c.strokeStyle = C.line; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L, T); c.lineTo(L, h - B); c.lineTo(w - R, h - B); c.stroke();
    c.fillStyle = C.mute; c.textAlign = 'right'; c.fillText(xName, w - R, h - 10);
    c.textAlign = 'left'; c.fillText(yName, L + 6, 10);
    (opt.yt || []).forEach(v => { const y = Y(v); c.textAlign = 'right'; c.fillText(opt.yf ? opt.yf(v) : String(v), L - 6, y); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(L + 1, y); c.lineTo(w - R, y); c.stroke(); });
    (opt.xt || []).forEach(v => { const x = X(v); c.textAlign = 'center'; c.fillText(opt.xf ? opt.xf(v) : String(v), x, h - B + 12); });
    return { X, Y, L, R, T, B };
  }
  function applyLang() {
    document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
    document.title = t('doc.title');
    const md = document.querySelector('meta[name=description]'); if (md) md.content = t('doc.desc');
    $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
    $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
    $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    hooks.forEach(f => f());
    sims.forEach(s => { s.dirty = true; });
  }
  $$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));

  /* ── ch1: an ensemble of coin-flip walkers ── */
  (() => {
    const cv = $('#c1Cv'); if (!cv) return;
    const NMAX = 400, RATE = 40; // steps per second
    let E, hist, running = false, acc = 0, seed = 1;
    function reset() {
      const m = Number($('#c1M').value);
      E = M.makeEnsemble(m, 1000 + seed); hist = [Float32Array.from(E.x)];
      if (reduce) { while (E.n < NMAX) { M.stepEnsemble(E); hist.push(Float32Array.from(E.x)); } running = false; }
      text(); S.dirty = true;
    }
    function text() {
      const s = M.ensembleStats(E), n = E.n;
      put('#c1MO', String(E.m));
      put('#c1Run', t(running ? 'ch1.ctl.pause' : 'ch1.ctl.run'));
      put('#c1N', t('u.steps', { v: fmt(n, 0) }));
      put('#c1Rms', fmt(s.rms, 2)); put('#c1Sqrt', fmt(Math.sqrt(n), 2));
      const ex = n ? M.shareWithin(n, Math.sqrt(n)) : 1;
      put('#c1In', pct(s.inside, 1)); put('#c1Exact', pct(ex, 1));
      putHTML('#c1Say', t('ch1.say', { n: fmt(n, 0), rms: fmt(s.rms, 2), sqrt: fmt(Math.sqrt(n), 2), in: pct(s.inside, 1), exact: pct(ex, 1) }));
    }
    const S = reg(cv, {
      tick(dt) {
        if (!running) return false;
        acc += dt * RATE; let k = Math.floor(acc); acc -= k; if (!k) return false;
        while (k-- > 0 && E.n < NMAX) { M.stepEnsemble(E); hist.push(Float32Array.from(E.x)); }
        if (E.n >= NMAX) running = false;
        text(); return true;
      },
      draw() {
        const { c, w, h } = fit(cv);
        const lim = 2.6 * Math.sqrt(NMAX);
        const F = frame(c, w, h, [0, NMAX], [-lim, lim], t('ch1.cv.x'), t('ch1.cv.y'), { yt: [-40, -20, 0, 20, 40], xt: [0, 100, 200, 300, 400] });
        const show = Math.min(E.m, 80);
        c.lineWidth = 1; c.strokeStyle = 'rgba(99,199,230,.28)';
        for (let i = 0; i < show; i++) { c.beginPath(); for (let n = 0; n < hist.length; n++) { const x = F.X(n), y = F.Y(hist[n][i]); n ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
        c.fillStyle = C.cyan;
        for (let i = 0; i < E.m; i++) { c.beginPath(); c.arc(F.X(E.n), F.Y(E.x[i]), 1.6, 0, 7); c.fill(); }
        [[1, C.gold, 2], [2, 'rgba(233,185,73,.45)', 1.2]].forEach(([k, col, lw]) => {
          c.strokeStyle = col; c.lineWidth = lw;
          for (const sg of [1, -1]) { c.beginPath(); for (let n = 0; n <= NMAX; n += 4) { const x = F.X(n), y = F.Y(sg * k * Math.sqrt(n)); n ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
        });
      },
    });
    on('#c1Run', 'click', () => { if (E.n >= NMAX) reset(); running = !running && !reduce; if (reduce) reset(); text(); });
    on('#c1Reset', 'click', () => { seed++; running = false; reset(); });
    on('#c1M', 'input', () => { running = false; reset(); });
    hooks.push(text);
    reset();
    // Default: show a finished state at 100 steps so the envelope is visible before any click.
    if (!reduce) { while (E.n < 100) { M.stepEnsemble(E); hist.push(Float32Array.from(E.x)); } text(); }
  })();

  /* ── ch2: endpoint histogram for three step laws ── */
  (() => {
    const cv = $('#c2Cv'); if (!cv) return;
    const NS = [1, 2, 4, 9, 16, 25, 50, 100, 200, 400], MW = 4000;
    let sums, n, type, mo;
    function update() {
      type = radioVal('c2Type'); n = NS[Number($('#c2N').value)];
      sums = M.sampleSums(type, n, MW, 77); mo = M.moments(sums);
      const th = M.sumTheory(type, n);
      put('#c2NO', String(n));
      put('#c2Sd', fmt(mo.sd, 2)); put('#c2Th', fmt(th.sd, 2));
      put('#c2Sk', fmt(mo.skew, 2)); put('#c2SkTh', fmt(th.skew, 2));
      putHTML('#c2Say', t('ch2.say', { n: fmt(n, 0), sd: fmt(mo.sd, 2), th: fmt(th.sd, 2), skew: fmt(mo.skew, 2), skth: fmt(th.skew, 2) }));
      S.dirty = true;
    }
    const S = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const r = Math.sqrt(n), lo = -4, hi = 4, bw = 0.25, nb = (hi - lo) / bw, cnt = new Array(nb).fill(0);
        for (const v of sums) { const z = v / r; const k = Math.floor((z - lo) / bw); if (k >= 0 && k < nb) cnt[k]++; }
        const ymax = Math.max(MW * bw * 0.42, ...cnt) * 1.1;
        const F = frame(c, w, h, [lo, hi], [0, ymax], t('ch2.cv.x'), t('ch2.cv.y'), { xt: [-3, -2, -1, 0, 1, 2, 3] });
        c.fillStyle = 'rgba(233,185,73,.55)';
        // A discrete walk with few steps sits on lattice points; draw bars at bin positions.
        cnt.forEach((v, k) => { if (!v) return; const x0 = F.X(lo + k * bw), x1 = F.X(lo + (k + 1) * bw); c.fillRect(x0 + 0.5, F.Y(v), Math.max(1, x1 - x0 - 1), F.Y(0) - F.Y(v)); });
        c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath();
        for (let i = 0; i <= 160; i++) { const z = lo + (hi - lo) * i / 160, y = MW * bw * M.normPdf(z); i ? c.lineTo(F.X(z), F.Y(y)) : c.moveTo(F.X(z), F.Y(y)); }
        c.stroke();
        c.fillStyle = C.cyan; c.textAlign = 'right'; c.fillText(t('ch2.cv.normal'), w - 14, 30);
      },
    });
    onRadio('c2Type', update); on('#c2N', 'input', update);
    hooks.push(update); update();
  })();

  /* ── ch3: a cloud of Brownian particles ── */
  (() => {
    const cv = $('#c3Cv'); if (!cv) return;
    const RADII = [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]; // µm
    const FIELD = 40; // µm across the shorter side of the canvas
    const N = 300;
    let Cl, Dum2, speed, track, aUm, tC;
    function params() {
      aUm = RADII[Number($('#c3A').value)]; tC = Number($('#c3T').value);
      Dum2 = M.stokesEinstein(aUm * 1e-6, tC) * 1e12;
      speed = (12 * 12 / (2 * Dum2)) / 20; // simulated seconds per real second: spread to about 12 µm in 20 s
    }
    function reset() {
      params(); Cl = M.makeCloud(N, 4242); track = [[0, 0]];
      if (reduce) { M.stepCloud(Cl, Dum2, 20 * speed); track.push([Cl.x[0], Cl.y[0]]); }
      text(); S.dirty = true;
    }
    function aLabel(a) { return a < 0.1 ? fmt(a * 1000, a < 0.001 ? 1 : 0) + ' nm' : t('u.um', { v: fmt(a, a < 1 ? 1 : 0) }); }
    function text() {
      const msd = M.cloudMsd(Cl), th = 2 * Dum2 * Cl.t;
      put('#c3AO', aLabel(aUm)); put('#c3TO', fmt(tC, 0) + ' °C');
      put('#c3D', t('u.um2', { v: fmt(Dum2, Dum2 < 1 ? 3 : Dum2 < 100 ? 2 : 0) }));
      put('#c3Time', dur(Cl.t));
      put('#c3Msd', fmt(msd, 2) + ' µm²'); put('#c3Th', fmt(th, 2) + ' µm²');
      const D = Dum2 * 1e-12;
      put('#c3T10', dur(M.timeToSpread(D, 10e-6))); put('#c3T1mm', dur(M.timeToSpread(D, 1e-3))); put('#c3T1cm', dur(M.timeToSpread(D, 1e-2)));
      putHTML('#c3Say', t('ch3.say', { a: aLabel(aUm), t: fmt(tC, 0) + ' °C', D: t('u.um2', { v: fmt(Dum2, Dum2 < 1 ? 3 : Dum2 < 100 ? 2 : 0) }), time: dur(Cl.t), msd: fmt(msd, 2) + ' µm²', th: fmt(th, 2) + ' µm²', t1cm: dur(M.timeToSpread(D, 1e-2)) }));
    }
    let textAcc = 0;
    const S = reg(cv, {
      tick(dt) {
        if (reduce || Cl.t > 40 * speed) return false;
        M.stepCloud(Cl, Dum2, dt * speed); track.push([Cl.x[0], Cl.y[0]]); if (track.length > 1200) track.shift();
        textAcc += dt; if (textAcc > 0.2) { textAcc = 0; text(); }
        return true;
      },
      draw() {
        const { c, w, h } = fit(cv);
        const sc = Math.min(w, h) / FIELD, cx = w / 2, cy = h / 2;
        const rr = Math.sqrt(2 * Dum2 * Cl.t) * sc; // one-axis RMS
        c.strokeStyle = 'rgba(233,185,73,.5)'; c.lineWidth = 1.2; c.setLineDash([4, 4]);
        c.beginPath(); c.arc(cx, cy, rr * Math.SQRT2, 0, 7); c.stroke(); c.setLineDash([]);
        c.fillStyle = 'rgba(99,199,230,.75)';
        for (let i = 1; i < Cl.m; i++) { c.beginPath(); c.arc(cx + Cl.x[i] * sc, cy + Cl.y[i] * sc, 1.8, 0, 7); c.fill(); }
        c.strokeStyle = C.gold; c.lineWidth = 1.2; c.beginPath();
        track.forEach(([x, y], k) => { const X = cx + x * sc, Y = cy + y * sc; k ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke();
        c.fillStyle = C.gold; c.beginPath(); c.arc(cx + Cl.x[0] * sc, cy + Cl.y[0] * sc, 3.5, 0, 7); c.fill();
        // scale bar 10 µm
        c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(14, h - 16); c.lineTo(14 + 10 * sc, h - 16); c.stroke();
        c.fillStyle = C.mute; c.textAlign = 'left'; c.fillText(t('ch3.cv.scale'), 14, h - 30);
      },
    });
    on('#c3A', 'input', reset); on('#c3T', 'input', reset); on('#c3Reset', 'click', reset);
    hooks.push(text); reset();
  })();

  /* ── ch4: geometric Brownian motion ── */
  (() => {
    const cv = $('#c4Cv'); if (!cv) return;
    function update() {
      const mu = Number($('#c4Mu').value) / 100, sig = Number($('#c4Sig').value) / 100, T = Number($('#c4T').value);
      const g = M.gbm(mu, sig, T);
      put('#c4MuO', pct(mu, 1)); put('#c4SigO', pct(sig, 0)); put('#c4TO', t('u.y', { v: fmt(T, 0) }));
      put('#c4Med', t('u.yuan', { v: fmt(g.median, 0) })); put('#c4Mean', t('u.yuan', { v: fmt(g.mean, 0) }));
      put('#c4Loss', pct(g.pLoss, 1));
      put('#c4Star', isFinite(g.tStar) ? t('u.y', { v: fmt(g.tStar, 1) }) : t('ch4.read.never'));
      const m = mu - sig * sig / 2;
      const v = { T: t('u.y', { v: fmt(T, 0) }), drift: fmt(g.logDrift, 3), noise: fmt(g.logSd, 3), loss: pct(g.pLoss, 1), m: fmt(m, 3), mean: t('u.yuan', { v: fmt(g.mean, 0) }) };
      putHTML('#c4Say', t('ch4.say.' + (m <= 0 ? 'neg' : g.logDrift >= g.logSd ? 'drift' : 'noise'), v));
      S.st = { mu, sig, T, paths: M.gbmPaths(mu, sig, T, 30, 200, 2026) }; S.dirty = true;
    }
    const S = reg(cv, {
      draw() {
        if (!S.st) return;
        const { c, w, h } = fit(cv); const { mu, sig, T, paths } = S.st;
        let lo = 100, hi = 100;
        paths.forEach(p => p.forEach(v => { if (v < lo) lo = v; if (v > hi) hi = v; }));
        lo = Math.max(1, lo * 0.9); hi = hi * 1.1;
        const ticks = [1, 3, 10, 30, 100, 300, 1000, 3000, 10000].filter(v => v >= lo && v <= hi);
        const F = frame(c, w, h, [0, T], [lo, hi], t('ch4.cv.x'), t('ch4.cv.y'), { logy: true, yt: ticks, xt: [0, T / 2, T].map(v => +v.toFixed(1)) });
        const m = mu - sig * sig / 2;
        c.fillStyle = 'rgba(99,199,230,.16)'; c.beginPath();
        for (let i = 0; i <= 100; i++) { const tt = T * i / 100; const y = F.Y(100 * Math.exp(m * tt + sig * Math.sqrt(tt))); i ? c.lineTo(F.X(tt), y) : c.moveTo(F.X(tt), y); }
        for (let i = 100; i >= 0; i--) { const tt = T * i / 100; c.lineTo(F.X(tt), F.Y(100 * Math.exp(m * tt - sig * Math.sqrt(tt)))); }
        c.closePath(); c.fill();
        c.lineWidth = 1; c.strokeStyle = 'rgba(235,232,224,.35)';
        paths.forEach(p => { c.beginPath(); p.forEach((v, i) => { const x = F.X(T * i / (p.length - 1)), y = F.Y(v); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); });
        c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath();
        for (let i = 0; i <= 100; i++) { const tt = T * i / 100; const y = F.Y(100 * Math.exp(m * tt)); i ? c.lineTo(F.X(tt), y) : c.moveTo(F.X(tt), y); }
        c.stroke();
        c.strokeStyle = C.red; c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(F.X(0), F.Y(100)); c.lineTo(F.X(T), F.Y(100)); c.stroke(); c.setLineDash([]);
      },
    });
    ['#c4Mu', '#c4Sig', '#c4T'].forEach(s => on(s, 'input', update));
    hooks.push(update); update();
  })();

  /* ── ch5: real index returns at several horizons ── */
  (() => {
    const cv = $('#c5Cv'); if (!cv || !D) return;
    let q = 1, H;
    function update() {
      q = Number(radioVal('c5Q')); H = M.horizon(D, q);
      put('#c5N', fmt(H.n, 0)); put('#c5Sd', pct(H.sd, 2)); put('#c5Pred', pct(H.pred, 2)); put('#c5Ratio', fmt(H.ratio, 2));
      put('#c5Kurt', fmt(H.kurt, 1)); put('#c5O4', fmt(H.over4, 0) + ' / ' + fmt(H.exp4, 2));
      putHTML('#c5Say', t('ch5.say', { q: t('ch5.q.' + q), ratio: fmt(H.ratio, 2), kurt: fmt(H.kurt, 1), o4: fmt(H.over4, 0), e4: fmt(H.exp4, 2) }));
      S.dirty = true;
    }
    const S = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const lo = -10, hi = 10, bw = D.binW;
        const ymin = 0.3, ymax = H.n * 0.25;
        const F = frame(c, w, h, [lo, hi], [ymin, ymax], t('ch5.cv.x'), t('ch5.cv.y'), { logy: true, yt: [1, 10, 100, 1000].filter(v => v < ymax), xt: [-8, -4, 0, 4, 8] });
        c.fillStyle = 'rgba(233,185,73,.6)';
        H.hist.forEach((v, k) => { if (!v) return; const z0 = D.binLo + k * bw; if (z0 < lo || z0 + bw > hi) return; const x0 = F.X(z0), x1 = F.X(z0 + bw); c.fillRect(x0 + 0.5, F.Y(v), Math.max(1, x1 - x0 - 1), F.Y(ymin) - F.Y(v)); });
        c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath(); let started = false;
        for (let i = 0; i <= 200; i++) { const z = lo + (hi - lo) * i / 200, y = M.normalBinCount(H.n, z - bw / 2, bw); if (y < ymin) { started = false; continue; } started ? c.lineTo(F.X(z), F.Y(y)) : c.moveTo(F.X(z), F.Y(y)); started = true; }
        c.stroke();
        c.textAlign = 'right'; c.fillStyle = C.cyan; c.fillText(t('ch5.cv.normal'), w - 14, 30); c.fillStyle = C.gold; c.fillText(t('ch5.cv.data'), w - 14, 48);
      },
    });
    onRadio('c5Q', update); hooks.push(update); update();
  })();

  /* ── ch5: variance ratios by era ── */
  (() => {
    const cv = $('#c5vCv'); if (!cv || !D) return;
    let era, q;
    function update() {
      era = radioVal('c5Era'); q = Number(radioVal('c5VQ'));
      const r = M.vrAt(D, era, q);
      put('#c5vVr', fmt(r.vr, 2)); put('#c5vBand', fmt(r.lo, 2) + ' – ' + fmt(r.hi, 2)); put('#c5vAcf', fmt(D.eras[era].acf1, 2));
      putHTML('#c5vSay', t('ch5.v.say.' + r.verdict, { era: t('ch5.v.era.' + era), q: String(q), vr: fmt(r.vr, 2), lo: fmt(r.lo, 2), hi: fmt(r.hi, 2) }));
      S.dirty = true;
    }
    const S = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv); const e = D.eras[era];
        const F = frame(c, w, h, [1.6, 320], [0, 3], t('ch5.v.cv.x'), t('ch5.v.cv.y'), { logx: true, yt: [0, 0.5, 1, 1.5, 2, 2.5, 3], yf: v => fmt(v, 1), xt: D.qs });
        c.fillStyle = 'rgba(163,170,184,.22)'; c.beginPath();
        D.qs.forEach((qq, i) => { const x = F.X(qq), y = F.Y(e.hi[i]); i ? c.lineTo(x, y) : c.moveTo(x, y); });
        for (let i = D.qs.length - 1; i >= 0; i--) c.lineTo(F.X(D.qs[i]), F.Y(e.lo[i]));
        c.closePath(); c.fill();
        c.strokeStyle = C.cyan; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(F.X(1.6), F.Y(1)); c.lineTo(F.X(320), F.Y(1)); c.stroke(); c.setLineDash([]);
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath();
        D.qs.forEach((qq, i) => { const x = F.X(qq), y = F.Y(Math.min(3, e.vr[i])); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
        D.qs.forEach((qq, i) => { c.fillStyle = qq === q ? C.gold : 'rgba(233,185,73,.6)'; c.beginPath(); c.arc(F.X(qq), F.Y(Math.min(3, e.vr[i])), qq === q ? 6 : 4, 0, 7); c.fill(); });
      },
    });
    onRadio('c5Era', update); onRadio('c5VQ', update); hooks.push(update); update();
  })();

  /* ── ch6: gambler's ruin ── */
  (() => {
    const cv = $('#c6Cv'); if (!cv) return;
    const PRE = { red: 18 / 37, fair: 0.5, edge: 0.52 };
    let pOverride = 18 / 37, st;
    function update() {
      const N = Number($('#c6N').value), iEl = $('#c6I');
      iEl.max = String(N - 1); if (Number(iEl.value) > N - 1) iEl.value = String(N - 1);
      const i = Number(iEl.value);
      const p = pOverride != null ? pOverride : Number($('#c6P').value);
      const r = M.ruin(i, N, p);
      put('#c6IO', t('u.yuan', { v: fmt(i, 0) })); put('#c6NO', t('u.yuan', { v: fmt(N, 0) })); put('#c6PO', fmt(p, 4));
      put('#c6T', pct(r.timid, 2)); put('#c6TN', t('u.bets', { v: fmt(r.timidBets, 0) }));
      put('#c6B', pct(r.bold, 2)); put('#c6BN', t('u.bets', { v: fmt(r.boldBets, 2) }));
      const kind = Math.abs(p - 0.5) < 1e-9 ? 'fair' : p < 0.5 ? 'unfav' : 'fav';
      putHTML('#c6Say', t('ch6.say.' + kind, { p: fmt(p, 4), timid: pct(r.timid, 2), tn: fmt(r.timidBets, 0), bold: pct(r.bold, 2) }));
      st = { N, i, paths: M.ruinPaths(i, N, p, 12, 31, 40000) }; S.dirty = true;
    }
    const S = reg(cv, {
      draw() {
        if (!st) return;
        const { c, w, h } = fit(cv); const { N, paths } = st;
        const len = Math.max(20, ...paths.map(p => p.length));
        const F = frame(c, w, h, [0, len], [0, N], t('ch6.cv.x'), t('ch6.cv.y'), { yt: [0, N / 2, N], xt: [0, Math.round(len / 2), len] });
        c.strokeStyle = C.green; c.lineWidth = 2; c.beginPath(); c.moveTo(F.X(0), F.Y(N)); c.lineTo(F.X(len), F.Y(N)); c.stroke();
        c.strokeStyle = C.red; c.beginPath(); c.moveTo(F.X(0), F.Y(0)); c.lineTo(F.X(len), F.Y(0)); c.stroke();
        paths.forEach(p => {
          const win = p[p.length - 1] >= N;
          c.strokeStyle = win ? 'rgba(122,214,160,.7)' : 'rgba(99,199,230,.45)'; c.lineWidth = 1; c.beginPath();
          const stride = Math.max(1, Math.floor(p.length / 600));
          for (let k = 0; k < p.length; k += stride) { const x = F.X(k), y = F.Y(p[k]); k ? c.lineTo(x, y) : c.moveTo(x, y); }
          c.lineTo(F.X(p.length - 1), F.Y(p[p.length - 1])); c.stroke();
        });
      },
    });
    on('#c6P', 'input', () => { pOverride = null; update(); });
    on('#c6I', 'input', update); on('#c6N', 'input', update);
    $$('.c6Pre').forEach(b => b.addEventListener('click', () => { pOverride = PRE[b.dataset.p]; $('#c6P').value = String(pOverride); update(); }));
    hooks.push(update); update();
  })();

  /* ── ch7: the DDPM forward process on a two-peak toy ── */
  (() => {
    const cv = $('#c7Cv'); if (!cv) return;
    let f, tt;
    function update() {
      tt = Number($('#c7T').value); f = M.forward(tt);
      put('#c7TO', String(tt));
      put('#c7Ab', fmt(f.signal, 3)); put('#c7Noise', fmt(Math.sqrt(1 - f.aB), 3));
      const k = f.twoPeaks ? 'two' : 'one';
      put('#c7Peaks', t('ch7.peaks.' + k));
      putHTML('#c7Say', t('ch7.say.' + k, { t: String(tt), ab: fmt(f.signal, 3) }));
      S.dirty = true;
    }
    const S = reg(cv, {
      draw() {
        const { c, w, h } = fit(cv);
        const F = frame(c, w, h, [-4, 4], [0, 0.7], t('ch7.cv.x'), t('ch7.cv.y'), { xt: [-4, -2, 0, 2, 4], yt: [0, 0.2, 0.4, 0.6], yf: v => fmt(v, 1) });
        c.strokeStyle = C.cyan; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath();
        for (let i = 0; i <= 200; i++) { const x = -4 + 8 * i / 200; const y = F.Y(M.normPdf(x)); i ? c.lineTo(F.X(x), y) : c.moveTo(F.X(x), y); }
        c.stroke(); c.setLineDash([]);
        c.strokeStyle = C.gold; c.lineWidth = 2.2; c.beginPath();
        for (let i = 0; i <= 400; i++) { const x = -4 + 8 * i / 400; const y = F.Y(Math.min(0.7, f.dens(x))); i ? c.lineTo(F.X(x), y) : c.moveTo(F.X(x), y); }
        c.stroke();
        c.fillStyle = C.cyan; c.textAlign = 'right'; c.fillText(t('ch7.cv.normal'), w - 14, 30);
      },
    });
    on('#c7T', 'input', update); hooks.push(update); update();
  })();

  applyLang();
  requestAnimationFrame(loop);
})();
