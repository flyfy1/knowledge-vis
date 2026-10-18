# Independent metadata-preflight tooling review

Outcome: **changes_required**. Required open: **R1**. Scope is tooling only; this report does not accept lesson115, its teaching, or a release.

Reviewed candidate `b713024f7081a96e2b400eb569d7fa18f5c5d49a` against base `a2d20f24132b766bba2e975b53118c5f5e29dacb`, on 2026-10-18. HEAD matched candidate. Read WORKFLOW.md and both requested skills in `/home/songyy/Documents/agent-skills/`. This reviewer did not reuse author session `01a14ec7-44ae-7980-8ffe-10dc844f77ac`, invoke agents, or consult author evidence to establish results. Implementation remained frozen. No commits, pushes, deployments, or changes to active lessons, lanes, shared state, prior reports or acceptance were made.

Evidence directory below is abbreviated **S** = `/home/songyy/projects/leetcode-metadata-review-state-115-da946ab5`. All filesystem manifests, harnesses, exports and logs are there. This report is the only repository write. Python 3.12.3; Node v20.20.2.

## R1 — P2: validate complete and resumed new lessons before reviewer launch

Location: `scripts/leetcode_campaign.py:331–337,388–395`; the new validation in `required_files` is called after author/fix readiness and after an accepting reviewer returns, but is absent before review dispatch.

Reproducible trigger: supply a complete, unregistered new lesson with invalid metadata, or resume a `new=True, phase=review` entry. The real frozen #115 export is such a complete lesson: all 43 files exist and its frozen registry does not contain 115. `process_problem` selects `phase=review` based only on file existence and reaches `run_agent(..., "review", ...)` with object-valued complexity.

Concrete consequence: the runner launches potentially expensive independent review on a candidate whose deterministic metadata gate already fails. An accepting reviewer subsequently encounters CampaignError before review recording, causing avoidable failed work rather than early rejection. The requested failure-before-reviewer-launch property is unmet. This is **not** a demonstrated acceptance bypass: the later acceptance guard rejects the object before review commit and accepted state.

Commands (actual exit statuses, independent of surrounding shell log collection):

```sh
python3 -B "$S/review_order_loop.py"               # exit 1: roles=["review"]
python3 -B "$S/review_order_loop.py" saved-review  # exit 1: roles=["review"]
python3 -B "$S/review_order_loop.py" author        # exit 0: roles=["author"], metadata rejected
python3 -B "$S/acceptance_guard.py"                # exit 0: rejected-before-review-commit
```

The loop asserts the desired pre-launch rejection, so exit 1 is an intentional red signal. It calls candidate `process_problem` and the real frozen catalog, registry, files and validators. Only HEAD/fingerprint reads are adapted for an archive fixture, path checking is stubbed, and reviewer launch is replaced by a recording exception; no reviewer is actually launched. The author control returns synthetic `ready` and reaches real readiness validation. The acceptance control supplies a synthetic valid-shaped accepting report under S and asserts that commit is never called. These are orchestration probes, not real lesson acceptance.

After the first red loop, ranked falsifiable hypotheses were recorded in `S/hypotheses.md` before follow-up experiments:

1. Missing validation on direct-review entry: predicts reviewer launch there but rejection after author-ready. Confirmed.
2. Fresh classification alone causes the gap: predicts explicit saved-review entry rejects before launch. Falsified; it also launches.
3. The validator cannot detect this export in this context: predicts direct readiness passes. Falsified by the real complexity CampaignError.

The fixture initially omitted `rounds` in the saved-state probe and raised KeyError; correcting that harness field produced the recorded red result. No implementation edits were made. Final commands/results are in `S/review-order-results.json`; post-author and saved-entry controls distinguish the cause without modifying production code. A closure should call readiness before dispatching review for new lessons on both entry paths, retaining deliberate historical scope, with regressions asserting **zero review calls** for invalid complete and resumed candidates. Fix/regression implementation is outside this frozen review.

## Frozen incident and independent red/green controls

Exports were made directly from shared Git objects, never current lesson115 worktree bytes:

