# Reproduce the author self-check

Run from the repository root using the existing preview (do not start a service):

```bash
python3 -B leetcode/810/tests/test_solution.py
node leetcode/810/tests/test_core.cjs
PREVIEW_URL=http://127.0.0.1:18770/leetcode/810/ node leetcode/810/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 810 --validate-only
```

Every test that writes evidence accepts `OUTPUT_DIR=/absolute/reviewer/directory`.
The browser runner uses installed `playwright` via NODE_PATH and honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. It launches a temporary headless Chromium
instance, uses the running preview, and closes the browser. Native clipboard
transfer uses the hosting OS shortcut (process.platform), with a fresh verified
non-source sentinel before each forced fallback attempt.

`provenance/official.json` is the public GraphQL capture of the official statement,
examples, constraints, access status and complete submission snippets. Python3's
supported callable is Solution.xorGame(self, nums: list[int]) -> bool. The exact
canonical source is solution.py; python-code.js embeds its bytes for offline use.
No language exception or non-Python language-contract.json is applicable.

Evidence distinguishes the candidate's asset/console errors from requests made
while following related pages. Existing #51 has no favicon declaration, triggering
one /favicon.ico 404 console message; the test records this separately and only
permits that exact inherited related-page condition. No requests are suppressed.

These are author self-checks, not an independent review, submission acceptance,
real-device validation, native browser zoom check or production verification.
