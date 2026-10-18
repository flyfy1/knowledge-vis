# Reproduce the author checks

From the repository root, use Python 3 and Node.js. Browser tests require the already installed Playwright package through `NODE_PATH`. The scripts honor `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. Use the existing preview; no script starts a server.

```bash
OUTPUT_DIR=/tmp/lesson76-review python3 leetcode/76/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson76-review node leetcode/76/tests/test_core.cjs
OUTPUT_DIR=/tmp/lesson76-review node leetcode/76/tests/test_browser.cjs
OUTPUT_DIR=/tmp/lesson76-review node leetcode/76/tests/capture_reading.cjs
OUTPUT_DIR=/tmp/lesson76-review node leetcode/76/tests/test_access.cjs
```

`PREVIEW_ROOT` defaults to `http://127.0.0.1:18773`. `OUTPUT_DIR` defaults to this folder's `evidence/`; set it to keep the frozen candidate untouched. Each test uses a distinct result filename. Screenshots are evidence only, not page assets. `build_page.py` is the optional local markup/metadata builder and writes only `leetcode/76/index.html` and `lesson-entry.json`; it is not needed to run tests. The offline source mirror must be regenerated from the exact solution.py source if that file changes.

The exhaustive oracle enumerates slices and independently recounts their characters; it does not use the sliding-window rule. Python executes the actual `Solution.minWindow` interface, plus the baseline extracted from the page. The JS suite also validates every frame's direct counts, deficit sum, atomic pointer changes, candidate minimum, and snapshot isolation. The full browser suite checks every event in both directions for six presets in both locales, along with all prediction options, copy success/denial, source/display/download equality, offline initialization, blocked storage, controls, links and responsive layouts. The reading and focused-access suites add hand-work/proof captures, maximum teaching input, long invalid drafts, code keyboard scrolling, inherited/composited contrast, and narrow 200% CSS zoom.

A rerun is a computational/browser check, not an independent teaching review. For independent review, begin with the lesson URL and frozen rubric before reading the brief or these author claims.
