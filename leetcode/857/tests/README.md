# Reproduce the author self-check

From the repository root, using the existing preview on port 18770:

```sh
OUTPUT_DIR=/tmp/857-review python3 -B leetcode/857/tests/test_solution.py
OUTPUT_DIR=/tmp/857-review node leetcode/857/tests/test_core.cjs
OUTPUT_DIR=/tmp/857-review node leetcode/857/tests/browser.cjs
OUTPUT_DIR=/tmp/857-review node leetcode/857/tests/visual_supplement.cjs
python3 -B scripts/register_leetcode_lesson.py 857 --validate-only
```

Run the first three commands in order: Python generates exact-oracle fixtures
used by the core check. Every emitting test honors OUTPUT_DIR. Without it,
outputs go to tests/evidence. Browser uses NODE_PATH for installed Playwright and
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when supplied; PREVIEW_URL overrides the
existing preview root. No service is started. Host platform determines native
clipboard shortcut (Control+C on this Linux host). Clipboard permissions are
requested only in the automated local browser context.

Python executes the official callable and the displayed combination baseline,
checks all small (q,w) pairs from {1,2,3} through n=4, all valid k, 600 seeded
random cases, the official cases and maximum-n closed forms. A rational Fraction
oracle enumerates subsets independently of sorting/heap logic. Core checks each
prefix's membership, old/new sums, insertion/removal, candidate, best identity,
no mutation and source/localization representation. Browser checks actual DOM,
all trace paths, source transfers, 320/390/736/1440 widths at CSS zoom 1 and 2,
actual keyboard focus, forced colors, denial fallback, local assets and links.
Contrast helper is calibrated with black/white/primaries and a near-threshold
negative case before measuring the rendered solid color pairs.

These are author self-checks. Independent teaching review, actual novice
teach-back, LeetCode submission, real mobile devices, browser chrome zoom, and
public deployment are not established. Screenshots must be visually inspected;
a screenshot count alone is insufficient. harness-corrections.md preserves
failures and explains the author-time corrections before the final freeze.
