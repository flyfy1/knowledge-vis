/* Why notes sound good together: the models, as pure functions (UMD: page and node).
 * Every number the essay's prose states is computed here and pinned by tests/models.cjs.
 *
 * Standard results implemented:
 *   - ideal plucked string: harmonic n has amplitude ∝ sin(nπβ)/n² (β = pluck point / length)
 *   - repetition rate of a set of harmonics = f0 · gcd(harmonic numbers)
 *   - beats: sin(2πf t) + sin(2π(f+Δ)t) = 2 cos(πΔt) sin(2π(f+Δ/2)t), envelope repeats Δ times per second
 *   - Plomp–Levelt roughness in Sethares' parameterisation (Sethares, "Tuning, Timbre, Spectrum, Scale";
 *     dissmeasure.m: d* = 0.24, s1 = 0.0207, s2 = 18.96, b1 = 3.51, b2 = 5.75, C = 5, pair weight min(a1, a2))
 *   - free–free uniform bar (Euler–Bernoulli): mode frequencies ∝ x², cos x · cosh x = 1
 *   - Pythagorean tuning (stacked 3:2), the Pythagorean comma, the three-gap theorem
 *   - continued fractions of log2(3/2), best equal divisions of the octave
 *   - 5-limit just intonation and equal temperament compared in cents
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MusicModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LOG2 = Math.log2;
  const cents = r => 1200 * LOG2(r);
  const fromCents = c => Math.pow(2, c / 1200);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };

  /* ── pitch reference (A4 = 440 Hz, ISO 16) ── */
  const A4 = 440;
  const etFreq = semisFromA4 => A4 * Math.pow(2, semisFromA4 / 12);
  const C4 = etFreq(-9);           // 261.63 Hz
  const C3 = C4 / 2;

  /* ── ch1: the plucked string ── */
  const pluck = {
    // amplitude of harmonic n (signed), normalised so the strongest of the first `max` is 1
    raw(n, beta) { return Math.sin(n * Math.PI * beta) / (n * n); },
    amps(N, beta, dropFundamental) {
      const out = [];
      for (let n = 1; n <= N; n++) {
        let a = pluck.raw(n, beta);
        if (Math.abs(a) < 1e-9) a = 0;
        if (dropFundamental && n === 1) a = 0;
        out.push(a);
      }
      const m = Math.max(1e-12, ...out.map(Math.abs));
      return out.map(a => a / m);
    },
    // harmonic numbers that actually sound
    active(N, beta, dropFundamental) {
      return pluck.amps(N, beta, dropFundamental).map((a, i) => (Math.abs(a) > 1e-6 ? i + 1 : 0)).filter(Boolean);
    },
    // harmonics silenced by the pluck point: sin(nπβ) = 0, i.e. n·β an integer
    silenced(N, beta) {
      const out = [];
      for (let n = 1; n <= N; n++) if (Math.abs(Math.sin(n * Math.PI * beta)) < 1e-9) out.push(n);
      return out;
    },
    // the waveform repeats at f0 · gcd(active harmonic numbers)
    repeatRate(f0, active) { if (!active.length) return 0; return f0 * active.reduce(gcd); },
    wave(amps, f0, t) { let s = 0; for (let i = 0; i < amps.length; i++) if (amps[i]) s += amps[i] * Math.sin(2 * Math.PI * (i + 1) * f0 * t); return s; }
  };

  /* ── ch2: two harmonic combs ── */
  const combs = {
    // pairs (m-th partial of the upper tone, n-th of the lower) closer than maxHz; ratio r = f2/f1
    pairs(f1, r, H, maxHz) {
      const f2 = f1 * r, out = [];
      for (let m = 1; m <= H; m++) for (let n = 1; n <= H; n++) {
        const d = Math.abs(m * f2 - n * f1);
        if (d <= maxHz) out.push({ m, n, f: n * f1, beat: d });
      }
      return out.sort((a, b) => a.f - b.f);
    },
    // exact coincidences among the first H partials of each, for a ratio p/q in lowest terms:
    // upper partial q·j meets lower partial p·j, so there are floor(H / max(p, q)) of them
    sharedExact(p, q, H) { const g = gcd(p, q); p /= g; q /= g; return Math.floor(H / Math.max(p, q)); }
  };

  /* ── ch3–5: Plomp–Levelt roughness, Sethares' parameterisation ── */
  const PL = { dstar: 0.24, s1: 0.0207, s2: 18.96, b1: 3.51, b2: 5.75, C: 5 };
  const rough = {
    P: PL,
    // roughness of two pure tones (frequencies in Hz, amplitudes)
    pair(f1, f2, a1 = 1, a2 = 1) {
      const lo = Math.min(f1, f2), d = Math.abs(f2 - f1), s = PL.dstar / (PL.s1 * lo + PL.s2);
      return Math.min(a1, a2) * PL.C * (Math.exp(-PL.b1 * s * d) - Math.exp(-PL.b2 * s * d));
    },
    // where the roughness of two pure tones peaks: Δ* = x*/s with x* = ln(b2/b1)/(b2 − b1)
    xStar() { return Math.log(PL.b2 / PL.b1) / (PL.b2 - PL.b1); },
    peakDelta(f) { return rough.xStar() * (PL.s1 * f + PL.s2) / PL.dstar; },
    peakValue() { const x = rough.xStar(); return PL.C * (Math.exp(-PL.b1 * x) - Math.exp(-PL.b2 * x)); },
    // a tone's partials: [{r: frequency ratio to the fundamental, a: amplitude}]
    spectrum(kind, N, fall = 0.88, stretch = 2) {
      const out = [];
      for (let n = 1; n <= N; n++) {
        let r;
        if (kind === 'stretched') r = Math.pow(stretch, LOG2(n));
        else if (kind === 'bar') r = bar.ratio(n);
        else r = n;
        out.push({ r, a: Math.pow(fall, n - 1) });
      }
      return out;
    },
    // total roughness of two tones with the same spectrum, fundamentals f0 and f0·ratio (all pairs, as in dissmeasure)
    dissonance(spec, f0, ratio) {
      const parts = [];
      for (const p of spec) parts.push([f0 * p.r, p.a]);
      for (const p of spec) parts.push([f0 * ratio * p.r, p.a]);
      let d = 0;
      for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) d += rough.pair(parts[i][0], parts[j][0], parts[i][1], parts[j][1]);
      return d;
    },
    curve(spec, f0, c0, c1, step = 1) {
      const out = [];
      for (let c = c0; c <= c1 + 1e-9; c += step) out.push([c, rough.dissonance(spec, f0, fromCents(c))]);
      return out;
    },
    // local minima (dips) of a curve, refined by golden-section search; prominence relative to the curve's range
    dips(spec, f0, c0, c1, minProm = 0.004) {
      const cv = rough.curve(spec, f0, c0, c1, 1), ys = cv.map(q => q[1]);
      const range = Math.max(...ys) - Math.min(...ys) || 1, out = [];
      for (let i = 1; i < cv.length - 1; i++) {
        if (!(ys[i] <= ys[i - 1] && ys[i] < ys[i + 1])) continue;
        // prominence: rise to the nearest higher ground on each side, within 150 cents
        let l = ys[i], r = ys[i];
        for (let k = i - 1; k >= Math.max(0, i - 150); k--) l = Math.max(l, ys[k]);
        for (let k = i + 1; k <= Math.min(ys.length - 1, i + 150); k++) r = Math.max(r, ys[k]);
        const prom = Math.min(l, r) - ys[i];
        if (prom / range < minProm) continue;
        // refine
        let a = cv[i - 1][0], b = cv[i + 1][0];
        const g = (Math.sqrt(5) - 1) / 2, F = c => rough.dissonance(spec, f0, fromCents(c));
        for (let it = 0; it < 40; it++) { const x1 = b - g * (b - a), x2 = a + g * (b - a); if (F(x1) < F(x2)) b = x2; else a = x1; }
        const c = (a + b) / 2;
        out.push({ cents: c, ratio: fromCents(c), value: F(c), prom: prom / range });
      }
      // the unison end point counts as a dip
      if (c0 === 0) out.unshift({ cents: 0, ratio: 1, value: ys[0], prom: 1 });
      return out;
    },
    // the dip that plays the octave's role: nearest the stretched octave (or 2:1 for other spectra)
    octaveDip(dips, target) { return dips.reduce((b, d) => (!b || Math.abs(d.cents - target) < Math.abs(b.cents - target) ? d : b), null); },
    // nearest ratio p/q (p, q ≤ maxN, lowest terms) to a frequency ratio, with its distance in cents
    nearestSimple(r, maxN = 9) {
      let best = null;
      for (let q = 1; q <= maxN; q++) for (let p = q; p <= 3 * maxN; p++) {
        if (gcd(p, q) !== 1 || p > maxN * 2.4) continue;
        const d = cents(r) - cents(p / q);
        if (!best || Math.abs(d) < Math.abs(best.d)) best = { p, q, d };
      }
      return best;
    }
  };

  /* ── free–free uniform bar (Euler–Bernoulli): roots of cos x cosh x = 1 ── */
  const bar = {
    root(n) { // n-th nonzero root, bracketed near (2n+1)π/2
      const f = x => Math.cos(x) * Math.cosh(x) - 1;
      let a = (2 * n + 1) * Math.PI / 2 - 0.3, b = (2 * n + 1) * Math.PI / 2 + 0.3;
      for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
      return (a + b) / 2;
    },
    ratio(n) { const x1 = bar.root(1), xn = bar.root(n); return (xn / x1) * (xn / x1); }
  };

  /* ── ch6: stacking fifths ── */
  const fifth = LOG2(3 / 2); // in octaves
  const pyth = {
    comma() { return cents(Math.pow(1.5, 12) / Math.pow(2, 7)); },
    // notes produced by k fifths up from the start (k + 1 notes), as positions in the octave, in cents
    positions(k) { const out = []; for (let i = 0; i <= k; i++) out.push(1200 * ((i * fifth) % 1)); return out; },
    steps(k) {
      const p = pyth.positions(k).slice().sort((a, b) => a - b), out = [];
      for (let i = 0; i < p.length; i++) out.push((i + 1 < p.length ? p[i + 1] : 1200) - p[i]);
      return out;
    },
    // distinct step sizes, rounded to 0.01 cent (three-gap theorem: never more than three)
    sizes(k) { return [...new Set(pyth.steps(k).map(s => Math.round(s * 100) / 100))].sort((a, b) => b - a); },
    // after twelve fifths: how far the 13th note lands past the start
    overshoot(k) { return k === 12 ? pyth.comma() : null; },
    octavesSpanned(k) { return Math.floor(k * fifth); }
  };

  /* ── ch7: continued fractions and equal divisions ── */
  const cf = {
    terms(x, n) { const out = []; let y = x; for (let i = 0; i < n; i++) { const a = Math.floor(y + 1e-12); out.push(a); const f = y - a; if (f < 1e-12) break; y = 1 / f; } return out; },
    convergents(a) {
      const out = []; let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
      for (const t of a) { const h = t * h1 + h2, k = t * k1 + k2; out.push([h, k]); h2 = h1; h1 = h; k2 = k1; k1 = k; }
      return out;
    }
  };
  const edo = {
    // best approximation of a just ratio in N equal steps: step count and error in cents
    best(N, ratio) { const k = Math.round(N * LOG2(ratio)); return { k, cents: 1200 * k / N, err: 1200 * k / N - cents(ratio) }; },
    // N whose best fifth beats every smaller N (absolute error)
    records(ratio, maxN) {
      const out = []; let bestErr = Infinity;
      for (let N = 1; N <= maxN; N++) { const e = Math.abs(edo.best(N, ratio).err); if (e < bestErr - 1e-12) { out.push(N); bestErr = e; } }
      return out;
    },
    // beat rate of the nearly coinciding partials of an interval p/q played at f0 and f0·r: |q·f2 − p·f1|
    beat(f0, r, p, q) { return Math.abs(q * f0 * r - p * f0); }
  };

  /* ── ch8: tunings on a twelve-key keyboard ── */
  const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  const JUST = [1, 16 / 15, 9 / 8, 6 / 5, 5 / 4, 4 / 3, 45 / 32, 3 / 2, 8 / 5, 5 / 3, 9 / 5, 15 / 8];
  // Pythagorean: a chain of fifths from A♭ (−4) to C♯ (+7), folded into the octave above C
  const PYTH = (() => { const out = new Array(12); for (let i = -4; i <= 7; i++) { let r = Math.pow(1.5, i); while (r >= 2) r /= 2; while (r < 1) r *= 2; out[((i * 7) % 12 + 12) % 12] = r; } return out; })();
  const tune = {
    NAMES, JUST, PYTH,
    ratio(system, i) { // frequency ratio of key i (0..23) to the C at the bottom
      const o = Math.floor(i / 12), k = i % 12;
      const base = system === 'et' ? Math.pow(2, k / 12) : system === 'just' ? JUST[k] : PYTH[k];
      return base * Math.pow(2, o);
    },
    interval(system, root, semis) { return tune.ratio(system, root + semis) / tune.ratio(system, root); },
    triad(system, root) {
      const third = tune.interval(system, root, 4), fifthR = tune.interval(system, root, 7);
      return { third, fifth: fifthR, thirdErr: cents(third) - cents(5 / 4), fifthErr: cents(fifthR) - cents(3 / 2) };
    },
    // equal temperament against just intonation for each interval of the octave
    INTERVALS: [[1, 16, 15], [2, 9, 8], [3, 6, 5], [4, 5, 4], [5, 4, 3], [6, 45, 32], [7, 3, 2], [8, 8, 5], [9, 5, 3], [10, 9, 5], [11, 15, 8], [12, 2, 1]],
    etVsJust() { return tune.INTERVALS.map(([s, p, q]) => ({ semis: s, p, q, et: 100 * s, just: cents(p / q), err: 100 * s - cents(p / q) })); },
    // beat rates of a major triad's third and fifth: |4·f3 − 5·f1| and |2·f5 − 3·f1|
    beats(system, root, fC) {
      const f1 = fC * tune.ratio(system, root), tr = tune.triad(system, root);
      return { third: Math.abs(4 * f1 * tr.third - 5 * f1), fifth: Math.abs(2 * f1 * tr.fifth - 3 * f1), f1 };
    }
  };

  /* ── which live sentence each model shows (pure, so the node test can walk every branch) ── */
  const say = {
    ch1(act, drop, gone) {
      if (!act.length) return 'ch1.say.none';
      const g = act.reduce(gcd);
      if (g > 1) return 'ch1.say.jump';
      if (drop) return 'ch1.say.missing';
      if (act.length === 1) return 'ch1.say.pure';
      if (gone.length) return 'ch1.say.gone';
      return 'ch1.say.plain';
    },
    ch2(exactShared, detune) { return exactShared === 0 ? 'ch2.say.none' : Math.abs(detune) < 0.5 ? 'ch2.say.exact' : 'ch2.say.detuned'; },
    ch3(d, dStar, roughShare) { const x = d / dStar; return d === 0 ? 'ch3.say.zero' : x < 0.5 ? 'ch3.say.slow' : x <= 1.5 ? 'ch3.say.peak' : roughShare >= 0.15 ? 'ch3.say.fading' : 'ch3.say.smooth'; },
    // returns [key, nearest dip]
    ch4(nPartials, at, dips) {
      const nd = dips.reduce((b, d) => (!b || Math.abs(d.cents - at) < Math.abs(b.cents - at) ? d : b), null);
      if (nPartials === 1) return ['ch4.say.one', nd];
      if (nd && Math.abs(nd.cents - at) < 3) return [Math.abs(rough.nearestSimple(nd.ratio).d) < 1 ? 'ch4.say.indip' : 'ch4.say.indipraw', nd];
      return ['ch4.say.between', nd];
    },
    ch5(kind, A) { return kind === 'harmonic' || (kind === 'stretched' && Math.abs(A - 2) < 0.005) ? 'ch5.say.harmonic' : kind === 'stretched' ? 'ch5.say.stretched' : 'ch5.say.bar'; },
    ch6(k, nSizes) { const n = k + 1; return k === 12 ? 'ch6.say.comma' : nSizes === 2 ? (n === 5 ? 'ch6.say.five' : n === 7 ? 'ch6.say.seven' : n === 12 ? 'ch6.say.twelve' : 'ch6.say.two') : 'ch6.say.three'; },
    ch7(N, records) { return records.includes(N) ? 'ch7.say.record' : 'ch7.say.norecord'; },
    ch8(sys, thirdErr, fifthErr) {
      const te = Math.abs(thirdErr), fe = Math.abs(fifthErr);
      if (sys === 'et') return 'ch8.say.et';
      if (fe > 20) return 'ch8.say.' + sys + '.wolf';
      if (te < 0.05 && fe < 0.05) return 'ch8.say.' + sys + '.pure';
      if (te < 3 && fe < 3) return 'ch8.say.' + sys + '.near';
      return 'ch8.say.' + sys + '.off';
    }
  };

  return { cents, fromCents, clamp, gcd, A4, C4, C3, etFreq, pluck, combs, rough, bar, pyth, cf, edo, tune, say, FIFTH: fifth };
});
