/* Why a few firms win: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.FirmModels and by tests/models.cjs via require().
 * Each block names the textbook result it implements; parameters marked "tuned" are chosen for a readable
 * picture, not fitted to any market, and the page says so next to the model. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FirmModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* Seeded RNG (mulberry32) so simulated runs repeat exactly. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ───────── 1 · A seller with pricing power ─────────
   * Constant-elasticity demand Q(p) = Q0 (p/c)^(−ε), constant marginal cost c (Lerner 1934; any IO text,
   * e.g. Tirole 1988 ch. 1). MR = p(1 − 1/ε) = c  ⇒  p* = c·ε/(ε − 1), Lerner index (p* − c)/p* = 1/ε.
   * Surpluses are exact integrals: CS(p) = ∫_p^∞ Q = Q0 c^ε p^(1−ε)/(ε − 1). */
  const monopoly = {
    c: 10, Q0: 100,
    Q(p, e) { return this.Q0 * Math.pow(p / this.c, -e); },
    P(q, e) { return this.c * Math.pow(q / this.Q0, -1 / e); },        // inverse demand
    MR(q, e) { return this.P(q, e) * (1 - 1 / e); },
    cs(p, e) { return this.Q0 * Math.pow(this.c, e) * Math.pow(p, 1 - e) / (e - 1); },
    solve(e, mode) {
      const c = this.c, total = this.cs(c, e); // total surplus when price = marginal cost
      if (mode === 'pd') { // perfect (first-degree) price discrimination: every unit at its buyer's value
        return { p: null, q: this.Q0, lerner: null, profit: total, cs: 0, dwl: 0, total, qShare: 1 };
      }
      const p = c * e / (e - 1), q = this.Q(p, e), profit = (p - c) * q, cs = this.cs(p, e);
      return { p, q, lerner: (p - c) / p, markup: p / c - 1, profit, cs, dwl: total - cs - profit, total, qShare: q / this.Q0 };
    }
  };

  /* ───────── 2 · Cost structure decides market structure ─────────
   * One firm's cost C(q) = F + c·q + d·q² (fixed cost F, marginal cost rising with capacity strain d).
   * Average cost AC(q) = F/q + c + d·q has its minimum at the minimum efficient scale q* = √(F/d), AC* = c + 2√(Fd).
   * Serving a market of S units with k equal firms costs k·C(S/k); per unit: F·k/S + c + d·S/k, minimised at
   * k = S/q* (Baumol 1977 on subadditivity; Panzar 1989 Handbook of IO ch. 1). One firm is cheapest (a natural
   * monopoly at this size) when k = 1 beats k = 2, i.e. S < √2·q*. With d = 0 (no capacity strain), AC falls forever. */
  const cost = {
    c: 10,
    ac(q, F, d) { return F / q + this.c + d * q; },
    mes(F, d) { return d > 0 ? Math.sqrt(F / d) : Infinity; },
    acMin(F, d) { return d > 0 ? this.c + 2 * Math.sqrt(F * d) : this.c; },
    unitCostWithK(k, S, F, d) { return F * k / S + this.c + d * S / k; },
    bestK(S, F, d) { // best whole number of equal firms
      if (!(d > 0)) return 1;
      let k = Math.max(1, Math.floor(S / this.mes(F, d)));
      return this.unitCostWithK(k + 1, S, F, d) < this.unitCostWithK(k, S, F, d) ? k + 1 : k;
    },
    penaltyOfOne(S, F, d) { const k = this.bestK(S, F, d); return this.unitCostWithK(1, S, F, d) / this.unitCostWithK(k, S, F, d) - 1; },
    penaltyOfTwo(S, F, d) { const k = this.bestK(S, F, d); return this.unitCostWithK(2, S, F, d) / this.unitCostWithK(k, S, F, d) - 1; }
  };

  /* ───────── 3 · Competition among a few ─────────
   * Linear demand P = a − Q (market size 1), marginal cost c, N symmetric firms.
   * Cournot (1838): P = (a + N c)/(N + 1), q_i = (a − c)/(N + 1); Lerner = 1/(N·ε) at the equilibrium (= HHI/ε).
   * Bertrand (1883), identical products: N = 1 → monopoly price; N ≥ 2 → P = c.
   * Differentiated Bertrand with logit demand (Anderson, de Palma & Thisse 1992): s_j = e^(δ − p_j/σ) /
   * (1 + Σ_k e^(δ − p_k/σ)); first-order condition p − c = σ/(1 − s). σ is the price scale of taste differences. */
  const oligo = {
    a: 60, c: 10, delta: 4,
    cournot(N) {
      const { a, c } = this, P = (a + N * c) / (N + 1), q = (a - c) / (N + 1), Q = N * q;
      return { P, q, Q, lerner: (P - c) / P, hhi: 10000 / N, profit: (P - c) * q, eps: P / Q };
    },
    bertrand(N) {
      const { a, c } = this;
      if (N <= 1) { const P = (a + c) / 2, Q = a - P; return { P, q: Q, Q, lerner: (P - c) / P, hhi: 10000, profit: (P - c) * Q }; }
      return { P: c, q: (a - c) / N, Q: a - c, lerner: 0, hhi: 10000 / N, profit: 0 };
    },
    logitShare(p, N, sigma) { const u = Math.exp(this.delta - p / sigma); return u / (1 + N * u); },
    logit(N, sigma) {
      let p = this.c + sigma;
      for (let i = 0; i < 400; i++) { // damped fixed point on p = c + σ/(1 − s(p))
        const s = this.logitShare(p, N, sigma), np = this.c + sigma / (1 - s);
        if (Math.abs(np - p) < 1e-12) { p = np; break; }
        p = 0.5 * p + 0.5 * np;
      }
      const s = this.logitShare(p, N, sigma);
      return { P: p, s, lerner: (p - this.c) / p, hhi: 10000 / N, profit: (p - this.c) * s, outside: 1 - N * s };
    }
  };

  /* ───────── 4 · Entry: how many firms a market holds ─────────
   * Two-stage free entry (Sutton 1991, ch. 2; Mankiw & Whinston 1986): firms pay a sunk cost F to enter,
   * then compete. Market size S scales demand (P = a − Q/S). Firms enter while the next entrant still covers F.
   * Cournot: per-firm profit S(a − c)²/(N + 1)², so N* = ⌊(a − c)√(S/F)⌋ − 1 (number grows like √(S/F)).
   * Bertrand, identical goods: a second entrant earns 0, so N* = 1 whenever a monopoly covers F.
   * Logit: per-firm profit S·s·(p − c), solved numerically.
   * Contestable (Baumol, Panzar & Willig 1982): with entry costs fully recoverable, one firm can only charge
   * average cost, the lowest p with (p − c)·S(a − p) = F.
   * Welfare W(N) = consumer surplus + N·(profit − F); the social optimum N° maximises it. */
  const entry = {
    a: 60, c: 10, logitMass: 12, // logit demand mass per unit of market size (tuned so the three cases share a scale)
    gross(mode, N, S, sigma) {
      const { a, c } = this;
      if (mode === 'cournot') return S * Math.pow(a - c, 2) / Math.pow(N + 1, 2);
      if (mode === 'bertrand') return N === 1 ? S * Math.pow(a - c, 2) / 4 : 0;
      const L = oligo.logit(N, sigma); return this.logitMass * S * L.s * (L.P - c);
    },
    nStar(mode, S, F, sigma, cap = 200) {
      let N = 0;
      while (N < cap && this.gross(mode, N + 1, S, sigma) >= F) N++;
      return N;
    },
    outcome(mode, S, F, sigma) {
      const { a, c } = this;
      if (mode === 'contestable') {
        const mono = S * Math.pow(a - c, 2) / 4;
        if (mono < F) return { N: 0, P: null, lerner: null, hhi: null };
        // lowest p in [c, (a+c)/2] with (p − c)(a − p)S = F
        const m = (a + c) / 2, half = Math.sqrt(Math.pow(m - c, 2) - F / S), P = m - half;
        return { N: 1, P, lerner: (P - c) / P, hhi: 10000, cs: S * Math.pow(a - P, 2) / 2 };
      }
      const N = this.nStar(mode, S, F, sigma);
      if (N === 0) return { N: 0, P: null, lerner: null, hhi: null };
      let P;
      if (mode === 'cournot') P = (a + N * c) / (N + 1);
      else if (mode === 'bertrand') P = (a + c) / 2;
      else P = oligo.logit(N, sigma).P;
      return { N, P, lerner: (P - c) / P, hhi: 10000 / N };
    },
    welfareCournot(N, S, F) {
      const { a, c } = this; if (N === 0) return 0;
      const Q = S * N * (a - c) / (N + 1), P = a - Q / S;
      return S * Math.pow(a - P, 2) / 2 + N * ((P - c) * Q / N - F);
    },
    socialN(S, F, cap = 200) {
      let best = 0, bw = 0;
      for (let N = 1; N <= cap; N++) { const w = this.welfareCournot(N, S, F); if (w > bw) { bw = w; best = N; } }
      return best;
    }
  };

  /* ───────── 5 · Direct network effects: a demand curve with a hump ─────────
   * Rohlfs (1974); Economides (1996). Consumer types θ ~ U[0, 1] value joining at θ·n, where n is the share
   * already on the network. At price p the people who want to be on it are D(n) = 1 − p/n (for n > p).
   * Fulfilled-expectations demand: p = n(1 − n), a hump with its top at n = ½, p = ¼.
   * Equilibria at price p < ¼: n = 0, the critical mass n_c = (1 − √(1 − 4p))/2 (unstable) and
   * n_h = (1 + √(1 − 4p))/2 (stable). Adoption adjusts toward D(n): dn/dt = (D(n) − n)/τ. */
  const network = {
    tau: 1,
    want(n, p) { return n <= p ? 0 : 1 - p / n; },
    critical(p) { return p > 0.25 ? null : (1 - Math.sqrt(1 - 4 * p)) / 2; },
    high(p) { return p > 0.25 ? null : (1 + Math.sqrt(1 - 4 * p)) / 2; },
    step(n, p, h) { // exact enough: RK4 on dn/dt = (D(n) − n)/τ
      const f = x => (this.want(Math.max(0, x), p) - x) / this.tau;
      const k1 = f(n), k2 = f(n + h * k1 / 2), k3 = f(n + h * k2 / 2), k4 = f(n + h * k3);
      return clamp(n + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6, 0, 1);
    },
    run(n0, p, T, h = 0.01) { let n = n0; const out = [[0, n]]; for (let t = h; t <= T + 1e-9; t += h) { n = this.step(n, p, h); out.push([t, n]); } return out; }
  };

  /* ───────── 6 & 10 · Competing standards with increasing returns ─────────
   * Arthur (1989), "Competing technologies, increasing returns, and lock-in by historical events".
   * Adopters arrive one at a time; half (at random) are R-types who prefer A by g, half S-types who prefer B by g.
   * Each adopter takes the option with the higher payoff: natural preference + r × (users it can reach).
   * Reach on A = single-homers on A + multi-homers + φ × single-homers on B (φ = interoperability).
   * A fraction h of adopters multi-home (join both). Without φ or h this is Arthur's model: once the gap
   * between the two user counts exceeds g / r everyone follows the leader (lock-in). */
  const standards = {
    run(opts, seed) {
      const { r = 0.1, g = 1, phi = 0, h = 0, n = 1000 } = opts, rand = rng(seed);
      let a = 0, b = 0, m = 0, lockedAt = null, path = [[0, 0.5]];
      for (let i = 1; i <= n; i++) {
        if (rand() < h) { m++; }
        else {
          const R = rand() < 0.5;
          const reachA = a + m + phi * b, reachB = b + m + phi * a;
          const uA = (R ? g : 0) + r * reachA, uB = (R ? 0 : g) + r * reachB;
          if (uA > uB || (uA === uB && rand() < 0.5)) a++; else b++;
          if (lockedAt === null && r * (1 - phi) * Math.abs(a - b) > g) lockedAt = i;
        }
        if (i % 5 === 0) path.push([i, a + b ? a / (a + b) : 0.5]);
      }
      const lead = Math.max(a, b) / Math.max(1, a + b);
      return { a, b, m, lead, lockedAt, path, winner: a >= b ? 'A' : 'B' };
    },
    threshold(r, g, phi) { return r * (1 - phi) > 0 ? g / (r * (1 - phi)) : Infinity; },
    batch(opts, runs, seed0) {
      const leads = []; let tipped = 0, aWins = 0;
      for (let k = 0; k < runs; k++) { const R = this.run(opts, seed0 + k); leads.push(R.lead); if (R.lead >= 0.9) tipped++; if (R.winner === 'A') aWins++; }
      return { leads, tipped, tippedShare: tipped / runs, aWins };
    }
  };

  /* ───────── 7 · Two-sided platforms ─────────
   * Armstrong (2006), RAND J. Econ. 37(3). Side i's participation n_i = v_i + α_i·n_j − p_i (linear demand in
   * net utility). α_i = how much a member of side i gains from each member of side j; f_i = cost per member.
   * Monopoly platform: profit Σ (p_i − f_i) n_i. Writing prices through participation and solving the two
   * first-order conditions (with s = α1 + α2 < 2, g_i = v_i − f_i):
   *   n1 = (2 g1 + s g2)/(4 − s²),  n2 = (2 g2 + s g1)/(4 − s²),  p_i = f_i + n_i − α_j n_j
   * i.e. price = cost + the usual markup − the value this side brings to the other side (Armstrong eq. 4).
   * Duopoly, both sides single-home on a Hotelling line (Armstrong Prop. 2): p_i = f_i + t_i − α_j. */
  const platform = {
    v1: 0.5, v2: 1, f1: 0.2, f2: 0.2, t: 1,
    monopoly(a1, a2, o = {}) {
      const v1 = o.v1 ?? this.v1, v2 = o.v2 ?? this.v2, f1 = this.f1, f2 = this.f2;
      const s = a1 + a2, g1 = v1 - f1, g2 = v2 - f2, D = 4 - s * s;
      const n1 = (2 * g1 + s * g2) / D, n2 = (2 * g2 + s * g1) / D;
      const p1 = f1 + n1 - a2 * n2, p2 = f2 + n2 - a1 * n1;
      return { n1, n2, p1, p2, profit: (p1 - f1) * n1 + (p2 - f2) * n2, f1, f2 };
    },
    oneSided(o = {}) { // the same platform pricing each side as if the other did not exist (α = 0)
      return this.monopoly(0, 0, o);
    },
    duopoly(a1, a2) { const p1 = this.f1 + this.t - a2, p2 = this.f2 + this.t - a1; return { p1, p2, f1: this.f1, f2: this.f2, n1: 0.5, n2: 0.5 }; }
  };

  /* ───────── 8 · Data feedback loops ─────────
   * Two firms. Each firm's error falls as a power of the data it holds, e = X^(−β) (the data term of the
   * Chinchilla scaling law, Hoffmann et al. 2022; the same form as Wright's 1936 learning curve on the cost side).
   * Users pick by a logit on quality: s1 = 1/(1 + e^(−λ (e2 − e1))). Data arrives in proportion to users and
   * goes stale at rate δ: dX_i/dt = s_i − δ X_i. λ and the starting stocks are tuned for a readable picture. */
  const data = {
    lambda: 5, X0: 1, lead: 2, // firm 1 starts with `lead` × the data of firm 2
    share(X1, X2, beta) { const e1 = Math.pow(X1, -beta), e2 = Math.pow(X2, -beta); return 1 / (1 + Math.exp(-this.lambda * (e2 - e1))); },
    // symmetric split is stable iff λ·β·δ^β·2^β < 1 (linearise the steady state X_i = s_i/δ); δc solves it with equality
    tipDelta(beta) { return 1 / (2 * Math.pow(this.lambda * beta, 1 / beta)); },
    // the lowest δ at which the 2× head start ends with firm 1 above 95% (bisection on long runs). Below δc the even
    // split is locally stable, so between this value and δc the outcome depends on where the race starts.
    tipFromStart(beta, T = 1500) {
      let lo = 0, hi = 0.3; const tips = d => { const r = this.run(beta, d, T, 0.05); return r[r.length - 1][1] > 0.95; };
      if (!tips(hi)) return Infinity;
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (tips(m)) hi = m; else lo = m; }
      return hi;
    },
    run(beta, delta, T = 300, h = 0.05) {
      let X1 = this.X0 * this.lead, X2 = this.X0; const out = [];
      for (let t = 0; t <= T + 1e-9; t += h) {
        const s = this.share(X1, X2, beta);
        if (Math.abs(t - Math.round(t)) < h / 2) out.push([Math.round(t), s, Math.pow(X1, -beta), Math.pow(X2, -beta)]);
        X1 += h * (s - delta * X1); X2 += h * ((1 - s) - delta * X2);
      }
      return out;
    }
  };

  /* ───────── 9 · Tying and the one-monopoly-profit argument ─────────
   * After Whinston (1990, AER 80(4)). M owns a monopoly product A that system users need; B is an add-on.
   * System users (mass 1) value A + B at V with M's B, V + Δ with the rival's better B. Some B buyers (mass m)
   * use B without A, valuing M's B at w and the rival's at w + Δ. All marginal costs are 0. The rival pays a
   * fixed cost K to stay in business. Prices: Bertrand in B (rival's price = M's B price + Δ).
   * Open: M charges V for A and earns V; the rival earns (1 + m)Δ − K.
   * Tie (A only sold with M's B): the rival loses system users and earns mΔ − K. If that is negative it exits
   * and M also takes the stand-alone buyers at w. Chicago's "one monopoly profit": with m = 0 tying gains M nothing. */
  const tying = {
    V: 10, w: 2,
    solve(m, delta, K) {
      const V = this.V, w = this.w;
      const rivalOpen = (1 + m) * delta - K, rivalTie = m * delta - K;
      const rivalInOpen = rivalOpen >= 0, rivalInTie = rivalInOpen && rivalTie >= 0;
      const mOpen = V + (rivalInOpen ? 0 : m * w), mTie = V + (rivalInTie ? 0 : m * w);
      const totalOpen = rivalInOpen ? V + delta + m * (w + delta) - K : V + m * w;
      const totalTie = rivalInTie ? V + m * (w + delta) - K : V + m * w;
      return { rivalOpen, rivalTie, rivalInOpen, rivalInTie, mOpen, mTie, gain: mTie - mOpen, totalOpen, totalTie, loss: totalOpen - totalTie };
    },
    // vertical chain with linear demand P = a − Q, upstream cost c (Spengler 1950)
    doubleMarginal(a, c) {
      const w = (a + c) / 2, Psep = (a + w) / 2, Pint = (a + c) / 2;
      const profSep = (w - c) * (a - Psep) + (Psep - w) * (a - Psep), profInt = (Pint - c) * (a - Pint);
      return { w, Psep, Pint, profSep, profInt };
    }
  };

  /* ───────── 11 · Measuring markups from production data ─────────
   * De Loecker, Eeckhout & Unger (2020): markup μ = θ_V × (sales / variable-input spending), θ_V = output
   * elasticity of the variable input. Illustration of the critique in Traina (2018): if part of variable cost is
   * booked as SG&A and the share booked as cost of goods sold (COGS) falls, the COGS-only estimate rises even
   * when the true markup is constant. Synthetic economy; all numbers illustrative. */
  const markups = {
    mu: 1.2, y0: 1980, y1: 2016, cogs0: 0.85,
    series(cogs1, withSGA) {
      const out = [];
      for (let y = this.y0; y <= this.y1; y++) {
        const f = (y - this.y0) / (this.y1 - this.y0), cogsShare = this.cogs0 + (cogs1 - this.cogs0) * f;
        // sales = 1, true variable cost = 1/μ. COGS-only estimator: θ_COGS (fixed at its first-year value, so the
        // estimate starts at the truth) × sales / COGS. Counting SG&A as variable: θ_V × sales / (COGS + SG&A) = μ.
        const vc = 1 / this.mu, cogs = vc * cogsShare, thetaCogs = this.mu * vc * this.cogs0;
        out.push([y, withSGA ? this.mu * vc / vc : thetaCogs / cogs]);
      }
      return out;
    }
  };

  /* Cournot with unequal costs (slope-one linear demand P = a − Q): P = (a + Σc_i)/(N + 1), q_i = P − c_i.
   * Used in chapter 11 for Demsetz's (1973) point that concentration can rise because one firm got better. */
  const asym = {
    a: 60,
    solve(costs) {
      let act = costs.slice();
      for (let it = 0; it < costs.length; it++) { // drop firms that would produce nothing
        const P = (this.a + act.reduce((x, y) => x + y, 0)) / (act.length + 1), keep = act.filter(c => P - c > 0);
        if (keep.length === act.length) break; act = keep;
      }
      const P = (this.a + act.reduce((x, y) => x + y, 0)) / (act.length + 1);
      const q = costs.map(c => Math.max(0, P - c)), Q = q.reduce((x, y) => x + y, 0);
      const shares = q.map(x => x / Q), hhi = shares.reduce((s, x) => s + 10000 * x * x, 0);
      return { P, q, Q, shares, hhi, cs: Q * Q / 2, lerner1: (P - costs[0]) / P };
    }
  };

  /* ───────── 12 · HHI bounds from a partial list of shares ─────────
   * HHI = Σ (100·s_i)². When only the top shares are known, the rest can be anything from many tiny firms
   * (lower bound) to firms each as large as the smallest listed one (upper bound). */
  function hhiBounds(shares) { // shares in percent
    const known = shares.reduce((s, x) => s + x * x, 0), rest = Math.max(0, 100 - shares.reduce((s, x) => s + x, 0));
    const smin = Math.min(...shares), k = Math.floor(rest / smin), rem = rest - k * smin;
    return { lo: known, hi: known + k * smin * smin + rem * rem, rest };
  }

  /* ───────── FRONTIER DATA BLOCK (facts that will go stale) ─────────
   * Numbers only; the sentences that carry them are in copy.zh.js under "ch12.*". Every entry has the date the
   * figure refers to, the date it was checked, and its source (full citations in BRIEF.md, "Facts that will go stale").
   * kind: 'measured' = an analyst's or company's reported figure; 'claim' = from a party with an interest. */
  const FRONTIER = {
    checked: '2026-11-11',
    cloud: { asOf: '2026-Q3', shares: [26, 19, 16], names: ['Amazon', 'Microsoft', 'Google'], marketBn: 167.7, growthPct: 55, kind: 'measured',
      source: 'Synergy Research Group / TechInsights, 2026-10-30' },
    foundry: { asOf: '2026-Q2', shares: [72.5, 5.9, 5.4], names: ['TSMC', 'Samsung', 'SMIC'], top10Bn: 53.49, kind: 'measured',
      source: 'TrendForce press release, 2026-09-09 (shares of top-10 foundry revenue)' },
    tsmcCapexBn: { asOf: '2026 guidance', lo: 60, hi: 64, kind: 'measured', source: 'TSMC Q3 2026 call, 2026-10-15, via trade press' },
    nvidia: { asOf: 'quarter to 2026-07-26', revenueBn: 96.2, dataCenterBn: 89.0, grossMarginPct: 75.0, kind: 'measured',
      source: 'NVIDIA press release, 2026-08-26' },
    trainingCostGrowth: { perYear: 2.4, lo: 2.0, hi: 2.9, since: 2016, kind: 'measured', source: 'Cottier et al. 2024, arXiv:2405.21015' },
    inferencePriceFall: { lo: 9, hi: 900, example: 40, asOf: '2025-03', kind: 'measured', source: 'Epoch AI data insight, 2025-03-12' },
    openGapMonths: { months: 4, asOf: '2026-05', kind: 'measured', source: 'Epoch AI data insight, 2026-05-29' },
    enterpriseApi: { asOf: '2026-09', shares: [55, 31, 9], names: ['Anthropic', 'OpenAI', 'Google'], openSpendPct: 4, openTokenPct: 19, kind: 'claim',
      source: 'Menlo Ventures, "2026: The State of Enterprise AI", 2026-11-03 (survey of ~400 US enterprises; Menlo is an Anthropic investor)' },
    hhiThreshold: { highly: 1800, delta: 100, source: 'US 2023 Merger Guidelines (kept in force 2025-02-18)' }
  };

  return { FRONTIER, clamp, rng, monopoly, cost, oligo, entry, network, standards, platform, data, tying, markups, asym, hhiBounds };
}));
