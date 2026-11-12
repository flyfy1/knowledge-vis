/* Why one rate moves everything: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.RateModels and by tests/models.cjs via require().
 * Units: rates are in percent per year unless a name ends in "Dec" (decimal); time in years unless stated.
 * Each block names the textbook result it implements so a reviewer can re-derive it. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RateModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const sum = a => a.reduce((x, y) => x + y, 0);

  /* seeded RNG (mulberry32) and a standard normal draw (Box–Muller) */
  function rng(seed) {
    let a = seed >>> 0;
    const u = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    return { u, n() { let x = 0; while (x === 0) x = u(); return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * u()); } };
  }
  /* standard normal CDF (Abramowitz & Stegun 7.1.26 on erf, |error| < 1.5e-7) */
  function Phi(z) {
    const s = z < 0 ? -1 : 1, x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + s * y);
  }

  /* ───────── ch1 · present value: PV = Σ CF_t / (1 + r)^t ───────── */
  const pv = {
    // the two streams on the page: 30 equal payments of 100, or a stream that starts at 40 and grows 6 % a year
    stream(kind, n = 30) { const out = []; for (let t = 1; t <= n; t++) out.push(kind === 'grow' ? 40 * Math.pow(1.06, t - 1) : 100); return out; },
    df: (r, t) => Math.pow(1 + r / 100, -t),
    each(cfs, r) { return cfs.map((c, i) => c * pv.df(r, i + 1)); },
    total(cfs, r) { return sum(pv.each(cfs, r)); },
    // share of the present value that comes from years > k
    lateShare(cfs, r, k) { const e = pv.each(cfs, r); return sum(e.slice(k)) / sum(e); },
    // value-weighted average waiting time (this is Macaulay duration, named in ch2)
    avgTime(cfs, r) { const e = pv.each(cfs, r); return sum(e.map((v, i) => v * (i + 1))) / sum(e); },
    pctChange(cfs, r0, r1) { return 100 * (pv.total(cfs, r1) / pv.total(cfs, r0) - 1); }
  };

  /* ───────── ch2 · bonds: price, Macaulay/modified duration, convexity (annual coupons, face 100) ─────────
   * P(y) = Σ_{t=1..T} c/(1+y)^t + 100/(1+y)^T
   * D_mac = Σ t·PV_t / P;  D_mod = D_mac/(1+y);  C = Σ t(t+1)·PV_t / (P·(1+y)^2)
   * second-order approximation: ΔP/P ≈ −D_mod·Δy + ½·C·Δy²  (Fabozzi, Bond Markets, ch. 4; Hull, Options, Futures…, ch. 4) */
  const bond = {
    flows(c, T) { const f = []; for (let t = 1; t <= T; t++) f.push(c + (t === T ? 100 : 0)); return f; },
    price(c, T, y) { return pv.total(bond.flows(c, T), y); },
    macaulay(c, T, y) { return pv.avgTime(bond.flows(c, T), y); },
    modified(c, T, y) { return bond.macaulay(c, T, y) / (1 + y / 100); },
    convexity(c, T, y) {
      const f = bond.flows(c, T), Y = 1 + y / 100, P = bond.price(c, T, y);
      return sum(f.map((cf, i) => (i + 1) * (i + 2) * cf * Math.pow(Y, -(i + 1)))) / (P * Y * Y);
    },
    exactPct(c, T, y0, dy) { return 100 * (bond.price(c, T, y0 + dy) / bond.price(c, T, y0) - 1); },
    durPct(c, T, y0, dy) { return -bond.modified(c, T, y0) * dy; },
    durConvPct(c, T, y0, dy) { const d = dy / 100; return 100 * (-bond.modified(c, T, y0) * d + 0.5 * bond.convexity(c, T, y0) * d * d); }
  };

  /* ───────── ch3 · bootstrapping a par curve into spot (zero) and one-year forward rates ─────────
   * par yields at 1,2,3,5,7,10,20,30 are interpolated linearly to every whole year, treated as annual-coupon
   * bonds priced at par:  1 = c_n·Σ_{t<n} DF_t + (1 + c_n)·DF_n  ⇒  DF_n = (1 − c_n·Σ_{t<n} DF_t)/(1 + c_n)
   * spot z_n = DF_n^(−1/n) − 1;  forward f_{n−1→n} = DF_{n−1}/DF_n − 1 */
  const curve = {
    interp(mats, ys, n) {
      if (n <= mats[0]) return ys[0];
      for (let i = 1; i < mats.length; i++) if (n <= mats[i]) { const w = (n - mats[i - 1]) / (mats[i] - mats[i - 1]); return ys[i - 1] + w * (ys[i] - ys[i - 1]); }
      return ys[ys.length - 1];
    },
    bootstrap(mats, ys, N = 30) {
      const par = [], df = [], spot = [], fwd = [];
      let acc = 0;
      for (let n = 1; n <= N; n++) {
        const c = curve.interp(mats, ys, n) / 100;
        const d = (1 - c * acc) / (1 + c);
        par.push(100 * c); df.push(d); spot.push(100 * (Math.pow(d, -1 / n) - 1));
        fwd.push(100 * ((n === 1 ? 1 : df[n - 2]) / d - 1));
        acc += d;
      }
      return { par, df, spot, fwd };
    },
    // check: pricing every par bond off the bootstrapped discount factors gives 100
    reprice(boot, n) { const c = boot.par[n - 1]; let p = 0; for (let t = 1; t <= n; t++) p += (c + (t === n ? 100 : 0)) * boot.df[t - 1]; return p; }
  };

  /* ───────── ch4 · expectations hypothesis plus a term premium ─────────
   * expected short rate: E[i_t] = i_L + (i_0 − i_L)·2^(−t/h)   (t in years, h = half-life of the expected move)
   * n-year zero yield ≈ average expected short rate over n years + term premium TP_n = tp10·min(n,10)/10
   * (Campbell & Shiller 1991 notation, continuous approximation; the term premium shape is an assumption) */
  const eh = {
    expShort(p, t) { return p.iL + (p.i0 - p.iL) * Math.pow(2, -t / p.h); },
    avgExp(p, n) { // exact average of the expected path over [0, n]
      if (n <= 0) return p.i0;
      const k = Math.LN2 / p.h; return p.iL + (p.i0 - p.iL) * (1 - Math.exp(-k * n)) / (k * n);
    },
    tp(p, n) { return p.tp10 * Math.min(n, 10) / 10; },
    yield(p, n) { return eh.avgExp(p, n) + eh.tp(p, n); },
    spread10y3m(p) { return eh.yield(p, 10) - eh.yield(p, 0.25); }
  };

  /* inversion record on monthly data: a recession start is "called" if the spread was < 0 in at least one of
   * the `lead` months before the first recession month; an inversion episode is a false alarm if no recession
   * starts within `lead` months after the episode's first inverted month. Months are indices into the series. */
  function inversionRecord(spread, rec, lead) {
    const starts = [], episodes = [];
    for (let i = 1; i < rec.length; i++) if (rec[i] === 1 && rec[i - 1] === 0) starts.push(i);
    for (let i = 0; i < spread.length; i++) if (spread[i] < 0 && (i === 0 || spread[i - 1] >= 0)) {
      // merge with the previous episode if it ended fewer than 6 months ago
      const last = episodes[episodes.length - 1];
      if (last && i - last.end <= 6) { let j = i; while (j + 1 < spread.length && spread[j + 1] < 0) j++; last.end = j; continue; }
      let j = i; while (j + 1 < spread.length && spread[j + 1] < 0) j++; episodes.push({ start: i, end: j });
    }
    // only recessions whose whole look-back window lies inside the data are scored
    const called = starts.filter(s => s - lead >= 0).map(s => { let lag = null; for (let k = 1; k <= lead; k++) if (spread[s - k] < 0) lag = k; return { start: s, called: lag != null, lead: lag }; });
    const eps = episodes.map(e => { const s = starts.find(x => x >= e.start && x - e.start <= lead); return { start: e.start, end: e.end, followed: s != null, wait: s != null ? s - e.start : null }; });
    // episodes whose window has not yet closed (fewer than `lead` months of data after them, no recession yet)
    eps.forEach(e => { e.open = !e.followed && spread.length - 1 - e.start < lead; });
    return { starts, called, episodes: eps };
  }

  /* ───────── ch5 · the overnight rate set by reserves: Poole (1968) ─────────
   * A bank holds reserves R; an end-of-day payment shock ε ~ N(0, σ²) moves them. If R + ε < K (requirement, set
   * to 0 when none) it must borrow at the lending rate i_L; otherwise surplus earns the deposit rate i_D (IORB).
   * The marginal reserve is worth i_D + (i_L − i_D)·Pr(R + ε < K), so the interbank rate is
   *   i(R) = i_D + (i_L − i_D)·Φ((K − R)/σ)
   * Corridor: R near K, rate set mid-corridor; floor: R ≫ K, rate ≈ i_D. Bindseil (2014) Monetary Policy
   * Operations and the Financial System, ch. 2–3; Ennis & Keister (2008) FRBNY EPR. */
  const poole = {
    rate(p, R) { return p.iD + (p.iL - p.iD) * Phi((p.K - R) / p.sigma); },
    // reserves that put the rate at a target inside the corridor
    reservesFor(p, i) { const q = clamp((i - p.iD) / (p.iL - p.iD), 1e-9, 1 - 1e-9); let lo = -50, hi = 50; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (Phi((p.K - m) / p.sigma) > q) lo = m; else hi = m; } return (lo + hi) / 2; },
    // a run of days with demand shocks: the requirement K moves by N(0, sd) each day (seeded)
    days(p, R, n, seed, sd) { const g = rng(seed), out = []; for (let d = 0; d < n; d++) out.push(poole.rate(Object.assign({}, p, { K: p.K + sd * g.n() }), R)); return out; },
    sd(a) { const m = sum(a) / a.length; return Math.sqrt(sum(a.map(x => (x - m) * (x - m))) / a.length); }
  };

  /* ───────── ch6 · Taylor (1993) rule ─────────
   * i = r* + π + a_π·(π − π*) + a_y·gap  (Taylor's values: r* = 2, π* = 2, a_π = a_y = 0.5) */
  const taylor = {
    rule(p, infl, gap) { return p.rstar + infl + p.api * (infl - p.target) + p.agap * gap; },
    series(p, D) { return D.infl.map((x, i) => taylor.rule(p, x, D.gap[i])); },
    qLabel(start, i) { const y = +start.slice(0, 4), q = +start.slice(5) - 1 + i; return (y + Math.floor(q / 4)) + 'Q' + (q % 4 + 1); },
    indexOf(start, label) { const y = +label.slice(0, 4), q = +label.slice(5); return (y - +start.slice(0, 4)) * 4 + (q - +start.slice(5)); },
    stats(p, D, from, to) { // mean absolute gap and largest gap between rule and actual, over [from, to] (labels)
      const a = taylor.indexOf(D.start, from), b = taylor.indexOf(D.start, to), s = taylor.series(p, D);
      let tot = 0, n = 0, big = 0, at = a;
      for (let i = a; i <= b; i++) { const g = s[i] - D.ff[i]; tot += Math.abs(g); n++; if (Math.abs(g) > Math.abs(big)) { big = g; at = i; } }
      return { mae: tot / n, big, at: taylor.qLabel(D.start, at) };
    }
  };

  /* ───────── ch7 · the three-equation New Keynesian model (Galí 2015, ch. 3; Woodford 2003) ─────────
   * x_t = E x_{t+1} − (1/σ)(i_t − E π_{t+1} − r^n_t)       IS curve (output gap)
   * π_t = β E π_{t+1} + κ x_t + u_t                         Phillips curve
   * i_t = r̄ + φ_π π_t + φ_x x_t  [+ (r^n_t − r̄) if the bank tracks the natural rate]
   * Quarterly; π and i are quarterly rates (the page multiplies by 4 to show annual rates). Shocks are AR(1) with
   * persistence ρ. Method of undetermined coefficients: x_t = ψx·z_t, π_t = ψπ·z_t, which gives two linear
   * equations. Determinacy (Bullard & Mitra 2002): κ(φ_π − 1) + (1 − β)φ_x > 0. */
  const nk = {
    P: { beta: 0.99, sigma: 1, kappa: 0.1, rho: 0.8 },
    determinate(p) { return p.kappa * (p.phiPi - 1) + (1 - p.beta) * p.phiX > 0; },
    // coefficients on the shock for a demand (natural-rate) shock or a cost-push shock
    coeffs(p, kind) {
      const { beta, sigma, kappa, rho, phiPi, phiX } = p;
      // unknowns a = ψx, b = ψπ
      // IS:  a(1−ρ)σ + φx·a + (φπ − ρ)·b = dz      (dz = 1 for demand unless tracked, 0 for cost-push)
      // PC:  −κ·a + (1 − βρ)·b = uz                   (uz = 1 for cost-push, 0 for demand)
      const dz = kind === 'demand' ? (p.track ? 0 : 1) : 0, uz = kind === 'supply' ? 1 : 0;
      const A11 = sigma * (1 - rho) + phiX, A12 = phiPi - rho, A21 = -kappa, A22 = 1 - beta * rho;
      const det = A11 * A22 - A12 * A21;
      const a = (dz * A22 - A12 * uz) / det, b = (A11 * uz - A21 * dz) / det;
      return { x: a, pi: b };
    },
    // impulse responses over n quarters to a shock of size s (quarterly units) at t = 0
    irf(p, kind, s, n) {
      const c = nk.coeffs(p, kind), out = [];
      for (let t = 0; t < n; t++) {
        const z = s * Math.pow(p.rho, t), x = c.x * z, pi = c.pi * z;
        const rn = kind === 'demand' ? z : 0;
        const i = p.phiPi * pi + p.phiX * x + (p.track && kind === 'demand' ? rn : 0); // deviation of i from r̄
        out.push({ t, x, pi, i, z });
      }
      return out;
    },
    // residual of both equations at t (checks the closed form against the model as written)
    residual(p, kind, s) {
      const r = nk.irf(p, kind, s, 2), a = r[0], b = r[1];
      const rn = kind === 'demand' ? a.z : 0, u = kind === 'supply' ? a.z : 0;
      const is = a.x - (b.x - (1 / p.sigma) * (a.i - b.pi - rn));
      const pc = a.pi - (p.beta * b.pi + p.kappa * a.x + u);
      return Math.max(Math.abs(is), Math.abs(pc));
    },
    // for a cost-push shock: |π| and |x| on impact (annualised for π) as φπ varies — the trade-off frontier
    frontier(p, s, phis) { return phis.map(f => { const c = nk.coeffs(Object.assign({}, p, { phiPi: f }), 'supply'); return { phi: f, pi: 4 * Math.abs(c.pi * s), x: Math.abs(c.x * s) }; }); }
  };

  /* ───────── ch8 · asset prices ─────────
   * equity: dividend-discount model with a two-stage growth path and a Gordon terminal value
   *   P = Σ_{t=1..H} D_t/(1+r)^t + [D_{H+1}/(r − g_L)]/(1+r)^H,  D_t = D_1·(1+g_H)^{t−1} for t ≤ H then g_L
   *   (Gordon 1962; two-stage DDM as in Damodaran, Investment Valuation, ch. 13)
   *   duration (value-weighted time, terminal stream included exactly): D = Σ t·PV_t/P with the Gordon tail
   *   contributing PV_H·(H + (1+r)/(r−g_L))   [Macaulay duration of a growing perpetuity = (1+r)/(r−g)]
   * houses: the largest loan a fixed monthly payment M supports over n months at annual rate r:
   *   L = M·(1 − (1+i)^−n)/i, i = r/12 (annuity formula) */
  const equity = {
    firms: { value: { d1: 5, gH: 2, H: 10, gL: 2 }, growth: { d1: 1, gH: 20, H: 10, gL: 2 } },
    parts(f, r) {
      const R = 1 + r / 100; let p = 0, tw = 0, d = f.d1;
      for (let t = 1; t <= f.H; t++) { const v = d * Math.pow(R, -t); p += v; tw += t * v; d *= 1 + f.gH / 100; }
      // terminal: dividend in year H+1 grows at gL; d currently holds D_{H+1} computed with gH, recompute with gL
      const dH1 = f.d1 * Math.pow(1 + f.gH / 100, f.H - 1) * (1 + f.gL / 100);
      const tv = dH1 / (r / 100 - f.gL / 100), pvTv = tv * Math.pow(R, -f.H);
      const durTail = f.H + R / (r / 100 - f.gL / 100);
      return { price: p + pvTv, early: p, tail: pvTv, duration: (tw + pvTv * durTail) / (p + pvTv) };
    },
    price: (f, r) => equity.parts(f, r).price,
    pct: (f, r0, r1) => 100 * (equity.price(f, r1) / equity.price(f, r0) - 1)
  };
  const house = {
    loan(M, r, n = 360) { const i = r / 1200; return i === 0 ? M * n : M * (1 - Math.pow(1 + i, -n)) / i; },
    pct(r0, r1, n = 360) { return 100 * (house.loan(1, r1, n) / house.loan(1, r0, n) - 1); },
    payment(L, r, n = 360) { const i = r / 1200; return i === 0 ? L / n : L * i / (1 - Math.pow(1 + i, -n)); }
  };

  /* ───────── ch9 · exchange rates: covered and uncovered interest parity, carry trade ─────────
   * CIP (arbitrage): F = S·(1 + i)/(1 + i*), S = home currency per unit of foreign currency.
   * UIP (hypothesis): E[S_{t+1}]/S_t = (1 + i)/(1 + i*).
   * Carry trade: borrow the low-rate currency, hold the high-rate one. Monthly excess return
   *   (1 + i_hi/12)·(S_{t+1}/S_t) − (1 + i_lo/12), with S quoted as low-rate currency per unit of high-rate currency.
   * Worlds for the exchange rate (log-normal monthly steps, volatility σ a year, seeded):
   *   'uip'  : drift = −(i_hi − i_lo) (the high-rate currency weakens by the differential on average)
   *   'rw'   : no drift (random walk; Meese & Rogoff 1983 found it hard to beat out of sample)
   *   'crash': no drift, plus a rare large fall in the high-rate currency (Brunnermeier, Nagel & Pedersen 2008) */
  const fx = {
    forward: (S, i, iStar) => S * (1 + i / 100) / (1 + iStar / 100),
    forwardPremiumPct: (i, iStar) => 100 * ((1 + i / 100) / (1 + iStar / 100) - 1),
    carry(p, seed) {
      const g = rng(seed), m = 12 * p.years, sd = p.vol / 100 / Math.sqrt(12), diff = (p.iHi - p.iLo) / 100;
      let S = 1, wealth = 1, worst = 0, peak = 1; const path = [[0, 1, 1]];
      for (let k = 1; k <= m; k++) {
        const drift = p.world === 'uip' ? Math.log((1 + p.iLo / 1200) / (1 + p.iHi / 1200)) : 0;
        let jump = 0;
        if (p.world === 'crash' && g.u() < p.crashProb / 12) jump = Math.log(1 - p.crashSize / 100);
        const r = drift - 0.5 * sd * sd + sd * g.n() + jump;
        const S1 = S * Math.exp(r);
        const ret = (1 + p.iHi / 1200) * (S1 / S) - (1 + p.iLo / 1200);
        wealth *= 1 + ret; S = S1; peak = Math.max(peak, wealth); worst = Math.min(worst, wealth / peak - 1);
        path.push([k / 12, S, wealth]);
      }
      return { path, wealth, annual: 100 * (Math.pow(wealth, 1 / p.years) - 1), maxDrawdown: 100 * worst, S, diffPct: 100 * diff };
    },
    // average over many seeds (used for the "on average" sentence; not drawn)
    average(p, seeds) { let a = 0; for (let s = 1; s <= seeds; s++) a += fx.carry(p, s).annual; return a / seeds; }
  };

  /* ───────── ch10 · at the lower bound: forward guidance and QE ─────────
   * forward guidance through ch4's expectations model: the short rate is expected to stay at 0 for L years and
   *   then move to i_L at the same speed; the n-year yield is the average expected short rate plus the premium.
   * QE through a portfolio-balance estimate: the ten-year term premium falls by `bp` basis points per 1 % of GDP of
   *   long-term debt the central bank removes (Gagnon, Raskin, Remache & Sack 2011: 4.4 bp per 1 % of GDP in their
   *   time-series regression; their total for $1.725 tn ≈ 12 % of GDP spans 30–100 bp across methods). */
  const lb = {
    expPathFG(p, t) { return t < p.L ? 0 : p.iL - p.iL * Math.pow(2, -(t - p.L) / p.h); },
    avgFG(p, n) { // exact average of the path above over [0, n]
      if (n <= p.L) return 0;
      const k = Math.LN2 / p.h, s = n - p.L;
      return (p.iL * s - p.iL * (1 - Math.exp(-k * s)) / k) / n;
    },
    yield10(p) { return lb.avgFG(p, 10) + p.tp10 - p.qe * p.bp / 100; },
    qeEffect: (sizePctGDP, bp) => sizePctGDP * bp / 100,
    perGDP: { low: 30 / 12, central: 4.4, high: 100 / 12 }
  };

  /* ───────── ch11 · debt dynamics: b_{t+1} = b_t·(1 + r)/(1 + g) − pb ─────────
   * b = debt/GDP (%), r = average interest rate on debt, g = nominal GDP growth, pb = primary surplus (% of GDP).
   * Continuous approximation Δb ≈ (r − g)·b − pb; the debt-stabilising primary surplus is pb* = b·(r − g)/(1 + g).
   * Monetary link: a share 1/m of the debt reprices each year to the market rate, so r_t moves toward the market
   * rate over about m years (m = average maturity, an assumption on the page). */
  const debt = {
    path(p, years) {
      let b = p.b0, r = p.r0; const out = [[0, b, r]];
      for (let t = 1; t <= years; t++) {
        r = r + (p.rMkt - r) / p.m;              // repricing as debt rolls over
        b = b * (1 + r / 100) / (1 + p.g / 100) - p.pb;
        out.push([t, b, r]);
      }
      return out;
    },
    stabilising: (b, r, g) => b * (r - g) / (100 + g),
    // years until the ratio first exceeds a level (null if never within the horizon)
    yearsTo(p, level, years) { const path = debt.path(p, years); const k = path.find(q => q[1] >= level); return k ? k[0] : null; }
  };

  // output given up per percentage point of (annualised) inflation removed, moving φπ from a to b (supply shock)
  nk.costPerPoint = (p, a, b) => { const A = nk.coeffs(Object.assign({}, p, { phiPi: a }), 'supply'), B = nk.coeffs(Object.assign({}, p, { phiPi: b }), 'supply'); return (B.x - A.x) / (4 * (B.pi - A.pi)); };

  /* ═════════ FRONTIER FACTS — these go stale. Every value is dated; sources are listed in BRIEF.md under
   * "Facts that will go stale" with URL and the date opened (all 2026-11-11). Update here, not in the prose. ═════════ */
  const frontier = {
    checked: '2026-11-11',
    banks: [
      { id: 'fed', rate: '3.75–4.00', rateDate: '2026-09-17', held: '2026-10-28', infl: 3.1, inflMonth: '2026-09', bs: 6.75, bsDate: '2026-11-04', bsUnit: 'usd' },
      { id: 'ecb', rate: '2.50', rateDate: '2026-09-16', infl: 4.0, inflMonth: '2026-10', bs: 5.91, bsDate: '2026-11-06', bsUnit: 'eur' },
      { id: 'boe', rate: '4.00', rateDate: '2026-11-05', infl: 3.5, inflMonth: '2026-09', bs: null },
      { id: 'boj', rate: '1.25', rateDate: '2026-09', held: '2026-10-30', infl: null, bs: null },
      { id: 'pboc', rate: '1.40', rateDate: '2026-09-24', lpr1: '3.0', lpr5: '3.5', lprDate: '2026-10-20', infl: 0.7, inflMonth: '2026-10', bs: null }
    ],
    us: {
      effr: 3.88, effrMonth: '2026-10',            // FRED FEDFUNDS, monthly average
      corePce: 3.1, corePceMonth: '2026-09',       // FRED PCEPILFE, 12-month change 130.902/126.940
      iorb: 3.90, onrrp: 3.75, srf: 4.00, iorbDate: '2026-09-17',
      rstarLW: 1.65, rstarHLW: 1.01, rstarQuarter: '2026Q2', rstarHLWea: 0.09,
      sepLongRun: 3.2, sepEnd2026: 4.1, sepDate: '2026-09-16',
      tpKW: 0.87, tpDate: '2026-11-06',            // FRED THREEFYTP10
      spread: 0.68, spreadDate: '2026-11-10',      // FRED T10Y3M
      outputGap: 1.7, outputGapQuarter: '2026Q3',  // FRED GDPC1 / GDPPOT (CBO), current vintage
      rEff: 4.04, gNom: 6.31, debtRatio: 97.4, debtQuarter: '2026Q2',
      cboDebt2026: 101, cboDebt2036: 120,           // CBO Feb 2026 baseline, via CRFB/PGPF summaries (CBO site blocked)
      ust10: 4.88, ust10Date: '2026-11-09', mort30: 7.18, mortDate: '2026-11-05'
    },
    ecbProj: { y2026: 3.0, y2027: 2.5, y2028: 2.1, date: '2026-09-10' },
    digitalEuro: { epVoteDate: '2026-07-09', yes: 416, no: 169, abst: 22 }
  };
  frontier.us.realRate = Math.round((frontier.us.effr - frontier.us.corePce) * 100) / 100;

  return { clamp, rng, Phi, pv, bond, curve, eh, inversionRecord, poole, taylor, nk, equity, house, fx, lb, debt, frontier };
}));
