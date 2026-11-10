'use strict';
// Exponentials & logarithms (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09. Every number on the page is computed here.
(function (root) {

// ---- step 0: two dishes of cells, one adds, one multiplies ----
const ADD = 3;            // dish A gains 3 cells every hour
const START = 1;          // both dishes start with one cell
const addPlan = t => START + ADD * t;
const doublePlan = t => START * Math.pow(2, t);
// First whole hour (t ≥ 1) at which the doubling dish holds more cells than the adding dish.
function overtakeHour() { for (let t = 1; t < 100; t++) if (doublePlan(t) > addPlan(t)) return t; return null; }
// Hour-by-hour change: differences for A, ratios for B (t ≥ 1).
const stepChange = t => ({ dA: addPlan(t) - addPlan(t - 1), rB: doublePlan(t) / doublePlan(t - 1) });

// ---- step 1: y = a^x ----
const pow = (a, x) => Math.pow(a, x);
// a^(x+1) / a^x — the factor one more unit of x multiplies by
const unitRatio = (a, x) => pow(a, x + 1) / pow(a, x);
const trend = a => (Math.abs(a - 1) < 1e-12 ? 'flat' : a > 1 ? 'up' : 'down');

// ---- step 2: the reverse question ----
const log = (base, y) => Math.log(y) / Math.log(base);
const isWhole = v => Math.abs(v - Math.round(v)) < 1e-9;
// Guess-and-check: bracket the exponent between two whole numbers, then halve the bracket `halvings` times.
// Each row records the bracket [lo, hi], the midpoint tried, its power and whether it was too big.
function bracket(base, y, halvings) {
  const exact = log(base, y);
  if (isWhole(exact)) return { exact: true, x: Math.round(exact), rows: [] };
  let lo = Math.floor(exact), hi = lo + 1;
  const rows = [{ lo, hi, mid: null, p: null, big: null }];
  for (let k = 0; k < halvings; k++) {
    const mid = (lo + hi) / 2, p = pow(base, mid), big = p > y;
    rows.push({ lo, hi, mid, p, big });
    if (big) hi = mid; else lo = mid;
  }
  rows.push({ lo, hi, mid: null, p: null, big: null });
  return { exact: false, x: exact, rows, lo, hi };
}

// ---- step 3: the log ruler (base 2) ----
const RULER_MAX = 10;     // the ruler runs from 2^0 = 1 to 2^10 = 1024
const rulerPos = v => log(2, v);   // distance from the "1" mark, in doublings

// ---- step 4: growth on a log axis ----
const growth = (r, t) => pow(r, t);
const doublingTime = r => Math.log(2) / Math.log(r);
const rule72 = r => 72 / (100 * (r - 1));
const LOG2_10 = Math.log(10) / Math.log(2);    // log₂10: how many doublings make one ×10

// ---- step 5 quiz: answers computed, never typed in ----
const QUIZ = {
  q1: log(2, 1 / 8),          // −3
  q2: log(3, 81),             // 4
  q3: pow(2, 20)              // 1 048 576 ≈ 10^6
};
const QUIZ_OPTIONS = { q1: { a: 3, b: -3, c: 1 / 3 }, q2: { a: 27, b: 4, c: 78 }, q3: { a: 2000, b: 20000, c: 1e6 } };
// The option that matches the computed answer (q3 asks for an estimate: nearest within 10 %).
function quizKey(q) {
  const v = QUIZ[q], opts = QUIZ_OPTIONS[q];
  return Object.keys(opts).find(k => (q === 'q3' ? Math.abs(opts[k] - v) / v < 0.1 : Math.abs(opts[k] - v) < 1e-9)) || null;
}
// The rule of 72 counts as "close" when it is within 5 % of the exact doubling time.
const rule72Close = r => Math.abs(rule72(r) - doublingTime(r)) / doublingTime(r) < 0.05;

const api = { ADD, START, addPlan, doublePlan, overtakeHour, stepChange, pow, unitRatio, trend, log, isWhole, bracket, RULER_MAX, rulerPos, growth, doublingTime, rule72, LOG2_10, QUIZ, QUIZ_OPTIONS, quizKey, rule72Close };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.EXPLOG_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
