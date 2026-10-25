# Reproduce the author checks

From the repository root, using the existing preview (do not start a service):

```sh
export LESSON_OUTPUT_DIR=/tmp/leetcode-699-review
python3 -B leetcode/699/tests/test_solution.py
node leetcode/699/tests/test_core.cjs
node leetcode/699/tests/browser.cjs
node leetcode/699/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 699 --validate-only
```

Node uses the environment's NODE_PATH packages (Playwright and Acorn).
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is honored when set. LESSON_URL optionally
overrides the default http://127.0.0.1:18782/leetcode/699/ . The Python runner
creates oracle-cases.json in LESSON_OUTPUT_DIR, consumed by test_core.cjs. All
runners write evidence only to that output directory and read the frozen lesson.
Browser checks use Linux Control+C or macOS Meta+C based on the actual Node host,
seed a non-source clipboard sentinel before each forced fallback, and read back
the real keyboard copy. The tests change only test-browser clipboard permissions,
never application credentials or global services. Browser checks should run
sequentially if other clipboard-writing tests share the same host.

Canonical Python is executed against a separately derived coordinate-compressed
skyline. JS frames are checked against those independently generated prefix,
bottom and top values. Acorn checks localization keys before evaluating the
object, so duplicate keys cannot be silently discarded. Browser screenshots
require human visual inspection; a passing script alone is not that inspection.

The safe preflight validates metadata and source contracts without registration.
Author results do not establish separate review, novice outcomes or deployment.
