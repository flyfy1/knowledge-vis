# BRIEF · titration-curves 滴定曲线

category `chemistry`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe with hand-calculated pH values, headless-Chrome sweep); no independent review. Dedup: buffer-capacity step 2 is a buffer-vs-water curve and acid-base-equilibrium is Ka/dilution; this page is the full strong/weak acid titration, equivalence leap, indicator choice and unknown-concentration practice (< 80% overlap).

## Steps
**0 Adding base.** Knows: pH scale. Question: how does pH change as base is added? Input V, strong/weak acid; seek pH(V), V_eq = 25 mL. Controls: V slider draws curve up to V; strong vs weak buttons change start pH. Holds: 25 mL of 0.1 M acid, 0.1 M NaOH, monoprotic, 25 °C.
**1 The leap.** Knows: curve. Question: where is the pH change fastest? Input V, acid kind; seek dpH/dV, steepest V (scan) = V_eq. Controls: orange slope bar peaks at 25 mL. Holds: numerical slope ±0.01 mL.
**2 Weak acid.** Knows: slope/equivalence. Question: how to read acid strength? Input pKₐ, V; seek half-equivalence pH ≈ pKₐ, equivalence pH > 7. Controls: pKₐ moves curve start and half-eq pH. Holds: Henderson–Hasselbalch approximate within ~0.02 for 0.1 M.
**3 Indicators.** Knows: leap. Question: which indicator marks the end point? Input c (log), indicator, acid kind; seek end-point V (pH = pKᵢₙ) minus 25 mL. Controls: strong+PP ≈ 0, weak+MO huge error, dilute c shortens leap and raises error. Holds: leap defined here as the pH span between 24.9 and 25.1 mL.
**4 Unknown concentration.** Knows: c·V relation. Question: find c from V. Input V; seek c = 0.1V/25; flask pink at pH ≥ 8.2. Controls: Read freezes V and reports estimate/true/error; New changes the (deterministic, seeded) unknown and resets V and the reading; moving V after reading clears the reading. Holds: phenolphthalein, strong acid.
**5 Recap.** Quiz: half-equivalence pH = pKₐ. Links: buffer-capacity#step2, acid-base-equilibrium#step0, chemical-equilibrium#step0.

## First-appearance terms
Titration, equivalence point (0); slope dpH/dV (1); Kₐ, pKₐ, half-equivalence (2); indicator, end point vs equivalence point (3).

## Simulation vs reality
No activity coefficients, CO₂, volume additivity errors beyond V0 + V, temperature effects, or indicator consumption; indicator colour change is gradual in reality (fraction formula used for colour only); numbers are not lab data.
