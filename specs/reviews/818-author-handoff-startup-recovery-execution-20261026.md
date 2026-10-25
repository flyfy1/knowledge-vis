# 818 author startup recovery execution — 2026-10-26

The single authorized recovery completed at **2026-10-25 19:54:36 UTC** with `waiting-for-Mac`. It resumed the already imported/reopened #818 only, froze and pushed its new author candidate, and retained the recovery-owned STOP before any new independent review. This is an author handoff, not review acceptance or resource-measurement approval.

## Exact dispatch and observed stages

Root authorized the reviewed payload committed in `266e153c`: recovery SHA `1745fe1d3425a21f0a72b3f5a8dbc9d21a7dec827ed80acb523dbb0d180aa0bd`, pins SHA `70db45a389f137b558aa7d368bedc71866fc4016c6e3c6b347a61ef0031dbaa7`, observer SHA `3b884fbc94e584a3894374a4156895e44f7aa53a616afc757f955c32664680e5`. Committed bytes and the exclusive external Pi copies were hash-verified. Token: `root-reviewed-818-search-author-startup-recovery-20261026`.

- Recovery PID `1586319` launched once at 19:44:24 UTC, using the frozen original Stage A helper and pins without repeating imports, request adoption, or reopening.
- Ordinary runner PID `1586631` started fresh fix `818-fix-4a6861765951` at 19:44:35.528541 UTC. Session `01a17497-ebf5-7bf1-82fe-3c78f9d11828`, thread/turn events and native PID `1586901` provided actual startup evidence. Continuous queue984, every20, max6 were preserved.
- Recovery STOP was written at 19:44:35.638376 UTC during this fix; live native proof then established `author-running-stop-armed`. This is observed success, not a claim that polling prevents every possible race.
- Author returned `ready`; its final message explicitly retained dispatcher Mac measurements and independent review as pending. The ordinary runner stopped naturally. The recovery verified the exact author state/commit delta, zero new review runs, unchanged ledger/policy, clean checkout, then pushed the exact candidate.

## Frozen handoff

| Field | Value |
| --- | --- |
| Candidate / saved / remote head | `9277b8fb633c26904b03231d1127ed816baad6c4` |
| Lesson tree | `1c14e1c5ebe8dab5602e7cd9a2c1ec9f3b16221a` |
| Canonical path | `leetcode/818/solution.py` |
| Canonical SHA256 / bytes | `da9a9a40d5d90c856d82b984333419be4246821b037108faeee0eddae0ab6d68` / 1426 |
| Frozen state SHA256 | `e3ddb30dac89238c0495766e7f195636c529ad463f138fb7b792ad8caf7bef69` |
| Successful receipt SHA256 | `15fe60191bada03236ebbaa1fd56705d670447ccdfb21615782ae8551f553949` |
| Retained STOP SHA256 | `3f6953af77d712e814a5c3f2e49b1b1d478f7fce7f7981eff3bcf84ff6d4983b` |

Remote owner: `818-search-author-startup-recovery-20261026-32c8d741`. Receipt and `-waiting-for-mac-state.json` backup are under `/home/songyy/projects/leetcode-hard-campaign-state-20261018/`. STOP owner is `818-search-author-startup-recovery-20261026-32c8d741-author-to-mac`; its exact bytes are archived in `STOP-frozen.json`.

At 19:55:36 UTC, the worktree was clean, local/saved/remote heads matched, both original failed operation PIDs and all three recovery PIDs were absent, no campaign process remained, and runner/release/checkout locks were free. Persisted status is `stopped`; `current` retains the completed fix identity as normal runner history. The #818 entry is `review_pending`, phase `review`, round1. This persisted current field does not indicate a live worker.

## Preservation and next boundary

The full984 queue, all423 previous runs, all other problem entries, #818's existing review and maintenance history are unchanged. Exactly one new run was appended. Original accepted95 evidence and the earlier blocked fix remain historical. The only #818 review run remains `818-review-23290c1abcd2`; no new reviewer has started. Counts are130 accepted_local,39 blocked,119 released; pending release remains null. The conservative prelaunch digest upper bound was13. No publication occurred.

Release ledger SHA remains `1b05df6e7c7249e29adfb20b0b712865ff6fea54aeef042d04bf33857738b89b`. Original failed Stage A receipt remains byte-identical at SHA `723aa5cf0ddc654e05eeb091ee499f2423cffdbcdd2bf2e1893ce80466e618ad`. All prior policy and launcher hashes match; `policy-hashes.json` also captures the frozen committed registration helper SHA `7ba274cd733a36528d98c85fe87b46d5535bc34898567b0c14f36fda37f81310`.

Keep the owned STOP. Root must inspect and measure this exact immutable canonical source on Mac, then prepare the predetermined `specs/reviews/818-review-search-resource-measurement-20261026.md`. Only a separately reviewed, authorized Stage B may adopt bound evidence and resume the fresh independent review. A changed source hash and author's successful checks do not establish algorithmic improvement, full-range resource feasibility, or acceptance.

Evidence is in the matching execution directory: exact receipt/state/STOP/ledger, preflight/transfer/dispatch records, terminal process and lock observation, preservation comparison, author final/event summary, operator log and policy hashes. The complete remote events JSONL remains in the run directory; the compact local summary records its SHA and identity/completion events.
