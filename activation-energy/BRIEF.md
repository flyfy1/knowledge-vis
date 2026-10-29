# BRIEF · activation-energy 活化能

category `chemistry`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe incl. ball-launch outcomes and Arrhenius fit, headless-Chrome sweep, one screenshot check); no independent review. Dedup: reaction-rates (collision counting with a threshold and catalyst) is the particle view; this page adds the energy profile, Boltzmann fraction, Arrhenius plot/fit and reverse-reaction link; overlap judged below the 80% skip line and the reaction-rates BRIEF itself defers Arrhenius.

## Steps
**0 Energy hill.** Knows: reactions need energy. Question: why do some reactions need heating? Input Eₐ, ΔH, E; seek whether a molecule with energy E crosses (E ≥ Eₐ), Eₐ′ = Eₐ − ΔH. Controls: Launch runs an energy-conserving ball; sliders change summit/endpoint immediately (and reset the ball); Reset returns the ball. E slider offset (22 + 5k) never equals Eₐ. Holds: 1D teaching sketch.
**1 Who can climb.** Knows: Eₐ. Question: what fraction of molecules reach Eₐ? Input T, Eₐ; seek e^(−Eₐ/RT) vs 300 K. Controls: T↑ → line flatter, crossing rises orders of magnitude. Holds: exponential energy distribution.
**2 Arrhenius.** Knows: fraction. Question: how fast does k grow with T? Input T, Eₐ; seek k/k₃₀₀, 10 K factor, fitted Eₐ. Controls: Record adds ln k + ±2% deterministic simulated error; Clear removes; Eₐ change clears points. Holds: A = 1, ≥ 2 points, spread in T matters.
**3 Catalyst.** Knows: k. Question: how does a catalyst speed up and what stays fixed? Input ΔEₐ lowered, T; seek speed-up e^(ΔEₐ/RT), K ratio = 1. Controls: summit drops, endpoints stay. Holds: Eₐ = 100, ΔH = −30 fixed here.
**4 Reverse reaction.** Knows: Eₐ′. Question: how do forward and reverse compare? Input Eₐ, ΔH, T; seek k_f/k_r = e^(−ΔH/RT). Controls: ΔH sign flips which bar is taller; T↑ narrows the gap. Holds: equal A (entropy ignored).
**5 Recap.** Quiz: 50 kJ/mol, +10 K near 300 K → ≈ 2×. Links: reaction-rates#step4, chemical-equilibrium#step3, reaction-rates#step2.

## First-appearance terms
Activation energy Eₐ, reaction enthalpy ΔH, exothermic/endothermic (0); gas constant R, RT, Boltzmann factor (1); rate constant k, Arrhenius plot (2); catalyst (3); equilibrium constant ratio (3–4).

## Simulation vs reality
No orientation factor, tunnelling, T-dependent A, multi-step mechanisms or entropy; Boltzmann tail uses an exponential energy distribution; ball is not a real trajectory; fit noise is artificial.
