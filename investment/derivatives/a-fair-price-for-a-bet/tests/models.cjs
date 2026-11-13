'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DIR = path.resolve(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    console.error('FAIL:', name);
    throw err;
  }
}

function approx(a, b, tol, msg) {
  assert(Math.abs(a - b) <= tol, `${msg || 'mismatch'}: got ${a}, expected ${b} (±${tol})`);
}

/* ── 1. Forward Cost of Carry ── */
check('Forward fair price & cash-and-carry arbitrage lock', () => {
  const d = M.forward.compute({ S0: 100, rPct: 4, qPct: 1, T: 1, Fquote: 108 });
  approx(d.Ffair, 100 * Math.exp(0.03), 1e-10, 'F*');
  approx(d.Ffair, 103.04545, 1e-4, 'F* default');
  approx(d.arbProfitT, 4.95455, 1e-4, 'arb profit');
  assert.strictEqual(d.regime, 'overpriced');

  // Cash-and-carry payoff independence across arbitrary terminal ST
  [40, 100, 180].forEach((ST) => {
    const spotVal = d.sharesToday * Math.exp(d.q * d.T) * ST; // 1.0 share
    const shortFwd = d.Fquote - ST;
    const netT = spotVal + shortFwd - d.repayT;
    approx(netT, d.arbProfitT, 1e-9, 'locked profit at ST=' + ST);
  });

  const dUnder = M.forward.compute({ S0: 100, rPct: 4, qPct: 1, T: 1, Fquote: 98 });
  assert.strictEqual(dUnder.regime, 'underpriced');
  approx(dUnder.arbProfitT, 5.04545, 1e-4, 'underpriced profit');
});

/* ── 2. Put-Call Parity & Strategy Payoffs ── */
check('Put-call parity < 1e-10 across parameters', () => {
  const cases = [
    { S0: 100, K: 100, rPct: 4, qPct: 1, T: 1, sigmaPct: 20 },
    { S0: 112, K: 95, rPct: 6, qPct: 2.5, T: 0.5, sigmaPct: 35 },
    { S0: 85, K: 120, rPct: 1.5, qPct: 0, T: 1.75, sigmaPct: 15 }
  ];
  cases.forEach((p, idx) => {
    const res = M.payoffParity.compute(p);
    approx(res.parityDiff, 0, 1e-10, 'put-call parity case ' + idx);
  });
  const def = M.payoffParity.compute();
  approx(def.C, 9.31973, 1e-4, 'default C');
  approx(def.P, 6.39369, 1e-4, 'default P');
  approx(def.portACost, 105.39868, 1e-4, 'default portA');
  approx(def.curPayoff, 12, 1e-10, 'default ST=112 call payoff');
  approx(def.curPnl, 12 - def.C, 1e-10, 'default ST=112 call pnl');
});

/* ── 3. One-Step Binomial Replication ── */
check('One-step binomial replication exact & independent of pReal', () => {
  const lo = M.binomialOne.compute({ pRealPct: 5 });
  const hi = M.binomialOne.compute({ pRealPct: 95 });
  approx(lo.rnPrice, hi.rnPrice, 1e-12, 'rnPrice independence');
  approx(lo.rnPrice, 10.47594, 1e-4, 'rnPrice default');
  approx(lo.delta, 0.57143, 1e-4, 'delta default');
  approx(lo.pStar, 0.54517, 1e-4, 'p* default');
  approx(lo.repCheckUp, lo.fu, 1e-10, 'up replication');
  approx(lo.repCheckDn, lo.fd, 1e-10, 'dn replication');
  assert(hi.realExpPV - lo.realExpPV > 12, 'subjective PV should span wide range');

  const put = M.binomialOne.compute({ type: 'put', pRealPct: 50 });
  approx(put.repCheckUp, put.fu, 1e-10, 'put up replication');
  approx(put.repCheckDn, put.fd, 1e-10, 'put dn replication');
});

