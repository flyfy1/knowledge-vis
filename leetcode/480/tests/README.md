# Reproduce the author self-check

Run from the repository root, using the already-running preview at http://127.0.0.1:18770. No service startup, registration, submission or deployment is performed.

```bash
export LESSON_OUTPUT_DIR=/tmp/lesson480-check
python3 -B leetcode/480/tests/test_solution.py
node leetcode/480/tests/test_core.cjs
node leetcode/480/tests/test_browser.cjs
node leetcode/480/tests/test_reading.cjs
python3 -B scripts/register_leetcode_lesson.py 480 --validate-only
```

Tests use installed Playwright and Acorn via NODE_PATH. If PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is set it is passed to Chromium. PREVIEW_ROOT optionally changes the preview origin. Every test that writes results/screenshots honors LESSON_OUTPUT_DIR, defaulting to tests/evidence. Reviewers should use a fresh external output directory rather than overwriting candidate evidence.

The sorting oracle is independent of the count tree. Python executes the canonical Solution.medianSlidingWindow interface; JS checks simulated tree nodes and every requested rank against direct sorted windows. Tests cover official examples, nonmutation, exhaustive ternary arrays, seed 480 random cases, extremes, duplicates, k=1/k=n and 100000-element canonical runs. Acorn parses every copy object property before evaluation and demonstrates detection on a duplicate-key fixture.

The browser suite tests both locales, all presets and endpoints, complete forward/back traces, prediction/reveal/change and locale preservation, actual clipboard success and forced denial/manual selection, download/source bytes, storage denial, keyboard, all section/related anchors, 320/390/736/1440 widths, all preset terminal diagrams at each width, CSS zoom=2 at desktop, forced colors, reduced motion, local requests and contrast. The reading script records representative translated event meanings and exercises a file:// offline mirror. Layout zoom is a browser-rendered CSS zoom test, not a physical device or browser toolbar zoom claim.

Trace screenshots are viewport captures with controls/readouts at the top; focused tree captures cover the rest. Source selection screenshots show a scrolled textarea; the selection includes the entire canonical file, checked by offsets and exact bytes. overflow-debug.png is an earlier author diagnostic, superseded by the passing current captures. Earlier tall element captures briefly included the sticky navigation across the tree; the final capture helper centers focused trees, and real anchor geometry is tested separately.

These are author self-checks and computational evidence. They do not establish independent acceptance, novice comprehension, LeetCode submission acceptance or public delivery.
