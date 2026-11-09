'use strict';
// ODE phase-portrait lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Lotka–Volterra predator–prey system, optionally with prey crowding (logistic term):
//   x' = a·x·(1 − x/K) − b·x·y      (x: rabbits, in hundreds)
//   y' = −c·y + d·x·y               (y: foxes, in tens)
// Time unit: years. Every curve, dot and readout on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  const P = { a: 1, b: 0.5, c: 1, d: 0.25 }; // equilibrium (c/d, a/b) = (4, 2): 400 rabbits, 20 foxes
  const eq = (p = P) => ({ x: p.c / p.d, y: p.a / p.b });

  function rates(x, y, p = P, K = Infinity) {
    const crowd = Number.isFinite(K) ? x / K : 0;
    return [p.a * x * (1 - crowd) - p.b * x * y, -p.c * y + p.d * x * y];
  }
  // The four terms of the plain model (step 0): births, rabbits eaten, fox deaths, fox gains.
  function terms(x, y, p = P) {
    return { birth: p.a * x, eaten: p.b * x * y, die: p.c * y, gain: p.d * x * y, dx: p.a * x - p.b * x * y, dy: -p.c * y + p.d * x * y };
  }

  function stepEuler(x, y, dt, p, K) { const [u, v] = rates(x, y, p, K); return [x + dt * u, y + dt * v]; }
  function stepRK4(x, y, dt, p, K) {
    const [k1x, k1y] = rates(x, y, p, K);
    const [k2x, k2y] = rates(x + dt / 2 * k1x, y + dt / 2 * k1y, p, K);
    const [k3x, k3y] = rates(x + dt / 2 * k2x, y + dt / 2 * k2y, p, K);
    const [k4x, k4y] = rates(x + dt * k3x, y + dt * k3y, p, K);
    return [x + dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x), y + dt / 6 * (k1y + 2 * k2y + 2 * k3y + k4y)];
  }

  // Integrate from (x0, y0). Stops early ("escaped") if the numerical state leaves the open first quadrant
  // or blows up — that can only happen to a numerical method, never to the exact solution.
  function integrate(x0, y0, { dt = 0.01, T = 30, method = 'rk4', p = P, K = Infinity } = {}) {
    const n = Math.round(T / dt), t = [0], xs = [x0], ys = [y0];
    let x = x0, y = y0, escaped = false;
    const f = method === 'euler' ? stepEuler : stepRK4;
    for (let i = 1; i <= n; i++) {
      [x, y] = f(x, y, dt, p, K);
      if (!(x > 0 && y > 0 && x < 1e3 && y < 1e3)) { escaped = true; break; }
      t.push(i * dt); xs.push(x); ys.push(y);
    }
    return { t, x: xs, y: ys, escaped, dt };
  }

  // Conserved quantity of the plain model: constant along every exact trajectory.
  const H = (x, y, p = P) => p.d * x - p.c * Math.log(x) + p.b * y - p.a * Math.log(y);
  // Lyapunov function for the crowded model (shrinks along trajectories when K is finite and x* < K).
  function V(x, y, p = P, K = Infinity) {
    const e = eqCrowd(p, K);
    if (e.kind === 'extinct') return p.d * (x - e.x - e.x * Math.log(x / e.x)) + p.b * y;
    return p.d * (x - e.x - e.x * Math.log(x / e.x)) + p.b * (y - e.y - e.y * Math.log(y / e.y));
  }

  // Local maxima of a sampled series (interior samples only).
  function peaks(arr) { const out = []; for (let i = 1; i < arr.length - 1; i++) if (arr[i] > arr[i - 1] && arr[i] >= arr[i + 1]) out.push(i); return out; }

  // Period: time between the first two upward crossings of y = a/b on the right of x = c/d.
  function period(x0, y0, p = P, dt = 0.002, T = 80) {
    const r = integrate(x0, y0, { dt, T, p }), e = eq(p), times = [];
    for (let i = 1; i < r.t.length && times.length < 2; i++) {
      const s0 = r.y[i - 1] - e.y, s1 = r.y[i] - e.y;
      if (s0 < 0 && s1 >= 0 && r.x[i] > e.x) times.push(r.t[i - 1] + dt * (-s0) / (s1 - s0));
    }
    return times.length === 2 ? times[1] - times[0] : NaN;
  }

  // Distance between the start and the state exactly one period later (step 2 readout).
  function returnGap(x0, y0, p = P) {
    const per = period(x0, y0, p), n = Math.ceil(per / 0.005), r = integrate(x0, y0, { dt: per / n, T: per, p }), i = r.x.length - 1;
    return Math.hypot(r.x[i] - x0, r.y[i] - y0);
  }

  // Step 1 readout: first rabbit peak, the next fox peak, their lag, period and ranges.
  function story(x0, y0, p = P, T = 30) {
    const r = integrate(x0, y0, { dt: 0.005, T, p });
    const px = peaks(r.x), py = peaks(r.y);
    const iR = px[0], iF = py.find(i => i > iR);
    return {
      run: r, tRabbit: r.t[iR], tFox: r.t[iF], lag: r.t[iF] - r.t[iR], period: period(x0, y0, p),
      xMin: Math.min(...r.x), xMax: Math.max(...r.x), yMin: Math.min(...r.y), yMax: Math.max(...r.y),
      peaksX: px.map(i => r.t[i]), peaksY: py.map(i => r.t[i])
    };
  }

  // Step 5: drift of H at the end of the run, and how it scales when Δt is halved.
  function drift(method, dt, x0 = 4, y0 = 1, T = 30) {
    const r = integrate(x0, y0, { dt, T, method });
    const h0 = H(x0, y0), hs = r.x.map((x, i) => H(x, r.y[i]) - h0);
    return { run: r, hs, end: hs[hs.length - 1], gap0: h0 - H(eq().x, eq().y), escaped: r.escaped, tEnd: r.t[r.t.length - 1] };
  }
  const DTS = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3];

  // Step 6: equilibrium of the crowded model and its type from the Jacobian's eigenvalues.
  function eqCrowd(p = P, K = Infinity) {
    const xs = p.c / p.d;
    if (Number.isFinite(K) && K <= xs) {
      // foxes cannot be sustained: equilibrium (K, 0); eigenvalues −a and d·K − c
      return { x: K, y: 0, kind: 'extinct', l1: { re: -p.a, im: 0 }, l2: { re: p.d * K - p.c, im: 0 } };
    }
    const ys = Number.isFinite(K) ? p.a / p.b * (1 - xs / K) : p.a / p.b;
    const tr = Number.isFinite(K) ? -p.a * xs / K : 0, det = p.b * p.d * xs * ys, disc = tr * tr - 4 * det;
    let kind, l1, l2;
    if (disc < 0) { kind = tr < 0 ? 'spiral' : 'center'; l1 = { re: tr / 2, im: Math.sqrt(-disc) / 2 }; l2 = { re: tr / 2, im: -Math.sqrt(-disc) / 2 }; }
    else { kind = 'node'; l1 = { re: (tr + Math.sqrt(disc)) / 2, im: 0 }; l2 = { re: (tr - Math.sqrt(disc)) / 2, im: 0 }; }
    return { x: xs, y: ys, kind, l1, l2, tr, det };
  }
  // Boundary between node and spiral for the default parameters: K² − 4K − 4 = 0 → K = 2 + 2√2.
  const K_SPIRAL = 2 + 2 * Math.SQRT2;
  function crowdRun(K, x0 = 6, y0 = 1, T = 60) {
    const r = integrate(x0, y0, { dt: 0.01, T, K }), e = eqCrowd(P, K);
    const vs = r.x.map((x, i) => V(x, r.y[i], P, K));
    const last = r.x.length - 1;
    return { run: r, eq: e, vs, dist: Math.hypot(r.x[last] - e.x, r.y[last] - e.y), vRatio: vs[last] / vs[0] };
  }

  const api = { P, eq, rates, terms, stepEuler, stepRK4, integrate, H, V, peaks, period, returnGap, story, drift, DTS, eqCrowd, K_SPIRAL, crowdRun };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ODE_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