```sh
git archive 95b00b368bd13ed6e969821924e438415aab7db9 \
  leetcode/115 leetcode/catalog/hard-problems.json leetcode/problems.config.js \
  leetcode/index.html CONCEPT-MAP.md
git archive a2d20f24132b766bba2e975b53118c5f5e29dacb scripts
git archive b713024f7081a96e2b400eb569d7fa18f5c5d49a scripts
```

Archives and extracted directories are `S/frozen.tar`, `S/baseline.tar`, `S/candidate.tar` and their corresponding directories. `S/frozen-manifest.json` records all exported paths, kinds, modes and SHA-256 content hashes. `S/source-fingerprints.json` records both script trees. Key SHA-256 fingerprints:

| Evidence | SHA-256 |
| --- | --- |
| Baseline registration source | `bdf7e690a7e8fa975eccfbbfc079323ff790546fd946d17624bdd0610ccf497a` |
| Candidate registration source | `7ba274cd733a36528d98c85fe87b46d5535bc34898567b0c14f36fda37f81310` |
| Baseline campaign source | `cb82e8d9aea111376ec7ac462f6de02a05cf6dac00ec1b649c3c41709506135c` |
| Candidate campaign source | `4a3e1a01f54bb676e85435f64327621f59b932a34bb478b9feb303a435ad1f3e` |
| Frozen original lesson-entry.json | `dbaf6299ae5f63be1de0ae803d87fac3c979367533a7e7d77ed9af0658a0e75f` |

Baseline actual registration command:

```sh
python3 -B -c 'import sys; sys.path.insert(0,sys.argv[1]); from register_leetcode_lesson import register; register(sys.argv[2],115)' \
  "$S/baseline/scripts" "$S/frozen"
```

Result: exit 1, `AttributeError: 'dict' object has no attribute 'strip'` at baseline registration line 122, `entry['complexity'].strip()`. `S/baseline-red.log` contains the traceback. The frozen export remained exactly equal to its original manifest, verified again at the end (`S/frozen-final-verification.json`). This is the original full-scene failure, not an embedded JSON reconstruction.

Independent control command:

```sh
python3 -B "$S/independent_review.py"
```

Result: exit 0, all assertions passed (`S/core-run.log`, `S/core-results.json`). The harness uses copies of the full frozen export and candidate scripts:

- Candidate `register`, `validate_metadata`, and `required_files(new=True)` reject the original. CLI exits 2 with `Metadata validation failed: Metadata complexity must be one nonempty string covering time and space, not {time,space}`, without traceback. Full positional registration on the original also exits 2 under ordinary and optimized Python.
- The minimal positive control replaces only the original complexity JSON value, preserving every other metadata byte. The resulting exact string is `O(mn) arithmetic operations; O(n) integer cells`. This retains the original arithmetic-operation and integer-cell qualifiers; no coercion or claim of constant-cost arbitrary-precision arithmetic is introduced. `S/minimal-control.json` records both metadata hashes.
- That string passes real preflight, new-lesson readiness, and full **ordinary positional** registration: `python3 <fixture>/scripts/register_leetcode_lesson.py 115`, with default root derived from the script location. Registry complexity equals the exact string; metadata bytes remain identical. Only `leetcode/problems.config.js`, `leetcode/index.html`, and `CONCEPT-MAP.md` change, with no added/deleted paths or mode changes. Baseline full registration also passes the complexity-only control (`S/baseline-valid-green.log`, exit 0), isolating the original blocker.
- Both invalid and valid preflight run in plain CLI subprocesses **without `-B`**, after removing `PYTHONDONTWRITEBYTECODE`. Full before/after comparisons cover file contents, modes, kinds and complete directory/path sets, including copied local scripts. Neither creates `__pycache__` or any other path. Ordinary and `-O` validation results agree. Explicit `--root` controls also exit 2/0 for original/valid inputs (`S/explicit-root-results.json`).

Snapshots: `S/invalid-before.json` = `S/invalid-after.json`; `S/valid-before.json` = `S/valid-preflight-after.json`; `S/valid-registration-after.json` records the three-output registration change. Baseline and candidate source hashes are pinned, not inferred from author's self-check.

## Additional contract and compatibility checks

