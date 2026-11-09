'use strict';
// Externalities model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.EXT_MODEL) and node tests (module.exports).
// Market for paper: Q in tonnes, prices in yuan per tonne. Linear curves, constant external damage per tonne.
(function (root) {
  const BASE = { a: 100, b: 1, c: 20, d: 1 }; // demand MB = a − bQ, private supply MPC = c + dQ
  const pos = v => Math.max(0, v);

  const MB = (Q, p = BASE) => p.a - p.b * Q;
  const MPC = (Q, p = BASE) => p.c + p.d * Q;
  const MSC = (Q, e, p = BASE) => MPC(Q, p) + e;

  /* ---- step 0: market without side effects ---- */
  const marketQ = (p = BASE) => pos((p.a - p.c) / (p.b + p.d));
  const marketP = (p = BASE) => MB(marketQ(p), p);
  // Buyers' + sellers' surplus from producing Q tonnes = ∫0^Q (MB − MPC) dq
  const privateSurplus = (Q, p = BASE) => (p.a - p.c) * Q - 0.5 * (p.b + p.d) * Q * Q;
  const consumerSurplus = (p = BASE) => 0.5 * p.b * marketQ(p) ** 2;
  const producerSurplus = (p = BASE) => 0.5 * p.d * marketQ(p) ** 2;
  // Net gain of the q-th tonne (q = 1, 2, …), integrated over [q − 1, q]
  const unitGain = (q, e = 0, p = BASE) => privateSurplus(q, p) - privateSurplus(q - 1, p) - e;

  /* ---- step 1: external cost ---- */
  const socialQ = (e, p = BASE) => pos((p.a - p.c - e) / (p.b + p.d));
  const damage = (Q, e) => e * Q;
  const welfare = (Q, e, p = BASE) => privateSurplus(Q, p) - damage(Q, e);

  /* ---- step 2: deadweight loss ---- */
  const deadweight = (e, p = BASE) => welfare(socialQ(e, p), e, p) - welfare(marketQ(p), e, p);
  // Closed form ½·e·(Q_m − Q*) = e² / (2(b + d)); valid while Q* > 0 (e < a − c).
  const deadweightFormula = (e, p = BASE) => (e * e) / (2 * (p.b + p.d));

  /* ---- step 3: Pigouvian tax ---- */
  const taxedQ = (t, p = BASE) => pos((p.a - p.c - t) / (p.b + p.d));
  const taxWelfare = (t, e, p = BASE) => welfare(taxedQ(t, p), e, p); // tax revenue is a transfer: counted, not lost
  const taxRevenue = (t, p = BASE) => t * taxedQ(t, p);
  const bestTax = e => e;

  /* ---- step 4: the commons ---- */
  const COW = { top: 100, cost: 20 }; // each cow earns (100 − N) yuan when N cows graze; keeping one costs 20
  const net = N => COW.top - COW.cost - N; // profit per cow
  const commonsOpt = () => (COW.top - COW.cost) / 2; // N* maximises N·(80 − N)
  const commonsEq = m => ((COW.top - COW.cost) * m) / (m + 1); // symmetric Nash equilibrium (Cournot)
  const totalProfit = N => N * net(N);
  const bestResponse = othersN => pos((COW.top - COW.cost - othersN) / 2);
  // Herders take turns choosing their best response; start from an equal split of the cooperative total.
  // More herders converge more slowly, so they get more rounds (enough to end within 0.1 cow of equilibrium for m ≤ 20).
  const commonsRounds = m => Math.ceil(10 + 2.5 * m);
  function commonsPath(m, sweeps = commonsRounds(m)) {
    const n = new Array(m).fill(commonsOpt() / m), path = [{ n: n.slice(), N: commonsOpt(), who: -1 }];
    for (let s = 0; s < sweeps; s++) for (let i = 0; i < m; i++) {
      const others = n.reduce((acc, v, j) => acc + (j === i ? 0 : v), 0);
      n[i] = bestResponse(others);
      path.push({ n: n.slice(), N: n.reduce((a, v) => a + v, 0), who: i });
    }
    return path;
  }
  // One more cow for herder i: what they gain vs what everyone loses.
  function extraCow(ni, N) { return { own: net(N + 1) * (ni + 1) - net(N) * ni, all: totalProfit(N + 1) - totalProfit(N), othersLoss: N - ni }; }

  /* ---- step 5: Coase bargaining ---- */
  // G: factory's gain from running (and polluting); D: fishery's damage; T: cost of striking a deal (split equally).
  function coase(G, D, T, right) {
    const efficient = G > D; // pollution is worth it overall
    const def = right === 'factory'; // without a deal: the right holder's way
    const wantChange = def ? D > G : G > D;
    const deal = wantChange && Math.abs(G - D) > T;
    const pollute = deal ? !def : def;
    const pay = deal ? (G + D) / 2 : 0; // midpoint of the bargaining range
    let factory = pollute ? G : 0, fishery = pollute ? -D : 0;
    if (deal) { if (def) { factory += pay; fishery -= pay; } else { factory -= pay; fishery += pay; } factory -= T / 2; fishery -= T / 2; }
    return { pollute, deal, pay, efficient, matchesEfficient: pollute === efficient, factory, fishery, total: factory + fishery, payer: deal ? (def ? 'fishery' : 'factory') : null };
  }

  const api = { BASE, MB, MPC, MSC, marketQ, marketP, privateSurplus, consumerSurplus, producerSurplus, unitGain, socialQ, damage, welfare,
    deadweight, deadweightFormula, taxedQ, taxWelfare, taxRevenue, bestTax, COW, net, commonsOpt, commonsEq, totalProfit, bestResponse, commonsRounds, commonsPath, extraCow, coase };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EXT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
