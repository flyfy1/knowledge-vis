# Reproduce the author checks

From repository root, with the already-running preview at http://127.0.0.1:18770:

```sh
export OUTPUT_DIR=/tmp/leetcode-827-selfcheck
python3 -B leetcode/827/tests/test_solution.py
node leetcode/827/tests/test_core.cjs
node leetcode/827/tests/browser.cjs
node leetcode/827/tests/zoom.cjs
node leetcode/827/tests/state.cjs
python3 -B scripts/register_leetcode_lesson.py 827 --validate-only
```

Node uses the installed Playwright through NODE_PATH. If provided,
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is passed to Chromium. PREVIEW_ROOT can
change the preview origin. No test starts a service. Python writes oracle fixtures
to OUTPUT_DIR and the core test consumes them there, so run in the shown order.
All result/screenshot writers support OUTPUT_DIR; official.json is a frozen
public-source capture, not fetched by tests. build_local.py is a local authoring
helper which regenerates only index/copy/mirror/metadata for this lesson, not a test.

These are author self-checks. A separately dispatched reviewer must cold-walk
the frozen candidate before reading the BRIEF and audit original Python plus
independently chosen cases; none of these results is independent acceptance.
