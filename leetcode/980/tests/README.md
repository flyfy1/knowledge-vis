Author self-check commands (from repository root):

```sh
export OUTPUT_DIR=/tmp/leetcode-980-review-evidence
python3 -B leetcode/980/tests/test_solution.py
node leetcode/980/tests/test_core.cjs
python3 -B leetcode/980/tests/contrast.py
node leetcode/980/tests/browser.cjs
node leetcode/980/tests/visual_states.cjs
python3 -B scripts/register_leetcode_lesson.py 980 --validate-only
```

Run the Python test before test_core.cjs: it emits independently computed oracle fixtures in OUTPUT_DIR. All output-producing tests honor OUTPUT_DIR; default is this lesson's tests/evidence directory. Browser tests use PREVIEW_URL (default http://127.0.0.1:18794) and the already-running preview; they do not start a service. Playwright resolves via the supplied NODE_PATH; PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is honored when set. Native fallback copying uses Control+C on the Linux browser host, with a fresh clipboard sentinel before each locale attempt.

Canonical Python is executed directly, not through the browser simulation. The permutation oracle enumerates internal-cell orderings; the subset oracle counts exact visited subsets with immutable integer masks and memoization. Neither reuses the submission's in-place grid traversal. test_core.cjs checks every preset frame against path/adjacency/remaining/entry/undo/terminal invariants and the independent expected totals. Browser tests then exercise real controls and the rendered transfer surfaces.

Screenshots require separate visual inspection; generating them alone is not a visual pass. Zoom coverage uses real Chromium CDP scale 2, CSS zoom 2, and a 720 CSS px reflow equivalent for a 1440px desktop. This is not a physical-device or browser-chrome automation claim. Tests are author checks, not an independent review or real learner observation.
