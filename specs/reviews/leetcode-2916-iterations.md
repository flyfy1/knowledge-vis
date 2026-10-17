# LeetCode 2916: two-round improvement record

Date: 2026-10-17. Goal: make the derivation reconstructable for a reader with
basic Python and algebra but no segment-tree or lazy-propagation experience.
Reviewer: Astra, independent of implementation. The
[rubric](leetcode-2916-rubric.md) was defined before the first source review.

## Baseline

Revision `20aaf3e`, [round 1 report](leetcode-2916-round1.md): 73.75/100,
revision required. Independent checks found no mathematical or Python defect.
Three instructional bridges blocked acceptance; test correctness did not close
those teaching gaps.

## First implementation iteration

| Finding | Change | Observable evidence |
| --- | --- | --- |
| B1: tree decomposition is unexplained | Add interval-only, zero-state primer; show exact whole-block covers for `[0,3]` and `[2,4]`, node IDs, and partial-overlap decisions before introducing tags | Selected boxes `[0,2]+[3,3]` and `[2,2]+[3,4]` visibly change with the target; helper checked independently |
| B1: request and stale-child cause are missing | Include target and node ID in every event, place r/x/p/target beside the change table, explain that push preserves actual counts and show the wrong result from skipping it | At push: stored leaf 1 becomes 2 while actual counts stay unchanged; next +1 must produce 3, not 2 |
| B2: full Python arrives without a bridge | Lead with outer-loop skeleton; map quantities, node IDs and both kinds of bounds; trace `add(1,0,4,2,4)`; explain capacity; show operation-specific Python before the complete expandable solution | Diagram # IDs match call trace, request bounds stay fixed while node bounds shrink, snippets match submitted implementation |
| B3: saved work is not visible | Expose baseline, add individual-update work readout and all-distinct quadratic count, explain full-block stopping and at most two partial boundary blocks per level | All-distinct example shows 1,2,3,4 modified entries; partition preview shows two aggregate blocks instead of individual starts |
| P2: symbols depend on earlier sections | Add local d/r and p/F reminders in tree and verification steps | Jumping to a section retains definitions of its reported quantities |

Validation: existing 3,579 numerical-core cases, 3,200 overlapping updates,
Python tests, source equivalence, bilingual placeholders, and browser paths
passed. Added exact partition checks and browser interactions for both target
ranges. Browser checks cover 320/390/736/1440px, both languages, backward state,
storage and clipboard fallback. Python's solution and recurrence are unchanged.

## Second review and implementation iteration

Candidate `c83fb52`, [round 2 report](leetcode-2916-round2.md): 86.25/100 under
the unchanged rubric. The three original instructional blockers were closed;
acceptance was conditional on two precision/state corrections, with one
predict-before-reveal exercise recommended as the highest-value final change.

| Finding | Second-iteration change | Check |
| --- | --- | --- |
| Chinese lazy definition incorrectly says parent | Change it to current node, matching the invariant and English | Inspect mapping in both locales |
| Initial banner and context mix completed/next round | Explicitly label the initial context as the completed round; keep next request in banner | Initial frame context says completed; later events keep their own target |
| Worked examples reveal the answer before prediction | Add a fresh `[1,3]` target to the same primer; neutral nodes before a choice and explicit reveal; derive extra/missing-index feedback from chosen blocks | Before reveal no full/partial highlights; wrong options explain extra 0 or missing 3; correct option covers 1,2,3 exactly |
| Extra snippets increase working memory | Keep operation-specific Python optionally expandable | Actual-d comparison no longer requires scrolling past expanded code |

Regression checks passed for the numerical model, unchanged Python, translation
placeholders, all browser controls and both languages at 320/390/736/1440px.
Added tests for all prediction outcomes, clearing revealed feedback when the
choice changes, retaining the revealed result on language change, and actual-d
invariance across push.

## Focused round-2 closure and publication

Astra checked the exact final fixes on candidate `29f91d2` and appended its
evidence to [the round-2 report](leetcode-2916-round2.md). Final score:
**87.5/100, accepted for publication**. All original and follow-up blockers
from the two reviews are closed. This was a focused closure within round 2,
not a third broad audit. The score is expert reviewer assessment; actual novice
teach-back evidence remains uncollected.

The six changed public files were staged, hash-checked against both the deployed
baseline and candidate, and published through the existing Pi static service.
Rollback files are at `/home/songyy/backups/visual-site/astra-29f91d2` on Pi.
The reviewed code is revision `29f91d2`; subsequent review-record commits do not
change the public implementation.

After publication, all 12 checked public entry/assets returned exact candidate
bytes. The complete browser check passed against `https://visual.integ.life`,
including the fresh prediction's wrong/correct paths, both languages, mobile
layouts and existing collection-to-lesson navigation.
