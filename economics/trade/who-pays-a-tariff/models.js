/* Who pays a tariff: the page's models as plain functions (UMD: the page and node tests use the same code).
   Every number the prose states is computed here and bound through bindings.cjs or pinned in tests/models.cjs.
   Models:
     elastic   constant-elasticity demand: a price change and the quantity / spending response (ch: elasticity)
     incidence an ad valorem tariff between constant-elasticity import demand and foreign export supply; exact split (ch2)
     ledger    linear home demand, home supply and foreign export supply; areas, terms of trade, optimal tariff (ch3)
     ricardo   two countries, two goods, labour only (Ricardo's 1817 numbers), Cobb–Douglas halves; gains from trade (ch4)
     balance   S − I = CA and a tariff shock closed by the exchange rate (ch5)
     divert    CES (Armington) sourcing between two suppliers, a tariff on one, an exchange-rate offset (ch6)
     retal     the ch3 ledger mirrored: two countries choosing free trade or the optimal tariff (ch6)
     choke     an export restriction by a dominant supplier, with supply and demand elasticities that grow over time (ch7)
     passthru  a seeded synthetic panel of product prices; before/after vs difference-in-differences; border vs retail (ch8) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TariffModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── formatting (both languages use Western digits; zh drops the thousands comma below 10,000) ── */
  function fmt(x, d, lang) {
    if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
    d = d == null ? 0 : d;
    let s = Math.abs(x).toFixed(d);
    if (Math.abs(+s) === 0) x = 0;
    const [i, f] = s.split('.');
    const grp = Math.abs(x) >= 10000 || lang !== 'zh' && Math.abs(x) >= 1000;
    const ii = grp ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : i;
    return (x < 0 ? '−' : '') + ii + (f ? '.' + f : '');
  }
  const signed = (x, d, lang) => (x > 0 && +Math.abs(x).toFixed(d == null ? 0 : d) !== 0 ? '+' : '') + fmt(x, d, lang);

  /* seeded RNG (mulberry32) and a normal draw */
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function normal(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ═════════ elasticity: Q = Q0·(P/P0)^(−e) ═════════ */
  function elastic(e, dp) { // e ≥ 0, dp: proportional price change (0.2 = +20%)
    const r = 1 + dp, q = Math.pow(r, -e), spend = r * q;
    // arc (midpoint) elasticity, the textbook way of measuring it from two observations
    const arc = dp === 0 ? e : -((q - 1) / ((q + 1) / 2)) / ((r - 1) / ((r + 1) / 2));
    return { q, dq: q - 1, spend, dspend: spend - 1, arc };
  }

  /* ═════════ ch2 incidence: ad valorem tariff τ; import demand Q = Pb^(−ed), foreign supply Q = Ps^(es); Pb = (1+τ)Ps ═════════
     Free-trade price and quantity are 1. es = Infinity is a small country (perfectly elastic foreign supply). */
  function incidence(ed, es, tau) {
    const L = Math.log(1 + tau);
    const share = es === Infinity ? 1 : (ed + es === 0 ? 0.5 : es / (es + ed)); // buyers' share of the log wedge
    const Pb = Math.exp(share * L), Ps = Math.exp((share - 1) * L), Q = Math.pow(Pb, -ed);
    const rev = (Pb - Ps) * Q;
    const csLoss = ed === 1 ? Math.log(Pb) : (Math.pow(Pb, 1 - ed) - 1) / (1 - ed);   // ∫_1^Pb P^(−ed) dP
    const psLoss = es === Infinity ? 0 : (1 - Math.pow(Ps, 1 + es)) / (1 + es);          // ∫_Ps^1 P^(es) dP
    const dollarShare = (Pb - 1) / (Pb - Ps);                                            // of the per-unit wedge
    return { Pb, Ps, Q, rev, csLoss, psLoss, dwl: csLoss + psLoss - rev, share, dollarShare, buyerPay: (Pb - 1) * Q, sellerPay: (1 - Ps) * Q };
  }

  /* ═════════ ch3 the national ledger (linear, specific tariff t) ═════════
     At the world price Pw = 100: home demand D0 = 100, home supply S0 = 40, imports M0 = 60.
     Elasticities at that point: demand eD, home supply eS, foreign export supply eX (Infinity = small country). */
  const LEDGER = { Pw: 100, D0: 100, S0: 40, eD: 1, eS: 1 };
  function ledger(t, eX, o) {
    o = Object.assign({}, LEDGER, o || {});
    const b = o.eD * o.D0 / o.Pw, d = o.eS * o.S0 / o.Pw, M0 = o.D0 - o.S0, k = b + d;    // M(P) = M0 − k(P − Pw)
    const f = eX === Infinity ? Infinity : eX * M0 / o.Pw;                                   // X(P*) = M0 + f(P* − Pw)
    let x = f === Infinity ? t : f * t / (k + f);                                            // home price rise
    const xAut = M0 / k;                                                                     // autarky price rise
    let prohibitive = false;
    if (x >= xAut) { x = xAut; prohibitive = true; }
    const P = o.Pw + x, M = Math.max(0, M0 - k * x);
    const Pstar = prohibitive ? (f === Infinity ? o.Pw : o.Pw - M0 / f) : P - t;
    const D1 = o.D0 - b * x, S1 = o.S0 + d * x;
    const csLoss = x * (o.D0 + D1) / 2, psGain = x * (o.S0 + S1) / 2, rev = (P - Pstar) * M;
    const tot = (o.Pw - Pstar) * M;                         // part of the revenue paid by foreign exporters (terms of trade)
    const dwlProd = 0.5 * x * (S1 - o.S0), dwlCons = 0.5 * x * (o.D0 - D1);
    const net = -csLoss + psGain + rev;                     // = tot − dwlProd − dwlCons
    const X1 = M, foreignLoss = (o.Pw - Pstar) * (M0 + X1) / 2;   // foreign exporters' surplus loss
    return { t, x, P, Pstar, M, M0, D1, S1, csLoss, psGain, rev, tot, dwlProd, dwlCons, dwl: dwlProd + dwlCons, net, foreignLoss, world: net - foreignLoss, prohibitive, tActual: P - Pstar };
  }
  function optimalTariff(eX, o) { // golden-section search over t ∈ [0, 80] for the home net gain
    if (eX === Infinity) return { t: 0, net: 0 };
    let a = 0, c = 80; const g = (Math.sqrt(5) - 1) / 2;
    let x1 = c - g * (c - a), x2 = a + g * (c - a), f1 = ledger(x1, eX, o).net, f2 = ledger(x2, eX, o).net;
    for (let i = 0; i < 120; i++) {
      if (f1 < f2) { a = x1; x1 = x2; f1 = f2; x2 = a + g * (c - a); f2 = ledger(x2, eX, o).net; }
      else { c = x2; x2 = x1; f2 = f1; x1 = c - g * (c - a); f1 = ledger(x1, eX, o).net; }
    }
    const t = (a + c) / 2; return { t, net: ledger(t, eX, o).net };
  }

  /* ═════════ ch6 retaliation: two mirror-image countries, each importing one good on the ch3 ledger ═════════
     A country's payoff = its own ledger net gain from its tariff − its exporters' loss from the other's tariff. */
  function retal(eX, tA, tB, o) {
    const A = ledger(tA, eX, o), B = ledger(tB, eX, o);
    return { a: A.net - B.foreignLoss, b: B.net - A.foreignLoss };
  }
  function retalMatrix(eX, t, o) {
    const cell = (x, y) => retal(eX, x, y, o);
    return { ff: cell(0, 0), ft: cell(0, t), tf: cell(t, 0), tt: cell(t, t) }; // first letter: A's choice
  }

  /* ═════════ ch4 Ricardo: labour per unit (Principles, 1817, ch. 7) and Cobb–Douglas halves ═════════ */
  const RICARDO = { E: { cloth: 100, wine: 120 }, P: { cloth: 90, wine: 80 } };
  function ricardo(o) {
    o = Object.assign({ eC: 100, eW: 120, pC: 90, pW: 80, p: null }, o || {});
    const LE = o.eC + o.eW, LP = o.pC + o.pW;           // each can make one of each in autarky
    const autE = o.eC / o.eW, autP = o.pC / o.pW;       // autarky price of cloth in wine
    // autarky with halves: half the labour to each good; utility √(c·w)
    const uAut = (L, lc, lw) => Math.sqrt((L / 2 / lc) * (L / 2 / lw));
    const uE0 = uAut(LE, o.eC, o.eW), uP0 = uAut(LP, o.pC, o.pW);
    // income in wine at a world price p (wine per cloth): each produces whatever is worth more
    const inc = (L, lc, lw, p) => Math.max(L / lc * p, L / lw);
    const util = (I, p) => Math.sqrt((I / 2 / p) * (I / 2));
    // market clearing with both specialised: cloth demand (cloths·p + wineIncome)/(2p) = cloths → p = wineIncome / cloths.
    // If that falls outside the band between the two autarky prices, one country makes both goods and p sits at its ratio.
    const lo = Math.min(autE, autP), hi = Math.max(autE, autP);
    let pe = lo;
    if (hi - lo > 1e-12) {
      const cloths = autE < autP ? LE / o.eC : LP / o.pC, wineInc = autE < autP ? LP / o.pW : LE / o.eW;
      pe = Math.min(hi, Math.max(lo, wineInc / cloths));
    }
    const p = o.p == null ? pe : o.p;
    const IE = inc(LE, o.eC, o.eW, p), IP = inc(LP, o.pC, o.pW, p);
    const uE = util(IE, p), uP = util(IP, p);
    const specE = LE / o.eC * p > LE / o.eW + 1e-9 ? 'cloth' : LE / o.eC * p < LE / o.eW - 1e-9 ? 'wine' : 'either';
    const specP = LP / o.pC * p > LP / o.pW + 1e-9 ? 'cloth' : LP / o.pC * p < LP / o.pW - 1e-9 ? 'wine' : 'either';
    return { autE, autP, pe, p, uE0, uP0, uE, uP, gE: uE / uE0 - 1, gP: uP / uP0 - 1, specE, specP, LE, LP };
  }

  /* ═════════ ch5 S − I = CA, and a tariff shock closed by the exchange rate ═════════
     All in % of GDP. ca = sPriv − inv − deficit. A tariff first cuts imports by m; the trade balance is then pulled back to
     the saving–investment gap by a real appreciation, at the IMF's average rate (2019): a 10% real move shifts the trade
     balance by about 1.2% of GDP over three years. We model the adjustment as exponential with a time constant of one year. */
  const BAL = { sPriv: 20, inv: 21, deficit: 2.6, nxPer10: 1.2, tau: 1 };
  function balance(o) { o = Object.assign({}, BAL, o || {}); return { ca: o.sPriv - o.inv - o.deficit, s: o.sPriv - o.deficit }; }
  function tariffShock(m, years, o) {
    o = Object.assign({}, BAL, o || {});
    const ca = balance(o).ca, f = Math.exp(-years / o.tau);
    const nx = ca + m * f;                         // the first-round improvement decays
    const appr = (m * (1 - f)) / o.nxPer10 * 10;   // real appreciation that has absorbed it, in %
    return { ca, nx, appr, apprFull: m / o.nxPer10 * 10 };
  }

  /* ═════════ ch6 diversion: buyers split spending between supplier C and supplier V (CES, elasticity σ) ═════════
     Before the tariff C's price is 1 and V's is 1 + kappa; weights are set so that C's share is s0.
     A tariff τ on C only; C's currency falls so that its dollar price drops by a fraction ψ of the tariff (in logs).
     The import composite faces demand with elasticity eta (1 = total import spending unchanged). */
  function divert(o) {
    o = Object.assign({ tau: 0.25, psi: 0, sigma: 4, kappa: 0.1, s0: 0.7, eta: 1 }, o || {});
    const s1m = 1 - o.sigma, pV = 1 + o.kappa;
    const aC = o.s0, aV = (1 - o.s0) / Math.pow(pV, s1m);     // so that aC·1^(1−σ) : aV·pV^(1−σ) = s0 : 1 − s0
    const P0 = Math.pow(aC + aV * Math.pow(pV, s1m), 1 / s1m);
    const L = Math.log(1 + o.tau);
    const pCstar = Math.exp(-o.psi * L), pC = pCstar * (1 + o.tau);  // C's own dollar price, duty-inclusive price
    const wC = aC * Math.pow(pC, s1m), wV = aV * Math.pow(pV, s1m);
    const sC = wC / (wC + wV), P1 = Math.pow(wC + wV, 1 / s1m);
    const dP = P1 / P0 - 1;
    const spend0 = 1, spend1 = Math.pow(P1 / P0, 1 - o.eta);      // total import spending (duty-inclusive), index
    const toC0 = o.s0, toC1 = spend1 * sC / (1 + o.tau);          // what C receives (its exports to us), duty excluded
    const toV0 = 1 - o.s0, toV1 = spend1 * (1 - sC);
    const rev = spend1 * sC * o.tau / (1 + o.tau);
    return { sC, dP, pC, pCstar, toC0, toC1, toV0, toV1, total0: toC0 + toV0, total1: toC1 + toV1, rev, spend1 };
  }

  /* ═════════ ch7 a chokepoint: a dominant supplier withholds part of its output from the rest of the world ═════════
     Market outside the controller, normalised: before, quantity 1 at price 1; the controller supplies share s.
     Demand Q = P^(−ed(t)); other suppliers Q = (1 − s)·P^(es(t)); both elasticities rise from a short-run to a long-run
     value with time constant T years. The controller ships s·(1 − cut). */
  const CHOKE = { s: 0.9, cut: 0.3, ed0: 0.2, ed1: 0.8, es0: 0.1, es1: 1.5, T: 3 };
  function chokeAt(years, o) {
    o = Object.assign({}, CHOKE, o || {});
    const w = 1 - Math.exp(-years / o.T), ed = o.ed0 + (o.ed1 - o.ed0) * w, es = o.es0 + (o.es1 - o.es0) * w;
    const ctrl = o.s * (1 - o.cut);
    const g = lp => -ed * lp - Math.log(ctrl + (1 - o.s) * Math.exp(es * lp)); // decreasing in lp; root = log price
    let a = 0, b = 20;
    if (g(0) <= 0) return { P: 1, ed, es, share: o.s, other: 1 - o.s, Q: 1, ctrlRev: o.s * (1 - o.cut) / o.s };
    while (g(b) > 0 && b < 200) b *= 2;
    for (let i = 0; i < 100; i++) { const m = (a + b) / 2; if (g(m) > 0) a = m; else b = m; }
    const lp = (a + b) / 2, P = Math.exp(lp), other = (1 - o.s) * Math.pow(P, es), Q = ctrl + other;
    return { P, ed, es, share: ctrl / Q, other, Q, ctrlRev: ctrl * P / o.s }; // controller's export revenue, before = 1
  }
  function chokePath(o, yrs, n) { const out = []; for (let i = 0; i <= n; i++) { const t = yrs * i / n; out.push([t, chokeAt(t, o)]); } return out; }

  /* ═════════ ch8 measuring pass-through on a synthetic, seeded panel of products ═════════
     Each product's log import price changes by g (common shock) + beta·log(1+τ_i) + noise; τ_i is 0 for half the
     products and 10% or 25% for the others. Retail: the import is a share theta of the shelf price, and a fraction
     absorb of the cost increase comes out of the retailer's margin. Two estimators: the treated goods' average change
     ("before/after"), and the OLS slope of the change on log(1+τ) across all products (difference-in-differences). */
  function ols(xs, ys) {
    const n = xs.length; let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; } mx /= n; my /= n;
    let sxx = 0, sxy = 0; for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
    const b = sxy / sxx, a = my - b * mx; let sse = 0; for (let i = 0; i < n; i++) sse += (ys[i] - a - b * xs[i]) ** 2;
    return { a, b, se: Math.sqrt(sse / (n - 2) / sxx) };
  }
  function passthru(o) {
    o = Object.assign({ n: 400, beta: 1, g: 0.03, noise: 0.08, theta: 0.3, absorb: 0, seed: 7 }, o || {});
    const r = rng(o.seed), pts = [];
    for (let i = 0; i < o.n; i++) {
      const tau = i % 2 ? (r() < 0.5 ? 0.10 : 0.25) : 0;
      const x = Math.log(1 + tau);
      const border = o.g + o.beta * x + o.noise * normal(r);
      const retail = o.g + o.theta * (1 - o.absorb) * o.beta * x + o.noise * 0.5 * normal(r);
      pts.push({ tau, x, border, retail });
    }
    const T = pts.filter(p => p.tau > 0);
    const naive = T.reduce((s, p) => s + p.border, 0) / T.reduce((s, p) => s + p.x, 0);  // treated: Σ change / Σ log wedge
    const fb = ols(pts.map(p => p.x), pts.map(p => p.border)), fr = ols(pts.map(p => p.x), pts.map(p => p.retail));
    return { pts, naive, border: fb, retail: fr, complete: o.theta, o };
  }

  /* ═════════ the frontier: dated, sourced figures the prose quotes (BRIEF.md has the URLs) ═════════ */
  const FRONTIER = {
    arw: { taxPerMonth: 3.2, dwlPerMonth: 1.4 },                          // $bn per month, 2018 (JEP 2019)
    fgkk: { loss: 51, lossGdp: 0.27, net: 7.2, netGdp: 0.04 },           // $bn and % of GDP, 2018 (QJE 2020)
    washers: { rise: 12 },                                               // % (AER 2020)
    gn: { pt2018: 80, pt2025: 94, statutory: 27.4, applied: 14.1 },      // % (NBER w34620; Sept 2025 rates)
    fk: { pt: 90, avg2024: 2.4, avg2025: 9.6, welfLo: -0.13, welfHi: 0.10, retal: -0.34, revShare: 4.9, chinaShare17: 23, chinaShare25: 7, dutyFree: 57 }, // BPEA Spring 2026
    fed: { coreGoods: 3.1, corePce: 0.8 },                               // % through Feb 2026 (FEDS Note, 2026-04-08)
    clv: { retail: 24, months: 7 },                                      // % of applied tariff, retail (Cavallo, Llamas, Vazquez 2026)
    freund: { absorbed: 47, dominantLo: 50, dominantHi: 65 },            // % (CEPR DP21798, 2026)
    bea: { ca2025: 1.12, caGdp2025: 3.6, caGdp2024: 4.0 },               // $tn, % of GDP (BEA, 2026-03-25)
    china: { surplus2025: 1.19, surplus2024: 0.992 },                    // $tn goods trade (China customs, 2026-01-14)
    iea: { mined: 60, refined: 91, magnets: 95, refined2025: 85 },       // % China, magnet rare earths, 2024 (IEA)
    imf: { per10: 1.2 }                                                  // % of GDP per 10% real depreciation over 3 years (IMF blog 2019-08-21)
  };

  return { fmt, signed, rng, normal, elastic, incidence, LEDGER, ledger, optimalTariff, retal, retalMatrix, RICARDO, ricardo, BAL, balance, tariffShock, divert, CHOKE, chokeAt, chokePath, ols, passthru, FRONTIER };
}));
