# R1 fix and author self-check

Scope: isolated tooling worktree only, starting at immutable candidate `b713024f7081a96e2b400eb569d7fa18f5c5d49a`. The original independent review is copied verbatim alongside this report. R1 remains open pending separate independent re-review. This is an author self-check, not lesson acceptance.

## Predictions recorded before regression execution

1. A complete unregistered lesson enters review directly and reaches `run_agent` before `validate_metadata`; a recorder that raises `reviewer-launched` will fire instead of the expected clear complexity metadata error.
2. A saved `new=true, phase=review` entry has the same gap. Early rejection must preserve existing author/review provenance and create no reviewer run record.
3. A registered historical `new=false` lesson without `lesson-entry.json` must retain review dispatch. A valid new lesson must also dispatch normally.

The regression will exercise the real `process_problem` transition through the public runner, replacing only agent execution with a recorder. Disposable Git fixtures and full non-Git filesystem snapshots will verify rejection does not write registry, concepts, index, lesson sources, metadata, or any other fixture path. Diagnostics belong only under `/home/songyy/projects/leetcode-tooling-metadata-fix-state-115-r1` or disposable temporary fixtures.

## Confirmed cause and narrow change

Both review-entry paths used file existence to select or resume review without invoking readiness. Readiness after author/fix and after accepted review already called the shared validator. The omission allowed deterministic complexity rejection to occur only after potentially expensive review; this was not an acceptance bypass.

The production change is two lines at the common review transition: when `entry["new"]` is true, call existing nonmutating `required_files(..., new=True)` before report selection, fingerprinting, candidate assignment, or `run_agent`. This covers initial, resumed, and subsequent new-lesson review entry without duplicating validation. Historical `new=false` review dispatch retains its existing behavior. Post-author and acceptance checks, metadata/language contracts, prior provenance, and failure persistence are unchanged.

Four regressions use `campaign.main` → real `process_problem` in disposable Git fixtures, with only agent execution replaced by a recorder (and fingerprint wrapped to observe calls). Invalid direct and resumed entries must raise `CampaignError` containing `complexity.*nonempty string`, with zero agent calls and zero fingerprint calls. Full fixture path/content/mode snapshots excluding `.git` remain equal, covering registry, concepts, index, source, metadata, prior report and evidence. Git status remains clean. Persisted state has `status=failed` and the metadata error, no new runs or run directory, and phase remains review. The saved entry, including old candidate, rounds, author IDs, reviews and prior report, remains exactly equal; previous run records remain equal. Valid-new and historical controls deliberately stop at recorded reviewer dispatch. Existing integration tests additionally exercise successful review/registration using the fake CLI.

## Red and green commands and evidence

Evidence directory **S**: `/home/songyy/projects/leetcode-tooling-metadata-fix-state-115-r1`. Every test command below was run with:

```sh
export TMPDIR=/home/songyy/projects/leetcode-tooling-metadata-fix-state-115-r1/test-tmp
export PYTHONDONTWRITEBYTECODE=1
```

Before any production edit, with HEAD still `b713024f7081a96e2b400eb569d7fa18f5c5d49a`:

```sh
python3 -B -m unittest discover -s scripts -p test_leetcode_campaign.py -k reviewer_launch -v
python3 -B -m unittest discover -s scripts -p test_leetcode_campaign.py -k saved_new_review -v
python3 -B -m unittest discover -s scripts -p test_leetcode_campaign.py -k complete_valid_new -v
python3 -B -m unittest discover -s scripts -p test_leetcode_campaign.py -k registered_historical -v
```

Results, with actual subprocess exit codes captured in `S/red-results.json`: first two **exit 1**, each one test failing with `AssertionError: reviewer-launched` at the real review dispatch; positive controls **exit 0**, one test each. Logs: `red-direct-confirmed.log`, `red-saved-confirmed.log`, `baseline-valid-control.log`, `baseline-historical-control.log`. The first saved-fixture attempt lacked its state parent directory and errored before the runner; `self.state.mkdir()` corrected the test setup before the confirmed red run. That initial log is retained as `red-saved.log`, and is not counted as bug reproduction. Initial direct red is also retained as `red-direct.log`.

