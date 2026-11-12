/* What quantum computers can do: the models behind every chart on the page.
 * One small state-vector simulator (complex amplitudes stored as two Float64Arrays, up to ~10 qubits) and the
 * chapter models built on it. Pure functions only (no DOM). Loaded by index.html as window.QCModels and by
 * tests/models.cjs via require().
 *
 * Conventions. Qubit q is bit q of the basis index (little-endian): with 3 qubits, index 6 = 0b110 means
 * q2 = 1, q1 = 1, q0 = 0. A single-qubit gate is a 2×2 complex matrix [[a, b], [c, d]] stored flat as
 * [ar, ai, br, bi, cr, ci, dr, di]. Noise is simulated by quantum trajectories: after a gate, a random Pauli
 * error is applied with the channel's probability; averaging many seeded trajectories gives the channel
 * (Nielsen & Chuang, Quantum Computation and Quantum Information, 10th anniv. ed., §8.3).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QCModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PI = Math.PI, R2 = Math.SQRT1_2;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* seeded RNG (mulberry32): every random run on the page is repeatable */
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ═════════════ the simulator ═════════════ */
  function create(n, basis = 0) {
    const N = 1 << n, s = { n, N, re: new Float64Array(N), im: new Float64Array(N) };
    s.re[basis] = 1; return s;
  }
  const clone = s => ({ n: s.n, N: s.N, re: s.re.slice(), im: s.im.slice() });

  const G = {
    I: [1, 0, 0, 0, 0, 0, 1, 0],
    X: [0, 0, 1, 0, 1, 0, 0, 0],
    Y: [0, 0, 0, -1, 0, 1, 0, 0],
    Z: [1, 0, 0, 0, 0, 0, -1, 0],
    H: [R2, 0, R2, 0, R2, 0, -R2, 0],
    S: [1, 0, 0, 0, 0, 0, 0, 1],
    Sdg: [1, 0, 0, 0, 0, 0, 0, -1],
    T: [1, 0, 0, 0, 0, 0, R2, R2],
    P: phi => [1, 0, 0, 0, 0, 0, Math.cos(phi), Math.sin(phi)],                         // phase on |1⟩
    Ry: th => { const c = Math.cos(th / 2), s = Math.sin(th / 2); return [c, 0, -s, 0, s, 0, c, 0]; },
    Rx: th => { const c = Math.cos(th / 2), s = Math.sin(th / 2); return [c, 0, 0, -s, 0, -s, c, 0]; },
    Rz: th => { const c = Math.cos(th / 2), s = Math.sin(th / 2); return [c, -s, 0, 0, 0, 0, c, s]; }
  };

  /* apply the 2×2 matrix m to qubit q, only on basis states whose bits in cmask are all 1 (controls) */
  function apply(s, q, m, cmask = 0) {
    const bit = 1 << q, re = s.re, im = s.im;
    const ar = m[0], ai = m[1], br = m[2], bi = m[3], cr = m[4], ci = m[5], dr = m[6], di = m[7];
    for (let i = 0; i < s.N; i++) {
      if ((i & bit) || (i & cmask) !== cmask) continue;
      const j = i | bit, xr = re[i], xi = im[i], yr = re[j], yi = im[j];
      re[i] = ar * xr - ai * xi + br * yr - bi * yi; im[i] = ar * xi + ai * xr + br * yi + bi * yr;
      re[j] = cr * xr - ci * xi + dr * yr - di * yi; im[j] = cr * xi + ci * xr + dr * yi + di * yr;
    }
    return s;
  }
  const h = (s, q) => apply(s, q, G.H);
  const x = (s, q) => apply(s, q, G.X);
  const cnot = (s, c, t) => apply(s, t, G.X, 1 << c);
  const cphase = (s, c, t, phi) => apply(s, t, G.P(phi), 1 << c);
  const swap = (s, a, b) => { cnot(s, a, b); cnot(s, b, a); cnot(s, a, b); return s; };
  /* multi-controlled Z on the listed qubits: −1 on every basis state where all of them are 1 */
  function mcz(s, qs) {
    let mask = 0; for (const q of qs) mask |= 1 << q;
    for (let i = 0; i < s.N; i++) if ((i & mask) === mask) { s.re[i] = -s.re[i]; s.im[i] = -s.im[i]; }
    return s;
  }
  /* phase oracle: −1 on basis states where pred(i) is true */
  function phaseFlip(s, pred) {
    for (let i = 0; i < s.N; i++) if (pred(i)) { s.re[i] = -s.re[i]; s.im[i] = -s.im[i]; }
    return s;
  }
  /* a classical reversible function as a unitary: on states whose control bits are all 1, the sub-register
   * made of qubits regQs (little-endian) is mapped v → f(v). f must be a bijection on 0..2^len−1. */
  function permute(s, cmask, regQs, f) {
    const re = new Float64Array(s.N), im = new Float64Array(s.N);
    let rmask = 0; regQs.forEach(q => { rmask |= 1 << q; });
    for (let i = 0; i < s.N; i++) {
      let j = i;
      if ((i & cmask) === cmask) {
        let v = 0; regQs.forEach((q, k) => { if (i & (1 << q)) v |= 1 << k; });
        const w = f(v); j = i & ~rmask; regQs.forEach((q, k) => { if (w & (1 << k)) j |= 1 << q; });
      }
      re[j] += s.re[i]; im[j] += s.im[i];
    }
    s.re = re; s.im = im; return s;
  }

  function probs(s) { const p = new Float64Array(s.N); for (let i = 0; i < s.N; i++) p[i] = s.re[i] * s.re[i] + s.im[i] * s.im[i]; return p; }
  function norm(s) { let t = 0; for (let i = 0; i < s.N; i++) t += s.re[i] * s.re[i] + s.im[i] * s.im[i]; return t; }
  function probOne(s, q) { let t = 0; const bit = 1 << q; for (let i = 0; i < s.N; i++) if (i & bit) t += s.re[i] * s.re[i] + s.im[i] * s.im[i]; return t; }
  /* marginal distribution of the sub-register regQs */
  function marginal(s, regQs) {
    const out = new Float64Array(1 << regQs.length);
    for (let i = 0; i < s.N; i++) {
      let v = 0; regQs.forEach((q, k) => { if (i & (1 << q)) v |= 1 << k; });
      out[v] += s.re[i] * s.re[i] + s.im[i] * s.im[i];
    }
    return out;
  }
  function sampleFrom(p, r) { let u = r(), acc = 0; for (let i = 0; i < p.length; i++) { acc += p[i]; if (u < acc) return i; } return p.length - 1; }
  /* measure qubit q: random outcome with the Born probability, state collapses and is renormalised */
  function measure(s, q, r) {
    const p1 = probOne(s, q), out = r() < p1 ? 1 : 0, bit = 1 << q, k = 1 / Math.sqrt(out ? p1 : 1 - p1);
    for (let i = 0; i < s.N; i++) { if (((i & bit) ? 1 : 0) !== out) { s.re[i] = 0; s.im[i] = 0; } else { s.re[i] *= k; s.im[i] *= k; } }
    return out;
  }
  /* overlap |⟨a|b⟩|² */
  function fidelity(a, b) { let r = 0, i = 0; for (let k = 0; k < a.N; k++) { r += a.re[k] * b.re[k] + a.im[k] * b.im[k]; i += a.re[k] * b.im[k] - a.im[k] * b.re[k]; } return r * r + i * i; }

  /* noise by trajectories: depolarising (X, Y or Z each with p/3) and dephasing (Z with p) */
  const PAULI = [G.X, G.Y, G.Z];
  function depolarize(s, q, p, r) { if (p > 0 && r() < p) apply(s, q, PAULI[Math.floor(r() * 3) % 3]); }
  function dephase(s, q, p, r) { if (p > 0 && r() < p) apply(s, q, G.Z); }
  function noisy(kind) { return kind === 'dephase' ? dephase : depolarize; }

  /* quantum Fourier transform on qubits qs (little-endian integer), from H and controlled phases.
   * qft:  |x⟩ → 2^{-t/2} Σ_y e^{+2πi xy/2^t} |y⟩ ;  iqft is its inverse (the − sign). */
  function qft(s, qs, inverse = false) {
    const t = qs.length, sg = inverse ? -1 : 1;
    if (!inverse) {
      for (let j = t - 1; j >= 0; j--) { h(s, qs[j]); for (let k = j - 1; k >= 0; k--) cphase(s, qs[k], qs[j], sg * PI / (1 << (j - k))); }
      for (let j = 0; j < Math.floor(t / 2); j++) swap(s, qs[j], qs[t - 1 - j]);
    } else {
      for (let j = 0; j < Math.floor(t / 2); j++) swap(s, qs[j], qs[t - 1 - j]);
      for (let j = 0; j < t; j++) { for (let k = 0; k < j; k++) cphase(s, qs[k], qs[j], sg * PI / (1 << (j - k))); h(s, qs[j]); }
    }
    return s;
  }
  /* the same transform done directly as a matrix (used only by the test to check the gate version) */
  function dft(s, inverse = false) {
    const N = s.N, sg = inverse ? -1 : 1, re = new Float64Array(N), im = new Float64Array(N), k = 1 / Math.sqrt(N);
    for (let y = 0; y < N; y++) for (let xx = 0; xx < N; xx++) {
      const a = sg * 2 * PI * xx * y / N, c = Math.cos(a), sn = Math.sin(a);
      re[y] += k * (s.re[xx] * c - s.im[xx] * sn); im[y] += k * (s.re[xx] * sn + s.im[xx] * c);
    }
    return { n: s.n, N, re, im };
  }

  const sim = { create, clone, G, apply, h, x, cnot, cphase, swap, mcz, phaseFlip, permute, probs, norm, probOne, marginal, sampleFrom, measure, fidelity, depolarize, dephase, qft, dft };

  /* ═════════════ ch1 · one qubit ═════════════
   * |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩, prepared as P(φ)·Ry(θ)|0⟩. Measuring in basis Z, X or Y is done the way
   * hardware does it: rotate that axis onto Z (X: H; Y: S† then H), then measure Z. */
  const qubit = {
    prepare(theta, phi) { const s = create(1); apply(s, 0, G.Ry(theta)); apply(s, 0, G.P(phi)); return s; },
    rotateTo(s, basis) { if (basis === 'x') h(s, 0); else if (basis === 'y') { apply(s, 0, G.Sdg); h(s, 0); } return s; },
    /* P(first outcome) in the chosen basis: Z → "0", X → "+", Y → "+i" */
    p0(theta, phi, basis) { const s = qubit.rotateTo(qubit.prepare(theta, phi), basis); return 1 - probOne(s, 0); },
    bloch(theta, phi) { return [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)]; },
    amps(theta, phi) { const s = qubit.prepare(theta, phi); return { a: [s.re[0], s.im[0]], b: [s.re[1], s.im[1]] }; },
    /* n shots: each one prepares a fresh copy and measures it (measurement destroys the copy) */
    shots(theta, phi, basis, n, r) { let zero = 0; for (let k = 0; k < n; k++) { const s = qubit.rotateTo(qubit.prepare(theta, phi), basis); if (measure(s, 0, r) === 0) zero++; } return zero; }
  };

  /* ═════════════ ch2 · interference (Mach–Zehnder: H, phase φ on path 1, H) ═════════════
   * `peek` ∈ [0,1] is how much which-path information leaks to the environment: a dephasing channel of strength
   * peek/2 between the beam splitters (peek = 1 is a full which-path measurement). Exact average of two branches. */
  const mz = {
    run(phi, peek = 0) {
      const branch = flip => { const s = create(1); h(s, 0); apply(s, 0, G.P(phi)); if (flip) apply(s, 0, G.Z); h(s, 0); return 1 - probOne(s, 0); };
      const pz = peek / 2, p0 = (1 - pz) * branch(false) + pz * branch(true);
      return { p0, p1: 1 - p0 };
    },
    /* the two path contributions (complex) to each detector: keep only one path after the first splitter */
    paths(phi) {
      const one = (path) => { const s = create(1); h(s, 0); apply(s, 0, G.P(phi)); s.re[1 - path] = 0; s.im[1 - path] = 0; h(s, 0); return s; };
      const a = one(0), b = one(1);
      return { d0: [[a.re[0], a.im[0]], [b.re[0], b.im[0]]], d1: [[a.re[1], a.im[1]], [b.re[1], b.im[1]]] };
    },
    visibility(peek) { const hi = mz.run(0, peek).p0, lo = mz.run(PI, peek).p0; return (hi - lo) / (hi + lo); },
    /* two fair coin flips in a row: the classical version with the same two "splitters" */
    classical() { return 0.5 * 0.5 + 0.5 * 0.5; }
  };

  /* ═════════════ ch3 · entanglement and the CHSH game ═════════════
   * Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 from H then CNOT. A player measuring "at angle θ" uses the basis
   * {cos θ|0⟩ + sin θ|1⟩, −sin θ|0⟩ + cos θ|1⟩}: rotate by Ry(−2θ), then measure Z. Referee sends bits x, y;
   * the pair wins when a ⊕ b = x ∧ y (Clauser, Horne, Shimony, Holt 1969; Cleve et al. 2004 for the game form). */
  const chsh = {
    bell() { const s = create(2); h(s, 0); cnot(s, 0, 1); return s; },
    joint(thA, thB) { const s = chsh.bell(); apply(s, 0, G.Ry(-2 * thA)); apply(s, 1, G.Ry(-2 * thB)); return probs(s); }, // [p(a=0,b=0), p(1,0), p(0,1), p(1,1)] by index a + 2b
    winGiven(thA, thB, x, y) { const p = chsh.joint(thA, thB); const same = p[0] + p[3]; return (x & y) ? 1 - same : same; },
    /* angles = {a0, a1, b0, b1} in radians */
    winProb(A) { let w = 0; for (let xx = 0; xx < 2; xx++) for (let y = 0; y < 2; y++) w += chsh.winGiven(xx ? A.a1 : A.a0, y ? A.b1 : A.b0, xx, y); return w / 4; },
    /* the correlator form: S = E(a0,b0) + E(a0,b1) + E(a1,b0) − E(a1,b1), and win = 1/2 + S/8 */
    S(A) { const E = (ta, tb) => { const p = chsh.joint(ta, tb); return p[0] + p[3] - p[1] - p[2]; }; return E(A.a0, A.b0) + E(A.a0, A.b1) + E(A.a1, A.b0) - E(A.a1, A.b1); },
    /* Bob's own statistics, P(b = 1), given which setting Alice used: identical, so nothing is signalled */
    bobMarginal(thA, thB) { const p = chsh.joint(thA, thB); return p[2] + p[3]; },
    best: { a0: 0, a1: PI / 4, b0: PI / 8, b1: -PI / 8 },
    /* every deterministic classical strategy: a = f(x), b = g(y), f, g ∈ {0, 1, x, not x}. Shared randomness only mixes these. */
    classicalBest() {
      const fs = [v => 0, v => 1, v => v, v => 1 - v]; let best = 0;
      for (const f of fs) for (const g of fs) { let w = 0; for (let xx = 0; xx < 2; xx++) for (let y = 0; y < 2; y++) if ((f(xx) ^ g(y)) === (xx & y)) w++; best = Math.max(best, w / 4); }
      return best;
    },
    /* play rounds with the simulator: the referee's bits and both measurements are drawn from the seeded RNG */
    play(A, rounds, r, tally) {
      const t = tally || { rounds: 0, wins: 0, cell: [0, 0, 0, 0], cellWins: [0, 0, 0, 0], bobOne: [0, 0], bobN: [0, 0] };
      for (let k = 0; k < rounds; k++) {
        const xx = r() < 0.5 ? 1 : 0, y = r() < 0.5 ? 1 : 0;
        const s = chsh.bell(); apply(s, 0, G.Ry(-2 * (xx ? A.a1 : A.a0))); apply(s, 1, G.Ry(-2 * (y ? A.b1 : A.b0)));
        const a = measure(s, 0, r), b = measure(s, 1, r), win = (a ^ b) === (xx & y);
        t.rounds++; t.cell[xx + 2 * y]++; if (win) { t.wins++; t.cellWins[xx + 2 * y]++; }
        t.bobN[xx]++; if (b) t.bobOne[xx]++;
      }
      return t;
    },
    /* the best classical strategy (both always answer 0) played with the same referee */
    playClassical(rounds, r, tally) {
      const t = tally || { rounds: 0, wins: 0, cell: [0, 0, 0, 0], cellWins: [0, 0, 0, 0], bobOne: [0, 0], bobN: [0, 0] };
      for (let k = 0; k < rounds; k++) {
        const xx = r() < 0.5 ? 1 : 0, y = r() < 0.5 ? 1 : 0, win = 0 === (xx & y);
        t.rounds++; t.cell[xx + 2 * y]++; if (win) { t.wins++; t.cellWins[xx + 2 * y]++; } t.bobN[xx]++;
      }
      return t;
    }
  };

  /* ═════════════ ch4 · n qubits need 2^n amplitudes ═════════════ */
  const memory = {
    BYTES_PER_AMP: 16, // two 64-bit floats per complex amplitude
    bytes: n => 16 * Math.pow(2, n),
    log10Bytes: n => Math.log10(16) + n * Math.log10(2),
    /* largest n whose state vector fits in B bytes */
    maxQubits: B => Math.floor(Math.log2(B / 16)),
    /* a fixed pseudo-random circuit on n qubits: layers of Ry/Rz on every qubit and a CNOT chain (seeded) */
    randomState(n, seed, layers = 3) {
      const r = rng(seed), s = create(n);
      for (let L = 0; L < layers; L++) {
        for (let q = 0; q < n; q++) { apply(s, q, G.Ry(r() * PI)); apply(s, q, G.Rz(r() * 2 * PI)); }
        for (let q = 0; q + 1 < n; q++) cnot(s, q, q + 1);
      }
      return s;
    }
  };

  /* ═════════════ ch5 · Deutsch–Jozsa (n = 3 input qubits + 1 answer qubit) ═════════════
   * Oracle U_f |x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩, built as a permutation. Circuit: answer qubit to |1⟩, H on all, U_f,
   * H on the inputs, measure the inputs. All-zero ⇔ f constant (Deutsch & Jozsa 1992; N&C §1.4.4). */
  const DJ_F = {
    c0: v => 0, c1: v => 1,
    b0: v => v & 1,                                  // f = x0
    b12: v => ((v >> 1) ^ (v >> 2)) & 1,             // f = x1 ⊕ x2
    par: v => (v ^ (v >> 1) ^ (v >> 2)) & 1,         // f = x0 ⊕ x1 ⊕ x2
    maj: v => (((v & 1) + ((v >> 1) & 1) + ((v >> 2) & 1)) >= 2) ? 1 : 0
  };
  const dj = {
    n: 3, F: DJ_F,
    isConstant(id) { const f = DJ_F[id]; let s = 0; for (let v = 0; v < 8; v++) s += f(v); return s === 0 || s === 8; },
    isBalanced(id) { const f = DJ_F[id]; let s = 0; for (let v = 0; v < 8; v++) s += f(v); return s === 4; },
    /* stage 0: start, 1: after the H layer, 2: after the oracle, 3: after the final H layer.
     * Returns the 8 input-register amplitudes with the answer qubit projected on |−⟩ (it stays there). */
    stage(id, k) {
      const f = DJ_F[id], s = create(4); x(s, 3);
      if (k >= 1) for (let q = 0; q < 4; q++) h(s, q);
      if (k >= 2) permute(s, 0, [0, 1, 2, 3], w => w ^ (f(w & 7) << 3));
      if (k >= 3) for (let q = 0; q < 3; q++) h(s, q);
      const out = new Float64Array(8);
      for (let v = 0; v < 8; v++) out[v] = k >= 1 ? (s.re[v] - s.re[v | 8]) * R2 : s.re[v | 8]; // stage 0: answer qubit is |1⟩
      return { amps: out, state: s };
    },
    pAllZero(id) { const st = dj.stage(id, 3).state; return marginal(st, [0, 1, 2])[0]; },
    classicalWorst: n => Math.pow(2, n - 1) + 1
  };

  /* ═════════════ ch6 · Grover search ═════════════
   * Oracle: phase flip on the marked item. Diffusion: H·X·(multi-controlled Z)·X·H on all qubits, which is
   * −(2|s⟩⟨s| − I). Exact: P_k = sin²((2k+1)θ), sin θ = 1/√N (Grover 1996; Boyer, Brassard, Høyer, Tapp 1998). */
  const grover = {
    start(n) { const s = create(n); for (let q = 0; q < n; q++) h(s, q); return s; },
    all: n => Array.from({ length: n }, (_, i) => i),
    iterate(s, marked) {
      phaseFlip(s, i => i === marked);
      const qs = grover.all(s.n);
      for (const q of qs) h(s, q); for (const q of qs) x(s, q); mcz(s, qs); for (const q of qs) x(s, q); for (const q of qs) h(s, q);
      return s;
    },
    theta: N => Math.asin(1 / Math.sqrt(N)),
    exact: (N, k) => Math.pow(Math.sin((2 * k + 1) * grover.theta(N)), 2),
    kOpt: N => Math.floor(PI / (4 * grover.theta(N))),
    /* simulate k = 0..kmax, returning P(marked) after each */
    curve(n, marked, kmax) { const s = grover.start(n), out = [s.re[marked] ** 2 + s.im[marked] ** 2]; for (let k = 1; k <= kmax; k++) { grover.iterate(s, marked); out.push(s.re[marked] ** 2 + s.im[marked] ** 2); } return out; },
    /* steps ("layers") per iteration, the way ch9 counts them: oracle, H, X, MCZ, X, H */
    LAYERS: 6,
    TRAJ: 200, SEED: 1, // the page's noisy runs: 200 trajectories from seed 1
    kmaxFor: N => Math.max(2 * grover.kOpt(N), grover.kOpt(N) + 4),
    /* noisy Grover by trajectories: after every layer, every qubit suffers the error channel with probability p.
     * Returns the mean P(marked) after each iteration, averaged over `traj` seeded trajectories. */
    noisyCurve(n, marked, kmax, p, kind, traj, seed) {
      const r = rng(seed), err = noisy(kind), acc = new Float64Array(kmax + 1), qs = grover.all(n);
      const layer = (s) => { for (const q of qs) err(s, q, p, r); };
      for (let t = 0; t < traj; t++) {
        const s = create(n); for (const q of qs) h(s, q); layer(s);
        acc[0] += s.re[marked] ** 2 + s.im[marked] ** 2;
        for (let k = 1; k <= kmax; k++) {
          phaseFlip(s, i => i === marked); layer(s);
          for (const q of qs) h(s, q); layer(s);
          for (const q of qs) x(s, q); layer(s);
          mcz(s, qs); layer(s);
          for (const q of qs) x(s, q); layer(s);
          for (const q of qs) h(s, q); layer(s);
          acc[k] += s.re[marked] ** 2 + s.im[marked] ** 2;
        }
      }
      return Array.from(acc, v => v / traj);
    },
    /* expected number of errors in one run of k iterations: every qubit, every layer, probability p */
    expectedErrors: (n, k, p) => n * (1 + grover.LAYERS * k) * p
  };

  /* ═════════════ ch7 · period finding and Shor ═════════════
   * Counting register: qubits 0..t−1. Work register: qubits t..t+m−1, starting at |1⟩. Counting qubit j controls
   * "multiply by a^(2^j) mod N" (a permutation of 0..N−1, identity above N). Then the inverse QFT on the counting
   * register and a measurement give y ≈ k·2^t / r. Continued fractions turn y/2^t into r
   * (Shor 1994/1997; N&C §5.3). The multiplier here is applied as one permutation, not compiled into gates. */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  function modpow(b, e, m) { let r = 1 % m; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e >>= 1; } return r; }
  const shor = {
    gcd, modpow,
    workBits: N => Math.ceil(Math.log2(N + 1)),
    coprimes(N) { const out = []; for (let a = 2; a < N - 1; a++) if (gcd(a, N) === 1) out.push(a); return out; },
    order(a, N) { let r = 1, v = a % N; while (v !== 1) { v = (v * a) % N; r++; if (r > N) return null; } return r; },
    powers(a, N, count) { return Array.from({ length: count }, (_, k) => modpow(a, k, N)); },
    run(N, a, t) {
      const m = shor.workBits(N), n = t + m; const s = create(n, 1 << t); // work register = 1
      const cq = Array.from({ length: t }, (_, i) => i), wq = Array.from({ length: m }, (_, i) => t + i);
      for (const q of cq) h(s, q);
      for (let j = 0; j < t; j++) { const mul = modpow(a, 1 << j, N); permute(s, 1 << j, wq, v => (v < N ? (v * mul) % N : v)); }
      qft(s, cq, true);
      return { state: s, p: marginal(s, cq), n, m, t };
    },
    /* continued-fraction expansion of y / Q: the list of convergents p/q */
    convergents(y, Q) {
      const out = []; let num = y, den = Q, h0 = 0, h1 = 1, k0 = 1, k1 = 0;
      while (den !== 0) {
        const a = Math.floor(num / den);[num, den] = [den, num - a * den];
        const h2 = a * h1 + h0, k2 = a * k1 + k0; h0 = h1; h1 = h2; k0 = k1; k1 = k2;
        out.push({ a, p: h1, q: k1 });
      }
      return out;
    },
    /* one classical post-processing attempt from one measured y: first convergent denominator q < N with a^q ≡ 1 */
    attempt(y, t, N, a) {
      const Q = 1 << t, conv = shor.convergents(y, Q);
      const res = { y, Q, conv, r: null, ok: false, reason: 'zero', f1: null, f2: null };
      if (y === 0) return res;
      for (const c of conv) { if (c.q >= N) break; if (c.q > 0 && modpow(a, c.q, N) === 1) { res.r = c.q; break; } }
      if (res.r == null) { res.reason = 'noperiod'; return res; }
      if (res.r % 2) { res.reason = 'odd'; return res; }
      const half = modpow(a, res.r / 2, N);
      if (half === N - 1) { res.reason = 'minus1'; return res; }
      const f1 = gcd(half - 1, N), f2 = gcd(half + 1, N);
      if (f1 > 1 && f1 < N) { res.ok = true; res.f1 = f1; res.f2 = N / f1; res.reason = 'ok'; }
      else if (f2 > 1 && f2 < N) { res.ok = true; res.f1 = f2; res.f2 = N / f2; res.reason = 'ok'; }
      else res.reason = 'trivial';
      return res;
    },
    /* exact chance that one run of the circuit plus one post-processing attempt yields the factors */
    successProb(N, a, t) { const { p } = shor.run(N, a, t); let s = 0; for (let y = 0; y < p.length; y++) if (p[y] > 1e-12 && shor.attempt(y, t, N, a).ok) s += p[y]; return s; },
    /* general number field sieve, heuristic cost L_N[1/3, (64/9)^{1/3}] with the o(1) dropped (natural log) */
    lnGNFS(bits) { const lnN = bits * Math.LN2; return Math.cbrt(64 / 9) * Math.cbrt(lnN) * Math.pow(Math.log(lnN), 2 / 3); },
    /* scale a measured classical record by the ratio of GNFS costs (a rough, standard extrapolation) */
    gnfsExtrapolate(bits, recordBits, recordCost) { return recordCost * Math.exp(shor.lnGNFS(bits) - shor.lnGNFS(recordBits)); }
  };

  /* ═════════════ ch8 · when does a quadratic speed-up pay? ═════════════
   * Brute force: N checks at Rc per second. Grover: (π/4)√N oracle calls at Rq per second. They take equal time at
   * √N* = (π/4)·Rc/Rq. The argument is Babbush et al., PRX Quantum 2, 010103 (2021); the rates are the reader's. */
  const crossover = {
    tClassical: (N, Rc) => N / Rc,
    tGrover: (N, Rq) => (PI / 4) * Math.sqrt(N) / Rq,
    nStar: (Rc, Rq) => Math.pow((PI / 4) * Rc / Rq, 2),
    tStar: (Rc, Rq) => crossover.nStar(Rc, Rq) / Rc
  };

  /* ═════════════ ch10 · error correction ═════════════
   * 3-qubit bit-flip code on 5 qubits: data q0..q2, syndrome ancillas q3 (parity q0,q1) and q4 (parity q1,q2).
   * Encode α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩; errors; measure the two parities; flip the qubit they point at; decode. */
  const rep = {
    THETA: PI / 4, // the logical state used in demonstrations: cos(π/8)|0⟩ + sin(π/8)|1⟩
    encode(theta) { const s = create(5); apply(s, 0, G.Ry(theta)); cnot(s, 0, 1); cnot(s, 0, 2); return s; },
    /* one round. errs = [e0, e1, e2], each 0 (none), 'X' or 'Z'. Returns syndrome, the qubit corrected, fidelity. */
    round(errs, r, theta = rep.THETA) {
      const ideal = rep.encode(theta), s = clone(ideal);
      errs.forEach((e, q) => { if (e === 'X') x(s, q); else if (e === 'Z') apply(s, q, G.Z); });
      cnot(s, 0, 3); cnot(s, 1, 3); cnot(s, 1, 4); cnot(s, 2, 4);
      const s1 = measure(s, 3, r), s2 = measure(s, 4, r);
      const fix = s1 && !s2 ? 0 : s1 && s2 ? 1 : !s1 && s2 ? 2 : -1;
      if (fix >= 0) x(s, fix);
      if (s1) x(s, 3); if (s2) x(s, 4); // reset the ancillas to |0⟩ so the state can be compared with the ideal
      const f = fidelity(s, ideal);
      return { syndrome: [s1, s2], fix, fidelity: f, ok: f > 0.999 };
    },
    /* exact logical error rate when each qubit flips independently with probability p and syndromes are perfect */
    logical: p => 3 * p * p - 2 * p * p * p,
    breakEven: 0.5,
    TRIALS: 2000, SEED: 7, // the page's Monte Carlo: 2000 rounds from seed 7
    /* the same number by running the simulator `trials` times with seeded random flips */
    monteCarlo(p, trials, seed, kind = 'X') {
      const r = rng(seed); let fail = 0;
      for (let k = 0; k < trials; k++) { const errs = [0, 1, 2].map(() => (r() < p ? kind : 0)); if (!rep.round(errs, r).ok) fail++; }
      return fail / trials;
    }
  };

  /* surface code: p_L ≈ A (p/p_th)^((d+1)/2), A = 0.1, p_th = 1% (Fowler, Mariantoni, Martinis, Cleland,
   * PRA 86, 032324 (2012), eq. 11 form); rotated layout uses d² data + d² − 1 measure qubits = 2d² − 1. */
  const surface = {
    A: 0.1, PTH: 0.01,
    pL: (p, d) => surface.A * Math.pow(p / surface.PTH, (d + 1) / 2),
    qubits: d => 2 * d * d - 1,
    /* smallest odd distance reaching the target (null if p ≥ threshold or more than d = 201 needed) */
    distanceFor(p, target) { if (p >= surface.PTH) return null; for (let d = 3; d <= 201; d += 2) if (surface.pL(p, d) <= target) return d; return null; }
  };

  /* ch11 · extrapolating a measured device with its own scaling: ε_d = ε_7 / Λ^((d−7)/2)
   * (Google Quantum AI, Nature 638, 920 (2025): the form the paper reports). */
  const lambdaModel = {
    eps: (d, eps7, lam) => eps7 / Math.pow(lam, (d - 7) / 2),
    distanceFor(target, eps7, lam) { if (lam <= 1) return null; for (let d = 3; d <= 401; d += 2) if (lambdaModel.eps(d, eps7, lam) <= target) return d; return null; }
  };

  /* ═════════════ FRONTIER DATA (facts that will go stale) ═════════════
   * Every value below is a measured or claimed figure from the source named in BRIEF.md ("Facts that will go
   * stale"), with the month it refers to. kind: 'demo' = demonstrated and published; 'claim' = announced by an
   * interested party (vendor) and not independently established; 'contested' = published and disputed;
   * 'estimate' = a published resource estimate under stated assumptions; 'standard' = a standards decision.
   * The page's text for each item lives in copy.*.js under "fr.<id>" with {placeholders} filled from here. */
  const FRONTIER = {
    reviewed: '2026-11',
    hardware: [
      { id: 'willow', kind: 'demo', asOf: '2024-12', v: { q: 105, t1: 100, eps7: 0.143, lam: 2.14, cyc: 1.1, life: 2.4 } },
      { id: 'helios', kind: 'demo', asOf: '2025-11', v: { q: 98, e2: 7.9e-4, e1: 2.5e-5, spam: 4.8e-4 } },
      { id: 'ionq', kind: 'claim', asOf: '2025-10', v: { f2: 99.99 } },
      { id: 'caltech', kind: 'demo', asOf: '2025-09', v: { atoms: 6100, t2: 12.6 } },
      { id: 'harvard', kind: 'demo', asOf: '2025-06', v: { atoms: 448, lam: 2.14 } },
      { id: 'qlogical', kind: 'claim', asOf: '2026-10', v: { f: 99.9995, per: 37 } },
      { id: 'majorana', kind: 'contested', asOf: '2025-02', v: {} },
      { id: 'ibm', kind: 'claim', asOf: '2025-06', v: { year: 2029, lq: 200, gates: 1e8, code: 144, codeK: 12, codePhys: 288 } }
    ],
    advantage: [
      { id: 'sycamore', kind: 'contested', asOf: '2019-10', v: { q: 53, sec: 200, years: 10000, ibmDays: 2.5, gpuH: 15 } },
      { id: 'willowRcs', kind: 'claim', asOf: '2024-12', v: { min: 5, exp: 25 } },
      { id: 'echoes', kind: 'contested', asOf: '2025-10', v: { x: 13000, q: 105 } },
      { id: 'dwave', kind: 'contested', asOf: '2025-03', v: {} }
    ],
    estimates: [
      { id: 'rsa2019', kind: 'estimate', asOf: '2019-05', v: { phys: 2e7, hours: 8, p: 0.1 } },
      { id: 'rsa2025', kind: 'estimate', asOf: '2025-05', v: { phys: 1e6, days: 7, p: 0.1, cyc: 1 } },
      { id: 'rsa2026', kind: 'estimate', asOf: '2026-02', v: { phys: 1e5, p: 0.1 } },
      { id: 'ecc2026', kind: 'estimate', asOf: '2026-03', v: { lq: 1200, tof: 9e7, phys: 5e5 } },
      { id: 'femoco', kind: 'estimate', asOf: '2020-11', v: { phys: 4e6, days: 4, p: 0.1 } },
      { id: 'femoco2025', kind: 'estimate', asOf: '2025-02', v: { lo: 4, hi: 195 } }
    ],
    crypto: [
      { id: 'fips', kind: 'standard', asOf: '2024-08', v: {} },
      { id: 'hqc', kind: 'standard', asOf: '2025-03', v: {} },
      { id: 'ir8547', kind: 'standard', asOf: '2026-10', v: { dep: 2030, dis: 2035 } }
    ],
    /* the classical factoring record used to anchor ch7's extrapolation: RSA-250 (829 bits), Feb 2020 */
    rsa250: { bits: 829, coreYears: 2700, asOf: '2020-02' },
    /* the largest exact state-vector simulation used in ch4: 45 qubits, 0.5 PB (Häner & Steiger, SC17, 2017) */
    sim45: { n: 45, bytesPB: 0.5, asOf: '2017-11' }
  };

  return { PI, clamp, rng, sim, qubit, mz, chsh, memory, dj, grover, shor, crossover, rep, surface, lambdaModel, FRONTIER };
}));
