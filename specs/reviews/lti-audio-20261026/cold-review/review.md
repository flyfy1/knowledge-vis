# LTI audio independent cold review

## Method and predictions before operation

UI-first from `/lti/#step2`, without BRIEF, source or prior review. Inspect visible DOM/controls, native keyboard and browser touch. This is an AI walkthrough, not human learning research. No actual audio audition is available: playback feedback and later code review cannot establish heard timbre, loudness comfort or absence of audible clicks.

The page says its 28-point input pattern is repeated into a ~1.87s synthetic clip and all three selected systems act on the same signal. Prediction: input selection should play the same input independent of the system; processed selection should depend on system/accumulator decay. A mid-output parameter change should coherently replace the processed result while retaining clip position; Stop should silence/disable itself, and a second Stop should remain harmless. The static56-sample/7ms prefix should stay static while full-clip progress advances. The moving-average should smooth rapid changes, differencer emphasize differences, accumulator retain a decaying history; this is a mathematical expectation, not something heard.

## Outcome and boundaries

**No mustfix identified in the captured UI walkthrough or the narrow source review.** This is a scoped finding, not a full player/browser/audio quality certification. No product edits, commits, push or deployment. Owned Playwright runner session63342 was closed through its known stdin command `{"action":"close"}`; it reportedCLOSED and exit0. No process enumeration.

The browser tour was stopped at the root's cleanup request rather than repeated. The native phone touch tap, leaving-step/Back/hidden-page playback checks, and rapid overlapping async-open failure cases were **not independently browser-tested here**. Phone input button was exercised through normal Playwright click; that is not recorded as a native touchscreen test. Root's separate DSP/browser results were not substituted for independent evidence.

## Captured UI observations (before source inspection)

- DesktopEN: keyboard Space on Play input activated it; status became `Playing input x[n].` and progress advanced0.1→0.6s. Play processed started the processed comparison at0.1s. Selecting accumulator while it played changed the status to accumulator(a=.70) at0.3s; changing decay to self-selected.83 changed the status again at0.4s, without resetting progress to zero. All three systems were selected, and processed playback was exercised for moving average, accumulator and differencer.
- Stop via focused button+Space gave `Stopped. Returning will not resume sound.`, progress0 and disabled Stop. A second Space left the same stopped state. This is UI playback feedback, not a measured analog silence claim. Differencer playback subsequently ran to `Clip ended. Play again to compare.` after a2300ms wait; progress resets to0 on completion. The ended message makes completion explicit.
- Expanded limits/source section explains8000samples/s, the28-point pattern repeated515times,512zero tail,14932samples/1.8665s, recurrence carried across pattern boundaries, and an infinite theoretical accumulator tail approximated by the finite clip. It explains raw plot data versus start/end fades, fixed.03scale/shared listening volume without per-clip normalization, and device resampling.
- The mid-output-edit explanation is coherent: the new **complete fixed-parameter, zero-state output** is compared at the same clip position using a10ms crossfade. It expressly does not claim to simulate the transient of a changing-coefficient system. This matters because blindly changinga in an ongoing recurrence would be a different experiment.
- Static prefix explanation says56samples/7ms, fixed shared vertical scale and raw data; whole-clip progress is~1.87s, not slow motion through those56samples. The prefix remains a static plot while progress advances. The learner can connect the three h shapes to smoothing, differencing and history without conflating plot length with clip length.
- ZH390×1000: input playback activated and completed, localised status/buttons/volume and the static-prefix qualification are readable. Screenshot02 shows the three buttons wrapping, a clear focused input button, volume, completed progress, and prefix explanation. The page is vertically scrollable. Screenshot01 is an overview; screenshot02 is the useful listening-control viewport.
- EN/ZH both caution that processing may change loudness and that equal settings do not promise equal loudness. These are appropriate qualifications; this review cannot decide whether the listening difference is salient or comfortable to a human.

## Independent source review (only after UI, kept separate)

Read `lti/audio-model.js`, `lti/audio.js`, and the audio additions in`lti/app.js`; then inspected only the relevant existing SIG2/runSystem/three recurrence definitions needed to check the adapter's actual input and mathematics. Did not read BRIEF or other reports. Did not use app globals/internal playback snapshots as browser evidence.

