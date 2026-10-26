# LTI S2 audio · bounded acceptance and handoff

Implementation:78c9aaab96d0cee3efde398d3d73ad804e408127, based on main6551c919. No other course/LeetCode implementation changed. The final provenance commit identifies only this revised edition, retaining previous authorship.

## What to try

`/lti/#step2`: choose a system and accumulator decay, then Play input / Play processed. The synthetic28-point pattern repeats into a finite1.8665s clip. Raw56-point prefix and original h/input-output plots share the current recurrence. Live output edits audition a fixed-parameter full result at the same audio-clock offset using a10ms crossfade; not a true changing-coefficient transient. Stop/leave never auto-resumes. Native volume defaults50%; digital bounds do not promise acoustic safety or equal loudness.

## Verified final scope

- `node lti/tests/audio-model.cjs`: all66nativea values across3systems, independent convolution and closed-form frequency-response fixtures, first28 identity, repetition/tail, invalid data and zero cases; maxraw3.87520095, maxsingle scaled.116256, conservative two-voice triangle bound.232512<.25.
- `LTI_EVIDENCE=<out> NODE_PATH=<existing Playwright modules> node lti/tests/audio-browser.cjs`: native running AudioContext after click only; audio-clock progress; same-position current output/66rapid edits≤2voices; volume0/max; repeatedplay/Stop, naturalend; hash/Back/reload andhidden cleanup; absent/denied/late-resume/interrupt recovery. OfflineAudioContext8000→8000/44100/48000 produces distinct nonzero PCM, bounded peaks and end fades. Rendered WAV fixtures are adjacent, not shipped runtime assets.
- Same browser suite:390/DPR3 actual touch unlock/Stop inbothlanguages,320/200%text,48px controls, keyboard/3pxfocus/forcedcolors/reducedmotion. Final essential elapsed time remains accurate under reduced motion; completed playback keeps fullprogress, manualStop clears it.
- `node atlas/tests/signal-domain-core.cjs`: existing relevant signal mathematics regression passed.
- `node tests/page-provenance-core.cjs`: final21sourced static editions passed; onlyLTI added, unknown pages remain unlabelled.
- Final scoped browser smoke after attribution:320px EN/ZH label/start/Stop, Atlas LTI exactstep2 andBack context, actual MA3→acc.95 prefix image changes. Release task folder holds final smoke/screenshots; public delivery is separately recorded by visual-release.json, not assumed from these local checks.

## Independent review and adjudication

[Design](design-review.md), [code/science](code-review.md), [cold UI](cold-review/review.md): no remaining mustfix in the stated scope. Code reviewer separately exercised adapter and mocked async/race cases; cold reader used actual UI before reading source. Its provider ran out of capacity midturn, then resumed solely to close its ownedChrome/session63342 and finish existing evidence/source review; no missing live browser remains.

Adopted cold-reader placement refinement: panel immediately follows decay control, before longer IO plot. Intro now says “this step's pattern”, not “above”. Final source-review note requested BRIEF reduced-motion synchronization; BRIEF line68 already states accurate elapsed/native progress with no decorative animation. That note is resolved.

Early self-test assertions incorrectly expected playback to survive scrolling to the page-header language toggle, and later tried to fit several auto-scroll actions into a1.87s clip. LeavingS2 correctly stopped sound. Final DSP/race probe dispatches rapid parameters without changing viewport; cold UI evidence independently covers real system/a controls. Forced-colors test now establishes keyboard modality before testing :focus-visible. These were test assumptions, not reasons to remove offscreen cleanup.

## Limits and next action

No person listened through a speaker/headphones, and no physical Android/iOS/Safari or screen-reader certification. Actual WebAudio running/rendered PCM proves digital behavior, not heard timbre, comfort or learning gains. First valuable follow-up is real-device listening and checking whether system differences are useful at comfortable volume; do not add unrelated sound/pages to compensate. Sources and prevention contract live in lti/BRIEF.md and the shared sound guideline.

Supported current-Mac quota read at2026-10-26around08:37:12UTC:10080-minute(weekly)window used4%, remaining96%; resets2026-11-02T06:08:19Z. Five-hour data absent, not0. No reset/extra-credit/account/model switch used. This did not trigger≤20%pause.
