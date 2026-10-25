# Reviewed lesson integration — 493 and policy adoption

Date: 2026-10-25. Frozen central snapshot:
`c818a1745145b871d5f0e780685643ab66b4814f`. Local parent: `2d9e084`.

#493 passed independent review at 92.5/100 with no required findings:
[report](493-review-1-9db3dbfa.md). Its exact candidate is
`2e4e59163e24274fab59545d98ac6af58d395a31`. The central guarded importer preserved
its original author/reviewer runs, candidate fingerprint, lesson bytes and existing
registry entries. Import completed before shared policy changed.

The local merge preserves all 76 previous collection entries and adds only #493,
making 77. Its complete lesson directory matches the frozen snapshot. The merge
also retains #488's author-ready draft, without registering or accepting it.
Unrelated main-branch content and the user's three untracked pages are unchanged.

Integration reruns passed:

- 20,236 Python/oracle cases, three large cases, source mirror and 87 copy keys.
- 1,099 browser-core traces and their counting/merge/ledger invariants.
- Non-mutating #493 metadata preflight.
- 137 collection browser checks across both locales, search/navigation, keyboard,
  narrow layouts and synthetic 100/984-entry data. Temporary-server BrokenPipe
  messages came from navigation disconnects; the completed browser report recorded
  no page errors or failed asset responses.
- Exact reviewed lesson bytes and final spec hash; no unrelated staged paths.

Reused author test JSON retains its self-check label. These are integration reruns,
supplementing the separate lesson review rather than replacing it. Temporary output:
`/tmp/leetcode-integration-493-20261025` and
`/tmp/leetcode-integration-493-collection-20261025`.

## Operational policy result

The reviewed source commit `f240cd0737e7f11c879d8991778bcb934289e99d` was adopted
only after #493 import, while the central runner was stopped and both locks held.
The [operational receipt](leetcode-worked-example-contract-operational-adoption-20261025.md)
records exact before/after evidence and preserves all lesson state/history.
Final spec SHA-256 is
`030ace4d159421e87948af998f42db698d9823dbc4a12aa0c6747e41143a2f31`.

Confirmed the resumed central process running a fresh #488 review, with no STOP
left behind. Separate low-priority #546 and #552 authors also started from the
adopted snapshot and have the same spec hash; neither may publish independently.

Central acceptance is now 76 lessons. This integration and GitHub synchronization
are not public deployment; the every-100-additional-accepted release threshold is
not reached. The full 984-problem objective remains active.
