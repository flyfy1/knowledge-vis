---
lang: en
---

::: strings
pageTitle: Electric Fields · Drawing an Invisible Force
tagline: Start with one point charge, then add fields, draw field lines and equipotentials, and finally release a charge to watch it move.
:::

## Around one charge, every point carries a forecast of the force {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One charge
:::

::: html step0-1
:::

This step answers: what is an **electric field**, and how does its strength change with distance? E at a point is the force a unit positive test charge would feel there. Each arrow is E at its position: it points the way a positive test charge would be pushed, and longer means stronger (lengths are compressed so they stay readable). For a point charge E = kq/r²; this page uses k = 1 (teaching units). {#s0e .explain}

::: html step0-2
s0o: Flip only the sign of q and watch every arrow reverse; then double the probe distance r and compare the readouts: by what factor does the strength fall?
lQ: Charge q
lR: Probe distance r
:::

::: strings
dirOut: away from the charge (outward)
dirIn: toward the charge (inward)
dirNone: no charge, so E = 0
r0: q = {q}, probe at r = {r}: E = kq/r² = {e}, direction: {dir}. At 2r, E = {e2}, which is {ratio}× the current value.
:::

## Two charges: each one's field adds at every point {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Superposition
:::

::: html step1-1
:::

This step answers: with several charges, how do you find the field at one point? **Superposition**: the total field is the vector sum of the fields each charge would make alone (place the arrows head to tail). The orange arrow is q₁'s field at the probe, pink is q₂'s, and cyan is their sum E. Arrows are scaled to fit the largest one; the ratios between them are true. {#s1e .explain}

::: html step1-2
s1o: Keep the probe fixed, set q₁ and q₂ to the same sign and then to opposite signs, and watch how the cyan total is built from the orange and pink arrows. Then move the probe to the midpoint and compare the two cases.
lQ1: Charge q₁ (left)
lQ2: Charge q₂ (right)
lPx: Probe x
lPy: Probe y
:::

::: strings
r1: E₁ = ({e1x}, {e1y}), E₂ = ({e2x}, {e2y}), total E = ({ex}, {ey}), |E| = {mag}.
:::

## Field lines: draw the field as curves you can count {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Field lines
:::

::: html step2-1
:::

This step answers: how can you see the overall shape of a field at a glance? A **field line** is a curve that follows the direction of E: it leaves positive charges and ends on negative ones (or runs off to far away). The number of lines per charge is proportional to its size (this page draws 6 per unit); denser lines mean a stronger field; two lines never cross because E has only one direction at any point. {#s2e .explain}

::: html step2-2
s2o: Set q₁ = +3 and q₂ = −1, then read how many lines end on the negative charge and how many run off; next make q₂ positive and watch the lines push around each other.
:::

::: strings
r2: {n} lines in total: {hit} connect the two charges, {out} run to (or come from) far away; net charge q₁ + q₂ = {net}.
:::

## Equipotentials: no work along them, and field lines cross them at right angles {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Equipotentials
:::

::: html step3-1
:::

This step answers: what is the **potential** V, and how does it relate to E? For a point charge V = kq/r (k = 1): the work to bring a unit positive charge in from infinity. Points with equal V form an **equipotential**: the borders between colour bands on the canvas, neighbouring borders differing by ΔV. E points toward the steepest drop in V, E = −∇V, so the field lines (thin white) always cross equipotentials at right angles. q₁ is fixed at +2. {#s3e .explain}

::: html step3-2
s3o: Drag ΔV so the bands get wider or narrower; their borders are the equipotentials. Move the probe and check that the short white tick (the equipotential's tangent) stays perpendicular to the cyan E arrow, and that the analytic |E| matches the one found from differences in V.
lDv: Contour spacing ΔV
:::

::: strings
r3: Probe V = {v}; analytic |E| = {ea}; |E| from numerical differences of V = {en}; angle between E and the equipotential tangent = {ang}°.
:::

## Release a test charge: does it really follow a field line? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Release a charge
:::

::: html step4-1
:::

This step answers: how does a charge move in a field, and where does the energy go? The force is F = qE, so the acceleration is a = (q/m)E (take m = 1). Press play: the test charge starts from rest and its path builds up as a trail. Because of inertia it generally does **not** follow a field line exactly. Energy is conserved: kinetic ½v² plus potential (q/m)V stays constant (sources q₁ = +2, q₂ = −2 are fixed). {#s4e .explain}

::: html step4-2
s4o: Change q/m from +1 to −1 and play again to compare trail directions; then change the start x and play again. The energy drift in the readout should stay near 0.
lQm: Test charge q/m
lX0: Start x
bPlay: Play / Pause
bReset: Reset: clear the trail and go back to the start
:::

::: strings
st4idle: not started
st4run: running
st4pause: paused
st4hit: hit a charge, stopped (close-range cut-off)
st4out: left the view, stopped
r4: t = {t}, speed {v}, kinetic {ke}, potential {pe}, total {tot} (start {tot0}, drift {drift}%). State: {state}
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) E is the force on a unit positive test charge; for a point charge E = kq/r²; (2) fields from several charges add as vectors, point by point; (3) field lines run from positive to negative charges, with line count proportional to charge; (4) V = kq/r and E = −∇V, so field lines cross equipotentials at right angles; (5) a charge feels F = qE, and its kinetic plus potential energy stays constant. {#s5e .explain}

::: html step5-2
qq: Two charges of equal size and the same sign: what is the field at the midpoint of the line joining them?
qo0: The largest, because the two fields point the same way
qo1: Zero, because the two fields are equal and opposite
qo2: Half the field of a single charge
s5m: This page models stationary point charges in a 2D plane in vacuum electrostatics. k = 1 is a teaching unit, so the numbers are not SI values. It leaves out conductors, dielectrics, magnetic fields and radiation; the test charge does not disturb the sources; motion is cut off within 0.15 units (a real point charge has an unbounded field there); the animation is a teaching slow-motion, not a real electron speed.
lk0: Interference: two sources also add point by point; see how path difference decides reinforcement or cancellation
lk1: Momentum & collisions: another conservation ledger to compare with energy conservation here
lk2: Thermodynamics: follow work and heat through an energy ledger, like the kinetic/potential exchange here
:::

::: strings
qwhy: The two fields are equal in size and opposite in direction, so their vector sum is 0 (step 1: move the probe to the midpoint to check).
:::
