'use strict';
// Sound from vibration — lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Every moving picture, curve and readout on the page is computed here; tests/core.cjs pins the claims.
// Units: millimetres, seconds, hertz. g = 9810 mm/s². Speed of sound in air: 343 m/s (air at about 20 °C).
(function (root) {
  const G = 9810;                      // mm/s²
  const DRUM = { f: 100, tau: 0.18, tauMute: 0.012, A: 0.5 };   // a low drum: 100 Hz, audible for ~0.8 s
  const SLOW_DRUM = 20;                // the drum animation runs 20× slower than real time
  const GRAINS = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];       // grain positions, as a fraction of the radius
  const SILENT = 0.01;                 // "stopped" = amplitude below 1% of the start (40 dB quieter)
  const SPEEDS = { air: 343, water: 1480, steel: 5100 };          // m/s, typical values
  const REF_A = 0.1;                   // loudness reference amplitude (mm)

  // Approximate shape of the drumhead's basic vibration: biggest in the middle, zero at the rim.
  const shape = x => Math.max(0, 1 - x * x);
  // Envelope: rings down with time constant tau; after muteAt (a hand on the drumhead) it dies within ~0.05 s.
  function env(t, muteAt = Infinity, d = DRUM) {
    if (t < 0) return 0;
    if (t <= muteAt) return Math.exp(-t / d.tau);
    return Math.exp(-muteAt / d.tau) * Math.exp(-(t - muteAt) / d.tauMute);
  }
  // Drumhead displacement (mm), velocity (mm/s) and acceleration (mm/s²) at radius fraction x.
  function membrane(t, x, A, f, muteAt = Infinity, d = DRUM) {
    if (t < 0) return { y: 0, v: 0, a: 0 };
    const w = 2 * Math.PI * f, tau = t <= muteAt ? d.tau : d.tauMute, E = A * shape(x) * env(t, muteAt, d);
    const s = Math.sin(w * t), c = Math.cos(w * t);
    return { y: E * s, v: E * (w * c - s / tau), a: E * ((1 / (tau * tau) - w * w) * s - 2 * w / tau * c) };
  }
  // A rice grain resting on the drumhead: it rides along until the head pulls down faster than gravity,
  // then flies freely under gravity, and sticks again when it lands (no bounce).
  function grain(A, f, x, T = 0.8, muteAt = Infinity, dt = 5e-6, every = 0.001) {
    let y = 0, v = 0, onHead = true, maxH = 0, next = 0;
    const ts = [], ys = [], ms = [];
    const steps = Math.round(T / dt);
    for (let i = 0; i <= steps; i++) {
      const t = i * dt, m = membrane(t, x, A, f, muteAt);
      if (onHead) {
        y = m.y; v = m.v;
        if (m.a < -G) onHead = false;
      } else {
        v -= G * dt; y += v * dt;
        if (y <= m.y) { y = m.y; v = m.v; onHead = true; }
      }
      if (y > maxH) maxH = y;
      if (t >= next - 1e-12) { ts.push(t); ys.push(y); ms.push(m.y); next += every; }
    }
    // lift = how far the grain rose above the head's own highest point (0 if it never really left)
    return { ts, ys, ms, maxH, lift: Math.max(0, maxH - A * shape(x)) };
  }
  // Smallest amplitude at radius x for which the grain leaves the head at all: peak acceleration A·shape·ω² > g.
  const jumpThreshold = (f, x = 0) => G / (Math.pow(2 * Math.PI * f, 2) * shape(x));
  // How many full vibrations up to time t; time for the vibration to fall to the SILENT level.
  const cycles = (f, t) => Math.floor(f * t + 1e-9);
  const ringTime = (d = DRUM) => d.tau * Math.log(1 / SILENT);
  const soundOn = (t, muteAt = Infinity) => env(t, muteAt) >= SILENT;

  // Loudness relative to REF_A: sound energy ∝ amplitude², decibels = 10·log10(energy ratio) = 20·log10(A/A_ref).
  const energyRatio = A => Math.pow(A / REF_A, 2);
  const dB = A => 20 * Math.log10(A / REF_A);

  // Pitch.
  const period = f => 1000 / f;                        // ms
  const wavelength = (f, v = SPEEDS.air) => v / f;     // m
  const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  function nearestNote(f) {
    const n = Math.round(12 * Math.log2(f / 440)), midi = 69 + n, ref = 440 * Math.pow(2, n / 12);
    return { name: NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1), cents: 1200 * Math.log2(f / ref), freq: ref };
  }
  // Sound wave in air: displacement of the air layer at distance x (m) at time t (s), unit amplitude.
  // Zero where the wave has not arrived yet (x > v·t).
  function airShift(x, t, f, v = SPEEDS.air) { return x > v * t ? 0 : Math.sin(2 * Math.PI * f * (t - x / v)); }

  // Bell jar (schematic): the sound that gets out is taken as proportional to the air left inside.
  const jarOut = frac => Math.max(0, Math.min(1, frac));
  const jarLevel = frac => (frac >= 0.3 ? 'clear' : frac >= 0.05 ? 'faint' : 'none');

  // Travel time (s) over d metres.
  const travel = (d, medium) => d / SPEEDS[medium];

  const api = { G, DRUM, SLOW_DRUM, GRAINS, SILENT, SPEEDS, REF_A, shape, env, membrane, grain, jumpThreshold, cycles, ringTime, soundOn, energyRatio, dB, period, wavelength, nearestNote, airShift, jarOut, jarLevel, travel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SOUND_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
