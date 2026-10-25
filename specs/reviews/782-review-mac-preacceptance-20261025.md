# Frozen #782 Mac compatibility check

Candidate `0e53a2131353accc11a5ef746c5eba164efb14e4` was exported with 132 exact
lesson/dependency files. All remained unchanged and no additional candidate files
were created. Original tests ran with external OUTPUT_DIR; no fixture or width
predicate was changed. This dispatcher check is separate from the currently
running independent review and does not establish lesson acceptance.

## Results

- Metadata preflight passed.
- Canonical Python check passed 704 boards, including exhaustive binary 2×2/3×3
  boards against legal-swap BFS and a permutation baseline, sampled 4×4/5×5,
  and explicit size-29/30 cases. The actual official callable was executed.
- Core check passed all 704 fixtures and 3,291 intermediate frames, legal swaps,
  counts/targets, state isolation, Python mirror and bilingual dictionary shape.
- Original browser suite **failed** at the English 320px preset fit assertion:
  `Four-corner check fails · −1` measured 219.57357788085938px, control 260px,
  horizontal padding 30px, arrow allowance 20px. Thus text exceeds the unchanged
  210px budget by approximately 9.57px. This is a failed conservative width budget;
  actual clipped glyphs are not established by this assertion alone.
- Focused screenshot/geometry check passed in both languages. Inspected the actual
  English 320px swap stage: retained original/current boards, marked rows 1/2,
  one performed swap and operation history agree. The Chinese 200% CSS-zoom board
  has equal readable cells and full row/column labels. This is CSS zoom, not native
  browser menu zoom or physical-phone evidence.

The browser suite reached its width loop only after its earlier interaction and
source-transfer assertions returned, including fresh verified clipboard sentinels
and native Meta+C fallback on this Mac. It did **not** reach all subsequent layout,
contrast, network, offline and storage assertions, so no full-browser pass is claimed.
The failure and original captures remain in the [evidence directory](782-evidence/mac-preacceptance-20261025/).

Do not change the frozen reviewer candidate or lower the assertion. Diagnose the
closed control and all labels, then use a new concise-label candidate if warranted,
rerun the complete unchanged original suite, and obtain independent review of that
candidate. Public delivery remains under the normal every-100 gate.
