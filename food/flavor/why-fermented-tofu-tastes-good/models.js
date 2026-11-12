/* Why fermented tofu tastes good: the page's models. Each one implements a named, published result; constants
   that are fitted or tuned (not taken from a source) are marked TUNED here and flagged on the page.
   UMD: window.TofuModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TofuModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // seeded RNG (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ── 01 random chain scission (Montroll & Simha 1940) ──
     A chain of N residues has N−1 bonds; each is cut independently with probability p. An end residue is free when
     its one bond is cut (p); an interior residue when both are (p²). Expected free share = (2p + (N−2)p²)/N → p². */
  const scission = {
    freeFraction(p, N) { return N < 2 ? 1 : (2 * p + (N - 2) * p * p) / N; },
    pForFree(f) { return Math.sqrt(f); }, // long-chain inverse
    meanLength(p, N) { return N / (1 + (N - 1) * p); }, // fragments = 1 + cuts
    // a sample of chains with cuts drawn at probability p; returns per-chain cut arrays and the counted free share
    sample(seed, chains, N, p) {
      const r = rng(seed), out = []; let free = 0;
      for (let c = 0; c < chains; c++) {
        const u = []; for (let b = 0; b < N - 1; b++) u.push(r());
        const cut = u.map(x => x < p);
        for (let i = 0; i < N; i++) { const left = i === 0 || cut[i - 1], right = i === N - 1 || cut[i]; if (left && right) free++; }
        out.push(cut);
      }
      return { cuts: out, free: free / (chains * N) };
    }
  };

  /* ── 02 endo- and exopeptidases: the linear fragmentation equation (Ziff & McGrady 1985) for random scission,
     plus first-order trimming of one residue from each chain end (exopeptidase, Michaelis–Menten at low substrate).
     n[L] = number of fragments of length L per original chain. Time in days of ripening.
     TUNED: kE, kX are chosen so that "both" frees about a quarter of the residues by day 80, the order of the
     FAA/CP 0.24–0.26 Han et al. (2003, 2004) measured in red sufu at 8% salt; they are not measured enzyme rates. */
  const enzymes = {
    N: 200, kE: 0.002, kX: 0.0219,
    create(N) { const n = new Float64Array((N || this.N) + 1); n[n.length - 1] = 1; return { t: 0, n, N: n.length - 1 }; },
    rates(n, N, kE, kX, out) {
      out.fill(0);
      // endo: each of L−1 bonds cut at kE; a cut of an L-chain yields fragments j and L−j, every j<L twice
      let suffix = 0;
      for (let L = N; L >= 1; L--) {
        out[L] += 2 * kE * suffix; // gain from all longer fragments
        if (L >= 2) out[L] -= kE * (L - 1) * n[L];
        suffix += n[L];
      }
      // exo: chains L≥3 lose one end residue at 2kX; a dipeptide splits at kX into two free residues
      for (let L = 3; L <= N; L++) { const r = 2 * kX * n[L]; out[L] -= r; out[L - 1] += r; out[1] += r; }
      if (N >= 2) { const r = kX * n[2]; out[2] -= r; out[1] += 2 * r; }
      return out;
    },
    step(s, h, kE, kX) {
      const N = s.N, k1 = new Float64Array(N + 1), k2 = new Float64Array(N + 1), k3 = new Float64Array(N + 1), k4 = new Float64Array(N + 1), y = new Float64Array(N + 1);
      this.rates(s.n, N, kE, kX, k1);
      for (let i = 0; i <= N; i++) y[i] = s.n[i] + h / 2 * k1[i]; this.rates(y, N, kE, kX, k2);
      for (let i = 0; i <= N; i++) y[i] = s.n[i] + h / 2 * k2[i]; this.rates(y, N, kE, kX, k3);
      for (let i = 0; i <= N; i++) y[i] = s.n[i] + h * k3[i]; this.rates(y, N, kE, kX, k4);
      for (let i = 0; i <= N; i++) s.n[i] += h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
      s.t += h;
    },
    modeK(mode) { return { kE: mode === 'exo' ? 0 : this.kE, kX: mode === 'endo' ? 0 : this.kX }; },
    free(s) { return s.n[1] / s.N; },
    fragments(s) { let f = 0; for (let L = 1; L <= s.N; L++) f += s.n[L]; return f; },
    meanPeptide(s) { let f = 0, m = 0; for (let L = 2; L <= s.N; L++) { f += s.n[L]; m += L * s.n[L]; } return f > 1e-12 ? m / f : 0; },
    // whole trajectory, sampled every `every` days
    run(mode, days, h, every) {
      const { kE, kX } = this.modeK(mode), s = this.create(), out = [{ t: 0, free: 0, frags: 1, mean: s.N, hist: Array.from(s.n) }];
      h = h || 0.25; every = every || 1;
      const steps = Math.round(days / h), per = Math.round(every / h);
      for (let i = 1; i <= steps; i++) { this.step(s, h, kE, kX); if (i % per === 0) out.push({ t: +(i * h).toFixed(6), free: this.free(s), frags: this.fragments(s), mean: this.meanPeptide(s), hist: Array.from(s.n) }); }
      return out;
    },
    dayToReach(mode, target, maxDays) { const r = this.run(mode, maxDays || 400, 0.25, 0.25); const x = r.find(q => q.free >= target); return x ? x.t : null; }
  };

  /* ── 03 umami: Yamaguchi's equivalent umami concentration (Yamaguchi, Yoshikawa, Ikeda & Ninomiya 1971)
     EUC = Σaᵢbᵢ + 1218 (Σaᵢbᵢ)(Σaⱼbⱼ), concentrations in g/100 g, result in g MSG per 100 g.
     Relative umami: Glu 1, Asp 0.077; IMP 1, GMP 2.3, AMP 0.18. Thresholds (mg/100 g) from Gao et al. 2022 Table 1–2. */
  const umami = {
    K: 1218, AA: { glu: 1, asp: 0.077 }, NUC: { imp: 1, gmp: 2.3, amp: 0.18 },
    TH: { glu: 30, asp: 100, imp: 25, gmp: 12.5, amp: 50, succinic: 10.6 },
    // mg/100 g
    FOOD: {
      sufu: { glu: 152.5, asp: 72.5, imp: 0 },   // free Glu 1.29–1.76 g/kg, Asp 0.69–0.76 g/kg (PMC8358361), mid-points; nucleotides not measured
      pork: { glu: 10, asp: 0, imp: 230 },        // Umami Information Center
      yolkFresh: { glu: 17.45, asp: 0, imp: 0.0094, gmp: 0.019, amp: 0.012, succinic: 278.42, faa: 140.72 }, // Gao 2022, day 0 (yolk only)
      yolkPreserved: { glu: 13.14, asp: 6.40, imp: 0.0018, gmp: 0.017, amp: 0.016, succinic: 280.87, faa: 106.92 } // day 35
    },
    sums(f) {
      const g = x => (x || 0) / 1000; // mg/100 g → g/100 g
      const u = g(f.glu) * this.AA.glu + g(f.asp) * this.AA.asp;
      const v = g(f.imp) * this.NUC.imp + g(f.gmp) * this.NUC.gmp + g(f.amp) * this.NUC.amp;
      return { u, v };
    },
    euc(f) { const { u, v } = this.sums(f); return u + this.K * u * v; }, // g MSG / 100 g
    eucNoSynergy(f) { return this.sums(f).u; },
    mix(a, b, wa) { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = wa * (a[k] || 0) + (1 - wa) * (b[k] || 0); return o; },
    tav(mg, key) { return mg / this.TH[key]; },
    bestMix(a, b) { let best = { w: 0, e: -1 }; for (let i = 0; i <= 1000; i++) { const w = i / 1000, e = this.euc(this.mix(a, b, w)); if (e > best.e) best = { w, e }; } return best; }
  };

  /* ── 04 water activity of a NaCl brine: Pitzer ion-interaction model (Pitzer & Mayorga 1973), 25 °C.
     φ = 1 − Aφ√m/(1+b√m) + m(β0 + β1 e^(−α√m)) + m²Cφ ;  a_w = exp(−2 m φ Mw). Valid to about 6 mol/kg. */
  const water = {
    P: { A: 0.3915, b: 1.2, alpha: 2, b0: 0.0765, b1: 0.2664, c: 0.00127, Mw: 0.018015, MNaCl: 58.44 },
    SAT: 26.4, // NaCl saturation, % w/w at 25 °C (≈ 6.15 mol/kg)
    molality(w) { return (w / this.P.MNaCl) / ((100 - w) / 1000); },
    phi(m) { const P = this.P, s = Math.sqrt(m); return 1 - P.A * s / (1 + P.b * s) + m * (P.b0 + P.b1 * Math.exp(-P.alpha * s)) + m * m * P.c; },
    aw(w) { const m = this.molality(Math.min(w, this.SAT)); return m <= 0 ? 1 : Math.exp(-2 * m * this.phi(m) * this.P.Mw); },
    // minimum a_w for growth, FDA/IFT "Safe Practices for Food Processes" ch. 3, Table 3-2 (from ICMSF 1996)
    LIMITS: [
      { id: 'campy', aw: 0.98 }, { id: 'botE', aw: 0.97 }, { id: 'ecoli', aw: 0.95 }, { id: 'salm', aw: 0.94 },
      { id: 'botAB', aw: 0.94 }, { id: 'bcer', aw: 0.93 }, { id: 'list', aw: 0.92 }, { id: 'saurT', aw: 0.88 }, { id: 'saur', aw: 0.83 }
    ],
    growers(aw) { return this.LIMITS.filter(l => aw >= l.aw).map(l => l.id); },
    // brine % at which a_w falls to x
    wForAw(x) { let lo = 0, hi = this.SAT; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (this.aw(m) > x) lo = m; else hi = m; } return (lo + hi) / 2; },
    /* ripening: free amino acids in red sufu over 80 days (Han et al. 2004, JFCA 17:363), mg/g dry matter.
       Rates are (day-80 − day-0)/80; the straight line through them is our own least-squares fit (flagged). */
    HAN: [{ s: 8, a: 28, b: 88 }, { s: 11, a: 28, b: 63 }, { s: 14, a: 26, b: 42 }],
    rate(s) { return (s.b - s.a) / 80; },
    fit() {
      const xs = this.HAN.map(h => h.s), ys = this.HAN.map(h => this.rate(h)), n = xs.length;
      const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
      let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
      const slope = sxy / sxx; return { slope, icpt: my - slope * mx, zero: -(my - slope * mx) / slope };
    },
    rateAt(s) { const f = this.fit(); return Math.max(0, f.icpt + f.slope * s); },
    daysTo(s, rise) { const r = this.rateAt(s); return r > 0 ? rise / r : Infinity; }
  };

  /* ── 05 / 08 aroma: odour activity value OAV = concentration ÷ odour threshold (Rothe & Thomas 1963), and the
     aroma-extract-dilution idea (Ullrich & Grosch 1987): diluted FD-fold, a compound is still smelled while OAV ≥ FD.
     Data: stinky tofu during storage, Foods 2023, 12, 1451 (PMC10093793), mg/kg, days 1,3,5,7,10,13; thresholds mg/kg
     in water from the same paper. OAV here is computed from its concentration table.
     All 28 compounds that have both a concentration (Table 2) and a threshold (Table 3) in the paper are included
     (reviewer, 2026-11-12: the first version carried 14 of them, which undercounted what can be smelled). Hexanal has a
     threshold but no concentration row and is left out; 1-dodecanol appears twice in Table 2 and the row with a day-7
     value (No. 27) is used. */
  const aroma = {
    DAYS: [1, 3, 5, 7, 10, 13],
    C: [
      { id: 'methylbutanol', th: 0.02, g: 'fruit', c: [0.041, 0.029, 0.011, 0, 0, 0] },
      { id: 'heptanol', th: 0.003, g: 'green', c: [0.021, 0.022, 0.034, 0.051, 0.223, 0.044] },
      { id: 'octenol2', th: 0.02, g: 'fruit', c: [0.062, 0.042, 0.011, 0, 0, 0] },
      { id: 'dodecanol', th: 0.016, g: 'fruit', c: [0, 0, 0, 0.138, 0.228, 0.412] },
      { id: 'ethylpropanoate', th: 0.01, g: 'fruit', c: [0, 0, 0, 0, 0, 0.094] },
      { id: 'pentylacetate', th: 0.043, g: 'fruit', c: [0, 0, 0, 0, 0, 0.074] },
      { id: 'hexylpropanoate', th: 0.008, g: 'fruit', c: [0, 0, 0, 0, 0, 0.327] },
      { id: 'ethylbenzaldehyde', th: 0.013, g: 'fruit', c: [0.056, 0.042, 0.032, 0.013, 0, 0] },
      { id: 'octenal', th: 0.003, g: 'fat', c: [0.056, 0.071, 0.097, 0.052, 0, 0] },
      { id: 'heptenal', th: 0.013, g: 'green', c: [0.052, 0.059, 0.064, 0.054, 0, 0] },
      { id: 'decanal', th: 0.003, g: 'fat', c: [0, 0, 0.035, 0, 0, 0] },
      { id: 'mebutanoic2', th: 0.1, g: 'stink', c: [0.182, 0.374, 0.263, 0.118, 0, 0] },
      { id: 'acetophenone', th: 0.065, g: 'fruit', c: [0.124, 0.082, 0.039, 0, 0, 0] },
      { id: 'guaiacol', th: 0.0016, g: 'stink', c: [0, 0.017, 0.041, 0.018, 0, 0] },
      { id: 'decadienal', th: 0.000027, g: 'fat', c: [0.043, 0.065, 0.113, 0.298, 0.314, 0.241] },
      { id: 'nonenal', th: 0.00019, g: 'green', c: [0, 0, 0.048, 0, 0, 0] },
      { id: 'decenal', th: 0.0003, g: 'fat', c: [0.022, 0.037, 0.055, 0.085, 0.074, 0.051] },
      { id: 'nonadienal', th: 0.0001, g: 'fat', c: [0.007, 0.014, 0.018, 0, 0, 0] },
      { id: 'nonanal', th: 0.0011, g: 'green', c: [0.049, 0.062, 0.189, 0.049, 0.014, 0] },
      { id: 'octenol', th: 0.0015, g: 'green', c: [0.186, 0.262, 0.259, 0.211, 0.056, 0] },
      { id: 'cresol', th: 0.01, g: 'stink', c: [0.367, 1.014, 1.316, 1.716, 1.807, 2.031] },
      { id: 'butanoic', th: 0.204, g: 'stink', c: [1.367, 2.495, 3.471, 4.173, 5.692, 7.501] },
      { id: 'mebutanoic', th: 0.046, g: 'stink', c: [0, 0.331, 0, 0, 0, 0] },
      { id: 'hexylacetate', th: 0.002, g: 'fruit', c: [0, 0.011, 0.014, 0.019, 0.095, 1.862] },
      { id: 'ethylacetate', th: 0.005, g: 'fruit', c: [0, 0, 0, 0, 0.011, 0.329] },
      { id: 'phenethylacetate', th: 0.24959, g: 'fruit', c: [0, 0, 0, 0, 0.734, 12.172] },
      { id: 'hexanol', th: 0.07, g: 'green', c: [0.704, 0.765, 0.827, 0.955, 0.234, 0.157] },
      { id: 'pentylfuran', th: 0.0058, g: 'green', c: [0.088, 0.084, 0.102, 0.082, 0.062, 0.046] }
    ],
    // acetic acid has the largest concentrations here but no threshold in the paper: shown, never ranked by OAV
    ACETIC: [1.014, 1.723, 2.035, 2.754, 3.299, 3.471],
    di(day) { const i = this.DAYS.indexOf(day); return i < 0 ? 0 : i; },
    oav(x, day) { return x.c[this.di(day)] / x.th; },
    table(day) { return this.C.map(x => ({ id: x.id, g: x.g, conc: x.c[this.di(day)], th: x.th, oav: this.oav(x, day) })); },
    byConc(day) { return this.table(day).sort((a, b) => b.conc - a.conc); },
    byOav(day) { return this.table(day).sort((a, b) => b.oav - a.oav); },
    smelled(day, fd) { return this.table(day).filter(r => r.oav >= fd); },
    groupSum(day, fd) { const o = { fat: 0, green: 0, stink: 0, fruit: 0 }; for (const r of this.table(day)) if (r.oav >= (fd || 1)) o[r.g] += r.oav / (fd || 1); return o; }
  };

  /* ── 06 century egg: diffusion into a sphere from a constant surface level (Crank, The Mathematics of Diffusion,
     eq. 6.18):  C/Cs = 1 + (2a/πr) Σ (−1)ⁿ/n · sin(nπr/a) · exp(−Dn²π²t/a²).
     TUNED: D is fitted so that the white's mean reaches 80% of the surface level in about 6 days and the yolk's in
     about 18 (white and yolk pH plateaus, PMC13632092). κ (surface free-alkali level per % NaOH in the bath) is
     tuned so that a 4–4.5% bath sits in the 0.5–1.0% gel window measured by adding NaOH to liquid egg (PMC13090318).
     Egg density 1.08 g/cm³ and yolk radius 0.7 of the egg are rounded assumptions. */
  const egg = {
    D: 7e-11, KAPPA: 0.2, RHO: 1.08, YOLK: 0.7, GEL: [0.5, 1.0], DWATER: 2 * 1.33 * 5.27 / (1.33 + 5.27) * 1e-9,
    radius(g) { return Math.cbrt(3 * g / (4 * Math.PI * this.RHO)) / 100; }, // metres
    u(r, a, t, D) {
      D = D || this.D; if (t <= 0) return r >= a ? 1 : 0;
      let s = 0;
      for (let n = 1; n <= 600; n++) {
        const e = Math.exp(-D * n * n * Math.PI * Math.PI * t / (a * a)); if (e < 1e-14) break;
        s += r < 1e-9 * a ? 2 * (n % 2 ? -1 : 1) * e : (2 * a / (Math.PI * r)) * ((n % 2 ? -1 : 1) / n) * Math.sin(n * Math.PI * r / a) * e;
      }
      return clamp(1 + s, 0, 1);
    },
    // volume-weighted mean of u between radii r0 and r1 (fractions of a)
    mean(f0, f1, a, t, D, K) {
      K = K || 80; let num = 0, den = 0;
      for (let i = 0; i < K; i++) { const f = f0 + (f1 - f0) * (i + 0.5) / K, w = f * f; num += this.u(f * a, a, t, D) * w; den += w; }
      return num / den;
    },
    state(bath, grams, day) {
      const a = this.radius(grams), t = day * 86400, cs = this.KAPPA * bath;
      const white = cs * this.mean(this.YOLK, 1, a, t), yolk = cs * this.mean(0, this.YOLK, a, t), centre = cs * this.u(0, a, t);
      const phase = white < this.GEL[0] ? 'liquid' : white <= this.GEL[1] ? 'gel' : 'over';
      return { a, cs, white, yolk, centre, phase };
    },
    dayWhen(region, frac, grams, D) {
      const a = this.radius(grams || 70), f = region === 'white' ? [this.YOLK, 1] : [0, this.YOLK];
      let lo = 0, hi = 400; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (this.mean(f[0], f[1], a, m * 86400, D) < frac) lo = m; else hi = m; }
      return (lo + hi) / 2;
    },
    dayGel(bath, grams) { const cs = this.KAPPA * bath; if (cs <= this.GEL[0]) return null; return this.dayWhen('white', this.GEL[0] / cs, grams); },
    dayOver(bath, grams) { const cs = this.KAPPA * bath; if (cs <= this.GEL[1]) return null; return this.dayWhen('white', this.GEL[1] / cs, grams); }
  };

  /* ── measured values the prose quotes (sources in BRIEF.md) */
  const data = {
    // Han et al. 2004 JFCA: mg/g dry matter
    tofuTotal: 547, tofuFree: 1.3, pehtzeFree: 15.6, saltedTotal: 351, red8: { d0: 28, d80: 88 },
    // PMC8358361 (g/kg): total amino acids and free amino acids of three sufu; Glu totals
    taa: [293.73, 281.24, 292.65], faa: [18.2, 23.8], gluTotal: [56.31, 61.16, 41.35], gluFree: [1.29, 1.76],
    soyBrine: [17, 20] // high-salt soy sauce brine, % (Wikipedia, Soy sauce)
  };

  /* ── 09 the standards the last chapter quotes (no model; constants with their sources in BRIEF.md) */
  const facts = {
    sodium: { median: 3500, q1: 3000, q3: 3851, min: 2080, max: 5859, n: 81, who: 2000 }, // mg/100 g; PMC10609505; WHO mg/day
    amines: { total: 396.80, tyramine: 297.78, putrescine: 52.79, cadaverine: 20.43, histamine: 18.16, pea: 7.64, guide: 900, efsaHis: 50, efsaTyr: 600 },
    lead: { egg2017: 0.2, pidan2017: 0.5, egg2022: 0.2, bean2017: 0.5, bean2022: 0.3 }
  };

  /* ── number formatting shared by the page and the node test (same digits in zh and en; no 万/亿) */
  function fmt(x, d) {
    d = d || 0; if (!isFinite(x)) return '—';
    const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
    return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  const pct = (x, d) => fmt(x * 100, d || 0) + '%';
  const sig = x => fmt(x, x >= 100 ? 0 : x >= 10 ? 1 : x >= 1 ? 2 : 3); // OAV, TAV and g/100 g readings

  /* ── the live sentences: which template, and with which values. Values are strings, or {k: copy key},
     or {list: [copy keys]}; the page and the node test resolve them the same way. */
  const say = {
    scission(p) { return { key: 'ch1.say', v: { p: pct(p), f: pct(p * p, 1) } }; },
    enzymes(mode, row, done) {
      const v = { day: fmt(row.t), free: pct(row.free, 1), mean: fmt(row.mean, row.mean < 10 ? 1 : 0), mode: { k: 'ch2.mode.' + mode } };
      return { key: done ? 'ch2.say.' + mode : 'ch2.say.run', v };
    },
    umami(w) {
      const F = umami.FOOD, mix = umami.mix(F.sufu, F.pork, w), e = umami.euc(mix);
      const add = w * umami.euc(F.sufu) + (1 - w) * umami.euc(F.pork);
      const key = w <= 0 ? 'ch3.say.zero' : w >= 1 ? 'ch3.say.one' : 'ch3.say.mix';
      return { key, v: { w: pct(w), euc: sig(e), add: sig(add), x: fmt(e / add, 1) } };
    },
    water(w) {
      const a = water.aw(w);
      if (w >= water.SAT) return { key: 'ch4.say.sat', v: { aw: fmt(a, 3) } };
      const g = water.growers(a);
      return { key: 'ch4.say', v: { w: fmt(w, 1) + '%', aw: fmt(a, 3), list: g.length ? { list: g.map(id => 'ch4.org.' + id) } : { k: 'ch4.say.none' } } };
    },
    aroma(day) {
      const c = aroma.byConc(day)[0], o = aroma.byOav(day)[0];
      return { key: 'ch5.say', v: { day: fmt(day), topc: { k: 'ch5.cmp.' + c.id }, cc: fmt(c.conc, 3), oc: sig(c.oav), topo: { k: 'ch5.cmp.' + o.id }, oo: sig(o.oav), frac: c.id === o.id ? '1' : '1/' + fmt(c.conc / o.conc) } };
    },
    egg(bath, grams, day, until) {
      const s = egg.state(bath, grams, day), cs = s.cs;
      const v = { bath: fmt(bath, 1) + '%', cs: fmt(cs, 2) + '%', day: fmt(day, day % 1 ? 1 : 0), w: fmt(s.white, 2) + '%' }; // same precision as the day tile
      if (day < until) return { key: 'ch6.say.wait', v };
      if (cs < egg.GEL[0]) return { key: 'ch6.say.low', v };
      if (cs <= egg.GEL[1]) { v.dg = fmt(egg.dayGel(bath, grams), 1); return { key: 'ch6.say.gel', v }; }
      v.do = fmt(egg.dayOver(bath, grams), 1); return { key: 'ch6.say.over', v };
    },
    tav(what) {
      const F = umami.FOOD;
      if (what === 'succ') return { key: 'ch7.say.succ', v: { f: sig(umami.tav(F.yolkFresh.succinic, 'succinic')), p: sig(umami.tav(F.yolkPreserved.succinic, 'succinic')) } };
      const lo = umami.tav(129, 'glu'), hi = umami.tav(176, 'glu');
      return { key: 'ch7.say.glu', v: { s: fmt(lo, 1) + '–' + fmt(hi, 1), f: sig(umami.tav(F.yolkFresh.glu, 'glu')), p: sig(umami.tav(F.yolkPreserved.glu, 'glu')) } };
    },
    dilution(lfd, day) {
      const fd = Math.pow(10, lfd), on = aroma.smelled(day, fd).sort((a, b) => b.oav - a.oav);
      const v = { fd: fmt(fd, fd < 10 ? 1 : 0), n: fmt(on.length) };
      if (!on.length) return { key: 'ch8.say.none', v };
      v.list = { list: on.map(r => 'ch5.cmp.' + r.id) }; return { key: 'ch8.say', v };
    }
  };

  return { clamp, rng, scission, enzymes, umami, water, aroma, egg, data, facts, fmt, pct, sig, say };
});
