'use strict';
// Sound-waves lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, marker and readout on the page is computed here; tests/core.cjs pins the claims.
// Model: one-dimensional, lossless, linear sound wave in a uniform medium with constant speed.
(function (root) {
  const P0 = 20e-6;          // reference sound pressure for decibels, Pa (threshold of hearing at 1 kHz)
  const RHO_AIR = 1.204;     // density of air at 20 °C, kg/m³
  const SLOW = 400;          // step 0 animation: one screen second shows 1/400 s of real time
  const DRAW_AMP = 0.1;      // step 0: drawn displacement amplitude, as a fraction of the wavelength
  const ECHO_GAP = 0.1;      // typical shortest gap (s) at which an echo is heard as a separate sound

  // Speed of sound in dry air: common linear fit, good to a few tenths of a percent between −20 and 40 °C.
  const vAir = Tc => 331.3 + 0.606 * Tc;
  const MEDIA = [
    { id: 'air', v: vAir(20) },  // air at 20 °C
    { id: 'water', v: 1480 },    // fresh water near 20 °C
    { id: 'steel', v: 5900 }     // longitudinal wave in bulk steel (typical value)
  ];

  const wavelength = (v, f) => v / f;
  const period = f => 1 / f;

  // Longitudinal displacement of the air parcel whose rest position is x: s(x, t) = A sin(kx − ωt).
  function displacement(x, t, f, v, A) { const k = 2 * Math.PI * f / v, w = 2 * Math.PI * f; return A * Math.sin(k * x - w * t); }
  // Excess pressure is proportional to −∂s/∂x = −Ak cos(kx − ωt); returned normalised to [−1, 1].
  function pressure(x, t, f, v) { const k = 2 * Math.PI * f / v, w = 2 * Math.PI * f; return -Math.cos(k * x - w * t); }
  // Centres of the compressions (pressure maxima) inside [x0, x1] at time t: x = λ(m + ½) + v t.
  function compressions(t, f, v, x0, x1) {
    const lam = v / f, out = [], shift = v * t;
    const mMin = Math.ceil((x0 - shift) / lam - 0.5), mMax = Math.floor((x1 - shift) / lam - 0.5);
    for (let m = mMin; m <= mMax; m++) out.push(lam * (m + 0.5) + shift);
    return out;
  }
  // Step 2: pressure pattern with one compression at xs when t = 0; that compression is at xs + v·t later.
  function pressureFrom(x, t, f, v, xs) { return Math.cos(2 * Math.PI * f * ((x - xs) / v - t)); }
  // Real displacement amplitude for a plane wave of level L dB: s = p_peak / (ρ v ω).
  function realDisplacement(L, f, v = vAir(20), rho = RHO_AIR) { return Math.SQRT2 * prms(L) / (rho * v * 2 * Math.PI * f); }

  // Step 1: a microphone at one place records p(t) = sin(2πft).
  const micPressure = (t, f) => Math.sin(2 * Math.PI * f * t);
  const crestTimes = (f, tMax) => { const out = []; for (let m = 0; (m + 0.25) / f <= tMax + 1e-12; m++) out.push((m + 0.25) / f); return out; };
  // Nearest equal-tempered note (A4 = 440 Hz) and how far off it is in cents (1/100 of a semitone).
  const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  function nearestNote(f) {
    const n = Math.round(12 * Math.log2(f / 440)), midi = 69 + n, fn = 440 * Math.pow(2, n / 12);
    return { name: NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1), f: fn, cents: 1200 * Math.log2(f / fn) };
  }

  // Step 3: loudness. Sound pressure level of an RMS pressure p: L = 20 log10(p / p0).
  const prms = L => P0 * Math.pow(10, L / 20);
  const levelOf = p => 20 * Math.log10(p / P0);
  // Point source in open air with no reflections: p ∝ 1/r, so L(r) = L(1 m) − 20 log10(r / 1 m).
  const levelAt = (L1, r) => L1 - 20 * Math.log10(r);

  // Step 4: timbre. Harmonic n has frequency n·f0 and amplitude a[n−1].
  function harmonicWave(a, f0, t) { let s = 0; for (let n = 1; n <= a.length; n++) s += a[n - 1] * Math.sin(2 * Math.PI * n * f0 * t); return s; }
  const gcd = (p, q) => (q ? gcd(q, p % q) : p);
  // The waveform repeats every 1 / (f0 · g), where g is the gcd of the harmonic numbers that are present.
  function repeatPeriod(a, f0) {
    let g = 0; a.forEach((v, i) => { if (Math.abs(v) > 1e-9) g = gcd(g, i + 1); });
    return g ? 1 / (f0 * g) : Infinity;
  }
  function peakOf(a, f0) { let m = 0; for (let i = 0; i < 2000; i++) m = Math.max(m, Math.abs(harmonicWave(a, f0, i / 2000 / f0))); return m; }
  const PRESETS = {
    pure: [1, 0, 0, 0, 0, 0],
    odd: [1, 0, 1 / 3, 0, 1 / 5, 0],               // odd harmonics 1/n: tends to a square wave
    all: [1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6],    // all harmonics 1/n: tends to a sawtooth
    bright: [0.5, 1, 0.8, 0.6, 0.4, 0.3]            // strong upper harmonics (made-up recipe)
  };

  // Step 5: echo. The clap travels to the wall and back: Δt = 2d / v.
  const echoDelay = (d, Tc) => 2 * d / vAir(Tc);
  const distanceFromDelay = (dt, Tc) => vAir(Tc) * dt / 2;
  const minEchoDistance = Tc => distanceFromDelay(ECHO_GAP, Tc);
  // Distance of the clap's front from the person at time t (out, reflect, back).
  function pulseDistance(t, d, Tc) { const v = vAir(Tc), tw = d / v; if (t <= 0) return 0; if (t <= tw) return v * t; if (t <= 2 * tw) return 2 * d - v * t; return 0; }
  const QUIZ = { Tc: 15, dt: 0.6 };

  const API = { P0, RHO_AIR, SLOW, DRAW_AMP, ECHO_GAP, vAir, MEDIA, wavelength, period, displacement, pressure, compressions, pressureFrom, realDisplacement,
    micPressure, crestTimes, nearestNote, prms, levelOf, levelAt, harmonicWave, repeatPeriod, peakOf, PRESETS, gcd,
    echoDelay, distanceFromDelay, minEchoDistance, pulseDistance, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.SOUND_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