/* ── 4. Multi-Step CRR Tree Convergence & Early Exercise ── */
check('CRR tree converges to BS and handles American vs European bounds', () => {
  const c128 = M.crrTree.compute({ style: 'euroCall', steps: 128, rPct: 5, qPct: 0, sigmaPct: 25 });
  approx(c128.price, c128.bsRef, 0.025, 'CRR 128 vs BS');
  const c256 = M.crrTree.compute({ style: 'euroCall', steps: 256, rPct: 5, qPct: 0, sigmaPct: 25 });
  approx(c256.price, c256.bsRef, 0.012, 'CRR 256 vs BS');

  const ap = M.crrTree.compute({ style: 'amerPut', steps: 8, rPct: 5, qPct: 0, sigmaPct: 25 });
  assert(ap.price > ap.euroPrice + 0.5, 'American put has positive early exercise premium');
  assert(ap.earlyNodes > 0, 'American put lights early exercise nodes');

  const acNoDiv = M.crrTree.compute({ style: 'amerCall', steps: 16, rPct: 5, qPct: 0, sigmaPct: 25 });
  approx(acNoDiv.earlyPremium, 0, 1e-10, 'No-dividend American call never exercises early');
  assert.strictEqual(acNoDiv.earlyNodes, 0);

  const acDiv = M.crrTree.compute({ style: 'amerCall', steps: 16, rPct: 5, qPct: 6, sigmaPct: 25 });
  assert(acDiv.earlyNodes > 0 && acDiv.earlyPremium > 0.05, 'High-dividend American call triggers early exercise');
});

/* ── 5. GBM Mean vs Median Split ── */
check('GBM mean vs median volatility drag & high-path accuracy', () => {
  const d = M.gbm.compute({ S0: 100, muPct: 8, sigmaPct: 20, T: 1, nPaths: 1500, nSteps: 52, seed: 42 });
  approx(d.theoMean, 100 * Math.exp(0.08), 1e-9, 'theo mean');
  approx(d.theoMedian, 100 * Math.exp(0.08 - 0.5 * 0.04), 1e-9, 'theo median');
  approx(d.empMean, d.theoMean, 1.5, 'MC empirical mean within SE');
  const hiVol = M.gbm.compute({ S0: 100, muPct: 8, sigmaPct: 50, T: 1, nPaths: 800, nSteps: 52, seed: 42 });
  assert(hiVol.theoMedian < 100, '50% vol drags median below 100 despite +8% drift');
  assert(hiVol.theoMean - hiVol.theoMedian > d.theoMean - d.theoMedian);
});

/* ── 6. Crank-Nicolson PDE vs Closed-Form BS ── */
check('Crank-Nicolson finite-difference PDE matches BS closed form', () => {
  ['call', 'put'].forEach((type) => {
    [0.25, 0.5, 1.0].forEach((tau) => {
      const d = M.bsPde.solve({ K: 100, rPct: 4, qPct: 1, sigmaPct: 22, T: 1.0, tau, type });
      assert(d.maxErr < 0.03, `PDE maxErr ${d.maxErr} too high for ${type} tau=${tau}`);
      approx(d.pdeAtK, d.exactAtK, 0.025, `ATM PDE vs BS (${type}, tau=${tau})`);
    });
  });
});

/* ── 7. Greeks vs Numerical Finite Differences ── */
check('All Black-Scholes Greeks match central numerical derivatives', () => {
  ['call', 'put'].forEach((type) => {
    const S = 103, K = 100, r = 0.045, q = 0.012, T = 0.4, s = 0.23;
    const g = M.bsGreeks(type, S, K, r, q, T, s);
    const hS = 1e-3, hSig = 1e-4, hT = 1e-4, hR = 1e-4;
    const numDelta = (M.bsPrice(type, S + hS, K, r, q, T, s) - M.bsPrice(type, S - hS, K, r, q, T, s)) / (2 * hS);
    const numGamma = (M.bsPrice(type, S + hS, K, r, q, T, s) - 2 * g.price + M.bsPrice(type, S - hS, K, r, q, T, s)) / (hS * hS);
    const numVega = (M.bsPrice(type, S, K, r, q, T, s + hSig) - M.bsPrice(type, S, K, r, q, T, s - hSig)) / (2 * hSig);
    const numTheta = -(M.bsPrice(type, S, K, r, q, T + hT, s) - M.bsPrice(type, S, K, r, q, T - hT, s)) / (2 * hT);
    const numRho = (M.bsPrice(type, S, K, r + hR, q, T, s) - M.bsPrice(type, S, K, r - hR, q, T, s)) / (2 * hR);

    approx(g.delta, numDelta, 1e-4, type + ' delta');
    approx(g.gamma, numGamma, 1e-4, type + ' gamma');
    approx(g.vega, numVega, 1e-3, type + ' vega');
    approx(g.thetaAnnual, numTheta, 1e-3, type + ' theta');
    approx(g.rho, numRho, 1e-3, type + ' rho');
  });
});

