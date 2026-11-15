/* How power reaches the CPU: the page's models.
   A model chip (dynamic power C·V²·f per core plus a leakage current that grows with voltage and temperature; a V/f
   curve from the alpha-power law f ∝ (V − Vt)^α / V with a voltage floor); the 80 PLUS efficiency points of each tier
   (CLEAResult table, 115 V internal) turned into a loss curve L = a + bP + cP² through the 20/50/100 % points; a
   multiphase buck regulator (per-phase ripple ΔI = (Vin − Vo)·D/(L·fsw), the summed ripple of N phase-shifted phases
   both simulated and by TI SLVA882B eq. 2, and a per-phase loss budget); the power chain from the wall to the die;
   a power-delivery network (VRM with load line, bulk, MLCC, package and on-die capacitors) solved in time after a
   load step and in frequency as |Z(f)| against the target impedance Z = ΔV/ΔI; the energy of a fixed task at each
   frequency with the idle power after it (race to idle); a menu-style idle governor over the Skylake C-state table
   from the Linux intel_idle driver; and a thermal RC chain with Intel's PL1 / PL2 / Tau power limits (EWMA).
   Real-world figures sit in SRC / FRONTIER with their source and the date opened (also in BRIEF.md). Constants chosen
   for a model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.PowerCpuModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PowerCpuModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── sourced figures (BRIEF.md has URL and the date each was opened, 2026-11-15) ── */
  const SRC = {
    // CLEAResult, "80 PLUS PSU ratings explained", 115V Internal Non-Redundant, % efficiency at % of rated load
    plus80: {
      std: { 20: 80, 50: 80, 100: 80, pfc: 0.90 },
      bronze: { 20: 82, 50: 85, 100: 82, pfc: 0.90 },
      silver: { 20: 85, 50: 88, 100: 85, pfc: 0.90 },
      gold: { 20: 87, 50: 90, 100: 87, pfc: 0.90 },
      platinum: { 20: 90, 50: 92, 100: 89, pfc: 0.95 },
      titanium: { 10: 90, 20: 92, 50: 94, 100: 90, pfc: 0.95 },
      ruby: { 5: 85, 10: 91, 20: 93, 50: 95, 100: 91, pfc: 0.95 }
    },
    // Intel ATX Version 3 Multi Rail Desktop Power Supply Design Guide, rev 2.1a (Nov 2023, doc 336521):
    // Table 3-3 PSU power excursion (PSU > 450 W with a 12V-2x6 connector): % of rated power for a time;
    // §2.2.1: 12V-2x6 (PCIe CEM 5.1) needs 16 AWG and 9.2 A per pin; 600 W; Table 4-2 +12 V: +5 % / −7 % (11.20–12.60 V);
    // Table 2-1: 12V2 current for a 125 W TDP processor 26 A continuous (PL2, "sometimes close to 1 minute"), 39 A peak (PL4, 10 ms);
    // Table 4-14 required minimum efficiency 70 / 72 / 65 % at 100 / 50 / 20 % load (re-read by the reviewer 2026-11-15: full 70, typical 72, light 65)
    atx: { exc: [[200, 100e-6], [180, 1e-3], [160, 10e-3], [120, 0.1]], pinA: 9.2, pins: 6, awg: 16, conn: 600, v12lo: 11.20, v12hi: 12.60,
      cpu125: { cont: 26, peak: 39 }, cpu150: { cont: 33, peak: 60 }, req: { 100: 70, 50: 72, 20: 65 } },
    // Intel ark, Core i9-14900K (launched Q4'23): Processor Base Power 125 W, Maximum Turbo Power 253 W, Tj max 100 °C,
    // max turbo 6.0 GHz, 8 P-cores + 16 E-cores
    i9: { base: 125, turbo: 253, tj: 100, fmax: 6.0, p: 8, e: 16 },
    // Tom's Hardware (Intel 10th-gen datasheet revision): Core i9-10900K PL1 125 W, PL2 250 W, Tau 56 s
    tau10: { pl1: 125, pl2: 250, tau: 56 },
    // Intel Core Series 3 datasheet vol. 1, "Package Power Control": PL1 a threshold for average power ("recommend to set to equal
    // Processor Base Power"); PL2 rapid limit on spikes; Tau "an averaging constant used for PL1 exponential weighted moving average"
    // AMD (as reported by PCPer / TechPowerUp, May 2022): Ryzen 7000 TDP 170 W, PPT 230 W  (secondary)
    amd: { tdp: 170, ppt: 230 },
    // Burton et al., "FIVR", APEC 2014: 140 MHz multiphase buck, up to 16 phases, 8 to 31 FIVRs per die, first stage 12–20 V → ~1.8 V,
    // peak efficiency about 90 %, 31 A/mm², 2–3× peak power, 50 % or more battery life
    fivr: { mhz: 140, phases: 16, nLo: 8, nHi: 31, vin: 1.8, eff: 90, amm2: 31, year: 2013 },
    // Linux docs, schedutil: f_des = min(f_max, 1.25·u·f_max); PELT: the last 32 ms contribute half
    sched: { head: 1.25, pelt: 32 },
    // Linux drivers/idle/intel_idle.c, skl_cstates[]: [name, exit_latency µs, target_residency µs]
    skl: [['C1', 2, 2], ['C1E', 10, 20], ['C3', 70, 100], ['C6', 85, 200], ['C7s', 124, 800], ['C8', 200, 800], ['C9', 480, 5000], ['C10', 890, 5000]],
    // NVIDIA DGX B200 user guide: 8 B200 GPUs, 14.3 kW max, six 3.3 kW PSUs (5+1), up to 1000 W per GPU
    dgx: { gpus: 8, kw: 14.3, psu: 6, psuKw: 3.3, gpuW: 1000 },
    // AWG 18 copper: 20.95 mΩ/m (standard wire table); 8-pin EPS: four +12 V and four ground wires
    awg18: 0.02095
  };

  /* ── dated facts that will go stale (BRIEF.md "Facts that will go stale") ── */
  const FRONTIER = {
    asOf: '2026-11',
    // Intel newsroom 2023-06-05: PowerVia on test chip Blue Sky Creek (Intel 4 + 20A power), ">90% cell density", ">5% frequency improvement"
    powervia: { date: '2023-06-05', chip: 'Blue Sky Creek', util: 90, freq: 5 },
    // Intel dropped 20A in Sept 2024 (TechSpot / HotHardware); Panther Lake (Core Ultra series 3) on 18A, broad availability Jan 2026 (Intel, Oct 2025)
    pantherlake: { cancel20a: '2024-09', avail: '2026-01' },
    // TSMC A16 (The Register 2024-04-25, Technology Symposium; AnandTech 2024-04-24): Super Power Rail, 8–10 % speed over N2P; volume production in H2 2026 (claim)
    a16: { date: '2024-04', spd: [8, 10], prod: '2026-H2' },
    // Google Cloud blog 2016-03-09: joined OCP with a 48 V rack; 48 V "at least 30%" more energy efficient than 12 V (claim)
    google48: { date: '2016-03-09', gain: 30 },
    // OCP Open Rack V3 IT-gear input connector: 46.0–52.0 V DC busbar
    orv3: { lo: 46, hi: 52 },
    // NVIDIA developer blog 2025-05-20: 54 V in a 1 MW rack would need up to 200 kg of copper busbar; 800 V DC from 2027 with Kyber (claim)
    nv800: { date: '2025-05-20', kg: 200, v54: 54, v800: 800, mw: 1, year: 2027, more: 85, eff: 5 },
    // eeNews Europe 2025-03-10: Infineon TDM2454xx quad-phase module for vertical power delivery, 2 A/mm², up to 280 A
    infineon: { date: '2025-03-10', amm2: 2, amps: 280, phases: 4 }
  };

  /* ── seeded RNG (mulberry32) ── */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ── 02 the model chip (TUNED: a schematic 8-core desktop chip, not any product) ──
     fmax(V) = K·(V − Vt)^α / V  (alpha-power law, Sakurai & Newton 1990), K set so fmax(Vmax) = fTop; below the knee the
     voltage stays at Vmin. Dynamic power per core C·V²·f (activity folded into C). Leakage current
     I0·e^((V−1)/vS)·2^((T−50)/tD) per core, power V·I. */
  const CHIP = { cores: 8, vt: 0.30, alpha: 1.4, vmin: 0.70, vmax: 1.45, fTop: 6.0, c: 3.0e-9, i0: 1.0, vS: 0.5, tD: 30 };
  CHIP.K = CHIP.fTop * CHIP.vmax / Math.pow(CHIP.vmax - CHIP.vt, CHIP.alpha);
  const fAt = V => CHIP.K * Math.pow(Math.max(V - CHIP.vt, 0), CHIP.alpha) / V; // GHz
  const fKnee = fAt(CHIP.vmin);
  function vFor(f) { // smallest V in [vmin, vmax] that reaches f (GHz)
    if (f <= fKnee) return CHIP.vmin;
    let lo = CHIP.vmin, hi = CHIP.vmax; if (f >= CHIP.fTop) return CHIP.vmax;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (fAt(m) >= f) hi = m; else lo = m; }
    return hi;
  }
  // power of n active cores at f GHz and temperature T °C
  function power(f, T, n) {
    n = n == null ? CHIP.cores : n; T = T == null ? 80 : T;
    const V = vFor(f), dyn = n * CHIP.c * V * V * f * 1e9, leak = n * V * CHIP.i0 * Math.exp((V - 1) / CHIP.vS) * Math.pow(2, (T - 50) / CHIP.tD);
    return { f, V, dyn, leak, P: dyn + leak, I: (dyn + leak) / V };
  }
  // the highest frequency (on a 0.1 GHz grid) whose power at T fits under P
  function fForPower(P, T, n) { let best = 0.4; for (let f = 0.4; f <= CHIP.fTop + 1e-9; f += 0.1) { const ff = Math.round(f * 10) / 10; if (power(ff, T, n).P <= P) best = ff; } return best; }
  const PSTATES = [0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6];

  /* ── 03 PSU efficiency: per tier, loss L(x) = a + b·x + c·x² (x = load / rating) through the 20/50/100 % points ── */
  // the base 80 PLUS level (80 % at 20 / 50 / 100 %) has no point that pins the fixed loss, so a fit would show 80 % at
  // idle; it stays in SRC but gets no curve
  const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'titanium', 'ruby'];
  const PSU = {};
  for (const k of TIERS) {
    const p = SRC.plus80[k], L = x => x * (100 / p[x] - 1);
    const y1 = L(20) / 1, y2 = L(50), y3 = L(100), x1 = 20, x2 = 50, x3 = 100;
    // solve a + b x + c x² = y through three points (x in %), then rescale to fractions
    const d = (x1 - x2) * (x1 - x3) * (x2 - x3);
    const c = (x3 * (y2 - y1) + x2 * (y1 - y3) + x1 * (y3 - y2)) / d;
    const b = (x3 * x3 * (y1 - y2) + x2 * x2 * (y3 - y1) + x1 * x1 * (y2 - y3)) / d;
    const a = (x2 * x3 * (x2 - x3) * y1 + x3 * x1 * (x3 - x1) * y2 + x1 * x2 * (x1 - x2) * y3) / d;
    PSU[k] = { a: a / 100, b, c: c * 100 }; // loss as a fraction of rating, x as a fraction
  }
  function psuEff(tier, x) { const q = PSU[tier]; const L = q.a + q.b * x + q.c * x * x; return x / (x + Math.max(L, 1e-6)); }

  /* ── 04 the multiphase buck (TUNED loss constants, typical of smart power stages; Vin 12 V) ── */
  const VRM = { vin: 12, rPh: 1.5e-3, tsw: 3e-9, e0: 0.8e-6, ctrl: 0.5, ns: [1, 2, 4, 6, 8, 12, 16], fs: [300, 400, 500, 600, 800, 1000], ls: [100, 150, 220, 330, 470] };
  // TI SLVA882B eq. 2: summed (output-capacitor) ripple normalised to one phase's ripple; n = 1 gives 1
  function rippleNorm(n, D) { if (n === 1) return 1; const m = Math.floor(n * D + 1e-12); return n * (D - m / n) * ((m + 1) / n - D) / (D * (1 - D)); }
  // per-phase ripple (A pk-pk), L in nH, fsw in kHz
  function phaseRipple(vo, L, fsw, vin) { vin = vin || VRM.vin; const D = vo / vin; return (vin - vo) * D / (L * 1e-9 * fsw * 1e3); }
  // simulate N triangle currents, phase-shifted by T/N, over `periods`; returns the traces and the summed ripple
  function vrmWave(n, vo, L, fsw, Iout, opts) {
    opts = opts || {}; const vin = VRM.vin, D = vo / vin, T = 1 / (fsw * 1e3), dI = phaseRipple(vo, L, fsw), steps = opts.steps || 600, periods = opts.periods || 2;
    const tri = ph => { const u = ((ph % 1) + 1) % 1; return u < D ? -dI / 2 + dI * u / D : dI / 2 - dI * (u - D) / (1 - D); };
    const ts = [], phases = Array.from({ length: n }, () => []), sum = [];
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= steps; i++) {
      const u = periods * i / steps; ts.push(u * T * 1e6); let s = 0;
      for (let k = 0; k < n; k++) { const v = Iout / n + tri(u - k / n); phases[k].push(v); s += v; }
      sum.push(s); if (i > steps / periods) { lo = Math.min(lo, s); hi = Math.max(hi, s); }
    }
    return { ts, phases, sum, dI, ripple: hi - lo, D };
  }
  function vrmLoss(n, fsw, I, vo) {
    vo = vo || 1.2; const f = fsw * 1e3, iph = I / n, dI = phaseRipple(vo, 220, fsw);
    const cond = n * (iph * iph + dI * dI / 12) * VRM.rPh, sw = n * VRM.vin * iph * f * VRM.tsw, fix = n * VRM.e0 * f + VRM.ctrl;
    const out = vo * I; return { cond, sw, fix, loss: cond + sw + fix, eff: out / (out + cond + sw + fix) };
  }
  function vrm(n, fsw, L, I, vo) {
    vo = vo || 1.2; const D = vo / VRM.vin, dI = phaseRipple(vo, L, fsw), k = rippleNorm(n, D), ls = vrmLoss(n, fsw, I, vo);
    return { n, fsw, L, I, D, dI, k, sumRipple: dI * k, perPhase: I / n, ...ls };
  }

  /* ── 01 the chain from the wall to the die ──
     CPU package power P → (model chip) f and V → core current I; package/socket I²R (TUNED 0.25 mΩ); VRM (12 phases,
     500 kHz); EPS cable I²R (4 + 4 wires of 18 AWG, 0.6 m TUNED); the rest of the PC on the same PSU (TUNED 80 W);
     PSU at its load fraction; mains 220 V with the tier's power factor floor. */
  const CHAIN = { rPkg: 0.25e-3, cableM: 0.6, rest: 80, mains: 220, nPh: 12, fsw: 500, T: 80, rated: [550, 750, 850, 1000, 1200, 1600], cpu: [65, 125, 180, 253, 300] };
  CHAIN.rCable = 2 * SRC.awg18 * CHAIN.cableM / 4; // out and back, four wires each way
  function chain(P, tier, rated) {
    const f = fForPower(P, CHAIN.T), V = vFor(f), I = P / V;
    const pkg = I * I * CHAIN.rPkg, vOut = P + pkg, v = vrm(CHAIN.nPh, CHAIN.fsw, 220, vOut / V, V);
    const vIn = vOut / v.eff, i12 = vIn / 12, cable = i12 * i12 * CHAIN.rCable, dc = vIn + cable + CHAIN.rest;
    const x = dc / rated, eta = psuEff(tier, x), wall = dc / eta, psuLoss = wall - dc;
    const stages = [['wall', wall, wall / CHAIN.mains / SRC.plus80[tier].pfc, CHAIN.mains], ['psu', psuLoss, i12, 12], ['cable', cable, i12, 12], ['vrm', vIn - vOut, I, V], ['pkg', pkg, I, V]];
    return { P, f, V, I, pkg, vrmEff: v.eff, vrmLoss: vIn - vOut, vIn, i12, cable, dc, x, eta, wall, psuLoss, iWall: wall / CHAIN.mains / SRC.plus80[tier].pfc,
      cpuShare: P / wall, heatPath: psuLoss + cable + (vIn - vOut) + pkg, stages };
  }

  /* ── 05 the power-delivery network: a ladder from the VRM to the die (TUNED values, typical orders of magnitude) ──
     Branches (series R, L) and shunts (C with ESR, ESL). Loads step at the die. */
  const PDN = {
    vid: 1.25, lVrm: 0.8e-9, // VRM output: ideal source + load-line R + inductance for its finite control bandwidth (~200 kHz)
    rPlane: 0.10e-3, lPlane: 0.10e-9,
    bulk: { c: 5.6e-3, r: 0.6e-3, l: 0.12e-9 }, // ten 560 µF polymer capacitors
    mlcc: { c: 660e-6, r: 0.10e-3, l: 0.020e-9 }, // thirty 22 µF ceramics under the socket
    rSock: 0.10e-3, lSock: 0.025e-9,
    pkgc: { c: 20e-6, r: 0.50e-3, l: 0.005e-9 }, // land-side and die-side package capacitors
    rBump: 0.03e-3, lBump: 0.003e-9,
    die: { c: 2e-6, r: 0.30e-3 }, // on-die decoupling (gate and MIM capacitance)
    i0: 20, rise: 10e-9, riseFast: 2e-9, lls: [0, 0.5, 1.0, 1.5], dIs: [50, 100, 150, 200]
  };
  // State: inductor currents iV (VRM + plane), iB, iM (capacitor branches' ESL), iS (socket and package path), iP, iU (bumps);
  // capacitor voltages vB, vM, vPc, vD; two tiny node capacitances (10 nF, TUNED, far below every real capacitor) hold
  // node B (board, under the socket) and node P (package) so every element stays an ordinary ODE. Semi-implicit Euler.
  function pdnStep(o) {
    o = Object.assign({ ll: 1.0e-3, dI: 100, mlcc: true, pkgc: true, dieScale: 1, tEnd: 60e-6, dt: 0.1e-9, rise: null }, o || {});
    const P = PDN, dt = o.dt, n = Math.round(o.tEnd / dt), cn = 10e-9;
    const mOn = o.mlcc ? 1 : 0, pOn = o.pkgc ? 1 : 0, cDie = P.die.c * o.dieScale;
    const rise = o.rise || P.rise, load = t => P.i0 + o.dI * Math.min(1, Math.max(0, (t - 2e-6) / rise));
    const rTot = o.ll + P.rPlane + P.rSock + P.rBump;
    const v0 = P.vid - rTot * P.i0;
    let iV = P.i0, iS = P.i0, iU = P.i0, iB = 0, iM = 0, iP = 0;
    let nB = P.vid - (o.ll + P.rPlane) * P.i0, vB = nB, vM = nB, nP = nB - P.rSock * P.i0, vPc = nP, vD = nP - P.rBump * P.i0;
    const out = { t: [], v: [], log: [[1e-3, v0]], vmin: Infinity, tmin: 0 }, every = Math.max(1, Math.round(n / 1500));
    let nextLog = -3; // log-spaced samples after the step (time since the step in µs, 40 per decade) for a log-time plot
    for (let s = 0; s <= n; s++) {
      const t = s * dt, iL = load(t);
      iV += (P.vid - (o.ll + P.rPlane) * iV - nB) / (P.lVrm + P.lPlane) * dt;
      iB += (nB - vB - P.bulk.r * iB) / P.bulk.l * dt;
      if (mOn) iM += (nB - vM - P.mlcc.r * iM) / P.mlcc.l * dt;
      iS += (nB - P.rSock * iS - nP) / P.lSock * dt;
      if (pOn) iP += (nP - vPc - P.pkgc.r * iP) / P.pkgc.l * dt;
      const vDie0 = vD + P.die.r * (iU - iL);
      iU += (nP - P.rBump * iU - vDie0) / P.lBump * dt;
      vB += iB / P.bulk.c * dt; if (mOn) vM += iM / P.mlcc.c * dt; if (pOn) vPc += iP / P.pkgc.c * dt;
      nB += (iV - iB - iM * mOn - iS) / cn * dt; nP += (iS - iP * pOn - iU) / cn * dt;
      vD += (iU - iL) / cDie * dt;
      const vDie = Math.max(0, vD + P.die.r * (iU - iL)); // a linear network can swing below zero; a real chip has long since crashed, so the trace stops at 0 V
      if (s % every === 0) { out.t.push(t * 1e6); out.v.push(vDie); }
      const ts = (t - 2e-6) * 1e6; if (ts > 0 && Math.log10(ts) >= nextLog) { out.log.push([ts, vDie]); nextLog = Math.log10(ts) + 0.025; }
      if (vDie < out.vmin) { out.vmin = vDie; out.tmin = t * 1e6; }
    }
    out.v0 = v0; out.vEnd = out.v[out.v.length - 1]; out.vFinal = P.vid - rTot * (P.i0 + o.dI);
    out.droop = v0 - out.vmin; out.static = v0 - out.vFinal; out.over = out.vFinal - out.vmin;
    return out;
  }
  // |Z(f)| seen from the die with the source shorted (complex ladder)
  function cx(re, im) { return { re, im }; }
  const add = (a, b) => cx(a.re + b.re, a.im + b.im), mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const inv = a => { const d = a.re * a.re + a.im * a.im; return cx(a.re / d, -a.im / d); }, par = (a, b) => inv(add(inv(a), inv(b)));
  const absC = a => Math.hypot(a.re, a.im);
  function pdnZ(f, o) {
    o = Object.assign({ ll: 1.0e-3, mlcc: true, pkgc: true, dieScale: 1 }, o || {}); const P = PDN, w = 2 * Math.PI * f;
    const zRL = (r, l) => cx(r, w * l), zC = (c, r, l) => cx(r, w * (l || 0) - 1 / (w * c));
    let z = zRL(o.ll + P.rPlane, P.lVrm + P.lPlane);
    z = par(z, zC(P.bulk.c, P.bulk.r, P.bulk.l)); if (o.mlcc) z = par(z, zC(P.mlcc.c, P.mlcc.r, P.mlcc.l));
    z = add(z, zRL(P.rSock, P.lSock)); if (o.pkgc) z = par(z, zC(P.pkgc.c, P.pkgc.r, P.pkgc.l));
    z = add(z, zRL(P.rBump, P.lBump)); z = par(z, zC(P.die.c * o.dieScale, P.die.r, 0));
    return absC(z);
  }
  function pdnSweep(o) { const pts = []; let pk = 0, fpk = 0; for (let e = 3; e <= 9.0001; e += 0.02) { const f = Math.pow(10, e), z = pdnZ(f, o); pts.push([e, z]); if (f > 2e4 && z > pk) { pk = z; fpk = f; } } return { pts, peak: pk, fPeak: fpk }; }
  const zTarget = (v, ripple, dI) => v * ripple / dI;
  // with a load line the target is the load line itself (flat |Z| = R_LL); without one, 5 % of VID over the step
  const zGoal = (ll, dI) => (ll > 0 ? ll : zTarget(PDN.vid, 0.05, dI));

  /* ── 07 the energy of a fixed task: run at f, then idle until the window ends ── */
  const RACE = { window: 1.0, T: 60, works: [0.5, 1, 1.5, 2, 2.5, 3, 4], plats: [0, 2, 4, 6, 8, 10],
    idle: { c1: 'c1', c6: 'c6' }, pC6: 0.02 }; // TUNED: a power-gated core keeps 0.02 W
  function idlePower(kind) { return kind === 'c6' ? RACE.pC6 : power(fKnee, RACE.T, 1).leak; } // C1: clock stopped, voltage kept at the floor
  function raceEnergy(f, work, kind, plat) { // work in 10⁹ cycles, f GHz, one core; platform power while the core runs
    const t = work / f; if (t > RACE.window + 1e-9) return null;
    const p = power(f, RACE.T, 1), run = (p.P + plat) * t, idle = idlePower(kind) * (RACE.window - t);
    return { f, t, run, idle, E: run + idle, V: p.V };
  }
  function raceSweep(work, kind, plat) {
    const pts = []; let best = null;
    for (let f = 0.4; f <= CHIP.fTop + 1e-9; f += 0.1) { const ff = Math.round(f * 10) / 10, r = raceEnergy(ff, work, kind, plat); if (!r) continue; pts.push(r); if (!best || r.E < best.E - 1e-12) best = r; }
    return { pts, best, slow: pts[0], fast: pts[pts.length - 1] };
  }
  const schedutil = (u, fmax) => Math.min(fmax, SRC.sched.head * u * fmax);

  /* ── 08 idle states: a menu-style governor over skl_cstates (TUNED per-state power per core, W) ── */
  const CST = { pw: { C1: 1.2, C1E: 0.8, C3: 0.35, C6: 0.08, C7s: 0.06, C8: 0.045, C9: 0.03, C10: 0.02 }, pWake: 2.5, means: [20, 50, 100, 300, 1000, 3000, 10000], lat: [0, 20, 50, 100, 200, 1000], n: 3000 };
  function idleTrace(mean, seed) { const r = rng(seed || 7), out = []; for (let i = 0; i < CST.n; i++) { const u = r(); out.push(Math.max(1, -Math.log(1 - u) * mean)); } return out; }
  function cstate(mean, policy, maxLat) {
    const states = SRC.skl.filter(s => maxLat == null || maxLat === 0 || s[1] <= maxLat), tr = idleTrace(mean);
    let E = 0, Ec1 = 0, T = 0, lat = 0, miss = 0; const hist = {}; states.forEach(s => { hist[s[0]] = 0; });
    const hx = [];
    tr.forEach((t, i) => {
      let pred;
      if (policy === 'oracle') pred = t; else if (policy === 'c1') pred = 0; else { const h = hx.slice(-8); pred = h.length ? h.reduce((a, b) => a + b, 0) / h.length : mean; }
      let s = states[0]; for (const st of states) if (st[2] <= pred) s = st;
      const [nm, ex, res] = s, p = CST.pw[nm];
      const e = t > ex ? p * (t - ex) + CST.pWake * ex : CST.pWake * t;
      E += e; Ec1 += CST.pw.C1 * t; T += t; lat += ex; if (t < res) miss++; hist[nm]++; hx.push(t);
    });
    return { mean, policy, pAvg: E / T, pC1: Ec1 / T, saved: 1 - E / Ec1, lat: lat / tr.length, miss: miss / tr.length, hist, n: tr.length };
  }

  /* ── 09 heat: RC chain die → IHS → cooler → air, with PL1 / PL2 / Tau and Tj max (TUNED thermal values) ── */
  const TH = { amb: 25, cj: 4, rjc: 0.12, cc: 40, rch: 0.05, ch: 300, ras: [0.08, 0.10, 0.12, 0.15, 0.20, 0.25, 0.30], tj: SRC.i9.tj, idle: 20, tStart: 5, tEnd: 200, dt: 0.05,
    presets: { intel: [125, 253, 56], unlim: [253, 253, 56], low: [65, 125, 28], amd: [230, 230, 1] } };
  function thermal(o) {
    o = Object.assign({ pl1: 125, pl2: 253, tau: 56, ra: 0.15, steps: null }, o || {});
    const H = TH, dt = H.dt, n = Math.round(H.tEnd / dt);
    let tj = H.amb + H.idle * (H.rjc + H.rch + o.ra), tc = H.amb + H.idle * (H.rch + o.ra), th = H.amb + H.idle * o.ra, ewma = H.idle, cap = CHIP.fTop;
    const out = { t: [], P: [], f: [], tj: [], pl2End: null, firstHot: null, hotTime: 0 };
    for (let s = 0; s <= n; s++) {
      const t = s * dt, busy = t >= H.tStart;
      let P = H.idle, f = 0;
      if (busy) {
        const lim = ewma < o.pl1 - 1e-9 ? o.pl2 : o.pl1;
        if (tj >= H.tj) cap = Math.max(0.8, Math.round((cap - 0.1) * 10) / 10); else if (tj < H.tj - 1) cap = Math.min(CHIP.fTop, Math.round((cap + 0.1) * 10) / 10);
        f = Math.min(fForPowerFast(lim, tj), cap); P = power(f, tj).P;
        if (out.pl2End == null && lim === o.pl1 && o.pl1 < o.pl2) out.pl2End = t - H.tStart;
        if (tj >= H.tj) { if (out.firstHot == null) out.firstHot = t - H.tStart; out.hotTime += dt; }
      }
      ewma += (P - ewma) * dt / Math.max(o.tau, dt);
      const qjc = (tj - tc) / H.rjc, qch = (tc - th) / H.rch, qha = (th - H.amb) / o.ra;
      tj += (P - qjc) / H.cj * dt; tc += (qjc - qch) / H.cc * dt; th += (qch - qha) / H.ch * dt;
      if (s % 4 === 0) { out.t.push(t); out.P.push(P); out.f.push(f); out.tj.push(tj); }
    }
    const last = k => out[k][out[k].length - 1];
    out.fEnd = last('f'); out.pEnd = last('P'); out.tjEnd = last('tj'); out.tjMax = Math.max(...out.tj);
    out.fPeak = Math.max(...out.f); out.thermalLimited = out.hotTime > 0;
    out.tjSteady = H.amb + out.pEnd * (H.rjc + H.rch + o.ra);
    return out;
  }
  // power is monotonic in f: binary search on the 0.1 GHz grid
  function fForPowerFast(P, T) { let lo = 4, hi = Math.round(CHIP.fTop * 10); if (power(lo / 10, T).P > P) return lo / 10; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (power(m / 10, T).P <= P) lo = m; else hi = m - 1; } return lo / 10; }
  // time at PL2 from idle, closed form of the EWMA: PL1 = PL2 − (PL2 − idle)·e^(−t/τ)
  const boostTime = (pl1, pl2, tau, idle) => (pl2 <= pl1 ? Infinity : tau * Math.log((pl2 - idle) / (pl2 - pl1)));

  /* ── 10 distribution at rack scale ── */
  const amps = (P, V) => P / V;
  const lossRatio = (v1, v2) => (v2 / v1) * (v2 / v1); // same conductor, same power: loss ∝ 1/V²

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  let PROSE_CACHE = null;
  function prose() {
    if (PROSE_CACHE) return PROSE_CACHE;
    const c253 = chain(253, 'gold', 850), c125 = chain(125, 'gold', 850), c65 = chain(65, 'gold', 850), c253t = chain(253, 'titanium', 850);
    const p56 = power(5.6, 80), p48 = power(4.8, 80), p24 = power(2.4, 80), p40 = power(4.0, 80), p12 = power(1.2, 80);
    const v1 = vrm(1, 500, 220, 200), v12 = vrm(12, 500, 220, 200), v6 = vrm(6, 500, 220, 200), v12f = vrm(12, 1000, 220, 200), v12l = vrm(12, 500, 220, 30);
    const s0 = pdnStep({ ll: 1.0e-3 }), sNoM = pdnStep({ ll: 1.0e-3, mlcc: false }), sLL0 = pdnStep({ ll: 0 }), sNoP = pdnStep({ ll: 1.0e-3, pkgc: false }), sFast = pdnStep({ ll: 1.0e-3, rise: PDN.riseFast });
    const z0 = pdnSweep({ ll: 1.0e-3 }), zNoP = pdnSweep({ ll: 1.0e-3, pkgc: false });
    const rC6 = raceSweep(1, 'c6', 0), rC1 = raceSweep(1, 'c1', 0), rC6p = raceSweep(1, 'c6', 6);
    const cMenu = cstate(300, 'menu', 0), cOr = cstate(300, 'oracle', 0), cC1 = cstate(300, 'c1', 0), cMenu20 = cstate(20, 'menu', 0), cLat = cstate(3000, 'menu', 100), cDeep = cstate(3000, 'menu', 0);
    const th15 = thermal({ ra: 0.15 }), th08 = thermal({ ra: 0.08 }), thU = thermal({ pl1: 253, pl2: 253, ra: 0.20 }), thU08 = thermal({ pl1: 253, pl2: 253, ra: 0.08 });
    const F = FRONTIER, A = SRC.atx;
    PROSE_CACHE = {
      // ch1
      c253V: [c253.V, 2], c253I: [c253.I, 0], c253f: [c253.f, 1], c253i12: [c253.i12, 1], c253wall: [c253.wall, 0], c253iw: [c253.iWall, 2], c253share: [c253.cpuShare, 0, 'pct'],
      c253heat: [c253.heatPath, 0], c253vrm: [c253.vrmLoss, 1], c253psu: [c253.psuLoss, 1], c253pkg: [c253.pkg, 1], c253cab: [c253.cable, 1], c253vrmEff: [c253.vrmEff, 1, 'pct'],
      c125I: [c125.I, 0], c125V: [c125.V, 2], c65I: [c65.I, 0], c253tWall: [c253t.wall, 0], restW: [CHAIN.rest, 0], rPkg: [CHAIN.rPkg * 1e3, 2], cableM: [CHAIN.cableM, 1],
      atx125c: [A.cpu125.cont, 0], atx125p: [A.cpu125.peak, 0],
      // ch2
      fKnee: [fKnee, 1], vmin: [CHIP.vmin, 2], vmax: [CHIP.vmax, 2], fTop: [CHIP.fTop, 1],
      p56: [p56.P, 0], p48: [p48.P, 0], p40: [p40.P, 0], p24: [p24.P, 0], v56: [p56.V, 2], v48: [p48.V, 2],
      r5648f: [5.6 / 4.8, 2], r5648p: [p56.P / p48.P, 2], leak56: [p56.leak / p56.P, 0, 'pct'], leak24: [p24.leak / p24.P, 0, 'pct'], r2412p: [p24.P / p12.P, 2],
      // ch3
      gold5: [psuEff('gold', 0.05), 0, 'pct'], gold10: [psuEff('gold', 0.10), 0, 'pct'], gold50: [psuEff('gold', 0.5), 0, 'pct'], goldIdle: [psuEff('gold', 60 / 850), 0, 'pct'], c253x: [c253.x, 0, 'pct'], ti10fit: [psuEff('titanium', 0.10), 1, 'pct'],
      excA: [A.exc[0][0], 0], excT: [A.exc[0][1] * 1e6, 0], exc2: [A.exc[1][0], 0], exc3: [A.exc[2][0], 0], exc4: [A.exc[3][0], 0],
      pinA: [A.pinA, 1], pins: [A.pins, 0], connW: [A.conn, 0], pinW: [A.pinA * A.pins * 12, 0], awg: [A.awg, 0], v12lo: [A.v12lo, 2], v12hi: [A.v12hi, 2],
      // ch4
      v1dI: [v1.dI, 1], v1D: [v1.D, 2], v12ph: [v12.perPhase, 1], v12sum: [v12.sumRipple, 2], v12k: [v12.k, 3], v12eff: [v12.eff, 1, 'pct'], v6eff: [v6.eff, 1, 'pct'], v12feff: [v12f.eff, 1, 'pct'], v12leff: [v12l.eff, 1, 'pct'], v1eff: [v1.eff, 1, 'pct'],
      v12loss: [v12.loss, 1], v1loss: [v1.loss, 0],
      // ch5
      sV0: [s0.v0, 3], sDroop: [s0.droop * 1000, 0], sStatic: [s0.static * 1000, 0], sOver: [s0.over * 1000, 0], sNoM: [sNoM.droop * 1000, 0], sLL0: [sLL0.droop * 1000, 0], sLL0s: [sLL0.static * 1000, 0], sNoP: [sNoP.droop * 1000, 0], sFast: [sFast.droop * 1000, 0], riseFast: [PDN.riseFast * 1e9, 0],
      zT: [zTarget(PDN.vid, 0.05, 100) * 1000, 3], zPk: [z0.peak * 1000, 2], zPkF: [z0.fPeak / 1e6, 0], zNoP: [zNoP.peak * 1000, 2], zNoPF: [zNoP.fPeak / 1e6, 0], dIdef: [100, 0], llDef: [1.0, 1],
      // ch6
      fvMhz: [SRC.fivr.mhz, 0], fvPh: [SRC.fivr.phases, 0], fvLo: [SRC.fivr.nLo, 0], fvHi: [SRC.fivr.nHi, 0], fvVin: [SRC.fivr.vin, 1], fvEff: [SRC.fivr.eff, 0], fvAmm: [SRC.fivr.amm2, 0],
      // ch7
      rC6best: [rC6.best.f, 1], rC6slow: [rC6.slow.E, 2], rC6fast: [rC6.fast.E, 2], rC6E: [rC6.best.E, 2], rC1slow: [rC1.slow.E, 2], rC1fast: [rC1.fast.E, 2], rC6pbest: [rC6p.best.f, 1], rC1knee: [raceEnergy(fKnee, 1, 'c1', 0).E, 2],
      shU: [0.4, 0, 'pct'], shF: [schedutil(0.4, 5.6), 1], shMax: [5.6, 1], shHead: [SRC.sched.head, 2], pelt: [SRC.sched.pelt, 0],
      // ch8
      cMenuSave: [cMenu.saved, 0, 'pct'], cOrSave: [cOr.saved, 0, 'pct'], cMenuLat: [cMenu.lat, 0], cMenuMiss: [cMenu.miss, 0, 'pct'], cMenu20Save: [cMenu20.saved, 0, 'pct'], cLatSave: [cLat.saved, 0, 'pct'], cDeepSave: [cDeep.saved, 0, 'pct'], cDeepLat: [cDeep.lat, 0],
      // ch9
      tau10: [SRC.tau10.tau, 0], boost: [boostTime(125, 253, 56, TH.idle), 0], tjMax: [TH.tj, 0], th15pl2: [th15.pl2End, 0], th15f: [th15.fEnd, 1], th15tj: [th15.tjEnd, 0], th15peak: [th15.fPeak, 1],
      thUhot: [thU.firstHot, 0], thUf: [thU.fEnd, 1], thU08f: [thU08.fEnd, 1], th08f: [th08.fEnd, 1], ra15: [0.15, 2], ra20: [0.20, 2], ra08: [0.08, 2], rTot15: [TH.rjc + TH.rch + 0.15, 2], dT253: [253 * (TH.rjc + TH.rch + 0.15), 0], rjc: [TH.rjc, 2], rch: [TH.rch, 2], idleW: [TH.idle, 0],
      thAmb: [TH.amb, 0], thD1: [253 * TH.rjc, 0], thD2: [253 * TH.rch, 0], thD3: [253 * 0.15, 0],
      // ch10
      dgxKw: [SRC.dgx.kw, 1], dgxN: [SRC.dgx.gpus, 0], gpuW: [SRC.dgx.gpuW, 0], a12: [amps(1000, 12), 0], a48: [amps(1000, 48), 1], lr: [lossRatio(12, 48), 0], mwA: [amps(1e6, 54) / 1000, 1], mw800: [amps(1e6, 800), 0], cu: [F.nv800.kg, 0], g48: [F.google48.gain, 0], nv85: [F.nv800.more, 0], nv5: [F.nv800.eff, 0], nvYear: [F.nv800.year, 0],
      // ch11
      pvUtil: [F.powervia.util, 0], pvFreq: [F.powervia.freq, 0], ifAmm: [F.infineon.amm2, 0], ifAmp: [F.infineon.amps, 0], a16lo: [F.a16.spd[0], 0], a16hi: [F.a16.spd[1], 0],
      // ch12
      uv: [1 - 0.95 * 0.95, 0, 'pct']
    };
    return PROSE_CACHE;
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s, useGrouping: Math.abs(x) >= 10000 });
  }
  function fmtKind(v, kind) { if (kind === 'str') return String(v); return null; }

  /* ── live sentences: each returns { key } ── */
  const say = {
    chain(r) { return { key: r.x > 0.7 ? 'ch1.say.full' : r.x < 0.2 ? 'ch1.say.light' : r.P >= 200 ? 'ch1.say.big' : 'ch1.say.mid' }; },
    power(f) { return { key: f <= fKnee + 1e-9 ? 'ch2.say.floor' : f >= 5.0 ? 'ch2.say.top' : 'ch2.say.mid' }; },
    psu(x) { return { key: x < 0.1 ? 'ch3.say.idle' : x > 1 ? 'ch3.say.over' : x >= 0.35 && x <= 0.7 ? 'ch3.say.sweet' : 'ch3.say.ok' }; },
    vrm(r) { if (r.n === 1) return { key: 'ch4.say.one' }; if (r.perPhase > 40) return { key: 'ch4.say.hot' }; return { key: 'ch4.say.ok' }; },
    pdn(r, o) { if (!o.mlcc || !o.pkgc) return { key: 'ch5.say.missing' }; if (o.ll === 0) return { key: 'ch5.say.noll' }; if (r.over > 0.004) return { key: 'ch5.say.dip' }; return { key: 'ch5.say.ok' }; },
    race(s, kind) { return { key: kind === 'c1' ? 'ch7.say.c1' : s.best.f <= s.slow.f + 1e-9 ? 'ch7.say.slow' : 'ch7.say.knee' }; },
    cstate(r) { if (r.policy === 'c1') return { key: 'ch8.say.c1' }; if (r.mean <= 50) return { key: 'ch8.say.short' }; if (r.policy === 'oracle') return { key: 'ch8.say.oracle' }; return { key: r.miss > 0.2 ? 'ch8.say.miss' : 'ch8.say.menu' }; },
    thermal(r, o) { if (r.thermalLimited) return { key: 'ch9.say.hotU' }; /* only without a power limit: at PL1 125 W even 0.30 K/W stays under Tj max */ if (o.pl1 >= o.pl2) return { key: 'ch9.say.flat' }; return { key: 'ch9.say.ok' }; }
  };

  return { SRC, FRONTIER, rng, CHIP, fAt, fKnee, vFor, power, fForPower, fForPowerFast, PSTATES, TIERS, PSU, psuEff, VRM, rippleNorm, phaseRipple, vrmWave, vrmLoss, vrm,
    CHAIN, chain, PDN, pdnStep, pdnZ, pdnSweep, zTarget, zGoal, RACE, idlePower, raceEnergy, raceSweep, schedutil, CST, idleTrace, cstate, TH, thermal, boostTime, amps, lossRatio,
    prose, fmt, fmtKind, say };
});
