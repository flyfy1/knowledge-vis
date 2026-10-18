# LeetCode explainer specification

## Product contract

The reader should be able to reconstruct an algorithm, explain why it is
correct, and implement it in Python after working through the lesson. A moving
diagram and a correct final answer alone do not establish that learning outcome.

The first complete path is: knowledge index → LeetCode collection → problem
2916 → hand calculation → optimization → Python → independent verification.
Future problems use the same path. Do not add accounts, a code execution service,
progress synchronization, or a general algorithm framework without a concrete
lesson that needs them.

Use **Python** for a faithful official solution interface by preference; otherwise
use supported **TypeScript**, then the original problem's required language.
Verify the official language/interface evidence and save a lesson-local language
contract for every nondefault choice. Explain why a preferred language cannot
faithfully implement the original interface before falling back, or record the
explicit owner choice for the exact-six JavaScript exception below. Do not translate
away database, object identity, async scheduling, cancellation, or other runtime
requirements. A browser simulation is separate from execution of the solution.

For the six JavaScript-category Hard problems (#2630, #2650, #2675, #2691, #2756,
#2759), retain the requested Python conceptual comparison, explicitly labeled in
both languages as a teaching adaptation with semantic limits. The owner explicitly
chose the original **JavaScript** solution for these exact six, even if an official
TypeScript interface is available. This narrow exception overrides the general
language preference; all other problems retain Python > TypeScript > required native. Never call the comparison an equivalent official submission. Do not
claim LeetCode acceptance without an actual submission result. UI and prose follow
`../UI-I18N-SPEC.md` with the shared `knowledge-lang` preference.

References below to Python mean the canonical solution language for approved
non-Python lessons. The original callable/query contract, tests, complexity and
source-display-download parity apply equally. Validate TypeScript compilation
and execute its emitted JavaScript; SQL and other native solutions need real
execution against representative fixtures in the corresponding runtime.

For a nondefault interface, `language-contract.json` records `problemId`,
`language`, exact `officialSource`, normalized `supportedLanguages`, `interface`,
`rationale`, timezone-qualified `verifiedAt`, and a lesson-relative
`verificationEvidence` file. Supported languages here mean faithful original
submission interfaces; explain any distinction from a mere conceptual adaptation.
The independent reviewer checks this evidence against the official source.
Canonical offline mirrors use the source/export pair in the registration policy
and contain the exact JSON-encoded source string, not a separately edited copy.

## Review authority

Follow [WORKFLOW](../WORKFLOW.md) and the mandatory
[review and release gates](leetcode-review-gates.md). Author self-checks,
independent oracles, independent teaching review, and public verification are
separate evidence. Self-review never substitutes for independent acceptance.
Use the gate document for reviewer independence, six-dimension scoring,
per-lesson coverage, revision scope, and required-finding closure.

## Before writing the page

1. Open the official problem. Verify the definition, examples, constraints,
   indexing, modulus, and intended input size. Paraphrase the statement; link it.
2. Write a problem-local `BRIEF.md` with category, stage, target reader, one
   learning loop, expected outputs, and a concept dependency table.
3. Give every step five fields: what the reader already knows; its single
   question; available input and desired output; the action and expected visible
   observation; and conditions under which the conclusion holds.
4. Derive and test the mathematics before designing the animation. Keep the
   simple correct baseline as an independent oracle for small inputs.

## Teaching sequence

Use the shortest sequence that exposes the actual reasoning. The 2916 sequence
is an example, not a mandatory seven-section template for every algorithm.

1. **Understand the quantity.** Use the smallest nontrivial example. Distinguish
   nearby concepts: distinct count is not length; different positions can form
   equal subarrays that must still be counted separately.
2. **Calculate by hand.** Let the reader inspect or predict before revealing.
   Expose all contributions, rather than only one final total.
3. **Establish the baseline.** Show correct Python, state its actual complexity,
   and connect the constraint to the repeated work that makes it too expensive.
   Keep this reason visible, rather than hiding essential motivation inside a
   code disclosure. Distinguish finding an update interval from applying it
   efficiently: a plain loop over that interval can still be quadratic.
4. **Discover a reusable state.** Explain the invariant in ordinary language and
   symbols. Compare old and new states using the same input.
5. **Derive the optimization.** Prove the update boundary before naming a data
   structure. Explain both included and excluded cases and sentinel values.
6. **Choose sufficient summaries.** Derive what an aggregate update requires.
   Explain every stored statistic and why a smaller set is insufficient.
7. **Implement and verify.** Map the derivation to named Python functions. State
   the invariant, complexity, edge cases, and an independent checking method.
   Introduce the outer scan before full machinery. Identify diagram IDs versus
   input indices, current-node bounds versus fixed request bounds, and the
   concrete recursive stop condition. Map one operation to its Python snippet.

Every step begins with a concrete question. Define symbols locally, including
when readers jump directly to that step. Use the same names in prose, controls,
diagrams, readouts and Python. Keep English causally equivalent to Chinese.

## Interaction contract

- Each experiment has one observation task. Specify what to change, what stays
  fixed, where to look, and what would confirm the claim.
- Distinguish worked examples from retrieval checks. Include one fresh
  predict-before-reveal case for the central mechanism. Its derived answer and
  highlights stay hidden until the learner chooses and explicitly verifies.
  Explain an incorrect choice by its extra or missing states; clear stale
  feedback when the choice changes, and preserve state when switching language.
- Make the phenomenon visible. Retain a contribution ledger, show old and new
  values side by side, or retain an operation history. Replacing a frame and
  updating an isolated number is insufficient for accumulated behavior.
- Label before-state metrics and after-state metrics differently. In 2916, the
  old square sum is not yet the contribution of the new right endpoint.
- A control should predict its action: “Apply interval +1” and “Append the next
  value” are clearer than a permanent, ambiguous “Next.” Mark progress and stop
  at the endpoint. Backward navigation must restore all related values.
- State explicitly when changing a preset restarts an experiment. Keep independent
  experiments independent and identify which ones share an input.
- Lazy-tree displays must distinguish stored node summaries from effective leaf
  values. An ancestor tag already affects its summary even when its children are
  stale. During recursion, the root can be stale until the return path merges it.
- Before deferred updates, teach interval decomposition separately from numeric
  summaries: define boxes, root, leaves and halves on a zero-state structure.
  Keep the requested interval next to every operation and show one specific
  wrong result that would follow from omitting a required push. Explain why
  whole blocks stop and only boundary-cut blocks continue, rather than using
  tree height alone as the proof of logarithmic update work.
- Keep controls keyboard-accessible, preserve focus when changing languages,
  announce meaningful updates, and test narrow screens without shrinking labels
  into illegibility. Honor reduced motion. Avoid automatic looping playback.

## Repository pattern

- Collection entry: `/leetcode/`, registered once in root `pages.config.js` under
  category `leetcode`, stage `university`.
- Problem entry: `/leetcode/<id>/`, registered in `leetcode/problems.config.js`
  with bilingual title, description and topics, difficulty, language, path, and
  `leetcodeUrl` pointing to the exact official problem. Show `#<id> · <title>`
  in the collection heading and the lesson H1. Provide separate lesson and
  official-problem links on the collection card, plus an official link beside
  the lesson header; never nest an external link inside a clickable card link.
  Registry titles contain the name only; the collection owns the `#<id>` prefix.
  Verify the rendered collection after registration so that IDs appear exactly
  once, even when authored metadata already contains a matching prefix. Reject
  mismatched numeric prefixes before registration rather than publishing a
  misleading title beside a different official problem link.
- Problem files: `index.html`, `copy.js`, `app.js`, an independently testable
  numerical core when needed, `solution.py`, and `BRIEF.md`.
- The shared `leetcode/style.css` starts from the existing Fourier theme.
  `leetcode/common.js` implements the site's existing language behavior.
- For offline opening, embed the displayed Python source in `python-code.js`.
  Regenerate it from `solution.py`; test exact source equality. TypeScript uses
  `solution.ts` and `typescript-code.js`; other native languages use the verified
  source/mirror pair recorded by the language policy. Do not require
  network requests to display solution code or local experiment data.
- For original JavaScript solutions use `solution.js` and `javascript-code.js`.
  The six JavaScript-category lessons additionally use `concept.py` and its mirror
  `python-code.js` for the separately labeled conceptual comparison. Provide
  distinct copy/download controls and verify each displayed/downloaded pair.
  Set registry language to the canonical language; do not name the comparison
  `solution.py`.
- Add concept deep links and register the new lesson in `CONCEPT-MAP.md`.
- General authoring lessons belong here; problem-specific evidence belongs in
  the problem's brief. Bump asset query versions when changing a served asset.

## Acceptance checks

New lesson reviews use the six-dimension rubric and evidence requirements in
[review and release gates](leetcode-review-gates.md). Freeze the criteria before
the reviewer's cold walkthrough; retain findings, fixes, and reviewer closure.
The [2916 rubric](reviews/leetcode-2916-rubric.md) remains the historical record
for that lesson, not an implicit acceptance of later batches.

First walk the lesson as a new reader without using the brief as a decoder.
For every experiment, explain what the interaction made visible. If that is
unclear, revise it before checking numeric details.

The author first performs the checks below. The independent reviewer then
verifies the relevant evidence and independently chosen cases; running the same
test command in the author's session does not establish review independence.

Verify:

1. Python against the baseline on exhaustive small inputs and seeded random
   inputs. Use relevant closed-form large cases and the maximum constraint.
2. The browser's numerical model against an independent baseline. Check every
   completed round, not just the final sum. For deferred updates, test overlapping
   ranges and effective leaf values, not only cached root summaries.
3. Every control to both endpoints, backward navigation, presets, reveal feedback,
   copy fallback, language changes after interaction, and unavailable storage.
4. A real browser at desktop and narrow widths (including 320 and 390), console
   and network errors, link targets, keyboard access and readable diagrams.
   Wait for the experiment's initial readout to be populated before operating
   it; a static button's presence alone does not establish initialization.
5. The exact downloaded Python source equals the displayed source.
6. Require independent acceptance before publishing new or materially revised
   lessons. After publication, check the real collection, problem page and asset hashes.
   A Git push alone is not deployment evidence. Use the current deployment route
   and preserve unrelated files. The owner's 2026-10-18 campaign instruction
   explicitly waives old-content backups; retain release and verification
   manifests without copying the previous production content.

Report only observed evidence. Passing tests establishes computational behavior;
it does not prove that a real learner understood the lesson or that LeetCode
accepted a submission.

## Findings from 2916

- Partitioning subarrays by right endpoint makes the final summation and the
  incrementally maintained state correspond directly.
- The previous occurrence gives both a sufficient condition and a precise
  boundary: only starts in `[p+1, r]` change. Showing the excluded start `p`
  makes the off-by-one boundary easier to understand.
- Define the new start as a reserved zero before applying the increment. This
  explains why singleton subarrays need no separate branch.
- Derive `Q' = Q + 2kS + k²m` before introducing lazy propagation. Use old `S`
  when updating `Q`; use general `k` because tags accumulate.
- A second overlapping update is necessary to demonstrate why tags must be
  pushed down. A single fully covered update only demonstrates deferral.
- If the implementation keeps tags even on leaves, explain that those tags are
  never pushed further. Do not describe a leaf tag as work owed to children.
- Preserve the distinction between the current endpoint's `F(r)` and the
  cumulative answer. The official `[1,2,1]` example exposes confusing them:
  final root square sum `9`, full answer `15`.

## Extension: first ten Hard problems

For multi-algorithm batches, also apply [the Hard trace specification](leetcode-hard-traces.md).
It adds explicit frame timing, data-versus-highlight semantics, identity tests,
trace omission notices, rolling-memory disclosure, and misconception-driven
prediction requirements derived from the first ten numeric-ID Hard lessons.

## Finding from #51: zoom can break the diagram without page overflow

The first independent #51 review found squeezed queen cells and axis labels at
200% zoom even though document-level overflow checks passed. Review component
geometry as well as the page width: labels must remain readable, board columns
must remain equal, and the state panel must reflow when the usable width shrinks.
Exercise and inspect the populated diagram in both languages at narrow widths
and 200% zoom; retain before/after evidence and have a fresh reviewer close the
finding. See [the original finding](reviews/51-review-1-b84a663e.md) and
[the accepted recheck](reviews/51-review-2-edd9687d.md).

Inspect essential adjacent state labels and values as well as diagrams: dense
intermediate states and long identifiers must remain separately readable and
clearly associated in both locales at the established 320/390 px widths.
Document-level overflow checks alone cannot prove state readability. Deliberate
component-level scrolling is allowed when label/value association remains
available and scrolling is keyboard-accessible. Inspect relevant populated
states; this does not require a new test framework or exhaustive per-frame or
per-pixel geometry checks. The original independent Sudoku review reported
`candidates_at_entry` colliding with `["9"]` at official preset event 12 despite
no page overflow (37-R04, `specs/reviews/37-review-1-807e6ed8.md` at immutable
commit `90defbad97ab0adfd070fcc0ec4de1608e87be43`). This clarification does not
reproduce or fix that lesson; apply the evidence and closure rules in the gates.

## Concrete, gradual explanation contract

Start from one small input the learner can work by hand. Keep the same example
through the baseline, state representation and improved solution so every symbol
has an observable referent. Show intermediate states and why each transition is
legal; do not jump from an analogy to a recurrence without deriving the connection.
Use a second example that changes one meaningful condition and a counterexample
that exposes the most tempting wrong rule. Explain rejected alternatives as well
as the chosen path. Let the learner predict a new case before revealing its answer.

Every defined variable must connect to an input item, a visible state or a named
code value. Explain boundary cases in ordinary language before presenting terse
conditions. A vivid scenario is useful only when its rules match the problem;
keep the original formal contract and distinguish teaching adaptations. Review
missing causal bridges as required findings regardless of algorithm correctness.

## Non-mutating metadata preflight

`lesson-entry.json` complexity is exactly one nonempty string covering time and
space, for example `"O(mn) arithmetic operations; O(n) integer cells"`; an object
such as `{time,space}` is invalid. Existing accepted nonempty cost strings remain
compatible; preflight checks the shape, while review checks the cost claim.

Before author/fix readiness and independent acceptance, run from the checkout root:
`python3 -B scripts/register_leetcode_lesson.py <id> --validate-only`.
This reads metadata, catalog, concept anchors and language/source contracts without
registering, generating files, or changing registry, CONCEPT-MAP, index, metadata,
or any tracked/untracked file. Registration and new-lesson campaign readiness use
the same validation interface. Failure prevents readiness/acceptance; reviewers
record a finding rather than repairing the frozen candidate. Any metadata fix
requires a new candidate and independent review, never a post-review mutation or
a rewrite of prior acceptance, campaign state, or reports. The existing positional
registration CLI remains available only to the authorized registration workflow.
