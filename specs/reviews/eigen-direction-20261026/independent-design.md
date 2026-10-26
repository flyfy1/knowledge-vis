# Eigenvector direction: independent bounded design gate

**APPROVE with the adopted constraints below. P0: none. This is one existing-course/graph-entry repair, not a new topic, matrix engine or PCA expansion.** Parent may write the bounded BRIEF/spec and implement now. I have not opened Chrome or edited product files.

## Evidence and baseline

The selected delivery checkout `release-git` is at93346e21e375bda4f27ef545dd788586bf8ae58f. The original shared checkout has a different HEAD; its eigen app/i18n/index and atlas data were byte-identical when read, but all implementation/acceptance should use the selected checkout and current guards.

Actual source confirms the graph eigen definition links to#step4 (symmetric diagonalization), while the existing vectors→eigen relation already links to the more direct#step1. S1 already draws v,Av and a0..180° line-angle curve, but promotes any angle<1° to “v is an eigenvector”; all three matrices are symmetric, including the preset named “general.” The Chinese “full turn” label conflates a half-turn of oriented arrows with one representation of every unoriented line. These are real task/definition mismatches.

## Adopted smallest loop

Change only eigen's canonical source to#step1; retain the existing relation, graph counts/routes and original course. In S1 let the learner set default A at45°, then set135° and retain that direction while choosing the negative-eigenvalue preset. Observe collinearity in both cases and reversal in the latter. A native optional prediction/reveal can explain the result; its text must not silently set the angle or matrix. Existing PCA can be a clearly optional next source, not a new lesson here.

A pink arrow from p·v to Av shows the leftover component r. Explain that visible “part off the original line” before showing p=(v·Av)/||v||² and r=Av−pv. v≠0 is required. Only when r is numerically zero may p be presented as an approximate eigenvalue λ. Otherwise it is a signed projection coefficient, not an eigenvalue. Negative λ reverses the arrow but keeps the same line.

## P1 mathematical and numeric conditions

- A single small pure helper reuses matVec,dot,norm. Do not add another eigensolver or matrix state. Scope the UI to the existing three invertible symmetric presets with distinct real eigenvalues; “two directions” belongs to those presets, not all2×2 matrices.
- Classify numerical collinearity by ||r|| relative to64·EPS·||A||F·||v||, with explicit handling of a zero scale. Label the result “within floating-point tolerance,” λ≈; it is not a proof that every rounded displayed direction is mathematically exact. Never reuse the loose1° criterion as an exact eigenvector test.
- “Near” may use the existing<1° line-angle threshold, but must explicitly remain non-collinear outside the numeric tolerance. Show a small nonzero residual with significant/scientific notation rather than printing an exact0 that contradicts that status.
- The unoriented line angle is0..90°. A stable atan2(||r||,|p|·||v||) form is suitable when Av≠0. If Av=0, the angle is undefined/null, yet a nonzero v is still a valid λ0 eigenvector. This helper boundary belongs in tests even though the present invertible presets do not reach it. Reject zero v; do not silently invent its direction.
- Do not amplify a tiny residual into a constant-length visible arrow without labeling that magnification. At zero residual, omit the arrow/mark the coincident point; no fake direction. Keep fixed diagram scaling, p·v and Av geometry consistent, with text equivalents for the residual.

## P1 one-angle control contract

Adopt the parent's revised **0..360 range with step=any**, explicit0.1° keys, Shift1°, Home0 and End360. The originally proposed step0.1 would quantize arbitrary pointer angles and desynchronize them; the second preset's eigendirections are not generally on that decimal grid. Pointer keeps full precision. One setter owns angle→v,range,readouts and drawing; matrix presets preserve that direction. Alt/Ctrl/Meta shortcuts should remain with the browser.

360 stays the chosen endpoint and is equivalent to0; do not reconstruct it through atan2 and silently turn it into a different slider/readout state. Only the existing curve folds modulo180. Label that curve “0°–180°: each unoriented line once,” not an oriented full revolution. A new0..360 slider does not require doubling the curve or adding duplicate zero directions.

## Scope/layout and acceptance

Use native48px controls,3px visible focus and current tokens/locale. Slider/helper/reference formula and one optional prediction should sit in S1 without displacing the drawing into an unexplained separate workflow. Do not add timing, persistence, another controller or alter other steps' numerical helpers globally. The new BRIEF must identify itself as this bounded amendment because no prior local eigen BRIEF exists. Preserve the actual Codex revised-edition attribution and record truthful source revisions; no pure-origin claim.

Acceptance requires independent tests of projection identity, r⊥v, positive/negative λ, near-but-not-exact directions, zero Av and zero-v rejection; selected nonunit-vector/scaled-matrix cases check that tolerance is scale-aware. Include the old reachable false-positive direction, such as45.5° under the default matrix. Check all three preset scopes and the135° negative example. Other zero/scalar/rotation/shear cases may test the helper/claim boundary without creating new UI presets.

Actual UI checks should cover arbitrary pointer→native slider synchronization, exact45/135 and End360, declared keyboard steps and shortcuts, matrix/locale changes preserving direction, readable near-zero feedback, native predict/reveal and graph→#step1→Back. Both languages/320px/actual2x/focus/forced colors need the changed section and new header/source context. Verify the residual's endpoints against actual drawn v/Av coordinates, not just duplicated formulas. Separate AI learner retelling from numeric checks; neither establishes real learning gains.

Deferred: arbitrary editable matrices, new eigensolver/power method/PCA work, whole-eigen-page scientific certification, new graph routes, physics simulation, broad restyling or publication. Do not push/deploy main before parent coordination. No LeetCode changes are in scope.
