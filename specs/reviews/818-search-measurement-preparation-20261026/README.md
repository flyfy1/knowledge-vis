# Prepared Mac harness for frozen #818 search source

**Preparation only.** No future candidate exists yet, no full-range candidate run was performed, and no Pi/runtime/state files were touched. Root must independently review exact harness SHA256 `94a3d9c9567af65c32bdd72bddd3d1eaa167a8e9d901335237a89ba5880a7386` before use. Tests SHA256 `004ba1f5f8b6917738c8c0cc8824559c96d912383b01f8e440151c507c1b189b`.

This is one narrow command-line module. Its interface binds an explicit local canonical source, expected SHA256 and a new exclusive output directory; private subprocess execution isolates measurements. It adds no campaign hook or general measurement framework.

```sh
python3 -B specs/reviews/818-search-measurement-preparation-20261026/measure.py \
  --source /absolute/path/to/frozen-solution.py \
  --expected-sha256 <exact-64-character-lowercase-sha256> \
  --output /absolute/path/to/new-exclusive-measurement-directory \
  --wall-seconds 1800 --per-target-seconds 15 --workers 2
```

Use only on Mac. The source hash is checked before creating output, exact bytes are copied to canonical.py, and original plus copied bytes are checked again after completion. Each worker checks the copied source before/after execution. `compile` executes these exact bytes with no import of the source module; `-I -B` prevents local module lookup and bytecode writes. Standard-library imports used by the canonical solution are supported. Code requiring unprovided neighboring helpers fails visibly rather than substituting a different implementation.

Default coverage is every official target1..10000. Each uses a fresh process and invokes actual `Solution().racecar(target)`, with at most two child processes concurrently. Each row records its target, observed answer or null, status, call time, process wall time, and process peak RSS where available. Incorrect/noninteger returns and exceptions are failures. A timeout/deadline never becomes an answer. Remaining targets receive explicit overall_deadline records; after an interrupted run, uncollected results are honestly labeled unobserved_after_abort. Child process groups are terminated on timeout and completion so descendants do not outlive their measurement.

The full range is compared with the familiar reference DP **only as numerical corroboration**, not independent proof of that recurrence or A*. Targets1..32 additionally use independent complete raw-command BFS; that helper explicitly refuses larger inputs. The original high-memory BFS is never executed on a large target. The separate A* admissibility/goal-pop proof is still required for acceptance.

After the survey, fresh sequential isolated reruns cover9809,9879,10000 and the actually observed maximum-call-time and maximum-process-RSS targets (deduplicated). These reruns share the same overall deadline. If the budget is insufficient or any rerun fails, the overall result fails. There are no canonical solution caps or algorithm changes; all budgets belong to external process control.

On Darwin, `resource.getrusage(RUSAGE_SELF).ru_maxrss` is recorded directly in **bytes**, with its raw value/unit retained. It is the peak of the entire fresh Python process, including interpreter/imports, not isolated data-structure allocation or child-process RSS. `call_seconds` measures only the callable; `process_wall_seconds` includes startup and cleanup. The deadline covers the survey and isolated reruns; process cleanup may add a short grace. An external interruption prevents queued calls from spawning; already running children retain their finite per-target budget before cleanup. Environment metadata records Python/OS/machine, CPU count, starting load and all configured limits.

Outputs: environment.json; canonical.py; survey.jsonl (one target/status per requested target); isolated.jsonl; progress.json; summary.json with artifact hashes. `passed_full_range` and full_official_range_passed require all10,000 actual results, all isolated reruns, successful comparisons and unchanged source bytes. Other outcomes are failed/refused. The test-only `--test-limit` accepts1..32 and can produce only passed_limited, never full-range success. Existing output directories are refused without overwrite; use a new path for any separately authorized repeat.

[Eight CLI tests](test_measure.py) passed: a tiny real A* adapter on1..12, hash mismatch, existing output preservation, wrong answers, invalid returns/exceptions, per-target/overall timeouts, source-copy mutation and descendant cleanup. [tests.log](tests.log) and [validation.json](validation.json) preserve results. They use temporary directories, never a real future candidate, broad expensive search, SSH or publication. Empirical Mac success remains separate from independent review and any public release.
