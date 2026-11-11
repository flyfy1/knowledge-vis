/* Models for "Where does a mortgage payment go?". Pure functions, no DOM. Usable from the page
   (window.MortgageModels) and from node (require). Every number the essay states is produced by a function
   here and pinned in tests/models.cjs.

   Conventions (the same in every chapter, and stated on the page):
   - rates are nominal annual rates r compounded monthly; the monthly (periodic) rate is i = r / 12;
   - interest for a month = balance at the start of the month × i; payments fall at the end of each month;
   - no rounding to cents, no fees unless a chapter adds one, no day counts (real lenders may count days). */
(function (root, factory) {
  const M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M; else root.MortgageModels = M;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const EPS = 0.005; // a balance below half a cent counts as paid off

  /* ───────── ch1 · three names for one rate ─────────
     nominal annual rate r, m periods a year: periodic rate r/m, effective annual rate (1 + r/m)^m − 1. */
  const periodic = (r, m) => r / m;
  const effective = (r, m) => Math.pow(1 + r / m, m) - 1;
  // owed after a year with no payments, compounding m times (exact staircase points)
  function staircase(P, r, m) { const pts = []; for (let k = 0; k <= m; k++) pts.push([k / m, P * Math.pow(1 + r / m, k)]); return pts; }
  // nominal rate (m periods a year) that gives a stated effective rate
  const nominalFromEffective = (e, m) => m * (Math.pow(1 + e, 1 / m) - 1);

  /* ───────── ch2 · the level payment (annuity) ─────────
     M = P·i / (1 − (1 + i)^−n). Derivation used on the page: the balance after k fixed payments is
     B_k = P(1+i)^k − M((1+i)^k − 1)/i; setting B_n = 0 gives M. */
  function payment(P, i, n) { if (n <= 0) return P; if (Math.abs(i) < 1e-15) return P / n; return P * i / (1 - Math.pow(1 + i, -n)); }
  const balanceAfter = (P, i, M, k) => Math.abs(i) < 1e-15 ? P - M * k : P * Math.pow(1 + i, k) - M * (Math.pow(1 + i, k) - 1) / i;
  // raw month-by-month loop with a fixed payment and no clean-up: the independent check of the formula
  function simulateFixed(P, i, M, months) {
    let b = P; const path = [P];
    for (let m = 1; m <= months; m++) { b = b + b * i - M; path.push(b); }
    return { end: b, path };
  }
  // first month after which the balance is ≤ 0 with payment M (null if never within maxMonths)
  function payoffMonth(P, i, M, maxMonths = 1200) {
    let b = P;
    for (let m = 1; m <= maxMonths; m++) { b = b + b * i - M; if (b <= EPS) return m; }
    return null;
  }

  /* ───────── ch3, ch5, ch6 · the schedule ─────────
     amortise(P, r, n, opts) runs month by month.
       opts.extra = { k, X, mode }   after the k-th payment, X more goes to principal;
                                     mode 'term' keeps the payment (loan ends sooner),
                                     mode 'payment' keeps the end date (payment recomputed over n − k).
       opts.reset = { k, r1, mode }  from month k + 1 the annual rate is r1;
                                     mode 'repay' recomputes the payment over the remaining n − k months,
                                     mode 'keep' keeps the payment (the term moves; it can run forever).
     Rows: { m, open, rate, pay, int, prin, bal }. The final payment is trimmed to what is owed. */
  function amortise(P, r, n, opts = {}) {
    const maxMonths = opts.maxMonths || 1200;
    let rate = r, i = r / 12, M = payment(P, i, n), bal = P, m = 0, totInt = 0, totPay = 0;
    const rows = [];
    let neverEnds = false;
    while (bal > EPS && m < maxMonths) {
      m++;
      const open = bal, int = open * i;
      // in a fixed-term loan the last scheduled month clears whatever floating-point residue is left
      const endOfTerm = !(opts.reset && opts.reset.mode === 'keep') && m === n;
      let pay = endOfTerm ? open + int : Math.min(M, open + int);
      const prin = pay - int; bal = open - prin;
      totInt += int; totPay += pay;
      rows.push({ m, open, rate, pay, int, prin, bal });
      if (opts.extra && m === opts.extra.k && bal > EPS) {
        const X = Math.min(opts.extra.X, bal); bal -= X; totPay += X;
        rows[rows.length - 1].extra = X; rows[rows.length - 1].bal = bal;
        if (opts.extra.mode === 'payment' && bal > EPS) M = payment(bal, i, n - m);
      }
      if (opts.reset && m === opts.reset.k) {
        rate = opts.reset.r1; i = rate / 12;
        if (opts.reset.mode === 'repay') M = payment(bal, i, n - m);
      }
    }
    if (bal > EPS) neverEnds = true;
    return { rows, months: rows.length, totInt, totPay, neverEnds, endBal: bal, M0: payment(P, r / 12, n) };
  }
  // month in which the principal part of the payment first exceeds the interest part
  function crossover(rows) { const q = rows.find(x => x.prin > x.int); return q ? q.m : null; }
  // share of the money paid in the first k months that was interest
  function interestShare(rows, k) { let a = 0, b = 0; for (const q of rows) { if (q.m > k) break; a += q.int; b += q.pay; } return b ? a / b : 0; }
  // present value of the borrower's payments (and extra payments) at a monthly rate j
  function pvPayments(rows, j) { let s = 0; for (const q of rows) s += (q.pay + (q.extra || 0)) / Math.pow(1 + j, q.m); return s; }
  // value at the end of month k of the regular payments due after month k, at a monthly rate j
  function pvFrom(rows, k, j) { let s = 0; for (const q of rows) if (q.m > k) s += q.pay / Math.pow(1 + j, q.m - k); return s; }

  /* ───────── ch4 · equal principal (等额本金) ─────────
     principal P/n every month; interest on the balance; total interest = P·i·(n + 1)/2. */
  function equalPrincipal(P, r, n) {
    const i = r / 12, c = P / n, rows = [];
    let bal = P, totInt = 0, totPay = 0;
    for (let m = 1; m <= n; m++) { const open = bal, int = open * i, pay = c + int; bal = open - c; totInt += int; totPay += pay; rows.push({ m, open, rate: r, pay, int, prin: c, bal: Math.max(0, bal) }); }
    return { rows, months: n, totInt, totPay };
  }
  const equalPrincipalInterest = (P, r, n) => P * (r / 12) * (n + 1) / 2;
  // sum of the balances at the start of each month ("balance-months"): interest = i × this, for any schedule
  const balanceMonths = rows => rows.reduce((s, q) => s + q.open, 0);

  /* ───────── ch5 · one extra payment ───────── */
  function prepay(P, r, n, X, k, mode) {
    const base = amortise(P, r, n), alt = amortise(P, r, n, { extra: { k, X, mode } });
    const lastPay = alt.rows[alt.rows.length - 1];
    // the payment after the extra one (for mode 'payment' the new level payment)
    const after = alt.rows.find(q => q.m === k + 1);
    return { base, alt, saved: base.totInt - alt.totInt, monthsSooner: base.months - alt.months, newPay: after ? after.pay : 0, lastPay };
  }
  // interest saved by the same X at every possible month (for the curve in ch5)
  function savingCurve(P, r, n, X, mode, stepMonths = 12) {
    const base = amortise(P, r, n).totInt, pts = [];
    for (let k = stepMonths; k < n; k += stepMonths) pts.push([k, base - amortise(P, r, n, { extra: { k, X, mode } }).totInt]);
    return pts;
  }

  /* ───────── ch6 · the rate changes ───────── */
  function rateChange(P, r0, n, k, r1, mode) {
    const base = amortise(P, r0, n), alt = amortise(P, r0, n, { reset: { k, r1, mode } });
    const before = alt.rows.find(q => q.m === k), after = alt.rows.find(q => q.m === k + 1);
    const balK = before ? before.bal : P;
    return { base, alt, balK, payBefore: before ? before.pay : base.M0, payAfter: after ? after.pay : 0,
      intAfter: after ? after.int : balK * r1 / 12, extraInterest: alt.totInt - base.totInt, months: alt.months, neverEnds: alt.neverEnds };
  }
  // in 'keep' mode the balance can only fall if the old payment covers the new month's interest
  const keepCovers = (balK, r1, M) => balK * r1 / 12 < M;

  /* ───────── ch7 · the true annual cost: internal rate of return ─────────
     flows[t] is the borrower's net cash in period t (t = 0, 1, 2…; + received, − paid).
     The IRR j solves Σ flows[t] / (1 + j)^t = 0. Solved by bisection on a bracket (NPV is monotone for a
     loan: one inflow then outflows), so the answer does not depend on a starting guess. */
  function npv(j, flows) { let s = 0; for (let t = 0; t < flows.length; t++) s += flows[t] / Math.pow(1 + j, t); return s; }
  function irr(flows, lo = -0.9, hi = 1) {
    let flo = npv(lo, flows), fhi = npv(hi, flows);
    if (flo * fhi > 0) return NaN;
    for (let it = 0; it < 200; it++) {
      const mid = (lo + hi) / 2, fm = npv(mid, flows);
      if (fm === 0) return mid;
      if (fm * flo > 0) { lo = mid; flo = fm; } else { hi = mid; }
      if (hi - lo < 1e-15) break;
    }
    return (lo + hi) / 2;
  }
  // flat-fee instalment plan: borrow P, pay P/n + f·P every month for n months, an optional fee u·P up front
  function flatPlan(P, f, n, u = 0) {
    const pay = P / n + f * P, flows = [P - u * P];
    for (let t = 1; t <= n; t++) flows.push(-pay);
    const j = irr(flows);
    // what is actually owed after each payment: P(1 − t/n). Average over the n months it is used:
    const avgOwed = P * (n + 1) / (2 * n);
    const totalFee = f * P * n + u * P;
    return { pay, flows, j, quoted: 12 * f, apr: 12 * j, ear: Math.pow(1 + j, 12) - 1, ratio: (12 * j) / (12 * f || 1),
      avgOwed, totalFee, simpleAnnual: totalFee / (avgOwed * n / 12) };
  }
  // the cash flows of an amortising loan (borrower's view), with an up-front fee u·P and an optional payoff
  // of the whole balance after `keepMonths` months
  function loanFlows(P, r, n, u = 0, keepMonths = n) {
    const a = amortise(P, r, n), flows = [P - u * P];
    for (const q of a.rows) { if (q.m > keepMonths) break; flows.push(-(q.pay + (q.m === keepMonths && q.m < n ? q.bal : 0))); }
    return flows;
  }

  /* ───────── ch8 · inflation and the alternative ───────── */
  // value of each payment in money of month 0 when prices rise π a year
  const realValue = (amount, month, pi) => amount / Math.pow(1 + pi, month / 12);
  function realTotals(rows, pi) { let s = 0; for (const q of rows) s += realValue(q.pay + (q.extra || 0), q.m, pi); return s; }
  // Two uses of X at month k, compared at the original end date n (nominal money, no debt left in either):
  //   A: prepay X (mode 'term'); from the new end date, put the payments you no longer make into an
  //      account earning g a year (monthly g/12) until month n;
  //   B: put X into that account at month k and keep paying the loan as scheduled.
  function prepayOrInvest(P, r, n, X, k, g) {
    const base = amortise(P, r, n), alt = amortise(P, r, n, { extra: { k, X, mode: 'term' } }), gm = g / 12;
    let A = 0;
    for (let m = k + 1; m <= n; m++) {
      const pb = base.rows[m - 1] ? base.rows[m - 1].pay : 0, pa = alt.rows[m - 1] ? alt.rows[m - 1].pay : 0;
      A += (pb - pa) * Math.pow(1 + gm, n - m);
    }
    const B = X * Math.pow(1 + gm, n - k);
    return { A, B, diff: A - B, endMonth: alt.months };
  }
  // the real (inflation-adjusted) annual rate: Fisher relation on effective rates
  const realRate = (ear, pi) => (1 + ear) / (1 + pi) - 1;

  return { clamp, periodic, effective, staircase, nominalFromEffective, payment, balanceAfter, simulateFixed, payoffMonth,
    amortise, crossover, interestShare, pvPayments, pvFrom, equalPrincipal, equalPrincipalInterest, balanceMonths,
    prepay, savingCurve, rateChange, keepCovers, npv, irr, flatPlan, loanFlows, realValue, realTotals, prepayOrInvest, realRate };
});
