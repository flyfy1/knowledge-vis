# Reviewed lesson integration — 564

Date: 2026-10-25. Frozen registration snapshot:
`82d595b41f5855fe78546026731e3e5603b71b2d`. Local parent: `fd4cf04`.

#564 passed [independent review](564-review-1-f84c5fcb.md) at 93.75/100 with no
required findings. Candidate: `9dfc40e957acbc54f333b07d8d44fe2eb523c81b`.
Author run `564-author-c1c62ffa6147` and reviewer run
`564-review-eed6e8785416` were separate. The reviewer saved a cold walkthrough
before source inspection, then checked 514 independently chosen oracle inputs,
both locales, reversible controls, source transfer, keyboard and responsive layouts.

The lesson uses exact integer arithmetic for up to 18-digit input, separates
candidate identity from the current best, excludes the original input and applies
the smaller-value tie-break. Minor Python-syntax and long-digit wrapping friction
remain advisory in the original review. This merge changes no lesson bytes:
the draft already synchronized with #591 is now independently accepted and
registered. It matches the frozen snapshot exactly.

All 82 previous collection entries are unchanged; only #564 is added, giving 83.
The historical #2916 entry explains the difference from central acceptance.
Staged scope contains only #564 review/evidence, collection registration/index,
concept links and this receipt. The user's three untracked pages remain untouched.

Integration reruns passed:

- 21,555 independent expected Python results, including exact large integers.
- 128,934 JS trace frames against the numerical fixtures.
- Non-mutating metadata preflight.
- 137 Chromium collection checks across both locales, search/navigation,
  keyboard, narrow layouts and synthetic 100/984-entry collections.

Outputs: `/tmp/leetcode-564-integration-20261025` and
`/tmp/leetcode-564-collection-20261025`. Reused test labels remain self-check;
these integration reruns supplement the separate independent review.
The staged whitespace check reports only an extra blank line at EOF in the
original review, line 106. That review remains byte-for-byte unchanged; the check
is not claimed to pass.

Central acceptance is 82 lessons. PID 295989 was observed continuing with
`568-author-a952d096771a`; #587 was in fresh repair review
`587-review-a4d9fed67bbc` and #600 in `600-review-e543b49cfc3b` in separate lanes.
Neither lane is counted as accepted centrally. Source synchronization does not
establish public deployment. The every-100-additional-accepted publication gate
remains unmet, and the full 984-problem objective remains active.
