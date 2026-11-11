/* Models for "Ten ideas inside one phone" (tech/devices/inside-a-phone).
 * Every function here is pure (or takes its RNG as an argument) so tests/models.cjs can pin the numbers
 * the prose states. No visible text lives in this file. UMD: window.PhoneModels in the page, require() in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PhoneModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── shared helpers ───────── */
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () {
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function gauss(R) { // Box–Muller, one value per call
    let u = 0, v = 0;
    while (u === 0) u = R();
    v = R();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function poisson(R, lam) {
    if (lam <= 0) return 0;
    if (lam > 40) return Math.max(0, Math.round(lam + Math.sqrt(lam) * gauss(R)));
    const L = Math.exp(-lam); let k = 0, p = 1;
    do { k++; p *= R(); } while (p > L);
    return k - 1;
  }
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ───────── 01 GPS: pseudoranges, the clock unknown, geometry ─────────
   * Flat (2-D) slice through the Earth's centre. Receiver on the surface at (0, R_E).
   * Three satellites on a circle of radius A_GPS at geocentric angles −s, 0.3 s, +s from the receiver's zenith.
   * In 2-D the unknowns are x, y and the receiver clock error b, so three satellites suffice;
   * in 3-D there is one more coordinate, so four are needed. */
  const C = 299792458;            // m/s, exact by definition of the metre
  const R_E = 6371e3;             // m, mean Earth radius
  const A_GPS = 26560e3;          // m, GPS semi-major axis (Navipedia: 26 560 km ⇒ altitude ≈ 20 200 km)
  const GM = 3.986004418e14;      // m^3/s^2, Earth's gravitational parameter (WGS 84)
  const GPS_SEED = 7;

  function gpsSats(spreadDeg) {
    return [-1, 0.3, 1].map(k => {
      const th = k * spreadDeg * Math.PI / 180;
      return [A_GPS * Math.sin(th), A_GPS * Math.cos(th)];
    });
  }
  function gpsNoiseDraws(seed) { const R = rng(seed); return [gauss(R), gauss(R), gauss(R)]; }
  // pseudorange = true distance + c·(receiver clock error) + c·(timing noise)
  function gpsPseudoranges(o) {
    const sats = gpsSats(o.spread), n = gpsNoiseDraws(o.seed == null ? GPS_SEED : o.seed), r = [0, R_E];
    return sats.map((s, i) => Math.hypot(s[0] - r[0], s[1] - r[1]) + C * o.biasNs * 1e-9 + C * (o.noiseNs || 0) * 1e-9 * n[i]);
  }
  // Gauss–Newton on (x, y, c·b): the receiver treats its own clock error as a third unknown.
  function gpsSolve(sats, rho, start) {
    let x = start ? start[0] : 2000, y = start ? start[1] : R_E, cb = 0;
    for (let it = 0; it < 12; it++) {
      const J = [], r = [];
      for (let i = 0; i < sats.length; i++) {
        const dx = x - sats[i][0], dy = y - sats[i][1], d = Math.hypot(dx, dy);
        J.push([dx / d, dy / d, 1]); r.push(rho[i] - (d + cb));
      }
      // normal equations (works for 3 or more satellites)
      const N = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], g = [0, 0, 0];
      for (let i = 0; i < J.length; i++) for (let a = 0; a < 3; a++) { g[a] += J[i][a] * r[i]; for (let b = 0; b < 3; b++) N[a][b] += J[i][a] * J[i][b]; }
      const d = solve3(N, g);
      x += d[0]; y += d[1]; cb += d[2];
      if (Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) < 1e-6) break;
    }
    return { x, y, cb, clockNs: cb / C * 1e9, posErr: Math.hypot(x, y - R_E) };
  }
  function solve3(M, v) {
    const A = M.map((row, i) => row.concat([v[i]]));
    for (let c = 0; c < 3; c++) {
      let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < 3; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 4; k++) A[r][k] -= f * A[c][k]; }
    }
    return [A[0][3] / A[0][0], A[1][3] / A[1][1], A[2][3] / A[2][2]];
  }
  // circle–circle intersection nearest the receiver
  function circleMeet(s1, r1, s2, r2) {
    const dx = s2[0] - s1[0], dy = s2[1] - s1[1], d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h2 = r1 * r1 - a * a, h = Math.sqrt(Math.max(0, h2));
    const mx = s1[0] + a * dx / d, my = s1[1] + a * dy / d;
    const p1 = [mx + h * dy / d, my - h * dx / d], p2 = [mx - h * dy / d, my + h * dx / d];
    const near = p => Math.hypot(p[0], p[1] - R_E);
    return near(p1) < near(p2) ? p1 : p2;
  }
  // With the receiver's current guess of its clock error, the circles have radius ρ − c·guess.
  // Returns the three pairwise crossings and the largest distance between them (how badly they miss).
  function gpsMismatch(o, guessNs) {
    const sats = gpsSats(o.spread), rho = gpsPseudoranges(o), rad = rho.map(r => r - C * guessNs * 1e-9);
    const pts = [circleMeet(sats[0], rad[0], sats[1], rad[1]), circleMeet(sats[1], rad[1], sats[2], rad[2]), circleMeet(sats[0], rad[0], sats[2], rad[2])];
    let m = 0; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) m = Math.max(m, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]));
    return { pts: pts.map(p => [p[0], p[1] - R_E]), spread: m, radii: rad, sats };
  }
  function gpsFix(o) { const sats = gpsSats(o.spread); return gpsSolve(sats, gpsPseudoranges(o)); }
  // Clock rates of a GPS satellite relative to a clock on the ground (ground rotation ignored).
  function gpsRelativity() {
    const day = 86400;
    const grav = GM * (1 / R_E - 1 / A_GPS) / (C * C) * day * 1e6;   // µs/day, satellite clock runs faster (weaker gravity)
    const speed = GM / A_GPS / (2 * C * C) * day * 1e6;              // µs/day, runs slower (orbital speed)
    const net = grav - speed;
    return { grav, speed, net, kmPerDay: net * 1e-6 * C / 1000, travelMs: (A_GPS - R_E) / C * 1e3, periodH: 2 * Math.PI * Math.sqrt(A_GPS * A_GPS * A_GPS / GM) / 3600 };
  }

  /* ───────── 02 accelerometer: a proof mass on a spring ─────────
   * The sensor measures specific force f = a − g (what the springs must supply), in the phone's frame. */
  const G0 = 9.81;
  function accelReading(tiltDeg, freeFall) {
    if (freeFall) return { x: 0, y: 0, mag: 0 };
    const t = tiltDeg * Math.PI / 180;
    return { x: G0 * Math.sin(t), y: G0 * Math.cos(t), mag: G0 };
  }
  // static displacement of the proof mass: x = f / ω0²
  function proofDisplacement(f, f0Hz) { const w = 2 * Math.PI * f0Hz; return f / (w * w); }
  // Dead reckoning of a phone lying still: integrate (reading − assumed gravity) twice.
  // Internally sampled at 100 Hz so results do not depend on the screen's frame rate.
  const ACC_FS = 100;
  function driftInit(seed) { return { t: 0, n: 0, el: 0, v: 0, x: 0, R: rng(seed == null ? 5 : seed), fixPrev: 0, trace: [[0, 0]] }; }
  // Steps are counted as integers against total elapsed time, so the result does not depend on how dt is chunked.
  function driftStep(S, dt, o) {
    S.el += dt; const h = 1 / ACC_FS, target = Math.min(Math.floor(S.el * ACC_FS + 1e-6), Math.round(o.tMax * ACC_FS));
    while (S.n < target) {
      const a = o.bias + o.noise * gauss(S.R);       // true acceleration is 0
      S.v += a * h; S.x += S.v * h; S.n++; S.t = S.n / ACC_FS;
      if (o.gps && S.n % ACC_FS === 0) {              // one GPS fix per second, ±gpsSigma metres
        const fix = (o.gpsSigma || 3) * gauss(S.R);
        S.v = fix - S.fixPrev; S.x = fix; S.fixPrev = fix;
      }
      if (S.n % 10 === 0) S.trace.push([S.t, S.x]);
    }
    return S;
  }
  function driftBias(b, t) { return 0.5 * b * t * t; }
  // RMS position error from white acceleration noise of std σ sampled at fs: σ·√(Δt)·t^1.5/√3
  function driftNoiseRms(sigma, t, fs) { return sigma * Math.sqrt(1 / (fs || ACC_FS)) * Math.pow(t, 1.5) / Math.sqrt(3); }

  /* ───────── 03 capacitive touch: a row of electrodes and interpolation ───────── */
  const TOUCH = { pitch: 5, n: 8 };
  function touchSignals(x0, width, noise, R) {
    const s = [];
    for (let k = 0; k < TOUCH.n; k++) {
      const xk = (k + 0.5) * TOUCH.pitch;
      s.push(Math.exp(-((xk - x0) * (xk - x0)) / (2 * width * width)) + (noise && R ? noise * gauss(R) : 0));
    }
    return s;
  }
  function touchEstimate(s) {
    let k = 0; for (let i = 1; i < s.length; i++) if (s[i] > s[k]) k = i;
    const peak = (k + 0.5) * TOUCH.pitch;
    let num = 0, den = 0;
    for (let i = Math.max(0, k - 1); i <= Math.min(s.length - 1, k + 1); i++) { const w = Math.max(0, s[i]); num += w * (i + 0.5) * TOUCH.pitch; den += w; }
    return { peak, centroid: den > 0 ? num / den : peak, k };
  }
  // Worst error over finger positions in the middle of the panel (no noise): shows the systematic wobble.
  function touchWorstError(width) {
    let wp = 0, wc = 0;
    for (let x = 2 * TOUCH.pitch; x <= 6 * TOUCH.pitch; x += 0.01) {
      const e = touchEstimate(touchSignals(x, width, 0));
      wp = Math.max(wp, Math.abs(e.peak - x)); wc = Math.max(wc, Math.abs(e.centroid - x));
    }
    return { peak: wp, centroid: wc };
  }
  // RMS error with noise, by Monte Carlo over positions and draws (seeded)
  function touchNoiseRms(width, noise, seed, trials) {
    const R = rng(seed == null ? 3 : seed); let s2 = 0; const n = trials || 4000;
    for (let i = 0; i < n; i++) { const x = 2 * TOUCH.pitch + R() * 4 * TOUCH.pitch; const e = touchEstimate(touchSignals(x, width, noise, R)); s2 += (e.centroid - x) * (e.centroid - x); }
    return Math.sqrt(s2 / n);
  }

  /* ───────── 04 camera: photons arrive at random ───────── */
  const CAM = { W: 64, H: 40 };
  // reflectance of a dim street scene, 0.04 … 1; a uniform grey card (0.5) sits in the lower left
  function camScene(i, j) {
    const u = (i + 0.5) / CAM.W, v = (j + 0.5) / CAM.H;
    if (u > 0.06 && u < 0.3 && v > 0.58 && v < 0.92) return 0.5;           // grey card
    const moon = Math.hypot(u - 0.8, (v - 0.22) * CAM.H / CAM.W);
    if (moon < 0.07) return 1;
    const roof = 0.55 + 0.12 * Math.sin(u * 9) + (u > 0.42 && u < 0.62 ? -0.18 : 0);
    if (v > roof && u > 0.34) {                                               // buildings with lit windows
      const wi = Math.floor(u * 40), wj = Math.floor(v * 24);
      return ((wi % 3 === 1) && (wj % 3 === 1) && ((wi * 7 + wj * 13) % 5 < 2)) ? 0.85 : 0.06;
    }
    return 0.12 + 0.2 * (1 - v);                                              // sky, brighter at the top
  }
  function camGreyPixels() { const out = []; for (let j = 0; j < CAM.H; j++) for (let i = 0; i < CAM.W; i++) if (camScene(i, j) === 0.5) out.push(j * CAM.W + i); return out; }
  function photonsPerPixel(light, pixelUm) { return light * pixelUm * pixelUm; }
  function camStackInit() { return { sum: new Float64Array(CAM.W * CAM.H), n: 0 }; }
  function camAddFrame(st, ppp, R) {
    for (let j = 0, k = 0; j < CAM.H; j++) for (let i = 0; i < CAM.W; i++, k++) st.sum[k] += poisson(R, camScene(i, j) * ppp);
    st.n++; return st;
  }
  // relative noise (std/mean) measured on the grey card of the stacked average
  function camMeasuredNoise(st, grey) {
    let m = 0; for (const k of grey) m += st.sum[k]; m /= grey.length;
    let v = 0; for (const k of grey) v += (st.sum[k] - m) * (st.sum[k] - m); v /= (grey.length - 1);
    return m > 0 ? Math.sqrt(v) / m : Infinity;
  }
  function camTheoryNoise(ppp, frames) { const N = 0.5 * ppp * frames; return N > 0 ? 1 / Math.sqrt(N) : Infinity; }

  /* ───────── 05 screen: three cone types, three sub-pixels ─────────
   * Cone pigment absorbance: Govardovskii et al. (2000) A1 template (α + β band),
   * peaks from Bowmaker & Dartnall (1980): S 420.3, M 533.8, L 562.8 nm.
   * No lens or macular filtering: a pigment model, not the full corneal cone fundamentals. */
  const CONE_PEAKS = { L: 562.8, M: 533.8, S: 420.3 };
  function pigment(lmax, lam) {
    const x = lmax / lam;
    const a = 0.8795 + 0.0459 * Math.exp(-((lmax - 300) * (lmax - 300)) / 11940);
    const alpha = 1 / (Math.exp(69.7 * (a - x)) + Math.exp(28 * (0.922 - x)) + Math.exp(-14.9 * (1.104 - x)) + 0.674);
    const lb = 189 + 0.315 * lmax, bb = -40.5 + 0.195 * lmax;
    const beta = 0.26 * Math.exp(-Math.pow((lam - lb) / bb, 2));
    return alpha + beta;
  }
  function cones(lam) { return [pigment(CONE_PEAKS.L, lam), pigment(CONE_PEAKS.M, lam), pigment(CONE_PEAKS.S, lam)]; }
  // illustrative OLED-like sub-pixel spectra (Gaussian), peak wavelength and width in nm
  const PRIMS = [[625, 12], [530, 18], [460, 12]];
  function primSpectrum(p, lam) { const [c, w] = PRIMS[p]; return Math.exp(-0.5 * Math.pow((lam - c) / w, 2)); }
  const PRIM_LMS = PRIMS.map((_, p) => { const s = [0, 0, 0]; for (let l = 380; l <= 720; l++) { const c = cones(l), e = primSpectrum(p, l); s[0] += c[0] * e; s[1] += c[1] * e; s[2] += c[2] * e; } return s; });
  function mixLMS(w) { return [0, 1, 2].map(c => w[0] * PRIM_LMS[0][c] + w[1] * PRIM_LMS[1][c] + w[2] * PRIM_LMS[2][c]); }
  // Exact solve: what sub-pixel weights give the same three cone responses as monochromatic light at lam?
  // The target's brightness is scaled so the largest weight is 0.9 (only matters for drawing).
  function colourMatch(lam) {
    const t = cones(lam), M = [0, 1, 2].map(c => [PRIM_LMS[0][c], PRIM_LMS[1][c], PRIM_LMS[2][c]]);
    const w = solve3(M, t), k = 0.9 / Math.max(...w.map(Math.abs));
    return { w: w.map(v => v * k), target: t.map(v => v * k), inGamut: w.every(v => v >= -1e-9) };
  }
  // Sub-pixel weights that match an equal-energy white (380–720 nm). The swatch divides by these so the model's
  // weights map onto a white-balanced screen (a real display is calibrated so R = G = B looks white).
  const WHITE_W = (() => { const t = [0, 0, 0]; for (let l = 380; l <= 720; l++) { const c = cones(l); t[0] += c[0]; t[1] += c[1]; t[2] += c[2]; }
    return solve3([0, 1, 2].map(c => [PRIM_LMS[0][c], PRIM_LMS[1][c], PRIM_LMS[2][c]]), t); })();
  function swatchRGB(w) { const v = w.map((x, i) => Math.max(0, x) / WHITE_W[i]), k = Math.max(1e-9, ...v); return v.map(x => x / k); }
  // how far a mix is from the target, as the largest cone difference relative to the target's largest response
  function colourMismatch(w, target) { const m = mixLMS(w), top = Math.max(...target); return Math.max(...m.map((v, i) => Math.abs(v - target[i]))) / top; }
  // spectral power the mix actually emits at lam (for the "is there any 580 nm light" readout)
  function mixPowerAt(w, lam) { return w[0] * primSpectrum(0, lam) + w[1] * primSpectrum(1, lam) + w[2] * primSpectrum(2, lam); }

  /* ───────── 06 compression: predict, store the surprise ───────── */
  const IMG = { W: 128, H: 72 };
  function makeImage(scene, noiseSd, seed) {
    const R = rng(seed == null ? 11 : seed), T = rng(99), px = new Uint8Array(IMG.W * IMG.H);
    const tex = new Float64Array(IMG.W * IMG.H); for (let k = 0; k < tex.length; k++) tex[k] = T();
    for (let j = 0, k = 0; j < IMG.H; j++) for (let i = 0; i < IMG.W; i++, k++) {
      let v;
      if (scene === 'grass') {
        const blades = tex[k] * 0.6 + tex[(k + 1) % tex.length] * 0.25 + tex[(k + IMG.W) % tex.length] * 0.15;
        v = 50 + 150 * blades + 20 * Math.sin(i * 0.9 + j * 0.3);
      } else v = 205 - 95 * j / (IMG.H - 1) + 10 * i / (IMG.W - 1);   // sky: a smooth gradient
      v += noiseSd * gauss(R);
      px[k] = clamp(Math.round(v), 0, 255);
    }
    return px;
  }
  function residuals(px) {
    const out = new Int16Array(px.length);
    for (let j = 0, k = 0; j < IMG.H; j++) for (let i = 0; i < IMG.W; i++, k++) out[k] = px[k] - (i > 0 ? px[k - 1] : j > 0 ? px[k - IMG.W] : 128);
    return out;
  }
  function entropyBits(vals) {
    const h = new Map(); for (const v of vals) h.set(v, (h.get(v) || 0) + 1);
    let H = 0; for (const c of h.values()) { const p = c / vals.length; H -= p * Math.log2(p); }
    return H;
  }
  function compressStats(scene, noiseSd, seed) {
    const px = makeImage(scene, noiseSd, seed), res = residuals(px);
    return { px, res, rawBits: entropyBits(px), bits: entropyBits(res) };
  }
  // bits per pixel for an image that is pure Gaussian noise of std σ around a smooth surface (σ ≳ 1):
  // the residual is a difference of two noises, std σ√2, entropy ≈ log2(σ√2·√(2πe))
  function noiseBitsTheory(sd) { return Math.log2(sd * Math.SQRT2 * Math.sqrt(2 * Math.PI * Math.E)); }
  const MP12_MB = bits => bits * 12e6 / 8 / 1e6;   // one 12-megapixel grey channel, in megabytes

  /* ───────── 07 radio: power falls with distance, rate follows signal-to-noise ─────────
   * Log-distance path loss: free-space loss to d0 = 100 m, then 10·n·log10(d/d0).
   * Assumed (order-of-magnitude) link: 43 dBm transmitter (20 W), 15 dB of antenna gain, 2 GHz, 7 dB receiver noise figure. */
  const RADIO = { ptDbm: 43, gainDb: 15, fHz: 2e9, d0: 100, nfDb: 7 };
  const KT_DBM_HZ = 10 * Math.log10(1.380649e-23 * 290 * 1000);    // thermal noise at 290 K ≈ −174 dBm/Hz
  function fspl(d, f) { return 20 * Math.log10(4 * Math.PI * d * f / C); }
  function pathLoss(d, n) { const L0 = fspl(RADIO.d0, RADIO.fHz); return d <= RADIO.d0 ? fspl(d, RADIO.fHz) : L0 + 10 * n * Math.log10(d / RADIO.d0); }
  function radioLink(d, n, bwHz) {
    const pr = RADIO.ptDbm + RADIO.gainDb - pathLoss(d, n);
    const noise = KT_DBM_HZ + 10 * Math.log10(bwHz) + RADIO.nfDb;
    const snrDb = pr - noise, snr = Math.pow(10, snrDb / 10);
    return { pr, noise, snrDb, cap: bwHz * Math.log2(1 + snr) };
  }

  /* ───────── 08 error correction: Hamming(7,4) ─────────
   * Positions 1…7 = p1 p2 d1 p3 d2 d3 d4; parity bit p_k covers the positions whose index has bit k set. */
  function hammingEncode(d) {
    const c = [0, 0, d[0], 0, d[1], d[2], d[3]];
    c[0] = c[2] ^ c[4] ^ c[6]; c[1] = c[2] ^ c[5] ^ c[6]; c[3] = c[4] ^ c[5] ^ c[6];
    return c;
  }
  function hammingDecode(r) {
    const s1 = r[0] ^ r[2] ^ r[4] ^ r[6], s2 = r[1] ^ r[2] ^ r[5] ^ r[6], s3 = r[3] ^ r[4] ^ r[5] ^ r[6];
    const pos = s1 + 2 * s2 + 4 * s3, c = r.slice();
    if (pos) c[pos - 1] ^= 1;
    return { checks: [s1, s2, s3], pos, corrected: c, data: [c[2], c[4], c[5], c[6]] };
  }
  function blockErrUncoded(p) { return 1 - Math.pow(1 - p, 4); }
  function blockErrHamming(p) { return 1 - (Math.pow(1 - p, 7) + 7 * p * Math.pow(1 - p, 6)); }
  function hammingCrossover() { let lo = 0.01, hi = 0.5; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (blockErrHamming(m) < blockErrUncoded(m)) lo = m; else hi = m; } return (lo + hi) / 2; }
  // send `blocks` random 4-bit messages through a channel that flips each bit with probability p
  function hammingTally(st, blocks, p, R) {
    for (let b = 0; b < blocks; b++) {
      const d = [R() < .5 ? 1 : 0, R() < .5 ? 1 : 0, R() < .5 ? 1 : 0, R() < .5 ? 1 : 0];
      const raw = d.map(v => R() < p ? v ^ 1 : v);
      const c = hammingEncode(d).map(v => R() < p ? v ^ 1 : v), out = hammingDecode(c).data;
      st.sent++; if (raw.some((v, i) => v !== d[i])) st.badRaw++; if (out.some((v, i) => v !== d[i])) st.badCoded++;
    }
    return st;
  }

  /* ───────── 09 handover: two towers, a road, and hysteresis ─────────
   * Signal = the radio model (n = 3.5) + slow shadow fading (Gudmundson: exponentially correlated, σ 6 dB, 50 m). */
  const HO = { len: 2000, side: 60, step: 2, sigma: 6, dcorr: 50, n: 3.5, speed: 20, ttt: 0 };
  function handoverRoad(seed) {
    const R = rng(seed == null ? 17 : seed), N = HO.len / HO.step + 1, rho = Math.exp(-HO.step / HO.dcorr);
    const a = new Float64Array(N), b = new Float64Array(N); let sa = HO.sigma * gauss(R), sb = HO.sigma * gauss(R);
    for (let k = 0; k < N; k++) {
      const x = k * HO.step;
      a[k] = RADIO.ptDbm + RADIO.gainDb - pathLoss(Math.hypot(x, HO.side), HO.n) + sa;
      b[k] = RADIO.ptDbm + RADIO.gainDb - pathLoss(Math.hypot(HO.len - x, HO.side), HO.n) + sb;
      sa = rho * sa + HO.sigma * Math.sqrt(1 - rho * rho) * gauss(R);
      sb = rho * sb + HO.sigma * Math.sqrt(1 - rho * rho) * gauss(R);
    }
    return { a, b, N };
  }
  // Switch when the other tower is better than the serving one by more than `hyst` dB.
  function handoverTrip(road, hyst) {
    const serve = new Uint8Array(road.N), worseCum = new Float64Array(road.N), events = []; let s = 0, worse = 0;
    for (let k = 0; k < road.N; k++) {
      const mine = s ? road.b[k] : road.a[k], other = s ? road.a[k] : road.b[k];
      if (other > mine + hyst) { s ^= 1; events.push(k * HO.step); }
      serve[k] = s;
      const now = s ? road.b[k] : road.a[k], best = Math.max(road.a[k], road.b[k]);
      if (best - now > 3) worse += HO.step;   // metres driven while the other tower is more than 3 dB stronger
      worseCum[k] = worse;
    }
    return { serve, events, worseCum, count: events.length, worseM: worse };
  }

  /* ───────── 10 battery: open-circuit voltage minus I·R ─────────
   * Illustrative Li-ion OCV curve; R rises in the cold (Arrhenius form, assumed: ×4 at −20 °C).
   * The phone switches off when the terminal voltage falls below VCUT. The gauge reports the charge
   * that can still be delivered at the present load and temperature, as a share of what a full cell could. */
  const BAT = { capAh: 4, r25: 0.12, eaK: 2325, vcut: 3.3 };
  function ocv(q) { q = clamp(q, 0, 1); return 3.55 + 0.65 * Math.pow(q, 1.2) - 0.55 * Math.exp(-q / 0.03); }
  function rInt(tC) { return BAT.r25 * Math.exp(BAT.eaK * (1 / (tC + 273.15) - 1 / 298.15)); }
  // charge level below which the phone cuts off at this load
  function qCut(I, tC) {
    const need = BAT.vcut + I * rInt(tC);
    if (ocv(1) < need) return 1; if (ocv(0) >= need) return 0;
    let lo = 0, hi = 1; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (ocv(m) < need) lo = m; else hi = m; }
    return hi;
  }
  function battery(q, I, tC) {
    const R = rInt(tC), v = ocv(q) - I * R, qc = qCut(I, tC);
    const shown = qc >= 1 ? 0 : clamp((q - qc) / (1 - qc), 0, 1);
    return { ocv: ocv(q), drop: I * R, v, R, heat: I * I * R, qc, shown, off: v < BAT.vcut };
  }
  function batteryStep(q, I, dtHours) { return clamp(q - I * dtHours / BAT.capAh, 0, 1); }

  return {
    rng, gauss, poisson, clamp, C,
    R_E, A_GPS, GPS_SEED, gpsSats, gpsPseudoranges, gpsSolve, gpsMismatch, gpsFix, gpsRelativity,
    G0, accelReading, proofDisplacement, ACC_FS, driftInit, driftStep, driftBias, driftNoiseRms,
    TOUCH, touchSignals, touchEstimate, touchWorstError, touchNoiseRms,
    CAM, camScene, camGreyPixels, photonsPerPixel, camStackInit, camAddFrame, camMeasuredNoise, camTheoryNoise,
    CONE_PEAKS, cones, PRIMS, primSpectrum, PRIM_LMS, WHITE_W, swatchRGB, mixLMS, colourMatch, colourMismatch, mixPowerAt,
    IMG, makeImage, residuals, entropyBits, compressStats, noiseBitsTheory, MP12_MB,
    RADIO, KT_DBM_HZ, pathLoss, radioLink,
    hammingEncode, hammingDecode, blockErrUncoded, blockErrHamming, hammingCrossover, hammingTally,
    HO, handoverRoad, handoverTrip,
    BAT, ocv, rInt, qCut, battery, batteryStep
  };
});
