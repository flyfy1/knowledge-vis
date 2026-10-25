# Public browser gate: Cloudflare RUM accounting

Date: 2026-10-25. This follow-up changes only publication verification and its tests. It does not change lesson assets, the website, analytics behavior, acceptance records or deployment state.

## Confirmed cause and narrow policy

The public browser gate treated every same-origin request as a lesson dependency. Cloudflare's injected analytics made a long-lived XHR `POST https://visual.integ.life/cdn-cgi/rum?` during the previous #10 page's lifecycle. It was still pending on #23 and incorrectly blocked readiness after 10.081 seconds. The separate public file verification had already passed all 1,717 generated hashes. The original public failure is preserved in `leetcode-static-rum-gate-evidence-20261025/public-red.json`.

Exclude only non-navigation XHR/fetch requests whose origin exactly equals the verified site, method is exactly `POST`, and pathname is exactly `/cdn-cgi/rum`. Query parameters are allowed. Count unique requests explicitly in `ignoredCloudflareRumRequests`, including telemetry network/HTTP failures, without asserting that those requests succeeded. Keep the existing separately counted known Cloudflare beacon policy.

GET requests, other paths, other origins, navigation documents and image/script assets are not covered. The **10,000 ms resource deadline remains unchanged**. Page errors and ordinary resource failures remain required failures.

## Verification

- `deterministic-red.json`: a real Chromium fixture with a slow same-origin RUM POST failed before the change, one expected failure, no test errors, 10.951 seconds.
- `focused-green.json`: six real Chromium cases passed in 35.122 seconds. Slow RUM POST and same-origin RUM HTTP 503 are separately counted and nonblocking. A slow ordinary POST, GET to the same RUM pathname, another origin's RUM-path HTTP 503, and a stalled current-page image remain failures.
- Existing local 120-lesson evidence was not rerun for this public-only analytics classification change. The parent owns the final complete public run and deployment/adoption-pin update; this report does not claim that run has passed.

Evidence is in `leetcode-static-rum-gate-evidence-20261025/` beside this report. The focused fixtures are in `scripts/test_leetcode_publish_browser.py` and use the actual Chromium gate, not a mocked verdict.

Final code hashes for independent review:

- `scripts/leetcode_publish.py`: `7292c88e2ae035667a1bc723b076fb3d8d3d8562dc8428f3f66f74dc60f764d8`
- `scripts/test_leetcode_publish_browser.py`: `97d1fcf062abd7201cedee1428b8e67454c4dcf7b8ce9f07983b4885d51d2a08`

Suggested commit cause: the gate classified optional same-origin Cloudflare RUM POSTs as critical lesson resources, allowing telemetry from an earlier page to block the current lesson's readiness.
