'use strict';
// Action potential model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Hodgkin–Huxley (1952) squid giant axon, standard rate functions at 6.3 °C, resting potential ≈ −65 mV.
// Units: V in mV, t in ms, conductance in mS/cm², current density in µA/cm², capacitance 1 µF/cm².
// Pure functions shared by the page (window.AP_MODEL) and node tests (module.exports).
(function (root) {

const HH = { gNa: 120, gK: 36, gL: 0.3, ENa: 50, EK: -77, EL: -54.387, Cm: 1 };

// rate functions (per ms); the removable singularities are filled with their limits
const vtrap = (x, y) => (Math.abs(x / y) < 1e-6 ? y * (1 - x / y / 2) : x / (Math.exp(x / y) - 1));
const an = V => 0.01 * vtrap(-(V + 55), 10);
const bn = V => 0.125 * Math.exp(-(V + 65) / 80);
const am = V => 0.1 * vtrap(-(V + 40), 10);
const bm = V => 4 * Math.exp(-(V + 65) / 18);
const ah = V => 0.07 * Math.exp(-(V + 65) / 20);
const bh = V => 1 / (1 + Math.exp(-(V + 35) / 10));
const inf = (a, b) => V => a(V) / (a(V) + b(V));
const nInf = inf(an, bn), mInf = inf(am, bm), hInf = inf(ah, bh);

const gNaOf = s => HH.gNa * s.m * s.m * s.m * s.h;
const gKOf = s => HH.gK * s.n * s.n * s.n * s.n;
// the voltage the membrane is being pulled toward: a conductance-weighted average of the reversal potentials
const target = (gNa, gK, gL = HH.gL) => (gNa * HH.ENa + gK * HH.EK + gL * HH.EL) / (gNa + gK + gL);

function deriv(s, I) {
  const gna = gNaOf(s), gk = gKOf(s);
  const Iion = gna * (s.V - HH.ENa) + gk * (s.V - HH.EK) + HH.gL * (s.V - HH.EL);
  return {
    V: (I - Iion) / HH.Cm,
    m: am(s.V) * (1 - s.m) - bm(s.V) * s.m,
    h: ah(s.V) * (1 - s.h) - bh(s.V) * s.h,
    n: an(s.V) * (1 - s.n) - bn(s.V) * s.n
  };
}
const add = (s, d, k) => ({ V: s.V + k * d.V, m: s.m + k * d.m, h: s.h + k * d.h, n: s.n + k * d.n });

// exact resting state: solve V = target(gates at their steady values) by bisection
function restState() {
  const f = V => { const s = { V, m: mInf(V), h: hInf(V), n: nInf(V) }; return target(gNaOf(s), gKOf(s)) - V; };
  let lo = -80, hi = -50;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; }
  const V = (lo + hi) / 2;
  return { V, m: mInf(V), h: hInf(V), n: nInf(V) };
}
const REST = restState();

// stimulus: function of t returning µA/cm²; RK4 with step dt; records every `every` steps
function simulate(stim, T, dt = 0.01, every = 2, s0 = REST) {
  let s = { ...s0 };
  const n = Math.round(T / dt), out = { t: [0], V: [s.V], gNa: [gNaOf(s)], gK: [gKOf(s)], m: [s.m], h: [s.h], n: [s.n] };
  for (let i = 0; i < n; i++) {
    const t = i * dt, I0 = stim(t), I1 = stim(t + dt / 2), I2 = stim(t + dt);
    const k1 = deriv(s, I0), k2 = deriv(add(s, k1, dt / 2), I1), k3 = deriv(add(s, k2, dt / 2), I1), k4 = deriv(add(s, k3, dt), I2);
    s = { V: s.V + dt / 6 * (k1.V + 2 * k2.V + 2 * k3.V + k4.V), m: s.m + dt / 6 * (k1.m + 2 * k2.m + 2 * k3.m + k4.m), h: s.h + dt / 6 * (k1.h + 2 * k2.h + 2 * k3.h + k4.h), n: s.n + dt / 6 * (k1.n + 2 * k2.n + 2 * k3.n + k4.n) };
    if ((i + 1) % every === 0) { out.t.push((i + 1) * dt); out.V.push(s.V); out.gNa.push(gNaOf(s)); out.gK.push(gKOf(s)); out.m.push(s.m); out.h.push(s.h); out.n.push(s.n); }
  }
  return out;
}
const pulse = (amp, t0 = 1, w = 1) => t => (t >= t0 && t < t0 + w ? amp : 0);
const peak = (r, from = 0, to = Infinity) => { let best = -Infinity, at = 0; r.t.forEach((t, i) => { if (t >= from && t <= to && r.V[i] > best) { best = r.V[i]; at = t; } }); return { V: best, t: at }; };
const SPIKE_MV = 0; // a response counts as an action potential when V crosses 0 mV

/* ---------- step 1: one 1-ms pulse ---------- */
const P1 = { t0: 1, w: 1, T: 20 };
const single = amp => simulate(pulse(amp, P1.t0, P1.w), P1.T);
function threshold1(dt = 0.01) {
  let lo = 0, hi = 30;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (peak(simulate(pulse(mid, P1.t0, P1.w), P1.T, dt, 10)).V > SPIKE_MV) hi = mid; else lo = mid; }
  return hi;
}

