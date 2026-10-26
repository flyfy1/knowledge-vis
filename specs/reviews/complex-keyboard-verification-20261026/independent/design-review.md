# Round9 independent keyboard-equivalence design review

**Design verdict: ADOPT the refined native-form proposal.** This repairs an actual existing learning-task gap; do not add a global keyboard engine, profile, score or new model. Repository review only, no browser or repository edits in this phase.

## Confirmed current behavior

Read actual complex-numbers app/index/i18n/style/BRIEF. The course promises reading arbitrary points, adding two complex numbers and predicting their product, but S1/S2/S4 currently expose those arbitrary point changes through pointer handlers. Existing presets and quiz buttons support keyboard but do not replace arbitrary point editing.

Actual limits differ from the preliminary guess:

- S1 uses `clampBox(v,5)`: snap components with `Math.round(v*10)/10`, then clamp each to±5.
- S2 uses `clampBox(v,4.2)`, **not±3**. Its sum can reach±8.4, inside the existing±8.6 plot.
- S4 uses `clampDisc(v,2.6)`: first snap both components to0.1, then scale the vector radially when its modulus exceeds2.6. Final projected components need not lie on the0.1 grid.
- Precise presets bypass these drag normalizers. In particular the unit-modulus60° preset retains exact cosine/sine values. Applying snap universally would break its rotate-only invariant.

## Adopted smallest UI/state contract

One stable native form below each existing S1/S2/S4 canvas. S1 needs two number inputs and Apply; S2/S4 additionally select the target point. Keep labels semantic: real/imaginary components, and z1/z2 as addends versus multiplicand/multiplier. Each form edits only its corresponding existing S state and render function.

Use `step=any`: exact presets/projected values are valid field values. Custom ArrowUp/Down changes a valid draft by0.1, with preventDefault so native stepping does not also fire. Empty/nonfinite drafts must get a clear prompt and remain unapplied; do not silently substitute0. Enter/Apply is the commit action.

Refined raw-input policy is approved: finite raw coordinates need not be bounded by the output box/disc. Apply the same existing normalizer and explain the resulting actual point. For example raw(3,1) in S4 must preserve its direction while scaling to modulus2.6, rather than reject3 or clamp x alone. Reject only inputs that cannot be processed safely (nonfinite values, snap multiplication overflow, invalid norm); preserve the old mathematical state and draft on rejection. The raw field must not misleadingly advertise min/max as the final output region.

Required nearby explanation: finite input →0.1 snapping → drawing-box clipping or radial scaling; disc-projected components may have additional decimals. These are plot interaction constraints, not limits on complex-number mathematics.

## Must-keep implementation details

1. `novalidate` plus explicit custom checks (or translated invalid-event handling) ensures native number constraints cannot prevent the intended bilingual error/status handling before submit. Mark offending fields with aria-invalid and connect error/help descriptions.
2. Unedited Apply is a no-op on the exact state: do not resnap the unit-circle/unit-modulus presets or previously projected point. Dirty commits may use the established drag normalization. After applying, synchronize fields to the actual result and disclose adjustment rather than claiming the raw value was used unchanged.
3. Target selection is presentation only. It must not move either point. Explicit target/preset/drag actions synchronize the affected form and intentionally discard that form's old draft. An S1 action must not discard an unrelated S4 draft.
4. Language refresh and resize retain draft text, selection, errors and actual S states. Stable inputs must not be rebuilt or overwritten midway through typing a minus sign/exponent. After an applied-state message, new draft editing must not misleadingly appear already applied; use a neutral pending indicator or clear that message.
5. Preserve pointer/mouse/touch algorithms and nearest-point selection. A shared assignment/render helper is acceptable, but exact presets still bypass snapping. Do not change S3 trajectories or Q1/Q2/Q3 choices/locks when editing S1/S2/S4.
6. Submit focuses/preserves the intended form control; errors should identify/focus the first offending input. Keep3px focus and forced-colors semantics on new fields/selects/buttons,48px targets and320px/doubled-computed-font wrapping. Do not rely only on changed canvas pixels or color.
7. Existing numeric readouts remain the authoritative textual results. A short localized status after explicit commit/error is enough; avoid live announcements on every pointer frame. No new storage key, analytics, answer record or mastery inference.

## Meaningful later acceptance

Cold-read the form instructions, then use keyboard-only input for S1 origin/negative real axis/box boundaries; S2 two arbitrary addends and coincident-point targeting; S4 arbitrary multiplication, zero factor, unit factor, out-of-disc radial projection and large/nonfinite rejection. Independently recompute values rather than trust ticks.

Include exact preset→unedited Apply→dirty commit→preset restoration; target change without movement; partial/invalid draft across locale/resize; valid/invalid submit; errors cleared by explicit target/preset actions; pointer/touch after keyboard and vice versa; existing quiz lock/trail preservation. Check both languages,320px actual enlarged text, native focus unobscured by the sticky nav, forced colors and repeated commits. Do not claim physical-device/screen-reader speech or all continuous complex values from bounded plot tests.

The scientific multiplication law and zero-argument conditions are unchanged. No new numerical physics or curriculum relation is required for this accessibility repair.

## Adjudicated target-selector refinement

The implementer's Mac Chrome headless probe did not change a native select value with its tested key sequence. This is an automation/environment observation, **not proof of failure on a physical Mac keyboard**. Independent source review confirms no application-wide select key interception: preventDefault is limited to form submission and ArrowUp/Down on number fields.

ADOPT two existing-style native mode buttons for each S2/S4 target instead of the select. With only two choices, always-visible targets improve discoverability and avoid dependence on a system popup in this test path. No third framework or persistent state is needed.

- Each button must be `type=button`, with a stable fixed target name and aria-pressed. The group has an associated target label. Exactly one remains pressed; pressing the active target must not toggle it off.
- Enter/Space activates the native button; do not claim radio semantics or add a custom arrow-key controller. Target selection changes only the editor presentation, not any complex-number value.
- form.dataset.target is the sole target owner. Existing preset/drag/reset synchronization updates it, pressed states and coordinate fields together. Defaults remain S2z1/S4z2; language/resize preserves selection.
- Prefer no-op on reselecting the already active target so an unrelated draft is not silently discarded. Actual target changes clear that form's draft/status and load the selected point, matching the intended old change-event contract.
- Fixed target button names must not be replaced by the generic current-target label synchronization. Input labels may display the chosen point; both target choices must remain distinguishable without color.

This refinement changes the earlier select-based design, not the mathematical limits, raw-input contract or original pointer/preset behavior. Browser acceptance must now use native Enter/Space on both target buttons and verify no unintended form submission or point movement.
