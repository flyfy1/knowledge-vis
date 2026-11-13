/* Why Atoms Stick Together: pure models (UMD, no DOM).
 * Used by app.js via window.BondingModels and by tests/models.cjs via require().
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BondingModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // Physical constants (CODATA 2018 / 2022)
  const CONST = {
    HA_EV: 27.211386245988,      // 1 Hartree in eV
    BOHR_A: 0.529177210903,      // 1 Bohr a0 in Angstrom
    EV_KJMOL: 96.48533212,       // 1 eV/particle in kJ/mol
    R_KJMOL_K: 8.314462618e-3,   // Gas constant R in kJ/(mol*K)
    BOX_C_EV_A2: 37.603016,      // h^2 / (8 * m_e) in eV * A^2
    KB_EV_K: 8.617333262e-5,     // Boltzmann constant in eV/K
  };

  /* ───────── 1 · Particle in a 1-D box & delocalisation ─────────
   * E_n(L) = n^2 * h^2 / (8 * m_e * L^2)
   * When two boxes of width L merge to width 2L, kinetic energy drops by 4x.
   */
  const boxModel = {
    energyEv(n, lengthA) {
      const L = Math.max(0.2, lengthA);
      return (n * n * CONST.BOX_C_EV_A2) / (L * L);
    },
    wave(n, lengthA, numPts = 120) {
      const pts = [];
      const norm = Math.sqrt(2 / lengthA);
      for (let i = 0; i <= numPts; i++) {
        const u = i / numPts;
        const x = u * lengthA;
        const psi = norm * Math.sin(n * Math.PI * u);
        pts.push({ x, u, psi, prob: psi * psi });
      }
      return pts;
    },
    compare(n, lengthA, merged) {
      const eSingle = boxModel.energyEv(n, lengthA);
      const effLen = merged ? 2 * lengthA : lengthA;
      const eEff = boxModel.energyEv(n, effLen);
      const saved = eSingle - eEff;
      const ratio = eSingle / eEff;
      return {
        n,
        lengthA,
        effLen,
        merged: !!merged,
        eSingle,
        eEff,
        saved,
        ratio,
      };
    },
  };

  /* ───────── 2 · H2+ LCAO-MO exact 1s integrals ─────────
   * Standard closed-form 1s integrals in atomic units (Hartree, Bohr a0).
   * Reference: McQuarrie, Quantum Chemistry; Atkins & Friedman, Molecular Quantum Mechanics.
   * Exact experimental/exact-BO ground state of H2+: Re = 1.997 a0 (1.057 A), De = 2.793 eV.
   */
  const h2plusModel = {
    EXACT: { rBohr: 2.00, rA: 2.00 * CONST.BOHR_A, deEv: 2.793 },
    evalAt(rBohr, zeta = 1.0) {
      const R = Math.max(0.4, rBohr);
      const z = Math.max(0.5, zeta);
      const rho = z * R;
      const S = Math.exp(-rho) * (1 + rho + (rho * rho) / 3);
      const jp0 = (1 / rho) - Math.exp(-2 * rho) * (1 + 1 / rho);
      const kp0 = Math.exp(-rho) * (1 + rho);
      const HAA = 0.5 * z * z - z - z * jp0;
      const TAB = z * z * (-0.5 * S + kp0);
      const HAB = TAB - 2 * z * kp0;
      const eBondHa = (HAA + HAB) / (1 + S) + 1 / R;
      const eAntiHa = (HAA - HAB) / Math.max(1e-6, 1 - S) + 1 / R;
      // Reference energy of separated H(1s) + H+ is -0.5 Ha
      const dEBondEv = (eBondHa + 0.5) * CONST.HA_EV;
      const dEAntiEv = (eAntiHa + 0.5) * CONST.HA_EV;
      return {
        rBohr: R,
        rA: R * CONST.BOHR_A,
        zeta: z,
        S,
        dEBondEv,
        dEAntiEv,
      };
    },
    evalVariational(rBohr) {
      // Golden-section / grid refinement for optimal orbital exponent zeta* > 1 (orbital contraction)
      let lo = 0.85, hi = 2.0;
      const phi = (Math.sqrt(5) - 1) / 2;
      let c = hi - phi * (hi - lo);
      let d = lo + phi * (hi - lo);
      let fc = h2plusModel.evalAt(rBohr, c).dEBondEv;
      let fd = h2plusModel.evalAt(rBohr, d).dEBondEv;
      for (let i = 0; i < 40; i++) {
        if (fc < fd) {
          hi = d; d = c; fd = fc;
          c = hi - phi * (hi - lo);
          fc = h2plusModel.evalAt(rBohr, c).dEBondEv;
        } else {
          lo = c; c = d; fc = fd;
          d = lo + phi * (hi - lo);
          fd = h2plusModel.evalAt(rBohr, d).dEBondEv;
        }
      }
      return h2plusModel.evalAt(rBohr, 0.5 * (lo + hi));
    },
    curve(variational = false) {
      const pts = [];
      let minR = 2.0, minE = 1e9, minZ = 1.0, minS = 0;
      for (let i = 0; i <= 110; i++) {
        const R = 0.7 + (i / 110) * 5.5;
        const r = variational ? h2plusModel.evalVariational(R) : h2plusModel.evalAt(R, 1.0);
        pts.push(r);
        if (r.dEBondEv < minE) {
          minE = r.dEBondEv;
          minR = R;
          minZ = r.zeta;
          minS = r.S;
        }
      }
      return {
        variational: !!variational,
        pts,
        min: { rBohr: minR, rA: minR * CONST.BOHR_A, dEEv: minE, deEv: -minE, zeta: minZ, S: minS },
      };
    },
    // 2-D cross-section of LCAO wavefunction psi(x, y) around nuclei at (-R/2, 0) and (+R/2, 0) in Bohr
    densityGrid(rBohr, zeta, antibond, nx = 64, ny = 34) {
      const xMax = 4.6, yMax = 2.4;
      const half = 0.5 * rBohr;
      const S = Math.exp(-zeta * rBohr) * (1 + zeta * rBohr + (zeta * zeta * rBohr * rBohr) / 3);
      const norm = 1 / Math.sqrt(Math.max(1e-4, 2 * (antibond ? 1 - S : 1 + S)));
      const pref = Math.sqrt((zeta * zeta * zeta) / Math.PI);
      const grid = new Float32Array(nx * ny);
      let maxAbs = 0;
      for (let iy = 0; iy < ny; iy++) {
        const y = -yMax + (iy / (ny - 1)) * 2 * yMax;
        for (let ix = 0; ix < nx; ix++) {
          const x = -xMax + (ix / (nx - 1)) * 2 * xMax;
          const rA = Math.sqrt((x + half) * (x + half) + y * y);
          const rB = Math.sqrt((x - half) * (x - half) + y * y);
          const phiA = pref * Math.exp(-zeta * rA);
          const phiB = pref * Math.exp(-zeta * rB);
          const psi = norm * (antibond ? (phiA - phiB) : (phiA + phiB));
          grid[iy * nx + ix] = psi;
          if (Math.abs(psi) > maxAbs) maxAbs = Math.abs(psi);
        }
      }
      return { nx, ny, xMax, yMax, grid, maxAbs };
    },
  };

  /* ───────── Shared Jacobi symmetric matrix eigensolver ───────── */
  function jacobiEigen(mat, maxSweeps = 60) {
    const n = mat.length;
    const A = mat.map(r => r.slice());
    const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    for (let s = 0; s < maxSweeps * n * n; s++) {
      let p = 0, q = 1, maxOff = 0;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const v = Math.abs(A[i][j]);
          if (v > maxOff) { maxOff = v; p = i; q = j; }
        }
      }
      if (maxOff < 1e-12) break;
      const app = A[p][p], aqq = A[q][q], apq = A[p][q];
      const tau = (aqq - app) / (2 * apq);
      const t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau));
      const c = 1 / Math.sqrt(1 + t * t);
      const sn = t * c;
      A[p][p] = app - t * apq;
      A[q][q] = aqq + t * apq;
      A[p][q] = A[q][p] = 0;
      for (let r = 0; r < n; r++) {
        if (r === p || r === q) continue;
        const arp = A[r][p], arq = A[r][q];
        A[r][p] = A[p][r] = c * arp - sn * arq;
        A[r][q] = A[q][r] = sn * arp + c * arq;
      }
      for (let r = 0; r < n; r++) {
        const vrp = V[r][p], vrq = V[r][q];
        V[r][p] = c * vrp - sn * vrq;
        V[r][q] = sn * vrp + c * vrq;
      }
    }
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => A[a][a] - A[b][b]);
    return {
      values: order.map(i => Math.abs(A[i][i]) < 1e-10 ? 0 : A[i][i]),
      vectors: order.map(i => V.map(row => row[i])),
    };
  }

  /* ───────── 3 · Bond Order & Hückel π-Conjugation Solver ─────────
   * Diagonalizes H_pi = alpha*I + beta*A in units of |beta| (beta < 0, so bonding levels are < 0).
   */
  const huckelModel = {
    BETA_OPT_EV: 2.8, // Illustrative optical |beta| scale for UV vs visible boundary (~3.1 eV violet)
    DIATOMICS: {
      h2:  { id: 'h2',  nBonding: 2, nAntibonding: 0, bondOrder: 1.0, deEv: 4.52 },
      he2: { id: 'he2', nBonding: 2, nAntibonding: 2, bondOrder: 0.0, deEv: 0.00 },
    },
    solve(N, ring) {
      const n = clamp(Math.round(N), 2, 12);
      const isRing = !!ring && n >= 3;
      const M = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n - 1; i++) {
        M[i][i + 1] = -1;
        M[i + 1][i] = -1;
      }
      if (isRing) {
        M[0][n - 1] = -1;
        M[n - 1][0] = -1;
      }
      const { values, vectors } = jacobiEigen(M);
      // Fill n pi electrons (neutral conjugated hydrocarbon)
      const occ = Array(n).fill(0);
      let rem = n;
      // Handle degeneracy cleanly when filling orbitals
      let i = 0;
      while (i < n && rem > 0) {
        let j = i + 1;
        while (j < n && Math.abs(values[j] - values[i]) < 1e-6) j++;
        const degCount = j - i;
        if (rem >= 2 * degCount) {
          for (let k = i; k < j; k++) occ[k] = 2;
          rem -= 2 * degCount;
        } else {
          // Hund's rule: half-fill degenerate orbitals first
          for (let k = i; k < j && rem > 0; k++) { occ[k] += 1; rem--; }
          for (let k = i; k < j && rem > 0; k++) { occ[k] += 1; rem--; }
        }
        i = j;
      }
      let totalBeta = 0;
      for (let k = 0; k < n; k++) totalBeta += occ[k] * values[k];
      // Delocalisation energy relative to N/2 localized double bonds (each E_pi = -2|beta|)
      const delocBeta = -totalBeta - n;
      const homoIdx = occ.reduce((acc, v, idx) => (v > 0 ? idx : acc), 0);
      // If HOMO is half-filled (e.g., 4n ring cyclobutadiene), gap is 0
      const isHalfFilled = occ[homoIdx] === 1;
      const lumoIdx = isHalfFilled ? homoIdx : Math.min(n - 1, homoIdx + 1);
      const gapBeta = isHalfFilled ? 0 : Math.max(0, values[lumoIdx] - values[homoIdx]);
      const gapEv = gapBeta * huckelModel.BETA_OPT_EV;
      const lambdaNm = gapEv > 0.05 ? 1239.84 / gapEv : Infinity;
      return {
        N: n,
        ring: isRing,
        values,
        vectors,
        occ,
        totalBeta,
        delocBeta,
        homoIdx,
        lumoIdx,
        gapBeta,
        gapEv,
        lambdaNm,
        isAromatic4n2: isRing && n % 4 === 2,
        isAntiaromatic4n: isRing && n % 4 === 0,
      };
    },
  };

  /* ───────── 4a · Two-Site Asymmetric Bond (Covalent → Ionic) ─────────
   * H = [[-Delta/2, -t], [-t, +Delta/2]]
   * Ground state energy: E_- = -sqrt((Delta/2)^2 + t^2)
   * Charge transfer q = |c_A|^2 - |c_B|^2 = Delta / sqrt(Delta^2 + 4 t^2)
   */
  const twoSiteModel = {
    eval(deltaEv, tEv = 2.0) {
      const d = Math.max(0, deltaEv);
      const t = Math.max(0.05, tEv);
      const root = Math.sqrt((d * 0.5) * (d * 0.5) + t * t);
      const eBond = -root;
      const eAnti = +root;
      const gap = 2 * root;
      const qTransfer = d / Math.sqrt(d * d + 4 * t * t);
      const pA = 0.5 * (1 + qTransfer);
      const pB = 0.5 * (1 - qTransfer);
      // Covalent energy gain relative to atomic level (-d/2)
      const covGain = root - d * 0.5;
      return {
        deltaEv: d,
        tEv: t,
        eBond,
        eAnti,
        gap,
        qTransfer,
        pA,
        pB,
        covGain,
      };
    },
  };

  /* ───────── 4b · Madelung Sum (1-D & 3-D NaCl Evjen) + Born-Haber Cycle ─────────
   * 1-D alternating chain limit: 2 * ln(2) = 1.386294...
   * 3-D NaCl rock-salt limit: 1.74756459... (Evjen neutral-cube summation, Phys. Rev. 39, 675, 1932)
   * NaCl Born-Haber data (298 K, kJ/mol, CRC / NIST Chemistry WebBook):
   *   sublimation Na(s)->Na(g): +107
   *   1/2 Cl2(g)->Cl(g):        +121
   *   IE1 Na(g)->Na+(g):        +496
   *   EA1 Cl(g)->Cl-(g):        -349
   *   Standard formation dHf:   -411
   *   Implied lattice enthalpy: -411 - (107+121+496-349) = -786 kJ/mol (literature -787 kJ/mol)
   */
  const madelungModel = {
    EXACT_1D: 2 * Math.LN2,
    EXACT_NACL: 1.7475645946,
    sum1D(K) {
      let s = 0;
      for (let k = 1; k <= K; k++) s += 2 * (k % 2 === 1 ? 1 : -1) / k;
      return s;
    },
    sumNaClEvjen(L) {
      const n = clamp(Math.round(L), 1, 12);
      let s = 0;
      for (let i = -n; i <= n; i++) {
        for (let j = -n; j <= n; j++) {
          for (let k = -n; k <= n; k++) {
            if (i === 0 && j === 0 && k === 0) continue;
            let w = 1;
            if (Math.abs(i) === n) w *= 0.5;
            if (Math.abs(j) === n) w *= 0.5;
            if (Math.abs(k) === n) w *= 0.5;
            const sign = ((i + j + k) & 1) ? 1 : -1;
            s += (w * sign) / Math.sqrt(i * i + j * j + k * k);
          }
        }
      }
      return s;
    },
    BORN_HABER_NACL: {
      sublimation: 107,
      halfDissociation: 121,
      ionization: 496,
      electronAffinity: -349,
      formationEnthalpy: -411,
      get gasIonPairCost() { return this.ionization + this.electronAffinity; }, // +147 kJ/mol
      get atomizationPlusIonization() {
        return this.sublimation + this.halfDissociation + this.ionization + this.electronAffinity; // +375
      },
      get latticeEnthalpy() {
        return this.formationEnthalpy - this.atomizationPlusIonization; // -786 kJ/mol
      },
    },
  };

  /* ───────── 5 · Molecule to Solid: 1-D Tight-Binding Chain (1-atom vs 2-atom basis) ─────────
   * Uniform chain (delta=0): E_k = -2t cos(ka), bandwidth W = 4t, half-filled => metal (Eg = 0).
   * Two-atom basis (alternating on-site +-delta/2): E_k = +-sqrt((delta/2)^2 + 4t^2 cos^2(ka/2)),
   * opens exact band gap Eg = delta at the Brillouin zone boundary (half-filled => insulator/semiconductor).
   */
  const bandModel = {
    solve(N, deltaEv, tEv = 2.0, twoAtom = true) {
      const n = clamp(Math.round(N), 2, 64);
      const d = twoAtom ? Math.max(0, deltaEv) : 0;
      const t = Math.max(0.2, tEv);
      const M = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        M[i][i] = (i % 2 === 0 ? -0.5 : 0.5) * d;
        if (i + 1 < n) {
          M[i][i + 1] = -t;
          M[i + 1][i] = -t;
        }
      }
      // Periodic boundary for clean Bloch k-sampling when n >= 4
      if (n >= 4 && n % 2 === 0) {
        M[0][n - 1] = -t;
        M[n - 1][0] = -t;
      }
      const { values } = jacobiEigen(M, 40);
      // In large-N Bloch limit:
      const kPts = [];
      for (let i = 0; i <= 80; i++) {
        const ka = -Math.PI + (i / 80) * 2 * Math.PI;
        if (d < 1e-6) {
          kPts.push({ ka, lower: -2 * t * Math.cos(ka), upper: null });
        } else {
          // Two-atom unit cell of length 2a: E = +- sqrt((d/2)^2 + 4 t^2 cos^2(ka/2))
          const c = Math.cos(0.5 * ka);
          const e = Math.sqrt(0.25 * d * d + 4 * t * t * c * c);
          kPts.push({ ka, lower: -e, upper: +e });
        }
      }
      const half = Math.floor(n / 2);
      const homo = values[half - 1];
      const lumo = values[half];
      const finiteGap = lumo - homo;
      const bulkGap = d;
      const bandwidth = 2 * Math.sqrt(0.25 * d * d + 4 * t * t) - d;
      let kind = 'metal';
      if (bulkGap > 0.05 && bulkGap < 3.2) kind = 'semiconductor';
      else if (bulkGap >= 3.2) kind = 'insulator';
      return {
        N: n,
        deltaEv: d,
        tEv: t,
        twoAtom: !!twoAtom,
        values,
        kPts,
        homo,
        lumo,
        finiteGap,
        bulkGap,
        bandwidth,
        kind,
      };
    },
  };

  /* ───────── 6 · Molecular Shape: Coulson's Theorem & Bent's Rule Bookkeeping ─────────
   * For two equivalent sp^m hybrids, orthogonality requires: s + (1 - s) cos(theta) = 0
   * => cos(theta) = -s / (1 - s) = -1 / m, where s = 1 / (1 + m).
   * In molecules with lone pairs (e.g. NH3, H2O), lone pairs take extra s-character,
   * reducing s_bond and compressing the H-X-H bond angle via Bent's rule.
   */
  const hybridModel = {
    PRESETS: {
      beh2: { id: 'beh2', sBond: 0.50,  nBonds: 2, nLone: 0, expAngle: 180.0, formula: 'BeH₂' },
      bf3:  { id: 'bf3',  sBond: 1 / 3, nBonds: 3, nLone: 0, expAngle: 120.0, formula: 'BF₃' },
      ch4:  { id: 'ch4',  sBond: 0.25,  nBonds: 4, nLone: 0, expAngle: 109.5, formula: 'CH₄' },
      nh3:  { id: 'nh3',  sBond: 0.226, nBonds: 3, nLone: 1, expAngle: 107.0, formula: 'NH₃' },
      h2o:  { id: 'h2o',  sBond: 0.200, nBonds: 2, nLone: 2, expAngle: 104.5, formula: 'H₂O' },
      h2s:  { id: 'h2s',  sBond: 0.035, nBonds: 2, nLone: 2, expAngle: 92.1,  formula: 'H₂S' },
    },
    angleFromS(sBond) {
      const s = clamp(sBond, 0.001, 0.5);
      const cosT = clamp(-s / (1 - s), -1, 0);
      const deg = (Math.acos(cosT) * 180) / Math.PI;
      const m = (1 - s) / s;
      return { sBond: s, pShare: 1 - s, m, angleDeg: deg };
    },
    eval(sBond, nBonds = 2, nLone = 2) {
      const maxS = Math.min(0.5, 1 / Math.max(2, nBonds));
      const s = clamp(sBond, 0.005, maxS);
      const res = hybridModel.angleFromS(s);
      const sLone = nLone > 0 ? Math.max(0, (1 - nBonds * s) / nLone) : 0;
      return {
        ...res,
        nBonds,
        nLone,
        sLone,
      };
    },
  };

  /* ───────── 7 · Weak Forces, Lennard-Jones 12-6 & 2-D Velocity-Verlet MD ─────────
   * Argon LJ parameters (Rahman 1964): epsilon/kB = 120 K (0.9977 kJ/mol), sigma = 3.40 A.
   * Minimum at r_min = 2^(1/6) * sigma = 1.122462 * sigma = 3.816 A, V(r_min) = -epsilon.
   * Tabulated normal boiling points (1 atm) from CRC / NIST WebBook.
   */
  const ljMdModel = {
    ARGON: { sigmaA: 3.40, epsK: 120, epsKjMol: 120 * CONST.R_KJMOL_K },
    RT_298_KJMOL: 298.15 * CONST.R_KJMOL_K, // ~2.479 kJ/mol
    FORCES_KJMOL: [
      { id: 'disp',    eMin: 1,   eMax: 5,   rep: 1.0,  label: 'Ar–Ar' },
      { id: 'dipole',  eMin: 2,   eMax: 10,  rep: 5.0,  label: 'HCl–HCl' },
      { id: 'hbond',   eMin: 15,  eMax: 25,  rep: 20.0, label: 'H₂O···H₂O' },
      { id: 'covalent',eMin: 300, eMax: 500, rep: 348,  label: 'C–C' },
      { id: 'ionic',   eMin: 700, eMax: 900, rep: 786,  label: 'NaCl' },
    ],
    BOILING_POINTS: [
      { id: 'he',   bpK: 4.2,   type: 'disp' },
      { id: 'ne',   bpK: 27.1,  type: 'disp' },
      { id: 'ar',   bpK: 87.3,  type: 'disp' },
      { id: 'ch4',  bpK: 111.7, type: 'disp' },
      { id: 'nh3',  bpK: 239.8, type: 'hbond' },
      { id: 'hf',   bpK: 292.6, type: 'hbond' },
      { id: 'h2o',  bpK: 373.2, type: 'hbond' },
      { id: 'nacl', bpK: 1738,  type: 'ionic' },
      { id: 'sio2', bpK: 3220,  type: 'network' },
    ],
    WATER_DENSITY_0C: { iceGcm3: 0.917, waterGcm3: 0.9998 },
    rMinSigma: Math.pow(2, 1 / 6),
    potential(rSigma, eps = 1.0) {
      const sr = 1 / Math.max(0.75, rSigma);
      const sr6 = sr * sr * sr * sr * sr * sr;
      return 4 * eps * (sr6 * sr6 - sr6);
    },
    forceMag(rSigma, eps = 1.0) {
      // -dV/dr in reduced units (positive = repulsive)
      const r = Math.max(0.75, rSigma);
      const sr = 1 / r;
      const sr6 = sr * sr * sr * sr * sr * sr;
      return (24 * eps / r) * (2 * sr6 * sr6 - sr6);
    },
    // Deterministic PRNG (Mulberry32)
    rng(seed) {
      let s = seed >>> 0;
      return () => {
        s += 0x6D2B79F5;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    createSim({ N = 25, L = 12.0, Tstar = 0.20, epsScale = 1.0, seed = 42 } = {}) {
      const rand = ljMdModel.rng(seed);
      const x = new Float64Array(N);
      const y = new Float64Array(N);
      const vx = new Float64Array(N);
      const vy = new Float64Array(N);
      const fx = new Float64Array(N);
      const fy = new Float64Array(N);
      // Place in compact triangular cluster in the center of the periodic box so melting/evaporation is unmistakable
      const cols = Math.ceil(Math.sqrt(N));
      const spacing = 1.12;
      const cx0 = 0.5 * L - 0.5 * (cols - 1) * spacing;
      const cy0 = 0.5 * L - 0.5 * (Math.ceil(N / cols) - 1) * spacing * 0.866;
      for (let i = 0; i < N; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        x[i] = cx0 + col * spacing + (row % 2 ? 0.5 * spacing : 0);
        y[i] = cy0 + row * spacing * 0.866;
        vx[i] = (rand() - 0.5);
        vy[i] = (rand() - 0.5);
      }
      // Remove net momentum and scale velocities to target T*
      let mvx = 0, mvy = 0;
      for (let i = 0; i < N; i++) { mvx += vx[i]; mvy += vy[i]; }
      mvx /= N; mvy /= N;
      let ke = 0;
      for (let i = 0; i < N; i++) {
        vx[i] -= mvx; vy[i] -= mvy;
        ke += 0.5 * (vx[i] * vx[i] + vy[i] * vy[i]);
      }
      const curT = ke / Math.max(1, N - 1);
      const scale = curT > 1e-8 ? Math.sqrt(Tstar / curT) : 0;
      for (let i = 0; i < N; i++) { vx[i] *= scale; vy[i] *= scale; }

      const rc = 2.8;
      const rc2 = rc * rc;
      const sr2c = 1 / rc2;
      const sr6c = sr2c * sr2c * sr2c;
      const vShift = 4 * (sr6c * sr6c - sr6c); // shifted LJ for smooth cutoff

      function computeForces(eps) {
        fx.fill(0); fy.fill(0);
        let U = 0;
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            let dx = x[i] - x[j];
            let dy = y[i] - y[j];
            if (dx > 0.5 * L) dx -= L; else if (dx < -0.5 * L) dx += L;
            if (dy > 0.5 * L) dy -= L; else if (dy < -0.5 * L) dy += L;
            const r2 = dx * dx + dy * dy;
            if (r2 < rc2) {
              const r2eff = Math.max(0.55, r2);
              const inv2 = 1 / r2eff;
              const inv6 = inv2 * inv2 * inv2;
              const fOverR = 24 * eps * inv2 * (2 * inv6 * inv6 - inv6);
              fx[i] += fOverR * dx;
              fy[i] += fOverR * dy;
              fx[j] -= fOverR * dx;
              fy[j] -= fOverR * dy;
              U += eps * (4 * (inv6 * inv6 - inv6) - vShift);
            }
          }
        }
        return U;
      }

      let U = computeForces(epsScale);

      function step(dt = 0.008, targetT = Tstar, eps = epsScale, thermostat = true) {
        const halfDt = 0.5 * dt;
        for (let i = 0; i < N; i++) {
          vx[i] += halfDt * fx[i];
          vy[i] += halfDt * fy[i];
          x[i] = ((x[i] + dt * vx[i]) % L + L) % L;
          y[i] = ((y[i] + dt * vy[i]) % L + L) % L;
        }
        U = computeForces(eps);
        let K = 0;
        for (let i = 0; i < N; i++) {
          vx[i] += halfDt * fx[i];
          vy[i] += halfDt * fy[i];
          K += 0.5 * (vx[i] * vx[i] + vy[i] * vy[i]);
        }
        if (thermostat && targetT > 0) {
          const instT = K / Math.max(1, N - 1);
          if (instT > 1e-8) {
            const lam = Math.sqrt(1 + (dt / 0.12) * (targetT / instT - 1));
            const s = clamp(lam, 0.9, 1.1);
            for (let i = 0; i < N; i++) { vx[i] *= s; vy[i] *= s; }
            K *= s * s;
          }
        }
        const Tinst = K / Math.max(1, N - 1);
        return { K, U, E: K + U, Tinst };
      }

      function metrics() {
        let K = 0;
        let nnPairs = 0;
        for (let i = 0; i < N; i++) {
          K += 0.5 * (vx[i] * vx[i] + vy[i] * vy[i]);
          for (let j = i + 1; j < N; j++) {
            let dx = x[i] - x[j];
            let dy = y[i] - y[j];
            if (dx > 0.5 * L) dx -= L; else if (dx < -0.5 * L) dx += L;
            if (dy > 0.5 * L) dy -= L; else if (dy < -0.5 * L) dy += L;
            if (dx * dx + dy * dy < 1.5 * 1.5) nnPairs++;
          }
        }
        const coordNum = (2 * nnPairs) / N;
        const Tinst = K / Math.max(1, N - 1);
        let phase = 'liquid';
        if (coordNum >= 3.2 && Tinst < 0.35 * epsScale) phase = 'solid';
        else if (coordNum < 1.4 || Tinst > 0.85 * epsScale) phase = 'gas';
        return { K, U, E: K + U, Tinst, coordNum, phase };
      }

      return { N, L, x, y, vx, vy, step, metrics };
    },
  };

  /* ───────── 8 · Structure Decides Properties: Shear-Slip Energy Landscape ─────────
   * Computes normalized periodic slip energy U(dx/a) when one crystal plane slides over the next:
   * - Metal (Cu): close-packed electron sea -> smooth low Peierls barrier (~0.08 eV/atom) -> ductile.
   * - Ionic (NaCl): sliding by a/2 brings like charges (+/+ and -/-) face-to-face -> sharp repulsive
   *   electrostatic jump (+3.8 eV/ion pair) -> crystal cleaves/shatters (brittle).
   * - Diamond (C, sp3): shearing requires stretching/breaking directional covalent bonds (~3.6 eV/bond)
   *   -> extreme stiffness/hardness, brittle fracture at high stress.
   * - Graphite (C, sp2): in-plane is covalent; interlayer (3.35 A) is weak vdW registry (~0.015 eV/atom)
   *   -> basal planes glide effortlessly.
   * - Polyethylene (PE): covalent C-C backbone (~3.6 eV) with weak interchain dispersion (~0.04 eV/CH2).
   */
  const structureModel = {
    MATERIALS: {
      diamond: {
        id: 'diamond',
        bondType: 'covalent3d',
        bondKjMol: 348,
        gapEv: 5.47,
        tmK: 4713, // sublimes/melts under high pressure ~4700 K
        barrierEv: 3.60,
        ductile: false,
        conducts: 'no',
      },
      graphite: {
        id: 'graphite',
        bondType: 'layered2d',
        bondKjMol: 477, // in-plane sp2 C-C aromatic-like bond
        interlayerKjMol: 5, // weak interlayer vdW per atom
        interlayerA: 3.35,
        gapEv: 0.00,
        tmK: 3900,
        barrierEv: 0.015, // interlayer glide barrier
        ductile: false, // flakes along layers
        conducts: 'inplane',
      },
      nacl: {
        id: 'nacl',
        bondType: 'ionic',
        bondKjMol: 786,
        gapEv: 8.5,
        tmK: 1074,
        barrierEv: 0.68, // 2-D (001) plane-plane electrostatic slip flip (r0 = 2.82 A -> 5.11 eV scale)
        ductile: false,
        conducts: 'molten',
      },
      copper: {
        id: 'copper',
        bondType: 'metallic',
        bondKjMol: 338, // cohesive energy ~338 kJ/mol
        gapEv: 0.00,
        tmK: 1358,
        barrierEv: 0.08, // low Peierls-Nabarro stacking fault barrier
        ductile: true,
        conducts: 'yes',
      },
      pe: {
        id: 'pe',
        bondType: 'polymer',
        bondKjMol: 348, // backbone C-C; interchain dispersion ~4 kJ/mol per CH2
        interchainKjMol: 4,
        gapEv: 8.0,
        tmK: 408,
        barrierEv: 0.04,
        ductile: true,
        conducts: 'no',
      },
    },
    slipEnergyEv(matId, shiftFrac) {
      const m = structureModel.MATERIALS[matId] || structureModel.MATERIALS.copper;
      const u = shiftFrac - Math.floor(shiftFrac);
      if (matId === 'nacl') {
        // Explicit 2-D (001) alternating-charge plane shifted by dx = 2 * u * r0 over counter-plane
        const L = 8;
        const planeSum = dx => {
          let e = 0;
          for (let i = -L; i <= L; i++) {
            for (let j = -L; j <= L; j++) {
              const w = (Math.abs(i) === L ? 0.5 : 1) * (Math.abs(j) === L ? 0.5 : 1);
              const q = ((i + j) & 1) ? 1 : -1;
              e += (w * q) / Math.sqrt((i - dx) * (i - dx) + j * j + 1);
            }
          }
          return e;
        };
        // Scale by e^2 / (4*pi*eps0*r0) = 14.3996 / 2.82 = 5.106 eV
        const scale = 14.3996 / 2.82;
        const e0 = planeSum(0) * scale;
        const eu = planeSum(2 * u) * scale;
        const dE = Math.max(0, eu - e0);
        return { shift: u, dEEv: dE, peakEv: 0.68, netRepulsive: eu > 0, fractured: eu > 0.05 };
      }
      if (matId === 'diamond') {
        // Directional bond-breaking harmonic cusp up to fracture threshold
        const s = Math.sin(Math.PI * u);
        const dE = m.barrierEv * s * s;
        return { shift: u, dEEv: dE, peakEv: m.barrierEv, netRepulsive: false, fractured: dE > 0.9 };
      }
      const dE = 0.5 * m.barrierEv * (1 - Math.cos(2 * Math.PI * u));
      return { shift: u, dEEv: dE, peakEv: m.barrierEv, netRepulsive: false, fractured: false };
    },
  };

  /* ───────── 9 · Protein Folding: Levinthal Count & Exact 2-D HP Lattice ─────────
   * Lau & Dill (1989) 2-D Hydrophobic-Polar (HP) lattice model.
   * E = -n_HH (each non-bonded nearest-neighbor H-H contact contributes -1).
   * Sequences of length L=12 enumerate all 15,037 canonical self-avoiding walks in < 5 ms.
   */
  const hpProteinModel = {
    PRESETS: {
      designable: { id: 'designable', seq: 'HHPPPHHPPPHH' }, // unique native fold (deg = 1, minE = -4)
      bistable:   { id: 'bistable',   seq: 'HPHPPHPHPPHH' }, // 2 degenerate folds (minE = -5)
      frustrated: { id: 'frustrated', seq: 'HPHPHPHPHPHP' }, // parity prevents any H-H contact (minE = 0)
    },
    levinthalYears(N, statesPerRes = 3, ratePerSec = 1e13) {
      const log10Confs = N * Math.log10(statesPerRes);
      const secPerYr = 365.25 * 86400;
      const log10Years = log10Confs - Math.log10(ratePerSec * secPerYr);
      return {
        N,
        statesPerRes,
        log10Confs,
        log10Years,
        universeAgeYears: 1.38e10,
      };
    },
    scoreContacts(seq, coords) {
      const N = seq.length;
      const contacts = [];
      for (let i = 0; i < N; i++) {
        if (seq[i] !== 'H') continue;
        const xi = coords[i * 2], yi = coords[i * 2 + 1];
        for (let j = i + 3; j < N; j += 2) {
          if (seq[j] !== 'H') continue;
          if (Math.abs(xi - coords[j * 2]) + Math.abs(yi - coords[j * 2 + 1]) === 1) {
            contacts.push([i, j]);
          }
        }
      }
      return { E: -contacts.length, contacts };
    },
    enumerate(seq) {
      const N = seq.length;
      const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      const coords = new Int32Array(N * 2);
      const occ = new Set(['0,0', '1,0']);
      coords[0] = 0; coords[1] = 0;
      coords[2] = 1; coords[3] = 0;
      let turned = false;
      let totalWalks = 0;
      let minE = 0;
      let degeneracy = 0;
      let nativeCoords = null;
      const hist = {};

      function dfs(idx) {
        if (idx === N) {
          let c = 0;
          for (let i = 0; i < N; i++) {
            if (seq[i] !== 'H') continue;
            const xi = coords[i * 2], yi = coords[i * 2 + 1];
            for (let j = i + 3; j < N; j += 2) {
              if (seq[j] !== 'H') continue;
              if (Math.abs(xi - coords[j * 2]) + Math.abs(yi - coords[j * 2 + 1]) === 1) c++;
            }
          }
          const E = -c;
          totalWalks++;
          hist[E] = (hist[E] || 0) + 1;
          if (E < minE) {
            minE = E;
            degeneracy = 1;
            nativeCoords = Array.from(coords);
          } else if (E === minE) {
            degeneracy++;
            if (!nativeCoords) nativeCoords = Array.from(coords);
          }
          return;
        }
        const px = coords[(idx - 1) * 2], py = coords[(idx - 1) * 2 + 1];
        for (let d = 0; d < 4; d++) {
          if (!turned && d === 3) continue;
          const nx = px + dirs[d][0], ny = py + dirs[d][1];
          const key = nx + ',' + ny;
          if (occ.has(key)) continue;
          const wasTurned = turned;
          if (!turned && ny !== 0) turned = true;
          occ.add(key);
          coords[idx * 2] = nx; coords[idx * 2 + 1] = ny;
          dfs(idx + 1);
          occ.delete(key);
          turned = wasTurned;
        }
      }
      dfs(2);
      return {
        seq,
        N,
        totalWalks,
        minE,
        degeneracy,
        hist,
        nativeCoords,
      };
    },
    // Seeded pivot Monte Carlo search on 2-D lattice
    foldMC(seq, Tstar = 0.35, steps = 1600, seed = 7) {
      const rand = ljMdModel.rng(seed);
      const N = seq.length;
      const coords = [];
      for (let i = 0; i < N; i++) { coords.push(i, 0); }
      let cur = hpProteinModel.scoreContacts(seq, coords);
      let bestCoords = coords.slice();
      let bestE = cur.E;
      const trace = [cur.E];

      for (let s = 0; s < steps; s++) {
        // Gentle annealing schedule around Tstar so low-T runs escape early traps cleanly
        const temp = Math.max(0.05, Tstar * (1.4 - 0.6 * (s / steps)));
        const k = 1 + Math.floor(rand() * (N - 2));
        const rot = 1 + Math.floor(rand() * 3); // 1:90, 2:180, 3:270
        const px = coords[k * 2], py = coords[k * 2 + 1];
        const cand = coords.slice();
        const occ = new Set();
        for (let i = 0; i <= k; i++) occ.add(cand[i * 2] + ',' + cand[i * 2 + 1]);
        let valid = true;
        for (let i = k + 1; i < N; i++) {
          const dx = coords[i * 2] - px;
          const dy = coords[i * 2 + 1] - py;
          let rx = dx, ry = dy;
          if (rot === 1) { rx = -dy; ry = dx; }
          else if (rot === 2) { rx = -dx; ry = -dy; }
          else { rx = dy; ry = -dx; }
          const nx = px + rx, ny = py + ry;
          const key = nx + ',' + ny;
          if (occ.has(key)) { valid = false; break; }
          occ.add(key);
          cand[i * 2] = nx;
          cand[i * 2 + 1] = ny;
        }
        if (valid) {
          const next = hpProteinModel.scoreContacts(seq, cand);
          const dE = next.E - cur.E;
          if (dE <= 0 || rand() < Math.exp(-dE / temp)) {
            for (let i = 0; i < cand.length; i++) coords[i] = cand[i];
            cur = next;
            if (cur.E < bestE) {
              bestE = cur.E;
              bestCoords = coords.slice();
            }
          }
        }
        trace.push(cur.E);
      }
      return {
        coords,
        contacts: cur.contacts,
        E: cur.E,
        bestE,
        bestCoords,
        bestContacts: hpProteinModel.scoreContacts(seq, bestCoords).contacts,
        trace,
      };
    },
  };

  /* ───────── 10 · Frontier Data Block (as of Nov 2026) ─────────
   * Explicitly separates: established physics/math, demonstrated benchmarks, and claimed/contested outputs.
   */
  const FRONTIER = {
    asOf: '2026-11',
    scaling: {
      // Relative cost scaling in arbitrary compute units anchored at N=10
      // MLIP: O(N), KS-DFT: O(N^3), CCSD(T): O(N^7)
      evalAt(N) {
        const n = Math.max(2, N);
        const mlip = n / 10;
        const dft = Math.pow(n / 10, 3);
        const ccsd = Math.pow(n / 10, 7);
        return { N: n, mlip, dft, ccsd };
      },
    },
    items: [
      {
        id: 'dft_ladder',
        status: 'established',
        asOf: '2026-11',
        metricLabel: 'O(N³) vs O(N⁷)',
      },
      {
        id: 'mlip_matbench',
        status: 'demonstrated',
        asOf: '2026-11',
        omat24StructuresM: 100,
        esenF1: 0.925,
        esenDaf: 6.07,
        maceF1: 0.91,
      },
      {
        id: 'af3_casp16',
        status: 'demonstrated',
        asOf: '2026-11',
      },
      {
        id: 'gnome_critique',
        status: 'contested',
        asOf: '2026-11',
        proposedM: 2.2,
        stableK: 380,
      },
      {
        id: 'mattergen',
        status: 'demonstrated',
        asOf: '2026-11',
      },
      {
        id: 'hea_2d',
        status: 'demonstrated',
        asOf: '2026-11',
      },
    ],
  };

  return {
    clamp,
    CONST,
    boxModel,
    h2plusModel,
    jacobiEigen,
    huckelModel,
    twoSiteModel,
    madelungModel,
    bandModel,
    hybridModel,
    ljMdModel,
    structureModel,
    hpProteinModel,
    FRONTIER,
  };
}));
