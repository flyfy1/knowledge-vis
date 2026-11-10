'use strict';
// Compound-interest lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every bar, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: rates are decimals per year (0.07 = 7 %), time in years, a fixed rate with no tax, fees or inflation.
(function (root) {
  const P0 = 1000; // step 0 deposit

  // ---- step 0: interest on interest ----
  const simple = (P, r, n) => P * (1 + r * n);
  const compound = (P, r, n) => P * Math.pow(1 + r, n);
  // Split the compound balance after n years into principal, interest earned on the principal only, and interest on interest.
  function split(P, r, n) {
    const total = compound(P, r, n), onPrincipal = P * r * n;
    return { total, principal: P, onPrincipal, onInterest: total - P - onPrincipal, simple: simple(P, r, n) };
  }

  // ---- step 1: doubling time and the rule of 72 ----
  const doubling = r => Math.log(2) / Math.log(1 + r);
  const rule72 = r => 72 / (100 * r);
  const rule72Err = r => rule72(r) / doubling(r) - 1; // > 0: the rule overestimates the wait
  // Rates (on a 0.05 % grid) where the rule of 72 is within ±tol of the exact doubling time.
  function rule72Band(tol, lo = 0.005, hi = 0.30, step = 0.0005) {
    let a = null, b = null;
    for (let r = lo; r <= hi + 1e-12; r += step) { const rr = +r.toFixed(6); if (Math.abs(rule72Err(rr)) <= tol) { if (a === null) a = rr; b = rr; } }
    return { lo: a, hi: b };
  }

  // ---- step 2: compounding frequency ----
  // Growth factor over one year when the nominal annual rate r is credited m times (m = Infinity: continuous).
  const factor = (r, m, t = 1) => (m === Infinity ? Math.exp(r * t) : Math.pow(1 + r / m, m * t));
  // Balance over the first year: steps at each crediting date (continuous: smooth).
  const within = (r, m, t) => (m === Infinity ? Math.exp(r * t) : Math.pow(1 + r / m, Math.floor(m * t + 1e-9)));
  const ear = (r, m) => factor(r, m) - 1; // effective annual rate
  const FREQS = [1, 2, 4, 12, 52, 365, Infinity];

  // ---- step 3: discounting ----
  const pv = (F, r, t) => F / Math.pow(1 + r, t);
  const dfac = (r, t) => Math.pow(1 + r, -t);
  // Percentage fall in present value when the rate rises by dr.
  const pvDrop = (r, t, dr) => 1 - dfac(r + dr, t) / dfac(r, t);

  // ---- step 4: three offers ----
  // Each offer is a list of [year, amount]; the present value is the sum of discounted amounts.
  const OFFERS = {
    now: [[0, 10000]],
    stream: Array.from({ length: 15 }, (_, k) => [k + 1, 1000]),
    later: [[20, 25000]]
  };
  const OFFER_IDS = ['now', 'stream', 'later'];
  const pvFlows = (flows, r) => flows.reduce((s, [t, c]) => s + pv(c, r, t), 0);
  // Annuity: C at the end of each of n years. Closed form of the geometric sum.
  const annuityPV = (C, r, n) => (r === 0 ? C * n : C * (1 - Math.pow(1 + r, -n)) / r);
  function bestOffer(r) { return OFFER_IDS.map(id => ({ id, pv: pvFlows(OFFERS[id], r) })).sort((a, b) => b.pv - a.pv)[0].id; }
  // Rate at which two offers are worth the same today (bisection on [lo, hi]).
  function crossRate(i, j, lo = 0, hi = 0.2) {
    const d = r => pvFlows(OFFERS[i], r) - pvFlows(OFFERS[j], r);
    let a = lo, b = hi, da = d(a);
    if (da * d(b) > 0) return null;
    for (let k = 0; k < 80; k++) { const m = (a + b) / 2, dm = d(m); if (da * dm <= 0) b = m; else { a = m; da = dm; } }
    return (a + b) / 2;
  }
  // Where the winner changes along r ∈ [lo, hi].
  function offerSwitches(lo = 0, hi = 0.12) {
    const out = []; let prev = bestOffer(lo);
    for (let i = 1; i <= 1200; i++) {
      const r = lo + (hi - lo) * i / 1200, w = bestOffer(r);
      if (w !== prev) { out.push({ from: prev, to: w, at: crossRate(prev, w, lo + (hi - lo) * (i - 1) / 1200, r) }); prev = w; }
    }
    return out;
  }

  // ---- step 5: a loan with equal monthly payments ----
  function payment(L, r, years) { const i = r / 12, n = years * 12; return i === 0 ? L / n : L * i / (1 - Math.pow(1 + i, -n)); }
  // Month-by-month schedule, aggregated per year.
  function schedule(L, r, years) {
    const i = r / 12, n = years * 12, M = payment(L, r, years);
    let bal = L; const months = [], yearsOut = [];
    for (let k = 1; k <= n; k++) {
      const interest = bal * i, princ = M - interest; bal -= princ;
      months.push({ k, interest, princ, bal: Math.abs(bal) < 1e-6 ? 0 : bal });
    }
    for (let y = 0; y < years; y++) {
      const ms = months.slice(12 * y, 12 * y + 12);
      yearsOut.push({ year: y + 1, interest: ms.reduce((s, m) => s + m.interest, 0), princ: ms.reduce((s, m) => s + m.princ, 0), bal: ms[ms.length - 1].bal });
    }
    const totalInterest = M * n - L;
    const half = months[n / 2 - 1].bal;
    const cross = months.find(m => m.princ > m.interest); // first month where more goes to principal than to interest
    return { M, months, years: yearsOut, totalInterest, halfBal: half, crossMonth: cross ? cross.k : null };
  }

  const api = { P0, simple, compound, split, doubling, rule72, rule72Err, rule72Band, factor, within, ear, FREQS, pv, dfac, pvDrop, OFFERS, OFFER_IDS, pvFlows, annuityPV, bestOffer, crossRate, offerSwitches, payment, schedule };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CI_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
