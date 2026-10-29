# BRIEF · carnot-cycle 卡诺循环

category `physics`, stage `university`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: thermodynamics covers state variables, isothermal vs adiabatic curves and a heat-engine efficiency bound as one step of four. This page builds the full four-step p–V loop, shows net work as enclosed area, the Q_h = W + Q_c ledger, the T-ratio ceiling and the reversed (refrigerator) cycle (<40% overlap).

## Steps
**0 Work is area.** Knows: P = nRT/V. Question: how much work in an expansion? Inputs T, V₂; seek W = T ln V₂ (nR=1) and a strip-sum check. Controls: sliders reshape the shaded area. Holds: isothermal ideal gas.
**1 Why return.** Knows: step 0. Question: how can an engine repeat? Input T_c; seek net = (T_h−T_c) ln 3. Controls: slider; green area between two isotherms. Holds: schematic joins at the ends.
**2 Four steps.** Knows: isotherm. Question: how do two adiabats close the loop? Inputs T_h, T_c, V₂/V₁; seek Q_h, Q_c, W and current step. Controls: sliders redraw the loop; Play/Pause moves the point (reduced motion steps one process per click), Back to start resets. Holds: γ = 5/3, V₃ = r(T_h/T_c)^1.5.
**3 Energy ledger.** Knows: loop. Question: where does Q_h go? Inputs T_h, T_c; seek Q_h, W, Q_c, η. Controls: sliders resize bars. Holds: r = 2.5.
**4 Ceiling.** Knows: ledger. Question: max efficiency? Inputs T_h, T_c; seek 1−T_c/T_h. Controls: sliders and three presets. Holds: kelvin, reversible limit.
**5 Reverse.** Knows: all. Question: what does the reversed loop do? Inputs hot-side and cold-side T; seek COP and work for 1000 J. Controls: sliders. Links: thermodynamics#step3, entropy#step0, kinetic-theory#step1.

## First-appearance terms
Isothermal, adiabatic (2), ∫P dV (0), Q_h/Q_c (2), efficiency (3–4), second-law ceiling (4), COP (5).

## Simulation vs reality
Ideal gas, reversible, infinitely slow cycle; nR = 1 J/K for readable numbers (multiply by n·8.31 for moles); the strip sum is a numerical check, not a measurement; real engines are irreversible.