/* ---------- step 3: refractoriness — a second pulse Δt after the first ---------- */
const P3 = { amp1: 10, w: 1, t0: 1, T: 40 };
const pair = (dtGap, amp2) => t => (t >= P3.t0 && t < P3.t0 + P3.w ? P3.amp1 : t >= P3.t0 + dtGap && t < P3.t0 + dtGap + P3.w ? amp2 : 0);
function fires2(dtGap, amp2, dt = 0.02) {
  const r = simulate(pair(dtGap, amp2), P3.t0 + dtGap + 12, dt, 5);
  return peak(r, P3.t0 + dtGap, Infinity).V > SPIKE_MV && secondRise(r, P3.t0 + dtGap);
}
// the second response must be a fresh upstroke: V must have been below −40 mV when the second pulse started
function secondRise(r, t2) { const i = r.t.findIndex(t => t >= t2); return i >= 0 && r.V[i] < -40; }
const AMP2_MAX = 200;
function threshold2(dtGap, dt = 0.02) {
  if (!fires2(dtGap, AMP2_MAX, dt)) return Infinity;
  let lo = 0, hi = AMP2_MAX;
  for (let i = 0; i < 16; i++) { const mid = (lo + hi) / 2; if (fires2(dtGap, mid, dt)) hi = mid; else lo = mid; }
  return hi;
}

// absolute refractory period: the largest gap at which even AMP2_MAX cannot fire a second spike
function absRefractory(dt = 0.02) {
  let lo = 2, hi = 25;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (fires2(mid, AMP2_MAX, dt)) hi = mid; else lo = mid; }
  return lo;
}

/* ---------- step 4: steady current → spike train ---------- */
const P4 = { T: 250, w0: 50 }; // count spikes in [50, 250] ms → rate over 200 ms
function spikeTimes(r) { const out = []; for (let i = 1; i < r.V.length; i++) if (r.V[i - 1] < SPIKE_MV && r.V[i] >= SPIKE_MV) out.push(r.t[i]); return out; }
function train(I, dt = 0.02) {
  const r = simulate(t => (t >= 5 ? I : 0), P4.T, dt, 5);
  const ts = spikeTimes(r), inWin = ts.filter(t => t >= P4.w0);
  const peaks = ts.map(t0 => peak(r, t0 - 0.5, t0 + 3).V), peaksWin = ts.map((t0, i) => [t0, peaks[i]]).filter(q => q[0] >= P4.w0).map(q => q[1]);
  const isi = inWin.length >= 2 ? (inWin[inWin.length - 1] - inWin[0]) / (inWin.length - 1) : null; // mean interval in the window
  return { r, ts, inWin, isi, rate: isi ? 1000 / isi : 0, peaks, peaksWin };
}

