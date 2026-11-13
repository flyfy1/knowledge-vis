# 原子为什么会粘在一起，这又怎么决定了一切东西的性质 — Page Brief

- **Slug**: `why-atoms-stick-together`
- **Path**: `chemistry/matter/why-atoms-stick-together/`
- **Track**: Deep-track interactive essay (11 chapters, `#ch1`–`#ch11`)
- **Author**: `Antigravity (gemini-4-hydrogen)`
- **Date**: `2026-11-13`
- **Status**: `copy.zh.js` + `models.js` + `app.js` + `index.html` + `BRIEF.md` + `REGISTRY.json` + `tests/models.cjs` + `tests/browser.cjs` authored; pending serial Playwright run on port `19006` and `copy.en.js` pass.

## 1. Thesis & Narrative Ladder

Everything about how matter behaves — why salt shatters while copper draws into wire, why graphite writes while diamond cuts glass, why water freezes lighter than liquid and boils 270 K higher than H₂S, and why proteins fold in milliseconds instead of $10^{27}$ years — comes from a single multi-scale negotiation between **electronic kinetic-energy delocalization**, **electrostatic attraction/lattice packing**, **orbital symmetry & directionality**, and **thermal competition $k_B T$**:

1. **`#ch1` Particle in a 1D Box (`boxModel`)**: Confining an electron costs kinetic energy $\propto n^2 / L^2$ ($E_1(1.0\text{ \AA}) = 37.60\text{ eV}$). Merging two $1.0\text{ \AA}$ boxes into $2.0\text{ \AA}$ quarters kinetic energy to $9.40\text{ eV}$ ($\Delta E = -28.20\text{ eV}$) before electrostatics even enter.
2. **`#ch2` $H_2^+$ Two-Center LCAO (`h2plusModel`)**: In-phase $\psi_+$ builds an internuclear density bridge; out-of-phase $\psi_-$ cuts an internuclear node ($+9.23\text{ eV}$ at $2.0\text{ }a_0$). Fixed $\zeta=1$ gives $R_e = 2.50\text{ }a_0\ (1.32\text{ \AA}), D_e = 1.76\text{ eV}$; variational $\zeta(R)$ optimizes to $R_e = 2.00\text{ }a_0\ (1.06\text{ \AA}), \zeta=1.24, D_e = 2.35\text{ eV}$ vs exact Born–Oppenheimer $2.00\text{ }a_0, 2.793\text{ eV}$. Contrast with $H_2$ ($D_e = 4.52\text{ eV}$, bond order 1) and $\text{He}_2$ (bond order 0).
3. **`#ch3` Hückel $\pi$-Conjugation & Aromaticity (`huckelModel`)**: $N\times N$ adjacency matrix diagonalized in real time. Benzene ($N=6$ ring, $4n+2$) yields $[-2,-1,-1,+1,+1,+2]|\beta|$, delocalization $2.00|\beta|$, gap $2.00|\beta|$ (UV); cyclobutadiene ($N=4$ ring, $4n$) collapses to gap $0$ (degenerate nonbonding levels); open chains ($N=2..10$) compress HOMO–LUMO gap into visible wavelengths ($N=8 \Rightarrow 637\text{ nm}$ with $|\beta|=2.8\text{ eV}$).
4. **`#ch4` Polar/Ionic Continuum & Lattice Madelung Sum (`twoSiteModel`, `madelungModel`)**: Gas-phase $\text{Na}+\text{Cl}\to\text{Na}^++\text{Cl}^-$ loses $+147\text{ kJ/mol}$ ($+496 - 349$). Two-site model interpolates from $\Delta=0$ pure covalent ($q=0$, gain $2.00\text{ eV}$) to $\Delta=8\text{ eV}$ ($q=0.894$, gain $0.47\text{ eV}$). Neutral Evjen shells converge the 3D NaCl Madelung constant ($L=2 \to 1.7518$, $L=8 \to 1.7476$, exact $1.7476$) vs 1D $2\ln 2 = 1.3863$, locking the Born–Haber lattice enthalpy $-786\text{ kJ/mol}$ and $\Delta H_f = -411\text{ kJ/mol}$.
5. **`#ch5` Tight-Binding Bands & Metal–Insulator Split (`bandModel`)**: Extending $N \to 64$ turns discrete levels into a $4|t| = 8.00\text{ eV}$ band. Half-filled 1-atom chains are gapless metals; 2-atom alternating lattices open $E_g = |\Delta|$, separating metals, semiconductors (Si $1.12\text{ eV}$), and wide-gap transparent insulators (diamond $5.5\text{ eV}$, $> 3.1\text{ eV}$ visible photon limit).
6. **`#ch6` Coulson–Bent Hybridization & Molecular Geometry (`hybridModel`)**: Orthogonal $s$-$p$ hybrids follow $\cos\theta = -s/(1-s) = -1/m$. Lone pairs hoard low-energy $s$ character, compressing bond angles from $\text{BeH}_2\ (180.0^\circ)$ / $\text{BF}_3\ (120.0^\circ)$ / $\text{CH}_4\ (109.5^\circ)$ to $\text{NH}_3\ (107.0^\circ)$ and $\text{H}_2\text{O}\ (104.5^\circ, 20.0\%\text{ bond }s, 30.0\%\text{ lone }s)$, while third-row $\text{H}_2\text{S}$ drops back to $92.1^\circ$ ($3.5\%\text{ bond }s$).
7. **`#ch7` Van der Waals Condensation, Hydrogen Bonding & 2D LJ MD (`ljMdModel`)**: Instantaneous dipole dispersion ($\propto 1/r^6$) vs Pauli wall ($\propto 1/r^{12}$) in 25-atom velocity-Verlet Argon MD ($\sigma=3.40\text{ \AA}, \varepsilon=0.998\text{ kJ/mol}$, $r_{\min}=1.1225\sigma$), demonstrating solid ($T^*=0.15$), liquid ($T^*=0.55$), gas ($T^*=1.30$) and NVE energy conservation (drift $\sim 10^{-4}$ over 400 steps). Contrasts room-temp $k_B T = 2.48\text{ kJ/mol}$ against He ($4.2\text{ K}$), Ar ($87.3\text{ K}$), $\text{H}_2\text{O}$ ($373.2\text{ K}$), and ice vs water density at $0\,^\circ\text{C}$ ($0.917$ vs $0.9998\text{ g/cm}^3$).
8. **`#ch8` Bonding Architecture to Macroscopic Properties (`structureModel`)**: Half-cell slip ($x=0.5$) barriers reveal why diamond ($3.60\text{ eV}$, directional $\text{sp}^3$ fracture) cuts yet cleaves, graphite ($0.015\text{ eV}$ vdW interlayer) lubricates, NaCl ($+0.68\text{ eV}$ like-charge clash) shatters, copper ($0.08\text{ eV}$ isotropic electron sea) draws into wire, and polyethylene ($0.04\text{ eV}$ interchain) stretches.
9. **`#ch9` Weak Forces & Protein Folding Funnel (`hpProteinModel`)**: Levinthal ($3^{100} \approx 5\times 10^{47}$ conformations, $\sim 10^{27}\text{ yr}$ vs universe $1.38\times 10^{10}\text{ yr}$). Exhaustive enumeration of all $15,037$ self-avoiding 12-mer 2D HP walks contrasts `HHPPPHHPPPHH` (unique native funnel $E_{\min}=-4, g=1$), `HPHPPHPHPPHH` (bistable trap $E_{\min}=-5, g=2$), and `HPHPHPHPHPHP` (frustrated $E_{\min}=0, g=15,037$).
10. **`#ch10` Frontier as of 2026-11 (`FRONTIER`)**: $O(N)$ MLIP vs $O(N^3)$ DFT vs $O(N^7)$ CCSD(T) scaling alongside evidence-tagged cards (`established`, `demonstrated`, `contested`).
11. **`#ch11` Synthesis**: Four causal checks tying atomic scale ($\text{meV}$–$\text{eV}$) to material & biological function, with verified cross-links.

