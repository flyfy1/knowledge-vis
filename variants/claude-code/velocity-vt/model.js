'use strict';
// Velocity–time lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every position, speed, area and quiz answer on the page is computed here; tests/core.cjs pins them.
// Motion is along a straight line, forward only (v ≥ 0). Units: metres, seconds, m/s.
(function (root) {
  // A motion is a piecewise-linear speed profile: [[t0, v0], [t1, v1], ...] with t increasing.
  // Between knots the speed changes at a steady rate; after the last knot it stays at the last speed.
  function speedAt(profile, t) {
    if (t <= profile[0][0]) return profile[0][1];
    for (let i = 1; i < profile.length; i++) {
      const [ta, va] = profile[i - 1], [tb, vb] = profile[i];
      if (t <= tb) return va + (vb - va) * (t - ta) / (tb - ta);
    }
    return profile[profile.length - 1][1];
  }
  // Distance covered from profile[0][0] to t = area under the speed line (exact trapezoids).
  function distanceAt(profile, t) {
    let s = 0;
    for (let i = 1; i < profile.length; i++) {
      const [ta, va] = profile[i - 1], [tb] = profile[i];
      if (t <= ta) return s;
      const te = Math.min(t, tb);
      s += (va + speedAt(profile, te)) / 2 * (te - ta);
      if (t <= tb) return s;
    }
    const [tl, vl] = profile[profile.length - 1];
    return s + vl * Math.max(0, t - tl);
  }
  // Area of each segment of a profile, with its kind (speeding up / steady / slowing down).
  function segments(profile) {
    const out = [];
    for (let i = 1; i < profile.length; i++) {
      const [ta, va] = profile[i - 1], [tb, vb] = profile[i];
      out.push({ t0: ta, t1: tb, v0: va, v1: vb, area: (va + vb) / 2 * (tb - ta), kind: vb > va ? 'up' : vb < va ? 'down' : 'flat' });
    }
    return out;
  }
  const constant = v => [[0, v], [1, v]];

  // Steps 1–2: three runners on the same clock (0..8 s).
  const RACE_T = 8;
  const RUNNER_C = [[0, 0], [4, 4], [8, 4]]; // starts from rest, gains 1 m/s every second for 4 s, then holds 4 m/s
  // Slope of the x–t line between two times (Δx ÷ Δt).
  const slope = (profile, t0, t1) => (distanceAt(profile, t1) - distanceAt(profile, t0)) / (t1 - t0);

  // Step 4: speeding up from rest, 1 m/s gained every second, for 6 s. Exact distance = ½ · 6 · 6 = 18 m.
  const RAMP = { a: 1, T: 6 };
  const rampV = t => RAMP.a * t;
  const RAMP_EXACT = 0.5 * RAMP.T * RAMP.a * RAMP.T;
  const STRIPS = [1, 2, 3, 6, 12, 24];
  // Strip sums: each strip is a rectangle whose height is the speed at its left end (low) or right end (high).
  function stripSums(N) {
    const dt = RAMP.T / N; let low = 0, high = 0;
    for (let i = 0; i < N; i++) { low += rampV(i * dt) * dt; high += rampV((i + 1) * dt) * dt; }
    return { N, dt, low, high, exact: RAMP_EXACT, gap: high - low };
  }

  // Step 5: a bus between two stops.
  const TRIP = [[0, 0], [4, 10], [12, 10], [15, 0]];
  // Step 6: self-check graph.
  const QUIZ = [[0, 0], [4, 8], [7, 8], [9, 0]];
  const QUIZ_T = 2;

  function tripSummary(profile) {
    const segs = segments(profile), total = segs.reduce((s, q) => s + q.area, 0);
    const T = profile[profile.length - 1][0] - profile[0][0];
    return { segs, total, T, avg: total / T };
  }

  const api = { speedAt, distanceAt, segments, constant, slope, RACE_T, RUNNER_C, RAMP, rampV, RAMP_EXACT, STRIPS, stripSums, TRIP, QUIZ, QUIZ_T, tripSummary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
