# Round 10 actual implementation: final scientific/architecture review

Verdict: PASS for this review's scientific, implementation, independent CLI and supplied-image scope; zero remaining implementation must-fix findings. This is source/BRIEF-first review plus independent CLI and inspection of parent-captured images, not this reviewer's cold learner/browser session. The separate fresh-context reviewer owns the UI-first walkthrough. No Chrome or repository edits were made here.

## Fixed view and scientific consistency

The actual `pinhole-camera/app.js` now uses one fixed logical420-height scene and screenY36..354. All893,101 integer H/u/v states independently passed the actual `s2geo` computation: both image endpoints are inside the screen, both dimension-label levels follow the image, all content remains within the scene, and image/slope/magnification identities remain consistent with the actual endpoints. Max image-size discrepancy5.684e−14cm. No denominator singularity is reachable. Height420 leaves the required margin at maximum imageY342, with the lower dimension atY394 and its scene margin26.

Because `scene` chooses one uniform scale from the fixed480×420 dimensions and the current canvas CSS size, changes toH/u/v do not change that scale within one viewport. Resize may refit it. This improves comparison and pointer stability without changing optics. The physicalY-up versus pixelY-down mapping, midpoint-alignedH, top-rayk=−H/(2u), h_s=−Hv/u, M=−v/u and unsignedh=|h_s| remain correct. Central-ray image size, finite-aperture geometric spot size, real diffraction and absence of a lens focal-length relation are explicitly separated in both languages. Main and added numeric readouts are honestly approximate after calculation.

The original pure optical functions remain unchanged relative to the reviewed stage/original-source comparison. The full-domain current-source checks and evidence are `actual-final-check.cjs` / `actual-final-check.json`; prior red existing-view evidence and stage results remain separate and historical.

## Scope and state

There is no new optics controller, clock or automatic mathematical/physical lesson synchronization. Pinhole continues to use its ownS.s2(H/u/v), set2 and render2. Linear continues to use its own rational-slopeki/intercept/probex state. Links have fixed local lesson anchors; no currentk,b orH,u,v are transmitted or silently imposed on the other course. The explanation uses the same straight-line principle, not a promise that two independent diagrams share numerical controls.

Validated namespaced version1 snapshots store only each history entry's own S2 geometry; the lesson discriminator prevents applying the other lesson's record. Unknown top-level history fields are retained. Pinhole restoration precedes its first language render; linear restoration precedes initial render and default-probe selection.180ms trailing writes, explicit cross-link flush and pagehide flush are consistent. Pageshow resynchronizes native controls from numerical state. Independent VM checks cover valid restores, malformed/version/owner/range rejection, unrelated-field retention and safe replaceState exceptions. This is not independent browser-event-order or true Back evidence; those were performed in the parent suite.

No quiz, answers, learning progress, timestamps, mastery/profile or new storage keys are persisted. In-memory/bfcache quiz continuity and document-reconstruction quiz initialization must be described distinctly. Denied history falls back to live interaction, not guaranteed cross-document restoration. The ordinary atlas geometry route correctly adds only slope and pinhole-ratio with one explained application relation:37nodes/46edges/9routes. It has no inline optics simulation or new prerequisite policy.

## Closed findings and evidence interpretation

The local `#step2 .btn:focus-visible` selector now gives the previously uncovered equal/half/double/reset buttons3px outlines; forced-colors covers their focused state. The ambiguous Chinese “正像高” is now “像的正尺寸h”. These close this review's stage must-fix and wording suggestion.

Read `pinhole-bridge/evidence/geometry-browser.json`: parent resultPASS294checks, errors[]/failed[], separately recorded optionalfavicon404, with explicit limitations for physical devices, screen-reader speech, learning effectiveness and quiz reconstruction. This is parent evidence, not an independent rerun. Parent reported and repaired an accidental S3ground replacement found by an actual H assertion; the actual S3 source now uses its original horizontal ground and correctly identifies the fixedH72/u140/v170 scene. The assertion/failure history should remain in the parent record rather than be removed.

Independently opened and visually inspected parent images `en-max-image.png` and `zh-320-double.png`. The maximum-case image has both marked endpoints on the extended screen and visible lower distance labels. The Chinese doubled-font image shows readable wrapped prediction text and a visible focus outline onCaseB; it is a viewport subset, not proof of every point of the page. These images do not substitute for this reviewer operating the real UI, and do not establish actual-screen-reader/physical-phone behavior.

## Handoff boundary

At this read, actual lessonBRIEFs and atlasREADME still retain the previous historical descriptions (including the pending optics recommendation). The parent is preparing the final documentation. Before final whole-task handoff, prepend/append the current geometry/history/finite-aperture contract with clear historical distinction, update37/46/9 and implemented-versus-next-work status, and link the separate scientific/source-first and fresh UI-only results accurately. That documentation stage is outside the present runtime/scientificPASS; no final-document acceptance is implied yet.

No permission or execution blockers in this review. Remaining UI-only acceptance and cumulative regression belong to the separately identified reviewers/parent; do not combine their methods into a false single blind review.
