'use strict';
// Intervals & fences (Claude Code edition) — pure model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count on the page is obtained by listing positions and counting them, never by a hand-written answer.
(function (root) {
  const MODES = ['both', 'one', 'none', 'loop'];

  // Step 0: a straight fence of n panels. Posts sit at 0..n; panel k (1-based) spans posts k−1..k.
  function fence(n) {
    const posts = Array.from({ length: n + 1 }, (_, i) => i);
    const panels = Array.from({ length: n }, (_, k) => ({ left: k, right: k + 1 }));
    // Pairing argument: each panel claims the post on its left; the claimed posts are 0..n−1.
    const claimed = panels.map(p => p.left);
    const unclaimed = posts.filter(p => !claimed.includes(p));
    return { posts, panels, claimed, unclaimed };
  }

  // Step 1: a road of length L, a tree every d metres starting at 0 (both ends planted when d divides L).
  function road(L, d) {
    const pos = [];
    for (let x = 0; x <= L + 1e-9; x += d) pos.push(x);
    const divisible = L % d === 0;
    const full = Math.floor(L / d); // whole gaps of length d
    const rest = L - full * d;      // leftover shorter than d (0 when divisible)
    return { pos, divisible, gaps: full, rest, trees: pos.length };
  }

  // Step 2/5: tree positions for a road of length L, spacing d (d divides L), by planting mode.
  // 'loop' means the road is closed into a ring of circumference L: position L is the same spot as 0.
  function plant(L, d, mode) {
    const gaps = L / d;
    if (!Number.isInteger(gaps)) throw new Error('d must divide L');
    const all = Array.from({ length: gaps + 1 }, (_, i) => i * d);
    let pos, removed;
    if (mode === 'both') { pos = all; removed = []; }
    else if (mode === 'one') { pos = all.slice(1); removed = [0]; }
    else if (mode === 'none') { pos = all.slice(1, -1); removed = [0, L]; }
    else if (mode === 'loop') { pos = all.slice(0, -1); removed = [L]; } // L coincides with 0
    else throw new Error('mode ' + mode);
    return { pos, removed, gaps, trees: pos.length, diff: pos.length - gaps };
  }
  // Gaps needed for T trees in each mode (inverse of plant): both T−1, one T, none T+1, loop T.
  function gapsFromTrees(T, mode) {
    // Count by building: try g = 1, 2, … until plant(g, 1, mode) has T trees (T ≥ 1 for loop/one, ≥ 2 for both).
    for (let g = 1; g <= 1000; g++) if (plant(g, 1, mode).trees === T) return g;
    return null;
  }
  function roadFromTrees(T, d, mode) { const g = gapsFromTrees(T, mode); return g === null ? null : { gaps: g, L: g * d }; }

  // Step 3: sawing. Cut positions split a log into pieces; each cut takes `per` minutes.
  function saw(cuts, per) {
    const pieces = cuts + 1;
    return { cuts, pieces, minutes: cuts * per, wrongMinutes: pieces * per };
  }

  // Step 4: events in a row (clock strikes or floors). Known: from event 1 to event a takes T seconds.
  // Gaps between a events = a − 1, so each gap is T / (a − 1); event 1 → b takes (b − 1) gaps.
  function events(a, T, b) {
    const per = T / (a - 1);
    return { per, gapsA: a - 1, gapsB: b - 1, timeB: per * (b - 1), wrong: T / a * b, timesA: Array.from({ length: a }, (_, i) => i * per), timesB: Array.from({ length: b }, (_, i) => i * per) };
  }

  // Step 5 quiz: a road with neither end planted, 9 trees, 5 m apart.
  const QUIZ = { T: 9, d: 5, mode: 'none', options: { a: 40, b: 45, c: 50 } };

  const api = { MODES, fence, road, plant, gapsFromTrees, roadFromTrees, saw, events, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IF_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
