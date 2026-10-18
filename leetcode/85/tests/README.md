# Reproduce author checks

From repository root, use the already-running preview server:

```sh
OUTPUT_DIR=/tmp/lesson85-checks python3 leetcode/85/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson85-checks node leetcode/85/tests/test_core.cjs
OUTPUT_DIR=/tmp/lesson85-checks node leetcode/85/tests/check_style.cjs
OUTPUT_DIR=/tmp/lesson85-checks/browser node leetcode/85/tests/browser.cjs
```

Playwright resolves through the environment's NODE_PATH. When provided,
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is used. BASE_URL optionally changes
http://127.0.0.1:18775. No service is started by these tests.

Python checks execute the original Solution method against a rectangle enumeration
oracle with zero-prefix sums; the displayed slow baseline is also executed.
JavaScript checks use a separate all-cells rectangle enumeration and inspect
intermediate snapshots. Browser tests exercise the real page, sources, controls,
locales, storage/clipboard denial, local assets and 200% CSS layout zoom.
Artifacts are all redirected by OUTPUT_DIR; no frozen candidate file is rewritten.
Screenshots still require human/author visual inspection. This suite is author
self-checking and does not establish independent acceptance or learner outcomes.
