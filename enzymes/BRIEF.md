# BRIEF · enzymes 酶

category `biology`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe: Michaelis–Menten hand values, saturation, optimum T and pH, inhibitor parameters and rescue, seeded lock-and-key simulation ordering; headless-Chrome sweep); no independent review. Dedup: activation-energy (this batch) is the energy-hill view; this page covers biology-specific specificity, kinetics, T/pH dependence and inhibition.

## Steps
**0 Lock and key.** Knows: catalysts speed reactions. Question: how does an enzyme choose? Input substrate shape; seek products, rate over last 8 s. Controls: three shape buttons (each switch resets the run), Play/Pause, Reset clears counts. Holds: relative binding chances 1 : 0.15 : 0 per step, 3 enzymes, constant substrate count by respawn.
**1 Saturation.** Knows: binding. Question: does more substrate always help? Input [S], Kₘ, [E]; seek v = Vmax[S]/(Kₘ+[S]), occupied fraction. Controls: [S] to Kₘ gives Vmax/2; [E] doubles Vmax only. Holds: single substrate, steady state.
**2 Temperature.** Knows: rate vs T. Question: why an optimum? Input T; seek activity = Q10 speed-up (2× per 10 °C) × folded fraction (midpoint 50 °C, width 3). Controls: T slider; optimum from numeric scan (~46 °C). Holds: illustrative parameters.
**3 pH.** Knows: charged groups. Question: why do enzymes have optimum pH? Input pH, enzyme; seek activity = 1/(1+10^(pK₁−pH)+10^(pH−pK₂)). Controls: three enzymes (optima 2, 7, 8). Holds: simplified two-step ionisation.
**4 Inhibitors.** Knows: Kₘ, Vmax. Question: which inhibition can be rescued? Input [I], [S], type; seek Vmax,app, Kₘ,app. Controls: competitive recovers at high [S], non-competitive does not. Holds: Kᵢ = 2 mM, Kₘ = 1 mM, Vmax = 1.
**5 Recap.** Quiz: saturated enzyme, double S → hardly changes. Links: activation-energy#step3, reaction-rates#step4, acid-base-equilibrium#step0.

## First-appearance terms
Enzyme, active site, substrate, product (0); Vmax, Kₘ, saturation (1); denaturation, optimum temperature (2); optimum pH (3); competitive / non-competitive inhibitor, Kᵢ (4).

## Simulation vs reality
No induced fit, allostery, cofactors or multi-substrate kinetics; temperature and pH parameters illustrative; step-0 numbers fluctuate; measured rate ratio ≠ binding-chance ratio by design.
