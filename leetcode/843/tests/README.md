# Author checks (not independent review)

Run from the repository root. Every test that writes output supports OUTPUT_DIR;
set it to a new directory when reviewing a frozen candidate.

```sh
OUTPUT_DIR=/tmp/843-review python3 -B leetcode/843/tests/test_solution.py
OUTPUT_DIR=/tmp/843-review node leetcode/843/tests/test_core.cjs
OUTPUT_DIR=/tmp/843-review node leetcode/843/tests/browser.cjs
OUTPUT_DIR=/tmp/843-review node leetcode/843/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 843 --validate-only
```

Browser scripts use the already-running preview at http://127.0.0.1:18770;
PREVIEW_URL may override it. They respect NODE_PATH and
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, use actual Playwright Chromium and native
Linux Control+C / macOS Meta+C based on the browser host, and seed/read a fresh
non-source clipboard sentinel before each fallback attempt. No source is written
to the clipboard by the fallback test itself. Outputs include final-newline parity.

`build_copy.py` and `build_html.py` are local authoring helpers, not reviewer test
commands. They write only this lesson; do not run them on a frozen candidate.
Official capture is retained in tests/evidence/official-graphql.json and explained
in official-verification.md. No paywall or credentials were used.

Numerical tests independently enumerate reply groups and history consistency.
The JS trace is not execution of Python. Python executes against a fake judge
that implements the documented API and validates the original callable contract.
Budget stress is an intentional failure-to-find case, confirming the stated
limitation rather than asserting a universal ten-call bound.
