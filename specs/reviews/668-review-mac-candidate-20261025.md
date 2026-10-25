# Dispatcher Mac verification — #668

Frozen candidate: `35361f0d0b2d73579b8c4b03ad9328b4fb0a2ca6`.
Date: 2026-10-25. This is supplemental platform evidence, not independent
lesson acceptance. An isolated Git archive's 154 selected tracked lesson/shared
files matched the candidate before and after checks; no original file changed.

Canonical Python passed 6,892 oracle/boundary cases, including 30,000×30,000
closed-form bounds. The teaching model passed 6,390 cases, 44,642 frames and
6,516 count thresholds. The 28-check original layout audit passed on native Mac.
Outputs were redirected outside the candidate; numeric/core tests were not
repeated after the unrelated browser-harness adaptations below.

## Original failures and explicit platform adaptations

The original `tests/browser.cjs` failed on Mac: its Control+c action left the
distinct manual-copy sentinel unchanged. A separate adapter changed only that
shortcut to Meta+c for the local Mac browser, preserving all assertions. Actual
canonical copy readback then passed, but CDP screenshot capture failed with
`Page.captureScreenshot: Unable to capture screenshot`.

The capture probe tested the same stable page and browser with false/true/false
values of `fromSurface`. Both false calls failed; the true call produced a
nonblank screenshot that was visually inspected. No layout, timing, application
or browser-mode change was needed. This identifies the capture parameter as the
host-specific harness failure in this environment, not a page-rendering defect.

The final separate adapter retains all original assertions and changes exactly
two platform choices: native copy key and `fromSurface: true` on Mac (the original
false value remains for other hosts). It passes the entire browser suite:
44 interaction states, 10 layout observations, 23 screenshots, no runtime errors,
exact canonical display/mirror/copy/manual-copy/download parity, all prediction
choices, locale preservation, keyboard controls, local links, denied storage,
offline rendering, forced colors, and actual 200% browser zoom. Combined CSS is
12,046 bytes. No claim is made that the original browser script passed on Mac.

The original, key-only adapter and final adapter are retained with distinct
hashes and failure records. Place either adapter beside the original browser
test in the frozen archive to preserve its relative source paths. The final
report's inherited text mentioning Ctrl+C is not the actual Mac shortcut; the
adapter source and this report specify Meta+C. The installed full
Chrome-for-Testing executable was supplied to support temporary zoom extensions;
private test profiles were removed by the completed test, with no user-profile use.

## Visual inspection and limits

Inspected English controls at 320px, Chinese lab/row counts at 320px and English
native 200% zoom. The default midpoint 3 highlights five cells with row counts
3+1+1; the interval readout separately shows the resulting [1,3]. History retains
earlier tested midpoints rather than relabeling them as current bounds. Controls
wrap legibly, the full selected label fits, and dense history has explicit
horizontal-scroll access. Actual zoom records DPR 2 and a 720px layout viewport
from the 1440px window. The screenshot capture is nonblank at this zoom.

Evidence: [mac-candidate-35361f0-20261025](668-evidence/mac-candidate-35361f0-20261025/).
Receipt, original and adapted scripts, original failures, capture probe/results,
test results and inspected screenshots are preserved. Original commands use
`python3 -B leetcode/668/tests/test_solution.py`, `node .../test_core.cjs`,
`node .../browser.cjs` and `node .../layout-audit.cjs`; the final browser rerun
uses `node leetcode/668/tests/browser.mac.cjs`, with PREVIEW_URL and OUTPUT_DIR
set explicitly. This is desktop browser evidence, not a physical-phone,
online-judge, human-learning or public-deployment result.
