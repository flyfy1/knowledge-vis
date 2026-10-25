# Reproduce the author checks

From the repository root, with the existing preview already running:

```sh
export EVIDENCE_DIR=/tmp/leetcode-773-review
python3 -B leetcode/773/tests/test_solution.py
node leetcode/773/tests/test_core.cjs
node leetcode/773/tests/browser.cjs
node leetcode/773/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 773 --validate-only
```

`EVIDENCE_DIR` defaults to this folder's `evidence/`. All result/screenshot
writers honor it. Run the solution check before the core check: it emits the
independently calculated expected values used to audit the JS simulation.
Browser tests use installed Playwright through NODE_PATH and honor
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_URL defaults to
http://127.0.0.1:18770. They do not start a server. Linux native manual-copy
uses Control+C, with a separate clipboard sentinel and actual readback.

`build_copy.py` is the local copy authoring helper; it is not needed for testing
and must not be run on a frozen reviewer candidate. No generator writes outside
this lesson. `official.json` captures the full public GraphQL response including
all observed language selector snippets, statement, constraints and examples.

The tests establish computation, rendering and source transfer under Chromium.
They are author self-checks, not independent teaching acceptance, an actual
LeetCode submission, public deployment verification, or novice learning evidence.
Zoom is document CSS zoom 2 in real Chromium; browser-chrome zoom and physical
devices are outside this test's evidence. At the combined 320px / 200% extreme,
boards retain 48px cells and use a focusable, keyboard-tested horizontal scroller.