/* ── 8. Seeded Discrete Delta Hedging (High Trials) ── */
check('Discrete delta-hedging mean~0 when RV=IV, variance shrinks with N, RV!=IV shifts P&L', () => {
  const hW = M.greeksHedge.hedgeSim({ nPaths: 3000, steps: 13, ivPct: 20, rvPct: 20, costBps: 0, seed: 7 });
  const hD = M.greeksHedge.hedgeSim({ nPaths: 3000, steps: 63, ivPct: 20, rvPct: 20, costBps: 0, seed: 7 });
  const hQ = M.greeksHedge.hedgeSim({ nPaths: 3000, steps: 252, ivPct: 20, rvPct: 20, costBps: 0, seed: 7 });

  approx(hD.mean, 0, 0.025, 'drift-independent mean P&L at nPaths=3000');
  approx(hQ.mean, 0, 0.015, '4x daily hedge mean P&L');
  assert(hW.sd > hD.sd && hD.sd > hQ.sd, 'hedge SD must strictly shrink as frequency increases');

  const hHiRv = M.greeksHedge.hedgeSim({ nPaths: 1000, steps: 63, ivPct: 20, rvPct: 30, costBps: 0, seed: 7 });
  const hLoRv = M.greeksHedge.hedgeSim({ nPaths: 1000, steps: 63, ivPct: 20, rvPct: 12, costBps: 0, seed: 7 });
  assert(hHiRv.mean < -1.5, 'RV > IV hurts short gamma hedger');
  assert(hLoRv.mean > 1.0, 'RV < IV rewards short gamma hedger');

  const hCost = M.greeksHedge.hedgeSim({ nPaths: 1000, steps: 252, ivPct: 20, rvPct: 20, costBps: 15, seed: 7 });
  assert(hCost.mean < -0.5, '15 bps transaction fee degrades high-frequency hedge');
});

/* ── 9. Empirical Snapshots & Heston Smile ── */
check('Empirical SPX / SP500 snapshots and Heston stochastic vol behavior', () => {
  assert.strictEqual(M.SPX_SMILE_SNAPSHOT.spot, 7592.40);
  const put6000 = M.marketBreaks.smileInfo(0);
  const atm7600 = M.marketBreaks.smileInfo(9);
  const call9100 = M.marketBreaks.smileInfo(16);
  assert.strictEqual(put6000.row.iv, 38.40);
  assert.strictEqual(atm7600.row.iv, 14.52);
  assert.strictEqual(call9100.row.spreadPct, 90.9);
  assert(put6000.bsFlat < 1e-4 && put6000.mid > 7.0, 'flat BS prices deep OTM put near zero vs $7.05 market');

  const E = M.SP500_EMPIRICAL;
  assert.strictEqual(E.n, 2511);
  assert.strictEqual(E.kurtosis, 19.5);
  assert.strictEqual(E.gt4, 17);
  assert(E.acAbsReturn1 > 0.35);

  const hFlat = M.heston.smile({ xi: 0, rho: 0 });
  assert(Math.abs(hFlat.iv80 - hFlat.iv120) < 0.25, 'xi=0 flattens smile');
  const hSym = M.heston.smile({ xi: 0.6, rho: 0 });
  assert(hSym.iv80 > hSym.iv100 && hSym.iv120 > hSym.iv100, 'rho=0 makes symmetric U-smile');
  const hSkew = M.heston.smile({ xi: 0.5, rho: -0.7 });
  assert(hSkew.iv80 > hSkew.iv100 && hSkew.iv100 > hSkew.iv120, 'negative rho creates equity skew');
  assert(hSkew.skew25 > 8);
});