### Math, scaling and plotted data

- audio-model.js:4–13 constructs28×515+512=14932 samples;14932/8000=1.8665s. It invokes the lesson's runSystem once on the whole sequence, so accumulator history continues across28-sample pattern boundaries and through thezero tail. It does not synthesize output from the short displayedh, independently reset each cycle, normalize each output, or clip values silently. It validates finite bounded input, allowed system/a, matching output length and finite output.
- The authoritative relevant recurrences in app.js are causal and zero-state: MA3 averages current and previous2 inputs, differencer isx[n]−x[n−1], accumulator isx[n]+a·previous output. Those definitions agree with the statedh descriptions for fixeda. No independent broader audit of other lesson systems was performed.
- Fixed gain.03 is applied at the master and multiplied by the same uservolume/100 for either playback. The model checks `peak*.03*2≤.25`, conservatively covering two simultaneous full-level voices. This is a bound on digital samples for accepted plans, not acoustic SPL or proof of audible comfort. This reviewer did not repeat root's full parameter sweep.
- app.js audio addition uses the returned rawx/y prefix0..55 on a shared fixed range−2.2..4.3, not faded/normalized playback data. This agrees with visible qualifications. Recurrences and the prefix use the same currentS2system/a.

### Playback and async lifecycle

- AudioBuffers are mono at the plan's8000Hz and contain the complete raw signal; voice/master gain handles audition envelopes. Initial attack/end scheduling applies8ms fades after the math. Voice start reads currentTime after buffer preparation and derives its offset from a sharedstartAt; output replacement therefore follows the original clip position rather than restarting the input.
- Parameter updates coalesce while a previous10ms swap is active. A retiring voice's gain ramps down and source is stopped; a new complete output ramps up. The code avoids a hard cut of a nonzero retiring voice and caps overlap structurally to the current/retiring pair; no uncontrolled pile-up was identified in this review. Audible crossfade smoothness still requires listening or separate rendered-sample verification.
- A generation ticket guards async resume completions; Stop increments it, cancels RAF/swap timer, clears current/mode, retires live voices, closes current **or opening** context and waits on pending disposal. New context creation/resume stays inside the click gesture before awaiting old disposal. Stale openings are closed instead of beginning playback. The1.5s resume timeout closes failed contexts and produces error feedback.
- Volume is smoothed through the master. onended only acts as current when context/voice identity still match; retired callbacks cannot end a replacement clip. Event handlers explicitly stop on hidden/pagehide/popstate/hash departure and section intersection loss; these lifecycle paths were source-reviewed, not newly browser-tested by this reviewer.
- The `snapshot()` testing helper was seen in source but not invoked as cold UI evidence. No mustfix was found by reading these lifecycle additions. Unsupported/denied AudioContext, device interruption and very fast async races remain bounded source reasoning here rather than full independent runtime coverage.

## Deliverables

`ui-transcript.jsonl`:24 UI commands with visible text/controls,08:49:17–08:52:55UTC. `ui-runner.cjs`: reviewer-owned driver. Screenshots01-phone-zh-overview.png and02-phone-zh-listening.png are viewport-only. This report separates actual UI observations, static source reasoning and unavailable human audition; none establishes that a person heard or learned the intended difference.

Source SHA256 at review completion: audio-model.js`f6661a356748e2b7bb1139fe98e343b8353031cd834bf29344d2225882d91dc8`; audio.js`2b5463dbf2567f9b155ef32574452894a199d4f844fda1a7a107a143f4e60722`; app.js`53c368bfdbe50522d9d8d9cc282140d336cf72a3961765f0695da00b848601c4`.

Layout follow-up without reopening browser: root raised an intended panel move closertoa controls because navigation distance can consume a1.87s clip. That is consistent with phone screenshot02, though the captured desktop edit completed within0.4s. No current mustfix was raised solely for this distance. If the28-point IO plot ends below the moved listening panel, update the spatial wording “pattern above”/“上方的28点模式” to a position-neutral reference. A later layout/copy revision is not represented as independently browser-verified by this report.
