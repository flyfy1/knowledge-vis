/* Where taxes and price caps fall: the page's models as plain functions (UMD: the page and node tests share them).
   Every number the prose states is computed here and bound through bindings.cjs, then re-derived in tests/models.cjs.
   Convention: elasticities are magnitudes (ed = |demand elasticity| > 0, es = supply elasticity > 0), measured at the
   untaxed equilibrium P0 = 100 yuan, Q0 = 100 units. The brief's signed form ε_s/(ε_s − ε_d) is the same number.
   Models:
     incidence  a per-unit tax (or, negative, a subsidy) between linear demand and supply; exact split, revenue, loss (ch2, ch7, ch10)
     curve      revenue R(t) = t·Q(t) and deadweight loss on the same axis; prohibitive tax, revenue peak, crossover (ch3, ch4)
     ramsey     a fixed revenue raised from two goods of different elasticity; total loss against the split (ch3)
     laffer     income tax with a constant elasticity of taxable income e and Pareto parameter a (Saez–Slemrod–Giertz) (ch4)
     iit        China's comprehensive-income schedule and the separate one-off-bonus schedule; marginal and average rates (ch5)
     vat        three firms, one rate: VAT, retail sales tax, turnover tax, an exempt firm in the middle or at the end (ch6)
     cap        a rent ceiling with sluggish supply Q_t = Q_{t-1} + λ(Q*(P̄) − Q_{t-1}); shortage and shadow price (ch8, ch9)
     land       capitalisation of a tax on land value: P = R/(r + τ) (ch10) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TaxModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── formatting: Western digits; thousands comma only from 10,000 (the same in both languages) ── */
  function fmt(x, d) {
    if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
    d = d == null ? 0 : d;
    let s = Math.abs(x).toFixed(d);
    if (+s === 0) x = 0;
    const [i, f] = s.split('.');
    const ii = Math.abs(x) >= 10000 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : i;
    return (x < 0 ? '−' : '') + ii + (f ? '.' + f : '');
  }
  const signed = (x, d) => (x > 0 && +Math.abs(x).toFixed(d == null ? 0 : d) !== 0 ? '+' : '') + fmt(x, d);

  const P0 = 100, Q0 = 100;
  const qd = (p, ed) => Q0 * (1 - ed * (p - P0) / P0);
  const qs = (p, es) => Q0 * (1 + es * (p - P0) / P0);

  /* ── ch2 · incidence. Per-unit tax t (negative = subsidy). Exact for linear curves:
     Pb − P0 = es·t/(es + ed), Ps = Pb − t. The legal payer only changes which price the tag shows. ── */
  function incidence(ed, es, t, payer) {
    const share = es / (es + ed);
    const pb = P0 + share * t, ps = pb - t, q = qd(pb, ed);
    const rev = t * q, dwl = 0.5 * Math.abs(t) * Math.abs(Q0 - q);
    const posted = payer === 'buyer' ? ps : pb;            // seller-paid: tag includes tax; buyer-paid: tax added at the till
    return { share, sellerShare: 1 - share, pb, ps, q, rev, dwl, posted, buyerBurden: (pb - P0) * q, sellerBurden: (P0 - ps) * q };
  }

  /* ── ch3–4 · revenue and loss against the tax. Q(t) = Q0 − k·t with k = ed·es/(ed + es)·Q0/P0. ── */
  const kOf = (ed, es) => ed * es / (ed + es) * Q0 / P0;
  function curve(ed, es, t) {
    const k = kOf(ed, es), tMax = Q0 / k, tc = Math.min(Math.max(t, 0), tMax);
    const R = tc * (Q0 - k * tc), D = 0.5 * k * tc * tc;
    return { k, tMax, tPeak: tMax / 2, Rpeak: Q0 * tMax / 4, tCross: 2 * tMax / 3, R, D,
      mcf: tc < tMax / 2 ? (k * tc) / (Q0 - 2 * k * tc) : Infinity };   // extra loss per extra yuan of revenue
  }

  /* ── ch3 · Ramsey: raise revenue Rt from good A and good B; shareA of it from A. Each tax is the smaller root of
     t(Q0 − k t) = R_i. Small-tax optimum: t_A/t_B = k_B/k_A (tax the less elastic good more). ── */
  const RAMSEY = { A: { ed: 0.3, es: 1 }, B: { ed: 2, es: 1 }, R: 1000 };
  function taxFor(k, R) { const disc = Q0 * Q0 - 4 * k * R; return disc < 0 ? NaN : (Q0 - Math.sqrt(disc)) / (2 * k); }
  function ramsey(shareA, o) {
    o = Object.assign({}, RAMSEY, o || {});
    const kA = kOf(o.A.ed, o.A.es), kB = kOf(o.B.ed, o.B.es);
    const tA = taxFor(kA, shareA * o.R), tB = taxFor(kB, (1 - shareA) * o.R);
    const dA = 0.5 * kA * tA * tA, dB = 0.5 * kB * tB * tB;
    return { kA, kB, tA, tB, dA, dB, dwl: dA + dB };
  }
  function ramseyBest(o) {
    let best = { s: 0, dwl: Infinity };
    for (let i = 0; i <= 10000; i++) { const s = i / 10000, r = ramsey(s, o); if (r.dwl < best.dwl) best = { s, dwl: r.dwl, r }; }
    return best;
  }
  function ramseyUniform(o) {          // the same tax per unit on both goods
    o = Object.assign({}, RAMSEY, o || {});
    const kA = kOf(o.A.ed, o.A.es), kB = kOf(o.B.ed, o.B.es);
    const t = taxFor((kA + kB) / 2, o.R / 2);     // t(2Q0 − (kA + kB)t) = R
    const RA = t * (Q0 - kA * t);
    return Object.assign({ t, s: RA / o.R }, ramsey(RA / o.R, o));
  }

  /* ── ch4 · income tax with elasticity of taxable income e; Pareto tail parameter a (a = 1: a flat tax on all income).
     Revenue R(τ) ∝ τ(1 − τ)^(a·e), so dR/dτ = 0 at τ* = 1/(1 + a·e) (Saez, Slemrod & Giertz 2012, eq. 7).
     Behavioural loss per mechanical yuan: (τ/(1 − τ))·e·a (their eq. 5). Excess burden EB(τ) = ∫0^τ s·(−dB/ds) ds. ── */
  function laffer(e, a, tau) {
    const ae = a * e, base = Math.pow(1 - tau, ae), R = tau * base;
    const lost = tau >= 1 ? Infinity : tau / (1 - tau) * ae;          // −dB/dM
    let eb = 0; const m = 400;
    for (let i = 0; i < m; i++) { const s = (i + 0.5) * tau / m; eb += s * ae * Math.pow(1 - s, ae - 1) * tau / m; }
    const star = 1 / (1 + ae);
    return { R, base, lost, meb: lost >= 1 ? Infinity : lost / (1 - lost), eb, star, Rstar: star * Math.pow(1 - star, ae) };
  }

  /* ── ch5 · China individual income tax (2018 law): annual comprehensive-income table on income after the basic
     deduction; the monthly table applied to bonus/12 for a one-off annual bonus taxed separately (MOF/STA 2023 No. 30).
     Rows: [upper bound, rate, quick deduction]. ── */
  const IIT_YEAR = [[36000, 0.03, 0], [144000, 0.10, 2520], [300000, 0.20, 16920], [420000, 0.25, 31920], [660000, 0.30, 52920], [960000, 0.35, 85920], [Infinity, 0.45, 181920]];
  const IIT_MONTH = [[3000, 0.03, 0], [12000, 0.10, 210], [25000, 0.20, 1410], [35000, 0.25, 2660], [55000, 0.30, 4410], [80000, 0.35, 7160], [Infinity, 0.45, 15160]];
  const rowFor = (tbl, x) => tbl.find(r => x <= r[0]);
  function bracketTax(tbl, x) {        // marginal-bracket computation, independent of the quick deductions
    let tax = 0, lo = 0;
    for (const [hi, r] of tbl) { if (x > lo) tax += (Math.min(x, hi) - lo) * r; lo = hi; }
    return tax;
  }
  function iit(income, o) {           // comprehensive income; o.ded basic deduction (default 60,000); o.benefit {B, cut}
    o = o || {};
    const ded = o.ded == null ? 60000 : o.ded;
    const tax0 = x => { const ti = Math.max(0, x - ded); const r = rowFor(IIT_YEAR, ti); return Math.max(0, ti * r[1] - r[2]); };
    const ben = x => (o.benefit && x <= o.benefit.cut ? o.benefit.B : 0);
    const take = x => x - tax0(x) + ben(x);
    const tax = tax0(income), ti = Math.max(0, income - ded);
    const marg = ti <= 0 ? 0 : rowFor(IIT_YEAR, ti)[1];
    const h = 1000, implied = 1 - (take(income + h) - take(income)) / h;       // over the next 1,000 yuan
    return { tax, ti, avg: income > 0 ? tax / income : 0, marg, take: take(income), implied };
  }
  function bonus(B) {                 // separate taxation of a one-off annual bonus
    const r = rowFor(IIT_MONTH, B / 12), tax = Math.max(0, B * r[1] - r[2]);
    return { tax, rate: r[1], take: B - tax };
  }
  function bonusNotches() {           // at each monthly threshold ×12: the jump and the "dead zone" end
    return IIT_MONTH.slice(0, -1).map((row, i) => {
      const at = row[0] * 12, jump = bonus(at + 1).tax - bonus(at).tax;
      const nx = IIT_MONTH[i + 1];
      const end = (bonus(at).take - nx[2]) / (1 - nx[1]);          // B − (B·r − qd) = take(at)
      return { at, before: bonus(at).tax, after: bonus(at + 1).tax, jump, end };
    });
  }

  /* ── ch6 · VAT chain. Pre-tax value added: farm 30, mill 30, bakery 40 (sales 30, 60, 100).
     An exempt firm charges no VAT and cannot reclaim the VAT on its inputs, which becomes its cost and is passed on. ── */
  const VAT = { va: [30, 30, 40] };
  function vat(mode, rate, va) {
    va = va || VAT.va;
    const n = va.length, stage = [];
    let buyCost = 0, credit = 0, gross = 0;    // buyCost: what the firm paid for inputs, credit: reclaimable input VAT
    for (let i = 0; i < n; i++) {
      const last = i === n - 1;
      let price, tax, collected;
      if (mode === 'turnover') {               // tax on gross receipts at every stage, passed on in the price
        const net = buyCost + va[i]; tax = rate * net; price = net + tax; collected = tax;
        buyCost = price;
      } else if (mode === 'retail') {          // only the last sale is taxed
        const net = buyCost + va[i]; tax = last ? rate * net : 0; price = net + tax; collected = tax;
        buyCost = net;
      } else {                                 // 'vat', 'exMid' (stage 1 exempt), 'exLast' (last stage exempt)
        const exempt = (mode === 'exMid' && i === 1) || (mode === 'exLast' && last);
        if (exempt) { const net = buyCost + va[i]; tax = 0; collected = 0; price = net; credit = 0; buyCost = price; }
        else { const net = buyCost - credit + va[i]; tax = rate * net; collected = tax - credit; price = net + tax; credit = tax; buyCost = price; }
      }
      gross += collected; stage.push({ tax, collected, price });
    }
    const final = stage[n - 1].price, base = va.reduce((s, x) => s + x, 0);
    return { stage, total: gross, final, base, eff: gross / base };
  }

  /* ── ch8–9 · rent ceiling P̄. Demand qd(P, ed); long-run supply qs(P, esL); the stock starts at qs(P̄, esS) and moves a
     fraction λ of the way to qs(P̄, esL) each year. Shadow price: the rent at which demand equals the stock. ── */
  const CAP = { pbar: 85, ed: 0.5, esS: 0.1, esL: 1, lam: 0.3 };
  function cap(o, years) {
    o = Object.assign({}, CAP, o || {});
    const D = qd(o.pbar, o.ed), target = qs(o.pbar, o.esL);
    let Q = qs(o.pbar, o.esS); const path = [];
    for (let y = 0; y <= (years == null ? 20 : years); y++) {
      if (y > 0) Q = Q + o.lam * (target - Q);
      const shadow = P0 + P0 * (1 - Q / Q0) / o.ed;
      path.push({ y, Q, D, shortage: D - Q, shadow, transfer: (P0 - o.pbar) * Q, search: Math.max(0, shadow - o.pbar) * Q });
    }
    return { o, D, target, path, closed: { Q: target, shadow: P0 + P0 * (1 - target / Q0) / o.ed } };
  }

  /* ── ch10 · capitalisation. Land earns rent R a year; with interest r and an annual tax τ on its value,
     P = R/(r + τ). The fall in price equals the present value of all future tax payments. ── */
  function land(r, tau, landShare) {
    const Rr = r * 100;                         // rent such that the untaxed price is 100
    const P = Rr / (r + tau), drop = 1 - P / 100;
    const pvTax = tau * P / r;                  // τ·P each year, forever, discounted at r
    return { P, drop, pvTax, house: (landShare == null ? 1 : landShare) * drop, taxYear: tau * P };
  }

  /* ── frontier figures (opened 2026-11-25; sources in BRIEF.md) ── */
  const FRONTIER = {
    ssg: { lo: 0.12, hi: 0.4, a: 1.6, eEx: 0.5, tauEx: 0.35 },          // Saez, Slemrod & Giertz (2012 JEL; 2009 WP text)
    bckh: { asym: 2, from: 1996, to: 2015 },                            // Benzarti, Carloni, Harju & Kosonen (2020 JPE)
    fns: { products: 190000, drop: 2, std0: 0.19, std1: 0.16, red0: 0.07, red1: 0.05 }, // Fuest, Neumeier & Stöhlker (2020)
    dmq: { stay: 20, supply: 15, rent: 5.1, year: 1994 },               // Diamond, McQuade & Qian (2019 AER)
    cn: { vatLaw: '2026-01-01', rates: [13, 9, 6], levy: 3, bonusTo: '2027-12-31', ptAuth: '2021-10-23', ptYears: 5, ptPilot: 2011 },
    p2: { sbs: '2026-01-05', min: 15 }
  };
  const fullPass = (t0, t1) => (1 + t1) / (1 + t0) - 1;

  return { fmt, signed, P0, Q0, qd, qs, incidence, kOf, curve, RAMSEY, taxFor, ramsey, ramseyBest, ramseyUniform, laffer,
    IIT_YEAR, IIT_MONTH, bracketTax, iit, bonus, bonusNotches, VAT, vat, CAP, cap, land, FRONTIER, fullPass };
}));
