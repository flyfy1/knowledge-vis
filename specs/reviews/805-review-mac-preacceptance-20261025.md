# Frozen #805 Mac compatibility check

Candidate `df8f6919bd2904df939664074267534472135146` was exported into an isolated
snapshot with 111 files, including the actual #446/#410 related destinations and
shared dependencies. All files remained unchanged and no files were added.
Original tests ran with external OUTPUT_DIR, with no altered predicates.

All four commands passed: metadata preflight; canonical Python with 3,729
exhaustive/seeded cases and 12 boundary fixtures; core with 1,299 cases and 6,829
intermediate states; browser with 92 rendered states. The canonical callable is
`Solution.splitArraySameAverage`; exact source mirror and input preservation
passed. Core snapshots use independently enumerated positional subset sums.

Browser evidence covers both locales and all seven preset traces, reversible
snapshots/endpoints, prediction reveal/invalidation, code/download/clipboard
parity, repeated native fallback using Meta+C on Mac, and a distinct verified
non-source sentinel before each fallback attempt. Layout checks use 320/390/736/
1440 CSS-pixel widths and CSS 200% zoom, not native browser menu zoom or physical
phones. Keyboard focus, locale preservation, storage denial, file initialization,
local link responses and zero observed asset/console/external request errors pass.
CSS totals 11,274 bytes. See [results and original commands](805-evidence/mac-preacceptance-20261025/).

Visually inspected English 320px subset rows: selected counts and complete sums
wrap within their half-list, including the zero-element sum. The inspected Chinese
prediction state explains why divisibility alone is insufficient, rejects the
incorrect equal-size assumption, and gives the concrete one-element [4] witness.
The scrollable page retains visible feedback before its Python-transfer section.
These inspections do not establish novice comprehension or screen-reader behavior.

This is a dispatcher platform check. The separate lane review remains responsible
for the full teaching/correctness assessment. No main registration, lane import,
acceptance or publication is claimed. A later changed candidate must be compared
and rechecked; these results do not transfer automatically.
