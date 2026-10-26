# Round 12: independent lens science and design gate

**Design gate: approve the parent's bounded repair plan.** Reuse the existing lesson/controller/state, with the corrections below. No new atlas node or route is necessary for this repair. Existing reflection/refraction↔lens links provide sufficient continuity once their landing text is accurate. This reviewer read actual source and BRIEF before numerical review; a separate agent owns the UI-first study. No Chrome or repository edits occurred.

## What is already correct

The actual conventional finite cases have correct v=f·u/(u−f), signed image height h_i=−(v/u)h_o, real/virtual type and orientation. UI readouts use the positive `mAbs` to describe size. At f=60,u=30,h=30 the model gives v=−60,h_i=60 and size factor2, correctly upright/virtual. Across6,919 ordinary integer u/h combinations, all three ray-line intersections agree with the formula point to at most1.14e−13 data units. Thus this is not evidence for replacing the optical engine.

S0 changes its own focal length, while S1–S4 intentionally use f=60. That is an existing lesson arrangement, not a shared-state bug. Preserve it and continue explaining the fixed later focal length.

## Evidence-based required repairs

1. **Remove the reachable focus/2f plateaus.** `imageOf`/`zoneOf` use ±0.5 around f and2f, but the actual S1/S2 drag handlers retain continuous u and only round native sliders/labels. This is not merely an integer-control tolerance. At u59.8 or60.2, the model falsely returns infinity while the ray equations give finite v≈−17940 or18060; at120.2 it falsely says exactly2f despite v≈119.8007 and a smaller real image. Use exact u===f and u===2f for these exact states, with explicit presets, and retain finite states on either side. Do not use rounded display values to classify.

2. **Clarify signed magnification without breaking compatibility.** The old public `m` field is v/u, so it is−2 in the virtual example, whereas optical signed magnification is M=h_i/h_o=−v/u=+2. Existing pictures and positive size factors are correct, but BRIEF conflates the two meanings. Keeping legacy `m` as a documented distance ratio while adding an unambiguous `magnification` field is a reasonable minimal compatibility choice; derive h_i=Mh_o and use |M| for size. Correct BRIEF formulas/examples accordingly. At exact focus there is no finite image point or finite transverse magnification: null image height/M is preferable to an exposedNaN. A legacy v=Infinity branch marker may remain without claiming it is a finite physical distance.

3. **Make the third construction conditional.** For u<f, the near focal point lies on the *backward extension* of the incident R3 line, not between the object and lens: for u30 its forward segment parameter is−1. Existing wording says the light first passes through that focus, which is false for the virtual case. At u=f, the stated third special construction has no finite lens intercept. The original drawing substitutes P→(0,2h) followed by a parallel-to-other-rays segment; that is an alternative ray, not the advertised focus→parallel rule. Omit this unavailable special ray at focus and explain why locally, or explicitly name an alternative construction. The accepted minimal plan is omission with explanation; do not change the saved toggle state merely because its construction is temporarily unavailable.

4. **Separate off-view finite images from infinity and absence.** The original drawing clips rays and sometimes omits the finite image candle without a corresponding warning, especially for far virtual images and vertical tip overflow. Check both signed horizontal position and complete image-tip/candle bounds. Keep a fixed scale within a viewport, show an accessible outside-view explanation for either side or height, and keep the finite v/M readouts. There is no need to autozoom an unbounded near-focus image onto the canvas.

   Also account for the *object* and draggable handle. Source-derived320px geometry gives canvas width≈282, S1 lensX118 and the old minimum ppu0.6; at allowed u215, objectX=−11. The view must fit the supported finite object range, or otherwise keep its native controls and visibility claim honest. A viewport-based fixed scale can solve this without parameter-dependent zoom.

5. **Reserve “exactly clear/equal” for p===v.** The screen code currently uses |p−v|≤2 while saying p exactly equals v. With the real scene's v100, p98 and102 falsely satisfy that wording. The proposed exact branch p===v is appropriate; other positions retain schematic defocus, without claiming a physical depth-of-field tolerance. The current virtual-scene claim that the screen shows uniformly illuminated light is not calculated; replace it with the narrower claim that this lens alone has no focused object image on that screen. Eye icons and blur remain explanatory illustrations, not retinal imaging or irradiance solvers.

6. **Keep continuous model/control values consistent.** Proposed step=any and explicit native keyboard increments preserve fractional drag states and exact presets. Sync native controls after Back/reconstruction without silently snapping the model. Format small finite u−f differences so they do not display as zero. If a six-significant-digit display rounds60.00001 to60, show it as approximate; do not write a false exact substitution or use the display to trigger a branch. Large finite values, infinity and undefined/invalid states need distinct presentations.

## Accepted minimal implementation

The parent's proposal satisfies the design direction: strict boundaries, explicit invalid states, signed magnification added alongside the old distance-ratio field, corrected special-ray wording, accessible finite-outside-view feedback, continuous controls and exact presets, a small S2 delta/signed-v/M readout, and a local explanation of the lens model and source. Keep S3's existing schematic renderer; do not build an eye/power/aberration engine. Any reading-context recovery may reuse the validated, lesson-discriminated history record for existing knobs/rays, excluding quiz/answers/profiles, merging unrelated history fields and degrading safely if History is denied.

The comparison with pinhole imaging is useful as a short boundary statement: both use geometrical rays and signed transverse ratios, but the pinhole's chosen screen distance is independent; a converging thin lens imposes1/f=1/u+1/v. Do not import the pinhole's freely adjustable positive screen v into the lens's signed image-distance definition. Conversely, a convex drawing is converging here because the chosen ideal lens has positive f in the stated surrounding medium; this is not a general material/index claim.

No mechanical graph expansion is justified by the identified defects. Keep the current atlas inventory unless a separate explicit learning-route need is established after the lesson is correct.

## Numerical evidence and testing boundary

`existing-model-check.cjs` evaluates actual original PURE functions and source-derived view/screen geometry. `existing-model-check.json` retains the near-focus, legacy-sign, screen-equality and mobile-object findings. The first reviewer harness attempt compared two differently rounded floating products with strict equality; that harness was corrected to numerical tolerance without any application edit.

At adjacent representable u values near f, the finite image can be enormous and line intersection is ill-conditioned because its denominator subtracts nearly equal products. Test finite/type/formula behavior separately from *visible* image/ray intersection consistency; do not require a finite off-canvas intersection to meet an arbitrary absolute2px tolerance. Do not restore a focus window or quantize input to hide this numerical conditioning.

After implementation, independently test f/2f exactly and both sides (including fractional and adjacent-double inputs), signed M versus h_i, ordinary finite visible intersections, R3 limits, full bounded object visibility, both-sided/vertical image overflow disclosure, exact/nonexact screen positions, restoration schema and denied fallback. UI acceptance should cover the existing ray toggles, native keyboard/pointer controls, locale/quiz continuity, Back/rebuild, both languages320px/actual200% and forced colors. Keep source-first numerical review distinct from the separate UI-only walkthrough and do not claim human learning effects.

## Primary source

[OpenStax University Physics3 §2.4, Thin Lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses) was checked for the thin-lens approximation, principal-ray construction, sign conventions and transverse magnification. The project's numerical examples and source discrepancies above were independently computed, not copied from textbook examples. The lesson should state its ideal paraxial model and avoid implying that its stylized lens aperture, color, blur or brightness constitutes a full physical optical simulation.

No permission blockers, process inspection, publication or LeetCode changes.
