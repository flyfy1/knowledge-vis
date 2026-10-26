# Independent bounded design gate

**Approved for the proposed minimal implementation, with the following must-fix acceptance constraints.** This is a source-first design/science review of existing `interference/app.js` and nearby bilingual copy at base `2fdb47b2`, not browser validation. No product file was edited.

The change is necessary: current classification uses a 0.03-cycle window while `clsMin` promises identically zero displacement. For Δr=1.02, λ=2, φ=0 the actual combined amplitude is about 0.0628215A, so calling it a still point is false. Continuous source phase also makes the existing absolute-distance convention invalid for S3. The proposed single native phase control and immediate paused comparison repair an existing lesson rather than create another experiment.

## Required scientific contract

- Preserve `yAt(t,r)=A sin(ωt−kr+φ)` and `ySum`. For S3 define signed d=r₂−r₁ and δ=φ−kd; the amplitude is B=2A|cos(δ/2)|. Class and amplitude must use this same signed phase. Early chapters may keep their existing |Δr| presentation with φ=0. S3 must explicitly identify the sign convention instead of reusing an absolute n in its arithmetic.
- Replace the physical-width classification window with a small, documented floating-point tolerance on reduced phase (for example machine-epsilon scaled to the finite calculation), not another pedagogical near-zero band. Near cancellation is ordinary partial cancellation, not a point that is always still. Validate just outside tolerance and keep small nonzero amplitudes visibly nonzero/approximately labelled; rounded readouts cannot prove exact cancellation. The same classifier must correct any shared S1/S2/S4 still-point promises it drives.
- Instantaneous y₁/y₂/y₁+y₂ and nonnegative amplitude B are distinct quantities. A zero at one instant does not establish B=0. At fixed P the amplitude can be constant while displacement varies.
- Explain equal received amplitudes, a common frequency and stable relative phase, ideal linear superposition, and deliberately neglected spreading. Destructive interference does not assert destruction of energy; A/B are displacement amplitudes, not intensity or energy-flux measurements.

## Required state and teaching contract

Phase/P edits pause the existing S3 owner, retain its t and selected P (except the explicit P edit), then reconstruct the past two periods from the current formula. Label this a current-parameter analytic prediction, not measured playback history or a transient after physically changing a source. Include the current t sample so traces, present dots and readout agree immediately. Keep old play/reset semantics explicit, with S3 initially paused and lifecycle pause unable to resume unexpectedly on return. No new clock, controller, persistence, or quiz changes are needed. φ/π=0..2 is clear; mark π units, keep keyboard/pressed preset states correct at intermediate values and the equivalent 0/2 endpoints.

One canonical interference node at step1 and one sourced sine→interference application edge at step3 are proportionate. It is an application relationship, not a declaration that every learner must take sine first. Preserve all existing routes; expected totals are 39/51/14. Retain mixed original contributions under a Codex revised-edition label.

## Minimum verification before acceptance

Compare the actual amplitude/class against independent phase algebra and sampled extrema over a full period, including both signs of d, φ=0/π/2π and intermediate phase. Required counterexamples: d=1.02, λ=2, φ=0 is nonzero; d=+0.5, λ=2, φ=π/2 gives B=2A, while d=−0.5 with the same φ gives B=0. Confirm cancellation at all sampled t, not just one sample. Confirm paused edits preserve t/P, current endpoint/trace/readout synchronization, play and lifecycle pause, reset and locale/quiz invariants. Run bilingual 320px/actual 200% and native keyboard/focus tests, and ensure source links and graph targets resolve. Tests and UI review establish behavior, not learning effectiveness.

Source scope: parent reports reading OpenStax 16.4/16.5. This gate independently derived the sign/amplitude claims from the actual yAt/ySum equations; it does not represent a new full textbook or whole-course audit. No browser was launched and no blocker prevents beginning this bounded implementation.
