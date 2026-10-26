# Round 11: independent science and design gate

**Verdict: adopt the bounded extension, with the narrow correctness repairs below.** The parent's revised shared scalar solver and strict critical-angle comparison are accepted. This review read actual source/BRIEF before independent numerical checks. It is not a cold UI walkthrough. No Chrome or repository edits occurred.

## Required repairs

1. **Unify classification.** With n_water=1.33 and n_air=1, the critical angle is 48.753466631327235°, displayed 48.8°. Actual trace3 treats a ±1e−9° interval as critical while snellDeg can already report TIR. At CRIT+5e−10°, trace3 says critical but the positive scalar says TIR; the negative scalar returns `{tir:false,theta:NaN}`. The negative bug also occurs at −60°. Classify both sides by magnitude; preserve the scalar's signed angle output and return null for both TIR directions. Never apply asin outside its real domain.

   Accepted design: for finite positive indices with n1>n2, compare abs(theta) to the same criticalDeg result. Equality identifies the exact shared preset; strict greater is TIR; lesser is ordinary refraction. Clamp admissible scalar sine inputs only for floating-point protection, without an angular tolerance band. Lower-to-higher/equal indices have no critical branch here. Trace2/3, new formulas and readouts must derive from the same scalar result. At machine-adjacent values below critical, theta2 may round to 90° while mode remains refract; classify from unrounded state, not the displayed 48.8° label. The existing vector solver can remain for S4, with a small machine-level root clamp, e.g. 8 EPS.

2. **Match text to the separate modes.** Both s3roTIR translations say ≥ even though critical is a separately rendered grazing limit. Use strict > and state that n1>n2 is required. At equality, the geometrical refracted direction is parallel to the interface. Beyond it, there is no propagating refracted ray in the lower-index medium. This lesson does not calculate evanescent fields or wave energy.

3. **Handle normal incidence explicitly.** Trace2(0) and trace3(0) transmit along the normal without angular deviation. Current S3 nevertheless says angle 0 is greater than angle 0 and bends away from the normal. Add zero-specific feedback or qualify the inequality. S2 has a zero branch; qualify its general strict inequality to nonzero incidence as well. Mirror trace0(0) travels back along the same line in the opposite propagation direction. Transmission crosses into the next medium; these are different phenomena. A qualitative reflected branch at water/air normal incidence does not make it TIR.

4. **Define n correctly.** Current S2 and the final card define refractive index as “bending power”. Use n=c/v, define the two speeds and its dimensionless units, and identify the fixed approximate air/water indices. Bending depends on both media and incidence; n alone is not an angle. There is no wavelength-dependent index prediction in this model.

5. **Explain the angle reference in the sine link.** Snell's law uses angles from the local normal, not from the surface. Trig#step1 measures its unit-circle angle from positive X. Link it to inspect sin as a coordinate and explicitly ask the learner to select the same numeric angle; do not transfer the ray orientation directly or silently synchronize lesson state. Explain degrees-to-radians for Math.sin. The dimensionless q=(n1/n2)sin(theta1)>1 cannot be the sine of a real transmission angle; q=1 is the grazing limit when the indices permit it.

6. **Narrow S4 copy without rewriting its model.** Trace4 always sets A.x=F.x=170, but both s4hint translations claim a horizontal shift. Remove that false claim. Identify A as the backward sightline's intersection with the vertical reference through the real fish: an apparent-depth illustration, not an exact many-ray focus or unique virtual-image reconstruction at arbitrary angles. The overhead d/n expression is a paraxial limit. The existing reference line already makes this a small copy/scope repair.

7. **Separate appearance from energy.** Colors, opacity, line thickness and glow encode direction/mode qualitatively. No Fresnel coefficients, polarization, absorption or power fractions are calculated. Do not imply an energy ratio from those styles, or that the TIR model means every electromagnetic field vanishes on the air side. Bound “all reflected” language to the ideal ray model.

8. **Correct the handoff contract.** The old BRIEF repeatedly says 48.6°, ≥ and “bending power”. The fixed 1.33 calculation gives 48.8°. Make the current contract clear and mark old statements historical rather than leaving contradictory requirements. A textbook's differently rounded water index does not override this project's explicit value.

## Minimum learning loop and architecture

Use optional native disclosures near existing S2/S3 plots. Derive n1, n2, theta1, theta2 and q from current state and the shared result. Reuse 30°, exact critical and 60° presets for one prediction: does water→air at 60° admit a real refracted angle, and how does q show that? A native reveal explains the answer; it does not track scores, attempts or mastery. Preserve local angles/sides, quiz state, language and focus. Promoted S2/S3 controls require 48px targets and visible 3px keyboard focus, including forced colors.

Reuse the existing unit-circle concept. Add one Snell/refraction node containing the index definition and critical condition, one explained application edge, and an ordinary two-stop route. This gives 38 nodes, 47 edges and 10 routes from current 37/46/9. No new optics engine, controller, clock, atlas inline simulation or forced prerequisite policy is needed.

A validated lesson-specific `knowledgeGeometryReading` record can retain S2/S3 angles and last side, preserving other history fields. Zero retains the previous side; nonzero angle and side must agree. Resynchronize native controls after reconstruction. Do not persist quizzes, answers or profiles. Distinguish bfcache continuity from reconstructed geometry restoration and unchanged quiz initialization. A link to trig does not promise automatic numerical synchronization.

## Independent evidence

`existing-model-check.cjs` evaluates the actual PURE functions in an isolated VM; `existing-model-check.json` retains the original findings.

- Air→water 0/30/50/80° on both sides matches independent angles 0, 22.082413194472252, 35.16781910065805 and 47.77035586616183°.
- A 16,001-state water→air grid across −80..80° has correct modes/angles away from the narrow critical window. Mirror angle equality passes 1,601 states.
- Exact and nearby signed threshold cases expose the window and negative asin defects described above.
- Six fish views confirm fixed A.x=170 and overhead depth 3.5/1.33≈2.631578947. These checks do not certify exact physical virtual imaging.

After implementation, test both signed critical presets, ±1e−10/±1e−12 offsets, adjacent representable doubles, zero, normal-angle references, vector side/unit length, scalar/trace/DOM agreement and all reachable endpoints. UI acceptance must cover existing state and quiz continuity, disclosure focus, true Back/reconstruction, exact critical versus native keyboard increments, both languages at 320px/actual 200% font sizes and forced colors. The separate fresh UI-only review must remain distinct from this source-first method.

## Primary sources checked

- [OpenStax 25.3: Law of Refraction](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction): refractive index and normal-angle Snell relation. This project's numerical results were computed independently.
- [OpenStax 25.4: Total Internal Reflection](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection): critical grazing limit, index ordering and strict above-critical condition. Its tabulated water value does not replace the project's explicit 1.33.
- Actual trig#step1 contains the unit-circle projections and degree/radian controls. It is suitable for the meaning of sin, not an optics or energy model.

No permission blockers, process inspection, publication or LeetCode changes.
