# Independent structural review: #843 budget-repair handoff

Date: 2026-10-26. **Structural approval for the disabled template; no required findings.** Reviewed operator SHA-256: `958ef5aa858a3ad8f88820a011ef442c1100a4fe2e2dec9af37f3a0455eaf1df`. `PINS_SHA=None`, request source/documents, prior-operation receipt hash and accepted #843 pins are still pending in this reviewed preparation. This is not approval of an enabled operator or permission to execute it.

## Scope and preservation

Read the actual operator, README, pending pins and tests, plus the reused campaign helpers (`f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`) and reopening helper (`a268466fe6101841437c730e0e7448961be4637ee60d9fe4a760c0ea6fca3424`). Traced the runner's fix/STOP/publication behavior and existing importer ownership/checkout API. Only helper functions are reused; neither earlier operator execute routine is invoked.

- Preconditions bind the previous #975/#980 receipt to its exact bytes, completed-resumed owner/status, new `816990…` policy and preserved ledger; its policy HEAD must be an ancestor. Hash checks cover runtime, prompts, importer and transitive static-version module **before runtime Python imports**. No policy replacement or lane import occurs in this operator.
- The reused accepted-entry guard checks the exact ordered 984 queue, complete accepted/done #843 entry and canonical hash, retained rounds/reviews budget, historical runs, lesson Git tree, runtime hashes and old report. It runs initially, after fetch, immediately before STOP and again at the stopped seam. Another lane reservation/process blocks the handoff. Existing STOP is never replaced; owned STOP allows the central stage to end naturally, with no agent signal.
- Adoption is restricted to the pinned request and pinned evidence-prefix files. Paths must be normalized, nonescaping and absent; their contents are hash-checked. The commit must have exactly the old parent, exact added paths, regular 0644 target files and exact committed bytes. The hook-negative test verifies that a runtime change fails before reopening. The stopped checkpoint and release ledger must remain unchanged until the deterministic transition.
- The full old accepted #843 entry and previous current pointer are retained in a new maintenance record. Only #843 changes to changes_required/fix with the new request as prior_report; candidate, reviews, author runs and rounds remain intact. accepted_at/registration_commit are removed from the active repair entry but preserved in that full historical record. Existing maintenance, other entries, runs and queue remain unchanged. This requests normal repair/review; it does not rewrite the old 97.5 acceptance or pretend the new finding is closed.
- The publisher selects accepted_local entries, so reopened #843 is excluded from release eligibility until ordinary fresh acceptance. The conservative bound still includes #843, rejects pending releases/same-digest refresh, and must stay below 20. STOP suppresses normal publication while the stage finishes. The bound is rechecked before reopening and resume; no threshold waiver, remainder flush or alternative publication path exists.
- Exact adoption HEAD is pushed and remotely compared before owned STOP removal. Ordinary continuous/max6/every20/full984 launch must yield #843 fix first, without a registration prefix. Startup accepts only the identical stopped snapshot while the launched PID is alive, then requires fresh run/thread/turn/native-descendant evidence, flags and historical state preservation. Starting that fix is neither acceptance nor publication.

## Independent validation

Ran the inspected disposable suite: **nine tests passed in 0.516s**, [log](843-budget-repair-review-evidence-20261026/tests.log). Test-file SHA-256: `d7ba87afa7ac35ce943093dcfea6be716fc887e20c7f42559a38991b79473e19`. Cases cover disabled entry, exact one-ID history/budget preservation and next-fix selection, unaccepted/exhausted refusal, wrong previous operation/policy, payload escapes/hash/scope, exact stopped/live/fix startup, pending/20-bound refusal, real disposable Git adoption preserving lesson bytes, and out-of-scope commit-hook rejection before state change. No real agents, remote calls or live operator were used in this suite.

The semantic repair request is independently adjudicated in [843-budget-finding-review-20261026.md](843-budget-finding-review-20261026.md). This handoff must adopt the final reviewed request/evidence unchanged; it cannot substitute a blind cap increase or alter the official judge interface.

## Final-freeze and operational limits

Still required: the actual completed previous receipt, accepted #843 identities, exact regular-file request/evidence source, fresh queue/ledger/runner/other-lane observations, enabled operator/pin hashes and a separate final exact review. A changing source revision or unexpected existing adoption path must refuse rather than overwrite. The operator's guards must execute afresh; this report is not live-boundary proof.

