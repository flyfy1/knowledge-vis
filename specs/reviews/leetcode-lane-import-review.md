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

## Follow-up: LANE-IMPORT-R4, real Pi permission fingerprints

The first real #68 import stopped before mutation with `Frozen candidate fingerprint mismatch`. This contradicted the original synthetic-fixture coverage above; the original review is retained as history rather than rewritten as if the issue had already been tested.

The debugging skill was read for this follow-up. The existing Pi invocation established the red loop, followed by an automated public-interface regression. Ranked, falsifiable hypotheses were recorded before diagnosis: (1) actual filesystem permissions differ from Git's normalized modes; (2) the historical freeze included a different file set; (3) report/evidence exclusions differ.

### Independently observed diagnosis

Read-only inspection used `/home/songyy/projects/leetcode-hard-parallel-20261018/lesson-68` and its sibling `state-68/progress.json`. Candidate: `9cb2e5e32c75cde4be6eec1ee9e4f6a65e144c76`. Every one of its 524 candidate files had Git mode `100644` but actual filesystem mode `0o100664`.

| Reconstruction | SHA-256 |
| --- | --- |
| Original stored review fingerprint | `8352768ef440414458e3ca66e15406b9d9a07f54a5d5f32dd94a4ede74e2ea6b` |
| Original importer: committed bytes plus normalized Git mode | `7a989fbad08b605b55bb5d63b91e1bd141ccee8d4e05364a8413306762c2ca29` |
| Same committed bytes and paths plus actual lane `st_mode` | `8352768ef440414458e3ca66e15406b9d9a07f54a5d5f32dd94a4ede74e2ea6b` |

The last reconstruction exactly matched the original stored fingerprint, without changing its value or the candidate, report, scores, or state. This confirms the permission-mode hypothesis and falsifies the file-set/exclusion alternatives for this observed failure. The campaign fingerprint includes the full `stat` permission mode; Git preserves only executable versus nonexecutable normalization.

The reviewer independently ran `PYTHONPATH=scripts python3 -m unittest test_import_leetcode_lane.LaneImportTests.test_group_writable_runner_fingerprint_imports_unchanged -v` before the fix. It failed with the exact fingerprint error in 1.372 seconds. The fixture obtains its original hash from the real runner's `fingerprint` function after creating 0664 files, rather than forecasting the importer's output.

### Fix and closure

The importer now reconstructs a historical fingerprint from immutable candidate Git blobs and preserved permission modes in the lane checkout. It verifies regular-file type and executable consistency with Git. It still requires exact equality with the original stored review hash. It does not normalize away permissions, generate a replacement approval hash, or infer acceptance from a successful import attempt.

The fixed helper itself was extracted from the reviewed source and executed read-only on the real Pi #68 candidate. Result: `exact_match: true`, with the original hash above and `state_unchanged: true`. No helper file, state file, or checkout was written on Pi by this reviewer.

Independent validation after the fix:

- All 24 tracked importer interface tests passed in 28.174 seconds, including the existing candidate-freeze, rename, session, registry, lock, and failure-retention checks.
- Three additional reviewer-authored interface probes passed in 5.624 seconds: a mixed 0664/0600 candidate with a 0775 executable imported while preserving the exact original hash; post-review permission drift rejected without updating acceptance; and executable inconsistency rejected even when Git's `core.filemode` setting hid it from the ordinary dirty-tree check.
- The persistent suite also verifies rejection when a manipulated recorded hash matches current executable permissions but contradicts Git's executable mode.

Updated reviewed identities:

| File | SHA-256 |
| --- | --- |
| `scripts/import_leetcode_lane.py` | `8642a573383d052ce6e227bd8c2374f9c50f2fc1e8e9b312a6186607015344e0` |
| `scripts/test_import_leetcode_lane.py` | `4f2fb4ca2142343f3c322bed5583486f13f7f4ed8a781f6d9f2d2a71f69ef313` |

LANE-IMPORT-R4 is closed for these identities. Zero open required findings. Historical paths whose permission evidence no longer exists, or whose modes changed, fail explicitly; the importer must not invent missing historical evidence. Actual import and resumed-worker verification remain dispatcher actions, not claims made by this read-only follow-up.
