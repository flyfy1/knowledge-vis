/* Noise into pictures: every model behind the page.
 * Pure functions only (no DOM). Loaded by index.html as window.NoiseModels and by tests/models.cjs and
 * train.cjs via require(). Everything random takes a seeded generator so runs repeat exactly.
 *
 * The toy data are Gaussian mixtures in two dimensions. That choice is deliberate: for a Gaussian mixture the
 * noised density p_t, its score, the optimal denoiser (posterior mean, Tweedie's formula) and the optimal
 * flow-matching velocity all have closed forms, so the page can show the exact optimum next to a trained network.
 *
 * Sources (see BRIEF.md): forward process, ε-objective and ancestral sampler: Ho, Jain & Abbeel 2020 (DDPM),
 * eq. 4, 14, Alg. 2, linear β from 1e-4 to 0.02, T = 1000. Deterministic sampler and η: Song, Meng & Ermon 2021
 * (DDIM) eq. 12 and 16. Score, Langevin and noise levels: Song & Ermon 2019 (NCSN). Reverse SDE and probability
 * flow ODE: Song et al. 2021. Flow matching with the linear (OT) path: Lipman et al. 2023; rectified flow and
 * reflow: Liu, Gong & Liu 2023. Classifier-free guidance: Ho & Salimans 2022 eq. 6. Tweedie's formula: Efron 2011.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NoiseModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TAU = 2 * Math.PI;

  /* ───────── seeded randomness ───────── */
  function rng(seed) {
    let a = (seed >>> 0) || 1, spare = null;
    const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const n = () => { if (spare !== null) { const s = spare; spare = null; return s; } let x, y, r; do { x = 2 * u() - 1; y = 2 * u() - 1; r = x * x + y * y; } while (r >= 1 || r === 0); const f = Math.sqrt(-2 * Math.log(r) / r); spare = y * f; return x * f; };
    return { u, n };
  }

  /* ───────── noise schedule (DDPM: T = 1000, β linear 1e-4 → 0.02) ───────── */
  const T = 1000;
  const beta = new Float64Array(T + 1), alphabar = new Float64Array(T + 1);
  alphabar[0] = 1;
  for (let t = 1; t <= T; t++) { beta[t] = 1e-4 + (0.02 - 1e-4) * (t - 1) / (T - 1); alphabar[t] = alphabar[t - 1] * (1 - beta[t]); }

  /* ───────── Gaussian mixtures (isotropic components, shared sd s) ───────── */
  function mixture(mu, w, s) {
    const K = mu.length / 2, ww = new Float64Array(K); let sum = 0;
    for (let k = 0; k < K; k++) { ww[k] = w ? w[k] : 1; sum += ww[k]; }
    for (let k = 0; k < K; k++) ww[k] /= sum;
    const logw = ww.map(Math.log);
    return { mu: Float64Array.from(mu), w: ww, logw, s, K };
  }
  // The page's main data set: 24 small blobs along a spiral (sd 0.07), coordinates roughly in [-1.6, 1.6].
  function makeSpiral() {
    const K = 24, mu = [];
    for (let k = 0; k < K; k++) { const f = k / (K - 1), th = 0.5 * Math.PI + 2.6 * Math.PI * f, r = 0.3 + 1.2 * f; mu.push(r * Math.cos(th), r * Math.sin(th)); }
    return mixture(mu, null, 0.07);
  }
  const SPIRAL = makeSpiral();
  // Song & Ermon 2019, §3.2.2 / Fig. 3: 1/5 N((-5,-5), I) + 4/5 N((5,5), I).
  const SE = mixture([-5, -5, 5, 5], [0.2, 0.8], 1);
  // Two classes for guidance: two interleaved arcs ("two moons"), 12 blobs each, sd 0.25 so the classes overlap.
  function makeMoons() {
    const K = 12, a = [], b = [], sd = 0.25, dy = 0.25;
    for (let k = 0; k < K; k++) { const th = Math.PI * k / (K - 1); a.push(Math.cos(th) - 0.5, Math.sin(th) - dy); b.push(0.5 - Math.cos(th), dy - Math.sin(th)); }
    return { A: mixture(a, null, sd), B: mixture(b, null, sd), U: mixture(a.concat(b), null, sd) };
  }
  const MOONS = makeMoons();

  function sampleMix(m, n, r) {
    const out = new Float64Array(2 * n);
    for (let i = 0; i < n; i++) {
      let u = r.u(), k = 0; while (k < m.K - 1 && u > m.w[k]) { u -= m.w[k]; k++; }
      out[2 * i] = m.mu[2 * k] + m.s * r.n(); out[2 * i + 1] = m.mu[2 * k + 1] + m.s * r.n();
    }
    return out;
  }
  // density of a mixture whose components have extra variance: means scaled by a, variance a²s² + v
  function logpMix(m, x, y, a = 1, v = 0) {
    const vv = a * a * m.s * m.s + v; let mx = -Infinity; const L = new Float64Array(m.K);
    for (let k = 0; k < m.K; k++) { const dx = x - a * m.mu[2 * k], dy = y - a * m.mu[2 * k + 1]; L[k] = m.logw[k] - (dx * dx + dy * dy) / (2 * vv); if (L[k] > mx) mx = L[k]; }
    let s = 0; for (let k = 0; k < m.K; k++) s += Math.exp(L[k] - mx);
    return mx + Math.log(s) - Math.log(TAU * vv);
  }
  // posterior responsibilities r_k(x) for the noised mixture (means a·μ_k, variance a²s² + v)
  function resp(m, x, y, a, v, out) {
    const vv = a * a * m.s * m.s + v; let mx = -Infinity;
    for (let k = 0; k < m.K; k++) { const dx = x - a * m.mu[2 * k], dy = y - a * m.mu[2 * k + 1]; out[k] = m.logw[k] - (dx * dx + dy * dy) / (2 * vv); if (out[k] > mx) mx = out[k]; }
    let s = 0; for (let k = 0; k < m.K; k++) { out[k] = Math.exp(out[k] - mx); s += out[k]; }
    for (let k = 0; k < m.K; k++) out[k] /= s;
    return vv;
  }

  /* ───────── VP diffusion, exact quantities for a mixture ─────────
   * x_t = √ᾱ x₀ + √(1−ᾱ) ε.  p_t = Σ w_k N(√ᾱ μ_k, (ᾱ s² + 1 − ᾱ) I).
   * score ∇log p_t = Σ r_k (√ᾱ μ_k − x)/v ;  ε*(x) = −√(1−ᾱ) · score ;  E[x₀|x_t] = (x + (1−ᾱ) score)/√ᾱ (Tweedie). */
  const vp = {
    score(m, x, y, ab, R) {
      R = R || new Float64Array(m.K); const a = Math.sqrt(ab), vv = resp(m, x, y, a, 1 - ab, R);
      let gx = 0, gy = 0; for (let k = 0; k < m.K; k++) { gx += R[k] * (a * m.mu[2 * k] - x); gy += R[k] * (a * m.mu[2 * k + 1] - y); }
      return [gx / vv, gy / vv];
    },
    // posterior mean computed directly from the posterior over (component, x₀); equals Tweedie's formula
    posteriorMean(m, x, y, ab, R) {
      R = R || new Float64Array(m.K); const a = Math.sqrt(ab), vv = resp(m, x, y, a, 1 - ab, R), g = a * m.s * m.s / vv;
      let ex = 0, ey = 0; for (let k = 0; k < m.K; k++) { ex += R[k] * (m.mu[2 * k] + g * (x - a * m.mu[2 * k])); ey += R[k] * (m.mu[2 * k + 1] + g * (y - a * m.mu[2 * k + 1])); }
      return [ex, ey];
    },
    tweedie(m, x, y, ab) { const s = vp.score(m, x, y, ab); const a = Math.sqrt(ab); return [(x + (1 - ab) * s[0]) / a, (y + (1 - ab) * s[1]) / a]; },
    // exact ε-predictor for a batch at one time index
    epsFn(m) {
      const R = new Float64Array(m.K);
      return (xs, t, out) => { const ab = alphabar[t], c = -Math.sqrt(1 - ab); for (let i = 0; i < xs.length; i += 2) { const s = vp.score(m, xs[i], xs[i + 1], ab, R); out[i] = c * s[0]; out[i + 1] = c * s[1]; } };
    },
    // classifier-free guidance on exact ε: ε̃ = (1 + w) ε(x|c) − w ε(x)   (Ho & Salimans 2022, eq. 6)
    guidedEpsFn(mc, mu, w) {
      const ec = vp.epsFn(mc), eu = vp.epsFn(mu); let tmp = null;
      return (xs, t, out) => { if (!tmp || tmp.length !== xs.length) tmp = new Float64Array(xs.length); ec(xs, t, out); if (w === 0) return; eu(xs, t, tmp); for (let i = 0; i < xs.length; i++) out[i] = (1 + w) * out[i] - w * tmp[i]; };
    },
    // forward process in closed form (eq. 4) …
    noise(x0, t, r) { const ab = alphabar[t], a = Math.sqrt(ab), b = Math.sqrt(1 - ab), out = new Float64Array(x0.length); for (let i = 0; i < x0.length; i++) out[i] = a * x0[i] + b * r.n(); return out; },
    // … and step by step: x_t = √(1−β_t) x_{t−1} + √β_t ε
    noiseStep(x, t, r) { const a = Math.sqrt(1 - beta[t]), b = Math.sqrt(beta[t]); for (let i = 0; i < x.length; i++) x[i] = a * x[i] + b * r.n(); return x; }
  };

  // The S time indices a sampler visits, from T down: τ_i = round(i·T/S), i = S … 1, then 0.
  function timesteps(S) { const out = []; for (let i = S; i >= 1; i--) out.push(Math.round(i * T / S)); out.push(0); return out; }

  /* One update of the generalised sampler (DDIM eq. 12 with σ from eq. 16):
   * x̂₀ = (x − √(1−ᾱ_t) ε)/√ᾱ_t ;  x_s = √ᾱ_s x̂₀ + √(1 − ᾱ_s − σ²) ε + σ z,
   * σ = η √((1−ᾱ_s)/(1−ᾱ_t)) √(1 − ᾱ_t/ᾱ_s).  η = 1: DDPM ancestral sampling; η = 0: DDIM (deterministic). */
  function samplerStep(xs, eps, t, s, eta, r) {
    const at = alphabar[t], as = alphabar[s];
    const sig = eta * Math.sqrt((1 - as) / (1 - at)) * Math.sqrt(Math.max(0, 1 - at / as));
    const c0 = Math.sqrt(as), cE = Math.sqrt(Math.max(0, 1 - as - sig * sig)), rt = Math.sqrt(at), bt = Math.sqrt(1 - at);
    for (let i = 0; i < xs.length; i++) { const x0 = (xs[i] - bt * eps[i]) / rt; xs[i] = c0 * x0 + cE * eps[i] + (sig > 0 ? sig * r.n() : 0); }
  }
  // Full sampler as a resumable job, so the page can spread long runs over several frames.
  function samplerJob(epsFn, n, S, eta, seed, opts = {}) {
    const r = rng(seed), xs = new Float64Array(2 * n);
    for (let i = 0; i < xs.length; i++) xs[i] = r.n();
    const ts = timesteps(S), eps = new Float64Array(2 * n), trace = opts.trace ? [Float64Array.from(xs.subarray(0, 2 * opts.trace))] : null;
    let i = 0;
    return {
      xs, trace, nfe: S,
      get done() { return i >= ts.length - 1; },
      get progress() { return i / (ts.length - 1); },
      run(maxSteps = Infinity) { let k = 0; while (i < ts.length - 1 && k < maxSteps) { epsFn(xs, ts[i], eps); samplerStep(xs, eps, ts[i], ts[i + 1], eta, r); if (trace) trace.push(Float64Array.from(xs.subarray(0, 2 * opts.trace))); i++; k++; } return this; }
    };
  }
  const sample = (epsFn, n, S, eta, seed, opts) => samplerJob(epsFn, n, S, eta, seed, opts).run();

  /* ───────── flow matching, linear path x_t = (1−t) z + t x₁, t: 0 (noise) → 1 (data) ─────────
   * Optimal velocity v*(x, t) = E[x₁ − z | x_t = x]; for a mixture, per component k:
   *   v_k = t s² + (1−t)²,  E[x₁|x,k] = μ_k + t s² (x − tμ_k)/v_k,  E[z|x,k] = (1−t)(x − tμ_k)/v_k. */
  const fm = {
    velocity(m, x, y, t, R) {
      R = R || new Float64Array(m.K);
      const vv = resp(m, x, y, t, (1 - t) * (1 - t), R), g1 = t * m.s * m.s / vv, g0 = (1 - t) / vv;
      let vx = 0, vy = 0;
      for (let k = 0; k < m.K; k++) { const dx = x - t * m.mu[2 * k], dy = y - t * m.mu[2 * k + 1]; vx += R[k] * (m.mu[2 * k] + (g1 - g0) * dx); vy += R[k] * (m.mu[2 * k + 1] + (g1 - g0) * dy); }
      return [vx, vy];
    },
    velFn(m) { const R = new Float64Array(m.K); return (xs, t, out) => { for (let i = 0; i < xs.length; i += 2) { const v = fm.velocity(m, xs[i], xs[i + 1], t, R); out[i] = v[0]; out[i + 1] = v[1]; } }; },
    // Euler with N equal steps from t = 0 to 1, resumable
    job(velFn, n, N, seed, opts = {}) {
      const r = rng(seed), xs = new Float64Array(2 * n);
      for (let i = 0; i < xs.length; i++) xs[i] = r.n();
      const v = new Float64Array(2 * n), trace = opts.trace ? [Float64Array.from(xs.subarray(0, 2 * opts.trace))] : null, h = 1 / N;
      let i = 0;
      return {
        xs, trace, nfe: N,
        get done() { return i >= N; }, get progress() { return i / N; },
        run(maxSteps = Infinity) { let k = 0; while (i < N && k < maxSteps) { velFn(xs, i * h, v); for (let j = 0; j < xs.length; j++) xs[j] += h * v[j]; if (trace) trace.push(Float64Array.from(xs.subarray(0, 2 * opts.trace))); i++; k++; } return this; }
      };
    },
    // accurate solve with classical RK4 (used to make reflow pairs and as the reference "exact flow")
    rk4(velFn, xs, N) {
      const h = 1 / N, n = xs.length, k1 = new Float64Array(n), k2 = new Float64Array(n), k3 = new Float64Array(n), k4 = new Float64Array(n), tmp = new Float64Array(n);
      for (let i = 0; i < N; i++) {
        const t = i * h;
        velFn(xs, t, k1); for (let j = 0; j < n; j++) tmp[j] = xs[j] + 0.5 * h * k1[j];
        velFn(tmp, t + 0.5 * h, k2); for (let j = 0; j < n; j++) tmp[j] = xs[j] + 0.5 * h * k2[j];
        velFn(tmp, t + 0.5 * h, k3); for (let j = 0; j < n; j++) tmp[j] = xs[j] + h * k3[j];
        velFn(tmp, Math.min(1, t + h), k4); for (let j = 0; j < n; j++) xs[j] += h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]);
      }
      return xs;
    }
  };
  const fmSample = (velFn, n, N, seed, opts) => fm.job(velFn, n, N, seed, opts).run();

  /* ───────── score and Langevin dynamics (Song & Ermon 2019) ─────────
   * x ← x + (η/2) ∇log p_σ(x) + √η z, where p_σ is the data density blurred by N(0, σ²I).
   * Annealed: σ runs through a geometric ladder σ₁ > … > σ_L, with η_i = ε σ_i² / σ_L² and a fixed number of steps per level. */
  function scoreSigma(m, x, y, sig, R) {
    R = R || new Float64Array(m.K); const vv = resp(m, x, y, 1, sig * sig, R);
    let gx = 0, gy = 0; for (let k = 0; k < m.K; k++) { gx += R[k] * (m.mu[2 * k] - x); gy += R[k] * (m.mu[2 * k + 1] - y); }
    return [gx / vv, gy / vv];
  }
  const LANGEVIN = { levels: 10, sigMax: 20, sigMin: 1, perLevel: 100, eps: 0.1, plainEta: 0.1 }; // chosen for this toy, not from the paper
  function sigmaLadder(L = LANGEVIN) { const out = []; for (let i = 0; i < L.levels; i++) out.push(L.sigMax * Math.pow(L.sigMin / L.sigMax, i / (L.levels - 1))); return out; }
  function langevinJob(m, n, annealed, seed, L = LANGEVIN) {
    const r = rng(seed), xs = new Float64Array(2 * n), R = new Float64Array(m.K), ladder = sigmaLadder(L), total = L.levels * L.perLevel;
    for (let i = 0; i < xs.length; i++) xs[i] = -8 + 16 * r.u(); // start uniform on [-8, 8]²
    let k = 0;
    return {
      xs, total,
      get done() { return k >= total; }, get step() { return k; },
      get sigma() { return annealed ? ladder[Math.min(L.levels - 1, Math.floor(k / L.perLevel))] : 0; },
      run(maxSteps = Infinity) {
        let c = 0;
        while (k < total && c < maxSteps) {
          const lv = Math.min(L.levels - 1, Math.floor(k / L.perLevel));
          const sig = annealed ? ladder[lv] : 0, eta = annealed ? L.eps * ladder[lv] * ladder[lv] / (L.sigMin * L.sigMin) : L.plainEta, q = Math.sqrt(eta);
          for (let i = 0; i < xs.length; i += 2) { const g = scoreSigma(m, xs[i], xs[i + 1], sig, R); xs[i] += 0.5 * eta * g[0] + q * r.n(); xs[i + 1] += 0.5 * eta * g[1] + q * r.n(); }
          k++; c++;
        }
        return this;
      }
    };
  }
  const shareBelow = xs => { let c = 0; for (let i = 0; i < xs.length; i += 2) if (xs[i] + xs[i + 1] < 0) c++; return c / (xs.length / 2); };

  /* ───────── sliced Wasserstein-1 distance between two equal-size point sets ─────────
   * Project both sets on P evenly spaced directions, sort, average |a_(i) − b_(i)|, then average over directions. */
  function sw(a, b, P = 64) {
    const n = Math.min(a.length, b.length) / 2, pa = new Float64Array(n), pb = new Float64Array(n); let tot = 0;
    for (let j = 0; j < P; j++) {
      const th = Math.PI * j / P, c = Math.cos(th), s = Math.sin(th);
      for (let i = 0; i < n; i++) { pa[i] = c * a[2 * i] + s * a[2 * i + 1]; pb[i] = c * b[2 * i] + s * b[2 * i + 1]; }
      pa.sort(); pb.sort(); let d = 0; for (let i = 0; i < n; i++) d += Math.abs(pa[i] - pb[i]); tot += d / n;
    }
    return tot / P;
  }
  /* The page's yardstick: N_EVAL generated points against the true distribution, represented by a large fixed
   * sample (N_TRUTH points). On each direction the generated quantiles are compared with the matching quantiles of
   * the large sample. swFloor = the average score of N_EVAL genuine samples: the best a perfect generator gets. */
  const N_EVAL = 1000, N_TRUTH = 40000, SEED_REF = 7001, SEED_GEN = 4242, P_DIR = 64;
  const truthCache = new Map();
  function truth(m) {
    if (truthCache.has(m)) return truthCache.get(m);
    const big = sampleMix(m, N_TRUTH, rng(SEED_REF)), dirs = [];
    for (let j = 0; j < P_DIR; j++) { const th = Math.PI * j / P_DIR, c = Math.cos(th), s = Math.sin(th), q = new Float64Array(N_TRUTH); for (let i = 0; i < N_TRUTH; i++) q[i] = c * big[2 * i] + s * big[2 * i + 1]; q.sort(); dirs.push(q); }
    const out = { big, dirs }; truthCache.set(m, out); return out;
  }
  function swTruth(m, a) {
    const T0 = truth(m), n = a.length / 2, pa = new Float64Array(n); let tot = 0;
    for (let j = 0; j < P_DIR; j++) {
      const th = Math.PI * j / P_DIR, c = Math.cos(th), s = Math.sin(th), q = T0.dirs[j];
      for (let i = 0; i < n; i++) pa[i] = c * a[2 * i] + s * a[2 * i + 1];
      pa.sort(); let d = 0;
      for (let i = 0; i < n; i++) { const u = (i + 0.5) / n * N_TRUTH - 0.5, k = Math.max(0, Math.min(N_TRUTH - 2, Math.floor(u))), f = Math.min(1, Math.max(0, u - k)); d += Math.abs(pa[i] - (q[k] * (1 - f) + q[k + 1] * f)); }
      tot += d / n;
    }
    return tot / P_DIR;
  }
  const reference = (m, seed = SEED_REF + 1, n = N_EVAL) => sampleMix(m, n, rng(seed));
  // average over 8 fixed seeds of the score of genuine samples
  const floorCache = new Map();
  function swFloor(m, n = N_EVAL) { let byN = floorCache.get(m); if (!byN) floorCache.set(m, byN = new Map()); if (!byN.has(n)) { let s = 0; for (let k = 0; k < 8; k++) s += swTruth(m, sampleMix(m, n, rng(SEED_REF + 10 + k))); byN.set(n, s / 8); } return byN.get(n); }

  /* ───────── a small multilayer perceptron, trained with Adam ─────────
   * input: (x, y, 8 time features) → 48 → 48 → 2, SiLU activations. Used for ε-prediction (DDPM loss) and for
   * velocity prediction (flow matching). Forward and backward are written out by hand. */
  const NET = { inp: 10, hid: 48, out: 2 };
  function timeFeatures(tau, f, o) { for (let j = 0; j < 4; j++) { const w = Math.PI * Math.pow(2, j) * tau; f[o + 2 * j] = Math.sin(w); f[o + 2 * j + 1] = Math.cos(w); } }
  function netCreate(seed) {
    const r = rng(seed), I = NET.inp, H = NET.hid, O = NET.out;
    const he = (n, fan) => { const a = new Float64Array(n), sc = Math.sqrt(2 / fan); for (let i = 0; i < n; i++) a[i] = sc * r.n(); return a; };
    return { W1: he(I * H, I), b1: new Float64Array(H), W2: he(H * H, H), b2: new Float64Array(H), W3: he(H * O, H).map(v => v * 0.1), b3: new Float64Array(O) };
  }
  const KEYS = ['W1', 'b1', 'W2', 'b2', 'W3', 'b3'];
  const sig = z => 1 / (1 + Math.exp(-z));
  // forward for n rows of input X (n × 10); returns output (n × 2); keeps activations when cache is given
  function netForward(p, X, n, out, cache) {
    const I = NET.inp, H = NET.hid, O = NET.out;
    const z1 = cache ? cache.z1 : new Float64Array(n * H), h1 = cache ? cache.h1 : new Float64Array(n * H), z2 = cache ? cache.z2 : new Float64Array(n * H), h2 = cache ? cache.h2 : new Float64Array(n * H);
    for (let r = 0; r < n; r++) {
      const xo = r * I, ho = r * H;
      for (let j = 0; j < H; j++) { let s = p.b1[j]; for (let i = 0; i < I; i++) s += X[xo + i] * p.W1[i * H + j]; z1[ho + j] = s; h1[ho + j] = s * sig(s); }
      for (let j = 0; j < H; j++) { let s = p.b2[j]; for (let i = 0; i < H; i++) s += h1[ho + i] * p.W2[i * H + j]; z2[ho + j] = s; h2[ho + j] = s * sig(s); }
      for (let j = 0; j < O; j++) { let s = p.b3[j]; for (let i = 0; i < H; i++) s += h2[ho + i] * p.W3[i * O + j]; out[r * O + j] = s; }
    }
    return out;
  }
  function netGrad(p, X, Y, n, cache, g) {
    const I = NET.inp, H = NET.hid, O = NET.out, pred = new Float64Array(n * O);
    netForward(p, X, n, pred, cache);
    for (const k of KEYS) g[k].fill(0);
    let loss = 0; const d2 = new Float64Array(H), d1 = new Float64Array(H), dh = new Float64Array(H);
    const dsilu = z => { const s = sig(z); return s * (1 + z * (1 - s)); };
    for (let r = 0; r < n; r++) {
      const ho = r * H, xo = r * I;
      const e0 = pred[r * O] - Y[r * O], e1 = pred[r * O + 1] - Y[r * O + 1];
      loss += e0 * e0 + e1 * e1;
      const go0 = 2 * e0 / n, go1 = 2 * e1 / n; // d(mean over rows of squared error summed over the 2 outputs)
      g.b3[0] += go0; g.b3[1] += go1;
      for (let i = 0; i < H; i++) { const h = cache.h2[ho + i]; g.W3[i * O] += h * go0; g.W3[i * O + 1] += h * go1; dh[i] = p.W3[i * O] * go0 + p.W3[i * O + 1] * go1; d2[i] = dh[i] * dsilu(cache.z2[ho + i]); }
      for (let j = 0; j < H; j++) g.b2[j] += d2[j];
      for (let i = 0; i < H; i++) { const h = cache.h1[ho + i]; let s = 0; for (let j = 0; j < H; j++) { g.W2[i * H + j] += h * d2[j]; s += p.W2[i * H + j] * d2[j]; } d1[i] = s * dsilu(cache.z1[ho + i]); }
      for (let j = 0; j < H; j++) g.b1[j] += d1[j];
      for (let i = 0; i < I; i++) { const x = X[xo + i]; if (x === 0) continue; for (let j = 0; j < H; j++) g.W1[i * H + j] += x * d1[j]; }
    }
    return loss / n;
  }
  /* Trainer: kind 'eps' (DDPM loss ‖ε − ε_θ(x_t, t)‖², t uniform on 1…T), 'fm' (‖(x₁ − z) − v_θ(x_t, t)‖², t uniform on [0,1]),
   * 'reflow' (as fm but on fixed pairs (z, x₁)). data(): returns one clean data point (or a pair for reflow). */
  function trainer(kind, opts) {
    const B = opts.batch || 256, r = rng(opts.seed || 1), p = opts.init || netCreate((opts.seed || 1) + 100);
    const g = {}, m1 = {}, m2 = {}; for (const k of KEYS) { g[k] = new Float64Array(p[k].length); m1[k] = new Float64Array(p[k].length); m2[k] = new Float64Array(p[k].length); }
    const H = NET.hid, cache = { z1: new Float64Array(B * H), h1: new Float64Array(B * H), z2: new Float64Array(B * H), h2: new Float64Array(B * H) };
    const X = new Float64Array(B * NET.inp), Y = new Float64Array(B * 2), steps = opts.steps, lr0 = opts.lr || 2e-3, lr1 = opts.lrEnd || 1e-4;
    const b1 = 0.9, b2 = 0.999; let it = 0, ema = null;
    const pt = new Float64Array(2);
    function batch() {
      for (let b = 0; b < B; b++) {
        const o = b * NET.inp;
        if (kind === 'eps') {
          opts.data(r, pt); const t = 1 + Math.floor(r.u() * T), ab = alphabar[t], a = Math.sqrt(ab), s = Math.sqrt(1 - ab), e0 = r.n(), e1 = r.n();
          X[o] = a * pt[0] + s * e0; X[o + 1] = a * pt[1] + s * e1; timeFeatures(t / T, X, o + 2); Y[2 * b] = e0; Y[2 * b + 1] = e1;
        } else {
          let z0, z1; const t = r.u();
          if (kind === 'reflow') { const q = opts.pair(r); z0 = q[0]; z1 = q[1]; pt[0] = q[2]; pt[1] = q[3]; } else { opts.data(r, pt); z0 = r.n(); z1 = r.n(); }
          X[o] = (1 - t) * z0 + t * pt[0]; X[o + 1] = (1 - t) * z1 + t * pt[1]; timeFeatures(t, X, o + 2); Y[2 * b] = pt[0] - z0; Y[2 * b + 1] = pt[1] - z1;
        }
      }
    }
    return {
      params: p, get step() { return it; }, get ema() { return ema; },
      run(k) {
        let last = 0;
        for (let c = 0; c < k && it < steps; c++) {
          batch(); const loss = netGrad(p, X, Y, B, cache, g); last = loss; ema = ema == null ? loss : 0.98 * ema + 0.02 * loss;
          it++; const lr = lr1 + 0.5 * (lr0 - lr1) * (1 + Math.cos(Math.PI * it / steps));
          const c1 = 1 - Math.pow(b1, it), c2 = 1 - Math.pow(b2, it);
          for (const key of KEYS) { const P = p[key], G = g[key], M = m1[key], V = m2[key]; for (let i = 0; i < P.length; i++) { M[i] = b1 * M[i] + (1 - b1) * G[i]; V[i] = b2 * V[i] + (1 - b2) * G[i] * G[i]; P[i] -= lr * (M[i] / c1) / (Math.sqrt(V[i] / c2) + 1e-8); } }
        }
        return last;
      },
      get done() { return it >= steps; }
    };
  }
  // network as a batch function: ε-net at time index t (eps) or velocity net at continuous t (fm)
  function netFn(p, kind) {
    let X = null, n0 = 0;
    return (xs, t, out) => {
      const n = xs.length / 2;
      if (n !== n0) { X = new Float64Array(n * NET.inp); n0 = n; }
      const f = new Float64Array(NET.inp); timeFeatures(kind === 'eps' ? t / T : t, f, 2);
      for (let i = 0; i < n; i++) { const o = i * NET.inp; X[o] = xs[2 * i]; X[o + 1] = xs[2 * i + 1]; for (let j = 2; j < NET.inp; j++) X[o + j] = f[j]; }
      netForward(p, X, n, out);
    };
  }
  // shipped weights are base64 Float32; decode to Float64Arrays
  function b64ToF32(s) {
    let bin;
    if (typeof atob === 'function') bin = atob(s); else bin = Buffer.from(s, 'base64').toString('binary');
    const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Float32Array(u8.buffer);
  }
  function loadNet(packed) { const flat = b64ToF32(packed), p = {}; let o = 0; const sz = { W1: NET.inp * NET.hid, b1: NET.hid, W2: NET.hid * NET.hid, b2: NET.hid, W3: NET.hid * NET.out, b3: NET.out }; for (const k of KEYS) { p[k] = Float64Array.from(flat.subarray(o, o + sz[k])); o += sz[k]; } return p; }
  function packNet(p) { const n = KEYS.reduce((a, k) => a + p[k].length, 0), f = new Float32Array(n); let o = 0; for (const k of KEYS) { f.set(p[k], o); o += p[k].length; } return Buffer.from(f.buffer).toString('base64'); }

  // the lowest loss any ε-predictor can reach on the DDPM objective: E‖ε − ε*(x_t, t)‖², by Monte Carlo with a fixed seed
  function epsLossFloor(m, n = 20000, seed = 99) {
    const r = rng(seed), R = new Float64Array(m.K), x = new Float64Array(2); let tot = 0;
    for (let i = 0; i < n; i++) {
      const s0 = sampleMix(m, 1, r); const t = 1 + Math.floor(r.u() * T), ab = alphabar[t], a = Math.sqrt(ab), b = Math.sqrt(1 - ab), e0 = r.n(), e1 = r.n();
      x[0] = a * s0[0] + b * e0; x[1] = a * s0[1] + b * e1; const sc = vp.score(m, x[0], x[1], ab, R);
      const d0 = e0 + b * sc[0], d1 = e1 + b * sc[1]; tot += d0 * d0 + d1 * d1;
    }
    return tot / n;
  }
  // a model's loss on the same objective, same draws as the floor (for a fair comparison)
  function epsLoss(m, epsOne, n = 20000, seed = 99) {
    const r = rng(seed), x = new Float64Array(2), o = new Float64Array(2); let tot = 0;
    for (let i = 0; i < n; i++) {
      const s0 = sampleMix(m, 1, r); const t = 1 + Math.floor(r.u() * T), ab = alphabar[t], a = Math.sqrt(ab), b = Math.sqrt(1 - ab), e0 = r.n(), e1 = r.n();
      x[0] = a * s0[0] + b * e0; x[1] = a * s0[1] + b * e1; epsOne(x, t, o);
      const d0 = e0 - o[0], d1 = e1 - o[1]; tot += d0 * d0 + d1 * d1;
    }
    return tot / n;
  }

  /* ───────── chapter 1: sampling by rejection ─────────
   * Propose uniformly in a box, accept with probability p(x)/M where M ≥ max p. Acceptance rate = 1/(M·volume).
   * In d dimensions, for a Gaussian blob N(0, σ²I) inside the box [−1, 1]^d: acceptance = (√(2π) σ / 2)^d exactly. */
  const REJ = { box: 2, blobSigma: 0.25 };
  function maxDensity(m) { let best = -Infinity, bx = 0, by = 0; for (let k = 0; k < m.K; k++) { const l = logpMix(m, m.mu[2 * k], m.mu[2 * k + 1]); if (l > best) { best = l; bx = m.mu[2 * k]; by = m.mu[2 * k + 1]; } } // refine around the best centre
    let st = 0.02; for (let it = 0; it < 60; it++) { let moved = false; for (const [dx, dy] of [[st, 0], [-st, 0], [0, st], [0, -st]]) { const l = logpMix(m, bx + dx, by + dy); if (l > best) { best = l; bx += dx; by += dy; moved = true; } } if (!moved) st /= 2; } return Math.exp(best); }
  const rejection = {
    acceptance2d(m, box = REJ.box) { return 1 / (maxDensity(m) * Math.pow(2 * box, 2)); },
    log10AcceptanceBlob(d, sigma = REJ.blobSigma) { return d * Math.log10(Math.sqrt(TAU) * sigma / 2); },
    job(m, seed, box = REJ.box) {
      const r = rng(seed), M = maxDensity(m) * 1.0000001; let tried = 0, kept = 0; const pts = [];
      return {
        pts, get tried() { return tried; }, get kept() { return kept; },
        run(k) { for (let i = 0; i < k; i++) { const x = (2 * r.u() - 1) * box, y = (2 * r.u() - 1) * box, ok = r.u() * M < Math.exp(logpMix(m, x, y)); tried++; if (ok) kept++; pts.push(x, y, ok ? 1 : 0); } if (pts.length > 3 * 1500) pts.splice(0, pts.length - 3 * 1500); return this; }
      };
    }
  };

  /* ───────── chapter 8: the exact optimum on a finite training set copies it ─────────
   * For training points y₁…y_N the minimiser of the DDPM loss is the ε* of the empirical mixture Σ δ(y_i)/N
   * (a mixture with s = 0). Sampling it returns training points. */
  function trainingSet(n, seed) { return sampleMix(SPIRAL, n, rng(seed)); }
  function empirical(pts) { return mixture(Array.from(pts), null, 0); }
  // share of generated points that sit within δ of some training point
  function copyShare(gen, train, delta) {
    let c = 0; const d2 = delta * delta;
    for (let i = 0; i < gen.length; i += 2) { for (let j = 0; j < train.length; j += 2) { const dx = gen[i] - train[j], dy = gen[i + 1] - train[j + 1]; if (dx * dx + dy * dy < d2) { c++; break; } } }
    return c / (gen.length / 2);
  }
  const MEMO = { sizes: [16, 128, 1024], seed: 5150, delta: 0.01, steps: 250 };
  // median distance from a generated point to its nearest training point
  function nnMedian(gen, train) {
    const d = [];
    for (let i = 0; i < gen.length; i += 2) { let b = Infinity; for (let j = 0; j < train.length; j += 2) { const q = (gen[i] - train[j]) ** 2 + (gen[i + 1] - train[j + 1]) ** 2; if (q < b) b = q; } d.push(Math.sqrt(b)); }
    d.sort((a, b) => a - b); return d.length % 2 ? d[(d.length - 1) / 2] : 0.5 * (d[d.length / 2 - 1] + d[d.length / 2]);
  }

  /* ───────── chapter 7: guidance measures ─────────
   * fidelity: mean Bayes probability that a sample belongs to the asked-for class (clean class densities, equal priors);
   * spread: total variance of the samples divided by that of true samples of the class. */
  function classProb(x, y, mc, mo) { const a = logpMix(mc, x, y), b = logpMix(mo, x, y), mx = Math.max(a, b); return Math.exp(a - mx) / (Math.exp(a - mx) + Math.exp(b - mx)); }
  function totalVar(xs) { const n = xs.length / 2; let mx = 0, my = 0; for (let i = 0; i < xs.length; i += 2) { mx += xs[i]; my += xs[i + 1]; } mx /= n; my /= n; let v = 0; for (let i = 0; i < xs.length; i += 2) v += (xs[i] - mx) ** 2 + (xs[i + 1] - my) ** 2; return v / n; }
  const GUIDE = { steps: 50, ws: [0, 0.5, 1, 2, 3, 4, 6, 8] };
  function guidance(w, n = N_EVAL, seed = SEED_GEN) {
    const job = sample(vp.guidedEpsFn(MOONS.A, MOONS.U, w), n, GUIDE.steps, 0, seed), xs = job.xs;
    let f = 0; for (let i = 0; i < xs.length; i += 2) f += classProb(xs[i], xs[i + 1], MOONS.A, MOONS.B);
    const ref = reference(MOONS.A);
    return { xs, fidelity: f / (xs.length / 2), spread: totalVar(xs) / totalVar(ref), sw: swTruth(MOONS.A, xs) };
  }
  // the same measures for true samples of the class (what w = 0 should match)
  function trueFidelity(n = N_EVAL) { const ref = reference(MOONS.A); let f = 0; for (let i = 0; i < ref.length; i += 2) f += classProb(ref[i], ref[i + 1], MOONS.A, MOONS.B); return f / (ref.length / 2); }

  /* ───────── chapter 6: path straightness ─────────
   * length of the path a point travels divided by the straight-line distance between its start and end (1 = straight). */
  function straightness(trace, n) {
    let tot = 0;
    for (let i = 0; i < n; i++) {
      let L = 0; for (let k = 1; k < trace.length; k++) L += Math.hypot(trace[k][2 * i] - trace[k - 1][2 * i], trace[k][2 * i + 1] - trace[k - 1][2 * i + 1]);
      const c = Math.hypot(trace[trace.length - 1][2 * i] - trace[0][2 * i], trace[trace.length - 1][2 * i + 1] - trace[0][2 * i + 1]);
      tot += L / c;
    }
    return tot / n;
  }

  /* ───────── chapter 9: latent-space arithmetic (counts only, no model) ───────── */
  function latentCost(res, f, c, patch) {
    const pixels = res * res * 3, side = res / f, latent = side * side * c, tokens = Math.pow(side / patch, 2);
    return { pixels, latent, ratio: pixels / latent, side, tokens, pairs: tokens * tokens, pixelTokens: Math.pow(res / patch, 2), pixelPairs: Math.pow(res / patch, 4) };
  }

  const NFE_LIST = [1, 2, 5, 10, 20, 50, 100, 200, 1000];
  const FM_NFE_LIST = [1, 2, 5, 10, 20, 50, 100, 200];

  return {
    rng, T, beta, alphabar, mixture, SPIRAL, SE, MOONS, sampleMix, logpMix, vp, timesteps, samplerStep, samplerJob, sample,
    fm, fmSample, scoreSigma, LANGEVIN, sigmaLadder, langevinJob, shareBelow, sw, swTruth, truth, N_EVAL, N_TRUTH, SEED_REF, SEED_GEN, reference, swFloor,
    NET, timeFeatures, netCreate, netForward, netGrad, trainer, netFn, loadNet, packNet, epsLossFloor, epsLoss,
    REJ, maxDensity, rejection, trainingSet, empirical, copyShare, nnMedian, MEMO, classProb, totalVar, GUIDE, guidance, trueFidelity,
    straightness, latentCost, NFE_LIST, FM_NFE_LIST
  };
}));
