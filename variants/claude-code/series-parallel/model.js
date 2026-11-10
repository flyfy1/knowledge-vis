'use strict';
// Series & parallel circuits model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Ideal battery (no internal resistance), resistors and bulbs with fixed resistance, steady direct current.
// Loaded by the page (window.SP_MODEL) and by node (tests/core.cjs).
(function (root) {

const U = 12;          // battery voltage, V
const BULB = 6;        // one bulb, Ω (24 W on its own at 12 V)

/* ---------- step 0: series ---------- */
function series(Rs, u = U) {
  const R = Rs.reduce((s, r) => s + r, 0), I = u / R;
  const V = Rs.map(r => I * r), P = Rs.map(r => I * I * r);
  // potential along the loop: start at the battery's − terminal (0 V), +u through the battery, then a drop across each resistor
  const steps = [0, u]; V.forEach(v => steps.push(steps[steps.length - 1] - v));
  return { R, I, V, P, steps };
}

/* ---------- step 1: parallel ---------- */
function parallel(Rs, u = U) {
  const Ib = Rs.map(r => u / r), I = Ib.reduce((s, i) => s + i, 0), R = u / I;
  return { R, I, Ib, V: Rs.map(() => u), P: Rs.map(r => u * u / r), Rformula: 1 / Rs.reduce((s, r) => s + 1 / r, 0) };
}

/* ---------- step 2: n identical bulbs ---------- */
function bulbs(n, mode, r = BULB, u = U) {
  const q = mode === 'series' ? series(Array(n).fill(r), u) : parallel(Array(n).fill(r), u);
  const each = q.P[0], single = u * u / r;
  return { R: q.R, I: q.I, each, rel: each / single, total: q.P.reduce((s, p) => s + p, 0) };
}

/* ---------- step 3: unscrewing bulbs ---------- */
// present: array of booleans for three bulbs
function removeBulbs(mode, present, r = BULB, u = U) {
  const k = present.filter(Boolean).length;
  if (mode === 'series') {
    const closed = k === present.length, I = closed ? u / (r * k) : 0;
    return { I, lit: present.map(p => p && closed), each: present.map(p => (p && closed ? I * I * r : 0)), closed };
  }
  const Ib = u / r;
  return { I: k * Ib, lit: present.slice(), each: present.map(p => (p ? u * u / r : 0)), closed: k > 0 };
}

/* ---------- step 4: R1 in series with (R2 ∥ R3) ---------- */
function mixed(R1, R2, R3, u = U) {
  const R23 = R2 * R3 / (R2 + R3), R = R1 + R23, I = u / R;
  const V1 = I * R1, V23 = I * R23, I2 = V23 / R2, I3 = V23 / R3;
  return { R23, R, I, V1, V23, I2, I3 };
}

/* ---------- step 5: a household socket circuit ---------- */
const MAINS = 220, BREAKER = 16;      // V, A (a typical socket circuit in China)
const APPLIANCES = [
  { id: 'kettle', P: 1800 },
  { id: 'heater', P: 2000 },
  { id: 'cooker', P: 800 },
  { id: 'lamp', P: 15 }
];
function household(on) {
  const I = APPLIANCES.map((a, k) => (on[k] ? a.P / MAINS : 0));
  const total = I.reduce((s, i) => s + i, 0);
  return { I, total, over: total > BREAKER, R: APPLIANCES.map(a => MAINS * MAINS / a.P) };
}

const api = { U, BULB, series, parallel, bulbs, removeBulbs, mixed, MAINS, BREAKER, APPLIANCES, household };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.SP_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
