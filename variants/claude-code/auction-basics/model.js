'use strict';
// Auction model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.AUCTION_MODEL) and node tests (module.exports).
// Values and bids are in "yuan" on a 0–100 scale. Ties always go to the rival / the lower index.
(function (root) {
  const TOP = 100;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Deterministic random numbers (mulberry32) so every simulation on the page is reproducible.
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---- step 0: first price, rival bid known ---- */
  // You win only if your bid is strictly higher than the rival's; the winner pays their own bid.
  const fpPayoff = (v, b, r) => (b > r ? v - b : 0);

  /* ---- step 1: first price, rival bid unknown (uniform on [0, 100]) ---- */
  const winProb = b => clamp(b / TOP, 0, 1);
  const fpExpected = (v, b) => (v - b) * winProb(b);
  const fpBest = v => v / 2;
  const fpBestValue = v => (v * v) / (4 * TOP);
  // The same 4000 rival bids are reused for every b you try (common random numbers).
  const RIVALS = (() => { const r = rng(20261109), out = []; for (let i = 0; i < 4000; i++) out.push(r() * TOP); return out; })();
  function fpSimulated(v, b, rivals = RIVALS) {
    let sum = 0, wins = 0;
    for (const r of rivals) { if (b > r) { sum += v - b; wins++; } }
    return { mean: sum / rivals.length, winRate: wins / rivals.length };
  }

  /* ---- step 2: second price (Vickrey) ---- */
  // Winner pays the rival's bid; ties go to the rival.
  const spPayoff = (v, b, r) => (b > r ? v - r : 0);
  // Compare bidding b with bidding v over a grid of rival bids r ∈ [0, 100].
  function spCompare(v, b, step = 0.5) {
    let maxGain = -Infinity, maxLoss = 0, worse = 0, better = 0, count = 0;
    for (let r = 0; r <= TOP + 1e-9; r += step) {
      const d = spPayoff(v, b, r) - spPayoff(v, v, r);
      maxGain = Math.max(maxGain, d); maxLoss = Math.max(maxLoss, -d);
      if (d < -1e-12) worse++; if (d > 1e-12) better++; count++;
    }
    return { maxGain, maxLoss, worse, better, count };
  }
  // Expected payoffs against one rival bidding uniformly on [0, 100].
  const spExpected = (v, b) => { const B = clamp(b, 0, TOP); return (v * B - (B * B) / 2) / TOP; };
  const spExpectedLoss = (v, b) => spExpected(v, v) - spExpected(v, b); // = (b − v)² / 200 for b in [0, 100]

  /* ---- step 3: revenue with n bidders, values uniform on [0, 100] ---- */
  const eqBidFactor = n => (n - 1) / n; // symmetric first-price equilibrium: bid = v·(n − 1)/n
  const theoryRevenue = n => (TOP * (n - 1)) / (n + 1);
  // Exact standard deviations of each rule's revenue (order statistics of uniforms).
  const sdFirst = n => eqBidFactor(n) * TOP * Math.sqrt(n / ((n + 1) * (n + 1) * (n + 2)));
  const sdSecond = n => TOP * Math.sqrt((2 * (n - 1)) / ((n + 1) * (n + 1) * (n + 2)));
  function drawValues(r, n) { const v = []; for (let i = 0; i < n; i++) v.push(Math.round(r() * TOP * 10) / 10); return v; }
  function settle(values) {
    const n = values.length, order = values.map((v, i) => i).sort((a, b) => values[b] - values[a] || a - b);
    const top = order[0], second = values[order[1]];
    return { winner: top, high: values[top], second, first: values[top] * eqBidFactor(n) };
  }
  function revenueRun(n, rounds, seed = 1000 + n) {
    const r = rng(seed), out = [];
    for (let k = 0; k < rounds; k++) { const vals = drawValues(r, n); out.push({ values: vals, ...settle(vals) }); }
    return out;
  }
  const meanSd = xs => { const m = xs.reduce((s, v) => s + v, 0) / xs.length; const sd = Math.sqrt(xs.reduce((s, v) => s + (v - m) * (v - m), 0) / xs.length); return { m, sd }; };

  /* ---- step 4: open-outcry clocks with five bidders ---- */
  const CLOCK_N = 5;
  function clockValues(set) { return drawValues(rng(500 + set), CLOCK_N); }
  // English (rising) clock at price p: who is still in, and has it ended?
  function english(values, p) {
    const s = settle(values);
    const ended = p >= s.second;
    return { active: ended ? [s.winner] : values.map((v, i) => i).filter(i => values[i] > p), ended, winner: s.winner, price: s.second };
  }
  // Dutch (falling) clock at price p: everyone plans to call out at bid = v·(n − 1)/n; the first call ends it.
  function dutch(values, p) {
    const s = settle(values), plans = values.map(v => v * eqBidFactor(values.length));
    const ended = p <= plans[s.winner];
    return { plans, ended, winner: s.winner, price: plans[s.winner] };
  }

  /* ---- step 5: common value and the winner's curse ---- */
  const TRUE_VALUE = 50;
  // Expected largest of n independent uniform errors on [−σ, σ].
  const expectedMaxError = (n, sigma) => (sigma * (n - 1)) / (n + 1);
  const curseTheory = (n, sigma, shade) => shade - expectedMaxError(n, sigma);
  function commonAuction(r, n, sigma, shade) {
    const est = []; for (let i = 0; i < n; i++) est.push(TRUE_VALUE + (2 * r() - 1) * sigma);
    let w = 0; est.forEach((v, i) => { if (v > est[w]) w = i; });
    const pay = est[w] - shade;
    return { est, winner: w, pay, profit: TRUE_VALUE - pay, winnerError: est[w] - TRUE_VALUE };
  }
  function curseRun(n, sigma, shade, count, seed = 77) {
    const r = rng(seed), out = [];
    for (let k = 0; k < count; k++) out.push(commonAuction(r, n, sigma, shade));
    return out;
  }

  const api = { TOP, rng, fpPayoff, winProb, fpExpected, fpBest, fpBestValue, RIVALS, fpSimulated, spPayoff, spCompare, spExpected, spExpectedLoss,
    eqBidFactor, theoryRevenue, sdFirst, sdSecond, drawValues, settle, revenueRun, meanSd, CLOCK_N, clockValues, english, dutch,
    TRUE_VALUE, expectedMaxError, curseTheory, commonAuction, curseRun };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AUCTION_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
