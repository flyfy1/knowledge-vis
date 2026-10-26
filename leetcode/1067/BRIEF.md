# #1067 · Digit Count in Range

## Status and scope

Author run: **blocked at official-contract verification**, 2026-10-26.
Independent lesson review: **not performed**. No acceptance, submission result,
learner outcome, or publication is claimed. This problem remains in scope.
Only `leetcode/1067/` is owned by this run.

Official source: https://leetcode.com/problems/digit-count-in-range/
Catalog metadata supplied by the owner: Hard, paidOnly, algorithms.
Category: leetcode (computing/algorithms); stage: university.
Intended reader: a programmer learning to derive and verify an algorithm.
Product-fit verdict: reuse the approved bilingual lesson pattern after contract
verification, with existing common.js, style.css, and exact shared tokens.
Design authority: specs/reviews/leetcode-all-hard-design-review.md and its
dispatcher adjudication; no new layout or design approval is asserted.

## Blocking evidence

The official page opened through the web tool displayed:
“Subscribe to unlock.” and “To view this question you must subscribe to premium.”
The ordinary direct HTTPS page capture returned HTTP 403. The ordinary public
GraphQL request succeeded with HTTP 200 and returned `isPaidOnly: true`,
`content: null`, and `codeSnippets: null`.

GraphQL exposes a callable name `digitsCount`, integer parameters `d`, `low`,
`high`, and integer return metadata, plus sample input text. It does not expose
the official statement, constraints, sample outputs, exceptions, or language
selector/templates. The metadata alone does not establish a supported Python
submission interface or the semantics of any boundary case.

Evidence: `tests/evidence/access-summary.json`, `graphql-request.json`,
`official-graphql.json`, and `official-page.html` in the same directory.
The access summary contains the actual timezone-qualified capture timestamp.
No authenticated access or credentials were inspected; no paywall bypass,
third-party reconstruction, or inferred statement was used.

## Next required input

Provide normally authorized access to the official premium statement, or an
owner-supplied authorized capture of its complete statement, examples with
outputs, constraints and exceptions, plus the actual language selector and
submission template(s). Prefer Python if the observed interface supports it;
otherwise verify TypeScript, then the required native language. Record the
observed interfaces before selecting a language. A non-Python selection will
need a complete language-contract.json with evidence.

## Implementation plan withheld pending contract

The learning loop, concrete hand example, baseline, invariant, reversible trace,
fresh transfer exercise, code mapping, boundary tests, and per-step five-field
brief cannot be faithfully specified until the contract is accessible. No
problem semantics, complexity, code, metadata entry, or placeholder lesson UI
has been invented. The terminology dependency table and simulation limitations
will be derived from the verified contract before implementation.

P0 / highest-return slice: verify the official contract, then write the complete
problem-local teaching brief and implement the approved bilingual pattern.
P1: source parity, independent oracle and intermediate-state checks, real-browser
interaction, locale, responsive, accessibility, and contrast checks.
P2: optional decoration only after all required evidence passes.
Deferred: all implementation and runtime checks because their contract is
unavailable; independent review belongs to a separate run after a frozen
complete candidate exists. This access blocker does not reopen approved design.

## Author checks

- Reproducible ordinary-access probe:
  `python3 -B leetcode/1067/tests/check_official_access.py`.
  Captured official page HTTP 403 and GraphQL HTTP 200 with null content/templates.
  Reviewers may use `OUTPUT_DIR=/tmp/1067-access` to avoid changing evidence.
- Required non-mutating preflight, run from repository root:
  `python3 -B scripts/register_leetcode_lesson.py 1067 --validate-only`.
  Exit 2: `Metadata validation failed: [Errno 2] No such file or directory:
  '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/1067/lesson-entry.json'`.
  Expected incomplete-candidate failure; no registration or shared-state mutation.
- Canonical execution, oracle, browser, screenshot, contrast, locale and source
  parity checks: not run; no lesson candidate exists to test.