Failures retain actual files/commit/state/maintenance and the owned STOP for inspection, rather than rolling back or retrying. A commit before checkpoint may leave HEAD/state mismatched; a state write before push may leave a stopped local repair; both are inspectable and require explicit reconciliation. After launch, caught failures restore missing STOP without replacing a foreign STOP and do not signal the active agent. Abrupt host/process loss around STOP removal and launch is not atomic: inspect actual worker, receipt and state before recovery, never start a duplicate. No generalized recovery machinery is requested.

No operator execution, STOP, Pi write, active lesson/policy edit, commit or push was performed by this review. Historical review results and release receipts are untouched.

## Final exact freeze review

**Approved for the bounded handoff, subject to all fresh operator guards; no required findings.** Final operator SHA-256: `149c7da2b4e811161977c23dbfe391020ba36c7c59934d70d0254e025b44c8dc`; final pins SHA-256: `1ddd6bf0460798971b109465d8fe8ee95644479fe003fcd5ccd50d7fc18670e4`. Reconstructing the disabled PINS_SHA line/comment reproduces reviewed `958ef5aa…` exactly. The only test change injects None for the disabled-entry test; reversing it reproduces the independently tested `d7ba87af…` file. Final test SHA is `32967b7b6f3d5a0aa89c305afccf06b9bd8c5ee7cf480a3badb115a23fe906d9`; the author retained all nine passing cases. No redundant executable run was needed for this identity-only change.

Independently verified all 25 payload files against regular 100644 Git blobs at `2bc56ba008ac7460ebecf71580d1b1c03fdfde0e`, all manifest references against that same revision, and all eleven validation-file hashes. The request is `050d12752d3ab807ae9c14816b80a7a6cdfc9718031beb92019e99f93f198cc5`; manifest is `1edb860ee7a981d2198e5bc2cb8c03ab54baf008e5b14a6df057d03136fa550a`. A read-only remote-head lookup returned main `341d38f4d8dc0ca23fdd0782be0bc64bd9306af0`, and local ancestry verification confirms the pinned source is included. Captured runtime identities equal final pins; source status/documents are the expected subsequent freeze.

A separate read-only Pi check confirmed the complete accepted #843 entry hash `8f20ed6a4f75b5ae433caa79604eaa5191f8265269a68aaba90cd64768e05596`, retained run-history hash `5bc60f7f009d6e181e91d39603f0879a57d19d30d346161432c6a317e6643051`, original 97.5 acceptance in round 1, candidate `617cb7c7e49f533b46c66dc9a53e7c6cefd71cbf`, lesson tree `7544d86e2d527e633b0a8c2ee81783d8712b47cf`, and original report hash `909b409ecfceeef96c8d6c2ddbe75a5bad0b9c1a54fa81f7c96f8be7e93c6847`. Every pinned #843 file, policy/runtime file and launcher hash matched actual read-only filesystem bytes. The 984-item queue hash remains `434e5df4289eb8084c994f7a9bfe9920331ebcd4675beb7d2d511c1749d1fb7a`.

The previous operation receipt independently matches `dc58971f40c669883d6845e709c99ee50d269ad77f23dbe3d997dc0815b7215d`, completed-resumed with policy `816990…`, preserved ledger, and policy HEAD `4ba7fa4678b8ad916bfafa7a93edbebb1e2f2f10`. Actual ledger bytes still match captured `1b05df6e7c7249e29adfb20b0b712865ff6fea54aeef042d04bf33857738b89b`. The capture's conservative publication bound is 18 including #843; it is an observation, not a permanent authorization. The independent recheck still saw #847 review running. Natural-stop, ownership, absence of lanes, eligible-count and all preservation guards must therefore run again at execution; this review neither asserts a stopped boundary nor permits a threshold waiver. No operator, STOP, state transition, source mutation or publication was executed during review.

## Root disposition

Root read the full adapter and final pin-only diff, confirmed the required finding
against actual frozen canonical behavior and the independently adjudicated request,
and independently ran all nine final preparation tests successfully (0.467s).
The exact final operator and pins above are approved for one separately dispatched
execution after fresh guards. Preserve the prior acceptance, six-round budget and
all failed/diagnostic evidence. Reopening excludes #843 from publication until its
ordinary repair and fresh independent review complete; starting a fix is not closure.
Do not modify the completed #975/#980 operation or adopt additional policy here.
Retain owned STOP and actual partial receipts on failure without blind retry.
