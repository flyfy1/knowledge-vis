# Reproduce author self-checks

From the repository root, choose a fresh output directory so the frozen candidate
and its evidence remain unchanged:

```bash
export OUTPUT_DIR=/tmp/leetcode-420-review
python3 -B leetcode/420/tests/test_solution.py
node leetcode/420/tests/test_core.cjs
NODE_PATH="$NODE_PATH" node leetcode/420/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 420 --validate-only
```

Requires Python3, g++, Node, and the provided Playwright installation. Browser tests
use the running http://127.0.0.1:18770 preview, never start a service, and honor
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No package installation is required.
The first command compiles a temporary C++ edit-distance oracle inside OUTPUT_DIR,
executes it and removes the binary, executes canonical Python and the displayed
Python baseline, rejects duplicate copy keys and checks source parity. It writes
oracle-cases.json consumed by test_core.cjs. The core checks every snapshot against
a separate deletion-budget DP. Browser output includes screenshots and numerical
contrast checks; inspect screenshots in addition to reading assertions.

The oracle's alphabet is input characters plus abAB01.!: unchanged input characters
must be retained as possible exact matches. Newly introduced characters of each
required class can be represented by two symbols to avoid adjacent equality without
changing match costs; dot and exclamation are included explicitly. Its recurrence
uses only insert/delete/keep/replace and the target grammar, without the submission's
floor-run formula or deletion ordering.

These are author checks, not an independent lesson review or LeetCode submission.
