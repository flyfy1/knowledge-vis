# #615 · Average Salary: Departments VS Company

Status: BLOCKED at official-contract verification, author run only, 2026-10-25.
Problem remains in scope. No lesson implementation or independent acceptance.

## Product boundary and approved design

Category: computing; stage: university. Target reader: a bilingual learner
learning to reconstruct and implement the verified database/DataFrame operation.
Immediate job: work a tiny example, understand why the maintained summaries are
sufficient, transfer the reasoning to the official callable/query interface.
Reuse the approved lesson pattern under
`../../specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher
adjudication. Do not create a new layout or shared abstraction. Exact shared
tokens and controls will be taken from `../style.css` and `../common.js` after
verification. No UI has been implemented, so no new tokens are introduced.

## Official evidence and blocking condition

Official source:
https://leetcode.com/problems/average-salary-departments-vs-company/

- Public official page displays a Premium subscription gate; see
  `tests/evidence/official-page.txt`.
- Public GraphQL returns HTTP 200, matching ID/title/slug, `isPaidOnly: true`,
  `content: null`, and `codeSnippets: null`; see the timestamped exact structured
  capture `tests/evidence/official-graphql.json` (includes query and variables).
- Sample inputs, SQL schema metadata, and `pythondata` metadata are visible.
  They do not establish the full statement, constraints, expected-output rules,
  exceptions, or actual callable signature. Pandas metadata must not be treated
  as proof that Python is unavailable, nor as a verified Python interface.
- Canonical language remains undecided. No language-contract.json or source
  is fabricated. Python remains first preference if authorized evidence verifies
  a faithful supported submission interface.

Next needed input: an authorized official statement capture including schemas,
constraints, examples with expected outputs, exceptional/ordering rules, and
actual language selector plus callable/template interfaces (including Pandas
if offered). Alternatively provide normal authorized access through the host;
this task must not inspect credentials or bypass the subscription gate.

## Teaching plan withheld pending verification

The single learning loop will connect hand calculation, an independent baseline,
a reversible experiment, a derived invariant, fresh prediction/reveal, and
canonical-source mapping. Section count, each section's five required fields
(known facts, single question, input/output, action/observation, conditions),
and the local term-dependency table cannot be truthfully finalized from a title
and sample inputs. They remain explicitly pending verified semantics. No sample
answer, comparison behavior, null policy, or cost claim is inferred here.

## Priorities and verification boundary

P0/highest-return slice: establish the official contract before designing the
problem-specific explanation; currently blocked. P1: complete bilingual causal
lesson, executable canonical solution, and oracle/browser checks once unblocked.
P2: optional visual refinement after essential checks. Deferred: all runtime
assets and metadata until their claims can be supported. No placeholder route,
registry entry, public release, or campaign status change is created.

Author checks: public-source capture only. Browser lesson checks, solution
execution, source parity, contrast, and independent review have not occurred.
The mandatory metadata preflight was executed and failed as recorded in
`tests/evidence/self-check.md`; this is not a ready candidate.
