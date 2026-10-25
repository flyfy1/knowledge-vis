# Prepared 940/956 import, prospective policy adoption, and resume

**Preparation only; not dispatched.** No STOP was created, no Pi file was written, and no current agent was interrupted. The operator below requires independent review and a later explicit root dispatch after both lanes have independently accepted and exited. The final independently reviewed workflow-copy clarification is included in this pinned payload; any later changed source or allowlist requires a new explicit review before dispatch.

## Pinned scope

The [prepared operator](parallel-940956-import-policy-preparation-20261026/operate.py) reuses the existing importer and the prior finite import/resume sequence. It is fixed to source `3116c71722cf4db1e2c12a7453902a6fd748b314`, not the moving main branch. Its four policy-copy paths are:

| Path | Required SHA-256 |
| --- | --- |
| `specs/leetcode-explainers.md` | `7fe59194a1ab1eb838a865a6cefcfbd98d527fe7657d1614c959b73c86dc404e` |
| `scripts/campaign-prompts/author.md` | `5f7feaa56f9f8f1f3f434e1fe4576cc2a10da21594c9aef829cab86e69dae06b` |
| `specs/reviews/leetcode-baseline-syntax-spec-review-20261026.md` | `a8d04609ccb62cf79d947210156ac99c64f23e5ab3da717c5cdc513f3d7314b1` |
| `specs/reviews/leetcode-workflow-copy-spec-review-20261026.md` | `e1ead272a7b986d24117f00c750e65943cfe3b0b8b243ad9a5fe30e2c355da29` |

The existing explainer must still hash to `6d4cc609772cb6c6382148568107a0ffd8b6c40cbbf4af473f2519ab364a2945`. The old author prompt must hash to `036b88a5740ac4e81f357904e069e6daa782983f40c5d4db08e30599255ee6dd`. The source includes the independently reviewed baseline Python/accumulator clarification and prospective placement of transient workflow status in records rather than learner UI. No rubric, existing acceptance, or runtime lesson copy changes. Both review reports must be new paths centrally; existing reports are never overwritten.

The operator pins current importer, runner and external launcher hashes. It changes none of those files. The latest read-only census during preparation showed central 810 author, lane 940 review, and lane 956 author; this observation is not a claim that dispatch preconditions are satisfied.

## Guarded sequence

1. Require explicit dispatch token, a new owner-specific receipt, exact central branch, unchanged runtime/launcher, no existing STOP, and one real central runner. Validate both exited lanes under their checkout/state locks: accepted status, actual review/run evidence, reservation ownership, and unchanged old shared policy. Require fresh central thread/turn evidence and a real native Codex descendant before requesting its ordinary boundary. Fetch only the fixed source object; verify all four payload hashes without changing checked-out files.
2. Create an exclusively owned STOP and wait in five-second increments for the active central stage to finish. Never signal an agent. Require stopped state, no campaign workers, a clean saved head, and no pending release. A 6,000-second boundary limit preserves STOP with an inspectable failure; it does not interrupt the worker.
3. Hold the release lock and invoke the **unchanged** `import_leetcode_lane.import_lane` for 940 then 956. The importer owns both checkout/state lock pairs and validates original candidate fingerprints, actual sessions, review evidence, retained commit ancestry, registration and unchanged unrelated content. Both imports must complete while the old explainer and author-prompt hashes are still present. Update only the corresponding reservation import fields.
4. Acquire central checkout/state locks while retaining the release lock. Verify prior problems, runs, queue, ordinary metadata and import history remain intact, and the release ledger is byte-identical. Plan the ordinary runner's register-only prefix before its next actual agent. Count those pending registrations as well as accepted/unreleased lessons and incoming lanes. Check this projected count before STOP, again at the stopped boundary before import, after imports, and before resume; require it below 20. If the queue changed before stopping and now reaches the threshold, retain a stopped inspectable transaction for the normal release path rather than mixing publication into this operation.
5. Copy exactly the four approved blobs. Check worktree and index allowlists before committing, respect normal Git hooks, and verify exact changed paths, modes, bytes and single-parent ancestry after commit. A hook that changes another file is detected before updating the saved checkpoint. Comparing the whole Git tree protects all lesson trees, registry, concept map, runtime and existing reviews. The author prompt is the one explicit prompt exception; reviewer prompts remain unchanged. Only `progress.expected_head` changes for this policy adoption; even the preexisting `updated_at` value is retained. The ledger remains byte-identical.
6. Push the exact central branch head and confirm it with `ls-remote`. Release maintenance locks, recheck owned STOP, immutable launcher and clean saved checkpoint, remove only that STOP, and call the existing launcher with `--continuous --max-rounds 6`. Live arguments must retain `--publish-every 20`.
7. Require a newly created run ID for the predicted next actual agent, a new thread ID absent from all retained sessions, both thread/turn events, and a real native Codex descendant of the newly launched runner. The unmodified runner may first register one or more already reviewed entries without an agent. Validate each such single-parent commit against the deterministic registration path allowlist, exact provenance trailers, prior registry rows, and exact per-entry status/phase/registration-time changes. Retain candidate/review/run history. Require the fresh agent candidate to equal the proven end of that policy-plus-registration chain; no arbitrary successor HEAD is allowed. At an author-to-review boundary, allow only the ordinary runner's current candidate refresh before the fresh reviewer starts. A persisted old current-stage label cannot pass. Confirm exactly one central campaign, preserved imported acceptance/queue/ledger and absent STOP, then record successful resume. Record policy push and ordinary post-resume registration head separately; a new normal registration commit is not falsely described as already pushed.

