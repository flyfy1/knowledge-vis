# Integration — 600 accepted, 587 reopened on Mac

Date: 2026-10-25. Imported central snapshot:
`6d4a162429acd096d6ebc8c706776077ff610963`. Local parent: `15c3383`.

#600 passed [independent review](600-review-1-5e16da66.md) at 97.5/100 with no
required findings. Candidate: `ac6e9db34a4094cab5ec84f03f3c0e1310b95c45`.
#587 initially passed its [second review](587-review-2-2d3d950c.md) at 96.25/100
after fixing 587-R1-F1; candidate:
`f5816b88f3e7e280e4c89878a0e6490d1a3522e6`. Its failed first review, repair and
fresh reviewer history remain preserved. The subsequent Mac failure below
means #587 is **not currently accepted**.

## Guarded imports and preserved source

The central runner finished #571 naturally and observed the owned STOP. Guarded
imports verified original candidate fingerprints, review history, shared policy
and registry preservation under central/lane locks. #587 imported as
`ab203e4b3fb7f36086077db95c5295350774bbaf`; #600 then produced the snapshot above.
Both reservations were marked imported after the clean expected HEAD and accepted
states were verified. Only the owned STOP was removed; the queue resumed.

Both complete lesson trees match the imported snapshot. All 83 prior collection
entries are unchanged; only #587/#600 were added, giving 85. Registry membership
is not the acceptance ledger. The historical #2916 entry and reopened #587 must
not inflate the current central acceptance count. #568/#569/#571 access blockers
are retained. The user's three unrelated untracked pages remain untouched.

## Integration checks and discovered regression

Passed:

- #587: 920 canonical cases, 511 exhaustive subsets, 400 seeded cases, 3000-tree
  boundary, and 34,955 browser-core frames with supporting-line/source checks.
- #600: all inputs 0..20000 against independent expectations, 691 large cases,
  4,095 core inputs, 18,883 frames, suffix/branch-partition and source checks.
- Both non-mutating metadata preflights.
- 137 Chromium collection checks, executed separately from the failing lesson
  regression, across locales/navigation/narrow layouts and synthetic collections.
- Exact lesson trees, preservation of previous registry entries and staged scope.

The first scope assertion used an incorrect first-review filename; inspecting
the actual report corrected the harness allowlist to `587-review-1-da1b547a.md`.
It passed on rerun without source changes. The whitespace check reports only the
original #587 second review's extra EOF blank line (line 96); it is preserved.

**Failed:** the existing #587 preset-scope browser regression on Mac Chromium.
Three English options clip at 320px. A minimal probe and inspected screenshot
confirmed actual clipping. Same-width Pi comparison passes; Mac text needs
219.94–226.59px while only 214px is available. Temporary font-only and padding-only
experiments pass, while locale roundtrip does not change the failure. The confirmed
cause is insufficient label width margin under platform-dependent text metrics.
No lesson source was changed during diagnosis; no successful integration of #587
is claimed. See [dispatcher finding](587-review-dispatcher-mac-20261025.md).

Evidence outputs are under `/tmp/leetcode-587-integration-20261025`,
`/tmp/leetcode-600-integration-20261025`,
`/tmp/leetcode-587-preset-integration-20261025` and
`/tmp/leetcode-587-600-collection-20261025`. Durable Mac/Pi diagnostic evidence is
in `587-evidence/mac-integration-20261025/`. Reused tests retain self-check labels;
these are integration checks, not replacement independent acceptance reviews.

## Reopened status and continuation

At the next safe stop, a dispatcher-only evidence commit
`700e5ce080b324a3816547c608c5f3c67fed689a` preserved all lesson bytes and historical
reviews, backed up the ledger and changed only #587 to `changes_required` / `fix`.
The previous acceptance is historical; rounds remain 2, with no fabricated new
review. The owned STOP was removed and PID 344590 was observed running
`587-fix-f2ac49099106`. Fresh independent review and a passing Mac integration
regression are still required. Publication eligibility excludes the reopened item.

#629 and #630 began separate low-priority author runs from snapshot `6d4a162`:
PIDs 339548 and 339780, ports 18782/18783. These are the only two active extra lanes.
Current central counts observed: 83 accepted, 25 blocked, one changes required,
one other pending entry. Source synchronization is not deployment; the every-100
additional-accepted gate remains unmet. The full 984-problem objective stays active.
