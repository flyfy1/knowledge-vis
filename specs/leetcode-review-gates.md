# LeetCode review and release gates

Effective: 2026-10-18. Applies to new lessons and revisions of existing lessons.
Implements the independent-review requirement in [WORKFLOW](../WORKFLOW.md);
it does not replace that workflow or the [site UI policy](../UI-I18N-SPEC.md).
The authoring contract is [LeetCode explainers](leetcode-explainers.md), with
algorithm-specific checks in [Hard traces](leetcode-hard-traces.md).

## Evidence levels are not interchangeable

| Evidence | What it establishes | What it does not establish |
| --- | --- | --- |
| Author self-check | The author has checked the stated cases and interactions | Independent judgment or release acceptance |
| Algorithm tests and independent oracles | Computational behavior under the tested conditions | An independent teaching review; an oracle is not a reviewer |
| Independent lesson review | A separate reviewer reconstructed the explanation and checked the candidate | Measured comprehension by actual novice learners |
| Public delivery verification | The accepted files and interactions are served at the intended URLs | Retrospective approval of an unreviewed lesson |
| Novice teach-back | The observed learner can explain and transfer the mechanism | A general learning-effectiveness claim without further evidence |

Two self-check rounds remain self-checks. Passing many assertions, deploying a
page, switching model names in the same run, or relabeling a report does not
satisfy independent review. Do not substitute test counts for observed outcomes.

## Independent reviewer and cold walkthrough

- Use a different run from the implementation run, with fresh context. The
  reviewer must not have authored the candidate or its teaching explanation.
  A different model family is desirable when available, not the independence
  criterion itself. Follow WORKFLOW for dispatch and role assignments.
- Before the cold walkthrough, give only the target reader, candidate URL,
  reviewed revision, problem IDs, and frozen rubric. Do not supply the BRIEF,
  implementation source, author rationale, previous findings, or claimed scores.
  Record the walkthrough before revealing these materials for the source audit.
- The first review may use an isolated local/staging preview; production is not
  required. The preview must serve the identified candidate, without concurrent
  edits. Record the commit and any asset hashes needed to identify that build.
- For every step, record the question answered, the operation performed, the
  visible observation, and a paraphrase of why it supports the conclusion. An
  essential explanation that only becomes intelligible after reading the BRIEF
  is a required fix, even when all calculations are correct.
- Independently work a fresh small example and a relevant counterexample. Record
  the prediction before reveal, explain the invariant and excluded case, and
  map one visible transition to Python. Choose at least one input independently
  of the author's presets; if the UI only accepts presets, audit that input
  against the core/Python and label it as a code check, not a UI experiment.

## Six review dimensions

Freeze the problem-specific interpretation before the reviewer opens the page.
Score each dimension from 0 to 4: absent/incorrect, substantial gaps, partly
reconstructable, reconstructable with minor friction, independently clear.
Weighted score = sum(weight × score / 4). Scores require observations, not an
author's forecast of learner success.

| Dimension | Weight | Required evidence |
| --- | --- | --- |
| Problem, terms, and hand calculation | 15 | Identify the available input, requested output, units/indices, and one manually computed result |
| Causal derivation and saved work | 20 | Explain the baseline cost, what work is avoided, and why both included and excluded cases follow |
| Maintained state and correctness | 20 | State the invariant, inspect dependencies or links, and justify transition, boundaries, and termination |
| Interaction and visual meaning | 20 | Predict then operate; describe observable change and retained history; distinguish data from highlighting |
| Transfer to Python and cost | 15 | Map a transition to executable Python, check a fresh case, and justify actual time/space and mutation behavior |
| Bilingual and device access | 10 | Equivalent reasoning in both languages; readable controls/diagrams, keyboard use, and preserved state on supported widths |

Acceptance requires at least 85/100, every dimension at least 3/4, and zero open
required fixes. A mathematical error, missing causal bridge, contradictory
visual, broken core interaction, inaccessible essential content, or materially
different translations is a required fix regardless of total score.

