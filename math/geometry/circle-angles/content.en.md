---
lang: en
---

::: strings
docTitle: The Inscribed Angle Theorem · One Interaction at a Time
back: ← Knowledge Index
pageTitle: The Inscribed Angle Theorem
tagline: Stand on the circumference and look at the same arc: the angle you see is exactly half the angle at the centre — and it does not matter where on the arc you stand. Drag P around the circle, watch the angle refuse to move, then split the 'half' open with one auxiliary line.
foot: The Inscribed Angle Theorem · One Interaction at a Time
navLabel: Step navigation
nav0: 0 Meet the parts
nav1: 1 Drag experiment
nav2: 2 Why: one cut
nav3: 3 Diameter case
nav4: 4 The other arc
nav5: 5 Self-test
nav6: 6 Finale
:::

## Meet the parts: two angles, two different vertices {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: Question: what exactly separates a central angle from an inscribed angle? Circle O carries chord AB and a point P on the circumference. The **central angle** ∠AOB has its vertex at the centre and its sides are the radii OA and OB; the **inscribed angle** ∠APB has its vertex on the circumference and its sides are the chords PA and PB. A **chord** joins two points of the circle, and a chord through the centre is a diameter; the curve between A and B is an **arc**, and the one shorter than a semicircle is the **minor arc**. Drag P around the circle (or use the position-angle slider) and watch the name tags follow; the readout only reports the two angles as computed from coordinates — no conclusion yet. P may not coincide with A or B (the two chords degenerate and the angle is undefined), so near them it is stopped at least 2° away. This page treats plane circles only; real protractors have error, but these readings are exact geometry, not measurements.
canvasLabel: Interactive geometry for this step; instructions appear above
posLab: Position angle of P (keyboard alternative)
reset: Reset this step
:::

## Drag experiment: P runs around, the angle will not move {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: Question: if P wanders over the same arc, does ∠APB change — and how does it relate to ∠AOB? Fix A and B first (central angle 80°). The arc longer than a semicircle is the **major arc**; drag P all over it, or use the position-angle slider. The readout lines up three numbers: the central angle, the measured inscribed angle, and half the central angle. Press “Record it” to log the current position in the ledger — record at least 3 different positions and check whether every difference is about 0. Then change ∠AOB with the central-angle slider (40°–160°) and repeat: P's angle follows at once. One boundary to state honestly now: this holds only while P stays on the same arc; what happens on the other arc is step 4's business.
centralLab: Central angle ∠AOB (40°–160°)
recordBtn: Record it
s1ledgerT: Ledger: move P along the major arc (record at least 3 different positions)
s1hint: Note: the inscribed angle is computed live from the coordinates of P, A and B — 'it never moves' is a computed fact you run into, not a scripted line. In step 4 you will see the angle change the moment P switches to the other arc.
:::

::: strings
lbCentral: central angle
lbInscribed: inscribed angle
lbChord: chord
lbMinor: minor arc
lbMajor: major arc
lbRadius: radius
lbDiameter: diameter
s0ro: Central angle ∠AOB = {aob}° (computed from coordinates); inscribed angle ∠APB = {apb}° (computed from coordinates). Both angles face the same arc AB: one vertex sits at the centre, the other on the circumference.
s1ro: Central angle ∠AOB = {aob}°; inscribed angle ∠APB = {apb}° (computed geometrically, never by halving the central angle); half of the central angle = {half}°; difference = {diff}°.
s1ledgerIdle: Nothing recorded yet. Drag P somewhere new and press “Record it”.
s1entry: Entry {i}: P at position angle {pos}°, ∠AOB = {aob}°, ∠APB = {apb}°, difference from the half = {diff}°.
:::

