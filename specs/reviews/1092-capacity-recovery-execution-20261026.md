# #1092: one ordinary recovery after provider capacity failure

Confirmed cause: the original reviewer returned **“Selected model is at capacity. Please try a different model.”** Its terminal `error` / `turn.failed` events, missing final.json, partial cold walkthrough and failed run are preserved. No lesson defect or rejection was inferred.

Following root authorization, a single recovery ran at 2026-10-26 14:08:06 UTC under the existing state, checkout and release locks. It revalidated frozen state/ledger/policy/HEAD and absent workers/STOP, copied immutable before-state and original failed-run evidence into exclusive external directory `/home/songyy/projects/leetcode-hard-campaign-state-20261018/1092-capacity-recovery-20261026-1409/`, then **moved only the three exact untracked partial-review files** into its `partial-review/` tree with matching SHA-256 hashes. The original failed-run directory was untouched. Clean checkout, same candidate and byte-identical state/ledger were verified before launch.

The unchanged `launch.py --continuous --max-rounds 6` was invoked exactly once. It returned runner **2448642**. At 14:09:25 UTC, the observed state was:

- New review `1092-review-3b54521cfb62`, started 14:08:25.524831 UTC, candidate `5cf73ee858d9a8938b55206c867233a8397d60f6`.
- Fresh `thread.started` identity `01a1788a-8463-7d70-a532-ac3b4c6cf94c` and `turn.started`; native **2449056**, parent node **2449049**, beneath runner2448642. Cwd/output bind the intended checkout and new run.
- Full984 queue, gpt-6.1-sol, medium reasoning, max-rounds6, publication every20, preview18770 unchanged. No STOP.
- All old run records are an exact prefix, every problem entry and queue are unchanged, ledger bytes unchanged, original failed-run and quarantined partial bytes match their pre-dispatch hashes. #1092 still has no completed review and rounds0.

The red-capable health predicate (saved status running and the current runner PID exists) was red before recovery and green afterward. Root independently observed the same green predicate. **This is fresh runtime/session proof only**: at the recorded verification there were two lifecycle events, not a completed reviewer response. It does not prove lasting service capacity, acceptance, or publication. A new capacity failure must be preserved and reported, not automatically retried.

Startup eligibility was19 digest-qualified accepted lessons, ledger158 released/pendingnull. The ordinary runner can publish the next20 only after genuine later acceptance/registration; this operation neither forced publication nor changed production. The separately deployed #42 wall-lab and unrelated work were not modified. No commit or push was performed by this operator.

The companion audit directory contains the original read-only diagnosis, ranked hypotheses, red observation, pinned capture, preserved exact bytes, one-shot recovery source, dispatch stdout/stderr, final receipt and compressed post-launch progress. Its README is explicitly the earlier audit/proposal snapshot; this document records the subsequent authorized execution. The first audit's missing-Node-PATH stderr is retained separately from the actual provider failure.
