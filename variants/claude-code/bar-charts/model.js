'use strict';
// Bar Charts · Numbers Standing in a Row (Claude Code edition) — pure model.
// Author: Claude Code (claude-opus-5-5), 2026-11-09. Every bar, line and readout on the page comes from here.
// Data: books borrowed from a class reading corner, Monday to Friday, two weeks (made-up teaching data).
(function (root) {
  const W1 = [12, 7, 15, 9, 12];
  const W2 = [10, 9, 13, 12, 16];
  const UNITS = [1, 2, 5, 10];     // step 1: books per grid cell
  const CELLS = 10;                // step 1: the chart is always 10 cells tall
  const S0 = { vMin: 0, vMax: 20 };
  const S3 = { baseMin: 0, baseMax: 10, axisTop: 16 };
  const S5 = { hMin: 5, hMax: 17, step: 0.5 };

  const sum = a => a.reduce((s, v) => s + v, 0);
  const mean = a => sum(a) / a.length;
  const argmax = a => a.indexOf(Math.max(...a));
  const argmin = a => a.indexOf(Math.min(...a));
  // All days holding the maximum (ties matter in step 0 once the reader edits a value).
  const maxDays = a => a.map((v, i) => (v === Math.max(...a) ? i : -1)).filter(i => i >= 0);

  // Step 1: what a choice of "books per cell" does to a 10-cell chart.
  function scale(data, unit) {
    const top = unit * CELLS;
    return {
      unit, top,
      overflow: data.map((v, i) => (v > top ? i : -1)).filter(i => i >= 0),
      cells: data.map(v => v / unit),
      tallestCells: Math.max(...data) / unit
    };
  }

  // Step 2: difference between two days, read as "how much taller".
  function diff(data, i, j) {
    const a = data[i], b = data[j];
    return { a, b, d: Math.abs(a - b), taller: a > b ? i : b > a ? j : -1, shorter: a > b ? j : b > a ? i : -1 };
  }
  // Order of days from most to fewest (ties keep weekday order).
  function rank(data) { return data.map((v, i) => i).sort((p, q) => data[q] - data[p] || p - q); }

  // Step 3: a vertical axis that starts at `base` instead of 0.
  function truncated(data, base) {
    const hi = Math.max(...data), lo = Math.min(...data);
    return {
      base, hi, lo, iHi: argmax(data), iLo: argmin(data),
      lengths: data.map(v => Math.max(0, v - base)),
      trueRatio: hi / lo,
      seenRatio: lo > base ? (hi - base) / (lo - base) : Infinity,
      vanished: data.map((v, i) => (v <= base ? i : -1)).filter(i => i >= 0)
    };
  }

  // Step 4: two weeks side by side.
  function compare(w1, w2) {
    const delta = w2.map((v, i) => v - w1[i]);
    return { delta, up: delta.filter(d => d > 0).length, down: delta.filter(d => d < 0).length, same: delta.filter(d => d === 0).length, t1: sum(w1), t2: sum(w2) };
  }

  // Step 5: books above a horizontal line h, and room below it.
  function balance(data, h) {
    return { h, excess: sum(data.map(v => Math.max(0, v - h))), shortfall: sum(data.map(v => Math.max(0, h - v))), mean: mean(data) };
  }

  const api = { W1, W2, UNITS, CELLS, S0, S3, S5, sum, mean, argmax, argmin, maxDays, scale, diff, rank, truncated, compare, balance };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BAR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