/* ── 10. Uses vs Harms & Frontier Models ── */
check('Uses/Harms, BIS hierarchy, 0DTE Gamma, and Perp Funding convergence', () => {
  const u0 = M.usesHarms.compare({ spotChangePct: 0, spreadPct: 12, hedgeRatioPct: 100 });
  assert.strictEqual(u0.hedgedProfit, 200);
  assert.strictEqual(u0.optRetPct, -100);
  assert(u0.roundTripDragPct > 11);
  const u8 = M.usesHarms.compare({ spotChangePct: 8, spreadPct: 12, hedgeRatioPct: 100 });
  assert(u8.optRetPct > 800 && u8.baseOpProfit === 120 && u8.hedgedProfit === 200);

  const g025 = M.frontierModel.gamma0dte({ dteDays: 0.25, spotShockPct: 1 });
  approx(g025.ratioVs30d, 11.0, 0.15, '0.25d Gamma vs 30D ratio');

  const pThin = M.frontierModel.perpFunding({ perpPremiumBps: 25, arbCapital: 10 });
  const pDeep = M.frontierModel.perpFunding({ perpPremiumBps: 25, arbCapital: 90 });
  assert(pDeep.trace[6].premBps < pThin.trace[6].premBps, 'higher arb capital collapses premium faster');
});

/* ── 11. I18N Parity, Zero-CJK Check, Prose Number Pinning & Registry Check ── */
check('I18N parity, zero CJK outside copy.zh.js, prose numbers & REGISTRY.json', () => {
  global.window = global;
  require(path.join(DIR, 'copy.zh.js'));
  const zh = global.ESSAY_I18N.zh;
  assert(zh, 'copy.zh.js loaded');

  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
  const modelsJs = fs.readFileSync(path.join(DIR, 'models.js'), 'utf8');
  const copyZh = fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8');

  // Zero CJK in app.js and models.js
  assert(!/[\u4e00-\u9fff]/.test(appJs), 'app.js must contain zero CJK characters');
  assert(!/[\u4e00-\u9fff]/.test(modelsJs), 'models.js must contain zero CJK characters');

  // No page-provenance in index.html
  assert(!html.includes('page-provenance'), 'index.html must not contain page-provenance yet');
  assert(!html.includes('copy.zh') || html.includes('copy.zh.js'));

  // Key parity for every data-i18n* attribute in index.html
  const getNested = (obj, k) => k.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : obj[k]), obj);
  for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) {
    const key = m[1];
    assert(getNested(zh, key) !== undefined, 'Missing zh i18n key: ' + key);
  }

  // Every readLabel.*, say.*, cv.* key used in app.js exists in copy.zh.js
  for (const m of appJs.matchAll(/\bt\('([^']+)'\)/g)) {
    const key = m[1];
    assert(getNested(zh, key) !== undefined, 'Missing zh t() key in app.js: ' + key);
  }

  // Prose number consistency checks against models.js
  const mustAppear = [
    '103.05', '9.32', '6.39', '105.40', '10.48', '0.5714',
    '12.317', '12.336', '108.33', '106.18', '10.086', '10.078', '0.007',
    '38.40%', '14.52%', '90.9%', '19.5', '−11.18σ', '844.6', '22.8', '3.4',
    '59%', '66.2%', '3.89%', '17.49', '149.09', '11.00 倍'
  ];
  mustAppear.forEach((tok) => {
    assert(copyZh.includes(tok), 'Expected prose pinned number missing in copy.zh.js: ' + tok);
  });

  // REGISTRY.json validity
  const reg = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  assert.strictEqual(reg.slug, 'a-fair-price-for-a-bet');
  assert.strictEqual(reg.concepts.length, 11);
});

console.log(`ALL CHECKS PASSED (${passed} test groups)`);
