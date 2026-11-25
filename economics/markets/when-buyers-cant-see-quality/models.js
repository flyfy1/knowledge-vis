/* When buyers can't see quality: the page's models.
   - ch1  expected utility: certainty equivalent and the most a risk-averse person would pay for full insurance (CRRA).
   - ch3  Akerlof's lemons: a seeded population of used cars; buyers offer b × the average quality on sale, sellers whose
          car is worth more than the offer withdraw it, round after round. Closed form for the continuum: p* = b·lo/(2 − b).
   - ch4  an insurance pool with skewed (lognormal) expected costs: one premium = (1 + load) × average cost of those still
          enrolled; anyone whose willingness to pay (1 + m)·c + incentive falls below it leaves. Underwriting splits the
          pool into K classes priced separately.
   - ch5  Rothschild–Stiglitz screening: a full-cover plan priced for high risks and a deductible plan priced for low
          risks; the smallest deductible that keeps high risks away, and whether a pooled offer would break the menu.
   - ch6  Spence signalling: a threshold of costly schooling that only the low-cost type finds worth crossing.
   - ch7  moral hazard: care lowers the accident probability but is unobserved; the premium follows the care people
          actually take; the co-pay that maximises the insured person's certainty equivalent.
   - ch8  Stiglitz–Weiss: borrower groups that apply only while the rate is below their limit; the bank's expected return
          per yuan lent as a function of the loan rate; rationing when demand at the bank's best rate exceeds funds.
   - ch9  a toy logistic scorecard on a seeded synthetic population (points-to-double-the-odds scaling).
   Every parameter below is chosen for the model (TUNED) unless a comment names a source; BRIEF.md lists the sources.
   UMD: window.LemonsModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LemonsModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── helpers ───────── */
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  function fmt(x, d) {
    if (!isFinite(x)) return '—';
    d = d == null ? 0 : d;
    let s = Math.abs(x).toFixed(d);
    if (Number(s) === 0) s = (0).toFixed(d);
    const [i, f] = s.split('.');
    const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (x < 0 && Number(s) !== 0 ? '−' : '') + ii + (f ? '.' + f : '');
  }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ───────── CRRA utility ───────── */
  function u(w, g) { if (w <= 0) return -1e12; return Math.abs(g - 1) < 1e-9 ? Math.log(w) : (g < 1e-9 ? w : Math.pow(w, 1 - g) / (1 - g)); }
  function uinv(v, g) { return Math.abs(g - 1) < 1e-9 ? Math.exp(v) : (g < 1e-9 ? v : Math.pow(v * (1 - g), 1 / (1 - g))); }
  // a lottery: [[prob, wealth], …]
  function eu(lot, g) { let s = 0; for (const [p, w] of lot) s += p * u(w, g); return s; }
  function ce(lot, g) { return uinv(eu(lot, g), g); }

  /* ───────── ch1: why buy insurance that loses money on average ─────────
     wealth W, a loss L with probability p (both in 10,000 yuan), relative risk aversion g. */
  function insure({ W, L, p, g }) {
    const lot = [[1 - p, W], [p, W - L]];
    const c = ce(lot, g);
    const ev = p * L;
    const maxPrem = W - c;
    return { ev, ce: c, maxPrem, riskPrem: maxPrem - ev, ratio: maxPrem / ev };
  }
  const CH1 = { W: 20, L: 10, p: 0.02, g: 2 };

  /* ───────── ch3: Akerlof's lemons ─────────
     n cars, seller's value q uniform on [lo, hi] (seeded, 10,000 yuan); each buyer values a car at b·q. Buyers see only
     the average of what is on sale. Round t: sellers with q ≤ p_t sell; next offer p_{t+1} = b × mean(q on sale). */
  const CH3 = { n: 200, hi: 10, lo: 2, b: 1.5, seed: 1970 };
  function makeCars(n, lo, hi, seed) {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) out.push(lo + (hi - lo) * ((i + r()) / n)); // stratified: one car per 1/n slice
    return out;
  }
  function lemons({ b, lo, hi = CH3.hi, n = CH3.n, seed = CH3.seed, maxRounds = 60 }) {
    const cars = makeCars(n, lo, hi, seed);
    const allGain = cars.reduce((s, q) => s + (b - 1) * q, 0);
    const mean = cars.reduce((s, q) => s + q, 0) / n;
    const hist = [];
    let p = b * mean, prevN = -1;
    for (let t = 0; t < maxRounds; t++) {
      const on = cars.filter(q => q <= p + 1e-12);
      const k = on.length, avg = k ? on.reduce((s, q) => s + q, 0) / k : 0;
      const gain = on.reduce((s, q) => s + (b - 1) * q, 0);
      hist.push({ t, p, k, share: k / n, avg, gainShare: allGain > 0 ? gain / allGain : 0 });
      if (k === prevN || k === 0) break;
      prevN = k;
      p = b * avg;
    }
    return { cars, hist, final: hist[hist.length - 1] };
  }
  // continuum: q ~ U[lo, hi]; fixed point of p = b (lo + p)/2 inside [lo, hi]
  function lemonsFixed(b, lo, hi) {
    if (b * (lo + hi) / 2 >= hi) return { p: hi, share: 1 };
    if (b >= 2) return { p: hi, share: 1 };
    const p = b * lo / (2 - b);
    return { p, share: clamp((p - lo) / (hi - lo), 0, 1) };
  }

  /* ───────── ch4: an insurance pool and its death spiral ─────────
     n people, each facing the ch1 gamble: a loss L with their own probability p_i (wealth W, risk aversion g, as in ch1).
     p_i = med · exp(sig · z), z standard normal (seeded), capped at pCap. Each person knows p_i; the insurer, without
     underwriting, sees only the pool. Willingness to pay = ch1's maximum premium at p_i + inc (a reward for joining, or
     a penalty for staying out). Premium of a class = (1 + load) × mean expected loss of its enrolled members. With
     underwriting the insurer sorts people into K equal-size classes by risk and prices each class separately. */
  const CH4 = { n: 1000, W: 20, L: 10, med: 0.01, sig: 1.0, pCap: 0.6, load: 0.15, g: 2, inc: 0, K: 1, seed: 2010 };
  function makeRisks(n, med, sig, cap, seed) {
    const r = rng(seed), z = [];
    for (let i = 0; i < n; i++) z.push(gauss(r));
    return z.sort((a, b) => a - b).map(v => Math.min(cap, med * Math.exp(sig * v)));
  }
  const ZS = (() => { const r = rng(CH4.seed), z = []; for (let i = 0; i < CH4.n; i++) z.push(gauss(r)); return z.sort((a, b) => a - b); })();
  function risks(sig, P = CH4) { return ZS.map(v => Math.min(P.pCap, P.med * Math.exp(sig * v))); }
  // yuan: L is in 10,000 yuan
  function wtpYuan(p, g, P = CH4) { return insure({ W: P.W, L: P.L, p, g }).maxPrem * 1e4; }
  function pool(o) {
    const P = Object.assign({}, CH4, o);
    const ps = risks(P.sig, P), n = ps.length, per = Math.floor(n / P.K);
    const cost = ps.map(p => p * P.L * 1e4), wtp = ps.map(p => wtpYuan(p, P.g, P) + P.inc);
    const classes = [];
    for (let k = 0; k < P.K; k++) { const a = k * per, b = k === P.K - 1 ? n : (k + 1) * per; const idx = []; for (let i = a; i < b; i++) idx.push(i); classes.push(idx); }
    const avgCost = idx => idx.reduce((s, i) => s + cost[i], 0) / idx.length;
    let prem = classes.map(idx => (1 + P.load) * avgCost(idx));
    const hist = []; let prevKey = null;
    for (let t = 0; t < (P.maxRounds || 80); t++) {
      const ins = classes.map((idx, k) => idx.filter(i => wtp[i] >= prem[k] - 1e-9));
      const nIn = ins.reduce((s, a) => s + a.length, 0);
      hist.push({ t, prem: prem.slice(), nIn, share: nIn / n, inClass: ins.map(a => a.length) });
      const key = ins.map(a => a.length).join();
      if (key === prevKey) break;
      prevKey = key;
      prem = ins.map((a, k) => a.length ? (1 + P.load) * avgCost(a) : prem[k]);
    }
    const f = hist[hist.length - 1];
    const live = f.prem.filter((p, k) => f.inClass[k] > 0);
    return { ps, cost, wtp, classes, hist, final: f, rounds: hist.length - 1, premMin: live.length ? Math.min(...live) : NaN, premMax: live.length ? Math.max(...live) : NaN,
      meanCost: cost.reduce((s, c) => s + c, 0) / n };
  }
  // curves for the K = 1 picture: people sorted by willingness to pay (highest first)
  function poolCurves(o) {
    const P = Object.assign({}, CH4, o), ps = risks(P.sig, P).slice().sort((a, b) => b - a), n = ps.length, pts = [];
    let s = 0;
    for (let k = 0; k < n; k++) { const c = ps[k] * P.L * 1e4; s += c; pts.push({ share: (k + 1) / n, wtp: wtpYuan(ps[k], P.g, P) + P.inc, ac: (1 + P.load) * s / (k + 1), cost: c }); }
    return pts;
  }
  function topShare(xs, q) { const a = xs.slice().sort((x, y) => x - y), n = a.length, k = Math.round(n * q); const tot = a.reduce((s, c) => s + c, 0); return a.slice(n - k).reduce((s, c) => s + c, 0) / tot; }

  /* ───────── ch5: screening with a deductible (Rothschild–Stiglitz) ─────────
     W, L in 10,000 yuan; two risk types; plan A = full cover at the high-risk fair price; plan B = cover L − D at the
     low-risk fair price. Each type takes whichever gives it the higher expected utility (or neither). */
  const CH5 = { W: 20, L: 10, pL: 0.05, pH: 0.2, g: 2, lam: 0.3 };
  function planEU(p, cover, rate, P) { const prem = rate * cover; return eu([[1 - p, P.W - prem], [p, P.W - prem - (P.L - cover)]], P.g); }
  function planCE(p, cover, rate, P) { return uinv(planEU(p, cover, rate, P), P.g); }
  function choose(p, D, P) { // 'A', 'B' or 'none'
    const a = planEU(p, P.L, P.pH, P), b = planEU(p, P.L - D, P.pL, P), z = planEU(p, 0, 0, P);
    if (a >= b - 1e-12 && a >= z) return 'A';
    if (b >= z) return 'B';
    return 'none';
  }
  function minSeparatingD(P) { // smallest D with EU_H(A) ≥ EU_H(B(D))
    const a = planEU(P.pH, P.L, P.pH, P);
    let lo = 0, hi = P.L;
    if (planEU(P.pH, P.L, P.pL, P) <= a) return 0;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (planEU(P.pH, P.L - mid, P.pL, P) > a) lo = mid; else hi = mid; }
    return hi;
  }
  function bestPooled(P) { // the low-risk type's favourite cover at the pooled fair rate
    const rate = P.lam * P.pH + (1 - P.lam) * P.pL;
    let best = -Infinity, bc = 0;
    for (let i = 0; i <= 2000; i++) { const c = P.L * i / 2000, v = planEU(P.pL, c, rate, P); if (v > best) { best = v; bc = c; } }
    return { rate, cover: bc, eu: best, ce: uinv(best, P.g) };
  }
  function screen(P) {
    const D = P.D, Dstar = minSeparatingD(P);
    const cH = choose(P.pH, D, P), cL = choose(P.pL, D, P);
    const profit = (type, c) => { const p = type === 'H' ? P.pH : P.pL; if (c === 'A') return (P.pH - p) * P.L; if (c === 'B') return (P.pL - p) * (P.L - D); return 0; };
    const prof = P.lam * profit('H', cH) + (1 - P.lam) * profit('L', cL);
    const ceLsep = planCE(P.pL, P.L - Dstar, P.pL, P), ceLfull = P.W - P.pL * P.L;
    const pooled = bestPooled(P);
    return { D, Dstar, cH, cL, separated: cH === 'A' && cL === 'B', profit: prof, ceLsep, ceLfull, ceLnow: planCE(P.pL, P.L - D, P.pL, P), pooled, breaks: pooled.eu > planEU(P.pL, P.L - Dstar, P.pL, P) };
  }
  function lamBreak(P) { // the high-risk share below which a pooled offer beats the separating menu for low risks
    let lo = 0.001, hi = 0.999;
    const br = lam => screen(Object.assign({}, P, { lam, D: 0 })).breaks;
    if (!br(lo)) return 0;
    for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (br(mid)) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  /* ───────── ch6: Spence signalling ─────────
     wages wL, wH (10,000 yuan a year of work-life value, toy); cost per year of schooling cL, cH; employers pay wH to
     anyone with at least eStar years. */
  const CH6 = { wL: 8, wH: 14, cH: 2, cL: 4, eStar: 2, lam: 0.5 };
  function spence({ wL, wH, cH, cL, eStar, lam }) {
    const lowMimics = wH - cL * eStar > wL;
    const highSignals = wH - cH * eStar >= wL;
    const range = [(wH - wL) / cL, (wH - wL) / cH];
    let state = 'sep';
    if (!highSignals) state = 'none'; else if (lowMimics) state = 'all';
    const avg = lam * wH + (1 - lam) * wL;
    return { state, range, lowNet: wH - cL * eStar, highNet: wH - cH * eStar, waste: state === 'sep' ? lam * cH * eStar : state === 'all' ? lam * cH * eStar + (1 - lam) * cL * eStar : 0, avg };
  }

  /* ───────── ch7: moral hazard and the co-pay ─────────
     accident probability p(e) = p0 (1 − a·e) for care e in [0, 1], care costs k·e² (10,000 yuan equivalent); the insured
     keeps a share s of the loss; the insurer cannot see e and prices at the care people actually take. */
  const CH7 = { W: 20, L: 10, p0: 0.1, a: 0.7, k: 0.6, g: 2 };
  function bestCare(s, prem, P) {
    let lo = 0, hi = 1; const f = e => { const p = P.p0 * (1 - P.a * e), c = P.k * e * e; return eu([[1 - p, P.W - prem - c], [p, P.W - prem - s * P.L - c]], P.g); };
    for (let i = 0; i < 60; i++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (f(m1) < f(m2)) lo = m1; else hi = m2; }
    const e = (lo + hi) / 2; return { e, v: f(e) };
  }
  function hazard(s, P = CH7) {
    let prem = (1 - s) * P.L * P.p0, e = 0, v = 0;
    for (let i = 0; i < 80; i++) { const b = bestCare(s, prem, P); e = b.e; v = b.v; const np = (1 - s) * P.L * P.p0 * (1 - P.a * e); if (Math.abs(np - prem) < 1e-10) { prem = np; break; } prem = np; }
    const b = bestCare(s, prem, P);
    return { s, e: b.e, p: P.p0 * (1 - P.a * b.e), prem, ce: uinv(b.v, P.g) };
  }
  function hazardBest(P = CH7) { let best = null; for (let i = 0; i <= 100; i++) { const h = hazard(i / 100, P); if (!best || h.ce > best.ce + 1e-12) best = h; } return best; }
  function firstBest(P = CH7) { // care observable: full cover, premium at the chosen care
    let best = null;
    for (let i = 0; i <= 1000; i++) { const e = i / 1000, p = P.p0 * (1 - P.a * e), w = P.W - p * P.L - P.k * e * e; if (!best || w > best.ce) best = { e, p, ce: w }; }
    return best;
  }

  /* ───────── ch8: Stiglitz–Weiss credit rationing ─────────
     four borrower groups, each borrows 1; a project pays R = μ/π with probability π, else 0 (limited liability). A group
     applies while μ − π(1 + r) ≥ u0. With gap > 0 the riskier groups' projects are also worse on average
     (μ_i = μ0 − gap·i/3); gap = 0 is Stiglitz and Weiss's own equal-mean case. */
  const CH8 = { groups: [{ w: 0.4, pi: 0.97 }, { w: 0.3, pi: 0.88 }, { w: 0.2, pi: 0.75 }, { w: 0.1, pi: 0.6 }], mu0: 1.25, u0: 0.05, gap: 0.2, F: 0.5, cf: 1.02 };
  function swGroups(P) { return P.groups.map((g, i) => { const mu = P.mu0 - P.gap * i / (P.groups.length - 1); return Object.assign({}, g, { mu, rMax: (mu - P.u0) / g.pi - 1 }); }); }
  function swAt(r, G) {
    let w = 0, wp = 0; for (const g of G) if (r <= g.rMax + 1e-12) { w += g.w; wp += g.w * g.pi; }
    return { demand: w, ret: w ? (1 + r) * wp / w : 0 };
  }
  function sw(P) {
    const G = swGroups(P), curve = [];
    let best = { r: 0, ret: -1 };
    for (let i = 0; i <= 1000; i++) { const r = i / 1000, a = swAt(r, G); curve.push({ r, demand: a.demand, ret: a.ret }); if (a.ret > best.ret + 1e-12) best = { r, ret: a.ret, demand: a.demand }; }
    const lastMax = Math.max(...G.map(g => g.rMax));
    const interior = best.r < lastMax - 1e-6 && best.demand > Math.min(...G.map(g => g.w)) + 1e-9;
    const rationed = best.demand > P.F ? 1 - P.F / best.demand : 0;
    // with a score that tells the groups apart: each priced so the bank's expected return equals its cost of funds
    const priced = G.map(g => { const r = P.cf / g.pi - 1; return { r, served: r <= g.rMax + 1e-12 }; });
    return { G, curve, best, interior, rationed, priced };
  }

  /* ───────── ch9: a toy scorecard ─────────
     synthetic borrowers (seeded); true default probability from a logistic in three features; score = 600 at good:bad odds
     50:1, +20 points each time the odds double (the common points-to-double-odds convention; the coefficients are TUNED,
     real bureaus' formulas are proprietary). */
  const CH9 = { n: 4000, seed: 2026, b0: -4.6, bLate: 0.9, bDti: 3.5, bYears: -0.13, pdo: 20, base: 600, baseOdds: 50, cut: 600 };
  function pd(late, dti, years, P = CH9) { const z = P.b0 + P.bLate * late + P.bDti * dti + P.bYears * years; return 1 / (1 + Math.exp(-z)); }
  function score(prob, P = CH9) { const f = P.pdo / Math.LN2, off = P.base - f * Math.log(P.baseOdds); return off + f * Math.log((1 - prob) / prob); }
  function makeBorrowers(P = CH9) {
    const r = rng(P.seed), out = [];
    for (let i = 0; i < P.n; i++) {
      let late = 0; const lam = 0.7; let L = Math.exp(-lam), k = 0, pr = 1; do { k++; pr *= r(); } while (pr > L); late = Math.min(5, k - 1);
      const dti = 0.05 + 0.85 * r(), years = Math.floor(21 * r());
      const q = pd(late, dti, years, P);
      out.push({ late, dti, years, pd: q, s: score(q, P), bad: r() < q });
    }
    return out;
  }
  const BORROWERS = makeBorrowers(CH9);
  function cutoff(cut, B = BORROWERS) {
    let ap = 0, apBad = 0, bad = 0;
    for (const x of B) { if (x.bad) bad++; if (x.s >= cut) { ap++; if (x.bad) apBad++; } }
    const n = B.length;
    return { approve: ap / n, badApproved: ap ? apBad / ap : 0, badRate: bad / n, caught: bad ? (bad - apBad) / bad : 0, badRejectedShare: (n - ap) ? (bad - apBad) / (n - ap) : 0 };
  }

  return { rng, gauss, fmt, clamp, u, uinv, eu, ce, insure, CH1, CH3, makeCars, lemons, lemonsFixed, CH4, risks, wtpYuan, pool, poolCurves, topShare,
    CH5, planEU, planCE, choose, minSeparatingD, bestPooled, screen, lamBreak, CH6, spence, CH7, hazard, hazardBest, firstBest, bestCare,
    CH8, swGroups, swAt, sw, CH9, pd, score, makeBorrowers, BORROWERS, cutoff };
});
