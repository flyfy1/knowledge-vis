# Independent R1 narrow re-review

Outcome: **accepted** for tooling R1 on exact candidate `14d423882861a0e4b726eb1daf32f34d528912c1`, direct successor of `b713024f7081a96e2b400eb569d7fa18f5c5d49a`. Original finding **R1 (P2: validate complete and resumed new lessons before reviewer launch)** is closed by this independent re-review. Required open: **none**. This does not accept lesson115, its teaching, publication, or release.

Reviewed 2026-10-18 in `/home/songyy/projects/leetcode-tooling-metadata-r1-review-115-0a6b1c17` only. HEAD and its parent matched those exact commits. Session environment `CODEX_THREAD_ID` is `01a14edb-f8aa-7a23-8927-8cca5bbc0756` (also captured in evidence `session.json`), distinct from prior reviewer `01a14ece-e73d-7470-b594-a2747a223a02` and the implementation session identified in the original report. This is a fresh reviewer context, not an implementation-author or previous-reviewer continuation. No subagents were used. Exact underlying reviewer model identifier is unavailable.

Read `WORKFLOW.md`, `/home/songyy/Documents/agent-skills/diagnosing-bugs/SKILL.md`, and `/home/songyy/Documents/agent-skills/codebase-design/SKILL.md`. No applicable AGENTS.md was found in the checkout or ancestor paths checked. Prior `review_order_loop.py` and `acceptance_guard.py` were read as references only; the new harness was written independently in the permitted temporary directory. No prior evidence was modified. Author assertions and fixture counts are not credited as proof.

Evidence directory **S** = `/home/songyy/projects/leetcode-metadata-r1-review-state-115-0a6b1c17`. All exports, harnesses, disposable Git repositories/commits, state, manifests, and logs are there. No review-checkout commit, push, deployment, active-lane access for execution, metadata repair, or acceptance-history edit occurred. This report is the only checkout write.

## Exact diff and source assessment

Inspected `git diff b713024f7081a96e2b400eb569d7fa18f5c5d49a HEAD` and the complete relevant runner transitions. The only production change is at `scripts/leetcode_campaign.py:390`: for `entry["new"]`, invoke existing `required_files(args.repo, problem, new=True)` immediately before review setup, report/evidence path selection, fingerprint, candidate assignment, and `run_agent`. Other changed paths are four campaign regressions and the two accompanying reports, including the preserved original review.

The shared review transition covers complete unregistered lessons, resumed `new=True, phase=review`, and later new-lesson review rounds. The validator's existing interface centralizes metadata/source checks; this caller extends its reach without adding an adapter or duplicating rules. `required_files`/`validate_metadata` read inputs and reject with CampaignError; registration writes are in a separate function. Historical `new=False` dispatch is deliberately unchanged. Terminal accepted entries return before the loop. STOP remains checked before phase processing and preflight. The existing accepting-review readiness gate remains before review recording/commit and registration. No normalization, coercion, or reinterpretation of previously accepted metadata was added.

Source SHA-256 (`S/source-fingerprints.json`): old runner `4a3e1a01f54bb676e85435f64327621f59b932a34bb478b9feb303a435ad1f3e`; successor runner `551b7427a39de3efcd4a896b13ff76b95efbfa34ded7b0cab4b4ebca18d17e44`. Both registration sources equal `7ba274cd733a36528d98c85fe87b46d5535bc34898567b0c14f36fda37f81310`.

## Frozen reproduction and diagnostic discipline

The harness actually executed these Git archive operations through `subprocess.run`, from this checkout's shared object database:

```sh
git archive 95b00b368bd13ed6e969821924e438415aab7db9 \
  leetcode/115 leetcode/catalog/hard-problems.json leetcode/problems.config.js \
  leetcode/index.html CONCEPT-MAP.md
git archive b713024f7081a96e2b400eb569d7fa18f5c5d49a scripts
git archive 14d423882861a0e4b726eb1daf32f34d528912c1 scripts
```

Their output is retained as `S/frozen.tar`, `old.tar`, and `new.tar`. The immutable frozen export has all **43 lesson files**, original object-valued complexity, and original catalog/registry/index/concept map. Each control copies this export and the selected scripts into a disposable standalone Git fixture on `codex/independent-r1`, then makes a fixture-only initial commit. No current lesson115 working bytes are used. The original metadata SHA-256 is `dbaf6299ae5f63be1de0ae803d87fac3c979367533a7e7d77ed9af0658a0e75f`. The complete frozen export manifest remains equal after all controls (`frozen-manifest.json`, `frozen-final.json`).

