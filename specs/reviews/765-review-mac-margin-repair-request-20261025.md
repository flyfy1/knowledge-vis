# Reopen #765 for native-select text margin

Dispatcher adoption of the [independent diagnosis](765-mac-fit-diagnosis-20261025.md).
Original accepted candidate: `7ec592bddf5642212cdcb3363510982354da780e`.
Finding ID: `765-MAC-MARGIN-01`. Required for this repair cycle; do not rewrite
the original independent review or call the prior screenshot visibly clipped.

The original Mac browser suite fails its unchanged 24px-reserve fit assertion.
Canvas and DOM measurements agree: the English preset label is about 209.44px
against a 206px conservative budget. The actual selected label and arrow remain
visible. The proposed replacement `8 people: counterexample` preserves both
eight-person scope and counterexample purpose and measures about 200.016px on
the same Mac, satisfying the original assertion with approximately 5.98px margin.

Adopt the independent reviewer's label-only recommendation. Reuse the approved
lesson design, tokens, controls and layout; this adds no new feature or surface.
The learner's job remains comparing partner swaps on the eight-person
counterexample. The highest-return change is a complete, concise preset name.

P0: update the English label consistently, retain all five preset identities,
Chinese meaning, algorithms, source parity, trace state and original width check.
Prove the original full suite now passes; inspect all presets in both languages
at 320/390/desktop and after a locale roundtrip. Keep source and test provenance.
P1/P2: no new work. Defer font/layout changes because no such change is needed;
do not lower the arrow reserve, shrink text, or substitute a weaker test.

Follow the diagnosing-bugs skill. Preserve the existing red reproduction, record
the confirmed conservative-budget cause in repair evidence, and create a fresh
candidate. A separate reviewer must assess the complete lesson normally, with
the original reports retained. Mac verification must rerun the unchanged original
suite after the repair, including the checks beyond its original failure point.
The DOM probe alone proves neither full-suite success nor acceptance. No public
release is implied; the lesson remains subject to the ordinary 100-item batch.
