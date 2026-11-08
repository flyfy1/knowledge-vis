# Eigen course: direction-first learning contract

This is the corresponding repair spec. Read WORKFLOW, UI-I18N-SPEC, specs/visual-page-provenance.md and this file before generation or repair. Bounded revision2026-10-26; other eigen-course steps are inherited and not certified here.

## Learner loop and root cause

A learner selecting the graph's eigenvector definition previously landed at diagonalisation#step4. S1 also called a merely near-collinear direction an exact eigenvector below1°, rounded its projection coefficient into λ, called a symmetric preset general and described180° as a full turn.

Sequence: vectors/linear map concept → eigen definition → S1 direction experiment → optional existing principal-component application at#step5. The atlas's existing vectors→eigen relation is a foundation relation, not a new mandatory prerequisite/learning-completion claim. No nodes or editorial trails are added.

Known / question / inputs-output / observe / limits:
- Known: a vector is an arrow; A maps v to Av. Question: which input directions stay on their original **line**? Change direction θ; cyan v, orange Av and a pink transverse segment change together. The pink segment joins the projection foot pv to Av, not origin to Av.
- Interpret the drawing before formulas. The line through v includes both directions. A negative coefficient flips Av along that line; it does not invalidate an eigenvector. Explain all visual labels near the drawing.
- Optional algebra: p=(v·Av)/(v·v), r=Av−pv, v·r=0. p is a projection coefficient for arbitrary v, becoming an eigenvalue only when r=0 mathematically. All preset numbers are dimensionless. Formula/readout/segment use one probe and the existing matVec.
- Compare default A at45° (λ3) and135° (λ1), then hold135° and select the negative preset (λ−1). A reveal explains the prediction but records no answer/score/mastery. A change of direction is geometry, not elapsed physical time.

## State, boundaries and accessibility

- Reuse S1 A/v and one authoritative angle. Range0–360°, step=any preserves free pointer precision; custom ArrowLeft/Right0.1°, Shift1°, Home0/End360 on range and canvas. Angle360 is equivalent to0 but may remain the endpoint; only the lower line-angle curve folds modulo180. Display rounding must be labelled approximate and must not quantize the underlying pointer direction.
- Change matrix while retaining angle. Reset S1 restores first preset and initial20°. No new clock, autoplay, storage, learner tracking or model persistence. Existing locale refresh/refit does not change vector/matrix. Reload resets the sandbox by its existing course policy; atlas URL/back context is tested.
- The three presets are symmetric, have distinct real nonzero eigenvalues and two unoriented eigendirections. Say “these presets”, not “every2×2 matrix has two”. Second preset is another symmetric matrix. This does not generalize the later arbitrary-matrix lesson.
- Numerical collinearity uses residual ≤64·Number.EPSILON·||A||F·||v||. It is explicitly a floating-point criterion, not proof. A nonzero gap below1° is **near**, never an exact eigenvector. Nonzero residuals use scientific notation when fixed decimals would hide them; do not display them as exact0.
- Probe rejects malformed/nonfinite inputs and zero v; zero Av has angle null and valid λ0 for nonzero v. Near-zero nonzero Av is not collapsed to zero. Finite supported values must produce finite results or reject overflow; no fabricated direction for the zero image.
- Native controls48px and focus3px; canvas has a localized accessible name and visible keyboard instructions. At320/390px the main picture and angle control remain usable without horizontal scroll;200% text, forced colors and reduced motion remain readable. Do not add a sticky trap or conceal sections.

## Sources and provenance

[Margalit & Rabinoff, Interactive Linear Algebra §5.1](https://textbooks.math.gatech.edu/ila/eigenvectors.html) defines nonzero eigenvectors, zero eigenvalues and same-line/opposite direction examples. [§6.3 Orthogonal Projection](https://textbooks.math.gatech.edu/ila/projections.html) gives the projection onto a line and orthogonal remainder. This page draws those mathematical relationships; it is not a measurement or dynamics solver. Sources are linked beside optional derivation.

Keep exactly one visible shared “Codex 开发 · 改进版本” header, precise source revision/edition/scope and original-contributor notice. Attribution describes this revision, not unknown initial authorship. Preserve a later independently authored Claude Code variant without rewriting canonical routes.

## Recurrence acceptance

1. Actual atlas eigen link opens#step1 and its task; source navigation/Back retains graph context.
2. Test45°,135°,44.8°,0/180/360, second preset's off-grid eigen direction, positive/negative λ, arbitrary input direction and preserved θ under matrix edits. Arrow and residual screenshots must actually differ; DOM numbers alone are insufficient.
3. Independently test Av=pv+r, orthogonality, scale/sign invariants, residual magnitude, angular range, zero-output/zero-input and finite invalid inputs. Test approximate feedback is never exact, including near directions that print λ rounded to an integer.
4. Operate pointer/touch and keyboard, slider and canvas. Language/refit keep A/v, reset is local, optional answer remains comprehensible. Test EN/ZH320/390/desktop,200% text, forced colors, reduced motion, state/Back and no console/script errors.
5. Run affected atlas data-quality/source-anchor checks and eigen regression scope. Preserve known limitations and report untested hardware. Review this spec whenever changing tolerance/precision/state, not only the final report.

Refinement after independent implementation review: preserve Alt/Ctrl/Meta browser shortcuts; only the curve folds with canonical modulo180, including360→0. Keep the angle control adjacent to the primary picture; long key instructions/legend follow it. Validate real viewport screenshots without sticky navigation covering arrow tips.
