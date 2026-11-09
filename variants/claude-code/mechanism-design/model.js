'use strict';
// Mechanism design & auctions model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, cell and readout on the page is computed here; tests/core.cjs pins the claims.
// Setting: one item; bidders with independent private values on a 0–100 scale; risk-neutral
// (utility = value − payment if you win, 0 if you lose); a tie is settled by a fair coin.
(function (root) {
  const VMAX = 100;

  // ---- one auction, the rival's bid r known (steps 0, 2, 3) ----
  // First price: the winner pays their own bid. Second price: the winner pays the other bid.
  function utility(rule, v, b, r) {
    const pay = rule === 'first' ? b : r;
    if (b > r) return v - pay;
    if (b === r) return 0.5 * (v - pay);
    return 0;
  }
  function outcome(rule, v, b, r) {
    const win = b > r ? 1 : b === r ? 0.5 : 0;
    const pay = rule === 'first' ? b : r;
    return { win, pay: win ? pay : 0, u: utility(rule, v, b, r) };
  }
  // Best utility over the whole-number bids 0..100 against a known r, and the bids that reach it.
  function bestReply(rule, v, r) {
    let best = -Infinity, bids = [];
    for (let b = 0; b <= VMAX; b++) {
      const u = utility(rule, v, b, r);
      if (u > best + 1e-12) { best = u; bids = [b]; } else if (Math.abs(u - best) <= 1e-12) bids.push(b);
    }
    return { u: best, bids };
  }
  // Regret of bid b when the rival bid r: what you could have had with the best bid, minus what you got.
  function regret(rule, v, b, r) { return bestReply(rule, v, r).u - utility(rule, v, b, r); }
  // Worst regret of a bid over every rival bid r = 0..100, and the bid whose worst regret is smallest.
  function regretTable(rule, v) {
    const best = []; for (let r = 0; r <= VMAX; r++) best.push(bestReply(rule, v, r).u);
    const rows = [];
    for (let b = 0; b <= VMAX; b++) {
      const row = new Float64Array(VMAX + 1); let worst = 0, at = 0;
      for (let r = 0; r <= VMAX; r++) { row[r] = best[r] - utility(rule, v, b, r); if (row[r] > worst + 1e-12) { worst = row[r]; at = r; } }
      rows.push({ b, row, worst, at });
    }
    let minWorst = Infinity, safest = [];
    rows.forEach(q => { if (q.worst < minWorst - 1e-12) { minWorst = q.worst; safest = [q.b]; } else if (Math.abs(q.worst - minWorst) <= 1e-12) safest.push(q.b); });
    const max = Math.max(...rows.map(q => q.worst));
    return { rows, minWorst, safest, max };
  }

  // ---- step 1: first price against an unknown rival ----
  // Assumption: the rival's value is uniform on 0..100 and the rival bids beta × value.
  // Your chance of winning with bid b is P(beta·V < b) = min(1, b / (100·beta)).
  function winProb(b, beta) { if (beta <= 0) return b > 0 ? 1 : 0.5; return Math.max(0, Math.min(1, b / (VMAX * beta))); }
  function expectedU(v, b, beta) { return winProb(b, beta) * (v - b); }
  // Exact maximiser over real bids: b(v − b)/(100β) peaks at v/2; if that already wins for sure, bid the rival's top bid 100β.
  function bestBid(v, beta) { const b = Math.min(v / 2, VMAX * beta); return { b, eu: expectedU(v, b, beta), p: winProb(b, beta) }; }

  // Seeded PRNG (mulberry32) so every simulation is identical on every load.
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Rival values for step 1 (fixed list: the same 400 rivals for every bid you try).
  function rivalValues(count, seed) { const r = rng(seed); return Array.from({ length: count }, () => r() * VMAX); }
  function simulateFirst(v, b, beta, values) {
    let won = 0, total = 0; const trace = [];
    values.forEach((rv, i) => { const rb = beta * rv; const w = b > rb ? 1 : b === rb ? 0.5 : 0; won += w; total += w * (v - b); trace.push(total / (i + 1)); });
    return { won, mean: total / values.length, rate: won / values.length, trace };
  }

  // ---- step 4: revenue with n bidders ----
  // Second price: everyone bids their value (step 3), the seller gets the second-highest value.
  // First price: the symmetric equilibrium for uniform values is bid = (n − 1)/n × value (step 1 is n = 2),
  // so the seller gets (n − 1)/n × the highest value.
  const fpShade = n => (n - 1) / n;
  function auctionRevenue(values) {
    const s = values.slice().sort((a, b) => b - a), n = values.length;
    return { first: fpShade(n) * s[0], second: s[1], high: s[0] };
  }
  function simulateRevenue(n, count, seed) {
    const r = rng(seed), out = [];
    for (let i = 0; i < count; i++) out.push(auctionRevenue(Array.from({ length: n }, () => r() * VMAX)));
    return out;
  }
  // Expected highest and second-highest of n uniform values on 0..100.
  const eHigh = n => VMAX * n / (n + 1), eSecond = n => VMAX * (n - 1) / (n + 1);
  // Standard deviations of the two revenues (order statistics of uniforms; Beta(n,1) and Beta(n−1,2)).
  function revenueSD(n) {
    const varHigh = n / ((n + 1) * (n + 1) * (n + 2)), varSecond = 2 * (n - 1) / ((n + 1) * (n + 1) * (n + 2));
    return { first: VMAX * fpShade(n) * Math.sqrt(varHigh), second: VMAX * Math.sqrt(varSecond) };
  }
  function stats(arr) { const m = arr.reduce((s, x) => s + x, 0) / arr.length; return { mean: m, sd: Math.sqrt(arr.reduce((s, x) => s + (x - m) * (x - m), 0) / arr.length) }; }

  // ---- step 5: second price with a reserve price R (the seller values the item at 0) ----
  // Sale only if the highest value ≥ R; the winner pays max(second-highest value, R).
  // Computed by integrating over the highest (x) and second-highest (y) values, densities from order statistics.
  function reserveNumeric(n, R, steps = 400) {
    const r = R / VMAX; let rev = 0, welfare = 0;
    // joint density of (top, second) for n uniforms on [0,1]: n(n−1) y^(n−2) on 0 ≤ y ≤ x ≤ 1
    const dx = (1 - r) / steps;
    for (let i = 0; i < steps; i++) {
      const x = r + (i + 0.5) * dx;
      // ∫_0^x max(y, r) · n(n−1) y^(n−2) dy, split at r (when x > r)
      const below = n * Math.pow(r, n);                                       // ∫_0^r r·n(n−1)y^(n−2) dy = n r^n
      const above = n * (n - 1) * (Math.pow(x, n) - Math.pow(r, n)) / n;     // ∫_r^x y·n(n−1)y^(n−2) dy
      rev += (below + above) * dx;
      welfare += x * n * Math.pow(x, n - 1) * dx;
    }
    return { revenue: VMAX * rev, welfare: VMAX * welfare };
  }
  function reserveExact(n, R) {
    const r = R / VMAX;
    return {
      revenue: VMAX * ((n - 1) / (n + 1) + Math.pow(r, n) - 2 * n * Math.pow(r, n + 1) / (n + 1)),
      welfare: VMAX * n / (n + 1) * (1 - Math.pow(r, n + 1)),
      noSale: Math.pow(r, n)
    };
  }
  function reserveSim(n, R, count, seed) {
    const g = rng(seed); let rev = 0, wel = 0, none = 0;
    for (let i = 0; i < count; i++) {
      const s = Array.from({ length: n }, () => g() * VMAX).sort((a, b) => b - a);
      if (s[0] >= R) { rev += Math.max(s[1], R); wel += s[0]; } else none++;
    }
    return { revenue: rev / count, welfare: wel / count, noSale: none / count };
  }
  function bestReserve(n) {
    let best = -1, at = 0;
    for (let R = 0; R <= VMAX; R++) { const q = reserveExact(n, R).revenue; if (q > best + 1e-12) { best = q; at = R; } }
    return { R: at, revenue: best };
  }

  const api = { VMAX, utility, outcome, bestReply, regret, regretTable, winProb, expectedU, bestBid, rng, rivalValues, simulateFirst, fpShade, auctionRevenue, simulateRevenue, eHigh, eSecond, revenueSD, stats, reserveNumeric, reserveExact, reserveSim, bestReserve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MECH_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
