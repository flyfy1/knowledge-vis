/* Stablecoins, CBDCs and new kinds of money: the page's models. Each is a small, exactly specified toy; the prose
   reads its numbers off these functions (bindings.cjs) and tests/models.cjs re-derives them.
   - unitOfAccount (ch2): a price list kept in a volatile unit. Log value is a driftless Brownian motion, so the value
     after t years is log-normal (90% band = exp(±1.645·σ√t)), and the expected time until it leaves a ±a band
     (a = ln(1+band)) is a²/σ² (exit time of Brownian motion from a symmetric interval), i.e. σ²/a² repricings a year.
   - pegSim (ch3): a reserve-backed coin. Holders' wish to sell is a random walk plus a news jump; arbitrageurs mint or
     redeem at par, but only past a cost threshold f and at most K per hour, and not while redemption is closed. The
     coin's price is 1 minus the part of the selling wish nobody has absorbed yet.
   - runModel (ch4): first-come-first-served redemption at par from a reserve of liquid assets, sellable assets (fire-
     sale haircut h) and a hole x, with an equity buffer e. Holders redeem when the value of staying V(R) falls more
     than their tolerance below par. Iterated to the smallest fixed point above the jumpy share (Diamond–Dybvig 1983
     logic; the threshold form is the textbook global-games simplification).
   - spiral (ch5): an algorithmic coin redeemable for $1 of a volatile token at its market price (Terra-style mint/
     burn). Minted tokens are sold with price impact exp(−$/D). For small swaps, coverage falls iff 1/D > 1/M + 1/U.
   - issuer (ch6): reserve income on a rate-sensitive supply U(r) = U0·e^{−η(r−r0)}, a distribution share δ and fixed
     costs C. Profit peaks at r = 1/η.
   - cbdcCap (ch7): how much of bank deposits a per-person holding cap lets out, with log-normal household deposits;
     E[min(D, c)] in closed form.
   Numbers chosen for a model rather than taken from a source are marked TUNED. FRONTIER is the dated data of the
   frontier chapter; BRIEF.md has each source.
   UMD: window.StablecoinModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.StablecoinModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── helpers ───────── */
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gaussian(r) { // Box–Muller
    let spare = null;
    return function () {
      if (spare != null) { const s = spare; spare = null; return s; }
      let u = 0; while (u === 0) u = r();
      const m = Math.sqrt(-2 * Math.log(u)), a = 2 * Math.PI * r();
      spare = m * Math.sin(a); return m * Math.cos(a);
    };
  }
  function cdf(x) { // Hart (1968) via G. West (2005), double precision
    const xa = Math.abs(x); let c;
    if (xa > 37) c = 0;
    else {
      const e = Math.exp(-xa * xa / 2);
      if (xa < 7.07106781186547) {
        let b = 3.52624965998911e-02 * xa + 0.700383064443688; b = b * xa + 6.37396220353165; b = b * xa + 33.912866078383; b = b * xa + 112.079291497871; b = b * xa + 221.213596169931; b = b * xa + 220.206867912376;
        c = e * b;
        b = 8.83883476483184e-02 * xa + 1.75566716318264; b = b * xa + 16.064177579207; b = b * xa + 86.7807322029461; b = b * xa + 296.564248779674; b = b * xa + 637.333633378831; b = b * xa + 793.826512519948; b = b * xa + 440.413735824752;
        c = c / b;
      } else { let b = xa + 0.65; b = xa + 4 / b; b = xa + 3 / b; b = xa + 2 / b; b = xa + 1 / b; c = e / b / 2.506628274631; }
    }
    return x > 0 ? 1 - c : c;
  }
  function fmt(x, d, lang) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    d = d == null ? 0 : d;
    let s = Math.abs(x).toFixed(d);
    if (+s === 0) return s;
    const [i, f] = s.split('.');
    s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
    return (x < 0 ? '−' : '') + s;
  }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const Z90 = 1.6448536269514722; // Φ⁻¹(0.95)

  /* ═════════ ch2: a price list in a volatile unit ═════════ */
  // sigma: annualised volatility of the unit's dollar value; days: horizon; band: tolerated drift before repricing.
  function unitOfAccount(o) {
    const sigma = o.sigma, t = o.days / 365, band = o.band, s = sigma * Math.sqrt(t);
    const a = Math.log(1 + band);
    const lo = 100 * Math.exp(-Z90 * s), hi = 100 * Math.exp(Z90 * s);
    const pOut = sigma > 0 ? 2 * cdf(-a / s) : 0;                     // P(|ln V_t/V_0| > a) at the horizon
    const perYear = sigma > 0 ? sigma * sigma / (a * a) : 0;          // 1 / E[exit time] = σ²/a²
    return { lo, hi, pOut, perYear, daysBetween: perYear > 0 ? 365 / perYear : Infinity };
  }
  // One seeded year of daily dollar values of a 100-unit price tag, repriced back to 100 whenever it leaves the band.
  function unitPath(o) {
    const g = gaussian(rng(o.seed || 7)), dt = 1 / 365, a = Math.log(1 + o.band), steps = o.steps || 365;
    let x = 0; const vals = [100], resets = [];
    for (let i = 1; i <= steps; i++) {
      x += o.sigma * Math.sqrt(dt) * g();
      vals.push(100 * Math.exp(x));
      if (Math.abs(x) >= a) { resets.push(i); x = 0; }
    }
    return { vals, resets };
  }

  /* ═════════ ch3: the peg and its arbitrage ═════════ */
  // All quantities in price units: a selling wish of 0.03 left unabsorbed moves the price 3% below par.
  const PEG = { hours: 240, sigma: 0.0015, jumpAt: 96, closeFrom: 96, closeHours: 60, seed: 11 }; // TUNED
  function pegSim(o) {
    const P = Object.assign({}, PEG, o), g = gaussian(rng(P.seed));
    let s = 0, A = 0; const price = [], absorbed = [], wish = [];
    let maxDev = 0, out = 0, closedHours = 0;
    for (let h = 0; h < P.hours; h++) {
      s += P.sigma * g();
      if (h === P.jumpAt) s += P.jump;
      const closed = P.closed && h >= P.closeFrom && h < P.closeFrom + P.closeHours;
      if (closed) closedHours++;
      const e = s - A;                         // unabsorbed wish to sell (>0) or to buy (<0)
      const cap = P.cap;
      let a = 0;
      if (e > P.fee) a = closed ? 0 : Math.min(cap, e - P.fee);           // buy cheap coins, redeem at par
      else if (e < -P.fee) a = closed ? 0 : -Math.min(cap, -e - P.fee);   // mint at par, sell dear
      A += a;
      const p = 1 - (s - A);
      price.push(p); absorbed.push(A); wish.push(s);
      const dev = Math.abs(1 - p); if (dev > maxDev) maxDev = dev; if (dev > 0.005 + 1e-12) out++;
    }
    return { price, absorbed, wish, maxDev, outShare: out / P.hours, minPrice: Math.min.apply(null, price), redeemed: A, closedHours };
  }

  /* ═════════ ch4: a run on the peg ═════════ */
  // liq: liquid share of assets; hair: fire-sale haircut on the rest; loss: hole (share of coins); buf: equity buffer
  // (share of coins); jumpy: share that redeems at the first news; tol: holders' tolerance spread (uniform 0..tol).
  const RUN = { tol: 0.01, rounds: 40 }; // TUNED
  function runBook(o) {
    const A = 1 + o.buf, x = o.loss, L = Math.min(o.liq * A, Math.max(0, A - x)), S = Math.max(0, A - x - L), h = o.hair;
    const cashMax = L + S * (1 - h);                    // all the cash the reserve can raise
    function at(R) {
      if (R > cashMax + 1e-12) return { R, fire: h * S, sold: S, V: 0, dflt: true };
      const need = Math.max(0, R - L), sold = need / (1 - h), fire = h * sold;
      const left = A - x - R - fire;
      const V = R < 1 ? left / (1 - R) : 1;
      return { R, fire, sold, V, dflt: false, left };
    }
    return { A, L, S, x, h, cashMax, at };
  }
  function runModel(o) {
    const P = Object.assign({}, RUN, o), B = runBook(P), G = z => clamp(z / P.tol, 0, 1);
    let R = P.jumpy; const path = [];
    let st = B.at(Math.min(R, B.cashMax));
    for (let n = 0; n < P.rounds; n++) {
      st = B.at(R);
      path.push({ R, V: st.V, dflt: st.dflt });
      if (st.dflt) break;
      const nR = P.jumpy + (1 - P.jumpy) * G(1 - st.V);
      if (Math.abs(nR - R) < 1e-12) break;
      R = Math.max(R, nR);
    }
    const dflt = R > B.cashMax + 1e-12;
    const Rf = dflt ? B.cashMax : R, fin = B.at(Rf);
    // average payout per coin: redeemers get 1 (until the cash runs out), stayers min(1, V)
    const avg = dflt ? B.cashMax : Rf + (1 - Rf) * Math.min(1, Math.max(0, fin.V));
    const status = dflt ? 'default' : Rf >= 1 - 1e-9 ? 'all' : Rf > P.jumpy + 1e-6 ? 'partial' : 'calm';
    return { path, R: Rf, V: dflt ? 0 : fin.V, V0: B.at(P.jumpy).V, fire: fin.fire, avg, status, book: B, unpaid: dflt ? 1 - B.cashMax : 0 };
  }
  const RUN_PRESETS = { // TUNED, illustrative: the shape of each reserve, not any issuer's actual book
    hole: { liq: 0.25, hair: 0.005, loss: 0.08, buf: 0, jumpy: 0.1 },
    panic: { liq: 0.1, hair: 0.1, loss: 0, buf: 0.01, jumpy: 0.3 },
    genius: { liq: 0.25, hair: 0.002, loss: 0, buf: 0.01, jumpy: 0.3 },
    mixed: { liq: 0.1, hair: 0.15, loss: 0.02, buf: 0.03, jumpy: 0.2 }
  };

  /* ═════════ ch5: the algorithmic death spiral ═════════ */
  // U0: coin supply ($bn); cover: token market cap / coin supply; depth: the share of the token's market cap that,
  // sold at once, cuts its price by a factor e (market depth relative to size); cap: $bn of swaps a day; shock: share
  // of coins that want out at the start; reserve: $bn of outside assets spent buying the coin back on the market.
  // Hourly steps. Holders who want out queue (Q); the queue is served by swaps up to the cap and by the reserve; what
  // is left in the queue is offered on the market and sets the coin's price, 1 − Q/depthU.
  const SPIRAL = { U0: 18, P0: 80, days: 20, perDay: 24, beta: 0.3, gamma: 1, kappa: 0.2, depthU: 10, floor: 1e-4 }; // TUNED; at the floor ($0.0001) the chain is treated as halted
  function spiral(o) {
    const P = Object.assign({}, SPIRAL, o), dt = 1 / P.perDay;
    let U = P.U0, price = P.P0, S = P.cover * P.U0 / P.P0, p = 1, c = P.cover, res = P.reserve, Q = P.shock * P.U0;
    const S0 = S, hours = [{ t: 0, U, price, S, p, c }];
    let minP = 1, minC = c, halted = null;
    for (let k = 0; k < P.days * P.perDay; k++) {
      if (halted == null) {
        const slide = Math.max(0, 1 - c / P.cover);          // how far coverage has fallen from where it started
        const fear = P.beta * Math.max(0, 1 - p) + P.gamma * slide;  // share of the remaining coins that want out, per day
        Q = Math.min(U, Q + (U - Q) * Math.min(1, fear * dt));
        const r = Math.min(Q, P.cap * dt);                     // swapped: burn r coins, mint $r of token at the current price
        const Mbefore = price * S;
        S += r / price; U -= r; Q -= r;
        const defend = Math.min(res, Q); res -= defend; Q -= defend; U -= defend;  // bought back and retired
        const flee = P.kappa * slide * Mbefore * dt;             // token holders selling as coverage falls
        price = Math.max(P.floor, price * Math.exp(-(r + flee) / (P.depth * Mbefore)));
        p = Math.max(0.01, 1 - Q / P.depthU);
        c = U > 1e-9 ? price * S / U : Infinity;
        if (price <= P.floor) halted = (k + 1) * dt;
        minP = Math.min(minP, p); minC = Math.min(minC, c);
      }
      hours.push({ t: (k + 1) * dt, U, price, S, p, c });
    }
    const last = hours[hours.length - 1];
    return { hours, minP, minC, halted, priceRatio: last.price / P.P0, supplyX: last.S / S0, cover: last.c, U: last.U, burned: P.U0 - last.U, reserveLeft: res, lastP: last.p };
  }
  // small-swap direction of coverage with depth D = d·M: dc/c = (r/M)(1 + c − 1/d), so coverage falls iff c < 1/d − 1
  // (no panic selling). spiralThreshold(d) is that coverage.
  const spiralThreshold = d => 1 / d - 1;

  /* ═════════ ch6: issuer economics ═════════ */
  // r: short rate (decimal); U0 supply at r0 ($bn); eta: semi-elasticity of supply to the rate; delta: share of
  // reserve income paid out to distributors; cost: fixed costs ($bn/yr).
  const ISSUER = { U0: 100, r0: 0.04, cost: 0.6 }; // TUNED
  function issuer(o) {
    const P = Object.assign({}, ISSUER, o);
    const U = P.U0 * Math.exp(-P.eta * (o.r - P.r0));
    const income = U * o.r, dist = income * P.delta, profit = income - dist - P.cost;
    return { U, income, dist, profit, forgone: income };
  }
  function issuerCurve(o, rMax) {
    const pts = []; for (let i = 0; i <= 120; i++) { const r = rMax * i / 120; pts.push([r, issuer(Object.assign({}, o, { r })).profit]); } return pts;
  }
  function breakEven(o) { // smallest r ≥ 0 with profit ≥ 0, bisection on the increasing branch below 1/eta
    const f = r => issuer(Object.assign({}, o, { r })).profit, top = o.eta > 0 ? Math.min(0.2, 1 / o.eta) : 0.2;
    if (f(top) < 0) return null;
    let a = 0, b = top; if (f(0) >= 0) return 0;
    for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(m) >= 0) b = m; else a = m; }
    return b;
  }
  const bestRate = eta => (eta > 0 ? 1 / eta : Infinity);

  /* ═════════ ch7: a holding cap on a CBDC ═════════ */
  // household deposits log-normal with median `median`, log-sd `sd`; cap per person; take: share of households that
  // convert as much as allowed; liq: banks' liquid assets as a share of deposits.
  const CBDC = { median: 5000, sd: 1.4, liq: 0.2 }; // TUNED, illustrative household distribution
  function expMin(cap, median, sd) { // E[min(D, cap)] for ln D ~ N(ln median, sd²)
    if (cap <= 0) return 0;
    const mu = Math.log(median), k = Math.log(cap);
    return Math.exp(mu + sd * sd / 2) * cdf((k - mu - sd * sd) / sd) + cap * (1 - cdf((k - mu) / sd));
  }
  function cbdcCap(o) {
    const P = Object.assign({}, CBDC, o), mean = P.median * Math.exp(P.sd * P.sd / 2);
    const capped = P.cap >= 1e9 ? mean : expMin(P.cap, P.median, P.sd);
    const share = P.take * capped / mean;              // share of all deposits that moves
    const centralLiability = P.kind !== 'bank';
    const drain = centralLiability ? share : 0;        // reserves leave the banking system only if the CBDC is a central-bank liability
    return { mean, capped, share, drain, drainOfLiq: drain / P.liq, shortfall: Math.max(0, drain - P.liq) };
  }

  /* ═════════ frontier data (dated; sources in BRIEF.md) ═════════ */
  const FRONTIER = {
    total: 286.9, totalDate: '2026-11-12', usdt: 175.66, usdc: 69.88,          // DefiLlama via search snapshot
    peakA: 309.7, peakB: 315.5,                                                 // May 2026 peak, two reports
    tetherRes: 191.5, tetherUst: 132.4, tetherBills: 122.8, tetherLiab: 183.5, tetherProfitQ3: 1.5, tetherExcess: 7.95,
    circleRes: 658, circleAvg: 73.3, circleRate: 3.5,
    usdcLoss: 3.3, usdcLow: 0.87, usdcLowB: 0.88,
    ecnyAmt: 19.5, ecnyTx: 35.7, ecnyWallets: 2.3,
    imfVol: 30, imfXb: 6.1, bisPay: 390, bisTotal: 320,
    hkApplicants: 36
  };

  return { rng, gaussian, cdf, fmt, clamp, Z90, unitOfAccount, unitPath, PEG, pegSim, RUN, runBook, runModel, RUN_PRESETS, SPIRAL, spiral, spiralThreshold, ISSUER, issuer, issuerCurve, breakEven, bestRate, CBDC, expMin, cbdcCap, FRONTIER };
});
