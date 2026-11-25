/* Why Banks Run: the page's models as pure functions (UMD: window.BankRunModels in the page, module.exports in node).
   Every number the prose states is recomputed from here by bindings.cjs and pinned by tests/models.cjs.
   Nothing here is random. */
(function (root, factory) {
  const M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M;
  else root.BankRunModels = M;
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

/* number formatting shared by page and bindings: fixed decimals, thousands separators, a real minus sign */
function fmt(x, d, lang) {
  if (x == null || !isFinite(x)) return '—';
  const s = Math.abs(x).toFixed(d == null ? 0 : d);
  const [i, f] = s.split('.');
  const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const neg = x < 0 && Number(s) !== 0;
  return (neg ? '−' : '') + ii + (f ? '.' + f : '');
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ───────── real-world figures (dated, sourced in BRIEF.md and the footer) ───────── */
const FACTS = {
  // SVB Financial Group 10-K, consolidated balance sheet, 31 Dec 2022 (US$ billion)
  svb: { assets: 211.793, cash: 13.803, afs: 26.069, htmCost: 91.321, htmFair: 76.169, loans: 73.614, deposits: 173.109, equity: 16.004 },
  svbUninsuredPct: 94,        // Fed SVB review (28 Apr 2023), table 1, 2022:Q4
  svbPeerUninsuredPct: 41,    // same table, large banking organisations
  svbSecuritiesPct: 55,       // same table, securities / total assets
  svbPeerSecuritiesPct: 25,
  svbHtmDuration: 6.2,        // Fed review: weighted-average duration of HTM portfolio, 31 Dec 2022
  svbAfsSold: 21, svbAfsLoss: 1.8, svbRaise: 2.25,   // 8 Mar 2023 announcement
  svbOut9: 40, svbOut10: 100, svbOutPct: 85,          // "over $40bn" on 9 Mar; "over $100bn more" expected 10 Mar; ~85% of deposits
  wamuOut: 19, wamuDays: 16, wachoviaOut: 10, wachoviaDays: 8,
  svbLcrShortfall: 9,         // Fed review: ~9% HQLA shortfall under full LCR, Dec 2022
  y10_2021: 1.52, y10_2022: 3.88, y2_2021: 0.73, y2_2022: 4.41,   // FRED year-end yields (as cited on why-one-rate-moves-everything ch2)
  lehman: { assets: 691.063, equity: 22.490, lev: 30.7 },          // Lehman 2007 annual report, FY ended 30 Nov 2007
  cnLimit: 50,                // 万元, 《存款保险条例》第五条 (2015-05-01)
  usLimit: 250000,            // US$, FDIC standard maximum deposit insurance amount
  cnInstitutions: 2912,       // PBoC via Xinhua, end-June 2026
  fsr: { uninsured: 7969, runnable: 28157, runnableGdp: 87, repo: 6765, mmf: 7900, lcr: 120, pc2012: 350, pcAssets: 2.6, pcLoans: 1.5, pcShare: 6, stable: 310 },  // Fed FSR Nov 2026
  fdic2026: 6, fdic2025: 2, nanoAssets: 736,               // FDIC Bank Failures in Brief 2026
  csAt1: 16,                  // CHF billion, FINMA 19 Mar 2023
  usdcAtSvb: 3.3, usdcLow: 0.87,
  basel: { cet1: 4.5, ccb: 2.5, lev: 3, lcr: 100 },
  runoff: { insured: 5, retail: 10, oper: 25, corp: 40 }   // Basel LCR 30-day run-off rates, %
};

/* ═════ ch2 leverage: assets 100, equity 100/L ═════ */
function leverage(L, lossPct) {
  const A = 100, E = A / L, A1 = A - lossPct, E1 = E - lossPct;
  const out = { A, E, D: A - E, A1, E1, eqLossPct: lossPct / E * 100, cushion: E, roeMult: L };
  if (E1 <= 1e-12) return Object.assign(out, { insolvent: true, lev1: Infinity, sell: A1, sellPct: 100 });
  const lev1 = A1 / E1, keep = L * E1, sell = Math.max(0, A1 - keep);
  return Object.assign(out, { insolvent: false, lev1, sell, sellPct: sell / A1 * 100, keep });
}

/* ═════ ch4 Diamond–Dybvig run game ═════
   Depositors put in 1 each. A share pi needs cash at t=1; the rest (patient) can wait to t=2.
   The bank keeps lam in cash; the rest earns R(1−loss) at t=2, or s per unit if sold at t=1.
   The deposit contract pays 1 at t=1 to whoever comes (sequential service, approximated pro rata).
   w = share withdrawing at t=1. Insured patient depositors never run. LOLR: the central bank lends
   the shortfall against the long asset at penalty rate p, to be repaid at t=2. */
const DD = { pi: 0.2, lam: 0.2, R: 1.3, p: 1.1, h: 0.03, alpha: 0.5, rounds: 40 };
function ddPayoffs(w, o) {
  const P = Object.assign({}, DD, o), Re = P.R * (1 - P.loss);
  const longA = 1 - P.lam;
  if (w <= P.lam) {
    const c2 = ((P.lam - w) + Re * longA) / Math.max(1e-9, 1 - w);
    return { run: 1, wait: c2, failT1: false };
  }
  const short = w - P.lam;
  if (P.lolr) {
    const left = Re * longA - P.p * short;
    return { run: 1, wait: w >= 1 - 1e-9 ? (left > 0 ? Infinity : 0) : Math.max(0, left) / (1 - w), failT1: false };
  }
  const V = P.lam + P.s * longA;            // all the bank can raise at t=1
  if (w >= V - 1e-12) return { run: V / w, wait: 0, failT1: true };
  const leftLong = longA - short / P.s;
  return { run: 1, wait: Re * leftLong / Math.max(1e-9, 1 - w), failT1: false };
}
// share of uninsured patient depositors who run, given expected payoffs (smoothed best response)
function ddRespond(pay, h) {
  const d = Math.min(pay.wait, 10) - pay.run;
  return clamp((h - d) / (2 * h), 0, 1);
}
function ddW(phi, o) { const P = Object.assign({}, DD, o); return P.pi + (1 - P.pi) * (1 - P.q) * phi; }
function ddGame(o) {
  const P = Object.assign({}, DD, o);
  let phi = P.b0; const path = [];
  for (let k = 0; k <= P.rounds; k++) {
    const w = ddW(phi, P), pay = ddPayoffs(w, P);
    path.push({ k, phi, w, wait: pay.wait, run: pay.run, failT1: pay.failT1 });
    // each round, half of the uninsured patient depositors revise toward their best response
    const nxt = phi + P.alpha * (ddRespond(pay, P.h) - phi);
    if (Math.abs(nxt - phi) < 1e-4) { phi = nxt; break; }
    phi = nxt;
  }
  const w = ddW(phi, P), pay = ddPayoffs(w, P);
  const ran = phi > 0.5;
  return { path, phi, w, pay, ran, failed: pay.failT1 || (ran && pay.wait <= 1e-9), tip: ddTip(P), maxW: ddW(1, P), fundamental: ddPayoffs(P.pi, P).wait < 1 };
}
// tipping point: smallest w at which waiting pays less than running (null if none up to w = 1)
function ddTip(o) {
  const P = Object.assign({}, DD, o);
  let lo = P.pi, hi = 1;
  const worse = w => { const x = ddPayoffs(w, P); return x.wait < x.run; };
  if (worse(lo)) return lo;
  if (!worse(1 - 1e-9)) return null;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (worse(m)) hi = m; else lo = m; }
  return hi;
}
// the belief (share of uninsured patients expected to run) above which the iteration tips into a run
function ddTipBelief(o) {
  const P = Object.assign({}, DD, o);
  const runs = b => ddGame(Object.assign({}, P, { b0: b })).ran;
  if (runs(0)) return 0;
  if (!runs(1)) return null;
  let lo = 0, hi = 1;
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (runs(m)) hi = m; else lo = m; }
  return hi;
}
// the insured share above which even a full run of the uninsured cannot reach the tipping point
function ddInsuredThreshold(o) {
  const P = Object.assign({}, DD, o), tip = ddTip(Object.assign({}, P, { q: 0 }));
  return tip == null ? 0 : Math.max(0, 1 - (tip - P.pi) / (1 - P.pi));
}
// the lowest asset loss at which even zero fear produces a run (insolvency)
function ddLossThreshold(o) {
  const P = Object.assign({}, DD, o);
  let lo = 0, hi = 1;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (ddPayoffs(P.pi, Object.assign({}, P, { loss: m })).wait < 1) hi = m; else lo = m; }
  return hi;
}
const DD_DEFAULT = { b0: 0.3, s: 0.6, loss: 0, q: 0, lolr: false };

