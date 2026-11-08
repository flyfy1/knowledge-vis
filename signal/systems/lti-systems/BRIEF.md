# LTI S2 · hear the same system

Read WORKFLOW, UI-I18N-SPEC and specs/visual-page-provenance.md before editing.
User request: `/lti/#step2` must offer sound. Existing teaching page says “hear an
echo” but has no audio. Do not spread decorative audio to unrelated pages.

## Design decision / bounded priorities

Independent gate: [review](../specs/reviews/lti-audio-20261026/design-review.md).
Adopted all model/time/gain/lifecycle/coalescing recommendations. Product verdict:
reuse SIG2, runSystem and S2 controls; add one optional listening panel immediately
after the existing decay control, before the longer input/output audit. P0: truthful original/output playback,
visible same-model waveform, safe lifecycle, EN/ZH and accessible fallback. This
is the high-return slice. P1: same-position fixed-parameter audition updates.
P2/deferred: microphone/files, all-step sound, speed/pitch knobs, looping, musical
presets and general audio framework—none needed for the requested comparison.
Actual speaker/headphone listening is not available to the automated reviewer;
rendered PCM and actual browser scheduling prove digital behavior only. Record
that gap explicitly; never claim a human heard or learned from these checks.

## Learning sequence and model contract

- Known: a discrete signal is a sequence; current S2 explains h and convolution.
- One question: how does this selected system change the same input?
- Input: existing28-point SIG2 repeated515 times, then512 zeros; current sys/a.
  Wanted: same zero-initial recurrence output, not a separate audio filter.
- Action: Play input, Play output, compare; while output plays choose average,
  accumulator or difference / vary a. Raw56-point plot changes immediately.
- Boundary: synthetic audition mapping8000 samples/s, not a room recording or
  a preexisting physical timebase; total14932/8000=1.8665s. The first56 points
  cover7ms, are static and use a fixed common axis. Full-clip progress is separate
  and derived from AudioContext.currentTime; never sweep it over those56 points.

All output is `runSystem(sys, input, {a})`, continuing state across repetitions.
First28 points equal the existing S2 plot exactly. h44 is only a display window
and is never the audio kernel. The512-zero tail truncates the accumulator's
mathematically infinite tail (a<=.95, residual multiplier<=.95^512).
Both audition copies receive8ms start/end fades *after* computing raw signals;
they therefore do not assert that windowed-output equals filtering windowed-input.
No per-system normalization, hidden DC filter, clipping or gain compensation.
Fixed gain .03 × shared volume(default50%,range0..100%). Supported maximum raw
peak3.875201; even2 concurrent voices have bound.232513<.25 at100%. This digital
bound is not a guarantee about a device's acoustic volume. Fail visibly on invalid
data/range; do not silently clip future expanded models.

Same-position10ms crossfades compare two full, independently zero-initial,
fixed-parameter outputs; they are not the true transient of changing coefficients.
Coalesce rapid edits until an existing fade completes; at most2 voices. Editing
the system during input playback does not rebuild unchanged input. Volume ramps.
Language/refit/copy visibility changes must not restart audio or the master clock.

## State / accessibility / tokens

No autoplay or loop. Each play click starts a fresh finite clip and is a user
gesture for resume/unlock. Idle/opening/input/output/updating/ended/stopped/error/
unsupported states have both languages. Stop works during delayed resume too.
Pending resume/old ended callbacks cannot resurrect or stop a newer session.
Stop on hidden/pagehide/popstate/hash navigation away/S2 leaving viewport; release
sources, contexts and owned RAF/timers. Return/reload never resumes audio.
If Web Audio is absent, resume denied or context interrupted/suspended, show a
truthful explanation and permit a new gesture retry; the silent plots still work.
No network media, capture, permissions, credentials, storage or learning tracking.

Reuse existing palette: bg#0d1117, panel#161b22, line#2b3547, text#e8edf4,
muted#9aa7b8, accent#6ee7ff, output#ffb454; existing system font/line-height1.7.
Scoped panel padding16px,gap12px,radius12px; controls>=48px,3px accent focus with
3px offset, forced-colors preserved. Static waveform, no decorative animation;
essential native progress and accurate elapsed time remain in reduced-motion mode.
No special hidden display override. No new fixed-height reading area.

## Recurrence prevention / acceptance

1. All66 a values and3systems: first28 equals S2; independent recurrence/convolution,
   repetition boundary, zero tail, finite/correct length, invalid input rejected.
2. Shared gain/bounds, true8k buffer duration, end fades, OfflineAudioContext rendered
   samples/differences/peaks; do not substitute different normalized clips.
3. Real AudioContext button gesture/resume; no context before click; repeated play,
   stop during resume, delayed/denied/absent/interrupted API; current system matches
   waveform and active/pending sound; max2 voices on rapid edits, natural end cleanup.
4. Hidden/offstep/Back/hash/reload dispose; no automatic resumption, no stale clock.
5. EN/ZH,320/390desktop, keyboard/focus,200% text, touch48px, reduced/forced-colors;
   actual screenshot comparison for current system, plus honest listening limits.

Sources: [LTI/convolution, MIT OCW](https://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/pages/lecture-notes/)
and [W3C Web Audio Recommendation](https://www.w3.org/TR/2021/REC-webaudio-20210617/)
(AudioBuffer sampleRate, source offset, AudioContext resume/close and gain automation).

Independent cold review supported moving this unchanged panel next to the decay
control to reduce travel during a finite clip. Positional “above” copy was removed.

## Codex fallback-continuity iteration — 2026-10-28

The local and production audio suites already confirmed user-gesture playback, native
`AudioContext` progress, lifecycle disposal and unsupported/denied recovery. A separate
JavaScript-disabled check exposed a small accessibility gap: `#s2-audio-status` was empty and
the playback/volume controls still looked active even though no handlers could run. The panel
now starts with the localized idle status (“not playing; choose a playback button”), and its
`noscript` branch hides inert audio controls while placing a bilingual explanation beside the
panel. The surrounding LTI explanation remains readable. No Web Audio scheduling, model,
mapping, gain, route or automatic-play behavior changed.
