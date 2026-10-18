# Independent review: importing completed LeetCode lanes

Date: 2026-10-18 (Asia/Singapore)
Reviewer: `/root/lane_import_review`, separate from implementation agent `/root/lane_importer`.
Scope: `scripts/import_leetcode_lane.py` and its interface tests. This is an integration-code review, not a lesson acceptance or deployment receipt.
Outcome: accepted for the documented controlled import interface; zero open required findings.

## Reviewed source identity

| File | SHA-256 |
| --- | --- |
| `scripts/import_leetcode_lane.py` | `0f80ddd87262b0de9fff8885078248062f29aa49df25b04fa78819e01798ae1c` |
| `scripts/test_import_leetcode_lane.py` | `e0b737123295009bec2b3cc460624b5c04f91eb821c7cfc1614fe32fe2f3401b` |

The reviewer read the existing campaign, registration, publication, and frozen review-gate interfaces before examining the importer. Tests crossed the public `import_lane(...)` interface with real disposable Git repositories and worktrees. No production checkout, Pi worker, or publication ledger was changed during this review.

## Required findings and closure

### LANE-IMPORT-R1: a review commit could mutate its candidate

Initial code required the candidate to be an ancestor of the review commit and compared final lesson bytes, but did not prove that the review commit itself preserved the candidate. A review could mutate a lesson and restore it later while satisfying final parity.

Fix: require each review commit to have exactly its recorded candidate as its single parent; constrain its complete diff to that review's report and evidence directory; reconstruct the original runner fingerprint; preserve all historical reports/evidence. Also compare every lane commit's scope and the final imported tree, including modes.

Closure: independently constructed a review commit that changed `app.js`, followed by restoration before lane registration. Import now rejects it before any central Git/state mutation. A forged original fingerprint is separately rejected. Closed.

### LANE-IMPORT-R2: relative Git merge-state paths used the caller's directory

The original unfinished-merge check applied `Path(...).is_file()` to `git --git-path MERGE_HEAD` without resolving relative paths against the selected checkout. Invocation from another directory could miss a clean unfinished merge.

Fix: resolve relative Git paths against the selected repository, matching lock-path handling.

Closure: created a clean `git merge -s ours --no-ff --no-commit` in the fixture central checkout while invoking the importer from the real workspace. It rejects the unfinished merge before creating an import receipt. Closed.

### LANE-IMPORT-R3: Git rename detection hid a source deletion in a review

This issue was reproduced after the initial fixes. With `diff.renames=true`, a review commit renamed `leetcode/68/BRIEF.md` into its allowed report path and a later commit restored `BRIEF.md`. Git's default `--name-only` diff reported only the rename destination. The importer incorrectly accepted this lane despite the review deleting frozen source.

Observed red result: the independent `test_review_cannot_hide_source_deletion_as_rename` expected rejection but failed because no exception was raised; an actual import completed in its disposable fixture.

Fix: use `--no-renames` for all three historical diff checks: the overall lane delta, every lane commit, and each review commit. Both source deletion and destination creation are therefore visible to the scope checks.

Closure: reran the exact independent failing fixture after the fix; it now rejects with `Review commit mutated frozen candidate`. The implementation suite now includes a persistent regression with the same rename configuration and source-restore sequence. Closed.

## Independently observed validation

- `python3 -m unittest discover -s scripts -p test_import_leetcode_lane.py -v`: 20 tests passed. Coverage includes registry and unrelated lesson preservation, release-ledger preservation, lane ancestry, copied raw agent evidence, acceptance through the existing publisher gate, dirty checkouts, active locks, missing STOP, missing/incomplete runs, changed runtime/rubric, reused or forged sessions, changed candidates, failing dimensions, historical scope, and failed registration.
- Eight additional reviewer-authored adversarial probes passed through the same public interface: false fingerprint; source mutation then restoration during review; historical evidence rewrite; open required finding; relabelled agent final output; clean unfinished merge; failure writing the final central state; and the rename bypass above.
- The final-state-write failure probe confirmed that the original `progress.json` remains byte-for-byte unchanged, the completed merge and copied raw evidence remain available, and a prepared receipt records the actual merged HEAD. It does not silently reset, relabel acceptance, or resume processing.
- The success fixture verified unchanged existing registry rows and lesson bytes, unchanged central queue/status and publication ledger, unchanged lane state, preserved review-candidate ancestry, and a clean resulting central checkout.

The additional probes were executed from a temporary reviewer script; the required rename regression is retained in the tracked implementation test suite. Test fixtures use synthetic lessons and synthetic agent event files to exercise validation failures. They do not establish any real lesson's pedagogical quality or authenticate an external model provider.

## Interface and operational limits

The module provides one import interface that owns validation, locks, Git ancestry, registration, evidence copying, and the atomic central state update. Its depth is useful because callers do not need to recreate those checks. It imports only a completed single-ID lane in the same Git object store, while both checkouts and state directories are unowned by running agents and the central runner has observed STOP. It never sends stop signals, starts workers, changes production files, or publishes a batch.

Shared teaching policy, runtime, frozen rubric, and collection content must remain identical to the lane's reviewed environment. Only existing numeric lesson/evidence paths and explicitly specified registration/importer paths are treated specially; do not broaden this to all review documents, because frozen rubrics can live there. A new central policy commit can legitimately make an old lane incompatible. The planned operation is to run the reviewed importer externally against matching, unchanged policy before integrating later policy updates, rather than bypassing this check.

The Git merge and the external JSON state cannot form one filesystem transaction. An interruption after the merge retains inspectable files and a prepared receipt; recovery requires checking the exact receipt, Git HEAD, and state. The importer deliberately does not reset or automatically retry partial imports. A central accepted entry is written only after the merged candidate passes validation; original candidate, reports, runs, sessions, and scores are preserved.

The existing central publication module remains responsible for the threshold and release ledger. A lane import adds one genuinely accepted entry to that central state; the importer neither claims a release nor increments an independent release counter. Actual Pi import and resumed-run verification remain dispatcher responsibilities and are not claimed by this report.
