# Reproduce author checks

From repository root, with the existing preview running at http://127.0.0.1:18770:

```sh
OUTPUT_DIR=/tmp/564-review python3 -B leetcode/564/tests/numeric.py
OUTPUT_DIR=/tmp/564-review node leetcode/564/tests/core.cjs
OUTPUT_DIR=/tmp/564-review node leetcode/564/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 564 --validate-only
```

Use the environment's NODE_PATH for Playwright. Browser checks honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and optional PREVIEW_ROOT. All generated files go to OUTPUT_DIR; numerical tests create the expected-value file consumed by the JS tests. Official capture is a dated, read-only provenance fixture, not a runtime dependency. No server is started by these tests. Tests are author self-checks and independent numerical oracles, not an independent lesson review.
