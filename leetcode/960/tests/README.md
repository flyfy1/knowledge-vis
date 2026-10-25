# Reproduce the author checks

From the repository root, using the existing preview server:

```sh
OUTPUT_DIR=/tmp/960-review python3 -B leetcode/960/tests/numerical.py
OUTPUT_DIR=/tmp/960-review node leetcode/960/tests/core.cjs
OUTPUT_DIR=/tmp/960-review PREVIEW_ROOT=http://127.0.0.1:18789 node leetcode/960/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 960 --validate-only
```

Use installed Playwright through NODE_PATH. If set,
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is passed as executablePath to both launches.
No new server is started. Tests do not mutate runtime files. OUTPUT_DIR redirects
JSON, screenshots, downloads and temporary native-zoom extension/profile files.
The browser runner uses the host platform for native copy (Linux Control+C here),
verifies a new clipboard sentinel before each fallback attempt, and reads back the
actual native clipboard. It grants clipboard permissions only to its test context.
The zoom check uses Chromium's tabs.setZoom(2), not CSS zoom or viewport-only
emulation; metrics are saved. Screenshots need human/agent visual inspection.

Evidence is author self-check only. The independent subset oracle is a different
calculation, not an independent reviewer. Numerical tests execute the canonical
Solution.minDeletionSize interface; core tests verify each ending length, old/new
update and retained chain. Browser tests compare rendered intermediate DP values
with an independent oracle and verify exact embedded/displayed/copied/downloaded
source, including trailing newline. Duplicate copy keys are checked before parsing.
No LeetCode submission, novice learning result or public deployment is implied.