`probe.py` calls **real campaign.main → load_state → process_problem**, with real catalog selection, registry classification, Git HEAD/path checks, preview server, metadata validator and fingerprint. Only agent execution is replaced by a recording exception, or a synthetic accepting report in the guard control. Fingerprint and readiness are wrapped to count calls while executing their real implementations. Commit is a rejecting recorder, so any attempted campaign commit fails the control. Prior report/evidence and author/reviewer run records are planted before invoking the runner.

First actual old complete-new reproduction produced an intentional assertion failure: `roles=["review"]`, fingerprint count **1**, readiness count **0**. This is the original orchestration defect, not a count-only regression. Before follow-up experiments, ranked falsifiable hypotheses were recorded in `S/hypotheses.md` and stated in the session:

1. Missing readiness at the common review entry predicts old direct/resumed dispatch and successor early metadata rejection. **Confirmed.**
2. Fresh classification alone predicts saved-review rejection on old. **Falsified:** old resumed review also dispatches.
3. Validator cannot detect the frozen object in this context predicts successor dispatch or a different failure. **Falsified:** successor rejects the exact complexity contract.

No new actionable defect was discovered. No implementation instrumentation or repair was performed. Harness corrections are explicitly retained: initial file-count assertion included directories and stopped before runner; corrected to count 43 files. First acceptance-guard controls reached the expected metadata rejection but their final manifest assertion used a callback-local variable and raised NameError; corrected to use the recorded report path, then reran in fresh fixtures. These setup/assertion failures are not counted as R1 reproductions or passing controls (`setup-notes.txt`, `harness-corrections.txt`, retained `*-initial` artifacts).

## Actual red/green commands and effects

