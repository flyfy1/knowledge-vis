# Reproduce the author checks

Run from the repository root with the existing preview server at
http://127.0.0.1:18770. Do not start another service. Playwright is resolved via
NODE_PATH; the browser test honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.

```bash
OUTPUT_DIR=/tmp/skyline-218-check python3 -B leetcode/218/tests/test_solution.py
OUTPUT_DIR=/tmp/skyline-218-check node leetcode/218/tests/core.cjs
OUTPUT_DIR=/tmp/skyline-218-check node leetcode/218/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 218 --validate-only
```

Use the same output directory for the first two commands: the Python test emits
a cell-painting oracle corpus consumed by the JS test. OUTPUT_DIR defaults to
this folder's evidence/. PREVIEW_URL can override the complete lesson URL.
The browser test also opens the local index via file:// with denied storage;
source display must work without a fetch. It captures viewport screenshots,
not only overflow metrics. The 200% cases use actual Chromium CSS zoom=2,
combined with physical viewport widths 320/390/736/1440. Diagram and ledger
scrolling are deliberate; the whole document must not overflow.

Official provenance is the dated public GraphQL response in evidence/official.json,
including the actual Python3 selector stub and both examples. No credentials or
premium access are used. The captured content is review material only; no runtime
script loads it.

These are author checks, not independent acceptance or LeetCode submission results.