## Why: one auxiliary line splits the big angle in two {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: Question: where does the factor 'one half' come from — can we draw it? First, recall two tools: in an **isosceles triangle**, equal sides face equal base angles; an **exterior angle** of a triangle is the supplement of one interior angle and equals the sum of the two non-adjacent interior angles (it will be marked on the figure). Press “Auxiliary line” one move at a time — never all at once: ①join OP and extend it into a diameter; ②spot the two isosceles triangles; ③the exterior angles enter; ④combine. Every number beside an equation is computed from coordinates, and dragging the central-angle slider recomputes all of them. This proof covers the main case, with the centre O inside the inscribed angle; when O falls outside (P on the other arc) the same cut gives a subtraction — reclaimed by name in step 4, and left as a cliffhanger here.
centralLab2: Central angle ∠AOB (60°–160°)
s2fixNote: Note: P is deliberately pinned in this step — only the central angle moves. The proof watches one fixed configuration: change the central angle and watch the whole chain of equalities recompute. Moving P would switch to a different configuration (P on the other arc gives the subtraction version, reclaimed in step 4). The central angle also stops at 60°: any smaller and B slides onto D, the end of the diameter, squashing the pink isosceles triangle into a line segment — there would be no second triangle left to split.
proofNext: Auxiliary line: next move
:::

::: strings
s2stage0: Construction 0/4. Look first: P is on the major arc, and ∠APB and ∠AOB face the same arc AB. Press “Auxiliary line: next move” and split the angle one cut at a time.
s2stage1: Construction 1/4. ①Join OP and extend it to meet the circle at D: PD is a diameter through the centre. OA, OB and OP are all radii, hence equally long (tick marks on the drawing).
s2stage2: Construction 2/4. ②The figure splits into two isosceles triangles: in △OAP, OA = OP, so the base angles ∠OAP = ∠OPA = {opa}° (cyan); in △OBP, OB = OP, so ∠OBP = ∠OPB = {opb}° (pink). All values computed from coordinates.
s2stage3: Construction 3/4. ③Enter the exterior angle: ∠AOD is an exterior angle of △OAP, and ∠AOD = ∠OAP + ∠OPA = {opa} + {opa} = {aod}°; likewise ∠BOD = ∠OBP + ∠OPB = {opb} + {opb} = {bod}°. Both sides are computed, and they match.
s2stage4: Construction 4/4. ④Combine (click an angle in the equation below and the matching angle lights up in the figure):
:::

## The diameter case: a semicircle always gives a right angle (Thales) {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: Question: when AB itself is a diameter (central angle = a straight 180°), what is the inscribed angle? Drag P anywhere on the circle — try both semicircles — and the readout is computed from coordinates. Half of 180° is 90°, so this needs no new theorem: it is step 1's conclusion applied directly. It has a name of its own, **Thales' theorem**: the angle in a semicircle is a right angle. Now the counterexample slot: use the slider below to pull chord AB away from the centre (d > 0). AB becomes a long chord that misses the centre, and the angle immediately stops being 90° — only a chord through the centre counts as a diameter.
s3bridge: Set the central angle to 180°, then move P around either semicircle: 90° is not a new rule, only half of the central angle.
offsetLab: Distance d of chord AB from the centre (0 = through the centre)
s3ledgerT: Ledger: positions of P in the diameter case
:::

::: strings
s3ro: ∠APB = {apb}° (computed from coordinates); chord AB sits at distance d = {d} from the centre.
s3right: AB passes through the centre — it is a diameter: wherever P stands on the circle (other than A or B), the computed angle is 90°.
s3not: AB misses the centre — it is not a diameter: the angle is immediately no longer 90°. A merely 'long' chord cannot impersonate a diameter.
s3ledgerIdle: Nothing recorded yet. Set d back to 0, drag P somewhere new and press “Record it”.
s3entry: P at position angle {pos}°: ∠APB = {apb}°.
s4ro1: P is now on the {arc}: ∠APB = {apb}° (computed); the shadow point P′ sits on the other arc, ∠AP′B = {apb2}° (computed); the two angles sum to {sum}°.
s4ro2: The central angle has two faces: facing the minor arc, ∠AOB = {minor}°; the reflex angle facing the major arc = {reflex}°. Check: the inscribed angle on the minor arc, {onMinor}°, is half the reflex angle, {halfReflex}°.
arcNameMajor: major arc
arcNameMinor: minor arc
:::

