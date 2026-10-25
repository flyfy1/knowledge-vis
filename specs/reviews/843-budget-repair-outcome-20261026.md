# #843 budget repair: round 2 outcome archive

**Changes required; not accepted.** The exact independent review closed
`843-BUDGET-R1`, but required finding `843-R2-SELECT01` prevents acceptance despite
97.5/100. This is a read-only outcome archive, not another review or publication.

## Identities and preserved history

- Candidate: `f6e2500dc87fe0a50a3258af80bf46d761ca1be8`.
- Reviewer run: `843-review-9015ddd39953`; session
  `01a174fa-7e25-7373-9809-3ca749b33d82`.
- Review commit: `c71cac9683d6569fd3d2c593ce8e271b5a229d0e`.
- Candidate and review lesson tree, unchanged:
  `0d3aec9369df854cd6304ddd73fa78bb42417a24`.
- Canonical SHA256:
  `51f9e29c91ca3ffe6238f13dfa0f0b632081274be4747ac67cfbf627b986dc05`.

The [original report](843-budget-repair-outcome-20261026/843-review-2-4d2abc1d.md),
[final result](843-budget-repair-outcome-20261026/review-final.json), run record,
compressed event stream and handoff receipt are archived. The final result equals
both the completed run result and recorded round-2 fields. The actual native
reviewer PID1701800 was observed while this session ran; terminal events and the
completed state now establish completion. No agent was interrupted.

The first review record remains exactly equal to the prior acceptance archive:
round1, 97.5, accepted against `617cb7c7e49f533b46c66dc9a53e7c6cefd71cbf`.
Its original report bytes also retain their prior SHA256. This historical
acceptance is not reused for the repaired candidate. The
[snapshot](843-budget-repair-outcome-20261026/snapshot.json), captured at
2026-10-25T21:38:13 UTC, records round2 changes_required and the ordinary next fix
`843-fix-081c2d94c98e` already running. It makes no claim about that later fix's outcome.

## Budget finding closure

The report explicitly closes `843-BUDGET-R1` against this candidate. The canonical
source replaces the artificial ten-iteration cap with `while candidates`, still
using the official words/master-only callable and returning only after an actual
reply6. There is no private budget getter. Each failed minimax probe strictly
shrinks candidates; at a singleton the candidate wins the membership tie and must
actually be guessed. The justified bound is G≤n, not universal success within a
case's 10–30 allowance. Both locales retain the heuristic qualification.

The review's exact-source [spy evidence](843-budget-repair-outcome-20261026/review-evidence/green.json)
is non-diagnostic and hashes to the candidate canonical source:

| Family | Judge budget | Actual successes | Maximum calls |
| --- | ---: | ---: | ---: |
| 20 words | 10 | 20/20 | 10 |
| 22 words | 11 | 22/22 | 11 |
| 24 words | 30 | 24/24 | 12 |

Official four/two-word and singleton controls also pass. Archive validation
independently recomputed each retained trace's positional reply, legal nonrepeated
call count, budget bound and final actual guess/reply6 from the saved rows. This
checks recorded evidence; it is not another execution of the candidate.

The [browser budget evidence](843-budget-repair-outcome-20261026/review-evidence/budget-browser-results.json)
covers EN/ZH at320/1440: ten calls leave known but unguessed bmmmmm; call11 succeeds;
the deliberately infeasible budget10 simulator ends exhausted and unsuccessful.
Back/replay and locale preservation are recorded. The simulator's disclosed
secret/budget is explicitly separate from the official Python callable. Source,
mirror, displayed/exported/downloaded text and fresh-sentinel native clipboard
parity passed in the review. This archive independently verifies mirror bytes and
Python parameter names without using the clipboard or browser.

## Required finding still open

**843-R2-SELECT01:** English selected scenario text clips at320/390 normal zoom.
The budget10 control hides the essential budget value/control purpose; another
budget11 label truncates the secret at320. The reviewer measured text width and
inspected settled screenshots, with Chinese and desktop controls. The archived
[320px evidence](843-budget-repair-outcome-20261026/review-evidence/en-320-preset8-settled.png)
was additionally viewed during this archival task and visibly ends at
“22 words · infeasible budge”. This is a control-readability defect, even though
the surrounding budget trace behaves correctly.

The required follow-up is shorter equivalent labels or a wrapping complete
selection readout, then a fresh candidate/review at320/390 and locale roundtrip.
No fix is prescribed or implemented by this archive. Historical optional
`843-R1-A01` extreme narrow zoom fragmentation remains advisory, not closed.

## Coverage and limits

The reviewer reports1,211 canonical cases,3,068 core frames,87 localization pairs,
a separate cold walk and independent raw-list bucket oracle, all nine presets,
rewind/reset/prediction checks, source transfer and native Linux clipboard fallback.
The numerical/budget/browser/focused JSON files are retained. Eight relevant PNGs
are copied; the snapshot inventories SHA256 and size of every original review
evidence file at the immutable review commit, distinguishing copied files.
Early dense-table screenshots were taken before settling; the report explicitly
uses later settled captures. Passing automated harnesses did not override the
visually observed label finding.

Linux Chromium only. No human-comprehension study, physical device, browser-menu
zoom, online LeetCode submission or public-delivery verification is claimed.
Live statement and saved author-origin Python selector evidence remain distinct.
The archive ran identity/recorded-trace checks and viewed an existing PNG; it did
not rerun browser tests, change runtime state, create/remove STOP, restart an agent,
commit, push or publish. [Validation and hashes](843-budget-repair-outcome-20261026/validation.json)
bind the captured evidence. The handoff receipt records its own earlier completion
(`completed-fresh843fix-running`), not acceptance of this later review.
