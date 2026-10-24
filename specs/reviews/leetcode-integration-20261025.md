# Accepted lesson integration — 2026-10-25

This is an integration check, not a replacement for each lesson's independent
review or evidence of public deployment.

## Frozen scope

Campaign snapshot: `d3a45d3` (Register independently reviewed LeetCode 479 locally).
Local parent: `c2e4716` (Register independently reviewed LeetCode 312 locally).

The 25 newly registered lessons are:
315, 321, 327, 329, 330, 332, 335, 336, 352, 354, 363, 381, 391,
403, 407, 410, 420, 432, 440, 446, 458, 460, 466, 472, 479.

The campaign ledger recorded a separate final review run for each lesson,
with no required findings open. Final weighted scores range from 87.5 to 100.
The source review reports and evidence remain under `specs/reviews/`.

## Integration and checks

- Resolved additive conflicts in the collection registry, its asset query version,
  and the concept map. All 46 previous registry entries are unchanged; the merged
  collection contains 71 entries, including the pre-existing #2916 lesson.
- Compared all 25 lesson directories with the frozen campaign snapshot: exact
  match, including the already reviewed source and evidence.
- Ran the registration preflight for all 25 IDs: passed.
- Ran the Python oracle/algorithm drivers for 24 lessons on the Mac, including
  explicit invocation of every #315 test function. Ran their numerical JavaScript
  core checks where provided, using generated fixtures or the Python driver.
- #407's Python driver passed 20,142 oracle cases and checked 202,344 core frames.
  The integration wrapper then redundantly called its core without required stdin
  JSON, which failed. This was a wrapper invocation error; the successful driver
  already exercised that core. The raw failure and correction are retained in
  the local temporary integration evidence.
- Ran #479's Python test on Pi, where GNU `factor` is installed. All official
  `n = 1..8` cases passed, with exhaustive small cases and prime-factor certificates
  rejecting all larger palindrome candidates. Its JavaScript core passed locally.
- Ran `scripts/test_leetcode_collection.cjs` against the local integrated preview:
  137 checks passed, including both locales, exact-ID search, navigation, keyboard
  behavior, narrow layouts, and synthetic 100- and 984-entry registries.

Local rerun evidence: `/tmp/leetcode-integration-20261025/`.
Pi #479 rerun evidence: `/tmp/leetcode-integration-20261025-479/`.
These temporary directories are operational evidence, not durable public URLs.

Existing candidate whitespace warnings were retained to preserve reviewed bytes.
Unrelated untracked pelican/pigeon pages were untouched.

## Release state

At inspection the campaign had 70 accepted-local lessons, 3 marked released,
no pending release, and #480 in independent review. The next 100-lesson batch
was not due. This integration does not publish the newly registered lessons.
