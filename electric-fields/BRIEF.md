# BRIEF · electric-fields 电场

- category `physics`, stage `senior` (registered ids). Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3). Template used: cell-structure (header, step nav, language toggle, dark tokens) plus the shared b3 scaffold. Verified-By: self-check only (node probe + headless-Chrome control sweep); no independent review yet.
- Model: static point charges in a 2D plane, vacuum, k = 1 teaching units.

## Steps (five items each)
**Step 0 — one charge.** Knows: force exists between charges. Question: what is a field and how does it fall with r? Input q, probe r; seek E = kq/r². Controls: flip q → all arrows reverse; double r → E ×0.25 in readout. Holds: point charge, vacuum, arrow length compressed for display.
**Step 1 — superposition.** Knows: E of one charge. Question: how is E found with two charges? Input q₁, q₂, probe (x, y); seek E₁+E₂. Controls: same/opposite signs; probe at midpoint with equal like charges → E = 0. Holds: linear vacuum electrostatics; arrows rescaled to the largest (ratios true).
**Step 2 — field lines.** Knows: E at a point. Question: how to see the whole field shape? Input q₁, q₂; seek line counts. Controls: q₁ = +3, q₂ = −1 → ≈6 lines end on −, rest escape; same signs → none connect. Holds: 6 lines per unit charge is a drawing convention; traced numerically (step 0.04), start angles evenly spaced.
**Step 3 — equipotentials.** Knows: field lines. Question: what is V and how does it relate to E? Input q₂, ΔV, probe x; seek V, |E|, angle. Controls: change ΔV → band widths change; probe moves → tick stays ⟂ E; analytic |E| equals finite-difference |∇V|. Holds: V = kq/r with zero at infinity; q₁ fixed +2.
**Step 4 — release a charge.** Knows: F = qE. Question: how does a charge move and where does the energy go? Input q/m, start x; seek trail, KE + PE. Controls: Play/Pause, Reset (clears trail, resets t and energy baseline); q/m sign flips trail; drift ≈ 0. Holds: m = 1, fixed sources, symplectic stepping dt 0.005, cut-off at 0.15.
**Step 5 — recap.** Knows: all above. Question: midpoint field of equal like charges? Quiz answer: 0. Deep links: interference#step1, momentum-collision#step2, thermodynamics#step1.

## First-appearance terms
| term | step | plain meaning |
|---|---|---|
| electric field E | 0 | force on a unit positive test charge at that point |
| test charge | 0 | tiny charge used only to probe, assumed not to disturb sources |
| superposition | 1 | total field is the vector sum of single-charge fields |
| field line | 2 | curve following E, positive to negative, count ∝ charge |
| potential V, equipotential | 3 | work per unit charge from infinity; points of equal V |
| q/m | 4 | charge-to-mass ratio setting acceleration a = (q/m)E |

## Simulation vs reality
k = 1 units, not SI; 2D layout with 1/r² law (a true 2D world would give 1/r); no conductors, dielectrics, magnetism, radiation; animation is teaching slow-motion, not real velocity; 0.15 cut-off hides the 1/r² divergence. Atlas note: node id `resonance` is not used here; this page's conceptId is `electric-fields`.
