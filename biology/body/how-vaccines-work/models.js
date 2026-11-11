/* How vaccines work: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.VaxModels and by tests/models.cjs via require().
 * Time-stepped models use a fixed internal step, so results never depend on the frame rate. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VaxModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LN2 = Math.log(2);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── 1–3 · Immune kinetics: clonal expansion, memory, antibody ─────────
   * An illustrative textbook model, not fitted to any vaccine or disease. Time in days, all levels relative.
   * stimulation  s = min(1, A/(A + K) + V/(V + Kv))          A: vaccine antigen, V: virus
   * responding B cells   E' = α·s·(N0 + M) + ρ·s·E − δ·(1 − s)·E   recruited from naive (N0) and memory (M)
   * memory cells         M' = φ·s·E                         formed during a response, kept (no decay here)
   * long-lived plasma    L' = λ·s·E − ln2/tL·L
   * antibody             Ab' = κ·E + κL·L − ln2/tAb·Ab       tAb = 21 days (IgG half-life)
   * vaccine antigen      A' = −ln2/tA·A − kA·Ab·A           cleared, and mopped up by existing antibody
   * virus                V' = r·V·(1 − V/Vmax) − kN·Ab·V − kE·E·V */
  const immune = {
    P: { N0: 1, alpha: 0.3, rho: 1.0, delta: 0.3, phi: 0.04, lam: 0.0004, halfL: 365, kappa: 1, kappaL: 5,
      halfAb: 21, Ecap: 10000, K: 1, halfA: 3, A0: 10, kA: 0.00002, Kv: 1000, r: 3, Vmax: 1e8, kN: 0.001, kE: 0.0004 },
    H: 0.01,
    DETECT: 100,      // antibody level counted as "detectable"
    SYMPTOM: 1e5,     // virus level above which the model counts a day as a day with symptoms
    SEVERE: 1e7,      // virus level marked as "very ill" (illustrative)
    create() { return { t: 0, A: 0, V: 0, E: 0, M: 0, L: 0, Ab: 0 }; },
    step(s, h, Q) {
      const st = Math.min(1, s.A / (s.A + Q.K) + s.V / (s.V + Q.Kv));
      const dE = Q.alpha * st * (Q.N0 + s.M) + Q.rho * st * s.E * (1 - s.E / Q.Ecap) - Q.delta * (1 - st) * s.E;
      const dM = Q.phi * st * s.E;
      const dL = Q.lam * st * s.E - LN2 / Q.halfL * s.L;
      const dAb = Q.kappa * s.E + Q.kappaL * s.L - LN2 / Q.halfAb * s.Ab;
      const dA = -LN2 / Q.halfA * s.A - Q.kA * s.Ab * s.A;
      const dV = Q.r * s.V * (1 - s.V / Q.Vmax) - Q.kN * s.Ab * s.V - Q.kE * s.E * s.V;
      s.A = Math.max(0, s.A + dA * h);
      s.V = Math.max(0, s.V + dV * h); if (s.V < 0.5) s.V = 0; // below one particle: gone
      s.E = Math.max(0, s.E + dE * h); s.M += dM * h; s.L += dL * h; s.Ab = Math.max(0, s.Ab + dAb * h); s.t += h;
    },
    /* doses: day numbers of vaccine doses; infectAt: day one virus particle arrives (or null); every: sample spacing */
    run(o) {
      const Q = Object.assign({}, immune.P, o.P || {}), h = immune.H, s = immune.create();
      const doses = (o.doses || []).slice().sort((a, b) => a - b), until = o.until, every = o.every || 0.1;
      const out = []; let di = 0, infected = false;
      const n = Math.round(until / h), k = Math.max(1, Math.round(every / h));
      for (let i = 0; i <= n; i++) {
        const t = i * h;
        while (di < doses.length && doses[di] <= t + 1e-9) { s.A += Q.A0; di++; }
        if (!infected && o.infectAt != null && t >= o.infectAt - 1e-9) { s.V = 1; infected = true; }
        if (i % k === 0) out.push({ t, A: s.A, V: s.V, E: s.E, M: s.M, Ab: s.Ab });
        immune.step(s, h, Q);
      }
      return { series: out, end: s, Q };
    },
    /* the antibody level above which antibody alone makes the virus shrink from the first particle */
    doorLevel(P = immune.P) { return P.r / P.kN; },
    /* summary of each dose: peak antibody before the next dose (or the end), days from the dose to that peak,
       first day the antibody is detectable, memory pool just before the next dose */
    doses(doses, until) {
      const r = immune.run({ doses, until });
      const res = doses.map((d, i) => {
        const end = i + 1 < doses.length ? doses[i + 1] : until;
        const seg = r.series.filter(q => q.t >= d - 1e-9 && q.t < end - 1e-9);
        let pk = seg[0]; for (const q of seg) if (q.Ab > pk.Ab) pk = q;
        const det = seg.find(q => q.Ab >= immune.DETECT);
        return { at: d, peak: pk.Ab, tPeak: pk.t - d, detect: det ? det.t - d : null, abAtDose: seg[0].Ab, memAfter: seg[seg.length - 1].M };
      });
      return { series: r.series, res };
    },
    /* an infection: summary of the virus course after the particle arrives */
    infection(o) {
      const r = immune.run(o), at = o.infectAt;
      const seg = r.series.filter(q => q.t >= at - 1e-9);
      let pk = seg[0]; for (const q of seg) if (q.V > pk.V) pk = q;
      const dt = seg.length > 1 ? seg[1].t - seg[0].t : 0.1;
      let sick = 0, severe = 0; for (const q of seg) { if (q.V >= immune.SYMPTOM) sick += dt; if (q.V >= immune.SEVERE) severe += dt; }
      const gone = seg.find((q, i) => i > 0 && q.V === 0);
      const det = seg.find(q => q.Ab >= immune.DETECT);
      return { series: r.series, peak: pk.V, tPeak: pk.t - at, sickDays: sick, severeDays: severe, cleared: gone ? gone.t - at : null,
        abAtInfection: seg[0].Ab, detect: det ? det.t - at : null };
    }
  };

  /* ───────── 4 · A two-arm trial: efficacy = 1 − relative risk ─────────
   * 95 % interval from the log relative risk (Katz). With a zero cell, 0.5 is added to every cell (Haldane);
   * veC is the point estimate after that correction (the uncorrected one is 100 % when the vaccine arm has no case). */
  const trial = {
    analyze({ nV, nP, cV, cP }) {
      const riskV = cV / nV, riskP = cP / nP;
      const zero = cV === 0 || cP === 0;
      const a = zero ? cV + 0.5 : cV, b = zero ? cP + 0.5 : cP, n1 = zero ? nV + 1 : nV, n2 = zero ? nP + 1 : nP;
      const rr = riskP > 0 ? riskV / riskP : NaN;
      const lrr = Math.log((a / n1) / (b / n2)), se = Math.sqrt(1 / a - 1 / n1 + 1 / b - 1 / n2);
      const ve = 1 - rr, lo = 1 - Math.exp(lrr + 1.96 * se), hi = 1 - Math.exp(lrr - 1.96 * se);
      const arr = riskP - riskV;
      return { riskV, riskP, rr, ve, veC: 1 - Math.exp(lrr), lo, hi, arr, nnv: arr > 0 ? 1 / arr : Infinity, zero };
    }
  };

  /* ───────── 5 · Who the cases are: base rates ─────────
   * coverage c, efficacy e (risk of a vaccinated person = (1 − e) × risk of an unvaccinated one), attack rate a
   * among the unvaccinated. */
  const base = {
    split({ c, e, a, N = 100000 }) {
      const casesV = N * c * a * (1 - e), casesU = N * (1 - c) * a, tot = casesV + casesU;
      return { casesV, casesU, shareV: tot > 0 ? casesV / tot : 0, rateV: a * (1 - e), rateU: a, popV: N * c, popU: N * (1 - c) };
    },
    shareV: (c, e) => { const v = c * (1 - e), u = 1 - c; return v + u > 0 ? v / (v + u) : 0; },
    // coverage at which half of all cases are vaccinated people
    crossing: e => 1 / (2 - e)
  };

  /* ───────── 6 · Herd protection with an imperfect vaccine ─────────
   * SIR with homogeneous mixing; a share c is vaccinated; the vaccine is "all or nothing": a share E of the
   * vaccinated are fully immune, the rest are like the unvaccinated. Infectious period D days. */
  const herd = {
    D: 7, I0: 1e-4,
    re: (R0, c, E) => R0 * (1 - c * E),
    threshold: R0 => Math.max(0, 1 - 1 / R0),
    coverageNeeded: (R0, E) => herd.threshold(R0) / E,          // > 1 means unreachable by vaccination alone
    maxR0: E => E >= 1 ? Infinity : 1 / (1 - E),                   // largest R0 that full coverage can still stop
    // share of the not-immune who are eventually infected (final-size equation), = risk to an unvaccinated person
    attack(R0, c, E) {
      const s0 = 1 - c * E; if (R0 * s0 <= 1) return 0;
      let z = 1; for (let i = 0; i < 2000; i++) z = 1 - Math.exp(-R0 * s0 * z);
      return z;
    },
    create(R0, c, E) { const s0 = 1 - c * E; return { t: 0, S: s0 - herd.I0 * s0, I: herd.I0 * s0, R: 0, s0, beta: R0 / herd.D, g: 1 / herd.D, peakI: herd.I0 * s0, tPeak: 0 }; },
    H: 0.05,
    step(s, h) { // RK4 on S, I (fractions of the whole population)
      const f = (S, I) => [-s.beta * S * I, s.beta * S * I - s.g * I];
      const [a1, b1] = f(s.S, s.I), [a2, b2] = f(s.S + a1 * h / 2, s.I + b1 * h / 2), [a3, b3] = f(s.S + a2 * h / 2, s.I + b2 * h / 2), [a4, b4] = f(s.S + a3 * h, s.I + b3 * h);
      const dS = h * (a1 + 2 * a2 + 2 * a3 + a4) / 6, dI = h * (b1 + 2 * b2 + 2 * b3 + b4) / 6;
      s.S += dS; s.I += dI; s.R = 1 - s.S - s.I - (1 - s.s0); s.t += h;
      if (s.I > s.peakI) { s.peakI = s.I; s.tPeak = s.t; }
    },
    runTo(R0, c, E, days) { const s = herd.create(R0, c, E); const n = Math.round(days / herd.H); for (let i = 0; i < n; i++) herd.step(s, herd.H); return s; }
  };

  /* ───────── 7 · Waning: the immune share decays, boosters restore it ─────────
   * protected share p(t) = c·E·2^(−(t − last booster)/H); Re(t) = R0·(1 − p(t)). Time in months. */
  const wane = {
    protectedShare(t, c, E, H, B) { const since = B > 0 ? t % B : t; return c * E * Math.pow(2, -since / H); },
    re(t, R0, c, E, H, B) { return R0 * (1 - wane.protectedShare(t, c, E, H, B)); },
    // months after a dose until Re climbs back to 1 (0 if never below, Infinity if never above)
    timeAbove(R0, c, E, H) {
      const need = herd.threshold(R0), p0 = c * E;
      if (p0 <= need) return 0;
      if (need <= 0) return Infinity;
      return H * Math.log2(p0 / need);
    },
    // share of the time with Re > 1 over a long horizon with boosters every B months (B = 0: no boosters)
    shareAbove(R0, c, E, H, B, horizon = 36) {
      const tc = wane.timeAbove(R0, c, E, H);
      if (B <= 0) return tc >= horizon ? 0 : (horizon - tc) / horizon;
      if (tc >= B) return 0;
      return (B - tc) / B;
    }
  };

  // small seeded generator (mulberry32), used only to scatter the trial grid's dots repeatably
  function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  return { LN2, clamp, rng, immune, trial, base, herd, wane };
}));
