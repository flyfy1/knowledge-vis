# All Hard lessons: independent design review

Date: 2026-10-18. Reviewer: separate design-review agent `/root/design_review`.
Scope: product fit and expansion design, not lesson acceptance or implementation.
Dispatcher adjudication: recorded in the final section on 2026-10-18.
The independent recommendations below are retained unchanged; adopted and deferred
decisions, reasons, and validation duties are appended separately.

## Verdict and useful outcome

**Reuse and extend the existing LeetCode collection.** The reader knows basic
Python and wants to reconstruct an unfamiliar algorithm, predict its behavior,
and transfer it to executable Python. The smallest useful delivery is a small
independently accepted batch that completes this learning loop. The occasion for
validation is a cold walkthrough with an unseen example, not generation of a
page, a passing final answer, or a larger catalog count.

Keep `/leetcode/<id>/`, the collection entry in the knowledge index, shared
locale, Python source/download parity, and concept links. Existing collection
ownership is clear from `pages.config.js`, the authoring specifications, and the
served collection. No separate product, account system, execution backend, or
progress-sync platform is justified. This review inspected this repository's
product ownership; it did not perform an exhaustive sibling-repository audit.

Ascending official frontend ID is a sensible production queue, **not a learning
prerequisite order**. Preserve direct lookup by ID and concept links. Do not
describe this order as popularity, interview relevance, or pedagogical ranking.

## Evidence inspected

- `WORKFLOW.md`, `UI-I18N-SPEC.md`, `specs/leetcode-explainers.md`,
  `specs/leetcode-hard-traces.md`, and `specs/leetcode-review-gates.md`.
- Collection registry and renderer; shared locale; the first-ten generator,
  trace renderer, CSS, and browser-check implementation.
