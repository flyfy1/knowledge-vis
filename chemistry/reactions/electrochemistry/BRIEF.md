# BRIEF · electrochemistry 电化学

category `chemistry`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe with hand-calculated E°cell, Nernst, log K, Faraday; headless-Chrome sweep; one screenshot check); no independent review. Dedup: no existing electrochemistry page.

## Steps
**0 Galvanic cell.** Knows: redox = electron transfer. Question: why do electrons flow in the wire and which way? Input electrode pair; seek E°cell = E°cat − E°an and flow direction. Controls: four pair buttons, Play animates electron dots (anode → cathode). Holds: standard potentials at 25 °C.
**1 Discharge.** Knows: E°cell. Question: how does voltage change with use? Input initial [Cu²⁺], discharge speed; seek E(ξ) from Nernst, masses dissolved/plated. Controls: Play accumulates E–ξ curve, Reset clears progress and electrons; speed changes animation rate only; c₀ change resets. Holds: 1 L cells, [Zn²⁺]₀ = 0.01; ideal model ends ≈ 0.9 V (real cells collapse when electrode material depletes).
**2 Nernst.** Knows: Q. Question: E away from standard? Input log[Cu²⁺], log[Zn²⁺]; seek E = 1.10 − 0.0296 log Q, log K = 37.2. Controls: dot moves on straight line, slope −0.0296 V/decade. Holds: activity ≈ concentration.
**3 Electrolytic cell.** Knows: E. Question: what does an opposing voltage do? Input V; seek I = (E − V)/R, R = 1 Ω. Controls: V = 1.10 → I = 0, V > E reverses electrons and swaps anode/cathode labels. Holds: 1 M both sides.
**4 Faraday.** Knows: charge, mole of electrons. Question: how much Cu per charge? Input I, t; seek m = M·I·t/(nF). Controls: Play accumulates mass on the cathode and the line; Reset clears; I or t changes reset progress. Holds: 100% current efficiency.
**5 Recap.** Quiz: electrons flow anode → cathode. Links: electric-fields#step3, chemical-equilibrium#step0, activation-energy#step4.

## First-appearance terms
Oxidation / reduction, anode / cathode (0); standard electrode potential E° (0); salt bridge (0); Nernst equation, reaction quotient Q, equilibrium constant K (2); electrolytic cell (3); Faraday constant F (4).

## Simulation vs reality
Ideal potentials, no overpotential or internal resistance, activity ignored, fixed 1 L, electron dots schematic; step-1 voltage does not reach zero in the ideal model.
