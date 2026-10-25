# Dispatcher Mac verification — 587-MAC-001

Date: 2026-10-25. Exact repaired candidate:
`c7cbe5d941ea468d521aa27a4c1320e21d69f503`. The whole local lesson tree matches
that Git snapshot. This verifies the original Mac regression; the separate
independent review `587-review-e5f03812be63` was still running at this check.
Do not infer full lesson acceptance from this dispatcher record alone.

The original unmodified `preset-scope.cjs` was extracted from pre-repair candidate
`f5816b88f3e7e280e4c89878a0e6490d1a3522e6` and run against the repaired local
preview on Mac Chromium 151.0.7922.34. It passed all 72 recorded states: both
locales, all six presets, 1365/320/390px, input and boundary counts, intermediate
and final trace states, locale preservation and the native-arrow fit assertion.
The original archived measurement probe also passed every measured option, with
no font override. No test assertion was removed or relaxed.

At 320px, the control remains 260px wide and 16px text uses the same CSS font stack.
The final candidate uses 6px horizontal padding, leaving 232px after the same
16px arrow allowance. The previously failing labels now measure:

| Selected label | Text width | Spare width |
| --- | ---: | ---: |
| Official 1: 5 boundary trees | 210.51px | 21.49px |
| Official 2: 3 boundary trees | 213.63px | 18.37px |
| 2 pops: 3 boundary trees | 194.62px | 37.38px |

The smallest spare width across the original probe's records is 18.37px. The
inspected actual `preset/en-preset5-320.png` screenshot shows the complete selected
label and arrow, alongside the four input points. This closes the original Mac
reproduction for this candidate. The earlier failed screenshots/results remain
in `mac-integration-20261025/`; no historic failure was overwritten.

The confirmed repair addresses the width budget under platform-dependent text
metrics using shorter unambiguous English labels and local padding. It retains
boundary scope, 16px text, preset identity and Chinese meaning. Canonical Python,
its mirror, and numerical behavior remain covered: the integration rerun passed
920 canonical cases and 34,955 core frames; metadata preflight passed.

Durable evidence: [mac-repair-verification-20261025](587-evidence/mac-repair-verification-20261025/).
`original-preset-scope.cjs` is the unmodified failing-test revision; `preset/`
contains its passed record/screenshots; `probe/` contains measurements and the
candidate receipt. Tests used temporary local HTTP serving of the matching
checkout with `PREVIEW_URL`, `EVIDENCE_DIR`, `OUTPUT_DIR` and installed `NODE_PATH`.
No runtime files or independent review evidence were changed by these checks.

This is native Mac Chromium with emulated phone viewport widths, not a physical
phone, human-comprehension study, or public-delivery verification. Separate
independent review must still complete before campaign acceptance is restored.
