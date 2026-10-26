# Round 10 staged implementation review

Verdict: scientific/model/history structure passes source and independent VM review. One small accessibility must-fix remains before actual UI acceptance. Stage is pinhole-bridge/staged, not a claim that the repository has been applied or a browser passed. No repository editing or Chrome occurred.

## Must-fix

Pinhole-camera/style.css keeps the existing `.btn:focus-visible` at2px. The new3px selector covers `.geometry-bridge button` and `#step2 input`, but S2's pre-existing equal/half/double/reset buttons are outside the details and therefore retain2px. These are active controls in this round's same-step learning loop. Add the local `#step2 .btn:focus-visible` scope to3px and the matching forced-colors rule, as the staged linear page already does. No shared/global restyling is necessary. This is a source finding; actual focus styles still need UI verification.

## Verified scientific and architecture details

- `s2geo` derives physical Y and the signed endpoint difference from the same old `imageEnds` result. Its slope is −H/(2u), signed height−Hv/u, magnification−v/u, and the old h remains nonnegative. Both-language explanations correctly define the midpoint alignment, two axes, A/B/A′/B′, units and sign convention, distinguish slope from magnification, and avoid a lens relation.
- All893,101 allowed integer states were independently evaluated against analytic formulas. Max height discrepancy5.684e−14cm. Each staged screen contains both image endpoints; u/v dimensions follow below the image; all fit inside the logical scene. Existing pure functions are byte-identical to the actual pre-apply repository. This is analytical view-bound evidence, not screenshot/visual legibility evidence.
- S2 view transforms remain uniform and the old drag handler still inverts the active `cv._view`, so the dynamic logical scene is structurally compatible with dragging. Actual hit testing and pixel coverage remain for Chrome. Auto-fitting the view can change the drawing scale across states; comparisons should rely on within-state proportions and unit readouts, not promise fixed pixel/cm across states.
- Main size readout now gives the symbolic identity and separately rounded values. New signed/ray values use≈. Fixed predictionA/B correctly gives h45→90cm and M−.75→−1.50 while holdingH60/u120. Buttons explicitly set onlyS2. A distinct native reveal explains that fixed pair, not an invented assessment score.
- Aperture step explicitly identifies its separateH72/u140/v170 scene. Local S2/S3/final conclusions distinguish ideal central-ray size, finite geometric spot width and real diffraction. No wavelength or claimed optimum aperture solver was added. The narrower physical claims are internally consistent.
- Two new concepts, one explained application edge and a normal two-stop route yield37nodes/46edges/9routes. They link to actual local chapters, with no new atlas inline model/clock/bridge or imposed prerequisite edge.

## History initialization and boundaries

Pinhole restores validatedH/u/v before binding and first `applyLang` render. Linear restores validatedki/b/x after handler registration and before first `renderAll`, and chooses the old default probe only when restoration fails. Renders synchronize the native S2 controls from the model. `pageshow` adds a next-frame synchronization to avoid UA-restored form values contradicting model/canvas; actual browser ordering must be tested.

Both snapshot writers merge existing top-level object fields rather than replace the entire history state.180ms trailing saves are flushed on explicit cross-link click and pagehide. Isolated VM checks passed restoration, different-lesson/version/range/noninteger rejection, unrelated-field preservation, and safe `replaceState` exceptions. Only lesson-S2 geometry is stored, with no answer/quiz/mastery/profile/newstorage key. Quiz retention in bfcache may be tested, but must not be described as quiz restoration after a fresh document/reload. Help expansion/reveal is not in the snapshot; returning to#geometry-bridge explicitly opens that detail as designed, not a general disclosure-state guarantee.

## Nonblocking wording suggestion

Chinese `geoPrediction` uses “正像高”, which could be parsed as an upright-image term. Prefer “像的正尺寸h” or “正的像高h”, consistent with the adjacent definitions. Both-language scientific meaning is otherwise clear. No need to introduce additional terminology, new controls or broader optics.

## Evidence and method

`stage-check.cjs` / `stage-check.json` independently evaluate actual staged functions in a VM; no running app was mutated. Initial reviewer harness failures were a PURE-section extractor stopping at an inner comment and an omittedS2YR VM constant; both fixtures were corrected, without app changes, before the recorded passing output. Neither was an implementation defect. The prior existing-geometry finding is retained separately in `design-model-check.json`; it is not overwritten by this passing staged-view check.

Remaining browser work: actual old-version red and new-view green, task prediction from rendered UI, both-language keyboard3px/forced-colors,320/200%, pointer mapping after large viewport changes, true cross-course Back and history reconstruction/no-quiz-persistence boundary, plus actual lesson/atlas links. No permission blocker.
