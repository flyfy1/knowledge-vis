# #782 required Mac selected-label repair

Finding: **782-MAC-FIT-01**. Original candidate:
`0e53a2131353accc11a5ef746c5eba164efb14e4`.

Adopt the [independent diagnosis](782-review-mac-fit-diagnosis-20261025.md):
the English preset `Four-corner check fails · −1` exceeds the unchanged width
budget and the closed control fails to display the complete `−1` at 320px on Mac.
This is confirmed rendered behavior, unlike a numeric budget failure alone.
Use **`Four-corner failure: −1`**, which retained the complete meaning and result
with 34.65px spare in the diagnostic probe. No font, padding, layout or allowance
change is needed. Preserve the original browser predicate and test history.

Reuse the approved lesson design. P0 is a complete preset name and unchanged
lesson behavior; P1/P2 add no work. Defer layout/font redesign because a concise
label resolves the observed issue. Preserve seven presets, Chinese meaning,
algorithm, trace, source parity, and links. Update only the necessary copy/cache
reference and add a targeted regression check if needed; do not rewrite evidence.

Also read and address every required finding in the completed original independent
report `specs/reviews/782-review-1-f9de8180.md`. This dispatcher finding supplements
that report and never overrides a separate correctness or teaching finding.
Retain its original outcome and the [failed Mac evidence](782-review-mac-preacceptance-20261025.md).

Follow the diagnosing-bugs discipline: preserve the red reproduction, make a fresh
candidate, and state the confirmed too-long native-select label cause in repair
evidence. Rerun the original full suite on the author host, including all checks
past the original failing assertion. The dispatcher will rerun the exact repaired
candidate on Mac; the Pi author must state that Mac verification is pending,
not claim cross-platform execution. Actual Mac full-suite success and a fresh
separate review are required before the dispatcher closes 782-MAC-FIT-01 or
imports this lesson into main. Do not mark the old candidate accepted for Mac.

A successful DOM-only probe proves neither full-suite success nor final acceptance.
The original independent review is allowed to finish unchanged before this repair
starts. No public release is requested; the every-100 gate remains unchanged.
