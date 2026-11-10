'use strict';
// Kalman filter lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, band and readout on the page is computed here; tests/core.cjs pins the claims.
// Conventions: lengths in metres, time steps of dt = 1 s, all noise zero-mean Gaussian and
// independent, variances written P / Q / R, standard deviations written σ = √(variance).
(function (root) {
  /* ---------- seeded noise (mulberry32 + Box–Muller), so every scene replays exactly ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(seed, n) {
    const u = rng(seed), out = [];
    while (out.length < n) {
      const a = Math.max(1e-12, u()), b = u(), r = Math.sqrt(-2 * Math.log(a));
      out.push(r * Math.cos(2 * Math.PI * b)); if (out.length < n) out.push(r * Math.sin(2 * Math.PI * b));
    }
    return out;
  }
  const SEEDS = [11, 23, 37, 41, 59];

  /* ---------- step 0: blending two independent guesses ---------- */
  // Estimate = (1 − w)·prediction + w·measurement. With independent errors its variance is
  // (1 − w)²P + w²R, which is smallest at w = K = P / (P + R).
  const S0 = { pred: 10.0, meas: 11.2 };
  const blendVar = (w, P, R) => (1 - w) * (1 - w) * P + w * w * R;
  function fuse(x, P, z, R) {
    const K = P / (P + R);
    return { K, x: x + K * (z - x), P: (1 - K) * P };
  }
  function blend(w, sp, sr) {
    const P = sp * sp, R = sr * sr, best = fuse(S0.pred, P, S0.meas, R);
    const v = blendVar(w, P, R);
    return { x: (1 - w) * S0.pred + w * S0.meas, sd: Math.sqrt(v), K: best.K, bestX: best.x, bestSd: Math.sqrt(best.P), excess: Math.sqrt(v) / Math.sqrt(best.P) - 1 };
  }
  const normPdf = (x, m, sd) => Math.exp(-0.5 * ((x - m) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));

  /* ---------- step 1: one fixed distance, measured again and again ---------- */
  // A wall at 5.00 m; laser σr = 0.5 m; prior guess 3.0 m with σ0 chosen by the reader.
  const S1 = { truth: 5.0, prior: 3.0, sr: 0.5, N: 30 };
  function staticRun(s0, seed) {
    const R = S1.sr * S1.sr, e = gauss(seed, S1.N);
    let x = S1.prior, P = s0 * s0, sum = 0;
    const rows = [];
    for (let k = 1; k <= S1.N; k++) {
      const z = S1.truth + S1.sr * e[k - 1];
      const f = fuse(x, P, z, R); x = f.x; P = f.P; sum += z;
      rows.push({ k, z, K: f.K, x, sd: Math.sqrt(P), mean: sum / k, Pclosed: 1 / (1 / (s0 * s0) + k / R) });
    }
    return rows;
  }

  /* ---------- step 2: predict widens, update narrows (random-walk position) ---------- */
  // x_k = x_{k−1} + w_k, w ~ N(0, Q); z_k = x_k + v_k, v ~ N(0, R). The variance recursion does not
  // depend on the data, so it can be drawn before a single measurement arrives.
  function varianceRun(sq, sr, s0, N) {
    const Q = sq * sq, R = sr * sr; let P = s0 * s0; const rows = [];
    for (let k = 1; k <= N; k++) {
      const Pm = P + Q, K = Pm / (Pm + R); P = (1 - K) * Pm;
      rows.push({ k, sdPrior: Math.sqrt(Pm), sdPost: Math.sqrt(P), K });
    }
    return rows;
  }
  // Steady state of the scalar Riccati recursion: P⁻ = P⁺ + Q, P⁺ = P⁻R/(P⁻ + R).
  function steady(sq, sr) {
    const Q = sq * sq, R = sr * sr, Pm = (Q + Math.sqrt(Q * Q + 4 * Q * R)) / 2, K = Pm / (Pm + R);
    return { Pm, Pp: (1 - K) * Pm, K, sdPrior: Math.sqrt(Pm), sdPost: Math.sqrt((1 - K) * Pm) };
  }
  // First step from which K stays within 1 % of K∞.
  function settleStep(sq, sr, s0, N = 200) {
    const run = varianceRun(sq, sr, s0, N), K = steady(sq, sr).K;
    let last = 0; run.forEach(r => { if (Math.abs(r.K - K) > 0.01 * K) last = r.k; });
    return last + 1;
  }

  /* ---------- step 3: tuning the assumed process noise ---------- */
  const S3 = { sqTrue: 0.3, sr: 1.0, N: 120, skip: 20 };
  const QGRID = Array.from({ length: 25 }, (_, i) => 0.01 * Math.pow(300, i / 24)); // 0.01 … 3 m, log-spaced
  function walkScene(seed) {
    const a = gauss(seed, S3.N), b = gauss(seed + 1000, S3.N), truth = [], z = [];
    let x = 0;
    for (let k = 0; k < S3.N; k++) { x += S3.sqTrue * a[k]; truth.push(x); z.push(x + S3.sr * b[k]); }
    return { truth, z };
  }
  function trackRun(sqAssumed, seed) {
    const sc = walkScene(seed), Q = sqAssumed * sqAssumed, R = S3.sr * S3.sr;
    let x = sc.z[0], P = R; const est = [x], sd = [Math.sqrt(P)];
    for (let k = 1; k < S3.N; k++) { const Pm = P + Q, f = fuse(x, Pm, sc.z[k], R); x = f.x; P = f.P; est.push(x); sd.push(Math.sqrt(P)); }
    const rms = arr => Math.sqrt(arr.reduce((s, v) => s + v * v, 0) / arr.length);
    const errs = [], merr = [];
    for (let k = S3.skip; k < S3.N; k++) { errs.push(est[k] - sc.truth[k]); merr.push(sc.z[k] - sc.truth[k]); }
    return { ...sc, est, sd, rmse: rms(errs), measRmse: rms(merr), claimed: steady(sqAssumed, S3.sr).sdPost };
  }
  function tuningCurve(seed) {
    const pts = QGRID.map(q => ({ q, rmse: trackRun(q, seed).rmse, claimed: steady(q, S3.sr).sdPost }));
    let best = pts[0]; pts.forEach(p => { if (p.rmse < best.rmse) best = p; });
    return { pts, best };
  }

  /* ---------- steps 4–5: position and velocity, position measured only ---------- */
  const S4 = { dt: 1, v: 1.2, sa: 0.02, sr: 1.5, N: 40, sp0: 3, sv0: 2 };
  const mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  const tr = A => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
  const add = (A, B) => [[A[0][0] + B[0][0], A[0][1] + B[0][1]], [A[1][0] + B[1][0], A[1][1] + B[1][1]]];
  function cvMatrices() {
    const d = S4.dt, q = S4.sa * S4.sa;
    return { F: [[1, d], [0, 1]], Q: [[q * d ** 4 / 4, q * d ** 3 / 2], [q * d ** 3 / 2, q * d * d]], R: S4.sr * S4.sr };
  }
  function cvScene(seed, N) {
    const a = gauss(seed, N + 1), b = gauss(seed + 500, N + 1), d = S4.dt;
    let p = 0, v = S4.v; const pos = [p], vel = [v], z = [p + S4.sr * b[0]];
    for (let k = 1; k <= N; k++) { const acc = S4.sa * a[k]; p += v * d + 0.5 * acc * d * d; v += acc * d; pos.push(p); vel.push(v); z.push(p + S4.sr * b[k]); }
    return { pos, vel, z };
  }
  // gap = {from, len}: measurements k ∈ [from, from + len) are missing (predict only).
  function cvRun(seed, N, gap) {
    const sc = cvScene(seed, N), { F, Q, R } = cvMatrices();
    let x = [0, 0], P = [[S4.sp0 ** 2, 0], [0, S4.sv0 ** 2]];
    const rows = [{ k: 0, x: x.slice(), P, prior: null, Kp: 0, Kv: 0, measured: false }];
    for (let k = 1; k <= N; k++) {
      x = [x[0] + F[0][1] * x[1], x[1]]; P = add(mul(mul(F, P), tr(F)), Q);
      const prior = { x: x.slice(), P };
      const missing = gap && k >= gap.from && k < gap.from + gap.len;
      let Kp = 0, Kv = 0;
      if (!missing) {
        const S = P[0][0] + R; Kp = P[0][0] / S; Kv = P[1][0] / S;
        const innov = sc.z[k] - x[0];
        x = [x[0] + Kp * innov, x[1] + Kv * innov];
        P = [[(1 - Kp) * P[0][0], (1 - Kp) * P[0][1]], [P[1][0] - Kv * P[0][0], P[1][1] - Kv * P[0][1]]];
      }
      rows.push({ k, x: x.slice(), P, prior, Kp, Kv, measured: !missing });
    }
    return { ...sc, rows };
  }
  const corr = P => P[0][1] / Math.sqrt(P[0][0] * P[1][1]);
  // 2σ ellipse of a 2×2 covariance: semi-axes and the angle of the major axis (in data units).
  function ellipse(P) {
    const a = P[0][0], b = P[0][1], c = P[1][1], m = (a + c) / 2, d = Math.sqrt(((a - c) / 2) ** 2 + b * b);
    return { l1: m + d, l2: Math.max(0, m - d), ang: 0.5 * Math.atan2(2 * b, a - c) };
  }
  const S5 = { N: 50, seed: 7 };
  function gapRun(from, len) { return cvRun(S5.seed, S5.N, { from, len }); }
  // Numbers quoted in the step-5 readout: σ_p just before the gap, at its last second, and how many
  // measured seconds it takes to come back within 10 % of the pre-gap value (null if not by k = N).
  function gapStats(from, len) {
    const run = gapRun(from, len), r = run.rows, sp = j => Math.sqrt(r[j].P[0][0]), sv = j => Math.sqrt(r[j].P[1][1]);
    const before = sp(from - 1), peak = sp(from + len - 1);
    let rec = null; for (let j = from + len; j <= S5.N; j++) if (sp(j) <= 1.1 * before) { rec = j - (from + len) + 1; break; }
    let maxerr = 0; for (let j = from; j < from + len; j++) maxerr = Math.max(maxerr, Math.abs(r[j].x[0] - run.pos[j]));
    return { before, peak, ratio: peak / before, rec, maxerr, svBefore: sv(from - 1) };
  }

  const api = { rng, gauss, SEEDS, S0, blendVar, fuse, blend, normPdf, S1, staticRun, varianceRun, steady, settleStep, S3, QGRID, walkScene, trackRun, tuningCurve, S4, cvMatrices, cvScene, cvRun, corr, ellipse, S5, gapRun, gapStats };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KALMAN_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
