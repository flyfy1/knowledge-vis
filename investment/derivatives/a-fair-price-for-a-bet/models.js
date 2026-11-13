/* A Fair Price for a Bet: pure derivatives pricing models & sourced market data (UMD, no DOM, no CJK). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DerivModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── Math & PRNG helpers ───────── */
  function erfc(x) {
    const z = Math.abs(x);
    const t = 1 / (1 + 0.5 * z);
    const ans = t * Math.exp(
      -z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
      t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
      t * (-0.82215223 + t * 0.17087277))))))))
    );
    return x >= 0 ? ans : 2 - ans;
  }

  function normCDF(x) {
    return 0.5 * erfc(-x / Math.SQRT2);
  }

  function normPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randn(rng) {
    let u1 = rng();
    while (u1 < 1e-12) u1 = rng();
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /* ───────── Black-Scholes Analytical Core ───────── */
  function bsPrice(type, S, K, r, q, T, sigma) {
    if (T <= 0 || sigma <= 0) {
      const dfR = Math.exp(-r * Math.max(0, T));
      const dfQ = Math.exp(-q * Math.max(0, T));
      return type === 'call' ? Math.max(0, S * dfQ - K * dfR) : Math.max(0, K * dfR - S * dfQ);
    }
    const sqT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqT);
    const d2 = d1 - sigma * sqT;
    const dfQ = Math.exp(-q * T);
    const dfR = Math.exp(-r * T);
    if (type === 'call') return S * dfQ * normCDF(d1) - K * dfR * normCDF(d2);
    return K * dfR * normCDF(-d2) - S * dfQ * normCDF(-d1);
  }

  function bsGreeks(type, S, K, r, q, T, sigma) {
    const tau = Math.max(1e-6, T);
    const sig = Math.max(1e-5, sigma);
    const sqT = Math.sqrt(tau);
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sig * sig) * tau) / (sig * sqT);
    const d2 = d1 - sig * sqT;
    const dfQ = Math.exp(-q * tau);
    const dfR = Math.exp(-r * tau);
    const nd1 = normPDF(d1);
    const price = type === 'call'
      ? S * dfQ * normCDF(d1) - K * dfR * normCDF(d2)
      : K * dfR * normCDF(-d2) - S * dfQ * normCDF(-d1);
    const delta = type === 'call' ? dfQ * normCDF(d1) : -dfQ * normCDF(-d1);
    const gamma = (dfQ * nd1) / (S * sig * sqT);
    const vega = S * dfQ * nd1 * sqT;
    const thetaAnnual = type === 'call'
      ? -(S * dfQ * nd1 * sig) / (2 * sqT) - r * K * dfR * normCDF(d2) + q * S * dfQ * normCDF(d1)
      : -(S * dfQ * nd1 * sig) / (2 * sqT) + r * K * dfR * normCDF(-d2) - q * S * dfQ * normCDF(-d1);
    const rho = type === 'call'
      ? K * tau * dfR * normCDF(d2)
      : -K * tau * dfR * normCDF(-d2);
    return {
      price,
      delta,
      gamma,
      vega,
      vega1pct: 0.01 * vega,
      thetaAnnual,
      thetaDay: thetaAnnual / 365,
      rho,
      rho1pct: 0.01 * rho
    };
  }

  function impliedVol(type, targetPrice, S, K, r, q, T) {
    const dfQ = Math.exp(-q * T);
    const dfR = Math.exp(-r * T);
    const intrinsic = type === 'call' ? Math.max(0, S * dfQ - K * dfR) : Math.max(0, K * dfR - S * dfQ);
    if (targetPrice <= intrinsic + 1e-8) return 0.005;
    let lo = 0.005, hi = 2.0;
    for (let i = 0; i < 60; i++) {
      const mid = 0.5 * (lo + hi);
      const p = bsPrice(type, S, K, r, q, T, mid);
      if (p > targetPrice) hi = mid;
      else lo = mid;
    }
    return 0.5 * (lo + hi);
  }

  /* ───────── 1 · Forward Pricing & Cash-and-Carry Arbitrage ───────── */
  const forward = {
    P: { S0: 100, rPct: 4.0, qPct: 1.0, T: 1.0, Fquote: 108.0 },
    compute(p) {
      const P = Object.assign({}, forward.P, p);
      const S0 = clamp(P.S0, 50, 150);
      const r = clamp(P.rPct, 0, 12) / 100;
      const q = clamp(P.qPct, 0, 10) / 100;
      const T = clamp(P.T, 0.25, 3.0);
      const Ffair = S0 * Math.exp((r - q) * T);
      const Fquote = p && p.Fquote != null ? clamp(p.Fquote, 50, 180) : forward.P.Fquote;
      const diff = Fquote - Ffair;
      const sharesToday = Math.exp(-q * T);
      const borrowToday = S0 * sharesToday;
      const repayT = borrowToday * Math.exp(r * T); // equals Ffair
      const arbProfitT = Math.abs(diff);
      const arbPV = arbProfitT * Math.exp(-r * T);
      let regime = 'fair';
      if (diff > 0.05) regime = 'overpriced';
      else if (diff < -0.05) regime = 'underpriced';
      return {
        S0, r, q, T, Ffair, Fquote, diff,
        sharesToday, borrowToday, repayT,
        arbProfitT, arbPV, regime
      };
    }
  };

  /* ───────── 2 · Option Payoffs & Put-Call Parity ───────── */
  const payoffParity = {
    P: { strategy: 'call', S0: 100, K: 100, rPct: 4.0, qPct: 1.0, T: 1.0, sigmaPct: 20, ST: 112 },
    compute(p) {
      const P = Object.assign({}, payoffParity.P, p);
      const S0 = clamp(P.S0, 60, 140);
      const K = clamp(P.K, 70, 130);
      const r = clamp(P.rPct, 0, 10) / 100;
      const q = clamp(P.qPct, 0, 8) / 100;
      const T = clamp(P.T, 0.25, 2.0);
      const sigma = clamp(P.sigmaPct, 5, 60) / 100;
      const ST = clamp(P.ST, 50, 160);

      const C = bsPrice('call', S0, K, r, q, T, sigma);
      const putP = bsPrice('put', S0, K, r, q, T, sigma);
      const K2 = K + 15;
      const C2 = bsPrice('call', S0, K2, r, q, T, sigma);

      const pvK = K * Math.exp(-r * T);
      const pvS = S0 * Math.exp(-q * T);
      const portACost = C + pvK;
      const portBCost = putP + pvS;
      const parityDiff = portACost - portBCost;

      const strat = P.strategy;
      const evalStrat = (s) => {
        if (strat === 'call') return { payoff: Math.max(0, s - K), pnl: Math.max(0, s - K) - C, cost: C };
        if (strat === 'put') return { payoff: Math.max(0, K - s), pnl: Math.max(0, K - s) - putP, cost: putP };
        if (strat === 'protPut') return { payoff: s + Math.max(0, K - s), pnl: s + Math.max(0, K - s) - (S0 + putP), cost: S0 + putP };
        if (strat === 'covCall') return { payoff: s - Math.max(0, s - K), pnl: s - Math.max(0, s - K) - (S0 - C), cost: S0 - C };
        if (strat === 'straddle') return { payoff: Math.abs(s - K), pnl: Math.abs(s - K) - (C + putP), cost: C + putP };
        // bullSpread: long C(K), short C(K+15)
        const netC = C - C2;
        const pay = Math.max(0, s - K) - Math.max(0, s - K2);
        return { payoff: pay, pnl: pay - netC, cost: netC };
      };

      const curve = [];
      for (let x = 50; x <= 160; x += 2) {
        const res = evalStrat(x);
        curve.push({ s: x, payoff: res.payoff, pnl: res.pnl });
      }
      const cur = evalStrat(ST);
      const portAPayoffT = Math.max(0, ST - K) + K;
      const portBPayoffT = Math.max(0, K - ST) + ST;

      return {
        strategy: P.strategy, S0, K, K2, r, q, T, sigma, ST,
        C, P: putP, C2,
        pvK, pvS, portACost, portBCost, parityDiff,
        portAPayoffT, portBPayoffT,
        curPayoff: cur.payoff, curPnl: cur.pnl, curCost: cur.cost,
        curve
      };
    }
  };

  /* ───────── 3 · One-Step Binomial Replication ───────── */
  const binomialOne = {
    P: { S0: 100, K: 100, u: 1.20, d: 0.85, rPct: 4.0, T: 1.0, pRealPct: 75, type: 'call' },
    compute(p) {
      const P = Object.assign({}, binomialOne.P, p);
      const S0 = clamp(P.S0, 50, 150);
      const K = clamp(P.K, 60, 140);
      const u = clamp(P.u, 1.05, 1.50);
      const d = clamp(P.d, 0.55, 0.95);
      const r = clamp(P.rPct, 0, 10) / 100;
      const T = clamp(P.T, 0.25, 2.0);
      const pReal = clamp(P.pRealPct, 5, 95) / 100;
      const type = P.type === 'put' ? 'put' : 'call';

      const Su = S0 * u;
      const Sd = S0 * d;
      const fu = type === 'call' ? Math.max(0, Su - K) : Math.max(0, K - Su);
      const fd = type === 'call' ? Math.max(0, Sd - K) : Math.max(0, K - Sd);

      const delta = (fu - fd) / (Su - Sd);
      const B = Math.exp(-r * T) * (u * fd - d * fu) / (u - d);
      const repCost = delta * S0 + B;

      const erT = Math.exp(r * T);
      const pStar = (erT - d) / (u - d);
      const rnPrice = Math.exp(-r * T) * (pStar * fu + (1 - pStar) * fd);
      const realExpPV = Math.exp(-r * T) * (pReal * fu + (1 - pReal) * fd);
      const diffBelief = realExpPV - repCost;

      return {
        S0, K, u, d, r, T, pReal, type,
        Su, Sd, fu, fd,
        delta, B, repCost, pStar, rnPrice, realExpPV, diffBelief,
        repCheckUp: delta * Su + B * erT,
        repCheckDn: delta * Sd + B * erT
      };
    }
  };

  /* ───────── 4 · CRR Multi-Step Tree, American Exercise & Convergence ───────── */
  const crrTree = {
    P: { S0: 100, K: 100, rPct: 5.0, qPct: 0.0, sigmaPct: 25, T: 1.0, steps: 8, style: 'amerPut' },
    priceSingle(S0, K, r, q, sigma, T, N, style) {
      const dt = T / N;
      const u = Math.exp(sigma * Math.sqrt(dt));
      const d = 1 / u;
      const a = Math.exp((r - q) * dt);
      const p = clamp((a - d) / (u - d), 0, 1);
      const disc = Math.exp(-r * dt);
      const isCall = style === 'euroCall' || style === 'amerCall';
      const isAmer = style === 'amerPut' || style === 'amerCall';

      const vals = new Float64Array(N + 1);
      for (let j = 0; j <= N; j++) {
        const S = S0 * Math.pow(u, j) * Math.pow(d, N - j);
        vals[j] = isCall ? Math.max(0, S - K) : Math.max(0, K - S);
      }
      for (let i = N - 1; i >= 0; i--) {
        for (let j = 0; j <= i; j++) {
          const hold = disc * (p * vals[j + 1] + (1 - p) * vals[j]);
          if (isAmer) {
            const S = S0 * Math.pow(u, j) * Math.pow(d, i - j);
            const ex = isCall ? Math.max(0, S - K) : Math.max(0, K - S);
            vals[j] = Math.max(hold, ex);
          } else {
            vals[j] = hold;
          }
        }
      }
      return vals[0];
    },
    compute(p) {
      const P = Object.assign({}, crrTree.P, p);
      const S0 = clamp(P.S0, 60, 140);
      const K = clamp(P.K, 70, 130);
      const r = clamp(P.rPct, 0, 10) / 100;
      const q = clamp(P.qPct, 0, 8) / 100;
      const sigma = clamp(P.sigmaPct, 5, 60) / 100;
      const T = clamp(P.T, 0.25, 2.0);
      const steps = clamp(Math.round(P.steps), 1, 400);
      const style = P.style || 'amerPut';
      const isCall = style === 'euroCall' || style === 'amerCall';
      const isAmer = style === 'amerPut' || style === 'amerCall';

      const dt = T / steps;
      const u = Math.exp(sigma * Math.sqrt(dt));
      const d = 1 / u;
      const a = Math.exp((r - q) * dt);
      const pStar = clamp((a - d) / (u - d), 0, 1);
      const disc = Math.exp(-r * dt);

      let nodes = null;
      let price = 0;
      let earlyNodes = 0;
      if (steps <= 16) {
        nodes = [];
        for (let i = 0; i <= steps; i++) {
          nodes[i] = [];
          for (let j = 0; j <= i; j++) {
            const S = S0 * Math.pow(u, j) * Math.pow(d, i - j);
            const intrinsic = isCall ? Math.max(0, S - K) : Math.max(0, K - S);
            nodes[i][j] = { S, intrinsic, val: intrinsic, hold: intrinsic, early: false };
          }
        }
        for (let i = steps - 1; i >= 0; i--) {
          for (let j = 0; j <= i; j++) {
            const nd = nodes[i][j];
            const hold = disc * (pStar * nodes[i + 1][j + 1].val + (1 - pStar) * nodes[i + 1][j].val);
            nd.hold = hold;
            if (isAmer && nd.intrinsic > hold + 1e-9) {
              nd.val = nd.intrinsic;
              nd.early = true;
              earlyNodes++;
            } else {
              nd.val = hold;
            }
          }
        }
        price = nodes[0][0].val;
      } else {
        price = crrTree.priceSingle(S0, K, r, q, sigma, T, steps, style);
      }

      const euroType = isCall ? 'call' : 'put';
      const euroPrice = crrTree.priceSingle(S0, K, r, q, sigma, T, steps, isCall ? 'euroCall' : 'euroPut');
      const bsRef = bsPrice(euroType, S0, K, r, q, T, sigma);
      const earlyPremium = Math.max(0, price - euroPrice);

      const convN = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32, 48, 64, 96, 128];
      const convCurve = convN.map(n => ({
        n,
        euro: crrTree.priceSingle(S0, K, r, q, sigma, T, n, isCall ? 'euroCall' : 'euroPut'),
        cur: crrTree.priceSingle(S0, K, r, q, sigma, T, n, style)
      }));

      return {
        S0, K, r, q, sigma, T, steps, style, isCall, isAmer,
        u, d, pStar, price, euroPrice, bsRef, earlyPremium, earlyNodes,
        nodes, convCurve
      };
    }
  };

  /* ───────── 5 · Geometric Brownian Motion & sqrt(T) Scaling ───────── */
  const gbm = {
    P: { S0: 100, muPct: 8.0, sigmaPct: 20, T: 1.0, nPaths: 200, nSteps: 52, seed: 42 },
    compute(p) {
      const P = Object.assign({}, gbm.P, p);
      const S0 = clamp(P.S0, 50, 150);
      const mu = clamp(P.muPct, -10, 25) / 100;
      const sigma = clamp(P.sigmaPct, 5, 55) / 100;
      const T = clamp(P.T, 0.25, 4.0);
      const nPaths = clamp(Math.round(P.nPaths), 50, 1000);
      const nSteps = clamp(Math.round(P.nSteps), 12, 104);
      const dt = T / nSteps;
      const drift = (mu - 0.5 * sigma * sigma) * dt;
      const diff = sigma * Math.sqrt(dt);

      const rng = mulberry32(P.seed || 42);
      const samplePaths = [];
      const finals = new Float64Array(nPaths);

      for (let k = 0; k < nPaths; k++) {
        let S = S0;
        const path = k < 24 ? [S] : null;
        for (let i = 1; i <= nSteps; i++) {
          S *= Math.exp(drift + diff * randn(rng));
          if (path) path.push(S);
        }
        finals[k] = S;
        if (path) samplePaths.push(path);
      }

      const sorted = Array.from(finals).sort((a, b) => a - b);
      const empMean = sorted.reduce((a, b) => a + b, 0) / nPaths;
      const empMedian = sorted[Math.floor(nPaths / 2)];
      const empP05 = sorted[Math.floor(0.05 * nPaths)];
      const empP95 = sorted[Math.floor(0.95 * nPaths)];

      const theoMean = S0 * Math.exp(mu * T);
      const theoMedian = S0 * Math.exp((mu - 0.5 * sigma * sigma) * T);
      const theoP05 = S0 * Math.exp((mu - 0.5 * sigma * sigma) * T - 1.6448536 * sigma * Math.sqrt(T));
      const theoP95 = S0 * Math.exp((mu - 0.5 * sigma * sigma) * T + 1.6448536 * sigma * Math.sqrt(T));

      // Envelope curves along t = 0..T
      const envelope = [];
      for (let i = 0; i <= nSteps; i++) {
        const t = i * dt;
        const med = S0 * Math.exp((mu - 0.5 * sigma * sigma) * t);
        const s1 = sigma * Math.sqrt(t);
        envelope.push({
          t,
          med,
          mean: S0 * Math.exp(mu * t),
          up1: med * Math.exp(s1),
          dn1: med * Math.exp(-s1),
          up2: med * Math.exp(2 * s1),
          dn2: med * Math.exp(-2 * s1)
        });
      }

      return {
        S0, mu, sigma, T, nPaths, nSteps,
        samplePaths, finals: sorted, envelope,
        empMean, empMedian, empP05, empP95,
        theoMean, theoMedian, theoP05, theoP95
      };
    }
  };

  /* ───────── 6 · Black-Scholes Closed-Form & Crank-Nicolson Finite-Difference PDE ───────── */
  const bsPde = {
    P: { K: 100, rPct: 4.0, qPct: 1.0, sigmaPct: 22, T: 1.0, tau: 1.0, type: 'call' },
    solve(p) {
      const P = Object.assign({}, bsPde.P, p);
      const K = clamp(P.K, 70, 130);
      const r = clamp(P.rPct, 0, 10) / 100;
      const q = clamp(P.qPct, 0, 8) / 100;
      const sigma = clamp(P.sigmaPct, 8, 55) / 100;
      const T = clamp(P.T, 0.25, 2.0);
      const tauShow = clamp(P.tau != null ? P.tau : T, 0, T);
      const type = P.type === 'put' ? 'put' : 'call';

      const M = 160;
      const Nt = 160;
      const xMin = -1.5, xMax = 1.5;
      const dx = (xMax - xMin) / M;
      const dt = T / Nt;

      const xGrid = new Float64Array(M + 1);
      const SGrid = new Float64Array(M + 1);
      let V = new Float64Array(M + 1);
      for (let i = 0; i <= M; i++) {
        xGrid[i] = xMin + i * dx;
        SGrid[i] = K * Math.exp(xGrid[i]);
        V[i] = type === 'call' ? Math.max(0, SGrid[i] - K) : Math.max(0, K - SGrid[i]);
      }

      const nu = r - q - 0.5 * sigma * sigma;
      const alpha = (0.5 * sigma * sigma) / (dx * dx) - nu / (2 * dx);
      const beta = -(sigma * sigma) / (dx * dx) - r;
      const gamma = (0.5 * sigma * sigma) / (dx * dx) + nu / (2 * dx);

      const a = -0.5 * dt * alpha;
      const b = 1 - 0.5 * dt * beta;
      const c = -0.5 * dt * gamma;

      const aR = 0.5 * dt * alpha;
      const bR = 1 + 0.5 * dt * beta;
      const cR = 0.5 * dt * gamma;

      const targetStep = Math.round((tauShow / T) * Nt);
      let VAtTau = new Float64Array(V);

      const nInt = M - 1;
      const cp = new Float64Array(nInt);
      const dp = new Float64Array(nInt);

      const bc = (idx, tauVal) => {
        const S = SGrid[idx];
        const dfQ = Math.exp(-q * tauVal);
        const dfR = Math.exp(-r * tauVal);
        return type === 'call' ? Math.max(0, S * dfQ - K * dfR) : Math.max(0, K * dfR - S * dfQ);
      };

      for (let step = 1; step <= Nt; step++) {
        const tauPrev = (step - 1) * dt;
        const tauNow = step * dt;
        const bcL0 = bc(0, tauPrev), bcR0 = bc(M, tauPrev);
        const bcL1 = bc(0, tauNow), bcR1 = bc(M, tauNow);

        // Right-hand side for interior nodes i = 1..M-1
        const rhs = new Float64Array(nInt);
        for (let k = 0; k < nInt; k++) {
          const i = k + 1;
          const vL = i === 1 ? bcL0 : V[i - 1];
          const vR = i === M - 1 ? bcR0 : V[i + 1];
          rhs[k] = aR * vL + bR * V[i] + cR * vR;
        }
        rhs[0] -= a * bcL1;
        rhs[nInt - 1] -= c * bcR1;

        // Thomas tridiagonal solve
        cp[0] = c / b;
        dp[0] = rhs[0] / b;
        for (let k = 1; k < nInt; k++) {
          const denom = b - a * cp[k - 1];
          cp[k] = k < nInt - 1 ? c / denom : 0;
          dp[k] = (rhs[k] - a * dp[k - 1]) / denom;
        }
        const Vnext = new Float64Array(M + 1);
        Vnext[0] = bcL1;
        Vnext[M] = bcR1;
        Vnext[M - 1] = dp[nInt - 1];
        for (let k = nInt - 2; k >= 0; k--) {
          Vnext[k + 1] = dp[k] - cp[k] * Vnext[k + 2];
        }
        V = Vnext;
        if (step === targetStep) VAtTau = new Float64Array(V);
      }

      // Extract plotting slice S in [55, 155]
      const slice = [];
      let maxErr = 0;
      for (let i = 0; i <= M; i++) {
        const S = SGrid[i];
        if (S >= 55 && S <= 155) {
          const exact = bsPrice(type, S, K, r, q, tauShow, sigma);
          const pdeVal = VAtTau[i];
          const err = Math.abs(pdeVal - exact);
          if (err > maxErr) maxErr = err;
          const payoff = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
          slice.push({ S, pde: pdeVal, exact, payoff });
        }
      }

      // Exact ATM PDE vs BS via linear interpolation on log grid
      const exactAtK = bsPrice(type, K, K, r, q, tauShow, sigma);
      const midIdx = M / 2;
      const pdeAtK = VAtTau[midIdx];

      return {
        K, r, q, sigma, T, tau: tauShow, type,
        slice, maxErr, exactAtK, pdeAtK
      };
    }
  };

  /* ───────── 7 · Greeks & Seeded Delta-Hedging Simulation ───────── */
  const greeksHedge = {
    P: { S0: 100, K: 100, rPct: 4.0, qPct: 0.0, T: 0.25, ivPct: 20, rvPct: 20, steps: 63, costBps: 0, nPaths: 300, seed: 7, type: 'call' },
    anatomy(p) {
      const P = Object.assign({}, greeksHedge.P, p);
      const K = clamp(P.K, 70, 130);
      const r = clamp(P.rPct, 0, 10) / 100;
      const q = clamp(P.qPct, 0, 8) / 100;
      const T = clamp(P.T, 0.02, 2.0);
      const sigma = clamp(P.ivPct, 5, 60) / 100;
      const type = P.type === 'put' ? 'put' : 'call';
      const S0 = clamp(P.S0, 60, 140);
      const cur = bsGreeks(type, S0, K, r, q, T, sigma);
      const curve = [];
      for (let s = 60; s <= 140; s += 2) {
        const g = bsGreeks(type, s, K, r, q, T, sigma);
        curve.push({ s, delta: g.delta, gamma: g.gamma, vega: g.vega1pct, theta: g.thetaDay });
      }
      return { cur, curve, S0, K, r, q, T, sigma, type };
    },
    hedgeSim(p) {
      const P = Object.assign({}, greeksHedge.P, p);
      const S0 = clamp(P.S0, 60, 140);
      const K = clamp(P.K, 70, 130);
      const r = clamp(P.rPct, 0, 10) / 100;
      const q = clamp(P.qPct, 0, 8) / 100;
      const T = clamp(P.T, 0.05, 1.0);
      const iv = clamp(P.ivPct, 5, 60) / 100;
      const rv = clamp(P.rvPct, 5, 60) / 100;
      const steps = clamp(Math.round(P.steps), 4, 500);
      const costRate = clamp(P.costBps, 0, 50) / 10000;
      const nPaths = clamp(Math.round(P.nPaths), 50, 5000);
      const mu = 0.08; // real-world drift intentionally distinct from r to prove drift independence

      const C0 = bsPrice('call', S0, K, r, q, T, iv);
      const dt = T / steps;
      const drift = (mu - q - 0.5 * rv * rv) * dt;
      const diff = rv * Math.sqrt(dt);
      const erDt = Math.exp(r * dt);
      const eqDt = Math.exp(q * dt);
      const dfT = Math.exp(-r * T);

      const rng = mulberry32(P.seed || 7);
      const pnls = new Float64Array(nPaths);
      let sum = 0, sum2 = 0, sumCost = 0;

      for (let k = 0; k < nPaths; k++) {
        let S = S0;
        let delta = bsGreeks('call', S, K, r, q, T, iv).delta;
        // Seller receives C0, buys delta shares, holds cash = C0 - delta*S
        let cash = C0 - delta * S - costRate * Math.abs(delta) * S;
        let pathCost = costRate * Math.abs(delta) * S;

        for (let i = 1; i <= steps; i++) {
          cash *= erDt;
          // Dividend earned on held shares over dt
          cash += delta * S * (eqDt - 1);
          S *= Math.exp(drift + diff * randn(rng));
          const tau = T - i * dt;
          if (i < steps) {
            const newDelta = bsGreeks('call', S, K, r, q, tau, iv).delta;
            const dDelta = newDelta - delta;
            const fee = costRate * Math.abs(dDelta) * S;
            cash -= dDelta * S + fee;
            pathCost += fee * Math.exp(-r * i * dt);
            delta = newDelta;
          }
        }
        const payoff = Math.max(0, S - K);
        // Terminal P&L of short call + delta hedge, discounted to t=0 for apples-to-apples premium scale
        const pnlPV = dfT * (cash + delta * S - payoff);
        pnls[k] = pnlPV;
        sum += pnlPV;
        sum2 += pnlPV * pnlPV;
        sumCost += pathCost;
      }

      const mean = sum / nPaths;
      const sd = Math.sqrt(Math.max(0, sum2 / nPaths - mean * mean));
      const sorted = Array.from(pnls).sort((a, b) => a - b);
      const p05 = sorted[Math.floor(0.05 * nPaths)];
      const p95 = sorted[Math.floor(0.95 * nPaths)];

      return {
        S0, K, r, q, T, iv, rv, steps, costBps: P.costBps, nPaths,
        C0, mean, sd, p05, p95, meanCost: sumCost / nPaths,
        pnls: sorted
      };
    }
  };

  /* ───────── 8 · Market Breaks: Real Cboe SPX Smile & FRED SP500 Fat Tails ───────── */
  // Source: Cboe delayed quotes _SPX.json (snapshot timestamp 2026-11-13 00:54:32 UTC; Nov 12 close 7592.40; Dec 18, 2026 expiry)
  const SPX_SMILE_SNAPSHOT = {
    asOf: '2026-11-12',
    expiry: '2026-12-18',
    dteDays: 35,
    spot: 7592.40,
    atmIvPct: 14.52,
    vixLatest: 17.49,
    vixDate: '2026-11-11',
    skewLatest: 149.09,
    skewDate: '2026-11-11',
    oct1987DropPct: -20.47,
    chain: [
      { k: 6000, m: 79.0, type: 'P', bid: 6.9, ask: 7.2, iv: 38.40, spreadPct: 4.3, oi: 150904 },
      { k: 6200, m: 81.7, type: 'P', bid: 8.7, ask: 9.0, iv: 35.16, spreadPct: 3.4, oi: 31715 },
      { k: 6400, m: 84.3, type: 'P', bid: 11.1, ask: 11.6, iv: 31.92, spreadPct: 4.4, oi: 31217 },
      { k: 6600, m: 86.9, type: 'P', bid: 14.7, ask: 15.2, iv: 28.77, spreadPct: 3.3, oi: 36520 },
      { k: 6800, m: 89.6, type: 'P', bid: 20.2, ask: 20.7, iv: 25.70, spreadPct: 2.4, oi: 27212 },
      { k: 7000, m: 92.2, type: 'P', bid: 29.3, ask: 29.9, iv: 22.75, spreadPct: 2.0, oi: 459144 },
      { k: 7200, m: 94.8, type: 'P', bid: 45.2, ask: 45.8, iv: 19.90, spreadPct: 1.3, oi: 34210 },
      { k: 7400, m: 97.5, type: 'P', bid: 73.7, ask: 74.8, iv: 17.15, spreadPct: 1.5, oi: 51346 },
      { k: 7500, m: 98.8, type: 'P', bid: 96.0, ask: 97.2, iv: 15.80, spreadPct: 1.2, oi: 45595 },
      { k: 7600, m: 100.1, type: 'C', bid: 148.2, ask: 149.3, iv: 14.52, spreadPct: 0.7, oi: 44406 },
      { k: 7700, m: 101.4, type: 'C', bid: 91.8, ask: 92.6, iv: 13.34, spreadPct: 0.9, oi: 95359 },
      { k: 7800, m: 102.7, type: 'C', bid: 50.5, ask: 51.3, iv: 12.42, spreadPct: 1.6, oi: 48640 },
      { k: 8000, m: 105.4, type: 'C', bid: 11.0, ask: 11.5, iv: 11.46, spreadPct: 4.4, oi: 381360 },
      { k: 8200, m: 108.0, type: 'C', bid: 2.3, ask: 2.65, iv: 11.77, spreadPct: 14.1, oi: 33579 },
      { k: 8400, m: 110.6, type: 'C', bid: 0.9, ask: 1.15, iv: 13.26, spreadPct: 24.4, oi: 24986 },
      { k: 8800, m: 115.9, type: 'C', bid: 0.3, ask: 0.5, iv: 16.97, spreadPct: 50.0, oi: 30940 },
      { k: 9100, m: 119.9, type: 'C', bid: 0.15, ask: 0.4, iv: 19.49, spreadPct: 90.9, oi: 5936 }
    ]
  };

  // Source: FRED SP500 & VIXCLS daily series (2016-11-14 to 2026-11-11, n = 2511 trading days)
  const SP500_EMPIRICAL = {
    from: '2016-11-14',
    to: '2026-11-11',
    n: 2511,
    dailySdPct: 1.147,
    annVolPct: 18.20,
    skewness: -0.69,
    kurtosis: 19.5,
    excessKurtosis: 16.5,
    gt3: 37,
    gt4: 17,
    gt5: 11,
    normalExpectedGt4: 0.16,
    acReturn1: -0.144,
    acAbsReturn1: 0.367,
    acAbsReturn5: 0.333,
    worstDay: { d: '2020-03-16', pct: -11.98, z: -11.18 },
    bestDay: { d: '2025-04-09', pct: 9.52, z: 7.88 },
    vixPeak2020: { d: '2020-03-16', v: 82.69 },
    // 0.5 sigma bins from [-6, +6) plus 3 neg extremes & 3 pos extremes
    bins: [
      [-5.75, 0], [-5.25, 2], [-4.75, 1], [-4.25, 2], [-3.75, 7], [-3.25, 11],
      [-2.75, 18], [-2.25, 26], [-1.75, 57], [-1.25, 129], [-0.75, 272], [-0.25, 680],
      [0.25, 698], [0.75, 376], [1.25, 142], [1.75, 44], [2.25, 22], [2.75, 10],
      [3.25, 0], [3.75, 2], [4.25, 2], [4.75, 1], [5.25, 2], [5.75, 1]
    ],
    // [YYYY-MM, realizedVolPct, monthEndVIX]
    monthlyVol: [
      ['2016-11', 6.7, 13.33], ['2016-12', 7.9, 14.04], ['2017-01', 6.5, 11.99], ['2017-02', 5.4, 12.92],
      ['2017-03', 7.9, 12.37], ['2017-04', 7.2, 10.82], ['2017-05', 7.6, 10.41], ['2017-06', 7.2, 11.18],
      ['2017-07', 5.7, 10.26], ['2017-08', 9.1, 10.59], ['2017-09', 5.7, 9.51], ['2017-10', 5.0, 10.18],
      ['2017-11', 6.5, 11.28], ['2017-12', 5.5, 11.04], ['2018-01', 9.6, 13.54], ['2018-02', 27.0, 19.85],
      ['2018-03', 19.8, 19.97], ['2018-04', 16.9, 15.93], ['2018-05', 10.3, 15.43], ['2018-06', 8.7, 16.09],
      ['2018-07', 8.8, 12.83], ['2018-08', 7.2, 12.86], ['2018-09', 5.5, 12.12], ['2018-10', 22.5, 21.23],
      ['2018-11', 18.4, 18.07], ['2018-12', 30.0, 25.42], ['2019-01', 18.9, 16.57], ['2019-02', 8.4, 14.78],
      ['2019-03', 11.5, 13.71], ['2019-04', 6.7, 13.12], ['2019-05', 14.6, 18.71], ['2019-06', 11.5, 15.08],
      ['2019-07', 8.2, 16.12], ['2019-08', 22.3, 18.98], ['2019-09', 8.7, 16.24], ['2019-10', 12.9, 13.22],
      ['2019-11', 6.2, 12.62], ['2019-12', 7.8, 13.78], ['2020-01', 11.6, 18.84], ['2020-02', 25.6, 40.11],
      ['2020-03', 92.5, 53.54], ['2020-04', 41.0, 34.15], ['2020-05', 22.6, 27.51], ['2020-06', 29.1, 30.43],
      ['2020-07', 13.5, 24.46], ['2020-08', 9.4, 26.41], ['2020-09', 24.4, 26.37], ['2020-10', 20.6, 38.02],
      ['2020-11', 17.6, 20.57], ['2020-12', 8.8, 22.75], ['2021-01', 16.7, 33.09], ['2021-02', 14.1, 27.95],
      ['2021-03', 16.4, 19.40], ['2021-04', 11.2, 18.61], ['2021-05', 13.8, 16.76], ['2021-06', 8.3, 15.83],
      ['2021-07', 11.6, 18.24], ['2021-08', 8.3, 16.48], ['2021-09', 13.0, 23.14], ['2021-10', 11.7, 16.26],
      ['2021-11', 12.7, 27.19], ['2021-12', 16.9, 17.22], ['2022-01', 18.7, 24.83], ['2022-02', 22.1, 30.15],
      ['2022-03', 22.8, 20.56], ['2022-04', 25.1, 33.40], ['2022-05', 30.7, 26.19], ['2022-06', 29.6, 28.71],
      ['2022-07', 19.9, 21.33], ['2022-08', 19.3, 25.87], ['2022-09', 24.6, 31.62], ['2022-10', 27.8, 25.88],
      ['2022-11', 27.2, 20.58], ['2022-12', 18.1, 21.67], ['2023-01', 16.9, 19.40], ['2023-02', 15.2, 20.70],
      ['2023-03', 17.8, 18.70], ['2023-04', 11.6, 15.78], ['2023-05', 12.5, 17.94], ['2023-06', 11.5, 13.59],
      ['2023-07', 8.2, 13.63], ['2023-08', 12.1, 13.57], ['2023-09', 11.4, 17.52], ['2023-10', 13.9, 18.14],
      ['2023-11', 12.6, 12.92], ['2023-12', 10.0, 12.45], ['2024-01', 10.8, 14.35], ['2024-02', 12.5, 13.40],
      ['2024-03', 9.9, 13.01], ['2024-04', 13.4, 15.65], ['2024-05', 9.7, 12.92], ['2024-06', 6.8, 12.44],
      ['2024-07', 14.2, 16.36], ['2024-08', 19.1, 15.00], ['2024-09', 13.6, 16.73], ['2024-10', 10.8, 23.16],
      ['2024-11', 12.5, 13.51], ['2024-12', 14.2, 17.35], ['2025-01', 13.8, 16.43], ['2025-02', 13.0, 19.63],
      ['2025-03', 20.7, 22.28], ['2025-04', 47.7, 24.70], ['2025-05', 16.7, 18.57], ['2025-06', 10.4, 16.73],
      ['2025-07', 6.5, 16.72], ['2025-08', 11.7, 15.36], ['2025-09', 7.4, 16.28], ['2025-10', 13.5, 17.44],
      ['2025-11', 15.0, 16.35], ['2025-12', 8.6, 14.95], ['2026-01', 10.3, 17.44], ['2026-02', 13.2, 19.86],
      ['2026-03', 18.1, 25.25], ['2026-04', 13.6, 16.89], ['2026-05', 10.6, 15.32], ['2026-06', 17.0, 16.45],
      ['2026-07', 11.6, 15.99], ['2026-08', 10.4, 14.92], ['2026-09', 10.6, 16.34], ['2026-10', 11.3, 19.42]
    ]
  };

  const marketBreaks = {
    P: { strikeIdx: 9, logScale: true },
    smileInfo(idx) {
      const i = clamp(Math.round(idx), 0, SPX_SMILE_SNAPSHOT.chain.length - 1);
      const row = SPX_SMILE_SNAPSHOT.chain[i];
      const T = SPX_SMILE_SNAPSHOT.dteDays / 365;
      const r = 0.0389; // SOFR 2026-11-10
      const q = 0.013;
      const mid = 0.5 * (row.bid + row.ask);
      const optType = row.type === 'C' ? 'call' : 'put';
      const bsFlat = bsPrice(optType, SPX_SMILE_SNAPSHOT.spot, row.k, r, q, T, SPX_SMILE_SNAPSHOT.atmIvPct / 100);
      return {
        row,
        mid,
        bsFlat,
        diffFromFlat: mid - bsFlat,
        ivSkewPts: row.iv - SPX_SMILE_SNAPSHOT.atmIvPct
      };
    }
  };

  /* ───────── 9 · Heston Stochastic Volatility Monte Carlo & Clearing Netting ───────── */
  const heston = {
    P: { S0: 100, rPct: 4.0, qPct: 1.0, T: 0.5, v0Pct: 20, thetaPct: 20, kappa: 2.0, xi: 0.50, rho: -0.70, nPairs: 400, nSteps: 36, seed: 19 },
    smile(p) {
      const P = Object.assign({}, heston.P, p);
      const S0 = 100;
      const r = clamp(P.rPct, 0, 10) / 100;
      const q = clamp(P.qPct, 0, 8) / 100;
      const T = clamp(P.T, 0.25, 1.5);
      const v0 = Math.pow(clamp(P.v0Pct, 8, 45) / 100, 2);
      const theta = Math.pow(clamp(P.thetaPct, 8, 45) / 100, 2);
      const kappa = clamp(P.kappa, 0.3, 6.0);
      const xi = clamp(P.xi, 0.0, 1.0);
      const rho = clamp(P.rho, -0.95, 0.80);
      const nPairs = clamp(Math.round(P.nPairs), 150, 3000);
      const nSteps = clamp(Math.round(P.nSteps), 16, 80);
      const dt = T / nSteps;
      const sqDt = Math.sqrt(dt);
      const rhoPerp = Math.sqrt(Math.max(0, 1 - rho * rho));
      const fwd = S0 * Math.exp((r - q) * T);

      const rng = mulberry32(P.seed || 19);
      const totalPaths = nPairs * 2;
      const STs = new Float64Array(totalPaths);
      let meanST = 0;

      for (let k = 0; k < nPairs; k++) {
        // Antithetic pair (+Z, -Z)
        let logS1 = Math.log(S0), v1 = v0;
        let logS2 = Math.log(S0), v2 = v0;
        for (let i = 0; i < nSteps; i++) {
          const z1 = randn(rng);
          const z2 = randn(rng);
          const wS1 = z1, wV1 = rho * z1 + rhoPerp * z2;
          const wS2 = -z1, wV2 = -wV1;

          const v1p = Math.max(0, v1);
          const sqV1 = Math.sqrt(v1p);
          logS1 += (r - q - 0.5 * v1p) * dt + sqV1 * sqDt * wS1;
          v1 = Math.max(0, v1p + kappa * (theta - v1p) * dt + xi * sqV1 * sqDt * wV1);

          const v2p = Math.max(0, v2);
          const sqV2 = Math.sqrt(v2p);
          logS2 += (r - q - 0.5 * v2p) * dt + sqV2 * sqDt * wS2;
          v2 = Math.max(0, v2p + kappa * (theta - v2p) * dt + xi * sqV2 * sqDt * wV2);
        }
        const sA = Math.exp(logS1);
        const sB = Math.exp(logS2);
        STs[2 * k] = sA;
        STs[2 * k + 1] = sB;
        meanST += sA + sB;
      }
      meanST /= totalPaths;
      // Martingale control variate scaling so discounted expectation equals S0*e^{-qT}
      const scale = fwd / meanST;
      for (let idx = 0; idx < totalPaths; idx++) STs[idx] *= scale;

      const dfR = Math.exp(-r * T);
      const moneyness = [0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15, 1.20];
      const curve = moneyness.map(m => {
        const K = S0 * m;
        const isCall = K >= fwd;
        let paySum = 0;
        for (let idx = 0; idx < totalPaths; idx++) {
          paySum += isCall ? Math.max(0, STs[idx] - K) : Math.max(0, K - STs[idx]);
        }
        const price = dfR * (paySum / totalPaths);
        const iv = impliedVol(isCall ? 'call' : 'put', price, S0, K, r, q, T);
        return { m: m * 100, K, type: isCall ? 'C' : 'P', price, ivPct: iv * 100 };
      });

      const iv80 = curve[0].ivPct;
      const iv100 = curve[4].ivPct;
      const iv120 = curve[8].ivPct;
      const skew25 = iv80 - iv120;
      const curvature = 0.5 * (iv80 + iv120) - iv100;

      return { S0, r, q, T, v0Pct: P.v0Pct, kappa, xi, rho, nPaths: totalPaths, curve, iv80, iv100, iv120, skew25, curvature };
    }
  };

  /* ───────── 10 · Real-World Uses vs Leveraged Harms & BIS Notional vs Market Value ───────── */
  const usesHarms = {
    P: { budget: 1000, spotChangePct: 0, spreadPct: 12, hedgeRatioPct: 100 },
    compare(p) {
      const P = Object.assign({}, usesHarms.P, p);
      const budget = 1000;
      const S0 = 100;
      const dS = clamp(P.spotChangePct, -30, 30) / 100;
      const ST = S0 * (1 + dS);
      const spreadFrac = clamp(P.spreadPct, 0, 30) / 100;
      const hedgeRatio = clamp(P.hedgeRatioPct, 0, 100) / 100;

      // A) Airline / producer hedging fuel cost (base profit 200 at S0, hurt 1:1 when fuel S rises; collar/forward locks hedgeRatio)
      const baseOpProfit = 200 - (ST - S0) * 10;
      const hedgePayoff = hedgeRatio * (ST - S0) * 10;
      const hedgedProfit = baseOpProfit + hedgePayoff;

      // B) Retail buyer with $1,000 budget buying 7-day 10% OTM calls (K=110, T=7/365, fair sigma=20%, r=4%)
      const T = 7 / 365;
      const K = 110;
      const fairCall = bsPrice('call', S0, K, 0.04, 0.01, T, 0.20);
      // Fair price is ~$0.016 per share! Let's use 5% OTM 14-day call (K=105, T=14/365, sigma=22%) so option price is concrete (~$0.47)
      const T14 = 14 / 365;
      const K105 = 105;
      const fairOpt = bsPrice('call', S0, K105, 0.04, 0.01, T14, 0.22);
      const askOpt = fairOpt * (1 + 0.5 * spreadFrac); // paying half-spread above mid
      const bidOpt = fairOpt * (1 - 0.5 * spreadFrac);
      const contracts = budget / askOpt;
      const optPayoff = contracts * Math.max(0, ST - K105);
      const optRetPct = ((optPayoff - budget) / budget) * 100;
      const spotRetPct = dS * 100;

      // Immediate spread drag on entry-and-exit round trip
      const roundTripDragPct = ((askOpt - bidOpt) / askOpt) * 100;

      // Range of outcomes across spotChange -30..+30
      const curve = [];
      for (let pct = -30; pct <= 30; pct += 2) {
        const s = S0 * (1 + pct / 100);
        const opUn = 200 - (s - S0) * 10;
        const opH = opUn + hedgeRatio * (s - S0) * 10;
        const retOpt = ((contracts * Math.max(0, s - K105) - budget) / budget) * 100;
        curve.push({ pct, opUn, opH, retSpot: pct, retOpt });
      }

      return {
        ST, hedgeRatio, baseOpProfit, hedgedProfit,
        fairOpt, askOpt, contracts, optPayoff, optRetPct, spotRetPct,
        roundTripDragPct, curve
      };
    }
  };

  /* ───────── 11 · Dated Frontier Facts & Models (as of Nov 2026) ───────── */
  const FRONTIER = {
    asOf: '2026-11-13',
    bisPeriod: '2025-S2',
    bisOtcNotionalT: 844.6,       // $844,578B (BIS OTC Derivatives Statistics End-2025)
    bisOtcGrossMktValT: 22.8,     // $22,802B (BIS End-2025)
    bisNettingReductionPct: 85,   // >85% credit exposure reduced via close-out netting (ISDA / BIS End-2025)
    bisNetCreditEstT: 3.4,        // ~15% of $22.8T gross market value
    bisCcpInitialMarginB: 423.5,  // $423.5B posted at major CCPs for cleared IRD & CDS (End-2025)
    bisNonClearedIMB: 1600,       // ~$1.6T collected by dealers for non-cleared exposures (End-2025)
    bisXtdTurnoverDailyT: 17.4,   // $17.4T/day exchange-traded IRD turnover (2025 BIS Triennial Survey)
    bisOtcFxDailyT: 9.6,          // $9.6T/day OTC FX turnover (2025 Triennial)
    bisOtcIrdDailyT: 7.9,         // $7.9T/day OTC IRD turnover (2025 Triennial)
    spx0dte2025SharePct: 59,      // ~59% of SPX volume (~2.3M contracts/day, Cboe 2025)
    spx0dteJul2026PeakPct: 66.2,  // 66.2% of total SPX volume in July 2026 (Cboe)
    liborEndDate: '2023-06-30',
    sofrLatestPct: 3.89,          // FRED SOFR 2026-11-10
    sofrDate: '2026-11-10',
    spxLatest: 7592.40,
    spxDate: '2026-11-12',
    vixLatest: 17.49,
    vixDate: '2026-11-11',
    skewLatest: 149.09,
    skewDate: '2026-11-11',
    ltcmEquityLossB: 4.6,
    ltcmNotionalT: 1.25,          // ~$1.25T - $1.4T
    ltcmRescueB: 3.65,
    aigCdsNotionalB: 527,
    aigBailoutB: 180,
    retailLosses: {
      bryzgalovaSpreadPct: [10, 17],       // Bryzgalova, Pavlova, Sikorskaya (JF 2023)
      deSilvaAvgLossPct: [5, 9],          // de Silva, Smith, So (RoF 2022/2023)
      deSilvaHighVolLossPct: [10, 14],
      chagueLossTraderPct: 97,            // Chague, De-Losso, Giovannetti (2020)
      chagueTellerBeatPct: 0.4
    }
  };

  const frontierModel = {
    P: { mode: 'gamma0dte', dteDays: 1.0, spotShockPct: 1.0, perpPremiumBps: 25, arbCapital: 50 },
    gamma0dte(p) {
      const P = Object.assign({}, frontierModel.P, p);
      const dteDays = clamp(P.dteDays, 0.25, 30);
      const T = dteDays / 365;
      const S0 = 100, K = 100, r = 0.04, q = 0.01, sigma = 0.16;
      const cur = bsGreeks('call', S0, K, r, q, T, sigma);
      const ref30 = bsGreeks('call', S0, K, r, q, 30 / 365, sigma);
      const ratioVs30d = cur.gamma / ref30.gamma;
      const shock = clamp(P.spotShockPct, 0.2, 3.0) / 100;
      const deltaMoveShares = cur.gamma * S0 * shock; // dDelta for shock * S0 move on 1 contract-equivalent share
      const curve = [];
      for (let s = 90; s <= 110; s += 0.5) {
        curve.push({
          s,
          gCur: bsGreeks('call', s, K, r, q, T, sigma).gamma,
          g30: bsGreeks('call', s, K, r, q, 30 / 365, sigma).gamma
        });
      }
      return { dteDays, T, curGamma: cur.gamma, ref30Gamma: ref30.gamma, ratioVs30d, shockPct: P.spotShockPct, deltaMoveShares, curve };
    },
    perpFunding(p) {
      const P = Object.assign({}, frontierModel.P, p);
      const initPremBps = clamp(P.perpPremiumBps, -60, 60);
      const arbCap = clamp(P.arbCapital, 0, 100) / 100; // 0 = 2017 thin arb, 1 = 2026 institutional ETF/basis arb
      const interestBps = 1.0; // 0.01% per 8h standard baseline
      const trace = [];
      let prem = initPremBps;
      // 18 intervals = 6 days (three 8h funding ticks per day)
      for (let step = 0; step <= 18; step++) {
        const clampedDiff = clamp(interestBps - prem, -5, 5);
        const funding8hBps = prem + clampedDiff;
        const annPct = (funding8hBps / 10000) * 3 * 365 * 100;
        trace.push({ step, premBps: prem, funding8hBps, annPct });
        // Arbitrageurs short perp / buy spot proportionally to funding edge & capital capacity
        const pull = 0.08 + 0.42 * arbCap;
        prem = prem * (1 - pull) + interestBps * pull;
      }
      return {
        initPremBps, arbCapPct: P.arbCapital,
        initFunding8hBps: trace[0].funding8hBps,
        initAnnPct: trace[0].annPct,
        endFunding8hBps: trace[trace.length - 1].funding8hBps,
        endAnnPct: trace[trace.length - 1].annPct,
        trace
      };
    }
  };

  return {
    normCDF, normPDF, bsPrice, bsGreeks, impliedVol,
    forward, payoffParity, binomialOne, crrTree, gbm, bsPde, greeksHedge,
    SPX_SMILE_SNAPSHOT, SP500_EMPIRICAL, marketBreaks,
    heston, usesHarms, FRONTIER, frontierModel
  };
}));
