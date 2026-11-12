/* How soy sauce gets its flavour: the page's models. Each one implements a named, published result; constants
   that are fitted or tuned (not taken from a source) are marked TUNED here and flagged on the page.
   UMD: window.SoyModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SoyModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ── shared growth laws ──
     Cardinal temperature model with inflection (Rosso et al. 1993, J Theor Biol 162:447):
       γ(T) = (T−Tmax)(T−Tmin)² / ((Topt−Tmin)[(Topt−Tmin)(T−Topt) − (Topt−Tmax)(Topt+Tmin−2T)])
     Cardinal pH model (Rosso et al. 1995, Appl Environ Microbiol 61:610):
       γ(pH) = (pH−pHmin)(pH−pHmax) / [(pH−pHmin)(pH−pHmax) − (pH−pHopt)²]
     Both are 1 at the optimum and 0 outside (min, max). */
  function ctmi(T, a, o, b) {
    if (T <= a || T >= b) return 0;
    return (T - b) * (T - a) * (T - a) / ((o - a) * ((o - a) * (T - o) - (o - b) * (o + a - 2 * T)));
  }
  function cpm(x, a, o, b) {
    if (x <= a || x >= b) return 0;
    const n = (x - a) * (x - b); return n / (n - (x - o) * (x - o));
  }

  /* ── water activity of a NaCl solution: Pitzer ion-interaction model (Pitzer & Mayorga 1973), 25 °C.
     The same implementation as the fermented-tofu essay (its #ch4 checks it against Hamer & Wu). w = % NaCl w/w. */
  const water = {
    P: { A: 0.3915, b: 1.2, alpha: 2, b0: 0.0765, b1: 0.2664, c: 0.00127, Mw: 0.018015, MNaCl: 58.44 },
    SAT: 26.4,
    molality(w) { return (w / this.P.MNaCl) / ((100 - w) / 1000); },
    phi(m) { const P = this.P, s = Math.sqrt(m); return 1 - P.A * s / (1 + P.b * s) + m * (P.b0 + P.b1 * Math.exp(-P.alpha * s)) + m * m * P.c; },
    aw(w) { const m = this.molality(Math.min(w, this.SAT)); return m <= 0 ? 1 : Math.exp(-2 * m * this.phi(m) * this.P.Mw); },
    wForAw(x) { let lo = 0, hi = this.SAT; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (this.aw(m) > x) lo = m; else hi = m; } return (lo + hi) / 2; }
  };

  /* ── 02 koji: logistic growth whose rate follows the cardinal temperature model, plus a lumped heat balance
     (the "well-mixed bed" of Saucedo-Castañeda et al. 1990 and Mitchell et al.): the heat a bed makes is
     proportional to growth, and it loses heat to the air at a rate that, for a bed cooled through its surfaces,
     scales as 1/depth² (the diffusion time L²/α).
       dX/dt = μ γ(T) X (1 − X)          dT/dt = Q dX/dt − k (4 cm / depth)² (T − Tair)
     Cardinal temperatures for A. oryzae: Tmin 8, Topt 34, Tmax 46 °C, the middle of the ranges quoted for koji
     (optimum 32–36, minimum 7–9, maximum 45–47 °C; secondary sources only, no primary measurement found — the
     reviewer pinned the effect of moving Topt and Tmax across those ranges in tests/models.cjs). Turning (手入れ) returns the bed to air temperature.
     TUNED: μ (0.4 /h) and X0 so that growth finishes in about a day and a half at 30 °C (koji takes 2–3 days,
     Ito & Matsuyama 2021); Q (60 °C) and k (0.5 /h at 4 cm) so that a 4 cm tray at 30 °C peaks just under 40 °C
     (trays are 3–5 cm, Devanthi & Gkatzionis 2019; the bed is kept below 40 °C, J Fungi 2021 miso review). */
  const koji = {
    T: { min: 8, opt: 34, max: 46 },
    mu: 0.4, X0: 1e-4, Q: 60, k4: 0.5, H: 60, DT: 0.01,
    run(depth, Tair, every, opts) {
      const o = Object.assign({ mu: this.mu, Q: this.Q, k4: this.k4 }, opts || {}), Tc = Object.assign({}, this.T, (opts && opts.T) || {});
      const kc = o.k4 * Math.pow(4 / depth, 2), dt = this.DT, nS = Math.round(1 / dt), steps = Math.round(this.H / dt);
      let X = this.X0, T = Tair, peak = T, over40 = 0, t90 = null, nTurn = 0; const pts = [];
      const turnAt = new Set(); if (every) for (let h = 12; h < this.H; h += every) turnAt.add(Math.round(h / dt));
      for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        if (turnAt.has(i)) { T = Tair; nTurn++; } // turning from hour 12 (heat starts about 10 h after inoculation)
        const g = o.mu * ctmi(T, Tc.min, Tc.opt, Tc.max) * X * (1 - X);
        if (i % nS === 0) pts.push({ t, X, T });
        if (t90 == null && X >= 0.9) t90 = t;
        X += dt * g; T += dt * (o.Q * g - kc * (T - Tair));
        if (T > peak) peak = T; if (T > 40) over40 += dt;
      }
      return { pts, peak, over40, t90, X, nTurn };
    },
    // the deepest bed (cm) that stays at or below `lim` °C with no turning
    maxDepth(Tair, lim, opts) { let lo = 1, hi = 40; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (this.run(m, Tair, 0, opts).peak <= lim) lo = m; else hi = m; } return lo; }
  };

  /* ── 03 why wheat: a mass balance. Composition per 100 g from USDA FoodData Central (SR Legacy):
     soybeans, mature seeds, raw (FDC 174270) and wheat, hard red winter (FDC 168890). "Available carbohydrate"
     is carbohydrate by difference minus total dietary fibre. Style ratios: Japanese koikuchi about equal soybean and
     wheat (JAS 1703; Ito & Matsuyama 2021); Chinese 80:20 and 70:30 and tamari with little or no wheat
     (Diez-Simon et al. 2020). */
  const mix = {
    SOY: { protein: 36.5, carb: 30.2, fibre: 9.3 },
    WHEAT: { protein: 12.6, carb: 71.2, fibre: 12.2 },
    at(s) { // s = soybean share of the dry mix, 0..1
      const S = this.SOY, W = this.WHEAT, prot = s * S.protein + (1 - s) * W.protein;
      const carb = s * (S.carb - S.fibre) + (1 - s) * (W.carb - W.fibre);
      return { prot, carb, ratio: carb / prot };
    },
    // sugar available to the brine organisms relative to koikuchi (50:50). ASSUMPTION: proportional to available carbohydrate.
    sugar(s) { return this.at(s).carb / this.at(0.5).carb; },
    STYLES: [{ id: 'tamari', s: 0.95 }, { id: 'cn80', s: 0.8 }, { id: 'cn70', s: 0.7 }, { id: 'koiku', s: 0.5 }]
  };

  /* ── 04 the relay in brine. Two populations, each growing logistically at a rate set by gamma factors
     (Zwietering et al. 1992, the "gamma concept": μ = μopt · γ(T) · γ(pH) · γ(aw) · S/(Ks+S)).
     T. halophilus (lactic acid bacterium): γ(pH) by the cardinal pH model with pHmin 5.0 (no growth at pH 5.0),
       pHopt 7.0 and pHmax 9.5 (grows to pH 9.0) — Justé et al., "Genus Tetragenococcus"; γ(aw) linear from
       aw 0.83 (no growth at 23% NaCl, aw 0.83, Justé) to the aw of 10% NaCl (best at 5–10% salt, Ito & Matsuyama 2021).
     Z. rouxii (yeast): pHopt 4.5 and a window that at 18% salt is about pH 4.0–5.0 (Röling et al. 1994, via
       Devanthi & Gkatzionis 2019) and fails above pH 5.5 (Watanabe & Tamai 1992, same review): modelled as the
       cardinal pH model with pHmin 3.5, pHopt 4.5 and pHmax 5.5 at ≥18% salt, widening linearly to 10.4 with no
       salt (Membré et al. 1999, fit at 25 °C without salt).
     Acid: Luedeking–Piret, non-growth term only (dA/dt = β L), switched off as pH approaches pAmin. pH = 6.0 − A
       (a linear buffer; starting pH 6.0, within the 6–7 reported by Ito & Matsuyama and Devanthi).
     Ethanol: made by the yeast in proportion to its population while sugar lasts; sugar used by acid and ethanol.
     Temperature: both organisms share one cardinal temperature curve, Topt 30 °C (T. halophilus best at 25–30 °C,
       J Fungi 2021 miso review), Tmax 45 °C (TUNED), Tmin 6 °C (TUNED).
     TUNED and fitted: muL, L0, bNG, pAmin and Tmin were fitted by grid search to the pH of a Cantonese-style
       laboratory moromi at 30 °C and at 15 °C (Zhou et al. 2019, Molecules 24:1474, Table 1, the 30 °C series from day 10 and the 15 °C series on days 10 and 20; RMS 0.08 pH on those
       points, 0.15 against all fourteen points of the two laboratory series — see ZHOU30_ALL / ZHOU15_ALL).
       muY, eY, yields, Ks and kd are TUNED so that a koikuchi-like mash ends with about 3% ethanol (Z. rouxii makes
       2–4%, Ito & Matsuyama 2021). Sugar is in units where koikuchi = 1. */
  const relay = {
    L: { pmin: 5.0, popt: 7.0, pmax: 9.5, awMin: 0.83, wOpt: 10 },
    Yp: { pmin: 3.5, popt: 4.5, pmax18: 5.5, pmax0: 10.4 },
    T: { min: 6, opt: 30, max: 45 },
    K: { muL: 4, L0: 0.1, bNG: 0.7, pAmin: 4.55, kd: 0.1, muY: 0.5, Y0: 1e-4, Ks: 0.1, eY: 0.06, yES: 0.25, yLS: 0.15 },
    PH0: 6.0, DAYS: 180, DT: 0.02,
    gSaltL(w) { const a = water.aw(w), a1 = water.aw(this.L.wOpt); return clamp((a - this.L.awMin) / (a1 - this.L.awMin), 0, 1); },
    pmaxY(w) { const y = this.Yp; return y.pmax18 + (y.pmax0 - y.pmax18) * Math.max(0, 1 - w / 18); },
    run(w, T, s0, opts) {
      const k = Object.assign({}, this.K, (opts && opts.K) || {}), Tm = Object.assign({}, this.T, (opts && opts.T) || {});
      const days = (opts && opts.days) || this.DAYS, dt = this.DT, nS = Math.round(1 / dt);
      const gT = ctmi(T, Tm.min, Tm.opt, Tm.max), gS = this.gSaltL(w), pmy = this.pmaxY(w);
      let L = k.L0, Y = k.Y0, S = s0, A = 0, E = 0; const pts = [];
      let d55 = null, d5 = null, dY = null;
      for (let i = 0; i <= Math.round(days / dt); i++) {
        const t = i * dt, pH = this.PH0 - A, f = S / (k.Ks + S);
        if (i % nS === 0) pts.push({ t: Math.round(t), pH, L, Y, S, E });
        if (d55 == null && pH < 5.5) d55 = t; if (d5 == null && pH < 5.0) d5 = t; if (dY == null && Y >= 0.5) dY = t;
        const gpL = cpm(pH, this.L.pmin, this.L.popt, this.L.pmax), gpY = cpm(pH, this.Yp.pmin, this.Yp.popt, pmy);
        const grL = gT * k.muL * gS * gpL * f * L * (1 - L), dieL = gpL === 0 ? k.kd * L : 0;
        const grY = gT * k.muY * gpY * f * Y * (1 - Y);
        const gA = clamp((pH - k.pAmin) / (7 - k.pAmin), 0, 1);
        const dA = gT * gS * k.bNG * L * f * gA, dE = gpY > 0 ? gT * k.eY * Y * f : 0;
        L += dt * (grL - dieL); Y += dt * grY; A += dt * dA; E += dt * dE;
        S = Math.max(0, S - dt * (dA * k.yLS + dE * k.yES));
      }
      return { pts, d55, d5, dY, gS, aw: water.aw(w), end: pts[pts.length - 1] };
    },
    // the brine salt above which the yeast never takes over within `days`
    failSalt(T, s0, opts) { let lo = 10, hi = 24; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (this.run(m, T, s0, Object.assign({ days: 180 }, opts)).dY != null) lo = m; else hi = m; } return lo; },
    // the temperature below which the yeast never takes over within 180 days
    failTemp(w, s0, opts) { let lo = 5, hi = 30; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (this.run(w, m, s0, opts).dY != null) hi = m; else lo = m; } return hi; },
    // Zhou et al. 2019 Table 1: laboratory moromi pH, day → pH; the points the fit used
    ZHOU30: [[10, 5.15], [20, 4.88], [30, 4.82], [45, 4.70], [60, 4.65], [90, 4.65]],
    ZHOU15: [[10, 5.61], [20, 5.51]],
    // the whole of both laboratory series in Table 1 (reviewer, 2026-11-12: the 15 °C series runs to day 90, and both
    // start at pH 6.02 on day 5); the fit above used only part of them, and the page reports the error against all.
    ZHOU30_ALL: [[5, 6.02], [10, 5.15], [20, 4.88], [30, 4.82], [45, 4.70], [60, 4.65], [90, 4.65]],
    ZHOU15_ALL: [[5, 6.02], [10, 5.61], [20, 5.51], [30, 5.01], [45, 4.88], [60, 4.66], [90, 4.69]]
  };

  /* ── 05 browning: the Arrhenius equation. k(T)/k(Tref) = exp(−Ea/R · (1/T − 1/Tref)).
     Ea for the Maillard reaction differs with the system: 109 kJ/mol for glucose + glycine at pH 5.5, 125 for
     casein + lactose, 145 for glucose + phenylalanine at pH 7 (review, Foods 2025, PMC12154226); about 20 kJ/mol
     for colour in heated sugarcane juice (PMC12191478). No value measured on soy sauce was found: the slider
     spans this range. Pasteurisation 70–80 °C for 30 min (Devanthi & Gkatzionis 2019). */
  const brown = {
    R: 8.314, EA: 109, EA_RANGE: [20, 145],
    ratio(T, Ea, Tref) { Ea = (Ea == null ? this.EA : Ea) * 1000; Tref = Tref == null ? 25 : Tref; return Math.exp(-Ea / this.R * (1 / (T + 273.15) - 1 / (Tref + 273.15))); },
    // days at 25 °C that do the same amount of reaction as `days` at T
    eqDays(T, days, Ea) { return days * this.ratio(T, Ea); },
    CASES: [
      { id: 'brew', T: 30, d: 180 },
      { id: 'heat', T: 80, d: 30 / 1440 },
      { id: 'shelf', T: 25, d: 30 },
      { id: 'warm', T: 35, d: 30 },
      { id: 'fridge', T: 5, d: 30 }
    ]
  };

  /* ── 07 the label number: amino-acid nitrogen (formol titration: titrate to pH 8.2, add formaldehyde, titrate
     to pH 9.2; every free amino group counts, ammonium included — GB 5009.235, as used in PMC12692206 and Zheng
     et al. 2024). Added monosodium glutamate monohydrate (C5H8NO4Na·H2O, 187.13 g/mol) carries one amino group:
     14.007/187.13 = 7.49% of its mass is titratable nitrogen.
     Grades: GB/T 18186-2025 Table 2 (高盐稀态): 特级 ≥0.80, 一级 ≥0.70, 二级 ≥0.55, 三级 ≥0.40 g/100 mL;
     low-salt solid state 0.80/0.70/0.60/0.40. Ammonium ≤28% of AAN (2025 edition; 30% in the 2000 edition).
     GB 2717-2018: AAN ≥0.4 g/100 mL. */
  const label = {
    N_MSG: 14.007 / 187.13,
    GRADES: { hs: [0.80, 0.70, 0.55, 0.40], ls: [0.80, 0.70, 0.60, 0.40] },
    NH4_MAX: { e2000: 0.30, e2025: 0.28 },
    MIN: 0.4,
    read(brew, msg, nh4) { // brewed amino N, g MSG·H2O per 100 mL, ammonium N — all g/100 mL
      const fromMsg = msg * this.N_MSG, aan = brew + fromMsg + nh4;
      const g = this.GRADES.hs, grade = aan >= g[0] ? 0 : aan >= g[1] ? 1 : aan >= g[2] ? 2 : aan >= g[3] ? 3 : 4;
      const g0 = brew + nh4 >= g[0] ? 0 : brew + nh4 >= g[1] ? 1 : brew + nh4 >= g[2] ? 2 : brew + nh4 >= g[3] ? 3 : 4;
      return { fromMsg, aan, grade, gradeNoMsg: g0, nh4Share: aan > 0 ? nh4 / aan : 0 };
    },
    msgFor(from, to) { return (to - from) / this.N_MSG; }
  };

  /* ── 09 salt: per 100 g, Standard Tables of Food Composition in Japan 2020 (8th rev.) with the 2023 supplement:
     こいくち 17007, うすくち 17008, たまり 17009, 減塩こいくち 17086. Sodium mg and salt-equivalent g. */
  const salt = {
    MEXT: [
      { id: 'koiku', na: 5700, salt: 14.5 }, { id: 'usu', na: 6300, salt: 16.0 },
      { id: 'tamari', na: 5100, salt: 13.0 }, { id: 'gen', na: 3300, salt: 8.3 }
    ],
    per(id, g) { const r = this.MEXT.find(x => x.id === id); return { na: r.na * g / 100, salt: r.salt * g / 100 }; }
  };

  /* ── number formatting shared by the page and the node test (same digits in zh and en; no 万/亿) */
  function fmt(x, d) {
    d = d || 0; if (!isFinite(x)) return '—';
    const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
    return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  const pct = (x, d) => fmt(x * 100, d || 0) + '%';
  const sig = x => fmt(x, x >= 100 ? 0 : x >= 10 ? 1 : x >= 1 ? 2 : 3);
  const days = x => x >= 100 ? fmt(x) : x >= 1 ? fmt(x, 1) : x * 24 >= 1 ? fmt(x * 24, 1) : fmt(x * 1440); // value only; unit chosen by dayUnit
  const dayUnit = x => x >= 1 ? 'd' : x * 24 >= 1 ? 'h' : 'min';

  /* ── the live sentences: which template, and with which values. Values are strings, or {k: copy key},
     or {list: [copy keys]}; the page and the node test resolve them the same way. */
  const say = {
    koji(depth, Tair, every) {
      const r = koji.run(depth, Tair, every), v = { d: fmt(depth), a: fmt(Tair), p: fmt(r.peak, 1), h: fmt(r.over40, r.over40 < 10 ? 1 : 0), t: r.t90 == null ? '—' : fmt(r.t90) };
      if (r.t90 == null) return { key: 'ch2.say.stall', v };
      if (r.peak <= 40) return { key: 'ch2.say.cool', v };
      return { key: every ? 'ch2.say.hotTurn' : 'ch2.say.hot', v };
    },
    mix(s) {
      const m = mix.at(s), v = { s: pct(s), w: pct(1 - s), c: fmt(m.carb, 1), p: fmt(m.prot, 1), r: fmt(mix.sugar(s), 2) };
      return { key: s >= 1 ? 'ch3.say.allsoy' : s <= 0 ? 'ch3.say.allwheat' : 'ch3.say', v };
    },
    relay(w, T, s0, day) {
      const r = relay.run(w, T, s0), p = r.pts[Math.min(r.pts.length - 1, Math.round(day))];
      const v = { w: fmt(w, 1) + '%', T: fmt(T), aw: fmt(r.aw, 3), day: fmt(day), pH: fmt(p.pH, 2), e: fmt(p.E, 1) + '%',
        d5: r.d5 == null ? '—' : fmt(r.d5), dY: r.dY == null ? '—' : fmt(r.dY), eEnd: fmt(r.end.E, 1) + '%' };
      if (day < relay.DAYS) return { key: 'ch4.say.run', v };
      if (r.gS <= 0) return { key: 'ch4.say.noLab', v };
      if (r.dY == null) return { key: r.d5 == null ? 'ch4.say.slow' : 'ch4.say.late', v };
      if (r.aw > 0.9) return { key: 'ch4.say.lowSalt', v };
      return { key: 'ch4.say.ok', v };
    },
    brown(Ea) {
      const h = brown.CASES.find(c => c.id === 'heat'), e = brown.eqDays(h.T, h.d, Ea);
      return { key: 'ch5.say', v: { ea: fmt(Ea), heat: days(e), u: { k: 'unit.' + dayUnit(e) }, f: fmt(brown.ratio(25, Ea, 5), 1) } };
    },
    label(brew, msg, nh4) {
      const r = label.read(brew, msg, nh4), v = { a: fmt(r.aan, 2), m: fmt(r.fromMsg, 2), g: { k: 'ch7.grade.' + r.grade }, g0: { k: 'ch7.grade.' + r.gradeNoMsg }, n: pct(r.nh4Share) };
      if (r.nh4Share > label.NH4_MAX.e2025) return { key: 'ch7.say.nh4', v };
      if (msg > 0 && r.grade !== r.gradeNoMsg) return { key: 'ch7.say.msg', v };
      if (r.aan < label.MIN) return { key: 'ch7.say.low', v };
      return { key: 'ch7.say', v };
    },
    cut(day) {
      const r = relay.run(17, 30, 1), p = r.pts[Math.round(day)];
      const v = { day: fmt(day), pH: fmt(p.pH, 2), e: fmt(p.E, 1) + '%', b: fmt(brown.eqDays(30, day)), dY: fmt(r.dY) };
      return { key: day < r.d5 ? 'ch8.say.early' : day < r.dY ? 'ch8.say.mid' : 'ch8.say.late', v };
    },
    salt(id, g) { const p = salt.per(id, g); return { key: 'ch9.say', v: { s: { k: 'ch9.style.' + id }, g: fmt(g), na: fmt(p.na), c: fmt(p.salt, 1) } }; }
  };

  return { clamp, ctmi, cpm, water, koji, mix, relay, brown, label, salt, fmt, pct, sig, days, dayUnit, say };
});
