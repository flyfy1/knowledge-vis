# Dispatcher Mac verification — #664

Frozen candidate: `1b0ea863ab72246b364e79f1b766bcb091c9ccdc`.
Date: 2026-10-25. Native Mac Chromium 151.0.7922.34. This is supplemental
platform evidence, not an independent lesson acceptance review.

The candidate was exported to an isolated Git archive. All 149 selected tracked
lesson/shared files were compared with that revision; their hashes still matched
after execution. Outputs went outside the archive. Original test commands passed:
`python3 -B leetcode/664/tests/check.py` (621 oracle/boundary cases),
`node leetcode/664/tests/core.cjs` (7,006 frames),
`node leetcode/664/tests/browser.cjs` (78 recorded states),
`python3 -B leetcode/664/tests/source-check.py` (10 executions of the baseline
captured from the DOM), and `node leetcode/664/tests/zoom.cjs`.

The last command used a private temporary Chromium profile and test extension
to set actual browser zoom to 2, verified DPR 2 and layout viewport 640 from a
1280px window, with no CSS zoom. The installed full Chrome-for-Testing executable
was explicitly supplied to the original scripts to support the extension. The
profile was removed afterward. The browser test's local-request guard and zoom
script hardcode port 18782; the frozen archive was served on that port. These
facts are recorded rather than claiming arbitrary-origin or browser portability.

Inspected the English 320px table, Chinese 390px introductory overwrite example,
and English actual-browser-zoom capture. Row identities remain visible during
horizontal table scrolling; off-screen columns remain reachable rather than
being claimed to fit simultaneously. The introductory board clearly distinguishes
the intermediate `aaa` from target `aba`. The zoom view retains indices, values,
current cell, and final whole-string minimum. These checks use desktop Chromium
with emulated viewport widths, not physical phones or human learning evidence.

## Clipboard evidence boundary

The original browser script passes on Mac, but its manual-copy check alone is
insufficient: it leaves the previous canonical copy in the clipboard and invokes
Control+C. A separate negative control confirms that equality can pass with no
copy action; a distinct sentinel plus Control+C remains unchanged on Mac. That
original pass is therefore not attributed as proof of actual manual transfer.

The supplemental native Meta+C case starts with the same distinct non-source
sentinel, verifies focus and complete selection (0..507), performs the copy action,
then reads the exact canonical solution.py bytes. It passes and changes the
clipboard from its sentinel. Thus actual manual copying works on this frozen
candidate; the evidence gap is filled by this explicit additional test, without
silently altering the frozen suite or alleging a runtime copy defect. The proposal
for stronger future test conventions remains a separate pending policy adoption.

Evidence: [mac-candidate-1b0ea86-20261025](664-evidence/mac-candidate-1b0ea86-20261025/).
Receipt, test outputs, negative-control source/results and inspected screenshots
are retained. Generic test-produced “author self-check” labels are preserved;
they do not replace this dispatcher's evidence attribution or the separate review.
No online judge or public-delivery result is claimed.
