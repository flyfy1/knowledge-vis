# Reviewed lesson integration — 282 and 514

Date: 2026-10-25. Frozen campaign snapshot: `b490c76d8d42e1ff9f875d85addca770717e99f5`.
Local parent: `df54cf8ec543a2986d33ff3ed55b6d3380a72eaa`.

## Independent acceptance

- #282 passed round 5 at 92.5/100 with no required findings open. Candidate:
  `6f2648d13e125c0aa212184279a8df18e2545c02`; report:
  [282-review-5-260e1690.md](282-review-5-260e1690.md). The active operator formula,
  worked recursive call/return state, and exact manual source copy were corrected.
  All earlier reports, including failed reviews, remain intact.
- #514 passed its separate reviewer at 93.75/100 with no required findings open.
  Candidate: `c6a0413a50394c3aaa4323ef8549fc8d531afd86`; report:
  [514-review-1-b31deabd.md](514-review-1-b31deabd.md). The lesson derives endpoint
  dynamic programming from a concrete greedy counterexample.
- The guarded lane importer checked #514's original candidate fingerprint,
  separate author/reviewer sessions, historical review paths, shared policy,
  unchanged lesson bytes and preservation of the central registry. Its completed
  merge is the frozen campaign snapshot above. A first invocation lacked Node on
  the SSH PATH and stopped before mutation; source/state identity was rechecked
  before retrying with the established runtime.

## Local integration checks

- Resolved the additive #282 brief conflict using the exact reviewed campaign
  file. Both complete lesson directories match the frozen snapshot byte-for-byte.
- Preserved every one of the previous 72 collection entries. The only new entry
  is #514, making 73 entries. Unrelated main-branch files and the owner's three
  untracked pelican/pigeon pages were untouched.
- #514's Python test rerun passed 2,207 unit-operation BFS comparisons, every
  browser-core endpoint layer, exact source mirror and bilingual dictionary checks.
- #282's canonical/oracle, actual Python trace and source-parity tests passed,
  including ten selected recursive snapshots, parent restoration, zero pruning
  and the fresh signed-last exercise.
- Non-mutating metadata preflights passed for both lessons.
- The merged collection passed 137 real-browser checks, including EN/ZH search,
  navigation, keyboard controls, narrow layouts and synthetic 100/984-entry data.
  Combined collection CSS remains 10,909 bytes.

Temporary rerun evidence is under `/tmp/leetcode-integration-514-20261025` and
`/tmp/leetcode-integration-514-collection-20261025`. The dispatcher also inspected
the independent review's EN 320px endpoint cells and Chinese candidate table.
This does not replace the independent review or establish physical-device quality.

## Scope and release boundary

The merge also preserves the campaign's #312 correction/history and #483 draft.
#312 still has required preset/proof fixes; #483 awaits its independent review.
Their presence in Git does not grant acceptance or release eligibility.

After resumption, the central runner registered #282 and recorded 72 accepted-local
lessons, while #312 was actively being fixed and isolated #517 was in independent
review. The 100-additional-accepted release threshold was not reached. This merge
and its GitHub synchronization are source integration, not public deployment.
