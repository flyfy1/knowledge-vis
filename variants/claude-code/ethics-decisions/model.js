'use strict';
// Ethical-decisions lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A made-up town choosing a flood plan. Every bar, line, region and readout on the page is computed here;
// tests/core.cjs pins the claims. The numbers are a teaching model, not data about any real place.
(function (root) {
  // Three neighbourhoods. n = households, m = how much more often than downtown the group floods.
  const GROUPS = [
    { id: 'D', n: 500, m: 1 },   // downtown
    { id: 'R', n: 100, m: 2 },   // riverside (default m; the mR assumption overrides it)
    { id: 'H', n: 400, m: 0.3 }  // hillside
  ];
  const N = 1000;          // households in town (the plan cost is split evenly over all of them)
  const LOSS = 100;        // loss per household when its home floods, in k (thousand currency units)
  const COST = { none: 0, A: 2000, B: 2500, C: 5000 }; // annual cost of each plan, k per year for the whole town
  const B_CUT = 0.4;       // plan B: every home's flood loss falls by 40 %
  const C_PARK = 0.3;      // plan C: the flood park cuts downtown loss by 30 % when every riverside home has moved
  const PLANS = ['none', 'A', 'B', 'C'];
  const DEFAULTS = { p: 0.10, lam: 0.3, eA: 0.9, mR: 2, hm: 8, q: 0.6, rule: false };
  const RANGES = { p: [0.02, 0.30], lam: [0, 1], eA: [0.5, 1], mR: [1, 4], hm: [0, 20], q: [0, 1] };

  const A = o => Object.assign({}, DEFAULTS, o || {});

  // What a plan does under assumptions a.
  //   cut[g]  = fraction of group g's expected flood loss removed
  //   move    = fraction of riverside households that leave
  //   forced  = fraction of riverside households moved although they would have said no
  function spec(id, a) {
    a = A(a);
    if (id === 'none') return { cut: { D: 0, R: 0, H: 0 }, cost: 0, move: 0, forced: 0 };
    if (id === 'A') return { cut: { D: a.eA, R: 0, H: 0 }, cost: COST.A, move: 0, forced: 0 };
    if (id === 'B') return { cut: { D: B_CUT, R: B_CUT, H: B_CUT }, cost: COST.B, move: 0, forced: 0 };
    // Plan C. Rule off: everyone moves, and the (1 − q) who would refuse are moved anyway.
    // Rule on: only the share q who agree move; the park and the cost shrink with it.
    const move = a.rule ? a.q : 1;
    return { cut: { D: C_PARK * move, R: 0, H: 0 }, cost: COST.C * move, move, forced: a.rule ? 0 : 1 - a.q };
  }

  // Burden per household per year (k) for each sub-group: expected flood loss + tax share + moving hardship.
  // Expected flood loss = p·m·LOSS·(1 − cut): in a given year the home either floods (lose LOSS) or not (lose 0).
  function rows(id, a) {
    a = A(a);
    const s = spec(id, a), tax = s.cost / N, out = [];
    const flood = (m, cut) => a.p * m * LOSS * (1 - cut);
    out.push({ key: 'D', n: 500, flood: flood(1, s.cut.D), tax, hard: 0 });
    if (s.move > 0) out.push({ key: s.forced > 0 ? 'Rmove' : 'Rvol', n: 100 * s.move, flood: 0, tax, hard: a.hm, forcedN: 100 * s.forced });
    if (s.move < 1) out.push({ key: s.move > 0 ? 'Rstay' : 'R', n: 100 * (1 - s.move), flood: flood(a.mR, s.cut.R), tax, hard: 0 });
    out.push({ key: 'H', n: 400, flood: flood(0.3, s.cut.H), tax, hard: 0 });
    out.forEach(r => { r.b = r.flood + r.tax + r.hard; });
    return out;
  }

  function summary(id, a) {
    const r = rows(id, a), s = spec(id, a);
    const total = r.reduce((acc, g) => acc + g.n * g.b, 0);
    let worst = -Infinity, worstKey = null;
    r.forEach(g => { if (g.n > 0 && g.b > worst + 1e-12) { worst = g.b; worstKey = g.key; } });
    return { id, rows: r, total, mean: total / N, worst, worstKey, forced: 100 * s.forced, cost: s.cost };
  }

  // Lower is better. λ = 0 looks only at the town-wide average; λ = 1 only at the worst-off group.
  const score = (sm, lam) => (1 - lam) * sm.mean + lam * sm.worst;

  function ranking(a) {
    a = A(a);
    return PLANS.map(id => { const sm = summary(id, a); return Object.assign(sm, { score: score(sm, a.lam) }); })
      .sort((x, y) => x.score - y.score || PLANS.indexOf(x.id) - PLANS.indexOf(y.id));
  }
  const winner = a => ranking(a)[0].id;

  // Where along one assumption does the winner change? Scan + bisection; returns [{from, to, at}] and the
  // segments [{lo, hi, id}] covering the assumption's range.
  function sweep(a, key, lo, hi, steps) {
    a = A(a); lo = lo === undefined ? RANGES[key][0] : lo; hi = hi === undefined ? RANGES[key][1] : hi; steps = steps || 400;
    const at = v => winner(Object.assign({}, a, { [key]: v }));
    const segs = [], flips = [];
    let prevV = lo, prevW = at(lo), segLo = lo;
    for (let i = 1; i <= steps; i++) {
      const v = lo + (hi - lo) * i / steps, w = at(v);
      if (w !== prevW) {
        let x0 = prevV, x1 = v;
        for (let k = 0; k < 50; k++) { const mid = (x0 + x1) / 2; if (at(mid) === prevW) x0 = mid; else x1 = mid; }
        const b = (x0 + x1) / 2;
        flips.push({ from: prevW, to: w, at: b });
        segs.push({ lo: segLo, hi: b, id: prevW });
        segLo = b; prevW = w;
      }
      prevV = v;
    }
    segs.push({ lo: segLo, hi, id: prevW });
    return { segs, flips };
  }

  // Nearest flip below and above the current value of one assumption (null when none inside the range).
  function margins(a, key) {
    a = A(a);
    const { flips } = sweep(a, key);
    const v = a[key];
    let below = null, above = null;
    flips.forEach(f => { if (f.at < v - 1e-9 && (below === null || f.at > below.at)) below = f; if (f.at > v + 1e-9 && (above === null || f.at < above.at)) above = f; });
    return { below, above };
  }

  // Average burden is a straight line in p: mean(p) = c0 + c1·p. Crossing of two plans' lines.
  function meanLine(id, a) {
    const m0 = summary(id, Object.assign({}, A(a), { p: 0 })).mean, m1 = summary(id, Object.assign({}, A(a), { p: 1 })).mean;
    return { c0: m0, c1: m1 - m0 };
  }
  function crossP(i, j, a) {
    const L1 = meanLine(i, a), L2 = meanLine(j, a);
    if (Math.abs(L1.c1 - L2.c1) < 1e-12) return null;
    return (L2.c0 - L1.c0) / (L1.c1 - L2.c1);
  }
  // The plan with the lowest average burden (step 1 ignores the worst-off group: λ = 0).
  function bestMean(a) { return ranking(Object.assign({}, A(a), { lam: 0 }))[0].id; }

  const api = { GROUPS, N, LOSS, COST, B_CUT, C_PARK, PLANS, DEFAULTS, RANGES, spec, rows, summary, score, ranking, winner, sweep, margins, meanLine, crossP, bestMean };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ETHICS_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
