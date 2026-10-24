# Reproduce author self-checks

From the repository root (the preview is already running):

```bash
OUTPUT_DIR=/tmp/381-self-check python3 -B leetcode/381/tests/test_solution.py
OUTPUT_DIR=/tmp/381-self-check node leetcode/381/tests/test_core.cjs
OUTPUT_DIR=/tmp/381-self-check node leetcode/381/tests/browser.cjs
OUTPUT_DIR=/tmp/381-self-check node leetcode/381/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 381 --validate-only
```

All emitted reports, downloaded sources and screenshots use OUTPUT_DIR. Without
it, the browser uses this folder's evidence/; Python/core print results and write
reports only when OUTPUT_DIR is set. No test changes candidate source files.
Browser resolves Playwright and Acorn via the available NODE_PATH. It honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and optionally PREVIEW_URL (full lesson URL).
No service is started. The browser's offline test additionally opens local HTML.

The Python oracle keeps an ordinary list, deletes its first matching occurrence,
and compares multisets rather than assuming an internal array order. A separate
index reconstruction checks both directions of pos after each small update.
Enumerated getRandom indices establish the exact count-weighted result mapping;
this is stronger and more reproducible than a statistical frequency tolerance.
The real random.randrange call shape is checked. A custom set forces deletion
of every possible position, including equal-valued tails. The 200,000-call stream
executes the actual canonical class.

The JS model is checked independently against list counts and reconstructed index
sets, including every intermediate completed frame. Browser navigation tests
snapshots forward/backward and exercises actual controls. Screenshots capture the
completed equal-tail deletion (preset 1, operation 4), with before/after labels.
200% tests include Chromium CSS zoom=2 and a half-width/DPR=2 reflow check;
these are desktop emulation, not a claim of physical phone/browser-chrome testing.

Official evidence is a public GraphQL response with exact request endpoint,
official URL, timestamp, statement, metadata and all returned code templates.
It is review evidence and is never loaded by the lesson.

These are author self-checks. They do not constitute the separate lesson review,
a real learner study, a LeetCode submission or deployment acceptance.
