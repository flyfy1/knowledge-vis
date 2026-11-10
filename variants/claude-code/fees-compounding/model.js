'use strict';
// Fees & compounding lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, bar and readout on the page is computed here; tests/core.cjs pins the claims.
// All numbers are invented teaching examples: no real fund, product or fee schedule is modelled.
// Fee convention: each year the money first grows by the gross return r, then a fee f is taken
// from the balance:  A_t = A_{t−1}·(1 + r)·(1 − f).
(function (root) {
  const BASE = { P: 20000, r: 0.06, f: 0.01, T: 30 };
  const value = (P, r, f, t) => P * Math.pow((1 + r) * (1 - f), t);
  // Share of the no-fee final value you keep: (1 − f)^T — the gross return r cancels out.
  const kept = (f, T) => Math.pow(1 - f, T);
  // Year-by-year ledger: fee paid each year, cumulative fees, gap to the no-fee account.
  function ledger(P, r, f, T) {
    const rows = []; let a = P, cum = 0;
    for (let t = 1; t <= T; t++) {
      const before = a * (1 + r), fee = before * f; a = before - fee; cum += fee;
      const gap = value(P, r, 0, t) - a;
      rows.push({ t, fee, cum, bal: a, gap, lostGrowth: gap - cum });
    }
    return rows;
  }
  // Share of the *gain* that the fee takes (depends on r, unlike the share of final value).
  function gainShareLost(P, r, f, T) { const a0 = value(P, r, 0, T), af = value(P, r, f, T); return (a0 - af) / (a0 - P); }
  // A one-time entry charge L spread over T years, as an equivalent yearly fee.
  const loadAsAnnual = (L, T) => 1 - Math.pow(1 - L, 1 / T);
  // Years after which a one-time charge L costs less than a yearly fee f (first whole year).
  function breakEvenYears(L, f) { if (f <= 0) return Infinity; for (let T = 1; T <= 1000; T++) if (loadAsAnnual(L, T) <= f + 1e-15) return T; return Infinity; }
  // How much higher a gross return must be, every year, for a fund charging f2 to match one charging f1.
  const extraNeeded = (r, f1, f2) => (1 + r) * (1 - f1) / (1 - f2) - 1 - r;
  const api = { BASE, value, kept, ledger, gainShareLost, loadAsAnnual, breakEvenYears, extraNeeded };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
