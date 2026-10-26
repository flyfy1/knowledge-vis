Run from the repository root, against the already-running preview:

```sh
python3 -B leetcode/1028/tests/test_solution.py
node leetcode/1028/tests/browser.cjs
node leetcode/1028/tests/browser_extra.cjs
python3 -B scripts/register_leetcode_lesson.py 1028 --validate-only
```

Node uses the environment's NODE_PATH for Playwright. Both browser scripts honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. PREVIEW_URL may override the full lesson URL. Every test that emits artifacts honors OUTPUT_DIR (default: this directory's evidence/). Example reviewer rerun without changing the candidate:

```sh
OUTPUT_DIR=/tmp/1028-review-numeric python3 -B leetcode/1028/tests/test_solution.py
OUTPUT_DIR=/tmp/1028-review-browser node leetcode/1028/tests/browser.cjs
OUTPUT_DIR=/tmp/1028-review-extra node leetcode/1028/tests/browser_extra.cjs
```

The numerical runner executes the actual official Python callable with a TreeNode judge shim, checks generated structures against the original independent trees and recursive token-splitting baseline, then streams those expected structures to the JS core test. The baseline is intentionally different from the stack algorithm. Canonical intermediate path/tree checks use Python tracing on the outer loop boundary. A 1000-node chain is checked iteratively to avoid imposing the baseline's recursion limit on the canonical solution.

Browser tests check the real preview in Chromium; screenshots are evidence for author visual inspection, not independent review. CSS content zoom 2 scales/reflows the real browser content at each viewport. This is not a claim about a physical phone or browser toolbar zoom on a different host. The extra runner checks actual keyboard horizontal panning at the narrowest scaled width and state preservation. Manual clipboard fallback uses the browser host OS shortcut and resets/verifies a distinct sentinel before each locale attempt. No test writes source into the clipboard to simulate successful fallback.

build_copy.py is an optional AUTHORING utility, not a reviewer test: it deterministically emits bilingual copy and exact Python mirror inside this lesson. Reviewers should run the tests above against frozen files without regenerating assets. Official GraphQL is a dated review-only capture, never fetched by the runtime.