`S/contract-controls.json` records exact subprocess arguments, inputs, exit codes and stderr for 25 cases. With optimized Python, preflight rejects complexity object/list/null/number/bool/empty/whitespace; wrong or non-integer ID, path, URL, difficulty and language; malformed bilingual metadata/topics; empty concepts, boolean steps and missing step anchors. Every case exits 2 without traceback and leaves full bytes/modes/directory sets unchanged. No type coercion occurs.

A synthetic explicit Python language contract over the actual frozen solution/source mirror first passes, then changing only the source rejects exact parity; removing its local evidence rejects verificationEvidence. Both remain enforced under `-O` without writes. Existing registry tests independently cover native-language evidence, exact-six JavaScript policy and source parity. The inherited compatibility policy remains deliberate: Python without a language contract does not newly require parity, and `required_files(new=False)` succeeds without lesson-entry.json. This change does not migrate historical registered metadata.

Source reasoning: the shared `validate_metadata(root,id)` interface has useful depth: metadata shape, language contracts and concept checks live once, and both registration and new readiness use it. Explicit `require` replaces optimization-sensitive assertions; registration validates before its first output write. The missing caller in R1 limits that shared behavior's reach. A nonempty complexity string's mathematical meaning remains a review responsibility; preflight does not parse cost notation.

## Existing tests run independently

Executed in this review worktree with all temporary output directed under S, suppressing bytecode in the runner and inherited child processes (the CLI artifact test explicitly removes suppression):

```sh
TMPDIR="$S/test-tmp" PYTHONDONTWRITEBYTECODE=1 \
  python3 -B -m unittest discover -s scripts -p 'test_leetcode_metadata.py' -v
TMPDIR="$S/test-tmp" PYTHONDONTWRITEBYTECODE=1 \
  python3 -B -m unittest discover -s scripts -p 'test_leetcode_registry.py' -v
git diff --check
```

Results: **5/5 metadata tests and 8/8 registry tests passed**, in 0.892s and 1.866s respectively. Logs: `S/existing-metadata-tests.log`, `S/existing-registry-tests.log`. Diff whitespace check passed. Full registration was separately exercised against the full frozen export above, rather than inferred from these synthetic tests.

The full campaign/publication/import suites were not executed: their fixture setup makes Git commits, and this task prohibits commits. Existing campaign source and its new test were inspected: the new invalid-metadata test exercises author-ready, leaving the complete-file and saved-review paths uncovered. Independent commit-free orchestration probes cover the relevant paths and acceptance guard. No browser/teaching review, real campaign, publisher, importer, deployment, or concurrency race test was performed. These limits do not turn synthetic results into real lesson acceptance.

## Specification claims and evidence independence

The three specs correctly distinguish string-shape validation from cost-claim review, forbid post-review repair, and describe the positional CLI and non-mutating preflight accurately for the exercised inputs. Their new-lesson readiness qualifier is material: historical registered lessons retain their old runner scope. The global instruction to run preflight before readiness/acceptance is a human/agent workflow obligation; it should not be represented as universal runner enforcement. In particular, the early-launch guarantee fails as R1 demonstrates, while acceptance rejection remains enforced for new lessons.

Only after independent reproduction, core controls and source reasoning were written to `S/independent-source-record.md` did this reviewer read `specs/reviews/leetcode-metadata-preflight-implementation.md` for coverage gaps. Its tests and claimed counts are not credited as independent results. Its statement that the new campaign regression confirms failure before reviewer launch is true for its post-author scenario but insufficient for the other entry paths. No author temporary files, session or logs were used.

Diagnostic phase limits: no instrumentation, repair or implementation regression was added because implementation is frozen. Executable assertions at the registration/readiness/orchestration interfaces supplied the probes. The supplied original incident was reproduced before analyzing its cause; its retrospective explanatory hypotheses are explicitly labelled in S. The newly discovered R1 had a real red loop followed by the preregistered ranked hypotheses and distinguishing controls above. Temporary fixtures remain clearly isolated under S.

Final worktree verification is recorded in `S/worktree-final-verification.json`: all preexisting paths, file hashes and modes, directory sets and ignored bytecode match the initial manifest; the only new path is this report. HEAD remains the exact candidate. Acceptance requires R1 closed and independently rechecked; no lesson metadata or prior approval should be repaired as part of closing this tooling finding.
