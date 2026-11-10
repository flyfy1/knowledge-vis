'use strict';
// Mean / median / mode lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every dot, line and readout on the page is computed here; tests/core.cjs pins the claims.
// Data are illustrative (made up for teaching), not a survey.
(function (root) {
  // Steps 0–2, 4: commute times (minutes) of 11 classmates, sorted.
  const COMMUTE = [8, 10, 12, 12, 12, 15, 15, 18, 20, 25, 60];
  // Step 3: shoe sizes 34–41 (counts) and favourite sports (counts).
  const SIZES = [34, 35, 36, 37, 38, 39, 40, 41];
  const SIZE_COUNTS = [1, 2, 4, 7, 5, 3, 1, 1];
  const SPORTS = ['basketball', 'football', 'rope', 'pingpong'];
  const SPORT_COUNTS = [7, 5, 9, 4];
  // Step 5: pages read in a week by 11 classmates (for the "total" scenario).
  const PAGES = [40, 55, 60, 60, 72, 80, 85, 90, 96, 110, 150];

  const sum = a => a.reduce((s, v) => s + v, 0);
  const mean = a => sum(a) / a.length;
  const sorted = a => a.slice().sort((x, y) => x - y);
  function median(a) {
    const s = sorted(a), n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  // Positions (1-based, in sorted order) that define the median.
  const medianRanks = n => (n % 2 ? [(n + 1) / 2] : [n / 2, n / 2 + 1]);
  // Page convention: if every value appears exactly once there is no mode; otherwise all values tied
  // for the highest count are modes.
  function modes(a) {
    const c = new Map(); a.forEach(v => c.set(v, (c.get(v) || 0) + 1));
    const top = Math.max(0, ...c.values());
    if (top <= 1) return [];
    return [...c.keys()].filter(v => c.get(v) === top).sort((x, y) => x - y);
  }
  function countsMode(counts) { // modes of a tally (indices)
    const top = Math.max(0, ...counts);
    if (top <= 1) return [];
    return counts.map((c, i) => (c === top ? i : -1)).filter(i => i >= 0);
  }
  const expand = (values, counts) => values.flatMap((v, i) => Array(counts[i]).fill(v));

  // Step 1: the balance point. Total distance of points left of f and right of f.
  function balance(a, f) {
    let L = 0, R = 0; a.forEach(v => { if (v < f) L += f - v; else R += v - f; });
    return { L, R, net: R - L };
  }
  // Step 2: how many points are left of / on / right of a line at c.
  function split(a, c) { let l = 0, on = 0, r = 0; a.forEach(v => { if (v < c - 1e-9) l++; else if (v > c + 1e-9) r++; else on++; }); return { l, on, r }; }
  // Total distance from c (the median minimises it; shown in the finale only as a remark).
  const absDev = (a, c) => a.reduce((s, v) => s + Math.abs(v - c), 0);

  // Step 4: change one person's value and recompute all three measures.
  function withValue(a, idx, v) { const b = a.slice(); b[idx] = v; return b; }
  function sweep(a, idx, lo, hi, step) {
    const out = [];
    for (let v = lo; v <= hi + 1e-9; v += step) { const b = withValue(a, idx, Math.round(v * 10) / 10); out.push({ v: Math.round(v * 10) / 10, mean: mean(b), median: median(b), modes: modes(b) }); }
    return out;
  }
  const FAR = 10, MID = 5; // indices in COMMUTE: the 60-minute classmate, the 6th in order (15)

  // Finale: parse a list of numbers typed by the reader.
  function parseList(text) {
    const parts = String(text).split(/[\s,，、;；]+/).filter(Boolean);
    const nums = parts.map(Number);
    if (!parts.length || nums.some(v => !Number.isFinite(v))) return { ok: false, reason: 'nan' };
    if (nums.length < 2 || nums.length > 30) return { ok: false, reason: 'count' };
    return { ok: true, nums };
  }

  const api = { COMMUTE, SIZES, SIZE_COUNTS, SPORTS, SPORT_COUNTS, PAGES, FAR, MID, sum, mean, sorted, median, medianRanks, modes, countsMode, expand, balance, split, absDev, withValue, sweep, parseList };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MMM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
