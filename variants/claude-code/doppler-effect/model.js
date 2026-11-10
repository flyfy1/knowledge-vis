'use strict';
// Doppler effect lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every ring, tick, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Model: sound in still air (the medium is at rest in the ground frame), constant speed c, point source
// emitting one crest per period, listeners and reflectors that are points. No attenuation, no wind,
// no relativistic corrections (sound speeds are tiny compared with light).
(function (root) {
  const C_AIR = 340;   // m/s, air at about 15 °C
  const F0 = 440;      // Hz, the source used in steps 1 and 3

  // Heard frequency, general one-line form. uObs > 0: listener moves toward the source;
  // vSrc > 0: source moves toward the listener (both measured relative to the air, along the line between them).
  function heard(f, c, uObs, vSrc) { return f * (c + uObs) / (c - vSrc); }

  // Crest k leaves the source at t_k = k / f from x = v·t_k (source moving along +x through the origin at t = 0).
  // At time t it is a circle centred there with radius c·(t − t_k). Crests are numbered from kMin (steady state:
  // the source has been sounding for a long time).
  function rings(f, c, v, t, maxR) {
    const out = [], kTop = Math.floor(t * f + 1e-9), kMin = Math.ceil((t - maxR / c) * f - 1e-9);
    for (let k = kMin; k <= kTop; k++) { const tk = k / f; out.push({ k, cx: v * tk, r: c * (t - tk) }); }
    return out;
  }

  // Arrival time of crest k at a fixed point (xL, yL): emission time + travel time.
  function arrivalAt(f, c, v, k, xL, yL) { const tk = k / f; return tk + Math.hypot(xL - v * tk, yL) / c; }
  // All crest arrivals at (xL, yL) with t0 ≤ time ≤ t1 (arrival time grows with k when |v| < c).
  function arrivals(f, c, v, xL, yL, t0, t1) {
    const out = [];
    // arrival time grows with k when |v| < c: step back to the first crest arriving at or after t0
    let k = Math.floor(t0 * f);
    while (arrivalAt(f, c, v, k, xL, yL) >= t0) k--;
    for (k++; ; k++) { const ta = arrivalAt(f, c, v, k, xL, yL); if (ta > t1 + 1e-12) break; out.push(ta); }
    return out;
  }
  function meanInterval(times) { if (times.length < 2) return NaN; return (times[times.length - 1] - times[0]) / (times.length - 1); }
  function intervals(times) { const d = []; for (let i = 1; i < times.length; i++) d.push(times[i] - times[i - 1]); return d; }

  // Step 2, lane B: still source at xS, listener walking toward it (−x direction) at speed u, at xL0 when t = 0.
  // Crest k (emitted at k/f) travels right: x = xS + c(t − k/f). Meeting: xS + c(t − k/f) = xL0 − u t.
  function arrivalsMovingListener(f, c, u, xS, xL0, t0, t1) {
    const out = [];
    const tOf = k => (xL0 - xS + c * k / f) / (c + u);
    let k = Math.floor(((c + u) * t0 - (xL0 - xS)) / c * f) - 1;
    for (; ; k++) { const ta = tOf(k); if (ta > t1 + 1e-12) break; if (ta >= t0 - 1e-12) out.push(ta); }
    return out;
  }
  // Same lane geometry, crest positions at time t (rightward-going only, since the listener is to the right).
  function laneCrests(f, c, v, xS0, t, xMin, xMax) {
    // source at xS0 + v·t; crest k emitted at k/f from xS0 + v·k/f; rightward front at that + c(t − k/f)
    const out = [], kTop = Math.floor(t * f + 1e-9);
    for (let k = kTop; k > kTop - 4000; k--) {
      const tk = k / f, x = xS0 + v * tk + c * (t - tk);
      if (x > xMax) break;
      if (x >= xMin) out.push(x);
    }
    return out;
  }

  // Step 3: car on the x axis at x = v·t, listener at (0, d). Sound heard at reception time tr left the car at
  // emission time te, solved from tr = te + √((v·te)² + d²)/c (monotonic in te when v < c, so bisection is safe).
  function emissionTime(c, v, d, tr) {
    let lo = tr - (Math.abs(v * tr) + d) / (c - v) - 1, hi = tr;
    const g = te => te + Math.hypot(v * te, d) / c - tr;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (g(mid) > 0) hi = mid; else lo = mid; }
    return (lo + hi) / 2;
  }
  function passBy(f, c, v, d, tr) {
    const te = emissionTime(c, v, d, tr), xe = v * te, r = Math.hypot(xe, d);
    const cosT = -xe / r; // > 0 while the car (at emission) is still approaching
    return { te, xe, r, cosT, theta: Math.acos(Math.max(-1, Math.min(1, cosT))), f: f / (1 - (v / c) * cosT) };
  }
  // Independent check: heard frequency = rate at which emitted crests arrive = f · dte/dtr (finite difference).
  function passByNumeric(f, c, v, d, tr, h = 1e-6) { return f * (emissionTime(c, v, d, tr + h) - emissionTime(c, v, d, tr - h)) / (2 * h); }

  // Step 4: still emitter/receiver, reflector approaching at u. The reflector hears f(c+u)/c (moving listener)
  // and re-emits it as a moving source: echo = f(c+u)/(c−u). Beat (echo − sent) and its small-speed approximation.
  function reflect(f, c, u) {
    // beat written as 2uf/(c − u) (algebraically echo − f) so it stays exact when f is in GHz and u/c ~ 1e-7
    const echo = f * (c + u) / (c - u), beat = 2 * u * f / (c - u), approx = 2 * u * f / c;
    return { echo, beat, approx, relErr: u / c }; // (beat − approx)/beat = 1 − (c − u)/c = u/c
  }
  function speedFromBeat(f, c, beat) { return c * beat / (2 * f + beat); }
  // Lane picture for step 4, in units of the sent wavelength λ and period T (c = 1). Reflector at xR0 − β·t.
  // Crest k leaves the emitter (x = 0) at time k; meets the reflector at th = (xR0 + k)/(1 + β).
  function echoLane(beta, xR0, t) {
    const out = [], back = [], kTop = Math.floor(t + 1e-9);
    const xr = xR0 - beta * t;
    for (let k = kTop; k > kTop - 400; k--) {
      const th = (xR0 + k) / (1 + beta);
      if (th > t) { const x = t - k; if (x >= 0) out.push(x); }
      else { const xh = xR0 - beta * th, x = xh - (t - th); if (x < 0) break; back.push(x); }
    }
    return { xr, out, back };
  }
  function echoArrivals(beta, xR0, t0, t1) {
    const res = [];
    const ta = k => { const th = (xR0 + k) / (1 + beta); return th + (xR0 - beta * th); };
    let k = Math.floor(t0); while (ta(k) >= t0) k--;
    for (k++; ta(k) <= t1; k++) res.push(ta(k));
    return res;
  }

  // Step 5: speed as a Mach number M = v/c (c = 1, one crest per unit time). Source at x = M·t.
  function machAngle(M) { return M > 1 ? Math.asin(1 / M) : null; }
  // Does any crest reach a point straight ahead of the source before the source does? Only if M < 1.
  function aheadSpacing(M) { return 1 - M; } // in units of λ (still-source wavelength)

  const api = { C_AIR, F0, heard, rings, arrivalAt, arrivals, meanInterval, intervals, arrivalsMovingListener, laneCrests,
    emissionTime, passBy, passByNumeric, reflect, speedFromBeat, echoLane, echoArrivals, machAngle, aheadSpacing };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DOPPLER_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
