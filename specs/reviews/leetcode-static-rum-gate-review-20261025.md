# Independent follow-up: exact Cloudflare RUM telemetry exception

Date: 2026-10-25. **Approved; no required findings remain.** This supplements the existing static-version and superseded-redirect reviews without replacing them.

Publisher SHA-256: **`7292c88e2ae035667a1bc723b076fb3d8d3d8562dc8428f3f66f74dc60f764d8`**. Browser-test SHA-256: **`97d1fcf062abd7201cedee1428b8e67454c4dcf7b8ce9f07983b4885d51d2a08`**. Reviewed code and disposable fixtures only; no implementation edit, deployment, campaign mutation or public browser rerun by this reviewer.

## Actual failure and scope

Read the retained public red: at `/leetcode/23-codex/`, the sole pending record was same-origin `POST /cdn-cgi/rum?`, resource type `xhr`, non-navigation, initiated from the previous #10 Codex document and still present after 10.081 seconds. The public HTTP record independently reports 1,717 checked ordinary URLs with zero hash failures. These are inspected execution records, not requests rerun here. Also inspected the deterministic slow-XHR red: one failure, zero harness errors, 10.951 seconds, with the same unfinished telemetry shape.

The final predicate requires **all** of: the public base's exact origin, exact pathname `/cdn-cgi/rum`, method `POST`, non-navigation, and `xhr` or `fetch` transport. Query parameters do not change that endpoint identity. It is reused consistently for pending-resource tracking, failed requests and HTTP errors. Such requests are recorded in a Set and reported as `ignoredCloudflareRumRequests`, separate from the existing beacon and retired-document counts. Navigation documents, images/scripts, GETs, other paths and other origins do not qualify.

This intentionally makes the already-present telemetry endpoint's completion or HTTP success unnecessary for lesson verification. It is a narrow browser-gate policy, not permission to ignore application requests or expand analytics. Lesson runtime, asset hashes, accepted sources, canonical code, page-error handling, ordinary first-party resource deadline, official links and bilingual-content checks remain unchanged. Other-origin HTTP errors still fail; the existing gate never treated all cross-origin pending traffic as first-party resources, and this review does not claim otherwise.

## Independent executed checks

Using installed Playwright with actual Chromium and disposable HTTP fixtures:

- Four cases passed in **33.356 seconds**: slow same-origin RUM POST succeeds with an explicit nonzero count; slow ordinary POST fails with method/path diagnostics; slow GET to the same RUM path fails; a current redirected page's stalled PNG still fails with its asset diagnostics.
- Two cases passed in **1.714 seconds**: same-origin RUM HTTP 503 is explicitly counted and permitted; HTTP 503 from `localhost` when the base is `127.0.0.1` remains a required failure with the exact URL in the error.

The PNG control retains the prior omitted-redirect-terminal-events fixture, so the telemetry change was also checked alongside the previous narrow redirect repair. The new tests use real XMLHttpRequests and a server that sends a partial body then waits; they do not globally disable request events. Source inspection additionally confirms POST navigation and non-XHR/fetch resource types cannot satisfy the predicate. Logs and exact hashes are archived in `leetcode-static-rum-gate-evidence-20261025/independent-review/`; original public/deterministic red records remain in its parent directory.

The full public 120-lesson browser gate must now be rerun and its explicit ignored telemetry count preserved. Existing passing file hashes and these focused fixtures cannot substitute for that public navigation result. No local full-120 rerun was necessary for this endpoint-specific change, and none was performed here.
