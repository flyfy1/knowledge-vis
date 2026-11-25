/* Where wages come from: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.WageModels and by tests/models.cjs and
 * bindings.cjs via require(). Each block names the textbook result it implements. Parameters marked "toy"
 * are chosen for a readable picture, not fitted to any economy, and the page says so next to the model. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WageModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  /* Bisection on a continuous f with f(lo), f(hi) of opposite sign. */
  function solve(f, lo, hi, it = 200) {
    let flo = f(lo);
    for (let i = 0; i < it; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; }
    return (lo + hi) / 2;
  }
  /* Number formatting shared by bindings and the page: fixed decimals, thousands separators. */
  function fmt(x, d = 0) {
    if (x == null || !isFinite(x)) return '—';
    const v = Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x;
    const s = v.toFixed(d), parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  /* ───────── 1 · Wage = marginal product (Cobb–Douglas) ─────────
   * Y = A·K^α·L^(1−α). Under competition the wage equals the marginal product of labour:
   * w = ∂Y/∂L = (1 − α)·Y/L, so the labour share wL/Y = 1 − α whatever K and L are.
   * Toy units: A = 450, K = L = 100, α = 1/3 gives output 450 a worker-day and a wage of 300 a day. */
  const cd = {
    A: 450, K0: 100, L0: 100, alpha: 1 / 3,
    Y(K, L, a = this.alpha) { return this.A * Math.pow(K / this.K0, a) * Math.pow(L / this.L0, 1 - a) * this.L0; },
    wage(K, L, a = this.alpha) { return (1 - a) * this.Y(K, L, a) / L; },
    rent(K, L, a = this.alpha) { return a * this.Y(K, L, a) / K; },          // marginal product of capital
    share(K, L, a = this.alpha) { return this.wage(K, L, a) * L / this.Y(K, L, a); },
    /* output added by the n-th worker, holding K: Y(n) − Y(n − 1) (the discrete marginal product) */
    added(n, K, a = this.alpha) { return this.Y(K, n, a) - this.Y(K, n - 1, a); }
  };

  /* ───────── 2–3 · Monopsony and the minimum wage ─────────
   * Labour supply to the firm: w(L) = w̄·(L/L̄)^(1/ε)  (ε = elasticity of labour supply to this employer).
   * Marginal revenue product: MRP(L) = a − b·L. Competitive outcome: MRP = w(L) (here L = 100, w = 20 for any ε).
   * Monopsony: marginal cost of labour MCL = w(L)·(1 + 1/ε) = MRP, so w = MRP·ε/(1 + ε) (Robinson 1933;
   * Manning 2003). A minimum wage m flattens supply up to L_s(m) = L̄·(m/w̄)^ε:
   *   competitive market: E = 100 if m ≤ 20, else L_d(m) = (a − m)/b;
   *   monopsony: E = L_M if m ≤ w_M; L_s(m) if w_M < m ≤ 20; L_d(m) if m > 20.
   * Toy units: yuan an hour and workers; a = 40, b = 0.2, w̄ = 20, L̄ = 100. */
  const mono = {
    a: 40, b: 0.2, wbar: 20, Lbar: 100,
    mrp(L) { return this.a - this.b * L; },
    supplyW(L, e) { return this.wbar * Math.pow(L / this.Lbar, 1 / e); },
    supplyL(w, e) { return this.Lbar * Math.pow(w / this.wbar, e); },
    mcl(L, e) { return this.supplyW(L, e) * (1 + 1 / e); },
    demandL(w) { return Math.max(0, (this.a - w) / this.b); },
    competitive() { return { L: this.Lbar, w: this.wbar }; },
    monopsony(e) {
      const L = solve(x => this.mrp(x) - this.mcl(x, e), 1e-6, this.a / this.b);
      const w = this.supplyW(L, e), mrp = this.mrp(L);
      return { L, w, mrp, markdown: 1 - w / mrp, gapL: this.Lbar - L };
    },
    /* employment, wage paid and job seekers under a minimum wage m in either market */
    withMin(m, e, market) {
      const comp = this.competitive();
      if (market === 'comp') {
        if (m <= comp.w) return { E: comp.L, w: comp.w, seekers: comp.L, binding: false };
        const E = this.demandL(m); return { E, w: m, seekers: this.supplyL(m, e), binding: true };
      }
      const M0 = this.monopsony(e);
      if (m <= M0.w) return { E: M0.L, w: M0.w, seekers: M0.L, binding: false, regime: 'none' };
      if (m <= comp.w) { const E = this.supplyL(m, e); return { E, w: m, seekers: E, binding: true, regime: 'up' }; }
      const E = this.demandL(m); return { E, w: m, seekers: this.supplyL(m, e), binding: true, regime: 'down' };
    }
  };

  /* ───────── 4 · The race between education and technology (Katz–Murphy 1992) ─────────
   * CES between college (H) and non-college (L) labour with elasticity σ:
   *   ln(w_H/w_L) = [(σ − 1)/σ]·ln(A_H/A_L) − (1/σ)·ln(H/L) = (1/σ)·[D − ln(H/L)],  D ≡ (σ − 1)·ln(A_H/A_L).
   * D grows at d a year (skill-biased demand), ln(H/L) at g1 for the first 20 years and g2 for the next 25.
   * Toy start: a premium of 50% (ln 1.5). The premium path is exact: Δln(prem)/yr = (d − g)/σ. */
  const race = {
    p0: 0.5, Y1: 20, Y2: 25,
    path(d, g1, g2, sigma) {
      const out = []; let lp = Math.log(1 + this.p0);
      out.push([0, lp]);
      for (let t = 1; t <= this.Y1 + this.Y2; t++) { const g = t <= this.Y1 ? g1 : g2; lp += (d - g) / 100 / sigma; out.push([t, lp]); }
      return out.map(([t, l]) => [t, Math.exp(l) - 1]);
    },
    end(d, g1, g2, sigma) { const p = this.path(d, g1, g2, sigma); return { mid: p[this.Y1][1], end: p[p.length - 1][1] }; },
    /* how fast supply must grow to hold the premium constant: g* = d */
    breakeven(d) { return d; }
  };

  /* ───────── 5 · An occupation is a bundle of tasks ─────────
   * Tasks i ∈ [0, 1] sorted by how hard they are for a machine. Labour does any task at cost w = 1;
   * a machine does task i at cost c·e^(κi). Tasks with c·e^(κi) < 1 are automated: a = clamp(ln(1/c)/κ, 0, 1).
   * Unit cost of the service P = (1 − a) + ∫₀ᵃ c·e^(κi) di = (1 − a) + c(e^(κa) − 1)/κ.
   * Demand for the service Q = P^(−η) (constant elasticity η). Employment in the occupation E = (1 − a)·Q.
   * Toy κ = 5. With elastic demand, automating part of the bundle can raise employment (ATM and tellers,
   * Bessen 2015); automating all of it cannot. */
  const bundle = {
    kappa: 5,
    a(c) { return clamp(Math.log(1 / c) / this.kappa, 0, 1); },
    P(c) { const a = this.a(c); return (1 - a) + c * (Math.exp(this.kappa * a) - 1) / this.kappa; },
    E(c, eta) { const a = this.a(c); return (1 - a) * Math.pow(this.P(c), -eta); },
    Q(c, eta) { return Math.pow(this.P(c), -eta); },
    /* the peak employment over machine costs from 1 down to 10^lmin, and where it happens */
    peak(eta, lmin = -4) { let best = { E: 1, lc: 0 }; for (let lc = 0; lc >= lmin; lc -= 0.001) { const E = this.E(Math.pow(10, lc), eta); if (E > best.E) best = { E, lc }; } return best; }
  };

  /* ───────── 6 · The task model (Acemoglu & Restrepo 2018 AER, 2019 JEP) ─────────
   * Tasks on [N − 1, N]. Tasks below the automation frontier I can be done by capital; tasks in (I, N] only by
   * labour. Cobb–Douglas over tasks (σ = 1): ln Y = ∫ ln y(i) di. Capital productivity γ_K(i) = 1, labour
   * productivity γ_L(i) = e^(θi) (labour's comparative advantage rises with i; our simplification of the
   * papers' general γ schedules). With effective capital M = A_K·K and effective labour A_L·L = 1:
   *   s ≡ N − I  (the labour share, exactly),
   *   ln Y = (1 − s)·ln(M/(1 − s)) + s·ln(1/s) + θ·(N² − I²)/2,
   *   w = s·Y  (wage bill = labour share × output).
   * Hence Δln w = Δln Y (productivity effect) + Δln s (displacement if s falls, reinstatement if it rises).
   * At the margin: ∂ln Y/∂I = ln(s·M/(1 − s)) − θI = ln(labour cost / capital cost of task I); automation is
   * profitable only while this is positive; I* solves it = 0. ∂ln s/∂I = −1/s.
   * Toy: θ = 2, baseline I = 0.4, N = 1 (labour share 60%); M = 2.449 makes machines e^0.5 ≈ 1.65× cheaper
   * than labour at the baseline margin. "So-so" machines: M = 1.2. */
  const task = {
    theta: 2, I0: 0.4, N0: 1,
    M: { good: 0.4 / 0.6 * Math.exp(1.3), soso: 1.2 },
    lnY(I, N, M) { const s = N - I, th = this.theta; return (1 - s) * Math.log(M / (1 - s)) + s * Math.log(1 / s) + th * (N * N - I * I) / 2; },
    w(I, N, M) { return (N - I) * Math.exp(this.lnY(I, N, M)); },
    share(I, N) { return N - I; },
    marginalSaving(I, N, M) { const s = N - I; return Math.log(s * M / (1 - s)) - this.theta * I; },
    /* the profitable automation frontier I* for given N, M (cost of capital = cost of labour at the margin) */
    Istar(N, M) { const f = I => this.marginalSaving(I, N, M); const lo = N - 1 + 1e-9, hi = N - 1e-9; if (f(lo) <= 0) return lo; if (f(hi) > 0) return hi; return solve(f, lo, hi); },
    /* exact split of the wage change from (I0, N0) to (I, N): first move I, then N */
    decompose(I, N, M) {
      const { I0, N0 } = this;
      const y0 = this.lnY(I0, N0, M), y1 = this.lnY(I, N0, M), y2 = this.lnY(I, N, M);
      const s0 = N0 - I0, s1 = N0 - I, s2 = N - I;
      const prodA = y1 - y0, disp = Math.log(s1 / s0), prodN = y2 - y1, rein = Math.log(s2 / s1);
      const total = prodA + disp + prodN + rein;
      return { prodA, disp, prodN, rein, prod: prodA + prodN, total, wRel: Math.exp(total), yRel: Math.exp(y2 - y0), s: s2 };
    }
  };

  /* ───────── 7 · The bottleneck (CES with σ < 1) ─────────
   * Y = [a·x1^ρ + (1 − a)·x2^ρ]^(1/ρ), ρ = (σ − 1)/σ < 0. Task 1 is sped up by m (x1 = m), task 2 is done by
   * people (x2 = 1). As m → ∞, Y → (1 − a)^(1/ρ). The slow task's cost share (1 − a)/(a·m^ρ + 1 − a) → 1, and the
   * people in it earn their marginal product ∂Y/∂x2 = (1 − a)·Y^(1 − ρ). With σ = 1/2 this is exactly the
   * harmonic-mean model of scarcity-moves #c11: Y = 1/(a/m + 1 − a). */
  const neck = {
    a: 0.6,
    rho(sigma) { return (sigma - 1) / sigma; },
    Y(m, sigma, a = this.a) { const r = this.rho(sigma); return Math.pow(a * Math.pow(m, r) + (1 - a), 1 / r); },
    cap(sigma, a = this.a) { return Math.pow(1 - a, 1 / this.rho(sigma)); },
    slowShare(m, sigma, a = this.a) { const r = this.rho(sigma); return (1 - a) / (a * Math.pow(m, r) + 1 - a); },
    wage(m, sigma, a = this.a) { return (1 - a) * Math.pow(this.Y(m, sigma, a), 1 - this.rho(sigma)); },
    wageRel(m, sigma, a = this.a) { return this.wage(m, sigma, a) / this.wage(1, sigma, a); }
  };

  /* ───────── 8 · Baumol's cost disease ─────────
   * Two sectors, labour the only input, one common wage. Productivity grows at g in the progressive sector, 0 in
   * the stagnant one, so the stagnant sector's relative price is e^(gt). CES demand with elasticity of
   * substitution η between the two goods: the stagnant sector's spending share, which equals its employment
   * share (same wage, labour only), is s(t) = 1/(1 + ((1 − s0)/s0)·e^(−(1 − η)gt)). It rises to 1 when η < 1.
   * Aggregate productivity growth (Divisia) is g·(1 − s(t)). Baumol (1967); Nordhaus (2008). Toy s0 = 30%. */
  const baumol = {
    s0: 0.3,
    relPrice(g, t) { return Math.exp(g / 100 * t); },
    share(g, eta, t, s0 = this.s0) { return 1 / (1 + (1 - s0) / s0 * Math.exp(-(1 - eta) * g / 100 * t)); },
    growth(g, eta, t) { return g * (1 - this.share(g, eta, t)); }
  };

  /* ───────── 9 · The labour share under CES (capital–labour substitution) ─────────
   * Y = [α·K^ρ + (1 − α)·L^ρ]^(1/ρ), ρ = (σ − 1)/σ, L = 1. Labour share s_L = (1 − α)/(α·K^ρ + 1 − α);
   * wage w = (1 − α)·Y^(1 − ρ). Calibrated to s_L = 65% at K = 1 (α = 0.35). With σ > 1 more capital lowers the
   * share and still raises the wage; with σ < 1 the share rises. σ = 1 is Cobb–Douglas (share fixed).
   * Karabarbounis & Neiman (2014) estimate σ ≈ 1.25. */
  const share = {
    alpha: 0.35,
    rho(sigma) { return (sigma - 1) / sigma; },
    Y(K, sigma) { const a = this.alpha; if (Math.abs(sigma - 1) < 1e-9) return Math.pow(K, a); const r = this.rho(sigma); return Math.pow(a * Math.pow(K, r) + 1 - a, 1 / r); },
    sL(K, sigma) { const a = this.alpha; if (Math.abs(sigma - 1) < 1e-9) return 1 - a; const r = this.rho(sigma); return (1 - a) / (a * Math.pow(K, r) + 1 - a); },
    wage(K, sigma) { return this.sL(K, sigma) * this.Y(K, sigma); },
    wageRel(K, sigma) { return this.wage(K, sigma) / this.wage(1, sigma); }
  };

  /* ───────── 10 · Frontier facts (dated; sources in BRIEF.md) ───────── */
  const FRONTIER = {
    canaries: { gap2026: 19, gap2025: 15, exposedYoung: -11, lessExposedYoung: 10, allYoung: -1.9, asOf: '2026-06', published: '2026-08-12' },
    humlum: { occupations: 11, workers: 25000, workplaces: 7000, bound: 2, timeSaved: 3 },
    eloundou: { tenPct: 80, fiftyPct: 19, llmOnly: 15, toolsLo: 47, toolsHi: 56 },
    imf: { world: 40, advanced: 60, emerging: 40, low: 26 },
    amodei: { entryHalf: 50, uLo: 10, uHi: 20, yLo: 1, yHi: 5 },
    aei: { augJan26: 52, autoJan26: 45, codingMar26: 35 },
    epoch: { lo: 9, hi: 900, gpqa: 40 },
    gpt4: { input: 30, output: 60 },
    bryn: { avg: 14, novice: 34 },
    cengiz: { changes: 138, years: 5 },
    cbo: { workers: 17, median: 1.3, hi: 3.7, poverty: 1.3 },
    neumark: { neg: 79.3, neg5: 47.9 },
    sokolova: { estimates: 1320, studies: 53, inverseMedian: 14 },
    kn: { decline: 5, sigma: 1.25, investPrice: 25 },
    km: { coef: 0.709 },
    cnGrads: { y2026: 1270, y2027: 1299, add2026: 48 }
  };

  return { clamp, solve, fmt, cd, mono, race, bundle, task, neck, baumol, share, FRONTIER };
}));