## 2. Sourced Data & Quantitative Claims (Verified 2026-11-13)

- **$H_2^+$ exact & LCAO benchmarks**: McQuarrie / Atkins *Physical Chemistry* — exact Born–Oppenheimer $R_e = 2.00\ a_0 = 1.058\text{ \AA}, D_e = 2.793\text{ eV}$; unscaled 1s LCAO $2.49\ a_0\ (1.32\text{ \AA}), 1.76\text{ eV}$; variational $\zeta$-scaled 1s $2.00\ a_0, \zeta \approx 1.24, 2.35\text{ eV}$; $H_2$ experimental $D_e = 4.52\text{ eV}$.
- **Madelung & Born–Haber NaCl**: Evjen (1932), *Phys. Rev.* **39**, 675 — 3D NaCl Madelung constant $M = 1.7476$; 1D alternating chain $2\ln 2 = 1.3863$. CRC Handbook / NIST Chemistry WebBook — NaCl Born–Haber terms: sublimation $+107$, $\frac{1}{2}\text{Cl}_2$ dissociation $+121$, Na $\text{IE}_1$ $+496$, Cl EA $-349$, $\Delta H_f^\circ = -411\text{ kJ/mol} \implies \text{lattice enthalpy } -786\text{ kJ/mol}$ (gas ion-pair deficit $+147\text{ kJ/mol}$).
- **Thermodynamic & structural constants**: CRC / NIST WebBook — normal boiling points: He $4.2\text{ K}$, Ne $27.1\text{ K}$, Ar $87.3\text{ K}$, $\text{CH}_4\ 111.7\text{ K}$, $\text{NH}_3\ 239.8\text{ K}$, HF $292.6\text{ K}$, $\text{H}_2\text{O}\ 373.2\text{ K}$, NaCl $1738\text{ K}$, $\text{SiO}_2\ 3220\text{ K}$, diamond $4713\text{ K}$ (high pressure), Cu melting $1358\text{ K}$; $0\,^\circ\text{C}$ ice density $0.917\text{ g/cm}^3$ vs liquid water $0.9998\text{ g/cm}^3$; Silicon band gap $1.12\text{ eV}$, Diamond $5.5\text{ eV}$, $k_B T_{298} = 2.48\text{ kJ/mol}$.
- **Argon Lennard-Jones parameters**: Rahman (1964), *Phys. Rev.* **136**, A405 — $\sigma = 3.40\text{ \AA}, \varepsilon/k_B = 120\text{ K} = 0.998\text{ kJ/mol}$.
- **HP 12-mer exact enumeration**: Computed directly by exhaustive backtracking over $15,037$ non-isomorphic directed 2D square-lattice walks in `models.js` (`HHPPPHHPPPHH`: $E_{\min}=-4, g=1$; `HPHPPHPHPPHH`: $E_{\min}=-5, g=2$; `HPHPHPHPHPHP`: $E_{\min}=0, g=15,037$).
- **Frontier sources (checked 2026-11-13)**:
  - **Matbench Discovery** (`matbench-discovery.materialsproject.org`): OMat24 ($>100\text{M}$ DFT snapshots); equivariant MLIP leaders `eSEN-30M-OAM` ($F_1 \approx 0.925, \text{DAF} \approx 6.07$), `GRACE-3L-OAM-L` ($F_1 \approx 0.925, \text{DAF} \approx 6.04$), `MACE`/`ORB v3`/`SevenNet-Omni` ($F_1 \approx 0.905\text{--}0.91$).
  - **GNoME & synthesizability critique**: Merchant et al., *Nature* **624** (2023) ($2.2\text{M}$ crystal predictions, $380,000$ 0 K DFT hull-stable); Cheetham & Seshadri, *Chem. Mater.* (Apr 2024) & Leeman et al., *PRX Energy* (2024) A-Lab critique on finite-$T$ entropy, shallow polymorph substitutions, and kinetic synthesis gaps.
  - **MatterGen**: Zeni et al., *Nature* (Mar 2025) inverse generative diffusion design for inorganic crystals.
  - **AlphaFold 3 & CASP16**: Abramson et al., *Nature* (2024) & CASP16 blind assessment reports (`nih.gov`, 2025/2026) — strong monomer accuracy vs ongoing limitations in multimeric stoichiometry, antibody–antigen docking, RNA steric clashes, and $\Delta G$ binding affinity.
  - **2D & HEA repositories**: DTU C2DB; Cantor CrMnFeCoNi high-entropy alloy MLIP benchmarks.

## 3. Verified Cross-Links

- `../../../physics/modern/quantum-basics/#step0`
- `../../../math/linear-algebra/eigenvectors/#step1`
- `../periodic-trends/#step0`
- `../molecular-shapes/#step0`
- `../particles-states/#step0`
- `../../../tech/semiconductors/why-chips-are-hard/#ch1`
- `../../../physics/thermal/thermodynamics/#step0`
- `../../../physics/matter/materials-science/`
