/* Prescribed, deterministic teaching curves; no physical time or CFD solver. */
(function (root) {
  'use strict';
  const END = 24;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function radius(age, undercooling = 11.5) {
    return clamp(age, 0, END) * clamp(undercooling, 2, 18) * 0.0019;
  }
  function front(time, mode) {
    const t = clamp(time, 0, END);
    return mode === 'warm' ? 0.46 * (1 - Math.exp(-t / 4)) : clamp(t / END, 0, 1);
  }
  function crystal(time, index) {
    const birth = 2 + index * 0.62;
    const age = Math.max(0, time - birth);
    const side = index % 2 ? -1 : 1;
    // Initially rises away from the locally warmed base, then circulates.
    const x = side * (0.11 + 0.42 * Math.sin(age * 0.16 + index * 0.22)) * Math.min(1, age / 3);
    const y = 0.84 - Math.min(1.48, age * 0.105);
    return { x, y, age, active: time >= birth, size: Math.min(0.23, age * 0.017) };
  }
  const api = { END, clamp, radius, front, crystal };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FrozenBubbleModel = api;
})(typeof window === 'undefined' ? globalThis : window);
