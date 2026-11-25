/* Can a Country Go Bankrupt? — models (UMD: page + node).
   Every model is a pure function. Units: ratios in percent of GDP, rates in percent per year,
   unless a comment says otherwise. Nothing here is a forecast. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PublicFinanceModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── number formatting (language-aware thousands separator; same digits in zh/en) ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    d = d == null ? 0 : d;
    const neg = x < 0 || (Object.is(x, -0));
    let s = Math.abs(x).toFixed(d);
    if (Number(s) === 0) return (0).toFixed(d);
    const [i, f] = s.split('.');
    const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + ii + (f ? '.' + f : '');
  }
  const round = (x, d) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);

  /* ════════ ch3 + ch9: debt dynamics ════════
     d' = d·(1 + r)/(1 + g) − pb      (pb = primary balance, surplus > 0, deficit < 0) */
  function debtStep(d, r, g, pb) { return d * (1 + r / 100) / (1 + g / 100) - pb; }
  function debtPath(o) {
    const n = o.years == null ? 50 : o.years;
    const out = [o.d0];
    let d = o.d0;
    for (let t = 1; t <= n; t++) { d = debtStep(d, o.r, o.g, o.pb); out.push(d); }
    return out;
  }
  // primary balance that holds d constant: pb* = d·(r − g)/(1 + g)
  function stabilizingPb(d, r, g) { return d * (r - g) / (100 + g); }
  // fixed point when r < g: d* = −pb·(1 + g)/(g − r); null when it does not exist (r ≥ g) or is negative
  function steadyState(r, g, pb) {
    if (!(g > r)) return null;
    return -pb * (100 + g) / (g - r);
  }
  // decomposition of one year's change: interest-growth effect and primary balance
  function debtDecomp(d, r, g, pb) {
    const ig = d * (r - g) / (100 + g);
    return { ig, pb: -pb, total: ig - pb };
  }
  function debtSummary(o) {
    const p = debtPath(o);
    const last = p[p.length - 1];
    const ss = steadyState(o.r, o.g, o.pb);
    const stab = stabilizingPb(o.d0, o.r, o.g);
    let cls;
    if (Math.abs(o.r - o.g) < 1e-9) cls = Math.abs(o.pb) < 1e-9 ? 'flat' : (o.pb < 0 ? 'drift' : 'shrink');
    else if (o.r < o.g) cls = 'conv';
    else cls = o.pb < stab - 1e-9 ? 'explode' : (o.pb > stab + 1e-9 ? 'shrink' : 'flat');
    return { path: p, d10: p[10], d30: p[30], d50: p[50], last, steady: ss, stab, cls };
  }

  /* ch3 fan chart: r − g is not known in advance. g is fixed; r − g = gap + x_t where x_t is AR(1),
     x_t = rho·x_{t−1} + sigma·e_t, e ~ N(0, 1), x_0 = 0. Seeded RNG (mulberry32 + Box–Muller), n paths. */
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gauss(u) { let s = 0; while (!s) s = u(); return Math.sqrt(-2 * Math.log(s)) * Math.cos(2 * Math.PI * u()); }
  const FAN = { g: 4, rho: 0.8, n: 400, years: 30, seed: 20261125, hi: 150 };
  function quantile(sorted, q) { const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); }
  function debtFan(o) {
    const n = o.n || FAN.n, Y = o.years || FAN.years, g = FAN.g, rho = o.rho == null ? FAN.rho : o.rho;
    const u = rng(o.seed || FAN.seed);
    const paths = [];
    for (let k = 0; k < n; k++) {
      let d = o.d0, x = 0; const p = [d];
      for (let t = 1; t <= Y; t++) { x = rho * x + o.sigma * gauss(u); d = debtStep(d, g + o.gap + x, g, o.pb); p.push(d); }
      paths.push(p);
    }
    const bands = [];
    for (let t = 0; t <= Y; t++) {
      const col = paths.map(p => p[t]).sort((a, b) => a - b);
      bands.push({ t, q10: quantile(col, 0.1), q25: quantile(col, 0.25), q50: quantile(col, 0.5), q75: quantile(col, 0.75), q90: quantile(col, 0.9) });
    }
    const end = paths.map(p => p[Y]);
    const above = end.filter(v => v > (o.hi || FAN.hi)).length / n;
    const det = debtPath({ d0: o.d0, r: g + o.gap, g, pb: o.pb, years: Y });
    return { bands, above, det, end: bands[Y] };
  }

  /* ════════ ch4: own-currency vs foreign-currency rollover toy ════════
     Real GDP is fixed at 100; nominal GDP = 100·P. Each year 1/m of each debt matures and a share
     `stop` of it is not rolled over by private lenders.
     - Local-currency debt with a central-bank backstop: the refused part is bought with new base money B;
       with constant velocity, P moves with B (quantity equation).
     - Hard debt (foreign currency, or local debt the central bank cannot or will not buy): the refused part
       is paid out of a hard-currency buffer. When the buffer cannot cover it, the government misses a
       payment: default.
     - The exchange rate follows prices (PPP) times a real depreciation 1 + chi·stop from capital flight. */
  const CUR = { m: 5, B0: 15, chi: 0.5, years: 10 };
  function currencyToy(o) {
    const m = CUR.m, chi = CUR.chi, Y = o.years || CUR.years;
    const fx = o.fxShare / 100, stop = o.stop / 100;
    const backstop = o.backstop !== false;
    let DL = o.d0 * (1 - fx), DF = o.d0 * fx;   // local units (nominal), hard units
    let B = CUR.B0, P = 1, cash = o.buffer, def = null;
    const rows = [];
    const E0 = 1;
    for (let t = 1; t <= Y; t++) {
      const rL = stop * DL / m, rF = stop * DF / m;
      let needHard = rF;
      let Bn = B;
      if (backstop) Bn = B + rL; else needHard += rL;
      if (needHard > cash + 1e-12) { def = t; rows.push({ t, P, E: P * (1 + chi * stop), cash, infl: 0, ratio: null, def: true }); break; }
      cash -= needHard;
      const Pn = P * Bn / B;
      const infl = Pn / P - 1;
      P = Pn; B = Bn;
      const E = backstop ? P * (1 + chi * stop) : E0 * (1 + chi * stop);
      // debt ratio in local terms: local debt (nominal) + hard debt converted at E, over nominal GDP
      const ratio = (DL + DF * (backstop ? E : 1)) / (100 * P) * 100;
      const fxRatio = DF * (backstop ? E : 1) / (100 * P) * 100;
      const lRatio = DL / (100 * P) * 100;
      rows.push({ t, P, E, cash, infl, ratio, fxRatio, lRatio, def: false });
    }
    const lastOk = rows.filter(r => !r.def).pop() || null;
    const yrs = lastOk ? lastOk.t : 0;
    const cumInfl = lastOk ? lastOk.P - 1 : 0;
    const avgInfl = yrs ? Math.pow(lastOk.P, 1 / yrs) - 1 : 0;
    let cls;
    if (def) cls = 'default';
    else if (cumInfl > 0.5) cls = 'inflate';
    else if (cumInfl > 1e-9) cls = 'mild';
    else if (stop > 0 && (fx > 0 || !backstop)) cls = 'buffer';
    else cls = 'calm';
    return { rows, defaultYear: def, cumInfl, avgInfl, last: lastOk, cls };
  }

  /* ════════ ch5: haircut on a restructured bond ════════
     Per 100 of old face value: `cash` is paid in short notes (valued at par), `cut` is written off,
     the rest becomes a new bullet bond with coupon c and maturity n, discounted at yield y.
     Market loss = 1 − value/100. SZ haircut (Sturzenegger–Zettelmeyer) = 1 − value / PV(old bond at y). */
  function bondPV(face, c, n, y) {
    const cy = y / 100, cp = face * c / 100;
    if (n <= 0) return face;
    if (Math.abs(cy) < 1e-12) return cp * n + face;
    return cp * (1 - Math.pow(1 + cy, -n)) / cy + face * Math.pow(1 + cy, -n);
  }
  const OLD = { c: 4.5, n: 6 };
  function haircut(o) {
    const newFace = Math.max(0, 100 - o.cut - o.cash);
    const vNew = bondPV(newFace, o.coupon, o.mat, o.y);
    const value = o.cash + vNew;
    const vOld = bondPV(100, OLD.c, OLD.n, o.y);
    return { newFace, vNew, value, faceLoss: o.cut + 0, market: 1 - value / 100, sz: 1 - value / vOld, vOld };
  }

  /* ════════ ch6 + ch7: pay-as-you-go pension on a stylised population ════════
     Births by calendar year (index) with a boom and a long decline; Gompertz survival; no migration,
     no mortality improvement. Workers: ages 20 .. R−1, of whom a share `emp` contribute.
     Balanced PAYG: tau·w·N_contrib = b·N_retired  =>  tau = (b/w)·(N_retired/N_contrib). */
  function births(year) {
    const pts = [[1940, 1.5], [1958, 1.6], [1960, 1.2], [1962, 2.3], [1975, 2.3], [1980, 1.8], [1990, 2.1], [2000, 1.4], [2016, 1.4], [2024, 0.85], [2035, 0.75], [2100, 0.75]];
    if (year <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (year <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * (year - x0) / (x1 - x0); }
    }
    return pts[pts.length - 1][1];
  }
  const GOMP = { A: 0.00004, B: 0.098, infant: 0.01 };
  const SURV = (() => { const s = [1]; let acc = 1 - GOMP.infant; for (let a = 1; a <= 110; a++) { s.push(acc); acc *= Math.exp(-GOMP.A * Math.exp(GOMP.B * a)); } return s; })();
  function lifeExp() { let e = 0; for (let a = 0; a < 110; a++) e += (SURV[a] + SURV[a + 1]) / 2; return e; }
  function population(year) { const p = []; for (let a = 0; a <= 110; a++) p.push(births(year - a) * SURV[a]); return p; }
  function paygAt(o) {
    const pop = population(o.year), R = o.ret, emp = o.emp == null ? 0.8 : o.emp;
    let work = 0, ret = 0;
    for (let a = 0; a <= 110; a++) {
      // fractional retirement age: the cohort at floor(R) is split
      if (a < 20) continue;
      const wShare = Math.max(0, Math.min(1, R - a));
      work += pop[a] * wShare; ret += pop[a] * (1 - wShare);
    }
    const contrib = work * emp;
    const dep = ret / contrib;
    const tau = o.repl / 100 * dep;
    return { pop, work, ret, contrib, dep, tau: tau * 100 };
  }
  // China-style gradual schedule: +1 month every 4 months from 2025-01 for 15 years (60 -> 63);
  // for a calendar year, the average statutory age of people reaching it is approximated by
  // 60 + 0.2·(year − 2025) between 2025 and 2040.
  function gradualAge(year, from, to, y0, y1) {
    from = from == null ? 60 : from; to = to == null ? 63 : to; y0 = y0 == null ? 2025 : y0; y1 = y1 == null ? 2040 : y1;
    if (year <= y0) return from;
    if (year >= y1) return to;
    return from + (to - from) * (year - y0) / (y1 - y0);
  }
  // months added per calendar month under "1 month every 4 months"
  function scheduleMonths(monthsElapsed) { return Math.min(36, Math.floor(monthsElapsed / 4) + (monthsElapsed > 0 ? 1 : 0)); }
  function paygPath(o) {
    const out = [];
    for (let y = o.y0 || 2025; y <= (o.y1 || 2075); y++) {
      const R = o.mode === 'gradual' ? gradualAge(y) : o.mode === 'custom' ? gradualAge(y, 60, o.target, 2025, o.reach || 2040) : 60;
      out.push({ year: y, R, tau: paygAt({ year: y, ret: R, repl: o.repl, emp: o.emp }).tau });
    }
    return out;
  }

  /* ════════ ch8: fiscal multiplier, round by round, with the debt arithmetic ════════
     A purchase dG becomes someone's income. Of each round of income, a share t is taxed, households
     spend c of what is left, and a share m of that spending leaks abroad: a = c·(1 − t) − m... simplified so
     that imports are a share of income: next round = a·this round with a = c·(1 − t) − m.
     Monetary offset theta: the central bank neutralises that share of the demand effect (dY ← (1 − theta)·dY). */
  function multiplier(o) {
    const a = Math.max(0, o.c * (1 - o.t) - o.m);
    const rounds = [];
    let inc = o.dG, cum = 0;
    for (let k = 0; k < (o.rounds || 60); k++) { cum += inc; rounds.push({ k, inc, cum }); inc *= a; }
    const closed = (1 - o.theta) / (1 - a);
    const kN = (1 - o.theta) * cum / o.dG;
    const dY = closed * o.dG;
    const tax = o.t * dY;
    const newDebt = o.dG - tax;
    const d0 = o.d0 == null ? 100 : o.d0;
    const ratio1 = (d0 + newDebt) / (100 + dY) * 100;
    return { a, rounds, closed, kN, dY, tax, newDebt, ratio1, dRatio: ratio1 - d0 };
  }
  // multiplier at which a debt-financed dG leaves the debt ratio unchanged in year one:
  // (d0 + dG − t·k·dG)/(100 + k·dG) = d0/100  ⇒  k = 1/(t + d0/100)
  function breakEvenK(t, d0) { return 1 / (t + d0 / 100); }

  /* defaults shared by the page, bindings and tests */
  const CH3_DEFAULT = { d0: 100, r: 2, g: 4, pb: -3, years: 50 };
  const CH4_DEFAULT = { d0: 80, fxShare: 50, stop: 30, buffer: 15, backstop: true };
  const CH5_DEFAULT = { cut: 53.5, cash: 15, coupon: 3, mat: 20, y: 15 };
  const CH6_DEFAULT = { year: 2025, ret: 60, repl: 45 };
  const CH8_DEFAULT = { dG: 1, c: 0.8, t: 0.3, m: 0.1, theta: 0, rounds: 20, d0: 100 };

  /* ════════ dated facts (every one has a source in BRIEF.md) ════════ */
  const FRONTIER = {
    checked: '2026-11-25',
    usFY2026: { receipts: 5403.3, outlays: 7395.8, netInterest: 1051.8, defense: 965.2, socialSecurity: 1667.1, medicare: 1072.6, src: 'Treasury MTS Table 9, FY2026 through 2026-09-30 (api.fiscaldata.treasury.gov)' },
    usFY2025: { receipts: 5234.6, outlays: 7010.0, netInterest: 970.4, defense: 916.6 },
    usDebtPublic20260930: 32425.0, usDebtTotal20260930: 40171.8,
    usDebtPublic20261123: 32902.5, usDebtTotal20261123: 40727.4,
    usForeign202609: 9241.2, usJapan202609: 1063.1, usUK202609: 985.8, usChina202609: 563.9,
    usAvgRateMarketable202610: 3.570,
    // sibling essay why-one-rate-moves-everything#ch11 (FRED 2026Q2; CBO Feb 2026)
    usDebtGdp2026Q2: 97.4, usReff2026Q2: 4.04, usG2026Q2: 6.31, cbo2026: 101, cbo2036: 120, cboPrimaryDef2026: 2.6,
    // IMF F&D, Anand & Khan, 2026-09-01
    japanGross: 207, japanPeak: 229, japanNetNarrow: 186, japanNetBroad: 137, japanR2025: 0.7, japanG2025: 4.5,
    // MOF Japan, BoJ Flow of Funds prelim. (2026-09-17), June 2026
    jgbTotal: 1006.5, jgbBoj: 470.0, jgbBojPct: 46.7, jgbForeignPct: 7.9, jgbTbForeignPct: 13.1,
    // China: State Council report on 2025 government debt (2026-08-31); MoF 2024-11-08; IMF 2025 Art. IV (2026-02-18)
    cnTotal2025: 102.5, cnRatio2025: 73.2, cnLegalRatio2025: 68.5, cnCentral2025: 41.2, cnLocal2025: 54.8, cnHidden2025: 6.5,
    cnHidden2023: 14.3, cnHidden2024: 10.5, cnSwap: 6, cnSpecial: 4, cnImfAug2025: 126.6, cnImfAug2026: 135.3, cnImfAug2030: 153.7, cnImfGov2025: 68.4,
    // China retirement reform (NPC Standing Committee, 2024-09-13; in force 2025-01-01)
    cnRetMen: [60, 63], cnRetWomenCadre: [55, 58], cnRetWomenWorker: [50, 55], cnRetYears: 15, cnMinContrib: [15, 20], cnMinContribFrom: 2030,
    cnPensionRate: { employer: 16, individual: 8 },
    cnAge60Pct2025: 23.0, cnAge65Pct2025: 15.9,
    // Greece PSI (RBA SMP May 2012 Box B; ZTG 2013)
    grEligible: 206, grOutstanding: 356, grNominalCut: 53.5, grNpvMarket: 75, grZtgLow: 58, grZtgHigh: 65,
    grNewBondShare: 31.5, grEfsfShare: 15,
    // Ramey 2019 JEP
    rameyLow: 0.6, rameyHigh: 1.0
  };

  // ch9 presets: the latest readings (pb: US = CBO 2026 primary deficit; Japan = balanced, illustrative)
  const PRESETS = {
    us: { d0: FRONTIER.usDebtGdp2026Q2, r: FRONTIER.usReff2026Q2, g: FRONTIER.usG2026Q2, pb: -FRONTIER.cboPrimaryDef2026, years: 30 },
    jp: { d0: FRONTIER.japanGross, r: FRONTIER.japanR2025, g: FRONTIER.japanG2025, pb: 0, years: 30 }
  };

  return {
    fmt, round, CH3_DEFAULT, CH4_DEFAULT, CH5_DEFAULT, CH6_DEFAULT, CH8_DEFAULT, PRESETS,
    debtStep, debtPath, stabilizingPb, steadyState, debtDecomp, debtSummary,
    CUR, currencyToy,
    bondPV, OLD, haircut,
    births, SURV, lifeExp, population, paygAt, gradualAge, scheduleMonths, paygPath,
    multiplier, breakEvenK,
    FRONTIER
  };
}));
