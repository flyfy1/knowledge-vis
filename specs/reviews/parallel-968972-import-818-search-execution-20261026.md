# Stage A execution: durable imports and reopening, preserved startup failure

**The operation failed before the new #818 author started.** Both accepted lanes were successfully imported, the two fixed search documents were adopted, #818 was ordinarily reopened with its history preserved, and the exact resulting commit was pushed. Stage A did not reach waiting-for-Mac. No new author candidate, reviewer, acceptance, measurement or publication is claimed.

## Completed durable work

Root authorized exact operator `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698` and pins `d56628ded5a693e10762ef8e99595eff5bcbf04832bea6094aa94622c1db1540`, committed in main556280c2 after independent review. Remote bytes matched the committed source. The operator was invoked once at2026-10-25 19:19:06 UTC as PID1523670.

#834 author completed naturally at candidate `66fd2c7555f4f076966283cbf3dae45a45ce245a`, with its ordinary review still pending. The operation then produced:

| Step | Exact commit |
| --- | --- |
| Import #968, accepted95 and968-R1 closed | `179bfddae90219742873d520cf151e6aa54e6a49` |
| Import #972, accepted95 | `48b53c8e7786af264ee196a6bcf91de2f1e706fe` |
| Adopt two request/design documents and checkpoint818 reopening | `f3347117f4e4370e8d83c77a1cf9e9f14ccae554` |

The last commit is both saved/actual HEAD and the verified `origin/codex/all-hard-20261018` head. Its source is final `a1d48550f44a65bc936de1706642a1b9ad858afd`, with only the two approved numeric-review documents. No unrelated main policy or catalog changes were adopted.

#818 is now changes_required/fix with the818-SEARCH-R1 request. Candidate33686548, original95/100 review, prior author/fix runs and round1 budget remain intact. The blocked detail and complete old entry are archived in maintenance plus the [pre-reopen backup](parallel-968972-import-818-search-execution-20261026/before-reopen.json). All other problem entries and the984 queue are unchanged. Both imported acceptance entries exactly match their frozen lane pins. Release ledger SHA256 remains `1b05df6e7c7249e29adfb20b0b712865ff6fea54aeef042d04bf33857738b89b`; no pending release exists. The guarded publication upper bound was13.

## Failure and actual stopped state

The launcher returned PID1582005. On the first observation, original `fresh_fix_record` required persisted status running and raised **Runner not active while arming author handoff** while the saved state was still stopped/currentnull. The failure path restored the original owned STOP. Exact traceback is retained in [operator-output.log](parallel-968972-import-818-search-execution-20261026/operator-output.log); the historical [receipt](parallel-968972-import-818-search-execution-20261026/receipt-failed.json) remains failed-inspect-no-retry and was not rewritten.

Recorded filesystem ordering supports the early-observation explanation:

| Artifact | Last write UTC |
| --- | --- |
| New runner.pid | 19:33:32.325282 |
| Restored owned STOP | 19:33:32.401285 |
| Failure receipt | 19:33:32.402285 |
| Final stopped progress | 19:33:32.644297 |
| Normal stopped runner log | 19:33:33.068317 |

The final runner log reports stopped/130accepted/39blocked, without a startup traceback. At19:35 UTC all423 run records were exactly identical to the pre-reopen backup: **zero new author or reviewer runs**. Operator1523670, attempted runner1582005 and former runner1481177 were absent. No campaign/native worker remained; state, checkout and release locks were acquired nonblocking and immediately released as a read-only ownership check. Worktree was clean. This is consistent with a premature observer refusal followed by normal STOP handling, rather than a blocked lock or failed agent. The separate diagnosis/regression work preserves the exact rejected startup snapshot before proposing recovery.

## Preserved ownership and recovery boundary

Current state SHA256: `5c21d881696fd532ebee3f0966bf4d978554aac5d0d1cd595ff8ee23d0fd4bd7`.

STOP SHA256: `0d004ea04e2c96b5202d1b132fa038faa85eb9c062d21a5dc52140883c1c4000`.

STOP owner: `import968972-search818-stage-a-20261026-4b7e902d` (the original transaction owner, not an armed author-to-Mac STOP). Remote receipt: `/home/songyy/projects/leetcode-hard-campaign-state-20261018/import968972-search818-stage-a-20261026-4b7e902d.json`.

The queue is intentionally stopped and requires separately reviewed recovery of **only the remaining launch/arm/freeze steps**. Do not repeat imports, request adoption or reopening; do not clear STOP or relaunch from this report. No blind retry, active interruption or state mutation occurred after failure. A future successful recovery must still prove a fresh818 fix, arm its owned STOP during that stage, and finish with a ready immutable candidate and zero new reviewers before Mac measurements.

[Evidence directory](parallel-968972-import-818-search-execution-20261026/README.md) retains exact receipts, logs, process/lock observations, timestamps, state/STOP bytes, importer receipts, reservations, transfer/dispatch records and preservation validation. This archive documents partial durable progress and the preserved failure; it is not a successful Stage A completion.
