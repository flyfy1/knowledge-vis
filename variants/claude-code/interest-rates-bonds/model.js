'use strict';
// Interest rates & bonds lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: a fictional plain bond with face value 100, one coupon per year paid at each
// anniversary, principal repaid with the last coupon, no default. One market rate r is used to
// discount every year (flat curve, annual compounding). Prices are quoted right after a coupon
// date, so there is no accrued interest. Rates are decimals (0.04 = 4%).
(function (root) {
  const FACE = 100;

  // The bond's promised cash: year t gets c·F, and the last year also gets F back.
  function cashflows(c, n, F = FACE) {
    const out = [];
    for (let t = 1; t <= n; t++) out.push({ t, coupon: c * F, principal: t === n ? F : 0, amount: c * F + (t === n ? F : 0) });
    return out;
  }
  const totalCash = (c, n, F = FACE) => n * c * F + F;

  // Discount factor: what 1 received t years from now is worth today at rate r.
  const df = (r, t) => Math.pow(1 + r, -t);
  const pv = (fv, r, t) => fv * df(r, t);
  // Forward check: grow an amount for t years at r.
  const grow = (x, r, t) => x * Math.pow(1 + r, t);

  // Each promised payment with its present value.
  function pvFlows(c, n, r, F = FACE) {
    return cashflows(c, n, F).map(q => ({ ...q, pv: pv(q.amount, r, q.t) }));
  }
  function price(c, n, r, F = FACE) {
    let s = 0;
    for (let t = 1; t <= n; t++) s += (c * F + (t === n ? F : 0)) * df(r, t);
    return s;
  }

  // Yield to maturity: the single rate that discounts the promised cash back to exactly the price paid.
  // price() falls strictly as r rises (all cash flows positive), so bisection is safe.
  function ytm(c, n, P, F = FACE) {
    let lo = -0.5, hi = 2;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (price(c, n, mid, F) > P) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  // Step 3: "the market" looks for the price at which an old bond yields exactly the new rate.
  // Each round halves the price interval [lo, hi]: if a trial price gives the buyer more than the
  // new rate, buyers rush in and the price is pushed up; if it gives less, nobody buys and it is cut.
  function marketSearch(c, n, rNew, lo, hi, rounds, F = FACE) {
    const trace = [];
    for (let i = 0; i < rounds; i++) {
      const mid = (lo + hi) / 2, y = ytm(c, n, mid, F);
      trace.push({ price: mid, y, lo, hi, move: y > rNew ? 'up' : 'down' });
      if (y > rNew) lo = mid; else hi = mid;
    }
    return trace;
  }

  // Step 3: the discount equals the present value of the coupons the old bond is short of.
  function shortfall(c, n, rNew, F = FACE) {
    const rows = [];
    for (let t = 1; t <= n; t++) { const gap = (rNew - c) * F; rows.push({ t, gap, pv: pv(gap, rNew, t) }); }
    return { rows, total: rows.reduce((s, q) => s + q.pv, 0) };
  }

  // Price change in percent when the market rate moves from r0 to r1.
  const pctChange = (c, n, r0, r1, F = FACE) => (price(c, n, r1, F) / price(c, n, r0, F) - 1) * 100;

  // Step 5: the balance point. Each payment's present value is a weight placed at its year;
  // D is where the timeline balances (Macaulay duration), in years.
  function duration(c, n, r, F = FACE) {
    let w = 0, s = 0;
    for (let t = 1; t <= n; t++) { const v = (c * F + (t === n ? F : 0)) * df(r, t); w += t * v; s += v; }
    return w / s;
  }
  // Straight-line estimate of the percent price change for a rate move dr (in decimal):
  // −D/(1 + r) × dr × 100. It is the tangent of the price curve, so it ignores the curve's bend.
  const approxPct = (c, n, r, dr, F = FACE) => -duration(c, n, r, F) / (1 + r) * dr * 100;

  const M = { FACE, cashflows, totalCash, df, pv, grow, pvFlows, price, ytm, marketSearch, shortfall, pctChange, duration, approxPct,
    // fixed scenarios used on the page
    OLD: { c: 0.04, n: 10, r0: 0.04 },          // step 3: a 10-year 4% bond bought at 100, then rates move
    MATS: [2, 10, 30], CMP: { c: 0.04, r0: 0.04 }, // step 4: three maturities, same 4% coupon, all at 100 to start
    R5: 0.04,                                    // step 5: market rate held at 4%
    SEARCH: { lo: 60, hi: 135, rounds: 12 } };
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  root.BOND_MODEL = M;
})(typeof window !== 'undefined' ? window : globalThis);
