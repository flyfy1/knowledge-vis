# Independent follow-up: superseded redirect document events

Date: 2026-10-25. **Approved; no required findings remain.** This narrow review supplements, and does not replace, `leetcode-static-versions-implementation-review-20261025.md`.

Reviewed publisher SHA-256: **`ab2b55e1007b637b5adcade6182fd61ccacb90b2eac47d88769b6a154959ae73`**. Browser-test SHA-256: **`5b317897d0d0ed7ee5d6b1fdc81fac59e9ae421ecdafdb688c1ad476b0ec8cd4`**. No deployment, campaign mutation or implementation edit by this reviewer.

## Evidence and rule

Inspected the actual 120-lesson diagnostic failures: the #25 and #10 numeric `index.html` requests recorded HTTP 200, while the browser had reached the expected Codex destination with the expected query/fragment. The old resource tracker retained those superseded documents past its unchanged 10-second deadline. The CDP diagnostic captured response without a terminal event. These records support the specific tracking failure; they do not justify ignoring unfinished current resources. Applied the diagnosing-bugs guidance as a review of this existing red-capable investigation, rather than restarting root-cause discovery.

The fix records request identity/status/type/main-frame navigation and retires only a successful HTTP 200 top-level numeric directory/index document with the matching origin and exact query. It runs only after the entire current URL equals the expected fixed Codex destination, including fragment. Request fragments are not sent over HTTP; validating the current URL separately is therefore appropriate. A current Codex document, iframe, image, script, different ID/query/origin, or non-200 response cannot match. Existing failed-request, HTTP-error, page-error, content and resource checks remain. The result reports the retired count.

`waitForURL` now explicitly waits for DOMContentLoaded, followed by the same resource-settling gate. This ensures the redirected destination's stalled PNG is diagnosed by the existing 10-second resource deadline, rather than blocked earlier by Playwright's default load wait. It does not skip resource verification.

## Test gap found and closed

The first PNG/404 controls failed on the initial direct Codex load, before `settleLocal(verifiedRedirect)` was reached. I requested redirect-only resources combined with the omitted-document-terminal-event fixture. The final tests add their PNG only when the redirect query is present and suppress only the numeric document's terminal events. The positive fixture also asserts exactly two retired documents, proving it exercised the intended branch.

Independently ran four final real-Chromium cases in **13.525 seconds**, all passing their intended outcomes:

- Both numeric redirect documents lack terminal events; exact route/query/fragment succeeds and retired count is two.
- The redirected current page's PNG receives HTTP 200 but never completes; the gate still fails with its image URL/type in the pending diagnostics.
- The redirected current page's PNG returns HTTP 404; the gate still fails with the HTTP error and asset URL.
- Ordinary numeric directory and explicit-index redirects pass with exact encoded query and fragment.

The prior 120-lesson diagnostic red and observed fixed full walk are archived with the independent focused log in `leetcode-static-versions-evidence-20261025/independent-review/redirect-followup/`. Also inspected `leetcode-static-browser-gate-evidence-20261025/deterministic-red.json`: the final omission fixture against original revision `104f82ca` produced one failure, zero harness errors, in 10.87 seconds with the expected unfinished-resource error. This is retained implementation-agent execution evidence, not a red run independently repeated by this reviewer.

The inspected initial fixed full-walk result passed 120 lessons in 9.937 seconds with zero retired documents; because the event omission is intermittent, that run alone does not exercise retirement. The deterministic fixture provides that coverage. I did not repeat the expensive full walk; the implementation agent is separately recording its final full-regression/full-walk results.

No debug tag remains in the final publisher source. Actual generated output and public URLs still require their normal full release verification; this review changes no lesson acceptance, source byte, published receipt or public-delivery claim.
