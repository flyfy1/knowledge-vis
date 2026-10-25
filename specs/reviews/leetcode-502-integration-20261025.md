# Reviewed lesson integration — 502

Date: 2026-10-25. Frozen registration snapshot:
`230afc1676758b633854c3c643d035ab5454cf5c`. Local parent: `a985a8e`.

#502 passed [independent review](502-review-1-8374c107.md) at 96.25/100 with no
required fixes. Candidate: `b0d1ffec53488f6d906ef3c45a8bb7f7a99574e9`.
Author run `502-author-6ab9dbd695e3` and reviewer run
`502-review-34f029820be4` were separate; reviewer session:
`01a170b4-eafa-7a82-98bb-da299be3ced2`.

The lesson distinguishes required capital from a deducted cost, compares choices
that unlock different future projects, and separates heap admission from project
completion. The reviewer cold-walked the page before source inspection and checked
a fresh result of 9 against a tempting wrong rule yielding 8. Its 400 independent
oracle cases passed. Minor Python syntax teaching friction remains advisory in
the original report; no candidate edits were made after acceptance.

The complete lesson tree matches the frozen snapshot. All 80 previous collection
entries are unchanged, with only #502 added, giving 81. The historical #2916 entry
explains the difference from central acceptance. Scope checks permit only #502
files and review evidence, collection registration/index, concept links and this
integration receipt. The user's three untracked pages remain untouched.

Integration reruns passed:

- 107,949 exhaustive Python cases, 1,500 seeded cases, 1,500 visible-baseline
  executions, 1,744 canonical heap-operation checks and three maximum-size cases.
- 3,006 browser-core cases with 18,059 frame checks, including eligibility,
  heap membership/order, distinct completion, capital accounting and source parity.
- Non-mutating #502 metadata preflight.
- 137 Chromium collection checks covering both locales, search/navigation,
  keyboard, narrow layouts and synthetic 100/984-entry collections.

Evidence outputs: `/tmp/leetcode-502-integration-20261025` and
`/tmp/leetcode-502-collection-20261025`. The reused tests retain self-check labels;
these are integration reruns supplementing, not replacing, the separate review.
The whitespace check reports only the original review's extra blank line at EOF,
line 101. That evidence is preserved byte-for-byte; the whitespace check is not
claimed to pass.

Central PID 258372 was observed continuing with `527-author-3b44ebebe107`.
Central counts were 80 accepted locally, 18 blocked and one active author. #587
was still authoring and #591 reviewing in their isolated lanes. The release ledger
retained three released lessons and no pending release, leaving 77 accepted
lessons awaiting the every-100-additional-accepted gate. This Git synchronization
is not public deployment. The full 984-problem objective remains active.