The fixed owner is `campaign-runner-import940956-policy-20261026-2fb1c8d0`; the planned external receipt is `/home/songyy/projects/leetcode-hard-campaign-state-20261018/campaign-runner-import940956-policy-20261026-2fb1c8d0.json`. The explicit dispatch token is `root-reviewed-import940956-policy-20261026`. These identify this reviewed operation, not authorization to execute it now.

Lanes remain `/home/songyy/projects/leetcode-hard-lane-{940,956}-20261026` with states `/home/songyy/projects/leetcode-hard-lane-state-{940,956}-20261026`. Their historical candidates, runs, evidence and original repositories are retained. No new worker is launched during preparation.

## Failure and validation

A failed guard stops the transaction; no reset, rollback, forced retry, policy default change or acceptance rewrite is performed. Existing receipts are never reused. Failure after creating STOP preserves it; failure after launching restores the same owned STOP if absent so the new worker can finish its current stage normally. Foreign STOP content is not replaced. The receipt records the error and the need to inspect saved/actual head, importer receipts and STOP ownership before any manual continuation. A commit/push/checkpoint mismatch is intentionally left visible.

[Eleven base local tests](parallel-940956-import-policy-preparation-20261026/test_operate.py) pass. Temporary real Git repositories exercise successful four-file adoption, exact expected-head-only metadata changes, dirty checkout rejection, STOP ownership rejection, and a real pre-commit hook that stages an unrelated file: the resulting unexpected commit is detected and the saved checkpoint remains unchanged. Pure guards reject wrong payload hashes, extra paths, overwritten reviews, mode drift, ordinary metadata/history changes, stale run IDs, reused sessions, missing turn events and missing native descendants. No test contacts Pi, runs agents or dispatches maintenance.

[Validation hashes](parallel-940956-import-policy-preparation-20261026/validation.json) and [test output](parallel-940956-import-policy-preparation-20261026/tests.log) identify the prepared version. The initial temporary-repository fixture used macOS's `/var` alias and was rejected by the importer's canonical-root guard; resolving the fixture path fixed the tests without relaxing that guard. This is guard validation, not an end-to-end remote import or resume claim.

The initial independent operator review rejected the original version for phase-blind registration handling. The [diagnosis log](parallel-940956-import-policy-preparation-20261026/register-boundary-diagnosis/task-log.md), frozen original source, deterministic real-runner reproduction and red tests retain that failure. Six focused register-boundary regressions now cover the real registration commit, correct next-agent selection, 19-to-20 rejection, incoming-lane accounting, candidate/review preservation, and rejection of unrelated successor commits. This is explicit support for normal runner registration, not an operator-written acceptance or bypass of runner semantics.

Independent rereview of the revised frozen operator remains required before any remote dispatch.

## Dispatcher adjudication

The independent follow-up in
[the operator review](parallel-940956-import-policy-review-20261026.md) closes
the two registration-boundary findings for operator SHA-256
`5cb088c8291af1b7efd8d84838b50d32c1f92de7c43f3007a184da057776f35d`.
Adopt this corrected version only. The confirmed cause was treating deterministic
registration as an agent stage and omitting it from the publication projection.
The unchanged runner remains responsible for that registration; the operator
now verifies its exact state/commit chain and the subsequent fresh agent.

Root authorizes dispatch of these exact reviewed bytes with the fixed policy
source and four-file allowlist above, subject to all live preconditions. This
record is authorization, not evidence that remote dispatch, import, adoption,
push, or resume has occurred. Actual execution receipts must be inspected and
archived separately before claiming those outcomes. No additional payload path,
changed source revision, guard waiver or automatic retry is authorized.