- The public [collection](https://visual.integ.life/leetcode/) exposed 11 lesson
  entries during this review. The public [Sudoku lesson](https://visual.integ.life/leetcode/37/)
  initialized with bilingual control labels, event 0/180, a disabled rewind
  endpoint, the board, and the explicit omitted-event teaching notice.
- Official first-batch statements were opened: [51](https://leetcode.com/problems/n-queens/),
  [52](https://leetcode.com/problems/n-queens-ii/),
  [60](https://leetcode.com/problems/permutation-sequence/), and
  [65](https://leetcode.com/problems/valid-number/). All four currently identify
  themselves as Hard. This does not verify completeness of the full catalog.
- Local shared CSS was 9,425 + 3,909 = 13,334 uncompressed bytes. The first-ten
  core and renderer were 18,341 and 8,794 bytes. These are current source sizes,
  not performance or production-byte parity measurements.

The live observation was a design sample, not an exhaustive control test, mobile
audit, frozen-candidate review, or source-to-public hash check. No lesson receives
independent teaching acceptance from this document. Existing unrelated working
tree changes were left untouched.

## Recommendations for adjudication

| ID | Priority | Recommendation and reason | Observable acceptance |
| --- | --- | --- | --- |
| D1 | P0 | Define “all current Hard” as a dated official-catalog snapshot with source, scope/category, fetched time, and verified count. An expanding external catalog cannot have an undated permanent completion claim. | Complete pagination, unique official IDs, stable counts or reconciled drift, and a retained source snapshot; missing pages or failed refreshes are explicit. |
| D2 | P0 | Keep catalog inclusion, lesson readiness, review outcome, and public delivery distinct. Availability is not independent acceptance. | Every catalog record has an honest status; accepted and published totals derive from records with linked evidence. No blank lesson routes or working-looking links for unbuilt pages. |
| D3 | P0 | Reuse the five-part shell as a default, not a fixed limit or universal optimization story. The explainer specification explicitly allows the shortest sequence that exposes actual reasoning. | Each BRIEF justifies its causal sequence; #65 teaches grammar and valid final states without claiming a fictitious asymptotic improvement. Extra steps are allowed when needed. |
| D4 | P0 | Fix generator ownership before adding batches. `hard-first-ten/build.py` rewrites the registry from its ten lessons plus a specially extracted #2916 block. Re-running it can remove later registrations. | A generation dry run preserves every unrelated lesson and registry record; stable deterministic output and source parity hold. No concurrent writer owns the registry or shared runtime. |
| D5 | P0 | Keep per-lesson independent review and reproducible candidate identity. A shared renderer is not evidence that different algorithms are understandable. | Fresh reviewer run, frozen candidate, cold walkthrough, six-dimension rubric, independently chosen example, required-finding closure, and candidate/deployed revisions for each lesson. |
| D6 | P0 | Reuse controls and locale, while keeping algorithm state and diagrams truthful and local. | A lesson's transition, rewind, visualization, and Python mapping agree; omission and snapshot-storage costs are explicitly distinguished from solution behavior. |
| D7 | P0 | Avoid a full catalog of long cards. Keep actual lessons easy to find, with ID/title search and a compact full-catalog status view. | Search works for numeric ID and both titles; status is text, counts are accurate, zero results has a clear reset, and unbuilt entries retain an official link. |
| D8 | P0 | Apply the current accessibility contract to touched shared UI; existing CSS is not blanket approval. | 48px controls, readable disabled states, measured contrast, keyboard/focus, forced colors, 320px/200% zoom, both languages, and non-color state meaning are recorded. |
| D9 | P1 | Add topic filtering or prerequisite routes only where the catalog demonstrably needs them. | A reader can locate a desired concept without losing ID lookup, current search, locale, or focus. |
| D10 | P2 | Consider optional decoration only after learning and delivery evidence passes. | No essential information depends on animation; no ambient loops, external assets, or additional runtime polling. |

## Catalog and completion contract

Preserve official frontend ID as displayed, slug, title, difficulty, category,
access restriction, source URL, verification time, and catalog snapshot identity.
Use a separate numeric sort key only where the frontend ID is numeric. Do not
guess IDs from list position or silently drop unusual identifiers. Distinguish
official Chinese titles from authored translations when official text is absent.

Record the target universe explicitly. “All Hard” must not quietly become “all
free algorithm questions with convenient Python interfaces.” Category-specific
problems may not have a Python submission interface. Preserve those records and
mark the issue; a Python teaching adaptation must not be represented as an
official submission solution. Restricted or unreadable statements remain counted
with a source/access blocker until their contracts can be verified. This review
does not authorize a narrower target universe.

Use the existing review stages, plus an explicit not-started catalog stage and
separate blocker reason. Track author run, candidate revision, reviewer run,
report/findings, accepted revision, deployed revision, and verified public time.
Avoid one overloaded status that loses the fact that a previously deployed
lesson has a newer draft or pending review. The first ten currently have an
explicit independent-review gap in the repository gates; preserve that fact.

A catalog refresh should produce a reviewable diff. Preserve removed or
reclassified lessons and stable routes; record their status against the new
snapshot. A failed refresh retains the last verified snapshot and its date.
Never convert a partial response into a smaller authoritative denominator.
Completion means every record in the declared snapshot meets its stated delivery
contract, with no excluded blockers hidden in the percentage. A new snapshot is
a new reconciliation, not retrospective rewriting of prior evidence.

## Module design and scaling

The shared controls/locale module earns leverage: deleting it would duplicate
endpoint handling, bilingual state preservation, clipboard fallback, and focus
behavior across lessons. Preserve that depth. The algorithm module should expose
a small interface for input, deterministic frames, results, and its visual
meaning. Its interface includes event timing, bounds, omission semantics, and
error behavior; field names alone are insufficient.

The existing renderer has algorithm-shaped branches, including a Sudoku-specific
`board` interpretation and fixed 3-by-3 styling. A queen board cannot safely reuse
that interpretation merely because both contain cells. Add the minimum concrete
adapter at the existing seam for an actually different view. #51 and #52 provide
two real consumers for shared queen constraint logic; their outputs and learning
tasks still differ. Do not design a universal algorithm visualization language.
The deletion test should show that any shared module removes duplicated reasoning
or control complexity rather than becoming a pass-through abstraction.

Keep per-lesson code and data load local. Do not grow the first-ten monolithic
core into a bundle containing every future Hard algorithm. Tests should use the
same public input/frame interface as consumers, backed by independent oracles.
Shared changes identify affected state paths and lessons; they do not imply
repeating every unchanged lesson review or accepting every lesson by sampling.

Trace generation must have a bounded teaching-input contract. Limiting stored
frames alone does not bound a factorial/exponential computation on the UI
thread. Prefer small complete demonstrations; visibly identify omitted search
regions if larger examples are retained. Maximum-constraint Python verification
belongs outside interactive rendering. Report solution auxiliary storage,
returned output size, and tutorial snapshot storage separately.

## First new batch: distinct learning obligations

| Problem | Necessary observation | Counterexample / boundary | Duplication and implementation pitfall |
| --- | --- | --- | --- |
| 51 | Place, reject a conflicting column/diagonal, descend, undo, and retain each completed board. Define `r-c` and `r+c` locally. | n=1; n=2 or 3 gives no solutions; n=4 gives two boards; undo restores every constraint set. | Explain distinct boards and output construction. Do not show only the first solution or copy Sudoku's boxes/givens semantics. |
| 52 | Same legal search, with a count increment only at a complete placement; retain a visible solution/leaf ledger. | n=1; no-solution cases; n=4 count 2; no increment for a merely legal partial row. | Reuse actual search mechanics without publishing a duplicate explanation. Explain why a counter replaces retained boards and why distinct reflected boards are still counted. |
| 60 | Show equal factorial blocks, the zero-based remaining rank, chosen index, removed digit, and remainder together. | k=1; k=n!; n=1; exact factorial-block boundaries. | Convert k to zero-based once. Python list removal gives O(n²) overall; do not call the full implementation O(n) simply because it emits n digits. |
| 65 | Show character class, allowed transition, consumed prefix, and final accepting/nonaccepting state or equivalent explicit flags. | `.`, `e`, `1e`, `1e+`, `4.`, `-.9`, uppercase E, and invalid decimal exponent. | Distinguish incomplete prefixes from invalid input. Python numeric conversion accepts a different language; do not use it as the grammar oracle. Teach correctness rather than invented speed gains. |

Independently verify current constraints and submission interfaces in each
BRIEF. A baseline must be conceptually independent enough to catch the intended
mistake, not another transcription of the same transition logic. Give every
lesson a fresh prediction question with plausible misconception-based answers.

## Lifecycle, recovery, and accessible navigation

The catalog is static; avoid adding loading/reconnect states unless a new fetch
actually exists. Applicable states are unbuilt, available, review pending,
blocked, no filter matches, missing script/data, and unavailable storage. Provide
localized recovery: clear filters, official problem, retry/reload where useful,
and preserved last verified catalog data. Do not claim background work continues
without an actual running task or schedule.

Lessons retain start/end disabled controls, reset, complete rewind, explicit
prediction reveal, changed-answer feedback clearing, and clipboard denial
fallback. Locale changes preserve preset, position, prediction, disclosure
state, and useful focus. Replacing large catalog DOM trees must not unexpectedly
reset search or lose focus. Related links should land on an explanation, not an
unbuilt entry. New matrix/graph views need textual equivalents and meaningful
row/column labels, not only an image label saying what the colors mean.

Re-use exact existing color tokens, then document any required role additions.
Current controls include 44px minimums and disabled opacity 0.4; these require
measurement/revision under the 48px and readable-state skill contract for touched
surfaces. Audit focus contrast and clipping rather than treating a 3px rule as a
passing rendered result. Keep total per-page shipped CSS under 25,000 bytes,
system fonts, local assets, and reduced-motion behavior.

## Highest-return slice and deferred work

The highest-return 20% is: verified catalog inventory, truthful coverage states,
non-destructive generation, four genuinely distinct lessons, and independent
review/public delivery evidence per accepted lesson. This establishes a safe
repeatable learning loop before scaling the queue. It is a first delivery slice,
not a redefinition of the requested all-Hard outcome.

- **P0 done:** D1–D8 adjudicated and satisfied; the first batch has complete
  lesson evidence; catalog totals and links reconcile; release verifies the
  accepted files. A failed lesson remains pending while an accepted subset may
  ship with its exact scope stated.
- **P1 done:** useful navigation refinements validated against the larger
  catalog; any old review debt has separately recorded closure rather than
  inherited acceptance from new work.
- **P2 done:** optional visual work has evidence that it helps reading or
  understanding and preserves the agreed lifecycle/size constraints.
- **Deferred:** accounts/cloud progress (no demonstrated need), universal trace
  schema (insufficient real consumers), browser Python execution (adds an
  unnecessary runtime), learner mastery claims (no novice transfer evidence),
  live catalog polling (dated build-time refresh suffices), and automatic
  animation (no learning benefit demonstrated). Revisit only when a concrete
  learner need and measured evidence justify their complexity.

## Remaining evidence and dispatcher duties

The dispatcher must freeze the catalog definition, decide D1–D10 explicitly,
assign registry/runtime ownership, and record the initial batch scope. A bounded
batch queue with durable per-lesson evidence permits interruption and resumption
without restarting accepted work. A reviewer should consume only the frozen
candidate and rubric for the cold walkthrough; provide the BRIEF and author
claims afterward for the source audit. Different lessons may not inherit a
shared score or one reviewer's unobserved approval.

Still unverified here: full official catalog completeness, new lesson code,
rendered contrast, keyboard/forced-colors/mobile/zoom behavior, browser capacity,
new public asset parity, Pi deployment state, and actual novice learning. These
remain the appropriate implementation/review/release gates, not assertions made
by this design review.

## Dispatcher plan received before adjudication

The dispatcher reports a verified catalog of 984 Hard records, including 195
premium records. This is dispatcher-provided evidence; this reviewer did not
independently repeat that catalog verification. The proposed next phase uses a
finite sequential queue on an isolated Pi branch, separate author and reviewer
`codex exec` runs per problem, durable progress/resume and a stop file, with no
scheduler and no deployment. Unavailable statements and unsupported Python
interfaces remain explicit blockers. Authors own only their problem files;
registration is deterministic and occurs after acceptance. Prove one actual
lesson plus its independent review before continuing the remaining queue.

This plan is consistent with the design recommendations. A small durable queue
runner is justified by the concrete 984-record workload; the objection to a
speculative framework applies to universal teaching/visualization abstractions,
not orchestration needed for this workload. Require process-exit/error capture,
candidate freezing, no registration on partial output, and resumable finding
closure. A file saying “accepted” without a passing independent report is not
an acceptance signal. Under the no-deployment phase, report authored,
self-checked, and independently accepted counts separately; published counts do
not increase. Public verification remains a later release gate.

## Dispatcher adjudication — 2026-10-18

Recorded by Codex after the independent review, before lesson implementation.

- D1–D6 adopted: freeze the verified 984-record catalog, retain category/access
  blockers, distinguish candidate acceptance from delivery, adapt the teaching
  sequence, merge registry entries non-destructively, and require fresh review
  for each problem. A finite sequential Pi queue uses an isolated `codex/` branch;
  it never deploys or changes production. Its agents own only the current lesson.
- D7 deferred for the development-only phase: do not publish a 984-card placeholder
  catalog. The current collection keeps real entries; queue status remains in a
  durable execution ledger. Before releasing a large accepted batch, add and
  independently review ID/title search and compact status presentation.
- D8 adopted for every touched lesson: inherited styles must be measured. Local
  overrides may raise controls to 48px and restore disabled/focus contrast.
- D9–D10 deferred: topic routes and decoration add no value to proving the first
  development/review cycle. Reconsider after a usable accepted batch exists.
- Start with #51 to exercise new development, then ascending catalog ID including
  existing review debt. #51 and #52 have separate reviews even if mechanics are
  reused. One accepted run proves queue behavior, not quality of later lessons.
- All 984 records stay in scope. Database/Pandas and JavaScript contracts are
  verified individually. If a faithful Python submission interface is unavailable,
  record a language-contract blocker; never relabel an adaptation as an official
  solution. Unreadable premium statements similarly remain visible blockers.

Validation duties: exact candidate identity, fresh run IDs, meaningful independent
browser and oracle evidence, source parity, no registration on partial output,
no process continuing after a tool/auth failure, and restart/stop behavior.
No reviewed score or publication is implied by this adjudication.

## Dispatcher amendment — explicit owner language decision, 2026-10-18

The owner chose original JavaScript plus a Python conceptual comparison for all
six JavaScript-category Hard problems (#2630, #2650, #2675, #2691, #2756, #2759).
This supersedes the earlier Python-interface blocker for those six only. Adopt
the exception without changing the approved page structure or review thresholds.
Both locales must distinguish the submittable JavaScript solution from the
Python teaching adaptation; verify each source mirror/download and explain
semantic differences. Unverifiable statements or original interfaces remain
blockers. Other lessons retain Python (including verified Pandas interfaces).
This is an owner-authorized language-policy amendment, not a new independent
review or a retrospective acceptance of any lesson.

## Dispatcher amendment — sustained goal and release cadence, 2026-10-18

The owner now requests Python or TypeScript where faithful official interfaces
exist, otherwise the original required language; detailed vivid explanations
from simple examples to the complete method; and publication after each 100
completed lessons without retaining old served content. Adopt these explicit
preferences prospectively. The prior generic Python-only blocker is superseded,
and future six-category JavaScript lessons use supported TypeScript when possible.
Retain their clearly labeled Python conceptual comparison and semantic limits.

Keep each independent cold review and all scoring gates. Add a batch publisher
with a separate release ledger and public verification at clean accepted phases;
this does not grant author or reviewer agents production access. Preserve other
production pages, publish no drafts, and create no old-content backup copies.
The final remainder is released when all work actually meets the gates. The search
feature required before a large public batch is now independently reviewed in
[the collection search record](leetcode-collection-search-design.md). This amendment records owner direction, not independent
approval of publisher code or future lessons.
