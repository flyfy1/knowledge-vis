# LTI audio: independent final code/science review

**Bounded PASS — zero remaining must-fix findings in the reviewed code/science scope.** This does not certify real-device audibility, freedom from every audible artifact, or human learning. Actual speaker/headphone listening was unavailable and is not claimed.

Reviewed actual `lti/audio-model.js`, `lti/audio.js`, `drawS2` integration, current BRIEF and relevant bilingual mapping copy. No Chrome was opened, no production files were edited and no other lesson was reviewed. This source-first implementation review is distinct from the separate cold UI walk and developer browser/OfflineAudioContext suites.

## Model and science

- The adapter repeats the existing28-sample SIG2 exactly515 times, appends512 input zeros, and delegates the whole14932-sample input to the existing zero-initial `runSystem`. It does not repeat a truncated output, reset at each pattern boundary, or use the h44 display as a filter.
- Buffer rate8000, duration1.8665s, fixed gain0.03 and one volume control are consistent. Actual maximum raw peak is3.875200950367902; a conservative two-voice digital bound is0.23251205702207411<0.25. Runtime finite/length/peak checks reject unsupported generated output rather than normalize or clip it.
- First56 raw input/output samples share fixed axes−2.2…4.3 and a distinct full-duration progress element. Their7ms prefix is not misrepresented as the full playback timeline. First28 outputs preserve the original S2 values.
- Playback envelopes operate on gains after raw model calculation. Copy explicitly separates this listening adaptation from filtering an enveloped input. The accumulator tail remains an explicitly truncated infinite tail.
- Parameter replacement computes a full fixed-parameter output, then starts at the current master offset. The copy correctly calls this an audition crossfade, not a changing-coefficient system transient. Input audition is not rebuilt by filter edits.

## State, scheduling and cleanup

The generation ticket prevents old asynchronous resume completion from replacing a newer play/stop decision. New voice creation waits for the previous closing chain while resume/unlock starts in the gesture. Late callbacks check their owning context/current voice. A rejected or non-running context is not presented as successful playback.

Rapid output edits coalesce until the prior10ms fade finishes. Retiring voices are removed only after their scheduled end; a new swap then uses the current master-clock offset. The guarded last25ms avoids initiating another end-of-clip fade. The natural last voice ends the session; Stop/hidden/pagehide/popstate/off-step/hash leave cancel the active RAF and swap timer, release/stop sources and close contexts. Delayed resume has a bounded1.5s timeout and a stale generation cannot restart sound. No autoplay, loop, persisted state, microphone or network media was introduced.

Language, refit and copy visibility call the same update with an unchanged key, so they redraw without restarting the master clock. The status distinguishes input/output/updating/ended/stopped/error/unsupported/interrupted. This source review found no model/controller inconsistency requiring another feature or a longer clip.

## Actual independent checks

`independent-code-probe.cjs` / `independent-code-probe.json` were written and executed by this reviewer:

- **198 adapter combinations**:3systems×66native a values. Correct length/rate/duration/scale; all generated samples equal the authoritative existing recurrence, first28 agreement, runtime two-voice bound. Five invalid cases reject. These are adapter checks against the existing model, not a separately invented DSP solver.
- An independent minimal mocked-WebAudio harness executed actual `audio.js`:24rapid edits (maximum observed voices2), same master offset, same-state redraw without source creation, Stop during deferred resume, new input playback followed by stale old resume, and hidden-page cleanup. Contexts closed, and controller snapshot showed no voices/active RAF/swap timer after cleanup.
- The harness models callback ordering and bookkeeping, not browser audio rendering, AudioParam interpolation, hardware timing or listening. Existing developer DFT/PCM/browser assertions are separate evidence and were not re-executed or relabelled as independent tests.
- `git diff --check` passed.

## Limits and handoff

No actual human hearing test was available. A functional Web Audio graph, rendered PCM, finite peak and browser progress cannot establish that the comparison is audible on a particular speaker or that rapid changes are perceptually click-free. Preserve that limitation in the release record. The separately requested UI review/its capacity-related interruption must retain its own actual coverage; this code PASS does not retroactively complete it.

Final reviewed source hashes are in `code-review-source.json`. No expansion to other steps, input sources, playback speed, clip length or a general sound framework is requested by this review.

## Final display-only checkpoint

After the probe execution, source-read the final progress/placement changes: elapsed text now remains accurate with reduced motion and mutates only when its0.1s display changes; natural end retains full progress while manual Stop returns to zero. The panel is now immediately after the a control, before the existing330px input/output plot; intro copy says “this step” rather than relying on its former vertical position. These changes do not alter buffers, gains, crossfades, tokens or the master clock. PASS remains unchanged. The earlier mocked callback probe was not rerun or relabelled as a test of these later display-only deltas.

One documentation sync was sent to the implementer: replace BRIEF’s former “reduced motion suppresses elapsed-text animation” clause with the final accurate status/progress behavior. This is a local contract wording update, not a new DSP or UI feature.
