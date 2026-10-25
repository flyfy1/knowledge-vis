# First additional 100-lesson publication

**Published and publicly verified:** release
`b5d3557210f44ff68a57b83fc0b4c5ee`, source
`674107302fc9a1a3d7cab177150b5a6909259bd5`, at
2026-10-25 06:58:37 UTC. The original publisher verified all **712 public resource
hashes** and ran its reviewed browser gate on **all 100 selected lessons**.
The gate returned `lessons: 100`, `ignoredKnownBeaconFailures: 0`. Pending is null;
released campaign lessons increased from 3 to 103 only after those checks passed.
The public collection contains 104 lessons, including the pre-existing legacy
lesson outside this campaign's accepted set.

The [release receipt](releases/first-100-20261025/release-receipt.json) binds every
published file hash, accepted candidate, independent report, registry entry and
verification result. This is the complete same ordered batch whose first attempt
failed; it is not a diagnostic subset or a waiver of a failed gate.

## Repairs and gate correction

- #239's actual H1 omitted its number. Fresh review then found the renderer using
  a processed right endpoint as a window's left edge. Both were repaired, with
  empty/partial/full states, baseline boundaries and dynamic localization clarified.
  Separate review accepted the new candidate at 95/100; five Mac integration
  checks passed with all 91 lesson files unchanged from that accepted candidate.
- #262's Chinese heading/document title remained English and its old test expected
  English. Fresh review also required eligibility guards and a worked Pandas bridge.
  Its new candidate supplies both joins' intermediate rows and sum/count derivation.
  Separate review accepted 97.5/100; five Mac checks passed, including actual
  Pandas 2.2.3 execution, with all 134 candidate files unchanged. Narrow 200% CSS
  zoom requires horizontal panning; no browser-toolbar zoom or screen-reader
  completeness is claimed.
- #502 IPO legitimately has identical reviewed titles. The publisher's previous
  title-equality assumption was reproduced with a failing browser fixture and
  narrowly corrected. Six browser regression cases and 20 existing publisher
  tests passed; a separate agent approved the exact correction. Required ID,
  localized-title, official-link, content and resource checks remain.

See the [239 integration](239-review-mac-integration-20261025.md),
[262 integration](262-review-mac-integration-20261025.md), and
[publisher review](publisher-bilingual-heading-review-20261025.md).

## Recovery and prospective guidance

The failed release `b1aeec15655d493c88b66eced787cb9f` was preserved as failed metadata;
no successful counter was advanced by recovery. The reviewed one-time helper
proved all 712 materialized bytes, the same 100-item next selection, fresh separate
acceptance for 239/262, and unchanged candidate/digest identities for the other
98. Its first read-only invocation lacked Node in SSH PATH and exited before any
state mutation; rerunning with the original campaign environment passed. After
fsynced backups, it preserved the old pending record, acknowledged the already
materialized registry baseline and cleared pending. Its completed receipt was
reread before resuming the original full-queue launcher. No old served-content
backup was created. Full original publication checks then ran again.

[Recovery receipt](releases/first-100-20261025/recovery-receipt.json) and
[independent recovery review](failed-release-recovery-review-20261025.md) preserve
the evidence and crash boundaries. The new rendered-heading spec was independently
reviewed and adopted only after both frozen repair reviews finished; see the
[adoption receipt](releases/first-100-20261025/guidance-adoption.json). Historical
candidates and scores were not rewritten.

## Ordinary public UI and ongoing work

The in-app browser's ordinary URLs showed #239's corrected numbered Chinese H1,
exact official link, and after four Next actions interval [1,3], values [3,-1,-3],
output [3,3] and deque 1:3 → 2:-1 → 3:-3. #262 showed its Chinese H1, exact official
link, guarded update rule and complete Pandas bridge. The collection showed
104/104 and numbered cards with LeetCode links. These supplement the publisher's
full resource/browser verification; they are accessible-UI observations, not
public screenshot evidence. [UI record](releases/first-100-20261025/public-ui-observations.json).

The original 984-item campaign is active with independent author/reviewer runs
and publication every 100 eligible lessons. The post-release snapshot has 103
accepted, 36 blocked and #736 in authoring; unavailable Premium content remains
blocked and in scope. [Snapshot](releases/first-100-20261025/campaign-after-release.json).
This milestone does not complete the all-Hard goal.

**Next repair:** a separate non-scored review confirmed #239's related-link labels
misdescribe #10/#42. This is an actionable navigation advisory, not a new
substantiated core-algorithm failure or an automatic rewrite of acceptance.
[Follow-up report](239-review-related-links-20261025.md) specifies truthful #84/#327
links and requires a new candidate, actual rendered link checks, and ordinary
independent review at a subsequent repair boundary. It remains open and must not
be lost while the campaign continues.
