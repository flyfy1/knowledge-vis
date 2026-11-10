'use strict';
// Stocks & bonds lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A made-up corner bakery. Every square, bar, line and readout on the page is computed here;
// tests/core.cjs pins the claims. All numbers are invented teaching examples, not market data.
(function (root) {
  const SHARES = 100;        // the bakery is split into 100 equal shares
  const SHARE_PRICE = 100;   // price per share when it raised money (so 10 shares cost 1000)
  const PAYOUT = 0.5;        // step 0: half of each year's profit is paid out as dividends
  const FACE = 1000;         // one bond: lend 1000
  const DEBT = 5000;         // the bakery borrowed 5000 in bonds (five bonds of 1000)
  const COUPON = 0.08;       // ... at 8 % a year, so it owes 400 of interest every year
  const CASH = 1000;         // cash in the till that can cover interest in a bad year
  const MY_SHARES = 10;      // steps 2–3: you hold 10 shares (10 %) ...
  const MY_BONDS = 1;        // ... or one 1000 bond (a fifth of the debt)

  // ---- step 0: owning shares ----
  function owner(k, profit) {
    const frac = k / SHARES, div = profit > 0 ? profit * PAYOUT : 0;
    return { frac, votes: k, dividends: div, kept: profit > 0 ? profit - div : profit, mine: frac * div, cost: k * SHARE_PRICE };
  }

  // ---- step 1: a bond's cash flows ----
  function bondFlows(c, T, face = FACE) {
    const out = [];
    for (let y = 1; y <= T; y++) out.push({ year: y, coupon: face * c, principal: y === T ? face : 0 });
    return { flows: out, total: face * c * T + face, interest: face * c * T };
  }

  // ---- step 2: who gets what in a good or bad year ----
  // profit = operating profit before interest. Interest is paid first (from profit, then from the till);
  // whatever is left, positive or negative, belongs to the shareholders.
  const INTEREST = DEBT * COUPON;
  function year(profit) {
    const paid = Math.min(INTEREST, Math.max(0, profit + CASH)); // what bondholders actually receive
    const toOwners = profit - paid;                                // residual: shareholders' gain or loss
    return { paid, toOwners, myBond: paid * MY_BONDS * FACE / DEBT, myStock: toOwners * MY_SHARES / SHARES };
  }
  // Profit at which your 10 shares earn as much as your bond.
  const breakEven = () => INTEREST * MY_BONDS * FACE / DEBT * SHARES / MY_SHARES + INTEREST;
  // An invented run of eight years (no year so bad that interest cannot be paid).
  const RUN = [1500, 2600, -500, 3800, 900, 4200, -300, 2600];

  // ---- step 3: winding up ----
  // Everything is sold for V. Lenders are paid first, up to what they are owed; owners get what is left.
  function windUp(V) {
    const toLenders = Math.min(DEBT, Math.max(0, V)), toOwners = Math.max(0, V - DEBT);
    return { toLenders, toOwners, myBond: toLenders * MY_BONDS * FACE / DEBT, myStock: toOwners * MY_SHARES / SHARES };
  }

  // ---- step 4: price from buyers and sellers ----
  // Ten people want to buy one share each (the most they would pay) and ten want to sell (the least they would take).
  const BUY = [128, 122, 116, 111, 106, 101, 97, 92, 86, 80];
  const SELL = [78, 84, 89, 94, 99, 104, 109, 115, 121, 127];
  // mood shifts every buyer's limit by the same amount (good or bad news about the bakery).
  function market(mood) {
    const b = BUY.map(v => v + mood).sort((x, y) => y - x), s = SELL.slice().sort((x, y) => x - y);
    let q = 0; while (q < b.length && b[q] >= s[q]) q++;
    // Any price between the last matched pair and the first unmatched pair clears; take the middle of that range.
    let lo, hi;
    if (q === 0) { lo = b[0]; hi = s[0]; }
    else { lo = Math.max(s[q - 1], q < b.length ? b[q] : -Infinity); hi = Math.min(b[q - 1], q < s.length ? s[q] : Infinity); }
    return { buy: b, sell: s, trades: q, price: (lo + hi) / 2, lo, hi };
  }

  const api = { SHARES, SHARE_PRICE, PAYOUT, FACE, DEBT, COUPON, CASH, MY_SHARES, MY_BONDS, INTEREST, owner, bondFlows, year, breakEven, RUN, windUp, BUY, SELL, market };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SB_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
