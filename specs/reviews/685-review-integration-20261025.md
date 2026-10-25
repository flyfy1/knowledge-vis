# Integration receipt — #685

Central import: `96747d2d25c39da15041d30f109acdb2f61f3a8d`.
Accepted lane: `82248c1fcdc9f99cca4ba15391156309d6a288da`.
Reviewed candidate: `961cca12bf829a62920636ee0ed213c9fb174e6e`.
Independent report `685-review-2-b551b93b.md` accepts at 91.25/100 with no required
open findings. It closes 685-R1-001 using its current Linux regression and
hash-matched, inspected Mac evidence. The prior failure/report remains intact.
Central acceptance count after import is 95.

The natural central STOP had created only a default pending placeholder for
#685. Before import, verified under the existing ownership lock: stopped clean
checkout, expected HEAD 4a33907, exact default pending fields, zero #685 central
runs, no lesson directory, and no active #685 central stage. The accepted lane
was completed. Backed up full progress as
`before-empty-685-placeholder-normalization-20261025.json`, removed only that
untouched placeholder and recorded its complete value in maintenance history.
Queue, runs, other problems and HEAD remained unchanged. The unchanged importer
then validated both separate reviews, candidate and historical fingerprints.
The reservation was marked imported under the same ownership checks with a
separate backup; no acceptance was manufactured by state maintenance.

All 81 tracked files under `leetcode/685/` match Mac-verified repair
`481337f54b1ba4f0d64f0f1a036d275e3e3d245a` exactly. The merged registry adds only
#685 and preserves all 95 prior entries. Registry count differs from campaign
acceptance count. Main-only evidence and unrelated untracked pages are preserved.

The collection browser suite passes all 137 checks, including both locales,
search/filter/navigation and bounded 100/984-entry fixtures. Whitespace checks
pass. Result and reproduction runner: `685-evidence/mac-integration-20261025/`.
Algorithm and lesson tests were not repeated during this byte-identical merge;
the exact frozen source already passed relevant Mac and independent checks.

This is integration, not public delivery. With three accepted lessons in the
release ledger, 92 remain accepted but unreleased; eight more are needed for
the next batch of 100.
