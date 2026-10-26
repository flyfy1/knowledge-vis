# Official-access author self-check

Access date: 2026-10-27 in Asia/Singapore (the raw capture timestamp is 2026-10-26 UTC). Source: https://leetcode.com/problems/user-purchase-platform/

The official page opened through the web tool displayed: “Subscribe to unlock.” It also stated: “To view this question you must subscribe to premium.” The rendered public page did not expose the statement or language selector. This is a transcription of observed page text, not a screenshot or an authorized premium capture.

The normal unauthenticated public GraphQL endpoint was queried without credentials, cookies, proxy workarounds, or paywall bypass. The exact reproducible query and raw response are saved as `graphql-request.json` and `graphql-response.json`. `access-result.json` records the timezone-qualified capture time and HTTP status. Public sample rows and SQL setup were returned; the statement and code snippets were null. Internal question ID and displayed frontend ID are distinct; use frontend ID 1127 for lesson identity.

Result: source-access blocker. The sample input does not verify requested results, constraints, schema keys/nullability, ordering, or complete supported submission interfaces. In particular, a null snippets field is not evidence that Python is unsupported, and SQL setup is not a complete SQL dialect selector.

Author: Codex, current author run; exact model identifier unavailable. Independent reviewer: none. No lesson acceptance, official submission acceptance, production validation, or learner results are claimed.

Reproduce from the repository root:

```sh
OUTPUT_DIR=/tmp/1127-access python3 -B leetcode/1127/tests/probe_official.py
```

A later authorized/public response may change. Inspect its contents; the probe does not certify statement correctness or choose a language. To resume, provide an authorized official statement and complete language/interface capture, or approved authorized access in the environment. No credentials should be placed in these files.

Canonical-solution tests, browser controls/locales/layout/clipboard/contrast, and source parity are not run: there is no executable lesson candidate. The metadata preflight result is recorded separately and cannot establish readiness without a verified contract.

## Probe execution notes

The initial inline `requests` probe returned HTTP 200 with null statement and snippet fields. An initial saved probe using standard-library `urllib` received HTTP 403; no response capture was produced by that attempt. The saved probe was corrected to use the already successful ordinary `requests.post` transport (installed requests package required). Its recorded run returned HTTP 200, frontend ID 1127, `isPaidOnly: true`, null statement fields and null code snippets. No special access, cookies, or authentication were added.

## Non-mutating metadata preflight

Command from repository root:

```sh
python3 -B scripts/register_leetcode_lesson.py 1127 --validate-only
```

Observed exit code: 2. Output:

```text
Metadata validation failed: [Errno 2] No such file or directory: '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/1127/lesson-entry.json'
```

Expected failure for this blocked record, not a readiness pass. Metadata and executable sources remain absent rather than asserting an unverified language, interface, algorithm, or complexity. No registration was run.
