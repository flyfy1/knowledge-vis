/* How an Economy Is Measured: pure economic models & dated frontier block (UMD, no DOM, no CJK). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root.EconData || null);
  else root.EconModels = factory(root.EconData || null);
}(typeof self !== 'undefined' ? self : this, function (browserData) {
  'use strict';
  const D = browserData || (typeof require === 'function' ? require('./data.js') : null);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── 1 · GDP three ways: Farm -> Mill -> Bakery + Oven + Trade + Home ───────── */
  const gdp3 = {
    P: { wheat: 30, flour: 55, bread: 100, oven: 20, exports: 0, imports: 0, homeShift: 0, homeBase: 30, depr: 12 },
    compute(p) {
      const P = Object.assign({}, gdp3.P, p);
      const wheat = clamp(P.wheat, 5, 50);
      const flour = Math.max(wheat + 5, P.flour);
      const bread = Math.max(flour + 10, P.bread);
      const oven = clamp(P.oven, 0, 40);
      const exports = clamp(P.exports, 0, Math.min(40, bread * 0.5));
      const imports = clamp(P.imports, 0, 40);
      const homeShift = clamp(P.homeShift, 0, P.homeBase);

      const breadSales = bread + homeShift;
      const grossOutput = wheat + flour + breadSales + oven;

      const vaFarm = wheat;
      const vaMill = flour - wheat;
      const vaBakery = breadSales - flour;
      const vaEquip = oven;
      const gdpProd = vaFarm + vaMill + vaBakery + vaEquip;

      const C = (breadSales - exports) + imports;
      const I = oven;
      const NX = exports - imports;
      const gdpExp = C + I + NX;

      const wageShare = 0.65;
      const wages = gdpProd * wageShare;
      const profits = gdpProd - wages;
      const gdpInc = wages + profits;

      const unpaidHome = P.homeBase - homeShift;
      const ndp = gdpProd - P.depr;
      const doubleCount = grossOutput - gdpProd;

      return {
        wheat, flour, bread, breadSales, oven, exports, imports, homeShift,
        grossOutput, doubleCount,
        vaFarm, vaMill, vaBakery, vaEquip, gdpProd,
        C, I, NX, gdpExp,
        wages, profits, gdpInc,
        unpaidHome, ndp, depr: P.depr,
        totalBreadConsumed: bread + P.homeBase
      };
    }
  };

  /* ───────── 2 · Nominal vs Real: Laspeyres, Paasche, Fisher, Chained & CES true index ─────────
   * Two goods over t = 0, 1, 2:
   * Good A (Compute/Tech): pA(t) = 100*(1 - techDrop/100)^t
   * Good B (Services):     pB(t) = 100*(1 + svcRise/100)^t
   * Real utility grows at g = 3%/yr; CES elasticity sigma controls quantity substitution.
   * At t = 0: spend 200 on A (qA0 = 2), 800 on B (qB0 = 8) -> nominal Y0 = 1000, alpha = 0.2. */
  const indexes = {
    P: { techDrop: 25, svcRise: 6, sigma: 1.5, gReal: 0.03, importShare: 0 },
    compute(p) {
      const P = Object.assign({}, indexes.P, p);
      const d = clamp(P.techDrop, 0, 50) / 100;
      const s = clamp(P.svcRise, 0, 12) / 100;
      const sig = clamp(P.sigma, 0, 2.5);
      const alpha = 0.2;
      const rows = [];
      for (let t = 0; t <= 2; t++) {
        const pA = 100 * Math.pow(1 - d, t);
        const pB = 100 * Math.pow(1 + s, t);
        // CES cost-of-living index P_true(t), base t=0 = 1
        let pTrue;
        if (Math.abs(sig - 1) < 1e-4) {
          pTrue = Math.pow(pA / 100, alpha) * Math.pow(pB / 100, 1 - alpha);
        } else {
          pTrue = Math.pow(alpha * Math.pow(pA / 100, 1 - sig) + (1 - alpha) * Math.pow(pB / 100, 1 - sig), 1 / (1 - sig));
        }
        const U = 10 * Math.pow(1 + P.gReal, t); // base utility normalized to Y0 = 1000 (100 * U0)
        // Hicksian/Marshallian quantities given real utility U*100 and prices (pA, pB):
        // Expenditure E = 100 * U * pTrue; share_A = alpha * (pA/100 / pTrue)^(1 - sigma)
        const E = 100 * U * pTrue;
        const shareA = alpha * Math.pow((pA / 100) / pTrue, 1 - sig);
        const qA = (E * shareA) / pA;
        const qB = (E * (1 - shareA)) / pB;
        rows.push({ t, pA, pB, qA, qB, nom: pA * qA + pB * qB, pTrue: pTrue * 100 });
      }
      const pair = (a, b) => {
        const numL = b.pA * a.qA + b.pB * a.qB, denL = a.pA * a.qA + a.pB * a.qB;
        const numP = b.pA * b.qA + b.pB * b.qB, denP = a.pA * b.qA + a.pB * b.qB;
        const L = numL / denL, Pp = numP / denP, F = Math.sqrt(L * Pp);
        return { L, P: Pp, F };
      };
      const r01 = pair(rows[0], rows[1]);
      const r12 = pair(rows[1], rows[2]);
      const r02 = pair(rows[0], rows[2]);

      const series = [
        { t: 0, nom: rows[0].nom, L: 100, P: 100, F: 100, chainF: 100, trueP: 100,
          realL: rows[0].nom, realP: rows[0].nom, realF: rows[0].nom, realChain: rows[0].nom, realTrue: rows[0].nom },
        { t: 1, nom: rows[1].nom, L: 100 * r01.L, P: 100 * r01.P, F: 100 * r01.F, chainF: 100 * r01.F, trueP: rows[1].pTrue,
          realL: rows[1].nom / r01.L, realP: rows[1].nom / r01.P, realF: rows[1].nom / r01.F, realChain: rows[1].nom / r01.F, realTrue: rows[1].nom / (rows[1].pTrue / 100) },
        { t: 2, nom: rows[2].nom, L: 100 * r02.L, P: 100 * r02.P, F: 100 * r02.F, chainF: 100 * r01.F * r12.F, trueP: rows[2].pTrue,
          realL: rows[2].nom / r02.L, realP: rows[2].nom / r02.P, realF: rows[2].nom / r02.F, realChain: rows[2].nom / (r01.F * r12.F), realTrue: rows[2].nom / (rows[2].pTrue / 100) }
      ];
      // GDP Deflator vs CPI divergence when Good A is partly imported:
      // Domestic production excludes imported share of Good A, whereas CPI covers all household consumption.
      const imp = clamp(P.importShare, 0, 1);
      const cpiY2 = series[2].L; // fixed-weight household CPI
      // Domestic deflator excludes imported share of Good A (re-weighted domestic Paasche)
      const qA2d = rows[2].qA * (1 - imp);
      const defY2 = 100 * (rows[2].pA * qA2d + rows[2].pB * rows[2].qB) / (rows[0].pA * qA2d + rows[0].pB * rows[2].qB);
      return {
        rows, series,
        pL2: series[2].L, pP2: series[2].P, pF2: series[2].F, pChain2: series[2].chainF, pTrue2: series[2].trueP,
        subBiasPP: series[2].L - series[2].F,
        realGrowthNom: (rows[2].nom / rows[0].nom - 1) * 100,
        realGrowthL: (series[2].realL / series[0].realL - 1) * 100,
        realGrowthF: (series[2].realChain / series[0].realChain - 1) * 100,
        realGrowthTrue: (series[2].realTrue / series[0].realTrue - 1) * 100,
        cpiY2, defY2
      };
    }
  };

  /* ───────── 3 · CPI in practice: weights, OER, hedonic quality & core vs headline ───────── */
  const cpi = {
    P: { wShelter: 36, wEnergy: 7, energyShock: 12, hedonic: true, oerOn: true, hedonicGain: 12 },
    BASE: {
      shelterRate: 5.0,
      foodW: 14, foodRate: 3.0,
      techW: 13, techSticker: 0.0,
      otherRate: 3.0
    },
    BOSKIN: { subUpper: 0.15, subLower: 0.25, outlet: 0.10, quality: 0.60, total: 1.10, lebowRudd: 0.9 },
    compute(p) {
      const P = Object.assign({}, cpi.P, p), B = cpi.BASE;
      // Official basket (US-like weights: 36 shelter, 14 food, 7 energy, 13 tech/durables, 30 other)
      const offTechRate = P.hedonic ? (B.techSticker - P.hedonicGain) : B.techSticker;
      const offShelterW = P.oerOn ? 36 : 12; // if OER excluded, only ~12% tenant rent remains
      const offOtherW = 100 - (offShelterW + B.foodW + 7 + B.techW);
      const offHeadline = (offShelterW * B.shelterRate + B.foodW * B.foodRate + 7 * P.energyShock + B.techW * offTechRate + offOtherW * B.otherRate) / 100;
      const offCoreDenom = offShelterW + B.techW + offOtherW;
      const offCore = (offShelterW * B.shelterRate + B.techW * offTechRate + offOtherW * B.otherRate) / offCoreDenom;

      // Personal basket: reader adjusts shelter weight (0..60) & energy weight (0..25); remainder scaled proportionally
      const uSh = clamp(P.wShelter, 0, 60);
      const uEn = clamp(P.wEnergy, 0, 25);
      const rem = Math.max(1, 100 - uSh - uEn);
      const baseRem = B.foodW + B.techW + 30;
      const uFood = rem * B.foodW / baseRem;
      const uTech = rem * B.techW / baseRem;
      const uOther = rem * 30 / baseRem;
      const personal = (uSh * B.shelterRate + uFood * B.foodRate + uEn * P.energyShock + uTech * offTechRate + uOther * B.otherRate) / 100;

      // Hedonic impact (percentage points added when quality adjustment is turned off)
      const hedonicDiffPP = (B.techW * P.hedonicGain) / 100;
      const oerExcludedCPI = (12 * B.shelterRate + B.foodW * B.foodRate + 7 * P.energyShock + B.techW * offTechRate + (100 - 12 - B.foodW - 7 - B.techW) * B.otherRate) / 100;
      const oerIncludedCPI = (36 * B.shelterRate + B.foodW * B.foodRate + 7 * P.energyShock + B.techW * offTechRate + 30 * B.otherRate) / 100;

      return {
        offHeadline, offCore, personal,
        gapPersonal: personal - offHeadline,
        hedonicDiffPP,
        oerDiffPP: oerIncludedCPI - oerExcludedCPI,
        weights: { shelter: uSh, food: uFood, energy: uEn, tech: uTech, other: uOther },
        rates: { shelter: B.shelterRate, food: B.foodRate, energy: P.energyShock, tech: offTechRate, other: B.otherRate }
      };
    }
  };

  /* ───────── 4 · Growth-rate traps: annualised q/q vs y/y, base effects, seasonal adj, vintages ───────── */
  const growthTraps = {
    P: { dip: -4.0, rebound: 2.0, baseQQ: 0.5, seasonAmp: 6.0, shiftQ4: 0 },
    baseEffects(p) {
      const P = Object.assign({}, growthTraps.P, p);
      // 12 quarters: Q1..Q4 steady at baseQQ; Q5 = dip; Q6 = rebound; Q7..Q12 back to baseQQ.
      // Index starts at 100 at Q0 (so y/y starts at Q4 or extend 4 pre-quarters at baseQQ).
      const qq = [];
      for (let i = 0; i < 16; i++) {
        if (i === 8) qq.push(P.dip);
        else if (i === 9) qq.push(P.rebound);
        else qq.push(P.baseQQ);
      }
      const level = [100];
      for (let i = 0; i < 16; i++) level.push(level[i] * (1 + qq[i] / 100));
      // Output quarters Q1..Q12 corresponding to index indices 5..16 (so Q5 shock is index 9, 1 yr later is index 13)
      const series = [];
      for (let k = 0; k < 12; k++) {
        const idx = k + 5;
        const gq = qq[idx - 1];
        const qqSAAR = (Math.pow(1 + gq / 100, 4) - 1) * 100;
        const yy = (level[idx] / level[idx - 4] - 1) * 100;
        series.push({ q: k + 1, level: level[idx], qq: gq, qqSAAR, yy });
      }
      // Shock occurs at q = 4 (k=3, idx=8 -> wait: qq[8] is idx=9 which is k=4 -> Q5!)
      // Let's verify: k=4 is idx=9 -> qq[8] = dip -> Q5! One year later is Q9 (k=8, idx=13).
      return {
        series,
        qShock: series[4], // Q5
        qRebound: series[5], // Q6
        qEcho: series[8], // Q9 (4 quarters after Q5)
        steadySAAR: (Math.pow(1 + P.baseQQ / 100, 4) - 1) * 100
      };
    },
    seasonal(p) {
      const P = Object.assign({}, growthTraps.P, p);
      const amp = clamp(P.seasonAmp, 0, 12) / 100;
      const shift = clamp(P.shiftQ4, -4, 4) / 100;
      // 20 quarters (5 years): underlying trend 0.6%/q; normal seasonal factors Q1=-amp, Q2=+0.15*amp, Q3=+0.15*amp, Q4=+0.7*amp
      // Wait: make multiplicative seasonal pattern exact mean ~ 1: [-amp, +0.2*amp, +0.2*amp, +amp*0.6]? Even cleaner:
      // [-1.0*amp, +0.1*amp, -0.1*amp, +1.0*amp] -> sum = 0!
      const baseSF = [-amp, 0.1 * amp, -0.1 * amp, amp];
      const nsa = [], trueTrend = [];
      let tr = 100;
      for (let t = 0; t < 20; t++) {
        if (t > 0) tr *= 1.006;
        const q = t % 4;
        let sf = 1 + baseSF[q];
        // In the final year (t >= 16), apply seasonal timing shift (e.g. spending pulled from Q4 into Q3)
        if (t === 18) sf += shift;
        if (t === 19) sf -= shift;
        trueTrend.push(tr);
        nsa.push(tr * sf);
      }
      // Classical 2x4 centered moving average (for t = 2 .. 17)
      const cma = new Array(20).fill(null);
      for (let t = 2; t < 18; t++) {
        cma[t] = (0.5 * nsa[t - 2] + nsa[t - 1] + nsa[t] + nsa[t + 1] + 0.5 * nsa[t + 2]) / 4;
      }
      const ratios = [[], [], [], []];
      for (let t = 2; t < 18; t++) ratios[t % 4].push(nsa[t] / cma[t]);
      const avgR = ratios.map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);
      const meanR = avgR.reduce((a, b) => a + b, 0) / 4;
      const estSF = avgR.map(r => r / meanR);
      const sa = nsa.map((v, t) => v / estSF[t % 4]);

      const pts = [];
      for (let t = 1; t < 20; t++) {
        const nsaQQ = (Math.pow(nsa[t] / nsa[t - 1], 4) - 1) * 100;
        const saQQ = (Math.pow(sa[t] / sa[t - 1], 4) - 1) * 100;
        const trueQQ = (Math.pow(1.006, 4) - 1) * 100;
        pts.push({ t, label: `Y${Math.floor(t / 4) + 1}Q${(t % 4) + 1}`, nsa: nsa[t], sa: sa[t], nsaQQ, saQQ, trueQQ });
      }
      // Last Q1 (t=16, Y5Q1) and last Q4 (t=19, Y5Q4)
      return {
        pts,
        estSF,
        y4q1NsaQQ: pts[11].nsaQQ, // t=12 -> Y4Q1
        y4q1SaQQ: pts[11].saQQ,
        y5q4NsaQQ: pts[18].nsaQQ, // t=19 -> Y5Q4
        y5q4SaQQ: pts[18].saQQ
      };
    },
    vintages() {
      return D ? D.revisions : null;
    }
  };

  /* ───────── 5 · Comparing countries: Balassa-Samuelson PPP & Lorenz/Gini ───────── */
  const compare = {
    P: { aT: 0.35, aN: 0.60, gamma: 0.35, topShare: 35, growth: 20, topHeavy: true },
    IMF2026: [
      { code: 'US', nomT: 32.64, pppT: 32.64 },
      { code: 'CN', nomT: 21.55, pppT: 44.55 },
      { code: 'IN', nomT: 4.06, pppT: 19.19 }
    ],
    ppp(p) {
      const P = Object.assign({}, compare.P, p);
      const aT = clamp(P.aT, 0.10, 1.50);
      const aN = clamp(P.aN, 0.20, 1.50);
      const g = clamp(P.gamma, 0.20, 0.60);
      // Benchmark country F: aT* = 1, aN* = 1 -> w* = 1, pT* = 1, pN* = 1, P* = 1.
      // Home country: wage w = aT (pinned by tradables law of one price pT = 1),
      // non-tradable price pN = w / aN = aT / aN.
      // Aggregate price level relative to F: P_H = (1)^g * (aT / aN)^(1 - g).
      const w = aT;
      const pT = 1.0;
      const pN = aT / aN;
      const priceLevel = Math.pow(pN, 1 - g);
      // Suppose 50% of workers in T, 50% in N (or Cobb-Douglas real expenditure share g in T, 1-g in N):
      // Nominal GDP per worker in FX = w = aT.
      // Real GDP per worker in PPP = Nominal / priceLevel = aT / (aT/aN)^(1-g) = aT^g * aN^(1-g).
      const gdpFX = aT * 100;
      const gdpPPP = (aT / priceLevel) * 100;
      const pppBoost = gdpPPP / gdpFX;
      return { aT, aN, g, w, pT, pN, priceLevel, gdpFX, gdpPPP, pppBoost };
    },
    lorenz(p) {
      const P = Object.assign({}, compare.P, p);
      const top = clamp(P.topShare, 20, 65) / 100;
      const growth = clamp(P.growth, 0, 60) / 100;
      // Baseline 10 deciles (sum = 1000, mean = 100): smooth power curve adjusted so top decile = top
      // Construct 9 lower deciles with progressive weights w_1..w_9 summing to (1 - top)
      const base9 = [1, 1.6, 2.2, 2.9, 3.7, 4.6, 5.7, 7.0, 9.0];
      const sum9 = base9.reduce((a, b) => a + b, 0);
      const shares0 = base9.map(w => w * (1 - top) / sum9);
      shares0.push(top);

      const baseTotal = 1000;
      const dec0 = shares0.map(s => s * baseTotal);
      // Apply growth: either broad-based (everyone * (1+growth)) or top-heavy (90% of extra income goes to top 2 deciles, 10% to rest)
      const extra = baseTotal * growth;
      let dec1;
      if (!P.topHeavy) {
        dec1 = dec0.map(v => v * (1 + growth));
      } else {
        const wExtra = [0.005, 0.008, 0.01, 0.012, 0.014, 0.016, 0.017, 0.018, 0.25, 0.65];
        dec1 = dec0.map((v, i) => v + extra * wExtra[i]);
      }

      const stats = (arr) => {
        const tot = arr.reduce((a, b) => a + b, 0);
        const mean = tot / arr.length;
        // Median of 10 decile group averages: midpoint between decile 5 (index 4) and decile 6 (index 5)
        const median = (arr[4] + arr[5]) / 2;
        const pts = [[0, 0]];
        let cum = 0;
        for (let i = 0; i < arr.length; i++) {
          cum += arr[i] / tot;
          pts.push([(i + 1) / arr.length, cum]);
        }
        // Trapezoidal area under Lorenz curve
        let area = 0;
        for (let i = 1; i < pts.length; i++) {
          area += (pts[i][0] - pts[i - 1][0]) * (pts[i][1] + pts[i - 1][1]) / 2;
        }
        const gini = 1 - 2 * area;
        return { deciles: arr, mean, median, gini, pts, ratio: mean / median };
      };
      const s0 = stats(dec0), s1 = stats(dec1);
      return {
        before: s0,
        after: s1,
        meanPct: (s1.mean / s0.mean - 1) * 100,
        medianPct: (s1.median / s0.median - 1) * 100,
        giniDelta: s1.gini - s0.gini
      };
    }
  };

  /* ───────── 6 · Labour market: U-3..U-6, Beveridge curve & Okun OLS ───────── */
  const labour = {
    P: { discouraged: 0, partTime: 0, matchEff: 1.0, era: 'all' },
    // Initial working-age 1000 matching US Oct 2026 ballpark: E=594 (incl 13 PT), U=25, N=381 (incl 12 M)
    BASE: { E: 594, U: 25, M: 12, PT: 13, N: 381 },
    defs(p) {
      const P = Object.assign({}, labour.P, p), B = labour.BASE;
      const disc = clamp(P.discouraged, 0, 18);
      const ptAdd = clamp(P.partTime, 0, 40);
      const U = B.U - disc;
      const M = B.M + disc;
      const E = B.E;
      const PT = B.PT + ptAdd;
      const N = B.N + disc;
      const LF = E + U;
      const pop = E + U + N;
      const u3 = (U / LF) * 100;
      const u6 = ((U + M + PT) / (LF + M)) * 100;
      const lfpr = (LF / pop) * 100;
      const epop = (E / pop) * 100;
      return { E, U, M, PT, N, LF, pop, u3, u6, lfpr, epop };
    },
    beveridge(p) {
      const P = Object.assign({}, labour.P, p);
      const A = clamp(P.matchEff, 0.6, 1.4);
      // Steady-state Beveridge curve from Cobb-Douglas matching M = A * U^0.5 * V^0.5, separation rate s = 2.6
      // With labor force normalized, steady-state inflows s = outflows A * sqrt(u * v) -> v = (s / A)^2 / u
      // Scale so at A=1, u=4.0%, v=4.5% -> (s/A)^2 = 18.0
      const k = Math.pow(Math.sqrt(18.0) / A, 2);
      const curve = [];
      for (let u = 2.0; u <= 15.0; u += 0.25) curve.push([u, k / u]);
      const raw = D ? D.beveridge : [];
      return { curve, data: raw, A, k, vAt4: k / 4 };
    },
    okun(p) {
      const P = Object.assign({}, labour.P, p);
      const raw = D ? D.okun : [];
      const filt = raw.filter(([q]) => {
        const y = +q.slice(0, 4);
        if (P.era === 'pre') return y <= 2019;
        if (P.era === 'gfc') return y >= 2008 && y <= 2019;
        if (P.era === 'post') return y >= 2020;
        return true;
      });
      const n = filt.length || 1;
      const mx = filt.reduce((s, r) => s + r[1], 0) / n;
      const my = filt.reduce((s, r) => s + r[2], 0) / n;
      let num = 0, den = 0, sy = 0;
      for (const [, gx, du] of filt) {
        num += (gx - mx) * (du - my);
        den += (gx - mx) * (gx - mx);
        sy += (du - my) * (du - my);
      }
      const slope = den > 0 ? num / den : 0;
      const intercept = my - slope * mx;
      const r2 = (den > 0 && sy > 0) ? (num * num) / (den * sy) : 0;
      const zeroGrowth = slope !== 0 ? -intercept / slope : 0;
      return { pts: filt, n, slope, intercept, r2, zeroGrowth, era: P.era };
    }
  };

  /* ───────── 7 · The business cycle: Sahm rule & potential output gap ───────── */
  const cycle = {
    P: { thresh: 0.50, window: 'all' },
    sahm(p) {
      const P = Object.assign({}, cycle.P, p);
      const S = D ? D.sahm : null;
      if (!S) return null;
      const u = S.u, rec = S.rec;
      const y0 = +S.start.slice(0, 4), m0 = +S.start.slice(5, 7) - 1;
      const ym = idx => {
        const tm = y0 * 12 + m0 + idx;
        return Math.floor(tm / 12) + '-' + String((tm % 12) + 1).padStart(2, '0');
      };
      const ma3 = u.map((_, i) => {
        if (i < 2 || u[i] == null) return null;
        const vals = [u[i], u[i - 1], u[i - 2]].filter(v => v != null);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      });
      const out = [];
      for (let i = 14; i < u.length; i++) {
        if (ma3[i] == null) continue;
        let min12 = Infinity;
        for (let k = 1; k <= 12; k++) if (ma3[i - k] != null && ma3[i - k] < min12) min12 = ma3[i - k];
        if (!Number.isFinite(min12)) continue;
        const val = ma3[i] - min12;
        const date = ym(i);
        if (date >= '1960-01') out.push({ date, u: u[i], sahm: val, rec: rec[i] });
      }
      // Count distinct trigger episodes at threshold P.thresh
      const triggers = [];
      let active = false;
      for (let i = 0; i < out.length; i++) {
        const hit = out[i].sahm >= P.thresh - 1e-9;
        if (hit && !active) {
          // Check if recession occurs within [-3, +12] months
          let inRec = false;
          for (let j = Math.max(0, i - 3); j <= Math.min(out.length - 1, i + 12); j++) {
            if (out[j].rec === 1) inRec = true;
          }
          triggers.push({ date: out[i].date, sahm: out[i].sahm, inRec });
        }
        active = hit;
      }
      const falsePositives = triggers.filter(t => !t.inRec);
      const view = P.window === 'recent' ? out.filter(r => r.date >= '2018-01') : out;
      return {
        series: view, all: out, triggers, falsePositives,
        latest: out[out.length - 1],
        realtime2024: S.realtime2024
      };
    },
    REBASE_2012_TO_2017: 1.07944, // BEA NIPA Table 1.1.9 2017 avg GDP deflator (2012 = 100)
    gap() {
      const raw = D ? D.gapSeries : [];
      const k = cycle.REBASE_2012_TO_2017;
      const pts = raw.map(([q, act, pot26, pot19Raw]) => {
        const pot19 = pot19Raw ? pot19Raw * k : null;
        return {
          q, act, pot26, pot19, pot19Raw,
          gap26: pot26 ? ((act / pot26 - 1) * 100) : null,
          gap19: pot19 ? ((act / pot19 - 1) * 100) : null
        };
      });
      const q19 = pts.find(r => r.q === '2019Q4');
      const latest = pts[pts.length - 1];
      return { pts, q19, latest, rebaseFactor: k };
    }
  };

  /* ───────── 8 · Productivity: Solow growth accounting & TFP residual ───────── */
  const solow = {
    P: { y0: 1995, y1: 2005, alphaMode: 'auto', alpha: 0.38, adjustHC: false },
    compute(p) {
      const P = Object.assign({}, solow.P, p);
      const rows = D ? D.solow : [];
      const y0 = clamp(Math.round(P.y0), 1960, 2022);
      const y1 = clamp(Math.round(P.y1), y0 + 1, 2023);
      const r0 = rows.find(r => r[0] === y0);
      const r1 = rows.find(r => r[0] === y1);
      if (!r0 || !r1) return null;
      const dt = y1 - y0;
      const gY = (Math.log(r1[1] / r0[1]) / dt) * 100;
      const gK = (Math.log(r1[2] / r0[2]) / dt) * 100;
      const gL = (Math.log(r1[3] / r0[3]) / dt) * 100;
      const pwtTFP = (Math.log(r1[4] / r0[4]) / dt) * 100;
      const autoAlpha = 1 - (r0[5] + r1[5]) / 2;
      const alpha = P.alphaMode === 'auto' ? autoAlpha : clamp(P.alpha, 0.20, 0.60);
      const capContrib = alpha * gK;
      const labContrib = (1 - alpha) * gL;
      const rawTFP = gY - capContrib - labContrib;
      const rawTFP_auto = gY - autoAlpha * gK - (1 - autoAlpha) * gL;
      // Hold PWT human-capital contribution fixed from era factor shares so manual alpha shifts pure TFP cleanly
      const hcContrib = P.adjustHC ? (rawTFP_auto - pwtTFP) : 0;
      const tfpShown = rawTFP - hcContrib;
      return {
        y0, y1, dt, alpha, autoAlpha,
        gY, gK, gL, capContrib, labContrib, hcContrib,
        rawTFP, pwtTFP, tfpShown,
        gLP: gY - gL, // labour productivity growth = gY - gL
        tfpSharePct: gY !== 0 ? (tfpShown / gY) * 100 : 0
      };
    }
  };

  /* ───────── 9 · What GDP leaves out: boundary & depreciation explorer ───────── */
  const beyond = {
    P: { marketize: 0, disaster: 0, showDepr: false, showEnv: false },
    BASE: { marketGDP: 100, homeTotal: 23, depr: 14, envCost: 4 },
    compute(p) {
      const P = Object.assign({}, beyond.P, p), B = beyond.BASE;
      const m = clamp(P.marketize, 0, B.homeTotal);
      const dis = clamp(P.disaster, 0, 20);
      const rebuild = 0.8 * dis;
      const gdp = B.marketGDP + m + rebuild;
      const unpaidHome = B.homeTotal - m;
      const deprTotal = B.depr + dis;
      const adj = gdp + unpaidHome - (P.showDepr ? deprTotal : 0) - (P.showEnv ? B.envCost : 0);
      // Pure total welfare-proxy keeping home + market services and deducting capital loss + env if toggled
      const netWealthDelta = rebuild - dis;
      return {
        gdp, unpaidHome,
        totalServices: gdp + unpaidHome - rebuild, // always 123 regardless of m!
        deprTotal, envCost: P.showEnv ? B.envCost : 0,
        rebuild, disaster: dis, netWealthDelta,
        adjusted: adj,
        gap: adj - gdp
      };
    }
  };

  /* ───────── 10 · Frontier: GDP-B & Survey Nonresponse + Dated Snapshot (as of 2026-11-13) ───────── */
  const FRONTIER = {
    asOf: '2026-11-13',
    us: D ? D.usLatest : {
      gdpDate: '2026Q3', gdpYY: 2.07, gdpQQSAAR: 3.37,
      cpiDate: '2026-10', cpiYY: 4.08, coreCpiYY: 2.87,
      pceDate: '2026-09', pceYY: 3.65, corePceYY: 3.12,
      gdpDefYY: 3.73, u3Date: '2026-10', u3: 4.1, u6: 7.9, lfpr: 61.9,
      prodDate: '2026Q3', prodYY: 2.06, sahmLatest: 0
    },
    economies: [
      { id: 'us', gdpDate: '2026Q3', gdpGrowth: 2.07, gdpNote: 'qq337', inflDate: '2026-10', infl: 4.08, inflIdx: 'CPI', inflAlt: 3.12, uDate: '2026-10', u: 4.1, uDef: 'U-3', prod: 2.06, rev: 1.3 },
      { id: 'cn', gdpDate: '2026Q3', gdpGrowth: 4.5, gdpNote: 'ytd46', inflDate: '2026-10', infl: 0.7, inflIdx: 'CPI', inflAlt: null, uDate: '2026-09', u: 5.2, uDef: 'urban', prod: null, rev: null },
      { id: 'ez', gdpDate: '2026 proj', gdpGrowth: 1.3, gdpNote: 'imf', inflDate: '2026-10', infl: 4.0, inflIdx: 'HICP', inflAlt: null, uDate: '2026-09', u: 6.5, uDef: 'ILO', prod: null, rev: null },
      { id: 'jp', gdpDate: '2026 proj', gdpGrowth: 0.7, gdpNote: 'imf', inflDate: '2026-10', infl: 2.8, inflIdx: 'TokyoCPI', inflAlt: 2.6, uDate: '2026-09', u: 2.4, uDef: 'LFS', prod: null, rev: null },
      { id: 'in', gdpDate: '2026 proj', gdpGrowth: 7.0, gdpNote: 'imf', inflDate: '2026-10', infl: 6.09, inflIdx: 'CPI', inflAlt: null, uDate: '2026Q3', u: 5.1, uDef: 'PLFS', prod: null, rev: null }
    ],
    nowcast: { gdpNowQ4: '3.4–3.5', nyFedQ4: 2.9 },
    survey: { joltsPriorHigh: 65, joltsRecentLow: 33, cpsShutdownMonth: '2025-10' },
    sna2025Date: '2025-03'
  };

  const frontierModel = {
    P: { respRate: 35, nonrespBias: 1.5 },
    surveyError(p) {
      const P = Object.assign({}, frontierModel.P, p);
      const r = clamp(P.respRate, 20, 90) / 100;
      const nTarget = 1000, sigma = 10;
      const nActual = nTarget * r;
      const se = sigma / Math.sqrt(nActual);
      const bias = (1 - r) * clamp(P.nonrespBias, 0, 4);
      const rmse = Math.sqrt(se * se + bias * bias);
      return { respPct: r * 100, nActual, se, bias, rmse };
    }
  };

  return {
    clamp,
    data: D,
    gdp3,
    indexes,
    cpi,
    growthTraps,
    compare,
    labour,
    cycle,
    solow,
    beyond,
    frontierModel,
    FRONTIER
  };
}));
