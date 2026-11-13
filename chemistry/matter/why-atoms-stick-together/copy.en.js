(function () {
  'use strict';
  window.ESSAY_COPY = window.ESSAY_COPY || {};
  window.ESSAY_COPY.en = {
    doc: {
      title: 'Why Do Atoms Stick Together — and Why Does That Decide What Everything Is Like? — Knowledge Visualization',
      description: 'An interactive long-form essay from kinetic-energy delocalisation to covalent bonds, ionic lattices, electronic bands, molecular geometry, van der Waals condensation, materials mechanics, and protein folding.'
    },
    nav: {
      back: '← Knowledge Atlas',
      lang: 'Language'
    },
    hero: {
      kicker: 'Deep Essay · Chemistry & Structure of Matter',
      title: 'Why Do Atoms Stick Together — and Why Does That Decide What Everything Is Like?',
      sub: 'Why do two crowded electron clouds merge into one shared room? Why is salt brittle while copper draws into wire, why does graphite write while diamond cuts glass, and why does water freeze lighter than itself at 0 °C?',
      lead: 'Every quirk of matter comes down to a compromise between space and charge: electrons hate being squeezed into a tight box (quantum confinement drives kinetic energy up), yet positively charged nuclei pull them toward low potential energy. Starting from two protons sharing one electron and climbing the ladder of kinetic energy, potential energy, topology, directionality, and thermal jitter, metals, insulators, liquid argon, diamond, and folded proteins are all inevitable outcomes of the same rules at different scales.',
      note: 'Note: This essay contains eleven chapters and eleven interactive physical models. Every number is computed live by built-in solvers in your browser.'
    },
    toc: {
      label: 'Contents',
      title: 'Eleven Steps: From a 1D Box to Materials and Living Matter',
      ch1: '1. Where It Begins: Squeezing an Electron Costs Dearly',
      ch2: '2. The Simplest Bond: H₂⁺ Spreads One Wavefunction Over Two Nuclei',
      ch3: '3. Conjugation & Aromaticity: Why Benzene Is Extra Stable and Dyes Have Colour',
      ch4: '4. Ionic Bonding Is Not "Giving One Electron" — the Whole Lattice Balances the Books',
      ch5: '5. Lining Up Billions of Atoms: Metals, Semiconductors, and Insulators',
      ch6: '6. Hybridisation & Geometry: Why Methane Is Tetrahedral While Water Bends to 104.5°',
      ch7: '7. When Molecules Are Already "Satisfied", Why Do They Condense Into Liquids and Ice?',
      ch8: '8. From Bonds to Material Character: Hardness, Conduction, Ductility, and Melting Point',
      ch9: '9. The Weakest Forces Build the Most Intricate Structures: Protein Folding',
      ch10: '10. Frontier (as of November 2026): Accurate Equations, Too Slow at Scale',
      ch11: '11. Back to the Opening Question'
    },

    /* ── Ch1 ────────────────────────────────────────────── */
    ch1: {
      title: 'Where It Begins: Squeezing an Electron Costs Dearly',
      law: 'Core intuition: a chemical bond is not just "opposite charges attracting". First and foremost, it is a steep kinetic-energy discount — once an electron wave spreads across two nuclei, its wavelength lengthens, its curvature flattens, and its kinetic energy drops as 1/L².',
      p1: 'If you guess from classical electrostatics alone, two atoms stick together simply because positive nuclei attract negative electrons. Try computing the electrostatic energy, however, and you hit a wall at once: classical point charges left to themselves collapse straight into the nucleus toward minus infinity; conversely, two electrically neutral hydrogen atoms a few ångströms apart give no classical hint of why they should bond exothermically at all. To make sense of this, you have to turn to <a href="../../../physics/modern/quantum-basics/#step0">Quantum Basics · Possibility Before Outcome</a>: an electron is not a tiny steel ball, but a space-filling standing wave whose kinetic energy rises the sharper its amplitude bends.',
      eq: 'Eₙ = n² · h² / (8 mₑ L²) ≈ 37.60 eV · Å² · n² / L²',
      p2: 'Lock a single electron inside a 1D infinite square well of width L = 1.00 Å, and its ground-state (n = 1) zero-point kinetic energy already reaches 37.60 eV — roughly 2.8 times the ionisation energy of a hydrogen atom (13.6 eV). Now knock down the partition between two 1.00 Å boxes to form one 2.00 Å room (2L): the upper limit on the ground-state wavelength doubles immediately, and kinetic energy plunges to one quarter — 9.40 eV — saving 28.20 eV out of thin air. Notice that removing the wall introduces zero new electrostatic attraction; it purely gives the electron a larger room.',
      model: {
        title: 'Model 1 · 1D Quantum Box: Knocking Down the Wall Saves Kinetic Energy',
        how: 'Drag box width L, switch quantum number n, or toggle the partition to watch standing-wave nodes and 1/L² kinetic scaling.',
        aria: 'Canvas comparing 1D quantum-well standing waves and kinetic energy'
      },
      leg: {
        single: 'Single-box standing wave ψ(x)',
        merged: 'Merged 2L standing wave'
      },
      ctl: {
        len: 'Single-box width L',
        n: 'Quantum number n',
        merge: 'Remove partition (merge into 2L room)'
      },
      read: {
        single: 'Single-box KE E(L)',
        eff: 'Current KE E(L_eff)',
        save: 'Partition saving ΔE',
        ratio: 'KE multiplier'
      },
      say: {
        merged: 'With the partition gone, the effective width is {eff} Å. The n = {n} standing-wave lobe stretches out and kinetic energy drops from {e1} eV to {e2} eV (one quarter), saving {save} eV of quantum confinement cost.',
        single: 'Two closed boxes of width {L} Å each force the n = {n} wave to bend sharply inside narrow walls, pinning kinetic energy at {e1} eV; letting the electron delocalise across both boxes would immediately save {save} eV.'
      },
      p3: 'Of course, this kinetic push toward a bigger room is not free: once the well widens and the electron spreads thinner, its average distance from a nucleus grows slightly, raising potential energy a little. Whether two atoms actually stick together is decided by the tug-of-war between this steep kinetic discount, nucleus–nucleus repulsion, and electron–nucleus attraction.',
      limit: '[Model boundary] A 1D infinite square well replaces the Coulomb potential with flat-bottom hard walls, so the 28.20 eV saving is an order-of-magnitude ceiling rather than a literal bond energy; real molecules lack infinite walls, and kinetic and potential energy rebalance according to the virial theorem.'
    },

    /* ── Ch2 ────────────────────────────────────────────── */
    ch2: {
      title: 'The Simplest Bond: H₂⁺ Spreads One Wavefunction Over Two Nuclei',
      law: 'What separates bonding from antibonding is not "how much charge" is present, but whether the wavefunction interferes constructively between the two nuclei (building a charge bridge) or destructively (carving a node that expels the electron from the gap).',
      p1: 'Swap the 1D box for the simplest real molecule in the universe — the hydrogen molecular ion H₂⁺: two protons sharing a single electron. Taking two hydrogen 1s atomic orbitals χₐ and χ_b centred on protons A and B as a linear combination (LCAO), all it takes is a single 2×2 eigenvalue problem (<a href="../../../math/linear-algebra/eigenvectors/#step1">Eigenvalues & Eigenvectors · The Directions a Matrix Cannot Turn</a>) to split automatically into two channels: the symmetric sum ψ₊ = (χₐ + χ_b)/√(2+2S) is the bonding orbital, and the antisymmetric difference ψ₋ = (χₐ − χ_b)/√(2−2S) is the antibonding orbital.',
      eq: 'ψ± = (χₐ ± χ_b) / √(2 ± 2S)  ·  |ψ₊|² builds a central charge bridge; |ψ₋|² cuts a zero-density node',
      p2: 'One glance at the cross-section density map and potential curve below makes the contrast obvious: ψ₊ interferes constructively at the midpoint between the protons, piling up extra electron probability density beyond the simple sum of two isolated hydrogen atoms — a "charge-glue bridge" that hugs both protons at once and screens their mutual repulsion. By contrast, ψ₋ forces the wavefunction through zero right in the middle: the amplitude whips steeply across the node, driving kinetic energy up while banishing the electron to the outer flanks and leaving the two protons exposed to each other.',
      model: {
        title: 'Model 2 · Live Two-Centre LCAO Solver for H₂⁺',
        how: 'Drag internuclear distance R and switch between Bonding ψ₊ / Antibonding ψ₋ and Fixed 1s (ζ=1) / Variational Scaled Orbitals.',
        aria: 'H₂⁺ potential energy curve and two-centre electron density cross-section'
      },
      leg: {
        bond: 'Bonding ΔE₊(R)',
        anti: 'Antibonding ΔE₋(R)',
        exact: 'Exact benchmark (1.06 Å, -2.79 eV)'
      },
      ctl: {
        r: 'Internuclear distance R',
        orb: 'Orbital symmetry',
        basis: 'Basis scale'
      },
      opt: {
        bond: 'Bonding ψ₊ (in-phase)',
        anti: 'Antibonding ψ₋ (node)',
        z1: 'Fixed H 1s (ζ = 1.0)',
        var: 'Variational contraction (opt. ζ)'
      },
      read: {
        dist: 'Equilibrium / current R',
        energy: 'Current binding ΔE',
        overlap: 'Overlap integral S(R)',
        zeta: 'Orbital exponent ζ'
      },
      say: {
        bondVar: 'Under variational optimisation, the cloud contracts to ζ = {zeta}, dropping into a deep potential well ΔE = {de} eV at R = {rA} Å ({rBohr} a₀); overlap S = {s} builds a sturdy internuclear charge bridge.',
        bondFixed: 'With ζ fixed at 1.0, simple 1s LCAO misses near-nuclear contraction, stretching equilibrium distance to 1.32 Å (2.50 a₀) with a shallow 1.76 eV well; at current R = {rA} Å, ΔE = {de} eV and S = {s}.',
        anti: 'Switched to antibonding ψ₋: a zero-probability node slices right between the nuclei, pushing the electron outside and raising energy to {de} eV (purely repulsive). No value of R allows this orbital alone to bind two protons.'
      },
      p3: 'Watch the jump when switching from fixed ζ = 1.0 to variational contraction: with ζ = 1.0, unscaled LCAO predicts an equilibrium separation of 2.50 a₀ (1.32 Å) and dissociation energy Dₑ = 1.76 eV; simply allowing each atomic orbital to tighten slightly near the second proton (optimising to ζ ≈ 1.24 at equilibrium) pulls the bond back to 2.00 a₀ (1.06 Å) and lifts Dₑ to 2.35 eV — recovering most of the gap to the exact numerical Born–Oppenheimer result (2.00 a₀, 2.793 eV). A bond is stabilised not only by wavefunction overlap, but also by radial cloud contraction lowering potential energy.',
      limit: '[Model boundary] This solver has only 1 electron, so there is no electron–electron Coulomb repulsion, spin, or Pauli exclusion. Moving to two-electron H₂, opposite spins let both electrons share ψ₊ for a deeper bond (4.52 eV); in He₂, four electrons must fill both ψ₊ and ψ₋, cancelling the net gain (bond order = 0), which is why helium stays a monatomic gas.'
    },

    /* ── Ch3 ────────────────────────────────────────────── */
    ch3: {
      title: 'Conjugation & Aromaticity: Why Benzene Is Extra Stable and Dyes Have Colour',
      law: 'Chain N atomic π orbitals together into a conjugated line or ring, and the levels no longer split just "one up, one down" — they fan out into an N-rung staircase. Closing a 4n+2-electron loop earns a large aromatic delocalisation bonus, while lengthening an open chain squeezes the gap into visible light.',
      p1: 'Real molecules rarely stop at two atoms. Once carbon atoms build a flat σ framework using sp² hybrids, each carbon still holds one perpendicular 2p orbital, and those 2p orbitals link shoulder-to-shoulder into a π electron network. In 1931 Erich Hückel introduced a minimal tight-binding approximation: set each carbon site energy to α (taken as zero reference), nearest-neighbour hopping to β (β < 0, optically calibrated at |β| ≈ 2.8 eV), and all non-neighbour couplings to 0 — yielding an N×N adjacency matrix.',
      eq: 'Hᵢᵢ = α, Hᵢⱼ = β (if i and j are neighbours)  ·  N 2p orbitals → N discrete π levels',
      p2: 'Toggle the ring switch to compare an open chain (1,3,5-hexatriene, N = 6) against a closed ring (benzene, N = 6). Both hold exactly 6 π electrons, yet joining the ends into a hexagon immediately creates degeneracies — eigenvalues −2β, −β, −β, +β, +β, +2β from bottom to top. All 6 electrons pack neatly into the three bonding levels, yielding 2.00 |β| of delocalisation stabilisation and a wide 2.00 |β| HOMO–LUMO gap. Close 4 carbons into cyclobutadiene (4n = 4) instead, and two nonbonding levels sit right at 0: two electrons are forced to occupy degenerate orbitals singly and the gap collapses to zero. That is the clean matrix origin of the 4n+2 rule of aromaticity.',
      model: {
        title: 'Model 3 · Live Hückel π-Orbital Eigenvalue Solver',
        how: 'Choose carbon count N = 2..10 and toggle Open Chain / Closed Ring to inspect the π ladder, electron filling, and HOMO nodal pattern.',
        aria: 'Hückel π energy levels and HOMO nodal map for conjugated polyenes and rings'
      },
      leg: {
        occ: 'Occupied electrons',
        homo: 'HOMO (highest occupied)',
        lumo: 'LUMO (lowest unoccupied)'
      },
      ctl: {
        n: 'Conjugated carbons N',
        ring: 'Close ends into a ring (cyclic topology)'
      },
      read: {
        mol: 'Conjugated system',
        deloc: 'Total delocalisation energy',
        gap: 'HOMO–LUMO gap',
        lam: 'Equivalent absorption λ'
      },
      mol: {
        chain2: 'Ethylene (N=2 open chain)',
        ring2: 'Degenerate 2-site loop (N=2)',
        chain4: 'Butadiene (N=4 open chain)',
        ring4: 'Cyclobutadiene (N=4 ring · antiaromatic 4n)',
        chain6: '1,3,5-Hexatriene (N=6 open chain)',
        ring6: 'Benzene (N=6 ring · aromatic 4n+2)',
        chain8: 'Octatetraene (N=8 open chain)',
        ring8: 'Cyclooctatetraene (N=8 ring · planar 4n)',
        chain10: 'Decapentaene (N=10 open chain)',
        ring10: '[10]Annulene (N=10 ring · 4n+2)'
      },
      say: {
        aromatic: 'Aromatic 4n+2 ring (N = {n}): all bonding levels are filled with paired electrons, earning {deloc} |β| of delocalisation energy and a wide {gap} |β| HOMO–LUMO gap — which is why small rings like benzene absorb only in the far UV (~{lam} nm) and look completely colourless.',
        anti: 'Unstable 4n topology (planar N = {n} ring): a degenerate pair sits at zero energy, leaving unpaired electrons by Hund’s rule with zero gap. Real cyclobutadiene and cyclooctatetraene distort out of regular polygons — folding into a tub or alternating bond lengths — to escape this degeneracy.',
        visChain: 'Extending the open chain to N = {n} lifts delocalisation energy to {deloc} |β| while squeezing the HOMO–LUMO gap down to {gap} |β| (~{lam} nm). That is why carotenes and synthetic organic dyes absorb visible photons directly and appear orange-red or blue-violet.',
        uvChain: 'Open-chain conjugation across N = {n} carbons lets π electrons roam over all {n} sites, gaining {deloc} |β| over {half} isolated double bonds; its gap of {gap} |β| (~{lam} nm), however, still lies in the ultraviolet.'
      },
      p3: 'Click N along the open chain from 2 up to 10 and watch a steady trend emerge: every two carbons added pulls the HOMO and LUMO closer together. By N = 8 (octatetraene), the equal-bond-length model places absorption at 637 nm in the orange-red; in real molecules such as β-carotene (11 conjugated double bonds), bond-length alternation stops the gap from closing to zero, parking the peak squarely near 450 nm in the blue and painting carrots bright orange.',
      limit: '[Model boundary] The textbook Hückel matrix assumes equal bond lengths everywhere (a single β). In real polyenes with N ≥ 8, a Peierls distortion alternates shorter double bonds and longer single bonds so the gap converges to a finite plateau instead of zero; cyclooctatetraene also puckers into a non-planar tub to avoid antiaromaticity.'
    },

    /* ── Ch4 ────────────────────────────────────────────── */
    ch4: {
      title: 'Ionic Bonding Is Not "Giving One Electron" — the Whole Lattice Balances the Books',
      law: 'Moving an electron from sodium to chlorine in isolated gas phase actually loses +147 kJ/mol; table salt crystallises into a hard white solid only because a 3D alternating lattice drives the Madelung electrostatic ledger down by −786 kJ/mol.',
      p1: 'School textbooks often summarise ionic bonding in one brisk sentence: "Sodium wants to lose an electron to become stable, chlorine wants to grab one, and they snap together." Check the real numbers for ionisation energy and electronegativity in <a href="../periodic-trends/#step0">Periodic Trends · Gradients Across the Periodic Table</a>, and that story collapses at once for a single gas-phase pair: stripping one electron off gaseous Na costs +496 kJ/mol, while gaseous Cl gives back only −349 kJ/mol — leaving a net deficit of +147 kJ/mol in vacuum.',
      eq: 'E± = ±√((Δ/2)² + t²)  ·  q_transfer = (Δ/2) / √((Δ/2)² + t²)  ·  ΔHf(NaCl) = +107 + 121 + 496 − 349 − 786 = −411 kJ/mol',
      p2: 'First use the two-site heteronuclear model below to put covalent and polar-ionic bonds on a single continuum: two atomic orbitals start with an energy mismatch Δ (electronegativity difference) and hopping coupling t. When Δ = 0 (like H₂ or C—C), electron density splits 50–50, charge transfer q = 0, and sharing earns the full covalent gain; as Δ widens, the bonding orbital tilts ever more heavily toward the lower-energy atom A (population p_A climbing from 0.500 toward 0.947), while covalent stabilisation shrinks from 2.00 eV down to 0.47 eV. High polarity alone never pays the gas-phase bill — what locks NaCl into a deep thermodynamic valley is the 3D long-range lattice sum just below.',
      m1: {
        title: 'Model 4A · From Covalent to Ionic: Two-Site Continuum',
        how: 'Adjust orbital energy mismatch Δ (electronegativity gap) and hopping t to see charge shift toward atom A as covalent gain fades.',
        aria: 'Two-site polar bond energy levels and electron population diagram'
      },
      ctl: {
        delta: 'Orbital mismatch Δ (electronegativity)',
        t: 'Hopping coupling t',
        shell: 'Evjen neutral cubic shells L',
        view: 'Lattice panel view'
      },
      read: {
        q: 'Net charge transfer q',
        pa: 'Low-energy site share p_A',
        cov: 'Covalent gain ΔE_cov',
        gap: 'Bonding–antibonding gap',
        m3d: '3D NaCl truncated M',
        m1d: '1D chain sum / exact',
        gas: 'Gas-phase ionisation bill',
        lat: 'NaCl measured lattice enthalpy'
      },
      m2: {
        title: 'Model 4B · Madelung Constant & Born–Haber Thermodynamic Ledger for NaCl',
        how: 'Drag Evjen neutral shell count L (1→8), or switch to the Born–Haber Ledger to audit every enthalpy term line by line.',
        aria: 'NaCl Madelung constant convergence plot and Born–Haber enthalpy cycle'
      },
      leg: {
        nacl: '3D NaCl Evjen neutral-shell sum',
        chain1d: '1D alternating chain limit 2 ln 2'
      },
      opt: {
        mad: 'Evjen lattice convergence',
        bh: 'Born–Haber energy ledger'
      },
      sayA: {
        cov: 'Δ = {d} eV is small compared with coupling 2t (t = {t} eV): the electron spreads almost evenly across both atoms (p_A = {pa}, transfer q = {q}), earning {cov} eV of predominantly covalent delocalisation gain.',
        polar: 'Intermediate polar-covalent regime (Δ = {d} eV, t = {t} eV): the lower-energy site pulls p_A = {pa} of the electron cloud (q = {q}), yet substantial quantum mixing remains, preserving {cov} eV of covalent stabilisation.',
        ionic: 'Strongly ionic limit (Δ = {d} eV overwhelms coupling): p_A = {pa} and q = {q} leave the electron almost entirely on one site, shrinking covalent gain to {cov} eV. Isolated in gas, such an ion pair rarely pays for itself without a surrounding crystal lattice.'
      },
      sayB: {
        mad: 'Evjen’s neutral-shell scheme weights face, edge, and corner boundary ions by 1/2, 1/4, and 1/8 so every shell stays electrically neutral. At just L = {L} shells ({n3}³ cube), the 3D sum hits {m3d} (exact 1.7476), while the 1D chain reaches {m1d} (limit 2 ln 2 ≈ 1.3863).',
        bh: 'Line-by-line NaCl(s) audit: Na sublimation +107, ½ Cl₂ dissociation +121, Na ionisation +496, Cl electron affinity −349 — an isolated gas ion pair still loses +147 kJ/mol (+375 kJ/mol relative to elements). Packing ions into a 3D lattice with M = 1.7476 releases −786 kJ/mol, plunging net formation enthalpy to −411 kJ/mol.'
      },
      p3: 'Summing the 1/r Coulomb potential shell by naive concentric spheres is only conditionally convergent: whether you end on a positive or negative shell makes the sum oscillate wildly. Ewald and Evjen solved this in the 1930s by slicing boundary ions into neutral 1/2, 1/4, and 1/8 fractional blocks — by just the second shell (L = 2) the sum lands at 1.7518, and by L = 8 it settles cleanly onto 1.7476. That geometric multiplier, combined with compact ionic radii, delivers −786 kJ/mol of lattice enthalpy, making table salt both hard and high-melting (1738 K boil).',
      limit: '[Model boundary] A point-charge Madelung sum still diverges as r → 0; real crystals include short-range Born–Mayer Pauli repulsion that trims roughly 10% off the pure electrostatic attraction at equilibrium spacing, alongside minor polarisation and zero-point corrections.'
    },

    /* ── Ch5 ────────────────────────────────────────────── */
    ch5: {
      title: 'Lining Up Billions of Atoms: Metals, Semiconductors, and Insulators',
      law: 'Extend Hückel’s conjugated chain to N → ∞: if every site is equivalent with one electron per atom, the levels merge into a continuous gapless metallic band; introduce an alternating site offset Δ or bond alternation, and a forbidden band gap tears open right down the middle.',
      p1: 'What if the conjugated 2p chain from Chapter 3 did not stop at 10 atoms, but kept going through 10²³ metal or silicon atoms? You do not need a separate "solid-state quantum mechanics" — it is the exact same tight-binding hopping matrix, just scaled to large N. Around a ring of N atoms, the sparse rungs pack into a continuous energy band of total width 4|t|. Whether the finished solid conducts electricity or lets light pass through comes down to one feature at the highest occupied energy (the Fermi level): is it an unbroken sea of states, or split open by an empty gap?',
      eq: 'Uniform monatomic chain (half-filled): E(k) = −2t cos(ka) → gapless at E_F (metal)  ·  Alternating diatomic chain: E±(k) = ±√((Δ/2)² + 4t² cos²(ka/2)) → gap Eg = |Δ|',
      p2: 'In the tight-binding band lab below, first select the uniform monatomic chain with Δ = 0 eV and raise N toward 64: half-filled states run smoothly right up to E_F = 0, so even a tiny electric field nudges electrons into adjacent empty states — that is a metal (why copper and aluminium both conduct and gleam, as their free electron sea absorbs and re-emits photons across the visible spectrum). Now switch to the alternating diatomic lattice and dial in any on-site offset Δ (or split bonding and antibonding bands via tetrahedral bonding as in silicon): a band gap of width |Δ| tears open in the centre. A modest gap (~0.5–3.2 eV) is a semiconductor like silicon (1.12 eV), the basis of <a href="../../../tech/semiconductors/why-chips-are-hard/#ch1">Why Faster Chips Keep Getting Harder</a>; push the gap past ~3.5 eV and you get a transparent, non-conducting insulator (diamond at 5.5 eV).',
      model: {
        title: 'Model 5 · 1D Tight-Binding Dispersion & Metal–Insulator Transition',
        how: 'Scale atom count N from a small molecule (N=2) to a quasi-crystal (N=64), switching between Uniform Chain and Alternating Lattice with offset Δ.',
        aria: '1D tight-binding E(k) dispersion curve and density of states'
      },
      leg: {
        val: 'Valence / occupied states',
        cond: 'Conduction / empty states',
        ef: 'Fermi level E_F'
      },
      ctl: {
        n: 'Unit cells / atoms N',
        basis: 'Lattice symmetry',
        gap: 'Site potential offset Δ'
      },
      opt: {
        b1: 'Uniform chain (metallic)',
        b2: 'Alternating chain (opens gap)'
      },
      read: {
        gap: 'Bulk band gap Eg',
        width: 'Total / valence bandwidth',
        kind: 'Electronic phase',
        vis: 'Optical response'
      },
      kind: {
        metal: 'Metal (gapless)',
        semiconductor: 'Semiconductor (narrow gap)',
        insulator: 'Insulator (wide gap)'
      },
      vis: {
        metal: 'Reflective / opaque (intraband transitions)',
        ir: 'Absorbs near-IR through visible (opaque)',
        semi: 'Absorbs blue/green photons (amber-red or dark)',
        transparent: 'Visible photons lack energy to cross gap (transparent)'
      },
      say: {
        metal: 'The uniform N = {n} chain crosses the Fermi level seamlessly with Eg = 0.00 eV and bandwidth {width} eV. Free electrons drift in any applied field and interact with photons of every colour, producing metallic lustre.',
        semi: 'Alternating site potentials open a gap of Eg = {gap} eV (total bandwidth {width} eV). Visible photons span 1.65–3.10 eV: here conductivity is weak at low temperature and surges with heating or doping — the semiconductor regime.',
        insulator: 'With Eg pushed to {gap} eV — far above room-temperature thermal energy k_B T (0.026 eV) and above the highest visible photon (3.10 eV) — electrons are locked inside a full valence band and visible light passes straight through, as in diamond, quartz, and pure alumina.'
      },
      p3: 'Sliding N from 2 up to 64 reveals an often-missed quantum subtlety: at N = 2 or 6, even the "metallic" chain shows discrete level spacing; only as N grows macroscopic does that finite-size pseudo-gap shrink toward zero to separate metals from non-metals. That is also why gold nanoparticles just a few nanometres across stop looking yellow and turn ruby or purple — quantum confinement breaks the continuous band apart again.',
      limit: '[Model boundary] This is the 1D non-interacting tight-binding limit. Strong on-site electron–electron repulsion U exceeding the bandwidth can still freeze a half-filled chain into a Mott insulator; conversely, in 3D solids, nominally full and empty bands can overlap along different Brillouin-zone directions, keeping divalent metals like magnesium and calcium good conductors.'
    },

    /* ── Ch6 ────────────────────────────────────────────── */
    ch6: {
      title: 'Hybridisation & Geometry: Why Methane Is Tetrahedral While Water Bends to 104.5°',
      law: 'Molecular angles do not come from snapping together rigid "hybridisation blocks"; instead, the central atom gives its low-energy s character preferentially to lone pairs and electropositive ligands, and the remaining p share locks the bond angle via Coulson’s relation.',
      p1: 'If you picture only pure atomic orbitals — carbon with one spherical 2s and three perpendicular 2p orbitals at 90°, or oxygen in water with orthogonal 2p orbitals — ammonia and water ought to sit at right angles and carbon’s four bonds would never match. Real measurements show no mercy: <a href="../molecular-shapes/#step0">Molecular Shapes · Electron Pairs Keeping Out of Each Other\'s Way</a> demonstrates that methane (CH₄) has four identical bonds at exactly 109.5°, ammonia (NH₃) closes slightly to 107.0°, water (H₂O) bends to 104.5°, while hydrogen sulfide (H₂S) one row lower drops back to 92.1°.',
      eq: 'cos θ = −s / (1 − s) = −1 / m  ·  s = s-fraction in each bonding hybrid, m = (1−s)/s gives spᵐ',
      p2: 'Memorising "sp³ = 109.5°" as a rigid label misses the physics; Coulson and Bent’s rule captures what the atom actually optimises. From the central atom’s perspective, the s orbital sits closer to the nucleus and lower in energy than p orbitals. Any lone pair belongs to the central atom alone rather than sharing a partner, so it greedily hoards extra low-energy s character. That leaves the bonding hybrids slightly poorer in s (higher p index m), and orthogonality cos θ = −1/m forces the bond angle tighter: from zero-lone-pair sp³ in CH₄ (s = 25.0%, 109.5°), to 1-lone-pair NH₃ (s = 22.6%, 107.0°), to 2-lone-pair H₂O (s = 20.0% in bonds → 104.5°, while each lone pair claims 30.0% s).',
      model: {
        title: 'Model 6 · Coulson–Bent Hybridisation & Bond-Angle Resolver',
        how: 'Click the 6 real-molecule presets or drag the "Bonding-orbital s character" slider to verify bond angles and lone-pair s allocation live.',
        aria: 'Diagram of hybridised bonding lobes, lone-pair clouds, and bond angle geometry'
      },
      ctl: {
        mol: 'Real-molecule presets',
        s: 's character per bonding hybrid'
      },
      read: {
        ang: 'Predicted bond angle θ',
        idx: 'Effective hybrid spᵐ',
        sbond: 'Bond s / p share',
        slone: 's share per lone pair'
      },
      say: {
        beh2: 'BeH₂ has no lone pairs and two bonds: two 50.0% s shares form exact sp¹ hybrids (m = 1.0), opening cleanly to a linear 180.0°.',
        bf3: 'BF₃ splits its single s orbital evenly across three planar bonds (33.3% s each, sp²), locking into an equilateral 120.0° triangle.',
        ch4: 'CH₄ gives each of its four equivalent C—H bonds 25.0% s character (exact sp³, m = 3.00), bracing into the canonical 109.5° tetrahedron.',
        nh3: 'In NH₃, one lone pair claims 32.2% of the low-energy s orbital, leaving 22.6% s for each of the three N—H bonds (sp³·⁴²) and closing the angle from 109.5° to 107.0°.',
        h2o: 'H₂O has two lone pairs claiming 30.0% s each, leaving just 20.0% s per O—H bond (sp⁴·⁰⁰) and squeezing the angle to 104.5° — breaking symmetry so water carries a strong electric dipole.',
        h2s: 'Drop down to third-period H₂S: a larger 3s–3p gap, wider atomic radius, and minimal ligand crowding mean sulfur barely bothers to hybridise — lone pairs take ~46.5% s, S—H bonds hold just 3.5% s, and the angle collapses to 92.1°, almost pure orthogonal 3p orbitals.',
        custom: 'Custom hybridisation: each bonding orbital carries {sbond}% s character (effective sp^{m}). Under strict orthogonality, the angle between two bonding hybrids is locked at {ang}°; less s pushes bonds toward 90°.'
      },
      p3: 'Comparing H₂O (104.5°) and H₂S (92.1°) side by side is striking: both have identical valence electron counts, so a pure "four-pair repulsion (VSEPR)" rule struggles to explain why sulfur suddenly retreats nearly to 90°. Once you reach the third period and beyond, the radial mismatch and energy gap between s and p widen so much that mixing costs more than it returns — the atom lets its lone pair relax in the spherical 3s orbital while hydrogens attach along near-pure 3p axes.',
      limit: '[Model boundary] Coulson’s angle law cos θ = −s/(1−s) assumes strictly orthogonal hybrids pointing straight along internuclear lines. Strained three-membered rings (such as cyclopropane, 60° internuclear vs ~104° inter-orbital) form "bent/banana bonds", and hypervalent species bring in polarisation corrections.'
    },

    /* ── Ch7 ────────────────────────────────────────────── */
    ch7: {
      title: 'When Molecules Are Already "Satisfied", Why Do They Condense Into Liquids and Ice?',
      law: 'Even after every covalent valence is satisfied, fleeting quantum fluctuations in neutral electron clouds induce mutually attractive dispersion dipoles in neighbours; temperature simply pits thermal kinetic energy k_B T against potential-well depth ε.',
      p1: 'With only the first six chapters, one everyday puzzle remains unsolved: helium (He), argon (Ar), methane (CH₄), and even water (H₂O) already have completely paired electrons and saturated valences — nobody owes anyone an electron. Why, then, does argon calmly condense into a clear liquid below 87.3 K, and why is water liquid at room temperature while structurally similar hydrogen sulfide (H₂S) boils into a toxic gas far below freezing?',
      eq: 'V_LJ(r) = 4ε [ (σ / r)¹² − (σ / r)⁶ ]  ·  minimum r_min = 2¹/⁶ σ ≈ 1.1225 σ, V_min = −ε',
      p2: 'The answer hides inside the restless electron cloud beneath electrical neutrality. As two neutral atoms approach, one cloud fluctuates slightly off-centre for a femtosecond, creating an instant dipole that polarises its neighbour’s cloud into attractive London dispersion (decaying as 1/r⁶, roughly 0.1–4 kJ/mol) until electron clouds overlap and Pauli exclusion throws up a steep repulsive wall (1/r¹²). The live 2D molecular dynamics box below tracks 25 argon atoms governed purely by this Lennard-Jones potential (σ = 3.40 Å, ε = 0.998 kJ/mol): cool reduced temperature T* to 0.15 and they self-assemble into a trembling hexagonal crystal; raise T* to 0.55 and long-range order melts while coordination stays near 4–5 — that is the liquid in <a href="../particles-states/#step0">Particles & States · Temperature Is How Wildly They Move</a>; push past 1.30 and thermal kinetic energy overwhelms the well into a gas.',
      model: {
        title: 'Model 7 · 25-Atom 2D Lennard-Jones Molecular Dynamics (Velocity-Verlet)',
        how: 'Lower T* to watch crystallisation or raise T* to melt and vaporise; scale ε for stronger attraction, or check "Disable thermostat (NVE)" to verify total-energy conservation.',
        aria: '2D Lennard-Jones particle simulation and pair potential curve panel'
      },
      leg: {
        lj: 'LJ potential V(r)',
        fast: 'High-KE atom',
        slow: 'Low-KE atom'
      },
      ctl: {
        t: 'Reduced temp T* = k_B T / ε',
        eps: 'Well depth multiplier ε',
        nve: 'Disable thermostat (NVE microcanonical ensemble, check energy conservation)'
      },
      btn: {
        pause: 'Pause',
        play: 'Resume',
        step: 'Step',
        reset: 'Reset lattice'
      },
      read: {
        phase: 'Statistical phase',
        temp: 'Instantaneous T*',
        coord: 'Mean coordination',
        etot: 'Total energy E_tot'
      },
      phase: {
        solid: '2D Crystal / Solid',
        liquid: 'Cohesive Flow / Liquid',
        gas: 'Dilute Collisions / Gas'
      },
      say: {
        nve: 'Thermostat off (isolated NVE ensemble): velocity-Verlet integrates Newton’s equations cleanly as kinetic K and potential U trade back and forth while total energy E_tot = {etot} ε stays nearly flat (typical drift ~10⁻⁴ over hundreds of steps).',
        solid: 'T* = {t}, well below the LJ melting point: well depth ε easily tames thermal jitter, holding mean nearest-neighbour coordination near {coord} as all 25 atoms vibrate around local hexagonal lattice sites — just how real argon freezes below 87.3 K.',
        liquid: 'T* = {t}, inside the liquid window: atoms can hop across barriers to swap neighbours while staying trapped inside mutual −ε wells, keeping mean coordination around {coord} in a churning droplet.',
        gas: 'T* = {t}, thermal kinetic energy overwhelms attraction: particles brush past only fleetingly, mean coordination drops to {coord}, and the box fills with near-ideal elastic collisions.'
      },
      p3: 'Placing intermolecular forces on a single energy ruler makes everything click: at room temperature (298 K), the thermal yardstick is k_B T ≈ 2.48 kJ/mol. Dispersion alone in helium (bp 4.2 K) and argon (87.3 K) is far weaker than 2.48 kJ/mol, so both are gases at ambient conditions. Water, however, pairs highly electronegative oxygen with nearly bare protons to weave directional hydrogen bonds (~20 kJ/mol, an order of magnitude above typical dispersion), hoisting its boiling point from the −60 °C neighbourhood up to 373.2 K (100 °C). Better still, hydrogen bonds demand tetrahedral geometry: to complete four bonds at 0 °C, ice locks into an open hexagonal cage whose density drops to 0.917 g/cm³ versus liquid water’s 0.9998 g/cm³, floating atop winter lakes and insulating aquatic life below.',
      limit: '[Model boundary] A 2D simulation drops the third spatial degree of freedom (2D melting passes through the KTHNY hexatic transition rather than a strict first-order jump), and real water is no isotropic Lennard-Jones sphere — reproducing ice’s lower density requires directional tetrahedral hydrogen bonding and many-body polarisation.'
    },

    /* ── Ch8 ────────────────────────────────────────────── */
    ch8: {
      title: 'From Bonds to Material Character: Hardness, Conduction, Ductility, and Melting Point',
      law: 'Macroscopic behaviour depends less on "how strong the bond is" in isolation than on two architectural traits: whether bonds are locked in direction and whether electrons face a band gap. If sliding one plane past another must snap directional bonds or force like charges head-on, a crystal shatters; if a free electron sea flows around moving ions, metal draws into wire.',
      p1: 'Assemble the first seven steps into a solid block and seemingly unrelated mysteries — why diamond scratches glass yet splits cleanly along cleavage planes, why hammering copper makes it work-harden rather than crumble, why a salt crystal shatters on a tile floor while a plastic bottle twists without snapping — collapse into five answers to one test: slide one atomic plane half a lattice period (x = 0.5) past the next, and ask how tall the energy wall is and whether like charges collide.',
      p2: 'The crystal-slip simulator below lines up five canonical bonding architectures along the same normalised slip axis (for macroscopic stress–strain curves, compare <a href="../../../physics/matter/materials-science/">Materials Science · When Stress Becomes Fracture</a>). Drag slip x to 0.50 and watch each material choose its fate: diamond locks every carbon in four rigid 109.5° sp³ covalent bonds, so a half-step shift must sever high-energy directional bonds (3.60 eV barrier) — topping Mohs hardness yet cleaving catastrophically once overloaded. Graphite uses the exact same element and even stronger in-plane sp² bonds, yet relies on 0.015 eV van der Waals dispersion between sheets, letting a fingertip shear flakes right onto paper. Sodium chloride (NaCl) has non-directional bonds, yet shifting half a step aligns + with + and − with − (rocketing to +0.68 eV net repulsion) so cleavage planes pop apart. Pure copper (Cu) bathes cations in an isotropic electron sea with no fixed pairwise bonds (0.08 eV barrier), letting dislocations glide smoothly along close-packed planes — the true secret of metallic ductility.',
      model: {
        title: 'Model 8 · Crystal Slip Barriers & Mechanical/Electrical Profiles Across Five Bonding Types',
        how: 'Switch among the 5 representative solids and drag "Plane slip x" toward 0.50 to compare lattice distortion and shear energy walls.',
        aria: 'Atomic plane slip schematic and shear energy barrier curves for five bonding classes'
      },
      ctl: {
        mat: 'Select material architecture',
        shift: 'Relative plane slip x (lattice fraction)'
      },
      opt: {
        diamond: 'Diamond (3D covalent network)',
        graphite: 'Graphite (2D covalent / vdW sheets)',
        nacl: 'Sodium chloride (3D ionic lattice)',
        copper: 'Copper (metallic electron sea)',
        pe: 'Polyethylene (covalent chains + vdW)'
      },
      read: {
        barrier: 'Half-step barrier (x=0.5)',
        de: 'Current slip energy ΔE',
        mech: 'Mechanical response',
        cond: 'Conduction / thermal ref.'
      },
      mech: {
        diamond: 'Ultra-hard yet brittle (snaps directional bonds)',
        graphite: 'Ultra-strong in-plane, peels effortlessly between layers',
        nacl: 'Hard yet brittle (half-step hits like-charge repulsion)',
        copper: 'Tough & ductile (electron sea cushions dislocation glide)',
        pe: 'Flexible & plastic (chains uncoil + weak interchain slip)'
      },
      cond: {
        diamond: 'Insulator (5.5 eV) · 4713 K* high-P',
        graphite: 'In-plane semimetal · ~3900 K subl.',
        nacl: 'Insulator solid / ionic melt · 1738 K boil',
        copper: 'Good conductor (zero gap) · 1358 K melt',
        pe: 'Polymer insulator · ~400 K soften/melt'
      },
      say: {
        diamond: 'Diamond locks carbon inside a 3D directional sp³ mesh. At slip x = {shift}, shear energy already climbs by {de} eV (peak 3.60 eV): rigid enough to score glass, yet unable to relieve stress by dislocation glide, so overload snaps it along cleavage planes.',
        graphite: 'Graphite’s in-plane sp² bonds are even shorter than diamond’s, yet sheets adhere only via 0.015 eV dispersion (current ΔE = {de} eV). Same element, same covalent family — dropping dimensionality from 3D to 2D turns it into a premier solid lubricant.',
        nacl: 'At slip x = {shift} in NaCl, alternating +/− rows slide toward head-on +/+ and −/− clashes, driving energy up by {de} eV (+0.68 eV net repulsion at x = 0.5). That explains why salt resists scratching and heat yet shatters into tidy little cubes under a hammer.',
        copper: 'Copper ions float in an isotropic electron sea: sliding by x = {shift} severs zero directional bonds, keeping the half-step barrier to just 0.08 eV (current {de} eV). Dislocations multiply and glide effortlessly, letting artisans hammer copper into foil or draw kilometres of wire.',
        pe: 'Polyethylene strings carbon into tough covalent backbones tangled together by weak interchain dispersion: at x = {shift}, interchain slip costs only 0.04 eV (current {de} eV), making films pliable; align the chains straight (as in UHMWPE ballistic fibres), and load rides straight down the carbon backbone.'
      },
      p3: 'Distil Chapter 8 into a single "architecture sets character" rule: check just two axes — whether electrons have a band gap and whether bonding is locked in direction — and mechanical, thermal, optical, and electrical properties fall into place simultaneously without memorising ten thousand disconnected facts.',
      limit: '[Model boundary] Shown here is the ideal defect-free single-crystal shear barrier. Real engineering metals yield at stresses 100–1000× lower than the ideal crystal limit because real lattices already host pre-existing dislocations, grain boundaries, and precipitates.'
    },

    /* ── Ch9 ────────────────────────────────────────────── */
    ch9: {
      title: 'The Weakest Forces Build the Most Intricate Structures: Protein Folding',
      law: 'Biological machines fold in milliseconds rather than random-walking forever because natural sequences evolved funnel-shaped free-energy landscapes: reversible weak hydrophobic contacts of a few kJ/mol prune wrong shapes step by step.',
      p1: 'Now confront a seeming paradox: proteins — the muscles, antibodies, and enzymes running your cells — are stitched along their backbones by tough covalent peptide bonds (~350 kJ/mol), yet their working 3D shapes are held together almost entirely by the flimsiest non-covalent interactions: hydrogen bonds, dispersion, and the hydrophobic effect tucking oily side chains (H beads) away from water (each buried contact worth only a few kJ/mol).',
      eq: 'N = 100 residues × 3 states ≈ 3¹⁰⁰ ≈ 5 × 10⁴⁷ conformations  ·  At 10¹³ trials/s → ~10²⁷ yr (vs universe age 1.38 × 10¹⁰ yr)',
      p2: 'In 1969 Cyrus Levinthal stated the puzzle starkly: even a modest 100-residue chain with 3 dihedral choices per joint spans 3¹⁰⁰ ≈ 5 × 10⁴⁷ shapes; sampling 10¹³ conformations every second would still take ~10²⁷ years (17 orders of magnitude longer than the universe’s 13.8 billion years). Real small proteins snap into place in microseconds to milliseconds. Using the 12-bead 2D HP (hydrophobic H / polar P) lattice below, we can exhaustively enumerate all 15,037 self-avoiding walks to see why: among three 12-mer sequences, the "designable funnel" (HHPPPHHPPPHH) still has fifteen thousand tangled states, yet exactly one unique native fold hits the global minimum E_min = −4 (degeneracy g = 1), guiding thermal motion downhill like a funnel; a randomly alternating "frustrated" sequence (HPHPHPHPHPHP) cannot form a single non-bonded H—H contact, leaving all 15,037 shapes flat at E_min = 0 (g = 15,037) with nowhere to fold.',
      model: {
        title: 'Model 9 · 12-Mer 2D HP Lattice Folding & Exact 15,037-Walk Enumerator',
        how: 'Switch between the 3 sequences, tune folding temperature T*, or click "Anneal fold" to compare a unique-bottom energy funnel against degenerate or flat landscapes.',
        aria: '2D HP lattice protein conformation and exhaustive energy-distribution histogram'
      },
      leg: {
        h: 'Hydrophobic H bead (clusters to lower E)',
        p: 'Polar P bead (water-facing)',
        hh: 'Non-bonded H—H hydrophobic contact'
      },
      ctl: {
        seq: 'Select 12-mer HP sequence',
        t: 'Folding temperature T*'
      },
      opt: {
        des: 'Designable funnel (HHPPPHHPPPHH)',
        bi: 'Bistable ambiguity (HPHPPHPHPPHH)',
        fru: 'Frustrated disorder (HPHPHPHPHPHP)'
      },
      btn: {
        fold: 'Run Monte Carlo anneal'
      },
      read: {
        walks: 'Exact self-avoiding walks',
        mine: 'Global minimum E_min',
        deg: 'Ground-state degeneracy g',
        beste: 'Best annealed energy'
      },
      say: {
        designable: 'Out of all 15,037 self-avoiding walks, this designable sequence has only g = 1 path that packs 4 H—H contacts together (E_min = −4), carving a steep energy funnel that annealing finds reliably (current best {bestE}).',
        bistable: 'This sequence reaches a deeper minimum E_min = −5, yet g = 2 completely different folds share that bottom (current best {bestE}) — much like prions or fold-switching proteins, one wrong turn traps it in an alternate fold.',
        frustrated: 'Alternating H—P on a bipartite square lattice prevents any non-bonded H from ever touching another H! All 15,037 walks sit flat at E_min = 0 (g = 15,037), erasing the funnel and leaving the chain wandering like an intrinsically disordered protein (IDP).'
      },
      p3: 'This explains why evolution selects such a tiny fraction of possible amino-acid strings: biology does not weld a chain together with irreversible glue; it relies on weak, reversible contacts so local mistakes can unbind via thermal energy k_B T and try again (for the full thermodynamic rules of entropy and free energy, see <a href="../../../physics/thermal/thermodynamics/#step0">Thermodynamics · Track Energy Through a Gas</a>). If every initial contact were an unbreakable covalent bond, every chain would freeze permanently into a useless knot on step one.',
      limit: '[Model boundary] On a 2D square lattice, bipartite parity prevents alternating-index beads from ever becoming neighbours; real 3D proteins rotate freely along torsional angles, gain solvent entropy from released water cages, and occasionally add disulfide locks or chaperone assistance.'
    },

    /* ── Ch10 ───────────────────────────────────────────── */
    ch10: {
      title: 'Frontier (as of November 2026): Accurate Equations, Too Slow at Scale',
      law: 'The underlying equations were written down nearly a century ago; what bottlenecks computational chemistry and materials discovery today is not missing laws, but the O(N³) to O(N⁷) compute chasm between accuracy and scale.',
      p1: 'Summarising Chapters 1–9 in one line, Paul Dirac noted back in 1929 that the fundamental physical laws for all of chemistry are completely known — the sole difficulty is that the equations are far too complex to solve exactly. As atom count N grows, wavefunction gold standards such as CCSD(T) explode as O(N⁷), capping out at a few hundred atoms; even workhorse density functional theory (DFT) scales as O(N³) and stalls well before tens of thousands of atoms and microseconds — whereas real crystal screening, alloys, and protein dynamics demand millions of atoms over long timescales.',
      p2: 'The scaling comparator below visualises how O(N) machine-learning interatomic potentials (MLIPs) pull orders of magnitude ahead of O(N³) DFT and O(N⁷) CCSD(T) past N = 50; the evidence cards beneath separate the frontier as of November 2026 into established physical foundations, demonstrated benchmarks, and contested or open limits.',
      model: {
        title: 'Model 10 · Electronic-Structure Scaling (MLIP vs DFT vs CCSD(T)) & Frontier Evidence Board',
        how: 'Drag system size N (10→100) and filter cards by All / Established / Demonstrated / Contested to inspect the November 2026 frontier.',
        aria: 'Log–log compute scaling comparison across quantum chemistry and MLIP methods'
      },
      leg: {
        mlip: 'MLIP O(N)',
        dft: 'DFT O(N³)',
        ccsd: 'CCSD(T) O(N⁷)'
      },
      ctl: {
        n: 'System size N',
        filt: 'Filter frontier items by evidence status'
      },
      opt: {
        all: 'Show all',
        est: 'Established physics',
        demo: 'Demonstrated benchmarks',
        cont: 'Contested / open limits'
      },
      read: {
        mlip: 'MLIP relative cost O(N)',
        dft: 'DFT relative cost O(N³)',
        ccsd: 'CCSD(T) relative cost O(N⁷)',
        date: 'Frontier assessment anchor'
      },
      say: {
        n: 'At N = {n} atoms, single-step relative compute stands at {mlip} for O(N) MLIPs, {dft} for O(N³) standard DFT, and {ccsd} for O(N⁷) CCSD(T) — even wrapping a small molecule in a modest solvent shell blows past exact wavefunction budgets.'
      },
      badge: {
        established: 'Established',
        demonstrated: 'Demonstrated',
        contested: 'Contested'
      },
      f1: 'Established · No exact functional on Perdew’s "Jacob’s ladder": DFT is reliable for routine bonding and band engineering, yet no closed-form functional eliminates errors across strong non-local correlation and dispersion; CCSD(T) at O(N⁷) remains confined to small-molecule calibration.',
      f2: 'Demonstrated · Universal MLIPs & Matbench Discovery: equivariant graph networks (such as eSEN-30M-OAM, GRACE-3L-OAM-L, and MACE) trained on massive DFT corpora like OMat24 (over 100 million snapshots) push thermodynamic-stability discovery enrichment (DAF) to ~6.0 and F1 to ~0.925. Rather than solving the Schrödinger equation, they learn local potential-energy surfaces across the periodic table at O(N) cost.',
      f3: 'Demonstrated / Contested · AlphaFold 3 & CASP16 biomolecular assessments: all-atom diffusion models approach experimental accuracy on single-chain monomers, yet 2025–2026 CASP16 blind evaluations exposed stubborn gaps — multimeric stoichiometry errors, weak antibody–antigen interface accuracy, steric clashes in large RNAs, and the fact that predicting a complex geometry does not equal predicting binding free energy ΔG.',
      f4: 'Contested · Synthesizability debate over GNoME high-throughput crystals: GNoME (2023) proposed ~2.2 million crystals with 380,000 on the 0 K DFT convex hull; follow-up audits by Cheetham & Seshadri (2024) and Leeman et al. on automated A-Lab synthesis showed that many "hull-stable" entries are shallow substitutions on known phases or ignore finite-temperature entropy and kinetic pathways — leaving a wide gap between an in-silico list and crystals grown in a beaker.',
      f5: 'Demonstrated · Inverse generative crystals (MatterGen) & HEA/2D databases: diffusion models can now generate inorganic crystals conditioned on target band gaps, bulk moduli, or magnetism (MatterGen, Nature 2025), while repositories like C2DB and MLIP studies of five-element Cantor high-entropy alloys expand compositional search — yet whenever reactions cross into out-of-distribution extreme pressures, catalytic bond-breaking, or excited states, workflows still fall back on high-level quantum calculations and experiment.',
      p3: 'Seeing these boundaries clearly is reassuring rather than discouraging: AI has not replaced the quantum physics of bonding; on the contrary, it works precisely because the rules of Chapters 1–9 are clean and local (Kohn’s "nearsightedness of electronic matter"), letting graph neural networks distil local environments into O(N) surrogates — while strong long-range correlation and finite-temperature synthesis still answer to basic physics.',
      limit: '[Frontier & boundary] Every machine-learned interatomic potential inherits the systematic bias of the underlying DFT functional (typically PBE or r²SCAN) used to generate its training labels — faster fitting cannot remove errors baked into the training ground truth.'
    },

    /* ── Ch11 ───────────────────────────────────────────── */
    ch11: {
      title: 'Back to the Opening Question',
      law: 'A chemical bond is not a little physical hook bolted onto an atom; it is the lowest-free-energy balance struck when electrons flatten their wavefunctions over wider space to cut kinetic energy, negotiated against electrostatic attraction, directional geometry, and thermal noise.',
      p1: 'We can now compress the entire essay into four step-by-step causal checks answering why atoms stick together — and why different ways of sticking produce such radically different worlds:',
      q1: '1. Why they stick at all: squeezing an electron wave drives curvature and kinetic energy up as 1/L²; bringing two atoms together merges two narrow boxes into one shared room, building an in-phase charge bridge ψ₊ whose huge kinetic discount outweighs modest potential compromises.',
      q2: '2. Why bonds behave so differently: orbital mismatch Δ splits equal sharing (covalent) from polar/ionic bias; isolated ion pairs lose energy in gas until a 3D Madelung lattice locks in −786 kJ/mol; linking sites into solids produces gapless reflective metals or wide-gap transparent insulators; and how a central atom budgets its s orbital between lone pairs and bonds fixes 104.5° or 109.5° geometry.',
      q3: '3. Why weak forces build the richest order: once covalent valences close, 1/r⁶ dispersion and directional hydrogen bonds condense liquid argon, float hexagonal ice on winter lakes, and carve protein folding funnels — weakness means reversibility, allowing self-correction and biological self-assembly.',
      q4: '4. Why simulating the world is still slow: the Schrödinger rules are all in place, yet exact electron correlation scales as O(N⁷). Progress in 2026 is not rewriting physics, but exploiting locality to distil slow quantum mechanics into O(N) MLIPs that bridge first-principles theory and real synthesis.',
      sum: 'Place 10⁻⁶ eV zero-point scales, few-eV covalent bonds, tens-of-kJ/mol hydrogen bonds, and 2.48 kJ/mol room-temperature thermal jitter on the same ruler — every bar of iron you hold, every sip of water you drink, and every breath of oxygen is simply that ledger resting at equilibrium.',
      links: 'Further reading across the Knowledge Atlas: <a href="../../../physics/modern/quantum-basics/#step0">Quantum Basics · Possibility Before Outcome</a> · <a href="../../../math/linear-algebra/eigenvectors/#step1">Eigenvalues & Eigenvectors · The Directions a Matrix Cannot Turn</a> · <a href="../periodic-trends/#step0">Periodic Trends · Gradients Across the Periodic Table</a> · <a href="../molecular-shapes/#step0">Molecular Shapes · Electron Pairs Keeping Out of Each Other\'s Way</a> · <a href="../particles-states/#step0">Particles & States · Temperature Is How Wildly They Move</a> · <a href="../../../tech/semiconductors/why-chips-are-hard/#ch1">Why Faster Chips Keep Getting Harder</a> · <a href="../../../physics/thermal/thermodynamics/#step0">Thermodynamics · Track Energy Through a Gas</a> · <a href="../../../physics/matter/materials-science/">Materials Science · When Stress Becomes Fracture</a>.'
    },

    footer: 'Knowledge Visualization · Chemistry & Structure of Matter · All models solved live in-browser from physical equations',

    /* ── Canvas strings ─────────────────────────────────── */
    cv: {
      boxSingle: 'Isolated box (width L)',
      boxMerged: 'Merged box (width 2L)',
      boxWave: 'Standing wave ψₙ(x)',
      boxAxisX: 'Position x / Å',
      boxPsi: 'n={n}, L={L} Å',
      boxNote: 'E₁={e1} eV → {e2} eV',

      h2TitleV: 'ΔE(R) potential curve (eV)',
      h2TitleRho: 'Nuclear-plane density |ψ|²',
      h2AxisR: 'Internuclear R / Å',
      h2MinPt: 'Minimum',
      h2ExactPt: 'Exact 1.06 Å, -2.79 eV',
      h2Node: 'Node (density = 0)',
      h2Bridge: 'Charge bridge',
      h2Proton: 'p⁺',

      hkLevels: 'π MO levels (|β| units)',
      hkHomoVis: 'HOMO amplitudes & nodes',
      hkAxisE: 'E − α (β units)',
      hkBonding: 'Bonding (< 0)',
      hkAnti: 'Antibonding (> 0)',
      hkNonbond: 'Nonbonding 0',
      hkH: 'HOMO',
      hkL: 'LUMO',
      hkNodeSym: 'Nodes',

      tsLeft: 'Atom A orbital (−Δ/2)',
      tsRight: 'Atom B orbital (+Δ/2)',
      tsMid: 'Mixed bonding / antibonding',
      tsOcc: 'Electron population',
      tsEbond: 'Bonding E₋',
      tsEanti: 'Antibonding E₊',
      tsCovGain: 'Covalent drop',

      mdAxisX: 'Evjen neutral shells L',
      mdAxisY: 'Madelung constant M',
      mdExact3d: '3D NaCl limit 1.7476',
      mdExact1d: '1D chain limit 1.3863',
      mdBhTitle: 'NaCl Born–Haber cycle (kJ/mol)',
      mdBhZero: '0 baseline: Na(s)+½Cl₂(g)',
      mdBhSub: '+107 subl.',
      mdBhDiss: '+121 diss.',
      mdBhIp: '+496 IE',
      mdBhEa: '−349 EA',
      mdBhLat: '−786 lattice',
      mdBhNet: 'Net −411',
      mdGasDeficit: 'Gas deficit +147',

      tbTitleLeft: 'Dispersion E(k)',
      tbTitleRight: 'Density of states',
      tbAxisK: 'Wavevector k (0 → π/a)',
      tbAxisE: 'Energy (eV)',
      tbEf: 'E_F = 0',
      tbGap: 'Gap Eg = {g} eV',

      hyBond: 'Bonding',
      hyLone: 'Lone pairs',
      hyAngle: 'θ = {a}°',
      hyRatio: 's-character budget',

      md2Box: '2D periodic box (L = 12 σ)',
      md2Pot: 'Lennard-Jones V(r)/ε',
      md2Rmin: 'r_min = 1.12 σ',
      md2AxisR: 'Pair distance r / σ',
      md2Zero: 'V = 0',

      stLattice: 'Crystal slip (x = {s})',
      stCurve: 'Slip barrier ΔE(x) by bonding',
      stAxisX: 'Slip fraction x',
      stAxisY: 'Slip energy ΔE (eV)',
      stRepel: 'Like-charge clash · repulsion spikes!',

      hpFold: '2D lattice fold (E = {e})',
      hpHist: 'Energy funnel across {n} walks',
      hpAxisE: 'Contact energy E',
      hpAxisCnt: 'Conformations (log/linear)',
      hpUnique: 'Unique native!',

      frAxisX: 'Atoms N (log scale)',
      frAxisY: 'Relative compute cost (log scale)',
      frCurr: 'Current N = {n}'
    }
  };
})();
