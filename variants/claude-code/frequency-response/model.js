'use strict';
// Frequency-response lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Continuous-time filters built from first-order RC sections (with buffers between them) and a
// series-RLC band-pass. Two independent routes to every number:
//   formula  — H(jω) evaluated as a complex ratio;
//   bench    — the section ODEs integrated with RK4, then a sine fitted to the settled output.
// tests/core.cjs checks that the two agree and pins every claim the page makes.
(function (root) {
  const TAU = 2 * Math.PI;
  const c = (re, im = 0) => ({ re, im });
  const mul = (a, b) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const mag = a => Math.hypot(a.re, a.im), arg = a => Math.atan2(a.im, a.re);
  const dB = g => 20 * Math.log10(g);

  // Sections: { type: 'lp' | 'hp', fc } or { type: 'bp', f0, Q }
  function Hsec(s, f) {
    if (s.type === 'lp') return div(c(1), c(1, f / s.fc));
    if (s.type === 'hp') return div(c(0, f / s.fc), c(1, f / s.fc));
    const u = f / s.f0; return div(c(0, u / s.Q), c(1 - u * u, u / s.Q));
  }
  function H(secs, f) { return secs.reduce((acc, s) => mul(acc, Hsec(s, f)), c(1)); }
  // Unwrapped phase: sum of section phases (each section stays within ±180°).
  function phase(secs, f) { return secs.reduce((acc, s) => acc + arg(Hsec(s, f)), 0); }
  const gain = (secs, f) => mag(H(secs, f));
  const chain = (type, fc, n) => Array.from({ length: n }, () => ({ type, fc }));

  // ---- bench: RK4 on the section ODEs ----
  function stateSize(s) { return s.type === 'bp' ? 2 : 1; }
  function deriv(secs, st, u, out) {
    let i = 0, x = u;
    for (const s of secs) {
      if (s.type === 'bp') {
        const w0 = TAU * s.f0, q = st[i], p = st[i + 1];
        out[i] = p; out[i + 1] = x - (w0 / s.Q) * p - w0 * w0 * q;
        x = (w0 / s.Q) * p; i += 2;
      } else {
        const tau = 1 / (TAU * s.fc), v = st[i];
        out[i] = (x - v) / tau;
        x = s.type === 'lp' ? v : x - v; i += 1;
      }
    }
    return x; // output of the chain for this state and input
  }
  function slowest(secs) { return Math.max(...secs.map(s => (s.type === 'bp' ? s.Q / (Math.PI * s.f0) : 1 / (TAU * s.fc)))); }
  function fastest(secs) { return Math.min(...secs.map(s => (s.type === 'bp' ? 1 / (TAU * s.f0 * Math.max(1, s.Q)) : 1 / (TAU * s.fc)))); }
  // Integrate input x(t) from rest; returns sampled input and output on t = k·dt, k = 0..steps.
  function simulate(secs, x, dt, steps) {
    const n = secs.reduce((a, s) => a + stateSize(s), 0);
    let st = new Float64Array(n); const k1 = new Float64Array(n), k2 = new Float64Array(n), k3 = new Float64Array(n), k4 = new Float64Array(n), tmp = new Float64Array(n);
    const xs = new Float64Array(steps + 1), ys = new Float64Array(steps + 1);
    for (let k = 0; k <= steps; k++) {
      const t = k * dt; xs[k] = x(t); ys[k] = deriv(secs, st, xs[k], k1);
      if (k === steps) break;
      for (let i = 0; i < n; i++) tmp[i] = st[i] + 0.5 * dt * k1[i]; deriv(secs, tmp, x(t + dt / 2), k2);
      for (let i = 0; i < n; i++) tmp[i] = st[i] + 0.5 * dt * k2[i]; deriv(secs, tmp, x(t + dt / 2), k3);
      for (let i = 0; i < n; i++) tmp[i] = st[i] + dt * k3[i]; deriv(secs, tmp, x(t + dt), k4);
      for (let i = 0; i < n; i++) st[i] += dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
    return { xs, ys };
  }
  // Feed a sum of sines Σ A_i sin(2π f_i t) whose frequencies are whole multiples of fBase.
  // Settle for whole base periods (≥ 40 slowest time constants), then project onto each tone
  // over `keep` base periods. Returns per-tone amplitude ratio, phase and the settled samples.
  function bench(secs, tones, fBase, { perPeriod = 0, keep = 1 } = {}) {
    const T = 1 / fBase, fmax = Math.max(...tones.map(q => q.f));
    const N = Math.max(perPeriod || 0, Math.ceil(T * fmax * 64), Math.ceil(T / (fastest(secs) / 8)), 64);
    const dt = T / N, settle = Math.ceil(40 * slowest(secs) / T) + 1;
    const x = t => tones.reduce((s, q) => s + q.A * Math.sin(TAU * q.f * t), 0);
    const { xs, ys } = simulate(secs, x, dt, (settle + keep) * N);
    const from = settle * N, win = keep * N;
    const res = tones.map(q => {
      let sc = 0, cc = 0;
      for (let k = 0; k < win; k++) { const t = (from + k) * dt; sc += ys[from + k] * Math.sin(TAU * q.f * t); cc += ys[from + k] * Math.cos(TAU * q.f * t); }
      const a = 2 * sc / win, b = 2 * cc / win; // y ≈ a·sin + b·cos = G·sin(ωt + φ)
      return { f: q.f, G: Math.hypot(a, b) / q.A, ph: Math.atan2(b, a) };
    });
    return { res, dt, N, t0: from * dt, x: Array.from(xs.subarray(from, from + win + 1)), y: Array.from(ys.subarray(from, from + win + 1)) };
  }
  // Phase as a lag in time (seconds); unwrap so a low-pass lag is positive.
  const lagOf = (ph, f) => -ph / (TAU * f);

  // ---- step 0 / 1: the RC low-pass (fc = 1 kHz) ----
  const FC0 = 1000;
  const RC0 = [{ type: 'lp', fc: FC0 }];
  const LOGF = { min: 1.7, max: 4.3, step: 0.05 };   // slider in log10(Hz): 50 Hz … 20 kHz
  const fFromLog = v => Math.pow(10, Math.round(v * 100) / 100);
  function measure(secs, f) { const b = bench(secs, [{ f, A: 1 }], f, { keep: 2 }); const r = b.res[0]; return { ...r, lag: lagOf(r.ph, f), wave: b }; }

  // ---- step 2: two tones, same filter: unequal delays change the shape ----
  function twoTone(f1, secs = RC0) {
    const tones = [{ f: f1, A: 1 }, { f: 3 * f1, A: 1 / 3 }];
    const b = bench(secs, tones, f1, { keep: 2 });
    const g1 = gain(secs, f1), g3 = gain(secs, 3 * f1), d1 = lagOf(phase(secs, f1), f1), d3 = lagOf(phase(secs, 3 * f1), 3 * f1);
    // reference: the same gains, but both tones delayed by d1 (what a pure delay would do)
    const ref = b.x.map((_, k) => { const t = b.t0 + k * b.dt - d1; return g1 * Math.sin(TAU * f1 * t) + g3 / 3 * Math.sin(TAU * 3 * f1 * t); });
    let e = 0, p = 0; for (let k = 0; k < b.y.length - 1; k++) { e += (b.y[k] - ref[k]) ** 2; p += b.y[k] ** 2; }
    return { ...b, g1, g3, d1, d3, ref, mismatch: Math.sqrt(e / p) };
  }

  // ---- step 3: clean a 200 Hz tone of 5 kHz hiss with n identical RC sections ----
  const MIX = { want: 200, hiss: 5000, Ahiss: 0.5 };
  function cleanup(fc, n) {
    const secs = chain('lp', fc, n);
    const b = bench(secs, [{ f: MIX.want, A: 1 }, { f: MIX.hiss, A: MIX.Ahiss }], MIX.want, { keep: 2 });
    const gw = b.res[0].G, gh = b.res[1].G;
    return { secs, ...b, gw, gh, sel: dB(gw) - dB(gh), slope: dB(gain(secs, 100 * fc)) - dB(gain(secs, 10 * fc)) };
  }
  // Best hiss suppression with at most `loss` dB lost at 200 Hz: the lowest allowed fc (closed form).
  function bestUnderLoss(n, loss = 1) {
    const fc = MIX.want / Math.sqrt(Math.pow(10, loss / (10 * n)) - 1);
    return { fc, hiss: -dB(gain(chain('lp', fc, n), MIX.hiss)) };
  }

  // ---- step 4: low-pass, high-pass, band-pass around 1 kHz ----
  function shapeSecs(kind, Q) { return kind === 'bp' ? [{ type: 'bp', f0: FC0, Q }] : [{ type: kind, fc: FC0 }]; }
  // −3 dB points of the band-pass found by bisection on the formula (not from the Q definition).
  function halfPower(secs, peakF) {
    const target = gain(secs, peakF) / Math.SQRT2, g = f => gain(secs, f) - target;
    const bis = (a, b) => { for (let i = 0; i < 200; i++) { const m = Math.sqrt(a * b); if ((g(a) > 0) === (g(m) > 0)) a = m; else b = m; } return Math.sqrt(a * b); };
    return { lo: bis(peakF / 1e4, peakF), hi: bis(peakF, peakF * 1e4) };
  }
  function bandpass(Q) { const secs = shapeSecs('bp', Q), hp = halfPower(secs, FC0); return { secs, ...hp, bw: hp.hi - hp.lo, Qm: FC0 / (hp.hi - hp.lo), peak: gain(secs, FC0) }; }

  // ---- step 5: design to spec ----
  const SPEC = { pass: 1000, passMin: -1, hum: 50, humMax: -20, top: 10000, topMax: -20 };
  const LOGL = { min: 1.5, max: 3, step: 0.02 };   // high-pass cutoff 31.6 Hz … 1 kHz
  const LOGH = { min: 3, max: 4.5, step: 0.02 };   // low-pass cutoff 1 kHz … 31.6 kHz
  const design = (fL, fH, n) => [...chain('hp', fL, n), ...chain('lp', fH, n)];
  function verdict(fL, fH, n) {
    const secs = design(fL, fH, n);
    const p = dB(gain(secs, SPEC.pass)), h = dB(gain(secs, SPEC.hum)), t = dB(gain(secs, SPEC.top));
    return { secs, p, h, t, okP: p >= SPEC.passMin, okH: h <= SPEC.humMax, okT: t <= SPEC.topMax, ok: p >= SPEC.passMin && h <= SPEC.humMax && t <= SPEC.topMax };
  }
  function benchDesign(fL, fH, n) {
    const secs = design(fL, fH, n);
    const b = bench(secs, [{ f: SPEC.hum, A: 1 }, { f: SPEC.pass, A: 1 }, { f: SPEC.top, A: 1 }], SPEC.hum, { keep: 1 });
    return b.res.map(r => dB(r.G));
  }
  const gridVals = L => { const out = []; for (let i = 0; L.min + i * L.step <= L.max + 1e-9; i++) out.push(fFromLog(L.min + i * L.step)); return out; };

  const api = { TAU, c, mul, div, mag, arg, dB, Hsec, H, phase, gain, chain, simulate, bench, lagOf, FC0, RC0, LOGF, fFromLog, measure,
    twoTone, MIX, cleanup, bestUnderLoss, shapeSecs, halfPower, bandpass, SPEC, LOGL, LOGH, design, verdict, benchDesign, gridVals };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FR_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
