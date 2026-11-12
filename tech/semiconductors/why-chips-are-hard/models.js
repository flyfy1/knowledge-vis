/* Why chips are hard: the models behind every chart on the page.
 * Pure functions only (no DOM, no text). Loaded by index.html as window.ChipModels and by tests/models.cjs via require().
 * Units are stated per function. Sources for each model are listed in BRIEF.md and in the page footer. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChipModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const K_B = 8.617333e-5;      // Boltzmann constant, eV/K
  const Q = 1.602177e-19;       // elementary charge, C
  const EPS0 = 8.854188e-14;    // vacuum permittivity, F/cm
  const EPS_SI = 11.7 * EPS0, EPS_OX = 3.9 * EPS0;
  const H_PLANCK = 6.62607e-34, C_LIGHT = 2.99792458e8;
  const LN10 = Math.log(10);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const vth = T => K_B * T;     // thermal voltage kT/q in volts

  /* Bisection for a monotone function on [a, b]. */
  function bisect(f, a, b, it = 100) {
    let fa = f(a);
    for (let i = 0; i < it; i++) { const m = (a + b) / 2, fm = f(m); if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; }
    return (a + b) / 2;
  }

  /* ───────── 1 · Carriers in silicon (Sze & Ng, Physics of Semiconductor Devices, 3rd ed., ch. 1) ─────────
   * Non-degenerate (Boltzmann) statistics, full ionisation of dopants, single dopant species.
   * Eg(T): Varshni form with Thurmond's (1975) silicon parameters. Nc, Nv ∝ T^1.5 from their 300 K values. */
  const carriers = {
    NC300: 2.8e19, NV300: 2.65e19,      // cm^-3 (Sze & Ng appendix values)
    ATOMS: 5.0e22,                      // silicon atoms per cm^3
    Eg: T => 1.17 - 4.73e-4 * T * T / (T + 636),
    Nc: T => carriers.NC300 * Math.pow(T / 300, 1.5),
    Nv: T => carriers.NV300 * Math.pow(T / 300, 1.5),
    ni(T) { return Math.sqrt(carriers.Nc(T) * carriers.Nv(T)) * Math.exp(-carriers.Eg(T) / (2 * K_B * T)); },
    // net doping N (cm^-3, ≥ 0) of type 'n' (donors) or 'p' (acceptors) → electron and hole densities
    densities(T, N, type) {
      const ni = carriers.ni(T), maj = N / 2 + Math.sqrt(N * N / 4 + ni * ni), min = ni * ni / maj;
      return type === 'p' ? { n: min, p: maj, ni } : { n: maj, p: min, ni };
    },
    // Fermi level measured from the intrinsic level, eV (positive = towards the conduction band)
    efMinusEi(T, N, type) { const d = carriers.densities(T, N, type); return K_B * T * Math.log(d.n / d.ni); },
    // intrinsic level measured from mid-gap, eV
    eiMinusMid: T => 0.5 * K_B * T * Math.log(carriers.Nv(T) / carriers.Nc(T)),
    // Fermi–Dirac occupation of a state at energy E (eV) for Fermi level Ef
    fermi: (E, Ef, T) => 1 / (1 + Math.exp((E - Ef) / (K_B * T))),
    // Caughey–Thomas low-field mobility at 300 K, cm^2/(V s) (parameters as tabulated in Pierret, Semiconductor Device Fundamentals)
    muN: N => 65 + 1265 / (1 + Math.pow(N / 8.5e16, 0.72)),
    muP: N => 47.7 + 447.3 / (1 + Math.pow(N / 6.3e16, 0.76)),
    // resistivity, ohm cm (mobility held at its 300 K value: a stated simplification)
    resistivity(T, N, type) { const d = carriers.densities(T, N, type); return 1 / (Q * (d.n * carriers.muN(N) + d.p * carriers.muP(N))); },
    // temperature at which ni equals the doping: above it the dopants no longer set the carrier count
    intrinsicT(N) { if (N <= 0) return null; return bisect(T => carriers.ni(T) - N, 150, 2000); },
    atomsPerDopant: N => carriers.ATOMS / N
  };

  /* ───────── 2 · The pn junction (abrupt junction, depletion approximation, Shockley ideal diode) ─────────
   * Sze & Ng ch. 2. Area A = 1e-4 cm^2 (100 µm square). Minority-carrier lifetime τ = 1 µs on both sides (illustrative). */
  const junction = {
    T: 300, AREA: 1e-4, TAU: 1e-6,
    vbi(Na, Nd, T = 300) { const ni = carriers.ni(T); return K_B * T * Math.log(Na * Nd / (ni * ni)); },
    // total depletion width (cm) at applied bias V (forward positive), and the split xp, xn
    width(Na, Nd, V, T = 300) {
      const vb = Math.max(1e-3, junction.vbi(Na, Nd, T) - V);
      const W = Math.sqrt(2 * EPS_SI * vb * (Na + Nd) / (Q * Na * Nd));
      return { W, xp: W * Nd / (Na + Nd), xn: W * Na / (Na + Nd), vb };
    },
    // peak field, V/cm
    emax(Na, Nd, V, T = 300) { const w = junction.width(Na, Nd, V, T); return Q * Nd * w.xn / EPS_SI; },
    // saturation current, A: q A ni² (Dn/(Ln Na) + Dp/(Lp Nd)), D from the Einstein relation, L = √(Dτ)
    is(Na, Nd, T = 300) {
      const ni = carriers.ni(T), vt = vth(T);
      const Dn = vt * carriers.muN(Na), Dp = vt * carriers.muP(Nd); // minority electrons on the p side, holes on the n side
      const Ln = Math.sqrt(Dn * junction.TAU), Lp = Math.sqrt(Dp * junction.TAU);
      return Q * junction.AREA * ni * ni * (Dn / (Ln * Na) + Dp / (Lp * Nd));
    },
    current(Na, Nd, V, T = 300) { return junction.is(Na, Nd, T) * (Math.exp(V / vth(T)) - 1); },
    // voltage for a tenfold change in forward current (far above Is): ln10 · kT/q
    perDecade: T => LN10 * vth(T)
  };

  /* ───────── 3 · The MOSFET as a switch: EKV interpolation (Enz, Krummenacher & Vittoz 1995) ─────────
   * Id = Ispec [ln(1 + e^{(Vg−Vt)/(2nφt)})]², Ispec = 2nβφt². Saturation, long channel, no velocity saturation.
   * Subthreshold limit: Id ∝ e^{(Vg−Vt)/(nφt)} ⇒ swing S = n φt ln10. Strong inversion: Id = β(Vg−Vt)²/(2n).
   * β = 0.01 A/V² per µm of width: chosen so that on-currents land at hundreds of µA/µm (illustrative scale). */
  const mosfet = {
    BETA: 0.01,
    id(Vg, p) { // p: {vt, n, T}; returns A per µm
      const pt = vth(p.T), x = (Vg - p.vt) / (2 * p.n * pt);
      const l = x > 40 ? x : Math.log1p(Math.exp(x));
      return 2 * p.n * mosfet.BETA * pt * pt * l * l;
    },
    swing: p => p.n * vth(p.T) * LN10 * 1000,  // mV per decade
    ion: (p, vdd) => mosfet.id(vdd, p),
    ioff: p => mosfet.id(0, p),
    ratio: (p, vdd) => mosfet.id(vdd, p) / mosfet.id(0, p),
    // lowest threshold that keeps the off-current at or below a budget (A/µm)
    vtForIoff(p, budget) { return bisect(v => mosfet.id(0, { ...p, vt: v }) - budget, -0.5, 1.5); },
    // smallest supply that reaches a required on/off ratio for a given threshold
    vddForRatio(p, r) { return bisect(v => mosfet.ratio(p, v) - r, 0.0, 3.0); }
  };

  /* ───────── 4 · Dennard scaling (Dennard et al., IEEE JSSC 1974) with subthreshold leakage ─────────
   * Generation g shrinks all lengths by κ = √2^g. Gate capacitance per device ∝ 1/κ (area 1/κ², oxide 1/κ),
   * devices per area ∝ κ². Dynamic power per area ∝ κ (C·density) · V² · f; leakage per area ∝ κ² · Ioff · V,
   * with Ioff from the section 3 model (β ∝ Cox ∝ κ at fixed W/L). Starting point (generation 0): L = 1 µm,
   * V = 5 V, Vt = 0.75 V, f = 25 MHz, n = 1.4, activity 0.1, switched capacitance 0.1 pF and W/L = 10 per device:
   * assumed round values for a mid-1980s process, used only to set the starting leakage-to-dynamic ratio. */
  const dennard = {
    G0: { L: 1000, V: 5, vt: 0.75, f: 25e6, n: 1.4, T: 300, act: 0.1, C: 1e-13, WL: 10, cox: 3.45e-7, mu: 400 },
    kappa: g => Math.pow(Math.SQRT2, g),
    // mode: 'dennard' (V, Vt ∝ 1/κ), 'fixed' (V, Vt constant), 'real' (Dennard until V hits 1 V, then V = 1 V, Vt = 0.3 V)
    state(g, mode, freqScales) {
      const G = dennard.G0, k = dennard.kappa(g);
      let V = G.V, vt = G.vt;
      if (mode === 'dennard') { V = G.V / k; vt = G.vt / k; }
      else if (mode === 'real') { V = Math.max(1.0, G.V / k); vt = Math.max(0.3, G.vt / k); }
      const f = freqScales ? G.f * k : G.f;
      const C = G.C / k, density = k * k;
      const pDyn = G.act * C * V * V * f * density;               // relative units (per unit area × const)
      const ispec = 2 * G.n * G.mu * G.cox * k * G.WL * Math.pow(vth(G.T), 2); // A; Cox ∝ κ
      const ioff = ispec * Math.exp(-vt / (G.n * vth(G.T)));          // subthreshold at Vg = 0
      const pLeak = ioff * V * density;
      return { k, L: G.L / k, V, vt, f, pDyn, pLeak, pTot: pDyn + pLeak };
    },
    // power per area relative to generation 0 (whose leakage is negligible)
    rel(g, mode, freqScales) {
      const s0 = dennard.state(0, mode, freqScales), s = dennard.state(g, mode, freqScales);
      return { ...s, dyn: s.pDyn / s0.pTot, leak: s.pLeak / s0.pTot, tot: s.pTot / s0.pTot, leakShare: s.pLeak / s.pTot };
    },
    // Measured clock frequencies (MHz) of microprocessors by year: K. Rupp, "50 Years of Microprocessor Trend Data"
    // (github.com/karlrupp/microprocessor-trend-data, CC BY 4.0; data up to 2010 by M. Horowitz, F. Labonte, O. Shacham,
    // K. Olukotun, L. Hammond and C. Batten). One row of the file with year 0 is dropped.
    FREQ: [[1971.88,1],[1972.26,1],[1974.33,2],[1979.57,5],[1982.31,6],[1985.91,16],[1986.25,16],[1988.65,40],[1989.47,25],[1990.58,33],[1992.40,66],[1992.69,60],[1992.69,101],[1993.03,198],[1993.41,67],[1993.41,40],[1994.71,151],[1994.71,297],[1995.43,297],[1995.72,91],[1996.11,198],[1996.35,198],[1996.44,91],[1996.83,509],[1997.36,253],[1997.45,538],[1997.55,233],[1997.64,297],[1998.85,496],[1999.13,297],[1999.18,400],[1999.47,457],[1999.47,509],[2000.19,743],[2000.67,1000],[2001.11,898],[2001.20,2017],[2001.68,806],[2001.78,1420],[2002.40,2247],[2002.79,1811],[2002.88,1000],[2003.41,1176],[2003.51,2187],[2003.61,1811],[2004.81,2642],[2004.81,1911],[2004.86,3652],[2005.72,3191],[2005.87,2788],[2005.96,1208],[2006.01,2247],[2006.88,3652],[2006.88,2642],[2007.02,2714],[2007.07,2308],[2007.64,2943],[2007.74,4656],[2007.74,4068],[2007.84,2017],[2007.98,1420],[2008.17,2017],[2008.17,2308],[2008.46,3023],[2009.18,2503],[2009.28,3278],[2009.42,2642],[2009.66,2642],[2009.71,3278],[2010.19,2308],[2011.16,3470],[2011.32,2400],[2011.90,3000],[2012.40,3100],[2012.41,2900],[2012.70,3700],[2012.90,2500],[2013.40,1200],[2013.80,2700],[2014.16,2800],[2014.50,3700],[2014.80,3200],[2014.81,2600],[2014.82,2300],[2016.33,2200],[2016.50,1500],[2016.67,4000],[2017.50,2200],[2017.58,2100],[2017.59,2500],[2018.40,3400],[2018.50,1200],[2019.30,2700],[2019.80,2250],[2020.10,2900],[2020.20,2700],[2020.90,3200],[2021.30,2300],[2021.80,3200],[2021.90,1000],[2021.90,2600]],
    freqMax(y0, y1) { let m = 0; for (const [y, f] of dennard.FREQ) if (y >= y0 && y < y1) m = Math.max(m, f); return m; }
  };

  /* ───────── 5 · Optical lithography: Abbe imaging of a line/space grating ─────────
   * Scalar, thin binary mask, 50 % duty. Partially coherent illumination summed point by point (Abbe's method) over a
   * one-dimensional source: 'on' = conventional, source points spread over σ ∈ [−0.6, 0.6]; 'dipole' = two poles over
   * |σ| ∈ [0.7, 0.95]. Source point σ illuminates at s_i = σ·NA. Directions are in units of sin θ in image space, so
   * NA > 1 means immersion. Diffraction order m leaves at s_i + mλ/P and is collected when |s| ≤ NA (Mack, Fundamental
   * Principles of Optical Lithography, ch. 2). Intensity is normalised to an open (all-clear) mask = 1.
   * The source shapes are illustrative (real tools use 2-D pupils tuned per layer). */
  const TOOLS = {
    krf: { lam: 248, na: 0.93, spec: 80, model: 'XT:1060K' },
    arf: { lam: 193, na: 0.93, spec: null, model: '' },
    arfi: { lam: 193, na: 1.35, spec: 38, model: 'NXT:2150i' },
    euv: { lam: 13.5, na: 0.33, spec: 13, model: 'NXE:3800E' },
    hna: { lam: 13.5, na: 0.55, spec: 8, model: 'EXE:5200B' }
  };
  const litho = {
    TOOLS, CMIN: 0.3, // contrast below which the page treats a pattern as not printable (assumed rule of thumb)
    coeff(m) { return m === 0 ? 0.5 : Math.sin(Math.PI * m / 2) / (Math.PI * m); },
    orders(lam, na, pitch, si) { const out = []; for (let m = -12; m <= 12; m++) { const s = si + m * lam / pitch; if (Math.abs(s) <= na + 1e-12) out.push(m); } return out; },
    source(mode) {
      const pts = [];
      if (mode === 'dipole') { for (let i = 0; i < 20; i++) { const s = 0.7 + 0.25 * (i + 0.5) / 20; pts.push(s, -s); } }
      else for (let i = 0; i < 40; i++) pts.push(-0.6 + 1.2 * (i + 0.5) / 40);
      return pts;
    },
    intensity(x, lam, na, pitch, mode) {
      const one = si => { let re = 0, im = 0; for (const m of litho.orders(lam, na, pitch, si)) { const a = litho.coeff(m), ph = 2 * Math.PI * m * x / pitch; re += a * Math.cos(ph); im += a * Math.sin(ph); } return re * re + im * im; };
      const src = litho.source(mode); let s = 0;
      for (const sig of src) s += one(sig * na);
      return s / src.length;
    },
    // pitch below which the image contrast drops under CMIN (bisection on a monotone stretch)
    printLimit(lam, na, mode) {
      const lo = lam / (2 * na) * 0.8, hi = lam / na * 2;
      return bisect(p => litho.contrast(lam, na, p, mode) - litho.CMIN, lo, hi, 60);
    },
    image(lam, na, pitch, mode, n = 200) { const pts = []; for (let i = 0; i <= n; i++) { const x = pitch * (i / n - 0.5); pts.push([x, litho.intensity(x, lam, na, pitch, mode)]); } return pts; },
    contrast(lam, na, pitch, mode) {
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i <= 400; i++) { const v = litho.intensity(pitch * i / 400, lam, na, pitch, mode); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      return hi + lo > 0 ? (hi - lo) / (hi + lo) : 0;
    },
    printable(lam, na, pitch, mode) { return litho.contrast(lam, na, pitch, mode) >= litho.CMIN; },
    k1: (hp, lam, na) => hp * na / lam,                // Rayleigh: hp = k1 λ / NA
    minPitch: (lam, na) => lam / (2 * na), // absolute floor: two beams at the pupil edge (k1 = 0.25)
    // with a pattern split into `split` exposures, each exposure carries every split-th line: pitch × split
    exposurePitch: (pitch, split) => pitch * split,
    dofRatio: (na1, na2) => Math.pow(na1 / na2, 2)     // DOF ∝ λ/NA²: ratio at the same λ
  };

  /* ───────── 6 · The EUV light budget ─────────
   * Light that leaves the source passes `mirrors` multilayer reflections (and the reflective mask) at reflectivity R.
   * Photon counting: E = hc/λ; photons landing on a square one half-pitch on a side at dose D. Exposure-time floor:
   * the time to deliver dose D over a whole 300 mm wafer with only the mirror losses counted. */
  const euv = {
    WAFER_CM2: Math.PI * 15 * 15,
    photonJ: lamNm => H_PLANCK * C_LIGHT / (lamNm * 1e-9),
    photonEV: lamNm => euv.photonJ(lamNm) / Q,
    transmission: (R, mirrors) => Math.pow(R, mirrors),
    // photons per square of side `nm` at dose mJ/cm²
    photons(doseMJ, nm, lamNm) { const area = Math.pow(nm * 1e-7, 2); return doseMJ * 1e-3 * area / euv.photonJ(lamNm); },
    shotNoise(doseMJ, nm, lamNm) { return 1 / Math.sqrt(euv.photons(doseMJ, nm, lamNm)); },
    // seconds of light per wafer and the resulting upper bound on wafers per hour (mirror losses only)
    secondsPerWafer(P, R, mirrors, doseMJ) { return doseMJ * 1e-3 * euv.WAFER_CM2 / (P * euv.transmission(R, mirrors)); },
    wphBound(P, R, mirrors, doseMJ) { return 3600 / euv.secondsPerWafer(P, R, mirrors, doseMJ); }
  };

  /* ───────── 7 · What a node name measures: NAND2 cell density ─────────
   * A two-input NAND cell is 3 contacted gate pitches wide (two gates plus one shared diffusion break) and one cell
   * height tall; cell height = tracks × minimum metal pitch. Density = 4 transistors × tiers / cell area.
   * Check: Intel 10 nm (CPP 54, height 272 nm) gives 90.7 MTr/mm²; Intel's published NAND2 figure is 90.78. */
  const NODES = {
    intel14: { cpp: 70, mmp: 52, tracks: 399 / 52, tiers: 1, name: 14, width: 4, src: 'measured' },
    intel10: { cpp: 54, mmp: 36, tracks: 272 / 36, tiers: 1, name: 10, width: 3, src: 'measured' },
    g48m24: { cpp: 48, mmp: 24, tracks: 6, tiers: 1, name: 3, width: 3, src: 'roadmap' },
    g45m20: { cpp: 45, mmp: 20, tracks: 6, tiers: 1, name: 2.1, width: 3, src: 'roadmap' },
    g42m16: { cpp: 42, mmp: 16, tracks: 5, tiers: 1, name: 1.5, width: 3, src: 'roadmap' },
    g40m16t2: { cpp: 40, mmp: 16, tracks: 5, tiers: 2, name: 1.0, width: 3, src: 'roadmap' }
  };
  const cells = {
    NODES,
    area: p => (p.width || 3) * p.cpp * p.tracks * p.mmp,                 // nm²
    density: p => 4 * (p.tiers || 1) / cells.area(p) * 1e6,                  // transistors per µm² = MTr/mm²
    perTransistorNm2: p => cells.area(p) / (4 * (p.tiers || 1)),
    // a square the size of the area each transistor gets: side length, nm
    sideNm: p => Math.sqrt(cells.perTransistorNm2(p))
  };

  /* ───────── 8 · Electrostatic control: natural length and short-channel effects ─────────
   * Natural length λ = √(ε_si t_si t_ox / (N ε_ox)) with N the effective number of gates (Colinge, Solid-State
   * Electronics 48, 2004; N = 1 single gate, 3 tri-gate fin, 4 gate-all-around). For planar bulk, t_si is the depletion
   * depth. Short-channel factor θ = e^{−L/2λ} + 2e^{−L/λ} (Liu et al., IEEE TED 40, 1993, the form used in BSIM):
   * DIBL = θ (V/V), swing S = S_long / (1 − 2θ). S_long uses n = 1 for fully depleted multigate bodies, 1.3 for bulk. */
  const SHAPES = {
    planar: { N: 1, nLong: 1.3 },
    finfet: { N: 3, nLong: 1.0 },
    gaa: { N: 4, nLong: 1.0 }
  };
  const electro = {
    SHAPES,
    lambda(tsi, tox, N) { return Math.sqrt(11.7 * tsi * tox / (N * 3.9)); }, // nm
    theta(L, lam) { return Math.exp(-L / (2 * lam)) + 2 * Math.exp(-L / lam); },
    device(shape, L, tsi, tox, T = 300) {
      const s = SHAPES[shape], lam = electro.lambda(tsi, tox, s.N), th = electro.theta(L, lam);
      const sLong = s.nLong * vth(T) * LN10 * 1000;
      const ok = 1 - 2 * th > 0.02;
      return { lam, ratio: L / lam, theta: th, dibl: th * 1000, swing: ok ? sLong / (1 - 2 * th) : Infinity, sLong, ok };
    },
    // off-current at Vg = 0 relative to the same device with a very long channel, using the section-3 model:
    // threshold lowered by DIBL × Vdd, swing degraded to S. Vt (long) and Vdd as given.
    leakFactor(dev, vt, vdd) {
      if (!dev.ok) return Infinity;
      const sl = dev.sLong / 1000, s = dev.swing / 1000;
      return Math.pow(10, -(vt - dev.theta * vdd) / s) / Math.pow(10, -vt / sl);
    }
  };

  /* ───────── 9 · Wires: resistance with size effects, and RC delay ─────────
   * ρ(w) = ρ0 [ MS(α) + (3/8) C (1 − p) (1 + AR)/AR · λ/w ]  (Mayadas–Shatzkes grain-boundary term with grain size = w,
   * Fuchs–Sondheimer surface term in the approximation used by Steinhögl et al., J. Appl. Phys. 97, 023706, 2005).
   * Parameters R = 0.4 (grain reflection), p = 0 (diffuse surfaces), C = 1.2: typical literature values, not fitted here.
   * Line width = pitch/2, aspect ratio 2. Cu needs a diffusion barrier/liner on sides and bottom (the reader sets its thickness, default 2 nm; Moon et al.
   * 2023 give 3–4 nm as the practical minimum for Ta/TaN); Ru is assumed barrier-free. Capacitance 0.2 fF/µm (Ho, Mai & Horowitz 2001).
   * Distributed RC delay 0.38 r c L² (Bakoglu). */
  const METALS = {
    cu: { rho0: 1.68, mfp: 39.9, barrier: 2 },   // µΩ·cm, nm, nm
    ru: { rho0: 7.1, mfp: 6.6, barrier: 0 }
  };
  const wires = {
    METALS, R: 0.4, P: 0, C: 1.2, AR: 2, CAP: 0.2e-15, // F/µm
    ms(alpha) { return 1 / (1 - 1.5 * alpha + 3 * alpha * alpha - 3 * Math.pow(alpha, 3) * Math.log(1 + 1 / alpha)); },
    rho(metal, w) { // w: conductor width in nm → µΩ·cm
      const m = METALS[metal], a = (m.mfp / w) * wires.R / (1 - wires.R);
      return m.rho0 * (wires.ms(a) + 0.375 * wires.C * (1 - wires.P) * (1 + wires.AR) / wires.AR * m.mfp / w);
    },
    // barrier: thickness (nm) of the copper barrier/liner on sides and bottom; ruthenium is taken as barrier-free
    bar: (metal, barrier) => metal === 'cu' ? (barrier == null ? METALS.cu.barrier : barrier) : 0,
    geom(metal, pitch, barrier) { const b = wires.bar(metal, barrier), w = pitch / 2, h = wires.AR * w; return { w, h, wc: w - 2 * b, hc: h - b }; },
    // resistance per µm of length, Ω/µm
    rPerUm(metal, pitch, barrier) {
      const g = wires.geom(metal, pitch, barrier); if (g.wc <= 0.5 || g.hc <= 0.5) return Infinity;
      const rho = wires.rho(metal, g.wc) * 1e-8; // Ω·m
      return rho * 1e-6 / (g.wc * 1e-9 * g.hc * 1e-9);
    },
    conductorShare(metal, pitch, barrier) { const g = wires.geom(metal, pitch, barrier); return Math.max(0, g.wc * g.hc) / (g.w * g.h); },
    delayPs(metal, pitch, lenUm, barrier) { return 0.38 * wires.rPerUm(metal, pitch, barrier) * wires.CAP * lenUm * lenUm * 1e12; },
    // pitch below which ruthenium has lower resistance than copper (for a given copper barrier)
    crossover(barrier) { return bisect(p => wires.rPerUm('cu', p, barrier) - wires.rPerUm('ru', p, barrier), 8, 300); }
  };

  /* ───────── 10 · Dies per wafer, yield and cost ─────────
   * Gross dies (square dies, 300 mm wafer, no edge exclusion): πr²/A − π d/√(2A) (de Vries, IEEE TSM 18, 2005).
   * Poisson yield e^{−AD}; Murphy yield ((1 − e^{−AD})/(AD))² (Murphy, Proc. IEEE 1964). Defects per die area A (cm²).
   * Wafer prices: CSET 2020 model estimates (Khan & Mann, Table 9). Chiplets: a design of area A split into k dies,
   * each (A/k)(1 + overhead) for the die-to-die interfaces, tested before assembly; each bond succeeds with
   * probability `bond`. Overhead 10 % and bond yield 99 % are assumptions, not sourced figures. */
  const WAFER_PRICE = { n28: 2891, n16: 3984, n7: 9346, n5: 16988 };
  const fab = {
    D_MM: 300, WAFER_PRICE, RETICLE: 26 * 33, OVERHEAD: 0.10, BOND: 0.99,
    gross(areaMm2) { const d = fab.D_MM, A = areaMm2; return Math.max(0, Math.PI * d * d / 4 / A - Math.PI * d / Math.sqrt(2 * A)); },
    poisson: (areaMm2, d0) => Math.exp(-areaMm2 / 100 * d0),
    murphy(areaMm2, d0) { const x = areaMm2 / 100 * d0; return x < 1e-9 ? 1 : Math.pow((1 - Math.exp(-x)) / x, 2); },
    yieldOf(model, a, d0) { return model === 'murphy' ? fab.murphy(a, d0) : fab.poisson(a, d0); },
    good(areaMm2, d0, model) { return fab.gross(areaMm2) * fab.yieldOf(model, areaMm2, d0); },
    costPerGood(areaMm2, d0, model, waferUSD) { const g = fab.good(areaMm2, d0, model); return g > 0 ? waferUSD / g : Infinity; },
    // cost of one working system made of k chiplets
    system(areaMm2, d0, model, waferUSD, k) {
      if (k <= 1) return { k: 1, piece: areaMm2, cost: fab.costPerGood(areaMm2, d0, model, waferUSD), y: fab.yieldOf(model, areaMm2, d0), asm: 1 };
      const piece = areaMm2 / k * (1 + fab.OVERHEAD), each = fab.costPerGood(piece, d0, model, waferUSD), asm = Math.pow(fab.BOND, k);
      return { k, piece, cost: k * each / asm, y: fab.yieldOf(model, piece, d0), asm };
    },
    // die placement on the wafer: square dies on a grid, kept if all four corners lie inside the wafer
    layout(areaMm2) {
      const s = Math.sqrt(areaMm2), r = fab.D_MM / 2, n = Math.ceil(r / s) + 1, out = [];
      for (let i = -n; i < n; i++) for (let j = -n; j < n; j++) {
        const x0 = i * s, y0 = j * s, x1 = x0 + s, y1 = y0 + s;
        if ([[x0, y0], [x1, y0], [x0, y1], [x1, y1]].every(([x, y]) => x * x + y * y <= r * r)) out.push({ x: x0, y: y0, s });
      }
      return out;
    },
    // scatter defects uniformly over the wafer (Poisson count with mean D0 × wafer area) and mark the dies they hit
    scatter(dies, d0, seed) {
      const rnd = rng(seed), r = fab.D_MM / 2, mean = d0 * Math.PI * r * r / 100;
      // Poisson draw by inversion in chunks (mean can be in the hundreds)
      let count = 0, left = mean;
      while (left > 0) { const m = Math.min(left, 30); let L = Math.exp(-m), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); count += k - 1; left -= m; }
      const pts = [];
      while (pts.length < count) { const x = (rnd() * 2 - 1) * r, y = (rnd() * 2 - 1) * r; if (x * x + y * y <= r * r) pts.push([x, y]); }
      const dead = dies.map(d => pts.some(([x, y]) => x >= d.x && x < d.x + d.s && y >= d.y && y < d.y + d.s));
      return { pts, dead };
    }
  };

  /* Seeded RNG (mulberry32) for the wafer map. */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ───────── 11 · The frontier: dated facts (sentences live in copy.*.js under fr.<id>) ─────────
   * kind: 'phys' established physics or arithmetic, 'prod' in volume production / shipping, 'demo' demonstrated,
   * 'claim' a company's stated plan or performance claim. asOf: when the source said it. Sources and the date each was
   * opened are listed in BRIEF.md under "Facts that will go stale". */
  const FRONTIER = [
    { id: 'n2', kind: 'prod', asOf: '2026-04', src: 'TSMC 2nm page; SemiEngineering 2026-04-27', url: 'https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_2nm' },
    { id: 'i18a', kind: 'prod', asOf: '2026-01', src: 'Intel newsroom 2025-10-09; The Register 2026-01-05', url: 'https://www.intel.com/content/www/us/en/newsroom/news/client-computing/intel-unveils-panther-lake-architecture-first-ai-pc-platform-built-on-18a.html' },
    { id: 'sf3', kind: 'prod', asOf: '2022-06', src: 'Samsung newsroom 2022-06-30', url: 'https://news.samsung.com/global/samsung-begins-chip-production-using-3nm-process-technology-with-gaa-architecture' },
    { id: 'sf2', kind: 'prod', asOf: '2026-01', src: 'Samsung Exynos 2600 product page', url: 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2600/' },
    { id: 'hna', kind: 'demo', asOf: '2025-12', src: 'ASML annual report 2025; IRDS 2025 Lithography', url: 'https://www.asml.com/en/products/euv-lithography-systems/twinscan-exe-5200b' },
    { id: 'hnaprod', kind: 'claim', asOf: '2025', src: 'IRDS 2025 Lithography, executive summary', url: 'https://irds.ieee.org/images/files/pdf/2025/2025IRDS_LITHO.pdf' },
    { id: 'src1kw', kind: 'demo', asOf: '2025-04', src: 'ASML annual report 2025', url: 'https://www.sec.gov/Archives/edgar/data/937966/000162828026011377/asml-2025xannualxreportx.htm' },
    { id: 'bspdn', kind: 'prod', asOf: '2026-01', src: 'Intel newsroom 2025-10-09', url: 'https://www.intel.com/content/www/us/en/newsroom/news/client-computing/intel-unveils-panther-lake-architecture-first-ai-pc-platform-built-on-18a.html' },
    { id: 'a16', kind: 'claim', asOf: '2026-04', src: 'SemiEngineering 2026-04-27 (TSMC symposium)', url: 'https://semiengineering.com/tsmc-tech-symposium-2026-by-the-numbers/' },
    { id: 'a14', kind: 'claim', asOf: '2025-04', src: 'TSMC press release 2025-04-23', url: 'https://pr.tsmc.com/english/news/3228' },
    { id: 'a13', kind: 'claim', asOf: '2026-04', src: 'TSMC press release 2026-04-23', url: 'https://pr.tsmc.com/english/news/3302' },
    { id: 'cfet', kind: 'demo', asOf: '2024-12', src: 'eeNews Europe 2024-10-11 (IEDM 2024 paper 2.5); IEEE Spectrum 2024-12-12', url: 'https://www.eenewseurope.com/en/iedm-cfets-make-progress-at-5nm-and-7angstrom/' },
    { id: 'cowos', kind: 'prod', asOf: '2026-04', src: 'TSMC press release 2026-04-23; SemiEngineering 2026-04-27', url: 'https://pr.tsmc.com/english/news/3302' },
    { id: 'blackwell', kind: 'prod', asOf: '2024-03', src: 'NVIDIA newsroom 2024-03-18', url: 'https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing' },
    { id: 'ru', kind: 'demo', asOf: '2025-06', src: 'imec press release 2025-06-03', url: 'https://www.imec-int.com/en/press/imec-demonstrates-16nm-pitch-ru-lines-record-low-resistance-obtained-using-semi-damascene' },
    { id: 'smic', kind: 'prod', asOf: '2025-12', src: 'TechInsights (Kirin 9030 analysis), Tom’s Hardware report', url: 'https://www.techinsights.com/blog/smic-n3-confirmed-kirin-9030-analysis-reveals-how-close-smic-5nm' },
    { id: 'rapidus', kind: 'claim', asOf: '2025-07', src: 'The Register 2025-07-18', url: 'https://www.theregister.com/on-prem/2025/07/18/japans-rapidus-says-2nm-chip-tech-on-track-for-2027/1407362' }
  ];

  return { K_B, Q, LN10, vth, clamp, bisect, rng, carriers, junction, mosfet, dennard, litho, euv, cells, electro, wires, fab, FRONTIER };
}));
