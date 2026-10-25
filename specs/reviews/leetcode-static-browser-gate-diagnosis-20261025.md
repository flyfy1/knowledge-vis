# Static route browser gate: abandoned redirect documents

Date: 2026-10-25. Scope: the 120-lesson generated static stage served at `http://127.0.0.1:18778`, from source revision `104f82ca86ab2e48b402c2ffacb3bc142acac2c6`. No accepted lesson bytes or production files were changed by this diagnosis. Original failures remain preserved.

## Confirmed cause

Chromium can omit terminal network events for an intermediate numeric-path document after its client-side redirect has already replaced it with the expected Codex page. The gate retained that abandoned main-document request and incorrectly waited for it as a current-page resource. The observed pending requests were HTTP 200 `/leetcode/25/index.html?...` and `/leetcode/10/index.html?...`, while the current pages were the matching Codex destinations with the expected query and fragment. CDP likewise reported a response without a terminal event for the intermediate document; no missing current lesson asset was implicated.

Ranked hypotheses before probing were stale cross-navigation tracking, static-server stalls, and a genuine lesson resource hang. A single #25 check passed three times, while the original complete input reproduced the old-document wait on different lessons. Targeted request diagnostics and the CDP probe supported the first hypothesis. Direct HTTP access remained normal; the earlier complete payload check had verified all 1,717 generated file hashes.

## Minimal fix

Retire only an HTTP 200, top-level, numeric legacy navigation document when the exact fixed sibling Codex destination, query and fragment have already been verified. Ordinary resources, current documents, other origins, other paths and non-200 responses remain subject to the existing checks. Do not clear the pending-request map generally.

The deadline remains **10,000 ms**. `waitForURL` now explicitly waits for `domcontentloaded`, matching `goto`, so the same resource gate governs assets after redirects. Its previous implicit `load` wait held a deliberately stalled redirect-destination image for 30 seconds before the gate could inspect it. This change makes the existing resource deadline effective for that path; it does not lengthen it.

Remaining waits now report the current page and pending URL, method, type, top-level navigation identity, HTTP status, start document and elapsed time. No temporary `[DEBUG-...]` instrumentation remains in the scripts.

## Red/green evidence

Evidence directory: `leetcode-static-browser-gate-evidence-20261025/` beside this report.

- `first-failure.json`: original 120-lesson failure, preserved unchanged.
- `pending-request-red.json`: same complete input failed on #25 with actionable HTTP 200 intermediate-document diagnostics, 11.121 seconds.
- `cdp-red.json`: full-input CDP probe failed on #10 and confirmed the absent terminal event, 10.769 seconds.
- `deterministic-red.json`: the final real-Chromium fixture, with only the intermediate redirect's terminal events omitted, ran against `BROWSER_CHECK` extracted from the original source revision. It failed as expected: one failure, zero errors, 10.870 seconds.
- `browser-regressions-green.json`: all 10 browser-gate tests pass, 18.160 seconds. The deterministic positive asserts exactly two retired legacy documents. Negative controls create their stalled HTTP 200 image or HTTP 404 image only after arriving through the redirect, while also omitting the legacy document's terminal events; both still fail for the actual current resource.
- `all-120-final-green.json`: the unchanged complete physical stage passes with the final harness, exit 0, 120 lessons, 9.827 seconds. It checks bilingual lesson content, official links, actual Codex destinations, both legacy URL forms, and encoded query/fragment preservation. The natural final run retired zero documents; the deterministic fixture separately proves the intermittent branch. No further full-stage repeats are required absent a new change or failure.

Regression command (with the bundled Playwright `NODE_PATH`):

```sh
PYTHONPATH=scripts python3 -m unittest test_leetcode_publish_browser
```

Final SHA-256:

- `scripts/leetcode_publish.py`: `ab2b55e1007b637b5adcade6182fd61ccacb90b2eac47d88769b6a154959ae73`
- `scripts/test_leetcode_publish_browser.py`: `5b317897d0d0ed7ee5d6b1fdc81fac59e9ae421ecdafdb688c1ad476b0ec8cd4`

Independent narrow review reran the four relevant positive/negative cases successfully in 13.525 seconds. This report establishes the harness fix and local staged behavior; it does not claim public deployment.
