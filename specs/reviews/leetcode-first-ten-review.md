# First ten Hard lessons: two-round review and iteration

Date: 2026-10-17. Reviewer: implementing Codex agent, self-review; no independent
reviewer or human learner test is claimed. Criteria were frozen in
[the plan](leetcode-first-ten-plan.md) before implementation. The existing
novice rubric informed the checks; no numeric teaching score is invented.

Selection: ascending frontend problem ID filtered to Hard. Official statements
and constraints were opened for all ten problems. Links and input requirements
are preserved in each problem's BRIEF. The original 2916 lesson remains intact.

## Round 1 — mechanism and trace consistency

Walked the authored reader sequence and inspected trace controls, then reviewed
code and independent oracle results. The algorithm results passed, but these
teaching/state issues required changes:

| Finding | Iteration | Evidence |
| --- | --- | --- |
| Median search range was still the old range after the caption said to move it | Update lo/hi before snapshot; explicitly identify retained cuts as just-tested candidates | Per-frame assertions check `lo=i+1` or `hi=i-1` |
| Reverse-list snapshot rewired next but still reported prev/curr from before advancing | Snapshot after the whole displayed operation; retain a separate changed-node identity | Per-frame `prev=changed`, `curr=nxt`, plus final identity and cycle checks |
| Water was accumulated while pointers still described the pre-operation position | Advance before snapshot; describe maxima refresh at the next operation | Per-frame pointer assertions and settled-depth oracle |
| Sudoku board alone could hide an incomplete undo of constraint sets | Show row/column/box used sets; label candidates as the set at entry | Compare all displayed sets against the actual frame board; first undo at event 12 |
| Jumping directly into experiments lost the local invariant | Repeat the relevant invariant at the experiment entrance | Both languages at step 2; local symbol definitions retained |
| Browser test assumed every reset has a next operation | Select an explicit nonterminal preset for the language-state check | Empty merge input legitimately disables Next; all-empty cases remain tested |

No Python result error was found. Independent checks cover both output values
and mutation contracts, rather than treating a sorted value list as proof of
linked-node reuse.

## Round 2 — visual semantics, language, boundaries, and transfer

Inspected every lesson's 390px experiment capture and focused states in both
languages. Repeated controls, prediction states, keyboard input, copying, and
cross-lesson navigation after the round-1 changes.

| Finding | Iteration | Closure evidence |
| --- | --- | --- |
| Cyan active-column background looked like water above a dry bar | Make active-column background transparent; indicate activity under the column | Browser checks require zero water blocks and transparent active background on a dry event; [water frame](first-ten/42-en-390.png) |
| Frequency dictionaries and stack values inherited meaningless generic storage indices | Suppress secondary indices where they are not input coordinates | [word multiplicity frame](first-ten/30-zh-390.png); stack values remain explicitly input indices |
| Every prediction had its correct choice first | Use a fixed, question-specific option rotation; rotate explanations with it | All options exercised; selection and revealed state survive language switch |
| Generic state/output headings implied literal Python variables and mixed node/index roles | Name diagram indices explicitly; give merge and substring their own output labels; define dummy −1 | Bilingual label inspection and [pointer frame](first-ten/25-en-390.png) |
| Heap initializer used sequential insertion while the displayed snippet said heapify | Use bottom-up heap construction in the model | Heap invariants, output oracle, and complexity/source alignment |
| Tall element screenshots included a sticky overlay inside the capture | Capture focused diagrams and verify actual anchor geometry separately | Keyboard/deep-link browser check confirms target heading is below sticky navigation |

## Reader walkthrough outcomes

These are reviewer reconstructions, not measured learner outcomes.

| Lesson | What the interaction makes visible | Fresh prediction / boundary reconstructed |
| --- | --- | --- |
| 4 | Tested cuts, cross boundaries, and the remaining search range | `[2,6]` and `[1,3,4,5]` give 3.5 at cuts 1,2 |
| 10 | A star cell depends on two-left or guarded above | `a*b*` matches `ab`; `a*` does not |
| 23 | Only heads compete; emitted identities persist while one source advances | After popping list 0's 2 in `[[2,7],[2,3]]`, list 1's 2 is next |
| 25 | A next edge changes while IDs and values stay fixed; prefix reconnection is separate | Equal-valued #0/#1 must exchange identities; short suffix stays |
| 30 | Word count becomes excessive, left removals restore quotas, other offsets find missed starts | `aaaaaa` with two `aa` words starts at 0,1,2 |
| 32 | An invalid close resets the boundary; matched closes expose a contiguous suffix | `())(())` has longest length 4, not 6 |
| 37 | Candidate exclusion, attempts, and explicit undo of board plus all sets | A dead end requires clearing all four representations |
| 41 | Each useful swap permanently fills a value's destination | `[2,2,1]` must stop equal-value swapping; answer 3 |
| 42 | Settled water accumulates as one endpoint becomes provably determined | `[4,1,3]` stores depth 2 above the middle bar |
| 44 | A standalone star depends on one-left or above; full table explains rolling rows | `a*` matches `ab` here, unlike regex |

