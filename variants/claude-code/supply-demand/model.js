'use strict';
// Supply & demand model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A made-up, linear market for one city's takeaway coffee:
//   demand  Qd(P) = a − b·P,   supply  Qs(P) = c + d·P   (P in yuan per cup, Q in hundreds of cups per day)
// Every curve, crossing, wedge, area and readout on the page is computed here; tests/core.cjs pins the claims.
// Not a forecast of a real market: fixed outside conditions, price-taking buyers and sellers, no time lags.
(function (root) {
  const BASE = { a: 100, b: 4, c: -20, d: 6 };
  const AX = { qMax: 110, pMax: 28 };

  // Quantities can't go below zero: below the supply "shut-down" price nobody sells.
  const qd = (m, P) => Math.max(0, m.a - m.b * P);
  const qs = (m, P) => Math.max(0, m.c + m.d * P);
  const pDemandAt = (m, Q) => (m.a - Q) / m.b;   // demand read as a price: what the Q-th cup is worth to buyers
  const pSupplyAt = (m, Q) => (Q - m.c) / m.d;   // supply read as a price: the cost of the Q-th cup
  const choke = m => m.a / m.b;                  // price where buyers stop buying
  const floorP = m => Math.max(0, -m.c / m.d);   // price below which sellers stop selling

  function equilibrium(m) {
    const P = (m.a - m.c) / (m.b + m.d);
    return { P, Q: m.a - m.b * P };
  }
  // Excess demand at a price (positive = shortage, negative = surplus).
  const gap = (m, P) => qd(m, P) - qs(m, P);

  // Step 1: a simple price-adjustment rule — each round the price moves by k for every 100 cups of shortage.
  // This is a teaching rule, not a claim about how real prices move.
  function adjustPath(m, P0, k, rounds) {
    const path = [P0];
    for (let i = 0; i < rounds; i++) {
      const P = path[path.length - 1], next = P + k * gap(m, P);
      path.push(next);
      if (next < 0 || next > AX.pMax) break; // left the chart: the rule stops making sense
    }
    return path;
  }
  // While both quantities are positive the gap to P* shrinks by the same factor every round.
  const adjustFactor = (m, k) => 1 - k * (m.b + m.d);

  // Step 2: shifts. dA moves demand right by dA at every price; dC moves supply right by dC.
  const shifted = (m, dA, dC) => ({ a: m.a + dA, b: m.b, c: m.c + dC, d: m.d });

  // Steps 3–4: demand of slope b that passes through the base equilibrium, so only steepness changes.
  function pivotDemand(m, b) {
    const e = equilibrium(m);
    return { a: e.Q + b * e.P, b, c: m.c, d: m.d };
  }
  // Point elasticities at a point (P, Q): % change in quantity per 1% change in price.
  const elasticityD = (m, P, Q) => -m.b * P / Q;
  const elasticityS = (m, P, Q) => m.d * P / Q;

  // Steps 4–5: per-unit tax t (t < 0 is a per-unit subsidy of −t). Buyers pay Pb, sellers keep Ps = Pb − t.
  function policy(m, t) {
    const Pb = (m.a - m.c + m.d * t) / (m.b + m.d), Ps = Pb - t, Q = m.a - m.b * Pb;
    return { t, Pb, Ps, Q };
  }
  // Share of a small tax paid by buyers: d / (b + d) = εs / (εs + |εd|) at the original crossing.
  const buyerShare = m => m.d / (m.b + m.d);

  // Surplus accounting (in yuan × hundreds of cups = hundreds of yuan per day). Valid for c ≤ 0 (supply
  // starts at a positive price), which holds for every market the surplus step uses.
  function surplus(m, t) {
    const e = equilibrium(m), r = t === 0 ? { Pb: e.P, Ps: e.P, Q: e.Q } : policy(m, t);
    const CS = 0.5 * r.Q * (choke(m) - r.Pb);
    const PS = 0.5 * r.Q * (r.Ps - floorP(m));
    const gov = t * r.Q;                                   // revenue if t > 0, cost (negative) if subsidy
    const W = CS + PS + gov;
    const W0 = 0.5 * e.Q * (choke(m) - floorP(m));
    return { ...r, CS, PS, gov, W, W0, DWL: W0 - W };
  }
  // Closed form of the loss: ½ · t² · b·d/(b + d), the same for a tax and a subsidy of the same size.
  const dwlFormula = (m, t) => 0.5 * t * t * m.b * m.d / (m.b + m.d);

  // Numerical check of the areas (used by tests): integrate value − cost over the traded quantity.
  function surplusNumeric(m, t, n = 4000) {
    const r = t === 0 ? { ...equilibrium(m), Pb: equilibrium(m).P, Ps: equilibrium(m).P } : policy(m, t);
    let CS = 0, PS = 0; const h = r.Q / n;
    for (let i = 0; i < n; i++) { const q = (i + 0.5) * h; CS += (pDemandAt(m, q) - r.Pb) * h; PS += (r.Ps - Math.max(floorP(m), pSupplyAt(m, q))) * h; }
    return { CS, PS };
  }

  const api = { BASE, AX, qd, qs, pDemandAt, pSupplyAt, choke, floorP, equilibrium, gap, adjustPath, adjustFactor, shifted, pivotDemand, elasticityD, elasticityS, policy, buyerShare, surplus, dwlFormula, surplusNumeric };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SD_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
