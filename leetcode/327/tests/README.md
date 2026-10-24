# Reproduce the author checks

From the repository root (the existing preview serves this checkout):

```bash
OUTPUT_DIR=/tmp/review-327-python python3 -B leetcode/327/tests/test_solution.py
OUTPUT_DIR=/tmp/review-327-core node leetcode/327/tests/test_core.cjs
OUTPUT_DIR=/tmp/review-327-browser node leetcode/327/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 327 --validate-only
```

The scripts default to tests/evidence but honor OUTPUT_DIR for every generated
report, downloaded source, and screenshot. Browser dependencies resolve through
NODE_PATH. PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is honored as executablePath.
PREVIEW_URL can override the existing default lesson URL; no service is started.
Python and core checks need no server. Browser checks also open the local page
offline, verify refusal of localStorage, exercise a denied clipboard and real
clipboard success, and inspect exact downloaded bytes. 200% is CSS layout zoom
in Chromium, not a claim about physical devices or browser-chrome controls.

Python uses direct sums of raw slices as its independent oracle, not prefix
pair counting. The real recursive return invariant is audited separately using
sys.settrace against original index blocks. The JavaScript simulation uses raw
subarray sums and checks boundary positions, block sorts, local pair counts,
accumulated contributions and deep-snapshot isolation. No simulated output is
used as proof of Python execution.

These are author self-checks. Independent cold review and acceptance are pending.
