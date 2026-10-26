# Round 12 staged independent science and implementation review

**Implementation/source/numerical/schema review: PASS, no remaining implementation must-fix.** The handoff-document correction below has now been independently rechecked and closed; zero current must-fix findings remain in this review scope. This is source-first review and isolated VM verification, not independent Chrome operation or cold learner research. No repository edits occurred here.

## Independent evidence

`stage-model-check.cjs` does not use the owner's test implementation. Its result is in `stage-model-check.json`, with the exact staged app SHA.

- Twelve focus/2f boundary cases include adjacent representable doubles and ordinary fractional values. Only exact u=f returns the infinity branch; exact2f is distinct from its neighbors. Finite near-focus values remain finite and correctly real/virtual, with a visible nonzero u−f representation.
- Across5,848 finite samples, the thin-lens residual is at most6.94e−18. In adequately conditioned ray-intersection cases, maximum formula/intersection discrepancy is1.50e−11 data units. Near-focus adjacent-double tests intentionally do not use an ill-conditioned far-away intersection as an absolute-pixel oracle.
- New `magnification` equals −legacy.m, legacy.m remains v/u, and imgH=Mh. Focus M/height are null; invalid inputs return null fields instead ofNaN. Zero object height is handled as a zero-height mapping; the interactive object remains bounded above zero. NaN, signed infinities and finite values have distinct formats; rounded60.00001 is marked approximate, and a1e−15 difference does not become zero.
- Eight fixed-view cases span canvas widths282/352/700/920 and both S1/S2 views. The maximum supported object position stays inside, and the scale does not change with u. Finite near-focus images are correctly out of view. A separately constructed case has horizontal image position inside but its tip below the canvas; `imageInView` correctly rejects that height-only overflow.
- Reading restore, wrong-owner/version/range/ray-boolean rejection, unrelated history-field preservation and denied read/write fallback pass. OnlyS0–S3 knobs/ray toggles are saved; the independent quiz object is neither serialized nor changed by restore.
- Both language sets contain123 keys with matching placeholders.

VM checks do not prove native range behavior, actual pixels, keyboard focus or browser Back/pageshow sequencing. Those remain for the parent and separate UI-only reviewer.

## Source and science checks

The implementation retains the existing controller and one geometric solution. The added signed magnification field clarifies the old distance-ratio compatibility field without changing ordinary orientations or positive size factors. Strict focus/2f equality replaces the old reachable±0.5 plateaus. Native continuous controls now preserve fractional drag values, and exact presets remain exact. Display rounding does not classify state.

At u=f, the third special ray is omitted instead of replaced by an unrelated construction. At u<f, local text correctly says the near focus lies on the incident ray's backward extension, not a path the incoming light first traverses. The lens symbol is expressly not a finite-aperture clipping simulation; large-angle/thick-lens predictions are excluded. Out-of-view finite images receive text feedback rather than being called absent or infinite. Both horizontal position and full candle height are checked. Within a given viewport the scale is fixed; supported object reach is accounted for independently of the unbounded image distance.

S3 now calls only p===v exactly in focus. Other positions retain the declared defocus illustration; virtual-screen output no longer claims an uncomputed uniform irradiance distribution. The eye is a viewing-direction icon, not a retinal solver. The new signed readout and scope distinguish this positive-f thin-lens equation from freely chosen pinhole screen distance. No atlas model/controller, node or route was added.

History restores before first rendering, native controls are resynchronized on pageshow, and changes are debounced/flushed on course navigation/pagehide. The lesson discriminator prevents another course's record from being applied. No quiz persistence, score, profile or mastery inference was introduced. Other history fields survive.

Reflection/refraction changes are confined to its existing landing/continuation copy and lens link. Its actual numerical app and style still match the independently recorded round11 hashes; there is no second refraction-model change hidden in this extension.

## Handoff document correction requested

The staged BRIEF correctly fixes signed-M examples, but its hard rule still says noninteger numbers use one decimal, conflicting with the new exact-two-decimal/otherwise-six-significant-digit formatter. The following hard rule also unconditionally demands2px agreement for all three-ray intersections, contradicting the declared near-focus/off-view conditioning boundary. Update those current instructions to the actual format and to visible/adequately conditioned intersection checks; finite far-off-view states need finite/type/formula tests rather than a false universal pixel guarantee. Writing the image point as(v,MH) avoids confusion with the legacy m ratio. This requires no runtime change or broader test expansion.

## Nonblocking source note

At exact focus with R3 enabled, S1's rules list currently inserts `ray3Focus` twice: once for the selected special-ray description and again from ray3Note. The explanation is correct but duplicated. Removing the duplicate is a small optional presentation cleanup; it does not affect the numerical PASS above.

Await actual browser screenshots/results and the separate UI-only review before whole-task acceptance. Parent cumulative regression/protected-file evidence must retain its own method and actual completion status.

## Subsequent narrow recheck: closed findings

The actual and staged seven-file change set (lens four runtime files/BRIEF plus reflection-refraction link index/i18n) now matches byte-for-byte. Current BRIEF specifies exact-two-decimal values or approximate six significant digits, preserves nonzero u−f and scopes pixel intersection checking to visible, adequately conditioned cases. Its image point uses(v,MH). Thus the requested handoff contract correction is closed. Format comments are synchronized.

Restore now copies only known r1/r2/r3 booleans. The independent script was extended by injecting an unfamiliar ray field into an otherwise valid snapshot; that field is not copied into live state. The numerical/schema/parity script passed again with the current source hash. The earlier duplicate focal-R3 explanation is also fixed by avoiding the extra note at u=f.

Read owner `../browser/result.json`:165 checks pass, errors[] and failed[], with the exact optionalfavicon404 recorded separately. This is owner-run evidence. Independently inspected the four owner-supplied EN/ZH320 actual2x normal/forced-color viewport captures. Full preset labels and focus borders are visible; EN also shows the finite near-focus virtual-image readout rather than an infinity claim. Those captures do not show the entire page or certify native operation by this reviewer. The independent UI-only operator is still finishing its own walkthrough; no outcome is claimed on its behalf.

Runtime/document matching and image provenance are recorded in `final-source-recheck.json`. No Chrome was started by this reviewer. Whole-task cumulative regression and final UI-only results remain separately attributed and are not inferred from this source/CLI/image review.

## Copy-only refinement and corrected reviewer observation

Reviewed the staged bilingual S0e/S1e/ray3Focus changes against the then-current actual text. Approved: the first bundle is explicitly parallel to the principal axis, S1 defines real-object u and signed image v/positive |v| at first formula use, and the focal third-ray note gives the learner the usable first-two-ray action without obsolete implementation-review language. These are no-model-change clarifications; at this read the parent intentionally had not yet applied them during the separate UI-only operator's current session. No claim of real-page verification of those pending strings is made.

Correction to a subsequent reviewer suggestion: I initially missed the visibility guard that reassigns a copied R.r3 before **all** incoming/outgoing drawing branches and incorrectly suggested the out-of-view third ray might retain an incoming fragment. Actual/staged source both contain the guard. The suggestion is withdrawn: current ray3Outside copy accurately says the whole construction is omitted. The separate fixed S3 cases have in-view intercepts and do not contradict this behavior. No application fix was needed.

`ray3-guard-recheck.cjs` / `.json` independently executes the actual renderer with a drawing spy. With only R3 selected, exact focus and the out-of-view near-focus case each emit zero ray segments, while normal real/virtual cases emit the expected construction segments. The original toggle remains selected because the view guard copies the options object. This is VM control-flow evidence, not a browser pixel test. The correction is recorded transparently and does not alter the successful numerical/scientific verdict.