/* ---------- step 5: propagation along an unmyelinated axon (cable + HH) ---------- */
const CABLE = { Ri: 35.4, L: 6, dx: 0.025, dt: 0.01, T: 12, xA: 2, xB: 4 }; // Ω·cm, cm, cm, ms, ms, cm, cm
function propagate(dMm, opts = {}) {
  const p = { ...CABLE, ...opts }, d = dMm / 10; // mm → cm
  const N = Math.round(p.L / p.dx) + 1, D = 1000 * d / (4 * p.Ri * p.dx * p.dx); // µA/cm² per mV
  const V = new Float64Array(N).fill(REST.V), m = new Float64Array(N).fill(REST.m), h = new Float64Array(N).fill(REST.h), n = new Float64Array(N).fill(REST.n);
  const steps = Math.round(p.T / p.dt), iA = Math.round(p.xA / p.dx), iB = Math.round(p.xB / p.dx);
  let tA = null, tB = null, prevA = REST.V, prevB = REST.V;
  const snaps = []; const snapEvery = Math.round(0.1 / p.dt);
  const a = new Float64Array(N), b = new Float64Array(N), c = new Float64Array(N), r = new Float64Array(N), cp = new Float64Array(N), dp = new Float64Array(N);
  for (let k = 0; k < steps; k++) {
    const t = k * p.dt;
    for (let i = 0; i < N; i++) {
      const v = V[i];
      // exponential Euler for the gates
      const upd = (x, al, be) => { const tauX = 1 / (al + be), xin = al * tauX; return xin + (x - xin) * Math.exp(-p.dt / tauX); };
      const gna = HH.gNa * m[i] ** 3 * h[i], gk = HH.gK * n[i] ** 4;
      const Iion = gna * (v - HH.ENa) + gk * (v - HH.EK) + HH.gL * (v - HH.EL);
      const Is = i * p.dx < 0.3 && t < 0.5 ? 400 : 0; // a strong 0.5-ms kick to the first 3 mm
      m[i] = upd(m[i], am(v), bm(v)); h[i] = upd(h[i], ah(v), bh(v)); n[i] = upd(n[i], an(v), bn(v));
      const diag = HH.Cm / p.dt + (i === 0 || i === N - 1 ? D : 2 * D);
      a[i] = i > 0 ? -D : 0; c[i] = i < N - 1 ? -D : 0; b[i] = diag; r[i] = HH.Cm / p.dt * v - Iion + Is;
    }
    // Thomas algorithm
    cp[0] = c[0] / b[0]; dp[0] = r[0] / b[0];
    for (let i = 1; i < N; i++) { const den = b[i] - a[i] * cp[i - 1]; cp[i] = c[i] / den; dp[i] = (r[i] - a[i] * dp[i - 1]) / den; }
    V[N - 1] = dp[N - 1]; for (let i = N - 2; i >= 0; i--) V[i] = dp[i] - cp[i] * V[i + 1];
    const tn = t + p.dt;
    // upward 0-mV crossing time, linearly interpolated inside the step
    if (tA === null && V[iA] >= SPIKE_MV) tA = tn - p.dt * (V[iA] - SPIKE_MV) / (V[iA] - prevA);
    if (tB === null && V[iB] >= SPIKE_MV) tB = tn - p.dt * (V[iB] - SPIKE_MV) / (V[iB] - prevB);
    prevA = V[iA]; prevB = V[iB];
    if ((k + 1) % snapEvery === 0) snaps.push({ t: tn, V: Array.from(V) });
  }
  const speed = tA !== null && tB !== null ? (p.xB - p.xA) / (tB - tA) * 10 : null; // cm/ms → m/s
  return { speed, tA, tB, snaps, dx: p.dx, N, L: p.L };
}

const API = { HH, an, bn, am, bm, ah, bh, nInf, mInf, hInf, gNaOf, gKOf, target, REST, simulate, pulse, peak, SPIKE_MV, P1, single, threshold1, P3, pair, fires2, threshold2, absRefractory, AMP2_MAX, P4, spikeTimes, train, CABLE, propagate };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') root.AP_MODEL = API;
})(typeof window !== 'undefined' ? window : globalThis);
