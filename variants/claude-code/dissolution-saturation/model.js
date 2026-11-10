'use strict';
// Dissolution & saturation lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, dot, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Solubility S(T) = grams that saturate 100 g of water, from the usual textbook table (every 10 °C),
// linearly interpolated in between. Step 1 is a seeded toy particle model of dissolving vs crystallising.
(function (root) {
  const TABLE = {
    NaCl: [35.7, 35.8, 36.0, 36.3, 36.6, 37.0, 37.3, 37.8, 38.4, 39.0, 39.8],
    KNO3: [13.3, 20.9, 31.6, 45.8, 63.9, 85.5, 110, 138, 169, 202, 246],
    CaOH2: [0.185, 0.176, 0.165, 0.153, 0.141, 0.138, 0.116, 0.106, 0.094, 0.085, 0.077]
  };
  function S(sub, T) {
    const tb = TABLE[sub], x = Math.max(0, Math.min(100, T)) / 10, i = Math.min(9, Math.floor(x)), f = x - i;
    return tb[i] + (tb[i + 1] - tb[i]) * f;
  }

  // Step 0 / 3: put m grams of solute in w grams of water at T.
  function mix(sub, T, m, w) {
    const cap = S(sub, T) * w / 100, dissolved = Math.min(m, cap), solid = m - dissolved;
    return { cap, dissolved, solid, saturated: m >= cap - 1e-12, solution: w + dissolved, fraction: dissolved / (w + dissolved), satFraction: S(sub, T) / (100 + S(sub, T)) };
  }

  // Step 2: lowest temperature at which m grams dissolve completely in 100 g water (rising curves only).
  function dissolveAllT(sub, m) {
    if (S(sub, 0) >= m) return 0;
    for (let i = 0; i < 10; i++) {
      const a = TABLE[sub][i], b = TABLE[sub][i + 1];
      if (b >= m && a < m) return i * 10 + 10 * (m - a) / (b - a);
    }
    return null;
  }
  // Temperature where two rising/flat curves cross (first crossing on the table grid).
  function crossing(a, b) {
    for (let i = 0; i < 10; i++) {
      const d0 = TABLE[a][i] - TABLE[b][i], d1 = TABLE[a][i + 1] - TABLE[b][i + 1];
      if (d0 === 0) return i * 10;
      if (d0 * d1 < 0) return i * 10 + 10 * d0 / (d0 - d1);
    }
    return null;
  }

  // Step 4: start with a solution saturated at T0 in w0 g of water; cool to T and/or boil off e g of water.
  function crystallise(sub, T0, w0, T, e) {
    const d0 = S(sub, T0) * w0 / 100, wLeft = w0 - e, keep = S(sub, T) * wLeft / 100;
    const out = Math.max(0, d0 - keep);
    return { d0, wLeft, keep: Math.min(d0, keep), out, share: out / d0 };
  }

  // Step 1: toy particle model. Each particle stands for GRAM grams. While any solid is present it dissolves at
  // KD particles per second (fixed crystal surface) and each dissolved particle rejoins the crystal at KC per
  // second, so the dissolved count settles where KD = KC·n, i.e. n = KD/KC (the saturation capacity).
  const P = { GRAM: 0.1, KD: 36, KC: 0.1, DT: 0.05 };
  P.CAP = P.KD / P.KC;              // 360 particles = 36 g, NaCl in 100 g water at 20 °C
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function poisson(r, lam) { // Knuth; λ = 1.8 here
    const L = Math.exp(-lam); let k = 0, p = 1;
    do { k++; p *= r(); } while (p > L);
    return k - 1;
  }
  // State: solid and dissolved particles, each with a tag flag. Returns an object with step() and history.
  function makeSim(grams, seed = 20261109) {
    const r = rng(seed), n0 = Math.round(grams / P.GRAM);
    const s = { t: 0, solid: [], dis: [], hist: [], events: [], r };
    for (let i = 0; i < n0; i++) s.solid.push({ id: i, tag: false });
    s.step = () => {
      let nd = 0, nc = 0;
      // Crystallising needs a crystal surface — or a solution past capacity, which grows a new crystal.
      if (s.solid.length || s.dis.length > P.CAP) {
        nd = s.solid.length ? Math.min(s.solid.length, poisson(r, P.KD * P.DT)) : 0;
        // each dissolved particle rejoins with probability KC·DT
        const back = [];
        for (let i = s.dis.length - 1; i >= 0; i--) if (r() < P.KC * P.DT) { back.push(s.dis[i]); s.dis.splice(i, 1); }
        nc = back.length;
        for (let i = 0; i < nd; i++) { const k = Math.floor(r() * s.solid.length); const q = s.solid[k]; q.x = r(); q.y = r(); s.dis.push(q); s.solid.splice(k, 1); }
        back.forEach(p => s.solid.push(p));
      }
      s.t = Math.round((s.t + P.DT) * 1000) / 1000;
      s.events.push({ t: s.t, nd, nc });
      s.hist.push({ t: s.t, dissolved: s.dis.length * P.GRAM, solid: s.solid.length * P.GRAM, tagIn: s.dis.filter(p => p.tag).length });
      return s;
    };
    // Rates over the last `win` seconds, in g/s.
    s.rates = (win = 3) => {
      const ev = s.events.filter(e => e.t > s.t - win + 1e-9), span = Math.min(win, s.t) || 1;
      return { dissolve: ev.reduce((a, e) => a + e.nd, 0) * P.GRAM / span, crystal: ev.reduce((a, e) => a + e.nc, 0) * P.GRAM / span };
    };
    s.addTagged = grams2 => { const k = Math.round(grams2 / P.GRAM); for (let i = 0; i < k; i++) s.solid.push({ id: 1e5 + i, tag: true }); };
    s.run = until => { while (s.t < until - 1e-9) s.step(); return s; };
    return s;
  }

  // Moving-average dissolving / crystallising rates (g/s) over the last `win` seconds, one point per step.
  function smoothRates(sim, win = 4) {
    const ev = sim.events, out = [], k = Math.round(win / P.DT); let a = 0, b = 0;
    for (let i = 0; i < ev.length; i++) {
      a += ev[i].nd; b += ev[i].nc;
      if (i - k >= 0) { a -= ev[i - k].nd; b -= ev[i - k].nc; }
      const span = Math.min(win, ev[i].t);
      out.push({ t: ev[i].t, d: a * P.GRAM / span, c: b * P.GRAM / span });
    }
    return out;
  }

  const trim = s => (s.indexOf('.') < 0 ? s : s.replace(/0+$/, '').replace(/\.$/, ''));
  const fix = (v, d) => { const s = v.toFixed(d); return Number(s) === 0 ? (0).toFixed(d) : s; };

  const api = { TABLE, S, mix, dissolveAllT, crossing, crystallise, P, rng, poisson, makeSim, smoothRates, trim, fix };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SOL_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