This six-dimension rubric applies prospectively. The historical seven-outcome
[2916 rubric](reviews/leetcode-2916-rubric.md) and its scores remain unchanged;
do not retroactively rescore it or compare the totals as identical instruments.

### Canonical-language interpretation updated 2026-10-18

Prefer a faithful official Python interface, then supported TypeScript, then the
required native language. Independently verify each non-Python language contract
and its evidence after the cold walkthrough. The fifth dimension becomes transfer
to that canonical executable code and its actual cost; the weights and thresholds
are unchanged. Use an independent fresh case in the original runtime, not merely
a browser trace that imitates it. Verify displayed/copied/downloaded source parity.
For TypeScript, compile and run the emitted JavaScript; for SQL, execute query
fixtures and check duplicate, null and ordering behavior where applicable.

For the exact six JavaScript-category problems (#2630, #2650, #2675, #2691, #2756,
#2759), the owner explicitly requires original JavaScript even when TypeScript is
supported. Verify `solution.js` / `javascript-code.js`, and separately check the
explicitly labeled Python conceptual comparison (`concept.py` / `python-code.js`)
and its limits. This exact-six exception overrides the general language preference. Runtime correctness such as identity and
async ordering is a required criterion, not an optional note. Freeze the applicable
interpretation before the cold walkthrough; never rescore historical reports.

Detailed teaching is required: reconstruct one worked example step by step,
explain the baseline's repeated work and every optimization bridge, and test a
fresh case and a tempting wrong rule. A correct result with an unexplained state
transition remains a required fix. No batch average substitutes for per-lesson
independent acceptance.

## Per-lesson status and batch coverage

Record evidence separately for every problem. A shared runtime does not make
one lesson's explanation representative of ten different algorithms.

| Stage | Entry/exit evidence | May be called accepted? |
| --- | --- | --- |
| Draft | BRIEF and candidate in progress | No |
| Self-checked | Author's numerical, visual, and interaction checks recorded | No; ready for independent review |
| Review pending / changes required | Review absent or required fixes still open | No |
| Independently accepted | Review of the identified candidate passes the frozen rubric; required fixes closed | Yes, for that revision and scope |
| Published and verified | Accepted candidate deployed; public bytes and interaction checks recorded | Yes, with deployment evidence linked |

Also record deployed revision separately. A page can already be live while its
review status is pending. Do not infer acceptance from availability, remove a
live lesson, or roll it back merely to make the status table look sequential.

For a batch, include one row per problem with candidate revision, author run,
reviewer identity/run, rubric, outcome, open finding IDs, and report link. Shared
control checks may be reused only when the exact shared assets and relevant
state paths match. Every problem still needs its own cold walkthrough, fresh
example, algorithm-specific boundary checks, and visual-to-code mapping.
A batch average cannot hide a failing lesson. Unreviewed lessons stay pending;
a reviewed subset may be released only as an explicitly identified subset.

## Findings, revisions, and closure

Each required finding has a stable ID and records:

- Problem, section, candidate revision, locale, viewport, preset/input, and the
  exact action sequence needed to observe it.
- Expected behavior or learning inference; actual observation; supporting
  screenshot, calculation, or trace; the violated requirement.
- Severity and reason, owner/next action, fix revision, regression evidence,
  reviewer recheck, and final status (`open`, `fixed awaiting review`, `closed`).

For an alleged state label/value collision, record the concrete candidate,
preset/input, event and actions, locale, and width; retain a relevant screenshot
and rendered text/label/value geometry demonstrating actual text intersection
or clipping. Overlapping container boxes alone are insufficient evidence.
Distinguish viewport, scroll-position, and capture artifacts from reproducible
visible collisions; recheck the settled view and ordinary operation as needed.
Inspect dense intermediate states and long identifiers in both locales at
320/390 px, including shared untranslated variable labels. Page-wide overflow
checks alone do not establish essential state readability; component scrolling
is acceptable under the explainer's association and keyboard-access rules.

For localization binding, verify appropriate duplicate-key detection within each
lookup namespace and representative semantic-binding evidence for applicable
algorithm-state and UI paths in both locales, as required by the
[explainer contract](leetcode-explainers.md#localization-key-and-meaning-binding).
Check the visible explanation against the intended state/transition, separately
from unrelated UI fallback/error copy (for example mismatch versus clipboard
fallback). Matching keys or their presence alone is insufficient. Record candidate,
state/input, actions, locale, expected meaning and observed text; independently
check representative relevant paths after the cold walkthrough. A materially wrong
algorithm explanation remains a required finding under the existing rubric.
Freeze the candidate; any fix needs a new candidate and separate fresh review of
the affected paths. Retain original evidence and required-finding closure records;
this clarification grants no retroactive acceptance or new scores/weights.

The author can mark a finding fixed awaiting review; the reviewer closes it
against the actual fixed candidate. Attach original evidence and append the
closure; do not rewrite the original failure into a passing result. Disagreement
keeps the finding open for adjudication under WORKFLOW.

For these readability findings too, freeze the reviewed candidate; a fix needs
a new candidate and a separate fresh review of that actual candidate. Neither
passing test counts nor a score can erase an open required defect.

Review scope follows the change:

- Algorithm, invariant, teaching sequence, or central visual changes require a
  fresh walkthrough of affected steps and their prerequisites, plus relevant
  numerical and interaction checks.
- Shared trace/control changes require affected consumers and state paths to be
  identified and checked. A full rereview of unchanged lessons is unnecessary,
  but assuming one consumer covers every state type is insufficient.
- A title, official URL, typo, or narrow style correction needs a focused review
  of that change and relevant locale/layout/navigation behavior. It neither
  erases a prior lesson acceptance nor closes an existing teaching-review gap.
- Documentation-only clarification needs consistency and link checks. It does
  not itself establish that a lesson audit, implementation change, or deployment
  has occurred. Follow the user's requested scope for subsequent work.

For follow-up revisions, record the accepted base, exact diff, affected coverage,
and focused reviewer conclusion. A later hash need not invalidate all prior
work, but any unreviewed relevant diff prevents acceptance of the new candidate.
The loop ends when required fixes are closed, not when two rounds are used up.

## Release record and incomplete evidence

Before publishing a new or materially revised lesson, require its independent
acceptance and the explainer's computational/browser checks. After authorized
publication, verify collection/lesson routes, changed asset hashes, and relevant
served interactions and preserve unrelated production content. For the current
Hard campaign, the owner explicitly waived old-content backups on 2026-10-18;
retain review/release receipts without saving a previous served copy.

Report reviewer/run, candidate revision, review outcome, and deployed revision
separately. Attribute only work actually performed. If an exact model identifier
or named verifier is unavailable, mark it unavailable/pending; do not invent a
model, copy another person's approval, or claim `Verified-By` for an absent
reviewer. A self-check must identify itself as a self-check.

If no independent reviewer or required evidence is available, finish the
candidate and author checks, then leave review/release acceptance pending with
the missing evidence and next action. Do not silently waive the gate. Any
explicitly authorized exception must be recorded as an exception, not an
independent pass. No exception is authorized by this specification.

## Existing first-ten batch

As of 2026-10-18, problems 4, 10, 23, 25, 30, 32, 37, 41, 42, and 44 have author
self-review, algorithm tests, and browser/public-delivery evidence. Their
[existing report](reviews/leetcode-first-ten-review.md) does not contain an
independent teaching review. Their independent-review status is **pending**.
This specification update does not perform that review, change deployed pages,
or grant retrospective acceptance. Next action: review a frozen current
candidate independently and record per-lesson findings and closure.

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