After the two-line production fix, the exact same four commands each **exit 0**, one test each. `S/green-results.json` captures exact arguments and statuses; corresponding logs are `green-direct.log`, `green-saved.log`, `green-valid-control.log`, `green-historical-control.log`. Both negative tests now verify the metadata error and all no-write/provenance/failure assertions; controls still reach review. No real agent runs in these probes.

## Regression suites and scope checks

Exact suite commands (same environment as above):

```sh
python3 -B -m unittest discover -s scripts -p test_leetcode_metadata.py -v
python3 -B -m unittest discover -s scripts -p test_leetcode_registry.py -v
python3 -B -m unittest discover -s scripts -p test_leetcode_campaign.py -v
python3 -B -m unittest discover -s scripts -p test_campaign_publication.py -v
python3 -B -m unittest discover -s scripts -p test_leetcode_publish.py -v
python3 -B -m unittest discover -s scripts -p test_import_leetcode_lane.py -v
```

The incident metadata suite exercises the frozen incident metadata through registration/readiness and normal positional CLI, including nonmutating plain CLI validation. The registry suite retains metadata/language contract and parity coverage. Campaign, publication and importer suites use disposable local fixtures, fake agents and verification adapters; they do not run a real campaign or deploy anything. Python 3.12.3; Node v20.20.2.

The copied original independent report is byte-for-byte identical (`cmp` exit 0) to the read-only reviewer report. SHA-256 of both copies: `41dc099f2bf7089c63ed5fc9b16c219251ba90211829b3241c6ff66dc5138a60`. Reviewer session: `01a14ece-e73d-7470-b594-a2747a223a02`. Its separate worktree and `/home/songyy/projects/leetcode-metadata-review-state-115-da946ab5` evidence were not edited. Only the four allowed paths change in this fix: campaign script, campaign tests, preserved original report, and this report. No metadata/source/registry/index/concept files in this or any active lesson checkout are edited. The synthetic tests write only disposable fixtures under S. No debugging instrumentation was introduced.

All six suites passed, each exit 0. Exact commands, statuses and summaries are captured in `S/suite-results.json`; full logs use `<suite filename>.log` under S.

| Suite | Passed | Duration |
| --- | ---: | ---: |
| Incident metadata | 5 | 1.206s |
| Registry | 8 | 2.212s |
| Campaign runner (includes four new regressions) | 27 | 23.747s |
| Campaign publication integration | 6 | 3.953s |
| Publisher disposable-fixture regression | 20 | 37.841s |
| Lane importer regression | 24 | 16.772s |
| Total | 90 | |

Final checks: `git diff --check` passed; `cmp specs/reviews/leetcode-metadata-preflight-review.md /home/songyy/projects/leetcode-tooling-metadata-review-115-da946ab5/specs/reviews/leetcode-metadata-preflight-review.md` passed; `git merge-base --is-ancestor b713024f7081a96e2b400eb569d7fa18f5c5d49a HEAD` passed. `rg -n '\[DEBUG-' scripts/leetcode_campaign.py scripts/test_leetcode_campaign.py` returned 1 (no debug markers). The original commit is retained as the parent of this fix; no history rewrite is performed.

Limitations: this run is the author's self-check. No independent re-review, real agent/campaign, browser/teaching evaluation, or lesson acceptance occurred. Positive dispatch recorders deliberately interrupt before reviewer work; successful fake-agent integration is covered separately by the existing runner tests. No new claim is made about mathematical complexity semantics. No push, deployment, or edits to central/active lesson/state checkouts occurred. R1 remains open in the preserved independent report; independent re-review of the new commit is pending.
