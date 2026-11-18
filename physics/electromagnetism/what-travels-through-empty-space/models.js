/* What travels through empty space: the page's models.
   Every function here is a standard result at small scale; tests/models.cjs checks each against textbook values.
   - Constants: CODATA 2022 (mu0, eps0), exact SI (c, h, e, kB), IAU 2015 B3 (nominal solar luminosity, au).
   - ch2  displacement current in a charging parallel-plate capacitor (Ampere–Maxwell law, Griffiths §7.3).
   - ch3  1-D FDTD on a Yee grid (Yee 1966; Taflove & Hagness ch. 3): E and B leapfrog, speed 1/sqrt(mu0 eps0),
          Courant limit, discrete energy; first-order Mur absorbing ends (Mur 1981) or metal walls.
   - ch4  the same grid with a refractive-index step; Fresnel coefficients at normal incidence (Hecht §4.6).
   - ch5  Larmor power; thin linear dipole with sinusoidal current (Balanis ch. 4): pattern, directivity,
          radiation resistance; lifetime of the classical hydrogen atom.
   - ch6  Poynting flux, inverse-square law, radiation pressure; Malus's law for a stack of ideal polarisers.
   - ch7  lambda = c/f, E = hf; single-Debye relaxation of liquid water (Kaatze 1989 parameters at 25 °C).
   - ch8  ITU-R P.676-13 Annex 1 line-by-line gaseous attenuation (44 O2 + 35 H2O lines), horizontal and zenith.
   - ch9  AM and FM on a carrier with a discrete Fourier transform (Bessel sidebands, Carson's rule); Friis equation.
   - ch10 silica-fibre loss (Rayleigh + infrared tail), total internal reflection, numerical aperture.
   - ch11 Airy pattern and the Rayleigh criterion; uniform linear array factor.
   Sourced figures sit in SRC and FRONTIER (BRIEF.md has URL and access date). Values chosen for a model rather than
   taken from a source are marked TUNED.
   UMD: window.EmWaveModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EmWaveModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── constants ───────── */
  const C0 = 299792458;              // m/s, exact
  const MU0 = 1.25663706127e-6;      // N/A², CODATA 2022
  const EPS0 = 8.8541878188e-12;     // F/m, CODATA 2022
  const H = 6.62607015e-34;          // J s, exact
  const QE = 1.602176634e-19;        // C, exact
  const KB = 1.380649e-23;           // J/K, exact
  const ME = 9.1093837139e-31;       // kg, CODATA 2022
  const A0 = 5.29177210544e-11;      // m, Bohr radius, CODATA 2022
  const AU = 149597870700;           // m, exact (IAU 2012)
  const LSUN = 3.828e26;             // W, IAU 2015 Resolution B3 nominal solar luminosity
  const ETA0 = Math.sqrt(MU0 / EPS0);
  const cFromFields = () => 1 / Math.sqrt(MU0 * EPS0);

  /* ───────── number formatting (language-neutral digits; units come from the copy) ───────── */
  function fmt(x, d) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    const s = Math.abs(x).toFixed(d == null ? 0 : d), [i, f] = s.split('.');
    const neg = x < 0 && Number(s) !== 0;
    return (neg ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
  }
  function sig(x, n) { // n significant digits, plain notation
    if (x === 0 || !isFinite(x)) return fmt(x, 0);
    const e = Math.floor(Math.log10(Math.abs(x)) + 1e-12), d = Math.max(0, n - 1 - e);
    const p = Math.pow(10, n - 1 - e);
    return fmt(Math.round(x * p) / p, d);
  }
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const supStr = k => String(k).split('').map(ch => SUP[ch]).join('');
  function sci(x, d) { // 1.19 × 10⁻⁷
    if (x === 0 || !isFinite(x)) return fmt(x, 0);
    let e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
    if (Number(Math.abs(m).toFixed(d == null ? 2 : d)) >= 10) { m /= 10; e += 1; }
    return (m < 0 ? '−' : '') + Math.abs(m).toFixed(d == null ? 2 : d) + ' × 10' + supStr(e);
  }
  // a quantity with an SI-style unit chosen by size: {v, u}; the page turns u into a word through the copy (u.<u>)
  function pick(x, table) { const a = Math.abs(x); for (const [u, k] of table) if (a >= k * 0.99995) return { v: x / k, u }; const [u, k] = table[table.length - 1]; return { v: x / k, u }; }
  const siLen = m => pick(m, [['ly', 9.4607304725808e15], ['au', AU], ['km', 1e3], ['m', 1], ['cm', 1e-2], ['mm', 1e-3], ['um', 1e-6], ['nm', 1e-9], ['pm', 1e-12], ['fm', 1e-15]]);
  const siFreq = hz => pick(hz, [['EHz', 1e18], ['PHz', 1e15], ['THz', 1e12], ['GHz', 1e9], ['MHz', 1e6], ['kHz', 1e3], ['Hz', 1]]);
  const siPow = w => pick(w, [['GW', 1e9], ['MW', 1e6], ['kW', 1e3], ['W', 1], ['mW', 1e-3], ['uW', 1e-6], ['nW', 1e-9], ['pW', 1e-12], ['fW', 1e-15], ['aW', 1e-18], ['zW', 1e-21]]);
  const siAngle = rad => pick(rad * 180 / Math.PI, [['deg', 1], ['arcmin', 1 / 60], ['arcsec', 1 / 3600], ['mas', 1 / 3.6e6], ['uas', 1 / 3.6e9]]);
  const siRate = bps => pick(bps, [['Gbps', 1e9], ['Mbps', 1e6], ['kbps', 1e3], ['bps', 1]]);
  const SYM = { um: 'µm', uW: 'µW', deg: '°', arcmin: '′', arcsec: '″', uas: 'µas', Gbps: 'Gb/s', Mbps: 'Mb/s', kbps: 'kb/s', bps: 'b/s' };
  // "12.2 cm": n significant digits and the SI symbol (symbols are the same in every language)
  function withUnit(q, n) { const s = SYM[q.u] || q.u, tight = q.u === 'deg' || q.u === 'arcmin' || q.u === 'arcsec'; let d = sig(q.v, n || 3); if (d.indexOf('.') >= 0) d = d.replace(/0+$/, '').replace(/\.$/, ''); return d + (tight ? '' : ' ') + s; }
  // parameters of the live models that the prose also quotes
  const LAB = { cap: { V: 9, R: 1000, a: 0.05, g: 1e-3 }, fdtd: { N: 600, width: 14, dx: 1e-3 }, iface: { N: 1200, width: 20 }, spans: [1, 2, 5, 10, 20, 40, 80, 100, 200, 500, 1000, 2000, 5000, 10000] };
  const dB = r => 10 * Math.log10(r);
  const undB = d => Math.pow(10, d / 10);

  /* ═════════ ch2: displacement current ═════════
     A capacitor of circular plates (radius a, gap g) charged from V through R. Conduction current in the wire
     I(t) = (V/R) e^(−t/RC); field in the gap E(t) = V (1 − e^(−t/RC)) / g; displacement current eps0 dΦE/dt.
     Fringing is ignored (g << a). */
  function capacitor(o) {
    const V = o.V, R = o.R, a = o.a, g = o.g;
    const Cap = EPS0 * Math.PI * a * a / g, tau = R * Cap;
    const I = t => (V / R) * Math.exp(-t / tau);
    const E = t => V * (1 - Math.exp(-t / tau)) / g;
    const flux = t => E(t) * Math.PI * a * a;
    // displacement current by a centred finite difference of the flux: the model does not assume it equals I
    const Id = t => { const h = tau * 1e-5; return EPS0 * (flux(t + h) - flux(Math.max(0, t - h))) / (t - h < 0 ? t + h : 2 * h); };
    // B on a loop of radius r centred on the axis, in the gap: flat surface catches eps0 dΦ/dt through pi r² (r < a)
    const Bgap = (t, r, maxwell) => maxwell === false ? 0 : MU0 * Id(t) * Math.min(1, r * r / (a * a)) / (2 * Math.PI * r);
    const Bwire = (t, r) => MU0 * I(t) / (2 * Math.PI * r); // same loop slid along the axis to surround the wire
    return { C: Cap, tau, I, E, Id, Bgap, Bwire, V, R, a, g };
  }

  /* ═════════ ch3–ch4: 1-D FDTD (Yee) ═════════
     Fields E_y(x, t) and B_z(x, t):  dB/dt = −dE/dx,  dE/dt = −(1 / (mu0 eps0 n²)) dB/dx.
     E lives on integer nodes i·dx at integer steps; B on half nodes (i+½)·dx at half steps.
     o: { N cells, dx metres, S Courant number in the fastest medium, n: index per E node (number, array or function),
          bc: 'pec' (metal walls, E = 0) or 'mur' (first-order absorbing) } */
  function fdtd(o) {
    const N = o.N, dx = o.dx || 1e-3, S = o.S == null ? 1 : o.S, bc = o.bc || 'pec';
    const nArr = new Float64Array(N + 1);
    for (let i = 0; i <= N; i++) nArr[i] = typeof o.n === 'function' ? o.n(i) : Array.isArray(o.n) || ArrayBuffer.isView(o.n) ? o.n[i] : (o.n || 1);
    let nmin = Infinity; for (let i = 0; i <= N; i++) nmin = Math.min(nmin, nArr[i]);
    const c0 = cFromFields(), dt = S * dx * nmin / c0;
    const E = new Float64Array(N + 1), B = new Float64Array(N), Bold = new Float64Array(N);
    const ce = new Float64Array(N + 1); // dt / (mu0 eps0 n² dx)
    for (let i = 0; i <= N; i++) ce[i] = dt / (MU0 * EPS0 * nArr[i] * nArr[i] * dx);
    const st = { N, dx, dt, S, E, B, n: nArr, steps: 0, t: 0, U: 0, U0: 0, peak: 0, blown: false };
    // a pulse f(x − vt) travelling in +x (dir = +1) or −x: E = f, B = ±f/v, with B half a step behind
    st.launch = function (centre, width, dir) {
      dir = dir || 1;
      const f = x => Math.exp(-Math.pow((x - centre) / width, 2));
      for (let i = 0; i <= N; i++) E[i] += f(i);
      for (let i = 0; i < N; i++) { const nl = 0.5 * (nArr[i] + nArr[i + 1]), v = c0 / nl; B[i] += dir * f(i + 0.5 + dir * 0.5 * v * dt / dx) / v; }
      if (bc === 'pec') { E[0] = 0; E[N] = 0; }
      st.U0 = 0;
    };
    function energyAt(lo, hi) { // discrete energy per unit area at integer time: ½ eps E² + B(n+½) B(n−½) / 2 mu0
      let ue = 0, ub = 0;
      for (let i = lo; i <= hi; i++) { const w = (i === lo || i === hi) && !(lo === 0 && hi === N) ? 0.5 : (i === 0 || i === N ? 0.5 : 1); ue += w * nArr[i] * nArr[i] * E[i] * E[i]; }
      for (let i = lo; i < hi; i++) ub += B[i] * Bold[i];
      return dx * (0.5 * EPS0 * ue + 0.5 * ub / MU0);
    }
    st.step = function (k) {
      if (st.blown) return st;
      for (let s = 0; s < (k || 1); s++) {
        Bold.set(B);
        for (let i = 0; i < N; i++) B[i] -= (dt / dx) * (E[i + 1] - E[i]);
        st.U = energyAt(0, N); if (o.split != null) { st.UL = energyAt(0, o.split); st.UR = energyAt(o.split, N); }
        if (!st.U0) st.U0 = st.U;
        const e1 = E[1], eN1 = E[N - 1], e0 = E[0], eN = E[N];
        for (let i = 1; i < N; i++) E[i] -= ce[i] * (B[i] - B[i - 1]);
        if (bc === 'mur') {
          const kl = (c0 / nArr[0] * dt - dx) / (c0 / nArr[0] * dt + dx), kr = (c0 / nArr[N] * dt - dx) / (c0 / nArr[N] * dt + dx);
          E[0] = e1 + kl * (E[1] - e0); E[N] = eN1 + kr * (E[N - 1] - eN);
        }
        st.steps++; st.t += dt;
        // "blown" = the field has passed a thousand times the launch amplitude; the run stops on that step
        let p = 0; for (let i = 0; i <= N; i++) { const a = Math.abs(E[i]); if (a > p) p = a; }
        st.peak = p; st.blown = !(p < 1e3);
        if (st.blown) break;
      }
      return st;
    };
    st.centroid = function (lo, hi) { // energy-weighted position of the electric field, in cells
      let s = 0, w = 0; for (let i = lo == null ? 0 : lo; i <= (hi == null ? N : hi); i++) { const e = nArr[i] * nArr[i] * E[i] * E[i]; s += i * e; w += e; } return s / w;
    };
    st.extreme = function (lo, hi) { let v = 0; for (let i = lo; i <= hi; i++) if (Math.abs(E[i]) > Math.abs(v)) v = E[i]; return v; };
    return st;
  }
  // speed of a pulse measured on the grid: energy centroid before and after `steps` steps, in m/s
  function measureSpeed(S, opts) {
    const o = Object.assign({ N: 800, dx: 1e-3, width: 16, n: 1 }, opts || {});
    const g = fdtd({ N: o.N, dx: o.dx, S, n: o.n, bc: 'mur' });
    g.launch(o.N * 0.25, o.width, 1);
    const x0 = g.centroid(), steps = Math.round(o.N * 0.5 / S);
    g.step(steps);
    if (g.blown) return { v: NaN, blown: true, steps };
    return { v: (g.centroid() - x0) * o.dx / (steps * g.dt), blown: false, steps, dt: g.dt };
  }
  // closed metal box: how far the discrete energy drifts and how large the field gets
  function stabilityRun(S, steps, opts) {
    const o = Object.assign({ N: 400, width: 12 }, opts || {});
    const g = fdtd({ N: o.N, S, bc: 'pec' });
    g.launch(o.N / 2, o.width, 1);
    g.step(1); const U0 = g.U; let drift = 0, peak = 0, blownAt = null;
    for (let k = 1; k < steps; k++) { g.step(1); drift = Math.max(drift, Math.abs(g.U / U0 - 1)); peak = Math.max(peak, g.peak); if (g.blown) { blownAt = k + 1; break; } }
    return { drift, peak, blownAt, stable: blownAt == null };
  }
  // a pulse meets a step from index n1 to n2 in the middle of the grid: energy and amplitude that go each way
  function interfaceGrid(n1, n2, opts) {
    const o = Object.assign({ N: 1200, width: 20, S: 1 }, opts || {});
    const mid = o.N / 2;
    const idx = i => i < mid ? n1 : i > mid ? n2 : Math.sqrt((n1 * n1 + n2 * n2) / 2); // node on the boundary: mean permittivity
    const g = fdtd({ N: o.N, S: o.S, n: idx, bc: 'mur', split: mid });
    g.mid = mid; g.n1 = n1; g.n2 = n2;
    g.launch(mid - 6 * o.width, o.width, 1);
    return g;
  }
  function fresnelRun(n1, n2, opts) {
    const g = interfaceGrid(n1, n2, opts), w = (opts && opts.width) || 20;
    g.step(1); const U0 = g.U;
    // c·t (in cells) = 6 widths to reach the boundary + 8 more for the whole pulse to cross and both parts to clear it
    const steps = Math.ceil(14 * w * n1 / (g.S * Math.min(n1, n2)));
    g.step(steps);
    return { R: g.UL / U0, T: g.UR / U0, r: g.extreme(0, g.mid - 1), t: g.extreme(g.mid + 1, g.N), steps, grid: g };
  }
  function fresnel(n1, n2) {
    const r = (n1 - n2) / (n1 + n2), t = 2 * n1 / (n1 + n2);
    return { r, t, R: r * r, T: 4 * n1 * n2 / Math.pow(n1 + n2, 2) };
  }

  /* ═════════ ch5: radiation ═════════ */
  const larmor = (q, a) => q * q * a * a / (6 * Math.PI * EPS0 * Math.pow(C0, 3));
  const RE = QE * QE / (4 * Math.PI * EPS0 * ME * C0 * C0); // classical electron radius
  // a classical electron spiralling in from the Bohr radius by Larmor radiation: t = a0³ / (4 re² c)
  const classicalAtomLifetime = () => Math.pow(A0, 3) / (4 * RE * RE * C0);
  // thin centre-fed dipole of total length L (in wavelengths), sinusoidal current; theta from the wire axis
  function dipoleF(L, th) {
    const s = Math.sin(th); if (Math.abs(s) < 1e-9) return 0;
    return (Math.cos(Math.PI * L * Math.cos(th)) - Math.cos(Math.PI * L)) / s;
  }
  function dipole(L) {
    const n = 3600; let integ = 0, fmax = 0, thMax = Math.PI / 2;
    for (let i = 0; i <= n; i++) { const th = Math.PI * i / n, f = dipoleF(L, th), w = (i === 0 || i === n) ? 0.5 : 1; integ += w * f * f * Math.sin(th); if (f * f > fmax) { fmax = f * f; thMax = th; } }
    integ *= Math.PI / n;
    const D = 2 * fmax / integ, Rmax = ETA0 / (2 * Math.PI) * integ, s2 = Math.pow(Math.sin(Math.PI * L), 2);
    // half-power width of the lobe that contains the maximum
    let lo = thMax, hi = thMax; const half = fmax / 2, f2 = th => Math.pow(dipoleF(L, th), 2);
    while (lo > 0 && f2(lo) > half) lo -= Math.PI / 36000; while (hi < Math.PI && f2(hi) > half) hi += Math.PI / 36000;
    // count lobes in 0..pi
    let lobes = 0, prev = 0, up = false; for (let i = 1; i < 720; i++) { const v = f2(Math.PI * i / 720); if (v > prev + 1e-12) up = true; else if (v < prev - 1e-12 && up) { lobes++; up = false; } prev = v; }
    return { L, D, dBi: dB(D), Rmax, Rin: s2 < 1e-9 ? Infinity : Rmax / s2, hpbw: (hi - lo) * 180 / Math.PI, thMax: thMax * 180 / Math.PI, lobes, fmax };
  }

  /* ═════════ ch6: what a wave carries ═════════ */
  function sunlight(dAU) {
    const I = LSUN / (4 * Math.PI * Math.pow(dAU * AU, 2));
    const Erms = Math.sqrt(I / (EPS0 * C0)), Epk = Erms * Math.SQRT2;
    return { I, Erms, Epk, Bpk: Epk / C0, pAbs: I / C0, pRef: 2 * I / C0, u: I / C0 };
  }
  const PLANETS = { mercury: 0.387, venus: 0.723, earth: 1, mars: 1.524, jupiter: 5.203, saturn: 9.537, neptune: 30.07 }; // semi-major axes, au (NASA planetary fact sheets)
  // unpolarised light through ideal linear polarisers at the given angles (degrees): ½, then cos² of each turn
  function polarisers(angles) {
    const out = [1]; if (!angles.length) return out;
    let I = 0.5; out.push(I);
    for (let k = 1; k < angles.length; k++) { I *= Math.pow(Math.cos((angles[k] - angles[k - 1]) * Math.PI / 180), 2); out.push(I); }
    return out;
  }
  // crossed pair at 0° and 90° with k sheets between, evenly turned (k = 1: at theta)
  function crossedStack(k, theta) {
    const a = [0]; if (k === 1) a.push(theta); else for (let j = 1; j <= k; j++) a.push(90 * j / (k + 1));
    a.push(90); const I = polarisers(a);
    return { angles: a, I, out: I[I.length - 1] };
  }

  /* ═════════ ch7: one spectrum ═════════ */
  const ION_EV = 10; // conventional threshold of ionising radiation (about 10 eV, 124 nm): a convention, not a sharp line
  const BANDS = [ // lower edge in Hz; edges are conventions (wavelengths 1 m, 1 mm, 750 nm, 380 nm, 10 nm, 10 pm)
    ['radio', 0], ['micro', C0 / 1], ['ir', C0 / 1e-3], ['vis', C0 / 750e-9], ['uv', C0 / 380e-9], ['xray', C0 / 10e-9], ['gamma', C0 / 10e-12]];
  function photon(f) {
    const lam = C0 / f, eV = H * f / QE;
    let band = 'radio'; for (const [k, lo] of BANDS) if (f >= lo) band = k;
    return { f, lam, eV, J: H * f, band, ionising: eV >= ION_EV, kT: H * f / (KB * 300), thz: f >= 1e11 && f <= 1e13 };
  }
  const wienPeak = T => 2.897771955e-3 / T; // m (CODATA Wien displacement constant)
  const SIZES = [['mountain', 1e3], ['building', 30], ['person', 1], ['hand', 0.1], ['fingernail', 1e-2], ['grain', 1e-3], ['hair', 3e-5], ['cell', 3e-6], ['virus', 3e-8], ['molecule', 1e-9], ['atom', 3e-11], ['nucleus', 0]];
  function sizeKey(lam) { for (const [k, lo] of SIZES) if (lam >= lo) return k; return 'nucleus'; }
  // liquid water, single Debye relaxation. Kaatze 1989 (J. Chem. Eng. Data 34, 371), 25 °C.
  const WATER = { es: 78.36, einf: 5.2, tau: 8.27e-12 };
  function water(f) {
    const w = 2 * Math.PI * f * WATER.tau, d = WATER.es - WATER.einf;
    const e1 = WATER.einf + d / (1 + w * w), e2 = d * w / (1 + w * w); // eps = e1 − i e2
    const mod = Math.hypot(e1, e2), n = Math.sqrt((mod + e1) / 2), k = Math.sqrt((mod - e1) / 2);
    const lam0 = C0 / f;
    return { e1, e2, n, k, tanD: e2 / e1, depth: lam0 / (4 * Math.PI * k), lamIn: lam0 / n, fPeak: 1 / (2 * Math.PI * WATER.tau),
      // power absorbed per unit volume for a given internal field: ½ ω eps0 e2 |E|²; relative to its value at 2.45 GHz
      heat: 2 * Math.PI * f * EPS0 * e2 };
  }

  /* ═════════ ch8: the atmosphere (ITU-R P.676-13 Annex 1) ═════════
     Spectroscopic data: Tables 1 and 2 of Recommendation ITU-R P.676-13 (08/2022). Columns: f0 GHz, then a1..a6 / b1..b6. */
  const O2 = [
    [50.474214, 0.975, 9.651, 6.69, 0, 2.566, 6.85], [50.987745, 2.529, 8.653, 7.17, 0, 2.246, 6.8], [51.50336, 6.193, 7.709, 7.64, 0, 1.947, 6.729],
    [52.021429, 14.32, 6.819, 8.11, 0, 1.667, 6.64], [52.542418, 31.24, 5.983, 8.58, 0, 1.388, 6.526], [53.066934, 64.29, 5.201, 9.06, 0, 1.349, 6.206],
    [53.595775, 124.6, 4.474, 9.55, 0, 2.227, 5.085], [54.130025, 227.3, 3.8, 9.96, 0, 3.17, 3.75], [54.67118, 389.7, 3.182, 10.37, 0, 3.558, 2.654],
    [55.221384, 627.1, 2.618, 10.89, 0, 2.56, 2.952], [55.783815, 945.3, 2.109, 11.34, 0, -1.172, 6.135], [56.264774, 543.4, 0.014, 17.03, 0, 3.525, -0.978],
    [56.363399, 1331.8, 1.654, 11.89, 0, -2.378, 6.547], [56.968211, 1746.6, 1.255, 12.23, 0, -3.545, 6.451], [57.612486, 2120.1, 0.91, 12.62, 0, -5.416, 6.056],
    [58.323877, 2363.7, 0.621, 12.95, 0, -1.932, 0.436], [58.446588, 1442.1, 0.083, 14.91, 0, 6.768, -1.273], [59.164204, 2379.9, 0.387, 13.53, 0, -6.561, 2.309],
    [59.590983, 2090.7, 0.207, 14.08, 0, 6.957, -0.776], [60.306056, 2103.4, 0.207, 14.15, 0, -6.395, 0.699], [60.434778, 2438, 0.386, 13.39, 0, 6.342, -2.825],
    [61.150562, 2479.5, 0.621, 12.92, 0, 1.014, -0.584], [61.800158, 2275.9, 0.91, 12.63, 0, 5.014, -6.619], [62.41122, 1915.4, 1.255, 12.17, 0, 3.029, -6.759],
    [62.486253, 1503, 0.083, 15.13, 0, -4.499, 0.844], [62.997984, 1490.2, 1.654, 11.74, 0, 1.856, -6.675], [63.568526, 1078, 2.108, 11.34, 0, 0.658, -6.139],
    [64.127775, 728.7, 2.617, 10.88, 0, -3.036, -2.895], [64.67891, 461.3, 3.181, 10.38, 0, -3.968, -2.59], [65.224078, 274, 3.8, 9.96, 0, -3.528, -3.68],
    [65.764779, 153, 4.473, 9.55, 0, -2.548, -5.002], [66.302096, 80.4, 5.2, 9.06, 0, -1.66, -6.091], [66.836834, 39.8, 5.982, 8.58, 0, -1.68, -6.393],
    [67.369601, 18.56, 6.818, 8.11, 0, -1.956, -6.475], [67.900868, 8.172, 7.708, 7.64, 0, -2.216, -6.545], [68.431006, 3.397, 8.652, 7.17, 0, -2.492, -6.6],
    [68.960312, 1.334, 9.65, 6.69, 0, -2.773, -6.65], [118.750334, 940.3, 0.01, 16.64, 0, -0.439, 0.079], [368.498246, 67.4, 0.048, 16.4, 0, 0, 0],
    [424.76302, 637.7, 0.044, 16.4, 0, 0, 0], [487.249273, 237.4, 0.049, 16, 0, 0, 0], [715.392902, 98.1, 0.145, 16, 0, 0, 0],
    [773.83949, 572.3, 0.141, 16.2, 0, 0, 0], [834.145546, 183.1, 0.145, 14.7, 0, 0, 0]];
  const H2O = [
    [22.23508, 0.1079, 2.144, 26.38, 0.76, 5.087, 1], [67.80396, 0.0011, 8.732, 28.58, 0.69, 4.93, 0.82], [119.99594, 0.0007, 8.353, 29.48, 0.7, 4.78, 0.79],
    [183.310087, 2.273, 0.668, 29.06, 0.77, 5.022, 0.85], [321.22563, 0.047, 6.179, 24.04, 0.67, 4.398, 0.54], [325.152888, 1.514, 1.541, 28.23, 0.64, 4.893, 0.74],
    [336.227764, 0.001, 9.825, 26.93, 0.69, 4.74, 0.61], [380.197353, 11.67, 1.048, 28.11, 0.54, 5.063, 0.89], [390.134508, 0.0045, 7.347, 21.52, 0.63, 4.81, 0.55],
    [437.346667, 0.0632, 5.048, 18.45, 0.6, 4.23, 0.48], [439.150807, 0.9098, 3.595, 20.07, 0.63, 4.483, 0.52], [443.018343, 0.192, 5.048, 15.55, 0.6, 5.083, 0.5],
    [448.001085, 10.41, 1.405, 25.64, 0.66, 5.028, 0.67], [470.888999, 0.3254, 3.597, 21.34, 0.66, 4.506, 0.65], [474.689092, 1.26, 2.379, 23.2, 0.65, 4.804, 0.64],
    [488.490108, 0.2529, 2.852, 25.86, 0.69, 5.201, 0.72], [503.568532, 0.0372, 6.731, 16.12, 0.61, 3.98, 0.43], [504.482692, 0.0124, 6.731, 16.12, 0.61, 4.01, 0.45],
    [547.67644, 0.9785, 0.158, 26, 0.7, 4.5, 1], [552.02096, 0.184, 0.158, 26, 0.7, 4.5, 1], [556.935985, 497, 0.159, 30.86, 0.69, 4.552, 1],
    [620.700807, 5.015, 2.391, 24.38, 0.71, 4.856, 0.68], [645.766085, 0.0067, 8.633, 18, 0.6, 4, 0.5], [658.00528, 0.2732, 7.816, 32.1, 0.69, 4.14, 1],
    [752.033113, 243.4, 0.396, 30.86, 0.68, 4.352, 0.84], [841.051732, 0.0134, 8.177, 15.9, 0.33, 5.76, 0.45], [859.965698, 0.1325, 8.055, 30.6, 0.68, 4.09, 0.84],
    [899.303175, 0.0547, 7.914, 29.85, 0.68, 4.53, 0.9], [902.611085, 0.0386, 8.429, 28.65, 0.7, 5.1, 0.95], [906.205957, 0.1836, 5.11, 24.08, 0.7, 4.7, 0.53],
    [916.171582, 8.4, 1.441, 26.73, 0.7, 5.15, 0.78], [923.112692, 0.0079, 10.293, 29, 0.7, 5, 0.8], [970.315022, 9.009, 1.919, 25.5, 0.64, 4.94, 0.67],
    [987.926764, 134.6, 0.257, 29.85, 0.68, 4.55, 0.9], [1780, 17506, 0.952, 196.3, 2, 24.15, 5]];
  // specific attenuation in dB/km at f GHz; p dry-air pressure hPa, T kelvin, rho water-vapour density g/m³
  function gasAtten(f, p, T, rho) {
    const th = 300 / T, e = rho * T / 216.7;
    let nox = 0, nwv = 0;
    for (const [fi, a1, a2, a3, a4, a5, a6] of O2) {
      const Sx = a1 * 1e-7 * p * Math.pow(th, 3) * Math.exp(a2 * (1 - th));
      let df = a3 * 1e-4 * (p * Math.pow(th, 0.8 - a4) + 1.1 * e * th);
      df = Math.sqrt(df * df + 2.25e-6);
      const dl = (a5 + a6 * th) * 1e-4 * (p + e) * Math.pow(th, 0.8);
      nox += Sx * (f / fi) * ((df - dl * (fi - f)) / (Math.pow(fi - f, 2) + df * df) + (df - dl * (fi + f)) / (Math.pow(fi + f, 2) + df * df));
    }
    const d = 5.6e-4 * (p + e) * Math.pow(th, 0.8);
    nox += f * p * th * th * (6.14e-5 / (d * (1 + Math.pow(f / d, 2))) + 1.4e-12 * p * Math.pow(th, 1.5) / (1 + 1.9e-5 * Math.pow(f, 1.5)));
    for (const [fi, b1, b2, b3, b4, b5, b6] of H2O) {
      const Sx = b1 * 1e-1 * e * Math.pow(th, 3.5) * Math.exp(b2 * (1 - th));
      let df = b3 * 1e-4 * (p * Math.pow(th, b4) + b5 * e * Math.pow(th, b6));
      df = 0.535 * df + Math.sqrt(0.217 * df * df + 2.1316e-12 * fi * fi / th);
      nwv += Sx * (f / fi) * (df / (Math.pow(fi - f, 2) + df * df) + df / (Math.pow(fi + f, 2) + df * df));
    }
    const o2 = 0.182 * f * nox, h2o = 0.182 * f * nwv;
    return { o2, h2o, total: o2 + h2o };
  }
  // mean annual global reference atmosphere, ITU-R P.835-6 §1.1 (heights treated as geometric); water vapour
  // rho0 exp(−h / 2 km). Returns total pressure hPa, temperature K, vapour density g/m³ at h km.
  function atmosphere(h, rho0) {
    let T, P;
    if (h <= 11) { T = 288.15 - 6.5 * h; P = 1013.25 * Math.pow(288.15 / T, -34.1632 / 6.5); }
    else if (h <= 20) { T = 216.65; P = 226.3226 * Math.exp(-0.157688 * (h - 11)); }
    else { T = 216.65 + (h - 20); P = 54.74980 * Math.pow(216.65 / T, 34.1632); }
    return { T, P, rho: rho0 * Math.exp(-h / 2) };
  }
  const SEA = { P: 1013.25, T: 288.15, rho: 7.5 }; // P.835 sea-level standard: 15 °C, 7.5 g/m³
  function seaLevel(f, rho) { const r = rho == null ? SEA.rho : rho, e = r * SEA.T / 216.7; return gasAtten(f, SEA.P - e, SEA.T, r); }
  // total attenuation straight up through the reference atmosphere, dB (midpoint rule, 0–30 km)
  function zenithParts(f, rho) {
    const r0 = rho == null ? SEA.rho : rho; let A = 0, O = 0, h = 0;
    while (h < 30) { const dh = h < 10 ? 0.25 : 1, a = atmosphere(h + dh / 2, r0), e = a.rho * a.T / 216.7, g = gasAtten(f, a.P - e, a.T, a.rho); A += g.total * dh; O += g.o2 * dh; h += dh; }
    return { total: A, o2: O, h2o: A - O };
  }
  const zenith = (f, rho) => zenithParts(f, rho).total;
  const saturationDensity = Tc => { // g/m³ over water, Magnus form (Alduchov & Eskridge 1996)
    const es = 6.1094 * Math.exp(17.625 * Tc / (Tc + 243.04)); return 216.7 * es / (Tc + 273.15); };

  /* ═════════ ch9: carrying information ═════════ */
  function besselJ(n, x) { // (1/pi) ∫0..pi cos(n t − x sin t) dt, trapezoid: exact to rounding for a periodic integrand
    const m = 400; let s = 0;
    for (let i = 0; i <= m; i++) { const t = Math.PI * i / m; s += ((i === 0 || i === m) ? 0.5 : 1) * Math.cos(n * t - x * Math.sin(t)); }
    return s / m;
  }
  // a carrier of fc cycles in N samples, modulated by a tone of fm cycles. type 'am' (depth m) or 'fm' (index beta).
  function modulate(type, fm, idx, N, fc) {
    N = N || 2048; fc = fc || 256;
    const s = new Float64Array(N), msg = new Float64Array(N);
    for (let k = 0; k < N; k++) {
      const a = 2 * Math.PI * k / N; msg[k] = Math.cos(fm * a);
      s[k] = type === 'am' ? (1 + idx * Math.cos(fm * a)) * Math.cos(fc * a) : Math.cos(fc * a + idx * Math.sin(fm * a));
    }
    const half = 160, bins = [];
    for (let b = fc - half; b <= fc + half; b++) { let re = 0, im = 0; for (let k = 0; k < N; k++) { const a = 2 * Math.PI * b * k / N; re += s[k] * Math.cos(a); im -= s[k] * Math.sin(a); } bins.push({ k: b - fc, a: 2 * Math.hypot(re, im) / N }); }
    let tot = 0; for (const b of bins) tot += b.a * b.a;
    const amp = k => { const b = bins[k + half]; return b ? b.a : 0; };
    // occupied bandwidth: the narrowest band centred on the carrier that holds 98% of the power, in cycles
    let acc = amp(0) * amp(0), w = 0; while (acc < 0.98 * tot && w < half) { w++; acc += amp(w) * amp(w) + amp(-w) * amp(-w); }
    return { type, fm, idx, s, msg, bins, amp, carrier: amp(0), obw: 2 * w, rule: type === 'am' ? 2 * fm : 2 * (idx + 1) * fm,
      sideFrac: 1 - amp(0) * amp(0) / tot, lines: bins.filter(b => b.a > 0.01).length, N, fc };
  }
  const apertureGain = (D, lam, eff) => eff * Math.pow(Math.PI * D / lam, 2);
  // Friis transmission equation with a thermal noise floor. All inputs SI; gains as plain ratios.
  function friis(o) {
    const lam = C0 / o.f, fspl = Math.pow(4 * Math.PI * o.d / lam, 2);
    const Pr = o.Pt * o.Gt * o.Gr / fspl, Nn = KB * o.Tsys * o.B, snr = Pr / Nn;
    return { lam, fsplDb: dB(fspl), Pr, PrDbm: dB(Pr / 1e-3), N: Nn, NDbm: dB(Nn / 1e-3), snr, snrDb: dB(snr), shannon: o.B * Math.log2(1 + snr), ebn0Db: o.Rb ? dB(Pr / (KB * o.Tsys * o.Rb)) : null };
  }
  const SRC = {
    voyager: { Pt: 22.4, D: 3.7, f: 8.42e9, dAU: 173.14, Rb: 160, dsnD: 70 }, // see BRIEF: NASA Voyager pages; EarthSky 2026-11-17 for the distance
    gps: { Pt: 25, GtDbi: 13.5, f: 1575.42e6, d: 20200e3, B: 2.046e6, specMinDbw: -158.5 }, // FCC filing link budget; IS-GPS-200 minimum
    icnirp: { wholeBody: 0.08, headTorso: 2, limbs: 4, massG: 10 }, // W/kg, general public, ICNIRP 2020
    fcc: { local: 1.6, massG: 1 },                                   // W/kg, 47 CFR 1.1310
    solarConstant: 1361, // W/m², IAU 2015 B3 nominal total solar irradiance
    oven: 2.45e9
  };
  // link presets. TUNED: antenna efficiencies, system noise temperatures and the everyday distances are typical
  // textbook values chosen for the model, not measurements of a particular device.
  const LINKS = {
    wifi: { Pt: 0.1, Gt: undB(2), Gr: undB(0), f: 2.437e9, d: 10, B: 20e6, Tsys: 290 * undB(6) },
    cell: { Pt: 0.2, Gt: undB(0), Gr: undB(17), f: 1.8e9, d: 2000, B: 10e6, Tsys: 290 * undB(3) },
    gps: { Pt: SRC.gps.Pt, Gt: undB(SRC.gps.GtDbi), Gr: undB(0), f: SRC.gps.f, d: SRC.gps.d, B: SRC.gps.B, Tsys: 290 * undB(2), Rb: 50 },
    voyager: { Pt: SRC.voyager.Pt, Gt: apertureGain(SRC.voyager.D, C0 / SRC.voyager.f, 0.6), Gr: apertureGain(SRC.voyager.dsnD, C0 / SRC.voyager.f, 0.65), f: SRC.voyager.f, d: SRC.voyager.dAU * AU, B: SRC.voyager.Rb, Tsys: 20, Rb: SRC.voyager.Rb }
  };
  function link(key, scale) { const p = LINKS[key]; return Object.assign({ key }, friis(Object.assign({}, p, { d: p.d * (scale || 1) })), { d: p.d * (scale || 1), p }); }

  /* ═════════ ch10: fibre ═════════
     Loss of a silica single-mode fibre in dB/km at wavelength lam (µm): Rayleigh A / lam⁴ plus the infrared
     absorption tail 7.81e11 exp(−48.48 / lam) (textbook form, e.g. Keiser, Optical Fiber Communications, ch. 3).
     TUNED: A = 0.9 dB/km·µm⁴ so that the model lands on typical figures for standard G.652.D fibre
     (about 0.32–0.35 dB/km at 1310 nm, 0.18–0.20 at 1550 nm). No OH peak (modern low-water-peak fibre). */
  const FIBRE = { A: 0.9, irA: 7.81e11, irB: 48.48, n1: 1.468, delta: 0.0036 };
  function fibreLoss(lam) { const ray = FIBRE.A / Math.pow(lam, 4), ir = FIBRE.irA * Math.exp(-FIBRE.irB / lam); return { ray, ir, total: ray + ir }; }
  function fibreMin() { let best = null; for (let l = 1.2; l <= 1.8; l += 0.001) { const a = fibreLoss(l).total; if (!best || a < best.a) best = { lam: l, a }; } return best; }
  function fibreSpan(lam, km) { const a = fibreLoss(lam).total, dBt = a * km; return { a, dB: dBt, frac: undB(-dBt), halfKm: dB(2) / a }; }
  function fibreGuide() {
    const n1 = FIBRE.n1, n2 = n1 * (1 - FIBRE.delta), na = Math.sqrt(n1 * n1 - n2 * n2);
    return { n1, n2, crit: Math.asin(n2 / n1) * 180 / Math.PI, na, accept: Math.asin(na) * 180 / Math.PI, v: C0 / n1, vFrac: 1 / n1, usPerKm: 1e9 * n1 / C0 };
  }

  /* ═════════ ch11: apertures and arrays ═════════ */
  const J1ZERO = 3.8317059702075125; // first zero of J1
  const airy = x => Math.abs(x) < 1e-8 ? 1 : Math.pow(2 * besselJ(1, x) / x, 2);
  const rayleigh = (lam, D) => (J1ZERO / Math.PI) * lam / D; // radians: 1.2197 lambda / D
  // two equal incoherent point sources `sep` Rayleigh units apart: intensity profile along the line through them
  function twoPoints(sep, n) {
    n = n || 240; const half = 2.6, xs = [], ys = []; let peak = 0;
    for (let i = 0; i <= n; i++) { const u = -half + 2 * half * i / n, v = airy((u - sep / 2) * J1ZERO) + airy((u + sep / 2) * J1ZERO); xs.push(u); ys.push(v); if (v > peak) peak = v; }
    const mid = 2 * airy(sep / 2 * J1ZERO);
    return { xs, ys, peak, mid, dip: mid / peak, resolved: mid / peak < 0.999 };
  }
  // separation (in Rayleigh units) at which the dip between the two peaks just disappears (Sparrow limit)
  function sparrow() { let lo = 0.5, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const t = twoPoints(m, 2000); if (t.dip < 1 - 1e-9) hi = m; else lo = m; } return (lo + hi) / 2; }
  const APERTURES = { // TUNED: the eye's pupil diameter (3 mm, daylight); the rest are instrument dimensions
    eye: { D: 3e-3, lam: 550e-9, dist: 1e3 },
    hubble: { D: 2.4, lam: 550e-9, dist: 384400e3 },
    jwst: { D: 6.5, lam: 2e-6, dist: 384400e3 },
    dsn: { D: 70, lam: C0 / 8.42e9, dist: 173.14 * AU },
    eht: { D: 12742e3, lam: 1.3e-3, dist: 16.8e6 * 3.0856775814913673e16 } // Earth's diameter; M87 at 16.8 Mpc
  };
  function aperture(key) { const a = APERTURES[key], th = rayleigh(a.lam, a.D); return { key, th, size: th * a.dist, D: a.D, lam: a.lam, dist: a.dist }; }
  // uniform linear array of N isotropic elements spaced d wavelengths, steered to th0 (degrees from broadside)
  function arrayFactor(N, d, th0, th) {
    const psi = 2 * Math.PI * d * (Math.sin(th * Math.PI / 180) - Math.sin(th0 * Math.PI / 180));
    const s = Math.sin(psi / 2); if (Math.abs(s) < 1e-9) return 1;
    return Math.pow(Math.sin(N * psi / 2) / (N * s), 2);
  }
  function array(N, d, th0) {
    const u0 = Math.sin(th0 * Math.PI / 180);
    // half-power width around the steered beam, by bisection on each side
    const edge = dir => { let a = th0, b = th0; while (Math.abs(b) < 90 && arrayFactor(N, d, th0, b) > 0.5) b += dir * 0.05; if (arrayFactor(N, d, th0, b) > 0.5) return dir * 90; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (arrayFactor(N, d, th0, m) > 0.5) a = m; else b = m; } return (a + b) / 2; };
    const lo = edge(-1), hi = edge(1);
    const grating = []; for (let m = -4; m <= 4; m++) { if (!m) continue; const u = u0 + m / d; if (Math.abs(u) <= 1) grating.push(Math.asin(u) * 180 / Math.PI); }
    return { N, d, th0, hpbw: hi - lo, grating, delayDeg: ((-360 * d * u0) % 360), gainDb: dB(N), phaseStep: -2 * Math.PI * d * u0, dMax: 1 / (1 + Math.abs(u0)) };
  }

  /* ═════════ frontier facts (ch12). One block, so that they can be updated without touching the prose.
     Each: value(s), date of the fact, source key (URLs and access dates in BRIEF.md "Facts that will go stale"). ═════════ */
  const FRONTIER = {
    asOf: '2026-11',
    fr1: [410e6, 7.125e9], fr2: [24.25e9, 71e9],                      // 3GPP TS 38.104 frequency ranges
    wrc27: [[4.4e9, 4.8e9], [7.125e9, 8.4e9], [14.8e9, 15.35e9]],     // WRC-23 Resolution 256, agenda item 1.7 of WRC-27
    wifi7: { published: '2025-07-22', bwMHz: 320, qam: 4096, bitsPerSymbol: 12 },
    wifi8: { status: 'draft', approvalForecast: 2028 },
    subThz: { year: 2024, gbps: 100, bandsGHz: [100, 300], metres: 100 }, // DOCOMO, NTT, NEC, Fujitsu, 2024-04-11
    fibreSmf: { year: 2026, tbps: 450, thz: 42.4, km: 39 },             // NICT et al., OFC 2026 postdeadline
    fibreMcf: { year: 2025, pbps: 1.02, km: 1808, cores: 19, claddingUm: 125 }, // NICT, Sumitomo et al., OFC 2025
    hollow: { year: 2025, dBkm: 0.091, lamNm: 1550, thzBelow02: 66 },   // Petrovich et al., Nature Photonics 2025
    dsoc: { peakMbps: 267, peakMkm: 31, farMkm: 494, totalTb: 13.6, passes: 65 }, // NASA/JPL, 2023-12 to 2025-09
    d2c: { starlinkSats: 650, asOf: '2026-10' },
    euv: { lamNm: 13.5, na: 0.55, resNm: 8, naLow: 0.33 },
    lcls: { firstLight: '2023-09', heGeV: 8, heFirstLightPlan: '2027-10' },
    voyager: { lightDay: '2026-11-18', au: 173.14 }
  };

  return { C0, MU0, EPS0, H, QE, KB, ME, A0, AU, LSUN, ETA0, RE, cFromFields, fmt, sig, sci, supStr, siLen, siFreq, siPow, siAngle, siRate, withUnit, LAB, dB, undB,
    capacitor, fdtd, measureSpeed, stabilityRun, interfaceGrid, fresnelRun, fresnel,
    larmor, classicalAtomLifetime, dipoleF, dipole,
    sunlight, PLANETS, polarisers, crossedStack,
    ION_EV, BANDS, photon, wienPeak, SIZES, sizeKey, WATER, water,
    O2, H2O, gasAtten, atmosphere, SEA, seaLevel, zenith, zenithParts, saturationDensity,
    besselJ, modulate, apertureGain, friis, SRC, LINKS, link,
    FIBRE, fibreLoss, fibreMin, fibreSpan, fibreGuide,
    J1ZERO, airy, rayleigh, twoPoints, sparrow, APERTURES, aperture, arrayFactor, array, FRONTIER };
});
