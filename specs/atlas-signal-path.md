# Atlas: system fingerprint → convolution → frequency response

Read WORKFLOW, atlas/BRIEF.md and the visible edition spec before changing this slice.
[Independent design gate](reviews/atlas-signal-path-20261026/design-review.md) approved
one route and one relation, with no new node, DSP engine or learner state.

## Gap and chosen loop

Baseline has38nodes/47edges/10routes. The four existing courses are reachable but
there is no convolution→frequency-response relation or coherent route joining
their experiments. Ordinary route buttons give names without an action/observation.
P0/high-return slice: one four-station route, an optional current-station task in
the existing trail host, explicit source→claim→concept references, actual course
links and Back context. P1: numerical/cold UI verification. P2/deferred: other
route guides, new inline filter, parameter transfer, new lessons, mastery/checkmarks
and broad graph coverage; no demonstrated need for those here.

LTI#3 establishes the two conditions by counterexamples (passing a few fixtures
is not a proof). LTI#2 uses the actual3-tap moving average/h and optional existing
input/output audio. Convolution#2 uses its actual editable f/g example to expose
multiply-and-sum; explicitly state its numbers differ, no cross-page knob sync.
Freqresp#3 sets M=3 then its exact first-zero preset2π/M; keep Ω fixed and setM=2
to get magnitude1/2. This is the same averaging operation, tested with a sinusoid;
not a promise the multi-frequency28-point audition becomes silent.

## Scientific contract and provenance

For initially resting discrete stable LTI systems, y=x*h. When transforms exist,
Y(e^{iΩ})=X(e^{iΩ})H(e^{iΩ}); h absolutely summable supplies a stable response.
Sinusoidal steady response follows H even though an infinite sinusoid is not an
ordinary absolutely-summable input DTFT; do not pretend it is. Ω is rad/sample;
Hz requires a specified sample rate. Audio's8000samples/s is only its stated
audition mapping, not a timebase for every course.

FIR h=[1/3,1/3,1/3], H=(1+e^{-iΩ}+e^{-2iΩ})/3. AtΩ=2π/3 it is zero; startup
of a switched-on sine can still have a finite transient. M=2 at that sameΩ has
|H|=1/2. A moving average is not an ideal all-band low-pass.

Primary source: [MIT/Oppenheim lecture11](https://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/9434f9bde960fd3b2b81de3ad442f902_MITRES_6_007S11_lec11.pdf#page=5),
convolution property on slide11.5 and text on printed11-1. Read alongside the
actual local recurrence/presets. Store evidenceEdge IDs in each station; every
claim must resolve to a graph relation touching its concept and a source link.
Sources support the relation; browser/model tests support only our implementation.

## UI/state contract

Optional `stationTasks` extends existing trail data only. Current station shows
one question/action, exact experiment link, a native expected-observation/why-next
disclosure, evidence link and Previous/Next. Next chooses a concept, never marks
it learned. All guide selections reuse atlas node/query/history/locale ownership;
keyboard focus stays with the new task heading, narrow layouts show the task.
The task heading must also be in the visible viewport on desktop after keyboard
Previous/Next; activeElement alone is not evidence that its focus is visible.
Ordinary node exploration, filters, graph/list, off-route context and other labs
retain their existing behavior. Course Back/reload restores URL reading context;
no automatic parameter synchronization or audio start on return. No new store,
clock, runtime library, service or installed skill.

Reuse atlas tokens exactly (canvas/surface/secondary, ink/muted/cyan/border),
16px/24px gaps,12px radius,1rem/1.65 body. Static task content, controls≥48px,
3px focus, native disabled ends,320/200% text/EN-ZH/forced-colors/reduced motion.
No decorative animation. Existing lesson waveform/audio interaction supplies
the causal experiment; a guide alone is not evidence of learning.

## Prevention / acceptance

- Graph IDs/endpoints/bilingual/local anchors and station coverage/edge evidence;
  general association cycles remain legal, explicit prerequisite cycles reviewed.
  Malformed route nodes or array-shaped task records return validation errors,
  never throw while traversing an already-invalid optional task extension.
- Recompute the3tap zero,2tap halfgain and startup boundary independently against
  the actual LTI and frequency-response helpers. Use the exact preset, not2.094.
- UI-first station walk: each action names existing controls; route/question/why
  stays coherent across locale,Next/Previous, courseBack/refresh, filters/offroute.
- Verify actual M3zero→M2sameΩ output image/amplitude change and LTI h/audio entry;
  do not claim heard audio if only pipeline/numerical evidence exists.
- Shared atlas regression and models/labs appropriate to the shared changes;
  visible sourced Codex edition, no other worker files staged; record actual
  main/push/public status separately. No human learning/device claims.
