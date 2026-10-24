# Reproduce author checks

From repository root, use the already-running preview:
```
OUTPUT_DIR=/tmp/363-review python3 -B leetcode/363/tests/test_solution.py
OUTPUT_DIR=/tmp/363-review node leetcode/363/tests/test_core.cjs
OUTPUT_DIR=/tmp/363-review node leetcode/363/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 363 --validate-only
```
`NODE_PATH` must expose installed Playwright; when set,
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` selects its executable. `PREVIEW_ROOT`
optionally changes the preview origin. No test starts a service.
Python produces fixtures used by the independent JS state checks; it derives
expected answers by direct cell enumeration, without compression or binary search.
The JS checks derive each ending interval directly from matrix cells, checking
query input, eligibility, candidate, and best, not just the terminal result.
`build_copy.py` rejects duplicate copy keys before emitting the dictionary;
`build_html.py` is a local authoring helper and only owns this lesson's HTML.
These are self-checks, not an independent lesson review.