## Switch arcs: the angle jumps to its supplement {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: Question: if P moves onto the other arc (the minor arc), is it still the same angle? Keep A and B fixed and drag P across A or B. At the crossing instant, the arc P 'faces' switches to the other one, and the highlight in the figure swaps with it; a shadow point P′ stays on the opposite arc and shows its angle at the same time. Terms, where they first appear: the arc longer than a semicircle is the **major arc**; an angle greater than 180° is a **reflex angle**; two angles summing to 180° are **supplementary**. Expect the angle to jump from 40° to 140° — while the two angles always sum to 180°. The subtraction version of step 2's proof is reclaimed here in one line: with P on the minor arc the auxiliary line splits out a difference instead of a sum, and ∠AOB (the reflex angle) = 2∠APB still holds.
s4bridge: Start with the angle on the major arc, then drag P across A/B to the minor arc: the chord stays fixed, but the two arc angles become supplementary.
:::

## Self-test: four questions, all four to pass {#step5 h2=s5t h2part=1}

::: html step5-1
s5k: Step 5
s5e: Question: can you use the last four steps' conclusions yourself? For ①②③, click an option — a correct answer locks the question, a wrong one lets you think again. ④ is hands-on; the pass rule is written under the figure: the computed angle must lie within 45° ± 1° and P must be on the major arc — half of the preset 90° central angle is 45°, and it is 45° everywhere on the major arc, so the real test is whether you put P on the right arc. Get all four right and a cleared message lights up at the end of this step.
q1t: ①The central angle ∠AOB = 80°, and P is on the major arc. What is the inscribed angle ∠APB?
q2t: ②True or false: AB is a diameter and P is anywhere on the circle (P ≠ A, B). Then ∠APB is always 90°.
optTrue: True
optFalse: False
q3t: ③For chord AB, the inscribed angle on the major arc is 65°. What is the inscribed angle on the minor arc, for the same chord?
q4t: ④Hands-on: below, the central angle is preset to 90° and P starts on the minor arc (where the angle is 135°). Drag P (or use the position-angle slider) to a position where ∠APB = 45°.
:::

::: strings
correct: Correct — locked in.
incorrect: Not quite. Think again — check it against the matching step's conclusion.
scoreQ: Self-test progress: {k}/4 correct.
q4ro: Currently ∠APB = {apb}° (computed from coordinates), with P on the {arc}. To pass: the computed angle must fall within 45° ± 1° and P must be on the major arc. {state}
q4done: Passed — this question is locked.
q4todo: Not yet.
s5hint: All four correct — cleared. Take away three sentences: inscribed angles on the same arc equal half the central angle, and are the same everywhere on the arc; an angle in a semicircle is 90° (Thales); on the two arcs of one chord, the inscribed angles are supplementary and sum to 180°.
:::

## Finale: one theorem, three faces {#step6 h2=s6t h2part=1}

::: html step6-1
s6k: Step 6
s6e: Question: what does the inscribed angle theorem actually say? One arc locks the central and inscribed angles into a 2:1 ratio — the view from the centre is always twice the view from the circumference, and the view from the circumference does not depend on where you stand. Real-world angle measurements always carry error, but the constancy on this page is not a measurement coincidence; it is the theorem itself: once the coordinates of P, A and B are fixed, the angle is determined by them. The three cards below wrap the page up, and the two links connect to the right angle in Pythagoras and to the circle's rotational symmetry.
card1t: Same arc: half, and equal
card1b: Wherever P stands on the same arc, ∠APB equals half of ∠AOB — pick any position you like; the angle does not care.
card2t: Diameter: 90° (Thales' theorem)
card2b: When AB is a diameter, the central angle is a straight 180°, and half of it is 90°: an angle in a semicircle is always a right angle.
card3t: Other arc: supplementary 180°
card3b: For one chord AB, the inscribed angles on its two arcs are supplementary; the one on the minor arc equals half the reflex central angle (>180°).
linkPyth: Pythagoras, step 4 'Reverse the rule': a triangle whose sides satisfy a²+b²=c² is right-angled, and its hypotenuse is exactly the diameter of its circumcircle — the right angle there is the same 90° as step 3 here →
linkSym: Symmetry & rotation, step 2 'Turn it': a circle rotated about its centre by any angle coincides with itself — P's 'anywhere is the same' is the other face of the circle's rotational symmetry →
:::