/* ═════ ch5 SVB-style balance sheet: bonds bought at par at y0, repriced after Δy (zero-coupon, maturity T) ═════ */
const SVB_DEFAULT = { assets: 211.8, cash: 13.8, equity: 16.0, deposits: 173.1, bondPct: 55, T: 6.2, y0: 1.5, dy: 2.5, uninsPct: 94, runPct: 25 };
function priceFactor(T, y0, dy) { return Math.pow((1 + y0 / 100) / (1 + (y0 + dy) / 100), T); }
function svb(o) {
  const P = Object.assign({}, SVB_DEFAULT, o);
  const bonds = P.assets * P.bondPct / 100, pf = priceFactor(P.T, P.y0, P.dy);
  const mtmLoss = bonds * (1 - pf), mtmEq = P.equity - mtmLoss;
  const unins = P.deposits * P.uninsPct / 100, W = unins * P.runPct / 100;
  const need = Math.max(0, W - P.cash), mkt = bonds * pf;
  const canPay = need <= mkt + 1e-9;
  const faceSold = Math.min(bonds, need / pf), realised = faceSold * (1 - pf);
  const bookEqAfter = P.equity - realised;
  // rate rise at which marked-to-market equity reaches zero
  const pfStar = 1 - P.equity / bonds;
  const dyStar = pfStar > 0 ? ((1 + P.y0 / 100) / Math.pow(pfStar, 1 / P.T) - 1) * 100 - P.y0 : 0;
  const dur = P.T / (1 + (P.y0) / 100);  // modified duration of the zero at y0
  return { bonds, pf, lossPct: (1 - pf) * 100, mtmLoss, mtmEq, unins, W, need, faceSold, realised, bookEqAfter, canPay, dyStar, dur, mtmEqPctUnins: mtmEq / unins * 100 };
}

