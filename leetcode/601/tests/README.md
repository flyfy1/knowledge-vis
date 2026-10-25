# Reproduce author checks

Run from repository root. Python needs pandas (tested with Python 3.12.3 and
pandas 3.1.0). Node needs the available Playwright package via NODE_PATH.
No test starts a server. The supplied preview must already serve this checkout.

```sh
OUTPUT_DIR=/tmp/review-601-python /tmp/venv262/bin/python -B leetcode/601/tests/check_solution.py
OUTPUT_DIR=/tmp/review-601-core node leetcode/601/tests/check_core.cjs
OUTPUT_DIR=/tmp/review-601-browser node leetcode/601/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 601 --validate-only
```

Replace `/tmp/venv262/bin/python` with any Python interpreter containing pandas.
Each result-producing test accepts OUTPUT_DIR; no candidate mutation is needed.
Browser test also accepts PREVIEW_URL (default supplied localhost preview), and
uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if set. Browser checks include CSS page
zoom at 200%; no physical-device or native browser-toolbar zoom claim is made.
The core oracle splits maximal consecutive runs, distinct from the production
triple-union mechanism. Python tests execute the actual official callable on
DataFrames. No SQL execution is claimed or needed for this canonical Pandas lesson.

`provenance/official.json` retains public GraphQL question content and the complete
observed language/snippet list with access timestamp, URL and query. It is audit
material and never loaded by the lesson. `tests/evidence` is author evidence,
not an independent acceptance report. Screenshot inspection is recorded separately
in SELF-CHECK.md. No LeetCode submission or actual novice test was performed.
