# BRIEF · electromagnetic-induction 电磁感应

category `physics`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe, headless-Chrome control sweep); no independent review.

## Steps
**0 Flux.** Knows: magnets have fields. Question: how much field passes through the coil and how does it depend on position? Input z; seek Φ(z) = 1/(1+z²)^{3/2}. Controls: drag z → dot moves on Φ curve, max at z = 0. Holds: dipole on axis, unit loop, teaching units.
**1 Rate of change.** Knows: Φ. Question: where does the voltage come from? Input ω; seek ε = −dΦ/dt, running peak. Controls: Play accumulates Φ(t), ε(t) strip charts, Reset clears history/peak/time; ε = 0 at Φ peak; doubling ω doubles peak. Holds: magnet motion prescribed z = 3 sin ωt, no back-reaction.
**2 Lenz.** Knows: ε sign from step 1. Question: which way does the induced current go? Input v, pole flip; seek current direction and induced B. Controls: v sign flips current, flip button flips it, v = 0 → none. Holds: dipole at z = −1.5, convention CCW seen from +z gives field +z.
**3 Turns and speed.** Knows: ε formula. Question: what scales the voltage? Input N, ω; seek peak ratio = N·ω. Controls: N scales height; ω scales height and narrows; grey baseline for comparison. Holds: peak from 4000-point scan of one period.
**4 Generator.** Knows: Φ changes by rotation. Question: what voltage does a spinning coil make? Input ω, B; seek peak BAω, RMS = peak/√2. Controls: Play/Reset; ω raises density and height, B only height. Holds: A = 1, N = 1, uniform B, no load.
**5 Recap.** Quiz: double N and double ω → 4×. Links: magnetic-force#step0, derivative#step2.

## First-appearance terms
Magnetic flux Φ (0): total perpendicular field through the coil. Induced emf ε (1): voltage from changing flux. Faraday's law (1): ε = −N dΦ/dt. Lenz's law (2): induced effect opposes change. Turns N (3): loops in the coil. RMS (4): square root of mean of ε² (effective AC value).

## Simulation vs reality
No self-inductance or resistance, no braking force on the magnet (reality: Lenz drag), dipole approximation, unit loop, slow-motion animation. Static name note: the page function `drawLoop` avoids the scaffold's `loop`.
