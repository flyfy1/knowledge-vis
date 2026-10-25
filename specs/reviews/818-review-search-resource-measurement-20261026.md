# Frozen #818 canonical search: Mac resource measurements

**The exact new canonical implementation completed every target 1–10000 and all
required isolated reruns without a mismatch, exception or timeout.** In the
isolated target 9809 observation, whole-process peak RSS was 153,681,920 bytes,
about 87.1% below the preserved old BFS observation of 1,194,819,584 bytes. This
supplies the external measurement portion of 818-SEARCH-R1; independent lesson
review and acceptance remain pending.

## Identity and ownership

- Frozen author candidate: `9277b8fb633c26904b03231d1127ed816baad6c4`.
- Complete lesson Git tree: `1c14e1c5ebe8dab5602e7cd9a2c1ec9f3b16221a`.
- Canonical path: `leetcode/818/solution.py`, 1426 bytes.
- Canonical SHA256: `da9a9a40d5d90c856d82b984333419be4246821b037108faeee0eddae0ab6d68`.
- Reviewed harness SHA256: `94a3d9c9567af65c32bdd72bddd3d1eaa167a8e9d901335237a89ba5880a7386`.
- Evidence prefix: `specs/reviews/818-evidence/818-search-mac-20261026-9277b8fb633c/`.
- Summary SHA256: `f71d4d7d34e2118c34868916c1487ec1f22f59d8f5e0f4f1415d58eb7e1f4ffc`.

Root read the frozen source, copied its immutable Git blob from Pi, verified the
hash, and ran the already independently reviewed Mac harness. The code uses the
full `(position,speed)` graph, both legal transitions, best-g updates, stale-pop
skipping and goal-pop termination. It has no state, geometry or time cutoff.
The external harness budgets do not change the callable. Original and copied
source hashes still match after execution. The author/recovery workers had exited,
and the recovery-owned STOP was retained before any fresh reviewer began.

The [successful author handoff](818-author-handoff-startup-recovery-execution-20261026.md)
preserves the separate failed startup transaction and all earlier review history.
The future evidence-adoption commit will have a different whole-repository HEAD;
its entire lesson tree and canonical source must remain identical to those above.

## Actual coverage and environment

The run began 2026-10-25 19:55:15 UTC on macOS 27.0.1, arm64, Python 3.14.6. Each
target executed the actual `Solution().racecar(target)` in a fresh isolated Python
process. At most two processes ran concurrently during the survey. The total
harness duration was 599.07 seconds, including 10,000 fresh-process executions,
the isolated reruns and process cleanup; this is not the runtime of one input.

All 10,000 distinct targets returned integer answers matching the reference DP.
Targets 1–32 additionally matched independent complete raw-command BFS. The DP
comparison is numerical corroboration, not proof of its unproved normal-form
decomposition or of A* optimality. The independent reviewer must still audit the
lower-bound and goal-pop argument against the lesson and canonical code.

Every survey row has status `ok`; there were no missing targets, mismatches,
exceptions, invalid returns or timeout outcomes. The overall budget was 1800s and
the external per-target process budget 15s. The completed summary and every
artifact hash were checked against the actual output files, not only a success
label. Environment, all per-target records and source bytes are retained in the
[evidence directory](818-evidence/818-search-mac-20261026-9277b8fb633c/summary.json).

## Resource results

The maximum observed survey callable time and survey peak RSS both occurred at
target 9809: 0.705400583 seconds and 153,419,776 bytes. These are maxima across the
measured full-range survey, not asymptotic bounds or maxima under every machine
configuration. Fresh sequential isolated reruns covered 9809, 9879 and 10000; this
also covers both observed maxima because they selected 9809.

| Target | Answer | Isolated callable seconds | Isolated process peak RSS, bytes |
| --- | ---: | ---: | ---: |
| 9809 | 56 | 0.638126167 | 153,681,920 |
| 9879 | 55 | 0.566605292 | 142,196,736 |
| 10000 | 45 | 0.093608666 | 53,198,848 |

RSS is Darwin `resource.getrusage(RUSAGE_SELF).ru_maxrss` in bytes: the peak of
the whole fresh Python process, including interpreter/import overhead. It is not
isolated algorithm allocation or child-process memory. Callable timing excludes
compile/import; per-row process wall time includes startup/cleanup. Concurrent
survey timings are load-sensitive; isolated reruns are listed separately.

For comparison, the preserved [old BFS observations](818-performance-observation-20261026/observations.json)
used source SHA `ba7639466dde736ade02f547425edca0bbac2734afa6a7ac03c91a59bbf29fb9`,
later reconciled with original candidate `c7a325e5a48d2da000609ea93d23f8d255d03bdd`.
The high-memory old BFS was not rerun for this report.

| Target | Old observed seconds | Old process peak RSS, bytes | New isolated RSS reduction |
| --- | ---: | ---: | ---: |
| 9809 | 2.407513750 | 1,194,819,584 | 87.1% |
| 9879 | 2.001583082 | 838,664,192 | 83.0% |
| 10000 | 0.335738291 | 198,852,608 | 73.2% |

These historical and new measurements used different harnesses/import overhead
and were taken at different times. They show the observed resource improvement
for the stated bytes and environments; they are not a controlled statistical
benchmark, a claim of official judge limits, or a LeetCode submission verdict.
The prototype's earlier survey and state counts are not substituted for these
canonical-source results. The conservative exponential complexity remains; no
polynomial bound is claimed.

## Review handoff

This report closes no teaching, browser, source-transfer or optimality-proof
finding on its own. The new independent reviewer must read it after the cold
walkthrough, verify the candidate/source binding, and explicitly decide whether
818-SEARCH-R1 is closed. The older 818-RESOURCE-R1 distance-DP choice was superseded;
its normal-form proof was not completed by this experiment. Original acceptance,
new acceptance, release eligibility and public delivery remain separate records.

For reproduction, use the [reviewed harness](818-search-measurement-preparation-20261026/README.md)
with the retained `canonical.py` and exact source hash above, a new exclusive
output directory, 1800s overall budget, 15s per-target budget and two workers.
Do not overwrite this evidence directory or rerun the old large-memory BFS on Pi.