All Python imports/probes use `-B` or `PYTHONDONTWRITEBYTECODE=1`. Actual commands, expanding S as above:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -B "$S/probe.py" old invalid-fresh
PYTHONDONTWRITEBYTECODE=1 python3 -B "$S/probe.py" old invalid-resumed
PYTHONDONTWRITEBYTECODE=1 python3 -B "$S/probe.py" new invalid-fresh
PYTHONDONTWRITEBYTECODE=1 python3 -B "$S/probe.py" new invalid-resumed
PYTHONDONTWRITEBYTECODE=1 python3 -B "$S/run-controls.py"
PYTHONDONTWRITEBYTECODE=1 python3 -B "$S/recheck.py"
```

The first four commands also ran through the collection scripts. The final old red rerun and collection were executed by an inline Python subprocess loop; exact argument arrays and exit statuses are retained in `red-confirmed-results.json`. `run-controls.py` executed both versions of `valid-fresh`, `valid-resumed`, `historical`, `stop-fresh`, `stop-resumed`, `accepted`, and `acceptance-guard`; it initially exited 1 solely for the guard harness assertion noted above. `recheck.py` reran corrected guard and successor invalid controls, exit 0. Fixtures are single-use directories; preserved initial directories were renamed before these repeats. `final-control-results.json` consolidates **18 unique scenarios: 2 intentional old red, 16 passing controls**, without counting repeats. Per-control raw output uses `*-confirmed.log` for reruns, otherwise `<version>-<case>.log`.

| Scenario | Old result | Successor result |
| --- | --- | --- |
| Complete invalid unregistered new | Exit 1: review called once, fingerprint once, no readiness | Exit 0: complexity CampaignError, zero fingerprint, zero agent calls |
| Resumed invalid `new=True, phase=review` | Exit 1: same R1 red | Exit 0: same early rejection; saved entry exactly preserved |
| Complete valid new | Exit 0: review reached, fingerprint once | Exit 0: readiness once, review reached, fingerprint once |
| Resumed valid new | Exit 0: review reached | Exit 0: readiness once, review reached; prior review/author records retained |
| Registered historical `new=False`, no lesson-entry.json | Exit 0: review reached | Exit 0: review reached, no new preflight |
| STOP with invalid fresh / resumed new | Both exit 0: stopped, zero readiness/fingerprint/agents | Both exit 0: identical ordering; resumed entry preserved |
| Already accepted terminal entry with invalid object | Exit 0: skipped, entry unchanged | Exit 0: skipped, entry unchanged, zero readiness/fingerprint/agents |
| Downstream accepting-review guard | Exit 0: rejected before commit/acceptance | Exit 0: isolated unchanged guard rejects before commit/acceptance |

Successor invalid errors are exactly `Lesson 115 metadata/source contract is invalid: Metadata complexity must be one nonempty string covering time and space, not {time,space}`. Both persist top-level `status=failed`, no candidate/review acceptance, no new run record or run directory. Fresh classification is `new=True, phase=review`, empty reviews/author_runs, no assigned candidate. Resumed entry remains exactly equal, including rounds, old candidate, prior report, author IDs and prior review outcome. Prior top-level run records and current/expected_head remain equal.

The valid control changes only the original complexity object substring to `"O(mn) arithmetic operations; O(n) integer cells"`, preserving all other metadata bytes and every other frozen file. It makes no new claim about the arithmetic-cost model. Historical control adds a registry row for 115 and removes only its metadata file before the fixture commit; real classification sets `new=False`. Positive agent recorders intentionally raise at dispatch, so main records a failed control run; that is not an observed campaign failure. They prove reachability, not teaching acceptance.

The acceptance-guard control supplies a synthetic rubric-passing accepting report. On old it reaches the real existing readiness gate naturally. On successor **only the first readiness call is bypassed in the harness**, explicitly isolating the downstream guard behind the now-working early gate; the second call uses real readiness and rejects the frozen object. Both call fingerprint twice, reject with the complexity error, never call commit, record no review and never mark accepted. Only the disposable synthetic report is added, with preexisting paths unchanged. This isolation is defense-in-depth evidence, not an ordinary successor execution or a demonstrated bypass.

## Full filesystem and provenance observations

Each control snapshots complete non-Git repository path/directory sets, file hashes, kinds, symlink targets and modes before/after (including scripts, all lesson files, metadata, registry/index/concepts, prior report and prior evidence). All paths and modes are equal for invalid, positive-dispatch, STOP, historical and terminal controls. Prior evidence deliberately has mode 0640 and embedded NUL bytes. Fixture Git status is clean on all those paths; no ignored bytecode is created.

Confirmed successor invalid repeats additionally snapshot **all Git administrative paths**. Their only repository difference, including `.git`, is creation of `.git/leetcode-campaign.lock`; no tracked/untracked content, directory, mode, Git index or HEAD bytes change. State is intentionally external: only `progress.json` and `runner.lock` exist, with no `runs/` or leftover temporary state file. Fresh failure changes top-level `error`, `problems`, `status`, `updated_at`; resumed failure changes only `error`, `status`, `updated_at`. Existing run provenance, accepted-history fields, expected_head and current are preserved. This distinguishes required failure/lock persistence from metadata or approval mutation. Evidence: each fixture's `before.json`, `after.json`, confirmed `full-before.json`, `full-after.json`, `prior-state.json`, persisted `state/progress.json`, and `S/nonmutation-state-effects.json`.

The immutable export is untouched. Original committed review `specs/reviews/leetcode-metadata-preflight-review.md` remains byte-for-byte equal to its candidate blob, SHA-256 `41dc099f2bf7089c63ed5fc9b16c219251ba90211829b3241c6ff66dc5138a60`. Its changes_required/R1 text is retained verbatim; this new report records closure separately.

## Relevant suites and final scope

Executed from the exact review checkout with `TMPDIR="$S/test-tmp" PYTHONDONTWRITEBYTECODE=1`, using `run-suites.py` to run the three independent suites concurrently:

```sh
python3 -B -m unittest discover -s scripts -p test_leetcode_campaign.py -v
python3 -B -m unittest discover -s scripts -p test_leetcode_metadata.py -v
python3 -B -m unittest discover -s scripts -p test_leetcode_registry.py -v
```

All exit 0: **campaign 27/27 (25.420s), metadata 5/5 (3.143s), registry 8/8 (6.153s): 40/40**. Exact commands/statuses/summaries are in `suite-results.json`; full logs use `<test filename>.log`. Python 3.12.3, Node v20.20.2. Campaign integration includes fake-agent successful acceptance and failure/mutation controls in disposable repositories. No unresolved concern justified extending to publication/import suites.

Final verification: `git diff --check` passes; HEAD remains the exact candidate. Full checkout manifest comparison against `S/checkout-before.json` confirms all preexisting bytes, modes and directory/path sets remain equal and the only added path is this report. No `__pycache__`, `.pyc` or `.pyo` remains, including ignored paths. Original-report blob equality is rechecked. Details are in `S/worktree-final-verification.json`.

Limitations: fake agents/dispatch recorders, local preview and disposable Git fixtures; no expensive real reviewer launched, browser/learner review, production publication, importer, concurrency race, or active-lane operation. Full fixture nonmutation concerns bytes/modes/path sets, not atime/mtime. Shared prior evidence was read only, not used as new execution proof. Scope is the R1 tooling ordering regression on this exact candidate. No remaining actionable R1 finding.
