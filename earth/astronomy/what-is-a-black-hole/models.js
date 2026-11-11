/* What is a black hole, really? The models behind every chart on the page.
 * Pure functions only (no DOM, no text). Loaded by index.html as window.BHModels and by tests/models.cjs via require().
 * Everything is a non-rotating, uncharged (Schwarzschild) black hole. Live simulations advance in whole fixed
 * steps (`advance`) fed with real elapsed time × a model speed, so results do not depend on frame rate. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BHModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── constants (sources in BRIEF.md) ───────── */
  const K = {
    G: 6.67430e-11,            // CODATA 2022, m³ kg⁻¹ s⁻²
    c: 299792458,              // exact, m/s
    hbar: 1.054571817e-34,     // CODATA 2022 (exact since 2019), J s
    kB: 1.380649e-23,          // exact since 2019, J/K
    GMsun: 1.3271244e20,       // IAU 2015 B3 nominal, m³/s²
    GMearth: 3.986004e14,      // IAU 2015 B3 nominal, m³/s²
    Rsun: 6.957e8,             // IAU 2015 B3 nominal solar radius, m
    Rearth: 6.3781e6,          // IAU 2015 B3 nominal equatorial radius, m
    AU: 149597870700,          // IAU 2012 B2, exact, m
    pc: 149597870700 * 648000 / Math.PI, // IAU 2015 B2, m
    day: 86400,
    year: 365.25 * 86400,      // Julian year, s
    g0: 9.80665,               // standard gravity, m/s²
    Tcmb: 2.7255,              // Fixsen 2009, K
    rhoWater: 1000             // kg/m³
  };
  K.Msun = K.GMsun / K.G;      // kg
  K.Mearth = K.GMearth / K.G;  // kg

  /* real objects used in the prose */
  const OBJ = {
    earth: { GM: K.GMearth, R: K.Rearth },
    sun: { GM: K.GMsun, R: K.Rsun },
    sgra: { GM: 4.297e6 * K.GMsun, D: 8277 * K.pc },   // GRAVITY 2022 via EHT 2022 paper I
    m87: { GM: 6.5e9 * K.GMsun },                        // EHT 2019 paper I
    s2: { aMas: 125.058, e: 0.884649, Pyr: 16.0455, Dpc: 8246.7 }, // GRAVITY 2020 Table 1
    gw150914: { m1: 36, m2: 29, mf: 62 },                // LIGO/Virgo 2016 (source frame, Msun)
    gpsA: 2.656175e7                                     // GPS semi-major axis, m (Ashby 2003)
  };

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  function advance(state, span, h, stepFn) {
    state._acc = (state._acc || 0) + span;
    let n = 0;
    while (state._acc >= h - 1e-12 && n < 200000) { stepFn(state, h); state._acc -= h; n++; }
    return n;
  }

  /* ───────── 1 · escape speed and the Schwarzschild radius ───────── */
  const escape = {
    vesc: (GM, R) => Math.sqrt(2 * GM / R),             // Newtonian escape speed from radius R
    rs: GM => 2 * GM / (K.c * K.c),                      // Schwarzschild radius
    // radius at which the Newtonian escape speed equals a fraction `beta` of c
    radiusFor: (GM, beta) => 2 * GM / (beta * beta * K.c * K.c)
  };

  /* ───────── 2 · size and "density" scale with mass ───────── */
  const scale = {
    rs: Msun => escape.rs(Msun * K.GMsun),
    // mass ÷ the Euclidean volume 4/3·π·r_s³: bookkeeping only, not a density anything inside has
    density: Msun => (Msun * K.Msun) / (4 / 3 * Math.PI * Math.pow(scale.rs(Msun), 3)),
    massForDensity: rho => Math.sqrt(3 * Math.pow(K.c, 6) / (32 * Math.PI * Math.pow(K.G, 3) * rho)) / K.Msun
  };

  /* ───────── 3 · the same pull at the same distance: a planet around the Sun or a black hole ─────────
   * Units: AU and Julian years. mu = GM in AU³/yr². Velocity Verlet with fixed step. */
  const orbit = {
    H: 0.0005, // yr
    mu: f => f * K.GMsun * K.year * K.year / Math.pow(K.AU, 3),
    // a planet on a circular orbit at r0 AU around one solar mass; the central mass then becomes f solar masses
    create(f, r0 = 1) {
      const v = Math.sqrt(orbit.mu(1) / r0);
      return { t: 0, x: r0, y: 0, vx: 0, vy: v, f, swept: 0, lastAng: 0, laps: 0, tLap: null };
    },
    acc(s) { const r2 = s.x * s.x + s.y * s.y, r = Math.sqrt(r2), k = -orbit.mu(s.f) / (r2 * r); return [k * s.x, k * s.y]; },
    step(s, h) {
      let [ax, ay] = orbit.acc(s);
      s.vx += 0.5 * h * ax; s.vy += 0.5 * h * ay;
      s.x += h * s.vx; s.y += h * s.vy;
      [ax, ay] = orbit.acc(s);
      s.vx += 0.5 * h * ax; s.vy += 0.5 * h * ay;
      s.t += h;
      const ang = Math.atan2(s.y, s.x);
      let d = ang - s.lastAng; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      const before = s.swept; s.swept += d; s.lastAng = ang;
      const goal = 2 * Math.PI * (s.laps + 1);
      if (s.swept >= goal) { s.laps++; if (s.laps === 1) s.tLap = s.t - h * (s.swept - goal) / (s.swept - before); } // interpolate inside the step
    },
    r: s => Math.hypot(s.x, s.y),
    // exact Kepler elements after the central mass becomes f (planet was on a circle at r0 = 1 AU)
    elements(f) {
      const mu = orbit.mu(f), r = 1, v2 = orbit.mu(1), E = v2 / 2 - mu / r;
      if (E >= -1e-12) return { bound: false, E, parabolic: Math.abs(E) < 1e-9 * mu };
      const a = -mu / (2 * E), h = Math.sqrt(v2) * r, e = Math.sqrt(Math.max(0, 1 - h * h / (mu * a)));
      return { bound: true, E, a, e, peri: a * (1 - e), apo: a * (1 + e), periodYr: 2 * Math.PI * Math.sqrt(a * a * a / mu) };
    },
    periodDays: (GM, aMeters) => 2 * Math.PI * Math.sqrt(Math.pow(aMeters, 3) / GM) / K.day,
    gAt: (GM, r) => GM / (r * r)
  };

  /* ───────── 4 · close in: Schwarzschild orbits vs Newton ─────────
   * Units: r_s = 1, c = 1, so GM = 1/2. Proper time τ of the orbiting body. Per unit mass:
   *   d²r/dτ² = −GM/r² + h²/r³ − 3GM h²/r⁴ (GR) ;  the last term is absent in Newton ;  dφ/dτ = h/r².
   * Effective potential V(r) = −GM/r + h²/(2r²) − GM h²/r³ (GR). */
  const GMU = 0.5;
  const gr = {
    H: 0.02,
    hCircNewton: r0 => Math.sqrt(GMU * r0),
    V(r, h, rel = true) { return -GMU / r + h * h / (2 * r * r) - (rel ? GMU * h * h / (r * r * r) : 0); },
    dV(r, h, rel = true) { return GMU / (r * r) - h * h / (r * r * r) + (rel ? 3 * GMU * h * h / Math.pow(r, 4) : 0); },
    create(r0, k, rel = true) {
      const h = k * gr.hCircNewton(r0);
      return { t: 0, r: r0, vr: 0, phi: 0, h, rel, inside: false, rMin: r0, rMax: r0, peris: [], lastVr: 0 };
    },
    acc(r, h, rel) { return -gr.dV(r, h, rel); },
    step(s, H) {
      if (s.inside) return;
      const f = (r, vr) => [vr, gr.acc(r, s.h, s.rel)];
      const r0 = s.r, v0 = s.vr;
      const [k1r, k1v] = f(r0, v0);
      const [k2r, k2v] = f(r0 + H / 2 * k1r, v0 + H / 2 * k1v);
      const [k3r, k3v] = f(r0 + H / 2 * k2r, v0 + H / 2 * k2v);
      const [k4r, k4v] = f(r0 + H * k3r, v0 + H * k3v);
      const r1 = r0 + H / 6 * (k1r + 2 * k2r + 2 * k3r + k4r);
      const v1 = v0 + H / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
      // φ by Simpson on h/r²
      const rm = r0 + H / 2 * k1r;
      s.phi += H / 6 * (s.h / (r0 * r0) + 4 * s.h / (rm * rm) + s.h / (r1 * r1));
      if (v0 < 0 && v1 >= 0) s.peris.push(s.phi);         // passed a pericentre
      s.r = r1; s.vr = v1; s.t += H;
      s.rMin = Math.min(s.rMin, s.r); s.rMax = Math.max(s.rMax, s.r);
      if (s.r <= 1) { s.inside = true; s.r = 1; }
    },
    // fate of a body released at r0 with ṙ = 0 and angular momentum h: 'circle' | 'bound' | 'plunge' | 'escape'
    fate(r0, k, rel = true) {
      const h = k * gr.hCircNewton(r0), E = gr.V(r0, h, rel), d = gr.dV(r0, h, rel);
      if (Math.abs(d) < 1e-9) return { kind: 'circle', other: r0 };
      const dir = d > 0 ? -1 : 1; // force −V' points inward when V' > 0
      let r = r0, step = 1e-4 * r0;
      for (let i = 0; i < 400000; i++) {
        const rn = r + dir * step;
        if (dir < 0 && rn <= (rel ? 1 : 1e-6)) return { kind: 'plunge' };
        if (dir > 0 && rn > 1e5) return { kind: 'escape' };
        if (gr.V(rn, h, rel) > E) { // turning point between r and rn: bisect
          let lo = r, hi = rn;
          for (let j = 0; j < 60; j++) { const m = (lo + hi) / 2; if (gr.V(m, h, rel) > E) hi = m; else lo = m; }
          return { kind: 'bound', other: (lo + hi) / 2 };
        }
        r = rn; step = Math.min(step * 1.002, 0.01 * r);
      }
      return { kind: 'bound', other: r };
    },
    isco: () => 6 * GMU,                    // radius where the stable circular orbits end (in r_s)
    photonSphere: () => 3 * GMU,            // circular orbit of light
    // smallest h (in r_s·c) for which V has a minimum: h² = 12 (GM)²
    hMinStable: () => Math.sqrt(12) * GMU,
    // circular orbits: both roots of V'(r) = 0 for a given h
    circular(h) {
      const disc = h * h * h * h - 12 * GMU * GMU * h * h;
      if (disc < -1e-9) return null;
      const s = Math.sqrt(Math.max(0, disc));
      return { stable: (h * h + s) / (2 * GMU), unstable: (h * h - s) / (2 * GMU) };
    },
    // advance of the pericentre per orbit (rad) for a bound orbit released at r0 with ṙ = 0, from the orbit-shape
    // (Binet) equation u'' + u = GM/h² + 3GM u² (GR; Newton drops the last term), integrated from one turning point
    // to the next: that angle is half an orbit. Returns null if the orbit is not bound.
    precession(r0, k, rel = true) {
      const f = gr.fate(r0, k, rel);
      if (f.kind === 'circle') { // small-oscillation limit: radial frequency² = 1 − 6GM u (GR), 1 (Newton)
        const w = rel ? Math.sqrt(1 - 6 * GMU / r0) : 1; return 2 * Math.PI / w - 2 * Math.PI;
      }
      if (f.kind !== 'bound') return null;
      const h = k * gr.hCircNewton(r0), A = GMU / (h * h), B = rel ? 3 * GMU : 0, d = 1e-4;
      const acc = u => -u + A + B * u * u;
      let u = 1 / r0, w = 0, phi = 0, prevW = 0;
      for (let i = 0; i < 2e6; i++) {
        const k1u = w, k1w = acc(u), k2u = w + d / 2 * k1w, k2w = acc(u + d / 2 * k1u);
        const k3u = w + d / 2 * k2w, k3w = acc(u + d / 2 * k2u), k4u = w + d * k3w, k4w = acc(u + d * k3u);
        const nu = u + d / 6 * (k1u + 2 * k2u + 2 * k3u + k4u), nw = w + d / 6 * (k1w + 2 * k2w + 2 * k3w + k4w);
        if (i > 10 && Math.sign(nw) !== Math.sign(w) && w !== 0) { phi += d * w / (w - nw); return 2 * phi - 2 * Math.PI; }
        prevW = w; u = nu; w = nw; phi += d;
      }
      return null;
    },
    // weak-field pericentre advance per orbit (rad)
    precessionPerOrbit: (GM, a, e) => 6 * Math.PI * GM / (K.c * K.c * a * (1 - e * e))
  };

  /* ───────── 5 · tides: the difference in pull across a body of length L ───────── */
  const tide = {
    L: 2,
    // radial stretch between head and feet at distance r (m/s²); the same expression holds in GR for a freely falling body
    dg: (GM, r, L = 2) => 2 * GM * L / (r * r * r),
    atHorizon: (GM, L = 2) => tide.dg(GM, escape.rs(GM), L),
    // distance where the stretch equals a given acceleration
    radiusFor: (GM, acc, L = 2) => Math.cbrt(2 * GM * L / acc),
    // mass (Msun) whose horizon stretch equals `acc`
    massFor: (acc, L = 2) => Math.pow(K.c, 3) * Math.sqrt(L / acc) / (2 * K.G) / K.Msun
  };

  /* ───────── 6 · a clock hovering at r ───────── */
  const clock = {
    rate: x => Math.sqrt(1 - 1 / x),                    // x = r / r_s; ticks per tick of a far clock
    rateAt: (GM, r) => Math.sqrt(1 - escape.rs(GM) / r),
    // acceleration needed to hover (measured locally)
    hoverAcc: (GM, r) => GM / (r * r) / clock.rateAt(GM, r),
    // seconds per day a clock at r2 gains on one at r1 (both hovering)
    gainPerDay: (GM, r1, r2) => (clock.rateAt(GM, r2) / clock.rateAt(GM, r1) - 1) * K.day,
    // special-relativistic loss per day at speed v
    speedLossPerDay: v => (1 - Math.sqrt(1 - v * v / (K.c * K.c))) * K.day
  };

  /* ───────── 7 · light paths: null geodesics u'' + u = 3GM u² (r_s = 1 ⇒ 1.5 u²) ───────── */
  const light = {
    bCrit: () => Math.sqrt(27) * GMU,       // critical impact parameter, r_s units
    // trace a ray coming in from far away with impact parameter b (r_s units)
    trace(b, opt = {}) {
      const dphi = opt.dphi || 0.002, uMax = 1, pts = [], u0 = Math.min(1e-4, 0.01 / b);
      let u = u0, w = Math.sqrt(Math.max(0, 1 / (b * b) - u * u + 2 * GMU * u * u * u)), phi = 0, umax = u;
      const acc = u => -u + 3 * GMU * u * u;
      let captured = false;
      for (let i = 0; i < 200000; i++) {
        if (opt.keep && i % (opt.keep) === 0) pts.push([phi, 1 / u]);
        const k1u = w, k1w = acc(u);
        const k2u = w + dphi / 2 * k1w, k2w = acc(u + dphi / 2 * k1u);
        const k3u = w + dphi / 2 * k2w, k3w = acc(u + dphi / 2 * k2u);
        const k4u = w + dphi * k3w, k4w = acc(u + dphi * k3u);
        const uPrev = u;
        u += dphi / 6 * (k1u + 2 * k2u + 2 * k3u + k4u);
        w += dphi / 6 * (k1w + 2 * k2w + 2 * k3w + k4w);
        phi += dphi;
        umax = Math.max(umax, u);
        if (u >= uMax) { captured = true; break; }
        if (u <= u0 && w < 0) { phi -= dphi * (u0 - u) / (uPrev - u); u = u0; break; } // back to r = 1/u0, interpolated
        if (phi > 40 * Math.PI) break; // essentially on the photon sphere
      }
      if (opt.keep) pts.push([phi, 1 / Math.max(u, u0)]);
      // the ray starts and ends at r = 1/u0, not at infinity: add the straight-line angle 2·asin(b·u0) still missing
      return { captured, closest: captured ? null : 1 / umax, deflection: captured ? null : phi + 2 * Math.asin(Math.min(1, b * u0)) - Math.PI, phiEnd: phi, pts };
    },
    // shadow angular diameter for a black hole of GM at distance D (rad)
    shadowAngle: (GM, D) => 2 * light.bCrit() * escape.rs(GM) / D,
    weakDeflection: b => 2 / b // 4GM/(c² b) = 2 r_s / b
  };

  /* ───────── 8 · the star S2: Kepler's third law weighs Sgr A* ───────── */
  const s2 = {
    aMeters: (aMas, Dpc) => aMas / 1000 * Dpc * K.AU,   // 1 arcsec at 1 pc = 1 AU
    mass: (aMas, Dpc, Pyr) => 4 * Math.PI * Math.PI * Math.pow(s2.aMeters(aMas, Dpc), 3) / (K.G * Math.pow(Pyr * K.year, 2)) / K.Msun,
    // position at time t (yr since pericentre) in the orbital plane, in units of a; plus speed (m/s)
    at(t, e, Pyr, aM, GM) {
      const Mn = 2 * Math.PI * (((t / Pyr) % 1) + 1) % (2 * Math.PI);
      let E = e > 0.8 ? Math.PI : Mn;
      for (let i = 0; i < 60; i++) E -= (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E));
      const x = Math.cos(E) - e, y = Math.sqrt(1 - e * e) * Math.sin(E), r = 1 - e * Math.cos(E);
      const v = Math.sqrt(GM * (2 / (r * aM) - 1 / aM));
      return { x, y, r, v };
    },
    periSpeed: (GM, aM, e) => Math.sqrt(GM * (1 + e) / (aM * (1 - e)))
  };

  /* ───────── 9 · two black holes spiralling in: leading-order (quadrupole) chirp ───────── */
  const chirp = {
    chirpMass: (m1, m2) => Math.pow(m1 * m2, 0.6) / Math.pow(m1 + m2, 0.2),
    tc: Mc => Mc * K.GMsun / Math.pow(K.c, 3),                           // GMc/c³ in s
    // time left before coalescence when the wave frequency is f (Hz)
    tau: (Mc, f) => 5 / 256 * Math.pow(chirp.tc(Mc), -5 / 3) * Math.pow(Math.PI * f, -8 / 3),
    // wave frequency with time τ left
    freq: (Mc, tau) => Math.pow(5 / (256 * tau), 3 / 8) * Math.pow(chirp.tc(Mc), -5 / 8) / Math.PI,
    // wave frequency (twice the orbital) at the innermost stable circular orbit of ch4, 3 r_s of the total mass
    fIsco: Mtot => Math.pow(K.c, 3) / (Math.pow(6, 1.5) * Math.PI * K.GMsun * Mtot),
    cycles: (Mc, f1, f2) => Math.pow(chirp.tc(Mc), -5 / 3) / (32 * Math.pow(Math.PI, 8 / 3)) * (Math.pow(f1, -5 / 3) - Math.pow(f2, -5 / 3)),
    // waveform samples over the last `span` seconds before the ISCO: [t, h] with h ∝ f^(2/3) cos(phase)
    wave(m1, m2, span, n = 2400) {
      const Mc = chirp.chirpMass(m1, m2), fi = chirp.fIsco(m1 + m2), tEnd = chirp.tau(Mc, fi), out = [];
      // phase(τ) = −2 (τ / (5 tc))^(5/8) (exact integral of 2π f dt for the leading-order chirp)
      const ph = tau => -2 * Math.pow(tau / (5 * chirp.tc(Mc)), 5 / 8);
      for (let i = 0; i <= n; i++) {
        const t = -span + span * i / n, tau = tEnd - t; // t = 0 at the ISCO
        const f = chirp.freq(Mc, tau);
        out.push([t, Math.pow(f / fi, 2 / 3) * Math.cos(ph(tau) - ph(tEnd)), f]);
      }
      return out;
    }
  };

  /* ───────── 10 · Hawking temperature (only its scale) ───────── */
  const hawking = {
    T: Msun => K.hbar * Math.pow(K.c, 3) / (8 * Math.PI * K.G * Msun * K.Msun * K.kB),
    massForT: T => K.hbar * Math.pow(K.c, 3) / (8 * Math.PI * K.G * K.kB * T) // kg
  };

  return { K, OBJ, clamp, advance, escape, scale, orbit, gr, tide, clock, light, s2, chirp, hawking };
}));
