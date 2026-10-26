# Official access evidence — author observation only

Access date: 2026-10-26, Asia/Singapore. Exact UTC timestamps are retained in JSON captures.
Official URL: https://leetcode.com/problems/confusing-number-ii/

1. Web open of the exact official URL returned the official premium gate:
   “Subscribe to unlock.” and “To view this question you must subscribe to premium.”
   No statement, constraints, examples with outputs, or language selector appeared.
   The web tool labels its result as crawled three days earlier; it is corroborating
   evidence rather than a fresh authenticated page capture.
2. `official-graphql.json` preserves an ordinary unauthenticated POST to
   https://leetcode.com/graphql/, its full query, status and response.
   HTTP 200; question frontend ID 1088; Hard; paidOnly true;
   `content: null`; `codeSnippets: null`.
   Partial metadata and raw testcase inputs are insufficient to verify the contract.
3. A fresh Playwright Chromium request to the exact official URL returned HTTP 403
   and the security-verification page. `official-browser.json` preserves the body
   and timestamp; `official-page.png` is its full-page capture. The author visually
   inspected the screenshot: it shows the Cloudflare verification panel, no statement
   or editor. No challenge solving or bypass was attempted.
4. `check_official_access.py` repeats only the public GraphQL observation. Command:
   `OUTPUT_DIR=/path/to/reviewer-output python3 -B leetcode/1088/tests/check_official_access.py`.
   The author reran with OUTPUT_DIR set to this evidence folder's `recheck/` child;
   see its JSON observation. The script reports accessibility, not algorithm correctness.

Author status: blocked before implementation. Separate review: not performed;
no independent acceptance. No submission interface or algorithm is inferred.
Browser lesson matrix, oracle checks, canonical execution and source parity were
not run because no verified lesson candidate exists.

Required next input: authorized official statement, examples and outputs,
constraints and exceptions, and actual language-selector/starter-interface evidence
with official URL and access date. Credentials are neither requested nor accessed.

Non-mutating metadata preflight (from repository root):
`python3 -B scripts/register_leetcode_lesson.py 1088 --validate-only`
Result: exit 2, missing `leetcode/1088/lesson-entry.json`; see `preflight.txt`.
This is an expected incomplete-candidate failure, not a passing metadata gate.
No placeholder metadata, lesson UI or canonical source was fabricated to clear it.