/* ═════ ch7 liquidity coverage: Basel run-off rates against a fast run ═════
   Deposits 100, split into insured retail (5%), uninsured retail (10%) and uninsured corporate (40%). */
const LCR_DEFAULT = { insured: 6, corp: 94, hqla: 40, speed: 25 };
function lcr(o) {
  const P = Object.assign({}, LCR_DEFAULT, o), R = FACTS.runoff;
  const corp = Math.min(P.corp, 100 - P.insured), retail = Math.max(0, 100 - P.insured - corp);
  const out30 = P.insured * R.insured / 100 + retail * R.retail / 100 + corp * R.corp / 100;
  const ratio = P.hqla / out30 * 100;
  const unins = retail + corp, perDay = unins * P.speed / 100;
  const days = perDay > 0 ? P.hqla / perDay : Infinity;
  return { insured: P.insured, corp, retail, out30, ratio, unins, perDay, days, pass: ratio >= 100 };
}

/* ═════ ch7 deposit insurance: covered amount per bank ═════ */
function covered(amounts, limit) {
  const rows = amounts.map(a => ({ a, cov: Math.min(a, limit), unc: Math.max(0, a - limit) }));
  return { rows, cov: rows.reduce((s, r) => s + r.cov, 0), unc: rows.reduce((s, r) => s + r.unc, 0) };
}

return { fmt, clamp, FACTS, leverage, DD, DD_DEFAULT, ddPayoffs, ddRespond, ddW, ddGame, ddTip, ddTipBelief, ddLossThreshold, ddInsuredThreshold,
  SVB_DEFAULT, priceFactor, svb, LCR_DEFAULT, lcr, covered };
});
