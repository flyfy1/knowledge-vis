'use strict';
// Clock-hands lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every angle, time and count on the page is computed here; tests/core.cjs pins the claims.
// Conventions: an ideal clock whose hands move smoothly; t = minutes after 12:00 (0 ≤ t < 720 is one
// twelve-hour round); angles in degrees measured clockwise from the 12.
(function (root) {
  const MINUTE_RATE = 360 / 60;          // 6° per minute: one turn per hour
  const HOUR_RATE = 360 / (12 * 60);     // 0.5° per minute: one turn per 12 hours
  const GAIN = MINUTE_RATE - HOUR_RATE;  // 5.5° per minute: how fast the minute hand pulls ahead
  const ROUND = 720;                     // minutes in one twelve-hour round
  const mod = (a, n) => ((a % n) + n) % n;

  const turned = t => ({ minute: MINUTE_RATE * t, hour: HOUR_RATE * t });   // total turning since 12:00
  const minuteAngle = t => mod(MINUTE_RATE * t, 360);
  const hourAngle = t => mod(HOUR_RATE * t, 360);
  const lead = t => mod(GAIN * t, 360);                                      // how far the minute hand is ahead
  function between(t) { const d = lead(t); return Math.min(d, 360 - d); }   // the smaller angle, 0..180
  const timeOf = (h, m) => mod(h, 12) * 60 + m;

  // Step 1 ledger: hour hand = 30h + 0.5m, minute hand = 6m, difference, smaller angle.
  function ledger(h, m) {
    const H = 30 * mod(h, 12) + HOUR_RATE * m, Mn = MINUTE_RATE * m, D = Math.abs(H - Mn);
    return { H, M: Mn, D, A: Math.min(D, 360 - D), extra: HOUR_RATE * m };
  }

  // Step 3: the k-th time the hands meet (k = 0 is 12:00 itself): the gap must grow by k × 360°.
  const meeting = k => 360 * k / GAIN;                    // = 720k/11 minutes
  const MEETINGS = Array.from({ length: 11 }, (_, k) => meeting(k));

  // Step 4: every t in [0, 720) with between(t) = theta (0 ≤ theta ≤ 180), sorted.
  function solutions(theta) {
    const out = [];
    for (let k = 0; k <= 12; k++) for (const g of [theta + 360 * k, 360 - theta + 360 * k]) {
      const t = g / GAIN;
      if (t >= -1e-9 && t < ROUND - 1e-9 && !out.some(s => Math.abs(s - t) < 1e-7)) out.push(Math.max(0, t));
    }
    return out.sort((a, b) => a - b);
  }
  const inHour = (list, h) => list.filter(t => t >= h * 60 - 1e-9 && t < (h + 1) * 60 - 1e-9);

  // Counts of events in [0, t]: meetings and right angles reached so far.
  const countUpTo = (list, t) => list.filter(s => s <= t + 1e-9).length;

  // Clock text: h:mm or h:mm:ss (nearest second), 12 instead of 0.
  function clock(t, withSeconds) {
    let s = Math.round(mod(t, ROUND) * 60);
    if (!withSeconds) s = Math.round(s / 60) * 60;
    s = mod(s, ROUND * 60);
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
    return (h === 0 ? 12 : h) + ':' + String(m).padStart(2, '0') + (withSeconds ? ':' + String(sec).padStart(2, '0') : '');
  }
  // Minutes as a mixed number with denominator 11 (all meeting times are multiples of 720/11).
  function mixed11(k) {
    const num = 720 * k, whole = Math.floor(num / 11), rem = num % 11;
    return { whole, rem, text: rem ? `${whole} ${rem}/11` : String(whole) };
  }

  const api = { MINUTE_RATE, HOUR_RATE, GAIN, ROUND, mod, turned, minuteAngle, hourAngle, lead, between, timeOf, ledger, meeting, MEETINGS, solutions, inHour, countUpTo, clock, mixed11 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CLOCK_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
