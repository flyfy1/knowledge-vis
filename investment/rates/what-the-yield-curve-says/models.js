/* What the yield curve says: pure models (UMD: page and node). Rates are decimals inside the models.
   Chapters 1–4, 7 and 10 use continuously compounded zero rates (as the ACM / Gürkaynak–Sack–Wright curves do);
   chapter 6 uses annual compounding, the market's quoting convention, and says so on the page. */
(function (root, factory) {
  const D = (typeof module === 'object' && module.exports) ? require('./data.js') : root.CurveData;
  const M = factory(D);
  if (typeof module === 'object' && module.exports) module.exports = M; else root.CurveModels = M;
}(typeof self !== 'undefined' ? self : this, function (DATA) {
  'use strict';
  const exp = Math.exp, ln = Math.log, sqrt = Math.sqrt;

  /* ───── helpers ───── */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(R) { let u = 0, v = 0; while (u === 0) u = R(); while (v === 0) v = R(); return sqrt(-2 * ln(u)) * Math.cos(2 * Math.PI * v); }
  function ncdf(x) { // Abramowitz–Stegun 7.1.26 via erf, |error| < 1.5e-7
    const s = x < 0 ? -1 : 1, z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.3275911 * z);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-z * z);
    return 0.5 * (1 + s * y);
  }
  function ninv(p) { // Acklam's rational approximation, refined by one Newton step
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425; let q, r, x;
    if (p < pl) { q = sqrt(-2 * ln(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = sqrt(-2 * ln(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const e = ncdf(x) - p, u = e * sqrt(2 * Math.PI) * exp(x * x / 2); return x - u / (1 + x * u / 2);
  }
  function solve(f, lo, hi) { let flo = f(lo); for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; }
  function fmt(x, d) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    d = d == null ? 0 : d; let s = Math.abs(x).toFixed(d);
    if (+s === 0) return s;
    const [i, f] = s.split('.'); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
    return (x < 0 ? '−' : '') + s;
  }
  const signed = (x, d) => { const s = fmt(x, d); return x > 0 && +Math.abs(x).toFixed(d == null ? 0 : d) !== 0 ? '+' + s : s; };
  const mIndex = (start, ym) => { const [y0, m0] = start.split('-').map(Number), [y, m] = ym.split('-').map(Number); return (y - y0) * 12 + (m - m0); };
  const mLabel = (start, i) => { const [y0, m0] = start.split('-').map(Number), k = y0 * 12 + (m0 - 1) + i; return { y: Math.floor(k / 12), m: (k % 12) + 1 }; };

  /* ───── a zero curve: nodes at 1..10 years (decimals), linear between, flat outside ───── */
  function curve(nodes) {
    const z = t => { if (t <= 1) return nodes[0]; if (t >= nodes.length) return nodes[nodes.length - 1]; const i = Math.floor(t), w = t - i; return nodes[i - 1] * (1 - w) + nodes[i] * w; };
    return { nodes, z, df: t => exp(-z(t) * t) };
  }
  const realCurve = d => curve(DATA.curves[d].zero.map(v => v / 100));

  /* ch1: a coupon bond as a bundle of zero-coupon bonds; its yield to maturity is a blend of the zero rates */
  function bundle(cv, T, c) { // annual coupon c (decimal) on 100 face, T whole years
    const flows = []; let P = 0;
    for (let t = 1; t <= T; t++) { const cf = 100 * c + (t === T ? 100 : 0), pv = cf * cv.df(t); flows.push({ t, cf, z: cv.z(t), pv }); P += pv; }
    const y = solve(r => flows.reduce((s, f) => s + f.cf * exp(-r * f.t), 0) - P, -0.05, 0.3);
    flows.forEach(f => { f.w = f.pv / P; });
    const wAvg = flows.reduce((s, f) => s + f.w * f.z, 0); // PV-weighted average zero rate (a close cousin of y)
    return { flows, P, y, zT: cv.z(T), gap: y - cv.z(T), wAvg };
  }

  /* ch2: forward rate between t1 and t2 and the lock-in that replicates it */
  function forward(cv, t1, t2) {
    const P1 = cv.df(t1), P2 = cv.df(t2), f = (cv.z(t2) * t2 - cv.z(t1) * t1) / (t2 - t1);
    return { f, P1, P2, units: P2 / P1, check: ln(P1 / P2) / (t2 - t1) };
  }
  function forwardArb(cv, t1, t2, fq, N) { // a dealer quotes fq for lending from t1 to t2; amount N at t1
    const fw = forward(cv, t1, t2), dt = t2 - t1;
    const profit = N * (exp(Math.max(fq, fw.f) * dt) - exp(Math.min(fq, fw.f) * dt));
    return { f: fw.f, side: fq > fw.f + 1e-12 ? 'lend' : fq < fw.f - 1e-12 ? 'borrow' : 'none', profit: Math.abs(fq - fw.f) < 1e-12 ? 0 : profit };
  }
  const fwdCurve = cv => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (n === 1 ? cv.z(1) : forward(cv, n - 1, n).f));

  /* ch3: build a curve from an expected short-rate path (one rate per year, k = 0..9) plus a term premium */
  const tpLin = (tp10, n) => tp10 * Math.min(n, 10) / 10;
  function build(path, tp10) {
    const y = [], exp_ = [], tp = [], fwd = []; let s = 0;
    for (let n = 1; n <= path.length; n++) { s += path[n - 1]; exp_.push(s / n); tp.push(tpLin(tp10, n)); y.push(s / n + tpLin(tp10, n)); }
    for (let n = 1; n <= path.length; n++) fwd.push(n === 1 ? y[0] : n * y[n - 1] - (n - 1) * y[n - 2]);
    return { y, exp: exp_, tp, fwd };
  }
  function impliedPath(y, tp10) { // what someone who believes a different premium reads off the same curve
    const p = []; for (let n = 1; n <= y.length; n++) { const a = n * (y[n - 1] - tpLin(tp10, n)), b = n > 1 ? (n - 1) * (y[n - 2] - tpLin(tp10, n - 1)) : 0; p.push(a - b); }
    return p;
  }
  const PATHS = { // expected short rate, % per year, years 0..9
    cuts: [5.25, 4.5, 3.75, 3.25, 3, 3, 3, 3, 3, 3],
    flat: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    hikes: [1, 1.75, 2.5, 3, 3.25, 3.5, 3.5, 3.5, 3.5, 3.5]
  };

  /* ch4: hold an n-year zero for one year */
  function hold(cv, n, scen, shift) {
    const y = m => cv.z(m), yNext = m => (scen === 'fwd' ? ((m + 1) * y(m + 1) - y(1)) / m : y(m) + (scen === 'shift' ? shift : 0));
    const ret = n * y(n) - (n - 1) * yNext(n - 1), r1 = y(1);
    const roll = (n - 1) * (y(n) - y(n - 1)), carry = y(n);
    const breakeven = (n * y(n) - (n - 1) * y(n - 1) - r1) / (n - 1); // parallel rise that brings the 'same curve' return down to r1
    return { ret, r1, excess: ret - r1, carry, roll, breakeven, yN: y(n), yN1: yNext(n - 1) };
  }

  function rxStats(fromYear) { // non-overlapping one-year excess returns of the 10-year zero, January to January (data.js)
    const R = DATA.rx, xs = R.series.slice(fromYear - R.seriesStart), n = xs.length, mean = xs.reduce((a, b) => a + b, 0) / n;
    let wi = 0; xs.forEach((x, i) => { if (x < xs[wi]) wi = i; });
    return { n, mean, sd: sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)), pos: xs.filter(x => x > 0).length / n, worst: xs[wi], worstYear: fromYear + wi, from: fromYear, to: fromYear + n - 1 };
  }

  /* ch6: one bond, annual coupons, annual compounding */
  function bond(c, T, y) {
    let P = 0, Dm = 0, Cv = 0;
    for (let t = 1; t <= T; t++) { const cf = 100 * c + (t === T ? 100 : 0), pv = cf / Math.pow(1 + y, t); P += pv; Dm += t * pv; Cv += t * (t + 1) * pv; }
    const mac = Dm / P, mod = mac / (1 + y), conv = Cv / (P * (1 + y) * (1 + y));
    return { P, mac, mod, conv, dv01: mod * P * 1e-4 };
  }
  function shock(c, T, y, dy) {
    const b0 = bond(c, T, y), b1 = bond(c, T, y + dy), exact = b1.P / b0.P - 1;
    const dur = -b0.mod * dy, durConv = dur + 0.5 * b0.conv * dy * dy;
    return { b0, P1: b1.P, exact, dur, durConv, errDur: dur - exact, errDC: durConv - exact };
  }

  /* ch7: immunising a liability with a bullet or a barbell of zeros, flat curve y (continuous) */
  function immunise(H, L, sMat, lMat, y) { // liability of face 100 at H years
    const PVL = 100 * exp(-y * H);
    const w = (lMat - H) / (lMat - sMat); // share of PV in the short zero so that durations match
    return { PVL, w, bullet: [{ t: H, pv: PVL }], barbell: [{ t: sMat, pv: PVL * w }, { t: lMat, pv: PVL * (1 - w) }] };
  }
  function surplus(pf, H, y, dPar, twist) { // dy(t) = dPar + twist·(t − H)/10
    const dy = t => dPar + twist * (t - H) / 10;
    const val = legs => legs.reduce((s, l) => s + l.pv * exp(-dy(l.t) * l.t), 0); // each leg's yield moves by dy(t)
    const L = pf.PVL * exp(-dy(H) * H);
    return { bullet: val(pf.bullet) - L, barbell: val(pf.barbell) - L, L };
  }
  const dispersion = (legs, H) => { const P = legs.reduce((s, l) => s + l.pv, 0); return legs.reduce((s, l) => s + l.pv / P * (l.t - H) * (l.t - H), 0); };

  /* ch8: Nelson–Siegel, fixed λ (years), least squares for the three betas */
  const LAMBDA = 1.37; // Diebold–Li (2006) λ = 0.0609 per month → 1/(0.0609·12) years
  function nsLoad(t, lam) { const x = t / lam, a = (1 - exp(-x)) / x; return [1, a, a - exp(-x)]; }
  const ns = (b, t, lam) => { const l = nsLoad(t, lam || LAMBDA); return b[0] * l[0] + b[1] * l[1] + b[2] * l[2]; };
  function nsFit(ts, ys, lam) {
    lam = lam || LAMBDA; const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], v = [0, 0, 0];
    ts.forEach((t, i) => { const l = nsLoad(t, lam); for (let a = 0; a < 3; a++) { v[a] += l[a] * ys[i]; for (let b = 0; b < 3; b++) A[a][b] += l[a] * l[b]; } });
    // 3×3 solve (Cramer)
    const det = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const d0 = det(A), b = [0, 1, 2].map(k => det(A.map((row, i) => row.map((x, j) => (j === k ? v[i] : x)))) / d0);
    return { b, rmse: rmse(b, ts, ys, lam) };
  }
  const rmse = (b, ts, ys, lam) => sqrt(ts.reduce((s, t, i) => s + (ns(b, t, lam) - ys[i]) ** 2, 0) / ts.length);

  /* ch9: split the 10-year minus 1-year ACM spread into expectations and term premium, month by month */
  function split(i) {
    const A = DATA.acmM, s = A.y10[i] - A.y1[i], tp = A.tp10[i] - A.tp1[i];
    return { s, tp, exp: s - tp, y10: A.y10[i], y1: A.y1[i], tp10: A.tp10[i] };
  }

  /* ch10: a defaultable zero-coupon bond, annual steps; default probability q per year, recovery R of face at default */
  function risky(r, T, q, R) {
    let P = 0, S = 1;
    for (let t = 1; t <= T; t++) { P += S * q * R * exp(-r * t); S *= (1 - q); }
    P += S * exp(-r * T);
    const y = -ln(P) / T;
    return { P: 100 * P, y, s: y - r, tri: q * (1 - R), surv: S };
  }
  function credit(o) { // o: r, T, p (real-world, per year), R, k (risk-neutral / real-world default intensity)
    const q = Math.min(0.95, o.p * o.k), full = risky(o.r, o.T, q, o.R), el = risky(o.r, o.T, o.p, o.R);
    return { q, s: full.s, tri: full.tri, el: el.s, prem: full.s - el.s, P: full.P, elShare: full.s > 0 ? el.s / full.s : 0, cumP: 1 - Math.pow(1 - o.p, o.T) };
  }
  const annualFromCum = (cum, T) => 1 - Math.pow(1 - cum, 1 / T);
  function impliedPD(s, R) { return s / (1 - R); } // credit triangle, read backwards

  /* ch11: Vasicek one-factor portfolio of N bonds */
  function vasicekQ(p, rho, a) { return ncdf((ninv(p) + sqrt(rho) * ninv(a)) / sqrt(1 - rho)); } // large-portfolio loss quantile
  function vasicekSim(o) { // o: N, p, rho, years, seed → annual default rates
    const R = rng(o.seed || 1), th = ninv(o.p), a = sqrt(o.rho), b = sqrt(1 - o.rho), out = [];
    for (let y = 0; y < o.years; y++) { const Z = gauss(R); let k = 0; for (let i = 0; i < o.N; i++) if (a * Z + b * gauss(R) < th) k++; out.push(k / o.N); }
    return out;
  }
  function stats(xs) {
    const s = xs.slice().sort((x, y) => x - y), n = s.length, mean = xs.reduce((a, b) => a + b, 0) / n;
    const q = a => s[Math.min(n - 1, Math.floor(a * n))];
    return { mean, sd: sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)), q99: q(0.99), max: s[n - 1], min: s[0], n };
  }
  function lossYears(xs, lgd, spread) { return xs.filter(x => x * lgd > spread).length / xs.length; }

  /* ───── dated facts used by the prose (all checked 2026-11-25; BRIEF.md lists each source) ───── */
  const FRONTIER = {
    checked: '2026-11-25',
    firstCut: '2024-09-18',          // FOMC lowered the target range (press release monetary20240918a)
    qtEnd: '2025-12-01',             // balance-sheet runoff ended (monetary20251029a), as in why-one-rate-moves-everything
    refunding: { d: '2026-11-04', offer: 125, refund: 97, newCash: 28 } // Treasury quarterly refunding statement, $ bn
  };

  return { DATA, FRONTIER, rng, gauss, ncdf, ninv, solve, fmt, signed, mIndex, mLabel, curve, realCurve, bundle, forward, forwardArb, fwdCurve,
    tpLin, build, impliedPath, PATHS, hold, rxStats, bond, shock, immunise, surplus, dispersion, LAMBDA, nsLoad, ns, nsFit, rmse, split,
    risky, credit, annualFromCum, impliedPD, vasicekQ, vasicekSim, stats, lossYears };
}));
