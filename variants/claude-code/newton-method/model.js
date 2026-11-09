'use strict';
// Newton's method model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.NEWTON_MODEL) and node tests (module.exports).
(function (root) {
  const SQRT2 = Math.SQRT2;
  // Functions used on the page. Roots are given in closed form where one exists; cos x = x has none,
  // so its root is computed once by bisection (independent of Newton's method).
  function bisectRoot(f, a, b, n = 200) { let fa = f(a); for (let i = 0; i < n; i++) { const m = (a + b) / 2, fm = f(m); if (fm === 0) return m; if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; }
  const FUNCS = {
    sq2: { f: x => x * x - 2, df: x => 2 * x, root: SQRT2, xMin: -0.5, xMax: 3.6, yMin: -3, yMax: 11, x0: { min: 0.3, max: 3.5, def: 3 } },
    cosx: { f: x => Math.cos(x) - x, df: x => -Math.sin(x) - 1, root: 0, xMin: -1.6, xMax: 3.2, yMin: -4.5, yMax: 2.2, x0: { min: -1.4, max: 3, def: 2.5 } },
    exp3: { f: x => Math.exp(x) - 3, df: x => Math.exp(x), root: Math.log(3), xMin: -1, xMax: 3.6, yMin: -4, yMax: 20, x0: { min: -0.6, max: 3.5, def: 3.2 } }
  };
  FUNCS.cosx.root = bisectRoot(FUNCS.cosx.f, 0, 1);

  // One Newton step; null when the tangent is (numerically) flat.
  function step(fn, x) { const d = fn.df(x); if (!isFinite(d) || Math.abs(d) < 1e-14) return null; return x - fn.f(x) / d; }
  function iterate(fn, x0, n) { const xs = [x0]; for (let i = 0; i < n; i++) { const nx = step(fn, xs[xs.length - 1]); if (nx === null || !isFinite(nx)) break; xs.push(nx); } return xs; }
  // Correct significant digits: −log10(relative error), capped at 16 (double precision); absolute error when the root is 0.
  function digits(x, r) { const e = Math.abs(x - r) / (Math.abs(r) > 1e-300 ? Math.abs(r) : 1); return e === 0 ? 16 : Math.max(0, Math.min(16, -Math.log10(e))); }

  /* ---- step 2: √a by Newton (x0 = a) and by bisection on [0, a] ---- */
  const sqrtFn = a => ({ f: x => x * x - a, df: x => 2 * x });
  function newtonSqrt(a, n = 12) { return iterate(sqrtFn(a), a, n); }
  function bisectSqrt(a, n = 60) { let lo = 0, hi = a; const mids = []; for (let i = 0; i < n; i++) { const m = (lo + hi) / 2; mids.push(m); if (m * m > a) hi = m; else lo = m; } return mids; }
  const stepsTo = (xs, r, d) => { const i = xs.findIndex(x => digits(x, r) >= d); return i; };
  const quadConst = a => 1 / (2 * Math.sqrt(a)); // e_{n+1} / e_n² → f''/(2 f') at the root = 1/(2√a)

  /* ---- step 3: repeated roots, f = (x − 1)^k (x + 1) ---- */
  const multi = k => ({ f: x => Math.pow(x - 1, k) * (x + 1), df: x => k * Math.pow(x - 1, k - 1) * (x + 1) + Math.pow(x - 1, k), root: 1 });
  const multiRatio = k => (k - 1) / k; // e_{n+1}/e_n → (k − 1)/k for a root of multiplicity k ≥ 2
  // Error ratios along the path (skip steps once the error is at rounding level).
  function errors(fn, x0, n) { return iterate(fn, x0, n).map(x => Math.abs(x - fn.root)); }

  /* ---- step 4: failure modes, f = x³ − 2x + 2 ---- */
  const FAIL = { f: x => x * x * x - 2 * x + 2, df: x => 3 * x * x - 2 };
  const FAIL_ROOT = bisectRoot(FAIL.f, -2, -1.5);
  const FLAT = Math.sqrt(2 / 3); // f′ = 0 here
  function classify(x0, n = 60) {
    const xs = iterate(FAIL, x0, n);
    if (xs.length < n + 1) return { kind: 'flat', xs };
    const last = xs[xs.length - 1];
    if (Math.abs(last - FAIL_ROOT) < 1e-9) return { kind: 'root', xs, at: xs.findIndex(x => Math.abs(x - FAIL_ROOT) < 1e-9) };
    if (Math.abs(xs[n] - xs[n - 2]) < 1e-9) return { kind: 'cycle', xs, pair: [Math.min(xs[n], xs[n - 1]), Math.max(xs[n], xs[n - 1])] };
    return { kind: 'wander', xs };
  }

  /* ---- step 5: basins, f = x³ − x (roots −1, 0, 1) ---- */
  const BASIN = { f: x => x * x * x - x, df: x => 3 * x * x - 1 };
  const BASIN_ROOTS = [-1, 0, 1];
  function basin(x0, n = 80) {
    let x = x0;
    for (let i = 0; i < n; i++) {
      const nx = step(BASIN, x); if (nx === null || !isFinite(nx) || Math.abs(nx) > 1e6) return -1;
      x = nx; for (let j = 0; j < 3; j++) if (Math.abs(x - BASIN_ROOTS[j]) < 1e-10) return j;
    }
    return -1;
  }
  const BASIN_EDGES = { inner: 1 / Math.sqrt(5), flat: 1 / Math.sqrt(3) }; // 2-cycle ±1/√5; f′ = 0 at ±1/√3

  const api = { SQRT2, FUNCS, bisectRoot, step, iterate, digits, sqrtFn, newtonSqrt, bisectSqrt, stepsTo, quadConst, multi, multiRatio, errors,
    FAIL, FAIL_ROOT, FLAT, classify, BASIN, BASIN_ROOTS, basin, BASIN_EDGES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NEWTON_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
