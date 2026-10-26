# Author checks

From repository root, with installed Playwright in NODE_PATH and an already
running preview at http://127.0.0.1:18770:

```sh
OUTPUT_DIR=/tmp/927-review-evidence python3 -B leetcode/927/tests/run.py
```

Every result/screenshot writer honors OUTPUT_DIR (default tests/evidence).
PREVIEW_ROOT can override the existing preview origin. Browser scripts use
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if present. No server is started. No source,
registry, metadata or campaign record is changed by run.py. build_copy.py is an
authoring helper, deliberately excluded from test execution.

The independent oracle exhaustively compares integer values for every cut; it
uses neither the canonical start/group rule nor the JS model. Python tests run
the actual Solution.threeEqualParts method, validate any legal answer, check
input preservation, and run the printed baseline too. JS tests independently
recompute values and audit intermediate starts, count, offsets and matches.

Browser checks cover eight presets in both locales, complete rewind/replay,
hand-cut selectors, every prediction choice, revealed-state language roundtrip,
exact offline mirror/render/copy/download, real native fallback (Linux Control+C,
fresh verified sentinel each locale), denied storage, offline loaded code,
keyboard navigation, related destinations, narrow widths and 200% CSS zoom.
The layout check adds headings, mismatch history, source and forced colors.
Contrast uses rendered opaque pairs and independently known WCAG reference pairs.

These are author self-checks. Separate cold review, real novice teach-back,
physical devices, native browser UI zoom, LeetCode submission acceptance and
production delivery remain unverified. Screenshots must be inspected again if
rerun on a different browser/font environment. The original self-check failures
and their harness/layout diagnoses remain in evidence/initial-selfcheck/.
