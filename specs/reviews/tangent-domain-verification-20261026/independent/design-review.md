# Round 13: independent tangent science and design gate

**Gate: approve the bounded common-helper/control/reading-context plan. No architecture blockers.** Reuse the existing course and affected S1/S4/S6 states, with no new graph node, route, framework or animation clock. Other sine/cosine wave and audio algorithms stay outside this repair. This review is source-first plus independent VM/design calculations; a separate agent owns UI-first Chrome. No Chrome or real-repository edits occurred here.

## Independently reproduced defects

`existing-model-check.cjs` evaluates actual original functions; `existing-model-check.json` preserves the findings.

- At89.9°, tan≈572.9572133543032 is finite. S4 classifies it as`inf` and S6 prints`+∞`. At π/2±1e−13 radians, both values are finite (about±1e13) but the |cos|<1e−12 rule calls them undefined. A proximity window is not the function's domain.
- The S4 wall annotation is even broader: any finite |tan|>3.3 receives an infinity label. At80°, tan≈5.671281819617707 is finite, outside that drawing, and must be marked out-of-view rather than infinite.
- S1's exact-value card uses a ±0.05° window. A reachable off-grid pointer state79.97° (not snapped by s1Snap) followed by Shift+Right10° produces89.97°. Its live tan≈1909.859 is finite, while the card falsely says sin=1,cos=0,tan undefined. Its one-decimal angle label also becomes90.0°. Exact cards must require the actual canonical state, with approximate numeric labels distinguished.
- At S4 theta270°, slider synchronization assigns90 while its label says270. The original slider input handler then replaces the full state by the90.x representative. Equal tangent values do not make those angles or their unit-circle points identical.
- The controller has no lesson reading-history restoration code. Browser-cache behavior is not a new-document restoration contract. trig/BRIEF.md was not present when this gate started; create a current bounded contract before implementation rather than implying it was read.

## What does not need rewriting

The geometrical construction is a full straight line through the origin and circle point intersecting x=1. For cos<0 it may require backward extension; this is not a directed physical ray. The standard slope relation tan=sin/cos is correct away from its poles.

The existing S6 buckets already put values outside±3.4 intoNaN, and the strip resets its pen atNaN. Filling all720 bins independently produced no line segment crossing either pole. Do not claim an existing false connecting line or rewrite the sampling engine without evidence. Those gaps include finite values outside the drawing range as well as unvisited positions, so explain their meaning. A pole's current marker must not be drawn as a finite boundary arrow from raw Math.tan.

## Accepted minimal scientific contract

Use one pure tangent result for the three affected sections' drawing/readout/export. Normalize the supported finite angle state, identify only actual canonical quarter-turn poles, and return an explicit undefined/null value there. Other angles use a finite sin/cos ratio; nonfinite input is invalid. No |cos| threshold or |tan| magnitude changes the mathematical domain. Canonical axis coordinates/signs may be exact; nearby small nonzero coordinates retain their sign and finite tangent. Do not expose raw Math.tan(π/2)'s floating residual as a legitimate finite value in the debug/readout contract.

Keep finite values numeric even when huge. Draw range-overflow arrows/text without∞ as a value. Use∞ only in clearly stated one-sided limits: tan→+∞ from the left of π/2+kπ and→−∞ from the right; the pole itself is undefined. The period is π radians (180°), not360°: addingπ reverses both sine/cosine signs while preserving their ratio. Do not imply passage through an actual infinity value or connect opposite branches.

S1 exact cards must compare the actual normalized radian state to the canonical angle construction, not the rounded angle label. Units remain internal radians; switching degree/radian display must preserve state. Approximate six-significant-digit values should not be printed as false exact substitutions between separately rounded sine/cosine numbers. The finite-vs-undefined distinction must remain clear when an angle rounds to90°.

## Keyboard design without pointer quantization

A plain repeated degree↔radian round trip can still drift. An equivalent minimal scheme can strictly recognize a previously committed0.1° representation without changing arbitrary pointer angles:

1. Compute candidate tick=round(degrees*10).
2. Only if the current radian state is **exactly** `(tick/10)*π/180`, edit its integer tick by the declared keyboard amount and modulo3600 before conversion.
3. Otherwise apply the angular delta directly to the off-grid radian state and normalize; do not round it to a tenth or a pole.

`keyboard-design-check.cjs` is a design prototype, not application code. It reaches exactπ/2 from0 after900×0.1°,90×1° or9×10°, and exact3π/2 after900 negative0.1° steps. Sixteen off-grid cases retain the direct delta with no proximity snap. Equivalent implementations are acceptable.

The proposed S4 full-circle0..360 control withstep=any preserves the actual angle; native keys use0.1°/Shift1°, with Home0 and End360's equivalence to0 explicitly explained. S1/S6 may retain1°/Shift10° keys, plus an explicit zero command. Existing pointer snapping in S1 is an intentional user action that changes the state and can remain visibly described; do not apply it while reading/restoring arbitrary angles.

## Reading context and scope

Persist S1theta/unit and S4theta through the established validated lesson-specific history record. S6theta/chain is a reasonable small addition if restored **paused**, with only the current point freshly painted. Do not save trace/bucket/trail arrays or manufacture a prior trajectory. Explain that reconstructed documents preserve reading controls, not drawing history or learning progress. Preserve other history fields and degrade safely if denied. Keep other sine/cosine/audio models unchanged; no new local/session key, answer record or mastery state is needed.

Verify unit-button selected semantics, focused canvas/native-control visibility and48px/3px/forced-color targets in the affected scope. Do not turn this into a whole-course rewrite or pretend actual speech/device coverage.

## Three bounded morning-index experiences

The required concise handoff index can link to existing sections rather than add UI infrastructure:

1. S4: predict89.9°/90°/90.1°, compare finite positive/undefined/finite negative and distinguish view clipping.
2. S1/S4: compare unit display and a half-turn's equal tangent with opposite circle coordinates, using existing controls and the new explicit period explanation.
3. S6: inspect sparse trace/range gaps, pause at a pole, and check reading-context Back/reload without claiming old traces were restored.

These are suggested verification tasks, not asserted learner mastery. Keep atlas counts and nodes unchanged.

## Primary references checked

- [OpenStax7.4, Other Trigonometric Functions](https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-4-the-other-trigonometric-functions): tangent as coordinate ratio and its domain.
- [OpenStax8.2, Graphs of Other Trigonometric Functions](https://openstax.org/books/algebra-and-trigonometry-2e/pages/8-2-graphs-of-the-other-trigonometric-functions): period, signs and asymptotes.
- [OpenStax7.1, Angles](https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-1-angles): degree/radian and coterminal-angle conventions.

Implementation acceptance should independently test exact/adjacent poles, large finite values, signs/periodicity, strict cards, line discontinuity/range labels, canonical keyboard arrival and off-grid preservation, full-circle control synchronization, unit switching, Back/reconstruction/schema/denied cases and the stated restore-paused boundary. Keep the independent UI-only method distinct from this source-first review.
