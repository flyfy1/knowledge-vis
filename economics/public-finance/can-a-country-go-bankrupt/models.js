(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PublicFinanceModels = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // 1. Flow vs Stock & Primary Balance Accounting
  function budgetAccounting(p) {
    var revPct = clamp(Number(p && p.revPct != null ? p.revPct : 24), 5, 60);
    var primarySpendPct = clamp(Number(p && p.primarySpendPct != null ? p.primarySpendPct : 25.5), 5, 65);
    var debtPct = clamp(Number(p && p.debtPct != null ? p.debtPct : 100), 0, 260);
    var avgRatePct = clamp(Number(p && p.avgRatePct != null ? p.avgRatePct : 3.5), 0, 15);
    var gdpTrillion = clamp(Number(p && p.gdpTrillion != null ? p.gdpTrillion : 20), 0.1, 100);

    var primaryBalancePct = revPct - primarySpendPct;
    var interestPct = (debtPct / 100) * avgRatePct;
    var totalSpendPct = primarySpendPct + interestPct;
    var overallBalancePct = primaryBalancePct - interestPct;
    var headlineDeficitPct = -overallBalancePct;
    var interestToRevPct = revPct > 0 ? (interestPct / revPct) * 100 : 0;

    var regime = 'primary_deficit';
    if (primaryBalancePct >= 0 && overallBalancePct >= 0) {
      regime = 'primary_surplus_overall_surplus';
    } else if (primaryBalancePct >= 0 && overallBalancePct < 0) {
      regime = 'primary_surplus_headline_deficit';
    }

    return {
      revPct: revPct,
      primarySpendPct: primarySpendPct,
      debtPct: debtPct,
      avgRatePct: avgRatePct,
      gdpTrillion: gdpTrillion,
      primaryBalancePct: primaryBalancePct,
      interestPct: interestPct,
      totalSpendPct: totalSpendPct,
      overallBalancePct: overallBalancePct,
      headlineDeficitPct: headlineDeficitPct,
      interestToRevPct: interestToRevPct,
      debtAmount: gdpTrillion * (debtPct / 100),
      revAmount: gdpTrillion * (revPct / 100),
      primarySpendAmount: gdpTrillion * (primarySpendPct / 100),
      interestAmount: gdpTrillion * (interestPct / 100),
      headlineDeficitAmount: gdpTrillion * (headlineDeficitPct / 100),
      regime: regime
    };
  }

  // 2. Dynamic Debt-to-GDP Law of Motion: d_{t+1} = d_t * (1+r)/(1+g) - pb
  function debtDynamics(p) {
    var d0 = clamp(Number(p && p.d0 != null ? p.d0 : 100), 10, 250);
    var rPct = clamp(Number(p && p.rPct != null ? p.rPct : 3.5), -4, 14);
    var gPct = clamp(Number(p && p.gPct != null ? p.gPct : 4.0), -3, 12);
    var pbPct = clamp(Number(p && p.pbPct != null ? p.pbPct : -1.5), -10, 10);
    var horizon = Math.round(clamp(Number(p && p.horizon != null ? p.horizon : 30), 5, 50));

    var r = rPct / 100;
    var g = Math.max(-0.5, gPct / 100);
    var factor = (1 + r) / (1 + g);
    var rgGapPct = rPct - gPct;
    var stabilizingPbPct = d0 * ((r - g) / (1 + g));

    var series = [d0];
    var zeroPbSeries = [d0];
    var flatSeries = [d0];
    var d = d0;
    var dz = d0;
    for (var t = 1; t <= horizon; t++) {
      d = clamp(d * factor - pbPct, 0, 500);
      dz = clamp(dz * factor, 0, 500);
      series.push(d);
      zeroPbSeries.push(dz);
      flatSeries.push(d0);
    }

    var endDebt = series[series.length - 1];
    var steadyStatePct = null;
    if (r < g) {
      steadyStatePct = Math.max(0, (-pbPct * (1 + g)) / (g - r));
    }

    var diverges = r >= g && pbPct < stabilizingPbPct - 0.02;
    var regime = 'shrinking';
    if (r < g) {
      if (pbPct < stabilizingPbPct - 0.05) {
        regime = 'favorable_rg_climbing_to_ss';
      } else {
        regime = 'favorable_rg_falling';
      }
    } else {
      if (diverges) {
        regime = 'snowball';
      } else if (Math.abs(pbPct - stabilizingPbPct) <= 0.15) {
        regime = 'knife_edge';
      } else {
        regime = 'surplus_offset';
      }
    }

    return {
      d0: d0,
      rPct: rPct,
      gPct: gPct,
      pbPct: pbPct,
      horizon: horizon,
      factor: factor,
      rgGapPct: rgGapPct,
      stabilizingPbPct: stabilizingPbPct,
      steadyStatePct: steadyStatePct,
      endDebt: endDebt,
      deltaDebt: endDebt - d0,
      diverges: diverges,
      regime: regime,
      series: series,
      zeroPbSeries: zeroPbSeries,
      flatSeries: flatSeries
    };
  }

  // 3. Own-Currency vs Foreign-Currency Debt ("Original Sin")
  function currencyExposure(p) {
    var d0 = clamp(Number(p && p.d0 != null ? p.d0 : 75), 10, 220);
    var fxSharePct = clamp(Number(p && p.fxSharePct != null ? p.fxSharePct : 50), 0, 100);
    var fxDeprecPct = clamp(Number(p && p.fxDeprecPct != null ? p.fxDeprecPct : 35), 0, 100);
    var rFxPct = clamp(Number(p && p.rFxPct != null ? p.rFxPct : 6.5), 1, 18);
    var reserveMonths = clamp(Number(p && p.reserveMonths != null ? p.reserveMonths : 4.5), 0.5, 18);

    var fxShare = fxSharePct / 100;
    var dDom = d0 * (1 - fxShare);
    var dFx0 = d0 * fxShare;
    var dFxAfter = dFx0 * (1 + fxDeprecPct / 100);
    var dAfter = dDom + dFxAfter;
    var balanceSheetJumpPct = dAfter - d0;

    // Stylized 5-year average FX amortization (20%/yr) + FX interest coupon
    var fxDebtServicePct = dFxAfter * (0.20 + rFxPct / 100);
    // Standard ~30% GDP import ratio => 1 month imports ~ 2.5% GDP reserves
    var reservesGdpPct = reserveMonths * 2.5;
    var fxServiceToReserves = reservesGdpPct > 0 ? fxDebtServicePct / reservesGdpPct : 10;
    // Exchange rate pass-through into domestic CPI (~0.15 typical ERPT)
    var importedInflationPct = fxDeprecPct * 0.15;

    var regime = 'own_currency';
    if (fxSharePct <= 5) {
      regime = 'own_currency';
    } else if (fxServiceToReserves >= 1.0 || balanceSheetJumpPct >= 18) {
      regime = 'sudden_stop';
    } else {
      regime = 'fx_vulnerable';
    }

    return {
      d0: d0,
      fxSharePct: fxSharePct,
      fxDeprecPct: fxDeprecPct,
      rFxPct: rFxPct,
      reserveMonths: reserveMonths,
      dDom: dDom,
      dFx0: dFx0,
      dFxAfter: dFxAfter,
      dAfter: dAfter,
      balanceSheetJumpPct: balanceSheetJumpPct,
      fxDebtServicePct: fxDebtServicePct,
      reservesGdpPct: reservesGdpPct,
      fxServiceToReserves: fxServiceToReserves,
      importedInflationPct: importedInflationPct,
      regime: regime
    };
  }

  // 4. Maturity Wall, Rollover Schedule & Central Bank Consolidated Exposure
  function rolloverSchedule(p) {
    var debtPct = clamp(Number(p && p.debtPct != null ? p.debtPct : 110), 10, 240);
    var wamYears = clamp(Number(p && p.wamYears != null ? p.wamYears : 6.0), 2, 12);
    var oldCouponPct = clamp(Number(p && p.oldCouponPct != null ? p.oldCouponPct : 2.2), 0.2, 10);
    var marketYieldPct = clamp(Number(p && p.marketYieldPct != null ? p.marketYieldPct : 4.5), 0.2, 12);
    var cbSharePct = clamp(Number(p && p.cbSharePct != null ? p.cbSharePct : 20), 0, 60);
    var primaryDeficitPct = clamp(Number(p && p.primaryDeficitPct != null ? p.primaryDeficitPct : 2.5), -5, 10);

    var pRoll = clamp(1 / wamYears, 0.06, 0.55);
    var horizon = 10;
    var maturingByYear = [];
    var cumMaturing = 0;
    var threeYearShare = (1 - Math.pow(1 - pRoll, 3)) * 100;

    var effRatePath = [];
    var interestPath = [];
    var repricedFrac = 0;
    for (var t = 0; t <= horizon; t++) {
      repricedFrac = 1 - Math.pow(1 - pRoll, t);
      var rateT = oldCouponPct + (marketYieldPct - oldCouponPct) * repricedFrac;
      effRatePath.push(rateT);
      interestPath.push((debtPct / 100) * rateT);
    }

    var remaining = debtPct;
    for (var y = 1; y <= horizon; y++) {
      var mat = remaining * pRoll;
      maturingByYear.push(mat);
      remaining -= mat;
      cumMaturing += mat;
    }

    var maturingYr1Pct = maturingByYear[0];
    var interestYr1Pct = interestPath[1];
    var gfnPct = Math.max(0.1, maturingYr1Pct + Math.max(0, primaryDeficitPct) + interestYr1Pct);
    var refiSharePct = (maturingYr1Pct / gfnPct) * 100;

    // Consolidated Treasury + CB short-rate exposure:
    // Treasury debt held by CB becomes overnight bank reserves paying policy rate (~marketYield - 0.8)
    var cbShare = cbSharePct / 100;
    var policyRatePct = Math.max(0.25, marketYieldPct - 0.8);
    var consolidatedShortSharePct = (pRoll + (1 - pRoll) * cbShare) * 100;
    var consolidatedYr1RatePct =
      (1 - cbShare) * effRatePath[1] + cbShare * policyRatePct;
    var consolidatedInterestYr1Pct = (debtPct / 100) * consolidatedYr1RatePct;
    var interestJump10yPct = interestPath[horizon] - (debtPct / 100) * oldCouponPct;

    var regime = 'gradual';
    if (wamYears <= 3.5 || gfnPct >= 30) {
      regime = 'rollover_cliff';
    } else if (cbSharePct >= 30) {
      regime = 'cb_duration_shortened';
    }

    return {
      debtPct: debtPct,
      wamYears: wamYears,
      oldCouponPct: oldCouponPct,
      marketYieldPct: marketYieldPct,
      cbSharePct: cbSharePct,
      primaryDeficitPct: primaryDeficitPct,
      annualRollFractionPct: pRoll * 100,
      threeYearSharePct: threeYearShare,
      maturingYr1Pct: maturingYr1Pct,
      gfnPct: gfnPct,
      refiSharePct: refiSharePct,
      maturingByYear: maturingByYear,
      cumMaturing10y: cumMaturing,
      effRatePath: effRatePath,
      interestPath: interestPath,
      interestYr1Pct: interestYr1Pct,
      interestYr5Pct: interestPath[5],
      interestYr10Pct: interestPath[10],
      interestJump10yPct: interestJump10yPct,
      consolidatedShortSharePct: consolidatedShortSharePct,
      consolidatedInterestYr1Pct: consolidatedInterestYr1Pct,
      regime: regime
    };
  }

  // 5. Fiscal Multiplier & Interest-Rate Crowding Out
  function multiplierAtGap(slackPct, zlbOn, opennessPct) {
    var mpc = 0.72;
    var taxRate = 0.25;
    var m = clamp(opennessPct / 100, 0.05, 0.65);
    var baseMult = 1 / (1 - mpc * (1 - taxRate) + m);
    var capacityPressure = clamp((slackPct + 4) / 6.5, 0, 1);
    var monetaryOffset = zlbOn
      ? 0.06 * capacityPressure
      : 0.22 + 0.48 * Math.pow(capacityPressure, 1.35);
    return baseMult * (1 - monetaryOffset);
  }

  function multiplierCrowding(p) {
    var stimPct = clamp(Number(p && p.stimPct != null ? p.stimPct : 2.0), 0.2, 6.0);
    var slackPct = clamp(Number(p && p.slackPct != null ? p.slackPct : -1.5), -6, 3);
    var zlbOn = Boolean(p && p.zlbOn);
    var opennessPct = clamp(Number(p && p.opennessPct != null ? p.opennessPct : 25), 5, 65);
    var baseDebtPct = clamp(Number(p && p.baseDebtPct != null ? p.baseDebtPct : 100), 20, 200);
    var gBasePct = clamp(Number(p && p.gBasePct != null ? p.gBasePct : 3.5), 0, 8);

    var taxRate = 0.25;
    var capacityPressure = clamp((slackPct + 4) / 6.5, 0, 1);
    var k = multiplierAtGap(slackPct, zlbOn, opennessPct);
    var deltaRPct = zlbOn
      ? 0.08 * capacityPressure * stimPct
      : (0.18 + 0.40 * capacityPressure) * stimPct;

    var gdpLiftPct = k * stimPct;
    var selfFinancingSharePct = Math.min(100, taxRate * k * 100);
    var netBorrowingPct = stimPct * (1 - (taxRate * k) * 0.6);

    // Year-1 debt-ratio components (percentage points of GDP):
    // d1 - d0 ≈ netBorrowing - d0 * (gdpLift / (100 + g + gdpLift)) + interestCrowding
    var denomReliefYr1 = baseDebtPct * (gdpLiftPct / (100 + gBasePct + gdpLiftPct));
    var rateCostYr1 = (baseDebtPct / 100) * (deltaRPct * 0.20);
    var yr1DebtDeltaPct = netBorrowingPct - denomReliefYr1 + rateCostYr1;

    // Year-5 cumulative effect (temporary multiplier fades while rate shift lingers on rolled debt)
    var denomReliefYr5 = denomReliefYr1 * 0.35;
    var rateCostYr5 = (baseDebtPct / 100) * (deltaRPct * 1.45);
    var yr5DebtDeltaPct = netBorrowingPct - denomReliefYr5 + rateCostYr5;

    var curve = [];
    for (var s = -6; s <= 3.01; s += 0.5) {
      curve.push({
        slackPct: s,
        kNormal: multiplierAtGap(s, false, opennessPct),
        kZlb: multiplierAtGap(s, true, opennessPct)
      });
    }

    var regime = 'normal_partial_crowdout';
    if (zlbOn && k >= 1.15) {
      regime = 'zlb_high_multiplier';
    } else if (!zlbOn && slackPct >= 1.0) {
      regime = 'full_capacity_crowdout';
    } else if (yr1DebtDeltaPct <= 0) {
      regime = 'denom_cushion';
    }

    return {
      stimPct: stimPct,
      slackPct: slackPct,
      zlbOn: zlbOn,
      opennessPct: opennessPct,
      baseDebtPct: baseDebtPct,
      multiplier: k,
      deltaRPct: deltaRPct,
      gdpLiftPct: gdpLiftPct,
      selfFinancingSharePct: selfFinancingSharePct,
      netBorrowingPct: netBorrowingPct,
      denomReliefYr1: denomReliefYr1,
      rateCostYr1: rateCostYr1,
      yr1DebtDeltaPct: yr1DebtDeltaPct,
      denomReliefYr5: denomReliefYr5,
      rateCostYr5: rateCostYr5,
      yr5DebtDeltaPct: yr5DebtDeltaPct,
      curve: curve,
      regime: regime
    };
  }

  // 6. Demographics & Pay-As-You-Go Pension/Health Squeeze
  function demoSnapshot(workersPerRetiree, replaceRatePct, healthFactor, taxRevPct, nonAgeSpendPct, debtPct, rEffPct) {
    var depRatio = 1 / workersPerRetiree;
    var wageShare = 0.60;
    var pensionPct = depRatio * (replaceRatePct / 100) * wageShare * 100;
    var healthPct = 3.0 + healthFactor * 12.0 * depRatio;
    var interestPct = (debtPct / 100) * rEffPct;
    var ageTotalPct = pensionPct + healthPct;
    var mandatoryPct = ageTotalPct + interestPct;
    var discretionaryRoomPct = taxRevPct - mandatoryPct;
    var fiscalGapPct = discretionaryRoomPct - nonAgeSpendPct;
    return {
      workersPerRetiree: workersPerRetiree,
      depRatioPct: depRatio * 100,
      pensionPct: pensionPct,
      healthPct: healthPct,
      ageTotalPct: ageTotalPct,
      interestPct: interestPct,
      mandatoryPct: mandatoryPct,
      discretionaryRoomPct: discretionaryRoomPct,
      fiscalGapPct: fiscalGapPct
    };
  }

  function demographicBudget(p) {
    var workersPerRetiree = clamp(Number(p && p.workersPerRetiree != null ? p.workersPerRetiree : 2.8), 1.4, 5.0);
    var replaceRatePct = clamp(Number(p && p.replaceRatePct != null ? p.replaceRatePct : 50), 25, 75);
    var healthFactor = clamp(Number(p && p.healthFactor != null ? p.healthFactor : 1.0), 0.5, 2.0);
    var taxRevPct = clamp(Number(p && p.taxRevPct != null ? p.taxRevPct : 30), 18, 48);
    var nonAgeSpendPct = clamp(Number(p && p.nonAgeSpendPct != null ? p.nonAgeSpendPct : 11), 5, 20);
    var debtPct = clamp(Number(p && p.debtPct != null ? p.debtPct : 100), 10, 220);
    var rEffPct = clamp(Number(p && p.rEffPct != null ? p.rEffPct : 3.2), 0.5, 8);

    var current = demoSnapshot(workersPerRetiree, replaceRatePct, healthFactor, taxRevPct, nonAgeSpendPct, debtPct, rEffPct);
    var young = demoSnapshot(4.2, replaceRatePct, healthFactor, taxRevPct, nonAgeSpendPct, debtPct, rEffPct);
    var aged = demoSnapshot(1.7, replaceRatePct, healthFactor, taxRevPct, nonAgeSpendPct, debtPct, rEffPct);

    // Stylized 30-year PV of annual primary age-gap relative to baseline tax capacity (r - g ≈ 0% discount)
    var implicitPaygNpvPct = Math.max(0, -current.fiscalGapPct) * 20;

    var regime = 'balanced_space';
    if (current.discretionaryRoomPct < 0) {
      regime = 'negative_discretionary';
    } else if (current.fiscalGapPct < -2.0) {
      regime = 'severe_squeeze';
    } else if (current.fiscalGapPct < 0) {
      regime = 'mild_squeeze';
    }

    return {
      workersPerRetiree: workersPerRetiree,
      replaceRatePct: replaceRatePct,
      healthFactor: healthFactor,
      taxRevPct: taxRevPct,
      nonAgeSpendPct: nonAgeSpendPct,
      debtPct: debtPct,
      rEffPct: rEffPct,
      current: current,
      young: young,
      aged: aged,
      implicitPaygNpvPct: implicitPaygNpvPct,
      regime: regime
    };
  }

  // 7. Historical Debt-Reduction Accounting Decomposition
  var HIST_PRESETS = {
    us_ww2: {
      id: 'us_ww2',
      years: 28,
      startDebt: 106,
      primaryContrib: -38,
      growthContrib: -41,
      interestContrib: 19,
      inflationContrib: -23,
      restructuringContrib: 0,
      endDebt: 23,
      counterfactualNoteDebt: 74
    },
    canada_1990s: {
      id: 'canada_1990s',
      years: 12,
      startDebt: 100,
      primaryContrib: -32,
      growthContrib: -34,
      interestContrib: 42,
      inflationContrib: -9,
      restructuringContrib: 0,
      endDebt: 67,
      counterfactualNoteDebt: null
    },
    em_restruct: {
      id: 'em_restruct',
      years: 5,
      startDebt: 95,
      primaryContrib: -4,
      growthContrib: -9,
      interestContrib: 22,
      inflationContrib: -6,
      restructuringContrib: -28,
      endDebt: 70,
      counterfactualNoteDebt: null
    }
  };

  function historicalDecomp(p) {
    var presetId = (p && p.presetId) || 'us_ww2';
    if (presetId !== 'custom' && HIST_PRESETS[presetId]) {
      var h = HIST_PRESETS[presetId];
      return {
        presetId: h.id,
        years: h.years,
        startDebt: h.startDebt,
        primaryContrib: h.primaryContrib,
        growthContrib: h.growthContrib,
        interestContrib: h.interestContrib,
        inflationContrib: h.inflationContrib,
        restructuringContrib: h.restructuringContrib,
        endDebt: h.endDebt,
        totalDrop: h.startDebt - h.endDebt,
        counterfactualNoteDebt: h.counterfactualNoteDebt,
        regime: presetId === 'em_restruct' ? 'restructured' : (h.endDebt < h.startDebt ? 'deleveraged' : 'rising')
      };
    }

    var startDebt = clamp(Number(p && p.startDebt != null ? p.startDebt : 110), 40, 220);
    var years = Math.round(clamp(Number(p && p.years != null ? p.years : 10), 5, 30));
    var primaryPct = clamp(Number(p && p.primaryPct != null ? p.primaryPct : 1.5), -5, 6);
    var growthPct = clamp(Number(p && p.growthPct != null ? p.growthPct : 2.5), -1, 6);
    var realRatePct = clamp(Number(p && p.realRatePct != null ? p.realRatePct : 2.0), -3, 7);
    var inflationPct = clamp(Number(p && p.inflationPct != null ? p.inflationPct : 3.0), 0, 12);
    var haircutPct = clamp(Number(p && p.haircutPct != null ? p.haircutPct : 0), 0, 50);

    // Year-by-year exact additive accounting decomposition
    var d = startDebt;
    var primaryContrib = 0;
    var growthContrib = 0;
    var interestContrib = 0;
    var inflationContrib = 0;
    var restructuringContrib = 0;

    if (haircutPct > 0) {
      restructuringContrib = -d * (haircutPct / 100);
      d += restructuringContrib;
    }

    var g = growthPct / 100;
    var pi = inflationPct / 100;
    var rNom = (1 + realRatePct / 100) * (1 + pi) - 1;
    var gNom = (1 + g) * (1 + pi) - 1;

    for (var t = 0; t < years; t++) {
      var intStep = d * ((realRatePct / 100) / (1 + g));
      var gStep = -d * (g / (1 + g));
      // Unanticipated/repressed inflation erosion wedge (portion of inflation not fully priced into legacy fixed-coupon debt)
      var infWedge = -d * ((pi * 0.45) / (1 + gNom));
      var pbStep = -primaryPct;

      interestContrib += intStep;
      growthContrib += gStep;
      inflationContrib += infWedge;
      primaryContrib += pbStep;

      d = clamp(d + intStep + gStep + infWedge + pbStep, 0, 450);
    }

    // Reconcile tiny clamp remainder at zero floor
    var sumContribs = primaryContrib + growthContrib + interestContrib + inflationContrib + restructuringContrib;
    var endDebt = Math.max(0, startDebt + sumContribs);

    var regime = 'rising';
    if (haircutPct >= 15) {
      regime = 'restructured';
    } else if (endDebt <= startDebt - 15) {
      regime = 'deleveraged';
    } else if (endDebt <= startDebt + 5) {
      regime = 'stabilized';
    }

    return {
      presetId: 'custom',
      years: years,
      startDebt: startDebt,
      primaryContrib: primaryContrib,
      growthContrib: growthContrib,
      interestContrib: interestContrib,
      inflationContrib: inflationContrib,
      restructuringContrib: restructuringContrib,
      endDebt: endDebt,
      totalDrop: startDebt - endDebt,
      counterfactualNoteDebt: null,
      rNomPct: rNom * 100,
      gNomPct: gNom * 100,
      regime: regime
    };
  }

  // 8. Verified Nov 2026 Frontier Dataset & Stress Comparison
  var FRONTIER_COUNTRIES = [
    {
      id: 'us',
      debtPct: 126.8,
      cboPublicDebtPct: 100.6,
      cboPublicDebt2036Pct: 120.0,
      interestPct: 3.3,
      cboInterest2036Pct: 4.6,
      primaryBalancePct: -3.4,
      nomGrowthPct: 4.3,
      effRatePct: 3.3,
      wamYears: 6.1,
      fxSharePct: 0
    },
    {
      id: 'jp',
      debtPct: 199.4,
      interestPct: 1.49,
      primaryBalancePct: -2.4,
      nomGrowthPct: 2.6,
      effRatePct: 0.85,
      wamYears: 9.0,
      fxSharePct: 0
    },
    {
      id: 'ea',
      debtPct: 88.0,
      deDebtPct: 64.6,
      frDebtPct: 118.5,
      itDebtPct: 137.9,
      interestPct: 2.2,
      primaryBalancePct: -1.2,
      nomGrowthPct: 3.1,
      effRatePct: 2.5,
      wamYears: 7.8,
      fxSharePct: 0
    },
    {
      id: 'cn',
      debtPct: 104.4,
      interestPct: 0.95,
      primaryBalancePct: -5.5,
      nomGrowthPct: 4.6,
      effRatePct: 2.0,
      wamYears: 6.8,
      fxSharePct: 1
    },
    {
      id: 'em',
      debtPct: 72.0,
      revPct: 26.6,
      interestPct: 2.7,
      primaryBalancePct: -2.1,
      nomGrowthPct: 6.2,
      effRatePct: 4.5,
      wamYears: 5.4,
      fxSharePct: 24
    }
  ];

  function getCountry(countryId) {
    for (var i = 0; i < FRONTIER_COUNTRIES.length; i++) {
      if (FRONTIER_COUNTRIES[i].id === countryId) return FRONTIER_COUNTRIES[i];
    }
    return FRONTIER_COUNTRIES[0];
  }

  function frontierStress(p) {
    var countryId = (p && p.countryId) || 'us';
    var yieldShiftBps = clamp(Number(p && p.yieldShiftBps != null ? p.yieldShiftBps : 100), -150, 300);
    var growthShiftPct = clamp(Number(p && p.growthShiftPct != null ? p.growthShiftPct : 0), -2.5, 2.0);
    var c = getCountry(countryId);

    var yieldShiftPct = yieldShiftBps / 100;
    var roll5y = 1 - Math.exp(-5 / c.wamYears);
    var stressedEffRate5y = Math.max(0.2, c.effRatePct + yieldShiftPct * roll5y);
    var stressedInterest5y = c.interestPct + (c.debtPct / 100) * (stressedEffRate5y - c.effRatePct);
    var stressedGrowth = Math.max(-1.0, c.nomGrowthPct + growthShiftPct);

    var r = stressedEffRate5y / 100;
    var g = stressedGrowth / 100;
    var stabilizingPbPct = c.debtPct * ((r - g) / (1 + g));
    var fiscalEffortNeededPct = stabilizingPbPct - c.primaryBalancePct;

    // 5-year path under stressed parameters
    var d = c.debtPct;
    for (var t = 0; t < 5; t++) {
      var frac = 1 - Math.exp(-(t + 0.5) / c.wamYears);
      var rt = Math.max(0.002, (c.effRatePct + yieldShiftPct * frac) / 100);
      d = clamp(d * ((1 + rt) / (1 + g)) - c.primaryBalancePct, 0, 350);
    }

    var allStressed = [];
    for (var i = 0; i < FRONTIER_COUNTRIES.length; i++) {
      var item = FRONTIER_COUNTRIES[i];
      var rf = 1 - Math.exp(-5 / item.wamYears);
      var ir = Math.max(0.2, item.effRatePct + yieldShiftPct * rf);
      var ig = Math.max(-1.0, item.nomGrowthPct + growthShiftPct);
      var iInt = item.interestPct + (item.debtPct / 100) * (ir - item.effRatePct);
      var iStab = item.debtPct * (((ir / 100) - (ig / 100)) / (1 + ig / 100));
      allStressed.push({
        id: item.id,
        baseDebtPct: item.debtPct,
        baseInterestPct: item.interestPct,
        stressedInterest5y: iInt,
        rgGapPct: ir - ig,
        stabilizingPbPct: iStab,
        fiscalEffortNeededPct: iStab - item.primaryBalancePct,
        fxSharePct: item.fxSharePct
      });
    }

    var regime = 'manageable';
    if (fiscalEffortNeededPct >= 4.5) {
      regime = 'steep_adjustment';
    } else if (stressedEffRate5y > stressedGrowth) {
      regime = 'positive_rg';
    }

    return {
      countryId: c.id,
      yieldShiftBps: yieldShiftBps,
      growthShiftPct: growthShiftPct,
      baseDebtPct: c.debtPct,
      baseInterestPct: c.interestPct,
      primaryBalancePct: c.primaryBalancePct,
      stressedEffRate5y: stressedEffRate5y,
      stressedInterest5y: stressedInterest5y,
      stressedGrowth: stressedGrowth,
      rgGapPct: stressedEffRate5y - stressedGrowth,
      stabilizingPbPct: stabilizingPbPct,
      fiscalEffortNeededPct: fiscalEffortNeededPct,
      debt5yPct: d,
      roll5yPct: roll5y * 100,
      allStressed: allStressed,
      regime: regime
    };
  }

  return {
    budgetAccounting: budgetAccounting,
    debtDynamics: debtDynamics,
    currencyExposure: currencyExposure,
    rolloverSchedule: rolloverSchedule,
    multiplierCrowding: multiplierCrowding,
    demographicBudget: demographicBudget,
    historicalDecomp: historicalDecomp,
    frontierStress: frontierStress,
    HIST_PRESETS: HIST_PRESETS,
    FRONTIER_COUNTRIES: FRONTIER_COUNTRIES
  };
});
