# Reproduce the author checks

From the repository root (use the already-running preview at port 18770):

```sh
python3 -B leetcode/432/tests/test_solution.py
node leetcode/432/tests/test_core.cjs
node leetcode/432/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 432 --validate-only
```

Node uses the environment's NODE_PATH for Playwright and Acorn. Browser launch
honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. No server is started.
All three tests accept OUTPUT_DIR to redirect JSON and screenshots for a reviewer:

```sh
OUTPUT_DIR=/tmp/432-review python3 -B leetcode/432/tests/test_solution.py
OUTPUT_DIR=/tmp/432-review node leetcode/432/tests/test_core.cjs
OUTPUT_DIR=/tmp/432-review node leetcode/432/tests/browser.cjs
```

The browser test grants Chromium clipboard permissions for native copy/readback,
then injects a rejection to exercise the manual fallback. Screenshot generation
is automatic; visual inspection remains a human/agent duty. The 200% checks use
CSS zoom and equivalent narrowed CSS viewport/DPR, not physical-device zoom.
The official evidence is a public GraphQL response with the Python3 code selector
interface, complete statement and access timestamp. It is not a runtime dependency.
This is author self-check material, not independent acceptance.