Focused captures: [4](first-ten/4-en-390.png), [10](first-ten/10-en-390.png),
[23](first-ten/23-en-390.png), [25](first-ten/25-en-390.png),
[30](first-ten/30-en-390.png), [32](first-ten/32-en-390.png),
[37](first-ten/37-en-390.png), [41](first-ten/41-en-390.png),
[42](first-ten/42-en-390.png), [44](first-ten/44-en-390.png).
Each also has a `-zh-390.png` companion captured with the exact same state.
Regenerate with `leetcode/tests/review_hard_states.cjs` and a running local server.

## Verification evidence

- Python: **41,016** checks, including exhaustive small cases, seeded random
  oracles, linked-node identities/no cycles/unchanged values, Sudoku row/column/
  box/givens validation, and maximum-size cases for all variable-size problems.
- JavaScript: **102,757** result and intermediate-state checks across all ten
  models, including DP prefix truth, heap order, settled water, monotone fixed
  slots, pointer timing, Sudoku sets, and immutable prior snapshots.
- Exact source parity: all ten displayed bundles match `solution.py`; browser
  downloads match too. Offline file opening needs no fetch for data or code.
- Chromium: **788** explicit checks plus assertions, all presets in both locales;
  320/390/736/1440px; rewind/forward/reset/endpoints; every prediction option;
  language-preserved state/focus; keyboard range and button operation; sticky
  deep links; denied clipboard/storage; offline pages; no console/page errors.
- Existing 2916: 3,579 complete-input cases, 3,200 overlapping range updates,
  four Python test groups, and its complete browser regression passed. Its
  collection test now selects the 2916 card explicitly rather than assuming the
  collection contains exactly one card.
- Repository diff whitespace check passes. The authoring generator is separate
  from the dependency-free static runtime; Python is the canonical code source.

## Evidence limits

This is a two-round implementation self-review with computational and real
Chromium evidence. Independent teaching review, actual novice teach-back, and
LeetCode submission acceptance remain unmeasured. Sudoku's view intentionally
shows a bounded prefix and labeled final jump; heap frames show completed
operations rather than internal swaps. Neither is presented as an unabridged
execution trace.

Reusable findings are now requirements in
[the new Hard trace spec](../leetcode-hard-traces.md).

## Publication and final closure

Published implementation revision: `09d84e9` (2026-10-17). The deployment target
was verified live before publication: Pi `visual-site.service` active, serving
`/home/songyy/projects/visual-site` on loopback port 18513, matching this repo's
README. No machine-local deployment contract exists in this checkout; the
README route was corroborated by service state and served bytes.

The release checked both existing collection files against their previous Git
revision before any mutation, and required every new destination to be absent.
All 55 candidate files were staged and hashed. Dependencies and lesson files
were installed before the collection registry and index. No unrelated files
were removed or replaced. A guarded rollback manifest, old files, and rollback
script remain on Pi at `/home/songyy/backups/visual-site/hard10-09d84e9/`.

Public verification against `https://visual.integ.life`:

- 55 exact SHA-256 resource matches, plus the collection and ten normal slash
  lesson routes, all HTTP 200 using curl.
- The full 788-check new-lesson Chromium suite passed on the public origin,
  including both languages, all mobile/desktop widths, downloads, predictions,
  keyboard input, and fallback paths; no browser errors.
- The original 2916 browser suite also passed on the public origin, including
  navigation from the root index through the enlarged collection.
- Python urllib received HTTP 403 on the initial public fetch attempt; curl and
  Chromium succeeded. Verification claims above refer to those successful
  clients, not the failed urllib request.

The following documentation-only commit records this evidence; it does not
change the published implementation. Task-owned local preview service on port
18768 was stopped after public verification.

## Review-status clarification — 2026-10-18

This report remains evidence of author self-review and technical/public checks.
It does not satisfy WORKFLOW's separate-run independent teaching-review gate.
The independent-review status of each of 4, 10, 23, 25, 30, 32, 37, 41, 42, and
44 is pending. The original observations and publication history above are
unchanged. Apply [the clarified review gates](../leetcode-review-gates.md) to a
frozen current candidate; no new audit or deployment occurred in this spec edit.
