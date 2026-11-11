/* Models for "Where money comes from". Pure functions, no DOM. Usable from the page (window.MoneyModels)
   and from node (require). Every number the essay states is reproduced by a function here and pinned in
   tests/models.cjs. */
(function (root, factory) {
  const M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M; else root.MoneyModels = M;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // mulberry32: small seeded generator, so every run of a simulation is repeatable
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── ch1 · barter versus IOUs (random matching) ─────────
     P people, N kinds of goods; person i makes kind i mod N and wants one other kind (seeded).
     Every round everyone is paired at random. Three economies share the same people, pairings and coin flips:
       barter   — a trade needs each to want what the other makes, and both still to be looking;
       personal — a buyer pays with his own IOU, which the seller accepts with probability q (trust);
       bank     — the buyer pays with a bank's IOU, which every seller accepts (q = 1).
     A person who has got what they want counts as done. */
  const TRADE_P = 48, TRADE_ROUNDS = 60;
  function tradeInit(N, seed = 7) {
    const P = TRADE_P, R = rng(seed * 1009 + N * 31);
    const type = Array.from({ length: P }, (_, i) => i % N);
    const want = type.map(t => { let w = Math.floor(R() * (N - 1)); if (w >= t) w++; return w; });
    return { N, P, type, want, round: 0, R: rng(seed * 7919 + N), done: { barter: new Uint8Array(P), personal: new Uint8Array(P), bank: new Uint8Array(P) },
      hist: { barter: [0], personal: [0], bank: [0] }, last: [] };
  }
  function tradeRound(s, q) {
    const { P, type, want, R, done } = s, idx = Array.from({ length: P }, (_, i) => i);
    for (let i = P - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    const last = [];
    for (let k = 0; k + 1 < P; k += 2) {
      const a = idx[k], b = idx[k + 1], ua = R(), ub = R();
      const d = done.barter;
      if (!d[a] && !d[b] && want[a] === type[b] && want[b] === type[a]) { d[a] = d[b] = 1; last.push(['barter', a, b]); }
      for (const [mode, qq] of [['personal', q], ['bank', 1]]) {
        const dm = done[mode];
        if (!dm[a] && want[a] === type[b] && ua < qq) { dm[a] = 1; last.push([mode, a, b]); }
        if (!dm[b] && want[b] === type[a] && ub < qq) { dm[b] = 1; last.push([mode, b, a]); }
      }
    }
    s.round++; s.last = last;
    for (const m of ['barter', 'personal', 'bank']) s.hist[m].push(done[m].reduce((x, y) => x + y, 0) / P);
    return s;
  }
  function tradeRun(N, q, rounds = TRADE_ROUNDS, seed = 7) { const s = tradeInit(N, seed); for (let r = 0; r < rounds; r++) tradeRound(s, q); return s; }
  // Exact expectation for an IOU economy: each round a buyer meets a seller of the kind he wants with
  // probability (sellers of that kind)/(P−1), and is accepted with probability q.
  function tradeExpectedRounds(N, q) {
    const s = tradeInit(N); let sum = 0;
    for (let i = 0; i < s.P; i++) { const c = s.type.filter(t => t === s.want[i]).length; sum += (s.P - 1) / (c * q); }
    return sum / s.P;
  }
  // Barter needs a double coincidence: at the start, a random partner makes what you want AND wants what you make.
  function tradeBarterChance(N) {
    const s = tradeInit(N); let sum = 0;
    for (let i = 0; i < s.P; i++) { let c = 0; for (let j = 0; j < s.P; j++) if (j !== i && s.type[j] === s.want[i] && s.want[j] === s.type[i]) c++; sum += c / (s.P - 1); }
    return sum / s.P;
  }
  function tradeStuck(N) { // people for whom no double coincidence exists at all: barter can never serve them
    const s = tradeInit(N); let n = 0;
    for (let i = 0; i < s.P; i++) { let ok = false; for (let j = 0; j < s.P; j++) if (j !== i && s.type[j] === s.want[i] && s.want[j] === s.type[i]) ok = true; if (!ok) n++; }
    return n;
  }

  /* ───────── ch2 · a bank loan creates a deposit ─────────
     The whole banking system as one balance sheet. Assets: reserves R (deposits at the central bank) and loans L.
     Liabilities: deposits D (the money people hold), central-bank borrowing B, equity E.
     A loan adds the same amount to L and D. Two limits:
       capital  — E / L must stay ≥ k (all loans risk-weight 100% here);
       reserves — R must stay ≥ rr × D.
     mode 'textbook': the central bank fixes the quantity of reserves, so a reserve shortfall blocks the loan.
     mode 'today': the central bank supplies reserves on demand at its policy rate, so the bank borrows the
     shortfall (B) and only capital (and willing, creditworthy borrowers, not modelled) limit lending. */
  const LOAN = 10;
  function bankInit() { return { R: 10, L: 90, D: 90, E: 10, B: 0, hist: [80, 90], lastLoan: true, stop: null }; }
  function bankCheck(s, p, amt = LOAN) {
    if (s.E / (s.L + amt) < p.k - 1e-9) return { ok: false, reason: 'capital' };
    const need = p.rr * (s.D + amt);
    if (s.R < need - 1e-9) { if (p.mode === 'textbook') return { ok: false, reason: 'reserves' }; return { ok: true, borrow: need - s.R }; }
    return { ok: true, borrow: 0 };
  }
  function bankLoan(s, p) {
    const c = bankCheck(s, p); if (!c.ok) { s.stop = c.reason; return c; }
    s.L += LOAN; s.D += LOAN; if (c.borrow > 0) { s.R += c.borrow; s.B += c.borrow; }
    s.hist.push(s.D); s.lastLoan = true; s.stop = null; return c;
  }
  function bankRepay(s, p) {
    if (s.L < LOAN - 1e-9 || s.D < LOAN - 1e-9) return false;
    s.L -= LOAN; s.D -= LOAN; s.lastLoan = false; s.stop = null;
    if (s.B > 0) { const pay = Math.min(s.B, Math.max(0, s.R - p.rr * s.D)); s.R -= pay; s.B -= pay; }
    s.hist.push(s.D); return true;
  }
  function bankQE(s) { s.R += LOAN; s.D += LOAN; s.lastLoan = false; s.stop = null; s.hist.push(s.D); }
  function bankLendToLimit(s, p, max = 200) { let n = 0; while (n < max && bankLoan(s, p).ok) n++; return n; }
  // What the textbook money multiplier predicts: deposits can reach R / rr.
  const textbookMaxDeposits = (s, rr) => rr > 0 ? s.R / rr : Infinity;
  const capitalMaxLoans = (s, k) => s.E / k;

  /* ───────── ch3 · a bank run (Diamond–Dybvig style) ─────────
     100 depositors, 1 each. The bank keeps a share lam in cash and lends the rest long: a loan pays R = 1.5
     at the end but sold early fetches only s per unit. 20 depositors (pi) genuinely need cash now; the other
     80 can wait. Depositors are paid 1 each, first come first served.
     V(f): what each depositor who waits gets at the end when a share f has withdrawn early.
     A patient depositor j has a personal pessimism e_j spread evenly on (0, eta); he withdraws when the share
     already withdrawn plus his pessimism passes the point f* where V(f*) = 1 (waiting stops paying).
     A rumour makes the most pessimistic share rho of patient depositors withdraw at once. */
  const RUN = { N: 100, pi: 0.2, R: 1.5, eta: 0.15 };
  function runCapacity(lam, s) { return lam + (1 - lam) * s; } // cash the bank can raise today, per unit deposit
  function runV(f, p) {
    const { lam, s } = p, R = p.R || RUN.R;
    if (f >= 1) return 0;
    if (f <= lam) return ((lam - f) + (1 - lam) * R) / (1 - f);
    const sold = (f - lam) / s;
    if (sold >= 1 - lam) return 0;
    return (1 - lam - sold) * R / (1 - f);
  }
  function runThreshold(p) { const { lam, s } = p, R = p.R || RUN.R; return clamp((R * (1 - lam) + R * lam / s - 1) / (R / s - 1), 0, 1); }
  function runSim(p) {
    const N = RUN.N, nImp = Math.round(RUN.pi * N), nPat = N - nImp, fs = runThreshold(p);
    const e = Array.from({ length: nPat }, (_, j) => RUN.eta * (j + 0.5) / nPat); // ascending pessimism
    const nRumour = Math.round(p.rho * nPat);
    const out = new Uint8Array(nPat); // 0 stays, 1 rumour, 2 cascade
    for (let j = nPat - nRumour; j < nPat; j++) out[j] = 1;
    let w = nImp + nRumour; const rounds = [w / N];
    while (!p.insured) {
      const f = w / N; let add = 0;
      for (let j = 0; j < nPat; j++) if (!out[j] && f + e[j] > fs) { out[j] = 2; add++; }
      if (!add) break; w += add; rounds.push(w / N);
    }
    const f = w / N, cap = runCapacity(p.lam, p.s), paid = Math.min(w, Math.floor(cap * N + 1e-9));
    const failed = w > cap * N + 1e-9 || runV(f, p) <= 0;
    const V = failed ? 0 : runV(f, p);
    const unpaid = w - paid; // early withdrawers who reached the counter after the cash ran out
    let insurerCost = 0;
    if (p.insured) insurerCost = unpaid + (N - w) * Math.max(0, 1 - V);
    const cascade = out.reduce((a, x) => a + (x === 2 ? 1 : 0), 0);
    return { threshold: fs, rounds, f, withdrawn: w, rumour: nRumour, cascade, impatient: nImp, failed, V, paid, unpaid, insurerCost, out, nPat };
  }
  // smallest rumour (share of patient depositors) that sets off a full run, found by scanning whole people
  function runCriticalRumour(p) {
    const nPat = RUN.N - Math.round(RUN.pi * RUN.N);
    for (let n = 0; n <= nPat; n++) { const r = runSim({ ...p, rho: n / nPat, insured: false }); if (r.cascade > 0 && r.withdrawn === RUN.N) return n / nPat; }
    return null;
  }

  /* ───────── ch4 · the quantity machine ─────────
     Yearly, in logs. Money m, velocity v, potential output ys (grows 2%/yr), price level p.
     Spending n = m + v. Prices are sticky: each year they rise by last year's inflation (what firms expect)
     plus a share theta of the remaining gap to the level that spending would support (n − ys).
     Output is whatever spending buys: y = n − p. In the long run inflation = money growth + velocity growth
     − output growth; the path there is the point of the model. A supply shock is a one-off 8% jump in costs
     that firms pass straight into prices (an energy shock, say); money is unchanged. */
  const QTM = { theta: 0.35, gy: 0.02, start: 0.02, hist: 6, shock: 0.08 }; // shock: a one-off 8% rise in costs
  const L1 = x => Math.log(1 + x);
  function qtmInit() {
    // six years of history at 2% money growth: inflation and expectations both sit at (1.02 / 1.02) − 1 = 0
    const st = { t: -QTM.hist, m: 0, v: 0, ys: 0, p: 0, piPrev: L1(QTM.start) - L1(QTM.gy), rows: [] };
    for (let i = 0; i < QTM.hist; i++) qtmStep(st, { gM: QTM.start, gV: 0 });
    return st;
  }
  function qtmStep(st, u) {
    st.m += L1(u.gM); st.v += L1(u.gV || 0); st.ys += L1(QTM.gy);
    const n = st.m + st.v, pe = st.piPrev;
    const p = st.p + pe + QTM.theta * (n - st.ys - st.p - pe) + (u.shock ? Math.log(1 + QTM.shock) : 0);
    const pi = p - st.p; st.p = p; st.piPrev = pi; st.t++;
    const row = { t: st.t, gM: u.gM, gV: u.gV || 0, infl: Math.exp(pi) - 1, gap: Math.exp(n - p - st.ys) - 1, P: Math.exp(p), shock: !!u.shock };
    st.rows.push(row); return row;
  }
  function qtmPath(u, years = 30) { // u: {gM, gV} from year 1 on; optional shockYear
    const st = qtmInit(), P0 = st.rows[st.rows.length - 1].P;
    for (let y = 1; y <= years; y++) qtmStep(st, { gM: u.gM, gV: u.gV, shock: u.shockYear === y });
    st.rows.forEach(r => { r.Prel = r.P / P0; });
    return st.rows.filter(r => r.t >= 1);
  }
  const qtmLongRun = (gM, gV) => (1 + gM) * (1 + gV) / (1 + QTM.gy) - 1;

  /* ───────── ch5 · who wins and who loses ─────────
     Contracts are signed at year 0 when everyone expects inflation e. A saver lends 100 to a borrower at a
     fixed nominal rate i = (1 + 2%)(1 + e) − 1, both of them aiming at a 2% real return. Prices then rise at a
     for years 1–4 and at e afterwards. A worker's pay rises each year by the inflation of `lag` years earlier
     (before year 1 that is e). Everything is measured in year-0 money. */
  const WIN = { r: 0.02, burst: 4, years: 10 };
  function winPath({ a, e, lag }) {
    const i = (1 + WIN.r) * (1 + e) - 1, infl = t => (t >= 1 && t <= WIN.burst ? a : e);
    let P = 1, W = 1; const rows = [{ t: 0, P, saver: 100, plan: 100, wage: 1 }];
    for (let t = 1; t <= WIN.years; t++) {
      P *= 1 + infl(t);
      const k = t - lag; W *= 1 + (lag === 0 ? infl(t) : (k >= 1 ? infl(k) : e));
      rows.push({ t, P, saver: 100 * Math.pow(1 + i, t) / P, plan: 100 * Math.pow(1 + WIN.r, t), wage: W / P });
    }
    // the worker's real pay relative to what it would have been with no surprise (always 1 with no surprise)
    const wageLost = rows.slice(1).reduce((s, r) => s + (1 - r.wage), 0); // in years of year-0 pay
    const end = rows[rows.length - 1];
    return { i, rows, saverEnd: end.saver, planEnd: end.plan, transfer: end.plan - end.saver, wageLost, Pend: end.P };
  }

  // ch6: present value of an amount due in t years at annual rate r
  const pv = (fv, r, t) => fv / Math.pow(1 + r, t);

  /* ───────── ch7 · paying a loan back ─────────
     Fixed monthly payment M = P·i / (1 − (1+i)^−n), i = annual/12. Each month interest = balance × i, the rest
     of the payment repays principal. An extra payment goes straight to principal. Inflation g deflates each
     payment into today's money. */
  function amortise({ P, rate, years, extra = 0, infl = 0 }) {
    const i = rate / 12, n = years * 12, M = i > 0 ? P * i / (1 - Math.pow(1 + i, -n)) : P / n;
    let bal = P, totInt = 0, m = 0; const yearsRows = [];
    let yi = 0, yp = 0, firstInt = bal * i;
    while (bal > 1e-6 && m < n) {
      const int = bal * i, prin = Math.min(bal, M - int + extra), pay = int + prin;
      bal -= prin; totInt += int; yi += int; yp += prin; m++;
      if (m % 12 === 0 || bal <= 1e-6) { yearsRows.push({ year: Math.ceil(m / 12), interest: yi, principal: yp, balance: bal }); yi = 0; yp = 0; }
    }
    const lastReal = M / Math.pow(1 + infl, (m - 1) / 12);
    return { M, months: m, totInt, firstInterestShare: firstInt / M, years: yearsRows, lastReal };
  }
  // share of the payments in the first `months` months that went to interest
  function amortiseEarlyInterestShare(p, months) {
    const i = p.rate / 12, n = p.years * 12, M = p.P * i / (1 - Math.pow(1 + i, -n)); let bal = p.P, si = 0;
    for (let m = 0; m < months; m++) { const int = bal * i; si += int; bal -= M - int; }
    return si / (M * months);
  }

  /* ───────── ch8 · from the central bank's rate to your mortgage ─────────
     Monthly chain of first-order lags after the policy rate rises by d percentage points at month 0 and is
     held there for 18 months, then cut back to where it was:
       market rate      follows policy within about a month (tau 1);
       new-loan rate    follows the market rate (tau 3 months);
       rate actually paid on all mortgages = v × new-loan rate (variable loans reset at once)
                        + (1 − v) × average fixed rate, of which 1/(12F) resets to the new-loan rate each month;
       spending gap     moves toward −beta × (½ rate paid + ½ new-loan rate) (tau 6 months);
       inflation gap    moves toward kappa × spending gap (tau 12 months).
     The shape, not the size, is the lesson; all the coefficients are illustrative. */
  const TR = { tau1: 1, tau2: 3, tau3: 6, tau4: 12, beta: 1, kappa: 0.5, months: 48, hold: 18 };
  function transmit({ d, v, F }) {
    let m = 0, nr = 0, fx = 0, g = 0, pi = 0; const rows = [{ t: 0, policy: d, market: 0, newRate: 0, paid: 0, spend: 0, infl: 0 }];
    const sub = 10, h = 1 / sub;
    for (let t = 1; t <= TR.months; t++) {
      const pol = t <= TR.hold ? d : 0;
      for (let k = 0; k < sub; k++) {
        m += (pol - m) / TR.tau1 * h; nr += (m - nr) / TR.tau2 * h; fx += (nr - fx) / (12 * F) * h;
        const paid = v * nr + (1 - v) * fx;
        g += (-TR.beta * (0.5 * paid + 0.5 * nr) - g) / TR.tau3 * h; pi += (TR.kappa * g - pi) / TR.tau4 * h;
      }
      rows.push({ t, policy: pol, market: m, newRate: nr, paid: v * nr + (1 - v) * fx, spend: g, infl: pi });
    }
    let lo = rows[0]; rows.forEach(r => { if (r.infl < lo.infl) lo = r; });
    let lowSpend = rows[0]; rows.forEach(r => { if (r.spend < lowSpend.spend) lowSpend = r; });
    const at = t => rows[Math.min(rows.length - 1, t)];
    return { rows, peakInflMonth: lo.t, peakInfl: lo.infl, peakSpendMonth: lowSpend.t, at };
  }

  /* ───────── ch9 · exchange rates and a burger ─────────
     Home (yuan) and Abroad (a made-up currency, "B"). A burger costs 20 yuan at home and 4 B abroad in year 0,
     so purchasing-power parity says 5 yuan per B. Prices rise at piH at home and 2% abroad. The PPP rate moves
     with the ratio of price levels. The market rate starts 30% above PPP (after money rushed into B) and the gap
     q shrinks with half-life H years; shocks add to q. */
  const FX = { home0: 20, abroad0: 4, piF: 0.02, q0: Math.log(1.3), years: 20 };
  function fxAt(t, { piH, H, shocks = [] }) {
    let q = FX.q0 * Math.pow(0.5, t / H);
    for (const s of shocks) if (t >= s.t) q += s.dq * Math.pow(0.5, (t - s.t) / H);
    const ppp = (FX.home0 / FX.abroad0) * Math.pow((1 + piH) / (1 + FX.piF), t), E = ppp * Math.exp(q);
    const home = FX.home0 * Math.pow(1 + piH, t), abroadLocal = FX.abroad0 * Math.pow(1 + FX.piF, t), abroadInYuan = abroadLocal * E;
    return { t, q, ppp, E, home, abroadLocal, abroadInYuan, dear: abroadInYuan / home - 1 };
  }
  function fxYearsToWithin(p, tol) { for (let t = 0; t <= 60; t += 1 / 12) { if (Math.abs(fxAt(t, p).dear) <= tol) return t; } return null; }

  return { rng, clamp, TRADE_P, TRADE_ROUNDS, tradeInit, tradeRound, tradeRun, tradeExpectedRounds, tradeBarterChance, tradeStuck,
    LOAN, bankInit, bankCheck, bankLoan, bankRepay, bankQE, bankLendToLimit, textbookMaxDeposits, capitalMaxLoans,
    RUN, runCapacity, runV, runThreshold, runSim, runCriticalRumour,
    QTM, qtmInit, qtmStep, qtmPath, qtmLongRun, WIN, winPath, pv, amortise, amortiseEarlyInterestShare, TR, transmit, FX, fxAt, fxYearsToWithin };
});
